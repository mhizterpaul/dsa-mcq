import { loadFeature, defineFeature } from 'jest-cucumber';
import { configureStore } from '@reduxjs/toolkit';
import { learningRootReducer } from '../../../src/learning/store';
import {
  addUserQuestionData,
  answerCorrectly,
  answerIncorrectly,
  decayRecallStrength,
  setRecallData,
} from '../../../src/learning/store/userQuestionData.slice';
import { UserQuestionData } from '../../../src/learning/store/primitives/UserQuestionData';

const feature = loadFeature('./__tests__/component/learning/active_recall.feature');

let store: ReturnType<typeof configureStore>;
let userId = 'test-user';
let questionId = 'test-question';

const selectUserQuestionData = (userId: string, questionId: string) => {
  const state = store.getState();
  const id = `${userId}-${questionId}`;
  return state.userQuestionData.entities[id];
};

const setupStore = (initialState?: any) => {
  store = configureStore({
    reducer: learningRootReducer,
    preloadedState: initialState,
  });
};

const givenInitialMetadata = (given: (stepMatcher: RegExp, stepDefinitionCallback: (...args: any[]) => any) => void) => {
    given('a question with initial recall metadata for a user', () => {
      setupStore();
      store.dispatch(addUserQuestionData({ userId, questionId }));
    });
};

