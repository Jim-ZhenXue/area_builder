// Copyright 2017-2024, University of Colorado Boulder
/**
 * Builds standalone JS deliverables (e.g. dot/kite/scenery)
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
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
import assert from 'assert';
import fs, { readFileSync } from 'fs';
import _ from 'lodash';
import ChipperConstants from '../common/ChipperConstants.js';
import getLocalesFromRepository from './getLocalesFromRepository.js';
import getPhetLibs from './getPhetLibs.js';
import getStringMap from './getStringMap.js';
import minify from './minify.js';
import webpackBuild from './webpackBuild.js';
/**
 * Builds standalone JS deliverables (e.g. dot/kite/scenery)
 *
 * @param repo
 * @param providedOptions - Passed directly to minify()
 */ export default function buildStandalone(repo, providedOptions) {
    return _buildStandalone.apply(this, arguments);
}
function _buildStandalone() {
    _buildStandalone = _async_to_generator(function*(repo, providedOptions) {
        const options = _.merge({
            isDebug: false,
            // {null|string[]} - if provided, exclude these preloads from the built standalone
            omitPreloads: null,
            // For concurrent builds, provide a unique output dir for the webpack process, default to the repo building
            tempOutputDir: repo,
            // Some phet-io wrapper repos want to be built as "phet-io" brand so that resources under `phet-io` dirs are included.
            brand: 'phet'
        }, providedOptions);
        const packageObject = JSON.parse(readFileSync(`../${repo}/package.json`, 'utf8'));
        assert(packageObject.phet, '`phet` object expected in package.json');
        const webpackResult = yield webpackBuild(repo, options.brand, {
            outputDir: options.tempOutputDir,
            profileFileSize: options.profileFileSize
        });
        const webpackJS = webpackResult.js;
        let includedSources = [
            '../assert/js/assert.js',
            '../tandem/js/PhetioIDUtils.js'
        ];
        // add repo-specific preloads from package.json
        if (packageObject.phet.preload) {
            assert(Array.isArray(packageObject.phet.preload), 'preload should be an array');
            includedSources = includedSources.concat(packageObject.phet.preload);
            // NOTE: Should find a better way of handling putting these first
            includedSources.forEach((source, index)=>{
                if (source.includes('sherpa/lib/lodash-')) {
                    includedSources.splice(index, 1);
                    includedSources.unshift(source);
                }
            });
            includedSources.forEach((source, index)=>{
                if (source.includes('sherpa/lib/jquery-')) {
                    includedSources.splice(index, 1);
                    includedSources.unshift(source);
                }
            });
        }
        if (options.omitPreloads) {
            includedSources = includedSources.filter((source)=>!options.omitPreloads.includes(source));
        }
        let includedJS = includedSources.map((file)=>fs.readFileSync(file, 'utf8')).join('\n');
        // Checks if lodash exists
        const testLodash = '  if ( !window.hasOwnProperty( \'_\' ) ) {\n' + '    throw new Error( \'Underscore/Lodash not found: _\' );\n' + '  }\n';
        // Checks if jQuery exists
        const testJQuery = '  if ( !window.hasOwnProperty( \'$\' ) ) {\n' + '    throw new Error( \'jQuery not found: $\' );\n' + '  }\n';
        const debugJS = '\nwindow.assertions.enableAssert();\n';
        if (options.isDebug) {
            includedJS += debugJS;
        }
        let fullSource = `${includedJS}\n${webpackJS}`;
        if (packageObject.phet.requiresJQuery) {
            fullSource = testJQuery + fullSource;
        }
        if (packageObject.phet.requiresLodash) {
            fullSource = testLodash + fullSource;
        }
        // include globals assignment
        let globals = 'window.phet=window.phet||{}\n;';
        if (packageObject.name === 'phet-lib') {
            globals += `phet.chipper=phet.chipper||{};\nphet.chipper.packageObject=${JSON.stringify(packageObject)};\n`;
            const subRepos = [
                'scenery',
                'sun',
                'scenery-phet',
                'twixt',
                'mobius'
            ];
            const phetLibs = _.uniq(_.flatten(subRepos.map((subRepo)=>{
                return getPhetLibs(subRepo);
            })).sort());
            const locales = [
                ChipperConstants.FALLBACK_LOCALE,
                ..._.flatten(subRepos.map((subRepo)=>getLocalesFromRepository(subRepo)))
            ];
            const { stringMap, stringMetadata } = getStringMap(repo, locales, phetLibs, webpackResult.usedModules);
            const localeData = JSON.parse(fs.readFileSync('../babel/localeData.json', 'utf8'));
            globals += 'phet.chipper.stringPath = \'../\';\n';
            globals += 'phet.chipper.locale = \'en\';\n';
            globals += 'phet.chipper.loadModules = () => {};\n';
            globals += `phet.chipper.strings = ${JSON.stringify(stringMap, null, options.isDebug ? 2 : '')};\n`;
            globals += `phet.chipper.localeData = ${JSON.stringify(localeData, null, options.isDebug ? 2 : '')};\n`;
            globals += `phet.chipper.stringMetadata = ${JSON.stringify(stringMetadata, null, options.isDebug ? 2 : '')};\n`;
        }
        fullSource = `\n${globals}\n${fullSource}`;
        // Wrap with an IIFE
        fullSource = `(function() {\n${fullSource}\n}());`;
        fullSource = minify(fullSource, options);
        return fullSource;
    });
    return _buildStandalone.apply(this, arguments);
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2pzL2dydW50L2J1aWxkU3RhbmRhbG9uZS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNy0yMDI0LCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuLyoqXG4gKiBCdWlsZHMgc3RhbmRhbG9uZSBKUyBkZWxpdmVyYWJsZXMgKGUuZy4gZG90L2tpdGUvc2NlbmVyeSlcbiAqXG4gKiBAYXV0aG9yIEpvbmF0aGFuIE9sc29uIDxqb25hdGhhbi5vbHNvbkBjb2xvcmFkby5lZHU+XG4gKi9cblxuaW1wb3J0IGFzc2VydCBmcm9tICdhc3NlcnQnO1xuaW1wb3J0IGZzLCB7IHJlYWRGaWxlU3luYyB9IGZyb20gJ2ZzJztcbmltcG9ydCBfIGZyb20gJ2xvZGFzaCc7XG5pbXBvcnQgSW50ZW50aW9uYWxBbnkgZnJvbSAnLi4vLi4vLi4vcGhldC1jb3JlL2pzL3R5cGVzL0ludGVudGlvbmFsQW55LmpzJztcbmltcG9ydCBDaGlwcGVyQ29uc3RhbnRzIGZyb20gJy4uL2NvbW1vbi9DaGlwcGVyQ29uc3RhbnRzLmpzJztcbmltcG9ydCBnZXRMb2NhbGVzRnJvbVJlcG9zaXRvcnkgZnJvbSAnLi9nZXRMb2NhbGVzRnJvbVJlcG9zaXRvcnkuanMnO1xuaW1wb3J0IGdldFBoZXRMaWJzIGZyb20gJy4vZ2V0UGhldExpYnMuanMnO1xuaW1wb3J0IGdldFN0cmluZ01hcCBmcm9tICcuL2dldFN0cmluZ01hcC5qcyc7XG5pbXBvcnQgbWluaWZ5IGZyb20gJy4vbWluaWZ5LmpzJztcbmltcG9ydCB3ZWJwYWNrQnVpbGQgZnJvbSAnLi93ZWJwYWNrQnVpbGQuanMnO1xuXG4vKipcbiAqIEJ1aWxkcyBzdGFuZGFsb25lIEpTIGRlbGl2ZXJhYmxlcyAoZS5nLiBkb3Qva2l0ZS9zY2VuZXJ5KVxuICpcbiAqIEBwYXJhbSByZXBvXG4gKiBAcGFyYW0gcHJvdmlkZWRPcHRpb25zIC0gUGFzc2VkIGRpcmVjdGx5IHRvIG1pbmlmeSgpXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGFzeW5jIGZ1bmN0aW9uIGJ1aWxkU3RhbmRhbG9uZSggcmVwbzogc3RyaW5nLCBwcm92aWRlZE9wdGlvbnM6IEludGVudGlvbmFsQW55ICk6IFByb21pc2U8c3RyaW5nPiB7XG5cbiAgY29uc3Qgb3B0aW9ucyA9IF8ubWVyZ2UoIHtcbiAgICBpc0RlYnVnOiBmYWxzZSxcblxuICAgIC8vIHtudWxsfHN0cmluZ1tdfSAtIGlmIHByb3ZpZGVkLCBleGNsdWRlIHRoZXNlIHByZWxvYWRzIGZyb20gdGhlIGJ1aWx0IHN0YW5kYWxvbmVcbiAgICBvbWl0UHJlbG9hZHM6IG51bGwsXG5cbiAgICAvLyBGb3IgY29uY3VycmVudCBidWlsZHMsIHByb3ZpZGUgYSB1bmlxdWUgb3V0cHV0IGRpciBmb3IgdGhlIHdlYnBhY2sgcHJvY2VzcywgZGVmYXVsdCB0byB0aGUgcmVwbyBidWlsZGluZ1xuICAgIHRlbXBPdXRwdXREaXI6IHJlcG8sXG5cbiAgICAvLyBTb21lIHBoZXQtaW8gd3JhcHBlciByZXBvcyB3YW50IHRvIGJlIGJ1aWx0IGFzIFwicGhldC1pb1wiIGJyYW5kIHNvIHRoYXQgcmVzb3VyY2VzIHVuZGVyIGBwaGV0LWlvYCBkaXJzIGFyZSBpbmNsdWRlZC5cbiAgICBicmFuZDogJ3BoZXQnXG4gIH0sIHByb3ZpZGVkT3B0aW9ucyApO1xuXG4gIGNvbnN0IHBhY2thZ2VPYmplY3QgPSBKU09OLnBhcnNlKCByZWFkRmlsZVN5bmMoIGAuLi8ke3JlcG99L3BhY2thZ2UuanNvbmAsICd1dGY4JyApICk7XG4gIGFzc2VydCggcGFja2FnZU9iamVjdC5waGV0LCAnYHBoZXRgIG9iamVjdCBleHBlY3RlZCBpbiBwYWNrYWdlLmpzb24nICk7XG5cbiAgY29uc3Qgd2VicGFja1Jlc3VsdCA9ICggYXdhaXQgd2VicGFja0J1aWxkKCByZXBvLCBvcHRpb25zLmJyYW5kLCB7XG4gICAgb3V0cHV0RGlyOiBvcHRpb25zLnRlbXBPdXRwdXREaXIsXG4gICAgcHJvZmlsZUZpbGVTaXplOiBvcHRpb25zLnByb2ZpbGVGaWxlU2l6ZVxuICB9ICkgKTtcblxuICBjb25zdCB3ZWJwYWNrSlMgPSB3ZWJwYWNrUmVzdWx0LmpzO1xuXG4gIGxldCBpbmNsdWRlZFNvdXJjZXMgPSBbXG4gICAgJy4uL2Fzc2VydC9qcy9hc3NlcnQuanMnLFxuICAgICcuLi90YW5kZW0vanMvUGhldGlvSURVdGlscy5qcydcbiAgXTtcblxuICAvLyBhZGQgcmVwby1zcGVjaWZpYyBwcmVsb2FkcyBmcm9tIHBhY2thZ2UuanNvblxuICBpZiAoIHBhY2thZ2VPYmplY3QucGhldC5wcmVsb2FkICkge1xuICAgIGFzc2VydCggQXJyYXkuaXNBcnJheSggcGFja2FnZU9iamVjdC5waGV0LnByZWxvYWQgKSwgJ3ByZWxvYWQgc2hvdWxkIGJlIGFuIGFycmF5JyApO1xuICAgIGluY2x1ZGVkU291cmNlcyA9IGluY2x1ZGVkU291cmNlcy5jb25jYXQoIHBhY2thZ2VPYmplY3QucGhldC5wcmVsb2FkICk7XG5cbiAgICAvLyBOT1RFOiBTaG91bGQgZmluZCBhIGJldHRlciB3YXkgb2YgaGFuZGxpbmcgcHV0dGluZyB0aGVzZSBmaXJzdFxuICAgIGluY2x1ZGVkU291cmNlcy5mb3JFYWNoKCAoIHNvdXJjZSwgaW5kZXggKSA9PiB7XG4gICAgICBpZiAoIHNvdXJjZS5pbmNsdWRlcyggJ3NoZXJwYS9saWIvbG9kYXNoLScgKSApIHtcbiAgICAgICAgaW5jbHVkZWRTb3VyY2VzLnNwbGljZSggaW5kZXgsIDEgKTtcbiAgICAgICAgaW5jbHVkZWRTb3VyY2VzLnVuc2hpZnQoIHNvdXJjZSApO1xuICAgICAgfVxuICAgIH0gKTtcbiAgICBpbmNsdWRlZFNvdXJjZXMuZm9yRWFjaCggKCBzb3VyY2UsIGluZGV4ICkgPT4ge1xuICAgICAgaWYgKCBzb3VyY2UuaW5jbHVkZXMoICdzaGVycGEvbGliL2pxdWVyeS0nICkgKSB7XG4gICAgICAgIGluY2x1ZGVkU291cmNlcy5zcGxpY2UoIGluZGV4LCAxICk7XG4gICAgICAgIGluY2x1ZGVkU291cmNlcy51bnNoaWZ0KCBzb3VyY2UgKTtcbiAgICAgIH1cbiAgICB9ICk7XG4gIH1cbiAgaWYgKCBvcHRpb25zLm9taXRQcmVsb2FkcyApIHtcbiAgICBpbmNsdWRlZFNvdXJjZXMgPSBpbmNsdWRlZFNvdXJjZXMuZmlsdGVyKCBzb3VyY2UgPT4gIW9wdGlvbnMub21pdFByZWxvYWRzLmluY2x1ZGVzKCBzb3VyY2UgKSApO1xuICB9XG5cbiAgbGV0IGluY2x1ZGVkSlMgPSBpbmNsdWRlZFNvdXJjZXMubWFwKCBmaWxlID0+IGZzLnJlYWRGaWxlU3luYyggZmlsZSwgJ3V0ZjgnICkgKS5qb2luKCAnXFxuJyApO1xuXG4gIC8vIENoZWNrcyBpZiBsb2Rhc2ggZXhpc3RzXG4gIGNvbnN0IHRlc3RMb2Rhc2ggPSAnICBpZiAoICF3aW5kb3cuaGFzT3duUHJvcGVydHkoIFxcJ19cXCcgKSApIHtcXG4nICtcbiAgICAgICAgICAgICAgICAgICAgICcgICAgdGhyb3cgbmV3IEVycm9yKCBcXCdVbmRlcnNjb3JlL0xvZGFzaCBub3QgZm91bmQ6IF9cXCcgKTtcXG4nICtcbiAgICAgICAgICAgICAgICAgICAgICcgIH1cXG4nO1xuICAvLyBDaGVja3MgaWYgalF1ZXJ5IGV4aXN0c1xuICBjb25zdCB0ZXN0SlF1ZXJ5ID0gJyAgaWYgKCAhd2luZG93Lmhhc093blByb3BlcnR5KCBcXCckXFwnICkgKSB7XFxuJyArXG4gICAgICAgICAgICAgICAgICAgICAnICAgIHRocm93IG5ldyBFcnJvciggXFwnalF1ZXJ5IG5vdCBmb3VuZDogJFxcJyApO1xcbicgK1xuICAgICAgICAgICAgICAgICAgICAgJyAgfVxcbic7XG5cbiAgY29uc3QgZGVidWdKUyA9ICdcXG53aW5kb3cuYXNzZXJ0aW9ucy5lbmFibGVBc3NlcnQoKTtcXG4nO1xuICBpZiAoIG9wdGlvbnMuaXNEZWJ1ZyApIHtcbiAgICBpbmNsdWRlZEpTICs9IGRlYnVnSlM7XG4gIH1cblxuICBsZXQgZnVsbFNvdXJjZSA9IGAke2luY2x1ZGVkSlN9XFxuJHt3ZWJwYWNrSlN9YDtcbiAgaWYgKCBwYWNrYWdlT2JqZWN0LnBoZXQucmVxdWlyZXNKUXVlcnkgKSB7XG4gICAgZnVsbFNvdXJjZSA9IHRlc3RKUXVlcnkgKyBmdWxsU291cmNlO1xuICB9XG4gIGlmICggcGFja2FnZU9iamVjdC5waGV0LnJlcXVpcmVzTG9kYXNoICkge1xuICAgIGZ1bGxTb3VyY2UgPSB0ZXN0TG9kYXNoICsgZnVsbFNvdXJjZTtcbiAgfVxuXG4gIC8vIGluY2x1ZGUgZ2xvYmFscyBhc3NpZ25tZW50XG4gIGxldCBnbG9iYWxzID0gJ3dpbmRvdy5waGV0PXdpbmRvdy5waGV0fHx7fVxcbjsnO1xuICBpZiAoIHBhY2thZ2VPYmplY3QubmFtZSA9PT0gJ3BoZXQtbGliJyApIHtcbiAgICBnbG9iYWxzICs9IGBwaGV0LmNoaXBwZXI9cGhldC5jaGlwcGVyfHx7fTtcXG5waGV0LmNoaXBwZXIucGFja2FnZU9iamVjdD0ke0pTT04uc3RyaW5naWZ5KCBwYWNrYWdlT2JqZWN0ICl9O1xcbmA7XG5cbiAgICBjb25zdCBzdWJSZXBvcyA9IFsgJ3NjZW5lcnknLCAnc3VuJywgJ3NjZW5lcnktcGhldCcsICd0d2l4dCcsICdtb2JpdXMnIF07XG5cbiAgICBjb25zdCBwaGV0TGlicyA9IF8udW5pcSggXy5mbGF0dGVuKCBzdWJSZXBvcy5tYXAoIHN1YlJlcG8gPT4ge1xuICAgICAgcmV0dXJuIGdldFBoZXRMaWJzKCBzdWJSZXBvICk7XG4gICAgfSApICkuc29ydCgpICk7XG4gICAgY29uc3QgbG9jYWxlcyA9IFtcbiAgICAgIENoaXBwZXJDb25zdGFudHMuRkFMTEJBQ0tfTE9DQUxFLFxuICAgICAgLi4uXy5mbGF0dGVuKCBzdWJSZXBvcy5tYXAoIHN1YlJlcG8gPT4gZ2V0TG9jYWxlc0Zyb21SZXBvc2l0b3J5KCBzdWJSZXBvICkgKSApXG4gICAgXTtcbiAgICBjb25zdCB7IHN0cmluZ01hcCwgc3RyaW5nTWV0YWRhdGEgfSA9IGdldFN0cmluZ01hcCggcmVwbywgbG9jYWxlcywgcGhldExpYnMsIHdlYnBhY2tSZXN1bHQudXNlZE1vZHVsZXMgKTtcblxuICAgIGNvbnN0IGxvY2FsZURhdGEgPSBKU09OLnBhcnNlKCBmcy5yZWFkRmlsZVN5bmMoICcuLi9iYWJlbC9sb2NhbGVEYXRhLmpzb24nLCAndXRmOCcgKSApO1xuXG4gICAgZ2xvYmFscyArPSAncGhldC5jaGlwcGVyLnN0cmluZ1BhdGggPSBcXCcuLi9cXCc7XFxuJztcbiAgICBnbG9iYWxzICs9ICdwaGV0LmNoaXBwZXIubG9jYWxlID0gXFwnZW5cXCc7XFxuJztcbiAgICBnbG9iYWxzICs9ICdwaGV0LmNoaXBwZXIubG9hZE1vZHVsZXMgPSAoKSA9PiB7fTtcXG4nO1xuICAgIGdsb2JhbHMgKz0gYHBoZXQuY2hpcHBlci5zdHJpbmdzID0gJHtKU09OLnN0cmluZ2lmeSggc3RyaW5nTWFwLCBudWxsLCBvcHRpb25zLmlzRGVidWcgPyAyIDogJycgKX07XFxuYDtcbiAgICBnbG9iYWxzICs9IGBwaGV0LmNoaXBwZXIubG9jYWxlRGF0YSA9ICR7SlNPTi5zdHJpbmdpZnkoIGxvY2FsZURhdGEsIG51bGwsIG9wdGlvbnMuaXNEZWJ1ZyA/IDIgOiAnJyApfTtcXG5gO1xuICAgIGdsb2JhbHMgKz0gYHBoZXQuY2hpcHBlci5zdHJpbmdNZXRhZGF0YSA9ICR7SlNPTi5zdHJpbmdpZnkoIHN0cmluZ01ldGFkYXRhLCBudWxsLCBvcHRpb25zLmlzRGVidWcgPyAyIDogJycgKX07XFxuYDtcbiAgfVxuICBmdWxsU291cmNlID0gYFxcbiR7Z2xvYmFsc31cXG4ke2Z1bGxTb3VyY2V9YDtcblxuICAvLyBXcmFwIHdpdGggYW4gSUlGRVxuICBmdWxsU291cmNlID0gYChmdW5jdGlvbigpIHtcXG4ke2Z1bGxTb3VyY2V9XFxufSgpKTtgO1xuXG4gIGZ1bGxTb3VyY2UgPSBtaW5pZnkoIGZ1bGxTb3VyY2UsIG9wdGlvbnMgKTtcblxuICByZXR1cm4gZnVsbFNvdXJjZTtcbn0iXSwibmFtZXMiOlsiYXNzZXJ0IiwiZnMiLCJyZWFkRmlsZVN5bmMiLCJfIiwiQ2hpcHBlckNvbnN0YW50cyIsImdldExvY2FsZXNGcm9tUmVwb3NpdG9yeSIsImdldFBoZXRMaWJzIiwiZ2V0U3RyaW5nTWFwIiwibWluaWZ5Iiwid2VicGFja0J1aWxkIiwiYnVpbGRTdGFuZGFsb25lIiwicmVwbyIsInByb3ZpZGVkT3B0aW9ucyIsIm9wdGlvbnMiLCJtZXJnZSIsImlzRGVidWciLCJvbWl0UHJlbG9hZHMiLCJ0ZW1wT3V0cHV0RGlyIiwiYnJhbmQiLCJwYWNrYWdlT2JqZWN0IiwiSlNPTiIsInBhcnNlIiwicGhldCIsIndlYnBhY2tSZXN1bHQiLCJvdXRwdXREaXIiLCJwcm9maWxlRmlsZVNpemUiLCJ3ZWJwYWNrSlMiLCJqcyIsImluY2x1ZGVkU291cmNlcyIsInByZWxvYWQiLCJBcnJheSIsImlzQXJyYXkiLCJjb25jYXQiLCJmb3JFYWNoIiwic291cmNlIiwiaW5kZXgiLCJpbmNsdWRlcyIsInNwbGljZSIsInVuc2hpZnQiLCJmaWx0ZXIiLCJpbmNsdWRlZEpTIiwibWFwIiwiZmlsZSIsImpvaW4iLCJ0ZXN0TG9kYXNoIiwidGVzdEpRdWVyeSIsImRlYnVnSlMiLCJmdWxsU291cmNlIiwicmVxdWlyZXNKUXVlcnkiLCJyZXF1aXJlc0xvZGFzaCIsImdsb2JhbHMiLCJuYW1lIiwic3RyaW5naWZ5Iiwic3ViUmVwb3MiLCJwaGV0TGlicyIsInVuaXEiLCJmbGF0dGVuIiwic3ViUmVwbyIsInNvcnQiLCJsb2NhbGVzIiwiRkFMTEJBQ0tfTE9DQUxFIiwic3RyaW5nTWFwIiwic3RyaW5nTWV0YWRhdGEiLCJ1c2VkTW9kdWxlcyIsImxvY2FsZURhdGEiXSwibWFwcGluZ3MiOiJBQUFBLHNEQUFzRDtBQUV0RDs7OztDQUlDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUVELE9BQU9BLFlBQVksU0FBUztBQUM1QixPQUFPQyxNQUFNQyxZQUFZLFFBQVEsS0FBSztBQUN0QyxPQUFPQyxPQUFPLFNBQVM7QUFFdkIsT0FBT0Msc0JBQXNCLGdDQUFnQztBQUM3RCxPQUFP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