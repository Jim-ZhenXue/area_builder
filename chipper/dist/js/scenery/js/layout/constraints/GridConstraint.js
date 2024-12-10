// Copyright 2021-2024, University of Colorado Boulder
/**
 * Main grid-layout logic. Usually used indirectly through GridBox, but can also be used directly (say, if nodes don't
 * have the same parent, or a GridBox can't be used).
 *
 * Throughout the documentation for grid-related items, the term "line" refers to either a row or column (depending on
 * the orientation).
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ import Bounds2 from '../../../../dot/js/Bounds2.js';
import mutate from '../../../../phet-core/js/mutate.js';
import Orientation from '../../../../phet-core/js/Orientation.js';
import OrientationPair from '../../../../phet-core/js/OrientationPair.js';
import { GRID_CONFIGURABLE_OPTION_KEYS, GridConfigurable, GridLine, LayoutAlign, NodeLayoutConstraint, scenery } from '../../imports.js';
const GRID_CONSTRAINT_OPTION_KEYS = [
    ...GRID_CONFIGURABLE_OPTION_KEYS,
    'excludeInvisible',
    'spacing',
    'xSpacing',
    'ySpacing'
];
let GridConstraint = class GridConstraint extends GridConfigurable(NodeLayoutConstraint) {
    layout() {
        super.layout();
        // Only grab the cells that will participate in layout
        const cells = this.filterLayoutCells([
            ...this.cells
        ]);
        this.displayedCells = cells;
        if (!cells.length) {
            this.layoutBoundsProperty.value = Bounds2.NOTHING;
            this.minimumWidthProperty.value = null;
            this.minimumHeightProperty.value = null;
            // Synchronize our displayedLines, if it's used for display (e.g. GridBackgroundNode)
            this.displayedLines.forEach((map)=>map.clear());
            return;
        }
        const minimumSizes = new OrientationPair(0, 0);
        const preferredSizes = new OrientationPair(this.preferredWidthProperty.value, this.preferredHeightProperty.value);
        const layoutBounds = new Bounds2(0, 0, 0, 0);
        // Handle horizontal first, so if we re-wrap we can handle vertical later.
        [
            Orientation.HORIZONTAL,
            Orientation.VERTICAL
        ].forEach((orientation)=>{
            const orientedSpacing = this._spacing.get(orientation);
            // index => GridLine
            const lineMap = this.displayedLines.get(orientation);
            // Clear out the lineMap
            lineMap.forEach((line)=>line.clean());
            lineMap.clear();
            // What are all the line indices used by displayed cells? There could be gaps. We pretend like those gaps
            // don't exist (except for spacing)
            const lineIndices = _.sortedUniq(_.sortBy(_.flatten(cells.map((cell)=>cell.getIndices(orientation)))));
            const lines = lineIndices.map((index)=>{
                // Recall, cells can include multiple lines in the same orientation if they have width/height>1
                const subCells = _.filter(cells, (cell)=>cell.containsIndex(orientation, index));
                // For now, we'll use the maximum grow value included in this line
                const grow = Math.max(...subCells.map((cell)=>cell.getEffectiveGrow(orientation)));
                const line = GridLine.pool.create(index, subCells, grow);
                lineMap.set(index, line);
                return line;
            });
            const cellToLinesMap = new Map(cells.map((cell)=>{
                return [
                    cell,
                    cell.getIndices(orientation).map((index)=>{
                        const line = lineMap.get(index);
                        assert && assert(line);
                        return line;
                    })
                ];
            }));
            const linesIn = (cell)=>cellToLinesMap.get(cell);
            // Convert a simple spacing number (or a spacing array) into a spacing array of the correct size, only including
            // spacings AFTER our actually-visible lines. We'll also skip the spacing after the last line, as it won't be used
            const lineSpacings = lines.slice(0, -1).map((line)=>{
                return typeof orientedSpacing === 'number' ? orientedSpacing : orientedSpacing[line.index];
            });
            // Scan sizes for single-line cells first
            cells.forEach((cell)=>{
                if (cell.size.get(orientation) === 1) {
                    const line = lineMap.get(cell.position.get(orientation));
                    line.min = Math.max(line.min, cell.getMinimumSize(orientation));
                    line.max = Math.min(line.max, cell.getMaximumSize(orientation));
                    // For origin-specified cells, we will record their maximum reach from the origin, so these can be "summed"
                    // (since the origin line may end up taking more space).
                    if (cell.getEffectiveAlign(orientation) === LayoutAlign.ORIGIN) {
                        const originBounds = cell.getOriginBounds();
                        line.minOrigin = Math.min(originBounds[orientation.minCoordinate], line.minOrigin);
                        line.maxOrigin = Math.max(originBounds[orientation.maxCoordinate], line.maxOrigin);
                    }
                }
            });
            // Then increase for spanning cells as necessary
            {
                // Problem:
                //   Cells that span multiple lines (e.g. horizontalSpan/verticalSpan > 1) may be larger than the sum of their
                //   lines' sizes. We need to grow the lines to accommodate these cells.
                //
                // Constraint:
                //   Cells also can have maximum sizes. We don't want to grow lines in a way that would break this type of constraint.
                //
                // Goals:
                //   Do the above, but try to spread out extra space proportionally. If `grow` is specified on cells (a line),
                //   try to use that to dump space into those sections.
                // An iterative approach, where we will try to grow lines.
                //
                // Every step, we will determine:
                // 1. Grow constraints (how much is the most we'd need to grow things to satisfy an unsatisfied cell)
                // 2. Max constraints (some cells might have a maximum size constraint)
                // 3. Growable lines (the lines, given the above, that have a non-zero amount they can grow).
                // 4. Weights for each growable line (HOW FAST we should grow the lines, proportionally).
                //
                // We will then see how much we can grow before hitting the FIRST constraint, do that, and then continue
                // iteration.
                //
                // This is complicated by the fact that some "max constraints" might have grown enough that none of their
                // lines should increase in size. When that happens, we'll need to add those lines to the "forbidden" list,
                // and recompute things.
                // NOTE: If this is suboptimal, we could try a force-directed iterative algorithm to minimize a specific loss
                // function (or just... convex optimization).
                const epsilon = 1e-9;
                // What is the current (minimum) size of a cell
                const getCurrentCellSize = (cell)=>{
                    return _.sum(linesIn(cell).map((line)=>line.min));
                };
                // A cell is "unsatisfied" if its current size is less than its minimum size
                const isUnsatisfied = (cell)=>{
                    return getCurrentCellSize(cell) < cell.getMinimumSize(orientation) - epsilon;
                };
                // We may need to "forbid" certain lines from growing further, even if they are not at THEIR limit.
                // Then we can recompute things based on that lines are allowed to grow.
                const forbiddenLines = new Set();
                // Whether our line can grow (i.e. it's not at its maximum size, and it's not forbidden)
                const lineCanGrow = (line)=>{
                    return (!isFinite(line.max) || line.min < line.max - epsilon) && !forbiddenLines.has(line);
                };
                // Cells that:
                // 1. Span multiple lines (since we handled single-line cells above)
                // 2. Are unsatisfied (i.e. their current size is less than their minimum size)
                let unsatisfiedSpanningCells = cells.filter((cell)=>cell.size.get(orientation) > 1).filter(isUnsatisfied);
                // NOTE: It may be possible to actually SKIP the above "single-line cell" step, and size things up JUST using
                // this algorithm. It is unclear whether it would result in decent quality.
                // We'll iterate until we have satisfied all of the unsatisfied cells OR we'll bail (with a break) if
                // we can't grow any further. Otherwise, every step will grow at least something, so we will make incremental
                // forward progress.
                while(unsatisfiedSpanningCells.length){
                    // Gets the applicable (non-zero) grow constraint for a cell, or returns null if it does not need to be grown
                    // (or cannot be grown and doesn't fail assertions).
                    // We are somewhat permissive here for the runtime, even if assertions would fail we'll try to keep going.
                    const getGrowConstraint = (cell)=>{
                        assert && assert(isUnsatisfied(cell));
                        const growableLines = linesIn(cell).filter(lineCanGrow);
                        assert && assert(growableLines.length, 'GridCell for Node cannot find space due to maximum-size constraints');
                        if (!growableLines.length) {
                            return null;
                        }
                        const currentSize = getCurrentCellSize(cell);
                        const neededMinSize = cell.getMinimumSize(orientation);
                        // How much space will need to be added (in total) to satisfy the cell.
                        const space = neededMinSize - currentSize;
                        assert && assert(space > 0);
                        if (space < epsilon) {
                            return null;
                        }
                        // We'll check the "grow" values, IF there are any non-zero. If there are, we will use those proportionally
                        // to reallocate space.
                        //
                        // IF THERE IS NO NON-ZERO GROW VALUES, we will just evenly distribute the space.
                        const totalLinesGrow = _.sum(growableLines.map((line)=>line.grow));
                        return {
                            cell: cell,
                            growingLines: growableLines.slice(),
                            space: space,
                            weights: new Map(growableLines.map((line)=>{
                                let weight;
                                if (totalLinesGrow > 0) {
                                    weight = space * (line.grow / totalLinesGrow);
                                } else {
                                    weight = space / growableLines.length;
                                }
                                return [
                                    line,
                                    weight
                                ];
                            }))
                        };
                    };
                    // Initialize grow constraints
                    let growConstraints = [];
                    for (const cell of unsatisfiedSpanningCells){
                        const growConstraint = getGrowConstraint(cell);
                        if (growConstraint) {
                            growConstraints.push(growConstraint);
                        }
                    }
                    // We'll need to recompute. We'll see which ones we can keep and which we can recompute (based on forbidden lines)
                    const recomputeGrowConstraints = ()=>{
                        growConstraints = growConstraints.map((constraint)=>{
                            if (constraint.growingLines.some((line)=>forbiddenLines.has(line))) {
                                return getGrowConstraint(constraint.cell);
                            } else {
                                return constraint;
                            }
                        }).filter((constraint)=>constraint !== null);
                    };
                    // Find all of the necessary max constraints that are relevant
                    let maxConstraints = [];
                    let changed = true;
                    while(changed && growConstraints.length){
                        // We'll need to iterate, and recompute constraints if our grow constraints have changed
                        changed = false;
                        maxConstraints = [];
                        // Find cells that can't grow any further. They are either:
                        // 1. Already at their maximum size - we may need to add forbidden lines
                        // 2. Not at their maximum size - we might add them as constraints
                        for (const cell of cells){
                            const max = cell.getMaximumSize(orientation);
                            // Most cells will probably have an infinite max (e.g. NO maximum), so we'll skip those
                            if (isFinite(max)) {
                                // Find out which lines are "dynamic" (i.e. they are part of a grow constraint)
                                // eslint-disable-next-line @typescript-eslint/no-loop-func
                                const dynamicLines = linesIn(cell).filter((line)=>growConstraints.some((constraint)=>constraint.growingLines.includes(line)));
                                // If there are none, it is not relevant, and we can skip it (won't affect any lines we are considering growing)
                                if (dynamicLines.length) {
                                    const currentSize = getCurrentCellSize(cell);
                                    const space = max - currentSize;
                                    // Check any "ungrowable" constraints, and remove all of their lines from consideration.
                                    if (space < epsilon) {
                                        for (const badLine of dynamicLines){
                                            assert && assert(!forbiddenLines.has(badLine), 'New only');
                                            forbiddenLines.add(badLine);
                                        }
                                        changed = true;
                                    } else {
                                        // If we have space, we'll want to mark how much space
                                        maxConstraints.push({
                                            cell: cell,
                                            growingLines: dynamicLines.slice(),
                                            space: space
                                        });
                                    }
                                }
                            }
                        }
                        // If ANY forbidden lines changed, recompute grow constraints and try again
                        if (changed) {
                            recomputeGrowConstraints();
                        }
                    }
                    // Actual growing operation
                    if (growConstraints.length) {
                        // Which lines will we increase?
                        const growingLines = _.uniq(growConstraints.flatMap((constraint)=>constraint.growingLines));
                        // Sum up weights from different constraints
                        const weightMap = new Map(growingLines.map((line)=>{
                            let weight = 0;
                            for (const constraint of growConstraints){
                                if (constraint.growingLines.includes(line)) {
                                    weight += constraint.weights.get(line);
                                }
                            }
                            assert && assert(isFinite(weight));
                            return [
                                line,
                                weight
                            ];
                        }));
                        // Find the multiplier that will allow us to (maximally) satisfy all the constraints.
                        // Later: increase for each line is multiplier * weight.
                        let multiplier = Number.POSITIVE_INFINITY;
                        // Minimize the multiplier by what will not violate any constraints
                        for (const constraint of [
                            ...growConstraints,
                            ...maxConstraints
                        ]){
                            // Our "total" weight, i.e. how much space we gain if we had a multiplier of 1.
                            const velocity = _.sum(constraint.growingLines.map((line)=>weightMap.get(line)));
                            // Adjust the multiplier
                            multiplier = Math.min(multiplier, constraint.space / velocity);
                            assert && assert(isFinite(multiplier) && multiplier > 0);
                        }
                        // Apply the multiplier
                        for (const line of growingLines){
                            const velocity = weightMap.get(line);
                            line.min += velocity * multiplier;
                        }
                        // Now see which cells are unsatisfied still (so we can iterate)
                        unsatisfiedSpanningCells = unsatisfiedSpanningCells.filter(isUnsatisfied);
                    } else {
                        // Bail (so we don't hard error) if we can't grow any further (but are still unsatisfied).
                        // This might result from maxContentSize constraints, where it is not possible to expand further.
                        assert && assert(false, 'GridCell for Node cannot find space due to maximum-size constraints');
                        break;
                    }
                }
            }
            // Adjust line sizes to the min
            lines.forEach((line)=>{
                // If we have origin-specified content, we'll need to include the maximum origin span (which may be larger)
                if (line.hasOrigin()) {
                    line.size = Math.max(line.min, line.maxOrigin - line.minOrigin);
                } else {
                    line.size = line.min;
                }
            });
            // Minimum size of our grid in this orientation
            const minSizeAndSpacing = _.sum(lines.map((line)=>line.size)) + _.sum(lineSpacings);
            minimumSizes.set(orientation, minSizeAndSpacing);
            // Compute the size in this orientation (growing the size proportionally in lines as necessary)
            const size = Math.max(minSizeAndSpacing, preferredSizes.get(orientation) || 0);
            let sizeRemaining = size - minSizeAndSpacing;
            let growableLines;
            while(sizeRemaining > 1e-7 && (growableLines = lines.filter((line)=>{
                return line.grow > 0 && line.size < line.max - 1e-7;
            })).length){
                const totalGrow = _.sum(growableLines.map((line)=>line.grow));
                // We could need to stop growing EITHER when a line hits its max OR when we run out of space remaining.
                const amountToGrow = Math.min(Math.min(...growableLines.map((line)=>(line.max - line.size) / line.grow)), sizeRemaining / totalGrow);
                assert && assert(amountToGrow > 1e-11);
                // Grow proportionally to their grow values
                growableLines.forEach((line)=>{
                    line.size += amountToGrow * line.grow;
                });
                sizeRemaining -= amountToGrow * totalGrow;
            }
            // Layout
            const startPosition = (lines[0].hasOrigin() ? lines[0].minOrigin : 0) + this.layoutOriginProperty.value[orientation.coordinate];
            layoutBounds[orientation.minCoordinate] = startPosition;
            layoutBounds[orientation.maxCoordinate] = startPosition + size;
            lines.forEach((line, arrayIndex)=>{
                // Position all the lines
                const totalPreviousLineSizes = _.sum(lines.slice(0, arrayIndex).map((line)=>line.size));
                const totalPreviousSpacings = _.sum(lineSpacings.slice(0, arrayIndex));
                line.position = startPosition + totalPreviousLineSizes + totalPreviousSpacings;
            });
            cells.forEach((cell)=>{
                // The line index of the first line our cell is composed of.
                const cellFirstIndexPosition = cell.position.get(orientation);
                // The size of our cell (width/height)
                const cellSize = cell.size.get(orientation);
                // The line index of the last line our cell is composed of.
                const cellLastIndexPosition = cellFirstIndexPosition + cellSize - 1;
                // All the lines our cell is composed of.
                const cellLines = linesIn(cell);
                const firstLine = lineMap.get(cellFirstIndexPosition);
                // If we're spanning multiple lines, we have to include the spacing that we've "absorbed" (if we have a cell
                // that spans columns 2 and 3, we'll need to include the spacing between 2 and 3.
                let interiorAbsorbedSpacing = 0;
                if (cellFirstIndexPosition !== cellLastIndexPosition) {
                    lines.slice(0, -1).forEach((line, lineIndex)=>{
                        if (line.index >= cellFirstIndexPosition && line.index < cellLastIndexPosition) {
                            interiorAbsorbedSpacing += lineSpacings[lineIndex];
                        }
                    });
                }
                // Our size includes the line sizes and spacings
                const cellAvailableSize = _.sum(cellLines.map((line)=>line.size)) + interiorAbsorbedSpacing;
                const cellPosition = firstLine.position;
                // Adjust preferred size and move the cell
                const cellBounds = cell.reposition(orientation, cellAvailableSize, cellPosition, cell.getEffectiveStretch(orientation), -firstLine.minOrigin, cell.getEffectiveAlign(orientation));
                layoutBounds[orientation.minCoordinate] = Math.min(layoutBounds[orientation.minCoordinate], cellBounds[orientation.minCoordinate]);
                layoutBounds[orientation.maxCoordinate] = Math.max(layoutBounds[orientation.maxCoordinate], cellBounds[orientation.maxCoordinate]);
            });
        });
        // We're taking up these layout bounds (nodes could use them for localBounds)
        this.layoutBoundsProperty.value = layoutBounds;
        this.minimumWidthProperty.value = minimumSizes.horizontal;
        this.minimumHeightProperty.value = minimumSizes.vertical;
        this.finishedLayoutEmitter.emit();
    }
    get spacing() {
        assert && assert(this.xSpacing === this.ySpacing);
        return this.xSpacing;
    }
    set spacing(value) {
        assert && assert(typeof value === 'number' && isFinite(value) && value >= 0 || Array.isArray(value) && _.every(value, (item)=>typeof item === 'number' && isFinite(item) && item >= 0));
        if (this._spacing.get(Orientation.HORIZONTAL) !== value || this._spacing.get(Orientation.VERTICAL) !== value) {
            this._spacing.set(Orientation.HORIZONTAL, value);
            this._spacing.set(Orientation.VERTICAL, value);
            this.updateLayoutAutomatically();
        }
    }
    get xSpacing() {
        return this._spacing.get(Orientation.HORIZONTAL);
    }
    set xSpacing(value) {
        assert && assert(typeof value === 'number' && isFinite(value) && value >= 0 || Array.isArray(value) && _.every(value, (item)=>typeof item === 'number' && isFinite(item) && item >= 0));
        if (this._spacing.get(Orientation.HORIZONTAL) !== value) {
            this._spacing.set(Orientation.HORIZONTAL, value);
            this.updateLayoutAutomatically();
        }
    }
    get ySpacing() {
        return this._spacing.get(Orientation.VERTICAL);
    }
    set ySpacing(value) {
        assert && assert(typeof value === 'number' && isFinite(value) && value >= 0 || Array.isArray(value) && _.every(value, (item)=>typeof item === 'number' && isFinite(item) && item >= 0));
        if (this._spacing.get(Orientation.VERTICAL) !== value) {
            this._spacing.set(Orientation.VERTICAL, value);
            this.updateLayoutAutomatically();
        }
    }
    addCell(cell) {
        assert && assert(!this.cells.has(cell));
        this.cells.add(cell);
        this.addNode(cell.node);
        cell.changedEmitter.addListener(this._updateLayoutListener);
        this.updateLayoutAutomatically();
    }
    removeCell(cell) {
        assert && assert(this.cells.has(cell));
        this.cells.delete(cell);
        this.removeNode(cell.node);
        cell.changedEmitter.removeListener(this._updateLayoutListener);
        this.updateLayoutAutomatically();
    }
    /**
   * Releases references
   */ dispose() {
        // Lock during disposal to avoid layout calls
        this.lock();
        [
            ...this.cells
        ].forEach((cell)=>this.removeCell(cell));
        this.displayedLines.forEach((map)=>map.clear());
        this.displayedCells = [];
        super.dispose();
        this.unlock();
    }
    getIndices(orientation) {
        const result = [];
        this.cells.forEach((cell)=>{
            result.push(...cell.getIndices(orientation));
        });
        return _.sortedUniq(_.sortBy(result));
    }
    getCell(row, column) {
        return _.find([
            ...this.cells
        ], (cell)=>cell.containsRow(row) && cell.containsColumn(column)) || null;
    }
    getCellFromNode(node) {
        return _.find([
            ...this.cells
        ], (cell)=>cell.node === node) || null;
    }
    getCells(orientation, index) {
        return _.filter([
            ...this.cells
        ], (cell)=>cell.containsIndex(orientation, index));
    }
    static create(ancestorNode, options) {
        return new GridConstraint(ancestorNode, options);
    }
    constructor(ancestorNode, providedOptions){
        super(ancestorNode, providedOptions), this.cells = new Set(), // (scenery-internal)
        this.displayedCells = [], // (scenery-internal) Looked up by index
        this.displayedLines = new OrientationPair(new Map(), new Map()), this._spacing = new OrientationPair(0, 0);
        // Set configuration to actual default values (instead of null) so that we will have guaranteed non-null
        // (non-inherit) values for our computations.
        this.setConfigToBaseDefault();
        this.mutateConfigurable(providedOptions);
        mutate(this, GRID_CONSTRAINT_OPTION_KEYS, providedOptions);
        // Key configuration changes to relayout
        this.changedEmitter.addListener(this._updateLayoutListener);
    }
};
export { GridConstraint as default };
scenery.register('GridConstraint', GridConstraint);
export { GRID_CONSTRAINT_OPTION_KEYS };

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvbGF5b3V0L2NvbnN0cmFpbnRzL0dyaWRDb25zdHJhaW50LnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDIxLTIwMjQsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIE1haW4gZ3JpZC1sYXlvdXQgbG9naWMuIFVzdWFsbHkgdXNlZCBpbmRpcmVjdGx5IHRocm91Z2ggR3JpZEJveCwgYnV0IGNhbiBhbHNvIGJlIHVzZWQgZGlyZWN0bHkgKHNheSwgaWYgbm9kZXMgZG9uJ3RcbiAqIGhhdmUgdGhlIHNhbWUgcGFyZW50LCBvciBhIEdyaWRCb3ggY2FuJ3QgYmUgdXNlZCkuXG4gKlxuICogVGhyb3VnaG91dCB0aGUgZG9jdW1lbnRhdGlvbiBmb3IgZ3JpZC1yZWxhdGVkIGl0ZW1zLCB0aGUgdGVybSBcImxpbmVcIiByZWZlcnMgdG8gZWl0aGVyIGEgcm93IG9yIGNvbHVtbiAoZGVwZW5kaW5nIG9uXG4gKiB0aGUgb3JpZW50YXRpb24pLlxuICpcbiAqIEBhdXRob3IgSm9uYXRoYW4gT2xzb24gPGpvbmF0aGFuLm9sc29uQGNvbG9yYWRvLmVkdT5cbiAqL1xuXG5pbXBvcnQgVFByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvVFByb3BlcnR5LmpzJztcbmltcG9ydCBCb3VuZHMyIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9Cb3VuZHMyLmpzJztcbmltcG9ydCBtdXRhdGUgZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL211dGF0ZS5qcyc7XG5pbXBvcnQgT3JpZW50YXRpb24gZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL09yaWVudGF0aW9uLmpzJztcbmltcG9ydCBPcmllbnRhdGlvblBhaXIgZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL09yaWVudGF0aW9uUGFpci5qcyc7XG5pbXBvcnQgeyBFeHRlcm5hbEdyaWRDb25maWd1cmFibGVPcHRpb25zLCBHUklEX0NPTkZJR1VSQUJMRV9PUFRJT05fS0VZUywgR3JpZENlbGwsIEdyaWRDb25maWd1cmFibGUsIEdyaWRMaW5lLCBMYXlvdXRBbGlnbiwgTm9kZSwgTm9kZUxheW91dEF2YWlsYWJsZUNvbnN0cmFpbnRPcHRpb25zLCBOb2RlTGF5b3V0Q29uc3RyYWludCwgc2NlbmVyeSB9IGZyb20gJy4uLy4uL2ltcG9ydHMuanMnO1xuXG5jb25zdCBHUklEX0NPTlNUUkFJTlRfT1BUSU9OX0tFWVMgPSBbXG4gIC4uLkdSSURfQ09ORklHVVJBQkxFX09QVElPTl9LRVlTLFxuICAnZXhjbHVkZUludmlzaWJsZScsXG4gICdzcGFjaW5nJyxcbiAgJ3hTcGFjaW5nJyxcbiAgJ3lTcGFjaW5nJ1xuXTtcblxudHlwZSBTZWxmT3B0aW9ucyA9IHtcblxuICAvLyBTcGFjaW5ncyBhcmUgY29udHJvbGxlZCBpbiBlYWNoIGRpbWVuc2lvbiAoc2V0dGluZyBgc3BhY2luZ2ApIHdpbGwgYWRqdXN0IGJvdGguIElmIGl0J3MgYSBudW1iZXIsIGl0IHdpbGwgYmUgYW5cbiAgLy8gZXh0cmEgZ2FwIGluLWJldHdlZW4gZXZlcnkgcm93IG9yIGNvbHVtbi4gSWYgaXQncyBhbiBhcnJheSwgaXQgd2lsbCBzcGVjaWZ5IHRoZSBnYXAgYmV0d2VlbiBzdWNjZXNzaXZlIHJvd3MvY29sdW1uc1xuICAvLyBlLmcuIFsgNSwgNCBdIHdpbGwgaGF2ZSBhIHNwYWNpbmcgb2YgNSBiZXR3ZWVuIHRoZSBmaXJzdCBhbmQgc2Vjb25kIGxpbmVzLCBhbmQgNCBiZXR3ZWVuIHRoZSBzZWNvbmQgYW5kIHRoaXJkXG4gIC8vIGxpbmVzLiBJbiB0aGF0IGNhc2UsIGlmIHRoZXJlIHdlcmUgYSB0aGlyZCBsaW5lLCBpdCB3b3VsZCBoYXZlIHplcm8gc3BhY2luZyBiZXR3ZWVuIHRoZSBzZWNvbmQgKGFueSBub24tc3BlY2lmaWVkXG4gIC8vIHNwYWNpbmdzIGZvciBleHRyYSByb3dzL2NvbHVtbnMgd2lsbCBiZSB6ZXJvKS5cbiAgLy8gTk9URTogSWYgYSBsaW5lIChyb3cvY29sdW1uKSBpcyBpbnZpc2libGUgKGFuZCBleGNsdWRlSW52aXNpYmxlIGlzIHNldCB0byB0cnVlKSwgdGhlbiB0aGUgc3BhY2luZyB0aGF0IGlzIGRpcmVjdGx5XG4gIC8vIGFmdGVyICh0byB0aGUgcmlnaHQvYm90dG9tIG9mKSB0aGF0IGxpbmUgd2lsbCBiZSBpZ25vcmVkLlxuICBzcGFjaW5nPzogbnVtYmVyIHwgbnVtYmVyW107XG4gIHhTcGFjaW5nPzogbnVtYmVyIHwgbnVtYmVyW107XG4gIHlTcGFjaW5nPzogbnVtYmVyIHwgbnVtYmVyW107XG5cbiAgLy8gVGhlIHByZWZlcnJlZCB3aWR0aC9oZWlnaHQgKGlkZWFsbHkgZnJvbSBhIGNvbnRhaW5lcidzIGxvY2FsUHJlZmVycmVkV2lkdGgvbG9jYWxQcmVmZXJyZWRIZWlnaHQuXG4gIHByZWZlcnJlZFdpZHRoUHJvcGVydHk/OiBUUHJvcGVydHk8bnVtYmVyIHwgbnVsbD47XG4gIHByZWZlcnJlZEhlaWdodFByb3BlcnR5PzogVFByb3BlcnR5PG51bWJlciB8IG51bGw+O1xuXG4gIC8vIFRoZSBtaW5pbXVtIHdpZHRoL2hlaWdodCAoaWRlYWxseSBmcm9tIGEgY29udGFpbmVyJ3MgbG9jYWxNaW5pbXVtV2lkdGgvbG9jYWxNaW5pbXVtSGVpZ2h0LlxuICBtaW5pbXVtV2lkdGhQcm9wZXJ0eT86IFRQcm9wZXJ0eTxudW1iZXIgfCBudWxsPjtcbiAgbWluaW11bUhlaWdodFByb3BlcnR5PzogVFByb3BlcnR5PG51bWJlciB8IG51bGw+O1xufTtcbnR5cGUgUGFyZW50T3B0aW9ucyA9IEV4dGVybmFsR3JpZENvbmZpZ3VyYWJsZU9wdGlvbnMgJiBOb2RlTGF5b3V0QXZhaWxhYmxlQ29uc3RyYWludE9wdGlvbnM7XG5leHBvcnQgdHlwZSBHcmlkQ29uc3RyYWludE9wdGlvbnMgPSBTZWxmT3B0aW9ucyAmIFBhcmVudE9wdGlvbnM7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEdyaWRDb25zdHJhaW50IGV4dGVuZHMgR3JpZENvbmZpZ3VyYWJsZSggTm9kZUxheW91dENvbnN0cmFpbnQgKSB7XG5cbiAgcHJpdmF0ZSByZWFkb25seSBjZWxscyA9IG5ldyBTZXQ8R3JpZENlbGw+KCk7XG5cbiAgLy8gKHNjZW5lcnktaW50ZXJuYWwpXG4gIHB1YmxpYyBkaXNwbGF5ZWRDZWxsczogR3JpZENlbGxbXSA9IFtdO1xuXG4gIC8vIChzY2VuZXJ5LWludGVybmFsKSBMb29rZWQgdXAgYnkgaW5kZXhcbiAgcHVibGljIGRpc3BsYXllZExpbmVzID0gbmV3IE9yaWVudGF0aW9uUGFpcjxNYXA8bnVtYmVyLCBHcmlkTGluZT4+KCBuZXcgTWFwKCksIG5ldyBNYXAoKSApO1xuXG4gIHByaXZhdGUgX3NwYWNpbmc6IE9yaWVudGF0aW9uUGFpcjxudW1iZXIgfCBudW1iZXJbXT4gPSBuZXcgT3JpZW50YXRpb25QYWlyPG51bWJlciB8IG51bWJlcltdPiggMCwgMCApO1xuXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggYW5jZXN0b3JOb2RlOiBOb2RlLCBwcm92aWRlZE9wdGlvbnM/OiBHcmlkQ29uc3RyYWludE9wdGlvbnMgKSB7XG4gICAgc3VwZXIoIGFuY2VzdG9yTm9kZSwgcHJvdmlkZWRPcHRpb25zICk7XG5cbiAgICAvLyBTZXQgY29uZmlndXJhdGlvbiB0byBhY3R1YWwgZGVmYXVsdCB2YWx1ZXMgKGluc3RlYWQgb2YgbnVsbCkgc28gdGhhdCB3ZSB3aWxsIGhhdmUgZ3VhcmFudGVlZCBub24tbnVsbFxuICAgIC8vIChub24taW5oZXJpdCkgdmFsdWVzIGZvciBvdXIgY29tcHV0YXRpb25zLlxuICAgIHRoaXMuc2V0Q29uZmlnVG9CYXNlRGVmYXVsdCgpO1xuICAgIHRoaXMubXV0YXRlQ29uZmlndXJhYmxlKCBwcm92aWRlZE9wdGlvbnMgKTtcbiAgICBtdXRhdGUoIHRoaXMsIEdSSURfQ09OU1RSQUlOVF9PUFRJT05fS0VZUywgcHJvdmlkZWRPcHRpb25zICk7XG5cbiAgICAvLyBLZXkgY29uZmlndXJhdGlvbiBjaGFuZ2VzIHRvIHJlbGF5b3V0XG4gICAgdGhpcy5jaGFuZ2VkRW1pdHRlci5hZGRMaXN0ZW5lciggdGhpcy5fdXBkYXRlTGF5b3V0TGlzdGVuZXIgKTtcbiAgfVxuXG4gIHByb3RlY3RlZCBvdmVycmlkZSBsYXlvdXQoKTogdm9pZCB7XG4gICAgc3VwZXIubGF5b3V0KCk7XG5cbiAgICAvLyBPbmx5IGdyYWIgdGhlIGNlbGxzIHRoYXQgd2lsbCBwYXJ0aWNpcGF0ZSBpbiBsYXlvdXRcbiAgICBjb25zdCBjZWxscyA9IHRoaXMuZmlsdGVyTGF5b3V0Q2VsbHMoIFsgLi4udGhpcy5jZWxscyBdICk7XG4gICAgdGhpcy5kaXNwbGF5ZWRDZWxscyA9IGNlbGxzO1xuXG4gICAgaWYgKCAhY2VsbHMubGVuZ3RoICkge1xuICAgICAgdGhpcy5sYXlvdXRCb3VuZHNQcm9wZXJ0eS52YWx1ZSA9IEJvdW5kczIuTk9USElORztcbiAgICAgIHRoaXMubWluaW11bVdpZHRoUHJvcGVydHkudmFsdWUgPSBudWxsO1xuICAgICAgdGhpcy5taW5pbXVtSGVpZ2h0UHJvcGVydHkudmFsdWUgPSBudWxsO1xuXG4gICAgICAvLyBTeW5jaHJvbml6ZSBvdXIgZGlzcGxheWVkTGluZXMsIGlmIGl0J3MgdXNlZCBmb3IgZGlzcGxheSAoZS5nLiBHcmlkQmFja2dyb3VuZE5vZGUpXG4gICAgICB0aGlzLmRpc3BsYXllZExpbmVzLmZvckVhY2goIG1hcCA9PiBtYXAuY2xlYXIoKSApO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IG1pbmltdW1TaXplcyA9IG5ldyBPcmllbnRhdGlvblBhaXIoIDAsIDAgKTtcbiAgICBjb25zdCBwcmVmZXJyZWRTaXplcyA9IG5ldyBPcmllbnRhdGlvblBhaXIoIHRoaXMucHJlZmVycmVkV2lkdGhQcm9wZXJ0eS52YWx1ZSwgdGhpcy5wcmVmZXJyZWRIZWlnaHRQcm9wZXJ0eS52YWx1ZSApO1xuICAgIGNvbnN0IGxheW91dEJvdW5kcyA9IG5ldyBCb3VuZHMyKCAwLCAwLCAwLCAwICk7XG5cbiAgICAvLyBIYW5kbGUgaG9yaXpvbnRhbCBmaXJzdCwgc28gaWYgd2UgcmUtd3JhcCB3ZSBjYW4gaGFuZGxlIHZlcnRpY2FsIGxhdGVyLlxuICAgIFsgT3JpZW50YXRpb24uSE9SSVpPTlRBTCwgT3JpZW50YXRpb24uVkVSVElDQUwgXS5mb3JFYWNoKCBvcmllbnRhdGlvbiA9PiB7XG4gICAgICBjb25zdCBvcmllbnRlZFNwYWNpbmcgPSB0aGlzLl9zcGFjaW5nLmdldCggb3JpZW50YXRpb24gKTtcblxuICAgICAgLy8gaW5kZXggPT4gR3JpZExpbmVcbiAgICAgIGNvbnN0IGxpbmVNYXA6IE1hcDxudW1iZXIsIEdyaWRMaW5lPiA9IHRoaXMuZGlzcGxheWVkTGluZXMuZ2V0KCBvcmllbnRhdGlvbiApO1xuXG4gICAgICAvLyBDbGVhciBvdXQgdGhlIGxpbmVNYXBcbiAgICAgIGxpbmVNYXAuZm9yRWFjaCggbGluZSA9PiBsaW5lLmNsZWFuKCkgKTtcbiAgICAgIGxpbmVNYXAuY2xlYXIoKTtcblxuICAgICAgLy8gV2hhdCBhcmUgYWxsIHRoZSBsaW5lIGluZGljZXMgdXNlZCBieSBkaXNwbGF5ZWQgY2VsbHM/IFRoZXJlIGNvdWxkIGJlIGdhcHMuIFdlIHByZXRlbmQgbGlrZSB0aG9zZSBnYXBzXG4gICAgICAvLyBkb24ndCBleGlzdCAoZXhjZXB0IGZvciBzcGFjaW5nKVxuICAgICAgY29uc3QgbGluZUluZGljZXMgPSBfLnNvcnRlZFVuaXEoIF8uc29ydEJ5KCBfLmZsYXR0ZW4oIGNlbGxzLm1hcCggY2VsbCA9PiBjZWxsLmdldEluZGljZXMoIG9yaWVudGF0aW9uICkgKSApICkgKTtcblxuICAgICAgY29uc3QgbGluZXMgPSBsaW5lSW5kaWNlcy5tYXAoIGluZGV4ID0+IHtcbiAgICAgICAgLy8gUmVjYWxsLCBjZWxscyBjYW4gaW5jbHVkZSBtdWx0aXBsZSBsaW5lcyBpbiB0aGUgc2FtZSBvcmllbnRhdGlvbiBpZiB0aGV5IGhhdmUgd2lkdGgvaGVpZ2h0PjFcbiAgICAgICAgY29uc3Qgc3ViQ2VsbHMgPSBfLmZpbHRlciggY2VsbHMsIGNlbGwgPT4gY2VsbC5jb250YWluc0luZGV4KCBvcmllbnRhdGlvbiwgaW5kZXggKSApO1xuXG4gICAgICAgIC8vIEZvciBub3csIHdlJ2xsIHVzZSB0aGUgbWF4aW11bSBncm93IHZhbHVlIGluY2x1ZGVkIGluIHRoaXMgbGluZVxuICAgICAgICBjb25zdCBncm93ID0gTWF0aC5tYXgoIC4uLnN1YkNlbGxzLm1hcCggY2VsbCA9PiBjZWxsLmdldEVmZmVjdGl2ZUdyb3coIG9yaWVudGF0aW9uICkgKSApO1xuXG4gICAgICAgIGNvbnN0IGxpbmUgPSBHcmlkTGluZS5wb29sLmNyZWF0ZSggaW5kZXgsIHN1YkNlbGxzLCBncm93ICk7XG4gICAgICAgIGxpbmVNYXAuc2V0KCBpbmRleCwgbGluZSApO1xuXG4gICAgICAgIHJldHVybiBsaW5lO1xuICAgICAgfSApO1xuXG4gICAgICBjb25zdCBjZWxsVG9MaW5lc01hcCA9IG5ldyBNYXA8R3JpZENlbGwsIEdyaWRMaW5lW10+KCBjZWxscy5tYXAoIGNlbGwgPT4ge1xuICAgICAgICByZXR1cm4gWyBjZWxsLCBjZWxsLmdldEluZGljZXMoIG9yaWVudGF0aW9uICkubWFwKCBpbmRleCA9PiB7XG4gICAgICAgICAgY29uc3QgbGluZSA9IGxpbmVNYXAuZ2V0KCBpbmRleCApITtcbiAgICAgICAgICBhc3NlcnQgJiYgYXNzZXJ0KCBsaW5lICk7XG5cbiAgICAgICAgICByZXR1cm4gbGluZTtcbiAgICAgICAgfSApIF07XG4gICAgICB9ICkgKTtcbiAgICAgIGNvbnN0IGxpbmVzSW4gPSAoIGNlbGw6IEdyaWRDZWxsICkgPT4gY2VsbFRvTGluZXNNYXAuZ2V0KCBjZWxsICkhO1xuXG4gICAgICAvLyBDb252ZXJ0IGEgc2ltcGxlIHNwYWNpbmcgbnVtYmVyIChvciBhIHNwYWNpbmcgYXJyYXkpIGludG8gYSBzcGFjaW5nIGFycmF5IG9mIHRoZSBjb3JyZWN0IHNpemUsIG9ubHkgaW5jbHVkaW5nXG4gICAgICAvLyBzcGFjaW5ncyBBRlRFUiBvdXIgYWN0dWFsbHktdmlzaWJsZSBsaW5lcy4gV2UnbGwgYWxzbyBza2lwIHRoZSBzcGFjaW5nIGFmdGVyIHRoZSBsYXN0IGxpbmUsIGFzIGl0IHdvbid0IGJlIHVzZWRcbiAgICAgIGNvbnN0IGxpbmVTcGFjaW5ncyA9IGxpbmVzLnNsaWNlKCAwLCAtMSApLm1hcCggbGluZSA9PiB7XG4gICAgICAgIHJldHVybiB0eXBlb2Ygb3JpZW50ZWRTcGFjaW5nID09PSAnbnVtYmVyJyA/IG9yaWVudGVkU3BhY2luZyA6IG9yaWVudGVkU3BhY2luZ1sgbGluZS5pbmRleCBdO1xuICAgICAgfSApO1xuXG4gICAgICAvLyBTY2FuIHNpemVzIGZvciBzaW5nbGUtbGluZSBjZWxscyBmaXJzdFxuICAgICAgY2VsbHMuZm9yRWFjaCggY2VsbCA9PiB7XG4gICAgICAgIGlmICggY2VsbC5zaXplLmdldCggb3JpZW50YXRpb24gKSA9PT0gMSApIHtcbiAgICAgICAgICBjb25zdCBsaW5lID0gbGluZU1hcC5nZXQoIGNlbGwucG9zaXRpb24uZ2V0KCBvcmllbnRhdGlvbiApICkhO1xuICAgICAgICAgIGxpbmUubWluID0gTWF0aC5tYXgoIGxpbmUubWluLCBjZWxsLmdldE1pbmltdW1TaXplKCBvcmllbnRhdGlvbiApICk7XG4gICAgICAgICAgbGluZS5tYXggPSBNYXRoLm1pbiggbGluZS5tYXgsIGNlbGwuZ2V0TWF4aW11bVNpemUoIG9yaWVudGF0aW9uICkgKTtcblxuICAgICAgICAgIC8vIEZvciBvcmlnaW4tc3BlY2lmaWVkIGNlbGxzLCB3ZSB3aWxsIHJlY29yZCB0aGVpciBtYXhpbXVtIHJlYWNoIGZyb20gdGhlIG9yaWdpbiwgc28gdGhlc2UgY2FuIGJlIFwic3VtbWVkXCJcbiAgICAgICAgICAvLyAoc2luY2UgdGhlIG9yaWdpbiBsaW5lIG1heSBlbmQgdXAgdGFraW5nIG1vcmUgc3BhY2UpLlxuICAgICAgICAgIGlmICggY2VsbC5nZXRFZmZlY3RpdmVBbGlnbiggb3JpZW50YXRpb24gKSA9PT0gTGF5b3V0QWxpZ24uT1JJR0lOICkge1xuICAgICAgICAgICAgY29uc3Qgb3JpZ2luQm91bmRzID0gY2VsbC5nZXRPcmlnaW5Cb3VuZHMoKTtcbiAgICAgICAgICAgIGxpbmUubWluT3JpZ2luID0gTWF0aC5taW4oIG9yaWdpbkJvdW5kc1sgb3JpZW50YXRpb24ubWluQ29vcmRpbmF0ZSBdLCBsaW5lLm1pbk9yaWdpbiApO1xuICAgICAgICAgICAgbGluZS5tYXhPcmlnaW4gPSBNYXRoLm1heCggb3JpZ2luQm91bmRzWyBvcmllbnRhdGlvbi5tYXhDb29yZGluYXRlIF0sIGxpbmUubWF4T3JpZ2luICk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9ICk7XG5cbiAgICAgIC8vIFRoZW4gaW5jcmVhc2UgZm9yIHNwYW5uaW5nIGNlbGxzIGFzIG5lY2Vzc2FyeVxuICAgICAge1xuICAgICAgICAvLyBQcm9ibGVtOlxuICAgICAgICAvLyAgIENlbGxzIHRoYXQgc3BhbiBtdWx0aXBsZSBsaW5lcyAoZS5nLiBob3Jpem9udGFsU3Bhbi92ZXJ0aWNhbFNwYW4gPiAxKSBtYXkgYmUgbGFyZ2VyIHRoYW4gdGhlIHN1bSBvZiB0aGVpclxuICAgICAgICAvLyAgIGxpbmVzJyBzaXplcy4gV2UgbmVlZCB0byBncm93IHRoZSBsaW5lcyB0byBhY2NvbW1vZGF0ZSB0aGVzZSBjZWxscy5cbiAgICAgICAgLy9cbiAgICAgICAgLy8gQ29uc3RyYWludDpcbiAgICAgICAgLy8gICBDZWxscyBhbHNvIGNhbiBoYXZlIG1heGltdW0gc2l6ZXMuIFdlIGRvbid0IHdhbnQgdG8gZ3JvdyBsaW5lcyBpbiBhIHdheSB0aGF0IHdvdWxkIGJyZWFrIHRoaXMgdHlwZSBvZiBjb25zdHJhaW50LlxuICAgICAgICAvL1xuICAgICAgICAvLyBHb2FsczpcbiAgICAgICAgLy8gICBEbyB0aGUgYWJvdmUsIGJ1dCB0cnkgdG8gc3ByZWFkIG91dCBleHRyYSBzcGFjZSBwcm9wb3J0aW9uYWxseS4gSWYgYGdyb3dgIGlzIHNwZWNpZmllZCBvbiBjZWxscyAoYSBsaW5lKSxcbiAgICAgICAgLy8gICB0cnkgdG8gdXNlIHRoYXQgdG8gZHVtcCBzcGFjZSBpbnRvIHRob3NlIHNlY3Rpb25zLlxuXG4gICAgICAgIC8vIEFuIGl0ZXJhdGl2ZSBhcHByb2FjaCwgd2hlcmUgd2Ugd2lsbCB0cnkgdG8gZ3JvdyBsaW5lcy5cbiAgICAgICAgLy9cbiAgICAgICAgLy8gRXZlcnkgc3RlcCwgd2Ugd2lsbCBkZXRlcm1pbmU6XG4gICAgICAgIC8vIDEuIEdyb3cgY29uc3RyYWludHMgKGhvdyBtdWNoIGlzIHRoZSBtb3N0IHdlJ2QgbmVlZCB0byBncm93IHRoaW5ncyB0byBzYXRpc2Z5IGFuIHVuc2F0aXNmaWVkIGNlbGwpXG4gICAgICAgIC8vIDIuIE1heCBjb25zdHJhaW50cyAoc29tZSBjZWxscyBtaWdodCBoYXZlIGEgbWF4aW11bSBzaXplIGNvbnN0cmFpbnQpXG4gICAgICAgIC8vIDMuIEdyb3dhYmxlIGxpbmVzICh0aGUgbGluZXMsIGdpdmVuIHRoZSBhYm92ZSwgdGhhdCBoYXZlIGEgbm9uLXplcm8gYW1vdW50IHRoZXkgY2FuIGdyb3cpLlxuICAgICAgICAvLyA0LiBXZWlnaHRzIGZvciBlYWNoIGdyb3dhYmxlIGxpbmUgKEhPVyBGQVNUIHdlIHNob3VsZCBncm93IHRoZSBsaW5lcywgcHJvcG9ydGlvbmFsbHkpLlxuICAgICAgICAvL1xuICAgICAgICAvLyBXZSB3aWxsIHRoZW4gc2VlIGhvdyBtdWNoIHdlIGNhbiBncm93IGJlZm9yZSBoaXR0aW5nIHRoZSBGSVJTVCBjb25zdHJhaW50LCBkbyB0aGF0LCBhbmQgdGhlbiBjb250aW51ZVxuICAgICAgICAvLyBpdGVyYXRpb24uXG4gICAgICAgIC8vXG4gICAgICAgIC8vIFRoaXMgaXMgY29tcGxpY2F0ZWQgYnkgdGhlIGZhY3QgdGhhdCBzb21lIFwibWF4IGNvbnN0cmFpbnRzXCIgbWlnaHQgaGF2ZSBncm93biBlbm91Z2ggdGhhdCBub25lIG9mIHRoZWlyXG4gICAgICAgIC8vIGxpbmVzIHNob3VsZCBpbmNyZWFzZSBpbiBzaXplLiBXaGVuIHRoYXQgaGFwcGVucywgd2UnbGwgbmVlZCB0byBhZGQgdGhvc2UgbGluZXMgdG8gdGhlIFwiZm9yYmlkZGVuXCIgbGlzdCxcbiAgICAgICAgLy8gYW5kIHJlY29tcHV0ZSB0aGluZ3MuXG5cbiAgICAgICAgLy8gTk9URTogSWYgdGhpcyBpcyBzdWJvcHRpbWFsLCB3ZSBjb3VsZCB0cnkgYSBmb3JjZS1kaXJlY3RlZCBpdGVyYXRpdmUgYWxnb3JpdGhtIHRvIG1pbmltaXplIGEgc3BlY2lmaWMgbG9zc1xuICAgICAgICAvLyBmdW5jdGlvbiAob3IganVzdC4uLiBjb252ZXggb3B0aW1pemF0aW9uKS5cblxuICAgICAgICBjb25zdCBlcHNpbG9uID0gMWUtOTtcblxuICAgICAgICAvLyBXaGF0IGlzIHRoZSBjdXJyZW50IChtaW5pbXVtKSBzaXplIG9mIGEgY2VsbFxuICAgICAgICBjb25zdCBnZXRDdXJyZW50Q2VsbFNpemUgPSAoIGNlbGw6IEdyaWRDZWxsICkgPT4ge1xuICAgICAgICAgIHJldHVybiBfLnN1bSggbGluZXNJbiggY2VsbCApLm1hcCggbGluZSA9PiBsaW5lLm1pbiApICk7XG4gICAgICAgIH07XG5cbiAgICAgICAgLy8gQSBjZWxsIGlzIFwidW5zYXRpc2ZpZWRcIiBpZiBpdHMgY3VycmVudCBzaXplIGlzIGxlc3MgdGhhbiBpdHMgbWluaW11bSBzaXplXG4gICAgICAgIGNvbnN0IGlzVW5zYXRpc2ZpZWQgPSAoIGNlbGw6IEdyaWRDZWxsICkgPT4ge1xuICAgICAgICAgIHJldHVybiBnZXRDdXJyZW50Q2VsbFNpemUoIGNlbGwgKSA8IGNlbGwuZ2V0TWluaW11bVNpemUoIG9yaWVudGF0aW9uICkgLSBlcHNpbG9uO1xuICAgICAgICB9O1xuXG4gICAgICAgIC8vIFdlIG1heSBuZWVkIHRvIFwiZm9yYmlkXCIgY2VydGFpbiBsaW5lcyBmcm9tIGdyb3dpbmcgZnVydGhlciwgZXZlbiBpZiB0aGV5IGFyZSBub3QgYXQgVEhFSVIgbGltaXQuXG4gICAgICAgIC8vIFRoZW4gd2UgY2FuIHJlY29tcHV0ZSB0aGluZ3MgYmFzZWQgb24gdGhhdCBsaW5lcyBhcmUgYWxsb3dlZCB0byBncm93LlxuICAgICAgICBjb25zdCBmb3JiaWRkZW5MaW5lcyA9IG5ldyBTZXQ8R3JpZExpbmU+KCk7XG5cbiAgICAgICAgLy8gV2hldGhlciBvdXIgbGluZSBjYW4gZ3JvdyAoaS5lLiBpdCdzIG5vdCBhdCBpdHMgbWF4aW11bSBzaXplLCBhbmQgaXQncyBub3QgZm9yYmlkZGVuKVxuICAgICAgICBjb25zdCBsaW5lQ2FuR3JvdyA9ICggbGluZTogR3JpZExpbmUgKSA9PiB7XG4gICAgICAgICAgcmV0dXJuICggIWlzRmluaXRlKCBsaW5lLm1heCApIHx8IGxpbmUubWluIDwgbGluZS5tYXggLSBlcHNpbG9uICkgJiYgIWZvcmJpZGRlbkxpbmVzLmhhcyggbGluZSApO1xuICAgICAgICB9O1xuXG4gICAgICAgIC8vIENlbGxzIHRoYXQ6XG4gICAgICAgIC8vIDEuIFNwYW4gbXVsdGlwbGUgbGluZXMgKHNpbmNlIHdlIGhhbmRsZWQgc2luZ2xlLWxpbmUgY2VsbHMgYWJvdmUpXG4gICAgICAgIC8vIDIuIEFyZSB1bnNhdGlzZmllZCAoaS5lLiB0aGVpciBjdXJyZW50IHNpemUgaXMgbGVzcyB0aGFuIHRoZWlyIG1pbmltdW0gc2l6ZSlcbiAgICAgICAgbGV0IHVuc2F0aXNmaWVkU3Bhbm5pbmdDZWxscyA9IGNlbGxzLmZpbHRlciggY2VsbCA9PiBjZWxsLnNpemUuZ2V0KCBvcmllbnRhdGlvbiApID4gMSApLmZpbHRlciggaXNVbnNhdGlzZmllZCApO1xuXG4gICAgICAgIC8vIE5PVEU6IEl0IG1heSBiZSBwb3NzaWJsZSB0byBhY3R1YWxseSBTS0lQIHRoZSBhYm92ZSBcInNpbmdsZS1saW5lIGNlbGxcIiBzdGVwLCBhbmQgc2l6ZSB0aGluZ3MgdXAgSlVTVCB1c2luZ1xuICAgICAgICAvLyB0aGlzIGFsZ29yaXRobS4gSXQgaXMgdW5jbGVhciB3aGV0aGVyIGl0IHdvdWxkIHJlc3VsdCBpbiBkZWNlbnQgcXVhbGl0eS5cblxuICAgICAgICAvLyBXZSdsbCBpdGVyYXRlIHVudGlsIHdlIGhhdmUgc2F0aXNmaWVkIGFsbCBvZiB0aGUgdW5zYXRpc2ZpZWQgY2VsbHMgT1Igd2UnbGwgYmFpbCAod2l0aCBhIGJyZWFrKSBpZlxuICAgICAgICAvLyB3ZSBjYW4ndCBncm93IGFueSBmdXJ0aGVyLiBPdGhlcndpc2UsIGV2ZXJ5IHN0ZXAgd2lsbCBncm93IGF0IGxlYXN0IHNvbWV0aGluZywgc28gd2Ugd2lsbCBtYWtlIGluY3JlbWVudGFsXG4gICAgICAgIC8vIGZvcndhcmQgcHJvZ3Jlc3MuXG4gICAgICAgIHdoaWxlICggdW5zYXRpc2ZpZWRTcGFubmluZ0NlbGxzLmxlbmd0aCApIHtcblxuICAgICAgICAgIC8vIEEgR3JvdyBvciBNYXggY29uc3RyYWludFxuICAgICAgICAgIHR5cGUgQ29uc3RyYWludCA9IHsgY2VsbDogR3JpZENlbGw7IGdyb3dpbmdMaW5lczogR3JpZExpbmVbXTsgc3BhY2U6IG51bWJlciB9O1xuXG4gICAgICAgICAgLy8gU3BlY2lhbGl6YXRpb25zIGZvciBHcm93IGNvbnN0cmFpbnRzXG4gICAgICAgICAgdHlwZSBHcm93Q29uc3RyYWludCA9IENvbnN0cmFpbnQgJiB7IHdlaWdodHM6IE1hcDxHcmlkTGluZSwgbnVtYmVyPiB9O1xuXG4gICAgICAgICAgLy8gR2V0cyB0aGUgYXBwbGljYWJsZSAobm9uLXplcm8pIGdyb3cgY29uc3RyYWludCBmb3IgYSBjZWxsLCBvciByZXR1cm5zIG51bGwgaWYgaXQgZG9lcyBub3QgbmVlZCB0byBiZSBncm93blxuICAgICAgICAgIC8vIChvciBjYW5ub3QgYmUgZ3Jvd24gYW5kIGRvZXNuJ3QgZmFpbCBhc3NlcnRpb25zKS5cbiAgICAgICAgICAvLyBXZSBhcmUgc29tZXdoYXQgcGVybWlzc2l2ZSBoZXJlIGZvciB0aGUgcnVudGltZSwgZXZlbiBpZiBhc3NlcnRpb25zIHdvdWxkIGZhaWwgd2UnbGwgdHJ5IHRvIGtlZXAgZ29pbmcuXG4gICAgICAgICAgY29uc3QgZ2V0R3Jvd0NvbnN0cmFpbnQgPSAoIGNlbGw6IEdyaWRDZWxsICk6IEdyb3dDb25zdHJhaW50IHwgbnVsbCA9PiB7XG4gICAgICAgICAgICBhc3NlcnQgJiYgYXNzZXJ0KCBpc1Vuc2F0aXNmaWVkKCBjZWxsICkgKTtcblxuICAgICAgICAgICAgY29uc3QgZ3Jvd2FibGVMaW5lcyA9IGxpbmVzSW4oIGNlbGwgKS5maWx0ZXIoIGxpbmVDYW5Hcm93ICk7XG5cbiAgICAgICAgICAgIGFzc2VydCAmJiBhc3NlcnQoIGdyb3dhYmxlTGluZXMubGVuZ3RoLCAnR3JpZENlbGwgZm9yIE5vZGUgY2Fubm90IGZpbmQgc3BhY2UgZHVlIHRvIG1heGltdW0tc2l6ZSBjb25zdHJhaW50cycgKTtcbiAgICAgICAgICAgIGlmICggIWdyb3dhYmxlTGluZXMubGVuZ3RoICkge1xuICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgY29uc3QgY3VycmVudFNpemUgPSBnZXRDdXJyZW50Q2VsbFNpemUoIGNlbGwgKTtcbiAgICAgICAgICAgIGNvbnN0IG5lZWRlZE1pblNpemUgPSBjZWxsLmdldE1pbmltdW1TaXplKCBvcmllbnRhdGlvbiApO1xuXG4gICAgICAgICAgICAvLyBIb3cgbXVjaCBzcGFjZSB3aWxsIG5lZWQgdG8gYmUgYWRkZWQgKGluIHRvdGFsKSB0byBzYXRpc2Z5IHRoZSBjZWxsLlxuICAgICAgICAgICAgY29uc3Qgc3BhY2UgPSBuZWVkZWRNaW5TaXplIC0gY3VycmVudFNpemU7XG5cbiAgICAgICAgICAgIGFzc2VydCAmJiBhc3NlcnQoIHNwYWNlID4gMCApO1xuICAgICAgICAgICAgaWYgKCBzcGFjZSA8IGVwc2lsb24gKSB7XG4gICAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBXZSdsbCBjaGVjayB0aGUgXCJncm93XCIgdmFsdWVzLCBJRiB0aGVyZSBhcmUgYW55IG5vbi16ZXJvLiBJZiB0aGVyZSBhcmUsIHdlIHdpbGwgdXNlIHRob3NlIHByb3BvcnRpb25hbGx5XG4gICAgICAgICAgICAvLyB0byByZWFsbG9jYXRlIHNwYWNlLlxuICAgICAgICAgICAgLy9cbiAgICAgICAgICAgIC8vIElGIFRIRVJFIElTIE5PIE5PTi1aRVJPIEdST1cgVkFMVUVTLCB3ZSB3aWxsIGp1c3QgZXZlbmx5IGRpc3RyaWJ1dGUgdGhlIHNwYWNlLlxuICAgICAgICAgICAgY29uc3QgdG90YWxMaW5lc0dyb3cgPSBfLnN1bSggZ3Jvd2FibGVMaW5lcy5tYXAoIGxpbmUgPT4gbGluZS5ncm93ICkgKTtcblxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgY2VsbDogY2VsbCxcbiAgICAgICAgICAgICAgZ3Jvd2luZ0xpbmVzOiBncm93YWJsZUxpbmVzLnNsaWNlKCksIC8vIGRlZmVuc2l2ZSBjb3B5LCB3ZSBtYXkgbW9kaWZ5IHRoZXNlIGxhdGVyXG4gICAgICAgICAgICAgIHNwYWNlOiBzcGFjZSxcbiAgICAgICAgICAgICAgd2VpZ2h0czogbmV3IE1hcCggZ3Jvd2FibGVMaW5lcy5tYXAoIGxpbmUgPT4ge1xuICAgICAgICAgICAgICAgIGxldCB3ZWlnaHQ6IG51bWJlcjtcblxuICAgICAgICAgICAgICAgIGlmICggdG90YWxMaW5lc0dyb3cgPiAwICkge1xuICAgICAgICAgICAgICAgICAgd2VpZ2h0ID0gc3BhY2UgKiAoIGxpbmUuZ3JvdyAvIHRvdGFsTGluZXNHcm93ICk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgd2VpZ2h0ID0gc3BhY2UgLyBncm93YWJsZUxpbmVzLmxlbmd0aDtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICByZXR1cm4gWyBsaW5lLCB3ZWlnaHQgXTtcbiAgICAgICAgICAgICAgfSApIClcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgfTtcblxuICAgICAgICAgIC8vIEluaXRpYWxpemUgZ3JvdyBjb25zdHJhaW50c1xuICAgICAgICAgIGxldCBncm93Q29uc3RyYWludHM6IEdyb3dDb25zdHJhaW50W10gPSBbXTtcbiAgICAgICAgICBmb3IgKCBjb25zdCBjZWxsIG9mIHVuc2F0aXNmaWVkU3Bhbm5pbmdDZWxscyApIHtcbiAgICAgICAgICAgIGNvbnN0IGdyb3dDb25zdHJhaW50ID0gZ2V0R3Jvd0NvbnN0cmFpbnQoIGNlbGwgKTtcbiAgICAgICAgICAgIGlmICggZ3Jvd0NvbnN0cmFpbnQgKSB7XG4gICAgICAgICAgICAgIGdyb3dDb25zdHJhaW50cy5wdXNoKCBncm93Q29uc3RyYWludCApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIFdlJ2xsIG5lZWQgdG8gcmVjb21wdXRlLiBXZSdsbCBzZWUgd2hpY2ggb25lcyB3ZSBjYW4ga2VlcCBhbmQgd2hpY2ggd2UgY2FuIHJlY29tcHV0ZSAoYmFzZWQgb24gZm9yYmlkZGVuIGxpbmVzKVxuICAgICAgICAgIGNvbnN0IHJlY29tcHV0ZUdyb3dDb25zdHJhaW50cyA9ICgpID0+IHtcbiAgICAgICAgICAgIGdyb3dDb25zdHJhaW50cyA9IGdyb3dDb25zdHJhaW50cy5tYXAoIGNvbnN0cmFpbnQgPT4ge1xuICAgICAgICAgICAgICBpZiAoIGNvbnN0cmFpbnQuZ3Jvd2luZ0xpbmVzLnNvbWUoIGxpbmUgPT4gZm9yYmlkZGVuTGluZXMuaGFzKCBsaW5lICkgKSApIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZ2V0R3Jvd0NvbnN0cmFpbnQoIGNvbnN0cmFpbnQuY2VsbCApO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHJldHVybiBjb25zdHJhaW50O1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9ICkuZmlsdGVyKCBjb25zdHJhaW50ID0+IGNvbnN0cmFpbnQgIT09IG51bGwgKTtcbiAgICAgICAgICB9O1xuXG4gICAgICAgICAgLy8gRmluZCBhbGwgb2YgdGhlIG5lY2Vzc2FyeSBtYXggY29uc3RyYWludHMgdGhhdCBhcmUgcmVsZXZhbnRcbiAgICAgICAgICBsZXQgbWF4Q29uc3RyYWludHM6IENvbnN0cmFpbnRbXSA9IFtdO1xuICAgICAgICAgIGxldCBjaGFuZ2VkID0gdHJ1ZTtcbiAgICAgICAgICB3aGlsZSAoIGNoYW5nZWQgJiYgZ3Jvd0NvbnN0cmFpbnRzLmxlbmd0aCApIHtcbiAgICAgICAgICAgIC8vIFdlJ2xsIG5lZWQgdG8gaXRlcmF0ZSwgYW5kIHJlY29tcHV0ZSBjb25zdHJhaW50cyBpZiBvdXIgZ3JvdyBjb25zdHJhaW50cyBoYXZlIGNoYW5nZWRcbiAgICAgICAgICAgIGNoYW5nZWQgPSBmYWxzZTtcbiAgICAgICAgICAgIG1heENvbnN0cmFpbnRzID0gW107XG5cbiAgICAgICAgICAgIC8vIEZpbmQgY2VsbHMgdGhhdCBjYW4ndCBncm93IGFueSBmdXJ0aGVyLiBUaGV5IGFyZSBlaXRoZXI6XG4gICAgICAgICAgICAvLyAxLiBBbHJlYWR5IGF0IHRoZWlyIG1heGltdW0gc2l6ZSAtIHdlIG1heSBuZWVkIHRvIGFkZCBmb3JiaWRkZW4gbGluZXNcbiAgICAgICAgICAgIC8vIDIuIE5vdCBhdCB0aGVpciBtYXhpbXVtIHNpemUgLSB3ZSBtaWdodCBhZGQgdGhlbSBhcyBjb25zdHJhaW50c1xuICAgICAgICAgICAgZm9yICggY29uc3QgY2VsbCBvZiBjZWxscyApIHtcbiAgICAgICAgICAgICAgY29uc3QgbWF4ID0gY2VsbC5nZXRNYXhpbXVtU2l6ZSggb3JpZW50YXRpb24gKTtcblxuICAgICAgICAgICAgICAvLyBNb3N0IGNlbGxzIHdpbGwgcHJvYmFibHkgaGF2ZSBhbiBpbmZpbml0ZSBtYXggKGUuZy4gTk8gbWF4aW11bSksIHNvIHdlJ2xsIHNraXAgdGhvc2VcbiAgICAgICAgICAgICAgaWYgKCBpc0Zpbml0ZSggbWF4ICkgKSB7XG4gICAgICAgICAgICAgICAgLy8gRmluZCBvdXQgd2hpY2ggbGluZXMgYXJlIFwiZHluYW1pY1wiIChpLmUuIHRoZXkgYXJlIHBhcnQgb2YgYSBncm93IGNvbnN0cmFpbnQpXG4gICAgICAgICAgICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby1sb29wLWZ1bmNcbiAgICAgICAgICAgICAgICBjb25zdCBkeW5hbWljTGluZXMgPSBsaW5lc0luKCBjZWxsICkuZmlsdGVyKCBsaW5lID0+IGdyb3dDb25zdHJhaW50cy5zb21lKCBjb25zdHJhaW50ID0+IGNvbnN0cmFpbnQuZ3Jvd2luZ0xpbmVzLmluY2x1ZGVzKCBsaW5lICkgKSApO1xuXG4gICAgICAgICAgICAgICAgLy8gSWYgdGhlcmUgYXJlIG5vbmUsIGl0IGlzIG5vdCByZWxldmFudCwgYW5kIHdlIGNhbiBza2lwIGl0ICh3b24ndCBhZmZlY3QgYW55IGxpbmVzIHdlIGFyZSBjb25zaWRlcmluZyBncm93aW5nKVxuICAgICAgICAgICAgICAgIGlmICggZHluYW1pY0xpbmVzLmxlbmd0aCApIHtcbiAgICAgICAgICAgICAgICAgIGNvbnN0IGN1cnJlbnRTaXplID0gZ2V0Q3VycmVudENlbGxTaXplKCBjZWxsICk7XG5cbiAgICAgICAgICAgICAgICAgIGNvbnN0IHNwYWNlID0gbWF4IC0gY3VycmVudFNpemU7XG5cbiAgICAgICAgICAgICAgICAgIC8vIENoZWNrIGFueSBcInVuZ3Jvd2FibGVcIiBjb25zdHJhaW50cywgYW5kIHJlbW92ZSBhbGwgb2YgdGhlaXIgbGluZXMgZnJvbSBjb25zaWRlcmF0aW9uLlxuICAgICAgICAgICAgICAgICAgaWYgKCBzcGFjZSA8IGVwc2lsb24gKSB7XG4gICAgICAgICAgICAgICAgICAgIGZvciAoIGNvbnN0IGJhZExpbmUgb2YgZHluYW1pY0xpbmVzICkge1xuICAgICAgICAgICAgICAgICAgICAgIGFzc2VydCAmJiBhc3NlcnQoICFmb3JiaWRkZW5MaW5lcy5oYXMoIGJhZExpbmUgKSwgJ05ldyBvbmx5JyApO1xuXG4gICAgICAgICAgICAgICAgICAgICAgZm9yYmlkZGVuTGluZXMuYWRkKCBiYWRMaW5lICk7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICBjaGFuZ2VkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAvLyBJZiB3ZSBoYXZlIHNwYWNlLCB3ZSdsbCB3YW50IHRvIG1hcmsgaG93IG11Y2ggc3BhY2VcbiAgICAgICAgICAgICAgICAgICAgbWF4Q29uc3RyYWludHMucHVzaCggeyBjZWxsOiBjZWxsLCBncm93aW5nTGluZXM6IGR5bmFtaWNMaW5lcy5zbGljZSgpLCBzcGFjZTogc3BhY2UgfSApO1xuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBJZiBBTlkgZm9yYmlkZGVuIGxpbmVzIGNoYW5nZWQsIHJlY29tcHV0ZSBncm93IGNvbnN0cmFpbnRzIGFuZCB0cnkgYWdhaW5cbiAgICAgICAgICAgIGlmICggY2hhbmdlZCApIHtcbiAgICAgICAgICAgICAgcmVjb21wdXRlR3Jvd0NvbnN0cmFpbnRzKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8gQWN0dWFsIGdyb3dpbmcgb3BlcmF0aW9uXG4gICAgICAgICAgaWYgKCBncm93Q29uc3RyYWludHMubGVuZ3RoICkge1xuICAgICAgICAgICAgLy8gV2hpY2ggbGluZXMgd2lsbCB3ZSBpbmNyZWFzZT9cbiAgICAgICAgICAgIGNvbnN0IGdyb3dpbmdMaW5lcyA9IF8udW5pcSggZ3Jvd0NvbnN0cmFpbnRzLmZsYXRNYXAoIGNvbnN0cmFpbnQgPT4gY29uc3RyYWludC5ncm93aW5nTGluZXMgKSApO1xuXG4gICAgICAgICAgICAvLyBTdW0gdXAgd2VpZ2h0cyBmcm9tIGRpZmZlcmVudCBjb25zdHJhaW50c1xuICAgICAgICAgICAgY29uc3Qgd2VpZ2h0TWFwID0gbmV3IE1hcDxHcmlkTGluZSwgbnVtYmVyPiggZ3Jvd2luZ0xpbmVzLm1hcCggbGluZSA9PiB7XG4gICAgICAgICAgICAgIGxldCB3ZWlnaHQgPSAwO1xuXG4gICAgICAgICAgICAgIGZvciAoIGNvbnN0IGNvbnN0cmFpbnQgb2YgZ3Jvd0NvbnN0cmFpbnRzICkge1xuICAgICAgICAgICAgICAgIGlmICggY29uc3RyYWludC5ncm93aW5nTGluZXMuaW5jbHVkZXMoIGxpbmUgKSApIHtcbiAgICAgICAgICAgICAgICAgIHdlaWdodCArPSBjb25zdHJhaW50LndlaWdodHMuZ2V0KCBsaW5lICkhO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgIGFzc2VydCAmJiBhc3NlcnQoIGlzRmluaXRlKCB3ZWlnaHQgKSApO1xuXG4gICAgICAgICAgICAgIHJldHVybiBbIGxpbmUsIHdlaWdodCBdO1xuICAgICAgICAgICAgfSApICk7XG5cbiAgICAgICAgICAgIC8vIEZpbmQgdGhlIG11bHRpcGxpZXIgdGhhdCB3aWxsIGFsbG93IHVzIHRvIChtYXhpbWFsbHkpIHNhdGlzZnkgYWxsIHRoZSBjb25zdHJhaW50cy5cbiAgICAgICAgICAgIC8vIExhdGVyOiBpbmNyZWFzZSBmb3IgZWFjaCBsaW5lIGlzIG11bHRpcGxpZXIgKiB3ZWlnaHQuXG4gICAgICAgICAgICBsZXQgbXVsdGlwbGllciA9IE51bWJlci5QT1NJVElWRV9JTkZJTklUWTtcblxuICAgICAgICAgICAgLy8gTWluaW1pemUgdGhlIG11bHRpcGxpZXIgYnkgd2hhdCB3aWxsIG5vdCB2aW9sYXRlIGFueSBjb25zdHJhaW50c1xuICAgICAgICAgICAgZm9yICggY29uc3QgY29uc3RyYWludCBvZiBbIC4uLmdyb3dDb25zdHJhaW50cywgLi4ubWF4Q29uc3RyYWludHMgXSApIHtcbiAgICAgICAgICAgICAgLy8gT3VyIFwidG90YWxcIiB3ZWlnaHQsIGkuZS4gaG93IG11Y2ggc3BhY2Ugd2UgZ2FpbiBpZiB3ZSBoYWQgYSBtdWx0aXBsaWVyIG9mIDEuXG4gICAgICAgICAgICAgIGNvbnN0IHZlbG9jaXR5ID0gXy5zdW0oIGNvbnN0cmFpbnQuZ3Jvd2luZ0xpbmVzLm1hcCggbGluZSA9PiB3ZWlnaHRNYXAuZ2V0KCBsaW5lICkhICkgKTtcblxuICAgICAgICAgICAgICAvLyBBZGp1c3QgdGhlIG11bHRpcGxpZXJcbiAgICAgICAgICAgICAgbXVsdGlwbGllciA9IE1hdGgubWluKCBtdWx0aXBsaWVyLCBjb25zdHJhaW50LnNwYWNlIC8gdmVsb2NpdHkgKTtcbiAgICAgICAgICAgICAgYXNzZXJ0ICYmIGFzc2VydCggaXNGaW5pdGUoIG11bHRpcGxpZXIgKSAmJiBtdWx0aXBsaWVyID4gMCApO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBBcHBseSB0aGUgbXVsdGlwbGllclxuICAgICAgICAgICAgZm9yICggY29uc3QgbGluZSBvZiBncm93aW5nTGluZXMgKSB7XG4gICAgICAgICAgICAgIGNvbnN0IHZlbG9jaXR5ID0gd2VpZ2h0TWFwLmdldCggbGluZSApITtcbiAgICAgICAgICAgICAgbGluZS5taW4gKz0gdmVsb2NpdHkgKiBtdWx0aXBsaWVyO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBOb3cgc2VlIHdoaWNoIGNlbGxzIGFyZSB1bnNhdGlzZmllZCBzdGlsbCAoc28gd2UgY2FuIGl0ZXJhdGUpXG4gICAgICAgICAgICB1bnNhdGlzZmllZFNwYW5uaW5nQ2VsbHMgPSB1bnNhdGlzZmllZFNwYW5uaW5nQ2VsbHMuZmlsdGVyKCBpc1Vuc2F0aXNmaWVkICk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgLy8gQmFpbCAoc28gd2UgZG9uJ3QgaGFyZCBlcnJvcikgaWYgd2UgY2FuJ3QgZ3JvdyBhbnkgZnVydGhlciAoYnV0IGFyZSBzdGlsbCB1bnNhdGlzZmllZCkuXG4gICAgICAgICAgICAvLyBUaGlzIG1pZ2h0IHJlc3VsdCBmcm9tIG1heENvbnRlbnRTaXplIGNvbnN0cmFpbnRzLCB3aGVyZSBpdCBpcyBub3QgcG9zc2libGUgdG8gZXhwYW5kIGZ1cnRoZXIuXG4gICAgICAgICAgICBhc3NlcnQgJiYgYXNzZXJ0KCBmYWxzZSwgJ0dyaWRDZWxsIGZvciBOb2RlIGNhbm5vdCBmaW5kIHNwYWNlIGR1ZSB0byBtYXhpbXVtLXNpemUgY29uc3RyYWludHMnICk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLy8gQWRqdXN0IGxpbmUgc2l6ZXMgdG8gdGhlIG1pblxuICAgICAgbGluZXMuZm9yRWFjaCggbGluZSA9PiB7XG4gICAgICAgIC8vIElmIHdlIGhhdmUgb3JpZ2luLXNwZWNpZmllZCBjb250ZW50LCB3ZSdsbCBuZWVkIHRvIGluY2x1ZGUgdGhlIG1heGltdW0gb3JpZ2luIHNwYW4gKHdoaWNoIG1heSBiZSBsYXJnZXIpXG4gICAgICAgIGlmICggbGluZS5oYXNPcmlnaW4oKSApIHtcbiAgICAgICAgICBsaW5lLnNpemUgPSBNYXRoLm1heCggbGluZS5taW4sIGxpbmUubWF4T3JpZ2luIC0gbGluZS5taW5PcmlnaW4gKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICBsaW5lLnNpemUgPSBsaW5lLm1pbjtcbiAgICAgICAgfVxuICAgICAgfSApO1xuXG4gICAgICAvLyBNaW5pbXVtIHNpemUgb2Ygb3VyIGdyaWQgaW4gdGhpcyBvcmllbnRhdGlvblxuICAgICAgY29uc3QgbWluU2l6ZUFuZFNwYWNpbmcgPSBfLnN1bSggbGluZXMubWFwKCBsaW5lID0+IGxpbmUuc2l6ZSApICkgKyBfLnN1bSggbGluZVNwYWNpbmdzICk7XG4gICAgICBtaW5pbXVtU2l6ZXMuc2V0KCBvcmllbnRhdGlvbiwgbWluU2l6ZUFuZFNwYWNpbmcgKTtcblxuICAgICAgLy8gQ29tcHV0ZSB0aGUgc2l6ZSBpbiB0aGlzIG9yaWVudGF0aW9uIChncm93aW5nIHRoZSBzaXplIHByb3BvcnRpb25hbGx5IGluIGxpbmVzIGFzIG5lY2Vzc2FyeSlcbiAgICAgIGNvbnN0IHNpemUgPSBNYXRoLm1heCggbWluU2l6ZUFuZFNwYWNpbmcsIHByZWZlcnJlZFNpemVzLmdldCggb3JpZW50YXRpb24gKSB8fCAwICk7XG4gICAgICBsZXQgc2l6ZVJlbWFpbmluZyA9IHNpemUgLSBtaW5TaXplQW5kU3BhY2luZztcbiAgICAgIGxldCBncm93YWJsZUxpbmVzO1xuICAgICAgd2hpbGUgKCBzaXplUmVtYWluaW5nID4gMWUtNyAmJiAoIGdyb3dhYmxlTGluZXMgPSBsaW5lcy5maWx0ZXIoIGxpbmUgPT4ge1xuICAgICAgICByZXR1cm4gbGluZS5ncm93ID4gMCAmJiBsaW5lLnNpemUgPCBsaW5lLm1heCAtIDFlLTc7XG4gICAgICB9ICkgKS5sZW5ndGggKSB7XG4gICAgICAgIGNvbnN0IHRvdGFsR3JvdyA9IF8uc3VtKCBncm93YWJsZUxpbmVzLm1hcCggbGluZSA9PiBsaW5lLmdyb3cgKSApO1xuXG4gICAgICAgIC8vIFdlIGNvdWxkIG5lZWQgdG8gc3RvcCBncm93aW5nIEVJVEhFUiB3aGVuIGEgbGluZSBoaXRzIGl0cyBtYXggT1Igd2hlbiB3ZSBydW4gb3V0IG9mIHNwYWNlIHJlbWFpbmluZy5cbiAgICAgICAgY29uc3QgYW1vdW50VG9Hcm93ID0gTWF0aC5taW4oXG4gICAgICAgICAgTWF0aC5taW4oIC4uLmdyb3dhYmxlTGluZXMubWFwKCBsaW5lID0+ICggbGluZS5tYXggLSBsaW5lLnNpemUgKSAvIGxpbmUuZ3JvdyApICksXG4gICAgICAgICAgc2l6ZVJlbWFpbmluZyAvIHRvdGFsR3Jvd1xuICAgICAgICApO1xuXG4gICAgICAgIGFzc2VydCAmJiBhc3NlcnQoIGFtb3VudFRvR3JvdyA+IDFlLTExICk7XG5cbiAgICAgICAgLy8gR3JvdyBwcm9wb3J0aW9uYWxseSB0byB0aGVpciBncm93IHZhbHVlc1xuICAgICAgICBncm93YWJsZUxpbmVzLmZvckVhY2goIGxpbmUgPT4ge1xuICAgICAgICAgIGxpbmUuc2l6ZSArPSBhbW91bnRUb0dyb3cgKiBsaW5lLmdyb3c7XG4gICAgICAgIH0gKTtcbiAgICAgICAgc2l6ZVJlbWFpbmluZyAtPSBhbW91bnRUb0dyb3cgKiB0b3RhbEdyb3c7XG4gICAgICB9XG5cbiAgICAgIC8vIExheW91dFxuICAgICAgY29uc3Qgc3RhcnRQb3NpdGlvbiA9ICggbGluZXNbIDAgXS5oYXNPcmlnaW4oKSA/IGxpbmVzWyAwIF0ubWluT3JpZ2luIDogMCApICsgdGhpcy5sYXlvdXRPcmlnaW5Qcm9wZXJ0eS52YWx1ZVsgb3JpZW50YXRpb24uY29vcmRpbmF0ZSBdO1xuICAgICAgbGF5b3V0Qm91bmRzWyBvcmllbnRhdGlvbi5taW5Db29yZGluYXRlIF0gPSBzdGFydFBvc2l0aW9uO1xuICAgICAgbGF5b3V0Qm91bmRzWyBvcmllbnRhdGlvbi5tYXhDb29yZGluYXRlIF0gPSBzdGFydFBvc2l0aW9uICsgc2l6ZTtcbiAgICAgIGxpbmVzLmZvckVhY2goICggbGluZSwgYXJyYXlJbmRleCApID0+IHtcbiAgICAgICAgLy8gUG9zaXRpb24gYWxsIHRoZSBsaW5lc1xuICAgICAgICBjb25zdCB0b3RhbFByZXZpb3VzTGluZVNpemVzID0gXy5zdW0oIGxpbmVzLnNsaWNlKCAwLCBhcnJheUluZGV4ICkubWFwKCBsaW5lID0+IGxpbmUuc2l6ZSApICk7XG4gICAgICAgIGNvbnN0IHRvdGFsUHJldmlvdXNTcGFjaW5ncyA9IF8uc3VtKCBsaW5lU3BhY2luZ3Muc2xpY2UoIDAsIGFycmF5SW5kZXggKSApO1xuICAgICAgICBsaW5lLnBvc2l0aW9uID0gc3RhcnRQb3NpdGlvbiArIHRvdGFsUHJldmlvdXNMaW5lU2l6ZXMgKyB0b3RhbFByZXZpb3VzU3BhY2luZ3M7XG4gICAgICB9ICk7XG4gICAgICBjZWxscy5mb3JFYWNoKCBjZWxsID0+IHtcbiAgICAgICAgLy8gVGhlIGxpbmUgaW5kZXggb2YgdGhlIGZpcnN0IGxpbmUgb3VyIGNlbGwgaXMgY29tcG9zZWQgb2YuXG4gICAgICAgIGNvbnN0IGNlbGxGaXJzdEluZGV4UG9zaXRpb24gPSBjZWxsLnBvc2l0aW9uLmdldCggb3JpZW50YXRpb24gKTtcblxuICAgICAgICAvLyBUaGUgc2l6ZSBvZiBvdXIgY2VsbCAod2lkdGgvaGVpZ2h0KVxuICAgICAgICBjb25zdCBjZWxsU2l6ZSA9IGNlbGwuc2l6ZS5nZXQoIG9yaWVudGF0aW9uICk7XG5cbiAgICAgICAgLy8gVGhlIGxpbmUgaW5kZXggb2YgdGhlIGxhc3QgbGluZSBvdXIgY2VsbCBpcyBjb21wb3NlZCBvZi5cbiAgICAgICAgY29uc3QgY2VsbExhc3RJbmRleFBvc2l0aW9uID0gY2VsbEZpcnN0SW5kZXhQb3NpdGlvbiArIGNlbGxTaXplIC0gMTtcblxuICAgICAgICAvLyBBbGwgdGhlIGxpbmVzIG91ciBjZWxsIGlzIGNvbXBvc2VkIG9mLlxuICAgICAgICBjb25zdCBjZWxsTGluZXMgPSBsaW5lc0luKCBjZWxsICk7XG5cbiAgICAgICAgY29uc3QgZmlyc3RMaW5lID0gbGluZU1hcC5nZXQoIGNlbGxGaXJzdEluZGV4UG9zaXRpb24gKSE7XG5cbiAgICAgICAgLy8gSWYgd2UncmUgc3Bhbm5pbmcgbXVsdGlwbGUgbGluZXMsIHdlIGhhdmUgdG8gaW5jbHVkZSB0aGUgc3BhY2luZyB0aGF0IHdlJ3ZlIFwiYWJzb3JiZWRcIiAoaWYgd2UgaGF2ZSBhIGNlbGxcbiAgICAgICAgLy8gdGhhdCBzcGFucyBjb2x1bW5zIDIgYW5kIDMsIHdlJ2xsIG5lZWQgdG8gaW5jbHVkZSB0aGUgc3BhY2luZyBiZXR3ZWVuIDIgYW5kIDMuXG4gICAgICAgIGxldCBpbnRlcmlvckFic29yYmVkU3BhY2luZyA9IDA7XG4gICAgICAgIGlmICggY2VsbEZpcnN0SW5kZXhQb3NpdGlvbiAhPT0gY2VsbExhc3RJbmRleFBvc2l0aW9uICkge1xuICAgICAgICAgIGxpbmVzLnNsaWNlKCAwLCAtMSApLmZvckVhY2goICggbGluZSwgbGluZUluZGV4ICkgPT4ge1xuICAgICAgICAgICAgaWYgKCBsaW5lLmluZGV4ID49IGNlbGxGaXJzdEluZGV4UG9zaXRpb24gJiYgbGluZS5pbmRleCA8IGNlbGxMYXN0SW5kZXhQb3NpdGlvbiApIHtcbiAgICAgICAgICAgICAgaW50ZXJpb3JBYnNvcmJlZFNwYWNpbmcgKz0gbGluZVNwYWNpbmdzWyBsaW5lSW5kZXggXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9ICk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBPdXIgc2l6ZSBpbmNsdWRlcyB0aGUgbGluZSBzaXplcyBhbmQgc3BhY2luZ3NcbiAgICAgICAgY29uc3QgY2VsbEF2YWlsYWJsZVNpemUgPSBfLnN1bSggY2VsbExpbmVzLm1hcCggbGluZSA9PiBsaW5lLnNpemUgKSApICsgaW50ZXJpb3JBYnNvcmJlZFNwYWNpbmc7XG4gICAgICAgIGNvbnN0IGNlbGxQb3NpdGlvbiA9IGZpcnN0TGluZS5wb3NpdGlvbjtcblxuICAgICAgICAvLyBBZGp1c3QgcHJlZmVycmVkIHNpemUgYW5kIG1vdmUgdGhlIGNlbGxcbiAgICAgICAgY29uc3QgY2VsbEJvdW5kcyA9IGNlbGwucmVwb3NpdGlvbihcbiAgICAgICAgICBvcmllbnRhdGlvbixcbiAgICAgICAgICBjZWxsQXZhaWxhYmxlU2l6ZSxcbiAgICAgICAgICBjZWxsUG9zaXRpb24sXG4gICAgICAgICAgY2VsbC5nZXRFZmZlY3RpdmVTdHJldGNoKCBvcmllbnRhdGlvbiApLFxuICAgICAgICAgIC1maXJzdExpbmUubWluT3JpZ2luLFxuICAgICAgICAgIGNlbGwuZ2V0RWZmZWN0aXZlQWxpZ24oIG9yaWVudGF0aW9uIClcbiAgICAgICAgKTtcblxuICAgICAgICBsYXlvdXRCb3VuZHNbIG9yaWVudGF0aW9uLm1pbkNvb3JkaW5hdGUgXSA9IE1hdGgubWluKCBsYXlvdXRCb3VuZHNbIG9yaWVudGF0aW9uLm1pbkNvb3JkaW5hdGUgXSwgY2VsbEJvdW5kc1sgb3JpZW50YXRpb24ubWluQ29vcmRpbmF0ZSBdICk7XG4gICAgICAgIGxheW91dEJvdW5kc1sgb3JpZW50YXRpb24ubWF4Q29vcmRpbmF0ZSBdID0gTWF0aC5tYXgoIGxheW91dEJvdW5kc1sgb3JpZW50YXRpb24ubWF4Q29vcmRpbmF0ZSBdLCBjZWxsQm91bmRzWyBvcmllbnRhdGlvbi5tYXhDb29yZGluYXRlIF0gKTtcbiAgICAgIH0gKTtcbiAgICB9ICk7XG5cbiAgICAvLyBXZSdyZSB0YWtpbmcgdXAgdGhlc2UgbGF5b3V0IGJvdW5kcyAobm9kZXMgY291bGQgdXNlIHRoZW0gZm9yIGxvY2FsQm91bmRzKVxuICAgIHRoaXMubGF5b3V0Qm91bmRzUHJvcGVydHkudmFsdWUgPSBsYXlvdXRCb3VuZHM7XG5cbiAgICB0aGlzLm1pbmltdW1XaWR0aFByb3BlcnR5LnZhbHVlID0gbWluaW11bVNpemVzLmhvcml6b250YWw7XG4gICAgdGhpcy5taW5pbXVtSGVpZ2h0UHJvcGVydHkudmFsdWUgPSBtaW5pbXVtU2l6ZXMudmVydGljYWw7XG5cbiAgICB0aGlzLmZpbmlzaGVkTGF5b3V0RW1pdHRlci5lbWl0KCk7XG4gIH1cblxuICBwdWJsaWMgZ2V0IHNwYWNpbmcoKTogbnVtYmVyIHwgbnVtYmVyW10ge1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIHRoaXMueFNwYWNpbmcgPT09IHRoaXMueVNwYWNpbmcgKTtcblxuICAgIHJldHVybiB0aGlzLnhTcGFjaW5nO1xuICB9XG5cbiAgcHVibGljIHNldCBzcGFjaW5nKCB2YWx1ZTogbnVtYmVyIHwgbnVtYmVyW10gKSB7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggKCB0eXBlb2YgdmFsdWUgPT09ICdudW1iZXInICYmIGlzRmluaXRlKCB2YWx1ZSApICYmIHZhbHVlID49IDAgKSB8fFxuICAgICAgICAgICAgICAgICAgICAgICggQXJyYXkuaXNBcnJheSggdmFsdWUgKSAmJiBfLmV2ZXJ5KCB2YWx1ZSwgaXRlbSA9PiAoIHR5cGVvZiBpdGVtID09PSAnbnVtYmVyJyAmJiBpc0Zpbml0ZSggaXRlbSApICYmIGl0ZW0gPj0gMCApICkgKSApO1xuXG4gICAgaWYgKCB0aGlzLl9zcGFjaW5nLmdldCggT3JpZW50YXRpb24uSE9SSVpPTlRBTCApICE9PSB2YWx1ZSB8fCB0aGlzLl9zcGFjaW5nLmdldCggT3JpZW50YXRpb24uVkVSVElDQUwgKSAhPT0gdmFsdWUgKSB7XG4gICAgICB0aGlzLl9zcGFjaW5nLnNldCggT3JpZW50YXRpb24uSE9SSVpPTlRBTCwgdmFsdWUgKTtcbiAgICAgIHRoaXMuX3NwYWNpbmcuc2V0KCBPcmllbnRhdGlvbi5WRVJUSUNBTCwgdmFsdWUgKTtcblxuICAgICAgdGhpcy51cGRhdGVMYXlvdXRBdXRvbWF0aWNhbGx5KCk7XG4gICAgfVxuICB9XG5cbiAgcHVibGljIGdldCB4U3BhY2luZygpOiBudW1iZXIgfCBudW1iZXJbXSB7XG4gICAgcmV0dXJuIHRoaXMuX3NwYWNpbmcuZ2V0KCBPcmllbnRhdGlvbi5IT1JJWk9OVEFMICk7XG4gIH1cblxuICBwdWJsaWMgc2V0IHhTcGFjaW5nKCB2YWx1ZTogbnVtYmVyIHwgbnVtYmVyW10gKSB7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggKCB0eXBlb2YgdmFsdWUgPT09ICdudW1iZXInICYmIGlzRmluaXRlKCB2YWx1ZSApICYmIHZhbHVlID49IDAgKSB8fFxuICAgICAgICAgICAgICAgICAgICAgICggQXJyYXkuaXNBcnJheSggdmFsdWUgKSAmJiBfLmV2ZXJ5KCB2YWx1ZSwgaXRlbSA9PiAoIHR5cGVvZiBpdGVtID09PSAnbnVtYmVyJyAmJiBpc0Zpbml0ZSggaXRlbSApICYmIGl0ZW0gPj0gMCApICkgKSApO1xuXG4gICAgaWYgKCB0aGlzLl9zcGFjaW5nLmdldCggT3JpZW50YXRpb24uSE9SSVpPTlRBTCApICE9PSB2YWx1ZSApIHtcbiAgICAgIHRoaXMuX3NwYWNpbmcuc2V0KCBPcmllbnRhdGlvbi5IT1JJWk9OVEFMLCB2YWx1ZSApO1xuXG4gICAgICB0aGlzLnVwZGF0ZUxheW91dEF1dG9tYXRpY2FsbHkoKTtcbiAgICB9XG4gIH1cblxuICBwdWJsaWMgZ2V0IHlTcGFjaW5nKCk6IG51bWJlciB8IG51bWJlcltdIHtcbiAgICByZXR1cm4gdGhpcy5fc3BhY2luZy5nZXQoIE9yaWVudGF0aW9uLlZFUlRJQ0FMICk7XG4gIH1cblxuICBwdWJsaWMgc2V0IHlTcGFjaW5nKCB2YWx1ZTogbnVtYmVyIHwgbnVtYmVyW10gKSB7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggKCB0eXBlb2YgdmFsdWUgPT09ICdudW1iZXInICYmIGlzRmluaXRlKCB2YWx1ZSApICYmIHZhbHVlID49IDAgKSB8fFxuICAgICAgICAgICAgICAgICAgICAgICggQXJyYXkuaXNBcnJheSggdmFsdWUgKSAmJiBfLmV2ZXJ5KCB2YWx1ZSwgaXRlbSA9PiAoIHR5cGVvZiBpdGVtID09PSAnbnVtYmVyJyAmJiBpc0Zpbml0ZSggaXRlbSApICYmIGl0ZW0gPj0gMCApICkgKSApO1xuXG4gICAgaWYgKCB0aGlzLl9zcGFjaW5nLmdldCggT3JpZW50YXRpb24uVkVSVElDQUwgKSAhPT0gdmFsdWUgKSB7XG4gICAgICB0aGlzLl9zcGFjaW5nLnNldCggT3JpZW50YXRpb24uVkVSVElDQUwsIHZhbHVlICk7XG5cbiAgICAgIHRoaXMudXBkYXRlTGF5b3V0QXV0b21hdGljYWxseSgpO1xuICAgIH1cbiAgfVxuXG4gIHB1YmxpYyBhZGRDZWxsKCBjZWxsOiBHcmlkQ2VsbCApOiB2b2lkIHtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCAhdGhpcy5jZWxscy5oYXMoIGNlbGwgKSApO1xuXG4gICAgdGhpcy5jZWxscy5hZGQoIGNlbGwgKTtcbiAgICB0aGlzLmFkZE5vZGUoIGNlbGwubm9kZSApO1xuICAgIGNlbGwuY2hhbmdlZEVtaXR0ZXIuYWRkTGlzdGVuZXIoIHRoaXMuX3VwZGF0ZUxheW91dExpc3RlbmVyICk7XG5cbiAgICB0aGlzLnVwZGF0ZUxheW91dEF1dG9tYXRpY2FsbHkoKTtcbiAgfVxuXG4gIHB1YmxpYyByZW1vdmVDZWxsKCBjZWxsOiBHcmlkQ2VsbCApOiB2b2lkIHtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0aGlzLmNlbGxzLmhhcyggY2VsbCApICk7XG5cbiAgICB0aGlzLmNlbGxzLmRlbGV0ZSggY2VsbCApO1xuICAgIHRoaXMucmVtb3ZlTm9kZSggY2VsbC5ub2RlICk7XG4gICAgY2VsbC5jaGFuZ2VkRW1pdHRlci5yZW1vdmVMaXN0ZW5lciggdGhpcy5fdXBkYXRlTGF5b3V0TGlzdGVuZXIgKTtcblxuICAgIHRoaXMudXBkYXRlTGF5b3V0QXV0b21hdGljYWxseSgpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlbGVhc2VzIHJlZmVyZW5jZXNcbiAgICovXG4gIHB1YmxpYyBvdmVycmlkZSBkaXNwb3NlKCk6IHZvaWQge1xuICAgIC8vIExvY2sgZHVyaW5nIGRpc3Bvc2FsIHRvIGF2b2lkIGxheW91dCBjYWxsc1xuICAgIHRoaXMubG9jaygpO1xuXG4gICAgWyAuLi50aGlzLmNlbGxzIF0uZm9yRWFjaCggY2VsbCA9PiB0aGlzLnJlbW92ZUNlbGwoIGNlbGwgKSApO1xuXG4gICAgdGhpcy5kaXNwbGF5ZWRMaW5lcy5mb3JFYWNoKCBtYXAgPT4gbWFwLmNsZWFyKCkgKTtcbiAgICB0aGlzLmRpc3BsYXllZENlbGxzID0gW107XG5cbiAgICBzdXBlci5kaXNwb3NlKCk7XG5cbiAgICB0aGlzLnVubG9jaygpO1xuICB9XG5cbiAgcHVibGljIGdldEluZGljZXMoIG9yaWVudGF0aW9uOiBPcmllbnRhdGlvbiApOiBudW1iZXJbXSB7XG4gICAgY29uc3QgcmVzdWx0OiBudW1iZXJbXSA9IFtdO1xuXG4gICAgdGhpcy5jZWxscy5mb3JFYWNoKCBjZWxsID0+IHtcbiAgICAgIHJlc3VsdC5wdXNoKCAuLi5jZWxsLmdldEluZGljZXMoIG9yaWVudGF0aW9uICkgKTtcbiAgICB9ICk7XG5cbiAgICByZXR1cm4gXy5zb3J0ZWRVbmlxKCBfLnNvcnRCeSggcmVzdWx0ICkgKTtcbiAgfVxuXG4gIHB1YmxpYyBnZXRDZWxsKCByb3c6IG51bWJlciwgY29sdW1uOiBudW1iZXIgKTogR3JpZENlbGwgfCBudWxsIHtcbiAgICByZXR1cm4gXy5maW5kKCBbIC4uLnRoaXMuY2VsbHMgXSwgY2VsbCA9PiBjZWxsLmNvbnRhaW5zUm93KCByb3cgKSAmJiBjZWxsLmNvbnRhaW5zQ29sdW1uKCBjb2x1bW4gKSApIHx8IG51bGw7XG4gIH1cblxuICBwdWJsaWMgZ2V0Q2VsbEZyb21Ob2RlKCBub2RlOiBOb2RlICk6IEdyaWRDZWxsIHwgbnVsbCB7XG4gICAgcmV0dXJuIF8uZmluZCggWyAuLi50aGlzLmNlbGxzIF0sIGNlbGwgPT4gY2VsbC5ub2RlID09PSBub2RlICkgfHwgbnVsbDtcbiAgfVxuXG4gIHB1YmxpYyBnZXRDZWxscyggb3JpZW50YXRpb246IE9yaWVudGF0aW9uLCBpbmRleDogbnVtYmVyICk6IEdyaWRDZWxsW10ge1xuICAgIHJldHVybiBfLmZpbHRlciggWyAuLi50aGlzLmNlbGxzIF0sIGNlbGwgPT4gY2VsbC5jb250YWluc0luZGV4KCBvcmllbnRhdGlvbiwgaW5kZXggKSApO1xuICB9XG5cbiAgcHVibGljIHN0YXRpYyBjcmVhdGUoIGFuY2VzdG9yTm9kZTogTm9kZSwgb3B0aW9ucz86IEdyaWRDb25zdHJhaW50T3B0aW9ucyApOiBHcmlkQ29uc3RyYWludCB7XG4gICAgcmV0dXJuIG5ldyBHcmlkQ29uc3RyYWludCggYW5jZXN0b3JOb2RlLCBvcHRpb25zICk7XG4gIH1cbn1cblxuc2NlbmVyeS5yZWdpc3RlciggJ0dyaWRDb25zdHJhaW50JywgR3JpZENvbnN0cmFpbnQgKTtcbmV4cG9ydCB7IEdSSURfQ09OU1RSQUlOVF9PUFRJT05fS0VZUyB9OyJdLCJuYW1lcyI6WyJCb3VuZHMyIiwibXV0YXRlIiwiT3JpZW50YXRpb24iLCJPcmllbnRhdGlvblBhaXIiLCJHUklEX0NPTkZJR1VSQUJMRV9PUFRJT05fS0VZUyIsIkdyaWRDb25maWd1cmFibGUiLCJHcmlkTGluZSIsIkxheW91dEFsaWduIiwiTm9kZUxheW91dENvbnN0cmFpbnQiLCJzY2VuZXJ5IiwiR1JJRF9DT05TVFJBSU5UX09QVElPTl9LRVlTIiwiR3JpZENvbnN0cmFpbnQiLCJsYXlvdXQiLCJjZWxscyIsImZpbHRlckxheW91dENlbGxzIiwiZGlzcGxheWVkQ2VsbHMiLCJsZW5ndGgiLCJsYXlvdXRCb3VuZHNQcm9wZXJ0eSIsInZhbHVlIiwiTk9USElORyIsIm1pbmltdW1XaWR0aFByb3BlcnR5IiwibWluaW11bUhlaWdodFByb3BlcnR5IiwiZGlzcGxheWVkTGluZXMiLCJmb3JFYWNoIiwibWFwIiwiY2xlYXIiLCJtaW5pbXVtU2l6ZXMiLCJwcmVmZXJyZWRTaXplcyIsInByZWZlcnJlZFdpZHRoUHJvcGVydHkiLCJwcmVmZXJyZWRIZWlnaHRQcm9wZXJ0eSIsImxheW91dEJvdW5kcyIsIkhPUklaT05UQUwiLCJWRVJUSUNBTCIsIm9yaWVudGF0aW9uIiwib3JpZW50ZWRTcGFjaW5nIiwiX3NwYWNpbmciLCJnZXQiLCJsaW5lTWFwIiwibGluZSIsImNsZWFuIiwibGluZUluZGljZXMiLCJfIiwic29ydGVkVW5pcSIsInNvcnRCeSIsImZsYXR0ZW4iLCJjZWxsIiwiZ2V0SW5kaWNlcyIsImxpbmVzIiwiaW5kZXgiLCJzdWJDZWxscyIsImZpbHRlciIsImNvbnRhaW5zSW5kZXgiLCJncm93IiwiTWF0aCIsIm1heCIsImdldEVmZmVjdGl2ZUdyb3ciLCJwb29sIiwiY3JlYXRlIiwic2V0IiwiY2VsbFRvTGluZXNNYXAiLCJNYXAiLCJhc3NlcnQiLCJsaW5lc0luIiwibGluZVNwYWNpbmdzIiwic2xpY2UiLCJzaXplIiwicG9zaXRpb24iLCJtaW4iLCJnZXRNaW5pbXVtU2l6ZSIsImdldE1heGltdW1TaXplIiwiZ2V0RWZmZWN0aXZlQWxpZ24iLCJPUklHSU4iLCJvcmlnaW5Cb3VuZHMiLCJnZXRPcmlnaW5Cb3VuZHMiLCJtaW5PcmlnaW4iLCJtaW5Db29yZGluYXRlIiwibWF4T3JpZ2luIiwibWF4Q29vcmRpbmF0ZSIsImVwc2lsb24iLCJnZXRDdXJyZW50Q2VsbFNpemUiLCJzdW0iLCJpc1Vuc2F0aXNmaWVkIiwiZm9yYmlkZGVuTGluZXMiLCJTZXQiLCJsaW5lQ2FuR3JvdyIsImlzRmluaXRlIiwiaGFzIiwidW5zYXRpc2ZpZWRTcGFubmluZ0NlbGxzIiwiZ2V0R3Jvd0NvbnN0cmFpbnQiLCJncm93YWJsZUxpbmVzIiwiY3VycmVudFNpemUiLCJuZWVkZWRNaW5TaXplIiwic3BhY2UiLCJ0b3RhbExpbmVzR3JvdyIsImdyb3dpbmdMaW5lcyIsIndlaWdodHMiLCJ3ZWlnaHQiLCJncm93Q29uc3RyYWludHMiLCJncm93Q29uc3RyYWludCIsInB1c2giLCJyZWNvbXB1dGVHcm93Q29uc3RyYWludHMiLCJjb25zdHJhaW50Iiwic29tZSIsIm1heENvbnN0cmFpbnRzIiwiY2hhbmdlZCIsImR5bmFtaWNMaW5lcyIsImluY2x1ZGVzIiwiYmFkTGluZSIsImFkZCIsInVuaXEiLCJmbGF0TWFwIiwid2VpZ2h0TWFwIiwibXVsdGlwbGllciIsIk51bWJlciIsIlBPU0lUSVZFX0lORklOSVRZIiwidmVsb2NpdHkiLCJoYXNPcmlnaW4iLCJtaW5TaXplQW5kU3BhY2luZyIsInNpemVSZW1haW5pbmciLCJ0b3RhbEdyb3ciLCJhbW91bnRUb0dyb3ciLCJzdGFydFBvc2l0aW9uIiwibGF5b3V0T3JpZ2luUHJvcGVydHkiLCJjb29yZGluYXRlIiwiYXJyYXlJbmRleCIsInRvdGFsUHJldmlvdXNMaW5lU2l6ZXMiLCJ0b3RhbFByZXZpb3VzU3BhY2luZ3MiLCJjZWxsRmlyc3RJbmRleFBvc2l0aW9uIiwiY2VsbFNpemUiLCJjZWxsTGFzdEluZGV4UG9zaXRpb24iLCJjZWxsTGluZXMiLCJmaXJzdExpbmUiLCJpbnRlcmlvckFic29yYmVkU3BhY2luZyIsImxpbmVJbmRleCIsImNlbGxBdmFpbGFibGVTaXplIiwiY2VsbFBvc2l0aW9uIiwiY2VsbEJvdW5kcyIsInJlcG9zaXRpb24iLCJnZXRFZmZlY3RpdmVTdHJldGNoIiwiaG9yaXpvbnRhbCIsInZlcnRpY2FsIiwiZmluaXNoZWRMYXlvdXRFbWl0dGVyIiwiZW1pdCIsInNwYWNpbmciLCJ4U3BhY2luZyIsInlTcGFjaW5nIiwiQXJyYXkiLCJpc0FycmF5IiwiZXZlcnkiLCJpdGVtIiwidXBkYXRlTGF5b3V0QXV0b21hdGljYWxseSIsImFkZENlbGwiLCJhZGROb2RlIiwibm9kZSIsImNoYW5nZWRFbWl0dGVyIiwiYWRkTGlzdGVuZXIiLCJfdXBkYXRlTGF5b3V0TGlzdGVuZXIiLCJyZW1vdmVDZWxsIiwiZGVsZXRlIiwicmVtb3ZlTm9kZSIsInJlbW92ZUxpc3RlbmVyIiwiZGlzcG9zZSIsImxvY2siLCJ1bmxvY2siLCJyZXN1bHQiLCJnZXRDZWxsIiwicm93IiwiY29sdW1uIiwiZmluZCIsImNvbnRhaW5zUm93IiwiY29udGFpbnNDb2x1bW4iLCJnZXRDZWxsRnJvbU5vZGUiLCJnZXRDZWxscyIsImFuY2VzdG9yTm9kZSIsIm9wdGlvbnMiLCJwcm92aWRlZE9wdGlvbnMiLCJzZXRDb25maWdUb0Jhc2VEZWZhdWx0IiwibXV0YXRlQ29uZmlndXJhYmxlIiwicmVnaXN0ZXIiXSwibWFwcGluZ3MiOiJBQUFBLHNEQUFzRDtBQUV0RDs7Ozs7Ozs7Q0FRQyxHQUdELE9BQU9BLGFBQWEsZ0NBQWdDO0FBQ3BELE9BQU9DLFlBQVkscUNBQXFDO0FBQ3hELE9BQU9DLGlCQUFpQiwwQ0FBMEM7QUFDbEUsT0FBT0MscUJBQXFCLDhDQUE4QztBQUMxRSxTQUEwQ0MsNkJBQTZCLEVBQVlDLGdCQUFnQixFQUFFQyxRQUFRLEVBQUVDLFdBQVcsRUFBOENDLG9CQUFvQixFQUFFQyxPQUFPLFFBQVEsbUJBQW1CO0FBRWhPLE1BQU1DLDhCQUE4QjtPQUMvQk47SUFDSDtJQUNBO0lBQ0E7SUFDQTtDQUNEO0FBMEJjLElBQUEsQUFBTU8saUJBQU4sTUFBTUEsdUJBQXVCTixpQkFBa0JHO0lBeUJ6Q0ksU0FBZTtRQUNoQyxLQUFLLENBQUNBO1FBRU4sc0RBQXNEO1FBQ3RELE1BQU1DLFFBQVEsSUFBSSxDQUFDQyxpQkFBaUIsQ0FBRTtlQUFLLElBQUksQ0FBQ0QsS0FBSztTQUFFO1FBQ3ZELElBQUksQ0FBQ0UsY0FBYyxHQUFHRjtRQUV0QixJQUFLLENBQUNBLE1BQU1HLE1BQU0sRUFBRztZQUNuQixJQUFJLENBQUNDLG9CQUFvQixDQUFDQyxLQUFLLEdBQUdsQixRQUFRbUIsT0FBTztZQUNqRCxJQUFJLENBQUNDLG9CQUFvQixDQUFDRixLQUFLLEdBQUc7WUFDbEMsSUFBSSxDQUFDRyxxQkFBcUIsQ0FBQ0gsS0FBSyxHQUFHO1lBRW5DLHFGQUFxRjtZQUNyRixJQUFJLENBQUNJLGNBQWMsQ0FBQ0MsT0FBTyxDQUFFQyxDQUFBQSxNQUFPQSxJQUFJQyxLQUFLO1lBQzdDO1FBQ0Y7UUFFQSxNQUFNQyxlQUFlLElBQUl2QixnQkFBaUIsR0FBRztRQUM3QyxNQUFNd0IsaUJBQWlCLElBQUl4QixnQkFBaUIsSUFBSSxDQUFDeUIsc0JBQXNCLENBQUNWLEtBQUssRUFBRSxJQUFJLENBQUNXLHVCQUF1QixDQUFDWCxLQUFLO1FBQ2pILE1BQU1ZLGVBQWUsSUFBSTlCLFFBQVMsR0FBRyxHQUFHLEdBQUc7UUFFM0MsMEVBQTBFO1FBQzFFO1lBQUVFLFlBQVk2QixVQUFVO1lBQUU3QixZQUFZOEIsUUFBUTtTQUFFLENBQUNULE9BQU8sQ0FBRVUsQ0FBQUE7WUFDeEQsTUFBTUMsa0JBQWtCLElBQUksQ0FBQ0MsUUFBUSxDQUFDQyxHQUFHLENBQUVIO1lBRTNDLG9CQUFvQjtZQUNwQixNQUFNSSxVQUFpQyxJQUFJLENBQUNmLGNBQWMsQ0FBQ2MsR0FBRyxDQUFFSDtZQUVoRSx3QkFBd0I7WUFDeEJJLFFBQVFkLE9BQU8sQ0FBRWUsQ0FBQUEsT0FBUUEsS0FBS0MsS0FBSztZQUNuQ0YsUUFBUVosS0FBSztZQUViLHlHQUF5RztZQUN6RyxtQ0FBbUM7WUFDbkMsTUFBTWUsY0FBY0MsRUFBRUMsVUFBVSxDQUFFRCxFQUFFRSxNQUFNLENBQUVGLEVBQUVHLE9BQU8sQ0FBRS9CLE1BQU1XLEdBQUcsQ0FBRXFCLENBQUFBLE9BQVFBLEtBQUtDLFVBQVUsQ0FBRWI7WUFFM0YsTUFBTWMsUUFBUVAsWUFBWWhCLEdBQUcsQ0FBRXdCLENBQUFBO2dCQUM3QiwrRkFBK0Y7Z0JBQy9GLE1BQU1DLFdBQVdSLEVBQUVTLE1BQU0sQ0FBRXJDLE9BQU9nQyxDQUFBQSxPQUFRQSxLQUFLTSxhQUFhLENBQUVsQixhQUFhZTtnQkFFM0Usa0VBQWtFO2dCQUNsRSxNQUFNSSxPQUFPQyxLQUFLQyxHQUFHLElBQUtMLFNBQVN6QixHQUFHLENBQUVxQixDQUFBQSxPQUFRQSxLQUFLVSxnQkFBZ0IsQ0FBRXRCO2dCQUV2RSxNQUFNSyxPQUFPaEMsU0FBU2tELElBQUksQ0FBQ0MsTUFBTSxDQUFFVCxPQUFPQyxVQUFVRztnQkFDcERmLFFBQVFxQixHQUFHLENBQUVWLE9BQU9WO2dCQUVwQixPQUFPQTtZQUNUO1lBRUEsTUFBTXFCLGlCQUFpQixJQUFJQyxJQUEyQi9DLE1BQU1XLEdBQUcsQ0FBRXFCLENBQUFBO2dCQUMvRCxPQUFPO29CQUFFQTtvQkFBTUEsS0FBS0MsVUFBVSxDQUFFYixhQUFjVCxHQUFHLENBQUV3QixDQUFBQTt3QkFDakQsTUFBTVYsT0FBT0QsUUFBUUQsR0FBRyxDQUFFWTt3QkFDMUJhLFVBQVVBLE9BQVF2Qjt3QkFFbEIsT0FBT0E7b0JBQ1Q7aUJBQUs7WUFDUDtZQUNBLE1BQU13QixVQUFVLENBQUVqQixPQUFvQmMsZUFBZXZCLEdBQUcsQ0FBRVM7WUFFMUQsZ0hBQWdIO1lBQ2hILGtIQUFrSDtZQUNsSCxNQUFNa0IsZUFBZWhCLE1BQU1pQixLQUFLLENBQUUsR0FBRyxDQUFDLEdBQUl4QyxHQUFHLENBQUVjLENBQUFBO2dCQUM3QyxPQUFPLE9BQU9KLG9CQUFvQixXQUFXQSxrQkFBa0JBLGVBQWUsQ0FBRUksS0FBS1UsS0FBSyxDQUFFO1lBQzlGO1lBRUEseUNBQXlDO1lBQ3pDbkMsTUFBTVUsT0FBTyxDQUFFc0IsQ0FBQUE7Z0JBQ2IsSUFBS0EsS0FBS29CLElBQUksQ0FBQzdCLEdBQUcsQ0FBRUgsaUJBQWtCLEdBQUk7b0JBQ3hDLE1BQU1LLE9BQU9ELFFBQVFELEdBQUcsQ0FBRVMsS0FBS3FCLFFBQVEsQ0FBQzlCLEdBQUcsQ0FBRUg7b0JBQzdDSyxLQUFLNkIsR0FBRyxHQUFHZCxLQUFLQyxHQUFHLENBQUVoQixLQUFLNkIsR0FBRyxFQUFFdEIsS0FBS3VCLGNBQWMsQ0FBRW5DO29CQUNwREssS0FBS2dCLEdBQUcsR0FBR0QsS0FBS2MsR0FBRyxDQUFFN0IsS0FBS2dCLEdBQUcsRUFBRVQsS0FBS3dCLGNBQWMsQ0FBRXBDO29CQUVwRCwyR0FBMkc7b0JBQzNHLHdEQUF3RDtvQkFDeEQsSUFBS1ksS0FBS3lCLGlCQUFpQixDQUFFckMsaUJBQWtCMUIsWUFBWWdFLE1BQU0sRUFBRzt3QkFDbEUsTUFBTUMsZUFBZTNCLEtBQUs0QixlQUFlO3dCQUN6Q25DLEtBQUtvQyxTQUFTLEdBQUdyQixLQUFLYyxHQUFHLENBQUVLLFlBQVksQ0FBRXZDLFlBQVkwQyxhQUFhLENBQUUsRUFBRXJDLEtBQUtvQyxTQUFTO3dCQUNwRnBDLEtBQUtzQyxTQUFTLEdBQUd2QixLQUFLQyxHQUFHLENBQUVrQixZQUFZLENBQUV2QyxZQUFZNEMsYUFBYSxDQUFFLEVBQUV2QyxLQUFLc0MsU0FBUztvQkFDdEY7Z0JBQ0Y7WUFDRjtZQUVBLGdEQUFnRDtZQUNoRDtnQkFDRSxXQUFXO2dCQUNYLDhHQUE4RztnQkFDOUcsd0VBQXdFO2dCQUN4RSxFQUFFO2dCQUNGLGNBQWM7Z0JBQ2Qsc0hBQXNIO2dCQUN0SCxFQUFFO2dCQUNGLFNBQVM7Z0JBQ1QsOEdBQThHO2dCQUM5Ryx1REFBdUQ7Z0JBRXZELDBEQUEwRDtnQkFDMUQsRUFBRTtnQkFDRixpQ0FBaUM7Z0JBQ2pDLHFHQUFxRztnQkFDckcsdUVBQXVFO2dCQUN2RSw2RkFBNkY7Z0JBQzdGLHlGQUF5RjtnQkFDekYsRUFBRTtnQkFDRix3R0FBd0c7Z0JBQ3hHLGFBQWE7Z0JBQ2IsRUFBRTtnQkFDRix5R0FBeUc7Z0JBQ3pHLDJHQUEyRztnQkFDM0csd0JBQXdCO2dCQUV4Qiw2R0FBNkc7Z0JBQzdHLDZDQUE2QztnQkFFN0MsTUFBTUUsVUFBVTtnQkFFaEIsK0NBQStDO2dCQUMvQyxNQUFNQyxxQkFBcUIsQ0FBRWxDO29CQUMzQixPQUFPSixFQUFFdUMsR0FBRyxDQUFFbEIsUUFBU2pCLE1BQU9yQixHQUFHLENBQUVjLENBQUFBLE9BQVFBLEtBQUs2QixHQUFHO2dCQUNyRDtnQkFFQSw0RUFBNEU7Z0JBQzVFLE1BQU1jLGdCQUFnQixDQUFFcEM7b0JBQ3RCLE9BQU9rQyxtQkFBb0JsQyxRQUFTQSxLQUFLdUIsY0FBYyxDQUFFbkMsZUFBZ0I2QztnQkFDM0U7Z0JBRUEsbUdBQW1HO2dCQUNuRyx3RUFBd0U7Z0JBQ3hFLE1BQU1JLGlCQUFpQixJQUFJQztnQkFFM0Isd0ZBQXdGO2dCQUN4RixNQUFNQyxjQUFjLENBQUU5QztvQkFDcEIsT0FBTyxBQUFFLENBQUEsQ0FBQytDLFNBQVUvQyxLQUFLZ0IsR0FBRyxLQUFNaEIsS0FBSzZCLEdBQUcsR0FBRzdCLEtBQUtnQixHQUFHLEdBQUd3QixPQUFNLEtBQU8sQ0FBQ0ksZUFBZUksR0FBRyxDQUFFaEQ7Z0JBQzVGO2dCQUVBLGNBQWM7Z0JBQ2Qsb0VBQW9FO2dCQUNwRSwrRUFBK0U7Z0JBQy9FLElBQUlpRCwyQkFBMkIxRSxNQUFNcUMsTUFBTSxDQUFFTCxDQUFBQSxPQUFRQSxLQUFLb0IsSUFBSSxDQUFDN0IsR0FBRyxDQUFFSCxlQUFnQixHQUFJaUIsTUFBTSxDQUFFK0I7Z0JBRWhHLDZHQUE2RztnQkFDN0csMkVBQTJFO2dCQUUzRSxxR0FBcUc7Z0JBQ3JHLDZHQUE2RztnQkFDN0csb0JBQW9CO2dCQUNwQixNQUFRTSx5QkFBeUJ2RSxNQUFNLENBQUc7b0JBUXhDLDZHQUE2RztvQkFDN0csb0RBQW9EO29CQUNwRCwwR0FBMEc7b0JBQzFHLE1BQU13RSxvQkFBb0IsQ0FBRTNDO3dCQUMxQmdCLFVBQVVBLE9BQVFvQixjQUFlcEM7d0JBRWpDLE1BQU00QyxnQkFBZ0IzQixRQUFTakIsTUFBT0ssTUFBTSxDQUFFa0M7d0JBRTlDdkIsVUFBVUEsT0FBUTRCLGNBQWN6RSxNQUFNLEVBQUU7d0JBQ3hDLElBQUssQ0FBQ3lFLGNBQWN6RSxNQUFNLEVBQUc7NEJBQzNCLE9BQU87d0JBQ1Q7d0JBRUEsTUFBTTBFLGNBQWNYLG1CQUFvQmxDO3dCQUN4QyxNQUFNOEMsZ0JBQWdCOUMsS0FBS3VCLGNBQWMsQ0FBRW5DO3dCQUUzQyx1RUFBdUU7d0JBQ3ZFLE1BQU0yRCxRQUFRRCxnQkFBZ0JEO3dCQUU5QjdCLFVBQVVBLE9BQVErQixRQUFRO3dCQUMxQixJQUFLQSxRQUFRZCxTQUFVOzRCQUNyQixPQUFPO3dCQUNUO3dCQUVBLDJHQUEyRzt3QkFDM0csdUJBQXVCO3dCQUN2QixFQUFFO3dCQUNGLGlGQUFpRjt3QkFDakYsTUFBTWUsaUJBQWlCcEQsRUFBRXVDLEdBQUcsQ0FBRVMsY0FBY2pFLEdBQUcsQ0FBRWMsQ0FBQUEsT0FBUUEsS0FBS2MsSUFBSTt3QkFFbEUsT0FBTzs0QkFDTFAsTUFBTUE7NEJBQ05pRCxjQUFjTCxjQUFjekIsS0FBSzs0QkFDakM0QixPQUFPQTs0QkFDUEcsU0FBUyxJQUFJbkMsSUFBSzZCLGNBQWNqRSxHQUFHLENBQUVjLENBQUFBO2dDQUNuQyxJQUFJMEQ7Z0NBRUosSUFBS0gsaUJBQWlCLEdBQUk7b0NBQ3hCRyxTQUFTSixRQUFVdEQsQ0FBQUEsS0FBS2MsSUFBSSxHQUFHeUMsY0FBYTtnQ0FDOUMsT0FDSztvQ0FDSEcsU0FBU0osUUFBUUgsY0FBY3pFLE1BQU07Z0NBQ3ZDO2dDQUVBLE9BQU87b0NBQUVzQjtvQ0FBTTBEO2lDQUFROzRCQUN6Qjt3QkFDRjtvQkFDRjtvQkFFQSw4QkFBOEI7b0JBQzlCLElBQUlDLGtCQUFvQyxFQUFFO29CQUMxQyxLQUFNLE1BQU1wRCxRQUFRMEMseUJBQTJCO3dCQUM3QyxNQUFNVyxpQkFBaUJWLGtCQUFtQjNDO3dCQUMxQyxJQUFLcUQsZ0JBQWlCOzRCQUNwQkQsZ0JBQWdCRSxJQUFJLENBQUVEO3dCQUN4QjtvQkFDRjtvQkFFQSxrSEFBa0g7b0JBQ2xILE1BQU1FLDJCQUEyQjt3QkFDL0JILGtCQUFrQkEsZ0JBQWdCekUsR0FBRyxDQUFFNkUsQ0FBQUE7NEJBQ3JDLElBQUtBLFdBQVdQLFlBQVksQ0FBQ1EsSUFBSSxDQUFFaEUsQ0FBQUEsT0FBUTRDLGVBQWVJLEdBQUcsQ0FBRWhELFFBQVc7Z0NBQ3hFLE9BQU9rRCxrQkFBbUJhLFdBQVd4RCxJQUFJOzRCQUMzQyxPQUNLO2dDQUNILE9BQU93RDs0QkFDVDt3QkFDRixHQUFJbkQsTUFBTSxDQUFFbUQsQ0FBQUEsYUFBY0EsZUFBZTtvQkFDM0M7b0JBRUEsOERBQThEO29CQUM5RCxJQUFJRSxpQkFBK0IsRUFBRTtvQkFDckMsSUFBSUMsVUFBVTtvQkFDZCxNQUFRQSxXQUFXUCxnQkFBZ0JqRixNQUFNLENBQUc7d0JBQzFDLHdGQUF3Rjt3QkFDeEZ3RixVQUFVO3dCQUNWRCxpQkFBaUIsRUFBRTt3QkFFbkIsMkRBQTJEO3dCQUMzRCx3RUFBd0U7d0JBQ3hFLGtFQUFrRTt3QkFDbEUsS0FBTSxNQUFNMUQsUUFBUWhDLE1BQVE7NEJBQzFCLE1BQU15QyxNQUFNVCxLQUFLd0IsY0FBYyxDQUFFcEM7NEJBRWpDLHVGQUF1Rjs0QkFDdkYsSUFBS29ELFNBQVUvQixNQUFRO2dDQUNyQiwrRUFBK0U7Z0NBQy9FLDJEQUEyRDtnQ0FDM0QsTUFBTW1ELGVBQWUzQyxRQUFTakIsTUFBT0ssTUFBTSxDQUFFWixDQUFBQSxPQUFRMkQsZ0JBQWdCSyxJQUFJLENBQUVELENBQUFBLGFBQWNBLFdBQVdQLFlBQVksQ0FBQ1ksUUFBUSxDQUFFcEU7Z0NBRTNILGdIQUFnSDtnQ0FDaEgsSUFBS21FLGFBQWF6RixNQUFNLEVBQUc7b0NBQ3pCLE1BQU0wRSxjQUFjWCxtQkFBb0JsQztvQ0FFeEMsTUFBTStDLFFBQVF0QyxNQUFNb0M7b0NBRXBCLHdGQUF3RjtvQ0FDeEYsSUFBS0UsUUFBUWQsU0FBVTt3Q0FDckIsS0FBTSxNQUFNNkIsV0FBV0YsYUFBZTs0Q0FDcEM1QyxVQUFVQSxPQUFRLENBQUNxQixlQUFlSSxHQUFHLENBQUVxQixVQUFXOzRDQUVsRHpCLGVBQWUwQixHQUFHLENBQUVEO3dDQUN0Qjt3Q0FFQUgsVUFBVTtvQ0FDWixPQUNLO3dDQUNILHNEQUFzRDt3Q0FDdERELGVBQWVKLElBQUksQ0FBRTs0Q0FBRXRELE1BQU1BOzRDQUFNaUQsY0FBY1csYUFBYXpDLEtBQUs7NENBQUk0QixPQUFPQTt3Q0FBTTtvQ0FDdEY7Z0NBQ0Y7NEJBQ0Y7d0JBQ0Y7d0JBRUEsMkVBQTJFO3dCQUMzRSxJQUFLWSxTQUFVOzRCQUNiSjt3QkFDRjtvQkFDRjtvQkFFQSwyQkFBMkI7b0JBQzNCLElBQUtILGdCQUFnQmpGLE1BQU0sRUFBRzt3QkFDNUIsZ0NBQWdDO3dCQUNoQyxNQUFNOEUsZUFBZXJELEVBQUVvRSxJQUFJLENBQUVaLGdCQUFnQmEsT0FBTyxDQUFFVCxDQUFBQSxhQUFjQSxXQUFXUCxZQUFZO3dCQUUzRiw0Q0FBNEM7d0JBQzVDLE1BQU1pQixZQUFZLElBQUluRCxJQUF1QmtDLGFBQWF0RSxHQUFHLENBQUVjLENBQUFBOzRCQUM3RCxJQUFJMEQsU0FBUzs0QkFFYixLQUFNLE1BQU1LLGNBQWNKLGdCQUFrQjtnQ0FDMUMsSUFBS0ksV0FBV1AsWUFBWSxDQUFDWSxRQUFRLENBQUVwRSxPQUFTO29DQUM5QzBELFVBQVVLLFdBQVdOLE9BQU8sQ0FBQzNELEdBQUcsQ0FBRUU7Z0NBQ3BDOzRCQUNGOzRCQUVBdUIsVUFBVUEsT0FBUXdCLFNBQVVXOzRCQUU1QixPQUFPO2dDQUFFMUQ7Z0NBQU0wRDs2QkFBUTt3QkFDekI7d0JBRUEscUZBQXFGO3dCQUNyRix3REFBd0Q7d0JBQ3hELElBQUlnQixhQUFhQyxPQUFPQyxpQkFBaUI7d0JBRXpDLG1FQUFtRTt3QkFDbkUsS0FBTSxNQUFNYixjQUFjOytCQUFLSjsrQkFBb0JNO3lCQUFnQixDQUFHOzRCQUNwRSwrRUFBK0U7NEJBQy9FLE1BQU1ZLFdBQVcxRSxFQUFFdUMsR0FBRyxDQUFFcUIsV0FBV1AsWUFBWSxDQUFDdEUsR0FBRyxDQUFFYyxDQUFBQSxPQUFReUUsVUFBVTNFLEdBQUcsQ0FBRUU7NEJBRTVFLHdCQUF3Qjs0QkFDeEIwRSxhQUFhM0QsS0FBS2MsR0FBRyxDQUFFNkMsWUFBWVgsV0FBV1QsS0FBSyxHQUFHdUI7NEJBQ3REdEQsVUFBVUEsT0FBUXdCLFNBQVUyQixlQUFnQkEsYUFBYTt3QkFDM0Q7d0JBRUEsdUJBQXVCO3dCQUN2QixLQUFNLE1BQU0xRSxRQUFRd0QsYUFBZTs0QkFDakMsTUFBTXFCLFdBQVdKLFVBQVUzRSxHQUFHLENBQUVFOzRCQUNoQ0EsS0FBSzZCLEdBQUcsSUFBSWdELFdBQVdIO3dCQUN6Qjt3QkFFQSxnRUFBZ0U7d0JBQ2hFekIsMkJBQTJCQSx5QkFBeUJyQyxNQUFNLENBQUUrQjtvQkFDOUQsT0FDSzt3QkFDSCwwRkFBMEY7d0JBQzFGLGlHQUFpRzt3QkFDakdwQixVQUFVQSxPQUFRLE9BQU87d0JBQ3pCO29CQUNGO2dCQUNGO1lBQ0Y7WUFFQSwrQkFBK0I7WUFDL0JkLE1BQU14QixPQUFPLENBQUVlLENBQUFBO2dCQUNiLDJHQUEyRztnQkFDM0csSUFBS0EsS0FBSzhFLFNBQVMsSUFBSztvQkFDdEI5RSxLQUFLMkIsSUFBSSxHQUFHWixLQUFLQyxHQUFHLENBQUVoQixLQUFLNkIsR0FBRyxFQUFFN0IsS0FBS3NDLFNBQVMsR0FBR3RDLEtBQUtvQyxTQUFTO2dCQUNqRSxPQUNLO29CQUNIcEMsS0FBSzJCLElBQUksR0FBRzNCLEtBQUs2QixHQUFHO2dCQUN0QjtZQUNGO1lBRUEsK0NBQStDO1lBQy9DLE1BQU1rRCxvQkFBb0I1RSxFQUFFdUMsR0FBRyxDQUFFakMsTUFBTXZCLEdBQUcsQ0FBRWMsQ0FBQUEsT0FBUUEsS0FBSzJCLElBQUksS0FBT3hCLEVBQUV1QyxHQUFHLENBQUVqQjtZQUMzRXJDLGFBQWFnQyxHQUFHLENBQUV6QixhQUFhb0Y7WUFFL0IsK0ZBQStGO1lBQy9GLE1BQU1wRCxPQUFPWixLQUFLQyxHQUFHLENBQUUrRCxtQkFBbUIxRixlQUFlUyxHQUFHLENBQUVILGdCQUFpQjtZQUMvRSxJQUFJcUYsZ0JBQWdCckQsT0FBT29EO1lBQzNCLElBQUk1QjtZQUNKLE1BQVE2QixnQkFBZ0IsUUFBUSxBQUFFN0IsQ0FBQUEsZ0JBQWdCMUMsTUFBTUcsTUFBTSxDQUFFWixDQUFBQTtnQkFDOUQsT0FBT0EsS0FBS2MsSUFBSSxHQUFHLEtBQUtkLEtBQUsyQixJQUFJLEdBQUczQixLQUFLZ0IsR0FBRyxHQUFHO1lBQ2pELEVBQUUsRUFBSXRDLE1BQU0sQ0FBRztnQkFDYixNQUFNdUcsWUFBWTlFLEVBQUV1QyxHQUFHLENBQUVTLGNBQWNqRSxHQUFHLENBQUVjLENBQUFBLE9BQVFBLEtBQUtjLElBQUk7Z0JBRTdELHVHQUF1RztnQkFDdkcsTUFBTW9FLGVBQWVuRSxLQUFLYyxHQUFHLENBQzNCZCxLQUFLYyxHQUFHLElBQUtzQixjQUFjakUsR0FBRyxDQUFFYyxDQUFBQSxPQUFRLEFBQUVBLENBQUFBLEtBQUtnQixHQUFHLEdBQUdoQixLQUFLMkIsSUFBSSxBQUFELElBQU0zQixLQUFLYyxJQUFJLElBQzVFa0UsZ0JBQWdCQztnQkFHbEIxRCxVQUFVQSxPQUFRMkQsZUFBZTtnQkFFakMsMkNBQTJDO2dCQUMzQy9CLGNBQWNsRSxPQUFPLENBQUVlLENBQUFBO29CQUNyQkEsS0FBSzJCLElBQUksSUFBSXVELGVBQWVsRixLQUFLYyxJQUFJO2dCQUN2QztnQkFDQWtFLGlCQUFpQkUsZUFBZUQ7WUFDbEM7WUFFQSxTQUFTO1lBQ1QsTUFBTUUsZ0JBQWdCLEFBQUUxRSxDQUFBQSxLQUFLLENBQUUsRUFBRyxDQUFDcUUsU0FBUyxLQUFLckUsS0FBSyxDQUFFLEVBQUcsQ0FBQzJCLFNBQVMsR0FBRyxDQUFBLElBQU0sSUFBSSxDQUFDZ0Qsb0JBQW9CLENBQUN4RyxLQUFLLENBQUVlLFlBQVkwRixVQUFVLENBQUU7WUFDdkk3RixZQUFZLENBQUVHLFlBQVkwQyxhQUFhLENBQUUsR0FBRzhDO1lBQzVDM0YsWUFBWSxDQUFFRyxZQUFZNEMsYUFBYSxDQUFFLEdBQUc0QyxnQkFBZ0J4RDtZQUM1RGxCLE1BQU14QixPQUFPLENBQUUsQ0FBRWUsTUFBTXNGO2dCQUNyQix5QkFBeUI7Z0JBQ3pCLE1BQU1DLHlCQUF5QnBGLEVBQUV1QyxHQUFHLENBQUVqQyxNQUFNaUIsS0FBSyxDQUFFLEdBQUc0RCxZQUFhcEcsR0FBRyxDQUFFYyxDQUFBQSxPQUFRQSxLQUFLMkIsSUFBSTtnQkFDekYsTUFBTTZELHdCQUF3QnJGLEVBQUV1QyxHQUFHLENBQUVqQixhQUFhQyxLQUFLLENBQUUsR0FBRzREO2dCQUM1RHRGLEtBQUs0QixRQUFRLEdBQUd1RCxnQkFBZ0JJLHlCQUF5QkM7WUFDM0Q7WUFDQWpILE1BQU1VLE9BQU8sQ0FBRXNCLENBQUFBO2dCQUNiLDREQUE0RDtnQkFDNUQsTUFBTWtGLHlCQUF5QmxGLEtBQUtxQixRQUFRLENBQUM5QixHQUFHLENBQUVIO2dCQUVsRCxzQ0FBc0M7Z0JBQ3RDLE1BQU0rRixXQUFXbkYsS0FBS29CLElBQUksQ0FBQzdCLEdBQUcsQ0FBRUg7Z0JBRWhDLDJEQUEyRDtnQkFDM0QsTUFBTWdHLHdCQUF3QkYseUJBQXlCQyxXQUFXO2dCQUVsRSx5Q0FBeUM7Z0JBQ3pDLE1BQU1FLFlBQVlwRSxRQUFTakI7Z0JBRTNCLE1BQU1zRixZQUFZOUYsUUFBUUQsR0FBRyxDQUFFMkY7Z0JBRS9CLDRHQUE0RztnQkFDNUcsaUZBQWlGO2dCQUNqRixJQUFJSywwQkFBMEI7Z0JBQzlCLElBQUtMLDJCQUEyQkUsdUJBQXdCO29CQUN0RGxGLE1BQU1pQixLQUFLLENBQUUsR0FBRyxDQUFDLEdBQUl6QyxPQUFPLENBQUUsQ0FBRWUsTUFBTStGO3dCQUNwQyxJQUFLL0YsS0FBS1UsS0FBSyxJQUFJK0UsMEJBQTBCekYsS0FBS1UsS0FBSyxHQUFHaUYsdUJBQXdCOzRCQUNoRkcsMkJBQTJCckUsWUFBWSxDQUFFc0UsVUFBVzt3QkFDdEQ7b0JBQ0Y7Z0JBQ0Y7Z0JBRUEsZ0RBQWdEO2dCQUNoRCxNQUFNQyxvQkFBb0I3RixFQUFFdUMsR0FBRyxDQUFFa0QsVUFBVTFHLEdBQUcsQ0FBRWMsQ0FBQUEsT0FBUUEsS0FBSzJCLElBQUksS0FBT21FO2dCQUN4RSxNQUFNRyxlQUFlSixVQUFVakUsUUFBUTtnQkFFdkMsMENBQTBDO2dCQUMxQyxNQUFNc0UsYUFBYTNGLEtBQUs0RixVQUFVLENBQ2hDeEcsYUFDQXFHLG1CQUNBQyxjQUNBMUYsS0FBSzZGLG1CQUFtQixDQUFFekcsY0FDMUIsQ0FBQ2tHLFVBQVV6RCxTQUFTLEVBQ3BCN0IsS0FBS3lCLGlCQUFpQixDQUFFckM7Z0JBRzFCSCxZQUFZLENBQUVHLFlBQVkwQyxhQUFhLENBQUUsR0FBR3RCLEtBQUtjLEdBQUcsQ0FBRXJDLFlBQVksQ0FBRUcsWUFBWTBDLGFBQWEsQ0FBRSxFQUFFNkQsVUFBVSxDQUFFdkcsWUFBWTBDLGFBQWEsQ0FBRTtnQkFDeEk3QyxZQUFZLENBQUVHLFlBQVk0QyxhQUFhLENBQUUsR0FBR3hCLEtBQUtDLEdBQUcsQ0FBRXhCLFlBQVksQ0FBRUcsWUFBWTRDLGFBQWEsQ0FBRSxFQUFFMkQsVUFBVSxDQUFFdkcsWUFBWTRDLGFBQWEsQ0FBRTtZQUMxSTtRQUNGO1FBRUEsNkVBQTZFO1FBQzdFLElBQUksQ0FBQzVELG9CQUFvQixDQUFDQyxLQUFLLEdBQUdZO1FBRWxDLElBQUksQ0FBQ1Ysb0JBQW9CLENBQUNGLEtBQUssR0FBR1EsYUFBYWlILFVBQVU7UUFDekQsSUFBSSxDQUFDdEgscUJBQXFCLENBQUNILEtBQUssR0FBR1EsYUFBYWtILFFBQVE7UUFFeEQsSUFBSSxDQUFDQyxxQkFBcUIsQ0FBQ0MsSUFBSTtJQUNqQztJQUVBLElBQVdDLFVBQTZCO1FBQ3RDbEYsVUFBVUEsT0FBUSxJQUFJLENBQUNtRixRQUFRLEtBQUssSUFBSSxDQUFDQyxRQUFRO1FBRWpELE9BQU8sSUFBSSxDQUFDRCxRQUFRO0lBQ3RCO0lBRUEsSUFBV0QsUUFBUzdILEtBQXdCLEVBQUc7UUFDN0MyQyxVQUFVQSxPQUFRLEFBQUUsT0FBTzNDLFVBQVUsWUFBWW1FLFNBQVVuRSxVQUFXQSxTQUFTLEtBQzNEZ0ksTUFBTUMsT0FBTyxDQUFFakksVUFBV3VCLEVBQUUyRyxLQUFLLENBQUVsSSxPQUFPbUksQ0FBQUEsT0FBVSxPQUFPQSxTQUFTLFlBQVloRSxTQUFVZ0UsU0FBVUEsUUFBUTtRQUVoSSxJQUFLLElBQUksQ0FBQ2xILFFBQVEsQ0FBQ0MsR0FBRyxDQUFFbEMsWUFBWTZCLFVBQVUsTUFBT2IsU0FBUyxJQUFJLENBQUNpQixRQUFRLENBQUNDLEdBQUcsQ0FBRWxDLFlBQVk4QixRQUFRLE1BQU9kLE9BQVE7WUFDbEgsSUFBSSxDQUFDaUIsUUFBUSxDQUFDdUIsR0FBRyxDQUFFeEQsWUFBWTZCLFVBQVUsRUFBRWI7WUFDM0MsSUFBSSxDQUFDaUIsUUFBUSxDQUFDdUIsR0FBRyxDQUFFeEQsWUFBWThCLFFBQVEsRUFBRWQ7WUFFekMsSUFBSSxDQUFDb0kseUJBQXlCO1FBQ2hDO0lBQ0Y7SUFFQSxJQUFXTixXQUE4QjtRQUN2QyxPQUFPLElBQUksQ0FBQzdHLFFBQVEsQ0FBQ0MsR0FBRyxDQUFFbEMsWUFBWTZCLFVBQVU7SUFDbEQ7SUFFQSxJQUFXaUgsU0FBVTlILEtBQXdCLEVBQUc7UUFDOUMyQyxVQUFVQSxPQUFRLEFBQUUsT0FBTzNDLFVBQVUsWUFBWW1FLFNBQVVuRSxVQUFXQSxTQUFTLEtBQzNEZ0ksTUFBTUMsT0FBTyxDQUFFakksVUFBV3VCLEVBQUUyRyxLQUFLLENBQUVsSSxPQUFPbUksQ0FBQUEsT0FBVSxPQUFPQSxTQUFTLFlBQVloRSxTQUFVZ0UsU0FBVUEsUUFBUTtRQUVoSSxJQUFLLElBQUksQ0FBQ2xILFFBQVEsQ0FBQ0MsR0FBRyxDQUFFbEMsWUFBWTZCLFVBQVUsTUFBT2IsT0FBUTtZQUMzRCxJQUFJLENBQUNpQixRQUFRLENBQUN1QixHQUFHLENBQUV4RCxZQUFZNkIsVUFBVSxFQUFFYjtZQUUzQyxJQUFJLENBQUNvSSx5QkFBeUI7UUFDaEM7SUFDRjtJQUVBLElBQVdMLFdBQThCO1FBQ3ZDLE9BQU8sSUFBSSxDQUFDOUcsUUFBUSxDQUFDQyxHQUFHLENBQUVsQyxZQUFZOEIsUUFBUTtJQUNoRDtJQUVBLElBQVdpSCxTQUFVL0gsS0FBd0IsRUFBRztRQUM5QzJDLFVBQVVBLE9BQVEsQUFBRSxPQUFPM0MsVUFBVSxZQUFZbUUsU0FBVW5FLFVBQVdBLFNBQVMsS0FDM0RnSSxNQUFNQyxPQUFPLENBQUVqSSxVQUFXdUIsRUFBRTJHLEtBQUssQ0FBRWxJLE9BQU9tSSxDQUFBQSxPQUFVLE9BQU9BLFNBQVMsWUFBWWhFLFNBQVVnRSxTQUFVQSxRQUFRO1FBRWhJLElBQUssSUFBSSxDQUFDbEgsUUFBUSxDQUFDQyxHQUFHLENBQUVsQyxZQUFZOEIsUUFBUSxNQUFPZCxPQUFRO1lBQ3pELElBQUksQ0FBQ2lCLFFBQVEsQ0FBQ3VCLEdBQUcsQ0FBRXhELFlBQVk4QixRQUFRLEVBQUVkO1lBRXpDLElBQUksQ0FBQ29JLHlCQUF5QjtRQUNoQztJQUNGO0lBRU9DLFFBQVMxRyxJQUFjLEVBQVM7UUFDckNnQixVQUFVQSxPQUFRLENBQUMsSUFBSSxDQUFDaEQsS0FBSyxDQUFDeUUsR0FBRyxDQUFFekM7UUFFbkMsSUFBSSxDQUFDaEMsS0FBSyxDQUFDK0YsR0FBRyxDQUFFL0Q7UUFDaEIsSUFBSSxDQUFDMkcsT0FBTyxDQUFFM0csS0FBSzRHLElBQUk7UUFDdkI1RyxLQUFLNkcsY0FBYyxDQUFDQyxXQUFXLENBQUUsSUFBSSxDQUFDQyxxQkFBcUI7UUFFM0QsSUFBSSxDQUFDTix5QkFBeUI7SUFDaEM7SUFFT08sV0FBWWhILElBQWMsRUFBUztRQUN4Q2dCLFVBQVVBLE9BQVEsSUFBSSxDQUFDaEQsS0FBSyxDQUFDeUUsR0FBRyxDQUFFekM7UUFFbEMsSUFBSSxDQUFDaEMsS0FBSyxDQUFDaUosTUFBTSxDQUFFakg7UUFDbkIsSUFBSSxDQUFDa0gsVUFBVSxDQUFFbEgsS0FBSzRHLElBQUk7UUFDMUI1RyxLQUFLNkcsY0FBYyxDQUFDTSxjQUFjLENBQUUsSUFBSSxDQUFDSixxQkFBcUI7UUFFOUQsSUFBSSxDQUFDTix5QkFBeUI7SUFDaEM7SUFFQTs7R0FFQyxHQUNELEFBQWdCVyxVQUFnQjtRQUM5Qiw2Q0FBNkM7UUFDN0MsSUFBSSxDQUFDQyxJQUFJO1FBRVQ7ZUFBSyxJQUFJLENBQUNySixLQUFLO1NBQUUsQ0FBQ1UsT0FBTyxDQUFFc0IsQ0FBQUEsT0FBUSxJQUFJLENBQUNnSCxVQUFVLENBQUVoSDtRQUVwRCxJQUFJLENBQUN2QixjQUFjLENBQUNDLE9BQU8sQ0FBRUMsQ0FBQUEsTUFBT0EsSUFBSUMsS0FBSztRQUM3QyxJQUFJLENBQUNWLGNBQWMsR0FBRyxFQUFFO1FBRXhCLEtBQUssQ0FBQ2tKO1FBRU4sSUFBSSxDQUFDRSxNQUFNO0lBQ2I7SUFFT3JILFdBQVliLFdBQXdCLEVBQWE7UUFDdEQsTUFBTW1JLFNBQW1CLEVBQUU7UUFFM0IsSUFBSSxDQUFDdkosS0FBSyxDQUFDVSxPQUFPLENBQUVzQixDQUFBQTtZQUNsQnVILE9BQU9qRSxJQUFJLElBQUt0RCxLQUFLQyxVQUFVLENBQUViO1FBQ25DO1FBRUEsT0FBT1EsRUFBRUMsVUFBVSxDQUFFRCxFQUFFRSxNQUFNLENBQUV5SDtJQUNqQztJQUVPQyxRQUFTQyxHQUFXLEVBQUVDLE1BQWMsRUFBb0I7UUFDN0QsT0FBTzlILEVBQUUrSCxJQUFJLENBQUU7ZUFBSyxJQUFJLENBQUMzSixLQUFLO1NBQUUsRUFBRWdDLENBQUFBLE9BQVFBLEtBQUs0SCxXQUFXLENBQUVILFFBQVN6SCxLQUFLNkgsY0FBYyxDQUFFSCxZQUFjO0lBQzFHO0lBRU9JLGdCQUFpQmxCLElBQVUsRUFBb0I7UUFDcEQsT0FBT2hILEVBQUUrSCxJQUFJLENBQUU7ZUFBSyxJQUFJLENBQUMzSixLQUFLO1NBQUUsRUFBRWdDLENBQUFBLE9BQVFBLEtBQUs0RyxJQUFJLEtBQUtBLFNBQVU7SUFDcEU7SUFFT21CLFNBQVUzSSxXQUF3QixFQUFFZSxLQUFhLEVBQWU7UUFDckUsT0FBT1AsRUFBRVMsTUFBTSxDQUFFO2VBQUssSUFBSSxDQUFDckMsS0FBSztTQUFFLEVBQUVnQyxDQUFBQSxPQUFRQSxLQUFLTSxhQUFhLENBQUVsQixhQUFhZTtJQUMvRTtJQUVBLE9BQWNTLE9BQVFvSCxZQUFrQixFQUFFQyxPQUErQixFQUFtQjtRQUMxRixPQUFPLElBQUluSyxlQUFnQmtLLGNBQWNDO0lBQzNDO0lBdGlCQSxZQUFvQkQsWUFBa0IsRUFBRUUsZUFBdUMsQ0FBRztRQUNoRixLQUFLLENBQUVGLGNBQWNFLHVCQVhObEssUUFBUSxJQUFJc0UsT0FFN0IscUJBQXFCO2FBQ2RwRSxpQkFBNkIsRUFBRSxFQUV0Qyx3Q0FBd0M7YUFDakNPLGlCQUFpQixJQUFJbkIsZ0JBQXdDLElBQUl5RCxPQUFPLElBQUlBLGFBRTNFekIsV0FBK0MsSUFBSWhDLGdCQUFvQyxHQUFHO1FBS2hHLHdHQUF3RztRQUN4Ryw2Q0FBNkM7UUFDN0MsSUFBSSxDQUFDNkssc0JBQXNCO1FBQzNCLElBQUksQ0FBQ0Msa0JBQWtCLENBQUVGO1FBQ3pCOUssT0FBUSxJQUFJLEVBQUVTLDZCQUE2QnFLO1FBRTNDLHdDQUF3QztRQUN4QyxJQUFJLENBQUNyQixjQUFjLENBQUNDLFdBQVcsQ0FBRSxJQUFJLENBQUNDLHFCQUFxQjtJQUM3RDtBQTRoQkY7QUFuakJBLFNBQXFCakosNEJBbWpCcEI7QUFFREYsUUFBUXlLLFFBQVEsQ0FBRSxrQkFBa0J2SztBQUNwQyxTQUFTRCwyQkFBMkIsR0FBRyJ9