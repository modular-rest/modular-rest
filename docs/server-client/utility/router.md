
# Router Utilities
When you develop custom APIs on `router.js` files, you might need to use some utilities to standardize your responses, handle errors, and manage pagination. The following utilities are available to help you with these tasks.

## Reply

The `reply` utility is used to standardize responses in your application. It provides a consistent structure for success and error messages.

  | Argument | Description                                                                                      |
  | -------- | ------------------------------------------------------------------------------------------------ |
  | status   | A string indicating whether the operation was successful (`'s'` for success or `'e'` for error). |
  | data     | The data to be included in the response.                                                         |

Example:
  ```js
  ctx.body = reply('s', { message: 'Operation successful!' });
  ctx.status = 200;
  ```


## Paginator Maker

The `paginator` utility is used to manage pagination in your application, allowing you to return a subset of results based on specified limits and offsets.

  | Argument | Description                             |
  | -------- | --------------------------------------- |
  | data     | The array of data to paginate.          |
  | page     | The current page number.                |
  | limit    | The number of items to return per page. |

Example:
  ```js
  const paginatedResults = paginator(dataArray, currentPage, itemsPerPage);
  ctx.body = reply('s', { results: paginatedResults });
  ctx.status = 200;
  ```

## Auth Middleware
Authentication middleware that checks for a valid token in the Authorization header of incoming requests.

| Argument | Description                                        |
| -------- | -------------------------------------------------- |
| ctx      | The Koa context object.                            |
| next     | The Koa next function to call the next middleware. |

Example:
```javascript
const Router = require('koa-router');
const { auth } = require('@modular-rest/server');

const router = new Router();

// Example route with auth middleware
router.post('/protected', auth, async (ctx) => {
  ctx.body = 'This is a protected route';
});
```
