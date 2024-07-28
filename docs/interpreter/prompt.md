Read `./packages/server/src/index.js` file and generate documentation for the utilities mentioned in below list:

Include list with page name:
// page: database.md 
- getCollection,
  
// page: file.md
- getFile,
- getFileLink,
- getFilePath,
- removeFile,
- storeFile,

// page: middleware.md
- middleware,

// page: user-manager.md
- userManager: userManager.main,
  
// end of the list

Basic template for each utility doc:
- Title
- Description
- Arg table
- Example

Basic template for each page:
- Title with # heading
- Description with no heading
- List of utilities with ## heading

Considerations
- to generate the doc you need to read find the utility code, just follow where they imported into the index.js.
- for each utility show how should import the utility in the code, they should be imported by require from `@modular-rest/server` module.
- save each page in `./docs/server-client/utility/[page-name].md` folder with the name of the page.