import React from 'react';
import QuizPerformanceIndicator from './components/QuizPerformanceIndicator';
import StartQuizButton from './components/StartQuizButton';
import Quiz from './screens/Quiz';
import GameModes from './components/GameModes';
import FeaturedCategories from './components/FeaturedCategories';
import RecentQuizzes from './components/RecentQuizzes';
import QuizView from './components/QuizView';
import DailyQuizScreen from './screens/DailyQuiz';
import SessionSummary from './components/SessionSummary';
import learningService from './services/learningService';
import { setCategories } from './store/category.slice';
import { AppDispatch } from '../mediator/store';

export interface ILearningComponent {
  startNewQuizSession(): Promise<string[]>;
  hydrate(dispatch: AppDispatch): Promise<void>;
  loadUserProgress(): void;
  renderQuiz(screen: string, sessionQuestionIds: string[], navigation: any, onQuizComplete: (answers: { [questionId: string]: { answer: string; isCorrect: boolean } }) => void): React.ReactElement;
  renderDailyQuiz(screen: string, navigation: any): React.ReactElement;
  renderSummary(screen: string): React.ReactElement;
  renderQuizPerformanceIndicator(screen: string, performance: number): React.ReactElement;
  renderStartQuizButton(screen: string, onPress: () => void): React.ReactElement;
  renderGameModes(screen: string): React.ReactElement;
  renderFeaturedCategories(screen: string): React.ReactElement;
  renderRecentQuizzes(screen: string, navigation: any): React.ReactElement;
  renderQuizView(screen: string): React.ReactElement;
}

export class LearningComponent implements ILearningComponent {

    async startNewQuizSession(): Promise<string[]> {
        // This is a simplified version. A real implementation would get the user's
        // progress from the store to pass to the recommendation algorithm.
        const allQuestionIds = Array.from({ length: 12 }, (_, i) => String(i + 1));
        const userQuestionData = []; // Dummy data
        const session = learningService.startNewSession('user1', allQuestionIds, userQuestionData, 20);
        return session.questionIds;
    }

    async hydrate(dispatch: AppDispatch) {
        try {
            const categories = await learningService.getFeaturedCategories();
            dispatch(setCategories(categories));
        } catch (error) {
            console.error('Failed to hydrate learning component:', error);
        }
    }

    loadUserProgress() {
      console.log("Loading user progress...");
    }

    renderQuiz(screen: string, sessionQuestionIds: string[], navigation: any, onQuizComplete: (answers: { [questionId: string]: { answer: string; isCorrect: boolean } }) => void): React.ReactElement {
      return <Quiz sessionQuestionIds={sessionQuestionIds} navigation={navigation} onQuizComplete={onQuizComplete} />;
    }

    renderSummary(screen: string): React.ReactElement {
      return <SessionSummary />;
    }

    renderQuizPerformanceIndicator(screen: string, performance: number): React.ReactElement {
      return <QuizPerformanceIndicator performance={performance} />;
    }

    renderStartQuizButton(screen: string, onPress: () => void): React.ReactElement {
      return <StartQuizButton onPress={onPress} />;
    }

    renderGameModes(screen: string): React.ReactElement {
      return <GameModes />;
    }

    renderFeaturedCategories(screen: string): React.ReactElement {
      return <FeaturedCategories  />;
    }

    renderRecentQuizzes(screen: string, navigation: any): React.ReactElement {
      return <RecentQuizzes navigation={navigation} />;
    }

    renderQuizView(screen: string): React.ReactElement {
        return <QuizView />;
    }

    renderDailyQuiz(screen: string, navigation: any): React.ReactElement {
        return <DailyQuizScreen navigation={navigation} />;
    }
  }