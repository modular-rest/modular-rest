const fs = require("file-system");
const pathModule = require("path");
const DataProvider = require("./../data_provider/service");
const { config } = require("./../../config");

class FileService {
  constructor() {
    this.directory = null;
  }

  setUploadDirectory(directory) {
    this.directory = directory;
  }

  /**
   *
   * @param {string} fileType
   * @param {string} tag
   *
   * @returns storedFile
   * @returns storedFile.fileName
   * @returns storedFile.directory
   * @returns storedFile.fullPath
   * @returns storedFile.fileFormat
   */
  createStoredDetail(fileType, tag) {
    const time = new Date().getTime();
    const fileFormat = fileType.split("/")[1];
    const fileName = `${time}.${fileFormat}`;
    const fullPath = pathModule.join(this.directory, fileFormat, tag, fileName);

    return { fileName, fullPath, fileFormat };
  }

  /**
   * Stores a file, removes the given temporary file, and submits file details into the database.
   *
   * @param {Object} options - The options for storing the file.
   * @param {Object} options.file - The file to be stored.
   * @param {string} options.file.path - The path of the file.
   * @param {string} options.file.type - The type of the file.
   * @param {string} options.file.name - The original name of the file.
   * @param {number} options.file.size - The size of the file.
   * @param {string} options.ownerId - The ID of the owner of the file.
   * @param {string} options.tag - The tag associated with the file.
   * @param {boolean} [options.removeFileAfterStore=true] - Whether to remove the file after storing it.
   *
   * @returns {Promise} A promise that resolves with the document of the stored file.
   *
   * @throws {string} If the upload directory has not been set.
   */
  storeFile({ file, ownerId, tag, removeFileAfterStore = true }) {
    if (!this.directory) throw "upload directory has not been set.";

    let storedFile;

    return (
      new Promise(async (done, reject) => /**
       * Store file and remove temp file
       */ {
        storedFile = this.createStoredDetail(file.type, tag);

        fs.copyFile(file.path, storedFile.fullPath, {
          done: (err) => {
            if (err) reject(err);
            else done();

            // remove temp file
            if (removeFileAfterStore) fs.fs.unlinkSync(file.path);
          },
        });
      })
        /**
         * Submit file detail into database
         */
        .then(() => {
          // Get collection model for access to relative collection
          let CollectionModel = DataProvider.getCollection("cms", "file");

          // Create new document
          let doc = new CollectionModel({
            owner: ownerId,
            fileName: storedFile.fileName,
            originalName: file.name,
            format: storedFile.fileFormat,
            tag,
            size: file.size,
          });

          return doc.save().then(() => doc);
        })
        .catch((err) => {
          // remove stored file
          fs.fs.unlinkSync(storedFile.fullPath);

          throw err;
        })
    );
  }

  /**
   * Removes a file from the disk.
   *
   * @param {string} path - The path of the file to be removed.
   * @returns {Promise} A promise that resolves if the file is successfully removed, and rejects if an error occurs.
   */
  removeFromDisc(path) {
    return new Promise((done, reject) => {
      fs.fs.unlink(path, (err) => {
        if (err) reject();
        else done();
      });
    });
  }

  /**
   * Removes a file from the database and the disk.
   *
   * @param {string} fileId - The ID of the file to be removed.
   * @returns {Promise} A promise that resolves if the file is successfully removed, and rejects if an error occurs.
   * @throws Will throw an error if upload directory has not been set.
   */
  removeFile(fileId) {
    if (!this.directory) throw "upload directory has not been set.";

    return new Promise(async (done, reject) => {
      let CollectionModel = DataProvider.getCollection("cms", "file");
      let fileDoc = await CollectionModel.findOne({ _id: fileId }).exec();

      if (!fileDoc) {
        reject("file not found");
        return;
      }

      await CollectionModel.deleteOne({ _id: fileId })
        .exec()
        .then(() => {
          // create file path
          let filePath = pathModule.join(
            this.directory,
            fileDoc.format,
            fileDoc.tag,
            fileDoc.fileName
          );

          // Remove file from disc
          return this.removeFromDisc(filePath).catch(async (err) => {
            // Recreate fileDoc if removing file operation has error
            await new CollectionModel(fileDoc).save();

            throw err;
          });
        })
        .then(done)
        .catch(reject);
    });
  }

  /**
   * Retrieves a file from the database.
   *
   * @param {string} fileId - The ID of the file to be retrieved.
   * @returns {Promise} A promise that resolves with the file document, or rejects if an error occurs.
   */
  getFile(fileId) {
    const CollectionModel = DataProvider.getCollection("cms", "file");

    return CollectionModel.findOne({ _id: fileId }).exec();
  }

  /**
   * Retrieves the link of a file.
   *
   * @param {string} fileId - The ID of the file to get the link for.
   * @returns {Promise} A promise that resolves with the file link, or rejects if an error occurs.
   */
  async getFileLink(fileId) {
    const fileDoc = await this.getFile(fileId);

    const link =
      config.staticPath.rootPath +
      `/${fileDoc.format}/${fileDoc.tag}/` +
      fileDoc.fileName;

    return link;
  }

  async getFilePath(fileId) {
    const { fileName, format, tag } = await this.getFile(fileId);
    const fullPath = pathModule.join(this.directory, format, tag, fileName);
    return fullPath;
  }
}

FileService.instance = new FileService();
module.exports = FileService.instance;
