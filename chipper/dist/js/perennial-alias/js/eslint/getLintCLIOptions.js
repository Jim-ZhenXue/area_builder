// Copyright 2024, University of Colorado Boulder
import getRepoList from '../common/getRepoList.js';
/**
 * Parse command line options for linting.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */ import getOption, { isOptionKeyProvided } from '../grunt/tasks/util/getOption.js';
export const DEFAULT_MAX_PROCESSES = 6;
/**
 * Get the list of repos to lint when doing lint-everything or lint --all
 * Linting runs in perennial-alias by default in all repos except perennial/ see https://github.com/phetsims/chipper/issues/1520
 */ export function getLintEverythingRepos() {
    return getRepoList('active-repos');
}
export default function getLintCLIOptions() {
    const lintOptions = {};
    // Max number of processes to divide up the work
    if (isOptionKeyProvided('processes')) {
        lintOptions.processes = getOption('processes');
    }
    // Two apis for turning this off.
    // Cache results for a speed boost.
    // Use --clean or --disable-eslint-cache to disable the cache; useful for developing rules.
    if (isOptionKeyProvided('clean') || isOptionKeyProvided('disable-eslint-cache')) {
        lintOptions.clean = true;
    }
    // Fix things that can be auto-fixed (written to disk)
    if (isOptionKeyProvided('fix')) {
        lintOptions.fix = getOption('fix');
    }
    return lintOptions;
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3BlcmVubmlhbC1hbGlhcy9qcy9lc2xpbnQvZ2V0TGludENMSU9wdGlvbnMudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjQsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG5pbXBvcnQgZ2V0UmVwb0xpc3QgZnJvbSAnLi4vY29tbW9uL2dldFJlcG9MaXN0LmpzJztcbmltcG9ydCB7IFJlcG8gfSBmcm9tICcuLi9icm93c2VyLWFuZC1ub2RlL1BlcmVubmlhbFR5cGVzLmpzJztcbi8qKlxuICogUGFyc2UgY29tbWFuZCBsaW5lIG9wdGlvbnMgZm9yIGxpbnRpbmcuXG4gKlxuICogQGF1dGhvciBTYW0gUmVpZCAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcbiAqIEBhdXRob3IgTWljaGFlbCBLYXV6bWFubiAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcbiAqL1xuaW1wb3J0IGdldE9wdGlvbiwgeyBpc09wdGlvbktleVByb3ZpZGVkIH0gZnJvbSAnLi4vZ3J1bnQvdGFza3MvdXRpbC9nZXRPcHRpb24uanMnO1xuXG5leHBvcnQgdHlwZSBMaW50T3B0aW9ucyA9IHtcbiAgY2xlYW4/OiBib29sZWFuO1xuICBmaXg/OiBib29sZWFuO1xuICBwcm9jZXNzZXM/OiBudW1iZXI7XG59O1xuXG5leHBvcnQgY29uc3QgREVGQVVMVF9NQVhfUFJPQ0VTU0VTID0gNjtcblxuXG4vKipcbiAqIEdldCB0aGUgbGlzdCBvZiByZXBvcyB0byBsaW50IHdoZW4gZG9pbmcgbGludC1ldmVyeXRoaW5nIG9yIGxpbnQgLS1hbGxcbiAqIExpbnRpbmcgcnVucyBpbiBwZXJlbm5pYWwtYWxpYXMgYnkgZGVmYXVsdCBpbiBhbGwgcmVwb3MgZXhjZXB0IHBlcmVubmlhbC8gc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9jaGlwcGVyL2lzc3Vlcy8xNTIwXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRMaW50RXZlcnl0aGluZ1JlcG9zKCk6IFJlcG9bXSB7XG4gIHJldHVybiBnZXRSZXBvTGlzdCggJ2FjdGl2ZS1yZXBvcycgKTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gZ2V0TGludENMSU9wdGlvbnMoKTogUGFydGlhbDxMaW50T3B0aW9ucz4ge1xuXG4gIGNvbnN0IGxpbnRPcHRpb25zOiBQYXJ0aWFsPExpbnRPcHRpb25zPiA9IHt9O1xuXG4gIC8vIE1heCBudW1iZXIgb2YgcHJvY2Vzc2VzIHRvIGRpdmlkZSB1cCB0aGUgd29ya1xuICBpZiAoIGlzT3B0aW9uS2V5UHJvdmlkZWQoICdwcm9jZXNzZXMnICkgKSB7XG4gICAgbGludE9wdGlvbnMucHJvY2Vzc2VzID0gZ2V0T3B0aW9uKCAncHJvY2Vzc2VzJyApO1xuICB9XG5cbiAgLy8gVHdvIGFwaXMgZm9yIHR1cm5pbmcgdGhpcyBvZmYuXG4gIC8vIENhY2hlIHJlc3VsdHMgZm9yIGEgc3BlZWQgYm9vc3QuXG4gIC8vIFVzZSAtLWNsZWFuIG9yIC0tZGlzYWJsZS1lc2xpbnQtY2FjaGUgdG8gZGlzYWJsZSB0aGUgY2FjaGU7IHVzZWZ1bCBmb3IgZGV2ZWxvcGluZyBydWxlcy5cbiAgaWYgKCBpc09wdGlvbktleVByb3ZpZGVkKCAnY2xlYW4nICkgfHwgaXNPcHRpb25LZXlQcm92aWRlZCggJ2Rpc2FibGUtZXNsaW50LWNhY2hlJyApICkge1xuICAgIGxpbnRPcHRpb25zLmNsZWFuID0gdHJ1ZTtcbiAgfVxuXG4gIC8vIEZpeCB0aGluZ3MgdGhhdCBjYW4gYmUgYXV0by1maXhlZCAod3JpdHRlbiB0byBkaXNrKVxuICBpZiAoIGlzT3B0aW9uS2V5UHJvdmlkZWQoICdmaXgnICkgKSB7XG4gICAgbGludE9wdGlvbnMuZml4ID0gZ2V0T3B0aW9uKCAnZml4JyApO1xuICB9XG5cbiAgcmV0dXJuIGxpbnRPcHRpb25zO1xufSJdLCJuYW1lcyI6WyJnZXRSZXBvTGlzdCIsImdldE9wdGlvbiIsImlzT3B0aW9uS2V5UHJvdmlkZWQiLCJERUZBVUxUX01BWF9QUk9DRVNTRVMiLCJnZXRMaW50RXZlcnl0aGluZ1JlcG9zIiwiZ2V0TGludENMSU9wdGlvbnMiLCJsaW50T3B0aW9ucyIsInByb2Nlc3NlcyIsImNsZWFuIiwiZml4Il0sIm1hcHBpbmdzIjoiQUFBQSxpREFBaUQ7QUFFakQsT0FBT0EsaUJBQWlCLDJCQUEyQjtBQUVuRDs7Ozs7Q0FLQyxHQUNELE9BQU9DLGFBQWFDLG1CQUFtQixRQUFRLG1DQUFtQztBQVFsRixPQUFPLE1BQU1DLHdCQUF3QixFQUFFO0FBR3ZDOzs7Q0FHQyxHQUNELE9BQU8sU0FBU0M7SUFDZCxPQUFPSixZQUFhO0FBQ3RCO0FBRUEsZUFBZSxTQUFTSztJQUV0QixNQUFNQyxjQUFvQyxDQUFDO0lBRTNDLGdEQUFnRDtJQUNoRCxJQUFLSixvQkFBcUIsY0FBZ0I7UUFDeENJLFlBQVlDLFNBQVMsR0FBR04sVUFBVztJQUNyQztJQUVBLGlDQUFpQztJQUNqQyxtQ0FBbUM7SUFDbkMsMkZBQTJGO0lBQzNGLElBQUtDLG9CQUFxQixZQUFhQSxvQkFBcUIseUJBQTJCO1FBQ3JGSSxZQUFZRSxLQUFLLEdBQUc7SUFDdEI7SUFFQSxzREFBc0Q7SUFDdEQsSUFBS04sb0JBQXFCLFFBQVU7UUFDbENJLFlBQVlHLEdBQUcsR0FBR1IsVUFBVztJQUMvQjtJQUVBLE9BQU9LO0FBQ1QifQ==