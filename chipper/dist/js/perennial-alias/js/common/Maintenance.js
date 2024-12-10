// Copyright 2018, University of Colorado Boulder
/**
 * The main persistent state-bearing object for maintenance releases. Can be loaded from or saved to a dedicated file.
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
const production = require('../grunt/production');
const rc = require('../grunt/rc');
const ChipperVersion = require('./ChipperVersion');
const ModifiedBranch = require('./ModifiedBranch');
const Patch = require('./Patch');
const ReleaseBranch = require('./ReleaseBranch');
const build = require('./build');
const checkoutMain = require('./checkoutMain');
const checkoutTarget = require('./checkoutTarget');
const execute = require('./execute').default;
const getActiveRepos = require('./getActiveRepos');
const getBranches = require('./getBranches');
const getBranchMap = require('./getBranchMap');
const getDependencies = require('./getDependencies');
const gitAdd = require('./gitAdd');
const gitCheckout = require('./gitCheckout');
const gitCherryPick = require('./gitCherryPick');
const gitCommit = require('./gitCommit');
const gitCreateBranch = require('./gitCreateBranch');
const gitIsClean = require('./gitIsClean');
const gitPull = require('./gitPull');
const gitPush = require('./gitPush');
const gitRevParse = require('./gitRevParse');
const assert = require('assert');
const asyncQ = require('async-q');
const _ = require('lodash');
const fs = require('fs');
const repl = require('repl');
const winston = require('winston');
const gruntCommand = require('./gruntCommand');
const chipperSupportsOutputJSGruntTasks = require('./chipperSupportsOutputJSGruntTasks');
// constants
const MAINTENANCE_FILE = '.maintenance.json';
// const PUBLIC_FUNCTIONS = [
//   'addAllNeededPatches',
//   'addNeededPatch',
//   'addNeededPatches',
//   'addNeededPatchesAfter',
//   'addNeededPatchesBefore',
//   'addNeededPatchesBuildFilter',
//   'addNeededPatchReleaseBranch',
//   'addPatchSHA',
//   'applyPatches',
//   'buildAll',
//   'checkBranchStatus',
//   'checkoutBranch',
//   'createPatch',
//   'deployProduction',
//   'deployReleaseCandidates',
//   'list',
//   'listLinks',
//   'removeNeededPatch',
//   'removeNeededPatches',
//   'removeNeededPatchesAfter',
//   'removeNeededPatchesBefore',
//   'removePatch',
//   'removePatchSHA',
//   'reset',
//   'updateDependencies'
//   'getAllMaintenanceBranches'
// ];
/**
 * @typedef SerializedMaintenance - see Maintenance.serialize()
 * @property {Array.<Object>} patches
 * @property {Array.<Object>} modifiedBranches
 * @property {Array.<Object>} allReleaseBranches
 */ module.exports = function() {
    let Maintenance = class Maintenance {
        /**
     * Resets ALL the maintenance state to a default "blank" state.
     * @public
     * @param keepCachedReleaseBranches {boolean} - allReleaseBranches take a while to populate, and have little to do
     *                                              with the current MR, so optionally keep them in storage.
     *
     * CAUTION: This will remove any information about any ongoing/complete maintenance release from your
     * .maintenance.json. Generally this should be done before any new maintenance release.
     */ static reset(keepCachedReleaseBranches = false) {
            console.log('Make sure to check on the active PhET-iO Deploy Status on phet.colorado.edu to ensure that the ' + 'right PhET-iO sims are included in this maintenance release.');
            const allReleaseBranches = [];
            if (keepCachedReleaseBranches) {
                const maintenance = Maintenance.load();
                allReleaseBranches.push(...maintenance.allReleaseBranches);
            }
            new Maintenance([], [], allReleaseBranches).save();
        }
        /**
     * Runs a number of checks through every release branch.
     * @public
     *
     * @param {function(ReleaseBranch):Promise.<boolean>} [filter] - Optional filter, release branches will be skipped
     *                                                               if this resolves to false
     * @returns {Promise}
     */ static checkBranchStatus(filter) {
            return _async_to_generator(function*() {
                for (const repo of getActiveRepos()){
                    if (repo !== 'perennial' && !(yield gitIsClean(repo))) {
                        console.log(`Unclean repository: ${repo}, please resolve this and then run checkBranchStatus again`);
                        return;
                    }
                }
                const releaseBranches = yield Maintenance.getMaintenanceBranches(filter);
                // Set up a cache of branchMaps so that we don't make multiple requests
                const branchMaps = {};
                const getBranchMapAsyncCallback = /*#__PURE__*/ _async_to_generator(function*(repo) {
                    if (!branchMaps[repo]) {
                        // eslint-disable-next-line require-atomic-updates
                        branchMaps[repo] = yield getBranchMap(repo);
                    }
                    return branchMaps[repo];
                });
                for (const releaseBranch of releaseBranches){
                    if (!filter || (yield filter(releaseBranch))) {
                        console.log(`${releaseBranch.repo} ${releaseBranch.branch}`);
                        for (const line of yield releaseBranch.getStatus(getBranchMapAsyncCallback)){
                            console.log(`  ${line}`);
                        }
                    } else {
                        console.log(`${releaseBranch.repo} ${releaseBranch.branch} (skipping due to filter)`);
                    }
                }
            })();
        }
        /**
     * Builds all release branches (so that the state of things can be checked). Puts in in perennial/build.
     * @public
     */ static buildAll() {
            return _async_to_generator(function*() {
                const releaseBranches = yield Maintenance.getMaintenanceBranches();
                const failed = [];
                for (const releaseBranch of releaseBranches){
                    console.log(`building ${releaseBranch.repo} ${releaseBranch.branch}`);
                    try {
                        yield checkoutTarget(releaseBranch.repo, releaseBranch.branch, true); // include npm update
                        yield build(releaseBranch.repo, {
                            brands: releaseBranch.brands
                        });
                        throw new Error('UNIMPLEMENTED, copy over');
                    } catch (e) {
                        failed.push(`${releaseBranch.repo} ${releaseBranch.brand}`);
                    }
                }
                if (failed.length) {
                    console.log(`Failed builds:\n${failed.join('\n')}`);
                } else {
                    console.log('Builds complete');
                }
            })();
        }
        /**
     * Displays a listing of the current maintenance status.
     * @public
     *
     * @returns {Promise}
     */ static list() {
            return _async_to_generator(function*() {
                const maintenance = Maintenance.load();
                // At the top so that the important items are right above your cursor after calling the function
                if (maintenance.allReleaseBranches.length > 0) {
                    console.log(`Total recognized ReleaseBranches: ${maintenance.allReleaseBranches.length}`);
                }
                console.log('\nRelease Branches in MR:', maintenance.patches.length === 0 ? 'None' : '');
                for (const modifiedBranch of maintenance.modifiedBranches){
                    const count = maintenance.modifiedBranches.indexOf(modifiedBranch) + 1;
                    console.log(`${count}. ${modifiedBranch.repo} ${modifiedBranch.branch} ${modifiedBranch.brands.join(',')}${modifiedBranch.releaseBranch.isReleased ? '' : ' (unreleased)'}`);
                    if (modifiedBranch.deployedVersion) {
                        console.log(`    deployed: ${modifiedBranch.deployedVersion.toString()}`);
                    }
                    if (modifiedBranch.neededPatches.length) {
                        console.log(`    needs: ${modifiedBranch.neededPatches.map((patch)=>patch.name).join(',')}`);
                    }
                    if (modifiedBranch.pushedMessages.length) {
                        console.log(`    pushedMessages: \n      ${modifiedBranch.pushedMessages.join('\n      ')}`);
                    }
                    if (modifiedBranch.pendingMessages.length) {
                        console.log(`    pendingMessages: \n      ${modifiedBranch.pendingMessages.join('\n      ')}`);
                    }
                    if (Object.keys(modifiedBranch.changedDependencies).length > 0) {
                        console.log('    deps:');
                        for (const key of Object.keys(modifiedBranch.changedDependencies)){
                            console.log(`      ${key}: ${modifiedBranch.changedDependencies[key]}`);
                        }
                    }
                }
                console.log('\nMaintenance Patches in MR:', maintenance.patches.length === 0 ? 'None' : '');
                for (const patch of maintenance.patches){
                    const count = maintenance.patches.indexOf(patch) + 1;
                    const indexAndSpacing = `${count}. ` + (count > 9 ? '' : ' ');
                    console.log(`${indexAndSpacing}[${patch.name}]${patch.name !== patch.repo ? ` (${patch.repo})` : ''} ${patch.message}`);
                    for (const sha of patch.shas){
                        console.log(`      ${sha}`);
                    }
                    for (const modifiedBranch of maintenance.modifiedBranches){
                        if (modifiedBranch.neededPatches.includes(patch)) {
                            console.log(`        ${modifiedBranch.repo} ${modifiedBranch.branch} ${modifiedBranch.brands.join(',')}`);
                        }
                    }
                }
            })();
        }
        /**
     * Shows any required testing links for the simulations.
     * @public
     *
     * @param {function(ModifiedBranch):boolean} [filter] - Control which branches are shown
     */ static listLinks(filter = ()=>true) {
            return _async_to_generator(function*() {
                const maintenance = Maintenance.load();
                const deployedBranches = maintenance.modifiedBranches.filter((modifiedBranch)=>!!modifiedBranch.deployedVersion && filter(modifiedBranch));
                const productionBranches = deployedBranches.filter((modifiedBranch)=>modifiedBranch.deployedVersion.testType === null);
                const releaseCandidateBranches = deployedBranches.filter((modifiedBranch)=>modifiedBranch.deployedVersion.testType === 'rc');
                if (productionBranches.length) {
                    console.log('\nProduction links\n');
                    for (const modifiedBranch of productionBranches){
                        const links = yield modifiedBranch.getDeployedLinkLines();
                        for (const link of links){
                            console.log(link);
                        }
                    }
                }
                if (releaseCandidateBranches.length) {
                    console.log('\nRelease Candidate links\n');
                    for (const modifiedBranch of releaseCandidateBranches){
                        const links = yield modifiedBranch.getDeployedLinkLines();
                        for (const link of links){
                            console.log(link);
                        }
                    }
                }
            })();
        }
        /**
     * Creates an issue to note patches on all unreleased branches that include a pushed message.
     * @public
     *
     * @param {string} [additionalNotes]
     */ static createUnreleasedIssues(additionalNotes = '') {
            return _async_to_generator(function*() {
                const maintenance = Maintenance.load();
                for (const modifiedBranch of maintenance.modifiedBranches){
                    if (!modifiedBranch.releaseBranch.isReleased && modifiedBranch.pushedMessages.length > 0) {
                        console.log(`Creating issue for ${modifiedBranch.releaseBranch.toString()}`);
                        yield modifiedBranch.createUnreleasedIssue(additionalNotes);
                    }
                }
                console.log('Finished creating unreleased issues');
            })();
        }
        /**
     * Creates a patch
     * @public
     *
     * @param {string} repo
     * @param {string} message
     * @param {string} [patchName] - If no name is provided, the repo string will be used.
     * @returns {Promise}
     */ static createPatch(repo, message, patchName) {
            return _async_to_generator(function*() {
                const maintenance = Maintenance.load();
                patchName = patchName || repo;
                for (const patch of maintenance.patches){
                    if (patch.name === patchName) {
                        throw new Error('Multiple patches with the same name are not concurrently supported');
                    }
                }
                maintenance.patches.push(new Patch(repo, patchName, message));
                maintenance.save();
                console.log(`Created patch for ${repo} with message: ${message}`);
            })();
        }
        /**
     * Removes a patch
     * @public
     *
     * @param {string} patchName
     * @returns {Promise}
     */ static removePatch(patchName) {
            return _async_to_generator(function*() {
                const maintenance = Maintenance.load();
                const patch = maintenance.findPatch(patchName);
                for (const branch of maintenance.modifiedBranches){
                    if (branch.neededPatches.includes(patch)) {
                        throw new Error('Patch is marked as needed by at least one branch');
                    }
                }
                maintenance.patches.splice(maintenance.patches.indexOf(patch), 1);
                maintenance.save();
                console.log(`Removed patch for ${patchName}`);
            })();
        }
        /**
     * Adds a particular SHA (to cherry-pick) to a patch.
     * @public
     *
     * @param {string} patchName
     * @param {string} [sha]
     * @returns {Promise}
     */ static addPatchSHA(patchName, sha) {
            return _async_to_generator(function*() {
                const maintenance = Maintenance.load();
                const patch = maintenance.findPatch(patchName);
                if (!sha) {
                    sha = yield gitRevParse(patch.repo, 'HEAD');
                    console.log(`SHA not provided, detecting SHA: ${sha}`);
                }
                patch.shas.push(sha);
                maintenance.save();
                console.log(`Added SHA ${sha} to patch ${patchName}`);
            })();
        }
        /**
     * Removes a particular SHA (to cherry-pick) from a patch.
     * @public
     *
     * @param {string} patchName
     * @param {string} sha
     * @returns {Promise}
     */ static removePatchSHA(patchName, sha) {
            return _async_to_generator(function*() {
                const maintenance = Maintenance.load();
                const patch = maintenance.findPatch(patchName);
                const index = patch.shas.indexOf(sha);
                assert(index >= 0, 'SHA not found');
                patch.shas.splice(index, 1);
                maintenance.save();
                console.log(`Removed SHA ${sha} from patch ${patchName}`);
            })();
        }
        /**
     * Removes all patch SHAs for a particular patch.
     * @public
     *
     * @param {string} patchName
     * @returns {Promise}
     */ static removeAllPatchSHAs(patchName) {
            return _async_to_generator(function*() {
                const maintenance = Maintenance.load();
                const patch = maintenance.findPatch(patchName);
                for (const sha of patch.shas){
                    console.log(`Removing SHA ${sha} from patch ${patchName}`);
                }
                patch.shas = [];
                maintenance.save();
            })();
        }
        /**
     * Adds a needed patch to a given modified branch.
     * @public
     *
     * @param {string} repo
     * @param {string} branch
     * @param {string} patchName
     */ static addNeededPatch(repo, branch, patchName) {
            return _async_to_generator(function*() {
                const maintenance = Maintenance.load();
                assert(repo !== patchName, 'Cannot patch a release branch repo, yet.'); // TODO: remove in https://github.com/phetsims/perennial/issues/312
                const patch = maintenance.findPatch(patchName);
                const modifiedBranch = yield maintenance.ensureModifiedBranch(repo, branch);
                modifiedBranch.neededPatches.push(patch);
                maintenance.save();
                console.log(`Added patch ${patchName} as needed for ${repo} ${branch}`);
            })();
        }
        /**
     * Adds a needed patch to a given release branch
     * @public
     *
     * @param {ReleaseBranch} releaseBranch
     * @param {string} patchName
     */ static addNeededPatchReleaseBranch(releaseBranch, patchName) {
            return _async_to_generator(function*() {
                const maintenance = Maintenance.load();
                const patch = maintenance.findPatch(patchName);
                const modifiedBranch = new ModifiedBranch(releaseBranch);
                maintenance.modifiedBranches.push(modifiedBranch);
                modifiedBranch.neededPatches.push(patch);
                maintenance.save();
                console.log(`Added patch ${patchName} as needed for ${releaseBranch.repo} ${releaseBranch.branch}`);
            })();
        }
        /**
     * Adds a needed patch to whatever subset of release branches match the filter.
     * @public
     *
     * @param {string} patchName
     * @param {function(ReleaseBranch):Promise.<boolean>} filter
     */ static addNeededPatches(patchName, filter) {
            return _async_to_generator(function*() {
                // getMaintenanceBranches needs to cache its branches and maintenance.save() them, so do it before loading
                // Maintenance for this function.
                const releaseBranches = yield Maintenance.getMaintenanceBranches();
                const maintenance = Maintenance.load();
                const patch = maintenance.findPatch(patchName);
                let count = 0;
                for (const releaseBranch of releaseBranches){
                    const needsPatch = yield filter(releaseBranch);
                    if (!needsPatch) {
                        console.log(`  skipping ${releaseBranch.repo} ${releaseBranch.branch}`);
                        continue;
                    }
                    const modifiedBranch = yield maintenance.ensureModifiedBranch(releaseBranch.repo, releaseBranch.branch, false, releaseBranches);
                    if (!modifiedBranch.neededPatches.includes(patch)) {
                        modifiedBranch.neededPatches.push(patch);
                        console.log(`Added needed patch ${patchName} to ${releaseBranch.repo} ${releaseBranch.branch}`);
                        count++;
                        maintenance.save(); // save here in case a future failure would "revert" things
                    } else {
                        console.log(`Patch ${patchName} already included in ${releaseBranch.repo} ${releaseBranch.branch}`);
                    }
                }
                console.log(`Added ${count} releaseBranches to patch: ${patchName}`);
                maintenance.save();
            })();
        }
        /**
     * Adds a needed patch to all release branches.
     * @public
     *
     * @param {string} patchName
     */ static addAllNeededPatches(patchName) {
            return _async_to_generator(function*() {
                yield Maintenance.addNeededPatches(patchName, /*#__PURE__*/ _async_to_generator(function*() {
                    return true;
                }));
            })();
        }
        /**
     * Adds a needed patch to all release branches that do NOT include the given commit on the repo
     * @public
     *
     * @param {string} patchName
     * @param {string} sha
     */ static addNeededPatchesBefore(patchName, sha) {
            return _async_to_generator(function*() {
                const maintenance = Maintenance.load();
                const patch = maintenance.findPatch(patchName);
                yield Maintenance.addNeededPatches(patchName, /*#__PURE__*/ _async_to_generator(function*(releaseBranch) {
                    return releaseBranch.isMissingSHA(patch.repo, sha);
                }));
            })();
        }
        /**
     * Adds a needed patch to all release branches that DO include the given commit on the repo
     * @public
     *
     * @param {string} patchName
     * @param {string} sha
     */ static addNeededPatchesAfter(patchName, sha) {
            return _async_to_generator(function*() {
                const maintenance = Maintenance.load();
                const patch = maintenance.findPatch(patchName);
                yield Maintenance.addNeededPatches(patchName, /*#__PURE__*/ _async_to_generator(function*(releaseBranch) {
                    return releaseBranch.includesSHA(patch.repo, sha);
                }));
            })();
        }
        /**
     * Adds a needed patch to all release branches that satisfy the given filter( releaseBranch, builtFileString )
     * where it builds the simulation with the defaults (brand=phet) and provides it as a string.
     * @public
     *
     * @param {string} patchName
     * @param {function(ReleaseBranch, builtFile:string): Promise.<boolean>} filter
     */ static addNeededPatchesBuildFilter(patchName, filter) {
            return _async_to_generator(function*() {
                yield Maintenance.addNeededPatches(patchName, /*#__PURE__*/ _async_to_generator(function*(releaseBranch) {
                    yield checkoutTarget(releaseBranch.repo, releaseBranch.branch, true);
                    yield gitPull(releaseBranch.repo);
                    yield build(releaseBranch.repo);
                    const chipperVersion = ChipperVersion.getFromRepository();
                    let filename;
                    if (chipperVersion.major !== 0) {
                        filename = `../${releaseBranch.repo}/build/phet/${releaseBranch.repo}_en_phet.html`;
                    } else {
                        filename = `../${releaseBranch.repo}/build/${releaseBranch.repo}_en.html`;
                    }
                    return filter(releaseBranch, fs.readFileSync(filename, 'utf8'));
                }));
            })();
        }
        /**
     * Removes a needed patch from a given modified branch.
     * @public
     *
     * @param {string} repo
     * @param {string} branch
     * @param {string} patchName
     */ static removeNeededPatch(repo, branch, patchName) {
            return _async_to_generator(function*() {
                const maintenance = Maintenance.load();
                const patch = maintenance.findPatch(patchName);
                const modifiedBranch = yield maintenance.ensureModifiedBranch(repo, branch);
                const index = modifiedBranch.neededPatches.indexOf(patch);
                assert(index >= 0, 'Could not find needed patch on the modified branch');
                modifiedBranch.neededPatches.splice(index, 1);
                maintenance.tryRemovingModifiedBranch(modifiedBranch);
                maintenance.save();
                console.log(`Removed patch ${patchName} from ${repo} ${branch}`);
            })();
        }
        /**
     * Removes a needed patch from whatever subset of (current) release branches match the filter.
     * @public
     *
     * @param {string} patchName
     * @param {function(ReleaseBranch): Promise.<boolean>} filter
     */ static removeNeededPatches(patchName, filter) {
            return _async_to_generator(function*() {
                const maintenance = Maintenance.load();
                const patch = maintenance.findPatch(patchName);
                let count = 0;
                for (const modifiedBranch of maintenance.modifiedBranches){
                    const needsRemoval = yield filter(modifiedBranch.releaseBranch);
                    if (!needsRemoval) {
                        console.log(`  skipping ${modifiedBranch.repo} ${modifiedBranch.branch}`);
                        continue;
                    }
                    // Check if there's actually something to remove
                    const index = modifiedBranch.neededPatches.indexOf(patch);
                    if (index < 0) {
                        continue;
                    }
                    modifiedBranch.neededPatches.splice(index, 1);
                    maintenance.tryRemovingModifiedBranch(modifiedBranch);
                    count++;
                    console.log(`Removed needed patch ${patchName} from ${modifiedBranch.repo} ${modifiedBranch.branch}`);
                }
                console.log(`Removed ${count} releaseBranches from patch: ${patchName}`);
                maintenance.save();
            })();
        }
        /**
     * Removes a needed patch from all release branches that do NOT include the given commit on the repo
     * @public
     *
     * @param {string} patchName
     * @param {string} sha
     */ static removeNeededPatchesBefore(patchName, sha) {
            return _async_to_generator(function*() {
                const maintenance = Maintenance.load();
                const patch = maintenance.findPatch(patchName);
                yield Maintenance.removeNeededPatches(patchName, /*#__PURE__*/ _async_to_generator(function*(releaseBranch) {
                    return releaseBranch.isMissingSHA(patch.repo, sha);
                }));
            })();
        }
        /**
     * Removes a needed patch from all release branches that DO include the given commit on the repo
     * @public
     *
     * @param {string} patchName
     * @param {string} sha
     */ static removeNeededPatchesAfter(patchName, sha) {
            return _async_to_generator(function*() {
                const maintenance = Maintenance.load();
                const patch = maintenance.findPatch(patchName);
                yield Maintenance.removeNeededPatches(patchName, /*#__PURE__*/ _async_to_generator(function*(releaseBranch) {
                    return releaseBranch.includesSHA(patch.repo, sha);
                }));
            })();
        }
        /**
     * Helper for adding patches based on specific patterns, e.g.:
     * Maintenance.addNeededPatches( 'phetmarks', Maintenance.singleFileReleaseBranchFilter( '../phetmarks/js/phetmarks.ts' ), content => content.includes( 'data/wrappers' ) );
     * @public
     *
     * @param {string} file
     * @param {function(string):boolean}
     * @returns {function}
     */ static singleFileReleaseBranchFilter(file, predicate) {
            return /*#__PURE__*/ _async_to_generator(function*(releaseBranch) {
                yield releaseBranch.checkout(false);
                if (fs.existsSync(file)) {
                    const contents = fs.readFileSync(file, 'utf-8');
                    return predicate(contents);
                }
                return false;
            });
        }
        /**
     * Checks out a specific Release Branch (using local commit data as necessary).
     * @public
     *
     * @param {string} repo
     * @param {string} branch
     * @param {boolean} outputJS=false - if true, once checked out this will also run `grunt output-js-project`
     */ static checkoutBranch(repo, branch, outputJS = false) {
            return _async_to_generator(function*() {
                const maintenance = Maintenance.load();
                const modifiedBranch = yield maintenance.ensureModifiedBranch(repo, branch, true);
                yield modifiedBranch.checkout();
                if (outputJS && chipperSupportsOutputJSGruntTasks()) {
                    console.log('Running output-js-project');
                    // We might not be able to run this command!
                    yield execute(gruntCommand, [
                        'output-js-project',
                        '--silent'
                    ], `../${repo}`, {
                        errors: 'resolve'
                    });
                }
                // No need to save, shouldn't be changing things
                console.log(`Checked out ${repo} ${branch}`);
            })();
        }
        /**
     * Attempts to apply patches to the modified branches that are marked as needed.
     * @public
     */ static applyPatches() {
            return _async_to_generator(function*() {
                winston.info('applying patches');
                let success = true;
                const maintenance = Maintenance.load();
                let numApplied = 0;
                for (const modifiedBranch of maintenance.modifiedBranches){
                    if (modifiedBranch.neededPatches.length === 0) {
                        continue;
                    }
                    const repo = modifiedBranch.repo;
                    const branch = modifiedBranch.branch;
                    // Defensive copy, since we modify it during iteration
                    for (const patch of modifiedBranch.neededPatches.slice()){
                        if (patch.shas.length === 0) {
                            continue;
                        }
                        const patchRepo = patch.repo;
                        try {
                            let patchRepoCurrentSHA;
                            // Checkout whatever the latest patched SHA is (if we've patched it)
                            if (modifiedBranch.changedDependencies[patchRepo]) {
                                patchRepoCurrentSHA = modifiedBranch.changedDependencies[patchRepo];
                            } else {
                                // Look up the SHA to check out at the tip of the release branch dependencies.json
                                yield gitCheckout(repo, branch);
                                yield gitPull(repo);
                                const dependencies = yield getDependencies(repo);
                                patchRepoCurrentSHA = dependencies[patchRepo].sha;
                                yield gitCheckout(repo, 'main'); // TODO: this assumes we were on main when we started running this. https://github.com/phetsims/perennial/issues/368
                            // TODO: see if the patchRepo has a branch for this release branch, and if so, pull it to make sure we have the above SHA https://github.com/phetsims/perennial/issues/368
                            }
                            // Then check it out
                            yield gitCheckout(patchRepo, patchRepoCurrentSHA);
                            console.log(`Checked out ${patchRepo} for ${repo} ${branch}, SHA: ${patchRepoCurrentSHA}`);
                            for (const sha of patch.shas){
                                // If the sha doesn't exist in the repo, then give a specific error for that.
                                const hasSha = (yield execute('git', [
                                    'cat-file',
                                    '-e',
                                    sha
                                ], `../${patchRepo}`, {
                                    errors: 'resolve'
                                })).code === 0;
                                if (!hasSha) {
                                    throw new Error(`SHA not found in ${patchRepo}: ${sha}`);
                                }
                                const cherryPickSuccess = yield gitCherryPick(patchRepo, sha);
                                if (cherryPickSuccess) {
                                    const currentSHA = yield gitRevParse(patchRepo, 'HEAD');
                                    console.log(`Cherry-pick success for ${sha}, result is ${currentSHA}`);
                                    modifiedBranch.changedDependencies[patchRepo] = currentSHA;
                                    modifiedBranch.neededPatches.splice(modifiedBranch.neededPatches.indexOf(patch), 1);
                                    numApplied++;
                                    // Don't include duplicate messages, since multiple patches might be for a single issue
                                    if (!modifiedBranch.pendingMessages.includes(patch.message)) {
                                        modifiedBranch.pendingMessages.push(patch.message);
                                    }
                                    break;
                                } else {
                                    success = false;
                                    console.log(`Could not cherry-pick ${sha}`);
                                }
                            }
                        } catch (e) {
                            maintenance.save();
                            throw new Error(`Failure applying patch ${patchRepo} to ${repo} ${branch}: ${e}`);
                        }
                    }
                    yield gitCheckout(modifiedBranch.repo, 'main');
                }
                maintenance.save();
                console.log(`${numApplied} patches applied`);
                return success;
            })();
        }
        /**
     * Pushes local changes up to GitHub.
     * @public
     *
     * @param {function(ModifiedBranch):Promise.<boolean>} [filter] - Optional filter, modified branches will be skipped
     *                                                                if this resolves to false
     */ static updateDependencies(filter) {
            return _async_to_generator(function*() {
                winston.info('update dependencies');
                const maintenance = Maintenance.load();
                for (const modifiedBranch of maintenance.modifiedBranches){
                    const changedRepos = Object.keys(modifiedBranch.changedDependencies);
                    if (changedRepos.length === 0) {
                        continue;
                    }
                    if (filter && !(yield filter(modifiedBranch))) {
                        console.log(`Skipping dependency update for ${modifiedBranch.repo} ${modifiedBranch.branch}`);
                        continue;
                    }
                    try {
                        // No NPM needed
                        yield checkoutTarget(modifiedBranch.repo, modifiedBranch.branch, false);
                        console.log(`Checked out ${modifiedBranch.repo} ${modifiedBranch.branch}`);
                        const dependenciesJSONFile = `../${modifiedBranch.repo}/dependencies.json`;
                        const dependenciesJSON = JSON.parse(fs.readFileSync(dependenciesJSONFile, 'utf-8'));
                        // Modify the "self" in the dependencies.json as expected
                        dependenciesJSON[modifiedBranch.repo].sha = yield gitRevParse(modifiedBranch.repo, modifiedBranch.branch);
                        for (const dependency of changedRepos){
                            const dependencyBranch = modifiedBranch.dependencyBranch;
                            const branches = yield getBranches(dependency);
                            const sha = modifiedBranch.changedDependencies[dependency];
                            dependenciesJSON[dependency].sha = sha;
                            if (branches.includes(dependencyBranch)) {
                                console.log(`Branch ${dependencyBranch} already exists in ${dependency}`);
                                yield gitCheckout(dependency, dependencyBranch);
                                yield gitPull(dependency);
                                const currentSHA = yield gitRevParse(dependency, 'HEAD');
                                if (sha !== currentSHA) {
                                    console.log(`Attempting to (hopefully fast-forward) merge ${sha}`);
                                    yield execute('git', [
                                        'merge',
                                        sha
                                    ], `../${dependency}`);
                                    yield gitPush(dependency, dependencyBranch);
                                }
                            } else {
                                console.log(`Branch ${dependencyBranch} does not exist in ${dependency}, creating.`);
                                yield gitCheckout(dependency, sha);
                                yield gitCreateBranch(dependency, dependencyBranch);
                                yield gitPush(dependency, dependencyBranch);
                            }
                            delete modifiedBranch.changedDependencies[dependency];
                            modifiedBranch.deployedVersion = null;
                            maintenance.save(); // save here in case a future failure would "revert" things
                        }
                        const message = modifiedBranch.pendingMessages.join(' and ');
                        fs.writeFileSync(dependenciesJSONFile, JSON.stringify(dependenciesJSON, null, 2));
                        yield gitAdd(modifiedBranch.repo, 'dependencies.json');
                        yield gitCommit(modifiedBranch.repo, `updated dependencies.json for ${message}`);
                        yield gitPush(modifiedBranch.repo, modifiedBranch.branch);
                        // Move messages from pending to pushed
                        for (const message of modifiedBranch.pendingMessages){
                            if (!modifiedBranch.pushedMessages.includes(message)) {
                                modifiedBranch.pushedMessages.push(message);
                            }
                        }
                        modifiedBranch.pendingMessages = [];
                        maintenance.save(); // save here in case a future failure would "revert" things
                        yield checkoutMain(modifiedBranch.repo, false);
                    } catch (e) {
                        maintenance.save();
                        throw new Error(`Failure updating dependencies for ${modifiedBranch.repo} to ${modifiedBranch.branch}: ${e}`);
                    }
                }
                maintenance.save();
                console.log('Dependencies updated');
            })();
        }
        /**
     * Deploys RC versions of the modified branches that need it.
     * @public
     *
     * @param {function(ModifiedBranch):Promise.<boolean>} [filter] - Optional filter, modified branches will be skipped
     *                                                                if this resolves to false
     */ static deployReleaseCandidates(filter) {
            return _async_to_generator(function*() {
                const maintenance = Maintenance.load();
                for (const modifiedBranch of maintenance.modifiedBranches){
                    if (!modifiedBranch.isReadyForReleaseCandidate || !modifiedBranch.releaseBranch.isReleased) {
                        continue;
                    }
                    console.log('================================================');
                    if (filter && !(yield filter(modifiedBranch))) {
                        console.log(`Skipping RC deploy for ${modifiedBranch.repo} ${modifiedBranch.branch}`);
                        continue;
                    }
                    try {
                        console.log(`Running RC deploy for ${modifiedBranch.repo} ${modifiedBranch.branch}`);
                        const version = yield rc(modifiedBranch.repo, modifiedBranch.branch, modifiedBranch.brands, true, modifiedBranch.pushedMessages.join(', '));
                        modifiedBranch.deployedVersion = version;
                        maintenance.save(); // save here in case a future failure would "revert" things
                    } catch (e) {
                        maintenance.save();
                        throw new Error(`Failure with RC deploy for ${modifiedBranch.repo} to ${modifiedBranch.branch}: ${e}`);
                    }
                }
                maintenance.save();
                console.log('RC versions deployed');
            })();
        }
        /**
     * Deploys production versions of the modified branches that need it.
     * @public
     *
     * @param {function(ModifiedBranch):Promise.<boolean>} [filter] - Optional filter, modified branches will be skipped
     *                                                                if this resolves to false
     */ static deployProduction(filter) {
            return _async_to_generator(function*() {
                const maintenance = Maintenance.load();
                for (const modifiedBranch of maintenance.modifiedBranches){
                    if (!modifiedBranch.isReadyForProduction || !modifiedBranch.releaseBranch.isReleased) {
                        continue;
                    }
                    if (filter && !(yield filter(modifiedBranch))) {
                        console.log(`Skipping production deploy for ${modifiedBranch.repo} ${modifiedBranch.branch}`);
                        continue;
                    }
                    try {
                        console.log(`Running production deploy for ${modifiedBranch.repo} ${modifiedBranch.branch}`);
                        const version = yield production(modifiedBranch.repo, modifiedBranch.branch, modifiedBranch.brands, true, false, modifiedBranch.pushedMessages.join(', '));
                        modifiedBranch.deployedVersion = version;
                        modifiedBranch.pushedMessages = [];
                        maintenance.save(); // save here in case a future failure would "revert" things
                    } catch (e) {
                        maintenance.save();
                        throw new Error(`Failure with production deploy for ${modifiedBranch.repo} to ${modifiedBranch.branch}: ${e}`);
                    }
                }
                maintenance.save();
                console.log('production versions deployed');
            })();
        }
        /**
     * Create a separate directory for each release branch. This does not interface with the saved maintenance state at
     * all, and instead just looks at the committed dependencies.json when updating.
     * @public
     *
     * @param {function(ReleaseBranch):Promise.<boolean>} [filter] - Optional filter, release branches will be skipped
     *                                                               if this resolves to false
     * @param {Object} [options] - build=false - to opt out of building, set to false.
     *                             transpile=false - to opt out of transpiling, set to false.
     */ static updateCheckouts(filter, options) {
            return _async_to_generator(function*() {
                options = _.merge({
                    concurrent: 5,
                    build: true,
                    transpile: true,
                    buildOptions: {
                        lint: true
                    }
                }, options);
                console.log(`Updating checkouts (running in parallel with ${options.concurrent} threads)`);
                const releaseBranches = yield Maintenance.getMaintenanceBranches();
                const filteredBranches = [];
                // Run all filtering in a step before the parallel step. This way the filter has full access to repos and git commands without race conditions, https://github.com/phetsims/perennial/issues/341
                for (const releaseBranch of releaseBranches){
                    if (!filter || (yield filter(releaseBranch))) {
                        filteredBranches.push(releaseBranch);
                    }
                }
                console.log(`Filter applied. Updating ${filteredBranches.length}:`, filteredBranches.map((x)=>x.toString()));
                const asyncFunctions = filteredBranches.map((releaseBranch)=>/*#__PURE__*/ _async_to_generator(function*() {
                        console.log('Beginning: ', releaseBranch.toString());
                        try {
                            yield releaseBranch.updateCheckout();
                            options.transpile && (yield releaseBranch.transpile());
                            try {
                                options.build && (yield releaseBranch.build(options.buildOptions));
                                console.log('Finished: ', releaseBranch.toString());
                            } catch (e) {
                                console.log(`failed to build ${releaseBranch.toString()}: ${e}`);
                            }
                        } catch (e) {
                            console.log(`failed to update releaseBranch ${releaseBranch.toString()}: ${e}`);
                        }
                    }));
                yield asyncQ.parallelLimit(asyncFunctions, options.concurrent);
                console.log('Done');
            })();
        }
        /**
     * @public
     *
     * @param {function(ReleaseBranch):Promise.<boolean>} [filter] - Optional filter, release branches will be skipped
     *                                                               if this resolves to false
     */ static checkUnbuiltCheckouts(filter) {
            return _async_to_generator(function*() {
                console.log('Checking unbuilt checkouts');
                const releaseBranches = yield Maintenance.getMaintenanceBranches();
                for (const releaseBranch of releaseBranches){
                    if (!filter || (yield filter(releaseBranch))) {
                        console.log(releaseBranch.toString());
                        const unbuiltResult = yield releaseBranch.checkUnbuilt();
                        if (unbuiltResult) {
                            console.log(unbuiltResult);
                        }
                    }
                }
            })();
        }
        /**
     * @public
     *
     * @param {function(ReleaseBranch):Promise.<boolean>} [filter] - Optional filter, release branches will be skipped
     *                                                               if this resolves to false
     */ static checkBuiltCheckouts(filter) {
            return _async_to_generator(function*() {
                console.log('Checking built checkouts');
                const releaseBranches = yield Maintenance.getMaintenanceBranches();
                for (const releaseBranch of releaseBranches){
                    if (!filter || (yield filter(releaseBranch))) {
                        console.log(releaseBranch.toString());
                        const builtResult = yield releaseBranch.checkBuilt();
                        if (builtResult) {
                            console.log(builtResult);
                        }
                    }
                }
            })();
        }
        /**
     * Redeploys production versions of all release branches (or those matching a specific filter
     * @public
     *
     * NOTE: This does not use the current maintenance state!
     *
     * @param {string} message - Generally an issue to reference
     * @param {function(ReleaseBranch):Promise.<boolean>} [filter] - Optional filter, release branches will be skipped
     *                                                                if this resolves to false
     */ static redeployAllProduction(message, filter) {
            return _async_to_generator(function*() {
                // Ignore unreleased branches!
                const releaseBranches = yield Maintenance.getMaintenanceBranches(()=>true, false);
                for (const releaseBranch of releaseBranches){
                    if (filter && !(yield filter(releaseBranch))) {
                        continue;
                    }
                    console.log(releaseBranch.toString());
                    yield rc(releaseBranch.repo, releaseBranch.branch, releaseBranch.brands, true, message);
                    yield production(releaseBranch.repo, releaseBranch.branch, releaseBranch.brands, true, false, message);
                }
                console.log('Finished redeploying');
            })();
        }
        /**
     * The prototype copy of Maintenance.getMaintenanceBranches(), in which we will mutate the class's allReleaseBranches
     * to ensure there is no save/load order dependency problems.
     *
     * @public
     * @param {function(ReleaseBranch):boolean} filterRepo - return false if the ReleaseBranch should be excluded.
     * @param {function} checkUnreleasedBranches - If false, will skip checking for unreleased branches. This checking needs all repos checked out
     * @param {boolean} forceCacheBreak=false - true if you want to force a recalculation of all ReleaseBranches
     * @returns {Promise.<Array.<ReleaseBranch>>}
     * @rejects {ExecuteError}
     */ getMaintenanceBranches(filterRepo = ()=>true, checkUnreleasedBranches = true, forceCacheBreak = false) {
            var _this = this;
            return _async_to_generator(function*() {
                return Maintenance.getMaintenanceBranches(filterRepo, checkUnreleasedBranches, forceCacheBreak, _this);
            })();
        }
        /**
     * @public
     * @param {function(ReleaseBranch):boolean} filterRepo - return false if the ReleaseBranch should be excluded.
     * @param {boolean} checkUnreleasedBranches - If false, will skip checking for unreleased branches. This checking needs all repos checked out
     * @param {boolean} forceCacheBreak=false - true if you want to force a recalculation of all ReleaseBranches
     @param {Maintenance} maintenance=Maintenance.load() - by default load from saved file the current maintenance instance.
     * @returns {Promise.<Array.<ReleaseBranch>>}
     * @rejects {ExecuteError}
     */ static getMaintenanceBranches(filterRepo = ()=>true, checkUnreleasedBranches = true, forceCacheBreak = false, maintenance = Maintenance.load()) {
            return _async_to_generator(function*() {
                const releaseBranches = yield Maintenance.loadAllMaintenanceBranches(forceCacheBreak, maintenance);
                return releaseBranches.filter((releaseBranch)=>{
                    if (!checkUnreleasedBranches && !releaseBranch.isReleased) {
                        return false;
                    }
                    return filterRepo(releaseBranch);
                });
            })();
        }
        /**
     * Loads every potential ReleaseBranch (published phet and phet-io brands, as well as unreleased branches), and
     * saves it to the maintenance state.
     * @public
     *
     * Call this with true to break the cache and force a recalculation of all ReleaseBranches
     *
     * @param {boolean} forceCacheBreak=false - true if you want to force a recalculation of all ReleaseBranches
     * @param {Maintenance} maintenance=Maintenance.load() - by default load from saved file the current maintenance instance.     * @returns {Promise<ReleaseBranch[]>}
     */ static loadAllMaintenanceBranches(forceCacheBreak = false, maintenance = Maintenance.load()) {
            return _async_to_generator(function*() {
                let releaseBranches = null;
                if (maintenance.allReleaseBranches.length > 0 && !forceCacheBreak) {
                    assert(maintenance.allReleaseBranches[0] instanceof ReleaseBranch, 'deserialization check');
                    releaseBranches = maintenance.allReleaseBranches;
                } else {
                    // cache miss
                    releaseBranches = yield ReleaseBranch.getAllMaintenanceBranches();
                    // eslint-disable-next-line require-atomic-updates
                    maintenance.allReleaseBranches = releaseBranches;
                    maintenance.save();
                }
                return releaseBranches;
            })();
        }
        /**
     * Convert into a plain JS object meant for JSON serialization.
     * @public
     *
     * @returns {SerializedMaintenance} - see Patch.serialize() and ModifiedBranch.serialize()
     */ serialize() {
            return {
                patches: this.patches.map((patch)=>patch.serialize()),
                modifiedBranches: this.modifiedBranches.map((modifiedBranch)=>modifiedBranch.serialize()),
                allReleaseBranches: this.allReleaseBranches.map((releaseBranch)=>releaseBranch.serialize())
            };
        }
        /**
     * Takes a serialized form of the Maintenance and returns an actual instance.
     * @public
     *
     * @param {SerializedMaintenance} - see Maintenance.serialize()
     * @returns {Maintenance}
     */ static deserialize({ patches = [], modifiedBranches = [], allReleaseBranches = [] }) {
            // Pass in patch references to branch deserialization
            const deserializedPatches = patches.map(Patch.deserialize);
            modifiedBranches = modifiedBranches.map((modifiedBranch)=>ModifiedBranch.deserialize(modifiedBranch, deserializedPatches));
            modifiedBranches.sort((a, b)=>{
                if (a.repo !== b.repo) {
                    return a.repo < b.repo ? -1 : 1;
                }
                if (a.branch !== b.branch) {
                    return a.branch < b.branch ? -1 : 1;
                }
                return 0;
            });
            const deserializedReleaseBranches = allReleaseBranches.map((releaseBranch)=>ReleaseBranch.deserialize(releaseBranch));
            return new Maintenance(deserializedPatches, modifiedBranches, deserializedReleaseBranches);
        }
        /**
     * Saves the state of this object into the maintenance file.
     * @public
     */ save() {
            return fs.writeFileSync(MAINTENANCE_FILE, JSON.stringify(this.serialize(), null, 2));
        }
        /**
     * Loads a new Maintenance object (if possible) from the maintenance file.
     * @public
     *
     * @returns {Maintenance}
     */ static load() {
            if (fs.existsSync(MAINTENANCE_FILE)) {
                return Maintenance.deserialize(JSON.parse(fs.readFileSync(MAINTENANCE_FILE, 'utf8')));
            } else {
                return new Maintenance();
            }
        }
        /**
     * Starts a command-line REPL with features loaded.
     * @public
     *
     * @returns {Promise}
     */ static startREPL() {
            return new Promise((resolve, reject)=>{
                winston.default.transports.console.level = 'error';
                const session = repl.start({
                    prompt: 'maintenance> ',
                    useColors: true,
                    replMode: repl.REPL_MODE_STRICT,
                    ignoreUndefined: true
                });
                // Wait for promises before being ready for input
                const nodeEval = session.eval;
                session.eval = /*#__PURE__*/ _async_to_generator(function*(cmd, context, filename, callback) {
                    nodeEval(cmd, context, filename, (_, result)=>{
                        if (result instanceof Promise) {
                            result.then((val)=>callback(_, val)).catch((e)=>{
                                if (e.stack) {
                                    console.error(`Maintenance task failed:\n${e.stack}\nFull Error details:\n${JSON.stringify(e, null, 2)}`);
                                } else if (typeof e === 'string') {
                                    console.error(`Maintenance task failed: ${e}`);
                                } else {
                                    console.error(`Maintenance task failed with unknown error: ${JSON.stringify(e, null, 2)}`);
                                }
                            });
                        } else {
                            callback(_, result);
                        }
                    });
                });
                // Only autocomplete "public" API functions for Maintenance.
                // const nodeCompleter = session.completer;
                // session.completer = function( text, cb ) {
                //   nodeCompleter( text, ( _, [ completions, completed ] ) => {
                //     const match = completed.match( /^Maintenance\.(\w*)+/ );
                //     if ( match ) {
                //       const funcStart = match[ 1 ];
                //       cb( null, [ PUBLIC_FUNCTIONS.filter( f => f.startsWith( funcStart ) ).map( f => `Maintenance.${f}` ), completed ] );
                //     }
                //     else {
                //       cb( null, [ completions, completed ] );
                //     }
                //   } );
                // };
                // Allow controlling verbosity
                Object.defineProperty(global, 'verbose', {
                    get () {
                        return winston.default.transports.console.level === 'info';
                    },
                    set (value) {
                        winston.default.transports.console.level = value ? 'info' : 'error';
                    }
                });
                session.context.Maintenance = Maintenance;
                session.context.m = Maintenance;
                session.context.M = Maintenance;
                session.context.ReleaseBranch = ReleaseBranch;
                session.context.rb = ReleaseBranch;
                session.on('exit', resolve);
            });
        }
        /**
     * Looks up a patch by its name.
     * @public
     *
     * @param {string} patchName
     * @returns {Patch}
     */ findPatch(patchName) {
            const patch = this.patches.find((p)=>p.name === patchName);
            assert(patch, `Patch not found for ${patchName}`);
            return patch;
        }
        /**
     * Looks up (or adds) a ModifiedBranch by its identifying information.
     * @public
     *
     * @param {string} repo
     * @param {string} branch
     * @param {boolean} [errorIfMissing]
     * @param {Array.<ReleaseBranch>} [releaseBranches] - If provided, it will speed up the process
     * @returns {Promise.<ModifiedBranch>}
     */ ensureModifiedBranch(repo, branch, errorIfMissing = false, releaseBranches = null) {
            var _this = this;
            return _async_to_generator(function*() {
                let modifiedBranch = _this.modifiedBranches.find((modifiedBranch)=>modifiedBranch.repo === repo && modifiedBranch.branch === branch);
                if (!modifiedBranch) {
                    if (errorIfMissing) {
                        throw new Error(`Could not find a tracked modified branch for ${repo} ${branch}`);
                    }
                    // Use the instance version of getMaintenanceBranches to make sure that this Maintenance instance is updated with new ReleaseBranches.
                    releaseBranches = releaseBranches || (yield _this.getMaintenanceBranches((releaseBranch)=>releaseBranch.repo === repo));
                    const releaseBranch = releaseBranches.find((release)=>release.repo === repo && release.branch === branch);
                    assert(releaseBranch, `Could not find a release branch for repo=${repo} branch=${branch}`);
                    modifiedBranch = new ModifiedBranch(releaseBranch);
                    // If we are creating it, add it to our list.
                    _this.modifiedBranches.push(modifiedBranch);
                }
                return modifiedBranch;
            })();
        }
        /**
     * Attempts to remove a modified branch (if it doesn't need to be kept around).
     * @public
     *
     * @param {ModifiedBranch} modifiedBranch
     */ tryRemovingModifiedBranch(modifiedBranch) {
            if (modifiedBranch.isUnused) {
                const index = this.modifiedBranches.indexOf(modifiedBranch);
                assert(index >= 0);
                this.modifiedBranches.splice(index, 1);
            }
        }
        /**
     * @public
     * @constructor
     *
     * @param {Array.<Patch>} [patches]
     * @param {Array.<ModifiedBranch>} [modifiedBranches]
     * @param  {Array.<ReleaseBranch>} [allReleaseBranches]
     */ constructor(patches = [], modifiedBranches = [], allReleaseBranches = []){
            assert(Array.isArray(patches));
            patches.forEach((patch)=>assert(patch instanceof Patch));
            assert(Array.isArray(modifiedBranches));
            modifiedBranches.forEach((branch)=>assert(branch instanceof ModifiedBranch));
            // @public {Array.<Patch>}
            this.patches = patches;
            // @public {Array.<ModifiedBranch>}
            this.modifiedBranches = modifiedBranches;
            // @public {Array.<ReleaseBranch>}
            this.allReleaseBranches = allReleaseBranches;
        }
    };
    return Maintenance;
}();

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3BlcmVubmlhbC1hbGlhcy9qcy9jb21tb24vTWFpbnRlbmFuY2UuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTgsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIFRoZSBtYWluIHBlcnNpc3RlbnQgc3RhdGUtYmVhcmluZyBvYmplY3QgZm9yIG1haW50ZW5hbmNlIHJlbGVhc2VzLiBDYW4gYmUgbG9hZGVkIGZyb20gb3Igc2F2ZWQgdG8gYSBkZWRpY2F0ZWQgZmlsZS5cbiAqXG4gKiBAYXV0aG9yIEpvbmF0aGFuIE9sc29uIDxqb25hdGhhbi5vbHNvbkBjb2xvcmFkby5lZHU+XG4gKi9cblxuY29uc3QgcHJvZHVjdGlvbiA9IHJlcXVpcmUoICcuLi9ncnVudC9wcm9kdWN0aW9uJyApO1xuY29uc3QgcmMgPSByZXF1aXJlKCAnLi4vZ3J1bnQvcmMnICk7XG5jb25zdCBDaGlwcGVyVmVyc2lvbiA9IHJlcXVpcmUoICcuL0NoaXBwZXJWZXJzaW9uJyApO1xuY29uc3QgTW9kaWZpZWRCcmFuY2ggPSByZXF1aXJlKCAnLi9Nb2RpZmllZEJyYW5jaCcgKTtcbmNvbnN0IFBhdGNoID0gcmVxdWlyZSggJy4vUGF0Y2gnICk7XG5jb25zdCBSZWxlYXNlQnJhbmNoID0gcmVxdWlyZSggJy4vUmVsZWFzZUJyYW5jaCcgKTtcbmNvbnN0IGJ1aWxkID0gcmVxdWlyZSggJy4vYnVpbGQnICk7XG5jb25zdCBjaGVja291dE1haW4gPSByZXF1aXJlKCAnLi9jaGVja291dE1haW4nICk7XG5jb25zdCBjaGVja291dFRhcmdldCA9IHJlcXVpcmUoICcuL2NoZWNrb3V0VGFyZ2V0JyApO1xuY29uc3QgZXhlY3V0ZSA9IHJlcXVpcmUoICcuL2V4ZWN1dGUnICkuZGVmYXVsdDtcbmNvbnN0IGdldEFjdGl2ZVJlcG9zID0gcmVxdWlyZSggJy4vZ2V0QWN0aXZlUmVwb3MnICk7XG5jb25zdCBnZXRCcmFuY2hlcyA9IHJlcXVpcmUoICcuL2dldEJyYW5jaGVzJyApO1xuY29uc3QgZ2V0QnJhbmNoTWFwID0gcmVxdWlyZSggJy4vZ2V0QnJhbmNoTWFwJyApO1xuY29uc3QgZ2V0RGVwZW5kZW5jaWVzID0gcmVxdWlyZSggJy4vZ2V0RGVwZW5kZW5jaWVzJyApO1xuY29uc3QgZ2l0QWRkID0gcmVxdWlyZSggJy4vZ2l0QWRkJyApO1xuY29uc3QgZ2l0Q2hlY2tvdXQgPSByZXF1aXJlKCAnLi9naXRDaGVja291dCcgKTtcbmNvbnN0IGdpdENoZXJyeVBpY2sgPSByZXF1aXJlKCAnLi9naXRDaGVycnlQaWNrJyApO1xuY29uc3QgZ2l0Q29tbWl0ID0gcmVxdWlyZSggJy4vZ2l0Q29tbWl0JyApO1xuY29uc3QgZ2l0Q3JlYXRlQnJhbmNoID0gcmVxdWlyZSggJy4vZ2l0Q3JlYXRlQnJhbmNoJyApO1xuY29uc3QgZ2l0SXNDbGVhbiA9IHJlcXVpcmUoICcuL2dpdElzQ2xlYW4nICk7XG5jb25zdCBnaXRQdWxsID0gcmVxdWlyZSggJy4vZ2l0UHVsbCcgKTtcbmNvbnN0IGdpdFB1c2ggPSByZXF1aXJlKCAnLi9naXRQdXNoJyApO1xuY29uc3QgZ2l0UmV2UGFyc2UgPSByZXF1aXJlKCAnLi9naXRSZXZQYXJzZScgKTtcbmNvbnN0IGFzc2VydCA9IHJlcXVpcmUoICdhc3NlcnQnICk7XG5jb25zdCBhc3luY1EgPSByZXF1aXJlKCAnYXN5bmMtcScgKTtcbmNvbnN0IF8gPSByZXF1aXJlKCAnbG9kYXNoJyApO1xuY29uc3QgZnMgPSByZXF1aXJlKCAnZnMnICk7XG5jb25zdCByZXBsID0gcmVxdWlyZSggJ3JlcGwnICk7XG5jb25zdCB3aW5zdG9uID0gcmVxdWlyZSggJ3dpbnN0b24nICk7XG5jb25zdCBncnVudENvbW1hbmQgPSByZXF1aXJlKCAnLi9ncnVudENvbW1hbmQnICk7XG5jb25zdCBjaGlwcGVyU3VwcG9ydHNPdXRwdXRKU0dydW50VGFza3MgPSByZXF1aXJlKCAnLi9jaGlwcGVyU3VwcG9ydHNPdXRwdXRKU0dydW50VGFza3MnICk7XG5cbi8vIGNvbnN0YW50c1xuY29uc3QgTUFJTlRFTkFOQ0VfRklMRSA9ICcubWFpbnRlbmFuY2UuanNvbic7XG5cbi8vIGNvbnN0IFBVQkxJQ19GVU5DVElPTlMgPSBbXG4vLyAgICdhZGRBbGxOZWVkZWRQYXRjaGVzJyxcbi8vICAgJ2FkZE5lZWRlZFBhdGNoJyxcbi8vICAgJ2FkZE5lZWRlZFBhdGNoZXMnLFxuLy8gICAnYWRkTmVlZGVkUGF0Y2hlc0FmdGVyJyxcbi8vICAgJ2FkZE5lZWRlZFBhdGNoZXNCZWZvcmUnLFxuLy8gICAnYWRkTmVlZGVkUGF0Y2hlc0J1aWxkRmlsdGVyJyxcbi8vICAgJ2FkZE5lZWRlZFBhdGNoUmVsZWFzZUJyYW5jaCcsXG4vLyAgICdhZGRQYXRjaFNIQScsXG4vLyAgICdhcHBseVBhdGNoZXMnLFxuLy8gICAnYnVpbGRBbGwnLFxuLy8gICAnY2hlY2tCcmFuY2hTdGF0dXMnLFxuLy8gICAnY2hlY2tvdXRCcmFuY2gnLFxuLy8gICAnY3JlYXRlUGF0Y2gnLFxuLy8gICAnZGVwbG95UHJvZHVjdGlvbicsXG4vLyAgICdkZXBsb3lSZWxlYXNlQ2FuZGlkYXRlcycsXG4vLyAgICdsaXN0Jyxcbi8vICAgJ2xpc3RMaW5rcycsXG4vLyAgICdyZW1vdmVOZWVkZWRQYXRjaCcsXG4vLyAgICdyZW1vdmVOZWVkZWRQYXRjaGVzJyxcbi8vICAgJ3JlbW92ZU5lZWRlZFBhdGNoZXNBZnRlcicsXG4vLyAgICdyZW1vdmVOZWVkZWRQYXRjaGVzQmVmb3JlJyxcbi8vICAgJ3JlbW92ZVBhdGNoJyxcbi8vICAgJ3JlbW92ZVBhdGNoU0hBJyxcbi8vICAgJ3Jlc2V0Jyxcbi8vICAgJ3VwZGF0ZURlcGVuZGVuY2llcydcbi8vICAgJ2dldEFsbE1haW50ZW5hbmNlQnJhbmNoZXMnXG4vLyBdO1xuXG4vKipcbiAqIEB0eXBlZGVmIFNlcmlhbGl6ZWRNYWludGVuYW5jZSAtIHNlZSBNYWludGVuYW5jZS5zZXJpYWxpemUoKVxuICogQHByb3BlcnR5IHtBcnJheS48T2JqZWN0Pn0gcGF0Y2hlc1xuICogQHByb3BlcnR5IHtBcnJheS48T2JqZWN0Pn0gbW9kaWZpZWRCcmFuY2hlc1xuICogQHByb3BlcnR5IHtBcnJheS48T2JqZWN0Pn0gYWxsUmVsZWFzZUJyYW5jaGVzXG4gKi9cblxubW9kdWxlLmV4cG9ydHMgPSAoIGZ1bmN0aW9uKCkge1xuXG4gIGNsYXNzIE1haW50ZW5hbmNlIHtcbiAgICAvKipcbiAgICAgKiBAcHVibGljXG4gICAgICogQGNvbnN0cnVjdG9yXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge0FycmF5LjxQYXRjaD59IFtwYXRjaGVzXVxuICAgICAqIEBwYXJhbSB7QXJyYXkuPE1vZGlmaWVkQnJhbmNoPn0gW21vZGlmaWVkQnJhbmNoZXNdXG4gICAgICogQHBhcmFtICB7QXJyYXkuPFJlbGVhc2VCcmFuY2g+fSBbYWxsUmVsZWFzZUJyYW5jaGVzXVxuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKCBwYXRjaGVzID0gW10sIG1vZGlmaWVkQnJhbmNoZXMgPSBbXSwgYWxsUmVsZWFzZUJyYW5jaGVzID0gW10gKSB7XG4gICAgICBhc3NlcnQoIEFycmF5LmlzQXJyYXkoIHBhdGNoZXMgKSApO1xuICAgICAgcGF0Y2hlcy5mb3JFYWNoKCBwYXRjaCA9PiBhc3NlcnQoIHBhdGNoIGluc3RhbmNlb2YgUGF0Y2ggKSApO1xuICAgICAgYXNzZXJ0KCBBcnJheS5pc0FycmF5KCBtb2RpZmllZEJyYW5jaGVzICkgKTtcbiAgICAgIG1vZGlmaWVkQnJhbmNoZXMuZm9yRWFjaCggYnJhbmNoID0+IGFzc2VydCggYnJhbmNoIGluc3RhbmNlb2YgTW9kaWZpZWRCcmFuY2ggKSApO1xuXG4gICAgICAvLyBAcHVibGljIHtBcnJheS48UGF0Y2g+fVxuICAgICAgdGhpcy5wYXRjaGVzID0gcGF0Y2hlcztcblxuICAgICAgLy8gQHB1YmxpYyB7QXJyYXkuPE1vZGlmaWVkQnJhbmNoPn1cbiAgICAgIHRoaXMubW9kaWZpZWRCcmFuY2hlcyA9IG1vZGlmaWVkQnJhbmNoZXM7XG5cbiAgICAgIC8vIEBwdWJsaWMge0FycmF5LjxSZWxlYXNlQnJhbmNoPn1cbiAgICAgIHRoaXMuYWxsUmVsZWFzZUJyYW5jaGVzID0gYWxsUmVsZWFzZUJyYW5jaGVzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJlc2V0cyBBTEwgdGhlIG1haW50ZW5hbmNlIHN0YXRlIHRvIGEgZGVmYXVsdCBcImJsYW5rXCIgc3RhdGUuXG4gICAgICogQHB1YmxpY1xuICAgICAqIEBwYXJhbSBrZWVwQ2FjaGVkUmVsZWFzZUJyYW5jaGVzIHtib29sZWFufSAtIGFsbFJlbGVhc2VCcmFuY2hlcyB0YWtlIGEgd2hpbGUgdG8gcG9wdWxhdGUsIGFuZCBoYXZlIGxpdHRsZSB0byBkb1xuICAgICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdpdGggdGhlIGN1cnJlbnQgTVIsIHNvIG9wdGlvbmFsbHkga2VlcCB0aGVtIGluIHN0b3JhZ2UuXG4gICAgICpcbiAgICAgKiBDQVVUSU9OOiBUaGlzIHdpbGwgcmVtb3ZlIGFueSBpbmZvcm1hdGlvbiBhYm91dCBhbnkgb25nb2luZy9jb21wbGV0ZSBtYWludGVuYW5jZSByZWxlYXNlIGZyb20geW91clxuICAgICAqIC5tYWludGVuYW5jZS5qc29uLiBHZW5lcmFsbHkgdGhpcyBzaG91bGQgYmUgZG9uZSBiZWZvcmUgYW55IG5ldyBtYWludGVuYW5jZSByZWxlYXNlLlxuICAgICAqL1xuICAgIHN0YXRpYyByZXNldCgga2VlcENhY2hlZFJlbGVhc2VCcmFuY2hlcyA9IGZhbHNlICkge1xuICAgICAgY29uc29sZS5sb2coICdNYWtlIHN1cmUgdG8gY2hlY2sgb24gdGhlIGFjdGl2ZSBQaEVULWlPIERlcGxveSBTdGF0dXMgb24gcGhldC5jb2xvcmFkby5lZHUgdG8gZW5zdXJlIHRoYXQgdGhlICcgK1xuICAgICAgICAgICAgICAgICAgICdyaWdodCBQaEVULWlPIHNpbXMgYXJlIGluY2x1ZGVkIGluIHRoaXMgbWFpbnRlbmFuY2UgcmVsZWFzZS4nICk7XG5cbiAgICAgIGNvbnN0IGFsbFJlbGVhc2VCcmFuY2hlcyA9IFtdO1xuICAgICAgaWYgKCBrZWVwQ2FjaGVkUmVsZWFzZUJyYW5jaGVzICkge1xuICAgICAgICBjb25zdCBtYWludGVuYW5jZSA9IE1haW50ZW5hbmNlLmxvYWQoKTtcbiAgICAgICAgYWxsUmVsZWFzZUJyYW5jaGVzLnB1c2goIC4uLm1haW50ZW5hbmNlLmFsbFJlbGVhc2VCcmFuY2hlcyApO1xuICAgICAgfVxuICAgICAgbmV3IE1haW50ZW5hbmNlKCBbXSwgW10sIGFsbFJlbGVhc2VCcmFuY2hlcyApLnNhdmUoKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSdW5zIGEgbnVtYmVyIG9mIGNoZWNrcyB0aHJvdWdoIGV2ZXJ5IHJlbGVhc2UgYnJhbmNoLlxuICAgICAqIEBwdWJsaWNcbiAgICAgKlxuICAgICAqIEBwYXJhbSB7ZnVuY3Rpb24oUmVsZWFzZUJyYW5jaCk6UHJvbWlzZS48Ym9vbGVhbj59IFtmaWx0ZXJdIC0gT3B0aW9uYWwgZmlsdGVyLCByZWxlYXNlIGJyYW5jaGVzIHdpbGwgYmUgc2tpcHBlZFxuICAgICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgdGhpcyByZXNvbHZlcyB0byBmYWxzZVxuICAgICAqIEByZXR1cm5zIHtQcm9taXNlfVxuICAgICAqL1xuICAgIHN0YXRpYyBhc3luYyBjaGVja0JyYW5jaFN0YXR1cyggZmlsdGVyICkge1xuICAgICAgZm9yICggY29uc3QgcmVwbyBvZiBnZXRBY3RpdmVSZXBvcygpICkge1xuICAgICAgICBpZiAoIHJlcG8gIT09ICdwZXJlbm5pYWwnICYmICEoIGF3YWl0IGdpdElzQ2xlYW4oIHJlcG8gKSApICkge1xuICAgICAgICAgIGNvbnNvbGUubG9nKCBgVW5jbGVhbiByZXBvc2l0b3J5OiAke3JlcG99LCBwbGVhc2UgcmVzb2x2ZSB0aGlzIGFuZCB0aGVuIHJ1biBjaGVja0JyYW5jaFN0YXR1cyBhZ2FpbmAgKTtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgY29uc3QgcmVsZWFzZUJyYW5jaGVzID0gYXdhaXQgTWFpbnRlbmFuY2UuZ2V0TWFpbnRlbmFuY2VCcmFuY2hlcyggZmlsdGVyICk7XG5cbiAgICAgIC8vIFNldCB1cCBhIGNhY2hlIG9mIGJyYW5jaE1hcHMgc28gdGhhdCB3ZSBkb24ndCBtYWtlIG11bHRpcGxlIHJlcXVlc3RzXG4gICAgICBjb25zdCBicmFuY2hNYXBzID0ge307XG4gICAgICBjb25zdCBnZXRCcmFuY2hNYXBBc3luY0NhbGxiYWNrID0gYXN5bmMgcmVwbyA9PiB7XG4gICAgICAgIGlmICggIWJyYW5jaE1hcHNbIHJlcG8gXSApIHtcbiAgICAgICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgcmVxdWlyZS1hdG9taWMtdXBkYXRlc1xuICAgICAgICAgIGJyYW5jaE1hcHNbIHJlcG8gXSA9IGF3YWl0IGdldEJyYW5jaE1hcCggcmVwbyApO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBicmFuY2hNYXBzWyByZXBvIF07XG4gICAgICB9O1xuXG4gICAgICBmb3IgKCBjb25zdCByZWxlYXNlQnJhbmNoIG9mIHJlbGVhc2VCcmFuY2hlcyApIHtcbiAgICAgICAgaWYgKCAhZmlsdGVyIHx8IGF3YWl0IGZpbHRlciggcmVsZWFzZUJyYW5jaCApICkge1xuICAgICAgICAgIGNvbnNvbGUubG9nKCBgJHtyZWxlYXNlQnJhbmNoLnJlcG99ICR7cmVsZWFzZUJyYW5jaC5icmFuY2h9YCApO1xuICAgICAgICAgIGZvciAoIGNvbnN0IGxpbmUgb2YgYXdhaXQgcmVsZWFzZUJyYW5jaC5nZXRTdGF0dXMoIGdldEJyYW5jaE1hcEFzeW5jQ2FsbGJhY2sgKSApIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCBgICAke2xpbmV9YCApO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICBjb25zb2xlLmxvZyggYCR7cmVsZWFzZUJyYW5jaC5yZXBvfSAke3JlbGVhc2VCcmFuY2guYnJhbmNofSAoc2tpcHBpbmcgZHVlIHRvIGZpbHRlcilgICk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBCdWlsZHMgYWxsIHJlbGVhc2UgYnJhbmNoZXMgKHNvIHRoYXQgdGhlIHN0YXRlIG9mIHRoaW5ncyBjYW4gYmUgY2hlY2tlZCkuIFB1dHMgaW4gaW4gcGVyZW5uaWFsL2J1aWxkLlxuICAgICAqIEBwdWJsaWNcbiAgICAgKi9cbiAgICBzdGF0aWMgYXN5bmMgYnVpbGRBbGwoKSB7XG4gICAgICBjb25zdCByZWxlYXNlQnJhbmNoZXMgPSBhd2FpdCBNYWludGVuYW5jZS5nZXRNYWludGVuYW5jZUJyYW5jaGVzKCk7XG5cbiAgICAgIGNvbnN0IGZhaWxlZCA9IFtdO1xuXG4gICAgICBmb3IgKCBjb25zdCByZWxlYXNlQnJhbmNoIG9mIHJlbGVhc2VCcmFuY2hlcyApIHtcbiAgICAgICAgY29uc29sZS5sb2coIGBidWlsZGluZyAke3JlbGVhc2VCcmFuY2gucmVwb30gJHtyZWxlYXNlQnJhbmNoLmJyYW5jaH1gICk7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgYXdhaXQgY2hlY2tvdXRUYXJnZXQoIHJlbGVhc2VCcmFuY2gucmVwbywgcmVsZWFzZUJyYW5jaC5icmFuY2gsIHRydWUgKTsgLy8gaW5jbHVkZSBucG0gdXBkYXRlXG4gICAgICAgICAgYXdhaXQgYnVpbGQoIHJlbGVhc2VCcmFuY2gucmVwbywge1xuICAgICAgICAgICAgYnJhbmRzOiByZWxlYXNlQnJhbmNoLmJyYW5kc1xuICAgICAgICAgIH0gKTtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoICdVTklNUExFTUVOVEVELCBjb3B5IG92ZXInICk7XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2goIGUgKSB7XG4gICAgICAgICAgZmFpbGVkLnB1c2goIGAke3JlbGVhc2VCcmFuY2gucmVwb30gJHtyZWxlYXNlQnJhbmNoLmJyYW5kfWAgKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpZiAoIGZhaWxlZC5sZW5ndGggKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCBgRmFpbGVkIGJ1aWxkczpcXG4ke2ZhaWxlZC5qb2luKCAnXFxuJyApfWAgKTtcbiAgICAgIH1cbiAgICAgIGVsc2Uge1xuICAgICAgICBjb25zb2xlLmxvZyggJ0J1aWxkcyBjb21wbGV0ZScgKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBEaXNwbGF5cyBhIGxpc3Rpbmcgb2YgdGhlIGN1cnJlbnQgbWFpbnRlbmFuY2Ugc3RhdHVzLlxuICAgICAqIEBwdWJsaWNcbiAgICAgKlxuICAgICAqIEByZXR1cm5zIHtQcm9taXNlfVxuICAgICAqL1xuICAgIHN0YXRpYyBhc3luYyBsaXN0KCkge1xuICAgICAgY29uc3QgbWFpbnRlbmFuY2UgPSBNYWludGVuYW5jZS5sb2FkKCk7XG5cbiAgICAgIC8vIEF0IHRoZSB0b3Agc28gdGhhdCB0aGUgaW1wb3J0YW50IGl0ZW1zIGFyZSByaWdodCBhYm92ZSB5b3VyIGN1cnNvciBhZnRlciBjYWxsaW5nIHRoZSBmdW5jdGlvblxuICAgICAgaWYgKCBtYWludGVuYW5jZS5hbGxSZWxlYXNlQnJhbmNoZXMubGVuZ3RoID4gMCApIHtcbiAgICAgICAgY29uc29sZS5sb2coIGBUb3RhbCByZWNvZ25pemVkIFJlbGVhc2VCcmFuY2hlczogJHttYWludGVuYW5jZS5hbGxSZWxlYXNlQnJhbmNoZXMubGVuZ3RofWAgKTtcbiAgICAgIH1cblxuICAgICAgY29uc29sZS5sb2coICdcXG5SZWxlYXNlIEJyYW5jaGVzIGluIE1SOicsIG1haW50ZW5hbmNlLnBhdGNoZXMubGVuZ3RoID09PSAwID8gJ05vbmUnIDogJycgKTtcbiAgICAgIGZvciAoIGNvbnN0IG1vZGlmaWVkQnJhbmNoIG9mIG1haW50ZW5hbmNlLm1vZGlmaWVkQnJhbmNoZXMgKSB7XG4gICAgICAgIGNvbnN0IGNvdW50ID0gbWFpbnRlbmFuY2UubW9kaWZpZWRCcmFuY2hlcy5pbmRleE9mKCBtb2RpZmllZEJyYW5jaCApICsgMTtcbiAgICAgICAgY29uc29sZS5sb2coIGAke2NvdW50fS4gJHttb2RpZmllZEJyYW5jaC5yZXBvfSAke21vZGlmaWVkQnJhbmNoLmJyYW5jaH0gJHttb2RpZmllZEJyYW5jaC5icmFuZHMuam9pbiggJywnICl9JHttb2RpZmllZEJyYW5jaC5yZWxlYXNlQnJhbmNoLmlzUmVsZWFzZWQgPyAnJyA6ICcgKHVucmVsZWFzZWQpJ31gICk7XG4gICAgICAgIGlmICggbW9kaWZpZWRCcmFuY2guZGVwbG95ZWRWZXJzaW9uICkge1xuICAgICAgICAgIGNvbnNvbGUubG9nKCBgICAgIGRlcGxveWVkOiAke21vZGlmaWVkQnJhbmNoLmRlcGxveWVkVmVyc2lvbi50b1N0cmluZygpfWAgKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIG1vZGlmaWVkQnJhbmNoLm5lZWRlZFBhdGNoZXMubGVuZ3RoICkge1xuICAgICAgICAgIGNvbnNvbGUubG9nKCBgICAgIG5lZWRzOiAke21vZGlmaWVkQnJhbmNoLm5lZWRlZFBhdGNoZXMubWFwKCBwYXRjaCA9PiBwYXRjaC5uYW1lICkuam9pbiggJywnICl9YCApO1xuICAgICAgICB9XG4gICAgICAgIGlmICggbW9kaWZpZWRCcmFuY2gucHVzaGVkTWVzc2FnZXMubGVuZ3RoICkge1xuICAgICAgICAgIGNvbnNvbGUubG9nKCBgICAgIHB1c2hlZE1lc3NhZ2VzOiBcXG4gICAgICAke21vZGlmaWVkQnJhbmNoLnB1c2hlZE1lc3NhZ2VzLmpvaW4oICdcXG4gICAgICAnICl9YCApO1xuICAgICAgICB9XG4gICAgICAgIGlmICggbW9kaWZpZWRCcmFuY2gucGVuZGluZ01lc3NhZ2VzLmxlbmd0aCApIHtcbiAgICAgICAgICBjb25zb2xlLmxvZyggYCAgICBwZW5kaW5nTWVzc2FnZXM6IFxcbiAgICAgICR7bW9kaWZpZWRCcmFuY2gucGVuZGluZ01lc3NhZ2VzLmpvaW4oICdcXG4gICAgICAnICl9YCApO1xuICAgICAgICB9XG4gICAgICAgIGlmICggT2JqZWN0LmtleXMoIG1vZGlmaWVkQnJhbmNoLmNoYW5nZWREZXBlbmRlbmNpZXMgKS5sZW5ndGggPiAwICkge1xuICAgICAgICAgIGNvbnNvbGUubG9nKCAnICAgIGRlcHM6JyApO1xuICAgICAgICAgIGZvciAoIGNvbnN0IGtleSBvZiBPYmplY3Qua2V5cyggbW9kaWZpZWRCcmFuY2guY2hhbmdlZERlcGVuZGVuY2llcyApICkge1xuICAgICAgICAgICAgY29uc29sZS5sb2coIGAgICAgICAke2tleX06ICR7bW9kaWZpZWRCcmFuY2guY2hhbmdlZERlcGVuZGVuY2llc1sga2V5IF19YCApO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBjb25zb2xlLmxvZyggJ1xcbk1haW50ZW5hbmNlIFBhdGNoZXMgaW4gTVI6JywgbWFpbnRlbmFuY2UucGF0Y2hlcy5sZW5ndGggPT09IDAgPyAnTm9uZScgOiAnJyApO1xuICAgICAgZm9yICggY29uc3QgcGF0Y2ggb2YgbWFpbnRlbmFuY2UucGF0Y2hlcyApIHtcbiAgICAgICAgY29uc3QgY291bnQgPSBtYWludGVuYW5jZS5wYXRjaGVzLmluZGV4T2YoIHBhdGNoICkgKyAxO1xuICAgICAgICBjb25zdCBpbmRleEFuZFNwYWNpbmcgPSBgJHtjb3VudH0uIGAgKyAoIGNvdW50ID4gOSA/ICcnIDogJyAnICk7XG5cbiAgICAgICAgY29uc29sZS5sb2coIGAke2luZGV4QW5kU3BhY2luZ31bJHtwYXRjaC5uYW1lfV0ke3BhdGNoLm5hbWUgIT09IHBhdGNoLnJlcG8gPyBgICgke3BhdGNoLnJlcG99KWAgOiAnJ30gJHtwYXRjaC5tZXNzYWdlfWAgKTtcbiAgICAgICAgZm9yICggY29uc3Qgc2hhIG9mIHBhdGNoLnNoYXMgKSB7XG4gICAgICAgICAgY29uc29sZS5sb2coIGAgICAgICAke3NoYX1gICk7XG4gICAgICAgIH1cbiAgICAgICAgZm9yICggY29uc3QgbW9kaWZpZWRCcmFuY2ggb2YgbWFpbnRlbmFuY2UubW9kaWZpZWRCcmFuY2hlcyApIHtcbiAgICAgICAgICBpZiAoIG1vZGlmaWVkQnJhbmNoLm5lZWRlZFBhdGNoZXMuaW5jbHVkZXMoIHBhdGNoICkgKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyggYCAgICAgICAgJHttb2RpZmllZEJyYW5jaC5yZXBvfSAke21vZGlmaWVkQnJhbmNoLmJyYW5jaH0gJHttb2RpZmllZEJyYW5jaC5icmFuZHMuam9pbiggJywnICl9YCApO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFNob3dzIGFueSByZXF1aXJlZCB0ZXN0aW5nIGxpbmtzIGZvciB0aGUgc2ltdWxhdGlvbnMuXG4gICAgICogQHB1YmxpY1xuICAgICAqXG4gICAgICogQHBhcmFtIHtmdW5jdGlvbihNb2RpZmllZEJyYW5jaCk6Ym9vbGVhbn0gW2ZpbHRlcl0gLSBDb250cm9sIHdoaWNoIGJyYW5jaGVzIGFyZSBzaG93blxuICAgICAqL1xuICAgIHN0YXRpYyBhc3luYyBsaXN0TGlua3MoIGZpbHRlciA9ICgpID0+IHRydWUgKSB7XG4gICAgICBjb25zdCBtYWludGVuYW5jZSA9IE1haW50ZW5hbmNlLmxvYWQoKTtcblxuICAgICAgY29uc3QgZGVwbG95ZWRCcmFuY2hlcyA9IG1haW50ZW5hbmNlLm1vZGlmaWVkQnJhbmNoZXMuZmlsdGVyKCBtb2RpZmllZEJyYW5jaCA9PiAhIW1vZGlmaWVkQnJhbmNoLmRlcGxveWVkVmVyc2lvbiAmJiBmaWx0ZXIoIG1vZGlmaWVkQnJhbmNoICkgKTtcbiAgICAgIGNvbnN0IHByb2R1Y3Rpb25CcmFuY2hlcyA9IGRlcGxveWVkQnJhbmNoZXMuZmlsdGVyKCBtb2RpZmllZEJyYW5jaCA9PiBtb2RpZmllZEJyYW5jaC5kZXBsb3llZFZlcnNpb24udGVzdFR5cGUgPT09IG51bGwgKTtcbiAgICAgIGNvbnN0IHJlbGVhc2VDYW5kaWRhdGVCcmFuY2hlcyA9IGRlcGxveWVkQnJhbmNoZXMuZmlsdGVyKCBtb2RpZmllZEJyYW5jaCA9PiBtb2RpZmllZEJyYW5jaC5kZXBsb3llZFZlcnNpb24udGVzdFR5cGUgPT09ICdyYycgKTtcblxuICAgICAgaWYgKCBwcm9kdWN0aW9uQnJhbmNoZXMubGVuZ3RoICkge1xuICAgICAgICBjb25zb2xlLmxvZyggJ1xcblByb2R1Y3Rpb24gbGlua3NcXG4nICk7XG5cbiAgICAgICAgZm9yICggY29uc3QgbW9kaWZpZWRCcmFuY2ggb2YgcHJvZHVjdGlvbkJyYW5jaGVzICkge1xuICAgICAgICAgIGNvbnN0IGxpbmtzID0gYXdhaXQgbW9kaWZpZWRCcmFuY2guZ2V0RGVwbG95ZWRMaW5rTGluZXMoKTtcbiAgICAgICAgICBmb3IgKCBjb25zdCBsaW5rIG9mIGxpbmtzICkge1xuICAgICAgICAgICAgY29uc29sZS5sb2coIGxpbmsgKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgaWYgKCByZWxlYXNlQ2FuZGlkYXRlQnJhbmNoZXMubGVuZ3RoICkge1xuICAgICAgICBjb25zb2xlLmxvZyggJ1xcblJlbGVhc2UgQ2FuZGlkYXRlIGxpbmtzXFxuJyApO1xuXG4gICAgICAgIGZvciAoIGNvbnN0IG1vZGlmaWVkQnJhbmNoIG9mIHJlbGVhc2VDYW5kaWRhdGVCcmFuY2hlcyApIHtcbiAgICAgICAgICBjb25zdCBsaW5rcyA9IGF3YWl0IG1vZGlmaWVkQnJhbmNoLmdldERlcGxveWVkTGlua0xpbmVzKCk7XG4gICAgICAgICAgZm9yICggY29uc3QgbGluayBvZiBsaW5rcyApIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCBsaW5rICk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ3JlYXRlcyBhbiBpc3N1ZSB0byBub3RlIHBhdGNoZXMgb24gYWxsIHVucmVsZWFzZWQgYnJhbmNoZXMgdGhhdCBpbmNsdWRlIGEgcHVzaGVkIG1lc3NhZ2UuXG4gICAgICogQHB1YmxpY1xuICAgICAqXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IFthZGRpdGlvbmFsTm90ZXNdXG4gICAgICovXG4gICAgc3RhdGljIGFzeW5jIGNyZWF0ZVVucmVsZWFzZWRJc3N1ZXMoIGFkZGl0aW9uYWxOb3RlcyA9ICcnICkge1xuICAgICAgY29uc3QgbWFpbnRlbmFuY2UgPSBNYWludGVuYW5jZS5sb2FkKCk7XG5cbiAgICAgIGZvciAoIGNvbnN0IG1vZGlmaWVkQnJhbmNoIG9mIG1haW50ZW5hbmNlLm1vZGlmaWVkQnJhbmNoZXMgKSB7XG4gICAgICAgIGlmICggIW1vZGlmaWVkQnJhbmNoLnJlbGVhc2VCcmFuY2guaXNSZWxlYXNlZCAmJiBtb2RpZmllZEJyYW5jaC5wdXNoZWRNZXNzYWdlcy5sZW5ndGggPiAwICkge1xuICAgICAgICAgIGNvbnNvbGUubG9nKCBgQ3JlYXRpbmcgaXNzdWUgZm9yICR7bW9kaWZpZWRCcmFuY2gucmVsZWFzZUJyYW5jaC50b1N0cmluZygpfWAgKTtcbiAgICAgICAgICBhd2FpdCBtb2RpZmllZEJyYW5jaC5jcmVhdGVVbnJlbGVhc2VkSXNzdWUoIGFkZGl0aW9uYWxOb3RlcyApO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGNvbnNvbGUubG9nKCAnRmluaXNoZWQgY3JlYXRpbmcgdW5yZWxlYXNlZCBpc3N1ZXMnICk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ3JlYXRlcyBhIHBhdGNoXG4gICAgICogQHB1YmxpY1xuICAgICAqXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHJlcG9cbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gbWVzc2FnZVxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBbcGF0Y2hOYW1lXSAtIElmIG5vIG5hbWUgaXMgcHJvdmlkZWQsIHRoZSByZXBvIHN0cmluZyB3aWxsIGJlIHVzZWQuXG4gICAgICogQHJldHVybnMge1Byb21pc2V9XG4gICAgICovXG4gICAgc3RhdGljIGFzeW5jIGNyZWF0ZVBhdGNoKCByZXBvLCBtZXNzYWdlLCBwYXRjaE5hbWUgKSB7XG4gICAgICBjb25zdCBtYWludGVuYW5jZSA9IE1haW50ZW5hbmNlLmxvYWQoKTtcblxuICAgICAgcGF0Y2hOYW1lID0gcGF0Y2hOYW1lIHx8IHJlcG87XG5cbiAgICAgIGZvciAoIGNvbnN0IHBhdGNoIG9mIG1haW50ZW5hbmNlLnBhdGNoZXMgKSB7XG4gICAgICAgIGlmICggcGF0Y2gubmFtZSA9PT0gcGF0Y2hOYW1lICkge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvciggJ011bHRpcGxlIHBhdGNoZXMgd2l0aCB0aGUgc2FtZSBuYW1lIGFyZSBub3QgY29uY3VycmVudGx5IHN1cHBvcnRlZCcgKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBtYWludGVuYW5jZS5wYXRjaGVzLnB1c2goIG5ldyBQYXRjaCggcmVwbywgcGF0Y2hOYW1lLCBtZXNzYWdlICkgKTtcblxuICAgICAgbWFpbnRlbmFuY2Uuc2F2ZSgpO1xuXG4gICAgICBjb25zb2xlLmxvZyggYENyZWF0ZWQgcGF0Y2ggZm9yICR7cmVwb30gd2l0aCBtZXNzYWdlOiAke21lc3NhZ2V9YCApO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJlbW92ZXMgYSBwYXRjaFxuICAgICAqIEBwdWJsaWNcbiAgICAgKlxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBwYXRjaE5hbWVcbiAgICAgKiBAcmV0dXJucyB7UHJvbWlzZX1cbiAgICAgKi9cbiAgICBzdGF0aWMgYXN5bmMgcmVtb3ZlUGF0Y2goIHBhdGNoTmFtZSApIHtcbiAgICAgIGNvbnN0IG1haW50ZW5hbmNlID0gTWFpbnRlbmFuY2UubG9hZCgpO1xuXG4gICAgICBjb25zdCBwYXRjaCA9IG1haW50ZW5hbmNlLmZpbmRQYXRjaCggcGF0Y2hOYW1lICk7XG5cbiAgICAgIGZvciAoIGNvbnN0IGJyYW5jaCBvZiBtYWludGVuYW5jZS5tb2RpZmllZEJyYW5jaGVzICkge1xuICAgICAgICBpZiAoIGJyYW5jaC5uZWVkZWRQYXRjaGVzLmluY2x1ZGVzKCBwYXRjaCApICkge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvciggJ1BhdGNoIGlzIG1hcmtlZCBhcyBuZWVkZWQgYnkgYXQgbGVhc3Qgb25lIGJyYW5jaCcgKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBtYWludGVuYW5jZS5wYXRjaGVzLnNwbGljZSggbWFpbnRlbmFuY2UucGF0Y2hlcy5pbmRleE9mKCBwYXRjaCApLCAxICk7XG5cbiAgICAgIG1haW50ZW5hbmNlLnNhdmUoKTtcblxuICAgICAgY29uc29sZS5sb2coIGBSZW1vdmVkIHBhdGNoIGZvciAke3BhdGNoTmFtZX1gICk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQWRkcyBhIHBhcnRpY3VsYXIgU0hBICh0byBjaGVycnktcGljaykgdG8gYSBwYXRjaC5cbiAgICAgKiBAcHVibGljXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gcGF0Y2hOYW1lXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IFtzaGFdXG4gICAgICogQHJldHVybnMge1Byb21pc2V9XG4gICAgICovXG4gICAgc3RhdGljIGFzeW5jIGFkZFBhdGNoU0hBKCBwYXRjaE5hbWUsIHNoYSApIHtcbiAgICAgIGNvbnN0IG1haW50ZW5hbmNlID0gTWFpbnRlbmFuY2UubG9hZCgpO1xuXG4gICAgICBjb25zdCBwYXRjaCA9IG1haW50ZW5hbmNlLmZpbmRQYXRjaCggcGF0Y2hOYW1lICk7XG5cbiAgICAgIGlmICggIXNoYSApIHtcbiAgICAgICAgc2hhID0gYXdhaXQgZ2l0UmV2UGFyc2UoIHBhdGNoLnJlcG8sICdIRUFEJyApO1xuICAgICAgICBjb25zb2xlLmxvZyggYFNIQSBub3QgcHJvdmlkZWQsIGRldGVjdGluZyBTSEE6ICR7c2hhfWAgKTtcbiAgICAgIH1cblxuICAgICAgcGF0Y2guc2hhcy5wdXNoKCBzaGEgKTtcblxuICAgICAgbWFpbnRlbmFuY2Uuc2F2ZSgpO1xuXG4gICAgICBjb25zb2xlLmxvZyggYEFkZGVkIFNIQSAke3NoYX0gdG8gcGF0Y2ggJHtwYXRjaE5hbWV9YCApO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJlbW92ZXMgYSBwYXJ0aWN1bGFyIFNIQSAodG8gY2hlcnJ5LXBpY2spIGZyb20gYSBwYXRjaC5cbiAgICAgKiBAcHVibGljXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gcGF0Y2hOYW1lXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHNoYVxuICAgICAqIEByZXR1cm5zIHtQcm9taXNlfVxuICAgICAqL1xuICAgIHN0YXRpYyBhc3luYyByZW1vdmVQYXRjaFNIQSggcGF0Y2hOYW1lLCBzaGEgKSB7XG4gICAgICBjb25zdCBtYWludGVuYW5jZSA9IE1haW50ZW5hbmNlLmxvYWQoKTtcblxuICAgICAgY29uc3QgcGF0Y2ggPSBtYWludGVuYW5jZS5maW5kUGF0Y2goIHBhdGNoTmFtZSApO1xuXG4gICAgICBjb25zdCBpbmRleCA9IHBhdGNoLnNoYXMuaW5kZXhPZiggc2hhICk7XG4gICAgICBhc3NlcnQoIGluZGV4ID49IDAsICdTSEEgbm90IGZvdW5kJyApO1xuXG4gICAgICBwYXRjaC5zaGFzLnNwbGljZSggaW5kZXgsIDEgKTtcblxuICAgICAgbWFpbnRlbmFuY2Uuc2F2ZSgpO1xuXG4gICAgICBjb25zb2xlLmxvZyggYFJlbW92ZWQgU0hBICR7c2hhfSBmcm9tIHBhdGNoICR7cGF0Y2hOYW1lfWAgKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZW1vdmVzIGFsbCBwYXRjaCBTSEFzIGZvciBhIHBhcnRpY3VsYXIgcGF0Y2guXG4gICAgICogQHB1YmxpY1xuICAgICAqXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHBhdGNoTmFtZVxuICAgICAqIEByZXR1cm5zIHtQcm9taXNlfVxuICAgICAqL1xuICAgIHN0YXRpYyBhc3luYyByZW1vdmVBbGxQYXRjaFNIQXMoIHBhdGNoTmFtZSApIHtcbiAgICAgIGNvbnN0IG1haW50ZW5hbmNlID0gTWFpbnRlbmFuY2UubG9hZCgpO1xuXG4gICAgICBjb25zdCBwYXRjaCA9IG1haW50ZW5hbmNlLmZpbmRQYXRjaCggcGF0Y2hOYW1lICk7XG5cbiAgICAgIGZvciAoIGNvbnN0IHNoYSBvZiBwYXRjaC5zaGFzICkge1xuICAgICAgICBjb25zb2xlLmxvZyggYFJlbW92aW5nIFNIQSAke3NoYX0gZnJvbSBwYXRjaCAke3BhdGNoTmFtZX1gICk7XG4gICAgICB9XG5cbiAgICAgIHBhdGNoLnNoYXMgPSBbXTtcblxuICAgICAgbWFpbnRlbmFuY2Uuc2F2ZSgpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEFkZHMgYSBuZWVkZWQgcGF0Y2ggdG8gYSBnaXZlbiBtb2RpZmllZCBicmFuY2guXG4gICAgICogQHB1YmxpY1xuICAgICAqXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHJlcG9cbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gYnJhbmNoXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHBhdGNoTmFtZVxuICAgICAqL1xuICAgIHN0YXRpYyBhc3luYyBhZGROZWVkZWRQYXRjaCggcmVwbywgYnJhbmNoLCBwYXRjaE5hbWUgKSB7XG4gICAgICBjb25zdCBtYWludGVuYW5jZSA9IE1haW50ZW5hbmNlLmxvYWQoKTtcbiAgICAgIGFzc2VydCggcmVwbyAhPT0gcGF0Y2hOYW1lLCAnQ2Fubm90IHBhdGNoIGEgcmVsZWFzZSBicmFuY2ggcmVwbywgeWV0LicgKTsgLy8gVE9ETzogcmVtb3ZlIGluIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9wZXJlbm5pYWwvaXNzdWVzLzMxMlxuXG4gICAgICBjb25zdCBwYXRjaCA9IG1haW50ZW5hbmNlLmZpbmRQYXRjaCggcGF0Y2hOYW1lICk7XG5cbiAgICAgIGNvbnN0IG1vZGlmaWVkQnJhbmNoID0gYXdhaXQgbWFpbnRlbmFuY2UuZW5zdXJlTW9kaWZpZWRCcmFuY2goIHJlcG8sIGJyYW5jaCApO1xuICAgICAgbW9kaWZpZWRCcmFuY2gubmVlZGVkUGF0Y2hlcy5wdXNoKCBwYXRjaCApO1xuXG4gICAgICBtYWludGVuYW5jZS5zYXZlKCk7XG5cbiAgICAgIGNvbnNvbGUubG9nKCBgQWRkZWQgcGF0Y2ggJHtwYXRjaE5hbWV9IGFzIG5lZWRlZCBmb3IgJHtyZXBvfSAke2JyYW5jaH1gICk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQWRkcyBhIG5lZWRlZCBwYXRjaCB0byBhIGdpdmVuIHJlbGVhc2UgYnJhbmNoXG4gICAgICogQHB1YmxpY1xuICAgICAqXG4gICAgICogQHBhcmFtIHtSZWxlYXNlQnJhbmNofSByZWxlYXNlQnJhbmNoXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHBhdGNoTmFtZVxuICAgICAqL1xuICAgIHN0YXRpYyBhc3luYyBhZGROZWVkZWRQYXRjaFJlbGVhc2VCcmFuY2goIHJlbGVhc2VCcmFuY2gsIHBhdGNoTmFtZSApIHtcbiAgICAgIGNvbnN0IG1haW50ZW5hbmNlID0gTWFpbnRlbmFuY2UubG9hZCgpO1xuXG4gICAgICBjb25zdCBwYXRjaCA9IG1haW50ZW5hbmNlLmZpbmRQYXRjaCggcGF0Y2hOYW1lICk7XG5cbiAgICAgIGNvbnN0IG1vZGlmaWVkQnJhbmNoID0gbmV3IE1vZGlmaWVkQnJhbmNoKCByZWxlYXNlQnJhbmNoICk7XG4gICAgICBtYWludGVuYW5jZS5tb2RpZmllZEJyYW5jaGVzLnB1c2goIG1vZGlmaWVkQnJhbmNoICk7XG4gICAgICBtb2RpZmllZEJyYW5jaC5uZWVkZWRQYXRjaGVzLnB1c2goIHBhdGNoICk7XG4gICAgICBtYWludGVuYW5jZS5zYXZlKCk7XG5cbiAgICAgIGNvbnNvbGUubG9nKCBgQWRkZWQgcGF0Y2ggJHtwYXRjaE5hbWV9IGFzIG5lZWRlZCBmb3IgJHtyZWxlYXNlQnJhbmNoLnJlcG99ICR7cmVsZWFzZUJyYW5jaC5icmFuY2h9YCApO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEFkZHMgYSBuZWVkZWQgcGF0Y2ggdG8gd2hhdGV2ZXIgc3Vic2V0IG9mIHJlbGVhc2UgYnJhbmNoZXMgbWF0Y2ggdGhlIGZpbHRlci5cbiAgICAgKiBAcHVibGljXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gcGF0Y2hOYW1lXG4gICAgICogQHBhcmFtIHtmdW5jdGlvbihSZWxlYXNlQnJhbmNoKTpQcm9taXNlLjxib29sZWFuPn0gZmlsdGVyXG4gICAgICovXG4gICAgc3RhdGljIGFzeW5jIGFkZE5lZWRlZFBhdGNoZXMoIHBhdGNoTmFtZSwgZmlsdGVyICkge1xuXG4gICAgICAvLyBnZXRNYWludGVuYW5jZUJyYW5jaGVzIG5lZWRzIHRvIGNhY2hlIGl0cyBicmFuY2hlcyBhbmQgbWFpbnRlbmFuY2Uuc2F2ZSgpIHRoZW0sIHNvIGRvIGl0IGJlZm9yZSBsb2FkaW5nXG4gICAgICAvLyBNYWludGVuYW5jZSBmb3IgdGhpcyBmdW5jdGlvbi5cbiAgICAgIGNvbnN0IHJlbGVhc2VCcmFuY2hlcyA9IGF3YWl0IE1haW50ZW5hbmNlLmdldE1haW50ZW5hbmNlQnJhbmNoZXMoKTtcbiAgICAgIGNvbnN0IG1haW50ZW5hbmNlID0gTWFpbnRlbmFuY2UubG9hZCgpO1xuXG4gICAgICBjb25zdCBwYXRjaCA9IG1haW50ZW5hbmNlLmZpbmRQYXRjaCggcGF0Y2hOYW1lICk7XG5cbiAgICAgIGxldCBjb3VudCA9IDA7XG5cbiAgICAgIGZvciAoIGNvbnN0IHJlbGVhc2VCcmFuY2ggb2YgcmVsZWFzZUJyYW5jaGVzICkge1xuICAgICAgICBjb25zdCBuZWVkc1BhdGNoID0gYXdhaXQgZmlsdGVyKCByZWxlYXNlQnJhbmNoICk7XG5cbiAgICAgICAgaWYgKCAhbmVlZHNQYXRjaCApIHtcbiAgICAgICAgICBjb25zb2xlLmxvZyggYCAgc2tpcHBpbmcgJHtyZWxlYXNlQnJhbmNoLnJlcG99ICR7cmVsZWFzZUJyYW5jaC5icmFuY2h9YCApO1xuICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgbW9kaWZpZWRCcmFuY2ggPSBhd2FpdCBtYWludGVuYW5jZS5lbnN1cmVNb2RpZmllZEJyYW5jaCggcmVsZWFzZUJyYW5jaC5yZXBvLCByZWxlYXNlQnJhbmNoLmJyYW5jaCwgZmFsc2UsIHJlbGVhc2VCcmFuY2hlcyApO1xuICAgICAgICBpZiAoICFtb2RpZmllZEJyYW5jaC5uZWVkZWRQYXRjaGVzLmluY2x1ZGVzKCBwYXRjaCApICkge1xuICAgICAgICAgIG1vZGlmaWVkQnJhbmNoLm5lZWRlZFBhdGNoZXMucHVzaCggcGF0Y2ggKTtcbiAgICAgICAgICBjb25zb2xlLmxvZyggYEFkZGVkIG5lZWRlZCBwYXRjaCAke3BhdGNoTmFtZX0gdG8gJHtyZWxlYXNlQnJhbmNoLnJlcG99ICR7cmVsZWFzZUJyYW5jaC5icmFuY2h9YCApO1xuICAgICAgICAgIGNvdW50Kys7XG4gICAgICAgICAgbWFpbnRlbmFuY2Uuc2F2ZSgpOyAvLyBzYXZlIGhlcmUgaW4gY2FzZSBhIGZ1dHVyZSBmYWlsdXJlIHdvdWxkIFwicmV2ZXJ0XCIgdGhpbmdzXG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgY29uc29sZS5sb2coIGBQYXRjaCAke3BhdGNoTmFtZX0gYWxyZWFkeSBpbmNsdWRlZCBpbiAke3JlbGVhc2VCcmFuY2gucmVwb30gJHtyZWxlYXNlQnJhbmNoLmJyYW5jaH1gICk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgY29uc29sZS5sb2coIGBBZGRlZCAke2NvdW50fSByZWxlYXNlQnJhbmNoZXMgdG8gcGF0Y2g6ICR7cGF0Y2hOYW1lfWAgKTtcblxuICAgICAgbWFpbnRlbmFuY2Uuc2F2ZSgpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEFkZHMgYSBuZWVkZWQgcGF0Y2ggdG8gYWxsIHJlbGVhc2UgYnJhbmNoZXMuXG4gICAgICogQHB1YmxpY1xuICAgICAqXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHBhdGNoTmFtZVxuICAgICAqL1xuICAgIHN0YXRpYyBhc3luYyBhZGRBbGxOZWVkZWRQYXRjaGVzKCBwYXRjaE5hbWUgKSB7XG4gICAgICBhd2FpdCBNYWludGVuYW5jZS5hZGROZWVkZWRQYXRjaGVzKCBwYXRjaE5hbWUsIGFzeW5jICgpID0+IHRydWUgKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBBZGRzIGEgbmVlZGVkIHBhdGNoIHRvIGFsbCByZWxlYXNlIGJyYW5jaGVzIHRoYXQgZG8gTk9UIGluY2x1ZGUgdGhlIGdpdmVuIGNvbW1pdCBvbiB0aGUgcmVwb1xuICAgICAqIEBwdWJsaWNcbiAgICAgKlxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBwYXRjaE5hbWVcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gc2hhXG4gICAgICovXG4gICAgc3RhdGljIGFzeW5jIGFkZE5lZWRlZFBhdGNoZXNCZWZvcmUoIHBhdGNoTmFtZSwgc2hhICkge1xuICAgICAgY29uc3QgbWFpbnRlbmFuY2UgPSBNYWludGVuYW5jZS5sb2FkKCk7XG4gICAgICBjb25zdCBwYXRjaCA9IG1haW50ZW5hbmNlLmZpbmRQYXRjaCggcGF0Y2hOYW1lICk7XG5cbiAgICAgIGF3YWl0IE1haW50ZW5hbmNlLmFkZE5lZWRlZFBhdGNoZXMoIHBhdGNoTmFtZSwgYXN5bmMgcmVsZWFzZUJyYW5jaCA9PiB7XG4gICAgICAgIHJldHVybiByZWxlYXNlQnJhbmNoLmlzTWlzc2luZ1NIQSggcGF0Y2gucmVwbywgc2hhICk7XG4gICAgICB9ICk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQWRkcyBhIG5lZWRlZCBwYXRjaCB0byBhbGwgcmVsZWFzZSBicmFuY2hlcyB0aGF0IERPIGluY2x1ZGUgdGhlIGdpdmVuIGNvbW1pdCBvbiB0aGUgcmVwb1xuICAgICAqIEBwdWJsaWNcbiAgICAgKlxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBwYXRjaE5hbWVcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gc2hhXG4gICAgICovXG4gICAgc3RhdGljIGFzeW5jIGFkZE5lZWRlZFBhdGNoZXNBZnRlciggcGF0Y2hOYW1lLCBzaGEgKSB7XG4gICAgICBjb25zdCBtYWludGVuYW5jZSA9IE1haW50ZW5hbmNlLmxvYWQoKTtcbiAgICAgIGNvbnN0IHBhdGNoID0gbWFpbnRlbmFuY2UuZmluZFBhdGNoKCBwYXRjaE5hbWUgKTtcblxuICAgICAgYXdhaXQgTWFpbnRlbmFuY2UuYWRkTmVlZGVkUGF0Y2hlcyggcGF0Y2hOYW1lLCBhc3luYyByZWxlYXNlQnJhbmNoID0+IHtcbiAgICAgICAgcmV0dXJuIHJlbGVhc2VCcmFuY2guaW5jbHVkZXNTSEEoIHBhdGNoLnJlcG8sIHNoYSApO1xuICAgICAgfSApO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEFkZHMgYSBuZWVkZWQgcGF0Y2ggdG8gYWxsIHJlbGVhc2UgYnJhbmNoZXMgdGhhdCBzYXRpc2Z5IHRoZSBnaXZlbiBmaWx0ZXIoIHJlbGVhc2VCcmFuY2gsIGJ1aWx0RmlsZVN0cmluZyApXG4gICAgICogd2hlcmUgaXQgYnVpbGRzIHRoZSBzaW11bGF0aW9uIHdpdGggdGhlIGRlZmF1bHRzIChicmFuZD1waGV0KSBhbmQgcHJvdmlkZXMgaXQgYXMgYSBzdHJpbmcuXG4gICAgICogQHB1YmxpY1xuICAgICAqXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHBhdGNoTmFtZVxuICAgICAqIEBwYXJhbSB7ZnVuY3Rpb24oUmVsZWFzZUJyYW5jaCwgYnVpbHRGaWxlOnN0cmluZyk6IFByb21pc2UuPGJvb2xlYW4+fSBmaWx0ZXJcbiAgICAgKi9cbiAgICBzdGF0aWMgYXN5bmMgYWRkTmVlZGVkUGF0Y2hlc0J1aWxkRmlsdGVyKCBwYXRjaE5hbWUsIGZpbHRlciApIHtcbiAgICAgIGF3YWl0IE1haW50ZW5hbmNlLmFkZE5lZWRlZFBhdGNoZXMoIHBhdGNoTmFtZSwgYXN5bmMgcmVsZWFzZUJyYW5jaCA9PiB7XG4gICAgICAgIGF3YWl0IGNoZWNrb3V0VGFyZ2V0KCByZWxlYXNlQnJhbmNoLnJlcG8sIHJlbGVhc2VCcmFuY2guYnJhbmNoLCB0cnVlICk7XG4gICAgICAgIGF3YWl0IGdpdFB1bGwoIHJlbGVhc2VCcmFuY2gucmVwbyApO1xuICAgICAgICBhd2FpdCBidWlsZCggcmVsZWFzZUJyYW5jaC5yZXBvICk7XG4gICAgICAgIGNvbnN0IGNoaXBwZXJWZXJzaW9uID0gQ2hpcHBlclZlcnNpb24uZ2V0RnJvbVJlcG9zaXRvcnkoKTtcbiAgICAgICAgbGV0IGZpbGVuYW1lO1xuICAgICAgICBpZiAoIGNoaXBwZXJWZXJzaW9uLm1ham9yICE9PSAwICkge1xuICAgICAgICAgIGZpbGVuYW1lID0gYC4uLyR7cmVsZWFzZUJyYW5jaC5yZXBvfS9idWlsZC9waGV0LyR7cmVsZWFzZUJyYW5jaC5yZXBvfV9lbl9waGV0Lmh0bWxgO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgIGZpbGVuYW1lID0gYC4uLyR7cmVsZWFzZUJyYW5jaC5yZXBvfS9idWlsZC8ke3JlbGVhc2VCcmFuY2gucmVwb31fZW4uaHRtbGA7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGZpbHRlciggcmVsZWFzZUJyYW5jaCwgZnMucmVhZEZpbGVTeW5jKCBmaWxlbmFtZSwgJ3V0ZjgnICkgKTtcbiAgICAgIH0gKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZW1vdmVzIGEgbmVlZGVkIHBhdGNoIGZyb20gYSBnaXZlbiBtb2RpZmllZCBicmFuY2guXG4gICAgICogQHB1YmxpY1xuICAgICAqXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHJlcG9cbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gYnJhbmNoXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHBhdGNoTmFtZVxuICAgICAqL1xuICAgIHN0YXRpYyBhc3luYyByZW1vdmVOZWVkZWRQYXRjaCggcmVwbywgYnJhbmNoLCBwYXRjaE5hbWUgKSB7XG4gICAgICBjb25zdCBtYWludGVuYW5jZSA9IE1haW50ZW5hbmNlLmxvYWQoKTtcblxuICAgICAgY29uc3QgcGF0Y2ggPSBtYWludGVuYW5jZS5maW5kUGF0Y2goIHBhdGNoTmFtZSApO1xuXG4gICAgICBjb25zdCBtb2RpZmllZEJyYW5jaCA9IGF3YWl0IG1haW50ZW5hbmNlLmVuc3VyZU1vZGlmaWVkQnJhbmNoKCByZXBvLCBicmFuY2ggKTtcbiAgICAgIGNvbnN0IGluZGV4ID0gbW9kaWZpZWRCcmFuY2gubmVlZGVkUGF0Y2hlcy5pbmRleE9mKCBwYXRjaCApO1xuICAgICAgYXNzZXJ0KCBpbmRleCA+PSAwLCAnQ291bGQgbm90IGZpbmQgbmVlZGVkIHBhdGNoIG9uIHRoZSBtb2RpZmllZCBicmFuY2gnICk7XG5cbiAgICAgIG1vZGlmaWVkQnJhbmNoLm5lZWRlZFBhdGNoZXMuc3BsaWNlKCBpbmRleCwgMSApO1xuICAgICAgbWFpbnRlbmFuY2UudHJ5UmVtb3ZpbmdNb2RpZmllZEJyYW5jaCggbW9kaWZpZWRCcmFuY2ggKTtcblxuICAgICAgbWFpbnRlbmFuY2Uuc2F2ZSgpO1xuXG4gICAgICBjb25zb2xlLmxvZyggYFJlbW92ZWQgcGF0Y2ggJHtwYXRjaE5hbWV9IGZyb20gJHtyZXBvfSAke2JyYW5jaH1gICk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmVtb3ZlcyBhIG5lZWRlZCBwYXRjaCBmcm9tIHdoYXRldmVyIHN1YnNldCBvZiAoY3VycmVudCkgcmVsZWFzZSBicmFuY2hlcyBtYXRjaCB0aGUgZmlsdGVyLlxuICAgICAqIEBwdWJsaWNcbiAgICAgKlxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBwYXRjaE5hbWVcbiAgICAgKiBAcGFyYW0ge2Z1bmN0aW9uKFJlbGVhc2VCcmFuY2gpOiBQcm9taXNlLjxib29sZWFuPn0gZmlsdGVyXG4gICAgICovXG4gICAgc3RhdGljIGFzeW5jIHJlbW92ZU5lZWRlZFBhdGNoZXMoIHBhdGNoTmFtZSwgZmlsdGVyICkge1xuICAgICAgY29uc3QgbWFpbnRlbmFuY2UgPSBNYWludGVuYW5jZS5sb2FkKCk7XG5cbiAgICAgIGNvbnN0IHBhdGNoID0gbWFpbnRlbmFuY2UuZmluZFBhdGNoKCBwYXRjaE5hbWUgKTtcblxuICAgICAgbGV0IGNvdW50ID0gMDtcblxuICAgICAgZm9yICggY29uc3QgbW9kaWZpZWRCcmFuY2ggb2YgbWFpbnRlbmFuY2UubW9kaWZpZWRCcmFuY2hlcyApIHtcbiAgICAgICAgY29uc3QgbmVlZHNSZW1vdmFsID0gYXdhaXQgZmlsdGVyKCBtb2RpZmllZEJyYW5jaC5yZWxlYXNlQnJhbmNoICk7XG5cbiAgICAgICAgaWYgKCAhbmVlZHNSZW1vdmFsICkge1xuICAgICAgICAgIGNvbnNvbGUubG9nKCBgICBza2lwcGluZyAke21vZGlmaWVkQnJhbmNoLnJlcG99ICR7bW9kaWZpZWRCcmFuY2guYnJhbmNofWAgKTtcbiAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIENoZWNrIGlmIHRoZXJlJ3MgYWN0dWFsbHkgc29tZXRoaW5nIHRvIHJlbW92ZVxuICAgICAgICBjb25zdCBpbmRleCA9IG1vZGlmaWVkQnJhbmNoLm5lZWRlZFBhdGNoZXMuaW5kZXhPZiggcGF0Y2ggKTtcbiAgICAgICAgaWYgKCBpbmRleCA8IDAgKSB7XG4gICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cblxuICAgICAgICBtb2RpZmllZEJyYW5jaC5uZWVkZWRQYXRjaGVzLnNwbGljZSggaW5kZXgsIDEgKTtcbiAgICAgICAgbWFpbnRlbmFuY2UudHJ5UmVtb3ZpbmdNb2RpZmllZEJyYW5jaCggbW9kaWZpZWRCcmFuY2ggKTtcbiAgICAgICAgY291bnQrKztcbiAgICAgICAgY29uc29sZS5sb2coIGBSZW1vdmVkIG5lZWRlZCBwYXRjaCAke3BhdGNoTmFtZX0gZnJvbSAke21vZGlmaWVkQnJhbmNoLnJlcG99ICR7bW9kaWZpZWRCcmFuY2guYnJhbmNofWAgKTtcbiAgICAgIH1cbiAgICAgIGNvbnNvbGUubG9nKCBgUmVtb3ZlZCAke2NvdW50fSByZWxlYXNlQnJhbmNoZXMgZnJvbSBwYXRjaDogJHtwYXRjaE5hbWV9YCApO1xuXG4gICAgICBtYWludGVuYW5jZS5zYXZlKCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmVtb3ZlcyBhIG5lZWRlZCBwYXRjaCBmcm9tIGFsbCByZWxlYXNlIGJyYW5jaGVzIHRoYXQgZG8gTk9UIGluY2x1ZGUgdGhlIGdpdmVuIGNvbW1pdCBvbiB0aGUgcmVwb1xuICAgICAqIEBwdWJsaWNcbiAgICAgKlxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBwYXRjaE5hbWVcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gc2hhXG4gICAgICovXG4gICAgc3RhdGljIGFzeW5jIHJlbW92ZU5lZWRlZFBhdGNoZXNCZWZvcmUoIHBhdGNoTmFtZSwgc2hhICkge1xuICAgICAgY29uc3QgbWFpbnRlbmFuY2UgPSBNYWludGVuYW5jZS5sb2FkKCk7XG4gICAgICBjb25zdCBwYXRjaCA9IG1haW50ZW5hbmNlLmZpbmRQYXRjaCggcGF0Y2hOYW1lICk7XG5cbiAgICAgIGF3YWl0IE1haW50ZW5hbmNlLnJlbW92ZU5lZWRlZFBhdGNoZXMoIHBhdGNoTmFtZSwgYXN5bmMgcmVsZWFzZUJyYW5jaCA9PiB7XG4gICAgICAgIHJldHVybiByZWxlYXNlQnJhbmNoLmlzTWlzc2luZ1NIQSggcGF0Y2gucmVwbywgc2hhICk7XG4gICAgICB9ICk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmVtb3ZlcyBhIG5lZWRlZCBwYXRjaCBmcm9tIGFsbCByZWxlYXNlIGJyYW5jaGVzIHRoYXQgRE8gaW5jbHVkZSB0aGUgZ2l2ZW4gY29tbWl0IG9uIHRoZSByZXBvXG4gICAgICogQHB1YmxpY1xuICAgICAqXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHBhdGNoTmFtZVxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBzaGFcbiAgICAgKi9cbiAgICBzdGF0aWMgYXN5bmMgcmVtb3ZlTmVlZGVkUGF0Y2hlc0FmdGVyKCBwYXRjaE5hbWUsIHNoYSApIHtcbiAgICAgIGNvbnN0IG1haW50ZW5hbmNlID0gTWFpbnRlbmFuY2UubG9hZCgpO1xuICAgICAgY29uc3QgcGF0Y2ggPSBtYWludGVuYW5jZS5maW5kUGF0Y2goIHBhdGNoTmFtZSApO1xuXG4gICAgICBhd2FpdCBNYWludGVuYW5jZS5yZW1vdmVOZWVkZWRQYXRjaGVzKCBwYXRjaE5hbWUsIGFzeW5jIHJlbGVhc2VCcmFuY2ggPT4ge1xuICAgICAgICByZXR1cm4gcmVsZWFzZUJyYW5jaC5pbmNsdWRlc1NIQSggcGF0Y2gucmVwbywgc2hhICk7XG4gICAgICB9ICk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogSGVscGVyIGZvciBhZGRpbmcgcGF0Y2hlcyBiYXNlZCBvbiBzcGVjaWZpYyBwYXR0ZXJucywgZS5nLjpcbiAgICAgKiBNYWludGVuYW5jZS5hZGROZWVkZWRQYXRjaGVzKCAncGhldG1hcmtzJywgTWFpbnRlbmFuY2Uuc2luZ2xlRmlsZVJlbGVhc2VCcmFuY2hGaWx0ZXIoICcuLi9waGV0bWFya3MvanMvcGhldG1hcmtzLnRzJyApLCBjb250ZW50ID0+IGNvbnRlbnQuaW5jbHVkZXMoICdkYXRhL3dyYXBwZXJzJyApICk7XG4gICAgICogQHB1YmxpY1xuICAgICAqXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGZpbGVcbiAgICAgKiBAcGFyYW0ge2Z1bmN0aW9uKHN0cmluZyk6Ym9vbGVhbn1cbiAgICAgKiBAcmV0dXJucyB7ZnVuY3Rpb259XG4gICAgICovXG4gICAgc3RhdGljIHNpbmdsZUZpbGVSZWxlYXNlQnJhbmNoRmlsdGVyKCBmaWxlLCBwcmVkaWNhdGUgKSB7XG4gICAgICByZXR1cm4gYXN5bmMgcmVsZWFzZUJyYW5jaCA9PiB7XG4gICAgICAgIGF3YWl0IHJlbGVhc2VCcmFuY2guY2hlY2tvdXQoIGZhbHNlICk7XG5cbiAgICAgICAgaWYgKCBmcy5leGlzdHNTeW5jKCBmaWxlICkgKSB7XG4gICAgICAgICAgY29uc3QgY29udGVudHMgPSBmcy5yZWFkRmlsZVN5bmMoIGZpbGUsICd1dGYtOCcgKTtcbiAgICAgICAgICByZXR1cm4gcHJlZGljYXRlKCBjb250ZW50cyApO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDaGVja3Mgb3V0IGEgc3BlY2lmaWMgUmVsZWFzZSBCcmFuY2ggKHVzaW5nIGxvY2FsIGNvbW1pdCBkYXRhIGFzIG5lY2Vzc2FyeSkuXG4gICAgICogQHB1YmxpY1xuICAgICAqXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHJlcG9cbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gYnJhbmNoXG4gICAgICogQHBhcmFtIHtib29sZWFufSBvdXRwdXRKUz1mYWxzZSAtIGlmIHRydWUsIG9uY2UgY2hlY2tlZCBvdXQgdGhpcyB3aWxsIGFsc28gcnVuIGBncnVudCBvdXRwdXQtanMtcHJvamVjdGBcbiAgICAgKi9cbiAgICBzdGF0aWMgYXN5bmMgY2hlY2tvdXRCcmFuY2goIHJlcG8sIGJyYW5jaCwgb3V0cHV0SlMgPSBmYWxzZSApIHtcbiAgICAgIGNvbnN0IG1haW50ZW5hbmNlID0gTWFpbnRlbmFuY2UubG9hZCgpO1xuXG4gICAgICBjb25zdCBtb2RpZmllZEJyYW5jaCA9IGF3YWl0IG1haW50ZW5hbmNlLmVuc3VyZU1vZGlmaWVkQnJhbmNoKCByZXBvLCBicmFuY2gsIHRydWUgKTtcbiAgICAgIGF3YWl0IG1vZGlmaWVkQnJhbmNoLmNoZWNrb3V0KCk7XG5cbiAgICAgIGlmICggb3V0cHV0SlMgJiYgY2hpcHBlclN1cHBvcnRzT3V0cHV0SlNHcnVudFRhc2tzKCkgKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCAnUnVubmluZyBvdXRwdXQtanMtcHJvamVjdCcgKTtcblxuICAgICAgICAvLyBXZSBtaWdodCBub3QgYmUgYWJsZSB0byBydW4gdGhpcyBjb21tYW5kIVxuICAgICAgICBhd2FpdCBleGVjdXRlKCBncnVudENvbW1hbmQsIFsgJ291dHB1dC1qcy1wcm9qZWN0JywgJy0tc2lsZW50JyBdLCBgLi4vJHtyZXBvfWAsIHtcbiAgICAgICAgICBlcnJvcnM6ICdyZXNvbHZlJ1xuICAgICAgICB9ICk7XG4gICAgICB9XG5cbiAgICAgIC8vIE5vIG5lZWQgdG8gc2F2ZSwgc2hvdWxkbid0IGJlIGNoYW5naW5nIHRoaW5nc1xuICAgICAgY29uc29sZS5sb2coIGBDaGVja2VkIG91dCAke3JlcG99ICR7YnJhbmNofWAgKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBBdHRlbXB0cyB0byBhcHBseSBwYXRjaGVzIHRvIHRoZSBtb2RpZmllZCBicmFuY2hlcyB0aGF0IGFyZSBtYXJrZWQgYXMgbmVlZGVkLlxuICAgICAqIEBwdWJsaWNcbiAgICAgKi9cbiAgICBzdGF0aWMgYXN5bmMgYXBwbHlQYXRjaGVzKCkge1xuICAgICAgd2luc3Rvbi5pbmZvKCAnYXBwbHlpbmcgcGF0Y2hlcycgKTtcblxuICAgICAgbGV0IHN1Y2Nlc3MgPSB0cnVlO1xuICAgICAgY29uc3QgbWFpbnRlbmFuY2UgPSBNYWludGVuYW5jZS5sb2FkKCk7XG4gICAgICBsZXQgbnVtQXBwbGllZCA9IDA7XG5cbiAgICAgIGZvciAoIGNvbnN0IG1vZGlmaWVkQnJhbmNoIG9mIG1haW50ZW5hbmNlLm1vZGlmaWVkQnJhbmNoZXMgKSB7XG4gICAgICAgIGlmICggbW9kaWZpZWRCcmFuY2gubmVlZGVkUGF0Y2hlcy5sZW5ndGggPT09IDAgKSB7XG4gICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCByZXBvID0gbW9kaWZpZWRCcmFuY2gucmVwbztcbiAgICAgICAgY29uc3QgYnJhbmNoID0gbW9kaWZpZWRCcmFuY2guYnJhbmNoO1xuXG4gICAgICAgIC8vIERlZmVuc2l2ZSBjb3B5LCBzaW5jZSB3ZSBtb2RpZnkgaXQgZHVyaW5nIGl0ZXJhdGlvblxuICAgICAgICBmb3IgKCBjb25zdCBwYXRjaCBvZiBtb2RpZmllZEJyYW5jaC5uZWVkZWRQYXRjaGVzLnNsaWNlKCkgKSB7XG4gICAgICAgICAgaWYgKCBwYXRjaC5zaGFzLmxlbmd0aCA9PT0gMCApIHtcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGNvbnN0IHBhdGNoUmVwbyA9IHBhdGNoLnJlcG87XG5cbiAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgbGV0IHBhdGNoUmVwb0N1cnJlbnRTSEE7XG5cbiAgICAgICAgICAgIC8vIENoZWNrb3V0IHdoYXRldmVyIHRoZSBsYXRlc3QgcGF0Y2hlZCBTSEEgaXMgKGlmIHdlJ3ZlIHBhdGNoZWQgaXQpXG4gICAgICAgICAgICBpZiAoIG1vZGlmaWVkQnJhbmNoLmNoYW5nZWREZXBlbmRlbmNpZXNbIHBhdGNoUmVwbyBdICkge1xuICAgICAgICAgICAgICBwYXRjaFJlcG9DdXJyZW50U0hBID0gbW9kaWZpZWRCcmFuY2guY2hhbmdlZERlcGVuZGVuY2llc1sgcGF0Y2hSZXBvIF07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgLy8gTG9vayB1cCB0aGUgU0hBIHRvIGNoZWNrIG91dCBhdCB0aGUgdGlwIG9mIHRoZSByZWxlYXNlIGJyYW5jaCBkZXBlbmRlbmNpZXMuanNvblxuICAgICAgICAgICAgICBhd2FpdCBnaXRDaGVja291dCggcmVwbywgYnJhbmNoICk7XG4gICAgICAgICAgICAgIGF3YWl0IGdpdFB1bGwoIHJlcG8gKTtcbiAgICAgICAgICAgICAgY29uc3QgZGVwZW5kZW5jaWVzID0gYXdhaXQgZ2V0RGVwZW5kZW5jaWVzKCByZXBvICk7XG4gICAgICAgICAgICAgIHBhdGNoUmVwb0N1cnJlbnRTSEEgPSBkZXBlbmRlbmNpZXNbIHBhdGNoUmVwbyBdLnNoYTtcbiAgICAgICAgICAgICAgYXdhaXQgZ2l0Q2hlY2tvdXQoIHJlcG8sICdtYWluJyApOyAvLyBUT0RPOiB0aGlzIGFzc3VtZXMgd2Ugd2VyZSBvbiBtYWluIHdoZW4gd2Ugc3RhcnRlZCBydW5uaW5nIHRoaXMuIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9wZXJlbm5pYWwvaXNzdWVzLzM2OFxuICAgICAgICAgICAgICAvLyBUT0RPOiBzZWUgaWYgdGhlIHBhdGNoUmVwbyBoYXMgYSBicmFuY2ggZm9yIHRoaXMgcmVsZWFzZSBicmFuY2gsIGFuZCBpZiBzbywgcHVsbCBpdCB0byBtYWtlIHN1cmUgd2UgaGF2ZSB0aGUgYWJvdmUgU0hBIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9wZXJlbm5pYWwvaXNzdWVzLzM2OFxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBUaGVuIGNoZWNrIGl0IG91dFxuICAgICAgICAgICAgYXdhaXQgZ2l0Q2hlY2tvdXQoIHBhdGNoUmVwbywgcGF0Y2hSZXBvQ3VycmVudFNIQSApO1xuICAgICAgICAgICAgY29uc29sZS5sb2coIGBDaGVja2VkIG91dCAke3BhdGNoUmVwb30gZm9yICR7cmVwb30gJHticmFuY2h9LCBTSEE6ICR7cGF0Y2hSZXBvQ3VycmVudFNIQX1gICk7XG5cbiAgICAgICAgICAgIGZvciAoIGNvbnN0IHNoYSBvZiBwYXRjaC5zaGFzICkge1xuXG4gICAgICAgICAgICAgIC8vIElmIHRoZSBzaGEgZG9lc24ndCBleGlzdCBpbiB0aGUgcmVwbywgdGhlbiBnaXZlIGEgc3BlY2lmaWMgZXJyb3IgZm9yIHRoYXQuXG4gICAgICAgICAgICAgIGNvbnN0IGhhc1NoYSA9ICggYXdhaXQgZXhlY3V0ZSggJ2dpdCcsIFsgJ2NhdC1maWxlJywgJy1lJywgc2hhIF0sIGAuLi8ke3BhdGNoUmVwb31gLCB7IGVycm9yczogJ3Jlc29sdmUnIH0gKSApLmNvZGUgPT09IDA7XG4gICAgICAgICAgICAgIGlmICggIWhhc1NoYSApIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoIGBTSEEgbm90IGZvdW5kIGluICR7cGF0Y2hSZXBvfTogJHtzaGF9YCApO1xuICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgY29uc3QgY2hlcnJ5UGlja1N1Y2Nlc3MgPSBhd2FpdCBnaXRDaGVycnlQaWNrKCBwYXRjaFJlcG8sIHNoYSApO1xuXG4gICAgICAgICAgICAgIGlmICggY2hlcnJ5UGlja1N1Y2Nlc3MgKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgY3VycmVudFNIQSA9IGF3YWl0IGdpdFJldlBhcnNlKCBwYXRjaFJlcG8sICdIRUFEJyApO1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCBgQ2hlcnJ5LXBpY2sgc3VjY2VzcyBmb3IgJHtzaGF9LCByZXN1bHQgaXMgJHtjdXJyZW50U0hBfWAgKTtcblxuICAgICAgICAgICAgICAgIG1vZGlmaWVkQnJhbmNoLmNoYW5nZWREZXBlbmRlbmNpZXNbIHBhdGNoUmVwbyBdID0gY3VycmVudFNIQTtcbiAgICAgICAgICAgICAgICBtb2RpZmllZEJyYW5jaC5uZWVkZWRQYXRjaGVzLnNwbGljZSggbW9kaWZpZWRCcmFuY2gubmVlZGVkUGF0Y2hlcy5pbmRleE9mKCBwYXRjaCApLCAxICk7XG4gICAgICAgICAgICAgICAgbnVtQXBwbGllZCsrO1xuXG4gICAgICAgICAgICAgICAgLy8gRG9uJ3QgaW5jbHVkZSBkdXBsaWNhdGUgbWVzc2FnZXMsIHNpbmNlIG11bHRpcGxlIHBhdGNoZXMgbWlnaHQgYmUgZm9yIGEgc2luZ2xlIGlzc3VlXG4gICAgICAgICAgICAgICAgaWYgKCAhbW9kaWZpZWRCcmFuY2gucGVuZGluZ01lc3NhZ2VzLmluY2x1ZGVzKCBwYXRjaC5tZXNzYWdlICkgKSB7XG4gICAgICAgICAgICAgICAgICBtb2RpZmllZEJyYW5jaC5wZW5kaW5nTWVzc2FnZXMucHVzaCggcGF0Y2gubWVzc2FnZSApO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHN1Y2Nlc3MgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyggYENvdWxkIG5vdCBjaGVycnktcGljayAke3NoYX1gICk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgY2F0Y2goIGUgKSB7XG4gICAgICAgICAgICBtYWludGVuYW5jZS5zYXZlKCk7XG5cbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvciggYEZhaWx1cmUgYXBwbHlpbmcgcGF0Y2ggJHtwYXRjaFJlcG99IHRvICR7cmVwb30gJHticmFuY2h9OiAke2V9YCApO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGF3YWl0IGdpdENoZWNrb3V0KCBtb2RpZmllZEJyYW5jaC5yZXBvLCAnbWFpbicgKTtcbiAgICAgIH1cblxuICAgICAgbWFpbnRlbmFuY2Uuc2F2ZSgpO1xuXG4gICAgICBjb25zb2xlLmxvZyggYCR7bnVtQXBwbGllZH0gcGF0Y2hlcyBhcHBsaWVkYCApO1xuXG4gICAgICByZXR1cm4gc3VjY2VzcztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBQdXNoZXMgbG9jYWwgY2hhbmdlcyB1cCB0byBHaXRIdWIuXG4gICAgICogQHB1YmxpY1xuICAgICAqXG4gICAgICogQHBhcmFtIHtmdW5jdGlvbihNb2RpZmllZEJyYW5jaCk6UHJvbWlzZS48Ym9vbGVhbj59IFtmaWx0ZXJdIC0gT3B0aW9uYWwgZmlsdGVyLCBtb2RpZmllZCBicmFuY2hlcyB3aWxsIGJlIHNraXBwZWRcbiAgICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiB0aGlzIHJlc29sdmVzIHRvIGZhbHNlXG4gICAgICovXG4gICAgc3RhdGljIGFzeW5jIHVwZGF0ZURlcGVuZGVuY2llcyggZmlsdGVyICkge1xuICAgICAgd2luc3Rvbi5pbmZvKCAndXBkYXRlIGRlcGVuZGVuY2llcycgKTtcblxuICAgICAgY29uc3QgbWFpbnRlbmFuY2UgPSBNYWludGVuYW5jZS5sb2FkKCk7XG5cbiAgICAgIGZvciAoIGNvbnN0IG1vZGlmaWVkQnJhbmNoIG9mIG1haW50ZW5hbmNlLm1vZGlmaWVkQnJhbmNoZXMgKSB7XG4gICAgICAgIGNvbnN0IGNoYW5nZWRSZXBvcyA9IE9iamVjdC5rZXlzKCBtb2RpZmllZEJyYW5jaC5jaGFuZ2VkRGVwZW5kZW5jaWVzICk7XG4gICAgICAgIGlmICggY2hhbmdlZFJlcG9zLmxlbmd0aCA9PT0gMCApIHtcbiAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICggZmlsdGVyICYmICEoIGF3YWl0IGZpbHRlciggbW9kaWZpZWRCcmFuY2ggKSApICkge1xuICAgICAgICAgIGNvbnNvbGUubG9nKCBgU2tpcHBpbmcgZGVwZW5kZW5jeSB1cGRhdGUgZm9yICR7bW9kaWZpZWRCcmFuY2gucmVwb30gJHttb2RpZmllZEJyYW5jaC5icmFuY2h9YCApO1xuICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAvLyBObyBOUE0gbmVlZGVkXG4gICAgICAgICAgYXdhaXQgY2hlY2tvdXRUYXJnZXQoIG1vZGlmaWVkQnJhbmNoLnJlcG8sIG1vZGlmaWVkQnJhbmNoLmJyYW5jaCwgZmFsc2UgKTtcbiAgICAgICAgICBjb25zb2xlLmxvZyggYENoZWNrZWQgb3V0ICR7bW9kaWZpZWRCcmFuY2gucmVwb30gJHttb2RpZmllZEJyYW5jaC5icmFuY2h9YCApO1xuXG4gICAgICAgICAgY29uc3QgZGVwZW5kZW5jaWVzSlNPTkZpbGUgPSBgLi4vJHttb2RpZmllZEJyYW5jaC5yZXBvfS9kZXBlbmRlbmNpZXMuanNvbmA7XG4gICAgICAgICAgY29uc3QgZGVwZW5kZW5jaWVzSlNPTiA9IEpTT04ucGFyc2UoIGZzLnJlYWRGaWxlU3luYyggZGVwZW5kZW5jaWVzSlNPTkZpbGUsICd1dGYtOCcgKSApO1xuXG4gICAgICAgICAgLy8gTW9kaWZ5IHRoZSBcInNlbGZcIiBpbiB0aGUgZGVwZW5kZW5jaWVzLmpzb24gYXMgZXhwZWN0ZWRcbiAgICAgICAgICBkZXBlbmRlbmNpZXNKU09OWyBtb2RpZmllZEJyYW5jaC5yZXBvIF0uc2hhID0gYXdhaXQgZ2l0UmV2UGFyc2UoIG1vZGlmaWVkQnJhbmNoLnJlcG8sIG1vZGlmaWVkQnJhbmNoLmJyYW5jaCApO1xuXG4gICAgICAgICAgZm9yICggY29uc3QgZGVwZW5kZW5jeSBvZiBjaGFuZ2VkUmVwb3MgKSB7XG4gICAgICAgICAgICBjb25zdCBkZXBlbmRlbmN5QnJhbmNoID0gbW9kaWZpZWRCcmFuY2guZGVwZW5kZW5jeUJyYW5jaDtcbiAgICAgICAgICAgIGNvbnN0IGJyYW5jaGVzID0gYXdhaXQgZ2V0QnJhbmNoZXMoIGRlcGVuZGVuY3kgKTtcbiAgICAgICAgICAgIGNvbnN0IHNoYSA9IG1vZGlmaWVkQnJhbmNoLmNoYW5nZWREZXBlbmRlbmNpZXNbIGRlcGVuZGVuY3kgXTtcblxuICAgICAgICAgICAgZGVwZW5kZW5jaWVzSlNPTlsgZGVwZW5kZW5jeSBdLnNoYSA9IHNoYTtcblxuICAgICAgICAgICAgaWYgKCBicmFuY2hlcy5pbmNsdWRlcyggZGVwZW5kZW5jeUJyYW5jaCApICkge1xuICAgICAgICAgICAgICBjb25zb2xlLmxvZyggYEJyYW5jaCAke2RlcGVuZGVuY3lCcmFuY2h9IGFscmVhZHkgZXhpc3RzIGluICR7ZGVwZW5kZW5jeX1gICk7XG4gICAgICAgICAgICAgIGF3YWl0IGdpdENoZWNrb3V0KCBkZXBlbmRlbmN5LCBkZXBlbmRlbmN5QnJhbmNoICk7XG4gICAgICAgICAgICAgIGF3YWl0IGdpdFB1bGwoIGRlcGVuZGVuY3kgKTtcbiAgICAgICAgICAgICAgY29uc3QgY3VycmVudFNIQSA9IGF3YWl0IGdpdFJldlBhcnNlKCBkZXBlbmRlbmN5LCAnSEVBRCcgKTtcblxuICAgICAgICAgICAgICBpZiAoIHNoYSAhPT0gY3VycmVudFNIQSApIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyggYEF0dGVtcHRpbmcgdG8gKGhvcGVmdWxseSBmYXN0LWZvcndhcmQpIG1lcmdlICR7c2hhfWAgKTtcbiAgICAgICAgICAgICAgICBhd2FpdCBleGVjdXRlKCAnZ2l0JywgWyAnbWVyZ2UnLCBzaGEgXSwgYC4uLyR7ZGVwZW5kZW5jeX1gICk7XG4gICAgICAgICAgICAgICAgYXdhaXQgZ2l0UHVzaCggZGVwZW5kZW5jeSwgZGVwZW5kZW5jeUJyYW5jaCApO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgY29uc29sZS5sb2coIGBCcmFuY2ggJHtkZXBlbmRlbmN5QnJhbmNofSBkb2VzIG5vdCBleGlzdCBpbiAke2RlcGVuZGVuY3l9LCBjcmVhdGluZy5gICk7XG4gICAgICAgICAgICAgIGF3YWl0IGdpdENoZWNrb3V0KCBkZXBlbmRlbmN5LCBzaGEgKTtcbiAgICAgICAgICAgICAgYXdhaXQgZ2l0Q3JlYXRlQnJhbmNoKCBkZXBlbmRlbmN5LCBkZXBlbmRlbmN5QnJhbmNoICk7XG4gICAgICAgICAgICAgIGF3YWl0IGdpdFB1c2goIGRlcGVuZGVuY3ksIGRlcGVuZGVuY3lCcmFuY2ggKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgZGVsZXRlIG1vZGlmaWVkQnJhbmNoLmNoYW5nZWREZXBlbmRlbmNpZXNbIGRlcGVuZGVuY3kgXTtcbiAgICAgICAgICAgIG1vZGlmaWVkQnJhbmNoLmRlcGxveWVkVmVyc2lvbiA9IG51bGw7XG4gICAgICAgICAgICBtYWludGVuYW5jZS5zYXZlKCk7IC8vIHNhdmUgaGVyZSBpbiBjYXNlIGEgZnV0dXJlIGZhaWx1cmUgd291bGQgXCJyZXZlcnRcIiB0aGluZ3NcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBjb25zdCBtZXNzYWdlID0gbW9kaWZpZWRCcmFuY2gucGVuZGluZ01lc3NhZ2VzLmpvaW4oICcgYW5kICcgKTtcbiAgICAgICAgICBmcy53cml0ZUZpbGVTeW5jKCBkZXBlbmRlbmNpZXNKU09ORmlsZSwgSlNPTi5zdHJpbmdpZnkoIGRlcGVuZGVuY2llc0pTT04sIG51bGwsIDIgKSApO1xuICAgICAgICAgIGF3YWl0IGdpdEFkZCggbW9kaWZpZWRCcmFuY2gucmVwbywgJ2RlcGVuZGVuY2llcy5qc29uJyApO1xuICAgICAgICAgIGF3YWl0IGdpdENvbW1pdCggbW9kaWZpZWRCcmFuY2gucmVwbywgYHVwZGF0ZWQgZGVwZW5kZW5jaWVzLmpzb24gZm9yICR7bWVzc2FnZX1gICk7XG4gICAgICAgICAgYXdhaXQgZ2l0UHVzaCggbW9kaWZpZWRCcmFuY2gucmVwbywgbW9kaWZpZWRCcmFuY2guYnJhbmNoICk7XG5cbiAgICAgICAgICAvLyBNb3ZlIG1lc3NhZ2VzIGZyb20gcGVuZGluZyB0byBwdXNoZWRcbiAgICAgICAgICBmb3IgKCBjb25zdCBtZXNzYWdlIG9mIG1vZGlmaWVkQnJhbmNoLnBlbmRpbmdNZXNzYWdlcyApIHtcbiAgICAgICAgICAgIGlmICggIW1vZGlmaWVkQnJhbmNoLnB1c2hlZE1lc3NhZ2VzLmluY2x1ZGVzKCBtZXNzYWdlICkgKSB7XG4gICAgICAgICAgICAgIG1vZGlmaWVkQnJhbmNoLnB1c2hlZE1lc3NhZ2VzLnB1c2goIG1lc3NhZ2UgKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgbW9kaWZpZWRCcmFuY2gucGVuZGluZ01lc3NhZ2VzID0gW107XG4gICAgICAgICAgbWFpbnRlbmFuY2Uuc2F2ZSgpOyAvLyBzYXZlIGhlcmUgaW4gY2FzZSBhIGZ1dHVyZSBmYWlsdXJlIHdvdWxkIFwicmV2ZXJ0XCIgdGhpbmdzXG5cbiAgICAgICAgICBhd2FpdCBjaGVja291dE1haW4oIG1vZGlmaWVkQnJhbmNoLnJlcG8sIGZhbHNlICk7XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2goIGUgKSB7XG4gICAgICAgICAgbWFpbnRlbmFuY2Uuc2F2ZSgpO1xuXG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCBgRmFpbHVyZSB1cGRhdGluZyBkZXBlbmRlbmNpZXMgZm9yICR7bW9kaWZpZWRCcmFuY2gucmVwb30gdG8gJHttb2RpZmllZEJyYW5jaC5icmFuY2h9OiAke2V9YCApO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIG1haW50ZW5hbmNlLnNhdmUoKTtcblxuICAgICAgY29uc29sZS5sb2coICdEZXBlbmRlbmNpZXMgdXBkYXRlZCcgKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBEZXBsb3lzIFJDIHZlcnNpb25zIG9mIHRoZSBtb2RpZmllZCBicmFuY2hlcyB0aGF0IG5lZWQgaXQuXG4gICAgICogQHB1YmxpY1xuICAgICAqXG4gICAgICogQHBhcmFtIHtmdW5jdGlvbihNb2RpZmllZEJyYW5jaCk6UHJvbWlzZS48Ym9vbGVhbj59IFtmaWx0ZXJdIC0gT3B0aW9uYWwgZmlsdGVyLCBtb2RpZmllZCBicmFuY2hlcyB3aWxsIGJlIHNraXBwZWRcbiAgICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiB0aGlzIHJlc29sdmVzIHRvIGZhbHNlXG4gICAgICovXG4gICAgc3RhdGljIGFzeW5jIGRlcGxveVJlbGVhc2VDYW5kaWRhdGVzKCBmaWx0ZXIgKSB7XG4gICAgICBjb25zdCBtYWludGVuYW5jZSA9IE1haW50ZW5hbmNlLmxvYWQoKTtcblxuICAgICAgZm9yICggY29uc3QgbW9kaWZpZWRCcmFuY2ggb2YgbWFpbnRlbmFuY2UubW9kaWZpZWRCcmFuY2hlcyApIHtcbiAgICAgICAgaWYgKCAhbW9kaWZpZWRCcmFuY2guaXNSZWFkeUZvclJlbGVhc2VDYW5kaWRhdGUgfHwgIW1vZGlmaWVkQnJhbmNoLnJlbGVhc2VCcmFuY2guaXNSZWxlYXNlZCApIHtcbiAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnNvbGUubG9nKCAnPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09JyApO1xuXG4gICAgICAgIGlmICggZmlsdGVyICYmICEoIGF3YWl0IGZpbHRlciggbW9kaWZpZWRCcmFuY2ggKSApICkge1xuICAgICAgICAgIGNvbnNvbGUubG9nKCBgU2tpcHBpbmcgUkMgZGVwbG95IGZvciAke21vZGlmaWVkQnJhbmNoLnJlcG99ICR7bW9kaWZpZWRCcmFuY2guYnJhbmNofWAgKTtcbiAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgY29uc29sZS5sb2coIGBSdW5uaW5nIFJDIGRlcGxveSBmb3IgJHttb2RpZmllZEJyYW5jaC5yZXBvfSAke21vZGlmaWVkQnJhbmNoLmJyYW5jaH1gICk7XG5cbiAgICAgICAgICBjb25zdCB2ZXJzaW9uID0gYXdhaXQgcmMoIG1vZGlmaWVkQnJhbmNoLnJlcG8sIG1vZGlmaWVkQnJhbmNoLmJyYW5jaCwgbW9kaWZpZWRCcmFuY2guYnJhbmRzLCB0cnVlLCBtb2RpZmllZEJyYW5jaC5wdXNoZWRNZXNzYWdlcy5qb2luKCAnLCAnICkgKTtcbiAgICAgICAgICBtb2RpZmllZEJyYW5jaC5kZXBsb3llZFZlcnNpb24gPSB2ZXJzaW9uO1xuICAgICAgICAgIG1haW50ZW5hbmNlLnNhdmUoKTsgLy8gc2F2ZSBoZXJlIGluIGNhc2UgYSBmdXR1cmUgZmFpbHVyZSB3b3VsZCBcInJldmVydFwiIHRoaW5nc1xuICAgICAgICB9XG4gICAgICAgIGNhdGNoKCBlICkge1xuICAgICAgICAgIG1haW50ZW5hbmNlLnNhdmUoKTtcblxuICAgICAgICAgIHRocm93IG5ldyBFcnJvciggYEZhaWx1cmUgd2l0aCBSQyBkZXBsb3kgZm9yICR7bW9kaWZpZWRCcmFuY2gucmVwb30gdG8gJHttb2RpZmllZEJyYW5jaC5icmFuY2h9OiAke2V9YCApO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIG1haW50ZW5hbmNlLnNhdmUoKTtcblxuICAgICAgY29uc29sZS5sb2coICdSQyB2ZXJzaW9ucyBkZXBsb3llZCcgKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBEZXBsb3lzIHByb2R1Y3Rpb24gdmVyc2lvbnMgb2YgdGhlIG1vZGlmaWVkIGJyYW5jaGVzIHRoYXQgbmVlZCBpdC5cbiAgICAgKiBAcHVibGljXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge2Z1bmN0aW9uKE1vZGlmaWVkQnJhbmNoKTpQcm9taXNlLjxib29sZWFuPn0gW2ZpbHRlcl0gLSBPcHRpb25hbCBmaWx0ZXIsIG1vZGlmaWVkIGJyYW5jaGVzIHdpbGwgYmUgc2tpcHBlZFxuICAgICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIHRoaXMgcmVzb2x2ZXMgdG8gZmFsc2VcbiAgICAgKi9cbiAgICBzdGF0aWMgYXN5bmMgZGVwbG95UHJvZHVjdGlvbiggZmlsdGVyICkge1xuICAgICAgY29uc3QgbWFpbnRlbmFuY2UgPSBNYWludGVuYW5jZS5sb2FkKCk7XG5cbiAgICAgIGZvciAoIGNvbnN0IG1vZGlmaWVkQnJhbmNoIG9mIG1haW50ZW5hbmNlLm1vZGlmaWVkQnJhbmNoZXMgKSB7XG4gICAgICAgIGlmICggIW1vZGlmaWVkQnJhbmNoLmlzUmVhZHlGb3JQcm9kdWN0aW9uIHx8ICFtb2RpZmllZEJyYW5jaC5yZWxlYXNlQnJhbmNoLmlzUmVsZWFzZWQgKSB7XG4gICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIGZpbHRlciAmJiAhKCBhd2FpdCBmaWx0ZXIoIG1vZGlmaWVkQnJhbmNoICkgKSApIHtcbiAgICAgICAgICBjb25zb2xlLmxvZyggYFNraXBwaW5nIHByb2R1Y3Rpb24gZGVwbG95IGZvciAke21vZGlmaWVkQnJhbmNoLnJlcG99ICR7bW9kaWZpZWRCcmFuY2guYnJhbmNofWAgKTtcbiAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgY29uc29sZS5sb2coIGBSdW5uaW5nIHByb2R1Y3Rpb24gZGVwbG95IGZvciAke21vZGlmaWVkQnJhbmNoLnJlcG99ICR7bW9kaWZpZWRCcmFuY2guYnJhbmNofWAgKTtcblxuICAgICAgICAgIGNvbnN0IHZlcnNpb24gPSBhd2FpdCBwcm9kdWN0aW9uKCBtb2RpZmllZEJyYW5jaC5yZXBvLCBtb2RpZmllZEJyYW5jaC5icmFuY2gsIG1vZGlmaWVkQnJhbmNoLmJyYW5kcywgdHJ1ZSwgZmFsc2UsIG1vZGlmaWVkQnJhbmNoLnB1c2hlZE1lc3NhZ2VzLmpvaW4oICcsICcgKSApO1xuICAgICAgICAgIG1vZGlmaWVkQnJhbmNoLmRlcGxveWVkVmVyc2lvbiA9IHZlcnNpb247XG4gICAgICAgICAgbW9kaWZpZWRCcmFuY2gucHVzaGVkTWVzc2FnZXMgPSBbXTtcbiAgICAgICAgICBtYWludGVuYW5jZS5zYXZlKCk7IC8vIHNhdmUgaGVyZSBpbiBjYXNlIGEgZnV0dXJlIGZhaWx1cmUgd291bGQgXCJyZXZlcnRcIiB0aGluZ3NcbiAgICAgICAgfVxuICAgICAgICBjYXRjaCggZSApIHtcbiAgICAgICAgICBtYWludGVuYW5jZS5zYXZlKCk7XG5cbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoIGBGYWlsdXJlIHdpdGggcHJvZHVjdGlvbiBkZXBsb3kgZm9yICR7bW9kaWZpZWRCcmFuY2gucmVwb30gdG8gJHttb2RpZmllZEJyYW5jaC5icmFuY2h9OiAke2V9YCApO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIG1haW50ZW5hbmNlLnNhdmUoKTtcblxuICAgICAgY29uc29sZS5sb2coICdwcm9kdWN0aW9uIHZlcnNpb25zIGRlcGxveWVkJyApO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENyZWF0ZSBhIHNlcGFyYXRlIGRpcmVjdG9yeSBmb3IgZWFjaCByZWxlYXNlIGJyYW5jaC4gVGhpcyBkb2VzIG5vdCBpbnRlcmZhY2Ugd2l0aCB0aGUgc2F2ZWQgbWFpbnRlbmFuY2Ugc3RhdGUgYXRcbiAgICAgKiBhbGwsIGFuZCBpbnN0ZWFkIGp1c3QgbG9va3MgYXQgdGhlIGNvbW1pdHRlZCBkZXBlbmRlbmNpZXMuanNvbiB3aGVuIHVwZGF0aW5nLlxuICAgICAqIEBwdWJsaWNcbiAgICAgKlxuICAgICAqIEBwYXJhbSB7ZnVuY3Rpb24oUmVsZWFzZUJyYW5jaCk6UHJvbWlzZS48Ym9vbGVhbj59IFtmaWx0ZXJdIC0gT3B0aW9uYWwgZmlsdGVyLCByZWxlYXNlIGJyYW5jaGVzIHdpbGwgYmUgc2tpcHBlZFxuICAgICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgdGhpcyByZXNvbHZlcyB0byBmYWxzZVxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9uc10gLSBidWlsZD1mYWxzZSAtIHRvIG9wdCBvdXQgb2YgYnVpbGRpbmcsIHNldCB0byBmYWxzZS5cbiAgICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdHJhbnNwaWxlPWZhbHNlIC0gdG8gb3B0IG91dCBvZiB0cmFuc3BpbGluZywgc2V0IHRvIGZhbHNlLlxuICAgICAqL1xuICAgIHN0YXRpYyBhc3luYyB1cGRhdGVDaGVja291dHMoIGZpbHRlciwgb3B0aW9ucyApIHtcbiAgICAgIG9wdGlvbnMgPSBfLm1lcmdlKCB7XG4gICAgICAgIGNvbmN1cnJlbnQ6IDUsXG4gICAgICAgIGJ1aWxkOiB0cnVlLFxuICAgICAgICB0cmFuc3BpbGU6IHRydWUsXG4gICAgICAgIGJ1aWxkT3B0aW9uczogeyBsaW50OiB0cnVlIH1cbiAgICAgIH0sIG9wdGlvbnMgKTtcblxuICAgICAgY29uc29sZS5sb2coIGBVcGRhdGluZyBjaGVja291dHMgKHJ1bm5pbmcgaW4gcGFyYWxsZWwgd2l0aCAke29wdGlvbnMuY29uY3VycmVudH0gdGhyZWFkcylgICk7XG5cbiAgICAgIGNvbnN0IHJlbGVhc2VCcmFuY2hlcyA9IGF3YWl0IE1haW50ZW5hbmNlLmdldE1haW50ZW5hbmNlQnJhbmNoZXMoKTtcblxuICAgICAgY29uc3QgZmlsdGVyZWRCcmFuY2hlcyA9IFtdO1xuXG4gICAgICAvLyBSdW4gYWxsIGZpbHRlcmluZyBpbiBhIHN0ZXAgYmVmb3JlIHRoZSBwYXJhbGxlbCBzdGVwLiBUaGlzIHdheSB0aGUgZmlsdGVyIGhhcyBmdWxsIGFjY2VzcyB0byByZXBvcyBhbmQgZ2l0IGNvbW1hbmRzIHdpdGhvdXQgcmFjZSBjb25kaXRpb25zLCBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvcGVyZW5uaWFsL2lzc3Vlcy8zNDFcbiAgICAgIGZvciAoIGNvbnN0IHJlbGVhc2VCcmFuY2ggb2YgcmVsZWFzZUJyYW5jaGVzICkge1xuICAgICAgICBpZiAoICFmaWx0ZXIgfHwgYXdhaXQgZmlsdGVyKCByZWxlYXNlQnJhbmNoICkgKSB7XG4gICAgICAgICAgZmlsdGVyZWRCcmFuY2hlcy5wdXNoKCByZWxlYXNlQnJhbmNoICk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgY29uc29sZS5sb2coIGBGaWx0ZXIgYXBwbGllZC4gVXBkYXRpbmcgJHtmaWx0ZXJlZEJyYW5jaGVzLmxlbmd0aH06YCwgZmlsdGVyZWRCcmFuY2hlcy5tYXAoIHggPT4geC50b1N0cmluZygpICkgKTtcblxuICAgICAgY29uc3QgYXN5bmNGdW5jdGlvbnMgPSBmaWx0ZXJlZEJyYW5jaGVzLm1hcCggcmVsZWFzZUJyYW5jaCA9PiAoIGFzeW5jICgpID0+IHtcbiAgICAgICAgY29uc29sZS5sb2coICdCZWdpbm5pbmc6ICcsIHJlbGVhc2VCcmFuY2gudG9TdHJpbmcoKSApO1xuICAgICAgICB0cnkge1xuXG4gICAgICAgICAgYXdhaXQgcmVsZWFzZUJyYW5jaC51cGRhdGVDaGVja291dCgpO1xuXG4gICAgICAgICAgb3B0aW9ucy50cmFuc3BpbGUgJiYgYXdhaXQgcmVsZWFzZUJyYW5jaC50cmFuc3BpbGUoKTtcbiAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgb3B0aW9ucy5idWlsZCAmJiBhd2FpdCByZWxlYXNlQnJhbmNoLmJ1aWxkKCBvcHRpb25zLmJ1aWxkT3B0aW9ucyApO1xuICAgICAgICAgICAgY29uc29sZS5sb2coICdGaW5pc2hlZDogJywgcmVsZWFzZUJyYW5jaC50b1N0cmluZygpICk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGNhdGNoKCBlICkge1xuICAgICAgICAgICAgY29uc29sZS5sb2coIGBmYWlsZWQgdG8gYnVpbGQgJHtyZWxlYXNlQnJhbmNoLnRvU3RyaW5nKCl9OiAke2V9YCApO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBjYXRjaCggZSApIHtcbiAgICAgICAgICBjb25zb2xlLmxvZyggYGZhaWxlZCB0byB1cGRhdGUgcmVsZWFzZUJyYW5jaCAke3JlbGVhc2VCcmFuY2gudG9TdHJpbmcoKX06ICR7ZX1gICk7XG4gICAgICAgIH1cbiAgICAgIH0gKSApO1xuXG4gICAgICBhd2FpdCBhc3luY1EucGFyYWxsZWxMaW1pdCggYXN5bmNGdW5jdGlvbnMsIG9wdGlvbnMuY29uY3VycmVudCApO1xuXG4gICAgICBjb25zb2xlLmxvZyggJ0RvbmUnICk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQHB1YmxpY1xuICAgICAqXG4gICAgICogQHBhcmFtIHtmdW5jdGlvbihSZWxlYXNlQnJhbmNoKTpQcm9taXNlLjxib29sZWFuPn0gW2ZpbHRlcl0gLSBPcHRpb25hbCBmaWx0ZXIsIHJlbGVhc2UgYnJhbmNoZXMgd2lsbCBiZSBza2lwcGVkXG4gICAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiB0aGlzIHJlc29sdmVzIHRvIGZhbHNlXG4gICAgICovXG4gICAgc3RhdGljIGFzeW5jIGNoZWNrVW5idWlsdENoZWNrb3V0cyggZmlsdGVyICkge1xuICAgICAgY29uc29sZS5sb2coICdDaGVja2luZyB1bmJ1aWx0IGNoZWNrb3V0cycgKTtcblxuICAgICAgY29uc3QgcmVsZWFzZUJyYW5jaGVzID0gYXdhaXQgTWFpbnRlbmFuY2UuZ2V0TWFpbnRlbmFuY2VCcmFuY2hlcygpO1xuICAgICAgZm9yICggY29uc3QgcmVsZWFzZUJyYW5jaCBvZiByZWxlYXNlQnJhbmNoZXMgKSB7XG4gICAgICAgIGlmICggIWZpbHRlciB8fCBhd2FpdCBmaWx0ZXIoIHJlbGVhc2VCcmFuY2ggKSApIHtcbiAgICAgICAgICBjb25zb2xlLmxvZyggcmVsZWFzZUJyYW5jaC50b1N0cmluZygpICk7XG4gICAgICAgICAgY29uc3QgdW5idWlsdFJlc3VsdCA9IGF3YWl0IHJlbGVhc2VCcmFuY2guY2hlY2tVbmJ1aWx0KCk7XG4gICAgICAgICAgaWYgKCB1bmJ1aWx0UmVzdWx0ICkge1xuICAgICAgICAgICAgY29uc29sZS5sb2coIHVuYnVpbHRSZXN1bHQgKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAcHVibGljXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge2Z1bmN0aW9uKFJlbGVhc2VCcmFuY2gpOlByb21pc2UuPGJvb2xlYW4+fSBbZmlsdGVyXSAtIE9wdGlvbmFsIGZpbHRlciwgcmVsZWFzZSBicmFuY2hlcyB3aWxsIGJlIHNraXBwZWRcbiAgICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIHRoaXMgcmVzb2x2ZXMgdG8gZmFsc2VcbiAgICAgKi9cbiAgICBzdGF0aWMgYXN5bmMgY2hlY2tCdWlsdENoZWNrb3V0cyggZmlsdGVyICkge1xuICAgICAgY29uc29sZS5sb2coICdDaGVja2luZyBidWlsdCBjaGVja291dHMnICk7XG5cbiAgICAgIGNvbnN0IHJlbGVhc2VCcmFuY2hlcyA9IGF3YWl0IE1haW50ZW5hbmNlLmdldE1haW50ZW5hbmNlQnJhbmNoZXMoKTtcbiAgICAgIGZvciAoIGNvbnN0IHJlbGVhc2VCcmFuY2ggb2YgcmVsZWFzZUJyYW5jaGVzICkge1xuICAgICAgICBpZiAoICFmaWx0ZXIgfHwgYXdhaXQgZmlsdGVyKCByZWxlYXNlQnJhbmNoICkgKSB7XG4gICAgICAgICAgY29uc29sZS5sb2coIHJlbGVhc2VCcmFuY2gudG9TdHJpbmcoKSApO1xuICAgICAgICAgIGNvbnN0IGJ1aWx0UmVzdWx0ID0gYXdhaXQgcmVsZWFzZUJyYW5jaC5jaGVja0J1aWx0KCk7XG4gICAgICAgICAgaWYgKCBidWlsdFJlc3VsdCApIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCBidWlsdFJlc3VsdCApO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJlZGVwbG95cyBwcm9kdWN0aW9uIHZlcnNpb25zIG9mIGFsbCByZWxlYXNlIGJyYW5jaGVzIChvciB0aG9zZSBtYXRjaGluZyBhIHNwZWNpZmljIGZpbHRlclxuICAgICAqIEBwdWJsaWNcbiAgICAgKlxuICAgICAqIE5PVEU6IFRoaXMgZG9lcyBub3QgdXNlIHRoZSBjdXJyZW50IG1haW50ZW5hbmNlIHN0YXRlIVxuICAgICAqXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IG1lc3NhZ2UgLSBHZW5lcmFsbHkgYW4gaXNzdWUgdG8gcmVmZXJlbmNlXG4gICAgICogQHBhcmFtIHtmdW5jdGlvbihSZWxlYXNlQnJhbmNoKTpQcm9taXNlLjxib29sZWFuPn0gW2ZpbHRlcl0gLSBPcHRpb25hbCBmaWx0ZXIsIHJlbGVhc2UgYnJhbmNoZXMgd2lsbCBiZSBza2lwcGVkXG4gICAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgdGhpcyByZXNvbHZlcyB0byBmYWxzZVxuICAgICAqL1xuICAgIHN0YXRpYyBhc3luYyByZWRlcGxveUFsbFByb2R1Y3Rpb24oIG1lc3NhZ2UsIGZpbHRlciApIHtcbiAgICAgIC8vIElnbm9yZSB1bnJlbGVhc2VkIGJyYW5jaGVzIVxuICAgICAgY29uc3QgcmVsZWFzZUJyYW5jaGVzID0gYXdhaXQgTWFpbnRlbmFuY2UuZ2V0TWFpbnRlbmFuY2VCcmFuY2hlcyggKCkgPT4gdHJ1ZSwgZmFsc2UgKTtcblxuICAgICAgZm9yICggY29uc3QgcmVsZWFzZUJyYW5jaCBvZiByZWxlYXNlQnJhbmNoZXMgKSB7XG4gICAgICAgIGlmICggZmlsdGVyICYmICEoIGF3YWl0IGZpbHRlciggcmVsZWFzZUJyYW5jaCApICkgKSB7XG4gICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zb2xlLmxvZyggcmVsZWFzZUJyYW5jaC50b1N0cmluZygpICk7XG4gICAgICAgIGF3YWl0IHJjKCByZWxlYXNlQnJhbmNoLnJlcG8sIHJlbGVhc2VCcmFuY2guYnJhbmNoLCByZWxlYXNlQnJhbmNoLmJyYW5kcywgdHJ1ZSwgbWVzc2FnZSApO1xuICAgICAgICBhd2FpdCBwcm9kdWN0aW9uKCByZWxlYXNlQnJhbmNoLnJlcG8sIHJlbGVhc2VCcmFuY2guYnJhbmNoLCByZWxlYXNlQnJhbmNoLmJyYW5kcywgdHJ1ZSwgZmFsc2UsIG1lc3NhZ2UgKTtcbiAgICAgIH1cblxuICAgICAgY29uc29sZS5sb2coICdGaW5pc2hlZCByZWRlcGxveWluZycgKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBUaGUgcHJvdG90eXBlIGNvcHkgb2YgTWFpbnRlbmFuY2UuZ2V0TWFpbnRlbmFuY2VCcmFuY2hlcygpLCBpbiB3aGljaCB3ZSB3aWxsIG11dGF0ZSB0aGUgY2xhc3MncyBhbGxSZWxlYXNlQnJhbmNoZXNcbiAgICAgKiB0byBlbnN1cmUgdGhlcmUgaXMgbm8gc2F2ZS9sb2FkIG9yZGVyIGRlcGVuZGVuY3kgcHJvYmxlbXMuXG4gICAgICpcbiAgICAgKiBAcHVibGljXG4gICAgICogQHBhcmFtIHtmdW5jdGlvbihSZWxlYXNlQnJhbmNoKTpib29sZWFufSBmaWx0ZXJSZXBvIC0gcmV0dXJuIGZhbHNlIGlmIHRoZSBSZWxlYXNlQnJhbmNoIHNob3VsZCBiZSBleGNsdWRlZC5cbiAgICAgKiBAcGFyYW0ge2Z1bmN0aW9ufSBjaGVja1VucmVsZWFzZWRCcmFuY2hlcyAtIElmIGZhbHNlLCB3aWxsIHNraXAgY2hlY2tpbmcgZm9yIHVucmVsZWFzZWQgYnJhbmNoZXMuIFRoaXMgY2hlY2tpbmcgbmVlZHMgYWxsIHJlcG9zIGNoZWNrZWQgb3V0XG4gICAgICogQHBhcmFtIHtib29sZWFufSBmb3JjZUNhY2hlQnJlYWs9ZmFsc2UgLSB0cnVlIGlmIHlvdSB3YW50IHRvIGZvcmNlIGEgcmVjYWxjdWxhdGlvbiBvZiBhbGwgUmVsZWFzZUJyYW5jaGVzXG4gICAgICogQHJldHVybnMge1Byb21pc2UuPEFycmF5LjxSZWxlYXNlQnJhbmNoPj59XG4gICAgICogQHJlamVjdHMge0V4ZWN1dGVFcnJvcn1cbiAgICAgKi9cbiAgICBhc3luYyBnZXRNYWludGVuYW5jZUJyYW5jaGVzKCBmaWx0ZXJSZXBvID0gKCkgPT4gdHJ1ZSwgY2hlY2tVbnJlbGVhc2VkQnJhbmNoZXMgPSB0cnVlLCBmb3JjZUNhY2hlQnJlYWsgPSBmYWxzZSApIHtcbiAgICAgIHJldHVybiBNYWludGVuYW5jZS5nZXRNYWludGVuYW5jZUJyYW5jaGVzKCBmaWx0ZXJSZXBvLCBjaGVja1VucmVsZWFzZWRCcmFuY2hlcywgZm9yY2VDYWNoZUJyZWFrLCB0aGlzICk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQHB1YmxpY1xuICAgICAqIEBwYXJhbSB7ZnVuY3Rpb24oUmVsZWFzZUJyYW5jaCk6Ym9vbGVhbn0gZmlsdGVyUmVwbyAtIHJldHVybiBmYWxzZSBpZiB0aGUgUmVsZWFzZUJyYW5jaCBzaG91bGQgYmUgZXhjbHVkZWQuXG4gICAgICogQHBhcmFtIHtib29sZWFufSBjaGVja1VucmVsZWFzZWRCcmFuY2hlcyAtIElmIGZhbHNlLCB3aWxsIHNraXAgY2hlY2tpbmcgZm9yIHVucmVsZWFzZWQgYnJhbmNoZXMuIFRoaXMgY2hlY2tpbmcgbmVlZHMgYWxsIHJlcG9zIGNoZWNrZWQgb3V0XG4gICAgICogQHBhcmFtIHtib29sZWFufSBmb3JjZUNhY2hlQnJlYWs9ZmFsc2UgLSB0cnVlIGlmIHlvdSB3YW50IHRvIGZvcmNlIGEgcmVjYWxjdWxhdGlvbiBvZiBhbGwgUmVsZWFzZUJyYW5jaGVzXG4gICAgIEBwYXJhbSB7TWFpbnRlbmFuY2V9IG1haW50ZW5hbmNlPU1haW50ZW5hbmNlLmxvYWQoKSAtIGJ5IGRlZmF1bHQgbG9hZCBmcm9tIHNhdmVkIGZpbGUgdGhlIGN1cnJlbnQgbWFpbnRlbmFuY2UgaW5zdGFuY2UuXG4gICAgICogQHJldHVybnMge1Byb21pc2UuPEFycmF5LjxSZWxlYXNlQnJhbmNoPj59XG4gICAgICogQHJlamVjdHMge0V4ZWN1dGVFcnJvcn1cbiAgICAgKi9cbiAgICBzdGF0aWMgYXN5bmMgZ2V0TWFpbnRlbmFuY2VCcmFuY2hlcyggZmlsdGVyUmVwbyA9ICgpID0+IHRydWUsIGNoZWNrVW5yZWxlYXNlZEJyYW5jaGVzID0gdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9yY2VDYWNoZUJyZWFrID0gZmFsc2UsIG1haW50ZW5hbmNlID0gTWFpbnRlbmFuY2UubG9hZCgpICkge1xuICAgICAgY29uc3QgcmVsZWFzZUJyYW5jaGVzID0gYXdhaXQgTWFpbnRlbmFuY2UubG9hZEFsbE1haW50ZW5hbmNlQnJhbmNoZXMoIGZvcmNlQ2FjaGVCcmVhaywgbWFpbnRlbmFuY2UgKTtcblxuICAgICAgcmV0dXJuIHJlbGVhc2VCcmFuY2hlcy5maWx0ZXIoIHJlbGVhc2VCcmFuY2ggPT4ge1xuICAgICAgICBpZiAoICFjaGVja1VucmVsZWFzZWRCcmFuY2hlcyAmJiAhcmVsZWFzZUJyYW5jaC5pc1JlbGVhc2VkICkge1xuICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZmlsdGVyUmVwbyggcmVsZWFzZUJyYW5jaCApO1xuICAgICAgfSApO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIExvYWRzIGV2ZXJ5IHBvdGVudGlhbCBSZWxlYXNlQnJhbmNoIChwdWJsaXNoZWQgcGhldCBhbmQgcGhldC1pbyBicmFuZHMsIGFzIHdlbGwgYXMgdW5yZWxlYXNlZCBicmFuY2hlcyksIGFuZFxuICAgICAqIHNhdmVzIGl0IHRvIHRoZSBtYWludGVuYW5jZSBzdGF0ZS5cbiAgICAgKiBAcHVibGljXG4gICAgICpcbiAgICAgKiBDYWxsIHRoaXMgd2l0aCB0cnVlIHRvIGJyZWFrIHRoZSBjYWNoZSBhbmQgZm9yY2UgYSByZWNhbGN1bGF0aW9uIG9mIGFsbCBSZWxlYXNlQnJhbmNoZXNcbiAgICAgKlxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gZm9yY2VDYWNoZUJyZWFrPWZhbHNlIC0gdHJ1ZSBpZiB5b3Ugd2FudCB0byBmb3JjZSBhIHJlY2FsY3VsYXRpb24gb2YgYWxsIFJlbGVhc2VCcmFuY2hlc1xuICAgICAqIEBwYXJhbSB7TWFpbnRlbmFuY2V9IG1haW50ZW5hbmNlPU1haW50ZW5hbmNlLmxvYWQoKSAtIGJ5IGRlZmF1bHQgbG9hZCBmcm9tIHNhdmVkIGZpbGUgdGhlIGN1cnJlbnQgbWFpbnRlbmFuY2UgaW5zdGFuY2UuICAgICAqIEByZXR1cm5zIHtQcm9taXNlPFJlbGVhc2VCcmFuY2hbXT59XG4gICAgICovXG4gICAgc3RhdGljIGFzeW5jIGxvYWRBbGxNYWludGVuYW5jZUJyYW5jaGVzKCBmb3JjZUNhY2hlQnJlYWsgPSBmYWxzZSwgbWFpbnRlbmFuY2UgPSBNYWludGVuYW5jZS5sb2FkKCkgKSB7XG5cbiAgICAgIGxldCByZWxlYXNlQnJhbmNoZXMgPSBudWxsO1xuICAgICAgaWYgKCBtYWludGVuYW5jZS5hbGxSZWxlYXNlQnJhbmNoZXMubGVuZ3RoID4gMCAmJiAhZm9yY2VDYWNoZUJyZWFrICkge1xuICAgICAgICBhc3NlcnQoIG1haW50ZW5hbmNlLmFsbFJlbGVhc2VCcmFuY2hlc1sgMCBdIGluc3RhbmNlb2YgUmVsZWFzZUJyYW5jaCwgJ2Rlc2VyaWFsaXphdGlvbiBjaGVjaycgKTtcbiAgICAgICAgcmVsZWFzZUJyYW5jaGVzID0gbWFpbnRlbmFuY2UuYWxsUmVsZWFzZUJyYW5jaGVzO1xuICAgICAgfVxuICAgICAgZWxzZSB7XG5cbiAgICAgICAgLy8gY2FjaGUgbWlzc1xuICAgICAgICByZWxlYXNlQnJhbmNoZXMgPSBhd2FpdCBSZWxlYXNlQnJhbmNoLmdldEFsbE1haW50ZW5hbmNlQnJhbmNoZXMoKTtcbiAgICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIHJlcXVpcmUtYXRvbWljLXVwZGF0ZXNcbiAgICAgICAgbWFpbnRlbmFuY2UuYWxsUmVsZWFzZUJyYW5jaGVzID0gcmVsZWFzZUJyYW5jaGVzO1xuICAgICAgICBtYWludGVuYW5jZS5zYXZlKCk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiByZWxlYXNlQnJhbmNoZXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ29udmVydCBpbnRvIGEgcGxhaW4gSlMgb2JqZWN0IG1lYW50IGZvciBKU09OIHNlcmlhbGl6YXRpb24uXG4gICAgICogQHB1YmxpY1xuICAgICAqXG4gICAgICogQHJldHVybnMge1NlcmlhbGl6ZWRNYWludGVuYW5jZX0gLSBzZWUgUGF0Y2guc2VyaWFsaXplKCkgYW5kIE1vZGlmaWVkQnJhbmNoLnNlcmlhbGl6ZSgpXG4gICAgICovXG4gICAgc2VyaWFsaXplKCkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgcGF0Y2hlczogdGhpcy5wYXRjaGVzLm1hcCggcGF0Y2ggPT4gcGF0Y2guc2VyaWFsaXplKCkgKSxcbiAgICAgICAgbW9kaWZpZWRCcmFuY2hlczogdGhpcy5tb2RpZmllZEJyYW5jaGVzLm1hcCggbW9kaWZpZWRCcmFuY2ggPT4gbW9kaWZpZWRCcmFuY2guc2VyaWFsaXplKCkgKSxcbiAgICAgICAgYWxsUmVsZWFzZUJyYW5jaGVzOiB0aGlzLmFsbFJlbGVhc2VCcmFuY2hlcy5tYXAoIHJlbGVhc2VCcmFuY2ggPT4gcmVsZWFzZUJyYW5jaC5zZXJpYWxpemUoKSApXG4gICAgICB9O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFRha2VzIGEgc2VyaWFsaXplZCBmb3JtIG9mIHRoZSBNYWludGVuYW5jZSBhbmQgcmV0dXJucyBhbiBhY3R1YWwgaW5zdGFuY2UuXG4gICAgICogQHB1YmxpY1xuICAgICAqXG4gICAgICogQHBhcmFtIHtTZXJpYWxpemVkTWFpbnRlbmFuY2V9IC0gc2VlIE1haW50ZW5hbmNlLnNlcmlhbGl6ZSgpXG4gICAgICogQHJldHVybnMge01haW50ZW5hbmNlfVxuICAgICAqL1xuICAgIHN0YXRpYyBkZXNlcmlhbGl6ZSggeyBwYXRjaGVzID0gW10sIG1vZGlmaWVkQnJhbmNoZXMgPSBbXSwgYWxsUmVsZWFzZUJyYW5jaGVzID0gW10gfSApIHtcbiAgICAgIC8vIFBhc3MgaW4gcGF0Y2ggcmVmZXJlbmNlcyB0byBicmFuY2ggZGVzZXJpYWxpemF0aW9uXG4gICAgICBjb25zdCBkZXNlcmlhbGl6ZWRQYXRjaGVzID0gcGF0Y2hlcy5tYXAoIFBhdGNoLmRlc2VyaWFsaXplICk7XG4gICAgICBtb2RpZmllZEJyYW5jaGVzID0gbW9kaWZpZWRCcmFuY2hlcy5tYXAoIG1vZGlmaWVkQnJhbmNoID0+IE1vZGlmaWVkQnJhbmNoLmRlc2VyaWFsaXplKCBtb2RpZmllZEJyYW5jaCwgZGVzZXJpYWxpemVkUGF0Y2hlcyApICk7XG4gICAgICBtb2RpZmllZEJyYW5jaGVzLnNvcnQoICggYSwgYiApID0+IHtcbiAgICAgICAgaWYgKCBhLnJlcG8gIT09IGIucmVwbyApIHtcbiAgICAgICAgICByZXR1cm4gYS5yZXBvIDwgYi5yZXBvID8gLTEgOiAxO1xuICAgICAgICB9XG4gICAgICAgIGlmICggYS5icmFuY2ggIT09IGIuYnJhbmNoICkge1xuICAgICAgICAgIHJldHVybiBhLmJyYW5jaCA8IGIuYnJhbmNoID8gLTEgOiAxO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiAwO1xuICAgICAgfSApO1xuICAgICAgY29uc3QgZGVzZXJpYWxpemVkUmVsZWFzZUJyYW5jaGVzID0gYWxsUmVsZWFzZUJyYW5jaGVzLm1hcCggcmVsZWFzZUJyYW5jaCA9PiBSZWxlYXNlQnJhbmNoLmRlc2VyaWFsaXplKCByZWxlYXNlQnJhbmNoICkgKTtcblxuICAgICAgcmV0dXJuIG5ldyBNYWludGVuYW5jZSggZGVzZXJpYWxpemVkUGF0Y2hlcywgbW9kaWZpZWRCcmFuY2hlcywgZGVzZXJpYWxpemVkUmVsZWFzZUJyYW5jaGVzICk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogU2F2ZXMgdGhlIHN0YXRlIG9mIHRoaXMgb2JqZWN0IGludG8gdGhlIG1haW50ZW5hbmNlIGZpbGUuXG4gICAgICogQHB1YmxpY1xuICAgICAqL1xuICAgIHNhdmUoKSB7XG4gICAgICByZXR1cm4gZnMud3JpdGVGaWxlU3luYyggTUFJTlRFTkFOQ0VfRklMRSwgSlNPTi5zdHJpbmdpZnkoIHRoaXMuc2VyaWFsaXplKCksIG51bGwsIDIgKSApO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIExvYWRzIGEgbmV3IE1haW50ZW5hbmNlIG9iamVjdCAoaWYgcG9zc2libGUpIGZyb20gdGhlIG1haW50ZW5hbmNlIGZpbGUuXG4gICAgICogQHB1YmxpY1xuICAgICAqXG4gICAgICogQHJldHVybnMge01haW50ZW5hbmNlfVxuICAgICAqL1xuICAgIHN0YXRpYyBsb2FkKCkge1xuICAgICAgaWYgKCBmcy5leGlzdHNTeW5jKCBNQUlOVEVOQU5DRV9GSUxFICkgKSB7XG4gICAgICAgIHJldHVybiBNYWludGVuYW5jZS5kZXNlcmlhbGl6ZSggSlNPTi5wYXJzZSggZnMucmVhZEZpbGVTeW5jKCBNQUlOVEVOQU5DRV9GSUxFLCAndXRmOCcgKSApICk7XG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgcmV0dXJuIG5ldyBNYWludGVuYW5jZSgpO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFN0YXJ0cyBhIGNvbW1hbmQtbGluZSBSRVBMIHdpdGggZmVhdHVyZXMgbG9hZGVkLlxuICAgICAqIEBwdWJsaWNcbiAgICAgKlxuICAgICAqIEByZXR1cm5zIHtQcm9taXNlfVxuICAgICAqL1xuICAgIHN0YXRpYyBzdGFydFJFUEwoKSB7XG4gICAgICByZXR1cm4gbmV3IFByb21pc2UoICggcmVzb2x2ZSwgcmVqZWN0ICkgPT4ge1xuICAgICAgICB3aW5zdG9uLmRlZmF1bHQudHJhbnNwb3J0cy5jb25zb2xlLmxldmVsID0gJ2Vycm9yJztcblxuICAgICAgICBjb25zdCBzZXNzaW9uID0gcmVwbC5zdGFydCgge1xuICAgICAgICAgIHByb21wdDogJ21haW50ZW5hbmNlPiAnLFxuICAgICAgICAgIHVzZUNvbG9yczogdHJ1ZSxcbiAgICAgICAgICByZXBsTW9kZTogcmVwbC5SRVBMX01PREVfU1RSSUNULFxuICAgICAgICAgIGlnbm9yZVVuZGVmaW5lZDogdHJ1ZVxuICAgICAgICB9ICk7XG5cbiAgICAgICAgLy8gV2FpdCBmb3IgcHJvbWlzZXMgYmVmb3JlIGJlaW5nIHJlYWR5IGZvciBpbnB1dFxuICAgICAgICBjb25zdCBub2RlRXZhbCA9IHNlc3Npb24uZXZhbDtcbiAgICAgICAgc2Vzc2lvbi5ldmFsID0gYXN5bmMgKCBjbWQsIGNvbnRleHQsIGZpbGVuYW1lLCBjYWxsYmFjayApID0+IHtcbiAgICAgICAgICBub2RlRXZhbCggY21kLCBjb250ZXh0LCBmaWxlbmFtZSwgKCBfLCByZXN1bHQgKSA9PiB7XG4gICAgICAgICAgICBpZiAoIHJlc3VsdCBpbnN0YW5jZW9mIFByb21pc2UgKSB7XG4gICAgICAgICAgICAgIHJlc3VsdC50aGVuKCB2YWwgPT4gY2FsbGJhY2soIF8sIHZhbCApICkuY2F0Y2goIGUgPT4ge1xuICAgICAgICAgICAgICAgIGlmICggZS5zdGFjayApIHtcbiAgICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoIGBNYWludGVuYW5jZSB0YXNrIGZhaWxlZDpcXG4ke2Uuc3RhY2t9XFxuRnVsbCBFcnJvciBkZXRhaWxzOlxcbiR7SlNPTi5zdHJpbmdpZnkoIGUsIG51bGwsIDIgKX1gICk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKCB0eXBlb2YgZSA9PT0gJ3N0cmluZycgKSB7XG4gICAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKCBgTWFpbnRlbmFuY2UgdGFzayBmYWlsZWQ6ICR7ZX1gICk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgY29uc29sZS5lcnJvciggYE1haW50ZW5hbmNlIHRhc2sgZmFpbGVkIHdpdGggdW5rbm93biBlcnJvcjogJHtKU09OLnN0cmluZ2lmeSggZSwgbnVsbCwgMiApfWAgKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH0gKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICBjYWxsYmFjayggXywgcmVzdWx0ICk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSApO1xuICAgICAgICB9O1xuXG4gICAgICAgIC8vIE9ubHkgYXV0b2NvbXBsZXRlIFwicHVibGljXCIgQVBJIGZ1bmN0aW9ucyBmb3IgTWFpbnRlbmFuY2UuXG4gICAgICAgIC8vIGNvbnN0IG5vZGVDb21wbGV0ZXIgPSBzZXNzaW9uLmNvbXBsZXRlcjtcbiAgICAgICAgLy8gc2Vzc2lvbi5jb21wbGV0ZXIgPSBmdW5jdGlvbiggdGV4dCwgY2IgKSB7XG4gICAgICAgIC8vICAgbm9kZUNvbXBsZXRlciggdGV4dCwgKCBfLCBbIGNvbXBsZXRpb25zLCBjb21wbGV0ZWQgXSApID0+IHtcbiAgICAgICAgLy8gICAgIGNvbnN0IG1hdGNoID0gY29tcGxldGVkLm1hdGNoKCAvXk1haW50ZW5hbmNlXFwuKFxcdyopKy8gKTtcbiAgICAgICAgLy8gICAgIGlmICggbWF0Y2ggKSB7XG4gICAgICAgIC8vICAgICAgIGNvbnN0IGZ1bmNTdGFydCA9IG1hdGNoWyAxIF07XG4gICAgICAgIC8vICAgICAgIGNiKCBudWxsLCBbIFBVQkxJQ19GVU5DVElPTlMuZmlsdGVyKCBmID0+IGYuc3RhcnRzV2l0aCggZnVuY1N0YXJ0ICkgKS5tYXAoIGYgPT4gYE1haW50ZW5hbmNlLiR7Zn1gICksIGNvbXBsZXRlZCBdICk7XG4gICAgICAgIC8vICAgICB9XG4gICAgICAgIC8vICAgICBlbHNlIHtcbiAgICAgICAgLy8gICAgICAgY2IoIG51bGwsIFsgY29tcGxldGlvbnMsIGNvbXBsZXRlZCBdICk7XG4gICAgICAgIC8vICAgICB9XG4gICAgICAgIC8vICAgfSApO1xuICAgICAgICAvLyB9O1xuXG4gICAgICAgIC8vIEFsbG93IGNvbnRyb2xsaW5nIHZlcmJvc2l0eVxuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoIGdsb2JhbCwgJ3ZlcmJvc2UnLCB7XG4gICAgICAgICAgZ2V0KCkge1xuICAgICAgICAgICAgcmV0dXJuIHdpbnN0b24uZGVmYXVsdC50cmFuc3BvcnRzLmNvbnNvbGUubGV2ZWwgPT09ICdpbmZvJztcbiAgICAgICAgICB9LFxuICAgICAgICAgIHNldCggdmFsdWUgKSB7XG4gICAgICAgICAgICB3aW5zdG9uLmRlZmF1bHQudHJhbnNwb3J0cy5jb25zb2xlLmxldmVsID0gdmFsdWUgPyAnaW5mbycgOiAnZXJyb3InO1xuICAgICAgICAgIH1cbiAgICAgICAgfSApO1xuXG4gICAgICAgIHNlc3Npb24uY29udGV4dC5NYWludGVuYW5jZSA9IE1haW50ZW5hbmNlO1xuICAgICAgICBzZXNzaW9uLmNvbnRleHQubSA9IE1haW50ZW5hbmNlO1xuICAgICAgICBzZXNzaW9uLmNvbnRleHQuTSA9IE1haW50ZW5hbmNlO1xuICAgICAgICBzZXNzaW9uLmNvbnRleHQuUmVsZWFzZUJyYW5jaCA9IFJlbGVhc2VCcmFuY2g7XG4gICAgICAgIHNlc3Npb24uY29udGV4dC5yYiA9IFJlbGVhc2VCcmFuY2g7XG5cbiAgICAgICAgc2Vzc2lvbi5vbiggJ2V4aXQnLCByZXNvbHZlICk7XG4gICAgICB9ICk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogTG9va3MgdXAgYSBwYXRjaCBieSBpdHMgbmFtZS5cbiAgICAgKiBAcHVibGljXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gcGF0Y2hOYW1lXG4gICAgICogQHJldHVybnMge1BhdGNofVxuICAgICAqL1xuICAgIGZpbmRQYXRjaCggcGF0Y2hOYW1lICkge1xuICAgICAgY29uc3QgcGF0Y2ggPSB0aGlzLnBhdGNoZXMuZmluZCggcCA9PiBwLm5hbWUgPT09IHBhdGNoTmFtZSApO1xuICAgICAgYXNzZXJ0KCBwYXRjaCwgYFBhdGNoIG5vdCBmb3VuZCBmb3IgJHtwYXRjaE5hbWV9YCApO1xuXG4gICAgICByZXR1cm4gcGF0Y2g7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogTG9va3MgdXAgKG9yIGFkZHMpIGEgTW9kaWZpZWRCcmFuY2ggYnkgaXRzIGlkZW50aWZ5aW5nIGluZm9ybWF0aW9uLlxuICAgICAqIEBwdWJsaWNcbiAgICAgKlxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSByZXBvXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGJyYW5jaFxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gW2Vycm9ySWZNaXNzaW5nXVxuICAgICAqIEBwYXJhbSB7QXJyYXkuPFJlbGVhc2VCcmFuY2g+fSBbcmVsZWFzZUJyYW5jaGVzXSAtIElmIHByb3ZpZGVkLCBpdCB3aWxsIHNwZWVkIHVwIHRoZSBwcm9jZXNzXG4gICAgICogQHJldHVybnMge1Byb21pc2UuPE1vZGlmaWVkQnJhbmNoPn1cbiAgICAgKi9cbiAgICBhc3luYyBlbnN1cmVNb2RpZmllZEJyYW5jaCggcmVwbywgYnJhbmNoLCBlcnJvcklmTWlzc2luZyA9IGZhbHNlLCByZWxlYXNlQnJhbmNoZXMgPSBudWxsICkge1xuICAgICAgbGV0IG1vZGlmaWVkQnJhbmNoID0gdGhpcy5tb2RpZmllZEJyYW5jaGVzLmZpbmQoIG1vZGlmaWVkQnJhbmNoID0+IG1vZGlmaWVkQnJhbmNoLnJlcG8gPT09IHJlcG8gJiYgbW9kaWZpZWRCcmFuY2guYnJhbmNoID09PSBicmFuY2ggKTtcblxuICAgICAgaWYgKCAhbW9kaWZpZWRCcmFuY2ggKSB7XG4gICAgICAgIGlmICggZXJyb3JJZk1pc3NpbmcgKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCBgQ291bGQgbm90IGZpbmQgYSB0cmFja2VkIG1vZGlmaWVkIGJyYW5jaCBmb3IgJHtyZXBvfSAke2JyYW5jaH1gICk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBVc2UgdGhlIGluc3RhbmNlIHZlcnNpb24gb2YgZ2V0TWFpbnRlbmFuY2VCcmFuY2hlcyB0byBtYWtlIHN1cmUgdGhhdCB0aGlzIE1haW50ZW5hbmNlIGluc3RhbmNlIGlzIHVwZGF0ZWQgd2l0aCBuZXcgUmVsZWFzZUJyYW5jaGVzLlxuICAgICAgICByZWxlYXNlQnJhbmNoZXMgPSByZWxlYXNlQnJhbmNoZXMgfHwgYXdhaXQgdGhpcy5nZXRNYWludGVuYW5jZUJyYW5jaGVzKCByZWxlYXNlQnJhbmNoID0+IHJlbGVhc2VCcmFuY2gucmVwbyA9PT0gcmVwbyApO1xuICAgICAgICBjb25zdCByZWxlYXNlQnJhbmNoID0gcmVsZWFzZUJyYW5jaGVzLmZpbmQoIHJlbGVhc2UgPT4gcmVsZWFzZS5yZXBvID09PSByZXBvICYmIHJlbGVhc2UuYnJhbmNoID09PSBicmFuY2ggKTtcbiAgICAgICAgYXNzZXJ0KCByZWxlYXNlQnJhbmNoLCBgQ291bGQgbm90IGZpbmQgYSByZWxlYXNlIGJyYW5jaCBmb3IgcmVwbz0ke3JlcG99IGJyYW5jaD0ke2JyYW5jaH1gICk7XG5cbiAgICAgICAgbW9kaWZpZWRCcmFuY2ggPSBuZXcgTW9kaWZpZWRCcmFuY2goIHJlbGVhc2VCcmFuY2ggKTtcblxuICAgICAgICAvLyBJZiB3ZSBhcmUgY3JlYXRpbmcgaXQsIGFkZCBpdCB0byBvdXIgbGlzdC5cbiAgICAgICAgdGhpcy5tb2RpZmllZEJyYW5jaGVzLnB1c2goIG1vZGlmaWVkQnJhbmNoICk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBtb2RpZmllZEJyYW5jaDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBBdHRlbXB0cyB0byByZW1vdmUgYSBtb2RpZmllZCBicmFuY2ggKGlmIGl0IGRvZXNuJ3QgbmVlZCB0byBiZSBrZXB0IGFyb3VuZCkuXG4gICAgICogQHB1YmxpY1xuICAgICAqXG4gICAgICogQHBhcmFtIHtNb2RpZmllZEJyYW5jaH0gbW9kaWZpZWRCcmFuY2hcbiAgICAgKi9cbiAgICB0cnlSZW1vdmluZ01vZGlmaWVkQnJhbmNoKCBtb2RpZmllZEJyYW5jaCApIHtcbiAgICAgIGlmICggbW9kaWZpZWRCcmFuY2guaXNVbnVzZWQgKSB7XG4gICAgICAgIGNvbnN0IGluZGV4ID0gdGhpcy5tb2RpZmllZEJyYW5jaGVzLmluZGV4T2YoIG1vZGlmaWVkQnJhbmNoICk7XG4gICAgICAgIGFzc2VydCggaW5kZXggPj0gMCApO1xuXG4gICAgICAgIHRoaXMubW9kaWZpZWRCcmFuY2hlcy5zcGxpY2UoIGluZGV4LCAxICk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIE1haW50ZW5hbmNlO1xufSApKCk7Il0sIm5hbWVzIjpbInByb2R1Y3Rpb24iLCJyZXF1aXJlIiwicmMiLCJDaGlwcGVyVmVyc2lvbiIsIk1vZGlmaWVkQnJhbmNoIiwiUGF0Y2giLCJSZWxlYXNlQnJhbmNoIiwiYnVpbGQiLCJjaGVja291dE1haW4iLCJjaGVja291dFRhcmdldCIsImV4ZWN1dGUiLCJkZWZhdWx0IiwiZ2V0QWN0aXZlUmVwb3MiLCJnZXRCcmFuY2hlcyIsImdldEJyYW5jaE1hcCIsImdldERlcGVuZGVuY2llcyIsImdpdEFkZCIsImdpdENoZWNrb3V0IiwiZ2l0Q2hlcnJ5UGljayIsImdpdENvbW1pdCIsImdpdENyZWF0ZUJyYW5jaCIsImdpdElzQ2xlYW4iLCJnaXRQdWxsIiwiZ2l0UHVzaCIsImdpdFJldlBhcnNlIiwiYXNzZXJ0IiwiYXN5bmNRIiwiXyIsImZzIiwicmVwbCIsIndpbnN0b24iLCJncnVudENvbW1hbmQiLCJjaGlwcGVyU3VwcG9ydHNPdXRwdXRKU0dydW50VGFza3MiLCJNQUlOVEVOQU5DRV9GSUxFIiwibW9kdWxlIiwiZXhwb3J0cyIsIk1haW50ZW5hbmNlIiwicmVzZXQiLCJrZWVwQ2FjaGVkUmVsZWFzZUJyYW5jaGVzIiwiY29uc29sZSIsImxvZyIsImFsbFJlbGVhc2VCcmFuY2hlcyIsIm1haW50ZW5hbmNlIiwibG9hZCIsInB1c2giLCJzYXZlIiwiY2hlY2tCcmFuY2hTdGF0dXMiLCJmaWx0ZXIiLCJyZXBvIiwicmVsZWFzZUJyYW5jaGVzIiwiZ2V0TWFpbnRlbmFuY2VCcmFuY2hlcyIsImJyYW5jaE1hcHMiLCJnZXRCcmFuY2hNYXBBc3luY0NhbGxiYWNrIiwicmVsZWFzZUJyYW5jaCIsImJyYW5jaCIsImxpbmUiLCJnZXRTdGF0dXMiLCJidWlsZEFsbCIsImZhaWxlZCIsImJyYW5kcyIsIkVycm9yIiwiZSIsImJyYW5kIiwibGVuZ3RoIiwiam9pbiIsImxpc3QiLCJwYXRjaGVzIiwibW9kaWZpZWRCcmFuY2giLCJtb2RpZmllZEJyYW5jaGVzIiwiY291bnQiLCJpbmRleE9mIiwiaXNSZWxlYXNlZCIsImRlcGxveWVkVmVyc2lvbiIsInRvU3RyaW5nIiwibmVlZGVkUGF0Y2hlcyIsIm1hcCIsInBhdGNoIiwibmFtZSIsInB1c2hlZE1lc3NhZ2VzIiwicGVuZGluZ01lc3NhZ2VzIiwiT2JqZWN0Iiwia2V5cyIsImNoYW5nZWREZXBlbmRlbmNpZXMiLCJrZXkiLCJpbmRleEFuZFNwYWNpbmciLCJtZXNzYWdlIiwic2hhIiwic2hhcyIsImluY2x1ZGVzIiwibGlzdExpbmtzIiwiZGVwbG95ZWRCcmFuY2hlcyIsInByb2R1Y3Rpb25CcmFuY2hlcyIsInRlc3RUeXBlIiwicmVsZWFzZUNhbmRpZGF0ZUJyYW5jaGVzIiwibGlua3MiLCJnZXREZXBsb3llZExpbmtMaW5lcyIsImxpbmsiLCJjcmVhdGVVbnJlbGVhc2VkSXNzdWVzIiwiYWRkaXRpb25hbE5vdGVzIiwiY3JlYXRlVW5yZWxlYXNlZElzc3VlIiwiY3JlYXRlUGF0Y2giLCJwYXRjaE5hbWUiLCJyZW1vdmVQYXRjaCIsImZpbmRQYXRjaCIsInNwbGljZSIsImFkZFBhdGNoU0hBIiwicmVtb3ZlUGF0Y2hTSEEiLCJpbmRleCIsInJlbW92ZUFsbFBhdGNoU0hBcyIsImFkZE5lZWRlZFBhdGNoIiwiZW5zdXJlTW9kaWZpZWRCcmFuY2giLCJhZGROZWVkZWRQYXRjaFJlbGVhc2VCcmFuY2giLCJhZGROZWVkZWRQYXRjaGVzIiwibmVlZHNQYXRjaCIsImFkZEFsbE5lZWRlZFBhdGNoZXMiLCJhZGROZWVkZWRQYXRjaGVzQmVmb3JlIiwiaXNNaXNzaW5nU0hBIiwiYWRkTmVlZGVkUGF0Y2hlc0FmdGVyIiwiaW5jbHVkZXNTSEEiLCJhZGROZWVkZWRQYXRjaGVzQnVpbGRGaWx0ZXIiLCJjaGlwcGVyVmVyc2lvbiIsImdldEZyb21SZXBvc2l0b3J5IiwiZmlsZW5hbWUiLCJtYWpvciIsInJlYWRGaWxlU3luYyIsInJlbW92ZU5lZWRlZFBhdGNoIiwidHJ5UmVtb3ZpbmdNb2RpZmllZEJyYW5jaCIsInJlbW92ZU5lZWRlZFBhdGNoZXMiLCJuZWVkc1JlbW92YWwiLCJyZW1vdmVOZWVkZWRQYXRjaGVzQmVmb3JlIiwicmVtb3ZlTmVlZGVkUGF0Y2hlc0FmdGVyIiwic2luZ2xlRmlsZVJlbGVhc2VCcmFuY2hGaWx0ZXIiLCJmaWxlIiwicHJlZGljYXRlIiwiY2hlY2tvdXQiLCJleGlzdHNTeW5jIiwiY29udGVudHMiLCJjaGVja291dEJyYW5jaCIsIm91dHB1dEpTIiwiZXJyb3JzIiwiYXBwbHlQYXRjaGVzIiwiaW5mbyIsInN1Y2Nlc3MiLCJudW1BcHBsaWVkIiwic2xpY2UiLCJwYXRjaFJlcG8iLCJwYXRjaFJlcG9DdXJyZW50U0hBIiwiZGVwZW5kZW5jaWVzIiwiaGFzU2hhIiwiY29kZSIsImNoZXJyeVBpY2tTdWNjZXNzIiwiY3VycmVudFNIQSIsInVwZGF0ZURlcGVuZGVuY2llcyIsImNoYW5nZWRSZXBvcyIsImRlcGVuZGVuY2llc0pTT05GaWxlIiwiZGVwZW5kZW5jaWVzSlNPTiIsIkpTT04iLCJwYXJzZSIsImRlcGVuZGVuY3kiLCJkZXBlbmRlbmN5QnJhbmNoIiwiYnJhbmNoZXMiLCJ3cml0ZUZpbGVTeW5jIiwic3RyaW5naWZ5IiwiZGVwbG95UmVsZWFzZUNhbmRpZGF0ZXMiLCJpc1JlYWR5Rm9yUmVsZWFzZUNhbmRpZGF0ZSIsInZlcnNpb24iLCJkZXBsb3lQcm9kdWN0aW9uIiwiaXNSZWFkeUZvclByb2R1Y3Rpb24iLCJ1cGRhdGVDaGVja291dHMiLCJvcHRpb25zIiwibWVyZ2UiLCJjb25jdXJyZW50IiwidHJhbnNwaWxlIiwiYnVpbGRPcHRpb25zIiwibGludCIsImZpbHRlcmVkQnJhbmNoZXMiLCJ4IiwiYXN5bmNGdW5jdGlvbnMiLCJ1cGRhdGVDaGVja291dCIsInBhcmFsbGVsTGltaXQiLCJjaGVja1VuYnVpbHRDaGVja291dHMiLCJ1bmJ1aWx0UmVzdWx0IiwiY2hlY2tVbmJ1aWx0IiwiY2hlY2tCdWlsdENoZWNrb3V0cyIsImJ1aWx0UmVzdWx0IiwiY2hlY2tCdWlsdCIsInJlZGVwbG95QWxsUHJvZHVjdGlvbiIsImZpbHRlclJlcG8iLCJjaGVja1VucmVsZWFzZWRCcmFuY2hlcyIsImZvcmNlQ2FjaGVCcmVhayIsImxvYWRBbGxNYWludGVuYW5jZUJyYW5jaGVzIiwiZ2V0QWxsTWFpbnRlbmFuY2VCcmFuY2hlcyIsInNlcmlhbGl6ZSIsImRlc2VyaWFsaXplIiwiZGVzZXJpYWxpemVkUGF0Y2hlcyIsInNvcnQiLCJhIiwiYiIsImRlc2VyaWFsaXplZFJlbGVhc2VCcmFuY2hlcyIsInN0YXJ0UkVQTCIsIlByb21pc2UiLCJyZXNvbHZlIiwicmVqZWN0IiwidHJhbnNwb3J0cyIsImxldmVsIiwic2Vzc2lvbiIsInN0YXJ0IiwicHJvbXB0IiwidXNlQ29sb3JzIiwicmVwbE1vZGUiLCJSRVBMX01PREVfU1RSSUNUIiwiaWdub3JlVW5kZWZpbmVkIiwibm9kZUV2YWwiLCJldmFsIiwiY21kIiwiY29udGV4dCIsImNhbGxiYWNrIiwicmVzdWx0IiwidGhlbiIsInZhbCIsImNhdGNoIiwic3RhY2siLCJlcnJvciIsImRlZmluZVByb3BlcnR5IiwiZ2xvYmFsIiwiZ2V0Iiwic2V0IiwidmFsdWUiLCJtIiwiTSIsInJiIiwib24iLCJmaW5kIiwicCIsImVycm9ySWZNaXNzaW5nIiwicmVsZWFzZSIsImlzVW51c2VkIiwiY29uc3RydWN0b3IiLCJBcnJheSIsImlzQXJyYXkiLCJmb3JFYWNoIl0sIm1hcHBpbmdzIjoiQUFBQSxpREFBaUQ7QUFFakQ7Ozs7Q0FJQzs7Ozs7Ozs7Ozs7Ozs7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