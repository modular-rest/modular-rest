import fs from 'fs';
import pathModule from 'path';
import * as DataProvider from '../data_provider/service';
import triggerService from '../../class/trigger_operator';
import { config } from '../../config';
import { IFile } from '../../class/db_schemas';

/**
 * Service name constant
 * @constant {string}
 */
export const name = 'file';

/**
 * File storage detail interface
 * @interface StoredFileDetail
 * @property {string} fileName - Generated unique filename
 * @property {string} fullPath - Full path to the stored file
 * @property {string} fileFormat - File format/extension
 */
interface StoredFileDetail {
  fileName: string;
  fullPath: string;
  fileFormat: string;
}

/**
 * File upload options interface
 * @interface StoreFileOptions
 * @property {Object} file - File details
 * @property {string} file.path - Temporary file path
 * @property {string} file.type - MIME type of the file
 * @property {string} file.name - Original filename
 * @property {number} file.size - File size in bytes
 * @property {string} ownerId - ID of the file owner
 * @property {string} tag - Tag for file organization
 * @property {boolean} [removeFileAfterStore=true] - Whether to remove the temporary file after storage
 */
interface StoreFileOptions {
  file: {
    path: string;
    type: string;
    name: string;
    size: number;
  };
  ownerId: string;
  tag: string;
  removeFileAfterStore?: boolean;
}

/**
 * File service for handling file storage and retrieval
 * @class FileService
 * @description
 * This service provides functionality for storing, retrieving, and managing files.
 * It handles file storage on disk and maintains file metadata in the database.
 * Files are organized by format and tag in the upload directory.
 *
 * @example
 * ```typescript
 * // Set up upload directory
 * main.setUploadDirectory('/path/to/uploads');
 *
 * // Store a file
 * const file = await main.storeFile({
 *   file: {
 *     path: '/tmp/upload.jpg',
 *     type: 'image/jpeg',
 *     name: 'profile.jpg',
 *     size: 1024
 *   },
 *   ownerId: 'user123',
 *   tag: 'profile'
 * });
 *
 * // Get file link
 * const link = await main.getFileLink(file._id);
 * ```
 */
class FileService {
  private directory: string | null = null;
  static instance: FileService;

  constructor() {}

  /**
   * Sets the upload directory for file storage
   * @param {string} directory - Directory path for file storage
   * @throws {Error} If directory is invalid or not writable
   * @example
   * ```typescript
   * main.setUploadDirectory('/path/to/uploads');
   * ```
   */
  setUploadDirectory(directory: string): void {
    if (!fs.existsSync(directory)) {
      fs.mkdirSync(directory, { recursive: true });
    }
    this.directory = directory;
  }

  /**
   * Creates stored file details with unique filename
   * @param {string} fileType - MIME type of the file
   * @param {string} tag - Tag for file organization
   * @returns {StoredFileDetail} Storage details including filename and path
   * @throws {Error} If upload directory is not set
   * @example
   * ```typescript
   * const details = main.createStoredDetail('image/jpeg', 'profile');
   * // Returns: { fileName: '1234567890.jpeg', fullPath: '/uploads/jpeg/profile/1234567890.jpeg', fileFormat: 'jpeg' }
   * ```
   */
  createStoredDetail(fileType: string, tag: string): StoredFileDetail {
    const typeParts = fileType.split('/');
    const fileFormat = typeParts[1] || typeParts[0] || 'unknown';

    const time = new Date().getTime();
    const fileName = `${time}.${fileFormat}`;

    if (!FileService.instance.directory) {
      throw new Error('Upload directory has not been set');
    }

    const fullPath = pathModule.join(FileService.instance.directory, fileFormat, tag, fileName);

    return { fileName, fullPath, fileFormat };
  }

  /**
   * Stores a file, removes the temporary file, and saves metadata to database
   * @param {StoreFileOptions} options - File storage options
   * @returns {Promise<IFile>} Promise resolving to stored file document
   * @throws {Error} If upload directory is not set or storage fails
   * @example
   * ```typescript
   * const file = await main.storeFile({
   *   file: {
   *     path: '/tmp/upload.jpg',
   *     type: 'image/jpeg',
   *     name: 'profile.jpg',
   *     size: 1024
   *   },
   *   ownerId: 'user123',
   *   tag: 'profile',
   *   removeFileAfterStore: true
   * });
   * ```
   */
  storeFile({ file, ownerId, tag, removeFileAfterStore = true }: StoreFileOptions): Promise<IFile> {
    if (!FileService.instance.directory) {
      throw new Error('Upload directory has not been set');
    }

    let storedFile: StoredFileDetail;

    return new Promise(async (done, reject) => {
      storedFile = FileService.instance.createStoredDetail(file.type, tag);

      fs.copyFile(file.path, storedFile.fullPath, (err: Error | null) => {
        if (err) {
          reject(err);
        } else {
          done(null);
        }

        // remove temp file
        if (removeFileAfterStore) {
          fs.unlinkSync(file.path);
        }
      });
    })
      .then(() => {
        // Get collection model for access to relative collection
        const CollectionModel = DataProvider.getCollection<IFile>('cms', 'file');

        if (!CollectionModel) {
          throw new Error('Collection model not found');
        }

        const data = {
          owner: ownerId,
          fileName: storedFile.fileName,
          originalName: file.name,
          format: storedFile.fileFormat,
          tag,
          size: file.size,
        };

        // Create new document
        const doc = new CollectionModel(data);

        return doc.save().then(savedDoc => {
          triggerService.call('insert-one', 'cms', 'file', {
            query: null,
            queryResult: savedDoc,
          });

          return savedDoc;
        });
      })
      .catch(err => {
        // remove stored file
        fs.unlinkSync(storedFile.fullPath);

        throw err;
      });
  }

