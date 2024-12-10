// Copyright 2013-2024, University of Colorado Boulder
/**
 * Build images only
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */ function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
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
import Jimp from 'jimp';
import getRepo from '../../../../perennial-alias/js/grunt/tasks/util/getRepo.js';
import grunt from '../../../../perennial-alias/js/npm-dependencies/grunt.js';
import generateThumbnails from '../generateThumbnails.js';
import generateTwitterCard from '../generateTwitterCard.js';
const brand = 'phet';
const repo = getRepo();
_async_to_generator(function*() {
    const buildDir = `../${repo}/build/${brand}`;
    // Thumbnails and twitter card
    if (grunt.file.exists(`../${repo}/assets/${repo}-screenshot.png`)) {
        const thumbnailSizes = [
            {
                width: 900,
                height: 591
            },
            {
                width: 600,
                height: 394
            },
            {
                width: 420,
                height: 276
            },
            {
                width: 128,
                height: 84
            },
            {
                width: 15,
                height: 10
            }
        ];
        for (const size of thumbnailSizes){
            grunt.file.write(`${buildDir}/${repo}-${size.width}.png`, (yield generateThumbnails(repo, size.width, size.height, 100, Jimp.MIME_PNG)));
        }
        const altScreenshots = grunt.file.expand({
            filter: 'isFile',
            cwd: `../${repo}/assets`
        }, [
            `./${repo}-screenshot-alt[0123456789].png`
        ]);
        for (const altScreenshot of altScreenshots){
            const imageNumber = Number(altScreenshot.substr(`./${repo}-screenshot-alt`.length, 1));
            grunt.file.write(`${buildDir}/${repo}-${600}-alt${imageNumber}.png`, (yield generateThumbnails(repo, 600, 394, 100, Jimp.MIME_PNG, `-alt${imageNumber}`)));
            grunt.file.write(`${buildDir}/${repo}-${900}-alt${imageNumber}.png`, (yield generateThumbnails(repo, 900, 591, 100, Jimp.MIME_PNG, `-alt${imageNumber}`)));
        }
        if (brand === 'phet') {
            grunt.file.write(`${buildDir}/${repo}-ios.png`, (yield generateThumbnails(repo, 420, 276, 90, Jimp.MIME_JPEG)));
            grunt.file.write(`${buildDir}/${repo}-twitter-card.png`, (yield generateTwitterCard(repo)));
        }
    }
})();

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL2pzL2dydW50L3Rhc2tzL2J1aWxkLWltYWdlcy50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxMy0yMDI0LCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuLyoqXG4gKiBCdWlsZCBpbWFnZXMgb25seVxuICpcbiAqIEBhdXRob3IgU2FtIFJlaWQgKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXG4gKi9cblxuaW1wb3J0IEppbXAgZnJvbSAnamltcCc7XG5pbXBvcnQgZ2V0UmVwbyBmcm9tICcuLi8uLi8uLi8uLi9wZXJlbm5pYWwtYWxpYXMvanMvZ3J1bnQvdGFza3MvdXRpbC9nZXRSZXBvLmpzJztcbmltcG9ydCBncnVudCBmcm9tICcuLi8uLi8uLi8uLi9wZXJlbm5pYWwtYWxpYXMvanMvbnBtLWRlcGVuZGVuY2llcy9ncnVudC5qcyc7XG5pbXBvcnQgZ2VuZXJhdGVUaHVtYm5haWxzIGZyb20gJy4uL2dlbmVyYXRlVGh1bWJuYWlscy5qcyc7XG5pbXBvcnQgZ2VuZXJhdGVUd2l0dGVyQ2FyZCBmcm9tICcuLi9nZW5lcmF0ZVR3aXR0ZXJDYXJkLmpzJztcblxuY29uc3QgYnJhbmQgPSAncGhldCc7XG5cbmNvbnN0IHJlcG8gPSBnZXRSZXBvKCk7XG5cbiggYXN5bmMgKCkgPT4ge1xuICBjb25zdCBidWlsZERpciA9IGAuLi8ke3JlcG99L2J1aWxkLyR7YnJhbmR9YDtcbiAgLy8gVGh1bWJuYWlscyBhbmQgdHdpdHRlciBjYXJkXG4gIGlmICggZ3J1bnQuZmlsZS5leGlzdHMoIGAuLi8ke3JlcG99L2Fzc2V0cy8ke3JlcG99LXNjcmVlbnNob3QucG5nYCApICkge1xuICAgIGNvbnN0IHRodW1ibmFpbFNpemVzID0gW1xuICAgICAgeyB3aWR0aDogOTAwLCBoZWlnaHQ6IDU5MSB9LFxuICAgICAgeyB3aWR0aDogNjAwLCBoZWlnaHQ6IDM5NCB9LFxuICAgICAgeyB3aWR0aDogNDIwLCBoZWlnaHQ6IDI3NiB9LFxuICAgICAgeyB3aWR0aDogMTI4LCBoZWlnaHQ6IDg0IH0sXG4gICAgICB7IHdpZHRoOiAxNSwgaGVpZ2h0OiAxMCB9XG4gICAgXTtcbiAgICBmb3IgKCBjb25zdCBzaXplIG9mIHRodW1ibmFpbFNpemVzICkge1xuICAgICAgZ3J1bnQuZmlsZS53cml0ZSggYCR7YnVpbGREaXJ9LyR7cmVwb30tJHtzaXplLndpZHRofS5wbmdgLCBhd2FpdCBnZW5lcmF0ZVRodW1ibmFpbHMoIHJlcG8sIHNpemUud2lkdGgsIHNpemUuaGVpZ2h0LCAxMDAsIEppbXAuTUlNRV9QTkcgKSApO1xuICAgIH1cblxuICAgIGNvbnN0IGFsdFNjcmVlbnNob3RzID0gZ3J1bnQuZmlsZS5leHBhbmQoIHsgZmlsdGVyOiAnaXNGaWxlJywgY3dkOiBgLi4vJHtyZXBvfS9hc3NldHNgIH0sIFsgYC4vJHtyZXBvfS1zY3JlZW5zaG90LWFsdFswMTIzNDU2Nzg5XS5wbmdgIF0gKTtcbiAgICBmb3IgKCBjb25zdCBhbHRTY3JlZW5zaG90IG9mIGFsdFNjcmVlbnNob3RzICkge1xuICAgICAgY29uc3QgaW1hZ2VOdW1iZXIgPSBOdW1iZXIoIGFsdFNjcmVlbnNob3Quc3Vic3RyKCBgLi8ke3JlcG99LXNjcmVlbnNob3QtYWx0YC5sZW5ndGgsIDEgKSApO1xuICAgICAgZ3J1bnQuZmlsZS53cml0ZSggYCR7YnVpbGREaXJ9LyR7cmVwb30tJHs2MDB9LWFsdCR7aW1hZ2VOdW1iZXJ9LnBuZ2AsIGF3YWl0IGdlbmVyYXRlVGh1bWJuYWlscyggcmVwbywgNjAwLCAzOTQsIDEwMCwgSmltcC5NSU1FX1BORywgYC1hbHQke2ltYWdlTnVtYmVyfWAgKSApO1xuICAgICAgZ3J1bnQuZmlsZS53cml0ZSggYCR7YnVpbGREaXJ9LyR7cmVwb30tJHs5MDB9LWFsdCR7aW1hZ2VOdW1iZXJ9LnBuZ2AsIGF3YWl0IGdlbmVyYXRlVGh1bWJuYWlscyggcmVwbywgOTAwLCA1OTEsIDEwMCwgSmltcC5NSU1FX1BORywgYC1hbHQke2ltYWdlTnVtYmVyfWAgKSApO1xuICAgIH1cblxuICAgIGlmICggYnJhbmQgPT09ICdwaGV0JyApIHtcbiAgICAgIGdydW50LmZpbGUud3JpdGUoIGAke2J1aWxkRGlyfS8ke3JlcG99LWlvcy5wbmdgLCBhd2FpdCBnZW5lcmF0ZVRodW1ibmFpbHMoIHJlcG8sIDQyMCwgMjc2LCA5MCwgSmltcC5NSU1FX0pQRUcgKSApO1xuICAgICAgZ3J1bnQuZmlsZS53cml0ZSggYCR7YnVpbGREaXJ9LyR7cmVwb30tdHdpdHRlci1jYXJkLnBuZ2AsIGF3YWl0IGdlbmVyYXRlVHdpdHRlckNhcmQoIHJlcG8gKSApO1xuICAgIH1cbiAgfVxufSApKCk7Il0sIm5hbWVzIjpbIkppbXAiLCJnZXRSZXBvIiwiZ3J1bnQiLCJnZW5lcmF0ZVRodW1ibmFpbHMiLCJnZW5lcmF0ZVR3aXR0ZXJDYXJkIiwiYnJhbmQiLCJyZXBvIiwiYnVpbGREaXIiLCJmaWxlIiwiZXhpc3RzIiwidGh1bWJuYWlsU2l6ZXMiLCJ3aWR0aCIsImhlaWdodCIsInNpemUiLCJ3cml0ZSIsIk1JTUVfUE5HIiwiYWx0U2NyZWVuc2hvdHMiLCJleHBhbmQiLCJmaWx0ZXIiLCJjd2QiLCJhbHRTY3JlZW5zaG90IiwiaW1hZ2VOdW1iZXIiLCJOdW1iZXIiLCJzdWJzdHIiLCJsZW5ndGgiLCJNSU1FX0pQRUciXSwibWFwcGluZ3MiOiJBQUFBLHNEQUFzRDtBQUV0RDs7OztDQUlDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUVELE9BQU9BLFVBQVUsT0FBTztBQUN4QixPQUFPQyxhQUFhLDZEQUE2RDtBQUNqRixPQUFPQyxXQUFXLDJEQUEyRDtBQUM3RSxPQUFPQyx3QkFBd0IsMkJBQTJCO0FBQzFELE9BQU9DLHlCQUF5Qiw0QkFBNEI7QUFFNUQsTUFBTUMsUUFBUTtBQUVkLE1BQU1DLE9BQU9MO0FBRVgsb0JBQUE7SUFDQSxNQUFNTSxXQUFXLENBQUMsR0FBRyxFQUFFRCxLQUFLLE9BQU8sRUFBRUQsT0FBTztJQUM1Qyw4QkFBOEI7SUFDOUIsSUFBS0gsTUFBTU0sSUFBSSxDQUFDQyxNQUFNLENBQUUsQ0FBQyxHQUFHLEVBQUVILEtBQUssUUFBUSxFQUFFQSxLQUFLLGVBQWUsQ0FBQyxHQUFLO1FBQ3JFLE1BQU1JLGlCQUFpQjtZQUNyQjtnQkFBRUMsT0FBTztnQkFBS0MsUUFBUTtZQUFJO1lBQzFCO2dCQUFFRCxPQUFPO2dCQUFLQyxRQUFRO1lBQUk7WUFDMUI7Z0JBQUVELE9BQU87Z0JBQUtDLFFBQVE7WUFBSTtZQUMxQjtnQkFBRUQsT0FBTztnQkFBS0MsUUFBUTtZQUFHO1lBQ3pCO2dCQUFFRCxPQUFPO2dCQUFJQyxRQUFRO1lBQUc7U0FDekI7UUFDRCxLQUFNLE1BQU1DLFFBQVFILGVBQWlCO1lBQ25DUixNQUFNTSxJQUFJLENBQUNNLEtBQUssQ0FBRSxHQUFHUCxTQUFTLENBQUMsRUFBRUQsS0FBSyxDQUFDLEVBQUVPLEtBQUtGLEtBQUssQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFBLE1BQU1SLG1CQUFvQkcsTUFBTU8sS0FBS0YsS0FBSyxFQUFFRSxLQUFLRCxNQUFNLEVBQUUsS0FBS1osS0FBS2UsUUFBUSxDQUFDO1FBQ3pJO1FBRUEsTUFBTUMsaUJBQWlCZCxNQUFNTSxJQUFJLENBQUNTLE1BQU0sQ0FBRTtZQUFFQyxRQUFRO1lBQVVDLEtBQUssQ0FBQyxHQUFHLEVBQUViLEtBQUssT0FBTyxDQUFDO1FBQUMsR0FBRztZQUFFLENBQUMsRUFBRSxFQUFFQSxLQUFLLCtCQUErQixDQUFDO1NBQUU7UUFDeEksS0FBTSxNQUFNYyxpQkFBaUJKLGVBQWlCO1lBQzVDLE1BQU1LLGNBQWNDLE9BQVFGLGNBQWNHLE1BQU0sQ0FBRSxDQUFDLEVBQUUsRUFBRWpCLEtBQUssZUFBZSxDQUFDLENBQUNrQixNQUFNLEVBQUU7WUFDckZ0QixNQUFNTSxJQUFJLENBQUNNLEtBQUssQ0FBRSxHQUFHUCxTQUFTLENBQUMsRUFBRUQsS0FBSyxDQUFDLEVBQUUsSUFBSSxJQUFJLEVBQUVlLFlBQVksSUFBSSxDQUFDLEVBQUUsQ0FBQSxNQUFNbEIsbUJBQW9CRyxNQUFNLEtBQUssS0FBSyxLQUFLTixLQUFLZSxRQUFRLEVBQUUsQ0FBQyxJQUFJLEVBQUVNLGFBQWEsQ0FBQztZQUN6Sm5CLE1BQU1NLElBQUksQ0FBQ00sS0FBSyxDQUFFLEdBQUdQLFNBQVMsQ0FBQyxFQUFFRCxLQUFLLENBQUMsRUFBRSxJQUFJLElBQUksRUFBRWUsWUFBWSxJQUFJLENBQUMsRUFBRSxDQUFBLE1BQU1sQixtQkFBb0JHLE1BQU0sS0FBSyxLQUFLLEtBQUtOLEtBQUtlLFFBQVEsRUFBRSxDQUFDLElBQUksRUFBRU0sYUFBYSxDQUFDO1FBQzNKO1FBRUEsSUFBS2hCLFVBQVUsUUFBUztZQUN0QkgsTUFBTU0sSUFBSSxDQUFDTSxLQUFLLENBQUUsR0FBR1AsU0FBUyxDQUFDLEVBQUVELEtBQUssUUFBUSxDQUFDLEVBQUUsQ0FBQSxNQUFNSCxtQkFBb0JHLE1BQU0sS0FBSyxLQUFLLElBQUlOLEtBQUt5QixTQUFTLENBQUM7WUFDOUd2QixNQUFNTSxJQUFJLENBQUNNLEtBQUssQ0FBRSxHQUFHUCxTQUFTLENBQUMsRUFBRUQsS0FBSyxpQkFBaUIsQ0FBQyxFQUFFLENBQUEsTUFBTUYsb0JBQXFCRSxLQUFLO1FBQzVGO0lBQ0Y7QUFDRiJ9