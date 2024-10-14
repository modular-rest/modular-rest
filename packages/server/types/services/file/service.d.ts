export = FileService.instance;
declare var instance: FileService;
declare class FileService {
    directory: any;
    setUploadDirectory(directory: any): void;
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
    createStoredDetail(fileType: string, tag: string): {
        fileName: string;
        fullPath: string;
        fileFormat: string;
    };
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
    storeFile({ file, ownerId, tag, removeFileAfterStore }: {
        file: {
            path: string;
            type: string;
            name: string;
            size: number;
        };
        ownerId: string;
        tag: string;
        removeFileAfterStore?: boolean;
    }): Promise<any>;
    /**
     * Removes a file from the disk.
     *
     * @param {string} path - The path of the file to be removed.
     * @returns {Promise} A promise that resolves if the file is successfully removed, and rejects if an error occurs.
     */
    removeFromDisc(path: string): Promise<any>;
    /**
     * Removes a file from the database and the disk.
     *
     * @param {string} fileId - The ID of the file to be removed.
     * @returns {Promise} A promise that resolves if the file is successfully removed, and rejects if an error occurs.
     * @throws Will throw an error if upload directory has not been set.
     */
    removeFile(fileId: string): Promise<any>;
    /**
     * Retrieves a file from the database.
     *
     * @param {string} fileId - The ID of the file to be retrieved.
     * @returns {Promise} A promise that resolves with the file document, or rejects if an error occurs.
     */
    getFile(fileId: string): Promise<any>;
    /**
     * Retrieves the link of a file.
     *
     * @param {string} fileId - The ID of the file to get the link for.
     * @returns {Promise} A promise that resolves with the file link, or rejects if an error occurs.
     */
    getFileLink(fileId: string): Promise<any>;
    getFilePath(fileId: any): Promise<string>;
}
declare namespace FileService { }
