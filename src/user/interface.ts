import React from 'react';
import UserProfileSummary from './components/UserProfileSummary';

export interface IUserComponent {
  loadUserProfile(): void;
  authenticateUser(): void;
  renderProfile(): void;
  renderLogin(): void;
  renderUserProfileSummary(): React.ReactElement;
}

export class UserComponent implements IUserComponent {
    loadUserProfile() {
        console.log("Loading user profile...");
    }

    authenticateUser() {
        console.log("Authenticating user...");
    }

    renderProfile() {
        console.log("Rendering profile...");
    }

    renderLogin() {
        console.log("Rendering login...");
    }

    renderUserProfileSummary(): React.ReactElement {
        return <UserProfileSummary />;
    }
}
