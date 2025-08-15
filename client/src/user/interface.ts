import React from 'react';
import UserProfileSummary from './components/UserProfileSummary';

export interface IUserComponent {
  verifyAuth(): void;
  renderProfile(screen: string): void;
  renderLogin(screen: string): void;
  renderUserProfileSummary(screen: string): React.ReactElement;
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
}
