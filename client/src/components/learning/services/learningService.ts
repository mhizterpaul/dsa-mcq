/**
 * @file Implements the business logic for the Learning component, including the SM-2 spaced repetition algorithm.
 */

import { UserQuestionData } from '../store/primitives/UserQuestionData';
import { LearningSession } from '../store/primitives/LearningSession';
import { Category } from '../store/primitives/Category';

/**
 * Represents the core data for the SM-2 algorithm.
 */
export interface SM2Data {
  repetitionCount: number;
  easinessFactor: number;
  interval: number;
}

/**
 * Represents the updated SM-2 data, including the last reviewed timestamp.
 */
export interface UpdatedSM2Data extends SM2Data {
  lastReviewedTimestamp: number;
}

/**
 * Updates the SM-2 spaced repetition data based on a user's response quality.
 *
 * @param currentData - The current SM-2 data for a question.
 * @param quality - The quality of the user's response (0-5).
 * @returns The updated SM-2 data.
 */
const updateSM2Data = (
  currentData: SM2Data,
  quality: number,
): UpdatedSM2Data => {
  if (quality < 0 || quality > 5) {
    throw new Error('Quality must be between 0 and 5.');
  }

  let { repetitionCount, easinessFactor, interval } = currentData;

  // 1. Update Easiness Factor
  // The formula is a variant of the SM-2 algorithm.
  let newEasinessFactor =
    easinessFactor +
    (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  if (newEasinessFactor < 1.3) {
    newEasinessFactor = 1.3;
  }

  // 2. Update Repetition Count and Interval
  if (quality < 3) {
    repetitionCount = 0;
    interval = 0; // Due immediately
  } else {
    repetitionCount += 1;
    if (repetitionCount === 1) {
      interval = 1; // 1 day
    } else if (repetitionCount === 2) {
      interval = 6; // 6 days
    } else {
      interval = Math.ceil(interval * newEasinessFactor);
    }
  }

  return {
    repetitionCount: repetitionCount,
    easinessFactor: newEasinessFactor,
    interval: interval,
    lastReviewedTimestamp: Date.now(),
  };
};

// This should be in a shared types package
export interface Question {
    id: number;
    question: string;
    category: string;
    tags: string[];
    options: {
        text: string;
        isCorrect: boolean;
    }[];
}

interface QuestionRecommendation {
  questionId: string;
  recommendationScore: number;
}

const getTopKQuestionRecommendations = (
  allQuestionIds: string[],
  userQuestionData: UserQuestionData[],
  k: number,
  beta: number = 1.0,
): QuestionRecommendation[] => {
  const uqdMap = new Map(userQuestionData.map(u => [u.questionId, u]));

  const recommendations = allQuestionIds.map((id) => {
    const uqd = uqdMap.get(id);
    const masteryScore = uqd ? uqd.recallStrength : 0;
    const recommendationScore = Math.exp(-beta * masteryScore);
    return {
      questionId: id,
      recommendationScore,
    };
  });

  recommendations.sort((a, b) => b.recommendationScore - a.recommendationScore);

  return recommendations.slice(0, k);
};

export interface CategoryRecommendation {
  categoryId: string;
  recommendationLevel: 'High' | 'Medium' | 'Low' | 'None';
  explanation: string;
}

const getCategoryRecommendations = (
  categories: Category[],
  userQuestionData: UserQuestionData[]
): CategoryRecommendation[] => {
  // Group UQD by category
  // This is a bit simplified as UQD doesn't store category
  // In a real app we'd join with questions
  return categories.map(category => {
    // For now let's just assume we can find them or use dummy logic
    const categoryQuestions = userQuestionData; // Simplified

    const avgMastery = categoryQuestions.length > 0
        ? categoryQuestions.reduce((acc, uqd) => acc + uqd.recallStrength, 0) / categoryQuestions.length
        : 0;

    const totalAttempts = categoryQuestions.reduce((acc, uqd) => acc + uqd.totalAttempts, 0);

    if (totalAttempts === 0) {
        return {
            categoryId: category.id,
            recommendationLevel: 'High',
            explanation: 'New category with no attempts, needs exposure'
        };
    } else if (avgMastery < 0.4) {
        return {
            categoryId: category.id,
            recommendationLevel: 'High',
            explanation: 'Struggling category, focus recommended'
        };
    } else if (avgMastery < 0.8) {
        return {
            categoryId: category.id,
            recommendationLevel: 'Medium',
            explanation: 'Partial mastery, reinforcement suggested'
        };
    } else {
        return {
            categoryId: category.id,
            recommendationLevel: 'Low',
            explanation: 'Mastered categories deprioritized'
        };
    }
  });
};

const getTopKQuestionsForSession = (
  allQuestionIds: string[],
  userQuestionData: UserQuestionData[],
  k: number,
  beta: number = 1.0,
  excludeIds: string[] = []
): string[] => {
  const filteredIds = allQuestionIds.filter(id => !excludeIds.includes(id));
  const pool = filteredIds.length >= k ? filteredIds : allQuestionIds;
  const recommendations = getTopKQuestionRecommendations(pool, userQuestionData, k, beta);
  return recommendations.map(r => r.questionId);
};

const startNewSession = (
  userId: string,
  allQuestionIds: string[],
  userQuestionData: UserQuestionData[],
  subsetSize: number
): LearningSession => {
  const newSession = new LearningSession('session1', userId, allQuestionIds);
  const nextSubset = getTopKQuestionsForSession(allQuestionIds, userQuestionData, subsetSize);
  newSession.questionIds = nextSubset;
  newSession.subsetHistory.push(nextSubset);
  return newSession;
};

const processAnswer = (
  uqd: UserQuestionData,
  isCorrect: boolean,
  quality: number,
  techniqueIds: string[] = [],
): UserQuestionData => {
  const updatedUqd = Object.assign(new UserQuestionData(uqd.userId, uqd.questionId), uqd);

  if (isCorrect) {
    updatedUqd.updateRecallOnCorrectAnswer(techniqueIds);
  } else {
    updatedUqd.updateRecallOnIncorrectAnswer(techniqueIds);
  }

  const updatedSm2 = updateSM2Data(uqd.sm2, quality);
  updatedUqd.sm2 = updatedSm2;

  return updatedUqd;
};

const compileSessionSummary = (
    answers: { [questionId: string]: { answer: string; isCorrect: boolean } },
  ): { strengths: string[]; weaknesses: string[] } => {
    const strengths: string[] = [];
    const weaknesses: string[] = [];

    for (const questionId in answers) {
      if (answers[questionId].isCorrect) {
        strengths.push(questionId);
      } else {
        weaknesses.push(questionId);
      }
    }

    return { strengths, weaknesses };
};

export const API_BASE_URL = 'http://localhost:3000/api';

const getFeaturedCategories = async (): Promise<Category[]> => {
    const response = await fetch(`${API_BASE_URL}/learning/featured-categories`);
    if (!response.ok) {
        throw new Error('Failed to fetch featured categories');
    }
    return await response.json();
};

const getQuestionsByIds = async (ids: number[]): Promise<Question[]> => {
    const response = await fetch(`${API_BASE_URL}/learning/questions`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ids }),
    });
    if (!response.ok) {
        throw new Error('Failed to fetch questions by IDs');
    }
    return await response.json();
};

export const learningService = {
    getFeaturedCategories,
    getQuestionsByIds,
    updateSM2Data,
    getTopKQuestionRecommendations,
    getTopKQuestionsForSession,
    getCategoryRecommendations,
    startNewSession,
    processAnswer,
    compileSessionSummary,
};

export default learningService;
