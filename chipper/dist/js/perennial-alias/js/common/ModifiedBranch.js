// Copyright 2018, University of Colorado Boulder
/**
 * Represents a modified simulation release branch, with either pending or applied (and not published) changes.
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
const Patch = require('./Patch');
const ReleaseBranch = require('./ReleaseBranch');
const SimVersion = require('../browser-and-node/SimVersion').default;
const checkoutDependencies = require('./checkoutDependencies');
const getDependencies = require('./getDependencies');
const gitCheckout = require('./gitCheckout');
const gitPull = require('./gitPull');
const githubCreateIssue = require('./githubCreateIssue');
const assert = require('assert');
module.exports = function() {
    let ModifiedBranch = class ModifiedBranch {
        /**
     * Convert into a plain JS object meant for JSON serialization.
     * @public
     *
     * @returns {Object}
     */ serialize() {
            return {
                releaseBranch: this.releaseBranch.serialize(),
                changedDependencies: this.changedDependencies,
                neededPatches: this.neededPatches.map((patch)=>patch.name),
                pendingMessages: this.pendingMessages,
                pushedMessages: this.pushedMessages,
                deployedVersion: this.deployedVersion ? this.deployedVersion.serialize() : null
            };
        }
        /**
     * Takes a serialized form of the ModifiedBranch and returns an actual instance.
     * @public
     *
     * @param {Object}
     * @param {Array.<Patch>} - We only want to store patches in one location, so don't fully save the info.
     * @returns {ModifiedBranch}
     */ static deserialize({ releaseBranch, changedDependencies, neededPatches, pendingMessages, pushedMessages, deployedVersion }, patches) {
            return new ModifiedBranch(ReleaseBranch.deserialize(releaseBranch), changedDependencies, neededPatches.map((name)=>patches.find((patch)=>patch.name === name)), pendingMessages, pushedMessages, deployedVersion ? SimVersion.deserialize(deployedVersion) : null);
        }
        /**
     * Whether there is no need to keep a reference to us.
     * @public
     *
     * @returns {boolean}
     */ get isUnused() {
            return this.neededPatches.length === 0 && Object.keys(this.changedDependencies).length === 0 && this.pushedMessages.length === 0 && this.pendingMessages.length === 0;
        }
        /**
     * Whether it is safe to deploy a release candidate for this branch.
     * @public
     *
     * @returns {boolean}
     */ get isReadyForReleaseCandidate() {
            return this.neededPatches.length === 0 && this.pushedMessages.length > 0 && this.deployedVersion === null;
        }
        /**
     * Whether it is safe to deploy a production version for this branch.
     * @public
     *
     * @returns {boolean}
     */ get isReadyForProduction() {
            return this.neededPatches.length === 0 && this.pushedMessages.length > 0 && this.deployedVersion !== null && this.deployedVersion.testType === 'rc';
        }
        /**
     * Returns the branch name that should be used in dependency repositories.
     * @public
     *
     * @returns {string}
     */ get dependencyBranch() {
            return `${this.repo}-${this.branch}`;
        }
        /**
     * Creates an issue to note that un-tested changes were patched into a branch, and should at some point be tested.
     * @public
     *
     * @param {string} [additionalNotes]
     */ createUnreleasedIssue(additionalNotes = '') {
            var _this = this;
            return _async_to_generator(function*() {
                yield githubCreateIssue(_this.repo, `Maintenance patches applied to branch ${_this.branch}`, {
                    labels: [
                        'status:ready-for-qa'
                    ],
                    body: `This branch (${_this.branch}) had changes related to the following applied:

${_this.pushedMessages.map((message)=>`- ${message}`).join('\n')}

Presumably one or more of these changes is likely to have been applied after the last RC version, and should be spot-checked by QA in the next RC (or if it was ready for a production release, an additional spot-check RC should be created).
${additionalNotes ? `\n${additionalNotes}` : ''}`
                });
            })();
        }
        /**
     * Returns a list of deployed links for testing (depending on the brands deployed).
     * @public
     *
     * @param {boolean} [includeMessages]
     * @returns {Promise.<Array.<string>>}
     */ getDeployedLinkLines(includeMessages = true) {
            var _this = this;
            return _async_to_generator(function*() {
                assert(_this.deployedVersion !== null);
                const linkSuffixes = [];
                const versionString = _this.deployedVersion.toString();
                const standaloneParams = yield _this.releaseBranch.getPhetioStandaloneQueryParameter();
                const proxiesParams = (yield _this.releaseBranch.usesRelativeSimPath()) ? 'relativeSimPath' : 'launchLocalVersion';
                const studioName = _this.brands.includes('phet-io') && (yield _this.releaseBranch.usesPhetioStudio()) ? 'studio' : 'instance-proxies';
                const studioNameBeautified = studioName === 'studio' ? 'Studio' : 'Instance Proxies';
                const usesChipper2 = yield _this.releaseBranch.usesChipper2();
                const phetFolder = usesChipper2 ? '/phet' : '';
                const phetioFolder = usesChipper2 ? '/phet-io' : '';
                const phetSuffix = usesChipper2 ? '_phet' : '';
                const phetioSuffix = usesChipper2 ? '_all_phet-io' : '_en-phetio';
                const phetioBrandSuffix = usesChipper2 ? '' : '-phetio';
                const studioPathSuffix = (yield _this.releaseBranch.usesPhetioStudioIndex()) ? '' : `/${studioName}.html?sim=${_this.repo}&${proxiesParams}`;
                const phetioDevVersion = usesChipper2 ? versionString : versionString.split('-').join('-phetio');
                if (_this.deployedVersion.testType === 'rc') {
                    if (_this.brands.includes('phet')) {
                        linkSuffixes.push(`](https://phet-dev.colorado.edu/html/${_this.repo}/${versionString}${phetFolder}/${_this.repo}_all${phetSuffix}.html)`);
                    }
                    if (_this.brands.includes('phet-io')) {
                        linkSuffixes.push(` phet-io](https://phet-dev.colorado.edu/html/${_this.repo}/${phetioDevVersion}${phetioFolder}/${_this.repo}${phetioSuffix}.html?${standaloneParams})`);
                        linkSuffixes.push(` phet-io ${studioNameBeautified}](https://phet-dev.colorado.edu/html/${_this.repo}/${phetioDevVersion}${phetioFolder}/wrappers/${studioName}${studioPathSuffix})`);
                    }
                } else {
                    if (_this.brands.includes('phet')) {
                        linkSuffixes.push(`](https://phet.colorado.edu/sims/html/${_this.repo}/${versionString}/${_this.repo}_all.html)`);
                    }
                    if (_this.brands.includes('phet-io')) {
                        linkSuffixes.push(` phet-io](https://phet-io.colorado.edu/sims/${_this.repo}/${versionString}${phetioBrandSuffix}/${_this.repo}${phetioSuffix}.html?${standaloneParams})`);
                        linkSuffixes.push(` phet-io ${studioNameBeautified}](https://phet-io.colorado.edu/sims/${_this.repo}/${versionString}${phetioBrandSuffix}/wrappers/${studioName}${studioPathSuffix})`);
                    }
                }
                const results = linkSuffixes.map((link)=>`- [ ] [${_this.repo} ${versionString}${link}`);
                if (includeMessages) {
                    results.unshift(`\n**${_this.repo} ${_this.branch}** (${_this.pushedMessages.join(', ')})\n`);
                }
                return results;
            })();
        }
        /**
     * Checks out the modified branch.
     * @public
     *
     * @param {boolean} [includeNpmUpdate]
     * @returns {Promise.<Array.<string>>} - Names of checked out repositories
     */ checkout(includeNpmUpdate = true) {
            var _this = this;
            return _async_to_generator(function*() {
                yield gitCheckout(_this.repo, _this.branch);
                yield gitPull(_this.repo);
                const dependencies = yield getDependencies(_this.repo);
                for (const key of Object.keys(_this.changedDependencies)){
                    // This should exist hopefully
                    dependencies[key].sha = _this.changedDependencies[key];
                }
                return checkoutDependencies(_this.repo, dependencies, includeNpmUpdate);
            })();
        }
        /**
     * @public
     * @constructor
     *
     * @param {ReleaseBranch} releaseBranch
     * @param {Object} [changedDependencies]
     * @param {Array.<Patch>} [neededPatches]
     * @param {Array.<string>} [pendingMessages]
     * @param {Array.<string>} [pushedMessages]
     * @param {SimVersion|null} [deployedVersion]
     */ constructor(releaseBranch, changedDependencies = {}, neededPatches = [], pendingMessages = [], pushedMessages = [], deployedVersion = null){
            assert(releaseBranch instanceof ReleaseBranch);
            assert(typeof changedDependencies === 'object');
            assert(Array.isArray(neededPatches));
            neededPatches.forEach((patch)=>assert(patch instanceof Patch));
            assert(Array.isArray(pushedMessages));
            pushedMessages.forEach((message)=>assert(typeof message === 'string'));
            assert(deployedVersion === null || deployedVersion instanceof SimVersion);
            // @public {ReleaseBranch}
            this.releaseBranch = releaseBranch;
            // @public {Object} - Keys are repo names, values are SHAs
            this.changedDependencies = changedDependencies;
            // @public {Array.<Patch>}
            this.neededPatches = neededPatches;
            // @public {Array.<string>} - Messages from already-applied patches or other changes NOT included in dependencies.json yet
            this.pendingMessages = pendingMessages;
            // @public {Array.<string>} - Messages from already-applied patches or other changes that have been included in dependencies.json
            this.pushedMessages = pushedMessages;
            // @public {string}
            this.repo = releaseBranch.repo;
            this.branch = releaseBranch.branch;
            // @public {Array.<string>}
            this.brands = releaseBranch.brands;
            // @public {SimVersion|null} - The deployed version for the latest patches applied. Will be reset to null when
            // updates are made.
            this.deployedVersion = deployedVersion;
        }
    };
    return ModifiedBranch;
}();

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3BlcmVubmlhbC1hbGlhcy9qcy9jb21tb24vTW9kaWZpZWRCcmFuY2guanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTgsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIFJlcHJlc2VudHMgYSBtb2RpZmllZCBzaW11bGF0aW9uIHJlbGVhc2UgYnJhbmNoLCB3aXRoIGVpdGhlciBwZW5kaW5nIG9yIGFwcGxpZWQgKGFuZCBub3QgcHVibGlzaGVkKSBjaGFuZ2VzLlxuICpcbiAqIEBhdXRob3IgSm9uYXRoYW4gT2xzb24gPGpvbmF0aGFuLm9sc29uQGNvbG9yYWRvLmVkdT5cbiAqL1xuXG5jb25zdCBQYXRjaCA9IHJlcXVpcmUoICcuL1BhdGNoJyApO1xuY29uc3QgUmVsZWFzZUJyYW5jaCA9IHJlcXVpcmUoICcuL1JlbGVhc2VCcmFuY2gnICk7XG5jb25zdCBTaW1WZXJzaW9uID0gcmVxdWlyZSggJy4uL2Jyb3dzZXItYW5kLW5vZGUvU2ltVmVyc2lvbicgKS5kZWZhdWx0O1xuY29uc3QgY2hlY2tvdXREZXBlbmRlbmNpZXMgPSByZXF1aXJlKCAnLi9jaGVja291dERlcGVuZGVuY2llcycgKTtcbmNvbnN0IGdldERlcGVuZGVuY2llcyA9IHJlcXVpcmUoICcuL2dldERlcGVuZGVuY2llcycgKTtcbmNvbnN0IGdpdENoZWNrb3V0ID0gcmVxdWlyZSggJy4vZ2l0Q2hlY2tvdXQnICk7XG5jb25zdCBnaXRQdWxsID0gcmVxdWlyZSggJy4vZ2l0UHVsbCcgKTtcbmNvbnN0IGdpdGh1YkNyZWF0ZUlzc3VlID0gcmVxdWlyZSggJy4vZ2l0aHViQ3JlYXRlSXNzdWUnICk7XG5jb25zdCBhc3NlcnQgPSByZXF1aXJlKCAnYXNzZXJ0JyApO1xuXG5tb2R1bGUuZXhwb3J0cyA9ICggZnVuY3Rpb24oKSB7XG5cbiAgY2xhc3MgTW9kaWZpZWRCcmFuY2gge1xuICAgIC8qKlxuICAgICAqIEBwdWJsaWNcbiAgICAgKiBAY29uc3RydWN0b3JcbiAgICAgKlxuICAgICAqIEBwYXJhbSB7UmVsZWFzZUJyYW5jaH0gcmVsZWFzZUJyYW5jaFxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBbY2hhbmdlZERlcGVuZGVuY2llc11cbiAgICAgKiBAcGFyYW0ge0FycmF5LjxQYXRjaD59IFtuZWVkZWRQYXRjaGVzXVxuICAgICAqIEBwYXJhbSB7QXJyYXkuPHN0cmluZz59IFtwZW5kaW5nTWVzc2FnZXNdXG4gICAgICogQHBhcmFtIHtBcnJheS48c3RyaW5nPn0gW3B1c2hlZE1lc3NhZ2VzXVxuICAgICAqIEBwYXJhbSB7U2ltVmVyc2lvbnxudWxsfSBbZGVwbG95ZWRWZXJzaW9uXVxuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKCByZWxlYXNlQnJhbmNoLCBjaGFuZ2VkRGVwZW5kZW5jaWVzID0ge30sIG5lZWRlZFBhdGNoZXMgPSBbXSwgcGVuZGluZ01lc3NhZ2VzID0gW10sIHB1c2hlZE1lc3NhZ2VzID0gW10sIGRlcGxveWVkVmVyc2lvbiA9IG51bGwgKSB7XG4gICAgICBhc3NlcnQoIHJlbGVhc2VCcmFuY2ggaW5zdGFuY2VvZiBSZWxlYXNlQnJhbmNoICk7XG4gICAgICBhc3NlcnQoIHR5cGVvZiBjaGFuZ2VkRGVwZW5kZW5jaWVzID09PSAnb2JqZWN0JyApO1xuICAgICAgYXNzZXJ0KCBBcnJheS5pc0FycmF5KCBuZWVkZWRQYXRjaGVzICkgKTtcbiAgICAgIG5lZWRlZFBhdGNoZXMuZm9yRWFjaCggcGF0Y2ggPT4gYXNzZXJ0KCBwYXRjaCBpbnN0YW5jZW9mIFBhdGNoICkgKTtcbiAgICAgIGFzc2VydCggQXJyYXkuaXNBcnJheSggcHVzaGVkTWVzc2FnZXMgKSApO1xuICAgICAgcHVzaGVkTWVzc2FnZXMuZm9yRWFjaCggbWVzc2FnZSA9PiBhc3NlcnQoIHR5cGVvZiBtZXNzYWdlID09PSAnc3RyaW5nJyApICk7XG4gICAgICBhc3NlcnQoIGRlcGxveWVkVmVyc2lvbiA9PT0gbnVsbCB8fCBkZXBsb3llZFZlcnNpb24gaW5zdGFuY2VvZiBTaW1WZXJzaW9uICk7XG5cbiAgICAgIC8vIEBwdWJsaWMge1JlbGVhc2VCcmFuY2h9XG4gICAgICB0aGlzLnJlbGVhc2VCcmFuY2ggPSByZWxlYXNlQnJhbmNoO1xuXG4gICAgICAvLyBAcHVibGljIHtPYmplY3R9IC0gS2V5cyBhcmUgcmVwbyBuYW1lcywgdmFsdWVzIGFyZSBTSEFzXG4gICAgICB0aGlzLmNoYW5nZWREZXBlbmRlbmNpZXMgPSBjaGFuZ2VkRGVwZW5kZW5jaWVzO1xuXG4gICAgICAvLyBAcHVibGljIHtBcnJheS48UGF0Y2g+fVxuICAgICAgdGhpcy5uZWVkZWRQYXRjaGVzID0gbmVlZGVkUGF0Y2hlcztcblxuICAgICAgLy8gQHB1YmxpYyB7QXJyYXkuPHN0cmluZz59IC0gTWVzc2FnZXMgZnJvbSBhbHJlYWR5LWFwcGxpZWQgcGF0Y2hlcyBvciBvdGhlciBjaGFuZ2VzIE5PVCBpbmNsdWRlZCBpbiBkZXBlbmRlbmNpZXMuanNvbiB5ZXRcbiAgICAgIHRoaXMucGVuZGluZ01lc3NhZ2VzID0gcGVuZGluZ01lc3NhZ2VzO1xuXG4gICAgICAvLyBAcHVibGljIHtBcnJheS48c3RyaW5nPn0gLSBNZXNzYWdlcyBmcm9tIGFscmVhZHktYXBwbGllZCBwYXRjaGVzIG9yIG90aGVyIGNoYW5nZXMgdGhhdCBoYXZlIGJlZW4gaW5jbHVkZWQgaW4gZGVwZW5kZW5jaWVzLmpzb25cbiAgICAgIHRoaXMucHVzaGVkTWVzc2FnZXMgPSBwdXNoZWRNZXNzYWdlcztcblxuICAgICAgLy8gQHB1YmxpYyB7c3RyaW5nfVxuICAgICAgdGhpcy5yZXBvID0gcmVsZWFzZUJyYW5jaC5yZXBvO1xuICAgICAgdGhpcy5icmFuY2ggPSByZWxlYXNlQnJhbmNoLmJyYW5jaDtcblxuICAgICAgLy8gQHB1YmxpYyB7QXJyYXkuPHN0cmluZz59XG4gICAgICB0aGlzLmJyYW5kcyA9IHJlbGVhc2VCcmFuY2guYnJhbmRzO1xuXG4gICAgICAvLyBAcHVibGljIHtTaW1WZXJzaW9ufG51bGx9IC0gVGhlIGRlcGxveWVkIHZlcnNpb24gZm9yIHRoZSBsYXRlc3QgcGF0Y2hlcyBhcHBsaWVkLiBXaWxsIGJlIHJlc2V0IHRvIG51bGwgd2hlblxuICAgICAgLy8gdXBkYXRlcyBhcmUgbWFkZS5cbiAgICAgIHRoaXMuZGVwbG95ZWRWZXJzaW9uID0gZGVwbG95ZWRWZXJzaW9uO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENvbnZlcnQgaW50byBhIHBsYWluIEpTIG9iamVjdCBtZWFudCBmb3IgSlNPTiBzZXJpYWxpemF0aW9uLlxuICAgICAqIEBwdWJsaWNcbiAgICAgKlxuICAgICAqIEByZXR1cm5zIHtPYmplY3R9XG4gICAgICovXG4gICAgc2VyaWFsaXplKCkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgcmVsZWFzZUJyYW5jaDogdGhpcy5yZWxlYXNlQnJhbmNoLnNlcmlhbGl6ZSgpLFxuICAgICAgICBjaGFuZ2VkRGVwZW5kZW5jaWVzOiB0aGlzLmNoYW5nZWREZXBlbmRlbmNpZXMsXG4gICAgICAgIG5lZWRlZFBhdGNoZXM6IHRoaXMubmVlZGVkUGF0Y2hlcy5tYXAoIHBhdGNoID0+IHBhdGNoLm5hbWUgKSxcbiAgICAgICAgcGVuZGluZ01lc3NhZ2VzOiB0aGlzLnBlbmRpbmdNZXNzYWdlcyxcbiAgICAgICAgcHVzaGVkTWVzc2FnZXM6IHRoaXMucHVzaGVkTWVzc2FnZXMsXG4gICAgICAgIGRlcGxveWVkVmVyc2lvbjogdGhpcy5kZXBsb3llZFZlcnNpb24gPyB0aGlzLmRlcGxveWVkVmVyc2lvbi5zZXJpYWxpemUoKSA6IG51bGxcbiAgICAgIH07XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogVGFrZXMgYSBzZXJpYWxpemVkIGZvcm0gb2YgdGhlIE1vZGlmaWVkQnJhbmNoIGFuZCByZXR1cm5zIGFuIGFjdHVhbCBpbnN0YW5jZS5cbiAgICAgKiBAcHVibGljXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge09iamVjdH1cbiAgICAgKiBAcGFyYW0ge0FycmF5LjxQYXRjaD59IC0gV2Ugb25seSB3YW50IHRvIHN0b3JlIHBhdGNoZXMgaW4gb25lIGxvY2F0aW9uLCBzbyBkb24ndCBmdWxseSBzYXZlIHRoZSBpbmZvLlxuICAgICAqIEByZXR1cm5zIHtNb2RpZmllZEJyYW5jaH1cbiAgICAgKi9cbiAgICBzdGF0aWMgZGVzZXJpYWxpemUoIHsgcmVsZWFzZUJyYW5jaCwgY2hhbmdlZERlcGVuZGVuY2llcywgbmVlZGVkUGF0Y2hlcywgcGVuZGluZ01lc3NhZ2VzLCBwdXNoZWRNZXNzYWdlcywgZGVwbG95ZWRWZXJzaW9uIH0sIHBhdGNoZXMgKSB7XG4gICAgICByZXR1cm4gbmV3IE1vZGlmaWVkQnJhbmNoKFxuICAgICAgICBSZWxlYXNlQnJhbmNoLmRlc2VyaWFsaXplKCByZWxlYXNlQnJhbmNoICksXG4gICAgICAgIGNoYW5nZWREZXBlbmRlbmNpZXMsXG4gICAgICAgIG5lZWRlZFBhdGNoZXMubWFwKCBuYW1lID0+IHBhdGNoZXMuZmluZCggcGF0Y2ggPT4gcGF0Y2gubmFtZSA9PT0gbmFtZSApICksXG4gICAgICAgIHBlbmRpbmdNZXNzYWdlcyxcbiAgICAgICAgcHVzaGVkTWVzc2FnZXMsXG4gICAgICAgIGRlcGxveWVkVmVyc2lvbiA/IFNpbVZlcnNpb24uZGVzZXJpYWxpemUoIGRlcGxveWVkVmVyc2lvbiApIDogbnVsbFxuICAgICAgKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBXaGV0aGVyIHRoZXJlIGlzIG5vIG5lZWQgdG8ga2VlcCBhIHJlZmVyZW5jZSB0byB1cy5cbiAgICAgKiBAcHVibGljXG4gICAgICpcbiAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAgICAgKi9cbiAgICBnZXQgaXNVbnVzZWQoKSB7XG4gICAgICByZXR1cm4gdGhpcy5uZWVkZWRQYXRjaGVzLmxlbmd0aCA9PT0gMCAmJlxuICAgICAgICAgICAgIE9iamVjdC5rZXlzKCB0aGlzLmNoYW5nZWREZXBlbmRlbmNpZXMgKS5sZW5ndGggPT09IDAgJiZcbiAgICAgICAgICAgICB0aGlzLnB1c2hlZE1lc3NhZ2VzLmxlbmd0aCA9PT0gMCAmJlxuICAgICAgICAgICAgIHRoaXMucGVuZGluZ01lc3NhZ2VzLmxlbmd0aCA9PT0gMDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBXaGV0aGVyIGl0IGlzIHNhZmUgdG8gZGVwbG95IGEgcmVsZWFzZSBjYW5kaWRhdGUgZm9yIHRoaXMgYnJhbmNoLlxuICAgICAqIEBwdWJsaWNcbiAgICAgKlxuICAgICAqIEByZXR1cm5zIHtib29sZWFufVxuICAgICAqL1xuICAgIGdldCBpc1JlYWR5Rm9yUmVsZWFzZUNhbmRpZGF0ZSgpIHtcbiAgICAgIHJldHVybiB0aGlzLm5lZWRlZFBhdGNoZXMubGVuZ3RoID09PSAwICYmXG4gICAgICAgICAgICAgdGhpcy5wdXNoZWRNZXNzYWdlcy5sZW5ndGggPiAwICYmXG4gICAgICAgICAgICAgdGhpcy5kZXBsb3llZFZlcnNpb24gPT09IG51bGw7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogV2hldGhlciBpdCBpcyBzYWZlIHRvIGRlcGxveSBhIHByb2R1Y3Rpb24gdmVyc2lvbiBmb3IgdGhpcyBicmFuY2guXG4gICAgICogQHB1YmxpY1xuICAgICAqXG4gICAgICogQHJldHVybnMge2Jvb2xlYW59XG4gICAgICovXG4gICAgZ2V0IGlzUmVhZHlGb3JQcm9kdWN0aW9uKCkge1xuICAgICAgcmV0dXJuIHRoaXMubmVlZGVkUGF0Y2hlcy5sZW5ndGggPT09IDAgJiZcbiAgICAgICAgICAgICB0aGlzLnB1c2hlZE1lc3NhZ2VzLmxlbmd0aCA+IDAgJiZcbiAgICAgICAgICAgICB0aGlzLmRlcGxveWVkVmVyc2lvbiAhPT0gbnVsbCAmJlxuICAgICAgICAgICAgIHRoaXMuZGVwbG95ZWRWZXJzaW9uLnRlc3RUeXBlID09PSAncmMnO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJldHVybnMgdGhlIGJyYW5jaCBuYW1lIHRoYXQgc2hvdWxkIGJlIHVzZWQgaW4gZGVwZW5kZW5jeSByZXBvc2l0b3JpZXMuXG4gICAgICogQHB1YmxpY1xuICAgICAqXG4gICAgICogQHJldHVybnMge3N0cmluZ31cbiAgICAgKi9cbiAgICBnZXQgZGVwZW5kZW5jeUJyYW5jaCgpIHtcbiAgICAgIHJldHVybiBgJHt0aGlzLnJlcG99LSR7dGhpcy5icmFuY2h9YDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDcmVhdGVzIGFuIGlzc3VlIHRvIG5vdGUgdGhhdCB1bi10ZXN0ZWQgY2hhbmdlcyB3ZXJlIHBhdGNoZWQgaW50byBhIGJyYW5jaCwgYW5kIHNob3VsZCBhdCBzb21lIHBvaW50IGJlIHRlc3RlZC5cbiAgICAgKiBAcHVibGljXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gW2FkZGl0aW9uYWxOb3Rlc11cbiAgICAgKi9cbiAgICBhc3luYyBjcmVhdGVVbnJlbGVhc2VkSXNzdWUoIGFkZGl0aW9uYWxOb3RlcyA9ICcnICkge1xuICAgICAgYXdhaXQgZ2l0aHViQ3JlYXRlSXNzdWUoIHRoaXMucmVwbywgYE1haW50ZW5hbmNlIHBhdGNoZXMgYXBwbGllZCB0byBicmFuY2ggJHt0aGlzLmJyYW5jaH1gLCB7XG4gICAgICAgIGxhYmVsczogWyAnc3RhdHVzOnJlYWR5LWZvci1xYScgXSxcbiAgICAgICAgYm9keTogYFRoaXMgYnJhbmNoICgke3RoaXMuYnJhbmNofSkgaGFkIGNoYW5nZXMgcmVsYXRlZCB0byB0aGUgZm9sbG93aW5nIGFwcGxpZWQ6XG5cbiR7dGhpcy5wdXNoZWRNZXNzYWdlcy5tYXAoIG1lc3NhZ2UgPT4gYC0gJHttZXNzYWdlfWAgKS5qb2luKCAnXFxuJyApfVxuXG5QcmVzdW1hYmx5IG9uZSBvciBtb3JlIG9mIHRoZXNlIGNoYW5nZXMgaXMgbGlrZWx5IHRvIGhhdmUgYmVlbiBhcHBsaWVkIGFmdGVyIHRoZSBsYXN0IFJDIHZlcnNpb24sIGFuZCBzaG91bGQgYmUgc3BvdC1jaGVja2VkIGJ5IFFBIGluIHRoZSBuZXh0IFJDIChvciBpZiBpdCB3YXMgcmVhZHkgZm9yIGEgcHJvZHVjdGlvbiByZWxlYXNlLCBhbiBhZGRpdGlvbmFsIHNwb3QtY2hlY2sgUkMgc2hvdWxkIGJlIGNyZWF0ZWQpLlxuJHthZGRpdGlvbmFsTm90ZXMgPyBgXFxuJHthZGRpdGlvbmFsTm90ZXN9YCA6ICcnfWBcbiAgICAgIH0gKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIGEgbGlzdCBvZiBkZXBsb3llZCBsaW5rcyBmb3IgdGVzdGluZyAoZGVwZW5kaW5nIG9uIHRoZSBicmFuZHMgZGVwbG95ZWQpLlxuICAgICAqIEBwdWJsaWNcbiAgICAgKlxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gW2luY2x1ZGVNZXNzYWdlc11cbiAgICAgKiBAcmV0dXJucyB7UHJvbWlzZS48QXJyYXkuPHN0cmluZz4+fVxuICAgICAqL1xuICAgIGFzeW5jIGdldERlcGxveWVkTGlua0xpbmVzKCBpbmNsdWRlTWVzc2FnZXMgPSB0cnVlICkge1xuICAgICAgYXNzZXJ0KCB0aGlzLmRlcGxveWVkVmVyc2lvbiAhPT0gbnVsbCApO1xuXG4gICAgICBjb25zdCBsaW5rU3VmZml4ZXMgPSBbXTtcbiAgICAgIGNvbnN0IHZlcnNpb25TdHJpbmcgPSB0aGlzLmRlcGxveWVkVmVyc2lvbi50b1N0cmluZygpO1xuXG4gICAgICBjb25zdCBzdGFuZGFsb25lUGFyYW1zID0gYXdhaXQgdGhpcy5yZWxlYXNlQnJhbmNoLmdldFBoZXRpb1N0YW5kYWxvbmVRdWVyeVBhcmFtZXRlcigpO1xuICAgICAgY29uc3QgcHJveGllc1BhcmFtcyA9ICggYXdhaXQgdGhpcy5yZWxlYXNlQnJhbmNoLnVzZXNSZWxhdGl2ZVNpbVBhdGgoKSApID8gJ3JlbGF0aXZlU2ltUGF0aCcgOiAnbGF1bmNoTG9jYWxWZXJzaW9uJztcbiAgICAgIGNvbnN0IHN0dWRpb05hbWUgPSAoIHRoaXMuYnJhbmRzLmluY2x1ZGVzKCAncGhldC1pbycgKSAmJiBhd2FpdCB0aGlzLnJlbGVhc2VCcmFuY2gudXNlc1BoZXRpb1N0dWRpbygpICkgPyAnc3R1ZGlvJyA6ICdpbnN0YW5jZS1wcm94aWVzJztcbiAgICAgIGNvbnN0IHN0dWRpb05hbWVCZWF1dGlmaWVkID0gc3R1ZGlvTmFtZSA9PT0gJ3N0dWRpbycgPyAnU3R1ZGlvJyA6ICdJbnN0YW5jZSBQcm94aWVzJztcbiAgICAgIGNvbnN0IHVzZXNDaGlwcGVyMiA9IGF3YWl0IHRoaXMucmVsZWFzZUJyYW5jaC51c2VzQ2hpcHBlcjIoKTtcbiAgICAgIGNvbnN0IHBoZXRGb2xkZXIgPSB1c2VzQ2hpcHBlcjIgPyAnL3BoZXQnIDogJyc7XG4gICAgICBjb25zdCBwaGV0aW9Gb2xkZXIgPSB1c2VzQ2hpcHBlcjIgPyAnL3BoZXQtaW8nIDogJyc7XG4gICAgICBjb25zdCBwaGV0U3VmZml4ID0gdXNlc0NoaXBwZXIyID8gJ19waGV0JyA6ICcnO1xuICAgICAgY29uc3QgcGhldGlvU3VmZml4ID0gdXNlc0NoaXBwZXIyID8gJ19hbGxfcGhldC1pbycgOiAnX2VuLXBoZXRpbyc7XG4gICAgICBjb25zdCBwaGV0aW9CcmFuZFN1ZmZpeCA9IHVzZXNDaGlwcGVyMiA/ICcnIDogJy1waGV0aW8nO1xuICAgICAgY29uc3Qgc3R1ZGlvUGF0aFN1ZmZpeCA9ICggYXdhaXQgdGhpcy5yZWxlYXNlQnJhbmNoLnVzZXNQaGV0aW9TdHVkaW9JbmRleCgpICkgPyAnJyA6IGAvJHtzdHVkaW9OYW1lfS5odG1sP3NpbT0ke3RoaXMucmVwb30mJHtwcm94aWVzUGFyYW1zfWA7XG4gICAgICBjb25zdCBwaGV0aW9EZXZWZXJzaW9uID0gdXNlc0NoaXBwZXIyID8gdmVyc2lvblN0cmluZyA6IHZlcnNpb25TdHJpbmcuc3BsaXQoICctJyApLmpvaW4oICctcGhldGlvJyApO1xuXG4gICAgICBpZiAoIHRoaXMuZGVwbG95ZWRWZXJzaW9uLnRlc3RUeXBlID09PSAncmMnICkge1xuICAgICAgICBpZiAoIHRoaXMuYnJhbmRzLmluY2x1ZGVzKCAncGhldCcgKSApIHtcbiAgICAgICAgICBsaW5rU3VmZml4ZXMucHVzaCggYF0oaHR0cHM6Ly9waGV0LWRldi5jb2xvcmFkby5lZHUvaHRtbC8ke3RoaXMucmVwb30vJHt2ZXJzaW9uU3RyaW5nfSR7cGhldEZvbGRlcn0vJHt0aGlzLnJlcG99X2FsbCR7cGhldFN1ZmZpeH0uaHRtbClgICk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCB0aGlzLmJyYW5kcy5pbmNsdWRlcyggJ3BoZXQtaW8nICkgKSB7XG4gICAgICAgICAgbGlua1N1ZmZpeGVzLnB1c2goIGAgcGhldC1pb10oaHR0cHM6Ly9waGV0LWRldi5jb2xvcmFkby5lZHUvaHRtbC8ke3RoaXMucmVwb30vJHtwaGV0aW9EZXZWZXJzaW9ufSR7cGhldGlvRm9sZGVyfS8ke3RoaXMucmVwb30ke3BoZXRpb1N1ZmZpeH0uaHRtbD8ke3N0YW5kYWxvbmVQYXJhbXN9KWAgKTtcbiAgICAgICAgICBsaW5rU3VmZml4ZXMucHVzaCggYCBwaGV0LWlvICR7c3R1ZGlvTmFtZUJlYXV0aWZpZWR9XShodHRwczovL3BoZXQtZGV2LmNvbG9yYWRvLmVkdS9odG1sLyR7dGhpcy5yZXBvfS8ke3BoZXRpb0RldlZlcnNpb259JHtwaGV0aW9Gb2xkZXJ9L3dyYXBwZXJzLyR7c3R1ZGlvTmFtZX0ke3N0dWRpb1BhdGhTdWZmaXh9KWAgKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgIGlmICggdGhpcy5icmFuZHMuaW5jbHVkZXMoICdwaGV0JyApICkge1xuICAgICAgICAgIGxpbmtTdWZmaXhlcy5wdXNoKCBgXShodHRwczovL3BoZXQuY29sb3JhZG8uZWR1L3NpbXMvaHRtbC8ke3RoaXMucmVwb30vJHt2ZXJzaW9uU3RyaW5nfS8ke3RoaXMucmVwb31fYWxsLmh0bWwpYCApO1xuICAgICAgICB9XG4gICAgICAgIGlmICggdGhpcy5icmFuZHMuaW5jbHVkZXMoICdwaGV0LWlvJyApICkge1xuICAgICAgICAgIGxpbmtTdWZmaXhlcy5wdXNoKCBgIHBoZXQtaW9dKGh0dHBzOi8vcGhldC1pby5jb2xvcmFkby5lZHUvc2ltcy8ke3RoaXMucmVwb30vJHt2ZXJzaW9uU3RyaW5nfSR7cGhldGlvQnJhbmRTdWZmaXh9LyR7dGhpcy5yZXBvfSR7cGhldGlvU3VmZml4fS5odG1sPyR7c3RhbmRhbG9uZVBhcmFtc30pYCApO1xuICAgICAgICAgIGxpbmtTdWZmaXhlcy5wdXNoKCBgIHBoZXQtaW8gJHtzdHVkaW9OYW1lQmVhdXRpZmllZH1dKGh0dHBzOi8vcGhldC1pby5jb2xvcmFkby5lZHUvc2ltcy8ke3RoaXMucmVwb30vJHt2ZXJzaW9uU3RyaW5nfSR7cGhldGlvQnJhbmRTdWZmaXh9L3dyYXBwZXJzLyR7c3R1ZGlvTmFtZX0ke3N0dWRpb1BhdGhTdWZmaXh9KWAgKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBjb25zdCByZXN1bHRzID0gbGlua1N1ZmZpeGVzLm1hcCggbGluayA9PiBgLSBbIF0gWyR7dGhpcy5yZXBvfSAke3ZlcnNpb25TdHJpbmd9JHtsaW5rfWAgKTtcbiAgICAgIGlmICggaW5jbHVkZU1lc3NhZ2VzICkge1xuICAgICAgICByZXN1bHRzLnVuc2hpZnQoIGBcXG4qKiR7dGhpcy5yZXBvfSAke3RoaXMuYnJhbmNofSoqICgke3RoaXMucHVzaGVkTWVzc2FnZXMuam9pbiggJywgJyApfSlcXG5gICk7XG4gICAgICB9XG4gICAgICByZXR1cm4gcmVzdWx0cztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDaGVja3Mgb3V0IHRoZSBtb2RpZmllZCBicmFuY2guXG4gICAgICogQHB1YmxpY1xuICAgICAqXG4gICAgICogQHBhcmFtIHtib29sZWFufSBbaW5jbHVkZU5wbVVwZGF0ZV1cbiAgICAgKiBAcmV0dXJucyB7UHJvbWlzZS48QXJyYXkuPHN0cmluZz4+fSAtIE5hbWVzIG9mIGNoZWNrZWQgb3V0IHJlcG9zaXRvcmllc1xuICAgICAqL1xuICAgIGFzeW5jIGNoZWNrb3V0KCBpbmNsdWRlTnBtVXBkYXRlID0gdHJ1ZSApIHtcbiAgICAgIGF3YWl0IGdpdENoZWNrb3V0KCB0aGlzLnJlcG8sIHRoaXMuYnJhbmNoICk7XG4gICAgICBhd2FpdCBnaXRQdWxsKCB0aGlzLnJlcG8gKTtcbiAgICAgIGNvbnN0IGRlcGVuZGVuY2llcyA9IGF3YWl0IGdldERlcGVuZGVuY2llcyggdGhpcy5yZXBvICk7XG4gICAgICBmb3IgKCBjb25zdCBrZXkgb2YgT2JqZWN0LmtleXMoIHRoaXMuY2hhbmdlZERlcGVuZGVuY2llcyApICkge1xuICAgICAgICAvLyBUaGlzIHNob3VsZCBleGlzdCBob3BlZnVsbHlcbiAgICAgICAgZGVwZW5kZW5jaWVzWyBrZXkgXS5zaGEgPSB0aGlzLmNoYW5nZWREZXBlbmRlbmNpZXNbIGtleSBdO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGNoZWNrb3V0RGVwZW5kZW5jaWVzKCB0aGlzLnJlcG8sIGRlcGVuZGVuY2llcywgaW5jbHVkZU5wbVVwZGF0ZSApO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBNb2RpZmllZEJyYW5jaDtcbn0gKSgpOyJdLCJuYW1lcyI6WyJQYXRjaCIsInJlcXVpcmUiLCJSZWxlYXNlQnJhbmNoIiwiU2ltVmVyc2lvbiIsImRlZmF1bHQiLCJjaGVja291dERlcGVuZGVuY2llcyIsImdldERlcGVuZGVuY2llcyIsImdpdENoZWNrb3V0IiwiZ2l0UHVsbCIsImdpdGh1YkNyZWF0ZUlzc3VlIiwiYXNzZXJ0IiwibW9kdWxlIiwiZXhwb3J0cyIsIk1vZGlmaWVkQnJhbmNoIiwic2VyaWFsaXplIiwicmVsZWFzZUJyYW5jaCIsImNoYW5nZWREZXBlbmRlbmNpZXMiLCJuZWVkZWRQYXRjaGVzIiwibWFwIiwicGF0Y2giLCJuYW1lIiwicGVuZGluZ01lc3NhZ2VzIiwicHVzaGVkTWVzc2FnZXMiLCJkZXBsb3llZFZlcnNpb24iLCJkZXNlcmlhbGl6ZSIsInBhdGNoZXMiLCJmaW5kIiwiaXNVbnVzZWQiLCJsZW5ndGgiLCJPYmplY3QiLCJrZXlzIiwiaXNSZWFkeUZvclJlbGVhc2VDYW5kaWRhdGUiLCJpc1JlYWR5Rm9yUHJvZHVjdGlvbiIsInRlc3RUeXBlIiwiZGVwZW5kZW5jeUJyYW5jaCIsInJlcG8iLCJicmFuY2giLCJjcmVhdGVVbnJlbGVhc2VkSXNzdWUiLCJhZGRpdGlvbmFsTm90ZXMiLCJsYWJlbHMiLCJib2R5IiwibWVzc2FnZSIsImpvaW4iLCJnZXREZXBsb3llZExpbmtMaW5lcyIsImluY2x1ZGVNZXNzYWdlcyIsImxpbmtTdWZmaXhlcyIsInZlcnNpb25TdHJpbmciLCJ0b1N0cmluZyIsInN0YW5kYWxvbmVQYXJhbXMiLCJnZXRQaGV0aW9TdGFuZGFsb25lUXVlcnlQYXJhbWV0ZXIiLCJwcm94aWVzUGFyYW1zIiwidXNlc1JlbGF0aXZlU2ltUGF0aCIsInN0dWRpb05hbWUiLCJicmFuZHMiLCJpbmNsdWRlcyIsInVzZXNQaGV0aW9TdHVkaW8iLCJzdHVkaW9OYW1lQmVhdXRpZmllZCIsInVzZXNDaGlwcGVyMiIsInBoZXRGb2xkZXIiLCJwaGV0aW9Gb2xkZXIiLCJwaGV0U3VmZml4IiwicGhldGlvU3VmZml4IiwicGhldGlvQnJhbmRTdWZmaXgiLCJzdHVkaW9QYXRoU3VmZml4IiwidXNlc1BoZXRpb1N0dWRpb0luZGV4IiwicGhldGlvRGV2VmVyc2lvbiIsInNwbGl0IiwicHVzaCIsInJlc3VsdHMiLCJsaW5rIiwidW5zaGlmdCIsImNoZWNrb3V0IiwiaW5jbHVkZU5wbVVwZGF0ZSIsImRlcGVuZGVuY2llcyIsImtleSIsInNoYSIsImNvbnN0cnVjdG9yIiwiQXJyYXkiLCJpc0FycmF5IiwiZm9yRWFjaCJdLCJtYXBwaW5ncyI6IkFBQUEsaURBQWlEO0FBRWpEOzs7O0NBSUM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBRUQsTUFBTUEsUUFBUUMsUUFBUztBQUN2QixNQUFNQyxnQkFBZ0JELFFBQVM7QUFDL0IsTUFBTUUsYUFBYUYsUUFBUyxrQ0FBbUNHLE9BQU87QUFDdEUsTUFBTUMsdUJBQXVCSixRQUFTO0FBQ3RDLE1BQU1LLGtCQUFrQkwsUUFBUztBQUNqQyxNQUFNTSxjQUFjTixRQUFTO0FBQzdCLE1BQU1PLFVBQVVQLFFBQVM7QUFDekIsTUFB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