  /**
   * Removes a file from the disk
   * @param {string} path - File path to remove
   * @returns {Promise<void>} Promise resolving when file is removed
   * @throws {Error} If file removal fails
   * @example
   * ```typescript
   * await main.removeFromDisc('/uploads/jpeg/profile/1234567890.jpeg');
   * ```
   */
  removeFromDisc(path: string): Promise<void> {
    return new Promise((done, reject) => {
      fs.unlink(path, (err: Error | null) => {
        if (err) reject(err);
        else done();
      });
    });
  }

  /**
   * Removes a file from both database and disk
   * @param {string} fileId - File ID to remove
   * @returns {Promise<void>} Promise resolving when file is removed
   * @throws {Error} If file is not found or removal fails
   * @example
   * ```typescript
   * try {
   *   await main.removeFile('file123');
   *   console.log('File removed successfully');
   * } catch (error) {
   *   console.error('Failed to remove file:', error);
   * }
   * ```
   */
  removeFile(fileId: string): Promise<void> {
    if (!FileService.instance.directory) {
      throw new Error('Upload directory has not been set');
    }

    return new Promise(async (done, reject) => {
      const CollectionModel = DataProvider.getCollection<IFile>('cms', 'file');

      if (!CollectionModel) {
        return reject(new Error('Collection model not found'));
      }

      const fileDoc = await CollectionModel.findOne({ _id: fileId }).exec();

      if (!fileDoc) {
        return reject(new Error('File not found'));
      }

      await CollectionModel.deleteOne({ _id: fileId })
        .exec()
        .then(() => {
          // create file path
          const filePath = pathModule.join(
            FileService.instance.directory as string,
            fileDoc.format,
            fileDoc.tag,
            fileDoc.fileName
          );

          // Remove file from disc
          return FileService.instance.removeFromDisc(filePath).catch(async err => {
            // Recreate fileDoc if removing file operation has error
            await new CollectionModel(fileDoc).save();

            throw err;
          });
        })
        .then(() => {
          triggerService.call('remove-one', 'cms', 'file', {
            query: { _id: fileId },
            queryResult: null,
          });
        })
        .then(done)
        .catch(reject);
    });
  }

  /**
   * Retrieves a file document from the database
   * @param {string} fileId - File ID to retrieve
   * @returns {Promise<IFile>} Promise resolving to file document
   * @throws {Error} If collection model is not found or file is not found
   * @example
   * ```typescript
   * const fileDoc = await main.getFile('file123');
   * console.log('File details:', fileDoc);
   * ```
   */
  getFile(fileId: string): Promise<IFile> {
    const CollectionModel = DataProvider.getCollection<IFile>('cms', 'file');

    if (!CollectionModel) {
      throw new Error('Collection model not found');
    }

    return CollectionModel.findOne({ _id: fileId })
      .exec()
      .then(doc => {
        if (!doc) {
          throw new Error('File not found');
        }
        return doc;
      });
  }

  /**
   * Retrieves the public URL link for a file
   * @param {string} fileId - File ID to get link for
   * @returns {Promise<string>} Promise resolving to file URL
   * @throws {Error} If static path root is not defined or file is not found
   * @example
   * ```typescript
   * const link = await main.getFileLink('file123');
   * // Returns: '/static/jpeg/profile/1234567890.jpeg'
   * ```
   */
  async getFileLink(fileId: string): Promise<string> {
    const fileDoc = await FileService.instance.getFile(fileId);

    if (!config.staticPath?.actualPath) {
      throw new Error('Static path root is not defined');
    }

    const link =
      config.staticPath.actualPath + `/${fileDoc.format}/${fileDoc.tag}/` + fileDoc.fileName;

    return link;
  }

  /**
   * Gets the full filesystem path for a file
   * @param {string} fileId - File ID to get path for
   * @returns {Promise<string>} Promise resolving to full file path
   * @throws {Error} If upload directory is not set or file is not found
   * @example
   * ```typescript
   * const path = await main.getFilePath('file123');
   * // Returns: '/uploads/jpeg/profile/1234567890.jpeg'
   * ```
   */
  async getFilePath(fileId: string): Promise<string> {
    const { fileName, format, tag } = await FileService.instance.getFile(fileId);

    if (!FileService.instance.directory) {
      throw new Error('Upload directory has not been set');
    }

    return pathModule.join(FileService.instance.directory, format, tag, fileName);
  }
}

/**
 * Main file service instance
 * @constant {FileService}
 */
export const main = new FileService();
