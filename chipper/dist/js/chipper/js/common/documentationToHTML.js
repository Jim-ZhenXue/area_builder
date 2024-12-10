// Copyright 2015-2024, University of Colorado Boulder
// eslint-disable-next-line phet/bad-typescript-text
// @ts-nocheck
/**
 * Given structured documentation output from extractDocumentation (and associated other metadata), this outputs both
 * HTML meant for a collapsible documentation index and HTML content for all of the documentation.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ let typeURLs = {
};
// borrowed from phet-core.
function escapeHTML(str) {
    // see https://www.owasp.org/index.php/XSS_(Cross_Site_Scripting)_Prevention_Cheat_Sheet
    // HTML Entity Encoding
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;').replace(/\//g, '&#x2F;');
}
/**
 * Parses the HTML looking for examples (matching #begin and #end) that have embedded #on/#off to control where code
 * examples are displayed. Breaks up everything into a concise paragraph structure (blank lines trigger the end of a
 * paragraph).
 */ function descriptionHTML(string) {
    let result = '';
    const lines = string.split('\n');
    let inParagraph = false;
    function insideParagraph() {
        if (!inParagraph) {
            result += '<p>\n';
            inParagraph = true;
        }
    }
    function outsideParagraph() {
        if (inParagraph) {
            result += '</p>\n';
            inParagraph = false;
        }
    }
    for(let i = 0; i < lines.length; i++){
        const line = lines[i];
        if (line.startsWith('#begin')) {
            const initialLine = lines[i];
            const runLines = [];
            const displayLines = [];
            let isDisplayed = false;
            for(i++; i < lines.length; i++){
                if (lines[i].startsWith('#end')) {
                    break;
                } else if (lines[i].startsWith('#on')) {
                    isDisplayed = true;
                } else if (lines[i].startsWith('#off')) {
                    isDisplayed = false;
                } else {
                    runLines.push(lines[i]);
                    if (isDisplayed) {
                        displayLines.push(lines[i]);
                    }
                }
            }
            const runString = runLines.join('\n');
            const displayString = displayLines.join('\n');
            const canvasExampleMatch = initialLine.match(/^#begin canvasExample ([^ ]+) ([^x]+)x([^x]+)$/);
            if (canvasExampleMatch) {
                outsideParagraph();
                const name = canvasExampleMatch[1];
                const width = canvasExampleMatch[2];
                const height = canvasExampleMatch[3];
                const exampleName = `example-${name}`;
                result += `<canvas id="${exampleName}" class="exampleScene"></canvas>`;
                result += '<script>(function(){';
                result += `var canvas = document.getElementById( "${exampleName}" );`;
                result += `canvas.width = ${width};`;
                result += `canvas.height = ${height};`;
                result += 'var context = canvas.getContext( "2d" );';
                result += runString;
                result += '})();</' + 'script>'; // eslint-disable-line no-useless-concat
                result += '<pre class="brush: js">\n';
                result += displayString;
                result += '</pre>';
            }
        } else {
            if (line.length === 0) {
                outsideParagraph();
            } else {
                insideParagraph();
                result += `${line}\n`;
            }
        }
    }
    outsideParagraph();
    return result;
}
function typeString(type) {
    const url = typeURLs[type];
    if (url) {
        return ` <a href="${url}" class="type">${escapeHTML(type)}</a>`;
    } else {
        return ` <span class="type">${escapeHTML(type)}</span>`;
    }
}
function inlineParameterList(object) {
    let result = '';
    if (object.parameters) {
        result += `( ${object.parameters.map((parameter)=>{
            let name = parameter.name;
            if (parameter.optional) {
                name = `<span class="optional">${name}</span>`;
            }
            return `<span class="args">${typeString(parameter.type)} ${name}</span>`;
        }).join(', ')} )`;
    } else if (object.type === 'function') {
        result += '()';
    }
    return result;
}
function parameterDetailsList(object) {
    let result = '';
    const parametersWithDescriptions = object.parameters ? object.parameters.filter((parameter)=>{
        return !!parameter.description;
    }) : [];
    if (parametersWithDescriptions.length) {
        result += '<table class="params">\n';
        parametersWithDescriptions.forEach((parameter)=>{
            let name = parameter.name;
            const description = parameter.description || '';
            if (parameter.optional) {
                name = `<span class="optional">${name}</span>`;
            }
            result += `<tr class="param"><td>${typeString(parameter.type)}</td><td>${name}</td><td> - </td><td>${description}</td></tr>\n`;
        });
        result += '</table>\n';
    }
    return result;
}
function returnOrConstant(object) {
    let result = '';
    if (object.returns || object.constant) {
        const type = (object.returns || object.constant).type;
        if (object.returns) {
            result += ' :';
        }
        result += `<span class="return">${typeString(type)}</span>`;
    }
    return result;
}
function nameLookup(array, name) {
    for(let i = 0; i < array.length; i++){
        if (array[i].name === name) {
            return array[i];
        }
    }
    return null;
}
/**
 * For a given doc (extractDocumentation output) and a base name for the file (e.g. 'Vector2' for Vector2.js),
 * collect top-level documentation (and public documentation for every type referenced in typeNmaes) and return an
 * object: { indexHTML: {string}, contentHTML: {string} } which includes the HTML for the index (list of types and
 * methods/fields/etc.) and content (the documentation itself).
 *
 * @param doc
 * @param baseName
 * @param typeNames - Names of types from this file to include in the documentation.
 * @param localTypeIds - Keys should be type names included in the same documentation output, and the values
 *                                should be a prefix applied for hash URLs of the given type. This helps prefix
 *                                things, so Vector2.angle will have a URL #vector2-angle.
 * @param externalTypeURLs - Keys should be type names NOT included in the same documentation output, and
 *                                    values should be URLs for those types.
 * @returns - With indexHTML and contentHTML fields, both strings of HTML.
 */ function documentationToHTML(doc, baseName, typeNames, localTypeIds, externalTypeURLs) {
    let indexHTML = '';
    let contentHTML = '';
    // Initialize typeURLs for the output
    typeURLs = {};
    Object.keys(externalTypeURLs).forEach((typeId)=>{
        typeURLs[typeId] = externalTypeURLs[typeId];
    });
    Object.keys(localTypeIds).forEach((typeId)=>{
        typeURLs[typeId] = `#${localTypeIds[typeId]}`;
    });
    const baseURL = typeURLs[baseName];
    indexHTML += `<a class="navlink" href="${baseURL}" data-toggle="collapse" data-target="#collapse-${baseName}" onclick="$( '.collapse.in' ).collapse( 'toggle' ); return true;">${baseName}</a><br>\n`;
    indexHTML += `<div id="collapse-${baseName}" class="collapse">\n`;
    contentHTML += `<h3 id="${baseURL.slice(1)}" class="section">${baseName}</h3>\n`;
    contentHTML += descriptionHTML(doc.topLevelComment.description);
    typeNames.forEach((typeName)=>{
        const baseObject = doc[typeName];
        const baseURLPrefix = `${localTypeIds[typeName]}-`;
        // constructor
        if (baseObject.type === 'type') {
            // Add a target for #-links if we aren't the baseName.
            if (typeName !== baseName) {
                contentHTML += `<div id="${baseURLPrefix.slice(0, baseURLPrefix.length - 1)}"></div>`;
            }
            let constructorLine = typeName + inlineParameterList(baseObject.comment);
            if (baseObject.supertype) {
                constructorLine += ` <span class="inherit">extends ${typeString(baseObject.supertype)}</span>`;
            }
            contentHTML += `<h4 id="${baseURLPrefix}constructor" class="section">${constructorLine}</h4>`;
            contentHTML += descriptionHTML(baseObject.comment.description);
            contentHTML += parameterDetailsList(baseObject.comment);
        }
        const staticProperties = baseObject.staticProperties || baseObject.properties || [];
        const staticNames = staticProperties.map((prop)=>prop.name).sort();
        staticNames.forEach((name)=>{
            const object = nameLookup(staticProperties, name);
            indexHTML += `<a class="sublink" href="#${baseURLPrefix}${object.name}">${object.name}</a><br>`;
            let typeLine = `<span class="entryName">${typeName}.${object.name}</span>`;
            typeLine += inlineParameterList(object);
            typeLine += returnOrConstant(object);
            contentHTML += `<h5 id="${baseURLPrefix}${object.name}" class="section">${typeLine}</h5>`;
            if (object.description) {
                contentHTML += descriptionHTML(object.description);
            }
            contentHTML += parameterDetailsList(object);
        });
        if (baseObject.type === 'type') {
            const constructorNames = baseObject.constructorProperties.map((prop)=>prop.name).sort();
            constructorNames.forEach((name)=>{
                const object = nameLookup(baseObject.constructorProperties, name);
                indexHTML += `<a class="sublink" href="#${baseURLPrefix}${object.name}">${object.name}</a><br>`;
                let typeLine = `<span class="entryName">${object.name}</span>`;
                typeLine += ` <span class="property">${typeString(object.type)}</span>`;
                contentHTML += `<h5 id="${baseURLPrefix}${object.name}" class="section">${typeLine}</h5>`;
                if (object.description) {
                    contentHTML += descriptionHTML(object.description);
                }
            });
        }
        if (baseObject.type === 'type') {
            const instanceNames = baseObject.instanceProperties.map((prop)=>prop.name).sort();
            instanceNames.forEach((name)=>{
                const object = nameLookup(baseObject.instanceProperties, name);
                indexHTML += `<a class="sublink" href="#${baseURLPrefix}${object.name}">${object.name}</a><br>`;
                let typeLine = `<span class="entryName">${object.name}</span>`;
                if (object.explicitGetName) {
                    typeLine += ` <span class="property">${typeString(object.returns.type)}</span>`;
                    typeLine += ` <span class="entryName explicitSetterGetter">${object.explicitGetName}`;
                }
                if (object.explicitSetName) {
                    typeLine += ` <span class="property">${typeString(object.returns.type)}</span>`;
                    typeLine += ` <span class="entryName explicitSetterGetter">${object.explicitSetName}`;
                }
                typeLine += inlineParameterList(object);
                typeLine += returnOrConstant(object);
                if (object.explicitSetName || object.explicitGetName) {
                    typeLine += '</span>';
                }
                contentHTML += `<h5 id="${baseURLPrefix}${object.name}" class="section">${typeLine}</h5>`;
                contentHTML += descriptionHTML(object.description);
                contentHTML += parameterDetailsList(object);
            });
        }
    });
    indexHTML += '</div>';
    return {
        indexHTML: indexHTML,
        contentHTML: contentHTML
    };
}
export default documentationToHTML;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2pzL2NvbW1vbi9kb2N1bWVudGF0aW9uVG9IVE1MLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE1LTIwMjQsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgcGhldC9iYWQtdHlwZXNjcmlwdC10ZXh0XG4vLyBAdHMtbm9jaGVja1xuXG4vKipcbiAqIEdpdmVuIHN0cnVjdHVyZWQgZG9jdW1lbnRhdGlvbiBvdXRwdXQgZnJvbSBleHRyYWN0RG9jdW1lbnRhdGlvbiAoYW5kIGFzc29jaWF0ZWQgb3RoZXIgbWV0YWRhdGEpLCB0aGlzIG91dHB1dHMgYm90aFxuICogSFRNTCBtZWFudCBmb3IgYSBjb2xsYXBzaWJsZSBkb2N1bWVudGF0aW9uIGluZGV4IGFuZCBIVE1MIGNvbnRlbnQgZm9yIGFsbCBvZiB0aGUgZG9jdW1lbnRhdGlvbi5cbiAqXG4gKiBAYXV0aG9yIEpvbmF0aGFuIE9sc29uIDxqb25hdGhhbi5vbHNvbkBjb2xvcmFkby5lZHU+XG4gKi9cblxubGV0IHR5cGVVUkxzID0ge1xuICAvLyBpcyByZXBsYWNlZCBieSBldmVyeSBkb2N1bWVudGF0aW9uVG9IVE1MKCkgY2FsbFxufTtcblxuLy8gYm9ycm93ZWQgZnJvbSBwaGV0LWNvcmUuXG5mdW5jdGlvbiBlc2NhcGVIVE1MKCBzdHIgKTogc3RyaW5nIHtcbiAgLy8gc2VlIGh0dHBzOi8vd3d3Lm93YXNwLm9yZy9pbmRleC5waHAvWFNTXyhDcm9zc19TaXRlX1NjcmlwdGluZylfUHJldmVudGlvbl9DaGVhdF9TaGVldFxuICAvLyBIVE1MIEVudGl0eSBFbmNvZGluZ1xuICByZXR1cm4gc3RyXG4gICAgLnJlcGxhY2UoIC8mL2csICcmYW1wOycgKVxuICAgIC5yZXBsYWNlKCAvPC9nLCAnJmx0OycgKVxuICAgIC5yZXBsYWNlKCAvPi9nLCAnJmd0OycgKVxuICAgIC5yZXBsYWNlKCAvXCIvZywgJyZxdW90OycgKVxuICAgIC5yZXBsYWNlKCAvJy9nLCAnJiN4Mjc7JyApXG4gICAgLnJlcGxhY2UoIC9cXC8vZywgJyYjeDJGOycgKTtcbn1cblxuLyoqXG4gKiBQYXJzZXMgdGhlIEhUTUwgbG9va2luZyBmb3IgZXhhbXBsZXMgKG1hdGNoaW5nICNiZWdpbiBhbmQgI2VuZCkgdGhhdCBoYXZlIGVtYmVkZGVkICNvbi8jb2ZmIHRvIGNvbnRyb2wgd2hlcmUgY29kZVxuICogZXhhbXBsZXMgYXJlIGRpc3BsYXllZC4gQnJlYWtzIHVwIGV2ZXJ5dGhpbmcgaW50byBhIGNvbmNpc2UgcGFyYWdyYXBoIHN0cnVjdHVyZSAoYmxhbmsgbGluZXMgdHJpZ2dlciB0aGUgZW5kIG9mIGFcbiAqIHBhcmFncmFwaCkuXG4gKi9cbmZ1bmN0aW9uIGRlc2NyaXB0aW9uSFRNTCggc3RyaW5nOiBzdHJpbmcgKTogc3RyaW5nIHtcbiAgbGV0IHJlc3VsdCA9ICcnO1xuICBjb25zdCBsaW5lcyA9IHN0cmluZy5zcGxpdCggJ1xcbicgKTtcblxuICBsZXQgaW5QYXJhZ3JhcGggPSBmYWxzZTtcblxuICBmdW5jdGlvbiBpbnNpZGVQYXJhZ3JhcGgoKTogdm9pZCB7XG4gICAgaWYgKCAhaW5QYXJhZ3JhcGggKSB7XG4gICAgICByZXN1bHQgKz0gJzxwPlxcbic7XG4gICAgICBpblBhcmFncmFwaCA9IHRydWU7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gb3V0c2lkZVBhcmFncmFwaCgpOiB2b2lkIHtcbiAgICBpZiAoIGluUGFyYWdyYXBoICkge1xuICAgICAgcmVzdWx0ICs9ICc8L3A+XFxuJztcbiAgICAgIGluUGFyYWdyYXBoID0gZmFsc2U7XG4gICAgfVxuICB9XG5cbiAgZm9yICggbGV0IGkgPSAwOyBpIDwgbGluZXMubGVuZ3RoOyBpKysgKSB7XG4gICAgY29uc3QgbGluZSA9IGxpbmVzWyBpIF07XG5cbiAgICBpZiAoIGxpbmUuc3RhcnRzV2l0aCggJyNiZWdpbicgKSApIHtcbiAgICAgIGNvbnN0IGluaXRpYWxMaW5lID0gbGluZXNbIGkgXTtcbiAgICAgIGNvbnN0IHJ1bkxpbmVzID0gW107XG4gICAgICBjb25zdCBkaXNwbGF5TGluZXMgPSBbXTtcbiAgICAgIGxldCBpc0Rpc3BsYXllZCA9IGZhbHNlO1xuICAgICAgZm9yICggaSsrOyBpIDwgbGluZXMubGVuZ3RoOyBpKysgKSB7XG4gICAgICAgIGlmICggbGluZXNbIGkgXS5zdGFydHNXaXRoKCAnI2VuZCcgKSApIHtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmICggbGluZXNbIGkgXS5zdGFydHNXaXRoKCAnI29uJyApICkge1xuICAgICAgICAgIGlzRGlzcGxheWVkID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmICggbGluZXNbIGkgXS5zdGFydHNXaXRoKCAnI29mZicgKSApIHtcbiAgICAgICAgICBpc0Rpc3BsYXllZCA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgIHJ1bkxpbmVzLnB1c2goIGxpbmVzWyBpIF0gKTtcbiAgICAgICAgICBpZiAoIGlzRGlzcGxheWVkICkge1xuICAgICAgICAgICAgZGlzcGxheUxpbmVzLnB1c2goIGxpbmVzWyBpIF0gKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgY29uc3QgcnVuU3RyaW5nID0gcnVuTGluZXMuam9pbiggJ1xcbicgKTtcbiAgICAgIGNvbnN0IGRpc3BsYXlTdHJpbmcgPSBkaXNwbGF5TGluZXMuam9pbiggJ1xcbicgKTtcblxuICAgICAgY29uc3QgY2FudmFzRXhhbXBsZU1hdGNoID0gaW5pdGlhbExpbmUubWF0Y2goIC9eI2JlZ2luIGNhbnZhc0V4YW1wbGUgKFteIF0rKSAoW154XSspeChbXnhdKykkLyApO1xuICAgICAgaWYgKCBjYW52YXNFeGFtcGxlTWF0Y2ggKSB7XG4gICAgICAgIG91dHNpZGVQYXJhZ3JhcGgoKTtcblxuICAgICAgICBjb25zdCBuYW1lID0gY2FudmFzRXhhbXBsZU1hdGNoWyAxIF07XG4gICAgICAgIGNvbnN0IHdpZHRoID0gY2FudmFzRXhhbXBsZU1hdGNoWyAyIF07XG4gICAgICAgIGNvbnN0IGhlaWdodCA9IGNhbnZhc0V4YW1wbGVNYXRjaFsgMyBdO1xuXG4gICAgICAgIGNvbnN0IGV4YW1wbGVOYW1lID0gYGV4YW1wbGUtJHtuYW1lfWA7XG5cbiAgICAgICAgcmVzdWx0ICs9IGA8Y2FudmFzIGlkPVwiJHtleGFtcGxlTmFtZX1cIiBjbGFzcz1cImV4YW1wbGVTY2VuZVwiPjwvY2FudmFzPmA7XG4gICAgICAgIHJlc3VsdCArPSAnPHNjcmlwdD4oZnVuY3Rpb24oKXsnO1xuICAgICAgICByZXN1bHQgKz0gYHZhciBjYW52YXMgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCggXCIke2V4YW1wbGVOYW1lfVwiICk7YDtcbiAgICAgICAgcmVzdWx0ICs9IGBjYW52YXMud2lkdGggPSAke3dpZHRofTtgO1xuICAgICAgICByZXN1bHQgKz0gYGNhbnZhcy5oZWlnaHQgPSAke2hlaWdodH07YDtcbiAgICAgICAgcmVzdWx0ICs9ICd2YXIgY29udGV4dCA9IGNhbnZhcy5nZXRDb250ZXh0KCBcIjJkXCIgKTsnO1xuICAgICAgICByZXN1bHQgKz0gcnVuU3RyaW5nO1xuICAgICAgICByZXN1bHQgKz0gJ30pKCk7PC8nICsgJ3NjcmlwdD4nOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLXVzZWxlc3MtY29uY2F0XG4gICAgICAgIHJlc3VsdCArPSAnPHByZSBjbGFzcz1cImJydXNoOiBqc1wiPlxcbic7XG4gICAgICAgIHJlc3VsdCArPSBkaXNwbGF5U3RyaW5nO1xuICAgICAgICByZXN1bHQgKz0gJzwvcHJlPic7XG4gICAgICB9XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgaWYgKCBsaW5lLmxlbmd0aCA9PT0gMCApIHtcbiAgICAgICAgb3V0c2lkZVBhcmFncmFwaCgpO1xuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgIGluc2lkZVBhcmFncmFwaCgpO1xuICAgICAgICByZXN1bHQgKz0gYCR7bGluZX1cXG5gO1xuICAgICAgfVxuICAgIH1cbiAgfVxuICBvdXRzaWRlUGFyYWdyYXBoKCk7XG5cbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxuZnVuY3Rpb24gdHlwZVN0cmluZyggdHlwZSApOiBzdHJpbmcge1xuICBjb25zdCB1cmwgPSB0eXBlVVJMc1sgdHlwZSBdO1xuICBpZiAoIHVybCApIHtcbiAgICByZXR1cm4gYCA8YSBocmVmPVwiJHt1cmx9XCIgY2xhc3M9XCJ0eXBlXCI+JHtlc2NhcGVIVE1MKCB0eXBlICl9PC9hPmA7XG4gIH1cbiAgZWxzZSB7XG4gICAgcmV0dXJuIGAgPHNwYW4gY2xhc3M9XCJ0eXBlXCI+JHtlc2NhcGVIVE1MKCB0eXBlICl9PC9zcGFuPmA7XG4gIH1cbn1cblxuZnVuY3Rpb24gaW5saW5lUGFyYW1ldGVyTGlzdCggb2JqZWN0ICk6IHN0cmluZyB7XG4gIGxldCByZXN1bHQgPSAnJztcbiAgaWYgKCBvYmplY3QucGFyYW1ldGVycyApIHtcbiAgICByZXN1bHQgKz0gYCggJHtvYmplY3QucGFyYW1ldGVycy5tYXAoIHBhcmFtZXRlciA9PiB7XG4gICAgICBsZXQgbmFtZSA9IHBhcmFtZXRlci5uYW1lO1xuICAgICAgaWYgKCBwYXJhbWV0ZXIub3B0aW9uYWwgKSB7XG4gICAgICAgIG5hbWUgPSBgPHNwYW4gY2xhc3M9XCJvcHRpb25hbFwiPiR7bmFtZX08L3NwYW4+YDtcbiAgICAgIH1cbiAgICAgIHJldHVybiBgPHNwYW4gY2xhc3M9XCJhcmdzXCI+JHt0eXBlU3RyaW5nKCBwYXJhbWV0ZXIudHlwZSApfSAke25hbWV9PC9zcGFuPmA7XG4gICAgfSApLmpvaW4oICcsICcgKX0gKWA7XG4gIH1cbiAgZWxzZSBpZiAoIG9iamVjdC50eXBlID09PSAnZnVuY3Rpb24nICkge1xuICAgIHJlc3VsdCArPSAnKCknO1xuICB9XG4gIHJldHVybiByZXN1bHQ7XG59XG5cbmZ1bmN0aW9uIHBhcmFtZXRlckRldGFpbHNMaXN0KCBvYmplY3QgKTogc3RyaW5nIHtcbiAgbGV0IHJlc3VsdCA9ICcnO1xuICBjb25zdCBwYXJhbWV0ZXJzV2l0aERlc2NyaXB0aW9ucyA9IG9iamVjdC5wYXJhbWV0ZXJzID8gb2JqZWN0LnBhcmFtZXRlcnMuZmlsdGVyKCBwYXJhbWV0ZXIgPT4ge1xuICAgIHJldHVybiAhIXBhcmFtZXRlci5kZXNjcmlwdGlvbjtcbiAgfSApIDogW107XG5cbiAgaWYgKCBwYXJhbWV0ZXJzV2l0aERlc2NyaXB0aW9ucy5sZW5ndGggKSB7XG4gICAgcmVzdWx0ICs9ICc8dGFibGUgY2xhc3M9XCJwYXJhbXNcIj5cXG4nO1xuICAgIHBhcmFtZXRlcnNXaXRoRGVzY3JpcHRpb25zLmZvckVhY2goIHBhcmFtZXRlciA9PiB7XG4gICAgICBsZXQgbmFtZSA9IHBhcmFtZXRlci5uYW1lO1xuICAgICAgY29uc3QgZGVzY3JpcHRpb24gPSBwYXJhbWV0ZXIuZGVzY3JpcHRpb24gfHwgJyc7XG4gICAgICBpZiAoIHBhcmFtZXRlci5vcHRpb25hbCApIHtcbiAgICAgICAgbmFtZSA9IGA8c3BhbiBjbGFzcz1cIm9wdGlvbmFsXCI+JHtuYW1lfTwvc3Bhbj5gO1xuICAgICAgfVxuICAgICAgcmVzdWx0ICs9IGA8dHIgY2xhc3M9XCJwYXJhbVwiPjx0ZD4ke3R5cGVTdHJpbmcoIHBhcmFtZXRlci50eXBlICl9PC90ZD48dGQ+JHtuYW1lfTwvdGQ+PHRkPiAtIDwvdGQ+PHRkPiR7ZGVzY3JpcHRpb259PC90ZD48L3RyPlxcbmA7XG4gICAgfSApO1xuICAgIHJlc3VsdCArPSAnPC90YWJsZT5cXG4nO1xuICB9XG4gIHJldHVybiByZXN1bHQ7XG59XG5cbmZ1bmN0aW9uIHJldHVybk9yQ29uc3RhbnQoIG9iamVjdCApOiBzdHJpbmcge1xuICBsZXQgcmVzdWx0ID0gJyc7XG4gIGlmICggb2JqZWN0LnJldHVybnMgfHwgb2JqZWN0LmNvbnN0YW50ICkge1xuICAgIGNvbnN0IHR5cGUgPSAoIG9iamVjdC5yZXR1cm5zIHx8IG9iamVjdC5jb25zdGFudCApLnR5cGU7XG4gICAgaWYgKCBvYmplY3QucmV0dXJucyApIHtcbiAgICAgIHJlc3VsdCArPSAnIDonO1xuICAgIH1cbiAgICByZXN1bHQgKz0gYDxzcGFuIGNsYXNzPVwicmV0dXJuXCI+JHt0eXBlU3RyaW5nKCB0eXBlICl9PC9zcGFuPmA7XG4gIH1cbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxuZnVuY3Rpb24gbmFtZUxvb2t1cCggYXJyYXk6IHN0cmluZ1tdLCBuYW1lOiBzdHJpbmcgKTogc3RyaW5nIHwgbnVsbCB7XG4gIGZvciAoIGxldCBpID0gMDsgaSA8IGFycmF5Lmxlbmd0aDsgaSsrICkge1xuICAgIGlmICggYXJyYXlbIGkgXS5uYW1lID09PSBuYW1lICkge1xuICAgICAgcmV0dXJuIGFycmF5WyBpIF07XG4gICAgfVxuICB9XG4gIHJldHVybiBudWxsO1xufVxuXG4vKipcbiAqIEZvciBhIGdpdmVuIGRvYyAoZXh0cmFjdERvY3VtZW50YXRpb24gb3V0cHV0KSBhbmQgYSBiYXNlIG5hbWUgZm9yIHRoZSBmaWxlIChlLmcuICdWZWN0b3IyJyBmb3IgVmVjdG9yMi5qcyksXG4gKiBjb2xsZWN0IHRvcC1sZXZlbCBkb2N1bWVudGF0aW9uIChhbmQgcHVibGljIGRvY3VtZW50YXRpb24gZm9yIGV2ZXJ5IHR5cGUgcmVmZXJlbmNlZCBpbiB0eXBlTm1hZXMpIGFuZCByZXR1cm4gYW5cbiAqIG9iamVjdDogeyBpbmRleEhUTUw6IHtzdHJpbmd9LCBjb250ZW50SFRNTDoge3N0cmluZ30gfSB3aGljaCBpbmNsdWRlcyB0aGUgSFRNTCBmb3IgdGhlIGluZGV4IChsaXN0IG9mIHR5cGVzIGFuZFxuICogbWV0aG9kcy9maWVsZHMvZXRjLikgYW5kIGNvbnRlbnQgKHRoZSBkb2N1bWVudGF0aW9uIGl0c2VsZikuXG4gKlxuICogQHBhcmFtIGRvY1xuICogQHBhcmFtIGJhc2VOYW1lXG4gKiBAcGFyYW0gdHlwZU5hbWVzIC0gTmFtZXMgb2YgdHlwZXMgZnJvbSB0aGlzIGZpbGUgdG8gaW5jbHVkZSBpbiB0aGUgZG9jdW1lbnRhdGlvbi5cbiAqIEBwYXJhbSBsb2NhbFR5cGVJZHMgLSBLZXlzIHNob3VsZCBiZSB0eXBlIG5hbWVzIGluY2x1ZGVkIGluIHRoZSBzYW1lIGRvY3VtZW50YXRpb24gb3V0cHV0LCBhbmQgdGhlIHZhbHVlc1xuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNob3VsZCBiZSBhIHByZWZpeCBhcHBsaWVkIGZvciBoYXNoIFVSTHMgb2YgdGhlIGdpdmVuIHR5cGUuIFRoaXMgaGVscHMgcHJlZml4XG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpbmdzLCBzbyBWZWN0b3IyLmFuZ2xlIHdpbGwgaGF2ZSBhIFVSTCAjdmVjdG9yMi1hbmdsZS5cbiAqIEBwYXJhbSBleHRlcm5hbFR5cGVVUkxzIC0gS2V5cyBzaG91bGQgYmUgdHlwZSBuYW1lcyBOT1QgaW5jbHVkZWQgaW4gdGhlIHNhbWUgZG9jdW1lbnRhdGlvbiBvdXRwdXQsIGFuZFxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZXMgc2hvdWxkIGJlIFVSTHMgZm9yIHRob3NlIHR5cGVzLlxuICogQHJldHVybnMgLSBXaXRoIGluZGV4SFRNTCBhbmQgY29udGVudEhUTUwgZmllbGRzLCBib3RoIHN0cmluZ3Mgb2YgSFRNTC5cbiAqL1xuZnVuY3Rpb24gZG9jdW1lbnRhdGlvblRvSFRNTCggZG9jOiBvYmplY3QsIGJhc2VOYW1lOiBzdHJpbmcsIHR5cGVOYW1lczogc3RyaW5nW10sIGxvY2FsVHlwZUlkczogb2JqZWN0LCBleHRlcm5hbFR5cGVVUkxzOiBvYmplY3QgKTogeyBpbmRleEhUTUw6IHN0cmluZzsgY29udGVudEhUTUw6IHN0cmluZyB9IHtcbiAgbGV0IGluZGV4SFRNTCA9ICcnO1xuICBsZXQgY29udGVudEhUTUwgPSAnJztcblxuICAvLyBJbml0aWFsaXplIHR5cGVVUkxzIGZvciB0aGUgb3V0cHV0XG4gIHR5cGVVUkxzID0ge307XG4gIE9iamVjdC5rZXlzKCBleHRlcm5hbFR5cGVVUkxzICkuZm9yRWFjaCggdHlwZUlkID0+IHtcbiAgICB0eXBlVVJMc1sgdHlwZUlkIF0gPSBleHRlcm5hbFR5cGVVUkxzWyB0eXBlSWQgXTtcbiAgfSApO1xuICBPYmplY3Qua2V5cyggbG9jYWxUeXBlSWRzICkuZm9yRWFjaCggdHlwZUlkID0+IHtcbiAgICB0eXBlVVJMc1sgdHlwZUlkIF0gPSBgIyR7bG9jYWxUeXBlSWRzWyB0eXBlSWQgXX1gO1xuICB9ICk7XG5cbiAgY29uc3QgYmFzZVVSTCA9IHR5cGVVUkxzWyBiYXNlTmFtZSBdO1xuXG4gIGluZGV4SFRNTCArPSBgPGEgY2xhc3M9XCJuYXZsaW5rXCIgaHJlZj1cIiR7YmFzZVVSTH1cIiBkYXRhLXRvZ2dsZT1cImNvbGxhcHNlXCIgZGF0YS10YXJnZXQ9XCIjY29sbGFwc2UtJHtiYXNlTmFtZX1cIiBvbmNsaWNrPVwiJCggJy5jb2xsYXBzZS5pbicgKS5jb2xsYXBzZSggJ3RvZ2dsZScgKTsgcmV0dXJuIHRydWU7XCI+JHtiYXNlTmFtZX08L2E+PGJyPlxcbmA7XG4gIGluZGV4SFRNTCArPSBgPGRpdiBpZD1cImNvbGxhcHNlLSR7YmFzZU5hbWV9XCIgY2xhc3M9XCJjb2xsYXBzZVwiPlxcbmA7XG5cbiAgY29udGVudEhUTUwgKz0gYDxoMyBpZD1cIiR7YmFzZVVSTC5zbGljZSggMSApfVwiIGNsYXNzPVwic2VjdGlvblwiPiR7YmFzZU5hbWV9PC9oMz5cXG5gO1xuICBjb250ZW50SFRNTCArPSBkZXNjcmlwdGlvbkhUTUwoIGRvYy50b3BMZXZlbENvbW1lbnQuZGVzY3JpcHRpb24gKTtcblxuICB0eXBlTmFtZXMuZm9yRWFjaCggdHlwZU5hbWUgPT4ge1xuICAgIGNvbnN0IGJhc2VPYmplY3QgPSBkb2NbIHR5cGVOYW1lIF07XG4gICAgY29uc3QgYmFzZVVSTFByZWZpeCA9IGAke2xvY2FsVHlwZUlkc1sgdHlwZU5hbWUgXX0tYDtcblxuICAgIC8vIGNvbnN0cnVjdG9yXG4gICAgaWYgKCBiYXNlT2JqZWN0LnR5cGUgPT09ICd0eXBlJyApIHtcbiAgICAgIC8vIEFkZCBhIHRhcmdldCBmb3IgIy1saW5rcyBpZiB3ZSBhcmVuJ3QgdGhlIGJhc2VOYW1lLlxuICAgICAgaWYgKCB0eXBlTmFtZSAhPT0gYmFzZU5hbWUgKSB7XG4gICAgICAgIGNvbnRlbnRIVE1MICs9IGA8ZGl2IGlkPVwiJHtiYXNlVVJMUHJlZml4LnNsaWNlKCAwLCBiYXNlVVJMUHJlZml4Lmxlbmd0aCAtIDEgKX1cIj48L2Rpdj5gO1xuICAgICAgfVxuICAgICAgbGV0IGNvbnN0cnVjdG9yTGluZSA9IHR5cGVOYW1lICsgaW5saW5lUGFyYW1ldGVyTGlzdCggYmFzZU9iamVjdC5jb21tZW50ICk7XG4gICAgICBpZiAoIGJhc2VPYmplY3Quc3VwZXJ0eXBlICkge1xuICAgICAgICBjb25zdHJ1Y3RvckxpbmUgKz0gYCA8c3BhbiBjbGFzcz1cImluaGVyaXRcIj5leHRlbmRzICR7dHlwZVN0cmluZyggYmFzZU9iamVjdC5zdXBlcnR5cGUgKX08L3NwYW4+YDtcbiAgICAgIH1cbiAgICAgIGNvbnRlbnRIVE1MICs9IGA8aDQgaWQ9XCIke2Jhc2VVUkxQcmVmaXh9Y29uc3RydWN0b3JcIiBjbGFzcz1cInNlY3Rpb25cIj4ke2NvbnN0cnVjdG9yTGluZX08L2g0PmA7XG4gICAgICBjb250ZW50SFRNTCArPSBkZXNjcmlwdGlvbkhUTUwoIGJhc2VPYmplY3QuY29tbWVudC5kZXNjcmlwdGlvbiApO1xuICAgICAgY29udGVudEhUTUwgKz0gcGFyYW1ldGVyRGV0YWlsc0xpc3QoIGJhc2VPYmplY3QuY29tbWVudCApO1xuICAgIH1cblxuICAgIGNvbnN0IHN0YXRpY1Byb3BlcnRpZXMgPSBiYXNlT2JqZWN0LnN0YXRpY1Byb3BlcnRpZXMgfHwgYmFzZU9iamVjdC5wcm9wZXJ0aWVzIHx8IFtdO1xuICAgIGNvbnN0IHN0YXRpY05hbWVzID0gc3RhdGljUHJvcGVydGllcy5tYXAoIHByb3AgPT4gcHJvcC5uYW1lICkuc29ydCgpO1xuICAgIHN0YXRpY05hbWVzLmZvckVhY2goIG5hbWUgPT4ge1xuICAgICAgY29uc3Qgb2JqZWN0ID0gbmFtZUxvb2t1cCggc3RhdGljUHJvcGVydGllcywgbmFtZSApO1xuXG4gICAgICBpbmRleEhUTUwgKz0gYDxhIGNsYXNzPVwic3VibGlua1wiIGhyZWY9XCIjJHtiYXNlVVJMUHJlZml4fSR7b2JqZWN0Lm5hbWV9XCI+JHtvYmplY3QubmFtZX08L2E+PGJyPmA7XG5cbiAgICAgIGxldCB0eXBlTGluZSA9IGA8c3BhbiBjbGFzcz1cImVudHJ5TmFtZVwiPiR7dHlwZU5hbWV9LiR7b2JqZWN0Lm5hbWV9PC9zcGFuPmA7XG4gICAgICB0eXBlTGluZSArPSBpbmxpbmVQYXJhbWV0ZXJMaXN0KCBvYmplY3QgKTtcbiAgICAgIHR5cGVMaW5lICs9IHJldHVybk9yQ29uc3RhbnQoIG9iamVjdCApO1xuICAgICAgY29udGVudEhUTUwgKz0gYDxoNSBpZD1cIiR7YmFzZVVSTFByZWZpeH0ke29iamVjdC5uYW1lfVwiIGNsYXNzPVwic2VjdGlvblwiPiR7dHlwZUxpbmV9PC9oNT5gO1xuICAgICAgaWYgKCBvYmplY3QuZGVzY3JpcHRpb24gKSB7XG4gICAgICAgIGNvbnRlbnRIVE1MICs9IGRlc2NyaXB0aW9uSFRNTCggb2JqZWN0LmRlc2NyaXB0aW9uICk7XG4gICAgICB9XG4gICAgICBjb250ZW50SFRNTCArPSBwYXJhbWV0ZXJEZXRhaWxzTGlzdCggb2JqZWN0ICk7XG5cbiAgICB9ICk7XG5cbiAgICBpZiAoIGJhc2VPYmplY3QudHlwZSA9PT0gJ3R5cGUnICkge1xuICAgICAgY29uc3QgY29uc3RydWN0b3JOYW1lcyA9IGJhc2VPYmplY3QuY29uc3RydWN0b3JQcm9wZXJ0aWVzLm1hcCggcHJvcCA9PiBwcm9wLm5hbWUgKS5zb3J0KCk7XG4gICAgICBjb25zdHJ1Y3Rvck5hbWVzLmZvckVhY2goIG5hbWUgPT4ge1xuICAgICAgICBjb25zdCBvYmplY3QgPSBuYW1lTG9va3VwKCBiYXNlT2JqZWN0LmNvbnN0cnVjdG9yUHJvcGVydGllcywgbmFtZSApO1xuXG4gICAgICAgIGluZGV4SFRNTCArPSBgPGEgY2xhc3M9XCJzdWJsaW5rXCIgaHJlZj1cIiMke2Jhc2VVUkxQcmVmaXh9JHtvYmplY3QubmFtZX1cIj4ke29iamVjdC5uYW1lfTwvYT48YnI+YDtcblxuICAgICAgICBsZXQgdHlwZUxpbmUgPSBgPHNwYW4gY2xhc3M9XCJlbnRyeU5hbWVcIj4ke29iamVjdC5uYW1lfTwvc3Bhbj5gO1xuICAgICAgICB0eXBlTGluZSArPSBgIDxzcGFuIGNsYXNzPVwicHJvcGVydHlcIj4ke3R5cGVTdHJpbmcoIG9iamVjdC50eXBlICl9PC9zcGFuPmA7XG4gICAgICAgIGNvbnRlbnRIVE1MICs9IGA8aDUgaWQ9XCIke2Jhc2VVUkxQcmVmaXh9JHtvYmplY3QubmFtZX1cIiBjbGFzcz1cInNlY3Rpb25cIj4ke3R5cGVMaW5lfTwvaDU+YDtcbiAgICAgICAgaWYgKCBvYmplY3QuZGVzY3JpcHRpb24gKSB7XG4gICAgICAgICAgY29udGVudEhUTUwgKz0gZGVzY3JpcHRpb25IVE1MKCBvYmplY3QuZGVzY3JpcHRpb24gKTtcbiAgICAgICAgfVxuICAgICAgfSApO1xuICAgIH1cbiAgICBpZiAoIGJhc2VPYmplY3QudHlwZSA9PT0gJ3R5cGUnICkge1xuICAgICAgY29uc3QgaW5zdGFuY2VOYW1lcyA9IGJhc2VPYmplY3QuaW5zdGFuY2VQcm9wZXJ0aWVzLm1hcCggcHJvcCA9PiBwcm9wLm5hbWUgKS5zb3J0KCk7XG4gICAgICBpbnN0YW5jZU5hbWVzLmZvckVhY2goIG5hbWUgPT4ge1xuICAgICAgICBjb25zdCBvYmplY3QgPSBuYW1lTG9va3VwKCBiYXNlT2JqZWN0Lmluc3RhbmNlUHJvcGVydGllcywgbmFtZSApO1xuXG4gICAgICAgIGluZGV4SFRNTCArPSBgPGEgY2xhc3M9XCJzdWJsaW5rXCIgaHJlZj1cIiMke2Jhc2VVUkxQcmVmaXh9JHtvYmplY3QubmFtZX1cIj4ke29iamVjdC5uYW1lfTwvYT48YnI+YDtcblxuICAgICAgICBsZXQgdHlwZUxpbmUgPSBgPHNwYW4gY2xhc3M9XCJlbnRyeU5hbWVcIj4ke29iamVjdC5uYW1lfTwvc3Bhbj5gO1xuICAgICAgICBpZiAoIG9iamVjdC5leHBsaWNpdEdldE5hbWUgKSB7XG4gICAgICAgICAgdHlwZUxpbmUgKz0gYCA8c3BhbiBjbGFzcz1cInByb3BlcnR5XCI+JHt0eXBlU3RyaW5nKCBvYmplY3QucmV0dXJucy50eXBlICl9PC9zcGFuPmA7XG4gICAgICAgICAgdHlwZUxpbmUgKz0gYCA8c3BhbiBjbGFzcz1cImVudHJ5TmFtZSBleHBsaWNpdFNldHRlckdldHRlclwiPiR7b2JqZWN0LmV4cGxpY2l0R2V0TmFtZX1gO1xuICAgICAgICB9XG4gICAgICAgIGlmICggb2JqZWN0LmV4cGxpY2l0U2V0TmFtZSApIHtcbiAgICAgICAgICB0eXBlTGluZSArPSBgIDxzcGFuIGNsYXNzPVwicHJvcGVydHlcIj4ke3R5cGVTdHJpbmcoIG9iamVjdC5yZXR1cm5zLnR5cGUgKX08L3NwYW4+YDtcbiAgICAgICAgICB0eXBlTGluZSArPSBgIDxzcGFuIGNsYXNzPVwiZW50cnlOYW1lIGV4cGxpY2l0U2V0dGVyR2V0dGVyXCI+JHtvYmplY3QuZXhwbGljaXRTZXROYW1lfWA7XG4gICAgICAgIH1cbiAgICAgICAgdHlwZUxpbmUgKz0gaW5saW5lUGFyYW1ldGVyTGlzdCggb2JqZWN0ICk7XG4gICAgICAgIHR5cGVMaW5lICs9IHJldHVybk9yQ29uc3RhbnQoIG9iamVjdCApO1xuICAgICAgICBpZiAoIG9iamVjdC5leHBsaWNpdFNldE5hbWUgfHwgb2JqZWN0LmV4cGxpY2l0R2V0TmFtZSApIHtcbiAgICAgICAgICB0eXBlTGluZSArPSAnPC9zcGFuPic7XG4gICAgICAgIH1cbiAgICAgICAgY29udGVudEhUTUwgKz0gYDxoNSBpZD1cIiR7YmFzZVVSTFByZWZpeH0ke29iamVjdC5uYW1lfVwiIGNsYXNzPVwic2VjdGlvblwiPiR7dHlwZUxpbmV9PC9oNT5gO1xuICAgICAgICBjb250ZW50SFRNTCArPSBkZXNjcmlwdGlvbkhUTUwoIG9iamVjdC5kZXNjcmlwdGlvbiApO1xuICAgICAgICBjb250ZW50SFRNTCArPSBwYXJhbWV0ZXJEZXRhaWxzTGlzdCggb2JqZWN0ICk7XG4gICAgICB9ICk7XG4gICAgfVxuICB9ICk7XG5cbiAgaW5kZXhIVE1MICs9ICc8L2Rpdj4nO1xuXG4gIHJldHVybiB7XG4gICAgaW5kZXhIVE1MOiBpbmRleEhUTUwsXG4gICAgY29udGVudEhUTUw6IGNvbnRlbnRIVE1MXG4gIH07XG59XG5cbmV4cG9ydCBkZWZhdWx0IGRvY3VtZW50YXRpb25Ub0hUTUw7Il0sIm5hbWVzIjpbInR5cGVVUkxzIiwiZXNjYXBlSFRNTCIsInN0ciIsInJlcGxhY2UiLCJkZXNjcmlwdGlvbkhUTUwiLCJzdHJpbmciLCJyZXN1bHQiLCJsaW5lcyIsInNwbGl0IiwiaW5QYXJhZ3JhcGgiLCJpbnNpZGVQYXJhZ3JhcGgiLCJvdXRzaWRlUGFyYWdyYXBoIiwiaSIsImxlbmd0aCIsImxpbmUiLCJzdGFydHNXaXRoIiwiaW5pdGlhbExpbmUiLCJydW5MaW5lcyIsImRpc3BsYXlMaW5lcyIsImlzRGlzcGxheWVkIiwicHVzaCIsInJ1blN0cmluZyIsImpvaW4iLCJkaXNwbGF5U3RyaW5nIiwiY2FudmFzRXhhbXBsZU1hdGNoIiwibWF0Y2giLCJuYW1lIiwid2lkdGgiLCJoZWlnaHQiLCJleGFtcGxlTmFtZSIsInR5cGVTdHJpbmciLCJ0eXBlIiwidXJsIiwiaW5saW5lUGFyYW1ldGVyTGlzdCIsIm9iamVjdCIsInBhcmFtZXRlcnMiLCJtYXAiLCJwYXJhbWV0ZXIiLCJvcHRpb25hbCIsInBhcmFtZXRlckRldGFpbHNMaXN0IiwicGFyYW1ldGVyc1dpdGhEZXNjcmlwdGlvbnMiLCJmaWx0ZXIiLCJkZXNjcmlwdGlvbiIsImZvckVhY2giLCJyZXR1cm5PckNvbnN0YW50IiwicmV0dXJucyIsImNvbnN0YW50IiwibmFtZUxvb2t1cCIsImFycmF5IiwiZG9jdW1lbnRhdGlvblRvSFRNTCIsImRvYyIsImJhc2VOYW1lIiwidHlwZU5hbWVzIiwibG9jYWxUeXBlSWRzIiwiZXh0ZXJuYWxUeXBlVVJMcyIsImluZGV4SFRNTCIsImNvbnRlbnRIVE1MIiwiT2JqZWN0Iiwia2V5cyIsInR5cGVJZCIsImJhc2VVUkwiLCJzbGljZSIsInRvcExldmVsQ29tbWVudCIsInR5cGVOYW1lIiwiYmFzZU9iamVjdCIsImJhc2VVUkxQcmVmaXgiLCJjb25zdHJ1Y3RvckxpbmUiLCJjb21tZW50Iiwic3VwZXJ0eXBlIiwic3RhdGljUHJvcGVydGllcyIsInByb3BlcnRpZXMiLCJzdGF0aWNOYW1lcyIsInByb3AiLCJzb3J0IiwidHlwZUxpbmUiLCJjb25zdHJ1Y3Rvck5hbWVzIiwiY29uc3RydWN0b3JQcm9wZXJ0aWVzIiwiaW5zdGFuY2VOYW1lcyIsImluc3RhbmNlUHJvcGVydGllcyIsImV4cGxpY2l0R2V0TmFtZSIsImV4cGxpY2l0U2V0TmFtZSJdLCJtYXBwaW5ncyI6IkFBQUEsc0RBQXNEO0FBRXRELG9EQUFvRDtBQUNwRCxjQUFjO0FBRWQ7Ozs7O0NBS0MsR0FFRCxJQUFJQSxXQUFXO0FBRWY7QUFFQSwyQkFBMkI7QUFDM0IsU0FBU0MsV0FBWUMsR0FBRztJQUN0Qix3RkFBd0Y7SUFDeEYsdUJBQXVCO0lBQ3ZCLE9BQU9BLElBQ0pDLE9BQU8sQ0FBRSxNQUFNLFNBQ2ZBLE9BQU8sQ0FBRSxNQUFNLFFBQ2ZBLE9BQU8sQ0FBRSxNQUFNLFFBQ2ZBLE9BQU8sQ0FBRSxNQUFNLFVBQ2ZBLE9BQU8sQ0FBRSxNQUFNLFVBQ2ZBLE9BQU8sQ0FBRSxPQUFPO0FBQ3JCO0FBRUE7Ozs7Q0FJQyxHQUNELFNBQVNDLGdCQUFpQkMsTUFBYztJQUN0QyxJQUFJQyxTQUFTO0lBQ2IsTUFBTUMsUUFBUUYsT0FBT0csS0FBSyxDQUFFO0lBRTVCLElBQUlDLGNBQWM7SUFFbEIsU0FBU0M7UUFDUCxJQUFLLENBQUNELGFBQWM7WUFDbEJILFVBQVU7WUFDVkcsY0FBYztRQUNoQjtJQUNGO0lBRUEsU0FBU0U7UUFDUCxJQUFLRixh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