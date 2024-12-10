// Copyright 2015-2023, University of Colorado Boulder
/**
 * Warning displayed when we have to fall back to Canvas
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ import { HBox, openPopup, Path, Text, VBox } from '../../scenery/js/imports.js';
import exclamationTriangleSolidShape from '../../sherpa/js/fontawesome-5/exclamationTriangleSolidShape.js';
import PhetFont from './PhetFont.js';
import sceneryPhet from './sceneryPhet.js';
import SceneryPhetStrings from './SceneryPhetStrings.js';
let CanvasWarningNode = class CanvasWarningNode extends HBox {
    dispose() {
        this.disposeCanvasWarningNode();
        super.dispose();
    }
    constructor(){
        const titleText = new Text(SceneryPhetStrings.webglWarning.titleStringProperty, {
            font: new PhetFont(14),
            fill: '#ddd'
        });
        const bodyText = new Text(SceneryPhetStrings.webglWarning.bodyStringProperty, {
            font: new PhetFont(10),
            fill: '#999'
        });
        super({
            children: [
                new Path(exclamationTriangleSolidShape, {
                    fill: '#E87600',
                    scale: 0.048
                }),
                new VBox({
                    children: [
                        titleText,
                        bodyText
                    ],
                    spacing: 3,
                    align: 'left'
                })
            ],
            spacing: 12,
            align: 'center',
            cursor: 'pointer'
        });
        this.mouseArea = this.touchArea = this.localBounds;
        this.addInputListener({
            up: function() {
                const joistGlobal = _.get(window, 'phet.joist', null); // returns null if global isn't found
                const locale = joistGlobal ? joistGlobal.sim.locale : 'en';
                openPopup(`https://phet.colorado.edu/webgl-disabled-page?simLocale=${locale}`);
            }
        });
        this.disposeCanvasWarningNode = ()=>{
            titleText.dispose();
            bodyText.dispose();
        };
    }
};
export { CanvasWarningNode as default };
sceneryPhet.register('CanvasWarningNode', CanvasWarningNode);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9DYW52YXNXYXJuaW5nTm9kZS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNS0yMDIzLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuLyoqXG4gKiBXYXJuaW5nIGRpc3BsYXllZCB3aGVuIHdlIGhhdmUgdG8gZmFsbCBiYWNrIHRvIENhbnZhc1xuICpcbiAqIEBhdXRob3IgSm9uYXRoYW4gT2xzb24gPGpvbmF0aGFuLm9sc29uQGNvbG9yYWRvLmVkdT5cbiAqL1xuXG5pbXBvcnQgeyBIQm94LCBvcGVuUG9wdXAsIFBhdGgsIFRleHQsIFZCb3ggfSBmcm9tICcuLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xuaW1wb3J0IGV4Y2xhbWF0aW9uVHJpYW5nbGVTb2xpZFNoYXBlIGZyb20gJy4uLy4uL3NoZXJwYS9qcy9mb250YXdlc29tZS01L2V4Y2xhbWF0aW9uVHJpYW5nbGVTb2xpZFNoYXBlLmpzJztcbmltcG9ydCBQaGV0Rm9udCBmcm9tICcuL1BoZXRGb250LmpzJztcbmltcG9ydCBzY2VuZXJ5UGhldCBmcm9tICcuL3NjZW5lcnlQaGV0LmpzJztcbmltcG9ydCBTY2VuZXJ5UGhldFN0cmluZ3MgZnJvbSAnLi9TY2VuZXJ5UGhldFN0cmluZ3MuanMnO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBDYW52YXNXYXJuaW5nTm9kZSBleHRlbmRzIEhCb3gge1xuXG4gIHByaXZhdGUgcmVhZG9ubHkgZGlzcG9zZUNhbnZhc1dhcm5pbmdOb2RlOiAoKSA9PiB2b2lkO1xuXG4gIHB1YmxpYyBjb25zdHJ1Y3RvcigpIHtcblxuICAgIGNvbnN0IHRpdGxlVGV4dCA9IG5ldyBUZXh0KCBTY2VuZXJ5UGhldFN0cmluZ3Mud2ViZ2xXYXJuaW5nLnRpdGxlU3RyaW5nUHJvcGVydHksIHtcbiAgICAgIGZvbnQ6IG5ldyBQaGV0Rm9udCggMTQgKSxcbiAgICAgIGZpbGw6ICcjZGRkJ1xuICAgIH0gKTtcblxuICAgIGNvbnN0IGJvZHlUZXh0ID0gbmV3IFRleHQoIFNjZW5lcnlQaGV0U3RyaW5ncy53ZWJnbFdhcm5pbmcuYm9keVN0cmluZ1Byb3BlcnR5LCB7XG4gICAgICBmb250OiBuZXcgUGhldEZvbnQoIDEwICksXG4gICAgICBmaWxsOiAnIzk5OSdcbiAgICB9ICk7XG5cbiAgICBzdXBlcigge1xuICAgICAgY2hpbGRyZW46IFtcbiAgICAgICAgbmV3IFBhdGgoIGV4Y2xhbWF0aW9uVHJpYW5nbGVTb2xpZFNoYXBlLCB7XG4gICAgICAgICAgZmlsbDogJyNFODc2MDAnLCAvLyBcInNhZmV0eSBvcmFuZ2VcIiwgYWNjb3JkaW5nIHRvIFdpa2lwZWRpYVxuICAgICAgICAgIHNjYWxlOiAwLjA0OFxuICAgICAgICB9ICksXG4gICAgICAgIG5ldyBWQm94KCB7XG4gICAgICAgICAgY2hpbGRyZW46IFsgdGl0bGVUZXh0LCBib2R5VGV4dCBdLFxuICAgICAgICAgIHNwYWNpbmc6IDMsXG4gICAgICAgICAgYWxpZ246ICdsZWZ0J1xuICAgICAgICB9IClcbiAgICAgIF0sXG4gICAgICBzcGFjaW5nOiAxMixcbiAgICAgIGFsaWduOiAnY2VudGVyJyxcbiAgICAgIGN1cnNvcjogJ3BvaW50ZXInXG4gICAgfSApO1xuXG4gICAgdGhpcy5tb3VzZUFyZWEgPSB0aGlzLnRvdWNoQXJlYSA9IHRoaXMubG9jYWxCb3VuZHM7XG5cbiAgICB0aGlzLmFkZElucHV0TGlzdGVuZXIoIHtcbiAgICAgIHVwOiBmdW5jdGlvbigpIHtcbiAgICAgICAgY29uc3Qgam9pc3RHbG9iYWwgPSBfLmdldCggd2luZG93LCAncGhldC5qb2lzdCcsIG51bGwgKTsgLy8gcmV0dXJucyBudWxsIGlmIGdsb2JhbCBpc24ndCBmb3VuZFxuICAgICAgICBjb25zdCBsb2NhbGUgPSBqb2lzdEdsb2JhbCA/IGpvaXN0R2xvYmFsLnNpbS5sb2NhbGUgOiAnZW4nO1xuICAgICAgICBvcGVuUG9wdXAoIGBodHRwczovL3BoZXQuY29sb3JhZG8uZWR1L3dlYmdsLWRpc2FibGVkLXBhZ2U/c2ltTG9jYWxlPSR7bG9jYWxlfWAgKTtcbiAgICAgIH1cbiAgICB9ICk7XG5cbiAgICB0aGlzLmRpc3Bvc2VDYW52YXNXYXJuaW5nTm9kZSA9ICgpID0+IHtcbiAgICAgIHRpdGxlVGV4dC5kaXNwb3NlKCk7XG4gICAgICBib2R5VGV4dC5kaXNwb3NlKCk7XG4gICAgfTtcbiAgfVxuXG4gIHB1YmxpYyBvdmVycmlkZSBkaXNwb3NlKCk6IHZvaWQge1xuICAgIHRoaXMuZGlzcG9zZUNhbnZhc1dhcm5pbmdOb2RlKCk7XG4gICAgc3VwZXIuZGlzcG9zZSgpO1xuICB9XG59XG5cbnNjZW5lcnlQaGV0LnJlZ2lzdGVyKCAnQ2FudmFzV2FybmluZ05vZGUnLCBDYW52YXNXYXJuaW5nTm9kZSApOyJdLCJuYW1lcyI6WyJIQm94Iiwib3BlblBvcHVwIiwiUGF0aCIsIlRleHQiLCJWQm94IiwiZXhjbGFtYXRpb25UcmlhbmdsZVNvbGlkU2hhcGUiLCJQaGV0Rm9udCIsInNjZW5lcnlQaGV0IiwiU2NlbmVyeVBoZXRTdHJpbmdzIiwiQ2FudmFzV2FybmluZ05vZGUiLCJkaXNwb3NlIiwiZGlzcG9zZUNhbnZhc1dhcm5pbmdOb2RlIiwidGl0bGVUZXh0Iiwid2ViZ2xXYXJuaW5nIiwidGl0bGVTdHJpbmdQcm9wZXJ0eSIsImZvbnQiLCJmaWxsIiwiYm9keVRleHQiLCJib2R5U3RyaW5nUHJvcGVydHkiLCJjaGlsZHJlbiIsInNjYWxlIiwic3BhY2luZyIsImFsaWduIiwiY3Vyc29yIiwibW91c2VBcmVhIiwidG91Y2hBcmVhIiwibG9jYWxCb3VuZHMiLCJhZGRJbnB1dExpc3RlbmVyIiwidXAiLCJqb2lzdEdsb2JhbCIsIl8iLCJnZXQiLCJ3aW5kb3ciLCJsb2NhbGUiLCJzaW0iLCJyZWdpc3RlciJdLCJtYXBwaW5ncyI6IkFBQUEsc0RBQXNEO0FBRXREOzs7O0NBSUMsR0FFRCxTQUFTQSxJQUFJLEVBQUVDLFNBQVMsRUFBRUMsSUFBSSxFQUFFQyxJQUFJLEVBQUVDLElBQUksUUFBUSw4QkFBOEI7QUFDaEYsT0FBT0MsbUNBQW1DLGlFQUFpRTtBQUMzRyxPQUFPQyxjQUFjLGdCQUFnQjtBQUNyQyxPQUFPQyxpQkFBaUIsbUJBQW1CO0FBQzNDLE9BQU9DLHdCQUF3QiwwQkFBMEI7QUFFMUMsSUFBQSxBQUFNQyxvQkFBTixNQUFNQSwwQkFBMEJUO0lBaUQ3QlUsVUFBZ0I7UUFDOUIsSUFBSSxDQUFDQyx3QkFBd0I7UUFDN0IsS0FBSyxDQUFDRDtJQUNSO0lBaERBLGFBQXFCO1FBRW5CLE1BQU1FLFlBQVksSUFBSVQsS0FBTUssbUJBQW1CSyxZQUFZLENBQUNDLG1CQUFtQixFQUFFO1lBQy9FQyxNQUFNLElBQUlULFNBQVU7WUFDcEJVLE1BQU07UUFDUjtRQUVBLE1BQU1DLFdBQVcsSUFBSWQsS0FBTUssbUJBQW1CSyxZQUFZLENBQUNLLGtCQUFrQixFQUFFO1lBQzdFSCxNQUFNLElBQUlULFNBQVU7WUFDcEJVLE1BQU07UUFDUjtRQUVBLEtBQUssQ0FBRTtZQUNMRyxVQUFVO2dCQUNSLElBQUlqQixLQUFNRywrQkFBK0I7b0JBQ3ZDVyxNQUFNO29CQUNOSSxPQUFPO2dCQUNUO2dCQUNBLElBQUloQixLQUFNO29CQUNSZSxVQUFVO3dCQUFFUDt3QkFBV0s7cUJBQVU7b0JBQ2pDSSxTQUFTO29CQUNUQyxPQUFPO2dCQUNUO2FBQ0Q7WUFDREQsU0FBUztZQUNUQyxPQUFPO1lBQ1BDLFFBQVE7UUFDVjtRQUVBLElBQUksQ0FBQ0MsU0FBUyxHQUFHLElBQUksQ0FBQ0MsU0FBUyxHQUFHLElBQUksQ0FBQ0MsV0FBVztRQUVsRCxJQUFJLENBQUNDLGdCQUFnQixDQUFFO1lBQ3JCQyxJQUFJO2dCQUNGLE1BQU1DLGNBQWNDLEVBQUVDLEdBQUcsQ0FBRUMsUUFBUSxjQUFjLE9BQVEscUNBQXFDO2dCQUM5RixNQUFNQyxTQUFTSixjQUFjQSxZQUFZSyxHQUFHLENBQUNELE1BQU0sR0FBRztnQkFDdERoQyxVQUFXLENBQUMsd0RBQXdELEVBQUVnQyxRQUFRO1lBQ2hGO1FBQ0Y7UUFFQSxJQUFJLENBQUN0Qix3QkFBd0IsR0FBRztZQUM5QkMsVUFBVUYsT0FBTztZQUNqQk8sU0FBU1AsT0FBTztRQUNsQjtJQUNGO0FBTUY7QUFyREEsU0FBcUJELCtCQXFEcEI7QUFFREYsWUFBWTRCLFFBQVEsQ0FBRSxxQkFBcUIxQiJ9