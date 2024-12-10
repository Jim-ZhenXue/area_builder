// Copyright 2015-2024, University of Colorado Boulder
import { readFileSync } from 'fs';
/**
 * Report which translatable strings from a sim were not used in the simulation with a require statement.
 *
 * Each time a string is loaded by the plugin, it is added to a global list.  After all strings are loaded,
 * the global will contain the list of all strings that are actually used by the sim.  Comparing this list to
 * the strings in the translatable strings JSON file will identify which strings are unused.
 *
 * See https://github.com/phetsims/tasks/issues/460
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */ import grunt from '../../../perennial-alias/js/npm-dependencies/grunt.js';
/**
 * @param repo
 * @param requirejsNamespace
 * @param usedStringMap - Maps full keys to string values, FOR USED STRINGS ONLY
 */ export default function reportUnusedStrings(repo, requirejsNamespace, usedStringMap) {
    /**
   * Builds a string map recursively from a string-file-like object.
   */ const buildStringMap = (object)=>{
        const result = {};
        if (typeof object.value === 'string') {
            result[''] = object.value;
        }
        Object.keys(object).filter((key)=>key !== 'value').forEach((key)=>{
            if (typeof object[key] === 'object') {
                const subresult = buildStringMap(object[key]);
                Object.keys(subresult).forEach((subkey)=>{
                    result[key + (subkey.length ? `.${subkey}` : '')] = subresult[subkey];
                });
            }
        });
        return result;
    };
    const availableStringMap = buildStringMap(JSON.parse(readFileSync(`../${repo}/${repo}-strings_en.json`, 'utf8')));
    Object.keys(availableStringMap).forEach((availableStringKey)=>{
        if (!usedStringMap[`${requirejsNamespace}/${availableStringKey}`]) {
            grunt.log.warn(`Unused string: key=${availableStringKey}, value=${availableStringMap[availableStringKey]}`);
        }
    });
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2pzL2dydW50L3JlcG9ydFVudXNlZFN0cmluZ3MudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTUtMjAyNCwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbmltcG9ydCB7IHJlYWRGaWxlU3luYyB9IGZyb20gJ2ZzJztcblxuLyoqXG4gKiBSZXBvcnQgd2hpY2ggdHJhbnNsYXRhYmxlIHN0cmluZ3MgZnJvbSBhIHNpbSB3ZXJlIG5vdCB1c2VkIGluIHRoZSBzaW11bGF0aW9uIHdpdGggYSByZXF1aXJlIHN0YXRlbWVudC5cbiAqXG4gKiBFYWNoIHRpbWUgYSBzdHJpbmcgaXMgbG9hZGVkIGJ5IHRoZSBwbHVnaW4sIGl0IGlzIGFkZGVkIHRvIGEgZ2xvYmFsIGxpc3QuICBBZnRlciBhbGwgc3RyaW5ncyBhcmUgbG9hZGVkLFxuICogdGhlIGdsb2JhbCB3aWxsIGNvbnRhaW4gdGhlIGxpc3Qgb2YgYWxsIHN0cmluZ3MgdGhhdCBhcmUgYWN0dWFsbHkgdXNlZCBieSB0aGUgc2ltLiAgQ29tcGFyaW5nIHRoaXMgbGlzdCB0b1xuICogdGhlIHN0cmluZ3MgaW4gdGhlIHRyYW5zbGF0YWJsZSBzdHJpbmdzIEpTT04gZmlsZSB3aWxsIGlkZW50aWZ5IHdoaWNoIHN0cmluZ3MgYXJlIHVudXNlZC5cbiAqXG4gKiBTZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3Rhc2tzL2lzc3Vlcy80NjBcbiAqXG4gKiBAYXV0aG9yIEplc3NlIEdyZWVuYmVyZyAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcbiAqL1xuaW1wb3J0IGdydW50IGZyb20gJy4uLy4uLy4uL3BlcmVubmlhbC1hbGlhcy9qcy9ucG0tZGVwZW5kZW5jaWVzL2dydW50LmpzJztcblxuLyoqXG4gKiBAcGFyYW0gcmVwb1xuICogQHBhcmFtIHJlcXVpcmVqc05hbWVzcGFjZVxuICogQHBhcmFtIHVzZWRTdHJpbmdNYXAgLSBNYXBzIGZ1bGwga2V5cyB0byBzdHJpbmcgdmFsdWVzLCBGT1IgVVNFRCBTVFJJTkdTIE9OTFlcbiAqL1xuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gcmVwb3J0VW51c2VkU3RyaW5ncyggcmVwbzogc3RyaW5nLCByZXF1aXJlanNOYW1lc3BhY2U6IHN0cmluZywgdXNlZFN0cmluZ01hcDogUmVjb3JkPHN0cmluZywgdW5rbm93bj4gKTogdm9pZCB7XG5cbiAgLyoqXG4gICAqIEJ1aWxkcyBhIHN0cmluZyBtYXAgcmVjdXJzaXZlbHkgZnJvbSBhIHN0cmluZy1maWxlLWxpa2Ugb2JqZWN0LlxuICAgKi9cbiAgY29uc3QgYnVpbGRTdHJpbmdNYXAgPSAoIG9iamVjdDogUmVjb3JkPHN0cmluZywgc3RyaW5nPiApOiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+ID0+IHtcbiAgICBjb25zdCByZXN1bHQ6IFJlY29yZDxzdHJpbmcsIHN0cmluZz4gPSB7fTtcblxuICAgIGlmICggdHlwZW9mIG9iamVjdC52YWx1ZSA9PT0gJ3N0cmluZycgKSB7XG4gICAgICByZXN1bHRbICcnIF0gPSBvYmplY3QudmFsdWU7XG4gICAgfVxuICAgIE9iamVjdC5rZXlzKCBvYmplY3QgKS5maWx0ZXIoIGtleSA9PiBrZXkgIT09ICd2YWx1ZScgKS5mb3JFYWNoKCBrZXkgPT4ge1xuICAgICAgaWYgKCB0eXBlb2Ygb2JqZWN0WyBrZXkgXSA9PT0gJ29iamVjdCcgKSB7XG4gICAgICAgIGNvbnN0IHN1YnJlc3VsdCA9IGJ1aWxkU3RyaW5nTWFwKCBvYmplY3RbIGtleSBdICk7XG5cbiAgICAgICAgT2JqZWN0LmtleXMoIHN1YnJlc3VsdCApLmZvckVhY2goIHN1YmtleSA9PiB7XG4gICAgICAgICAgcmVzdWx0WyBrZXkgKyAoIHN1YmtleS5sZW5ndGggPyBgLiR7c3Via2V5fWAgOiAnJyApIF0gPSBzdWJyZXN1bHRbIHN1YmtleSBdO1xuICAgICAgICB9ICk7XG4gICAgICB9XG4gICAgfSApO1xuXG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfTtcblxuICBjb25zdCBhdmFpbGFibGVTdHJpbmdNYXAgPSBidWlsZFN0cmluZ01hcCggSlNPTi5wYXJzZSggcmVhZEZpbGVTeW5jKCBgLi4vJHtyZXBvfS8ke3JlcG99LXN0cmluZ3NfZW4uanNvbmAsICd1dGY4JyApICkgKTtcblxuICBPYmplY3Qua2V5cyggYXZhaWxhYmxlU3RyaW5nTWFwICkuZm9yRWFjaCggYXZhaWxhYmxlU3RyaW5nS2V5ID0+IHtcbiAgICBpZiAoICF1c2VkU3RyaW5nTWFwWyBgJHtyZXF1aXJlanNOYW1lc3BhY2V9LyR7YXZhaWxhYmxlU3RyaW5nS2V5fWAgXSApIHtcbiAgICAgIGdydW50LmxvZy53YXJuKCBgVW51c2VkIHN0cmluZzoga2V5PSR7YXZhaWxhYmxlU3RyaW5nS2V5fSwgdmFsdWU9JHthdmFpbGFibGVTdHJpbmdNYXBbIGF2YWlsYWJsZVN0cmluZ0tleSBdfWAgKTtcbiAgICB9XG4gIH0gKTtcbn0iXSwibmFtZXMiOlsicmVhZEZpbGVTeW5jIiwiZ3J1bnQiLCJyZXBvcnRVbnVzZWRTdHJpbmdzIiwicmVwbyIsInJlcXVpcmVqc05hbWVzcGFjZSIsInVzZWRTdHJpbmdNYXAiLCJidWlsZFN0cmluZ01hcCIsIm9iamVjdCIsInJlc3VsdCIsInZhbHVlIiwiT2JqZWN0Iiwia2V5cyIsImZpbHRlciIsImtleSIsImZvckVhY2giLCJzdWJyZXN1bHQiLCJzdWJrZXkiLCJsZW5ndGgiLCJhdmFpbGFibGVTdHJpbmdNYXAiLCJKU09OIiwicGFyc2UiLCJhdmFpbGFibGVTdHJpbmdLZXkiLCJsb2ciLCJ3YXJuIl0sIm1hcHBpbmdzIjoiQUFBQSxzREFBc0Q7QUFFdEQsU0FBU0EsWUFBWSxRQUFRLEtBQUs7QUFFbEM7Ozs7Ozs7Ozs7Q0FVQyxHQUNELE9BQU9DLFdBQVcsd0RBQXdEO0FBRTFFOzs7O0NBSUMsR0FDRCxlQUFlLFNBQVNDLG9CQUFxQkMsSUFBWSxFQUFFQyxrQkFBMEIsRUFBRUMsYUFBc0M7SUFFM0g7O0dBRUMsR0FDRCxNQUFNQyxpQkFBaUIsQ0FBRUM7UUFDdkIsTUFBTUMsU0FBaUMsQ0FBQztRQUV4QyxJQUFLLE9BQU9ELE9BQU9FLEtBQUssS0FBSyxVQUFXO1lBQ3RDRCxNQUFNLENBQUUsR0FBSSxHQUFHRCxPQUFPRSxLQUFLO1FBQzdCO1FBQ0FDLE9BQU9DLElBQUksQ0FBRUosUUFBU0ssTUFBTSxDQUFFQyxDQUFBQSxNQUFPQSxRQUFRLFNBQVVDLE9BQU8sQ0FBRUQsQ0FBQUE7WUFDOUQsSUFBSyxPQUFPTixNQUFNLENBQUVNLElBQUssS0FBSyxVQUFXO2dCQUN2QyxNQUFNRSxZQUFZVCxlQUFnQkMsTUFBTSxDQUFFTSxJQUFLO2dCQUUvQ0gsT0FBT0MsSUFBSSxDQUFFSSxXQUFZRCxPQUFPLENBQUVFLENBQUFBO29CQUNoQ1IsTUFBTSxDQUFFSyxNQUFRRyxDQUFBQSxPQUFPQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLEVBQUVELFFBQVEsR0FBRyxFQUFDLEVBQUssR0FBR0QsU0FBUyxDQUFFQyxPQUFRO2dCQUM3RTtZQUNGO1FBQ0Y7UUFFQSxPQUFPUjtJQUNUO0lBRUEsTUFBTVUscUJBQXFCWixlQUFnQmEsS0FBS0MsS0FBSyxDQUFFcEIsYUFBYyxDQUFDLEdBQUcsRUFBRUcsS0FBSyxDQUFDLEVBQUVBLEtBQUssZ0JBQWdCLENBQUMsRUFBRTtJQUUzR08sT0FBT0MsSUFBSSxDQUFFTyxvQkFBcUJKLE9BQU8sQ0FBRU8sQ0FBQUE7UUFDekMsSUFBSyxDQUFDaEIsYUFBYSxDQUFFLEdBQUdELG1CQUFtQixDQUFDLEVBQUVpQixvQkFBb0IsQ0FBRSxFQUFHO1lBQ3JFcEIsTUFBTXFCLEdBQUcsQ0FBQ0MsSUFBSSxDQUFFLENBQUMsbUJBQW1CLEVBQUVGLG1CQUFtQixRQUFRLEVBQUVILGtCQUFrQixDQUFFRyxtQkFBb0IsRUFBRTtRQUMvRztJQUNGO0FBQ0YifQ==