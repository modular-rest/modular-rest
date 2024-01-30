# Database
In Modular-rest you have mongodb database support out of the box. you just need to define your data models in `db.js` files. they have to be located in modules directory. for example if you have a module named `user` you have to create a file named `db.js` in `modules/user` directory.

## Define a Collection
To have any collection in your database you have to define it in `db.js` file by using `CollectionDefinition` class. this class has a constructor that takes all the options the collection needs.

```js
const { CollectionDefinition } = require('modular-rest/server');

module.exports = [
	new CollectionDefinition({
		db: 'users',
		name: 'info',
		#schema: Schema,
		#permissions: Permission[]
		#trigger: DatabaseTrigger[]
	})
]
```

## Schema
You can define a schema for your collection by passing a mongoose schema to `schema` option.

```js
const { Schema } = require('modular-rest/server');

const userSchema = new Schema({
	name: String,
	age: Number
});
```

## Permissions
Permissions are used to define access control for your collection. you can define permissions by passing an array of `Permission` objects to `permissions` option.

**Note**: Currently permissions are only 3 types: `god_access`, `user_access` and `anonymous_access`.

```js
const { Permission } = require('modular-rest/server');

const userPermissions = [
	new Permission({
		new Permission({
			type: PermissionTypes.god_access,
			read: true,
			write: true,
		}),
		new Permission({
			type: PermissionTypes.user_access,
			read: true,
			write: true,
			onlyOwnData: true,
		}),
		new Permission({
			type: PermissionTypes.anonymous_access,
			read: true,
		}),
	})
];
```

## Triggers
Triggers are used to define some actions that should be done when some events happen. for example you can define a trigger to send an email to user when a new user is created. you can define triggers by passing an array of `DatabaseTrigger` objects to `triggers` option.

```js
const { DatabaseTrigger } = require('modular-rest/server');

const userTriggers = [
	new DatabaseTrigger('insert-one',
		(data) => {
			// send email to user
		}
	})
];
```

Supported triggers are:

| Trigger      | Description                                                  |
| ------------ | ------------------------------------------------------------ |
| `find`       | Triggered when a find query is executed on collection.       |
| `find-one`   | Triggered when a find one query is executed on collection.   |
| `count`      | Triggered when a count query is executed on collection.      |
| `update-one` | Triggered when a update one query is executed on collection. |
| `insert-one` | Triggered when a insert one query is executed on collection. |
| `remove-one` | Triggered when a remove one query is executed on collection. |
| `aggregate`  | Triggered when a aggregate query is executed on collection.  |
