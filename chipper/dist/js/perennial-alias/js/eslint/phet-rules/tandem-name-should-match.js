// Copyright 2023, University of Colorado Boulder
/**
 * tandem-name-should-match
 *
 * This module exports a rule for ESLint. The rule checks that when calling the createTandem method,
 * the argument passed to createTandem should match the name of the variable or property it's being assigned to.
 *
 * The rule analyzes VariableDeclaration and AssignmentExpression nodes in the AST,
 * checking the value passed to the createTandem method and comparing it with the name of the variable or property.
 * If the names do not match, it reports an error.
 *
 * Certain behaviors of this rule that may seem confusing in certain cases are labelled inline with `QUIRK:`
 *
 * Cases that are not supported by this rule:
 *
 * 1. New directives onto options or providedOptions properties:
 * options.titleNode = new RichText( . . . )
 *
 * 2. Templated variables:
 * tandem.createTandem( 'myArray${index}` )
 *
 * // NOT SUPPORTED
 * createTandem as an argument instead of in options: const x = new Something( tandem.createTandem( 'notX' ) )
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */ const _ = require('lodash');
module.exports = {
    create (context) {
        return {
            VariableDeclaration (node) {
                const { declarations } = node;
                declarations.forEach((declaration)=>{
                    let variableName = declaration.id.name;
                    if (variableName) {
                        // QUIRK: If creating an options object outside the new operator, don't require it to be `myTypeOptions`,
                        // but instead `myType`
                        if (variableName.endsWith('Options')) {
                            variableName = variableName.replace('Options', '');
                        }
                        const tandemName = getCreateTandemCallArgument(declaration.init);
                        if (tandemName && !matchesNamingConvention(tandemName, variableName)) {
                            context.report({
                                node: node,
                                message: `The variable name "${variableName}" does not match the argument passed to createTandem "${tandemName}"`
                            });
                        }
                    }
                });
            },
            AssignmentExpression (node) {
                if (node.left.type === 'MemberExpression') {
                    const propertyName = node.left.property.name;
                    const isOptionsObject = node.left.object.name && (node.left.object.name === 'options' || node.left.object.name.endsWith('Options'));
                    if (propertyName && !isOptionsObject) {
                        // If the property is a part of 'this', we remove 'this.' from the property name
                        const tandemName = getCreateTandemCallArgument(node.right);
                        if (tandemName && !matchesNamingConvention(tandemName, propertyName)) {
                            context.report({
                                node: node,
                                message: `The property name "${propertyName}" does not match the argument passed to createTandem "${tandemName}"`
                            });
                        }
                    }
                }
            }
        };
    }
};
/**
 * QUIRK: We map certain spellings into camel case for comparison.
 * For example, allow cases like MY_TANDEM or _myTandem matching myTandem.
 */ const matchesNamingConvention = (tandemName, variableName)=>{
    const variableNameCamel = _.camelCase(variableName);
    return tandemName === variableNameCamel || tandemName === variableName || '_' + tandemName === variableName;
};
/**
 *
 * @param memberExpressionNode - an AST node
 * @returns {string}
 */ function getFullCallerName(memberExpressionNode) {
    if (memberExpressionNode.type === 'Identifier') {
        return memberExpressionNode.name;
    } else if (memberExpressionNode.type === 'MemberExpression') {
        return getFullCallerName(memberExpressionNode.object) + '.' + memberExpressionNode.property.name;
    }
    return '';
}
/**
 * This function analyzes the given node and retrieves the argument passed to the createTandem method.
 * It expects the node to be either a NewExpression or a CallExpression.
 * If it finds a 'tandem' property, it checks the callee to see if it's a call to createTandem,
 * then retrieves and returns the first argument of the call.
 * @returns {string|null}
 */ function getCreateTandemCallArgument(node) {
    if (node && (node.type === 'NewExpression' || node.type === 'CallExpression')) {
        const { arguments: args } = node;
        const lastArgument = args[args.length - 1];
        // An object literal as a parameter to the `new Type()` or `myFunction()` call
        if (lastArgument && lastArgument.type === 'ObjectExpression') {
            // Find if "tandem" is the name of a key in the object
            const tandemProperty = lastArgument.properties.find((prop)=>{
                var _prop_key;
                return ((_prop_key = prop.key) == null ? void 0 : _prop_key.name) === 'tandem';
            });
            if (tandemProperty) {
                const createTandemCall = tandemProperty.value;
                if (createTandemCall && createTandemCall.callee && // We are now accessing the callee of the call
                createTandemCall.callee.property && createTandemCall.callee.property.name === 'createTandem' && createTandemCall.arguments && // Check if arguments array exists
                createTandemCall.arguments.length > 0 // Check if the array is not empty
                ) {
                    const callee = getFullCallerName(createTandemCall.callee.object);
                    // QUIRK: If the tandem is something like: myAccordionBoxTandem.createTandem('theChild') then the const variable may have
                    // a name like myAccordionBoxChild, so we need to remove the 'Tandem' part from the name before checking.
                    if (callee === 'tandem' || callee === 'options.tandem' || callee === 'providedOptions.tandem') {
                        const argument = createTandemCall.arguments[0];
                        // createTandem( 'myString' ) <-- "Literal"
                        // createTandem( myVar ) <-- "Identifier"
                        // createTandem( `my${template}Var` ) <-- "TemplateElement"
                        switch(argument.type){
                            case 'Literal':
                                return argument.value;
                            case 'Identifier':
                                // Variable names cannot be tested against. For instance, const myProperty = new Property({tandem:myTandemVariable}) should never match.
                                return null;
                            default:
                                return null;
                        }
                    }
                }
            }
        }
    }
    return null;
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3BlcmVubmlhbC1hbGlhcy9qcy9lc2xpbnQvcGhldC1ydWxlcy90YW5kZW0tbmFtZS1zaG91bGQtbWF0Y2guanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjMsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIHRhbmRlbS1uYW1lLXNob3VsZC1tYXRjaFxuICpcbiAqIFRoaXMgbW9kdWxlIGV4cG9ydHMgYSBydWxlIGZvciBFU0xpbnQuIFRoZSBydWxlIGNoZWNrcyB0aGF0IHdoZW4gY2FsbGluZyB0aGUgY3JlYXRlVGFuZGVtIG1ldGhvZCxcbiAqIHRoZSBhcmd1bWVudCBwYXNzZWQgdG8gY3JlYXRlVGFuZGVtIHNob3VsZCBtYXRjaCB0aGUgbmFtZSBvZiB0aGUgdmFyaWFibGUgb3IgcHJvcGVydHkgaXQncyBiZWluZyBhc3NpZ25lZCB0by5cbiAqXG4gKiBUaGUgcnVsZSBhbmFseXplcyBWYXJpYWJsZURlY2xhcmF0aW9uIGFuZCBBc3NpZ25tZW50RXhwcmVzc2lvbiBub2RlcyBpbiB0aGUgQVNULFxuICogY2hlY2tpbmcgdGhlIHZhbHVlIHBhc3NlZCB0byB0aGUgY3JlYXRlVGFuZGVtIG1ldGhvZCBhbmQgY29tcGFyaW5nIGl0IHdpdGggdGhlIG5hbWUgb2YgdGhlIHZhcmlhYmxlIG9yIHByb3BlcnR5LlxuICogSWYgdGhlIG5hbWVzIGRvIG5vdCBtYXRjaCwgaXQgcmVwb3J0cyBhbiBlcnJvci5cbiAqXG4gKiBDZXJ0YWluIGJlaGF2aW9ycyBvZiB0aGlzIHJ1bGUgdGhhdCBtYXkgc2VlbSBjb25mdXNpbmcgaW4gY2VydGFpbiBjYXNlcyBhcmUgbGFiZWxsZWQgaW5saW5lIHdpdGggYFFVSVJLOmBcbiAqXG4gKiBDYXNlcyB0aGF0IGFyZSBub3Qgc3VwcG9ydGVkIGJ5IHRoaXMgcnVsZTpcbiAqXG4gKiAxLiBOZXcgZGlyZWN0aXZlcyBvbnRvIG9wdGlvbnMgb3IgcHJvdmlkZWRPcHRpb25zIHByb3BlcnRpZXM6XG4gKiBvcHRpb25zLnRpdGxlTm9kZSA9IG5ldyBSaWNoVGV4dCggLiAuIC4gKVxuICpcbiAqIDIuIFRlbXBsYXRlZCB2YXJpYWJsZXM6XG4gKiB0YW5kZW0uY3JlYXRlVGFuZGVtKCAnbXlBcnJheSR7aW5kZXh9YCApXG4gKlxuICogLy8gTk9UIFNVUFBPUlRFRFxuICogY3JlYXRlVGFuZGVtIGFzIGFuIGFyZ3VtZW50IGluc3RlYWQgb2YgaW4gb3B0aW9uczogY29uc3QgeCA9IG5ldyBTb21ldGhpbmcoIHRhbmRlbS5jcmVhdGVUYW5kZW0oICdub3RYJyApIClcbiAqXG4gKiBAYXV0aG9yIFNhbSBSZWlkIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxuICovXG5cbmNvbnN0IF8gPSByZXF1aXJlKCAnbG9kYXNoJyApO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgY3JlYXRlKCBjb250ZXh0ICkge1xuICAgIHJldHVybiB7XG4gICAgICBWYXJpYWJsZURlY2xhcmF0aW9uKCBub2RlICkge1xuICAgICAgICBjb25zdCB7IGRlY2xhcmF0aW9ucyB9ID0gbm9kZTtcblxuICAgICAgICBkZWNsYXJhdGlvbnMuZm9yRWFjaCggZGVjbGFyYXRpb24gPT4ge1xuICAgICAgICAgIGxldCB2YXJpYWJsZU5hbWUgPSBkZWNsYXJhdGlvbi5pZC5uYW1lO1xuXG4gICAgICAgICAgaWYgKCB2YXJpYWJsZU5hbWUgKSB7XG5cbiAgICAgICAgICAgIC8vIFFVSVJLOiBJZiBjcmVhdGluZyBhbiBvcHRpb25zIG9iamVjdCBvdXRzaWRlIHRoZSBuZXcgb3BlcmF0b3IsIGRvbid0IHJlcXVpcmUgaXQgdG8gYmUgYG15VHlwZU9wdGlvbnNgLFxuICAgICAgICAgICAgLy8gYnV0IGluc3RlYWQgYG15VHlwZWBcbiAgICAgICAgICAgIGlmICggdmFyaWFibGVOYW1lLmVuZHNXaXRoKCAnT3B0aW9ucycgKSApIHtcbiAgICAgICAgICAgICAgdmFyaWFibGVOYW1lID0gdmFyaWFibGVOYW1lLnJlcGxhY2UoICdPcHRpb25zJywgJycgKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgY29uc3QgdGFuZGVtTmFtZSA9IGdldENyZWF0ZVRhbmRlbUNhbGxBcmd1bWVudCggZGVjbGFyYXRpb24uaW5pdCApO1xuXG4gICAgICAgICAgICBpZiAoIHRhbmRlbU5hbWUgJiYgIW1hdGNoZXNOYW1pbmdDb252ZW50aW9uKCB0YW5kZW1OYW1lLCB2YXJpYWJsZU5hbWUgKSApIHtcbiAgICAgICAgICAgICAgY29udGV4dC5yZXBvcnQoIHtcbiAgICAgICAgICAgICAgICBub2RlOiBub2RlLFxuICAgICAgICAgICAgICAgIG1lc3NhZ2U6IGBUaGUgdmFyaWFibGUgbmFtZSBcIiR7dmFyaWFibGVOYW1lfVwiIGRvZXMgbm90IG1hdGNoIHRoZSBhcmd1bWVudCBwYXNzZWQgdG8gY3JlYXRlVGFuZGVtIFwiJHt0YW5kZW1OYW1lfVwiYFxuICAgICAgICAgICAgICB9ICk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9ICk7XG4gICAgICB9LFxuXG4gICAgICBBc3NpZ25tZW50RXhwcmVzc2lvbiggbm9kZSApIHtcbiAgICAgICAgaWYgKCBub2RlLmxlZnQudHlwZSA9PT0gJ01lbWJlckV4cHJlc3Npb24nICkge1xuICAgICAgICAgIGNvbnN0IHByb3BlcnR5TmFtZSA9IG5vZGUubGVmdC5wcm9wZXJ0eS5uYW1lO1xuICAgICAgICAgIGNvbnN0IGlzT3B0aW9uc09iamVjdCA9IG5vZGUubGVmdC5vYmplY3QubmFtZSAmJiAoIG5vZGUubGVmdC5vYmplY3QubmFtZSA9PT0gJ29wdGlvbnMnIHx8IG5vZGUubGVmdC5vYmplY3QubmFtZS5lbmRzV2l0aCggJ09wdGlvbnMnICkgKTtcblxuICAgICAgICAgIGlmICggcHJvcGVydHlOYW1lICYmICFpc09wdGlvbnNPYmplY3QgKSB7XG5cbiAgICAgICAgICAgIC8vIElmIHRoZSBwcm9wZXJ0eSBpcyBhIHBhcnQgb2YgJ3RoaXMnLCB3ZSByZW1vdmUgJ3RoaXMuJyBmcm9tIHRoZSBwcm9wZXJ0eSBuYW1lXG4gICAgICAgICAgICBjb25zdCB0YW5kZW1OYW1lID0gZ2V0Q3JlYXRlVGFuZGVtQ2FsbEFyZ3VtZW50KCBub2RlLnJpZ2h0ICk7XG5cbiAgICAgICAgICAgIGlmICggdGFuZGVtTmFtZSAmJiAhbWF0Y2hlc05hbWluZ0NvbnZlbnRpb24oIHRhbmRlbU5hbWUsIHByb3BlcnR5TmFtZSApICkge1xuICAgICAgICAgICAgICBjb250ZXh0LnJlcG9ydCgge1xuICAgICAgICAgICAgICAgIG5vZGU6IG5vZGUsXG4gICAgICAgICAgICAgICAgbWVzc2FnZTogYFRoZSBwcm9wZXJ0eSBuYW1lIFwiJHtwcm9wZXJ0eU5hbWV9XCIgZG9lcyBub3QgbWF0Y2ggdGhlIGFyZ3VtZW50IHBhc3NlZCB0byBjcmVhdGVUYW5kZW0gXCIke3RhbmRlbU5hbWV9XCJgXG4gICAgICAgICAgICAgIH0gKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9O1xuICB9XG59O1xuXG4vKipcbiAqIFFVSVJLOiBXZSBtYXAgY2VydGFpbiBzcGVsbGluZ3MgaW50byBjYW1lbCBjYXNlIGZvciBjb21wYXJpc29uLlxuICogRm9yIGV4YW1wbGUsIGFsbG93IGNhc2VzIGxpa2UgTVlfVEFOREVNIG9yIF9teVRhbmRlbSBtYXRjaGluZyBteVRhbmRlbS5cbiAqL1xuY29uc3QgbWF0Y2hlc05hbWluZ0NvbnZlbnRpb24gPSAoIHRhbmRlbU5hbWUsIHZhcmlhYmxlTmFtZSApID0+IHtcbiAgY29uc3QgdmFyaWFibGVOYW1lQ2FtZWwgPSBfLmNhbWVsQ2FzZSggdmFyaWFibGVOYW1lICk7XG5cbiAgcmV0dXJuICggdGFuZGVtTmFtZSA9PT0gdmFyaWFibGVOYW1lQ2FtZWwgKSB8fFxuICAgICAgICAgKCB0YW5kZW1OYW1lID09PSB2YXJpYWJsZU5hbWUgKSB8fFxuICAgICAgICAgKCAnXycgKyB0YW5kZW1OYW1lID09PSB2YXJpYWJsZU5hbWUgKTtcbn07XG5cbi8qKlxuICpcbiAqIEBwYXJhbSBtZW1iZXJFeHByZXNzaW9uTm9kZSAtIGFuIEFTVCBub2RlXG4gKiBAcmV0dXJucyB7c3RyaW5nfVxuICovXG5mdW5jdGlvbiBnZXRGdWxsQ2FsbGVyTmFtZSggbWVtYmVyRXhwcmVzc2lvbk5vZGUgKSB7XG4gIGlmICggbWVtYmVyRXhwcmVzc2lvbk5vZGUudHlwZSA9PT0gJ0lkZW50aWZpZXInICkge1xuICAgIHJldHVybiBtZW1iZXJFeHByZXNzaW9uTm9kZS5uYW1lO1xuICB9XG4gIGVsc2UgaWYgKCBtZW1iZXJFeHByZXNzaW9uTm9kZS50eXBlID09PSAnTWVtYmVyRXhwcmVzc2lvbicgKSB7XG4gICAgcmV0dXJuIGdldEZ1bGxDYWxsZXJOYW1lKCBtZW1iZXJFeHByZXNzaW9uTm9kZS5vYmplY3QgKSArICcuJyArIG1lbWJlckV4cHJlc3Npb25Ob2RlLnByb3BlcnR5Lm5hbWU7XG4gIH1cbiAgcmV0dXJuICcnO1xufVxuXG4vKipcbiAqIFRoaXMgZnVuY3Rpb24gYW5hbHl6ZXMgdGhlIGdpdmVuIG5vZGUgYW5kIHJldHJpZXZlcyB0aGUgYXJndW1lbnQgcGFzc2VkIHRvIHRoZSBjcmVhdGVUYW5kZW0gbWV0aG9kLlxuICogSXQgZXhwZWN0cyB0aGUgbm9kZSB0byBiZSBlaXRoZXIgYSBOZXdFeHByZXNzaW9uIG9yIGEgQ2FsbEV4cHJlc3Npb24uXG4gKiBJZiBpdCBmaW5kcyBhICd0YW5kZW0nIHByb3BlcnR5LCBpdCBjaGVja3MgdGhlIGNhbGxlZSB0byBzZWUgaWYgaXQncyBhIGNhbGwgdG8gY3JlYXRlVGFuZGVtLFxuICogdGhlbiByZXRyaWV2ZXMgYW5kIHJldHVybnMgdGhlIGZpcnN0IGFyZ3VtZW50IG9mIHRoZSBjYWxsLlxuICogQHJldHVybnMge3N0cmluZ3xudWxsfVxuICovXG5mdW5jdGlvbiBnZXRDcmVhdGVUYW5kZW1DYWxsQXJndW1lbnQoIG5vZGUgKSB7XG4gIGlmICggbm9kZSAmJiAoIG5vZGUudHlwZSA9PT0gJ05ld0V4cHJlc3Npb24nIHx8IG5vZGUudHlwZSA9PT0gJ0NhbGxFeHByZXNzaW9uJyApICkge1xuICAgIGNvbnN0IHsgYXJndW1lbnRzOiBhcmdzIH0gPSBub2RlO1xuICAgIGNvbnN0IGxhc3RBcmd1bWVudCA9IGFyZ3NbIGFyZ3MubGVuZ3RoIC0gMSBdO1xuXG4gICAgLy8gQW4gb2JqZWN0IGxpdGVyYWwgYXMgYSBwYXJhbWV0ZXIgdG8gdGhlIGBuZXcgVHlwZSgpYCBvciBgbXlGdW5jdGlvbigpYCBjYWxsXG4gICAgaWYgKCBsYXN0QXJndW1lbnQgJiYgbGFzdEFyZ3VtZW50LnR5cGUgPT09ICdPYmplY3RFeHByZXNzaW9uJyApIHtcblxuICAgICAgLy8gRmluZCBpZiBcInRhbmRlbVwiIGlzIHRoZSBuYW1lIG9mIGEga2V5IGluIHRoZSBvYmplY3RcbiAgICAgIGNvbnN0IHRhbmRlbVByb3BlcnR5ID0gbGFzdEFyZ3VtZW50LnByb3BlcnRpZXMuZmluZChcbiAgICAgICAgcHJvcCA9PiBwcm9wLmtleT8ubmFtZSA9PT0gJ3RhbmRlbSdcbiAgICAgICk7XG5cbiAgICAgIGlmICggdGFuZGVtUHJvcGVydHkgKSB7XG4gICAgICAgIGNvbnN0IGNyZWF0ZVRhbmRlbUNhbGwgPSB0YW5kZW1Qcm9wZXJ0eS52YWx1ZTtcblxuICAgICAgICBpZiAoXG4gICAgICAgICAgY3JlYXRlVGFuZGVtQ2FsbCAmJlxuICAgICAgICAgIGNyZWF0ZVRhbmRlbUNhbGwuY2FsbGVlICYmIC8vIFdlIGFyZSBub3cgYWNjZXNzaW5nIHRoZSBjYWxsZWUgb2YgdGhlIGNhbGxcbiAgICAgICAgICBjcmVhdGVUYW5kZW1DYWxsLmNhbGxlZS5wcm9wZXJ0eSAmJlxuICAgICAgICAgIGNyZWF0ZVRhbmRlbUNhbGwuY2FsbGVlLnByb3BlcnR5Lm5hbWUgPT09ICdjcmVhdGVUYW5kZW0nICYmXG4gICAgICAgICAgY3JlYXRlVGFuZGVtQ2FsbC5hcmd1bWVudHMgJiYgLy8gQ2hlY2sgaWYgYXJndW1lbnRzIGFycmF5IGV4aXN0c1xuICAgICAgICAgIGNyZWF0ZVRhbmRlbUNhbGwuYXJndW1lbnRzLmxlbmd0aCA+IDAgLy8gQ2hlY2sgaWYgdGhlIGFycmF5IGlzIG5vdCBlbXB0eVxuICAgICAgICApIHtcblxuICAgICAgICAgIGNvbnN0IGNhbGxlZSA9IGdldEZ1bGxDYWxsZXJOYW1lKCBjcmVhdGVUYW5kZW1DYWxsLmNhbGxlZS5vYmplY3QgKTtcblxuICAgICAgICAgIC8vIFFVSVJLOiBJZiB0aGUgdGFuZGVtIGlzIHNvbWV0aGluZyBsaWtlOiBteUFjY29yZGlvbkJveFRhbmRlbS5jcmVhdGVUYW5kZW0oJ3RoZUNoaWxkJykgdGhlbiB0aGUgY29uc3QgdmFyaWFibGUgbWF5IGhhdmVcbiAgICAgICAgICAvLyBhIG5hbWUgbGlrZSBteUFjY29yZGlvbkJveENoaWxkLCBzbyB3ZSBuZWVkIHRvIHJlbW92ZSB0aGUgJ1RhbmRlbScgcGFydCBmcm9tIHRoZSBuYW1lIGJlZm9yZSBjaGVja2luZy5cbiAgICAgICAgICBpZiAoIGNhbGxlZSA9PT0gJ3RhbmRlbScgfHwgY2FsbGVlID09PSAnb3B0aW9ucy50YW5kZW0nIHx8IGNhbGxlZSA9PT0gJ3Byb3ZpZGVkT3B0aW9ucy50YW5kZW0nICkge1xuXG4gICAgICAgICAgICBjb25zdCBhcmd1bWVudCA9IGNyZWF0ZVRhbmRlbUNhbGwuYXJndW1lbnRzWyAwIF07XG5cbiAgICAgICAgICAgIC8vIGNyZWF0ZVRhbmRlbSggJ215U3RyaW5nJyApIDwtLSBcIkxpdGVyYWxcIlxuICAgICAgICAgICAgLy8gY3JlYXRlVGFuZGVtKCBteVZhciApIDwtLSBcIklkZW50aWZpZXJcIlxuICAgICAgICAgICAgLy8gY3JlYXRlVGFuZGVtKCBgbXkke3RlbXBsYXRlfVZhcmAgKSA8LS0gXCJUZW1wbGF0ZUVsZW1lbnRcIlxuICAgICAgICAgICAgc3dpdGNoKCBhcmd1bWVudC50eXBlICkge1xuICAgICAgICAgICAgICBjYXNlICdMaXRlcmFsJzpcbiAgICAgICAgICAgICAgICByZXR1cm4gYXJndW1lbnQudmFsdWU7XG4gICAgICAgICAgICAgIGNhc2UgJ0lkZW50aWZpZXInOlxuXG4gICAgICAgICAgICAgICAgLy8gVmFyaWFibGUgbmFtZXMgY2Fubm90IGJlIHRlc3RlZCBhZ2FpbnN0LiBGb3IgaW5zdGFuY2UsIGNvbnN0IG15UHJvcGVydHkgPSBuZXcgUHJvcGVydHkoe3RhbmRlbTpteVRhbmRlbVZhcmlhYmxlfSkgc2hvdWxkIG5ldmVyIG1hdGNoLlxuICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiBudWxsO1xufSJdLCJuYW1lcyI6WyJfIiwicmVxdWlyZSIsIm1vZHVsZSIsImV4cG9ydHMiLCJjcmVhdGUiLCJjb250ZXh0IiwiVmFyaWFibGVEZWNsYXJhdGlvbiIsIm5vZGUiLCJkZWNsYXJhdGlvbnMiLCJmb3JFYWNoIiwiZGVjbGFyYXRpb24iLCJ2YXJpYWJsZU5hbWUiLCJpZCIsIm5hbWUiLCJlbmRzV2l0aCIsInJlcGxhY2UiLCJ0YW5kZW1OYW1lIiwiZ2V0Q3JlYXRlVGFuZGVtQ2FsbEFyZ3VtZW50IiwiaW5pdCIsIm1hdGNoZXNOYW1pbmdDb252ZW50aW9uIiwicmVwb3J0IiwibWVzc2FnZSIsIkFzc2lnbm1lbnRFeHByZXNzaW9uIiwibGVmdCIsInR5cGUiLCJwcm9wZXJ0eU5hbWUiLCJwcm9wZXJ0eSIsImlzT3B0aW9uc09iamVjdCIsIm9iamVjdCIsInJpZ2h0IiwidmFyaWFibGVOYW1lQ2FtZWwiLCJjYW1lbENhc2UiLCJnZXRGdWxsQ2FsbGVyTmFtZSIsIm1lbWJlckV4cHJlc3Npb25Ob2RlIiwiYXJndW1lbnRzIiwiYXJncyIsImxhc3RBcmd1bWVudCIsImxlbmd0aCIsInRhbmRlbVByb3BlcnR5IiwicHJvcGVydGllcyIsImZpbmQiLCJwcm9wIiwia2V5IiwiY3JlYXRlVGFuZGVtQ2FsbCIsInZhbHVlIiwiY2FsbGVlIiwiYXJndW1lbnQiXSwibWFwcGluZ3MiOiJBQUFBLGlEQUFpRDtBQUVqRDs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0NBd0JDLEdBRUQsTUFBTUEsSUFBSUMsUUFBUztBQUVuQkMsT0FBT0MsT0FBTyxHQUFHO0lBQ2ZDLFFBQVFDLE9BQU87UUFDYixPQUFPO1lBQ0xDLHFCQUFxQkMsSUFBSTtnQkFDdkIsTUFBTSxFQUFFQyxZQUFZLEVBQUUsR0FBR0Q7Z0JBRXpCQyxhQUFhQyxPQUFPLENBQUVDLENBQUFBO29CQUNwQixJQUFJQyxlQUFlRCxZQUFZRSxFQUFFLENBQUNDLElBQUk7b0JBRXRDLElBQUtGLGNBQWU7d0JBRWxCLHlHQUF5Rzt3QkFDekcsdUJBQXVCO3dCQUN2QixJQUFLQSxhQUFhRyxRQUFRLENBQUUsWUFBYzs0QkFDeENILGVBQWVBLGFBQWFJLE9BQU8sQ0FBRSxXQUFXO3dCQUNsRDt3QkFFQSxNQUFNQyxhQUFhQyw0QkFBNkJQLFlBQVlRLElBQUk7d0JBRWhFLElBQUtGLGNBQWMsQ0FBQ0csd0JBQXlCSCxZQUFZTCxlQUFpQjs0QkFDeEVOLFFBQVFlLE1BQU0sQ0FBRTtnQ0FDZGIsTUFBTUE7Z0NBQ05jLFNBQVMsQ0FBQyxtQkFBbUIsRUFBRVYsYUFBYSxzREFBc0QsRUFBRUssV0FBVyxDQUFDLENBQUM7NEJBQ25IO3dCQUNGO29CQUNGO2dCQUNGO1lBQ0Y7WUFFQU0sc0JBQXNCZixJQUFJO2dCQUN4QixJQUFLQSxLQUFLZ0IsSUFBSSxDQUFDQyxJQUFJLEtBQUssb0JBQXFCO29CQUMzQyxNQUFNQyxlQUFlbEIsS0FBS2dCLElBQUksQ0FBQ0csUUFBUSxDQUFDYixJQUFJO29CQUM1QyxNQUFNYyxrQkFBa0JwQixLQUFLZ0IsSUFBSSxDQUFDSyxNQUFNLENBQUNmLElBQUksSUFBTU4sQ0FBQUEsS0FBS2dCLElBQUksQ0FBQ0ssTUFBTSxDQUFDZixJQUFJLEtBQUssYUFBYU4sS0FBS2dCLElB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