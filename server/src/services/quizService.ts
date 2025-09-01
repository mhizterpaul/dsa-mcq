import { NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';
import prisma from '../db/prisma';
import { averageVector, cosineSimilarity, Vector } from '../utils/vector';
import type { Engagement, User } from '@prisma/client';

// ... (interfaces and helper functions)

class QuizService {
    private sessions: Map<string, QuizSession>;
    private nextSessionId: number;

    constructor() {
        this.sessions = new Map();
        this.nextSessionId = 1;
    }

    // ... (other methods)

    // Method for testing purposes
    getSessions() {
        return this.sessions;
    }
}

export const quizService = new QuizService();
