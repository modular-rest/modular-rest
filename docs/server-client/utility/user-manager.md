
# UserManager Service

The `UserManager` class provides methods for managing user data, including generating verification codes, retrieving user information, and handling user authentication.


## setCustomVerificationCodeGeneratorMethod

Sets a custom method for generating verification codes.


| Argument        | Type     | Description                                         |
| --------------- | -------- | --------------------------------------------------- |
| generatorMethod | Function | A function that returns a random verification code. |

Return and Throw Types:

| Type | Description |
| ---- | ----------- |
| void |             |

Example:
```javascript
userManager.setCustomVerificationCodeGeneratorMethod(() => Math.random().toString(36).substring(2, 15));
```

## generateVerificationCode

Generates a verification code for a user.


| Argument | Type   | Description         |
| -------- | ------ | ------------------- |
| id       | string | The ID of the user. |
| idType   | string | The type of the ID. |

Return and Throw Types:

| Type   | Description                      |
| ------ | -------------------------------- |
| string | The generated verification code. |

Example:
```javascript
const code = userManager.generateVerificationCode('123', 'phone');
```


## getUserById

Get a user by their ID.


| Argument | Type   | Description         |
| -------- | ------ | ------------------- |
| id       | string | The ID of the user. |

Return and Throw Types:

| Type            | Description                          |
| --------------- | ------------------------------------ |
| Promise\<User\> | A promise that resolves to the user. |
| Error           | If the user is not found.            |

Example:
```javascript
userManager.getUserById('123').then(user => console.log(user)).catch(error => console.error(error));
```


## getUserByIdentity

Get a user by their identity.


| Argument | Type   | Description               |
| -------- | ------ | ------------------------- |
| id       | string | The identity of the user. |
| idType   | string | The type of the identity. |

Return and Throw Types:

| Type            | Description                          |
| --------------- | ------------------------------------ |
| Promise\<User\> | A promise that resolves to the user. |
| Error           | If the user is not found.            |

Example:
```javascript
userManager.getUserByIdentity('user@example.com', 'email').then(user => console.log(user)).catch(error => console.error(error));
```


## getUserByToken

Get a user by their token.


| Argument | Type   | Description            |
| -------- | ------ | ---------------------- |
| token    | string | The token of the user. |

Return and Throw Types:

| Type            | Description                          |
| --------------- | ------------------------------------ |
| Promise\<User\> | A promise that resolves to the user. |

Example:
```javascript
userManager.getUserByToken('jwtToken').then(user => console.log(user)).catch(error => console.error(error));
```


## isCodeValid

Check if a verification code is valid.


| Argument | Type   | Description            |
| -------- | ------ | ---------------------- |
| id       | string | The ID of the user.    |
| code     | string | The verification code. |

Return and Throw Types:

| Type    | Description                             |
| ------- | --------------------------------------- |
| boolean | Whether the verification code is valid. |

Example:
```javascript
const isValid = userManager.isCodeValid('123', '456789');
console.log(isValid);
```


## loginUser

Login a user and return their token.


| Argument | Type   | Description               |
| -------- | ------ | ------------------------- |
| id       | string | The ID of the user.       |
| idType   | string | The type of the ID.       |
| password | string | The password of the user. |

Return and Throw Types:

| Type              | Description                                       |
| ----------------- | ------------------------------------------------- |
| Promise\<string\> | A promise that resolves to the token of the user. |
| Error             | If the user is not found.                         |

Example:
```javascript
userManager.loginUser('user@example.com', 'email', 'password123').then(token => console.log(token)).catch(error => console.error(error));
```


## issueTokenForUser

Issue a token for a user.


| Argument | Type   | Description            |
| -------- | ------ | ---------------------- |
| email    | string | The email of the user. |

Return and Throw Types:

| Type              | Description                                       |
| ----------------- | ------------------------------------------------- |
| Promise\<string\> | A promise that resolves to the token of the user. |
| Error             | If the user is not found.                         |

Example:
```javascript
userManager.issueTokenForUser('user@example.com').then(token => console.log(token)).catch(error => console.error(error));
```


## loginAnonymous

Login as an anonymous user.

Return and Throw Types:

| Type              | Description                                                 |
| ----------------- | ----------------------------------------------------------- |
| Promise\<string\> | A promise that resolves to the token of the anonymous user. |
| Error             | If the anonymous user is not found.                         |

Example:
```javascript
userManager.loginAnonymous().then(token => console.log(token)).catch(error => console.error(error));
```


## registerTemporaryID

Register a temporary ID.


| Argument | Type   | Description            |
| -------- | ------ | ---------------------- |
| id       | string | The ID to register.    |
| type     | string | The type of the ID.    |
| code     | string | The verification code. |

Example:
```javascript
userManager.registerTemporaryID('123', 'phone', '456789');
```


### submitPasswordForTemporaryID

Submit a password for a temporary ID.


| Argument | Type   | Description            |
| -------- | ------ | ---------------------- |
| id       | string | The ID.                |
| password | string | The password.          |
| code     | string | The verification code. |

Return and Throw Types:

| Type               | Description                                                      |
| ------------------ | ---------------------------------------------------------------- |
| Promise\<boolean\> | A promise that resolves to whether the operation was successful. |

Example:
```javascript
userManager.submitPasswordForTemporaryID('123', 'password123', '456789').then(success => console.log(success)).catch(error => console.error(error));
```


### changePasswordForTemporaryID

Change the password for a temporary ID.


| Argument | Type   | Description            |
| -------- | ------ | ---------------------- |
| id       | string | The ID.                |
| password | string | The new password.      |
| code     | string | The verification code. |

Return and Throw Types:

| Type               | Description                                                      |
| ------------------ | ---------------------------------------------------------------- |
| Promise\<boolean\> | A promise that resolves to whether the operation was successful. |

Example:
```javascript
userManager.changePasswordForTemporaryID('123', 'newpassword123', '456789').then(success => console.log(success)).catch(error => console.error(error));
```


### registerUser

Register a user.


| Argument | Type   | Description              |
| -------- | ------ | ------------------------ |
| detail   | Object | The details of the user. |

Return and Throw Types:

| Type              | Description                                        |
| ----------------- | -------------------------------------------------- |
| Promise\<string\> | A promise that resolves to the ID of the new user. |
| Error             | If the user could not be registered.               |

Example:
```javascript
userManager.registerUser({ email: 'user@example.com', password: 'password123' }).then(userId => console.log(userId)).catch(error => console.error(error));
```


### changePassword

Change the password of a user.


| Argument | Type   | Description                 |
| -------- | ------ | --------------------------- |
| query    | Object | The query to find the user. |
| newPass  | string | The new password.           |

Return and Throw Types:

| Type            | Description                                             |
| --------------- | ------------------------------------------------------- |
| Promise\<void\> | A promise that resolves when the operation is complete. |

Example:
```javascript
userManager.changePassword({ email: 'user@example.com' }, 'newpassword123').then(() => console.log('Password changed')).catch(error => console.error(error));
```
