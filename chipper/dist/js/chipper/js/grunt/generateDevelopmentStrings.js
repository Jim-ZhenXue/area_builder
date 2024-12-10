// Copyright 2022-2024, University of Colorado Boulder
/**
 * This script makes a JSON file that combines translations for all locales in a repo. Each locale object has every
 * string key/translated-value pair we have for that locale. This is used when running the unbuilt mode simulation with
 * locales=*
 *
 * @author Liam Mulhall (PhET Interactive Simulations)
 * @author Sam Reid (PhET Interactive Simulations)
 */ import assert from 'assert';
import fs from 'fs';
import path from 'path';
import dirname from '../../../perennial-alias/js/common/dirname.js';
// @ts-expect-error - until we have "type": "module" in our package.json
const __dirname = dirname(import.meta.url);
/**
 * @param repo - repo to generate strings for
 */ export default ((repo)=>{
    const start = Date.now();
    const rootPath = path.join(__dirname, '..', '..', '..');
    // OS-independent path to babel repo.
    const babelPath = path.join(rootPath, 'babel');
    // Create a file name for the conglomerate string file.
    const conglomerateStringFileName = `${repo}_all.json`;
    // Create an empty object for the conglomerate string file that we will add to later.
    const conglomerateStringObject = {};
    // Get an array of files (string files) in the repo subdirectory.
    const babelRepoPath = path.join(babelPath, repo);
    // Regex for extracting locale from file name.
    const localeRegex = RegExp("(?<=_)(.*)(?=.json)");
    const stringFiles = [];
    try {
        const paths = fs.readdirSync(babelRepoPath);
        stringFiles.push(...paths.map((p)=>path.join(babelRepoPath, p)));
    } catch (e) {
    // no translations found in babel. But we still must continue in order to generate an (albeit empty) string file.
    }
    const englishStringPath = path.join(rootPath, repo, `${repo}-strings_en.json`);
    if (fs.existsSync(englishStringPath)) {
        stringFiles.push(englishStringPath);
    }
    const localeData = JSON.parse(fs.readFileSync('../babel/localeData.json', 'utf8'));
    // Do not generate a file if no translations were found.
    if (stringFiles.length > 0) {
        // For each string file in the repo subdirectory...
        for (const stringFile of stringFiles){
            // Extract the locale.
            const join = stringFile.split('\\').join('/');
            const localeMatches = join.substring(join.lastIndexOf('/')).match(localeRegex);
            assert(localeMatches);
            const locale = localeMatches[0];
            if (!localeData[locale]) {
                console.log('[WARNING] Locale not found in localeData.json: ' + locale);
                continue;
            }
            // Get the contents of the string file.
            const stringFileContents = fs.readFileSync(stringFile, 'utf8');
            // Parse the string file contents.
            const parsedStringFileContents = JSON.parse(stringFileContents);
            // Add only the values of the string file to the new conglomerate string file, and ignore other fields, such as
            // the history.
            const objectToAddToLocale = {};
            for (const stringKey of Object.keys(parsedStringFileContents)){
                objectToAddToLocale[stringKey] = {
                    value: parsedStringFileContents[stringKey].value
                };
            }
            // Add the string values to the locale object of the conglomerate string object.
            conglomerateStringObject[locale] = objectToAddToLocale;
        }
        // Make sure the output directory exists.  The name starts with an underscore so that it appears alphabetically
        // first and looks different from the repo names.
        const outputDir = path.join(babelPath, '_generated_development_strings');
        try {
            fs.mkdirSync(outputDir);
        } catch (e) {
        // already exists
        }
        const outputPath = path.join(outputDir, conglomerateStringFileName);
        fs.writeFileSync(outputPath, JSON.stringify(conglomerateStringObject, null, 2));
        const end = Date.now();
        console.log('Wrote ' + outputPath + ' in ' + (end - start) + 'ms');
    } else {
        console.log('no translations found');
    }
});

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2pzL2dydW50L2dlbmVyYXRlRGV2ZWxvcG1lbnRTdHJpbmdzLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDIyLTIwMjQsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIFRoaXMgc2NyaXB0IG1ha2VzIGEgSlNPTiBmaWxlIHRoYXQgY29tYmluZXMgdHJhbnNsYXRpb25zIGZvciBhbGwgbG9jYWxlcyBpbiBhIHJlcG8uIEVhY2ggbG9jYWxlIG9iamVjdCBoYXMgZXZlcnlcbiAqIHN0cmluZyBrZXkvdHJhbnNsYXRlZC12YWx1ZSBwYWlyIHdlIGhhdmUgZm9yIHRoYXQgbG9jYWxlLiBUaGlzIGlzIHVzZWQgd2hlbiBydW5uaW5nIHRoZSB1bmJ1aWx0IG1vZGUgc2ltdWxhdGlvbiB3aXRoXG4gKiBsb2NhbGVzPSpcbiAqXG4gKiBAYXV0aG9yIExpYW0gTXVsaGFsbCAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcbiAqIEBhdXRob3IgU2FtIFJlaWQgKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXG4gKi9cblxuaW1wb3J0IGFzc2VydCBmcm9tICdhc3NlcnQnO1xuaW1wb3J0IGZzIGZyb20gJ2ZzJztcbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0IGRpcm5hbWUgZnJvbSAnLi4vLi4vLi4vcGVyZW5uaWFsLWFsaWFzL2pzL2NvbW1vbi9kaXJuYW1lLmpzJztcblxuLy8gQHRzLWV4cGVjdC1lcnJvciAtIHVudGlsIHdlIGhhdmUgXCJ0eXBlXCI6IFwibW9kdWxlXCIgaW4gb3VyIHBhY2thZ2UuanNvblxuY29uc3QgX19kaXJuYW1lID0gZGlybmFtZSggaW1wb3J0Lm1ldGEudXJsICk7XG5cbi8qKlxuICogQHBhcmFtIHJlcG8gLSByZXBvIHRvIGdlbmVyYXRlIHN0cmluZ3MgZm9yXG4gKi9cbmV4cG9ydCBkZWZhdWx0ICggcmVwbzogc3RyaW5nICk6IHZvaWQgPT4ge1xuXG4gIGNvbnN0IHN0YXJ0ID0gRGF0ZS5ub3coKTtcblxuICBjb25zdCByb290UGF0aCA9IHBhdGguam9pbiggX19kaXJuYW1lLCAnLi4nLCAnLi4nLCAnLi4nICk7XG5cbiAgLy8gT1MtaW5kZXBlbmRlbnQgcGF0aCB0byBiYWJlbCByZXBvLlxuICBjb25zdCBiYWJlbFBhdGggPSBwYXRoLmpvaW4oIHJvb3RQYXRoLCAnYmFiZWwnICk7XG5cbiAgLy8gQ3JlYXRlIGEgZmlsZSBuYW1lIGZvciB0aGUgY29uZ2xvbWVyYXRlIHN0cmluZyBmaWxlLlxuICBjb25zdCBjb25nbG9tZXJhdGVTdHJpbmdGaWxlTmFtZSA9IGAke3JlcG99X2FsbC5qc29uYDtcblxuICAvLyBDcmVhdGUgYW4gZW1wdHkgb2JqZWN0IGZvciB0aGUgY29uZ2xvbWVyYXRlIHN0cmluZyBmaWxlIHRoYXQgd2Ugd2lsbCBhZGQgdG8gbGF0ZXIuXG4gIGNvbnN0IGNvbmdsb21lcmF0ZVN0cmluZ09iamVjdDogUmVjb3JkPHN0cmluZywgb2JqZWN0PiA9IHt9O1xuXG4gIC8vIEdldCBhbiBhcnJheSBvZiBmaWxlcyAoc3RyaW5nIGZpbGVzKSBpbiB0aGUgcmVwbyBzdWJkaXJlY3RvcnkuXG4gIGNvbnN0IGJhYmVsUmVwb1BhdGggPSBwYXRoLmpvaW4oIGJhYmVsUGF0aCwgcmVwbyApO1xuXG4gIC8vIFJlZ2V4IGZvciBleHRyYWN0aW5nIGxvY2FsZSBmcm9tIGZpbGUgbmFtZS5cbiAgY29uc3QgbG9jYWxlUmVnZXggPSAvKD88PV8pKC4qKSg/PS5qc29uKS87XG5cbiAgY29uc3Qgc3RyaW5nRmlsZXMgPSBbXTtcbiAgdHJ5IHtcbiAgICBjb25zdCBwYXRoczogc3RyaW5nW10gPSBmcy5yZWFkZGlyU3luYyggYmFiZWxSZXBvUGF0aCApO1xuICAgIHN0cmluZ0ZpbGVzLnB1c2goIC4uLnBhdGhzLm1hcCggcCA9PiBwYXRoLmpvaW4oIGJhYmVsUmVwb1BhdGgsIHAgKSApICk7XG4gIH1cbiAgY2F0Y2goIGUgKSB7XG5cbiAgICAvLyBubyB0cmFuc2xhdGlvbnMgZm91bmQgaW4gYmFiZWwuIEJ1dCB3ZSBzdGlsbCBtdXN0IGNvbnRpbnVlIGluIG9yZGVyIHRvIGdlbmVyYXRlIGFuIChhbGJlaXQgZW1wdHkpIHN0cmluZyBmaWxlLlxuICB9XG5cbiAgY29uc3QgZW5nbGlzaFN0cmluZ1BhdGggPSBwYXRoLmpvaW4oIHJvb3RQYXRoLCByZXBvLCBgJHtyZXBvfS1zdHJpbmdzX2VuLmpzb25gICk7XG4gIGlmICggZnMuZXhpc3RzU3luYyggZW5nbGlzaFN0cmluZ1BhdGggKSApIHtcbiAgICBzdHJpbmdGaWxlcy5wdXNoKCBlbmdsaXNoU3RyaW5nUGF0aCApO1xuICB9XG5cbiAgY29uc3QgbG9jYWxlRGF0YSA9IEpTT04ucGFyc2UoIGZzLnJlYWRGaWxlU3luYyggJy4uL2JhYmVsL2xvY2FsZURhdGEuanNvbicsICd1dGY4JyApICk7XG5cbiAgLy8gRG8gbm90IGdlbmVyYXRlIGEgZmlsZSBpZiBubyB0cmFuc2xhdGlvbnMgd2VyZSBmb3VuZC5cbiAgaWYgKCBzdHJpbmdGaWxlcy5sZW5ndGggPiAwICkge1xuXG4gICAgLy8gRm9yIGVhY2ggc3RyaW5nIGZpbGUgaW4gdGhlIHJlcG8gc3ViZGlyZWN0b3J5Li4uXG4gICAgZm9yICggY29uc3Qgc3RyaW5nRmlsZSBvZiBzdHJpbmdGaWxlcyApIHtcblxuICAgICAgLy8gRXh0cmFjdCB0aGUgbG9jYWxlLlxuICAgICAgY29uc3Qgam9pbiA9IHN0cmluZ0ZpbGUuc3BsaXQoICdcXFxcJyApLmpvaW4oICcvJyApO1xuICAgICAgY29uc3QgbG9jYWxlTWF0Y2hlcyA9IGpvaW4uc3Vic3RyaW5nKCBqb2luLmxhc3RJbmRleE9mKCAnLycgKSApLm1hdGNoKCBsb2NhbGVSZWdleCApO1xuICAgICAgYXNzZXJ0KCBsb2NhbGVNYXRjaGVzICk7XG4gICAgICBjb25zdCBsb2NhbGUgPSBsb2NhbGVNYXRjaGVzWyAwIF07XG5cbiAgICAgIGlmICggIWxvY2FsZURhdGFbIGxvY2FsZSBdICkge1xuICAgICAgICBjb25zb2xlLmxvZyggJ1tXQVJOSU5HXSBMb2NhbGUgbm90IGZvdW5kIGluIGxvY2FsZURhdGEuanNvbjogJyArIGxvY2FsZSApO1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cblxuICAgICAgLy8gR2V0IHRoZSBjb250ZW50cyBvZiB0aGUgc3RyaW5nIGZpbGUuXG4gICAgICBjb25zdCBzdHJpbmdGaWxlQ29udGVudHMgPSBmcy5yZWFkRmlsZVN5bmMoIHN0cmluZ0ZpbGUsICd1dGY4JyApO1xuXG4gICAgICAvLyBQYXJzZSB0aGUgc3RyaW5nIGZpbGUgY29udGVudHMuXG4gICAgICBjb25zdCBwYXJzZWRTdHJpbmdGaWxlQ29udGVudHMgPSBKU09OLnBhcnNlKCBzdHJpbmdGaWxlQ29udGVudHMgKTtcblxuICAgICAgLy8gQWRkIG9ubHkgdGhlIHZhbHVlcyBvZiB0aGUgc3RyaW5nIGZpbGUgdG8gdGhlIG5ldyBjb25nbG9tZXJhdGUgc3RyaW5nIGZpbGUsIGFuZCBpZ25vcmUgb3RoZXIgZmllbGRzLCBzdWNoIGFzXG4gICAgICAvLyB0aGUgaGlzdG9yeS5cbiAgICAgIGNvbnN0IG9iamVjdFRvQWRkVG9Mb2NhbGU6IFJlY29yZDxzdHJpbmcsIG9iamVjdD4gPSB7fTtcbiAgICAgIGZvciAoIGNvbnN0IHN0cmluZ0tleSBvZiBPYmplY3Qua2V5cyggcGFyc2VkU3RyaW5nRmlsZUNvbnRlbnRzICkgKSB7XG4gICAgICAgIG9iamVjdFRvQWRkVG9Mb2NhbGVbIHN0cmluZ0tleSBdID0ge1xuICAgICAgICAgIHZhbHVlOiBwYXJzZWRTdHJpbmdGaWxlQ29udGVudHNbIHN0cmluZ0tleSBdLnZhbHVlXG4gICAgICAgIH07XG4gICAgICB9XG5cbiAgICAgIC8vIEFkZCB0aGUgc3RyaW5nIHZhbHVlcyB0byB0aGUgbG9jYWxlIG9iamVjdCBvZiB0aGUgY29uZ2xvbWVyYXRlIHN0cmluZyBvYmplY3QuXG4gICAgICBjb25nbG9tZXJhdGVTdHJpbmdPYmplY3RbIGxvY2FsZSBdID0gb2JqZWN0VG9BZGRUb0xvY2FsZTtcbiAgICB9XG5cbiAgICAvLyBNYWtlIHN1cmUgdGhlIG91dHB1dCBkaXJlY3RvcnkgZXhpc3RzLiAgVGhlIG5hbWUgc3RhcnRzIHdpdGggYW4gdW5kZXJzY29yZSBzbyB0aGF0IGl0IGFwcGVhcnMgYWxwaGFiZXRpY2FsbHlcbiAgICAvLyBmaXJzdCBhbmQgbG9va3MgZGlmZmVyZW50IGZyb20gdGhlIHJlcG8gbmFtZXMuXG4gICAgY29uc3Qgb3V0cHV0RGlyID0gcGF0aC5qb2luKCBiYWJlbFBhdGgsICdfZ2VuZXJhdGVkX2RldmVsb3BtZW50X3N0cmluZ3MnICk7XG4gICAgdHJ5IHtcbiAgICAgIGZzLm1rZGlyU3luYyggb3V0cHV0RGlyICk7XG4gICAgfVxuICAgIGNhdGNoKCBlICkge1xuICAgICAgLy8gYWxyZWFkeSBleGlzdHNcbiAgICB9XG5cbiAgICBjb25zdCBvdXRwdXRQYXRoID0gcGF0aC5qb2luKCBvdXRwdXREaXIsIGNvbmdsb21lcmF0ZVN0cmluZ0ZpbGVOYW1lICk7XG4gICAgZnMud3JpdGVGaWxlU3luYyggb3V0cHV0UGF0aCwgSlNPTi5zdHJpbmdpZnkoIGNvbmdsb21lcmF0ZVN0cmluZ09iamVjdCwgbnVsbCwgMiApICk7XG5cbiAgICBjb25zdCBlbmQgPSBEYXRlLm5vdygpO1xuICAgIGNvbnNvbGUubG9nKCAnV3JvdGUgJyArIG91dHB1dFBhdGggKyAnIGluICcgKyAoIGVuZCAtIHN0YXJ0ICkgKyAnbXMnICk7XG4gIH1cbiAgZWxzZSB7XG4gICAgY29uc29sZS5sb2coICdubyB0cmFuc2xhdGlvbnMgZm91bmQnICk7XG4gIH1cbn07Il0sIm5hbWVzIjpbImFzc2VydCIsImZzIiwicGF0aCIsImRpcm5hbWUiLCJfX2Rpcm5hbWUiLCJ1cmwiLCJyZXBvIiwic3RhcnQiLCJEYXRlIiwibm93Iiwicm9vdFBhdGgiLCJqb2luIiwiYmFiZWxQYXRoIiwiY29uZ2xvbWVyYXRlU3RyaW5nRmlsZU5hbWUiLCJjb25nbG9tZXJhdGVTdHJpbmdPYmplY3QiLCJiYWJlbFJlcG9QYXRoIiwibG9jYWxlUmVnZXgiLCJzdHJpbmdGaWxlcyIsInBhdGhzIiwicmVhZGRpclN5bmMiLCJwdXNoIiwibWFwIiwicCIsImUiLCJlbmdsaXNoU3RyaW5nUGF0aCIsImV4aXN0c1N5bmMiLCJsb2NhbGVEYXRhIiwiSlNPTiIsInBhcnNlIiwicmVhZEZpbGVTeW5jIiwibGVuZ3RoIiwic3RyaW5nRmlsZSIsInNwbGl0IiwibG9jYWxlTWF0Y2hlcyIsInN1YnN0cmluZyIsImxhc3RJbmRleE9mIiwibWF0Y2giLCJsb2NhbGUiLCJjb25zb2xlIiwibG9nIiwic3RyaW5nRmlsZUNvbnRlbnRzIiwicGFyc2VkU3RyaW5nRmlsZUNvbnRlbnRzIiwib2JqZWN0VG9BZGRUb0xvY2FsZSIsInN0cmluZ0tleSIsIk9iamVjdCIsImtleXMiLCJ2YWx1ZSIsIm91dHB1dERpciIsIm1rZGlyU3luYyIsIm91dHB1dFBhdGgiLCJ3cml0ZUZpbGVTeW5jIiwic3RyaW5naWZ5IiwiZW5kIl0sIm1hcHBpbmdzIjoiQUFBQSxzREFBc0Q7QUFFdEQ7Ozs7Ozs7Q0FPQyxHQUVELE9BQU9BLFlBQVksU0FBUztBQUM1QixPQUFPQyxRQUFRLEtBQUs7QUFDcEIsT0FBT0MsVUFBVSxPQUFPO0FBQ3hCLE9BQU9DLGFBQWEsZ0RBQWdEO0FBRXBFLHdFQUF3RTtBQUN4RSxNQUFNQyxZQUFZRCxRQUFTLFlBQVlFLEdBQUc7QUFFMUM7O0NBRUMsR0FDRCxlQUFlLENBQUEsQ0FBRUM7SUFFZixNQUFNQyxRQUFRQyxLQUFLQyxHQUFHO0lBRXRCLE1BQU1DLFdBQVdSLEtBQUtTLElBQUksQ0FBRVAsV0FBVyxNQUFNLE1BQU07SUFFbkQscUNBQXFDO0lBQ3JDLE1BQU1RLFlBQVlWLEtBQUtTLElBQUksQ0FBRUQsVUFBVTtJQUV2Qyx1REFBdUQ7SUFDdkQsTUFBTUcsNkJBQTZCLEdBQUdQLEtBQUssU0FBUyxDQUFDO0lBRXJELHFGQUFxRjtJQUNyRixNQUFNUSwyQkFBbUQsQ0FBQztJQUUxRCxpRUFBaUU7SUFDakUs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