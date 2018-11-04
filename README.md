# Modular-Rest
a nodejs module based on KOAJS for developing Rest-APIs in a modular solution. 
- modular-rest is only for developing rest api, and is not based on MVC.
- each route would be a module in this system. you can define your base routes on difrent folders then the Modular-Rest would combine all routes to main app object.

this module has two methods:
- [createRest]: is the main functionality of the module.
- [reply Generator]: is a handy tool to generate structured json as a reply body.

## Install 

Install using [npm](https://www.npmjs.com/package/modular-rest):

```sh
npm i modular-rest --save
```

## use modular-rest [createRest]

to work with modular-rest you need an `app.js` and a `routers` folder. then configuring `app.js` and put your each router as a subfolder into the `routers` folder.


### configuring `app.js`
simple configuration of `app.js` with `koa-router` module.

```js
const modularRest = require('modular-rest');
let koaBody = require('koa-body');

let services = {}; // an object for collecting all other service

let option = {
    root: require('path').join(__dirname, 'routers'),
    onBeforInit: BeforInit, // befor anything
    onInit: Init,           // after collecting routers
    onAfterInit: AfterInit, // affter launch server
    port: 80,

    // if it would be true, app doesn't listen to port,
    // and a raw app object with all routers will be returned.
    // this option is for virtual host middlewares
    dontlisten: false,

    // collecting other services from subfolders
    otherSrvice: [
        {
            filename: {name: 'fn', extension:'.js'},
            rootDirectory: require('path').join(__dirname, 'routers'),
            rootObject: services,
            option: {
                    // if this option woulde be true, the the members of each service will be attached to rootObject
                    // then the name member of each service will be rejected.
                    // it would be useful when you want to collect all mongoose models in one root object.
                    combineWithRoot: false
                }
        }
    ],
};

function BeforInit(app)
{
    // do something
}

function Init(app)
{   
    // use a body parser
    app.use(koaBody());

    // make services to be global
    global.services = services;
}

function AfterInit() {
  // do something
}

modularRest.createRest(option).then(app => {
    // do something
});
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

### Requesting
your search web service is:
```
http://localhost:80/search
```

## generating structured json [replyGenerator]
this tool will generate a simple structure based on 3 type of reply [data, message, error]. each reply has two property: [status, detail];
here is how to generate a reply:
```
const replyGenerator = require('modular-rest').replyGenerator;

// base parameters
replyGenerator(status, detail);

// generate a success state
replyGenerator('s', {'d': ['product1', 'product2']});
/*
    {
        'status': 'success',
        'data'  : ['product1', 'product2'],
    }
*/
```

#### status options
| passing char | result |
| ------------ | ------ |
| s | success |
| f | fail |
| e | error |

#### detail options
| passing char | result |
| ------------ | ------ |
| {d: ''} | {data: ''} |
| {e: ''} | {error: ''} |
| {m: ''} | {message: ''} |

#
thank you for using Modular-Rest :)
