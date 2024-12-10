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
const buildLocal = require('./buildLocal');
const devScp = require('./devScp');
const writeFile = require('./writeFile');
const axios = require('axios');
const fs = require('graceful-fs'); // eslint-disable-line phet/require-statement-match
const winston = require('winston');
// A list of directories directly nested under the phet-io build output folder that should be password protected. Slashes
// added later.
const PASSWORD_PROTECTED_SUB_DIRS = [
    'wrappers',
    'doc'
];
/**
 * Writes the htaccess file to password protect the exclusive content for phet-io sims
 * @param {string} passwordProtectPath - deployment location, with no trailing slash
 * @param {
 *  {
 *    [simName]:string,
 *    [version]:string,
 *    [directory]:string,
 *    checkoutDir: string,
 *    isProductionDeploy: boolean
 *  } | null } [latestOption]
 *      if isProductionDeploy is true, then we are publishing to production. We then write the /latest/ redirect .htaccess file.
 *      This is only to be used for production deploys by the build-server. directory is the write destination.
 *      checkoutDir is where the release branch repos live locally.
 *      simName, version, and directory are required if isProductionDeploy is true
 * @param {string} [devVersionPath] - if provided, scp the htaccess files to here, relatively
 */ module.exports = /*#__PURE__*/ function() {
    var _writePhetioHtaccess = _async_to_generator(function*(passwordProtectPath, latestOption, devVersionPath) {
        const authFilepath = '/etc/httpd/conf/phet-io_pw';
        const isProductionDeploy = latestOption == null ? void 0 : latestOption.isProductionDeploy;
        // This option is for production deploys by the build-server
        // If we are provided a simName and version then write a .htaccess file to redirect
        // https://phet-io.colorado.edu/sims/{{sim-name}}/{{major}}.{{minor}} to https://phet-io.colorado.edu/sims/{{sim-name}}/{{major}}.{{minor}}.{{latest}}{{[-suffix]}}
        if (isProductionDeploy) {
            if (latestOption.simName && latestOption.version && latestOption.directory && latestOption.checkoutDir) {
                const redirectFilepath = `${latestOption.directory + latestOption.simName}/.htaccess`;
                let latestRedirectContents = 'RewriteEngine on\n' + `RewriteBase /sims/${latestOption.simName}/\n`;
                const versions = (yield axios(`${buildLocal.productionServerURL}/services/metadata/phetio?name=${latestOption.simName}&latest=true`)).data;
                for (const v of versions){
                    // Add a trailing slash to /sims/sim-name/x.y
                    latestRedirectContents += `RewriteRule ^${v.versionMajor}.${v.versionMinor}$ ${v.versionMajor}.${v.versionMinor}/ [R=301,L]\n`;
                    // Rewrite /sims/sim-name/x.y/* to /sims/sim-name/x.y.z/*
                    latestRedirectContents += `RewriteRule ^${v.versionMajor}.${v.versionMinor}/(.*) ${v.versionMajor}.${v.versionMinor}.${v.versionMaintenance}${v.versionSuffix ? '-' : ''}${v.versionSuffix}/$1\n`;
                }
                // 'RewriteRule latest(.*) ' + latestOption.version + '$1\n';
                latestRedirectContents += 'RewriteCond %{QUERY_STRING} =download\n' + 'RewriteRule ([^/]*)$ - [L,E=download:$1]\n' + 'Header onsuccess set Content-disposition "attachment; filename=%{download}e" env=download\n';
                yield writeFile(redirectFilepath, latestRedirectContents);
            } else {
                winston.error(`simName: ${latestOption.simName}`);
                winston.error(`version: ${latestOption.version}`);
                winston.error(`directory: ${latestOption.directory}`);
                winston.error(`checkoutDir: ${latestOption.checkoutDir}`);
                throw new Error('latestOption is missing one of the required parameters (simName, version, directory, or checkoutDir)');
            }
        }
        const simPackage = isProductionDeploy ? JSON.parse(fs.readFileSync(`${latestOption.checkoutDir}/${latestOption.simName}/package.json`)) : null;
        const htaccessFilename = '.htaccess';
        const getSubdirHtaccessPath = (subdir)=>`${subdir}/${htaccessFilename}`;
        const getSubdirHtaccessFullPath = (subdir)=>`${passwordProtectPath}/${getSubdirHtaccessPath(subdir)}`;
        const rootHtaccessFullPath = `${passwordProtectPath}/${htaccessFilename}`;
        // Only allow public accessibility with htaccess mutation if in production deploy when the "allowPublicAccess" flag
        // is present. Commented out lines keep password protection, but comment them in with `allowPublicAccess`.
        let commentSymbol = '#';
        if (simPackage && simPackage.phet && simPackage.phet['phet-io'] && simPackage.phet['phet-io'].allowPublicAccess) {
            commentSymbol = '';
        }
        try {
            const basePasswordProtectContents = `
AuthType Basic
AuthName "PhET-iO Password Protected Area"
AuthUserFile ${authFilepath}
<LimitExcept OPTIONS>
  Require valid-user
</LimitExcept>
`;
            const passwordProtectWrapperContents = `${basePasswordProtectContents}

# Editing these directly is not supported and will be overwritten by maintenance releases. Please change by modifying 
# the sim's package.json allowPublicAccess flag followed by a re-deploy.
${commentSymbol} Satisfy Any
${commentSymbol} Allow from all
`;
            // Write a file to add authentication to subdirectories like wrappers/ or doc/
            for (const subdir of PASSWORD_PROTECTED_SUB_DIRS){
                const htaccessPathToDir = getSubdirHtaccessFullPath(subdir);
                // if the directory exists
                if (fs.existsSync(htaccessPathToDir.replace(htaccessFilename, ''))) {
                    yield writeFile(htaccessPathToDir, passwordProtectWrapperContents);
                    if (devVersionPath) {
                        yield devScp(htaccessPathToDir, `${devVersionPath}/phet-io/${getSubdirHtaccessPath(subdir)}`);
                    }
                }
            }
            const phetioParentDir = (latestOption == null ? void 0 : latestOption.checkoutDir) || '..';
            const phetioPackage = JSON.parse(fs.readFileSync(`${phetioParentDir}/phet-io/package.json`));
            // We only want to cache for a production deploy, and not on the dev server
            const cachingDirective = isProductionDeploy ? `
# If the request is for a SIM, anything in the /lib or /xhtml dirs, or is the api.json file, then allow it to be cached
<If "-f %{REQUEST_FILENAME} && %{REQUEST_FILENAME} =~ m#(${latestOption.simName}_all.*\\.html|api\\.json|/lib/.*|/xhtml/.*)$#">
  ExpiresActive on
  ExpiresDefault "access plus 1 day"
  Header append Cache-Control "public"
  Header append Cache-Control "stale-while-revalidate=5184000"
  Header append Cache-Control "stale-if-error=5184000"
</If>
` : '';
            // Write a file to add authentication to the top level index pages
            if (phetioPackage.phet && phetioPackage.phet.addRootHTAccessFile) {
                const rootHtaccessContent = `<FilesMatch "(index\\.\\w+)$">\n${basePasswordProtectContents}</FilesMatch>
      
${cachingDirective}
                        
# Editing these directly is not supported and will be overwritten by maintenance releases. Please change by modifying 
# the sim's package.json allowPublicAccess flag followed by a re-deploy.
${commentSymbol} Satisfy Any
${commentSymbol} Allow from all
`;
                yield writeFile(rootHtaccessFullPath, rootHtaccessContent);
                if (devVersionPath) {
                    yield devScp(rootHtaccessFullPath, `${devVersionPath}/phet-io/${htaccessFilename}`);
                }
            }
            winston.debug('phetio authentication htaccess written');
        } catch (err) {
            winston.debug('phetio authentication htaccess not written');
            throw err;
        }
    });
    function writePhetioHtaccess(passwordProtectPath, latestOption, devVersionPath) {
        return _writePhetioHtaccess.apply(this, arguments);
    }
    return writePhetioHtaccess;
}();

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3BlcmVubmlhbC1hbGlhcy9qcy9jb21tb24vd3JpdGVQaGV0aW9IdGFjY2Vzcy5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNy0yMDE5LCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcbi8vIEBhdXRob3IgTWF0dCBQZW5uaW5ndG9uIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxuXG5jb25zdCBidWlsZExvY2FsID0gcmVxdWlyZSggJy4vYnVpbGRMb2NhbCcgKTtcbmNvbnN0IGRldlNjcCA9IHJlcXVpcmUoICcuL2RldlNjcCcgKTtcbmNvbnN0IHdyaXRlRmlsZSA9IHJlcXVpcmUoICcuL3dyaXRlRmlsZScgKTtcbmNvbnN0IGF4aW9zID0gcmVxdWlyZSggJ2F4aW9zJyApO1xuY29uc3QgZnMgPSByZXF1aXJlKCAnZ3JhY2VmdWwtZnMnICk7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgcGhldC9yZXF1aXJlLXN0YXRlbWVudC1tYXRjaFxuY29uc3Qgd2luc3RvbiA9IHJlcXVpcmUoICd3aW5zdG9uJyApO1xuXG4vLyBBIGxpc3Qgb2YgZGlyZWN0b3JpZXMgZGlyZWN0bHkgbmVzdGVkIHVuZGVyIHRoZSBwaGV0LWlvIGJ1aWxkIG91dHB1dCBmb2xkZXIgdGhhdCBzaG91bGQgYmUgcGFzc3dvcmQgcHJvdGVjdGVkLiBTbGFzaGVzXG4vLyBhZGRlZCBsYXRlci5cbmNvbnN0IFBBU1NXT1JEX1BST1RFQ1RFRF9TVUJfRElSUyA9IFsgJ3dyYXBwZXJzJywgJ2RvYycgXTtcblxuLyoqXG4gKiBXcml0ZXMgdGhlIGh0YWNjZXNzIGZpbGUgdG8gcGFzc3dvcmQgcHJvdGVjdCB0aGUgZXhjbHVzaXZlIGNvbnRlbnQgZm9yIHBoZXQtaW8gc2ltc1xuICogQHBhcmFtIHtzdHJpbmd9IHBhc3N3b3JkUHJvdGVjdFBhdGggLSBkZXBsb3ltZW50IGxvY2F0aW9uLCB3aXRoIG5vIHRyYWlsaW5nIHNsYXNoXG4gKiBAcGFyYW0ge1xuICogIHtcbiAqICAgIFtzaW1OYW1lXTpzdHJpbmcsXG4gKiAgICBbdmVyc2lvbl06c3RyaW5nLFxuICogICAgW2RpcmVjdG9yeV06c3RyaW5nLFxuICogICAgY2hlY2tvdXREaXI6IHN0cmluZyxcbiAqICAgIGlzUHJvZHVjdGlvbkRlcGxveTogYm9vbGVhblxuICogIH0gfCBudWxsIH0gW2xhdGVzdE9wdGlvbl1cbiAqICAgICAgaWYgaXNQcm9kdWN0aW9uRGVwbG95IGlzIHRydWUsIHRoZW4gd2UgYXJlIHB1Ymxpc2hpbmcgdG8gcHJvZHVjdGlvbi4gV2UgdGhlbiB3cml0ZSB0aGUgL2xhdGVzdC8gcmVkaXJlY3QgLmh0YWNjZXNzIGZpbGUuXG4gKiAgICAgIFRoaXMgaXMgb25seSB0byBiZSB1c2VkIGZvciBwcm9kdWN0aW9uIGRlcGxveXMgYnkgdGhlIGJ1aWxkLXNlcnZlci4gZGlyZWN0b3J5IGlzIHRoZSB3cml0ZSBkZXN0aW5hdGlvbi5cbiAqICAgICAgY2hlY2tvdXREaXIgaXMgd2hlcmUgdGhlIHJlbGVhc2UgYnJhbmNoIHJlcG9zIGxpdmUgbG9jYWxseS5cbiAqICAgICAgc2ltTmFtZSwgdmVyc2lvbiwgYW5kIGRpcmVjdG9yeSBhcmUgcmVxdWlyZWQgaWYgaXNQcm9kdWN0aW9uRGVwbG95IGlzIHRydWVcbiAqIEBwYXJhbSB7c3RyaW5nfSBbZGV2VmVyc2lvblBhdGhdIC0gaWYgcHJvdmlkZWQsIHNjcCB0aGUgaHRhY2Nlc3MgZmlsZXMgdG8gaGVyZSwgcmVsYXRpdmVseVxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGFzeW5jIGZ1bmN0aW9uIHdyaXRlUGhldGlvSHRhY2Nlc3MoIHBhc3N3b3JkUHJvdGVjdFBhdGgsIGxhdGVzdE9wdGlvbiwgZGV2VmVyc2lvblBhdGggKSB7XG4gIGNvbnN0IGF1dGhGaWxlcGF0aCA9ICcvZXRjL2h0dHBkL2NvbmYvcGhldC1pb19wdyc7XG5cbiAgY29uc3QgaXNQcm9kdWN0aW9uRGVwbG95ID0gbGF0ZXN0T3B0aW9uPy5pc1Byb2R1Y3Rpb25EZXBsb3k7XG5cbiAgLy8gVGhpcyBvcHRpb24gaXMgZm9yIHByb2R1Y3Rpb24gZGVwbG95cyBieSB0aGUgYnVpbGQtc2VydmVyXG4gIC8vIElmIHdlIGFyZSBwcm92aWRlZCBhIHNpbU5hbWUgYW5kIHZlcnNpb24gdGhlbiB3cml0ZSBhIC5odGFjY2VzcyBmaWxlIHRvIHJlZGlyZWN0XG4gIC8vIGh0dHBzOi8vcGhldC1pby5jb2xvcmFkby5lZHUvc2ltcy97e3NpbS1uYW1lfX0ve3ttYWpvcn19Lnt7bWlub3J9fSB0byBodHRwczovL3BoZXQtaW8uY29sb3JhZG8uZWR1L3NpbXMve3tzaW0tbmFtZX19L3t7bWFqb3J9fS57e21pbm9yfX0ue3tsYXRlc3R9fXt7Wy1zdWZmaXhdfX1cbiAgaWYgKCBpc1Byb2R1Y3Rpb25EZXBsb3kgKSB7XG4gICAgaWYgKCBsYXRlc3RPcHRpb24uc2ltTmFtZSAmJiBsYXRlc3RPcHRpb24udmVyc2lvbiAmJiBsYXRlc3RPcHRpb24uZGlyZWN0b3J5ICYmIGxhdGVzdE9wdGlvbi5jaGVja291dERpciApIHtcbiAgICAgIGNvbnN0IHJlZGlyZWN0RmlsZXBhdGggPSBgJHtsYXRlc3RPcHRpb24uZGlyZWN0b3J5ICsgbGF0ZXN0T3B0aW9uLnNpbU5hbWV9Ly5odGFjY2Vzc2A7XG4gICAgICBsZXQgbGF0ZXN0UmVkaXJlY3RDb250ZW50cyA9ICdSZXdyaXRlRW5naW5lIG9uXFxuJyArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGBSZXdyaXRlQmFzZSAvc2ltcy8ke2xhdGVzdE9wdGlvbi5zaW1OYW1lfS9cXG5gO1xuICAgICAgY29uc3QgdmVyc2lvbnMgPSAoIGF3YWl0IGF4aW9zKCBgJHtidWlsZExvY2FsLnByb2R1Y3Rpb25TZXJ2ZXJVUkx9L3NlcnZpY2VzL21ldGFkYXRhL3BoZXRpbz9uYW1lPSR7bGF0ZXN0T3B0aW9uLnNpbU5hbWV9JmxhdGVzdD10cnVlYCApICkuZGF0YTtcbiAgICAgIGZvciAoIGNvbnN0IHYgb2YgdmVyc2lvbnMgKSB7XG4gICAgICAgIC8vIEFkZCBhIHRyYWlsaW5nIHNsYXNoIHRvIC9zaW1zL3NpbS1uYW1lL3gueVxuICAgICAgICBsYXRlc3RSZWRpcmVjdENvbnRlbnRzICs9IGBSZXdyaXRlUnVsZSBeJHt2LnZlcnNpb25NYWpvcn0uJHt2LnZlcnNpb25NaW5vcn0kICR7di52ZXJzaW9uTWFqb3J9LiR7di52ZXJzaW9uTWlub3J9LyBbUj0zMDEsTF1cXG5gO1xuICAgICAgICAvLyBSZXdyaXRlIC9zaW1zL3NpbS1uYW1lL3gueS8qIHRvIC9zaW1zL3NpbS1uYW1lL3gueS56LypcbiAgICAgICAgbGF0ZXN0UmVkaXJlY3RDb250ZW50cyArPSBgUmV3cml0ZVJ1bGUgXiR7di52ZXJzaW9uTWFqb3J9LiR7di52ZXJzaW9uTWlub3J9LyguKikgJHt2LnZlcnNpb25NYWpvcn0uJHt2LnZlcnNpb25NaW5vcn0uJHt2LnZlcnNpb25NYWludGVuYW5jZX0ke3YudmVyc2lvblN1ZmZpeCA/ICctJyA6ICcnfSR7di52ZXJzaW9uU3VmZml4fS8kMVxcbmA7XG4gICAgICB9XG4gICAgICAvLyAnUmV3cml0ZVJ1bGUgbGF0ZXN0KC4qKSAnICsgbGF0ZXN0T3B0aW9uLnZlcnNpb24gKyAnJDFcXG4nO1xuICAgICAgbGF0ZXN0UmVkaXJlY3RDb250ZW50cyArPSAnUmV3cml0ZUNvbmQgJXtRVUVSWV9TVFJJTkd9ID1kb3dubG9hZFxcbicgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnUmV3cml0ZVJ1bGUgKFteL10qKSQgLSBbTCxFPWRvd25sb2FkOiQxXVxcbicgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnSGVhZGVyIG9uc3VjY2VzcyBzZXQgQ29udGVudC1kaXNwb3NpdGlvbiBcImF0dGFjaG1lbnQ7IGZpbGVuYW1lPSV7ZG93bmxvYWR9ZVwiIGVudj1kb3dubG9hZFxcbic7XG4gICAgICBhd2FpdCB3cml0ZUZpbGUoIHJlZGlyZWN0RmlsZXBhdGgsIGxhdGVzdFJlZGlyZWN0Q29udGVudHMgKTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICB3aW5zdG9uLmVycm9yKCBgc2ltTmFtZTogJHtsYXRlc3RPcHRpb24uc2ltTmFtZX1gICk7XG4gICAgICB3aW5zdG9uLmVycm9yKCBgdmVyc2lvbjogJHtsYXRlc3RPcHRpb24udmVyc2lvbn1gICk7XG4gICAgICB3aW5zdG9uLmVycm9yKCBgZGlyZWN0b3J5OiAke2xhdGVzdE9wdGlvbi5kaXJlY3Rvcnl9YCApO1xuICAgICAgd2luc3Rvbi5lcnJvciggYGNoZWNrb3V0RGlyOiAke2xhdGVzdE9wdGlvbi5jaGVja291dERpcn1gICk7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoICdsYXRlc3RPcHRpb24gaXMgbWlzc2luZyBvbmUgb2YgdGhlIHJlcXVpcmVkIHBhcmFtZXRlcnMgKHNpbU5hbWUsIHZlcnNpb24sIGRpcmVjdG9yeSwgb3IgY2hlY2tvdXREaXIpJyApO1xuICAgIH1cbiAgfVxuXG4gIGNvbnN0IHNpbVBhY2thZ2UgPSBpc1Byb2R1Y3Rpb25EZXBsb3kgPyBKU09OLnBhcnNlKCBmcy5yZWFkRmlsZVN5bmMoIGAke2xhdGVzdE9wdGlvbi5jaGVja291dERpcn0vJHtsYXRlc3RPcHRpb24uc2ltTmFtZX0vcGFja2FnZS5qc29uYCApICkgOiBudWxsO1xuXG4gIGNvbnN0IGh0YWNjZXNzRmlsZW5hbWUgPSAnLmh0YWNjZXNzJztcbiAgY29uc3QgZ2V0U3ViZGlySHRhY2Nlc3NQYXRoID0gc3ViZGlyID0+IGAke3N1YmRpcn0vJHtodGFjY2Vzc0ZpbGVuYW1lfWA7XG4gIGNvbnN0IGdldFN1YmRpckh0YWNjZXNzRnVsbFBhdGggPSBzdWJkaXIgPT4gYCR7cGFzc3dvcmRQcm90ZWN0UGF0aH0vJHtnZXRTdWJkaXJIdGFjY2Vzc1BhdGgoIHN1YmRpciApfWA7XG4gIGNvbnN0IHJvb3RIdGFjY2Vzc0Z1bGxQYXRoID0gYCR7cGFzc3dvcmRQcm90ZWN0UGF0aH0vJHtodGFjY2Vzc0ZpbGVuYW1lfWA7XG5cbiAgLy8gT25seSBhbGxvdyBwdWJsaWMgYWNjZXNzaWJpbGl0eSB3aXRoIGh0YWNjZXNzIG11dGF0aW9uIGlmIGluIHByb2R1Y3Rpb24gZGVwbG95IHdoZW4gdGhlIFwiYWxsb3dQdWJsaWNBY2Nlc3NcIiBmbGFnXG4gIC8vIGlzIHByZXNlbnQuIENvbW1lbnRlZCBvdXQgbGluZXMga2VlcCBwYXNzd29yZCBwcm90ZWN0aW9uLCBidXQgY29tbWVudCB0aGVtIGluIHdpdGggYGFsbG93UHVibGljQWNjZXNzYC5cbiAgbGV0IGNvbW1lbnRTeW1ib2wgPSAnIyc7XG5cbiAgaWYgKCBzaW1QYWNrYWdlICYmIHNpbVBhY2thZ2UucGhldCAmJiBzaW1QYWNrYWdlLnBoZXRbICdwaGV0LWlvJyBdICYmIHNpbVBhY2thZ2UucGhldFsgJ3BoZXQtaW8nIF0uYWxsb3dQdWJsaWNBY2Nlc3MgKSB7XG4gICAgY29tbWVudFN5bWJvbCA9ICcnO1xuICB9XG4gIHRyeSB7XG4gICAgY29uc3QgYmFzZVBhc3N3b3JkUHJvdGVjdENvbnRlbnRzID0gYFxuQXV0aFR5cGUgQmFzaWNcbkF1dGhOYW1lIFwiUGhFVC1pTyBQYXNzd29yZCBQcm90ZWN0ZWQgQXJlYVwiXG5BdXRoVXNlckZpbGUgJHthdXRoRmlsZXBhdGh9XG48TGltaXRFeGNlcHQgT1BUSU9OUz5cbiAgUmVxdWlyZSB2YWxpZC11c2VyXG48L0xpbWl0RXhjZXB0PlxuYDtcblxuICAgIGNvbnN0IHBhc3N3b3JkUHJvdGVjdFdyYXBwZXJDb250ZW50cyA9IGAke2Jhc2VQYXNzd29yZFByb3RlY3RDb250ZW50c31cblxuIyBFZGl0aW5nIHRoZXNlIGRpcmVjdGx5IGlzIG5vdCBzdXBwb3J0ZWQgYW5kIHdpbGwgYmUgb3ZlcndyaXR0ZW4gYnkgbWFpbnRlbmFuY2UgcmVsZWFzZXMuIFBsZWFzZSBjaGFuZ2UgYnkgbW9kaWZ5aW5nIFxuIyB0aGUgc2ltJ3MgcGFja2FnZS5qc29uIGFsbG93UHVibGljQWNjZXNzIGZsYWcgZm9sbG93ZWQgYnkgYSByZS1kZXBsb3kuXG4ke2NvbW1lbnRTeW1ib2x9IFNhdGlzZnkgQW55XG4ke2NvbW1lbnRTeW1ib2x9IEFsbG93IGZyb20gYWxsXG5gO1xuXG4gICAgLy8gV3JpdGUgYSBmaWxlIHRvIGFkZCBhdXRoZW50aWNhdGlvbiB0byBzdWJkaXJlY3RvcmllcyBsaWtlIHdyYXBwZXJzLyBvciBkb2MvXG4gICAgZm9yICggY29uc3Qgc3ViZGlyIG9mIFBBU1NXT1JEX1BST1RFQ1RFRF9TVUJfRElSUyApIHtcbiAgICAgIGNvbnN0IGh0YWNjZXNzUGF0aFRvRGlyID0gZ2V0U3ViZGlySHRhY2Nlc3NGdWxsUGF0aCggc3ViZGlyICk7XG5cbiAgICAgIC8vIGlmIHRoZSBkaXJlY3RvcnkgZXhpc3RzXG4gICAgICBpZiAoIGZzLmV4aXN0c1N5bmMoIGh0YWNjZXNzUGF0aFRvRGlyLnJlcGxhY2UoIGh0YWNjZXNzRmlsZW5hbWUsICcnICkgKSApIHtcbiAgICAgICAgYXdhaXQgd3JpdGVGaWxlKCBodGFjY2Vzc1BhdGhUb0RpciwgcGFzc3dvcmRQcm90ZWN0V3JhcHBlckNvbnRlbnRzICk7XG4gICAgICAgIGlmICggZGV2VmVyc2lvblBhdGggKSB7XG4gICAgICAgICAgYXdhaXQgZGV2U2NwKCBodGFjY2Vzc1BhdGhUb0RpciwgYCR7ZGV2VmVyc2lvblBhdGh9L3BoZXQtaW8vJHtnZXRTdWJkaXJIdGFjY2Vzc1BhdGgoIHN1YmRpciApfWAgKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIGNvbnN0IHBoZXRpb1BhcmVudERpciA9IGxhdGVzdE9wdGlvbj8uY2hlY2tvdXREaXIgfHwgJy4uJztcbiAgICBjb25zdCBwaGV0aW9QYWNrYWdlID0gSlNPTi5wYXJzZSggZnMucmVhZEZpbGVTeW5jKCBgJHtwaGV0aW9QYXJlbnREaXJ9L3BoZXQtaW8vcGFja2FnZS5qc29uYCApICk7XG5cbiAgICAvLyBXZSBvbmx5IHdhbnQgdG8gY2FjaGUgZm9yIGEgcHJvZHVjdGlvbiBkZXBsb3ksIGFuZCBub3Qgb24gdGhlIGRldiBzZXJ2ZXJcbiAgICBjb25zdCBjYWNoaW5nRGlyZWN0aXZlID0gaXNQcm9kdWN0aW9uRGVwbG95ID8gYFxuIyBJZiB0aGUgcmVxdWVzdCBpcyBmb3IgYSBTSU0sIGFueXRoaW5nIGluIHRoZSAvbGliIG9yIC94aHRtbCBkaXJzLCBvciBpcyB0aGUgYXBpLmpzb24gZmlsZSwgdGhlbiBhbGxvdyBpdCB0byBiZSBjYWNoZWRcbjxJZiBcIi1mICV7UkVRVUVTVF9GSUxFTkFNRX0gJiYgJXtSRVFVRVNUX0ZJTEVOQU1FfSA9fiBtIygke2xhdGVzdE9wdGlvbi5zaW1OYW1lfV9hbGwuKlxcXFwuaHRtbHxhcGlcXFxcLmpzb258L2xpYi8uKnwveGh0bWwvLiopJCNcIj5cbiAgRXhwaXJlc0FjdGl2ZSBvblxuICBFeHBpcmVzRGVmYXVsdCBcImFjY2VzcyBwbHVzIDEgZGF5XCJcbiAgSGVhZGVyIGFwcGVuZCBDYWNoZS1Db250cm9sIFwicHVibGljXCJcbiAgSGVhZGVyIGFwcGVuZCBDYWNoZS1Db250cm9sIFwic3RhbGUtd2hpbGUtcmV2YWxpZGF0ZT01MTg0MDAwXCJcbiAgSGVhZGVyIGFwcGVuZCBDYWNoZS1Db250cm9sIFwic3RhbGUtaWYtZXJyb3I9NTE4NDAwMFwiXG48L0lmPlxuYCA6ICcnO1xuXG4gICAgLy8gV3JpdGUgYSBmaWxlIHRvIGFkZCBhdXRoZW50aWNhdGlvbiB0byB0aGUgdG9wIGxldmVsIGluZGV4IHBhZ2VzXG4gICAgaWYgKCBwaGV0aW9QYWNrYWdlLnBoZXQgJiYgcGhldGlvUGFja2FnZS5waGV0LmFkZFJvb3RIVEFjY2Vzc0ZpbGUgKSB7XG4gICAgICBjb25zdCByb290SHRhY2Nlc3NDb250ZW50ID0gYDxGaWxlc01hdGNoIFwiKGluZGV4XFxcXC5cXFxcdyspJFwiPlxcbiR7XG4gICAgICAgIGJhc2VQYXNzd29yZFByb3RlY3RDb250ZW50c1xuICAgICAgfTwvRmlsZXNNYXRjaD5cbiAgICAgIFxuJHtjYWNoaW5nRGlyZWN0aXZlfVxuICAgICAgICAgICAgICAgICAgICAgICAgXG4jIEVkaXRpbmcgdGhlc2UgZGlyZWN0bHkgaXMgbm90IHN1cHBvcnRlZCBhbmQgd2lsbCBiZSBvdmVyd3JpdHRlbiBieSBtYWludGVuYW5jZSByZWxlYXNlcy4gUGxlYXNlIGNoYW5nZSBieSBtb2RpZnlpbmcgXG4jIHRoZSBzaW0ncyBwYWNrYWdlLmpzb24gYWxsb3dQdWJsaWNBY2Nlc3MgZmxhZyBmb2xsb3dlZCBieSBhIHJlLWRlcGxveS5cbiR7Y29tbWVudFN5bWJvbH0gU2F0aXNmeSBBbnlcbiR7Y29tbWVudFN5bWJvbH0gQWxsb3cgZnJvbSBhbGxcbmA7XG4gICAgICBhd2FpdCB3cml0ZUZpbGUoIHJvb3RIdGFjY2Vzc0Z1bGxQYXRoLCByb290SHRhY2Nlc3NDb250ZW50ICk7XG4gICAgICBpZiAoIGRldlZlcnNpb25QYXRoICkge1xuICAgICAgICBhd2FpdCBkZXZTY3AoIHJvb3RIdGFjY2Vzc0Z1bGxQYXRoLCBgJHtkZXZWZXJzaW9uUGF0aH0vcGhldC1pby8ke2h0YWNjZXNzRmlsZW5hbWV9YCApO1xuICAgICAgfVxuICAgIH1cbiAgICB3aW5zdG9uLmRlYnVnKCAncGhldGlvIGF1dGhlbnRpY2F0aW9uIGh0YWNjZXNzIHdyaXR0ZW4nICk7XG4gIH1cbiAgY2F0Y2goIGVyciApIHtcbiAgICB3aW5zdG9uLmRlYnVnKCAncGhldGlvIGF1dGhlbnRpY2F0aW9uIGh0YWNjZXNzIG5vdCB3cml0dGVuJyApO1xuICAgIHRocm93IGVycjtcbiAgfVxufTsiXSwibmFtZXMiOlsiYnVpbGRMb2NhbCIsInJlcXVpcmUiLCJkZXZTY3AiLCJ3cml0ZUZpbGUiLCJheGlvcyIsImZzIiwid2luc3RvbiIsIlBBU1NXT1JEX1BST1RFQ1RFRF9TVUJfRElSUyIsIm1vZHVsZSIsImV4cG9ydHMiLCJ3cml0ZVBoZXRpb0h0YWNjZXNzIiwicGFzc3dvcmRQcm90ZWN0UGF0aCIsImxhdGVzdE9wdGlvbiIsImRldlZlcnNpb25QYXRoIiwiYXV0aEZpbGVwYXRoIiwiaXNQcm9kdWN0aW9uRGVwbG95Iiwic2ltTmFtZSIsInZlcnNpb24iLCJkaXJlY3RvcnkiLCJjaGVja291dERpciIsInJlZGlyZWN0RmlsZXBhdGgiLCJsYXRlc3RSZWRpcmVjdENvbnRlbnRzIiwidmVyc2lvbnMiLCJwcm9kdWN0aW9uU2VydmVyVVJMIiwiZGF0YSIsInYiLCJ2ZXJzaW9uTWFqb3IiLCJ2ZXJzaW9uTWlub3IiLCJ2ZXJzaW9uTWFpbnRlbmFuY2UiLCJ2ZXJzaW9uU3VmZml4IiwiZXJyb3IiLCJFcnJvciIsInNpbVBhY2thZ2UiLCJKU09OIiwicGFyc2UiLCJyZWFkRmlsZVN5bmMiLCJodGFjY2Vzc0ZpbGVuYW1lIiwiZ2V0U3ViZGlySHRhY2Nlc3NQYXRoIiwic3ViZGlyIiwiZ2V0U3ViZGlySHRhY2Nlc3NGdWxsUGF0aCIsInJvb3RIdGFjY2Vzc0Z1bGxQYXRoIiwiY29tbWVudFN5bWJvbCIsInBoZXQiLCJhbGxvd1B1YmxpY0FjY2VzcyIsImJhc2VQYXNzd29yZFByb3RlY3RDb250ZW50cyIsInBhc3N3b3JkUHJvdGVjdFdyYXBwZXJDb250ZW50cyIsImh0YWNjZXNzUGF0aFRvRGlyIiwiZXhpc3RzU3luYyIsInJlcGxhY2UiLCJwaGV0aW9QYXJlbnREaXIiLCJwaGV0aW9QYWNrYWdlIiwiY2FjaGluZ0RpcmVjdGl2ZSIsImFkZFJvb3RIVEFjY2Vzc0ZpbGUiLCJyb290SHRhY2Nlc3NDb250ZW50IiwiZGVidWciLCJlcnIiXSwibWFwcGluZ3MiOiJBQUFBLHNEQUFzRDtBQUN0RCx5REFBeUQ7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUV6RCxNQUFNQSxhQUFhQyxRQUFTO0FBQzVCLE1BQU1DLFNBQVNELFFBQVM7QUFDeEIsTUFBTUUsWUFBWUYsUUFBUztBQUMzQixNQUFNRyxRQUFRSCxRQUFTO0FBQ3ZCLE1BQU1JLEtBQUtKLFFBQVMsZ0JBQWlCLG1EQUFtRDtBQUN4RixNQUFNSyxVQUFVTCxRQUFTO0FBRXpCLHlIQUF5SDtBQUN6SCxlQUFlO0FBQ2YsTUFBTU0sOEJBQThCO0lBQUU7SUFBWTtDQUFPO0FBRXpEOzs7Ozs7Ozs7Ozs7Ozs7O0NBZ0JDLEdB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