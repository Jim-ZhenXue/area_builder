// Copyright 2018, University of Colorado Boulder
/**
 * Represents a simulation release branch for deployment
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
const buildLocal = require('./buildLocal');
const buildServerRequest = require('./buildServerRequest');
const ChipperVersion = require('./ChipperVersion');
const checkoutMain = require('./checkoutMain');
const checkoutTarget = require('./checkoutTarget');
const createDirectory = require('./createDirectory');
const execute = require('./execute').default;
const getActiveSims = require('./getActiveSims');
const getBranchDependencies = require('./getBranchDependencies');
const getBranches = require('./getBranches');
const getBuildArguments = require('./getBuildArguments');
const getDependencies = require('./getDependencies');
const getBranchMap = require('./getBranchMap');
const getBranchVersion = require('./getBranchVersion');
const getFileAtBranch = require('./getFileAtBranch');
const getRepoVersion = require('./getRepoVersion');
const gitCheckout = require('./gitCheckout');
const gitCatFile = require('./gitCatFile');
const gitCheckoutDirectory = require('./gitCheckoutDirectory');
const gitCloneOrFetchDirectory = require('./gitCloneOrFetchDirectory');
const gitFirstDivergingCommit = require('./gitFirstDivergingCommit');
const gitIsAncestor = require('./gitIsAncestor');
const chipperSupportsOutputJSGruntTasks = require('./chipperSupportsOutputJSGruntTasks');
const gitPull = require('./gitPull');
const gitPullDirectory = require('./gitPullDirectory');
const gitRevParse = require('./gitRevParse');
const gitTimestamp = require('./gitTimestamp');
const gruntCommand = require('./gruntCommand');
const loadJSON = require('./loadJSON');
const npmUpdateDirectory = require('./npmUpdateDirectory');
const puppeteerLoad = require('./puppeteerLoad');
const simMetadata = require('./simMetadata');
const simPhetioMetadata = require('./simPhetioMetadata');
const SimVersion = require('../browser-and-node/SimVersion').default;
const withServer = require('./withServer');
const assert = require('assert');
const fs = require('fs');
const winston = require('winston');
const _ = require('lodash');
const axios = require('axios');
module.exports = function() {
    const MAINTENANCE_DIRECTORY = '../release-branches';
    let ReleaseBranch = class ReleaseBranch {
        /**
     * Convert into a plain JS object meant for JSON serialization.
     * @public
     *
     * @returns {Object}
     */ serialize() {
            return {
                repo: this.repo,
                branch: this.branch,
                brands: this.brands,
                isReleased: this.isReleased
            };
        }
        /**
     * Takes a serialized form of the ReleaseBranch and returns an actual instance.
     * @public
     *
     * @param {Object}
     * @returns {ReleaseBranch}
     */ static deserialize({ repo, branch, brands, isReleased }) {
            return new ReleaseBranch(repo, branch, brands, isReleased);
        }
        /**
     * Returns whether the two release branches contain identical information.
     * @public
     *
     * @param {ReleaseBranch} releaseBranch
     * @returns {boolean}
     */ equals(releaseBranch) {
            return this.repo === releaseBranch.repo && this.branch === releaseBranch.branch && this.brands.join(',') === releaseBranch.brands.join(',') && this.isReleased === releaseBranch.isReleased;
        }
        /**
     * Converts it to a (debuggable) string form.
     * @public
     *
     * @returns {string}
     */ toString() {
            return `${this.repo} ${this.branch} ${this.brands.join(',')}${this.isReleased ? '' : ' (unpublished)'}`;
        }
        /**
     * @public
     *
     * @param repo {string}
     * @param branch {string}
     * @returns {string}
     */ static getCheckoutDirectory(repo, branch) {
            return `${MAINTENANCE_DIRECTORY}/${repo}-${branch}`;
        }
        /**
     * Returns the maintenance directory, for things that want to use it directly.
     * @public
     *
     * @returns {string}
     */ static getMaintenanceDirectory() {
            return MAINTENANCE_DIRECTORY;
        }
        /**
     * Returns the path (relative to the repo) to the built phet-brand HTML file
     * @public
     *
     * @returns {Promise<string>}
     */ getLocalPhetBuiltHTMLPath() {
            var _this = this;
            return _async_to_generator(function*() {
                const usesChipper2 = yield _this.usesChipper2();
                return `build/${usesChipper2 ? 'phet/' : ''}${_this.repo}_en${usesChipper2 ? '_phet' : ''}.html`;
            })();
        }
        /**
     * Returns the path (relative to the repo) to the built phet-io-brand HTML file
     * @public
     *
     * @returns {Promise<string>}
     */ getLocalPhetIOBuiltHTMLPath() {
            var _this = this;
            return _async_to_generator(function*() {
                const usesChipper2 = yield _this.usesChipper2();
                return `build/${usesChipper2 ? 'phet-io/' : ''}${_this.repo}${usesChipper2 ? '_all_phet-io' : '_en-phetio'}.html`;
            })();
        }
        /**
     * Returns the query parameter to use for activating phet-io standalone mode
     * @public
     *
     * @returns {Promise<string>}
     */ getPhetioStandaloneQueryParameter() {
            var _this = this;
            return _async_to_generator(function*() {
                return (yield _this.usesOldPhetioStandalone()) ? 'phet-io.standalone' : 'phetioStandalone';
            })();
        }
        /**
     * @public
     *
     * @returns {ChipperVersion}
     */ getChipperVersion() {
            const checkoutDirectory = ReleaseBranch.getCheckoutDirectory(this.repo, this.branch);
            return ChipperVersion.getFromPackageJSON(JSON.parse(fs.readFileSync(`${checkoutDirectory}/chipper/package.json`, 'utf8')));
        }
        /**
     * @public
     */ updateCheckout(overrideDependencies = {}) {
            var _this = this;
            return _async_to_generator(function*() {
                winston.info(`updating checkout for ${_this.toString()}`);
                if (!fs.existsSync(MAINTENANCE_DIRECTORY)) {
                    winston.info(`creating directory ${MAINTENANCE_DIRECTORY}`);
                    yield createDirectory(MAINTENANCE_DIRECTORY);
                }
                const checkoutDirectory = ReleaseBranch.getCheckoutDirectory(_this.repo, _this.branch);
                if (!fs.existsSync(checkoutDirectory)) {
                    winston.info(`creating directory ${checkoutDirectory}`);
                    yield createDirectory(checkoutDirectory);
                }
                yield gitCloneOrFetchDirectory(_this.repo, checkoutDirectory);
                yield gitCheckoutDirectory(_this.branch, `${checkoutDirectory}/${_this.repo}`);
                yield gitPullDirectory(`${checkoutDirectory}/${_this.repo}`);
                const dependenciesOnBranchTip = yield loadJSON(`${checkoutDirectory}/${_this.repo}/dependencies.json`);
                dependenciesOnBranchTip.babel = {
                    sha: buildLocal.babelBranch,
                    branch: buildLocal.babelBranch
                };
                const dependencyRepos = _.uniq([
                    ...Object.keys(dependenciesOnBranchTip),
                    ...Object.keys(overrideDependencies)
                ].filter((repo)=>repo !== 'comment'));
                yield Promise.all(dependencyRepos.map(/*#__PURE__*/ _async_to_generator(function*(repo) {
                    const repoPwd = `${checkoutDirectory}/${repo}`;
                    yield gitCloneOrFetchDirectory(repo, checkoutDirectory);
                    const sha = overrideDependencies[repo] ? overrideDependencies[repo].sha : dependenciesOnBranchTip[repo].sha;
                    yield gitCheckoutDirectory(sha, repoPwd);
                    // Pull babel, since we don't give it a specific SHA (just a branch),
                    // see https://github.com/phetsims/perennial/issues/326
                    if (repo === 'babel') {
                        yield gitPullDirectory(repoPwd);
                    }
                    if (repo === 'chipper' || repo === 'perennial-alias' || repo === _this.repo) {
                        winston.info(`npm ${repo} in ${checkoutDirectory}`);
                        yield npmUpdateDirectory(repoPwd);
                    }
                })));
                // Perennial can be a nice manual addition in each dir, in case you need to go in and run commands to these
                // branches manually (like build or checkout or update). No need to npm install, you can do that yourself if needed.
                yield gitCloneOrFetchDirectory('perennial', checkoutDirectory);
                yield gitPullDirectory(`${checkoutDirectory}/perennial`);
            })();
        }
        /**
     * @public
     *
     * @param {Object} [options] - optional parameters for getBuildArguments
     */ build(options) {
            var _this = this;
            return _async_to_generator(function*() {
                const checkoutDirectory = ReleaseBranch.getCheckoutDirectory(_this.repo, _this.branch);
                const repoDirectory = `${checkoutDirectory}/${_this.repo}`;
                const args = getBuildArguments(_this.getChipperVersion(), _.merge({
                    brands: _this.brands,
                    allHTML: true,
                    debugHTML: true,
                    lint: false,
                    locales: '*'
                }, options));
                winston.info(`building ${checkoutDirectory} with grunt ${args.join(' ')}`);
                yield execute(gruntCommand, args, repoDirectory);
            })();
        }
        /**
     * @public
     */ transpile() {
            var _this = this;
            return _async_to_generator(function*() {
                const checkoutDirectory = ReleaseBranch.getCheckoutDirectory(_this.repo, _this.branch);
                const repoDirectory = `${checkoutDirectory}/${_this.repo}`;
                if (chipperSupportsOutputJSGruntTasks()) {
                    winston.info(`transpiling ${checkoutDirectory}`);
                    // We might not be able to run this command!
                    yield execute(gruntCommand, [
                        'output-js-project',
                        '--silent'
                    ], repoDirectory, {
                        errors: 'resolve'
                    });
                }
            })();
        }
        /**
     * @public
     *
     * @returns {Promise<string|null>} - Error string, or null if no error
     */ checkUnbuilt() {
            var _this = this;
            return _async_to_generator(function*() {
                try {
                    return yield withServer(/*#__PURE__*/ _async_to_generator(function*(port) {
                        const url = `http://localhost:${port}/${_this.repo}/${_this.repo}_en.html?brand=phet&ea&fuzzMouse&fuzzTouch`;
                        try {
                            return yield puppeteerLoad(url, {
                                waitAfterLoad: 20000
                            });
                        } catch (e) {
                            return `Failure for ${url}: ${e}`;
                        }
                    }), {
                        path: ReleaseBranch.getCheckoutDirectory(_this.repo, _this.branch)
                    });
                } catch (e) {
                    return `[ERROR] Failure to check: ${e}`;
                }
            })();
        }
        /**
     * @public
     *
     * @returns {Promise<string|null>} - Error string, or null if no error
     */ checkBuilt() {
            var _this = this;
            return _async_to_generator(function*() {
                try {
                    const usesChipper2 = yield _this.usesChipper2();
                    return yield withServer(/*#__PURE__*/ _async_to_generator(function*(port) {
                        const url = `http://localhost:${port}/${_this.repo}/build/${usesChipper2 ? 'phet/' : ''}${_this.repo}_en${usesChipper2 ? '_phet' : ''}.html?fuzzMouse&fuzzTouch`;
                        try {
                            return puppeteerLoad(url, {
                                waitAfterLoad: 20000
                            });
                        } catch (error) {
                            return `Failure for ${url}: ${error}`;
                        }
                    }), {
                        path: ReleaseBranch.getCheckoutDirectory(_this.repo, _this.branch)
                    });
                } catch (e) {
                    return `[ERROR] Failure to check: ${e}`;
                }
            })();
        }
        /**
     * Checks this release branch out.
     * @public
     *
     * @param {boolean} includeNpmUpdate
     */ checkout(includeNpmUpdate) {
            var _this = this;
            return _async_to_generator(function*() {
                yield checkoutTarget(_this.repo, _this.branch, includeNpmUpdate);
            })();
        }
        /**
     * Whether this release branch includes the given SHA for the given repo dependency. Will be false if it doesn't
     * depend on this repository.
     * @public
     *
     * @param {string} repo
     * @param {string} sha
     * @returns {Promise.<boolean>}
     */ includesSHA(repo, sha) {
            var _this = this;
            return _async_to_generator(function*() {
                let result = false;
                yield gitCheckout(_this.repo, _this.branch);
                const dependencies = yield getDependencies(_this.repo);
                if (dependencies[repo]) {
                    const currentSHA = dependencies[repo].sha;
                    result = sha === currentSHA || (yield gitIsAncestor(repo, sha, currentSHA));
                }
                yield gitCheckout(_this.repo, 'main');
                return result;
            })();
        }
        /**
     * Whether this release branch does NOT include the given SHA for the given repo dependency. Will be false if it doesn't
     * depend on this repository.
     * @public
     *
     * @param {string} repo
     * @param {string} sha
     * @returns {Promise.<boolean>}
     */ isMissingSHA(repo, sha) {
            var _this = this;
            return _async_to_generator(function*() {
                let result = false;
                yield gitCheckout(_this.repo, _this.branch);
                const dependencies = yield getDependencies(_this.repo);
                if (dependencies[repo]) {
                    const currentSHA = dependencies[repo].sha;
                    result = sha !== currentSHA && !(yield gitIsAncestor(repo, sha, currentSHA));
                }
                yield gitCheckout(_this.repo, 'main');
                return result;
            })();
        }
        /**
     * The SHA at which this release branch's main repository diverged from main.
     * @public
     *
     * @returns {Promise.<string>}
     */ getDivergingSHA() {
            var _this = this;
            return _async_to_generator(function*() {
                yield gitCheckout(_this.repo, _this.branch);
                yield gitPull(_this.repo);
                yield gitCheckout(_this.repo, 'main');
                return gitFirstDivergingCommit(_this.repo, _this.branch, 'main');
            })();
        }
        /**
     * The timestamp at which this release branch's main repository diverged from main.
     * @public
     *
     * @returns {Promise.<number>}
     */ getDivergingTimestamp() {
            var _this = this;
            return _async_to_generator(function*() {
                return gitTimestamp(_this.repo, (yield _this.getDivergingSHA()));
            })();
        }
        /**
     * Returns the dependencies.json for this release branch
     * @public
     *
     * @returns {Promise}
     */ getDependencies() {
            var _this = this;
            return _async_to_generator(function*() {
                return getBranchDependencies(_this.repo, _this.branch);
            })();
        }
        /**
     * Returns the SimVersion for this release branch
     * @public
     *
     * @returns {Promise<SimVersion>}
     */ getSimVersion() {
            var _this = this;
            return _async_to_generator(function*() {
                return getBranchVersion(_this.repo, _this.branch);
            })();
        }
        /**
     * Returns a list of status messages of anything out-of-the-ordinary
     * @public
     *
     * @returns {Promise.<Array.<string>>}
     */ getStatus(getBranchMapAsyncCallback = getBranchMap) {
            var _this = this;
            return _async_to_generator(function*() {
                const results = [];
                const dependencies = yield _this.getDependencies();
                const dependencyNames = Object.keys(dependencies).filter((key)=>{
                    return key !== 'comment' && key !== _this.repo && key !== 'phet-io-wrapper-sonification';
                });
                // Check our own dependency
                if (dependencies[_this.repo]) {
                    try {
                        const currentCommit = yield gitRevParse(_this.repo, _this.branch);
                        const previousCommit = yield gitRevParse(_this.repo, `${currentCommit}^`);
                        if (dependencies[_this.repo].sha !== previousCommit) {
                            results.push('[INFO] Potential changes (dependency is not previous commit)');
                            results.push(`[INFO] ${currentCommit} ${previousCommit} ${dependencies[_this.repo].sha}`);
                        }
                        if ((yield _this.getSimVersion()).testType === 'rc' && _this.isReleased) {
                            results.push('[INFO] Release candidate version detected (see if there is a QA issue)');
                        }
                    } catch (e) {
                        results.push(`[ERROR] Failure to check current/previous commit: ${e.message}`);
                    }
                } else {
                    results.push('[WARNING] Own repository not included in dependencies');
                }
                for (const dependency of dependencyNames){
                    const potentialReleaseBranch = `${_this.repo}-${_this.branch}`;
                    const branchMap = yield getBranchMapAsyncCallback(dependency);
                    if (Object.keys(branchMap).includes(potentialReleaseBranch)) {
                        if (dependencies[dependency].sha !== branchMap[potentialReleaseBranch]) {
                            results.push(`[WARNING] Dependency mismatch for ${dependency} on branch ${potentialReleaseBranch}`);
                        }
                    }
                }
                return results;
            })();
        }
        /**
     * Returns whether the sim is compatible with ES6 features
     * @public
     *
     * @returns {Promise<boolean>}
     */ usesES6() {
            var _this = this;
            return _async_to_generator(function*() {
                const dependencies = yield _this.getDependencies();
                const sha = dependencies.chipper.sha;
                return gitIsAncestor('chipper', '80b4ad62cd8f2057b844f18d3c00cf5c0c89ed8d', sha);
            })();
        }
        /**
     * Returns whether this sim uses initialize-globals based query parameters
     * @public
     *
     * If true:
     *   phet.chipper.queryParameters.WHATEVER
     *   AND it needs to be in the schema
     *
     * If false:
     *   phet.chipper.getQueryParameter( 'WHATEVER' )
     *   FLAGS should use !!phet.chipper.getQueryParameter( 'WHATEVER' )
     *
     * @returns {Promise<boolean>}
     */ usesInitializeGlobalsQueryParameters() {
            var _this = this;
            return _async_to_generator(function*() {
                const dependencies = yield _this.getDependencies();
                const sha = dependencies.chipper.sha;
                return gitIsAncestor('chipper', 'e454f88ff51d1e3fabdb3a076d7407a2a9e9133c', sha);
            })();
        }
        /**
     * Returns whether phet-io.standalone is the correct phet-io query parameter (otherwise it's the newer
     * phetioStandalone).
     * Looks for the presence of https://github.com/phetsims/chipper/commit/4814d6966c54f250b1c0f3909b71f2b9cfcc7665.
     * @public
     *
     * @returns {Promise.<boolean>}
     */ usesOldPhetioStandalone() {
            var _this = this;
            return _async_to_generator(function*() {
                const dependencies = yield _this.getDependencies();
                const sha = dependencies.chipper.sha;
                return !(yield gitIsAncestor('chipper', '4814d6966c54f250b1c0f3909b71f2b9cfcc7665', sha));
            })();
        }
        /**
     * Returns whether the relativeSimPath query parameter is used for wrappers (instead of launchLocalVersion).
     * Looks for the presence of https://github.com/phetsims/phet-io/commit/e3fc26079358d86074358a6db3ebaf1af9725632
     * @public
     *
     * @returns {Promise.<boolean>}
     */ usesRelativeSimPath() {
            var _this = this;
            return _async_to_generator(function*() {
                const dependencies = yield _this.getDependencies();
                if (!dependencies['phet-io']) {
                    return true; // Doesn't really matter now, does it?
                }
                const sha = dependencies['phet-io'].sha;
                return gitIsAncestor('phet-io', 'e3fc26079358d86074358a6db3ebaf1af9725632', sha);
            })();
        }
        /**
     * Returns whether phet-io Studio is being used instead of deprecated instance proxies wrapper.
     * @public
     *
     * @returns {Promise.<boolean>}
     */ usesPhetioStudio() {
            var _this = this;
            return _async_to_generator(function*() {
                const dependencies = yield _this.getDependencies();
                const sha = dependencies.chipper.sha;
                return gitIsAncestor('chipper', '7375f6a57b5874b6bbf97a54c9a908f19f88d38f', sha);
            })();
        }
        /**
     * Returns whether phet-io Studio top-level (index.html) is used instead of studio.html.
     * @public
     *
     * @returns {Promise.<boolean>}
     */ usesPhetioStudioIndex() {
            var _this = this;
            return _async_to_generator(function*() {
                const dependencies = yield _this.getDependencies();
                const dependency = dependencies['phet-io-wrappers'];
                if (!dependency) {
                    return false;
                }
                const sha = dependency.sha;
                return gitIsAncestor('phet-io-wrappers', '7ec1a04a70fb9707b381b8bcab3ad070815ef7fe', sha);
            })();
        }
        /**
     * Returns whether the sim is a "Hydrogen" phet-io sim.
     * @public
     *
     * @returns {Promise<boolean>}
     */ isPhetioHydrogen() {
            var _this = this;
            return _async_to_generator(function*() {
                return _this.brands.includes('phet-io') && _this.includesSHA('phet-io-wrappers', '7e8d97020c6451f68e898ae83aa43593b555137f');
            })();
        }
        /**
     * Returns whether an additional folder exists in the build directory of the sim based on the brand.
     * @public
     *
     * @returns {Promise.<boolean>}
     */ usesChipper2() {
            var _this = this;
            return _async_to_generator(function*() {
                const dependencies = yield _this.getDependencies();
                const chipperPackageJSON = JSON.parse((yield gitCatFile('chipper', 'package.json', dependencies.chipper.sha)));
                const chipperVersion = ChipperVersion.getFromPackageJSON(chipperPackageJSON);
                return chipperVersion.major !== 0 || chipperVersion.minor !== 0;
            })();
        }
        /**
     * Runs a predicate function with the contents of a specific file's contents in the release branch (with false if
     * it doesn't exist).
     * @public
     *
     * @param {string} file
     * @param {function(contents:string):boolean} predicate
     * @returns {Promise.<boolean>}
     */ withFile(file, predicate) {
            var _this = this;
            return _async_to_generator(function*() {
                yield _this.checkout(false);
                if (fs.existsSync(file)) {
                    const contents = fs.readFileSync(file, 'utf-8');
                    return predicate(contents);
                }
                return false;
            })();
        }
        /**
     * Re-runs a production deploy for a specific branch (based on the SHAs at the tip of the release branch)
     * @public
     */ redeployBranchTipToProduction(locales = '*') {
            var _this = this;
            return _async_to_generator(function*() {
                if (_this.isReleased) {
                    yield checkoutTarget(_this.repo, _this.branch, false);
                    const version = yield getRepoVersion(_this.repo);
                    const dependencies = yield getDependencies(_this.repo);
                    yield checkoutMain(_this.repo, false);
                    yield buildServerRequest(_this.repo, version, _this.branch, dependencies, {
                        locales: locales,
                        brands: _this.brands,
                        servers: [
                            'production'
                        ]
                    });
                } else {
                    throw new Error('Should not redeploy a non-released branch');
                }
            })();
        }
        /**
     * Re-runs a production deploy for a specific branch (based on the SHAs that were most recently production deployed)
     * @public
     */ redeployLastDeployedSHAsToProduction(locales = '*') {
            var _this = this;
            return _async_to_generator(function*() {
                if (!_this.isReleased) {
                    throw new Error('Should not redeploy a non-released branch');
                }
                if (_this.branch.includes('-phetio')) {
                    throw new Error('unsupported suffix -phetio');
                }
                let url; // string
                let version; // SimVersion
                if (_this.brands.includes('phet')) {
                    const metadata = yield simMetadata({
                        locale: 'en',
                        simulation: _this.repo
                    });
                    const project = metadata.projects.find((project)=>project.name === `html/${_this.repo}`);
                    version = SimVersion.parse(project.version.string);
                    url = `https://phet.colorado.edu/sims/html/${_this.repo}/${version.toString()}/dependencies.json`;
                } else if (_this.brands.includes('phet-io')) {
                    const metadata = yield simPhetioMetadata({
                        active: true
                    });
                    const localVersion = yield _this.getSimVersion();
                    const simData = metadata.find((simData)=>simData.name === _this.repo && simData.versionMajor === localVersion.major && simData.versionMinor === localVersion.minor);
                    version = new SimVersion(simData.versionMajor, simData.versionMinor, simData.versionMaintenance);
                    url = `https://phet-io.colorado.edu/sims/${_this.repo}/${version.major}.${version.minor}/dependencies.json`;
                } else {
                    throw new Error('unknown deployed brand');
                }
                const dependencies = (yield axios.get(url)).data;
                if (dependencies) {
                    yield buildServerRequest(_this.repo, version, _this.branch, dependencies, {
                        locales: locales,
                        brands: _this.brands,
                        servers: [
                            'production'
                        ]
                    });
                } else {
                    throw new Error('no dependencies');
                }
            })();
        }
        /**
     * Redeploys all last deployed SHAs to production for all maintenance branches.
     * @public
     */ static redeployAllLastDeployedSHAsToProduction(locales = '*') {
            return _async_to_generator(function*() {
                const releaseBranches = yield ReleaseBranch.getAllMaintenanceBranches();
                for (const releaseBranch of releaseBranches){
                    console.log(releaseBranch.toString());
                    if (releaseBranch.isReleased && !releaseBranch.branch.includes('-phetio')) {
                        yield releaseBranch.redeployLastDeployedSHAsToProduction(locales);
                    }
                }
            })();
        }
        /**
     * Gets a list of ReleaseBranches which would be potential candidates for a maintenance release. This includes:
     * - All published phet brand release branches (from metadata)
     * - All published phet-io brand release branches (from metadata)
     * - All unpublished local release branches
     *
     * @public
     * @returns {Promise.<ReleaseBranch[]>}
     * @rejects {ExecuteError}
     */ static getAllMaintenanceBranches() {
            return _async_to_generator(function*() {
                winston.debug('retrieving available sim branches');
                console.log('loading phet brand ReleaseBranches');
                const simMetadataResult = yield simMetadata({
                    type: 'html'
                });
                // Released phet branches
                const phetBranches = simMetadataResult.projects.map((simData)=>{
                    const repo = simData.name.slice(simData.name.indexOf('/') + 1);
                    const branch = `${simData.version.major}.${simData.version.minor}`;
                    return new ReleaseBranch(repo, branch, [
                        'phet'
                    ], true);
                });
                console.log('loading phet-io brand ReleaseBranches');
                const phetioBranches = (yield simPhetioMetadata({
                    active: true,
                    latest: true
                })).filter((simData)=>simData.active && simData.latest).map((simData)=>{
                    let branch = `${simData.versionMajor}.${simData.versionMinor}`;
                    if (simData.versionSuffix.length) {
                        branch += `-${simData.versionSuffix}`; // additional dash required
                    }
                    return new ReleaseBranch(simData.name, branch, [
                        'phet-io'
                    ], true);
                });
                console.log('loading unreleased ReleaseBranches');
                const unreleasedBranches = [];
                for (const repo of getActiveSims()){
                    // Exclude explicitly excluded repos
                    if (JSON.parse(fs.readFileSync(`../${repo}/package.json`, 'utf8')).phet.ignoreForAutomatedMaintenanceReleases) {
                        continue;
                    }
                    const branches = yield getBranches(repo);
                    const releasedBranches = phetBranches.concat(phetioBranches);
                    for (const branch of branches){
                        // We aren't unreleased if we're included in either phet or phet-io metadata.
                        // See https://github.com/phetsims/balancing-act/issues/118
                        if (releasedBranches.filter((releaseBranch)=>releaseBranch.repo === repo && releaseBranch.branch === branch).length) {
                            continue;
                        }
                        const match = branch.match(/^(\d+)\.(\d+)$/);
                        if (match) {
                            const major = Number(match[1]);
                            const minor = Number(match[2]);
                            // Assumption that there is no phet-io brand sim that isn't also released with phet brand
                            const projectMetadata = simMetadataResult.projects.find((project)=>project.name === `html/${repo}`) || null;
                            const productionVersion = projectMetadata ? projectMetadata.version : null;
                            if (!productionVersion || major > productionVersion.major || major === productionVersion.major && minor > productionVersion.minor) {
                                // Do a checkout so we can determine supported brands
                                const packageObject = JSON.parse((yield getFileAtBranch(repo, branch, 'package.json')));
                                const includesPhetio = packageObject.phet && packageObject.phet.supportedBrands && packageObject.phet.supportedBrands.includes('phet-io');
                                const brands = [
                                    'phet',
                                    ...includesPhetio ? [
                                        'phet-io'
                                    ] : []
                                ];
                                if (!packageObject.phet.ignoreForAutomatedMaintenanceReleases) {
                                    unreleasedBranches.push(new ReleaseBranch(repo, branch, brands, false));
                                }
                            }
                        }
                    }
                }
                const allReleaseBranches = ReleaseBranch.combineLists([
                    ...phetBranches,
                    ...phetioBranches,
                    ...unreleasedBranches
                ]);
                // FAMB 2.3-phetio keeps ending up in the MR list when we don't want it to, see https://github.com/phetsims/phet-io/issues/1957.
                return allReleaseBranches.filter((rb)=>!(rb.repo === 'forces-and-motion-basics' && rb.branch === '2.3-phetio'));
            })();
        }
        /**
     * Combines multiple matching ReleaseBranches into one where appropriate, and sorts. For example, two ReleaseBranches
     * of the same repo but for different brands are combined into a single ReleaseBranch with multiple brands.
     * @public
     *
     * @param {Array.<ReleaseBranch>} simBranches
     * @returns {Array.<ReleaseBranch>}
     */ static combineLists(simBranches) {
            const resultBranches = [];
            for (const simBranch of simBranches){
                let foundBranch = false;
                for (const resultBranch of resultBranches){
                    if (simBranch.repo === resultBranch.repo && simBranch.branch === resultBranch.branch) {
                        foundBranch = true;
                        resultBranch.brands = [
                            ...resultBranch.brands,
                            ...simBranch.brands
                        ];
                        break;
                    }
                }
                if (!foundBranch) {
                    resultBranches.push(simBranch);
                }
            }
            resultBranches.sort((a, b)=>{
                if (a.repo !== b.repo) {
                    return a.repo < b.repo ? -1 : 1;
                }
                if (a.branch !== b.branch) {
                    return a.branch < b.branch ? -1 : 1;
                }
                return 0;
            });
            return resultBranches;
        }
        /**
     * @public
     * @constructor
     *
     * @param {string} repo
     * @param {string} branch
     * @param {Array.<string>} brands
     * @param {boolean} isReleased
     */ constructor(repo, branch, brands, isReleased){
            assert(typeof repo === 'string');
            assert(typeof branch === 'string');
            assert(Array.isArray(brands));
            assert(typeof isReleased === 'boolean');
            // @public {string}
            this.repo = repo;
            this.branch = branch;
            // @public {Array.<string>}
            this.brands = brands;
            // @public {boolean}
            this.isReleased = isReleased;
        }
    };
    return ReleaseBranch;
}();

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3BlcmVubmlhbC1hbGlhcy9qcy9jb21tb24vUmVsZWFzZUJyYW5jaC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxOCwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbi8qKlxuICogUmVwcmVzZW50cyBhIHNpbXVsYXRpb24gcmVsZWFzZSBicmFuY2ggZm9yIGRlcGxveW1lbnRcbiAqXG4gKiBAYXV0aG9yIEpvbmF0aGFuIE9sc29uIDxqb25hdGhhbi5vbHNvbkBjb2xvcmFkby5lZHU+XG4gKi9cblxuY29uc3QgYnVpbGRMb2NhbCA9IHJlcXVpcmUoICcuL2J1aWxkTG9jYWwnICk7XG5jb25zdCBidWlsZFNlcnZlclJlcXVlc3QgPSByZXF1aXJlKCAnLi9idWlsZFNlcnZlclJlcXVlc3QnICk7XG5jb25zdCBDaGlwcGVyVmVyc2lvbiA9IHJlcXVpcmUoICcuL0NoaXBwZXJWZXJzaW9uJyApO1xuY29uc3QgY2hlY2tvdXRNYWluID0gcmVxdWlyZSggJy4vY2hlY2tvdXRNYWluJyApO1xuY29uc3QgY2hlY2tvdXRUYXJnZXQgPSByZXF1aXJlKCAnLi9jaGVja291dFRhcmdldCcgKTtcbmNvbnN0IGNyZWF0ZURpcmVjdG9yeSA9IHJlcXVpcmUoICcuL2NyZWF0ZURpcmVjdG9yeScgKTtcbmNvbnN0IGV4ZWN1dGUgPSByZXF1aXJlKCAnLi9leGVjdXRlJyApLmRlZmF1bHQ7XG5jb25zdCBnZXRBY3RpdmVTaW1zID0gcmVxdWlyZSggJy4vZ2V0QWN0aXZlU2ltcycgKTtcbmNvbnN0IGdldEJyYW5jaERlcGVuZGVuY2llcyA9IHJlcXVpcmUoICcuL2dldEJyYW5jaERlcGVuZGVuY2llcycgKTtcbmNvbnN0IGdldEJyYW5jaGVzID0gcmVxdWlyZSggJy4vZ2V0QnJhbmNoZXMnICk7XG5jb25zdCBnZXRCdWlsZEFyZ3VtZW50cyA9IHJlcXVpcmUoICcuL2dldEJ1aWxkQXJndW1lbnRzJyApO1xuY29uc3QgZ2V0RGVwZW5kZW5jaWVzID0gcmVxdWlyZSggJy4vZ2V0RGVwZW5kZW5jaWVzJyApO1xuY29uc3QgZ2V0QnJhbmNoTWFwID0gcmVxdWlyZSggJy4vZ2V0QnJhbmNoTWFwJyApO1xuY29uc3QgZ2V0QnJhbmNoVmVyc2lvbiA9IHJlcXVpcmUoICcuL2dldEJyYW5jaFZlcnNpb24nICk7XG5jb25zdCBnZXRGaWxlQXRCcmFuY2ggPSByZXF1aXJlKCAnLi9nZXRGaWxlQXRCcmFuY2gnICk7XG5jb25zdCBnZXRSZXBvVmVyc2lvbiA9IHJlcXVpcmUoICcuL2dldFJlcG9WZXJzaW9uJyApO1xuY29uc3QgZ2l0Q2hlY2tvdXQgPSByZXF1aXJlKCAnLi9naXRDaGVja291dCcgKTtcbmNvbnN0IGdpdENhdEZpbGUgPSByZXF1aXJlKCAnLi9naXRDYXRGaWxlJyApO1xuY29uc3QgZ2l0Q2hlY2tvdXREaXJlY3RvcnkgPSByZXF1aXJlKCAnLi9naXRDaGVja291dERpcmVjdG9yeScgKTtcbmNvbnN0IGdpdENsb25lT3JGZXRjaERpcmVjdG9yeSA9IHJlcXVpcmUoICcuL2dpdENsb25lT3JGZXRjaERpcmVjdG9yeScgKTtcbmNvbnN0IGdpdEZpcnN0RGl2ZXJnaW5nQ29tbWl0ID0gcmVxdWlyZSggJy4vZ2l0Rmlyc3REaXZlcmdpbmdDb21taXQnICk7XG5jb25zdCBnaXRJc0FuY2VzdG9yID0gcmVxdWlyZSggJy4vZ2l0SXNBbmNlc3RvcicgKTtcbmNvbnN0IGNoaXBwZXJTdXBwb3J0c091dHB1dEpTR3J1bnRUYXNrcyA9IHJlcXVpcmUoICcuL2NoaXBwZXJTdXBwb3J0c091dHB1dEpTR3J1bnRUYXNrcycgKTtcbmNvbnN0IGdpdFB1bGwgPSByZXF1aXJlKCAnLi9naXRQdWxsJyApO1xuY29uc3QgZ2l0UHVsbERpcmVjdG9yeSA9IHJlcXVpcmUoICcuL2dpdFB1bGxEaXJlY3RvcnknICk7XG5jb25zdCBnaXRSZXZQYXJzZSA9IHJlcXVpcmUoICcuL2dpdFJldlBhcnNlJyApO1xuY29uc3QgZ2l0VGltZXN0YW1wID0gcmVxdWlyZSggJy4vZ2l0VGltZXN0YW1wJyApO1xuY29uc3QgZ3J1bnRDb21tYW5kID0gcmVxdWlyZSggJy4vZ3J1bnRDb21tYW5kJyApO1xuY29uc3QgbG9hZEpTT04gPSByZXF1aXJlKCAnLi9sb2FkSlNPTicgKTtcbmNvbnN0IG5wbVVwZGF0ZURpcmVjdG9yeSA9IHJlcXVpcmUoICcuL25wbVVwZGF0ZURpcmVjdG9yeScgKTtcbmNvbnN0IHB1cHBldGVlckxvYWQgPSByZXF1aXJlKCAnLi9wdXBwZXRlZXJMb2FkJyApO1xuY29uc3Qgc2ltTWV0YWRhdGEgPSByZXF1aXJlKCAnLi9zaW1NZXRhZGF0YScgKTtcbmNvbnN0IHNpbVBoZXRpb01ldGFkYXRhID0gcmVxdWlyZSggJy4vc2ltUGhldGlvTWV0YWRhdGEnICk7XG5jb25zdCBTaW1WZXJzaW9uID0gcmVxdWlyZSggJy4uL2Jyb3dzZXItYW5kLW5vZGUvU2ltVmVyc2lvbicgKS5kZWZhdWx0O1xuY29uc3Qgd2l0aFNlcnZlciA9IHJlcXVpcmUoICcuL3dpdGhTZXJ2ZXInICk7XG5jb25zdCBhc3NlcnQgPSByZXF1aXJlKCAnYXNzZXJ0JyApO1xuY29uc3QgZnMgPSByZXF1aXJlKCAnZnMnICk7XG5jb25zdCB3aW5zdG9uID0gcmVxdWlyZSggJ3dpbnN0b24nICk7XG5jb25zdCBfID0gcmVxdWlyZSggJ2xvZGFzaCcgKTtcbmNvbnN0IGF4aW9zID0gcmVxdWlyZSggJ2F4aW9zJyApO1xuXG5tb2R1bGUuZXhwb3J0cyA9ICggZnVuY3Rpb24oKSB7XG5cbiAgY29uc3QgTUFJTlRFTkFOQ0VfRElSRUNUT1JZID0gJy4uL3JlbGVhc2UtYnJhbmNoZXMnO1xuXG4gIGNsYXNzIFJlbGVhc2VCcmFuY2gge1xuICAgIC8qKlxuICAgICAqIEBwdWJsaWNcbiAgICAgKiBAY29uc3RydWN0b3JcbiAgICAgKlxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSByZXBvXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGJyYW5jaFxuICAgICAqIEBwYXJhbSB7QXJyYXkuPHN0cmluZz59IGJyYW5kc1xuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gaXNSZWxlYXNlZFxuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKCByZXBvLCBicmFuY2gsIGJyYW5kcywgaXNSZWxlYXNlZCApIHtcbiAgICAgIGFzc2VydCggdHlwZW9mIHJlcG8gPT09ICdzdHJpbmcnICk7XG4gICAgICBhc3NlcnQoIHR5cGVvZiBicmFuY2ggPT09ICdzdHJpbmcnICk7XG4gICAgICBhc3NlcnQoIEFycmF5LmlzQXJyYXkoIGJyYW5kcyApICk7XG4gICAgICBhc3NlcnQoIHR5cGVvZiBpc1JlbGVhc2VkID09PSAnYm9vbGVhbicgKTtcblxuICAgICAgLy8gQHB1YmxpYyB7c3RyaW5nfVxuICAgICAgdGhpcy5yZXBvID0gcmVwbztcbiAgICAgIHRoaXMuYnJhbmNoID0gYnJhbmNoO1xuXG4gICAgICAvLyBAcHVibGljIHtBcnJheS48c3RyaW5nPn1cbiAgICAgIHRoaXMuYnJhbmRzID0gYnJhbmRzO1xuXG4gICAgICAvLyBAcHVibGljIHtib29sZWFufVxuICAgICAgdGhpcy5pc1JlbGVhc2VkID0gaXNSZWxlYXNlZDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDb252ZXJ0IGludG8gYSBwbGFpbiBKUyBvYmplY3QgbWVhbnQgZm9yIEpTT04gc2VyaWFsaXphdGlvbi5cbiAgICAgKiBAcHVibGljXG4gICAgICpcbiAgICAgKiBAcmV0dXJucyB7T2JqZWN0fVxuICAgICAqL1xuICAgIHNlcmlhbGl6ZSgpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHJlcG86IHRoaXMucmVwbyxcbiAgICAgICAgYnJhbmNoOiB0aGlzLmJyYW5jaCxcbiAgICAgICAgYnJhbmRzOiB0aGlzLmJyYW5kcyxcbiAgICAgICAgaXNSZWxlYXNlZDogdGhpcy5pc1JlbGVhc2VkXG4gICAgICB9O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFRha2VzIGEgc2VyaWFsaXplZCBmb3JtIG9mIHRoZSBSZWxlYXNlQnJhbmNoIGFuZCByZXR1cm5zIGFuIGFjdHVhbCBpbnN0YW5jZS5cbiAgICAgKiBAcHVibGljXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge09iamVjdH1cbiAgICAgKiBAcmV0dXJucyB7UmVsZWFzZUJyYW5jaH1cbiAgICAgKi9cbiAgICBzdGF0aWMgZGVzZXJpYWxpemUoIHsgcmVwbywgYnJhbmNoLCBicmFuZHMsIGlzUmVsZWFzZWQgfSApIHtcbiAgICAgIHJldHVybiBuZXcgUmVsZWFzZUJyYW5jaCggcmVwbywgYnJhbmNoLCBicmFuZHMsIGlzUmVsZWFzZWQgKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIHdoZXRoZXIgdGhlIHR3byByZWxlYXNlIGJyYW5jaGVzIGNvbnRhaW4gaWRlbnRpY2FsIGluZm9ybWF0aW9uLlxuICAgICAqIEBwdWJsaWNcbiAgICAgKlxuICAgICAqIEBwYXJhbSB7UmVsZWFzZUJyYW5jaH0gcmVsZWFzZUJyYW5jaFxuICAgICAqIEByZXR1cm5zIHtib29sZWFufVxuICAgICAqL1xuICAgIGVxdWFscyggcmVsZWFzZUJyYW5jaCApIHtcbiAgICAgIHJldHVybiB0aGlzLnJlcG8gPT09IHJlbGVhc2VCcmFuY2gucmVwbyAmJlxuICAgICAgICAgICAgIHRoaXMuYnJhbmNoID09PSByZWxlYXNlQnJhbmNoLmJyYW5jaCAmJlxuICAgICAgICAgICAgIHRoaXMuYnJhbmRzLmpvaW4oICcsJyApID09PSByZWxlYXNlQnJhbmNoLmJyYW5kcy5qb2luKCAnLCcgKSAmJlxuICAgICAgICAgICAgIHRoaXMuaXNSZWxlYXNlZCA9PT0gcmVsZWFzZUJyYW5jaC5pc1JlbGVhc2VkO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENvbnZlcnRzIGl0IHRvIGEgKGRlYnVnZ2FibGUpIHN0cmluZyBmb3JtLlxuICAgICAqIEBwdWJsaWNcbiAgICAgKlxuICAgICAqIEByZXR1cm5zIHtzdHJpbmd9XG4gICAgICovXG4gICAgdG9TdHJpbmcoKSB7XG4gICAgICByZXR1cm4gYCR7dGhpcy5yZXBvfSAke3RoaXMuYnJhbmNofSAke3RoaXMuYnJhbmRzLmpvaW4oICcsJyApfSR7dGhpcy5pc1JlbGVhc2VkID8gJycgOiAnICh1bnB1Ymxpc2hlZCknfWA7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQHB1YmxpY1xuICAgICAqXG4gICAgICogQHBhcmFtIHJlcG8ge3N0cmluZ31cbiAgICAgKiBAcGFyYW0gYnJhbmNoIHtzdHJpbmd9XG4gICAgICogQHJldHVybnMge3N0cmluZ31cbiAgICAgKi9cbiAgICBzdGF0aWMgZ2V0Q2hlY2tvdXREaXJlY3RvcnkoIHJlcG8sIGJyYW5jaCApIHtcbiAgICAgIHJldHVybiBgJHtNQUlOVEVOQU5DRV9ESVJFQ1RPUll9LyR7cmVwb30tJHticmFuY2h9YDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIHRoZSBtYWludGVuYW5jZSBkaXJlY3RvcnksIGZvciB0aGluZ3MgdGhhdCB3YW50IHRvIHVzZSBpdCBkaXJlY3RseS5cbiAgICAgKiBAcHVibGljXG4gICAgICpcbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nfVxuICAgICAqL1xuICAgIHN0YXRpYyBnZXRNYWludGVuYW5jZURpcmVjdG9yeSgpIHtcbiAgICAgIHJldHVybiBNQUlOVEVOQU5DRV9ESVJFQ1RPUlk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmV0dXJucyB0aGUgcGF0aCAocmVsYXRpdmUgdG8gdGhlIHJlcG8pIHRvIHRoZSBidWlsdCBwaGV0LWJyYW5kIEhUTUwgZmlsZVxuICAgICAqIEBwdWJsaWNcbiAgICAgKlxuICAgICAqIEByZXR1cm5zIHtQcm9taXNlPHN0cmluZz59XG4gICAgICovXG4gICAgYXN5bmMgZ2V0TG9jYWxQaGV0QnVpbHRIVE1MUGF0aCgpIHtcbiAgICAgIGNvbnN0IHVzZXNDaGlwcGVyMiA9IGF3YWl0IHRoaXMudXNlc0NoaXBwZXIyKCk7XG5cbiAgICAgIHJldHVybiBgYnVpbGQvJHt1c2VzQ2hpcHBlcjIgPyAncGhldC8nIDogJyd9JHt0aGlzLnJlcG99X2VuJHt1c2VzQ2hpcHBlcjIgPyAnX3BoZXQnIDogJyd9Lmh0bWxgO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJldHVybnMgdGhlIHBhdGggKHJlbGF0aXZlIHRvIHRoZSByZXBvKSB0byB0aGUgYnVpbHQgcGhldC1pby1icmFuZCBIVE1MIGZpbGVcbiAgICAgKiBAcHVibGljXG4gICAgICpcbiAgICAgKiBAcmV0dXJucyB7UHJvbWlzZTxzdHJpbmc+fVxuICAgICAqL1xuICAgIGFzeW5jIGdldExvY2FsUGhldElPQnVpbHRIVE1MUGF0aCgpIHtcbiAgICAgIGNvbnN0IHVzZXNDaGlwcGVyMiA9IGF3YWl0IHRoaXMudXNlc0NoaXBwZXIyKCk7XG5cbiAgICAgIHJldHVybiBgYnVpbGQvJHt1c2VzQ2hpcHBlcjIgPyAncGhldC1pby8nIDogJyd9JHt0aGlzLnJlcG99JHt1c2VzQ2hpcHBlcjIgPyAnX2FsbF9waGV0LWlvJyA6ICdfZW4tcGhldGlvJ30uaHRtbGA7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmV0dXJucyB0aGUgcXVlcnkgcGFyYW1ldGVyIHRvIHVzZSBmb3IgYWN0aXZhdGluZyBwaGV0LWlvIHN0YW5kYWxvbmUgbW9kZVxuICAgICAqIEBwdWJsaWNcbiAgICAgKlxuICAgICAqIEByZXR1cm5zIHtQcm9taXNlPHN0cmluZz59XG4gICAgICovXG4gICAgYXN5bmMgZ2V0UGhldGlvU3RhbmRhbG9uZVF1ZXJ5UGFyYW1ldGVyKCkge1xuICAgICAgcmV0dXJuICggYXdhaXQgdGhpcy51c2VzT2xkUGhldGlvU3RhbmRhbG9uZSgpICkgPyAncGhldC1pby5zdGFuZGFsb25lJyA6ICdwaGV0aW9TdGFuZGFsb25lJztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAcHVibGljXG4gICAgICpcbiAgICAgKiBAcmV0dXJucyB7Q2hpcHBlclZlcnNpb259XG4gICAgICovXG4gICAgZ2V0Q2hpcHBlclZlcnNpb24oKSB7XG4gICAgICBjb25zdCBjaGVja291dERpcmVjdG9yeSA9IFJlbGVhc2VCcmFuY2guZ2V0Q2hlY2tvdXREaXJlY3RvcnkoIHRoaXMucmVwbywgdGhpcy5icmFuY2ggKTtcblxuICAgICAgcmV0dXJuIENoaXBwZXJWZXJzaW9uLmdldEZyb21QYWNrYWdlSlNPTihcbiAgICAgICAgSlNPTi5wYXJzZSggZnMucmVhZEZpbGVTeW5jKCBgJHtjaGVja291dERpcmVjdG9yeX0vY2hpcHBlci9wYWNrYWdlLmpzb25gLCAndXRmOCcgKSApXG4gICAgICApO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBwdWJsaWNcbiAgICAgKi9cbiAgICBhc3luYyB1cGRhdGVDaGVja291dCggb3ZlcnJpZGVEZXBlbmRlbmNpZXMgPSB7fSApIHtcbiAgICAgIHdpbnN0b24uaW5mbyggYHVwZGF0aW5nIGNoZWNrb3V0IGZvciAke3RoaXMudG9TdHJpbmcoKX1gICk7XG5cbiAgICAgIGlmICggIWZzLmV4aXN0c1N5bmMoIE1BSU5URU5BTkNFX0RJUkVDVE9SWSApICkge1xuICAgICAgICB3aW5zdG9uLmluZm8oIGBjcmVhdGluZyBkaXJlY3RvcnkgJHtNQUlOVEVOQU5DRV9ESVJFQ1RPUll9YCApO1xuICAgICAgICBhd2FpdCBjcmVhdGVEaXJlY3RvcnkoIE1BSU5URU5BTkNFX0RJUkVDVE9SWSApO1xuICAgICAgfVxuICAgICAgY29uc3QgY2hlY2tvdXREaXJlY3RvcnkgPSBSZWxlYXNlQnJhbmNoLmdldENoZWNrb3V0RGlyZWN0b3J5KCB0aGlzLnJlcG8sIHRoaXMuYnJhbmNoICk7XG4gICAgICBpZiAoICFmcy5leGlzdHNTeW5jKCBjaGVja291dERpcmVjdG9yeSApICkge1xuICAgICAgICB3aW5zdG9uLmluZm8oIGBjcmVhdGluZyBkaXJlY3RvcnkgJHtjaGVja291dERpcmVjdG9yeX1gICk7XG4gICAgICAgIGF3YWl0IGNyZWF0ZURpcmVjdG9yeSggY2hlY2tvdXREaXJlY3RvcnkgKTtcbiAgICAgIH1cblxuICAgICAgYXdhaXQgZ2l0Q2xvbmVPckZldGNoRGlyZWN0b3J5KCB0aGlzLnJlcG8sIGNoZWNrb3V0RGlyZWN0b3J5ICk7XG4gICAgICBhd2FpdCBnaXRDaGVja291dERpcmVjdG9yeSggdGhpcy5icmFuY2gsIGAke2NoZWNrb3V0RGlyZWN0b3J5fS8ke3RoaXMucmVwb31gICk7XG4gICAgICBhd2FpdCBnaXRQdWxsRGlyZWN0b3J5KCBgJHtjaGVja291dERpcmVjdG9yeX0vJHt0aGlzLnJlcG99YCApO1xuICAgICAgY29uc3QgZGVwZW5kZW5jaWVzT25CcmFuY2hUaXAgPSBhd2FpdCBsb2FkSlNPTiggYCR7Y2hlY2tvdXREaXJlY3Rvcnl9LyR7dGhpcy5yZXBvfS9kZXBlbmRlbmNpZXMuanNvbmAgKTtcblxuICAgICAgZGVwZW5kZW5jaWVzT25CcmFuY2hUaXAuYmFiZWwgPSB7IHNoYTogYnVpbGRMb2NhbC5iYWJlbEJyYW5jaCwgYnJhbmNoOiBidWlsZExvY2FsLmJhYmVsQnJhbmNoIH07XG5cbiAgICAgIGNvbnN0IGRlcGVuZGVuY3lSZXBvcyA9IF8udW5pcSggW1xuICAgICAgICAuLi5PYmplY3Qua2V5cyggZGVwZW5kZW5jaWVzT25CcmFuY2hUaXAgKSxcbiAgICAgICAgLi4uT2JqZWN0LmtleXMoIG92ZXJyaWRlRGVwZW5kZW5jaWVzIClcbiAgICAgIF0uZmlsdGVyKCByZXBvID0+IHJlcG8gIT09ICdjb21tZW50JyApICk7XG5cbiAgICAgIGF3YWl0IFByb21pc2UuYWxsKCBkZXBlbmRlbmN5UmVwb3MubWFwKCBhc3luYyByZXBvID0+IHtcbiAgICAgICAgY29uc3QgcmVwb1B3ZCA9IGAke2NoZWNrb3V0RGlyZWN0b3J5fS8ke3JlcG99YDtcblxuICAgICAgICBhd2FpdCBnaXRDbG9uZU9yRmV0Y2hEaXJlY3RvcnkoIHJlcG8sIGNoZWNrb3V0RGlyZWN0b3J5ICk7XG5cbiAgICAgICAgY29uc3Qgc2hhID0gb3ZlcnJpZGVEZXBlbmRlbmNpZXNbIHJlcG8gXSA/IG92ZXJyaWRlRGVwZW5kZW5jaWVzWyByZXBvIF0uc2hhIDogZGVwZW5kZW5jaWVzT25CcmFuY2hUaXBbIHJlcG8gXS5zaGE7XG4gICAgICAgIGF3YWl0IGdpdENoZWNrb3V0RGlyZWN0b3J5KCBzaGEsIHJlcG9Qd2QgKTtcblxuICAgICAgICAvLyBQdWxsIGJhYmVsLCBzaW5jZSB3ZSBkb24ndCBnaXZlIGl0IGEgc3BlY2lmaWMgU0hBIChqdXN0IGEgYnJhbmNoKSxcbiAgICAgICAgLy8gc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9wZXJlbm5pYWwvaXNzdWVzLzMyNlxuICAgICAgICBpZiAoIHJlcG8gPT09ICdiYWJlbCcgKSB7XG4gICAgICAgICAgYXdhaXQgZ2l0UHVsbERpcmVjdG9yeSggcmVwb1B3ZCApO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCByZXBvID09PSAnY2hpcHBlcicgfHwgcmVwbyA9PT0gJ3BlcmVubmlhbC1hbGlhcycgfHwgcmVwbyA9PT0gdGhpcy5yZXBvICkge1xuICAgICAgICAgIHdpbnN0b24uaW5mbyggYG5wbSAke3JlcG99IGluICR7Y2hlY2tvdXREaXJlY3Rvcnl9YCApO1xuXG4gICAgICAgICAgYXdhaXQgbnBtVXBkYXRlRGlyZWN0b3J5KCByZXBvUHdkICk7XG4gICAgICAgIH1cbiAgICAgIH0gKSApO1xuXG4gICAgICAvLyBQZXJlbm5pYWwgY2FuIGJlIGEgbmljZSBtYW51YWwgYWRkaXRpb24gaW4gZWFjaCBkaXIsIGluIGNhc2UgeW91IG5lZWQgdG8gZ28gaW4gYW5kIHJ1biBjb21tYW5kcyB0byB0aGVzZVxuICAgICAgLy8gYnJhbmNoZXMgbWFudWFsbHkgKGxpa2UgYnVpbGQgb3IgY2hlY2tvdXQgb3IgdXBkYXRlKS4gTm8gbmVlZCB0byBucG0gaW5zdGFsbCwgeW91IGNhbiBkbyB0aGF0IHlvdXJzZWxmIGlmIG5lZWRlZC5cbiAgICAgIGF3YWl0IGdpdENsb25lT3JGZXRjaERpcmVjdG9yeSggJ3BlcmVubmlhbCcsIGNoZWNrb3V0RGlyZWN0b3J5ICk7XG4gICAgICBhd2FpdCBnaXRQdWxsRGlyZWN0b3J5KCBgJHtjaGVja291dERpcmVjdG9yeX0vcGVyZW5uaWFsYCApO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBwdWJsaWNcbiAgICAgKlxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9uc10gLSBvcHRpb25hbCBwYXJhbWV0ZXJzIGZvciBnZXRCdWlsZEFyZ3VtZW50c1xuICAgICAqL1xuICAgIGFzeW5jIGJ1aWxkKCBvcHRpb25zICkge1xuICAgICAgY29uc3QgY2hlY2tvdXREaXJlY3RvcnkgPSBSZWxlYXNlQnJhbmNoLmdldENoZWNrb3V0RGlyZWN0b3J5KCB0aGlzLnJlcG8sIHRoaXMuYnJhbmNoICk7XG4gICAgICBjb25zdCByZXBvRGlyZWN0b3J5ID0gYCR7Y2hlY2tvdXREaXJlY3Rvcnl9LyR7dGhpcy5yZXBvfWA7XG5cbiAgICAgIGNvbnN0IGFyZ3MgPSBnZXRCdWlsZEFyZ3VtZW50cyggdGhpcy5nZXRDaGlwcGVyVmVyc2lvbigpLCBfLm1lcmdlKCB7XG4gICAgICAgIGJyYW5kczogdGhpcy5icmFuZHMsXG4gICAgICAgIGFsbEhUTUw6IHRydWUsXG4gICAgICAgIGRlYnVnSFRNTDogdHJ1ZSxcbiAgICAgICAgbGludDogZmFsc2UsXG4gICAgICAgIGxvY2FsZXM6ICcqJ1xuICAgICAgfSwgb3B0aW9ucyApICk7XG5cbiAgICAgIHdpbnN0b24uaW5mbyggYGJ1aWxkaW5nICR7Y2hlY2tvdXREaXJlY3Rvcnl9IHdpdGggZ3J1bnQgJHthcmdzLmpvaW4oICcgJyApfWAgKTtcbiAgICAgIGF3YWl0IGV4ZWN1dGUoIGdydW50Q29tbWFuZCwgYXJncywgcmVwb0RpcmVjdG9yeSApO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBwdWJsaWNcbiAgICAgKi9cbiAgICBhc3luYyB0cmFuc3BpbGUoKSB7XG4gICAgICBjb25zdCBjaGVja291dERpcmVjdG9yeSA9IFJlbGVhc2VCcmFuY2guZ2V0Q2hlY2tvdXREaXJlY3RvcnkoIHRoaXMucmVwbywgdGhpcy5icmFuY2ggKTtcbiAgICAgIGNvbnN0IHJlcG9EaXJlY3RvcnkgPSBgJHtjaGVja291dERpcmVjdG9yeX0vJHt0aGlzLnJlcG99YDtcblxuICAgICAgaWYgKCBjaGlwcGVyU3VwcG9ydHNPdXRwdXRKU0dydW50VGFza3MoKSApIHtcbiAgICAgICAgd2luc3Rvbi5pbmZvKCBgdHJhbnNwaWxpbmcgJHtjaGVja291dERpcmVjdG9yeX1gICk7XG5cbiAgICAgICAgLy8gV2UgbWlnaHQgbm90IGJlIGFibGUgdG8gcnVuIHRoaXMgY29tbWFuZCFcbiAgICAgICAgYXdhaXQgZXhlY3V0ZSggZ3J1bnRDb21tYW5kLCBbICdvdXRwdXQtanMtcHJvamVjdCcsICctLXNpbGVudCcgXSwgcmVwb0RpcmVjdG9yeSwge1xuICAgICAgICAgIGVycm9yczogJ3Jlc29sdmUnXG4gICAgICAgIH0gKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAcHVibGljXG4gICAgICpcbiAgICAgKiBAcmV0dXJucyB7UHJvbWlzZTxzdHJpbmd8bnVsbD59IC0gRXJyb3Igc3RyaW5nLCBvciBudWxsIGlmIG5vIGVycm9yXG4gICAgICovXG4gICAgYXN5bmMgY2hlY2tVbmJ1aWx0KCkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgcmV0dXJuIGF3YWl0IHdpdGhTZXJ2ZXIoIGFzeW5jIHBvcnQgPT4ge1xuICAgICAgICAgIGNvbnN0IHVybCA9IGBodHRwOi8vbG9jYWxob3N0OiR7cG9ydH0vJHt0aGlzLnJlcG99LyR7dGhpcy5yZXBvfV9lbi5odG1sP2JyYW5kPXBoZXQmZWEmZnV6ek1vdXNlJmZ1enpUb3VjaGA7XG4gICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIHJldHVybiBhd2FpdCBwdXBwZXRlZXJMb2FkKCB1cmwsIHtcbiAgICAgICAgICAgICAgd2FpdEFmdGVyTG9hZDogMjAwMDBcbiAgICAgICAgICAgIH0gKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgY2F0Y2goIGUgKSB7XG4gICAgICAgICAgICByZXR1cm4gYEZhaWx1cmUgZm9yICR7dXJsfTogJHtlfWA7XG4gICAgICAgICAgfVxuICAgICAgICB9LCB7XG4gICAgICAgICAgcGF0aDogUmVsZWFzZUJyYW5jaC5nZXRDaGVja291dERpcmVjdG9yeSggdGhpcy5yZXBvLCB0aGlzLmJyYW5jaCApXG4gICAgICAgIH0gKTtcbiAgICAgIH1cbiAgICAgIGNhdGNoKCBlICkge1xuICAgICAgICByZXR1cm4gYFtFUlJPUl0gRmFpbHVyZSB0byBjaGVjazogJHtlfWA7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQHB1YmxpY1xuICAgICAqXG4gICAgICogQHJldHVybnMge1Byb21pc2U8c3RyaW5nfG51bGw+fSAtIEVycm9yIHN0cmluZywgb3IgbnVsbCBpZiBubyBlcnJvclxuICAgICAqL1xuICAgIGFzeW5jIGNoZWNrQnVpbHQoKSB7XG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCB1c2VzQ2hpcHBlcjIgPSBhd2FpdCB0aGlzLnVzZXNDaGlwcGVyMigpO1xuXG4gICAgICAgIHJldHVybiBhd2FpdCB3aXRoU2VydmVyKCBhc3luYyBwb3J0ID0+IHtcbiAgICAgICAgICBjb25zdCB1cmwgPSBgaHR0cDovL2xvY2FsaG9zdDoke3BvcnR9LyR7dGhpcy5yZXBvfS9idWlsZC8ke3VzZXNDaGlwcGVyMiA/ICdwaGV0LycgOiAnJ30ke3RoaXMucmVwb31fZW4ke3VzZXNDaGlwcGVyMiA/ICdfcGhldCcgOiAnJ30uaHRtbD9mdXp6TW91c2UmZnV6elRvdWNoYDtcbiAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgcmV0dXJuIHB1cHBldGVlckxvYWQoIHVybCwge1xuICAgICAgICAgICAgICB3YWl0QWZ0ZXJMb2FkOiAyMDAwMFxuICAgICAgICAgICAgfSApO1xuICAgICAgICAgIH1cbiAgICAgICAgICBjYXRjaCggZXJyb3IgKSB7XG4gICAgICAgICAgICByZXR1cm4gYEZhaWx1cmUgZm9yICR7dXJsfTogJHtlcnJvcn1gO1xuICAgICAgICAgIH1cbiAgICAgICAgfSwge1xuICAgICAgICAgIHBhdGg6IFJlbGVhc2VCcmFuY2guZ2V0Q2hlY2tvdXREaXJlY3RvcnkoIHRoaXMucmVwbywgdGhpcy5icmFuY2ggKVxuICAgICAgICB9ICk7XG4gICAgICB9XG4gICAgICBjYXRjaCggZSApIHtcbiAgICAgICAgcmV0dXJuIGBbRVJST1JdIEZhaWx1cmUgdG8gY2hlY2s6ICR7ZX1gO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENoZWNrcyB0aGlzIHJlbGVhc2UgYnJhbmNoIG91dC5cbiAgICAgKiBAcHVibGljXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IGluY2x1ZGVOcG1VcGRhdGVcbiAgICAgKi9cbiAgICBhc3luYyBjaGVja291dCggaW5jbHVkZU5wbVVwZGF0ZSApIHtcbiAgICAgIGF3YWl0IGNoZWNrb3V0VGFyZ2V0KCB0aGlzLnJlcG8sIHRoaXMuYnJhbmNoLCBpbmNsdWRlTnBtVXBkYXRlICk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogV2hldGhlciB0aGlzIHJlbGVhc2UgYnJhbmNoIGluY2x1ZGVzIHRoZSBnaXZlbiBTSEEgZm9yIHRoZSBnaXZlbiByZXBvIGRlcGVuZGVuY3kuIFdpbGwgYmUgZmFsc2UgaWYgaXQgZG9lc24ndFxuICAgICAqIGRlcGVuZCBvbiB0aGlzIHJlcG9zaXRvcnkuXG4gICAgICogQHB1YmxpY1xuICAgICAqXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHJlcG9cbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gc2hhXG4gICAgICogQHJldHVybnMge1Byb21pc2UuPGJvb2xlYW4+fVxuICAgICAqL1xuICAgIGFzeW5jIGluY2x1ZGVzU0hBKCByZXBvLCBzaGEgKSB7XG4gICAgICBsZXQgcmVzdWx0ID0gZmFsc2U7XG5cbiAgICAgIGF3YWl0IGdpdENoZWNrb3V0KCB0aGlzLnJlcG8sIHRoaXMuYnJhbmNoICk7XG5cbiAgICAgIGNvbnN0IGRlcGVuZGVuY2llcyA9IGF3YWl0IGdldERlcGVuZGVuY2llcyggdGhpcy5yZXBvICk7XG5cbiAgICAgIGlmICggZGVwZW5kZW5jaWVzWyByZXBvIF0gKSB7XG4gICAgICAgIGNvbnN0IGN1cnJlbnRTSEEgPSBkZXBlbmRlbmNpZXNbIHJlcG8gXS5zaGE7XG4gICAgICAgIHJlc3VsdCA9IHNoYSA9PT0gY3VycmVudFNIQSB8fCBhd2FpdCBnaXRJc0FuY2VzdG9yKCByZXBvLCBzaGEsIGN1cnJlbnRTSEEgKTtcbiAgICAgIH1cblxuICAgICAgYXdhaXQgZ2l0Q2hlY2tvdXQoIHRoaXMucmVwbywgJ21haW4nICk7XG5cbiAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogV2hldGhlciB0aGlzIHJlbGVhc2UgYnJhbmNoIGRvZXMgTk9UIGluY2x1ZGUgdGhlIGdpdmVuIFNIQSBmb3IgdGhlIGdpdmVuIHJlcG8gZGVwZW5kZW5jeS4gV2lsbCBiZSBmYWxzZSBpZiBpdCBkb2Vzbid0XG4gICAgICogZGVwZW5kIG9uIHRoaXMgcmVwb3NpdG9yeS5cbiAgICAgKiBAcHVibGljXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gcmVwb1xuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBzaGFcbiAgICAgKiBAcmV0dXJucyB7UHJvbWlzZS48Ym9vbGVhbj59XG4gICAgICovXG4gICAgYXN5bmMgaXNNaXNzaW5nU0hBKCByZXBvLCBzaGEgKSB7XG4gICAgICBsZXQgcmVzdWx0ID0gZmFsc2U7XG5cbiAgICAgIGF3YWl0IGdpdENoZWNrb3V0KCB0aGlzLnJlcG8sIHRoaXMuYnJhbmNoICk7XG5cbiAgICAgIGNvbnN0IGRlcGVuZGVuY2llcyA9IGF3YWl0IGdldERlcGVuZGVuY2llcyggdGhpcy5yZXBvICk7XG5cbiAgICAgIGlmICggZGVwZW5kZW5jaWVzWyByZXBvIF0gKSB7XG4gICAgICAgIGNvbnN0IGN1cnJlbnRTSEEgPSBkZXBlbmRlbmNpZXNbIHJlcG8gXS5zaGE7XG4gICAgICAgIHJlc3VsdCA9IHNoYSAhPT0gY3VycmVudFNIQSAmJiAhKCBhd2FpdCBnaXRJc0FuY2VzdG9yKCByZXBvLCBzaGEsIGN1cnJlbnRTSEEgKSApO1xuICAgICAgfVxuXG4gICAgICBhd2FpdCBnaXRDaGVja291dCggdGhpcy5yZXBvLCAnbWFpbicgKTtcblxuICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBUaGUgU0hBIGF0IHdoaWNoIHRoaXMgcmVsZWFzZSBicmFuY2gncyBtYWluIHJlcG9zaXRvcnkgZGl2ZXJnZWQgZnJvbSBtYWluLlxuICAgICAqIEBwdWJsaWNcbiAgICAgKlxuICAgICAqIEByZXR1cm5zIHtQcm9taXNlLjxzdHJpbmc+fVxuICAgICAqL1xuICAgIGFzeW5jIGdldERpdmVyZ2luZ1NIQSgpIHtcbiAgICAgIGF3YWl0IGdpdENoZWNrb3V0KCB0aGlzLnJlcG8sIHRoaXMuYnJhbmNoICk7XG4gICAgICBhd2FpdCBnaXRQdWxsKCB0aGlzLnJlcG8gKTtcbiAgICAgIGF3YWl0IGdpdENoZWNrb3V0KCB0aGlzLnJlcG8sICdtYWluJyApO1xuXG4gICAgICByZXR1cm4gZ2l0Rmlyc3REaXZlcmdpbmdDb21taXQoIHRoaXMucmVwbywgdGhpcy5icmFuY2gsICdtYWluJyApO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFRoZSB0aW1lc3RhbXAgYXQgd2hpY2ggdGhpcyByZWxlYXNlIGJyYW5jaCdzIG1haW4gcmVwb3NpdG9yeSBkaXZlcmdlZCBmcm9tIG1haW4uXG4gICAgICogQHB1YmxpY1xuICAgICAqXG4gICAgICogQHJldHVybnMge1Byb21pc2UuPG51bWJlcj59XG4gICAgICovXG4gICAgYXN5bmMgZ2V0RGl2ZXJnaW5nVGltZXN0YW1wKCkge1xuICAgICAgcmV0dXJuIGdpdFRpbWVzdGFtcCggdGhpcy5yZXBvLCBhd2FpdCB0aGlzLmdldERpdmVyZ2luZ1NIQSgpICk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmV0dXJucyB0aGUgZGVwZW5kZW5jaWVzLmpzb24gZm9yIHRoaXMgcmVsZWFzZSBicmFuY2hcbiAgICAgKiBAcHVibGljXG4gICAgICpcbiAgICAgKiBAcmV0dXJucyB7UHJvbWlzZX1cbiAgICAgKi9cbiAgICBhc3luYyBnZXREZXBlbmRlbmNpZXMoKSB7XG4gICAgICByZXR1cm4gZ2V0QnJhbmNoRGVwZW5kZW5jaWVzKCB0aGlzLnJlcG8sIHRoaXMuYnJhbmNoICk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmV0dXJucyB0aGUgU2ltVmVyc2lvbiBmb3IgdGhpcyByZWxlYXNlIGJyYW5jaFxuICAgICAqIEBwdWJsaWNcbiAgICAgKlxuICAgICAqIEByZXR1cm5zIHtQcm9taXNlPFNpbVZlcnNpb24+fVxuICAgICAqL1xuICAgIGFzeW5jIGdldFNpbVZlcnNpb24oKSB7XG4gICAgICByZXR1cm4gZ2V0QnJhbmNoVmVyc2lvbiggdGhpcy5yZXBvLCB0aGlzLmJyYW5jaCApO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJldHVybnMgYSBsaXN0IG9mIHN0YXR1cyBtZXNzYWdlcyBvZiBhbnl0aGluZyBvdXQtb2YtdGhlLW9yZGluYXJ5XG4gICAgICogQHB1YmxpY1xuICAgICAqXG4gICAgICogQHJldHVybnMge1Byb21pc2UuPEFycmF5LjxzdHJpbmc+Pn1cbiAgICAgKi9cbiAgICBhc3luYyBnZXRTdGF0dXMoIGdldEJyYW5jaE1hcEFzeW5jQ2FsbGJhY2sgPSBnZXRCcmFuY2hNYXAgKSB7XG4gICAgICBjb25zdCByZXN1bHRzID0gW107XG5cbiAgICAgIGNvbnN0IGRlcGVuZGVuY2llcyA9IGF3YWl0IHRoaXMuZ2V0RGVwZW5kZW5jaWVzKCk7XG4gICAgICBjb25zdCBkZXBlbmRlbmN5TmFtZXMgPSBPYmplY3Qua2V5cyggZGVwZW5kZW5jaWVzICkuZmlsdGVyKCBrZXkgPT4ge1xuICAgICAgICByZXR1cm4ga2V5ICE9PSAnY29tbWVudCcgJiYga2V5ICE9PSB0aGlzLnJlcG8gJiYga2V5ICE9PSAncGhldC1pby13cmFwcGVyLXNvbmlmaWNhdGlvbic7XG4gICAgICB9ICk7XG5cbiAgICAgIC8vIENoZWNrIG91ciBvd24gZGVwZW5kZW5jeVxuICAgICAgaWYgKCBkZXBlbmRlbmNpZXNbIHRoaXMucmVwbyBdICkge1xuICAgICAgICB0cnkge1xuICAgICAgICAgIGNvbnN0IGN1cnJlbnRDb21taXQgPSBhd2FpdCBnaXRSZXZQYXJzZSggdGhpcy5yZXBvLCB0aGlzLmJyYW5jaCApO1xuICAgICAgICAgIGNvbnN0IHByZXZpb3VzQ29tbWl0ID0gYXdhaXQgZ2l0UmV2UGFyc2UoIHRoaXMucmVwbywgYCR7Y3VycmVudENvbW1pdH1eYCApO1xuICAgICAgICAgIGlmICggZGVwZW5kZW5jaWVzWyB0aGlzLnJlcG8gXS5zaGEgIT09IHByZXZpb3VzQ29tbWl0ICkge1xuICAgICAgICAgICAgcmVzdWx0cy5wdXNoKCAnW0lORk9dIFBvdGVudGlhbCBjaGFuZ2VzIChkZXBlbmRlbmN5IGlzIG5vdCBwcmV2aW91cyBjb21taXQpJyApO1xuICAgICAgICAgICAgcmVzdWx0cy5wdXNoKCBgW0lORk9dICR7Y3VycmVudENvbW1pdH0gJHtwcmV2aW91c0NvbW1pdH0gJHtkZXBlbmRlbmNpZXNbIHRoaXMucmVwbyBdLnNoYX1gICk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmICggKCBhd2FpdCB0aGlzLmdldFNpbVZlcnNpb24oKSApLnRlc3RUeXBlID09PSAncmMnICYmIHRoaXMuaXNSZWxlYXNlZCApIHtcbiAgICAgICAgICAgIHJlc3VsdHMucHVzaCggJ1tJTkZPXSBSZWxlYXNlIGNhbmRpZGF0ZSB2ZXJzaW9uIGRldGVjdGVkIChzZWUgaWYgdGhlcmUgaXMgYSBRQSBpc3N1ZSknICk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGNhdGNoKCBlICkge1xuICAgICAgICAgIHJlc3VsdHMucHVzaCggYFtFUlJPUl0gRmFpbHVyZSB0byBjaGVjayBjdXJyZW50L3ByZXZpb3VzIGNvbW1pdDogJHtlLm1lc3NhZ2V9YCApO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgcmVzdWx0cy5wdXNoKCAnW1dBUk5JTkddIE93biByZXBvc2l0b3J5IG5vdCBpbmNsdWRlZCBpbiBkZXBlbmRlbmNpZXMnICk7XG4gICAgICB9XG5cbiAgICAgIGZvciAoIGNvbnN0IGRlcGVuZGVuY3kgb2YgZGVwZW5kZW5jeU5hbWVzICkge1xuICAgICAgICBjb25zdCBwb3RlbnRpYWxSZWxlYXNlQnJhbmNoID0gYCR7dGhpcy5yZXBvfS0ke3RoaXMuYnJhbmNofWA7XG4gICAgICAgIGNvbnN0IGJyYW5jaE1hcCA9IGF3YWl0IGdldEJyYW5jaE1hcEFzeW5jQ2FsbGJhY2soIGRlcGVuZGVuY3kgKTtcblxuICAgICAgICBpZiAoIE9iamVjdC5rZXlzKCBicmFuY2hNYXAgKS5pbmNsdWRlcyggcG90ZW50aWFsUmVsZWFzZUJyYW5jaCApICkge1xuICAgICAgICAgIGlmICggZGVwZW5kZW5jaWVzWyBkZXBlbmRlbmN5IF0uc2hhICE9PSBicmFuY2hNYXBbIHBvdGVudGlhbFJlbGVhc2VCcmFuY2ggXSApIHtcbiAgICAgICAgICAgIHJlc3VsdHMucHVzaCggYFtXQVJOSU5HXSBEZXBlbmRlbmN5IG1pc21hdGNoIGZvciAke2RlcGVuZGVuY3l9IG9uIGJyYW5jaCAke3BvdGVudGlhbFJlbGVhc2VCcmFuY2h9YCApO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICByZXR1cm4gcmVzdWx0cztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIHdoZXRoZXIgdGhlIHNpbSBpcyBjb21wYXRpYmxlIHdpdGggRVM2IGZlYXR1cmVzXG4gICAgICogQHB1YmxpY1xuICAgICAqXG4gICAgICogQHJldHVybnMge1Byb21pc2U8Ym9vbGVhbj59XG4gICAgICovXG4gICAgYXN5bmMgdXNlc0VTNigpIHtcbiAgICAgIGNvbnN0IGRlcGVuZGVuY2llcyA9IGF3YWl0IHRoaXMuZ2V0RGVwZW5kZW5jaWVzKCk7XG5cbiAgICAgIGNvbnN0IHNoYSA9IGRlcGVuZGVuY2llcy5jaGlwcGVyLnNoYTtcblxuICAgICAgcmV0dXJuIGdpdElzQW5jZXN0b3IoICdjaGlwcGVyJywgJzgwYjRhZDYyY2Q4ZjIwNTdiODQ0ZjE4ZDNjMDBjZjVjMGM4OWVkOGQnLCBzaGEgKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIHdoZXRoZXIgdGhpcyBzaW0gdXNlcyBpbml0aWFsaXplLWdsb2JhbHMgYmFzZWQgcXVlcnkgcGFyYW1ldGVyc1xuICAgICAqIEBwdWJsaWNcbiAgICAgKlxuICAgICAqIElmIHRydWU6XG4gICAgICogICBwaGV0LmNoaXBwZXIucXVlcnlQYXJhbWV0ZXJzLldIQVRFVkVSXG4gICAgICogICBBTkQgaXQgbmVlZHMgdG8gYmUgaW4gdGhlIHNjaGVtYVxuICAgICAqXG4gICAgICogSWYgZmFsc2U6XG4gICAgICogICBwaGV0LmNoaXBwZXIuZ2V0UXVlcnlQYXJhbWV0ZXIoICdXSEFURVZFUicgKVxuICAgICAqICAgRkxBR1Mgc2hvdWxkIHVzZSAhIXBoZXQuY2hpcHBlci5nZXRRdWVyeVBhcmFtZXRlciggJ1dIQVRFVkVSJyApXG4gICAgICpcbiAgICAgKiBAcmV0dXJucyB7UHJvbWlzZTxib29sZWFuPn1cbiAgICAgKi9cbiAgICBhc3luYyB1c2VzSW5pdGlhbGl6ZUdsb2JhbHNRdWVyeVBhcmFtZXRlcnMoKSB7XG4gICAgICBjb25zdCBkZXBlbmRlbmNpZXMgPSBhd2FpdCB0aGlzLmdldERlcGVuZGVuY2llcygpO1xuXG4gICAgICBjb25zdCBzaGEgPSBkZXBlbmRlbmNpZXMuY2hpcHBlci5zaGE7XG5cbiAgICAgIHJldHVybiBnaXRJc0FuY2VzdG9yKCAnY2hpcHBlcicsICdlNDU0Zjg4ZmY1MWQxZTNmYWJkYjNhMDc2ZDc0MDdhMmE5ZTkxMzNjJywgc2hhICk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmV0dXJucyB3aGV0aGVyIHBoZXQtaW8uc3RhbmRhbG9uZSBpcyB0aGUgY29ycmVjdCBwaGV0LWlvIHF1ZXJ5IHBhcmFtZXRlciAob3RoZXJ3aXNlIGl0J3MgdGhlIG5ld2VyXG4gICAgICogcGhldGlvU3RhbmRhbG9uZSkuXG4gICAgICogTG9va3MgZm9yIHRoZSBwcmVzZW5jZSBvZiBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvY2hpcHBlci9jb21taXQvNDgxNGQ2OTY2YzU0ZjI1MGIxYzBmMzkwOWI3MWYyYjljZmNjNzY2NS5cbiAgICAgKiBAcHVibGljXG4gICAgICpcbiAgICAgKiBAcmV0dXJucyB7UHJvbWlzZS48Ym9vbGVhbj59XG4gICAgICovXG4gICAgYXN5bmMgdXNlc09sZFBoZXRpb1N0YW5kYWxvbmUoKSB7XG4gICAgICBjb25zdCBkZXBlbmRlbmNpZXMgPSBhd2FpdCB0aGlzLmdldERlcGVuZGVuY2llcygpO1xuXG4gICAgICBjb25zdCBzaGEgPSBkZXBlbmRlbmNpZXMuY2hpcHBlci5zaGE7XG5cbiAgICAgIHJldHVybiAhKCBhd2FpdCBnaXRJc0FuY2VzdG9yKCAnY2hpcHBlcicsICc0ODE0ZDY5NjZjNTRmMjUwYjFjMGYzOTA5YjcxZjJiOWNmY2M3NjY1Jywgc2hhICkgKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIHdoZXRoZXIgdGhlIHJlbGF0aXZlU2ltUGF0aCBxdWVyeSBwYXJhbWV0ZXIgaXMgdXNlZCBmb3Igd3JhcHBlcnMgKGluc3RlYWQgb2YgbGF1bmNoTG9jYWxWZXJzaW9uKS5cbiAgICAgKiBMb29rcyBmb3IgdGhlIHByZXNlbmNlIG9mIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9waGV0LWlvL2NvbW1pdC9lM2ZjMjYwNzkzNThkODYwNzQzNThhNmRiM2ViYWYxYWY5NzI1NjMyXG4gICAgICogQHB1YmxpY1xuICAgICAqXG4gICAgICogQHJldHVybnMge1Byb21pc2UuPGJvb2xlYW4+fVxuICAgICAqL1xuICAgIGFzeW5jIHVzZXNSZWxhdGl2ZVNpbVBhdGgoKSB7XG4gICAgICBjb25zdCBkZXBlbmRlbmNpZXMgPSBhd2FpdCB0aGlzLmdldERlcGVuZGVuY2llcygpO1xuXG4gICAgICBpZiAoICFkZXBlbmRlbmNpZXNbICdwaGV0LWlvJyBdICkge1xuICAgICAgICByZXR1cm4gdHJ1ZTsgLy8gRG9lc24ndCByZWFsbHkgbWF0dGVyIG5vdywgZG9lcyBpdD9cbiAgICAgIH1cblxuICAgICAgY29uc3Qgc2hhID0gZGVwZW5kZW5jaWVzWyAncGhldC1pbycgXS5zaGE7XG5cbiAgICAgIHJldHVybiBnaXRJc0FuY2VzdG9yKCAncGhldC1pbycsICdlM2ZjMjYwNzkzNThkODYwNzQzNThhNmRiM2ViYWYxYWY5NzI1NjMyJywgc2hhICk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmV0dXJucyB3aGV0aGVyIHBoZXQtaW8gU3R1ZGlvIGlzIGJlaW5nIHVzZWQgaW5zdGVhZCBvZiBkZXByZWNhdGVkIGluc3RhbmNlIHByb3hpZXMgd3JhcHBlci5cbiAgICAgKiBAcHVibGljXG4gICAgICpcbiAgICAgKiBAcmV0dXJucyB7UHJvbWlzZS48Ym9vbGVhbj59XG4gICAgICovXG4gICAgYXN5bmMgdXNlc1BoZXRpb1N0dWRpbygpIHtcbiAgICAgIGNvbnN0IGRlcGVuZGVuY2llcyA9IGF3YWl0IHRoaXMuZ2V0RGVwZW5kZW5jaWVzKCk7XG5cbiAgICAgIGNvbnN0IHNoYSA9IGRlcGVuZGVuY2llcy5jaGlwcGVyLnNoYTtcblxuICAgICAgcmV0dXJuIGdpdElzQW5jZXN0b3IoICdjaGlwcGVyJywgJzczNzVmNmE1N2I1ODc0YjZiYmY5N2E1NGM5YTkwOGYxOWY4OGQzOGYnLCBzaGEgKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIHdoZXRoZXIgcGhldC1pbyBTdHVkaW8gdG9wLWxldmVsIChpbmRleC5odG1sKSBpcyB1c2VkIGluc3RlYWQgb2Ygc3R1ZGlvLmh0bWwuXG4gICAgICogQHB1YmxpY1xuICAgICAqXG4gICAgICogQHJldHVybnMge1Byb21pc2UuPGJvb2xlYW4+fVxuICAgICAqL1xuICAgIGFzeW5jIHVzZXNQaGV0aW9TdHVkaW9JbmRleCgpIHtcbiAgICAgIGNvbnN0IGRlcGVuZGVuY2llcyA9IGF3YWl0IHRoaXMuZ2V0RGVwZW5kZW5jaWVzKCk7XG5cbiAgICAgIGNvbnN0IGRlcGVuZGVuY3kgPSBkZXBlbmRlbmNpZXNbICdwaGV0LWlvLXdyYXBwZXJzJyBdO1xuICAgICAgaWYgKCAhZGVwZW5kZW5jeSApIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuXG4gICAgICBjb25zdCBzaGEgPSBkZXBlbmRlbmN5LnNoYTtcblxuICAgICAgcmV0dXJuIGdpdElzQW5jZXN0b3IoICdwaGV0LWlvLXdyYXBwZXJzJywgJzdlYzFhMDRhNzBmYjk3MDdiMzgxYjhiY2FiM2FkMDcwODE1ZWY3ZmUnLCBzaGEgKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIHdoZXRoZXIgdGhlIHNpbSBpcyBhIFwiSHlkcm9nZW5cIiBwaGV0LWlvIHNpbS5cbiAgICAgKiBAcHVibGljXG4gICAgICpcbiAgICAgKiBAcmV0dXJucyB7UHJvbWlzZTxib29sZWFuPn1cbiAgICAgKi9cbiAgICBhc3luYyBpc1BoZXRpb0h5ZHJvZ2VuKCkge1xuICAgICAgcmV0dXJuIHRoaXMuYnJhbmRzLmluY2x1ZGVzKCAncGhldC1pbycgKSAmJlxuICAgICAgICAgICAgIHRoaXMuaW5jbHVkZXNTSEEoICdwaGV0LWlvLXdyYXBwZXJzJywgJzdlOGQ5NzAyMGM2NDUxZjY4ZTg5OGFlODNhYTQzNTkzYjU1NTEzN2YnICk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmV0dXJucyB3aGV0aGVyIGFuIGFkZGl0aW9uYWwgZm9sZGVyIGV4aXN0cyBpbiB0aGUgYnVpbGQgZGlyZWN0b3J5IG9mIHRoZSBzaW0gYmFzZWQgb24gdGhlIGJyYW5kLlxuICAgICAqIEBwdWJsaWNcbiAgICAgKlxuICAgICAqIEByZXR1cm5zIHtQcm9taXNlLjxib29sZWFuPn1cbiAgICAgKi9cbiAgICBhc3luYyB1c2VzQ2hpcHBlcjIoKSB7XG4gICAgICBjb25zdCBkZXBlbmRlbmNpZXMgPSBhd2FpdCB0aGlzLmdldERlcGVuZGVuY2llcygpO1xuXG4gICAgICBjb25zdCBjaGlwcGVyUGFja2FnZUpTT04gPSBKU09OLnBhcnNlKCBhd2FpdCBnaXRDYXRGaWxlKCAnY2hpcHBlcicsICdwYWNrYWdlLmpzb24nLCBkZXBlbmRlbmNpZXMuY2hpcHBlci5zaGEgKSApO1xuICAgICAgY29uc3QgY2hpcHBlclZlcnNpb24gPSBDaGlwcGVyVmVyc2lvbi5nZXRGcm9tUGFja2FnZUpTT04oIGNoaXBwZXJQYWNrYWdlSlNPTiApO1xuXG4gICAgICByZXR1cm4gY2hpcHBlclZlcnNpb24ubWFqb3IgIT09IDAgfHwgY2hpcHBlclZlcnNpb24ubWlub3IgIT09IDA7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUnVucyBhIHByZWRpY2F0ZSBmdW5jdGlvbiB3aXRoIHRoZSBjb250ZW50cyBvZiBhIHNwZWNpZmljIGZpbGUncyBjb250ZW50cyBpbiB0aGUgcmVsZWFzZSBicmFuY2ggKHdpdGggZmFsc2UgaWZcbiAgICAgKiBpdCBkb2Vzbid0IGV4aXN0KS5cbiAgICAgKiBAcHVibGljXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gZmlsZVxuICAgICAqIEBwYXJhbSB7ZnVuY3Rpb24oY29udGVudHM6c3RyaW5nKTpib29sZWFufSBwcmVkaWNhdGVcbiAgICAgKiBAcmV0dXJucyB7UHJvbWlzZS48Ym9vbGVhbj59XG4gICAgICovXG4gICAgYXN5bmMgd2l0aEZpbGUoIGZpbGUsIHByZWRpY2F0ZSApIHtcbiAgICAgIGF3YWl0IHRoaXMuY2hlY2tvdXQoIGZhbHNlICk7XG5cbiAgICAgIGlmICggZnMuZXhpc3RzU3luYyggZmlsZSApICkge1xuICAgICAgICBjb25zdCBjb250ZW50cyA9IGZzLnJlYWRGaWxlU3luYyggZmlsZSwgJ3V0Zi04JyApO1xuICAgICAgICByZXR1cm4gcHJlZGljYXRlKCBjb250ZW50cyApO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmUtcnVucyBhIHByb2R1Y3Rpb24gZGVwbG95IGZvciBhIHNwZWNpZmljIGJyYW5jaCAoYmFzZWQgb24gdGhlIFNIQXMgYXQgdGhlIHRpcCBvZiB0aGUgcmVsZWFzZSBicmFuY2gpXG4gICAgICogQHB1YmxpY1xuICAgICAqL1xuICAgIGFzeW5jIHJlZGVwbG95QnJhbmNoVGlwVG9Qcm9kdWN0aW9uKCBsb2NhbGVzID0gJyonICkge1xuICAgICAgaWYgKCB0aGlzLmlzUmVsZWFzZWQgKSB7XG4gICAgICAgIGF3YWl0IGNoZWNrb3V0VGFyZ2V0KCB0aGlzLnJlcG8sIHRoaXMuYnJhbmNoLCBmYWxzZSApO1xuXG4gICAgICAgIGNvbnN0IHZlcnNpb24gPSBhd2FpdCBnZXRSZXBvVmVyc2lvbiggdGhpcy5yZXBvICk7XG4gICAgICAgIGNvbnN0IGRlcGVuZGVuY2llcyA9IGF3YWl0IGdldERlcGVuZGVuY2llcyggdGhpcy5yZXBvICk7XG5cbiAgICAgICAgYXdhaXQgY2hlY2tvdXRNYWluKCB0aGlzLnJlcG8sIGZhbHNlICk7XG5cbiAgICAgICAgYXdhaXQgYnVpbGRTZXJ2ZXJSZXF1ZXN0KCB0aGlzLnJlcG8sIHZlcnNpb24sIHRoaXMuYnJhbmNoLCBkZXBlbmRlbmNpZXMsIHtcbiAgICAgICAgICBsb2NhbGVzOiBsb2NhbGVzLFxuICAgICAgICAgIGJyYW5kczogdGhpcy5icmFuZHMsXG4gICAgICAgICAgc2VydmVyczogWyAncHJvZHVjdGlvbicgXVxuICAgICAgICB9ICk7XG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCAnU2hvdWxkIG5vdCByZWRlcGxveSBhIG5vbi1yZWxlYXNlZCBicmFuY2gnICk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmUtcnVucyBhIHByb2R1Y3Rpb24gZGVwbG95IGZvciBhIHNwZWNpZmljIGJyYW5jaCAoYmFzZWQgb24gdGhlIFNIQXMgdGhhdCB3ZXJlIG1vc3QgcmVjZW50bHkgcHJvZHVjdGlvbiBkZXBsb3llZClcbiAgICAgKiBAcHVibGljXG4gICAgICovXG4gICAgYXN5bmMgcmVkZXBsb3lMYXN0RGVwbG95ZWRTSEFzVG9Qcm9kdWN0aW9uKCBsb2NhbGVzID0gJyonICkge1xuICAgICAgaWYgKCAhdGhpcy5pc1JlbGVhc2VkICkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoICdTaG91bGQgbm90IHJlZGVwbG95IGEgbm9uLXJlbGVhc2VkIGJyYW5jaCcgKTtcbiAgICAgIH1cbiAgICAgIGlmICggdGhpcy5icmFuY2guaW5jbHVkZXMoICctcGhldGlvJyApICkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoICd1bnN1cHBvcnRlZCBzdWZmaXggLXBoZXRpbycgKTtcbiAgICAgIH1cblxuICAgICAgbGV0IHVybDsgLy8gc3RyaW5nXG4gICAgICBsZXQgdmVyc2lvbjsgLy8gU2ltVmVyc2lvblxuICAgICAgaWYgKCB0aGlzLmJyYW5kcy5pbmNsdWRlcyggJ3BoZXQnICkgKSB7XG4gICAgICAgIGNvbnN0IG1ldGFkYXRhID0gYXdhaXQgc2ltTWV0YWRhdGEoIHtcbiAgICAgICAgICBsb2NhbGU6ICdlbicsXG4gICAgICAgICAgc2ltdWxhdGlvbjogdGhpcy5yZXBvXG4gICAgICAgIH0gKTtcblxuICAgICAgICBjb25zdCBwcm9qZWN0ID0gbWV0YWRhdGEucHJvamVjdHMuZmluZCggcHJvamVjdCA9PiBwcm9qZWN0Lm5hbWUgPT09IGBodG1sLyR7dGhpcy5yZXBvfWAgKTtcbiAgICAgICAgdmVyc2lvbiA9IFNpbVZlcnNpb24ucGFyc2UoIHByb2plY3QudmVyc2lvbi5zdHJpbmcgKTtcbiAgICAgICAgdXJsID0gYGh0dHBzOi8vcGhldC5jb2xvcmFkby5lZHUvc2ltcy9odG1sLyR7dGhpcy5yZXBvfS8ke3ZlcnNpb24udG9TdHJpbmcoKX0vZGVwZW5kZW5jaWVzLmpzb25gO1xuICAgICAgfVxuICAgICAgZWxzZSBpZiAoIHRoaXMuYnJhbmRzLmluY2x1ZGVzKCAncGhldC1pbycgKSApIHtcbiAgICAgICAgY29uc3QgbWV0YWRhdGEgPSBhd2FpdCBzaW1QaGV0aW9NZXRhZGF0YSgge1xuICAgICAgICAgIGFjdGl2ZTogdHJ1ZVxuICAgICAgICB9ICk7XG5cbiAgICAgICAgY29uc3QgbG9jYWxWZXJzaW9uID0gYXdhaXQgdGhpcy5nZXRTaW1WZXJzaW9uKCk7XG4gICAgICAgIGNvbnN0IHNpbURhdGEgPSBtZXRhZGF0YS5maW5kKCBzaW1EYXRhID0+IHNpbURhdGEubmFtZSA9PT0gdGhpcy5yZXBvICYmIHNpbURhdGEudmVyc2lvbk1ham9yID09PSBsb2NhbFZlcnNpb24ubWFqb3IgJiYgc2ltRGF0YS52ZXJzaW9uTWlub3IgPT09IGxvY2FsVmVyc2lvbi5taW5vciApO1xuXG4gICAgICAgIHZlcnNpb24gPSBuZXcgU2ltVmVyc2lvbiggc2ltRGF0YS52ZXJzaW9uTWFqb3IsIHNpbURhdGEudmVyc2lvbk1pbm9yLCBzaW1EYXRhLnZlcnNpb25NYWludGVuYW5jZSApO1xuICAgICAgICB1cmwgPSBgaHR0cHM6Ly9waGV0LWlvLmNvbG9yYWRvLmVkdS9zaW1zLyR7dGhpcy5yZXBvfS8ke3ZlcnNpb24ubWFqb3J9LiR7dmVyc2lvbi5taW5vcn0vZGVwZW5kZW5jaWVzLmpzb25gO1xuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvciggJ3Vua25vd24gZGVwbG95ZWQgYnJhbmQnICk7XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IGRlcGVuZGVuY2llcyA9ICggYXdhaXQgYXhpb3MuZ2V0KCB1cmwgKSApLmRhdGE7XG5cbiAgICAgIGlmICggZGVwZW5kZW5jaWVzICkge1xuICAgICAgICBhd2FpdCBidWlsZFNlcnZlclJlcXVlc3QoIHRoaXMucmVwbywgdmVyc2lvbiwgdGhpcy5icmFuY2gsIGRlcGVuZGVuY2llcywge1xuICAgICAgICAgIGxvY2FsZXM6IGxvY2FsZXMsXG4gICAgICAgICAgYnJhbmRzOiB0aGlzLmJyYW5kcyxcbiAgICAgICAgICBzZXJ2ZXJzOiBbICdwcm9kdWN0aW9uJyBdXG4gICAgICAgIH0gKTtcbiAgICAgIH1cbiAgICAgIGVsc2Uge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoICdubyBkZXBlbmRlbmNpZXMnICk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmVkZXBsb3lzIGFsbCBsYXN0IGRlcGxveWVkIFNIQXMgdG8gcHJvZHVjdGlvbiBmb3IgYWxsIG1haW50ZW5hbmNlIGJyYW5jaGVzLlxuICAgICAqIEBwdWJsaWNcbiAgICAgKi9cbiAgICBzdGF0aWMgYXN5bmMgcmVkZXBsb3lBbGxMYXN0RGVwbG95ZWRTSEFzVG9Qcm9kdWN0aW9uKCBsb2NhbGVzID0gJyonICkge1xuICAgICAgY29uc3QgcmVsZWFzZUJyYW5jaGVzID0gYXdhaXQgUmVsZWFzZUJyYW5jaC5nZXRBbGxNYWludGVuYW5jZUJyYW5jaGVzKCk7XG5cbiAgICAgIGZvciAoIGNvbnN0IHJlbGVhc2VCcmFuY2ggb2YgcmVsZWFzZUJyYW5jaGVzICkge1xuICAgICAgICBjb25zb2xlLmxvZyggcmVsZWFzZUJyYW5jaC50b1N0cmluZygpICk7XG5cbiAgICAgICAgaWYgKCByZWxlYXNlQnJhbmNoLmlzUmVsZWFzZWQgJiYgIXJlbGVhc2VCcmFuY2guYnJhbmNoLmluY2x1ZGVzKCAnLXBoZXRpbycgKSApIHtcbiAgICAgICAgICBhd2FpdCByZWxlYXNlQnJhbmNoLnJlZGVwbG95TGFzdERlcGxveWVkU0hBc1RvUHJvZHVjdGlvbiggbG9jYWxlcyApO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogR2V0cyBhIGxpc3Qgb2YgUmVsZWFzZUJyYW5jaGVzIHdoaWNoIHdvdWxkIGJlIHBvdGVudGlhbCBjYW5kaWRhdGVzIGZvciBhIG1haW50ZW5hbmNlIHJlbGVhc2UuIFRoaXMgaW5jbHVkZXM6XG4gICAgICogLSBBbGwgcHVibGlzaGVkIHBoZXQgYnJhbmQgcmVsZWFzZSBicmFuY2hlcyAoZnJvbSBtZXRhZGF0YSlcbiAgICAgKiAtIEFsbCBwdWJsaXNoZWQgcGhldC1pbyBicmFuZCByZWxlYXNlIGJyYW5jaGVzIChmcm9tIG1ldGFkYXRhKVxuICAgICAqIC0gQWxsIHVucHVibGlzaGVkIGxvY2FsIHJlbGVhc2UgYnJhbmNoZXNcbiAgICAgKlxuICAgICAqIEBwdWJsaWNcbiAgICAgKiBAcmV0dXJucyB7UHJvbWlzZS48UmVsZWFzZUJyYW5jaFtdPn1cbiAgICAgKiBAcmVqZWN0cyB7RXhlY3V0ZUVycm9yfVxuICAgICAqL1xuICAgIHN0YXRpYyBhc3luYyBnZXRBbGxNYWludGVuYW5jZUJyYW5jaGVzKCkge1xuICAgICAgd2luc3Rvbi5kZWJ1ZyggJ3JldHJpZXZpbmcgYXZhaWxhYmxlIHNpbSBicmFuY2hlcycgKTtcblxuICAgICAgY29uc29sZS5sb2coICdsb2FkaW5nIHBoZXQgYnJhbmQgUmVsZWFzZUJyYW5jaGVzJyApO1xuICAgICAgY29uc3Qgc2ltTWV0YWRhdGFSZXN1bHQgPSBhd2FpdCBzaW1NZXRhZGF0YSgge1xuICAgICAgICB0eXBlOiAnaHRtbCdcbiAgICAgIH0gKTtcblxuICAgICAgLy8gUmVsZWFzZWQgcGhldCBicmFuY2hlc1xuICAgICAgY29uc3QgcGhldEJyYW5jaGVzID0gc2ltTWV0YWRhdGFSZXN1bHQucHJvamVjdHMubWFwKCBzaW1EYXRhID0+IHtcbiAgICAgICAgY29uc3QgcmVwbyA9IHNpbURhdGEubmFtZS5zbGljZSggc2ltRGF0YS5uYW1lLmluZGV4T2YoICcvJyApICsgMSApO1xuICAgICAgICBjb25zdCBicmFuY2ggPSBgJHtzaW1EYXRhLnZlcnNpb24ubWFqb3J9LiR7c2ltRGF0YS52ZXJzaW9uLm1pbm9yfWA7XG4gICAgICAgIHJldHVybiBuZXcgUmVsZWFzZUJyYW5jaCggcmVwbywgYnJhbmNoLCBbICdwaGV0JyBdLCB0cnVlICk7XG4gICAgICB9ICk7XG5cbiAgICAgIGNvbnNvbGUubG9nKCAnbG9hZGluZyBwaGV0LWlvIGJyYW5kIFJlbGVhc2VCcmFuY2hlcycgKTtcbiAgICAgIGNvbnN0IHBoZXRpb0JyYW5jaGVzID0gKCBhd2FpdCBzaW1QaGV0aW9NZXRhZGF0YSgge1xuICAgICAgICBhY3RpdmU6IHRydWUsXG4gICAgICAgIGxhdGVzdDogdHJ1ZVxuICAgICAgfSApICkuZmlsdGVyKCBzaW1EYXRhID0+IHNpbURhdGEuYWN0aXZlICYmIHNpbURhdGEubGF0ZXN0ICkubWFwKCBzaW1EYXRhID0+IHtcbiAgICAgICAgbGV0IGJyYW5jaCA9IGAke3NpbURhdGEudmVyc2lvbk1ham9yfS4ke3NpbURhdGEudmVyc2lvbk1pbm9yfWA7XG4gICAgICAgIGlmICggc2ltRGF0YS52ZXJzaW9uU3VmZml4Lmxlbmd0aCApIHtcbiAgICAgICAgICBicmFuY2ggKz0gYC0ke3NpbURhdGEudmVyc2lvblN1ZmZpeH1gOyAvLyBhZGRpdGlvbmFsIGRhc2ggcmVxdWlyZWRcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbmV3IFJlbGVhc2VCcmFuY2goIHNpbURhdGEubmFtZSwgYnJhbmNoLCBbICdwaGV0LWlvJyBdLCB0cnVlICk7XG4gICAgICB9ICk7XG5cbiAgICAgIGNvbnNvbGUubG9nKCAnbG9hZGluZyB1bnJlbGVhc2VkIFJlbGVhc2VCcmFuY2hlcycgKTtcbiAgICAgIGNvbnN0IHVucmVsZWFzZWRCcmFuY2hlcyA9IFtdO1xuICAgICAgZm9yICggY29uc3QgcmVwbyBvZiBnZXRBY3RpdmVTaW1zKCkgKSB7XG5cbiAgICAgICAgLy8gRXhjbHVkZSBleHBsaWNpdGx5IGV4Y2x1ZGVkIHJlcG9zXG4gICAgICAgIGlmICggSlNPTi5wYXJzZSggZnMucmVhZEZpbGVTeW5jKCBgLi4vJHtyZXBvfS9wYWNrYWdlLmpzb25gLCAndXRmOCcgKSApLnBoZXQuaWdub3JlRm9yQXV0b21hdGVkTWFpbnRlbmFuY2VSZWxlYXNlcyApIHtcbiAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGJyYW5jaGVzID0gYXdhaXQgZ2V0QnJhbmNoZXMoIHJlcG8gKTtcbiAgICAgICAgY29uc3QgcmVsZWFzZWRCcmFuY2hlcyA9IHBoZXRCcmFuY2hlcy5jb25jYXQoIHBoZXRpb0JyYW5jaGVzICk7XG5cbiAgICAgICAgZm9yICggY29uc3QgYnJhbmNoIG9mIGJyYW5jaGVzICkge1xuICAgICAgICAgIC8vIFdlIGFyZW4ndCB1bnJlbGVhc2VkIGlmIHdlJ3JlIGluY2x1ZGVkIGluIGVpdGhlciBwaGV0IG9yIHBoZXQtaW8gbWV0YWRhdGEuXG4gICAgICAgICAgLy8gU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9iYWxhbmNpbmctYWN0L2lzc3Vlcy8xMThcbiAgICAgICAgICBpZiAoIHJlbGVhc2VkQnJhbmNoZXMuZmlsdGVyKCByZWxlYXNlQnJhbmNoID0+IHJlbGVhc2VCcmFuY2gucmVwbyA9PT0gcmVwbyAmJiByZWxlYXNlQnJhbmNoLmJyYW5jaCA9PT0gYnJhbmNoICkubGVuZ3RoICkge1xuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgY29uc3QgbWF0Y2ggPSBicmFuY2gubWF0Y2goIC9eKFxcZCspXFwuKFxcZCspJC8gKTtcblxuICAgICAgICAgIGlmICggbWF0Y2ggKSB7XG4gICAgICAgICAgICBjb25zdCBtYWpvciA9IE51bWJlciggbWF0Y2hbIDEgXSApO1xuICAgICAgICAgICAgY29uc3QgbWlub3IgPSBOdW1iZXIoIG1hdGNoWyAyIF0gKTtcblxuICAgICAgICAgICAgLy8gQXNzdW1wdGlvbiB0aGF0IHRoZXJlIGlzIG5vIHBoZXQtaW8gYnJhbmQgc2ltIHRoYXQgaXNuJ3QgYWxzbyByZWxlYXNlZCB3aXRoIHBoZXQgYnJhbmRcbiAgICAgICAgICAgIGNvbnN0IHByb2plY3RNZXRhZGF0YSA9IHNpbU1ldGFkYXRhUmVzdWx0LnByb2plY3RzLmZpbmQoIHByb2plY3QgPT4gcHJvamVjdC5uYW1lID09PSBgaHRtbC8ke3JlcG99YCApIHx8IG51bGw7XG4gICAgICAgICAgICBjb25zdCBwcm9kdWN0aW9uVmVyc2lvbiA9IHByb2plY3RNZXRhZGF0YSA/IHByb2plY3RNZXRhZGF0YS52ZXJzaW9uIDogbnVsbDtcblxuICAgICAgICAgICAgaWYgKCAhcHJvZHVjdGlvblZlcnNpb24gfHxcbiAgICAgICAgICAgICAgICAgbWFqb3IgPiBwcm9kdWN0aW9uVmVyc2lvbi5tYWpvciB8fFxuICAgICAgICAgICAgICAgICAoIG1ham9yID09PSBwcm9kdWN0aW9uVmVyc2lvbi5tYWpvciAmJiBtaW5vciA+IHByb2R1Y3Rpb25WZXJzaW9uLm1pbm9yICkgKSB7XG5cbiAgICAgICAgICAgICAgLy8gRG8gYSBjaGVja291dCBzbyB3ZSBjYW4gZGV0ZXJtaW5lIHN1cHBvcnRlZCBicmFuZHNcbiAgICAgICAgICAgICAgY29uc3QgcGFja2FnZU9iamVjdCA9IEpTT04ucGFyc2UoIGF3YWl0IGdldEZpbGVBdEJyYW5jaCggcmVwbywgYnJhbmNoLCAncGFja2FnZS5qc29uJyApICk7XG4gICAgICAgICAgICAgIGNvbnN0IGluY2x1ZGVzUGhldGlvID0gcGFja2FnZU9iamVjdC5waGV0ICYmIHBhY2thZ2VPYmplY3QucGhldC5zdXBwb3J0ZWRCcmFuZHMgJiYgcGFja2FnZU9iamVjdC5waGV0LnN1cHBvcnRlZEJyYW5kcy5pbmNsdWRlcyggJ3BoZXQtaW8nICk7XG5cbiAgICAgICAgICAgICAgY29uc3QgYnJhbmRzID0gW1xuICAgICAgICAgICAgICAgICdwaGV0JywgLy8gQXNzdW1wdGlvbiB0aGF0IHRoZXJlIGlzIG5vIHBoZXQtaW8gYnJhbmQgc2ltIHRoYXQgaXNuJ3QgYWxzbyByZWxlYXNlZCB3aXRoIHBoZXQgYnJhbmRcbiAgICAgICAgICAgICAgICAuLi4oIGluY2x1ZGVzUGhldGlvID8gWyAncGhldC1pbycgXSA6IFtdIClcbiAgICAgICAgICAgICAgXTtcblxuICAgICAgICAgICAgICBpZiAoICFwYWNrYWdlT2JqZWN0LnBoZXQuaWdub3JlRm9yQXV0b21hdGVkTWFpbnRlbmFuY2VSZWxlYXNlcyApIHtcbiAgICAgICAgICAgICAgICB1bnJlbGVhc2VkQnJhbmNoZXMucHVzaCggbmV3IFJlbGVhc2VCcmFuY2goIHJlcG8sIGJyYW5jaCwgYnJhbmRzLCBmYWxzZSApICk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgY29uc3QgYWxsUmVsZWFzZUJyYW5jaGVzID0gUmVsZWFzZUJyYW5jaC5jb21iaW5lTGlzdHMoIFsgLi4ucGhldEJyYW5jaGVzLCAuLi5waGV0aW9CcmFuY2hlcywgLi4udW5yZWxlYXNlZEJyYW5jaGVzIF0gKTtcblxuICAgICAgLy8gRkFNQiAyLjMtcGhldGlvIGtlZXBzIGVuZGluZyB1cCBpbiB0aGUgTVIgbGlzdCB3aGVuIHdlIGRvbid0IHdhbnQgaXQgdG8sIHNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvcGhldC1pby9pc3N1ZXMvMTk1Ny5cbiAgICAgIHJldHVybiBhbGxSZWxlYXNlQnJhbmNoZXMuZmlsdGVyKCByYiA9PiAhKCByYi5yZXBvID09PSAnZm9yY2VzLWFuZC1tb3Rpb24tYmFzaWNzJyAmJiByYi5icmFuY2ggPT09ICcyLjMtcGhldGlvJyApICk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ29tYmluZXMgbXVsdGlwbGUgbWF0Y2hpbmcgUmVsZWFzZUJyYW5jaGVzIGludG8gb25lIHdoZXJlIGFwcHJvcHJpYXRlLCBhbmQgc29ydHMuIEZvciBleGFtcGxlLCB0d28gUmVsZWFzZUJyYW5jaGVzXG4gICAgICogb2YgdGhlIHNhbWUgcmVwbyBidXQgZm9yIGRpZmZlcmVudCBicmFuZHMgYXJlIGNvbWJpbmVkIGludG8gYSBzaW5nbGUgUmVsZWFzZUJyYW5jaCB3aXRoIG11bHRpcGxlIGJyYW5kcy5cbiAgICAgKiBAcHVibGljXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge0FycmF5LjxSZWxlYXNlQnJhbmNoPn0gc2ltQnJhbmNoZXNcbiAgICAgKiBAcmV0dXJucyB7QXJyYXkuPFJlbGVhc2VCcmFuY2g+fVxuICAgICAqL1xuICAgIHN0YXRpYyBjb21iaW5lTGlzdHMoIHNpbUJyYW5jaGVzICkge1xuICAgICAgY29uc3QgcmVzdWx0QnJhbmNoZXMgPSBbXTtcblxuICAgICAgZm9yICggY29uc3Qgc2ltQnJhbmNoIG9mIHNpbUJyYW5jaGVzICkge1xuICAgICAgICBsZXQgZm91bmRCcmFuY2ggPSBmYWxzZTtcbiAgICAgICAgZm9yICggY29uc3QgcmVzdWx0QnJhbmNoIG9mIHJlc3VsdEJyYW5jaGVzICkge1xuICAgICAgICAgIGlmICggc2ltQnJhbmNoLnJlcG8gPT09IHJlc3VsdEJyYW5jaC5yZXBvICYmIHNpbUJyYW5jaC5icmFuY2ggPT09IHJlc3VsdEJyYW5jaC5icmFuY2ggKSB7XG4gICAgICAgICAgICBmb3VuZEJyYW5jaCA9IHRydWU7XG4gICAgICAgICAgICByZXN1bHRCcmFuY2guYnJhbmRzID0gWyAuLi5yZXN1bHRCcmFuY2guYnJhbmRzLCAuLi5zaW1CcmFuY2guYnJhbmRzIF07XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCAhZm91bmRCcmFuY2ggKSB7XG4gICAgICAgICAgcmVzdWx0QnJhbmNoZXMucHVzaCggc2ltQnJhbmNoICk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgcmVzdWx0QnJhbmNoZXMuc29ydCggKCBhLCBiICkgPT4ge1xuICAgICAgICBpZiAoIGEucmVwbyAhPT0gYi5yZXBvICkge1xuICAgICAgICAgIHJldHVybiBhLnJlcG8gPCBiLnJlcG8gPyAtMSA6IDE7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCBhLmJyYW5jaCAhPT0gYi5icmFuY2ggKSB7XG4gICAgICAgICAgcmV0dXJuIGEuYnJhbmNoIDwgYi5icmFuY2ggPyAtMSA6IDE7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIDA7XG4gICAgICB9ICk7XG5cbiAgICAgIHJldHVybiByZXN1bHRCcmFuY2hlcztcbiAgICB9XG4gIH1cblxuICByZXR1cm4gUmVsZWFzZUJyYW5jaDtcbn0gKSgpOyJdLCJuYW1lcyI6WyJidWlsZExvY2FsIiwicmVxdWlyZSIsImJ1aWxkU2VydmVyUmVxdWVzdCIsIkNoaXBwZXJWZXJzaW9uIiwiY2hlY2tvdXRNYWluIiwiY2hlY2tvdXRUYXJnZXQiLCJjcmVhdGVEaXJlY3RvcnkiLCJleGVjdXRlIiwiZGVmYXVsdCIsImdldEFjdGl2ZVNpbXMiLCJnZXRCcmFuY2hEZXBlbmRlbmNpZXMiLCJnZXRCcmFuY2hlcyIsImdldEJ1aWxkQXJndW1lbnRzIiwiZ2V0RGVwZW5kZW5jaWVzIiwiZ2V0QnJhbmNoTWFwIiwiZ2V0QnJhbmNoVmVyc2lvbiIsImdldEZpbGVBdEJyYW5jaCIsImdldFJlcG9WZXJzaW9uIiwiZ2l0Q2hlY2tvdXQiLCJnaXRDYXRGaWxlIiwiZ2l0Q2hlY2tvdXREaXJlY3RvcnkiLCJnaXRDbG9uZU9yRmV0Y2hEaXJlY3RvcnkiLCJnaXRGaXJzdERpdmVyZ2luZ0NvbW1pdCIsImdpdElzQW5jZXN0b3IiLCJjaGlwcGVyU3VwcG9ydHNPdXRwdXRKU0dydW50VGFza3MiLCJnaXRQdWxsIiwiZ2l0UHVsbERpcmVjdG9yeSIsImdpdFJldlBhcnNlIiwiZ2l0VGltZXN0YW1wIiwiZ3J1bnRDb21tYW5kIiwibG9hZEpTT04iLCJucG1VcGRhdGVEaXJlY3RvcnkiLCJwdXBwZXRlZXJMb2FkIiwic2ltTWV0YWRhdGEiLCJzaW1QaGV0aW9NZXRhZGF0YSIsIlNpbVZlcnNpb24iLCJ3aXRoU2VydmVyIiwiYXNzZXJ0IiwiZnMiLCJ3aW5zdG9uIiwiXyIsImF4aW9zIiwibW9kdWxlIiwiZXhwb3J0cyIsIk1BSU5URU5BTkNFX0RJUkVDVE9SWSIsIlJlbGVhc2VCcmFuY2giLCJzZXJpYWxpemUiLCJyZXBvIiwiYnJhbmNoIiwiYnJhbmRzIiwiaXNSZWxlYXNlZCIsImRlc2VyaWFsaXplIiwiZXF1YWxzIiwicmVsZWFzZUJyYW5jaCIsImpvaW4iLCJ0b1N0cmluZyIsImdldENoZWNrb3V0RGlyZWN0b3J5IiwiZ2V0TWFpbnRlbmFuY2VEaXJlY3RvcnkiLCJnZXRMb2NhbFBoZXRCdWlsdEhUTUxQYXRoIiwidXNlc0NoaXBwZXIyIiwiZ2V0TG9jYWxQaGV0SU9CdWlsdEhUTUxQYXRoIiwiZ2V0UGhldGlvU3RhbmRhbG9uZVF1ZXJ5UGFyYW1ldGVyIiwidXNlc09sZFBoZXRpb1N0YW5kYWxvbmUiLCJnZXRDaGlwcGVyVmVyc2lvbiIsImNoZWNrb3V0RGlyZWN0b3J5IiwiZ2V0RnJvbVBhY2thZ2VKU09OIiwiSlNPTiIsInBhcnNlIiwicmVhZEZpbGVTeW5jIiwidXBkYXRlQ2hlY2tvdXQiLCJvdmVycmlkZURlcGVuZGVuY2llcyIsImluZm8iLCJleGlzdHNTeW5jIiwiZGVwZW5kZW5jaWVzT25CcmFuY2hUaXAiLCJiYWJlbCIsInNoYSIsImJhYmVsQnJhbmNoIiwiZGVwZW5kZW5jeVJlcG9zIiwidW5pcSIsIk9iamVjdCIsImtleXMiLCJmaWx0ZXIiLCJQcm9taXNlIiwiYWxsIiwibWFwIiwicmVwb1B3ZCIsImJ1aWxkIiwib3B0aW9ucyIsInJlcG9EaXJlY3RvcnkiLCJhcmdzIiwibWVyZ2UiLCJhbGxIVE1MIiwiZGVidWdIVE1MIiwibGludCIsImxvY2FsZXMiLCJ0cmFuc3BpbGUiLCJlcnJvcnMiLCJjaGVja1VuYnVpbHQiLCJwb3J0IiwidXJsIiwid2FpdEFmdGVyTG9hZCIsImUiLCJwYXRoIiwiY2hlY2tCdWlsdCIsImVycm9yIiwiY2hlY2tvdXQiLCJpbmNsdWRlTnBtVXBkYXRlIiwiaW5jbHVkZXNTSEEiLCJyZXN1bHQiLCJkZXBlbmRlbmNpZXMiLCJjdXJyZW50U0hBIiwiaXNNaXNzaW5nU0hBIiwiZ2V0RGl2ZXJnaW5nU0hBIiwiZ2V0RGl2ZXJnaW5nVGltZXN0YW1wIiwiZ2V0U2ltVmVyc2lvbiIsImdldFN0YXR1cyIsImdldEJyYW5jaE1hcEFzeW5jQ2FsbGJhY2siLCJyZXN1bHRzIiwiZGVwZW5kZW5jeU5hbWVzIiwia2V5IiwiY3VycmVudENvbW1pdCIsInByZXZpb3VzQ29tbWl0IiwicHVzaCIsInRlc3RUeXBlIiwibWVzc2FnZSIsImRlcGVuZGVuY3kiLCJwb3RlbnRpYWxSZWxlYXNlQnJhbmNoIiwiYnJhbmNoTWFwIiwiaW5jbHVkZXMiLCJ1c2VzRVM2IiwiY2hpcHBlciIsInVzZXNJbml0aWFsaXplR2xvYmFsc1F1ZXJ5UGFyYW1ldGVycyIsInVzZXNSZWxhdGl2ZVNpbVBhdGgiLCJ1c2VzUGhldGlvU3R1ZGlvIiwidXNlc1BoZXRpb1N0dWRpb0luZGV4IiwiaXNQaGV0aW9IeWRyb2dlbiIsImNoaXBwZXJQYWNrYWdlSlNPTiIsImNoaXBwZXJWZXJzaW9uIiwibWFqb3IiLCJtaW5vciIsIndpdGhGaWxlIiwiZmlsZSIsInByZWRpY2F0ZSIsImNvbnRlbnRzIiwicmVkZXBsb3lCcmFuY2hUaXBUb1Byb2R1Y3Rpb24iLCJ2ZXJzaW9uIiwic2VydmVycyIsIkVycm9yIiwicmVkZXBsb3lMYXN0RGVwbG95ZWRTSEFzVG9Qcm9kdWN0aW9uIiwibWV0YWRhdGEiLCJsb2NhbGUiLCJzaW11bGF0aW9uIiwicHJvamVjdCIsInByb2plY3RzIiwiZmluZCIsIm5hbWUiLCJzdHJpbmciLCJhY3RpdmUiLCJsb2NhbFZlcnNpb24iLCJzaW1EYXRhIiwidmVyc2lvbk1ham9yIiwidmVyc2lvbk1pbm9yIiwidmVyc2lvbk1haW50ZW5hbmNlIiwiZ2V0IiwiZGF0YSIsInJlZGVwbG95QWxsTGFzdERlcGxveWVkU0hBc1RvUHJvZHVjdGlvbiIsInJlbGVhc2VCcmFuY2hlcyIsImdldEFsbE1haW50ZW5hbmNlQnJhbmNoZXMiLCJjb25zb2xlIiwibG9nIiwiZGVidWciLCJzaW1NZXRhZGF0YVJlc3VsdCIsInR5cGUiLCJwaGV0QnJhbmNoZXMiLCJzbGljZSIsImluZGV4T2YiLCJwaGV0aW9CcmFuY2hlcyIsImxhdGVzdCIsInZlcnNpb25TdWZmaXgiLCJsZW5ndGgiLCJ1bnJlbGVhc2VkQnJhbmNoZXMiLCJwaGV0IiwiaWdub3JlRm9yQXV0b21hdGVkTWFpbnRlbmFuY2VSZWxlYXNlcyIsImJyYW5jaGVzIiwicmVsZWFzZWRCcmFuY2hlcyIsImNvbmNhdCIsIm1hdGNoIiwiTnVtYmVyIiwicHJvamVjdE1ldGFkYXRhIiwicHJvZHVjdGlvblZlcnNpb24iLCJwYWNrYWdlT2JqZWN0IiwiaW5jbHVkZXNQaGV0aW8iLCJzdXBwb3J0ZWRCcmFuZHMiLCJhbGxSZWxlYXNlQnJhbmNoZXMiLCJjb21iaW5lTGlzdHMiLCJyYiIsInNpbUJyYW5jaGVzIiwicmVzdWx0QnJhbmNoZXMiLCJzaW1CcmFuY2giLCJmb3VuZEJyYW5jaCIsInJlc3VsdEJyYW5jaCIsInNvcnQiLCJhIiwiYiIsImNvbnN0cnVjdG9yIiwiQXJyYXkiLCJpc0FycmF5Il0sIm1hcHBpbmdzIjoiQUFBQSxpREFBaUQ7QUFFakQ7Ozs7Q0FJQzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFFRCxNQUFNQSxhQUFhQyxRQUFTO0FBQzVCLE1BQU1DLHFCQUFxQkQsUUFBUztBQUNwQyxNQUFNRSxpQkFBaUJGLFFBQVM7QUFDaEMsTUFBTUcsZUFBZUgsUUFBUztBQUM5QixNQUFNSSxpQkFBaUJKLFFBQVM7QUFDaEMsTUFBTUssa0JBQWtCTCxRQUFTO0FBQ2pDLE1BQU1NLFVBQVVOLFFBQVMsYUFBY08sT0FBTztBQUM5QyxNQUFNQyxnQkFBZ0JSLFFBQVM7QUFDL0IsTUFBTVMsd0JBQXdCVCxRQUFTO0FBQ3ZDLE1BQU1VLGNBQWNWLFFBQVM7QUFDN0IsTUFBTVcsb0JBQW9CWCxRQUFTO0FBQ25DLE1BQU1ZLGtCQUFrQlosUUFBUztBQUNqQyxNQUFNYSxlQUFlYixRQUFTO0FBQzlCLE1BQU1jLG1CQUFtQmQsUUFBUztBQUNsQyxNQUFNZSxrQkFBa0JmLFFBQVM7QUFDakMsTUFBTWdCLGlCQUFpQmhCLFFBQVM7QUFDaEMsTUFBTWlCLGNBQWNqQixRQUFTO0FBQzdCLE1BQU1rQixhQUFhbEIsUUFBUztBQUM1QixNQUFNbUIsdUJBQXVCbkIsUUFBUztBQUN0QyxNQUFNb0IsMkJBQTJCcEIsUUFBUztBQUMxQyxNQUFNcUIsMEJBQTBCckIsUUFBUztBQUN6QyxNQUFNc0IsZ0JB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