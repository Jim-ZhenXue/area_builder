// Copyright 2022-2024, University of Colorado Boulder
/**
 * Cache the results of processes so that they don't need to be re-run if there have been no changes.
 * For instance, this can speed up unit tests and phet-io-api-compare. This streamlines the precommit hooks
 * by avoiding duplicated work.
 *
 * The CacheLayer only works if the watch process is checking for changed files.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */ import fs from 'fs';
const readCacheLayerJSON = ()=>{
    try {
        return JSON.parse(fs.readFileSync('../chipper/dist/cache-layer.json', 'utf-8'));
    } catch (e) {
        return {};
    }
};
const LATEST_CHANGE_TIMESTAMP_KEY = 'latestChangeTimestamp';
const writeFileAsJSON = (json)=>{
    fs.writeFileSync('../chipper/dist/cache-layer.json', JSON.stringify(json, null, 2));
};
export default {
    // When the watch process exits, invalidate the caches until the watch process resumes
    clearLastChangedTimestamp () {
        const json = readCacheLayerJSON();
        delete json[LATEST_CHANGE_TIMESTAMP_KEY];
        writeFileAsJSON(json);
    },
    // Invalidate caches when a relevant file changes
    updateLastChangedTimestamp () {
        const json = readCacheLayerJSON();
        json[LATEST_CHANGE_TIMESTAMP_KEY] = Date.now();
        writeFileAsJSON(json);
    },
    // When a process succeeds, save the timestamp
    onSuccess (keyName) {
        const json = readCacheLayerJSON();
        json.cache = json.cache || {};
        json.cache[keyName] = Date.now();
        writeFileAsJSON(json);
    },
    // Check whether we need to re-run a process
    isCacheStale (keyName) {
        return !this.isCacheSafe(keyName);
    },
    isCacheSafe (keyName) {
        const json = readCacheLayerJSON();
        const time = json.cache && json.cache[keyName];
        const lastChanged = json[LATEST_CHANGE_TIMESTAMP_KEY];
        if (typeof time === 'number' && typeof lastChanged === 'number' && lastChanged < time) {
            return true;
        } else {
            return false;
        }
    }
};

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2pzL2NvbW1vbi9DYWNoZUxheWVyLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDIyLTIwMjQsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIENhY2hlIHRoZSByZXN1bHRzIG9mIHByb2Nlc3NlcyBzbyB0aGF0IHRoZXkgZG9uJ3QgbmVlZCB0byBiZSByZS1ydW4gaWYgdGhlcmUgaGF2ZSBiZWVuIG5vIGNoYW5nZXMuXG4gKiBGb3IgaW5zdGFuY2UsIHRoaXMgY2FuIHNwZWVkIHVwIHVuaXQgdGVzdHMgYW5kIHBoZXQtaW8tYXBpLWNvbXBhcmUuIFRoaXMgc3RyZWFtbGluZXMgdGhlIHByZWNvbW1pdCBob29rc1xuICogYnkgYXZvaWRpbmcgZHVwbGljYXRlZCB3b3JrLlxuICpcbiAqIFRoZSBDYWNoZUxheWVyIG9ubHkgd29ya3MgaWYgdGhlIHdhdGNoIHByb2Nlc3MgaXMgY2hlY2tpbmcgZm9yIGNoYW5nZWQgZmlsZXMuXG4gKlxuICogQGF1dGhvciBTYW0gUmVpZCAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcbiAqL1xuaW1wb3J0IGZzIGZyb20gJ2ZzJztcblxuY29uc3QgcmVhZENhY2hlTGF5ZXJKU09OID0gKCkgPT4ge1xuICB0cnkge1xuICAgIHJldHVybiBKU09OLnBhcnNlKCBmcy5yZWFkRmlsZVN5bmMoICcuLi9jaGlwcGVyL2Rpc3QvY2FjaGUtbGF5ZXIuanNvbicsICd1dGYtOCcgKSApO1xuICB9XG4gIGNhdGNoKCBlICkge1xuICAgIHJldHVybiB7fTtcbiAgfVxufTtcblxuY29uc3QgTEFURVNUX0NIQU5HRV9USU1FU1RBTVBfS0VZID0gJ2xhdGVzdENoYW5nZVRpbWVzdGFtcCc7XG5cbmNvbnN0IHdyaXRlRmlsZUFzSlNPTiA9ICgganNvbjogb2JqZWN0ICkgPT4ge1xuICBmcy53cml0ZUZpbGVTeW5jKCAnLi4vY2hpcHBlci9kaXN0L2NhY2hlLWxheWVyLmpzb24nLCBKU09OLnN0cmluZ2lmeSgganNvbiwgbnVsbCwgMiApICk7XG59O1xuXG5leHBvcnQgZGVmYXVsdCB7XG5cbiAgLy8gV2hlbiB0aGUgd2F0Y2ggcHJvY2VzcyBleGl0cywgaW52YWxpZGF0ZSB0aGUgY2FjaGVzIHVudGlsIHRoZSB3YXRjaCBwcm9jZXNzIHJlc3VtZXNcbiAgY2xlYXJMYXN0Q2hhbmdlZFRpbWVzdGFtcCgpOiB2b2lkIHtcbiAgICBjb25zdCBqc29uID0gcmVhZENhY2hlTGF5ZXJKU09OKCk7XG4gICAgZGVsZXRlIGpzb25bIExBVEVTVF9DSEFOR0VfVElNRVNUQU1QX0tFWSBdO1xuICAgIHdyaXRlRmlsZUFzSlNPTigganNvbiApO1xuICB9LFxuXG4gIC8vIEludmFsaWRhdGUgY2FjaGVzIHdoZW4gYSByZWxldmFudCBmaWxlIGNoYW5nZXNcbiAgdXBkYXRlTGFzdENoYW5nZWRUaW1lc3RhbXAoKTogdm9pZCB7XG4gICAgY29uc3QganNvbiA9IHJlYWRDYWNoZUxheWVySlNPTigpO1xuICAgIGpzb25bIExBVEVTVF9DSEFOR0VfVElNRVNUQU1QX0tFWSBdID0gRGF0ZS5ub3coKTtcbiAgICB3cml0ZUZpbGVBc0pTT04oIGpzb24gKTtcbiAgfSxcblxuICAvLyBXaGVuIGEgcHJvY2VzcyBzdWNjZWVkcywgc2F2ZSB0aGUgdGltZXN0YW1wXG4gIG9uU3VjY2Vzcygga2V5TmFtZTogc3RyaW5nICk6IHZvaWQge1xuICAgIGNvbnN0IGpzb24gPSByZWFkQ2FjaGVMYXllckpTT04oKTtcbiAgICBqc29uLmNhY2hlID0ganNvbi5jYWNoZSB8fCB7fTtcbiAgICBqc29uLmNhY2hlWyBrZXlOYW1lIF0gPSBEYXRlLm5vdygpO1xuICAgIHdyaXRlRmlsZUFzSlNPTigganNvbiApO1xuICB9LFxuXG4gIC8vIENoZWNrIHdoZXRoZXIgd2UgbmVlZCB0byByZS1ydW4gYSBwcm9jZXNzXG4gIGlzQ2FjaGVTdGFsZSgga2V5TmFtZTogc3RyaW5nICk6IGJvb2xlYW4ge1xuICAgIHJldHVybiAhdGhpcy5pc0NhY2hlU2FmZSgga2V5TmFtZSApO1xuICB9LFxuXG4gIGlzQ2FjaGVTYWZlKCBrZXlOYW1lOiBzdHJpbmcgKTogYm9vbGVhbiB7XG4gICAgY29uc3QganNvbiA9IHJlYWRDYWNoZUxheWVySlNPTigpO1xuICAgIGNvbnN0IHRpbWUgPSBqc29uLmNhY2hlICYmIGpzb24uY2FjaGVbIGtleU5hbWUgXTtcbiAgICBjb25zdCBsYXN0Q2hhbmdlZCA9IGpzb25bIExBVEVTVF9DSEFOR0VfVElNRVNUQU1QX0tFWSBdO1xuICAgIGlmICggdHlwZW9mIHRpbWUgPT09ICdudW1iZXInICYmIHR5cGVvZiBsYXN0Q2hhbmdlZCA9PT0gJ251bWJlcicgJiYgbGFzdENoYW5nZWQgPCB0aW1lICkge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgfVxufTsiXSwibmFtZXMiOlsiZnMiLCJyZWFkQ2FjaGVMYXllckpTT04iLCJKU09OIiwicGFyc2UiLCJyZWFkRmlsZVN5bmMiLCJlIiwiTEFURVNUX0NIQU5HRV9USU1FU1RBTVBfS0VZIiwid3JpdGVGaWxlQXNKU09OIiwianNvbiIsIndyaXRlRmlsZVN5bmMiLCJzdHJpbmdpZnkiLCJjbGVhckxhc3RDaGFuZ2VkVGltZXN0YW1wIiwidXBkYXRlTGFzdENoYW5nZWRUaW1lc3RhbXAiLCJEYXRlIiwibm93Iiwib25TdWNjZXNzIiwia2V5TmFtZSIsImNhY2hlIiwiaXNDYWNoZVN0YWxlIiwiaXNDYWNoZVNhZmUiLCJ0aW1lIiwibGFzdENoYW5nZWQiXSwibWFwcGluZ3MiOiJBQUFBLHNEQUFzRDtBQUV0RDs7Ozs7Ozs7Q0FRQyxHQUNELE9BQU9BLFFBQVEsS0FBSztBQUVwQixNQUFNQyxxQkFBcUI7SUFDekIsSUFBSTtRQUNGLE9BQU9DLEtBQUtDLEtBQUssQ0FBRUgsR0FBR0ksWUFBWSxDQUFFLG9DQUFvQztJQUMxRSxFQUNBLE9BQU9DLEdBQUk7UUFDVCxPQUFPLENBQUM7SUFDVjtBQUNGO0FBRUEsTUFBTUMsOEJBQThCO0FBRXBDLE1BQU1DLGtCQUFrQixDQUFFQztJQUN4QlIsR0FBR1MsYUFBYSxDQUFFLG9DQUFvQ1AsS0FBS1EsU0FBUyxDQUFFRixNQUFNLE1BQU07QUFDcEY7QUFFQSxlQUFlO0lBRWIsc0ZBQXNGO0lBQ3RGRztRQUNFLE1BQU1ILE9BQU9QO1FBQ2IsT0FBT08sSUFBSSxDQUFFRiw0QkFBNkI7UUFDMUNDLGdCQUFpQkM7SUFDbkI7SUFFQSxpREFBaUQ7SUFDakRJO1FBQ0UsTUFBTUosT0FBT1A7UUFDYk8sSUFBSSxDQUFFRiw0QkFBNkIsR0FBR08sS0FBS0MsR0FBRztRQUM5Q1AsZ0JBQWlCQztJQUNuQjtJQUVBLDhDQUE4QztJQUM5Q08sV0FBV0MsT0FBZTtRQUN4QixNQUFNUixPQUFPUDtRQUNiTyxLQUFLUyxLQUFLLEdBQUdULEtBQUtTLEtBQUssSUFBSSxDQUFDO1FBQzVCVCxLQUFLUyxLQUFLLENBQUVELFFBQVMsR0FBR0gsS0FBS0MsR0FBRztRQUNoQ1AsZ0JBQWlCQztJQUNuQjtJQUVBLDRDQUE0QztJQUM1Q1UsY0FBY0YsT0FBZTtRQUMzQixPQUFPLENBQUMsSUFBSSxDQUFDRyxXQUFXLENBQUVIO0lBQzVCO0lBRUFHLGFBQWFILE9BQWU7UUFDMUIsTUFBTVIsT0FBT1A7UUFDYixNQUFNbUIsT0FBT1osS0FBS1MsS0FBSyxJQUFJVCxLQUFLUyxLQUFLLENBQUVELFFBQVM7UUFDaEQsTUFBTUssY0FBY2IsSUFBSSxDQUFFRiw0QkFBNkI7UUFDdkQsSUFBSyxPQUFPYyxTQUFTLFlBQVksT0FBT0MsZ0JBQWdCLFlBQVlBLGNBQWNELE1BQU87WUFDdkYsT0FBTztRQUNULE9BQ0s7WUFDSCxPQUFPO1FBQ1Q7SUFDRjtBQUNGLEVBQUUifQ==