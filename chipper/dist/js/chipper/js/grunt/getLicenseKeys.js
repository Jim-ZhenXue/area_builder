// Copyright 2017-2024, University of Colorado Boulder
/**
 * Gets the license keys for sherpa (third-party) libs that are used.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ import { readFileSync } from 'fs';
import _ from 'lodash';
import webpackGlobalLibraries from '../common/webpackGlobalLibraries.js';
import getPreloads from './getPreloads.js';
/**
 * Gets the license keys for sherpa (third-party) libs that are used.
 */ export default function getLicenseKeys(repo, brand) {
    const packageObject = JSON.parse(readFileSync(`../${repo}/package.json`, 'utf8'));
    let buildObject;
    try {
        buildObject = JSON.parse(readFileSync('../chipper/build.json', 'utf8'));
    } catch (e) {
        buildObject = {};
    }
    const preload = getPreloads(repo, brand, false);
    // start with package.json
    let licenseKeys = packageObject.phet.licenseKeys || [];
    // add common and brand-specific entries from build.json
    [
        'common',
        brand
    ].forEach((id)=>{
        if (buildObject[id] && buildObject[id].licenseKeys) {
            licenseKeys = licenseKeys.concat(buildObject[id].licenseKeys);
        }
    });
    // Extract keys from preloads and webpack-supported imports for
    // sherpa (third-party) dependencies.
    const allPaths = preload.concat(Object.values(webpackGlobalLibraries).map((path)=>`../${path}`));
    allPaths.forEach((path)=>{
        if (path.includes('/sherpa/')) {
            const lastSlash = path.lastIndexOf('/');
            const key = path.substring(lastSlash + 1);
            licenseKeys.push(key);
        }
    });
    // sort and remove duplicates
    return _.uniq(_.sortBy(licenseKeys, (key)=>key.toUpperCase()));
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2pzL2dydW50L2dldExpY2Vuc2VLZXlzLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE3LTIwMjQsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIEdldHMgdGhlIGxpY2Vuc2Uga2V5cyBmb3Igc2hlcnBhICh0aGlyZC1wYXJ0eSkgbGlicyB0aGF0IGFyZSB1c2VkLlxuICpcbiAqIEBhdXRob3IgQ2hyaXMgTWFsbGV5IChQaXhlbFpvb20sIEluYy4pXG4gKiBAYXV0aG9yIEpvbmF0aGFuIE9sc29uIDxqb25hdGhhbi5vbHNvbkBjb2xvcmFkby5lZHU+XG4gKi9cblxuaW1wb3J0IHsgcmVhZEZpbGVTeW5jIH0gZnJvbSAnZnMnO1xuaW1wb3J0IF8gZnJvbSAnbG9kYXNoJztcbmltcG9ydCB3ZWJwYWNrR2xvYmFsTGlicmFyaWVzIGZyb20gJy4uL2NvbW1vbi93ZWJwYWNrR2xvYmFsTGlicmFyaWVzLmpzJztcbmltcG9ydCBnZXRQcmVsb2FkcyBmcm9tICcuL2dldFByZWxvYWRzLmpzJztcblxuLyoqXG4gKiBHZXRzIHRoZSBsaWNlbnNlIGtleXMgZm9yIHNoZXJwYSAodGhpcmQtcGFydHkpIGxpYnMgdGhhdCBhcmUgdXNlZC5cbiAqL1xuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gZ2V0TGljZW5zZUtleXMoIHJlcG86IHN0cmluZywgYnJhbmQ6IHN0cmluZyApOiBzdHJpbmdbXSB7XG4gIGNvbnN0IHBhY2thZ2VPYmplY3QgPSBKU09OLnBhcnNlKCByZWFkRmlsZVN5bmMoIGAuLi8ke3JlcG99L3BhY2thZ2UuanNvbmAsICd1dGY4JyApICk7XG4gIGxldCBidWlsZE9iamVjdDtcbiAgdHJ5IHtcbiAgICBidWlsZE9iamVjdCA9IEpTT04ucGFyc2UoIHJlYWRGaWxlU3luYyggJy4uL2NoaXBwZXIvYnVpbGQuanNvbicsICd1dGY4JyApICk7XG4gIH1cbiAgY2F0Y2goIGUgKSB7XG4gICAgYnVpbGRPYmplY3QgPSB7fTtcbiAgfVxuICBjb25zdCBwcmVsb2FkID0gZ2V0UHJlbG9hZHMoIHJlcG8sIGJyYW5kLCBmYWxzZSApO1xuXG4gIC8vIHN0YXJ0IHdpdGggcGFja2FnZS5qc29uXG4gIGxldCBsaWNlbnNlS2V5czogc3RyaW5nW10gPSBwYWNrYWdlT2JqZWN0LnBoZXQubGljZW5zZUtleXMgfHwgW107XG5cbiAgLy8gYWRkIGNvbW1vbiBhbmQgYnJhbmQtc3BlY2lmaWMgZW50cmllcyBmcm9tIGJ1aWxkLmpzb25cbiAgWyAnY29tbW9uJywgYnJhbmQgXS5mb3JFYWNoKCBpZCA9PiB7XG4gICAgaWYgKCBidWlsZE9iamVjdFsgaWQgXSAmJiBidWlsZE9iamVjdFsgaWQgXS5saWNlbnNlS2V5cyApIHtcbiAgICAgIGxpY2Vuc2VLZXlzID0gbGljZW5zZUtleXMuY29uY2F0KCBidWlsZE9iamVjdFsgaWQgXS5saWNlbnNlS2V5cyApO1xuICAgIH1cbiAgfSApO1xuXG4gIC8vIEV4dHJhY3Qga2V5cyBmcm9tIHByZWxvYWRzIGFuZCB3ZWJwYWNrLXN1cHBvcnRlZCBpbXBvcnRzIGZvclxuICAvLyBzaGVycGEgKHRoaXJkLXBhcnR5KSBkZXBlbmRlbmNpZXMuXG4gIGNvbnN0IGFsbFBhdGhzOiBzdHJpbmdbXSA9IHByZWxvYWQuY29uY2F0KCBPYmplY3QudmFsdWVzKCB3ZWJwYWNrR2xvYmFsTGlicmFyaWVzICkubWFwKCBwYXRoID0+IGAuLi8ke3BhdGh9YCApICk7XG5cbiAgYWxsUGF0aHMuZm9yRWFjaCggcGF0aCA9PiB7XG4gICAgaWYgKCBwYXRoLmluY2x1ZGVzKCAnL3NoZXJwYS8nICkgKSB7XG4gICAgICBjb25zdCBsYXN0U2xhc2ggPSBwYXRoLmxhc3RJbmRleE9mKCAnLycgKTtcbiAgICAgIGNvbnN0IGtleSA9IHBhdGguc3Vic3RyaW5nKCBsYXN0U2xhc2ggKyAxICk7XG4gICAgICBsaWNlbnNlS2V5cy5wdXNoKCBrZXkgKTtcbiAgICB9XG4gIH0gKTtcblxuICAvLyBzb3J0IGFuZCByZW1vdmUgZHVwbGljYXRlc1xuICByZXR1cm4gXy51bmlxKCBfLnNvcnRCeSggbGljZW5zZUtleXMsICgga2V5OiBzdHJpbmcgKSA9PiBrZXkudG9VcHBlckNhc2UoKSApICk7XG59Il0sIm5hbWVzIjpbInJlYWRGaWxlU3luYyIsIl8iLCJ3ZWJwYWNrR2xvYmFsTGlicmFyaWVzIiwiZ2V0UHJlbG9hZHMiLCJnZXRMaWNlbnNlS2V5cyIsInJlcG8iLCJicmFuZCIsInBhY2thZ2VPYmplY3QiLCJKU09OIiwicGFyc2UiLCJidWlsZE9iamVjdCIsImUiLCJwcmVsb2FkIiwibGljZW5zZUtleXMiLCJwaGV0IiwiZm9yRWFjaCIsImlkIiwiY29uY2F0IiwiYWxsUGF0aHMiLCJPYmplY3QiLCJ2YWx1ZXMiLCJtYXAiLCJwYXRoIiwiaW5jbHVkZXMiLCJsYXN0U2xhc2giLCJsYXN0SW5kZXhPZiIsImtleSIsInN1YnN0cmluZyIsInB1c2giLCJ1bmlxIiwic29ydEJ5IiwidG9VcHBlckNhc2UiXSwibWFwcGluZ3MiOiJBQUFBLHNEQUFzRDtBQUV0RDs7Ozs7Q0FLQyxHQUVELFNBQVNBLFlBQVksUUFBUSxLQUFLO0FBQ2xDLE9BQU9DLE9BQU8sU0FBUztBQUN2QixPQUFPQyw0QkFBNEIsc0NBQXNDO0FBQ3pFLE9BQU9DLGlCQUFpQixtQkFBbUI7QUFFM0M7O0NBRUMsR0FDRCxlQUFlLFNBQVNDLGVBQWdCQyxJQUFZLEVBQUVDLEtBQWE7SUFDakUsTUFBTUMsZ0JBQWdCQyxLQUFLQyxLQUFLLENBQUVULGFBQWMsQ0FBQyxHQUFHLEVBQUVLLEtBQUssYUFBYSxDQUFDLEVBQUU7SUFDM0UsSUFBSUs7SUFDSixJQUFJO1FBQ0ZBLGNBQWNGLEtBQUtDLEtBQUssQ0FBRVQsYUFBYyx5QkFBeUI7SUFDbkUsRUFDQSxPQUFPVyxHQUFJO1FBQ1RELGNBQWMsQ0FBQztJQUNqQjtJQUNBLE1BQU1FLFVBQVVULFlBQWFFLE1BQU1DLE9BQU87SUFFMUMsMEJBQTBCO0lBQzFCLElBQUlPLGNBQXdCTixjQUFjTyxJQUFJLENBQUNELFdBQVcsSUFBSSxFQUFFO0lBRWhFLHdEQUF3RDtJQUN4RDtRQUFFO1FBQVVQO0tBQU8sQ0FBQ1MsT0FBTyxDQUFFQyxDQUFBQTtRQUMzQixJQUFLTixXQUFXLENBQUVNLEdBQUksSUFBSU4sV0FBVyxDQUFFTSxHQUFJLENBQUNILFdBQVcsRUFBRztZQUN4REEsY0FBY0EsWUFBWUksTUFBTSxDQUFFUCxXQUFXLENBQUVNLEdBQUksQ0FBQ0gsV0FBVztRQUNqRTtJQUNGO0lBRUEsK0RBQStEO0lBQy9ELHFDQUFxQztJQUNyQyxNQUFNSyxXQUFxQk4sUUFBUUssTUFBTSxDQUFFRSxPQUFPQyxNQUFNLENBQUVsQix3QkFBeUJtQixHQUFHLENBQUVDLENBQUFBLE9BQVEsQ0FBQyxHQUFHLEVBQUVBLE1BQU07SUFFNUdKLFNBQVNILE9BQU8sQ0FBRU8sQ0FBQUE7UUFDaEIsSUFBS0EsS0FBS0MsUUFBUSxDQUFFLGFBQWU7WUFDakMsTUFBTUMsWUFBWUYsS0FBS0csV0FBVyxDQUFFO1lBQ3BDLE1BQU1DLE1BQU1KLEtBQUtLLFNBQVMsQ0FBRUgsWUFBWTtZQUN4Q1gsWUFBWWUsSUFBSSxDQUFFRjtRQUNwQjtJQUNGO0lBRUEsNkJBQTZCO0lBQzdCLE9BQU96QixFQUFFNEIsSUFBSSxDQUFFNUIsRUFBRTZCLE1BQU0sQ0FBRWpCLGFBQWEsQ0FBRWEsTUFBaUJBLElBQUlLLFdBQVc7QUFDMUUifQ==