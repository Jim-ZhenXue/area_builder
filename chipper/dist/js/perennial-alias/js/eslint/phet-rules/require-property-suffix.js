// Copyright 2022, University of Colorado Boulder
/**
 * @fileoverview Lint rule to ensure that variable names of type AXON Property end in "Property"
 *
 * We used https://typescript-eslint.io/play/#showAST=es to determine which AST nodes to look for.
 *
 * This is the best documentation I could find for working with the type checker (like using getTypeAtLocation):
 * https://raw.githubusercontent.com/microsoft/TypeScript/main/src/compiler/checker.ts
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Jesse Greenberg (PhET Interactive Simulations)
 * @author Michael Kauzmann (PhET Interactive Simulations)
 * @copyright 2022 University of Colorado Boulder
 */ const { ESLintUtils } = require('@typescript-eslint/utils');
const visit = (context, propertyNode)=>{
    // Get the name of the type from the type checker
    const parserServices = ESLintUtils.getParserServices(context);
    const checker = parserServices.program.getTypeChecker();
    const tsNode = parserServices.esTreeNodeToTSNodeMap.get(propertyNode);
    const variableType = checker.getTypeAtLocation(tsNode);
    // For optional fields, ' | undefined' will be appended to the type name. Those still need
    // a 'Property' suffix, but remove this part of the type string for the checks that follow.
    const typeString = checker.typeToString(variableType).replace(' | undefined', '');
    // Matches things like "BooleanProperty" and "Property<boolean|null>"
    // If in the future this is not correct or complete, please note that complexity of the following
    // cases (and good luck!):
    //   * BooleanProperty[]
    //   * Property<boolean|null>[]
    //   * Map<string,BooleanProperty>
    //   * ( value: number) => BooleanProperty
    const isPropertyType = /^\w*Property(<.*>){0,1}$/.test(typeString);
    // Check that the type includes a property.
    if (isPropertyType) {
        var _propertyNode_name, _propertyNode_name1;
        // Not all types will have a node name, so nest this inside the Property type check.
        const isPropertyNamed = ((_propertyNode_name = propertyNode.name) == null ? void 0 : _propertyNode_name.endsWith('Property')) || ((_propertyNode_name1 = propertyNode.name) == null ? void 0 : _propertyNode_name1.endsWith('PROPERTY')) || propertyNode.name === 'property' || propertyNode.name === '_property';
        if (!isPropertyNamed) {
            context.report({
                message: 'Property variable missing Property suffix.',
                node: propertyNode
            });
        }
    }
};
module.exports = {
    create: (context)=>{
        return {
            // Local variables that are instances of a Property
            'VariableDeclarator > Identifier': (node)=>{
                if (node) {
                    visit(context, node);
                }
            },
            /**
       * AST Node for a class property (NOT an axon Property).
       */ PropertyDefinition: (node)=>{
                // node.key is the AST node for the variable (child of the PropertyDefinition)
                if (node.key) {
                    visit(context, node.key);
                }
            },
            /**
       * Members of a TypeScript type alias.
       */ TSTypeAliasDeclaration: (node)=>{
                if (node.typeAnnotation && node.typeAnnotation.members) {
                    node.typeAnnotation.members.forEach((member)=>{
                        if (member.key) {
                            visit(context, member.key);
                        }
                    });
                }
            }
        };
    }
};

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3BlcmVubmlhbC1hbGlhcy9qcy9lc2xpbnQvcGhldC1ydWxlcy9yZXF1aXJlLXByb3BlcnR5LXN1ZmZpeC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAyMiwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG4vKipcbiAqIEBmaWxlb3ZlcnZpZXcgTGludCBydWxlIHRvIGVuc3VyZSB0aGF0IHZhcmlhYmxlIG5hbWVzIG9mIHR5cGUgQVhPTiBQcm9wZXJ0eSBlbmQgaW4gXCJQcm9wZXJ0eVwiXG4gKlxuICogV2UgdXNlZCBodHRwczovL3R5cGVzY3JpcHQtZXNsaW50LmlvL3BsYXkvI3Nob3dBU1Q9ZXMgdG8gZGV0ZXJtaW5lIHdoaWNoIEFTVCBub2RlcyB0byBsb29rIGZvci5cbiAqXG4gKiBUaGlzIGlzIHRoZSBiZXN0IGRvY3VtZW50YXRpb24gSSBjb3VsZCBmaW5kIGZvciB3b3JraW5nIHdpdGggdGhlIHR5cGUgY2hlY2tlciAobGlrZSB1c2luZyBnZXRUeXBlQXRMb2NhdGlvbik6XG4gKiBodHRwczovL3Jhdy5naXRodWJ1c2VyY29udGVudC5jb20vbWljcm9zb2Z0L1R5cGVTY3JpcHQvbWFpbi9zcmMvY29tcGlsZXIvY2hlY2tlci50c1xuICpcbiAqIEBhdXRob3IgU2FtIFJlaWQgKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXG4gKiBAYXV0aG9yIEplc3NlIEdyZWVuYmVyZyAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcbiAqIEBhdXRob3IgTWljaGFlbCBLYXV6bWFubiAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcbiAqIEBjb3B5cmlnaHQgMjAyMiBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcbiAqL1xuXG5jb25zdCB7IEVTTGludFV0aWxzIH0gPSByZXF1aXJlKCAnQHR5cGVzY3JpcHQtZXNsaW50L3V0aWxzJyApO1xuXG5jb25zdCB2aXNpdCA9ICggY29udGV4dCwgcHJvcGVydHlOb2RlICkgPT4ge1xuXG4gIC8vIEdldCB0aGUgbmFtZSBvZiB0aGUgdHlwZSBmcm9tIHRoZSB0eXBlIGNoZWNrZXJcbiAgY29uc3QgcGFyc2VyU2VydmljZXMgPSBFU0xpbnRVdGlscy5nZXRQYXJzZXJTZXJ2aWNlcyggY29udGV4dCApO1xuICBjb25zdCBjaGVja2VyID0gcGFyc2VyU2VydmljZXMucHJvZ3JhbS5nZXRUeXBlQ2hlY2tlcigpO1xuICBjb25zdCB0c05vZGUgPSBwYXJzZXJTZXJ2aWNlcy5lc1RyZWVOb2RlVG9UU05vZGVNYXAuZ2V0KCBwcm9wZXJ0eU5vZGUgKTtcbiAgY29uc3QgdmFyaWFibGVUeXBlID0gY2hlY2tlci5nZXRUeXBlQXRMb2NhdGlvbiggdHNOb2RlICk7XG5cbiAgLy8gRm9yIG9wdGlvbmFsIGZpZWxkcywgJyB8IHVuZGVmaW5lZCcgd2lsbCBiZSBhcHBlbmRlZCB0byB0aGUgdHlwZSBuYW1lLiBUaG9zZSBzdGlsbCBuZWVkXG4gIC8vIGEgJ1Byb3BlcnR5JyBzdWZmaXgsIGJ1dCByZW1vdmUgdGhpcyBwYXJ0IG9mIHRoZSB0eXBlIHN0cmluZyBmb3IgdGhlIGNoZWNrcyB0aGF0IGZvbGxvdy5cbiAgY29uc3QgdHlwZVN0cmluZyA9IGNoZWNrZXIudHlwZVRvU3RyaW5nKCB2YXJpYWJsZVR5cGUgKS5yZXBsYWNlKCAnIHwgdW5kZWZpbmVkJywgJycgKTtcblxuICAvLyBNYXRjaGVzIHRoaW5ncyBsaWtlIFwiQm9vbGVhblByb3BlcnR5XCIgYW5kIFwiUHJvcGVydHk8Ym9vbGVhbnxudWxsPlwiXG4gIC8vIElmIGluIHRoZSBmdXR1cmUgdGhpcyBpcyBub3QgY29ycmVjdCBvciBjb21wbGV0ZSwgcGxlYXNlIG5vdGUgdGhhdCBjb21wbGV4aXR5IG9mIHRoZSBmb2xsb3dpbmdcbiAgLy8gY2FzZXMgKGFuZCBnb29kIGx1Y2shKTpcbiAgLy8gICAqIEJvb2xlYW5Qcm9wZXJ0eVtdXG4gIC8vICAgKiBQcm9wZXJ0eTxib29sZWFufG51bGw+W11cbiAgLy8gICAqIE1hcDxzdHJpbmcsQm9vbGVhblByb3BlcnR5PlxuICAvLyAgICogKCB2YWx1ZTogbnVtYmVyKSA9PiBCb29sZWFuUHJvcGVydHlcbiAgY29uc3QgaXNQcm9wZXJ0eVR5cGUgPSAvXlxcdypQcm9wZXJ0eSg8Lio+KXswLDF9JC8udGVzdCggdHlwZVN0cmluZyApO1xuXG4gIC8vIENoZWNrIHRoYXQgdGhlIHR5cGUgaW5jbHVkZXMgYSBwcm9wZXJ0eS5cbiAgaWYgKCBpc1Byb3BlcnR5VHlwZSApIHtcblxuICAgIC8vIE5vdCBhbGwgdHlwZXMgd2lsbCBoYXZlIGEgbm9kZSBuYW1lLCBzbyBuZXN0IHRoaXMgaW5zaWRlIHRoZSBQcm9wZXJ0eSB0eXBlIGNoZWNrLlxuICAgIGNvbnN0IGlzUHJvcGVydHlOYW1lZCA9IHByb3BlcnR5Tm9kZS5uYW1lPy5lbmRzV2l0aCggJ1Byb3BlcnR5JyApIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJvcGVydHlOb2RlLm5hbWU/LmVuZHNXaXRoKCAnUFJPUEVSVFknICkgfHxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcm9wZXJ0eU5vZGUubmFtZSA9PT0gJ3Byb3BlcnR5JyB8fFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByb3BlcnR5Tm9kZS5uYW1lID09PSAnX3Byb3BlcnR5JztcblxuICAgIGlmICggIWlzUHJvcGVydHlOYW1lZCApIHtcbiAgICAgIGNvbnRleHQucmVwb3J0KCB7XG4gICAgICAgIG1lc3NhZ2U6ICdQcm9wZXJ0eSB2YXJpYWJsZSBtaXNzaW5nIFByb3BlcnR5IHN1ZmZpeC4nLFxuICAgICAgICBub2RlOiBwcm9wZXJ0eU5vZGVcbiAgICAgIH0gKTtcbiAgICB9XG4gIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBjcmVhdGU6IGNvbnRleHQgPT4ge1xuICAgIHJldHVybiB7XG5cbiAgICAgIC8vIExvY2FsIHZhcmlhYmxlcyB0aGF0IGFyZSBpbnN0YW5jZXMgb2YgYSBQcm9wZXJ0eVxuICAgICAgJ1ZhcmlhYmxlRGVjbGFyYXRvciA+IElkZW50aWZpZXInOiBub2RlID0+IHtcbiAgICAgICAgaWYgKCBub2RlICkge1xuICAgICAgICAgIHZpc2l0KCBjb250ZXh0LCBub2RlICk7XG4gICAgICAgIH1cbiAgICAgIH0sXG5cbiAgICAgIC8qKlxuICAgICAgICogQVNUIE5vZGUgZm9yIGEgY2xhc3MgcHJvcGVydHkgKE5PVCBhbiBheG9uIFByb3BlcnR5KS5cbiAgICAgICAqL1xuICAgICAgUHJvcGVydHlEZWZpbml0aW9uOiBub2RlID0+IHtcblxuICAgICAgICAvLyBub2RlLmtleSBpcyB0aGUgQVNUIG5vZGUgZm9yIHRoZSB2YXJpYWJsZSAoY2hpbGQgb2YgdGhlIFByb3BlcnR5RGVmaW5pdGlvbilcbiAgICAgICAgaWYgKCBub2RlLmtleSApIHtcbiAgICAgICAgICB2aXNpdCggY29udGV4dCwgbm9kZS5rZXkgKTtcbiAgICAgICAgfVxuICAgICAgfSxcblxuICAgICAgLyoqXG4gICAgICAgKiBNZW1iZXJzIG9mIGEgVHlwZVNjcmlwdCB0eXBlIGFsaWFzLlxuICAgICAgICovXG4gICAgICBUU1R5cGVBbGlhc0RlY2xhcmF0aW9uOiBub2RlID0+IHtcbiAgICAgICAgaWYgKCBub2RlLnR5cGVBbm5vdGF0aW9uICYmIG5vZGUudHlwZUFubm90YXRpb24ubWVtYmVycyApIHtcbiAgICAgICAgICBub2RlLnR5cGVBbm5vdGF0aW9uLm1lbWJlcnMuZm9yRWFjaCggbWVtYmVyID0+IHtcbiAgICAgICAgICAgIGlmICggbWVtYmVyLmtleSApIHtcbiAgICAgICAgICAgICAgdmlzaXQoIGNvbnRleHQsIG1lbWJlci5rZXkgKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9ICk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9O1xuICB9XG59OyJdLCJuYW1lcyI6WyJFU0xpbnRVdGlscyIsInJlcXVpcmUiLCJ2aXNpdCIsImNvbnRleHQiLCJwcm9wZXJ0eU5vZGUiLCJwYXJzZXJTZXJ2aWNlcyIsImdldFBhcnNlclNlcnZpY2VzIiwiY2hlY2tlciIsInByb2dyYW0iLCJnZXRUeXBlQ2hlY2tlciIsInRzTm9kZSIsImVzVHJlZU5vZGVUb1RTTm9kZU1hcCIsImdldCIsInZhcmlhYmxlVHlwZSIsImdldFR5cGVBdExvY2F0aW9uIiwidHlwZVN0cmluZyIsInR5cGVUb1N0cmluZyIsInJlcGxhY2UiLCJpc1Byb3BlcnR5VHlwZSIsInRlc3QiLCJpc1Byb3BlcnR5TmFtZWQiLCJuYW1lIiwiZW5kc1dpdGgiLCJyZXBvcnQiLCJtZXNzYWdlIiwibm9kZSIsIm1vZHVsZSIsImV4cG9ydHMiLCJjcmVhdGUiLCJQcm9wZXJ0eURlZmluaXRpb24iLCJrZXkiLCJUU1R5cGVBbGlhc0RlY2xhcmF0aW9uIiwidHlwZUFubm90YXRpb24iLCJtZW1iZXJzIiwiZm9yRWFjaCIsIm1lbWJlciJdLCJtYXBwaW5ncyI6IkFBQUEsaURBQWlEO0FBQ2pEOzs7Ozs7Ozs7Ozs7Q0FZQyxHQUVELE1BQU0sRUFBRUEsV0FBVyxFQUFFLEdBQUdDLFFBQVM7QUFFakMsTUFBTUMsUUFBUSxDQUFFQyxTQUFTQztJQUV2QixpREFBaUQ7SUFDakQsTUFBTUMsaUJBQWlCTCxZQUFZTSxpQkFBaUIsQ0FBRUg7SUFDdEQsTUFBTUksVUFBVUYsZUFBZUcsT0FBTyxDQUFDQyxjQUFjO0lBQ3JELE1BQU1DLFNBQVNMLGVBQWVNLHFCQUFxQixDQUFDQyxHQUFHLENBQUVSO0lBQ3pELE1BQU1TLGVBQWVOLFFBQVFPLGlCQUFpQixDQUFFSjtJQUVoRCwwRkFBMEY7SUFDMUYsMkZBQTJGO0lBQzNGLE1BQU1LLGFBQWFSLFFBQVFTLFlBQVksQ0FBRUgsY0FBZUksT0FBTyxDQUFFLGdCQUFnQjtJQUVqRixxRUFBcUU7SUFDckUsaUdBQWlHO0lBQ2pHLDBCQUEwQjtJQUMxQix3QkFBd0I7SUFDeEIsK0JBQStCO0lBQy9CLGtDQUFrQztJQUNsQywwQ0FBMEM7SUFDMUMsTUFBTUMsaUJBQWlCLDJCQUEyQkMsSUFBSSxDQUFFSjtJQUV4RCwyQ0FBMkM7SUFDM0MsSUFBS0csZ0JBQWlCO1lBR0lkLG9CQUNBQTtRQUZ4QixvRkFBb0Y7UUFDcEYsTUFBTWdCLGtCQUFrQmhCLEVBQUFBLHFCQUFBQSxhQUFhaUIsSUFBSSxxQkFBakJqQixtQkFBbUJrQixRQUFRLENBQUUsa0JBQzdCbEIsc0JBQUFBLGFBQWFpQixJQUFJLHFCQUFqQmpCLG9CQUFtQmtCLFFBQVEsQ0FBRSxnQkFDN0JsQixhQUFhaUIsSUFBSSxLQUFLLGNBQ3RCakIsYUFBYWlCLElBQUksS0FBSztRQUU5QyxJQUFLLENBQUNELGlCQUFrQjtZQUN0QmpCLFFBQVFvQixNQUFNLENBQUU7Z0JBQ2RDLFNBQVM7Z0JBQ1RDLE1BQU1yQjtZQUNSO1FBQ0Y7SUFDRjtBQUNGO0FBRUFzQixPQUFPQyxPQUFPLEdBQUc7SUFDZkMsUUFBUXpCLENBQUFBO1FBQ04sT0FBTztZQUVMLG1EQUFtRDtZQUNuRCxtQ0FBbUNzQixDQUFBQTtnQkFDakMsSUFBS0EsTUFBTztvQkFDVnZCLE1BQU9DLFNBQVNzQjtnQkFDbEI7WUFDRjtZQUVBOztPQUVDLEdBQ0RJLG9CQUFvQkosQ0FBQUE7Z0JBRWxCLDhFQUE4RTtnQkFDOUUsSUFBS0EsS0FBS0ssR0FBRyxFQUFHO29CQUNkNUIsTUFBT0MsU0FBU3NCLEtBQUtLLEdBQUc7Z0JBQzFCO1lBQ0Y7WUFFQTs7T0FFQyxHQUNEQyx3QkFBd0JOLENBQUFBO2dCQUN0QixJQUFLQSxLQUFLTyxjQUFjLElBQUlQLEtBQUtPLGNBQWMsQ0FBQ0MsT0FBTyxFQUFHO29CQUN4RFIsS0FBS08sY0FBYyxDQUFDQyxPQUFPLENBQUNDLE9BQU8sQ0FBRUMsQ0FBQUE7d0JBQ25DLElBQUtBLE9BQU9MLEdBQUcsRUFBRzs0QkFDaEI1QixNQUFPQyxTQUFTZ0MsT0FBT0wsR0FBRzt3QkFDNUI7b0JBQ0Y7Z0JBQ0Y7WUFDRjtRQUNGO0lBQ0Y7QUFDRiJ9