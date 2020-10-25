const fs = require('file-system');
const pathModule = require('path');
const DataProvider = require('./../data_provider/service')

const directory = pathModule.join(__dirname, 'uploads');

/**
 * 
 * @param {string} fileType 
 * 
 * @returns storedFile
 * @returns storedFile.fileName
 * @returns storedFile.directory
 * @returns storedFile.fullPath
 */
function createStoredDetail(fileType) {

  let time = new Date().getTime();
  let fileFormat = fileType.split('/')[1];
  let fileName = `${time}.${fileFormat}`;
  let fullPath = pathModule.join(directory, fileName);

  return { fileName, fullPath, directory };
}


/**
 * 
 * @param args
 * @param {file} args.file file object
 * @param {string} args.ownerId file object
 */
function storeFile({ file, ownerId }) {

  let storedFile;

  return new Promise(async (done, reject) =>
  /**
   * Store file and remove temp file
   */ {

    storedFile = createStoredDetail(file.type);

    fs.copyFile(file.path, storedFile.fullPath, {
      done: (err) => {
        if (err) reject(err);
        else done();

        // remove temp file
        fs.fs.unlinkSync(file.path);
      }
    });
  })
    /**
     * Submit file detail into database
     */
    .then(() => {

      // Get collection model for access to relative collection
      let CollectionModel = DataProvider.getCollection('cms', 'file');

      // Create new document
      let doc = new CollectionModel({
        owner: ownerId,
        fileName: storedFile.fileName,
        originalName: file.name,
      });

      return doc.save().then(() => doc);

    }).catch(err => {

      // remove stored file 
      fs.fs.unlinkSync(storedFile.fullPath);

      throw err;
    })
}

function removeFromDisc(path) {
  return new Promise((done, reject) => {
    fs.fs.unlink(path, (err) => {
      if (err) reject()
      else done()
    });
  })
}

function removeFile(fileId) {
  let CollectionModel = DataProvider.getCollection('cms', 'file');

  return new Promise(async (done, reject) => {

    let fileDoc = await CollectionModel.findOne({ _id: fileId }).exec();

    if (!fileDoc) {
      reject('file not found');
      return;
    }

    await CollectionModel.deleteOne({ _id: fileId }).exec()
      .then(() => {

        // create file path
        let filePath = pathModule.join(directory, fileDoc.fileName);

        // Remove file from disc
        return removeFromDisc(filePath)
          .catch(async (err) => {

            // Recreate fileDoc if removing file operation has error 
            await new CollectionModel(fileDoc).save();

            throw err;
          })

      })
      .then(done)
      .catch(reject)
  })
}

module.exports = {
  storeFile,
  removeFile
}