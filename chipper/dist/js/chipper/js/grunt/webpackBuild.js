// Copyright 2019-2024, University of Colorado Boulder
/**
 * Runs webpack - DO NOT RUN MULTIPLE CONCURRENTLY
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ import fs from 'fs';
import _ from 'lodash';
import { ConcatOperation, ModifySourcePlugin } from 'modify-source-webpack-plugin';
import path from 'path';
import dirname from '../../../perennial-alias/js/common/dirname.js';
import ChipperConstants from '../common/ChipperConstants.js';
import webpackGlobalLibraries from '../common/webpackGlobalLibraries.js';
const webpack = require('webpack');
// @ts-expect-error - until we have "type": "module" in our package.json
const __dirname = dirname(import.meta.url);
const activeRepos = fs.readFileSync(path.resolve(__dirname, '../../../perennial-alias/data/active-repos'), 'utf-8').trim().split(/\r?\n/).map((s)=>s.trim());
const reposByNamespace = {};
const aliases = {};
for (const repo of activeRepos){
    const packageFile = path.resolve(__dirname, `../../../${repo}/package.json`);
    if (fs.existsSync(packageFile)) {
        const packageObject = JSON.parse(fs.readFileSync(packageFile, 'utf-8'));
        if (packageObject.phet && packageObject.phet.requirejsNamespace) {
            reposByNamespace[packageObject.phet.requirejsNamespace] = repo;
            aliases[packageObject.phet.requirejsNamespace] = path.resolve(__dirname, `../../../${repo}${repo === 'brand' ? '/phet' : ''}/js`);
        }
    }
}
const getModuleRules = function getModuleRules() {
    return Object.keys(webpackGlobalLibraries).map((globalKey)=>{
        return {
            // path.join to normalize on the right path separator, perhaps there is another way?!
            test: (fileName)=>fileName.includes(path.join(webpackGlobalLibraries[globalKey])),
            loader: '../chipper/node_modules/expose-loader',
            options: {
                exposes: globalKey
            }
        };
    });
};
/**
 * Convert absolute paths of modules to relative ones
 */ const getRelativeModules = (modules)=>{
    const root = path.resolve(__dirname, '../../../');
    return modules// Webpack 5 reports intermediate paths which need to be filtered out
    .filter((m)=>fs.lstatSync(m).isFile())// Get the relative path to the root, like "joist/js/Sim.js" or, on Windows, "joist\js\Sim.js"
    .map((m)=>path.relative(root, m))// Some developers check in a package.json to the root of the checkouts, as described in https://github.com/phetsims/chipper/issues/494#issuecomment-821292542
    // like: /Users/samreid/apache-document-root/package.json. This powers grunt only and should not be included in the modules
    .filter((m)=>m !== '../package.json' && m !== '..\\package.json');
};
/**
 * Runs webpack - DO NOT RUN MULTIPLE CONCURRENTLY
 *
 * @returns The combined JS output from the process
 */ const webpackBuild = function webpackBuild(repo, brand, providedOptions) {
    return new Promise((resolve, reject)=>{
        const options = _.merge({
            outputDir: repo
        }, providedOptions);
        const outputDir = path.resolve(__dirname, `../../${ChipperConstants.BUILD_DIR}`, options.outputDir);
        const outputFileName = `${repo}.js`;
        const outputPath = path.resolve(outputDir, outputFileName);
        // Create plugins to ignore brands that we are not building at this time. Here "resource" is the module getting
        // imported, and "context" is the directory that holds the module doing the importing. This is split up because
        // of how brands are loaded in simLauncher.js. They are a dynamic import who's import path resolves to the current
        // brand. The way that webpack builds this is by creating a map of all the potential resources that could be loaded
        // by that import (by looking at the file structure). Thus the following resource/context regex split is accounting
        // for the "map" created in the built webpack file, in which the "resource" starts with "./{{brand}}" even though
        // the simLauncher line includes the parent directory: "brand/". For more details see https://github.com/phetsims/chipper/issues/879
        const ignorePhetBrand = new webpack.IgnorePlugin({
            resourceRegExp: /\/phet\//,
            contextRegExp: /brand/
        });
        const ignorePhetioBrand = new webpack.IgnorePlugin({
            resourceRegExp: /\/phet-io\//,
            contextRegExp: /brand/
        });
        const ignoreAdaptedFromPhetBrand = new webpack.IgnorePlugin({
            resourceRegExp: /\/adapted-from-phet\//,
            contextRegExp: /brand/
        });
        // Allow builds for developers that do not have the phet-io repo checked out. IgnorePlugin will skip any require
        // that matches the following regex.
        const ignorePhetioDirectories = new webpack.IgnorePlugin({
            resourceRegExp: /\/phet-io\// // ignore anything in a phet-io named directory
        });
        const compiler = webpack({
            module: {
                rules: getModuleRules()
            },
            // We uglify as a step after this, with many custom rules. So we do NOT optimize or uglify in this step.
            optimization: {
                minimize: false
            },
            // Simulations or runnables will have a single entry point
            entry: {
                repo: `../chipper/dist/js/${repo}/js/${repo}-main.js`
            },
            // We output our builds to the following dir
            output: {
                path: outputDir,
                filename: outputFileName,
                hashFunction: 'xxhash64' // for Node 17+, see https://github.com/webpack/webpack/issues/14532
            },
            // {Array.<Plugin>}
            plugins: [
                // Exclude brand specific code. This includes all of the `phet-io` repo for non phet-io builds.
                ...brand === 'phet' ? [
                    ignorePhetioBrand,
                    ignorePhetioDirectories,
                    ignoreAdaptedFromPhetBrand
                ] : brand === 'phet-io' ? [
                    ignorePhetBrand,
                    ignoreAdaptedFromPhetBrand
                ] : // adapted-from-phet and all other brands
                [
                    ignorePhetBrand,
                    ignorePhetioBrand,
                    ignorePhetioDirectories
                ],
                ...options.profileFileSize ? [
                    new ModifySourcePlugin({
                        rules: [
                            {
                                test: /.*/,
                                operations: [
                                    new ConcatOperation('start', 'console.log(\'START_MODULE\',\'$FILE_PATH\');\n\n'),
                                    new ConcatOperation('end', '\n\nconsole.log(\'END_MODULE\',\'$FILE_PATH\');\n\n')
                                ]
                            }
                        ]
                    })
                ] : []
            ]
        });
        compiler.run((err, stats)=>{
            if (err || stats.hasErrors()) {
                console.error('Webpack build errors:', stats.compilation.errors);
                reject(err || stats.compilation.errors[0]);
            } else {
                const jsFile = outputPath;
                const js = fs.readFileSync(jsFile, 'utf-8');
                fs.unlinkSync(jsFile);
                resolve({
                    js: js,
                    usedModules: getRelativeModules(Array.from(stats.compilation.fileDependencies))
                });
            }
        });
    });
};
webpackBuild.getModuleRules = getModuleRules;
export default webpackBuild;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2pzL2dydW50L3dlYnBhY2tCdWlsZC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxOS0yMDI0LCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuLyoqXG4gKiBSdW5zIHdlYnBhY2sgLSBETyBOT1QgUlVOIE1VTFRJUExFIENPTkNVUlJFTlRMWVxuICpcbiAqIEBhdXRob3IgSm9uYXRoYW4gT2xzb24gPGpvbmF0aGFuLm9sc29uQGNvbG9yYWRvLmVkdT5cbiAqL1xuXG5pbXBvcnQgZnMgZnJvbSAnZnMnO1xuaW1wb3J0IF8gZnJvbSAnbG9kYXNoJztcbmltcG9ydCB7IENvbmNhdE9wZXJhdGlvbiwgTW9kaWZ5U291cmNlUGx1Z2luIH0gZnJvbSAnbW9kaWZ5LXNvdXJjZS13ZWJwYWNrLXBsdWdpbic7XG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCB7IFN0YXRzIH0gZnJvbSAnd2VicGFjayc7XG5pbXBvcnQgZGlybmFtZSBmcm9tICcuLi8uLi8uLi9wZXJlbm5pYWwtYWxpYXMvanMvY29tbW9uL2Rpcm5hbWUuanMnO1xuaW1wb3J0IENoaXBwZXJDb25zdGFudHMgZnJvbSAnLi4vY29tbW9uL0NoaXBwZXJDb25zdGFudHMuanMnO1xuaW1wb3J0IHdlYnBhY2tHbG9iYWxMaWJyYXJpZXMgZnJvbSAnLi4vY29tbW9uL3dlYnBhY2tHbG9iYWxMaWJyYXJpZXMuanMnO1xuXG5jb25zdCB3ZWJwYWNrID0gcmVxdWlyZSggJ3dlYnBhY2snICk7XG5cbi8vIEB0cy1leHBlY3QtZXJyb3IgLSB1bnRpbCB3ZSBoYXZlIFwidHlwZVwiOiBcIm1vZHVsZVwiIGluIG91ciBwYWNrYWdlLmpzb25cbmNvbnN0IF9fZGlybmFtZSA9IGRpcm5hbWUoIGltcG9ydC5tZXRhLnVybCApO1xuXG5jb25zdCBhY3RpdmVSZXBvcyA9IGZzLnJlYWRGaWxlU3luYyggcGF0aC5yZXNvbHZlKCBfX2Rpcm5hbWUsICcuLi8uLi8uLi9wZXJlbm5pYWwtYWxpYXMvZGF0YS9hY3RpdmUtcmVwb3MnICksICd1dGYtOCcgKS50cmltKCkuc3BsaXQoIC9cXHI/XFxuLyApLm1hcCggcyA9PiBzLnRyaW0oKSApO1xuY29uc3QgcmVwb3NCeU5hbWVzcGFjZTogUmVjb3JkPHN0cmluZywgc3RyaW5nPiA9IHt9O1xuY29uc3QgYWxpYXNlczogUmVjb3JkPHN0cmluZywgc3RyaW5nPiA9IHt9O1xuXG5mb3IgKCBjb25zdCByZXBvIG9mIGFjdGl2ZVJlcG9zICkge1xuICBjb25zdCBwYWNrYWdlRmlsZSA9IHBhdGgucmVzb2x2ZSggX19kaXJuYW1lLCBgLi4vLi4vLi4vJHtyZXBvfS9wYWNrYWdlLmpzb25gICk7XG4gIGlmICggZnMuZXhpc3RzU3luYyggcGFja2FnZUZpbGUgKSApIHtcbiAgICBjb25zdCBwYWNrYWdlT2JqZWN0ID0gSlNPTi5wYXJzZSggZnMucmVhZEZpbGVTeW5jKCBwYWNrYWdlRmlsZSwgJ3V0Zi04JyApICk7XG4gICAgaWYgKCBwYWNrYWdlT2JqZWN0LnBoZXQgJiYgcGFja2FnZU9iamVjdC5waGV0LnJlcXVpcmVqc05hbWVzcGFjZSApIHtcbiAgICAgIHJlcG9zQnlOYW1lc3BhY2VbIHBhY2thZ2VPYmplY3QucGhldC5yZXF1aXJlanNOYW1lc3BhY2UgXSA9IHJlcG87XG4gICAgICBhbGlhc2VzWyBwYWNrYWdlT2JqZWN0LnBoZXQucmVxdWlyZWpzTmFtZXNwYWNlIF0gPSBwYXRoLnJlc29sdmUoIF9fZGlybmFtZSwgYC4uLy4uLy4uLyR7cmVwb30ke3JlcG8gPT09ICdicmFuZCcgPyAnL3BoZXQnIDogJyd9L2pzYCApO1xuICAgIH1cbiAgfVxufVxuXG5jb25zdCBnZXRNb2R1bGVSdWxlcyA9IGZ1bmN0aW9uIGdldE1vZHVsZVJ1bGVzKCkge1xuICByZXR1cm4gT2JqZWN0LmtleXMoIHdlYnBhY2tHbG9iYWxMaWJyYXJpZXMgKS5tYXAoIGdsb2JhbEtleSA9PiB7XG4gICAgcmV0dXJuIHtcblxuICAgICAgLy8gcGF0aC5qb2luIHRvIG5vcm1hbGl6ZSBvbiB0aGUgcmlnaHQgcGF0aCBzZXBhcmF0b3IsIHBlcmhhcHMgdGhlcmUgaXMgYW5vdGhlciB3YXk/IVxuICAgICAgdGVzdDogKCBmaWxlTmFtZTogc3RyaW5nICkgPT4gZmlsZU5hbWUuaW5jbHVkZXMoIHBhdGguam9pbiggd2VicGFja0dsb2JhbExpYnJhcmllc1sgZ2xvYmFsS2V5IGFzIGtleW9mIHR5cGVvZiB3ZWJwYWNrR2xvYmFsTGlicmFyaWVzIF0gKSApLFxuICAgICAgbG9hZGVyOiAnLi4vY2hpcHBlci9ub2RlX21vZHVsZXMvZXhwb3NlLWxvYWRlcicsXG4gICAgICBvcHRpb25zOiB7XG4gICAgICAgIGV4cG9zZXM6IGdsb2JhbEtleVxuICAgICAgfVxuICAgIH07XG4gIH0gKTtcbn07XG5cbi8qKlxuICogQ29udmVydCBhYnNvbHV0ZSBwYXRocyBvZiBtb2R1bGVzIHRvIHJlbGF0aXZlIG9uZXNcbiAqL1xuY29uc3QgZ2V0UmVsYXRpdmVNb2R1bGVzID0gKCBtb2R1bGVzOiBzdHJpbmdbXSApID0+IHtcbiAgY29uc3Qgcm9vdCA9IHBhdGgucmVzb2x2ZSggX19kaXJuYW1lLCAnLi4vLi4vLi4vJyApO1xuICByZXR1cm4gbW9kdWxlc1xuXG4gICAgLy8gV2VicGFjayA1IHJlcG9ydHMgaW50ZXJtZWRpYXRlIHBhdGhzIHdoaWNoIG5lZWQgdG8gYmUgZmlsdGVyZWQgb3V0XG4gICAgLmZpbHRlciggbSA9PiBmcy5sc3RhdFN5bmMoIG0gKS5pc0ZpbGUoKSApXG5cbiAgICAvLyBHZXQgdGhlIHJlbGF0aXZlIHBhdGggdG8gdGhlIHJvb3QsIGxpa2UgXCJqb2lzdC9qcy9TaW0uanNcIiBvciwgb24gV2luZG93cywgXCJqb2lzdFxcanNcXFNpbS5qc1wiXG4gICAgLm1hcCggbSA9PiBwYXRoLnJlbGF0aXZlKCByb290LCBtICkgKVxuXG4gICAgLy8gU29tZSBkZXZlbG9wZXJzIGNoZWNrIGluIGEgcGFja2FnZS5qc29uIHRvIHRoZSByb290IG9mIHRoZSBjaGVja291dHMsIGFzIGRlc2NyaWJlZCBpbiBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvY2hpcHBlci9pc3N1ZXMvNDk0I2lzc3VlY29tbWVudC04MjEyOTI1NDJcbiAgICAvLyBsaWtlOiAvVXNlcnMvc2FtcmVpZC9hcGFjaGUtZG9jdW1lbnQtcm9vdC9wYWNrYWdlLmpzb24uIFRoaXMgcG93ZXJzIGdydW50IG9ubHkgYW5kIHNob3VsZCBub3QgYmUgaW5jbHVkZWQgaW4gdGhlIG1vZHVsZXNcbiAgICAuZmlsdGVyKCBtID0+IG0gIT09ICcuLi9wYWNrYWdlLmpzb24nICYmIG0gIT09ICcuLlxcXFxwYWNrYWdlLmpzb24nICk7XG59O1xuXG50eXBlIFdlYnBhY2tCdWlsZE9wdGlvbnMgPSB7XG4gIG91dHB1dERpcj86IHN0cmluZztcbiAgcHJvZmlsZUZpbGVTaXplPzogYm9vbGVhbjtcbn07XG5cbi8qKlxuICogUnVucyB3ZWJwYWNrIC0gRE8gTk9UIFJVTiBNVUxUSVBMRSBDT05DVVJSRU5UTFlcbiAqXG4gKiBAcmV0dXJucyBUaGUgY29tYmluZWQgSlMgb3V0cHV0IGZyb20gdGhlIHByb2Nlc3NcbiAqL1xuY29uc3Qgd2VicGFja0J1aWxkID0gZnVuY3Rpb24gd2VicGFja0J1aWxkKCByZXBvOiBzdHJpbmcsIGJyYW5kOiBzdHJpbmcsIHByb3ZpZGVkT3B0aW9ucz86IFdlYnBhY2tCdWlsZE9wdGlvbnMgKTogUHJvbWlzZTx7IGpzOiBzdHJpbmc7IHVzZWRNb2R1bGVzOiBzdHJpbmdbXSB9PiB7XG5cbiAgcmV0dXJuIG5ldyBQcm9taXNlKCAoIHJlc29sdmUsIHJlamVjdCApID0+IHtcblxuICAgIGNvbnN0IG9wdGlvbnMgPSBfLm1lcmdlKCB7XG4gICAgICBvdXRwdXREaXI6IHJlcG9cbiAgICB9LCBwcm92aWRlZE9wdGlvbnMgKTtcblxuICAgIGNvbnN0IG91dHB1dERpciA9IHBhdGgucmVzb2x2ZSggX19kaXJuYW1lLCBgLi4vLi4vJHtDaGlwcGVyQ29uc3RhbnRzLkJVSUxEX0RJUn1gLCBvcHRpb25zLm91dHB1dERpciApO1xuICAgIGNvbnN0IG91dHB1dEZpbGVOYW1lID0gYCR7cmVwb30uanNgO1xuICAgIGNvbnN0IG91dHB1dFBhdGggPSBwYXRoLnJlc29sdmUoIG91dHB1dERpciwgb3V0cHV0RmlsZU5hbWUgKTtcblxuICAgIC8vIENyZWF0ZSBwbHVnaW5zIHRvIGlnbm9yZSBicmFuZHMgdGhhdCB3ZSBhcmUgbm90IGJ1aWxkaW5nIGF0IHRoaXMgdGltZS4gSGVyZSBcInJlc291cmNlXCIgaXMgdGhlIG1vZHVsZSBnZXR0aW5nXG4gICAgLy8gaW1wb3J0ZWQsIGFuZCBcImNvbnRleHRcIiBpcyB0aGUgZGlyZWN0b3J5IHRoYXQgaG9sZHMgdGhlIG1vZHVsZSBkb2luZyB0aGUgaW1wb3J0aW5nLiBUaGlzIGlzIHNwbGl0IHVwIGJlY2F1c2VcbiAgICAvLyBvZiBob3cgYnJhbmRzIGFyZSBsb2FkZWQgaW4gc2ltTGF1bmNoZXIuanMuIFRoZXkgYXJlIGEgZHluYW1pYyBpbXBvcnQgd2hvJ3MgaW1wb3J0IHBhdGggcmVzb2x2ZXMgdG8gdGhlIGN1cnJlbnRcbiAgICAvLyBicmFuZC4gVGhlIHdheSB0aGF0IHdlYnBhY2sgYnVpbGRzIHRoaXMgaXMgYnkgY3JlYXRpbmcgYSBtYXAgb2YgYWxsIHRoZSBwb3RlbnRpYWwgcmVzb3VyY2VzIHRoYXQgY291bGQgYmUgbG9hZGVkXG4gICAgLy8gYnkgdGhhdCBpbXBvcnQgKGJ5IGxvb2tpbmcgYXQgdGhlIGZpbGUgc3RydWN0dXJlKS4gVGh1cyB0aGUgZm9sbG93aW5nIHJlc291cmNlL2NvbnRleHQgcmVnZXggc3BsaXQgaXMgYWNjb3VudGluZ1xuICAgIC8vIGZvciB0aGUgXCJtYXBcIiBjcmVhdGVkIGluIHRoZSBidWlsdCB3ZWJwYWNrIGZpbGUsIGluIHdoaWNoIHRoZSBcInJlc291cmNlXCIgc3RhcnRzIHdpdGggXCIuL3t7YnJhbmR9fVwiIGV2ZW4gdGhvdWdoXG4gICAgLy8gdGhlIHNpbUxhdW5jaGVyIGxpbmUgaW5jbHVkZXMgdGhlIHBhcmVudCBkaXJlY3Rvcnk6IFwiYnJhbmQvXCIuIEZvciBtb3JlIGRldGFpbHMgc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9jaGlwcGVyL2lzc3Vlcy84NzlcbiAgICBjb25zdCBpZ25vcmVQaGV0QnJhbmQgPSBuZXcgd2VicGFjay5JZ25vcmVQbHVnaW4oIHsgcmVzb3VyY2VSZWdFeHA6IC9cXC9waGV0XFwvLywgY29udGV4dFJlZ0V4cDogL2JyYW5kLyB9ICk7XG4gICAgY29uc3QgaWdub3JlUGhldGlvQnJhbmQgPSBuZXcgd2VicGFjay5JZ25vcmVQbHVnaW4oIHsgcmVzb3VyY2VSZWdFeHA6IC9cXC9waGV0LWlvXFwvLywgY29udGV4dFJlZ0V4cDogL2JyYW5kLyB9ICk7XG4gICAgY29uc3QgaWdub3JlQWRhcHRlZEZyb21QaGV0QnJhbmQgPSBuZXcgd2VicGFjay5JZ25vcmVQbHVnaW4oIHtcbiAgICAgIHJlc291cmNlUmVnRXhwOiAvXFwvYWRhcHRlZC1mcm9tLXBoZXRcXC8vLFxuICAgICAgY29udGV4dFJlZ0V4cDogL2JyYW5kL1xuICAgIH0gKTtcblxuICAgIC8vIEFsbG93IGJ1aWxkcyBmb3IgZGV2ZWxvcGVycyB0aGF0IGRvIG5vdCBoYXZlIHRoZSBwaGV0LWlvIHJlcG8gY2hlY2tlZCBvdXQuIElnbm9yZVBsdWdpbiB3aWxsIHNraXAgYW55IHJlcXVpcmVcbiAgICAvLyB0aGF0IG1hdGNoZXMgdGhlIGZvbGxvd2luZyByZWdleC5cbiAgICBjb25zdCBpZ25vcmVQaGV0aW9EaXJlY3RvcmllcyA9IG5ldyB3ZWJwYWNrLklnbm9yZVBsdWdpbigge1xuICAgICAgcmVzb3VyY2VSZWdFeHA6IC9cXC9waGV0LWlvXFwvLyAvLyBpZ25vcmUgYW55dGhpbmcgaW4gYSBwaGV0LWlvIG5hbWVkIGRpcmVjdG9yeVxuICAgIH0gKTtcblxuICAgIGNvbnN0IGNvbXBpbGVyID0gd2VicGFjaygge1xuXG4gICAgICBtb2R1bGU6IHtcbiAgICAgICAgcnVsZXM6IGdldE1vZHVsZVJ1bGVzKClcbiAgICAgIH0sXG5cbiAgICAgIC8vIFdlIHVnbGlmeSBhcyBhIHN0ZXAgYWZ0ZXIgdGhpcywgd2l0aCBtYW55IGN1c3RvbSBydWxlcy4gU28gd2UgZG8gTk9UIG9wdGltaXplIG9yIHVnbGlmeSBpbiB0aGlzIHN0ZXAuXG4gICAgICBvcHRpbWl6YXRpb246IHtcbiAgICAgICAgbWluaW1pemU6IGZhbHNlXG4gICAgICB9LFxuXG4gICAgICAvLyBTaW11bGF0aW9ucyBvciBydW5uYWJsZXMgd2lsbCBoYXZlIGEgc2luZ2xlIGVudHJ5IHBvaW50XG4gICAgICBlbnRyeToge1xuICAgICAgICByZXBvOiBgLi4vY2hpcHBlci9kaXN0L2pzLyR7cmVwb30vanMvJHtyZXBvfS1tYWluLmpzYFxuICAgICAgfSxcblxuICAgICAgLy8gV2Ugb3V0cHV0IG91ciBidWlsZHMgdG8gdGhlIGZvbGxvd2luZyBkaXJcbiAgICAgIG91dHB1dDoge1xuICAgICAgICBwYXRoOiBvdXRwdXREaXIsXG4gICAgICAgIGZpbGVuYW1lOiBvdXRwdXRGaWxlTmFtZSxcbiAgICAgICAgaGFzaEZ1bmN0aW9uOiAneHhoYXNoNjQnIC8vIGZvciBOb2RlIDE3Kywgc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS93ZWJwYWNrL3dlYnBhY2svaXNzdWVzLzE0NTMyXG4gICAgICB9LFxuXG4gICAgICAvLyB7QXJyYXkuPFBsdWdpbj59XG4gICAgICBwbHVnaW5zOiBbXG5cbiAgICAgICAgLy8gRXhjbHVkZSBicmFuZCBzcGVjaWZpYyBjb2RlLiBUaGlzIGluY2x1ZGVzIGFsbCBvZiB0aGUgYHBoZXQtaW9gIHJlcG8gZm9yIG5vbiBwaGV0LWlvIGJ1aWxkcy5cbiAgICAgICAgLi4uKCBicmFuZCA9PT0gJ3BoZXQnID8gWyBpZ25vcmVQaGV0aW9CcmFuZCwgaWdub3JlUGhldGlvRGlyZWN0b3JpZXMsIGlnbm9yZUFkYXB0ZWRGcm9tUGhldEJyYW5kIF0gOlxuICAgICAgICAgICAgIGJyYW5kID09PSAncGhldC1pbycgPyBbIGlnbm9yZVBoZXRCcmFuZCwgaWdub3JlQWRhcHRlZEZyb21QaGV0QnJhbmQgXSA6XG5cbiAgICAgICAgICAgICAgIC8vIGFkYXB0ZWQtZnJvbS1waGV0IGFuZCBhbGwgb3RoZXIgYnJhbmRzXG4gICAgICAgICAgICAgICBbIGlnbm9yZVBoZXRCcmFuZCwgaWdub3JlUGhldGlvQnJhbmQsIGlnbm9yZVBoZXRpb0RpcmVjdG9yaWVzIF0gKSxcbiAgICAgICAgLi4uKCBvcHRpb25zLnByb2ZpbGVGaWxlU2l6ZSA/IFtcbiAgICAgICAgICBuZXcgTW9kaWZ5U291cmNlUGx1Z2luKCB7XG4gICAgICAgICAgICBydWxlczogW1xuICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgdGVzdDogLy4qLyxcbiAgICAgICAgICAgICAgICBvcGVyYXRpb25zOiBbXG4gICAgICAgICAgICAgICAgICBuZXcgQ29uY2F0T3BlcmF0aW9uKFxuICAgICAgICAgICAgICAgICAgICAnc3RhcnQnLFxuICAgICAgICAgICAgICAgICAgICAnY29uc29sZS5sb2coXFwnU1RBUlRfTU9EVUxFXFwnLFxcJyRGSUxFX1BBVEhcXCcpO1xcblxcbidcbiAgICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgICAgICBuZXcgQ29uY2F0T3BlcmF0aW9uKFxuICAgICAgICAgICAgICAgICAgICAnZW5kJyxcbiAgICAgICAgICAgICAgICAgICAgJ1xcblxcbmNvbnNvbGUubG9nKFxcJ0VORF9NT0RVTEVcXCcsXFwnJEZJTEVfUEFUSFxcJyk7XFxuXFxuJ1xuICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgXVxuICAgICAgICAgIH0gKVxuICAgICAgICBdIDogW10gKVxuICAgICAgXVxuICAgIH0gKTtcblxuICAgIGNvbXBpbGVyLnJ1biggKCBlcnI6IEVycm9yLCBzdGF0czogU3RhdHMgKSA9PiB7XG4gICAgICBpZiAoIGVyciB8fCBzdGF0cy5oYXNFcnJvcnMoKSApIHtcbiAgICAgICAgY29uc29sZS5lcnJvciggJ1dlYnBhY2sgYnVpbGQgZXJyb3JzOicsIHN0YXRzLmNvbXBpbGF0aW9uLmVycm9ycyApO1xuICAgICAgICByZWplY3QoIGVyciB8fCBzdGF0cy5jb21waWxhdGlvbi5lcnJvcnNbIDAgXSApO1xuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgIGNvbnN0IGpzRmlsZSA9IG91dHB1dFBhdGg7XG4gICAgICAgIGNvbnN0IGpzID0gZnMucmVhZEZpbGVTeW5jKCBqc0ZpbGUsICd1dGYtOCcgKTtcblxuICAgICAgICBmcy51bmxpbmtTeW5jKCBqc0ZpbGUgKTtcblxuICAgICAgICByZXNvbHZlKCB7XG4gICAgICAgICAganM6IGpzLFxuICAgICAgICAgIHVzZWRNb2R1bGVzOiBnZXRSZWxhdGl2ZU1vZHVsZXMoIEFycmF5LmZyb20oIHN0YXRzLmNvbXBpbGF0aW9uLmZpbGVEZXBlbmRlbmNpZXMgKSApXG4gICAgICAgIH0gKTtcbiAgICAgIH1cbiAgICB9ICk7XG4gIH0gKTtcbn07XG5cbndlYnBhY2tCdWlsZC5nZXRNb2R1bGVSdWxlcyA9IGdldE1vZHVsZVJ1bGVzO1xuZXhwb3J0IGRlZmF1bHQgd2VicGFja0J1aWxkOyJdLCJuYW1lcyI6WyJmcyIsIl8iLCJDb25jYXRPcGVyYXRpb24iLCJNb2RpZnlTb3VyY2VQbHVnaW4iLCJwYXRoIiwiZGlybmFtZSIsIkNoaXBwZXJDb25zdGFudHMiLCJ3ZWJwYWNrR2xvYmFsTGlicmFyaWVzIiwid2VicGFjayIsInJlcXVpcmUiLCJfX2Rpcm5hbWUiLCJ1cmwiLCJhY3RpdmVSZXBvcyIsInJlYWRGaWxlU3luYyIsInJlc29sdmUiLCJ0cmltIiwic3BsaXQiLCJtYXAiLCJzIiwicmVwb3NCeU5hbWVzcGFjZSIsImFsaWFzZXMiLCJyZXBvIiwicGFja2FnZUZpbGUiLCJleGlzdHNTeW5jIiwicGFja2FnZU9iamVjdCIsIkpTT04iLCJwYXJzZSIsInBoZXQiLCJyZXF1aXJlanNOYW1lc3BhY2UiLCJnZXRNb2R1bGVSdWxlcyIsIk9iamVjdCIsImtleXMiLCJnbG9iYWxLZXkiLCJ0ZXN0IiwiZmlsZU5hbWUiLCJpbmNsdWRlcyIsImpvaW4iLCJsb2FkZXIiLCJvcHRpb25zIiwiZXhwb3NlcyIsImdldFJlbGF0aXZlTW9kdWxlcyIsIm1vZHVsZXMiLCJyb290IiwiZmlsdGVyIiwibSIsImxzdGF0U3luYyIsImlzRmlsZSIsInJlbGF0aXZlIiwid2VicGFja0J1aWxkIiwiYnJhbmQiLCJwcm92aWRlZE9wdGlvbnMiLCJQcm9taXNlIiwicmVqZWN0IiwibWVyZ2UiLCJvdXRwdXREaXIiLCJCVUlMRF9ESVIiLCJvdXRwdXRGaWxlTmFtZSIsIm91dHB1dFBhdGgiLCJpZ25vcmVQaGV0QnJhbmQiLCJJZ25vcmVQbHVnaW4iLCJyZXNvdXJjZVJlZ0V4cCIsImNvbnRleHRSZWdFeHAiLCJpZ25vcmVQaGV0aW9CcmFuZCIsImlnbm9yZUFkYXB0ZWRGcm9tUGhldEJyYW5kIiwiaWdub3JlUGhldGlvRGlyZWN0b3JpZXMiLCJjb21waWxlciIsIm1vZHVsZSIsInJ1bGVzIiwib3B0aW1pemF0aW9uIiwibWluaW1pemUiLCJlbnRyeSIsIm91dHB1dCIsImZpbGVuYW1lIiwiaGFzaEZ1bmN0aW9uIiwicGx1Z2lucyIsInByb2ZpbGVGaWxlU2l6ZSIsIm9wZXJhdGlvbnMiLCJydW4iLCJlcnIiLCJzdGF0cyIsImhhc0Vycm9ycyIsImNvbnNvbGUiLCJlcnJvciIsImNvbXBpbGF0aW9uIiwiZXJyb3JzIiwianNGaWxlIiwianMiLCJ1bmxpbmtTeW5jIiwidXNlZE1vZHVsZXMiLCJBcnJheSIsImZyb20iLCJmaWxlRGVwZW5kZW5jaWVzIl0sIm1hcHBpbmdzIjoiQUFBQSxzREFBc0Q7QUFFdEQ7Ozs7Q0FJQyxHQUVELE9BQU9BLFFBQVEsS0FBSztBQUNwQixPQUFPQyxPQUFPLFNBQVM7QUFDdkIsU0FBU0MsZUFBZSxFQUFFQyxrQkFBa0IsUUFBUSwrQkFBK0I7QUFDbkYsT0FBT0MsVUFBVSxPQUFPO0FBRXhCLE9BQU9DLGFBQWEs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