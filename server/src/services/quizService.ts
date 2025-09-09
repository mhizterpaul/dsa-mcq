import { PrismaClient, User } from '@prisma/client';
import { CacheService } from './cacheService';
import { NextApiResponse } from 'next';

// This is a simplified in-memory session store for the daily quiz.
// In a real-world scenario, this would be backed by a more persistent and scalable store like Redis.
interface QuizParticipant {
  id: string;
  name: string;
  score: number;
  streak: number;
}

interface QuizSession {
  id: string;
  participants: Map<string, QuizParticipant>;
  startTime: Date;
  sseConnections: Map<string, NextApiResponse>; // For Server-Sent Events
}

export interface ISessionStore {
    get(key: string): QuizSession | undefined;
    set(key: string, value: QuizSession): void;
    delete(key: string): void;
    values(): IterableIterator<QuizSession>;
}

export class MockSessionStore implements ISessionStore {
    private store = new Map<string, QuizSession>();
    get(key: string) { return this.store.get(key); }
    set(key: string, value: QuizSession) { this.store.set(key, value); }
    delete(key: string) { this.store.delete(key); }
    values() { return this.store.values(); }
}

export class QuizService {
  private prisma: PrismaClient;
  private cache: CacheService;
  private sessionStore: ISessionStore;
  private dailyQuizSessionId: string | null = null;

  constructor(prisma: PrismaClient, cache: CacheService, sessionStore?: ISessionStore) {
    this.prisma = prisma;
    this.cache = cache;
    this.sessionStore = sessionStore ?? new Map<string, QuizSession>();
  }

  getOrCreateDailyQuizSession(): QuizSession {
    if (this.dailyQuizSessionId && this.sessionStore.get(this.dailyQuizSessionId)) {
        return this.sessionStore.get(this.dailyQuizSessionId)!;
    }

    const newSession: QuizSession = {
        id: `daily-quiz-${new Date().toISOString().split('T')[0]}`,
        participants: new Map(),
        startTime: new Date(),
        sseConnections: new Map(),
    };
    this.sessionStore.set(newSession.id, newSession);
    this.dailyQuizSessionId = newSession.id;
    return newSession;
  }

  async findOrCreateSessionForUser(user: User): Promise<QuizSession> {
    const session = this.getOrCreateDailyQuizSession();
    if (!session.participants.has(user.id)) {
        session.participants.set(user.id, {
            id: user.id,
            name: user.name ?? 'Anonymous',
            score: 0,
            streak: 0,
        });
        this.broadcast(session.id, { type: 'participant-joined', participant: session.participants.get(user.id) });
    }
    return session;
  }

  async handleAnswer(sessionId: string, userId: string, questionId: string, answer: string) {
    const session = this.sessionStore.get(sessionId);
    if (!session) throw new Error('Session not found');

    const participant = session.participants.get(userId);
    if (!participant) throw new Error('Participant not found');

    const question = await this.prisma.question.findUnique({ where: { id: questionId } });
    if (!question) throw new Error('Question not found');

    const isCorrect = question.correctAnswer === answer;

    if (isCorrect) {
        participant.score += 10;
        participant.streak += 1;
    } else {
        participant.streak = 0;
    }

    const result = { isCorrect, score: participant.score, streak: participant.streak };
    this.broadcast(sessionId, { type: 'answer-result', userId, result });
    return result;
  }

  addSseConnection(sessionId: string, userId: string, res: NextApiResponse) {
    const session = this.sessionStore.get(sessionId);
    if (session) {
        session.sseConnections.set(userId, res);
    }
  }

  removeSseConnection(sessionId: string, userId: string) {
    const session = this.sessionStore.get(sessionId);
    if (session) {
        session.sseConnections.delete(userId);
    }
  }

  removeParticipant(sessionId: string, userId: string) {
      const session = this.sessionStore.get(sessionId);
      if (session && session.participants.has(userId)) {
          session.participants.delete(userId);
          this.broadcast(sessionId, { type: 'participant-left', userId });
      }
  }

  broadcast(sessionId: string, data: any) {
    const session = this.sessionStore.get(sessionId);
    if (session) {
        for (const res of session.sseConnections.values()) {
            res.write(`data: ${JSON.stringify(data)}\n\n`);
        }
    }
  }
}
