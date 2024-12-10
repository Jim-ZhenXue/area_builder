// Copyright 2016-2020, University of Colorado Boulder
/**
 * @fileoverview Rule to check that we aren't using native JavaScript constructors.
 * This typically occurs when we forget an import statment for a PhET module that has the same name
 * as a native DOM interface.
 *
 * Using native JavaScript constructors for types like Image, Text, and Range will almost always result in errors
 * that can be difficult to trace. A type can be defined in a file by loading a module or by
 * defining a constructor.
 *
 * This rule works by first traversing down the AST, searching for either variable or function declarations of
 * the types that share a name with a native JavaScript constructor. We then traverse back up the AST searching
 * for nodes that represent instantiation of these types.  An error is thrown when we encounter an instantiation
 * of a type that wasn't declared.
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 * @copyright 2016-2020 University of Colorado Boulder
 */ //------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------
module.exports = {
    create: function(context) {
        // names of the native JavaScript constructors that clash with PhET type names
        const nativeConstructors = [
            'Image',
            'Range',
            'Text',
            'Node',
            'Event'
        ];
        // list of all types that are declared in the file that have the same name as a native JavaScript constructor
        const declaredTypes = [];
        /**
     * Add a type to declared types if the 'declaration' node has a name which is equal to
     * one of the entries in nativeConstructors.  Called when eslint finds VariableDeclarator, FunctionDeclaration
     * or ImportDeclaration nodes as it traverses down the AST.
     *
     * @param {ASTNode} node
     */ function addDeclaredType(node) {
            // Example...
            //
            // JavaScript:
            //
            // function Range( min, max ) {...}
            //
            // Corresponding AST:
            //
            // FunctionDeclaration {
            //   type: "FunctionDeclaration",
            //   id: Identifier {
            //     type: "Identifier",
            //     name: "Range"
            //   }
            // }
            if (node.id && nativeConstructors.indexOf(node.id.name) !== -1) {
                declaredTypes.push(node.id.name);
            }
            // Example...
            //
            // JavaScript:
            //
            // import Range from '../../dot/js/Range.js'
            //
            // Corresponding AST:
            //
            // {
            //   "type": "ImportDeclaration",
            //   "specifiers": [
            //     {
            //       "type": "ImportDefaultSpecifier",
            //       "local": {
            //         "type": "Identifier",
            //         "name": "Range"
            //       },
            //     }
            //   ]
            // }
            if (node.specifiers) {
                node.specifiers.forEach((specifier)=>{
                    if (specifier.local && specifier.local.name) {
                        if (nativeConstructors.indexOf(specifier.local.name) !== -1) {
                            declaredTypes.push(specifier.local.name);
                        }
                    }
                });
            }
        }
        return {
            VariableDeclarator: addDeclaredType,
            FunctionDeclaration: addDeclaredType,
            ImportDeclaration: addDeclaredType,
            /**
       * When eslint traverses back up the AST, search for a node representing an instantiation of a type.  If found,
       * check to see if the type being instantiated is one of the entries that were added to declaredTypes on
       * the first traversal down the AST.
       *
       * @param  {ASTNode} node
       */ 'NewExpression:exit': function(node) {
                // Example...
                //
                // JavaScript:
                //
                // var imageNode = new Image( imgsrc );
                //
                // Corresponding AST:
                //
                // exemplar: {
                //   {
                //     "type": "NewExpression",
                //     "callee": {
                //       "type": "Identifier",
                //       "name": "Image"
                //     }
                //   }
                // }
                if (node.callee && node.callee.name && nativeConstructors.indexOf(node.callee.name) !== -1) {
                    const constructorName = node.callee.name;
                    const filename = context.getFilename();
                    const constructorUsedInOwnFile = filename.endsWith(`${constructorName}.ts`);
                    if (!constructorUsedInOwnFile && declaredTypes.indexOf(constructorName) === -1) {
                        context.report({
                            node: node,
                            loc: node.callee.loc,
                            message: `${constructorName}: using native constructor instead of project module, did you forget an import statement?`
                        });
                    }
                }
            }
        };
    }
};
module.exports.schema = [];

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3BlcmVubmlhbC1hbGlhcy9qcy9lc2xpbnQvcGhldC1ydWxlcy9uby1odG1sLWNvbnN0cnVjdG9ycy5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNi0yMDIwLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcbi8qKlxuICogQGZpbGVvdmVydmlldyBSdWxlIHRvIGNoZWNrIHRoYXQgd2UgYXJlbid0IHVzaW5nIG5hdGl2ZSBKYXZhU2NyaXB0IGNvbnN0cnVjdG9ycy5cbiAqIFRoaXMgdHlwaWNhbGx5IG9jY3VycyB3aGVuIHdlIGZvcmdldCBhbiBpbXBvcnQgc3RhdG1lbnQgZm9yIGEgUGhFVCBtb2R1bGUgdGhhdCBoYXMgdGhlIHNhbWUgbmFtZVxuICogYXMgYSBuYXRpdmUgRE9NIGludGVyZmFjZS5cbiAqXG4gKiBVc2luZyBuYXRpdmUgSmF2YVNjcmlwdCBjb25zdHJ1Y3RvcnMgZm9yIHR5cGVzIGxpa2UgSW1hZ2UsIFRleHQsIGFuZCBSYW5nZSB3aWxsIGFsbW9zdCBhbHdheXMgcmVzdWx0IGluIGVycm9yc1xuICogdGhhdCBjYW4gYmUgZGlmZmljdWx0IHRvIHRyYWNlLiBBIHR5cGUgY2FuIGJlIGRlZmluZWQgaW4gYSBmaWxlIGJ5IGxvYWRpbmcgYSBtb2R1bGUgb3IgYnlcbiAqIGRlZmluaW5nIGEgY29uc3RydWN0b3IuXG4gKlxuICogVGhpcyBydWxlIHdvcmtzIGJ5IGZpcnN0IHRyYXZlcnNpbmcgZG93biB0aGUgQVNULCBzZWFyY2hpbmcgZm9yIGVpdGhlciB2YXJpYWJsZSBvciBmdW5jdGlvbiBkZWNsYXJhdGlvbnMgb2ZcbiAqIHRoZSB0eXBlcyB0aGF0IHNoYXJlIGEgbmFtZSB3aXRoIGEgbmF0aXZlIEphdmFTY3JpcHQgY29uc3RydWN0b3IuIFdlIHRoZW4gdHJhdmVyc2UgYmFjayB1cCB0aGUgQVNUIHNlYXJjaGluZ1xuICogZm9yIG5vZGVzIHRoYXQgcmVwcmVzZW50IGluc3RhbnRpYXRpb24gb2YgdGhlc2UgdHlwZXMuICBBbiBlcnJvciBpcyB0aHJvd24gd2hlbiB3ZSBlbmNvdW50ZXIgYW4gaW5zdGFudGlhdGlvblxuICogb2YgYSB0eXBlIHRoYXQgd2Fzbid0IGRlY2xhcmVkLlxuICpcbiAqIEBhdXRob3IgSmVzc2UgR3JlZW5iZXJnIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxuICogQGNvcHlyaWdodCAyMDE2LTIwMjAgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG4gKi9cblxuXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gUnVsZSBEZWZpbml0aW9uXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgY3JlYXRlOiBmdW5jdGlvbiggY29udGV4dCApIHtcblxuICAgIC8vIG5hbWVzIG9mIHRoZSBuYXRpdmUgSmF2YVNjcmlwdCBjb25zdHJ1Y3RvcnMgdGhhdCBjbGFzaCB3aXRoIFBoRVQgdHlwZSBuYW1lc1xuICAgIGNvbnN0IG5hdGl2ZUNvbnN0cnVjdG9ycyA9IFsgJ0ltYWdlJywgJ1JhbmdlJywgJ1RleHQnLCAnTm9kZScsICdFdmVudCcgXTtcblxuICAgIC8vIGxpc3Qgb2YgYWxsIHR5cGVzIHRoYXQgYXJlIGRlY2xhcmVkIGluIHRoZSBmaWxlIHRoYXQgaGF2ZSB0aGUgc2FtZSBuYW1lIGFzIGEgbmF0aXZlIEphdmFTY3JpcHQgY29uc3RydWN0b3JcbiAgICBjb25zdCBkZWNsYXJlZFR5cGVzID0gW107XG5cbiAgICAvKipcbiAgICAgKiBBZGQgYSB0eXBlIHRvIGRlY2xhcmVkIHR5cGVzIGlmIHRoZSAnZGVjbGFyYXRpb24nIG5vZGUgaGFzIGEgbmFtZSB3aGljaCBpcyBlcXVhbCB0b1xuICAgICAqIG9uZSBvZiB0aGUgZW50cmllcyBpbiBuYXRpdmVDb25zdHJ1Y3RvcnMuICBDYWxsZWQgd2hlbiBlc2xpbnQgZmluZHMgVmFyaWFibGVEZWNsYXJhdG9yLCBGdW5jdGlvbkRlY2xhcmF0aW9uXG4gICAgICogb3IgSW1wb3J0RGVjbGFyYXRpb24gbm9kZXMgYXMgaXQgdHJhdmVyc2VzIGRvd24gdGhlIEFTVC5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7QVNUTm9kZX0gbm9kZVxuICAgICAqL1xuICAgIGZ1bmN0aW9uIGFkZERlY2xhcmVkVHlwZSggbm9kZSApIHtcblxuICAgICAgLy8gRXhhbXBsZS4uLlxuICAgICAgLy9cbiAgICAgIC8vIEphdmFTY3JpcHQ6XG4gICAgICAvL1xuICAgICAgLy8gZnVuY3Rpb24gUmFuZ2UoIG1pbiwgbWF4ICkgey4uLn1cbiAgICAgIC8vXG4gICAgICAvLyBDb3JyZXNwb25kaW5nIEFTVDpcbiAgICAgIC8vXG4gICAgICAvLyBGdW5jdGlvbkRlY2xhcmF0aW9uIHtcbiAgICAgIC8vICAgdHlwZTogXCJGdW5jdGlvbkRlY2xhcmF0aW9uXCIsXG4gICAgICAvLyAgIGlkOiBJZGVudGlmaWVyIHtcbiAgICAgIC8vICAgICB0eXBlOiBcIklkZW50aWZpZXJcIixcbiAgICAgIC8vICAgICBuYW1lOiBcIlJhbmdlXCJcbiAgICAgIC8vICAgfVxuICAgICAgLy8gfVxuXG4gICAgICBpZiAoIG5vZGUuaWQgJiYgbmF0aXZlQ29uc3RydWN0b3JzLmluZGV4T2YoIG5vZGUuaWQubmFtZSApICE9PSAtMSApIHtcbiAgICAgICAgZGVjbGFyZWRUeXBlcy5wdXNoKCBub2RlLmlkLm5hbWUgKTtcbiAgICAgIH1cblxuICAgICAgLy8gRXhhbXBsZS4uLlxuICAgICAgLy9cbiAgICAgIC8vIEphdmFTY3JpcHQ6XG4gICAgICAvL1xuICAgICAgLy8gaW1wb3J0IFJhbmdlIGZyb20gJy4uLy4uL2RvdC9qcy9SYW5nZS5qcydcbiAgICAgIC8vXG4gICAgICAvLyBDb3JyZXNwb25kaW5nIEFTVDpcbiAgICAgIC8vXG4gICAgICAvLyB7XG4gICAgICAvLyAgIFwidHlwZVwiOiBcIkltcG9ydERlY2xhcmF0aW9uXCIsXG4gICAgICAvLyAgIFwic3BlY2lmaWVyc1wiOiBbXG4gICAgICAvLyAgICAge1xuICAgICAgLy8gICAgICAgXCJ0eXBlXCI6IFwiSW1wb3J0RGVmYXVsdFNwZWNpZmllclwiLFxuICAgICAgLy8gICAgICAgXCJsb2NhbFwiOiB7XG4gICAgICAvLyAgICAgICAgIFwidHlwZVwiOiBcIklkZW50aWZpZXJcIixcbiAgICAgIC8vICAgICAgICAgXCJuYW1lXCI6IFwiUmFuZ2VcIlxuICAgICAgLy8gICAgICAgfSxcbiAgICAgIC8vICAgICB9XG4gICAgICAvLyAgIF1cbiAgICAgIC8vIH1cbiAgICAgIGlmICggbm9kZS5zcGVjaWZpZXJzICkge1xuICAgICAgICBub2RlLnNwZWNpZmllcnMuZm9yRWFjaCggc3BlY2lmaWVyID0+IHtcbiAgICAgICAgICBpZiAoIHNwZWNpZmllci5sb2NhbCAmJiBzcGVjaWZpZXIubG9jYWwubmFtZSApIHtcbiAgICAgICAgICAgIGlmICggbmF0aXZlQ29uc3RydWN0b3JzLmluZGV4T2YoIHNwZWNpZmllci5sb2NhbC5uYW1lICkgIT09IC0xICkge1xuICAgICAgICAgICAgICBkZWNsYXJlZFR5cGVzLnB1c2goIHNwZWNpZmllci5sb2NhbC5uYW1lICk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9ICk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHtcbiAgICAgIFZhcmlhYmxlRGVjbGFyYXRvcjogYWRkRGVjbGFyZWRUeXBlLFxuICAgICAgRnVuY3Rpb25EZWNsYXJhdGlvbjogYWRkRGVjbGFyZWRUeXBlLFxuICAgICAgSW1wb3J0RGVjbGFyYXRpb246IGFkZERlY2xhcmVkVHlwZSxcblxuICAgICAgLyoqXG4gICAgICAgKiBXaGVuIGVzbGludCB0cmF2ZXJzZXMgYmFjayB1cCB0aGUgQVNULCBzZWFyY2ggZm9yIGEgbm9kZSByZXByZXNlbnRpbmcgYW4gaW5zdGFudGlhdGlvbiBvZiBhIHR5cGUuICBJZiBmb3VuZCxcbiAgICAgICAqIGNoZWNrIHRvIHNlZSBpZiB0aGUgdHlwZSBiZWluZyBpbnN0YW50aWF0ZWQgaXMgb25lIG9mIHRoZSBlbnRyaWVzIHRoYXQgd2VyZSBhZGRlZCB0byBkZWNsYXJlZFR5cGVzIG9uXG4gICAgICAgKiB0aGUgZmlyc3QgdHJhdmVyc2FsIGRvd24gdGhlIEFTVC5cbiAgICAgICAqXG4gICAgICAgKiBAcGFyYW0gIHtBU1ROb2RlfSBub2RlXG4gICAgICAgKi9cbiAgICAgICdOZXdFeHByZXNzaW9uOmV4aXQnOiBmdW5jdGlvbiggbm9kZSApIHtcblxuICAgICAgICAvLyBFeGFtcGxlLi4uXG4gICAgICAgIC8vXG4gICAgICAgIC8vIEphdmFTY3JpcHQ6XG4gICAgICAgIC8vXG4gICAgICAgIC8vIHZhciBpbWFnZU5vZGUgPSBuZXcgSW1hZ2UoIGltZ3NyYyApO1xuICAgICAgICAvL1xuICAgICAgICAvLyBDb3JyZXNwb25kaW5nIEFTVDpcbiAgICAgICAgLy9cbiAgICAgICAgLy8gZXhlbXBsYXI6IHtcbiAgICAgICAgLy8gICB7XG4gICAgICAgIC8vICAgICBcInR5cGVcIjogXCJOZXdFeHByZXNzaW9uXCIsXG4gICAgICAgIC8vICAgICBcImNhbGxlZVwiOiB7XG4gICAgICAgIC8vICAgICAgIFwidHlwZVwiOiBcIklkZW50aWZpZXJcIixcbiAgICAgICAgLy8gICAgICAgXCJuYW1lXCI6IFwiSW1hZ2VcIlxuICAgICAgICAvLyAgICAgfVxuICAgICAgICAvLyAgIH1cbiAgICAgICAgLy8gfVxuXG4gICAgICAgIGlmICggbm9kZS5jYWxsZWUgJiYgbm9kZS5jYWxsZWUubmFtZSAmJiBuYXRpdmVDb25zdHJ1Y3RvcnMuaW5kZXhPZiggbm9kZS5jYWxsZWUubmFtZSApICE9PSAtMSApIHtcbiAgICAgICAgICBjb25zdCBjb25zdHJ1Y3Rvck5hbWUgPSBub2RlLmNhbGxlZS5uYW1lO1xuICAgICAgICAgIGNvbnN0IGZpbGVuYW1lID0gY29udGV4dC5nZXRGaWxlbmFtZSgpO1xuICAgICAgICAgIGNvbnN0IGNvbnN0cnVjdG9yVXNlZEluT3duRmlsZSA9IGZpbGVuYW1lLmVuZHNXaXRoKCBgJHtjb25zdHJ1Y3Rvck5hbWV9LnRzYCApO1xuICAgICAgICAgIGlmICggIWNvbnN0cnVjdG9yVXNlZEluT3duRmlsZSAmJiBkZWNsYXJlZFR5cGVzLmluZGV4T2YoIGNvbnN0cnVjdG9yTmFtZSApID09PSAtMSApIHtcbiAgICAgICAgICAgIGNvbnRleHQucmVwb3J0KCB7XG4gICAgICAgICAgICAgIG5vZGU6IG5vZGUsXG4gICAgICAgICAgICAgIGxvYzogbm9kZS5jYWxsZWUubG9jLFxuICAgICAgICAgICAgICBtZXNzYWdlOiBgJHtjb25zdHJ1Y3Rvck5hbWV9OiB1c2luZyBuYXRpdmUgY29uc3RydWN0b3IgaW5zdGVhZCBvZiBwcm9qZWN0IG1vZHVsZSwgZGlkIHlvdSBmb3JnZXQgYW4gaW1wb3J0IHN0YXRlbWVudD9gXG4gICAgICAgICAgICB9ICk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfTtcbiAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMuc2NoZW1hID0gW1xuICAvLyBKU09OIFNjaGVtYSBmb3IgcnVsZSBvcHRpb25zIGdvZXMgaGVyZVxuXTsiXSwibmFtZXMiOlsibW9kdWxlIiwiZXhwb3J0cyIsImNyZWF0ZSIsImNvbnRleHQiLCJuYXRpdmVDb25zdHJ1Y3RvcnMiLCJkZWNsYXJlZFR5cGVzIiwiYWRkRGVjbGFyZWRUeXBlIiwibm9kZSIsImlkIiwiaW5kZXhPZiIsIm5hbWUiLCJwdXNoIiwic3BlY2lmaWVycyIsImZvckVhY2giLCJzcGVjaWZpZXIiLCJsb2NhbCIsIlZhcmlhYmxlRGVjbGFyYXRvciIsIkZ1bmN0aW9uRGVjbGFyYXRpb24iLCJJbXBvcnREZWNsYXJhdGlvbiIsImNhbGxlZSIsImNvbnN0cnVjdG9yTmFtZSIsImZpbGVuYW1lIiwiZ2V0RmlsZW5hbWUiLCJjb25zdHJ1Y3RvclVzZWRJbk93bkZpbGUiLCJlbmRzV2l0aCIsInJlcG9ydCIsImxvYyIsIm1lc3NhZ2UiLCJzY2hlbWEiXSwibWFwcGluZ3MiOiJBQUFBLHNEQUFzRDtBQUN0RDs7Ozs7Ozs7Ozs7Ozs7OztDQWdCQyxHQUdELGdGQUFnRjtBQUNoRixrQkFBa0I7QUFDbEIsZ0ZBQWdGO0FBRWhGQSxPQUFPQyxPQUFPLEdBQUc7SUFDZkMsUUFBUSxTQUFVQyxPQUFPO1FBRXZCLDhFQUE4RTtRQUM5RSxNQUFNQyxxQkFBcUI7WUFBRTtZQUFTO1lBQVM7WUFBUTtZQUFRO1NBQVM7UUFFeEUsNkdBQTZHO1FBQzdHLE1BQU1DLGdCQUFnQixFQUFFO1FBRXhCOzs7Ozs7S0FNQyxHQUNELFNBQVNDLGdCQUFpQkMsSUFBSTtZQUU1QixhQUFhO1lBQ2IsRUFBRTtZQUNGLGNBQWM7WUFDZCxFQUFFO1lBQ0YsbUNBQW1DO1lBQ25DLEVBQUU7WUFDRixxQkFBcUI7WUFDckIsRUFBRTtZQUNGLHdCQUF3QjtZQUN4QixpQ0FBaUM7WUFDakMscUJBQXFCO1lBQ3JCLDBCQUEwQjtZQUMxQixvQkFBb0I7WUFDcEIsTUFBTTtZQUNOLElBQUk7WUFFSixJQUFLQSxLQUFLQyxFQUFFLElBQUlKLG1CQUFtQkssT0FBTyxDQUFFRixLQUFLQyxFQUFFLENBQUNFLElBQUksTUFBTyxDQUFDLEdBQUk7Z0JBQ2xFTCxjQUFjTSxJQUFJLENBQUVKLEtBQUtDLEVBQUUsQ0FBQ0UsSUFBSTtZQUNsQztZQUVBLGFBQWE7WUFDYixFQUFFO1lBQ0YsY0FBYztZQUNkLEVBQUU7WUFDRiw0Q0FBNEM7WUFDNUMsRUFBRTtZQUNGLHFCQUFxQjtZQUNyQixFQUFFO1lBQ0YsSUFBSTtZQUNKLGlDQUFpQztZQUNqQyxvQkFBb0I7WUFDcEIsUUFBUTtZQUNSLDBDQUEwQztZQUMxQyxtQkFBbUI7WUFDbkIsZ0NBQWdDO1lBQ2hDLDBCQUEwQjtZQUMxQixXQUFXO1lBQ1gsUUFBUTtZQUNSLE1BQU07WUFDTixJQUFJO1lBQ0osSUFBS0gsS0FBS0ssVUFBVSxFQUFHO2dCQUNyQkwsS0FBS0ssVUFBVSxDQUFDQyxPQUFPLENBQUVDLENBQUFBO29CQUN2QixJQUFLQSxVQUFVQyxLQUFLLElBQUlELFVBQVVDLEtBQUssQ0FBQ0wsSUFBSSxFQUFHO3dCQUM3QyxJQUFLTixtQkFBbUJLLE9BQU8sQ0FBRUssVUFBVUMsS0FBSyxDQUFDTCxJQUFJLE1BQU8sQ0FBQyxHQUFJOzRCQUMvREwsY0FBY00sSUFBSSxDQUFFRyxVQUFVQyxLQUFLLENBQUNMLElBQUk7d0JBQzFDO29CQUNGO2dCQUNGO1lBQ0Y7UUFDRjtRQUVBLE9BQU87WUFDTE0sb0JBQW9CVjtZQUNwQlcscUJBQXFCWDtZQUNyQlksbUJBQW1CWjtZQUVuQjs7Ozs7O09BTUMsR0FDRCxzQkFBc0IsU0FBVUMsSUFBSTtnQkFFbEMsYUFBYTtnQkFDYixFQUFFO2dCQUNGLGNBQWM7Z0JBQ2QsRUFBRTtnQkFDRix1Q0FBdUM7Z0JBQ3ZDLEVBQUU7Z0JBQ0YscUJBQXFCO2dCQUNyQixFQUFFO2dCQUNGLGNBQWM7Z0JBQ2QsTUFBTTtnQkFDTiwrQkFBK0I7Z0JBQy9CLGtCQUFrQjtnQkFDbEIsOEJBQThCO2dCQUM5Qix3QkFBd0I7Z0JBQ3hCLFFBQVE7Z0JBQ1IsTUFBTTtnQkFDTixJQUFJO2dCQUVKLElBQUtBLEtBQUtZLE1BQU0sSUFBSVosS0FBS1ksTUFBTSxDQUFDVCxJQUFJLElBQUlOLG1CQUFtQkssT0FBTyxDQUFFRixLQUFLWSxNQUFNLENBQUNULElBQUksTUFBTyxDQUFDLEdBQUk7b0JBQzlGLE1BQU1VLGtCQUFrQmIsS0FBS1ksTUFBTSxDQUFDVCxJQUFJO29CQUN4QyxNQUFNVyxXQUFXbEIsUUFBUW1CLFdBQVc7b0JBQ3BDLE1BQU1DLDJCQUEyQkYsU0FBU0csUUFBUSxDQUFFLEdBQUdKLGdCQUFnQixHQUFHLENBQUM7b0JBQzNFLElBQUssQ0FBQ0csNEJBQTRCbEIsY0FBY0ksT0FBTyxDQUFFVyxxQkFBc0IsQ0FBQyxHQUFJO3dCQUNsRmpCLFFBQVFzQixNQUFNLENBQUU7NEJBQ2RsQixNQUFNQTs0QkFDTm1CLEtBQUtuQixLQUFLWSxNQUFNLENBQUNPLEdBQUc7NEJBQ3BCQyxTQUFTLEdBQUdQLGdCQUFnQix5RkFBeUYsQ0FBQzt3QkFDeEg7b0JBQ0Y7Z0JBQ0Y7WUFDRjtRQUNGO0lBQ0Y7QUFDRjtBQUVBcEIsT0FBT0MsT0FBTyxDQUFDMkIsTUFBTSxHQUFHLEVBRXZCIn0=