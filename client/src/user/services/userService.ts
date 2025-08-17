import { sqliteService } from '../../common/services/sqliteService';
import { User } from '../store/primitives/User';

class UserService {
  /**
   * Hydrates the user store with user state from the local database.
   * @returns {Promise<User | null>} The user object if found, otherwise null.
   */
  async hydrateUser(): Promise<User | null> {
    try {
      // Initialize the database connection if it hasn't been already.
      await sqliteService.init();

      // For now, we just check if any user data exists in the user_engagement table.
      // As per instructions, we are focusing on the case where no user data is available.
      const userEngagementData = await sqliteService.getAll('user_engagement');

      if (userEngagementData.length === 0) {
        // No user data found, return null.
        return null;
      } else {
        // User data exists. For now, we'll return a dummy user.
        // The full implementation will be handled in a later step.
        const userData = userEngagementData[0];
        // Assuming the 'user_engagement' table has a 'userId' column, but for now, we don't have a full user object.
        // We will create a dummy user.
        return new User(userData.userId, 'Dummy User', 'dummy@test.com');
      }
    } catch (error) {
      console.error('Error hydrating user:', error);
      // In case of an error, we assume no user is hydrated.
      return null;
    }
  }
}

export const userService = new UserService();