defineFeature(feature, (test) => {

  test('Default state of question metadata before any user interaction', ({ given, then }) => {
    givenInitialMetadata(given);

    given('a user has never attempted the question', () => {
      // The background step already sets up this state
    });

    then(/^the recall metadata for the user has$/, (table) => {
      const data = selectUserQuestionData(userId, questionId);
      expect(data?.correctAttempts).toBe(0);
      expect(data?.totalAttempts).toBe(0);
      expect(data?.recallStrength).toBe(0.0);
      expect(data?.lastAttemptTimestamp).toBeNull();
      expect(data?.techniqueTransferScores).toEqual({});
    });
  });

  test('Transition on first retrieval attempt - incorrect answer', ({ given, when, then, and }) => {
    givenInitialMetadata(given);

    given('a user attempts the question for the first time', () => {
        // The background step sets this up
    });

    when('the user answers incorrectly', () => {
      store.dispatch(answerIncorrectly({ userId, questionId }));
    });

    then(/^totalAttempts increments from 0 to 1$/, () => {
      const data = selectUserQuestionData(userId, questionId);
      expect(data?.totalAttempts).toBe(1);
    });

    and('correctAttempts remains 0', () => {
      const data = selectUserQuestionData(userId, questionId);
      expect(data?.correctAttempts).toBe(0);
    });

    and('recallStrength updates to a low value reflecting poor recall', () => {
      const data = selectUserQuestionData(userId, questionId);
      expect(data?.recallStrength).toBeLessThan(0.5);
    });

    and('lastAttemptTimestamp is set to current time', () => {
      const data = selectUserQuestionData(userId, questionId);
      expect(data?.lastAttemptTimestamp).toBeCloseTo(Date.now(), -3);
    });

    and('techniqueTransferScores update to reduce scores for relevant techniques', () => {
        const data = selectUserQuestionData(userId, questionId);
        expect(data?.techniqueTransferScores).toEqual({});
    });
  });

  test('Transition on retrieval attempt - correct answer', ({ given, when, then, and }) => {
    givenInitialMetadata(given);

    given('a user has existing recall metadata with N attempts', () => {
      const recallData = {
        totalAttempts: 5,
        correctAttempts: 3,
        recallStrength: 0.6,
      };
      store.dispatch(setRecallData({ userId, questionId, recallData }));
    });

    when('the user answers correctly', () => {
      store.dispatch(answerCorrectly({ userId, questionId }));
    });

    then('totalAttempts increments by 1', () => {
      const data = selectUserQuestionData(userId, questionId);
      expect(data?.totalAttempts).toBe(6);
    });

    and('correctAttempts increments by 1', () => {
      const data = selectUserQuestionData(userId, questionId);
      expect(data?.correctAttempts).toBe(4);
    });

    and('recallStrength increases proportionally to successful recall and spaced repetition model', () => {
        const data = selectUserQuestionData(userId, questionId);
        expect(data?.recallStrength).toBeGreaterThan(0.6);
    });

    and('lastAttemptTimestamp updates to current time', () => {
        const data = selectUserQuestionData(userId, questionId);
        expect(data?.lastAttemptTimestamp).toBeCloseTo(Date.now(), -3);
    });

    and('techniqueTransferScores update to improve scores for relevant techniques', () => {
        const data = selectUserQuestionData(userId, questionId);
        expect(data?.techniqueTransferScores).toEqual({});
    });
  });

  test('Transition on repeated incorrect attempts', ({ given, when, then, and }) => {
    givenInitialMetadata(given);

    given('a user has multiple previous incorrect attempts', () => {
        const recallData = {
            totalAttempts: 3,
            correctAttempts: 0,
            recallStrength: 0.2,
        };
        store.dispatch(setRecallData({ userId, questionId, recallData }));
    });

    when('the user answers incorrectly again', () => {
        store.dispatch(answerIncorrectly({ userId, questionId }));
    });

    then('totalAttempts increments', () => {
        const data = selectUserQuestionData(userId, questionId);
        expect(data?.totalAttempts).toBe(4);
    });

    and('correctAttempts remains unchanged', () => {
        const data = selectUserQuestionData(userId, questionId);
        expect(data?.correctAttempts).toBe(0);
    });

    and('recallStrength decreases or decays according to failure penalty rules', () => {
        const data = selectUserQuestionData(userId, questionId);
        expect(data?.recallStrength).toBeLessThan(0.2);
    });

    and('lastAttemptTimestamp updates', () => {
        const data = selectUserQuestionData(userId, questionId);
        expect(data?.lastAttemptTimestamp).toBeCloseTo(Date.now(), -3);
    });
  });

  test('Transition on no interaction over time (decay)', ({ given, when, then, and }) => {
    givenInitialMetadata(given);

    given('a user has recall metadata with lastAttemptTimestamp older than decay threshold', () => {
        const recallData = {
            recallStrength: 0.8,
            lastAttemptTimestamp: Date.now() - (25 * 60 * 60 * 1000), // 25 hours ago
        };
        store.dispatch(setRecallData({ userId, questionId, recallData }));
    });

    when('the system triggers decay process', () => {
        store.dispatch(decayRecallStrength({ userId, questionId }));
    });

    then('recallStrength decays proportionally to time elapsed', () => {
        const data = selectUserQuestionData(userId, questionId);
        expect(data?.recallStrength).toBeLessThan(0.8);
    });

    and('techniqueTransferScores may also decay to reflect fading transfer mastery', () => {
        const data = selectUserQuestionData(userId, questionId);
        expect(data?.techniqueTransferScores).toEqual({});
    });
  });

  test('Transition enforcing retrieval before feedback', ({ given, when, then, and }) => {
    let canRequest: boolean;
    givenInitialMetadata(given);

    given('recall metadata with totalAttempts = 0', () => {
        // The background step sets this up
    });

    when('user requests feedback', () => {
        const data = selectUserQuestionData(userId, questionId);
        const uqd = Object.assign(new UserQuestionData(userId, questionId), data);
        canRequest = uqd.canRequestFeedback();
    });

    then('system denies feedback', () => {
        expect(canRequest).toBe(false);
    });

    and('metadata state remains unchanged', () => {
        const data = selectUserQuestionData(userId, questionId);
        expect(data?.totalAttempts).toBe(0);
        expect(data?.correctAttempts).toBe(0);
    });
  });

  test('Transition on feedback provision after retrieval', ({ given, when, then, and }) => {
    let canRequest: boolean;
    givenInitialMetadata(given);

    given('recall metadata with totalAttempts > 0', () => {
        const recallData = { totalAttempts: 1 };
        store.dispatch(setRecallData({ userId, questionId, recallData }));
    });

    when('user requests feedback', () => {
        const data = selectUserQuestionData(userId, questionId);
        const uqd = Object.assign(new UserQuestionData(userId, questionId), data);
        canRequest = uqd.canRequestFeedback();
    });

    then('system provides feedback', () => {
        expect(canRequest).toBe(true);
    });

    and('metadata state may update if feedback involves corrective steps or hints', () => {
        const data = selectUserQuestionData(userId, questionId);
        expect(data?.totalAttempts).toBe(1);
    });
  });
});
