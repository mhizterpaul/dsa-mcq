import { PrismaClient } from '@prisma/client';

// Global state for SSE and waiting list (limited by process lifecycle in FaaS)
let sseConnections = new Map<string, any[]>();
let waitingList = new Map<string, any>(); // userId -> res

export class QuizService {
  static resetState() {
    sseConnections = new Map<string, any[]>();
    waitingList = new Map<string, any>();
  }
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async getQuestions(categoryId: string, difficulty: string) {
    return this.prisma.question.findMany({
      where: {
        categoryId,
        difficulty: difficulty.toUpperCase() as any,
      },
    });
  }

  async getUserActiveSession(userId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return this.prisma.quizSession.findFirst({
        where: {
            date: today,
            endTime: null,
            participants: { some: { userId } }
        },
        include: {
            participants: {
                include: {
                    user: true
                }
            }
        }
    });
  }

  async getOrCreateDailyQuizSession(user?: any) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // First check if user is already in a session today
    if (user) {
        const existing = await this.getUserActiveSession(user.id);
        if (existing) return existing;
    }

    const sessions = await this.prisma.quizSession.findMany({
      where: {
        date: today,
        endTime: null,
      },
      include: {
        participants: {
          include: {
            user: {
              include: {
                leaderboard: true,
                engagement: true,
              },
            },
          },
        },
      },
    });

    if (user) {
      const userLeaderboard = await this.prisma.leaderboard.findUnique({
        where: { userId: user.id },
      });

      for (const session of sessions) {
        if (session.participants.length >= 5) continue;
        if (session.participants.length === 0) return session;

        const firstParticipant = session.participants[0].user;
        if (this.isSimilar(userLeaderboard, firstParticipant.leaderboard)) {
          return session;
        }
      }
    } else {
      const availableSession = sessions.find((s) => s.participants.length < 5);
      if (availableSession) return availableSession;
    }

    if (sessions.length >= 10) {
       return null;
    }

    // Use transaction to ensure session creation doesn't double up unexpectedly
    // though here we're more concerned with participant capacity.
    const newSession = await this.prisma.quizSession.create({
      data: {
        date: today,
        startTime: new Date(),
      },
      include: {
        participants: true
      }
    });

    this.notifyWaitingUsers();

