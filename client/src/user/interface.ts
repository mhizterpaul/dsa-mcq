import React from 'react';
import UserProfileSummary from './components/UserProfileSummary';
import UserProfile from './screens/UserProfile';
import BookmarkList from './components/BookmarkList';
import ResetPasswordForm from './components/ResetPasswordForm';


export interface IUserComponent {
    renderUserProfileSummary(screen: string): React.ReactElement;
    renderBookmarkList(screen: string): React.ReactElement;
    renderUserProfile(screen: string): React.ReactElement;
    renderResetPasswordForm(screen: string): React.ReactElement;
}

export class UserComponent implements IUserComponent {


    renderUserProfileSummary(screen: string): React.ReactElement {
        return <UserProfileSummary />;
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
}
