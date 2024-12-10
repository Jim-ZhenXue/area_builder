// Copyright 2022, University of Colorado Boulder
/**
 * @fileoverview If your default export for a file is a class, then it must have a register call to the repo namespace
 * for PhET code.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Michael Kauzmann (PhET Interactive Simulations)
 * @copyright 2022 University of Colorado Boulder
 */ const _ = require('lodash');
//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------
// Repos without a namespace that don't require these register calls.
const optOutRepos = [
    'aqua',
    'phet-io-wrappers',
    'quake',
    'studio'
];
module.exports = {
    create: function(context) {
        const filename = context.getFilename();
        // Javascript string escape the regex escape backslash too (4 backslashes!!)
        if (_.some(optOutRepos, (repo)=>new RegExp(`[\\\\/]${repo}[\\\\/]`).test(filename))) {
            return {}; // No-op rule
        }
        const classNames = [];
        return {
            ClassDeclaration: (node)=>{
                classNames.push(node.id.name);
            },
            ExportDefaultDeclaration: (node)=>{
                // Has a class default export
                if (node.declaration.type === 'ClassDeclaration' || node.declaration && node.declaration.name && classNames.includes(node.declaration.name)) {
                    // No register call
                    if (!context.getSourceCode().text.includes('.register( \'')) {
                        context.report({
                            node: node,
                            loc: node.loc,
                            message: 'File default exports a class but has no namespace registration'
                        });
                    }
                }
            }
        };
    }
};
module.exports.schema = [];

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3BlcmVubmlhbC1hbGlhcy9qcy9lc2xpbnQvcGhldC1ydWxlcy9kZWZhdWx0LWV4cG9ydC1jbGFzcy1zaG91bGQtcmVnaXN0ZXItbmFtZXNwYWNlLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcbi8qKlxuICogQGZpbGVvdmVydmlldyBJZiB5b3VyIGRlZmF1bHQgZXhwb3J0IGZvciBhIGZpbGUgaXMgYSBjbGFzcywgdGhlbiBpdCBtdXN0IGhhdmUgYSByZWdpc3RlciBjYWxsIHRvIHRoZSByZXBvIG5hbWVzcGFjZVxuICogZm9yIFBoRVQgY29kZS5cbiAqXG4gKiBAYXV0aG9yIFNhbSBSZWlkIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxuICogQGF1dGhvciBNaWNoYWVsIEthdXptYW5uIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxuICogQGNvcHlyaWdodCAyMDIyIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuICovXG5cbmNvbnN0IF8gPSByZXF1aXJlKCAnbG9kYXNoJyApO1xuXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gUnVsZSBEZWZpbml0aW9uXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG5cbi8vIFJlcG9zIHdpdGhvdXQgYSBuYW1lc3BhY2UgdGhhdCBkb24ndCByZXF1aXJlIHRoZXNlIHJlZ2lzdGVyIGNhbGxzLlxuY29uc3Qgb3B0T3V0UmVwb3MgPSBbICdhcXVhJywgJ3BoZXQtaW8td3JhcHBlcnMnLCAncXVha2UnLCAnc3R1ZGlvJyBdO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgY3JlYXRlOiBmdW5jdGlvbiggY29udGV4dCApIHtcblxuICAgIGNvbnN0IGZpbGVuYW1lID0gY29udGV4dC5nZXRGaWxlbmFtZSgpO1xuXG4gICAgLy8gSmF2YXNjcmlwdCBzdHJpbmcgZXNjYXBlIHRoZSByZWdleCBlc2NhcGUgYmFja3NsYXNoIHRvbyAoNCBiYWNrc2xhc2hlcyEhKVxuICAgIGlmICggXy5zb21lKCBvcHRPdXRSZXBvcywgcmVwbyA9PiBuZXcgUmVnRXhwKCBgW1xcXFxcXFxcL10ke3JlcG99W1xcXFxcXFxcL11gICkudGVzdCggZmlsZW5hbWUgKSApICkge1xuICAgICAgcmV0dXJuIHt9OyAvLyBOby1vcCBydWxlXG4gICAgfVxuXG4gICAgY29uc3QgY2xhc3NOYW1lcyA9IFtdO1xuICAgIHJldHVybiB7XG5cbiAgICAgIENsYXNzRGVjbGFyYXRpb246IG5vZGUgPT4ge1xuICAgICAgICBjbGFzc05hbWVzLnB1c2goIG5vZGUuaWQubmFtZSApO1xuICAgICAgfSxcblxuICAgICAgRXhwb3J0RGVmYXVsdERlY2xhcmF0aW9uOiBub2RlID0+IHtcblxuICAgICAgICAvLyBIYXMgYSBjbGFzcyBkZWZhdWx0IGV4cG9ydFxuICAgICAgICBpZiAoIG5vZGUuZGVjbGFyYXRpb24udHlwZSA9PT0gJ0NsYXNzRGVjbGFyYXRpb24nIHx8XG4gICAgICAgICAgICAgKCBub2RlLmRlY2xhcmF0aW9uICYmIG5vZGUuZGVjbGFyYXRpb24ubmFtZSAmJiBjbGFzc05hbWVzLmluY2x1ZGVzKCBub2RlLmRlY2xhcmF0aW9uLm5hbWUgKSApICkge1xuXG4gICAgICAgICAgLy8gTm8gcmVnaXN0ZXIgY2FsbFxuICAgICAgICAgIGlmICggIWNvbnRleHQuZ2V0U291cmNlQ29kZSgpLnRleHQuaW5jbHVkZXMoICcucmVnaXN0ZXIoIFxcJycgKSApIHtcbiAgICAgICAgICAgIGNvbnRleHQucmVwb3J0KCB7XG4gICAgICAgICAgICAgIG5vZGU6IG5vZGUsXG4gICAgICAgICAgICAgIGxvYzogbm9kZS5sb2MsXG4gICAgICAgICAgICAgIG1lc3NhZ2U6ICdGaWxlIGRlZmF1bHQgZXhwb3J0cyBhIGNsYXNzIGJ1dCBoYXMgbm8gbmFtZXNwYWNlIHJlZ2lzdHJhdGlvbidcbiAgICAgICAgICAgIH0gKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9O1xuICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cy5zY2hlbWEgPSBbXG4gIC8vIEpTT04gU2NoZW1hIGZvciBydWxlIG9wdGlvbnMgZ29lcyBoZXJlXG5dOyJdLCJuYW1lcyI6WyJfIiwicmVxdWlyZSIsIm9wdE91dFJlcG9zIiwibW9kdWxlIiwiZXhwb3J0cyIsImNyZWF0ZSIsImNvbnRleHQiLCJmaWxlbmFtZSIsImdldEZpbGVuYW1lIiwic29tZSIsInJlcG8iLCJSZWdFeHAiLCJ0ZXN0IiwiY2xhc3NOYW1lcyIsIkNsYXNzRGVjbGFyYXRpb24iLCJub2RlIiwicHVzaCIsImlkIiwibmFtZSIsIkV4cG9ydERlZmF1bHREZWNsYXJhdGlvbiIsImRlY2xhcmF0aW9uIiwidHlwZSIsImluY2x1ZGVzIiwiZ2V0U291cmNlQ29kZSIsInRleHQiLCJyZXBvcnQiLCJsb2MiLCJtZXNzYWdlIiwic2NoZW1hIl0sIm1hcHBpbmdzIjoiQUFBQSxpREFBaUQ7QUFDakQ7Ozs7Ozs7Q0FPQyxHQUVELE1BQU1BLElBQUlDLFFBQVM7QUFFbkIsZ0ZBQWdGO0FBQ2hGLGtCQUFrQjtBQUNsQixnRkFBZ0Y7QUFHaEYscUVBQXFFO0FBQ3JFLE1BQU1DLGNBQWM7SUFBRTtJQUFRO0lBQW9CO0lBQVM7Q0FBVTtBQUVyRUMsT0FBT0MsT0FBTyxHQUFHO0lBQ2ZDLFFBQVEsU0FBVUMsT0FBTztRQUV2QixNQUFNQyxXQUFXRCxRQUFRRSxXQUFXO1FBRXBDLDRFQUE0RTtRQUM1RSxJQUFLUixFQUFFUyxJQUFJLENBQUVQLGFBQWFRLENBQUFBLE9BQVEsSUFBSUMsT0FBUSxDQUFDLE9BQU8sRUFBRUQsS0FBSyxPQUFPLENBQUMsRUFBR0UsSUFBSSxDQUFFTCxZQUFlO1lBQzNGLE9BQU8sQ0FBQyxHQUFHLGFBQWE7UUFDMUI7UUFFQSxNQUFNTSxhQUFhLEVBQUU7UUFDckIsT0FBTztZQUVMQyxrQkFBa0JDLENBQUFBO2dCQUNoQkYsV0FBV0csSUFBSSxDQUFFRCxLQUFLRSxFQUFFLENBQUNDLElBQUk7WUFDL0I7WUFFQUMsMEJBQTBCSixDQUFBQTtnQkFFeEIsNkJBQTZCO2dCQUM3QixJQUFLQSxLQUFLSyxXQUFXLENBQUNDLElBQUksS0FBSyxzQkFDeEJOLEtBQUtLLFdBQVcsSUFBSUwsS0FBS0ssV0FBVyxDQUFDRixJQUFJLElBQUlMLFdBQVdTLFFBQVEsQ0FBRVAsS0FBS0ssV0FBVyxDQUFDRixJQUFJLEdBQU87b0JBRW5HLG1CQUFtQjtvQkFDbkIsSUFBSyxDQUFDWixRQUFRaUIsYUFBYSxHQUFHQyxJQUFJLENBQUNGLFFBQVEsQ0FBRSxrQkFBb0I7d0JBQy9EaEIsUUFBUW1CLE1BQU0sQ0FBRTs0QkFDZFYsTUFBTUE7NEJBQ05XLEtBQUtYLEtBQUtXLEdBQUc7NEJBQ2JDLFNBQVM7d0JBQ1g7b0JBQ0Y7Z0JBQ0Y7WUFDRjtRQUNGO0lBQ0Y7QUFDRjtBQUVBeEIsT0FBT0MsT0FBTyxDQUFDd0IsTUFBTSxHQUFHLEVBRXZCIn0=