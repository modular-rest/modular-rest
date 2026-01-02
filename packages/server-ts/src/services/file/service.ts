import fs from 'fs';
import pathModule from 'path';
import * as DataProvider from '../data_provider/service';
import triggerService from '../../class/trigger_operator';
import { config, StaticPathOptions } from '../../config';
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
 * @property {string} [file.path] - Temporary file path (legacy)
 * @property {string} [file.filepath] - Temporary file path (koa-body v6+)
 * @property {string} [file.type] - MIME type of the file (legacy)
 * @property {string} [file.mimetype] - MIME type of the file (koa-body v6+)
 * @property {string} [file.name] - Original filename (legacy)
 * @property {string} [file.originalFilename] - Original filename (koa-body v6+)
 * @property {number} file.size - File size in bytes
 * @property {string} ownerId - ID of the file owner
 * @property {string} tag - Tag for file organization
 * @property {boolean} [removeFileAfterStore=true] - Whether to remove the temporary file after storage
 */
interface StoreFileOptions {
  file: {
    path?: string;
    filepath?: string;
    type?: string;
    mimetype?: string;
    name?: string;
    originalFilename?: string;
    size: number;
  };
  ownerId: string;
  tag: string;
  removeFileAfterStore?: boolean;
}

/**
 * File service class for handling file operations
 * @class FileService
 * @description
 * This class provides methods for managing file uploads, retrieval, and deletion.
 * It handles physical file storage and database metadata management.
 */
class FileService {
  /**
   * @hidden
   */
  private directory: string | null = null;

  /**
   * @hidden
   */
  private urlPath: string | null = null;

  /**
   * @hidden
   */
  static instance: FileService;

  /**
   * @hidden
   */
  constructor() {}

  /**
   * @hidden
   *
   * Sets the upload directory for file storage
   * @param {string | StaticPathOptions} directoryOrConfig - Directory path for file storage or StaticPathOptions configuration
   * @throws {Error} If directory is invalid or not writable
   * @example
   * ```typescript
   * import { fileService } from '@modular-rest/server';
   *
   * // New format with StaticPathOptions
   * fileService.setUploadDirectory({
   *   directory: '/path/to/uploads',
   *   urlPath: '/assets'
   * });
   *
   * // Legacy format (deprecated)
   * fileService.setUploadDirectory('/path/to/uploads');
   * ```
   */
  setUploadDirectory(directoryOrConfig: string | StaticPathOptions): void {
    // Handle backward compatibility with string
    if (typeof directoryOrConfig === 'string') {
      console.warn(
        '\x1b[33m%s\x1b[0m',
        "Warning: Passing a string to 'setUploadDirectory' is deprecated. Please use StaticPathOptions object instead."
      );
      if (!fs.existsSync(directoryOrConfig)) {
        fs.mkdirSync(directoryOrConfig, { recursive: true });
      }
      this.directory = directoryOrConfig;
      this.urlPath = '/assets'; // Default urlPath for legacy
    } else {
      const { directory, urlPath } = directoryOrConfig;
      if (!fs.existsSync(directory)) {
        fs.mkdirSync(directory, { recursive: true });
      }
      this.directory = directory;
      this.urlPath = urlPath || '/assets';
    }
  }

  /**
   * Creates a unique filename and storage details
   * @param {string} fileType - MIME type of the file
   * @param {string} tag - File tag
   * @returns {StoredFileDetail} Storage details including unique filename and path
   * @hidden
   */
  createStoredDetail(fileType: string, tag: string): StoredFileDetail {
    const typeParts = fileType.split('/');
    const fileFormat = typeParts[1] || typeParts[0] || 'unknown';

    const time = new Date().getTime();
    const fileName = `${time}.${fileFormat}`;

    if (!this.directory) {
      throw new Error('Upload directory not set');
    }

    const fullPath = pathModule.join(this.directory, fileFormat, tag, fileName);

    return {
      fileName,
      fullPath,
      fileFormat,
    };
  }

