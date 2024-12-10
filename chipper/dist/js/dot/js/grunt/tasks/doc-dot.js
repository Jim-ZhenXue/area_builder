// Copyright 2024, University of Colorado Boulder
/**
 * Generates Documentation for dot
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ import fs from 'fs';
import documentationToHTML from '../../../../chipper/js/common/documentationToHTML.js';
import extractDocumentation from '../../../../chipper/js/common/extractDocumentation.js';
const esprima = require('esprima');
const jsBeautify = require('js-beautify');
// constants
const beautify_html = jsBeautify.html;
let indexHTML = '';
let contentHTML = '';
const localTypeIds = {
    BinPacker: 'binPacker',
    Bin: 'binPacker-bin',
    Bounds2: 'bounds2',
    Bounds3: 'bounds3',
    Complex: 'complex',
    ConvexHull2: 'convexHull2',
    Dimension2: 'dimension2',
    EigenvalueDecomposition: 'eigenvalueDecomposition',
    LinearFunction: 'linearFunction',
    LUDecomposition: 'luDecomposition',
    Matrix: 'matrix',
    Matrix3: 'matrix3',
    Matrix4: 'matrix4',
    MatrixOps3: 'matrixOps3',
    Permutation: 'permutation',
    Plane3: 'plane3',
    QRDecomposition: 'qrDecomposition',
    Quaternion: 'quaternion',
    Random: 'random',
    Range: 'range',
    Ray2: 'ray2',
    Ray3: 'ray3',
    Rectangle: 'rectangle',
    SingularValueDecomposition: 'singularValueDecomposition',
    Sphere3: 'sphere3',
    Transform3: 'transform3',
    Transform4: 'transform4',
    Utils: 'util',
    Vector2: 'vector2',
    Vector3: 'vector3',
    Vector4: 'vector4'
};
const externalTypeURLs = {
    Events: '../../axon/doc#events',
    Shape: '../../kite/doc#shape'
};
function docFile(file, baseName, typeNames) {
    const codeFile = fs.readFileSync(file, 'utf8');
    const program = esprima.parse(codeFile, {
        attachComment: true
    });
    const doc = extractDocumentation(program);
    if (baseName === 'ConvexHull2') {
    // console.log( JSON.stringify( doc, null, 2 ) );
    }
    const htmlDoc = documentationToHTML(doc, baseName, typeNames, localTypeIds, externalTypeURLs);
    indexHTML += htmlDoc.indexHTML;
    contentHTML += htmlDoc.contentHTML;
}
docFile('js/BinPacker.js', 'BinPacker', [
    'BinPacker',
    'Bin'
]);
docFile('js/Bounds2.js', 'Bounds2', [
    'Bounds2'
]);
docFile('js/Bounds3.js', 'Bounds3', [
    'Bounds3'
]);
docFile('js/Complex.js', 'Complex', [
    'Complex'
]);
docFile('js/ConvexHull2.js', 'ConvexHull2', [
    'ConvexHull2'
]);
docFile('js/Dimension2.js', 'Dimension2', [
    'Dimension2'
]);
docFile('js/Transform3.js', 'Transform3', [
    'Transform3'
]);
docFile('js/Transform4.js', 'Transform4', [
    'Transform4'
]);
docFile('js/Utils.js', 'Utils', [
    'Utils'
]);
docFile('js/Vector2.js', 'Vector2', [
    'Vector2'
]);
docFile('js/Vector3.js', 'Vector3', [
    'Vector3'
]);
docFile('js/Vector4.js', 'Vector4', [
    'Vector4'
]);
const template = fs.readFileSync('doc/template.html', 'utf8');
let html = template.replace('{{API_INDEX}}', indexHTML).replace('{{API_CONTENT}}', contentHTML);
html = beautify_html(html, {
    indent_size: 2
});
fs.writeFileSync('doc/index.html', html); // TODO: Why does this not fail lint in Webstorm? Rename grunt/tasks/eslint.config.mjs and it fails correctly. https://github.com/phetsims/chipper/issues/1483
 // (async()=>{})();

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL2RvdC9qcy9ncnVudC90YXNrcy9kb2MtZG90LnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDI0LCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuLyoqXG4gKiBHZW5lcmF0ZXMgRG9jdW1lbnRhdGlvbiBmb3IgZG90XG4gKiBAYXV0aG9yIEpvbmF0aGFuIE9sc29uIDxqb25hdGhhbi5vbHNvbkBjb2xvcmFkby5lZHU+XG4gKi9cblxuaW1wb3J0IGZzIGZyb20gJ2ZzJztcbmltcG9ydCBkb2N1bWVudGF0aW9uVG9IVE1MIGZyb20gJy4uLy4uLy4uLy4uL2NoaXBwZXIvanMvY29tbW9uL2RvY3VtZW50YXRpb25Ub0hUTUwuanMnO1xuaW1wb3J0IGV4dHJhY3REb2N1bWVudGF0aW9uIGZyb20gJy4uLy4uLy4uLy4uL2NoaXBwZXIvanMvY29tbW9uL2V4dHJhY3REb2N1bWVudGF0aW9uLmpzJztcblxuY29uc3QgZXNwcmltYSA9IHJlcXVpcmUoICdlc3ByaW1hJyApO1xuY29uc3QganNCZWF1dGlmeSA9IHJlcXVpcmUoICdqcy1iZWF1dGlmeScgKTtcblxuLy8gY29uc3RhbnRzXG5jb25zdCBiZWF1dGlmeV9odG1sID0ganNCZWF1dGlmeS5odG1sO1xuXG5sZXQgaW5kZXhIVE1MID0gJyc7XG5sZXQgY29udGVudEhUTUwgPSAnJztcblxuY29uc3QgbG9jYWxUeXBlSWRzID0ge1xuICBCaW5QYWNrZXI6ICdiaW5QYWNrZXInLFxuICBCaW46ICdiaW5QYWNrZXItYmluJyxcbiAgQm91bmRzMjogJ2JvdW5kczInLFxuICBCb3VuZHMzOiAnYm91bmRzMycsXG4gIENvbXBsZXg6ICdjb21wbGV4JyxcbiAgQ29udmV4SHVsbDI6ICdjb252ZXhIdWxsMicsXG4gIERpbWVuc2lvbjI6ICdkaW1lbnNpb24yJyxcbiAgRWlnZW52YWx1ZURlY29tcG9zaXRpb246ICdlaWdlbnZhbHVlRGVjb21wb3NpdGlvbicsXG4gIExpbmVhckZ1bmN0aW9uOiAnbGluZWFyRnVuY3Rpb24nLFxuICBMVURlY29tcG9zaXRpb246ICdsdURlY29tcG9zaXRpb24nLFxuICBNYXRyaXg6ICdtYXRyaXgnLFxuICBNYXRyaXgzOiAnbWF0cml4MycsXG4gIE1hdHJpeDQ6ICdtYXRyaXg0JyxcbiAgTWF0cml4T3BzMzogJ21hdHJpeE9wczMnLFxuICBQZXJtdXRhdGlvbjogJ3Blcm11dGF0aW9uJyxcbiAgUGxhbmUzOiAncGxhbmUzJyxcbiAgUVJEZWNvbXBvc2l0aW9uOiAncXJEZWNvbXBvc2l0aW9uJyxcbiAgUXVhdGVybmlvbjogJ3F1YXRlcm5pb24nLFxuICBSYW5kb206ICdyYW5kb20nLFxuICBSYW5nZTogJ3JhbmdlJyxcbiAgUmF5MjogJ3JheTInLFxuICBSYXkzOiAncmF5MycsXG4gIFJlY3RhbmdsZTogJ3JlY3RhbmdsZScsIC8vIFRPRE86IEhvdyB0byBub3QgaGF2ZSBhIG5hbWVzcGFjZSBjb25mbGljdD8gaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2RvdC9pc3N1ZXMvOTZcbiAgU2luZ3VsYXJWYWx1ZURlY29tcG9zaXRpb246ICdzaW5ndWxhclZhbHVlRGVjb21wb3NpdGlvbicsXG4gIFNwaGVyZTM6ICdzcGhlcmUzJyxcbiAgVHJhbnNmb3JtMzogJ3RyYW5zZm9ybTMnLFxuICBUcmFuc2Zvcm00OiAndHJhbnNmb3JtNCcsXG4gIFV0aWxzOiAndXRpbCcsXG4gIFZlY3RvcjI6ICd2ZWN0b3IyJyxcbiAgVmVjdG9yMzogJ3ZlY3RvcjMnLFxuICBWZWN0b3I0OiAndmVjdG9yNCdcbn07XG5cbmNvbnN0IGV4dGVybmFsVHlwZVVSTHMgPSB7XG4gIEV2ZW50czogJy4uLy4uL2F4b24vZG9jI2V2ZW50cycsXG4gIFNoYXBlOiAnLi4vLi4va2l0ZS9kb2Mjc2hhcGUnXG59O1xuXG5mdW5jdGlvbiBkb2NGaWxlKCBmaWxlOiBzdHJpbmcsIGJhc2VOYW1lOiBzdHJpbmcsIHR5cGVOYW1lczogc3RyaW5nW10gKTogdm9pZCB7XG4gIGNvbnN0IGNvZGVGaWxlID0gZnMucmVhZEZpbGVTeW5jKCBmaWxlLCAndXRmOCcgKTtcbiAgY29uc3QgcHJvZ3JhbSA9IGVzcHJpbWEucGFyc2UoIGNvZGVGaWxlLCB7XG4gICAgYXR0YWNoQ29tbWVudDogdHJ1ZVxuICB9ICk7XG4gIGNvbnN0IGRvYyA9IGV4dHJhY3REb2N1bWVudGF0aW9uKCBwcm9ncmFtICk7XG4gIGlmICggYmFzZU5hbWUgPT09ICdDb252ZXhIdWxsMicgKSB7IC8vIGZvciB0ZXN0aW5nXG4gICAgLy8gY29uc29sZS5sb2coIEpTT04uc3RyaW5naWZ5KCBkb2MsIG51bGwsIDIgKSApO1xuICB9XG4gIGNvbnN0IGh0bWxEb2MgPSBkb2N1bWVudGF0aW9uVG9IVE1MKCBkb2MsIGJhc2VOYW1lLCB0eXBlTmFtZXMsIGxvY2FsVHlwZUlkcywgZXh0ZXJuYWxUeXBlVVJMcyApO1xuXG4gIGluZGV4SFRNTCArPSBodG1sRG9jLmluZGV4SFRNTDtcbiAgY29udGVudEhUTUwgKz0gaHRtbERvYy5jb250ZW50SFRNTDtcbn1cblxuZG9jRmlsZSggJ2pzL0JpblBhY2tlci5qcycsICdCaW5QYWNrZXInLCBbICdCaW5QYWNrZXInLCAnQmluJyBdICk7XG5kb2NGaWxlKCAnanMvQm91bmRzMi5qcycsICdCb3VuZHMyJywgWyAnQm91bmRzMicgXSApO1xuZG9jRmlsZSggJ2pzL0JvdW5kczMuanMnLCAnQm91bmRzMycsIFsgJ0JvdW5kczMnIF0gKTtcbmRvY0ZpbGUoICdqcy9Db21wbGV4LmpzJywgJ0NvbXBsZXgnLCBbICdDb21wbGV4JyBdICk7XG5kb2NGaWxlKCAnanMvQ29udmV4SHVsbDIuanMnLCAnQ29udmV4SHVsbDInLCBbICdDb252ZXhIdWxsMicgXSApO1xuZG9jRmlsZSggJ2pzL0RpbWVuc2lvbjIuanMnLCAnRGltZW5zaW9uMicsIFsgJ0RpbWVuc2lvbjInIF0gKTtcbmRvY0ZpbGUoICdqcy9UcmFuc2Zvcm0zLmpzJywgJ1RyYW5zZm9ybTMnLCBbICdUcmFuc2Zvcm0zJyBdICk7XG5kb2NGaWxlKCAnanMvVHJhbnNmb3JtNC5qcycsICdUcmFuc2Zvcm00JywgWyAnVHJhbnNmb3JtNCcgXSApO1xuZG9jRmlsZSggJ2pzL1V0aWxzLmpzJywgJ1V0aWxzJywgWyAnVXRpbHMnIF0gKTtcbmRvY0ZpbGUoICdqcy9WZWN0b3IyLmpzJywgJ1ZlY3RvcjInLCBbICdWZWN0b3IyJyBdICk7XG5kb2NGaWxlKCAnanMvVmVjdG9yMy5qcycsICdWZWN0b3IzJywgWyAnVmVjdG9yMycgXSApO1xuZG9jRmlsZSggJ2pzL1ZlY3RvcjQuanMnLCAnVmVjdG9yNCcsIFsgJ1ZlY3RvcjQnIF0gKTtcblxuY29uc3QgdGVtcGxhdGUgPSBmcy5yZWFkRmlsZVN5bmMoICdkb2MvdGVtcGxhdGUuaHRtbCcsICd1dGY4JyApO1xuXG5sZXQgaHRtbCA9IHRlbXBsYXRlLnJlcGxhY2UoICd7e0FQSV9JTkRFWH19JywgaW5kZXhIVE1MICkucmVwbGFjZSggJ3t7QVBJX0NPTlRFTlR9fScsIGNvbnRlbnRIVE1MICk7XG5cbmh0bWwgPSBiZWF1dGlmeV9odG1sKCBodG1sLCB7IGluZGVudF9zaXplOiAyIH0gKTtcblxuZnMud3JpdGVGaWxlU3luYyggJ2RvYy9pbmRleC5odG1sJywgaHRtbCApO1xuXG4vLyBUT0RPOiBXaHkgZG9lcyB0aGlzIG5vdCBmYWlsIGxpbnQgaW4gV2Vic3Rvcm0/IFJlbmFtZSBncnVudC90YXNrcy9lc2xpbnQuY29uZmlnLm1qcyBhbmQgaXQgZmFpbHMgY29ycmVjdGx5LiBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvY2hpcHBlci9pc3N1ZXMvMTQ4M1xuLy8gKGFzeW5jKCk9Pnt9KSgpOyJdLCJuYW1lcyI6WyJmcyIsImRvY3VtZW50YXRpb25Ub0hUTUwiLCJleHRyYWN0RG9jdW1lbnRhdGlvbiIsImVzcHJpbWEiLCJyZXF1aXJlIiwianNCZWF1dGlmeSIsImJlYXV0aWZ5X2h0bWwiLCJodG1sIiwiaW5kZXhIVE1MIiwiY29udGVudEhUTUwiLCJsb2NhbFR5cGVJZHMiLCJCaW5QYWNrZXIiLCJCaW4iLCJCb3VuZHMyIiwiQm91bmRzMyIsIkNvbXBsZXgiLCJDb252ZXhIdWxsMiIsIkRpbWVuc2lvbjIiLCJFaWdlbnZhbHVlRGVjb21wb3NpdGlvbiIsIkxpbmVhckZ1bmN0aW9uIiwiTFVEZWNvbXBvc2l0aW9uIiwiTWF0cml4IiwiTWF0cml4MyIsIk1hdHJpeDQiLCJNYXRyaXhPcHMzIiwiUGVybXV0YXRpb24iLCJQbGFuZTMiLCJRUkRlY29tcG9zaXRpb24iLCJRdWF0ZXJuaW9uIiwiUmFuZG9tIiwiUmFuZ2UiLCJSYXkyIiwiUmF5MyIsIlJlY3RhbmdsZSIsIlNpbmd1bGFyVmFsdWVEZWNvbXBvc2l0aW9uIiwiU3BoZXJlMyIsIlRyYW5zZm9ybTMiLCJUcmFuc2Zvcm00IiwiVXRpbHMiLCJWZWN0b3IyIiwiVmVjdG9yMyIsIlZlY3RvcjQiLCJleHRlcm5hbFR5cGVVUkxzIiwiRXZlbnRzIiwiU2hhcGUiLCJkb2NGaWxlIiwiZmlsZSIsImJhc2VOYW1lIiwidHlwZU5hbWVzIiwiY29kZUZpbGUiLCJyZWFkRmlsZVN5bmMiLCJwcm9ncmFtIiwicGFyc2UiLCJhdHRhY2hDb21tZW50IiwiZG9jIiwiaHRtbERvYyIsInRlbXBsYXRlIiwicmVwbGFjZSIsImluZGVudF9zaXplIiwid3JpdGVGaWxlU3luYyJdLCJtYXBwaW5ncyI6IkFBQUEsaURBQWlEO0FBRWpEOzs7Q0FHQyxHQUVELE9BQU9BLFFBQVEsS0FBSztBQUNwQixPQUFPQyx5QkFBeUIsdURBQXVEO0FBQ3ZGLE9BQU9DLDBCQUEwQix3REFBd0Q7QUFFekYsTUFBTUMsVUFBVUMsUUFBUztBQUN6QixNQUFNQyxhQUFhRCxRQUFTO0FBRTVCLFlBQVk7QUFDWixNQUFNRSxnQkFBZ0JELFdBQVdFLElBQUk7QUFFckMsSUFBSUMsWUFBWTtBQUNoQixJQUFJQyxjQUFjO0FBRWxCLE1BQU1DLGVBQWU7SUFDbkJDLFdBQVc7SUFDWEMsS0FBSztJQUNMQyxTQUFTO0lBQ1RDLFNBQVM7SUFDVEMsU0FBUztJQUNUQyxhQUFhO0lBQ2JDLFlBQVk7SUFDWkMseUJBQXlCO0lBQ3pCQyxnQkFBZ0I7SUFDaEJDLGlCQUFpQjtJQUNqQkMsUUFBUTtJQUNSQyxTQUFTO0lBQ1RDLFNBQVM7SUFDVEMsWUFBWTtJQUNaQyxhQUFhO0lBQ2JDLFFBQVE7SUFDUkMsaUJBQWlCO0lBQ2pCQyxZQUFZO0lBQ1pDLFFBQVE7SUFDUkMsT0FBTztJQUNQQyxNQUFNO0lBQ05DLE1BQU07SUFDTkMsV0FBVztJQUNYQyw0QkFBNEI7SUFDNUJDLFNBQVM7SUFDVEMsWUFBWTtJQUNaQyxZQUFZO0lBQ1pDLE9BQU87SUFDUEMsU0FBUztJQUNUQyxTQUFTO0lBQ1RDLFNBQVM7QUFDWDtBQUVBLE1BQU1DLG1CQUFtQjtJQUN2QkMsUUFBUTtJQUNSQyxPQUFPO0FBQ1Q7QUFFQSxTQUFTQyxRQUFTQyxJQUFZLEVBQUVDLFFBQWdCLEVBQUVDLFNBQW1CO0lBQ25FLE1BQU1DLFdBQVdqRCxHQUFHa0QsWUFBWSxDQUFFSixNQUFNO0lBQ3hDLE1BQU1LLFVBQVVoRCxRQUFRaUQsS0FBSyxDQUFFSCxVQUFVO1FBQ3ZDSSxlQUFlO0lBQ2pCO0lBQ0EsTUFBTUMsTUFBTXBELHFCQUFzQmlEO0lBQ2xDLElBQUtKLGFBQWEsZUFBZ0I7SUFDaEMsaURBQWlEO0lBQ25EO0lBQ0EsTUFBTVEsVUFBVXRELG9CQUFxQnFELEtBQUtQLFVBQVVDLFdBQVd0QyxjQUFjZ0M7SUFFN0VsQyxhQUFhK0MsUUFBUS9DLFNBQVM7SUFDOUJDLGVBQWU4QyxRQUFROUMsV0FBVztBQUNwQztBQUVBb0MsUUFBUyxtQkFBbUIsYUFBYTtJQUFFO0lBQWE7Q0FBTztBQUMvREEsUUFBUyxpQkFBaUIsV0FBVztJQUFFO0NBQVc7QUFDbERBLFFBQVMsaUJBQWlCLFdBQVc7SUFBRTtDQUFXO0FBQ2xEQSxRQUFTLGlCQUFpQixXQUFXO0lBQUU7Q0FBVztBQUNsREEsUUFBUyxxQkFBcUIsZUFBZTtJQUFFO0NBQWU7QUFDOURBLFFBQVMsb0JBQW9CLGNBQWM7SUFBRTtDQUFjO0FBQzNEQSxRQUFTLG9CQUFvQixjQUFjO0lBQUU7Q0FBYztBQUMzREEsUUFBUyxvQkFBb0IsY0FBYztJQUFFO0NBQWM7QUFDM0RBLFFBQVMsZUFBZSxTQUFTO0lBQUU7Q0FBUztBQUM1Q0EsUUFBUyxpQkFBaUIsV0FBVztJQUFFO0NBQVc7QUFDbERBLFFBQVMsaUJBQWlCLFdBQVc7SUFBRTtDQUFXO0FBQ2xEQSxRQUFTLGlCQUFpQixXQUFXO0lBQUU7Q0FBVztBQUVsRCxNQUFNVyxXQUFXeEQsR0FBR2tELFlBQVksQ0FBRSxxQkFBcUI7QUFFdkQsSUFBSTNDLE9BQU9pRCxTQUFTQyxPQUFPLENBQUUsaUJBQWlCakQsV0FBWWlELE9BQU8sQ0FBRSxtQkFBbUJoRDtBQUV0RkYsT0FBT0QsY0FBZUMsTUFBTTtJQUFFbUQsYUFBYTtBQUFFO0FBRTdDMUQsR0FBRzJELGFBQWEsQ0FBRSxrQkFBa0JwRCxPQUVwQyw4SkFBOEo7Q0FDOUosbUJBQW1CIn0=