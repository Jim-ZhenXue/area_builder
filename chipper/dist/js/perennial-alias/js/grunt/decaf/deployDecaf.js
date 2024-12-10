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
const assert = require('assert');
const SimVersion = require('../../browser-and-node/SimVersion').default;
const buildLocal = require('../../common/buildLocal');
const devDirectoryExists = require('../../common/devDirectoryExists');
const devScp = require('../../common/devScp');
const devSsh = require('../../common/devSsh');
const getBranch = require('../../common/getBranch');
const getRemoteBranchSHAs = require('../../common/getRemoteBranchSHAs');
const gitIsClean = require('../../common/gitIsClean');
const gitRevParse = require('../../common/gitRevParse');
const loadJSON = require('../../common/loadJSON');
const vpnCheck = require('../../common/vpnCheck');
const grunt = require('grunt');
const fs = require('fs');
// constants
const BUILD_LOCAL_FILENAME = `${process.env.HOME}/.phet/build-local.json`;
/**
 * Deploys a dev version after incrementing the test version number.
 * @public
 *
 * @param {string} project
 * @param {boolean} dev
 * @param {boolean} production
 * @returns {Promise}
 */ module.exports = /*#__PURE__*/ _async_to_generator(function*(project, dev, production) {
    const buildLocalJSON = JSON.parse(fs.readFileSync(BUILD_LOCAL_FILENAME, {
        encoding: 'utf-8'
    }));
    const gitRoot = buildLocalJSON.gitRoot;
    const trunkPath = buildLocalJSON.decafTrunkPath;
    assert && assert(gitRoot !== undefined, 'buildLocal.gitRoot is undefined');
    assert && assert(trunkPath !== undefined, 'buildLocal.decafTrunkPath is undefined');
    const stringFiles = fs.readdirSync(`${trunkPath}/simulations-java/simulations/${project}/data/${project}/localization`);
    const locales = stringFiles.filter((stringFile)=>stringFile.indexOf('_') >= 0).map((file)=>file.substring(file.indexOf('_') + 1, file.lastIndexOf('.')));
    console.log(locales.join('\n'));
    // Output the flavors and locales
    const javaProperties = fs.readFileSync(`${trunkPath}/simulations-java/simulations/${project}/${project}-build.properties`, 'utf-8');
    // console.log(javaProperties);
    // like  project.flavor.moving-man.mainclass=edu.colorado.phet.movingman.MovingManApplication
    const flavorLines = javaProperties.split('\n').filter((line)=>line.startsWith('project.flavor'));
    const flavors = flavorLines.length > 0 ? flavorLines.map((line)=>line.split('.')[2]) : [
        `${project}`
    ];
    console.log(flavors.join('\n'));
    if (!(yield vpnCheck())) {
        grunt.fail.fatal('VPN or being on campus is required for this build. Ensure VPN is enabled, or that you have access to phet-server2.int.colorado.edu');
    }
    const currentBranch = yield getBranch('decaf');
    if (currentBranch !== 'main') {
        grunt.fail.fatal(`deployment should be on the branch main, not: ${currentBranch ? currentBranch : '(detached head)'}`);
    }
    const packageFileRelative = `projects/${project}/package.json`;
    const packageFile = `../decaf/${packageFileRelative}`;
    const packageObject = yield loadJSON(packageFile);
    const version = SimVersion.parse(packageObject.version);
    const isClean = yield gitIsClean('decaf');
    if (!isClean) {
        throw new Error(`Unclean status in ${project}, cannot deploy`);
    }
    const currentSHA = yield gitRevParse('decaf', 'HEAD');
    const latestSHA = (yield getRemoteBranchSHAs('decaf')).main;
    if (currentSHA !== latestSHA) {
        // See https://github.com/phetsims/chipper/issues/699
        grunt.fail.fatal(`Out of date with remote, please push or pull repo. Current SHA: ${currentSHA}, latest SHA: ${latestSHA}`);
    }
    const versionString = version.toString();
    // await gitAdd( 'decaf', packageFileRelative );
    // await gitCommit( 'decaf', `Bumping version to ${version.toString()}` );
    // await gitPush( 'decaf', 'main' );
    // Create (and fix permissions for) the main simulation directory, if it didn't already exist
    if (dev) {
        const simPath = buildLocal.decafDeployPath + project;
        const versionPath = `${simPath}/${versionString}`;
        const simPathExists = yield devDirectoryExists(simPath);
        const versionPathExists = yield devDirectoryExists(versionPath);
        if (versionPathExists) {
            grunt.fail.fatal(`Directory ${versionPath} already exists.  If you intend to replace the content then remove the directory manually from ${buildLocal.devDeployServer}.`);
        }
        if (!simPathExists) {
            yield devSsh(`mkdir -p "${simPath}" && echo "IndexOrderDefault Descending Date\n" > "${simPath}/.htaccess"`);
        }
        // Create the version-specific directory
        yield devSsh(`mkdir -p "${versionPath}"`);
        // Copy the build contents into the version-specific directory
        console.log(`../decaf/projects/${project}`);
        console.log(`${versionPath}/`);
        yield devScp(`../decaf/projects/${project}/build/${project}_all.jar`, `${versionPath}/`);
        yield devScp(`../decaf/projects/${project}/build/${project}_all.jar.js`, `${versionPath}/`);
        yield devScp(`../decaf/projects/${project}/build/${project}.html`, `${versionPath}/`);
        yield devScp(`../decaf/projects/${project}/build/splash.gif`, `${versionPath}/`);
        yield devScp(`../decaf/projects/${project}/build/style.css`, `${versionPath}/`);
        yield devScp(`../decaf/projects/${project}/build/dependencies.json`, `${versionPath}/`);
        yield devScp(`../decaf/projects/${project}/build/locales.txt`, `${versionPath}/`);
        yield devScp(`../decaf/projects/${project}/build/simulations.txt`, `${versionPath}/`);
        const versionURL = `https://phet-dev.colorado.edu/decaf/${project}/${versionString}`;
        console.log('DEPLOYED');
        if (!fs.existsSync(`${gitRoot}/decaf/build/log.txt`)) {
            fs.mkdirSync(`${gitRoot}/decaf/build`);
        }
        flavors.forEach((flavor)=>{
            const url = `${versionURL}/${project}.html?simulation=${flavor}`;
            grunt.log.writeln(url);
            fs.appendFileSync(`${gitRoot}/decaf/build/log.txt`, `${url}\n`);
        });
        if (flavors.length === 0) {
            const URL = `${versionURL}/${project}.html`;
            grunt.log.writeln(URL);
            fs.appendFileSync(`${gitRoot}/decaf/build/log.txt`, `${URL}\n`);
        }
    }
    console.log('FLAVORS');
    console.log(flavors.join(', '));
    console.log('LOCALES');
    console.log(locales.join(', '));
    if (production) {
        const productionServerURL = buildLocal.productionServerURL || 'https://phet.colorado.edu';
        // await devSsh( `mkdir -p "/data/web/static/phetsims/sims/cheerpj/${project}"` );
        const template = `cd /data/web/static/phetsims/sims/cheerpj/
sudo -u phet-admin mkdir -p ${project}
cd ${project}
sudo -u phet-admin scp -r bayes.colorado.edu:/data/web/htdocs/dev/decaf/${project}/${version} .

sudo chmod g+w *
printf "RewriteEngine on\\nRewriteBase /sims/cheerpj/${project}/\\nRewriteRule ^latest(.*) ${version}\\$1\\nHeader set Access-Control-Allow-Origin \\"*\\"\\n" > .htaccess

cd ${version}
sudo chmod g+w *

token=$(grep serverToken ~/.phet/build-local.json | sed -r 's/ *"serverToken": "(.*)",/\\1/') && \\
curl -u "token:$\{token}" '${productionServerURL}/services/deploy-cheerpj?project=${project}&version=${version}&locales=${locales.join(',')}&simulations=${flavors.join(',')}'
`;
        console.log('SERVER SCRIPT TO PROMOTE DEV VERSION TO PRODUCTION VERSION');
        console.log(template);
    }
});

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3BlcmVubmlhbC1hbGlhcy9qcy9ncnVudC9kZWNhZi9kZXBsb3lEZWNhZi5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNy0yMDE5LCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuLyoqXG4gKiBEZXBsb3lzIGEgZGVjYWYgc2ltdWxhdGlvbiBhZnRlciBpbmNyZW1lbnRpbmcgdGhlIHRlc3QgdmVyc2lvbiBudW1iZXIuICBUaGlzIGZpbGUgcG9ydGVkIGZyb20gZGV2LmpzXG4gKlxuICogQGF1dGhvciBTYW0gUmVpZCAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcbiAqL1xuXG5cbmNvbnN0IGFzc2VydCA9IHJlcXVpcmUoICdhc3NlcnQnICk7XG5jb25zdCBTaW1WZXJzaW9uID0gcmVxdWlyZSggJy4uLy4uL2Jyb3dzZXItYW5kLW5vZGUvU2ltVmVyc2lvbicgKS5kZWZhdWx0O1xuY29uc3QgYnVpbGRMb2NhbCA9IHJlcXVpcmUoICcuLi8uLi9jb21tb24vYnVpbGRMb2NhbCcgKTtcbmNvbnN0IGRldkRpcmVjdG9yeUV4aXN0cyA9IHJlcXVpcmUoICcuLi8uLi9jb21tb24vZGV2RGlyZWN0b3J5RXhpc3RzJyApO1xuY29uc3QgZGV2U2NwID0gcmVxdWlyZSggJy4uLy4uL2NvbW1vbi9kZXZTY3AnICk7XG5jb25zdCBkZXZTc2ggPSByZXF1aXJlKCAnLi4vLi4vY29tbW9uL2RldlNzaCcgKTtcbmNvbnN0IGdldEJyYW5jaCA9IHJlcXVpcmUoICcuLi8uLi9jb21tb24vZ2V0QnJhbmNoJyApO1xuY29uc3QgZ2V0UmVtb3RlQnJhbmNoU0hBcyA9IHJlcXVpcmUoICcuLi8uLi9jb21tb24vZ2V0UmVtb3RlQnJhbmNoU0hBcycgKTtcbmNvbnN0IGdpdElzQ2xlYW4gPSByZXF1aXJlKCAnLi4vLi4vY29tbW9uL2dpdElzQ2xlYW4nICk7XG5jb25zdCBnaXRSZXZQYXJzZSA9IHJlcXVpcmUoICcuLi8uLi9jb21tb24vZ2l0UmV2UGFyc2UnICk7XG5jb25zdCBsb2FkSlNPTiA9IHJlcXVpcmUoICcuLi8uLi9jb21tb24vbG9hZEpTT04nICk7XG5jb25zdCB2cG5DaGVjayA9IHJlcXVpcmUoICcuLi8uLi9jb21tb24vdnBuQ2hlY2snICk7XG5jb25zdCBncnVudCA9IHJlcXVpcmUoICdncnVudCcgKTtcbmNvbnN0IGZzID0gcmVxdWlyZSggJ2ZzJyApO1xuXG4vLyBjb25zdGFudHNcbmNvbnN0IEJVSUxEX0xPQ0FMX0ZJTEVOQU1FID0gYCR7cHJvY2Vzcy5lbnYuSE9NRX0vLnBoZXQvYnVpbGQtbG9jYWwuanNvbmA7XG5cbi8qKlxuICogRGVwbG95cyBhIGRldiB2ZXJzaW9uIGFmdGVyIGluY3JlbWVudGluZyB0aGUgdGVzdCB2ZXJzaW9uIG51bWJlci5cbiAqIEBwdWJsaWNcbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gcHJvamVjdFxuICogQHBhcmFtIHtib29sZWFufSBkZXZcbiAqIEBwYXJhbSB7Ym9vbGVhbn0gcHJvZHVjdGlvblxuICogQHJldHVybnMge1Byb21pc2V9XG4gKi9cbm1vZHVsZS5leHBvcnRzID0gYXN5bmMgZnVuY3Rpb24oIHByb2plY3QsIGRldiwgcHJvZHVjdGlvbiApIHtcblxuICBjb25zdCBidWlsZExvY2FsSlNPTiA9IEpTT04ucGFyc2UoIGZzLnJlYWRGaWxlU3luYyggQlVJTERfTE9DQUxfRklMRU5BTUUsIHsgZW5jb2Rpbmc6ICd1dGYtOCcgfSApICk7XG4gIGNvbnN0IGdpdFJvb3QgPSBidWlsZExvY2FsSlNPTi5naXRSb290O1xuICBjb25zdCB0cnVua1BhdGggPSBidWlsZExvY2FsSlNPTi5kZWNhZlRydW5rUGF0aDtcblxuICBhc3NlcnQgJiYgYXNzZXJ0KCBnaXRSb290ICE9PSB1bmRlZmluZWQsICdidWlsZExvY2FsLmdpdFJvb3QgaXMgdW5kZWZpbmVkJyApO1xuICBhc3NlcnQgJiYgYXNzZXJ0KCB0cnVua1BhdGggIT09IHVuZGVmaW5lZCwgJ2J1aWxkTG9jYWwuZGVjYWZUcnVua1BhdGggaXMgdW5kZWZpbmVkJyApO1xuXG4gIGNvbnN0IHN0cmluZ0ZpbGVzID0gZnMucmVhZGRpclN5bmMoIGAke3RydW5rUGF0aH0vc2ltdWxhdGlvbnMtamF2YS9zaW11bGF0aW9ucy8ke3Byb2plY3R9L2RhdGEvJHtwcm9qZWN0fS9sb2NhbGl6YXRpb25gICk7XG4gIGNvbnN0IGxvY2FsZXMgPSBzdHJpbmdGaWxlcy5maWx0ZXIoIHN0cmluZ0ZpbGUgPT4gc3RyaW5nRmlsZS5pbmRleE9mKCAnXycgKSA+PSAwICkubWFwKCBmaWxlID0+IGZpbGUuc3Vic3RyaW5nKCBmaWxlLmluZGV4T2YoICdfJyApICsgMSwgZmlsZS5sYXN0SW5kZXhPZiggJy4nICkgKSApO1xuICBjb25zb2xlLmxvZyggbG9jYWxlcy5qb2luKCAnXFxuJyApICk7XG5cbiAgLy8gT3V0cHV0IHRoZSBmbGF2b3JzIGFuZCBsb2NhbGVzXG4gIGNvbnN0IGphdmFQcm9wZXJ0aWVzID0gZnMucmVhZEZpbGVTeW5jKCBgJHt0cnVua1BhdGh9L3NpbXVsYXRpb25zLWphdmEvc2ltdWxhdGlvbnMvJHtwcm9qZWN0fS8ke3Byb2plY3R9LWJ1aWxkLnByb3BlcnRpZXNgLCAndXRmLTgnICk7XG4gIC8vIGNvbnNvbGUubG9nKGphdmFQcm9wZXJ0aWVzKTtcblxuLy8gbGlrZSAgcHJvamVjdC5mbGF2b3IubW92aW5nLW1hbi5tYWluY2xhc3M9ZWR1LmNvbG9yYWRvLnBoZXQubW92aW5nbWFuLk1vdmluZ01hbkFwcGxpY2F0aW9uXG5cbiAgY29uc3QgZmxhdm9yTGluZXMgPSBqYXZhUHJvcGVydGllcy5zcGxpdCggJ1xcbicgKS5maWx0ZXIoIGxpbmUgPT4gbGluZS5zdGFydHNXaXRoKCAncHJvamVjdC5mbGF2b3InICkgKTtcbiAgY29uc3QgZmxhdm9ycyA9IGZsYXZvckxpbmVzLmxlbmd0aCA+IDAgPyBmbGF2b3JMaW5lcy5tYXAoIGxpbmUgPT4gbGluZS5zcGxpdCggJy4nIClbIDIgXSApIDogWyBgJHtwcm9qZWN0fWAgXTtcbiAgY29uc29sZS5sb2coIGZsYXZvcnMuam9pbiggJ1xcbicgKSApO1xuXG4gIGlmICggISggYXdhaXQgdnBuQ2hlY2soKSApICkge1xuICAgIGdydW50LmZhaWwuZmF0YWwoICdWUE4gb3IgYmVpbmcgb24gY2FtcHVzIGlzIHJlcXVpcmVkIGZvciB0aGlzIGJ1aWxkLiBFbnN1cmUgVlBOIGlzIGVuYWJsZWQsIG9yIHRoYXQgeW91IGhhdmUgYWNjZXNzIHRvIHBoZXQtc2VydmVyMi5pbnQuY29sb3JhZG8uZWR1JyApO1xuICB9XG5cbiAgY29uc3QgY3VycmVudEJyYW5jaCA9IGF3YWl0IGdldEJyYW5jaCggJ2RlY2FmJyApO1xuICBpZiAoIGN1cnJlbnRCcmFuY2ggIT09ICdtYWluJyApIHtcbiAgICBncnVudC5mYWlsLmZhdGFsKCBgZGVwbG95bWVudCBzaG91bGQgYmUgb24gdGhlIGJyYW5jaCBtYWluLCBub3Q6ICR7Y3VycmVudEJyYW5jaCA/IGN1cnJlbnRCcmFuY2ggOiAnKGRldGFjaGVkIGhlYWQpJ31gICk7XG4gIH1cblxuICBjb25zdCBwYWNrYWdlRmlsZVJlbGF0aXZlID0gYHByb2plY3RzLyR7cHJvamVjdH0vcGFja2FnZS5qc29uYDtcbiAgY29uc3QgcGFja2FnZUZpbGUgPSBgLi4vZGVjYWYvJHtwYWNrYWdlRmlsZVJlbGF0aXZlfWA7XG4gIGNvbnN0IHBhY2thZ2VPYmplY3QgPSBhd2FpdCBsb2FkSlNPTiggcGFja2FnZUZpbGUgKTtcbiAgY29uc3QgdmVyc2lvbiA9IFNpbVZlcnNpb24ucGFyc2UoIHBhY2thZ2VPYmplY3QudmVyc2lvbiApO1xuXG4gIGNvbnN0IGlzQ2xlYW4gPSBhd2FpdCBnaXRJc0NsZWFuKCAnZGVjYWYnICk7XG4gIGlmICggIWlzQ2xlYW4gKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCBgVW5jbGVhbiBzdGF0dXMgaW4gJHtwcm9qZWN0fSwgY2Fubm90IGRlcGxveWAgKTtcbiAgfVxuXG4gIGNvbnN0IGN1cnJlbnRTSEEgPSBhd2FpdCBnaXRSZXZQYXJzZSggJ2RlY2FmJywgJ0hFQUQnICk7XG5cbiAgY29uc3QgbGF0ZXN0U0hBID0gKCBhd2FpdCBnZXRSZW1vdGVCcmFuY2hTSEFzKCAnZGVjYWYnICkgKS5tYWluO1xuICBpZiAoIGN1cnJlbnRTSEEgIT09IGxhdGVzdFNIQSApIHtcbiAgICAvLyBTZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2NoaXBwZXIvaXNzdWVzLzY5OVxuICAgIGdydW50LmZhaWwuZmF0YWwoIGBPdXQgb2YgZGF0ZSB3aXRoIHJlbW90ZSwgcGxlYXNlIHB1c2ggb3IgcHVsbCByZXBvLiBDdXJyZW50IFNIQTogJHtjdXJyZW50U0hBfSwgbGF0ZXN0IFNIQTogJHtsYXRlc3RTSEF9YCApO1xuICB9XG5cbiAgY29uc3QgdmVyc2lvblN0cmluZyA9IHZlcnNpb24udG9TdHJpbmcoKTtcblxuXG4gIC8vIGF3YWl0IGdpdEFkZCggJ2RlY2FmJywgcGFja2FnZUZpbGVSZWxhdGl2ZSApO1xuICAvLyBhd2FpdCBnaXRDb21taXQoICdkZWNhZicsIGBCdW1waW5nIHZlcnNpb24gdG8gJHt2ZXJzaW9uLnRvU3RyaW5nKCl9YCApO1xuICAvLyBhd2FpdCBnaXRQdXNoKCAnZGVjYWYnLCAnbWFpbicgKTtcblxuICAvLyBDcmVhdGUgKGFuZCBmaXggcGVybWlzc2lvbnMgZm9yKSB0aGUgbWFpbiBzaW11bGF0aW9uIGRpcmVjdG9yeSwgaWYgaXQgZGlkbid0IGFscmVhZHkgZXhpc3RcbiAgaWYgKCBkZXYgKSB7XG5cbiAgICBjb25zdCBzaW1QYXRoID0gYnVpbGRMb2NhbC5kZWNhZkRlcGxveVBhdGggKyBwcm9qZWN0O1xuICAgIGNvbnN0IHZlcnNpb25QYXRoID0gYCR7c2ltUGF0aH0vJHt2ZXJzaW9uU3RyaW5nfWA7XG5cbiAgICBjb25zdCBzaW1QYXRoRXhpc3RzID0gYXdhaXQgZGV2RGlyZWN0b3J5RXhpc3RzKCBzaW1QYXRoICk7XG4gICAgY29uc3QgdmVyc2lvblBhdGhFeGlzdHMgPSBhd2FpdCBkZXZEaXJlY3RvcnlFeGlzdHMoIHZlcnNpb25QYXRoICk7XG5cbiAgICBpZiAoIHZlcnNpb25QYXRoRXhpc3RzICkge1xuICAgICAgZ3J1bnQuZmFpbC5mYXRhbCggYERpcmVjdG9yeSAke3ZlcnNpb25QYXRofSBhbHJlYWR5IGV4aXN0cy4gIElmIHlvdSBpbnRlbmQgdG8gcmVwbGFjZSB0aGUgY29udGVudCB0aGVuIHJlbW92ZSB0aGUgZGlyZWN0b3J5IG1hbnVhbGx5IGZyb20gJHtidWlsZExvY2FsLmRldkRlcGxveVNlcnZlcn0uYCApO1xuICAgIH1cblxuICAgIGlmICggIXNpbVBhdGhFeGlzdHMgKSB7XG4gICAgICBhd2FpdCBkZXZTc2goIGBta2RpciAtcCBcIiR7c2ltUGF0aH1cIiAmJiBlY2hvIFwiSW5kZXhPcmRlckRlZmF1bHQgRGVzY2VuZGluZyBEYXRlXFxuXCIgPiBcIiR7c2ltUGF0aH0vLmh0YWNjZXNzXCJgICk7XG4gICAgfVxuXG4gICAgLy8gQ3JlYXRlIHRoZSB2ZXJzaW9uLXNwZWNpZmljIGRpcmVjdG9yeVxuICAgIGF3YWl0IGRldlNzaCggYG1rZGlyIC1wIFwiJHt2ZXJzaW9uUGF0aH1cImAgKTtcblxuICAgIC8vIENvcHkgdGhlIGJ1aWxkIGNvbnRlbnRzIGludG8gdGhlIHZlcnNpb24tc3BlY2lmaWMgZGlyZWN0b3J5XG4gICAgY29uc29sZS5sb2coIGAuLi9kZWNhZi9wcm9qZWN0cy8ke3Byb2plY3R9YCApO1xuICAgIGNvbnNvbGUubG9nKCBgJHt2ZXJzaW9uUGF0aH0vYCApO1xuICAgIGF3YWl0IGRldlNjcCggYC4uL2RlY2FmL3Byb2plY3RzLyR7cHJvamVjdH0vYnVpbGQvJHtwcm9qZWN0fV9hbGwuamFyYCwgYCR7dmVyc2lvblBhdGh9L2AgKTtcbiAgICBhd2FpdCBkZXZTY3AoIGAuLi9kZWNhZi9wcm9qZWN0cy8ke3Byb2plY3R9L2J1aWxkLyR7cHJvamVjdH1fYWxsLmphci5qc2AsIGAke3ZlcnNpb25QYXRofS9gICk7XG4gICAgYXdhaXQgZGV2U2NwKCBgLi4vZGVjYWYvcHJvamVjdHMvJHtwcm9qZWN0fS9idWlsZC8ke3Byb2plY3R9Lmh0bWxgLCBgJHt2ZXJzaW9uUGF0aH0vYCApO1xuICAgIGF3YWl0IGRldlNjcCggYC4uL2RlY2FmL3Byb2plY3RzLyR7cHJvamVjdH0vYnVpbGQvc3BsYXNoLmdpZmAsIGAke3ZlcnNpb25QYXRofS9gICk7XG4gICAgYXdhaXQgZGV2U2NwKCBgLi4vZGVjYWYvcHJvamVjdHMvJHtwcm9qZWN0fS9idWlsZC9zdHlsZS5jc3NgLCBgJHt2ZXJzaW9uUGF0aH0vYCApO1xuICAgIGF3YWl0IGRldlNjcCggYC4uL2RlY2FmL3Byb2plY3RzLyR7cHJvamVjdH0vYnVpbGQvZGVwZW5kZW5jaWVzLmpzb25gLCBgJHt2ZXJzaW9uUGF0aH0vYCApO1xuICAgIGF3YWl0IGRldlNjcCggYC4uL2RlY2FmL3Byb2plY3RzLyR7cHJvamVjdH0vYnVpbGQvbG9jYWxlcy50eHRgLCBgJHt2ZXJzaW9uUGF0aH0vYCApO1xuICAgIGF3YWl0IGRldlNjcCggYC4uL2RlY2FmL3Byb2plY3RzLyR7cHJvamVjdH0vYnVpbGQvc2ltdWxhdGlvbnMudHh0YCwgYCR7dmVyc2lvblBhdGh9L2AgKTtcblxuICAgIGNvbnN0IHZlcnNpb25VUkwgPSBgaHR0cHM6Ly9waGV0LWRldi5jb2xvcmFkby5lZHUvZGVjYWYvJHtwcm9qZWN0fS8ke3ZlcnNpb25TdHJpbmd9YDtcbiAgICBjb25zb2xlLmxvZyggJ0RFUExPWUVEJyApO1xuXG4gICAgaWYgKCAhZnMuZXhpc3RzU3luYyggYCR7Z2l0Um9vdH0vZGVjYWYvYnVpbGQvbG9nLnR4dGAgKSApIHtcbiAgICAgIGZzLm1rZGlyU3luYyggYCR7Z2l0Um9vdH0vZGVjYWYvYnVpbGRgICk7XG4gICAgfVxuXG4gICAgZmxhdm9ycy5mb3JFYWNoKCBmbGF2b3IgPT4ge1xuICAgICAgY29uc3QgdXJsID0gYCR7dmVyc2lvblVSTH0vJHtwcm9qZWN0fS5odG1sP3NpbXVsYXRpb249JHtmbGF2b3J9YDtcbiAgICAgIGdydW50LmxvZy53cml0ZWxuKCB1cmwgKTtcbiAgICAgIGZzLmFwcGVuZEZpbGVTeW5jKCBgJHtnaXRSb290fS9kZWNhZi9idWlsZC9sb2cudHh0YCwgYCR7dXJsfVxcbmAgKTtcbiAgICB9ICk7XG5cbiAgICBpZiAoIGZsYXZvcnMubGVuZ3RoID09PSAwICkge1xuICAgICAgY29uc3QgVVJMID0gYCR7dmVyc2lvblVSTH0vJHtwcm9qZWN0fS5odG1sYDtcbiAgICAgIGdydW50LmxvZy53cml0ZWxuKCBVUkwgKTtcbiAgICAgIGZzLmFwcGVuZEZpbGVTeW5jKCBgJHtnaXRSb290fS9kZWNhZi9idWlsZC9sb2cudHh0YCwgYCR7VVJMfVxcbmAgKTtcbiAgICB9XG4gIH1cblxuICBjb25zb2xlLmxvZyggJ0ZMQVZPUlMnICk7XG4gIGNvbnNvbGUubG9nKCBmbGF2b3JzLmpvaW4oICcsICcgKSApO1xuXG4gIGNvbnNvbGUubG9nKCAnTE9DQUxFUycgKTtcbiAgY29uc29sZS5sb2coIGxvY2FsZXMuam9pbiggJywgJyApICk7XG5cbiAgaWYgKCBwcm9kdWN0aW9uICkge1xuICAgIGNvbnN0IHByb2R1Y3Rpb25TZXJ2ZXJVUkwgPSBidWlsZExvY2FsLnByb2R1Y3Rpb25TZXJ2ZXJVUkwgfHwgJ2h0dHBzOi8vcGhldC5jb2xvcmFkby5lZHUnO1xuICAgIC8vIGF3YWl0IGRldlNzaCggYG1rZGlyIC1wIFwiL2RhdGEvd2ViL3N0YXRpYy9waGV0c2ltcy9zaW1zL2NoZWVycGovJHtwcm9qZWN0fVwiYCApO1xuICAgIGNvbnN0IHRlbXBsYXRlID0gYGNkIC9kYXRhL3dlYi9zdGF0aWMvcGhldHNpbXMvc2ltcy9jaGVlcnBqL1xuc3VkbyAtdSBwaGV0LWFkbWluIG1rZGlyIC1wICR7cHJvamVjdH1cbmNkICR7cHJvamVjdH1cbnN1ZG8gLXUgcGhldC1hZG1pbiBzY3AgLXIgYmF5ZXMuY29sb3JhZG8uZWR1Oi9kYXRhL3dlYi9odGRvY3MvZGV2L2RlY2FmLyR7cHJvamVjdH0vJHt2ZXJzaW9ufSAuXG5cbnN1ZG8gY2htb2QgZyt3ICpcbnByaW50ZiBcIlJld3JpdGVFbmdpbmUgb25cXFxcblJld3JpdGVCYXNlIC9zaW1zL2NoZWVycGovJHtwcm9qZWN0fS9cXFxcblJld3JpdGVSdWxlIF5sYXRlc3QoLiopICR7dmVyc2lvbn1cXFxcJDFcXFxcbkhlYWRlciBzZXQgQWNjZXNzLUNvbnRyb2wtQWxsb3ctT3JpZ2luIFxcXFxcIipcXFxcXCJcXFxcblwiID4gLmh0YWNjZXNzXG5cbmNkICR7dmVyc2lvbn1cbnN1ZG8gY2htb2QgZyt3ICpcblxudG9rZW49JChncmVwIHNlcnZlclRva2VuIH4vLnBoZXQvYnVpbGQtbG9jYWwuanNvbiB8IHNlZCAtciAncy8gKlwic2VydmVyVG9rZW5cIjogXCIoLiopXCIsL1xcXFwxLycpICYmIFxcXFxcbmN1cmwgLXUgXCJ0b2tlbjokXFx7dG9rZW59XCIgJyR7cHJvZHVjdGlvblNlcnZlclVSTH0vc2VydmljZXMvZGVwbG95LWNoZWVycGo/cHJvamVjdD0ke3Byb2plY3R9JnZlcnNpb249JHt2ZXJzaW9ufSZsb2NhbGVzPSR7bG9jYWxlcy5qb2luKCAnLCcgKX0mc2ltdWxhdGlvbnM9JHtmbGF2b3JzLmpvaW4oICcsJyApfSdcbmA7XG4gICAgY29uc29sZS5sb2coICdTRVJWRVIgU0NSSVBUIFRPIFBST01PVEUgREVWIFZFUlNJT04gVE8gUFJPRFVDVElPTiBWRVJTSU9OJyApO1xuICAgIGNvbnNvbGUubG9nKCB0ZW1wbGF0ZSApO1xuICB9XG59OyJdLCJuYW1lcyI6WyJhc3NlcnQiLCJyZXF1aXJlIiwiU2ltVmVyc2lvbiIsImRlZmF1bHQiLCJidWlsZExvY2FsIiwiZGV2RGlyZWN0b3J5RXhpc3RzIiwiZGV2U2NwIiwiZGV2U3NoIiwiZ2V0QnJhbmNoIiwiZ2V0UmVtb3RlQnJhbmNoU0hBcyIsImdpdElzQ2xlYW4iLCJnaXRSZXZQYXJzZSIsImxvYWRKU09OIiwidnBuQ2hlY2siLCJncnVudCIsImZzIiwiQlVJTERfTE9DQUxfRklMRU5BTUUiLCJwcm9jZXNzIiwiZW52IiwiSE9NRSIsIm1vZHVsZSIsImV4cG9ydHMiLCJwcm9qZWN0IiwiZGV2IiwicHJvZHVjdGlvbiIsImJ1aWxkTG9jYWxKU09OIiwiSlNPTiIsInBhcnNlIiwicmVhZEZpbGVTeW5jIiwiZW5jb2RpbmciLCJnaXRSb290IiwidHJ1bmtQYXRoIiwiZGVjYWZUcnVua1BhdGgiLCJ1bmRlZmluZWQiLCJzdHJpbmdGaWxlcyIsInJlYWRkaXJTeW5jIiwibG9jYWxlcyIsImZpbHRlciIsInN0cmluZ0ZpbGUiLCJpbmRleE9mIiwibWFwIiwiZmlsZSIsInN1YnN0cmluZyIsImxhc3RJbmRleE9mIiwiY29uc29sZSIsImxvZyIsImpvaW4iLCJqYXZhUHJvcGVydGllcyIsImZsYXZvckxpbmVzIiwic3BsaXQiLCJsaW5lIiwic3RhcnRzV2l0aCIsImZsYXZvcnMiLCJsZW5ndGgiLCJmYWlsIiwiZmF0YWwiLCJjdXJyZW50QnJhbmNoIiwicGFja2FnZUZpbGVSZWxhdGl2ZSIsInBhY2thZ2VGaWxlIiwicGFja2FnZU9iamVjdCIsInZlcnNpb24iLCJpc0NsZWFuIiwiRXJyb3IiLCJjdXJyZW50U0hBIiwibGF0ZXN0U0hBIiwibWFpbiIsInZlcnNpb25TdHJpbmciLCJ0b1N0cmluZyIsInNpbVBhdGgiLCJkZWNhZkRlcGxveVBhdGgiLCJ2ZXJzaW9uUGF0aCIsInNpbVBhdGhFeGlzdHMiLCJ2ZXJzaW9uUGF0aEV4aXN0cyIsImRldkRlcGxveVNlcnZlciIsInZlcnNpb25VUkwiLCJleGlzdHNTeW5jIiwibWtkaXJTeW5jIiwiZm9yRWFjaCIsImZsYXZvciIsInVybCIsIndyaXRlbG4iLCJhcHBlbmRGaWxlU3luYyIsIlVSTCIsInByb2R1Y3Rpb25TZXJ2ZXJVUkwiLCJ0ZW1wbGF0ZSJdLCJtYXBwaW5ncyI6IkFBQUEsc0RBQXNEO0FBRXREOzs7O0NBSUM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBR0QsTUFBTUEsU0FBU0MsUUFBUztBQUN4QixNQUFNQyxhQUFhRCxRQUFTLHFDQUFzQ0UsT0FBTztBQUN6RSxNQUFNQyxhQUFhSCxRQUFT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