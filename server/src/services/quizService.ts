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

import prisma from '../db/prisma';

class QuizService {
    async findOrCreateSessionForUser(user: User): Promise<QuizSession> {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        let session = await prisma.quizSession.findUnique({
            where: { date: today },
            include: { participants: true, questions: true },
        });

        if (!session) {
            session = await prisma.quizSession.create({
                data: {
                    date: today,
                    startTime: new Date(),
                },
                include: { participants: true, questions: true },
            });
        }

        const participant = await prisma.quizParticipant.findUnique({
            where: { userId_sessionId: { userId: user.id, sessionId: session.id } },
        });

        if (!participant) {
            await prisma.quizParticipant.create({
                data: {
                    userId: user.id,
                    sessionId: session.id,
                },
            });
        }

        return session;
    }


    async handleAnswer(sessionId: string, userId: string, questionId: string, answer: string) {
        const participant = await prisma.quizParticipant.findUnique({
            where: { userId_sessionId: { userId, sessionId } },
        });

        if (!participant) {
            throw new Error('Participant not found');
        }

        const question = await prisma.quizQuestion.findUnique({
            where: { id: questionId },
            include: { question: true },
        });

        if (!question) {
            throw new Error('Question not found');
        }

        const correct = question.question.correctAnswer === answer;
        let score = participant.score;
        let streak = participant.streak;

        if (correct) {
            score += 10;
            streak += 1;
        } else {
            streak = 0;
        }

        await prisma.quizParticipant.update({
            where: { id: participant.id },
            data: { score, streak },
        });

        const result = {
            correct,
            score,
            streak,
        };

        // this.broadcast(sessionId, { type: 'answer-submitted', userId, result });

        return result;
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
