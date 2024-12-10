// Copyright 2016, University of Colorado Boulder
/**
 * @fileoverview Rule to check that a require statement does not also do a property access
 * @author Sam Reid (PhET Interactive Simulations)
 * @copyright 2016 University of Colorado Boulder
 */ //------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------
module.exports = {
    create: function(context) {
        return {
            VariableDeclaration: function(node) {
                var _node_declarations__init, _node_declarations_, _node_declarations__init_property, _node_declarations__init_object_callee, _node_declarations__init_object, _node_declarations__init1;
                if (node.declarations && node.declarations.length > 0 && ((_node_declarations_ = node.declarations[0]) == null ? void 0 : (_node_declarations__init = _node_declarations_.init) == null ? void 0 : _node_declarations__init.type) === 'MemberExpression' && ((_node_declarations__init_property = node.declarations[0].init.property) == null ? void 0 : _node_declarations__init_property.name) !== 'default' && ((_node_declarations__init1 = node.declarations[0].init) == null ? void 0 : (_node_declarations__init_object = _node_declarations__init1.object) == null ? void 0 : (_node_declarations__init_object_callee = _node_declarations__init_object.callee) == null ? void 0 : _node_declarations__init_object_callee.name) === 'require') {
                    context.report({
                        node: node,
                        loc: node.loc.start,
                        message: 'property access in require statement'
                    });
                }
            }
        };
    }
};
module.exports.schema = [];

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3BlcmVubmlhbC1hbGlhcy9qcy9lc2xpbnQvcGhldC1ydWxlcy9uby1wcm9wZXJ0eS1pbi1yZXF1aXJlLXN0YXRlbWVudC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNiwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG4vKipcbiAqIEBmaWxlb3ZlcnZpZXcgUnVsZSB0byBjaGVjayB0aGF0IGEgcmVxdWlyZSBzdGF0ZW1lbnQgZG9lcyBub3QgYWxzbyBkbyBhIHByb3BlcnR5IGFjY2Vzc1xuICogQGF1dGhvciBTYW0gUmVpZCAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcbiAqIEBjb3B5cmlnaHQgMjAxNiBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcbiAqL1xuXG5cbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBSdWxlIERlZmluaXRpb25cbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBjcmVhdGU6IGZ1bmN0aW9uKCBjb250ZXh0ICkge1xuXG4gICAgcmV0dXJuIHtcblxuICAgICAgVmFyaWFibGVEZWNsYXJhdGlvbjogZnVuY3Rpb24oIG5vZGUgKSB7XG5cbiAgICAgICAgaWYgKCBub2RlLmRlY2xhcmF0aW9ucyAmJlxuICAgICAgICAgICAgIG5vZGUuZGVjbGFyYXRpb25zLmxlbmd0aCA+IDAgJiZcbiAgICAgICAgICAgICBub2RlLmRlY2xhcmF0aW9uc1sgMCBdPy5pbml0Py50eXBlID09PSAnTWVtYmVyRXhwcmVzc2lvbicgJiZcbiAgICAgICAgICAgICBub2RlLmRlY2xhcmF0aW9uc1sgMCBdLmluaXQucHJvcGVydHk/Lm5hbWUgIT09ICdkZWZhdWx0JyAmJlxuICAgICAgICAgICAgIG5vZGUuZGVjbGFyYXRpb25zWyAwIF0uaW5pdD8ub2JqZWN0Py5jYWxsZWU/Lm5hbWUgPT09ICdyZXF1aXJlJyApIHtcblxuICAgICAgICAgIGNvbnRleHQucmVwb3J0KCB7XG4gICAgICAgICAgICBub2RlOiBub2RlLFxuICAgICAgICAgICAgbG9jOiBub2RlLmxvYy5zdGFydCxcbiAgICAgICAgICAgIG1lc3NhZ2U6ICdwcm9wZXJ0eSBhY2Nlc3MgaW4gcmVxdWlyZSBzdGF0ZW1lbnQnXG4gICAgICAgICAgfSApO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfTtcbiAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMuc2NoZW1hID0gW1xuICAvLyBKU09OIFNjaGVtYSBmb3IgcnVsZSBvcHRpb25zIGdvZXMgaGVyZVxuXTsiXSwibmFtZXMiOlsibW9kdWxlIiwiZXhwb3J0cyIsImNyZWF0ZSIsImNvbnRleHQiLCJWYXJpYWJsZURlY2xhcmF0aW9uIiwibm9kZSIsImRlY2xhcmF0aW9ucyIsImxlbmd0aCIsImluaXQiLCJ0eXBlIiwicHJvcGVydHkiLCJuYW1lIiwib2JqZWN0IiwiY2FsbGVlIiwicmVwb3J0IiwibG9jIiwic3RhcnQiLCJtZXNzYWdlIiwic2NoZW1hIl0sIm1hcHBpbmdzIjoiQUFBQSxpREFBaUQ7QUFDakQ7Ozs7Q0FJQyxHQUdELGdGQUFnRjtBQUNoRixrQkFBa0I7QUFDbEIsZ0ZBQWdGO0FBRWhGQSxPQUFPQyxPQUFPLEdBQUc7SUFDZkMsUUFBUSxTQUFVQyxPQUFPO1FBRXZCLE9BQU87WUFFTEMscUJBQXFCLFNBQVVDLElBQUk7b0JBSTVCQSwwQkFBQUEscUJBQ0FBLG1DQUNBQSx3Q0FBQUEsaUNBQUFBO2dCQUpMLElBQUtBLEtBQUtDLFlBQVksSUFDakJELEtBQUtDLFlBQVksQ0FBQ0MsTUFBTSxHQUFHLEtBQzNCRixFQUFBQSxzQkFBQUEsS0FBS0MsWUFBWSxDQUFFLEVBQUcsc0JBQXRCRCwyQkFBQUEsb0JBQXdCRyxJQUFJLHFCQUE1QkgseUJBQThCSSxJQUFJLE1BQUssc0JBQ3ZDSixFQUFBQSxvQ0FBQUEsS0FBS0MsWUFBWSxDQUFFLEVBQUcsQ0FBQ0UsSUFBSSxDQUFDRSxRQUFRLHFCQUFwQ0wsa0NBQXNDTSxJQUFJLE1BQUssYUFDL0NOLEVBQUFBLDRCQUFBQSxLQUFLQyxZQUFZLENBQUUsRUFBRyxDQUFDRSxJQUFJLHNCQUEzQkgsa0NBQUFBLDBCQUE2Qk8sTUFBTSxzQkFBbkNQLHlDQUFBQSxnQ0FBcUNRLE1BQU0scUJBQTNDUix1Q0FBNkNNLElBQUksTUFBSyxXQUFZO29CQUVyRVIsUUFBUVcsTUFBTSxDQUFFO3dCQUNkVCxNQUFNQTt3QkFDTlUsS0FBS1YsS0FBS1UsR0FBRyxDQUFDQyxLQUFLO3dCQUNuQkMsU0FBUztvQkFDWDtnQkFDRjtZQUNGO1FBQ0Y7SUFDRjtBQUNGO0FBRUFqQixPQUFPQyxPQUFPLENBQUNpQixNQUFNLEdBQUcsRUFFdkIifQ==