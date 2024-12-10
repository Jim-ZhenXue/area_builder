// Copyright 2013-2024, University of Colorado Boulder
function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
    try {
        var info = gen[key](arg);
        var value = info.value;
    } catch (error) {
        reject(error);
        return;
    }
    if (info.done) {
        resolve(value);
    } else {
        Promise.resolve(value).then(_next, _throw);
    }
}
function _async_to_generator(fn) {
    return function() {
        var self = this, args = arguments;
        return new Promise(function(resolve, reject) {
            var gen = fn.apply(self, args);
            function _next(value) {
                asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value);
            }
            function _throw(err) {
                asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err);
            }
            _next(undefined);
        });
    };
}
import fs from 'fs';
import _ from 'lodash';
import getRepo from '../../../../perennial-alias/js/grunt/tasks/util/getRepo.js';
import grunt from '../../../../perennial-alias/js/npm-dependencies/grunt.js';
import getCopyrightLine from '../getCopyrightLine.js';
/**
 * Update the copyright dates in JS source files based on Github dates
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */ // Grunt task that determines created and last modified dates from git, and
// updates copyright statements accordingly, see #403
const repo = getRepo();
const unsupportedExtensions = [
    '.json',
    'md'
];
const filesPredicate = (file)=>{
    if (_.some(unsupportedExtensions, (extension)=>file.endsWith(extension))) {
        return false;
    }
    if (file.startsWith('js/')) {
        return true;
    }
    return false;
};
function updateCopyrightDates(repo) {
    return _updateCopyrightDates.apply(this, arguments);
}
function _updateCopyrightDates() {
    _updateCopyrightDates = /**
 * @param repo - The repository name for the files to update
 * @param predicate - takes a repo-relative path {string} and returns {boolean} if the path should be updated.
 */ _async_to_generator(function*(repo, predicate = ()=>true) {
        let relativeFiles = [];
        grunt.file.recurse(`../${repo}`, (abspath, rootdir, subdir, filename)=>{
            relativeFiles.push(`${subdir}/${filename}`);
        });
        relativeFiles = relativeFiles.filter(filesPredicate).filter(predicate);
        for (const relativeFile of relativeFiles){
            yield updateCopyrightDate(repo, relativeFile);
        }
    });
    return _updateCopyrightDates.apply(this, arguments);
}
/**
 * @param repo - The repository of the file to update (should be a git root)
 * @param relativeFile - The filename relative to the repository root.
 * @param silent - if true, no console logging will occur
 */ const updateCopyrightDate = /*#__PURE__*/ _async_to_generator(function*(repo, relativeFile, silent = false) {
    const absPath = `../${repo}/${relativeFile}`;
    const fileText = fs.readFileSync(absPath, 'utf8');
    // Infer the line separator for the platform
    const firstR = fileText.indexOf('\r');
    const firstN = fileText.indexOf('\n');
    const lineSeparator = firstR >= 0 && firstR < firstN ? '\r' : '\n';
    // Parse by line separator
    const fileLines = fileText.split(lineSeparator); // splits using both unix and windows newlines
    // Check if the first line is already correct
    const firstLine = fileLines[0];
    const copyrightLine = yield getCopyrightLine(repo, relativeFile);
    // Update the line
    if (firstLine !== copyrightLine) {
        if (firstLine.startsWith('// Copyright')) {
            const concatted = [
                copyrightLine
            ].concat(fileLines.slice(1));
            const newFileContents = concatted.join(lineSeparator);
            fs.writeFileSync(absPath, newFileContents);
            !silent && console.log(`${absPath}, updated with ${copyrightLine}`);
        } else {
            !silent && console.log(`${absPath} FIRST LINE WAS NOT COPYRIGHT: ${firstLine}`);
        }
    }
});
_async_to_generator(function*() {
    yield updateCopyrightDates(repo);
})();

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL2pzL2dydW50L3Rhc2tzL3VwZGF0ZS1jb3B5cmlnaHQtZGF0ZXMudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTMtMjAyNCwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbmltcG9ydCBmcyBmcm9tICdmcyc7XG5pbXBvcnQgXyBmcm9tICdsb2Rhc2gnO1xuaW1wb3J0IGdldFJlcG8gZnJvbSAnLi4vLi4vLi4vLi4vcGVyZW5uaWFsLWFsaWFzL2pzL2dydW50L3Rhc2tzL3V0aWwvZ2V0UmVwby5qcyc7XG5pbXBvcnQgZ3J1bnQgZnJvbSAnLi4vLi4vLi4vLi4vcGVyZW5uaWFsLWFsaWFzL2pzL25wbS1kZXBlbmRlbmNpZXMvZ3J1bnQuanMnO1xuaW1wb3J0IGdldENvcHlyaWdodExpbmUgZnJvbSAnLi4vZ2V0Q29weXJpZ2h0TGluZS5qcyc7XG5cbi8qKlxuICogVXBkYXRlIHRoZSBjb3B5cmlnaHQgZGF0ZXMgaW4gSlMgc291cmNlIGZpbGVzIGJhc2VkIG9uIEdpdGh1YiBkYXRlc1xuICpcbiAqIEBhdXRob3IgU2FtIFJlaWQgKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXG4gKi9cblxuLy8gR3J1bnQgdGFzayB0aGF0IGRldGVybWluZXMgY3JlYXRlZCBhbmQgbGFzdCBtb2RpZmllZCBkYXRlcyBmcm9tIGdpdCwgYW5kXG4gIC8vIHVwZGF0ZXMgY29weXJpZ2h0IHN0YXRlbWVudHMgYWNjb3JkaW5nbHksIHNlZSAjNDAzXG5jb25zdCByZXBvID0gZ2V0UmVwbygpO1xuXG5cbmNvbnN0IHVuc3VwcG9ydGVkRXh0ZW5zaW9ucyA9IFsgJy5qc29uJywgJ21kJyBdO1xuXG5jb25zdCBmaWxlc1ByZWRpY2F0ZSA9ICggZmlsZTogc3RyaW5nICkgPT4ge1xuICBpZiAoIF8uc29tZSggdW5zdXBwb3J0ZWRFeHRlbnNpb25zLCBleHRlbnNpb24gPT4gZmlsZS5lbmRzV2l0aCggZXh0ZW5zaW9uICkgKSApIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgaWYgKCBmaWxlLnN0YXJ0c1dpdGgoICdqcy8nICkgKSB7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cbiAgcmV0dXJuIGZhbHNlO1xufTtcblxuLyoqXG4gKiBAcGFyYW0gcmVwbyAtIFRoZSByZXBvc2l0b3J5IG5hbWUgZm9yIHRoZSBmaWxlcyB0byB1cGRhdGVcbiAqIEBwYXJhbSBwcmVkaWNhdGUgLSB0YWtlcyBhIHJlcG8tcmVsYXRpdmUgcGF0aCB7c3RyaW5nfSBhbmQgcmV0dXJucyB7Ym9vbGVhbn0gaWYgdGhlIHBhdGggc2hvdWxkIGJlIHVwZGF0ZWQuXG4gKi9cbmFzeW5jIGZ1bmN0aW9uIHVwZGF0ZUNvcHlyaWdodERhdGVzKCByZXBvOiBzdHJpbmcsIHByZWRpY2F0ZSA9ICgpID0+IHRydWUgKTogUHJvbWlzZTx2b2lkPiB7XG4gIGxldCByZWxhdGl2ZUZpbGVzOiBzdHJpbmdbXSA9IFtdO1xuICBncnVudC5maWxlLnJlY3Vyc2UoIGAuLi8ke3JlcG99YCwgKCBhYnNwYXRoLCByb290ZGlyLCBzdWJkaXIsIGZpbGVuYW1lICkgPT4ge1xuICAgIHJlbGF0aXZlRmlsZXMucHVzaCggYCR7c3ViZGlyfS8ke2ZpbGVuYW1lfWAgKTtcbiAgfSApO1xuICByZWxhdGl2ZUZpbGVzID0gcmVsYXRpdmVGaWxlcy5maWx0ZXIoIGZpbGVzUHJlZGljYXRlICkuZmlsdGVyKCBwcmVkaWNhdGUgKTtcblxuICBmb3IgKCBjb25zdCByZWxhdGl2ZUZpbGUgb2YgcmVsYXRpdmVGaWxlcyApIHtcbiAgICBhd2FpdCB1cGRhdGVDb3B5cmlnaHREYXRlKCByZXBvLCByZWxhdGl2ZUZpbGUgKTtcbiAgfVxufVxuXG4vKipcbiAqIEBwYXJhbSByZXBvIC0gVGhlIHJlcG9zaXRvcnkgb2YgdGhlIGZpbGUgdG8gdXBkYXRlIChzaG91bGQgYmUgYSBnaXQgcm9vdClcbiAqIEBwYXJhbSByZWxhdGl2ZUZpbGUgLSBUaGUgZmlsZW5hbWUgcmVsYXRpdmUgdG8gdGhlIHJlcG9zaXRvcnkgcm9vdC5cbiAqIEBwYXJhbSBzaWxlbnQgLSBpZiB0cnVlLCBubyBjb25zb2xlIGxvZ2dpbmcgd2lsbCBvY2N1clxuICovXG5jb25zdCB1cGRhdGVDb3B5cmlnaHREYXRlID0gYXN5bmMgKCByZXBvOiBzdHJpbmcsIHJlbGF0aXZlRmlsZTogc3RyaW5nLCBzaWxlbnQgPSBmYWxzZSApOiBQcm9taXNlPHZvaWQ+ID0+IHtcbiAgY29uc3QgYWJzUGF0aCA9IGAuLi8ke3JlcG99LyR7cmVsYXRpdmVGaWxlfWA7XG4gIGNvbnN0IGZpbGVUZXh0ID0gZnMucmVhZEZpbGVTeW5jKCBhYnNQYXRoLCAndXRmOCcgKTtcblxuICAvLyBJbmZlciB0aGUgbGluZSBzZXBhcmF0b3IgZm9yIHRoZSBwbGF0Zm9ybVxuICBjb25zdCBmaXJzdFIgPSBmaWxlVGV4dC5pbmRleE9mKCAnXFxyJyApO1xuICBjb25zdCBmaXJzdE4gPSBmaWxlVGV4dC5pbmRleE9mKCAnXFxuJyApO1xuICBjb25zdCBsaW5lU2VwYXJhdG9yID0gZmlyc3RSID49IDAgJiYgZmlyc3RSIDwgZmlyc3ROID8gJ1xccicgOiAnXFxuJztcblxuICAvLyBQYXJzZSBieSBsaW5lIHNlcGFyYXRvclxuICBjb25zdCBmaWxlTGluZXMgPSBmaWxlVGV4dC5zcGxpdCggbGluZVNlcGFyYXRvciApOyAvLyBzcGxpdHMgdXNpbmcgYm90aCB1bml4IGFuZCB3aW5kb3dzIG5ld2xpbmVzXG5cbiAgLy8gQ2hlY2sgaWYgdGhlIGZpcnN0IGxpbmUgaXMgYWxyZWFkeSBjb3JyZWN0XG4gIGNvbnN0IGZpcnN0TGluZSA9IGZpbGVMaW5lc1sgMCBdO1xuICBjb25zdCBjb3B5cmlnaHRMaW5lID0gYXdhaXQgZ2V0Q29weXJpZ2h0TGluZSggcmVwbywgcmVsYXRpdmVGaWxlICk7XG5cbiAgLy8gVXBkYXRlIHRoZSBsaW5lXG4gIGlmICggZmlyc3RMaW5lICE9PSBjb3B5cmlnaHRMaW5lICkge1xuICAgIGlmICggZmlyc3RMaW5lLnN0YXJ0c1dpdGgoICcvLyBDb3B5cmlnaHQnICkgKSB7XG4gICAgICBjb25zdCBjb25jYXR0ZWQgPSBbIGNvcHlyaWdodExpbmUgXS5jb25jYXQoIGZpbGVMaW5lcy5zbGljZSggMSApICk7XG4gICAgICBjb25zdCBuZXdGaWxlQ29udGVudHMgPSBjb25jYXR0ZWQuam9pbiggbGluZVNlcGFyYXRvciApO1xuICAgICAgZnMud3JpdGVGaWxlU3luYyggYWJzUGF0aCwgbmV3RmlsZUNvbnRlbnRzICk7XG4gICAgICAhc2lsZW50ICYmIGNvbnNvbGUubG9nKCBgJHthYnNQYXRofSwgdXBkYXRlZCB3aXRoICR7Y29weXJpZ2h0TGluZX1gICk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgIXNpbGVudCAmJiBjb25zb2xlLmxvZyggYCR7YWJzUGF0aH0gRklSU1QgTElORSBXQVMgTk9UIENPUFlSSUdIVDogJHtmaXJzdExpbmV9YCApO1xuICAgIH1cbiAgfVxufTtcblxuKCBhc3luYyAoKSA9PiB7XG4gIGF3YWl0IHVwZGF0ZUNvcHlyaWdodERhdGVzKCByZXBvICk7XG59ICkoKTsiXSwibmFtZXMiOlsiZnMiLCJfIiwiZ2V0UmVwbyIsImdydW50IiwiZ2V0Q29weXJpZ2h0TGluZSIsInJlcG8iLCJ1bnN1cHBvcnRlZEV4dGVuc2lvbnMiLCJmaWxlc1ByZWRpY2F0ZSIsImZpbGUiLCJzb21lIiwiZXh0ZW5zaW9uIiwiZW5kc1dpdGgiLCJzdGFydHNXaXRoIiwidXBkYXRlQ29weXJpZ2h0RGF0ZXMiLCJwcmVkaWNhdGUiLCJyZWxhdGl2ZUZpbGVzIiwicmVjdXJzZSIsImFic3BhdGgiLCJyb290ZGlyIiwic3ViZGlyIiwiZmlsZW5hbWUiLCJwdXNoIiwiZmlsdGVyIiwicmVsYXRpdmVGaWxlIiwidXBkYXRlQ29weXJpZ2h0RGF0ZSIsInNpbGVudCIsImFic1BhdGgiLCJmaWxlVGV4dCIsInJlYWRGaWxlU3luYyIsImZpcnN0UiIsImluZGV4T2YiLCJmaXJzdE4iLCJsaW5lU2VwYXJhdG9yIiwiZmlsZUxpbmVzIiwic3BsaXQiLCJmaXJzdExpbmUiLCJjb3B5cmlnaHRMaW5lIiwiY29uY2F0dGVkIiwiY29uY2F0Iiwic2xpY2UiLCJuZXdGaWxlQ29udGVudHMiLCJqb2luIiwid3JpdGVGaWxlU3luYyIsImNvbnNvbGUiLCJsb2ciXSwibWFwcGluZ3MiOiJBQUFBLHNEQUFzRDs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBRXRELE9BQU9BLFFBQVEsS0FBSztBQUNwQixPQUFPQyxPQUFPLFNBQVM7QUFDdkIsT0FBT0MsYUFBYSw2REFBNkQ7QUFDakYsT0FBT0MsV0FBVywyREFBMkQ7QUFDN0UsT0FBT0Msc0JBQXNCLHlCQUF5QjtBQUV0RDs7OztDQUlDLEdBRUQsMkVBQTJFO0FBQ3pFLHFEQUFxRDtBQUN2RCxNQUFNQyxPQUFPSDtBQUdiLE1BQU1JLHdCQUF3QjtJQUFFO0lBQVM7Q0FBTTtBQUUvQyxNQUFNQyxpQkFBaUIsQ0FBRUM7SUFDdkIsSUFBS1AsRUFBRVEsSUFBSSxDQUFFSCx1QkFBdUJJLENBQUFBLFlBQWFGLEtBQUtHLFFBQVEsQ0FBRUQsYUFBZ0I7UUFDOUUsT0FBTztJQUNUO0lBQ0EsSUFBS0YsS0FBS0ksVUFBVSxDQUFFLFFBQVU7UUFDOUIsT0FBTztJQUNUO0lBQ0EsT0FBTztBQUNUO1NBTWVDLHFCQUFzQlIsSUFBWTtXQUFsQ1E7O1NBQUFBO0lBQUFBLHdCQUpmOzs7Q0FHQyxHQUNELG9CQUFBLFVBQXFDUixJQUFZLEVBQUVTLFlBQVksSUFBTSxJQUFJO1FBQ3ZFLElBQUlDLGdCQUEwQixFQUFFO1FBQ2hDWixNQUFNSyxJQUFJLENBQUNRLE9BQU8sQ0FBRSxDQUFDLEdBQUcsRUFBRVgsTUFBTSxFQUFFLENBQUVZLFNBQVNDLFNBQVNDLFFBQVFDO1lBQzVETCxjQUFjTSxJQUFJLENBQUUsR0FBR0YsT0FBTyxDQUFDLEVBQUVDLFVBQVU7UUFDN0M7UUFDQUwsZ0JBQWdCQSxjQUFjTyxNQUFNLENBQUVmLGdCQUFpQmUsTUFBTSxDQUFFUjtRQUUvRCxLQUFNLE1BQU1TLGdCQUFnQlIsY0FBZ0I7WUFDMUMsTUFBTVMsb0JBQXFCbkIsTUFBTWtCO1FBQ25DO0lBQ0Y7V0FWZVY7O0FBWWY7Ozs7Q0FJQyxHQUNELE1BQU1XLHdEQUFzQixVQUFRbkIsTUFBY2tCLGNBQXNCRSxTQUFTLEtBQUs7SUFDcEYsTUFBTUMsVUFBVSxDQUFDLEdBQUcsRUFBRXJCLEtBQUssQ0FBQyxFQUFFa0IsY0FBYztJQUM1QyxNQUFNSSxXQUFXM0IsR0FBRzRCLFlBQVksQ0FBRUYsU0FBUztJQUUzQyw0Q0FBNEM7SUFDNUMsTUFBTUcsU0FBU0YsU0FBU0csT0FBTyxDQUFFO0lBQ2pDLE1BQU1DLFNBQVNKLFNBQVNHLE9BQU8sQ0FBRTtJQUNqQyxNQUFNRSxnQkFBZ0JILFVBQVUsS0FBS0EsU0FBU0UsU0FBUyxPQUFPO0lBRTlELDBCQUEwQjtJQUMxQixNQUFNRSxZQUFZTixTQUFTTyxLQUFLLENBQUVGLGdCQUFpQiw4Q0FBOEM7SUFFakcsNkNBQTZDO0lBQzdDLE1BQU1HLFlBQVlGLFNBQVMsQ0FBRSxFQUFHO0lBQ2hDLE1BQU1HLGdCQUFnQixNQUFNaEMsaUJBQWtCQyxNQUFNa0I7SUFFcEQsa0JBQWtCO0lBQ2xCLElBQUtZLGNBQWNDLGVBQWdCO1FBQ2pDLElBQUtELFVBQVV2QixVQUFVLENBQUUsaUJBQW1CO1lBQzVDLE1BQU15QixZQUFZO2dCQUFFRDthQUFlLENBQUNFLE1BQU0sQ0FBRUwsVUFBVU0sS0FBSyxDQUFFO1lBQzdELE1BQU1DLGtCQUFrQkgsVUFBVUksSUFBSSxDQUFFVDtZQUN4Q2hDLEdBQUcwQyxhQUFhLENBQUVoQixTQUFTYztZQUMzQixDQUFDZixVQUFVa0IsUUFBUUMsR0FBRyxDQUFFLEdBQUdsQixRQUFRLGVBQWUsRUFBRVUsZUFBZTtRQUNyRSxPQUNLO1lBQ0gsQ0FBQ1gsVUFBVWtCLFFBQVFDLEdBQUcsQ0FBRSxHQUFHbEIsUUFBUSwrQkFBK0IsRUFBRVMsV0FBVztRQUNqRjtJQUNGO0FBQ0Y7QUFFRSxvQkFBQTtJQUNBLE1BQU10QixxQkFBc0JSO0FBQzlCIn0=