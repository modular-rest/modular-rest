import fs from 'fs';
import path from 'path';

interface DirectorySettings {
  name?: string;
  filter?: string[];
}

/**
 * Walk through a directory and its subdirectories efficiently
 * @param dir - Directory to walk
 * @param settings - Settings for filtering files
 */
async function walk(dir: string, settings: DirectorySettings): Promise<string[]> {
  let results: string[] = [];
  const list = await fs.promises.readdir(dir);

  for (const file of list) {
    const filePath = path.join(dir, file);
    const stat = await fs.promises.stat(filePath);

    if (stat && stat.isDirectory()) {
      // Ignore common directories that should not be scanned
      if (file === 'node_modules' || file === '.git' || file === 'dist') {
        continue;
      }
      const res = await walk(filePath, settings);
      results = results.concat(res);
    } else {
      const extension = path.extname(filePath);
      const fileName = path.basename(filePath).split('.')[0];
      let fileNameKey = true;

      // name filter
      if (settings.name && settings.name !== fileName) {
        fileNameKey = false;
      }

      // extension filter
      if (settings.filter && fileNameKey) {
        if (settings.filter.some(ext => ext.toLowerCase() === extension.toLowerCase())) {
          results.push(filePath);
        }
      }
      // push any file if no name filter and no extension filter
      else if (fileNameKey && !settings.filter) {
        results.push(filePath);
      }
    }
  }
  return results;
}

/**
 * Find files in a directory with Promise API
 * @param dir - Directory to search
 * @param settings - Settings for filtering files
 * @returns Promise resolving to an array of file paths
 */
async function find(dir: string, settings: DirectorySettings): Promise<string[]> {
  try {
    return await walk(dir, settings);
  } catch (err) {
    console.error(`Error in directory.find for ${dir}:`, err);
    return [];
  }
}

export { walk, find };
