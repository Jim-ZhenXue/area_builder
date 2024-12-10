// Copyright 2021-2024, University of Colorado Boulder
/**
 * Main flow-layout logic. Usually used indirectly through FlowBox, but can also be used directly (say, if nodes don't
 * have the same parent, or a FlowBox can't be used).
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ import Bounds2 from '../../../../dot/js/Bounds2.js';
import arrayRemove from '../../../../phet-core/js/arrayRemove.js';
import mutate from '../../../../phet-core/js/mutate.js';
import Orientation from '../../../../phet-core/js/Orientation.js';
import { FLOW_CONFIGURABLE_OPTION_KEYS, FlowConfigurable, FlowLine, LayoutAlign, LayoutJustification, NodeLayoutConstraint, scenery } from '../../imports.js';
const FLOW_CONSTRAINT_OPTION_KEYS = [
    ...FLOW_CONFIGURABLE_OPTION_KEYS,
    'spacing',
    'lineSpacing',
    'justify',
    'justifyLines',
    'wrap',
    'excludeInvisible'
];
let FlowConstraint = class FlowConstraint extends FlowConfigurable(NodeLayoutConstraint) {
    updateSeparatorVisibility() {
        // Find the index of the first visible non-separator cell. Then hide all separators until this index.
        // This is needed, so that we do NOT temporarily change the visibility of separators back-and-forth during the
        // layout. If we did that, it would trigger a layout inside every layout, leading to an infinite loop.
        // This is effectively done so that we have NO visible separators in front of the first visible non-separator cell
        // (thus satisfying our separator constraints).
        let firstVisibleNonSeparatorIndex = 0;
        for(; firstVisibleNonSeparatorIndex < this.cells.length; firstVisibleNonSeparatorIndex++){
            const cell = this.cells[firstVisibleNonSeparatorIndex];
            if (cell._isSeparator) {
                cell.node.visible = false;
            } else if (cell.node.visible && cell.node.boundsProperty.value.isValid()) {
                break;
            }
        }
        // Scan for separators, toggling visibility as desired. Leave the "last" separator visible, as if they are marking
        // sections "after" themselves.
        let hasVisibleNonSeparator = false;
        for(let i = this.cells.length - 1; i > firstVisibleNonSeparatorIndex; i--){
            const cell = this.cells[i];
            if (cell._isSeparator) {
                cell.node.visible = hasVisibleNonSeparator;
                hasVisibleNonSeparator = false;
            } else if (cell.node.visible && cell.node.boundsProperty.value.isValid()) {
                hasVisibleNonSeparator = true;
            }
        }
    }
    layout() {
        super.layout();
        // The orientation along the laid-out lines - also known as the "primary" axis
        const orientation = this._orientation;
        // The perpendicular orientation, where alignment is handled - also known as the "secondary" axis
        const oppositeOrientation = this._orientation.opposite;
        this.updateSeparatorVisibility();
        // Filter to only cells used in the layout
        const cells = this.filterLayoutCells(this.cells);
        this.displayedCells = cells;
        if (!cells.length) {
            this.layoutBoundsProperty.value = Bounds2.NOTHING;
            this.minimumWidthProperty.value = null;
            this.minimumHeightProperty.value = null;
            return;
        }
        // Determine our preferred sizes (they can be null, in which case)
        let preferredSize = this.getPreferredProperty(orientation).value;
        const preferredOppositeSize = this.getPreferredProperty(oppositeOrientation).value;
        // What is the largest of the minimum sizes of cells (e.g. if we're wrapping, this would be our minimum size)
        const maxMinimumCellSize = Math.max(...cells.map((cell)=>cell.getMinimumSize(orientation) || 0));
        // If we can't fit the content... just pretend like we have a larger preferred size!
        if (maxMinimumCellSize > (preferredSize || Number.POSITIVE_INFINITY)) {
            preferredSize = maxMinimumCellSize;
        }
        // Wrapping all the cells into lines
        const lines = [];
        if (this.wrap) {
            let currentLineCells = [];
            let availableSpace = preferredSize || Number.POSITIVE_INFINITY;
            while(cells.length){
                const cell = cells.shift();
                const cellSpace = cell.getMinimumSize(orientation);
                // If we're the very first cell, don't create a new line
                if (currentLineCells.length === 0) {
                    currentLineCells.push(cell);
                    availableSpace -= cellSpace;
                } else if (this.spacing + cellSpace <= availableSpace + 1e-7) {
                    currentLineCells.push(cell);
                    availableSpace -= this.spacing + cellSpace;
                } else {
                    lines.push(FlowLine.pool.create(orientation, currentLineCells));
                    availableSpace = preferredSize || Number.POSITIVE_INFINITY;
                    currentLineCells = [
                        cell
                    ];
                    availableSpace -= cellSpace;
                }
            }
            if (currentLineCells.length) {
                lines.push(FlowLine.pool.create(orientation, currentLineCells));
            }
        } else {
            lines.push(FlowLine.pool.create(orientation, cells));
        }
        // Determine line opposite-orientation min/max sizes and origin sizes (how tall will a row have to be?)
        lines.forEach((line)=>{
            line.cells.forEach((cell)=>{
                line.min = Math.max(line.min, cell.getMinimumSize(oppositeOrientation));
                line.max = Math.min(line.max, cell.getMaximumSize(oppositeOrientation));
                // For origin-specified cells, we will record their maximum reach from the origin, so these can be "summed"
                // (since the origin line may end up taking more space).
                if (cell.effectiveAlign === LayoutAlign.ORIGIN) {
                    const originBounds = cell.getOriginBounds();
                    line.minOrigin = Math.min(originBounds[oppositeOrientation.minCoordinate], line.minOrigin);
                    line.maxOrigin = Math.max(originBounds[oppositeOrientation.maxCoordinate], line.maxOrigin);
                }
            });
            // If we have align:origin content, we need to see if the maximum origin span is larger than or line's
            // minimum size.
            if (isFinite(line.minOrigin) && isFinite(line.maxOrigin)) {
                line.size = Math.max(line.min, line.maxOrigin - line.minOrigin);
            } else {
                line.size = line.min;
            }
        });
        // Given our wrapped lines, what is our minimum size we could take up?
        const minimumCurrentSize = Math.max(...lines.map((line)=>line.getMinimumSize(this.spacing)));
        const minimumCurrentOppositeSize = _.sum(lines.map((line)=>line.size)) + (lines.length - 1) * this.lineSpacing;
        // Used for determining our "minimum" size for preferred sizes... if wrapping is enabled, we can be smaller than
        // current minimums
        const minimumAllowableSize = this.wrap ? maxMinimumCellSize : minimumCurrentSize;
        // Increase things if our preferred size is larger than our minimums (we'll figure out how to compensate
        // for the extra space below).
        const size = Math.max(minimumCurrentSize, preferredSize || 0);
        const oppositeSize = Math.max(minimumCurrentOppositeSize, preferredOppositeSize || 0);
        // Our layout origin (usually the upper-left of the content in local coordinates, but could be different based on
        // align:origin content.
        const originPrimary = this.layoutOriginProperty.value[orientation.coordinate];
        const originSecondary = this.layoutOriginProperty.value[orientation.opposite.coordinate];
        // Primary-direction layout
        lines.forEach((line)=>{
            const minimumContent = _.sum(line.cells.map((cell)=>cell.getMinimumSize(orientation)));
            const spacingAmount = this.spacing * (line.cells.length - 1);
            let spaceRemaining = size - minimumContent - spacingAmount;
            // Initial pending sizes
            line.cells.forEach((cell)=>{
                cell.size = cell.getMinimumSize(orientation);
            });
            // Grow potential sizes if possible
            let growableCells;
            while(spaceRemaining > 1e-7 && (growableCells = line.cells.filter((cell)=>{
                // Can the cell grow more?
                return cell.effectiveGrow !== 0 && cell.size < cell.getMaximumSize(orientation) - 1e-7;
            })).length){
                // Total sum of "grow" values in cells that could potentially grow
                const totalGrow = _.sum(growableCells.map((cell)=>cell.effectiveGrow));
                const amountToGrow = Math.min(// Smallest amount that any of the cells couldn't grow past (note: proportional to effectiveGrow)
                Math.min(...growableCells.map((cell)=>(cell.getMaximumSize(orientation) - cell.size) / cell.effectiveGrow)), // Amount each cell grows if all of our extra space fits in ALL the cells
                spaceRemaining / totalGrow);
                assert && assert(amountToGrow > 1e-11);
                growableCells.forEach((cell)=>{
                    cell.size += amountToGrow * cell.effectiveGrow;
                });
                spaceRemaining -= amountToGrow * totalGrow;
            }
            // Gives additional spacing based on justification
            const primarySpacingFunction = this._justify.spacingFunctionFactory(spaceRemaining, line.cells.length);
            let position = originPrimary;
            line.cells.forEach((cell, index)=>{
                // Always include justify spacing
                position += primarySpacingFunction(index);
                // Only include normal spacing between items
                if (index > 0) {
                    position += this.spacing;
                }
                // Position it
                // FlowConstraint does not have options to control the main-orientation stretch of each cell, so we will fill
                // in the value stretch:true when positioning the cell.
                // FlowConstraint ALSO cannot take align-origin in the primary direction, so we hardcode a 0 for the origin offset,
                // since all of the possible align values passed (cell.effectiveCellAlign) will not be origin-based.
                cell.reposition(orientation, cell.size, position, true, 0, cell.effectiveCellAlign);
                position += cell.size;
                assert && assert(this.spacing >= 0 || cell.size >= -this.spacing - 1e-7, 'Negative spacing more than a cell\'s size causes issues with layout');
            });
        });
        // Secondary-direction layout
        const oppositeSpaceRemaining = oppositeSize - minimumCurrentOppositeSize;
        const initialOppositePosition = (lines[0].hasOrigin() ? lines[0].minOrigin : 0) + originSecondary;
        let oppositePosition = initialOppositePosition;
        if (this._justifyLines === null) {
            // null justifyLines will result in expanding all of our lines into the remaining space.
            // Add space remaining evenly (for now) since we don't have any grow values
            lines.forEach((line)=>{
                line.size += oppositeSpaceRemaining / lines.length;
            });
            // Position the lines
            lines.forEach((line)=>{
                line.position = oppositePosition;
                oppositePosition += line.size + this.lineSpacing;
            });
        } else {
            // If we're justifying lines, we won't add any additional space into things
            const spacingFunction = this._justifyLines.spacingFunctionFactory(oppositeSpaceRemaining, lines.length);
            lines.forEach((line, index)=>{
                oppositePosition += spacingFunction(index);
                line.position = oppositePosition;
                oppositePosition += line.size + this.lineSpacing;
            });
        }
        lines.forEach((line)=>line.cells.forEach((cell)=>{
                cell.reposition(oppositeOrientation, line.size, line.position, cell.effectiveStretch, -line.minOrigin, cell.effectiveAlign);
            }));
        // Determine the size we actually take up (localBounds for the FlowBox will use this)
        const minCoordinate = originPrimary;
        const maxCoordinate = originPrimary + size;
        const minOppositeCoordinate = initialOppositePosition;
        const maxOppositeCoordinate = initialOppositePosition + oppositeSize;
        // We're taking up these layout bounds (nodes could use them for localBounds)
        this.layoutBoundsProperty.value = Bounds2.oriented(orientation, minCoordinate, minOppositeCoordinate, maxCoordinate, maxOppositeCoordinate);
        // Tell others about our new "minimum" sizes
        this.minimumWidthProperty.value = orientation === Orientation.HORIZONTAL ? minimumAllowableSize : minimumCurrentOppositeSize;
        this.minimumHeightProperty.value = orientation === Orientation.HORIZONTAL ? minimumCurrentOppositeSize : minimumAllowableSize;
        this.finishedLayoutEmitter.emit();
        lines.forEach((line)=>line.clean());
    }
    get justify() {
        const result = LayoutJustification.internalToJustify(this._orientation, this._justify);
        assert && assert(LayoutJustification.getAllowedJustificationValues(this._orientation).includes(result));
        return result;
    }
    set justify(value) {
        assert && assert(LayoutJustification.getAllowedJustificationValues(this._orientation).includes(value), `justify ${value} not supported, with the orientation ${this._orientation}, the valid values are ${LayoutJustification.getAllowedJustificationValues(this._orientation)}`);
        // remapping align values to an independent set, so they aren't orientation-dependent
        const mappedValue = LayoutJustification.justifyToInternal(this._orientation, value);
        if (this._justify !== mappedValue) {
            this._justify = mappedValue;
            this.updateLayoutAutomatically();
        }
    }
    get justifyLines() {
        if (this._justifyLines === null) {
            return null;
        } else {
            const result = LayoutJustification.internalToJustify(this._orientation, this._justifyLines);
            assert && assert(LayoutJustification.getAllowedJustificationValues(this._orientation).includes(result));
            return result;
        }
    }
    set justifyLines(value) {
        assert && assert(value === null || LayoutJustification.getAllowedJustificationValues(this._orientation.opposite).includes(value), `justify ${value} not supported, with the orientation ${this._orientation.opposite}, the valid values are ${LayoutJustification.getAllowedJustificationValues(this._orientation.opposite)} or null`);
        // remapping align values to an independent set, so they aren't orientation-dependent
        const mappedValue = value === null ? null : LayoutJustification.justifyToInternal(this._orientation.opposite, value);
        assert && assert(mappedValue === null || mappedValue instanceof LayoutJustification);
        if (this._justifyLines !== mappedValue) {
            this._justifyLines = mappedValue;
            this.updateLayoutAutomatically();
        }
    }
    get wrap() {
        return this._wrap;
    }
    set wrap(value) {
        if (this._wrap !== value) {
            this._wrap = value;
            this.updateLayoutAutomatically();
        }
    }
    get spacing() {
        return this._spacing;
    }
    set spacing(value) {
        assert && assert(isFinite(value));
        if (this._spacing !== value) {
            this._spacing = value;
            this.updateLayoutAutomatically();
        }
    }
    get lineSpacing() {
        return this._lineSpacing;
    }
    set lineSpacing(value) {
        assert && assert(isFinite(value));
        if (this._lineSpacing !== value) {
            this._lineSpacing = value;
            this.updateLayoutAutomatically();
        }
    }
    insertCell(index, cell) {
        assert && assert(index >= 0);
        assert && assert(index <= this.cells.length);
        assert && assert(!_.includes(this.cells, cell));
        cell.orientation = this.orientation;
        this.cells.splice(index, 0, cell);
        this.addNode(cell.node);
        cell.changedEmitter.addListener(this._updateLayoutListener);
        this.updateLayoutAutomatically();
    }
    removeCell(cell) {
        assert && assert(_.includes(this.cells, cell));
        arrayRemove(this.cells, cell);
        this.removeNode(cell.node);
        cell.changedEmitter.removeListener(this._updateLayoutListener);
        this.updateLayoutAutomatically();
    }
    reorderCells(cells, minChangeIndex, maxChangeIndex) {
        this.cells.splice(minChangeIndex, maxChangeIndex - minChangeIndex + 1, ...cells);
        this.updateLayoutAutomatically();
    }
    // (scenery-internal)
    getPreferredProperty(orientation) {
        return orientation === Orientation.HORIZONTAL ? this.preferredWidthProperty : this.preferredHeightProperty;
    }
    /**
   * Releases references
   */ dispose() {
        // Lock during disposal to avoid layout calls
        this.lock();
        this.cells.forEach((cell)=>this.removeCell(cell));
        this.displayedCells = [];
        super.dispose();
        this.unlock();
    }
    static create(ancestorNode, options) {
        return new FlowConstraint(ancestorNode, options);
    }
    constructor(ancestorNode, providedOptions){
        super(ancestorNode, providedOptions), this.cells = [], this._justify = LayoutJustification.SPACE_BETWEEN, this._justifyLines = null, this._wrap = false, this._spacing = 0, this._lineSpacing = 0, // (scenery-internal)
        this.displayedCells = [];
        // Set configuration to actual default values (instead of null) so that we will have guaranteed non-null
        // (non-inherit) values for our computations.
        this.setConfigToBaseDefault();
        this.mutateConfigurable(providedOptions);
        mutate(this, FLOW_CONSTRAINT_OPTION_KEYS, providedOptions);
        // Key configuration changes to relayout
        this.changedEmitter.addListener(this._updateLayoutListener);
        this.orientationChangedEmitter.addListener(()=>this.cells.forEach((cell)=>{
                cell.orientation = this.orientation;
            }));
    }
};
export { FlowConstraint as default };
scenery.register('FlowConstraint', FlowConstraint);
export { FLOW_CONSTRAINT_OPTION_KEYS };

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvbGF5b3V0L2NvbnN0cmFpbnRzL0Zsb3dDb25zdHJhaW50LnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDIxLTIwMjQsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIE1haW4gZmxvdy1sYXlvdXQgbG9naWMuIFVzdWFsbHkgdXNlZCBpbmRpcmVjdGx5IHRocm91Z2ggRmxvd0JveCwgYnV0IGNhbiBhbHNvIGJlIHVzZWQgZGlyZWN0bHkgKHNheSwgaWYgbm9kZXMgZG9uJ3RcbiAqIGhhdmUgdGhlIHNhbWUgcGFyZW50LCBvciBhIEZsb3dCb3ggY2FuJ3QgYmUgdXNlZCkuXG4gKlxuICogQGF1dGhvciBKb25hdGhhbiBPbHNvbiA8am9uYXRoYW4ub2xzb25AY29sb3JhZG8uZWR1PlxuICovXG5cbmltcG9ydCBUUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9UUHJvcGVydHkuanMnO1xuaW1wb3J0IEJvdW5kczIgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL0JvdW5kczIuanMnO1xuaW1wb3J0IGFycmF5UmVtb3ZlIGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9hcnJheVJlbW92ZS5qcyc7XG5pbXBvcnQgbXV0YXRlIGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9tdXRhdGUuanMnO1xuaW1wb3J0IE9yaWVudGF0aW9uIGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9PcmllbnRhdGlvbi5qcyc7XG5pbXBvcnQgeyBFeHRlcm5hbEZsb3dDb25maWd1cmFibGVPcHRpb25zLCBGTE9XX0NPTkZJR1VSQUJMRV9PUFRJT05fS0VZUywgRmxvd0NlbGwsIEZsb3dDb25maWd1cmFibGUsIEZsb3dMaW5lLCBIb3Jpem9udGFsTGF5b3V0SnVzdGlmaWNhdGlvbiwgTGF5b3V0QWxpZ24sIExheW91dEp1c3RpZmljYXRpb24sIE5vZGUsIE5vZGVMYXlvdXRBdmFpbGFibGVDb25zdHJhaW50T3B0aW9ucywgTm9kZUxheW91dENvbnN0cmFpbnQsIHNjZW5lcnksIFZlcnRpY2FsTGF5b3V0SnVzdGlmaWNhdGlvbiB9IGZyb20gJy4uLy4uL2ltcG9ydHMuanMnO1xuXG5jb25zdCBGTE9XX0NPTlNUUkFJTlRfT1BUSU9OX0tFWVMgPSBbXG4gIC4uLkZMT1dfQ09ORklHVVJBQkxFX09QVElPTl9LRVlTLFxuICAnc3BhY2luZycsXG4gICdsaW5lU3BhY2luZycsXG4gICdqdXN0aWZ5JyxcbiAgJ2p1c3RpZnlMaW5lcycsXG4gICd3cmFwJyxcbiAgJ2V4Y2x1ZGVJbnZpc2libGUnXG5dO1xuXG50eXBlIFNlbGZPcHRpb25zID0ge1xuICAvLyBUaGUgZGVmYXVsdCBzcGFjaW5nIGluLWJldHdlZW4gZWxlbWVudHMgaW4gdGhlIHByaW1hcnkgZGlyZWN0aW9uLiBJZiBhZGRpdGlvbmFsIChvciBsZXNzKSBzcGFjaW5nIGlzIGRlc2lyZWQgZm9yXG4gIC8vIGNlcnRhaW4gZWxlbWVudHMsIHBlci1lbGVtZW50IG1hcmdpbnMgKGV2ZW4gbmVnYXRpdmUpIGNhbiBiZSBzZXQgaW4gdGhlIGxheW91dE9wdGlvbnMgb2Ygbm9kZXMgY29udGFpbmVkLlxuICBzcGFjaW5nPzogbnVtYmVyO1xuXG4gIC8vIFRoZSBkZWZhdWx0IHNwYWNpbmcgaW4tYmV0d2VlbiBsaW5lcyBsb25nIHRoZSBzZWNvbmRhcnkgYXhpcy5cbiAgbGluZVNwYWNpbmc/OiBudW1iZXI7XG5cbiAgLy8gSG93IGV4dHJhIHNwYWNlIGFsb25nIHRoZSBwcmltYXJ5IGF4aXMgaXMgYWxsb2NhdGVkLiBUaGUgZGVmYXVsdCBpcyBzcGFjZUJldHdlZW4uXG4gIGp1c3RpZnk/OiBIb3Jpem9udGFsTGF5b3V0SnVzdGlmaWNhdGlvbiB8IFZlcnRpY2FsTGF5b3V0SnVzdGlmaWNhdGlvbjtcblxuICAvLyBIb3cgZXh0cmEgc3BhY2UgYWxvbmcgdGhlIHNlY29uZGFyeSBheGlzIGlzIGFsbG9jYXRlZC4gVGhlIGRlZmF1bHQgaXMgbnVsbCAod2hpY2ggd2lsbCBleHBhbmQgY29udGVudCB0byBmaXQpXG4gIGp1c3RpZnlMaW5lcz86IEhvcml6b250YWxMYXlvdXRKdXN0aWZpY2F0aW9uIHwgVmVydGljYWxMYXlvdXRKdXN0aWZpY2F0aW9uIHwgbnVsbDtcblxuICAvLyBXaGV0aGVyIGxpbmUtd3JhcHBpbmcgaXMgZW5hYmxlZC4gSWYgc28sIHRoZSBwcmltYXJ5IHByZWZlcnJlZCBheGlzIHdpbGwgZGV0ZXJtaW5lIHdoZXJlIHRoaW5ncyBhcmUgd3JhcHBlZC5cbiAgd3JhcD86IGJvb2xlYW47XG5cbiAgLy8gVGhlIHByZWZlcnJlZCB3aWR0aC9oZWlnaHQgKGlkZWFsbHkgZnJvbSBhIGNvbnRhaW5lcidzIGxvY2FsUHJlZmVycmVkV2lkdGgvbG9jYWxQcmVmZXJyZWRIZWlnaHQuXG4gIHByZWZlcnJlZFdpZHRoUHJvcGVydHk/OiBUUHJvcGVydHk8bnVtYmVyIHwgbnVsbD47XG4gIHByZWZlcnJlZEhlaWdodFByb3BlcnR5PzogVFByb3BlcnR5PG51bWJlciB8IG51bGw+O1xuXG4gIC8vIFRoZSBtaW5pbXVtIHdpZHRoL2hlaWdodCAoaWRlYWxseSBmcm9tIGEgY29udGFpbmVyJ3MgbG9jYWxNaW5pbXVtV2lkdGgvbG9jYWxNaW5pbXVtSGVpZ2h0LlxuICBtaW5pbXVtV2lkdGhQcm9wZXJ0eT86IFRQcm9wZXJ0eTxudW1iZXIgfCBudWxsPjtcbiAgbWluaW11bUhlaWdodFByb3BlcnR5PzogVFByb3BlcnR5PG51bWJlciB8IG51bGw+O1xufTtcbnR5cGUgUGFyZW50T3B0aW9ucyA9IEV4dGVybmFsRmxvd0NvbmZpZ3VyYWJsZU9wdGlvbnMgJiBOb2RlTGF5b3V0QXZhaWxhYmxlQ29uc3RyYWludE9wdGlvbnM7XG5leHBvcnQgdHlwZSBGbG93Q29uc3RyYWludE9wdGlvbnMgPSBTZWxmT3B0aW9ucyAmIFBhcmVudE9wdGlvbnM7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEZsb3dDb25zdHJhaW50IGV4dGVuZHMgRmxvd0NvbmZpZ3VyYWJsZSggTm9kZUxheW91dENvbnN0cmFpbnQgKSB7XG5cbiAgcHJpdmF0ZSByZWFkb25seSBjZWxsczogRmxvd0NlbGxbXSA9IFtdO1xuICBwcml2YXRlIF9qdXN0aWZ5OiBMYXlvdXRKdXN0aWZpY2F0aW9uID0gTGF5b3V0SnVzdGlmaWNhdGlvbi5TUEFDRV9CRVRXRUVOO1xuICBwcml2YXRlIF9qdXN0aWZ5TGluZXM6IExheW91dEp1c3RpZmljYXRpb24gfCBudWxsID0gbnVsbDtcbiAgcHJpdmF0ZSBfd3JhcCA9IGZhbHNlO1xuICBwcml2YXRlIF9zcGFjaW5nID0gMDtcbiAgcHJpdmF0ZSBfbGluZVNwYWNpbmcgPSAwO1xuXG4gIC8vIChzY2VuZXJ5LWludGVybmFsKVxuICBwdWJsaWMgZGlzcGxheWVkQ2VsbHM6IEZsb3dDZWxsW10gPSBbXTtcblxuICBwdWJsaWMgY29uc3RydWN0b3IoIGFuY2VzdG9yTm9kZTogTm9kZSwgcHJvdmlkZWRPcHRpb25zPzogRmxvd0NvbnN0cmFpbnRPcHRpb25zICkge1xuICAgIHN1cGVyKCBhbmNlc3Rvck5vZGUsIHByb3ZpZGVkT3B0aW9ucyApO1xuXG4gICAgLy8gU2V0IGNvbmZpZ3VyYXRpb24gdG8gYWN0dWFsIGRlZmF1bHQgdmFsdWVzIChpbnN0ZWFkIG9mIG51bGwpIHNvIHRoYXQgd2Ugd2lsbCBoYXZlIGd1YXJhbnRlZWQgbm9uLW51bGxcbiAgICAvLyAobm9uLWluaGVyaXQpIHZhbHVlcyBmb3Igb3VyIGNvbXB1dGF0aW9ucy5cbiAgICB0aGlzLnNldENvbmZpZ1RvQmFzZURlZmF1bHQoKTtcbiAgICB0aGlzLm11dGF0ZUNvbmZpZ3VyYWJsZSggcHJvdmlkZWRPcHRpb25zICk7XG4gICAgbXV0YXRlKCB0aGlzLCBGTE9XX0NPTlNUUkFJTlRfT1BUSU9OX0tFWVMsIHByb3ZpZGVkT3B0aW9ucyApO1xuXG4gICAgLy8gS2V5IGNvbmZpZ3VyYXRpb24gY2hhbmdlcyB0byByZWxheW91dFxuICAgIHRoaXMuY2hhbmdlZEVtaXR0ZXIuYWRkTGlzdGVuZXIoIHRoaXMuX3VwZGF0ZUxheW91dExpc3RlbmVyICk7XG5cbiAgICB0aGlzLm9yaWVudGF0aW9uQ2hhbmdlZEVtaXR0ZXIuYWRkTGlzdGVuZXIoICgpID0+IHRoaXMuY2VsbHMuZm9yRWFjaCggY2VsbCA9PiB7XG4gICAgICBjZWxsLm9yaWVudGF0aW9uID0gdGhpcy5vcmllbnRhdGlvbjtcbiAgICB9ICkgKTtcbiAgfVxuXG4gIHByaXZhdGUgdXBkYXRlU2VwYXJhdG9yVmlzaWJpbGl0eSgpOiB2b2lkIHtcbiAgICAvLyBGaW5kIHRoZSBpbmRleCBvZiB0aGUgZmlyc3QgdmlzaWJsZSBub24tc2VwYXJhdG9yIGNlbGwuIFRoZW4gaGlkZSBhbGwgc2VwYXJhdG9ycyB1bnRpbCB0aGlzIGluZGV4LlxuICAgIC8vIFRoaXMgaXMgbmVlZGVkLCBzbyB0aGF0IHdlIGRvIE5PVCB0ZW1wb3JhcmlseSBjaGFuZ2UgdGhlIHZpc2liaWxpdHkgb2Ygc2VwYXJhdG9ycyBiYWNrLWFuZC1mb3J0aCBkdXJpbmcgdGhlXG4gICAgLy8gbGF5b3V0LiBJZiB3ZSBkaWQgdGhhdCwgaXQgd291bGQgdHJpZ2dlciBhIGxheW91dCBpbnNpZGUgZXZlcnkgbGF5b3V0LCBsZWFkaW5nIHRvIGFuIGluZmluaXRlIGxvb3AuXG4gICAgLy8gVGhpcyBpcyBlZmZlY3RpdmVseSBkb25lIHNvIHRoYXQgd2UgaGF2ZSBOTyB2aXNpYmxlIHNlcGFyYXRvcnMgaW4gZnJvbnQgb2YgdGhlIGZpcnN0IHZpc2libGUgbm9uLXNlcGFyYXRvciBjZWxsXG4gICAgLy8gKHRodXMgc2F0aXNmeWluZyBvdXIgc2VwYXJhdG9yIGNvbnN0cmFpbnRzKS5cbiAgICBsZXQgZmlyc3RWaXNpYmxlTm9uU2VwYXJhdG9ySW5kZXggPSAwO1xuICAgIGZvciAoIDsgZmlyc3RWaXNpYmxlTm9uU2VwYXJhdG9ySW5kZXggPCB0aGlzLmNlbGxzLmxlbmd0aDsgZmlyc3RWaXNpYmxlTm9uU2VwYXJhdG9ySW5kZXgrKyApIHtcbiAgICAgIGNvbnN0IGNlbGwgPSB0aGlzLmNlbGxzWyBmaXJzdFZpc2libGVOb25TZXBhcmF0b3JJbmRleCBdO1xuICAgICAgaWYgKCBjZWxsLl9pc1NlcGFyYXRvciApIHtcbiAgICAgICAgY2VsbC5ub2RlLnZpc2libGUgPSBmYWxzZTtcbiAgICAgIH1cbiAgICAgIGVsc2UgaWYgKCBjZWxsLm5vZGUudmlzaWJsZSAmJiBjZWxsLm5vZGUuYm91bmRzUHJvcGVydHkudmFsdWUuaXNWYWxpZCgpICkge1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBTY2FuIGZvciBzZXBhcmF0b3JzLCB0b2dnbGluZyB2aXNpYmlsaXR5IGFzIGRlc2lyZWQuIExlYXZlIHRoZSBcImxhc3RcIiBzZXBhcmF0b3IgdmlzaWJsZSwgYXMgaWYgdGhleSBhcmUgbWFya2luZ1xuICAgIC8vIHNlY3Rpb25zIFwiYWZ0ZXJcIiB0aGVtc2VsdmVzLlxuICAgIGxldCBoYXNWaXNpYmxlTm9uU2VwYXJhdG9yID0gZmFsc2U7XG4gICAgZm9yICggbGV0IGkgPSB0aGlzLmNlbGxzLmxlbmd0aCAtIDE7IGkgPiBmaXJzdFZpc2libGVOb25TZXBhcmF0b3JJbmRleDsgaS0tICkge1xuICAgICAgY29uc3QgY2VsbCA9IHRoaXMuY2VsbHNbIGkgXTtcbiAgICAgIGlmICggY2VsbC5faXNTZXBhcmF0b3IgKSB7XG4gICAgICAgIGNlbGwubm9kZS52aXNpYmxlID0gaGFzVmlzaWJsZU5vblNlcGFyYXRvcjtcbiAgICAgICAgaGFzVmlzaWJsZU5vblNlcGFyYXRvciA9IGZhbHNlO1xuICAgICAgfVxuICAgICAgZWxzZSBpZiAoIGNlbGwubm9kZS52aXNpYmxlICYmIGNlbGwubm9kZS5ib3VuZHNQcm9wZXJ0eS52YWx1ZS5pc1ZhbGlkKCkgKSB7XG4gICAgICAgIGhhc1Zpc2libGVOb25TZXBhcmF0b3IgPSB0cnVlO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHByb3RlY3RlZCBvdmVycmlkZSBsYXlvdXQoKTogdm9pZCB7XG4gICAgc3VwZXIubGF5b3V0KCk7XG5cbiAgICAvLyBUaGUgb3JpZW50YXRpb24gYWxvbmcgdGhlIGxhaWQtb3V0IGxpbmVzIC0gYWxzbyBrbm93biBhcyB0aGUgXCJwcmltYXJ5XCIgYXhpc1xuICAgIGNvbnN0IG9yaWVudGF0aW9uID0gdGhpcy5fb3JpZW50YXRpb247XG5cbiAgICAvLyBUaGUgcGVycGVuZGljdWxhciBvcmllbnRhdGlvbiwgd2hlcmUgYWxpZ25tZW50IGlzIGhhbmRsZWQgLSBhbHNvIGtub3duIGFzIHRoZSBcInNlY29uZGFyeVwiIGF4aXNcbiAgICBjb25zdCBvcHBvc2l0ZU9yaWVudGF0aW9uID0gdGhpcy5fb3JpZW50YXRpb24ub3Bwb3NpdGU7XG5cbiAgICB0aGlzLnVwZGF0ZVNlcGFyYXRvclZpc2liaWxpdHkoKTtcblxuICAgIC8vIEZpbHRlciB0byBvbmx5IGNlbGxzIHVzZWQgaW4gdGhlIGxheW91dFxuICAgIGNvbnN0IGNlbGxzID0gdGhpcy5maWx0ZXJMYXlvdXRDZWxscyggdGhpcy5jZWxscyApO1xuXG4gICAgdGhpcy5kaXNwbGF5ZWRDZWxscyA9IGNlbGxzO1xuXG4gICAgaWYgKCAhY2VsbHMubGVuZ3RoICkge1xuICAgICAgdGhpcy5sYXlvdXRCb3VuZHNQcm9wZXJ0eS52YWx1ZSA9IEJvdW5kczIuTk9USElORztcbiAgICAgIHRoaXMubWluaW11bVdpZHRoUHJvcGVydHkudmFsdWUgPSBudWxsO1xuICAgICAgdGhpcy5taW5pbXVtSGVpZ2h0UHJvcGVydHkudmFsdWUgPSBudWxsO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIERldGVybWluZSBvdXIgcHJlZmVycmVkIHNpemVzICh0aGV5IGNhbiBiZSBudWxsLCBpbiB3aGljaCBjYXNlKVxuICAgIGxldCBwcmVmZXJyZWRTaXplOiBudW1iZXIgfCBudWxsID0gdGhpcy5nZXRQcmVmZXJyZWRQcm9wZXJ0eSggb3JpZW50YXRpb24gKS52YWx1ZTtcbiAgICBjb25zdCBwcmVmZXJyZWRPcHBvc2l0ZVNpemU6IG51bWJlciB8IG51bGwgPSB0aGlzLmdldFByZWZlcnJlZFByb3BlcnR5KCBvcHBvc2l0ZU9yaWVudGF0aW9uICkudmFsdWU7XG5cbiAgICAvLyBXaGF0IGlzIHRoZSBsYXJnZXN0IG9mIHRoZSBtaW5pbXVtIHNpemVzIG9mIGNlbGxzIChlLmcuIGlmIHdlJ3JlIHdyYXBwaW5nLCB0aGlzIHdvdWxkIGJlIG91ciBtaW5pbXVtIHNpemUpXG4gICAgY29uc3QgbWF4TWluaW11bUNlbGxTaXplOiBudW1iZXIgPSBNYXRoLm1heCggLi4uY2VsbHMubWFwKCBjZWxsID0+IGNlbGwuZ2V0TWluaW11bVNpemUoIG9yaWVudGF0aW9uICkgfHwgMCApICk7XG5cbiAgICAvLyBJZiB3ZSBjYW4ndCBmaXQgdGhlIGNvbnRlbnQuLi4ganVzdCBwcmV0ZW5kIGxpa2Ugd2UgaGF2ZSBhIGxhcmdlciBwcmVmZXJyZWQgc2l6ZSFcbiAgICBpZiAoIG1heE1pbmltdW1DZWxsU2l6ZSA+ICggcHJlZmVycmVkU2l6ZSB8fCBOdW1iZXIuUE9TSVRJVkVfSU5GSU5JVFkgKSApIHtcbiAgICAgIHByZWZlcnJlZFNpemUgPSBtYXhNaW5pbXVtQ2VsbFNpemU7XG4gICAgfVxuXG4gICAgLy8gV3JhcHBpbmcgYWxsIHRoZSBjZWxscyBpbnRvIGxpbmVzXG4gICAgY29uc3QgbGluZXM6IEZsb3dMaW5lW10gPSBbXTtcbiAgICBpZiAoIHRoaXMud3JhcCApIHtcbiAgICAgIGxldCBjdXJyZW50TGluZUNlbGxzOiBGbG93Q2VsbFtdID0gW107XG4gICAgICBsZXQgYXZhaWxhYmxlU3BhY2UgPSBwcmVmZXJyZWRTaXplIHx8IE51bWJlci5QT1NJVElWRV9JTkZJTklUWTtcblxuICAgICAgd2hpbGUgKCBjZWxscy5sZW5ndGggKSB7XG4gICAgICAgIGNvbnN0IGNlbGwgPSBjZWxscy5zaGlmdCgpITtcbiAgICAgICAgY29uc3QgY2VsbFNwYWNlID0gY2VsbC5nZXRNaW5pbXVtU2l6ZSggb3JpZW50YXRpb24gKTtcblxuICAgICAgICAvLyBJZiB3ZSdyZSB0aGUgdmVyeSBmaXJzdCBjZWxsLCBkb24ndCBjcmVhdGUgYSBuZXcgbGluZVxuICAgICAgICBpZiAoIGN1cnJlbnRMaW5lQ2VsbHMubGVuZ3RoID09PSAwICkge1xuICAgICAgICAgIGN1cnJlbnRMaW5lQ2VsbHMucHVzaCggY2VsbCApO1xuICAgICAgICAgIGF2YWlsYWJsZVNwYWNlIC09IGNlbGxTcGFjZTtcbiAgICAgICAgfVxuICAgICAgICAvLyBPdXIgY2VsbCBmaXRzISBFcHNpbG9uIGZvciBhdm9pZGluZyBmbG9hdGluZyBwb2ludCBpc3N1ZXNcbiAgICAgICAgZWxzZSBpZiAoIHRoaXMuc3BhY2luZyArIGNlbGxTcGFjZSA8PSBhdmFpbGFibGVTcGFjZSArIDFlLTcgKSB7XG4gICAgICAgICAgY3VycmVudExpbmVDZWxscy5wdXNoKCBjZWxsICk7XG4gICAgICAgICAgYXZhaWxhYmxlU3BhY2UgLT0gdGhpcy5zcGFjaW5nICsgY2VsbFNwYWNlO1xuICAgICAgICB9XG4gICAgICAgIC8vIFdlIGRvbid0IGZpdCwgY3JlYXRlIGEgbmV3IGxpbmVcbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgbGluZXMucHVzaCggRmxvd0xpbmUucG9vbC5jcmVhdGUoIG9yaWVudGF0aW9uLCBjdXJyZW50TGluZUNlbGxzICkgKTtcbiAgICAgICAgICBhdmFpbGFibGVTcGFjZSA9IHByZWZlcnJlZFNpemUgfHwgTnVtYmVyLlBPU0lUSVZFX0lORklOSVRZO1xuXG4gICAgICAgICAgY3VycmVudExpbmVDZWxscyA9IFsgY2VsbCBdO1xuICAgICAgICAgIGF2YWlsYWJsZVNwYWNlIC09IGNlbGxTcGFjZTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpZiAoIGN1cnJlbnRMaW5lQ2VsbHMubGVuZ3RoICkge1xuICAgICAgICBsaW5lcy5wdXNoKCBGbG93TGluZS5wb29sLmNyZWF0ZSggb3JpZW50YXRpb24sIGN1cnJlbnRMaW5lQ2VsbHMgKSApO1xuICAgICAgfVxuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIGxpbmVzLnB1c2goIEZsb3dMaW5lLnBvb2wuY3JlYXRlKCBvcmllbnRhdGlvbiwgY2VsbHMgKSApO1xuICAgIH1cblxuICAgIC8vIERldGVybWluZSBsaW5lIG9wcG9zaXRlLW9yaWVudGF0aW9uIG1pbi9tYXggc2l6ZXMgYW5kIG9yaWdpbiBzaXplcyAoaG93IHRhbGwgd2lsbCBhIHJvdyBoYXZlIHRvIGJlPylcbiAgICBsaW5lcy5mb3JFYWNoKCBsaW5lID0+IHtcbiAgICAgIGxpbmUuY2VsbHMuZm9yRWFjaCggY2VsbCA9PiB7XG4gICAgICAgIGxpbmUubWluID0gTWF0aC5tYXgoIGxpbmUubWluLCBjZWxsLmdldE1pbmltdW1TaXplKCBvcHBvc2l0ZU9yaWVudGF0aW9uICkgKTtcbiAgICAgICAgbGluZS5tYXggPSBNYXRoLm1pbiggbGluZS5tYXgsIGNlbGwuZ2V0TWF4aW11bVNpemUoIG9wcG9zaXRlT3JpZW50YXRpb24gKSApO1xuXG4gICAgICAgIC8vIEZvciBvcmlnaW4tc3BlY2lmaWVkIGNlbGxzLCB3ZSB3aWxsIHJlY29yZCB0aGVpciBtYXhpbXVtIHJlYWNoIGZyb20gdGhlIG9yaWdpbiwgc28gdGhlc2UgY2FuIGJlIFwic3VtbWVkXCJcbiAgICAgICAgLy8gKHNpbmNlIHRoZSBvcmlnaW4gbGluZSBtYXkgZW5kIHVwIHRha2luZyBtb3JlIHNwYWNlKS5cbiAgICAgICAgaWYgKCBjZWxsLmVmZmVjdGl2ZUFsaWduID09PSBMYXlvdXRBbGlnbi5PUklHSU4gKSB7XG4gICAgICAgICAgY29uc3Qgb3JpZ2luQm91bmRzID0gY2VsbC5nZXRPcmlnaW5Cb3VuZHMoKTtcbiAgICAgICAgICBsaW5lLm1pbk9yaWdpbiA9IE1hdGgubWluKCBvcmlnaW5Cb3VuZHNbIG9wcG9zaXRlT3JpZW50YXRpb24ubWluQ29vcmRpbmF0ZSBdLCBsaW5lLm1pbk9yaWdpbiApO1xuICAgICAgICAgIGxpbmUubWF4T3JpZ2luID0gTWF0aC5tYXgoIG9yaWdpbkJvdW5kc1sgb3Bwb3NpdGVPcmllbnRhdGlvbi5tYXhDb29yZGluYXRlIF0sIGxpbmUubWF4T3JpZ2luICk7XG4gICAgICAgIH1cbiAgICAgIH0gKTtcblxuICAgICAgLy8gSWYgd2UgaGF2ZSBhbGlnbjpvcmlnaW4gY29udGVudCwgd2UgbmVlZCB0byBzZWUgaWYgdGhlIG1heGltdW0gb3JpZ2luIHNwYW4gaXMgbGFyZ2VyIHRoYW4gb3IgbGluZSdzXG4gICAgICAvLyBtaW5pbXVtIHNpemUuXG4gICAgICBpZiAoIGlzRmluaXRlKCBsaW5lLm1pbk9yaWdpbiApICYmIGlzRmluaXRlKCBsaW5lLm1heE9yaWdpbiApICkge1xuICAgICAgICBsaW5lLnNpemUgPSBNYXRoLm1heCggbGluZS5taW4sIGxpbmUubWF4T3JpZ2luIC0gbGluZS5taW5PcmlnaW4gKTtcbiAgICAgIH1cbiAgICAgIGVsc2Uge1xuICAgICAgICBsaW5lLnNpemUgPSBsaW5lLm1pbjtcbiAgICAgIH1cbiAgICB9ICk7XG5cbiAgICAvLyBHaXZlbiBvdXIgd3JhcHBlZCBsaW5lcywgd2hhdCBpcyBvdXIgbWluaW11bSBzaXplIHdlIGNvdWxkIHRha2UgdXA/XG4gICAgY29uc3QgbWluaW11bUN1cnJlbnRTaXplOiBudW1iZXIgPSBNYXRoLm1heCggLi4ubGluZXMubWFwKCBsaW5lID0+IGxpbmUuZ2V0TWluaW11bVNpemUoIHRoaXMuc3BhY2luZyApICkgKTtcbiAgICBjb25zdCBtaW5pbXVtQ3VycmVudE9wcG9zaXRlU2l6ZSA9IF8uc3VtKCBsaW5lcy5tYXAoIGxpbmUgPT4gbGluZS5zaXplICkgKSArICggbGluZXMubGVuZ3RoIC0gMSApICogdGhpcy5saW5lU3BhY2luZztcblxuICAgIC8vIFVzZWQgZm9yIGRldGVybWluaW5nIG91ciBcIm1pbmltdW1cIiBzaXplIGZvciBwcmVmZXJyZWQgc2l6ZXMuLi4gaWYgd3JhcHBpbmcgaXMgZW5hYmxlZCwgd2UgY2FuIGJlIHNtYWxsZXIgdGhhblxuICAgIC8vIGN1cnJlbnQgbWluaW11bXNcbiAgICBjb25zdCBtaW5pbXVtQWxsb3dhYmxlU2l6ZSA9IHRoaXMud3JhcCA/IG1heE1pbmltdW1DZWxsU2l6ZSA6IG1pbmltdW1DdXJyZW50U2l6ZTtcblxuICAgIC8vIEluY3JlYXNlIHRoaW5ncyBpZiBvdXIgcHJlZmVycmVkIHNpemUgaXMgbGFyZ2VyIHRoYW4gb3VyIG1pbmltdW1zICh3ZSdsbCBmaWd1cmUgb3V0IGhvdyB0byBjb21wZW5zYXRlXG4gICAgLy8gZm9yIHRoZSBleHRyYSBzcGFjZSBiZWxvdykuXG4gICAgY29uc3Qgc2l6ZSA9IE1hdGgubWF4KCBtaW5pbXVtQ3VycmVudFNpemUsIHByZWZlcnJlZFNpemUgfHwgMCApO1xuICAgIGNvbnN0IG9wcG9zaXRlU2l6ZSA9IE1hdGgubWF4KCBtaW5pbXVtQ3VycmVudE9wcG9zaXRlU2l6ZSwgcHJlZmVycmVkT3Bwb3NpdGVTaXplIHx8IDAgKTtcblxuICAgIC8vIE91ciBsYXlvdXQgb3JpZ2luICh1c3VhbGx5IHRoZSB1cHBlci1sZWZ0IG9mIHRoZSBjb250ZW50IGluIGxvY2FsIGNvb3JkaW5hdGVzLCBidXQgY291bGQgYmUgZGlmZmVyZW50IGJhc2VkIG9uXG4gICAgLy8gYWxpZ246b3JpZ2luIGNvbnRlbnQuXG4gICAgY29uc3Qgb3JpZ2luUHJpbWFyeSA9IHRoaXMubGF5b3V0T3JpZ2luUHJvcGVydHkudmFsdWVbIG9yaWVudGF0aW9uLmNvb3JkaW5hdGUgXTtcbiAgICBjb25zdCBvcmlnaW5TZWNvbmRhcnkgPSB0aGlzLmxheW91dE9yaWdpblByb3BlcnR5LnZhbHVlWyBvcmllbnRhdGlvbi5vcHBvc2l0ZS5jb29yZGluYXRlIF07XG5cbiAgICAvLyBQcmltYXJ5LWRpcmVjdGlvbiBsYXlvdXRcbiAgICBsaW5lcy5mb3JFYWNoKCBsaW5lID0+IHtcbiAgICAgIGNvbnN0IG1pbmltdW1Db250ZW50ID0gXy5zdW0oIGxpbmUuY2VsbHMubWFwKCBjZWxsID0+IGNlbGwuZ2V0TWluaW11bVNpemUoIG9yaWVudGF0aW9uICkgKSApO1xuICAgICAgY29uc3Qgc3BhY2luZ0Ftb3VudCA9IHRoaXMuc3BhY2luZyAqICggbGluZS5jZWxscy5sZW5ndGggLSAxICk7XG4gICAgICBsZXQgc3BhY2VSZW1haW5pbmcgPSBzaXplIC0gbWluaW11bUNvbnRlbnQgLSBzcGFjaW5nQW1vdW50O1xuXG4gICAgICAvLyBJbml0aWFsIHBlbmRpbmcgc2l6ZXNcbiAgICAgIGxpbmUuY2VsbHMuZm9yRWFjaCggY2VsbCA9PiB7XG4gICAgICAgIGNlbGwuc2l6ZSA9IGNlbGwuZ2V0TWluaW11bVNpemUoIG9yaWVudGF0aW9uICk7XG4gICAgICB9ICk7XG5cbiAgICAgIC8vIEdyb3cgcG90ZW50aWFsIHNpemVzIGlmIHBvc3NpYmxlXG4gICAgICBsZXQgZ3Jvd2FibGVDZWxscztcbiAgICAgIHdoaWxlICggc3BhY2VSZW1haW5pbmcgPiAxZS03ICYmICggZ3Jvd2FibGVDZWxscyA9IGxpbmUuY2VsbHMuZmlsdGVyKCBjZWxsID0+IHtcbiAgICAgICAgLy8gQ2FuIHRoZSBjZWxsIGdyb3cgbW9yZT9cbiAgICAgICAgcmV0dXJuIGNlbGwuZWZmZWN0aXZlR3JvdyAhPT0gMCAmJiBjZWxsLnNpemUgPCBjZWxsLmdldE1heGltdW1TaXplKCBvcmllbnRhdGlvbiApIC0gMWUtNztcbiAgICAgIH0gKSApLmxlbmd0aCApIHtcbiAgICAgICAgLy8gVG90YWwgc3VtIG9mIFwiZ3Jvd1wiIHZhbHVlcyBpbiBjZWxscyB0aGF0IGNvdWxkIHBvdGVudGlhbGx5IGdyb3dcbiAgICAgICAgY29uc3QgdG90YWxHcm93ID0gXy5zdW0oIGdyb3dhYmxlQ2VsbHMubWFwKCBjZWxsID0+IGNlbGwuZWZmZWN0aXZlR3JvdyApICk7XG4gICAgICAgIGNvbnN0IGFtb3VudFRvR3JvdyA9IE1hdGgubWluKFxuICAgICAgICAgIC8vIFNtYWxsZXN0IGFtb3VudCB0aGF0IGFueSBvZiB0aGUgY2VsbHMgY291bGRuJ3QgZ3JvdyBwYXN0IChub3RlOiBwcm9wb3J0aW9uYWwgdG8gZWZmZWN0aXZlR3JvdylcbiAgICAgICAgICBNYXRoLm1pbiggLi4uZ3Jvd2FibGVDZWxscy5tYXAoIGNlbGwgPT4gKCBjZWxsLmdldE1heGltdW1TaXplKCBvcmllbnRhdGlvbiApIC0gY2VsbC5zaXplICkgLyBjZWxsLmVmZmVjdGl2ZUdyb3cgKSApLFxuXG4gICAgICAgICAgLy8gQW1vdW50IGVhY2ggY2VsbCBncm93cyBpZiBhbGwgb2Ygb3VyIGV4dHJhIHNwYWNlIGZpdHMgaW4gQUxMIHRoZSBjZWxsc1xuICAgICAgICAgIHNwYWNlUmVtYWluaW5nIC8gdG90YWxHcm93XG4gICAgICAgICk7XG5cbiAgICAgICAgYXNzZXJ0ICYmIGFzc2VydCggYW1vdW50VG9Hcm93ID4gMWUtMTEgKTtcblxuICAgICAgICBncm93YWJsZUNlbGxzLmZvckVhY2goIGNlbGwgPT4ge1xuICAgICAgICAgIGNlbGwuc2l6ZSArPSBhbW91bnRUb0dyb3cgKiBjZWxsLmVmZmVjdGl2ZUdyb3c7XG4gICAgICAgIH0gKTtcbiAgICAgICAgc3BhY2VSZW1haW5pbmcgLT0gYW1vdW50VG9Hcm93ICogdG90YWxHcm93O1xuICAgICAgfVxuXG4gICAgICAvLyBHaXZlcyBhZGRpdGlvbmFsIHNwYWNpbmcgYmFzZWQgb24ganVzdGlmaWNhdGlvblxuICAgICAgY29uc3QgcHJpbWFyeVNwYWNpbmdGdW5jdGlvbiA9IHRoaXMuX2p1c3RpZnkuc3BhY2luZ0Z1bmN0aW9uRmFjdG9yeSggc3BhY2VSZW1haW5pbmcsIGxpbmUuY2VsbHMubGVuZ3RoICk7XG5cbiAgICAgIGxldCBwb3NpdGlvbiA9IG9yaWdpblByaW1hcnk7XG4gICAgICBsaW5lLmNlbGxzLmZvckVhY2goICggY2VsbCwgaW5kZXggKSA9PiB7XG4gICAgICAgIC8vIEFsd2F5cyBpbmNsdWRlIGp1c3RpZnkgc3BhY2luZ1xuICAgICAgICBwb3NpdGlvbiArPSBwcmltYXJ5U3BhY2luZ0Z1bmN0aW9uKCBpbmRleCApO1xuXG4gICAgICAgIC8vIE9ubHkgaW5jbHVkZSBub3JtYWwgc3BhY2luZyBiZXR3ZWVuIGl0ZW1zXG4gICAgICAgIGlmICggaW5kZXggPiAwICkge1xuICAgICAgICAgIHBvc2l0aW9uICs9IHRoaXMuc3BhY2luZztcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFBvc2l0aW9uIGl0XG4gICAgICAgIC8vIEZsb3dDb25zdHJhaW50IGRvZXMgbm90IGhhdmUgb3B0aW9ucyB0byBjb250cm9sIHRoZSBtYWluLW9yaWVudGF0aW9uIHN0cmV0Y2ggb2YgZWFjaCBjZWxsLCBzbyB3ZSB3aWxsIGZpbGxcbiAgICAgICAgLy8gaW4gdGhlIHZhbHVlIHN0cmV0Y2g6dHJ1ZSB3aGVuIHBvc2l0aW9uaW5nIHRoZSBjZWxsLlxuICAgICAgICAvLyBGbG93Q29uc3RyYWludCBBTFNPIGNhbm5vdCB0YWtlIGFsaWduLW9yaWdpbiBpbiB0aGUgcHJpbWFyeSBkaXJlY3Rpb24sIHNvIHdlIGhhcmRjb2RlIGEgMCBmb3IgdGhlIG9yaWdpbiBvZmZzZXQsXG4gICAgICAgIC8vIHNpbmNlIGFsbCBvZiB0aGUgcG9zc2libGUgYWxpZ24gdmFsdWVzIHBhc3NlZCAoY2VsbC5lZmZlY3RpdmVDZWxsQWxpZ24pIHdpbGwgbm90IGJlIG9yaWdpbi1iYXNlZC5cbiAgICAgICAgY2VsbC5yZXBvc2l0aW9uKCBvcmllbnRhdGlvbiwgY2VsbC5zaXplLCBwb3NpdGlvbiwgdHJ1ZSwgMCwgY2VsbC5lZmZlY3RpdmVDZWxsQWxpZ24gKTtcblxuICAgICAgICBwb3NpdGlvbiArPSBjZWxsLnNpemU7XG4gICAgICAgIGFzc2VydCAmJiBhc3NlcnQoIHRoaXMuc3BhY2luZyA+PSAwIHx8IGNlbGwuc2l6ZSA+PSAtdGhpcy5zcGFjaW5nIC0gMWUtNyxcbiAgICAgICAgICAnTmVnYXRpdmUgc3BhY2luZyBtb3JlIHRoYW4gYSBjZWxsXFwncyBzaXplIGNhdXNlcyBpc3N1ZXMgd2l0aCBsYXlvdXQnICk7XG4gICAgICB9ICk7XG4gICAgfSApO1xuXG4gICAgLy8gU2Vjb25kYXJ5LWRpcmVjdGlvbiBsYXlvdXRcbiAgICBjb25zdCBvcHBvc2l0ZVNwYWNlUmVtYWluaW5nID0gb3Bwb3NpdGVTaXplIC0gbWluaW11bUN1cnJlbnRPcHBvc2l0ZVNpemU7XG4gICAgY29uc3QgaW5pdGlhbE9wcG9zaXRlUG9zaXRpb24gPSAoIGxpbmVzWyAwIF0uaGFzT3JpZ2luKCkgPyBsaW5lc1sgMCBdLm1pbk9yaWdpbiA6IDAgKSArIG9yaWdpblNlY29uZGFyeTtcbiAgICBsZXQgb3Bwb3NpdGVQb3NpdGlvbiA9IGluaXRpYWxPcHBvc2l0ZVBvc2l0aW9uO1xuICAgIGlmICggdGhpcy5fanVzdGlmeUxpbmVzID09PSBudWxsICkge1xuICAgICAgLy8gbnVsbCBqdXN0aWZ5TGluZXMgd2lsbCByZXN1bHQgaW4gZXhwYW5kaW5nIGFsbCBvZiBvdXIgbGluZXMgaW50byB0aGUgcmVtYWluaW5nIHNwYWNlLlxuXG4gICAgICAvLyBBZGQgc3BhY2UgcmVtYWluaW5nIGV2ZW5seSAoZm9yIG5vdykgc2luY2Ugd2UgZG9uJ3QgaGF2ZSBhbnkgZ3JvdyB2YWx1ZXNcbiAgICAgIGxpbmVzLmZvckVhY2goIGxpbmUgPT4ge1xuICAgICAgICBsaW5lLnNpemUgKz0gb3Bwb3NpdGVTcGFjZVJlbWFpbmluZyAvIGxpbmVzLmxlbmd0aDtcbiAgICAgIH0gKTtcblxuICAgICAgLy8gUG9zaXRpb24gdGhlIGxpbmVzXG4gICAgICBsaW5lcy5mb3JFYWNoKCBsaW5lID0+IHtcbiAgICAgICAgbGluZS5wb3NpdGlvbiA9IG9wcG9zaXRlUG9zaXRpb247XG4gICAgICAgIG9wcG9zaXRlUG9zaXRpb24gKz0gbGluZS5zaXplICsgdGhpcy5saW5lU3BhY2luZztcbiAgICAgIH0gKTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAvLyBJZiB3ZSdyZSBqdXN0aWZ5aW5nIGxpbmVzLCB3ZSB3b24ndCBhZGQgYW55IGFkZGl0aW9uYWwgc3BhY2UgaW50byB0aGluZ3NcbiAgICAgIGNvbnN0IHNwYWNpbmdGdW5jdGlvbiA9IHRoaXMuX2p1c3RpZnlMaW5lcy5zcGFjaW5nRnVuY3Rpb25GYWN0b3J5KCBvcHBvc2l0ZVNwYWNlUmVtYWluaW5nLCBsaW5lcy5sZW5ndGggKTtcblxuICAgICAgbGluZXMuZm9yRWFjaCggKCBsaW5lLCBpbmRleCApID0+IHtcbiAgICAgICAgb3Bwb3NpdGVQb3NpdGlvbiArPSBzcGFjaW5nRnVuY3Rpb24oIGluZGV4ICk7XG4gICAgICAgIGxpbmUucG9zaXRpb24gPSBvcHBvc2l0ZVBvc2l0aW9uO1xuICAgICAgICBvcHBvc2l0ZVBvc2l0aW9uICs9IGxpbmUuc2l6ZSArIHRoaXMubGluZVNwYWNpbmc7XG4gICAgICB9ICk7XG4gICAgfVxuICAgIGxpbmVzLmZvckVhY2goIGxpbmUgPT4gbGluZS5jZWxscy5mb3JFYWNoKCBjZWxsID0+IHtcbiAgICAgIGNlbGwucmVwb3NpdGlvbiggb3Bwb3NpdGVPcmllbnRhdGlvbiwgbGluZS5zaXplLCBsaW5lLnBvc2l0aW9uLCBjZWxsLmVmZmVjdGl2ZVN0cmV0Y2gsIC1saW5lLm1pbk9yaWdpbiwgY2VsbC5lZmZlY3RpdmVBbGlnbiApO1xuICAgIH0gKSApO1xuXG4gICAgLy8gRGV0ZXJtaW5lIHRoZSBzaXplIHdlIGFjdHVhbGx5IHRha2UgdXAgKGxvY2FsQm91bmRzIGZvciB0aGUgRmxvd0JveCB3aWxsIHVzZSB0aGlzKVxuICAgIGNvbnN0IG1pbkNvb3JkaW5hdGUgPSBvcmlnaW5QcmltYXJ5O1xuICAgIGNvbnN0IG1heENvb3JkaW5hdGUgPSBvcmlnaW5QcmltYXJ5ICsgc2l6ZTtcbiAgICBjb25zdCBtaW5PcHBvc2l0ZUNvb3JkaW5hdGUgPSBpbml0aWFsT3Bwb3NpdGVQb3NpdGlvbjtcbiAgICBjb25zdCBtYXhPcHBvc2l0ZUNvb3JkaW5hdGUgPSBpbml0aWFsT3Bwb3NpdGVQb3NpdGlvbiArIG9wcG9zaXRlU2l6ZTtcblxuICAgIC8vIFdlJ3JlIHRha2luZyB1cCB0aGVzZSBsYXlvdXQgYm91bmRzIChub2RlcyBjb3VsZCB1c2UgdGhlbSBmb3IgbG9jYWxCb3VuZHMpXG4gICAgdGhpcy5sYXlvdXRCb3VuZHNQcm9wZXJ0eS52YWx1ZSA9IEJvdW5kczIub3JpZW50ZWQoXG4gICAgICBvcmllbnRhdGlvbixcbiAgICAgIG1pbkNvb3JkaW5hdGUsXG4gICAgICBtaW5PcHBvc2l0ZUNvb3JkaW5hdGUsXG4gICAgICBtYXhDb29yZGluYXRlLFxuICAgICAgbWF4T3Bwb3NpdGVDb29yZGluYXRlXG4gICAgKTtcblxuICAgIC8vIFRlbGwgb3RoZXJzIGFib3V0IG91ciBuZXcgXCJtaW5pbXVtXCIgc2l6ZXNcbiAgICB0aGlzLm1pbmltdW1XaWR0aFByb3BlcnR5LnZhbHVlID0gb3JpZW50YXRpb24gPT09IE9yaWVudGF0aW9uLkhPUklaT05UQUwgPyBtaW5pbXVtQWxsb3dhYmxlU2l6ZSA6IG1pbmltdW1DdXJyZW50T3Bwb3NpdGVTaXplO1xuICAgIHRoaXMubWluaW11bUhlaWdodFByb3BlcnR5LnZhbHVlID0gb3JpZW50YXRpb24gPT09IE9yaWVudGF0aW9uLkhPUklaT05UQUwgPyBtaW5pbXVtQ3VycmVudE9wcG9zaXRlU2l6ZSA6IG1pbmltdW1BbGxvd2FibGVTaXplO1xuXG4gICAgdGhpcy5maW5pc2hlZExheW91dEVtaXR0ZXIuZW1pdCgpO1xuXG4gICAgbGluZXMuZm9yRWFjaCggbGluZSA9PiBsaW5lLmNsZWFuKCkgKTtcbiAgfVxuXG4gIHB1YmxpYyBnZXQganVzdGlmeSgpOiBIb3Jpem9udGFsTGF5b3V0SnVzdGlmaWNhdGlvbiB8IFZlcnRpY2FsTGF5b3V0SnVzdGlmaWNhdGlvbiB7XG4gICAgY29uc3QgcmVzdWx0ID0gTGF5b3V0SnVzdGlmaWNhdGlvbi5pbnRlcm5hbFRvSnVzdGlmeSggdGhpcy5fb3JpZW50YXRpb24sIHRoaXMuX2p1c3RpZnkgKTtcblxuICAgIGFzc2VydCAmJiBhc3NlcnQoIExheW91dEp1c3RpZmljYXRpb24uZ2V0QWxsb3dlZEp1c3RpZmljYXRpb25WYWx1ZXMoIHRoaXMuX29yaWVudGF0aW9uICkuaW5jbHVkZXMoIHJlc3VsdCApICk7XG5cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG5cbiAgcHVibGljIHNldCBqdXN0aWZ5KCB2YWx1ZTogSG9yaXpvbnRhbExheW91dEp1c3RpZmljYXRpb24gfCBWZXJ0aWNhbExheW91dEp1c3RpZmljYXRpb24gKSB7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggTGF5b3V0SnVzdGlmaWNhdGlvbi5nZXRBbGxvd2VkSnVzdGlmaWNhdGlvblZhbHVlcyggdGhpcy5fb3JpZW50YXRpb24gKS5pbmNsdWRlcyggdmFsdWUgKSxcbiAgICAgIGBqdXN0aWZ5ICR7dmFsdWV9IG5vdCBzdXBwb3J0ZWQsIHdpdGggdGhlIG9yaWVudGF0aW9uICR7dGhpcy5fb3JpZW50YXRpb259LCB0aGUgdmFsaWQgdmFsdWVzIGFyZSAke0xheW91dEp1c3RpZmljYXRpb24uZ2V0QWxsb3dlZEp1c3RpZmljYXRpb25WYWx1ZXMoIHRoaXMuX29yaWVudGF0aW9uICl9YCApO1xuXG4gICAgLy8gcmVtYXBwaW5nIGFsaWduIHZhbHVlcyB0byBhbiBpbmRlcGVuZGVudCBzZXQsIHNvIHRoZXkgYXJlbid0IG9yaWVudGF0aW9uLWRlcGVuZGVudFxuICAgIGNvbnN0IG1hcHBlZFZhbHVlID0gTGF5b3V0SnVzdGlmaWNhdGlvbi5qdXN0aWZ5VG9JbnRlcm5hbCggdGhpcy5fb3JpZW50YXRpb24sIHZhbHVlICk7XG5cbiAgICBpZiAoIHRoaXMuX2p1c3RpZnkgIT09IG1hcHBlZFZhbHVlICkge1xuICAgICAgdGhpcy5fanVzdGlmeSA9IG1hcHBlZFZhbHVlO1xuXG4gICAgICB0aGlzLnVwZGF0ZUxheW91dEF1dG9tYXRpY2FsbHkoKTtcbiAgICB9XG4gIH1cblxuICBwdWJsaWMgZ2V0IGp1c3RpZnlMaW5lcygpOiBIb3Jpem9udGFsTGF5b3V0SnVzdGlmaWNhdGlvbiB8IFZlcnRpY2FsTGF5b3V0SnVzdGlmaWNhdGlvbiB8IG51bGwge1xuICAgIGlmICggdGhpcy5fanVzdGlmeUxpbmVzID09PSBudWxsICkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgY29uc3QgcmVzdWx0ID0gTGF5b3V0SnVzdGlmaWNhdGlvbi5pbnRlcm5hbFRvSnVzdGlmeSggdGhpcy5fb3JpZW50YXRpb24sIHRoaXMuX2p1c3RpZnlMaW5lcyApO1xuXG4gICAgICBhc3NlcnQgJiYgYXNzZXJ0KCBMYXlvdXRKdXN0aWZpY2F0aW9uLmdldEFsbG93ZWRKdXN0aWZpY2F0aW9uVmFsdWVzKCB0aGlzLl9vcmllbnRhdGlvbiApLmluY2x1ZGVzKCByZXN1bHQgKSApO1xuXG4gICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH1cbiAgfVxuXG4gIHB1YmxpYyBzZXQganVzdGlmeUxpbmVzKCB2YWx1ZTogSG9yaXpvbnRhbExheW91dEp1c3RpZmljYXRpb24gfCBWZXJ0aWNhbExheW91dEp1c3RpZmljYXRpb24gfCBudWxsICkge1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIHZhbHVlID09PSBudWxsIHx8IExheW91dEp1c3RpZmljYXRpb24uZ2V0QWxsb3dlZEp1c3RpZmljYXRpb25WYWx1ZXMoIHRoaXMuX29yaWVudGF0aW9uLm9wcG9zaXRlICkuaW5jbHVkZXMoIHZhbHVlICksXG4gICAgICBganVzdGlmeSAke3ZhbHVlfSBub3Qgc3VwcG9ydGVkLCB3aXRoIHRoZSBvcmllbnRhdGlvbiAke3RoaXMuX29yaWVudGF0aW9uLm9wcG9zaXRlfSwgdGhlIHZhbGlkIHZhbHVlcyBhcmUgJHtMYXlvdXRKdXN0aWZpY2F0aW9uLmdldEFsbG93ZWRKdXN0aWZpY2F0aW9uVmFsdWVzKCB0aGlzLl9vcmllbnRhdGlvbi5vcHBvc2l0ZSApfSBvciBudWxsYCApO1xuXG4gICAgLy8gcmVtYXBwaW5nIGFsaWduIHZhbHVlcyB0byBhbiBpbmRlcGVuZGVudCBzZXQsIHNvIHRoZXkgYXJlbid0IG9yaWVudGF0aW9uLWRlcGVuZGVudFxuICAgIGNvbnN0IG1hcHBlZFZhbHVlID0gdmFsdWUgPT09IG51bGwgPyBudWxsIDogTGF5b3V0SnVzdGlmaWNhdGlvbi5qdXN0aWZ5VG9JbnRlcm5hbCggdGhpcy5fb3JpZW50YXRpb24ub3Bwb3NpdGUsIHZhbHVlICk7XG5cbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBtYXBwZWRWYWx1ZSA9PT0gbnVsbCB8fCBtYXBwZWRWYWx1ZSBpbnN0YW5jZW9mIExheW91dEp1c3RpZmljYXRpb24gKTtcblxuICAgIGlmICggdGhpcy5fanVzdGlmeUxpbmVzICE9PSBtYXBwZWRWYWx1ZSApIHtcbiAgICAgIHRoaXMuX2p1c3RpZnlMaW5lcyA9IG1hcHBlZFZhbHVlO1xuXG4gICAgICB0aGlzLnVwZGF0ZUxheW91dEF1dG9tYXRpY2FsbHkoKTtcbiAgICB9XG4gIH1cblxuICBwdWJsaWMgZ2V0IHdyYXAoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuX3dyYXA7XG4gIH1cblxuICBwdWJsaWMgc2V0IHdyYXAoIHZhbHVlOiBib29sZWFuICkge1xuICAgIGlmICggdGhpcy5fd3JhcCAhPT0gdmFsdWUgKSB7XG4gICAgICB0aGlzLl93cmFwID0gdmFsdWU7XG5cbiAgICAgIHRoaXMudXBkYXRlTGF5b3V0QXV0b21hdGljYWxseSgpO1xuICAgIH1cbiAgfVxuXG4gIHB1YmxpYyBnZXQgc3BhY2luZygpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLl9zcGFjaW5nO1xuICB9XG5cbiAgcHVibGljIHNldCBzcGFjaW5nKCB2YWx1ZTogbnVtYmVyICkge1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIGlzRmluaXRlKCB2YWx1ZSApICk7XG5cbiAgICBpZiAoIHRoaXMuX3NwYWNpbmcgIT09IHZhbHVlICkge1xuICAgICAgdGhpcy5fc3BhY2luZyA9IHZhbHVlO1xuXG4gICAgICB0aGlzLnVwZGF0ZUxheW91dEF1dG9tYXRpY2FsbHkoKTtcbiAgICB9XG4gIH1cblxuICBwdWJsaWMgZ2V0IGxpbmVTcGFjaW5nKCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMuX2xpbmVTcGFjaW5nO1xuICB9XG5cbiAgcHVibGljIHNldCBsaW5lU3BhY2luZyggdmFsdWU6IG51bWJlciApIHtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBpc0Zpbml0ZSggdmFsdWUgKSApO1xuXG4gICAgaWYgKCB0aGlzLl9saW5lU3BhY2luZyAhPT0gdmFsdWUgKSB7XG4gICAgICB0aGlzLl9saW5lU3BhY2luZyA9IHZhbHVlO1xuXG4gICAgICB0aGlzLnVwZGF0ZUxheW91dEF1dG9tYXRpY2FsbHkoKTtcbiAgICB9XG4gIH1cblxuICBwdWJsaWMgaW5zZXJ0Q2VsbCggaW5kZXg6IG51bWJlciwgY2VsbDogRmxvd0NlbGwgKTogdm9pZCB7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggaW5kZXggPj0gMCApO1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIGluZGV4IDw9IHRoaXMuY2VsbHMubGVuZ3RoICk7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggIV8uaW5jbHVkZXMoIHRoaXMuY2VsbHMsIGNlbGwgKSApO1xuXG4gICAgY2VsbC5vcmllbnRhdGlvbiA9IHRoaXMub3JpZW50YXRpb247XG5cbiAgICB0aGlzLmNlbGxzLnNwbGljZSggaW5kZXgsIDAsIGNlbGwgKTtcbiAgICB0aGlzLmFkZE5vZGUoIGNlbGwubm9kZSApO1xuICAgIGNlbGwuY2hhbmdlZEVtaXR0ZXIuYWRkTGlzdGVuZXIoIHRoaXMuX3VwZGF0ZUxheW91dExpc3RlbmVyICk7XG5cbiAgICB0aGlzLnVwZGF0ZUxheW91dEF1dG9tYXRpY2FsbHkoKTtcbiAgfVxuXG4gIHB1YmxpYyByZW1vdmVDZWxsKCBjZWxsOiBGbG93Q2VsbCApOiB2b2lkIHtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBfLmluY2x1ZGVzKCB0aGlzLmNlbGxzLCBjZWxsICkgKTtcblxuICAgIGFycmF5UmVtb3ZlKCB0aGlzLmNlbGxzLCBjZWxsICk7XG4gICAgdGhpcy5yZW1vdmVOb2RlKCBjZWxsLm5vZGUgKTtcbiAgICBjZWxsLmNoYW5nZWRFbWl0dGVyLnJlbW92ZUxpc3RlbmVyKCB0aGlzLl91cGRhdGVMYXlvdXRMaXN0ZW5lciApO1xuXG4gICAgdGhpcy51cGRhdGVMYXlvdXRBdXRvbWF0aWNhbGx5KCk7XG4gIH1cblxuICBwdWJsaWMgcmVvcmRlckNlbGxzKCBjZWxsczogRmxvd0NlbGxbXSwgbWluQ2hhbmdlSW5kZXg6IG51bWJlciwgbWF4Q2hhbmdlSW5kZXg6IG51bWJlciApOiB2b2lkIHtcbiAgICB0aGlzLmNlbGxzLnNwbGljZSggbWluQ2hhbmdlSW5kZXgsIG1heENoYW5nZUluZGV4IC0gbWluQ2hhbmdlSW5kZXggKyAxLCAuLi5jZWxscyApO1xuXG4gICAgdGhpcy51cGRhdGVMYXlvdXRBdXRvbWF0aWNhbGx5KCk7XG4gIH1cblxuICAvLyAoc2NlbmVyeS1pbnRlcm5hbClcbiAgcHVibGljIGdldFByZWZlcnJlZFByb3BlcnR5KCBvcmllbnRhdGlvbjogT3JpZW50YXRpb24gKTogVFByb3BlcnR5PG51bWJlciB8IG51bGw+IHtcbiAgICByZXR1cm4gb3JpZW50YXRpb24gPT09IE9yaWVudGF0aW9uLkhPUklaT05UQUwgPyB0aGlzLnByZWZlcnJlZFdpZHRoUHJvcGVydHkgOiB0aGlzLnByZWZlcnJlZEhlaWdodFByb3BlcnR5O1xuICB9XG5cbiAgLyoqXG4gICAqIFJlbGVhc2VzIHJlZmVyZW5jZXNcbiAgICovXG4gIHB1YmxpYyBvdmVycmlkZSBkaXNwb3NlKCk6IHZvaWQge1xuICAgIC8vIExvY2sgZHVyaW5nIGRpc3Bvc2FsIHRvIGF2b2lkIGxheW91dCBjYWxsc1xuICAgIHRoaXMubG9jaygpO1xuXG4gICAgdGhpcy5jZWxscy5mb3JFYWNoKCBjZWxsID0+IHRoaXMucmVtb3ZlQ2VsbCggY2VsbCApICk7XG4gICAgdGhpcy5kaXNwbGF5ZWRDZWxscyA9IFtdO1xuXG4gICAgc3VwZXIuZGlzcG9zZSgpO1xuXG4gICAgdGhpcy51bmxvY2soKTtcbiAgfVxuXG4gIHB1YmxpYyBzdGF0aWMgY3JlYXRlKCBhbmNlc3Rvck5vZGU6IE5vZGUsIG9wdGlvbnM/OiBGbG93Q29uc3RyYWludE9wdGlvbnMgKTogRmxvd0NvbnN0cmFpbnQge1xuICAgIHJldHVybiBuZXcgRmxvd0NvbnN0cmFpbnQoIGFuY2VzdG9yTm9kZSwgb3B0aW9ucyApO1xuICB9XG59XG5cbnNjZW5lcnkucmVnaXN0ZXIoICdGbG93Q29uc3RyYWludCcsIEZsb3dDb25zdHJhaW50ICk7XG5leHBvcnQgeyBGTE9XX0NPTlNUUkFJTlRfT1BUSU9OX0tFWVMgfTsiXSwibmFtZXMiOlsiQm91bmRzMiIsImFycmF5UmVtb3ZlIiwibXV0YXRlIiwiT3JpZW50YXRpb24iLCJGTE9XX0NPTkZJR1VSQUJMRV9PUFRJT05fS0VZUyIsIkZsb3dDb25maWd1cmFibGUiLCJGbG93TGluZSIsIkxheW91dEFsaWduIiwiTGF5b3V0SnVzdGlmaWNhdGlvbiIsIk5vZGVMYXlvdXRDb25zdHJhaW50Iiwic2NlbmVyeSIsIkZMT1dfQ09OU1RSQUlOVF9PUFRJT05fS0VZUyIsIkZsb3dDb25zdHJhaW50IiwidXBkYXRlU2VwYXJhdG9yVmlzaWJpbGl0eSIsImZpcnN0VmlzaWJsZU5vblNlcGFyYXRvckluZGV4IiwiY2VsbHMiLCJsZW5ndGgiLCJjZWxsIiwiX2lzU2VwYXJhdG9yIiwibm9kZSIsInZpc2libGUiLCJib3VuZHNQcm9wZXJ0eSIsInZhbHVlIiwiaXNWYWxpZCIsImhhc1Zpc2libGVOb25TZXBhcmF0b3IiLCJpIiwibGF5b3V0Iiwib3JpZW50YXRpb24iLCJfb3JpZW50YXRpb24iLCJvcHBvc2l0ZU9yaWVudGF0aW9uIiwib3Bwb3NpdGUiLCJmaWx0ZXJMYXlvdXRDZWxscyIsImRpc3BsYXllZENlbGxzIiwibGF5b3V0Qm91bmRzUHJvcGVydHkiLCJOT1RISU5HIiwibWluaW11bVdpZHRoUHJvcGVydHkiLCJtaW5pbXVtSGVpZ2h0UHJvcGVydHkiLCJwcmVmZXJyZWRTaXplIiwiZ2V0UHJlZmVycmVkUHJvcGVydHkiLCJwcmVmZXJyZWRPcHBvc2l0ZVNpemUiLCJtYXhNaW5pbXVtQ2VsbFNpemUiLCJNYXRoIiwibWF4IiwibWFwIiwiZ2V0TWluaW11bVNpemUiLCJOdW1iZXIiLCJQT1NJVElWRV9JTkZJTklUWSIsImxpbmVzIiwid3JhcCIsImN1cnJlbnRMaW5lQ2VsbHMiLCJhdmFpbGFibGVTcGFjZSIsInNoaWZ0IiwiY2VsbFNwYWNlIiwicHVzaCIsInNwYWNpbmciLCJwb29sIiwiY3JlYXRlIiwiZm9yRWFjaCIsImxpbmUiLCJtaW4iLCJnZXRNYXhpbXVtU2l6ZSIsImVmZmVjdGl2ZUFsaWduIiwiT1JJR0lOIiwib3JpZ2luQm91bmRzIiwiZ2V0T3JpZ2luQm91bmRzIiwibWluT3JpZ2luIiwibWluQ29vcmRpbmF0ZSIsIm1heE9yaWdpbiIsIm1heENvb3JkaW5hdGUiLCJpc0Zpbml0ZSIsInNpemUiLCJtaW5pbXVtQ3VycmVudFNpemUiLCJtaW5pbXVtQ3VycmVudE9wcG9zaXRlU2l6ZSIsIl8iLCJzdW0iLCJsaW5lU3BhY2luZyIsIm1pbmltdW1BbGxvd2FibGVTaXplIiwib3Bwb3NpdGVTaXplIiwib3JpZ2luUHJpbWFyeSIsImxheW91dE9yaWdpblByb3BlcnR5IiwiY29vcmRpbmF0ZSIsIm9yaWdpblNlY29uZGFyeSIsIm1pbmltdW1Db250ZW50Iiwic3BhY2luZ0Ftb3VudCIsInNwYWNlUmVtYWluaW5nIiwiZ3Jvd2FibGVDZWxscyIsImZpbHRlciIsImVmZmVjdGl2ZUdyb3ciLCJ0b3RhbEdyb3ciLCJhbW91bnRUb0dyb3ciLCJhc3NlcnQiLCJwcmltYXJ5U3BhY2luZ0Z1bmN0aW9uIiwiX2p1c3RpZnkiLCJzcGFjaW5nRnVuY3Rpb25GYWN0b3J5IiwicG9zaXRpb24iLCJpbmRleCIsInJlcG9zaXRpb24iLCJlZmZlY3RpdmVDZWxsQWxpZ24iLCJvcHBvc2l0ZVNwYWNlUmVtYWluaW5nIiwiaW5pdGlhbE9wcG9zaXRlUG9zaXRpb24iLCJoYXNPcmlnaW4iLCJvcHBvc2l0ZVBvc2l0aW9uIiwiX2p1c3RpZnlMaW5lcyIsInNwYWNpbmdGdW5jdGlvbiIsImVmZmVjdGl2ZVN0cmV0Y2giLCJtaW5PcHBvc2l0ZUNvb3JkaW5hdGUiLCJtYXhPcHBvc2l0ZUNvb3JkaW5hdGUiLCJvcmllbnRlZCIsIkhPUklaT05UQUwiLCJmaW5pc2hlZExheW91dEVtaXR0ZXIiLCJlbWl0IiwiY2xlYW4iLCJqdXN0aWZ5IiwicmVzdWx0IiwiaW50ZXJuYWxUb0p1c3RpZnkiLCJnZXRBbGxvd2VkSnVzdGlmaWNhdGlvblZhbHVlcyIsImluY2x1ZGVzIiwibWFwcGVkVmFsdWUiLCJqdXN0aWZ5VG9JbnRlcm5hbCIsInVwZGF0ZUxheW91dEF1dG9tYXRpY2FsbHkiLCJqdXN0aWZ5TGluZXMiLCJfd3JhcCIsIl9zcGFjaW5nIiwiX2xpbmVTcGFjaW5nIiwiaW5zZXJ0Q2VsbCIsInNwbGljZSIsImFkZE5vZGUiLCJjaGFuZ2VkRW1pdHRlciIsImFkZExpc3RlbmVyIiwiX3VwZGF0ZUxheW91dExpc3RlbmVyIiwicmVtb3ZlQ2VsbCIsInJlbW92ZU5vZGUiLCJyZW1vdmVMaXN0ZW5lciIsInJlb3JkZXJDZWxscyIsIm1pbkNoYW5nZUluZGV4IiwibWF4Q2hhbmdlSW5kZXgiLCJwcmVmZXJyZWRXaWR0aFByb3BlcnR5IiwicHJlZmVycmVkSGVpZ2h0UHJvcGVydHkiLCJkaXNwb3NlIiwibG9jayIsInVubG9jayIsImFuY2VzdG9yTm9kZSIsIm9wdGlvbnMiLCJwcm92aWRlZE9wdGlvbnMiLCJTUEFDRV9CRVRXRUVOIiwic2V0Q29uZmlnVG9CYXNlRGVmYXVsdCIsIm11dGF0ZUNvbmZpZ3VyYWJsZSIsIm9yaWVudGF0aW9uQ2hhbmdlZEVtaXR0ZXIiLCJyZWdpc3RlciJdLCJtYXBwaW5ncyI6IkFBQUEsc0RBQXNEO0FBRXREOzs7OztDQUtDLEdBR0QsT0FBT0EsYUFBYSxnQ0FBZ0M7QUFDcEQsT0FBT0MsaUJBQWlCLDBDQUEwQztBQUNsRSxPQUFPQyxZQUFZLHFDQUFxQztBQUN4RCxPQUFPQyxpQkFBaUIsMENBQTBDO0FBQ2xFLFNBQTBDQyw2QkFBNkIsRUFBWUMsZ0JBQWdCLEVBQUVDLFFBQVEsRUFBaUNDLFdBQVcsRUFBRUMsbUJBQW1CLEVBQThDQyxvQkFBb0IsRUFBRUMsT0FBTyxRQUFxQyxtQkFBbUI7QUFFalQs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