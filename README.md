# Modular-Rest
a nodejs module based on KOAJS for developing Rest-APIs in a modular solution. 
- modular-rest is only for developing rest api, and is not based on MVC.
- each route would be a module in this system. you can define your base routes on difrent folders then the Modular-Rest would combine all routes to main app object.

## Install 

Install using [npm](https://www.npmjs.com/package/modular-rest):

```sh
npm i modular-rest --save
```

## how it works

to work with modular-rest you need an `app.js` and a `routers` folder. then configuring `app.js` and put your each router as a subfolder into the `routers` folder.


### configuring `app.js`
simple configuration of `app.js` with `koa-router` module.

```js
const mRest = require('modular-rest');
let koaBody = require('koa-body');

let option = {
    root: require('path').join(__dirname, 'routers'),
    onInit: Init,
    onAfterInit: AfterInit,
    port: 80,
};

function Init(app){
    app.use(koaBody());
}

function AfterInit() {
  // do something
}

mRest(option);
```

### configuring a route
1. go to `routers` folder and create a subfolder called `search` folder. 
2. go to `search` folder and create a `route.js` file, then put these lines into it.

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
