// Copyright 2017-2024, University of Colorado Boulder
/**
 * This grunt task generates the 800x400 letter-boxed version of the sim screenshot for use in
 * twitter cards (metadata) on the website simulation pages.
 *
 * @author Matt Pennington
 */ import Jimp from 'jimp';
import grunt from '../../../perennial-alias/js/npm-dependencies/grunt.js';
/**
 * @param repo - name of the repository
 * @returns - Resolves with a PNG {Buffer}
 */ export default function generateTwitterCard(repo) {
    return new Promise((resolve, reject)=>{
        const fullResImageName = `../${repo}/assets/${repo}-screenshot.png`;
        if (!grunt.file.exists(fullResImageName)) {
            grunt.log.writeln(`no image file exists: ${fullResImageName}. Not running task: generate-thumbnails`);
            return;
        }
        // The following creates an 800x400 image that is a letter-boxed version of the original size image and
        // has transparent padding, potentially on all sides.
        new Jimp(fullResImageName, function() {
            this.resize(600, 394) // Preserve original dimensions
            .contain(585, 400) // Resize to allow padding on top/bottom
            .contain(800, 400) // Add padding on right/left
            .getBuffer(Jimp.MIME_PNG, (error, pngBuffer)=>{
                if (error) {
                    reject(new Error(error));
                } else {
                    resolve(pngBuffer);
                }
            });
        });
    });
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2pzL2dydW50L2dlbmVyYXRlVHdpdHRlckNhcmQudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTctMjAyNCwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbi8qKlxuICogVGhpcyBncnVudCB0YXNrIGdlbmVyYXRlcyB0aGUgODAweDQwMCBsZXR0ZXItYm94ZWQgdmVyc2lvbiBvZiB0aGUgc2ltIHNjcmVlbnNob3QgZm9yIHVzZSBpblxuICogdHdpdHRlciBjYXJkcyAobWV0YWRhdGEpIG9uIHRoZSB3ZWJzaXRlIHNpbXVsYXRpb24gcGFnZXMuXG4gKlxuICogQGF1dGhvciBNYXR0IFBlbm5pbmd0b25cbiAqL1xuXG5pbXBvcnQgSmltcCBmcm9tICdqaW1wJztcbmltcG9ydCBncnVudCBmcm9tICcuLi8uLi8uLi9wZXJlbm5pYWwtYWxpYXMvanMvbnBtLWRlcGVuZGVuY2llcy9ncnVudC5qcyc7XG5pbXBvcnQgSW50ZW50aW9uYWxBbnkgZnJvbSAnLi4vLi4vLi4vcGhldC1jb3JlL2pzL3R5cGVzL0ludGVudGlvbmFsQW55LmpzJztcblxuLyoqXG4gKiBAcGFyYW0gcmVwbyAtIG5hbWUgb2YgdGhlIHJlcG9zaXRvcnlcbiAqIEByZXR1cm5zIC0gUmVzb2x2ZXMgd2l0aCBhIFBORyB7QnVmZmVyfVxuICovXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBnZW5lcmF0ZVR3aXR0ZXJDYXJkKCByZXBvOiBzdHJpbmcgKTogUHJvbWlzZTxCdWZmZXI+IHtcbiAgcmV0dXJuIG5ldyBQcm9taXNlKCAoIHJlc29sdmUsIHJlamVjdCApID0+IHtcbiAgICBjb25zdCBmdWxsUmVzSW1hZ2VOYW1lID0gYC4uLyR7cmVwb30vYXNzZXRzLyR7cmVwb30tc2NyZWVuc2hvdC5wbmdgO1xuXG4gICAgaWYgKCAhZ3J1bnQuZmlsZS5leGlzdHMoIGZ1bGxSZXNJbWFnZU5hbWUgKSApIHtcbiAgICAgIGdydW50LmxvZy53cml0ZWxuKCBgbm8gaW1hZ2UgZmlsZSBleGlzdHM6ICR7ZnVsbFJlc0ltYWdlTmFtZX0uIE5vdCBydW5uaW5nIHRhc2s6IGdlbmVyYXRlLXRodW1ibmFpbHNgICk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gVGhlIGZvbGxvd2luZyBjcmVhdGVzIGFuIDgwMHg0MDAgaW1hZ2UgdGhhdCBpcyBhIGxldHRlci1ib3hlZCB2ZXJzaW9uIG9mIHRoZSBvcmlnaW5hbCBzaXplIGltYWdlIGFuZFxuICAgIC8vIGhhcyB0cmFuc3BhcmVudCBwYWRkaW5nLCBwb3RlbnRpYWxseSBvbiBhbGwgc2lkZXMuXG4gICAgbmV3IEppbXAoIGZ1bGxSZXNJbWFnZU5hbWUsIGZ1bmN0aW9uKCB0aGlzOiBJbnRlbnRpb25hbEFueSApIHsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby1uZXdcbiAgICAgIHRoaXMucmVzaXplKCA2MDAsIDM5NCApIC8vIFByZXNlcnZlIG9yaWdpbmFsIGRpbWVuc2lvbnNcbiAgICAgICAgLmNvbnRhaW4oIDU4NSwgNDAwICkgIC8vIFJlc2l6ZSB0byBhbGxvdyBwYWRkaW5nIG9uIHRvcC9ib3R0b21cbiAgICAgICAgLmNvbnRhaW4oIDgwMCwgNDAwICkgIC8vIEFkZCBwYWRkaW5nIG9uIHJpZ2h0L2xlZnRcbiAgICAgICAgLmdldEJ1ZmZlciggSmltcC5NSU1FX1BORywgKCBlcnJvcjogc3RyaW5nLCBwbmdCdWZmZXI6IEJ1ZmZlciApID0+IHtcbiAgICAgICAgICBpZiAoIGVycm9yICkge1xuICAgICAgICAgICAgcmVqZWN0KCBuZXcgRXJyb3IoIGVycm9yICkgKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICByZXNvbHZlKCBwbmdCdWZmZXIgKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gKTtcbiAgICB9ICk7XG4gIH0gKTtcbn0iXSwibmFtZXMiOlsiSmltcCIsImdydW50IiwiZ2VuZXJhdGVUd2l0dGVyQ2FyZCIsInJlcG8iLCJQcm9taXNlIiwicmVzb2x2ZSIsInJlamVjdCIsImZ1bGxSZXNJbWFnZU5hbWUiLCJmaWxlIiwiZXhpc3RzIiwibG9nIiwid3JpdGVsbiIsInJlc2l6ZSIsImNvbnRhaW4iLCJnZXRCdWZmZXIiLCJNSU1FX1BORyIsImVycm9yIiwicG5nQnVmZmVyIiwiRXJyb3IiXSwibWFwcGluZ3MiOiJBQUFBLHNEQUFzRDtBQUV0RDs7Ozs7Q0FLQyxHQUVELE9BQU9BLFVBQVUsT0FBTztBQUN4QixPQUFPQyxXQUFXLHdEQUF3RDtBQUcxRTs7O0NBR0MsR0FDRCxlQUFlLFNBQVNDLG9CQUFxQkMsSUFBWTtJQUN2RCxPQUFPLElBQUlDLFFBQVMsQ0FBRUMsU0FBU0M7UUFDN0IsTUFBTUMsbUJBQW1CLENBQUMsR0FBRyxFQUFFSixLQUFLLFFBQVEsRUFBRUEsS0FBSyxlQUFlLENBQUM7UUFFbkUsSUFBSyxDQUFDRixNQUFNTyxJQUFJLENBQUNDLE1BQU0sQ0FBRUYsbUJBQXFCO1lBQzVDTixNQUFNUyxHQUFHLENBQUNDLE9BQU8sQ0FBRSxDQUFDLHNCQUFzQixFQUFFSixpQkFBaUIsdUNBQXVDLENBQUM7WUFDckc7UUFDRjtRQUVBLHVHQUF1RztRQUN2RyxxREFBcUQ7UUFDckQsSUFBSVAsS0FBTU8sa0JBQWtCO1lBQzFCLElBQUksQ0FBQ0ssTUFBTSxDQUFFLEtBQUssS0FBTSwrQkFBK0I7YUFDcERDLE9BQU8sQ0FBRSxLQUFLLEtBQU8sd0NBQXdDO2FBQzdEQSxPQUFPLENBQUUsS0FBSyxLQUFPLDRCQUE0QjthQUNqREMsU0FBUyxDQUFFZCxLQUFLZSxRQUFRLEVBQUUsQ0FBRUMsT0FBZUM7Z0JBQzFDLElBQUtELE9BQVE7b0JBQ1hWLE9BQVEsSUFBSVksTUFBT0Y7Z0JBQ3JCLE9BQ0s7b0JBQ0hYLFFBQVNZO2dCQUNYO1lBQ0Y7UUFDSjtJQUNGO0FBQ0YifQ==