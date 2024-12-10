// Copyright 2024, University of Colorado Boulder
/**
 * Babel plugin that removes calls to 'affirm' and import statements for 'affirm'.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */ module.exports = function() {
    return {
        visitor: {
            CallExpression (path) {
                // Check if the call expression is a call to 'affirm'
                if (path.get('callee').isIdentifier({
                    name: 'affirm'
                })) {
                    path.remove();
                }
            }
        }
    };
};

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2pzL2dydW50L2JhYmVsLXBsdWdpbi1yZW1vdmUtYWZmaXJtLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDI0LCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuLyoqXG4gKiBCYWJlbCBwbHVnaW4gdGhhdCByZW1vdmVzIGNhbGxzIHRvICdhZmZpcm0nIGFuZCBpbXBvcnQgc3RhdGVtZW50cyBmb3IgJ2FmZmlybScuXG4gKlxuICogQGF1dGhvciBTYW0gUmVpZCAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIHtcbiAgICB2aXNpdG9yOiB7XG4gICAgICBDYWxsRXhwcmVzc2lvbiggcGF0aCApIHtcblxuICAgICAgICAvLyBDaGVjayBpZiB0aGUgY2FsbCBleHByZXNzaW9uIGlzIGEgY2FsbCB0byAnYWZmaXJtJ1xuICAgICAgICBpZiAoIHBhdGguZ2V0KCAnY2FsbGVlJyApLmlzSWRlbnRpZmllciggeyBuYW1lOiAnYWZmaXJtJyB9ICkgKSB7XG4gICAgICAgICAgcGF0aC5yZW1vdmUoKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfTtcbn07Il0sIm5hbWVzIjpbIm1vZHVsZSIsImV4cG9ydHMiLCJ2aXNpdG9yIiwiQ2FsbEV4cHJlc3Npb24iLCJwYXRoIiwiZ2V0IiwiaXNJZGVudGlmaWVyIiwibmFtZSIsInJlbW92ZSJdLCJtYXBwaW5ncyI6IkFBQUEsaURBQWlEO0FBRWpEOzs7O0NBSUMsR0FDREEsT0FBT0MsT0FBTyxHQUFHO0lBQ2YsT0FBTztRQUNMQyxTQUFTO1lBQ1BDLGdCQUFnQkMsSUFBSTtnQkFFbEIscURBQXFEO2dCQUNyRCxJQUFLQSxLQUFLQyxHQUFHLENBQUUsVUFBV0MsWUFBWSxDQUFFO29CQUFFQyxNQUFNO2dCQUFTLElBQU07b0JBQzdESCxLQUFLSSxNQUFNO2dCQUNiO1lBQ0Y7UUFDRjtJQUNGO0FBQ0YifQ==