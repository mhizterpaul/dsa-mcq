import React from 'react';
import UserProfileSummary from './components/UserProfileSummary';

export interface IUserComponent {
  verifyAuth(): void;
  renderProfile(): void;
  renderLogin(): void;
  renderUserProfileSummary(): React.ReactElement;
}

export class UserComponent implements IUserComponent {
    
}
