import React from 'react';
import QuizPerformanceIndicator from './components/QuizPerformanceIndicator';
import StartQuizButton from './components/StartQuizButton';
import Quiz from './components/Quiz';
import GameModes from './components/GameModes';
import FeaturedCategories from './components/FeaturedCategories';
import RecentQuizzes from './components/RecentQuizzes';

export interface ILearningComponent {
  loadQuestions(): void;
  loadUserProgress(): void;
  renderQuiz(onNext: () => void): React.ReactElement;
  renderSummary(): void;
  renderQuizPerformanceIndicator(performance: number): React.ReactElement;
  renderStartQuizButton(onPress: () => void): React.ReactElement;
  renderGameModes(): React.ReactElement;
  renderFeaturedCategories(onSelectCategory: (category: string) => void): React.ReactElement;
  renderRecentQuizzes(): React.ReactElement;
}

export class LearningComponent implements ILearningComponent {
    loadQuestions() {
      console.log("Loading questions...");
    }

    loadUserProgress() {
      console.log("Loading user progress...");
    }

    renderQuiz(onNext: () => void): React.ReactElement {
      return <Quiz onNext={onNext} />;
    }

    renderSummary() {
      console.log("Rendering summary...");
    }

    renderQuizPerformanceIndicator(performance: number): React.ReactElement {
      return <QuizPerformanceIndicator performance={performance} />;
    }

    renderStartQuizButton(onPress: () => void): React.ReactElement {
      return <StartQuizButton onPress={onPress} />;
    }

    renderGameModes(): React.ReactElement {
      return <GameModes />;
    }

    renderFeaturedCategories(onSelectCategory: (category: string) => void): React.ReactElement {
      return <FeaturedCategories onSelectCategory={onSelectCategory} />;
    }

    renderRecentQuizzes(): React.ReactElement {
      return <RecentQuizzes />;
    }
  }
