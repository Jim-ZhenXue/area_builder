// Copyright 2023, University of Colorado Boulder
/**
 * @fileoverview Rule that prohibits using the spread operator on anything other than object literals.
 *
 * This is important because it does not do excess property detection.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */ module.exports = {
    meta: {
        type: 'problem'
    },
    create: (context)=>{
        return {
            SpreadElement (node) {
                if (node.parent.type === 'ObjectExpression' && node.argument.type !== 'ObjectExpression') {
                    context.report({
                        node: node,
                        message: 'Prevent spread operator on non-literals because it does not do excess property detection'
                    });
                }
            }
        };
    }
};

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3BlcmVubmlhbC1hbGlhcy9qcy9lc2xpbnQvcGhldC1ydWxlcy9uby1vYmplY3Qtc3ByZWFkLW9uLW5vbi1saXRlcmFscy5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAyMywgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG4vKipcbiAqIEBmaWxlb3ZlcnZpZXcgUnVsZSB0aGF0IHByb2hpYml0cyB1c2luZyB0aGUgc3ByZWFkIG9wZXJhdG9yIG9uIGFueXRoaW5nIG90aGVyIHRoYW4gb2JqZWN0IGxpdGVyYWxzLlxuICpcbiAqIFRoaXMgaXMgaW1wb3J0YW50IGJlY2F1c2UgaXQgZG9lcyBub3QgZG8gZXhjZXNzIHByb3BlcnR5IGRldGVjdGlvbi5cbiAqXG4gKiBAYXV0aG9yIFNhbSBSZWlkIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxuICovXG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBtZXRhOiB7XG4gICAgdHlwZTogJ3Byb2JsZW0nXG4gIH0sXG4gIGNyZWF0ZTogY29udGV4dCA9PiB7XG4gICAgcmV0dXJuIHtcbiAgICAgIFNwcmVhZEVsZW1lbnQoIG5vZGUgKSB7XG4gICAgICAgIGlmICggbm9kZS5wYXJlbnQudHlwZSA9PT0gJ09iamVjdEV4cHJlc3Npb24nICYmIG5vZGUuYXJndW1lbnQudHlwZSAhPT0gJ09iamVjdEV4cHJlc3Npb24nICkge1xuICAgICAgICAgIGNvbnRleHQucmVwb3J0KCB7XG4gICAgICAgICAgICBub2RlOiBub2RlLFxuICAgICAgICAgICAgbWVzc2FnZTogJ1ByZXZlbnQgc3ByZWFkIG9wZXJhdG9yIG9uIG5vbi1saXRlcmFscyBiZWNhdXNlIGl0IGRvZXMgbm90IGRvIGV4Y2VzcyBwcm9wZXJ0eSBkZXRlY3Rpb24nXG4gICAgICAgICAgfSApO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfTtcbiAgfVxufTsiXSwibmFtZXMiOlsibW9kdWxlIiwiZXhwb3J0cyIsIm1ldGEiLCJ0eXBlIiwiY3JlYXRlIiwiY29udGV4dCIsIlNwcmVhZEVsZW1lbnQiLCJub2RlIiwicGFyZW50IiwiYXJndW1lbnQiLCJyZXBvcnQiLCJtZXNzYWdlIl0sIm1hcHBpbmdzIjoiQUFBQSxpREFBaUQ7QUFDakQ7Ozs7OztDQU1DLEdBRURBLE9BQU9DLE9BQU8sR0FBRztJQUNmQyxNQUFNO1FBQ0pDLE1BQU07SUFDUjtJQUNBQyxRQUFRQyxDQUFBQTtRQUNOLE9BQU87WUFDTEMsZUFBZUMsSUFBSTtnQkFDakIsSUFBS0EsS0FBS0MsTUFBTSxDQUFDTCxJQUFJLEtBQUssc0JBQXNCSSxLQUFLRSxRQUFRLENBQUNOLElBQUksS0FBSyxvQkFBcUI7b0JBQzFGRSxRQUFRSyxNQUFNLENBQUU7d0JBQ2RILE1BQU1BO3dCQUNOSSxTQUFTO29CQUNYO2dCQUNGO1lBQ0Y7UUFDRjtJQUNGO0FBQ0YifQ==