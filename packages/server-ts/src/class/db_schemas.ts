import mongoose from "mongoose";
const { Schema } = mongoose;

/**
 * File schema interface
 */
export interface IFile {
  originalName: string;
  fileName: string;
  owner: string;
  format: string;
  // Tag being used as the parent dir for files
  // uploadDir/$format/$tag/timestamp.format
  tag: string;
  size: number;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Schema definitions
 */
const schemas = {
  file: new Schema<IFile>(
    {
      originalName: String,
      fileName: String,
      owner: String,
      format: String,
      // Tag being used as the parent dir for files
      // uploadDir/$format/$tag/timestamp.format
      tag: String,
      size: Number,
    },
    { timestamps: true }
  ),
};

export default schemas;
