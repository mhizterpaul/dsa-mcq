import React from 'react';
import UserProfileSummary from './components/UserProfileSummary';
import ProgressBar from './components/ProgressBar';
import LiveHealthierBanner from './components/LiveHealthierBanner';
import GoalOption from './components/GoalOption';
import BookmarkList from './components/BookmarkList';
import QuestionListItem from './components/QuestionListItem';
import ResetPasswordForm from './components/ResetPasswordForm';
import VerificationCodeForm from './components/VerificationCodeForm';
import Welcome from './components/Welcome';

export interface IUserComponent {
  verifyAuth(): void;
  renderProfile(screen: string): void;
  renderLogin(screen: string): void;
  renderUserProfileSummary(screen: string): React.ReactElement;
  renderProgressBar(screen: string): React.ReactElement;
  renderLiveHealthierBanner(screen: string): React.ReactElement;
  renderGoalOption(screen: string, icon: string, label: string): React.ReactElement;
  renderBookmarkList(screen: string): React.ReactElement;
  renderQuestionListItem(screen: string, question: {id: string, text: string}, index: number): React.ReactElement;
  renderResetPasswordForm(screen: string): React.ReactElement;
  renderVerificationCodeForm(screen: string, navigation: any): React.ReactElement;
  renderWelcome(screen: string): React.ReactElement;
}

export class UserComponent implements IUserComponent {
    verifyAuth() {
        console.log("Verifying auth...");
    }

    renderProfile(screen: string) {
        console.log("Rendering profile...");
    }

    renderLogin(screen: string) {
        console.log("Rendering login...");
    }

    renderUserProfileSummary(screen: string): React.ReactElement {
        return <UserProfileSummary />;
    }

    renderProgressBar(screen: string): React.ReactElement {
        return <ProgressBar />;
    }

    renderLiveHealthierBanner(screen: string): React.ReactElement {
        return <LiveHealthierBanner />;
    }

    renderGoalOption(screen: string, icon: string, label: string): React.ReactElement {
        return <GoalOption icon={icon} label={label} />;
    }

    renderBookmarkList(screen: string): React.ReactElement {
        return <BookmarkList />;
    }

    renderQuestionListItem(screen: string, question: {id: string, text: string}, index: number): React.ReactElement {
        return <QuestionListItem question={question} index={index} />;
    }

    renderResetPasswordForm(screen: string): React.ReactElement {
        return <ResetPasswordForm />;
    }

    renderVerificationCodeForm(screen: string, navigation: any): React.ReactElement {
        return <VerificationCodeForm navigation={navigation} />;
    }

    renderWelcome(screen: string): React.ReactElement {
        return <Welcome />;
    }
}
