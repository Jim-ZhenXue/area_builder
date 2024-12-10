// Copyright 2015-2024, University of Colorado Boulder
/**
 * Report which media files (such as images and sounds) from a sim were not used in the simulation with a require
 * statement.
 *
 * Each time a resource is loaded by a plugin (image, sounds, mipmap,...) its license info is added to this global by
 * the plugin.  After all resources are loaded, the global will contain the list of all resources that are actually used
 * by the sim.  Comparing what's in the filesystem to this list identifies resources that are unused.
 *
 * See https://github.com/phetsims/chipper/issues/172
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Denzell Barnett (Phet Interactive Simulations)
 * @author Jonathan Olson (PhET Interactive Simulations)
 */ // modules
import ChipperConstants from '../../../chipper/js/common/ChipperConstants.js';
import grunt from '../../../perennial-alias/js/npm-dependencies/grunt.js';
/**
 * @param usedModules - Used modules within the repo
 * @param repo - Name of the repo
 */ export default ((repo, usedModules)=>{
    // on Windows, paths are reported with a backslash, normalize to forward slashes so this works everywhere
    const normalizedUsedModules = usedModules.map((module)=>module.split('\\').join('/'));
    ChipperConstants.MEDIA_TYPES.forEach((mediaType)=>{
        // Iterate over media directories and sub-directories
        const subdirectory = `../${repo}/${mediaType}`;
        if (grunt.file.isDir(subdirectory)) {
            grunt.file.recurse(subdirectory, (abspath, rootdir, subdir, filename)=>{
                if (filename !== 'license.json' && filename !== 'README.md' && filename.includes('.js')) {
                    const module = subdir ? `${repo}/${mediaType}/${subdir}/${filename}` : `${repo}/${mediaType}/${filename}`;
                    // If no licenseEntries were registered, or some were registered but not one corresponding to this file
                    if (!normalizedUsedModules.includes(`chipper/dist/js/${module}`)) {
                        grunt.log.warn(`Unused ${mediaType} module: ${module}`);
                    }
                }
            });
        }
    });
});

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2pzL2dydW50L3JlcG9ydFVudXNlZE1lZGlhLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE1LTIwMjQsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIFJlcG9ydCB3aGljaCBtZWRpYSBmaWxlcyAoc3VjaCBhcyBpbWFnZXMgYW5kIHNvdW5kcykgZnJvbSBhIHNpbSB3ZXJlIG5vdCB1c2VkIGluIHRoZSBzaW11bGF0aW9uIHdpdGggYSByZXF1aXJlXG4gKiBzdGF0ZW1lbnQuXG4gKlxuICogRWFjaCB0aW1lIGEgcmVzb3VyY2UgaXMgbG9hZGVkIGJ5IGEgcGx1Z2luIChpbWFnZSwgc291bmRzLCBtaXBtYXAsLi4uKSBpdHMgbGljZW5zZSBpbmZvIGlzIGFkZGVkIHRvIHRoaXMgZ2xvYmFsIGJ5XG4gKiB0aGUgcGx1Z2luLiAgQWZ0ZXIgYWxsIHJlc291cmNlcyBhcmUgbG9hZGVkLCB0aGUgZ2xvYmFsIHdpbGwgY29udGFpbiB0aGUgbGlzdCBvZiBhbGwgcmVzb3VyY2VzIHRoYXQgYXJlIGFjdHVhbGx5IHVzZWRcbiAqIGJ5IHRoZSBzaW0uICBDb21wYXJpbmcgd2hhdCdzIGluIHRoZSBmaWxlc3lzdGVtIHRvIHRoaXMgbGlzdCBpZGVudGlmaWVzIHJlc291cmNlcyB0aGF0IGFyZSB1bnVzZWQuXG4gKlxuICogU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9jaGlwcGVyL2lzc3Vlcy8xNzJcbiAqXG4gKiBAYXV0aG9yIFNhbSBSZWlkIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxuICogQGF1dGhvciBEZW56ZWxsIEJhcm5ldHQgKFBoZXQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXG4gKiBAYXV0aG9yIEpvbmF0aGFuIE9sc29uIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxuICovXG5cbi8vIG1vZHVsZXNcbmltcG9ydCBDaGlwcGVyQ29uc3RhbnRzIGZyb20gJy4uLy4uLy4uL2NoaXBwZXIvanMvY29tbW9uL0NoaXBwZXJDb25zdGFudHMuanMnO1xuaW1wb3J0IGdydW50IGZyb20gJy4uLy4uLy4uL3BlcmVubmlhbC1hbGlhcy9qcy9ucG0tZGVwZW5kZW5jaWVzL2dydW50LmpzJztcblxuLyoqXG4gKiBAcGFyYW0gdXNlZE1vZHVsZXMgLSBVc2VkIG1vZHVsZXMgd2l0aGluIHRoZSByZXBvXG4gKiBAcGFyYW0gcmVwbyAtIE5hbWUgb2YgdGhlIHJlcG9cbiAqL1xuZXhwb3J0IGRlZmF1bHQgKCByZXBvOiBzdHJpbmcsIHVzZWRNb2R1bGVzOiBzdHJpbmdbXSApOiB2b2lkID0+IHtcblxuICAvLyBvbiBXaW5kb3dzLCBwYXRocyBhcmUgcmVwb3J0ZWQgd2l0aCBhIGJhY2tzbGFzaCwgbm9ybWFsaXplIHRvIGZvcndhcmQgc2xhc2hlcyBzbyB0aGlzIHdvcmtzIGV2ZXJ5d2hlcmVcbiAgY29uc3Qgbm9ybWFsaXplZFVzZWRNb2R1bGVzID0gdXNlZE1vZHVsZXMubWFwKCBtb2R1bGUgPT4gbW9kdWxlLnNwbGl0KCAnXFxcXCcgKS5qb2luKCAnLycgKSApO1xuXG4gIENoaXBwZXJDb25zdGFudHMuTUVESUFfVFlQRVMuZm9yRWFjaCggbWVkaWFUeXBlID0+IHtcblxuICAgIC8vIEl0ZXJhdGUgb3ZlciBtZWRpYSBkaXJlY3RvcmllcyBhbmQgc3ViLWRpcmVjdG9yaWVzXG4gICAgY29uc3Qgc3ViZGlyZWN0b3J5ID0gYC4uLyR7cmVwb30vJHttZWRpYVR5cGV9YDtcbiAgICBpZiAoIGdydW50LmZpbGUuaXNEaXIoIHN1YmRpcmVjdG9yeSApICkge1xuICAgICAgZ3J1bnQuZmlsZS5yZWN1cnNlKCBzdWJkaXJlY3RvcnksICggYWJzcGF0aCwgcm9vdGRpciwgc3ViZGlyLCBmaWxlbmFtZSApID0+IHtcblxuICAgICAgICBpZiAoIGZpbGVuYW1lICE9PSAnbGljZW5zZS5qc29uJyAmJiBmaWxlbmFtZSAhPT0gJ1JFQURNRS5tZCcgJiYgZmlsZW5hbWUuaW5jbHVkZXMoICcuanMnICkgKSB7XG4gICAgICAgICAgY29uc3QgbW9kdWxlID0gc3ViZGlyID9cbiAgICAgICAgICAgICAgICAgICAgICAgICBgJHtyZXBvfS8ke21lZGlhVHlwZX0vJHtzdWJkaXJ9LyR7ZmlsZW5hbWV9YCA6XG4gICAgICAgICAgICAgICAgICAgICAgICAgYCR7cmVwb30vJHttZWRpYVR5cGV9LyR7ZmlsZW5hbWV9YDtcblxuICAgICAgICAgIC8vIElmIG5vIGxpY2Vuc2VFbnRyaWVzIHdlcmUgcmVnaXN0ZXJlZCwgb3Igc29tZSB3ZXJlIHJlZ2lzdGVyZWQgYnV0IG5vdCBvbmUgY29ycmVzcG9uZGluZyB0byB0aGlzIGZpbGVcbiAgICAgICAgICBpZiAoICFub3JtYWxpemVkVXNlZE1vZHVsZXMuaW5jbHVkZXMoIGBjaGlwcGVyL2Rpc3QvanMvJHttb2R1bGV9YCApICkge1xuICAgICAgICAgICAgZ3J1bnQubG9nLndhcm4oIGBVbnVzZWQgJHttZWRpYVR5cGV9IG1vZHVsZTogJHttb2R1bGV9YCApO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSApO1xuICAgIH1cbiAgfSApO1xufTsiXSwibmFtZXMiOlsiQ2hpcHBlckNvbnN0YW50cyIsImdydW50IiwicmVwbyIsInVzZWRNb2R1bGVzIiwibm9ybWFsaXplZFVzZWRNb2R1bGVzIiwibWFwIiwibW9kdWxlIiwic3BsaXQiLCJqb2luIiwiTUVESUFfVFlQRVMiLCJmb3JFYWNoIiwibWVkaWFUeXBlIiwic3ViZGlyZWN0b3J5IiwiZmlsZSIsImlzRGlyIiwicmVjdXJzZSIsImFic3BhdGgiLCJyb290ZGlyIiwic3ViZGlyIiwiZmlsZW5hbWUiLCJpbmNsdWRlcyIsImxvZyIsIndhcm4iXSwibWFwcGluZ3MiOiJBQUFBLHNEQUFzRDtBQUV0RDs7Ozs7Ozs7Ozs7OztDQWFDLEdBRUQsVUFBVTtBQUNWLE9BQU9BLHNCQUFzQixpREFBaUQ7QUFDOUUsT0FBT0MsV0FBVyx3REFBd0Q7QUFFMUU7OztDQUdDLEdBQ0QsZUFBZSxDQUFBLENBQUVDLE1BQWNDO0lBRTdCLHlHQUF5RztJQUN6RyxNQUFNQyx3QkFBd0JELFlBQVlFLEdBQUcsQ0FBRUMsQ0FBQUEsU0FBVUEsT0FBT0MsS0FBSyxDQUFFLE1BQU9DLElBQUksQ0FBRTtJQUVwRlIsaUJBQWlCUyxXQUFXLENBQUNDLE9BQU8sQ0FBRUMsQ0FBQUE7UUFFcEMscURBQXFEO1FBQ3JELE1BQU1DLGVBQWUsQ0FBQyxHQUFHLEVBQUVWLEtBQUssQ0FBQyxFQUFFUyxXQUFXO1FBQzlDLElBQUtWLE1BQU1ZLElBQUksQ0FBQ0MsS0FBSyxDQUFFRixlQUFpQjtZQUN0Q1gsTUFBTVksSUFBSSxDQUFDRSxPQUFPLENBQUVILGNBQWMsQ0FBRUksU0FBU0MsU0FBU0MsUUFBUUM7Z0JBRTVELElBQUtBLGFBQWEsa0JBQWtCQSxhQUFhLGVBQWVBLFNBQVNDLFFBQVEsQ0FBRSxRQUFVO29CQUMzRixNQUFNZCxTQUFTWSxTQUNBLEdBQUdoQixLQUFLLENBQUMsRUFBRVMsVUFBVSxDQUFDLEVBQUVPLE9BQU8sQ0FBQyxFQUFFQyxVQUFVLEdBQzVDLEdBQUdqQixLQUFLLENBQUMsRUFBRVMsVUFBVSxDQUFDLEVBQUVRLFVBQVU7b0JBRWpELHVHQUF1RztvQkFDdkcsSUFBSyxDQUFDZixzQkFBc0JnQixRQUFRLENBQUUsQ0FBQyxnQkFBZ0IsRUFBRWQsUUFBUSxHQUFLO3dCQUNwRUwsTUFBTW9CLEdBQUcsQ0FBQ0MsSUFBSSxDQUFFLENBQUMsT0FBTyxFQUFFWCxVQUFVLFNBQVMsRUFBRUwsUUFBUTtvQkFDekQ7Z0JBQ0Y7WUFDRjtRQUNGO0lBQ0Y7QUFDRixDQUFBLEVBQUUifQ==