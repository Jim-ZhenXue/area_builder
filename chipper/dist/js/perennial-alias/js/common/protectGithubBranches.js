// Copyright 2021, University of Colorado Boulder
/**
 * Sets branch protection rules for the provided list of repositories. The default branch protection rules prevent
 * deletion of the branch. There are other things you can do with branch protection rules but we decided not to
 * apply them at this time. See https://github.com/phetsims/special-ops/issues/197 for more information.
 *
 * See https://docs.github.com/en/graphql/reference/input-objects#createbranchprotectionruleinput for documentation
 * of what you can do with protection rules.
 *
 * If rules for the protected patterns already exist they will be deleted and replaced so they can be easily updated.
 *
 * USAGE:
 * protectGithubBranches.protectBranches( [ "my-first-repo", "my-second-repo" ] );
 *
 * of
 *
 * protectGithubBranches.clearBranchProtections( [ "my-first-repo", "my-second-repo" ] );
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
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
const https = require('https');
const buildLocal = require('./buildLocal');
// protects main, and all branche used in production deploys
const BRANCH_NAME_PATTERNS = [
    'main',
    '*[0-9].[0-9]*'
];
// Options for the https request to the github graphql server
const options = {
    hostname: 'api.github.com',
    path: '/graphql',
    method: 'POST',
    headers: {
        Authorization: `Bearer ${buildLocal.developerGithubAccessToken}`,
        'Content-Type': 'application/json',
        'user-agent': 'node.js'
    }
};
/**
 * Creates the GraphQL query string to get the existing branch protection rules for the provided repo name under
 * the phetsims project.
 *
 * @param {string} repositoryName
 * @returns {string}
 */ const createBranchProtectionRuleQueryData = (repositoryName)=>{
    return createQueryData(`query BranchProtectionRule {
    repository(owner: "phetsims", name: "${repositoryName}") { 
      branchProtectionRules(first: 100) { 
        nodes {
          # pattern for the rule 
          pattern,
          
          # uniqueID for the rule assigned by github, required to request deletion
          id
        }
      }
    } }`);
};
/**
 * Gets the GraphQL query string that will delete an existing branch protection rule. Use
 * createBranchProtectionRuleQueryData to get the unique IDs for each rule.
 *
 * @param ruleId
 * @returns {string}
 */ const createDeleteBranchProtectionRuleMutationData = (ruleId)=>{
    return createQueryData(`mutation {
    deleteBranchProtectionRule(input:{branchProtectionRuleId: "${ruleId}"} ) {
      clientMutationId
    }
  }`);
};
/**
 * Creates the data string that requests the creation of a new github branch protection rule using a GraphQL query and
 * sent with an HTTPS request. The default rule prevents branch deletion. There are other things that can be
 * constrained or protected for the branch, but we decided not to apply anything else at this time.
 * See https://docs.github.com/en/graphql/reference/input-objects#createbranchprotectionruleinput for list
 * of things you can do with rules.
 *
 * @param {string} repositoryId - Unique ID for the repo, see createRepositoryIdQueryData()
 * @param {string} namePattern - pattern for the rule, all branches matching with fnmatch will be protected
 * @returns {string}
 */ const createRepositoryRuleMutationData = (repositoryId, namePattern)=>{
    return createQueryData(`mutation {
    createBranchProtectionRule(input: {
      pattern: "${namePattern}",
      allowsDeletions: false,
  
      repositoryId: "${repositoryId}"
    } )
    
    # I think this specifies the data returned after the server receives the mutation request, not used but required
    # to send the mutation
    {
      branchProtectionRule {
        pattern
      }
    }
    }`);
};
/**
 * Creates the data string that requests the unique ID of a github repository using a GraphQL query sent with an
 * HTTPS request.
 *
 * @param {string} repositoryName - Name of the phetsims repository
 * @returns {string}
 */ const createRepositoryIdQueryData = (repositoryName)=>{
    return createQueryData(`query { repository(owner: "phetsims", name: "${repositoryName}") { id } }`);
};
/**
 * Wraps a query string with additional formatting so that it can be used in a GraphQL query sent with https.
 *
 * @param {string} queryString
 * @returns {string}
 */ const createQueryData = (queryString)=>{
    return JSON.stringify({
        query: queryString
    });
};
/**
 * Gets an error message from a JSON response. Just grabs the first error message if there are multiple.
 * @param jsonResponse - JSON response object from github. Errors are in a .errors array.
 * @returns {*|string}
 */ const getErrorMessage = (jsonResponse)=>{
    if (jsonResponse.errors) {
        return jsonResponse.errors[0].message;
    } else {
        return 'No data returned';
    }
};
function getRepositoryId(repositoryName) {
    return _getRepositoryId.apply(this, arguments);
}
function _getRepositoryId() {
    _getRepositoryId = /**
 * Returns the unique ID of the provided phetsims repository.
 * @param {string} repositoryName
 * @returns {Promise<string>}
 */ _async_to_generator(function*(repositoryName) {
        const handleJSONResponse = (jsonResponse)=>{
            if (!jsonResponse.data || jsonResponse.data.repository === null) {
                throw new Error(`${getErrorMessage(jsonResponse)} Make sure developerGithubAccessToken in build-local.json may be incorrect or expired.`);
            }
            return jsonResponse.data.repository.id;
        };
        return sendPromisedHttpsRequest(createRepositoryIdQueryData(repositoryName), handleJSONResponse);
    });
    return _getRepositoryId.apply(this, arguments);
}
function getExistingBranchProtectionRules(repositoryName) {
    return _getExistingBranchProtectionRules.apply(this, arguments);
}
function _getExistingBranchProtectionRules() {
    _getExistingBranchProtectionRules = /**
 * Returns an array of objects, one for each existing branch protection rule for the repository, that has
 * the protection rule pattern and the unique ID for the rule assigned by github.
 *
 * @param {string} repositoryName
 * @returns {Promise<*[]>} - array of nodes with key value pairs of { "pattern": string, "id": string }
 */ _async_to_generator(function*(repositoryName) {
        const handleJSONResponse = (jsonResponse)=>{
            if (jsonResponse.errors) {
                throw new Error(getErrorMessage(jsonResponse));
            }
            if (!jsonResponse.data) {
                throw new Error(`No data returned by getExistingBranchProtectionRules for repo ${repositoryName}`);
            }
            return jsonResponse.data.repository.branchProtectionRules.nodes;
        };
        return sendPromisedHttpsRequest(createBranchProtectionRuleQueryData(repositoryName), handleJSONResponse);
    });
    return _getExistingBranchProtectionRules.apply(this, arguments);
}
function writeProtectionRule(repositoryId, namePattern) {
    return _writeProtectionRule.apply(this, arguments);
}
function _writeProtectionRule() {
    _writeProtectionRule = /**
 * Creates the protection rule for all branches matching the namePattern for the phetsims repository with the provided
 * unique ID assigned by github.
 *
 * @param {string} repositoryId - unique ID for the repository, use getRepositoryId to get this
 * @param {string} namePattern - The pattern for the rule using fnmatch
 * @returns {Promise<Object>}
 */ _async_to_generator(function*(repositoryId, namePattern) {
        const handleJSONResponse = (jsonResponse)=>{
            if (jsonResponse.errors) {
                throw new Error(getErrorMessage(jsonResponse));
            }
        };
        return sendPromisedHttpsRequest(createRepositoryRuleMutationData(repositoryId, namePattern), handleJSONResponse);
    });
    return _writeProtectionRule.apply(this, arguments);
}
function deleteExistingProtectionRule(ruleId, namePattern, repositoryName) {
    return _deleteExistingProtectionRule.apply(this, arguments);
}
function _deleteExistingProtectionRule() {
    _deleteExistingProtectionRule = /**
 * Deletes an existing rule. We assume that that by running this we want to overwrite the existing rule.
 *
 * @param {string} ruleId
 * @param {string} namePattern
 * @param {string} repositoryName
 * @returns {Promise<Object>}
 */ _async_to_generator(function*(ruleId, namePattern, repositoryName) {
        const handleJSONResponse = (jsonResponse)=>{
            if (jsonResponse.errors) {
                throw new Error(getErrorMessage(jsonResponse));
            } else {
                console.log(`Deleted existing branch protection rule ${namePattern} for repo ${repositoryName}`);
            }
        };
        return sendPromisedHttpsRequest(createDeleteBranchProtectionRuleMutationData(ruleId), handleJSONResponse);
    });
    return _deleteExistingProtectionRule.apply(this, arguments);
}
function deleteMatchingProtectionRules(rules, namePattern, repositoryName) {
    return _deleteMatchingProtectionRules.apply(this, arguments);
}
function _deleteMatchingProtectionRules() {
    _deleteMatchingProtectionRules = /**
 * An async function that will delete all existing rules that match the provided namePattern for the repository.
 * Wrapped in a Promise so we can wait to write new rules until the existing rules are removed. If you try to
 * write over an existing rule without removing it github will respond with an error.
 *
 * @param {*[]} rules
 * @param {string} namePattern
 * @param {string} repositoryName
 * @returns {Promise<unknown[]>}
 */ _async_to_generator(function*(rules, namePattern, repositoryName) {
        const promises = [];
        rules.forEach((rule)=>{
            // only delete rules that match the new pattern we want to protect
            if (rule.pattern === namePattern) {
                promises.push(deleteExistingProtectionRule(rule.id, namePattern, repositoryName));
            }
        });
        return Promise.all(promises);
    });
    return _deleteMatchingProtectionRules.apply(this, arguments);
}
function sendPromisedHttpsRequest(queryData, handle) {
    return _sendPromisedHttpsRequest.apply(this, arguments);
}
function _sendPromisedHttpsRequest() {
    _sendPromisedHttpsRequest = /**
 * Sends a request to github's GraphQL server to query or mutate repository data.
 *
 * @param {string} queryData - the string sent with https
 * @param {function(Object)} handle - handles the JSON response from github
 * @returns {Promise<unknown>}
 */ _async_to_generator(function*(queryData, handle) {
        return new Promise((resolve, reject)=>{
            const request = https.request(options, (response)=>{
                let responseBody = '';
                response.on('data', (d)=>{
                    responseBody += d;
                });
                response.on('end', ()=>{
                    const jsonResponse = JSON.parse(responseBody);
                    try {
                        const resolveValue = handle(jsonResponse);
                        resolve(resolveValue);
                    } catch (error) {
                        reject(error);
                    }
                });
            });
            request.on('error', (error)=>{
                console.error(error);
            });
            request.write(queryData);
            request.end();
        });
    });
    return _sendPromisedHttpsRequest.apply(this, arguments);
}
function clearBranchProtections(repositories) {
    return _clearBranchProtections.apply(this, arguments);
}
function _clearBranchProtections() {
    _clearBranchProtections = /**
 * Clear protections for the branches that PhET wants to protect.
 */ _async_to_generator(function*(repositories) {
        for (const repositoryName of repositories){
            for (const namePattern of BRANCH_NAME_PATTERNS){
                try {
                    const branchProtectionRules = yield getExistingBranchProtectionRules(repositoryName);
                    yield deleteMatchingProtectionRules(branchProtectionRules, namePattern, repositoryName);
                } catch (error) {
                    console.log(`Error clearing github protection rule ${namePattern} for ${repositoryName}`);
                }
            }
        }
    });
    return _clearBranchProtections.apply(this, arguments);
}
function protectBranches(repositories) {
    return _protectBranches.apply(this, arguments);
}
function _protectBranches() {
    _protectBranches = /**
 * Apply branch protection rules to prodcution branches (main, release branches).
 */ _async_to_generator(function*(repositories) {
        // remove any trailing '/' from the repository names, which may have been added by auto complete
        const cleanedRepositories = repositories.map((repository)=>repository.replace(/\/$/, ''));
        // if the rule for the protected branch already exists, delete it - we assume that running this again means we
        // want to update rules for each namePattern
        yield clearBranchProtections(cleanedRepositories);
        for (const repositoryName of cleanedRepositories){
            // get the unique ID for each repository
            const repositoryId = yield getRepositoryId(repositoryName);
            for (const namePattern of BRANCH_NAME_PATTERNS){
                try {
                    yield writeProtectionRule(repositoryId, namePattern);
                    console.log(`${namePattern} protection rule set for ${repositoryName}`);
                } catch (error) {
                    console.log(`Error writing ${namePattern} rule for repo ${repositoryName}:`);
                    console.log(error);
                    console.log('\n');
                }
            }
        }
    });
    return _protectBranches.apply(this, arguments);
}
module.exports = {
    protectBranches: protectBranches,
    clearBranchProtections: clearBranchProtections
};

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3BlcmVubmlhbC1hbGlhcy9qcy9jb21tb24vcHJvdGVjdEdpdGh1YkJyYW5jaGVzLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDIxLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuLyoqXG4gKiBTZXRzIGJyYW5jaCBwcm90ZWN0aW9uIHJ1bGVzIGZvciB0aGUgcHJvdmlkZWQgbGlzdCBvZiByZXBvc2l0b3JpZXMuIFRoZSBkZWZhdWx0IGJyYW5jaCBwcm90ZWN0aW9uIHJ1bGVzIHByZXZlbnRcbiAqIGRlbGV0aW9uIG9mIHRoZSBicmFuY2guIFRoZXJlIGFyZSBvdGhlciB0aGluZ3MgeW91IGNhbiBkbyB3aXRoIGJyYW5jaCBwcm90ZWN0aW9uIHJ1bGVzIGJ1dCB3ZSBkZWNpZGVkIG5vdCB0b1xuICogYXBwbHkgdGhlbSBhdCB0aGlzIHRpbWUuIFNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvc3BlY2lhbC1vcHMvaXNzdWVzLzE5NyBmb3IgbW9yZSBpbmZvcm1hdGlvbi5cbiAqXG4gKiBTZWUgaHR0cHM6Ly9kb2NzLmdpdGh1Yi5jb20vZW4vZ3JhcGhxbC9yZWZlcmVuY2UvaW5wdXQtb2JqZWN0cyNjcmVhdGVicmFuY2hwcm90ZWN0aW9ucnVsZWlucHV0IGZvciBkb2N1bWVudGF0aW9uXG4gKiBvZiB3aGF0IHlvdSBjYW4gZG8gd2l0aCBwcm90ZWN0aW9uIHJ1bGVzLlxuICpcbiAqIElmIHJ1bGVzIGZvciB0aGUgcHJvdGVjdGVkIHBhdHRlcm5zIGFscmVhZHkgZXhpc3QgdGhleSB3aWxsIGJlIGRlbGV0ZWQgYW5kIHJlcGxhY2VkIHNvIHRoZXkgY2FuIGJlIGVhc2lseSB1cGRhdGVkLlxuICpcbiAqIFVTQUdFOlxuICogcHJvdGVjdEdpdGh1YkJyYW5jaGVzLnByb3RlY3RCcmFuY2hlcyggWyBcIm15LWZpcnN0LXJlcG9cIiwgXCJteS1zZWNvbmQtcmVwb1wiIF0gKTtcbiAqXG4gKiBvZlxuICpcbiAqIHByb3RlY3RHaXRodWJCcmFuY2hlcy5jbGVhckJyYW5jaFByb3RlY3Rpb25zKCBbIFwibXktZmlyc3QtcmVwb1wiLCBcIm15LXNlY29uZC1yZXBvXCIgXSApO1xuICpcbiAqIEBhdXRob3IgSmVzc2UgR3JlZW5iZXJnIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxuICovXG5cbmNvbnN0IGh0dHBzID0gcmVxdWlyZSggJ2h0dHBzJyApO1xuY29uc3QgYnVpbGRMb2NhbCA9IHJlcXVpcmUoICcuL2J1aWxkTG9jYWwnICk7XG5cbi8vIHByb3RlY3RzIG1haW4sIGFuZCBhbGwgYnJhbmNoZSB1c2VkIGluIHByb2R1Y3Rpb24gZGVwbG95c1xuY29uc3QgQlJBTkNIX05BTUVfUEFUVEVSTlMgPSBbICdtYWluJywgJypbMC05XS5bMC05XSonIF07XG5cbi8vIE9wdGlvbnMgZm9yIHRoZSBodHRwcyByZXF1ZXN0IHRvIHRoZSBnaXRodWIgZ3JhcGhxbCBzZXJ2ZXJcbmNvbnN0IG9wdGlvbnMgPSB7XG4gIGhvc3RuYW1lOiAnYXBpLmdpdGh1Yi5jb20nLFxuICBwYXRoOiAnL2dyYXBocWwnLFxuICBtZXRob2Q6ICdQT1NUJyxcbiAgaGVhZGVyczoge1xuICAgIEF1dGhvcml6YXRpb246IGBCZWFyZXIgJHtidWlsZExvY2FsLmRldmVsb3BlckdpdGh1YkFjY2Vzc1Rva2VufWAsXG4gICAgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi9qc29uJyxcbiAgICAndXNlci1hZ2VudCc6ICdub2RlLmpzJ1xuICB9XG59O1xuXG4vKipcbiAqIENyZWF0ZXMgdGhlIEdyYXBoUUwgcXVlcnkgc3RyaW5nIHRvIGdldCB0aGUgZXhpc3RpbmcgYnJhbmNoIHByb3RlY3Rpb24gcnVsZXMgZm9yIHRoZSBwcm92aWRlZCByZXBvIG5hbWUgdW5kZXJcbiAqIHRoZSBwaGV0c2ltcyBwcm9qZWN0LlxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSByZXBvc2l0b3J5TmFtZVxuICogQHJldHVybnMge3N0cmluZ31cbiAqL1xuY29uc3QgY3JlYXRlQnJhbmNoUHJvdGVjdGlvblJ1bGVRdWVyeURhdGEgPSByZXBvc2l0b3J5TmFtZSA9PiB7XG4gIHJldHVybiBjcmVhdGVRdWVyeURhdGEoIGBxdWVyeSBCcmFuY2hQcm90ZWN0aW9uUnVsZSB7XG4gICAgcmVwb3NpdG9yeShvd25lcjogXCJwaGV0c2ltc1wiLCBuYW1lOiBcIiR7cmVwb3NpdG9yeU5hbWV9XCIpIHsgXG4gICAgICBicmFuY2hQcm90ZWN0aW9uUnVsZXMoZmlyc3Q6IDEwMCkgeyBcbiAgICAgICAgbm9kZXMge1xuICAgICAgICAgICMgcGF0dGVybiBmb3IgdGhlIHJ1bGUgXG4gICAgICAgICAgcGF0dGVybixcbiAgICAgICAgICBcbiAgICAgICAgICAjIHVuaXF1ZUlEIGZvciB0aGUgcnVsZSBhc3NpZ25lZCBieSBnaXRodWIsIHJlcXVpcmVkIHRvIHJlcXVlc3QgZGVsZXRpb25cbiAgICAgICAgICBpZFxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSB9YFxuICApO1xufTtcblxuLyoqXG4gKiBHZXRzIHRoZSBHcmFwaFFMIHF1ZXJ5IHN0cmluZyB0aGF0IHdpbGwgZGVsZXRlIGFuIGV4aXN0aW5nIGJyYW5jaCBwcm90ZWN0aW9uIHJ1bGUuIFVzZVxuICogY3JlYXRlQnJhbmNoUHJvdGVjdGlvblJ1bGVRdWVyeURhdGEgdG8gZ2V0IHRoZSB1bmlxdWUgSURzIGZvciBlYWNoIHJ1bGUuXG4gKlxuICogQHBhcmFtIHJ1bGVJZFxuICogQHJldHVybnMge3N0cmluZ31cbiAqL1xuY29uc3QgY3JlYXRlRGVsZXRlQnJhbmNoUHJvdGVjdGlvblJ1bGVNdXRhdGlvbkRhdGEgPSBydWxlSWQgPT4ge1xuICByZXR1cm4gY3JlYXRlUXVlcnlEYXRhKCBgbXV0YXRpb24ge1xuICAgIGRlbGV0ZUJyYW5jaFByb3RlY3Rpb25SdWxlKGlucHV0OnticmFuY2hQcm90ZWN0aW9uUnVsZUlkOiBcIiR7cnVsZUlkfVwifSApIHtcbiAgICAgIGNsaWVudE11dGF0aW9uSWRcbiAgICB9XG4gIH1gICk7XG59O1xuXG4vKipcbiAqIENyZWF0ZXMgdGhlIGRhdGEgc3RyaW5nIHRoYXQgcmVxdWVzdHMgdGhlIGNyZWF0aW9uIG9mIGEgbmV3IGdpdGh1YiBicmFuY2ggcHJvdGVjdGlvbiBydWxlIHVzaW5nIGEgR3JhcGhRTCBxdWVyeSBhbmRcbiAqIHNlbnQgd2l0aCBhbiBIVFRQUyByZXF1ZXN0LiBUaGUgZGVmYXVsdCBydWxlIHByZXZlbnRzIGJyYW5jaCBkZWxldGlvbi4gVGhlcmUgYXJlIG90aGVyIHRoaW5ncyB0aGF0IGNhbiBiZVxuICogY29uc3RyYWluZWQgb3IgcHJvdGVjdGVkIGZvciB0aGUgYnJhbmNoLCBidXQgd2UgZGVjaWRlZCBub3QgdG8gYXBwbHkgYW55dGhpbmcgZWxzZSBhdCB0aGlzIHRpbWUuXG4gKiBTZWUgaHR0cHM6Ly9kb2NzLmdpdGh1Yi5jb20vZW4vZ3JhcGhxbC9yZWZlcmVuY2UvaW5wdXQtb2JqZWN0cyNjcmVhdGVicmFuY2hwcm90ZWN0aW9ucnVsZWlucHV0IGZvciBsaXN0XG4gKiBvZiB0aGluZ3MgeW91IGNhbiBkbyB3aXRoIHJ1bGVzLlxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSByZXBvc2l0b3J5SWQgLSBVbmlxdWUgSUQgZm9yIHRoZSByZXBvLCBzZWUgY3JlYXRlUmVwb3NpdG9yeUlkUXVlcnlEYXRhKClcbiAqIEBwYXJhbSB7c3RyaW5nfSBuYW1lUGF0dGVybiAtIHBhdHRlcm4gZm9yIHRoZSBydWxlLCBhbGwgYnJhbmNoZXMgbWF0Y2hpbmcgd2l0aCBmbm1hdGNoIHdpbGwgYmUgcHJvdGVjdGVkXG4gKiBAcmV0dXJucyB7c3RyaW5nfVxuICovXG5jb25zdCBjcmVhdGVSZXBvc2l0b3J5UnVsZU11dGF0aW9uRGF0YSA9ICggcmVwb3NpdG9yeUlkLCBuYW1lUGF0dGVybiApID0+IHtcbiAgcmV0dXJuIGNyZWF0ZVF1ZXJ5RGF0YSggYG11dGF0aW9uIHtcbiAgICBjcmVhdGVCcmFuY2hQcm90ZWN0aW9uUnVsZShpbnB1dDoge1xuICAgICAgcGF0dGVybjogXCIke25hbWVQYXR0ZXJufVwiLFxuICAgICAgYWxsb3dzRGVsZXRpb25zOiBmYWxzZSxcbiAgXG4gICAgICByZXBvc2l0b3J5SWQ6IFwiJHtyZXBvc2l0b3J5SWR9XCJcbiAgICB9IClcbiAgICBcbiAgICAjIEkgdGhpbmsgdGhpcyBzcGVjaWZpZXMgdGhlIGRhdGEgcmV0dXJuZWQgYWZ0ZXIgdGhlIHNlcnZlciByZWNlaXZlcyB0aGUgbXV0YXRpb24gcmVxdWVzdCwgbm90IHVzZWQgYnV0IHJlcXVpcmVkXG4gICAgIyB0byBzZW5kIHRoZSBtdXRhdGlvblxuICAgIHtcbiAgICAgIGJyYW5jaFByb3RlY3Rpb25SdWxlIHtcbiAgICAgICAgcGF0dGVyblxuICAgICAgfVxuICAgIH1cbiAgICB9YCApO1xufTtcblxuLyoqXG4gKiBDcmVhdGVzIHRoZSBkYXRhIHN0cmluZyB0aGF0IHJlcXVlc3RzIHRoZSB1bmlxdWUgSUQgb2YgYSBnaXRodWIgcmVwb3NpdG9yeSB1c2luZyBhIEdyYXBoUUwgcXVlcnkgc2VudCB3aXRoIGFuXG4gKiBIVFRQUyByZXF1ZXN0LlxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSByZXBvc2l0b3J5TmFtZSAtIE5hbWUgb2YgdGhlIHBoZXRzaW1zIHJlcG9zaXRvcnlcbiAqIEByZXR1cm5zIHtzdHJpbmd9XG4gKi9cbmNvbnN0IGNyZWF0ZVJlcG9zaXRvcnlJZFF1ZXJ5RGF0YSA9IHJlcG9zaXRvcnlOYW1lID0+IHtcbiAgcmV0dXJuIGNyZWF0ZVF1ZXJ5RGF0YSggYHF1ZXJ5IHsgcmVwb3NpdG9yeShvd25lcjogXCJwaGV0c2ltc1wiLCBuYW1lOiBcIiR7cmVwb3NpdG9yeU5hbWV9XCIpIHsgaWQgfSB9YCApO1xufTtcblxuLyoqXG4gKiBXcmFwcyBhIHF1ZXJ5IHN0cmluZyB3aXRoIGFkZGl0aW9uYWwgZm9ybWF0dGluZyBzbyB0aGF0IGl0IGNhbiBiZSB1c2VkIGluIGEgR3JhcGhRTCBxdWVyeSBzZW50IHdpdGggaHR0cHMuXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IHF1ZXJ5U3RyaW5nXG4gKiBAcmV0dXJucyB7c3RyaW5nfVxuICovXG5jb25zdCBjcmVhdGVRdWVyeURhdGEgPSBxdWVyeVN0cmluZyA9PiB7XG4gIHJldHVybiBKU09OLnN0cmluZ2lmeSgge1xuICAgIHF1ZXJ5OiBxdWVyeVN0cmluZ1xuICB9ICk7XG59O1xuXG4vKipcbiAqIEdldHMgYW4gZXJyb3IgbWVzc2FnZSBmcm9tIGEgSlNPTiByZXNwb25zZS4gSnVzdCBncmFicyB0aGUgZmlyc3QgZXJyb3IgbWVzc2FnZSBpZiB0aGVyZSBhcmUgbXVsdGlwbGUuXG4gKiBAcGFyYW0ganNvblJlc3BvbnNlIC0gSlNPTiByZXNwb25zZSBvYmplY3QgZnJvbSBnaXRodWIuIEVycm9ycyBhcmUgaW4gYSAuZXJyb3JzIGFycmF5LlxuICogQHJldHVybnMgeyp8c3RyaW5nfVxuICovXG5jb25zdCBnZXRFcnJvck1lc3NhZ2UgPSBqc29uUmVzcG9uc2UgPT4ge1xuICBpZiAoIGpzb25SZXNwb25zZS5lcnJvcnMgKSB7XG4gICAgcmV0dXJuIGpzb25SZXNwb25zZS5lcnJvcnNbIDAgXS5tZXNzYWdlO1xuICB9XG4gIGVsc2Uge1xuICAgIHJldHVybiAnTm8gZGF0YSByZXR1cm5lZCc7XG4gIH1cbn07XG5cbi8qKlxuICogUmV0dXJucyB0aGUgdW5pcXVlIElEIG9mIHRoZSBwcm92aWRlZCBwaGV0c2ltcyByZXBvc2l0b3J5LlxuICogQHBhcmFtIHtzdHJpbmd9IHJlcG9zaXRvcnlOYW1lXG4gKiBAcmV0dXJucyB7UHJvbWlzZTxzdHJpbmc+fVxuICovXG5hc3luYyBmdW5jdGlvbiBnZXRSZXBvc2l0b3J5SWQoIHJlcG9zaXRvcnlOYW1lICkge1xuICBjb25zdCBoYW5kbGVKU09OUmVzcG9uc2UgPSBqc29uUmVzcG9uc2UgPT4ge1xuICAgIGlmICggIWpzb25SZXNwb25zZS5kYXRhIHx8IGpzb25SZXNwb25zZS5kYXRhLnJlcG9zaXRvcnkgPT09IG51bGwgKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoIGAke2dldEVycm9yTWVzc2FnZSgganNvblJlc3BvbnNlICl9IE1ha2Ugc3VyZSBkZXZlbG9wZXJHaXRodWJBY2Nlc3NUb2tlbiBpbiBidWlsZC1sb2NhbC5qc29uIG1heSBiZSBpbmNvcnJlY3Qgb3IgZXhwaXJlZC5gICk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGpzb25SZXNwb25zZS5kYXRhLnJlcG9zaXRvcnkuaWQ7XG4gIH07XG5cbiAgcmV0dXJuIHNlbmRQcm9taXNlZEh0dHBzUmVxdWVzdCggY3JlYXRlUmVwb3NpdG9yeUlkUXVlcnlEYXRhKCByZXBvc2l0b3J5TmFtZSApLCBoYW5kbGVKU09OUmVzcG9uc2UgKTtcbn1cblxuLyoqXG4gKiBSZXR1cm5zIGFuIGFycmF5IG9mIG9iamVjdHMsIG9uZSBmb3IgZWFjaCBleGlzdGluZyBicmFuY2ggcHJvdGVjdGlvbiBydWxlIGZvciB0aGUgcmVwb3NpdG9yeSwgdGhhdCBoYXNcbiAqIHRoZSBwcm90ZWN0aW9uIHJ1bGUgcGF0dGVybiBhbmQgdGhlIHVuaXF1ZSBJRCBmb3IgdGhlIHJ1bGUgYXNzaWduZWQgYnkgZ2l0aHViLlxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSByZXBvc2l0b3J5TmFtZVxuICogQHJldHVybnMge1Byb21pc2U8KltdPn0gLSBhcnJheSBvZiBub2RlcyB3aXRoIGtleSB2YWx1ZSBwYWlycyBvZiB7IFwicGF0dGVyblwiOiBzdHJpbmcsIFwiaWRcIjogc3RyaW5nIH1cbiAqL1xuYXN5bmMgZnVuY3Rpb24gZ2V0RXhpc3RpbmdCcmFuY2hQcm90ZWN0aW9uUnVsZXMoIHJlcG9zaXRvcnlOYW1lICkge1xuICBjb25zdCBoYW5kbGVKU09OUmVzcG9uc2UgPSBqc29uUmVzcG9uc2UgPT4ge1xuICAgIGlmICgganNvblJlc3BvbnNlLmVycm9ycyApIHtcbiAgICAgIHRocm93IG5ldyBFcnJvciggZ2V0RXJyb3JNZXNzYWdlKCBqc29uUmVzcG9uc2UgKSApO1xuICAgIH1cbiAgICBpZiAoICFqc29uUmVzcG9uc2UuZGF0YSApIHtcbiAgICAgIHRocm93IG5ldyBFcnJvciggYE5vIGRhdGEgcmV0dXJuZWQgYnkgZ2V0RXhpc3RpbmdCcmFuY2hQcm90ZWN0aW9uUnVsZXMgZm9yIHJlcG8gJHtyZXBvc2l0b3J5TmFtZX1gICk7XG4gICAgfVxuICAgIHJldHVybiBqc29uUmVzcG9uc2UuZGF0YS5yZXBvc2l0b3J5LmJyYW5jaFByb3RlY3Rpb25SdWxlcy5ub2RlcztcbiAgfTtcblxuICByZXR1cm4gc2VuZFByb21pc2VkSHR0cHNSZXF1ZXN0KCBjcmVhdGVCcmFuY2hQcm90ZWN0aW9uUnVsZVF1ZXJ5RGF0YSggcmVwb3NpdG9yeU5hbWUgKSwgaGFuZGxlSlNPTlJlc3BvbnNlICk7XG59XG5cbi8qKlxuICogQ3JlYXRlcyB0aGUgcHJvdGVjdGlvbiBydWxlIGZvciBhbGwgYnJhbmNoZXMgbWF0Y2hpbmcgdGhlIG5hbWVQYXR0ZXJuIGZvciB0aGUgcGhldHNpbXMgcmVwb3NpdG9yeSB3aXRoIHRoZSBwcm92aWRlZFxuICogdW5pcXVlIElEIGFzc2lnbmVkIGJ5IGdpdGh1Yi5cbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gcmVwb3NpdG9yeUlkIC0gdW5pcXVlIElEIGZvciB0aGUgcmVwb3NpdG9yeSwgdXNlIGdldFJlcG9zaXRvcnlJZCB0byBnZXQgdGhpc1xuICogQHBhcmFtIHtzdHJpbmd9IG5hbWVQYXR0ZXJuIC0gVGhlIHBhdHRlcm4gZm9yIHRoZSBydWxlIHVzaW5nIGZubWF0Y2hcbiAqIEByZXR1cm5zIHtQcm9taXNlPE9iamVjdD59XG4gKi9cbmFzeW5jIGZ1bmN0aW9uIHdyaXRlUHJvdGVjdGlvblJ1bGUoIHJlcG9zaXRvcnlJZCwgbmFtZVBhdHRlcm4gKSB7XG4gIGNvbnN0IGhhbmRsZUpTT05SZXNwb25zZSA9IGpzb25SZXNwb25zZSA9PiB7XG4gICAgaWYgKCBqc29uUmVzcG9uc2UuZXJyb3JzICkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCBnZXRFcnJvck1lc3NhZ2UoIGpzb25SZXNwb25zZSApICk7XG4gICAgfVxuICB9O1xuICByZXR1cm4gc2VuZFByb21pc2VkSHR0cHNSZXF1ZXN0KCBjcmVhdGVSZXBvc2l0b3J5UnVsZU11dGF0aW9uRGF0YSggcmVwb3NpdG9yeUlkLCBuYW1lUGF0dGVybiApLCBoYW5kbGVKU09OUmVzcG9uc2UgKTtcbn1cblxuLyoqXG4gKiBEZWxldGVzIGFuIGV4aXN0aW5nIHJ1bGUuIFdlIGFzc3VtZSB0aGF0IHRoYXQgYnkgcnVubmluZyB0aGlzIHdlIHdhbnQgdG8gb3ZlcndyaXRlIHRoZSBleGlzdGluZyBydWxlLlxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBydWxlSWRcbiAqIEBwYXJhbSB7c3RyaW5nfSBuYW1lUGF0dGVyblxuICogQHBhcmFtIHtzdHJpbmd9IHJlcG9zaXRvcnlOYW1lXG4gKiBAcmV0dXJucyB7UHJvbWlzZTxPYmplY3Q+fVxuICovXG5hc3luYyBmdW5jdGlvbiBkZWxldGVFeGlzdGluZ1Byb3RlY3Rpb25SdWxlKCBydWxlSWQsIG5hbWVQYXR0ZXJuLCByZXBvc2l0b3J5TmFtZSApIHtcbiAgY29uc3QgaGFuZGxlSlNPTlJlc3BvbnNlID0ganNvblJlc3BvbnNlID0+IHtcbiAgICBpZiAoIGpzb25SZXNwb25zZS5lcnJvcnMgKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoIGdldEVycm9yTWVzc2FnZSgganNvblJlc3BvbnNlICkgKTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICBjb25zb2xlLmxvZyggYERlbGV0ZWQgZXhpc3RpbmcgYnJhbmNoIHByb3RlY3Rpb24gcnVsZSAke25hbWVQYXR0ZXJufSBmb3IgcmVwbyAke3JlcG9zaXRvcnlOYW1lfWAgKTtcbiAgICB9XG4gIH07XG4gIHJldHVybiBzZW5kUHJvbWlzZWRIdHRwc1JlcXVlc3QoIGNyZWF0ZURlbGV0ZUJyYW5jaFByb3RlY3Rpb25SdWxlTXV0YXRpb25EYXRhKCBydWxlSWQgKSwgaGFuZGxlSlNPTlJlc3BvbnNlICk7XG59XG5cbi8qKlxuICogQW4gYXN5bmMgZnVuY3Rpb24gdGhhdCB3aWxsIGRlbGV0ZSBhbGwgZXhpc3RpbmcgcnVsZXMgdGhhdCBtYXRjaCB0aGUgcHJvdmlkZWQgbmFtZVBhdHRlcm4gZm9yIHRoZSByZXBvc2l0b3J5LlxuICogV3JhcHBlZCBpbiBhIFByb21pc2Ugc28gd2UgY2FuIHdhaXQgdG8gd3JpdGUgbmV3IHJ1bGVzIHVudGlsIHRoZSBleGlzdGluZyBydWxlcyBhcmUgcmVtb3ZlZC4gSWYgeW91IHRyeSB0b1xuICogd3JpdGUgb3ZlciBhbiBleGlzdGluZyBydWxlIHdpdGhvdXQgcmVtb3ZpbmcgaXQgZ2l0aHViIHdpbGwgcmVzcG9uZCB3aXRoIGFuIGVycm9yLlxuICpcbiAqIEBwYXJhbSB7KltdfSBydWxlc1xuICogQHBhcmFtIHtzdHJpbmd9IG5hbWVQYXR0ZXJuXG4gKiBAcGFyYW0ge3N0cmluZ30gcmVwb3NpdG9yeU5hbWVcbiAqIEByZXR1cm5zIHtQcm9taXNlPHVua25vd25bXT59XG4gKi9cbmFzeW5jIGZ1bmN0aW9uIGRlbGV0ZU1hdGNoaW5nUHJvdGVjdGlvblJ1bGVzKCBydWxlcywgbmFtZVBhdHRlcm4sIHJlcG9zaXRvcnlOYW1lICkge1xuXG4gIGNvbnN0IHByb21pc2VzID0gW107XG4gIHJ1bGVzLmZvckVhY2goIHJ1bGUgPT4ge1xuXG4gICAgLy8gb25seSBkZWxldGUgcnVsZXMgdGhhdCBtYXRjaCB0aGUgbmV3IHBhdHRlcm4gd2Ugd2FudCB0byBwcm90ZWN0XG4gICAgaWYgKCBydWxlLnBhdHRlcm4gPT09IG5hbWVQYXR0ZXJuICkge1xuICAgICAgcHJvbWlzZXMucHVzaCggZGVsZXRlRXhpc3RpbmdQcm90ZWN0aW9uUnVsZSggcnVsZS5pZCwgbmFtZVBhdHRlcm4sIHJlcG9zaXRvcnlOYW1lICkgKTtcbiAgICB9XG4gIH0gKTtcblxuICByZXR1cm4gUHJvbWlzZS5hbGwoIHByb21pc2VzICk7XG59XG5cbi8qKlxuICogU2VuZHMgYSByZXF1ZXN0IHRvIGdpdGh1YidzIEdyYXBoUUwgc2VydmVyIHRvIHF1ZXJ5IG9yIG11dGF0ZSByZXBvc2l0b3J5IGRhdGEuXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IHF1ZXJ5RGF0YSAtIHRoZSBzdHJpbmcgc2VudCB3aXRoIGh0dHBzXG4gKiBAcGFyYW0ge2Z1bmN0aW9uKE9iamVjdCl9IGhhbmRsZSAtIGhhbmRsZXMgdGhlIEpTT04gcmVzcG9uc2UgZnJvbSBnaXRodWJcbiAqIEByZXR1cm5zIHtQcm9taXNlPHVua25vd24+fVxuICovXG5hc3luYyBmdW5jdGlvbiBzZW5kUHJvbWlzZWRIdHRwc1JlcXVlc3QoIHF1ZXJ5RGF0YSwgaGFuZGxlICkge1xuICByZXR1cm4gbmV3IFByb21pc2UoICggcmVzb2x2ZSwgcmVqZWN0ICkgPT4ge1xuICAgIGNvbnN0IHJlcXVlc3QgPSBodHRwcy5yZXF1ZXN0KCBvcHRpb25zLCByZXNwb25zZSA9PiB7XG4gICAgICBsZXQgcmVzcG9uc2VCb2R5ID0gJyc7XG5cbiAgICAgIHJlc3BvbnNlLm9uKCAnZGF0YScsIGQgPT4ge1xuICAgICAgICByZXNwb25zZUJvZHkgKz0gZDtcbiAgICAgIH0gKTtcblxuICAgICAgcmVzcG9uc2Uub24oICdlbmQnLCAoKSA9PiB7XG4gICAgICAgIGNvbnN0IGpzb25SZXNwb25zZSA9IEpTT04ucGFyc2UoIHJlc3BvbnNlQm9keSApO1xuXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgY29uc3QgcmVzb2x2ZVZhbHVlID0gaGFuZGxlKCBqc29uUmVzcG9uc2UgKTtcbiAgICAgICAgICByZXNvbHZlKCByZXNvbHZlVmFsdWUgKTtcbiAgICAgICAgfVxuICAgICAgICBjYXRjaCggZXJyb3IgKSB7XG4gICAgICAgICAgcmVqZWN0KCBlcnJvciApO1xuICAgICAgICB9XG4gICAgICB9ICk7XG4gICAgfSApO1xuXG4gICAgcmVxdWVzdC5vbiggJ2Vycm9yJywgZXJyb3IgPT4ge1xuICAgICAgY29uc29sZS5lcnJvciggZXJyb3IgKTtcbiAgICB9ICk7XG5cbiAgICByZXF1ZXN0LndyaXRlKCBxdWVyeURhdGEgKTtcbiAgICByZXF1ZXN0LmVuZCgpO1xuICB9ICk7XG59XG5cbi8qKlxuICogQ2xlYXIgcHJvdGVjdGlvbnMgZm9yIHRoZSBicmFuY2hlcyB0aGF0IFBoRVQgd2FudHMgdG8gcHJvdGVjdC5cbiAqL1xuYXN5bmMgZnVuY3Rpb24gY2xlYXJCcmFuY2hQcm90ZWN0aW9ucyggcmVwb3NpdG9yaWVzICkge1xuICBmb3IgKCBjb25zdCByZXBvc2l0b3J5TmFtZSBvZiByZXBvc2l0b3JpZXMgKSB7XG4gICAgZm9yICggY29uc3QgbmFtZVBhdHRlcm4gb2YgQlJBTkNIX05BTUVfUEFUVEVSTlMgKSB7XG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCBicmFuY2hQcm90ZWN0aW9uUnVsZXMgPSBhd2FpdCBnZXRFeGlzdGluZ0JyYW5jaFByb3RlY3Rpb25SdWxlcyggcmVwb3NpdG9yeU5hbWUgKTtcbiAgICAgICAgYXdhaXQgZGVsZXRlTWF0Y2hpbmdQcm90ZWN0aW9uUnVsZXMoIGJyYW5jaFByb3RlY3Rpb25SdWxlcywgbmFtZVBhdHRlcm4sIHJlcG9zaXRvcnlOYW1lICk7XG4gICAgICB9XG4gICAgICBjYXRjaCggZXJyb3IgKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCBgRXJyb3IgY2xlYXJpbmcgZ2l0aHViIHByb3RlY3Rpb24gcnVsZSAke25hbWVQYXR0ZXJufSBmb3IgJHtyZXBvc2l0b3J5TmFtZX1gICk7XG4gICAgICB9XG4gICAgfVxuICB9XG59XG5cbi8qKlxuICogQXBwbHkgYnJhbmNoIHByb3RlY3Rpb24gcnVsZXMgdG8gcHJvZGN1dGlvbiBicmFuY2hlcyAobWFpbiwgcmVsZWFzZSBicmFuY2hlcykuXG4gKi9cbmFzeW5jIGZ1bmN0aW9uIHByb3RlY3RCcmFuY2hlcyggcmVwb3NpdG9yaWVzICkge1xuXG4gIC8vIHJlbW92ZSBhbnkgdHJhaWxpbmcgJy8nIGZyb20gdGhlIHJlcG9zaXRvcnkgbmFtZXMsIHdoaWNoIG1heSBoYXZlIGJlZW4gYWRkZWQgYnkgYXV0byBjb21wbGV0ZVxuICBjb25zdCBjbGVhbmVkUmVwb3NpdG9yaWVzID0gcmVwb3NpdG9yaWVzLm1hcCggcmVwb3NpdG9yeSA9PiByZXBvc2l0b3J5LnJlcGxhY2UoIC9cXC8kLywgJycgKSApO1xuXG4gIC8vIGlmIHRoZSBydWxlIGZvciB0aGUgcHJvdGVjdGVkIGJyYW5jaCBhbHJlYWR5IGV4aXN0cywgZGVsZXRlIGl0IC0gd2UgYXNzdW1lIHRoYXQgcnVubmluZyB0aGlzIGFnYWluIG1lYW5zIHdlXG4gIC8vIHdhbnQgdG8gdXBkYXRlIHJ1bGVzIGZvciBlYWNoIG5hbWVQYXR0ZXJuXG4gIGF3YWl0IGNsZWFyQnJhbmNoUHJvdGVjdGlvbnMoIGNsZWFuZWRSZXBvc2l0b3JpZXMgKTtcblxuICBmb3IgKCBjb25zdCByZXBvc2l0b3J5TmFtZSBvZiBjbGVhbmVkUmVwb3NpdG9yaWVzICkge1xuXG4gICAgLy8gZ2V0IHRoZSB1bmlxdWUgSUQgZm9yIGVhY2ggcmVwb3NpdG9yeVxuICAgIGNvbnN0IHJlcG9zaXRvcnlJZCA9IGF3YWl0IGdldFJlcG9zaXRvcnlJZCggcmVwb3NpdG9yeU5hbWUgKTtcblxuICAgIGZvciAoIGNvbnN0IG5hbWVQYXR0ZXJuIG9mIEJSQU5DSF9OQU1FX1BBVFRFUk5TICkge1xuXG4gICAgICB0cnkge1xuICAgICAgICBhd2FpdCB3cml0ZVByb3RlY3Rpb25SdWxlKCByZXBvc2l0b3J5SWQsIG5hbWVQYXR0ZXJuICk7XG4gICAgICAgIGNvbnNvbGUubG9nKCBgJHtuYW1lUGF0dGVybn0gcHJvdGVjdGlvbiBydWxlIHNldCBmb3IgJHtyZXBvc2l0b3J5TmFtZX1gICk7XG4gICAgICB9XG4gICAgICBjYXRjaCggZXJyb3IgKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCBgRXJyb3Igd3JpdGluZyAke25hbWVQYXR0ZXJufSBydWxlIGZvciByZXBvICR7cmVwb3NpdG9yeU5hbWV9OmAgKTtcbiAgICAgICAgY29uc29sZS5sb2coIGVycm9yICk7XG4gICAgICAgIGNvbnNvbGUubG9nKCAnXFxuJyApO1xuICAgICAgfVxuICAgIH1cbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgcHJvdGVjdEJyYW5jaGVzOiBwcm90ZWN0QnJhbmNoZXMsXG4gIGNsZWFyQnJhbmNoUHJvdGVjdGlvbnM6IGNsZWFyQnJhbmNoUHJvdGVjdGlvbnNcbn07Il0sIm5hbWVzIjpbImh0dHBzIiwicmVxdWlyZSIsImJ1aWxkTG9jYWwiLCJCUkFOQ0hfTkFNRV9QQVRURVJOUyIsIm9wdGlvbnMiLCJob3N0bmFtZSIsInBhdGgiLCJtZXRob2QiLCJoZWFkZXJzIiwiQXV0aG9yaXphdGlvbiIsImRldmVsb3BlckdpdGh1YkFjY2Vzc1Rva2VuIiwiY3JlYXRlQnJhbmNoUHJvdGVjdGlvblJ1bGVRdWVyeURhdGEiLCJyZXBvc2l0b3J5TmFtZSIsImNyZWF0ZVF1ZXJ5RGF0YSIsImNyZWF0ZURlbGV0ZUJyYW5jaFByb3RlY3Rpb25SdWxlTXV0YXRpb25EYXRhIiwicnVsZUlkIiwiY3JlYXRlUmVwb3NpdG9yeVJ1bGVNdXRhdGlvbkRhdGEiLCJyZXBvc2l0b3J5SWQiLCJuYW1lUGF0dGVybiIsImNyZWF0ZVJlcG9zaXRvcnlJZFF1ZXJ5RGF0YSIsInF1ZXJ5U3RyaW5nIiwiSlNPTiIsInN0cmluZ2lmeSIsInF1ZXJ5IiwiZ2V0RXJyb3JNZXNzYWdlIiwianNvblJlc3BvbnNlIiwiZXJyb3JzIiwibWVzc2FnZSIsImdldFJlcG9zaXRvcnlJZCIsImhhbmRsZUpTT05SZXNwb25zZSIsImRhdGEiLCJyZXBvc2l0b3J5IiwiRXJyb3IiLCJpZCIsInNlbmRQcm9taXNlZEh0dHBzUmVxdWVzdCIsImdldEV4aXN0aW5nQnJhbmNoUHJvdGVjdGlvblJ1bGVzIiwiYnJhbmNoUHJvdGVjdGlvblJ1bGVzIiwibm9kZXMiLCJ3cml0ZVByb3RlY3Rpb25SdWxlIiwiZGVsZXRlRXhpc3RpbmdQcm90ZWN0aW9uUnVsZSIsImNvbnNvbGUiLCJsb2ciLCJkZWxldGVNYXRjaGluZ1Byb3RlY3Rpb25SdWxlcyIsInJ1bGVzIiwicHJvbWlzZXMiLCJmb3JFYWNoIiwicnVsZSIsInBhdHRlcm4iLCJwdXNoIiwiUHJvbWlzZSIsImFsbCIsInF1ZXJ5RGF0YSIsImhhbmRsZSIsInJlc29sdmUiLCJyZWplY3QiLCJyZXF1ZXN0IiwicmVzcG9uc2UiLCJyZXNwb25zZUJvZHkiLCJvbiIsImQiLCJwYXJzZSIsInJlc29sdmVWYWx1ZSIsImVycm9yIiwid3JpdGUiLCJlbmQiLCJjbGVhckJyYW5jaFByb3RlY3Rpb25zIiwicmVwb3NpdG9yaWVzIiwicHJvdGVjdEJyYW5jaGVzIiwiY2xlYW5lZFJlcG9zaXRvcmllcyIsIm1hcCIsInJlcGxhY2UiLCJtb2R1bGUiLCJleHBvcnRzIl0sIm1hcHBpbmdzIjoiQUFBQSxpREFBaUQ7QUFFakQ7Ozs7Ozs7Ozs7Ozs7Ozs7OztDQWtCQzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFFRCxNQUFNQSxRQUFRQyxRQUFTO0FBQ3ZCLE1BQU1DLGFBQWFELFFBQVM7QUFFNUIsNERBQTREO0FBQzVELE1BQU1FLHVCQUF1QjtJQUFFO0lBQVE7Q0FBaUI7QUFFeEQsNkRBQTZEO0FBQzdELE1BQU1DLFVBQVU7SUFDZEMsVUFBVTtJQUNWQyxNQUFNO0lBQ05DLFFBQVE7SUFDUkMsU0FBUztRQUNQQyxlQUFlLENBQUMsT0FBTyxFQUFFUCxXQUFXUSwwQkFBMEIsRUFBRTtRQUNoRSxnQkFBZ0I7UUFDaEIsY0FBYztJQUNoQjtBQUNGO0FBRUE7Ozs7OztDQU1DLEdBQ0QsTUFBTUMsc0NBQXNDQyxDQUFBQTtJQUMxQyxPQUFPQyxnQkFBaUIsQ0FBQzt5Q0FDYyxFQUFFRCxlQUFlOzs7Ozs7Ozs7O09BVW5ELENBQUM7QUFFUjtBQUVBOzs7Ozs7Q0FNQyxHQUNELE1BQU1FLCtDQUErQ0MsQ0FBQUE7SUFDbkQsT0FBT0YsZ0JBQWlCLENBQUM7K0RBQ29DLEVBQUVFLE9BQU87OztHQUdyRSxDQUFDO0FBQ0o7QUFFQTs7Ozs7Ozs7OztDQVVDLEdBQ0QsTUFBTUMsbUNBQW1DLENBQUVDLGNBQWNDO0lBQ3ZELE9BQU9MLGdCQUFpQixDQUFDOztnQkFFWCxFQUFFSyxZQUFZOzs7cUJBR1QsRUFBRUQs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