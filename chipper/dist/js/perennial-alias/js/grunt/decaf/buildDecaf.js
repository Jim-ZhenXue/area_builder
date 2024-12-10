// Copyright 2017-2019, University of Colorado Boulder
/**
 * Deploys a decaf simulation after incrementing the test version number.  This file ported from dev.js
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
import fs from 'fs';
import execute from '../../common/execute.js';
import SimVersion from '../../browser-and-node/SimVersion.js';
import getPreloads from './getPreloads.js';
const assert = require('assert');
const copyFile = require('../../common/copyFile.js');
const gitRevParse = require('../../common/gitRevParse.js');
const loadJSON = require('../../common/loadJSON.js');
const writeJSON = require('../../common/writeJSON.js');
const path = require('path');
// constants
const BUILD_LOCAL_FILENAME = `${process.env.HOME}/.phet/build-local.json`;
/**
 * Deploys a dev version after incrementing the test version number.
 */ export default function(project) {
    return _ref.apply(this, arguments);
}
function _ref() {
    _ref = _async_to_generator(function*(project) {
        const buildLocalJSON = JSON.parse(fs.readFileSync(BUILD_LOCAL_FILENAME, {
            encoding: 'utf-8'
        }));
        const gitRoot = buildLocalJSON.gitRoot;
        const urlRoot = buildLocalJSON.urlRoot;
        const trunkPath = buildLocalJSON.decafTrunkPath;
        assert && assert(gitRoot !== undefined, 'buildLocal.gitRoot is undefined');
        assert && assert(urlRoot !== undefined, 'buildLocal.urlRoot is undefined');
        assert && assert(trunkPath !== undefined, 'buildLocal.decafTrunkPath is undefined');
        // Command obtained from running in IntelliJ IDEA with the given .project.
        const cmd = [
            '-classpath',
            // Build classes with
            // ~/phet-svn-trunk-2020/build-tools$ chmod u+x ./contrib/apache-ant/bin/ant
            // ~/phet-svn-trunk-2020/build-tools$ ./build.sh
            // Other jars taken from /phet-svn-trunk-2020/build-tools/build-tools-build.properties
            `${trunkPath}/build-tools/ant_output/phetbuild/classes:${trunkPath}/build-tools/contrib/proguard/lib/proguard.jar:${trunkPath}/build-tools/contrib/commons-lang/commons-lang.jar:${trunkPath}/build-tools/contrib/jsch/jsch.jar:${trunkPath}/build-tools/contrib/scala/scala-compiler.jar:${trunkPath}/build-tools/contrib/scala/scala-library.jar:${trunkPath}/build-tools/contrib/apache-ant/lib/ant.jar:${trunkPath}/build-tools/contrib/apache-ant/lib/ant-launcher.jar:${trunkPath}/build-tools/contrib/yuicompressor/yuicompressor-2.4.4.jar:${trunkPath}/build-tools/contrib/jgit/org.eclipse.jgit-1.1.0.201109151100-r.jar:/Library/Java/JavaVirtualMachines/jdk1.7.0_80.jdk/Contents/Home/lib/tools.jar`,
            'edu.colorado.phet.buildtools.BuildScript',
            trunkPath,
            project
        ];
        const program = '/Library/Java/JavaVirtualMachines/jdk1.7.0_80.jdk/Contents/Home/bin/java';
        yield execute(program, cmd, process.cwd());
        const buildDir = `../decaf/projects/${project}/build/`;
        try {
            fs.mkdirSync(buildDir);
        } catch (e) {
            console.log('perhaps the build directory exists');
        }
        const allJar = `${gitRoot}decaf/projects/${project}/build/${project}_all.jar`;
        yield copyFile(`${trunkPath}/simulations-java/simulations/${project}/deploy/${project}_all.jar`, allJar);
        console.log('copied');
        const javaProperties = fs.readFileSync(`${trunkPath}/simulations-java/simulations/${project}/${project}-build.properties`, 'utf-8');
        const lines = javaProperties.split('\n');
        const flavors = lines.filter((line)=>line.startsWith('project.flavor')).map((line)=>line.split('.')[2]);
        let url = '';
        if (flavors.length === 0) {
            url = `${urlRoot}/decaf/html?project=${project}`;
        } else {
            url = `${urlRoot}/decaf/html?project=${project}&simulation=${flavors[0]}`;
        }
        console.log(`awaiting preloads via puppeteer at url = ${url}`);
        const preloadResources = yield getPreloads(url);
        console.log(`We have the preloads!\n${preloadResources}`);
        const packageFileRelative = `projects/${project}/package.json`;
        const packageFile = `../decaf/${packageFileRelative}`;
        const packageObject = yield loadJSON(packageFile);
        const previousVersion = SimVersion.parse(packageObject.version);
        // Bump the version
        const version = new SimVersion(previousVersion.major, previousVersion.minor, previousVersion.maintenance, {
            testType: 'dev',
            testNumber: previousVersion.testNumber + 1
        });
        packageObject.version = version.toString();
        yield writeJSON(packageFile, packageObject);
        const versionString = version.toString();
        let html = fs.readFileSync('../decaf/html/index.html', 'utf-8');
        html = html.split('{{PROJECT}}').join(project);
        html = html.split('{{VERSION}}').join(versionString);
        html = html.split('{{IS_BUILT}}').join('true');
        html = html.split('\'{{PRELOAD_RESOURCES}}\'').join(preloadResources);
        fs.writeFileSync(`${buildDir}/${project}.html`, html);
        const stringFiles = fs.readdirSync(`${trunkPath}/simulations-java/simulations/${project}/data/${project}/localization`);
        const locales = stringFiles.filter((stringFile)=>stringFile.includes('_')).map((file)=>file.substring(file.indexOf('_') + 1, file.lastIndexOf('.')));
        console.log(locales.join('\n'));
        fs.writeFileSync(`${buildDir}/locales.txt`, locales.join('\n'));
        fs.writeFileSync(`${buildDir}/simulations.txt`, flavors.join('\n'));
        yield copyFile('../decaf/html/style.css', `${buildDir}/style.css`);
        yield copyFile('../decaf/html/splash.gif', `${buildDir}/splash.gif`);
        // Recursively copy ../decaf/html/cheerpj_3.0 to ${buildDir}/cheerpj_3.0
        // Function to create a directory if it doesn't exist
        function ensureDir(dir) {
            try {
                fs.mkdirSync(dir, {
                    recursive: true
                });
            } catch (error) {
                // @ts-expect-error
                if (error.code !== 'EEXIST') {
                    throw error;
                } // Ignore the error if the directory already exists
            }
        }
        function copyDirRecursive(sourceDir, targetDir) {
            return _copyDirRecursive.apply(this, arguments);
        }
        function _copyDirRecursive() {
            _copyDirRecursive = // Recursive function to copy all files from one directory to another
            _async_to_generator(function*(sourceDir, targetDir) {
                ensureDir(targetDir);
                const entries = fs.readdirSync(sourceDir, {
                    withFileTypes: true
                });
                for (const entry of entries){
                    const sourcePath = path.join(sourceDir, entry.name);
                    const targetPath = path.join(targetDir, entry.name);
                    if (entry.isDirectory()) {
                        yield copyDirRecursive(sourcePath, targetPath);
                    } else {
                        yield copyFile(sourcePath, targetPath);
                    }
                }
            });
            return _copyDirRecursive.apply(this, arguments);
        }
        const cheerpjDir = `${buildDir}/cheerpj_3.0`;
        ensureDir(cheerpjDir);
        yield copyDirRecursive('../decaf/html/cheerpj_3.0', cheerpjDir);
        const decafSHA = yield gitRevParse('decaf', 'HEAD');
        const chipperSHA = yield gitRevParse('chipper', 'HEAD');
        const perennialAliasSHA = yield gitRevParse('perennial-alias', 'HEAD');
        const perennialSHA = yield gitRevParse('perennial', 'HEAD');
        // Please set the svn command line path as appropriate for your system
        const svnInfo = yield execute('/opt/homebrew/bin/svn', [
            'info'
        ], `${trunkPath}`);
        const dependencies = {
            version: versionString,
            decaf: decafSHA,
            notes: 'The decaf sha is from before the version commit.',
            chipper: chipperSHA,
            'perennial-alias': perennialAliasSHA,
            perennial: perennialSHA,
            svnInfo: svnInfo
        };
        console.log(dependencies);
        yield writeJSON(`${buildDir}/dependencies.json`, dependencies);
        if (flavors.length === 0) {
            console.log(`build and ready for local testing: ${urlRoot}/decaf/projects/${project}/build/${project}.html`);
        } else {
            console.log('build and ready for local testing:');
            flavors.forEach((flavor)=>{
                console.log(`build and ready for local testing: ${urlRoot}/decaf/projects/${project}/build/${project}.html?simulation=${flavor}`);
            });
        }
    });
    return _ref.apply(this, arguments);
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3BlcmVubmlhbC1hbGlhcy9qcy9ncnVudC9kZWNhZi9idWlsZERlY2FmLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE3LTIwMTksIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIERlcGxveXMgYSBkZWNhZiBzaW11bGF0aW9uIGFmdGVyIGluY3JlbWVudGluZyB0aGUgdGVzdCB2ZXJzaW9uIG51bWJlci4gIFRoaXMgZmlsZSBwb3J0ZWQgZnJvbSBkZXYuanNcbiAqXG4gKiBAYXV0aG9yIFNhbSBSZWlkIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxuICovXG5cbmltcG9ydCBmcyBmcm9tICdmcyc7XG5pbXBvcnQgZXhlY3V0ZSBmcm9tICcuLi8uLi9jb21tb24vZXhlY3V0ZS5qcyc7XG5pbXBvcnQgU2ltVmVyc2lvbiBmcm9tICcuLi8uLi9icm93c2VyLWFuZC1ub2RlL1NpbVZlcnNpb24uanMnO1xuaW1wb3J0IGdldFByZWxvYWRzIGZyb20gJy4vZ2V0UHJlbG9hZHMuanMnO1xuXG5jb25zdCBhc3NlcnQgPSByZXF1aXJlKCAnYXNzZXJ0JyApO1xuY29uc3QgY29weUZpbGUgPSByZXF1aXJlKCAnLi4vLi4vY29tbW9uL2NvcHlGaWxlLmpzJyApO1xuY29uc3QgZ2l0UmV2UGFyc2UgPSByZXF1aXJlKCAnLi4vLi4vY29tbW9uL2dpdFJldlBhcnNlLmpzJyApO1xuY29uc3QgbG9hZEpTT04gPSByZXF1aXJlKCAnLi4vLi4vY29tbW9uL2xvYWRKU09OLmpzJyApO1xuY29uc3Qgd3JpdGVKU09OID0gcmVxdWlyZSggJy4uLy4uL2NvbW1vbi93cml0ZUpTT04uanMnICk7XG5jb25zdCBwYXRoID0gcmVxdWlyZSggJ3BhdGgnICk7XG5cbi8vIGNvbnN0YW50c1xuY29uc3QgQlVJTERfTE9DQUxfRklMRU5BTUUgPSBgJHtwcm9jZXNzLmVudi5IT01FfS8ucGhldC9idWlsZC1sb2NhbC5qc29uYDtcblxuLyoqXG4gKiBEZXBsb3lzIGEgZGV2IHZlcnNpb24gYWZ0ZXIgaW5jcmVtZW50aW5nIHRoZSB0ZXN0IHZlcnNpb24gbnVtYmVyLlxuICovXG5leHBvcnQgZGVmYXVsdCBhc3luYyBmdW5jdGlvbiggcHJvamVjdDogc3RyaW5nICk6IFByb21pc2U8dm9pZD4ge1xuXG4gIGNvbnN0IGJ1aWxkTG9jYWxKU09OID0gSlNPTi5wYXJzZSggZnMucmVhZEZpbGVTeW5jKCBCVUlMRF9MT0NBTF9GSUxFTkFNRSwgeyBlbmNvZGluZzogJ3V0Zi04JyB9ICkgKTtcbiAgY29uc3QgZ2l0Um9vdCA9IGJ1aWxkTG9jYWxKU09OLmdpdFJvb3Q7XG4gIGNvbnN0IHVybFJvb3QgPSBidWlsZExvY2FsSlNPTi51cmxSb290O1xuICBjb25zdCB0cnVua1BhdGggPSBidWlsZExvY2FsSlNPTi5kZWNhZlRydW5rUGF0aDtcblxuICBhc3NlcnQgJiYgYXNzZXJ0KCBnaXRSb290ICE9PSB1bmRlZmluZWQsICdidWlsZExvY2FsLmdpdFJvb3QgaXMgdW5kZWZpbmVkJyApO1xuICBhc3NlcnQgJiYgYXNzZXJ0KCB1cmxSb290ICE9PSB1bmRlZmluZWQsICdidWlsZExvY2FsLnVybFJvb3QgaXMgdW5kZWZpbmVkJyApO1xuICBhc3NlcnQgJiYgYXNzZXJ0KCB0cnVua1BhdGggIT09IHVuZGVmaW5lZCwgJ2J1aWxkTG9jYWwuZGVjYWZUcnVua1BhdGggaXMgdW5kZWZpbmVkJyApO1xuXG4gIC8vIENvbW1hbmQgb2J0YWluZWQgZnJvbSBydW5uaW5nIGluIEludGVsbGlKIElERUEgd2l0aCB0aGUgZ2l2ZW4gLnByb2plY3QuXG4gIGNvbnN0IGNtZCA9IFtcbiAgICAnLWNsYXNzcGF0aCcsXG5cbiAgICAvLyBCdWlsZCBjbGFzc2VzIHdpdGhcbiAgICAvLyB+L3BoZXQtc3ZuLXRydW5rLTIwMjAvYnVpbGQtdG9vbHMkIGNobW9kIHUreCAuL2NvbnRyaWIvYXBhY2hlLWFudC9iaW4vYW50XG4gICAgLy8gfi9waGV0LXN2bi10cnVuay0yMDIwL2J1aWxkLXRvb2xzJCAuL2J1aWxkLnNoXG4gICAgLy8gT3RoZXIgamFycyB0YWtlbiBmcm9tIC9waGV0LXN2bi10cnVuay0yMDIwL2J1aWxkLXRvb2xzL2J1aWxkLXRvb2xzLWJ1aWxkLnByb3BlcnRpZXNcbiAgICBgJHt0cnVua1BhdGh9L2J1aWxkLXRvb2xzL2FudF9vdXRwdXQvcGhldGJ1aWxkL2NsYXNzZXM6JHt0cnVua1BhdGh9L2J1aWxkLXRvb2xzL2NvbnRyaWIvcHJvZ3VhcmQvbGliL3Byb2d1YXJkLmphcjoke3RydW5rUGF0aH0vYnVpbGQtdG9vbHMvY29udHJpYi9jb21tb25zLWxhbmcvY29tbW9ucy1sYW5nLmphcjoke3RydW5rUGF0aH0vYnVpbGQtdG9vbHMvY29udHJpYi9qc2NoL2pzY2guamFyOiR7dHJ1bmtQYXRofS9idWlsZC10b29scy9jb250cmliL3NjYWxhL3NjYWxhLWNvbXBpbGVyLmphcjoke3RydW5rUGF0aH0vYnVpbGQtdG9vbHMvY29udHJpYi9zY2FsYS9zY2FsYS1saWJyYXJ5Lmphcjoke3RydW5rUGF0aH0vYnVpbGQtdG9vbHMvY29udHJpYi9hcGFjaGUtYW50L2xpYi9hbnQuamFyOiR7dHJ1bmtQYXRofS9idWlsZC10b29scy9jb250cmliL2FwYWNoZS1hbnQvbGliL2FudC1sYXVuY2hlci5qYXI6JHt0cnVua1BhdGh9L2J1aWxkLXRvb2xzL2NvbnRyaWIveXVpY29tcHJlc3Nvci95dWljb21wcmVzc29yLTIuNC40Lmphcjoke3RydW5rUGF0aH0vYnVpbGQtdG9vbHMvY29udHJpYi9qZ2l0L29yZy5lY2xpcHNlLmpnaXQtMS4xLjAuMjAxMTA5MTUxMTAwLXIuamFyOi9MaWJyYXJ5L0phdmEvSmF2YVZpcnR1YWxNYWNoaW5lcy9qZGsxLjcuMF84MC5qZGsvQ29udGVudHMvSG9tZS9saWIvdG9vbHMuamFyYCxcbiAgICAnZWR1LmNvbG9yYWRvLnBoZXQuYnVpbGR0b29scy5CdWlsZFNjcmlwdCcsXG4gICAgdHJ1bmtQYXRoLFxuICAgIHByb2plY3RcbiAgXTtcblxuICBjb25zdCBwcm9ncmFtID0gJy9MaWJyYXJ5L0phdmEvSmF2YVZpcnR1YWxNYWNoaW5lcy9qZGsxLjcuMF84MC5qZGsvQ29udGVudHMvSG9tZS9iaW4vamF2YSc7XG4gIGF3YWl0IGV4ZWN1dGUoIHByb2dyYW0sIGNtZCwgcHJvY2Vzcy5jd2QoKSApO1xuXG4gIGNvbnN0IGJ1aWxkRGlyID0gYC4uL2RlY2FmL3Byb2plY3RzLyR7cHJvamVjdH0vYnVpbGQvYDtcbiAgdHJ5IHtcbiAgICBmcy5ta2RpclN5bmMoIGJ1aWxkRGlyICk7XG4gIH1cbiAgY2F0Y2goIGUgKSB7XG4gICAgY29uc29sZS5sb2coICdwZXJoYXBzIHRoZSBidWlsZCBkaXJlY3RvcnkgZXhpc3RzJyApO1xuICB9XG5cbiAgY29uc3QgYWxsSmFyID0gYCR7Z2l0Um9vdH1kZWNhZi9wcm9qZWN0cy8ke3Byb2plY3R9L2J1aWxkLyR7cHJvamVjdH1fYWxsLmphcmA7XG4gIGF3YWl0IGNvcHlGaWxlKCBgJHt0cnVua1BhdGh9L3NpbXVsYXRpb25zLWphdmEvc2ltdWxhdGlvbnMvJHtwcm9qZWN0fS9kZXBsb3kvJHtwcm9qZWN0fV9hbGwuamFyYCwgYWxsSmFyICk7XG4gIGNvbnNvbGUubG9nKCAnY29waWVkJyApO1xuXG4gIGNvbnN0IGphdmFQcm9wZXJ0aWVzID0gZnMucmVhZEZpbGVTeW5jKCBgJHt0cnVua1BhdGh9L3NpbXVsYXRpb25zLWphdmEvc2ltdWxhdGlvbnMvJHtwcm9qZWN0fS8ke3Byb2plY3R9LWJ1aWxkLnByb3BlcnRpZXNgLCAndXRmLTgnICk7XG4gIGNvbnN0IGxpbmVzOiBzdHJpbmdbXSA9IGphdmFQcm9wZXJ0aWVzLnNwbGl0KCAnXFxuJyApO1xuICBjb25zdCBmbGF2b3JzID0gbGluZXMuZmlsdGVyKCBsaW5lID0+IGxpbmUuc3RhcnRzV2l0aCggJ3Byb2plY3QuZmxhdm9yJyApICkubWFwKCBsaW5lID0+IGxpbmUuc3BsaXQoICcuJyApWyAyIF0gKTtcbiAgbGV0IHVybCA9ICcnO1xuICBpZiAoIGZsYXZvcnMubGVuZ3RoID09PSAwICkge1xuICAgIHVybCA9IGAke3VybFJvb3R9L2RlY2FmL2h0bWw/cHJvamVjdD0ke3Byb2plY3R9YDtcbiAgfVxuICBlbHNlIHtcbiAgICB1cmwgPSBgJHt1cmxSb290fS9kZWNhZi9odG1sP3Byb2plY3Q9JHtwcm9qZWN0fSZzaW11bGF0aW9uPSR7Zmxhdm9yc1sgMCBdfWA7XG4gIH1cblxuICBjb25zb2xlLmxvZyggYGF3YWl0aW5nIHByZWxvYWRzIHZpYSBwdXBwZXRlZXIgYXQgdXJsID0gJHt1cmx9YCApO1xuICBjb25zdCBwcmVsb2FkUmVzb3VyY2VzID0gYXdhaXQgZ2V0UHJlbG9hZHMoIHVybCApO1xuICBjb25zb2xlLmxvZyggYFdlIGhhdmUgdGhlIHByZWxvYWRzIVxcbiR7cHJlbG9hZFJlc291cmNlc31gICk7XG5cbiAgY29uc3QgcGFja2FnZUZpbGVSZWxhdGl2ZSA9IGBwcm9qZWN0cy8ke3Byb2plY3R9L3BhY2thZ2UuanNvbmA7XG4gIGNvbnN0IHBhY2thZ2VGaWxlID0gYC4uL2RlY2FmLyR7cGFja2FnZUZpbGVSZWxhdGl2ZX1gO1xuICBjb25zdCBwYWNrYWdlT2JqZWN0ID0gYXdhaXQgbG9hZEpTT04oIHBhY2thZ2VGaWxlICk7XG4gIGNvbnN0IHByZXZpb3VzVmVyc2lvbiA9IFNpbVZlcnNpb24ucGFyc2UoIHBhY2thZ2VPYmplY3QudmVyc2lvbiApO1xuXG4gIC8vIEJ1bXAgdGhlIHZlcnNpb25cbiAgY29uc3QgdmVyc2lvbiA9IG5ldyBTaW1WZXJzaW9uKCBwcmV2aW91c1ZlcnNpb24ubWFqb3IsIHByZXZpb3VzVmVyc2lvbi5taW5vciwgcHJldmlvdXNWZXJzaW9uLm1haW50ZW5hbmNlLCB7XG4gICAgdGVzdFR5cGU6ICdkZXYnLFxuICAgIHRlc3ROdW1iZXI6IHByZXZpb3VzVmVyc2lvbi50ZXN0TnVtYmVyISArIDFcbiAgfSApO1xuICBwYWNrYWdlT2JqZWN0LnZlcnNpb24gPSB2ZXJzaW9uLnRvU3RyaW5nKCk7XG4gIGF3YWl0IHdyaXRlSlNPTiggcGFja2FnZUZpbGUsIHBhY2thZ2VPYmplY3QgKTtcblxuICBjb25zdCB2ZXJzaW9uU3RyaW5nID0gdmVyc2lvbi50b1N0cmluZygpO1xuXG4gIGxldCBodG1sID0gZnMucmVhZEZpbGVTeW5jKCAnLi4vZGVjYWYvaHRtbC9pbmRleC5odG1sJywgJ3V0Zi04JyApO1xuICBodG1sID0gaHRtbC5zcGxpdCggJ3t7UFJPSkVDVH19JyApLmpvaW4oIHByb2plY3QgKTtcbiAgaHRtbCA9IGh0bWwuc3BsaXQoICd7e1ZFUlNJT059fScgKS5qb2luKCB2ZXJzaW9uU3RyaW5nICk7XG4gIGh0bWwgPSBodG1sLnNwbGl0KCAne3tJU19CVUlMVH19JyApLmpvaW4oICd0cnVlJyApO1xuICBodG1sID0gaHRtbC5zcGxpdCggJ1xcJ3t7UFJFTE9BRF9SRVNPVVJDRVN9fVxcJycgKS5qb2luKCBwcmVsb2FkUmVzb3VyY2VzICk7XG5cbiAgZnMud3JpdGVGaWxlU3luYyggYCR7YnVpbGREaXJ9LyR7cHJvamVjdH0uaHRtbGAsIGh0bWwgKTtcblxuICBjb25zdCBzdHJpbmdGaWxlcyA9IGZzLnJlYWRkaXJTeW5jKCBgJHt0cnVua1BhdGh9L3NpbXVsYXRpb25zLWphdmEvc2ltdWxhdGlvbnMvJHtwcm9qZWN0fS9kYXRhLyR7cHJvamVjdH0vbG9jYWxpemF0aW9uYCApO1xuICBjb25zdCBsb2NhbGVzID0gc3RyaW5nRmlsZXMuZmlsdGVyKCBzdHJpbmdGaWxlID0+IHN0cmluZ0ZpbGUuaW5jbHVkZXMoICdfJyApICkubWFwKCBmaWxlID0+IGZpbGUuc3Vic3RyaW5nKCBmaWxlLmluZGV4T2YoICdfJyApICsgMSwgZmlsZS5sYXN0SW5kZXhPZiggJy4nICkgKSApO1xuICBjb25zb2xlLmxvZyggbG9jYWxlcy5qb2luKCAnXFxuJyApICk7XG5cbiAgZnMud3JpdGVGaWxlU3luYyggYCR7YnVpbGREaXJ9L2xvY2FsZXMudHh0YCwgbG9jYWxlcy5qb2luKCAnXFxuJyApICk7XG4gIGZzLndyaXRlRmlsZVN5bmMoIGAke2J1aWxkRGlyfS9zaW11bGF0aW9ucy50eHRgLCBmbGF2b3JzLmpvaW4oICdcXG4nICkgKTtcblxuICBhd2FpdCBjb3B5RmlsZSggJy4uL2RlY2FmL2h0bWwvc3R5bGUuY3NzJywgYCR7YnVpbGREaXJ9L3N0eWxlLmNzc2AgKTtcbiAgYXdhaXQgY29weUZpbGUoICcuLi9kZWNhZi9odG1sL3NwbGFzaC5naWYnLCBgJHtidWlsZERpcn0vc3BsYXNoLmdpZmAgKTtcblxuICAvLyBSZWN1cnNpdmVseSBjb3B5IC4uL2RlY2FmL2h0bWwvY2hlZXJwal8zLjAgdG8gJHtidWlsZERpcn0vY2hlZXJwal8zLjBcblxuICAvLyBGdW5jdGlvbiB0byBjcmVhdGUgYSBkaXJlY3RvcnkgaWYgaXQgZG9lc24ndCBleGlzdFxuICBmdW5jdGlvbiBlbnN1cmVEaXIoIGRpcjogc3RyaW5nICk6IHZvaWQge1xuICAgIHRyeSB7XG4gICAgICBmcy5ta2RpclN5bmMoIGRpciwgeyByZWN1cnNpdmU6IHRydWUgfSApO1xuICAgIH1cbiAgICBjYXRjaCggZXJyb3IgKSB7XG5cbiAgICAgIC8vIEB0cy1leHBlY3QtZXJyb3JcbiAgICAgIGlmICggZXJyb3IuY29kZSAhPT0gJ0VFWElTVCcgKSB7XG4gICAgICAgIHRocm93IGVycm9yO1xuICAgICAgfSAvLyBJZ25vcmUgdGhlIGVycm9yIGlmIHRoZSBkaXJlY3RvcnkgYWxyZWFkeSBleGlzdHNcbiAgICB9XG4gIH1cblxuICAvLyBSZWN1cnNpdmUgZnVuY3Rpb24gdG8gY29weSBhbGwgZmlsZXMgZnJvbSBvbmUgZGlyZWN0b3J5IHRvIGFub3RoZXJcbiAgYXN5bmMgZnVuY3Rpb24gY29weURpclJlY3Vyc2l2ZSggc291cmNlRGlyOiBzdHJpbmcsIHRhcmdldERpcjogc3RyaW5nICk6IFByb21pc2U8dm9pZD4ge1xuXG4gICAgZW5zdXJlRGlyKCB0YXJnZXREaXIgKTtcblxuICAgIGNvbnN0IGVudHJpZXMgPSBmcy5yZWFkZGlyU3luYyggc291cmNlRGlyLCB7IHdpdGhGaWxlVHlwZXM6IHRydWUgfSApO1xuXG4gICAgZm9yICggY29uc3QgZW50cnkgb2YgZW50cmllcyApIHtcbiAgICAgIGNvbnN0IHNvdXJjZVBhdGggPSBwYXRoLmpvaW4oIHNvdXJjZURpciwgZW50cnkubmFtZSApO1xuICAgICAgY29uc3QgdGFyZ2V0UGF0aCA9IHBhdGguam9pbiggdGFyZ2V0RGlyLCBlbnRyeS5uYW1lICk7XG5cbiAgICAgIGlmICggZW50cnkuaXNEaXJlY3RvcnkoKSApIHtcbiAgICAgICAgYXdhaXQgY29weURpclJlY3Vyc2l2ZSggc291cmNlUGF0aCwgdGFyZ2V0UGF0aCApO1xuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgIGF3YWl0IGNvcHlGaWxlKCBzb3VyY2VQYXRoLCB0YXJnZXRQYXRoICk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgY29uc3QgY2hlZXJwakRpciA9IGAke2J1aWxkRGlyfS9jaGVlcnBqXzMuMGA7XG4gIGVuc3VyZURpciggY2hlZXJwakRpciApO1xuXG4gIGF3YWl0IGNvcHlEaXJSZWN1cnNpdmUoICcuLi9kZWNhZi9odG1sL2NoZWVycGpfMy4wJywgY2hlZXJwakRpciApO1xuXG4gIGNvbnN0IGRlY2FmU0hBID0gYXdhaXQgZ2l0UmV2UGFyc2UoICdkZWNhZicsICdIRUFEJyApO1xuICBjb25zdCBjaGlwcGVyU0hBID0gYXdhaXQgZ2l0UmV2UGFyc2UoICdjaGlwcGVyJywgJ0hFQUQnICk7XG4gIGNvbnN0IHBlcmVubmlhbEFsaWFzU0hBID0gYXdhaXQgZ2l0UmV2UGFyc2UoICdwZXJlbm5pYWwtYWxpYXMnLCAnSEVBRCcgKTtcbiAgY29uc3QgcGVyZW5uaWFsU0hBID0gYXdhaXQgZ2l0UmV2UGFyc2UoICdwZXJlbm5pYWwnLCAnSEVBRCcgKTtcblxuICAvLyBQbGVhc2Ugc2V0IHRoZSBzdm4gY29tbWFuZCBsaW5lIHBhdGggYXMgYXBwcm9wcmlhdGUgZm9yIHlvdXIgc3lzdGVtXG4gIGNvbnN0IHN2bkluZm8gPSBhd2FpdCBleGVjdXRlKCAnL29wdC9ob21lYnJldy9iaW4vc3ZuJywgWyAnaW5mbycgXSwgYCR7dHJ1bmtQYXRofWAgKTtcblxuICBjb25zdCBkZXBlbmRlbmNpZXMgPSB7XG4gICAgdmVyc2lvbjogdmVyc2lvblN0cmluZyxcbiAgICBkZWNhZjogZGVjYWZTSEEsXG4gICAgbm90ZXM6ICdUaGUgZGVjYWYgc2hhIGlzIGZyb20gYmVmb3JlIHRoZSB2ZXJzaW9uIGNvbW1pdC4nLFxuICAgIGNoaXBwZXI6IGNoaXBwZXJTSEEsXG4gICAgJ3BlcmVubmlhbC1hbGlhcyc6IHBlcmVubmlhbEFsaWFzU0hBLFxuICAgIHBlcmVubmlhbDogcGVyZW5uaWFsU0hBLFxuICAgIHN2bkluZm86IHN2bkluZm9cbiAgfTtcbiAgY29uc29sZS5sb2coIGRlcGVuZGVuY2llcyApO1xuICBhd2FpdCB3cml0ZUpTT04oIGAke2J1aWxkRGlyfS9kZXBlbmRlbmNpZXMuanNvbmAsIGRlcGVuZGVuY2llcyApO1xuXG4gIGlmICggZmxhdm9ycy5sZW5ndGggPT09IDAgKSB7XG4gICAgY29uc29sZS5sb2coIGBidWlsZCBhbmQgcmVhZHkgZm9yIGxvY2FsIHRlc3Rpbmc6ICR7dXJsUm9vdH0vZGVjYWYvcHJvamVjdHMvJHtwcm9qZWN0fS9idWlsZC8ke3Byb2plY3R9Lmh0bWxgICk7XG4gIH1cbiAgZWxzZSB7XG4gICAgY29uc29sZS5sb2coICdidWlsZCBhbmQgcmVhZHkgZm9yIGxvY2FsIHRlc3Rpbmc6JyApO1xuICAgIGZsYXZvcnMuZm9yRWFjaCggZmxhdm9yID0+IHtcbiAgICAgIGNvbnNvbGUubG9nKCBgYnVpbGQgYW5kIHJlYWR5IGZvciBsb2NhbCB0ZXN0aW5nOiAke3VybFJvb3R9L2RlY2FmL3Byb2plY3RzLyR7cHJvamVjdH0vYnVpbGQvJHtwcm9qZWN0fS5odG1sP3NpbXVsYXRpb249JHtmbGF2b3J9YCApO1xuICAgIH0gKTtcbiAgfVxufSJdLCJuYW1lcyI6WyJmcyIsImV4ZWN1dGUiLCJTaW1WZXJzaW9uIiwiZ2V0UHJlbG9hZHMiLCJhc3NlcnQiLCJyZXF1aXJlIiwiY29weUZpbGUiLCJnaXRSZXZQYXJzZSIsImxvYWRKU09OIiwid3JpdGVKU09OIiwicGF0aCIsIkJVSUxEX0xPQ0FMX0ZJTEVOQU1FIiwicHJvY2VzcyIsImVudiIsIkhPTUUiLCJwcm9qZWN0IiwiYnVpbGRMb2NhbEpTT04iLCJKU09OIiwicGFyc2UiLCJyZWFkRmlsZVN5bmMiLCJlbmNvZGluZyIsImdpdFJvb3QiLCJ1cmxSb290IiwidHJ1bmtQYXRoIiwiZGVjYWZUcnVua1BhdGgiLCJ1bmRlZmluZWQiLCJjbWQiLCJwcm9ncmFtIiwiY3dkIiwiYnVpbGREaXIiLCJta2RpclN5bmMiLCJlIiwiY29uc29sZSIsImxvZyIsImFsbEphciIsImphdmFQcm9wZXJ0aWVzIiwibGluZXMiLCJzcGxpdCIsImZsYXZvcnMiLCJmaWx0ZXIiLCJsaW5lIiwic3RhcnRzV2l0aCIsIm1hcCIsInVybCIsImxlbmd0aCIsInByZWxvYWRSZXNvdXJjZXMiLCJwYWNrYWdlRmlsZVJlbGF0aXZlIiwicGFja2FnZUZpbGUiLCJwYWNrYWdlT2JqZWN0IiwicHJldmlvdXNWZXJzaW9uIiwidmVyc2lvbiIsIm1ham9yIiwibWlub3IiLCJtYWludGVuYW5jZSIsInRlc3RUeXBlIiwidGVzdE51bWJlciIsInRvU3RyaW5nIiwidmVyc2lvblN0cmluZyIsImh0bWwiLCJqb2luIiwid3JpdGVGaWxlU3luYyIsInN0cmluZ0ZpbGVzIiwicmVhZGRpclN5bmMiLCJsb2NhbGVzIiwic3RyaW5nRmlsZSIsImluY2x1ZGVzIiwiZmlsZSIsInN1YnN0cmluZyIsImluZGV4T2YiLCJsYXN0SW5kZXhPZiIsImVuc3VyZURpciIsImRpciIsInJlY3Vyc2l2ZSIsImVycm9yIiwiY29kZSIsImNvcHlEaXJSZWN1cnNpdmUiLCJzb3VyY2VEaXIiLCJ0YXJnZXREaXIiLCJlbnRyaWVzIiwid2l0aEZpbGVUeXBlcyIsImVudHJ5Iiwic291cmNlUGF0aCIsIm5hbWUiLCJ0YXJnZXRQYXRoIiwiaXNEaXJlY3RvcnkiLCJjaGVlcnBqRGlyIiwiZGVjYWZTSEEiLCJjaGlwcGVyU0hBIiwicGVyZW5uaWFsQWxpYXNTSEEiLCJwZXJlbm5pYWxTSEEiLCJzdm5JbmZvIiwiZGVwZW5kZW5jaWVzIiwiZGVjYWYiLCJub3RlcyIsImNoaXBwZXIiLCJwZXJlbm5pYWwiLCJmb3JFYWNoIiwiZmxhdm9yIl0sIm1hcHBpbmdzIjoiQUFBQSxzREFBc0Q7QUFFdEQ7Ozs7Q0FJQzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFFRCxPQUFPQSxRQUFRLEtBQUs7QUFDcEIsT0FBT0MsYUFBYSwwQkFBMEI7QUFDOUMsT0FBT0MsZ0JBQWdCLHVDQUF1QztBQUM5RCxPQUFPQyxpQkFBaUIsbUJBQW1CO0FBRTNDLE1BQU1DLFNBQVNDLFFBQVM7QUFDeEIsTUFBTUMsV0FBV0QsUUFBUztBQUMxQixNQUFNRSxjQUFjRixRQUFTO0FBQzdCLE1BQU1HLFdBQVdILFFBQVM7QUFDMUIsTUFBTUksWUFBWUosUUFBUztBQUMzQixNQUFNSyxPQUFPTCxRQUFTO0FBRXRCLFlBQVk7QUFDWixNQUFNTSx1QkFBdUIsR0FBR0MsUUFBUUMsR0FBRyxDQUFDQyxJQUFJLENBQUMsdUJBQXVCLENBQUM7QUFFekU7O0NBRUMsR0FDRCx3QkFBK0JDLE9BQWU7Ozs7V0FBL0Isb0JBQUEsVUFBZ0JBLE9BQWU7UUFFNUMsTUFBTUMsaUJBQWlCQyxLQUFLQyxLQUFLLENBQUVsQixHQUFHbUIsWUFBWSxDQUFFUixzQkFBc0I7WUFBRVMsVUFBVTtRQUFRO1FBQzlGLE1BQU1DLFVBQVVMLGVBQWVLLE9BQU87UUFDdEMsTUFBTUMsVUFBVU4sZUFBZU0sT0FBTztRQUN0QyxNQUFNQyxZQUFZUCxlQUFlUSxjQUFjO1FBRS9DcEIsVUFBVUEsT0FBUWlCLFlBQVlJLFdBQVc7UUFDekNyQixVQUFVQSxPQUFRa0IsWUFBWUcsV0FBVztRQUN6Q3JCLFVBQVVBLE9BQVFtQixjQUFjRSxXQUFXO1FBRTNDLDBFQUEwRTtRQUMxRSxNQUFNQyxNQUFNO1lBQ1Y7WUFFQSxx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