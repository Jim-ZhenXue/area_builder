// Copyright 2020-2024, University of Colorado Boulder
/**
 * NOTE: This is only for loading strings in the unbuilt mode.
 *
 * NOTE: This will check the query string value for ?locale directly. See initialize-globals.js for reference.
 *
 * Kicks off the loading of runtime strings very early in the unbuilt loading process, ideally so that it
 * doesn't block the loading of modules. This is because we need the string information to be loaded before we can
 * kick off the module process.
 *
 * It will fill up phet.chipper.strings with the needed values, for use by simulation code and in particular
 * getStringModule. It will then call window.phet.chipper.loadModules() once complete, to progress with the module
 * process.
 *
 * To function properly, phet.chipper.stringRepos will need to be defined before this executes (generally in the
 * initialization script, or in the dev .html).
 *
 * A string "key" is in the form of "NAMESPACE/key.from.strings.json"
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ (()=>{
    // Namespace verification
    window.phet = window.phet || {};
    window.phet.chipper = window.phet.chipper || {};
    // Constructing the string map
    window.phet.chipper.strings = {};
    window.phet.chipper.stringMetadata = {};
    // Will be initialized after we have loaded localeData (below)
    let rtlLocales;
    const localesQueryParam = new window.URLSearchParams(window.location.search).get('locales');
    let remainingFilesToProcess = 0;
    const FALLBACK_LOCALE = 'en';
    /**
   * Takes the string-file object for a given locale/requirejsNamespace, and fills in the phet.chipper.strings inside
   * that locale with any recognized strings inside.
   *
   * @param {Object} stringObject - In general, an object where if it has a `value: {string}` key then it represents
   *                                a string key with a value, otherwise each level represents a grouping.
   * @param {string} requirejsNamespace - e.g. 'JOIST'
   * @param {string} locale
   */ const processStringFile = (stringObject, requirejsNamespace, locale)=>{
        // See if we are in an RTL locale (lodash is unavailable at this point)
        let isRTL = false;
        rtlLocales.forEach((rtlLocale)=>{
            if (locale.startsWith(rtlLocale)) {
                isRTL = true;
            }
        });
        const stringKeyPrefix = `${requirejsNamespace}/`;
        // Ensure a locale-specific sub-object
        phet.chipper.strings[locale] = phet.chipper.strings[locale] || {};
        const localeStringMap = phet.chipper.strings[locale];
        const recurse = (path, object)=>{
            Object.keys(object).forEach((key)=>{
                if (key === 'value') {
                    let value = object.value;
                    // Add directional marks
                    if (value.length > 0) {
                        value = `${isRTL ? '\u202b' : '\u202a'}${value}\u202c`;
                    }
                    const stringKey = `${stringKeyPrefix}${path}`;
                    localeStringMap[stringKey] = value;
                    if (locale === FALLBACK_LOCALE && object.metadata) {
                        phet.chipper.stringMetadata[stringKey] = object.metadata;
                    }
                } else if (object[key] && typeof object[key] === 'object') {
                    recurse(`${path}${path.length ? '.' : ''}${key}`, object[key]);
                }
            });
        };
        recurse('', stringObject);
    };
    /**
   * Load a conglomerate string file with many locales. Only used in locales=*
   */ const processConglomerateStringFile = (stringObject, requirejsNamespace)=>{
        const locales = Object.keys(stringObject);
        locales.forEach((locale)=>{
            // See if we are in an RTL locale (lodash is unavailable at this point)
            let isRTL = false;
            rtlLocales.forEach((rtlLocale)=>{
                if (locale.startsWith(rtlLocale)) {
                    isRTL = true;
                }
            });
            const stringKeyPrefix = `${requirejsNamespace}/`;
            // Ensure a locale-specific sub-object
            phet.chipper.strings[locale] = phet.chipper.strings[locale] || {};
            const localeStringMap = phet.chipper.strings[locale];
            const recurse = (path, object)=>{
                Object.keys(object).forEach((key)=>{
                    if (key === 'value') {
                        let value = object.value;
                        // Add directional marks
                        if (value.length > 0) {
                            value = `${isRTL ? '\u202b' : '\u202a'}${value}\u202c`;
                        }
                        localeStringMap[`${stringKeyPrefix}${path}`] = value;
                    } else if (object[key] && typeof object[key] === 'object') {
                        recurse(`${path}${path.length ? '.' : ''}${key}`, object[key]);
                    }
                });
            };
            recurse('', stringObject[locale]);
        });
    };
    /**
   * Fires off a request for a JSON file, either in babel (for non-English) strings, or in the actual repo
   * (for English) strings, or for the unbuilt_en strings file. When it is loaded, it will try to parse the response
   * and then pass the object for processing.
   *
   * @param {string} path - Relative path to load JSON file from
   * @param {Function|null} callback
   */ const requestJSONFile = (path, callback)=>{
        remainingFilesToProcess++;
        const request = new XMLHttpRequest();
        request.addEventListener('load', ()=>{
            if (request.status === 200) {
                let json;
                try {
                    json = JSON.parse(request.responseText);
                } catch (e) {
                    throw new Error(`Could load file ${path}, perhaps that translation does not exist yet?`);
                }
                callback && callback(json);
            }
            if (--remainingFilesToProcess === 0) {
                finishProcessing();
            }
        });
        request.addEventListener('error', ()=>{
            if (!(localesQueryParam === '*')) {
                console.log(`Could not load ${path}`);
            }
            if (--remainingFilesToProcess === 0) {
                finishProcessing();
            }
        });
        request.open('GET', path, true);
        request.send();
    };
    // The callback to execute when all string files are processed.
    const finishProcessing = ()=>{
        // Because load-unbuilt-strings' "loading" of the locale data and strings might not have happened BEFORE initialize-globals
        // runs (and sets phet.chipper.locale), we'll attempt to handle the case where it hasn't been set yet. You'll see the same call over in initialize-globals
        phet.chipper.checkAndRemapLocale && phet.chipper.checkAndRemapLocale();
        // Progress with loading modules
        window.phet.chipper.loadModules();
    };
    const withStringPath = (path)=>`${phet.chipper.stringPath ? phet.chipper.stringPath : ''}${path}`;
    // Check for phet.chipper.stringPath. This should be set to ADJUST the path to the strings directory, in cases
    // where we're running this case NOT from a repo's top level (e.g. sandbox.html)
    const getStringPath = (repo, locale)=>withStringPath(`../${locale === FALLBACK_LOCALE ? '' : 'babel/'}${repo}/${repo}-strings_${locale}.json`);
    // See if our request for the sim-specific strings file works. If so, only then will we load the common repos files
    // for that locale.
    const ourRepo = phet.chipper.packageObject.name;
    let ourRequirejsNamespace;
    phet.chipper.stringRepos.forEach((data)=>{
        if (data.repo === ourRepo) {
            ourRequirejsNamespace = data.requirejsNamespace;
        }
    });
    // TODO https://github.com/phetsims/phet-io/issues/1877 Uncomment this to load the used string list
    // requestJSONFile( `../phet-io-sim-specific/repos/${ourRepo}/used-strings_en.json`, json => {
    //
    //   // Store for runtime usage
    //   phet.chipper.usedStringsEN = json;
    // } );
    // Load locale data
    remainingFilesToProcess++;
    requestJSONFile(withStringPath('../babel/localeData.json'), (json)=>{
        phet.chipper.localeData = json;
        rtlLocales = Object.keys(phet.chipper.localeData).filter((locale)=>{
            return phet.chipper.localeData[locale].direction === 'rtl';
        });
        // Load the conglomerate files
        requestJSONFile(withStringPath(`../babel/_generated_development_strings/${ourRepo}_all.json`), (json)=>{
            processConglomerateStringFile(json, ourRequirejsNamespace);
            phet.chipper.stringRepos.forEach((stringRepoData)=>{
                const repo = stringRepoData.repo;
                if (repo !== ourRepo) {
                    requestJSONFile(withStringPath(`../babel/_generated_development_strings/${repo}_all.json`), (json)=>{
                        processConglomerateStringFile(json, stringRepoData.requirejsNamespace);
                    });
                }
            });
        });
        // Even though the English strings are included in the conglomerate file, load the english file directly so that
        // you can change _en strings without having to run 'grunt generate-unbuilt-strings' before seeing changes.
        requestJSONFile(getStringPath(ourRepo, 'en'), (json)=>{
            processStringFile(json, ourRequirejsNamespace, 'en');
            phet.chipper.stringRepos.forEach((stringRepoData)=>{
                const repo = stringRepoData.repo;
                if (repo !== ourRepo) {
                    requestJSONFile(getStringPath(repo, 'en'), (json)=>{
                        processStringFile(json, stringRepoData.requirejsNamespace, 'en');
                    });
                }
            });
        });
        remainingFilesToProcess--;
    });
})();

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2pzL2Jyb3dzZXIvbG9hZC11bmJ1aWx0LXN0cmluZ3MuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjAtMjAyNCwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbi8qKlxuICogTk9URTogVGhpcyBpcyBvbmx5IGZvciBsb2FkaW5nIHN0cmluZ3MgaW4gdGhlIHVuYnVpbHQgbW9kZS5cbiAqXG4gKiBOT1RFOiBUaGlzIHdpbGwgY2hlY2sgdGhlIHF1ZXJ5IHN0cmluZyB2YWx1ZSBmb3IgP2xvY2FsZSBkaXJlY3RseS4gU2VlIGluaXRpYWxpemUtZ2xvYmFscy5qcyBmb3IgcmVmZXJlbmNlLlxuICpcbiAqIEtpY2tzIG9mZiB0aGUgbG9hZGluZyBvZiBydW50aW1lIHN0cmluZ3MgdmVyeSBlYXJseSBpbiB0aGUgdW5idWlsdCBsb2FkaW5nIHByb2Nlc3MsIGlkZWFsbHkgc28gdGhhdCBpdFxuICogZG9lc24ndCBibG9jayB0aGUgbG9hZGluZyBvZiBtb2R1bGVzLiBUaGlzIGlzIGJlY2F1c2Ugd2UgbmVlZCB0aGUgc3RyaW5nIGluZm9ybWF0aW9uIHRvIGJlIGxvYWRlZCBiZWZvcmUgd2UgY2FuXG4gKiBraWNrIG9mZiB0aGUgbW9kdWxlIHByb2Nlc3MuXG4gKlxuICogSXQgd2lsbCBmaWxsIHVwIHBoZXQuY2hpcHBlci5zdHJpbmdzIHdpdGggdGhlIG5lZWRlZCB2YWx1ZXMsIGZvciB1c2UgYnkgc2ltdWxhdGlvbiBjb2RlIGFuZCBpbiBwYXJ0aWN1bGFyXG4gKiBnZXRTdHJpbmdNb2R1bGUuIEl0IHdpbGwgdGhlbiBjYWxsIHdpbmRvdy5waGV0LmNoaXBwZXIubG9hZE1vZHVsZXMoKSBvbmNlIGNvbXBsZXRlLCB0byBwcm9ncmVzcyB3aXRoIHRoZSBtb2R1bGVcbiAqIHByb2Nlc3MuXG4gKlxuICogVG8gZnVuY3Rpb24gcHJvcGVybHksIHBoZXQuY2hpcHBlci5zdHJpbmdSZXBvcyB3aWxsIG5lZWQgdG8gYmUgZGVmaW5lZCBiZWZvcmUgdGhpcyBleGVjdXRlcyAoZ2VuZXJhbGx5IGluIHRoZVxuICogaW5pdGlhbGl6YXRpb24gc2NyaXB0LCBvciBpbiB0aGUgZGV2IC5odG1sKS5cbiAqXG4gKiBBIHN0cmluZyBcImtleVwiIGlzIGluIHRoZSBmb3JtIG9mIFwiTkFNRVNQQUNFL2tleS5mcm9tLnN0cmluZ3MuanNvblwiXG4gKlxuICogQGF1dGhvciBKb25hdGhhbiBPbHNvbiA8am9uYXRoYW4ub2xzb25AY29sb3JhZG8uZWR1PlxuICovXG5cbiggKCkgPT4ge1xuICAvLyBOYW1lc3BhY2UgdmVyaWZpY2F0aW9uXG4gIHdpbmRvdy5waGV0ID0gd2luZG93LnBoZXQgfHwge307XG4gIHdpbmRvdy5waGV0LmNoaXBwZXIgPSB3aW5kb3cucGhldC5jaGlwcGVyIHx8IHt9O1xuXG4gIC8vIENvbnN0cnVjdGluZyB0aGUgc3RyaW5nIG1hcFxuICB3aW5kb3cucGhldC5jaGlwcGVyLnN0cmluZ3MgPSB7fTtcbiAgd2luZG93LnBoZXQuY2hpcHBlci5zdHJpbmdNZXRhZGF0YSA9IHt9O1xuXG4gIC8vIFdpbGwgYmUgaW5pdGlhbGl6ZWQgYWZ0ZXIgd2UgaGF2ZSBsb2FkZWQgbG9jYWxlRGF0YSAoYmVsb3cpXG4gIGxldCBydGxMb2NhbGVzO1xuXG4gIGNvbnN0IGxvY2FsZXNRdWVyeVBhcmFtID0gbmV3IHdpbmRvdy5VUkxTZWFyY2hQYXJhbXMoIHdpbmRvdy5sb2NhdGlvbi5zZWFyY2ggKS5nZXQoICdsb2NhbGVzJyApO1xuXG4gIGxldCByZW1haW5pbmdGaWxlc1RvUHJvY2VzcyA9IDA7XG5cbiAgY29uc3QgRkFMTEJBQ0tfTE9DQUxFID0gJ2VuJztcblxuICAvKipcbiAgICogVGFrZXMgdGhlIHN0cmluZy1maWxlIG9iamVjdCBmb3IgYSBnaXZlbiBsb2NhbGUvcmVxdWlyZWpzTmFtZXNwYWNlLCBhbmQgZmlsbHMgaW4gdGhlIHBoZXQuY2hpcHBlci5zdHJpbmdzIGluc2lkZVxuICAgKiB0aGF0IGxvY2FsZSB3aXRoIGFueSByZWNvZ25pemVkIHN0cmluZ3MgaW5zaWRlLlxuICAgKlxuICAgKiBAcGFyYW0ge09iamVjdH0gc3RyaW5nT2JqZWN0IC0gSW4gZ2VuZXJhbCwgYW4gb2JqZWN0IHdoZXJlIGlmIGl0IGhhcyBhIGB2YWx1ZToge3N0cmluZ31gIGtleSB0aGVuIGl0IHJlcHJlc2VudHNcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGEgc3RyaW5nIGtleSB3aXRoIGEgdmFsdWUsIG90aGVyd2lzZSBlYWNoIGxldmVsIHJlcHJlc2VudHMgYSBncm91cGluZy5cbiAgICogQHBhcmFtIHtzdHJpbmd9IHJlcXVpcmVqc05hbWVzcGFjZSAtIGUuZy4gJ0pPSVNUJ1xuICAgKiBAcGFyYW0ge3N0cmluZ30gbG9jYWxlXG4gICAqL1xuICBjb25zdCBwcm9jZXNzU3RyaW5nRmlsZSA9ICggc3RyaW5nT2JqZWN0LCByZXF1aXJlanNOYW1lc3BhY2UsIGxvY2FsZSApID0+IHtcbiAgICAvLyBTZWUgaWYgd2UgYXJlIGluIGFuIFJUTCBsb2NhbGUgKGxvZGFzaCBpcyB1bmF2YWlsYWJsZSBhdCB0aGlzIHBvaW50KVxuICAgIGxldCBpc1JUTCA9IGZhbHNlO1xuICAgIHJ0bExvY2FsZXMuZm9yRWFjaCggcnRsTG9jYWxlID0+IHtcbiAgICAgIGlmICggbG9jYWxlLnN0YXJ0c1dpdGgoIHJ0bExvY2FsZSApICkge1xuICAgICAgICBpc1JUTCA9IHRydWU7XG4gICAgICB9XG4gICAgfSApO1xuXG4gICAgY29uc3Qgc3RyaW5nS2V5UHJlZml4ID0gYCR7cmVxdWlyZWpzTmFtZXNwYWNlfS9gO1xuXG4gICAgLy8gRW5zdXJlIGEgbG9jYWxlLXNwZWNpZmljIHN1Yi1vYmplY3RcbiAgICBwaGV0LmNoaXBwZXIuc3RyaW5nc1sgbG9jYWxlIF0gPSBwaGV0LmNoaXBwZXIuc3RyaW5nc1sgbG9jYWxlIF0gfHwge307XG4gICAgY29uc3QgbG9jYWxlU3RyaW5nTWFwID0gcGhldC5jaGlwcGVyLnN0cmluZ3NbIGxvY2FsZSBdO1xuXG4gICAgY29uc3QgcmVjdXJzZSA9ICggcGF0aCwgb2JqZWN0ICkgPT4ge1xuICAgICAgT2JqZWN0LmtleXMoIG9iamVjdCApLmZvckVhY2goIGtleSA9PiB7XG4gICAgICAgIGlmICgga2V5ID09PSAndmFsdWUnICkge1xuICAgICAgICAgIGxldCB2YWx1ZSA9IG9iamVjdC52YWx1ZTtcblxuICAgICAgICAgIC8vIEFkZCBkaXJlY3Rpb25hbCBtYXJrc1xuICAgICAgICAgIGlmICggdmFsdWUubGVuZ3RoID4gMCApIHtcbiAgICAgICAgICAgIHZhbHVlID0gYCR7KCBpc1JUTCA/ICdcXHUyMDJiJyA6ICdcXHUyMDJhJyApfSR7dmFsdWV9XFx1MjAyY2A7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgY29uc3Qgc3RyaW5nS2V5ID0gYCR7c3RyaW5nS2V5UHJlZml4fSR7cGF0aH1gO1xuXG4gICAgICAgICAgbG9jYWxlU3RyaW5nTWFwWyBzdHJpbmdLZXkgXSA9IHZhbHVlO1xuXG4gICAgICAgICAgaWYgKCBsb2NhbGUgPT09IEZBTExCQUNLX0xPQ0FMRSAmJiBvYmplY3QubWV0YWRhdGEgKSB7XG4gICAgICAgICAgICBwaGV0LmNoaXBwZXIuc3RyaW5nTWV0YWRhdGFbIHN0cmluZ0tleSBdID0gb2JqZWN0Lm1ldGFkYXRhO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmICggb2JqZWN0WyBrZXkgXSAmJiB0eXBlb2Ygb2JqZWN0WyBrZXkgXSA9PT0gJ29iamVjdCcgKSB7XG4gICAgICAgICAgcmVjdXJzZSggYCR7cGF0aH0ke3BhdGgubGVuZ3RoID8gJy4nIDogJyd9JHtrZXl9YCwgb2JqZWN0WyBrZXkgXSApO1xuICAgICAgICB9XG4gICAgICB9ICk7XG4gICAgfTtcbiAgICByZWN1cnNlKCAnJywgc3RyaW5nT2JqZWN0ICk7XG4gIH07XG5cbiAgLyoqXG4gICAqIExvYWQgYSBjb25nbG9tZXJhdGUgc3RyaW5nIGZpbGUgd2l0aCBtYW55IGxvY2FsZXMuIE9ubHkgdXNlZCBpbiBsb2NhbGVzPSpcbiAgICovXG4gIGNvbnN0IHByb2Nlc3NDb25nbG9tZXJhdGVTdHJpbmdGaWxlID0gKCBzdHJpbmdPYmplY3QsIHJlcXVpcmVqc05hbWVzcGFjZSApID0+IHtcblxuICAgIGNvbnN0IGxvY2FsZXMgPSBPYmplY3Qua2V5cyggc3RyaW5nT2JqZWN0ICk7XG5cbiAgICBsb2NhbGVzLmZvckVhY2goIGxvY2FsZSA9PiB7XG5cbiAgICAgIC8vIFNlZSBpZiB3ZSBhcmUgaW4gYW4gUlRMIGxvY2FsZSAobG9kYXNoIGlzIHVuYXZhaWxhYmxlIGF0IHRoaXMgcG9pbnQpXG4gICAgICBsZXQgaXNSVEwgPSBmYWxzZTtcbiAgICAgIHJ0bExvY2FsZXMuZm9yRWFjaCggcnRsTG9jYWxlID0+IHtcbiAgICAgICAgaWYgKCBsb2NhbGUuc3RhcnRzV2l0aCggcnRsTG9jYWxlICkgKSB7XG4gICAgICAgICAgaXNSVEwgPSB0cnVlO1xuICAgICAgICB9XG4gICAgICB9ICk7XG5cbiAgICAgIGNvbnN0IHN0cmluZ0tleVByZWZpeCA9IGAke3JlcXVpcmVqc05hbWVzcGFjZX0vYDtcblxuICAgICAgLy8gRW5zdXJlIGEgbG9jYWxlLXNwZWNpZmljIHN1Yi1vYmplY3RcbiAgICAgIHBoZXQuY2hpcHBlci5zdHJpbmdzWyBsb2NhbGUgXSA9IHBoZXQuY2hpcHBlci5zdHJpbmdzWyBsb2NhbGUgXSB8fCB7fTtcbiAgICAgIGNvbnN0IGxvY2FsZVN0cmluZ01hcCA9IHBoZXQuY2hpcHBlci5zdHJpbmdzWyBsb2NhbGUgXTtcblxuICAgICAgY29uc3QgcmVjdXJzZSA9ICggcGF0aCwgb2JqZWN0ICkgPT4ge1xuICAgICAgICBPYmplY3Qua2V5cyggb2JqZWN0ICkuZm9yRWFjaCgga2V5ID0+IHtcbiAgICAgICAgICBpZiAoIGtleSA9PT0gJ3ZhbHVlJyApIHtcbiAgICAgICAgICAgIGxldCB2YWx1ZSA9IG9iamVjdC52YWx1ZTtcblxuICAgICAgICAgICAgLy8gQWRkIGRpcmVjdGlvbmFsIG1hcmtzXG4gICAgICAgICAgICBpZiAoIHZhbHVlLmxlbmd0aCA+IDAgKSB7XG4gICAgICAgICAgICAgIHZhbHVlID0gYCR7KCBpc1JUTCA/ICdcXHUyMDJiJyA6ICdcXHUyMDJhJyApfSR7dmFsdWV9XFx1MjAyY2A7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGxvY2FsZVN0cmluZ01hcFsgYCR7c3RyaW5nS2V5UHJlZml4fSR7cGF0aH1gIF0gPSB2YWx1ZTtcbiAgICAgICAgICB9XG4gICAgICAgICAgZWxzZSBpZiAoIG9iamVjdFsga2V5IF0gJiYgdHlwZW9mIG9iamVjdFsga2V5IF0gPT09ICdvYmplY3QnICkge1xuICAgICAgICAgICAgcmVjdXJzZSggYCR7cGF0aH0ke3BhdGgubGVuZ3RoID8gJy4nIDogJyd9JHtrZXl9YCwgb2JqZWN0WyBrZXkgXSApO1xuICAgICAgICAgIH1cbiAgICAgICAgfSApO1xuICAgICAgfTtcbiAgICAgIHJlY3Vyc2UoICcnLCBzdHJpbmdPYmplY3RbIGxvY2FsZSBdICk7XG4gICAgfSApO1xuICB9O1xuXG4gIC8qKlxuICAgKiBGaXJlcyBvZmYgYSByZXF1ZXN0IGZvciBhIEpTT04gZmlsZSwgZWl0aGVyIGluIGJhYmVsIChmb3Igbm9uLUVuZ2xpc2gpIHN0cmluZ3MsIG9yIGluIHRoZSBhY3R1YWwgcmVwb1xuICAgKiAoZm9yIEVuZ2xpc2gpIHN0cmluZ3MsIG9yIGZvciB0aGUgdW5idWlsdF9lbiBzdHJpbmdzIGZpbGUuIFdoZW4gaXQgaXMgbG9hZGVkLCBpdCB3aWxsIHRyeSB0byBwYXJzZSB0aGUgcmVzcG9uc2VcbiAgICogYW5kIHRoZW4gcGFzcyB0aGUgb2JqZWN0IGZvciBwcm9jZXNzaW5nLlxuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gcGF0aCAtIFJlbGF0aXZlIHBhdGggdG8gbG9hZCBKU09OIGZpbGUgZnJvbVxuICAgKiBAcGFyYW0ge0Z1bmN0aW9ufG51bGx9IGNhbGxiYWNrXG4gICAqL1xuICBjb25zdCByZXF1ZXN0SlNPTkZpbGUgPSAoIHBhdGgsIGNhbGxiYWNrICkgPT4ge1xuICAgIHJlbWFpbmluZ0ZpbGVzVG9Qcm9jZXNzKys7XG5cbiAgICBjb25zdCByZXF1ZXN0ID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XG4gICAgcmVxdWVzdC5hZGRFdmVudExpc3RlbmVyKCAnbG9hZCcsICgpID0+IHtcbiAgICAgIGlmICggcmVxdWVzdC5zdGF0dXMgPT09IDIwMCApIHtcbiAgICAgICAgbGV0IGpzb247XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAganNvbiA9IEpTT04ucGFyc2UoIHJlcXVlc3QucmVzcG9uc2VUZXh0ICk7XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2goIGUgKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCBgQ291bGQgbG9hZCBmaWxlICR7cGF0aH0sIHBlcmhhcHMgdGhhdCB0cmFuc2xhdGlvbiBkb2VzIG5vdCBleGlzdCB5ZXQ/YCApO1xuICAgICAgICB9XG4gICAgICAgIGNhbGxiYWNrICYmIGNhbGxiYWNrKCBqc29uICk7XG4gICAgICB9XG4gICAgICBpZiAoIC0tcmVtYWluaW5nRmlsZXNUb1Byb2Nlc3MgPT09IDAgKSB7XG4gICAgICAgIGZpbmlzaFByb2Nlc3NpbmcoKTtcbiAgICAgIH1cbiAgICB9ICk7XG5cbiAgICByZXF1ZXN0LmFkZEV2ZW50TGlzdGVuZXIoICdlcnJvcicsICgpID0+IHtcbiAgICAgIGlmICggISggbG9jYWxlc1F1ZXJ5UGFyYW0gPT09ICcqJyApICkge1xuICAgICAgICBjb25zb2xlLmxvZyggYENvdWxkIG5vdCBsb2FkICR7cGF0aH1gICk7XG4gICAgICB9XG4gICAgICBpZiAoIC0tcmVtYWluaW5nRmlsZXNUb1Byb2Nlc3MgPT09IDAgKSB7XG4gICAgICAgIGZpbmlzaFByb2Nlc3NpbmcoKTtcbiAgICAgIH1cbiAgICB9ICk7XG5cbiAgICByZXF1ZXN0Lm9wZW4oICdHRVQnLCBwYXRoLCB0cnVlICk7XG4gICAgcmVxdWVzdC5zZW5kKCk7XG4gIH07XG5cbiAgLy8gVGhlIGNhbGxiYWNrIHRvIGV4ZWN1dGUgd2hlbiBhbGwgc3RyaW5nIGZpbGVzIGFyZSBwcm9jZXNzZWQuXG4gIGNvbnN0IGZpbmlzaFByb2Nlc3NpbmcgPSAoKSA9PiB7XG5cbiAgICAvLyBCZWNhdXNlIGxvYWQtdW5idWlsdC1zdHJpbmdzJyBcImxvYWRpbmdcIiBvZiB0aGUgbG9jYWxlIGRhdGEgYW5kIHN0cmluZ3MgbWlnaHQgbm90IGhhdmUgaGFwcGVuZWQgQkVGT1JFIGluaXRpYWxpemUtZ2xvYmFsc1xuICAgIC8vIHJ1bnMgKGFuZCBzZXRzIHBoZXQuY2hpcHBlci5sb2NhbGUpLCB3ZSdsbCBhdHRlbXB0IHRvIGhhbmRsZSB0aGUgY2FzZSB3aGVyZSBpdCBoYXNuJ3QgYmVlbiBzZXQgeWV0LiBZb3UnbGwgc2VlIHRoZSBzYW1lIGNhbGwgb3ZlciBpbiBpbml0aWFsaXplLWdsb2JhbHNcbiAgICBwaGV0LmNoaXBwZXIuY2hlY2tBbmRSZW1hcExvY2FsZSAmJiBwaGV0LmNoaXBwZXIuY2hlY2tBbmRSZW1hcExvY2FsZSgpO1xuXG4gICAgLy8gUHJvZ3Jlc3Mgd2l0aCBsb2FkaW5nIG1vZHVsZXNcbiAgICB3aW5kb3cucGhldC5jaGlwcGVyLmxvYWRNb2R1bGVzKCk7XG4gIH07XG5cbiAgY29uc3Qgd2l0aFN0cmluZ1BhdGggPSBwYXRoID0+IGAke3BoZXQuY2hpcHBlci5zdHJpbmdQYXRoID8gcGhldC5jaGlwcGVyLnN0cmluZ1BhdGggOiAnJ30ke3BhdGh9YDtcblxuICAvLyBDaGVjayBmb3IgcGhldC5jaGlwcGVyLnN0cmluZ1BhdGguIFRoaXMgc2hvdWxkIGJlIHNldCB0byBBREpVU1QgdGhlIHBhdGggdG8gdGhlIHN0cmluZ3MgZGlyZWN0b3J5LCBpbiBjYXNlc1xuICAvLyB3aGVyZSB3ZSdyZSBydW5uaW5nIHRoaXMgY2FzZSBOT1QgZnJvbSBhIHJlcG8ncyB0b3AgbGV2ZWwgKGUuZy4gc2FuZGJveC5odG1sKVxuICBjb25zdCBnZXRTdHJpbmdQYXRoID0gKCByZXBvLCBsb2NhbGUgKSA9PiB3aXRoU3RyaW5nUGF0aCggYC4uLyR7bG9jYWxlID09PSBGQUxMQkFDS19MT0NBTEUgPyAnJyA6ICdiYWJlbC8nfSR7cmVwb30vJHtyZXBvfS1zdHJpbmdzXyR7bG9jYWxlfS5qc29uYCApO1xuXG4gIC8vIFNlZSBpZiBvdXIgcmVxdWVzdCBmb3IgdGhlIHNpbS1zcGVjaWZpYyBzdHJpbmdzIGZpbGUgd29ya3MuIElmIHNvLCBvbmx5IHRoZW4gd2lsbCB3ZSBsb2FkIHRoZSBjb21tb24gcmVwb3MgZmlsZXNcbiAgLy8gZm9yIHRoYXQgbG9jYWxlLlxuICBjb25zdCBvdXJSZXBvID0gcGhldC5jaGlwcGVyLnBhY2thZ2VPYmplY3QubmFtZTtcbiAgbGV0IG91clJlcXVpcmVqc05hbWVzcGFjZTtcbiAgcGhldC5jaGlwcGVyLnN0cmluZ1JlcG9zLmZvckVhY2goIGRhdGEgPT4ge1xuICAgIGlmICggZGF0YS5yZXBvID09PSBvdXJSZXBvICkge1xuICAgICAgb3VyUmVxdWlyZWpzTmFtZXNwYWNlID0gZGF0YS5yZXF1aXJlanNOYW1lc3BhY2U7XG4gICAgfVxuICB9ICk7XG5cbiAgLy8gVE9ETyBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvcGhldC1pby9pc3N1ZXMvMTg3NyBVbmNvbW1lbnQgdGhpcyB0byBsb2FkIHRoZSB1c2VkIHN0cmluZyBsaXN0XG4gIC8vIHJlcXVlc3RKU09ORmlsZSggYC4uL3BoZXQtaW8tc2ltLXNwZWNpZmljL3JlcG9zLyR7b3VyUmVwb30vdXNlZC1zdHJpbmdzX2VuLmpzb25gLCBqc29uID0+IHtcbiAgLy9cbiAgLy8gICAvLyBTdG9yZSBmb3IgcnVudGltZSB1c2FnZVxuICAvLyAgIHBoZXQuY2hpcHBlci51c2VkU3RyaW5nc0VOID0ganNvbjtcbiAgLy8gfSApO1xuXG4gIC8vIExvYWQgbG9jYWxlIGRhdGFcbiAgcmVtYWluaW5nRmlsZXNUb1Byb2Nlc3MrKztcbiAgcmVxdWVzdEpTT05GaWxlKCB3aXRoU3RyaW5nUGF0aCggJy4uL2JhYmVsL2xvY2FsZURhdGEuanNvbicgKSwganNvbiA9PiB7XG4gICAgcGhldC5jaGlwcGVyLmxvY2FsZURhdGEgPSBqc29uO1xuXG4gICAgcnRsTG9jYWxlcyA9IE9iamVjdC5rZXlzKCBwaGV0LmNoaXBwZXIubG9jYWxlRGF0YSApLmZpbHRlciggbG9jYWxlID0+IHtcbiAgICAgIHJldHVybiBwaGV0LmNoaXBwZXIubG9jYWxlRGF0YVsgbG9jYWxlIF0uZGlyZWN0aW9uID09PSAncnRsJztcbiAgICB9ICk7XG5cbiAgICAvLyBMb2FkIHRoZSBjb25nbG9tZXJhdGUgZmlsZXNcbiAgICByZXF1ZXN0SlNPTkZpbGUoIHdpdGhTdHJpbmdQYXRoKCBgLi4vYmFiZWwvX2dlbmVyYXRlZF9kZXZlbG9wbWVudF9zdHJpbmdzLyR7b3VyUmVwb31fYWxsLmpzb25gICksIGpzb24gPT4ge1xuICAgICAgcHJvY2Vzc0Nvbmdsb21lcmF0ZVN0cmluZ0ZpbGUoIGpzb24sIG91clJlcXVpcmVqc05hbWVzcGFjZSApO1xuICAgICAgcGhldC5jaGlwcGVyLnN0cmluZ1JlcG9zLmZvckVhY2goIHN0cmluZ1JlcG9EYXRhID0+IHtcbiAgICAgICAgY29uc3QgcmVwbyA9IHN0cmluZ1JlcG9EYXRhLnJlcG87XG4gICAgICAgIGlmICggcmVwbyAhPT0gb3VyUmVwbyApIHtcbiAgICAgICAgICByZXF1ZXN0SlNPTkZpbGUoIHdpdGhTdHJpbmdQYXRoKCBgLi4vYmFiZWwvX2dlbmVyYXRlZF9kZXZlbG9wbWVudF9zdHJpbmdzLyR7cmVwb31fYWxsLmpzb25gICksIGpzb24gPT4ge1xuICAgICAgICAgICAgcHJvY2Vzc0Nvbmdsb21lcmF0ZVN0cmluZ0ZpbGUoIGpzb24sIHN0cmluZ1JlcG9EYXRhLnJlcXVpcmVqc05hbWVzcGFjZSApO1xuICAgICAgICAgIH0gKTtcbiAgICAgICAgfVxuICAgICAgfSApO1xuICAgIH0gKTtcblxuICAgIC8vIEV2ZW4gdGhvdWdoIHRoZSBFbmdsaXNoIHN0cmluZ3MgYXJlIGluY2x1ZGVkIGluIHRoZSBjb25nbG9tZXJhdGUgZmlsZSwgbG9hZCB0aGUgZW5nbGlzaCBmaWxlIGRpcmVjdGx5IHNvIHRoYXRcbiAgICAvLyB5b3UgY2FuIGNoYW5nZSBfZW4gc3RyaW5ncyB3aXRob3V0IGhhdmluZyB0byBydW4gJ2dydW50IGdlbmVyYXRlLXVuYnVpbHQtc3RyaW5ncycgYmVmb3JlIHNlZWluZyBjaGFuZ2VzLlxuICAgIHJlcXVlc3RKU09ORmlsZSggZ2V0U3RyaW5nUGF0aCggb3VyUmVwbywgJ2VuJyApLCBqc29uID0+IHtcbiAgICAgIHByb2Nlc3NTdHJpbmdGaWxlKCBqc29uLCBvdXJSZXF1aXJlanNOYW1lc3BhY2UsICdlbicgKTtcbiAgICAgIHBoZXQuY2hpcHBlci5zdHJpbmdSZXBvcy5mb3JFYWNoKCBzdHJpbmdSZXBvRGF0YSA9PiB7XG4gICAgICAgIGNvbnN0IHJlcG8gPSBzdHJpbmdSZXBvRGF0YS5yZXBvO1xuICAgICAgICBpZiAoIHJlcG8gIT09IG91clJlcG8gKSB7XG4gICAgICAgICAgcmVxdWVzdEpTT05GaWxlKCBnZXRTdHJpbmdQYXRoKCByZXBvLCAnZW4nICksIGpzb24gPT4ge1xuICAgICAgICAgICAgcHJvY2Vzc1N0cmluZ0ZpbGUoIGpzb24sIHN0cmluZ1JlcG9EYXRhLnJlcXVpcmVqc05hbWVzcGFjZSwgJ2VuJyApO1xuICAgICAgICAgIH0gKTtcbiAgICAgICAgfVxuICAgICAgfSApO1xuICAgIH0gKTtcblxuICAgIHJlbWFpbmluZ0ZpbGVzVG9Qcm9jZXNzLS07XG4gIH0gKTtcbn0gKSgpOyJdLCJuYW1lcyI6WyJ3aW5kb3ciLCJwaGV0IiwiY2hpcHBlciIsInN0cmluZ3MiLCJzdHJpbmdNZXRhZGF0YSIsInJ0bExvY2FsZXMiLCJsb2NhbGVzUXVlcnlQYXJhbSIsIlVSTFNlYXJjaFBhcmFtcyIsImxvY2F0aW9uIiwic2VhcmNoIiwiZ2V0IiwicmVtYWluaW5nRmlsZXNUb1Byb2Nlc3MiLCJGQUxMQkFDS19MT0NBTEUiLCJwcm9jZXNzU3RyaW5nRmlsZSIsInN0cmluZ09iamVjdCIsInJlcXVpcmVqc05hbWVzcGFjZSIsImxvY2FsZSIsImlzUlRMIiwiZm9yRWFjaCIsInJ0bExvY2FsZSIsInN0YXJ0c1dpdGgiLCJzdHJpbmdLZXlQcmVmaXgiLCJsb2NhbGVTdHJpbmdNYXAiLCJyZWN1cnNlIiwicGF0aCIsIm9iamVjdCIsIk9iamVjdCIsImtleXMiLCJrZXkiLCJ2YWx1ZSIsImxlbmd0aCIsInN0cmluZ0tleSIsIm1ldGFkYXRhIiwicHJvY2Vzc0Nvbmdsb21lcmF0ZVN0cmluZ0ZpbGUiLCJsb2NhbGVzIiwicmVxdWVzdEpTT05GaWxlIiwiY2FsbGJhY2siLCJyZXF1ZXN0IiwiWE1MSHR0cFJlcXVlc3QiLCJhZGRFdmVudExpc3RlbmVyIiwic3RhdHVzIiwianNvbiIsIkpTT04iLCJwYXJzZSIsInJlc3BvbnNlVGV4dCIsImUiLCJFcnJvciIsImZpbmlzaFByb2Nlc3NpbmciLCJjb25zb2xlIiwibG9nIiwib3BlbiIsInNlbmQiLCJjaGVja0FuZFJlbWFwTG9jYWxlIiwibG9hZE1vZHVsZXMiLCJ3aXRoU3RyaW5nUGF0aCIsInN0cmluZ1BhdGgiLCJnZXRTdHJpbmdQYXRoIiwicmVwbyIsIm91clJlcG8iLCJwYWNrYWdlT2JqZWN0IiwibmFtZSIsIm91clJlcXVpcmVqc05hbWVzcGFjZSIsInN0cmluZ1JlcG9zIiwiZGF0YSIsImxvY2FsZURhdGEiLCJmaWx0ZXIiLCJkaXJlY3Rpb24iLCJzdHJpbmdSZXBvRGF0YSJdLCJtYXBwaW5ncyI6IkFBQUEsc0RBQXNEO0FBRXREOzs7Ozs7Ozs7Ozs7Ozs7Ozs7O0NBbUJDLEdBRUMsQ0FBQTtJQUNBLHlCQUF5QjtJQUN6QkEsT0FBT0MsSUFBSSxHQUFHRCxPQUFPQyxJQUFJLElBQUksQ0FBQztJQUM5QkQsT0FBT0MsSUFBSSxDQUFDQyxPQUFPLEdBQUdGLE9BQU9DLElBQUksQ0FBQ0MsT0FBTyxJQUFJLENBQUM7SUFFOUMsOEJBQThCO0lBQzlCRixPQUFPQyxJQUFJLENBQUNDLE9BQU8sQ0FBQ0MsT0FBTyxHQUFHLENBQUM7SUFDL0JILE9B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