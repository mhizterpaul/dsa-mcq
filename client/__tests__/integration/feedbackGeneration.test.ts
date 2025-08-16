import { configureStore } from '@reduxjs/toolkit';
import { learningRootReducer } from '../../src/learning/store';
import { fetchFeedbackForQuestion, addQuestion } from '../../src/learning/store/question.slice';
import * as feedbackService from '../../src/learning/services/feedbackService';
import { Question } from '../../src/learning/store/primitives/Question';

jest.mock('../../src/learning/services/feedbackService');

const mockedFeedbackService = feedbackService as jest.Mocked<typeof feedbackService>;

describe('Feedback Generation Integration Test', () => {
  let store: ReturnType<typeof configureStore>;

  beforeEach(() => {
    store = configureStore({
      reducer: learningRootReducer,
      middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
          serializableCheck: false,
        }),
    });
  });

  it('should fetch feedback for a question and update the store', async () => {
    const questionId = 'q1';
    const initialQuestion = new Question(
      questionId,
      'What is the capital of France?',
      ['Paris', 'London', 'Berlin', 'Madrid'],
      0,
      ['geography'],
      1,
      { correct_approach: '', incorrect_approach: '' }
    );

    store.dispatch(addQuestion({ ...initialQuestion }));

    const mockFeedback = {
      correct_approach: 'Paris is the correct answer.',
      incorrect_approach: 'London is the capital of the UK.',
    };

    mockedFeedbackService.generateFeedback.mockResolvedValue(mockFeedback);

    await store.dispatch(fetchFeedbackForQuestion(questionId));

    const state = store.getState();
    const updatedQuestion = state.questions.entities[questionId];

    expect(updatedQuestion?.feedback).toEqual(mockFeedback);
  });
});
