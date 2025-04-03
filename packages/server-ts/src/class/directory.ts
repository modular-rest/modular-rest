import fs from 'fs';
import path from 'path';

interface DirectorySettings {
  name?: string;
  filter?: string[];
}

type WalkCallback = (err: Error | null, results: string[]) => void;

/**
 * Walk through a directory and its subdirectories
 * @param dir - Directory to walk
 * @param settings - Settings for filtering files
 * @param done - Callback function
 */
function walk(dir: string, settings: DirectorySettings, done: WalkCallback): void {
  let results: string[] = [];

  // Read director file and folders
  fs.readdir(dir, function (err, list) {
    if (err) return done(err, results);

    let pending = list.length;
    if (!pending) return done(null, results);

    list.forEach(function (file) {
      file = path.join(dir, file);
      fs.stat(file, function (err, stat) {
        if (err) {
          // Handle file stat error but continue with other files
          console.error(`Error reading file stats for ${file}:`, err);
          if (!--pending) done(null, results);
          return;
        }

        // If directory, execute a recursive call
        if (stat && stat.isDirectory()) {
          // Add directory to array [comment if you need to remove the directories from the array]
          // results.push(file);
          walk(file, settings, function (err, res) {
            results = results.concat(res);
            if (!--pending) done(null, results);
          });
        } else {
          // file filter
          const extension = path.extname(file);
          const fileName = path.basename(file).split('.')[0];
          let fileNameKey = true;

          // name filter
          if (settings.name && settings.name === fileName) fileNameKey = true;
          else fileNameKey = false;

          // extension filter
          if (settings.filter && fileNameKey) {
            settings.filter.forEach(function (element) {
              if (element.toLowerCase() === extension.toLowerCase()) results.push(file);
            });
          }

          // push any file if no option
          else if (fileNameKey) results.push(file);

          if (!--pending) done(null, results);
        }
      });
    });
  });
}

/**
 * Find files in a directory with Promise API
 * @param dir - Directory to search
 * @param settings - Settings for filtering files
 * @returns Promise resolving to an array of file paths
 */
function find(dir: string, settings: DirectorySettings): Promise<string[]> {
  return new Promise((resolve, reject) => {
    walk(dir, settings, (err, result) => {
      if (err) reject(err);
      else resolve(result);
    });
  });
}

export { walk, find };
