// Copyright 2023, University of Colorado Boulder
/**
 * @name prefer-derived-string-property
 * @fileoverview Rule to check that you use DerivedStringProperty if providing a phetioValueType of StringIO to
 * DerivedProperty.
 *
 * MK used https://eslint.org/docs/latest/extend/custom-rules to assist in development of this rule.
 * @author Michael Kauzmann (PhET Interactive Simulations)
 * @copyright 2016 University of Colorado Boulder
 */ //------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------
module.exports = {
    meta: {
        fixable: 'code' // or 'whitespace' depending on the nature of your fixes
    },
    create: function(context) {
        return {
            NewExpression (node) {
                // Check if the constructor is 'DerivedProperty'
                if (node.callee.type === 'Identifier' && node.callee.name === 'DerivedProperty') {
                    const options = node.arguments[2];
                    // Check if there is an options argument
                    if (options && options.type === 'ObjectExpression') {
                        const phetioValueTypeProperty = options.properties.find((prop)=>{
                            return prop.key.type === 'Identifier' && prop.key.name === 'phetioValueType';
                        });
                        // Check if 'phetioValueType' property is 'StringIO'
                        if (phetioValueTypeProperty && phetioValueTypeProperty.value.type === 'Identifier' && phetioValueTypeProperty.value.name === 'StringIO') {
                            context.report({
                                node: node,
                                message: 'Avoid using StringIO as phetioValueType',
                                fix: (fixer)=>{
                                    // Replace DerivedProperty with DerivedStringProperty
                                    const derivedStringPropertyReplacement = fixer.replaceTextRange(node.callee.range, 'DerivedStringProperty');
                                    // Remove `phetioValueType: StringIO`
                                    const phetioValueTypePropertyRange = [
                                        phetioValueTypeProperty.range[0] - 1,
                                        phetioValueTypeProperty.range[1] + 1
                                    ];
                                    const removeStringIoOption = fixer.removeRange(phetioValueTypePropertyRange);
                                    return [
                                        derivedStringPropertyReplacement,
                                        removeStringIoOption
                                    ];
                                }
                            });
                        }
                    }
                }
            }
        };
    }
};
module.exports.schema = [];

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3BlcmVubmlhbC1hbGlhcy9qcy9lc2xpbnQvcGhldC1ydWxlcy9wcmVmZXItZGVyaXZlZC1zdHJpbmctcHJvcGVydHkuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjMsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuLyoqXG4gKiBAbmFtZSBwcmVmZXItZGVyaXZlZC1zdHJpbmctcHJvcGVydHlcbiAqIEBmaWxlb3ZlcnZpZXcgUnVsZSB0byBjaGVjayB0aGF0IHlvdSB1c2UgRGVyaXZlZFN0cmluZ1Byb3BlcnR5IGlmIHByb3ZpZGluZyBhIHBoZXRpb1ZhbHVlVHlwZSBvZiBTdHJpbmdJTyB0b1xuICogRGVyaXZlZFByb3BlcnR5LlxuICpcbiAqIE1LIHVzZWQgaHR0cHM6Ly9lc2xpbnQub3JnL2RvY3MvbGF0ZXN0L2V4dGVuZC9jdXN0b20tcnVsZXMgdG8gYXNzaXN0IGluIGRldmVsb3BtZW50IG9mIHRoaXMgcnVsZS5cbiAqIEBhdXRob3IgTWljaGFlbCBLYXV6bWFubiAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcbiAqIEBjb3B5cmlnaHQgMjAxNiBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcbiAqL1xuXG5cbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBSdWxlIERlZmluaXRpb25cbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgbWV0YToge1xuICAgIGZpeGFibGU6ICdjb2RlJyAvLyBvciAnd2hpdGVzcGFjZScgZGVwZW5kaW5nIG9uIHRoZSBuYXR1cmUgb2YgeW91ciBmaXhlc1xuICB9LFxuICBjcmVhdGU6IGZ1bmN0aW9uKCBjb250ZXh0ICkge1xuICAgIHJldHVybiB7XG4gICAgICBOZXdFeHByZXNzaW9uKCBub2RlICkge1xuXG4gICAgICAgIC8vIENoZWNrIGlmIHRoZSBjb25zdHJ1Y3RvciBpcyAnRGVyaXZlZFByb3BlcnR5J1xuICAgICAgICBpZiAoIG5vZGUuY2FsbGVlLnR5cGUgPT09ICdJZGVudGlmaWVyJyAmJiBub2RlLmNhbGxlZS5uYW1lID09PSAnRGVyaXZlZFByb3BlcnR5JyApIHtcblxuICAgICAgICAgIGNvbnN0IG9wdGlvbnMgPSBub2RlLmFyZ3VtZW50c1sgMiBdO1xuXG4gICAgICAgICAgLy8gQ2hlY2sgaWYgdGhlcmUgaXMgYW4gb3B0aW9ucyBhcmd1bWVudFxuICAgICAgICAgIGlmICggb3B0aW9ucyAmJiBvcHRpb25zLnR5cGUgPT09ICdPYmplY3RFeHByZXNzaW9uJyApIHtcblxuICAgICAgICAgICAgY29uc3QgcGhldGlvVmFsdWVUeXBlUHJvcGVydHkgPSBvcHRpb25zLnByb3BlcnRpZXMuZmluZCggcHJvcCA9PiB7XG4gICAgICAgICAgICAgIHJldHVybiBwcm9wLmtleS50eXBlID09PSAnSWRlbnRpZmllcicgJiYgcHJvcC5rZXkubmFtZSA9PT0gJ3BoZXRpb1ZhbHVlVHlwZSc7XG4gICAgICAgICAgICB9ICk7XG4gICAgICAgICAgICAvLyBDaGVjayBpZiAncGhldGlvVmFsdWVUeXBlJyBwcm9wZXJ0eSBpcyAnU3RyaW5nSU8nXG4gICAgICAgICAgICBpZiAoIHBoZXRpb1ZhbHVlVHlwZVByb3BlcnR5ICYmIHBoZXRpb1ZhbHVlVHlwZVByb3BlcnR5LnZhbHVlLnR5cGUgPT09ICdJZGVudGlmaWVyJyAmJlxuICAgICAgICAgICAgICAgICBwaGV0aW9WYWx1ZVR5cGVQcm9wZXJ0eS52YWx1ZS5uYW1lID09PSAnU3RyaW5nSU8nICkge1xuICAgICAgICAgICAgICBjb250ZXh0LnJlcG9ydCgge1xuICAgICAgICAgICAgICAgIG5vZGU6IG5vZGUsXG4gICAgICAgICAgICAgICAgbWVzc2FnZTogJ0F2b2lkIHVzaW5nIFN0cmluZ0lPIGFzIHBoZXRpb1ZhbHVlVHlwZScsXG4gICAgICAgICAgICAgICAgZml4OiBmaXhlciA9PiB7XG5cbiAgICAgICAgICAgICAgICAgIC8vIFJlcGxhY2UgRGVyaXZlZFByb3BlcnR5IHdpdGggRGVyaXZlZFN0cmluZ1Byb3BlcnR5XG4gICAgICAgICAgICAgICAgICBjb25zdCBkZXJpdmVkU3RyaW5nUHJvcGVydHlSZXBsYWNlbWVudCA9IGZpeGVyLnJlcGxhY2VUZXh0UmFuZ2UoIG5vZGUuY2FsbGVlLnJhbmdlLCAnRGVyaXZlZFN0cmluZ1Byb3BlcnR5JyApO1xuXG4gICAgICAgICAgICAgICAgICAvLyBSZW1vdmUgYHBoZXRpb1ZhbHVlVHlwZTogU3RyaW5nSU9gXG4gICAgICAgICAgICAgICAgICBjb25zdCBwaGV0aW9WYWx1ZVR5cGVQcm9wZXJ0eVJhbmdlID0gWyBwaGV0aW9WYWx1ZVR5cGVQcm9wZXJ0eS5yYW5nZVsgMCBdIC0gMSwgcGhldGlvVmFsdWVUeXBlUHJvcGVydHkucmFuZ2VbIDEgXSArIDEgXTtcbiAgICAgICAgICAgICAgICAgIGNvbnN0IHJlbW92ZVN0cmluZ0lvT3B0aW9uID0gZml4ZXIucmVtb3ZlUmFuZ2UoIHBoZXRpb1ZhbHVlVHlwZVByb3BlcnR5UmFuZ2UgKTtcblxuICAgICAgICAgICAgICAgICAgcmV0dXJuIFsgZGVyaXZlZFN0cmluZ1Byb3BlcnR5UmVwbGFjZW1lbnQsIHJlbW92ZVN0cmluZ0lvT3B0aW9uIF07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9ICk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfTtcbiAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMuc2NoZW1hID0gW1xuICAvLyBKU09OIFNjaGVtYSBmb3IgcnVsZSBvcHRpb25zIGdvZXMgaGVyZVxuXTsiXSwibmFtZXMiOlsibW9kdWxlIiwiZXhwb3J0cyIsIm1ldGEiLCJmaXhhYmxlIiwiY3JlYXRlIiwiY29udGV4dCIsIk5ld0V4cHJlc3Npb24iLCJub2RlIiwiY2FsbGVlIiwidHlwZSIsIm5hbWUiLCJvcHRpb25zIiwiYXJndW1lbnRzIiwicGhldGlvVmFsdWVUeXBlUHJvcGVydHkiLCJwcm9wZXJ0aWVzIiwiZmluZCIsInByb3AiLCJrZXkiLCJ2YWx1ZSIsInJlcG9ydCIsIm1lc3NhZ2UiLCJmaXgiLCJmaXhlciIsImRlcml2ZWRTdHJpbmdQcm9wZXJ0eVJlcGxhY2VtZW50IiwicmVwbGFjZVRleHRSYW5nZSIsInJhbmdlIiwicGhldGlvVmFsdWVUeXBlUHJvcGVydHlSYW5nZSIsInJlbW92ZVN0cmluZ0lvT3B0aW9uIiwicmVtb3ZlUmFuZ2UiLCJzY2hlbWEiXSwibWFwcGluZ3MiOiJBQUFBLGlEQUFpRDtBQUNqRDs7Ozs7Ozs7Q0FRQyxHQUdELGdGQUFnRjtBQUNoRixrQkFBa0I7QUFDbEIsZ0ZBQWdGO0FBQ2hGQSxPQUFPQyxPQUFPLEdBQUc7SUFDZkMsTUFBTTtRQUNKQyxTQUFTLE9BQU8sd0RBQXdEO0lBQzFFO0lBQ0FDLFFBQVEsU0FBVUMsT0FBTztRQUN2QixPQUFPO1lBQ0xDLGVBQWVDLElBQUk7Z0JBRWpCLGdEQUFnRDtnQkFDaEQsSUFBS0EsS0FBS0MsTUFBTSxDQUFDQyxJQUFJLEtBQUssZ0JBQWdCRixLQUFLQyxNQUFNLENBQUNFLElBQUksS0FBSyxtQkFBb0I7b0JBRWpGLE1BQU1DLFVBQVVKLEtBQUtLLFNBQVMsQ0FBRSxFQUFHO29CQUVuQyx3Q0FBd0M7b0JBQ3hDLElBQUtELFdBQVdBLFFBQVFGLElBQUksS0FBSyxvQkFBcUI7d0JBRXBELE1BQU1JLDBCQUEwQkYsUUFBUUcsVUFBVSxDQUFDQyxJQUFJLENBQUVDLENBQUFBOzRCQUN2RCxPQUFPQSxLQUFLQyxHQUFHLENBQUNSLElBQUksS0FBSyxnQkFBZ0JPLEtBQUtDLEdBQUcsQ0FBQ1AsSUFBSSxLQUFLO3dCQUM3RDt3QkFDQSxvREFBb0Q7d0JBQ3BELElBQUtHLDJCQUEyQkEsd0JBQXdCSyxLQUFLLENBQUNULElBQUksS0FBSyxnQkFDbEVJLHdCQUF3QkssS0FBSyxDQUFDUixJQUFJLEtBQUssWUFBYTs0QkFDdkRMLFFBQVFjLE1BQU0sQ0FBRTtnQ0FDZFosTUFBTUE7Z0NBQ05hLFNBQVM7Z0NBQ1RDLEtBQUtDLENBQUFBO29DQUVILHFEQUFxRDtvQ0FDckQsTUFBTUMsbUNBQW1DRCxNQUFNRSxnQkFBZ0IsQ0FBRWpCLEtBQUtDLE1BQU0sQ0FBQ2lCLEtBQUssRUFBRTtvQ0FFcEYscUNBQXFDO29DQUNyQyxNQUFNQywrQkFBK0I7d0NBQUViLHdCQUF3QlksS0FBSyxDQUFFLEVBQUcsR0FBRzt3Q0FBR1osd0JBQXdCWSxLQUFLLENBQUUsRUFBRyxHQUFHO3FDQUFHO29DQUN2SCxNQUFNRSx1QkFBdUJMLE1BQU1NLFdBQVcsQ0FBRUY7b0NBRWhELE9BQU87d0NBQUVIO3dDQUFrQ0k7cUNBQXNCO2dDQUNuRTs0QkFDRjt3QkFDRjtvQkFDRjtnQkFDRjtZQUNGO1FBQ0Y7SUFDRjtBQUNGO0FBRUEzQixPQUFPQyxPQUFPLENBQUM0QixNQUFNLEdBQUcsRUFFdkIifQ==