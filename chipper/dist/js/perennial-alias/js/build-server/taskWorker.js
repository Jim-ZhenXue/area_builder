// Copyright 2017-2019, University of Colorado Boulder
// @author Matt Pennington (PhET Interactive Simulations)
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
const constants = require('./constants');
const createTranslationsXML = require('./createTranslationsXML');
const devDeploy = require('./devDeploy');
const execute = require('../common/execute').default;
const fs = require('fs');
const getLocales = require('./getLocales');
const notifyServer = require('./notifyServer');
const rsync = require('rsync');
const SimVersion = require('../browser-and-node/SimVersion').default;
const winston = require('winston');
const writePhetHtaccess = require('./writePhetHtaccess');
const writePhetioHtaccess = require('../common/writePhetioHtaccess');
const deployImages = require('./deployImages');
const persistentQueue = require('./persistentQueue');
const ReleaseBranch = require('../common/ReleaseBranch');
const loadJSON = require('../common/loadJSON');
/**
 * Abort build with err
 * @param {String|Error} err - error logged and sent via email
 */ const abortBuild = /*#__PURE__*/ _async_to_generator(function*(err) {
    winston.log('error', `BUILD ABORTED! ${err}`);
    err.stack && winston.log('error', err.stack);
    throw new Error(`Build aborted, ${err}`);
});
/**
 * Clean up after deploy. Remove tmp dir.
 */ const afterDeploy = /*#__PURE__*/ _async_to_generator(function*(buildDir) {
    try {
        yield execute('rm', [
            '-rf',
            buildDir
        ], '.');
    } catch (err) {
        yield abortBuild(err);
    }
});
function runTask(options) {
    return _runTask.apply(this, arguments);
}
function _runTask() {
    _runTask = /**
 * taskQueue ensures that only one build/deploy process will be happening at the same time.  The main build/deploy logic is here.
 *
 * @property {JSON} repos
 * @property {String} api
 * @property {String} locales - comma separated list of locale codes
 * @property {String} simName - lower case simulation name used for creating files/directories
 * @property {String} version - sim version identifier string
 * @property {String} servers - deployment targets, subset of [ 'dev', 'production' ]
 * @property {string[]} brands - deployment brands
 * @property {String} email - used for sending notifications about success/failure
 * @property {String} translatorId - rosetta user id for adding translators to the website
 * @property {winston} winston - logger
 * @param options
 */ _async_to_generator(function*(options) {
        persistentQueue.startTask(options);
        if (options.deployImages) {
            try {
                yield deployImages(options);
                return;
            } catch (e) {
                winston.error(e);
                winston.error('Deploy images failed. See previous logs for details.');
                throw e;
            }
        }
        try {
            //-------------------------------------------------------------------------------------
            // Parse and validate parameters
            //-------------------------------------------------------------------------------------
            const api = options.api;
            const dependencies = options.repos;
            let locales = options.locales;
            const simName = options.simName;
            let version = options.version;
            const email = options.email;
            const brands = options.brands;
            const servers = options.servers;
            const userId = options.userId;
            const branch = options.branch || version.match(/^(\d+\.\d+)/)[0];
            if (userId) {
                winston.log('info', `setting userId = ${userId}`);
            }
            if (branch === null) {
                yield abortBuild('Branch must be provided.');
            }
            // validate simName
            const simNameRegex = /^[a-z-]+$/;
            if (!simNameRegex.test(simName)) {
                yield abortBuild(`invalid simName ${simName}`);
            }
            // make sure the repos passed in validates
            for(const key in dependencies){
                if (dependencies.hasOwnProperty(key)) {
                    winston.log('info', `Validating repo: ${key}`);
                    // make sure all keys in dependencies object are valid sim names
                    if (!simNameRegex.test(key)) {
                        yield abortBuild(`invalid simName in dependencies: ${simName}`);
                    }
                    const value = dependencies[key];
                    if (key === 'comment') {
                        if (typeof value !== 'string') {
                            yield abortBuild('invalid comment in dependencies: should be a string');
                        }
                    } else if (value instanceof Object && value.hasOwnProperty('sha')) {
                        if (!/^[a-f0-9]{40}$/.test(value.sha)) {
                            yield abortBuild(`invalid sha in dependencies. key: ${key} value: ${value} sha: ${value.sha}`);
                        }
                    } else {
                        yield abortBuild(`invalid item in dependencies. key: ${key} value: ${value}`);
                    }
                }
            }
            // Infer brand from version string and keep unstripped version for phet-io
            const originalVersion = version;
            if (api === '1.0') {
                // validate version and strip suffixes since just the numbers are used in the directory name on dev and production servers
                const versionMatch = version.match(/^(\d+\.\d+\.\d+)(?:-.*)?$/);
                if (versionMatch && versionMatch.length === 2) {
                    if (servers.includes('dev')) {
                        // if deploying an rc version use the -rc.[number] suffix
                        version = versionMatch[0];
                    } else {
                        // otherwise strip any suffix
                        version = versionMatch[1];
                    }
                    winston.log('info', `detecting version number: ${version}`);
                } else {
                    yield abortBuild(`invalid version number: ${version}`);
                }
            }
            if (api === '1.0') {
                locales = yield getLocales(locales, simName);
            }
            // Git pull, git checkout, npm prune & update, etc. in parallel directory
            const releaseBranch = new ReleaseBranch(simName, branch, brands, true);
            yield releaseBranch.updateCheckout(dependencies);
            const chipperVersion = releaseBranch.getChipperVersion();
            winston.debug(`Chipper version detected: ${chipperVersion.toString()}`);
            if (!(chipperVersion.major === 2 && chipperVersion.minor === 0) && !(chipperVersion.major === 0 && chipperVersion.minor === 0)) {
                yield abortBuild('Unsupported chipper version');
            }
            if (chipperVersion.major !== 1) {
                const checkoutDirectory = ReleaseBranch.getCheckoutDirectory(simName, branch);
                const packageJSON = JSON.parse(fs.readFileSync(`${checkoutDirectory}/${simName}/package.json`, 'utf8'));
                const packageVersion = packageJSON.version;
                if (packageVersion !== version) {
                    yield abortBuild(`Version mismatch between package.json and build request: ${packageVersion} vs ${version}`);
                }
            }
            const localesArray = typeof locales === 'string' ? locales.split(',') : locales;
            // if this build request comes from rosetta it will have a userId field and only one locale
            const isTranslationRequest = userId && localesArray.length === 1 && localesArray[0] !== '*';
            yield releaseBranch.build({
                clean: false,
                locales: isTranslationRequest ? '*' : locales,
                buildForServer: true,
                lint: false,
                allHTML: !(chipperVersion.major === 0 && chipperVersion.minor === 0 && brands[0] !== constants.PHET_BRAND)
            });
            winston.debug('Build finished.');
            winston.debug(`Deploying to servers: ${JSON.stringify(servers)}`);
            const checkoutDir = ReleaseBranch.getCheckoutDirectory(simName, branch);
            const simRepoDir = `${checkoutDir}/${simName}`;
            const buildDir = `${simRepoDir}/build`;
            if (servers.indexOf(constants.DEV_SERVER) >= 0) {
                winston.info('deploying to dev');
                if (brands.indexOf(constants.PHET_IO_BRAND) >= 0) {
                    const htaccessLocation = chipperVersion.major === 2 && chipperVersion.minor === 0 ? `${buildDir}/phet-io` : buildDir;
                    yield writePhetioHtaccess(htaccessLocation, {
                        checkoutDir: checkoutDir,
                        isProductionDeploy: false
                    });
                }
                yield devDeploy(checkoutDir, simName, version, chipperVersion, brands, buildDir);
            }
            if (servers.indexOf(constants.PRODUCTION_SERVER) >= 0) {
                winston.info('deploying to production');
                let targetVersionDir;
                let targetSimDir;
                // Loop over all brands
                for(const i in brands){
                    if (brands.hasOwnProperty(i)) {
                        const brand = brands[i];
                        winston.info(`deploying brand: ${brand}`);
                        // Pre-copy steps
                        if (brand === constants.PHET_BRAND) {
                            targetSimDir = constants.HTML_SIMS_DIRECTORY + simName;
                            targetVersionDir = `${targetSimDir}/${version}/`;
                            if (chipperVersion.major === 2 && chipperVersion.minor === 0) {
                                // Remove _phet from all filenames in the phet directory
                                const phetBuildDir = `${buildDir}/phet`;
                                const files = fs.readdirSync(phetBuildDir);
                                for(const i in files){
                                    if (files.hasOwnProperty(i)) {
                                        const filename = files[i];
                                        if (filename.indexOf('_phet') >= 0) {
                                            const newFilename = filename.replace('_phet', '');
                                            yield execute('mv', [
                                                filename,
                                                newFilename
                                            ], phetBuildDir);
                                        }
                                    }
                                }
                            }
                        } else if (brand === constants.PHET_IO_BRAND) {
                            targetSimDir = constants.PHET_IO_SIMS_DIRECTORY + simName;
                            targetVersionDir = `${targetSimDir}/${originalVersion}`;
                            // Chipper 1.0 has -phetio in the version schema for PhET-iO branded sims
                            if (chipperVersion.major === 0 && !originalVersion.match('-phetio')) {
                                targetVersionDir += '-phetio';
                            }
                            targetVersionDir += '/';
                        }
                        // Copy steps - allow EEXIST errors but reject anything else
                        winston.debug(`Creating version dir: ${targetVersionDir}`);
                        try {
                            yield fs.promises.mkdir(targetVersionDir, {
                                recursive: true
                            });
                            winston.debug('Success creating sim dir');
                        } catch (err) {
                            if (err.code !== 'EEXIST') {
                                winston.error('Failure creating version dir');
                                winston.error(err);
                                throw err;
                            }
                        }
                        let sourceDir = buildDir;
                        if (chipperVersion.major === 2 && chipperVersion.minor === 0) {
                            sourceDir += `/${brand}`;
                        }
                        yield new Promise((resolve, reject)=>{
                            winston.debug(`Copying recursive ${sourceDir} to ${targetVersionDir}`);
                            new rsync().flags('razpO').set('no-perms').set('exclude', '.rsync-filter').source(`${sourceDir}/`).destination(targetVersionDir).output((stdout)=>{
                                winston.debug(stdout.toString());
                            }, (stderr)=>{
                                winston.error(stderr.toString());
                            }).execute((err, code, cmd)=>{
                                if (err && code !== 23) {
                                    winston.debug(code);
                                    winston.debug(cmd);
                                    reject(err);
                                } else {
                                    resolve();
                                }
                            });
                        });
                        winston.debug('Copy finished');
                        // Post-copy steps
                        if (brand === constants.PHET_BRAND) {
                            if (!isTranslationRequest) {
                                yield deployImages({
                                    simulation: options.simName,
                                    brands: options.brands,
                                    version: options.version
                                });
                            }
                            yield writePhetHtaccess(simName, version);
                            yield createTranslationsXML(simName, version, checkoutDir);
                            // This should be the last function called for the phet brand.
                            // This triggers an asyncronous task on the tomcat/wicket application and only waits for a response that the request was received.
                            // Do not assume that this task is complete because we use await.
                            yield notifyServer({
                                simName: simName,
                                email: email,
                                brand: brand,
                                locales: locales,
                                translatorId: isTranslationRequest ? userId : undefined
                            });
                        } else if (brand === constants.PHET_IO_BRAND) {
                            const suffix = originalVersion.split('-').length >= 2 ? originalVersion.split('-')[1] : chipperVersion.major < 2 ? 'phetio' : '';
                            const parsedVersion = SimVersion.parse(version, '');
                            const simPackage = yield loadJSON(`${simRepoDir}/package.json`);
                            const ignoreForAutomatedMaintenanceReleases = !!(simPackage && simPackage.phet && simPackage.phet.ignoreForAutomatedMaintenanceReleases);
                            // This triggers an asyncronous task on the tomcat/wicket application and only waits for a response that the request was received.
                            // Do not assume that this task is complete because we use await.
                            yield notifyServer({
                                simName: simName,
                                email: email,
                                brand: brand,
                                phetioOptions: {
                                    branch: branch,
                                    suffix: suffix,
                                    version: parsedVersion,
                                    ignoreForAutomatedMaintenanceReleases: ignoreForAutomatedMaintenanceReleases
                                }
                            });
                            winston.debug('server notified');
                            yield writePhetioHtaccess(targetVersionDir, {
                                simName: simName,
                                version: originalVersion,
                                directory: constants.PHET_IO_SIMS_DIRECTORY,
                                checkoutDir: checkoutDir,
                                isProductionDeploy: true
                            });
                        }
                    }
                }
            }
            yield afterDeploy(`${buildDir}`);
        } catch (err) {
            yield abortBuild(err);
        }
    });
    return _runTask.apply(this, arguments);
}
module.exports = function taskWorker(task, taskCallback) {
    runTask(task).then(()=>{
        taskCallback();
    }).catch((reason)=>{
        taskCallback(reason);
    });
};

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3BlcmVubmlhbC1hbGlhcy9qcy9idWlsZC1zZXJ2ZXIvdGFza1dvcmtlci5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNy0yMDE5LCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcbi8vIEBhdXRob3IgTWF0dCBQZW5uaW5ndG9uIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxuXG5cbmNvbnN0IGNvbnN0YW50cyA9IHJlcXVpcmUoICcuL2NvbnN0YW50cycgKTtcbmNvbnN0IGNyZWF0ZVRyYW5zbGF0aW9uc1hNTCA9IHJlcXVpcmUoICcuL2NyZWF0ZVRyYW5zbGF0aW9uc1hNTCcgKTtcbmNvbnN0IGRldkRlcGxveSA9IHJlcXVpcmUoICcuL2RldkRlcGxveScgKTtcbmNvbnN0IGV4ZWN1dGUgPSByZXF1aXJlKCAnLi4vY29tbW9uL2V4ZWN1dGUnICkuZGVmYXVsdDtcbmNvbnN0IGZzID0gcmVxdWlyZSggJ2ZzJyApO1xuY29uc3QgZ2V0TG9jYWxlcyA9IHJlcXVpcmUoICcuL2dldExvY2FsZXMnICk7XG5jb25zdCBub3RpZnlTZXJ2ZXIgPSByZXF1aXJlKCAnLi9ub3RpZnlTZXJ2ZXInICk7XG5jb25zdCByc3luYyA9IHJlcXVpcmUoICdyc3luYycgKTtcbmNvbnN0IFNpbVZlcnNpb24gPSByZXF1aXJlKCAnLi4vYnJvd3Nlci1hbmQtbm9kZS9TaW1WZXJzaW9uJyApLmRlZmF1bHQ7XG5jb25zdCB3aW5zdG9uID0gcmVxdWlyZSggJ3dpbnN0b24nICk7XG5jb25zdCB3cml0ZVBoZXRIdGFjY2VzcyA9IHJlcXVpcmUoICcuL3dyaXRlUGhldEh0YWNjZXNzJyApO1xuY29uc3Qgd3JpdGVQaGV0aW9IdGFjY2VzcyA9IHJlcXVpcmUoICcuLi9jb21tb24vd3JpdGVQaGV0aW9IdGFjY2VzcycgKTtcbmNvbnN0IGRlcGxveUltYWdlcyA9IHJlcXVpcmUoICcuL2RlcGxveUltYWdlcycgKTtcbmNvbnN0IHBlcnNpc3RlbnRRdWV1ZSA9IHJlcXVpcmUoICcuL3BlcnNpc3RlbnRRdWV1ZScgKTtcbmNvbnN0IFJlbGVhc2VCcmFuY2ggPSByZXF1aXJlKCAnLi4vY29tbW9uL1JlbGVhc2VCcmFuY2gnICk7XG5jb25zdCBsb2FkSlNPTiA9IHJlcXVpcmUoICcuLi9jb21tb24vbG9hZEpTT04nICk7XG5cbi8qKlxuICogQWJvcnQgYnVpbGQgd2l0aCBlcnJcbiAqIEBwYXJhbSB7U3RyaW5nfEVycm9yfSBlcnIgLSBlcnJvciBsb2dnZWQgYW5kIHNlbnQgdmlhIGVtYWlsXG4gKi9cbmNvbnN0IGFib3J0QnVpbGQgPSBhc3luYyBlcnIgPT4ge1xuICB3aW5zdG9uLmxvZyggJ2Vycm9yJywgYEJVSUxEIEFCT1JURUQhICR7ZXJyfWAgKTtcbiAgZXJyLnN0YWNrICYmIHdpbnN0b24ubG9nKCAnZXJyb3InLCBlcnIuc3RhY2sgKTtcblxuICB0aHJvdyBuZXcgRXJyb3IoIGBCdWlsZCBhYm9ydGVkLCAke2Vycn1gICk7XG59O1xuXG4vKipcbiAqIENsZWFuIHVwIGFmdGVyIGRlcGxveS4gUmVtb3ZlIHRtcCBkaXIuXG4gKi9cbmNvbnN0IGFmdGVyRGVwbG95ID0gYXN5bmMgYnVpbGREaXIgPT4ge1xuICB0cnkge1xuICAgIGF3YWl0IGV4ZWN1dGUoICdybScsIFsgJy1yZicsIGJ1aWxkRGlyIF0sICcuJyApO1xuICB9XG4gIGNhdGNoKCBlcnIgKSB7XG4gICAgYXdhaXQgYWJvcnRCdWlsZCggZXJyICk7XG4gIH1cbn07XG5cbi8qKlxuICogdGFza1F1ZXVlIGVuc3VyZXMgdGhhdCBvbmx5IG9uZSBidWlsZC9kZXBsb3kgcHJvY2VzcyB3aWxsIGJlIGhhcHBlbmluZyBhdCB0aGUgc2FtZSB0aW1lLiAgVGhlIG1haW4gYnVpbGQvZGVwbG95IGxvZ2ljIGlzIGhlcmUuXG4gKlxuICogQHByb3BlcnR5IHtKU09OfSByZXBvc1xuICogQHByb3BlcnR5IHtTdHJpbmd9IGFwaVxuICogQHByb3BlcnR5IHtTdHJpbmd9IGxvY2FsZXMgLSBjb21tYSBzZXBhcmF0ZWQgbGlzdCBvZiBsb2NhbGUgY29kZXNcbiAqIEBwcm9wZXJ0eSB7U3RyaW5nfSBzaW1OYW1lIC0gbG93ZXIgY2FzZSBzaW11bGF0aW9uIG5hbWUgdXNlZCBmb3IgY3JlYXRpbmcgZmlsZXMvZGlyZWN0b3JpZXNcbiAqIEBwcm9wZXJ0eSB7U3RyaW5nfSB2ZXJzaW9uIC0gc2ltIHZlcnNpb24gaWRlbnRpZmllciBzdHJpbmdcbiAqIEBwcm9wZXJ0eSB7U3RyaW5nfSBzZXJ2ZXJzIC0gZGVwbG95bWVudCB0YXJnZXRzLCBzdWJzZXQgb2YgWyAnZGV2JywgJ3Byb2R1Y3Rpb24nIF1cbiAqIEBwcm9wZXJ0eSB7c3RyaW5nW119IGJyYW5kcyAtIGRlcGxveW1lbnQgYnJhbmRzXG4gKiBAcHJvcGVydHkge1N0cmluZ30gZW1haWwgLSB1c2VkIGZvciBzZW5kaW5nIG5vdGlmaWNhdGlvbnMgYWJvdXQgc3VjY2Vzcy9mYWlsdXJlXG4gKiBAcHJvcGVydHkge1N0cmluZ30gdHJhbnNsYXRvcklkIC0gcm9zZXR0YSB1c2VyIGlkIGZvciBhZGRpbmcgdHJhbnNsYXRvcnMgdG8gdGhlIHdlYnNpdGVcbiAqIEBwcm9wZXJ0eSB7d2luc3Rvbn0gd2luc3RvbiAtIGxvZ2dlclxuICogQHBhcmFtIG9wdGlvbnNcbiAqL1xuYXN5bmMgZnVuY3Rpb24gcnVuVGFzayggb3B0aW9ucyApIHtcbiAgcGVyc2lzdGVudFF1ZXVlLnN0YXJ0VGFzayggb3B0aW9ucyApO1xuICBpZiAoIG9wdGlvbnMuZGVwbG95SW1hZ2VzICkge1xuICAgIHRyeSB7XG4gICAgICBhd2FpdCBkZXBsb3lJbWFnZXMoIG9wdGlvbnMgKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgY2F0Y2goIGUgKSB7XG4gICAgICB3aW5zdG9uLmVycm9yKCBlICk7XG4gICAgICB3aW5zdG9uLmVycm9yKCAnRGVwbG95IGltYWdlcyBmYWlsZWQuIFNlZSBwcmV2aW91cyBsb2dzIGZvciBkZXRhaWxzLicgKTtcbiAgICAgIHRocm93IGU7XG4gICAgfVxuICB9XG5cblxuICB0cnkge1xuICAgIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgIC8vIFBhcnNlIGFuZCB2YWxpZGF0ZSBwYXJhbWV0ZXJzXG4gICAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgY29uc3QgYXBpID0gb3B0aW9ucy5hcGk7XG4gICAgY29uc3QgZGVwZW5kZW5jaWVzID0gb3B0aW9ucy5yZXBvcztcbiAgICBsZXQgbG9jYWxlcyA9IG9wdGlvbnMubG9jYWxlcztcbiAgICBjb25zdCBzaW1OYW1lID0gb3B0aW9ucy5zaW1OYW1lO1xuICAgIGxldCB2ZXJzaW9uID0gb3B0aW9ucy52ZXJzaW9uO1xuICAgIGNvbnN0IGVtYWlsID0gb3B0aW9ucy5lbWFpbDtcbiAgICBjb25zdCBicmFuZHMgPSBvcHRpb25zLmJyYW5kcztcbiAgICBjb25zdCBzZXJ2ZXJzID0gb3B0aW9ucy5zZXJ2ZXJzO1xuICAgIGNvbnN0IHVzZXJJZCA9IG9wdGlvbnMudXNlcklkO1xuICAgIGNvbnN0IGJyYW5jaCA9IG9wdGlvbnMuYnJhbmNoIHx8IHZlcnNpb24ubWF0Y2goIC9eKFxcZCtcXC5cXGQrKS8gKVsgMCBdO1xuXG4gICAgaWYgKCB1c2VySWQgKSB7XG4gICAgICB3aW5zdG9uLmxvZyggJ2luZm8nLCBgc2V0dGluZyB1c2VySWQgPSAke3VzZXJJZH1gICk7XG4gICAgfVxuXG4gICAgaWYgKCBicmFuY2ggPT09IG51bGwgKSB7XG4gICAgICBhd2FpdCBhYm9ydEJ1aWxkKCAnQnJhbmNoIG11c3QgYmUgcHJvdmlkZWQuJyApO1xuICAgIH1cblxuICAgIC8vIHZhbGlkYXRlIHNpbU5hbWVcbiAgICBjb25zdCBzaW1OYW1lUmVnZXggPSAvXlthLXotXSskLztcbiAgICBpZiAoICFzaW1OYW1lUmVnZXgudGVzdCggc2ltTmFtZSApICkge1xuICAgICAgYXdhaXQgYWJvcnRCdWlsZCggYGludmFsaWQgc2ltTmFtZSAke3NpbU5hbWV9YCApO1xuICAgIH1cblxuICAgIC8vIG1ha2Ugc3VyZSB0aGUgcmVwb3MgcGFzc2VkIGluIHZhbGlkYXRlc1xuICAgIGZvciAoIGNvbnN0IGtleSBpbiBkZXBlbmRlbmNpZXMgKSB7XG4gICAgICBpZiAoIGRlcGVuZGVuY2llcy5oYXNPd25Qcm9wZXJ0eSgga2V5ICkgKSB7XG4gICAgICAgIHdpbnN0b24ubG9nKCAnaW5mbycsIGBWYWxpZGF0aW5nIHJlcG86ICR7a2V5fWAgKTtcblxuICAgICAgICAvLyBtYWtlIHN1cmUgYWxsIGtleXMgaW4gZGVwZW5kZW5jaWVzIG9iamVjdCBhcmUgdmFsaWQgc2ltIG5hbWVzXG4gICAgICAgIGlmICggIXNpbU5hbWVSZWdleC50ZXN0KCBrZXkgKSApIHtcbiAgICAgICAgICBhd2FpdCBhYm9ydEJ1aWxkKCBgaW52YWxpZCBzaW1OYW1lIGluIGRlcGVuZGVuY2llczogJHtzaW1OYW1lfWAgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHZhbHVlID0gZGVwZW5kZW5jaWVzWyBrZXkgXTtcbiAgICAgICAgaWYgKCBrZXkgPT09ICdjb21tZW50JyApIHtcbiAgICAgICAgICBpZiAoIHR5cGVvZiB2YWx1ZSAhPT0gJ3N0cmluZycgKSB7XG4gICAgICAgICAgICBhd2FpdCBhYm9ydEJ1aWxkKCAnaW52YWxpZCBjb21tZW50IGluIGRlcGVuZGVuY2llczogc2hvdWxkIGJlIGEgc3RyaW5nJyApO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmICggdmFsdWUgaW5zdGFuY2VvZiBPYmplY3QgJiYgdmFsdWUuaGFzT3duUHJvcGVydHkoICdzaGEnICkgKSB7XG4gICAgICAgICAgaWYgKCAhL15bYS1mMC05XXs0MH0kLy50ZXN0KCB2YWx1ZS5zaGEgKSApIHtcbiAgICAgICAgICAgIGF3YWl0IGFib3J0QnVpbGQoIGBpbnZhbGlkIHNoYSBpbiBkZXBlbmRlbmNpZXMuIGtleTogJHtrZXl9IHZhbHVlOiAke3ZhbHVlfSBzaGE6ICR7dmFsdWUuc2hhfWAgKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgYXdhaXQgYWJvcnRCdWlsZCggYGludmFsaWQgaXRlbSBpbiBkZXBlbmRlbmNpZXMuIGtleTogJHtrZXl9IHZhbHVlOiAke3ZhbHVlfWAgKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIC8vIEluZmVyIGJyYW5kIGZyb20gdmVyc2lvbiBzdHJpbmcgYW5kIGtlZXAgdW5zdHJpcHBlZCB2ZXJzaW9uIGZvciBwaGV0LWlvXG4gICAgY29uc3Qgb3JpZ2luYWxWZXJzaW9uID0gdmVyc2lvbjtcbiAgICBpZiAoIGFwaSA9PT0gJzEuMCcgKSB7XG4gICAgICAvLyB2YWxpZGF0ZSB2ZXJzaW9uIGFuZCBzdHJpcCBzdWZmaXhlcyBzaW5jZSBqdXN0IHRoZSBudW1iZXJzIGFyZSB1c2VkIGluIHRoZSBkaXJlY3RvcnkgbmFtZSBvbiBkZXYgYW5kIHByb2R1Y3Rpb24gc2VydmVyc1xuICAgICAgY29uc3QgdmVyc2lvbk1hdGNoID0gdmVyc2lvbi5tYXRjaCggL14oXFxkK1xcLlxcZCtcXC5cXGQrKSg/Oi0uKik/JC8gKTtcbiAgICAgIGlmICggdmVyc2lvbk1hdGNoICYmIHZlcnNpb25NYXRjaC5sZW5ndGggPT09IDIgKSB7XG5cbiAgICAgICAgaWYgKCBzZXJ2ZXJzLmluY2x1ZGVzKCAnZGV2JyApICkge1xuICAgICAgICAgIC8vIGlmIGRlcGxveWluZyBhbiByYyB2ZXJzaW9uIHVzZSB0aGUgLXJjLltudW1iZXJdIHN1ZmZpeFxuICAgICAgICAgIHZlcnNpb24gPSB2ZXJzaW9uTWF0Y2hbIDAgXTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAvLyBvdGhlcndpc2Ugc3RyaXAgYW55IHN1ZmZpeFxuICAgICAgICAgIHZlcnNpb24gPSB2ZXJzaW9uTWF0Y2hbIDEgXTtcbiAgICAgICAgfVxuICAgICAgICB3aW5zdG9uLmxvZyggJ2luZm8nLCBgZGV0ZWN0aW5nIHZlcnNpb24gbnVtYmVyOiAke3ZlcnNpb259YCApO1xuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgIGF3YWl0IGFib3J0QnVpbGQoIGBpbnZhbGlkIHZlcnNpb24gbnVtYmVyOiAke3ZlcnNpb259YCApO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmICggYXBpID09PSAnMS4wJyApIHtcbiAgICAgIGxvY2FsZXMgPSBhd2FpdCBnZXRMb2NhbGVzKCBsb2NhbGVzLCBzaW1OYW1lICk7XG4gICAgfVxuXG4gICAgLy8gR2l0IHB1bGwsIGdpdCBjaGVja291dCwgbnBtIHBydW5lICYgdXBkYXRlLCBldGMuIGluIHBhcmFsbGVsIGRpcmVjdG9yeVxuICAgIGNvbnN0IHJlbGVhc2VCcmFuY2ggPSBuZXcgUmVsZWFzZUJyYW5jaCggc2ltTmFtZSwgYnJhbmNoLCBicmFuZHMsIHRydWUgKTtcbiAgICBhd2FpdCByZWxlYXNlQnJhbmNoLnVwZGF0ZUNoZWNrb3V0KCBkZXBlbmRlbmNpZXMgKTtcblxuICAgIGNvbnN0IGNoaXBwZXJWZXJzaW9uID0gcmVsZWFzZUJyYW5jaC5nZXRDaGlwcGVyVmVyc2lvbigpO1xuICAgIHdpbnN0b24uZGVidWcoIGBDaGlwcGVyIHZlcnNpb24gZGV0ZWN0ZWQ6ICR7Y2hpcHBlclZlcnNpb24udG9TdHJpbmcoKX1gICk7XG4gICAgaWYgKCAhKCBjaGlwcGVyVmVyc2lvbi5tYWpvciA9PT0gMiAmJiBjaGlwcGVyVmVyc2lvbi5taW5vciA9PT0gMCApICYmICEoIGNoaXBwZXJWZXJzaW9uLm1ham9yID09PSAwICYmIGNoaXBwZXJWZXJzaW9uLm1pbm9yID09PSAwICkgKSB7XG4gICAgICBhd2FpdCBhYm9ydEJ1aWxkKCAnVW5zdXBwb3J0ZWQgY2hpcHBlciB2ZXJzaW9uJyApO1xuICAgIH1cblxuICAgIGlmICggY2hpcHBlclZlcnNpb24ubWFqb3IgIT09IDEgKSB7XG4gICAgICBjb25zdCBjaGVja291dERpcmVjdG9yeSA9IFJlbGVhc2VCcmFuY2guZ2V0Q2hlY2tvdXREaXJlY3RvcnkoIHNpbU5hbWUsIGJyYW5jaCApO1xuICAgICAgY29uc3QgcGFja2FnZUpTT04gPSBKU09OLnBhcnNlKCBmcy5yZWFkRmlsZVN5bmMoIGAke2NoZWNrb3V0RGlyZWN0b3J5fS8ke3NpbU5hbWV9L3BhY2thZ2UuanNvbmAsICd1dGY4JyApICk7XG4gICAgICBjb25zdCBwYWNrYWdlVmVyc2lvbiA9IHBhY2thZ2VKU09OLnZlcnNpb247XG5cbiAgICAgIGlmICggcGFja2FnZVZlcnNpb24gIT09IHZlcnNpb24gKSB7XG4gICAgICAgIGF3YWl0IGFib3J0QnVpbGQoIGBWZXJzaW9uIG1pc21hdGNoIGJldHdlZW4gcGFja2FnZS5qc29uIGFuZCBidWlsZCByZXF1ZXN0OiAke3BhY2thZ2VWZXJzaW9ufSB2cyAke3ZlcnNpb259YCApO1xuICAgICAgfVxuICAgIH1cblxuICAgIGNvbnN0IGxvY2FsZXNBcnJheSA9IHR5cGVvZiAoIGxvY2FsZXMgKSA9PT0gJ3N0cmluZycgPyBsb2NhbGVzLnNwbGl0KCAnLCcgKSA6IGxvY2FsZXM7XG4gICAgLy8gaWYgdGhpcyBidWlsZCByZXF1ZXN0IGNvbWVzIGZyb20gcm9zZXR0YSBpdCB3aWxsIGhhdmUgYSB1c2VySWQgZmllbGQgYW5kIG9ubHkgb25lIGxvY2FsZVxuICAgIGNvbnN0IGlzVHJhbnNsYXRpb25SZXF1ZXN0ID0gdXNlcklkICYmIGxvY2FsZXNBcnJheS5sZW5ndGggPT09IDEgJiYgbG9jYWxlc0FycmF5WyAwIF0gIT09ICcqJztcblxuICAgIGF3YWl0IHJlbGVhc2VCcmFuY2guYnVpbGQoIHtcbiAgICAgIGNsZWFuOiBmYWxzZSxcbiAgICAgIGxvY2FsZXM6IGlzVHJhbnNsYXRpb25SZXF1ZXN0ID8gJyonIDogbG9jYWxlcyxcbiAgICAgIGJ1aWxkRm9yU2VydmVyOiB0cnVlLFxuICAgICAgbGludDogZmFsc2UsXG4gICAgICBhbGxIVE1MOiAhKCBjaGlwcGVyVmVyc2lvbi5tYWpvciA9PT0gMCAmJiBjaGlwcGVyVmVyc2lvbi5taW5vciA9PT0gMCAmJiBicmFuZHNbIDAgXSAhPT0gY29uc3RhbnRzLlBIRVRfQlJBTkQgKVxuICAgIH0gKTtcbiAgICB3aW5zdG9uLmRlYnVnKCAnQnVpbGQgZmluaXNoZWQuJyApO1xuXG4gICAgd2luc3Rvbi5kZWJ1ZyggYERlcGxveWluZyB0byBzZXJ2ZXJzOiAke0pTT04uc3RyaW5naWZ5KCBzZXJ2ZXJzICl9YCApO1xuXG4gICAgY29uc3QgY2hlY2tvdXREaXIgPSBSZWxlYXNlQnJhbmNoLmdldENoZWNrb3V0RGlyZWN0b3J5KCBzaW1OYW1lLCBicmFuY2ggKTtcbiAgICBjb25zdCBzaW1SZXBvRGlyID0gYCR7Y2hlY2tvdXREaXJ9LyR7c2ltTmFtZX1gO1xuICAgIGNvbnN0IGJ1aWxkRGlyID0gYCR7c2ltUmVwb0Rpcn0vYnVpbGRgO1xuXG4gICAgaWYgKCBzZXJ2ZXJzLmluZGV4T2YoIGNvbnN0YW50cy5ERVZfU0VSVkVSICkgPj0gMCApIHtcbiAgICAgIHdpbnN0b24uaW5mbyggJ2RlcGxveWluZyB0byBkZXYnICk7XG4gICAgICBpZiAoIGJyYW5kcy5pbmRleE9mKCBjb25zdGFudHMuUEhFVF9JT19CUkFORCApID49IDAgKSB7XG4gICAgICAgIGNvbnN0IGh0YWNjZXNzTG9jYXRpb24gPSAoIGNoaXBwZXJWZXJzaW9uLm1ham9yID09PSAyICYmIGNoaXBwZXJWZXJzaW9uLm1pbm9yID09PSAwICkgP1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYCR7YnVpbGREaXJ9L3BoZXQtaW9gIDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJ1aWxkRGlyO1xuICAgICAgICBhd2FpdCB3cml0ZVBoZXRpb0h0YWNjZXNzKCBodGFjY2Vzc0xvY2F0aW9uLCB7XG4gICAgICAgICAgY2hlY2tvdXREaXI6IGNoZWNrb3V0RGlyLFxuICAgICAgICAgIGlzUHJvZHVjdGlvbkRlcGxveTogZmFsc2VcbiAgICAgICAgfSApO1xuICAgICAgfVxuICAgICAgYXdhaXQgZGV2RGVwbG95KCBjaGVja291dERpciwgc2ltTmFtZSwgdmVyc2lvbiwgY2hpcHBlclZlcnNpb24sIGJyYW5kcywgYnVpbGREaXIgKTtcbiAgICB9XG5cbiAgICBpZiAoIHNlcnZlcnMuaW5kZXhPZiggY29uc3RhbnRzLlBST0RVQ1RJT05fU0VSVkVSICkgPj0gMCApIHtcbiAgICAgIHdpbnN0b24uaW5mbyggJ2RlcGxveWluZyB0byBwcm9kdWN0aW9uJyApO1xuICAgICAgbGV0IHRhcmdldFZlcnNpb25EaXI7XG4gICAgICBsZXQgdGFyZ2V0U2ltRGlyO1xuXG4gICAgICAvLyBMb29wIG92ZXIgYWxsIGJyYW5kc1xuICAgICAgZm9yICggY29uc3QgaSBpbiBicmFuZHMgKSB7XG4gICAgICAgIGlmICggYnJhbmRzLmhhc093blByb3BlcnR5KCBpICkgKSB7XG4gICAgICAgICAgY29uc3QgYnJhbmQgPSBicmFuZHNbIGkgXTtcbiAgICAgICAgICB3aW5zdG9uLmluZm8oIGBkZXBsb3lpbmcgYnJhbmQ6ICR7YnJhbmR9YCApO1xuICAgICAgICAgIC8vIFByZS1jb3B5IHN0ZXBzXG4gICAgICAgICAgaWYgKCBicmFuZCA9PT0gY29uc3RhbnRzLlBIRVRfQlJBTkQgKSB7XG4gICAgICAgICAgICB0YXJnZXRTaW1EaXIgPSBjb25zdGFudHMuSFRNTF9TSU1TX0RJUkVDVE9SWSArIHNpbU5hbWU7XG4gICAgICAgICAgICB0YXJnZXRWZXJzaW9uRGlyID0gYCR7dGFyZ2V0U2ltRGlyfS8ke3ZlcnNpb259L2A7XG5cbiAgICAgICAgICAgIGlmICggY2hpcHBlclZlcnNpb24ubWFqb3IgPT09IDIgJiYgY2hpcHBlclZlcnNpb24ubWlub3IgPT09IDAgKSB7XG4gICAgICAgICAgICAgIC8vIFJlbW92ZSBfcGhldCBmcm9tIGFsbCBmaWxlbmFtZXMgaW4gdGhlIHBoZXQgZGlyZWN0b3J5XG4gICAgICAgICAgICAgIGNvbnN0IHBoZXRCdWlsZERpciA9IGAke2J1aWxkRGlyfS9waGV0YDtcbiAgICAgICAgICAgICAgY29uc3QgZmlsZXMgPSBmcy5yZWFkZGlyU3luYyggcGhldEJ1aWxkRGlyICk7XG4gICAgICAgICAgICAgIGZvciAoIGNvbnN0IGkgaW4gZmlsZXMgKSB7XG4gICAgICAgICAgICAgICAgaWYgKCBmaWxlcy5oYXNPd25Qcm9wZXJ0eSggaSApICkge1xuICAgICAgICAgICAgICAgICAgY29uc3QgZmlsZW5hbWUgPSBmaWxlc1sgaSBdO1xuICAgICAgICAgICAgICAgICAgaWYgKCBmaWxlbmFtZS5pbmRleE9mKCAnX3BoZXQnICkgPj0gMCApIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgbmV3RmlsZW5hbWUgPSBmaWxlbmFtZS5yZXBsYWNlKCAnX3BoZXQnLCAnJyApO1xuICAgICAgICAgICAgICAgICAgICBhd2FpdCBleGVjdXRlKCAnbXYnLCBbIGZpbGVuYW1lLCBuZXdGaWxlbmFtZSBdLCBwaGV0QnVpbGREaXIgKTtcbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgZWxzZSBpZiAoIGJyYW5kID09PSBjb25zdGFudHMuUEhFVF9JT19CUkFORCApIHtcbiAgICAgICAgICAgIHRhcmdldFNpbURpciA9IGNvbnN0YW50cy5QSEVUX0lPX1NJTVNfRElSRUNUT1JZICsgc2ltTmFtZTtcbiAgICAgICAgICAgIHRhcmdldFZlcnNpb25EaXIgPSBgJHt0YXJnZXRTaW1EaXJ9LyR7b3JpZ2luYWxWZXJzaW9ufWA7XG5cbiAgICAgICAgICAgIC8vIENoaXBwZXIgMS4wIGhhcyAtcGhldGlvIGluIHRoZSB2ZXJzaW9uIHNjaGVtYSBmb3IgUGhFVC1pTyBicmFuZGVkIHNpbXNcbiAgICAgICAgICAgIGlmICggY2hpcHBlclZlcnNpb24ubWFqb3IgPT09IDAgJiYgIW9yaWdpbmFsVmVyc2lvbi5tYXRjaCggJy1waGV0aW8nICkgKSB7XG4gICAgICAgICAgICAgIHRhcmdldFZlcnNpb25EaXIgKz0gJy1waGV0aW8nO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGFyZ2V0VmVyc2lvbkRpciArPSAnLyc7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8gQ29weSBzdGVwcyAtIGFsbG93IEVFWElTVCBlcnJvcnMgYnV0IHJlamVjdCBhbnl0aGluZyBlbHNlXG4gICAgICAgICAgd2luc3Rvbi5kZWJ1ZyggYENyZWF0aW5nIHZlcnNpb24gZGlyOiAke3RhcmdldFZlcnNpb25EaXJ9YCApO1xuICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICBhd2FpdCBmcy5wcm9taXNlcy5ta2RpciggdGFyZ2V0VmVyc2lvbkRpciwgeyByZWN1cnNpdmU6IHRydWUgfSApO1xuICAgICAgICAgICAgd2luc3Rvbi5kZWJ1ZyggJ1N1Y2Nlc3MgY3JlYXRpbmcgc2ltIGRpcicgKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgY2F0Y2goIGVyciApIHtcbiAgICAgICAgICAgIGlmICggZXJyLmNvZGUgIT09ICdFRVhJU1QnICkge1xuICAgICAgICAgICAgICB3aW5zdG9uLmVycm9yKCAnRmFpbHVyZSBjcmVhdGluZyB2ZXJzaW9uIGRpcicgKTtcbiAgICAgICAgICAgICAgd2luc3Rvbi5lcnJvciggZXJyICk7XG4gICAgICAgICAgICAgIHRocm93IGVycjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgbGV0IHNvdXJjZURpciA9IGJ1aWxkRGlyO1xuICAgICAgICAgIGlmICggY2hpcHBlclZlcnNpb24ubWFqb3IgPT09IDIgJiYgY2hpcHBlclZlcnNpb24ubWlub3IgPT09IDAgKSB7XG4gICAgICAgICAgICBzb3VyY2VEaXIgKz0gYC8ke2JyYW5kfWA7XG4gICAgICAgICAgfVxuICAgICAgICAgIGF3YWl0IG5ldyBQcm9taXNlKCAoIHJlc29sdmUsIHJlamVjdCApID0+IHtcbiAgICAgICAgICAgIHdpbnN0b24uZGVidWcoIGBDb3B5aW5nIHJlY3Vyc2l2ZSAke3NvdXJjZURpcn0gdG8gJHt0YXJnZXRWZXJzaW9uRGlyfWAgKTtcbiAgICAgICAgICAgIG5ldyByc3luYygpXG4gICAgICAgICAgICAgIC5mbGFncyggJ3JhenBPJyApXG4gICAgICAgICAgICAgIC5zZXQoICduby1wZXJtcycgKVxuICAgICAgICAgICAgICAuc2V0KCAnZXhjbHVkZScsICcucnN5bmMtZmlsdGVyJyApXG4gICAgICAgICAgICAgIC5zb3VyY2UoIGAke3NvdXJjZURpcn0vYCApXG4gICAgICAgICAgICAgIC5kZXN0aW5hdGlvbiggdGFyZ2V0VmVyc2lvbkRpciApXG4gICAgICAgICAgICAgIC5vdXRwdXQoIHN0ZG91dCA9PiB7IHdpbnN0b24uZGVidWcoIHN0ZG91dC50b1N0cmluZygpICk7IH0sXG4gICAgICAgICAgICAgICAgc3RkZXJyID0+IHsgd2luc3Rvbi5lcnJvciggc3RkZXJyLnRvU3RyaW5nKCkgKTsgfSApXG4gICAgICAgICAgICAgIC5leGVjdXRlKCAoIGVyciwgY29kZSwgY21kICkgPT4ge1xuICAgICAgICAgICAgICAgIGlmICggZXJyICYmIGNvZGUgIT09IDIzICkge1xuICAgICAgICAgICAgICAgICAgd2luc3Rvbi5kZWJ1ZyggY29kZSApO1xuICAgICAgICAgICAgICAgICAgd2luc3Rvbi5kZWJ1ZyggY21kICk7XG4gICAgICAgICAgICAgICAgICByZWplY3QoIGVyciApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHsgcmVzb2x2ZSgpOyB9XG4gICAgICAgICAgICAgIH0gKTtcbiAgICAgICAgICB9ICk7XG5cbiAgICAgICAgICB3aW5zdG9uLmRlYnVnKCAnQ29weSBmaW5pc2hlZCcgKTtcblxuICAgICAgICAgIC8vIFBvc3QtY29weSBzdGVwc1xuICAgICAgICAgIGlmICggYnJhbmQgPT09IGNvbnN0YW50cy5QSEVUX0JSQU5EICkge1xuICAgICAgICAgICAgaWYgKCAhaXNUcmFuc2xhdGlvblJlcXVlc3QgKSB7XG4gICAgICAgICAgICAgIGF3YWl0IGRlcGxveUltYWdlcygge1xuICAgICAgICAgICAgICAgIHNpbXVsYXRpb246IG9wdGlvbnMuc2ltTmFtZSxcbiAgICAgICAgICAgICAgICBicmFuZHM6IG9wdGlvbnMuYnJhbmRzLFxuICAgICAgICAgICAgICAgIHZlcnNpb246IG9wdGlvbnMudmVyc2lvblxuICAgICAgICAgICAgICB9ICk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBhd2FpdCB3cml0ZVBoZXRIdGFjY2Vzcyggc2ltTmFtZSwgdmVyc2lvbiApO1xuICAgICAgICAgICAgYXdhaXQgY3JlYXRlVHJhbnNsYXRpb25zWE1MKCBzaW1OYW1lLCB2ZXJzaW9uLCBjaGVja291dERpciApO1xuXG4gICAgICAgICAgICAvLyBUaGlzIHNob3VsZCBiZSB0aGUgbGFzdCBmdW5jdGlvbiBjYWxsZWQgZm9yIHRoZSBwaGV0IGJyYW5kLlxuICAgICAgICAgICAgLy8gVGhpcyB0cmlnZ2VycyBhbiBhc3luY3Jvbm91cyB0YXNrIG9uIHRoZSB0b21jYXQvd2lja2V0IGFwcGxpY2F0aW9uIGFuZCBvbmx5IHdhaXRzIGZvciBhIHJlc3BvbnNlIHRoYXQgdGhlIHJlcXVlc3Qgd2FzIHJlY2VpdmVkLlxuICAgICAgICAgICAgLy8gRG8gbm90IGFzc3VtZSB0aGF0IHRoaXMgdGFzayBpcyBjb21wbGV0ZSBiZWNhdXNlIHdlIHVzZSBhd2FpdC5cbiAgICAgICAgICAgIGF3YWl0IG5vdGlmeVNlcnZlcigge1xuICAgICAgICAgICAgICBzaW1OYW1lOiBzaW1OYW1lLFxuICAgICAgICAgICAgICBlbWFpbDogZW1haWwsXG4gICAgICAgICAgICAgIGJyYW5kOiBicmFuZCxcbiAgICAgICAgICAgICAgbG9jYWxlczogbG9jYWxlcyxcbiAgICAgICAgICAgICAgdHJhbnNsYXRvcklkOiBpc1RyYW5zbGF0aW9uUmVxdWVzdCA/IHVzZXJJZCA6IHVuZGVmaW5lZFxuICAgICAgICAgICAgfSApO1xuICAgICAgICAgIH1cbiAgICAgICAgICBlbHNlIGlmICggYnJhbmQgPT09IGNvbnN0YW50cy5QSEVUX0lPX0JSQU5EICkge1xuICAgICAgICAgICAgY29uc3Qgc3VmZml4ID0gb3JpZ2luYWxWZXJzaW9uLnNwbGl0KCAnLScgKS5sZW5ndGggPj0gMiA/IG9yaWdpbmFsVmVyc2lvbi5zcGxpdCggJy0nIClbIDEgXSA6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAoIGNoaXBwZXJWZXJzaW9uLm1ham9yIDwgMiA/ICdwaGV0aW8nIDogJycgKTtcbiAgICAgICAgICAgIGNvbnN0IHBhcnNlZFZlcnNpb24gPSBTaW1WZXJzaW9uLnBhcnNlKCB2ZXJzaW9uLCAnJyApO1xuICAgICAgICAgICAgY29uc3Qgc2ltUGFja2FnZSA9IGF3YWl0IGxvYWRKU09OKCBgJHtzaW1SZXBvRGlyfS9wYWNrYWdlLmpzb25gICk7XG4gICAgICAgICAgICBjb25zdCBpZ25vcmVGb3JBdXRvbWF0ZWRNYWludGVuYW5jZVJlbGVhc2VzID0gISEoIHNpbVBhY2thZ2UgJiYgc2ltUGFja2FnZS5waGV0ICYmIHNpbVBhY2thZ2UucGhldC5pZ25vcmVGb3JBdXRvbWF0ZWRNYWludGVuYW5jZVJlbGVhc2VzICk7XG5cbiAgICAgICAgICAgIC8vIFRoaXMgdHJpZ2dlcnMgYW4gYXN5bmNyb25vdXMgdGFzayBvbiB0aGUgdG9tY2F0L3dpY2tldCBhcHBsaWNhdGlvbiBhbmQgb25seSB3YWl0cyBmb3IgYSByZXNwb25zZSB0aGF0IHRoZSByZXF1ZXN0IHdhcyByZWNlaXZlZC5cbiAgICAgICAgICAgIC8vIERvIG5vdCBhc3N1bWUgdGhhdCB0aGlzIHRhc2sgaXMgY29tcGxldGUgYmVjYXVzZSB3ZSB1c2UgYXdhaXQuXG4gICAgICAgICAgICBhd2FpdCBub3RpZnlTZXJ2ZXIoIHtcbiAgICAgICAgICAgICAgc2ltTmFtZTogc2ltTmFtZSxcbiAgICAgICAgICAgICAgZW1haWw6IGVtYWlsLFxuICAgICAgICAgICAgICBicmFuZDogYnJhbmQsXG4gICAgICAgICAgICAgIHBoZXRpb09wdGlvbnM6IHtcbiAgICAgICAgICAgICAgICBicmFuY2g6IGJyYW5jaCxcbiAgICAgICAgICAgICAgICBzdWZmaXg6IHN1ZmZpeCxcbiAgICAgICAgICAgICAgICB2ZXJzaW9uOiBwYXJzZWRWZXJzaW9uLFxuICAgICAgICAgICAgICAgIGlnbm9yZUZvckF1dG9tYXRlZE1haW50ZW5hbmNlUmVsZWFzZXM6IGlnbm9yZUZvckF1dG9tYXRlZE1haW50ZW5hbmNlUmVsZWFzZXNcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSApO1xuXG4gICAgICAgICAgICB3aW5zdG9uLmRlYnVnKCAnc2VydmVyIG5vdGlmaWVkJyApO1xuICAgICAgICAgICAgYXdhaXQgd3JpdGVQaGV0aW9IdGFjY2VzcyggdGFyZ2V0VmVyc2lvbkRpciwge1xuICAgICAgICAgICAgICBzaW1OYW1lOiBzaW1OYW1lLFxuICAgICAgICAgICAgICB2ZXJzaW9uOiBvcmlnaW5hbFZlcnNpb24sXG4gICAgICAgICAgICAgIGRpcmVjdG9yeTogY29uc3RhbnRzLlBIRVRfSU9fU0lNU19ESVJFQ1RPUlksXG4gICAgICAgICAgICAgIGNoZWNrb3V0RGlyOiBjaGVja291dERpcixcbiAgICAgICAgICAgICAgaXNQcm9kdWN0aW9uRGVwbG95OiB0cnVlXG4gICAgICAgICAgICB9ICk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIGF3YWl0IGFmdGVyRGVwbG95KCBgJHtidWlsZERpcn1gICk7XG4gIH1cbiAgY2F0Y2goIGVyciApIHtcbiAgICBhd2FpdCBhYm9ydEJ1aWxkKCBlcnIgKTtcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIHRhc2tXb3JrZXIoIHRhc2ssIHRhc2tDYWxsYmFjayApIHtcbiAgcnVuVGFzayggdGFzayApXG4gICAgLnRoZW4oICgpID0+IHtcbiAgICAgICAgdGFza0NhbGxiYWNrKCk7XG4gICAgICB9XG4gICAgKS5jYXRjaCggcmVhc29uID0+IHtcbiAgICB0YXNrQ2FsbGJhY2soIHJlYXNvbiApO1xuICB9ICk7XG59OyJdLCJuYW1lcyI6WyJjb25zdGFudHMiLCJyZXF1aXJlIiwiY3JlYXRlVHJhbnNsYXRpb25zWE1MIiwiZGV2RGVwbG95IiwiZXhlY3V0ZSIsImRlZmF1bHQiLCJmcyIsImdldExvY2FsZXMiLCJub3RpZnlTZXJ2ZXIiLCJyc3luYyIsIlNpbVZlcnNpb24iLCJ3aW5zdG9uIiwid3JpdGVQaGV0SHRhY2Nlc3MiLCJ3cml0ZVBoZXRpb0h0YWNjZXNzIiwiZGVwbG95SW1hZ2VzIiwicGVyc2lzdGVudFF1ZXVlIiwiUmVsZWFzZUJyYW5jaCIsImxvYWRKU09OIiwiYWJvcnRCdWlsZCIsImVyciIsImxvZyIsInN0YWNrIiwiRXJyb3IiLCJhZnRlckRlcGxveSIsImJ1aWxkRGlyIiwicnVuVGFzayIsIm9wdGlvbnMiLCJzdGFydFRhc2siLCJlIiwiZXJyb3IiLCJhcGkiLCJkZXBlbmRlbmNpZXMiLCJyZXBvcyIsImxvY2FsZXMiLCJzaW1OYW1lIiwidmVyc2lvbiIsImVtYWlsIiwiYnJhbmRzIiwic2VydmVycyIsInVzZXJJZCIsImJyYW5jaCIsIm1hdGNoIiwic2ltTmFtZVJlZ2V4IiwidGVzdCIsImtleSIsImhhc093blByb3BlcnR5IiwidmFsdWUiLCJPYmplY3QiLCJzaGEiLCJvcmlnaW5hbFZlcnNpb24iLCJ2ZXJzaW9uTWF0Y2giLCJsZW5ndGgiLCJpbmNsdWRlcyIsInJlbGVhc2VCcmFuY2giLCJ1cGRhdGVDaGVja291dCIsImNoaXBwZXJWZXJzaW9uIiwiZ2V0Q2hpcHBlclZlcnNpb24iLCJkZWJ1ZyIsInRvU3RyaW5nIiwibWFqb3IiLCJtaW5vciIsImNoZWNrb3V0RGlyZWN0b3J5IiwiZ2V0Q2hlY2tvdXREaXJlY3RvcnkiLCJwYWNrYWdlSlNPTiIsIkpTT04iLCJwYXJzZSIsInJlYWRGaWxlU3luYyIsInBhY2thZ2VWZXJzaW9uIiwibG9jYWxlc0FycmF5Iiwic3BsaXQiLCJpc1RyYW5zbGF0aW9uUmVxdWVzdCIsImJ1aWxkIiwiY2xlYW4iLCJidWlsZEZvclNlcnZlciIsImxpbnQiLCJhbGxIVE1MIiwiUEhFVF9CUkFORCIsInN0cmluZ2lmeSIsImNoZWNrb3V0RGlyIiwic2ltUmVwb0RpciIsImluZGV4T2YiLCJERVZfU0VSVkVSIiwiaW5mbyIsIlBIRVRfSU9fQlJBTkQiLCJodGFjY2Vzc0xvY2F0aW9uIiwiaXNQcm9kdWN0aW9uRGVwbG95IiwiUFJPRFVDVElPTl9TRVJWRVIiLCJ0YXJnZXRWZXJzaW9uRGlyIiwidGFyZ2V0U2ltRGlyIiwiaSIsImJyYW5kIiwiSFRNTF9TSU1TX0RJUkVDVE9SWSIsInBoZXRCdWlsZERpciIsImZpbGVzIiwicmVhZGRpclN5bmMiLCJmaWxlbmFtZSIsIm5ld0ZpbGVuYW1lIiwicmVwbGFjZSIsIlBIRVRfSU9fU0lNU19ESVJFQ1RPUlkiLCJwcm9taXNlcyIsIm1rZGlyIiwicmVjdXJzaXZlIiwiY29kZSIsInNvdXJjZURpciIsIlByb21pc2UiLCJyZXNvbHZlIiwicmVqZWN0IiwiZmxhZ3MiLCJzZXQiLCJzb3VyY2UiLCJkZXN0aW5hdGlvbiIsIm91dHB1dCIsInN0ZG91dCIsInN0ZGVyciIsImNtZCIsInNpbXVsYXRpb24iLCJ0cmFuc2xhdG9ySWQiLCJ1bmRlZmluZWQiLCJzdWZmaXgiLCJwYXJzZWRWZXJzaW9uIiwic2ltUGFja2FnZSIsImlnbm9yZUZvckF1dG9tYXRlZE1haW50ZW5hbmNlUmVsZWFzZXMiLCJwaGV0IiwicGhldGlvT3B0aW9ucyIsImRpcmVjdG9yeSIsIm1vZHVsZSIsImV4cG9ydHMiLCJ0YXNrV29ya2VyIiwidGFzayIsInRhc2tDYWxsYmFjayIsInRoZW4iLCJjYXRjaCIsInJlYXNvbiJdLCJtYXBwaW5ncyI6IkFBQUEsc0RBQXNEO0FBQ3RELHlEQUF5RDs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FB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