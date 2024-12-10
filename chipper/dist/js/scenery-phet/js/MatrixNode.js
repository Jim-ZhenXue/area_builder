// Copyright 2021-2022, University of Colorado Boulder
/**
 * MatrixNode displays an MxN matrix.
 *
 * Example usage:
 * const matrixNode = new MatrixNode( [ [ 2, 3, -2 ], [ 1, 0, -4 ], [ 2, -1, -6 ] ], { ... } );
 *
 * NOTE: This was implemented for demonstration purposes, in response to this question in the Google Group
 * 'Developing Interactive Simulations in HTML5':
 * https://groups.google.com/g/developing-interactive-simulations-in-html5/c/kZPE82qE2qg?pli=1
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */ import Matrix3 from '../../dot/js/Matrix3.js';
import Utils from '../../dot/js/Utils.js';
import { Shape } from '../../kite/js/imports.js';
import merge from '../../phet-core/js/merge.js';
import PhetFont from '../../scenery-phet/js/PhetFont.js';
import { AlignBox, AlignGroup, HBox, Node, Path, Text, VBox } from '../../scenery/js/imports.js';
import sceneryPhet from './sceneryPhet.js';
let MatrixNode = class MatrixNode extends Node {
    /**
   * @param {Array.<Array[number|string]>} matrix - an MxN matrix, in row-major order
   * @param {Object} [options]
   */ constructor(matrix, options){
        assert && assert(Array.isArray(matrix) && matrix.length > 0, 'matrix must be an array with length > 0');
        assert && assert(_.every(matrix, (row)=>Array.isArray(row) && row.length > 0), 'each element of matrix must be an array with length > 0');
        assert && assert(_.every(matrix, (row)=>row.length === matrix[0].length), 'each row of the matrix must have the same number of values');
        assert && assert(_.every(matrix, (row)=>_.every(row, (value)=>typeof value === 'number' || typeof value === 'string')), 'all values must be numbers or strings');
        options = merge({
            font: new PhetFont(20),
            decimalPlaces: 0,
            stripTrailingZeros: true,
            cellXSpacing: 25,
            cellYSpacing: 5,
            leftBracketXSpacing: 10,
            rightBracketXSpacing: 10,
            bracketWidth: 8,
            bracketHeightPadding: 5,
            // Path options for the brackets
            bracketNodeOptions: {
                stroke: 'black',
                lineWidth: 2
            }
        }, options);
        const alignBoxOptions = {
            group: new AlignGroup(),
            xAlign: 'right'
        };
        // Create an HBox for each row.
        const rowNodes = [];
        matrix.forEach((row)=>{
            const cellNodes = [];
            row.forEach((value)=>{
                let valueString;
                if (typeof value === 'string') {
                    // value is a string, use it as is.
                    valueString = value;
                } else {
                    // value is a number, round it to the desired number of decimal places.
                    valueString = options.stripTrailingZeros ? '' + Utils.toFixedNumber(value, options.decimalPlaces) : Utils.toFixed(value, options.decimalPlaces);
                }
                // Cell value
                const cellNode = new Text(valueString, {
                    font: options.font
                });
                // Wrap in an AlignBox, so that all cells have the same effective dimensions.
                cellNodes.push(new AlignBox(cellNode, alignBoxOptions));
            });
            rowNodes.push(new HBox({
                children: cellNodes,
                spacing: options.cellXSpacing
            }));
        });
        // Arrange the rows in a VBox to create a grid.
        const gridNode = new VBox({
            children: rowNodes,
            spacing: options.cellYSpacing,
            align: 'right'
        });
        // Left bracket
        const bracketHeight = gridNode.height + 2 * options.bracketHeightPadding;
        const leftBracketShape = new Shape().moveTo(0, 0).lineTo(-options.bracketWidth, 0).lineTo(-options.bracketWidth, bracketHeight).lineTo(0, bracketHeight);
        const leftBracketNode = new Path(leftBracketShape, merge({
            right: gridNode.left - options.leftBracketXSpacing,
            centerY: gridNode.centerY
        }, options.bracketNodeOptions));
        // Right bracket, which reuses leftBracketShape.
        const rightBracketShape = leftBracketShape.transformed(new Matrix3().setToScale(-1, 1));
        const rightBracketNode = new Path(rightBracketShape, merge({
            left: gridNode.right + options.rightBracketXSpacing,
            centerY: gridNode.centerY
        }, options.bracketNodeOptions));
        // Wrap in a Node so we don't expose the HBox API.
        assert && assert(!options.children);
        options.children = [
            leftBracketNode,
            gridNode,
            rightBracketNode
        ];
        super(options);
    }
};
sceneryPhet.register('MatrixNode', MatrixNode);
export default MatrixNode;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9NYXRyaXhOb2RlLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDIxLTIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIE1hdHJpeE5vZGUgZGlzcGxheXMgYW4gTXhOIG1hdHJpeC5cbiAqXG4gKiBFeGFtcGxlIHVzYWdlOlxuICogY29uc3QgbWF0cml4Tm9kZSA9IG5ldyBNYXRyaXhOb2RlKCBbIFsgMiwgMywgLTIgXSwgWyAxLCAwLCAtNCBdLCBbIDIsIC0xLCAtNiBdIF0sIHsgLi4uIH0gKTtcbiAqXG4gKiBOT1RFOiBUaGlzIHdhcyBpbXBsZW1lbnRlZCBmb3IgZGVtb25zdHJhdGlvbiBwdXJwb3NlcywgaW4gcmVzcG9uc2UgdG8gdGhpcyBxdWVzdGlvbiBpbiB0aGUgR29vZ2xlIEdyb3VwXG4gKiAnRGV2ZWxvcGluZyBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucyBpbiBIVE1MNSc6XG4gKiBodHRwczovL2dyb3Vwcy5nb29nbGUuY29tL2cvZGV2ZWxvcGluZy1pbnRlcmFjdGl2ZS1zaW11bGF0aW9ucy1pbi1odG1sNS9jL2taUEU4MnFFMnFnP3BsaT0xXG4gKlxuICogQGF1dGhvciBDaHJpcyBNYWxsZXkgKFBpeGVsWm9vbSwgSW5jLilcbiAqL1xuXG5pbXBvcnQgTWF0cml4MyBmcm9tICcuLi8uLi9kb3QvanMvTWF0cml4My5qcyc7XG5pbXBvcnQgVXRpbHMgZnJvbSAnLi4vLi4vZG90L2pzL1V0aWxzLmpzJztcbmltcG9ydCB7IFNoYXBlIH0gZnJvbSAnLi4vLi4va2l0ZS9qcy9pbXBvcnRzLmpzJztcbmltcG9ydCBtZXJnZSBmcm9tICcuLi8uLi9waGV0LWNvcmUvanMvbWVyZ2UuanMnO1xuaW1wb3J0IFBoZXRGb250IGZyb20gJy4uLy4uL3NjZW5lcnktcGhldC9qcy9QaGV0Rm9udC5qcyc7XG5pbXBvcnQgeyBBbGlnbkJveCwgQWxpZ25Hcm91cCwgSEJveCwgTm9kZSwgUGF0aCwgVGV4dCwgVkJveCB9IGZyb20gJy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XG5pbXBvcnQgc2NlbmVyeVBoZXQgZnJvbSAnLi9zY2VuZXJ5UGhldC5qcyc7XG5cbmNsYXNzIE1hdHJpeE5vZGUgZXh0ZW5kcyBOb2RlIHtcblxuICAvKipcbiAgICogQHBhcmFtIHtBcnJheS48QXJyYXlbbnVtYmVyfHN0cmluZ10+fSBtYXRyaXggLSBhbiBNeE4gbWF0cml4LCBpbiByb3ctbWFqb3Igb3JkZXJcbiAgICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zXVxuICAgKi9cbiAgY29uc3RydWN0b3IoIG1hdHJpeCwgb3B0aW9ucyApIHtcblxuICAgIGFzc2VydCAmJiBhc3NlcnQoIEFycmF5LmlzQXJyYXkoIG1hdHJpeCApICYmIG1hdHJpeC5sZW5ndGggPiAwLCAnbWF0cml4IG11c3QgYmUgYW4gYXJyYXkgd2l0aCBsZW5ndGggPiAwJyApO1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIF8uZXZlcnkoIG1hdHJpeCwgcm93ID0+IEFycmF5LmlzQXJyYXkoIHJvdyApICYmIHJvdy5sZW5ndGggPiAwICksICdlYWNoIGVsZW1lbnQgb2YgbWF0cml4IG11c3QgYmUgYW4gYXJyYXkgd2l0aCBsZW5ndGggPiAwJyApO1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIF8uZXZlcnkoIG1hdHJpeCwgcm93ID0+IHJvdy5sZW5ndGggPT09IG1hdHJpeFsgMCBdLmxlbmd0aCApLCAnZWFjaCByb3cgb2YgdGhlIG1hdHJpeCBtdXN0IGhhdmUgdGhlIHNhbWUgbnVtYmVyIG9mIHZhbHVlcycgKTtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBfLmV2ZXJ5KCBtYXRyaXgsIHJvdyA9PiBfLmV2ZXJ5KCByb3csIHZhbHVlID0+ICggdHlwZW9mIHZhbHVlID09PSAnbnVtYmVyJyB8fCB0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnICkgKSApLCAnYWxsIHZhbHVlcyBtdXN0IGJlIG51bWJlcnMgb3Igc3RyaW5ncycgKTtcblxuICAgIG9wdGlvbnMgPSBtZXJnZSgge1xuICAgICAgZm9udDogbmV3IFBoZXRGb250KCAyMCApLCAvLyBmb250IGZvciB0aGUgdmFsdWVzXG4gICAgICBkZWNpbWFsUGxhY2VzOiAwLCAvLyBudW1iZXIgb2YgZGVjaW1hbCBwbGFjZXMgZGlzcGxheWVkIGZvciBlYWNoIHZhbHVlXG4gICAgICBzdHJpcFRyYWlsaW5nWmVyb3M6IHRydWUsIC8vIHdoZXRoZXIgdG8gc3RyaXAgdHJhaWxpbmcgemVyb3MsIGUuZy4gMS4yMCAtPiAxLjJcbiAgICAgIGNlbGxYU3BhY2luZzogMjUsIC8vIGhvcml6b250YWwgc3BhY2luZyBiZXR3ZWVuIGNlbGxzIGluIHRoZSBtYXRyaXhcbiAgICAgIGNlbGxZU3BhY2luZzogNSwgLy8gdmVydGljYWwgc3BhY2luZyBiZXR3ZWVuIGNlbGxzIGluIHRoZSBtYXRyaXhcbiAgICAgIGxlZnRCcmFja2V0WFNwYWNpbmc6IDEwLCAvLyBob3Jpem9udGFsIHNwYWNpbmcgYmV0d2VlbiBsZWZ0IGJyYWNrZXQgYW5kIHRoZSB2YWx1ZXNcbiAgICAgIHJpZ2h0QnJhY2tldFhTcGFjaW5nOiAxMCwgLy8gaG9yaXpvbnRhbCBzcGFjaW5nIGJldHdlZW4gcmlnaHQgYnJhY2tldCBhbmQgdGhlIHZhbHVlc1xuICAgICAgYnJhY2tldFdpZHRoOiA4LCAvLyB3aWR0aCBvZiB0aGUgYnJhY2tldHNcbiAgICAgIGJyYWNrZXRIZWlnaHRQYWRkaW5nOiA1LCAvLyBleHRyYSBoZWlnaHQgYWRkZWQgdG8gdGhlIGJyYWNrZXRzLCAwIGlzIHRoZSBzYW1lIGhlaWdodCBhcyB0aGUgZ3JpZCBvZiB2YWx1ZXNcblxuICAgICAgLy8gUGF0aCBvcHRpb25zIGZvciB0aGUgYnJhY2tldHNcbiAgICAgIGJyYWNrZXROb2RlT3B0aW9uczoge1xuICAgICAgICBzdHJva2U6ICdibGFjaycsXG4gICAgICAgIGxpbmVXaWR0aDogMlxuICAgICAgfVxuICAgIH0sIG9wdGlvbnMgKTtcblxuICAgIGNvbnN0IGFsaWduQm94T3B0aW9ucyA9IHtcbiAgICAgIGdyb3VwOiBuZXcgQWxpZ25Hcm91cCgpLCAvLyB1c2UgdGhlIHNhbWUgQWxpZ25Hcm91cCBpbnN0YW5jZSBmb3IgYWxsIGNlbGxzLCBzbyB0aGF0IHRoZXkgYXJlIGFsbCB0aGUgc2FtZSBzaXplXG4gICAgICB4QWxpZ246ICdyaWdodCdcbiAgICB9O1xuXG4gICAgLy8gQ3JlYXRlIGFuIEhCb3ggZm9yIGVhY2ggcm93LlxuICAgIGNvbnN0IHJvd05vZGVzID0gW107XG4gICAgbWF0cml4LmZvckVhY2goIHJvdyA9PiB7XG4gICAgICBjb25zdCBjZWxsTm9kZXMgPSBbXTtcblxuICAgICAgcm93LmZvckVhY2goIHZhbHVlID0+IHtcblxuICAgICAgICBsZXQgdmFsdWVTdHJpbmc7XG4gICAgICAgIGlmICggdHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJyApIHtcblxuICAgICAgICAgIC8vIHZhbHVlIGlzIGEgc3RyaW5nLCB1c2UgaXQgYXMgaXMuXG4gICAgICAgICAgdmFsdWVTdHJpbmcgPSB2YWx1ZTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAvLyB2YWx1ZSBpcyBhIG51bWJlciwgcm91bmQgaXQgdG8gdGhlIGRlc2lyZWQgbnVtYmVyIG9mIGRlY2ltYWwgcGxhY2VzLlxuICAgICAgICAgIHZhbHVlU3RyaW5nID0gb3B0aW9ucy5zdHJpcFRyYWlsaW5nWmVyb3MgP1xuICAgICAgICAgICAgICAgICAgICAgICAgJycgKyBVdGlscy50b0ZpeGVkTnVtYmVyKCB2YWx1ZSwgb3B0aW9ucy5kZWNpbWFsUGxhY2VzICkgOlxuICAgICAgICAgICAgICAgICAgICAgICAgVXRpbHMudG9GaXhlZCggdmFsdWUsIG9wdGlvbnMuZGVjaW1hbFBsYWNlcyApO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gQ2VsbCB2YWx1ZVxuICAgICAgICBjb25zdCBjZWxsTm9kZSA9IG5ldyBUZXh0KCB2YWx1ZVN0cmluZywge1xuICAgICAgICAgIGZvbnQ6IG9wdGlvbnMuZm9udFxuICAgICAgICB9ICk7XG5cbiAgICAgICAgLy8gV3JhcCBpbiBhbiBBbGlnbkJveCwgc28gdGhhdCBhbGwgY2VsbHMgaGF2ZSB0aGUgc2FtZSBlZmZlY3RpdmUgZGltZW5zaW9ucy5cbiAgICAgICAgY2VsbE5vZGVzLnB1c2goIG5ldyBBbGlnbkJveCggY2VsbE5vZGUsIGFsaWduQm94T3B0aW9ucyApICk7XG4gICAgICB9ICk7XG5cbiAgICAgIHJvd05vZGVzLnB1c2goIG5ldyBIQm94KCB7XG4gICAgICAgIGNoaWxkcmVuOiBjZWxsTm9kZXMsXG4gICAgICAgIHNwYWNpbmc6IG9wdGlvbnMuY2VsbFhTcGFjaW5nXG4gICAgICB9ICkgKTtcbiAgICB9ICk7XG5cbiAgICAvLyBBcnJhbmdlIHRoZSByb3dzIGluIGEgVkJveCB0byBjcmVhdGUgYSBncmlkLlxuICAgIGNvbnN0IGdyaWROb2RlID0gbmV3IFZCb3goIHtcbiAgICAgIGNoaWxkcmVuOiByb3dOb2RlcyxcbiAgICAgIHNwYWNpbmc6IG9wdGlvbnMuY2VsbFlTcGFjaW5nLFxuICAgICAgYWxpZ246ICdyaWdodCdcbiAgICB9ICk7XG5cbiAgICAvLyBMZWZ0IGJyYWNrZXRcbiAgICBjb25zdCBicmFja2V0SGVpZ2h0ID0gZ3JpZE5vZGUuaGVpZ2h0ICsgKCAyICogb3B0aW9ucy5icmFja2V0SGVpZ2h0UGFkZGluZyApO1xuICAgIGNvbnN0IGxlZnRCcmFja2V0U2hhcGUgPSBuZXcgU2hhcGUoKVxuICAgICAgLm1vdmVUbyggMCwgMCApXG4gICAgICAubGluZVRvKCAtb3B0aW9ucy5icmFja2V0V2lkdGgsIDAgKVxuICAgICAgLmxpbmVUbyggLW9wdGlvbnMuYnJhY2tldFdpZHRoLCBicmFja2V0SGVpZ2h0IClcbiAgICAgIC5saW5lVG8oIDAsIGJyYWNrZXRIZWlnaHQgKTtcbiAgICBjb25zdCBsZWZ0QnJhY2tldE5vZGUgPSBuZXcgUGF0aCggbGVmdEJyYWNrZXRTaGFwZSwgbWVyZ2UoIHtcbiAgICAgIHJpZ2h0OiBncmlkTm9kZS5sZWZ0IC0gb3B0aW9ucy5sZWZ0QnJhY2tldFhTcGFjaW5nLFxuICAgICAgY2VudGVyWTogZ3JpZE5vZGUuY2VudGVyWVxuICAgIH0sIG9wdGlvbnMuYnJhY2tldE5vZGVPcHRpb25zICkgKTtcblxuICAgIC8vIFJpZ2h0IGJyYWNrZXQsIHdoaWNoIHJldXNlcyBsZWZ0QnJhY2tldFNoYXBlLlxuICAgIGNvbnN0IHJpZ2h0QnJhY2tldFNoYXBlID0gbGVmdEJyYWNrZXRTaGFwZS50cmFuc2Zvcm1lZCggbmV3IE1hdHJpeDMoKS5zZXRUb1NjYWxlKCAtMSwgMSApICk7XG4gICAgY29uc3QgcmlnaHRCcmFja2V0Tm9kZSA9IG5ldyBQYXRoKCByaWdodEJyYWNrZXRTaGFwZSwgbWVyZ2UoIHtcbiAgICAgIGxlZnQ6IGdyaWROb2RlLnJpZ2h0ICsgb3B0aW9ucy5yaWdodEJyYWNrZXRYU3BhY2luZyxcbiAgICAgIGNlbnRlclk6IGdyaWROb2RlLmNlbnRlcllcbiAgICB9LCBvcHRpb25zLmJyYWNrZXROb2RlT3B0aW9ucyApICk7XG5cbiAgICAvLyBXcmFwIGluIGEgTm9kZSBzbyB3ZSBkb24ndCBleHBvc2UgdGhlIEhCb3ggQVBJLlxuICAgIGFzc2VydCAmJiBhc3NlcnQoICFvcHRpb25zLmNoaWxkcmVuICk7XG4gICAgb3B0aW9ucy5jaGlsZHJlbiA9IFsgbGVmdEJyYWNrZXROb2RlLCBncmlkTm9kZSwgcmlnaHRCcmFja2V0Tm9kZSBdO1xuXG4gICAgc3VwZXIoIG9wdGlvbnMgKTtcbiAgfVxufVxuXG5zY2VuZXJ5UGhldC5yZWdpc3RlciggJ01hdHJpeE5vZGUnLCBNYXRyaXhOb2RlICk7XG5leHBvcnQgZGVmYXVsdCBNYXRyaXhOb2RlOyJdLCJuYW1lcyI6WyJNYXRyaXgzIiwiVXRpbHMiLCJTaGFwZSIsIm1lcmdlIiwiUGhldEZvbnQiLCJBbGlnbkJveCIsIkFsaWduR3JvdXAiLCJIQm94IiwiTm9kZSIsIlBhdGgiLCJUZXh0IiwiVkJveCIsInNjZW5lcnlQaGV0IiwiTWF0cml4Tm9kZSIsImNvbnN0cnVjdG9yIiwibWF0cml4Iiwib3B0aW9ucyIsImFzc2VydCIsIkFycmF5IiwiaXNBcnJheSIsImxlbmd0aCIsIl8iLCJldmVyeSIsInJvdyIsInZhbHVlIiwiZm9udCIsImRlY2ltYWxQbGFjZXMiLCJzdHJpcFRyYWlsaW5nWmVyb3MiLCJjZWxsWFNwYWNpbmciLCJjZWxsWVNwYWNpbmciLCJsZWZ0QnJhY2tldFhTcGFjaW5nIiwicmlnaHRCcmFja2V0WFNwYWNpbmciLCJicmFja2V0V2lkdGgiLCJicmFja2V0SGVpZ2h0UGFkZGluZyIsImJyYWNrZXROb2RlT3B0aW9ucyIsInN0cm9rZSIsImxpbmVXaWR0aCIsImFsaWduQm94T3B0aW9ucyIsImdyb3VwIiwieEFsaWduIiwicm93Tm9kZXMiLCJmb3JFYWNoIiwiY2VsbE5vZGVzIiwidmFsdWVTdHJpbmciLCJ0b0ZpeGVkTnVtYmVyIiwidG9GaXhlZCIsImNlbGxOb2RlIiwicHVzaCIsImNoaWxkcmVuIiwic3BhY2luZyIsImdyaWROb2RlIiwiYWxpZ24iLCJicmFja2V0SGVpZ2h0IiwiaGVpZ2h0IiwibGVmdEJyYWNrZXRTaGFwZSIsIm1vdmVUbyIsImxpbmVUbyIsImxlZnRCcmFja2V0Tm9kZSIsInJpZ2h0IiwibGVmdCIsImNlbnRlclkiLCJyaWdodEJyYWNrZXRTaGFwZSIsInRyYW5zZm9ybWVkIiwic2V0VG9TY2FsZSIsInJpZ2h0QnJhY2tldE5vZGUiLCJyZWdpc3RlciJdLCJtYXBwaW5ncyI6IkFBQUEsc0RBQXNEO0FBRXREOzs7Ozs7Ozs7OztDQVdDLEdBRUQsT0FBT0EsYUFBYSwwQkFBMEI7QUFDOUMsT0FBT0MsV0FBVyx3QkFBd0I7QUFDMUMsU0FBU0MsS0FBSyxRQUFRLDJCQUEyQjtBQUNqRCxPQUFPQyxXQUFXLDhCQUE4QjtBQUNoRCxPQUFPQyxjQUFjLG9DQUFvQztBQUN6RCxTQUFTQyxRQUFRLEVBQUVDLFVBQVUsRUFBRUMsSUFBSSxFQUFFQyxJQUFJLEVBQUVDLElBQUksRUFBRUMs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