# Custom Route
In modular rest you have still the traditional way to create a route, by creating a `router.js` file in your module directory. This file should export below properties and will be taken automatically by the modular rest on the startup.

- `name`: the name of the route, mostly same as the module name.
- `main`: the main router object.

Note: route system is based on [koa-router](https://github.com/koajs/router/blob/master/API.md) package which is a plugin for express.js framework.

## Example
Assume you have a module named `flowers` and you want to create a list/id route for it. You can create a `router.js` file in the `modules/flowers` directory with the following content:

```js
let Router = require('koa-router');
let name = 'flowers';

const flowerRouter = new Router();

flowerRouter.get('/list', (ctx) => {
	ctx.body = 'This is a list of flowers: Rose, Lily, Tulip';
});

flowerRouter.post('/:id', (ctx) => {
	const id = ctx.params.id;
	ctx.body = `Request Body: ${JSON.stringify(ctx.request.body)} and id: ${id}`;
    
})

module.exports.name = name;
module.exports.main = flowerRouter;
```

Now you can access your apis by sending a request to the following urls:
- `GET http://localhost:80/flowers/list`
- `POST http://localhost:80/flowers/1`



