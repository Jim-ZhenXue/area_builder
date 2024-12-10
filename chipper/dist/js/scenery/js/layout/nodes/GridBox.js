// Copyright 2022-2024, University of Colorado Boulder
/**
 * A grid-based layout container.
 *
 * See https://phetsims.github.io/scenery/doc/layout#GridBox for details
 *
 * GridBox-only options:
 *   - rows (see https://phetsims.github.io/scenery/doc/layout#GridBox-rows)
 *   - columns (see https://phetsims.github.io/scenery/doc/layout#GridBox-columns)
 *   - autoRows (see https://phetsims.github.io/scenery/doc/layout#GridBox-autoLines)
 *   - autoColumns (see https://phetsims.github.io/scenery/doc/layout#GridBox-autoLines)
 *   - resize (see https://phetsims.github.io/scenery/doc/layout#GridBox-resize)
 *   - spacing (see https://phetsims.github.io/scenery/doc/layout#GridBox-spacing)
 *   - xSpacing (see https://phetsims.github.io/scenery/doc/layout#GridBox-spacing)
 *   - ySpacing (see https://phetsims.github.io/scenery/doc/layout#GridBox-spacing)
 *   - layoutOrigin (see https://phetsims.github.io/scenery/doc/layout#layoutOrigin)
 *
 * GridBox and layoutOptions options (can be set either in the GridBox itself, or within its child nodes' layoutOptions):
 *   - xAlign (see https://phetsims.github.io/scenery/doc/layout#GridBox-align)
 *   - yAlign (see https://phetsims.github.io/scenery/doc/layout#GridBox-align)
 *   - stretch (see https://phetsims.github.io/scenery/doc/layout#GridBox-stretch)
 *   - xStretch (see https://phetsims.github.io/scenery/doc/layout#GridBox-stretch)
 *   - yStretch (see https://phetsims.github.io/scenery/doc/layout#GridBox-stretch)
 *   - grow (see https://phetsims.github.io/scenery/doc/layout#GridBox-grow)
 *   - xGrow (see https://phetsims.github.io/scenery/doc/layout#GridBox-grow)
 *   - yGrow (see https://phetsims.github.io/scenery/doc/layout#GridBox-grow)
 *   - margin (see https://phetsims.github.io/scenery/doc/layout#GridBox-margins)
 *   - xMargin (see https://phetsims.github.io/scenery/doc/layout#GridBox-margins)
 *   - yMargin (see https://phetsims.github.io/scenery/doc/layout#GridBox-margins)
 *   - leftMargin (see https://phetsims.github.io/scenery/doc/layout#GridBox-margins)
 *   - rightMargin (see https://phetsims.github.io/scenery/doc/layout#GridBox-margins)
 *   - topMargin (see https://phetsims.github.io/scenery/doc/layout#GridBox-margins)
 *   - bottomMargin (see https://phetsims.github.io/scenery/doc/layout#GridBox-margins)
 *   - minContentWidth (see https://phetsims.github.io/scenery/doc/layout#GridBox-minContent)
 *   - minContentHeight (see https://phetsims.github.io/scenery/doc/layout#GridBox-minContent)
 *   - maxContentWidth (see https://phetsims.github.io/scenery/doc/layout#GridBox-maxContent)
 *   - maxContentHeight (see https://phetsims.github.io/scenery/doc/layout#GridBox-maxContent)
 *
 * layoutOptions-only options (can only be set within the child nodes' layoutOptions, NOT available on GridBox):
 *   - x (see https://phetsims.github.io/scenery/doc/layout#GridBox-layoutOptions-location)
 *   - y (see https://phetsims.github.io/scenery/doc/layout#GridBox-layoutOptions-location)
 *   - horizontalSpan (see https://phetsims.github.io/scenery/doc/layout#GridBox-layoutOptions-size)
 *   - verticalSpan (see https://phetsims.github.io/scenery/doc/layout#GridBox-layoutOptions-size)
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ import assertMutuallyExclusiveOptions from '../../../../phet-core/js/assertMutuallyExclusiveOptions.js';
import optionize from '../../../../phet-core/js/optionize.js';
import Orientation from '../../../../phet-core/js/Orientation.js';
import { GRID_CONSTRAINT_OPTION_KEYS, GridCell, GridConstraint, LAYOUT_NODE_OPTION_KEYS, LayoutAlign, LayoutNode, MarginLayoutCell, Node, REQUIRES_BOUNDS_OPTION_KEYS, scenery, SIZABLE_OPTION_KEYS } from '../../imports.js';
// GridBox-specific options that can be passed in the constructor or mutate() call.
const GRIDBOX_OPTION_KEYS = [
    ...LAYOUT_NODE_OPTION_KEYS,
    ...GRID_CONSTRAINT_OPTION_KEYS.filter((key)=>key !== 'excludeInvisible'),
    'rows',
    'columns',
    'autoRows',
    'autoColumns'
];
let GridBox = class GridBox extends LayoutNode {
    /**
   * Sets the children of the GridBox and adjusts them to be positioned in certain cells. It takes a 2-dimensional array
   * of Node|null (where null is a placeholder that does nothing).
   *
   * For each cell, the first index into the array will be taken as the cell position in the provided orientation. The
   * second index into the array will be taken as the cell position in the OPPOSITE orientation.
   *
   * See GridBox.rows or GridBox.columns for usages and more documentation.
   */ setLines(orientation, lineArrays) {
        const children = [];
        for(let i = 0; i < lineArrays.length; i++){
            const lineArray = lineArrays[i];
            for(let j = 0; j < lineArray.length; j++){
                const item = lineArray[j];
                if (item !== null) {
                    children.push(item);
                    item.mutateLayoutOptions({
                        [orientation.line]: i,
                        [orientation.opposite.line]: j
                    });
                }
            }
        }
        this.children = children;
    }
    /**
   * Returns the children of the GridBox in a 2-dimensional array of Node|null (where null is a placeholder that does
   * nothing).
   *
   * For each cell, the first index into the array will be taken as the cell position in the provided orientation. The
   * second index into the array will be taken as the cell position in the OPPOSITE orientation.
   *
   * See GridBox.rows or GridBox.columns for usages
   */ getLines(orientation) {
        const lineArrays = [];
        for (const cell of this._cellMap.values()){
            const i = cell.position.get(orientation);
            const j = cell.position.get(orientation.opposite);
            // Ensure we have enough lines
            while(lineArrays.length < i + 1){
                lineArrays.push([]);
            }
            // null-pad lines
            while(lineArrays[i].length < j + 1){
                lineArrays[i].push(null);
            }
            // Finally the actual node!
            lineArrays[i][j] = cell.node;
        }
        return lineArrays;
    }
    /**
   * Sets the children of the GridBox by specifying a two-dimensional array of Nodes (or null values as spacers).
   * The inner arrays will be the rows of the grid.
   * Mutates layoutOptions of the provided Nodes. See setLines() for more documentation.
   */ set rows(lineArrays) {
        this.setLines(Orientation.VERTICAL, lineArrays);
    }
    /**
   * Returns a two-dimensional array of the child Nodes (with null as a spacer) where the inner arrays are the rows.
   */ get rows() {
        return this.getLines(Orientation.VERTICAL);
    }
    /**
   * Sets the children of the GridBox by specifying a two-dimensional array of Nodes (or null values as spacers).
   * The inner arrays will be the columns of the grid.
   * * Mutates layoutOptions of the provided Nodes. See setLines() for more documentation.
   */ set columns(lineArrays) {
        this.setLines(Orientation.HORIZONTAL, lineArrays);
    }
    /**
   * Returns a two-dimensional array of the child Nodes (with null as a spacer) where the inner arrays are the columns.
   */ get columns() {
        return this.getLines(Orientation.HORIZONTAL);
    }
    /**
   * Returns the Node at a specific row/column intersection (or null if there are none)
   */ getNodeAt(row, column) {
        const cell = this.constraint.getCell(row, column);
        return cell ? cell.node : null;
    }
    /**
   * Returns the row index of a child Node (or if it spans multiple rows, the first row)
   */ getRowOfNode(node) {
        assert && assert(this.children.includes(node));
        return this.constraint.getCellFromNode(node).position.vertical;
    }
    /**
   * Returns the column index of a child Node (or if it spans multiple columns, the first row)
   */ getColumnOfNode(node) {
        assert && assert(this.children.includes(node));
        return this.constraint.getCellFromNode(node).position.horizontal;
    }
    /**
   * Returns all the Nodes in a given row (by index)
   */ getNodesInRow(index) {
        return this.constraint.getCells(Orientation.VERTICAL, index).map((cell)=>cell.node);
    }
    /**
   * Returns all the Nodes in a given column (by index)
   */ getNodesInColumn(index) {
        return this.constraint.getCells(Orientation.HORIZONTAL, index).map((cell)=>cell.node);
    }
    /**
   * Adds an array of child Nodes (with null allowed as empty spacers) at the bottom of all existing rows.
   */ addRow(row) {
        this.rows = [
            ...this.rows,
            row
        ];
        return this;
    }
    /**
   * Adds an array of child Nodes (with null allowed as empty spacers) at the right of all existing columns.
   */ addColumn(column) {
        this.columns = [
            ...this.columns,
            column
        ];
        return this;
    }
    /**
   * Inserts a row of child Nodes at a given row index (see addRow for more information)
   */ insertRow(index, row) {
        this.rows = [
            ...this.rows.slice(0, index),
            row,
            ...this.rows.slice(index)
        ];
        return this;
    }
    /**
   * Inserts a column of child Nodes at a given column index (see addColumn for more information)
   */ insertColumn(index, column) {
        this.columns = [
            ...this.columns.slice(0, index),
            column,
            ...this.columns.slice(index)
        ];
        return this;
    }
    /**
   * Removes all child Nodes in a given row
   */ removeRow(index) {
        this.rows = [
            ...this.rows.slice(0, index),
            ...this.rows.slice(index + 1)
        ];
        return this;
    }
    /**
   * Removes all child Nodes in a given column
   */ removeColumn(index) {
        this.columns = [
            ...this.columns.slice(0, index),
            ...this.columns.slice(index + 1)
        ];
        return this;
    }
    set autoRows(value) {
        assert && assert(value === null || typeof value === 'number' && isFinite(value) && value >= 1);
        if (this._autoRows !== value) {
            this._autoRows = value;
            this.updateAutoRows();
        }
    }
    get autoRows() {
        return this._autoRows;
    }
    set autoColumns(value) {
        assert && assert(value === null || typeof value === 'number' && isFinite(value) && value >= 1);
        if (this._autoColumns !== value) {
            this._autoColumns = value;
            this.updateAutoColumns();
        }
    }
    get autoColumns() {
        return this._autoColumns;
    }
    // Used for autoRows/autoColumns
    updateAutoLines(orientation, value) {
        if (value !== null && this._autoLockCount === 0) {
            let updatedCount = 0;
            this.constraint.lock();
            this.children.filter((child)=>{
                return child.bounds.isValid() && (!this._constraint.excludeInvisible || child.visible);
            }).forEach((child, index)=>{
                const primary = index % value;
                const secondary = Math.floor(index / value);
                const width = 1;
                const height = 1;
                // We guard to see if we actually have to update anything (so we can avoid triggering an auto-layout)
                if (!child.layoutOptions || child.layoutOptions[orientation.line] !== primary || child.layoutOptions[orientation.opposite.line] !== secondary || child.layoutOptions.horizontalSpan !== width || child.layoutOptions.verticalSpan !== height) {
                    updatedCount++;
                    child.mutateLayoutOptions({
                        [orientation.line]: index % value,
                        [orientation.opposite.line]: Math.floor(index / value),
                        horizontalSpan: 1,
                        verticalSpan: 1
                    });
                }
            });
            this.constraint.unlock();
            // Only trigger an automatic layout IF we actually adjusted something.
            if (updatedCount > 0) {
                this.constraint.updateLayoutAutomatically();
            }
        }
    }
    updateAutoRows() {
        this.updateAutoLines(Orientation.VERTICAL, this.autoRows);
    }
    updateAutoColumns() {
        this.updateAutoLines(Orientation.HORIZONTAL, this.autoColumns);
    }
    // Updates rows or columns, whichever is active at the moment (if any)
    updateAllAutoLines() {
        assert && assert(this._autoRows === null || this._autoColumns === null, 'autoRows and autoColumns should not both be set when updating children');
        this.updateAutoRows();
        this.updateAutoColumns();
    }
    setChildren(children) {
        const oldChildren = this.getChildren(); // defensive copy
        // Don't update autoRows/autoColumns settings while setting children, wait until after for performance
        this._autoLockCount++;
        super.setChildren(children);
        this._autoLockCount--;
        if (!_.isEqual(oldChildren, children)) {
            this.updateAllAutoLines();
        }
        return this;
    }
    /**
   * Called when a child is inserted.
   */ onGridBoxChildInserted(node, index) {
        node.visibleProperty.lazyLink(this.onChildVisibilityToggled);
        const cell = new GridCell(this._constraint, node, this._constraint.createLayoutProxy(node));
        this._cellMap.set(node, cell);
        this._constraint.addCell(cell);
        this.updateAllAutoLines();
    }
    /**
   * Called when a child is removed.
   *
   * NOTE: This is NOT called on disposal. Any additional cleanup (to prevent memory leaks) should be included in the
   * dispose() function
   */ onGridBoxChildRemoved(node) {
        const cell = this._cellMap.get(node);
        assert && assert(cell);
        this._cellMap.delete(node);
        this._constraint.removeCell(cell);
        cell.dispose();
        this.updateAllAutoLines();
        node.visibleProperty.unlink(this.onChildVisibilityToggled);
    }
    mutate(options) {
        // children can be used with one of autoRows/autoColumns, but otherwise these options are exclusive
        assertMutuallyExclusiveOptions(options, [
            'rows'
        ], [
            'columns'
        ], [
            'children',
            'autoRows',
            'autoColumns'
        ]);
        if (options) {
            assert && assert(typeof options.autoRows !== 'number' || typeof options.autoColumns !== 'number', 'autoRows and autoColumns should not be specified both as non-null at the same time');
        }
        return super.mutate(options);
    }
    get spacing() {
        return this._constraint.spacing;
    }
    set spacing(value) {
        this._constraint.spacing = value;
    }
    get xSpacing() {
        return this._constraint.xSpacing;
    }
    set xSpacing(value) {
        this._constraint.xSpacing = value;
    }
    get ySpacing() {
        return this._constraint.ySpacing;
    }
    set ySpacing(value) {
        this._constraint.ySpacing = value;
    }
    get xAlign() {
        return this._constraint.xAlign;
    }
    set xAlign(value) {
        this._constraint.xAlign = value;
    }
    get yAlign() {
        return this._constraint.yAlign;
    }
    set yAlign(value) {
        this._constraint.yAlign = value;
    }
    get grow() {
        return this._constraint.grow;
    }
    set grow(value) {
        this._constraint.grow = value;
    }
    get xGrow() {
        return this._constraint.xGrow;
    }
    set xGrow(value) {
        this._constraint.xGrow = value;
    }
    get yGrow() {
        return this._constraint.yGrow;
    }
    set yGrow(value) {
        this._constraint.yGrow = value;
    }
    get stretch() {
        return this._constraint.stretch;
    }
    set stretch(value) {
        this._constraint.stretch = value;
    }
    get xStretch() {
        return this._constraint.xStretch;
    }
    set xStretch(value) {
        this._constraint.xStretch = value;
    }
    get yStretch() {
        return this._constraint.yStretch;
    }
    set yStretch(value) {
        this._constraint.yStretch = value;
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
    setExcludeInvisibleChildrenFromBounds(excludeInvisibleChildrenFromBounds) {
        super.setExcludeInvisibleChildrenFromBounds(excludeInvisibleChildrenFromBounds);
        this.updateAllAutoLines();
    }
    dispose() {
        // Lock our layout forever
        this._constraint.lock();
        this.childInsertedEmitter.removeListener(this.onChildInserted);
        this.childRemovedEmitter.removeListener(this.onChildRemoved);
        // Dispose our cells here. We won't be getting the children-removed listeners fired (we removed them above)
        for (const cell of this._cellMap.values()){
            cell.dispose();
            cell.node.visibleProperty.unlink(this.onChildVisibilityToggled);
        }
        super.dispose();
    }
    getHelperNode() {
        const marginsNode = MarginLayoutCell.createHelperNode(this.constraint.displayedCells, this.constraint.layoutBoundsProperty.value, (cell)=>{
            let str = '';
            str += `row: ${cell.position.vertical}\n`;
            str += `column: ${cell.position.horizontal}\n`;
            if (cell.size.horizontal > 1) {
                str += `horizontalSpan: ${cell.size.horizontal}\n`;
            }
            if (cell.size.vertical > 1) {
                str += `verticalSpan: ${cell.size.vertical}\n`;
            }
            str += `xAlign: ${LayoutAlign.internalToAlign(Orientation.HORIZONTAL, cell.effectiveXAlign)}\n`;
            str += `yAlign: ${LayoutAlign.internalToAlign(Orientation.VERTICAL, cell.effectiveYAlign)}\n`;
            str += `xStretch: ${cell.effectiveXStretch}\n`;
            str += `yStretch: ${cell.effectiveYStretch}\n`;
            str += `xGrow: ${cell.effectiveXGrow}\n`;
            str += `yGrow: ${cell.effectiveYGrow}\n`;
            return str;
        });
        return marginsNode;
    }
    constructor(providedOptions){
        const options = optionize()({
            // Allow dynamic layout by default, see https://github.com/phetsims/joist/issues/608
            excludeInvisibleChildrenFromBounds: true,
            resize: true
        }, providedOptions);
        super(), this._cellMap = new Map(), // For handling auto-wrapping features
        this._autoRows = null, this._autoColumns = null, // So we don't kill performance while setting children with autoRows/autoColumns
        this._autoLockCount = 0;
        this._constraint = new GridConstraint(this, {
            preferredWidthProperty: this.localPreferredWidthProperty,
            preferredHeightProperty: this.localPreferredHeightProperty,
            minimumWidthProperty: this.localMinimumWidthProperty,
            minimumHeightProperty: this.localMinimumHeightProperty,
            layoutOriginProperty: this.layoutOriginProperty,
            excludeInvisible: false // Should be handled by the options mutate below
        });
        this.onChildInserted = this.onGridBoxChildInserted.bind(this);
        this.onChildRemoved = this.onGridBoxChildRemoved.bind(this);
        this.onChildVisibilityToggled = this.updateAllAutoLines.bind(this);
        this.childInsertedEmitter.addListener(this.onChildInserted);
        this.childRemovedEmitter.addListener(this.onChildRemoved);
        const nonBoundsOptions = _.omit(options, REQUIRES_BOUNDS_OPTION_KEYS);
        const boundsOptions = _.pick(options, REQUIRES_BOUNDS_OPTION_KEYS);
        // Before we layout, do non-bounds-related changes (in case we have resize:false), and prevent layout for
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
export { GridBox as default };
/**
 * {Array.<string>} - String keys for all of the allowed options that will be set by node.mutate( options ), in the
 * order they will be evaluated in.
 *
 * NOTE: See Node's _mutatorKeys documentation for more information on how this operates, and potential special
 *       cases that may apply.
 */ GridBox.prototype._mutatorKeys = [
    ...SIZABLE_OPTION_KEYS,
    ...GRIDBOX_OPTION_KEYS,
    ...Node.prototype._mutatorKeys
];
scenery.register('GridBox', GridBox);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvbGF5b3V0L25vZGVzL0dyaWRCb3gudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjItMjAyNCwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbi8qKlxuICogQSBncmlkLWJhc2VkIGxheW91dCBjb250YWluZXIuXG4gKlxuICogU2VlIGh0dHBzOi8vcGhldHNpbXMuZ2l0aHViLmlvL3NjZW5lcnkvZG9jL2xheW91dCNHcmlkQm94IGZvciBkZXRhaWxzXG4gKlxuICogR3JpZEJveC1vbmx5IG9wdGlvbnM6XG4gKiAgIC0gcm93cyAoc2VlIGh0dHBzOi8vcGhldHNpbXMuZ2l0aHViLmlvL3NjZW5lcnkvZG9jL2xheW91dCNHcmlkQm94LXJvd3MpXG4gKiAgIC0gY29sdW1ucyAoc2VlIGh0dHBzOi8vcGhldHNpbXMuZ2l0aHViLmlvL3NjZW5lcnkvZG9jL2xheW91dCNHcmlkQm94LWNvbHVtbnMpXG4gKiAgIC0gYXV0b1Jvd3MgKHNlZSBodHRwczovL3BoZXRzaW1zLmdpdGh1Yi5pby9zY2VuZXJ5L2RvYy9sYXlvdXQjR3JpZEJveC1hdXRvTGluZXMpXG4gKiAgIC0gYXV0b0NvbHVtbnMgKHNlZSBodHRwczovL3BoZXRzaW1zLmdpdGh1Yi5pby9zY2VuZXJ5L2RvYy9sYXlvdXQjR3JpZEJveC1hdXRvTGluZXMpXG4gKiAgIC0gcmVzaXplIChzZWUgaHR0cHM6Ly9waGV0c2ltcy5naXRodWIuaW8vc2NlbmVyeS9kb2MvbGF5b3V0I0dyaWRCb3gtcmVzaXplKVxuICogICAtIHNwYWNpbmcgKHNlZSBodHRwczovL3BoZXRzaW1zLmdpdGh1Yi5pby9zY2VuZXJ5L2RvYy9sYXlvdXQjR3JpZEJveC1zcGFjaW5nKVxuICogICAtIHhTcGFjaW5nIChzZWUgaHR0cHM6Ly9waGV0c2ltcy5naXRodWIuaW8vc2NlbmVyeS9kb2MvbGF5b3V0I0dyaWRCb3gtc3BhY2luZylcbiAqICAgLSB5U3BhY2luZyAoc2VlIGh0dHBzOi8vcGhldHNpbXMuZ2l0aHViLmlvL3NjZW5lcnkvZG9jL2xheW91dCNHcmlkQm94LXNwYWNpbmcpXG4gKiAgIC0gbGF5b3V0T3JpZ2luIChzZWUgaHR0cHM6Ly9waGV0c2ltcy5naXRodWIuaW8vc2NlbmVyeS9kb2MvbGF5b3V0I2xheW91dE9yaWdpbilcbiAqXG4gKiBHcmlkQm94IGFuZCBsYXlvdXRPcHRpb25zIG9wdGlvbnMgKGNhbiBiZSBzZXQgZWl0aGVyIGluIHRoZSBHcmlkQm94IGl0c2VsZiwgb3Igd2l0aGluIGl0cyBjaGlsZCBub2RlcycgbGF5b3V0T3B0aW9ucyk6XG4gKiAgIC0geEFsaWduIChzZWUgaHR0cHM6Ly9waGV0c2ltcy5naXRodWIuaW8vc2NlbmVyeS9kb2MvbGF5b3V0I0dyaWRCb3gtYWxpZ24pXG4gKiAgIC0geUFsaWduIChzZWUgaHR0cHM6Ly9waGV0c2ltcy5naXRodWIuaW8vc2NlbmVyeS9kb2MvbGF5b3V0I0dyaWRCb3gtYWxpZ24pXG4gKiAgIC0gc3RyZXRjaCAoc2VlIGh0dHBzOi8vcGhldHNpbXMuZ2l0aHViLmlvL3NjZW5lcnkvZG9jL2xheW91dCNHcmlkQm94LXN0cmV0Y2gpXG4gKiAgIC0geFN0cmV0Y2ggKHNlZSBodHRwczovL3BoZXRzaW1zLmdpdGh1Yi5pby9zY2VuZXJ5L2RvYy9sYXlvdXQjR3JpZEJveC1zdHJldGNoKVxuICogICAtIHlTdHJldGNoIChzZWUgaHR0cHM6Ly9waGV0c2ltcy5naXRodWIuaW8vc2NlbmVyeS9kb2MvbGF5b3V0I0dyaWRCb3gtc3RyZXRjaClcbiAqICAgLSBncm93IChzZWUgaHR0cHM6Ly9waGV0c2ltcy5naXRodWIuaW8vc2NlbmVyeS9kb2MvbGF5b3V0I0dyaWRCb3gtZ3JvdylcbiAqICAgLSB4R3JvdyAoc2VlIGh0dHBzOi8vcGhldHNpbXMuZ2l0aHViLmlvL3NjZW5lcnkvZG9jL2xheW91dCNHcmlkQm94LWdyb3cpXG4gKiAgIC0geUdyb3cgKHNlZSBodHRwczovL3BoZXRzaW1zLmdpdGh1Yi5pby9zY2VuZXJ5L2RvYy9sYXlvdXQjR3JpZEJveC1ncm93KVxuICogICAtIG1hcmdpbiAoc2VlIGh0dHBzOi8vcGhldHNpbXMuZ2l0aHViLmlvL3NjZW5lcnkvZG9jL2xheW91dCNHcmlkQm94LW1hcmdpbnMpXG4gKiAgIC0geE1hcmdpbiAoc2VlIGh0dHBzOi8vcGhldHNpbXMuZ2l0aHViLmlvL3NjZW5lcnkvZG9jL2xheW91dCNHcmlkQm94LW1hcmdpbnMpXG4gKiAgIC0geU1hcmdpbiAoc2VlIGh0dHBzOi8vcGhldHNpbXMuZ2l0aHViLmlvL3NjZW5lcnkvZG9jL2xheW91dCNHcmlkQm94LW1hcmdpbnMpXG4gKiAgIC0gbGVmdE1hcmdpbiAoc2VlIGh0dHBzOi8vcGhldHNpbXMuZ2l0aHViLmlvL3NjZW5lcnkvZG9jL2xheW91dCNHcmlkQm94LW1hcmdpbnMpXG4gKiAgIC0gcmlnaHRNYXJnaW4gKHNlZSBodHRwczovL3BoZXRzaW1zLmdpdGh1Yi5pby9zY2VuZXJ5L2RvYy9sYXlvdXQjR3JpZEJveC1tYXJnaW5zKVxuICogICAtIHRvcE1hcmdpbiAoc2VlIGh0dHBzOi8vcGhldHNpbXMuZ2l0aHViLmlvL3NjZW5lcnkvZG9jL2xheW91dCNHcmlkQm94LW1hcmdpbnMpXG4gKiAgIC0gYm90dG9tTWFyZ2luIChzZWUgaHR0cHM6Ly9waGV0c2ltcy5naXRodWIuaW8vc2NlbmVyeS9kb2MvbGF5b3V0I0dyaWRCb3gtbWFyZ2lucylcbiAqICAgLSBtaW5Db250ZW50V2lkdGggKHNlZSBodHRwczovL3BoZXRzaW1zLmdpdGh1Yi5pby9zY2VuZXJ5L2RvYy9sYXlvdXQjR3JpZEJveC1taW5Db250ZW50KVxuICogICAtIG1pbkNvbnRlbnRIZWlnaHQgKHNlZSBodHRwczovL3BoZXRzaW1zLmdpdGh1Yi5pby9zY2VuZXJ5L2RvYy9sYXlvdXQjR3JpZEJveC1taW5Db250ZW50KVxuICogICAtIG1heENvbnRlbnRXaWR0aCAoc2VlIGh0dHBzOi8vcGhldHNpbXMuZ2l0aHViLmlvL3NjZW5lcnkvZG9jL2xheW91dCNHcmlkQm94LW1heENvbnRlbnQpXG4gKiAgIC0gbWF4Q29udGVudEhlaWdodCAoc2VlIGh0dHBzOi8vcGhldHNpbXMuZ2l0aHViLmlvL3NjZW5lcnkvZG9jL2xheW91dCNHcmlkQm94LW1heENvbnRlbnQpXG4gKlxuICogbGF5b3V0T3B0aW9ucy1vbmx5IG9wdGlvbnMgKGNhbiBvbmx5IGJlIHNldCB3aXRoaW4gdGhlIGNoaWxkIG5vZGVzJyBsYXlvdXRPcHRpb25zLCBOT1QgYXZhaWxhYmxlIG9uIEdyaWRCb3gpOlxuICogICAtIHggKHNlZSBodHRwczovL3BoZXRzaW1zLmdpdGh1Yi5pby9zY2VuZXJ5L2RvYy9sYXlvdXQjR3JpZEJveC1sYXlvdXRPcHRpb25zLWxvY2F0aW9uKVxuICogICAtIHkgKHNlZSBodHRwczovL3BoZXRzaW1zLmdpdGh1Yi5pby9zY2VuZXJ5L2RvYy9sYXlvdXQjR3JpZEJveC1sYXlvdXRPcHRpb25zLWxvY2F0aW9uKVxuICogICAtIGhvcml6b250YWxTcGFuIChzZWUgaHR0cHM6Ly9waGV0c2ltcy5naXRodWIuaW8vc2NlbmVyeS9kb2MvbGF5b3V0I0dyaWRCb3gtbGF5b3V0T3B0aW9ucy1zaXplKVxuICogICAtIHZlcnRpY2FsU3BhbiAoc2VlIGh0dHBzOi8vcGhldHNpbXMuZ2l0aHViLmlvL3NjZW5lcnkvZG9jL2xheW91dCNHcmlkQm94LWxheW91dE9wdGlvbnMtc2l6ZSlcbiAqXG4gKiBAYXV0aG9yIEpvbmF0aGFuIE9sc29uIDxqb25hdGhhbi5vbHNvbkBjb2xvcmFkby5lZHU+XG4gKi9cblxuaW1wb3J0IGFzc2VydE11dHVhbGx5RXhjbHVzaXZlT3B0aW9ucyBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvYXNzZXJ0TXV0dWFsbHlFeGNsdXNpdmVPcHRpb25zLmpzJztcbmltcG9ydCBvcHRpb25pemUgZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL29wdGlvbml6ZS5qcyc7XG5pbXBvcnQgT3JpZW50YXRpb24gZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL09yaWVudGF0aW9uLmpzJztcbmltcG9ydCBTdHJpY3RPbWl0IGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy90eXBlcy9TdHJpY3RPbWl0LmpzJztcbmltcG9ydCB7IEdSSURfQ09OU1RSQUlOVF9PUFRJT05fS0VZUywgR3JpZENlbGwsIEdyaWRDb25zdHJhaW50LCBHcmlkQ29uc3RyYWludE9wdGlvbnMsIEhvcml6b250YWxMYXlvdXRBbGlnbiwgTEFZT1VUX05PREVfT1BUSU9OX0tFWVMsIExheW91dEFsaWduLCBMYXlvdXROb2RlLCBMYXlvdXROb2RlT3B0aW9ucywgTWFyZ2luTGF5b3V0Q2VsbCwgTm9kZSwgUkVRVUlSRVNfQk9VTkRTX09QVElPTl9LRVlTLCBzY2VuZXJ5LCBTSVpBQkxFX09QVElPTl9LRVlTLCBWZXJ0aWNhbExheW91dEFsaWduIH0gZnJvbSAnLi4vLi4vaW1wb3J0cy5qcyc7XG5cbi8vIEdyaWRCb3gtc3BlY2lmaWMgb3B0aW9ucyB0aGF0IGNhbiBiZSBwYXNzZWQgaW4gdGhlIGNvbnN0cnVjdG9yIG9yIG11dGF0ZSgpIGNhbGwuXG5jb25zdCBHUklEQk9YX09QVElPTl9LRVlTID0gW1xuICAuLi5MQVlPVVRfTk9ERV9PUFRJT05fS0VZUyxcbiAgLi4uR1JJRF9DT05TVFJBSU5UX09QVElPTl9LRVlTLmZpbHRlcigga2V5ID0+IGtleSAhPT0gJ2V4Y2x1ZGVJbnZpc2libGUnICksXG4gICdyb3dzJyxcbiAgJ2NvbHVtbnMnLFxuICAnYXV0b1Jvd3MnLFxuICAnYXV0b0NvbHVtbnMnXG5dO1xuXG4vLyBVc2VkIGZvciBzZXR0aW5nL2dldHRpbmcgcm93cy9jb2x1bW5zXG50eXBlIExpbmVBcnJheSA9ICggTm9kZSB8IG51bGwgKVtdO1xudHlwZSBMaW5lQXJyYXlzID0gTGluZUFycmF5W107XG5cbnR5cGUgR3JpZENvbnN0cmFpbnRFeGNsdWRlZE9wdGlvbnMgPSAnZXhjbHVkZUludmlzaWJsZScgfCAncHJlZmVycmVkV2lkdGhQcm9wZXJ0eScgfCAncHJlZmVycmVkSGVpZ2h0UHJvcGVydHknIHwgJ21pbmltdW1XaWR0aFByb3BlcnR5JyB8ICdtaW5pbXVtSGVpZ2h0UHJvcGVydHknIHwgJ2xheW91dE9yaWdpblByb3BlcnR5JztcbnR5cGUgU2VsZk9wdGlvbnMgPSB7XG4gIC8vIENvbnRyb2xzIHdoZXRoZXIgdGhlIEdyaWRCb3ggd2lsbCByZS10cmlnZ2VyIGxheW91dCBhdXRvbWF0aWNhbGx5IGFmdGVyIHRoZSBcImZpcnN0XCIgbGF5b3V0IGR1cmluZyBjb25zdHJ1Y3Rpb24uXG4gIC8vIFRoZSBHcmlkQm94IHdpbGwgbGF5b3V0IG9uY2UgYWZ0ZXIgcHJvY2Vzc2luZyB0aGUgb3B0aW9ucyBvYmplY3QsIGJ1dCBpZiByZXNpemU6ZmFsc2UsIHRoZW4gYWZ0ZXIgdGhhdCBtYW51YWxcbiAgLy8gbGF5b3V0IGNhbGxzIHdpbGwgbmVlZCB0byBiZSBkb25lICh3aXRoIHVwZGF0ZUxheW91dCgpKVxuICByZXNpemU/OiBib29sZWFuO1xuXG4gIC8vIFNldHMgdGhlIGNoaWxkcmVuIG9mIHRoZSBHcmlkQm94IGFuZCBwb3NpdGlvbnMgdGhlbSB1c2luZyBhIDItZGltZW5zaW9uYWwgYXJyYXkgb2YgTm9kZXxudWxsIChudWxsIGlzIGEgcGxhY2Vob2xkZXJcbiAgLy8gYW5kIGRvZXMgbm90aGluZykuIFRoZSBmaXJzdCBpbmRleCBpcyB0cmVhdGVkIGFzIGEgcm93LCBhbmQgdGhlIHNlY29uZCBpcyB0cmVhdGVkIGFzIGEgY29sdW1uLCBzbyB0aGF0OlxuICAvL1xuICAvLyAgIHJvd3NbIHJvdyBdWyBjb2x1bW4gXSA9IE5vZGVcbiAgLy8gICByb3dzWyB5IF1bIHggXSA9IE5vZGVcbiAgLy9cbiAgLy8gVGh1cyB0aGUgZm9sbG93aW5nIHdpbGwgaGF2ZSAyIHJvd3MgdGhhdCBoYXZlIDMgY29sdW1ucyBlYWNoOlxuICAvLyAgIHJvd3M6IFsgWyBhLCBiLCBjIF0sIFsgZCwgZSwgZiBdIF1cbiAgLy9cbiAgLy8gTk9URTogVGhpcyB3aWxsIG11dGF0ZSB0aGUgbGF5b3V0T3B0aW9ucyBvZiB0aGUgTm9kZXMgdGhlbXNlbHZlcywgYW5kIHdpbGwgYWxzbyB3aXBlIG91dCBhbnkgZXhpc3RpbmcgY2hpbGRyZW4uXG4gIC8vIE5PVEU6IERvbid0IHVzZSB0aGlzIG9wdGlvbiB3aXRoIGVpdGhlciBgY2hpbGRyZW5gIG9yIGBjb2x1bW5zYCBhbHNvIGJlaW5nIHNldFxuICByb3dzPzogTGluZUFycmF5cztcblxuICAvLyBTZXRzIHRoZSBjaGlsZHJlbiBvZiB0aGUgR3JpZEJveCBhbmQgcG9zaXRpb25zIHRoZW0gdXNpbmcgYSAyLWRpbWVuc2lvbmFsIGFycmF5IG9mIE5vZGV8bnVsbCAobnVsbCBpcyBhIHBsYWNlaG9sZGVyXG4gIC8vIGFuZCBkb2VzIG5vdGhpbmcpLiBUaGUgZmlyc3QgaW5kZXggaXMgdHJlYXRlZCBhcyBhIGNvbHVtbiwgYW5kIHRoZSBzZWNvbmQgaXMgdHJlYXRlZCBhcyBhIHJvdywgc28gdGhhdDpcbiAgLy9cbiAgLy8gICBjb2x1bW5zWyBjb2x1bW4gXVsgcm93IF0gPSBOb2RlXG4gIC8vICAgY29sdW1uc1sgeCBdWyB5IF0gPSBOb2RlXG4gIC8vXG4gIC8vIFRodXMgdGhlIGZvbGxvd2luZyB3aWxsIGhhdmUgMiBjb2x1bW5zIHRoYXQgaGF2ZSAzIHJvd3MgZWFjaDpcbiAgLy8gICBjb2x1bW5zOiBbIFsgYSwgYiwgYyBdLCBbIGQsIGUsIGYgXSBdXG4gIC8vXG4gIC8vIE5PVEU6IFRoaXMgd2lsbCBtdXRhdGUgdGhlIGxheW91dE9wdGlvbnMgb2YgdGhlIE5vZGVzIHRoZW1zZWx2ZXMsIGFuZCB3aWxsIGFsc28gd2lwZSBvdXQgYW55IGV4aXN0aW5nIGNoaWxkcmVuLlxuICAvLyBOT1RFOiBEb24ndCB1c2UgdGhpcyBvcHRpb24gd2l0aCBlaXRoZXIgYGNoaWxkcmVuYCBvciBgcm93c2AgYWxzbyBiZWluZyBzZXRcbiAgY29sdW1ucz86IExpbmVBcnJheXM7XG5cbiAgLy8gV2hlbiBub24tbnVsbCwgdGhlIGNlbGxzIG9mIHRoaXMgZ3JpZCB3aWxsIGJlIHBvc2l0aW9uZWQvc2l6ZWQgdG8gYmUgMXgxIGNlbGxzLCBmaWxsaW5nIHJvd3MgdW50aWwgYSBjb2x1bW4gaGFzXG4gIC8vIGBhdXRvUm93c2AgbnVtYmVyIG9mIHJvd3MsIHRoZW4gaXQgd2lsbCBnbyB0byB0aGUgbmV4dCBjb2x1bW4uIFRoaXMgc2hvdWxkIGdlbmVyYWxseSBiZSB1c2VkIHdpdGggYGNoaWxkcmVuYCBvclxuICAvLyBhZGRpbmcvcmVtb3ZpbmcgY2hpbGRyZW4gaW4gbm9ybWFsIHdheXMuXG4gIC8vIE5PVEU6IFRoaXMgc2hvdWxkIGJlIHVzZWQgd2l0aCB0aGUgYGNoaWxkcmVuYCBvcHRpb24gYW5kL29yIGFkZGluZyBjaGlsZHJlbiBtYW51YWxseSAoYWRkQ2hpbGQsIGV0Yy4pXG4gIC8vIE5PVEU6IFRoaXMgc2hvdWxkIE5PVCBiZSB1c2VkIHdpdGggYXV0b0NvbHVtbnMgb3Igcm93cy9jb2x1bW5zLCBhcyB0aG9zZSBhbHNvIHNwZWNpZnkgY29vcmRpbmF0ZSBpbmZvcm1hdGlvblxuICAvLyBOT1RFOiBUaGlzIHdpbGwgb25seSBsYXkgb3V0IGNoaWxkcmVuIHdpdGggdmFsaWQgYm91bmRzLCBhbmQgaWYgZXhjbHVkZUludmlzaWJsZUNoaWxkcmVuRnJvbUJvdW5kcyBpcyB0cnVlIHRoZW4gaXRcbiAgLy8gd2lsbCBBTFNPIGJlIGNvbnN0cmFpbmVkIHRvIG9ubHkgdmlzaWJsZSBjaGlsZHJlbi4gSXQgd29uJ3QgbGVhdmUgZ2FwcyBmb3IgY2hpbGRyZW4gdGhhdCBkb24ndCBtZWV0IHRoZXNlXG4gIC8vIGNvbnN0cmFpbnRzLlxuICBhdXRvUm93cz86IG51bWJlciB8IG51bGw7XG5cbiAgLy8gV2hlbiBub24tbnVsbCwgdGhlIGNlbGxzIG9mIHRoaXMgZ3JpZCB3aWxsIGJlIHBvc2l0aW9uZWQvc2l6ZWQgdG8gYmUgMXgxIGNlbGxzLCBmaWxsaW5nIGNvbHVtbnMgdW50aWwgYSByb3cgaGFzXG4gIC8vIGBhdXRvQ29sdW1uc2AgbnVtYmVyIG9mIGNvbHVtbnMsIHRoZW4gaXQgd2lsbCBnbyB0byB0aGUgbmV4dCByb3cuIFRoaXMgc2hvdWxkIGdlbmVyYWxseSBiZSB1c2VkIHdpdGggYGNoaWxkcmVuYCBvclxuICAvLyBhZGRpbmcvcmVtb3ZpbmcgY2hpbGRyZW4gaW4gbm9ybWFsIHdheXMuXG4gIC8vIE5PVEU6IFRoaXMgc2hvdWxkIGJlIHVzZWQgd2l0aCB0aGUgYGNoaWxkcmVuYCBvcHRpb24gYW5kL29yIGFkZGluZyBjaGlsZHJlbiBtYW51YWxseSAoYWRkQ2hpbGQsIGV0Yy4pXG4gIC8vIE5PVEU6IFRoaXMgc2hvdWxkIE5PVCBiZSB1c2VkIHdpdGggYXV0b1Jvd3Mgb3Igcm93cy9jb2x1bW5zLCBhcyB0aG9zZSBhbHNvIHNwZWNpZnkgY29vcmRpbmF0ZSBpbmZvcm1hdGlvblxuICAvLyBOT1RFOiBUaGlzIHdpbGwgb25seSBsYXkgb3V0IGNoaWxkcmVuIHdpdGggdmFsaWQgYm91bmRzLCBhbmQgaWYgZXhjbHVkZUludmlzaWJsZUNoaWxkcmVuRnJvbUJvdW5kcyBpcyB0cnVlIHRoZW4gaXRcbiAgLy8gd2lsbCBBTFNPIGJlIGNvbnN0cmFpbmVkIHRvIG9ubHkgdmlzaWJsZSBjaGlsZHJlbi4gSXQgd29uJ3QgbGVhdmUgZ2FwcyBmb3IgY2hpbGRyZW4gdGhhdCBkb24ndCBtZWV0IHRoZXNlXG4gIC8vIGNvbnN0cmFpbnRzLlxuICBhdXRvQ29sdW1ucz86IG51bWJlciB8IG51bGw7XG59ICYgU3RyaWN0T21pdDxHcmlkQ29uc3RyYWludE9wdGlvbnMsIEdyaWRDb25zdHJhaW50RXhjbHVkZWRPcHRpb25zPjtcblxuZXhwb3J0IHR5cGUgR3JpZEJveE9wdGlvbnMgPSBTZWxmT3B0aW9ucyAmIExheW91dE5vZGVPcHRpb25zO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBHcmlkQm94IGV4dGVuZHMgTGF5b3V0Tm9kZTxHcmlkQ29uc3RyYWludD4ge1xuXG4gIHByaXZhdGUgcmVhZG9ubHkgX2NlbGxNYXA6IE1hcDxOb2RlLCBHcmlkQ2VsbD4gPSBuZXcgTWFwPE5vZGUsIEdyaWRDZWxsPigpO1xuXG4gIC8vIEZvciBoYW5kbGluZyBhdXRvLXdyYXBwaW5nIGZlYXR1cmVzXG4gIHByaXZhdGUgX2F1dG9Sb3dzOiBudW1iZXIgfCBudWxsID0gbnVsbDtcbiAgcHJpdmF0ZSBfYXV0b0NvbHVtbnM6IG51bWJlciB8IG51bGwgPSBudWxsO1xuXG4gIC8vIFNvIHdlIGRvbid0IGtpbGwgcGVyZm9ybWFuY2Ugd2hpbGUgc2V0dGluZyBjaGlsZHJlbiB3aXRoIGF1dG9Sb3dzL2F1dG9Db2x1bW5zXG4gIHByaXZhdGUgX2F1dG9Mb2NrQ291bnQgPSAwO1xuXG4gIC8vIExpc3RlbmVycyB0aGF0IHdlJ2xsIG5lZWQgdG8gcmVtb3ZlXG4gIHByaXZhdGUgcmVhZG9ubHkgb25DaGlsZEluc2VydGVkOiAoIG5vZGU6IE5vZGUsIGluZGV4OiBudW1iZXIgKSA9PiB2b2lkO1xuICBwcml2YXRlIHJlYWRvbmx5IG9uQ2hpbGRSZW1vdmVkOiAoIG5vZGU6IE5vZGUgKSA9PiB2b2lkO1xuICBwcml2YXRlIHJlYWRvbmx5IG9uQ2hpbGRWaXNpYmlsaXR5VG9nZ2xlZDogKCkgPT4gdm9pZDtcblxuICBwdWJsaWMgY29uc3RydWN0b3IoIHByb3ZpZGVkT3B0aW9ucz86IEdyaWRCb3hPcHRpb25zICkge1xuICAgIGNvbnN0IG9wdGlvbnMgPSBvcHRpb25pemU8R3JpZEJveE9wdGlvbnMsIFN0cmljdE9taXQ8U2VsZk9wdGlvbnMsIEV4Y2x1ZGU8a2V5b2YgR3JpZENvbnN0cmFpbnRPcHRpb25zLCBHcmlkQ29uc3RyYWludEV4Y2x1ZGVkT3B0aW9ucz4gfCAncm93cycgfCAnY29sdW1ucycgfCAnYXV0b1Jvd3MnIHwgJ2F1dG9Db2x1bW5zJz4sXG4gICAgICBMYXlvdXROb2RlT3B0aW9ucz4oKSgge1xuICAgICAgLy8gQWxsb3cgZHluYW1pYyBsYXlvdXQgYnkgZGVmYXVsdCwgc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9qb2lzdC9pc3N1ZXMvNjA4XG4gICAgICBleGNsdWRlSW52aXNpYmxlQ2hpbGRyZW5Gcm9tQm91bmRzOiB0cnVlLFxuXG4gICAgICByZXNpemU6IHRydWVcbiAgICB9LCBwcm92aWRlZE9wdGlvbnMgKTtcblxuICAgIHN1cGVyKCk7XG5cbiAgICB0aGlzLl9jb25zdHJhaW50ID0gbmV3IEdyaWRDb25zdHJhaW50KCB0aGlzLCB7XG4gICAgICBwcmVmZXJyZWRXaWR0aFByb3BlcnR5OiB0aGlzLmxvY2FsUHJlZmVycmVkV2lkdGhQcm9wZXJ0eSxcbiAgICAgIHByZWZlcnJlZEhlaWdodFByb3BlcnR5OiB0aGlzLmxvY2FsUHJlZmVycmVkSGVpZ2h0UHJvcGVydHksXG4gICAgICBtaW5pbXVtV2lkdGhQcm9wZXJ0eTogdGhpcy5sb2NhbE1pbmltdW1XaWR0aFByb3BlcnR5LFxuICAgICAgbWluaW11bUhlaWdodFByb3BlcnR5OiB0aGlzLmxvY2FsTWluaW11bUhlaWdodFByb3BlcnR5LFxuICAgICAgbGF5b3V0T3JpZ2luUHJvcGVydHk6IHRoaXMubGF5b3V0T3JpZ2luUHJvcGVydHksXG5cbiAgICAgIGV4Y2x1ZGVJbnZpc2libGU6IGZhbHNlIC8vIFNob3VsZCBiZSBoYW5kbGVkIGJ5IHRoZSBvcHRpb25zIG11dGF0ZSBiZWxvd1xuICAgIH0gKTtcblxuICAgIHRoaXMub25DaGlsZEluc2VydGVkID0gdGhpcy5vbkdyaWRCb3hDaGlsZEluc2VydGVkLmJpbmQoIHRoaXMgKTtcbiAgICB0aGlzLm9uQ2hpbGRSZW1vdmVkID0gdGhpcy5vbkdyaWRCb3hDaGlsZFJlbW92ZWQuYmluZCggdGhpcyApO1xuICAgIHRoaXMub25DaGlsZFZpc2liaWxpdHlUb2dnbGVkID0gdGhpcy51cGRhdGVBbGxBdXRvTGluZXMuYmluZCggdGhpcyApO1xuXG4gICAgdGhpcy5jaGlsZEluc2VydGVkRW1pdHRlci5hZGRMaXN0ZW5lciggdGhpcy5vbkNoaWxkSW5zZXJ0ZWQgKTtcbiAgICB0aGlzLmNoaWxkUmVtb3ZlZEVtaXR0ZXIuYWRkTGlzdGVuZXIoIHRoaXMub25DaGlsZFJlbW92ZWQgKTtcblxuICAgIGNvbnN0IG5vbkJvdW5kc09wdGlvbnMgPSBfLm9taXQoIG9wdGlvbnMsIFJFUVVJUkVTX0JPVU5EU19PUFRJT05fS0VZUyApIGFzIExheW91dE5vZGVPcHRpb25zO1xuICAgIGNvbnN0IGJvdW5kc09wdGlvbnMgPSBfLnBpY2soIG9wdGlvbnMsIFJFUVVJUkVTX0JPVU5EU19PUFRJT05fS0VZUyApIGFzIExheW91dE5vZGVPcHRpb25zO1xuXG4gICAgLy8gQmVmb3JlIHdlIGxheW91dCwgZG8gbm9uLWJvdW5kcy1yZWxhdGVkIGNoYW5nZXMgKGluIGNhc2Ugd2UgaGF2ZSByZXNpemU6ZmFsc2UpLCBhbmQgcHJldmVudCBsYXlvdXQgZm9yXG4gICAgLy8gcGVyZm9ybWFuY2UgZ2FpbnMuXG4gICAgdGhpcy5fY29uc3RyYWludC5sb2NrKCk7XG4gICAgdGhpcy5tdXRhdGUoIG5vbkJvdW5kc09wdGlvbnMgKTtcbiAgICB0aGlzLl9jb25zdHJhaW50LnVubG9jaygpO1xuXG4gICAgLy8gVXBkYXRlIHRoZSBsYXlvdXQgKHNvIHRoYXQgaXQgaXMgZG9uZSBvbmNlIGlmIHdlIGhhdmUgcmVzaXplOmZhbHNlKVxuICAgIHRoaXMuX2NvbnN0cmFpbnQudXBkYXRlTGF5b3V0KCk7XG5cbiAgICAvLyBBZnRlciB3ZSBoYXZlIG91ciBsb2NhbEJvdW5kcyBjb21wbGV0ZSwgbm93IHdlIGNhbiBtdXRhdGUgdGhpbmdzIHRoYXQgcmVseSBvbiBpdC5cbiAgICB0aGlzLm11dGF0ZSggYm91bmRzT3B0aW9ucyApO1xuXG4gICAgdGhpcy5saW5rTGF5b3V0Qm91bmRzKCk7XG4gIH1cblxuICAvKipcbiAgICogU2V0cyB0aGUgY2hpbGRyZW4gb2YgdGhlIEdyaWRCb3ggYW5kIGFkanVzdHMgdGhlbSB0byBiZSBwb3NpdGlvbmVkIGluIGNlcnRhaW4gY2VsbHMuIEl0IHRha2VzIGEgMi1kaW1lbnNpb25hbCBhcnJheVxuICAgKiBvZiBOb2RlfG51bGwgKHdoZXJlIG51bGwgaXMgYSBwbGFjZWhvbGRlciB0aGF0IGRvZXMgbm90aGluZykuXG4gICAqXG4gICAqIEZvciBlYWNoIGNlbGwsIHRoZSBmaXJzdCBpbmRleCBpbnRvIHRoZSBhcnJheSB3aWxsIGJlIHRha2VuIGFzIHRoZSBjZWxsIHBvc2l0aW9uIGluIHRoZSBwcm92aWRlZCBvcmllbnRhdGlvbi4gVGhlXG4gICAqIHNlY29uZCBpbmRleCBpbnRvIHRoZSBhcnJheSB3aWxsIGJlIHRha2VuIGFzIHRoZSBjZWxsIHBvc2l0aW9uIGluIHRoZSBPUFBPU0lURSBvcmllbnRhdGlvbi5cbiAgICpcbiAgICogU2VlIEdyaWRCb3gucm93cyBvciBHcmlkQm94LmNvbHVtbnMgZm9yIHVzYWdlcyBhbmQgbW9yZSBkb2N1bWVudGF0aW9uLlxuICAgKi9cbiAgcHVibGljIHNldExpbmVzKCBvcmllbnRhdGlvbjogT3JpZW50YXRpb24sIGxpbmVBcnJheXM6IExpbmVBcnJheXMgKTogdm9pZCB7XG4gICAgY29uc3QgY2hpbGRyZW46IE5vZGVbXSA9IFtdO1xuXG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgbGluZUFycmF5cy5sZW5ndGg7IGkrKyApIHtcbiAgICAgIGNvbnN0IGxpbmVBcnJheSA9IGxpbmVBcnJheXNbIGkgXTtcbiAgICAgIGZvciAoIGxldCBqID0gMDsgaiA8IGxpbmVBcnJheS5sZW5ndGg7IGorKyApIHtcbiAgICAgICAgY29uc3QgaXRlbSA9IGxpbmVBcnJheVsgaiBdO1xuICAgICAgICBpZiAoIGl0ZW0gIT09IG51bGwgKSB7XG4gICAgICAgICAgY2hpbGRyZW4ucHVzaCggaXRlbSApO1xuICAgICAgICAgIGl0ZW0ubXV0YXRlTGF5b3V0T3B0aW9ucygge1xuICAgICAgICAgICAgWyBvcmllbnRhdGlvbi5saW5lIF06IGksXG4gICAgICAgICAgICBbIG9yaWVudGF0aW9uLm9wcG9zaXRlLmxpbmUgXTogalxuICAgICAgICAgIH0gKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIHRoaXMuY2hpbGRyZW4gPSBjaGlsZHJlbjtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBjaGlsZHJlbiBvZiB0aGUgR3JpZEJveCBpbiBhIDItZGltZW5zaW9uYWwgYXJyYXkgb2YgTm9kZXxudWxsICh3aGVyZSBudWxsIGlzIGEgcGxhY2Vob2xkZXIgdGhhdCBkb2VzXG4gICAqIG5vdGhpbmcpLlxuICAgKlxuICAgKiBGb3IgZWFjaCBjZWxsLCB0aGUgZmlyc3QgaW5kZXggaW50byB0aGUgYXJyYXkgd2lsbCBiZSB0YWtlbiBhcyB0aGUgY2VsbCBwb3NpdGlvbiBpbiB0aGUgcHJvdmlkZWQgb3JpZW50YXRpb24uIFRoZVxuICAgKiBzZWNvbmQgaW5kZXggaW50byB0aGUgYXJyYXkgd2lsbCBiZSB0YWtlbiBhcyB0aGUgY2VsbCBwb3NpdGlvbiBpbiB0aGUgT1BQT1NJVEUgb3JpZW50YXRpb24uXG4gICAqXG4gICAqIFNlZSBHcmlkQm94LnJvd3Mgb3IgR3JpZEJveC5jb2x1bW5zIGZvciB1c2FnZXNcbiAgICovXG4gIHB1YmxpYyBnZXRMaW5lcyggb3JpZW50YXRpb246IE9yaWVudGF0aW9uICk6IExpbmVBcnJheXMge1xuICAgIGNvbnN0IGxpbmVBcnJheXM6IExpbmVBcnJheXMgPSBbXTtcblxuICAgIGZvciAoIGNvbnN0IGNlbGwgb2YgdGhpcy5fY2VsbE1hcC52YWx1ZXMoKSApIHtcbiAgICAgIGNvbnN0IGkgPSBjZWxsLnBvc2l0aW9uLmdldCggb3JpZW50YXRpb24gKTtcbiAgICAgIGNvbnN0IGogPSBjZWxsLnBvc2l0aW9uLmdldCggb3JpZW50YXRpb24ub3Bwb3NpdGUgKTtcblxuICAgICAgLy8gRW5zdXJlIHdlIGhhdmUgZW5vdWdoIGxpbmVzXG4gICAgICB3aGlsZSAoIGxpbmVBcnJheXMubGVuZ3RoIDwgaSArIDEgKSB7XG4gICAgICAgIGxpbmVBcnJheXMucHVzaCggW10gKTtcbiAgICAgIH1cblxuICAgICAgLy8gbnVsbC1wYWQgbGluZXNcbiAgICAgIHdoaWxlICggbGluZUFycmF5c1sgaSBdLmxlbmd0aCA8IGogKyAxICkge1xuICAgICAgICBsaW5lQXJyYXlzWyBpIF0ucHVzaCggbnVsbCApO1xuICAgICAgfVxuXG4gICAgICAvLyBGaW5hbGx5IHRoZSBhY3R1YWwgbm9kZSFcbiAgICAgIGxpbmVBcnJheXNbIGkgXVsgaiBdID0gY2VsbC5ub2RlO1xuICAgIH1cblxuICAgIHJldHVybiBsaW5lQXJyYXlzO1xuICB9XG5cbiAgLyoqXG4gICAqIFNldHMgdGhlIGNoaWxkcmVuIG9mIHRoZSBHcmlkQm94IGJ5IHNwZWNpZnlpbmcgYSB0d28tZGltZW5zaW9uYWwgYXJyYXkgb2YgTm9kZXMgKG9yIG51bGwgdmFsdWVzIGFzIHNwYWNlcnMpLlxuICAgKiBUaGUgaW5uZXIgYXJyYXlzIHdpbGwgYmUgdGhlIHJvd3Mgb2YgdGhlIGdyaWQuXG4gICAqIE11dGF0ZXMgbGF5b3V0T3B0aW9ucyBvZiB0aGUgcHJvdmlkZWQgTm9kZXMuIFNlZSBzZXRMaW5lcygpIGZvciBtb3JlIGRvY3VtZW50YXRpb24uXG4gICAqL1xuICBwdWJsaWMgc2V0IHJvd3MoIGxpbmVBcnJheXM6IExpbmVBcnJheXMgKSB7XG4gICAgdGhpcy5zZXRMaW5lcyggT3JpZW50YXRpb24uVkVSVElDQUwsIGxpbmVBcnJheXMgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGEgdHdvLWRpbWVuc2lvbmFsIGFycmF5IG9mIHRoZSBjaGlsZCBOb2RlcyAod2l0aCBudWxsIGFzIGEgc3BhY2VyKSB3aGVyZSB0aGUgaW5uZXIgYXJyYXlzIGFyZSB0aGUgcm93cy5cbiAgICovXG4gIHB1YmxpYyBnZXQgcm93cygpOiBMaW5lQXJyYXlzIHtcbiAgICByZXR1cm4gdGhpcy5nZXRMaW5lcyggT3JpZW50YXRpb24uVkVSVElDQUwgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXRzIHRoZSBjaGlsZHJlbiBvZiB0aGUgR3JpZEJveCBieSBzcGVjaWZ5aW5nIGEgdHdvLWRpbWVuc2lvbmFsIGFycmF5IG9mIE5vZGVzIChvciBudWxsIHZhbHVlcyBhcyBzcGFjZXJzKS5cbiAgICogVGhlIGlubmVyIGFycmF5cyB3aWxsIGJlIHRoZSBjb2x1bW5zIG9mIHRoZSBncmlkLlxuICAgKiAqIE11dGF0ZXMgbGF5b3V0T3B0aW9ucyBvZiB0aGUgcHJvdmlkZWQgTm9kZXMuIFNlZSBzZXRMaW5lcygpIGZvciBtb3JlIGRvY3VtZW50YXRpb24uXG4gICAqL1xuICBwdWJsaWMgc2V0IGNvbHVtbnMoIGxpbmVBcnJheXM6IExpbmVBcnJheXMgKSB7XG4gICAgdGhpcy5zZXRMaW5lcyggT3JpZW50YXRpb24uSE9SSVpPTlRBTCwgbGluZUFycmF5cyApO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgYSB0d28tZGltZW5zaW9uYWwgYXJyYXkgb2YgdGhlIGNoaWxkIE5vZGVzICh3aXRoIG51bGwgYXMgYSBzcGFjZXIpIHdoZXJlIHRoZSBpbm5lciBhcnJheXMgYXJlIHRoZSBjb2x1bW5zLlxuICAgKi9cbiAgcHVibGljIGdldCBjb2x1bW5zKCk6IExpbmVBcnJheXMge1xuICAgIHJldHVybiB0aGlzLmdldExpbmVzKCBPcmllbnRhdGlvbi5IT1JJWk9OVEFMICk7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgTm9kZSBhdCBhIHNwZWNpZmljIHJvdy9jb2x1bW4gaW50ZXJzZWN0aW9uIChvciBudWxsIGlmIHRoZXJlIGFyZSBub25lKVxuICAgKi9cbiAgcHVibGljIGdldE5vZGVBdCggcm93OiBudW1iZXIsIGNvbHVtbjogbnVtYmVyICk6IE5vZGUgfCBudWxsIHtcbiAgICBjb25zdCBjZWxsID0gdGhpcy5jb25zdHJhaW50LmdldENlbGwoIHJvdywgY29sdW1uICk7XG5cbiAgICByZXR1cm4gY2VsbCA/IGNlbGwubm9kZSA6IG51bGw7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgcm93IGluZGV4IG9mIGEgY2hpbGQgTm9kZSAob3IgaWYgaXQgc3BhbnMgbXVsdGlwbGUgcm93cywgdGhlIGZpcnN0IHJvdylcbiAgICovXG4gIHB1YmxpYyBnZXRSb3dPZk5vZGUoIG5vZGU6IE5vZGUgKTogbnVtYmVyIHtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0aGlzLmNoaWxkcmVuLmluY2x1ZGVzKCBub2RlICkgKTtcblxuICAgIHJldHVybiB0aGlzLmNvbnN0cmFpbnQuZ2V0Q2VsbEZyb21Ob2RlKCBub2RlICkhLnBvc2l0aW9uLnZlcnRpY2FsO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIGNvbHVtbiBpbmRleCBvZiBhIGNoaWxkIE5vZGUgKG9yIGlmIGl0IHNwYW5zIG11bHRpcGxlIGNvbHVtbnMsIHRoZSBmaXJzdCByb3cpXG4gICAqL1xuICBwdWJsaWMgZ2V0Q29sdW1uT2ZOb2RlKCBub2RlOiBOb2RlICk6IG51bWJlciB7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdGhpcy5jaGlsZHJlbi5pbmNsdWRlcyggbm9kZSApICk7XG5cbiAgICByZXR1cm4gdGhpcy5jb25zdHJhaW50LmdldENlbGxGcm9tTm9kZSggbm9kZSApIS5wb3NpdGlvbi5ob3Jpem9udGFsO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgYWxsIHRoZSBOb2RlcyBpbiBhIGdpdmVuIHJvdyAoYnkgaW5kZXgpXG4gICAqL1xuICBwdWJsaWMgZ2V0Tm9kZXNJblJvdyggaW5kZXg6IG51bWJlciApOiBOb2RlW10ge1xuICAgIHJldHVybiB0aGlzLmNvbnN0cmFpbnQuZ2V0Q2VsbHMoIE9yaWVudGF0aW9uLlZFUlRJQ0FMLCBpbmRleCApLm1hcCggY2VsbCA9PiBjZWxsLm5vZGUgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGFsbCB0aGUgTm9kZXMgaW4gYSBnaXZlbiBjb2x1bW4gKGJ5IGluZGV4KVxuICAgKi9cbiAgcHVibGljIGdldE5vZGVzSW5Db2x1bW4oIGluZGV4OiBudW1iZXIgKTogTm9kZVtdIHtcbiAgICByZXR1cm4gdGhpcy5jb25zdHJhaW50LmdldENlbGxzKCBPcmllbnRhdGlvbi5IT1JJWk9OVEFMLCBpbmRleCApLm1hcCggY2VsbCA9PiBjZWxsLm5vZGUgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBZGRzIGFuIGFycmF5IG9mIGNoaWxkIE5vZGVzICh3aXRoIG51bGwgYWxsb3dlZCBhcyBlbXB0eSBzcGFjZXJzKSBhdCB0aGUgYm90dG9tIG9mIGFsbCBleGlzdGluZyByb3dzLlxuICAgKi9cbiAgcHVibGljIGFkZFJvdyggcm93OiBMaW5lQXJyYXkgKTogdGhpcyB7XG5cbiAgICB0aGlzLnJvd3MgPSBbIC4uLnRoaXMucm93cywgcm93IF07XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBBZGRzIGFuIGFycmF5IG9mIGNoaWxkIE5vZGVzICh3aXRoIG51bGwgYWxsb3dlZCBhcyBlbXB0eSBzcGFjZXJzKSBhdCB0aGUgcmlnaHQgb2YgYWxsIGV4aXN0aW5nIGNvbHVtbnMuXG4gICAqL1xuICBwdWJsaWMgYWRkQ29sdW1uKCBjb2x1bW46IExpbmVBcnJheSApOiB0aGlzIHtcblxuICAgIHRoaXMuY29sdW1ucyA9IFsgLi4udGhpcy5jb2x1bW5zLCBjb2x1bW4gXTtcblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIEluc2VydHMgYSByb3cgb2YgY2hpbGQgTm9kZXMgYXQgYSBnaXZlbiByb3cgaW5kZXggKHNlZSBhZGRSb3cgZm9yIG1vcmUgaW5mb3JtYXRpb24pXG4gICAqL1xuICBwdWJsaWMgaW5zZXJ0Um93KCBpbmRleDogbnVtYmVyLCByb3c6IExpbmVBcnJheSApOiB0aGlzIHtcblxuICAgIHRoaXMucm93cyA9IFsgLi4udGhpcy5yb3dzLnNsaWNlKCAwLCBpbmRleCApLCByb3csIC4uLnRoaXMucm93cy5zbGljZSggaW5kZXggKSBdO1xuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogSW5zZXJ0cyBhIGNvbHVtbiBvZiBjaGlsZCBOb2RlcyBhdCBhIGdpdmVuIGNvbHVtbiBpbmRleCAoc2VlIGFkZENvbHVtbiBmb3IgbW9yZSBpbmZvcm1hdGlvbilcbiAgICovXG4gIHB1YmxpYyBpbnNlcnRDb2x1bW4oIGluZGV4OiBudW1iZXIsIGNvbHVtbjogTGluZUFycmF5ICk6IHRoaXMge1xuXG4gICAgdGhpcy5jb2x1bW5zID0gWyAuLi50aGlzLmNvbHVtbnMuc2xpY2UoIDAsIGluZGV4ICksIGNvbHVtbiwgLi4udGhpcy5jb2x1bW5zLnNsaWNlKCBpbmRleCApIF07XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBSZW1vdmVzIGFsbCBjaGlsZCBOb2RlcyBpbiBhIGdpdmVuIHJvd1xuICAgKi9cbiAgcHVibGljIHJlbW92ZVJvdyggaW5kZXg6IG51bWJlciApOiB0aGlzIHtcblxuICAgIHRoaXMucm93cyA9IFsgLi4udGhpcy5yb3dzLnNsaWNlKCAwLCBpbmRleCApLCAuLi50aGlzLnJvd3Muc2xpY2UoIGluZGV4ICsgMSApIF07XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBSZW1vdmVzIGFsbCBjaGlsZCBOb2RlcyBpbiBhIGdpdmVuIGNvbHVtblxuICAgKi9cbiAgcHVibGljIHJlbW92ZUNvbHVtbiggaW5kZXg6IG51bWJlciApOiB0aGlzIHtcblxuICAgIHRoaXMuY29sdW1ucyA9IFsgLi4udGhpcy5jb2x1bW5zLnNsaWNlKCAwLCBpbmRleCApLCAuLi50aGlzLmNvbHVtbnMuc2xpY2UoIGluZGV4ICsgMSApIF07XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIHB1YmxpYyBzZXQgYXV0b1Jvd3MoIHZhbHVlOiBudW1iZXIgfCBudWxsICkge1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIHZhbHVlID09PSBudWxsIHx8ICggdHlwZW9mIHZhbHVlID09PSAnbnVtYmVyJyAmJiBpc0Zpbml0ZSggdmFsdWUgKSAmJiB2YWx1ZSA+PSAxICkgKTtcblxuICAgIGlmICggdGhpcy5fYXV0b1Jvd3MgIT09IHZhbHVlICkge1xuICAgICAgdGhpcy5fYXV0b1Jvd3MgPSB2YWx1ZTtcblxuICAgICAgdGhpcy51cGRhdGVBdXRvUm93cygpO1xuICAgIH1cbiAgfVxuXG4gIHB1YmxpYyBnZXQgYXV0b1Jvd3MoKTogbnVtYmVyIHwgbnVsbCB7XG4gICAgcmV0dXJuIHRoaXMuX2F1dG9Sb3dzO1xuICB9XG5cbiAgcHVibGljIHNldCBhdXRvQ29sdW1ucyggdmFsdWU6IG51bWJlciB8IG51bGwgKSB7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdmFsdWUgPT09IG51bGwgfHwgKCB0eXBlb2YgdmFsdWUgPT09ICdudW1iZXInICYmIGlzRmluaXRlKCB2YWx1ZSApICYmIHZhbHVlID49IDEgKSApO1xuXG4gICAgaWYgKCB0aGlzLl9hdXRvQ29sdW1ucyAhPT0gdmFsdWUgKSB7XG4gICAgICB0aGlzLl9hdXRvQ29sdW1ucyA9IHZhbHVlO1xuXG4gICAgICB0aGlzLnVwZGF0ZUF1dG9Db2x1bW5zKCk7XG4gICAgfVxuICB9XG5cbiAgcHVibGljIGdldCBhdXRvQ29sdW1ucygpOiBudW1iZXIgfCBudWxsIHtcbiAgICByZXR1cm4gdGhpcy5fYXV0b0NvbHVtbnM7XG4gIH1cblxuICAvLyBVc2VkIGZvciBhdXRvUm93cy9hdXRvQ29sdW1uc1xuICBwcml2YXRlIHVwZGF0ZUF1dG9MaW5lcyggb3JpZW50YXRpb246IE9yaWVudGF0aW9uLCB2YWx1ZTogbnVtYmVyIHwgbnVsbCApOiB2b2lkIHtcbiAgICBpZiAoIHZhbHVlICE9PSBudWxsICYmIHRoaXMuX2F1dG9Mb2NrQ291bnQgPT09IDAgKSB7XG4gICAgICBsZXQgdXBkYXRlZENvdW50ID0gMDtcblxuICAgICAgdGhpcy5jb25zdHJhaW50LmxvY2soKTtcblxuICAgICAgdGhpcy5jaGlsZHJlbi5maWx0ZXIoIGNoaWxkID0+IHtcbiAgICAgICAgcmV0dXJuIGNoaWxkLmJvdW5kcy5pc1ZhbGlkKCkgJiYgKCAhdGhpcy5fY29uc3RyYWludC5leGNsdWRlSW52aXNpYmxlIHx8IGNoaWxkLnZpc2libGUgKTtcbiAgICAgIH0gKS5mb3JFYWNoKCAoIGNoaWxkLCBpbmRleCApID0+IHtcbiAgICAgICAgY29uc3QgcHJpbWFyeSA9IGluZGV4ICUgdmFsdWU7XG4gICAgICAgIGNvbnN0IHNlY29uZGFyeSA9IE1hdGguZmxvb3IoIGluZGV4IC8gdmFsdWUgKTtcbiAgICAgICAgY29uc3Qgd2lkdGggPSAxO1xuICAgICAgICBjb25zdCBoZWlnaHQgPSAxO1xuXG4gICAgICAgIC8vIFdlIGd1YXJkIHRvIHNlZSBpZiB3ZSBhY3R1YWxseSBoYXZlIHRvIHVwZGF0ZSBhbnl0aGluZyAoc28gd2UgY2FuIGF2b2lkIHRyaWdnZXJpbmcgYW4gYXV0by1sYXlvdXQpXG4gICAgICAgIGlmICggIWNoaWxkLmxheW91dE9wdGlvbnMgfHxcbiAgICAgICAgICAgICBjaGlsZC5sYXlvdXRPcHRpb25zWyBvcmllbnRhdGlvbi5saW5lIF0gIT09IHByaW1hcnkgfHxcbiAgICAgICAgICAgICBjaGlsZC5sYXlvdXRPcHRpb25zWyBvcmllbnRhdGlvbi5vcHBvc2l0ZS5saW5lIF0gIT09IHNlY29uZGFyeSB8fFxuICAgICAgICAgICAgIGNoaWxkLmxheW91dE9wdGlvbnMuaG9yaXpvbnRhbFNwYW4gIT09IHdpZHRoIHx8XG4gICAgICAgICAgICAgY2hpbGQubGF5b3V0T3B0aW9ucy52ZXJ0aWNhbFNwYW4gIT09IGhlaWdodFxuICAgICAgICApIHtcbiAgICAgICAgICB1cGRhdGVkQ291bnQrKztcbiAgICAgICAgICBjaGlsZC5tdXRhdGVMYXlvdXRPcHRpb25zKCB7XG4gICAgICAgICAgICBbIG9yaWVudGF0aW9uLmxpbmUgXTogaW5kZXggJSB2YWx1ZSxcbiAgICAgICAgICAgIFsgb3JpZW50YXRpb24ub3Bwb3NpdGUubGluZSBdOiBNYXRoLmZsb29yKCBpbmRleCAvIHZhbHVlICksXG4gICAgICAgICAgICBob3Jpem9udGFsU3BhbjogMSxcbiAgICAgICAgICAgIHZlcnRpY2FsU3BhbjogMVxuICAgICAgICAgIH0gKTtcbiAgICAgICAgfVxuXG4gICAgICB9ICk7XG5cbiAgICAgIHRoaXMuY29uc3RyYWludC51bmxvY2soKTtcblxuICAgICAgLy8gT25seSB0cmlnZ2VyIGFuIGF1dG9tYXRpYyBsYXlvdXQgSUYgd2UgYWN0dWFsbHkgYWRqdXN0ZWQgc29tZXRoaW5nLlxuICAgICAgaWYgKCB1cGRhdGVkQ291bnQgPiAwICkge1xuICAgICAgICB0aGlzLmNvbnN0cmFpbnQudXBkYXRlTGF5b3V0QXV0b21hdGljYWxseSgpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgdXBkYXRlQXV0b1Jvd3MoKTogdm9pZCB7XG4gICAgdGhpcy51cGRhdGVBdXRvTGluZXMoIE9yaWVudGF0aW9uLlZFUlRJQ0FMLCB0aGlzLmF1dG9Sb3dzICk7XG4gIH1cblxuICBwcml2YXRlIHVwZGF0ZUF1dG9Db2x1bW5zKCk6IHZvaWQge1xuICAgIHRoaXMudXBkYXRlQXV0b0xpbmVzKCBPcmllbnRhdGlvbi5IT1JJWk9OVEFMLCB0aGlzLmF1dG9Db2x1bW5zICk7XG4gIH1cblxuICAvLyBVcGRhdGVzIHJvd3Mgb3IgY29sdW1ucywgd2hpY2hldmVyIGlzIGFjdGl2ZSBhdCB0aGUgbW9tZW50IChpZiBhbnkpXG4gIHByaXZhdGUgdXBkYXRlQWxsQXV0b0xpbmVzKCk6IHZvaWQge1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIHRoaXMuX2F1dG9Sb3dzID09PSBudWxsIHx8IHRoaXMuX2F1dG9Db2x1bW5zID09PSBudWxsLFxuICAgICAgJ2F1dG9Sb3dzIGFuZCBhdXRvQ29sdW1ucyBzaG91bGQgbm90IGJvdGggYmUgc2V0IHdoZW4gdXBkYXRpbmcgY2hpbGRyZW4nICk7XG5cbiAgICB0aGlzLnVwZGF0ZUF1dG9Sb3dzKCk7XG4gICAgdGhpcy51cGRhdGVBdXRvQ29sdW1ucygpO1xuICB9XG5cbiAgcHVibGljIG92ZXJyaWRlIHNldENoaWxkcmVuKCBjaGlsZHJlbjogTm9kZVtdICk6IHRoaXMge1xuXG4gICAgY29uc3Qgb2xkQ2hpbGRyZW4gPSB0aGlzLmdldENoaWxkcmVuKCk7IC8vIGRlZmVuc2l2ZSBjb3B5XG5cbiAgICAvLyBEb24ndCB1cGRhdGUgYXV0b1Jvd3MvYXV0b0NvbHVtbnMgc2V0dGluZ3Mgd2hpbGUgc2V0dGluZyBjaGlsZHJlbiwgd2FpdCB1bnRpbCBhZnRlciBmb3IgcGVyZm9ybWFuY2VcbiAgICB0aGlzLl9hdXRvTG9ja0NvdW50Kys7XG4gICAgc3VwZXIuc2V0Q2hpbGRyZW4oIGNoaWxkcmVuICk7XG4gICAgdGhpcy5fYXV0b0xvY2tDb3VudC0tO1xuXG4gICAgaWYgKCAhXy5pc0VxdWFsKCBvbGRDaGlsZHJlbiwgY2hpbGRyZW4gKSApIHtcbiAgICAgIHRoaXMudXBkYXRlQWxsQXV0b0xpbmVzKCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogQ2FsbGVkIHdoZW4gYSBjaGlsZCBpcyBpbnNlcnRlZC5cbiAgICovXG4gIHByaXZhdGUgb25HcmlkQm94Q2hpbGRJbnNlcnRlZCggbm9kZTogTm9kZSwgaW5kZXg6IG51bWJlciApOiB2b2lkIHtcbiAgICBub2RlLnZpc2libGVQcm9wZXJ0eS5sYXp5TGluayggdGhpcy5vbkNoaWxkVmlzaWJpbGl0eVRvZ2dsZWQgKTtcblxuICAgIGNvbnN0IGNlbGwgPSBuZXcgR3JpZENlbGwoIHRoaXMuX2NvbnN0cmFpbnQsIG5vZGUsIHRoaXMuX2NvbnN0cmFpbnQuY3JlYXRlTGF5b3V0UHJveHkoIG5vZGUgKSApO1xuICAgIHRoaXMuX2NlbGxNYXAuc2V0KCBub2RlLCBjZWxsICk7XG5cbiAgICB0aGlzLl9jb25zdHJhaW50LmFkZENlbGwoIGNlbGwgKTtcblxuICAgIHRoaXMudXBkYXRlQWxsQXV0b0xpbmVzKCk7XG4gIH1cblxuICAvKipcbiAgICogQ2FsbGVkIHdoZW4gYSBjaGlsZCBpcyByZW1vdmVkLlxuICAgKlxuICAgKiBOT1RFOiBUaGlzIGlzIE5PVCBjYWxsZWQgb24gZGlzcG9zYWwuIEFueSBhZGRpdGlvbmFsIGNsZWFudXAgKHRvIHByZXZlbnQgbWVtb3J5IGxlYWtzKSBzaG91bGQgYmUgaW5jbHVkZWQgaW4gdGhlXG4gICAqIGRpc3Bvc2UoKSBmdW5jdGlvblxuICAgKi9cbiAgcHJpdmF0ZSBvbkdyaWRCb3hDaGlsZFJlbW92ZWQoIG5vZGU6IE5vZGUgKTogdm9pZCB7XG5cbiAgICBjb25zdCBjZWxsID0gdGhpcy5fY2VsbE1hcC5nZXQoIG5vZGUgKSE7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggY2VsbCApO1xuXG4gICAgdGhpcy5fY2VsbE1hcC5kZWxldGUoIG5vZGUgKTtcblxuICAgIHRoaXMuX2NvbnN0cmFpbnQucmVtb3ZlQ2VsbCggY2VsbCApO1xuXG4gICAgY2VsbC5kaXNwb3NlKCk7XG5cbiAgICB0aGlzLnVwZGF0ZUFsbEF1dG9MaW5lcygpO1xuXG4gICAgbm9kZS52aXNpYmxlUHJvcGVydHkudW5saW5rKCB0aGlzLm9uQ2hpbGRWaXNpYmlsaXR5VG9nZ2xlZCApO1xuICB9XG5cbiAgcHVibGljIG92ZXJyaWRlIG11dGF0ZSggb3B0aW9ucz86IEdyaWRCb3hPcHRpb25zICk6IHRoaXMge1xuICAgIC8vIGNoaWxkcmVuIGNhbiBiZSB1c2VkIHdpdGggb25lIG9mIGF1dG9Sb3dzL2F1dG9Db2x1bW5zLCBidXQgb3RoZXJ3aXNlIHRoZXNlIG9wdGlvbnMgYXJlIGV4Y2x1c2l2ZVxuICAgIGFzc2VydE11dHVhbGx5RXhjbHVzaXZlT3B0aW9ucyggb3B0aW9ucywgWyAncm93cycgXSwgWyAnY29sdW1ucycgXSwgWyAnY2hpbGRyZW4nLCAnYXV0b1Jvd3MnLCAnYXV0b0NvbHVtbnMnIF0gKTtcbiAgICBpZiAoIG9wdGlvbnMgKSB7XG4gICAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0eXBlb2Ygb3B0aW9ucy5hdXRvUm93cyAhPT0gJ251bWJlcicgfHwgdHlwZW9mIG9wdGlvbnMuYXV0b0NvbHVtbnMgIT09ICdudW1iZXInLFxuICAgICAgICAnYXV0b1Jvd3MgYW5kIGF1dG9Db2x1bW5zIHNob3VsZCBub3QgYmUgc3BlY2lmaWVkIGJvdGggYXMgbm9uLW51bGwgYXQgdGhlIHNhbWUgdGltZScgKTtcbiAgICB9XG5cbiAgICByZXR1cm4gc3VwZXIubXV0YXRlKCBvcHRpb25zICk7XG4gIH1cblxuICBwdWJsaWMgZ2V0IHNwYWNpbmcoKTogbnVtYmVyIHwgbnVtYmVyW10ge1xuICAgIHJldHVybiB0aGlzLl9jb25zdHJhaW50LnNwYWNpbmc7XG4gIH1cblxuICBwdWJsaWMgc2V0IHNwYWNpbmcoIHZhbHVlOiBudW1iZXIgfCBudW1iZXJbXSApIHtcbiAgICB0aGlzLl9jb25zdHJhaW50LnNwYWNpbmcgPSB2YWx1ZTtcbiAgfVxuXG4gIHB1YmxpYyBnZXQgeFNwYWNpbmcoKTogbnVtYmVyIHwgbnVtYmVyW10ge1xuICAgIHJldHVybiB0aGlzLl9jb25zdHJhaW50LnhTcGFjaW5nO1xuICB9XG5cbiAgcHVibGljIHNldCB4U3BhY2luZyggdmFsdWU6IG51bWJlciB8IG51bWJlcltdICkge1xuICAgIHRoaXMuX2NvbnN0cmFpbnQueFNwYWNpbmcgPSB2YWx1ZTtcbiAgfVxuXG4gIHB1YmxpYyBnZXQgeVNwYWNpbmcoKTogbnVtYmVyIHwgbnVtYmVyW10ge1xuICAgIHJldHVybiB0aGlzLl9jb25zdHJhaW50LnlTcGFjaW5nO1xuICB9XG5cbiAgcHVibGljIHNldCB5U3BhY2luZyggdmFsdWU6IG51bWJlciB8IG51bWJlcltdICkge1xuICAgIHRoaXMuX2NvbnN0cmFpbnQueVNwYWNpbmcgPSB2YWx1ZTtcbiAgfVxuXG4gIHB1YmxpYyBnZXQgeEFsaWduKCk6IEhvcml6b250YWxMYXlvdXRBbGlnbiB7XG4gICAgcmV0dXJuIHRoaXMuX2NvbnN0cmFpbnQueEFsaWduITtcbiAgfVxuXG4gIHB1YmxpYyBzZXQgeEFsaWduKCB2YWx1ZTogSG9yaXpvbnRhbExheW91dEFsaWduICkge1xuICAgIHRoaXMuX2NvbnN0cmFpbnQueEFsaWduID0gdmFsdWU7XG4gIH1cblxuICBwdWJsaWMgZ2V0IHlBbGlnbigpOiBWZXJ0aWNhbExheW91dEFsaWduIHtcbiAgICByZXR1cm4gdGhpcy5fY29uc3RyYWludC55QWxpZ24hO1xuICB9XG5cbiAgcHVibGljIHNldCB5QWxpZ24oIHZhbHVlOiBWZXJ0aWNhbExheW91dEFsaWduICkge1xuICAgIHRoaXMuX2NvbnN0cmFpbnQueUFsaWduID0gdmFsdWU7XG4gIH1cblxuICBwdWJsaWMgZ2V0IGdyb3coKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5fY29uc3RyYWludC5ncm93ITtcbiAgfVxuXG4gIHB1YmxpYyBzZXQgZ3JvdyggdmFsdWU6IG51bWJlciApIHtcbiAgICB0aGlzLl9jb25zdHJhaW50Lmdyb3cgPSB2YWx1ZTtcbiAgfVxuXG4gIHB1YmxpYyBnZXQgeEdyb3coKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5fY29uc3RyYWludC54R3JvdyE7XG4gIH1cblxuICBwdWJsaWMgc2V0IHhHcm93KCB2YWx1ZTogbnVtYmVyICkge1xuICAgIHRoaXMuX2NvbnN0cmFpbnQueEdyb3cgPSB2YWx1ZTtcbiAgfVxuXG4gIHB1YmxpYyBnZXQgeUdyb3coKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5fY29uc3RyYWludC55R3JvdyE7XG4gIH1cblxuICBwdWJsaWMgc2V0IHlHcm93KCB2YWx1ZTogbnVtYmVyICkge1xuICAgIHRoaXMuX2NvbnN0cmFpbnQueUdyb3cgPSB2YWx1ZTtcbiAgfVxuXG4gIHB1YmxpYyBnZXQgc3RyZXRjaCgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5fY29uc3RyYWludC5zdHJldGNoITtcbiAgfVxuXG4gIHB1YmxpYyBzZXQgc3RyZXRjaCggdmFsdWU6IGJvb2xlYW4gKSB7XG4gICAgdGhpcy5fY29uc3RyYWludC5zdHJldGNoID0gdmFsdWU7XG4gIH1cblxuICBwdWJsaWMgZ2V0IHhTdHJldGNoKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLl9jb25zdHJhaW50LnhTdHJldGNoITtcbiAgfVxuXG4gIHB1YmxpYyBzZXQgeFN0cmV0Y2goIHZhbHVlOiBib29sZWFuICkge1xuICAgIHRoaXMuX2NvbnN0cmFpbnQueFN0cmV0Y2ggPSB2YWx1ZTtcbiAgfVxuXG4gIHB1YmxpYyBnZXQgeVN0cmV0Y2goKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuX2NvbnN0cmFpbnQueVN0cmV0Y2ghO1xuICB9XG5cbiAgcHVibGljIHNldCB5U3RyZXRjaCggdmFsdWU6IGJvb2xlYW4gKSB7XG4gICAgdGhpcy5fY29uc3RyYWludC55U3RyZXRjaCA9IHZhbHVlO1xuICB9XG5cbiAgcHVibGljIGdldCBtYXJnaW4oKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5fY29uc3RyYWludC5tYXJnaW4hO1xuICB9XG5cbiAgcHVibGljIHNldCBtYXJnaW4oIHZhbHVlOiBudW1iZXIgKSB7XG4gICAgdGhpcy5fY29uc3RyYWludC5tYXJnaW4gPSB2YWx1ZTtcbiAgfVxuXG4gIHB1YmxpYyBnZXQgeE1hcmdpbigpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLl9jb25zdHJhaW50LnhNYXJnaW4hO1xuICB9XG5cbiAgcHVibGljIHNldCB4TWFyZ2luKCB2YWx1ZTogbnVtYmVyICkge1xuICAgIHRoaXMuX2NvbnN0cmFpbnQueE1hcmdpbiA9IHZhbHVlO1xuICB9XG5cbiAgcHVibGljIGdldCB5TWFyZ2luKCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMuX2NvbnN0cmFpbnQueU1hcmdpbiE7XG4gIH1cblxuICBwdWJsaWMgc2V0IHlNYXJnaW4oIHZhbHVlOiBudW1iZXIgKSB7XG4gICAgdGhpcy5fY29uc3RyYWludC55TWFyZ2luID0gdmFsdWU7XG4gIH1cblxuICBwdWJsaWMgZ2V0IGxlZnRNYXJnaW4oKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5fY29uc3RyYWludC5sZWZ0TWFyZ2luITtcbiAgfVxuXG4gIHB1YmxpYyBzZXQgbGVmdE1hcmdpbiggdmFsdWU6IG51bWJlciApIHtcbiAgICB0aGlzLl9jb25zdHJhaW50LmxlZnRNYXJnaW4gPSB2YWx1ZTtcbiAgfVxuXG4gIHB1YmxpYyBnZXQgcmlnaHRNYXJnaW4oKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5fY29uc3RyYWludC5yaWdodE1hcmdpbiE7XG4gIH1cblxuICBwdWJsaWMgc2V0IHJpZ2h0TWFyZ2luKCB2YWx1ZTogbnVtYmVyICkge1xuICAgIHRoaXMuX2NvbnN0cmFpbnQucmlnaHRNYXJnaW4gPSB2YWx1ZTtcbiAgfVxuXG4gIHB1YmxpYyBnZXQgdG9wTWFyZ2luKCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMuX2NvbnN0cmFpbnQudG9wTWFyZ2luITtcbiAgfVxuXG4gIHB1YmxpYyBzZXQgdG9wTWFyZ2luKCB2YWx1ZTogbnVtYmVyICkge1xuICAgIHRoaXMuX2NvbnN0cmFpbnQudG9wTWFyZ2luID0gdmFsdWU7XG4gIH1cblxuICBwdWJsaWMgZ2V0IGJvdHRvbU1hcmdpbigpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLl9jb25zdHJhaW50LmJvdHRvbU1hcmdpbiE7XG4gIH1cblxuICBwdWJsaWMgc2V0IGJvdHRvbU1hcmdpbiggdmFsdWU6IG51bWJlciApIHtcbiAgICB0aGlzLl9jb25zdHJhaW50LmJvdHRvbU1hcmdpbiA9IHZhbHVlO1xuICB9XG5cbiAgcHVibGljIGdldCBtaW5Db250ZW50V2lkdGgoKTogbnVtYmVyIHwgbnVsbCB7XG4gICAgcmV0dXJuIHRoaXMuX2NvbnN0cmFpbnQubWluQ29udGVudFdpZHRoO1xuICB9XG5cbiAgcHVibGljIHNldCBtaW5Db250ZW50V2lkdGgoIHZhbHVlOiBudW1iZXIgfCBudWxsICkge1xuICAgIHRoaXMuX2NvbnN0cmFpbnQubWluQ29udGVudFdpZHRoID0gdmFsdWU7XG4gIH1cblxuICBwdWJsaWMgZ2V0IG1pbkNvbnRlbnRIZWlnaHQoKTogbnVtYmVyIHwgbnVsbCB7XG4gICAgcmV0dXJuIHRoaXMuX2NvbnN0cmFpbnQubWluQ29udGVudEhlaWdodDtcbiAgfVxuXG4gIHB1YmxpYyBzZXQgbWluQ29udGVudEhlaWdodCggdmFsdWU6IG51bWJlciB8IG51bGwgKSB7XG4gICAgdGhpcy5fY29uc3RyYWludC5taW5Db250ZW50SGVpZ2h0ID0gdmFsdWU7XG4gIH1cblxuICBwdWJsaWMgZ2V0IG1heENvbnRlbnRXaWR0aCgpOiBudW1iZXIgfCBudWxsIHtcbiAgICByZXR1cm4gdGhpcy5fY29uc3RyYWludC5tYXhDb250ZW50V2lkdGg7XG4gIH1cblxuICBwdWJsaWMgc2V0IG1heENvbnRlbnRXaWR0aCggdmFsdWU6IG51bWJlciB8IG51bGwgKSB7XG4gICAgdGhpcy5fY29uc3RyYWludC5tYXhDb250ZW50V2lkdGggPSB2YWx1ZTtcbiAgfVxuXG4gIHB1YmxpYyBnZXQgbWF4Q29udGVudEhlaWdodCgpOiBudW1iZXIgfCBudWxsIHtcbiAgICByZXR1cm4gdGhpcy5fY29uc3RyYWludC5tYXhDb250ZW50SGVpZ2h0O1xuICB9XG5cbiAgcHVibGljIHNldCBtYXhDb250ZW50SGVpZ2h0KCB2YWx1ZTogbnVtYmVyIHwgbnVsbCApIHtcbiAgICB0aGlzLl9jb25zdHJhaW50Lm1heENvbnRlbnRIZWlnaHQgPSB2YWx1ZTtcbiAgfVxuXG5cbiAgcHVibGljIG92ZXJyaWRlIHNldEV4Y2x1ZGVJbnZpc2libGVDaGlsZHJlbkZyb21Cb3VuZHMoIGV4Y2x1ZGVJbnZpc2libGVDaGlsZHJlbkZyb21Cb3VuZHM6IGJvb2xlYW4gKTogdm9pZCB7XG4gICAgc3VwZXIuc2V0RXhjbHVkZUludmlzaWJsZUNoaWxkcmVuRnJvbUJvdW5kcyggZXhjbHVkZUludmlzaWJsZUNoaWxkcmVuRnJvbUJvdW5kcyApO1xuXG4gICAgdGhpcy51cGRhdGVBbGxBdXRvTGluZXMoKTtcbiAgfVxuXG4gIHB1YmxpYyBvdmVycmlkZSBkaXNwb3NlKCk6IHZvaWQge1xuXG4gICAgLy8gTG9jayBvdXIgbGF5b3V0IGZvcmV2ZXJcbiAgICB0aGlzLl9jb25zdHJhaW50LmxvY2soKTtcblxuICAgIHRoaXMuY2hpbGRJbnNlcnRlZEVtaXR0ZXIucmVtb3ZlTGlzdGVuZXIoIHRoaXMub25DaGlsZEluc2VydGVkICk7XG4gICAgdGhpcy5jaGlsZFJlbW92ZWRFbWl0dGVyLnJlbW92ZUxpc3RlbmVyKCB0aGlzLm9uQ2hpbGRSZW1vdmVkICk7XG5cbiAgICAvLyBEaXNwb3NlIG91ciBjZWxscyBoZXJlLiBXZSB3b24ndCBiZSBnZXR0aW5nIHRoZSBjaGlsZHJlbi1yZW1vdmVkIGxpc3RlbmVycyBmaXJlZCAod2UgcmVtb3ZlZCB0aGVtIGFib3ZlKVxuICAgIGZvciAoIGNvbnN0IGNlbGwgb2YgdGhpcy5fY2VsbE1hcC52YWx1ZXMoKSApIHtcbiAgICAgIGNlbGwuZGlzcG9zZSgpO1xuXG4gICAgICBjZWxsLm5vZGUudmlzaWJsZVByb3BlcnR5LnVubGluayggdGhpcy5vbkNoaWxkVmlzaWJpbGl0eVRvZ2dsZWQgKTtcbiAgICB9XG5cbiAgICBzdXBlci5kaXNwb3NlKCk7XG4gIH1cblxuICBwdWJsaWMgZ2V0SGVscGVyTm9kZSgpOiBOb2RlIHtcbiAgICBjb25zdCBtYXJnaW5zTm9kZSA9IE1hcmdpbkxheW91dENlbGwuY3JlYXRlSGVscGVyTm9kZSggdGhpcy5jb25zdHJhaW50LmRpc3BsYXllZENlbGxzLCB0aGlzLmNvbnN0cmFpbnQubGF5b3V0Qm91bmRzUHJvcGVydHkudmFsdWUsIGNlbGwgPT4ge1xuICAgICAgbGV0IHN0ciA9ICcnO1xuXG4gICAgICBzdHIgKz0gYHJvdzogJHtjZWxsLnBvc2l0aW9uLnZlcnRpY2FsfVxcbmA7XG4gICAgICBzdHIgKz0gYGNvbHVtbjogJHtjZWxsLnBvc2l0aW9uLmhvcml6b250YWx9XFxuYDtcbiAgICAgIGlmICggY2VsbC5zaXplLmhvcml6b250YWwgPiAxICkge1xuICAgICAgICBzdHIgKz0gYGhvcml6b250YWxTcGFuOiAke2NlbGwuc2l6ZS5ob3Jpem9udGFsfVxcbmA7XG4gICAgICB9XG4gICAgICBpZiAoIGNlbGwuc2l6ZS52ZXJ0aWNhbCA+IDEgKSB7XG4gICAgICAgIHN0ciArPSBgdmVydGljYWxTcGFuOiAke2NlbGwuc2l6ZS52ZXJ0aWNhbH1cXG5gO1xuICAgICAgfVxuICAgICAgc3RyICs9IGB4QWxpZ246ICR7TGF5b3V0QWxpZ24uaW50ZXJuYWxUb0FsaWduKCBPcmllbnRhdGlvbi5IT1JJWk9OVEFMLCBjZWxsLmVmZmVjdGl2ZVhBbGlnbiApfVxcbmA7XG4gICAgICBzdHIgKz0gYHlBbGlnbjogJHtMYXlvdXRBbGlnbi5pbnRlcm5hbFRvQWxpZ24oIE9yaWVudGF0aW9uLlZFUlRJQ0FMLCBjZWxsLmVmZmVjdGl2ZVlBbGlnbiApfVxcbmA7XG4gICAgICBzdHIgKz0gYHhTdHJldGNoOiAke2NlbGwuZWZmZWN0aXZlWFN0cmV0Y2h9XFxuYDtcbiAgICAgIHN0ciArPSBgeVN0cmV0Y2g6ICR7Y2VsbC5lZmZlY3RpdmVZU3RyZXRjaH1cXG5gO1xuICAgICAgc3RyICs9IGB4R3JvdzogJHtjZWxsLmVmZmVjdGl2ZVhHcm93fVxcbmA7XG4gICAgICBzdHIgKz0gYHlHcm93OiAke2NlbGwuZWZmZWN0aXZlWUdyb3d9XFxuYDtcblxuICAgICAgcmV0dXJuIHN0cjtcbiAgICB9ICk7XG5cbiAgICByZXR1cm4gbWFyZ2luc05vZGU7XG4gIH1cbn1cblxuLyoqXG4gKiB7QXJyYXkuPHN0cmluZz59IC0gU3RyaW5nIGtleXMgZm9yIGFsbCBvZiB0aGUgYWxsb3dlZCBvcHRpb25zIHRoYXQgd2lsbCBiZSBzZXQgYnkgbm9kZS5tdXRhdGUoIG9wdGlvbnMgKSwgaW4gdGhlXG4gKiBvcmRlciB0aGV5IHdpbGwgYmUgZXZhbHVhdGVkIGluLlxuICpcbiAqIE5PVEU6IFNlZSBOb2RlJ3MgX211dGF0b3JLZXlzIGRvY3VtZW50YXRpb24gZm9yIG1vcmUgaW5mb3JtYXRpb24gb24gaG93IHRoaXMgb3BlcmF0ZXMsIGFuZCBwb3RlbnRpYWwgc3BlY2lhbFxuICogICAgICAgY2FzZXMgdGhhdCBtYXkgYXBwbHkuXG4gKi9cbkdyaWRCb3gucHJvdG90eXBlLl9tdXRhdG9yS2V5cyA9IFsgLi4uU0laQUJMRV9PUFRJT05fS0VZUywgLi4uR1JJREJPWF9PUFRJT05fS0VZUywgLi4uTm9kZS5wcm90b3R5cGUuX211dGF0b3JLZXlzIF07XG5cbnNjZW5lcnkucmVnaXN0ZXIoICdHcmlkQm94JywgR3JpZEJveCApOyJdLCJuYW1lcyI6WyJhc3NlcnRNdXR1YWxseUV4Y2x1c2l2ZU9wdGlvbnMiLCJvcHRpb25pemUiLCJPcmllbnRhdGlvbiIsIkdSSURfQ09OU1RSQUlOVF9PUFRJT05fS0VZUyIsIkdyaWRDZWxsIiwiR3JpZENvbnN0cmFpbnQiLCJMQVlPVVRfTk9ERV9PUFRJT05fS0VZUyIsIkxheW91dEFsaWduIiwiTGF5b3V0Tm9kZSIsIk1hcmdpbkxheW91dENlbGwiLCJOb2RlIiwiUkVRVUlSRVNfQk9VTkRTX09QVElPTl9LRVlTIiwic2NlbmVyeSIsIlNJWkFCTEVfT1BUSU9OX0tFWVMiLCJHUklEQk9YX09QVElPTl9LRVlTIiwiZmlsdGVyIiwia2V5IiwiR3JpZEJveCIsInNldExpbmVzIiwib3JpZW50YXRpb24iLCJsaW5lQXJyYXlzIiwiY2hpbGRyZW4iLCJpIiwibGVuZ3RoIiwibGluZUFycmF5IiwiaiIsIml0ZW0iLCJwdXNoIiwibXV0YXRlTGF5b3V0T3B0aW9ucyIsImxpbmUiLCJvcHBvc2l0ZSIsImdldExpbmVzIiwiY2VsbCIsIl9jZWxsTWFwIiwidmFsdWVzIiwicG9zaXRpb24iLCJnZXQiLCJub2RlIiwicm93cyIsIlZFUlRJQ0FMIiwiY29sdW1ucyIsIkhPUklaT05UQUwiLCJnZXROb2RlQXQiLCJyb3ciLCJjb2x1bW4iLCJjb25zdHJhaW50IiwiZ2V0Q2VsbCIsImdldFJvd09mTm9kZSIsImFzc2VydCIsImluY2x1ZGVzIiwiZ2V0Q2VsbEZyb21Ob2RlIiwidmVydGljYWwiLCJnZXRDb2x1bW5PZk5vZGUiLCJob3Jpem9udGFsIiwiZ2V0Tm9kZXNJblJvdyIsImluZGV4IiwiZ2V0Q2VsbHMiLCJtYXAiLCJnZXROb2Rlc0luQ29sdW1uIiwiYWRkUm93IiwiYWRkQ29sdW1uIiwiaW5zZXJ0Um93Iiwic2xpY2UiLCJpbnNlcnRDb2x1bW4iLCJyZW1vdmVSb3ciLCJyZW1vdmVDb2x1bW4iLCJhdXRvUm93cyIsInZhbHVlIiwiaXNGaW5pdGUiLCJfYXV0b1Jvd3MiLCJ1cGRhdGVBdXRvUm93cyIsImF1dG9Db2x1bW5zIiwiX2F1dG9Db2x1bW5zIiwidXBkYXRlQXV0b0NvbHVtbnMiLCJ1cGRhdGVBdXRvTGluZXMiLCJfYXV0b0xvY2tDb3VudCIsInVwZGF0ZWRDb3VudCIsImxvY2siLCJjaGlsZCIsImJvdW5kcyIsImlzVmFsaWQiLCJfY29uc3RyYWludCIsImV4Y2x1ZGVJbnZpc2libGUiLCJ2aXNpYmxlIiwiZm9yRWFjaCIsInByaW1hcnkiLCJzZWNvbmRhcnkiLCJNYXRoIiwiZmxvb3IiLCJ3aWR0aCIsImhlaWdodCIsImxheW91dE9wdGlvbnMiLCJob3Jpem9udGFsU3BhbiIsInZlcnRpY2FsU3BhbiIsInVubG9jayIsInVwZGF0ZUxheW91dEF1dG9tYXRpY2FsbHkiLCJ1cGRhdGVBbGxBdXRvTGluZXMiLCJzZXRDaGlsZHJlbiIsIm9sZENoaWxkcmVuIiwiZ2V0Q2hpbGRyZW4iLCJfIiwiaXNFcXVhbCIsIm9uR3JpZEJveENoaWxkSW5zZXJ0ZWQiLCJ2aXNpYmxlUHJvcGVydHkiLCJsYXp5TGluayIsIm9uQ2hpbGRWaXNpYmlsaXR5VG9nZ2xlZCIsImNyZWF0ZUxheW91dFByb3h5Iiwic2V0IiwiYWRkQ2VsbCIsIm9uR3JpZEJveENoaWxkUmVtb3ZlZCIsImRlbGV0ZSIsInJlbW92ZUNlbGwiLCJkaXNwb3NlIiwidW5saW5rIiwibXV0YXRlIiwib3B0aW9ucyIsInNwYWNpbmciLCJ4U3BhY2luZyIsInlTcGFjaW5nIiwieEFsaWduIiwieUFsaWduIiwiZ3JvdyIsInhHcm93IiwieUdyb3ciLCJzdHJldGNoIiwieFN0cmV0Y2giLCJ5U3RyZXRjaCIsIm1hcmdpbiIsInhNYXJnaW4iLCJ5TWFyZ2luIiwibGVmdE1hcmdpbiIsInJpZ2h0TWFyZ2luIiwidG9wTWFyZ2luIiwiYm90dG9tTWFyZ2luIiwibWluQ29udGVudFdpZHRoIiwibWluQ29udGVudEhlaWdodCIsIm1heENvbnRlbnRXaWR0aCIsIm1heENvbnRlbnRIZWlnaHQiLCJzZXRFeGNsdWRlSW52aXNpYmxlQ2hpbGRyZW5Gcm9tQm91bmRzIiwiZXhjbHVkZUludmlzaWJsZUNoaWxkcmVuRnJvbUJvdW5kcyIsImNoaWxkSW5zZXJ0ZWRFbWl0dGVyIiwicmVtb3ZlTGlzdGVuZXIiLCJvbkNoaWxkSW5zZXJ0ZWQiLCJjaGlsZFJlbW92ZWRFbWl0dGVyIiwib25DaGlsZFJlbW92ZWQiLCJnZXRIZWxwZXJOb2RlIiwibWFyZ2luc05vZGUiLCJjcmVhdGVIZWxwZXJOb2RlIiwiZGlzcGxheWVkQ2VsbHMiLCJsYXlvdXRCb3VuZHNQcm9wZXJ0eSIsInN0ciIsInNpemUiLCJpbnRlcm5hbFRvQWxpZ24iLCJlZmZlY3RpdmVYQWxpZ24iLCJlZmZlY3RpdmVZQWxpZ24iLCJlZmZlY3RpdmVYU3RyZXRjaCIsImVmZmVjdGl2ZVlTdHJldGNoIiwiZWZmZWN0aXZlWEdyb3ciLCJlZmZlY3RpdmVZR3JvdyIsInByb3ZpZGVkT3B0aW9ucyIsInJlc2l6ZSIsIk1hcCIsInByZWZlcnJlZFdpZHRoUHJvcGVydHkiLCJsb2NhbFByZWZlcnJlZFdpZHRoUHJvcGVydHkiLCJwcmVmZXJyZWRIZWlnaHRQcm9wZXJ0eSIsImxvY2FsUHJlZmVycmVkSGVpZ2h0UHJvcGVydHkiLCJtaW5pbXVtV2lkdGhQcm9wZXJ0eSIsImxvY2FsTWluaW11bVdpZHRoUHJvcGVydHkiLCJtaW5pbXVtSGVpZ2h0UHJvcGVydHkiLCJsb2NhbE1pbmltdW1IZWlnaHRQcm9wZXJ0eSIsImxheW91dE9yaWdpblByb3BlcnR5IiwiYmluZCIsImFkZExpc3RlbmVyIiwibm9uQm91bmRzT3B0aW9ucyIsIm9taXQiLCJib3VuZHNPcHRpb25zIiwicGljayIsInVwZGF0ZUxheW91dCIsImxpbmtMYXlvdXRCb3VuZHMiLCJwcm90b3R5cGUiLCJfbXV0YXRvcktleXMiLCJyZWdpc3RlciJdLCJtYXBwaW5ncyI6IkFBQUEsc0RBQXNEO0FBRXREOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7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