import HttpClient from "../class/http";
import GlobalOptions from "../class/global_options";
import { bus, tokenReceivedEvent } from "../class/event-bus";
import { FileDocument, OnProgressCallback } from "../types/types";
import { dataProvider } from "..";

class FileProvider {
  private static instance: FileProvider;
  private http: HttpClient;

  private constructor() {
    this.http = new HttpClient();

    bus.subscribe(tokenReceivedEvent, (event) => {
      this.http.setCommonHeader({
        authorization: event.payload.token,
      });
    });
  }

  static getInstance() {
    if (FileProvider.instance) return FileProvider.instance;

    FileProvider.instance = new FileProvider();
    return FileProvider.instance;
  }

  uploadFile(
    file: string | Blob,
    onProgress: OnProgressCallback,
    tag: string = "untagged"
  ) {
    const path = "/file";
    return this.http
      .uploadFile(path, file, { tag }, onProgress)
      .then((body) => body["file"] as FileDocument);
  }

  uploadFileToURL(
    url: string,
    file: string | Blob,
    body: any = {},
    onProgress: OnProgressCallback,
    tag: string
  ) {
    return this.http.uploadFile(url, file, body, onProgress);
  }

  removeFile(id: string) {
    const path = "/file";
    return this.http.delete(path, { query: { id: id } });
  }

  getFileLink(
    fileDoc: { fileName: string; format: string; tag: String },
    overrideUrl?: string,
    rootPath: string = "assets"
  ) {
    // remove / from the rootPath
    if (rootPath.endsWith("/")) {
      rootPath = rootPath.slice(0, -1);
    }

    const url = GlobalOptions.getUrl(
      `/${rootPath}/` + `${fileDoc.format}/${fileDoc.tag}/` + fileDoc.fileName,
      overrideUrl
    );
    return url;
  }

  getFileDoc(id: string, userId: string) {
    return dataProvider.findOne<FileDocument>({
      database: "cms",
      collection: "file",
      query: { id: id, owner: userId },
    });
  }

  getFileDocsByTag(tag: string, userId: string) {
    return dataProvider.find<FileDocument>({
      database: "cms",
      collection: "file",
      query: { owner: userId, tag: tag },
    });
  }
}

export default FileProvider;
