import React from 'react';
import QuizPerformanceIndicator from './components/QuizPerformanceIndicator';
import StartQuizButton from './components/StartQuizButton';
import Quiz from './components/Quiz';
import GameModes from './components/GameModes';
import FeaturedCategories from './components/FeaturedCategories';
import RecentQuizzes from './components/RecentQuizzes';
import QuizView from './components/QuizView';
import SessionSummary from './components/SessionSummary';

export interface ILearningComponent {
  loadUserProgress(): void;
  renderQuiz(screen: string, onNext: () => void): React.ReactElement;
  renderSummary(screen: string): React.ReactElement;
  renderQuizPerformanceIndicator(screen: string, performance: number): React.ReactElement;
  renderStartQuizButton(screen: string, onPress: () => void): React.ReactElement;
  renderGameModes(screen: string): React.ReactElement;
  renderFeaturedCategories(screen: string, onSelectCategory: (category: string) => void): React.ReactElement;
  renderRecentQuizzes(screen: string): React.ReactElement;
  renderQuizView(screen: string): React.ReactElement;
}

export class LearningComponent implements ILearningComponent {

    loadUserProgress() {
      console.log("Loading user progress...");
    }

    renderQuiz(screen: string, onNext: () => void): React.ReactElement {
      return <Quiz onNext={onNext} />;
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

    renderFeaturedCategories(screen: string, onSelectCategory: (category: string) => void): React.ReactElement {
      return <FeaturedCategories onSelectCategory={onSelectCategory} />;
    }

    renderRecentQuizzes(screen: string): React.ReactElement {
      return <RecentQuizzes />;
    }

    renderQuizView(screen: string): React.ReactElement {
        return <QuizView />;
    }
  }
