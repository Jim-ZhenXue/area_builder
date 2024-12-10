// Copyright 2022, University of Colorado Boulder
/**
 * @fileoverview Rule that checks for missing return types on method definitions and function declarations for
 * TypeScript files.
 *
 * We could not use the built-in rule explicit-function-return-type because it does not support a way to skip functions
 * defined in a variable declaration. Functions defined like this typically have a local usage scope, and the team
 * decided that we don't need them to have a return type.
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 * @copyright 2022 University of Colorado Boulder
 */ const { ESLintUtils } = require('@typescript-eslint/utils');
// these are still MethodDefinition nodes, but don't require an annotation
const exemptMethods = [
    'get',
    'set',
    'constructor'
];
/**
 * Use the type checker to get the return type as a string from the eslint context and AST Node.
 * @param {Context} context - https://eslint.org/docs/latest/developer-guide/working-with-rules#the-context-object
 * @param node - The AST Node
 */ const getReturnTypeString = (context, node)=>{
    // Get the type checker.
    const parserServices = ESLintUtils.getParserServices(context);
    const checker = parserServices.program.getTypeChecker();
    // Had help from an example here to get the return type from a method declaration as a string:
    // https://stackoverflow.com/questions/47215069/how-to-use-typescript-compiler-api-to-get-normal-function-info-eg-returntype-p
    const tsNode = parserServices.esTreeNodeToTSNodeMap.get(node);
    const signature = checker.getSignatureFromDeclaration(tsNode);
    const returnType = checker.getReturnTypeOfSignature(signature);
    return checker.typeToString(returnType);
};
/**
 * Inserts the returnTypeString at the provided location.
 * @param {ASTNode|undefined} functionBody - node.body from the AST (may momentarily be undefined while editing)
 * @param returnTypeString
 * @param fixer
 * @returns {boolean|*}
 */ const insertReturnType = (functionBody, returnTypeString, fixer)=>{
    if (functionBody) {
        const bodyStartLocation = functionBody.range[0];
        // At this time, the rule is on with no errors on the project, if in the future we wanted to improve the fixer. . .
        // * do Range/Node etc as a second fix to easily find spots where we are using the DOM type.
        // * any should be filled in themselves.
        // * look into some derivedProperty or other Property returns. Perhaps do those manually.
        if (returnTypeString !== 'any' && ![
            'Image',
            'Range',
            'Text',
            'Node',
            'Event'
        ].includes(returnTypeString) && !returnTypeString.includes('Property')) {
            // location - 1 adds an extra space after the return type name
            return fixer.insertTextBeforeRange([
                bodyStartLocation - 1,
                bodyStartLocation
            ], `: ${returnTypeString} `);
        }
    }
    return false;
};
module.exports = {
    meta: {
        type: 'problem',
        fixable: 'code'
    },
    create: (context)=>{
        return {
            FunctionDeclaration: (node)=>{
                if (!node.returnType) {
                    context.report({
                        message: 'Missing return type.',
                        node: node,
                        // Comment out for next time we need this fixer, but it requires type info, where the rule doesn't, so don't always include it.
                        fix: (fixer)=>{
                            const returnTypeString = getReturnTypeString(context, node);
                            return insertReturnType(node.body, returnTypeString, fixer);
                        }
                    });
                }
            },
            MethodDefinition: (node)=>{
                if (!exemptMethods.includes(node.kind) && node.value && !node.value.returnType) {
                    context.report({
                        message: 'Missing return type.',
                        node: node,
                        // Comment out for next time we need this fixer, but it requires type info, where the rule doesn't, so don't always include it.
                        fix: (fixer)=>{
                            const returnTypeString = getReturnTypeString(context, node);
                            return insertReturnType(node.value.body, returnTypeString, fixer);
                        }
                    });
                }
            }
        };
    }
};

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3BlcmVubmlhbC1hbGlhcy9qcy9lc2xpbnQvcGhldC1ydWxlcy9leHBsaWNpdC1tZXRob2QtcmV0dXJuLXR5cGUuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuLyoqXG4gKiBAZmlsZW92ZXJ2aWV3IFJ1bGUgdGhhdCBjaGVja3MgZm9yIG1pc3NpbmcgcmV0dXJuIHR5cGVzIG9uIG1ldGhvZCBkZWZpbml0aW9ucyBhbmQgZnVuY3Rpb24gZGVjbGFyYXRpb25zIGZvclxuICogVHlwZVNjcmlwdCBmaWxlcy5cbiAqXG4gKiBXZSBjb3VsZCBub3QgdXNlIHRoZSBidWlsdC1pbiBydWxlIGV4cGxpY2l0LWZ1bmN0aW9uLXJldHVybi10eXBlIGJlY2F1c2UgaXQgZG9lcyBub3Qgc3VwcG9ydCBhIHdheSB0byBza2lwIGZ1bmN0aW9uc1xuICogZGVmaW5lZCBpbiBhIHZhcmlhYmxlIGRlY2xhcmF0aW9uLiBGdW5jdGlvbnMgZGVmaW5lZCBsaWtlIHRoaXMgdHlwaWNhbGx5IGhhdmUgYSBsb2NhbCB1c2FnZSBzY29wZSwgYW5kIHRoZSB0ZWFtXG4gKiBkZWNpZGVkIHRoYXQgd2UgZG9uJ3QgbmVlZCB0aGVtIHRvIGhhdmUgYSByZXR1cm4gdHlwZS5cbiAqXG4gKiBAYXV0aG9yIEplc3NlIEdyZWVuYmVyZyAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcbiAqIEBjb3B5cmlnaHQgMjAyMiBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcbiAqL1xuXG5jb25zdCB7IEVTTGludFV0aWxzIH0gPSByZXF1aXJlKCAnQHR5cGVzY3JpcHQtZXNsaW50L3V0aWxzJyApO1xuXG4vLyB0aGVzZSBhcmUgc3RpbGwgTWV0aG9kRGVmaW5pdGlvbiBub2RlcywgYnV0IGRvbid0IHJlcXVpcmUgYW4gYW5ub3RhdGlvblxuY29uc3QgZXhlbXB0TWV0aG9kcyA9IFsgJ2dldCcsICdzZXQnLCAnY29uc3RydWN0b3InIF07XG5cbi8qKlxuICogVXNlIHRoZSB0eXBlIGNoZWNrZXIgdG8gZ2V0IHRoZSByZXR1cm4gdHlwZSBhcyBhIHN0cmluZyBmcm9tIHRoZSBlc2xpbnQgY29udGV4dCBhbmQgQVNUIE5vZGUuXG4gKiBAcGFyYW0ge0NvbnRleHR9IGNvbnRleHQgLSBodHRwczovL2VzbGludC5vcmcvZG9jcy9sYXRlc3QvZGV2ZWxvcGVyLWd1aWRlL3dvcmtpbmctd2l0aC1ydWxlcyN0aGUtY29udGV4dC1vYmplY3RcbiAqIEBwYXJhbSBub2RlIC0gVGhlIEFTVCBOb2RlXG4gKi9cbmNvbnN0IGdldFJldHVyblR5cGVTdHJpbmcgPSAoIGNvbnRleHQsIG5vZGUgKSA9PiB7XG5cbiAgLy8gR2V0IHRoZSB0eXBlIGNoZWNrZXIuXG4gIGNvbnN0IHBhcnNlclNlcnZpY2VzID0gRVNMaW50VXRpbHMuZ2V0UGFyc2VyU2VydmljZXMoIGNvbnRleHQgKTtcbiAgY29uc3QgY2hlY2tlciA9IHBhcnNlclNlcnZpY2VzLnByb2dyYW0uZ2V0VHlwZUNoZWNrZXIoKTtcblxuICAvLyBIYWQgaGVscCBmcm9tIGFuIGV4YW1wbGUgaGVyZSB0byBnZXQgdGhlIHJldHVybiB0eXBlIGZyb20gYSBtZXRob2QgZGVjbGFyYXRpb24gYXMgYSBzdHJpbmc6XG4gIC8vIGh0dHBzOi8vc3RhY2tvdmVyZmxvdy5jb20vcXVlc3Rpb25zLzQ3MjE1MDY5L2hvdy10by11c2UtdHlwZXNjcmlwdC1jb21waWxlci1hcGktdG8tZ2V0LW5vcm1hbC1mdW5jdGlvbi1pbmZvLWVnLXJldHVybnR5cGUtcFxuICBjb25zdCB0c05vZGUgPSBwYXJzZXJTZXJ2aWNlcy5lc1RyZWVOb2RlVG9UU05vZGVNYXAuZ2V0KCBub2RlICk7XG4gIGNvbnN0IHNpZ25hdHVyZSA9IGNoZWNrZXIuZ2V0U2lnbmF0dXJlRnJvbURlY2xhcmF0aW9uKCB0c05vZGUgKTtcbiAgY29uc3QgcmV0dXJuVHlwZSA9IGNoZWNrZXIuZ2V0UmV0dXJuVHlwZU9mU2lnbmF0dXJlKCBzaWduYXR1cmUgKTtcblxuICByZXR1cm4gY2hlY2tlci50eXBlVG9TdHJpbmcoIHJldHVyblR5cGUgKTtcbn07XG5cbi8qKlxuICogSW5zZXJ0cyB0aGUgcmV0dXJuVHlwZVN0cmluZyBhdCB0aGUgcHJvdmlkZWQgbG9jYXRpb24uXG4gKiBAcGFyYW0ge0FTVE5vZGV8dW5kZWZpbmVkfSBmdW5jdGlvbkJvZHkgLSBub2RlLmJvZHkgZnJvbSB0aGUgQVNUIChtYXkgbW9tZW50YXJpbHkgYmUgdW5kZWZpbmVkIHdoaWxlIGVkaXRpbmcpXG4gKiBAcGFyYW0gcmV0dXJuVHlwZVN0cmluZ1xuICogQHBhcmFtIGZpeGVyXG4gKiBAcmV0dXJucyB7Ym9vbGVhbnwqfVxuICovXG5jb25zdCBpbnNlcnRSZXR1cm5UeXBlID0gKCBmdW5jdGlvbkJvZHksIHJldHVyblR5cGVTdHJpbmcsIGZpeGVyICkgPT4ge1xuICBpZiAoIGZ1bmN0aW9uQm9keSApIHtcbiAgICBjb25zdCBib2R5U3RhcnRMb2NhdGlvbiA9IGZ1bmN0aW9uQm9keS5yYW5nZVsgMCBdO1xuXG4gICAgLy8gQXQgdGhpcyB0aW1lLCB0aGUgcnVsZSBpcyBvbiB3aXRoIG5vIGVycm9ycyBvbiB0aGUgcHJvamVjdCwgaWYgaW4gdGhlIGZ1dHVyZSB3ZSB3YW50ZWQgdG8gaW1wcm92ZSB0aGUgZml4ZXIuIC4gLlxuICAgIC8vICogZG8gUmFuZ2UvTm9kZSBldGMgYXMgYSBzZWNvbmQgZml4IHRvIGVhc2lseSBmaW5kIHNwb3RzIHdoZXJlIHdlIGFyZSB1c2luZyB0aGUgRE9NIHR5cGUuXG4gICAgLy8gKiBhbnkgc2hvdWxkIGJlIGZpbGxlZCBpbiB0aGVtc2VsdmVzLlxuICAgIC8vICogbG9vayBpbnRvIHNvbWUgZGVyaXZlZFByb3BlcnR5IG9yIG90aGVyIFByb3BlcnR5IHJldHVybnMuIFBlcmhhcHMgZG8gdGhvc2UgbWFudWFsbHkuXG4gICAgaWYgKCByZXR1cm5UeXBlU3RyaW5nICE9PSAnYW55JyAmJiAhWyAnSW1hZ2UnLCAnUmFuZ2UnLCAnVGV4dCcsICdOb2RlJywgJ0V2ZW50JyBdLmluY2x1ZGVzKCByZXR1cm5UeXBlU3RyaW5nICkgJiZcbiAgICAgICAgICFyZXR1cm5UeXBlU3RyaW5nLmluY2x1ZGVzKCAnUHJvcGVydHknICkgKSB7XG5cbiAgICAgIC8vIGxvY2F0aW9uIC0gMSBhZGRzIGFuIGV4dHJhIHNwYWNlIGFmdGVyIHRoZSByZXR1cm4gdHlwZSBuYW1lXG4gICAgICByZXR1cm4gZml4ZXIuaW5zZXJ0VGV4dEJlZm9yZVJhbmdlKCBbIGJvZHlTdGFydExvY2F0aW9uIC0gMSwgYm9keVN0YXJ0TG9jYXRpb24gXSwgYDogJHtyZXR1cm5UeXBlU3RyaW5nfSBgICk7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGZhbHNlO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIG1ldGE6IHtcbiAgICB0eXBlOiAncHJvYmxlbScsXG4gICAgZml4YWJsZTogJ2NvZGUnXG4gIH0sXG4gIGNyZWF0ZTogY29udGV4dCA9PiB7XG4gICAgcmV0dXJuIHtcbiAgICAgIEZ1bmN0aW9uRGVjbGFyYXRpb246IG5vZGUgPT4ge1xuICAgICAgICBpZiAoICFub2RlLnJldHVyblR5cGUgKSB7XG5cbiAgICAgICAgICBjb250ZXh0LnJlcG9ydCgge1xuICAgICAgICAgICAgbWVzc2FnZTogJ01pc3NpbmcgcmV0dXJuIHR5cGUuJyxcbiAgICAgICAgICAgIG5vZGU6IG5vZGUsXG5cbiAgICAgICAgICAgIC8vIENvbW1lbnQgb3V0IGZvciBuZXh0IHRpbWUgd2UgbmVlZCB0aGlzIGZpeGVyLCBidXQgaXQgcmVxdWlyZXMgdHlwZSBpbmZvLCB3aGVyZSB0aGUgcnVsZSBkb2Vzbid0LCBzbyBkb24ndCBhbHdheXMgaW5jbHVkZSBpdC5cbiAgICAgICAgICAgIGZpeDogZml4ZXIgPT4ge1xuXG4gICAgICAgICAgICAgIGNvbnN0IHJldHVyblR5cGVTdHJpbmcgPSBnZXRSZXR1cm5UeXBlU3RyaW5nKCBjb250ZXh0LCBub2RlICk7XG4gICAgICAgICAgICAgIHJldHVybiBpbnNlcnRSZXR1cm5UeXBlKCBub2RlLmJvZHksIHJldHVyblR5cGVTdHJpbmcsIGZpeGVyICk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSApO1xuICAgICAgICB9XG4gICAgICB9LFxuICAgICAgTWV0aG9kRGVmaW5pdGlvbjogbm9kZSA9PiB7XG4gICAgICAgIGlmICggIWV4ZW1wdE1ldGhvZHMuaW5jbHVkZXMoIG5vZGUua2luZCApICYmIG5vZGUudmFsdWUgJiYgIW5vZGUudmFsdWUucmV0dXJuVHlwZSApIHtcblxuICAgICAgICAgIGNvbnRleHQucmVwb3J0KCB7XG4gICAgICAgICAgICBtZXNzYWdlOiAnTWlzc2luZyByZXR1cm4gdHlwZS4nLFxuICAgICAgICAgICAgbm9kZTogbm9kZSxcblxuICAgICAgICAgICAgLy8gQ29tbWVudCBvdXQgZm9yIG5leHQgdGltZSB3ZSBuZWVkIHRoaXMgZml4ZXIsIGJ1dCBpdCByZXF1aXJlcyB0eXBlIGluZm8sIHdoZXJlIHRoZSBydWxlIGRvZXNuJ3QsIHNvIGRvbid0IGFsd2F5cyBpbmNsdWRlIGl0LlxuICAgICAgICAgICAgZml4OiBmaXhlciA9PiB7XG5cbiAgICAgICAgICAgICAgY29uc3QgcmV0dXJuVHlwZVN0cmluZyA9IGdldFJldHVyblR5cGVTdHJpbmcoIGNvbnRleHQsIG5vZGUgKTtcbiAgICAgICAgICAgICAgcmV0dXJuIGluc2VydFJldHVyblR5cGUoIG5vZGUudmFsdWUuYm9keSwgcmV0dXJuVHlwZVN0cmluZywgZml4ZXIgKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9ICk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9O1xuICB9XG59OyJdLCJuYW1lcyI6WyJFU0xpbnRVdGlscyIsInJlcXVpcmUiLCJleGVtcHRNZXRob2RzIiwiZ2V0UmV0dXJuVHlwZVN0cmluZyIsImNvbnRleHQiLCJub2RlIiwicGFyc2VyU2VydmljZXMiLCJnZXRQYXJzZXJTZXJ2aWNlcyIsImNoZWNrZXIiLCJwcm9ncmFtIiwiZ2V0VHlwZUNoZWNrZXIiLCJ0c05vZGUiLCJlc1RyZWVOb2RlVG9UU05vZGVNYXAiLCJnZXQiLCJzaWduYXR1cmUiLCJnZXRTaWduYXR1cmVGcm9tRGVjbGFyYXRpb24iLCJyZXR1cm5UeXBlIiwiZ2V0UmV0dXJuVHlwZU9mU2lnbmF0dXJlIiwidHlwZVRvU3RyaW5nIiwiaW5zZXJ0UmV0dXJuVHlwZSIsImZ1bmN0aW9uQm9keSIsInJldHVyblR5cGVTdHJpbmciLCJmaXhlciIsImJvZHlTdGFydExvY2F0aW9uIiwicmFuZ2UiLCJpbmNsdWRlcyIsImluc2VydFRleHRCZWZvcmVSYW5nZSIsIm1vZHVsZSIsImV4cG9ydHMiLCJtZXRhIiwidHlwZSIsImZpeGFibGUiLCJjcmVhdGUiLCJGdW5jdGlvbkRlY2xhcmF0aW9uIiwicmVwb3J0IiwibWVzc2FnZSIsImZpeCIsImJvZHkiLCJNZXRob2REZWZpbml0aW9uIiwia2luZCIsInZhbHVlIl0sIm1hcHBpbmdzIjoiQUFBQSxpREFBaUQ7QUFDakQ7Ozs7Ozs7Ozs7Q0FVQyxHQUVELE1BQU0sRUFBRUEsV0FBVyxFQUFFLEdBQUdDLFFBQVM7QUFFakMsMEVBQTBFO0FBQzFFLE1BQU1DLGdCQUFnQjtJQUFFO0lBQU87SUFBTztDQUFlO0FBRXJEOzs7O0NBSUMsR0FDRCxNQUFNQyxzQkFBc0IsQ0FBRUMsU0FBU0M7SUFFckMsd0JBQXdCO0lBQ3hCLE1BQU1DLGlCQUFpQk4sWUFBWU8saUJBQWlCLENBQUVIO0lBQ3RELE1BQU1JLFVBQVVGLGVBQWVHLE9BQU8sQ0FBQ0MsY0FBYztJQUVyRCw4RkFBOEY7SUFDOUYsOEhBQThIO0lBQzlILE1BQU1DLFNBQVNMLGVBQWVNLHFCQUFxQixDQUFDQyxHQUFHLENBQUVSO0lBQ3pELE1BQU1TLFlBQVlOLFFBQVFPLDJCQUEyQixDQUFFSjtJQUN2RCxNQUFNSyxhQUFhUixRQUFRUyx3QkFBd0IsQ0FBRUg7SUFFckQsT0FBT04sUUFBUVUsWUFBWSxDQUFFRjtBQUMvQjtBQUVBOzs7Ozs7Q0FNQyxHQUNELE1BQU1HLG1CQUFtQixDQUFFQyxjQUFjQyxrQkFBa0JDO0lBQ3pELElBQUtGLGNBQWU7UUFDbEIsTUFBTUcsb0JBQW9CSCxhQUFhSSxLQUFLLENBQUUsRUFBRztRQUVqRCxtSEFBbUg7UUFDbkgsNEZBQTRGO1FBQzVGLHdDQUF3QztRQUN4Qyx5RkFBeUY7UUFDekYsSUFBS0gscUJBQXFCLFNBQVMsQ0FBQztZQUFFO1lBQVM7WUFBUztZQUFRO1lBQVE7U0FBUyxDQUFDSSxRQUFRLENBQUVKLHFCQUN2RixDQUFDQSxpQkFBaUJJLFFBQVEsQ0FBRSxhQUFlO1lBRTlDLDhEQUE4RDtZQUM5RCxPQUFPSCxNQUFNSSxxQkFBcUIsQ0FBRTtnQkFBRUgsb0JBQW9CO2dCQUFHQTthQUFtQixFQUFFLENBQUMsRUFBRSxFQUFFRixpQkFBaUIsQ0FBQyxDQUFDO1FBQzVHO0lBQ0Y7SUFFQSxPQUFPO0FBQ1Q7QUFFQU0sT0FBT0MsT0FBTyxHQUFHO0lBQ2ZDLE1BQU07UUFDSkMsTUFBTTtRQUNOQyxTQUFTO0lBQ1g7SUFDQUMsUUFBUTVCLENBQUFBO1FBQ04sT0FBTztZQUNMNkIscUJBQXFCNUIsQ0FBQUE7Z0JBQ25CLElBQUssQ0FBQ0EsS0FBS1csVUFBVSxFQUFHO29CQUV0QlosUUFBUThCLE1BQU0sQ0FBRTt3QkFDZEMsU0FBUzt3QkFDVDlCLE1BQU1BO3dCQUVOLCtIQUErSDt3QkFDL0grQixLQUFLZCxDQUFBQTs0QkFFSCxNQUFNRCxtQkFBbUJsQixvQkFBcUJDLFNBQVNDOzRCQUN2RCxPQUFPYyxpQkFBa0JkLEtBQUtnQyxJQUFJLEVBQUVoQixrQkFBa0JDO3dCQUN4RDtvQkFDRjtnQkFDRjtZQUNGO1lBQ0FnQixrQkFBa0JqQyxDQUFBQTtnQkFDaEIsSUFBSyxDQUFDSCxjQUFjdUIsUUFBUSxDQUFFcEIsS0FBS2tDLElBQUksS0FBTWxDLEtBQUttQyxLQUFLLElBQUksQ0FBQ25DLEtBQUttQyxLQUFLLENBQUN4QixVQUFVLEVBQUc7b0JBRWxGWixRQUFROEIsTUFBTSxDQUFFO3dCQUNkQyxTQUFTO3dCQUNUOUIsTUFBTUE7d0JBRU4sK0hBQStIO3dCQUMvSCtCLEtBQUtkLENBQUFBOzRCQUVILE1BQU1ELG1CQUFtQmxCLG9CQUFxQkMsU0FBU0M7NEJBQ3ZELE9BQU9jLGlCQUFrQmQsS0FBS21DLEtBQUssQ0FBQ0gsSUFBSSxFQUFFaEIsa0JBQWtCQzt3QkFDOUQ7b0JBQ0Y7Z0JBQ0Y7WUFDRjtRQUNGO0lBQ0Y7QUFDRiJ9