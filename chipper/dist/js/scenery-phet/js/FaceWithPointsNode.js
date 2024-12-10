// Copyright 2014-2024, University of Colorado Boulder
/**
 * A face that either smiles or frowns.  When the face is smiling, it displays points awarded next to it.
 *
 * @author John Blanco
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Chris Malley (PixelZoom, Inc.)
 */ import Vector2 from '../../dot/js/Vector2.js';
import optionize from '../../phet-core/js/optionize.js';
import { Node, Text } from '../../scenery/js/imports.js';
import FaceNode from './FaceNode.js';
import PhetFont from './PhetFont.js';
import sceneryPhet from './sceneryPhet.js';
let FaceWithPointsNode = class FaceWithPointsNode extends Node {
    smile() {
        this.faceNode.smile();
        this.pointsNode.visible = true;
    }
    frown() {
        this.faceNode.frown();
        this.pointsNode.visible = false;
    }
    /**
   * Sets the number of points displayed.
   * @param points
   */ setPoints(points) {
        // We do not have negative points, as it goes against our philosophy,
        // see https://github.com/phetsims/scenery-phet/issues/224
        assert && assert(points >= 0, 'points must be non-negative');
        if (points === 0 && !this.showZeroPoints) {
            this.pointsNode.string = '';
        } else {
            this.pointsNode.string = `+${points}`;
        }
        this.updatePointsPosition();
    }
    /**
   * Adjusts position of the points to match the specified value of options.pointsAlignment.
   */ updatePointsPosition() {
        switch(this.pointsAlignment){
            case 'centerBottom':
                this.pointsNode.centerX = this.faceNode.centerX;
                this.pointsNode.top = this.faceNode.bottom + this.spacing;
                break;
            case 'rightBottom':
                this.pointsNode.leftCenter = new Vector2(this.faceNode.right + this.spacing, this.faceNode.centerY).rotate(Math.PI / 4);
                break;
            case 'rightCenter':
                this.pointsNode.left = this.faceNode.right + this.spacing;
                this.pointsNode.centerY = this.faceNode.centerY;
                break;
            default:
                throw new Error(`unsupported pointsAlignment: ${this.pointsAlignment}`);
        }
    }
    constructor(providedOptions){
        const options = optionize()({
            // FaceWithPointsNodeOptions
            spacing: 2,
            faceDiameter: 100,
            faceOpacity: 1,
            pointsAlignment: 'centerBottom',
            pointsFont: new PhetFont({
                size: 44,
                weight: 'bold'
            }),
            pointsFill: 'black',
            pointsStroke: null,
            pointsOpacity: 1,
            showZeroPoints: false,
            points: 0
        }, providedOptions);
        // Validate options
        assert && assert(options.faceDiameter > 0, `invalid faceDiameter: ${options.faceDiameter}`);
        assert && assert(options.faceOpacity >= 0 && options.faceOpacity <= 1, `invalid faceOpacity: ${options.faceOpacity}`);
        assert && assert(options.pointsOpacity >= 0 && options.pointsOpacity <= 1, `invalid pointsOpacity: ${options.pointsOpacity}`);
        assert && assert(options.points >= 0, 'points must be non-negative');
        super();
        this.spacing = options.spacing;
        this.pointsAlignment = options.pointsAlignment;
        this.showZeroPoints = options.showZeroPoints;
        this.faceNode = new FaceNode(options.faceDiameter, {
            opacity: options.faceOpacity
        });
        this.pointsNode = new Text('', {
            font: options.pointsFont,
            fill: options.pointsFill,
            opacity: options.pointsOpacity,
            stroke: options.pointsStroke,
            lineWidth: 1
        });
        options.children = [
            this.faceNode,
            this.pointsNode
        ];
        this.mutate(options);
        this.setPoints(options.points);
    }
};
export { FaceWithPointsNode as default };
sceneryPhet.register('FaceWithPointsNode', FaceWithPointsNode);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9GYWNlV2l0aFBvaW50c05vZGUudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTQtMjAyNCwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbi8qKlxuICogQSBmYWNlIHRoYXQgZWl0aGVyIHNtaWxlcyBvciBmcm93bnMuICBXaGVuIHRoZSBmYWNlIGlzIHNtaWxpbmcsIGl0IGRpc3BsYXlzIHBvaW50cyBhd2FyZGVkIG5leHQgdG8gaXQuXG4gKlxuICogQGF1dGhvciBKb2huIEJsYW5jb1xuICogQGF1dGhvciBTYW0gUmVpZCAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcbiAqIEBhdXRob3IgQ2hyaXMgTWFsbGV5IChQaXhlbFpvb20sIEluYy4pXG4gKi9cblxuaW1wb3J0IFZlY3RvcjIgZnJvbSAnLi4vLi4vZG90L2pzL1ZlY3RvcjIuanMnO1xuaW1wb3J0IG9wdGlvbml6ZSBmcm9tICcuLi8uLi9waGV0LWNvcmUvanMvb3B0aW9uaXplLmpzJztcbmltcG9ydCBTdHJpY3RPbWl0IGZyb20gJy4uLy4uL3BoZXQtY29yZS9qcy90eXBlcy9TdHJpY3RPbWl0LmpzJztcbmltcG9ydCB7IEZvbnQsIE5vZGUsIE5vZGVPcHRpb25zLCBUQ29sb3IsIFRleHQgfSBmcm9tICcuLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xuaW1wb3J0IEZhY2VOb2RlIGZyb20gJy4vRmFjZU5vZGUuanMnO1xuaW1wb3J0IFBoZXRGb250IGZyb20gJy4vUGhldEZvbnQuanMnO1xuaW1wb3J0IHNjZW5lcnlQaGV0IGZyb20gJy4vc2NlbmVyeVBoZXQuanMnO1xuXG50eXBlIFBvaW50c0FsaWdubWVudCA9ICdjZW50ZXJCb3R0b20nIHwgJ3JpZ2h0Qm90dG9tJyB8ICdyaWdodENlbnRlcic7XG5cbnR5cGUgU2VsZk9wdGlvbnMgPSB7XG4gIHNwYWNpbmc/OiBudW1iZXI7IC8vIHNwYWNlIGJldHdlZW4gZmFjZSBhbmQgcG9pbnRzXG5cbiAgLy8gZmFjZSBvcHRpb25zXG4gIGZhY2VEaWFtZXRlcj86IG51bWJlcjtcbiAgZmFjZU9wYWNpdHk/OiBudW1iZXI7IC8vIDAgKHRyYW5zcGFyZW50KSB0byAxIChvcGFxdWUpXG5cbiAgLy8gcG9pbnRzIG9wdGlvbnNcbiAgcG9pbnRzQWxpZ25tZW50PzogUG9pbnRzQWxpZ25tZW50O1xuICBwb2ludHNGb250PzogRm9udDtcbiAgcG9pbnRzRmlsbD86IFRDb2xvcjtcbiAgcG9pbnRzU3Ryb2tlPzogVENvbG9yO1xuICBwb2ludHNPcGFjaXR5PzogbnVtYmVyOyAvLyAwICh0cmFuc3BhcmVudCkgdG8gMSAob3BhcXVlKVxuICBzaG93WmVyb1BvaW50cz86IGJvb2xlYW47IC8vIHdoZXRoZXIgdG8gc2hvdyAnMCcgcG9pbnRzXG4gIHBvaW50cz86IG51bWJlcjsgLy8gdGhlIG51bWJlciBvZiBwb2ludHNcbn07XG5cbmV4cG9ydCB0eXBlIEZhY2VXaXRoUG9pbnRzTm9kZU9wdGlvbnMgPSBTZWxmT3B0aW9ucyAmIFN0cmljdE9taXQ8Tm9kZU9wdGlvbnMsICdjaGlsZHJlbic+O1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBGYWNlV2l0aFBvaW50c05vZGUgZXh0ZW5kcyBOb2RlIHtcblxuICAvLyBvcHRpb25zIG5lZWRlZCBieSBtZXRob2RzXG4gIHByaXZhdGUgcmVhZG9ubHkgc3BhY2luZzogbnVtYmVyO1xuICBwcml2YXRlIHJlYWRvbmx5IHBvaW50c0FsaWdubWVudDogUG9pbnRzQWxpZ25tZW50O1xuICBwcml2YXRlIHJlYWRvbmx5IHNob3daZXJvUG9pbnRzOiBib29sZWFuO1xuXG4gIHByaXZhdGUgcmVhZG9ubHkgZmFjZU5vZGU6IEZhY2VOb2RlO1xuICBwcml2YXRlIHJlYWRvbmx5IHBvaW50c05vZGU6IFRleHQ7XG5cbiAgcHVibGljIGNvbnN0cnVjdG9yKCBwcm92aWRlZE9wdGlvbnM/OiBGYWNlV2l0aFBvaW50c05vZGVPcHRpb25zICkge1xuXG4gICAgY29uc3Qgb3B0aW9ucyA9IG9wdGlvbml6ZTxGYWNlV2l0aFBvaW50c05vZGVPcHRpb25zLCBTZWxmT3B0aW9ucywgTm9kZU9wdGlvbnM+KCkoIHtcblxuICAgICAgLy8gRmFjZVdpdGhQb2ludHNOb2RlT3B0aW9uc1xuICAgICAgc3BhY2luZzogMixcbiAgICAgIGZhY2VEaWFtZXRlcjogMTAwLFxuICAgICAgZmFjZU9wYWNpdHk6IDEsXG4gICAgICBwb2ludHNBbGlnbm1lbnQ6ICdjZW50ZXJCb3R0b20nLFxuICAgICAgcG9pbnRzRm9udDogbmV3IFBoZXRGb250KCB7IHNpemU6IDQ0LCB3ZWlnaHQ6ICdib2xkJyB9ICksXG4gICAgICBwb2ludHNGaWxsOiAnYmxhY2snLFxuICAgICAgcG9pbnRzU3Ryb2tlOiBudWxsLFxuICAgICAgcG9pbnRzT3BhY2l0eTogMSxcbiAgICAgIHNob3daZXJvUG9pbnRzOiBmYWxzZSxcbiAgICAgIHBvaW50czogMFxuICAgIH0sIHByb3ZpZGVkT3B0aW9ucyApO1xuXG4gICAgLy8gVmFsaWRhdGUgb3B0aW9uc1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIG9wdGlvbnMuZmFjZURpYW1ldGVyID4gMCwgYGludmFsaWQgZmFjZURpYW1ldGVyOiAke29wdGlvbnMuZmFjZURpYW1ldGVyfWAgKTtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBvcHRpb25zLmZhY2VPcGFjaXR5ID49IDAgJiYgb3B0aW9ucy5mYWNlT3BhY2l0eSA8PSAxLCBgaW52YWxpZCBmYWNlT3BhY2l0eTogJHtvcHRpb25zLmZhY2VPcGFjaXR5fWAgKTtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBvcHRpb25zLnBvaW50c09wYWNpdHkgPj0gMCAmJiBvcHRpb25zLnBvaW50c09wYWNpdHkgPD0gMSwgYGludmFsaWQgcG9pbnRzT3BhY2l0eTogJHtvcHRpb25zLnBvaW50c09wYWNpdHl9YCApO1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIG9wdGlvbnMucG9pbnRzID49IDAsICdwb2ludHMgbXVzdCBiZSBub24tbmVnYXRpdmUnICk7XG5cbiAgICBzdXBlcigpO1xuXG4gICAgdGhpcy5zcGFjaW5nID0gb3B0aW9ucy5zcGFjaW5nO1xuICAgIHRoaXMucG9pbnRzQWxpZ25tZW50ID0gb3B0aW9ucy5wb2ludHNBbGlnbm1lbnQ7XG4gICAgdGhpcy5zaG93WmVyb1BvaW50cyA9IG9wdGlvbnMuc2hvd1plcm9Qb2ludHM7XG5cbiAgICB0aGlzLmZhY2VOb2RlID0gbmV3IEZhY2VOb2RlKCBvcHRpb25zLmZhY2VEaWFtZXRlciwgeyBvcGFjaXR5OiBvcHRpb25zLmZhY2VPcGFjaXR5IH0gKTtcblxuICAgIHRoaXMucG9pbnRzTm9kZSA9IG5ldyBUZXh0KCAnJywge1xuICAgICAgZm9udDogb3B0aW9ucy5wb2ludHNGb250LFxuICAgICAgZmlsbDogb3B0aW9ucy5wb2ludHNGaWxsLFxuICAgICAgb3BhY2l0eTogb3B0aW9ucy5wb2ludHNPcGFjaXR5LFxuICAgICAgc3Ryb2tlOiBvcHRpb25zLnBvaW50c1N0cm9rZSxcbiAgICAgIGxpbmVXaWR0aDogMVxuICAgIH0gKTtcblxuICAgIG9wdGlvbnMuY2hpbGRyZW4gPSBbIHRoaXMuZmFjZU5vZGUsIHRoaXMucG9pbnRzTm9kZSBdO1xuICAgIHRoaXMubXV0YXRlKCBvcHRpb25zICk7XG5cbiAgICB0aGlzLnNldFBvaW50cyggb3B0aW9ucy5wb2ludHMgKTtcbiAgfVxuXG4gIHB1YmxpYyBzbWlsZSgpOiB2b2lkIHtcbiAgICB0aGlzLmZhY2VOb2RlLnNtaWxlKCk7XG4gICAgdGhpcy5wb2ludHNOb2RlLnZpc2libGUgPSB0cnVlO1xuICB9XG5cbiAgcHVibGljIGZyb3duKCk6IHZvaWQge1xuICAgIHRoaXMuZmFjZU5vZGUuZnJvd24oKTtcbiAgICB0aGlzLnBvaW50c05vZGUudmlzaWJsZSA9IGZhbHNlO1xuICB9XG5cbiAgLyoqXG4gICAqIFNldHMgdGhlIG51bWJlciBvZiBwb2ludHMgZGlzcGxheWVkLlxuICAgKiBAcGFyYW0gcG9pbnRzXG4gICAqL1xuICBwdWJsaWMgc2V0UG9pbnRzKCBwb2ludHM6IG51bWJlciApOiB2b2lkIHtcblxuICAgIC8vIFdlIGRvIG5vdCBoYXZlIG5lZ2F0aXZlIHBvaW50cywgYXMgaXQgZ29lcyBhZ2FpbnN0IG91ciBwaGlsb3NvcGh5LFxuICAgIC8vIHNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvc2NlbmVyeS1waGV0L2lzc3Vlcy8yMjRcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBwb2ludHMgPj0gMCwgJ3BvaW50cyBtdXN0IGJlIG5vbi1uZWdhdGl2ZScgKTtcblxuICAgIGlmICggcG9pbnRzID09PSAwICYmICF0aGlzLnNob3daZXJvUG9pbnRzICkge1xuICAgICAgdGhpcy5wb2ludHNOb2RlLnN0cmluZyA9ICcnO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIHRoaXMucG9pbnRzTm9kZS5zdHJpbmcgPSBgKyR7cG9pbnRzfWA7XG4gICAgfVxuICAgIHRoaXMudXBkYXRlUG9pbnRzUG9zaXRpb24oKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBZGp1c3RzIHBvc2l0aW9uIG9mIHRoZSBwb2ludHMgdG8gbWF0Y2ggdGhlIHNwZWNpZmllZCB2YWx1ZSBvZiBvcHRpb25zLnBvaW50c0FsaWdubWVudC5cbiAgICovXG4gIHByaXZhdGUgdXBkYXRlUG9pbnRzUG9zaXRpb24oKTogdm9pZCB7XG4gICAgc3dpdGNoKCB0aGlzLnBvaW50c0FsaWdubWVudCApIHtcblxuICAgICAgY2FzZSAnY2VudGVyQm90dG9tJzpcbiAgICAgICAgdGhpcy5wb2ludHNOb2RlLmNlbnRlclggPSB0aGlzLmZhY2VOb2RlLmNlbnRlclg7XG4gICAgICAgIHRoaXMucG9pbnRzTm9kZS50b3AgPSB0aGlzLmZhY2VOb2RlLmJvdHRvbSArIHRoaXMuc3BhY2luZztcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGNhc2UgJ3JpZ2h0Qm90dG9tJzpcbiAgICAgICAgdGhpcy5wb2ludHNOb2RlLmxlZnRDZW50ZXIgPSBuZXcgVmVjdG9yMiggdGhpcy5mYWNlTm9kZS5yaWdodCArIHRoaXMuc3BhY2luZywgdGhpcy5mYWNlTm9kZS5jZW50ZXJZICkucm90YXRlKCBNYXRoLlBJIC8gNCApO1xuICAgICAgICBicmVhaztcblxuICAgICAgY2FzZSAncmlnaHRDZW50ZXInOlxuICAgICAgICB0aGlzLnBvaW50c05vZGUubGVmdCA9IHRoaXMuZmFjZU5vZGUucmlnaHQgKyB0aGlzLnNwYWNpbmc7XG4gICAgICAgIHRoaXMucG9pbnRzTm9kZS5jZW50ZXJZID0gdGhpcy5mYWNlTm9kZS5jZW50ZXJZO1xuICAgICAgICBicmVhaztcblxuICAgICAgZGVmYXVsdDpcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCBgdW5zdXBwb3J0ZWQgcG9pbnRzQWxpZ25tZW50OiAke3RoaXMucG9pbnRzQWxpZ25tZW50fWAgKTtcbiAgICB9XG4gIH1cbn1cblxuc2NlbmVyeVBoZXQucmVnaXN0ZXIoICdGYWNlV2l0aFBvaW50c05vZGUnLCBGYWNlV2l0aFBvaW50c05vZGUgKTsiXSwibmFtZXMiOlsiVmVjdG9yMiIsIm9wdGlvbml6ZSIsIk5vZGUiLCJUZXh0IiwiRmFjZU5vZGUiLCJQaGV0Rm9udCIsInNjZW5lcnlQaGV0IiwiRmFjZVdpdGhQb2ludHNOb2RlIiwic21pbGUiLCJmYWNlTm9kZSIsInBvaW50c05vZGUiLCJ2aXNpYmxlIiwiZnJvd24iLCJzZXRQb2ludHMiLCJwb2ludHMiLCJhc3NlcnQiLCJzaG93WmVyb1BvaW50cyIsInN0cmluZyIsInVwZGF0ZVBvaW50c1Bvc2l0aW9uIiwicG9pbnRzQWxpZ25tZW50IiwiY2VudGVyWCIsInRvcCIsImJvdHRvbSIsInNwYWNpbmciLCJsZWZ0Q2VudGVyIiwicmlnaHQiLCJjZW50ZXJZIiwicm90YXRlIiwiTWF0aCIsIlBJIiwibGVmdCIsIkVycm9yIiwicHJvdmlkZWRPcHRpb25zIiwib3B0aW9ucyIsImZhY2VEaWFtZXRlciIsImZhY2VPcGFjaXR5IiwicG9pbnRzRm9udCIsInNpemUiLCJ3ZWlnaHQiLCJwb2ludHNGaWxsIiwicG9pbnRzU3Ryb2tlIiwicG9pbnRzT3BhY2l0eSIsIm9wYWNpdHkiLCJmb250IiwiZmlsbCIsInN0cm9rZSIsImxpbmVXaWR0aCIsImNoaWxkcmVuIiwibXV0YXRlIiwicmVnaXN0ZXIiXSwibWFwcGluZ3MiOiJBQUFBLHNEQUFzRDtBQUV0RDs7Ozs7O0NBTUMsR0FFRCxPQUFPQSxhQUFhLDBCQUEwQjtBQUM5QyxPQUFPQyxlQUFlLGtDQUFrQztBQUV4RCxTQUFlQyxJQUFJLEVBQXVCQyxJQUFJLFFBQVEsOEJBQThCO0FBQ3BGLE9BQU9DLGNBQWMsZ0JBQWdCO0FBQ3JDLE9BQU9DLGNBQWMsZ0JBQWdCO0FBQ3JDLE9BQU9DLGlCQUFpQixtQkFBbUI7QUF1QjVCLElBQUEsQUFBTUMscUJBQU4sTUFBTUEsMkJBQTJCTDtJQXVEdkNNLFFBQWM7UUFDbkIsSUFBSSxDQUFDQyxRQUFRLENBQUNELEtBQUs7UUFDbkIsSUFBSSxDQUFDRSxVQUFVLENBQUNDLE9BQU8sR0FBRztJQUM1QjtJQUVPQyxRQUFjO1FBQ25CLElBQUksQ0FBQ0gsUUFBUSxDQUFDRyxLQUFLO1FBQ25CLElBQUksQ0FBQ0YsVUFBVSxDQUFDQyxPQUFPLEdBQUc7SUFDNUI7SUFFQTs7O0dBR0MsR0FDRCxBQUFPRSxVQUFXQyxNQUFjLEVBQVM7UUFFdkMscUVBQXFFO1FBQ3JFLDBEQUEwRDtRQUMxREMsVUFBVUEsT0FBUUQsVUFBVSxHQUFHO1FBRS9CLElBQUtBLFdBQVcsS0FBSyxDQUFDLElBQUksQ0FBQ0UsY0FBYyxFQUFHO1lBQzFDLElBQUksQ0FBQ04sVUFBVSxDQUFDTyxNQUFNLEdBQUc7UUFDM0IsT0FDSztZQUNILElBQUksQ0FBQ1AsVUFBVSxDQUFDTyxNQUFNLEdBQUcsQ0FBQyxDQUFDLEVBQUVILFFBQVE7UUFDdkM7UUFDQSxJQUFJLENBQUNJLG9CQUFvQjtJQUMzQjtJQUVBOztHQUVDLEdBQ0QsQUFBUUEsdUJBQTZCO1FBQ25DLE9BQVEsSUFBSSxDQUFDQyxlQUFlO1lBRTFCLEtBQUs7Z0JBQ0gs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