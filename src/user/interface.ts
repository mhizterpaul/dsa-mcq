export interface IUserComponent {
  loadUserProfile(): void;
  authenticateUser(): void;
  renderProfile(): void;
  renderLogin(): void;
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
}
