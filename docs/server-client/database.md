# Database
In Modular-rest you have mongodb database support out of the box. you just need to define your data models in `db.js` files. they have to be located in modules directory. for example if you have a module named `user` you have to create a file named `db.js` in `modules/user` directory.

## Define a Collection
To have any collection in your database you have to define it in `db.js` file by using `CollectionDefinition` class. this class has a constructor that takes all the options the collection needs.

```js
const { CollectionDefinition } = require('@modular-rest/server');

module.exports = [
	new CollectionDefinition({
		db: 'users',
		name: 'info',
		// schema: Schema,
		// permissions: Permission[]
		// trigger: DatabaseTrigger[]
	})
]
```

## Schema
You can define a schema for your collection by passing a mongoose schema to `schema` option.

```js
const { Schema } = require('@modular-rest/server');

const userSchema = new Schema({
	name: String,
	age: Number
});
```

### File Schema
Modular-rest has a predefined file schema that you it is necessary to use this schema if your collection needs to store files.

**Note**: Modular-rest does not put the file in database. it just put the file in the `upload directory` and put the file information in database. 

```js
const { Schemas } = require('@modular-rest/server');

const userSchema = new Schema({
	name: String,
	age: Number,

	// Added this file to the parent schema
	avatar: Schemas.file
});
```


## Permissions
Permissions are used to define access control for your collection. you can define which kind of permissions type user must have to access your collection. to define permissions you just need to passing an array of `Permission` objects to `permissions` property of `CollectionDefinition` class.


| Permission Type      | Description                                             |
| -------------------- | ------------------------------------------------------- |
| `god_access`         | A flag that give should be used for super admin access. |
| `user_access`        | A flag that give should be used for user access.        |
| `upload_file_access` | A flag that is needed for upload file access.           |
| `remove_file_access` | A flag that is needed for remove file access.           |
| `anonymous_access`   | A flag that give should be used for anonymous access.   |


```js
const { Permission } = require('@modular-rest/server');

const userPermissions = [
	new Permission({
		new Permission({
			type: 'god_access',
			read: true,
			write: true,
		}),
		new Permission({
			type: 'user_access',
			read: true,
			write: true,
			onlyOwnData: true,
		}),
		new Permission({
			type: 'anonymous_access',
			read: true,
		}),
	})
];
```

## Triggers
Triggers are used to define some actions that should be done when some events happen. for example you can define a trigger to send an email to user when a new user is created. you can define triggers by passing an array of `DatabaseTrigger` objects to `triggers` option.

```js
const { DatabaseTrigger } = require('@modular-rest/server');

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


## Linking Collections
You can link any collection from same database into an schema to perform `populate queries`, but let me tell you what it is simply:

`Populate query` is a query that you can use to get data from linked collections. for example if you have a collection named `user` and you have a collection named `post` that each post has an author. you can link `user` collection into `post` collection and then you can use populate query to get author of each post, it you the user data in author field of each post.

More info on [populate queries](https://mongoosejs.com/docs/5.x/docs/populate.html).

```js
const { Schema } = require('@modular-rest/server');

const userSchema = new Schema({
	name: String,
	age: Number
});

const postSchema = new Schema({
	title: String,
	content: String,
	author: {
		type: Schema.Types.ObjectId,
		ref: 'user'
	}
});
```

## Full Example
Let's see a full example of `db.js` file:

```js
const { Schema, Schemas, CollectionDefinition, Permission, DatabaseTrigger } = require('@modular-rest/server');

const userSchema = new Schema({
	name: String,
	age: Number,

	// Added this file to the parent schema
	avatar: Schemas.file
});

const postSchema = new Schema({
	title: String,
	content: String,
	author: {
		type: Schema.Types.ObjectId,
		ref: 'user'
	}
});

const userPermissions = [
	new Permission({
		new Permission({
			type: 'god_access',
			read: true,
			write: true,
		}),
		new Permission({
			type: 'user_access',
			read: true,
			write: true,
			onlyOwnData: true,
		}),
		new Permission({
			type: 'anonymous_access',
			read: true,
		}),
	})
];

const userTriggers = [
	new DatabaseTrigger('insert-one',
		(data) => {
			// send email to user
		}
	})
];

module.exports = [
	new CollectionDefinition({
		db: 'user',
		name: 'info',
		schema: userSchema,
		permissions: userPermissions,
		trigger: userTriggers
	}),
	new CollectionDefinition({
		db: 'user',
		name: 'post',
		schema: postSchema,
		permissions: userPermissions,
		trigger: userTriggers
	})
]
```
