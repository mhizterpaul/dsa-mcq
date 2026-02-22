import { PrismaClient } from '@prisma/client';

// Global state for SSE and waiting list (limited by process lifecycle in FaaS)
const sseConnections = new Map<string, any[]>();
const waitingList = new Map<string, any>(); // userId -> res

export class QuizService {
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

  async getOrCreateDailyQuizSession(user?: any) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

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

    // Simulate "unavailable groups" if we reached some limit for matching
    // For the sake of the requirement, if we have too many sessions we might want to fail
    // but here let's just create one unless there's an explicit reason not to.
    // To satisfy the "notified when session available" requirement, let's say
    // we only allow a certain number of concurrent sessions.
    if (sessions.length >= 10) {
       return null;
    }

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
    if (!l1 || !l2) return true;
    const rankDiff = Math.abs(l1.rank - l2.rank);
    const xpDiff = Math.abs(l1.xp - l2.xp);
    const sameBadge = l1.userHighestBadge === l2.userHighestBadge;

    // Match if rank is within 20, XP within 2000, or they have the same highest badge
    return rankDiff <= 20 || xpDiff <= 2000 || sameBadge;
  }

  async findOrCreateParticipant(session: any, user: any) {
    const existing = await this.prisma.quizParticipant.findUnique({
      where: {
        userId_sessionId: {
          userId: user.id,
          sessionId: session.id,
        },
      },
    });

    if (existing) return existing;

    const participantCount = await this.prisma.quizParticipant.count({
        where: { sessionId: session.id }
    });

    if (participantCount >= 5) {
      throw new Error('Session is full');
    }

    const participant = await this.prisma.quizParticipant.create({
      data: {
        userId: user.id,
        sessionId: session.id,
      },
    });

    this.broadcastToSession(session.id, {
      type: 'participant_update',
      payload: await this.getSessionParticipants(session.id),
    });

    return participant;
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
    const session = await this.prisma.quizSession.findFirst({
        where: { date: today, endTime: null, participants: { some: { userId } } }
    });

    if (!session) throw new Error('No active daily quiz session found for user');

    // Timer integrity check
    const now = new Date();
    const startTime = new Date(session.startTime);
    const elapsedSeconds = (now.getTime() - startTime.getTime()) / 1000;
    if (elapsedSeconds > 300) { // 5 minutes limit for the daily quiz
        throw new Error('Quiz session has expired.');
    }

    const participant = await this.prisma.quizParticipant.findUnique({
      where: { userId_sessionId: { userId, sessionId: session.id } },
    });

    if (!participant) throw new Error('Participant not found');

    const question = await this.prisma.question.findUnique({ where: { id: questionId } });
    if (!question) throw new Error('Question not found');

    const isCorrect = question.correct === answer;

    await this.prisma.quizParticipant.update({
      where: { id: participant.id },
      data: {
        score: isCorrect ? participant.score + 10 : participant.score,
        streak: isCorrect ? participant.streak + 1 : 0,
      },
    });

    // Update user achievements/stats
    await this.prisma.userQuestionData.upsert({
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
        await this.prisma.engagement.upsert({
            where: { userId },
            update: { xp: { increment: 10 } },
            create: { userId, xp: 10 }
        });
    }

    return { success: true, isCorrect };
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
    const connections = sseConnections.get(sessionId);
    if (connections) {
      sseConnections.set(sessionId, connections.filter((c) => c.userId !== userId));
    }
    waitingList.delete(userId);
  }

  addToWaitingList(userId: string, res: any) {
    waitingList.set(userId, res);
  }

  private notifyWaitingUsers() {
    waitingList.forEach((res, userId) => {
      res.write(`data: ${JSON.stringify({ type: 'session_available' })}\n\n`);
    });
    waitingList.clear();
  }

  private broadcastToSession(sessionId: string, data: any) {
    const connections = sseConnections.get(sessionId);
    if (connections) {
      connections.forEach((c) => {
        try {
          c.res.write(`data: ${JSON.stringify(data)}\n\n`);
        } catch (e) {
          // Connection might be closed
        }
      });
    }
  }

  async getResults(sessionId: string) {
      const participants = await this.prisma.quizParticipant.findMany({
          where: { sessionId },
          include: { user: true },
          orderBy: { score: 'desc' }
      });
      return participants;
  }
}
