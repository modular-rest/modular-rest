# Install server client
It assumed that you have initialized a project with npm, then use below command to install modular-rest server client.
```sh
npm i @modular-rest/server --save
```
Now you can use modular-rest server client in your project.
```js
const { createRest } = require('@modular-rest/server');

const app = createRest({
    port: '80',
    mongo: {
        mongoBaseAddress: 'mongodb://localhost:27017',
        dbPrefix: 'mrest_'
    },
    onBeforeInit: (koaApp) => {
       // do something before init with the koa app
    }
})
```

## Create a new project
You can use our boilerplate to create a new project with modular-rest server client.
```sh
npm init @modular-rest/server my-project
```
now just start your project with below command:
```sh
cd my-project
npm install
npm start
```