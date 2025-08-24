export class User {
  id: string;
  username: string;
  email: string;
  isBlacklisted: boolean;
  authToken: string | null;

  constructor(id: string, username: string, email: string) {
    this.id = id;
    this.username = username;
    this.email = email;
    this.isBlacklisted = false;
    this.authToken = null;

  }
}
