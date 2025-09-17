import { configureStore } from '@reduxjs/toolkit';
import { learningRootReducer } from '../../src/components/learning/store';
import { fetchBatchFeedback, addQuestion } from '../../src/components/learning/store/question.slice';
import * as feedbackService from '../../src/components/learning/services/feedbackService';
import { Question } from '../../src/components/learning/store/primitives/Question';

jest.mock('../../src/components/learning/services/feedbackService');
const mockedFeedbackService = jest.mocked(feedbackService, { shallow: true });


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
    const generateBatchFeedbackSpy = jest.spyOn(feedbackService, 'generateBatchFeedback');

    const questionId = 'q1';
    const initialQuestion = new Question(
      questionId,
      'What is the capital of France?',
      ['Paris', 'London', 'Berlin', 'Madrid'],
      0,
      ['geography'],
      1,
      { correct_approach: 'Error', incorrect_approach: '' }
    );

    store.dispatch(addQuestion({ ...initialQuestion }));

    const mockFeedback = {
      q1: {
        correct_approach: 'Paris is the correct answer.',
        incorrect_approach: 'London is the capital of the UK.',
      }
    };

    generateBatchFeedbackSpy.mockResolvedValue(mockFeedback);

    await store.dispatch(fetchBatchFeedback([questionId]));

    const state = store.getState();
    const updatedQuestion = state.questions.entities[questionId];

    expect(updatedQuestion?.feedback).toEqual(mockFeedback.q1);
  });
});
