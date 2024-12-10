// Copyright 2015-2024, University of Colorado Boulder
/* eslint-disable phet/bad-typescript-text */ /* eslint-disable phet/explicit-method-return-type */ //@ts-nocheck
/**
 * Given the AST output from Esprima for a JS file that conforms to PhET's style, this extracts the documentation and
 * returns a structured object containing all of the documentation.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ /**
 * Given esprima's block comment string value, strip off the leading spaces, a star, and up to one other space.
 *
 * Thus given input:
 * var string = '*\n' + // leading star from the JSDoc style
 *              '   * Some code:\n' +
 *              '   * function something() {\n' +
 *              '   *   console.log( boo );\n' +
 *              '   * }\n' +
 *              '   ';
 *
 * will have the output:
 * var output = '\n' +
 *              'Some code:\n' +
 *              'function something() {\n' +
 *              '  console.log( boo );\n' + // keeps remaining spaces for indentation
 *              '}\n' +
 *              '' +
 *
 * @param {string} string
 * @returns {string}
 */ function destarBlockComment(string) {
    return string.split('\n').map((line)=>{
        let destarred = line.replace(/^ *\* ?/, '');
        // If the line is effectively empty (composed of only spaces), set it to the empty string.
        if (destarred.replace(/ /g, '').length === 0) {
            destarred = '';
        }
        return destarred;
    }).join('\n');
}
/**
 * Removes leading/trailing blank lines, and consolidates consecutive blank lines into one blank line.
 * @private
 *
 * Thus for input: '\nFoo\n\nBar\n', the output would be 'Foo\nBar'
 *
 * @param {string} string
 * @returns {string}
 */ function trimLines(string) {
    const lines = string.split('\n');
    // remove consecutive blank lines
    for(let i = lines.length - 1; i >= 1; i--){
        if (lines[i].length === 0 && lines[i - 1].length === 0) {
            lines.splice(i, 1);
        }
    }
    // remove leading blank lines
    while(lines.length && lines[0].length === 0){
        lines.shift();
    }
    // remove trailing blank lines
    while(lines.length && lines[lines.length - 1].length === 0){
        lines.pop();
    }
    return lines.join('\n');
}
/**
 * Given a type string, e.g. '{number}', this should convert it into the desired type format.
 * @private
 *
 * @param {string} typeString
 * @returns {?}
 */ function parseType(typeString) {
    // For now, get rid of the brackets
    typeString = typeString.slice(1, typeString.length - 1);
    // for ( var i = 0; i < line.length; i++ ) {
    // TODO: handle |, {}, etc. https://github.com/phetsims/chipper/issues/411
    // }
    return typeString;
}
/**
 * Parses type-documentation lines that would be used with jsdoc params, etc., such as:
 * @private
 *
 * '{number} ratio - The ratio for something' parses to (with hasName = true):
 * {
 *   type: 'number', // result of parseType on '{number}'
 *   name: 'ratio',
 *   description: 'The ratio for something'
 * }
 *
 * '{number} The ratio for something' parses to (with hasName = false):
 * {
 *   type: 'number',
 *   description: 'The ratio for something'
 * }
 *
 * @param {string} line
 * @param {boolean} hasName
 * @returns {Object}
 */ function splitTypeDocLine(line, hasName) {
    let braceCount = 0;
    for(let i = 0; i < line.length; i++){
        if (line[i] === '{') {
            braceCount++;
        } else if (line[i] === '}') {
            braceCount--;
            // If we have matched the first brace, parse the type, check for a name, and return the rest as a description.
            if (braceCount === 0) {
                const endOfType = i + 1;
                const type = line.slice(0, endOfType);
                const rest = line.slice(endOfType + 1);
                let name;
                let description;
                if (hasName) {
                    const spaceIndex = rest.indexOf(' ');
                    if (spaceIndex < 0) {
                        // all name
                        name = rest;
                    } else {
                        // has a space
                        name = rest.slice(0, spaceIndex);
                        description = rest.slice(spaceIndex + 1);
                    }
                } else {
                    description = line.slice(endOfType + 1);
                }
                const result = {
                    type: parseType(type)
                };
                if (name) {
                    if (name.charAt(0) === '[') {
                        result.optional = true;
                        name = name.slice(1, name.length - 1);
                    }
                    result.name = name;
                }
                if (description) {
                    result.description = description.replace(/^ *(- )?/, '');
                }
                return result;
            }
        }
    }
    return {
        type: parseType(line)
    };
}
/**
 * Parses a de-starred block comment (destarBlockComment output), extracting JSDoc-style tags. The rest is called the
 * description, which has blank linkes trimmed.
 * @private
 *
 * If a line has a JSDoc-style tag, consecutive lines afterwards that are indented will be included for that tag.
 *
 * Returns object like:
 * {
 *   description: {string}, // everything that isn't JSDoc-style tags
 *   [visibility]: {string}, // if it exists, one of 'public', 'private' or 'internal'
 *   [parameters]: {Array.<{ type: {?}, name: {string}, description: {string} }>}, // array of parsed parameters
 *   [returns]: { type: {?}, description: {string} }, // return tag
 *   [constant]: { type: {?}, name: {string}, description: {string} }, // constant tag
 *   [constructor]: true, // if the constructor tag is included
 *   [jsdoc]: {Array.<string>} // any unrecognized jsdoc tag lines
 * }
 *
 * @param {string} string
 * @returns {Object}
 */ function parseBlockDoc(string) {
    let result = {};
    const descriptionLines = [];
    const jsdocLines = [];
    const lines = string.split('\n');
    for(let i = 0; i < lines.length; i++){
        let line = lines[i];
        if (line.charAt(0) === '@') {
            for(let j = i + 1; j < lines.length; j++){
                const nextLine = lines[j];
                if (nextLine.charAt(0) === ' ') {
                    // strip out all but one space, and concatenate
                    line = line + nextLine.replace(/^ +/, ' ');
                    // we handled the line
                    i++;
                } else {
                    break;
                }
            }
            jsdocLines.push(line);
        } else {
            descriptionLines.push(line);
        }
    }
    result = {
        description: trimLines(descriptionLines.join('\n'))
    };
    for(let k = jsdocLines.length - 1; k >= 0; k--){
        const jsdocLine = jsdocLines[k];
        if (jsdocLine.indexOf('@public') === 0) {
            if (jsdocLine.indexOf('internal') === 0) {
                result.visibility = 'internal';
            } else {
                result.visibility = 'public';
            }
            jsdocLines.splice(k, 1);
        } else if (jsdocLine.indexOf('@private') === 0) {
            result.visibility = 'private';
            jsdocLines.splice(k, 1);
        } else if (jsdocLine.indexOf('@param ') === 0) {
            result.parameters = result.parameters || [];
            result.parameters.unshift(splitTypeDocLine(jsdocLine.slice('@param '.length), true));
            jsdocLines.splice(k, 1);
        } else if (jsdocLine.indexOf('@returns ') === 0) {
            result.returns = splitTypeDocLine(jsdocLine.slice('@returns '.length), false);
            jsdocLines.splice(k, 1);
        } else if (jsdocLine.indexOf('@constant ') === 0) {
            result.constant = splitTypeDocLine(jsdocLine.slice('@constant '.length), true);
            jsdocLines.splice(k, 1);
        } else if (jsdocLine.indexOf('@constructor') === 0) {
            result.constructor = true;
            jsdocLines.splice(k, 1);
        }
    }
    if (jsdocLines.length) {
        result.jsdoc = jsdocLines;
    }
    return result;
}
/**
 * Similar to parseBlockDoc, but for line comments. Returns null for comments without visibility.
 * @private
 *
 * A few line styles that are supported:
 *
 * %public {number} - Some comment
 * Will parse to: { visibility: 'public', type: 'number', description: 'Some comment' }
 *
 * %public (dot-internal) This has no type or dash
 * Will parse to: { visibility: 'internal', description: 'This has no type or dash' }
 *
 * @param {string} string
 * @returns {Object}
 */ function parseLineDoc(string) {
    let visibility;
    // Strip visibility tags, recording the visibility
    if (string.indexOf('@public') >= 0) {
        if (string.indexOf('-internal)') >= 0) {
            visibility = 'internal';
            string = string.replace('/@public.*-internal)', '');
        } else {
            visibility = 'public';
            string = string.replace('@public', '');
        }
    }
    if (string.indexOf('@private') >= 0) {
        visibility = 'private';
        string = string.replace('@private', '');
    }
    // Strip leading spaces
    string = string.replace(/^ +/, '');
    // Ignore things without visibility
    if (!visibility) {
        return null;
    }
    // Assume leading '{' is for a type
    if (/^ *{/.test(string)) {
        const result = splitTypeDocLine(string, false);
        result.visibility = visibility;
        return result;
    }
    return {
        visibility: visibility,
        description: string.replace(/^ */, '').replace(/ *$/, '')
    };
}
/**
 * Extracts a documentation object (parseLineDoc/parseBlockDoc) from an Esprima AST node. Typically looks at the last
 * leading block comment if available, then the last leading public line comment.
 * @private
 *
 * Returns null if there is no suitable documentation.
 *
 * @param {Object} node - From the Esprima AST
 * @returns {Object} See parseLineDoc/parseBlockDoc for type information.
 */ function extractDocFromNode(node) {
    function blockCommentFilter(comment) {
        return comment.type === 'Block' && comment.value.charAt(0) === '*';
    }
    function lineCommentFilter(comment) {
        return comment.type === 'Line' && comment.value.indexOf('@public') >= 0;
    }
    let lineComments = [];
    if (node.leadingComments) {
        const blockComments = node.leadingComments.filter(blockCommentFilter);
        if (blockComments.length) {
            return parseBlockDoc(destarBlockComment(blockComments[blockComments.length - 1].value));
        } else {
            lineComments = lineComments.concat(node.leadingComments.filter(lineCommentFilter));
        }
    }
    // NOTE: trailing comments were also recognized as leading comments for consecutive this.<prop> definitions.
    // Stripped out for now.
    // if ( node.trailingComments ) {
    //   lineComments = lineComments.concat( node.trailingComments.filter( lineCommentFilter ) );
    // }
    if (lineComments.length) {
        const comment = lineComments[lineComments.length - 1];
        return parseLineDoc(comment.value.replace(/^ /, '')); // strip off a single leading space
    }
    return null;
}
function isCapitalized(string) {
    return string.charAt(0) === string.charAt(0).toUpperCase();
}
function capitalize(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}
/**
 * Whether an esprima-parsed AST represents an assigment to an identifier on 'this', e.g.:
 * this.something = ...;
 * @private
 *
 * @param {Object} expr
 * @returns {boolean}
 */ function isSimpleThisAssignment(expr) {
    return expr.type === 'AssignmentExpression' && expr.left.type === 'MemberExpression' && expr.left.object.type === 'ThisExpression' && expr.left.property.type === 'Identifier';
}
// e.g. console.log( JSON.stringify( extractDocumentation( program ), null, 2 ) );
function extractDocumentation(program) {
    const doc = {};
    function parseTypeExpression(typeStatement, typeExpression, name, parentName) {
        const typeDoc = {
            comment: extractDocFromNode(typeStatement),
            instanceProperties: [],
            staticProperties: [],
            constructorProperties: [],
            supertype: null,
            type: 'type',
            name: name
        };
        if (parentName) {
            typeDoc.parentName = parentName;
        }
        const constructorStatements = typeExpression.body.body; // statements in the constructor function body
        constructorStatements.forEach((constructorStatement)=>{
            if (constructorStatement.type === 'ExpressionStatement') {
                if (isSimpleThisAssignment(constructorStatement.expression)) {
                    const comment = extractDocFromNode(constructorStatement);
                    if (comment) {
                        comment.name = constructorStatement.expression.left.property.name;
                        typeDoc.constructorProperties.push(comment);
                    }
                }
            }
        });
        return typeDoc;
    }
    function parseStaticProperty(property) {
        const key = property.key.name;
        // TODO: support static constants? https://github.com/phetsims/chipper/issues/411
        if (property.value.type === 'FunctionExpression') {
            const staticDoc = extractDocFromNode(property);
            if (staticDoc) {
                staticDoc.type = 'function';
                staticDoc.name = key;
                return staticDoc;
            }
        }
        return null;
    }
    /**
   * @param expression
   * @returns {null|Object}
   */ function parseInherit(expression) {
        const supertype = expression.arguments[0].name;
        const subtype = expression.arguments[1].name;
        // If we haven't caught the constructor/type declaration, skip the inherit parsing
        if (!doc[subtype]) {
            return null;
        }
        // Assign the supertype on the subtype
        doc[subtype].supertype = supertype;
        // Instance (prototype) properties
        if (expression.arguments.length >= 3) {
            const instanceProperties = expression.arguments[2].properties;
            // For-iteration, so we can skip some items by incrementing i.
            for(let i = 0; i < instanceProperties.length; i++){
                const property = instanceProperties[i];
                const key = property.key.name;
                if (property.value.type === 'FunctionExpression') {
                    if (doc[subtype]) {
                        const instanceDoc = extractDocFromNode(property);
                        if (instanceDoc) {
                            // Check to see if we have an ES5 getter/setter defined below
                            if (i + 1 < instanceProperties.length) {
                                const nextProperty = instanceProperties[i + 1];
                                const nextExpression = nextProperty.value;
                                if (nextExpression.type === 'FunctionExpression') {
                                    const nextKey = nextProperty.key.name;
                                    const capitalizedNextName = capitalize(nextKey);
                                    if (nextProperty.kind === 'get' && `get${capitalizedNextName}` === key || `is${capitalizedNextName}` === key) {
                                        // Skip processing the ES5 getter next
                                        i++;
                                        instanceDoc.name = nextKey;
                                        instanceDoc.explicitGetName = key;
                                    } else if (nextProperty.kind === 'set' && `set${capitalizedNextName}` === key) {
                                        // Skip processing the ES5 setter next
                                        i++;
                                        instanceDoc.name = nextKey;
                                        instanceDoc.explicitSetName = key;
                                    }
                                }
                            }
                            instanceDoc.type = 'function';
                            instanceDoc.name = instanceDoc.name || key;
                            doc[subtype].instanceProperties.push(instanceDoc);
                        }
                    }
                }
            }
        }
        // Static (constructor) properties
        if (expression.arguments.length >= 4) {
            const staticProperties = expression.arguments[3].properties;
            staticProperties.forEach((property)=>{
                const staticDoc = parseStaticProperty(property);
                if (doc[subtype] && staticDoc) {
                    doc[subtype].staticProperties.push(staticDoc);
                }
            });
        }
        return doc[subtype];
    }
    // Dig into require structure
    const mainStatements = program.body[0].expression.arguments[0].body.body;
    doc.topLevelComment = extractDocFromNode(program.body[0]);
    for(let i = 0; i < mainStatements.length; i++){
        const topLevelStatement = mainStatements[i];
        // Top-level capitalized function declaration? Parse it as a Type
        if (topLevelStatement.type === 'FunctionDeclaration' && isCapitalized(topLevelStatement.id.name)) {
            const typeName = topLevelStatement.id.name;
            doc[typeName] = parseTypeExpression(topLevelStatement, topLevelStatement, typeName, null);
        } else if (topLevelStatement.type === 'ExpressionStatement') {
            const expression = topLevelStatement.expression;
            // Call to inherit()
            if (expression.type === 'CallExpression' && expression.callee.name === 'inherit') {
                parseInherit(expression);
            } else if (expression.type === 'AssignmentExpression' && expression.left.type === 'MemberExpression') {
                const comment = extractDocFromNode(topLevelStatement);
                if (comment && expression.left.object.type === 'Identifier' && expression.left.property.type === 'Identifier' && doc[expression.left.object.name]) {
                    const innerName = expression.left.property.name;
                    let type;
                    // Inner Type, e.g. BinPacker.Bin = function Bin( ... ) { ... };
                    if (expression.right.type === 'FunctionExpression' && isCapitalized(innerName)) {
                        doc[innerName] = parseTypeExpression(topLevelStatement, expression.right, innerName, expression.left.object.name);
                    } else {
                        if (expression.right.type === 'FunctionExpression') {
                            type = 'function';
                        } else {
                            type = 'constant';
                        }
                        comment.type = type;
                        comment.name = expression.left.property.name;
                        doc[expression.left.object.name].staticProperties.push(comment);
                    }
                }
            }
        } else if (topLevelStatement.type === 'VariableDeclaration' && topLevelStatement.declarations[0].type === 'VariableDeclarator' && topLevelStatement.declarations[0].init && topLevelStatement.declarations[0].init.type === 'ObjectExpression' && isCapitalized(topLevelStatement.declarations[0].id.name)) {
            const objectName = topLevelStatement.declarations[0].id.name;
            doc[objectName] = {
                comment: extractDocFromNode(topLevelStatement),
                properties: [],
                type: 'object',
                name: objectName
            };
            // Process properties in the object
            topLevelStatement.declarations[0].init.properties.forEach((property)=>{
                const staticDoc = parseStaticProperty(property);
                if (staticDoc) {
                    doc[objectName].properties.push(staticDoc);
                }
            });
        }
    }
    return doc;
}
export default extractDocumentation;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2pzL2NvbW1vbi9leHRyYWN0RG9jdW1lbnRhdGlvbi50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNS0yMDI0LCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuLyogZXNsaW50LWRpc2FibGUgcGhldC9iYWQtdHlwZXNjcmlwdC10ZXh0ICovXG4vKiBlc2xpbnQtZGlzYWJsZSBwaGV0L2V4cGxpY2l0LW1ldGhvZC1yZXR1cm4tdHlwZSAqL1xuLy9AdHMtbm9jaGVja1xuXG5cbi8qKlxuICogR2l2ZW4gdGhlIEFTVCBvdXRwdXQgZnJvbSBFc3ByaW1hIGZvciBhIEpTIGZpbGUgdGhhdCBjb25mb3JtcyB0byBQaEVUJ3Mgc3R5bGUsIHRoaXMgZXh0cmFjdHMgdGhlIGRvY3VtZW50YXRpb24gYW5kXG4gKiByZXR1cm5zIGEgc3RydWN0dXJlZCBvYmplY3QgY29udGFpbmluZyBhbGwgb2YgdGhlIGRvY3VtZW50YXRpb24uXG4gKlxuICogQGF1dGhvciBKb25hdGhhbiBPbHNvbiA8am9uYXRoYW4ub2xzb25AY29sb3JhZG8uZWR1PlxuICovXG5cbi8qKlxuICogR2l2ZW4gZXNwcmltYSdzIGJsb2NrIGNvbW1lbnQgc3RyaW5nIHZhbHVlLCBzdHJpcCBvZmYgdGhlIGxlYWRpbmcgc3BhY2VzLCBhIHN0YXIsIGFuZCB1cCB0byBvbmUgb3RoZXIgc3BhY2UuXG4gKlxuICogVGh1cyBnaXZlbiBpbnB1dDpcbiAqIHZhciBzdHJpbmcgPSAnKlxcbicgKyAvLyBsZWFkaW5nIHN0YXIgZnJvbSB0aGUgSlNEb2Mgc3R5bGVcbiAqICAgICAgICAgICAgICAnICAgKiBTb21lIGNvZGU6XFxuJyArXG4gKiAgICAgICAgICAgICAgJyAgICogZnVuY3Rpb24gc29tZXRoaW5nKCkge1xcbicgK1xuICogICAgICAgICAgICAgICcgICAqICAgY29uc29sZS5sb2coIGJvbyApO1xcbicgK1xuICogICAgICAgICAgICAgICcgICAqIH1cXG4nICtcbiAqICAgICAgICAgICAgICAnICAgJztcbiAqXG4gKiB3aWxsIGhhdmUgdGhlIG91dHB1dDpcbiAqIHZhciBvdXRwdXQgPSAnXFxuJyArXG4gKiAgICAgICAgICAgICAgJ1NvbWUgY29kZTpcXG4nICtcbiAqICAgICAgICAgICAgICAnZnVuY3Rpb24gc29tZXRoaW5nKCkge1xcbicgK1xuICogICAgICAgICAgICAgICcgIGNvbnNvbGUubG9nKCBib28gKTtcXG4nICsgLy8ga2VlcHMgcmVtYWluaW5nIHNwYWNlcyBmb3IgaW5kZW50YXRpb25cbiAqICAgICAgICAgICAgICAnfVxcbicgK1xuICogICAgICAgICAgICAgICcnICtcbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gc3RyaW5nXG4gKiBAcmV0dXJucyB7c3RyaW5nfVxuICovXG5mdW5jdGlvbiBkZXN0YXJCbG9ja0NvbW1lbnQoIHN0cmluZyApIHtcbiAgcmV0dXJuIHN0cmluZy5zcGxpdCggJ1xcbicgKS5tYXAoIGxpbmUgPT4ge1xuICAgIGxldCBkZXN0YXJyZWQgPSBsaW5lLnJlcGxhY2UoIC9eICpcXCogPy8sICcnICk7XG5cbiAgICAvLyBJZiB0aGUgbGluZSBpcyBlZmZlY3RpdmVseSBlbXB0eSAoY29tcG9zZWQgb2Ygb25seSBzcGFjZXMpLCBzZXQgaXQgdG8gdGhlIGVtcHR5IHN0cmluZy5cbiAgICBpZiAoIGRlc3RhcnJlZC5yZXBsYWNlKCAvIC9nLCAnJyApLmxlbmd0aCA9PT0gMCApIHtcbiAgICAgIGRlc3RhcnJlZCA9ICcnO1xuICAgIH1cbiAgICByZXR1cm4gZGVzdGFycmVkO1xuICB9ICkuam9pbiggJ1xcbicgKTtcbn1cblxuLyoqXG4gKiBSZW1vdmVzIGxlYWRpbmcvdHJhaWxpbmcgYmxhbmsgbGluZXMsIGFuZCBjb25zb2xpZGF0ZXMgY29uc2VjdXRpdmUgYmxhbmsgbGluZXMgaW50byBvbmUgYmxhbmsgbGluZS5cbiAqIEBwcml2YXRlXG4gKlxuICogVGh1cyBmb3IgaW5wdXQ6ICdcXG5Gb29cXG5cXG5CYXJcXG4nLCB0aGUgb3V0cHV0IHdvdWxkIGJlICdGb29cXG5CYXInXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IHN0cmluZ1xuICogQHJldHVybnMge3N0cmluZ31cbiAqL1xuZnVuY3Rpb24gdHJpbUxpbmVzKCBzdHJpbmcgKSB7XG4gIGNvbnN0IGxpbmVzID0gc3RyaW5nLnNwbGl0KCAnXFxuJyApO1xuXG4gIC8vIHJlbW92ZSBjb25zZWN1dGl2ZSBibGFuayBsaW5lc1xuICBmb3IgKCBsZXQgaSA9IGxpbmVzLmxlbmd0aCAtIDE7IGkgPj0gMTsgaS0tICkge1xuICAgIGlmICggbGluZXNbIGkgXS5sZW5ndGggPT09IDAgJiYgbGluZXNbIGkgLSAxIF0ubGVuZ3RoID09PSAwICkge1xuICAgICAgbGluZXMuc3BsaWNlKCBpLCAxICk7XG4gICAgfVxuICB9XG5cbiAgLy8gcmVtb3ZlIGxlYWRpbmcgYmxhbmsgbGluZXNcbiAgd2hpbGUgKCBsaW5lcy5sZW5ndGggJiYgbGluZXNbIDAgXS5sZW5ndGggPT09IDAgKSB7XG4gICAgbGluZXMuc2hpZnQoKTtcbiAgfVxuXG4gIC8vIHJlbW92ZSB0cmFpbGluZyBibGFuayBsaW5lc1xuICB3aGlsZSAoIGxpbmVzLmxlbmd0aCAmJiBsaW5lc1sgbGluZXMubGVuZ3RoIC0gMSBdLmxlbmd0aCA9PT0gMCApIHtcbiAgICBsaW5lcy5wb3AoKTtcbiAgfVxuICByZXR1cm4gbGluZXMuam9pbiggJ1xcbicgKTtcbn1cblxuLyoqXG4gKiBHaXZlbiBhIHR5cGUgc3RyaW5nLCBlLmcuICd7bnVtYmVyfScsIHRoaXMgc2hvdWxkIGNvbnZlcnQgaXQgaW50byB0aGUgZGVzaXJlZCB0eXBlIGZvcm1hdC5cbiAqIEBwcml2YXRlXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IHR5cGVTdHJpbmdcbiAqIEByZXR1cm5zIHs/fVxuICovXG5mdW5jdGlvbiBwYXJzZVR5cGUoIHR5cGVTdHJpbmcgKSB7XG4gIC8vIEZvciBub3csIGdldCByaWQgb2YgdGhlIGJyYWNrZXRzXG4gIHR5cGVTdHJpbmcgPSB0eXBlU3RyaW5nLnNsaWNlKCAxLCB0eXBlU3RyaW5nLmxlbmd0aCAtIDEgKTtcblxuICAvLyBmb3IgKCB2YXIgaSA9IDA7IGkgPCBsaW5lLmxlbmd0aDsgaSsrICkge1xuICAvLyBUT0RPOiBoYW5kbGUgfCwge30sIGV0Yy4gaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2NoaXBwZXIvaXNzdWVzLzQxMVxuICAvLyB9XG5cbiAgcmV0dXJuIHR5cGVTdHJpbmc7XG59XG5cbi8qKlxuICogUGFyc2VzIHR5cGUtZG9jdW1lbnRhdGlvbiBsaW5lcyB0aGF0IHdvdWxkIGJlIHVzZWQgd2l0aCBqc2RvYyBwYXJhbXMsIGV0Yy4sIHN1Y2ggYXM6XG4gKiBAcHJpdmF0ZVxuICpcbiAqICd7bnVtYmVyfSByYXRpbyAtIFRoZSByYXRpbyBmb3Igc29tZXRoaW5nJyBwYXJzZXMgdG8gKHdpdGggaGFzTmFtZSA9IHRydWUpOlxuICoge1xuICogICB0eXBlOiAnbnVtYmVyJywgLy8gcmVzdWx0IG9mIHBhcnNlVHlwZSBvbiAne251bWJlcn0nXG4gKiAgIG5hbWU6ICdyYXRpbycsXG4gKiAgIGRlc2NyaXB0aW9uOiAnVGhlIHJhdGlvIGZvciBzb21ldGhpbmcnXG4gKiB9XG4gKlxuICogJ3tudW1iZXJ9IFRoZSByYXRpbyBmb3Igc29tZXRoaW5nJyBwYXJzZXMgdG8gKHdpdGggaGFzTmFtZSA9IGZhbHNlKTpcbiAqIHtcbiAqICAgdHlwZTogJ251bWJlcicsXG4gKiAgIGRlc2NyaXB0aW9uOiAnVGhlIHJhdGlvIGZvciBzb21ldGhpbmcnXG4gKiB9XG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IGxpbmVcbiAqIEBwYXJhbSB7Ym9vbGVhbn0gaGFzTmFtZVxuICogQHJldHVybnMge09iamVjdH1cbiAqL1xuZnVuY3Rpb24gc3BsaXRUeXBlRG9jTGluZSggbGluZSwgaGFzTmFtZSApIHtcbiAgbGV0IGJyYWNlQ291bnQgPSAwO1xuICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBsaW5lLmxlbmd0aDsgaSsrICkge1xuICAgIGlmICggbGluZVsgaSBdID09PSAneycgKSB7XG4gICAgICBicmFjZUNvdW50Kys7XG4gICAgfVxuICAgIGVsc2UgaWYgKCBsaW5lWyBpIF0gPT09ICd9JyApIHtcbiAgICAgIGJyYWNlQ291bnQtLTtcblxuICAgICAgLy8gSWYgd2UgaGF2ZSBtYXRjaGVkIHRoZSBmaXJzdCBicmFjZSwgcGFyc2UgdGhlIHR5cGUsIGNoZWNrIGZvciBhIG5hbWUsIGFuZCByZXR1cm4gdGhlIHJlc3QgYXMgYSBkZXNjcmlwdGlvbi5cbiAgICAgIGlmICggYnJhY2VDb3VudCA9PT0gMCApIHtcbiAgICAgICAgY29uc3QgZW5kT2ZUeXBlID0gaSArIDE7XG4gICAgICAgIGNvbnN0IHR5cGUgPSBsaW5lLnNsaWNlKCAwLCBlbmRPZlR5cGUgKTtcbiAgICAgICAgY29uc3QgcmVzdCA9IGxpbmUuc2xpY2UoIGVuZE9mVHlwZSArIDEgKTtcbiAgICAgICAgbGV0IG5hbWU7XG4gICAgICAgIGxldCBkZXNjcmlwdGlvbjtcbiAgICAgICAgaWYgKCBoYXNOYW1lICkge1xuICAgICAgICAgIGNvbnN0IHNwYWNlSW5kZXggPSByZXN0LmluZGV4T2YoICcgJyApO1xuICAgICAgICAgIGlmICggc3BhY2VJbmRleCA8IDAgKSB7XG4gICAgICAgICAgICAvLyBhbGwgbmFtZVxuICAgICAgICAgICAgbmFtZSA9IHJlc3Q7XG4gICAgICAgICAgfVxuICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgLy8gaGFzIGEgc3BhY2VcbiAgICAgICAgICAgIG5hbWUgPSByZXN0LnNsaWNlKCAwLCBzcGFjZUluZGV4ICk7XG4gICAgICAgICAgICBkZXNjcmlwdGlvbiA9IHJlc3Quc2xpY2UoIHNwYWNlSW5kZXggKyAxICk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgIGRlc2NyaXB0aW9uID0gbGluZS5zbGljZSggZW5kT2ZUeXBlICsgMSApO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IHtcbiAgICAgICAgICB0eXBlOiBwYXJzZVR5cGUoIHR5cGUgKVxuICAgICAgICB9O1xuICAgICAgICBpZiAoIG5hbWUgKSB7XG4gICAgICAgICAgaWYgKCBuYW1lLmNoYXJBdCggMCApID09PSAnWycgKSB7XG4gICAgICAgICAgICByZXN1bHQub3B0aW9uYWwgPSB0cnVlO1xuICAgICAgICAgICAgbmFtZSA9IG5hbWUuc2xpY2UoIDEsIG5hbWUubGVuZ3RoIC0gMSApO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXN1bHQubmFtZSA9IG5hbWU7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCBkZXNjcmlwdGlvbiApIHtcbiAgICAgICAgICByZXN1bHQuZGVzY3JpcHRpb24gPSBkZXNjcmlwdGlvbi5yZXBsYWNlKCAvXiAqKC0gKT8vLCAnJyApO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICB9XG4gICAgfVxuICB9XG4gIHJldHVybiB7XG4gICAgdHlwZTogcGFyc2VUeXBlKCBsaW5lIClcbiAgfTtcbn1cblxuLyoqXG4gKiBQYXJzZXMgYSBkZS1zdGFycmVkIGJsb2NrIGNvbW1lbnQgKGRlc3RhckJsb2NrQ29tbWVudCBvdXRwdXQpLCBleHRyYWN0aW5nIEpTRG9jLXN0eWxlIHRhZ3MuIFRoZSByZXN0IGlzIGNhbGxlZCB0aGVcbiAqIGRlc2NyaXB0aW9uLCB3aGljaCBoYXMgYmxhbmsgbGlua2VzIHRyaW1tZWQuXG4gKiBAcHJpdmF0ZVxuICpcbiAqIElmIGEgbGluZSBoYXMgYSBKU0RvYy1zdHlsZSB0YWcsIGNvbnNlY3V0aXZlIGxpbmVzIGFmdGVyd2FyZHMgdGhhdCBhcmUgaW5kZW50ZWQgd2lsbCBiZSBpbmNsdWRlZCBmb3IgdGhhdCB0YWcuXG4gKlxuICogUmV0dXJucyBvYmplY3QgbGlrZTpcbiAqIHtcbiAqICAgZGVzY3JpcHRpb246IHtzdHJpbmd9LCAvLyBldmVyeXRoaW5nIHRoYXQgaXNuJ3QgSlNEb2Mtc3R5bGUgdGFnc1xuICogICBbdmlzaWJpbGl0eV06IHtzdHJpbmd9LCAvLyBpZiBpdCBleGlzdHMsIG9uZSBvZiAncHVibGljJywgJ3ByaXZhdGUnIG9yICdpbnRlcm5hbCdcbiAqICAgW3BhcmFtZXRlcnNdOiB7QXJyYXkuPHsgdHlwZTogez99LCBuYW1lOiB7c3RyaW5nfSwgZGVzY3JpcHRpb246IHtzdHJpbmd9IH0+fSwgLy8gYXJyYXkgb2YgcGFyc2VkIHBhcmFtZXRlcnNcbiAqICAgW3JldHVybnNdOiB7IHR5cGU6IHs/fSwgZGVzY3JpcHRpb246IHtzdHJpbmd9IH0sIC8vIHJldHVybiB0YWdcbiAqICAgW2NvbnN0YW50XTogeyB0eXBlOiB7P30sIG5hbWU6IHtzdHJpbmd9LCBkZXNjcmlwdGlvbjoge3N0cmluZ30gfSwgLy8gY29uc3RhbnQgdGFnXG4gKiAgIFtjb25zdHJ1Y3Rvcl06IHRydWUsIC8vIGlmIHRoZSBjb25zdHJ1Y3RvciB0YWcgaXMgaW5jbHVkZWRcbiAqICAgW2pzZG9jXToge0FycmF5LjxzdHJpbmc+fSAvLyBhbnkgdW5yZWNvZ25pemVkIGpzZG9jIHRhZyBsaW5lc1xuICogfVxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBzdHJpbmdcbiAqIEByZXR1cm5zIHtPYmplY3R9XG4gKi9cbmZ1bmN0aW9uIHBhcnNlQmxvY2tEb2MoIHN0cmluZyApIHtcbiAgbGV0IHJlc3VsdCA9IHt9O1xuXG4gIGNvbnN0IGRlc2NyaXB0aW9uTGluZXMgPSBbXTtcbiAgY29uc3QganNkb2NMaW5lcyA9IFtdO1xuXG4gIGNvbnN0IGxpbmVzID0gc3RyaW5nLnNwbGl0KCAnXFxuJyApO1xuICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBsaW5lcy5sZW5ndGg7IGkrKyApIHtcbiAgICBsZXQgbGluZSA9IGxpbmVzWyBpIF07XG4gICAgaWYgKCBsaW5lLmNoYXJBdCggMCApID09PSAnQCcgKSB7XG4gICAgICBmb3IgKCBsZXQgaiA9IGkgKyAxOyBqIDwgbGluZXMubGVuZ3RoOyBqKysgKSB7XG4gICAgICAgIGNvbnN0IG5leHRMaW5lID0gbGluZXNbIGogXTtcbiAgICAgICAgaWYgKCBuZXh0TGluZS5jaGFyQXQoIDAgKSA9PT0gJyAnICkge1xuICAgICAgICAgIC8vIHN0cmlwIG91dCBhbGwgYnV0IG9uZSBzcGFjZSwgYW5kIGNvbmNhdGVuYXRlXG4gICAgICAgICAgbGluZSA9IGxpbmUgKyBuZXh0TGluZS5yZXBsYWNlKCAvXiArLywgJyAnICk7XG5cbiAgICAgICAgICAvLyB3ZSBoYW5kbGVkIHRoZSBsaW5lXG4gICAgICAgICAgaSsrO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBqc2RvY0xpbmVzLnB1c2goIGxpbmUgKTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICBkZXNjcmlwdGlvbkxpbmVzLnB1c2goIGxpbmUgKTtcbiAgICB9XG4gIH1cblxuICByZXN1bHQgPSB7XG4gICAgZGVzY3JpcHRpb246IHRyaW1MaW5lcyggZGVzY3JpcHRpb25MaW5lcy5qb2luKCAnXFxuJyApIClcbiAgfTtcblxuICBmb3IgKCBsZXQgayA9IGpzZG9jTGluZXMubGVuZ3RoIC0gMTsgayA+PSAwOyBrLS0gKSB7XG4gICAgY29uc3QganNkb2NMaW5lID0ganNkb2NMaW5lc1sgayBdO1xuICAgIGlmICgganNkb2NMaW5lLmluZGV4T2YoICdAcHVibGljJyApID09PSAwICkge1xuICAgICAgaWYgKCBqc2RvY0xpbmUuaW5kZXhPZiggJ2ludGVybmFsJyApID09PSAwICkge1xuICAgICAgICByZXN1bHQudmlzaWJpbGl0eSA9ICdpbnRlcm5hbCc7XG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgcmVzdWx0LnZpc2liaWxpdHkgPSAncHVibGljJztcbiAgICAgIH1cbiAgICAgIGpzZG9jTGluZXMuc3BsaWNlKCBrLCAxICk7XG4gICAgfVxuICAgIGVsc2UgaWYgKCBqc2RvY0xpbmUuaW5kZXhPZiggJ0Bwcml2YXRlJyApID09PSAwICkge1xuICAgICAgcmVzdWx0LnZpc2liaWxpdHkgPSAncHJpdmF0ZSc7XG4gICAgICBqc2RvY0xpbmVzLnNwbGljZSggaywgMSApO1xuICAgIH1cbiAgICBlbHNlIGlmICgganNkb2NMaW5lLmluZGV4T2YoICdAcGFyYW0gJyApID09PSAwICkge1xuICAgICAgcmVzdWx0LnBhcmFtZXRlcnMgPSByZXN1bHQucGFyYW1ldGVycyB8fCBbXTtcbiAgICAgIHJlc3VsdC5wYXJhbWV0ZXJzLnVuc2hpZnQoIHNwbGl0VHlwZURvY0xpbmUoIGpzZG9jTGluZS5zbGljZSggJ0BwYXJhbSAnLmxlbmd0aCApLCB0cnVlICkgKTtcbiAgICAgIGpzZG9jTGluZXMuc3BsaWNlKCBrLCAxICk7XG4gICAgfVxuICAgIGVsc2UgaWYgKCBqc2RvY0xpbmUuaW5kZXhPZiggJ0ByZXR1cm5zICcgKSA9PT0gMCApIHtcbiAgICAgIHJlc3VsdC5yZXR1cm5zID0gc3BsaXRUeXBlRG9jTGluZSgganNkb2NMaW5lLnNsaWNlKCAnQHJldHVybnMgJy5sZW5ndGggKSwgZmFsc2UgKTtcbiAgICAgIGpzZG9jTGluZXMuc3BsaWNlKCBrLCAxICk7XG4gICAgfVxuICAgIGVsc2UgaWYgKCBqc2RvY0xpbmUuaW5kZXhPZiggJ0Bjb25zdGFudCAnICkgPT09IDAgKSB7XG4gICAgICByZXN1bHQuY29uc3RhbnQgPSBzcGxpdFR5cGVEb2NMaW5lKCBqc2RvY0xpbmUuc2xpY2UoICdAY29uc3RhbnQgJy5sZW5ndGggKSwgdHJ1ZSApO1xuICAgICAganNkb2NMaW5lcy5zcGxpY2UoIGssIDEgKTtcbiAgICB9XG4gICAgZWxzZSBpZiAoIGpzZG9jTGluZS5pbmRleE9mKCAnQGNvbnN0cnVjdG9yJyApID09PSAwICkge1xuICAgICAgcmVzdWx0LmNvbnN0cnVjdG9yID0gdHJ1ZTtcbiAgICAgIGpzZG9jTGluZXMuc3BsaWNlKCBrLCAxICk7XG4gICAgfVxuICB9XG5cbiAgaWYgKCBqc2RvY0xpbmVzLmxlbmd0aCApIHtcbiAgICByZXN1bHQuanNkb2MgPSBqc2RvY0xpbmVzO1xuICB9XG5cbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxuLyoqXG4gKiBTaW1pbGFyIHRvIHBhcnNlQmxvY2tEb2MsIGJ1dCBmb3IgbGluZSBjb21tZW50cy4gUmV0dXJucyBudWxsIGZvciBjb21tZW50cyB3aXRob3V0IHZpc2liaWxpdHkuXG4gKiBAcHJpdmF0ZVxuICpcbiAqIEEgZmV3IGxpbmUgc3R5bGVzIHRoYXQgYXJlIHN1cHBvcnRlZDpcbiAqXG4gKiAlcHVibGljIHtudW1iZXJ9IC0gU29tZSBjb21tZW50XG4gKiBXaWxsIHBhcnNlIHRvOiB7IHZpc2liaWxpdHk6ICdwdWJsaWMnLCB0eXBlOiAnbnVtYmVyJywgZGVzY3JpcHRpb246ICdTb21lIGNvbW1lbnQnIH1cbiAqXG4gKiAlcHVibGljIChkb3QtaW50ZXJuYWwpIFRoaXMgaGFzIG5vIHR5cGUgb3IgZGFzaFxuICogV2lsbCBwYXJzZSB0bzogeyB2aXNpYmlsaXR5OiAnaW50ZXJuYWwnLCBkZXNjcmlwdGlvbjogJ1RoaXMgaGFzIG5vIHR5cGUgb3IgZGFzaCcgfVxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBzdHJpbmdcbiAqIEByZXR1cm5zIHtPYmplY3R9XG4gKi9cbmZ1bmN0aW9uIHBhcnNlTGluZURvYyggc3RyaW5nICkge1xuICBsZXQgdmlzaWJpbGl0eTtcblxuICAvLyBTdHJpcCB2aXNpYmlsaXR5IHRhZ3MsIHJlY29yZGluZyB0aGUgdmlzaWJpbGl0eVxuICBpZiAoIHN0cmluZy5pbmRleE9mKCAnQHB1YmxpYycgKSA+PSAwICkge1xuICAgIGlmICggc3RyaW5nLmluZGV4T2YoICctaW50ZXJuYWwpJyApID49IDAgKSB7XG4gICAgICB2aXNpYmlsaXR5ID0gJ2ludGVybmFsJztcbiAgICAgIHN0cmluZyA9IHN0cmluZy5yZXBsYWNlKCAnL0BwdWJsaWMuKi1pbnRlcm5hbCknLCAnJyApO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIHZpc2liaWxpdHkgPSAncHVibGljJztcbiAgICAgIHN0cmluZyA9IHN0cmluZy5yZXBsYWNlKCAnQHB1YmxpYycsICcnICk7XG4gICAgfVxuICB9XG4gIGlmICggc3RyaW5nLmluZGV4T2YoICdAcHJpdmF0ZScgKSA+PSAwICkge1xuICAgIHZpc2liaWxpdHkgPSAncHJpdmF0ZSc7XG4gICAgc3RyaW5nID0gc3RyaW5nLnJlcGxhY2UoICdAcHJpdmF0ZScsICcnICk7XG4gIH1cblxuICAvLyBTdHJpcCBsZWFkaW5nIHNwYWNlc1xuICBzdHJpbmcgPSBzdHJpbmcucmVwbGFjZSggL14gKy8sICcnICk7XG5cbiAgLy8gSWdub3JlIHRoaW5ncyB3aXRob3V0IHZpc2liaWxpdHlcbiAgaWYgKCAhdmlzaWJpbGl0eSApIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIC8vIEFzc3VtZSBsZWFkaW5nICd7JyBpcyBmb3IgYSB0eXBlXG4gIGlmICggL14gKnsvLnRlc3QoIHN0cmluZyApICkge1xuICAgIGNvbnN0IHJlc3VsdCA9IHNwbGl0VHlwZURvY0xpbmUoIHN0cmluZywgZmFsc2UgKTtcbiAgICByZXN1bHQudmlzaWJpbGl0eSA9IHZpc2liaWxpdHk7XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuXG4gIHJldHVybiB7XG4gICAgdmlzaWJpbGl0eTogdmlzaWJpbGl0eSxcbiAgICBkZXNjcmlwdGlvbjogc3RyaW5nLnJlcGxhY2UoIC9eICovLCAnJyApLnJlcGxhY2UoIC8gKiQvLCAnJyApXG4gIH07XG59XG5cbi8qKlxuICogRXh0cmFjdHMgYSBkb2N1bWVudGF0aW9uIG9iamVjdCAocGFyc2VMaW5lRG9jL3BhcnNlQmxvY2tEb2MpIGZyb20gYW4gRXNwcmltYSBBU1Qgbm9kZS4gVHlwaWNhbGx5IGxvb2tzIGF0IHRoZSBsYXN0XG4gKiBsZWFkaW5nIGJsb2NrIGNvbW1lbnQgaWYgYXZhaWxhYmxlLCB0aGVuIHRoZSBsYXN0IGxlYWRpbmcgcHVibGljIGxpbmUgY29tbWVudC5cbiAqIEBwcml2YXRlXG4gKlxuICogUmV0dXJucyBudWxsIGlmIHRoZXJlIGlzIG5vIHN1aXRhYmxlIGRvY3VtZW50YXRpb24uXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IG5vZGUgLSBGcm9tIHRoZSBFc3ByaW1hIEFTVFxuICogQHJldHVybnMge09iamVjdH0gU2VlIHBhcnNlTGluZURvYy9wYXJzZUJsb2NrRG9jIGZvciB0eXBlIGluZm9ybWF0aW9uLlxuICovXG5mdW5jdGlvbiBleHRyYWN0RG9jRnJvbU5vZGUoIG5vZGUgKSB7XG4gIGZ1bmN0aW9uIGJsb2NrQ29tbWVudEZpbHRlciggY29tbWVudCApIHtcbiAgICByZXR1cm4gY29tbWVudC50eXBlID09PSAnQmxvY2snICYmIGNvbW1lbnQudmFsdWUuY2hhckF0KCAwICkgPT09ICcqJztcbiAgfVxuXG4gIGZ1bmN0aW9uIGxpbmVDb21tZW50RmlsdGVyKCBjb21tZW50ICkge1xuICAgIHJldHVybiBjb21tZW50LnR5cGUgPT09ICdMaW5lJyAmJiBjb21tZW50LnZhbHVlLmluZGV4T2YoICdAcHVibGljJyApID49IDA7XG4gIH1cblxuICBsZXQgbGluZUNvbW1lbnRzID0gW107XG4gIGlmICggbm9kZS5sZWFkaW5nQ29tbWVudHMgKSB7XG4gICAgY29uc3QgYmxvY2tDb21tZW50cyA9IG5vZGUubGVhZGluZ0NvbW1lbnRzLmZpbHRlciggYmxvY2tDb21tZW50RmlsdGVyICk7XG4gICAgaWYgKCBibG9ja0NvbW1lbnRzLmxlbmd0aCApIHtcbiAgICAgIHJldHVybiBwYXJzZUJsb2NrRG9jKCBkZXN0YXJCbG9ja0NvbW1lbnQoIGJsb2NrQ29tbWVudHNbIGJsb2NrQ29tbWVudHMubGVuZ3RoIC0gMSBdLnZhbHVlICkgKTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICBsaW5lQ29tbWVudHMgPSBsaW5lQ29tbWVudHMuY29uY2F0KCBub2RlLmxlYWRpbmdDb21tZW50cy5maWx0ZXIoIGxpbmVDb21tZW50RmlsdGVyICkgKTtcbiAgICB9XG4gIH1cbiAgLy8gTk9URTogdHJhaWxpbmcgY29tbWVudHMgd2VyZSBhbHNvIHJlY29nbml6ZWQgYXMgbGVhZGluZyBjb21tZW50cyBmb3IgY29uc2VjdXRpdmUgdGhpcy48cHJvcD4gZGVmaW5pdGlvbnMuXG4gIC8vIFN0cmlwcGVkIG91dCBmb3Igbm93LlxuICAvLyBpZiAoIG5vZGUudHJhaWxpbmdDb21tZW50cyApIHtcbiAgLy8gICBsaW5lQ29tbWVudHMgPSBsaW5lQ29tbWVudHMuY29uY2F0KCBub2RlLnRyYWlsaW5nQ29tbWVudHMuZmlsdGVyKCBsaW5lQ29tbWVudEZpbHRlciApICk7XG4gIC8vIH1cbiAgaWYgKCBsaW5lQ29tbWVudHMubGVuZ3RoICkge1xuICAgIGNvbnN0IGNvbW1lbnQgPSBsaW5lQ29tbWVudHNbIGxpbmVDb21tZW50cy5sZW5ndGggLSAxIF07XG4gICAgcmV0dXJuIHBhcnNlTGluZURvYyggY29tbWVudC52YWx1ZS5yZXBsYWNlKCAvXiAvLCAnJyApICk7IC8vIHN0cmlwIG9mZiBhIHNpbmdsZSBsZWFkaW5nIHNwYWNlXG4gIH1cblxuICByZXR1cm4gbnVsbDtcbn1cblxuZnVuY3Rpb24gaXNDYXBpdGFsaXplZCggc3RyaW5nICkge1xuICByZXR1cm4gc3RyaW5nLmNoYXJBdCggMCApID09PSBzdHJpbmcuY2hhckF0KCAwICkudG9VcHBlckNhc2UoKTtcbn1cblxuZnVuY3Rpb24gY2FwaXRhbGl6ZSggc3RyaW5nICkge1xuICByZXR1cm4gc3RyaW5nLmNoYXJBdCggMCApLnRvVXBwZXJDYXNlKCkgKyBzdHJpbmcuc2xpY2UoIDEgKTtcbn1cblxuLyoqXG4gKiBXaGV0aGVyIGFuIGVzcHJpbWEtcGFyc2VkIEFTVCByZXByZXNlbnRzIGFuIGFzc2lnbWVudCB0byBhbiBpZGVudGlmaWVyIG9uICd0aGlzJywgZS5nLjpcbiAqIHRoaXMuc29tZXRoaW5nID0gLi4uO1xuICogQHByaXZhdGVcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gZXhwclxuICogQHJldHVybnMge2Jvb2xlYW59XG4gKi9cbmZ1bmN0aW9uIGlzU2ltcGxlVGhpc0Fzc2lnbm1lbnQoIGV4cHIgKSB7XG4gIHJldHVybiBleHByLnR5cGUgPT09ICdBc3NpZ25tZW50RXhwcmVzc2lvbicgJiZcbiAgICAgICAgIGV4cHIubGVmdC50eXBlID09PSAnTWVtYmVyRXhwcmVzc2lvbicgJiZcbiAgICAgICAgIGV4cHIubGVmdC5vYmplY3QudHlwZSA9PT0gJ1RoaXNFeHByZXNzaW9uJyAmJlxuICAgICAgICAgZXhwci5sZWZ0LnByb3BlcnR5LnR5cGUgPT09ICdJZGVudGlmaWVyJztcbn1cblxuLy8gZS5nLiBjb25zb2xlLmxvZyggSlNPTi5zdHJpbmdpZnkoIGV4dHJhY3REb2N1bWVudGF0aW9uKCBwcm9ncmFtICksIG51bGwsIDIgKSApO1xuZnVuY3Rpb24gZXh0cmFjdERvY3VtZW50YXRpb24oIHByb2dyYW06IHsgYm9keTogb2JqZWN0W10gfSApOiBvYmplY3Qge1xuICBjb25zdCBkb2MgPSB7fTtcblxuICBmdW5jdGlvbiBwYXJzZVR5cGVFeHByZXNzaW9uKCB0eXBlU3RhdGVtZW50LCB0eXBlRXhwcmVzc2lvbiwgbmFtZSwgcGFyZW50TmFtZSApIHtcbiAgICBjb25zdCB0eXBlRG9jID0ge1xuICAgICAgY29tbWVudDogZXh0cmFjdERvY0Zyb21Ob2RlKCB0eXBlU3RhdGVtZW50ICksXG4gICAgICBpbnN0YW5jZVByb3BlcnRpZXM6IFtdLFxuICAgICAgc3RhdGljUHJvcGVydGllczogW10sXG4gICAgICBjb25zdHJ1Y3RvclByb3BlcnRpZXM6IFtdLFxuICAgICAgc3VwZXJ0eXBlOiBudWxsLCAvLyBmaWxsZWQgaW4gYnkgaW5oZXJpdFxuICAgICAgdHlwZTogJ3R5cGUnLFxuICAgICAgbmFtZTogbmFtZVxuICAgIH07XG5cbiAgICBpZiAoIHBhcmVudE5hbWUgKSB7XG4gICAgICB0eXBlRG9jLnBhcmVudE5hbWUgPSBwYXJlbnROYW1lO1xuICAgIH1cblxuICAgIGNvbnN0IGNvbnN0cnVjdG9yU3RhdGVtZW50cyA9IHR5cGVFeHByZXNzaW9uLmJvZHkuYm9keTsgLy8gc3RhdGVtZW50cyBpbiB0aGUgY29uc3RydWN0b3IgZnVuY3Rpb24gYm9keVxuICAgIGNvbnN0cnVjdG9yU3RhdGVtZW50cy5mb3JFYWNoKCBjb25zdHJ1Y3RvclN0YXRlbWVudCA9PiB7XG4gICAgICBpZiAoIGNvbnN0cnVjdG9yU3RhdGVtZW50LnR5cGUgPT09ICdFeHByZXNzaW9uU3RhdGVtZW50JyApIHtcbiAgICAgICAgaWYgKCBpc1NpbXBsZVRoaXNBc3NpZ25tZW50KCBjb25zdHJ1Y3RvclN0YXRlbWVudC5leHByZXNzaW9uICkgKSB7XG4gICAgICAgICAgY29uc3QgY29tbWVudCA9IGV4dHJhY3REb2NGcm9tTm9kZSggY29uc3RydWN0b3JTdGF0ZW1lbnQgKTtcbiAgICAgICAgICBpZiAoIGNvbW1lbnQgKSB7XG4gICAgICAgICAgICBjb21tZW50Lm5hbWUgPSBjb25zdHJ1Y3RvclN0YXRlbWVudC5leHByZXNzaW9uLmxlZnQucHJvcGVydHkubmFtZTtcbiAgICAgICAgICAgIHR5cGVEb2MuY29uc3RydWN0b3JQcm9wZXJ0aWVzLnB1c2goIGNvbW1lbnQgKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9ICk7XG5cbiAgICByZXR1cm4gdHlwZURvYztcbiAgfVxuXG4gIGZ1bmN0aW9uIHBhcnNlU3RhdGljUHJvcGVydHkoIHByb3BlcnR5ICkge1xuICAgIGNvbnN0IGtleSA9IHByb3BlcnR5LmtleS5uYW1lO1xuXG4gICAgLy8gVE9ETzogc3VwcG9ydCBzdGF0aWMgY29uc3RhbnRzPyBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvY2hpcHBlci9pc3N1ZXMvNDExXG4gICAgaWYgKCBwcm9wZXJ0eS52YWx1ZS50eXBlID09PSAnRnVuY3Rpb25FeHByZXNzaW9uJyApIHtcbiAgICAgIGNvbnN0IHN0YXRpY0RvYyA9IGV4dHJhY3REb2NGcm9tTm9kZSggcHJvcGVydHkgKTtcblxuICAgICAgaWYgKCBzdGF0aWNEb2MgKSB7XG4gICAgICAgIHN0YXRpY0RvYy50eXBlID0gJ2Z1bmN0aW9uJztcbiAgICAgICAgc3RhdGljRG9jLm5hbWUgPSBrZXk7XG4gICAgICAgIHJldHVybiBzdGF0aWNEb2M7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSBleHByZXNzaW9uXG4gICAqIEByZXR1cm5zIHtudWxsfE9iamVjdH1cbiAgICovXG4gIGZ1bmN0aW9uIHBhcnNlSW5oZXJpdCggZXhwcmVzc2lvbiApIHtcbiAgICBjb25zdCBzdXBlcnR5cGUgPSBleHByZXNzaW9uLmFyZ3VtZW50c1sgMCBdLm5hbWU7XG4gICAgY29uc3Qgc3VidHlwZSA9IGV4cHJlc3Npb24uYXJndW1lbnRzWyAxIF0ubmFtZTtcblxuICAgIC8vIElmIHdlIGhhdmVuJ3QgY2F1Z2h0IHRoZSBjb25zdHJ1Y3Rvci90eXBlIGRlY2xhcmF0aW9uLCBza2lwIHRoZSBpbmhlcml0IHBhcnNpbmdcbiAgICBpZiAoICFkb2NbIHN1YnR5cGUgXSApIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIC8vIEFzc2lnbiB0aGUgc3VwZXJ0eXBlIG9uIHRoZSBzdWJ0eXBlXG4gICAgZG9jWyBzdWJ0eXBlIF0uc3VwZXJ0eXBlID0gc3VwZXJ0eXBlO1xuXG4gICAgLy8gSW5zdGFuY2UgKHByb3RvdHlwZSkgcHJvcGVydGllc1xuICAgIGlmICggZXhwcmVzc2lvbi5hcmd1bWVudHMubGVuZ3RoID49IDMgKSB7XG4gICAgICBjb25zdCBpbnN0YW5jZVByb3BlcnRpZXMgPSBleHByZXNzaW9uLmFyZ3VtZW50c1sgMiBdLnByb3BlcnRpZXM7XG5cbiAgICAgIC8vIEZvci1pdGVyYXRpb24sIHNvIHdlIGNhbiBza2lwIHNvbWUgaXRlbXMgYnkgaW5jcmVtZW50aW5nIGkuXG4gICAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBpbnN0YW5jZVByb3BlcnRpZXMubGVuZ3RoOyBpKysgKSB7XG4gICAgICAgIGNvbnN0IHByb3BlcnR5ID0gaW5zdGFuY2VQcm9wZXJ0aWVzWyBpIF07XG4gICAgICAgIGNvbnN0IGtleSA9IHByb3BlcnR5LmtleS5uYW1lO1xuICAgICAgICBpZiAoIHByb3BlcnR5LnZhbHVlLnR5cGUgPT09ICdGdW5jdGlvbkV4cHJlc3Npb24nICkge1xuICAgICAgICAgIGlmICggZG9jWyBzdWJ0eXBlIF0gKSB7XG4gICAgICAgICAgICBjb25zdCBpbnN0YW5jZURvYyA9IGV4dHJhY3REb2NGcm9tTm9kZSggcHJvcGVydHkgKTtcblxuICAgICAgICAgICAgaWYgKCBpbnN0YW5jZURvYyApIHtcbiAgICAgICAgICAgICAgLy8gQ2hlY2sgdG8gc2VlIGlmIHdlIGhhdmUgYW4gRVM1IGdldHRlci9zZXR0ZXIgZGVmaW5lZCBiZWxvd1xuICAgICAgICAgICAgICBpZiAoIGkgKyAxIDwgaW5zdGFuY2VQcm9wZXJ0aWVzLmxlbmd0aCApIHtcbiAgICAgICAgICAgICAgICBjb25zdCBuZXh0UHJvcGVydHkgPSBpbnN0YW5jZVByb3BlcnRpZXNbIGkgKyAxIF07XG4gICAgICAgICAgICAgICAgY29uc3QgbmV4dEV4cHJlc3Npb24gPSBuZXh0UHJvcGVydHkudmFsdWU7XG4gICAgICAgICAgICAgICAgaWYgKCBuZXh0RXhwcmVzc2lvbi50eXBlID09PSAnRnVuY3Rpb25FeHByZXNzaW9uJyApIHtcbiAgICAgICAgICAgICAgICAgIGNvbnN0IG5leHRLZXkgPSBuZXh0UHJvcGVydHkua2V5Lm5hbWU7XG4gICAgICAgICAgICAgICAgICBjb25zdCBjYXBpdGFsaXplZE5leHROYW1lID0gY2FwaXRhbGl6ZSggbmV4dEtleSApO1xuICAgICAgICAgICAgICAgICAgaWYgKCBuZXh0UHJvcGVydHkua2luZCA9PT0gJ2dldCcgJiZcbiAgICAgICAgICAgICAgICAgICAgICAgKCBgZ2V0JHtjYXBpdGFsaXplZE5leHROYW1lfWAgPT09IGtleSApIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICggYGlzJHtjYXBpdGFsaXplZE5leHROYW1lfWAgPT09IGtleSApICkge1xuICAgICAgICAgICAgICAgICAgICAvLyBTa2lwIHByb2Nlc3NpbmcgdGhlIEVTNSBnZXR0ZXIgbmV4dFxuICAgICAgICAgICAgICAgICAgICBpKys7XG4gICAgICAgICAgICAgICAgICAgIGluc3RhbmNlRG9jLm5hbWUgPSBuZXh0S2V5O1xuICAgICAgICAgICAgICAgICAgICBpbnN0YW5jZURvYy5leHBsaWNpdEdldE5hbWUgPSBrZXk7XG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICBlbHNlIGlmICggbmV4dFByb3BlcnR5LmtpbmQgPT09ICdzZXQnICYmXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYHNldCR7Y2FwaXRhbGl6ZWROZXh0TmFtZX1gID09PSBrZXkgKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIFNraXAgcHJvY2Vzc2luZyB0aGUgRVM1IHNldHRlciBuZXh0XG4gICAgICAgICAgICAgICAgICAgIGkrKztcbiAgICAgICAgICAgICAgICAgICAgaW5zdGFuY2VEb2MubmFtZSA9IG5leHRLZXk7XG4gICAgICAgICAgICAgICAgICAgIGluc3RhbmNlRG9jLmV4cGxpY2l0U2V0TmFtZSA9IGtleTtcbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgaW5zdGFuY2VEb2MudHlwZSA9ICdmdW5jdGlvbic7XG4gICAgICAgICAgICAgIGluc3RhbmNlRG9jLm5hbWUgPSBpbnN0YW5jZURvYy5uYW1lIHx8IGtleTtcbiAgICAgICAgICAgICAgZG9jWyBzdWJ0eXBlIF0uaW5zdGFuY2VQcm9wZXJ0aWVzLnB1c2goIGluc3RhbmNlRG9jICk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gU3RhdGljIChjb25zdHJ1Y3RvcikgcHJvcGVydGllc1xuICAgIGlmICggZXhwcmVzc2lvbi5hcmd1bWVudHMubGVuZ3RoID49IDQgKSB7XG4gICAgICBjb25zdCBzdGF0aWNQcm9wZXJ0aWVzID0gZXhwcmVzc2lvbi5hcmd1bWVudHNbIDMgXS5wcm9wZXJ0aWVzO1xuXG4gICAgICBzdGF0aWNQcm9wZXJ0aWVzLmZvckVhY2goIHByb3BlcnR5ID0+IHtcbiAgICAgICAgY29uc3Qgc3RhdGljRG9jID0gcGFyc2VTdGF0aWNQcm9wZXJ0eSggcHJvcGVydHkgKTtcbiAgICAgICAgaWYgKCBkb2NbIHN1YnR5cGUgXSAmJiBzdGF0aWNEb2MgKSB7XG4gICAgICAgICAgZG9jWyBzdWJ0eXBlIF0uc3RhdGljUHJvcGVydGllcy5wdXNoKCBzdGF0aWNEb2MgKTtcbiAgICAgICAgfVxuICAgICAgfSApO1xuICAgIH1cblxuICAgIHJldHVybiBkb2NbIHN1YnR5cGUgXTtcbiAgfVxuXG4gIC8vIERpZyBpbnRvIHJlcXVpcmUgc3RydWN0dXJlXG4gIGNvbnN0IG1haW5TdGF0ZW1lbnRzID0gcHJvZ3JhbS5ib2R5WyAwIF0uZXhwcmVzc2lvbi5hcmd1bWVudHNbIDAgXS5ib2R5LmJvZHk7XG5cbiAgZG9jLnRvcExldmVsQ29tbWVudCA9IGV4dHJhY3REb2NGcm9tTm9kZSggcHJvZ3JhbS5ib2R5WyAwIF0gKTtcblxuICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBtYWluU3RhdGVtZW50cy5sZW5ndGg7IGkrKyApIHtcbiAgICBjb25zdCB0b3BMZXZlbFN0YXRlbWVudCA9IG1haW5TdGF0ZW1lbnRzWyBpIF07XG5cbiAgICAvLyBUb3AtbGV2ZWwgY2FwaXRhbGl6ZWQgZnVuY3Rpb24gZGVjbGFyYXRpb24/IFBhcnNlIGl0IGFzIGEgVHlwZVxuICAgIGlmICggdG9wTGV2ZWxTdGF0ZW1lbnQudHlwZSA9PT0gJ0Z1bmN0aW9uRGVjbGFyYXRpb24nICYmXG4gICAgICAgICBpc0NhcGl0YWxpemVkKCB0b3BMZXZlbFN0YXRlbWVudC5pZC5uYW1lICkgKSB7XG4gICAgICBjb25zdCB0eXBlTmFtZSA9IHRvcExldmVsU3RhdGVtZW50LmlkLm5hbWU7XG4gICAgICBkb2NbIHR5cGVOYW1lIF0gPSBwYXJzZVR5cGVFeHByZXNzaW9uKCB0b3BMZXZlbFN0YXRlbWVudCwgdG9wTGV2ZWxTdGF0ZW1lbnQsIHR5cGVOYW1lLCBudWxsICk7XG4gICAgfVxuICAgIGVsc2UgaWYgKCB0b3BMZXZlbFN0YXRlbWVudC50eXBlID09PSAnRXhwcmVzc2lvblN0YXRlbWVudCcgKSB7XG4gICAgICBjb25zdCBleHByZXNzaW9uID0gdG9wTGV2ZWxTdGF0ZW1lbnQuZXhwcmVzc2lvbjtcblxuICAgICAgLy8gQ2FsbCB0byBpbmhlcml0KClcbiAgICAgIGlmICggZXhwcmVzc2lvbi50eXBlID09PSAnQ2FsbEV4cHJlc3Npb24nICYmIGV4cHJlc3Npb24uY2FsbGVlLm5hbWUgPT09ICdpbmhlcml0JyApIHtcbiAgICAgICAgcGFyc2VJbmhlcml0KCBleHByZXNzaW9uICk7XG4gICAgICB9XG4gICAgICBlbHNlIGlmICggZXhwcmVzc2lvbi50eXBlID09PSAnQXNzaWdubWVudEV4cHJlc3Npb24nICYmXG4gICAgICAgICAgICAgICAgZXhwcmVzc2lvbi5sZWZ0LnR5cGUgPT09ICdNZW1iZXJFeHByZXNzaW9uJyApIHtcbiAgICAgICAgY29uc3QgY29tbWVudCA9IGV4dHJhY3REb2NGcm9tTm9kZSggdG9wTGV2ZWxTdGF0ZW1lbnQgKTtcbiAgICAgICAgaWYgKCBjb21tZW50ICYmXG4gICAgICAgICAgICAgZXhwcmVzc2lvbi5sZWZ0Lm9iamVjdC50eXBlID09PSAnSWRlbnRpZmllcicgJiZcbiAgICAgICAgICAgICBleHByZXNzaW9uLmxlZnQucHJvcGVydHkudHlwZSA9PT0gJ0lkZW50aWZpZXInICYmXG4gICAgICAgICAgICAgZG9jWyBleHByZXNzaW9uLmxlZnQub2JqZWN0Lm5hbWUgXSApIHtcbiAgICAgICAgICBjb25zdCBpbm5lck5hbWUgPSBleHByZXNzaW9uLmxlZnQucHJvcGVydHkubmFtZTtcbiAgICAgICAgICBsZXQgdHlwZTtcblxuICAgICAgICAgIC8vIElubmVyIFR5cGUsIGUuZy4gQmluUGFja2VyLkJpbiA9IGZ1bmN0aW9uIEJpbiggLi4uICkgeyAuLi4gfTtcbiAgICAgICAgICBpZiAoIGV4cHJlc3Npb24ucmlnaHQudHlwZSA9PT0gJ0Z1bmN0aW9uRXhwcmVzc2lvbicgJiZcbiAgICAgICAgICAgICAgIGlzQ2FwaXRhbGl6ZWQoIGlubmVyTmFtZSApICkge1xuICAgICAgICAgICAgZG9jWyBpbm5lck5hbWUgXSA9IHBhcnNlVHlwZUV4cHJlc3Npb24oIHRvcExldmVsU3RhdGVtZW50LCBleHByZXNzaW9uLnJpZ2h0LCBpbm5lck5hbWUsIGV4cHJlc3Npb24ubGVmdC5vYmplY3QubmFtZSApO1xuICAgICAgICAgIH1cbiAgICAgICAgICAvLyBPdGhlciwgZS5nLiBWZWN0b3IyLlpFUk8gPSAuLi47XG4gICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBpZiAoIGV4cHJlc3Npb24ucmlnaHQudHlwZSA9PT0gJ0Z1bmN0aW9uRXhwcmVzc2lvbicgKSB7XG4gICAgICAgICAgICAgIHR5cGUgPSAnZnVuY3Rpb24nO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgIHR5cGUgPSAnY29uc3RhbnQnO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29tbWVudC50eXBlID0gdHlwZTtcbiAgICAgICAgICAgIGNvbW1lbnQubmFtZSA9IGV4cHJlc3Npb24ubGVmdC5wcm9wZXJ0eS5uYW1lO1xuICAgICAgICAgICAgZG9jWyBleHByZXNzaW9uLmxlZnQub2JqZWN0Lm5hbWUgXS5zdGF0aWNQcm9wZXJ0aWVzLnB1c2goIGNvbW1lbnQgKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgLy8gVmFyaWFibGUgb2JqZWN0IGluaXRpYWxpemF0aW9uOiBlLmcuIHZhciBVdGlscyA9IHsgLi4uIH07XG4gICAgZWxzZSBpZiAoIHRvcExldmVsU3RhdGVtZW50LnR5cGUgPT09ICdWYXJpYWJsZURlY2xhcmF0aW9uJyAmJlxuICAgICAgICAgICAgICB0b3BMZXZlbFN0YXRlbWVudC5kZWNsYXJhdGlvbnNbIDAgXS50eXBlID09PSAnVmFyaWFibGVEZWNsYXJhdG9yJyAmJlxuICAgICAgICAgICAgICB0b3BMZXZlbFN0YXRlbWVudC5kZWNsYXJhdGlvbnNbIDAgXS5pbml0ICYmXG4gICAgICAgICAgICAgIHRvcExldmVsU3RhdGVtZW50LmRlY2xhcmF0aW9uc1sgMCBdLmluaXQudHlwZSA9PT0gJ09iamVjdEV4cHJlc3Npb24nICYmXG4gICAgICAgICAgICAgIGlzQ2FwaXRhbGl6ZWQoIHRvcExldmVsU3RhdGVtZW50LmRlY2xhcmF0aW9uc1sgMCBdLmlkLm5hbWUgKSApIHtcbiAgICAgIGNvbnN0IG9iamVjdE5hbWUgPSB0b3BMZXZlbFN0YXRlbWVudC5kZWNsYXJhdGlvbnNbIDAgXS5pZC5uYW1lO1xuICAgICAgZG9jWyBvYmplY3ROYW1lIF0gPSB7XG4gICAgICAgIGNvbW1lbnQ6IGV4dHJhY3REb2NGcm9tTm9kZSggdG9wTGV2ZWxTdGF0ZW1lbnQgKSwgLy8gbWF5YmUgbm90IG5lZWRlZD9cbiAgICAgICAgcHJvcGVydGllczogW10sXG4gICAgICAgIHR5cGU6ICdvYmplY3QnLFxuICAgICAgICBuYW1lOiBvYmplY3ROYW1lXG4gICAgICB9O1xuXG4gICAgICAvLyBQcm9jZXNzIHByb3BlcnRpZXMgaW4gdGhlIG9iamVjdFxuICAgICAgdG9wTGV2ZWxTdGF0ZW1lbnQuZGVjbGFyYXRpb25zWyAwIF0uaW5pdC5wcm9wZXJ0aWVzLmZvckVhY2goIHByb3BlcnR5ID0+IHtcbiAgICAgICAgY29uc3Qgc3RhdGljRG9jID0gcGFyc2VTdGF0aWNQcm9wZXJ0eSggcHJvcGVydHkgKTtcbiAgICAgICAgaWYgKCBzdGF0aWNEb2MgKSB7XG4gICAgICAgICAgZG9jWyBvYmplY3ROYW1lIF0ucHJvcGVydGllcy5wdXNoKCBzdGF0aWNEb2MgKTtcbiAgICAgICAgfVxuICAgICAgfSApO1xuICAgIH1cbiAgfVxuICByZXR1cm4gZG9jO1xufVxuXG5cbmV4cG9ydCBkZWZhdWx0IGV4dHJhY3REb2N1bWVudGF0aW9uOyJdLCJuYW1lcyI6WyJkZXN0YXJCbG9ja0NvbW1lbnQiLCJzdHJpbmciLCJzcGxpdCIsIm1hcCIsImxpbmUiLCJkZXN0YXJyZWQiLCJyZXBsYWNlIiwibGVuZ3RoIiwiam9pbiIsInRyaW1MaW5lcyIsImxpbmVzIiwiaSIsInNwbGljZSIsInNoaWZ0IiwicG9wIiwicGFyc2VUeXBlIiwidHlwZVN0cmluZyIsInNsaWNlIiwic3BsaXRUeXBlRG9jTGluZSIsImhhc05hbWUiLCJicmFjZUNvdW50IiwiZW5kT2ZUeXBlIiwidHlwZSIsInJlc3QiLCJuYW1lIiwiZGVzY3JpcHRpb24iLCJzcGFjZUluZGV4IiwiaW5kZXhPZiIsInJlc3VsdCIsImNoYXJBdCIsIm9wdGlvbmFsIiwicGFyc2VCbG9ja0RvYyIsImRlc2NyaXB0aW9uTGluZXMiLCJqc2RvY0xpbmVzIiwiaiIsIm5leHRMaW5lIiwicHVzaCIsImsiLCJqc2RvY0xpbmUiLCJ2aXNpYmlsaXR5IiwicGFyYW1ldGVycyIsInVuc2hpZnQiLCJyZXR1cm5zIiwiY29uc3RhbnQiLCJjb25zdHJ1Y3RvciIsImpzZG9jIiwicGFyc2VMaW5lRG9jIiwidGVzdCIsImV4dHJhY3REb2NGcm9tTm9kZSIsIm5vZGUiLCJibG9ja0NvbW1lbnRGaWx0ZXIiLCJjb21tZW50IiwidmFsdWUiLCJsaW5lQ29tbWVudEZpbHRlciIsImxpbmVDb21tZW50cyIsImxlYWRpbmdDb21tZW50cyIsImJsb2NrQ29tbWVudHMiLCJmaWx0ZXIiLCJjb25jYXQiLCJpc0NhcGl0YWxpemVkIiwidG9VcHBlckNhc2UiLCJjYXBpdGFsaXplIiwiaXNTaW1wbGVUaGlzQXNzaWdubWVudCIsImV4cHIiLCJsZWZ0Iiwib2JqZWN0IiwicHJvcGVydHkiLCJleHRyYWN0RG9jdW1lbnRhdGlvbiIsInByb2dyYW0iLCJkb2MiLCJwYXJzZVR5cGVFeHByZXNzaW9uIiwidHlwZVN0YXRlbWVudCIsInR5cGVFeHByZXNzaW9uIiwicGFyZW50TmFtZSIsInR5cGVEb2MiLCJpbnN0YW5jZVByb3BlcnRpZXMiLCJzdGF0aWNQcm9wZXJ0aWVzIiwiY29uc3RydWN0b3JQcm9wZXJ0aWVzIiwic3VwZXJ0eXBlIiwiY29uc3RydWN0b3JTdGF0ZW1lbnRzIiwiYm9keSIsImZvckVhY2giLCJjb25zdHJ1Y3RvclN0YXRlbWVudCIsImV4cHJlc3Npb24iLCJwYXJzZVN0YXRpY1Byb3BlcnR5Iiwia2V5Iiwic3RhdGljRG9jIiwicGFyc2VJbmhlcml0IiwiYXJndW1lbnRzIiwic3VidHlwZSIsInByb3BlcnRpZXMiLCJpbnN0YW5jZURvYyIsIm5leHRQcm9wZXJ0eSIsIm5leHRFeHByZXNzaW9uIiwibmV4dEtleSIsImNhcGl0YWxpemVkTmV4dE5hbWUiLCJraW5kIiwiZXhwbGljaXRHZXROYW1lIiwiZXhwbGljaXRTZXROYW1lIiwibWFpblN0YXRlbWVudHMiLCJ0b3BMZXZlbENvbW1lbnQiLCJ0b3BMZXZlbFN0YXRlbWVudCIsImlkIiwidHlwZU5hbWUiLCJjYWxsZWUiLCJpbm5lck5hbWUiLCJyaWdodCIsImRlY2xhcmF0aW9ucyIsImluaXQiLCJvYmplY3ROYW1lIl0sIm1hcHBpbmdzIjoiQUFBQSxzREFBc0Q7QUFFdEQsMkNBQTJDLEdBQzNDLG1EQUFtRCxHQUNuRCxhQUFhO0FBR2I7Ozs7O0NBS0MsR0FFRDs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0NBcUJDLEdBQ0QsU0FBU0EsbUJBQW9CQyxNQUFNO0lBQ2pDLE9BQU9BLE9BQU9DLEtBQUssQ0FBRSxNQUFPQyxHQUFHLENBQUVDLENBQUFBO1FBQy9CLElBQUlDLFlBQVlELEtBQUtFLE9BQU8sQ0FBRSxXQUFXO1FBRXpDLDBGQUEwRjtRQUMxRixJQUFLRCxVQUFVQyxPQUFPLENBQUUsTUFBTSxJQUFLQyxNQUFNLEtBQUssR0FBSTtZQUNoREYsWUFBWTtRQUNkO1FBQ0EsT0FBT0E7SUFDVCxHQUFJRyxJQUFJLENBQUU7QUFDWjtBQUVBOzs7Ozs7OztDQVFDLEdBQ0QsU0FBU0MsVUFBV1IsTUFBTTtJ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