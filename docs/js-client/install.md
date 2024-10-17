# Javascript Client
Thank you for choosing `modular-rest` to build your app. You can install the client by installing the package from npm.

## Install Client App
it assumed you already have a fronted project based on javascript, it dose not matter what framework you are using, you can use `modular-rest` with any javascript framework.

Just use below command:
::: code-group
```sh [npm]
npm install @modular-rest/client
```

```sh [yarn]
yarn add @modular-rest/client
```
:::

## Setup the client
You need to setup the global configuration for the client in any initialization file of your project, for example in `src/index.js` file.

```js
import { GlobalOptions } from "@modular-rest/client";

GlobalOptions.set({
	// the base url of the server, it should match with the server address
	host: 'http://localhost:8080',
});

```

## Use the client
Now you can use the client in your project, for example to use the `AuthService` service, import it as follows:

```js
import { authentication, dataProvider } from '@modular-rest/client';

// first login with any available methods.
authentication.loginWithLastSession()

// After login, you can use either the dataProvider service or other available services of the client.
const cities = await dataProvider.find<City>({
  database: 'geography',
  collection: 'cities',
  query: { population: { $gt: 1000000 } },
  options: { limit: 10, sort: { population: -1 } }
});

```