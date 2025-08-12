/**
 * @file Implements the business logic for the Learning component, including the SM-2 spaced repetition algorithm.
 */

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

import { UserQuestionData } from '../store/primitives/UserQuestionData';
import { LearningSession } from '../store/primitives/LearningSession';
import { Category } from '../store/primitives/Category';

interface QuestionRecommendation {
  questionId: string;
  recommendationScore: number;
}

const getTopKQuestionRecommendations = (
  userQuestionData: UserQuestionData[],
  k: number,
  beta: number = 1.0,
): QuestionRecommendation[] => {
  const recommendations = userQuestionData.map((uqd) => {
    const masteryScore = uqd.recallStrength;
    const recommendationScore = Math.exp(-beta * masteryScore);
    return {
      questionId: uqd.questionId,
      recommendationScore,
    };
  });

  recommendations.sort((a, b) => b.recommendationScore - a.recommendationScore);

  return recommendations.slice(0, k);
};

interface CategoryRecommendation {
  categoryId: string;
  recommendationLevel: 'High' | 'Medium' | 'Low' | 'None';
  explanation: string;
}

const getTopKQuestionsForSession = (
  userQuestionData: UserQuestionData[],
  k: number,
): string[] => {
  const recommendations = getTopKQuestionRecommendations(userQuestionData, k);
  return recommendations.map(r => r.questionId);
};

const startNewSession = (
  userId: string,
  allQuestionIds: string[],
  userQuestionData: UserQuestionData[],
  subsetSize: number
): LearningSession => {
  const newSession = new LearningSession('session1', userId, allQuestionIds);
  const nextSubset = getTopKQuestionsForSession(userQuestionData, subsetSize);
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

const getCategoryRecommendations = (
  categories: Category[],
): CategoryRecommendation[] => {
  return categories.map((category) => {
    const { id, masteryScore } = category;
    let recommendationLevel: 'High' | 'Medium' | 'Low' | 'None';
    let explanation: string;

    if (masteryScore === 0) {
      recommendationLevel = 'High';
      explanation = 'New category with no attempts, needs exposure';
    } else if (masteryScore < 0.4) {
      recommendationLevel = 'High';
      explanation = 'Struggling category, focus recommended';
    } else if (masteryScore < 0.8) {
      recommendationLevel = 'Medium';
      explanation = 'Partial mastery, reinforcement suggested';
    } else {
      recommendationLevel = 'Low';
      explanation = 'Mastered categories deprioritized';
    }

    return {
      categoryId: id,
      recommendationLevel,
      explanation,
    };
  });
};

export const learningService = {
    updateSM2Data,
    getTopKQuestionRecommendations,
    getTopKQuestionsForSession,
    startNewSession,
    processAnswer,
    compileSessionSummary,
    getCategoryRecommendations,
};
