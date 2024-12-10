// Copyright 2017-2024, University of Colorado Boulder
/**
 * A Node for a focus highlight that takes a shape and creates a Path with the default styling of a focus highlight
 * for a11y. The FocusHighlight has two paths.  The FocusHighlight path is an 'outer' highlight that is a little
 * lighter in color and transparency.  It as a child 'inner' path that is darker and more opaque, which gives the
 * focus highlight the illusion that it fades out.
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */ import Emitter from '../../../axon/js/Emitter.js';
import Matrix3 from '../../../dot/js/Matrix3.js';
import optionize, { combineOptions } from '../../../phet-core/js/optionize.js';
import { animatedPanZoomSingleton, Color, Path, scenery } from '../imports.js';
// constants
// default inner and outer strokes for the focus highlight
const OUTER_FOCUS_COLOR = new Color('rgba(212,19,106,0.5)');
const INNER_FOCUS_COLOR = new Color('rgba(250,40,135,0.9)');
// default inner and outer strokes for the group focus highlight, typically over Displays with lighter backgrounds
const INNER_LIGHT_GROUP_FOCUS_COLOR = new Color('rgba(233,113,166,1.0)');
const OUTER_LIGHT_GROUP_FOCUS_COLOR = new Color('rgba(233,113,166,1.0)');
// default inner and outer strokes for the group  focus highlight, typically over Displays with darker backgrounds
const INNER_DARK_GROUP_FOCUS_COLOR = new Color('rgba(159,15,80,1.0)');
const OUTER_DARK_GROUP_FOCUS_COLOR = new Color('rgba(159,15,80,1.0)');
// Determined by inspection, base widths of focus highlight, transform of shape/bounds will change highlight line width
const INNER_LINE_WIDTH_BASE = 2.5;
const OUTER_LINE_WIDTH_BASE = 4;
// determined by inspection, group focus highlights are thinner than default focus highlights
const GROUP_OUTER_LINE_WIDTH = 2;
const GROUP_INNER_LINE_WIDTH = 2;
let HighlightPath = class HighlightPath extends Path {
    /**
   * Mutating convenience function to mutate both the innerHighlightPath and outerHighlightPath.
   */ mutateWithInnerHighlight(options) {
        super.mutate(options);
        this.innerHighlightPath && this.innerHighlightPath.mutate(options);
        this.highlightChangedEmitter.emit();
    }
    /**
   * Mutate both inner and outer Paths to make the stroke dashed by using `lineDash`.
   */ setDashed(dashOn) {
        const lineDash = dashOn ? [
            7,
            7
        ] : [];
        this.mutateWithInnerHighlight({
            lineDash: lineDash
        });
    }
    /**
   * Update the shape of the child path (inner highlight) and this path (outer highlight). Note for the purposes
   * of chaining the outer Path (this) is returned, not the inner Path.
   */ setShape(shape) {
        super.setShape(shape);
        this.innerHighlightPath && this.innerHighlightPath.setShape(shape);
        this.highlightChangedEmitter && this.highlightChangedEmitter.emit();
        return this;
    }
    /**
   * Update the line width of both Paths based on transform of this Path, or another Node passed in (usually the
   * node that is being highlighted). Can be overridden by the options
   * passed in the constructor.
   */ updateLineWidth(matrix) {
        this.lineWidth = this.getOuterLineWidth(matrix);
        this.innerHighlightPath.lineWidth = this.getInnerLineWidth(matrix);
        this.highlightChangedEmitter.emit();
    }
    /**
   * Given a transformation matrix, return the lineWidth of this focus highlight (unless a custom
   * lineWidth was specified in the options).
   *
   * Note - this takes a matrix3 instead of a Node because that is already computed by the highlight
   * overlay and we can avoid the extra computation of the Node's local-to-global matrix.
   */ getOuterLineWidth(matrix) {
        if (this.outerLineWidth) {
            return this.outerLineWidth;
        }
        return HighlightPath.getOuterLineWidthFromMatrix(matrix);
    }
    /**
   * Given a transformation matrix, return the lineWidth of this focus highlight (unless a custom
   * lineWidth was specified in the options).
   *
   * Note - this takes a matrix3 instead of a Node because that is already computed by the highlight
   * overlay and we can avoid the extra computation of the Node's local-to-global matrix.
   */ getInnerLineWidth(matrix) {
        if (this.innerLineWidth) {
            return this.innerLineWidth;
        }
        return HighlightPath.getInnerLineWidthFromMatrix(matrix);
    }
    /**
   * Set the inner color of this focus highlight.
   */ setInnerHighlightColor(color) {
        this._innerHighlightColor = color;
        this.innerHighlightPath.setStroke(color);
        this.highlightChangedEmitter.emit();
    }
    set innerHighlightColor(color) {
        this.setInnerHighlightColor(color);
    }
    get innerHighlightColor() {
        return this.getInnerHighlightColor();
    }
    /**
   * Get the inner color of this focus highlight path.
   */ getInnerHighlightColor() {
        return this._innerHighlightColor;
    }
    /**
   * Set the outer color of this focus highlight.
   */ setOuterHighlightColor(color) {
        this._outerHighlightColor = color;
        this.setStroke(color);
        this.highlightChangedEmitter.emit();
    }
    set outerHighlightColor(color) {
        this.setOuterHighlightColor(color);
    }
    get outerHighlightColor() {
        return this.getOuterHighlightColor();
    }
    /**
   * Get the color of the outer highlight for this HighlightPath
   */ getOuterHighlightColor() {
        return this._outerHighlightColor;
    }
    /**
   * Return the trail to the transform source node being used for this focus highlight. So that we can observe
   * transforms applied to the source node so that the focus highlight can update accordingly.
   * (scenery-internal)
   *
   * @param focusedTrail - Trail to focused Node, to help search unique Trail to the transformSourceNode
   */ getUniqueHighlightTrail(focusedTrail) {
        assert && assert(this.transformSourceNode, 'getUniqueHighlightTrail requires a transformSourceNode');
        const transformSourceNode = this.transformSourceNode;
        let uniqueTrail = null;
        // if there is only one instance of transformSourceNode we can just grab its unique Trail
        if (transformSourceNode.instances.length <= 1) {
            uniqueTrail = transformSourceNode.getUniqueTrail();
        } else {
            // there are multiple Trails to the focused Node, try to use the one that goes through both the focused trail
            // and the transformSourceNode (a common case).
            const extendedTrails = transformSourceNode.getTrails().filter((trail)=>trail.isExtensionOf(focusedTrail, true));
            // If the trail to the transformSourceNode is not unique, does not go through the focused Node, or has
            // multiple Trails that go through the focused Node it is impossible to determine the Trail to use for the
            // highlight. Either avoid DAG for the transformSourceNode or use a HighlightPath without
            // transformSourceNode.
            assert && assert(extendedTrails.length === 1, 'No unique trail to highlight, either avoid DAG for transformSourceNode or don\'t use transformSourceNode with HighlightPath');
            uniqueTrail = extendedTrails[0];
        }
        assert && assert(uniqueTrail, 'no unique Trail found for getUniqueHighlightTrail');
        return uniqueTrail;
    }
    /**
   * Get the inner line width for a transformation matrix (presumably from the Node being highlighted).
   */ static getInnerLineWidthFromMatrix(matrix) {
        return INNER_LINE_WIDTH_BASE / HighlightPath.localToGlobalScaleFromMatrix(matrix);
    }
    /**
   * Get the outer line width for a transformation matrix (presumably from the Node being highlighted).
   */ static getOuterLineWidthFromMatrix(matrix) {
        return OUTER_LINE_WIDTH_BASE / HighlightPath.localToGlobalScaleFromMatrix(matrix);
    }
    /**
   * Get a scalar width to use for the focus highlight based on the global transformation matrix
   * (presumably from the Node being highlighted). This helps make sure that the highlight
   * line width remains consistent even when the Node has some scale applied to it.
   */ static localToGlobalScaleFromMatrix(matrix) {
        // The scale value in X of the matrix, without the Vector2 instance from getScaleVector.
        // The scale vector is assumed to be isometric, so we only need to consider the x component.
        return Math.sqrt(matrix.m00() * matrix.m00() + matrix.m10() * matrix.m10());
    }
    /**
   * Get the coefficient needed to scale the highlights bounds to surround the node being highlighted elegantly.
   * The highlight is based on a Node's bounds, so it should be scaled out a certain amount so that there is white
   * space between the edge of the component and the beginning (inside edge) of the focusHighlight
   */ static getDilationCoefficient(matrix) {
        const widthOfFocusHighlight = HighlightPath.getOuterLineWidthFromMatrix(matrix);
        // Dilating half of the focus highlight width will make the inner edge of the focus highlight at the bounds
        // of the node being highlighted.
        const scalarToEdgeOfBounds = 0.5;
        // Dilate the focus highlight slightly more to give whitespace in between the node being highlighted's bounds and
        // the inner edge of the highlight.
        const whiteSpaceScalar = 0.25;
        return widthOfFocusHighlight * (scalarToEdgeOfBounds + whiteSpaceScalar);
    }
    /**
   * Returns the highlight dilation coefficient when there is no transformation.
   */ static getDefaultDilationCoefficient() {
        return HighlightPath.getDilationCoefficient(Matrix3.IDENTITY);
    }
    /**
   * Returns the highlight dilation coefficient for a group focus highlight, which is a bit
   * larger than the typical dilation coefficient.
   */ static getDefaultGroupDilationCoefficient() {
        return HighlightPath.getGroupDilationCoefficient(Matrix3.IDENTITY);
    }
    /**
   * The default highlight line width. The outer line width is wider and can be used as a value for layout. This is the
   * value of the line width without any transformation. The actual value in the global coordinate frame may change
   * based on the pan/zoom of the screen.
   */ static getDefaultHighlightLineWidth() {
        return OUTER_LINE_WIDTH_BASE;
    }
    /**
   * Get the dilation coefficient for a group focus highlight, which extends even further beyond node bounds
   * than a regular focus highlight. The group focus highlight goes around a node whenever its descendant has focus,
   * so this will always surround the normal focus highlight.
   */ static getGroupDilationCoefficient(matrix) {
        const widthOfFocusHighlight = HighlightPath.getOuterLineWidthFromMatrix(matrix);
        // Dilating half of the focus highlight width will make the inner edge of the focus highlight at the bounds
        // of the node being highlighted.
        const scalarToEdgeOfBounds = 0.5;
        // Dilate the group focus highlight slightly more to give whitespace in between the node being highlighted's
        // bounds and the inner edge of the highlight.
        const whiteSpaceScalar = 1.4;
        return widthOfFocusHighlight * (scalarToEdgeOfBounds + whiteSpaceScalar);
    }
    /**
   * Returns a matrix representing the inverse of the pan/zoom transform, so that the highlight can be drawn in the
   * global coordinate frame. Do not modify this matrix.
   */ static getPanZoomCorrectingMatrix() {
        if (animatedPanZoomSingleton.initialized) {
            return animatedPanZoomSingleton.listener.matrixProperty.value.inverted();
        } else {
            return Matrix3.IDENTITY;
        }
    }
    /**
   * Returns a matrix that corrects for the layout scale of the application, so that the highlight can be drawn in the
   * global coordinate frame. Do not modify this matrix.
   */ static getLayoutCorrectingMatrix() {
        return Matrix3.scaling(1 / HighlightPath.layoutScale, 1 / HighlightPath.layoutScale);
    }
    /**
   * Returns a final matrix to use to scale a highlight so that it is in a consistent size relative to the
   * application layout bounds.
   */ static getCorrectiveScalingMatrix() {
        return HighlightPath.getPanZoomCorrectingMatrix().timesMatrix(HighlightPath.getLayoutCorrectingMatrix());
    }
    /**
   * @param [shape] - the shape for the focus highlight
   * @param [providedOptions]
   */ constructor(shape, providedOptions){
        const options = optionize()({
            outerStroke: OUTER_FOCUS_COLOR,
            innerStroke: INNER_FOCUS_COLOR,
            outerLineWidth: null,
            innerLineWidth: null,
            dashed: false,
            transformSourceNode: null
        }, providedOptions);
        super(shape), // Emits whenever this highlight changes.
        this.highlightChangedEmitter = new Emitter();
        this._innerHighlightColor = options.innerStroke;
        this._outerHighlightColor = options.outerStroke;
        const pathOptions = _.pick(options, Object.keys(Path.DEFAULT_PATH_OPTIONS));
        // Path cannot take null for lineWidth.
        this.innerLineWidth = options.innerLineWidth;
        this.outerLineWidth = options.outerLineWidth;
        this.transformSourceNode = options.transformSourceNode;
        // Assign the 'outer' specific options, and mutate the whole path for pr
        options.stroke = options.outerStroke;
        this.mutate(options);
        const innerHighlightOptions = combineOptions({}, pathOptions, {
            stroke: options.innerStroke
        });
        this.innerHighlightPath = new Path(shape, innerHighlightOptions);
        this.addChild(this.innerHighlightPath);
        if (options.dashed) {
            this.setDashed(true);
        }
    }
};
HighlightPath.OUTER_FOCUS_COLOR = OUTER_FOCUS_COLOR;
HighlightPath.INNER_FOCUS_COLOR = INNER_FOCUS_COLOR;
HighlightPath.INNER_LIGHT_GROUP_FOCUS_COLOR = INNER_LIGHT_GROUP_FOCUS_COLOR;
HighlightPath.OUTER_LIGHT_GROUP_FOCUS_COLOR = OUTER_LIGHT_GROUP_FOCUS_COLOR;
HighlightPath.INNER_DARK_GROUP_FOCUS_COLOR = INNER_DARK_GROUP_FOCUS_COLOR;
HighlightPath.OUTER_DARK_GROUP_FOCUS_COLOR = OUTER_DARK_GROUP_FOCUS_COLOR;
HighlightPath.GROUP_OUTER_LINE_WIDTH = GROUP_OUTER_LINE_WIDTH;
HighlightPath.GROUP_INNER_LINE_WIDTH = GROUP_INNER_LINE_WIDTH;
// A scalar describing the layout scale of your application. Highlight line widths are corrected
// by the layout scale so that they have the same sizes relative to the size of the application.
HighlightPath.layoutScale = 1;
scenery.register('HighlightPath', HighlightPath);
export default HighlightPath;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvYWNjZXNzaWJpbGl0eS9IaWdobGlnaHRQYXRoLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE3LTIwMjQsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIEEgTm9kZSBmb3IgYSBmb2N1cyBoaWdobGlnaHQgdGhhdCB0YWtlcyBhIHNoYXBlIGFuZCBjcmVhdGVzIGEgUGF0aCB3aXRoIHRoZSBkZWZhdWx0IHN0eWxpbmcgb2YgYSBmb2N1cyBoaWdobGlnaHRcbiAqIGZvciBhMTF5LiBUaGUgRm9jdXNIaWdobGlnaHQgaGFzIHR3byBwYXRocy4gIFRoZSBGb2N1c0hpZ2hsaWdodCBwYXRoIGlzIGFuICdvdXRlcicgaGlnaGxpZ2h0IHRoYXQgaXMgYSBsaXR0bGVcbiAqIGxpZ2h0ZXIgaW4gY29sb3IgYW5kIHRyYW5zcGFyZW5jeS4gIEl0IGFzIGEgY2hpbGQgJ2lubmVyJyBwYXRoIHRoYXQgaXMgZGFya2VyIGFuZCBtb3JlIG9wYXF1ZSwgd2hpY2ggZ2l2ZXMgdGhlXG4gKiBmb2N1cyBoaWdobGlnaHQgdGhlIGlsbHVzaW9uIHRoYXQgaXQgZmFkZXMgb3V0LlxuICpcbiAqIEBhdXRob3IgTWljaGFlbCBLYXV6bWFubiAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcbiAqIEBhdXRob3IgSmVzc2UgR3JlZW5iZXJnIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxuICovXG5cbmltcG9ydCBFbWl0dGVyIGZyb20gJy4uLy4uLy4uL2F4b24vanMvRW1pdHRlci5qcyc7XG5pbXBvcnQgVFJlYWRPbmx5UHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vYXhvbi9qcy9UUmVhZE9ubHlQcm9wZXJ0eS5qcyc7XG5pbXBvcnQgTWF0cml4MyBmcm9tICcuLi8uLi8uLi9kb3QvanMvTWF0cml4My5qcyc7XG5pbXBvcnQgb3B0aW9uaXplLCB7IGNvbWJpbmVPcHRpb25zIH0gZnJvbSAnLi4vLi4vLi4vcGhldC1jb3JlL2pzL29wdGlvbml6ZS5qcyc7XG5pbXBvcnQgU3RyaWN0T21pdCBmcm9tICcuLi8uLi8uLi9waGV0LWNvcmUvanMvdHlwZXMvU3RyaWN0T21pdC5qcyc7XG5pbXBvcnQgeyBhbmltYXRlZFBhblpvb21TaW5nbGV0b24sIENvbG9yLCBJbnB1dFNoYXBlLCBOb2RlLCBQYXRoLCBQYXRoT3B0aW9ucywgc2NlbmVyeSwgVFBhaW50LCBUcmFpbCB9IGZyb20gJy4uL2ltcG9ydHMuanMnO1xuXG4vLyBjb25zdGFudHNcbi8vIGRlZmF1bHQgaW5uZXIgYW5kIG91dGVyIHN0cm9rZXMgZm9yIHRoZSBmb2N1cyBoaWdobGlnaHRcbmNvbnN0IE9VVEVSX0ZPQ1VTX0NPTE9SID0gbmV3IENvbG9yKCAncmdiYSgyMTIsMTksMTA2LDAuNSknICk7XG5jb25zdCBJTk5FUl9GT0NVU19DT0xPUiA9IG5ldyBDb2xvciggJ3JnYmEoMjUwLDQwLDEzNSwwLjkpJyApO1xuXG4vLyBkZWZhdWx0IGlubmVyIGFuZCBvdXRlciBzdHJva2VzIGZvciB0aGUgZ3JvdXAgZm9jdXMgaGlnaGxpZ2h0LCB0eXBpY2FsbHkgb3ZlciBEaXNwbGF5cyB3aXRoIGxpZ2h0ZXIgYmFja2dyb3VuZHNcbmNvbnN0IElOTkVSX0xJR0hUX0dST1VQX0ZPQ1VTX0NPTE9SID0gbmV3IENvbG9yKCAncmdiYSgyMzMsMTEzLDE2NiwxLjApJyApO1xuY29uc3QgT1VURVJfTElHSFRfR1JPVVBfRk9DVVNfQ09MT1IgPSBuZXcgQ29sb3IoICdyZ2JhKDIzMywxMTMsMTY2LDEuMCknICk7XG5cbi8vIGRlZmF1bHQgaW5uZXIgYW5kIG91dGVyIHN0cm9rZXMgZm9yIHRoZSBncm91cCAgZm9jdXMgaGlnaGxpZ2h0LCB0eXBpY2FsbHkgb3ZlciBEaXNwbGF5cyB3aXRoIGRhcmtlciBiYWNrZ3JvdW5kc1xuY29uc3QgSU5ORVJfREFSS19HUk9VUF9GT0NVU19DT0xPUiA9IG5ldyBDb2xvciggJ3JnYmEoMTU5LDE1LDgwLDEuMCknICk7XG5jb25zdCBPVVRFUl9EQVJLX0dST1VQX0ZPQ1VTX0NPTE9SID0gbmV3IENvbG9yKCAncmdiYSgxNTksMTUsODAsMS4wKScgKTtcblxuLy8gRGV0ZXJtaW5lZCBieSBpbnNwZWN0aW9uLCBiYXNlIHdpZHRocyBvZiBmb2N1cyBoaWdobGlnaHQsIHRyYW5zZm9ybSBvZiBzaGFwZS9ib3VuZHMgd2lsbCBjaGFuZ2UgaGlnaGxpZ2h0IGxpbmUgd2lkdGhcbmNvbnN0IElOTkVSX0xJTkVfV0lEVEhfQkFTRSA9IDIuNTtcbmNvbnN0IE9VVEVSX0xJTkVfV0lEVEhfQkFTRSA9IDQ7XG5cbi8vIGRldGVybWluZWQgYnkgaW5zcGVjdGlvbiwgZ3JvdXAgZm9jdXMgaGlnaGxpZ2h0cyBhcmUgdGhpbm5lciB0aGFuIGRlZmF1bHQgZm9jdXMgaGlnaGxpZ2h0c1xuY29uc3QgR1JPVVBfT1VURVJfTElORV9XSURUSCA9IDI7XG5jb25zdCBHUk9VUF9JTk5FUl9MSU5FX1dJRFRIID0gMjtcblxudHlwZSBTZWxmT3B0aW9ucyA9IHtcblxuICAvLyBzdHJva2VzIGZvciBlYWNoIGhpZ2hsaWdodFxuICBvdXRlclN0cm9rZT86IFRQYWludDtcbiAgaW5uZXJTdHJva2U/OiBUUGFpbnQ7XG5cbiAgLy8gbGluZVdpZHRoIGZvciBlYWNoIGhpZ2hsaWdodC4gSWYgbnVsbCwgdGhlIGxpbmVXaWR0aCB3aWxsIGJlIGNhbGN1bGF0ZWQgZnJvbSB0aGUgdHJhbnNmb3JtIG9mXG4gIC8vIHRoZSBOb2RlIG9mIHRoaXMgaGlnaGxpZ2h0IChvciB0aGUgdHJhbnNmb3JtU291cmNlTm9kZSkuXG4gIG91dGVyTGluZVdpZHRoPzogbnVtYmVyIHwgbnVsbDtcbiAgaW5uZXJMaW5lV2lkdGg/OiBudW1iZXIgfCBudWxsO1xuXG4gIC8vIElmIHRydWUsIHRoZSBoaWdobGlnaHQgd2lsbCBhcHBlYXIgZGFzaGVkIHdpdGggYSBsaW5lRGFzaCBlZmZlY3QuIFVzZWQgb2Z0ZW4gYnkgUGhFVCB0byBpbmRpY2F0ZSB0aGF0IGFuXG4gIC8vIGludGVyYWN0aXZlIGNvbXBvbmVudCBpcyBjdXJyZW50bHkgcGlja2VkIHVwIGFuZCBiZWluZyBtYW5pcHVsYXRlZCBieSB0aGUgdXNlci5cbiAgZGFzaGVkPzogYm9vbGVhbjtcblxuICAvLyBJZiBzcGVjaWZpZWQsIHRoaXMgSGlnaGxpZ2h0UGF0aCB3aWxsIHJlcG9zaXRpb24gd2l0aCB0cmFuc2Zvcm0gY2hhbmdlcyBhbG9uZyB0aGUgdW5pcXVlIHRyYWlsIHRvIHRoaXMgc291cmNlXG4gIC8vIE5vZGUuIE90aGVyd2lzZSB5b3Ugd2lsbCBoYXZlIHRvIHBvc2l0aW9uIHRoaXMgaGlnaGxpZ2h0IG5vZGUgeW91cnNlbGYuXG4gIHRyYW5zZm9ybVNvdXJjZU5vZGU/OiBOb2RlIHwgbnVsbDtcbn07XG5cbi8vIFRoZSBzdHJva2UgYW5kIGxpbmV3aWR0aCBvZiB0aGlzIHBhdGggYXJlIHNldCB3aXRoIG91dGVyTGluZVdpZHRoIGFuZCBvdXRlclN0cm9rZS5cbmV4cG9ydCB0eXBlIEhpZ2hsaWdodFBhdGhPcHRpb25zID0gU2VsZk9wdGlvbnMgJiBTdHJpY3RPbWl0PFBhdGhPcHRpb25zLCAnc3Ryb2tlJyB8ICdsaW5lV2lkdGgnPjtcblxuY2xhc3MgSGlnaGxpZ2h0UGF0aCBleHRlbmRzIFBhdGgge1xuXG4gIC8vIFRoZSBoaWdobGlnaHQgaXMgY29tcG9zZWQgb2YgYW4gXCJpbm5lclwiIGFuZCBcIm91dGVyXCIgcGF0aCB0byBsb29rIG5pY2UuIFRoZXNlIGhvbGQgZWFjaCBjb2xvci5cbiAgcHJpdmF0ZSBfaW5uZXJIaWdobGlnaHRDb2xvcjogVFBhaW50O1xuICBwcml2YXRlIF9vdXRlckhpZ2hsaWdodENvbG9yOiBUUGFpbnQ7XG5cbiAgLy8gRW1pdHMgd2hlbmV2ZXIgdGhpcyBoaWdobGlnaHQgY2hhbmdlcy5cbiAgcHVibGljIHJlYWRvbmx5IGhpZ2hsaWdodENoYW5nZWRFbWl0dGVyID0gbmV3IEVtaXR0ZXIoKTtcblxuICAvLyBTZWUgb3B0aW9uIGZvciBkb2N1bWVudGF0aW9uLlxuICBwdWJsaWMgcmVhZG9ubHkgdHJhbnNmb3JtU291cmNlTm9kZTogTm9kZSB8IG51bGw7XG4gIHByaXZhdGUgcmVhZG9ubHkgb3V0ZXJMaW5lV2lkdGg6IG51bWJlciB8IG51bGw7XG4gIHByaXZhdGUgcmVhZG9ubHkgaW5uZXJMaW5lV2lkdGg6IG51bWJlciB8IG51bGw7XG5cbiAgLy8gVGhlICdpbm5lcicgZm9jdXMgaGlnaGxpZ2h0LCB0aGUgKGJ5IGRlZmF1bHQpIHNsaWdodGx5IGRhcmtlciBhbmQgbW9yZSBvcGFxdWUgcGF0aCB0aGF0IGlzIG9uIHRoZSBpbnNpZGUgb2YgdGhlXG4gIC8vIG91dGVyIHBhdGggdG8gZ2l2ZSB0aGUgZm9jdXMgaGlnaGxpZ2h0IGEgJ2ZhZGUtb3V0JyBhcHBlYXJhbmNlXG4gIHByb3RlY3RlZCByZWFkb25seSBpbm5lckhpZ2hsaWdodFBhdGg6IFBhdGg7XG5cbiAgcHVibGljIHN0YXRpYyByZWFkb25seSBPVVRFUl9GT0NVU19DT0xPUiA9IE9VVEVSX0ZPQ1VTX0NPTE9SO1xuICBwdWJsaWMgc3RhdGljIHJlYWRvbmx5IElOTkVSX0ZPQ1VTX0NPTE9SID0gSU5ORVJfRk9DVVNfQ09MT1I7XG5cbiAgcHVibGljIHN0YXRpYyByZWFkb25seSBJTk5FUl9MSUdIVF9HUk9VUF9GT0NVU19DT0xPUiA9IElOTkVSX0xJR0hUX0dST1VQX0ZPQ1VTX0NPTE9SO1xuICBwdWJsaWMgc3RhdGljIHJlYWRvbmx5IE9VVEVSX0xJR0hUX0dST1VQX0ZPQ1VTX0NPTE9SID0gT1VURVJfTElHSFRfR1JPVVBfRk9DVVNfQ09MT1I7XG5cbiAgcHVibGljIHN0YXRpYyByZWFkb25seSBJTk5FUl9EQVJLX0dST1VQX0ZPQ1VTX0NPTE9SID0gSU5ORVJfREFSS19HUk9VUF9GT0NVU19DT0xPUjtcbiAgcHVibGljIHN0YXRpYyByZWFkb25seSBPVVRFUl9EQVJLX0dST1VQX0ZPQ1VTX0NPTE9SID0gT1VURVJfREFSS19HUk9VUF9GT0NVU19DT0xPUjtcblxuICBwdWJsaWMgc3RhdGljIHJlYWRvbmx5IEdST1VQX09VVEVSX0xJTkVfV0lEVEggPSBHUk9VUF9PVVRFUl9MSU5FX1dJRFRIO1xuICBwdWJsaWMgc3RhdGljIHJlYWRvbmx5IEdST1VQX0lOTkVSX0xJTkVfV0lEVEggPSBHUk9VUF9JTk5FUl9MSU5FX1dJRFRIO1xuXG4gIC8vIEEgc2NhbGFyIGRlc2NyaWJpbmcgdGhlIGxheW91dCBzY2FsZSBvZiB5b3VyIGFwcGxpY2F0aW9uLiBIaWdobGlnaHQgbGluZSB3aWR0aHMgYXJlIGNvcnJlY3RlZFxuICAvLyBieSB0aGUgbGF5b3V0IHNjYWxlIHNvIHRoYXQgdGhleSBoYXZlIHRoZSBzYW1lIHNpemVzIHJlbGF0aXZlIHRvIHRoZSBzaXplIG9mIHRoZSBhcHBsaWNhdGlvbi5cbiAgcHVibGljIHN0YXRpYyBsYXlvdXRTY2FsZSA9IDE7XG5cbiAgLyoqXG4gICAqIEBwYXJhbSBbc2hhcGVdIC0gdGhlIHNoYXBlIGZvciB0aGUgZm9jdXMgaGlnaGxpZ2h0XG4gICAqIEBwYXJhbSBbcHJvdmlkZWRPcHRpb25zXVxuICAgKi9cbiAgcHVibGljIGNvbnN0cnVjdG9yKCBzaGFwZTogSW5wdXRTaGFwZSB8IFRSZWFkT25seVByb3BlcnR5PElucHV0U2hhcGU+LCBwcm92aWRlZE9wdGlvbnM/OiBIaWdobGlnaHRQYXRoT3B0aW9ucyApIHtcblxuICAgIGNvbnN0IG9wdGlvbnMgPSBvcHRpb25pemU8SGlnaGxpZ2h0UGF0aE9wdGlvbnMsIFNlbGZPcHRpb25zLCBQYXRoT3B0aW9ucz4oKSgge1xuICAgICAgb3V0ZXJTdHJva2U6IE9VVEVSX0ZPQ1VTX0NPTE9SLFxuICAgICAgaW5uZXJTdHJva2U6IElOTkVSX0ZPQ1VTX0NPTE9SLFxuICAgICAgb3V0ZXJMaW5lV2lkdGg6IG51bGwsXG4gICAgICBpbm5lckxpbmVXaWR0aDogbnVsbCxcbiAgICAgIGRhc2hlZDogZmFsc2UsXG4gICAgICB0cmFuc2Zvcm1Tb3VyY2VOb2RlOiBudWxsXG4gICAgfSwgcHJvdmlkZWRPcHRpb25zICk7XG5cbiAgICBzdXBlciggc2hhcGUgKTtcblxuICAgIHRoaXMuX2lubmVySGlnaGxpZ2h0Q29sb3IgPSBvcHRpb25zLmlubmVyU3Ryb2tlO1xuICAgIHRoaXMuX291dGVySGlnaGxpZ2h0Q29sb3IgPSBvcHRpb25zLm91dGVyU3Ryb2tlO1xuXG4gICAgY29uc3QgcGF0aE9wdGlvbnMgPSBfLnBpY2soIG9wdGlvbnMsIE9iamVjdC5rZXlzKCBQYXRoLkRFRkFVTFRfUEFUSF9PUFRJT05TICkgKSBhcyBQYXRoT3B0aW9ucztcblxuICAgIC8vIFBhdGggY2Fubm90IHRha2UgbnVsbCBmb3IgbGluZVdpZHRoLlxuICAgIHRoaXMuaW5uZXJMaW5lV2lkdGggPSBvcHRpb25zLmlubmVyTGluZVdpZHRoO1xuICAgIHRoaXMub3V0ZXJMaW5lV2lkdGggPSBvcHRpb25zLm91dGVyTGluZVdpZHRoO1xuXG4gICAgdGhpcy50cmFuc2Zvcm1Tb3VyY2VOb2RlID0gb3B0aW9ucy50cmFuc2Zvcm1Tb3VyY2VOb2RlO1xuXG4gICAgLy8gQXNzaWduIHRoZSAnb3V0ZXInIHNwZWNpZmljIG9wdGlvbnMsIGFuZCBtdXRhdGUgdGhlIHdob2xlIHBhdGggZm9yIHByXG4gICAgb3B0aW9ucy5zdHJva2UgPSBvcHRpb25zLm91dGVyU3Ryb2tlO1xuICAgIHRoaXMubXV0YXRlKCBvcHRpb25zICk7XG5cbiAgICBjb25zdCBpbm5lckhpZ2hsaWdodE9wdGlvbnMgPSBjb21iaW5lT3B0aW9uczxQYXRoT3B0aW9ucz4oIHt9LCBwYXRoT3B0aW9ucywge1xuICAgICAgc3Ryb2tlOiBvcHRpb25zLmlubmVyU3Ryb2tlXG4gICAgfSApO1xuXG4gICAgdGhpcy5pbm5lckhpZ2hsaWdodFBhdGggPSBuZXcgUGF0aCggc2hhcGUsIGlubmVySGlnaGxpZ2h0T3B0aW9ucyApO1xuICAgIHRoaXMuYWRkQ2hpbGQoIHRoaXMuaW5uZXJIaWdobGlnaHRQYXRoICk7XG5cbiAgICBpZiAoIG9wdGlvbnMuZGFzaGVkICkge1xuICAgICAgdGhpcy5zZXREYXNoZWQoIHRydWUgKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogTXV0YXRpbmcgY29udmVuaWVuY2UgZnVuY3Rpb24gdG8gbXV0YXRlIGJvdGggdGhlIGlubmVySGlnaGxpZ2h0UGF0aCBhbmQgb3V0ZXJIaWdobGlnaHRQYXRoLlxuICAgKi9cbiAgcHVibGljIG11dGF0ZVdpdGhJbm5lckhpZ2hsaWdodCggb3B0aW9uczogUGF0aE9wdGlvbnMgKTogdm9pZCB7XG4gICAgc3VwZXIubXV0YXRlKCBvcHRpb25zICk7XG4gICAgdGhpcy5pbm5lckhpZ2hsaWdodFBhdGggJiYgdGhpcy5pbm5lckhpZ2hsaWdodFBhdGgubXV0YXRlKCBvcHRpb25zICk7XG4gICAgdGhpcy5oaWdobGlnaHRDaGFuZ2VkRW1pdHRlci5lbWl0KCk7XG4gIH1cblxuICAvKipcbiAgICogTXV0YXRlIGJvdGggaW5uZXIgYW5kIG91dGVyIFBhdGhzIHRvIG1ha2UgdGhlIHN0cm9rZSBkYXNoZWQgYnkgdXNpbmcgYGxpbmVEYXNoYC5cbiAgICovXG4gIHB1YmxpYyBzZXREYXNoZWQoIGRhc2hPbjogYm9vbGVhbiApOiB2b2lkIHtcbiAgICBjb25zdCBsaW5lRGFzaCA9IGRhc2hPbiA/IFsgNywgNyBdIDogW107XG4gICAgdGhpcy5tdXRhdGVXaXRoSW5uZXJIaWdobGlnaHQoIHtcbiAgICAgIGxpbmVEYXNoOiBsaW5lRGFzaFxuICAgIH0gKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBVcGRhdGUgdGhlIHNoYXBlIG9mIHRoZSBjaGlsZCBwYXRoIChpbm5lciBoaWdobGlnaHQpIGFuZCB0aGlzIHBhdGggKG91dGVyIGhpZ2hsaWdodCkuIE5vdGUgZm9yIHRoZSBwdXJwb3Nlc1xuICAgKiBvZiBjaGFpbmluZyB0aGUgb3V0ZXIgUGF0aCAodGhpcykgaXMgcmV0dXJuZWQsIG5vdCB0aGUgaW5uZXIgUGF0aC5cbiAgICovXG4gIHB1YmxpYyBvdmVycmlkZSBzZXRTaGFwZSggc2hhcGU6IElucHV0U2hhcGUgKTogdGhpcyB7XG4gICAgc3VwZXIuc2V0U2hhcGUoIHNoYXBlICk7XG4gICAgdGhpcy5pbm5lckhpZ2hsaWdodFBhdGggJiYgdGhpcy5pbm5lckhpZ2hsaWdodFBhdGguc2V0U2hhcGUoIHNoYXBlICk7XG4gICAgdGhpcy5oaWdobGlnaHRDaGFuZ2VkRW1pdHRlciAmJiB0aGlzLmhpZ2hsaWdodENoYW5nZWRFbWl0dGVyLmVtaXQoKTtcblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIFVwZGF0ZSB0aGUgbGluZSB3aWR0aCBvZiBib3RoIFBhdGhzIGJhc2VkIG9uIHRyYW5zZm9ybSBvZiB0aGlzIFBhdGgsIG9yIGFub3RoZXIgTm9kZSBwYXNzZWQgaW4gKHVzdWFsbHkgdGhlXG4gICAqIG5vZGUgdGhhdCBpcyBiZWluZyBoaWdobGlnaHRlZCkuIENhbiBiZSBvdmVycmlkZGVuIGJ5IHRoZSBvcHRpb25zXG4gICAqIHBhc3NlZCBpbiB0aGUgY29uc3RydWN0b3IuXG4gICAqL1xuICBwdWJsaWMgdXBkYXRlTGluZVdpZHRoKCBtYXRyaXg6IE1hdHJpeDMgKTogdm9pZCB7XG4gICAgdGhpcy5saW5lV2lkdGggPSB0aGlzLmdldE91dGVyTGluZVdpZHRoKCBtYXRyaXggKTtcbiAgICB0aGlzLmlubmVySGlnaGxpZ2h0UGF0aC5saW5lV2lkdGggPSB0aGlzLmdldElubmVyTGluZVdpZHRoKCBtYXRyaXggKTtcbiAgICB0aGlzLmhpZ2hsaWdodENoYW5nZWRFbWl0dGVyLmVtaXQoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHaXZlbiBhIHRyYW5zZm9ybWF0aW9uIG1hdHJpeCwgcmV0dXJuIHRoZSBsaW5lV2lkdGggb2YgdGhpcyBmb2N1cyBoaWdobGlnaHQgKHVubGVzcyBhIGN1c3RvbVxuICAgKiBsaW5lV2lkdGggd2FzIHNwZWNpZmllZCBpbiB0aGUgb3B0aW9ucykuXG4gICAqXG4gICAqIE5vdGUgLSB0aGlzIHRha2VzIGEgbWF0cml4MyBpbnN0ZWFkIG9mIGEgTm9kZSBiZWNhdXNlIHRoYXQgaXMgYWxyZWFkeSBjb21wdXRlZCBieSB0aGUgaGlnaGxpZ2h0XG4gICAqIG92ZXJsYXkgYW5kIHdlIGNhbiBhdm9pZCB0aGUgZXh0cmEgY29tcHV0YXRpb24gb2YgdGhlIE5vZGUncyBsb2NhbC10by1nbG9iYWwgbWF0cml4LlxuICAgKi9cbiAgcHVibGljIGdldE91dGVyTGluZVdpZHRoKCBtYXRyaXg6IE1hdHJpeDMgKTogbnVtYmVyIHtcbiAgICBpZiAoIHRoaXMub3V0ZXJMaW5lV2lkdGggKSB7XG4gICAgICByZXR1cm4gdGhpcy5vdXRlckxpbmVXaWR0aDtcbiAgICB9XG4gICAgcmV0dXJuIEhpZ2hsaWdodFBhdGguZ2V0T3V0ZXJMaW5lV2lkdGhGcm9tTWF0cml4KCBtYXRyaXggKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHaXZlbiBhIHRyYW5zZm9ybWF0aW9uIG1hdHJpeCwgcmV0dXJuIHRoZSBsaW5lV2lkdGggb2YgdGhpcyBmb2N1cyBoaWdobGlnaHQgKHVubGVzcyBhIGN1c3RvbVxuICAgKiBsaW5lV2lkdGggd2FzIHNwZWNpZmllZCBpbiB0aGUgb3B0aW9ucykuXG4gICAqXG4gICAqIE5vdGUgLSB0aGlzIHRha2VzIGEgbWF0cml4MyBpbnN0ZWFkIG9mIGEgTm9kZSBiZWNhdXNlIHRoYXQgaXMgYWxyZWFkeSBjb21wdXRlZCBieSB0aGUgaGlnaGxpZ2h0XG4gICAqIG92ZXJsYXkgYW5kIHdlIGNhbiBhdm9pZCB0aGUgZXh0cmEgY29tcHV0YXRpb24gb2YgdGhlIE5vZGUncyBsb2NhbC10by1nbG9iYWwgbWF0cml4LlxuICAgKi9cbiAgcHVibGljIGdldElubmVyTGluZVdpZHRoKCBtYXRyaXg6IE1hdHJpeDMgKTogbnVtYmVyIHtcbiAgICBpZiAoIHRoaXMuaW5uZXJMaW5lV2lkdGggKSB7XG4gICAgICByZXR1cm4gdGhpcy5pbm5lckxpbmVXaWR0aDtcbiAgICB9XG4gICAgcmV0dXJuIEhpZ2hsaWdodFBhdGguZ2V0SW5uZXJMaW5lV2lkdGhGcm9tTWF0cml4KCBtYXRyaXggKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXQgdGhlIGlubmVyIGNvbG9yIG9mIHRoaXMgZm9jdXMgaGlnaGxpZ2h0LlxuICAgKi9cbiAgcHVibGljIHNldElubmVySGlnaGxpZ2h0Q29sb3IoIGNvbG9yOiBUUGFpbnQgKTogdm9pZCB7XG4gICAgdGhpcy5faW5uZXJIaWdobGlnaHRDb2xvciA9IGNvbG9yO1xuICAgIHRoaXMuaW5uZXJIaWdobGlnaHRQYXRoLnNldFN0cm9rZSggY29sb3IgKTtcbiAgICB0aGlzLmhpZ2hsaWdodENoYW5nZWRFbWl0dGVyLmVtaXQoKTtcbiAgfVxuXG4gIHB1YmxpYyBzZXQgaW5uZXJIaWdobGlnaHRDb2xvciggY29sb3I6IFRQYWludCApIHsgdGhpcy5zZXRJbm5lckhpZ2hsaWdodENvbG9yKCBjb2xvciApOyB9XG5cbiAgcHVibGljIGdldCBpbm5lckhpZ2hsaWdodENvbG9yKCk6IFRQYWludCB7IHJldHVybiB0aGlzLmdldElubmVySGlnaGxpZ2h0Q29sb3IoKTsgfVxuXG4gIC8qKlxuICAgKiBHZXQgdGhlIGlubmVyIGNvbG9yIG9mIHRoaXMgZm9jdXMgaGlnaGxpZ2h0IHBhdGguXG4gICAqL1xuICBwdWJsaWMgZ2V0SW5uZXJIaWdobGlnaHRDb2xvcigpOiBUUGFpbnQge1xuICAgIHJldHVybiB0aGlzLl9pbm5lckhpZ2hsaWdodENvbG9yO1xuICB9XG5cbiAgLyoqXG4gICAqIFNldCB0aGUgb3V0ZXIgY29sb3Igb2YgdGhpcyBmb2N1cyBoaWdobGlnaHQuXG4gICAqL1xuICBwdWJsaWMgc2V0T3V0ZXJIaWdobGlnaHRDb2xvciggY29sb3I6IFRQYWludCApOiB2b2lkIHtcbiAgICB0aGlzLl9vdXRlckhpZ2hsaWdodENvbG9yID0gY29sb3I7XG4gICAgdGhpcy5zZXRTdHJva2UoIGNvbG9yICk7XG4gICAgdGhpcy5oaWdobGlnaHRDaGFuZ2VkRW1pdHRlci5lbWl0KCk7XG4gIH1cblxuICBwdWJsaWMgc2V0IG91dGVySGlnaGxpZ2h0Q29sb3IoIGNvbG9yOiBUUGFpbnQgKSB7IHRoaXMuc2V0T3V0ZXJIaWdobGlnaHRDb2xvciggY29sb3IgKTsgfVxuXG4gIHB1YmxpYyBnZXQgb3V0ZXJIaWdobGlnaHRDb2xvcigpOiBUUGFpbnQgeyByZXR1cm4gdGhpcy5nZXRPdXRlckhpZ2hsaWdodENvbG9yKCk7IH1cblxuICAvKipcbiAgICogR2V0IHRoZSBjb2xvciBvZiB0aGUgb3V0ZXIgaGlnaGxpZ2h0IGZvciB0aGlzIEhpZ2hsaWdodFBhdGhcbiAgICovXG4gIHB1YmxpYyBnZXRPdXRlckhpZ2hsaWdodENvbG9yKCk6IFRQYWludCB7XG4gICAgcmV0dXJuIHRoaXMuX291dGVySGlnaGxpZ2h0Q29sb3I7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJuIHRoZSB0cmFpbCB0byB0aGUgdHJhbnNmb3JtIHNvdXJjZSBub2RlIGJlaW5nIHVzZWQgZm9yIHRoaXMgZm9jdXMgaGlnaGxpZ2h0LiBTbyB0aGF0IHdlIGNhbiBvYnNlcnZlXG4gICAqIHRyYW5zZm9ybXMgYXBwbGllZCB0byB0aGUgc291cmNlIG5vZGUgc28gdGhhdCB0aGUgZm9jdXMgaGlnaGxpZ2h0IGNhbiB1cGRhdGUgYWNjb3JkaW5nbHkuXG4gICAqIChzY2VuZXJ5LWludGVybmFsKVxuICAgKlxuICAgKiBAcGFyYW0gZm9jdXNlZFRyYWlsIC0gVHJhaWwgdG8gZm9jdXNlZCBOb2RlLCB0byBoZWxwIHNlYXJjaCB1bmlxdWUgVHJhaWwgdG8gdGhlIHRyYW5zZm9ybVNvdXJjZU5vZGVcbiAgICovXG4gIHB1YmxpYyBnZXRVbmlxdWVIaWdobGlnaHRUcmFpbCggZm9jdXNlZFRyYWlsOiBUcmFpbCApOiBUcmFpbCB7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdGhpcy50cmFuc2Zvcm1Tb3VyY2VOb2RlLCAnZ2V0VW5pcXVlSGlnaGxpZ2h0VHJhaWwgcmVxdWlyZXMgYSB0cmFuc2Zvcm1Tb3VyY2VOb2RlJyApO1xuICAgIGNvbnN0IHRyYW5zZm9ybVNvdXJjZU5vZGUgPSB0aGlzLnRyYW5zZm9ybVNvdXJjZU5vZGUhO1xuXG4gICAgbGV0IHVuaXF1ZVRyYWlsID0gbnVsbDtcblxuICAgIC8vIGlmIHRoZXJlIGlzIG9ubHkgb25lIGluc3RhbmNlIG9mIHRyYW5zZm9ybVNvdXJjZU5vZGUgd2UgY2FuIGp1c3QgZ3JhYiBpdHMgdW5pcXVlIFRyYWlsXG4gICAgaWYgKCB0cmFuc2Zvcm1Tb3VyY2VOb2RlLmluc3RhbmNlcy5sZW5ndGggPD0gMSApIHtcbiAgICAgIHVuaXF1ZVRyYWlsID0gdHJhbnNmb3JtU291cmNlTm9kZS5nZXRVbmlxdWVUcmFpbCgpO1xuICAgIH1cbiAgICBlbHNlIHtcblxuICAgICAgLy8gdGhlcmUgYXJlIG11bHRpcGxlIFRyYWlscyB0byB0aGUgZm9jdXNlZCBOb2RlLCB0cnkgdG8gdXNlIHRoZSBvbmUgdGhhdCBnb2VzIHRocm91Z2ggYm90aCB0aGUgZm9jdXNlZCB0cmFpbFxuICAgICAgLy8gYW5kIHRoZSB0cmFuc2Zvcm1Tb3VyY2VOb2RlIChhIGNvbW1vbiBjYXNlKS5cbiAgICAgIGNvbnN0IGV4dGVuZGVkVHJhaWxzID0gdHJhbnNmb3JtU291cmNlTm9kZS5nZXRUcmFpbHMoKS5maWx0ZXIoIHRyYWlsID0+IHRyYWlsLmlzRXh0ZW5zaW9uT2YoIGZvY3VzZWRUcmFpbCwgdHJ1ZSApICk7XG5cbiAgICAgIC8vIElmIHRoZSB0cmFpbCB0byB0aGUgdHJhbnNmb3JtU291cmNlTm9kZSBpcyBub3QgdW5pcXVlLCBkb2VzIG5vdCBnbyB0aHJvdWdoIHRoZSBmb2N1c2VkIE5vZGUsIG9yIGhhc1xuICAgICAgLy8gbXVsdGlwbGUgVHJhaWxzIHRoYXQgZ28gdGhyb3VnaCB0aGUgZm9jdXNlZCBOb2RlIGl0IGlzIGltcG9zc2libGUgdG8gZGV0ZXJtaW5lIHRoZSBUcmFpbCB0byB1c2UgZm9yIHRoZVxuICAgICAgLy8gaGlnaGxpZ2h0LiBFaXRoZXIgYXZvaWQgREFHIGZvciB0aGUgdHJhbnNmb3JtU291cmNlTm9kZSBvciB1c2UgYSBIaWdobGlnaHRQYXRoIHdpdGhvdXRcbiAgICAgIC8vIHRyYW5zZm9ybVNvdXJjZU5vZGUuXG4gICAgICBhc3NlcnQgJiYgYXNzZXJ0KCBleHRlbmRlZFRyYWlscy5sZW5ndGggPT09IDEsXG4gICAgICAgICdObyB1bmlxdWUgdHJhaWwgdG8gaGlnaGxpZ2h0LCBlaXRoZXIgYXZvaWQgREFHIGZvciB0cmFuc2Zvcm1Tb3VyY2VOb2RlIG9yIGRvblxcJ3QgdXNlIHRyYW5zZm9ybVNvdXJjZU5vZGUgd2l0aCBIaWdobGlnaHRQYXRoJ1xuICAgICAgKTtcblxuICAgICAgdW5pcXVlVHJhaWwgPSBleHRlbmRlZFRyYWlsc1sgMCBdO1xuICAgIH1cblxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHVuaXF1ZVRyYWlsLCAnbm8gdW5pcXVlIFRyYWlsIGZvdW5kIGZvciBnZXRVbmlxdWVIaWdobGlnaHRUcmFpbCcgKTtcbiAgICByZXR1cm4gdW5pcXVlVHJhaWw7XG4gIH1cblxuXG4gIC8qKlxuICAgKiBHZXQgdGhlIGlubmVyIGxpbmUgd2lkdGggZm9yIGEgdHJhbnNmb3JtYXRpb24gbWF0cml4IChwcmVzdW1hYmx5IGZyb20gdGhlIE5vZGUgYmVpbmcgaGlnaGxpZ2h0ZWQpLlxuICAgKi9cbiAgcHJpdmF0ZSBzdGF0aWMgZ2V0SW5uZXJMaW5lV2lkdGhGcm9tTWF0cml4KCBtYXRyaXg6IE1hdHJpeDMgKTogbnVtYmVyIHtcbiAgICByZXR1cm4gSU5ORVJfTElORV9XSURUSF9CQVNFIC8gSGlnaGxpZ2h0UGF0aC5sb2NhbFRvR2xvYmFsU2NhbGVGcm9tTWF0cml4KCBtYXRyaXggKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgdGhlIG91dGVyIGxpbmUgd2lkdGggZm9yIGEgdHJhbnNmb3JtYXRpb24gbWF0cml4IChwcmVzdW1hYmx5IGZyb20gdGhlIE5vZGUgYmVpbmcgaGlnaGxpZ2h0ZWQpLlxuICAgKi9cbiAgcHJpdmF0ZSBzdGF0aWMgZ2V0T3V0ZXJMaW5lV2lkdGhGcm9tTWF0cml4KCBtYXRyaXg6IE1hdHJpeDMgKTogbnVtYmVyIHtcbiAgICByZXR1cm4gT1VURVJfTElORV9XSURUSF9CQVNFIC8gSGlnaGxpZ2h0UGF0aC5sb2NhbFRvR2xvYmFsU2NhbGVGcm9tTWF0cml4KCBtYXRyaXggKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgYSBzY2FsYXIgd2lkdGggdG8gdXNlIGZvciB0aGUgZm9jdXMgaGlnaGxpZ2h0IGJhc2VkIG9uIHRoZSBnbG9iYWwgdHJhbnNmb3JtYXRpb24gbWF0cml4XG4gICAqIChwcmVzdW1hYmx5IGZyb20gdGhlIE5vZGUgYmVpbmcgaGlnaGxpZ2h0ZWQpLiBUaGlzIGhlbHBzIG1ha2Ugc3VyZSB0aGF0IHRoZSBoaWdobGlnaHRcbiAgICogbGluZSB3aWR0aCByZW1haW5zIGNvbnNpc3RlbnQgZXZlbiB3aGVuIHRoZSBOb2RlIGhhcyBzb21lIHNjYWxlIGFwcGxpZWQgdG8gaXQuXG4gICAqL1xuICBwcml2YXRlIHN0YXRpYyBsb2NhbFRvR2xvYmFsU2NhbGVGcm9tTWF0cml4KCBtYXRyaXg6IE1hdHJpeDMgKTogbnVtYmVyIHtcblxuICAgIC8vIFRoZSBzY2FsZSB2YWx1ZSBpbiBYIG9mIHRoZSBtYXRyaXgsIHdpdGhvdXQgdGhlIFZlY3RvcjIgaW5zdGFuY2UgZnJvbSBnZXRTY2FsZVZlY3Rvci5cbiAgICAvLyBUaGUgc2NhbGUgdmVjdG9yIGlzIGFzc3VtZWQgdG8gYmUgaXNvbWV0cmljLCBzbyB3ZSBvbmx5IG5lZWQgdG8gY29uc2lkZXIgdGhlIHggY29tcG9uZW50LlxuICAgIHJldHVybiBNYXRoLnNxcnQoIG1hdHJpeC5tMDAoKSAqIG1hdHJpeC5tMDAoKSArIG1hdHJpeC5tMTAoKSAqIG1hdHJpeC5tMTAoKSApO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldCB0aGUgY29lZmZpY2llbnQgbmVlZGVkIHRvIHNjYWxlIHRoZSBoaWdobGlnaHRzIGJvdW5kcyB0byBzdXJyb3VuZCB0aGUgbm9kZSBiZWluZyBoaWdobGlnaHRlZCBlbGVnYW50bHkuXG4gICAqIFRoZSBoaWdobGlnaHQgaXMgYmFzZWQgb24gYSBOb2RlJ3MgYm91bmRzLCBzbyBpdCBzaG91bGQgYmUgc2NhbGVkIG91dCBhIGNlcnRhaW4gYW1vdW50IHNvIHRoYXQgdGhlcmUgaXMgd2hpdGVcbiAgICogc3BhY2UgYmV0d2VlbiB0aGUgZWRnZSBvZiB0aGUgY29tcG9uZW50IGFuZCB0aGUgYmVnaW5uaW5nIChpbnNpZGUgZWRnZSkgb2YgdGhlIGZvY3VzSGlnaGxpZ2h0XG4gICAqL1xuICBwdWJsaWMgc3RhdGljIGdldERpbGF0aW9uQ29lZmZpY2llbnQoIG1hdHJpeDogTWF0cml4MyApOiBudW1iZXIge1xuICAgIGNvbnN0IHdpZHRoT2ZGb2N1c0hpZ2hsaWdodCA9IEhpZ2hsaWdodFBhdGguZ2V0T3V0ZXJMaW5lV2lkdGhGcm9tTWF0cml4KCBtYXRyaXggKTtcblxuICAgIC8vIERpbGF0aW5nIGhhbGYgb2YgdGhlIGZvY3VzIGhpZ2hsaWdodCB3aWR0aCB3aWxsIG1ha2UgdGhlIGlubmVyIGVkZ2Ugb2YgdGhlIGZvY3VzIGhpZ2hsaWdodCBhdCB0aGUgYm91bmRzXG4gICAgLy8gb2YgdGhlIG5vZGUgYmVpbmcgaGlnaGxpZ2h0ZWQuXG4gICAgY29uc3Qgc2NhbGFyVG9FZGdlT2ZCb3VuZHMgPSAwLjU7XG5cbiAgICAvLyBEaWxhdGUgdGhlIGZvY3VzIGhpZ2hsaWdodCBzbGlnaHRseSBtb3JlIHRvIGdpdmUgd2hpdGVzcGFjZSBpbiBiZXR3ZWVuIHRoZSBub2RlIGJlaW5nIGhpZ2hsaWdodGVkJ3MgYm91bmRzIGFuZFxuICAgIC8vIHRoZSBpbm5lciBlZGdlIG9mIHRoZSBoaWdobGlnaHQuXG4gICAgY29uc3Qgd2hpdGVTcGFjZVNjYWxhciA9IDAuMjU7XG5cbiAgICByZXR1cm4gd2lkdGhPZkZvY3VzSGlnaGxpZ2h0ICogKCBzY2FsYXJUb0VkZ2VPZkJvdW5kcyArIHdoaXRlU3BhY2VTY2FsYXIgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBoaWdobGlnaHQgZGlsYXRpb24gY29lZmZpY2llbnQgd2hlbiB0aGVyZSBpcyBubyB0cmFuc2Zvcm1hdGlvbi5cbiAgICovXG4gIHB1YmxpYyBzdGF0aWMgZ2V0RGVmYXVsdERpbGF0aW9uQ29lZmZpY2llbnQoKTogbnVtYmVyIHtcbiAgICByZXR1cm4gSGlnaGxpZ2h0UGF0aC5nZXREaWxhdGlvbkNvZWZmaWNpZW50KCBNYXRyaXgzLklERU5USVRZICk7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgaGlnaGxpZ2h0IGRpbGF0aW9uIGNvZWZmaWNpZW50IGZvciBhIGdyb3VwIGZvY3VzIGhpZ2hsaWdodCwgd2hpY2ggaXMgYSBiaXRcbiAgICogbGFyZ2VyIHRoYW4gdGhlIHR5cGljYWwgZGlsYXRpb24gY29lZmZpY2llbnQuXG4gICAqL1xuICBwdWJsaWMgc3RhdGljIGdldERlZmF1bHRHcm91cERpbGF0aW9uQ29lZmZpY2llbnQoKTogbnVtYmVyIHtcbiAgICByZXR1cm4gSGlnaGxpZ2h0UGF0aC5nZXRHcm91cERpbGF0aW9uQ29lZmZpY2llbnQoIE1hdHJpeDMuSURFTlRJVFkgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBUaGUgZGVmYXVsdCBoaWdobGlnaHQgbGluZSB3aWR0aC4gVGhlIG91dGVyIGxpbmUgd2lkdGggaXMgd2lkZXIgYW5kIGNhbiBiZSB1c2VkIGFzIGEgdmFsdWUgZm9yIGxheW91dC4gVGhpcyBpcyB0aGVcbiAgICogdmFsdWUgb2YgdGhlIGxpbmUgd2lkdGggd2l0aG91dCBhbnkgdHJhbnNmb3JtYXRpb24uIFRoZSBhY3R1YWwgdmFsdWUgaW4gdGhlIGdsb2JhbCBjb29yZGluYXRlIGZyYW1lIG1heSBjaGFuZ2VcbiAgICogYmFzZWQgb24gdGhlIHBhbi96b29tIG9mIHRoZSBzY3JlZW4uXG4gICAqL1xuICBwdWJsaWMgc3RhdGljIGdldERlZmF1bHRIaWdobGlnaHRMaW5lV2lkdGgoKTogbnVtYmVyIHtcbiAgICByZXR1cm4gT1VURVJfTElORV9XSURUSF9CQVNFO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldCB0aGUgZGlsYXRpb24gY29lZmZpY2llbnQgZm9yIGEgZ3JvdXAgZm9jdXMgaGlnaGxpZ2h0LCB3aGljaCBleHRlbmRzIGV2ZW4gZnVydGhlciBiZXlvbmQgbm9kZSBib3VuZHNcbiAgICogdGhhbiBhIHJlZ3VsYXIgZm9jdXMgaGlnaGxpZ2h0LiBUaGUgZ3JvdXAgZm9jdXMgaGlnaGxpZ2h0IGdvZXMgYXJvdW5kIGEgbm9kZSB3aGVuZXZlciBpdHMgZGVzY2VuZGFudCBoYXMgZm9jdXMsXG4gICAqIHNvIHRoaXMgd2lsbCBhbHdheXMgc3Vycm91bmQgdGhlIG5vcm1hbCBmb2N1cyBoaWdobGlnaHQuXG4gICAqL1xuICBwdWJsaWMgc3RhdGljIGdldEdyb3VwRGlsYXRpb25Db2VmZmljaWVudCggbWF0cml4OiBNYXRyaXgzICk6IG51bWJlciB7XG4gICAgY29uc3Qgd2lkdGhPZkZvY3VzSGlnaGxpZ2h0ID0gSGlnaGxpZ2h0UGF0aC5nZXRPdXRlckxpbmVXaWR0aEZyb21NYXRyaXgoIG1hdHJpeCApO1xuXG4gICAgLy8gRGlsYXRpbmcgaGFsZiBvZiB0aGUgZm9jdXMgaGlnaGxpZ2h0IHdpZHRoIHdpbGwgbWFrZSB0aGUgaW5uZXIgZWRnZSBvZiB0aGUgZm9jdXMgaGlnaGxpZ2h0IGF0IHRoZSBib3VuZHNcbiAgICAvLyBvZiB0aGUgbm9kZSBiZWluZyBoaWdobGlnaHRlZC5cbiAgICBjb25zdCBzY2FsYXJUb0VkZ2VPZkJvdW5kcyA9IDAuNTtcblxuICAgIC8vIERpbGF0ZSB0aGUgZ3JvdXAgZm9jdXMgaGlnaGxpZ2h0IHNsaWdodGx5IG1vcmUgdG8gZ2l2ZSB3aGl0ZXNwYWNlIGluIGJldHdlZW4gdGhlIG5vZGUgYmVpbmcgaGlnaGxpZ2h0ZWQnc1xuICAgIC8vIGJvdW5kcyBhbmQgdGhlIGlubmVyIGVkZ2Ugb2YgdGhlIGhpZ2hsaWdodC5cbiAgICBjb25zdCB3aGl0ZVNwYWNlU2NhbGFyID0gMS40O1xuXG4gICAgcmV0dXJuIHdpZHRoT2ZGb2N1c0hpZ2hsaWdodCAqICggc2NhbGFyVG9FZGdlT2ZCb3VuZHMgKyB3aGl0ZVNwYWNlU2NhbGFyICk7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyBhIG1hdHJpeCByZXByZXNlbnRpbmcgdGhlIGludmVyc2Ugb2YgdGhlIHBhbi96b29tIHRyYW5zZm9ybSwgc28gdGhhdCB0aGUgaGlnaGxpZ2h0IGNhbiBiZSBkcmF3biBpbiB0aGVcbiAgICogZ2xvYmFsIGNvb3JkaW5hdGUgZnJhbWUuIERvIG5vdCBtb2RpZnkgdGhpcyBtYXRyaXguXG4gICAqL1xuICBwcml2YXRlIHN0YXRpYyBnZXRQYW5ab29tQ29ycmVjdGluZ01hdHJpeCgpOiBNYXRyaXgzIHtcbiAgICBpZiAoIGFuaW1hdGVkUGFuWm9vbVNpbmdsZXRvbi5pbml0aWFsaXplZCApIHtcbiAgICAgIHJldHVybiBhbmltYXRlZFBhblpvb21TaW5nbGV0b24ubGlzdGVuZXIubWF0cml4UHJvcGVydHkudmFsdWUuaW52ZXJ0ZWQoKTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICByZXR1cm4gTWF0cml4My5JREVOVElUWTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyBhIG1hdHJpeCB0aGF0IGNvcnJlY3RzIGZvciB0aGUgbGF5b3V0IHNjYWxlIG9mIHRoZSBhcHBsaWNhdGlvbiwgc28gdGhhdCB0aGUgaGlnaGxpZ2h0IGNhbiBiZSBkcmF3biBpbiB0aGVcbiAgICogZ2xvYmFsIGNvb3JkaW5hdGUgZnJhbWUuIERvIG5vdCBtb2RpZnkgdGhpcyBtYXRyaXguXG4gICAqL1xuICBwcml2YXRlIHN0YXRpYyBnZXRMYXlvdXRDb3JyZWN0aW5nTWF0cml4KCk6IE1hdHJpeDMge1xuICAgIHJldHVybiBNYXRyaXgzLnNjYWxpbmcoIDEgLyBIaWdobGlnaHRQYXRoLmxheW91dFNjYWxlLCAxIC8gSGlnaGxpZ2h0UGF0aC5sYXlvdXRTY2FsZSApO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgYSBmaW5hbCBtYXRyaXggdG8gdXNlIHRvIHNjYWxlIGEgaGlnaGxpZ2h0IHNvIHRoYXQgaXQgaXMgaW4gYSBjb25zaXN0ZW50IHNpemUgcmVsYXRpdmUgdG8gdGhlXG4gICAqIGFwcGxpY2F0aW9uIGxheW91dCBib3VuZHMuXG4gICAqL1xuICBwdWJsaWMgc3RhdGljIGdldENvcnJlY3RpdmVTY2FsaW5nTWF0cml4KCk6IE1hdHJpeDMge1xuICAgIHJldHVybiBIaWdobGlnaHRQYXRoLmdldFBhblpvb21Db3JyZWN0aW5nTWF0cml4KCkudGltZXNNYXRyaXgoIEhpZ2hsaWdodFBhdGguZ2V0TGF5b3V0Q29ycmVjdGluZ01hdHJpeCgpICk7XG4gIH1cbn1cblxuc2NlbmVyeS5yZWdpc3RlciggJ0hpZ2hsaWdodFBhdGgnLCBIaWdobGlnaHRQYXRoICk7XG5cbmV4cG9ydCBkZWZhdWx0IEhpZ2hsaWdodFBhdGg7Il0sIm5hbWVzIjpbIkVtaXR0ZXIiLCJNYXRyaXgzIiwib3B0aW9uaXplIiwiY29tYmluZU9wdGlvbnMiLCJhbmltYXRlZFBhblpvb21TaW5nbGV0b24iLCJDb2xvciIsIlBhdGgiLCJzY2VuZXJ5IiwiT1VURVJfRk9DVVNfQ09MT1IiLCJJTk5FUl9GT0NVU19DT0xPUiIsIklOTkVSX0xJR0hUX0dST1VQX0ZPQ1VTX0NPTE9SIiwiT1VURVJfTElHSFRfR1JPVVBfRk9DVVNfQ09MT1IiLCJJTk5FUl9EQVJLX0dST1VQX0ZPQ1VTX0NPTE9SIiwiT1VURVJfREFSS19HUk9VUF9GT0NVU19DT0xPUiIsIklOTkVSX0xJTkVfV0lEVEhfQkFTRSIsIk9VVEVSX0xJTkVfV0lEVEhfQkFTRSIsIkdST1VQX09VVEVSX0xJTkVfV0lEVEgiLCJHUk9VUF9JTk5FUl9MSU5FX1dJRFRIIiwiSGlnaGxpZ2h0UGF0aCIsIm11dGF0ZVdpdGhJbm5lckhpZ2hsaWdodCIsIm9wdGlvbnMiLCJtdXRhdGUiLCJpbm5lckhpZ2hsaWdodFBhdGgiLCJoaWdobGlnaHRDaGFuZ2VkRW1pdHRlciIsImVtaXQiLCJzZXREYXNoZWQiLCJkYXNoT24iLCJsaW5lRGFzaCIsInNldFNoYXBlIiwic2hhcGUiLCJ1cGRhdGVMaW5lV2lkdGgiLCJtYXRyaXgiLCJsaW5lV2lkdGgiLCJnZXRPdXRlckxpbmVXaWR0aCIsImdldElubmVyTGluZVdpZHRoIiwib3V0ZXJMaW5lV2lkdGgiLCJnZXRPdXRlckxpbmVXaWR0aEZyb21NYXRyaXgiLCJpbm5lckxpbmVXaWR0aCIsImdldElubmVyTGluZVdpZHRoRnJvbU1hdHJpeCIsInNldElubmVySGlnaGxpZ2h0Q29sb3IiLCJjb2xvciIsIl9pbm5lckhpZ2hsaWdodENvbG9yIiwic2V0U3Ryb2tlIiwiaW5uZXJIaWdobGlnaHRDb2xvciIsImdldElubmVySGlnaGxpZ2h0Q29sb3IiLCJzZXRPdXRlckhpZ2hsaWdodENvbG9yIiwiX291dGVySGlnaGxpZ2h0Q29sb3IiLCJvdXRlckhpZ2hsaWdodENvbG9yIiwiZ2V0T3V0ZXJIaWdobGlnaHRDb2xvciIsImdldFVuaXF1ZUhpZ2hsaWdodFRyYWlsIiwiZm9jdXNlZFRyYWlsIiwiYXNzZXJ0IiwidHJhbnNmb3JtU291cmNlTm9kZSIsInVuaXF1ZVRyYWlsIiwiaW5zdGFuY2VzIiwibGVuZ3RoIiwiZ2V0VW5pcXVlVHJhaWwiLCJleHRlbmRlZFRyYWlscyIsImdldFRyYWlscyIsImZpbHRlciIsInRyYWlsIiwiaXNFeHRlbnNpb25PZiIsImxvY2FsVG9HbG9iYWxTY2FsZUZyb21NYXRyaXgiLCJNYXRoIiwic3FydCIsIm0wMCIsIm0xMCIsImdldERpbGF0aW9uQ29lZmZpY2llbnQiLCJ3aWR0aE9mRm9jdXNIaWdobGlnaHQiLCJzY2FsYXJUb0VkZ2VPZkJvdW5kcyIsIndoaXRlU3BhY2VTY2FsYXIiLCJnZXREZWZhdWx0RGlsYXRpb25Db2VmZmljaWVudCIsIklERU5USVRZIiwiZ2V0RGVmYXVsdEdyb3VwRGlsYXRpb25Db2VmZmljaWVudCIsImdldEdyb3VwRGlsYXRpb25Db2VmZmljaWVudCIsImdldERlZmF1bHRIaWdobGlnaHRMaW5lV2lkdGgiLCJnZXRQYW5ab29tQ29ycmVjdGluZ01hdHJpeCIsImluaXRpYWxpemVkIiwibGlzdGVuZXIiLCJtYXRyaXhQcm9wZXJ0eSIsInZhbHVlIiwiaW52ZXJ0ZWQiLCJnZXRMYXlvdXRDb3JyZWN0aW5nTWF0cml4Iiwic2NhbGluZyIsImxheW91dFNjYWxlIiwiZ2V0Q29ycmVjdGl2ZVNjYWxpbmdNYXRyaXgiLCJ0aW1lc01hdHJpeCIsInByb3ZpZGVkT3B0aW9ucyIsIm91dGVyU3Ryb2tlIiwiaW5uZXJTdHJva2UiLCJkYXNoZWQiLCJwYXRoT3B0aW9ucyIsIl8iLCJwaWNrIiwiT2JqZWN0Iiwia2V5cyIsIkRFRkFVTFRfUEFUSF9PUFRJT05TIiwic3Ryb2tlIiwiaW5uZXJIaWdobGlnaHRPcHRpb25zIiwiYWRkQ2hpbGQiLCJyZWdpc3RlciJdLCJtYXBwaW5ncyI6IkFBQUEsc0RBQXNEO0FBRXREOzs7Ozs7OztDQVFDLEdBRUQsT0FBT0EsYUFBYSw4QkFBOEI7QUFFbEQsT0FBT0MsYUFBYSw2QkFBNkI7QUFDakQsT0FBT0MsYUFBYUMsY0FBYyxRQUFRLHFDQUFxQztBQUUvRSxTQUFTQyx3QkFBd0IsRUFBRUMsS0FBSyxFQUFvQkMsSUFBSSxFQUFlQyxPQUFPLFFBQXVCLGdCQUFnQjtBQUU3SCxZQUFZO0FBQ1osMERBQTBEO0FBQzFELE1BQU1DLG9CQUFvQixJQUFJSCxNQUFPO0FBQ3JDLE1BQU1JLG9CQUFvQixJQUFJSixNQUFPO0FBRXJDLGtIQUFrSDtBQUNsSCxNQUFNSyxnQ0FBZ0MsSUFBSUwsTUFBTztBQUNqRCxNQUFNTSxnQ0FBZ0MsSUFBSU4sTUFBTztBQUVqRCxrSEFBa0g7QUFDbEgsTUFBTU8sK0JBQStCLElBQUlQLE1BQU87QUFDaEQsTUFBTVEsK0JBQStCLElBQUlSLE1BQU87QUFFaEQsdUhBQXVIO0FBQ3ZILE1BQU1TLHdCQUF3QjtBQUM5QixNQUFNQyx3QkFBd0I7QUFFOUIsNkZBQTZGO0FBQzdGLE1BQU1DLHlCQUF5QjtBQUMvQixNQUFNQyx5QkFBeUI7QUF5Qi9CLElBQUEsQUFBTUMsZ0JBQU4sTUFBTUEsc0JBQXNCWjtJQThFMUI7O0dBRUMsR0FDRCxBQUFPYSx5QkFBMEJDLE9BQW9CLEVBQVM7UUFDNUQsS0FBSyxDQUFDQyxPQUFRRDtRQUNkLElBQUksQ0FBQ0Us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