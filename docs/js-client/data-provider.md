# DataProvider Service Documentation

The DataProvider service is a singleton class that provides methods for interacting with a database through HTTP requests. It offers various operations such as finding, updating, inserting, and aggregating data.

To use the DataProvider service, import it as follows:

```typescript
import { dataProvider } from '@modular-rest/client'
```

## `list()`

Returns an object containing pagination information and controller methods for fetching paginated data.

### Arguments

| Name             | Type          | Description                                     |
| ---------------- | ------------- | ----------------------------------------------- |
| findOption       | FindQueryType | Query options for finding data                  |
| paginationOption | Object        | Options for pagination (limit, page, onFetched) |

### Returns/Throws

| Type                       | Description                                     |
| -------------------------- | ----------------------------------------------- |
| `PaginatedResponseType<T>` | Object with pagination info and control methods |
| Error                      | Throws if the HTTP request fails                |

### Example

```typescript
// Initialize a paginated list of red flowers
const flowerList = dataProvider.list<Flower>(
  {
    database: 'botany',
    collection: 'flowers',
    query: { color: 'red' }
  },
  { limit: 20, page: 1, onFetched: (flowers) => console.log(flowers) }
);

// Need Update pagination after initialization
await flowerList.updatePagination();

// Fetch the first page
await flowerList.fetchPage(1);
```

## `find()`

Retrieves an array of documents from the specified database and collection.

### Arguments

| Name    | Type          | Description                    |
| ------- | ------------- | ------------------------------ |
| options | FindQueryType | Query options for finding data |

### Returns/Throws

| Type                | Description                             |
| ------------------- | --------------------------------------- |
| `Promise<Array<T>>` | Resolves to an array of found documents |
| Error               | Throws if the HTTP request fails        |

### Example

```typescript
const cities = await dataProvider.find<City>({
  database: 'geography',
  collection: 'cities',
  query: { population: { $gt: 1000000 } },
  options: { limit: 10, sort: { population: -1 } }
});
```

## `findByIds()`

Retrieves documents by their IDs from the specified database and collection.

### Arguments

| Name    | Type               | Description                          |
| ------- | ------------------ | ------------------------------------ |
| options | FindByIdsQueryType | Options for finding documents by IDs |

### Returns/Throws

| Type                | Description                             |
| ------------------- | --------------------------------------- |
| `Promise<Array<T>>` | Resolves to an array of found documents |
| Error               | Throws if the HTTP request fails        |

### Example

```typescript
const specificCities = await dataProvider.findByIds<City>({
  database: 'geography',
  collection: 'cities',
  ids: ['city123', 'city456', 'city789'],
  accessQuery: { country: 'USA' }
});
```

## `findOne()`

Retrieves a single document from the specified database and collection.

### Arguments

| Name    | Type          | Description                                 |
| ------- | ------------- | ------------------------------------------- |
| options | FindQueryType | Query options for finding a single document |

### Returns/Throws

| Type         | Description                      |
| ------------ | -------------------------------- |
| `Promise<T>` | Resolves to the found document   |
| Error        | Throws if the HTTP request fails |

### Example

```typescript
const capital = await dataProvider.findOne<City>({
  database: 'geography',
  collection: 'cities',
  query: { isCapital: true, country: 'France' }
});
```

## `count()`

Counts the number of documents matching the specified query.

### Arguments

| Name    | Type          | Description                          |
| ------- | ------------- | ------------------------------------ |
| options | FindQueryType | Query options for counting documents |

### Returns/Throws

| Type              | Description                                 |
| ----------------- | ------------------------------------------- |
| `Promise<number>` | Resolves to the count of matching documents |
| Error             | Throws if the HTTP request fails            |

### Example

```typescript
const roseCount = await dataProvider.count({
  database: 'botany',
  collection: 'flowers',
  query: { genus: 'Rosa' }
});
```

## `updateOne()`

Updates a single document in the specified database and collection.

### Arguments

| Name    | Type            | Description                                       |
| ------- | --------------- | ------------------------------------------------- |
| options | UpdateQueryType | Query and update options for modifying a document |

### Returns/Throws

| Type           | Description                                    |
| -------------- | ---------------------------------------------- |
| `Promise<any>` | Resolves to the result of the update operation |
| Error          | Throws if the HTTP request fails               |

### Example

```typescript
const updateResult = await dataProvider.updateOne({
  database: 'geography',
  collection: 'cities',
  query: { name: 'New York' },
  update: { $set: { population: 8500000 } }
});
```

## `insertOne()`

Inserts a single document into the specified database and collection.

### Arguments

| Name    | Type            | Description                          |
| ------- | --------------- | ------------------------------------ |
| options | InsertQueryType | Options for inserting a new document |

### Returns/Throws

| Type           | Description                                    |
| -------------- | ---------------------------------------------- |
| `Promise<any>` | Resolves to the result of the insert operation |
| Error          | Throws if the HTTP request fails               |

### Example

```typescript
const newFlower = await dataProvider.insertOne({
  database: 'botany',
  collection: 'flowers',
  doc: { name: 'Sunflower', genus: 'Helianthus', color: 'yellow' }
});
```

## `removeOne()`

Removes a single document from the specified database and collection.

### Arguments

| Name    | Type          | Description                           |
| ------- | ------------- | ------------------------------------- |
| options | FindQueryType | Query options for removing a document |

### Returns/Throws

| Type           | Description                                    |
| -------------- | ---------------------------------------------- |
| `Promise<any>` | Resolves to the result of the remove operation |
| Error          | Throws if the HTTP request fails               |

### Example

```typescript
const removeResult = await dataProvider.removeOne({
  database: 'geography',
  collection: 'cities',
  query: { name: 'Ghost Town', population: 0 }
});
```

## `aggregate()`

Performs an aggregation operation on the specified database and collection.

### Arguments

| Name    | Type               | Description                          |
| ------- | ------------------ | ------------------------------------ |
| options | AggregateQueryType | Options for the aggregation pipeline |

### Returns/Throws

| Type                | Description                               |
| ------------------- | ----------------------------------------- |
| `Promise<Array<T>>` | Resolves to the result of the aggregation |
| Error               | Throws if the HTTP request fails          |

### Example

```typescript
const flowerStats = await dataProvider.aggregate<FlowerStats>({
  database: 'botany',
  collection: 'flowers',
  pipelines: [
    { $group: { _id: '$color', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ],
  accessQuery: { genus: { $in: ['Rosa', 'Tulipa'] } }
});
```