  /**
   * Stores a file on disc and creates metadata in database
   * @param {StoreFileOptions} options - File storage options
   * @returns {Promise<IFile>} The created file document
   * @throws {Error} If upload directory is not set or storage fails
   * @example
   * ```typescript
   * import { fileService } from '@modular-rest/server';
   *
   * const file = await fileService.storeFile({
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

    const fileType = file.mimetype || file.type || 'unknown/unknown';
    const filePath = file.filepath || file.path;
    const fileName = file.originalFilename || file.name || 'unknown';

    if (!filePath) {
      throw new Error('File path is missing');
    }

    let storedFile: StoredFileDetail;

    return new Promise(async (done, reject) => {
      storedFile = FileService.instance.createStoredDetail(fileType, tag);

      // Ensure destination directory exists
      const destDir = pathModule.dirname(storedFile.fullPath);
      try {
        if (!fs.existsSync(destDir)) {
          fs.mkdirSync(destDir, { recursive: true });
        }
      } catch (err) {
        return reject(err);
      }

      fs.copyFile(filePath, storedFile.fullPath, (err: Error | null) => {
        if (err) {
          reject(err);
        } else {
          done(null);
        }

        // remove temp file
        if (removeFileAfterStore) {
          try {
            if (fs.existsSync(filePath)) {
              fs.unlinkSync(filePath);
            }
          } catch (e) {
            console.warn('Failed to remove temp file:', e);
          }
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
          tag,
          originalName: fileName,
          fileName: storedFile.fileName,
          format: storedFile.fileFormat,
          size: file.size,
        };

        return CollectionModel.create(data);
      })
      .then(async (doc: IFile) => {
        triggerService.call('insert-one', 'cms', 'file', { queryResult: doc });
        return doc;
      });
  }

  /**
   * Deletes a file from disc and database
   * @param {string} fileId - ID of the file to delete
   * @returns {Promise<boolean>} True if deletion was successful
   * @throws {Error} If file is not found or deletion fails
   * @example
   * ```typescript
   * import { fileService } from '@modular-rest/server';
   *
   * await fileService.removeFile('file123');
   * ```
   */
  async removeFile(fileId: string): Promise<boolean> {
    if (!FileService.instance.directory) {
      throw new Error('Upload directory has not been set');
    }

    const CollectionModel = DataProvider.getCollection<IFile>('cms', 'file');

    if (!CollectionModel) {
      throw new Error('Collection model not found');
    }

    const doc = await CollectionModel.findById(fileId);

    if (!doc) {
      throw new Error('File not found');
    }

    const filePath = pathModule.join(
      FileService.instance.directory as string,
      doc.format,
      doc.tag,
      doc.fileName
    );

    if (fs.existsSync(filePath)) {
      try {
        await FileService.instance.removeFromDisc(filePath);
      } catch (err: any) {
        // If the file is not found on disc, we can still proceed with deleting metadata
        if (err.code !== 'ENOENT') {
          throw err;
        }
      }
    }

    await CollectionModel.findByIdAndDelete(fileId);
    triggerService.call('remove-one', 'cms', 'file', { queryResult: doc });
    return true;
  }

  /**
   * Deletes a file from physical storage
   * @param {string} path - Physical path to the file
   * @returns {Promise<boolean>} True if deletion was successful
   * @hidden
   */
  removeFromDisc(path: string): Promise<boolean> {
    return new Promise((done, reject) => {
      fs.unlink(path, err => {
        if (err) {
          reject(err);
        } else {
          done(true);
        }
      });
    });
  }

  /**
   * Retrieves a file document from database
   * @param {string} fileId - ID of the file
   * @returns {Promise<IFile>} The file document
   * @throws {Error} If file is not found
   * @hidden
   */
  async getFile(fileId: string): Promise<IFile> {
    const CollectionModel = DataProvider.getCollection<IFile>('cms', 'file');

    if (!CollectionModel) {
      throw new Error('Collection model not found');
    }

    const doc = await CollectionModel.findById(fileId);

    if (!doc) {
      throw new Error('File not found');
    }

    return doc;
  }

  /**
   * Gets the public URL for a file
   * @param {string} fileId - ID of the file
   * @returns {Promise<string>} The public URL
   * @example
   * ```typescript
   * import { fileService } from '@modular-rest/server';
   *
   * const url = await fileService.getFileLink('file123');
   * // Returns: '/assets/jpeg/profile/1234567890.jpeg'
   * ```
   */
  async getFileLink(fileId: string): Promise<string> {
    const fileDoc = await FileService.instance.getFile(fileId);

    if (!FileService.instance.urlPath) {
      throw new Error('Upload directory config has not been set');
    }

    const link = `${FileService.instance.urlPath}/${fileDoc.format}/${fileDoc.tag}/${fileDoc.fileName}`;

    return link;
  }

  /**
   * Gets the physical path for a file
   * @param {string} fileId - ID of the file
   * @returns {Promise<string>} The physical path
   * @example
   * ```typescript
   * import { fileService } from '@modular-rest/server';
   *
   * const path = await fileService.getFilePath('file123');
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
FileService.instance = main;
