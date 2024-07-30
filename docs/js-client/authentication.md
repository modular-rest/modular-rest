# AuthService Service
The `AuthService` class handles the authentication process, including login, token management, and user session handling.

## Importing the Service
To use the `AuthService`, you need to import it as follows:
```typescript
import { authentication } from '@modular-rest/client';
```

## Public Properties

| Property | Description                                                            |
| -------- | ---------------------------------------------------------------------- |
| user     | The currently authenticated user, or null if no user is authenticated. |
| isLogin  | A boolean indicating if the user is currently logged in.               |

## `login()`
Logs in the user with the provided credentials.

| Argument   | Type               | Description                                         |
| ---------- | ------------------ | --------------------------------------------------- |
| `identity` | `IdentityType`     | The identity of the user (e.g., username or email). |
| `password` | `string`           | The user's password.                                |
| `options`  | `LoginOptionsType` | Additional login options.                           |

Return and Throw:
| Returns                      | Description                 |
| ---------------------------- | --------------------------- |
| `Promise<LoginResponseType>` | The login response data.    |
| Throws                       | `Error` if the login fails. |

Example:
```typescript
authentication.login('user@example.com', 'password123', { rememberMe: true })
    .then(response => {
        console.log('Login successful:', response);
    })
    .catch(error => {
        console.error('Login failed:', error);
    });
```

## `loginWithLastSession()`
Logs in with the last session if you pass `allowSave=true` in the last login.


| Argument | Type     | Description                                |
| -------- | -------- | ------------------------------------------ |
| `token`  | `string` | The token for the last session (optional). |

Return and Throw:

| Returns         | Description                 |
| --------------- | --------------------------- |
| `Promise<User>` | The logged-in user data.    |
| Throws          | `Error` if the login fails. |

Example:
```typescript
authentication.loginWithLastSession()
    .then(user => {
        console.log('Logged in with last session:', user);
    })
    .catch(error => {
        console.error('Login with last session failed:', error);
    });
```

## `loginAsAnonymous()`
Logs in as an anonymous user and retrieves a token.

Return and Throw Table:

| Returns                      | Description                                   |
| ---------------------------- | --------------------------------------------- |
| `Promise<LoginResponseType>` | The login response data containing the token. |
| Throws                       | `Error` if the login fails.                   |

Example:
```typescript
authService.loginAsAnonymous()
    .then(response => {
        console.log('Anonymous login successful:', response);
    })
    .catch(error => {
        console.error('Anonymous login failed:', error);
    });
```

## `logout()`
Logs out the current user and clears the session.

Return and Throw:
| Returns | Description      |
| ------- | ---------------- |
| `void`  | No return value. |
| Throws  | None             |

Example:
```typescript
authentication.logout();
```

## `verifyToken()`
Verifies the provided token.

| Argument | Type     | Description          |
| -------- | -------- | -------------------- |
| `token`  | `string` | The token to verify. |

Return and Throw:
| Returns                            | Description                              |
| ---------------------------------- | ---------------------------------------- |
| `Promise<VerifyTokenResponseType>` | The token verification response data.    |
| Throws                             | `Error` if the token verification fails. |

Example:
```typescript
authentication.verifyToken('some-jwt-token')
    .then(response => {
        console.log('Token verification successful:', response);
    })
    .catch(error => {
        console.error('Token verification failed:', error);
    });
```

## `registerIdentity()`
Registers a user identity, the first step for creating a new account.


| Argument   | Type           | Description               |
| ---------- | -------------- | ------------------------- |
| `identity` | `IdentityType` | The identity of the user. |

Return and Throw:

| Returns                     | Description                        |
| --------------------------- | ---------------------------------- |
| `Promise<BaseResponseType>` | The registration response data.    |
| Throws                      | `Error` if the registration fails. |

Example:
```typescript
authentication.registerIdentity({ idType: 'email', id: 'user@example.com' })
    .then(response => {
        console.log('Identity registered:', response);
    })
    .catch(error => {
        console.error('Identity registration failed:', error);
    });
```

## `validateCode()`
Validates the provided code.

| Argument | Type     | Description           |
| -------- | -------- | --------------------- |
| `code`   | `string` | The code to validate. |

Return and Throw:
| Returns                             | Description                      |
| ----------------------------------- | -------------------------------- |
| `Promise<ValidateCodeResponseType>` | The validation response data.    |
| Throws                              | `Error` if the validation fails. |

Example:
```typescript
authentication.validateCode('123456')
    .then(response => {
        console.log('Code validation successful:', response);
    })
    .catch(error => {
        console.error('Code validation failed:', error);
    });
```

## `submitPassword()`
Submits a password, the third step for creating a new account.


| Argument           | Type     | Description                      |
| ------------------ | -------- | -------------------------------- |
| `options`          | `object` | The password submission options. |
| `options.id`       | `string` | The user identity.               |
| `options.password` | `string` | The user's password.             |
| `options.code`     | `string` | The verification code.           |

Return and Throw:

| Returns                     | Description                            |
| --------------------------- | -------------------------------------- |
| `Promise<BaseResponseType>` | The password submission response data. |
| Throws                      | `Error` if the submission fails.       |

Example:
```typescript
authentication.submitPassword({ id: 'user@example.com', password: 'newpassword', code: '123456' })
    .then(response => {
        console.log('Password submitted successfully:', response);
    })
    .catch(error => {
        console.error('Password submission failed:', error);
    });
```

## `changePassword()`
Changes the user's password.


| Argument           | Type     | Description                  |
| ------------------ | -------- | ---------------------------- |
| `options`          | `object` | The password change options. |
| `options.id`       | `string` | The user identity.           |
| `options.password` | `string` | The new password.            |
| `options.code`     | `string` | The verification code.       |

Return and Throw:

| Returns                     | Description                        |
| --------------------------- | ---------------------------------- |
| `Promise<BaseResponseType>` | The password change response data. |
| Throws                      | `Error` if the change fails.       |

Example:
```typescript
authentication.changePassword({ id: 'user@example.com', password: 'newpassword', code: '123456' })
    .then(response => {
        console.log('Password changed successfully:', response);
    })
    .catch(error => {
        console.error('Password change failed:', error);
    });
```

