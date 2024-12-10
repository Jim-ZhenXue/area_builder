// Copyright 2022, University of Colorado Boulder
/**
 * Script to download all dynamic files from MediaPipe for using hand input, writing them to a file to be used by the sim.
 *
 * run with `./node createMediaPipeDependencies.js`
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */ /* eslint-env node */ function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
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
const fs = require('fs');
const axios = require('axios');
const HANDS_VERSION = '0.4.1646424915';
_async_to_generator(function*() {
    const files = [
        'hand_landmark_full.tflite',
        'hands.binarypb',
        'hands_solution_packed_assets.data',
        'hands_solution_packed_assets_loader.js',
        'hands_solution_simd_wasm_bin.js',
        'hands_solution_simd_wasm_bin.wasm'
    ];
    const mediaPipeDependencies = {};
    const url = `https://cdn.jsdelivr.net/npm/@mediapipe/hands@${HANDS_VERSION}/`;
    const getContent = /*#__PURE__*/ _async_to_generator(function*(url) {
        const response = yield axios({
            url: url,
            method: 'GET',
            responseType: 'arraybuffer'
        });
        const headers = response.headers;
        const dataURLPrefix = `data:${headers['content-type'].split(';')[0]};base64,`;
        const base64 = Buffer.from(response.data).toString('base64');
        return `${dataURLPrefix}${base64}`;
    });
    let count = 0;
    const attempToWrite = ()=>{
        if (++count === files.length) {
            fs.writeFileSync('./mediaPipeDependencies.js', `
  
  window.mediaPipeDependencies = ${JSON.stringify(mediaPipeDependencies, null, 2)};
  `);
        }
    };
    for(let i = 0; i < files.length; i++){
        const filename = files[i];
        // A timeout prevents a bug with HTTP. TODO: can I get rid of this?  https://github.com/phetsims/tangible/issues/9
        setTimeout(/*#__PURE__*/ _async_to_generator(function*() {
            mediaPipeDependencies[filename] = yield getContent(`${url}${filename}`);
            attempToWrite();
        }), i + 2000);
    }
})();

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3NoZXJwYS9saWIvbWVkaWFQaXBlL2hhbmRzQDAuNC4xNjQ2NDI0OTE1L2NyZWF0ZU1lZGlhUGlwZURlcGVuZGVuY2llcy5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAyMiwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbi8qKlxuICogU2NyaXB0IHRvIGRvd25sb2FkIGFsbCBkeW5hbWljIGZpbGVzIGZyb20gTWVkaWFQaXBlIGZvciB1c2luZyBoYW5kIGlucHV0LCB3cml0aW5nIHRoZW0gdG8gYSBmaWxlIHRvIGJlIHVzZWQgYnkgdGhlIHNpbS5cbiAqXG4gKiBydW4gd2l0aCBgLi9ub2RlIGNyZWF0ZU1lZGlhUGlwZURlcGVuZGVuY2llcy5qc2BcbiAqXG4gKiBAYXV0aG9yIE1pY2hhZWwgS2F1em1hbm4gKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXG4gKi9cblxuLyogZXNsaW50LWVudiBub2RlICovXG5cbmNvbnN0IGZzID0gcmVxdWlyZSggJ2ZzJyApO1xuY29uc3QgYXhpb3MgPSByZXF1aXJlKCAnYXhpb3MnICk7XG5cbmNvbnN0IEhBTkRTX1ZFUlNJT04gPSAnMC40LjE2NDY0MjQ5MTUnO1xuXG4oIGFzeW5jICgpID0+IHtcblxuICBjb25zdCBmaWxlcyA9IFtcbiAgICAnaGFuZF9sYW5kbWFya19mdWxsLnRmbGl0ZScsXG4gICAgJ2hhbmRzLmJpbmFyeXBiJyxcbiAgICAnaGFuZHNfc29sdXRpb25fcGFja2VkX2Fzc2V0cy5kYXRhJyxcbiAgICAnaGFuZHNfc29sdXRpb25fcGFja2VkX2Fzc2V0c19sb2FkZXIuanMnLFxuICAgICdoYW5kc19zb2x1dGlvbl9zaW1kX3dhc21fYmluLmpzJyxcbiAgICAnaGFuZHNfc29sdXRpb25fc2ltZF93YXNtX2Jpbi53YXNtJ1xuICBdO1xuXG4gIGNvbnN0IG1lZGlhUGlwZURlcGVuZGVuY2llcyA9IHt9O1xuICBjb25zdCB1cmwgPSBgaHR0cHM6Ly9jZG4uanNkZWxpdnIubmV0L25wbS9AbWVkaWFwaXBlL2hhbmRzQCR7SEFORFNfVkVSU0lPTn0vYDtcblxuICBjb25zdCBnZXRDb250ZW50ID0gYXN5bmMgKCB1cmwgKSA9PiB7XG5cbiAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGF4aW9zKCB7XG4gICAgICB1cmw6IHVybCxcbiAgICAgIG1ldGhvZDogJ0dFVCcsXG4gICAgICByZXNwb25zZVR5cGU6ICdhcnJheWJ1ZmZlcidcbiAgICB9ICk7XG5cbiAgICBjb25zdCBoZWFkZXJzID0gcmVzcG9uc2UuaGVhZGVycztcblxuICAgIGNvbnN0IGRhdGFVUkxQcmVmaXggPSBgZGF0YToke2hlYWRlcnNbICdjb250ZW50LXR5cGUnIF0uc3BsaXQoICc7JyApWyAwIF19O2Jhc2U2NCxgO1xuICAgIGNvbnN0IGJhc2U2NCA9IEJ1ZmZlci5mcm9tKCByZXNwb25zZS5kYXRhICkudG9TdHJpbmcoICdiYXNlNjQnICk7XG4gICAgcmV0dXJuIGAke2RhdGFVUkxQcmVmaXh9JHtiYXNlNjR9YDtcbiAgfTtcbiAgbGV0IGNvdW50ID0gMDtcblxuICBjb25zdCBhdHRlbXBUb1dyaXRlID0gKCkgPT4ge1xuICAgIGlmICggKytjb3VudCA9PT0gZmlsZXMubGVuZ3RoICkge1xuXG4gICAgICBmcy53cml0ZUZpbGVTeW5jKCAnLi9tZWRpYVBpcGVEZXBlbmRlbmNpZXMuanMnLCBgXG4gIFxuICB3aW5kb3cubWVkaWFQaXBlRGVwZW5kZW5jaWVzID0gJHtKU09OLnN0cmluZ2lmeSggbWVkaWFQaXBlRGVwZW5kZW5jaWVzLCBudWxsLCAyICl9O1xuICBgICk7XG4gICAgfVxuICB9O1xuXG4gIGZvciAoIGxldCBpID0gMDsgaSA8IGZpbGVzLmxlbmd0aDsgaSsrICkge1xuICAgIGNvbnN0IGZpbGVuYW1lID0gZmlsZXNbIGkgXTtcblxuICAgIC8vIEEgdGltZW91dCBwcmV2ZW50cyBhIGJ1ZyB3aXRoIEhUVFAuIFRPRE86IGNhbiBJIGdldCByaWQgb2YgdGhpcz8gIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy90YW5naWJsZS9pc3N1ZXMvOVxuICAgIHNldFRpbWVvdXQoIGFzeW5jICgpID0+IHsgLy8gZXNsaW50LWRpc2FibGUtbGluZVxuICAgICAgbWVkaWFQaXBlRGVwZW5kZW5jaWVzWyBmaWxlbmFtZSBdID0gYXdhaXQgZ2V0Q29udGVudCggYCR7dXJsfSR7ZmlsZW5hbWV9YCApO1xuXG4gICAgICBhdHRlbXBUb1dyaXRlKCk7XG4gICAgfSwgaSArIDIwMDAgKTtcbiAgfVxufSApKCk7XG4iXSwibmFtZXMiOlsiZnMiLCJyZXF1aXJlIiwiYXhpb3MiLCJIQU5EU19WRVJTSU9OIiwiZmlsZXMiLCJtZWRpYVBpcGVEZXBlbmRlbmNpZXMiLCJ1cmwiLCJnZXRDb250ZW50IiwicmVzcG9uc2UiLCJtZXRob2QiLCJyZXNwb25zZVR5cGUiLCJoZWFkZXJzIiwiZGF0YVVSTFByZWZpeCIsInNwbGl0IiwiYmFzZTY0IiwiQnVmZmVyIiwiZnJvbSIsImRhdGEiLCJ0b1N0cmluZyIsImNvdW50IiwiYXR0ZW1wVG9Xcml0ZSIsImxlbmd0aCIsIndyaXRlRmlsZVN5bmMiLCJKU09OIiwic3RyaW5naWZ5IiwiaSIsImZpbGVuYW1lIiwic2V0VGltZW91dCJdLCJtYXBwaW5ncyI6IkFBQUEsaURBQWlEO0FBRWpEOzs7Ozs7Q0FNQyxHQUVELG1CQUFtQjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFFbkIsTUFBTUEsS0FBS0MsUUFBUztBQUNwQixNQUFNQyxRQUFRRCxRQUFTO0FBRXZCLE1BQU1FLGdCQUFnQjtBQUVwQixvQkFBQTtJQUVBLE1BQU1DLFFBQVE7UUFDWjtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7S0FDRDtJQUVELE1BQU1DLHdCQUF3QixDQUFDO0lBQy9CLE1BQU1DLE1BQU0sQ0FBQyw4Q0FBOEMsRUFBRUgsY0FBYyxDQUFDLENBQUM7SUFFN0UsTUFBTUksK0NBQWEsVUFBUUQ7UUFFekIsTUFBTUUsV0FBVyxNQUFNTixNQUFPO1lBQzVCSSxLQUFLQTtZQUNMRyxRQUFRO1lBQ1JDLGNBQWM7UUFDaEI7UUFFQSxNQUFNQyxVQUFVSCxTQUFTRyxPQUFPO1FBRWhDLE1BQU1DLGdCQUFnQixDQUFDLEtBQUssRUFBRUQsT0FBTyxDQUFFLGVBQWdCLENBQUNFLEtBQUssQ0FBRSxJQUFLLENBQUUsRUFBRyxDQUFDLFFBQVEsQ0FBQztRQUNuRixNQUFNQyxTQUFTQyxPQUFPQyxJQUFJLENBQUVSLFNBQVNTLElBQUksRUFBR0MsUUFBUSxDQUFFO1FBQ3RELE9BQU8sR0FBR04sZ0JBQWdCRSxRQUFRO0lBQ3BDO0lBQ0EsSUFBSUssUUFBUTtJQUVaLE1BQU1DLGdCQUFnQjtRQUNwQixJQUFLLEVBQUVELFVBQVVmLE1BQU1pQixNQUFNLEVBQUc7WUFFOUJyQixHQUFHc0IsYUFBYSxDQUFFLDhCQUE4QixDQUFDOztpQ0FFdEIsRUFBRUMsS0FBS0MsU0FBUyxDQUFFbkIsdUJBQXVCLE1BQU0sR0FBSTtFQUNsRixDQUFDO1FBQ0M7SUFDRjtJQUVBLElBQU0sSUFBSW9CLElBQUksR0FBR0EsSUFBSXJCLE1BQU1pQixNQUFNLEVBQUVJLElBQU07UUFDdkMsTUFBTUMsV0FBV3RCLEtBQUssQ0FBRXFCLEVBQUc7UUFFM0Isa0hBQWtIO1FBQ2xIRSw2Q0FBWTtZQUNWdEIscUJBQXFCLENBQUVxQixTQUFVLEdBQUcsTUFBTW5CLFdBQVksR0FBR0QsTUFBTW9CLFVBQVU7WUFFekVOO1FBQ0YsSUFBR0ssSUFBSTtJQUNUO0FBQ0YifQ==