// Copyright 2013-2024, University of Colorado Boulder
/**
 * Styles needed to determine a stroked line shape. Generally immutable.
 *
 * Mirrors much of what is done with SVG/Canvas, see https://svgwg.org/svg2-draft/painting.html for details.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ import Utils from '../../../dot/js/Utils.js';
import merge from '../../../phet-core/js/merge.js';
import { Arc, kite, Line } from '../imports.js';
// constants
const lineLineIntersection = Utils.lineLineIntersection;
const DEFAULT_OPTIONS = {
    lineWidth: 1,
    lineCap: 'butt',
    lineJoin: 'miter',
    lineDash: [],
    lineDashOffset: 0,
    miterLimit: 10
};
let LineStyles = class LineStyles {
    /**
   * Determines of this lineStyles is equal to the other LineStyles
   */ equals(other) {
        const typical = this.lineWidth === other.lineWidth && this.lineCap === other.lineCap && this.lineJoin === other.lineJoin && this.miterLimit === other.miterLimit && this.lineDashOffset === other.lineDashOffset;
        if (!typical) {
            return false;
        }
        if (this.lineDash.length === other.lineDash.length) {
            for(let i = 0; i < this.lineDash.length; i++){
                if (this.lineDash[i] !== other.lineDash[i]) {
                    return false;
                }
            }
        } else {
            // line dashes must be different
            return false;
        }
        return true;
    }
    /**
   * Returns a copy of this LineStyles.
   */ copy() {
        return new LineStyles({
            lineWidth: this.lineWidth,
            lineCap: this.lineCap,
            lineJoin: this.lineJoin,
            lineDash: this.lineDash,
            lineDashOffset: this.lineDashOffset,
            miterLimit: this.miterLimit
        });
    }
    /**
   * Creates an array of Segments that make up a line join, to the left side.
   *
   * Joins two segments together on the logical "left" side, at 'center' (where they meet), and un-normalized tangent
   * vectors in the direction of the stroking. To join on the "right" side, switch the tangent order and negate them.
   */ leftJoin(center, fromTangent, toTangent) {
        fromTangent = fromTangent.normalized();
        toTangent = toTangent.normalized();
        // where our join path starts and ends
        const fromPoint = center.plus(fromTangent.perpendicular.negated().times(this.lineWidth / 2));
        const toPoint = center.plus(toTangent.perpendicular.negated().times(this.lineWidth / 2));
        const bevel = fromPoint.equals(toPoint) ? [] : [
            new Line(fromPoint, toPoint)
        ];
        let fromAngle;
        let toAngle;
        let theta;
        // only insert a join on the non-acute-angle side
        // epsilon present for https://github.com/phetsims/kite/issues/73, where we don't want to join barely-existing
        // joins.
        if (fromTangent.perpendicular.dot(toTangent) > 1e-12) {
            switch(this.lineJoin){
                case 'round':
                    fromAngle = fromTangent.angle + Math.PI / 2;
                    toAngle = toTangent.angle + Math.PI / 2;
                    return [
                        new Arc(center, this.lineWidth / 2, fromAngle, toAngle, true)
                    ];
                case 'miter':
                    theta = fromTangent.angleBetween(toTangent.negated());
                    if (1 / Math.sin(theta / 2) <= this.miterLimit && theta < Math.PI - 0.00001) {
                        // draw the miter
                        const miterPoint = lineLineIntersection(fromPoint, fromPoint.plus(fromTangent), toPoint, toPoint.plus(toTangent));
                        if (miterPoint) {
                            return [
                                new Line(fromPoint, miterPoint),
                                new Line(miterPoint, toPoint)
                            ];
                        } else {
                            return [
                                new Line(fromPoint, toPoint)
                            ];
                        }
                    } else {
                        // angle too steep, use bevel instead. same as below, but copied for linter
                        return bevel;
                    }
                case 'bevel':
                    return bevel;
                default:
                    throw new Error(`invalid lineJoin: ${this.lineJoin}`);
            }
        } else {
            // no join necessary here since we have the acute angle. just simple lineTo for now so that the next segment starts from the right place
            // TODO: can we prevent self-intersection here? https://github.com/phetsims/kite/issues/76
            return bevel;
        }
    }
    /**
   * Creates an array of Segments that make up a line join, to the right side.
   *
   * Joins two segments together on the logical "right" side, at 'center' (where they meet), and normalized tangent
   * vectors in the direction of the stroking. To join on the "left" side, switch the tangent order and negate them.
   */ rightJoin(center, fromTangent, toTangent) {
        return this.leftJoin(center, toTangent.negated(), fromTangent.negated());
    }
    /**
   * Creates an array of Segments that make up a line cap from the endpoint 'center' in the direction of the tangent
   */ cap(center, tangent) {
        tangent = tangent.normalized();
        const fromPoint = center.plus(tangent.perpendicular.times(-this.lineWidth / 2));
        const toPoint = center.plus(tangent.perpendicular.times(this.lineWidth / 2));
        let tangentAngle;
        let toLeft;
        let toRight;
        let toFront;
        let left;
        let right;
        switch(this.lineCap){
            case 'butt':
                return [
                    new Line(fromPoint, toPoint)
                ];
            case 'round':
                tangentAngle = tangent.angle;
                return [
                    new Arc(center, this.lineWidth / 2, tangentAngle + Math.PI / 2, tangentAngle - Math.PI / 2, true)
                ];
            case 'square':
                toLeft = tangent.perpendicular.negated().times(this.lineWidth / 2);
                toRight = tangent.perpendicular.times(this.lineWidth / 2);
                toFront = tangent.times(this.lineWidth / 2);
                left = center.plus(toLeft).plus(toFront);
                right = center.plus(toRight).plus(toFront);
                return [
                    new Line(fromPoint, left),
                    new Line(left, right),
                    new Line(right, toPoint)
                ];
            default:
                throw new Error(`invalid lineCap: ${this.lineCap}`);
        }
    }
    constructor(options){
        const filledOptions = merge({}, DEFAULT_OPTIONS, options);
        this.lineWidth = filledOptions.lineWidth;
        this.lineCap = filledOptions.lineCap;
        this.lineJoin = filledOptions.lineJoin;
        this.lineDash = filledOptions.lineDash;
        this.lineDashOffset = filledOptions.lineDashOffset;
        this.miterLimit = filledOptions.miterLimit;
        assert && assert(typeof this.lineWidth === 'number', `lineWidth should be a number: ${this.lineWidth}`);
        assert && assert(isFinite(this.lineWidth), `lineWidth should be a finite number: ${this.lineWidth}`);
        assert && assert(this.lineWidth >= 0, `lineWidth should be non-negative: ${this.lineWidth}`);
        assert && assert(this.lineCap === 'butt' || this.lineCap === 'round' || this.lineCap === 'square', `Invalid lineCap: ${this.lineCap}`);
        assert && assert(this.lineJoin === 'miter' || this.lineJoin === 'round' || this.lineJoin === 'bevel', `Invalid lineJoin: ${this.lineJoin}`);
        assert && assert(Array.isArray(this.lineDash), `lineDash should be an array: ${this.lineDash}`);
        assert && assert(_.every(this.lineDash, (dash)=>typeof dash === 'number' && isFinite(dash) && dash >= 0), `Every lineDash should be a non-negative finite number: ${this.lineDash}`);
        assert && assert(typeof this.lineDashOffset === 'number', `lineDashOffset should be a number: ${this.lineDashOffset}`);
        assert && assert(isFinite(this.lineDashOffset), `lineDashOffset should be a finite number: ${this.lineDashOffset}`);
        assert && assert(typeof this.miterLimit === 'number', `miterLimit should be a number: ${this.miterLimit}`);
        assert && assert(isFinite(this.miterLimit), `miterLimit should be a finite number: ${this.miterLimit}`);
    }
};
export { LineStyles as default };
kite.register('LineStyles', LineStyles);
export { DEFAULT_OPTIONS as LINE_STYLE_DEFAULT_OPTIONS };

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL2tpdGUvanMvdXRpbC9MaW5lU3R5bGVzLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDEzLTIwMjQsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIFN0eWxlcyBuZWVkZWQgdG8gZGV0ZXJtaW5lIGEgc3Ryb2tlZCBsaW5lIHNoYXBlLiBHZW5lcmFsbHkgaW1tdXRhYmxlLlxuICpcbiAqIE1pcnJvcnMgbXVjaCBvZiB3aGF0IGlzIGRvbmUgd2l0aCBTVkcvQ2FudmFzLCBzZWUgaHR0cHM6Ly9zdmd3Zy5vcmcvc3ZnMi1kcmFmdC9wYWludGluZy5odG1sIGZvciBkZXRhaWxzLlxuICpcbiAqIEBhdXRob3IgSm9uYXRoYW4gT2xzb24gPGpvbmF0aGFuLm9sc29uQGNvbG9yYWRvLmVkdT5cbiAqL1xuXG5pbXBvcnQgVXRpbHMgZnJvbSAnLi4vLi4vLi4vZG90L2pzL1V0aWxzLmpzJztcbmltcG9ydCBWZWN0b3IyIGZyb20gJy4uLy4uLy4uL2RvdC9qcy9WZWN0b3IyLmpzJztcbmltcG9ydCBtZXJnZSBmcm9tICcuLi8uLi8uLi9waGV0LWNvcmUvanMvbWVyZ2UuanMnO1xuaW1wb3J0IHsgQXJjLCBraXRlLCBMaW5lLCBTZWdtZW50IH0gZnJvbSAnLi4vaW1wb3J0cy5qcyc7XG5cbi8vIGNvbnN0YW50c1xuY29uc3QgbGluZUxpbmVJbnRlcnNlY3Rpb24gPSBVdGlscy5saW5lTGluZUludGVyc2VjdGlvbjtcblxuY29uc3QgREVGQVVMVF9PUFRJT05TID0ge1xuICBsaW5lV2lkdGg6IDEsXG4gIGxpbmVDYXA6ICdidXR0JyxcbiAgbGluZUpvaW46ICdtaXRlcicsXG4gIGxpbmVEYXNoOiBbXSxcbiAgbGluZURhc2hPZmZzZXQ6IDAsXG4gIG1pdGVyTGltaXQ6IDEwXG59O1xuXG5leHBvcnQgdHlwZSBMaW5lQ2FwID0gJ2J1dHQnIHwgJ3JvdW5kJyB8ICdzcXVhcmUnO1xuZXhwb3J0IHR5cGUgTGluZUpvaW4gPSAnbWl0ZXInIHwgJ3JvdW5kJyB8ICdiZXZlbCc7XG5leHBvcnQgdHlwZSBMaW5lU3R5bGVzT3B0aW9ucyA9IHtcbiAgbGluZVdpZHRoPzogbnVtYmVyO1xuICBsaW5lQ2FwPzogTGluZUNhcDtcbiAgbGluZUpvaW4/OiBMaW5lSm9pbjtcbiAgbGluZURhc2g/OiBudW1iZXJbXTtcbiAgbGluZURhc2hPZmZzZXQ/OiBudW1iZXI7XG4gIG1pdGVyTGltaXQ/OiBudW1iZXI7XG59O1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBMaW5lU3R5bGVzIHtcblxuICAvLyBUaGUgd2lkdGggb2YgdGhlIGxpbmUgKHdpbGwgYmUgb2Zmc2V0IHRvIGVhY2ggc2lkZSBieSBsaW5lV2lkdGgvMilcbiAgcHVibGljIGxpbmVXaWR0aDogbnVtYmVyO1xuXG4gIC8vICdidXR0JywgJ3JvdW5kJyBvciAnc3F1YXJlJyAtIENvbnRyb2xzIGFwcGVhcmFuY2UgYXQgZW5kcG9pbnRzIGZvciBub24tY2xvc2VkIHN1YnBhdGhzLlxuICAvLyAtIGJ1dHQ6IHN0cmFpZ2h0LWxpbmUgYXQgZW5kIHBvaW50LCBnb2luZyB0aHJvdWdoIHRoZSBlbmRwb2ludCAocGVycGVuZGljdWxhciB0byB0aGUgdGFuZ2VudClcbiAgLy8gLSByb3VuZDogY2lyY3VsYXIgYm9yZGVyIHdpdGggcmFkaXVzIGxpbmVXaWR0aC8yIGFyb3VuZCBlbmRwb2ludHNcbiAgLy8gLSBzcXVhcmU6IHN0cmFpZ2h0LWxpbmUgcGFzdCB0aGUgZW5kIHBvaW50IChieSBsaW5lV2lkdGgvMilcbiAgLy8gU2VlOiBodHRwczovL3N2Z3dnLm9yZy9zdmcyLWRyYWZ0L3BhaW50aW5nLmh0bWwjTGluZUNhcHNcbiAgcHVibGljIGxpbmVDYXA6IExpbmVDYXA7XG5cbiAgLy8gJ21pdGVyJywgJ3JvdW5kJyBvciAnYmV2ZWwnIC0gQ29udHJvbHMgYXBwZWFyYW5jZSBhdCBqb2ludHMgYmV0d2VlbiBzZWdtZW50cyAoYXQgdGhlIHBvaW50KVxuICAvLyAtIG1pdGVyOiBVc2Ugc2hhcnAgY29ybmVycyAod2hpY2ggYXJlbid0IHRvbyBzaGFycCwgc2VlIG1pdGVyTGltaXQpLiBFeHRlbmRzIGVkZ2VzIHVudGlsIHRoZXkgbWVlZC5cbiAgLy8gLSByb3VuZDogY2lyY3VsYXIgYm9yZGVyIHdpdGggcmFkaXVzIGxpbmVXaWR0aC8yIGFyb3VuZCBqb2ludHNcbiAgLy8gLSBiZXZlbDogZGlyZWN0bHkgam9pbnMgdGhlIGdhcCB3aXRoIGEgbGluZSBzZWdtZW50LlxuICAvLyBTZWU6IGh0dHBzOi8vc3Znd2cub3JnL3N2ZzItZHJhZnQvcGFpbnRpbmcuaHRtbCNMaW5lSm9pblxuICBwdWJsaWMgbGluZUpvaW46IExpbmVKb2luO1xuXG4gIC8vIEV2ZW4gdmFsdWVzIGluIHRoZSBhcnJheSBhcmUgdGhlIFwiZGFzaFwiIGxlbmd0aCwgb2RkIHZhbHVlcyBhcmUgdGhlIFwiZ2FwXCIgbGVuZ3RoLlxuICAvLyBOT1RFOiBJZiB0aGVyZSBpcyBhbiBvZGQgbnVtYmVyIG9mIGVudHJpZXMsIGl0IGJlaGF2ZXMgbGlrZSBsaW5lRGFzaC5jb25jYXQoIGxpbmVEYXNoICkuXG4gIC8vIFNlZTogaHR0cHM6Ly9zdmd3Zy5vcmcvc3ZnMi1kcmFmdC9wYWludGluZy5odG1sI1N0cm9rZURhc2hpbmdcbiAgcHVibGljIGxpbmVEYXNoOiBudW1iZXJbXTtcblxuICAvLyBPZmZzZXQgZnJvbSB0aGUgc3RhcnQgb2YgdGhlIHN1YnBhdGggd2hlcmUgdGhlIHN0YXJ0IG9mIHRoZSBsaW5lLWRhc2ggYXJyYXkgc3RhcnRzLlxuICBwdWJsaWMgbGluZURhc2hPZmZzZXQ6IG51bWJlcjtcblxuICAvLyBXaGVuIHRvIGN1dCBvZmYgbGluZUpvaW46bWl0ZXIgdG8gbG9vayBsaWtlIGxpbmVKb2luOmJldmVsLiBTZWUgaHR0cHM6Ly9zdmd3Zy5vcmcvc3ZnMi1kcmFmdC9wYWludGluZy5odG1sXG4gIHB1YmxpYyBtaXRlckxpbWl0OiBudW1iZXI7XG5cbiAgcHVibGljIGNvbnN0cnVjdG9yKCBvcHRpb25zPzogTGluZVN0eWxlc09wdGlvbnMgKSB7XG4gICAgY29uc3QgZmlsbGVkT3B0aW9ucyA9IG1lcmdlKCB7fSwgREVGQVVMVF9PUFRJT05TLCBvcHRpb25zICkgYXMgUmVxdWlyZWQ8TGluZVN0eWxlc09wdGlvbnM+O1xuXG4gICAgdGhpcy5saW5lV2lkdGggPSBmaWxsZWRPcHRpb25zLmxpbmVXaWR0aDtcbiAgICB0aGlzLmxpbmVDYXAgPSBmaWxsZWRPcHRpb25zLmxpbmVDYXA7XG4gICAgdGhpcy5saW5lSm9pbiA9IGZpbGxlZE9wdGlvbnMubGluZUpvaW47XG4gICAgdGhpcy5saW5lRGFzaCA9IGZpbGxlZE9wdGlvbnMubGluZURhc2g7XG4gICAgdGhpcy5saW5lRGFzaE9mZnNldCA9IGZpbGxlZE9wdGlvbnMubGluZURhc2hPZmZzZXQ7XG4gICAgdGhpcy5taXRlckxpbWl0ID0gZmlsbGVkT3B0aW9ucy5taXRlckxpbWl0O1xuXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdHlwZW9mIHRoaXMubGluZVdpZHRoID09PSAnbnVtYmVyJywgYGxpbmVXaWR0aCBzaG91bGQgYmUgYSBudW1iZXI6ICR7dGhpcy5saW5lV2lkdGh9YCApO1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIGlzRmluaXRlKCB0aGlzLmxpbmVXaWR0aCApLCBgbGluZVdpZHRoIHNob3VsZCBiZSBhIGZpbml0ZSBudW1iZXI6ICR7dGhpcy5saW5lV2lkdGh9YCApO1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIHRoaXMubGluZVdpZHRoID49IDAsIGBsaW5lV2lkdGggc2hvdWxkIGJlIG5vbi1uZWdhdGl2ZTogJHt0aGlzLmxpbmVXaWR0aH1gICk7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdGhpcy5saW5lQ2FwID09PSAnYnV0dCcgfHwgdGhpcy5saW5lQ2FwID09PSAncm91bmQnIHx8IHRoaXMubGluZUNhcCA9PT0gJ3NxdWFyZScsXG4gICAgICBgSW52YWxpZCBsaW5lQ2FwOiAke3RoaXMubGluZUNhcH1gICk7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdGhpcy5saW5lSm9pbiA9PT0gJ21pdGVyJyB8fCB0aGlzLmxpbmVKb2luID09PSAncm91bmQnIHx8IHRoaXMubGluZUpvaW4gPT09ICdiZXZlbCcsXG4gICAgICBgSW52YWxpZCBsaW5lSm9pbjogJHt0aGlzLmxpbmVKb2lufWAgKTtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBBcnJheS5pc0FycmF5KCB0aGlzLmxpbmVEYXNoICksIGBsaW5lRGFzaCBzaG91bGQgYmUgYW4gYXJyYXk6ICR7dGhpcy5saW5lRGFzaH1gICk7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggXy5ldmVyeSggdGhpcy5saW5lRGFzaCwgZGFzaCA9PiAoIHR5cGVvZiBkYXNoID09PSAnbnVtYmVyJyApICYmIGlzRmluaXRlKCBkYXNoICkgJiYgZGFzaCA+PSAwICksXG4gICAgICBgRXZlcnkgbGluZURhc2ggc2hvdWxkIGJlIGEgbm9uLW5lZ2F0aXZlIGZpbml0ZSBudW1iZXI6ICR7dGhpcy5saW5lRGFzaH1gICk7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdHlwZW9mIHRoaXMubGluZURhc2hPZmZzZXQgPT09ICdudW1iZXInLCBgbGluZURhc2hPZmZzZXQgc2hvdWxkIGJlIGEgbnVtYmVyOiAke3RoaXMubGluZURhc2hPZmZzZXR9YCApO1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIGlzRmluaXRlKCB0aGlzLmxpbmVEYXNoT2Zmc2V0ICksIGBsaW5lRGFzaE9mZnNldCBzaG91bGQgYmUgYSBmaW5pdGUgbnVtYmVyOiAke3RoaXMubGluZURhc2hPZmZzZXR9YCApO1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIHR5cGVvZiB0aGlzLm1pdGVyTGltaXQgPT09ICdudW1iZXInLCBgbWl0ZXJMaW1pdCBzaG91bGQgYmUgYSBudW1iZXI6ICR7dGhpcy5taXRlckxpbWl0fWAgKTtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBpc0Zpbml0ZSggdGhpcy5taXRlckxpbWl0ICksIGBtaXRlckxpbWl0IHNob3VsZCBiZSBhIGZpbml0ZSBudW1iZXI6ICR7dGhpcy5taXRlckxpbWl0fWAgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBEZXRlcm1pbmVzIG9mIHRoaXMgbGluZVN0eWxlcyBpcyBlcXVhbCB0byB0aGUgb3RoZXIgTGluZVN0eWxlc1xuICAgKi9cbiAgcHVibGljIGVxdWFscyggb3RoZXI6IExpbmVTdHlsZXMgKTogYm9vbGVhbiB7XG4gICAgY29uc3QgdHlwaWNhbCA9IHRoaXMubGluZVdpZHRoID09PSBvdGhlci5saW5lV2lkdGggJiZcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5saW5lQ2FwID09PSBvdGhlci5saW5lQ2FwICYmXG4gICAgICAgICAgICAgICAgICAgIHRoaXMubGluZUpvaW4gPT09IG90aGVyLmxpbmVKb2luICYmXG4gICAgICAgICAgICAgICAgICAgIHRoaXMubWl0ZXJMaW1pdCA9PT0gb3RoZXIubWl0ZXJMaW1pdCAmJlxuICAgICAgICAgICAgICAgICAgICB0aGlzLmxpbmVEYXNoT2Zmc2V0ID09PSBvdGhlci5saW5lRGFzaE9mZnNldDtcbiAgICBpZiAoICF0eXBpY2FsICkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIGlmICggdGhpcy5saW5lRGFzaC5sZW5ndGggPT09IG90aGVyLmxpbmVEYXNoLmxlbmd0aCApIHtcbiAgICAgIGZvciAoIGxldCBpID0gMDsgaSA8IHRoaXMubGluZURhc2gubGVuZ3RoOyBpKysgKSB7XG4gICAgICAgIGlmICggdGhpcy5saW5lRGFzaFsgaSBdICE9PSBvdGhlci5saW5lRGFzaFsgaSBdICkge1xuICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIC8vIGxpbmUgZGFzaGVzIG11c3QgYmUgZGlmZmVyZW50XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyBhIGNvcHkgb2YgdGhpcyBMaW5lU3R5bGVzLlxuICAgKi9cbiAgcHVibGljIGNvcHkoKTogTGluZVN0eWxlcyB7XG4gICAgcmV0dXJuIG5ldyBMaW5lU3R5bGVzKCB7XG4gICAgICBsaW5lV2lkdGg6IHRoaXMubGluZVdpZHRoLFxuICAgICAgbGluZUNhcDogdGhpcy5saW5lQ2FwLFxuICAgICAgbGluZUpvaW46IHRoaXMubGluZUpvaW4sXG4gICAgICBsaW5lRGFzaDogdGhpcy5saW5lRGFzaCxcbiAgICAgIGxpbmVEYXNoT2Zmc2V0OiB0aGlzLmxpbmVEYXNoT2Zmc2V0LFxuICAgICAgbWl0ZXJMaW1pdDogdGhpcy5taXRlckxpbWl0XG4gICAgfSApO1xuICB9XG5cbiAgLyoqXG4gICAqIENyZWF0ZXMgYW4gYXJyYXkgb2YgU2VnbWVudHMgdGhhdCBtYWtlIHVwIGEgbGluZSBqb2luLCB0byB0aGUgbGVmdCBzaWRlLlxuICAgKlxuICAgKiBKb2lucyB0d28gc2VnbWVudHMgdG9nZXRoZXIgb24gdGhlIGxvZ2ljYWwgXCJsZWZ0XCIgc2lkZSwgYXQgJ2NlbnRlcicgKHdoZXJlIHRoZXkgbWVldCksIGFuZCB1bi1ub3JtYWxpemVkIHRhbmdlbnRcbiAgICogdmVjdG9ycyBpbiB0aGUgZGlyZWN0aW9uIG9mIHRoZSBzdHJva2luZy4gVG8gam9pbiBvbiB0aGUgXCJyaWdodFwiIHNpZGUsIHN3aXRjaCB0aGUgdGFuZ2VudCBvcmRlciBhbmQgbmVnYXRlIHRoZW0uXG4gICAqL1xuICBwdWJsaWMgbGVmdEpvaW4oIGNlbnRlcjogVmVjdG9yMiwgZnJvbVRhbmdlbnQ6IFZlY3RvcjIsIHRvVGFuZ2VudDogVmVjdG9yMiApOiBTZWdtZW50W10ge1xuICAgIGZyb21UYW5nZW50ID0gZnJvbVRhbmdlbnQubm9ybWFsaXplZCgpO1xuICAgIHRvVGFuZ2VudCA9IHRvVGFuZ2VudC5ub3JtYWxpemVkKCk7XG5cbiAgICAvLyB3aGVyZSBvdXIgam9pbiBwYXRoIHN0YXJ0cyBhbmQgZW5kc1xuICAgIGNvbnN0IGZyb21Qb2ludCA9IGNlbnRlci5wbHVzKCBmcm9tVGFuZ2VudC5wZXJwZW5kaWN1bGFyLm5lZ2F0ZWQoKS50aW1lcyggdGhpcy5saW5lV2lkdGggLyAyICkgKTtcbiAgICBjb25zdCB0b1BvaW50ID0gY2VudGVyLnBsdXMoIHRvVGFuZ2VudC5wZXJwZW5kaWN1bGFyLm5lZ2F0ZWQoKS50aW1lcyggdGhpcy5saW5lV2lkdGggLyAyICkgKTtcblxuICAgIGNvbnN0IGJldmVsID0gKCBmcm9tUG9pbnQuZXF1YWxzKCB0b1BvaW50ICkgPyBbXSA6IFsgbmV3IExpbmUoIGZyb21Qb2ludCwgdG9Qb2ludCApIF0gKTtcblxuICAgIGxldCBmcm9tQW5nbGU7XG4gICAgbGV0IHRvQW5nbGU7XG4gICAgbGV0IHRoZXRhO1xuXG4gICAgLy8gb25seSBpbnNlcnQgYSBqb2luIG9uIHRoZSBub24tYWN1dGUtYW5nbGUgc2lkZVxuICAgIC8vIGVwc2lsb24gcHJlc2VudCBmb3IgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2tpdGUvaXNzdWVzLzczLCB3aGVyZSB3ZSBkb24ndCB3YW50IHRvIGpvaW4gYmFyZWx5LWV4aXN0aW5nXG4gICAgLy8gam9pbnMuXG4gICAgaWYgKCBmcm9tVGFuZ2VudC5wZXJwZW5kaWN1bGFyLmRvdCggdG9UYW5nZW50ICkgPiAxZS0xMiApIHtcbiAgICAgIHN3aXRjaCggdGhpcy5saW5lSm9pbiApIHtcbiAgICAgICAgY2FzZSAncm91bmQnOlxuICAgICAgICAgIGZyb21BbmdsZSA9IGZyb21UYW5nZW50LmFuZ2xlICsgTWF0aC5QSSAvIDI7XG4gICAgICAgICAgdG9BbmdsZSA9IHRvVGFuZ2VudC5hbmdsZSArIE1hdGguUEkgLyAyO1xuICAgICAgICAgIHJldHVybiBbIG5ldyBBcmMoIGNlbnRlciwgdGhpcy5saW5lV2lkdGggLyAyLCBmcm9tQW5nbGUsIHRvQW5nbGUsIHRydWUgKSBdO1xuICAgICAgICBjYXNlICdtaXRlcic6XG4gICAgICAgICAgdGhldGEgPSBmcm9tVGFuZ2VudC5hbmdsZUJldHdlZW4oIHRvVGFuZ2VudC5uZWdhdGVkKCkgKTtcbiAgICAgICAgICBpZiAoIDEgLyBNYXRoLnNpbiggdGhldGEgLyAyICkgPD0gdGhpcy5taXRlckxpbWl0ICYmIHRoZXRhIDwgTWF0aC5QSSAtIDAuMDAwMDEgKSB7XG4gICAgICAgICAgICAvLyBkcmF3IHRoZSBtaXRlclxuICAgICAgICAgICAgY29uc3QgbWl0ZXJQb2ludCA9IGxpbmVMaW5lSW50ZXJzZWN0aW9uKCBmcm9tUG9pbnQsIGZyb21Qb2ludC5wbHVzKCBmcm9tVGFuZ2VudCApLCB0b1BvaW50LCB0b1BvaW50LnBsdXMoIHRvVGFuZ2VudCApICk7XG4gICAgICAgICAgICBpZiAoIG1pdGVyUG9pbnQgKSB7XG4gICAgICAgICAgICAgIHJldHVybiBbXG4gICAgICAgICAgICAgICAgbmV3IExpbmUoIGZyb21Qb2ludCwgbWl0ZXJQb2ludCApLFxuICAgICAgICAgICAgICAgIG5ldyBMaW5lKCBtaXRlclBvaW50LCB0b1BvaW50IClcbiAgICAgICAgICAgICAgXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICByZXR1cm4gW1xuICAgICAgICAgICAgICAgIG5ldyBMaW5lKCBmcm9tUG9pbnQsIHRvUG9pbnQgKVxuICAgICAgICAgICAgICBdO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIC8vIGFuZ2xlIHRvbyBzdGVlcCwgdXNlIGJldmVsIGluc3RlYWQuIHNhbWUgYXMgYmVsb3csIGJ1dCBjb3BpZWQgZm9yIGxpbnRlclxuICAgICAgICAgICAgcmV0dXJuIGJldmVsO1xuICAgICAgICAgIH1cbiAgICAgICAgY2FzZSAnYmV2ZWwnOlxuICAgICAgICAgIHJldHVybiBiZXZlbDtcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoIGBpbnZhbGlkIGxpbmVKb2luOiAke3RoaXMubGluZUpvaW59YCApO1xuICAgICAgfVxuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIC8vIG5vIGpvaW4gbmVjZXNzYXJ5IGhlcmUgc2luY2Ugd2UgaGF2ZSB0aGUgYWN1dGUgYW5nbGUuIGp1c3Qgc2ltcGxlIGxpbmVUbyBmb3Igbm93IHNvIHRoYXQgdGhlIG5leHQgc2VnbWVudCBzdGFydHMgZnJvbSB0aGUgcmlnaHQgcGxhY2VcbiAgICAgIC8vIFRPRE86IGNhbiB3ZSBwcmV2ZW50IHNlbGYtaW50ZXJzZWN0aW9uIGhlcmU/IGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9raXRlL2lzc3Vlcy83NlxuICAgICAgcmV0dXJuIGJldmVsO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBDcmVhdGVzIGFuIGFycmF5IG9mIFNlZ21lbnRzIHRoYXQgbWFrZSB1cCBhIGxpbmUgam9pbiwgdG8gdGhlIHJpZ2h0IHNpZGUuXG4gICAqXG4gICAqIEpvaW5zIHR3byBzZWdtZW50cyB0b2dldGhlciBvbiB0aGUgbG9naWNhbCBcInJpZ2h0XCIgc2lkZSwgYXQgJ2NlbnRlcicgKHdoZXJlIHRoZXkgbWVldCksIGFuZCBub3JtYWxpemVkIHRhbmdlbnRcbiAgICogdmVjdG9ycyBpbiB0aGUgZGlyZWN0aW9uIG9mIHRoZSBzdHJva2luZy4gVG8gam9pbiBvbiB0aGUgXCJsZWZ0XCIgc2lkZSwgc3dpdGNoIHRoZSB0YW5nZW50IG9yZGVyIGFuZCBuZWdhdGUgdGhlbS5cbiAgICovXG4gIHB1YmxpYyByaWdodEpvaW4oIGNlbnRlcjogVmVjdG9yMiwgZnJvbVRhbmdlbnQ6IFZlY3RvcjIsIHRvVGFuZ2VudDogVmVjdG9yMiApOiBTZWdtZW50W10ge1xuICAgIHJldHVybiB0aGlzLmxlZnRKb2luKCBjZW50ZXIsIHRvVGFuZ2VudC5uZWdhdGVkKCksIGZyb21UYW5nZW50Lm5lZ2F0ZWQoKSApO1xuICB9XG5cbiAgLyoqXG4gICAqIENyZWF0ZXMgYW4gYXJyYXkgb2YgU2VnbWVudHMgdGhhdCBtYWtlIHVwIGEgbGluZSBjYXAgZnJvbSB0aGUgZW5kcG9pbnQgJ2NlbnRlcicgaW4gdGhlIGRpcmVjdGlvbiBvZiB0aGUgdGFuZ2VudFxuICAgKi9cbiAgcHVibGljIGNhcCggY2VudGVyOiBWZWN0b3IyLCB0YW5nZW50OiBWZWN0b3IyICk6IFNlZ21lbnRbXSB7XG4gICAgdGFuZ2VudCA9IHRhbmdlbnQubm9ybWFsaXplZCgpO1xuXG4gICAgY29uc3QgZnJvbVBvaW50ID0gY2VudGVyLnBsdXMoIHRhbmdlbnQucGVycGVuZGljdWxhci50aW1lcyggLXRoaXMubGluZVdpZHRoIC8gMiApICk7XG4gICAgY29uc3QgdG9Qb2ludCA9IGNlbnRlci5wbHVzKCB0YW5nZW50LnBlcnBlbmRpY3VsYXIudGltZXMoIHRoaXMubGluZVdpZHRoIC8gMiApICk7XG5cbiAgICBsZXQgdGFuZ2VudEFuZ2xlO1xuICAgIGxldCB0b0xlZnQ7XG4gICAgbGV0IHRvUmlnaHQ7XG4gICAgbGV0IHRvRnJvbnQ7XG4gICAgbGV0IGxlZnQ7XG4gICAgbGV0IHJpZ2h0O1xuXG4gICAgc3dpdGNoKCB0aGlzLmxpbmVDYXAgKSB7XG4gICAgICBjYXNlICdidXR0JzpcbiAgICAgICAgcmV0dXJuIFsgbmV3IExpbmUoIGZyb21Qb2ludCwgdG9Qb2ludCApIF07XG4gICAgICBjYXNlICdyb3VuZCc6XG4gICAgICAgIHRhbmdlbnRBbmdsZSA9IHRhbmdlbnQuYW5nbGU7XG4gICAgICAgIHJldHVybiBbIG5ldyBBcmMoIGNlbnRlciwgdGhpcy5saW5lV2lkdGggLyAyLCB0YW5nZW50QW5nbGUgKyBNYXRoLlBJIC8gMiwgdGFuZ2VudEFuZ2xlIC0gTWF0aC5QSSAvIDIsIHRydWUgKSBdO1xuICAgICAgY2FzZSAnc3F1YXJlJzpcbiAgICAgICAgdG9MZWZ0ID0gdGFuZ2VudC5wZXJwZW5kaWN1bGFyLm5lZ2F0ZWQoKS50aW1lcyggdGhpcy5saW5lV2lkdGggLyAyICk7XG4gICAgICAgIHRvUmlnaHQgPSB0YW5nZW50LnBlcnBlbmRpY3VsYXIudGltZXMoIHRoaXMubGluZVdpZHRoIC8gMiApO1xuICAgICAgICB0b0Zyb250ID0gdGFuZ2VudC50aW1lcyggdGhpcy5saW5lV2lkdGggLyAyICk7XG5cbiAgICAgICAgbGVmdCA9IGNlbnRlci5wbHVzKCB0b0xlZnQgKS5wbHVzKCB0b0Zyb250ICk7XG4gICAgICAgIHJpZ2h0ID0gY2VudGVyLnBsdXMoIHRvUmlnaHQgKS5wbHVzKCB0b0Zyb250ICk7XG4gICAgICAgIHJldHVybiBbXG4gICAgICAgICAgbmV3IExpbmUoIGZyb21Qb2ludCwgbGVmdCApLFxuICAgICAgICAgIG5ldyBMaW5lKCBsZWZ0LCByaWdodCApLFxuICAgICAgICAgIG5ldyBMaW5lKCByaWdodCwgdG9Qb2ludCApXG4gICAgICAgIF07XG4gICAgICBkZWZhdWx0OlxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoIGBpbnZhbGlkIGxpbmVDYXA6ICR7dGhpcy5saW5lQ2FwfWAgKTtcbiAgICB9XG4gIH1cbn1cblxua2l0ZS5yZWdpc3RlciggJ0xpbmVTdHlsZXMnLCBMaW5lU3R5bGVzICk7XG5cbmV4cG9ydCB7IERFRkFVTFRfT1BUSU9OUyBhcyBMSU5FX1NUWUxFX0RFRkFVTFRfT1BUSU9OUyB9OyJdLCJuYW1lcyI6WyJVdGlscyIsIm1lcmdlIiwiQXJjIiwia2l0ZSIsIkxpbmUiLCJsaW5lTGluZUludGVyc2VjdGlvbiIsIkRFRkFVTFRfT1BUSU9OUyIsImxpbmVXaWR0aCIsImxpbmVDYXAiLCJsaW5lSm9pbiIsImxpbmVEYXNoIiwibGluZURhc2hPZmZzZXQiLCJtaXRlckxpbWl0IiwiTGluZVN0eWxlcyIsImVxdWFscyIsIm90aGVyIiwidHlwaWNhbCIsImxlbmd0aCIsImkiLCJjb3B5IiwibGVmdEpvaW4iLCJjZW50ZXIiLCJmcm9tVGFuZ2VudCIsInRvVGFuZ2VudCIsIm5vcm1hbGl6ZWQiLCJmcm9tUG9pbnQiLCJwbHVzIiwicGVycGVuZGljdWxhciIsIm5lZ2F0ZWQiLCJ0aW1lcyIsInRvUG9pbnQiLCJiZXZlbCIsImZyb21BbmdsZSIsInRvQW5nbGUiLCJ0aGV0YSIsImRvdCIsImFuZ2xlIiwiTWF0aCIsIlBJIiwiYW5nbGVCZXR3ZWVuIiwic2luIiwibWl0ZXJQb2ludCIsIkVycm9yIiwicmlnaHRKb2luIiwiY2FwIiwidGFuZ2VudCIsInRhbmdlbnRBbmdsZSIsInRvTGVmdCIsInRvUmlnaHQiLCJ0b0Zyb250IiwibGVmdCIsInJpZ2h0Iiwib3B0aW9ucyIsImZpbGxlZE9wdGlvbnMiLCJhc3NlcnQiLCJpc0Zpbml0ZSIsIkFycmF5IiwiaXNBcnJheSIsIl8iLCJldmVyeSIsImRhc2giLCJyZWdpc3RlciIsIkxJTkVfU1RZTEVfREVGQVVMVF9PUFRJT05TIl0sIm1hcHBpbmdzIjoiQUFBQSxzREFBc0Q7QUFFdEQ7Ozs7OztDQU1DLEdBRUQsT0FBT0EsV0FBVywyQkFBMkI7QUFFN0MsT0FBT0MsV0FBVyxpQ0FBaUM7QUFDbkQsU0FBU0MsR0FBRyxFQUFFQyxJQUFJLEVBQUVDLElBQUksUUFBaUIsZ0JBQWdCO0FBRXpELFlBQVk7QUFDWixNQUFNQyx1QkFBdUJMLE1BQU1LLG9CQUFvQjtBQUV2RCxNQUFNQyxrQkFBa0I7SUFDdEJDLFdBQVc7SUFDWEMsU0FBUztJQUNUQyxVQUFVO0lBQ1ZDLFVBQVUsRUFBRTtJQUNaQyxnQkFBZ0I7SUFDaEJDLFlBQVk7QUFDZDtBQWFlLElBQUEsQUFBTUMsYUFBTixNQUFNQTtJQXdEbkI7O0dBRUMsR0FDRCxBQUFPQyxPQUFRQyxLQUFpQixFQUFZO1FBQzFDLE1BQU1DLFVBQVUsSUFBSSxDQUFDVCxTQUFTLEtBQUtRLE1BQU1SLFNBQVMsSUFDbEMsSUFBSSxDQUFDQyxPQUFPLEtBQUtPLE1BQU1QLE9BQU8sSUFDOUIsSUFBSSxDQUFDQyxRQUFRLEtBQUtNLE1BQU1OLFFBQVEsSUFDaEMsSUFBSSxDQUFDRyxVQUFVLEtBQUtHLE1BQU1ILFVBQVUsSUFDcEMsSUFBSSxDQUFDRCxjQUFjLEtBQUtJLE1BQU1KLGNBQWM7UUFDNUQsSUFBSyxDQUFDSyxTQUFVO1lBQ2QsT0FBTztRQUNUO1FBRUEsSUFBSyxJQUFJLENBQUNOLFFBQVEs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