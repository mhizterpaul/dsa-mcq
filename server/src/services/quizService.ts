import { NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';

interface User {
    id: string;
    name: string;
    email: string;
}

interface Participant extends User {
    score: number;
    streak: number;
}

interface Question {
    id: string;
    text: string;
    correctAnswer: string;
}

interface QuizSession {
    id: string;
    participants: Map<string, Participant>;
    questions: Question[];
    startTime: Date;
    sseConnections: Map<string, NextApiResponse>;
}

class QuizService {
    private sessions: Map<string, QuizSession>;

    constructor() {
        this.sessions = new Map();
    }

    reset() {
        this.sessions.clear();
    }

    getOrCreateDailyQuizSession(): QuizSession {
        const today = new Date().toISOString().split('T')[0];
        if (!this.sessions.has(today)) {
            this.sessions.set(today, {
                id: today,
                participants: new Map(),
                questions: [], // Questions will be added in the test
                startTime: new Date(),
                sseConnections: new Map(),
            });
        }
        return this.sessions.get(today)!;
    }

    addParticipant(sessionId: string, user: User): Participant {
        const session = this.sessions.get(sessionId);
        if (!session) {
            throw new Error('Session not found');
        }

        if (session.participants.has(user.id)) {
            return session.participants.get(user.id)!;
        }

        const participant: Participant = {
            ...user,
            score: 0,
            streak: 0,
        };
        session.participants.set(user.id, participant);

        this.broadcast(sessionId, { type: 'participant-joined', participant });

        return participant;
    }

    removeParticipant(sessionId: string, userId: string) {
        const session = this.sessions.get(sessionId);
        if (session && session.participants.has(userId)) {
            const participant = session.participants.get(userId)!;
            session.participants.delete(userId);
            this.broadcast(sessionId, { type: 'participant-left', participant });
        }
    }

    handleAnswer(sessionId: string, userId: string, questionId: string, answer: string) {
        const session = this.sessions.get(sessionId);
        if (!session) {
            throw new Error('Session not found');
        }

        const participant = session.participants.get(userId);
        if (!participant) {
            throw new Error('Participant not found');
        }

        const question = session.questions.find(q => q.id === questionId);
        if (!question) {
            throw new Error('Question not found');
        }

        const correct = question.correctAnswer === answer;
        if (correct) {
            participant.score += 10;
            participant.streak += 1;
        } else {
            participant.streak = 0;
        }

        const result = {
            correct,
            score: participant.score,
            streak: participant.streak,
        };

        this.broadcast(sessionId, { type: 'answer-submitted', userId, result });

        return result;
    }

    addSseConnection(sessionId: string, userId: string, res: NextApiResponse) {
        const session = this.sessions.get(sessionId);
        if (!session) {
            throw new Error('Session not found');
        }
        session.sseConnections.set(userId, res);
    }

    removeSseConnection(sessionId: string, userId: string) {
        const session = this.sessions.get(sessionId);
        if (session) {
            session.sseConnections.delete(userId);
        }
    }

    private broadcast(sessionId: string, data: any) {
        const session = this.sessions.get(sessionId);
        if (!session) {
            return;
        }
        for (const res of session.sseConnections.values()) {
            res.write(`data: ${JSON.stringify(data)}\n\n`);
        }
    }

    verifyToken(token: string): User | null {
        try {
            const decoded = jwt.verify(token, 'your-jwt-secret') as any;
            return decoded.user;
        } catch (error) {
            return null;
        }
    }
}

export const quizService = new QuizService();
