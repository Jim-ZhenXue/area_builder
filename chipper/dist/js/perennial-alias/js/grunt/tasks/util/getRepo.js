// Copyright 2013-2024, University of Colorado Boulder
import assert from 'assert';
import { readFileSync } from 'fs';
import path from 'path';
import process from 'process';
import dirname from '../../../common/dirname.js';
import getOption from './getOption.js';
// @ts-expect-error - until we have "type": "module" in our package.json
const __dirname = dirname(import.meta.url);
/**
 * Get the repo by processing from multiple locations (command line options and package).
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */ export default function getRepo() {
    let repo = getOption('repo');
    if (!repo) {
        try {
            const packageObject = JSON.parse(readFileSync('package.json', 'utf8'));
            repo = packageObject.name;
            // Support checking in "perennial-alias" if running from that repo
            if (repo === 'perennial') {
                repo = path.parse(path.resolve(`${__dirname}/../../../../`)).name;
                assert(repo.startsWith('perennial'), `unexpected repo name in perennial: ${repo}`);
            }
        } catch (e) {
            assert(false, `Expected package.json for current working directory: ${process.cwd()}`);
        }
    }
    assert(typeof repo === 'string' && /^[a-z]+(-[a-z]+)*$/u.test(repo), `repo name should be composed of lower-case characters, optionally with dashes used as separators: ${repo}`);
    return repo;
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BlcmVubmlhbC1hbGlhcy9qcy9ncnVudC90YXNrcy91dGlsL2dldFJlcG8udHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTMtMjAyNCwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbmltcG9ydCBhc3NlcnQgZnJvbSAnYXNzZXJ0JztcbmltcG9ydCB7IHJlYWRGaWxlU3luYyB9IGZyb20gJ2ZzJztcbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0IHByb2Nlc3MgZnJvbSAncHJvY2Vzcyc7XG5pbXBvcnQgZGlybmFtZSBmcm9tICcuLi8uLi8uLi9jb21tb24vZGlybmFtZS5qcyc7XG5pbXBvcnQgeyBSZXBvIH0gZnJvbSAnLi4vLi4vLi4vYnJvd3Nlci1hbmQtbm9kZS9QZXJlbm5pYWxUeXBlcy5qcyc7XG5pbXBvcnQgZ2V0T3B0aW9uIGZyb20gJy4vZ2V0T3B0aW9uLmpzJztcblxuLy8gQHRzLWV4cGVjdC1lcnJvciAtIHVudGlsIHdlIGhhdmUgXCJ0eXBlXCI6IFwibW9kdWxlXCIgaW4gb3VyIHBhY2thZ2UuanNvblxuY29uc3QgX19kaXJuYW1lID0gZGlybmFtZSggaW1wb3J0Lm1ldGEudXJsICk7XG5cbi8qKlxuICogR2V0IHRoZSByZXBvIGJ5IHByb2Nlc3NpbmcgZnJvbSBtdWx0aXBsZSBsb2NhdGlvbnMgKGNvbW1hbmQgbGluZSBvcHRpb25zIGFuZCBwYWNrYWdlKS5cbiAqIEBhdXRob3IgU2FtIFJlaWQgKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXG4gKiBAYXV0aG9yIE1pY2hhZWwgS2F1em1hbm4gKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGdldFJlcG8oKTogUmVwbyB7XG5cbiAgbGV0IHJlcG8gPSBnZXRPcHRpb24oICdyZXBvJyApO1xuXG4gIGlmICggIXJlcG8gKSB7XG5cbiAgICB0cnkge1xuICAgICAgY29uc3QgcGFja2FnZU9iamVjdCA9IEpTT04ucGFyc2UoIHJlYWRGaWxlU3luYyggJ3BhY2thZ2UuanNvbicsICd1dGY4JyApICk7XG4gICAgICByZXBvID0gcGFja2FnZU9iamVjdC5uYW1lO1xuXG4gICAgICAvLyBTdXBwb3J0IGNoZWNraW5nIGluIFwicGVyZW5uaWFsLWFsaWFzXCIgaWYgcnVubmluZyBmcm9tIHRoYXQgcmVwb1xuICAgICAgaWYgKCByZXBvID09PSAncGVyZW5uaWFsJyApIHtcbiAgICAgICAgcmVwbyA9IHBhdGgucGFyc2UoIHBhdGgucmVzb2x2ZSggYCR7X19kaXJuYW1lfS8uLi8uLi8uLi8uLi9gICkgKS5uYW1lO1xuICAgICAgICBhc3NlcnQoIHJlcG8uc3RhcnRzV2l0aCggJ3BlcmVubmlhbCcgKSwgYHVuZXhwZWN0ZWQgcmVwbyBuYW1lIGluIHBlcmVubmlhbDogJHtyZXBvfWAgKTtcbiAgICAgIH1cbiAgICB9XG4gICAgY2F0Y2goIGUgKSB7XG4gICAgICBhc3NlcnQoIGZhbHNlLCBgRXhwZWN0ZWQgcGFja2FnZS5qc29uIGZvciBjdXJyZW50IHdvcmtpbmcgZGlyZWN0b3J5OiAke3Byb2Nlc3MuY3dkKCl9YCApO1xuICAgIH1cbiAgfVxuXG4gIGFzc2VydCggdHlwZW9mIHJlcG8gPT09ICdzdHJpbmcnICYmIC9eW2Etel0rKC1bYS16XSspKiQvdS50ZXN0KCByZXBvICksIGByZXBvIG5hbWUgc2hvdWxkIGJlIGNvbXBvc2VkIG9mIGxvd2VyLWNhc2UgY2hhcmFjdGVycywgb3B0aW9uYWxseSB3aXRoIGRhc2hlcyB1c2VkIGFzIHNlcGFyYXRvcnM6ICR7cmVwb31gICk7XG5cbiAgcmV0dXJuIHJlcG87XG59Il0sIm5hbWVzIjpbImFzc2VydCIsInJlYWRGaWxlU3luYyIsInBhdGgiLCJwcm9jZXNzIiwiZGlybmFtZSIsImdldE9wdGlvbiIsIl9fZGlybmFtZSIsInVybCIsImdldFJlcG8iLCJyZXBvIiwicGFja2FnZU9iamVjdCIsIkpTT04iLCJwYXJzZSIsIm5hbWUiLCJyZXNvbHZlIiwic3RhcnRzV2l0aCIsImUiLCJjd2QiLCJ0ZXN0Il0sIm1hcHBpbmdzIjoiQUFBQSxzREFBc0Q7QUFFdEQsT0FBT0EsWUFBWSxTQUFTO0FBQzVCLFNBQVNDLFlBQVksUUFBUSxLQUFLO0FBQ2xDLE9BQU9DLFVBQVUsT0FBTztBQUN4QixPQUFPQyxhQUFhLFVBQVU7QUFDOUIsT0FBT0MsYUFBYSw2QkFBNkI7QUFFakQsT0FBT0MsZUFBZSxpQkFBaUI7QUFFdkMsd0VBQXdFO0FBQ3hFLE1BQU1DLFlBQVlGLFFBQVMsWUFBWUcsR0FBRztBQUUxQzs7OztDQUlDLEdBQ0QsZUFBZSxTQUFTQztJQUV0QixJQUFJQyxPQUFPSixVQUFXO0lBRXRCLElBQUssQ0FBQ0ksTUFBTztRQUVYLElBQUk7WUFDRixNQUFNQyxnQkFBZ0JDLEtBQUtDLEtBQUssQ0FBRVgsYUFBYyxnQkFBZ0I7WUFDaEVRLE9BQU9DLGNBQWNHLElBQUk7WUFFekIsa0VBQWtFO1lBQ2xFLElBQUtKLFNBQVMsYUFBYztnQkFDMUJBLE9BQU9QLEtBQUtVLEtBQUssQ0FBRVYsS0FBS1ksT0FBTyxDQUFFLEdBQUdSLFVBQVUsYUFBYSxDQUFDLEdBQUtPLElBQUk7Z0JBQ3JFYixPQUFRUyxLQUFLTSxVQUFVLENBQUUsY0FBZSxDQUFDLG1DQUFtQyxFQUFFTixNQUFNO1lBQ3RGO1FBQ0YsRUFDQSxPQUFPTyxHQUFJO1lBQ1RoQixPQUFRLE9BQU8sQ0FBQyxxREFBcUQsRUFBRUcsUUFBUWMsR0FBRyxJQUFJO1FBQ3hGO0lBQ0Y7SUFFQWpCLE9BQVEsT0FBT1MsU0FBUyxZQUFZLHNCQUFzQlMsSUFBSSxDQUFFVCxPQUFRLENBQUMsa0dBQWtHLEVBQUVBLE1BQU07SUFFbkwsT0FBT0E7QUFDVCJ9