// Copyright 2016-2024, University of Colorado Boulder
import assert from 'assert';
import _ from 'lodash';
import grunt from '../../../perennial-alias/js/npm-dependencies/grunt.js';
import minify from './minify.js';
/**
 * Copy a directory and all of its contents recursively
 *
 * @author Sam Reid (PhET Interactive Simulations)
 *
 * @param src - the source directory
 * @param dst - the destination directory
 * @param [filter] - rules for filtering files.  If returns falsy, then the file will be copied directly (helps with images)
 * @param [options]
 */ export default function copyDirectory(src, dst, filter, options) {
    options = _.assignIn({
        failOnExistingFiles: false,
        exclude: [],
        minifyJS: false,
        minifyOptions: {},
        licenseToPrepend: ''
    }, options);
    // Copy built sim files (assuming they exist from a prior grunt command)
    grunt.file.recurse(src, (abspath, rootdir, subdir, filename)=>{
        let isExcludedDir = false;
        subdir && subdir.split('/').forEach((pathPart)=>{
            // Exclude all directories that are in the excluded list
            if (options.exclude.indexOf(pathPart) >= 0) {
                isExcludedDir = true;
            }
        });
        // Exit out if the file is excluded or if it is in a excluded dir.
        if (isExcludedDir || options.exclude.indexOf(filename) >= 0) {
            return;
        }
        const contents = grunt.file.read(abspath);
        const dstPath = subdir ? `${dst}/${subdir}/${filename}` : `${dst}/${filename}`;
        if (options.failOnExistingFiles && grunt.file.exists(dstPath)) {
            assert && assert(false, 'file existed already');
        }
        let filteredContents = filter && filter(abspath, contents);
        // Minify the file if it is javascript code
        if (options.minifyJS && filename.endsWith('.js') && !abspath.includes('chipper/templates/')) {
            const toBeMinified = filteredContents ? filteredContents : contents;
            filteredContents = minify(toBeMinified, options.minifyOptions);
            // Only add the license to the javascript code
            filteredContents = options.licenseToPrepend + filteredContents;
        }
        if (filteredContents) {
            grunt.file.write(dstPath, filteredContents);
        } else {
            grunt.file.copy(abspath, dstPath);
        }
    });
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2pzL2dydW50L2NvcHlEaXJlY3RvcnkudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTYtMjAyNCwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbmltcG9ydCBhc3NlcnQgZnJvbSAnYXNzZXJ0JztcbmltcG9ydCBfIGZyb20gJ2xvZGFzaCc7XG5pbXBvcnQgZ3J1bnQgZnJvbSAnLi4vLi4vLi4vcGVyZW5uaWFsLWFsaWFzL2pzL25wbS1kZXBlbmRlbmNpZXMvZ3J1bnQuanMnO1xuaW1wb3J0IEludGVudGlvbmFsQW55IGZyb20gJy4uLy4uLy4uL3BoZXQtY29yZS9qcy90eXBlcy9JbnRlbnRpb25hbEFueS5qcyc7XG5pbXBvcnQgbWluaWZ5IGZyb20gJy4vbWluaWZ5LmpzJztcblxuLyoqXG4gKiBDb3B5IGEgZGlyZWN0b3J5IGFuZCBhbGwgb2YgaXRzIGNvbnRlbnRzIHJlY3Vyc2l2ZWx5XG4gKlxuICogQGF1dGhvciBTYW0gUmVpZCAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcbiAqXG4gKiBAcGFyYW0gc3JjIC0gdGhlIHNvdXJjZSBkaXJlY3RvcnlcbiAqIEBwYXJhbSBkc3QgLSB0aGUgZGVzdGluYXRpb24gZGlyZWN0b3J5XG4gKiBAcGFyYW0gW2ZpbHRlcl0gLSBydWxlcyBmb3IgZmlsdGVyaW5nIGZpbGVzLiAgSWYgcmV0dXJucyBmYWxzeSwgdGhlbiB0aGUgZmlsZSB3aWxsIGJlIGNvcGllZCBkaXJlY3RseSAoaGVscHMgd2l0aCBpbWFnZXMpXG4gKiBAcGFyYW0gW29wdGlvbnNdXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGNvcHlEaXJlY3RvcnkoIHNyYzogc3RyaW5nLCBkc3Q6IHN0cmluZywgZmlsdGVyPzogKCBmaWxlbmFtZTogc3RyaW5nLCBjb250ZW50czogc3RyaW5nICkgPT4gc3RyaW5nIHwgbnVsbCwgb3B0aW9ucz86IEludGVudGlvbmFsQW55ICk6IHZvaWQge1xuXG4gIG9wdGlvbnMgPSBfLmFzc2lnbkluKCB7XG4gICAgZmFpbE9uRXhpc3RpbmdGaWxlczogZmFsc2UsXG4gICAgZXhjbHVkZTogW10sIC8vIGxpc3QgdG8gZXhjbHVkZVxuICAgIG1pbmlmeUpTOiBmYWxzZSxcbiAgICBtaW5pZnlPcHRpb25zOiB7fSxcbiAgICBsaWNlbnNlVG9QcmVwZW5kOiAnJ1xuICB9LCBvcHRpb25zICk7XG5cbiAgLy8gQ29weSBidWlsdCBzaW0gZmlsZXMgKGFzc3VtaW5nIHRoZXkgZXhpc3QgZnJvbSBhIHByaW9yIGdydW50IGNvbW1hbmQpXG4gIGdydW50LmZpbGUucmVjdXJzZSggc3JjLCAoIGFic3BhdGgsIHJvb3RkaXIsIHN1YmRpciwgZmlsZW5hbWUgKSA9PiB7XG5cblxuICAgIGxldCBpc0V4Y2x1ZGVkRGlyID0gZmFsc2U7XG4gICAgc3ViZGlyICYmIHN1YmRpci5zcGxpdCggJy8nICkuZm9yRWFjaCggcGF0aFBhcnQgPT4ge1xuXG4gICAgICAvLyBFeGNsdWRlIGFsbCBkaXJlY3RvcmllcyB0aGF0IGFyZSBpbiB0aGUgZXhjbHVkZWQgbGlzdFxuICAgICAgaWYgKCBvcHRpb25zLmV4Y2x1ZGUuaW5kZXhPZiggcGF0aFBhcnQgKSA+PSAwICkge1xuICAgICAgICBpc0V4Y2x1ZGVkRGlyID0gdHJ1ZTtcbiAgICAgIH1cbiAgICB9ICk7XG5cbiAgICAvLyBFeGl0IG91dCBpZiB0aGUgZmlsZSBpcyBleGNsdWRlZCBvciBpZiBpdCBpcyBpbiBhIGV4Y2x1ZGVkIGRpci5cbiAgICBpZiAoIGlzRXhjbHVkZWREaXIgfHwgb3B0aW9ucy5leGNsdWRlLmluZGV4T2YoIGZpbGVuYW1lICkgPj0gMCApIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBjb250ZW50cyA9IGdydW50LmZpbGUucmVhZCggYWJzcGF0aCApO1xuXG4gICAgY29uc3QgZHN0UGF0aCA9IHN1YmRpciA/ICggYCR7ZHN0fS8ke3N1YmRpcn0vJHtmaWxlbmFtZX1gICkgOiAoIGAke2RzdH0vJHtmaWxlbmFtZX1gICk7XG5cbiAgICBpZiAoIG9wdGlvbnMuZmFpbE9uRXhpc3RpbmdGaWxlcyAmJiBncnVudC5maWxlLmV4aXN0cyggZHN0UGF0aCApICkge1xuICAgICAgYXNzZXJ0ICYmIGFzc2VydCggZmFsc2UsICdmaWxlIGV4aXN0ZWQgYWxyZWFkeScgKTtcbiAgICB9XG4gICAgbGV0IGZpbHRlcmVkQ29udGVudHMgPSBmaWx0ZXIgJiYgZmlsdGVyKCBhYnNwYXRoLCBjb250ZW50cyApO1xuXG4gICAgLy8gTWluaWZ5IHRoZSBmaWxlIGlmIGl0IGlzIGphdmFzY3JpcHQgY29kZVxuICAgIGlmICggb3B0aW9ucy5taW5pZnlKUyAmJiBmaWxlbmFtZS5lbmRzV2l0aCggJy5qcycgKSAmJiAhYWJzcGF0aC5pbmNsdWRlcyggJ2NoaXBwZXIvdGVtcGxhdGVzLycgKSApIHtcbiAgICAgIGNvbnN0IHRvQmVNaW5pZmllZCA9IGZpbHRlcmVkQ29udGVudHMgPyBmaWx0ZXJlZENvbnRlbnRzIDogY29udGVudHM7XG4gICAgICBmaWx0ZXJlZENvbnRlbnRzID0gbWluaWZ5KCB0b0JlTWluaWZpZWQsIG9wdGlvbnMubWluaWZ5T3B0aW9ucyApO1xuXG4gICAgICAvLyBPbmx5IGFkZCB0aGUgbGljZW5zZSB0byB0aGUgamF2YXNjcmlwdCBjb2RlXG4gICAgICBmaWx0ZXJlZENvbnRlbnRzID0gb3B0aW9ucy5saWNlbnNlVG9QcmVwZW5kICsgZmlsdGVyZWRDb250ZW50cztcbiAgICB9XG5cbiAgICBpZiAoIGZpbHRlcmVkQ29udGVudHMgKSB7XG4gICAgICBncnVudC5maWxlLndyaXRlKCBkc3RQYXRoLCBmaWx0ZXJlZENvbnRlbnRzICk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgZ3J1bnQuZmlsZS5jb3B5KCBhYnNwYXRoLCBkc3RQYXRoICk7XG4gICAgfVxuICB9ICk7XG59Il0sIm5hbWVzIjpbImFzc2VydCIsIl8iLCJncnVudCIsIm1pbmlmeSIsImNvcHlEaXJlY3RvcnkiLCJzcmMiLCJkc3QiLCJmaWx0ZXIiLCJvcHRpb25zIiwiYXNzaWduSW4iLCJmYWlsT25FeGlzdGluZ0ZpbGVzIiwiZXhjbHVkZSIsIm1pbmlmeUpTIiwibWluaWZ5T3B0aW9ucyIsImxpY2Vuc2VUb1ByZXBlbmQiLCJmaWxlIiwicmVjdXJzZSIsImFic3BhdGgiLCJyb290ZGlyIiwic3ViZGlyIiwiZmlsZW5hbWUiLCJpc0V4Y2x1ZGVkRGlyIiwic3BsaXQiLCJmb3JFYWNoIiwicGF0aFBhcnQiLCJpbmRleE9mIiwiY29udGVudHMiLCJyZWFkIiwiZHN0UGF0aCIsImV4aXN0cyIsImZpbHRlcmVkQ29udGVudHMiLCJlbmRzV2l0aCIsImluY2x1ZGVzIiwidG9CZU1pbmlmaWVkIiwid3JpdGUiLCJjb3B5Il0sIm1hcHBpbmdzIjoiQUFBQSxzREFBc0Q7QUFFdEQsT0FBT0EsWUFBWSxTQUFTO0FBQzVCLE9BQU9DLE9BQU8sU0FBUztBQUN2QixPQUFPQyxXQUFXLHdEQUF3RDtBQUUxRSxPQUFPQyxZQUFZLGNBQWM7QUFFakM7Ozs7Ozs7OztDQVNDLEdBQ0QsZUFBZSxTQUFTQyxjQUFlQyxHQUFXLEVBQUVDLEdBQVcsRUFBRUMsTUFBZ0UsRUFBRUMsT0FBd0I7SUFFekpBLFVBQVVQLEVBQUVRLFFBQVEsQ0FBRTtRQUNwQkMscUJBQXFCO1FBQ3JCQyxTQUFTLEVBQUU7UUFDWEMsVUFBVTtRQUNWQyxlQUFlLENBQUM7UUFDaEJDLGtCQUFrQjtJQUNwQixHQUFHTjtJQUVILHdFQUF3RTtJQUN4RU4sTUFBTWEsSUFBSSxDQUFDQyxPQUFPLENBQUVYLEtBQUssQ0FBRVksU0FBU0MsU0FBU0MsUUFBUUM7UUFHbkQsSUFBSUMsZ0JBQWdCO1FBQ3BCRixVQUFVQSxPQUFPRyxLQUFLLENBQUUsS0FBTUMsT0FBTyxDQUFFQyxDQUFBQTtZQUVyQyx3REFBd0Q7WUFDeEQsSUFBS2hCLFFBQVFHLE9BQU8sQ0FBQ2MsT0FBTyxDQUFFRCxhQUFjLEdBQUk7Z0JBQzlDSCxnQkFBZ0I7WUFDbEI7UUFDRjtRQUVBLGtFQUFrRTtRQUNsRSxJQUFLQSxpQkFBaUJiLFFBQVFHLE9BQU8sQ0FBQ2MsT0FBTyxDQUFFTCxhQUFjLEdBQUk7WUFDL0Q7UUFDRjtRQUVBLE1BQU1NLFdBQVd4QixNQUFNYSxJQUFJLENBQUNZLElBQUksQ0FBRVY7UUFFbEMsTUFBTVcsVUFBVVQsU0FBVyxHQUFHYixJQUFJLENBQUMsRUFBRWEsT0FBTyxDQUFDLEVBQUVDLFVBQVUsR0FBTyxHQUFHZCxJQUFJLENBQUMsRUFBRWMsVUFBVTtRQUVwRixJQUFLWixRQUFRRSxtQkFBbUIsSUFBSVIsTUFBTWEsSUFBSSxDQUFDYyxNQUFNLENBQUVELFVBQVk7WUFDakU1QixVQUFVQSxPQUFRLE9BQU87UUFDM0I7UUFDQSxJQUFJOEIsbUJBQW1CdkIsVUFBVUEsT0FBUVUsU0FBU1M7UUFFbEQsMkNBQTJDO1FBQzNDLElBQUtsQixRQUFRSSxRQUFRLElBQUlRLFNBQVNXLFFBQVEsQ0FBRSxVQUFXLENBQUNkLFFBQVFlLFFBQVEsQ0FBRSx1QkFBeUI7WUFDakcsTUFBTUMsZUFBZUgsbUJBQW1CQSxtQkFBbUJKO1lBQzNESSxtQkFBbUIzQixPQUFROEIsY0FBY3pCLFFBQVFLLGFBQWE7WUFFOUQsOENBQThDO1lBQzlDaUIsbUJBQW1CdEIsUUFBUU0sZ0JBQWdCLEdBQUdnQjtRQUNoRDtRQUVBLElBQUtBLGtCQUFtQjtZQUN0QjVCLE1BQU1hLElBQUksQ0FBQ21CLEtBQUssQ0FBRU4sU0FBU0U7UUFDN0IsT0FDSztZQUNINUIsTUFBTWEsSUFBSSxDQUFDb0IsSUFBSSxDQUFFbEIsU0FBU1c7UUFDNUI7SUFDRjtBQUNGIn0=