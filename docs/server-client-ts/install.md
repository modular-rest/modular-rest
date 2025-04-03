# Install Server App
Thank you for choosing `modular-rest` to build your app. You can install the server app in two ways:

## 1. Create a new project
In this way, you can create a new project with `modular-rest` server app. it will create a new folder with your project name and setup the project for you.

Just use below command:
::: code-group
```sh [npm]
npm create @modular-rest/server@latest my-project
```

```sh [yarn]
yarn create @modular-rest/server my-project
```
:::

And now you can start your project with below commands:
```sh
cd my-project
npm install
npm start
```

## 2. Add modular-rest server client to your project
It assumed that you have initialized a project with npm, then use below command to install modular-rest server client.
::: code-group
```sh [npm]
npm i @modular-rest/server --save
```

```sh [yarn]
yarn add @modular-rest/server
```
:::

Now you can use modular-rest server client in your project.

<!--@include: @/server-client-ts/generative/functions/createRest.md#example-->