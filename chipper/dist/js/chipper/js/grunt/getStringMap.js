// Copyright 2015-2024, University of Colorado Boulder
// eslint-disable-next-line phet/bad-typescript-text
// @ts-nocheck
/**
 * Returns a map such that map["locale"]["REPO/stringKey"] will be the string value (with fallbacks to English where needed).
 * Loads each string file only once, and only loads the repository/locale combinations necessary.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ import assert from 'assert';
import fs from 'fs';
import _ from 'lodash';
import path from 'path';
import grunt from '../../../perennial-alias/js/npm-dependencies/grunt.js';
import ChipperConstants from '../common/ChipperConstants.js';
import ChipperStringUtils from '../common/ChipperStringUtils.js';
import pascalCase from '../common/pascalCase.js';
const localeData = JSON.parse(fs.readFileSync('../babel/localeData.json', 'utf8'));
/**
 * For a given locale, return an array of specific locales that we'll use as fallbacks, e.g.
 * 'ar_AE' => [ 'ar_AE', 'ar', 'ar_MA', 'en' ]   (note, changed from zh_CN example, which does NOT use 'zh' as a fallback anymore)
 * 'es' => [ 'es', 'en' ]
 * 'en' => [ 'en' ]
 *
 */ const localeFallbacks = (locale)=>{
    return [
        ...locale !== ChipperConstants.FALLBACK_LOCALE ? [
            locale
        ] : [],
        ...localeData[locale].fallbackLocales || [],
        ChipperConstants.FALLBACK_LOCALE // e.g. 'en'
    ];
};
/**
 * Load all the required string files into memory, so we don't load them multiple times (for each usage).
 *
 * @param reposWithUsedStrings - All of the repos that have 1+ used strings
 * @param locales - All supported locales for this build
 * @returns - maps {locale:string} => Another map with: {stringKey:string} => {stringValue:string}
 */ const getStringFilesContents = (reposWithUsedStrings, locales)=>{
    const stringFilesContents = {}; // maps [repositoryName][locale] => contents of locale string file
    reposWithUsedStrings.forEach((repo)=>{
        stringFilesContents[repo] = {};
        /**
     * Adds a locale into our stringFilesContents map.
     */ const addLocale = (locale, isRTL)=>{
            // Read optional string file
            const stringsFilename = path.normalize(`../${locale === ChipperConstants.FALLBACK_LOCALE ? '' : 'babel/'}${repo}/${repo}-strings_${locale}.json`);
            let fileContents;
            try {
                fileContents = JSON.parse(fs.readFileSync(stringsFilename, 'utf-8'));
            } catch (error) {
                grunt.log.verbose.writeln(`missing string file: ${stringsFilename}`);
                fileContents = {};
            }
            // Format the string values
            ChipperStringUtils.formatStringValues(fileContents, isRTL);
            stringFilesContents[repo][locale] = fileContents;
        };
        // Include fallback locales (they may have duplicates)
        const includedLocales = _.sortBy(_.uniq(locales.flatMap((locale)=>{
            assert(localeData[locale], `unsupported locale: ${locale}`);
            return localeFallbacks(locale);
        })));
        includedLocales.forEach((locale)=>addLocale(locale, localeData[locale].direction === 'rtl'));
    });
    return stringFilesContents;
};
/**
 * @param mainRepo
 * @param locales
 * @param phetLibs - Used to check for bad string dependencies
 * @param usedModules - relative file path of the module (filename) from the repos root
 */ export default function getStringMap(mainRepo, locales, phetLibs, usedModules) {
    assert(locales.includes(ChipperConstants.FALLBACK_LOCALE), 'fallback locale is required');
    // Load the file contents of every single JS module that used any strings
    const usedFileContents = usedModules.map((usedModule)=>fs.readFileSync(`../${usedModule}`, 'utf-8'));
    // Compute which repositories contain one or more used strings (since we'll need to load string files for those
    // repositories).
    let reposWithUsedStrings = [];
    usedFileContents.forEach((fileContent)=>{
        // [a-zA-Z_$][a-zA-Z0-9_$] ---- general JS identifiers, first character can't be a number
        // [^\n\r] ---- grab everything except for newlines here, so we get everything
        const allImportStatements = fileContent.match(/import [a-zA-Z_$][a-zA-Z0-9_$]*Strings from '[^\n\r]+Strings.js';/g);
        if (allImportStatements) {
            reposWithUsedStrings.push(...allImportStatements.map((importStatement)=>{
                // Grabs out the prefix before `Strings.js` (without the leading slash too)
                const importName = importStatement.match(/\/([\w-]+)Strings\.js/)[1];
                // kebab case the repo
                return _.kebabCase(importName);
            }));
        }
    });
    reposWithUsedStrings = _.uniq(reposWithUsedStrings).filter((repo)=>{
        return fs.existsSync(`../${repo}/package.json`);
    });
    // Compute a map of {repo:string} => {requirejsNamepsace:string}, so we can construct full string keys from strings
    // that would be accessing them, e.g. `JoistStrings.ResetAllButton.name` => `JOIST/ResetAllButton.name`.
    const requirejsNamespaceMap = {};
    reposWithUsedStrings.forEach((repo)=>{
        const packageObject = JSON.parse(fs.readFileSync(`../${repo}/package.json`, 'utf-8'));
        requirejsNamespaceMap[repo] = packageObject.phet.requirejsNamespace;
    });
    // Load all the required string files into memory, so we don't load them multiple times (for each usage)
    // maps [repositoryName][locale] => contents of locale string file
    const stringFilesContents = getStringFilesContents(reposWithUsedStrings, locales);
    // Initialize our full stringMap object (which will be filled with results and then returned as our string map).
    const stringMap = {};
    const stringMetadata = {};
    locales.forEach((locale)=>{
        stringMap[locale] = {};
    });
    // combine our strings into [locale][stringKey] map, using the fallback locale where necessary. In regards to nested
    // strings, this data structure doesn't nest. Instead it gets nested string values, and then sets them with the
    // flat key string like `"FRICTION/a11y.some.string.here": { value: 'My Some String' }`
    reposWithUsedStrings.forEach((repo)=>{
        // Scan all of the files with string module references, scanning for anything that looks like a string access for
        // our repo. This will include the string module reference, e.g. `JoistStrings.ResetAllButton.name`, but could also
        // include slightly more (since we're string parsing), e.g. `JoistStrings.ResetAllButton.name.length` would be
        // included, even though only part of that is a string access.
        let stringAccesses = [];
        const prefix = `${pascalCase(repo)}Strings`; // e.g. JoistStrings
        usedFileContents.forEach((fileContent, i)=>{
            // Only scan files where we can identify an import for it
            if (fileContent.includes(`import ${prefix} from`)) {
                // Look for normal matches, e.g. `JoistStrings.` followed by one or more chunks like:
                // .somethingVaguely_alphaNum3r1c
                // [ 'aStringInBracketsBecauseOfSpecialCharacters' ]
                //
                // It will also then end on anything that doesn't look like another one of those chunks
                // [a-zA-Z_$][a-zA-Z0-9_$]* ---- this grabs things that looks like valid JS identifiers
                // \\[ '[^']+' \\])+ ---- this grabs things like our second case above
                // [^\\.\\[] ---- matches something at the end that is NOT either of those other two cases
                // It is also generalized to support arbitrary whitespace and requires that ' match ' or " match ", since
                // this must support JS code and minified TypeScript code
                // Matches one final character that is not '.' or '[', since any valid string accesses should NOT have that
                // after. NOTE: there are some degenerate cases that will break this, e.g.:
                // - JoistStrings.someStringProperty[ 0 ]
                // - JoistStrings.something[ 0 ]
                // - JoistStrings.something[ 'length' ]
                const matches = fileContent.match(new RegExp(`${prefix}(\\.[a-zA-Z_$][a-zA-Z0-9_$]*|\\[\\s*['"][^'"]+['"]\\s*\\])+[^\\.\\[]`, 'g'));
                if (matches) {
                    stringAccesses.push(...matches.map((match)=>{
                        return match// We always have to strip off the last character - it's a character that shouldn't be in a string access
                        .slice(0, match.length - 1)// Handle JoistStrings[ 'some-thingStringProperty' ].value => JoistStrings[ 'some-thing' ]
                        // -- Anything after StringProperty should go
                        // away, but we need to add the final '] to maintain the format
                        .replace(/StringProperty'].*/, '\']')// Handle JoistStrings.somethingStringProperty.value => JoistStrings.something
                        .replace(/StringProperty.*/, '');
                    }));
                }
            }
        });
        // Strip off our prefixes, so our stringAccesses will have things like `'ResetAllButton.name'` inside.
        stringAccesses = _.uniq(stringAccesses).map((str)=>str.slice(prefix.length));
        // The JS outputted by TS is minified and missing the whitespace
        const depth = 2;
        // Turn each string access into an array of parts, e.g. '.ResetAllButton.name' => [ 'ResetAllButton', 'name' ]
        // or '[ \'A\' ].B[ \'C\' ]' => [ 'A', 'B', 'C' ]
        // Regex grabs either `.identifier` or `[ 'text' ]`.
        const stringKeysByParts = stringAccesses.map((access)=>access.match(/\.[a-zA-Z_$][a-zA-Z0-9_$]*|\[\s*['"][^'"]+['"]\s*\]/g).map((token)=>{
                return token.startsWith('.') ? token.slice(1) : token.slice(depth, token.length - depth);
            }));
        // Concatenate the string parts for each access into something that looks like a partial string key, e.g.
        // [ 'ResetAllButton', 'name' ] => 'ResetAllButton.name'
        const partialStringKeys = _.uniq(stringKeysByParts.map((parts)=>parts.join('.'))).filter((key)=>key !== 'js');
        // For each string key and locale, we'll look up the string entry and fill it into the stringMap
        partialStringKeys.forEach((partialStringKey)=>{
            locales.forEach((locale)=>{
                let stringEntry = null;
                for (const fallbackLocale of localeFallbacks(locale)){
                    const stringFileContents = stringFilesContents[repo][fallbackLocale];
                    if (stringFileContents) {
                        stringEntry = ChipperStringUtils.getStringEntryFromMap(stringFileContents, partialStringKey);
                        if (stringEntry) {
                            break;
                        }
                    }
                }
                if (!partialStringKey.endsWith('StringProperty')) {
                    assert(stringEntry !== null, `Missing string information for ${repo} ${partialStringKey}`);
                    const stringKey = `${requirejsNamespaceMap[repo]}/${partialStringKey}`;
                    stringMap[locale][stringKey] = stringEntry.value;
                    if (stringEntry.metadata && locale === ChipperConstants.FALLBACK_LOCALE) {
                        stringMetadata[stringKey] = stringEntry.metadata;
                    }
                }
            });
        });
    });
    return {
        stringMap: stringMap,
        stringMetadata: stringMetadata
    };
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2pzL2dydW50L2dldFN0cmluZ01hcC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNS0yMDI0LCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIHBoZXQvYmFkLXR5cGVzY3JpcHQtdGV4dFxuLy8gQHRzLW5vY2hlY2tcblxuLyoqXG4gKiBSZXR1cm5zIGEgbWFwIHN1Y2ggdGhhdCBtYXBbXCJsb2NhbGVcIl1bXCJSRVBPL3N0cmluZ0tleVwiXSB3aWxsIGJlIHRoZSBzdHJpbmcgdmFsdWUgKHdpdGggZmFsbGJhY2tzIHRvIEVuZ2xpc2ggd2hlcmUgbmVlZGVkKS5cbiAqIExvYWRzIGVhY2ggc3RyaW5nIGZpbGUgb25seSBvbmNlLCBhbmQgb25seSBsb2FkcyB0aGUgcmVwb3NpdG9yeS9sb2NhbGUgY29tYmluYXRpb25zIG5lY2Vzc2FyeS5cbiAqXG4gKiBAYXV0aG9yIEpvbmF0aGFuIE9sc29uIDxqb25hdGhhbi5vbHNvbkBjb2xvcmFkby5lZHU+XG4gKi9cblxuaW1wb3J0IGFzc2VydCBmcm9tICdhc3NlcnQnO1xuaW1wb3J0IGZzIGZyb20gJ2ZzJztcbmltcG9ydCBfIGZyb20gJ2xvZGFzaCc7XG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCBncnVudCBmcm9tICcuLi8uLi8uLi9wZXJlbm5pYWwtYWxpYXMvanMvbnBtLWRlcGVuZGVuY2llcy9ncnVudC5qcyc7XG5pbXBvcnQgeyBQaGV0aW9FbGVtZW50TWV0YWRhdGEgfSBmcm9tICcuLi8uLi8uLi90YW5kZW0vanMvcGhldC1pby10eXBlcy5qcyc7XG5pbXBvcnQgQ2hpcHBlckNvbnN0YW50cyBmcm9tICcuLi9jb21tb24vQ2hpcHBlckNvbnN0YW50cy5qcyc7XG5pbXBvcnQgQ2hpcHBlclN0cmluZ1V0aWxzIGZyb20gJy4uL2NvbW1vbi9DaGlwcGVyU3RyaW5nVXRpbHMuanMnO1xuaW1wb3J0IHBhc2NhbENhc2UgZnJvbSAnLi4vY29tbW9uL3Bhc2NhbENhc2UuanMnO1xuXG5cbmV4cG9ydCB0eXBlIExvY2FsZSA9IHN0cmluZztcblxuLy8gVE9ETzogVXNlIHRoaXMgaW4gYWxsIHNwb3RzIGltcG9ydGluZyBsb2NhbGVEYXRhLmpzb24gaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2NoaXBwZXIvaXNzdWVzLzE1MzlcbmV4cG9ydCB0eXBlIExvY2FsZURhdGEgPSBSZWNvcmQ8TG9jYWxlLCB7XG4gIGVuZ2xpc2hOYW1lOiBzdHJpbmc7XG4gIGxvY2FsaXplZE5hbWU6IHN0cmluZztcbiAgZGlyZWN0aW9uOiAncnRsJyB8ICdsdHInO1xuICBsb2NhbGUzPzogc3RyaW5nO1xuICBmYWxsYmFja0xvY2FsZXM/OiBMb2NhbGVbXTtcbn0+O1xuXG4vLyBNZXRhZGF0YSBmb3IgYSBzaW5nbGUgc3RyaW5nIGtleSBmcm9tIGFuIGVuZ2xpc2ggc3RyaW5ncyBmaWxlXG50eXBlIFN0cmluZ0tleU1ldGFkYXRhID0gUmVjb3JkPHN0cmluZywgYm9vbGVhbiB8IHN0cmluZyB8IG51bWJlcj4gJiBQaGV0aW9FbGVtZW50TWV0YWRhdGE7XG5cbmNvbnN0IGxvY2FsZURhdGE6IExvY2FsZURhdGEgPSBKU09OLnBhcnNlKCBmcy5yZWFkRmlsZVN5bmMoICcuLi9iYWJlbC9sb2NhbGVEYXRhLmpzb24nLCAndXRmOCcgKSApO1xuXG4vLyBUT0RPOiBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvY2hpcHBlci9pc3N1ZXMvMTUzN1xuZXhwb3J0IHR5cGUgU3RyaW5nTWFwID0gUmVjb3JkPHN0cmluZywgUmVjb3JkPHN0cmluZywgc3RyaW5nPj47XG5cbi8qKlxuICogRm9yIGEgZ2l2ZW4gbG9jYWxlLCByZXR1cm4gYW4gYXJyYXkgb2Ygc3BlY2lmaWMgbG9jYWxlcyB0aGF0IHdlJ2xsIHVzZSBhcyBmYWxsYmFja3MsIGUuZy5cbiAqICdhcl9BRScgPT4gWyAnYXJfQUUnLCAnYXInLCAnYXJfTUEnLCAnZW4nIF0gICAobm90ZSwgY2hhbmdlZCBmcm9tIHpoX0NOIGV4YW1wbGUsIHdoaWNoIGRvZXMgTk9UIHVzZSAnemgnIGFzIGEgZmFsbGJhY2sgYW55bW9yZSlcbiAqICdlcycgPT4gWyAnZXMnLCAnZW4nIF1cbiAqICdlbicgPT4gWyAnZW4nIF1cbiAqXG4gKi9cbmNvbnN0IGxvY2FsZUZhbGxiYWNrcyA9ICggbG9jYWxlOiBMb2NhbGUgKTogTG9jYWxlW10gPT4ge1xuICByZXR1cm4gW1xuICAgIC4uLiggbG9jYWxlICE9PSBDaGlwcGVyQ29uc3RhbnRzLkZBTExCQUNLX0xPQ0FMRSA/IFsgbG9jYWxlIF0gOiBbXSApLFxuICAgIC4uLiggbG9jYWxlRGF0YVsgbG9jYWxlIF0uZmFsbGJhY2tMb2NhbGVzIHx8IFtdICksXG4gICAgQ2hpcHBlckNvbnN0YW50cy5GQUxMQkFDS19MT0NBTEUgLy8gZS5nLiAnZW4nXG4gIF07XG59O1xuXG4vKipcbiAqIExvYWQgYWxsIHRoZSByZXF1aXJlZCBzdHJpbmcgZmlsZXMgaW50byBtZW1vcnksIHNvIHdlIGRvbid0IGxvYWQgdGhlbSBtdWx0aXBsZSB0aW1lcyAoZm9yIGVhY2ggdXNhZ2UpLlxuICpcbiAqIEBwYXJhbSByZXBvc1dpdGhVc2VkU3RyaW5ncyAtIEFsbCBvZiB0aGUgcmVwb3MgdGhhdCBoYXZlIDErIHVzZWQgc3RyaW5nc1xuICogQHBhcmFtIGxvY2FsZXMgLSBBbGwgc3VwcG9ydGVkIGxvY2FsZXMgZm9yIHRoaXMgYnVpbGRcbiAqIEByZXR1cm5zIC0gbWFwcyB7bG9jYWxlOnN0cmluZ30gPT4gQW5vdGhlciBtYXAgd2l0aDoge3N0cmluZ0tleTpzdHJpbmd9ID0+IHtzdHJpbmdWYWx1ZTpzdHJpbmd9XG4gKi9cbmNvbnN0IGdldFN0cmluZ0ZpbGVzQ29udGVudHMgPSAoIHJlcG9zV2l0aFVzZWRTdHJpbmdzOiBzdHJpbmdbXSwgbG9jYWxlczogTG9jYWxlW10gKTogU3RyaW5nTWFwID0+IHtcbiAgY29uc3Qgc3RyaW5nRmlsZXNDb250ZW50czogU3RyaW5nTWFwID0ge307IC8vIG1hcHMgW3JlcG9zaXRvcnlOYW1lXVtsb2NhbGVdID0+IGNvbnRlbnRzIG9mIGxvY2FsZSBzdHJpbmcgZmlsZVxuXG4gIHJlcG9zV2l0aFVzZWRTdHJpbmdzLmZvckVhY2goIHJlcG8gPT4ge1xuICAgIHN0cmluZ0ZpbGVzQ29udGVudHNbIHJlcG8gXSA9IHt9IGFzIFJlY29yZDxzdHJpbmcsIHN0cmluZz47XG5cbiAgICAvKipcbiAgICAgKiBBZGRzIGEgbG9jYWxlIGludG8gb3VyIHN0cmluZ0ZpbGVzQ29udGVudHMgbWFwLlxuICAgICAqL1xuICAgIGNvbnN0IGFkZExvY2FsZSA9ICggbG9jYWxlOiBzdHJpbmcsIGlzUlRMOiBib29sZWFuICkgPT4ge1xuICAgICAgLy8gUmVhZCBvcHRpb25hbCBzdHJpbmcgZmlsZVxuICAgICAgY29uc3Qgc3RyaW5nc0ZpbGVuYW1lID0gcGF0aC5ub3JtYWxpemUoIGAuLi8ke2xvY2FsZSA9PT0gQ2hpcHBlckNvbnN0YW50cy5GQUxMQkFDS19MT0NBTEUgPyAnJyA6ICdiYWJlbC8nfSR7cmVwb30vJHtyZXBvfS1zdHJpbmdzXyR7bG9jYWxlfS5qc29uYCApO1xuICAgICAgbGV0IGZpbGVDb250ZW50cztcbiAgICAgIHRyeSB7XG4gICAgICAgIGZpbGVDb250ZW50cyA9IEpTT04ucGFyc2UoIGZzLnJlYWRGaWxlU3luYyggc3RyaW5nc0ZpbGVuYW1lLCAndXRmLTgnICkgKTtcbiAgICAgIH1cbiAgICAgIGNhdGNoKCBlcnJvciApIHtcbiAgICAgICAgZ3J1bnQubG9nLnZlcmJvc2Uud3JpdGVsbiggYG1pc3Npbmcgc3RyaW5nIGZpbGU6ICR7c3RyaW5nc0ZpbGVuYW1lfWAgKTtcbiAgICAgICAgZmlsZUNvbnRlbnRzID0ge307XG4gICAgICB9XG5cbiAgICAgIC8vIEZvcm1hdCB0aGUgc3RyaW5nIHZhbHVlc1xuICAgICAgQ2hpcHBlclN0cmluZ1V0aWxzLmZvcm1hdFN0cmluZ1ZhbHVlcyggZmlsZUNvbnRlbnRzLCBpc1JUTCApO1xuXG4gICAgICBzdHJpbmdGaWxlc0NvbnRlbnRzWyByZXBvIF1bIGxvY2FsZSBdID0gZmlsZUNvbnRlbnRzO1xuICAgIH07XG5cbiAgICAvLyBJbmNsdWRlIGZhbGxiYWNrIGxvY2FsZXMgKHRoZXkgbWF5IGhhdmUgZHVwbGljYXRlcylcbiAgICBjb25zdCBpbmNsdWRlZExvY2FsZXMgPSBfLnNvcnRCeSggXy51bmlxKCBsb2NhbGVzLmZsYXRNYXAoIGxvY2FsZSA9PiB7XG4gICAgICBhc3NlcnQoIGxvY2FsZURhdGFbIGxvY2FsZSBdLCBgdW5zdXBwb3J0ZWQgbG9jYWxlOiAke2xvY2FsZX1gICk7XG5cbiAgICAgIHJldHVybiBsb2NhbGVGYWxsYmFja3MoIGxvY2FsZSApO1xuICAgIH0gKSApICk7XG5cbiAgICBpbmNsdWRlZExvY2FsZXMuZm9yRWFjaCggbG9jYWxlID0+IGFkZExvY2FsZSggbG9jYWxlLCBsb2NhbGVEYXRhWyBsb2NhbGUgXS5kaXJlY3Rpb24gPT09ICdydGwnICkgKTtcbiAgfSApO1xuXG4gIHJldHVybiBzdHJpbmdGaWxlc0NvbnRlbnRzO1xufTtcblxuLyoqXG4gKiBAcGFyYW0gbWFpblJlcG9cbiAqIEBwYXJhbSBsb2NhbGVzXG4gKiBAcGFyYW0gcGhldExpYnMgLSBVc2VkIHRvIGNoZWNrIGZvciBiYWQgc3RyaW5nIGRlcGVuZGVuY2llc1xuICogQHBhcmFtIHVzZWRNb2R1bGVzIC0gcmVsYXRpdmUgZmlsZSBwYXRoIG9mIHRoZSBtb2R1bGUgKGZpbGVuYW1lKSBmcm9tIHRoZSByZXBvcyByb290XG4gKi9cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGdldFN0cmluZ01hcCggbWFpblJlcG86IHN0cmluZywgbG9jYWxlczogc3RyaW5nW10sIHBoZXRMaWJzOiBzdHJpbmdbXSwgdXNlZE1vZHVsZXM6IHN0cmluZ1tdICk6IHsgc3RyaW5nTWFwOiBTdHJpbmdNYXA7IHN0cmluZ01ldGFkYXRhOiBSZWNvcmQ8c3RyaW5nLCBTdHJpbmdLZXlNZXRhZGF0YT4gfSB7XG5cbiAgYXNzZXJ0KCBsb2NhbGVzLmluY2x1ZGVzKCBDaGlwcGVyQ29uc3RhbnRzLkZBTExCQUNLX0xPQ0FMRSApLCAnZmFsbGJhY2sgbG9jYWxlIGlzIHJlcXVpcmVkJyApO1xuXG4gIC8vIExvYWQgdGhlIGZpbGUgY29udGVudHMgb2YgZXZlcnkgc2luZ2xlIEpTIG1vZHVsZSB0aGF0IHVzZWQgYW55IHN0cmluZ3NcbiAgY29uc3QgdXNlZEZpbGVDb250ZW50cyA9IHVzZWRNb2R1bGVzLm1hcCggdXNlZE1vZHVsZSA9PiBmcy5yZWFkRmlsZVN5bmMoIGAuLi8ke3VzZWRNb2R1bGV9YCwgJ3V0Zi04JyApICk7XG5cbiAgLy8gQ29tcHV0ZSB3aGljaCByZXBvc2l0b3JpZXMgY29udGFpbiBvbmUgb3IgbW9yZSB1c2VkIHN0cmluZ3MgKHNpbmNlIHdlJ2xsIG5lZWQgdG8gbG9hZCBzdHJpbmcgZmlsZXMgZm9yIHRob3NlXG4gIC8vIHJlcG9zaXRvcmllcykuXG4gIGxldCByZXBvc1dpdGhVc2VkU3RyaW5ncyA9IFtdO1xuICB1c2VkRmlsZUNvbnRlbnRzLmZvckVhY2goIGZpbGVDb250ZW50ID0+IHtcbiAgICAvLyBbYS16QS1aXyRdW2EtekEtWjAtOV8kXSAtLS0tIGdlbmVyYWwgSlMgaWRlbnRpZmllcnMsIGZpcnN0IGNoYXJhY3RlciBjYW4ndCBiZSBhIG51bWJlclxuICAgIC8vIFteXFxuXFxyXSAtLS0tIGdyYWIgZXZlcnl0aGluZyBleGNlcHQgZm9yIG5ld2xpbmVzIGhlcmUsIHNvIHdlIGdldCBldmVyeXRoaW5nXG4gICAgY29uc3QgYWxsSW1wb3J0U3RhdGVtZW50cyA9IGZpbGVDb250ZW50Lm1hdGNoKCAvaW1wb3J0IFthLXpBLVpfJF1bYS16QS1aMC05XyRdKlN0cmluZ3MgZnJvbSAnW15cXG5cXHJdK1N0cmluZ3MuanMnOy9nICk7XG4gICAgaWYgKCBhbGxJbXBvcnRTdGF0ZW1lbnRzICkge1xuICAgICAgcmVwb3NXaXRoVXNlZFN0cmluZ3MucHVzaCggLi4uYWxsSW1wb3J0U3RhdGVtZW50cy5tYXAoIGltcG9ydFN0YXRlbWVudCA9PiB7XG4gICAgICAgIC8vIEdyYWJzIG91dCB0aGUgcHJlZml4IGJlZm9yZSBgU3RyaW5ncy5qc2AgKHdpdGhvdXQgdGhlIGxlYWRpbmcgc2xhc2ggdG9vKVxuICAgICAgICBjb25zdCBpbXBvcnROYW1lID0gaW1wb3J0U3RhdGVtZW50Lm1hdGNoKCAvXFwvKFtcXHctXSspU3RyaW5nc1xcLmpzLyApWyAxIF07XG5cbiAgICAgICAgLy8ga2ViYWIgY2FzZSB0aGUgcmVwb1xuICAgICAgICByZXR1cm4gXy5rZWJhYkNhc2UoIGltcG9ydE5hbWUgKTtcbiAgICAgIH0gKSApO1xuICAgIH1cbiAgfSApO1xuICByZXBvc1dpdGhVc2VkU3RyaW5ncyA9IF8udW5pcSggcmVwb3NXaXRoVXNlZFN0cmluZ3MgKS5maWx0ZXIoIHJlcG8gPT4ge1xuICAgIHJldHVybiBmcy5leGlzdHNTeW5jKCBgLi4vJHtyZXBvfS9wYWNrYWdlLmpzb25gICk7XG4gIH0gKTtcblxuICAvLyBDb21wdXRlIGEgbWFwIG9mIHtyZXBvOnN0cmluZ30gPT4ge3JlcXVpcmVqc05hbWVwc2FjZTpzdHJpbmd9LCBzbyB3ZSBjYW4gY29uc3RydWN0IGZ1bGwgc3RyaW5nIGtleXMgZnJvbSBzdHJpbmdzXG4gIC8vIHRoYXQgd291bGQgYmUgYWNjZXNzaW5nIHRoZW0sIGUuZy4gYEpvaXN0U3RyaW5ncy5SZXNldEFsbEJ1dHRvbi5uYW1lYCA9PiBgSk9JU1QvUmVzZXRBbGxCdXR0b24ubmFtZWAuXG4gIGNvbnN0IHJlcXVpcmVqc05hbWVzcGFjZU1hcCA9IHt9O1xuICByZXBvc1dpdGhVc2VkU3RyaW5ncy5mb3JFYWNoKCByZXBvID0+IHtcbiAgICBjb25zdCBwYWNrYWdlT2JqZWN0ID0gSlNPTi5wYXJzZSggZnMucmVhZEZpbGVTeW5jKCBgLi4vJHtyZXBvfS9wYWNrYWdlLmpzb25gLCAndXRmLTgnICkgKTtcbiAgICByZXF1aXJlanNOYW1lc3BhY2VNYXBbIHJlcG8gXSA9IHBhY2thZ2VPYmplY3QucGhldC5yZXF1aXJlanNOYW1lc3BhY2U7XG4gIH0gKTtcblxuICAvLyBMb2FkIGFsbCB0aGUgcmVxdWlyZWQgc3RyaW5nIGZpbGVzIGludG8gbWVtb3J5LCBzbyB3ZSBkb24ndCBsb2FkIHRoZW0gbXVsdGlwbGUgdGltZXMgKGZvciBlYWNoIHVzYWdlKVxuICAvLyBtYXBzIFtyZXBvc2l0b3J5TmFtZV1bbG9jYWxlXSA9PiBjb250ZW50cyBvZiBsb2NhbGUgc3RyaW5nIGZpbGVcbiAgY29uc3Qgc3RyaW5nRmlsZXNDb250ZW50cyA9IGdldFN0cmluZ0ZpbGVzQ29udGVudHMoIHJlcG9zV2l0aFVzZWRTdHJpbmdzLCBsb2NhbGVzICk7XG5cbiAgLy8gSW5pdGlhbGl6ZSBvdXIgZnVsbCBzdHJpbmdNYXAgb2JqZWN0ICh3aGljaCB3aWxsIGJlIGZpbGxlZCB3aXRoIHJlc3VsdHMgYW5kIHRoZW4gcmV0dXJuZWQgYXMgb3VyIHN0cmluZyBtYXApLlxuICBjb25zdCBzdHJpbmdNYXAgPSB7fTtcbiAgY29uc3Qgc3RyaW5nTWV0YWRhdGEgPSB7fTtcbiAgbG9jYWxlcy5mb3JFYWNoKCBsb2NhbGUgPT4ge1xuICAgIHN0cmluZ01hcFsgbG9jYWxlIF0gPSB7fTtcbiAgfSApO1xuXG4gIC8vIGNvbWJpbmUgb3VyIHN0cmluZ3MgaW50byBbbG9jYWxlXVtzdHJpbmdLZXldIG1hcCwgdXNpbmcgdGhlIGZhbGxiYWNrIGxvY2FsZSB3aGVyZSBuZWNlc3NhcnkuIEluIHJlZ2FyZHMgdG8gbmVzdGVkXG4gIC8vIHN0cmluZ3MsIHRoaXMgZGF0YSBzdHJ1Y3R1cmUgZG9lc24ndCBuZXN0LiBJbnN0ZWFkIGl0IGdldHMgbmVzdGVkIHN0cmluZyB2YWx1ZXMsIGFuZCB0aGVuIHNldHMgdGhlbSB3aXRoIHRoZVxuICAvLyBmbGF0IGtleSBzdHJpbmcgbGlrZSBgXCJGUklDVElPTi9hMTF5LnNvbWUuc3RyaW5nLmhlcmVcIjogeyB2YWx1ZTogJ015IFNvbWUgU3RyaW5nJyB9YFxuICByZXBvc1dpdGhVc2VkU3RyaW5ncy5mb3JFYWNoKCByZXBvID0+IHtcblxuICAgIC8vIFNjYW4gYWxsIG9mIHRoZSBmaWxlcyB3aXRoIHN0cmluZyBtb2R1bGUgcmVmZXJlbmNlcywgc2Nhbm5pbmcgZm9yIGFueXRoaW5nIHRoYXQgbG9va3MgbGlrZSBhIHN0cmluZyBhY2Nlc3MgZm9yXG4gICAgLy8gb3VyIHJlcG8uIFRoaXMgd2lsbCBpbmNsdWRlIHRoZSBzdHJpbmcgbW9kdWxlIHJlZmVyZW5jZSwgZS5nLiBgSm9pc3RTdHJpbmdzLlJlc2V0QWxsQnV0dG9uLm5hbWVgLCBidXQgY291bGQgYWxzb1xuICAgIC8vIGluY2x1ZGUgc2xpZ2h0bHkgbW9yZSAoc2luY2Ugd2UncmUgc3RyaW5nIHBhcnNpbmcpLCBlLmcuIGBKb2lzdFN0cmluZ3MuUmVzZXRBbGxCdXR0b24ubmFtZS5sZW5ndGhgIHdvdWxkIGJlXG4gICAgLy8gaW5jbHVkZWQsIGV2ZW4gdGhvdWdoIG9ubHkgcGFydCBvZiB0aGF0IGlzIGEgc3RyaW5nIGFjY2Vzcy5cbiAgICBsZXQgc3RyaW5nQWNjZXNzZXMgPSBbXTtcblxuICAgIGNvbnN0IHByZWZpeCA9IGAke3Bhc2NhbENhc2UoIHJlcG8gKX1TdHJpbmdzYDsgLy8gZS5nLiBKb2lzdFN0cmluZ3NcbiAgICB1c2VkRmlsZUNvbnRlbnRzLmZvckVhY2goICggZmlsZUNvbnRlbnQsIGkgKSA9PiB7XG4gICAgICAvLyBPbmx5IHNjYW4gZmlsZXMgd2hlcmUgd2UgY2FuIGlkZW50aWZ5IGFuIGltcG9ydCBmb3IgaXRcbiAgICAgIGlmICggZmlsZUNvbnRlbnQuaW5jbHVkZXMoIGBpbXBvcnQgJHtwcmVmaXh9IGZyb21gICkgKSB7XG5cbiAgICAgICAgLy8gTG9vayBmb3Igbm9ybWFsIG1hdGNoZXMsIGUuZy4gYEpvaXN0U3RyaW5ncy5gIGZvbGxvd2VkIGJ5IG9uZSBvciBtb3JlIGNodW5rcyBsaWtlOlxuICAgICAgICAvLyAuc29tZXRoaW5nVmFndWVseV9hbHBoYU51bTNyMWNcbiAgICAgICAgLy8gWyAnYVN0cmluZ0luQnJhY2tldHNCZWNhdXNlT2ZTcGVjaWFsQ2hhcmFjdGVycycgXVxuICAgICAgICAvL1xuICAgICAgICAvLyBJdCB3aWxsIGFsc28gdGhlbiBlbmQgb24gYW55dGhpbmcgdGhhdCBkb2Vzbid0IGxvb2sgbGlrZSBhbm90aGVyIG9uZSBvZiB0aG9zZSBjaHVua3NcbiAgICAgICAgLy8gW2EtekEtWl8kXVthLXpBLVowLTlfJF0qIC0tLS0gdGhpcyBncmFicyB0aGluZ3MgdGhhdCBsb29rcyBsaWtlIHZhbGlkIEpTIGlkZW50aWZpZXJzXG4gICAgICAgIC8vIFxcXFxbICdbXiddKycgXFxcXF0pKyAtLS0tIHRoaXMgZ3JhYnMgdGhpbmdzIGxpa2Ugb3VyIHNlY29uZCBjYXNlIGFib3ZlXG4gICAgICAgIC8vIFteXFxcXC5cXFxcW10gLS0tLSBtYXRjaGVzIHNvbWV0aGluZyBhdCB0aGUgZW5kIHRoYXQgaXMgTk9UIGVpdGhlciBvZiB0aG9zZSBvdGhlciB0d28gY2FzZXNcbiAgICAgICAgLy8gSXQgaXMgYWxzbyBnZW5lcmFsaXplZCB0byBzdXBwb3J0IGFyYml0cmFyeSB3aGl0ZXNwYWNlIGFuZCByZXF1aXJlcyB0aGF0ICcgbWF0Y2ggJyBvciBcIiBtYXRjaCBcIiwgc2luY2VcbiAgICAgICAgLy8gdGhpcyBtdXN0IHN1cHBvcnQgSlMgY29kZSBhbmQgbWluaWZpZWQgVHlwZVNjcmlwdCBjb2RlXG4gICAgICAgIC8vIE1hdGNoZXMgb25lIGZpbmFsIGNoYXJhY3RlciB0aGF0IGlzIG5vdCAnLicgb3IgJ1snLCBzaW5jZSBhbnkgdmFsaWQgc3RyaW5nIGFjY2Vzc2VzIHNob3VsZCBOT1QgaGF2ZSB0aGF0XG4gICAgICAgIC8vIGFmdGVyLiBOT1RFOiB0aGVyZSBhcmUgc29tZSBkZWdlbmVyYXRlIGNhc2VzIHRoYXQgd2lsbCBicmVhayB0aGlzLCBlLmcuOlxuICAgICAgICAvLyAtIEpvaXN0U3RyaW5ncy5zb21lU3RyaW5nUHJvcGVydHlbIDAgXVxuICAgICAgICAvLyAtIEpvaXN0U3RyaW5ncy5zb21ldGhpbmdbIDAgXVxuICAgICAgICAvLyAtIEpvaXN0U3RyaW5ncy5zb21ldGhpbmdbICdsZW5ndGgnIF1cbiAgICAgICAgY29uc3QgbWF0Y2hlcyA9IGZpbGVDb250ZW50Lm1hdGNoKCBuZXcgUmVnRXhwKCBgJHtwcmVmaXh9KFxcXFwuW2EtekEtWl8kXVthLXpBLVowLTlfJF0qfFxcXFxbXFxcXHMqWydcIl1bXidcIl0rWydcIl1cXFxccypcXFxcXSkrW15cXFxcLlxcXFxbXWAsICdnJyApICk7XG4gICAgICAgIGlmICggbWF0Y2hlcyApIHtcbiAgICAgICAgICBzdHJpbmdBY2Nlc3Nlcy5wdXNoKCAuLi5tYXRjaGVzLm1hcCggbWF0Y2ggPT4ge1xuICAgICAgICAgICAgcmV0dXJuIG1hdGNoXG4gICAgICAgICAgICAgIC8vIFdlIGFsd2F5cyBoYXZlIHRvIHN0cmlwIG9mZiB0aGUgbGFzdCBjaGFyYWN0ZXIgLSBpdCdzIGEgY2hhcmFjdGVyIHRoYXQgc2hvdWxkbid0IGJlIGluIGEgc3RyaW5nIGFjY2Vzc1xuICAgICAgICAgICAgICAuc2xpY2UoIDAsIG1hdGNoLmxlbmd0aCAtIDEgKVxuICAgICAgICAgICAgICAvLyBIYW5kbGUgSm9pc3RTdHJpbmdzWyAnc29tZS10aGluZ1N0cmluZ1Byb3BlcnR5JyBdLnZhbHVlID0+IEpvaXN0U3RyaW5nc1sgJ3NvbWUtdGhpbmcnIF1cbiAgICAgICAgICAgICAgLy8gLS0gQW55dGhpbmcgYWZ0ZXIgU3RyaW5nUHJvcGVydHkgc2hvdWxkIGdvXG4gICAgICAgICAgICAgIC8vIGF3YXksIGJ1dCB3ZSBuZWVkIHRvIGFkZCB0aGUgZmluYWwgJ10gdG8gbWFpbnRhaW4gdGhlIGZvcm1hdFxuICAgICAgICAgICAgICAucmVwbGFjZSggL1N0cmluZ1Byb3BlcnR5J10uKi8sICdcXCddJyApXG4gICAgICAgICAgICAgIC8vIEhhbmRsZSBKb2lzdFN0cmluZ3Muc29tZXRoaW5nU3RyaW5nUHJvcGVydHkudmFsdWUgPT4gSm9pc3RTdHJpbmdzLnNvbWV0aGluZ1xuICAgICAgICAgICAgICAucmVwbGFjZSggL1N0cmluZ1Byb3BlcnR5LiovLCAnJyApO1xuICAgICAgICAgIH0gKSApO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSApO1xuXG4gICAgLy8gU3RyaXAgb2ZmIG91ciBwcmVmaXhlcywgc28gb3VyIHN0cmluZ0FjY2Vzc2VzIHdpbGwgaGF2ZSB0aGluZ3MgbGlrZSBgJ1Jlc2V0QWxsQnV0dG9uLm5hbWUnYCBpbnNpZGUuXG4gICAgc3RyaW5nQWNjZXNzZXMgPSBfLnVuaXEoIHN0cmluZ0FjY2Vzc2VzICkubWFwKCBzdHIgPT4gc3RyLnNsaWNlKCBwcmVmaXgubGVuZ3RoICkgKTtcblxuICAgIC8vIFRoZSBKUyBvdXRwdXR0ZWQgYnkgVFMgaXMgbWluaWZpZWQgYW5kIG1pc3NpbmcgdGhlIHdoaXRlc3BhY2VcbiAgICBjb25zdCBkZXB0aCA9IDI7XG5cbiAgICAvLyBUdXJuIGVhY2ggc3RyaW5nIGFjY2VzcyBpbnRvIGFuIGFycmF5IG9mIHBhcnRzLCBlLmcuICcuUmVzZXRBbGxCdXR0b24ubmFtZScgPT4gWyAnUmVzZXRBbGxCdXR0b24nLCAnbmFtZScgXVxuICAgIC8vIG9yICdbIFxcJ0FcXCcgXS5CWyBcXCdDXFwnIF0nID0+IFsgJ0EnLCAnQicsICdDJyBdXG4gICAgLy8gUmVnZXggZ3JhYnMgZWl0aGVyIGAuaWRlbnRpZmllcmAgb3IgYFsgJ3RleHQnIF1gLlxuICAgIGNvbnN0IHN0cmluZ0tleXNCeVBhcnRzID0gc3RyaW5nQWNjZXNzZXMubWFwKCBhY2Nlc3MgPT4gYWNjZXNzLm1hdGNoKCAvXFwuW2EtekEtWl8kXVthLXpBLVowLTlfJF0qfFxcW1xccypbJ1wiXVteJ1wiXStbJ1wiXVxccypcXF0vZyApLm1hcCggdG9rZW4gPT4ge1xuICAgICAgcmV0dXJuIHRva2VuLnN0YXJ0c1dpdGgoICcuJyApID8gdG9rZW4uc2xpY2UoIDEgKSA6IHRva2VuLnNsaWNlKCBkZXB0aCwgdG9rZW4ubGVuZ3RoIC0gZGVwdGggKTtcbiAgICB9ICkgKTtcblxuICAgIC8vIENvbmNhdGVuYXRlIHRoZSBzdHJpbmcgcGFydHMgZm9yIGVhY2ggYWNjZXNzIGludG8gc29tZXRoaW5nIHRoYXQgbG9va3MgbGlrZSBhIHBhcnRpYWwgc3RyaW5nIGtleSwgZS5nLlxuICAgIC8vIFsgJ1Jlc2V0QWxsQnV0dG9uJywgJ25hbWUnIF0gPT4gJ1Jlc2V0QWxsQnV0dG9uLm5hbWUnXG4gICAgY29uc3QgcGFydGlhbFN0cmluZ0tleXMgPSBfLnVuaXEoIHN0cmluZ0tleXNCeVBhcnRzLm1hcCggcGFydHMgPT4gcGFydHMuam9pbiggJy4nICkgKSApLmZpbHRlcigga2V5ID0+IGtleSAhPT0gJ2pzJyApO1xuXG4gICAgLy8gRm9yIGVhY2ggc3RyaW5nIGtleSBhbmQgbG9jYWxlLCB3ZSdsbCBsb29rIHVwIHRoZSBzdHJpbmcgZW50cnkgYW5kIGZpbGwgaXQgaW50byB0aGUgc3RyaW5nTWFwXG4gICAgcGFydGlhbFN0cmluZ0tleXMuZm9yRWFjaCggcGFydGlhbFN0cmluZ0tleSA9PiB7XG4gICAgICBsb2NhbGVzLmZvckVhY2goIGxvY2FsZSA9PiB7XG4gICAgICAgIGxldCBzdHJpbmdFbnRyeSA9IG51bGw7XG4gICAgICAgIGZvciAoIGNvbnN0IGZhbGxiYWNrTG9jYWxlIG9mIGxvY2FsZUZhbGxiYWNrcyggbG9jYWxlICkgKSB7XG4gICAgICAgICAgY29uc3Qgc3RyaW5nRmlsZUNvbnRlbnRzID0gc3RyaW5nRmlsZXNDb250ZW50c1sgcmVwbyBdWyBmYWxsYmFja0xvY2FsZSBdO1xuICAgICAgICAgIGlmICggc3RyaW5nRmlsZUNvbnRlbnRzICkge1xuICAgICAgICAgICAgc3RyaW5nRW50cnkgPSBDaGlwcGVyU3RyaW5nVXRpbHMuZ2V0U3RyaW5nRW50cnlGcm9tTWFwKCBzdHJpbmdGaWxlQ29udGVudHMsIHBhcnRpYWxTdHJpbmdLZXkgKTtcbiAgICAgICAgICAgIGlmICggc3RyaW5nRW50cnkgKSB7XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAoICFwYXJ0aWFsU3RyaW5nS2V5LmVuZHNXaXRoKCAnU3RyaW5nUHJvcGVydHknICkgKSB7XG4gICAgICAgICAgYXNzZXJ0KCBzdHJpbmdFbnRyeSAhPT0gbnVsbCwgYE1pc3Npbmcgc3RyaW5nIGluZm9ybWF0aW9uIGZvciAke3JlcG99ICR7cGFydGlhbFN0cmluZ0tleX1gICk7XG5cbiAgICAgICAgICBjb25zdCBzdHJpbmdLZXkgPSBgJHtyZXF1aXJlanNOYW1lc3BhY2VNYXBbIHJlcG8gXX0vJHtwYXJ0aWFsU3RyaW5nS2V5fWA7XG4gICAgICAgICAgc3RyaW5nTWFwWyBsb2NhbGUgXVsgc3RyaW5nS2V5IF0gPSBzdHJpbmdFbnRyeS52YWx1ZTtcbiAgICAgICAgICBpZiAoIHN0cmluZ0VudHJ5Lm1ldGFkYXRhICYmIGxvY2FsZSA9PT0gQ2hpcHBlckNvbnN0YW50cy5GQUxMQkFDS19MT0NBTEUgKSB7XG4gICAgICAgICAgICBzdHJpbmdNZXRhZGF0YVsgc3RyaW5nS2V5IF0gPSBzdHJpbmdFbnRyeS5tZXRhZGF0YTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0gKTtcbiAgICB9ICk7XG4gIH0gKTtcblxuICByZXR1cm4geyBzdHJpbmdNYXA6IHN0cmluZ01hcCwgc3RyaW5nTWV0YWRhdGE6IHN0cmluZ01ldGFkYXRhIH07XG59Il0sIm5hbWVzIjpbImFzc2VydCIsImZzIiwiXyIsInBhdGgiLCJncnVudCIsIkNoaXBwZXJDb25zdGFudHMiLCJDaGlwcGVyU3RyaW5nVXRpbHMiLCJwYXNjYWxDYXNlIiwibG9jYWxlRGF0YSIsIkpTT04iLCJwYXJzZSIsInJlYWRGaWxlU3luYyIsImxvY2FsZUZhbGxiYWNrcyIsImxvY2FsZSIsIkZBTExCQUNLX0xPQ0FMRSIsImZhbGxiYWNrTG9jYWxlcyIsImdldFN0cmluZ0ZpbGVzQ29udGVudHMiLCJyZXBvc1dpdGhVc2VkU3RyaW5ncyIsImxvY2FsZXMiLCJzdHJpbmdGaWxlc0NvbnRlbnRzIiwiZm9yRWFjaCIsInJlcG8iLCJhZGRMb2NhbGUiLCJpc1JUTCIsInN0cmluZ3NGaWxlbmFtZSIsIm5vcm1hbGl6ZSIsImZpbGVDb250ZW50cyIsImVycm9yIiwibG9nIiwidmVyYm9zZSIsIndyaXRlbG4iLCJmb3JtYXRTdHJpbmdWYWx1ZXMiLCJpbmNsdWRlZExvY2FsZXMiLCJzb3J0QnkiLCJ1bmlxIiwiZmxhdE1hcCIsImRpcmVjdGlvbiIsImdldFN0cmluZ01hcCIsIm1haW5SZXBvIiwicGhldExpYnMiLCJ1c2VkTW9kdWxlcyIsImluY2x1ZGVzIiwidXNlZEZpbGVDb250ZW50cyIsIm1hcCIsInVzZWRNb2R1bGUiLCJmaWxlQ29udGVudCIsImFsbEltcG9ydFN0YXRlbWVudHMiLCJtYXRjaCIsInB1c2giLCJpbXBvcnRTdGF0ZW1lbnQiLCJpbXBvcnROYW1lIiwia2ViYWJDYXNlIiwiZmlsdGVyIiwiZXhpc3RzU3luYyIsInJlcXVpcmVqc05hbWVzcGFjZU1hcCIsInBhY2thZ2VPYmplY3QiLCJwaGV0IiwicmVxdWlyZWpzTmFtZXNwYWNlIiwic3RyaW5nTWFwIiwic3RyaW5nTWV0YWRhdGEiLCJzdHJpbmdBY2Nlc3NlcyIsInByZWZpeCIsImkiLCJtYXRjaGVzIiwiUmVnRXhwIiwic2xpY2UiLCJsZW5ndGgiLCJyZXBsYWNlIiwic3RyIiwiZGVwdGgiLCJzdHJpbmdLZXlzQnlQYXJ0cyIsImFjY2VzcyIsInRva2VuIiwic3RhcnRzV2l0aCIsInBhcnRpYWxTdHJpbmdLZXlzIiwicGFydHMiLCJqb2luIiwia2V5IiwicGFydGlhbFN0cmluZ0tleSIsInN0cmluZ0VudHJ5IiwiZmFsbGJhY2tMb2NhbGUiLCJzdHJpbmdGaWxlQ29udGVudHMiLCJnZXRTdHJpbmdFbnRyeUZyb21NYXAiLCJlbmRzV2l0aCIsInN0cmluZ0tleSIsInZhbHVlIiwibWV0YWRhdGEiXSwibWFwcGluZ3MiOiJBQUFBLHNEQUFzRDtBQUV0RCxvREFBb0Q7QUFDcEQsY0FBYztBQUVkOzs7OztDQUtDLEdBRUQsT0FB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