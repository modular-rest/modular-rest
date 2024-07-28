# Functions
In the Modular-rest, functions are a powerful feature that allows developers to define and manage custom logic seamlessly within their APIs. Functions serve as a mechanism to remove traditional API development, eliminating the need to write routers directly. By defining a function, a router will be generated for it automatically, allowing the client library to focus solely on the API call. This feature supports more dynamic and flexible application designs, ensuring that specific actions can be encapsulated and reused while enforcing permissions and maintaining security.

## Define a Function
To define a function you need to create a `functions.js` in each module of your app, and then you can use the `defineFunction` method to define a function.

The `defineFunction` method serves as a core utility for creating custom functions dynamically. This method allows you to specify various parameters, including the name of the function, the permissions required for access, and the corresponding logic that should be executed when the function is invoked.

### Parameters
| **Property**      | **Type**   | **Description**                                                                                                                                         |
| ----------------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `name`            | `string`   | The name of the function to be defined, which serves as an identifier.                                                                                  |
| `permissionTypes` | `Array`    | An array of [permission types](./database.html#permission-types-table) that are required to access the function. This allows for secure access control. |
| `callback`        | `Function` | The logic to be executed when the function is called, allowing for dynamic behavior based on user input.                                                |

## Usage Example

Here is an example illustrating how to use the `defineFunction` method effectively:

```javascript
const { defineFunction } = require('@modular-rest/server');

defineFunction({
    name: 'getServerTime',
    permissionTypes: ['anonymous_access'],
    callback: (params) => {
        return `
            Welcome, ${params.username}! 
            The current server time is ${new Date().toLocaleString()}.
        `;
    }
});
```

In this example, we define a function named `getServerTime` that requires the `user` permission type to access. When the function is called, it will return a message containing the current server time and the username of the user who invoked the function.

---

By utilizing the `defineFunction` method, developers are empowered to create custom functionality effortlessly within the Modular REST framework, enhancing both the versatility and security of their applications.

