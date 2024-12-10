// Copyright 2018, University of Colorado Boulder
// @author Michael Kauzmann
function _extends() {
    _extends = Object.assign || function(target) {
        for(var i = 1; i < arguments.length; i++){
            var source = arguments[i];
            for(var key in source){
                if (Object.prototype.hasOwnProperty.call(source, key)) {
                    target[key] = source[key];
                }
            }
        }
        return target;
    };
    return _extends.apply(this, arguments);
}
import globals from 'globals';
/**
 * The node-specific eslint config applied only to "server-side" files that aren't run in sims. Factored out from
 * node.eslint.config for reuse in the root config.
 *
 * @author Michael Kauzmann (PhET Interactive Simulations
 * @author Sam Reid (PhET Interactive Simulations)
 */ const getNodeConfiguration = (pattern = {})=>{
    return [
        _extends({
            languageOptions: {
                globals: _extends({}, globals.node)
            },
            rules: {
                '@typescript-eslint/no-require-imports': 'off',
                '@typescript-eslint/no-var-requires': 'off',
                'phet/no-import-from-grunt-tasks': 'error',
                'phet/grunt-task-kebab-case': 'error',
                // phet-specific require statement rules
                'phet/require-statement-match': 'error',
                'phet/require-statement-extension': 'error',
                'phet/no-property-in-require-statement': 'error',
                // Rule that prevents importing from installed node_modules instead of reusing the installation from perennial
                'no-restricted-imports': [
                    'error',
                    ...[
                        'puppeteer',
                        'winston',
                        'axios',
                        'qunit'
                    ].map((name)=>{
                        return {
                            name: name,
                            message: 'Prefer importing from perennial/js/npm-dependencies instead of installing a separate copy'
                        };
                    })
                ]
            }
        }, pattern)
    ];
};
export default getNodeConfiguration;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BlcmVubmlhbC1hbGlhcy9qcy9lc2xpbnQvY29uZmlnL3V0aWwvZ2V0Tm9kZUNvbmZpZ3VyYXRpb24ubWpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE4LCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcbi8vIEBhdXRob3IgTWljaGFlbCBLYXV6bWFublxuXG5pbXBvcnQgZ2xvYmFscyBmcm9tICdnbG9iYWxzJztcblxuLyoqXG4gKiBUaGUgbm9kZS1zcGVjaWZpYyBlc2xpbnQgY29uZmlnIGFwcGxpZWQgb25seSB0byBcInNlcnZlci1zaWRlXCIgZmlsZXMgdGhhdCBhcmVuJ3QgcnVuIGluIHNpbXMuIEZhY3RvcmVkIG91dCBmcm9tXG4gKiBub2RlLmVzbGludC5jb25maWcgZm9yIHJldXNlIGluIHRoZSByb290IGNvbmZpZy5cbiAqXG4gKiBAYXV0aG9yIE1pY2hhZWwgS2F1em1hbm4gKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnNcbiAqIEBhdXRob3IgU2FtIFJlaWQgKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXG4gKi9cbmNvbnN0IGdldE5vZGVDb25maWd1cmF0aW9uID0gKCBwYXR0ZXJuID0ge30gKSA9PiB7XG4gIHJldHVybiBbXG4gICAge1xuICAgICAgbGFuZ3VhZ2VPcHRpb25zOiB7XG4gICAgICAgIGdsb2JhbHM6IHtcbiAgICAgICAgICAuLi5nbG9iYWxzLm5vZGVcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIHJ1bGVzOiB7XG4gICAgICAgICdAdHlwZXNjcmlwdC1lc2xpbnQvbm8tcmVxdWlyZS1pbXBvcnRzJzogJ29mZicsXG4gICAgICAgICdAdHlwZXNjcmlwdC1lc2xpbnQvbm8tdmFyLXJlcXVpcmVzJzogJ29mZicsXG4gICAgICAgICdwaGV0L25vLWltcG9ydC1mcm9tLWdydW50LXRhc2tzJzogJ2Vycm9yJyxcbiAgICAgICAgJ3BoZXQvZ3J1bnQtdGFzay1rZWJhYi1jYXNlJzogJ2Vycm9yJyxcblxuICAgICAgICAvLyBwaGV0LXNwZWNpZmljIHJlcXVpcmUgc3RhdGVtZW50IHJ1bGVzXG4gICAgICAgICdwaGV0L3JlcXVpcmUtc3RhdGVtZW50LW1hdGNoJzogJ2Vycm9yJyxcbiAgICAgICAgJ3BoZXQvcmVxdWlyZS1zdGF0ZW1lbnQtZXh0ZW5zaW9uJzogJ2Vycm9yJyxcbiAgICAgICAgJ3BoZXQvbm8tcHJvcGVydHktaW4tcmVxdWlyZS1zdGF0ZW1lbnQnOiAnZXJyb3InLFxuXG4gICAgICAgIC8vIFJ1bGUgdGhhdCBwcmV2ZW50cyBpbXBvcnRpbmcgZnJvbSBpbnN0YWxsZWQgbm9kZV9tb2R1bGVzIGluc3RlYWQgb2YgcmV1c2luZyB0aGUgaW5zdGFsbGF0aW9uIGZyb20gcGVyZW5uaWFsXG4gICAgICAgICduby1yZXN0cmljdGVkLWltcG9ydHMnOiBbXG4gICAgICAgICAgJ2Vycm9yJywgLi4uWyAncHVwcGV0ZWVyJywgJ3dpbnN0b24nLCAnYXhpb3MnLCAncXVuaXQnIF0ubWFwKCBuYW1lID0+IHtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgIG5hbWU6IG5hbWUsXG4gICAgICAgICAgICAgIG1lc3NhZ2U6ICdQcmVmZXIgaW1wb3J0aW5nIGZyb20gcGVyZW5uaWFsL2pzL25wbS1kZXBlbmRlbmNpZXMgaW5zdGVhZCBvZiBpbnN0YWxsaW5nIGEgc2VwYXJhdGUgY29weSdcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgfSApXG4gICAgICAgIF1cbiAgICAgIH0sXG4gICAgICAuLi5wYXR0ZXJuXG4gICAgfVxuICBdO1xufTtcblxuZXhwb3J0IGRlZmF1bHQgZ2V0Tm9kZUNvbmZpZ3VyYXRpb247Il0sIm5hbWVzIjpbImdsb2JhbHMiLCJnZXROb2RlQ29uZmlndXJhdGlvbiIsInBhdHRlcm4iLCJsYW5ndWFnZU9wdGlvbnMiLCJub2RlIiwicnVsZXMiLCJtYXAiLCJuYW1lIiwibWVzc2FnZSJdLCJtYXBwaW5ncyI6IkFBQUEsaURBQWlEO0FBQ2pELDJCQUEyQjs7Ozs7Ozs7Ozs7Ozs7O0FBRTNCLE9BQU9BLGFBQWEsVUFBVTtBQUU5Qjs7Ozs7O0NBTUMsR0FDRCxNQUFNQyx1QkFBdUIsQ0FBRUMsVUFBVSxDQUFDLENBQUM7SUFDekMsT0FBTztRQUNMO1lBQ0VDLGlCQUFpQjtnQkFDZkgsU0FBUyxhQUNKQSxRQUFRSSxJQUFJO1lBRW5CO1lBQ0FDLE9BQU87Z0JBQ0wseUNBQXlDO2dCQUN6QyxzQ0FBc0M7Z0JBQ3RDLG1DQUFtQztnQkFDbkMsOEJBQThCO2dCQUU5Qix3Q0FBd0M7Z0JBQ3hDLGdDQUFnQztnQkFDaEMsb0NBQW9DO2dCQUNwQyx5Q0FBeUM7Z0JBRXpDLDhHQUE4RztnQkFDOUcseUJBQXlCO29CQUN2Qjt1QkFBWTt3QkFBRTt3QkFBYTt3QkFBVzt3QkFBUztxQkFBUyxDQUFDQyxHQUFHLENBQUVDLENBQUFBO3dCQUM1RCxPQUFPOzRCQUNMQSxNQUFNQTs0QkFDTkMsU0FBUzt3QkFDWDtvQkFDRjtpQkFDRDtZQUNIO1dBQ0dOO0tBRU47QUFDSDtBQUVBLGVBQWVELHFCQUFxQiJ9