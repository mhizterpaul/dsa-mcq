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
 * Represents the updated SM-2 data, including timestamps for tracking.
 */
export interface UpdatedSM2Data extends SM2Data {
  lastReviewedTimestamp: number;
  nextDueTimestamp: number;
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
    interval = 1; // Due tomorrow rather than instantly
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

  const now = Date.now();
  const DAY_MS = 24 * 60 * 60 * 1000;

  return {
    repetitionCount: repetitionCount,
    easinessFactor: newEasinessFactor,
    interval: interval,
    lastReviewedTimestamp: now,
    nextDueTimestamp: now + interval * DAY_MS,
  };
};

// This should be in a shared types package
export interface Question {
    id: string;
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
  epsilon: number = 0.1,
): QuestionRecommendation[] => {
  const uqdMap = new Map(userQuestionData.map(u => [u.questionId, u]));
  const now = Date.now();

  const recommendations = allQuestionIds.map((id) => {
    const uqd = uqdMap.get(id);

    // Weighted scoring model
    // 1. Due status (priority)
    const isDue = !uqd || !uqd.sm2.nextDueTimestamp || uqd.sm2.nextDueTimestamp <= now;
    const dueScore = isDue ? 1.0 : 0.0;

    // 2. Mastery Score (inverse priority)
    const masteryScore = uqd ? uqd.recallStrength : 0;

    // 3. Uncertainty (fewer attempts means higher uncertainty)
    const uncertaintyScore = 1 / (1 + (uqd?.totalAttempts || 0));

    // Exploration: Epsilon-greedy
    if (Math.random() < epsilon) {
        return { questionId: id, recommendationScore: Math.random() * 2 }; // Random boost
    }

    const recommendationScore =
        0.6 * dueScore +
        0.3 * (1 - masteryScore) +
        0.1 * uncertaintyScore;

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
  userQuestionData: UserQuestionData[],
  questions: Question[]
): CategoryRecommendation[] => {
  const questionCategoryMap = new Map<string, string>(
    questions.map(q => [String(q.id), q.category])
  );

  const categoryBuckets = new Map<string, UserQuestionData[]>();
  for (const uqd of userQuestionData) {
    const categoryId = questionCategoryMap.get(uqd.questionId);
    if (categoryId) {
        if (!categoryBuckets.has(categoryId)) {
            categoryBuckets.set(categoryId, []);
        }
        categoryBuckets.get(categoryId)!.push(uqd);
    }
  }

  return categories.map(category => {
    const categoryQuestions = categoryBuckets.get(category.id) || [];

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

  const uqdMap = new Map(userQuestionData.map(u => [u.questionId, u]));
  const now = Date.now();

  // Prioritize due questions
  const dueIds = filteredIds.filter(id => {
    const uqd = uqdMap.get(id);
    return !uqd || !uqd.sm2.nextDueTimestamp || uqd.sm2.nextDueTimestamp <= now;
  });

  const pool = dueIds.length >= k ? dueIds : filteredIds;
  const recommendations = getTopKQuestionRecommendations(pool, userQuestionData, k, beta);
  return recommendations.map(r => r.questionId);
};

const startNewSession = (
  userId: string,
  allQuestionIds: string[],
  userQuestionData: UserQuestionData[],
  subsetSize: number
): LearningSession => {
  const sessionId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `session-${Date.now()}`;
  const newSession = new LearningSession(sessionId, userId, allQuestionIds);
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
  // Invariant: correctness and quality must align
  if (!isCorrect && quality >= 3) {
      throw new Error("Invalid state: incorrect answers must have quality < 3");
  }

  // Use structuredClone to avoid mutation risks (shallow copy was risky)
  const updatedUqd = typeof structuredClone !== 'undefined'
    ? structuredClone(uqd) as UserQuestionData
    : JSON.parse(JSON.stringify(uqd)) as UserQuestionData;

  // Re-prototype if necessary as structuredClone might strip methods depending on environment
  Object.setPrototypeOf(updatedUqd, UserQuestionData.prototype);

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
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

    try {
        const response = await fetch(`${API_BASE_URL}/learning/featured-categories`, {
            signal: controller.signal
        });
        if (!response.ok) {
            throw new Error(`Failed to fetch featured categories: ${response.statusText}`);
        }
        return await response.json();
    } finally {
        clearTimeout(timeoutId);
    }
};

const getQuestionsByIds = async (ids: string[]): Promise<Question[]> => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout

    try {
        const response = await fetch(`${API_BASE_URL}/learning/questions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ ids, revealAnswers: true }),
            signal: controller.signal
        });
        if (!response.ok) {
            throw new Error(`Failed to fetch questions by IDs: ${response.statusText}`);
        }
        return await response.json();
    } finally {
        clearTimeout(timeoutId);
    }
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
