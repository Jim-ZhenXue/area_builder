// Copyright 2015-2024, University of Colorado Boulder
/**
 * Spring described by a parametric equation. This implementation is a variation of the cycloid equation.
 * A prolate cycloid (see http://mathworld.wolfram.com/ProlateCycloid.html) comes closest to this implementation,
 * although it doesn't include aspect ratio and delta phase.
 *
 * The origin (0, 0) of this node is at its left center.
 * The front and back of the spring are drawn as separate paths to provide pseudo-3D visual cues.
 * Performance can be improved dramatically by setting options.pathBoundsMethod to 'none', at
 * the expense of layout accuracy. If you use this option, you can only rely on Node.x and Node.y for
 * doing layout.  See Path.boundsMethod for additional details.
 *
 * The "Spring" screen in the scenery-demo application provides an extensive test harness for ParametricSpringNode.
 *
 * @author Martin Veillette (Berea College)
 * @author Chris Malley (PixelZoom, Inc.)
 */ import Multilink from '../../axon/js/Multilink.js';
import NumberProperty from '../../axon/js/NumberProperty.js';
import Range from '../../dot/js/Range.js';
import Vector2 from '../../dot/js/Vector2.js';
import { Shape } from '../../kite/js/imports.js';
import InstanceRegistry from '../../phet-core/js/documentation/InstanceRegistry.js';
import optionize, { combineOptions } from '../../phet-core/js/optionize.js';
import { Circle, LinearGradient, Node, Path } from '../../scenery/js/imports.js';
import sceneryPhet from './sceneryPhet.js';
// constants
const SHOW_ORIGIN = false; // {boolean} draws a red circle at the origin, for layout debugging
let ParametricSpringNode = class ParametricSpringNode extends Node {
    reset() {
        this.loopsProperty.reset();
        this.radiusProperty.reset();
        this.aspectRatioProperty.reset();
        this.pointsPerLoopProperty.reset();
        this.lineWidthProperty.reset();
        this.phaseProperty.reset();
        this.deltaPhaseProperty.reset();
        this.xScaleProperty.reset();
    }
    constructor(providedOptions){
        var _options_tandem, _options_tandem1, _options_tandem2, _options_tandem3, _options_tandem4, _options_tandem5, _options_tandem6, _options_tandem7, _options_tandem8, _options_tandem9, _window_phet_chipper_queryParameters, _window_phet_chipper, _window_phet;
        const options = optionize()({
            // SelfOptions
            frontColor: 'lightGray',
            middleColor: 'gray',
            backColor: 'black',
            leftEndLength: 15,
            rightEndLength: 25,
            loops: 10,
            pointsPerLoop: 40,
            radius: 10,
            aspectRatio: 4,
            lineWidth: 3,
            phase: Math.PI,
            deltaPhase: Math.PI / 2,
            xScale: 2.5,
            boundsMethod: 'accurate' // method used to compute bounds for phet.scenery.Path components, see Path.boundsMethod
        }, providedOptions);
        super();
        this.loopsProperty = new NumberProperty(options.loops, {
            tandem: (_options_tandem = options.tandem) == null ? void 0 : _options_tandem.createTandem('loopsProperty'),
            numberType: 'Integer',
            range: new Range(1, Number.POSITIVE_INFINITY)
        });
        this.radiusProperty = new NumberProperty(options.radius, {
            tandem: (_options_tandem1 = options.tandem) == null ? void 0 : _options_tandem1.createTandem('radiusProperty'),
            range: new Range(0, Number.POSITIVE_INFINITY)
        });
        this.aspectRatioProperty = new NumberProperty(options.aspectRatio, {
            tandem: (_options_tandem2 = options.tandem) == null ? void 0 : _options_tandem2.createTandem('aspectRatioProperty'),
            range: new Range(0, Number.POSITIVE_INFINITY)
        });
        this.pointsPerLoopProperty = new NumberProperty(options.pointsPerLoop, {
            tandem: (_options_tandem3 = options.tandem) == null ? void 0 : _options_tandem3.createTandem('pointsPerLoopProperty'),
            numberType: 'Integer',
            range: new Range(0, Number.POSITIVE_INFINITY)
        });
        this.lineWidthProperty = new NumberProperty(options.lineWidth, {
            tandem: (_options_tandem4 = options.tandem) == null ? void 0 : _options_tandem4.createTandem('lineWidthProperty'),
            range: new Range(0, Number.POSITIVE_INFINITY)
        });
        this.phaseProperty = new NumberProperty(options.phase, {
            tandem: (_options_tandem5 = options.tandem) == null ? void 0 : _options_tandem5.createTandem('phaseProperty'),
            range: new Range(Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY)
        });
        this.deltaPhaseProperty = new NumberProperty(options.deltaPhase, {
            tandem: (_options_tandem6 = options.tandem) == null ? void 0 : _options_tandem6.createTandem('deltaPhaseProperty'),
            range: new Range(Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY)
        });
        this.xScaleProperty = new NumberProperty(options.xScale, {
            tandem: (_options_tandem7 = options.tandem) == null ? void 0 : _options_tandem7.createTandem('xScaleProperty'),
            range: new Range(Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY)
        });
        // Paths for the front (foreground) and back (background) parts of the spring
        const pathOptions = {
            boundsMethod: options.boundsMethod,
            lineCap: 'round',
            lineJoin: 'round'
        };
        const frontPath = new Path(null, combineOptions({
            tandem: (_options_tandem8 = options.tandem) == null ? void 0 : _options_tandem8.createTandem('frontPath')
        }, pathOptions));
        const backPath = new Path(null, combineOptions({
            tandem: (_options_tandem9 = options.tandem) == null ? void 0 : _options_tandem9.createTandem('backPath')
        }, pathOptions));
        // Update the line width
        this.lineWidthProperty.link((lineWidth)=>{
            frontPath.lineWidth = backPath.lineWidth = lineWidth;
        });
        // Mutate these to improve performance
        const springPoints = []; // points in the spring (includes the horizontal ends)
        let frontShape;
        let backShape;
        // Changes to these properties require new points (Vector2) and Shapes, because they change
        // the number of points and/or how the points are allocated to frontShape and backShape.
        Multilink.multilink([
            this.loopsProperty,
            this.pointsPerLoopProperty,
            this.aspectRatioProperty,
            this.phaseProperty,
            this.deltaPhaseProperty
        ], (loops, pointsPerLoop, aspectRatio, phase, deltaPhase)=>{
            // new points and Shapes
            springPoints.length = 0;
            frontShape = new Shape();
            backShape = new Shape();
            // Values of other properties, to improve readability
            const radius = this.radiusProperty.get();
            const xScale = this.xScaleProperty.get();
            // compute the points for the coil
            const coilPoints = []; // {Vector2[]}
            const numberOfCoilPoints = computeNumberOfCoilPoints(loops, pointsPerLoop);
            let index;
            for(index = 0; index < numberOfCoilPoints; index++){
                const coilX = computeCoilX(index, radius, pointsPerLoop, phase, xScale, options.leftEndLength);
                const coilY = computeCoilY(index, radius, pointsPerLoop, phase, deltaPhase, aspectRatio);
                coilPoints.push(new Vector2(coilX, coilY));
            }
            let p; // {Vector2} reusable point, hoisted explicitly
            let wasFront = true; // was the previous point on the front path?
            // Add points to Shapes
            for(index = 0; index < numberOfCoilPoints; index++){
                // is the current point on the front path?
                const isFront = (2 * Math.PI * index / pointsPerLoop + phase + deltaPhase) % (2 * Math.PI) > Math.PI;
                // horizontal line at left end
                if (index === 0) {
                    p = new Vector2(0, coilPoints[0].y);
                    springPoints.push(p);
                    if (isFront) {
                        frontShape.moveToPoint(p);
                    } else {
                        backShape.moveToPoint(p);
                    }
                }
                // coil point
                springPoints.push(coilPoints[index]);
                if (isFront) {
                    // we're in the front
                    if (!wasFront && index !== 0) {
                        // ... and we've just moved to the front
                        frontShape.moveToPoint(coilPoints[index - 1]);
                    }
                    frontShape.lineToPoint(coilPoints[index]);
                } else {
                    // we're in the back
                    if (wasFront && index !== 0) {
                        // ... and we've just moved to the back
                        backShape.moveToPoint(coilPoints[index - 1]);
                    }
                    backShape.lineToPoint(coilPoints[index]);
                }
                wasFront = isFront;
            }
            // horizontal line at right end
            const lastCoilPoint = coilPoints[numberOfCoilPoints - 1];
            p = new Vector2(lastCoilPoint.x + options.rightEndLength, lastCoilPoint.y);
            springPoints.push(p);
            if (wasFront) {
                frontShape.lineToPoint(p);
            } else {
                backShape.lineToPoint(p);
            }
            assert && assert(springPoints.length === coilPoints.length + 2, `missing some points, have ${springPoints.length}, expected ${coilPoints.length}${2}`); // +2 for horizontal ends
            frontPath.shape = frontShape;
            backPath.shape = backShape;
        });
        // Changes to these properties can be accomplished by mutating existing points (Vector2) and Shapes,
        // because the number of points remains the same, as does their allocation to frontShape and backShape.
        Multilink.lazyMultilink([
            this.radiusProperty,
            this.xScaleProperty
        ], (radius, xScale)=>{
            // Values of other properties, to improve readability
            const loops = this.loopsProperty.get();
            const pointsPerLoop = this.pointsPerLoopProperty.get();
            const aspectRatio = this.aspectRatioProperty.get();
            const phase = this.phaseProperty.get();
            const deltaPhase = this.deltaPhaseProperty.get();
            // number of points in the coil
            const numberOfCoilPoints = computeNumberOfCoilPoints(loops, pointsPerLoop);
            assert && assert(numberOfCoilPoints === springPoints.length - 2, `unexpected number of coil points: ${numberOfCoilPoints}, expected ${springPoints.length - 2}`); // -2 for horizontal ends
            // mutate the coil points
            for(let index = 0; index < numberOfCoilPoints; index++){
                const coilX = computeCoilX(index, radius, pointsPerLoop, phase, xScale, options.leftEndLength);
                const coilY = computeCoilY(index, radius, pointsPerLoop, phase, deltaPhase, aspectRatio);
                springPoints[index + 1].setXY(coilX, coilY);
            }
            // mutate horizontal line at left end
            const firstCoilPoint = springPoints[1];
            springPoints[0].setXY(0, firstCoilPoint.y);
            // mutate horizontal line at right end
            const lastCoilPoint = springPoints[springPoints.length - 2];
            springPoints[springPoints.length - 1].setXY(lastCoilPoint.x + options.rightEndLength, lastCoilPoint.y);
            // Tell shapes that their points have changed.
            frontShape.invalidatePoints();
            backShape.invalidatePoints();
        });
        // Update the stroke gradients
        Multilink.multilink([
            this.radiusProperty,
            this.aspectRatioProperty
        ], (radius, aspectRatio)=>{
            const yRadius = radius * aspectRatio;
            frontPath.stroke = new LinearGradient(0, -yRadius, 0, yRadius).addColorStop(0, options.middleColor).addColorStop(0.35, options.frontColor).addColorStop(0.65, options.frontColor).addColorStop(1, options.middleColor);
            backPath.stroke = new LinearGradient(0, -yRadius, 0, yRadius).addColorStop(0, options.middleColor).addColorStop(0.5, options.backColor).addColorStop(1, options.middleColor);
        });
        assert && assert(!options.children, 'ParametricSpringNode sets children');
        options.children = [
            backPath,
            frontPath
        ];
        this.mutate(options);
        if (SHOW_ORIGIN) {
            this.addChild(new Circle(3, {
                fill: 'red'
            }));
        }
        // support for binder documentation, stripped out in builds and only runs when ?binder is specified
        assert && ((_window_phet = window.phet) == null ? void 0 : (_window_phet_chipper = _window_phet.chipper) == null ? void 0 : (_window_phet_chipper_queryParameters = _window_phet_chipper.queryParameters) == null ? void 0 : _window_phet_chipper_queryParameters.binder) && InstanceRegistry.registerDataURL('scenery-phet', 'ParametricSpringNode', this);
    }
};
export { ParametricSpringNode as default };
/**
 * Gets the number of points in the coil part of the spring.
 */ function computeNumberOfCoilPoints(loops, pointsPerLoop) {
    return loops * pointsPerLoop + 1;
}
/**
 * Computes the x coordinate for a point on the coil.
 */ function computeCoilX(index, radius, pointsPerLoop, phase, xScale, leftEndLength) {
    return leftEndLength + radius + radius * Math.cos(2 * Math.PI * index / pointsPerLoop + phase) + xScale * (index / pointsPerLoop) * radius;
}
/**
 * Computes the y coordinate for a point on the coil.
 */ function computeCoilY(index, radius, pointsPerLoop, phase, deltaPhase, aspectRatio) {
    return aspectRatio * radius * Math.cos(2 * Math.PI * index / pointsPerLoop + deltaPhase + phase);
}
sceneryPhet.register('ParametricSpringNode', ParametricSpringNode);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9QYXJhbWV0cmljU3ByaW5nTm9kZS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNS0yMDI0LCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuLyoqXG4gKiBTcHJpbmcgZGVzY3JpYmVkIGJ5IGEgcGFyYW1ldHJpYyBlcXVhdGlvbi4gVGhpcyBpbXBsZW1lbnRhdGlvbiBpcyBhIHZhcmlhdGlvbiBvZiB0aGUgY3ljbG9pZCBlcXVhdGlvbi5cbiAqIEEgcHJvbGF0ZSBjeWNsb2lkIChzZWUgaHR0cDovL21hdGh3b3JsZC53b2xmcmFtLmNvbS9Qcm9sYXRlQ3ljbG9pZC5odG1sKSBjb21lcyBjbG9zZXN0IHRvIHRoaXMgaW1wbGVtZW50YXRpb24sXG4gKiBhbHRob3VnaCBpdCBkb2Vzbid0IGluY2x1ZGUgYXNwZWN0IHJhdGlvIGFuZCBkZWx0YSBwaGFzZS5cbiAqXG4gKiBUaGUgb3JpZ2luICgwLCAwKSBvZiB0aGlzIG5vZGUgaXMgYXQgaXRzIGxlZnQgY2VudGVyLlxuICogVGhlIGZyb250IGFuZCBiYWNrIG9mIHRoZSBzcHJpbmcgYXJlIGRyYXduIGFzIHNlcGFyYXRlIHBhdGhzIHRvIHByb3ZpZGUgcHNldWRvLTNEIHZpc3VhbCBjdWVzLlxuICogUGVyZm9ybWFuY2UgY2FuIGJlIGltcHJvdmVkIGRyYW1hdGljYWxseSBieSBzZXR0aW5nIG9wdGlvbnMucGF0aEJvdW5kc01ldGhvZCB0byAnbm9uZScsIGF0XG4gKiB0aGUgZXhwZW5zZSBvZiBsYXlvdXQgYWNjdXJhY3kuIElmIHlvdSB1c2UgdGhpcyBvcHRpb24sIHlvdSBjYW4gb25seSByZWx5IG9uIE5vZGUueCBhbmQgTm9kZS55IGZvclxuICogZG9pbmcgbGF5b3V0LiAgU2VlIFBhdGguYm91bmRzTWV0aG9kIGZvciBhZGRpdGlvbmFsIGRldGFpbHMuXG4gKlxuICogVGhlIFwiU3ByaW5nXCIgc2NyZWVuIGluIHRoZSBzY2VuZXJ5LWRlbW8gYXBwbGljYXRpb24gcHJvdmlkZXMgYW4gZXh0ZW5zaXZlIHRlc3QgaGFybmVzcyBmb3IgUGFyYW1ldHJpY1NwcmluZ05vZGUuXG4gKlxuICogQGF1dGhvciBNYXJ0aW4gVmVpbGxldHRlIChCZXJlYSBDb2xsZWdlKVxuICogQGF1dGhvciBDaHJpcyBNYWxsZXkgKFBpeGVsWm9vbSwgSW5jLilcbiAqL1xuXG5pbXBvcnQgTXVsdGlsaW5rIGZyb20gJy4uLy4uL2F4b24vanMvTXVsdGlsaW5rLmpzJztcbmltcG9ydCBOdW1iZXJQcm9wZXJ0eSBmcm9tICcuLi8uLi9heG9uL2pzL051bWJlclByb3BlcnR5LmpzJztcbmltcG9ydCBSYW5nZSBmcm9tICcuLi8uLi9kb3QvanMvUmFuZ2UuanMnO1xuaW1wb3J0IFZlY3RvcjIgZnJvbSAnLi4vLi4vZG90L2pzL1ZlY3RvcjIuanMnO1xuaW1wb3J0IHsgU2hhcGUgfSBmcm9tICcuLi8uLi9raXRlL2pzL2ltcG9ydHMuanMnO1xuaW1wb3J0IEluc3RhbmNlUmVnaXN0cnkgZnJvbSAnLi4vLi4vcGhldC1jb3JlL2pzL2RvY3VtZW50YXRpb24vSW5zdGFuY2VSZWdpc3RyeS5qcyc7XG5pbXBvcnQgb3B0aW9uaXplLCB7IGNvbWJpbmVPcHRpb25zIH0gZnJvbSAnLi4vLi4vcGhldC1jb3JlL2pzL29wdGlvbml6ZS5qcyc7XG5pbXBvcnQgUGlja09wdGlvbmFsIGZyb20gJy4uLy4uL3BoZXQtY29yZS9qcy90eXBlcy9QaWNrT3B0aW9uYWwuanMnO1xuaW1wb3J0IHsgQ2lyY2xlLCBMaW5lYXJHcmFkaWVudCwgTm9kZSwgTm9kZU9wdGlvbnMsIFBhdGgsIFBhdGhPcHRpb25zLCBUQ29sb3IgfSBmcm9tICcuLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xuaW1wb3J0IHNjZW5lcnlQaGV0IGZyb20gJy4vc2NlbmVyeVBoZXQuanMnO1xuXG4vLyBjb25zdGFudHNcbmNvbnN0IFNIT1dfT1JJR0lOID0gZmFsc2U7IC8vIHtib29sZWFufSBkcmF3cyBhIHJlZCBjaXJjbGUgYXQgdGhlIG9yaWdpbiwgZm9yIGxheW91dCBkZWJ1Z2dpbmdcblxudHlwZSBTZWxmT3B0aW9ucyA9IHtcblxuICAvLyBjb2xvcnMgdXNlZCBmb3IgdGhlIGdyYWRpZW50IHN0cm9rZXNcbiAgZnJvbnRDb2xvcj86IFRDb2xvcjtcbiAgbWlkZGxlQ29sb3I/OiBUQ29sb3I7IC8vIHRoZSBkb21pbmFudCBjb2xvclxuICBiYWNrQ29sb3I/OiBUQ29sb3I7XG5cbiAgLy8gbGVuZ3RoIG9mIHRoZSBob3Jpem9udGFsIGxpbmUgYWRkZWQgdG8gdGhlIGxlZnQgZW5kIG9mIHRoZSBjb2lsXG4gIGxlZnRFbmRMZW5ndGg/OiBudW1iZXI7XG5cbiAgLy8ge251bWJlcn0gbGVuZ3RoIG9mIHRoZSBob3Jpem9udGFsIGxpbmUgYWRkZWQgdG8gdGhlIHJpZ2h0IGVuZCBvZiB0aGUgY29pbFxuICByaWdodEVuZExlbmd0aD86IG51bWJlcjtcblxuICAvLyBudW1iZXIgb2YgbG9vcHMgaW4gdGhlIGNvaWxcbiAgbG9vcHM/OiBudW1iZXI7XG5cbiAgLy8gbnVtYmVyIG9mIHBvaW50cyB1c2VkIHRvIGFwcHJveGltYXRlIDEgbG9vcCBvZiB0aGUgY29pbFxuICBwb2ludHNQZXJMb29wPzogbnVtYmVyO1xuXG4gIC8vIHJhZGl1cyBvZiBhIGxvb3Agd2l0aCBhc3BlY3QgcmF0aW8gb2YgMToxXG4gIHJhZGl1cz86IG51bWJlcjtcblxuICAvLyB5OnggYXNwZWN0IHJhdGlvIG9mIHRoZSBsb29wIHJhZGl1c1xuICBhc3BlY3RSYXRpbz86IG51bWJlcjtcblxuICAvLyBsaW5lV2lkdGggdXNlZCB0byBzdHJva2UgdGhlIFBhdGhzXG4gIGxpbmVXaWR0aD86IG51bWJlcjtcblxuICAvLyBwaGFzZSBhbmdsZSBvZiB3aGVyZSB0aGUgbG9vcCBzdGFydHMsIHBlcmlvZCBpcyAoMCwyKlBJKSByYWRpYW5zLCBjb3VudGVyY2xvY2t3aXNlXG4gIHBoYXNlPzogbnVtYmVyO1xuXG4gIC8vIHJlc3BvbnNpYmxlIGZvciB0aGUgbGVhbmluZyBvZiB0aGUgY29pbCwgdmFyaWF0aW9uIG9uIGEgTGlzc2pvdWUgY3VydmUsIHBlcmlvZCBpcyAoMCwyKlBJKSByYWRpYW5zXG4gIGRlbHRhUGhhc2U/OiBudW1iZXI7XG5cbiAgLy8gbXVsdGlwbGllciBmb3IgcmFkaXVzIGluIHRoZSB4IGRpbWVuc2lvbiwgbWFrZXMgdGhlIGNvaWwgYXBwZWFyIHRvIGdldCBsb25nZXJcbiAgeFNjYWxlPzogbnVtYmVyO1xuXG59ICYgUGlja09wdGlvbmFsPFBhdGhPcHRpb25zLCAnYm91bmRzTWV0aG9kJz47XG5cbmV4cG9ydCB0eXBlIFBhcmFtZXRyaWNTcHJpbmdOb2RlT3B0aW9ucyA9IFNlbGZPcHRpb25zICYgTm9kZU9wdGlvbnM7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFBhcmFtZXRyaWNTcHJpbmdOb2RlIGV4dGVuZHMgTm9kZSB7XG5cbiAgcHVibGljIHJlYWRvbmx5IGxvb3BzUHJvcGVydHk6IE51bWJlclByb3BlcnR5O1xuICBwdWJsaWMgcmVhZG9ubHkgcmFkaXVzUHJvcGVydHk6IE51bWJlclByb3BlcnR5O1xuICBwdWJsaWMgcmVhZG9ubHkgYXNwZWN0UmF0aW9Qcm9wZXJ0eTogTnVtYmVyUHJvcGVydHk7XG4gIHB1YmxpYyByZWFkb25seSBwb2ludHNQZXJMb29wUHJvcGVydHk6IE51bWJlclByb3BlcnR5O1xuICBwdWJsaWMgcmVhZG9ubHkgbGluZVdpZHRoUHJvcGVydHk6IE51bWJlclByb3BlcnR5O1xuICBwdWJsaWMgcmVhZG9ubHkgcGhhc2VQcm9wZXJ0eTogTnVtYmVyUHJvcGVydHk7XG4gIHB1YmxpYyByZWFkb25seSBkZWx0YVBoYXNlUHJvcGVydHk6IE51bWJlclByb3BlcnR5O1xuICBwdWJsaWMgcmVhZG9ubHkgeFNjYWxlUHJvcGVydHk6IE51bWJlclByb3BlcnR5O1xuXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggcHJvdmlkZWRPcHRpb25zPzogUGFyYW1ldHJpY1NwcmluZ05vZGVPcHRpb25zICkge1xuXG4gICAgY29uc3Qgb3B0aW9ucyA9IG9wdGlvbml6ZTxQYXJhbWV0cmljU3ByaW5nTm9kZU9wdGlvbnMsIFNlbGZPcHRpb25zLCBOb2RlT3B0aW9ucz4oKSgge1xuXG4gICAgICAvLyBTZWxmT3B0aW9uc1xuICAgICAgZnJvbnRDb2xvcjogJ2xpZ2h0R3JheScsXG4gICAgICBtaWRkbGVDb2xvcjogJ2dyYXknLFxuICAgICAgYmFja0NvbG9yOiAnYmxhY2snLFxuICAgICAgbGVmdEVuZExlbmd0aDogMTUsXG4gICAgICByaWdodEVuZExlbmd0aDogMjUsXG4gICAgICBsb29wczogMTAsXG4gICAgICBwb2ludHNQZXJMb29wOiA0MCxcbiAgICAgIHJhZGl1czogMTAsXG4gICAgICBhc3BlY3RSYXRpbzogNCxcbiAgICAgIGxpbmVXaWR0aDogMyxcbiAgICAgIHBoYXNlOiBNYXRoLlBJLFxuICAgICAgZGVsdGFQaGFzZTogTWF0aC5QSSAvIDIsXG4gICAgICB4U2NhbGU6IDIuNSxcbiAgICAgIGJvdW5kc01ldGhvZDogJ2FjY3VyYXRlJyAvLyBtZXRob2QgdXNlZCB0byBjb21wdXRlIGJvdW5kcyBmb3IgcGhldC5zY2VuZXJ5LlBhdGggY29tcG9uZW50cywgc2VlIFBhdGguYm91bmRzTWV0aG9kXG4gICAgfSwgcHJvdmlkZWRPcHRpb25zICk7XG5cbiAgICBzdXBlcigpO1xuXG4gICAgdGhpcy5sb29wc1Byb3BlcnR5ID0gbmV3IE51bWJlclByb3BlcnR5KCBvcHRpb25zLmxvb3BzLCB7XG4gICAgICB0YW5kZW06IG9wdGlvbnMudGFuZGVtPy5jcmVhdGVUYW5kZW0oICdsb29wc1Byb3BlcnR5JyApLFxuICAgICAgbnVtYmVyVHlwZTogJ0ludGVnZXInLFxuICAgICAgcmFuZ2U6IG5ldyBSYW5nZSggMSwgTnVtYmVyLlBPU0lUSVZFX0lORklOSVRZIClcbiAgICB9ICk7XG5cbiAgICB0aGlzLnJhZGl1c1Byb3BlcnR5ID0gbmV3IE51bWJlclByb3BlcnR5KCBvcHRpb25zLnJhZGl1cywge1xuICAgICAgdGFuZGVtOiBvcHRpb25zLnRhbmRlbT8uY3JlYXRlVGFuZGVtKCAncmFkaXVzUHJvcGVydHknICksXG4gICAgICByYW5nZTogbmV3IFJhbmdlKCAwLCBOdW1iZXIuUE9TSVRJVkVfSU5GSU5JVFkgKVxuICAgIH0gKTtcblxuICAgIHRoaXMuYXNwZWN0UmF0aW9Qcm9wZXJ0eSA9IG5ldyBOdW1iZXJQcm9wZXJ0eSggb3B0aW9ucy5hc3BlY3RSYXRpbywge1xuICAgICAgdGFuZGVtOiBvcHRpb25zLnRhbmRlbT8uY3JlYXRlVGFuZGVtKCAnYXNwZWN0UmF0aW9Qcm9wZXJ0eScgKSxcbiAgICAgIHJhbmdlOiBuZXcgUmFuZ2UoIDAsIE51bWJlci5QT1NJVElWRV9JTkZJTklUWSApXG4gICAgfSApO1xuXG4gICAgdGhpcy5wb2ludHNQZXJMb29wUHJvcGVydHkgPSBuZXcgTnVtYmVyUHJvcGVydHkoIG9wdGlvbnMucG9pbnRzUGVyTG9vcCwge1xuICAgICAgdGFuZGVtOiBvcHRpb25zLnRhbmRlbT8uY3JlYXRlVGFuZGVtKCAncG9pbnRzUGVyTG9vcFByb3BlcnR5JyApLFxuICAgICAgbnVtYmVyVHlwZTogJ0ludGVnZXInLFxuICAgICAgcmFuZ2U6IG5ldyBSYW5nZSggMCwgTnVtYmVyLlBPU0lUSVZFX0lORklOSVRZIClcbiAgICB9ICk7XG5cbiAgICB0aGlzLmxpbmVXaWR0aFByb3BlcnR5ID0gbmV3IE51bWJlclByb3BlcnR5KCBvcHRpb25zLmxpbmVXaWR0aCwge1xuICAgICAgdGFuZGVtOiBvcHRpb25zLnRhbmRlbT8uY3JlYXRlVGFuZGVtKCAnbGluZVdpZHRoUHJvcGVydHknICksXG4gICAgICByYW5nZTogbmV3IFJhbmdlKCAwLCBOdW1iZXIuUE9TSVRJVkVfSU5GSU5JVFkgKVxuICAgIH0gKTtcblxuICAgIHRoaXMucGhhc2VQcm9wZXJ0eSA9IG5ldyBOdW1iZXJQcm9wZXJ0eSggb3B0aW9ucy5waGFzZSwge1xuICAgICAgdGFuZGVtOiBvcHRpb25zLnRhbmRlbT8uY3JlYXRlVGFuZGVtKCAncGhhc2VQcm9wZXJ0eScgKSxcbiAgICAgIHJhbmdlOiBuZXcgUmFuZ2UoIE51bWJlci5ORUdBVElWRV9JTkZJTklUWSwgTnVtYmVyLlBPU0lUSVZFX0lORklOSVRZIClcbiAgICB9ICk7XG5cbiAgICB0aGlzLmRlbHRhUGhhc2VQcm9wZXJ0eSA9IG5ldyBOdW1iZXJQcm9wZXJ0eSggb3B0aW9ucy5kZWx0YVBoYXNlLCB7XG4gICAgICB0YW5kZW06IG9wdGlvbnMudGFuZGVtPy5jcmVhdGVUYW5kZW0oICdkZWx0YVBoYXNlUHJvcGVydHknICksXG4gICAgICByYW5nZTogbmV3IFJhbmdlKCBOdW1iZXIuTkVHQVRJVkVfSU5GSU5JVFksIE51bWJlci5QT1NJVElWRV9JTkZJTklUWSApXG4gICAgfSApO1xuXG4gICAgdGhpcy54U2NhbGVQcm9wZXJ0eSA9IG5ldyBOdW1iZXJQcm9wZXJ0eSggb3B0aW9ucy54U2NhbGUsIHtcbiAgICAgIHRhbmRlbTogb3B0aW9ucy50YW5kZW0/LmNyZWF0ZVRhbmRlbSggJ3hTY2FsZVByb3BlcnR5JyApLFxuICAgICAgcmFuZ2U6IG5ldyBSYW5nZSggTnVtYmVyLk5FR0FUSVZFX0lORklOSVRZLCBOdW1iZXIuUE9TSVRJVkVfSU5GSU5JVFkgKVxuICAgIH0gKTtcblxuICAgIC8vIFBhdGhzIGZvciB0aGUgZnJvbnQgKGZvcmVncm91bmQpIGFuZCBiYWNrIChiYWNrZ3JvdW5kKSBwYXJ0cyBvZiB0aGUgc3ByaW5nXG4gICAgY29uc3QgcGF0aE9wdGlvbnM6IFBhdGhPcHRpb25zID0ge1xuICAgICAgYm91bmRzTWV0aG9kOiBvcHRpb25zLmJvdW5kc01ldGhvZCxcbiAgICAgIGxpbmVDYXA6ICdyb3VuZCcsXG4gICAgICBsaW5lSm9pbjogJ3JvdW5kJ1xuICAgIH07XG4gICAgY29uc3QgZnJvbnRQYXRoID0gbmV3IFBhdGgoIG51bGwsIGNvbWJpbmVPcHRpb25zPFBhdGhPcHRpb25zPigge1xuICAgICAgdGFuZGVtOiBvcHRpb25zLnRhbmRlbT8uY3JlYXRlVGFuZGVtKCAnZnJvbnRQYXRoJyApXG4gICAgfSwgcGF0aE9wdGlvbnMgKSApO1xuICAgIGNvbnN0IGJhY2tQYXRoID0gbmV3IFBhdGgoIG51bGwsIGNvbWJpbmVPcHRpb25zPFBhdGhPcHRpb25zPigge1xuICAgICAgdGFuZGVtOiBvcHRpb25zLnRhbmRlbT8uY3JlYXRlVGFuZGVtKCAnYmFja1BhdGgnIClcbiAgICB9LCBwYXRoT3B0aW9ucyApICk7XG5cbiAgICAvLyBVcGRhdGUgdGhlIGxpbmUgd2lkdGhcbiAgICB0aGlzLmxpbmVXaWR0aFByb3BlcnR5LmxpbmsoIGxpbmVXaWR0aCA9PiB7XG4gICAgICBmcm9udFBhdGgubGluZVdpZHRoID0gYmFja1BhdGgubGluZVdpZHRoID0gbGluZVdpZHRoO1xuICAgIH0gKTtcblxuICAgIC8vIE11dGF0ZSB0aGVzZSB0byBpbXByb3ZlIHBlcmZvcm1hbmNlXG4gICAgY29uc3Qgc3ByaW5nUG9pbnRzOiBWZWN0b3IyW10gPSBbXTsgLy8gcG9pbnRzIGluIHRoZSBzcHJpbmcgKGluY2x1ZGVzIHRoZSBob3Jpem9udGFsIGVuZHMpXG4gICAgbGV0IGZyb250U2hhcGU6IFNoYXBlO1xuICAgIGxldCBiYWNrU2hhcGU6IFNoYXBlO1xuXG4gICAgLy8gQ2hhbmdlcyB0byB0aGVzZSBwcm9wZXJ0aWVzIHJlcXVpcmUgbmV3IHBvaW50cyAoVmVjdG9yMikgYW5kIFNoYXBlcywgYmVjYXVzZSB0aGV5IGNoYW5nZVxuICAgIC8vIHRoZSBudW1iZXIgb2YgcG9pbnRzIGFuZC9vciBob3cgdGhlIHBvaW50cyBhcmUgYWxsb2NhdGVkIHRvIGZyb250U2hhcGUgYW5kIGJhY2tTaGFwZS5cbiAgICBNdWx0aWxpbmsubXVsdGlsaW5rKCBbXG4gICAgICAgIHRoaXMubG9vcHNQcm9wZXJ0eSwgdGhpcy5wb2ludHNQZXJMb29wUHJvcGVydHksXG4gICAgICAgIHRoaXMuYXNwZWN0UmF0aW9Qcm9wZXJ0eSwgdGhpcy5waGFzZVByb3BlcnR5LCB0aGlzLmRlbHRhUGhhc2VQcm9wZXJ0eVxuICAgICAgXSxcbiAgICAgICggbG9vcHMsIHBvaW50c1Blckxvb3AsIGFzcGVjdFJhdGlvLCBwaGFzZSwgZGVsdGFQaGFzZSApID0+IHtcblxuICAgICAgICAvLyBuZXcgcG9pbnRzIGFuZCBTaGFwZXNcbiAgICAgICAgc3ByaW5nUG9pbnRzLmxlbmd0aCA9IDA7XG4gICAgICAgIGZyb250U2hhcGUgPSBuZXcgU2hhcGUoKTtcbiAgICAgICAgYmFja1NoYXBlID0gbmV3IFNoYXBlKCk7XG5cbiAgICAgICAgLy8gVmFsdWVzIG9mIG90aGVyIHByb3BlcnRpZXMsIHRvIGltcHJvdmUgcmVhZGFiaWxpdHlcbiAgICAgICAgY29uc3QgcmFkaXVzID0gdGhpcy5yYWRpdXNQcm9wZXJ0eS5nZXQoKTtcbiAgICAgICAgY29uc3QgeFNjYWxlID0gdGhpcy54U2NhbGVQcm9wZXJ0eS5nZXQoKTtcblxuICAgICAgICAvLyBjb21wdXRlIHRoZSBwb2ludHMgZm9yIHRoZSBjb2lsXG4gICAgICAgIGNvbnN0IGNvaWxQb2ludHMgPSBbXTsgLy8ge1ZlY3RvcjJbXX1cbiAgICAgICAgY29uc3QgbnVtYmVyT2ZDb2lsUG9pbnRzID0gY29tcHV0ZU51bWJlck9mQ29pbFBvaW50cyggbG9vcHMsIHBvaW50c1Blckxvb3AgKTtcbiAgICAgICAgbGV0IGluZGV4O1xuICAgICAgICBmb3IgKCBpbmRleCA9IDA7IGluZGV4IDwgbnVtYmVyT2ZDb2lsUG9pbnRzOyBpbmRleCsrICkge1xuICAgICAgICAgIGNvbnN0IGNvaWxYID0gY29tcHV0ZUNvaWxYKCBpbmRleCwgcmFkaXVzLCBwb2ludHNQZXJMb29wLCBwaGFzZSwgeFNjYWxlLCBvcHRpb25zLmxlZnRFbmRMZW5ndGggKTtcbiAgICAgICAgICBjb25zdCBjb2lsWSA9IGNvbXB1dGVDb2lsWSggaW5kZXgsIHJhZGl1cywgcG9pbnRzUGVyTG9vcCwgcGhhc2UsIGRlbHRhUGhhc2UsIGFzcGVjdFJhdGlvICk7XG4gICAgICAgICAgY29pbFBvaW50cy5wdXNoKCBuZXcgVmVjdG9yMiggY29pbFgsIGNvaWxZICkgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCBwOyAvLyB7VmVjdG9yMn0gcmV1c2FibGUgcG9pbnQsIGhvaXN0ZWQgZXhwbGljaXRseVxuICAgICAgICBsZXQgd2FzRnJvbnQgPSB0cnVlOyAvLyB3YXMgdGhlIHByZXZpb3VzIHBvaW50IG9uIHRoZSBmcm9udCBwYXRoP1xuXG4gICAgICAgIC8vIEFkZCBwb2ludHMgdG8gU2hhcGVzXG4gICAgICAgIGZvciAoIGluZGV4ID0gMDsgaW5kZXggPCBudW1iZXJPZkNvaWxQb2ludHM7IGluZGV4KysgKSB7XG5cbiAgICAgICAgICAvLyBpcyB0aGUgY3VycmVudCBwb2ludCBvbiB0aGUgZnJvbnQgcGF0aD9cbiAgICAgICAgICBjb25zdCBpc0Zyb250ID0gKCAoIDIgKiBNYXRoLlBJICogaW5kZXggLyBwb2ludHNQZXJMb29wICsgcGhhc2UgKyBkZWx0YVBoYXNlICkgJSAoIDIgKiBNYXRoLlBJICkgPiBNYXRoLlBJICk7XG5cbiAgICAgICAgICAvLyBob3Jpem9udGFsIGxpbmUgYXQgbGVmdCBlbmRcbiAgICAgICAgICBpZiAoIGluZGV4ID09PSAwICkge1xuICAgICAgICAgICAgcCA9IG5ldyBWZWN0b3IyKCAwLCBjb2lsUG9pbnRzWyAwIF0ueSApO1xuICAgICAgICAgICAgc3ByaW5nUG9pbnRzLnB1c2goIHAgKTtcbiAgICAgICAgICAgIGlmICggaXNGcm9udCApIHtcbiAgICAgICAgICAgICAgZnJvbnRTaGFwZS5tb3ZlVG9Qb2ludCggcCApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgIGJhY2tTaGFwZS5tb3ZlVG9Qb2ludCggcCApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIGNvaWwgcG9pbnRcbiAgICAgICAgICBzcHJpbmdQb2ludHMucHVzaCggY29pbFBvaW50c1sgaW5kZXggXSApO1xuICAgICAgICAgIGlmICggaXNGcm9udCApIHtcbiAgICAgICAgICAgIC8vIHdlJ3JlIGluIHRoZSBmcm9udFxuICAgICAgICAgICAgaWYgKCAhd2FzRnJvbnQgJiYgaW5kZXggIT09IDAgKSB7XG4gICAgICAgICAgICAgIC8vIC4uLiBhbmQgd2UndmUganVzdCBtb3ZlZCB0byB0aGUgZnJvbnRcbiAgICAgICAgICAgICAgZnJvbnRTaGFwZS5tb3ZlVG9Qb2ludCggY29pbFBvaW50c1sgaW5kZXggLSAxIF0gKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGZyb250U2hhcGUubGluZVRvUG9pbnQoIGNvaWxQb2ludHNbIGluZGV4IF0gKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAvLyB3ZSdyZSBpbiB0aGUgYmFja1xuICAgICAgICAgICAgaWYgKCB3YXNGcm9udCAmJiBpbmRleCAhPT0gMCApIHtcbiAgICAgICAgICAgICAgLy8gLi4uIGFuZCB3ZSd2ZSBqdXN0IG1vdmVkIHRvIHRoZSBiYWNrXG4gICAgICAgICAgICAgIGJhY2tTaGFwZS5tb3ZlVG9Qb2ludCggY29pbFBvaW50c1sgaW5kZXggLSAxIF0gKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGJhY2tTaGFwZS5saW5lVG9Qb2ludCggY29pbFBvaW50c1sgaW5kZXggXSApO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIHdhc0Zyb250ID0gaXNGcm9udDtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIGhvcml6b250YWwgbGluZSBhdCByaWdodCBlbmRcbiAgICAgICAgY29uc3QgbGFzdENvaWxQb2ludCA9IGNvaWxQb2ludHNbIG51bWJlck9mQ29pbFBvaW50cyAtIDEgXTtcbiAgICAgICAgcCA9IG5ldyBWZWN0b3IyKCBsYXN0Q29pbFBvaW50LnggKyBvcHRpb25zLnJpZ2h0RW5kTGVuZ3RoLCBsYXN0Q29pbFBvaW50LnkgKTtcbiAgICAgICAgc3ByaW5nUG9pbnRzLnB1c2goIHAgKTtcbiAgICAgICAgaWYgKCB3YXNGcm9udCApIHtcbiAgICAgICAgICBmcm9udFNoYXBlLmxpbmVUb1BvaW50KCBwICk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgYmFja1NoYXBlLmxpbmVUb1BvaW50KCBwICk7XG4gICAgICAgIH1cbiAgICAgICAgYXNzZXJ0ICYmIGFzc2VydCggc3ByaW5nUG9pbnRzLmxlbmd0aCA9PT0gY29pbFBvaW50cy5sZW5ndGggKyAyLFxuICAgICAgICAgIGBtaXNzaW5nIHNvbWUgcG9pbnRzLCBoYXZlICR7c3ByaW5nUG9pbnRzLmxlbmd0aH0sIGV4cGVjdGVkICR7Y29pbFBvaW50cy5sZW5ndGh9JHsyfWAgKTsgLy8gKzIgZm9yIGhvcml6b250YWwgZW5kc1xuXG4gICAgICAgIGZyb250UGF0aC5zaGFwZSA9IGZyb250U2hhcGU7XG4gICAgICAgIGJhY2tQYXRoLnNoYXBlID0gYmFja1NoYXBlO1xuICAgICAgfSApO1xuXG4gICAgLy8gQ2hhbmdlcyB0byB0aGVzZSBwcm9wZXJ0aWVzIGNhbiBiZSBhY2NvbXBsaXNoZWQgYnkgbXV0YXRpbmcgZXhpc3RpbmcgcG9pbnRzIChWZWN0b3IyKSBhbmQgU2hhcGVzLFxuICAgIC8vIGJlY2F1c2UgdGhlIG51bWJlciBvZiBwb2ludHMgcmVtYWlucyB0aGUgc2FtZSwgYXMgZG9lcyB0aGVpciBhbGxvY2F0aW9uIHRvIGZyb250U2hhcGUgYW5kIGJhY2tTaGFwZS5cbiAgICBNdWx0aWxpbmsubGF6eU11bHRpbGluayhcbiAgICAgIFsgdGhpcy5yYWRpdXNQcm9wZXJ0eSwgdGhpcy54U2NhbGVQcm9wZXJ0eSBdLFxuICAgICAgKCByYWRpdXMsIHhTY2FsZSApID0+IHtcblxuICAgICAgICAvLyBWYWx1ZXMgb2Ygb3RoZXIgcHJvcGVydGllcywgdG8gaW1wcm92ZSByZWFkYWJpbGl0eVxuICAgICAgICBjb25zdCBsb29wcyA9IHRoaXMubG9vcHNQcm9wZXJ0eS5nZXQoKTtcbiAgICAgICAgY29uc3QgcG9pbnRzUGVyTG9vcCA9IHRoaXMucG9pbnRzUGVyTG9vcFByb3BlcnR5LmdldCgpO1xuICAgICAgICBjb25zdCBhc3BlY3RSYXRpbyA9IHRoaXMuYXNwZWN0UmF0aW9Qcm9wZXJ0eS5nZXQoKTtcbiAgICAgICAgY29uc3QgcGhhc2UgPSB0aGlzLnBoYXNlUHJvcGVydHkuZ2V0KCk7XG4gICAgICAgIGNvbnN0IGRlbHRhUGhhc2UgPSB0aGlzLmRlbHRhUGhhc2VQcm9wZXJ0eS5nZXQoKTtcblxuICAgICAgICAvLyBudW1iZXIgb2YgcG9pbnRzIGluIHRoZSBjb2lsXG4gICAgICAgIGNvbnN0IG51bWJlck9mQ29pbFBvaW50cyA9IGNvbXB1dGVOdW1iZXJPZkNvaWxQb2ludHMoIGxvb3BzLCBwb2ludHNQZXJMb29wICk7XG4gICAgICAgIGFzc2VydCAmJiBhc3NlcnQoIG51bWJlck9mQ29pbFBvaW50cyA9PT0gc3ByaW5nUG9pbnRzLmxlbmd0aCAtIDIsXG4gICAgICAgICAgYHVuZXhwZWN0ZWQgbnVtYmVyIG9mIGNvaWwgcG9pbnRzOiAke251bWJlck9mQ29pbFBvaW50c30sIGV4cGVjdGVkICR7c3ByaW5nUG9pbnRzLmxlbmd0aCAtIDJ9YCApOyAvLyAtMiBmb3IgaG9yaXpvbnRhbCBlbmRzXG5cbiAgICAgICAgLy8gbXV0YXRlIHRoZSBjb2lsIHBvaW50c1xuICAgICAgICBmb3IgKCBsZXQgaW5kZXggPSAwOyBpbmRleCA8IG51bWJlck9mQ29pbFBvaW50czsgaW5kZXgrKyApIHtcbiAgICAgICAgICBjb25zdCBjb2lsWCA9IGNvbXB1dGVDb2lsWCggaW5kZXgsIHJhZGl1cywgcG9pbnRzUGVyTG9vcCwgcGhhc2UsIHhTY2FsZSwgb3B0aW9ucy5sZWZ0RW5kTGVuZ3RoICk7XG4gICAgICAgICAgY29uc3QgY29pbFkgPSBjb21wdXRlQ29pbFkoIGluZGV4LCByYWRpdXMsIHBvaW50c1Blckxvb3AsIHBoYXNlLCBkZWx0YVBoYXNlLCBhc3BlY3RSYXRpbyApO1xuICAgICAgICAgIHNwcmluZ1BvaW50c1sgaW5kZXggKyAxIF0uc2V0WFkoIGNvaWxYLCBjb2lsWSApO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gbXV0YXRlIGhvcml6b250YWwgbGluZSBhdCBsZWZ0IGVuZFxuICAgICAgICBjb25zdCBmaXJzdENvaWxQb2ludCA9IHNwcmluZ1BvaW50c1sgMSBdO1xuICAgICAgICBzcHJpbmdQb2ludHNbIDAgXS5zZXRYWSggMCwgZmlyc3RDb2lsUG9pbnQueSApO1xuXG4gICAgICAgIC8vIG11dGF0ZSBob3Jpem9udGFsIGxpbmUgYXQgcmlnaHQgZW5kXG4gICAgICAgIGNvbnN0IGxhc3RDb2lsUG9pbnQgPSBzcHJpbmdQb2ludHNbIHNwcmluZ1BvaW50cy5sZW5ndGggLSAyIF07XG4gICAgICAgIHNwcmluZ1BvaW50c1sgc3ByaW5nUG9pbnRzLmxlbmd0aCAtIDEgXS5zZXRYWSggbGFzdENvaWxQb2ludC54ICsgb3B0aW9ucy5yaWdodEVuZExlbmd0aCwgbGFzdENvaWxQb2ludC55ICk7XG5cbiAgICAgICAgLy8gVGVsbCBzaGFwZXMgdGhhdCB0aGVpciBwb2ludHMgaGF2ZSBjaGFuZ2VkLlxuICAgICAgICBmcm9udFNoYXBlLmludmFsaWRhdGVQb2ludHMoKTtcbiAgICAgICAgYmFja1NoYXBlLmludmFsaWRhdGVQb2ludHMoKTtcbiAgICAgIH0gKTtcblxuICAgIC8vIFVwZGF0ZSB0aGUgc3Ryb2tlIGdyYWRpZW50c1xuICAgIE11bHRpbGluay5tdWx0aWxpbmsoXG4gICAgICBbIHRoaXMucmFkaXVzUHJvcGVydHksIHRoaXMuYXNwZWN0UmF0aW9Qcm9wZXJ0eSBdLFxuICAgICAgKCByYWRpdXMsIGFzcGVjdFJhdGlvICkgPT4ge1xuXG4gICAgICAgIGNvbnN0IHlSYWRpdXMgPSByYWRpdXMgKiBhc3BlY3RSYXRpbztcblxuICAgICAgICBmcm9udFBhdGguc3Ryb2tlID0gbmV3IExpbmVhckdyYWRpZW50KCAwLCAteVJhZGl1cywgMCwgeVJhZGl1cyApXG4gICAgICAgICAgLmFkZENvbG9yU3RvcCggMCwgb3B0aW9ucy5taWRkbGVDb2xvciApXG4gICAgICAgICAgLmFkZENvbG9yU3RvcCggMC4zNSwgb3B0aW9ucy5mcm9udENvbG9yIClcbiAgICAgICAgICAuYWRkQ29sb3JTdG9wKCAwLjY1LCBvcHRpb25zLmZyb250Q29sb3IgKVxuICAgICAgICAgIC5hZGRDb2xvclN0b3AoIDEsIG9wdGlvbnMubWlkZGxlQ29sb3IgKTtcblxuICAgICAgICBiYWNrUGF0aC5zdHJva2UgPSBuZXcgTGluZWFyR3JhZGllbnQoIDAsIC15UmFkaXVzLCAwLCB5UmFkaXVzIClcbiAgICAgICAgICAuYWRkQ29sb3JTdG9wKCAwLCBvcHRpb25zLm1pZGRsZUNvbG9yIClcbiAgICAgICAgICAuYWRkQ29sb3JTdG9wKCAwLjUsIG9wdGlvbnMuYmFja0NvbG9yIClcbiAgICAgICAgICAuYWRkQ29sb3JTdG9wKCAxLCBvcHRpb25zLm1pZGRsZUNvbG9yICk7XG4gICAgICB9ICk7XG5cbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCAhb3B0aW9ucy5jaGlsZHJlbiwgJ1BhcmFtZXRyaWNTcHJpbmdOb2RlIHNldHMgY2hpbGRyZW4nICk7XG4gICAgb3B0aW9ucy5jaGlsZHJlbiA9IFsgYmFja1BhdGgsIGZyb250UGF0aCBdO1xuXG4gICAgdGhpcy5tdXRhdGUoIG9wdGlvbnMgKTtcblxuICAgIGlmICggU0hPV19PUklHSU4gKSB7XG4gICAgICB0aGlzLmFkZENoaWxkKCBuZXcgQ2lyY2xlKCAzLCB7IGZpbGw6ICdyZWQnIH0gKSApO1xuICAgIH1cblxuICAgIC8vIHN1cHBvcnQgZm9yIGJpbmRlciBkb2N1bWVudGF0aW9uLCBzdHJpcHBlZCBvdXQgaW4gYnVpbGRzIGFuZCBvbmx5IHJ1bnMgd2hlbiA/YmluZGVyIGlzIHNwZWNpZmllZFxuICAgIGFzc2VydCAmJiB3aW5kb3cucGhldD8uY2hpcHBlcj8ucXVlcnlQYXJhbWV0ZXJzPy5iaW5kZXIgJiYgSW5zdGFuY2VSZWdpc3RyeS5yZWdpc3RlckRhdGFVUkwoICdzY2VuZXJ5LXBoZXQnLCAnUGFyYW1ldHJpY1NwcmluZ05vZGUnLCB0aGlzICk7XG4gIH1cblxuICBwdWJsaWMgcmVzZXQoKTogdm9pZCB7XG4gICAgdGhpcy5sb29wc1Byb3BlcnR5LnJlc2V0KCk7XG4gICAgdGhpcy5yYWRpdXNQcm9wZXJ0eS5yZXNldCgpO1xuICAgIHRoaXMuYXNwZWN0UmF0aW9Qcm9wZXJ0eS5yZXNldCgpO1xuICAgIHRoaXMucG9pbnRzUGVyTG9vcFByb3BlcnR5LnJlc2V0KCk7XG4gICAgdGhpcy5saW5lV2lkdGhQcm9wZXJ0eS5yZXNldCgpO1xuICAgIHRoaXMucGhhc2VQcm9wZXJ0eS5yZXNldCgpO1xuICAgIHRoaXMuZGVsdGFQaGFzZVByb3BlcnR5LnJlc2V0KCk7XG4gICAgdGhpcy54U2NhbGVQcm9wZXJ0eS5yZXNldCgpO1xuICB9XG59XG5cbi8qKlxuICogR2V0cyB0aGUgbnVtYmVyIG9mIHBvaW50cyBpbiB0aGUgY29pbCBwYXJ0IG9mIHRoZSBzcHJpbmcuXG4gKi9cbmZ1bmN0aW9uIGNvbXB1dGVOdW1iZXJPZkNvaWxQb2ludHMoIGxvb3BzOiBudW1iZXIsIHBvaW50c1Blckxvb3A6IG51bWJlciApOiBudW1iZXIge1xuICByZXR1cm4gbG9vcHMgKiBwb2ludHNQZXJMb29wICsgMTtcbn1cblxuLyoqXG4gKiBDb21wdXRlcyB0aGUgeCBjb29yZGluYXRlIGZvciBhIHBvaW50IG9uIHRoZSBjb2lsLlxuICovXG5mdW5jdGlvbiBjb21wdXRlQ29pbFgoIGluZGV4OiBudW1iZXIsIHJhZGl1czogbnVtYmVyLCBwb2ludHNQZXJMb29wOiBudW1iZXIsIHBoYXNlOiBudW1iZXIsIHhTY2FsZTogbnVtYmVyLFxuICAgICAgICAgICAgICAgICAgICAgICBsZWZ0RW5kTGVuZ3RoOiBudW1iZXIgKTogbnVtYmVyIHtcbiAgcmV0dXJuICggbGVmdEVuZExlbmd0aCArIHJhZGl1cyApICsgcmFkaXVzICogTWF0aC5jb3MoIDIgKiBNYXRoLlBJICogaW5kZXggLyBwb2ludHNQZXJMb29wICsgcGhhc2UgKSArIHhTY2FsZSAqICggaW5kZXggLyBwb2ludHNQZXJMb29wICkgKiByYWRpdXM7XG59XG5cbi8qKlxuICogQ29tcHV0ZXMgdGhlIHkgY29vcmRpbmF0ZSBmb3IgYSBwb2ludCBvbiB0aGUgY29pbC5cbiAqL1xuZnVuY3Rpb24gY29tcHV0ZUNvaWxZKCBpbmRleDogbnVtYmVyLCByYWRpdXM6IG51bWJlciwgcG9pbnRzUGVyTG9vcDogbnVtYmVyLCBwaGFzZTogbnVtYmVyLCBkZWx0YVBoYXNlOiBudW1iZXIsXG4gICAgICAgICAgICAgICAgICAgICAgIGFzcGVjdFJhdGlvOiBudW1iZXIgKTogbnVtYmVyIHtcbiAgcmV0dXJuIGFzcGVjdFJhdGlvICogcmFkaXVzICogTWF0aC5jb3MoIDIgKiBNYXRoLlBJICogaW5kZXggLyBwb2ludHNQZXJMb29wICsgZGVsdGFQaGFzZSArIHBoYXNlICk7XG59XG5cbnNjZW5lcnlQaGV0LnJlZ2lzdGVyKCAnUGFyYW1ldHJpY1NwcmluZ05vZGUnLCBQYXJhbWV0cmljU3ByaW5nTm9kZSApOyJdLCJuYW1lcyI6WyJNdWx0aWxpbmsiLCJOdW1iZXJQcm9wZXJ0eSIsIlJhbmdlIiwiVmVjdG9yMiIsIlNoYXBlIiwiSW5zdGFuY2VSZWdpc3RyeSIsIm9wdGlvbml6ZSIsImNvbWJpbmVPcHRpb25zIiwiQ2lyY2xlIiwiTGluZWFyR3JhZGllbnQiLCJOb2RlIiwiUGF0aCIsInNjZW5lcnlQaGV0IiwiU0hPV19PUklHSU4iLCJQYXJhbWV0cmljU3ByaW5nTm9kZSIsInJlc2V0IiwibG9vcHNQcm9wZXJ0eSIsInJhZGl1c1Byb3BlcnR5IiwiYXNwZWN0UmF0aW9Qcm9wZXJ0eSIsInBvaW50c1Blckxvb3BQcm9wZXJ0eSIsImxpbmVXaWR0aFByb3BlcnR5IiwicGhhc2VQcm9wZXJ0eSIsImRlbHRhUGhhc2VQcm9wZXJ0eSIsInhTY2FsZVByb3BlcnR5IiwicHJvdmlkZWRPcHRpb25zIiwib3B0aW9ucyIsIndpbmRvdyIsImZyb250Q29sb3IiLCJtaWRkbGVDb2xvciIsImJhY2tDb2xvciIsImxlZnRFbmRMZW5ndGgiLCJyaWdodEVuZExlbmd0aCIsImxvb3BzIiwicG9pbnRzUGVyTG9vcCIsInJhZGl1cyIsImFzcGVjdFJhdGlvIiwibGluZVdpZHRoIiwicGhhc2UiLCJNYXRoIiwiUEkiLCJkZWx0YVBoYXNlIiwieFNjYWxlIiwiYm91bmRzTWV0aG9kIiwidGFuZGVtIiwiY3JlYXRlVGFuZGVtIiwibnVtYmVyVHlwZSIsInJhbmdlIiwiTnVtYmVyIiwiUE9TSVRJVkVfSU5GSU5JVFkiLCJORUdBVElWRV9JTkZJTklUWSIsInBhdGhPcHRpb25zIiwibGluZUNhcCIsImxpbmVKb2luIiwiZnJvbnRQYXRoIiwiYmFja1BhdGgiLCJsaW5rIiwic3ByaW5nUG9pbnRzIiwiZnJvbnRTaGFwZSIsImJhY2tTaGFwZSIsIm11bHRpbGluayIsImxlbmd0aCIsImdldCIsImNvaWxQb2ludHMiLCJudW1iZXJPZkNvaWxQb2ludHMiLCJjb21wdXRlTnVtYmVyT2ZDb2lsUG9pbnRzIiwiaW5kZXgiLCJjb2lsWCIsImNvbXB1dGVDb2lsWCIsImNvaWxZIiwiY29tcHV0ZUNvaWxZIiwicHVzaCIsInAiLCJ3YXNGcm9udCIsImlzRnJvbnQiLCJ5IiwibW92ZVRvUG9pbnQiLCJsaW5lVG9Qb2ludCIsImxhc3RDb2lsUG9pbnQiLCJ4IiwiYXNzZXJ0Iiwic2hhcGUiLCJsYXp5TXVsdGlsaW5rIiwic2V0WFkiLCJmaXJzdENvaWxQb2ludCIsImludmFsaWRhdGVQb2ludHMiLCJ5UmFkaXVzIiwic3Ryb2tlIiwiYWRkQ29sb3JTdG9wIiwiY2hpbGRyZW4iLCJtdXRhdGUiLCJhZGRDaGlsZCIsImZpbGwiLCJwaGV0IiwiY2hpcHBlciIsInF1ZXJ5UGFyYW1ldGVycyIsImJpbmRlciIsInJlZ2lzdGVyRGF0YVVSTCIsImNvcyIsInJlZ2lzdGVyIl0sIm1hcHBpbmdzIjoiQUFBQSxzREFBc0Q7QUFFdEQ7Ozs7Ozs7Ozs7Ozs7OztDQWVDLEdBRUQsT0FBT0EsZUFBZSw2QkFBNkI7QUFDbkQsT0FBT0Msb0JBQW9CLGtDQUFrQztB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