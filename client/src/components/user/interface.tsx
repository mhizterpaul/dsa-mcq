import React from 'react';
import UserProfileSummary from './components/UserProfileSummary';
import UserProfile from './screens/UserProfile';
import BookmarkList from './components/BookmarkList';
import ResetPasswordForm from './components/ResetPasswordForm';
import UserSettings from './components/UserSettings';
import { userService } from './services/userService';
import { User } from './store/primitives/User';


export interface IUserComponent {
    hydrateUser(): Promise<User | null>;
    renderUserProfileSummary(screen: string, fullName: string, xp: number): React.ReactElement;
    renderBookmarkList(screen: string): React.ReactElement;
    renderUserProfile(screen: string): React.ReactElement;
    renderResetPasswordForm(screen: string): React.ReactElement;
    renderUserSettingsComponent(): React.ReactElement;
}

export class UserComponent implements IUserComponent {

    async hydrateUser(): Promise<User | null> {
        return await userService.hydrateUser();
    }

    renderUserProfileSummary(screen: string, fullName: string, xp: number): React.ReactElement {
        return <UserProfileSummary fullName={fullName} xp={xp} />;
    }


    renderBookmarkList(screen: string): React.ReactElement {
        return <BookmarkList />;
    }

    renderUserProfile(screen: string): React.ReactElement {
        return <UserProfile />;
    }

    renderResetPasswordForm(screen: string): React.ReactElement {
        return <ResetPasswordForm />;
    }

    renderUserSettingsComponent(): React.ReactElement {
        return <UserSettings />;
    }
}
