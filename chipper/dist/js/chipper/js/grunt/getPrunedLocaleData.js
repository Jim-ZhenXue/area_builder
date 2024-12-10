// Copyright 2024, University of Colorado Boulder
/**
 * Computes the subset of localeData that should be shipped with a built simulation.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ import fs from 'fs';
import _ from 'lodash';
import ChipperConstants from '../common/ChipperConstants.js';
/**
 * Returns a subset of the localeData that should be included in the built simulation.
 *
 * @param localesWithTranslations - Array of locales that have translations
 */ export default ((localesWithTranslations)=>{
    // Load localeData
    const fullLocaleData = JSON.parse(fs.readFileSync('../babel/localeData.json', 'utf8'));
    // Include a (larger) subset of locales' localeData. It will need more locales than just the locales directly specified
    // in phet.chipper.strings (the stringMap). We also need locales that will fall back to ANY of those locales in phet.chipper.strings,
    // e.g. if we have an "es" translation, we will include the locale data for "es_PY" because it falls back to "es".
    const includedDataLocales = _.uniq([
        // Always include the fallback (en)
        ChipperConstants.FALLBACK_LOCALE,
        // Include directly-used locales
        ...localesWithTranslations,
        // Include locales that will fall back to locales with a translation
        ...Object.keys(fullLocaleData).filter((locale)=>{
            return fullLocaleData[locale].fallbackLocales && fullLocaleData[locale].fallbackLocales.some((fallbackLocale)=>{
                return localesWithTranslations.includes(fallbackLocale);
            });
        })
    ]);
    // If a locale is NOT included, and has no fallbacks that are included, BUT IS the fallback for another locale, we
    // should include it. For example, if we have NO "ak" translation, but we have a "tw" translation (which falls back to
    // "ak"), we will want to include "ak" (even though it won't ever contain non-English string translation), because we
    // may want to reference it (and want to not have "broken" locale links localeData).
    // This array would get longer as we iterate through it.
    for(let i = 0; i < includedDataLocales.length; i++){
        const locale = includedDataLocales[i];
        // If our locale is included, we should make sure all of its fallbackLocales are included
        const fallbackLocales = fullLocaleData[locale].fallbackLocales;
        if (fallbackLocales) {
            for (const fallbackLocale of fallbackLocales){
                if (!includedDataLocales.includes(fallbackLocale)) {
                    includedDataLocales.push(fallbackLocale);
                }
            }
        }
    }
    // The set of locales included in generated (subset of) localeData for this specific built simulation file
    // is satisfied by the following closure:
    //
    // 1. If a locale has a translation, include that locale.
    // 2. If one of a locale's localeData[ locale ].fallbackLocales is translated, include that locale.
    // 3. If a locale is in an included localeData[ someOtherLocale ].fallbackLocales, include that locale.
    // 4. Always include the default locale "en".
    const localeData = {};
    for (const locale of _.sortBy(includedDataLocales)){
        localeData[locale] = fullLocaleData[locale];
    }
    return localeData;
});

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2pzL2dydW50L2dldFBydW5lZExvY2FsZURhdGEudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjQsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIENvbXB1dGVzIHRoZSBzdWJzZXQgb2YgbG9jYWxlRGF0YSB0aGF0IHNob3VsZCBiZSBzaGlwcGVkIHdpdGggYSBidWlsdCBzaW11bGF0aW9uLlxuICpcbiAqIEBhdXRob3IgSm9uYXRoYW4gT2xzb24gPGpvbmF0aGFuLm9sc29uQGNvbG9yYWRvLmVkdT5cbiAqL1xuXG5pbXBvcnQgZnMgZnJvbSAnZnMnO1xuaW1wb3J0IF8gZnJvbSAnbG9kYXNoJztcbmltcG9ydCBDaGlwcGVyQ29uc3RhbnRzIGZyb20gJy4uL2NvbW1vbi9DaGlwcGVyQ29uc3RhbnRzLmpzJztcbmltcG9ydCB7IExvY2FsZSwgTG9jYWxlRGF0YSB9IGZyb20gJy4vZ2V0U3RyaW5nTWFwLmpzJztcblxuLyoqXG4gKiBSZXR1cm5zIGEgc3Vic2V0IG9mIHRoZSBsb2NhbGVEYXRhIHRoYXQgc2hvdWxkIGJlIGluY2x1ZGVkIGluIHRoZSBidWlsdCBzaW11bGF0aW9uLlxuICpcbiAqIEBwYXJhbSBsb2NhbGVzV2l0aFRyYW5zbGF0aW9ucyAtIEFycmF5IG9mIGxvY2FsZXMgdGhhdCBoYXZlIHRyYW5zbGF0aW9uc1xuICovXG5leHBvcnQgZGVmYXVsdCAoIGxvY2FsZXNXaXRoVHJhbnNsYXRpb25zOiBzdHJpbmdbXSApOiBvYmplY3QgPT4ge1xuXG4gIC8vIExvYWQgbG9jYWxlRGF0YVxuICBjb25zdCBmdWxsTG9jYWxlRGF0YTogTG9jYWxlRGF0YSA9IEpTT04ucGFyc2UoIGZzLnJlYWRGaWxlU3luYyggJy4uL2JhYmVsL2xvY2FsZURhdGEuanNvbicsICd1dGY4JyApICk7XG5cbiAgLy8gSW5jbHVkZSBhIChsYXJnZXIpIHN1YnNldCBvZiBsb2NhbGVzJyBsb2NhbGVEYXRhLiBJdCB3aWxsIG5lZWQgbW9yZSBsb2NhbGVzIHRoYW4ganVzdCB0aGUgbG9jYWxlcyBkaXJlY3RseSBzcGVjaWZpZWRcbiAgLy8gaW4gcGhldC5jaGlwcGVyLnN0cmluZ3MgKHRoZSBzdHJpbmdNYXApLiBXZSBhbHNvIG5lZWQgbG9jYWxlcyB0aGF0IHdpbGwgZmFsbCBiYWNrIHRvIEFOWSBvZiB0aG9zZSBsb2NhbGVzIGluIHBoZXQuY2hpcHBlci5zdHJpbmdzLFxuICAvLyBlLmcuIGlmIHdlIGhhdmUgYW4gXCJlc1wiIHRyYW5zbGF0aW9uLCB3ZSB3aWxsIGluY2x1ZGUgdGhlIGxvY2FsZSBkYXRhIGZvciBcImVzX1BZXCIgYmVjYXVzZSBpdCBmYWxscyBiYWNrIHRvIFwiZXNcIi5cbiAgY29uc3QgaW5jbHVkZWREYXRhTG9jYWxlczogTG9jYWxlW10gPSBfLnVuaXEoIFtcbiAgICAvLyBBbHdheXMgaW5jbHVkZSB0aGUgZmFsbGJhY2sgKGVuKVxuICAgIENoaXBwZXJDb25zdGFudHMuRkFMTEJBQ0tfTE9DQUxFLFxuXG4gICAgLy8gSW5jbHVkZSBkaXJlY3RseS11c2VkIGxvY2FsZXNcbiAgICAuLi5sb2NhbGVzV2l0aFRyYW5zbGF0aW9ucyxcblxuICAgIC8vIEluY2x1ZGUgbG9jYWxlcyB0aGF0IHdpbGwgZmFsbCBiYWNrIHRvIGxvY2FsZXMgd2l0aCBhIHRyYW5zbGF0aW9uXG4gICAgLi4uT2JqZWN0LmtleXMoIGZ1bGxMb2NhbGVEYXRhICkuZmlsdGVyKCBsb2NhbGUgPT4ge1xuICAgICAgcmV0dXJuIGZ1bGxMb2NhbGVEYXRhWyBsb2NhbGUgXS5mYWxsYmFja0xvY2FsZXMgJiYgZnVsbExvY2FsZURhdGFbIGxvY2FsZSBdLmZhbGxiYWNrTG9jYWxlcy5zb21lKCAoIGZhbGxiYWNrTG9jYWxlOiBzdHJpbmcgKSA9PiB7XG4gICAgICAgIHJldHVybiBsb2NhbGVzV2l0aFRyYW5zbGF0aW9ucy5pbmNsdWRlcyggZmFsbGJhY2tMb2NhbGUgKTtcbiAgICAgIH0gKTtcbiAgICB9IClcbiAgXSApO1xuXG4gIC8vIElmIGEgbG9jYWxlIGlzIE5PVCBpbmNsdWRlZCwgYW5kIGhhcyBubyBmYWxsYmFja3MgdGhhdCBhcmUgaW5jbHVkZWQsIEJVVCBJUyB0aGUgZmFsbGJhY2sgZm9yIGFub3RoZXIgbG9jYWxlLCB3ZVxuICAvLyBzaG91bGQgaW5jbHVkZSBpdC4gRm9yIGV4YW1wbGUsIGlmIHdlIGhhdmUgTk8gXCJha1wiIHRyYW5zbGF0aW9uLCBidXQgd2UgaGF2ZSBhIFwidHdcIiB0cmFuc2xhdGlvbiAod2hpY2ggZmFsbHMgYmFjayB0b1xuICAvLyBcImFrXCIpLCB3ZSB3aWxsIHdhbnQgdG8gaW5jbHVkZSBcImFrXCIgKGV2ZW4gdGhvdWdoIGl0IHdvbid0IGV2ZXIgY29udGFpbiBub24tRW5nbGlzaCBzdHJpbmcgdHJhbnNsYXRpb24pLCBiZWNhdXNlIHdlXG4gIC8vIG1heSB3YW50IHRvIHJlZmVyZW5jZSBpdCAoYW5kIHdhbnQgdG8gbm90IGhhdmUgXCJicm9rZW5cIiBsb2NhbGUgbGlua3MgbG9jYWxlRGF0YSkuXG5cbiAgLy8gVGhpcyBhcnJheSB3b3VsZCBnZXQgbG9uZ2VyIGFzIHdlIGl0ZXJhdGUgdGhyb3VnaCBpdC5cbiAgZm9yICggbGV0IGkgPSAwOyBpIDwgaW5jbHVkZWREYXRhTG9jYWxlcy5sZW5ndGg7IGkrKyApIHtcbiAgICBjb25zdCBsb2NhbGUgPSBpbmNsdWRlZERhdGFMb2NhbGVzWyBpIF07XG5cbiAgICAvLyBJZiBvdXIgbG9jYWxlIGlzIGluY2x1ZGVkLCB3ZSBzaG91bGQgbWFrZSBzdXJlIGFsbCBvZiBpdHMgZmFsbGJhY2tMb2NhbGVzIGFyZSBpbmNsdWRlZFxuICAgIGNvbnN0IGZhbGxiYWNrTG9jYWxlcyA9IGZ1bGxMb2NhbGVEYXRhWyBsb2NhbGUgXS5mYWxsYmFja0xvY2FsZXM7XG4gICAgaWYgKCBmYWxsYmFja0xvY2FsZXMgKSB7XG4gICAgICBmb3IgKCBjb25zdCBmYWxsYmFja0xvY2FsZSBvZiBmYWxsYmFja0xvY2FsZXMgKSB7XG4gICAgICAgIGlmICggIWluY2x1ZGVkRGF0YUxvY2FsZXMuaW5jbHVkZXMoIGZhbGxiYWNrTG9jYWxlICkgKSB7XG4gICAgICAgICAgaW5jbHVkZWREYXRhTG9jYWxlcy5wdXNoKCBmYWxsYmFja0xvY2FsZSApO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLy8gVGhlIHNldCBvZiBsb2NhbGVzIGluY2x1ZGVkIGluIGdlbmVyYXRlZCAoc3Vic2V0IG9mKSBsb2NhbGVEYXRhIGZvciB0aGlzIHNwZWNpZmljIGJ1aWx0IHNpbXVsYXRpb24gZmlsZVxuICAvLyBpcyBzYXRpc2ZpZWQgYnkgdGhlIGZvbGxvd2luZyBjbG9zdXJlOlxuICAvL1xuICAvLyAxLiBJZiBhIGxvY2FsZSBoYXMgYSB0cmFuc2xhdGlvbiwgaW5jbHVkZSB0aGF0IGxvY2FsZS5cbiAgLy8gMi4gSWYgb25lIG9mIGEgbG9jYWxlJ3MgbG9jYWxlRGF0YVsgbG9jYWxlIF0uZmFsbGJhY2tMb2NhbGVzIGlzIHRyYW5zbGF0ZWQsIGluY2x1ZGUgdGhhdCBsb2NhbGUuXG4gIC8vIDMuIElmIGEgbG9jYWxlIGlzIGluIGFuIGluY2x1ZGVkIGxvY2FsZURhdGFbIHNvbWVPdGhlckxvY2FsZSBdLmZhbGxiYWNrTG9jYWxlcywgaW5jbHVkZSB0aGF0IGxvY2FsZS5cbiAgLy8gNC4gQWx3YXlzIGluY2x1ZGUgdGhlIGRlZmF1bHQgbG9jYWxlIFwiZW5cIi5cbiAgY29uc3QgbG9jYWxlRGF0YTogTG9jYWxlRGF0YSA9IHt9O1xuICBmb3IgKCBjb25zdCBsb2NhbGUgb2YgXy5zb3J0QnkoIGluY2x1ZGVkRGF0YUxvY2FsZXMgKSApIHtcbiAgICBsb2NhbGVEYXRhWyBsb2NhbGUgXSA9IGZ1bGxMb2NhbGVEYXRhWyBsb2NhbGUgXTtcbiAgfVxuXG4gIHJldHVybiBsb2NhbGVEYXRhO1xufTsiXSwibmFtZXMiOlsiZnMiLCJfIiwiQ2hpcHBlckNvbnN0YW50cyIsImxvY2FsZXNXaXRoVHJhbnNsYXRpb25zIiwiZnVsbExvY2FsZURhdGEiLCJKU09OIiwicGFyc2UiLCJyZWFkRmlsZVN5bmMiLCJpbmNsdWRlZERhdGFMb2NhbGVzIiwidW5pcSIsIkZBTExCQUNLX0xPQ0FMRSIsIk9iamVjdCIsImtleXMiLCJmaWx0ZXIiLCJsb2NhbGUiLCJmYWxsYmFja0xvY2FsZXMiLCJzb21lIiwiZmFsbGJhY2tMb2NhbGUiLCJpbmNsdWRlcyIsImkiLCJsZW5ndGgiLCJwdXNoIiwibG9jYWxlRGF0YSIsInNvcnRCeSJdLCJtYXBwaW5ncyI6IkFBQUEsaURBQWlEO0FBRWpEOzs7O0NBSUMsR0FFRCxPQUFPQSxRQUFRLEtBQUs7QUFDcEIsT0FBT0MsT0FBTyxTQUFTO0FBQ3ZCLE9BQU9DLHNCQUFzQixnQ0FBZ0M7QUFHN0Q7Ozs7Q0FJQyxHQUNELGVBQWUsQ0FBQSxDQUFFQztJQUVmLGtCQUFrQjtJQUNsQixNQUFNQyxpQkFBNkJDLEtBQUtDLEtBQUssQ0FBRU4sR0FBR08sWUFBWSxDQUFFLDRCQUE0QjtJQUU1Rix1SEFBdUg7SUFDdkgscUlBQXFJO0lBQ3JJLGtIQUFrSDtJQUNsSCxNQUFNQyxzQkFBZ0NQLEVBQUVRLElBQUksQ0FBRTtRQUM1QyxtQ0FBbUM7UUFDbkNQLGlCQUFpQlEsZUFBZTtRQUVoQyxnQ0FBZ0M7V0FDN0JQO1FBRUgsb0VBQW9FO1dBQ2pFUSxPQUFPQyxJQUFJLENBQUVSLGdCQUFpQlMsTUFBTSxDQUFFQyxDQUFBQTtZQUN2QyxPQUFPVixjQUFjLENBQUVVLE9BQVEsQ0FBQ0MsZUFBZSxJQUFJWCxjQUFjLENBQUVVLE9BQVEsQ0FBQ0MsZUFBZSxDQUFDQyxJQUFJLENBQUUsQ0FBRUM7Z0JBQ2xHLE9BQU9kLHdCQUF3QmUsUUFBUSxDQUFFRDtZQUMzQztRQUNGO0tBQ0Q7SUFFRCxrSEFBa0g7SUFDbEgsc0hBQXNIO0lBQ3RILHFIQUFxSDtJQUNySCxvRkFBb0Y7SUFFcEYsd0RBQXdEO0lBQ3hELElBQU0sSUFBSUUsSUFBSSxHQUFHQSxJQUFJWCxvQkFBb0JZLE1BQU0sRUFBRUQsSUFBTTtRQUNyRCxNQUFNTCxTQUFTTixtQkFBbUIsQ0FBRVcsRUFBRztRQUV2Qyx5RkFBeUY7UUFDekYsTUFBTUosa0JBQWtCWCxjQUFjLENBQUVVLE9BQVEsQ0FBQ0MsZUFBZTtRQUNoRSxJQUFLQSxpQkFBa0I7WUFDckIsS0FBTSxNQUFNRSxrQkFBa0JGLGdCQUFrQjtnQkFDOUMsSUFBSyxDQUFDUCxvQkFBb0JVLFFBQVEsQ0FBRUQsaUJBQW1CO29CQUNyRFQsb0JBQW9CYSxJQUFJLENBQUVKO2dCQUM1QjtZQUNGO1FBQ0Y7SUFDRjtJQUVBLDBHQUEwRztJQUMxRyx5Q0FBeUM7SUFDekMsRUFBRTtJQUNGLHlEQUF5RDtJQUN6RCxtR0FBbUc7SUFDbkcsdUdBQXVHO0lBQ3ZHLDZDQUE2QztJQUM3QyxNQUFNSyxhQUF5QixDQUFDO0lBQ2hDLEtBQU0sTUFBTVIsVUFBVWIsRUFBRXNCLE1BQU0sQ0FBRWYscUJBQXdCO1FBQ3REYyxVQUFVLENBQUVSLE9BQVEsR0FBR1YsY0FBYyxDQUFFVSxPQUFRO0lBQ2pEO0lBRUEsT0FBT1E7QUFDVCxDQUFBLEVBQUUifQ==