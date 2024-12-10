// Copyright 2014-2024, University of Colorado Boulder
/**
 * Panel that contains a switch that is used to switch between the two exploration modes.
 *
 * @author John Blanco (PhET Interactive Simulations)
 */ import Dimension2 from '../../../../dot/js/Dimension2.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import { Color, HBox, Node, Rectangle, VBox } from '../../../../scenery/js/imports.js';
import ABSwitch from '../../../../sun/js/ABSwitch.js';
import Panel from '../../../../sun/js/Panel.js';
import areaBuilder from '../../areaBuilder.js';
import AreaBuilderSharedConstants from '../../common/AreaBuilderSharedConstants.js';
let BoardDisplayModePanel = class BoardDisplayModePanel extends Panel {
    /**
   * @param boardDisplayModeProperty
   */ constructor(boardDisplayModeProperty){
        const singleBoardIcon = createIcon(AreaBuilderSharedConstants.ORANGISH_COLOR, 6, [
            new Vector2(0, 1),
            new Vector2(1, 0),
            new Vector2(1, 1)
        ]);
        const dualBoardIcon = new HBox({
            children: [
                createIcon(AreaBuilderSharedConstants.GREENISH_COLOR, 6, [
                    new Vector2(0, 0),
                    new Vector2(1, 0),
                    new Vector2(1, 1)
                ]),
                createIcon(AreaBuilderSharedConstants.PURPLISH_COLOR, 6, [
                    new Vector2(0, 0),
                    new Vector2(0, 1),
                    new Vector2(1, 0),
                    new Vector2(1, 1)
                ])
            ],
            spacing: 3
        });
        super(new VBox({
            children: [
                new ABSwitch(boardDisplayModeProperty, 'single', singleBoardIcon, 'dual', dualBoardIcon, {
                    toggleSwitchOptions: {
                        size: new Dimension2(36, 18),
                        thumbTouchAreaXDilation: 5,
                        thumbTouchAreaYDilation: 5
                    }
                })
            ],
            spacing: 10 // Empirically determined
        }), {
            fill: AreaBuilderSharedConstants.CONTROL_PANEL_BACKGROUND_COLOR,
            cornerRadius: 4
        });
    }
};
// utility function for creating the icons used on this panel
function createIcon(color, rectangleLength, rectanglePositions) {
    const edgeColor = Color.toColor(color).colorUtilsDarker(AreaBuilderSharedConstants.PERIMETER_DARKEN_FACTOR);
    const content = new Node();
    rectanglePositions.forEach((position)=>{
        content.addChild(new Rectangle(0, 0, rectangleLength, rectangleLength, 0, 0, {
            fill: color,
            stroke: edgeColor,
            left: position.x * rectangleLength,
            top: position.y * rectangleLength
        }));
    });
    return new Panel(content, {
        fill: 'white',
        stroke: 'black',
        cornerRadius: 0,
        backgroundPickable: true
    });
}
areaBuilder.register('BoardDisplayModePanel', BoardDisplayModePanel);
export default BoardDisplayModePanel;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL2FyZWEtYnVpbGRlci9qcy9leHBsb3JlL3ZpZXcvQm9hcmREaXNwbGF5TW9kZVBhbmVsLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE0LTIwMjQsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIFBhbmVsIHRoYXQgY29udGFpbnMgYSBzd2l0Y2ggdGhhdCBpcyB1c2VkIHRvIHN3aXRjaCBiZXR3ZWVuIHRoZSB0d28gZXhwbG9yYXRpb24gbW9kZXMuXG4gKlxuICogQGF1dGhvciBKb2huIEJsYW5jbyAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcbiAqL1xuXG5pbXBvcnQgRGltZW5zaW9uMiBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvRGltZW5zaW9uMi5qcyc7XG5pbXBvcnQgVmVjdG9yMiBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvVmVjdG9yMi5qcyc7XG5pbXBvcnQgeyBDb2xvciwgSEJveCwgTm9kZSwgUmVjdGFuZ2xlLCBWQm94IH0gZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcbmltcG9ydCBBQlN3aXRjaCBmcm9tICcuLi8uLi8uLi8uLi9zdW4vanMvQUJTd2l0Y2guanMnO1xuaW1wb3J0IFBhbmVsIGZyb20gJy4uLy4uLy4uLy4uL3N1bi9qcy9QYW5lbC5qcyc7XG5pbXBvcnQgYXJlYUJ1aWxkZXIgZnJvbSAnLi4vLi4vYXJlYUJ1aWxkZXIuanMnO1xuaW1wb3J0IEFyZWFCdWlsZGVyU2hhcmVkQ29uc3RhbnRzIGZyb20gJy4uLy4uL2NvbW1vbi9BcmVhQnVpbGRlclNoYXJlZENvbnN0YW50cy5qcyc7XG5cbmNsYXNzIEJvYXJkRGlzcGxheU1vZGVQYW5lbCBleHRlbmRzIFBhbmVsIHtcblxuICAvKipcbiAgICogQHBhcmFtIGJvYXJkRGlzcGxheU1vZGVQcm9wZXJ0eVxuICAgKi9cbiAgY29uc3RydWN0b3IoIGJvYXJkRGlzcGxheU1vZGVQcm9wZXJ0eSApIHtcblxuICAgIGNvbnN0IHNpbmdsZUJvYXJkSWNvbiA9IGNyZWF0ZUljb24oIEFyZWFCdWlsZGVyU2hhcmVkQ29uc3RhbnRzLk9SQU5HSVNIX0NPTE9SLCA2LCBbXG4gICAgICBuZXcgVmVjdG9yMiggMCwgMSApLFxuICAgICAgbmV3IFZlY3RvcjIoIDEsIDAgKSxcbiAgICAgIG5ldyBWZWN0b3IyKCAxLCAxIClcbiAgICBdICk7XG5cbiAgICBjb25zdCBkdWFsQm9hcmRJY29uID0gbmV3IEhCb3goIHtcbiAgICAgICAgY2hpbGRyZW46IFtcbiAgICAgICAgICBjcmVhdGVJY29uKCBBcmVhQnVpbGRlclNoYXJlZENvbnN0YW50cy5HUkVFTklTSF9DT0xPUiwgNiwgW1xuICAgICAgICAgICAgbmV3IFZlY3RvcjIoIDAsIDAgKSxcbiAgICAgICAgICAgIG5ldyBWZWN0b3IyKCAxLCAwICksXG4gICAgICAgICAgICBuZXcgVmVjdG9yMiggMSwgMSApXG4gICAgICAgICAgXSApLFxuICAgICAgICAgIGNyZWF0ZUljb24oIEFyZWFCdWlsZGVyU2hhcmVkQ29uc3RhbnRzLlBVUlBMSVNIX0NPTE9SLCA2LCBbXG4gICAgICAgICAgICBuZXcgVmVjdG9yMiggMCwgMCApLFxuICAgICAgICAgICAgbmV3IFZlY3RvcjIoIDAsIDEgKSxcbiAgICAgICAgICAgIG5ldyBWZWN0b3IyKCAxLCAwICksXG4gICAgICAgICAgICBuZXcgVmVjdG9yMiggMSwgMSApXG4gICAgICAgICAgXSApXG4gICAgICAgIF0sXG4gICAgICAgIHNwYWNpbmc6IDNcbiAgICAgIH1cbiAgICApO1xuXG4gICAgc3VwZXIoXG4gICAgICBuZXcgVkJveCgge1xuICAgICAgICBjaGlsZHJlbjogW1xuICAgICAgICAgIG5ldyBBQlN3aXRjaCggYm9hcmREaXNwbGF5TW9kZVByb3BlcnR5LCAnc2luZ2xlJywgc2luZ2xlQm9hcmRJY29uLCAnZHVhbCcsIGR1YWxCb2FyZEljb24sIHtcbiAgICAgICAgICAgIHRvZ2dsZVN3aXRjaE9wdGlvbnM6IHtcbiAgICAgICAgICAgICAgc2l6ZTogbmV3IERpbWVuc2lvbjIoIDM2LCAxOCApLFxuICAgICAgICAgICAgICB0aHVtYlRvdWNoQXJlYVhEaWxhdGlvbjogNSxcbiAgICAgICAgICAgICAgdGh1bWJUb3VjaEFyZWFZRGlsYXRpb246IDVcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9IClcbiAgICAgICAgXSxcbiAgICAgICAgc3BhY2luZzogMTAgLy8gRW1waXJpY2FsbHkgZGV0ZXJtaW5lZFxuICAgICAgfSApLCB7IGZpbGw6IEFyZWFCdWlsZGVyU2hhcmVkQ29uc3RhbnRzLkNPTlRST0xfUEFORUxfQkFDS0dST1VORF9DT0xPUiwgY29ybmVyUmFkaXVzOiA0IH1cbiAgICApO1xuICB9XG59XG5cbi8vIHV0aWxpdHkgZnVuY3Rpb24gZm9yIGNyZWF0aW5nIHRoZSBpY29ucyB1c2VkIG9uIHRoaXMgcGFuZWxcbmZ1bmN0aW9uIGNyZWF0ZUljb24oIGNvbG9yLCByZWN0YW5nbGVMZW5ndGgsIHJlY3RhbmdsZVBvc2l0aW9ucyApIHtcbiAgY29uc3QgZWRnZUNvbG9yID0gQ29sb3IudG9Db2xvciggY29sb3IgKS5jb2xvclV0aWxzRGFya2VyKCBBcmVhQnVpbGRlclNoYXJlZENvbnN0YW50cy5QRVJJTUVURVJfREFSS0VOX0ZBQ1RPUiApO1xuICBjb25zdCBjb250ZW50ID0gbmV3IE5vZGUoKTtcbiAgcmVjdGFuZ2xlUG9zaXRpb25zLmZvckVhY2goIHBvc2l0aW9uID0+IHtcbiAgICBjb250ZW50LmFkZENoaWxkKCBuZXcgUmVjdGFuZ2xlKCAwLCAwLCByZWN0YW5nbGVMZW5ndGgsIHJlY3RhbmdsZUxlbmd0aCwgMCwgMCwge1xuICAgICAgZmlsbDogY29sb3IsXG4gICAgICBzdHJva2U6IGVkZ2VDb2xvcixcbiAgICAgIGxlZnQ6IHBvc2l0aW9uLnggKiByZWN0YW5nbGVMZW5ndGgsXG4gICAgICB0b3A6IHBvc2l0aW9uLnkgKiByZWN0YW5nbGVMZW5ndGhcbiAgICB9ICkgKTtcbiAgfSApO1xuICByZXR1cm4gbmV3IFBhbmVsKCBjb250ZW50LCB7IGZpbGw6ICd3aGl0ZScsIHN0cm9rZTogJ2JsYWNrJywgY29ybmVyUmFkaXVzOiAwLCBiYWNrZ3JvdW5kUGlja2FibGU6IHRydWUgfSApO1xufVxuXG5hcmVhQnVpbGRlci5yZWdpc3RlciggJ0JvYXJkRGlzcGxheU1vZGVQYW5lbCcsIEJvYXJkRGlzcGxheU1vZGVQYW5lbCApO1xuZXhwb3J0IGRlZmF1bHQgQm9hcmREaXNwbGF5TW9kZVBhbmVsOyJdLCJuYW1lcyI6WyJEaW1lbnNpb24yIiwiVmVjdG9yMiIsIkNvbG9yIiwiSEJveCIsIk5vZGUiLCJSZWN0YW5nbGUiLCJWQm94IiwiQUJTd2l0Y2giLCJQYW5lbCIsImFyZWFCdWlsZGVyIiwiQXJlYUJ1aWxkZXJTaGFyZWRDb25zdGFudHMiLCJCb2FyZERpc3BsYXlNb2RlUGFuZWwiLCJjb25zdHJ1Y3RvciIsImJvYXJkRGlzcGxheU1vZGVQcm9wZXJ0eSIsInNpbmdsZUJvYXJkSWNvbiIsImNyZWF0ZUljb24iLCJPUkFOR0lTSF9DT0xPUiIsImR1YWxCb2FyZEljb24iLCJjaGlsZHJlbiIsIkdSRUVOSVNIX0NPTE9SIiwiUFVSUExJU0hfQ09MT1IiLCJzcGFjaW5nIiwidG9nZ2xlU3dpdGNoT3B0aW9ucyIsInNpemUiLCJ0aHVtYlRvdWNoQXJlYVhEaWxhdGlvbiIsInRodW1iVG91Y2hBcmVhWURpbGF0aW9uIiwiZmlsbCIsIkNPTlRST0xfUEFORUxfQkFDS0dST1VORF9DT0xPUiIsImNvcm5lclJhZGl1cyIsImNvbG9yIiwicmVjdGFuZ2xlTGVuZ3RoIiwicmVjdGFuZ2xlUG9zaXRpb25zIiwiZWRnZUNvbG9yIiwidG9Db2xvciIsImNvbG9yVXRpbHNEYXJrZXIiLCJQRVJJTUVURVJfREFSS0VOX0ZBQ1RPUiIsImNvbnRlbnQiLCJmb3JFYWNoIiwicG9zaXRpb24iLCJhZGRDaGlsZCIsInN0cm9rZSIsImxlZnQiLCJ4IiwidG9wIiwieSIsImJhY2tn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