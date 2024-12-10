// Copyright 2013-2024, University of Colorado Boulder
/**
 * A single- or double-headed arrow. This is a convenience class, most of the work is done in ArrowShape.
 *
 * @author John Blanco
 * @author Chris Malley (PixelZoom, Inc.)
 * @author Aaron Davis
 * @author Sam Reid (PhET Interactive Simulations)
 */ import { Shape } from '../../kite/js/imports.js';
import InstanceRegistry from '../../phet-core/js/documentation/InstanceRegistry.js';
import optionize from '../../phet-core/js/optionize.js';
import { Path } from '../../scenery/js/imports.js';
import ArrowShape from './ArrowShape.js';
import sceneryPhet from './sceneryPhet.js';
let ArrowNode = class ArrowNode extends Path {
    get tailX() {
        return this._tailX;
    }
    get tailY() {
        return this._tailY;
    }
    get tipX() {
        return this._tipX;
    }
    get tipY() {
        return this._tipY;
    }
    /**
   * Sets the tail and tip positions to update the arrow shape.
   * If the tail and tip are at the same point, the arrow is not shown.
   */ setTailAndTip(tailX, tailY, tipX, tipY) {
        this._tailX = tailX;
        this._tailY = tailY;
        this._tipX = tipX;
        this._tipY = tipY;
        const numberOfPointsChanged = this.updateShapePoints();
        // This bit of logic is to improve performance for the case where the Shape instance can be reused
        // (if the number of points in the array is the same).
        if (!this.shape || numberOfPointsChanged) {
            this.updateShape();
        } else {
            // This is the higher-performance case where the Shape instance can be reused
            this.shape.invalidatePoints();
        }
    }
    /**
   * Initialize or update the shape. Only called if the number of points in the shape changes.
   */ updateShape() {
        const shape = new Shape();
        if (this.shapePoints.length > 1) {
            shape.moveToPoint(this.shapePoints[0]);
            for(let i = 1; i < this.shapePoints.length; i++){
                shape.lineToPoint(this.shapePoints[i]);
            }
            shape.close();
        }
        this.shape = shape;
    }
    /**
   * Sets the tail position.
   */ setTail(tailX, tailY) {
        this.setTailAndTip(tailX, tailY, this._tipX, this._tipY);
    }
    /**
   * Sets the tip position.
   */ setTip(tipX, tipY) {
        this.setTailAndTip(this._tailX, this._tailY, tipX, tipY);
    }
    /**
   * Update the internal shapePoints array which is used to populate the points in the Shape instance.
   * Returns true if the number of points in the array has changed, which would require building a new shape instance.
   */ updateShapePoints() {
        const numberOfPoints = this.shapePoints.length;
        this.shapePoints = ArrowShape.getArrowShapePoints(this._tailX, this._tailY, this._tipX, this._tipY, this.shapePoints, this.options);
        return this.shapePoints.length !== numberOfPoints;
    }
    /**
   * Sets the tail width.
   */ setTailWidth(tailWidth) {
        this.options.tailWidth = tailWidth;
        this.updateShapePoints();
        this.updateShape();
    }
    /**
   * Sets whether the arrow has one or two heads.
   */ setDoubleHead(doubleHead) {
        this.options.doubleHead = doubleHead;
        this.updateShapePoints();
        this.updateShape();
    }
    // Get these fields using ES5 getters.
    constructor(tailX, tailY, tipX, tipY, providedOptions){
        var _window_phet_chipper_queryParameters, _window_phet_chipper, _window_phet;
        // default options
        const options = optionize()({
            headHeight: 10,
            headWidth: 10,
            tailWidth: 5,
            isHeadDynamic: false,
            scaleTailToo: false,
            fractionalHeadHeight: 0.5,
            doubleHead: false,
            // Path options
            fill: 'black',
            stroke: 'black',
            lineWidth: 1
        }, providedOptions);
        // things you're likely to mess up, add more as needed
        assert && assert(options.headWidth > options.tailWidth);
        super(null);
        this.options = options;
        this.shapePoints = [];
        this._tailX = tailX;
        this._tailY = tailY;
        this._tipX = tipX;
        this._tipY = tipY;
        this.setTailAndTip(tailX, tailY, tipX, tipY);
        this.mutate(options);
        // support for binder documentation, stripped out in builds and only runs when ?binder is specified
        assert && ((_window_phet = window.phet) == null ? void 0 : (_window_phet_chipper = _window_phet.chipper) == null ? void 0 : (_window_phet_chipper_queryParameters = _window_phet_chipper.queryParameters) == null ? void 0 : _window_phet_chipper_queryParameters.binder) && InstanceRegistry.registerDataURL('scenery-phet', 'ArrowNode', this);
    }
};
export { ArrowNode as default };
sceneryPhet.register('ArrowNode', ArrowNode);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9BcnJvd05vZGUudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTMtMjAyNCwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbi8qKlxuICogQSBzaW5nbGUtIG9yIGRvdWJsZS1oZWFkZWQgYXJyb3cuIFRoaXMgaXMgYSBjb252ZW5pZW5jZSBjbGFzcywgbW9zdCBvZiB0aGUgd29yayBpcyBkb25lIGluIEFycm93U2hhcGUuXG4gKlxuICogQGF1dGhvciBKb2huIEJsYW5jb1xuICogQGF1dGhvciBDaHJpcyBNYWxsZXkgKFBpeGVsWm9vbSwgSW5jLilcbiAqIEBhdXRob3IgQWFyb24gRGF2aXNcbiAqIEBhdXRob3IgU2FtIFJlaWQgKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXG4gKi9cblxuaW1wb3J0IFZlY3RvcjIgZnJvbSAnLi4vLi4vZG90L2pzL1ZlY3RvcjIuanMnO1xuaW1wb3J0IHsgU2hhcGUgfSBmcm9tICcuLi8uLi9raXRlL2pzL2ltcG9ydHMuanMnO1xuaW1wb3J0IEluc3RhbmNlUmVnaXN0cnkgZnJvbSAnLi4vLi4vcGhldC1jb3JlL2pzL2RvY3VtZW50YXRpb24vSW5zdGFuY2VSZWdpc3RyeS5qcyc7XG5pbXBvcnQgb3B0aW9uaXplIGZyb20gJy4uLy4uL3BoZXQtY29yZS9qcy9vcHRpb25pemUuanMnO1xuaW1wb3J0IHsgUGF0aCwgUGF0aE9wdGlvbnMgfSBmcm9tICcuLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xuaW1wb3J0IEFycm93U2hhcGUgZnJvbSAnLi9BcnJvd1NoYXBlLmpzJztcbmltcG9ydCBzY2VuZXJ5UGhldCBmcm9tICcuL3NjZW5lcnlQaGV0LmpzJztcblxudHlwZSBTZWxmT3B0aW9ucyA9IHtcbiAgaGVhZEhlaWdodD86IG51bWJlcjtcbiAgaGVhZFdpZHRoPzogbnVtYmVyO1xuICB0YWlsV2lkdGg/OiBudW1iZXI7XG4gIGlzSGVhZER5bmFtaWM/OiBib29sZWFuO1xuICBzY2FsZVRhaWxUb28/OiBib29sZWFuO1xuXG4gIC8vIGhlYWQgd2lsbCBiZSBzY2FsZWQgd2hlbiBoZWFkSGVpZ2h0IGlzIGdyZWF0ZXIgdGhhbiBmcmFjdGlvbmFsSGVhZEhlaWdodCAqIGFycm93IGxlbmd0aFxuICBmcmFjdGlvbmFsSGVhZEhlaWdodD86IG51bWJlcjtcblxuICAvLyB0cnVlIHB1dHMgaGVhZHMgb24gYm90aCBlbmRzIG9mIHRoZSBhcnJvdywgZmFsc2UgcHV0cyBhIGhlYWQgYXQgdGhlIHRpcFxuICBkb3VibGVIZWFkPzogYm9vbGVhbjtcbn07XG5cbmV4cG9ydCB0eXBlIEFycm93Tm9kZU9wdGlvbnMgPSBTZWxmT3B0aW9ucyAmIFBhdGhPcHRpb25zO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBBcnJvd05vZGUgZXh0ZW5kcyBQYXRoIHtcblxuICAvLyBHZXQgdGhlc2UgZmllbGRzIHVzaW5nIEVTNSBnZXR0ZXJzLlxuICBwdWJsaWMgY29uc3RydWN0b3IoIHRhaWxYOiBudW1iZXIsIHRhaWxZOiBudW1iZXIsIHRpcFg6IG51bWJlciwgdGlwWTogbnVtYmVyLCBwcm92aWRlZE9wdGlvbnM/OiBBcnJvd05vZGVPcHRpb25zICkge1xuXG4gICAgLy8gZGVmYXVsdCBvcHRpb25zXG4gICAgY29uc3Qgb3B0aW9ucyA9IG9wdGlvbml6ZTxBcnJvd05vZGVPcHRpb25zLCBTZWxmT3B0aW9ucywgUGF0aE9wdGlvbnM+KCkoIHtcbiAgICAgIGhlYWRIZWlnaHQ6IDEwLFxuICAgICAgaGVhZFdpZHRoOiAxMCxcbiAgICAgIHRhaWxXaWR0aDogNSxcbiAgICAgIGlzSGVhZER5bmFtaWM6IGZhbHNlLFxuICAgICAgc2NhbGVUYWlsVG9vOiBmYWxzZSxcbiAgICAgIGZyYWN0aW9uYWxIZWFkSGVpZ2h0OiAwLjUsIC8vIGhlYWQgd2lsbCBiZSBzY2FsZWQgd2hlbiBoZWFkSGVpZ2h0IGlzIGdyZWF0ZXIgdGhhbiBmcmFjdGlvbmFsSGVhZEhlaWdodCAqIGFycm93IGxlbmd0aFxuICAgICAgZG91YmxlSGVhZDogZmFsc2UsIC8vIHRydWUgcHV0cyBoZWFkcyBvbiBib3RoIGVuZHMgb2YgdGhlIGFycm93LCBmYWxzZSBwdXRzIGEgaGVhZCBhdCB0aGUgdGlwXG5cbiAgICAgIC8vIFBhdGggb3B0aW9uc1xuICAgICAgZmlsbDogJ2JsYWNrJyxcbiAgICAgIHN0cm9rZTogJ2JsYWNrJyxcbiAgICAgIGxpbmVXaWR0aDogMVxuICAgIH0sIHByb3ZpZGVkT3B0aW9ucyApO1xuXG4gICAgLy8gdGhpbmdzIHlvdSdyZSBsaWtlbHkgdG8gbWVzcyB1cCwgYWRkIG1vcmUgYXMgbmVlZGVkXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggb3B0aW9ucy5oZWFkV2lkdGggPiBvcHRpb25zLnRhaWxXaWR0aCApO1xuXG4gICAgc3VwZXIoIG51bGwgKTtcblxuICAgIHRoaXMub3B0aW9ucyA9IG9wdGlvbnM7XG4gICAgdGhpcy5zaGFwZVBvaW50cyA9IFtdO1xuXG4gICAgdGhpcy5fdGFpbFggPSB0YWlsWDtcbiAgICB0aGlzLl90YWlsWSA9IHRhaWxZO1xuICAgIHRoaXMuX3RpcFggPSB0aXBYO1xuICAgIHRoaXMuX3RpcFkgPSB0aXBZO1xuXG4gICAgdGhpcy5zZXRUYWlsQW5kVGlwKCB0YWlsWCwgdGFpbFksIHRpcFgsIHRpcFkgKTtcblxuICAgIHRoaXMubXV0YXRlKCBvcHRpb25zICk7XG5cbiAgICAvLyBzdXBwb3J0IGZvciBiaW5kZXIgZG9jdW1lbnRhdGlvbiwgc3RyaXBwZWQgb3V0IGluIGJ1aWxkcyBhbmQgb25seSBydW5zIHdoZW4gP2JpbmRlciBpcyBzcGVjaWZpZWRcbiAgICBhc3NlcnQgJiYgd2luZG93LnBoZXQ/LmNoaXBwZXI/LnF1ZXJ5UGFyYW1ldGVycz8uYmluZGVyICYmIEluc3RhbmNlUmVnaXN0cnkucmVnaXN0ZXJEYXRhVVJMKCAnc2NlbmVyeS1waGV0JywgJ0Fycm93Tm9kZScsIHRoaXMgKTtcbiAgfVxuXG4gIC8vIFNldCB0aGVzZSBmaWVsZHMgdXNpbmcgc2V0VGFpbCwgc2V0VGlwLCBzZXRUYWlsQW5kVGlwLlxuICBwcml2YXRlIF90YWlsWDogbnVtYmVyO1xuXG4gIHB1YmxpYyBnZXQgdGFpbFgoKTogbnVtYmVyIHsgcmV0dXJuIHRoaXMuX3RhaWxYOyB9XG5cbiAgcHJpdmF0ZSBfdGFpbFk6IG51bWJlcjtcblxuICBwcml2YXRlIHJlYWRvbmx5IG9wdGlvbnM6IFJlcXVpcmVkPFNlbGZPcHRpb25zPjtcbiAgcHJpdmF0ZSBzaGFwZVBvaW50czogVmVjdG9yMltdO1xuXG4gIHB1YmxpYyBnZXQgdGFpbFkoKTogbnVtYmVyIHsgcmV0dXJuIHRoaXMuX3RhaWxZOyB9XG5cbiAgcHJpdmF0ZSBfdGlwWDogbnVtYmVyO1xuXG4gIHB1YmxpYyBnZXQgdGlwWCgpOiBudW1iZXIgeyByZXR1cm4gdGhpcy5fdGlwWDsgfVxuXG4gIHByaXZhdGUgX3RpcFk6IG51bWJlcjtcblxuICBwdWJsaWMgZ2V0IHRpcFkoKTogbnVtYmVyIHsgcmV0dXJuIHRoaXMuX3RpcFk7IH1cblxuICAvKipcbiAgICogU2V0cyB0aGUgdGFpbCBhbmQgdGlwIHBvc2l0aW9ucyB0byB1cGRhdGUgdGhlIGFycm93IHNoYXBlLlxuICAgKiBJZiB0aGUgdGFpbCBhbmQgdGlwIGFyZSBhdCB0aGUgc2FtZSBwb2ludCwgdGhlIGFycm93IGlzIG5vdCBzaG93bi5cbiAgICovXG4gIHB1YmxpYyBzZXRUYWlsQW5kVGlwKCB0YWlsWDogbnVtYmVyLCB0YWlsWTogbnVtYmVyLCB0aXBYOiBudW1iZXIsIHRpcFk6IG51bWJlciApOiB2b2lkIHtcblxuICAgIHRoaXMuX3RhaWxYID0gdGFpbFg7XG4gICAgdGhpcy5fdGFpbFkgPSB0YWlsWTtcbiAgICB0aGlzLl90aXBYID0gdGlwWDtcbiAgICB0aGlzLl90aXBZID0gdGlwWTtcblxuICAgIGNvbnN0IG51bWJlck9mUG9pbnRzQ2hhbmdlZCA9IHRoaXMudXBkYXRlU2hhcGVQb2ludHMoKTtcblxuICAgIC8vIFRoaXMgYml0IG9mIGxvZ2ljIGlzIHRvIGltcHJvdmUgcGVyZm9ybWFuY2UgZm9yIHRoZSBjYXNlIHdoZXJlIHRoZSBTaGFwZSBpbnN0YW5jZSBjYW4gYmUgcmV1c2VkXG4gICAgLy8gKGlmIHRoZSBudW1iZXIgb2YgcG9pbnRzIGluIHRoZSBhcnJheSBpcyB0aGUgc2FtZSkuXG4gICAgaWYgKCAhdGhpcy5zaGFwZSB8fCBudW1iZXJPZlBvaW50c0NoYW5nZWQgKSB7XG4gICAgICB0aGlzLnVwZGF0ZVNoYXBlKCk7XG4gICAgfVxuICAgIGVsc2Uge1xuXG4gICAgICAvLyBUaGlzIGlzIHRoZSBoaWdoZXItcGVyZm9ybWFuY2UgY2FzZSB3aGVyZSB0aGUgU2hhcGUgaW5zdGFuY2UgY2FuIGJlIHJldXNlZFxuICAgICAgdGhpcy5zaGFwZS5pbnZhbGlkYXRlUG9pbnRzKCk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEluaXRpYWxpemUgb3IgdXBkYXRlIHRoZSBzaGFwZS4gT25seSBjYWxsZWQgaWYgdGhlIG51bWJlciBvZiBwb2ludHMgaW4gdGhlIHNoYXBlIGNoYW5nZXMuXG4gICAqL1xuICBwcml2YXRlIHVwZGF0ZVNoYXBlKCk6IHZvaWQge1xuXG4gICAgY29uc3Qgc2hhcGUgPSBuZXcgU2hhcGUoKTtcblxuICAgIGlmICggdGhpcy5zaGFwZVBvaW50cy5sZW5ndGggPiAxICkge1xuICAgICAgc2hhcGUubW92ZVRvUG9pbnQoIHRoaXMuc2hhcGVQb2ludHNbIDAgXSApO1xuICAgICAgZm9yICggbGV0IGkgPSAxOyBpIDwgdGhpcy5zaGFwZVBvaW50cy5sZW5ndGg7IGkrKyApIHtcbiAgICAgICAgc2hhcGUubGluZVRvUG9pbnQoIHRoaXMuc2hhcGVQb2ludHNbIGkgXSApO1xuICAgICAgfVxuICAgICAgc2hhcGUuY2xvc2UoKTtcbiAgICB9XG5cbiAgICB0aGlzLnNoYXBlID0gc2hhcGU7XG4gIH1cblxuICAvKipcbiAgICogU2V0cyB0aGUgdGFpbCBwb3NpdGlvbi5cbiAgICovXG4gIHB1YmxpYyBzZXRUYWlsKCB0YWlsWDogbnVtYmVyLCB0YWlsWTogbnVtYmVyICk6IHZvaWQge1xuICAgIHRoaXMuc2V0VGFpbEFuZFRpcCggdGFpbFgsIHRhaWxZLCB0aGlzLl90aXBYLCB0aGlzLl90aXBZICk7XG4gIH1cblxuICAvKipcbiAgICogU2V0cyB0aGUgdGlwIHBvc2l0aW9uLlxuICAgKi9cbiAgcHVibGljIHNldFRpcCggdGlwWDogbnVtYmVyLCB0aXBZOiBudW1iZXIgKTogdm9pZCB7XG4gICAgdGhpcy5zZXRUYWlsQW5kVGlwKCB0aGlzLl90YWlsWCwgdGhpcy5fdGFpbFksIHRpcFgsIHRpcFkgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBVcGRhdGUgdGhlIGludGVybmFsIHNoYXBlUG9pbnRzIGFycmF5IHdoaWNoIGlzIHVzZWQgdG8gcG9wdWxhdGUgdGhlIHBvaW50cyBpbiB0aGUgU2hhcGUgaW5zdGFuY2UuXG4gICAqIFJldHVybnMgdHJ1ZSBpZiB0aGUgbnVtYmVyIG9mIHBvaW50cyBpbiB0aGUgYXJyYXkgaGFzIGNoYW5nZWQsIHdoaWNoIHdvdWxkIHJlcXVpcmUgYnVpbGRpbmcgYSBuZXcgc2hhcGUgaW5zdGFuY2UuXG4gICAqL1xuICBwcml2YXRlIHVwZGF0ZVNoYXBlUG9pbnRzKCk6IGJvb2xlYW4ge1xuICAgIGNvbnN0IG51bWJlck9mUG9pbnRzID0gdGhpcy5zaGFwZVBvaW50cy5sZW5ndGg7XG4gICAgdGhpcy5zaGFwZVBvaW50cyA9IEFycm93U2hhcGUuZ2V0QXJyb3dTaGFwZVBvaW50cyggdGhpcy5fdGFpbFgsIHRoaXMuX3RhaWxZLCB0aGlzLl90aXBYLCB0aGlzLl90aXBZLCB0aGlzLnNoYXBlUG9pbnRzLCB0aGlzLm9wdGlvbnMgKTtcbiAgICByZXR1cm4gKCB0aGlzLnNoYXBlUG9pbnRzLmxlbmd0aCAhPT0gbnVtYmVyT2ZQb2ludHMgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXRzIHRoZSB0YWlsIHdpZHRoLlxuICAgKi9cbiAgcHVibGljIHNldFRhaWxXaWR0aCggdGFpbFdpZHRoOiBudW1iZXIgKTogdm9pZCB7XG4gICAgdGhpcy5vcHRpb25zLnRhaWxXaWR0aCA9IHRhaWxXaWR0aDtcbiAgICB0aGlzLnVwZGF0ZVNoYXBlUG9pbnRzKCk7XG4gICAgdGhpcy51cGRhdGVTaGFwZSgpO1xuICB9XG5cbiAgLyoqXG4gICAqIFNldHMgd2hldGhlciB0aGUgYXJyb3cgaGFzIG9uZSBvciB0d28gaGVhZHMuXG4gICAqL1xuICBwdWJsaWMgc2V0RG91YmxlSGVhZCggZG91YmxlSGVhZDogYm9vbGVhbiApOiB2b2lkIHtcbiAgICB0aGlzLm9wdGlvbnMuZG91YmxlSGVhZCA9IGRvdWJsZUhlYWQ7XG4gICAgdGhpcy51cGRhdGVTaGFwZVBvaW50cygpO1xuICAgIHRoaXMudXBkYXRlU2hhcGUoKTtcbiAgfVxufVxuXG5zY2VuZXJ5UGhldC5yZWdpc3RlciggJ0Fycm93Tm9kZScsIEFycm93Tm9kZSApOyJdLCJuYW1lcyI6WyJTaGFwZSIsIkluc3RhbmNlUmVnaXN0cnkiLCJvcHRpb25pemUiLCJQYXRoIiwiQXJyb3dTaGFwZSIsInNjZW5lcnlQaGV0IiwiQXJyb3dOb2RlIiwidGFpbFgiLCJfdGFpbFgiLCJ0YWlsWSIsIl90YWlsWSIsInRpcFgiLCJfdGlwWCIsInRpcFkiLCJfdGlwWSIsInNldFRhaWxBbmRUaXAiLCJudW1iZXJPZlBvaW50c0NoYW5nZWQiLCJ1cGRhdGVTaGFwZVBvaW50cyIsInNoYXBlIiwidXBkYXRlU2hhcGUiLCJpbnZhbGlkYXRlUG9pbnRzIiwic2hhcGVQb2ludHMiLCJsZW5ndGgiLCJtb3ZlVG9Qb2ludCIsImkiLCJsaW5lVG9Qb2ludCIsImNsb3NlIiwic2V0VGFpbCIsInNldFRpcCIsIm51bWJlck9mUG9pbnRzIiwiZ2V0QXJyb3dTaGFwZVBvaW50cyIsIm9wdGlvbnMiLCJzZXRUYWlsV2lkdGgiLCJ0YWlsV2lkdGgiLCJzZXREb3VibGVIZWFkIiwiZG91YmxlSGVhZCIsInByb3ZpZGVkT3B0aW9ucyIsIndpbmRvdyIsImhlYWRIZWlnaHQiLCJoZWFkV2lkdGgiLCJpc0hlYWREeW5hbWljIiwic2NhbGVUYWlsVG9vIiwiZnJhY3Rpb25hbEhlYWRIZWlnaHQiLCJmaWxsIiwic3Ryb2tlIiwibGluZVdpZHRoIiwiYXNzZXJ0IiwibXV0YXRlIiwicGhldCIsImNoaXBwZXIiLCJxdWVyeVBhcmFtZXRlcnMiLCJiaW5kZXIiLCJyZWdpc3RlckRhdGFVUkwiLCJyZWdpc3RlciJdLCJtYXBwaW5ncyI6IkFBQUEsc0RBQXNEO0FBRXREOzs7Ozs7O0NBT0MsR0FHRCxTQUFTQSxLQUFLLFFBQVEsMkJBQTJCO0FBQ2pELE9BQU9DLHNCQUFzQix1REFBdUQ7QUFDcEYsT0FBT0MsZUFBZSxrQ0FBa0M7QUFDeEQsU0FBU0MsSUFBSSxRQUFxQiw4QkFBOEI7QUFDaEUsT0FBT0MsZ0JBQWdCLGtCQUFrQjtBQUN6QyxPQUFPQyxpQkFBaUIsbUJBQW1CO0FBa0I1QixJQUFBLEFBQU1DLFlBQU4sTUFBTUEsa0JBQWtCSDtJQTZDckMsSUFBV0ksUUFBZ0I7UUFBRSxPQUFPLElBQUksQ0FBQ0MsTUFBTTtJQUFFO0lBT2pELElBQVdDLFFBQWdCO1FBQUUsT0FBTyxJQUFJLENBQUNDLE1BQU07SUFBRTtJQUlqRCxJQUFXQyxPQUFlO1FBQUUsT0FBTyxJQUFJLENBQUNDLEtBQUs7SUFBRTtJQUkvQyxJQUFXQyxPQUFlO1FBQUUsT0FBTyxJQUFJLENBQUNDLEtBQUs7SUFBRTtJQUUvQzs7O0dBR0MsR0FDRCxBQUFPQyxjQUFlUixLQUFhLEVBQUVFLEtBQWEsRUFBRUUsSUFBWSxFQUFFRSxJQUFZLEVBQVM7UUFFckYsSUFBSSxDQUFDTCxNQUFNLEdBQUdEO1FBQ2QsSUFBSSxDQUFDRyxNQUFNLEdBQUdEO1FBQ2QsSUFBSSxDQUFDRyxLQUFLLEdBQUdEO1FBQ2IsSUFBSSxDQUFDRyxLQUFLLEdBQUdEO1FBRWIsTUFBTUcsd0JBQXdCLElBQUksQ0FBQ0MsaUJBQWlCO1FBRXBELGtHQUFrRztRQUNsRyxzREFBc0Q7UUFDdEQsSUFBSyxDQUFDLElBQUksQ0FBQ0MsS0FBSyxJQUFJRix1QkFBd0I7WUFDMUMsSUFBSSxDQUFDRyxXQUFXO1FBQ2xCLE9BQ0s7WUFFSCw2RUFBNkU7WUFDN0UsSUFBSSxDQUFDRCxLQUFLLENBQUNFLGdCQUFnQjtRQUM3QjtJQUNGO0lBRUE7O0dBRUMsR0FDRCxBQUFRRCxjQUFvQjtRQUUxQixNQUFNRCxRQUFRLElBQUlsQjtRQUVsQixJQUFLLElBQUksQ0FBQ3FCLFdBQVcsQ0FBQ0MsTUFBTSxHQUFHLEdBQUk7WUFDakNKLE1BQU1LLFdBQVcsQ0FBRSxJQUFJLENBQUNGLFdBQVcsQ0FBRSxFQUFHO1lBQ3hDLElBQU0sSUFBSUcsSUFBSSxHQUFHQSxJQUFJLElBQUksQ0FBQ0gsV0FBVyxDQUFDQyxNQUFNLEVBQUVFLElBQU07Z0JBQ2xETixNQUFNTyxXQUFXLENBQUUsSUFBSSxDQUFDSixXQUFXLENBQUVHLEVBQUc7WUFDMUM7WUFDQU4sTUFBTVEsS0FBSztRQUNiO1FBRUEsSUFBSSxDQUFDUixLQUFLLEdBQUdBO0lBQ2Y7SUFFQTs7R0FFQyxHQUNELEFBQU9TLFFBQVNwQixLQUFhLEVBQUVFLEtBQWEsRUFBUztRQUNuRCxJQUFJLENBQUNNLGFBQWEsQ0FBRVIsT0FBT0UsT0FBTyxJQUFJLENBQUNHLEtBQUssRUFBRSxJQUFJLENBQUNFLEtBQUs7SUFDMUQ7SUFFQTs7R0FFQyxHQUNELEFBQU9jLE9BQVFqQixJQUFZLEVBQUVFLElBQVksRUFBUztRQUNoRCxJQUFJLENBQUNFLGFBQWEsQ0FBRSxJQUFJLENBQUNQLE1BQU0sRUFBRSxJQUFJLENBQUNFLE1BQU0sRUFBRUMsTUFBTUU7SUFDdEQ7SUFFQTs7O0dBR0MsR0FDRCxBQUFRSSxvQkFBNkI7UUFDbkMsTUFBTVksaUJBQWlCLElBQUksQ0FBQ1IsV0FBVyxDQUFDQyxNQUFNO1FBQzlDLElBQUksQ0FBQ0QsV0FBVyxHQUFHakIsV0FBVzBCLG1CQUFtQixDQUFFLElBQUksQ0FBQ3RCLE1BQU0sRUFBRSxJQUFJLENBQUNFLE1BQU0sRUFBRSxJQUFJLENBQUNFLEtBQUssRUFBRSxJQUFJLENBQUNFLEtBQUssRUFBRSxJQUFJLENBQUNPLFdBQVcsRUFBRSxJQUFJLENBQUNVLE9BQU87UUFDbkksT0FBUyxJQUFJLENBQUNWLFdBQVcsQ0FBQ0MsTUFBTSxLQUFLTztJQUN2QztJQUVBOztHQUVDLEdBQ0QsQUFBT0csYUFBY0MsU0FBaUIsRUFBUztRQUM3QyxJQUFJLENBQUNGLE9BQU8sQ0FBQ0UsU0FBUyxHQUFHQTtRQUN6QixJQUFJLENBQUNoQixpQkFBaUI7UUFDdEIsSUFBSSxDQUFDRSxXQUFXO0lBQ2xCO0lBRUE7O0dBRUMsR0FDRCxBQUFPZSxjQUFlQyxVQUFtQixFQUFTO1FBQ2hELElBQUksQ0FBQ0osT0FBTyxDQUFDSSxVQUFVLEdBQUdBO1FBQzFCLElBQUksQ0FBQ2xCLGlCQUFpQjtRQUN0QixJQUFJLENBQUNFLFdBQVc7SUFDbEI7SUEvSUEsc0NBQXNDO0lBQ3RDLFlBQW9CWixLQUFhLEVBQUVFLEtBQWEsRUFBRUUsSUFBWSxFQUFFRSxJQUFZLEVBQUV1QixlQUFrQyxDQUFHO1lBb0N2R0Msc0NBQUFBLHNCQUFBQTtRQWxDVixrQkFBa0I7UUFDbEIsTUFBTU4sVUFBVTdCLFlBQXlEO1lBQ3ZFb0MsWUFBWTtZQUNaQyxXQUFXO1lBQ1hOLFdBQVc7WUFDWE8sZUFBZTtZQUNmQyxjQUFjO1lBQ2RDLHNCQUFzQjtZQUN0QlAsWUFBWTtZQUVaLGVBQWU7WUFDZlEsTUFBTTtZQUNOQyxRQUFRO1lBQ1JDLFdBQVc7UUFDYixHQUFHVDtRQUVILHNEQUFzRDtRQUN0RFUsVUFBVUEsT0FBUWYsUUFBUVEsU0FBUyxHQUFHUixRQUFRRSxTQUFTO1FBRXZELEtBQUssQ0FBRTtRQUVQLElBQUksQ0FBQ0YsT0FBTyxHQUFHQTtRQUNmLElBQUksQ0FBQ1YsV0FBVyxHQUFHLEVBQUU7UUFFckIsSUFBSSxDQUFDYixNQUFNLEdBQUdEO1FBQ2QsSUFBSSxDQUFDRyxNQUFNLEdBQUdEO1FBQ2QsSUFBSSxDQUFDRyxLQUFLLEdBQUdEO1FBQ2IsSUFBSSxDQUFDRyxLQUFLLEdBQUdEO1FBRWIsSUFBSSxDQUFDRSxhQUFhLENBQUVSLE9BQU9FLE9BQU9FLE1BQU1FO1FBRXhDLElBQUksQ0FBQ2tDLE1BQU0sQ0FBRWhCO1FBRWIsbUdBQW1HO1FBQ25HZSxZQUFVVCxlQUFBQSxPQUFPVyxJQUFJLHNCQUFYWCx1QkFBQUEsYUFBYVksT0FBTyxzQkFBcEJaLHVDQUFBQSxxQkFBc0JhLGVBQWUscUJBQXJDYixxQ0FBdUNjLE1BQU0sS0FBSWxELGlCQUFpQm1ELGVBQWUsQ0FBRSxnQkFBZ0IsYUFBYSxJQUFJO0lBQ2hJO0FBMEdGO0FBbEpBLFNBQXFCOUMsdUJBa0pwQjtBQUVERCxZQUFZZ0QsUUFBUSxDQUFFLGFBQWEvQyJ9