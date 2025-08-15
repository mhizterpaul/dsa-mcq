import React from 'react';
import QuizPerformanceIndicator from './components/QuizPerformanceIndicator';
import StartQuizButton from './components/StartQuizButton';
import Quiz from './components/Quiz';
import GameModes from './components/GameModes';
import FeaturedCategories from './components/FeaturedCategories';
import RecentQuizzes from './components/RecentQuizzes';

export interface ILearningComponent {
  loadUserProgress(): void;
  renderQuizView(screen: string, onNext: () => void): React.ReactElement;
  renderSummary(screen: string): void;
  renderCircularProgressIndicator(screen: string, performance: number): React.ReactElement;
  renderButton(screen: string, onPress: () => void): React.ReactElement;
  renderGameModeList(screen: string): React.ReactElement;
  renderCategoryList(screen: string, onSelectCategory: (category: string) => void): React.ReactElement;
  renderRecentQuizList(screen: string): React.ReactElement;
}

export class LearningComponent implements ILearningComponent {

    loadUserProgress() {
      console.log("Loading user progress...");
    }

    renderQuizView(screen: string, onNext: () => void): React.ReactElement {
      return <Quiz onNext={onNext} />;
    }

    renderSummary(screen: string) {
      console.log("Rendering summary...");
    }

    renderCircularProgressIndicator(screen: string, performance: number): React.ReactElement {
      return <QuizPerformanceIndicator performance={performance} />;
    }

    renderButton(screen: string, onPress: () => void): React.ReactElement {
      return <StartQuizButton onPress={onPress} />;
    }

    renderGameModeList(screen: string): React.ReactElement {
      return <GameModes />;
    }

    renderCategoryList(screen: string, onSelectCategory: (category: string) => void): React.ReactElement {
      return <FeaturedCategories onSelectCategory={onSelectCategory} />;
    }

    renderRecentQuizList(screen: string): React.ReactElement {
      return <RecentQuizzes />;
    }
  }
