import fs from 'fs';
import pathModule from 'path';
import * as DataProvider from '../data_provider/service';
import triggerService from '../../class/trigger_operator';
import { config } from '../../config';
import { IFile } from '../../class/db_schemas';

/**
 * File storage detail interface
 */
interface StoredFileDetail {
  fileName: string;
  fullPath: string;
  fileFormat: string;
}

/**
 * File upload options interface
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
 */
class FileService {
  private directory: string | null = null;
  static instance: FileService;

  constructor() {}

  /**
   * Set the upload directory for file storage
   * @param directory - Directory path
   */
  setUploadDirectory(directory: string): void {
    this.directory = directory;
  }

  /**
   * Create stored file details
   * @param fileType - MIME type of the file
   * @param tag - Tag for file organization
   * @returns Storage details
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
   * Stores a file, removes the given temporary file, and submits file details into the database
   * @param options - File storage options
   * @returns Promise resolving to stored file document
   */
  storeFile({ file, ownerId, tag, removeFileAfterStore = true }: StoreFileOptions): Promise<any> {
    if (!FileService.instance.directory) {
      throw new Error('Upload directory has not been set');
    }

    let storedFile: StoredFileDetail;

    return (
      new Promise(async (done, reject) => {
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
        /**
         * Submit file detail into database
         */
        .then(() => {
          // Get collection model for access to relative collection
          const CollectionModel = DataProvider.getCollection('cms', 'file');

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
        })
    );
  }

  /**
   * Removes a file from the disk
   * @param path - File path
   * @returns Promise resolving when file is removed
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
   * Removes a file from the database and the disk
   * @param fileId - File ID
   * @returns Promise resolving when file is removed
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
   * Retrieves a file from the database
   * @param fileId - File ID
   * @returns Promise resolving to file document
   */
  getFile(fileId: string): Promise<any> {
    const CollectionModel = DataProvider.getCollection('cms', 'file');

    if (!CollectionModel) {
      throw new Error('Collection model not found');
    }

    return CollectionModel.findOne({ _id: fileId }).exec();
  }

  /**
   * Retrieves the link of a file
   * @param fileId - File ID
   * @returns Promise resolving to file link
   */
  async getFileLink(fileId: string): Promise<string> {
    const fileDoc = await FileService.instance.getFile(fileId);

    if (!config.staticPath?.rootPath) {
      throw new Error('Static path root is not defined');
    }

    const link =
      config.staticPath.rootPath + `/${fileDoc.format}/${fileDoc.tag}/` + fileDoc.fileName;

    return link;
  }

  /**
   * Get the full path of a file
   * @param fileId - File ID
   * @returns Promise resolving to file path
   */
  async getFilePath(fileId: string): Promise<string> {
    const { fileName, format, tag } = await FileService.instance.getFile(fileId);

    if (!FileService.instance.directory) {
      throw new Error('Upload directory has not been set');
    }

    const fullPath = pathModule.join(FileService.instance.directory, format, tag, fileName);
    return fullPath;
  }
}

FileService.instance = new FileService();

export const setUploadDirectory = FileService.instance.setUploadDirectory.bind(
  FileService.instance
);
export const storeFile = FileService.instance.storeFile.bind(FileService.instance);
export const removeFile = FileService.instance.removeFile.bind(FileService.instance);
export const getFile = FileService.instance.getFile.bind(FileService.instance);
export const getFileLink = FileService.instance.getFileLink.bind(FileService.instance);
export const getFilePath = FileService.instance.getFilePath.bind(FileService.instance);
export default FileService.instance;
