# File Utilities

Contains utilities related to file operations, facilitating the management and accessibility of files within the application.

## getFile
Retrieves a file from the database based on its ID.


| Argument | Description                        |
| -------- | ---------------------------------- |
| fileId   | The ID of the file to be retrieved |

Example:
```javascript
const { getFile } = require('@modular-rest/server');
const file = await getFile('fileId');
```

## getFileLink
Generates a public link to access a specified file.


| Argument | Description                             |
| -------- | --------------------------------------- |
| fileId   | The ID of the file to get the link for. |

Example:
```javascript
const { getFileLink } = require('@modular-rest/server');
const link = await getFileLink('fileId');
```

## getFilePath
Returns the full path of a file based on its ID.

| Argument | Description                                       |
| -------- | ------------------------------------------------- |
| fileId   | The ID of the file whose path is being requested. |

Example:
```javascript
const { getFilePath } = require('@modular-rest/server');
const path = await getFilePath('fileId');
```

## removeFile
Removes the specified file from the database and the disk.

| Argument | Description                       |
| -------- | --------------------------------- |
| fileId   | The ID of the file to be removed. |

Example:
```javascript
const { removeFile } = require('@modular-rest/server');
await removeFile('fileId');
```

## storeFile
Stores the provided file in the designated storage area. (Details to be filled based on the implementation.)

| Argument | Description            |
| -------- | ---------------------- |
| file     | The file to be stored. |

Example:
```javascript
const { storeFile } = require('@modular-rest/server');
await storeFile(file);
```