    return newSession;
  }

  private isSimilar(l1: any, l2: any) {
    if (!l1 || !l2) {
        return true;
    }
    const rankDiff = Math.abs(l1.rank - l2.rank);
    const xpDiff = Math.abs(l1.xp - l2.xp);
    const sameBadge = l1.userHighestBadge === l2.userHighestBadge;

    const similar = rankDiff <= 20 || xpDiff <= 2000 || sameBadge;
    return similar;
  }

  async findOrCreateParticipant(session: any, user: any) {
    return await this.prisma.$transaction(async (tx) => {
        // Force a write lock in SQLite by doing a dummy update
        if (process.env.USE_REAL_DB) {
            await tx.$executeRaw`UPDATE QuizSession SET updatedAt = CURRENT_TIMESTAMP WHERE id = ${session.id}`;
        }

        const existing = await tx.quizParticipant.findUnique({
            where: {
                userId_sessionId: {
                    userId: user.id,
                    sessionId: session.id,
                },
            },
        });

        if (existing) return existing;

        const participantCount = await tx.quizParticipant.count({
            where: { sessionId: session.id }
        });

        if (participantCount >= 5) {
            throw new Error('Session is full');
        }

        // Artificial delay to test concurrency if in test environment
        if (process.env.NODE_ENV === 'test' && process.env.SIMULATE_CONCURRENCY) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }

        const participant = await tx.quizParticipant.create({
            data: {
                userId: user.id,
                sessionId: session.id,
            },
        });

        // Broadcasting should happen after transaction success, but we can't easily do that inside $transaction's return
        // without a separate step. In a real system we might use an outbox or post-commit hook.
        // For now, we'll return it and the caller or a subsequent step can handle broadcast.
        return participant;
    }).then(async (participant) => {
        this.broadcastToSession(session.id, {
            type: 'participant_update',
            payload: await this.getSessionParticipants(session.id),
        });
        return participant;
    });
  }

  async getSessionParticipants(sessionId: string) {
    const participants = await this.prisma.quizParticipant.findMany({
      where: { sessionId },
      include: {
        user: true,
      },
    });
    return participants.map((p) => ({
      userId: p.user.id,
      name: p.user.name,
      avatarUrl: p.user.image,
    }));
  }

  async handleAnswer(userId: string, questionId: number, answer: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return await this.prisma.$transaction(async (tx) => {
        const session = await tx.quizSession.findFirst({
            where: { date: today, endTime: null, participants: { some: { userId } } }
        });

        if (!session) throw new Error('No active daily quiz session found for user');

        // Timer integrity check
        const now = new Date();
        const startTime = new Date(session.startTime);
        const elapsedSeconds = (now.getTime() - startTime.getTime()) / 1000;
        if (elapsedSeconds > 300) { // 5 minutes limit
            throw new Error('Quiz session has expired.');
        }

        const participant = await tx.quizParticipant.findUnique({
            where: { userId_sessionId: { userId, sessionId: session.id } },
        });

        if (!participant) throw new Error('Participant not found');

        const existingAnswer = await tx.userQuestionData.findUnique({
            where: { userId_questionId: { userId, questionId } }
        });

        if (existingAnswer && existingAnswer.lastAttempt && existingAnswer.lastAttempt >= session.startTime) {
            throw new Error('Question already answered in this session');
        }

        const question = await tx.question.findUnique({ where: { id: questionId } });
        if (!question) throw new Error('Question not found');

        const isCorrect = question.correct === answer;

        await tx.quizParticipant.update({
            where: { id: participant.id },
            data: {
                score: isCorrect ? participant.score + 10 : participant.score,
                streak: isCorrect ? participant.streak + 1 : 0,
            },
        });

        await tx.userQuestionData.upsert({
            where: { userId_questionId: { userId, questionId } },
            update: {
                attempts: { increment: 1 },
                correct: isCorrect,
                lastAttempt: new Date(),
            },
            create: {
                userId,
                questionId,
                attempts: 1,
                correct: isCorrect,
                lastAttempt: new Date(),
            },
        });

        if (isCorrect) {
            await tx.engagement.upsert({
                where: { userId },
                update: { xp: { increment: 10 } },
                create: { userId, xp: 10 }
            });
        }

        return { success: true, isCorrect };
    });
  }

  async removeParticipant(sessionId: string, userId: string) {
    const session = await this.prisma.quizSession.findUnique({ where: { id: sessionId } });
    if (session && !session.endTime) {
       throw new Error('You cannot exit the quiz until the session is over.');
    }

    await this.prisma.quizParticipant.delete({
      where: { userId_sessionId: { userId, sessionId } },
    });

    this.broadcastToSession(sessionId, {
      type: 'participant_update',
      payload: await this.getSessionParticipants(sessionId),
    });
  }

  addSseConnection(sessionId: string, userId: string, res: any) {
    if (!sseConnections.has(sessionId)) {
      sseConnections.set(sessionId, []);
    }
    sseConnections.get(sessionId).push({ userId, res });
  }

  removeSseConnection(sessionId: string, userId: string) {
    for (const [sid, conns] of sseConnections.entries()) {
        sseConnections.set(sid, conns.filter(c => c.userId !== userId));
    }
    waitingList.delete(userId);
  }

  addToWaitingList(userId: string, res: any) {
    waitingList.set(userId, res);
  }

  private notifyWaitingUsers() {
    waitingList.forEach((res, userId) => {
      try {
        res.write(`data: ${JSON.stringify({ type: 'session_available' })}\n\n`);
      } catch (e) {}
    });
    waitingList.clear();
  }

  private broadcastToSession(sessionId: string, data: any) {
    const connections = sseConnections.get(sessionId);
    if (connections) {
      connections.forEach((c) => {
        try {
          c.res.write(`data: ${JSON.stringify(data)}\n\n`);
        } catch (e) {}
      });
    }
  }

  async getResults(sessionId: string) {
      const session = await this.prisma.quizSession.findUnique({
          where: { id: sessionId },
          include: { participants: { include: { user: true }, orderBy: { score: 'desc' } } }
      });

      if (!session) throw new Error('Session not found');
      if (!session.endTime) throw new Error('Results only available after session end');

      return session.participants.map((p, index) => ({
          userId: p.userId,
          name: p.user.name,
          score: p.score,
          rank: index + 1,
          xpEarned: p.score * 5
      }));
  }

  async endSession(sessionId: string) {
      return this.prisma.quizSession.update({
          where: { id: sessionId },
          data: { endTime: new Date() }
      });
  }
}
