// Copyright 2015-2024, University of Colorado Boulder
/**
 * Retrieves the license entry for a media file from license.json.
 * This file is used when loading media files (images, sounds,...) via media plugins.
 *
 * A license entry for a media file is found in a license.json file that is in
 * the same directory as the media file. A license entry has the following fields:
 *
 * text - copyright statement or "Public Domain"
 * projectURL - the URL for the resource
 * license - the name of license, such as "Public Domain"
 * notes - additional helpful information about the resource, or ""
 * exception - [optional] description of why the file is being used despite the fact that it doesn't match PhET's licensing policy
 *
 * For an example, see any of the license.json files in a PhET simulation's images directory.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */ import fs from 'fs';
/**
 * Retrieves the license entry for a media file from license.json.
 *
 * @param absolutePath - the path for the media file
 * @returns the entry from the license.json file, null if there is no entry
 */ function getLicenseEntry(absolutePath) {
    const lastSlashIndex = absolutePath.lastIndexOf('/');
    const prefix = absolutePath.substring(0, lastSlashIndex);
    const licenseFilename = `${prefix}/license.json`; // license.json is a sibling of the media file
    const mediaFilename = absolutePath.substring(lastSlashIndex + 1); // field name in license.json
    // read license.json if it exists
    if (!fs.existsSync(licenseFilename)) {
        return null;
    }
    const fileContents = fs.readFileSync(licenseFilename, 'utf8');
    let json = null;
    try {
        json = JSON.parse(fileContents);
    } catch (err) {
        if (err instanceof SyntaxError) {
            // default message is incomprehensible, see chipper#449
            throw new Error(`syntax error in ${licenseFilename}: ${err.message}`);
        } else {
            throw err;
        }
    }
    // get the media file's license entry
    const entry = json[mediaFilename];
    if (!entry) {
        return null; // Not annotated in file
    }
    return entry;
}
export default getLicenseEntry;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2pzL2NvbW1vbi9nZXRMaWNlbnNlRW50cnkudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTUtMjAyNCwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbi8qKlxuICogUmV0cmlldmVzIHRoZSBsaWNlbnNlIGVudHJ5IGZvciBhIG1lZGlhIGZpbGUgZnJvbSBsaWNlbnNlLmpzb24uXG4gKiBUaGlzIGZpbGUgaXMgdXNlZCB3aGVuIGxvYWRpbmcgbWVkaWEgZmlsZXMgKGltYWdlcywgc291bmRzLC4uLikgdmlhIG1lZGlhIHBsdWdpbnMuXG4gKlxuICogQSBsaWNlbnNlIGVudHJ5IGZvciBhIG1lZGlhIGZpbGUgaXMgZm91bmQgaW4gYSBsaWNlbnNlLmpzb24gZmlsZSB0aGF0IGlzIGluXG4gKiB0aGUgc2FtZSBkaXJlY3RvcnkgYXMgdGhlIG1lZGlhIGZpbGUuIEEgbGljZW5zZSBlbnRyeSBoYXMgdGhlIGZvbGxvd2luZyBmaWVsZHM6XG4gKlxuICogdGV4dCAtIGNvcHlyaWdodCBzdGF0ZW1lbnQgb3IgXCJQdWJsaWMgRG9tYWluXCJcbiAqIHByb2plY3RVUkwgLSB0aGUgVVJMIGZvciB0aGUgcmVzb3VyY2VcbiAqIGxpY2Vuc2UgLSB0aGUgbmFtZSBvZiBsaWNlbnNlLCBzdWNoIGFzIFwiUHVibGljIERvbWFpblwiXG4gKiBub3RlcyAtIGFkZGl0aW9uYWwgaGVscGZ1bCBpbmZvcm1hdGlvbiBhYm91dCB0aGUgcmVzb3VyY2UsIG9yIFwiXCJcbiAqIGV4Y2VwdGlvbiAtIFtvcHRpb25hbF0gZGVzY3JpcHRpb24gb2Ygd2h5IHRoZSBmaWxlIGlzIGJlaW5nIHVzZWQgZGVzcGl0ZSB0aGUgZmFjdCB0aGF0IGl0IGRvZXNuJ3QgbWF0Y2ggUGhFVCdzIGxpY2Vuc2luZyBwb2xpY3lcbiAqXG4gKiBGb3IgYW4gZXhhbXBsZSwgc2VlIGFueSBvZiB0aGUgbGljZW5zZS5qc29uIGZpbGVzIGluIGEgUGhFVCBzaW11bGF0aW9uJ3MgaW1hZ2VzIGRpcmVjdG9yeS5cbiAqXG4gKiBAYXV0aG9yIFNhbSBSZWlkIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxuICovXG5pbXBvcnQgZnMgZnJvbSAnZnMnO1xuXG5leHBvcnQgdHlwZSBMaWNlbnNlRW50cnkgPSB7XG4gIHRleHQ6IHN0cmluZ1tdO1xuICBwcm9qZWN0VVJMOiBzdHJpbmc7XG4gIGxpY2Vuc2U6IHN0cmluZztcbiAgbm90ZXM6IHN0cmluZztcbn07XG5cbi8qKlxuICogUmV0cmlldmVzIHRoZSBsaWNlbnNlIGVudHJ5IGZvciBhIG1lZGlhIGZpbGUgZnJvbSBsaWNlbnNlLmpzb24uXG4gKlxuICogQHBhcmFtIGFic29sdXRlUGF0aCAtIHRoZSBwYXRoIGZvciB0aGUgbWVkaWEgZmlsZVxuICogQHJldHVybnMgdGhlIGVudHJ5IGZyb20gdGhlIGxpY2Vuc2UuanNvbiBmaWxlLCBudWxsIGlmIHRoZXJlIGlzIG5vIGVudHJ5XG4gKi9cbmZ1bmN0aW9uIGdldExpY2Vuc2VFbnRyeSggYWJzb2x1dGVQYXRoOiBzdHJpbmcgKTogTGljZW5zZUVudHJ5IHwgbnVsbCB7XG5cbiAgY29uc3QgbGFzdFNsYXNoSW5kZXggPSBhYnNvbHV0ZVBhdGgubGFzdEluZGV4T2YoICcvJyApO1xuICBjb25zdCBwcmVmaXggPSBhYnNvbHV0ZVBhdGguc3Vic3RyaW5nKCAwLCBsYXN0U2xhc2hJbmRleCApO1xuICBjb25zdCBsaWNlbnNlRmlsZW5hbWUgPSBgJHtwcmVmaXh9L2xpY2Vuc2UuanNvbmA7IC8vIGxpY2Vuc2UuanNvbiBpcyBhIHNpYmxpbmcgb2YgdGhlIG1lZGlhIGZpbGVcbiAgY29uc3QgbWVkaWFGaWxlbmFtZSA9IGFic29sdXRlUGF0aC5zdWJzdHJpbmcoIGxhc3RTbGFzaEluZGV4ICsgMSApOyAvLyBmaWVsZCBuYW1lIGluIGxpY2Vuc2UuanNvblxuXG4gIC8vIHJlYWQgbGljZW5zZS5qc29uIGlmIGl0IGV4aXN0c1xuICBpZiAoICFmcy5leGlzdHNTeW5jKCBsaWNlbnNlRmlsZW5hbWUgKSApIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuICBjb25zdCBmaWxlQ29udGVudHMgPSBmcy5yZWFkRmlsZVN5bmMoIGxpY2Vuc2VGaWxlbmFtZSwgJ3V0ZjgnICk7XG4gIGxldCBqc29uID0gbnVsbDtcbiAgdHJ5IHtcbiAgICBqc29uID0gSlNPTi5wYXJzZSggZmlsZUNvbnRlbnRzICk7XG4gIH1cbiAgY2F0Y2goIGVyciApIHtcbiAgICBpZiAoIGVyciBpbnN0YW5jZW9mIFN5bnRheEVycm9yICkge1xuICAgICAgLy8gZGVmYXVsdCBtZXNzYWdlIGlzIGluY29tcHJlaGVuc2libGUsIHNlZSBjaGlwcGVyIzQ0OVxuICAgICAgdGhyb3cgbmV3IEVycm9yKCBgc3ludGF4IGVycm9yIGluICR7bGljZW5zZUZpbGVuYW1lfTogJHtlcnIubWVzc2FnZX1gICk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgdGhyb3cgZXJyO1xuICAgIH1cbiAgfVxuXG4gIC8vIGdldCB0aGUgbWVkaWEgZmlsZSdzIGxpY2Vuc2UgZW50cnlcbiAgY29uc3QgZW50cnkgPSBqc29uWyBtZWRpYUZpbGVuYW1lIF07XG4gIGlmICggIWVudHJ5ICkge1xuICAgIHJldHVybiBudWxsOyAvLyBOb3QgYW5ub3RhdGVkIGluIGZpbGVcbiAgfVxuICByZXR1cm4gZW50cnk7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGdldExpY2Vuc2VFbnRyeTsiXSwibmFtZXMiOlsiZnMiLCJnZXRMaWNlbnNlRW50cnkiLCJhYnNvbHV0ZVBhdGgiLCJsYXN0U2xhc2hJbmRleCIsImxhc3RJbmRleE9mIiwicHJlZml4Iiwic3Vic3RyaW5nIiwibGljZW5zZUZpbGVuYW1lIiwibWVkaWFGaWxlbmFtZSIsImV4aXN0c1N5bmMiLCJmaWxlQ29udGVudHMiLCJyZWFkRmlsZVN5bmMiLCJqc29uIiwiSlNPTiIsInBhcnNlIiwiZXJyIiwiU3ludGF4RXJyb3IiLCJFcnJvciIsIm1lc3NhZ2UiLCJlbnRyeSJdLCJtYXBwaW5ncyI6IkFBQUEsc0RBQXNEO0FBRXREOzs7Ozs7Ozs7Ozs7Ozs7O0NBZ0JDLEdBQ0QsT0FBT0EsUUFBUSxLQUFLO0FBU3BCOzs7OztDQUtDLEdBQ0QsU0FBU0MsZ0JBQWlCQyxZQUFvQjtJQUU1QyxNQUFNQyxpQkFBaUJELGFBQWFFLFdBQVcsQ0FBRTtJQUNqRCxNQUFNQyxTQUFTSCxhQUFhSSxTQUFTLENBQUUsR0FBR0g7SUFDMUMsTUFBTUksa0JBQWtCLEdBQUdGLE9BQU8sYUFBYSxDQUFDLEVBQUUsOENBQThDO0lBQ2hHLE1BQU1HLGdCQUFnQk4sYUFBYUksU0FBUyxDQUFFSCxpQkFBaUIsSUFBSyw2QkFBNkI7SUFFakcsaUNBQWlDO0lBQ2pDLElBQUssQ0FBQ0gsR0FBR1MsVUFBVSxDQUFFRixrQkFBb0I7UUFDdkMsT0FBTztJQUNUO0lBQ0EsTUFBTUcsZUFBZVYsR0FBR1csWUFBWSxDQUFFSixpQkFBaUI7SUFDdkQsSUFBSUssT0FBTztJQUNYLElBQUk7UUFDRkEsT0FBT0MsS0FBS0MsS0FBSyxDQUFFSjtJQUNyQixFQUNBLE9BQU9LLEtBQU07UUFDWCxJQUFLQSxlQUFlQyxhQUFjO1lBQ2hDLHVEQUF1RDtZQUN2RCxNQUFNLElBQUlDLE1BQU8sQ0FBQyxnQkFBZ0IsRUFBRVYsZ0JBQWdCLEVBQUUsRUFBRVEsSUFBSUcsT0FBTyxFQUFFO1FBQ3ZFLE9BQ0s7WUFDSCxNQUFNSDtRQUNSO0lBQ0Y7SUFFQSxxQ0FBcUM7SUFDckMsTUFBTUksUUFBUVAsSUFBSSxDQUFFSixjQUFlO0lBQ25DLElBQUssQ0FBQ1csT0FBUTtRQUNaLE9BQU8sTUFBTSx3QkFBd0I7SUFDdkM7SUFDQSxPQUFPQTtBQUNUO0FBRUEsZUFBZWxCLGdCQUFnQiJ9