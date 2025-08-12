Feature: User Authentication and Management via AuthServer

  Background:
    Given the AuthServer is running and connected to the database
    And the user authentication status cache is empty

  Scenario: User registration
    When a new user registers with username "newuser" and password "SecurePass123"
    Then the user "newuser" should be added to the database
    And the user's authentication status cache remains empty

  Scenario: Successful login and caching authentication status
    Given the user "registeredUser" exists in the database
    When the user "registeredUser" logs in with correct credentials
    Then the AuthServer returns a short TTL access token
    And the user's authentication status is cached after verification

  Scenario: Access token expiry and on-demand revalidation
    Given the user "registeredUser" has a valid cached authentication status
    When the access token expires
    And the user tries to access a protected resource
    Then the AuthServer revalidates the user against the database
    And updates the cached authentication status upon success

  Scenario: Password reset request
    Given the user "registeredUser" exists in the database
    When the user requests a password reset
    Then the AuthServer generates a password reset token
    And sends the token to the user's registered email

  Scenario: Password reset with valid token
    Given the user "registeredUser" has received a valid password reset token
    When the user submits a new password "NewSecurePass123" with the reset token
    Then the user's password is updated in the database
    And the user's authentication status cache is invalidated

  Scenario: Blacklisting a user
    Given the user "badUser" exists in the database and has cached authentication status
    When the user "badUser" is blacklisted by an administrator
    Then the user is marked as blacklisted in the database
    And the user's cached authentication status is invalidated immediately
    And subsequent access token validations fail for "badUser"
