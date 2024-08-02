# FileProvider Service Documentation

The FileProvider service is responsible for managing file operations such as uploading, removing, and retrieving file information. It provides methods to interact with files on the server and manage file metadata.

To use the FileProvider service, import it as follows:

```javascript
import { fileProvider } from '@modular-rest/client'
```

## `uploadFile()`

Uploads a file to the server.

### Arguments

| Name       | Type                                   | Description                                |
| ---------- | -------------------------------------- | ------------------------------------------ |
| file       | string \| Blob                         | The file to be uploaded                    |
| onProgress | (progressEvent: ProgressEvent) => void | Callback function to track upload progress |
| tag        | string (optional)                      | Tag for the file, defaults to "untagged"   |

### Return and Throw

| Type                    | Description                              |
| ----------------------- | ---------------------------------------- |
| `Promise<FileDocument>` | Resolves with the uploaded file document |
| Error                   | Throws an error if the upload fails      |

### Example

```javascript
const file = new Blob(['Hello, World!'], { type: 'text/plain' });
const onProgress = (event) => console.log(`Upload progress: ${event.loaded / event.total * 100}%`);

fileProvider.uploadFile(file, onProgress, 'documents')
  .then(fileDoc => console.log('Uploaded file:', fileDoc))
  .catch(error => console.error('Upload failed:', error));
```

## `uploadFileToURL()`

Uploads a file to a specific URL.

### Arguments

| Name       | Type                                   | Description                                 |
| ---------- | -------------------------------------- | ------------------------------------------- |
| url        | string                                 | The URL to upload the file to               |
| file       | string                                 | Blob                                        | The file to be uploaded |
| body       | any (optional)                         | Additional data to be sent with the request |
| onProgress | (progressEvent: ProgressEvent) => void | Callback function to track upload progress  |
| tag        | string                                 | Tag for the file                            |

### Return and Throw

| Type           | Description                                |
| -------------- | ------------------------------------------ |
| `Promise<any>` | Resolves with the response from the server |
| Error          | Throws an error if the upload fails        |

### Example

```javascript
const url = 'https://api.example.com/upload';
const file = new Blob(['Flower data'], { type: 'text/plain' });
const body = { category: 'flora' };
const onProgress = (event) => console.log(`Upload progress: ${event.loaded / event.total * 100}%`);

fileProvider.uploadFileToURL(url, file, body, onProgress, 'botanical')
  .then(response => console.log('Upload response:', response))
  .catch(error => console.error('Upload failed:', error));
```

## `removeFile()`

Removes a file from the server.

### Arguments

| Name | Type   | Description                      |
| ---- | ------ | -------------------------------- |
| id   | string | The ID of the file to be removed |

### Return and Throw

| Type           | Description                                |
| -------------- | ------------------------------------------ |
| `Promise<any>` | Resolves with the response from the server |
| Error          | Throws an error if the removal fails       |

### Example

```javascript
const fileId = '123456789';

fileProvider.removeFile(fileId)
  .then(response => console.log('File removed successfully:', response))
  .catch(error => console.error('File removal failed:', error));
```

## `getFileLink()`

Generates a URL for accessing a file.

### Arguments

| Name        | Type                                                | Description                                  |
| ----------- | --------------------------------------------------- | -------------------------------------------- |
| fileDoc     | `{ fileName: string; format: string; tag: string }` | File document object                         |
| overrideUrl | string (optional)                                   | Optional URL to override the default         |
| rootPath    | string (optional)                                   | Root path for the file, defaults to "assets" |

### Return and Throw

| Type   | Description                    |
| ------ | ------------------------------ |
| string | The generated URL for the file |

### Example

```javascript
const fileDoc = {
  fileName: 'city_map.jpg',
  format: 'images',
  tag: 'maps'
};

const fileUrl = fileProvider.getFileLink(fileDoc);
console.log('File URL:', fileUrl);
```

## `getFileDoc()`

Retrieves a file document by its ID and user ID.

### Arguments

| Name   | Type   | Description                          |
| ------ | ------ | ------------------------------------ |
| id     | string | The ID of the file                   |
| userId | string | The ID of the user who owns the file |

### Return and Throw

| Type                    | Description                                          |
| ----------------------- | ---------------------------------------------------- |
| `Promise<FileDocument>` | Resolves with the file document                      |
| Error                   | Throws an error if the file document cannot be found |

### Example

```javascript
const fileId = '987654321';
const userId = 'user123';

fileProvider.getFileDoc(fileId, userId)
  .then(fileDoc => console.log('File document:', fileDoc))
  .catch(error => console.error('Failed to retrieve file document:', error));
```

## `getFileDocsByTag()`

Retrieves file documents by tag and user ID.

### Arguments

| Name   | Type   | Description                           |
| ------ | ------ | ------------------------------------- |
| tag    | string | The tag to search for                 |
| userId | string | The ID of the user who owns the files |

### Return and Throw

| Type                      | Description                                           |
| ------------------------- | ----------------------------------------------------- |
| `Promise<FileDocument[]>` | Resolves with an array of file documents              |
| Error                     | Throws an error if the file documents cannot be found |

### Example

```javascript
const tag = 'flowers';
const userId = 'user456';

fileProvider.getFileDocsByTag(tag, userId)
  .then(fileDocs => console.log('File documents:', fileDocs))
  .catch(error => console.error('Failed to retrieve file documents:', error));
```