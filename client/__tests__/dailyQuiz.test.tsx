import React from 'react';
import { render } from '@testing-library/react-native';
import DailyQuizScreen from '../src/screens/DailyQuizScreen';
import { LearningComponent } from '../src/components/learning/interface';

jest.mock('../src/components/learning/interface');

describe('DailyQuiz', () => {
  it('should call renderDailyQuiz on the learningComponent', () => {
    const mockRenderDailyQuiz = jest.fn();
    (LearningComponent as jest.Mock).mockImplementation(() => {
      return {
        renderDailyQuiz: mockRenderDailyQuiz,
      };
    });

    render(<DailyQuizScreen navigation={{ navigate: jest.fn() }} />);

    expect(mockRenderDailyQuiz).toHaveBeenCalledWith('dailyQuiz');
  });
});
