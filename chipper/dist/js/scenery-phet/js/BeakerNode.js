// Copyright 2018-2024, University of Colorado Boulder
/**
 * BeakerNode draws a pseudo-3D cylindrical beaker, with optional tick marks, containing a solution.
 * Based on the value of solutionLevelProperty, it fills the beaker with solution from the bottom up.
 * The Beaker and solution use flat style shading and highlights to provide pseudo-3D dimension.
 *
 * This node expects the provided solutionLevelProperty that maps between 0 (empty) and 1 (full).
 *
 * @author Marla Schulz <marla.schulz@colorado.edu>
 */ import { Shape } from '../../kite/js/imports.js';
import optionize from '../../phet-core/js/optionize.js';
import { Node, PaintColorProperty, Path } from '../../scenery/js/imports.js';
import sceneryPhet from './sceneryPhet.js';
import SceneryPhetColors from './SceneryPhetColors.js';
export const SOLUTION_VISIBLE_THRESHOLD = 0.001;
let BeakerNode = class BeakerNode extends Node {
    dispose() {
        this.disposeBeakerNode();
        super.dispose();
    }
    setTicksVisible(visible) {
        this.ticks.visible = visible;
    }
    constructor(solutionLevelProperty, providedOptions){
        assert && assert(solutionLevelProperty.range.min >= 0 && solutionLevelProperty.range.max <= 1, 'SolutionLevelProperty must be a NumberProperty with min >= 0 and max <= 1');
        // Generates highlight and shading when a custom solutionFill is provided.
        const originalGlareFill = (providedOptions == null ? void 0 : providedOptions.solutionFill) !== undefined ? providedOptions.solutionFill : SceneryPhetColors.solutionShineFillProperty;
        const originalShadowFill = (providedOptions == null ? void 0 : providedOptions.solutionFill) !== undefined ? providedOptions.solutionFill : SceneryPhetColors.solutionShadowFillProperty;
        // Keep our solution glare/shadow up-to-date if solutionFill is a Property<Color> and it changes
        const solutionGlareFillProperty = new PaintColorProperty(originalGlareFill, {
            luminanceFactor: 0.5
        });
        const solutionShadowFillProperty = new PaintColorProperty(originalShadowFill, {
            luminanceFactor: -0.2
        });
        const options = optionize()({
            emptyBeakerFill: SceneryPhetColors.emptyBeakerFillProperty,
            solutionFill: SceneryPhetColors.solutionFillProperty,
            solutionGlareFill: solutionGlareFillProperty,
            solutionShadowFill: solutionShadowFillProperty,
            beakerGlareFill: SceneryPhetColors.beakerShineFillProperty,
            beakerStroke: SceneryPhetColors.beakerStroke,
            lineWidth: 1,
            beakerHeight: 100,
            beakerWidth: 60,
            yRadiusOfEnds: 12,
            ticksVisible: false,
            numberOfTicks: 3,
            majorTickMarkModulus: 2,
            tickStroke: SceneryPhetColors.tickStroke
        }, providedOptions);
        const xRadius = options.beakerWidth / 2;
        const centerTop = -options.beakerHeight / 2;
        const centerBottom = options.beakerHeight / 2;
        // Beaker structure and glare shapes
        const beakerGlareShape = new Shape().moveTo(-xRadius * 0.6, centerTop * 0.6).verticalLineTo(centerBottom * 0.85).lineTo(-xRadius * 0.5, centerBottom * 0.9).verticalLineTo(centerTop * 0.55).close();
        const beakerFrontShape = new Shape().ellipticalArc(0, centerBottom, xRadius, options.yRadiusOfEnds, 0, 0, Math.PI, false).ellipticalArc(0, centerTop, xRadius, options.yRadiusOfEnds, 0, Math.PI, 0, true).close();
        const beakerBackTopShape = new Shape().ellipticalArc(0, centerTop, xRadius, options.yRadiusOfEnds, 0, Math.PI, 0, false);
        const beakerBackShape = new Shape().ellipticalArc(0, centerTop, xRadius, options.yRadiusOfEnds, 0, Math.PI, 0, false).ellipticalArc(0, centerBottom, xRadius, options.yRadiusOfEnds, 0, 0, Math.PI, true).close();
        const beakerBottomShape = new Shape().ellipticalArc(0, centerBottom, xRadius, options.yRadiusOfEnds, 0, 0, 2 * Math.PI, false);
        // Water fill and shading paths
        const solutionSide = new Path(null, {
            fill: options.solutionFill,
            pickable: false
        });
        const solutionTop = new Path(null, {
            fill: options.solutionFill,
            pickable: false
        });
        const solutionFrontEdge = new Path(null, {
            fill: options.solutionShadowFill,
            pickable: false
        });
        const solutionBackEdge = new Path(null, {
            fill: options.solutionShadowFill,
            opacity: 0.6,
            pickable: false
        });
        const solutionGlare = new Path(null, {
            fill: options.solutionGlareFill
        });
        // Beaker structure and glare paths
        const beakerFront = new Path(beakerFrontShape, {
            stroke: options.beakerStroke,
            lineWidth: options.lineWidth
        });
        const beakerBack = new Path(beakerBackShape, {
            stroke: options.beakerStroke,
            lineWidth: options.lineWidth,
            fill: options.emptyBeakerFill
        });
        const beakerBackTop = new Path(beakerBackTopShape, {
            stroke: options.beakerStroke,
            lineWidth: options.lineWidth
        });
        beakerBack.setScaleMagnitude(-1, 1);
        const beakerBottom = new Path(beakerBottomShape, {
            stroke: options.beakerStroke,
            fill: options.emptyBeakerFill,
            pickable: false
        });
        const beakerGlare = new Path(beakerGlareShape.getOffsetShape(2), {
            fill: options.beakerGlareFill
        });
        const tickDivision = 1 / (options.numberOfTicks + 1);
        const ticksShape = new Shape();
        let y = centerBottom;
        for(let i = 1; i <= options.numberOfTicks; i++){
            y -= options.beakerHeight * tickDivision;
            const centralAngle = Math.PI * 0.83;
            const offsetAngle = Math.PI * (i % options.majorTickMarkModulus !== 0 ? 0.07 : 0.1);
            ticksShape.ellipticalArc(0, y, xRadius, options.yRadiusOfEnds, 0, centralAngle + offsetAngle, centralAngle - offsetAngle, true).newSubpath();
        }
        const ticks = new Path(ticksShape, {
            stroke: options.tickStroke,
            lineWidth: 1.5,
            pickable: false,
            visible: options.ticksVisible
        });
        // solution level adjustment listener
        const solutionLevelListener = (solutionLevel)=>{
            const centerLiquidY = centerBottom - options.beakerHeight * solutionLevel;
            const solutionTopShape = new Shape().ellipticalArc(0, centerLiquidY, xRadius, options.yRadiusOfEnds, 0, 0, Math.PI * 2, false).close();
            const solutionSideShape = new Shape().ellipticalArc(0, centerLiquidY, xRadius, options.yRadiusOfEnds, 0, Math.PI, 0, true).ellipticalArc(0, centerBottom, xRadius, options.yRadiusOfEnds, 0, 0, Math.PI, false).close();
            const solutionFrontEdgeShape = new Shape().ellipticalArc(0, centerLiquidY + 1, xRadius, options.yRadiusOfEnds + 2, 0, Math.PI, 0, true).ellipticalArc(0, centerLiquidY, xRadius, options.yRadiusOfEnds, 0, 0, Math.PI, false);
            const solutionBackEdgeShape = new Shape().ellipticalArc(0, centerBottom - 1, xRadius, options.yRadiusOfEnds + 4, Math.PI, Math.PI, 0, true).ellipticalArc(0, centerBottom, xRadius, options.yRadiusOfEnds, Math.PI, 0, Math.PI, false);
            const solutionCrescentShape = new Shape().ellipticalArc(xRadius * 0.2, centerLiquidY, options.yRadiusOfEnds * 0.75, xRadius * 0.4, Math.PI * 1.5, Math.PI, 0, true).ellipticalArc(xRadius * 0.2, centerLiquidY, options.yRadiusOfEnds * 0.75, xRadius * 0.6, Math.PI * 1.5, 0, Math.PI, false);
            solutionTop.shape = solutionTopShape;
            solutionSide.shape = solutionSideShape;
            solutionFrontEdge.shape = solutionFrontEdgeShape;
            solutionBackEdge.shape = solutionBackEdgeShape;
            solutionGlare.shape = solutionCrescentShape;
            // Set solution visibility based on solution level
            if (solutionLevel < SOLUTION_VISIBLE_THRESHOLD) {
                solutionTop.visible = false;
                solutionSide.visible = false;
                solutionFrontEdge.visible = false;
                solutionBackEdge.visible = false;
                solutionGlare.visible = false;
            } else {
                // Prevents back edge from appearing when solution level empty.  Only compute this when the solutionBackEdge
                // will be shown, because when computed for very small solutionLevel it triggers a kite corner case problem
                // see https://github.com/phetsims/kite/issues/98
                solutionBackEdge.clipArea = Shape.union([
                    solutionTopShape,
                    solutionSideShape
                ]);
                solutionTop.visible = true;
                solutionSide.visible = true;
                solutionFrontEdge.visible = true;
                solutionBackEdge.visible = true;
                solutionGlare.visible = true;
            }
        };
        solutionLevelProperty.link(solutionLevelListener);
        // Prevents front edge from dipping below beaker boundary when dragged all the way down.
        solutionFrontEdge.clipArea = Shape.union([
            beakerFrontShape,
            beakerBottomShape
        ]);
        options.children = [
            beakerBack,
            beakerBottom,
            solutionSide,
            solutionBackEdge,
            solutionTop,
            solutionGlare,
            solutionFrontEdge,
            beakerBackTop,
            beakerFront,
            ticks,
            beakerGlare
        ];
        super(options);
        this.ticks = ticks;
        this.disposeBeakerNode = ()=>{
            solutionGlareFillProperty.dispose();
            solutionShadowFillProperty.dispose();
            solutionLevelProperty.unlink(solutionLevelListener);
        };
    }
};
export { BeakerNode as default };
sceneryPhet.register('BeakerNode', BeakerNode);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9CZWFrZXJOb2RlLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE4LTIwMjQsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIEJlYWtlck5vZGUgZHJhd3MgYSBwc2V1ZG8tM0QgY3lsaW5kcmljYWwgYmVha2VyLCB3aXRoIG9wdGlvbmFsIHRpY2sgbWFya3MsIGNvbnRhaW5pbmcgYSBzb2x1dGlvbi5cbiAqIEJhc2VkIG9uIHRoZSB2YWx1ZSBvZiBzb2x1dGlvbkxldmVsUHJvcGVydHksIGl0IGZpbGxzIHRoZSBiZWFrZXIgd2l0aCBzb2x1dGlvbiBmcm9tIHRoZSBib3R0b20gdXAuXG4gKiBUaGUgQmVha2VyIGFuZCBzb2x1dGlvbiB1c2UgZmxhdCBzdHlsZSBzaGFkaW5nIGFuZCBoaWdobGlnaHRzIHRvIHByb3ZpZGUgcHNldWRvLTNEIGRpbWVuc2lvbi5cbiAqXG4gKiBUaGlzIG5vZGUgZXhwZWN0cyB0aGUgcHJvdmlkZWQgc29sdXRpb25MZXZlbFByb3BlcnR5IHRoYXQgbWFwcyBiZXR3ZWVuIDAgKGVtcHR5KSBhbmQgMSAoZnVsbCkuXG4gKlxuICogQGF1dGhvciBNYXJsYSBTY2h1bHogPG1hcmxhLnNjaHVsekBjb2xvcmFkby5lZHU+XG4gKi9cblxuaW1wb3J0IFRSYW5nZWRQcm9wZXJ0eSBmcm9tICcuLi8uLi9heG9uL2pzL1RSYW5nZWRQcm9wZXJ0eS5qcyc7XG5pbXBvcnQgeyBTaGFwZSB9IGZyb20gJy4uLy4uL2tpdGUvanMvaW1wb3J0cy5qcyc7XG5pbXBvcnQgb3B0aW9uaXplIGZyb20gJy4uLy4uL3BoZXQtY29yZS9qcy9vcHRpb25pemUuanMnO1xuaW1wb3J0IFN0cmljdE9taXQgZnJvbSAnLi4vLi4vcGhldC1jb3JlL2pzL3R5cGVzL1N0cmljdE9taXQuanMnO1xuaW1wb3J0IHsgTm9kZSwgTm9kZU9wdGlvbnMsIFBhaW50Q29sb3JQcm9wZXJ0eSwgUGF0aCwgVENvbG9yLCBUUGFpbnQgfSBmcm9tICcuLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xuaW1wb3J0IHNjZW5lcnlQaGV0IGZyb20gJy4vc2NlbmVyeVBoZXQuanMnO1xuaW1wb3J0IFNjZW5lcnlQaGV0Q29sb3JzIGZyb20gJy4vU2NlbmVyeVBoZXRDb2xvcnMuanMnO1xuXG50eXBlIFNlbGZPcHRpb25zID0ge1xuICBlbXB0eUJlYWtlckZpbGw/OiBUUGFpbnQ7XG4gIHNvbHV0aW9uRmlsbD86IFRDb2xvcjtcbiAgc29sdXRpb25TaGFkb3dGaWxsPzogVFBhaW50O1xuICBzb2x1dGlvbkdsYXJlRmlsbD86IFRQYWludDtcbiAgYmVha2VyR2xhcmVGaWxsPzogVFBhaW50O1xuICBiZWFrZXJIZWlnaHQ/OiBudW1iZXI7XG4gIGJlYWtlcldpZHRoPzogbnVtYmVyO1xuICB5UmFkaXVzT2ZFbmRzPzogbnVtYmVyOyAvLyByYWRpdXMgb2YgdGhlIGVsbGlwc2VzIHVzZWQgZm9yIHRoZSBlbmRzLCB0byBwcm92aWRlIDNEIHBlcnNwZWN0aXZlXG4gIHRpY2tzVmlzaWJsZT86IGJvb2xlYW47XG4gIHRpY2tTdHJva2U/OiBUUGFpbnQ7XG4gIGJlYWtlclN0cm9rZT86IFRQYWludDtcbiAgbGluZVdpZHRoPzogbnVtYmVyO1xuICBudW1iZXJPZlRpY2tzPzogbnVtYmVyOyAvLyBUaGUgbnVtYmVyIG9mIHRpY2sgbWFya3Mgc2hvd24gb24gYmVha2VyLlxuICBtYWpvclRpY2tNYXJrTW9kdWx1cz86IG51bWJlcjsgLy8gbW9kdWx1cyBudW1iZXIgc3VjaCB0aGF0IGV2ZXJ5IE50aCB0aWNrIG1hcmsgaXMgYSBtYWpvciB0aWNrIG1hcmsuIFVzZSB3aXRoIG9wdGlvbnMubnVtYmVyT2ZUaWNrc1xufTtcbmV4cG9ydCB0eXBlIEJlYWtlck5vZGVPcHRpb25zID0gU2VsZk9wdGlvbnMgJiBTdHJpY3RPbWl0PE5vZGVPcHRpb25zLCAnY2hpbGRyZW4nPjtcbmV4cG9ydCBjb25zdCBTT0xVVElPTl9WSVNJQkxFX1RIUkVTSE9MRCA9IDAuMDAxO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBCZWFrZXJOb2RlIGV4dGVuZHMgTm9kZSB7XG5cbiAgcHJpdmF0ZSByZWFkb25seSB0aWNrczogUGF0aDtcbiAgcHJpdmF0ZSByZWFkb25seSBkaXNwb3NlQmVha2VyTm9kZTogKCkgPT4gdm9pZDtcblxuICBwdWJsaWMgY29uc3RydWN0b3IoIHNvbHV0aW9uTGV2ZWxQcm9wZXJ0eTogVFJhbmdlZFByb3BlcnR5LCBwcm92aWRlZE9wdGlvbnM/OiBCZWFrZXJOb2RlT3B0aW9ucyApIHtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBzb2x1dGlvbkxldmVsUHJvcGVydHkucmFuZ2UubWluID49IDAgJiYgc29sdXRpb25MZXZlbFByb3BlcnR5LnJhbmdlLm1heCA8PSAxLFxuICAgICAgJ1NvbHV0aW9uTGV2ZWxQcm9wZXJ0eSBtdXN0IGJlIGEgTnVtYmVyUHJvcGVydHkgd2l0aCBtaW4gPj0gMCBhbmQgbWF4IDw9IDEnICk7XG5cbiAgICAvLyBHZW5lcmF0ZXMgaGlnaGxpZ2h0IGFuZCBzaGFkaW5nIHdoZW4gYSBjdXN0b20gc29sdXRpb25GaWxsIGlzIHByb3ZpZGVkLlxuICAgIGNvbnN0IG9yaWdpbmFsR2xhcmVGaWxsID0gcHJvdmlkZWRPcHRpb25zPy5zb2x1dGlvbkZpbGwgIT09IHVuZGVmaW5lZFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPyBwcm92aWRlZE9wdGlvbnMuc29sdXRpb25GaWxsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICA6IFNjZW5lcnlQaGV0Q29sb3JzLnNvbHV0aW9uU2hpbmVGaWxsUHJvcGVydHk7XG4gICAgY29uc3Qgb3JpZ2luYWxTaGFkb3dGaWxsID0gcHJvdmlkZWRPcHRpb25zPy5zb2x1dGlvbkZpbGwgIT09IHVuZGVmaW5lZFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgID8gcHJvdmlkZWRPcHRpb25zLnNvbHV0aW9uRmlsbFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDogU2NlbmVyeVBoZXRDb2xvcnMuc29sdXRpb25TaGFkb3dGaWxsUHJvcGVydHk7XG5cbiAgICAvLyBLZWVwIG91ciBzb2x1dGlvbiBnbGFyZS9zaGFkb3cgdXAtdG8tZGF0ZSBpZiBzb2x1dGlvbkZpbGwgaXMgYSBQcm9wZXJ0eTxDb2xvcj4gYW5kIGl0IGNoYW5nZXNcbiAgICBjb25zdCBzb2x1dGlvbkdsYXJlRmlsbFByb3BlcnR5ID0gbmV3IFBhaW50Q29sb3JQcm9wZXJ0eSggb3JpZ2luYWxHbGFyZUZpbGwsIHsgbHVtaW5hbmNlRmFjdG9yOiAwLjUgfSApO1xuICAgIGNvbnN0IHNvbHV0aW9uU2hhZG93RmlsbFByb3BlcnR5ID0gbmV3IFBhaW50Q29sb3JQcm9wZXJ0eSggb3JpZ2luYWxTaGFkb3dGaWxsLCB7IGx1bWluYW5jZUZhY3RvcjogLTAuMiB9ICk7XG5cbiAgICBjb25zdCBvcHRpb25zID0gb3B0aW9uaXplPEJlYWtlck5vZGVPcHRpb25zLCBTZWxmT3B0aW9ucywgTm9kZU9wdGlvbnM+KCkoIHtcbiAgICAgIGVtcHR5QmVha2VyRmlsbDogU2NlbmVyeVBoZXRDb2xvcnMuZW1wdHlCZWFrZXJGaWxsUHJvcGVydHksXG4gICAgICBzb2x1dGlvbkZpbGw6IFNjZW5lcnlQaGV0Q29sb3JzLnNvbHV0aW9uRmlsbFByb3BlcnR5LFxuICAgICAgc29sdXRpb25HbGFyZUZpbGw6IHNvbHV0aW9uR2xhcmVGaWxsUHJvcGVydHksXG4gICAgICBzb2x1dGlvblNoYWRvd0ZpbGw6IHNvbHV0aW9uU2hhZG93RmlsbFByb3BlcnR5LFxuICAgICAgYmVha2VyR2xhcmVGaWxsOiBTY2VuZXJ5UGhldENvbG9ycy5iZWFrZXJTaGluZUZpbGxQcm9wZXJ0eSxcbiAgICAgIGJlYWtlclN0cm9rZTogU2NlbmVyeVBoZXRDb2xvcnMuYmVha2VyU3Ryb2tlLFxuICAgICAgbGluZVdpZHRoOiAxLFxuICAgICAgYmVha2VySGVpZ2h0OiAxMDAsXG4gICAgICBiZWFrZXJXaWR0aDogNjAsXG4gICAgICB5UmFkaXVzT2ZFbmRzOiAxMixcbiAgICAgIHRpY2tzVmlzaWJsZTogZmFsc2UsXG4gICAgICBudW1iZXJPZlRpY2tzOiAzLFxuICAgICAgbWFqb3JUaWNrTWFya01vZHVsdXM6IDIsIC8vIERlZmF1bHQgdG8gZXZlcnkgb3RoZXIgdGljayBtYXJrIGlzIG1ham9yLlxuICAgICAgdGlja1N0cm9rZTogU2NlbmVyeVBoZXRDb2xvcnMudGlja1N0cm9rZVxuICAgIH0sIHByb3ZpZGVkT3B0aW9ucyApO1xuXG4gICAgY29uc3QgeFJhZGl1cyA9IG9wdGlvbnMuYmVha2VyV2lkdGggLyAyO1xuXG4gICAgY29uc3QgY2VudGVyVG9wID0gLW9wdGlvbnMuYmVha2VySGVpZ2h0IC8gMjtcbiAgICBjb25zdCBjZW50ZXJCb3R0b20gPSBvcHRpb25zLmJlYWtlckhlaWdodCAvIDI7XG5cbiAgICAvLyBCZWFrZXIgc3RydWN0dXJlIGFuZCBnbGFyZSBzaGFwZXNcbiAgICBjb25zdCBiZWFrZXJHbGFyZVNoYXBlID0gbmV3IFNoYXBlKClcbiAgICAgIC5tb3ZlVG8oIC14UmFkaXVzICogMC42LCBjZW50ZXJUb3AgKiAwLjYgKVxuICAgICAgLnZlcnRpY2FsTGluZVRvKCBjZW50ZXJCb3R0b20gKiAwLjg1IClcbiAgICAgIC5saW5lVG8oIC14UmFkaXVzICogMC41LCBjZW50ZXJCb3R0b20gKiAwLjkgKVxuICAgICAgLnZlcnRpY2FsTGluZVRvKCBjZW50ZXJUb3AgKiAwLjU1IClcbiAgICAgIC5jbG9zZSgpO1xuXG4gICAgY29uc3QgYmVha2VyRnJvbnRTaGFwZSA9IG5ldyBTaGFwZSgpXG4gICAgICAuZWxsaXB0aWNhbEFyYyggMCwgY2VudGVyQm90dG9tLCB4UmFkaXVzLCBvcHRpb25zLnlSYWRpdXNPZkVuZHMsIDAsIDAsIE1hdGguUEksIGZhbHNlIClcbiAgICAgIC5lbGxpcHRpY2FsQXJjKCAwLCBjZW50ZXJUb3AsIHhSYWRpdXMsIG9wdGlvbnMueVJhZGl1c09mRW5kcywgMCwgTWF0aC5QSSwgMCwgdHJ1ZSApXG4gICAgICAuY2xvc2UoKTtcblxuICAgIGNvbnN0IGJlYWtlckJhY2tUb3BTaGFwZSA9IG5ldyBTaGFwZSgpXG4gICAgICAuZWxsaXB0aWNhbEFyYyggMCwgY2VudGVyVG9wLCB4UmFkaXVzLCBvcHRpb25zLnlSYWRpdXNPZkVuZHMsIDAsIE1hdGguUEksIDAsIGZhbHNlICk7XG5cbiAgICBjb25zdCBiZWFrZXJCYWNrU2hhcGUgPSBuZXcgU2hhcGUoKVxuICAgICAgLmVsbGlwdGljYWxBcmMoIDAsIGNlbnRlclRvcCwgeFJhZGl1cywgb3B0aW9ucy55UmFkaXVzT2ZFbmRzLCAwLCBNYXRoLlBJLCAwLCBmYWxzZSApXG4gICAgICAuZWxsaXB0aWNhbEFyYyggMCwgY2VudGVyQm90dG9tLCB4UmFkaXVzLCBvcHRpb25zLnlSYWRpdXNPZkVuZHMsIDAsIDAsIE1hdGguUEksIHRydWUgKVxuICAgICAgLmNsb3NlKCk7XG5cbiAgICBjb25zdCBiZWFrZXJCb3R0b21TaGFwZSA9IG5ldyBTaGFwZSgpXG4gICAgICAuZWxsaXB0aWNhbEFyYyggMCwgY2VudGVyQm90dG9tLCB4UmFkaXVzLCBvcHRpb25zLnlSYWRpdXNPZkVuZHMsIDAsIDAsIDIgKiBNYXRoLlBJLCBmYWxzZSApO1xuXG4gICAgLy8gV2F0ZXIgZmlsbCBhbmQgc2hhZGluZyBwYXRoc1xuICAgIGNvbnN0IHNvbHV0aW9uU2lkZSA9IG5ldyBQYXRoKCBudWxsLCB7XG4gICAgICBmaWxsOiBvcHRpb25zLnNvbHV0aW9uRmlsbCxcbiAgICAgIHBpY2thYmxlOiBmYWxzZVxuICAgIH0gKTtcbiAgICBjb25zdCBzb2x1dGlvblRvcCA9IG5ldyBQYXRoKCBudWxsLCB7XG4gICAgICBmaWxsOiBvcHRpb25zLnNvbHV0aW9uRmlsbCxcbiAgICAgIHBpY2thYmxlOiBmYWxzZVxuICAgIH0gKTtcbiAgICBjb25zdCBzb2x1dGlvbkZyb250RWRnZSA9IG5ldyBQYXRoKCBudWxsLCB7XG4gICAgICBmaWxsOiBvcHRpb25zLnNvbHV0aW9uU2hhZG93RmlsbCxcbiAgICAgIHBpY2thYmxlOiBmYWxzZVxuICAgIH0gKTtcbiAgICBjb25zdCBzb2x1dGlvbkJhY2tFZGdlID0gbmV3IFBhdGgoIG51bGwsIHtcbiAgICAgIGZpbGw6IG9wdGlvbnMuc29sdXRpb25TaGFkb3dGaWxsLFxuICAgICAgb3BhY2l0eTogMC42LFxuICAgICAgcGlja2FibGU6IGZhbHNlXG4gICAgfSApO1xuICAgIGNvbnN0IHNvbHV0aW9uR2xhcmUgPSBuZXcgUGF0aCggbnVsbCwge1xuICAgICAgZmlsbDogb3B0aW9ucy5zb2x1dGlvbkdsYXJlRmlsbFxuICAgIH0gKTtcblxuICAgIC8vIEJlYWtlciBzdHJ1Y3R1cmUgYW5kIGdsYXJlIHBhdGhzXG4gICAgY29uc3QgYmVha2VyRnJvbnQgPSBuZXcgUGF0aCggYmVha2VyRnJvbnRTaGFwZSwge1xuICAgICAgc3Ryb2tlOiBvcHRpb25zLmJlYWtlclN0cm9rZSxcbiAgICAgIGxpbmVXaWR0aDogb3B0aW9ucy5saW5lV2lkdGhcbiAgICB9ICk7XG5cbiAgICBjb25zdCBiZWFrZXJCYWNrID0gbmV3IFBhdGgoIGJlYWtlckJhY2tTaGFwZSwge1xuICAgICAgc3Ryb2tlOiBvcHRpb25zLmJlYWtlclN0cm9rZSxcbiAgICAgIGxpbmVXaWR0aDogb3B0aW9ucy5saW5lV2lkdGgsXG4gICAgICBmaWxsOiBvcHRpb25zLmVtcHR5QmVha2VyRmlsbFxuICAgIH0gKTtcblxuICAgIGNvbnN0IGJlYWtlckJhY2tUb3AgPSBuZXcgUGF0aCggYmVha2VyQmFja1RvcFNoYXBlLCB7XG4gICAgICBzdHJva2U6IG9wdGlvbnMuYmVha2VyU3Ryb2tlLFxuICAgICAgbGluZVdpZHRoOiBvcHRpb25zLmxpbmVXaWR0aFxuICAgIH0gKTtcblxuICAgIGJlYWtlckJhY2suc2V0U2NhbGVNYWduaXR1ZGUoIC0xLCAxICk7XG5cbiAgICBjb25zdCBiZWFrZXJCb3R0b20gPSBuZXcgUGF0aCggYmVha2VyQm90dG9tU2hhcGUsIHtcbiAgICAgIHN0cm9rZTogb3B0aW9ucy5iZWFrZXJTdHJva2UsXG4gICAgICBmaWxsOiBvcHRpb25zLmVtcHR5QmVha2VyRmlsbCxcbiAgICAgIHBpY2thYmxlOiBmYWxzZVxuICAgIH0gKTtcblxuICAgIGNvbnN0IGJlYWtlckdsYXJlID0gbmV3IFBhdGgoIGJlYWtlckdsYXJlU2hhcGUuZ2V0T2Zmc2V0U2hhcGUoIDIgKSwge1xuICAgICAgZmlsbDogb3B0aW9ucy5iZWFrZXJHbGFyZUZpbGxcbiAgICB9ICk7XG5cbiAgICBjb25zdCB0aWNrRGl2aXNpb24gPSAxIC8gKCBvcHRpb25zLm51bWJlck9mVGlja3MgKyAxICk7XG4gICAgY29uc3QgdGlja3NTaGFwZSA9IG5ldyBTaGFwZSgpO1xuICAgIGxldCB5ID0gY2VudGVyQm90dG9tO1xuICAgIGZvciAoIGxldCBpID0gMTsgaSA8PSBvcHRpb25zLm51bWJlck9mVGlja3M7IGkrKyApIHtcbiAgICAgIHkgLT0gb3B0aW9ucy5iZWFrZXJIZWlnaHQgKiB0aWNrRGl2aXNpb247XG4gICAgICBjb25zdCBjZW50cmFsQW5nbGUgPSBNYXRoLlBJICogMC44MztcbiAgICAgIGNvbnN0IG9mZnNldEFuZ2xlID0gTWF0aC5QSSAqICggaSAlIG9wdGlvbnMubWFqb3JUaWNrTWFya01vZHVsdXMgIT09IDAgPyAwLjA3IDogMC4xICk7XG4gICAgICB0aWNrc1NoYXBlLmVsbGlwdGljYWxBcmMoIDAsIHksIHhSYWRpdXMsIG9wdGlvbnMueVJhZGl1c09mRW5kcywgMCwgY2VudHJhbEFuZ2xlICsgb2Zmc2V0QW5nbGUsIGNlbnRyYWxBbmdsZSAtIG9mZnNldEFuZ2xlLCB0cnVlICkubmV3U3VicGF0aCgpO1xuICAgIH1cblxuICAgIGNvbnN0IHRpY2tzID0gbmV3IFBhdGgoIHRpY2tzU2hhcGUsIHtcbiAgICAgIHN0cm9rZTogb3B0aW9ucy50aWNrU3Ryb2tlLFxuICAgICAgbGluZVdpZHRoOiAxLjUsXG4gICAgICBwaWNrYWJsZTogZmFsc2UsXG4gICAgICB2aXNpYmxlOiBvcHRpb25zLnRpY2tzVmlzaWJsZVxuICAgIH0gKTtcblxuICAgIC8vIHNvbHV0aW9uIGxldmVsIGFkanVzdG1lbnQgbGlzdGVuZXJcbiAgICBjb25zdCBzb2x1dGlvbkxldmVsTGlzdGVuZXIgPSAoIHNvbHV0aW9uTGV2ZWw6IG51bWJlciApID0+IHtcbiAgICAgIGNvbnN0IGNlbnRlckxpcXVpZFkgPSBjZW50ZXJCb3R0b20gLSBvcHRpb25zLmJlYWtlckhlaWdodCAqIHNvbHV0aW9uTGV2ZWw7XG4gICAgICBjb25zdCBzb2x1dGlvblRvcFNoYXBlID0gbmV3IFNoYXBlKClcbiAgICAgICAgLmVsbGlwdGljYWxBcmMoIDAsIGNlbnRlckxpcXVpZFksIHhSYWRpdXMsIG9wdGlvbnMueVJhZGl1c09mRW5kcywgMCwgMCwgTWF0aC5QSSAqIDIsIGZhbHNlIClcbiAgICAgICAgLmNsb3NlKCk7XG4gICAgICBjb25zdCBzb2x1dGlvblNpZGVTaGFwZSA9IG5ldyBTaGFwZSgpXG4gICAgICAgIC5lbGxpcHRpY2FsQXJjKCAwLCBjZW50ZXJMaXF1aWRZLCB4UmFkaXVzLCBvcHRpb25zLnlSYWRpdXNPZkVuZHMsIDAsIE1hdGguUEksIDAsIHRydWUgKVxuICAgICAgICAuZWxsaXB0aWNhbEFyYyggMCwgY2VudGVyQm90dG9tLCB4UmFkaXVzLCBvcHRpb25zLnlSYWRpdXNPZkVuZHMsIDAsIDAsIE1hdGguUEksIGZhbHNlIClcbiAgICAgICAgLmNsb3NlKCk7XG4gICAgICBjb25zdCBzb2x1dGlvbkZyb250RWRnZVNoYXBlID0gbmV3IFNoYXBlKClcbiAgICAgICAgLmVsbGlwdGljYWxBcmMoIDAsIGNlbnRlckxpcXVpZFkgKyAxLCB4UmFkaXVzLCBvcHRpb25zLnlSYWRpdXNPZkVuZHMgKyAyLCAwLCBNYXRoLlBJLCAwLCB0cnVlIClcbiAgICAgICAgLmVsbGlwdGljYWxBcmMoIDAsIGNlbnRlckxpcXVpZFksIHhSYWRpdXMsIG9wdGlvbnMueVJhZGl1c09mRW5kcywgMCwgMCwgTWF0aC5QSSwgZmFsc2UgKTtcbiAgICAgIGNvbnN0IHNvbHV0aW9uQmFja0VkZ2VTaGFwZSA9IG5ldyBTaGFwZSgpXG4gICAgICAgIC5lbGxpcHRpY2FsQXJjKCAwLCBjZW50ZXJCb3R0b20gLSAxLCB4UmFkaXVzLCBvcHRpb25zLnlSYWRpdXNPZkVuZHMgKyA0LCBNYXRoLlBJLCBNYXRoLlBJLCAwLCB0cnVlIClcbiAgICAgICAgLmVsbGlwdGljYWxBcmMoIDAsIGNlbnRlckJvdHRvbSwgeFJhZGl1cywgb3B0aW9ucy55UmFkaXVzT2ZFbmRzLCBNYXRoLlBJLCAwLCBNYXRoLlBJLCBmYWxzZSApO1xuICAgICAgY29uc3Qgc29sdXRpb25DcmVzY2VudFNoYXBlID0gbmV3IFNoYXBlKClcbiAgICAgICAgLmVsbGlwdGljYWxBcmMoIHhSYWRpdXMgKiAwLjIsIGNlbnRlckxpcXVpZFksIG9wdGlvbnMueVJhZGl1c09mRW5kcyAqIDAuNzUsIHhSYWRpdXMgKiAwLjQsIE1hdGguUEkgKiAxLjUsIE1hdGguUEksIDAsIHRydWUgKVxuICAgICAgICAuZWxsaXB0aWNhbEFyYyggeFJhZGl1cyAqIDAuMiwgY2VudGVyTGlxdWlkWSwgb3B0aW9ucy55UmFkaXVzT2ZFbmRzICogMC43NSwgeFJhZGl1cyAqIDAuNiwgTWF0aC5QSSAqIDEuNSwgMCwgTWF0aC5QSSwgZmFsc2UgKTtcblxuICAgICAgc29sdXRpb25Ub3Auc2hhcGUgPSBzb2x1dGlvblRvcFNoYXBlO1xuICAgICAgc29sdXRpb25TaWRlLnNoYXBlID0gc29sdXRpb25TaWRlU2hhcGU7XG4gICAgICBzb2x1dGlvbkZyb250RWRnZS5zaGFwZSA9IHNvbHV0aW9uRnJvbnRFZGdlU2hhcGU7XG4gICAgICBzb2x1dGlvbkJhY2tFZGdlLnNoYXBlID0gc29sdXRpb25CYWNrRWRnZVNoYXBlO1xuICAgICAgc29sdXRpb25HbGFyZS5zaGFwZSA9IHNvbHV0aW9uQ3Jlc2NlbnRTaGFwZTtcblxuICAgICAgLy8gU2V0IHNvbHV0aW9uIHZpc2liaWxpdHkgYmFzZWQgb24gc29sdXRpb24gbGV2ZWxcbiAgICAgIGlmICggc29sdXRpb25MZXZlbCA8IFNPTFVUSU9OX1ZJU0lCTEVfVEhSRVNIT0xEICkge1xuICAgICAgICBzb2x1dGlvblRvcC52aXNpYmxlID0gZmFsc2U7XG4gICAgICAgIHNvbHV0aW9uU2lkZS52aXNpYmxlID0gZmFsc2U7XG4gICAgICAgIHNvbHV0aW9uRnJvbnRFZGdlLnZpc2libGUgPSBmYWxzZTtcbiAgICAgICAgc29sdXRpb25CYWNrRWRnZS52aXNpYmxlID0gZmFsc2U7XG4gICAgICAgIHNvbHV0aW9uR2xhcmUudmlzaWJsZSA9IGZhbHNlO1xuICAgICAgfVxuICAgICAgZWxzZSB7XG5cbiAgICAgICAgLy8gUHJldmVudHMgYmFjayBlZGdlIGZyb20gYXBwZWFyaW5nIHdoZW4gc29sdXRpb24gbGV2ZWwgZW1wdHkuICBPbmx5IGNvbXB1dGUgdGhpcyB3aGVuIHRoZSBzb2x1dGlvbkJhY2tFZGdlXG4gICAgICAgIC8vIHdpbGwgYmUgc2hvd24sIGJlY2F1c2Ugd2hlbiBjb21wdXRlZCBmb3IgdmVyeSBzbWFsbCBzb2x1dGlvbkxldmVsIGl0IHRyaWdnZXJzIGEga2l0ZSBjb3JuZXIgY2FzZSBwcm9ibGVtXG4gICAgICAgIC8vIHNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMva2l0ZS9pc3N1ZXMvOThcbiAgICAgICAgc29sdXRpb25CYWNrRWRnZS5jbGlwQXJlYSA9IFNoYXBlLnVuaW9uKCBbIHNvbHV0aW9uVG9wU2hhcGUsIHNvbHV0aW9uU2lkZVNoYXBlIF0gKTtcblxuICAgICAgICBzb2x1dGlvblRvcC52aXNpYmxlID0gdHJ1ZTtcbiAgICAgICAgc29sdXRpb25TaWRlLnZpc2libGUgPSB0cnVlO1xuICAgICAgICBzb2x1dGlvbkZyb250RWRnZS52aXNpYmxlID0gdHJ1ZTtcbiAgICAgICAgc29sdXRpb25CYWNrRWRnZS52aXNpYmxlID0gdHJ1ZTtcbiAgICAgICAgc29sdXRpb25HbGFyZS52aXNpYmxlID0gdHJ1ZTtcbiAgICAgIH1cbiAgICB9O1xuICAgIHNvbHV0aW9uTGV2ZWxQcm9wZXJ0eS5saW5rKCBzb2x1dGlvbkxldmVsTGlzdGVuZXIgKTtcblxuICAgIC8vIFByZXZlbnRzIGZyb250IGVkZ2UgZnJvbSBkaXBwaW5nIGJlbG93IGJlYWtlciBib3VuZGFyeSB3aGVuIGRyYWdnZWQgYWxsIHRoZSB3YXkgZG93bi5cbiAgICBzb2x1dGlvbkZyb250RWRnZS5jbGlwQXJlYSA9IFNoYXBlLnVuaW9uKCBbIGJlYWtlckZyb250U2hhcGUsIGJlYWtlckJvdHRvbVNoYXBlIF0gKTtcblxuICAgIG9wdGlvbnMuY2hpbGRyZW4gPSBbXG4gICAgICBiZWFrZXJCYWNrLFxuICAgICAgYmVha2VyQm90dG9tLFxuICAgICAgc29sdXRpb25TaWRlLFxuICAgICAgc29sdXRpb25CYWNrRWRnZSxcbiAgICAgIHNvbHV0aW9uVG9wLFxuICAgICAgc29sdXRpb25HbGFyZSxcbiAgICAgIHNvbHV0aW9uRnJvbnRFZGdlLFxuICAgICAgYmVha2VyQmFja1RvcCxcbiAgICAgIGJlYWtlckZyb250LFxuICAgICAgdGlja3MsXG4gICAgICBiZWFrZXJHbGFyZVxuICAgIF07XG5cbiAgICBzdXBlciggb3B0aW9ucyApO1xuXG4gICAgdGhpcy50aWNrcyA9IHRpY2tzO1xuXG4gICAgdGhpcy5kaXNwb3NlQmVha2VyTm9kZSA9ICgpID0+IHtcbiAgICAgIHNvbHV0aW9uR2xhcmVGaWxsUHJvcGVydHkuZGlzcG9zZSgpO1xuICAgICAgc29sdXRpb25TaGFkb3dGaWxsUHJvcGVydHkuZGlzcG9zZSgpO1xuICAgICAgc29sdXRpb25MZXZlbFByb3BlcnR5LnVubGluayggc29sdXRpb25MZXZlbExpc3RlbmVyICk7XG4gICAgfTtcbiAgfVxuXG4gIHB1YmxpYyBvdmVycmlkZSBkaXNwb3NlKCk6IHZvaWQge1xuICAgIHRoaXMuZGlzcG9zZUJlYWtlck5vZGUoKTtcbiAgICBzdXBlci5kaXNwb3NlKCk7XG4gIH1cblxuICBwdWJsaWMgc2V0VGlja3NWaXNpYmxlKCB2aXNpYmxlOiBib29sZWFuICk6IHZvaWQge1xuICAgIHRoaXMudGlja3MudmlzaWJsZSA9IHZpc2libGU7XG4gIH1cbn1cblxuc2NlbmVyeVBoZXQucmVnaXN0ZXIoICdCZWFrZXJOb2RlJywgQmVha2VyTm9kZSApOyJdLCJuYW1lcyI6WyJTaGFwZSIsIm9wdGlvbml6ZSIsIk5vZGUiLCJQYWludENvbG9yUHJvcGVydHkiLCJQYXRoIiwic2NlbmVyeVBoZXQiLCJTY2VuZXJ5UGhldENvbG9ycyIsIlNPTFVUSU9OX1ZJU0lCTEVfVEhSRVNIT0xEIiwiQmVha2VyTm9kZSIsImRpc3Bvc2UiLCJkaXNwb3NlQmVha2VyTm9kZSIsInNldFRpY2tzVmlzaWJsZSIsInZpc2libGUiLCJ0aWNrcyIsInNvbHV0aW9uTGV2ZWxQcm9wZXJ0eSIsInByb3ZpZGVkT3B0aW9ucyIsImFzc2VydCIsInJhbmdlIiwibWluIiwibWF4Iiwib3JpZ2luYWxHbGFyZUZpbGwiLCJzb2x1dGlvbkZpbGwiLCJ1bmRlZmluZWQiLCJzb2x1dGlvblNoaW5lRmlsbFByb3BlcnR5Iiwib3JpZ2luYWxTaGFkb3dGaWxsIiwic29sdXRpb25TaGFkb3dGaWxsUHJvcGVydHkiLCJzb2x1dGlvbkdsYXJlRmlsbFByb3BlcnR5IiwibHVtaW5hbmNlRmFjdG9yIiwib3B0aW9ucyIsImVtcHR5QmVha2VyRmlsbCIsImVtcHR5QmVha2VyRmlsbFByb3BlcnR5Iiwic29sdXRpb25GaWxsUHJvcGVydHkiLCJzb2x1dGlvbkdsYXJlRmlsbCIsInNvbHV0aW9uU2hhZG93RmlsbCIsImJlYWtlckdsYXJlRmlsbCIsImJlYWtlclNoaW5lRmlsbFByb3BlcnR5IiwiYmVha2VyU3Ryb2tlIiwibGluZVdpZHRoIiwiYmVha2VySGVpZ2h0IiwiYmVha2VyV2lkdGgiLCJ5UmFkaXVzT2ZFbmRzIiwidGlja3NWaXNpYmxlIiwibnVtYmVyT2ZUaWNrcyIsIm1ham9yVGlja01hcmtNb2R1bHVzIiwidGlja1N0cm9rZSIsInhSYWRpdXMiLCJjZW50ZXJUb3AiLCJjZW50ZXJCb3R0b20iLCJiZWFrZXJHbGFyZVNoYXBlIiwibW92ZVRvIiwidmVydGljYWxMaW5lVG8iLCJsaW5lVG8iLCJjbG9zZSIsImJlYWtlckZyb250U2hhcGUiLCJlbGxpcHRpY2FsQXJjIiwiTWF0aCIsIlBJIiwiYmVha2VyQmFja1RvcFNoYXBlIiwiYmVha2VyQmFja1NoYXBlIiwiYmVha2VyQm90dG9tU2hhcGUiLCJzb2x1dGlvblNpZGUiLCJmaWxsIiwicGlja2FibGUiLCJzb2x1dGlvblRvcCIsInNvbHV0aW9uRnJvbnRFZGdlIiwic29sdXRpb25CYWNrRWRnZSIsIm9wYWNpdHkiLCJzb2x1dGlvbkdsYXJlIiwiYmVha2VyRnJvbnQiLCJzdHJva2UiLCJiZWFrZXJCYWNrIiwiYmVha2VyQmFja1RvcCIsInNldFNjYWxlTWFnbml0dWRlIiwiYmVha2VyQm90dG9tIiwiYmVha2VyR2xhcmUiLCJnZXRPZmZzZXRTaGFwZSIsInRpY2tEaXZpc2lvbiIsInRpY2tzU2hhcGUiLCJ5IiwiaSIsImNlbnRyYWxBbmdsZSIsIm9mZnNldEFuZ2xlIiwibmV3U3VicGF0aCIsInNvbHV0aW9uTGV2ZWxMaXN0ZW5lciIsInNvbHV0aW9uTGV2ZWwiLCJjZW50ZXJMaXF1aWRZIiwic29sdXRpb25Ub3BTaGFwZSIsInNvbHV0aW9uU2lkZVNoYXBlIiwic29sdXRpb25Gcm9udEVkZ2VTaGFwZSIsInNvbHV0aW9uQmFja0VkZ2VTaGFwZSIsInNvbHV0aW9uQ3Jlc2NlbnRTaGFwZSIsInNoYXBlIiwiY2xpcEFyZWEiLCJ1bmlvbiIsImxpbmsiLCJjaGlsZHJlbiIsInVubGluayIsInJlZ2lzdGVyIl0sIm1hcHBpbmdzIjoiQUFBQSxzREFBc0Q7QUFFdEQ7Ozs7Ozs7O0NBUUMsR0FHRCxTQUFTQSxLQUFLLFFBQVEsMkJBQTJCO0FBQ2pELE9BQU9DLGVBQWUsa0NBQWtDO0FBRXhELFNBQVNDLElBQUksRUFBZUMsa0JBQWtCLEVBQUVDLElBQUksUUFBd0IsOEJBQThCO0FBQzFHLE9BQU9DLGlCQUFpQixtQkFBbUI7QUFDM0MsT0FBT0Ms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