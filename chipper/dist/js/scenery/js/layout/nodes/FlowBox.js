// Copyright 2021-2024, University of Colorado Boulder
/**
 * A vertical/horizontal flow-based layout container.
 *
 * See https://phetsims.github.io/scenery/doc/layout#FlowBox for details
 *
 * FlowBox-only options:
 *   - resize (see https://phetsims.github.io/scenery/doc/layout#FlowBox-resize)
 *   - orientation (see https://phetsims.github.io/scenery/doc/layout#FlowBox-orientation)
 *   - spacing (see https://phetsims.github.io/scenery/doc/layout#FlowBox-spacing)
 *   - lineSpacing (see https://phetsims.github.io/scenery/doc/layout#FlowBox-lineSpacing)
 *   - justify (see https://phetsims.github.io/scenery/doc/layout#FlowBox-justify)
 *   - justifyLines (see https://phetsims.github.io/scenery/doc/layout#FlowBox-justifyLines)
 *   - wrap (see https://phetsims.github.io/scenery/doc/layout#FlowBox-wrap)
 *   - layoutOrigin (see https://phetsims.github.io/scenery/doc/layout#layoutOrigin)
 *
 * FlowBox and layoutOptions options (can be set either in the FlowBox itself, or within its child nodes' layoutOptions):
 *   - align (see https://phetsims.github.io/scenery/doc/layout#FlowBox-align)
 *   - stretch (see https://phetsims.github.io/scenery/doc/layout#FlowBox-stretch)
 *   - grow (see https://phetsims.github.io/scenery/doc/layout#FlowBox-grow)
 *   - cellAlign (see https://phetsims.github.io/scenery/doc/layout#FlowBox-cellAlign)
 *   - margin (see https://phetsims.github.io/scenery/doc/layout#FlowBox-margins)
 *   - xMargin (see https://phetsims.github.io/scenery/doc/layout#FlowBox-margins)
 *   - yMargin (see https://phetsims.github.io/scenery/doc/layout#FlowBox-margins)
 *   - leftMargin (see https://phetsims.github.io/scenery/doc/layout#FlowBox-margins)
 *   - rightMargin (see https://phetsims.github.io/scenery/doc/layout#FlowBox-margins)
 *   - topMargin (see https://phetsims.github.io/scenery/doc/layout#FlowBox-margins)
 *   - bottomMargin (see https://phetsims.github.io/scenery/doc/layout#FlowBox-margins)
 *   - minContentWidth (see https://phetsims.github.io/scenery/doc/layout#FlowBox-minContent)
 *   - minContentHeight (see https://phetsims.github.io/scenery/doc/layout#FlowBox-minContent)
 *   - maxContentWidth (see https://phetsims.github.io/scenery/doc/layout#FlowBox-maxContent)
 *   - maxContentHeight (see https://phetsims.github.io/scenery/doc/layout#FlowBox-maxContent)
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ import optionize from '../../../../phet-core/js/optionize.js';
import Orientation from '../../../../phet-core/js/Orientation.js';
import { FLOW_CONSTRAINT_OPTION_KEYS, FlowCell, FlowConstraint, LAYOUT_NODE_OPTION_KEYS, LayoutAlign, LayoutNode, MarginLayoutCell, Node, REQUIRES_BOUNDS_OPTION_KEYS, scenery, SceneryConstants, SIZABLE_OPTION_KEYS } from '../../imports.js';
// FlowBox-specific options that can be passed in the constructor or mutate() call.
const FLOWBOX_OPTION_KEYS = [
    ...LAYOUT_NODE_OPTION_KEYS,
    ...FLOW_CONSTRAINT_OPTION_KEYS.filter((key)=>key !== 'excludeInvisible')
];
const DEFAULT_OPTIONS = {
    orientation: 'horizontal',
    spacing: 0,
    align: 'center',
    stretch: false
};
let FlowBox = class FlowBox extends LayoutNode {
    /**
   * Called when a child is inserted.
   */ onFlowBoxChildInserted(node, index) {
        const cell = new FlowCell(this._constraint, node, this._constraint.createLayoutProxy(node));
        this._cellMap.set(node, cell);
        this._constraint.insertCell(index, cell);
    }
    /**
   * Called when a child is removed.
   */ onFlowBoxChildRemoved(node) {
        const cell = this._cellMap.get(node);
        assert && assert(cell);
        this._cellMap.delete(node);
        this._constraint.removeCell(cell);
        cell.dispose();
    }
    /**
   * Called when children are rearranged
   */ onFlowBoxChildrenReordered(minChangeIndex, maxChangeIndex) {
        this._constraint.reorderCells(this._children.slice(minChangeIndex, maxChangeIndex + 1).map((node)=>this._cellMap.get(node)), minChangeIndex, maxChangeIndex);
    }
    /**
   * Called on change of children (child added, removed, order changed, etc.)
   */ onFlowBoxChildrenChanged() {
        this._constraint.updateLayoutAutomatically();
    }
    getCell(node) {
        const result = this._cellMap.get(node);
        assert && assert(result);
        return result;
    }
    get orientation() {
        return this._constraint.orientation;
    }
    set orientation(value) {
        this._constraint.orientation = value;
    }
    get spacing() {
        return this._constraint.spacing;
    }
    set spacing(value) {
        this._constraint.spacing = value;
    }
    get lineSpacing() {
        return this._constraint.lineSpacing;
    }
    set lineSpacing(value) {
        this._constraint.lineSpacing = value;
    }
    get justify() {
        return this._constraint.justify;
    }
    set justify(value) {
        this._constraint.justify = value;
    }
    get justifyLines() {
        return this._constraint.justifyLines;
    }
    set justifyLines(value) {
        this._constraint.justifyLines = value;
    }
    get wrap() {
        return this._constraint.wrap;
    }
    set wrap(value) {
        this._constraint.wrap = value;
    }
    get align() {
        assert && assert(typeof this._constraint.align === 'string');
        return this._constraint.align;
    }
    set align(value) {
        this._constraint.align = value;
    }
    get stretch() {
        assert && assert(typeof this._constraint.stretch === 'boolean');
        return this._constraint.stretch;
    }
    set stretch(value) {
        this._constraint.stretch = value;
    }
    get grow() {
        return this._constraint.grow;
    }
    set grow(value) {
        this._constraint.grow = value;
    }
    get margin() {
        return this._constraint.margin;
    }
    set margin(value) {
        this._constraint.margin = value;
    }
    get xMargin() {
        return this._constraint.xMargin;
    }
    set xMargin(value) {
        this._constraint.xMargin = value;
    }
    get yMargin() {
        return this._constraint.yMargin;
    }
    set yMargin(value) {
        this._constraint.yMargin = value;
    }
    get leftMargin() {
        return this._constraint.leftMargin;
    }
    set leftMargin(value) {
        this._constraint.leftMargin = value;
    }
    get rightMargin() {
        return this._constraint.rightMargin;
    }
    set rightMargin(value) {
        this._constraint.rightMargin = value;
    }
    get topMargin() {
        return this._constraint.topMargin;
    }
    set topMargin(value) {
        this._constraint.topMargin = value;
    }
    get bottomMargin() {
        return this._constraint.bottomMargin;
    }
    set bottomMargin(value) {
        this._constraint.bottomMargin = value;
    }
    get minContentWidth() {
        return this._constraint.minContentWidth;
    }
    set minContentWidth(value) {
        this._constraint.minContentWidth = value;
    }
    get minContentHeight() {
        return this._constraint.minContentHeight;
    }
    set minContentHeight(value) {
        this._constraint.minContentHeight = value;
    }
    get maxContentWidth() {
        return this._constraint.maxContentWidth;
    }
    set maxContentWidth(value) {
        this._constraint.maxContentWidth = value;
    }
    get maxContentHeight() {
        return this._constraint.maxContentHeight;
    }
    set maxContentHeight(value) {
        this._constraint.maxContentHeight = value;
    }
    /**
   * Releases references
   */ dispose() {
        // Lock our layout forever
        this._constraint.lock();
        this.childInsertedEmitter.removeListener(this.onChildInserted);
        this.childRemovedEmitter.removeListener(this.onChildRemoved);
        this.childrenReorderedEmitter.removeListener(this.onChildrenReordered);
        this.childrenChangedEmitter.removeListener(this.onChildrenChanged);
        // Dispose our cells here. We won't be getting the children-removed listeners fired (we removed them above)
        for (const cell of this._cellMap.values()){
            cell.dispose();
        }
        super.dispose();
    }
    // LayoutBox Compatibility (see the ES5 setters/getters, or the options doc)
    setOrientation(orientation) {
        this.orientation = orientation;
        return this;
    }
    getOrientation() {
        return this.orientation;
    }
    setSpacing(spacing) {
        this.spacing = spacing;
        return this;
    }
    getSpacing() {
        return this.spacing;
    }
    setAlign(align) {
        this.align = align;
        return this;
    }
    getAlign() {
        return this.align;
    }
    setResize(resize) {
        this.resize = resize;
        return this;
    }
    isResize() {
        return this.resize;
    }
    getHelperNode() {
        const marginsNode = MarginLayoutCell.createHelperNode(this.constraint.displayedCells, this.constraint.layoutBoundsProperty.value, (cell)=>{
            let str = '';
            const internalOrientation = Orientation.fromLayoutOrientation(cell.orientation);
            str += `align: ${LayoutAlign.internalToAlign(internalOrientation, cell.effectiveAlign)}\n`;
            str += `stretch: ${cell.effectiveStretch}\n`;
            str += `grow: ${cell.effectiveGrow}\n`;
            return str;
        });
        return marginsNode;
    }
    mutate(options) {
        return super.mutate(options);
    }
    constructor(providedOptions){
        const options = optionize()({
            // Allow dynamic layout by default, see https://github.com/phetsims/joist/issues/608
            excludeInvisibleChildrenFromBounds: true,
            resize: true,
            // For LayoutBox compatibility
            disabledOpacity: SceneryConstants.DISABLED_OPACITY
        }, providedOptions);
        super(), // Track the connection between Nodes and cells
        this._cellMap = new Map();
        this._constraint = new FlowConstraint(this, {
            preferredWidthProperty: this.localPreferredWidthProperty,
            preferredHeightProperty: this.localPreferredHeightProperty,
            minimumWidthProperty: this.localMinimumWidthProperty,
            minimumHeightProperty: this.localMinimumHeightProperty,
            layoutOriginProperty: this.layoutOriginProperty,
            orientation: DEFAULT_OPTIONS.orientation,
            spacing: DEFAULT_OPTIONS.spacing,
            align: DEFAULT_OPTIONS.align,
            stretch: DEFAULT_OPTIONS.stretch,
            excludeInvisible: false // Should be handled by the options mutate below
        });
        this.onChildInserted = this.onFlowBoxChildInserted.bind(this);
        this.onChildRemoved = this.onFlowBoxChildRemoved.bind(this);
        this.onChildrenReordered = this.onFlowBoxChildrenReordered.bind(this);
        this.onChildrenChanged = this.onFlowBoxChildrenChanged.bind(this);
        this.childInsertedEmitter.addListener(this.onChildInserted);
        this.childRemovedEmitter.addListener(this.onChildRemoved);
        this.childrenReorderedEmitter.addListener(this.onChildrenReordered);
        this.childrenChangedEmitter.addListener(this.onChildrenChanged);
        const nonBoundsOptions = _.omit(options, REQUIRES_BOUNDS_OPTION_KEYS);
        const boundsOptions = _.pick(options, REQUIRES_BOUNDS_OPTION_KEYS);
        // Before we do layout, do non-bounds-related changes (in case we have resize:false), and prevent layout for
        // performance gains.
        this._constraint.lock();
        this.mutate(nonBoundsOptions);
        this._constraint.unlock();
        // Update the layout (so that it is done once if we have resize:false)
        this._constraint.updateLayout();
        // After we have our localBounds complete, now we can mutate things that rely on it.
        this.mutate(boundsOptions);
        this.linkLayoutBounds();
    }
};
FlowBox.DEFAULT_FLOW_BOX_OPTIONS = DEFAULT_OPTIONS;
export { FlowBox as default };
/**
 * {Array.<string>} - String keys for all of the allowed options that will be set by node.mutate( options ), in the
 * order they will be evaluated in.
 *
 * NOTE: See Node's _mutatorKeys documentation for more information on how this operates, and potential special
 *       cases that may apply.
 */ FlowBox.prototype._mutatorKeys = [
    ...SIZABLE_OPTION_KEYS,
    ...FLOWBOX_OPTION_KEYS,
    ...Node.prototype._mutatorKeys
];
scenery.register('FlowBox', FlowBox);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvbGF5b3V0L25vZGVzL0Zsb3dCb3gudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjEtMjAyNCwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbi8qKlxuICogQSB2ZXJ0aWNhbC9ob3Jpem9udGFsIGZsb3ctYmFzZWQgbGF5b3V0IGNvbnRhaW5lci5cbiAqXG4gKiBTZWUgaHR0cHM6Ly9waGV0c2ltcy5naXRodWIuaW8vc2NlbmVyeS9kb2MvbGF5b3V0I0Zsb3dCb3ggZm9yIGRldGFpbHNcbiAqXG4gKiBGbG93Qm94LW9ubHkgb3B0aW9uczpcbiAqICAgLSByZXNpemUgKHNlZSBodHRwczovL3BoZXRzaW1zLmdpdGh1Yi5pby9zY2VuZXJ5L2RvYy9sYXlvdXQjRmxvd0JveC1yZXNpemUpXG4gKiAgIC0gb3JpZW50YXRpb24gKHNlZSBodHRwczovL3BoZXRzaW1zLmdpdGh1Yi5pby9zY2VuZXJ5L2RvYy9sYXlvdXQjRmxvd0JveC1vcmllbnRhdGlvbilcbiAqICAgLSBzcGFjaW5nIChzZWUgaHR0cHM6Ly9waGV0c2ltcy5naXRodWIuaW8vc2NlbmVyeS9kb2MvbGF5b3V0I0Zsb3dCb3gtc3BhY2luZylcbiAqICAgLSBsaW5lU3BhY2luZyAoc2VlIGh0dHBzOi8vcGhldHNpbXMuZ2l0aHViLmlvL3NjZW5lcnkvZG9jL2xheW91dCNGbG93Qm94LWxpbmVTcGFjaW5nKVxuICogICAtIGp1c3RpZnkgKHNlZSBodHRwczovL3BoZXRzaW1zLmdpdGh1Yi5pby9zY2VuZXJ5L2RvYy9sYXlvdXQjRmxvd0JveC1qdXN0aWZ5KVxuICogICAtIGp1c3RpZnlMaW5lcyAoc2VlIGh0dHBzOi8vcGhldHNpbXMuZ2l0aHViLmlvL3NjZW5lcnkvZG9jL2xheW91dCNGbG93Qm94LWp1c3RpZnlMaW5lcylcbiAqICAgLSB3cmFwIChzZWUgaHR0cHM6Ly9waGV0c2ltcy5naXRodWIuaW8vc2NlbmVyeS9kb2MvbGF5b3V0I0Zsb3dCb3gtd3JhcClcbiAqICAgLSBsYXlvdXRPcmlnaW4gKHNlZSBodHRwczovL3BoZXRzaW1zLmdpdGh1Yi5pby9zY2VuZXJ5L2RvYy9sYXlvdXQjbGF5b3V0T3JpZ2luKVxuICpcbiAqIEZsb3dCb3ggYW5kIGxheW91dE9wdGlvbnMgb3B0aW9ucyAoY2FuIGJlIHNldCBlaXRoZXIgaW4gdGhlIEZsb3dCb3ggaXRzZWxmLCBvciB3aXRoaW4gaXRzIGNoaWxkIG5vZGVzJyBsYXlvdXRPcHRpb25zKTpcbiAqICAgLSBhbGlnbiAoc2VlIGh0dHBzOi8vcGhldHNpbXMuZ2l0aHViLmlvL3NjZW5lcnkvZG9jL2xheW91dCNGbG93Qm94LWFsaWduKVxuICogICAtIHN0cmV0Y2ggKHNlZSBodHRwczovL3BoZXRzaW1zLmdpdGh1Yi5pby9zY2VuZXJ5L2RvYy9sYXlvdXQjRmxvd0JveC1zdHJldGNoKVxuICogICAtIGdyb3cgKHNlZSBodHRwczovL3BoZXRzaW1zLmdpdGh1Yi5pby9zY2VuZXJ5L2RvYy9sYXlvdXQjRmxvd0JveC1ncm93KVxuICogICAtIGNlbGxBbGlnbiAoc2VlIGh0dHBzOi8vcGhldHNpbXMuZ2l0aHViLmlvL3NjZW5lcnkvZG9jL2xheW91dCNGbG93Qm94LWNlbGxBbGlnbilcbiAqICAgLSBtYXJnaW4gKHNlZSBodHRwczovL3BoZXRzaW1zLmdpdGh1Yi5pby9zY2VuZXJ5L2RvYy9sYXlvdXQjRmxvd0JveC1tYXJnaW5zKVxuICogICAtIHhNYXJnaW4gKHNlZSBodHRwczovL3BoZXRzaW1zLmdpdGh1Yi5pby9zY2VuZXJ5L2RvYy9sYXlvdXQjRmxvd0JveC1tYXJnaW5zKVxuICogICAtIHlNYXJnaW4gKHNlZSBodHRwczovL3BoZXRzaW1zLmdpdGh1Yi5pby9zY2VuZXJ5L2RvYy9sYXlvdXQjRmxvd0JveC1tYXJnaW5zKVxuICogICAtIGxlZnRNYXJnaW4gKHNlZSBodHRwczovL3BoZXRzaW1zLmdpdGh1Yi5pby9zY2VuZXJ5L2RvYy9sYXlvdXQjRmxvd0JveC1tYXJnaW5zKVxuICogICAtIHJpZ2h0TWFyZ2luIChzZWUgaHR0cHM6Ly9waGV0c2ltcy5naXRodWIuaW8vc2NlbmVyeS9kb2MvbGF5b3V0I0Zsb3dCb3gtbWFyZ2lucylcbiAqICAgLSB0b3BNYXJnaW4gKHNlZSBodHRwczovL3BoZXRzaW1zLmdpdGh1Yi5pby9zY2VuZXJ5L2RvYy9sYXlvdXQjRmxvd0JveC1tYXJnaW5zKVxuICogICAtIGJvdHRvbU1hcmdpbiAoc2VlIGh0dHBzOi8vcGhldHNpbXMuZ2l0aHViLmlvL3NjZW5lcnkvZG9jL2xheW91dCNGbG93Qm94LW1hcmdpbnMpXG4gKiAgIC0gbWluQ29udGVudFdpZHRoIChzZWUgaHR0cHM6Ly9waGV0c2ltcy5naXRodWIuaW8vc2NlbmVyeS9kb2MvbGF5b3V0I0Zsb3dCb3gtbWluQ29udGVudClcbiAqICAgLSBtaW5Db250ZW50SGVpZ2h0IChzZWUgaHR0cHM6Ly9waGV0c2ltcy5naXRodWIuaW8vc2NlbmVyeS9kb2MvbGF5b3V0I0Zsb3dCb3gtbWluQ29udGVudClcbiAqICAgLSBtYXhDb250ZW50V2lkdGggKHNlZSBodHRwczovL3BoZXRzaW1zLmdpdGh1Yi5pby9zY2VuZXJ5L2RvYy9sYXlvdXQjRmxvd0JveC1tYXhDb250ZW50KVxuICogICAtIG1heENvbnRlbnRIZWlnaHQgKHNlZSBodHRwczovL3BoZXRzaW1zLmdpdGh1Yi5pby9zY2VuZXJ5L2RvYy9sYXlvdXQjRmxvd0JveC1tYXhDb250ZW50KVxuICpcbiAqIEBhdXRob3IgSm9uYXRoYW4gT2xzb24gPGpvbmF0aGFuLm9sc29uQGNvbG9yYWRvLmVkdT5cbiAqL1xuXG5pbXBvcnQgb3B0aW9uaXplIGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9vcHRpb25pemUuanMnO1xuaW1wb3J0IE9yaWVudGF0aW9uIGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9PcmllbnRhdGlvbi5qcyc7XG5pbXBvcnQgU3RyaWN0T21pdCBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvdHlwZXMvU3RyaWN0T21pdC5qcyc7XG5pbXBvcnQgeyBGTE9XX0NPTlNUUkFJTlRfT1BUSU9OX0tFWVMsIEZsb3dDZWxsLCBGbG93Q29uc3RyYWludCwgRmxvd0NvbnN0cmFpbnRPcHRpb25zLCBIb3Jpem9udGFsTGF5b3V0QWxpZ24sIEhvcml6b250YWxMYXlvdXRKdXN0aWZpY2F0aW9uLCBMQVlPVVRfTk9ERV9PUFRJT05fS0VZUywgTGF5b3V0QWxpZ24sIExheW91dE5vZGUsIExheW91dE5vZGVPcHRpb25zLCBMYXlvdXRPcmllbnRhdGlvbiwgTWFyZ2luTGF5b3V0Q2VsbCwgTm9kZSwgUkVRVUlSRVNfQk9VTkRTX09QVElPTl9LRVlTLCBzY2VuZXJ5LCBTY2VuZXJ5Q29uc3RhbnRzLCBTSVpBQkxFX09QVElPTl9LRVlTLCBWZXJ0aWNhbExheW91dEFsaWduLCBWZXJ0aWNhbExheW91dEp1c3RpZmljYXRpb24gfSBmcm9tICcuLi8uLi9pbXBvcnRzLmpzJztcblxuLy8gRmxvd0JveC1zcGVjaWZpYyBvcHRpb25zIHRoYXQgY2FuIGJlIHBhc3NlZCBpbiB0aGUgY29uc3RydWN0b3Igb3IgbXV0YXRlKCkgY2FsbC5cbmNvbnN0IEZMT1dCT1hfT1BUSU9OX0tFWVMgPSBbXG4gIC4uLkxBWU9VVF9OT0RFX09QVElPTl9LRVlTLFxuICAuLi5GTE9XX0NPTlNUUkFJTlRfT1BUSU9OX0tFWVMuZmlsdGVyKCBrZXkgPT4ga2V5ICE9PSAnZXhjbHVkZUludmlzaWJsZScgKVxuXTtcblxuY29uc3QgREVGQVVMVF9PUFRJT05TID0ge1xuICBvcmllbnRhdGlvbjogJ2hvcml6b250YWwnLFxuICBzcGFjaW5nOiAwLFxuICBhbGlnbjogJ2NlbnRlcicsXG4gIHN0cmV0Y2g6IGZhbHNlXG59IGFzIGNvbnN0O1xuXG50eXBlIEV4Y2x1ZGVGbG93Q29uc3RyYWludE9wdGlvbnMgPSAnZXhjbHVkZUludmlzaWJsZScgfCAncHJlZmVycmVkV2lkdGhQcm9wZXJ0eScgfCAncHJlZmVycmVkSGVpZ2h0UHJvcGVydHknIHwgJ21pbmltdW1XaWR0aFByb3BlcnR5JyB8ICdtaW5pbXVtSGVpZ2h0UHJvcGVydHknIHwgJ2xheW91dE9yaWdpblByb3BlcnR5JztcbnR5cGUgU2VsZk9wdGlvbnMgPSB7XG4gIC8vIENvbnRyb2xzIHdoZXRoZXIgdGhlIEZsb3dCb3ggd2lsbCByZS10cmlnZ2VyIGxheW91dCBhdXRvbWF0aWNhbGx5IGFmdGVyIHRoZSBcImZpcnN0XCIgbGF5b3V0IGR1cmluZyBjb25zdHJ1Y3Rpb24uXG4gIC8vIFRoZSBGbG93Qm94IHdpbGwgbGF5b3V0IG9uY2UgYWZ0ZXIgcHJvY2Vzc2luZyB0aGUgb3B0aW9ucyBvYmplY3QsIGJ1dCBpZiByZXNpemU6ZmFsc2UsIHRoZW4gYWZ0ZXIgdGhhdCBtYW51YWxcbiAgLy8gbGF5b3V0IGNhbGxzIHdpbGwgbmVlZCB0byBiZSBkb25lICh3aXRoIHVwZGF0ZUxheW91dCgpKVxuICByZXNpemU/OiBib29sZWFuO1xufSAmIFN0cmljdE9taXQ8Rmxvd0NvbnN0cmFpbnRPcHRpb25zLCBFeGNsdWRlRmxvd0NvbnN0cmFpbnRPcHRpb25zPjtcblxuZXhwb3J0IHR5cGUgRmxvd0JveE9wdGlvbnMgPSBTZWxmT3B0aW9ucyAmIExheW91dE5vZGVPcHRpb25zO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBGbG93Qm94IGV4dGVuZHMgTGF5b3V0Tm9kZTxGbG93Q29uc3RyYWludD4ge1xuXG4gIC8vIFRyYWNrIHRoZSBjb25uZWN0aW9uIGJldHdlZW4gTm9kZXMgYW5kIGNlbGxzXG4gIHByaXZhdGUgcmVhZG9ubHkgX2NlbGxNYXA6IE1hcDxOb2RlLCBGbG93Q2VsbD4gPSBuZXcgTWFwPE5vZGUsIEZsb3dDZWxsPigpO1xuXG4gIC8vIExpc3RlbmVycyB0aGF0IHdlJ2xsIG5lZWQgdG8gcmVtb3ZlXG4gIHByaXZhdGUgcmVhZG9ubHkgb25DaGlsZEluc2VydGVkOiAoIG5vZGU6IE5vZGUsIGluZGV4OiBudW1iZXIgKSA9PiB2b2lkO1xuICBwcml2YXRlIHJlYWRvbmx5IG9uQ2hpbGRSZW1vdmVkOiAoIG5vZGU6IE5vZGUgKSA9PiB2b2lkO1xuICBwcml2YXRlIHJlYWRvbmx5IG9uQ2hpbGRyZW5SZW9yZGVyZWQ6ICggbWluQ2hhbmdlSW5kZXg6IG51bWJlciwgbWF4Q2hhbmdlSW5kZXg6IG51bWJlciApID0+IHZvaWQ7XG4gIHByaXZhdGUgcmVhZG9ubHkgb25DaGlsZHJlbkNoYW5nZWQ6ICgpID0+IHZvaWQ7XG5cbiAgcHVibGljIGNvbnN0cnVjdG9yKCBwcm92aWRlZE9wdGlvbnM/OiBGbG93Qm94T3B0aW9ucyApIHtcbiAgICBjb25zdCBvcHRpb25zID0gb3B0aW9uaXplPEZsb3dCb3hPcHRpb25zLCBTdHJpY3RPbWl0PFNlbGZPcHRpb25zLCBFeGNsdWRlPGtleW9mIEZsb3dDb25zdHJhaW50T3B0aW9ucywgRXhjbHVkZUZsb3dDb25zdHJhaW50T3B0aW9ucz4+LCBMYXlvdXROb2RlT3B0aW9ucz4oKSgge1xuICAgICAgLy8gQWxsb3cgZHluYW1pYyBsYXlvdXQgYnkgZGVmYXVsdCwgc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9qb2lzdC9pc3N1ZXMvNjA4XG4gICAgICBleGNsdWRlSW52aXNpYmxlQ2hpbGRyZW5Gcm9tQm91bmRzOiB0cnVlLFxuICAgICAgcmVzaXplOiB0cnVlLFxuXG4gICAgICAvLyBGb3IgTGF5b3V0Qm94IGNvbXBhdGliaWxpdHlcbiAgICAgIGRpc2FibGVkT3BhY2l0eTogU2NlbmVyeUNvbnN0YW50cy5ESVNBQkxFRF9PUEFDSVRZXG4gICAgfSwgcHJvdmlkZWRPcHRpb25zICk7XG5cbiAgICBzdXBlcigpO1xuXG4gICAgdGhpcy5fY29uc3RyYWludCA9IG5ldyBGbG93Q29uc3RyYWludCggdGhpcywge1xuICAgICAgcHJlZmVycmVkV2lkdGhQcm9wZXJ0eTogdGhpcy5sb2NhbFByZWZlcnJlZFdpZHRoUHJvcGVydHksXG4gICAgICBwcmVmZXJyZWRIZWlnaHRQcm9wZXJ0eTogdGhpcy5sb2NhbFByZWZlcnJlZEhlaWdodFByb3BlcnR5LFxuICAgICAgbWluaW11bVdpZHRoUHJvcGVydHk6IHRoaXMubG9jYWxNaW5pbXVtV2lkdGhQcm9wZXJ0eSxcbiAgICAgIG1pbmltdW1IZWlnaHRQcm9wZXJ0eTogdGhpcy5sb2NhbE1pbmltdW1IZWlnaHRQcm9wZXJ0eSxcbiAgICAgIGxheW91dE9yaWdpblByb3BlcnR5OiB0aGlzLmxheW91dE9yaWdpblByb3BlcnR5LFxuXG4gICAgICBvcmllbnRhdGlvbjogREVGQVVMVF9PUFRJT05TLm9yaWVudGF0aW9uLFxuICAgICAgc3BhY2luZzogREVGQVVMVF9PUFRJT05TLnNwYWNpbmcsXG4gICAgICBhbGlnbjogREVGQVVMVF9PUFRJT05TLmFsaWduLFxuICAgICAgc3RyZXRjaDogREVGQVVMVF9PUFRJT05TLnN0cmV0Y2gsXG4gICAgICBleGNsdWRlSW52aXNpYmxlOiBmYWxzZSAvLyBTaG91bGQgYmUgaGFuZGxlZCBieSB0aGUgb3B0aW9ucyBtdXRhdGUgYmVsb3dcbiAgICB9ICk7XG5cbiAgICB0aGlzLm9uQ2hpbGRJbnNlcnRlZCA9IHRoaXMub25GbG93Qm94Q2hpbGRJbnNlcnRlZC5iaW5kKCB0aGlzICk7XG4gICAgdGhpcy5vbkNoaWxkUmVtb3ZlZCA9IHRoaXMub25GbG93Qm94Q2hpbGRSZW1vdmVkLmJpbmQoIHRoaXMgKTtcbiAgICB0aGlzLm9uQ2hpbGRyZW5SZW9yZGVyZWQgPSB0aGlzLm9uRmxvd0JveENoaWxkcmVuUmVvcmRlcmVkLmJpbmQoIHRoaXMgKTtcbiAgICB0aGlzLm9uQ2hpbGRyZW5DaGFuZ2VkID0gdGhpcy5vbkZsb3dCb3hDaGlsZHJlbkNoYW5nZWQuYmluZCggdGhpcyApO1xuXG4gICAgdGhpcy5jaGlsZEluc2VydGVkRW1pdHRlci5hZGRMaXN0ZW5lciggdGhpcy5vbkNoaWxkSW5zZXJ0ZWQgKTtcbiAgICB0aGlzLmNoaWxkUmVtb3ZlZEVtaXR0ZXIuYWRkTGlzdGVuZXIoIHRoaXMub25DaGlsZFJlbW92ZWQgKTtcbiAgICB0aGlzLmNoaWxkcmVuUmVvcmRlcmVkRW1pdHRlci5hZGRMaXN0ZW5lciggdGhpcy5vbkNoaWxkcmVuUmVvcmRlcmVkICk7XG4gICAgdGhpcy5jaGlsZHJlbkNoYW5nZWRFbWl0dGVyLmFkZExpc3RlbmVyKCB0aGlzLm9uQ2hpbGRyZW5DaGFuZ2VkICk7XG5cbiAgICBjb25zdCBub25Cb3VuZHNPcHRpb25zID0gXy5vbWl0KCBvcHRpb25zLCBSRVFVSVJFU19CT1VORFNfT1BUSU9OX0tFWVMgKSBhcyBMYXlvdXROb2RlT3B0aW9ucztcbiAgICBjb25zdCBib3VuZHNPcHRpb25zID0gXy5waWNrKCBvcHRpb25zLCBSRVFVSVJFU19CT1VORFNfT1BUSU9OX0tFWVMgKSBhcyBMYXlvdXROb2RlT3B0aW9ucztcblxuICAgIC8vIEJlZm9yZSB3ZSBkbyBsYXlvdXQsIGRvIG5vbi1ib3VuZHMtcmVsYXRlZCBjaGFuZ2VzIChpbiBjYXNlIHdlIGhhdmUgcmVzaXplOmZhbHNlKSwgYW5kIHByZXZlbnQgbGF5b3V0IGZvclxuICAgIC8vIHBlcmZvcm1hbmNlIGdhaW5zLlxuICAgIHRoaXMuX2NvbnN0cmFpbnQubG9jaygpO1xuICAgIHRoaXMubXV0YXRlKCBub25Cb3VuZHNPcHRpb25zICk7XG4gICAgdGhpcy5fY29uc3RyYWludC51bmxvY2soKTtcblxuICAgIC8vIFVwZGF0ZSB0aGUgbGF5b3V0IChzbyB0aGF0IGl0IGlzIGRvbmUgb25jZSBpZiB3ZSBoYXZlIHJlc2l6ZTpmYWxzZSlcbiAgICB0aGlzLl9jb25zdHJhaW50LnVwZGF0ZUxheW91dCgpO1xuXG4gICAgLy8gQWZ0ZXIgd2UgaGF2ZSBvdXIgbG9jYWxCb3VuZHMgY29tcGxldGUsIG5vdyB3ZSBjYW4gbXV0YXRlIHRoaW5ncyB0aGF0IHJlbHkgb24gaXQuXG4gICAgdGhpcy5tdXRhdGUoIGJvdW5kc09wdGlvbnMgKTtcblxuICAgIHRoaXMubGlua0xheW91dEJvdW5kcygpO1xuICB9XG5cbiAgLyoqXG4gICAqIENhbGxlZCB3aGVuIGEgY2hpbGQgaXMgaW5zZXJ0ZWQuXG4gICAqL1xuICBwcm90ZWN0ZWQgb25GbG93Qm94Q2hpbGRJbnNlcnRlZCggbm9kZTogTm9kZSwgaW5kZXg6IG51bWJlciApOiB2b2lkIHtcbiAgICBjb25zdCBjZWxsID0gbmV3IEZsb3dDZWxsKCB0aGlzLl9jb25zdHJhaW50LCBub2RlLCB0aGlzLl9jb25zdHJhaW50LmNyZWF0ZUxheW91dFByb3h5KCBub2RlICkgKTtcbiAgICB0aGlzLl9jZWxsTWFwLnNldCggbm9kZSwgY2VsbCApO1xuXG4gICAgdGhpcy5fY29uc3RyYWludC5pbnNlcnRDZWxsKCBpbmRleCwgY2VsbCApO1xuICB9XG5cbiAgLyoqXG4gICAqIENhbGxlZCB3aGVuIGEgY2hpbGQgaXMgcmVtb3ZlZC5cbiAgICovXG4gIHByaXZhdGUgb25GbG93Qm94Q2hpbGRSZW1vdmVkKCBub2RlOiBOb2RlICk6IHZvaWQge1xuXG4gICAgY29uc3QgY2VsbCA9IHRoaXMuX2NlbGxNYXAuZ2V0KCBub2RlICkhO1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIGNlbGwgKTtcblxuICAgIHRoaXMuX2NlbGxNYXAuZGVsZXRlKCBub2RlICk7XG5cbiAgICB0aGlzLl9jb25zdHJhaW50LnJlbW92ZUNlbGwoIGNlbGwgKTtcblxuICAgIGNlbGwuZGlzcG9zZSgpO1xuICB9XG5cbiAgLyoqXG4gICAqIENhbGxlZCB3aGVuIGNoaWxkcmVuIGFyZSByZWFycmFuZ2VkXG4gICAqL1xuICBwcml2YXRlIG9uRmxvd0JveENoaWxkcmVuUmVvcmRlcmVkKCBtaW5DaGFuZ2VJbmRleDogbnVtYmVyLCBtYXhDaGFuZ2VJbmRleDogbnVtYmVyICk6IHZvaWQge1xuICAgIHRoaXMuX2NvbnN0cmFpbnQucmVvcmRlckNlbGxzKFxuICAgICAgdGhpcy5fY2hpbGRyZW4uc2xpY2UoIG1pbkNoYW5nZUluZGV4LCBtYXhDaGFuZ2VJbmRleCArIDEgKS5tYXAoIG5vZGUgPT4gdGhpcy5fY2VsbE1hcC5nZXQoIG5vZGUgKSEgKSxcbiAgICAgIG1pbkNoYW5nZUluZGV4LFxuICAgICAgbWF4Q2hhbmdlSW5kZXhcbiAgICApO1xuICB9XG5cbiAgLyoqXG4gICAqIENhbGxlZCBvbiBjaGFuZ2Ugb2YgY2hpbGRyZW4gKGNoaWxkIGFkZGVkLCByZW1vdmVkLCBvcmRlciBjaGFuZ2VkLCBldGMuKVxuICAgKi9cbiAgcHJpdmF0ZSBvbkZsb3dCb3hDaGlsZHJlbkNoYW5nZWQoKTogdm9pZCB7XG4gICAgdGhpcy5fY29uc3RyYWludC51cGRhdGVMYXlvdXRBdXRvbWF0aWNhbGx5KCk7XG4gIH1cblxuICBwdWJsaWMgZ2V0Q2VsbCggbm9kZTogTm9kZSApOiBGbG93Q2VsbCB7XG4gICAgY29uc3QgcmVzdWx0ID0gdGhpcy5fY2VsbE1hcC5nZXQoIG5vZGUgKSE7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggcmVzdWx0ICk7XG5cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG5cbiAgcHVibGljIGdldCBvcmllbnRhdGlvbigpOiBMYXlvdXRPcmllbnRhdGlvbiB7XG4gICAgcmV0dXJuIHRoaXMuX2NvbnN0cmFpbnQub3JpZW50YXRpb247XG4gIH1cblxuICBwdWJsaWMgc2V0IG9yaWVudGF0aW9uKCB2YWx1ZTogTGF5b3V0T3JpZW50YXRpb24gKSB7XG4gICAgdGhpcy5fY29uc3RyYWludC5vcmllbnRhdGlvbiA9IHZhbHVlO1xuICB9XG5cbiAgcHVibGljIGdldCBzcGFjaW5nKCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMuX2NvbnN0cmFpbnQuc3BhY2luZztcbiAgfVxuXG4gIHB1YmxpYyBzZXQgc3BhY2luZyggdmFsdWU6IG51bWJlciApIHtcbiAgICB0aGlzLl9jb25zdHJhaW50LnNwYWNpbmcgPSB2YWx1ZTtcbiAgfVxuXG4gIHB1YmxpYyBnZXQgbGluZVNwYWNpbmcoKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5fY29uc3RyYWludC5saW5lU3BhY2luZztcbiAgfVxuXG4gIHB1YmxpYyBzZXQgbGluZVNwYWNpbmcoIHZhbHVlOiBudW1iZXIgKSB7XG4gICAgdGhpcy5fY29uc3RyYWludC5saW5lU3BhY2luZyA9IHZhbHVlO1xuICB9XG5cbiAgcHVibGljIGdldCBqdXN0aWZ5KCk6IEhvcml6b250YWxMYXlvdXRKdXN0aWZpY2F0aW9uIHwgVmVydGljYWxMYXlvdXRKdXN0aWZpY2F0aW9uIHtcbiAgICByZXR1cm4gdGhpcy5fY29uc3RyYWludC5qdXN0aWZ5O1xuICB9XG5cbiAgcHVibGljIHNldCBqdXN0aWZ5KCB2YWx1ZTogSG9yaXpvbnRhbExheW91dEp1c3RpZmljYXRpb24gfCBWZXJ0aWNhbExheW91dEp1c3RpZmljYXRpb24gKSB7XG4gICAgdGhpcy5fY29uc3RyYWludC5qdXN0aWZ5ID0gdmFsdWU7XG4gIH1cblxuICBwdWJsaWMgZ2V0IGp1c3RpZnlMaW5lcygpOiBIb3Jpem9udGFsTGF5b3V0SnVzdGlmaWNhdGlvbiB8IFZlcnRpY2FsTGF5b3V0SnVzdGlmaWNhdGlvbiB8IG51bGwge1xuICAgIHJldHVybiB0aGlzLl9jb25zdHJhaW50Lmp1c3RpZnlMaW5lcztcbiAgfVxuXG4gIHB1YmxpYyBzZXQganVzdGlmeUxpbmVzKCB2YWx1ZTogSG9yaXpvbnRhbExheW91dEp1c3RpZmljYXRpb24gfCBWZXJ0aWNhbExheW91dEp1c3RpZmljYXRpb24gfCBudWxsICkge1xuICAgIHRoaXMuX2NvbnN0cmFpbnQuanVzdGlmeUxpbmVzID0gdmFsdWU7XG4gIH1cblxuICBwdWJsaWMgZ2V0IHdyYXAoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuX2NvbnN0cmFpbnQud3JhcDtcbiAgfVxuXG4gIHB1YmxpYyBzZXQgd3JhcCggdmFsdWU6IGJvb2xlYW4gKSB7XG4gICAgdGhpcy5fY29uc3RyYWludC53cmFwID0gdmFsdWU7XG4gIH1cblxuICBwdWJsaWMgZ2V0IGFsaWduKCk6IEhvcml6b250YWxMYXlvdXRBbGlnbiB8IFZlcnRpY2FsTGF5b3V0QWxpZ24ge1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIHR5cGVvZiB0aGlzLl9jb25zdHJhaW50LmFsaWduID09PSAnc3RyaW5nJyApO1xuXG4gICAgcmV0dXJuIHRoaXMuX2NvbnN0cmFpbnQuYWxpZ24hO1xuICB9XG5cbiAgcHVibGljIHNldCBhbGlnbiggdmFsdWU6IEhvcml6b250YWxMYXlvdXRBbGlnbiB8IFZlcnRpY2FsTGF5b3V0QWxpZ24gKSB7XG4gICAgdGhpcy5fY29uc3RyYWludC5hbGlnbiA9IHZhbHVlO1xuICB9XG5cbiAgcHVibGljIGdldCBzdHJldGNoKCk6IGJvb2xlYW4ge1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIHR5cGVvZiB0aGlzLl9jb25zdHJhaW50LnN0cmV0Y2ggPT09ICdib29sZWFuJyApO1xuXG4gICAgcmV0dXJuIHRoaXMuX2NvbnN0cmFpbnQuc3RyZXRjaCE7XG4gIH1cblxuICBwdWJsaWMgc2V0IHN0cmV0Y2goIHZhbHVlOiBib29sZWFuICkge1xuICAgIHRoaXMuX2NvbnN0cmFpbnQuc3RyZXRjaCA9IHZhbHVlO1xuICB9XG5cbiAgcHVibGljIGdldCBncm93KCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMuX2NvbnN0cmFpbnQuZ3JvdyE7XG4gIH1cblxuICBwdWJsaWMgc2V0IGdyb3coIHZhbHVlOiBudW1iZXIgKSB7XG4gICAgdGhpcy5fY29uc3RyYWludC5ncm93ID0gdmFsdWU7XG4gIH1cblxuICBwdWJsaWMgZ2V0IG1hcmdpbigpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLl9jb25zdHJhaW50Lm1hcmdpbiE7XG4gIH1cblxuICBwdWJsaWMgc2V0IG1hcmdpbiggdmFsdWU6IG51bWJlciApIHtcbiAgICB0aGlzLl9jb25zdHJhaW50Lm1hcmdpbiA9IHZhbHVlO1xuICB9XG5cbiAgcHVibGljIGdldCB4TWFyZ2luKCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMuX2NvbnN0cmFpbnQueE1hcmdpbiE7XG4gIH1cblxuICBwdWJsaWMgc2V0IHhNYXJnaW4oIHZhbHVlOiBudW1iZXIgKSB7XG4gICAgdGhpcy5fY29uc3RyYWludC54TWFyZ2luID0gdmFsdWU7XG4gIH1cblxuICBwdWJsaWMgZ2V0IHlNYXJnaW4oKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5fY29uc3RyYWludC55TWFyZ2luITtcbiAgfVxuXG4gIHB1YmxpYyBzZXQgeU1hcmdpbiggdmFsdWU6IG51bWJlciApIHtcbiAgICB0aGlzLl9jb25zdHJhaW50LnlNYXJnaW4gPSB2YWx1ZTtcbiAgfVxuXG4gIHB1YmxpYyBnZXQgbGVmdE1hcmdpbigpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLl9jb25zdHJhaW50LmxlZnRNYXJnaW4hO1xuICB9XG5cbiAgcHVibGljIHNldCBsZWZ0TWFyZ2luKCB2YWx1ZTogbnVtYmVyICkge1xuICAgIHRoaXMuX2NvbnN0cmFpbnQubGVmdE1hcmdpbiA9IHZhbHVlO1xuICB9XG5cbiAgcHVibGljIGdldCByaWdodE1hcmdpbigpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLl9jb25zdHJhaW50LnJpZ2h0TWFyZ2luITtcbiAgfVxuXG4gIHB1YmxpYyBzZXQgcmlnaHRNYXJnaW4oIHZhbHVlOiBudW1iZXIgKSB7XG4gICAgdGhpcy5fY29uc3RyYWludC5yaWdodE1hcmdpbiA9IHZhbHVlO1xuICB9XG5cbiAgcHVibGljIGdldCB0b3BNYXJnaW4oKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5fY29uc3RyYWludC50b3BNYXJnaW4hO1xuICB9XG5cbiAgcHVibGljIHNldCB0b3BNYXJnaW4oIHZhbHVlOiBudW1iZXIgKSB7XG4gICAgdGhpcy5fY29uc3RyYWludC50b3BNYXJnaW4gPSB2YWx1ZTtcbiAgfVxuXG4gIHB1YmxpYyBnZXQgYm90dG9tTWFyZ2luKCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMuX2NvbnN0cmFpbnQuYm90dG9tTWFyZ2luITtcbiAgfVxuXG4gIHB1YmxpYyBzZXQgYm90dG9tTWFyZ2luKCB2YWx1ZTogbnVtYmVyICkge1xuICAgIHRoaXMuX2NvbnN0cmFpbnQuYm90dG9tTWFyZ2luID0gdmFsdWU7XG4gIH1cblxuICBwdWJsaWMgZ2V0IG1pbkNvbnRlbnRXaWR0aCgpOiBudW1iZXIgfCBudWxsIHtcbiAgICByZXR1cm4gdGhpcy5fY29uc3RyYWludC5taW5Db250ZW50V2lkdGg7XG4gIH1cblxuICBwdWJsaWMgc2V0IG1pbkNvbnRlbnRXaWR0aCggdmFsdWU6IG51bWJlciB8IG51bGwgKSB7XG4gICAgdGhpcy5fY29uc3RyYWludC5taW5Db250ZW50V2lkdGggPSB2YWx1ZTtcbiAgfVxuXG4gIHB1YmxpYyBnZXQgbWluQ29udGVudEhlaWdodCgpOiBudW1iZXIgfCBudWxsIHtcbiAgICByZXR1cm4gdGhpcy5fY29uc3RyYWludC5taW5Db250ZW50SGVpZ2h0O1xuICB9XG5cbiAgcHVibGljIHNldCBtaW5Db250ZW50SGVpZ2h0KCB2YWx1ZTogbnVtYmVyIHwgbnVsbCApIHtcbiAgICB0aGlzLl9jb25zdHJhaW50Lm1pbkNvbnRlbnRIZWlnaHQgPSB2YWx1ZTtcbiAgfVxuXG4gIHB1YmxpYyBnZXQgbWF4Q29udGVudFdpZHRoKCk6IG51bWJlciB8IG51bGwge1xuICAgIHJldHVybiB0aGlzLl9jb25zdHJhaW50Lm1heENvbnRlbnRXaWR0aDtcbiAgfVxuXG4gIHB1YmxpYyBzZXQgbWF4Q29udGVudFdpZHRoKCB2YWx1ZTogbnVtYmVyIHwgbnVsbCApIHtcbiAgICB0aGlzLl9jb25zdHJhaW50Lm1heENvbnRlbnRXaWR0aCA9IHZhbHVlO1xuICB9XG5cbiAgcHVibGljIGdldCBtYXhDb250ZW50SGVpZ2h0KCk6IG51bWJlciB8IG51bGwge1xuICAgIHJldHVybiB0aGlzLl9jb25zdHJhaW50Lm1heENvbnRlbnRIZWlnaHQ7XG4gIH1cblxuICBwdWJsaWMgc2V0IG1heENvbnRlbnRIZWlnaHQoIHZhbHVlOiBudW1iZXIgfCBudWxsICkge1xuICAgIHRoaXMuX2NvbnN0cmFpbnQubWF4Q29udGVudEhlaWdodCA9IHZhbHVlO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlbGVhc2VzIHJlZmVyZW5jZXNcbiAgICovXG4gIHB1YmxpYyBvdmVycmlkZSBkaXNwb3NlKCk6IHZvaWQge1xuXG4gICAgLy8gTG9jayBvdXIgbGF5b3V0IGZvcmV2ZXJcbiAgICB0aGlzLl9jb25zdHJhaW50LmxvY2soKTtcblxuICAgIHRoaXMuY2hpbGRJbnNlcnRlZEVtaXR0ZXIucmVtb3ZlTGlzdGVuZXIoIHRoaXMub25DaGlsZEluc2VydGVkICk7XG4gICAgdGhpcy5jaGlsZFJlbW92ZWRFbWl0dGVyLnJlbW92ZUxpc3RlbmVyKCB0aGlzLm9uQ2hpbGRSZW1vdmVkICk7XG4gICAgdGhpcy5jaGlsZHJlblJlb3JkZXJlZEVtaXR0ZXIucmVtb3ZlTGlzdGVuZXIoIHRoaXMub25DaGlsZHJlblJlb3JkZXJlZCApO1xuICAgIHRoaXMuY2hpbGRyZW5DaGFuZ2VkRW1pdHRlci5yZW1vdmVMaXN0ZW5lciggdGhpcy5vbkNoaWxkcmVuQ2hhbmdlZCApO1xuXG4gICAgLy8gRGlzcG9zZSBvdXIgY2VsbHMgaGVyZS4gV2Ugd29uJ3QgYmUgZ2V0dGluZyB0aGUgY2hpbGRyZW4tcmVtb3ZlZCBsaXN0ZW5lcnMgZmlyZWQgKHdlIHJlbW92ZWQgdGhlbSBhYm92ZSlcbiAgICBmb3IgKCBjb25zdCBjZWxsIG9mIHRoaXMuX2NlbGxNYXAudmFsdWVzKCkgKSB7XG4gICAgICBjZWxsLmRpc3Bvc2UoKTtcbiAgICB9XG5cbiAgICBzdXBlci5kaXNwb3NlKCk7XG4gIH1cblxuICAvLyBMYXlvdXRCb3ggQ29tcGF0aWJpbGl0eSAoc2VlIHRoZSBFUzUgc2V0dGVycy9nZXR0ZXJzLCBvciB0aGUgb3B0aW9ucyBkb2MpXG4gIHB1YmxpYyBzZXRPcmllbnRhdGlvbiggb3JpZW50YXRpb246IExheW91dE9yaWVudGF0aW9uICk6IHRoaXMge1xuICAgIHRoaXMub3JpZW50YXRpb24gPSBvcmllbnRhdGlvbjtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIHB1YmxpYyBnZXRPcmllbnRhdGlvbigpOiBMYXlvdXRPcmllbnRhdGlvbiB7IHJldHVybiB0aGlzLm9yaWVudGF0aW9uOyB9XG5cbiAgcHVibGljIHNldFNwYWNpbmcoIHNwYWNpbmc6IG51bWJlciApOiB0aGlzIHtcbiAgICB0aGlzLnNwYWNpbmcgPSBzcGFjaW5nO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgcHVibGljIGdldFNwYWNpbmcoKTogbnVtYmVyIHsgcmV0dXJuIHRoaXMuc3BhY2luZzsgfVxuXG4gIHB1YmxpYyBzZXRBbGlnbiggYWxpZ246IEhvcml6b250YWxMYXlvdXRBbGlnbiB8IFZlcnRpY2FsTGF5b3V0QWxpZ24gKTogdGhpcyB7XG4gICAgdGhpcy5hbGlnbiA9IGFsaWduO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgcHVibGljIGdldEFsaWduKCk6IEhvcml6b250YWxMYXlvdXRBbGlnbiB8IFZlcnRpY2FsTGF5b3V0QWxpZ24geyByZXR1cm4gdGhpcy5hbGlnbjsgfVxuXG4gIHB1YmxpYyBzZXRSZXNpemUoIHJlc2l6ZTogYm9vbGVhbiApOiB0aGlzIHtcbiAgICB0aGlzLnJlc2l6ZSA9IHJlc2l6ZTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIHB1YmxpYyBpc1Jlc2l6ZSgpOiBib29sZWFuIHsgcmV0dXJuIHRoaXMucmVzaXplOyB9XG5cbiAgcHVibGljIGdldEhlbHBlck5vZGUoKTogTm9kZSB7XG4gICAgY29uc3QgbWFyZ2luc05vZGUgPSBNYXJnaW5MYXlvdXRDZWxsLmNyZWF0ZUhlbHBlck5vZGUoIHRoaXMuY29uc3RyYWludC5kaXNwbGF5ZWRDZWxscywgdGhpcy5jb25zdHJhaW50LmxheW91dEJvdW5kc1Byb3BlcnR5LnZhbHVlLCBjZWxsID0+IHtcbiAgICAgIGxldCBzdHIgPSAnJztcblxuICAgICAgY29uc3QgaW50ZXJuYWxPcmllbnRhdGlvbiA9IE9yaWVudGF0aW9uLmZyb21MYXlvdXRPcmllbnRhdGlvbiggY2VsbC5vcmllbnRhdGlvbiApO1xuXG4gICAgICBzdHIgKz0gYGFsaWduOiAke0xheW91dEFsaWduLmludGVybmFsVG9BbGlnbiggaW50ZXJuYWxPcmllbnRhdGlvbiwgY2VsbC5lZmZlY3RpdmVBbGlnbiApfVxcbmA7XG4gICAgICBzdHIgKz0gYHN0cmV0Y2g6ICR7Y2VsbC5lZmZlY3RpdmVTdHJldGNofVxcbmA7XG4gICAgICBzdHIgKz0gYGdyb3c6ICR7Y2VsbC5lZmZlY3RpdmVHcm93fVxcbmA7XG5cbiAgICAgIHJldHVybiBzdHI7XG4gICAgfSApO1xuXG4gICAgcmV0dXJuIG1hcmdpbnNOb2RlO1xuICB9XG5cbiAgcHVibGljIG92ZXJyaWRlIG11dGF0ZSggb3B0aW9ucz86IEZsb3dCb3hPcHRpb25zICk6IHRoaXMge1xuICAgIHJldHVybiBzdXBlci5tdXRhdGUoIG9wdGlvbnMgKTtcbiAgfVxuXG4gIHB1YmxpYyBzdGF0aWMgcmVhZG9ubHkgREVGQVVMVF9GTE9XX0JPWF9PUFRJT05TID0gREVGQVVMVF9PUFRJT05TO1xufVxuXG4vKipcbiAqIHtBcnJheS48c3RyaW5nPn0gLSBTdHJpbmcga2V5cyBmb3IgYWxsIG9mIHRoZSBhbGxvd2VkIG9wdGlvbnMgdGhhdCB3aWxsIGJlIHNldCBieSBub2RlLm11dGF0ZSggb3B0aW9ucyApLCBpbiB0aGVcbiAqIG9yZGVyIHRoZXkgd2lsbCBiZSBldmFsdWF0ZWQgaW4uXG4gKlxuICogTk9URTogU2VlIE5vZGUncyBfbXV0YXRvcktleXMgZG9jdW1lbnRhdGlvbiBmb3IgbW9yZSBpbmZvcm1hdGlvbiBvbiBob3cgdGhpcyBvcGVyYXRlcywgYW5kIHBvdGVudGlhbCBzcGVjaWFsXG4gKiAgICAgICBjYXNlcyB0aGF0IG1heSBhcHBseS5cbiAqL1xuRmxvd0JveC5wcm90b3R5cGUuX211dGF0b3JLZXlzID0gWyAuLi5TSVpBQkxFX09QVElPTl9LRVlTLCAuLi5GTE9XQk9YX09QVElPTl9LRVlTLCAuLi5Ob2RlLnByb3RvdHlwZS5fbXV0YXRvcktleXMgXTtcblxuc2NlbmVyeS5yZWdpc3RlciggJ0Zsb3dCb3gnLCBGbG93Qm94ICk7Il0sIm5hbWVzIjpbIm9wdGlvbml6ZSIsIk9yaWVudGF0aW9uIiwiRkxPV19DT05TVFJBSU5UX09QVElPTl9LRVlTIiwiRmxvd0NlbGwiLCJGbG93Q29uc3RyYWludCIsIkxBWU9VVF9OT0RFX09QVElPTl9LRVlTIiwiTGF5b3V0QWxpZ24iLCJMYXlvdXROb2RlIiwiTWFyZ2luTGF5b3V0Q2VsbCIsIk5vZGUiLCJSRVFVSVJFU19CT1VORFNfT1BUSU9OX0tFWVMiLCJzY2VuZXJ5IiwiU2NlbmVyeUNvbnN0YW50cyIsIlNJWkFCTEVfT1BUSU9OX0tFWVMiLCJGTE9XQk9YX09QVElPTl9LRVlTIiwiZmlsdGVyIiwia2V5IiwiREVGQVVMVF9PUFRJT05TIiwib3JpZW50YXRpb24iLCJzcGFjaW5nIiwiYWxpZ24iLCJzdHJldGNoIiwiRmxvd0JveCIsIm9uRmxvd0JveENoaWxkSW5zZXJ0ZWQiLCJub2RlIiwiaW5kZXgiLCJjZWxsIiwiX2NvbnN0cmFpbnQiLCJjcmVhdGVMYXlvdXRQcm94eSIsIl9jZWxsTWFwIiwic2V0IiwiaW5zZXJ0Q2VsbCIsIm9uRmxvd0JveENoaWxkUmVtb3ZlZCIsImdldCIsImFzc2VydCIsImRlbGV0ZSIsInJlbW92ZUNlbGwiLCJkaXNwb3NlIiwib25GbG93Qm94Q2hpbGRyZW5SZW9yZGVyZWQiLCJtaW5DaGFuZ2VJbmRleCIsIm1heENoYW5nZUluZGV4IiwicmVvcmRlckNlbGxzIiwiX2NoaWxkcmVuIiwic2xpY2UiLCJtYXAiLCJvbkZsb3dCb3hDaGlsZHJlbkNoYW5nZWQiLCJ1cGRhdGVMYXlvdXRBdXRvbWF0aWNhbGx5IiwiZ2V0Q2VsbCIsInJlc3VsdCIsInZhbHVlIiwibGluZVNwYWNpbmciLCJqdXN0aWZ5IiwianVzdGlmeUxpbmVzIiwid3JhcCIsImdyb3ciLCJtYXJnaW4iLCJ4TWFyZ2luIiwieU1hcmdpbiIsImxlZnRNYXJnaW4iLCJyaWdodE1hcmdpbiIsInRvcE1hcmdpbiIsImJvdHRvbU1hcmdpbiIsIm1pbkNvbnRlbnRXaWR0aCIsIm1pbkNvbnRlbnRIZWlnaHQiLCJtYXhDb250ZW50V2lkdGgiLCJtYXhDb250ZW50SGVpZ2h0IiwibG9jayIsImNoaWxkSW5zZXJ0ZWRFbWl0dGVyIiwicmVtb3ZlTGlzdGVuZXIiLCJvbkNoaWxkSW5zZXJ0ZWQiLCJjaGlsZFJlbW92ZWRFbWl0dGVyIiwib25DaGlsZFJlbW92ZWQiLCJjaGlsZHJlblJlb3JkZXJlZEVtaXR0ZXIiLCJvbkNoaWxkcmVuUmVvcmRlcmVkIiwiY2hpbGRyZW5DaGFuZ2VkRW1pdHRlciIsIm9uQ2hpbGRyZW5DaGFuZ2VkIiwidmFsdWVzIiwic2V0T3JpZW50YXRpb24iLCJnZXRPcmllbnRhdGlvbiIsInNldFNwYWNpbmciLCJnZXRTcGFjaW5nIiwic2V0QWxpZ24iLCJnZXRBbGlnbiIsInNldFJlc2l6ZSIsInJlc2l6ZSIsImlzUmVzaXplIiwiZ2V0SGVscGVyTm9kZSIsIm1hcmdpbnNOb2RlIiwiY3JlYXRlSGVscGVyTm9kZSIsImNvbnN0cmFpbnQiLCJkaXNwbGF5ZWRDZWxscyIsImxheW91dEJvdW5kc1Byb3BlcnR5Iiwic3RyIiwiaW50ZXJuYWxPcmllbnRhdGlvbiIsImZyb21MYXlvdXRPcmllbnRhdGlvbiIsImludGVybmFsVG9BbGlnbiIsImVmZmVjdGl2ZUFsaWduIiwiZWZmZWN0aXZlU3RyZXRjaCIsImVmZmVjdGl2ZUdyb3ciLCJtdXRhdGUiLCJvcHRpb25zIiwicHJvdmlkZWRPcHRpb25zIiwiZXhjbHVkZUludmlzaWJsZUNoaWxkcmVuRnJvbUJvdW5kcyIsImRpc2FibGVkT3BhY2l0eSIsIkRJU0FCTEVEX09QQUNJVFkiLCJNYXAiLCJwcmVmZXJyZWRXaWR0aFByb3BlcnR5IiwibG9jYWxQcmVmZXJyZWRXaWR0aFByb3BlcnR5IiwicHJlZmVycmVkSGVpZ2h0UHJvcGVydHkiLCJsb2NhbFByZWZlcnJlZEhlaWdodFByb3BlcnR5IiwibWluaW11bVdpZHRoUHJvcGVydHkiLCJsb2NhbE1pbmltdW1XaWR0aFByb3BlcnR5IiwibWluaW11bUhlaWdodFByb3BlcnR5IiwibG9jYWxNaW5pbXVtSGVpZ2h0UHJvcGVydHkiLCJsYXlvdXRPcmlnaW5Qcm9wZXJ0eSIsImV4Y2x1ZGVJbnZpc2libGUiLCJiaW5kIiwiYWRkTGlzdGVuZXIiLCJub25Cb3VuZHNPcHRpb25zIiwiXyIsIm9taXQiLCJib3VuZHNPcHRpb25zIiwicGljayIsInVubG9jayIsInVwZGF0ZUxheW91dCIsImxpbmtMYXlvdXRCb3VuZHMiLCJERUZBVUxUX0ZMT1dfQk9YX09QVElPTlMiLCJwcm90b3R5cGUiLCJfbXV0YXRvcktleXMiLCJyZWdpc3RlciJdLCJtYXBwaW5ncyI6IkFBQUEsc0RBQXNEO0FBRXREOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Q0FpQ0MsR0FFRCxPQUFPQSxlQUFlLHdDQUF3QztBQUM5RCxPQUFPQyxpQkFBaUIsMENBQTBDO0FBRWxFLFNBQVNDLDJCQUEyQixFQUFFQyxRQUFRLEVBQUVDLGNBQWMsRUFBK0VDLHVCQUF1QixFQUFFQyxXQUFXLEVBQUVDLFVBQVUsRUFBd0NDLGdCQUFnQixFQUFFQyxJQUFJLEVBQUVDLDJCQUEyQixFQUFFQyxPQUFPLEVBQUVDLGdCQUFnQixFQUFFQyxtQkFBbUIsUUFBMEQsbUJBQW1CO0FBRXJaLG1GQUFtRjtBQUNuRixNQUFNQyxzQkFBc0I7T0FDdkJUO09BQ0FILDRCQUE0QmEsTUFBTSxDQUFFQyxDQUFBQSxNQUFPQSxRQUFRO0NBQ3ZEO0FBRUQsTUFBTUMsa0JBQWtCO0lBQ3RCQyxhQUFhO0lBQ2JDLFNBQVM7SUFDVEMsT0FBTztJQUNQQyxTQUFTO0FBQ1g7QUFZZSxJQUFBLEFBQU1DLFVBQU4sTUFBTUEsZ0JBQWdCZjtJQWlFbkM7O0dBRUMsR0FDRCxBQUFVZ0IsdUJBQXdCQyxJQUFVLEVBQUVDLEtBQWEsRUFBUztRQUNsRSxNQUFNQyxPQUFPLElBQUl2QixTQUFVLElBQUksQ0FBQ3dCLFdBQVcsRUFBRUgsTUFBTSxJQUFJLENBQUNHLFdBQVcsQ0FBQ0MsaUJBQWlCLENBQUVKO1FBQ3ZGLElBQUksQ0FBQ0ssUUFBUSxDQUFDQyxHQUFHLENBQUVOLE1BQU1FO1FBRXpCLElBQUksQ0FBQ0MsV0FBVyxDQUFDSSxVQUFVLENBQUVOLE9BQU9DO0lB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