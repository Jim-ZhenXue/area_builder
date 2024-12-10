/* eslint-disable phet/copyright */ /**
 * Adapted/copied from rule in https://github.com/minseoksuh/eslint-plugin-consistent-default-export-name/blob/de812b2194ca9435920776119a7f732b596b4d8b/lib/rules/default-import-match-filename.js
 * Simplified and striped of some logic not needed for PhET's context.
 *
 * @author Chiawen Chen (github: @golopot)
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */ const path = require('path');
const _ = require('lodash');
/**
 * @param {string} filename
 * @returns {string}
 */ function removeExtension(filename) {
    return path.basename(filename, path.extname(filename));
}
function matchesCamelCase(localName, filenameWithoutExtension) {
    return localName === _.camelCase(filenameWithoutExtension);
}
/**
 * Test if local name matches filename.
 * @param {string} localName
 * @param {string} filename
 * @returns {boolean}
 */ function isCompatible(localName, filename) {
    return localName === removeExtension(filename) || matchesCamelCase(localName, removeExtension(filename)) || localName === '_'; // lodash is allowed to be named differently
}
/**
 * Match 'foo' and '@foo/bar' but not 'foo/bar.js', './foo', or '@foo/bar/a.js'
 * @param {string} filePath
 * @returns {boolean}
 */ function isBarePackageImport(filePath) {
    return filePath !== '.' && filePath !== '..' && !filePath.includes('/') && !filePath.startsWith('@') || /@[^/]+\/[^/]+$/.test(filePath);
}
/**
 * Match paths consisting of only '.' and '..', like '.', './', '..', '../..'.
 * @param {string} filePath
 * @returns {boolean}
 */ function isAncestorRelativePath(filePath) {
    return filePath.length > 0 && !filePath.startsWith('/') && filePath.split(/[/\\]/).every((segment)=>segment === '..' || segment === '.' || segment === '');
}
/**
 * @param {string} packageJsonPath
 * @returns {string | undefined}
 */ function getPackageJsonName(packageJsonPath) {
    try {
        return require(packageJsonPath).name || undefined;
    } catch (e) {
        return undefined;
    }
}
function getNameFromPackageJsonOrDirname(filePath, context) {
    const directoryName = path.join(context.getFilename(), filePath, '..');
    const packageJsonPath = path.join(directoryName, 'package.json');
    const packageJsonName = getPackageJsonName(packageJsonPath);
    return packageJsonName || path.basename(directoryName);
}
/**
 * Get filename from a path.
 * @param {string} filePath
 * @param {object} context
 * @returns {string | undefined}
 */ function getFilename(filePath, context) {
    // like require('lodash')
    if (isBarePackageImport(filePath)) {
        return undefined;
    }
    const basename = path.basename(filePath);
    const isDir = /^index$|^index\./.test(basename);
    const processedPath = isDir ? path.dirname(filePath) : filePath;
    // like require('.'), require('..'), require('../..')
    if (isAncestorRelativePath(processedPath)) {
        return getNameFromPackageJsonOrDirname(processedPath, context);
    }
    return path.basename(processedPath) + (isDir ? '/' : '');
}
module.exports = {
    create: function(context) {
        return {
            ImportDeclaration (node) {
                const defaultImportSpecifier = node.specifiers.find(({ type })=>type === 'ImportDefaultSpecifier');
                const defaultImportName = defaultImportSpecifier && defaultImportSpecifier.local.name;
                if (!defaultImportName) {
                    return;
                }
                const filename = getFilename(node.source.value, context);
                if (!filename) {
                    return;
                }
                if (!isCompatible(defaultImportName, filename)) {
                    context.report({
                        node: defaultImportSpecifier,
                        message: `Default import name does not match filename "${filename}".`
                    });
                }
            }
        };
    }
};

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3BlcmVubmlhbC1hbGlhcy9qcy9lc2xpbnQvcGhldC1ydWxlcy9kZWZhdWx0LWltcG9ydC1tYXRjaC1maWxlbmFtZS5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvKiBlc2xpbnQtZGlzYWJsZSBwaGV0L2NvcHlyaWdodCAqL1xuXG4vKipcbiAqIEFkYXB0ZWQvY29waWVkIGZyb20gcnVsZSBpbiBodHRwczovL2dpdGh1Yi5jb20vbWluc2Vva3N1aC9lc2xpbnQtcGx1Z2luLWNvbnNpc3RlbnQtZGVmYXVsdC1leHBvcnQtbmFtZS9ibG9iL2RlODEyYjIxOTRjYTk0MzU5MjA3NzYxMTlhN2Y3MzJiNTk2YjRkOGIvbGliL3J1bGVzL2RlZmF1bHQtaW1wb3J0LW1hdGNoLWZpbGVuYW1lLmpzXG4gKiBTaW1wbGlmaWVkIGFuZCBzdHJpcGVkIG9mIHNvbWUgbG9naWMgbm90IG5lZWRlZCBmb3IgUGhFVCdzIGNvbnRleHQuXG4gKlxuICogQGF1dGhvciBDaGlhd2VuIENoZW4gKGdpdGh1YjogQGdvbG9wb3QpXG4gKiBAYXV0aG9yIE1pY2hhZWwgS2F1em1hbm4gKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXG4gKi9cblxuY29uc3QgcGF0aCA9IHJlcXVpcmUoICdwYXRoJyApO1xuY29uc3QgXyA9IHJlcXVpcmUoICdsb2Rhc2gnICk7XG5cbi8qKlxuICogQHBhcmFtIHtzdHJpbmd9IGZpbGVuYW1lXG4gKiBAcmV0dXJucyB7c3RyaW5nfVxuICovXG5mdW5jdGlvbiByZW1vdmVFeHRlbnNpb24oIGZpbGVuYW1lICkge1xuICByZXR1cm4gcGF0aC5iYXNlbmFtZSggZmlsZW5hbWUsIHBhdGguZXh0bmFtZSggZmlsZW5hbWUgKSApO1xufVxuXG5mdW5jdGlvbiBtYXRjaGVzQ2FtZWxDYXNlKCBsb2NhbE5hbWUsIGZpbGVuYW1lV2l0aG91dEV4dGVuc2lvbiApIHtcbiAgcmV0dXJuIGxvY2FsTmFtZSA9PT0gXy5jYW1lbENhc2UoIGZpbGVuYW1lV2l0aG91dEV4dGVuc2lvbiApO1xufVxuXG4vKipcbiAqIFRlc3QgaWYgbG9jYWwgbmFtZSBtYXRjaGVzIGZpbGVuYW1lLlxuICogQHBhcmFtIHtzdHJpbmd9IGxvY2FsTmFtZVxuICogQHBhcmFtIHtzdHJpbmd9IGZpbGVuYW1lXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAqL1xuZnVuY3Rpb24gaXNDb21wYXRpYmxlKCBsb2NhbE5hbWUsIGZpbGVuYW1lICkge1xuICByZXR1cm4gbG9jYWxOYW1lID09PSByZW1vdmVFeHRlbnNpb24oIGZpbGVuYW1lICkgfHxcbiAgICAgICAgIG1hdGNoZXNDYW1lbENhc2UoIGxvY2FsTmFtZSwgcmVtb3ZlRXh0ZW5zaW9uKCBmaWxlbmFtZSApICkgfHxcbiAgICAgICAgIGxvY2FsTmFtZSA9PT0gJ18nOyAvLyBsb2Rhc2ggaXMgYWxsb3dlZCB0byBiZSBuYW1lZCBkaWZmZXJlbnRseVxufVxuXG4vKipcbiAqIE1hdGNoICdmb28nIGFuZCAnQGZvby9iYXInIGJ1dCBub3QgJ2Zvby9iYXIuanMnLCAnLi9mb28nLCBvciAnQGZvby9iYXIvYS5qcydcbiAqIEBwYXJhbSB7c3RyaW5nfSBmaWxlUGF0aFxuICogQHJldHVybnMge2Jvb2xlYW59XG4gKi9cbmZ1bmN0aW9uIGlzQmFyZVBhY2thZ2VJbXBvcnQoIGZpbGVQYXRoICkge1xuICByZXR1cm4gKFxuICAgICggZmlsZVBhdGggIT09ICcuJyAmJlxuICAgICAgZmlsZVBhdGggIT09ICcuLicgJiZcbiAgICAgICFmaWxlUGF0aC5pbmNsdWRlcyggJy8nICkgJiZcbiAgICAgICFmaWxlUGF0aC5zdGFydHNXaXRoKCAnQCcgKSApIHx8XG4gICAgL0BbXi9dK1xcL1teL10rJC8udGVzdCggZmlsZVBhdGggKVxuICApO1xufVxuXG4vKipcbiAqIE1hdGNoIHBhdGhzIGNvbnNpc3Rpbmcgb2Ygb25seSAnLicgYW5kICcuLicsIGxpa2UgJy4nLCAnLi8nLCAnLi4nLCAnLi4vLi4nLlxuICogQHBhcmFtIHtzdHJpbmd9IGZpbGVQYXRoXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAqL1xuZnVuY3Rpb24gaXNBbmNlc3RvclJlbGF0aXZlUGF0aCggZmlsZVBhdGggKSB7XG4gIHJldHVybiAoXG4gICAgZmlsZVBhdGgubGVuZ3RoID4gMCAmJlxuICAgICFmaWxlUGF0aC5zdGFydHNXaXRoKCAnLycgKSAmJlxuICAgIGZpbGVQYXRoXG4gICAgICAuc3BsaXQoIC9bL1xcXFxdLyApXG4gICAgICAuZXZlcnkoXG4gICAgICAgIHNlZ21lbnQgPT5cbiAgICAgICAgICBzZWdtZW50ID09PSAnLi4nIHx8IHNlZ21lbnQgPT09ICcuJyB8fCBzZWdtZW50ID09PSAnJ1xuICAgICAgKVxuICApO1xufVxuXG4vKipcbiAqIEBwYXJhbSB7c3RyaW5nfSBwYWNrYWdlSnNvblBhdGhcbiAqIEByZXR1cm5zIHtzdHJpbmcgfCB1bmRlZmluZWR9XG4gKi9cbmZ1bmN0aW9uIGdldFBhY2thZ2VKc29uTmFtZSggcGFja2FnZUpzb25QYXRoICkge1xuICB0cnkge1xuICAgIHJldHVybiByZXF1aXJlKCBwYWNrYWdlSnNvblBhdGggKS5uYW1lIHx8IHVuZGVmaW5lZDtcbiAgfVxuICBjYXRjaCggZSApIHtcbiAgICByZXR1cm4gdW5kZWZpbmVkO1xuICB9XG59XG5cbmZ1bmN0aW9uIGdldE5hbWVGcm9tUGFja2FnZUpzb25PckRpcm5hbWUoIGZpbGVQYXRoLCBjb250ZXh0ICkge1xuICBjb25zdCBkaXJlY3RvcnlOYW1lID0gcGF0aC5qb2luKCBjb250ZXh0LmdldEZpbGVuYW1lKCksIGZpbGVQYXRoLCAnLi4nICk7XG4gIGNvbnN0IHBhY2thZ2VKc29uUGF0aCA9IHBhdGguam9pbiggZGlyZWN0b3J5TmFtZSwgJ3BhY2thZ2UuanNvbicgKTtcbiAgY29uc3QgcGFja2FnZUpzb25OYW1lID0gZ2V0UGFja2FnZUpzb25OYW1lKCBwYWNrYWdlSnNvblBhdGggKTtcbiAgcmV0dXJuIHBhY2thZ2VKc29uTmFtZSB8fCBwYXRoLmJhc2VuYW1lKCBkaXJlY3RvcnlOYW1lICk7XG59XG5cbi8qKlxuICogR2V0IGZpbGVuYW1lIGZyb20gYSBwYXRoLlxuICogQHBhcmFtIHtzdHJpbmd9IGZpbGVQYXRoXG4gKiBAcGFyYW0ge29iamVjdH0gY29udGV4dFxuICogQHJldHVybnMge3N0cmluZyB8IHVuZGVmaW5lZH1cbiAqL1xuZnVuY3Rpb24gZ2V0RmlsZW5hbWUoIGZpbGVQYXRoLCBjb250ZXh0ICkge1xuICAvLyBsaWtlIHJlcXVpcmUoJ2xvZGFzaCcpXG4gIGlmICggaXNCYXJlUGFja2FnZUltcG9ydCggZmlsZVBhdGggKSApIHtcbiAgICByZXR1cm4gdW5kZWZpbmVkO1xuICB9XG5cbiAgY29uc3QgYmFzZW5hbWUgPSBwYXRoLmJhc2VuYW1lKCBmaWxlUGF0aCApO1xuXG4gIGNvbnN0IGlzRGlyID0gL15pbmRleCR8XmluZGV4XFwuLy50ZXN0KCBiYXNlbmFtZSApO1xuICBjb25zdCBwcm9jZXNzZWRQYXRoID0gaXNEaXIgPyBwYXRoLmRpcm5hbWUoIGZpbGVQYXRoICkgOiBmaWxlUGF0aDtcblxuICAvLyBsaWtlIHJlcXVpcmUoJy4nKSwgcmVxdWlyZSgnLi4nKSwgcmVxdWlyZSgnLi4vLi4nKVxuICBpZiAoIGlzQW5jZXN0b3JSZWxhdGl2ZVBhdGgoIHByb2Nlc3NlZFBhdGggKSApIHtcbiAgICByZXR1cm4gZ2V0TmFtZUZyb21QYWNrYWdlSnNvbk9yRGlybmFtZSggcHJvY2Vzc2VkUGF0aCwgY29udGV4dCApO1xuICB9XG5cbiAgcmV0dXJuIHBhdGguYmFzZW5hbWUoIHByb2Nlc3NlZFBhdGggKSArICggaXNEaXIgPyAnLycgOiAnJyApO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgY3JlYXRlOiBmdW5jdGlvbiggY29udGV4dCApIHtcblxuICAgIHJldHVybiB7XG4gICAgICBJbXBvcnREZWNsYXJhdGlvbiggbm9kZSApIHtcbiAgICAgICAgY29uc3QgZGVmYXVsdEltcG9ydFNwZWNpZmllciA9IG5vZGUuc3BlY2lmaWVycy5maW5kKFxuICAgICAgICAgICggeyB0eXBlIH0gKSA9PiB0eXBlID09PSAnSW1wb3J0RGVmYXVsdFNwZWNpZmllcidcbiAgICAgICAgKTtcblxuICAgICAgICBjb25zdCBkZWZhdWx0SW1wb3J0TmFtZSA9XG4gICAgICAgICAgZGVmYXVsdEltcG9ydFNwZWNpZmllciAmJiBkZWZhdWx0SW1wb3J0U3BlY2lmaWVyLmxvY2FsLm5hbWU7XG5cbiAgICAgICAgaWYgKCAhZGVmYXVsdEltcG9ydE5hbWUgKSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgZmlsZW5hbWUgPSBnZXRGaWxlbmFtZSggbm9kZS5zb3VyY2UudmFsdWUsIGNvbnRleHQgKTtcblxuICAgICAgICBpZiAoICFmaWxlbmFtZSApIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoXG4gICAgICAgICAgIWlzQ29tcGF0aWJsZSggZGVmYXVsdEltcG9ydE5hbWUsIGZpbGVuYW1lIClcbiAgICAgICAgKSB7XG4gICAgICAgICAgY29udGV4dC5yZXBvcnQoIHtcbiAgICAgICAgICAgIG5vZGU6IGRlZmF1bHRJbXBvcnRTcGVjaWZpZXIsXG4gICAgICAgICAgICBtZXNzYWdlOiBgRGVmYXVsdCBpbXBvcnQgbmFtZSBkb2VzIG5vdCBtYXRjaCBmaWxlbmFtZSBcIiR7ZmlsZW5hbWV9XCIuYFxuICAgICAgICAgIH0gKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH07XG4gIH1cbn07Il0sIm5hbWVzIjpbInBhdGgiLCJyZXF1aXJlIiwiXyIsInJlbW92ZUV4dGVuc2lvbiIsImZpbGVuYW1lIiwiYmFzZW5hbWUiLCJleHRuYW1lIiwibWF0Y2hlc0NhbWVsQ2FzZSIsImxvY2FsTmFtZSIsImZpbGVuYW1lV2l0aG91dEV4dGVuc2lvbiIsImNhbWVsQ2FzZSIsImlzQ29tcGF0aWJsZSIsImlzQmFyZVBhY2thZ2VJbXBvcnQiLCJmaWxlUGF0aCIsImluY2x1ZGVzIiwic3RhcnRzV2l0aCIsInRlc3QiLCJpc0FuY2VzdG9yUmVsYXRpdmVQYXRoIiwibGVuZ3RoIiwic3BsaXQiLCJldmVyeSIsInNlZ21lbnQiLCJnZXRQYWNrYWdlSnNvbk5hbWUiLCJwYWNrYWdlSnNvblBhdGgiLCJuYW1lIiwidW5kZWZpbmVkIiwiZSIsImdldE5hbWVGcm9tUGFja2FnZUpzb25PckRpcm5hbWUiLCJjb250ZXh0IiwiZGlyZWN0b3J5TmFtZSIsImpvaW4iLCJnZXRGaWxlbmFtZSIsInBhY2thZ2VKc29uTmFtZSIsImlzRGlyIiwicHJvY2Vzc2VkUGF0aCIsImRpcm5hbWUiLCJtb2R1bGUiLCJleHBvcnRzIiwiY3JlYXRlIiwiSW1wb3J0RGVjbGFyYXRpb24iLCJub2RlIiwiZGVmYXVsdEltcG9ydFNwZWNpZmllciIsInNwZWNpZmllcnMiLCJmaW5kIiwidHlwZSIsImRlZmF1bHRJbXBvcnROYW1lIiwibG9jYWwiLCJzb3VyY2UiLCJ2YWx1ZSIsInJlcG9ydCIsIm1lc3NhZ2UiXSwibWFwcGluZ3MiOiJBQUFBLGlDQUFpQyxHQUVqQzs7Ozs7O0NBTUMsR0FFRCxNQUFNQSxPQUFPQyxRQUFTO0FBQ3RCLE1BQU1DLElBQUlELFFBQVM7QUFFbkI7OztDQUdDLEdBQ0QsU0FBU0UsZ0JBQWlCQyxRQUFRO0lBQ2hDLE9BQU9KLEtBQUtLLFFBQVEsQ0FBRUQsVUFBVUosS0FBS00sT0FBTyxDQUFFRjtBQUNoRDtBQUVBLFNBQVNHLGlCQUFrQkMsU0FBUyxFQUFFQyx3QkFBd0I7SUFDNUQsT0FBT0QsY0FBY04sRUFBRVEsU0FBUyxDQUFFRDtBQUNwQztBQUVBOzs7OztDQUtDLEdBQ0QsU0FBU0UsYUFBY0gsU0FBUyxFQUFFSixRQUFRO0lBQ3hDLE9BQU9JLGNBQWNMLGdCQUFpQkMsYUFDL0JHLGlCQUFrQkMsV0FBV0wsZ0JBQWlCQyxjQUM5Q0ksY0FBYyxLQUFLLDRDQUE0QztBQUN4RTtBQUVBOzs7O0NBSUMsR0FDRCxTQUFTSSxvQkFBcUJDLFFBQVE7SUFDcEMsT0FDRSxBQUFFQSxhQUFhLE9BQ2JBLGFBQWEsUUFDYixDQUFDQSxTQUFTQyxRQUFRLENBQUUsUUFDcEIsQ0FBQ0QsU0FBU0UsVUFBVSxDQUFFLFFBQ3hCLGlCQUFpQkMsSUFBSSxDQUFFSDtBQUUzQjtBQUVBOzs7O0NBSUMsR0FDRCxTQUFTSSx1QkFBd0JKLFFBQVE7SUFDdkMsT0FDRUEsU0FBU0ssTUFBTSxHQUFHLEtBQ2xCLENBQUNMLFNBQVNFLFVBQVUsQ0FBRSxRQUN0QkYsU0FDR00sS0FBSyxDQUFFLFNBQ1BDLEtBQUssQ0FDSkMsQ0FBQUEsVUFDRUEsWUFBWSxRQUFRQSxZQUFZLE9BQU9BLFlBQVk7QUFHN0Q7QUFFQTs7O0NBR0MsR0FDRCxTQUFTQyxtQkFBb0JDLGVBQWU7SUFDMUMsSUFBSTtRQUNGLE9BQU90QixRQUFTc0IsaUJBQWtCQyxJQUFJLElBQUlDO0lBQzVDLEVBQ0EsT0FBT0MsR0FBSTtRQUNULE9BQU9EO0lBQ1Q7QUFDRjtBQUVBLFNBQVNFLGdDQUFpQ2QsUUFBUSxFQUFFZSxPQUFPO0lBQ3pELE1BQU1DLGdCQUFnQjdCLEtBQUs4QixJQUFJLENBQUVGLFFBQVFHLFdBQVcsSUFBSWxCLFVBQVU7SUFDbEUsTUFBTVUsa0JBQWtCdkIsS0FBSzhCLElBQUksQ0FBRUQsZUFBZTtJQUNsRCxNQUFNRyxrQkFBa0JWLG1CQUFvQkM7SUFDNUMsT0FBT1MsbUJBQW1CaEMsS0FBS0ssUUFBUSxDQUFFd0I7QUFDM0M7QUFFQTs7Ozs7Q0FLQyxHQUNELFNBQVNFLFlBQWFsQixRQUFRLEVBQUVlLE9BQU87SUFDckMseUJBQXlCO0lBQ3pCLElBQUtoQixvQkFBcUJDLFdBQWE7UUFDckMsT0FBT1k7SUFDVDtJQUVBLE1BQU1wQixXQUFXTCxLQUFLSyxRQUFRLENBQUVRO0lBRWhDLE1BQU1vQixRQUFRLG1CQUFtQmpCLElBQUksQ0FBRVg7SUFDdkMsTUFBTTZCLGdCQUFnQkQsUUFBUWpDLEtBQUttQyxPQUFPLENBQUV0QixZQUFhQTtJQUV6RCxxREFBcUQ7SUFDckQsSUFBS0ksdUJBQXdCaUIsZ0JBQWtCO1FBQzdDLE9BQU9QLGdDQUFpQ08sZUFBZU47SUFDekQ7SUFFQSxPQUFPNUIsS0FBS0ssUUFBUSxDQUFFNkIsaUJBQW9CRCxDQUFBQSxRQUFRLE1BQU0sRUFBQztBQUMzRDtBQUVBRyxPQUFPQyxPQUFPLEdBQUc7SUFDZkMsUUFBUSxTQUFVVixPQUFPO1FBRXZCLE9BQU87WUFDTFcsbUJBQW1CQyxJQUFJO2dCQUNyQixNQUFNQyx5QkFBeUJELEtBQUtFLFVBQVUsQ0FBQ0MsSUFBSSxDQUNqRCxDQUFFLEVBQUVDLElBQUksRUFBRSxHQUFNQSxTQUFTO2dCQUczQixNQUFNQyxvQkFDSkosMEJBQTBCQSx1QkFBdUJLLEtBQUssQ0FBQ3RCLElBQUk7Z0JBRTdELElBQUssQ0FBQ3FCLG1CQUFvQjtvQkFDeEI7Z0JBQ0Y7Z0JBRUEsTUFBTXpDLFdBQVcyQixZQUFhUyxLQUFLTyxNQUFNLENBQUNDLEtBQUssRUFBRXBCO2dCQUVqRCxJQUFLLENBQUN4QixVQUFXO29CQUNmO2dCQUNGO2dCQUVBLElBQ0UsQ0FBQ08sYUFBY2tDLG1CQUFtQnpDLFdBQ2xDO29CQUNBd0IsUUFBUXFCLE1BQU0sQ0FBRTt3QkFDZFQsTUFBTUM7d0JBQ05TLFNBQVMsQ0FBQyw2Q0FBNkMsRUFBRTlDLFNBQVMsRUFBRSxDQUFDO29CQUN2RTtnQkFDRjtZQUNGO1FBQ0Y7SUFDRjtBQUNGIn0=