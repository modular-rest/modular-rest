## Install 
It assumed that you have initialized a project with npm, then install modular-rest by using this command. 
```sh
npm i modular-rest --save
```
Now to work with modular-rest you need an `app.js or index.js` or your main app file with a folder called `routers` for putting route files in it.

Put these lines in app.js file

```js
const modularRest = require('modular-rest');

let option = {
    root: require('path').join(__dirname, 'routers'),
};

modularRest.createRest(option).then(app => {
    // do something
});
```

Now we want to create a search module witch has a router file:
1. go to `routers` folder and create a subfolder called `search`. 
2. go to `search` folder and create a `route.js` file, then put these lines in it.

```js
let Router = require('koa-router');
let name = 'search';

let search = new Router();
search.get('/', (ctx) => {
    ctx.body = 'send me a post request';
});

search.post('/', (ctx) => {
    ctx.body = `Request Body: ${JSON.stringify(ctx.request.body)}`;
})

module.exports.name = name;
module.exports.main = search;
```

Well done, lets test it, serve your app with this command
``` terminal
node app.js
```

Send a post request to this address
```
http://localhost:80/search
```

thank you for using Modular-Rest :)
