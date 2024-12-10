// Copyright 2021, University of Colorado Boulder
/**
 * This rule verifies that a JSX node of type <p> contains a class in its className attribute called 'p'
 *
 * Future features include also assuring the same for h1, h2, a, li etc.
 * @author Matt Pennington
 */ const NO_CLASS_FOUND = 0;
const CLASS_FOUND = 1;
const CLASS_UNDETERMINABLE = 2;
module.exports = {
    create (context) {
        return {
            // This listener will be called for all IfStatement nodes with blocks.
            'JSXOpeningElement[name.name=\'p\']': function(node) {
                let status = NO_CLASS_FOUND;
                node.attributes.forEach((attribute)=>{
                    if (attribute.name.name === 'className') {
                        // className is a stringLiteral, just split it on white space and look for 'p'
                        if (attribute.value.type === 'Literal') {
                            const classes = attribute.value.value.split(' ');
                            if (classes.find((clazz)=>clazz === 'p')) {
                                status = CLASS_FOUND;
                            }
                        } else {
                            status = CLASS_UNDETERMINABLE;
                            if (attribute.value.type === 'JSXExpressionContainer' && attribute.value.expression === 'TemplateLiteral') {
                                attribute.value.expression.quasis.forEach((quasi)=>{
                                    if (quasi.value.raw.split(' ').find((clazz)=>clazz === 'p')) {
                                        status = CLASS_FOUND;
                                    }
                                });
                            }
                        }
                    }
                });
                if (status === NO_CLASS_FOUND) {
                    context.report({
                        node: node,
                        loc: node.loc,
                        message: 'p elements require p class'
                    });
                } else if (status === CLASS_UNDETERMINABLE) {
                    context.report({
                        node: node,
                        message: 'p elements require p class'
                    });
                }
            }
        };
    }
};

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3BlcmVubmlhbC1hbGlhcy9qcy9lc2xpbnQvcGhldC1ydWxlcy9qc3gtdGV4dC1lbGVtZW50cy1jb250YWluLW1hdGNoaW5nLWNsYXNzLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDIxLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuLyoqXG4gKiBUaGlzIHJ1bGUgdmVyaWZpZXMgdGhhdCBhIEpTWCBub2RlIG9mIHR5cGUgPHA+IGNvbnRhaW5zIGEgY2xhc3MgaW4gaXRzIGNsYXNzTmFtZSBhdHRyaWJ1dGUgY2FsbGVkICdwJ1xuICpcbiAqIEZ1dHVyZSBmZWF0dXJlcyBpbmNsdWRlIGFsc28gYXNzdXJpbmcgdGhlIHNhbWUgZm9yIGgxLCBoMiwgYSwgbGkgZXRjLlxuICogQGF1dGhvciBNYXR0IFBlbm5pbmd0b25cbiAqL1xuXG5jb25zdCBOT19DTEFTU19GT1VORCA9IDA7XG5jb25zdCBDTEFTU19GT1VORCA9IDE7XG5jb25zdCBDTEFTU19VTkRFVEVSTUlOQUJMRSA9IDI7XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBjcmVhdGUoIGNvbnRleHQgKSB7XG5cbiAgICByZXR1cm4ge1xuXG4gICAgICAvLyBUaGlzIGxpc3RlbmVyIHdpbGwgYmUgY2FsbGVkIGZvciBhbGwgSWZTdGF0ZW1lbnQgbm9kZXMgd2l0aCBibG9ja3MuXG4gICAgICAnSlNYT3BlbmluZ0VsZW1lbnRbbmFtZS5uYW1lPVxcJ3BcXCddJzogZnVuY3Rpb24oIG5vZGUgKSB7XG4gICAgICAgIGxldCBzdGF0dXMgPSBOT19DTEFTU19GT1VORDtcbiAgICAgICAgbm9kZS5hdHRyaWJ1dGVzLmZvckVhY2goIGF0dHJpYnV0ZSA9PiB7XG4gICAgICAgICAgaWYgKCBhdHRyaWJ1dGUubmFtZS5uYW1lID09PSAnY2xhc3NOYW1lJyApIHtcbiAgICAgICAgICAgIC8vIGNsYXNzTmFtZSBpcyBhIHN0cmluZ0xpdGVyYWwsIGp1c3Qgc3BsaXQgaXQgb24gd2hpdGUgc3BhY2UgYW5kIGxvb2sgZm9yICdwJ1xuICAgICAgICAgICAgaWYgKCBhdHRyaWJ1dGUudmFsdWUudHlwZSA9PT0gJ0xpdGVyYWwnICkge1xuICAgICAgICAgICAgICBjb25zdCBjbGFzc2VzID0gYXR0cmlidXRlLnZhbHVlLnZhbHVlLnNwbGl0KCAnICcgKTtcbiAgICAgICAgICAgICAgaWYgKCBjbGFzc2VzLmZpbmQoIGNsYXp6ID0+IGNsYXp6ID09PSAncCcgKSApIHtcbiAgICAgICAgICAgICAgICBzdGF0dXMgPSBDTEFTU19GT1VORDtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgIHN0YXR1cyA9IENMQVNTX1VOREVURVJNSU5BQkxFO1xuICAgICAgICAgICAgICBpZiAoIGF0dHJpYnV0ZS52YWx1ZS50eXBlID09PSAnSlNYRXhwcmVzc2lvbkNvbnRhaW5lcicgJiYgYXR0cmlidXRlLnZhbHVlLmV4cHJlc3Npb24gPT09ICdUZW1wbGF0ZUxpdGVyYWwnICkge1xuICAgICAgICAgICAgICAgIGF0dHJpYnV0ZS52YWx1ZS5leHByZXNzaW9uLnF1YXNpcy5mb3JFYWNoKCBxdWFzaSA9PiB7XG4gICAgICAgICAgICAgICAgICBpZiAoIHF1YXNpLnZhbHVlLnJhdy5zcGxpdCggJyAnICkuZmluZCggY2xhenogPT4gY2xhenogPT09ICdwJyApICkge1xuICAgICAgICAgICAgICAgICAgICBzdGF0dXMgPSBDTEFTU19GT1VORDtcbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9ICk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH0gKTtcbiAgICAgICAgaWYgKCBzdGF0dXMgPT09IE5PX0NMQVNTX0ZPVU5EICkge1xuICAgICAgICAgIGNvbnRleHQucmVwb3J0KCB7XG4gICAgICAgICAgICBub2RlOiBub2RlLFxuICAgICAgICAgICAgbG9jOiBub2RlLmxvYyxcbiAgICAgICAgICAgIG1lc3NhZ2U6ICdwIGVsZW1lbnRzIHJlcXVpcmUgcCBjbGFzcydcbiAgICAgICAgICB9ICk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoIHN0YXR1cyA9PT0gQ0xBU1NfVU5ERVRFUk1JTkFCTEUgKSB7XG4gICAgICAgICAgY29udGV4dC5yZXBvcnQoIHtcbiAgICAgICAgICAgIG5vZGU6IG5vZGUsXG4gICAgICAgICAgICBtZXNzYWdlOiAncCBlbGVtZW50cyByZXF1aXJlIHAgY2xhc3MnXG4gICAgICAgICAgfSApO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfTtcbiAgfVxufTsiXSwibmFtZXMiOlsiTk9fQ0xBU1NfRk9VTkQiLCJDTEFTU19GT1VORCIsIkNMQVNTX1VOREVURVJNSU5BQkxFIiwibW9kdWxlIiwiZXhwb3J0cyIsImNyZWF0ZSIsImNvbnRleHQiLCJub2RlIiwic3RhdHVzIiwiYXR0cmlidXRlcyIsImZvckVhY2giLCJhdHRyaWJ1dGUiLCJuYW1lIiwidmFsdWUiLCJ0eXBlIiwiY2xhc3NlcyIsInNwbGl0IiwiZmluZCIsImNsYXp6IiwiZXhwcmVzc2lvbiIsInF1YXNpcyIsInF1YXNpIiwicmF3IiwicmVwb3J0IiwibG9jIiwibWVzc2FnZSJdLCJtYXBwaW5ncyI6IkFBQUEsaURBQWlEO0FBRWpEOzs7OztDQUtDLEdBRUQsTUFBTUEsaUJBQWlCO0FBQ3ZCLE1BQU1DLGNBQWM7QUFDcEIsTUFBTUMsdUJBQXVCO0FBRTdCQyxPQUFPQyxPQUFPLEdBQUc7SUFDZkMsUUFBUUMsT0FBTztRQUViLE9BQU87WUFFTCxzRUFBc0U7WUFDdEUsc0NBQXNDLFNBQVVDLElBQUk7Z0JBQ2xELElBQUlDLFNBQVNSO2dCQUNiTyxLQUFLRSxVQUFVLENBQUNDLE9BQU8sQ0FBRUMsQ0FBQUE7b0JBQ3ZCLElBQUtBLFVBQVVDLElBQUksQ0FBQ0EsSUFBSSxLQUFLLGFBQWM7d0JBQ3pDLDhFQUE4RTt3QkFDOUUsSUFBS0QsVUFBVUUsS0FBSyxDQUFDQyxJQUFJLEtBQUssV0FBWTs0QkFDeEMsTUFBTUMsVUFBVUosVUFBVUUsS0FBSyxDQUFDQSxLQUFLLENBQUNHLEtBQUssQ0FBRTs0QkFDN0MsSUFBS0QsUUFBUUUsSUFBSSxDQUFFQyxDQUFBQSxRQUFTQSxVQUFVLE1BQVE7Z0NBQzVDVixTQUFTUDs0QkFDWDt3QkFDRixPQUNLOzRCQUNITyxTQUFTTjs0QkFDVCxJQUFLUyxVQUFVRSxLQUFLLENBQUNDLElBQUksS0FBSyw0QkFBNEJILFVBQVVFLEtBQUssQ0FBQ00sVUFBVSxLQUFLLG1CQUFvQjtnQ0FDM0dSLFVBQVVFLEtBQUssQ0FBQ00sVUFBVSxDQUFDQyxNQUFNLENBQUNWLE9BQU8sQ0FBRVcsQ0FBQUE7b0NBQ3pDLElBQUtBLE1BQU1SLEtBQUssQ0FBQ1MsR0FBRyxDQUFDTixLQUFLLENBQUUsS0FBTUMsSUFBSSxDQUFFQyxDQUFBQSxRQUFTQSxVQUFVLE1BQVE7d0NBQ2pFVixTQUFTUDtvQ0FDWDtnQ0FDRjs0QkFDRjt3QkFDRjtvQkFDRjtnQkFDRjtnQkFDQSxJQUFLTyxXQUFXUixnQkFBaUI7b0JBQy9CTSxRQUFRaUIsTUFBTSxDQUFFO3dCQUNkaEIsTUFBTUE7d0JBQ05pQixLQUFLakIsS0FBS2lCLEdBQUc7d0JBQ2JDLFNBQVM7b0JBQ1g7Z0JBQ0YsT0FDSyxJQUFLakIsV0FBV04sc0JBQXVCO29CQUMxQ0ksUUFBUWlCLE1BQU0sQ0FBRTt3QkFDZGhCLE1BQU1BO3dCQUNOa0IsU0FBUztvQkFDWDtnQkFDRjtZQUNGO1FBQ0Y7SUFDRjtBQUNGIn0=