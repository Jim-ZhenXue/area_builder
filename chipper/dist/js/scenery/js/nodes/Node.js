// Copyright 2012-2024, University of Colorado Boulder
/**
 * A Node for the Scenery scene graph. Supports general directed acyclic graphics (DAGs).
 * Handles multiple layers with assorted types (Canvas 2D, SVG, DOM, WebGL, etc.).
 *
 * ## General description of Nodes
 *
 * In Scenery, the visual output is determined by a group of connected Nodes (generally known as a scene graph).
 * Each Node has a list of 'child' Nodes. When a Node is visually displayed, its child Nodes (children) will also be
 * displayed, along with their children, etc. There is typically one 'root' Node that is passed to the Scenery Display
 * whose descendants (Nodes that can be traced from the root by child relationships) will be displayed.
 *
 * For instance, say there are Nodes named A, B, C, D and E, who have the relationships:
 * - B is a child of A (thus A is a parent of B)
 * - C is a child of A (thus A is a parent of C)
 * - D is a child of C (thus C is a parent of D)
 * - E is a child of C (thus C is a parent of E)
 * where A would be the root Node. This can be visually represented as a scene graph, where a line connects a parent
 * Node to a child Node (where the parent is usually always at the top of the line, and the child is at the bottom):
 * For example:
 *
 *   A
 *  / \
 * B   C
 *    / \
 *   D   E
 *
 * Additionally, in this case:
 * - D is a 'descendant' of A (due to the C being a child of A, and D being a child of C)
 * - A is an 'ancestor' of D (due to the reverse)
 * - C's 'subtree' is C, D and E, which consists of C itself and all of its descendants.
 *
 * Note that Scenery allows some more complicated forms, where Nodes can have multiple parents, e.g.:
 *
 *   A
 *  / \
 * B   C
 *  \ /
 *   D
 *
 * In this case, D has two parents (B and C). Scenery disallows any Node from being its own ancestor or descendant,
 * so that loops are not possible. When a Node has two or more parents, it means that the Node's subtree will typically
 * be displayed twice on the screen. In the above case, D would appear both at B's position and C's position. Each
 * place a Node would be displayed is known as an 'instance'.
 *
 * Each Node has a 'transform' associated with it, which determines how its subtree (that Node and all of its
 * descendants) will be positioned. Transforms can contain:
 * - Translation, which moves the position the subtree is displayed
 * - Scale, which makes the displayed subtree larger or smaller
 * - Rotation, which displays the subtree at an angle
 * - or any combination of the above that uses an affine matrix (more advanced transforms with shear and combinations
 *   are possible).
 *
 * Say we have the following scene graph:
 *
 *   A
 *   |
 *   B
 *   |
 *   C
 *
 * where there are the following transforms:
 * - A has a 'translation' that moves the content 100 pixels to the right
 * - B has a 'scale' that doubles the size of the content
 * - C has a 'rotation' that rotates 180-degrees around the origin
 *
 * If C displays a square that fills the area with 0 <= x <= 10 and 0 <= y <= 10, we can determine the position on
 * the display by applying transforms starting at C and moving towards the root Node (in this case, A):
 * 1. We apply C's rotation to our square, so the filled area will now be -10 <= x <= 0 and -10 <= y <= 0
 * 2. We apply B's scale to our square, so now we have -20 <= x <= 0 and -20 <= y <= 0
 * 3. We apply A's translation to our square, moving it to 80 <= x <= 100 and -20 <= y <= 0
 *
 * Nodes also have a large number of properties that will affect how their entire subtree is rendered, such as
 * visibility, opacity, etc.
 *
 * ## Creating Nodes
 *
 * Generally, there are two types of Nodes:
 * - Nodes that don't display anything, but serve as a container for other Nodes (e.g. Node itself, HBox, VBox)
 * - Nodes that display content, but ALSO serve as a container (e.g. Circle, Image, Text)
 *
 * When a Node is created with the default Node constructor, e.g.:
 *   var node = new Node();
 * then that Node will not display anything by itself.
 *
 * Generally subtypes of Node are used for displaying things, such as Circle, e.g.:
 *   var circle = new Circle( 20 ); // radius of 20
 *
 * Almost all Nodes (with the exception of leaf-only Nodes like Spacer) can contain children.
 *
 * ## Connecting Nodes, and rendering order
 *
 * To make a 'childNode' become a 'parentNode', the typical way is to call addChild():
 *   parentNode.addChild( childNode );
 *
 * To remove this connection, you can call:
 *   parentNode.removeChild( childNode );
 *
 * Adding a child Node with addChild() puts it at the end of parentNode's list of child Nodes. This is important,
 * because the order of children affects what Nodes are drawn on the 'top' or 'bottom' visually. Nodes that are at the
 * end of the list of children are generally drawn on top.
 *
 * This is generally easiest to represent by notating scene graphs with children in order from left to right, thus:
 *
 *   A
 *  / \
 * B   C
 *    / \
 *   D   E
 *
 * would indicate that A's children are [B,C], so C's subtree is drawn ON TOP of B. The same is true of C's children
 * [D,E], so E is drawn on top of D. If a Node itself has content, it is drawn below that of its children (so C itself
 * would be below D and E).
 *
 * This means that for every scene graph, Nodes instances can be ordered from bottom to top. For the above example, the
 * order is:
 * 1. A (on the very bottom visually, may get covered up by other Nodes)
 * 2. B
 * 3. C
 * 4. D
 * 5. E (on the very top visually, may be covering other Nodes)
 *
 * ## Trails
 *
 * For examples where there are multiple parents for some Nodes (also referred to as DAG in some code, as it represents
 * a Directed Acyclic Graph), we need more information about the rendering order (as otherwise Nodes could appear
 * multiple places in the visual bottom-to-top order.
 *
 * A Trail is basically a list of Nodes, where every Node in the list is a child of its previous element, and a parent
 * of its next element. Thus for the scene graph:
 *
 *   A
 *  / \
 * B   C
 *  \ / \
 *   D   E
 *    \ /
 *     F
 *
 * there are actually three instances of F being displayed, with three trails:
 * - [A,B,D,F]
 * - [A,C,D,F]
 * - [A,C,E,F]
 * Note that the trails are essentially listing Nodes used in walking from the root (A) to the relevant Node (F) using
 * connections between parents and children.
 *
 * The trails above are in order from bottom to top (visually), due to the order of children. Thus since A's children
 * are [B,C] in that order, F with the trail [A,B,D,F] is displayed below [A,C,D,F], because C is after B.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ import BooleanProperty from '../../../axon/js/BooleanProperty.js';
import EnabledProperty from '../../../axon/js/EnabledProperty.js';
import Property from '../../../axon/js/Property.js';
import TinyEmitter from '../../../axon/js/TinyEmitter.js';
import TinyForwardingProperty from '../../../axon/js/TinyForwardingProperty.js';
import TinyProperty from '../../../axon/js/TinyProperty.js';
import TinyStaticProperty from '../../../axon/js/TinyStaticProperty.js';
import Bounds2 from '../../../dot/js/Bounds2.js';
import Matrix3 from '../../../dot/js/Matrix3.js';
import Transform3 from '../../../dot/js/Transform3.js';
import Utils from '../../../dot/js/Utils.js';
import Vector2 from '../../../dot/js/Vector2.js';
import { Shape } from '../../../kite/js/imports.js';
import arrayDifference from '../../../phet-core/js/arrayDifference.js';
import deprecationWarning from '../../../phet-core/js/deprecationWarning.js';
import optionize, { combineOptions, optionize3 } from '../../../phet-core/js/optionize.js';
import PhetioObject from '../../../tandem/js/PhetioObject.js';
import Tandem from '../../../tandem/js/Tandem.js';
import BooleanIO from '../../../tandem/js/types/BooleanIO.js';
import IOType from '../../../tandem/js/types/IOType.js';
import { ACCESSIBILITY_OPTION_KEYS, CanvasContextWrapper, Features, Filter, hotkeyManager, Image, isHeightSizable, isWidthSizable, Mouse, ParallelDOM, Picker, Renderer, RendererSummary, scenery, serializeConnectedNodes, Trail } from '../imports.js';
import SceneryQueryParameters from '../SceneryQueryParameters.js';
let globalIdCounter = 1;
const scratchBounds2 = Bounds2.NOTHING.copy(); // mutable {Bounds2} used temporarily in methods
const scratchBounds2Extra = Bounds2.NOTHING.copy(); // mutable {Bounds2} used temporarily in methods
const scratchMatrix3 = new Matrix3();
const ENABLED_PROPERTY_TANDEM_NAME = EnabledProperty.TANDEM_NAME;
const VISIBLE_PROPERTY_TANDEM_NAME = 'visibleProperty';
const INPUT_ENABLED_PROPERTY_TANDEM_NAME = 'inputEnabledProperty';
const PHET_IO_STATE_DEFAULT = false;
// Store the number of parents from the single Node instance that has the most parents in the whole runtime.
let maxParentCount = 0;
// Store the number of children from the single Node instance that has the most children in the whole runtime.
let maxChildCount = 0;
export const REQUIRES_BOUNDS_OPTION_KEYS = [
    'leftTop',
    'centerTop',
    'rightTop',
    'leftCenter',
    'center',
    'rightCenter',
    'leftBottom',
    'centerBottom',
    'rightBottom',
    'left',
    'right',
    'top',
    'bottom',
    'centerX',
    'centerY' // {number} - The y-center of this Node's bounds, see setCenterY() for more documentation
];
// Node options, in the order they are executed in the constructor/mutate()
const NODE_OPTION_KEYS = [
    'children',
    'cursor',
    'phetioVisiblePropertyInstrumented',
    'visibleProperty',
    'visible',
    'pickableProperty',
    'pickable',
    'phetioEnabledPropertyInstrumented',
    'enabledProperty',
    'enabled',
    'phetioInputEnabledPropertyInstrumented',
    'inputEnabledProperty',
    'inputEnabled',
    'inputListeners',
    'opacity',
    'disabledOpacity',
    'filters',
    'matrix',
    'translation',
    'x',
    'y',
    'rotation',
    'scale',
    'excludeInvisibleChildrenFromBounds',
    'interruptSubtreeOnInvisible',
    'layoutOptions',
    'localBounds',
    'maxWidth',
    'maxHeight',
    'renderer',
    'layerSplit',
    'usesOpacity',
    'cssTransform',
    'excludeInvisible',
    'webglScale',
    'preventFit',
    'mouseArea',
    'touchArea',
    'clipArea',
    'transformBounds',
    ...REQUIRES_BOUNDS_OPTION_KEYS
];
const DEFAULT_OPTIONS = {
    phetioVisiblePropertyInstrumented: true,
    visible: true,
    opacity: 1,
    disabledOpacity: 1,
    pickable: null,
    enabled: true,
    phetioEnabledPropertyInstrumented: false,
    inputEnabled: true,
    phetioInputEnabledPropertyInstrumented: false,
    clipArea: null,
    mouseArea: null,
    touchArea: null,
    cursor: null,
    transformBounds: false,
    maxWidth: null,
    maxHeight: null,
    renderer: null,
    usesOpacity: false,
    layerSplit: false,
    cssTransform: false,
    excludeInvisible: false,
    webglScale: null,
    preventFit: false
};
const DEFAULT_INTERNAL_RENDERER = DEFAULT_OPTIONS.renderer === null ? 0 : Renderer.fromName(DEFAULT_OPTIONS.renderer);
let Node = class Node extends ParallelDOM {
    /**
   * Inserts a child Node at a specific index.
   *
   * node.insertChild( 0, childNode ) will insert the child into the beginning of the children array (on the bottom
   * visually).
   *
   * node.insertChild( node.children.length, childNode ) is equivalent to node.addChild( childNode ), and appends it
   * to the end (top visually) of the children array. It is recommended to use node.addChild when possible.
   *
   * NOTE: overridden by Leaf for some subtypes
   *
   * @param index - Index where the inserted child Node will be after this operation.
   * @param node - The new child to insert.
   * @param [isComposite] - (scenery-internal) If true, the childrenChanged event will not be sent out.
   */ insertChild(index, node, isComposite) {
        var _window_phet_chipper, _window_phet, _window_phet_chipper1, _window_phet1;
        assert && assert(node !== null && node !== undefined, 'insertChild cannot insert a null/undefined child');
        assert && assert(!_.includes(this._children, node), 'Parent already contains child');
        assert && assert(node !== this, 'Cannot add self as a child');
        assert && assert(node._parents !== null, 'Tried to insert a disposed child node?');
        assert && assert(!node.isDisposed, 'Tried to insert a disposed Node');
        // needs to be early to prevent re-entrant children modifications
        this._picker.onInsertChild(node);
        this.changeBoundsEventCount(node._boundsEventCount > 0 ? 1 : 0);
        this._rendererSummary.summaryChange(RendererSummary.bitmaskAll, node._rendererSummary.bitmask);
        node._parents.push(this);
        if (assert && ((_window_phet = window.phet) == null ? void 0 : (_window_phet_chipper = _window_phet.chipper) == null ? void 0 : _window_phet_chipper.queryParameters) && isFinite(SceneryQueryParameters.parentLimit)) {
            const parentCount = node._parents.length;
            if (maxParentCount < parentCount) {
                maxParentCount = parentCount;
                console.log(`Max Node parents: ${maxParentCount}`);
                assert(maxParentCount <= SceneryQueryParameters.parentLimit, `parent count of ${maxParentCount} above ?parentLimit=${SceneryQueryParameters.parentLimit}`);
            }
        }
        this._children.splice(index, 0, node);
        if (assert && ((_window_phet1 = window.phet) == null ? void 0 : (_window_phet_chipper1 = _window_phet1.chipper) == null ? void 0 : _window_phet_chipper1.queryParameters) && isFinite(SceneryQueryParameters.childLimit)) {
            const childCount = this._children.length;
            if (maxChildCount < childCount) {
                maxChildCount = childCount;
                console.log(`Max Node children: ${maxChildCount}`);
                assert(maxChildCount <= SceneryQueryParameters.childLimit, `child count of ${maxChildCount} above ?childLimit=${SceneryQueryParameters.childLimit}`);
            }
        }
        // If this added subtree contains PDOM content, we need to notify any relevant displays
        if (!node._rendererSummary.hasNoPDOM()) {
            this.onPDOMAddChild(node);
        }
        node.invalidateBounds();
        // like calling this.invalidateBounds(), but we already marked all ancestors with dirty child bounds
        this._boundsDirty = true;
        this.childInsertedEmitter.emit(node, index);
        node.parentAddedEmitter.emit(this);
        !isComposite && this.childrenChangedEmitter.emit();
        if (assertSlow) {
            this._picker.audit();
        }
        return this; // allow chaining
    }
    /**
   * Appends a child Node to our list of children.
   *
   * The new child Node will be displayed in front (on top) of all of this node's other children.
   *
   * @param node
   * @param [isComposite] - (scenery-internal) If true, the childrenChanged event will not be sent out.
   */ addChild(node, isComposite) {
        this.insertChild(this._children.length, node, isComposite);
        return this; // allow chaining
    }
    /**
   * Removes a child Node from our list of children, see http://phetsims.github.io/scenery/doc/#node-removeChild
   * Will fail an assertion if the Node is not currently one of our children
   *
   * @param node
   * @param [isComposite] - (scenery-internal) If true, the childrenChanged event will not be sent out.
   */ removeChild(node, isComposite) {
        assert && assert(node && node instanceof Node, 'Need to call node.removeChild() with a Node.');
        assert && assert(this.hasChild(node), 'Attempted to removeChild with a node that was not a child.');
        const indexOfChild = _.indexOf(this._children, node);
        this.removeChildWithIndex(node, indexOfChild, isComposite);
        return this; // allow chaining
    }
    /**
   * Removes a child Node at a specific index (node.children[ index ]) from our list of children.
   * Will fail if the index is out of bounds.
   *
   * @param index
   * @param [isComposite] - (scenery-internal) If true, the childrenChanged event will not be sent out.
   */ removeChildAt(index, isComposite) {
        assert && assert(index >= 0);
        assert && assert(index < this._children.length);
        const node = this._children[index];
        this.removeChildWithIndex(node, index, isComposite);
        return this; // allow chaining
    }
    /**
   * Internal method for removing a Node (always has the Node and index).
   *
   * NOTE: overridden by Leaf for some subtypes
   *
   * @param node - The child node to remove from this Node (it's parent)
   * @param indexOfChild - Should satisfy this.children[ indexOfChild ] === node
   * @param [isComposite] - (scenery-internal) If true, the childrenChanged event will not be sent out.
   */ removeChildWithIndex(node, indexOfChild, isComposite) {
        assert && assert(node && node instanceof Node, 'Need to call node.removeChildWithIndex() with a Node.');
        assert && assert(this.hasChild(node), 'Attempted to removeChild with a node that was not a child.');
        assert && assert(this._children[indexOfChild] === node, 'Incorrect index for removeChildWithIndex');
        assert && assert(node._parents !== null, 'Tried to remove a disposed child node?');
        const indexOfParent = _.indexOf(node._parents, this);
        node._isGettingRemovedFromParent = true;
        // If this added subtree contains PDOM content, we need to notify any relevant displays
        // NOTE: Potentially removes bounds listeners here!
        if (!node._rendererSummary.hasNoPDOM()) {
            this.onPDOMRemoveChild(node);
        }
        // needs to be early to prevent re-entrant children modifications
        this._picker.onRemoveChild(node);
        this.changeBoundsEventCount(node._boundsEventCount > 0 ? -1 : 0);
        this._rendererSummary.summaryChange(node._rendererSummary.bitmask, RendererSummary.bitmaskAll);
        node._parents.splice(indexOfParent, 1);
        this._children.splice(indexOfChild, 1);
        node._isGettingRemovedFromParent = false; // It is "complete"
        this.invalidateBounds();
        this._childBoundsDirty = true; // force recomputation of child bounds after removing a child
        this.childRemovedEmitter.emit(node, indexOfChild);
        node.parentRemovedEmitter.emit(this);
        !isComposite && this.childrenChangedEmitter.emit();
        if (assertSlow) {
            this._picker.audit();
        }
    }
    /**
   * If a child is not at the given index, it is moved to the given index. This reorders the children of this Node so
   * that `this.children[ index ] === node`.
   *
   * @param node - The child Node to move in the order
   * @param index - The desired index (into the children array) of the child.
   */ moveChildToIndex(node, index) {
        assert && assert(this.hasChild(node), 'Attempted to moveChildToIndex with a node that was not a child.');
        assert && assert(index % 1 === 0 && index >= 0 && index < this._children.length, `Invalid index: ${index}`);
        const currentIndex = this.indexOfChild(node);
        if (this._children[index] !== node) {
            // Apply the actual children change
            this._children.splice(currentIndex, 1);
            this._children.splice(index, 0, node);
            if (!this._rendererSummary.hasNoPDOM()) {
                this.onPDOMReorderedChildren();
            }
            this.childrenReorderedEmitter.emit(Math.min(currentIndex, index), Math.max(currentIndex, index));
            this.childrenChangedEmitter.emit();
        }
        return this;
    }
    /**
   * Removes all children from this Node.
   */ removeAllChildren() {
        this.setChildren([]);
        return this; // allow chaining
    }
    /**
   * Sets the children of the Node to be equivalent to the passed-in array of Nodes.
   *
   * NOTE: Meant to be overridden in some cases
   */ setChildren(children) {
        // The implementation is split into basically three stages:
        // 1. Remove current children that are not in the new children array.
        // 2. Reorder children that exist both before/after the change.
        // 3. Insert in new children
        const beforeOnly = []; // Will hold all nodes that will be removed.
        const afterOnly = []; // Will hold all nodes that will be "new" children (added)
        const inBoth = []; // Child nodes that "stay". Will be ordered for the "after" case.
        let i;
        // Compute what things were added, removed, or stay.
        arrayDifference(children, this._children, afterOnly, beforeOnly, inBoth);
        // Remove any nodes that are not in the new children.
        for(i = beforeOnly.length - 1; i >= 0; i--){
            this.removeChild(beforeOnly[i], true);
        }
        assert && assert(this._children.length === inBoth.length, 'Removing children should not have triggered other children changes');
        // Handle the main reordering (of nodes that "stay")
        let minChangeIndex = -1; // What is the smallest index where this._children[ index ] !== inBoth[ index ]
        let maxChangeIndex = -1; // What is the largest index where this._children[ index ] !== inBoth[ index ]
        for(i = 0; i < inBoth.length; i++){
            const desired = inBoth[i];
            if (this._children[i] !== desired) {
                this._children[i] = desired;
                if (minChangeIndex === -1) {
                    minChangeIndex = i;
                }
                maxChangeIndex = i;
            }
        }
        // If our minChangeIndex is still -1, then none of those nodes that "stay" were reordered. It's important to check
        // for this case, so that `node.children = node.children` is effectively a no-op performance-wise.
        const hasReorderingChange = minChangeIndex !== -1;
        // Immediate consequences/updates from reordering
        if (hasReorderingChange) {
            if (!this._rendererSummary.hasNoPDOM()) {
                this.onPDOMReorderedChildren();
            }
            this.childrenReorderedEmitter.emit(minChangeIndex, maxChangeIndex);
        }
        // Add in "new" children.
        // Scan through the "ending" children indices, adding in things that were in the "afterOnly" part. This scan is
        // done through the children array instead of the afterOnly array (as determining the index in children would
        // then be quadratic in time, which would be unacceptable here). At this point, a forward scan should be
        // sufficient to insert in-place, and should move the least amount of nodes in the array.
        if (afterOnly.length) {
            let afterIndex = 0;
            let after = afterOnly[afterIndex];
            for(i = 0; i < children.length; i++){
                if (children[i] === after) {
                    this.insertChild(i, after, true);
                    after = afterOnly[++afterIndex];
                }
            }
        }
        // If we had any changes, send the generic "changed" event.
        if (beforeOnly.length !== 0 || afterOnly.length !== 0 || hasReorderingChange) {
            this.childrenChangedEmitter.emit();
        }
        // Sanity checks to make sure our resulting children array is correct.
        if (assert) {
            for(let j = 0; j < this._children.length; j++){
                assert(children[j] === this._children[j], 'Incorrect child after setChildren, possibly a reentrancy issue');
            }
        }
        // allow chaining
        return this;
    }
    /**
   * See setChildren() for more information
   */ set children(value) {
        this.setChildren(value);
    }
    /**
   * See getChildren() for more information
   */ get children() {
        return this.getChildren();
    }
    /**
   * Returns a defensive copy of the array of direct children of this node, ordered by what is in front (nodes at
   * the end of the array are in front of nodes at the start).
   *
   * Making changes to the returned result will not affect this node's children.
   */ getChildren() {
        return this._children.slice(0); // create a defensive copy
    }
    /**
   * Returns a count of children, without needing to make a defensive copy.
   */ getChildrenCount() {
        return this._children.length;
    }
    /**
   * Returns a defensive copy of our parents. This is an array of parent nodes that is returned in no particular
   * order (as order is not important here).
   *
   * NOTE: Modifying the returned array will not in any way modify this node's parents.
   */ getParents() {
        return this._parents.slice(0); // create a defensive copy
    }
    /**
   * See getParents() for more information
   */ get parents() {
        return this.getParents();
    }
    /**
   * Returns a single parent if it exists, otherwise null (no parents), or an assertion failure (multiple parents).
   */ getParent() {
        assert && assert(this._parents.length <= 1, 'Cannot call getParent on a node with multiple parents');
        return this._parents.length ? this._parents[0] : null;
    }
    /**
   * See getParent() for more information
   */ get parent() {
        return this.getParent();
    }
    /**
   * Gets the child at a specific index into the children array.
   */ getChildAt(index) {
        return this._children[index];
    }
    /**
   * Finds the index of a parent Node in the parents array.
   *
   * @param parent - Should be a parent of this node.
   * @returns - An index such that this.parents[ index ] === parent
   */ indexOfParent(parent) {
        return _.indexOf(this._parents, parent);
    }
    /**
   * Finds the index of a child Node in the children array.
   *
   * @param child - Should be a child of this node.
   * @returns - An index such that this.children[ index ] === child
   */ indexOfChild(child) {
        return _.indexOf(this._children, child);
    }
    /**
   * Moves this Node to the front (end) of all of its parents children array.
   */ moveToFront() {
        _.each(this.parents, (parent)=>parent.moveChildToFront(this));
        return this; // allow chaining
    }
    /**
   * Moves one of our children to the front (end) of our children array.
   *
   * @param child - Our child to move to the front.
   */ moveChildToFront(child) {
        return this.moveChildToIndex(child, this._children.length - 1);
    }
    /**
   * Move this node one index forward in each of its parents.  If the Node is already at the front, this is a no-op.
   */ moveForward() {
        this.parents.forEach((parent)=>parent.moveChildForward(this));
        return this; // chaining
    }
    /**
   * Moves the specified child forward by one index.  If the child is already at the front, this is a no-op.
   */ moveChildForward(child) {
        const index = this.indexOfChild(child);
        if (index < this.getChildrenCount() - 1) {
            this.moveChildToIndex(child, index + 1);
        }
        return this; // chaining
    }
    /**
   * Move this node one index backward in each of its parents.  If the Node is already at the back, this is a no-op.
   */ moveBackward() {
        this.parents.forEach((parent)=>parent.moveChildBackward(this));
        return this; // chaining
    }
    /**
   * Moves the specified child forward by one index.  If the child is already at the back, this is a no-op.
   */ moveChildBackward(child) {
        const index = this.indexOfChild(child);
        if (index > 0) {
            this.moveChildToIndex(child, index - 1);
        }
        return this; // chaining
    }
    /**
   * Moves this Node to the back (front) of all of its parents children array.
   */ moveToBack() {
        _.each(this.parents, (parent)=>parent.moveChildToBack(this));
        return this; // allow chaining
    }
    /**
   * Moves one of our children to the back (front) of our children array.
   *
   * @param child - Our child to move to the back.
   */ moveChildToBack(child) {
        return this.moveChildToIndex(child, 0);
    }
    /**
   * Replace a child in this node's children array with another node. If the old child had DOM focus and
   * the new child is focusable, the new child will receive focus after it is added.
   */ replaceChild(oldChild, newChild) {
        assert && assert(this.hasChild(oldChild), 'Attempted to replace a node that was not a child.');
        // information that needs to be restored
        const index = this.indexOfChild(oldChild);
        const oldChildFocused = oldChild.focused;
        this.removeChild(oldChild, true);
        this.insertChild(index, newChild, true);
        this.childrenChangedEmitter.emit();
        if (oldChildFocused && newChild.focusable) {
            newChild.focus();
        }
        return this; // allow chaining
    }
    /**
   * Removes this Node from all of its parents.
   */ detach() {
        _.each(this._parents.slice(0), (parent)=>parent.removeChild(this));
        return this; // allow chaining
    }
    /**
   * Update our event count, usually by 1 or -1. See documentation on _boundsEventCount in constructor.
   *
   * @param n - How to increment/decrement the bounds event listener count
   */ changeBoundsEventCount(n) {
        if (n !== 0) {
            const zeroBefore = this._boundsEventCount === 0;
            this._boundsEventCount += n;
            assert && assert(this._boundsEventCount >= 0, 'subtree bounds event count should be guaranteed to be >= 0');
            const zeroAfter = this._boundsEventCount === 0;
            if (zeroBefore !== zeroAfter) {
                // parents will only have their count
                const parentDelta = zeroBefore ? 1 : -1;
                const len = this._parents.length;
                for(let i = 0; i < len; i++){
                    this._parents[i].changeBoundsEventCount(parentDelta);
                }
            }
        }
    }
    /**
   * Ensures that the cached selfBounds of this Node is accurate. Returns true if any sort of dirty flag was set
   * before this was called.
   *
   * @returns - Was the self-bounds potentially updated?
   */ validateSelfBounds() {
        // validate bounds of ourself if necessary
        if (this._selfBoundsDirty) {
            const oldSelfBounds = scratchBounds2.set(this.selfBoundsProperty._value);
            // Rely on an overloadable method to accomplish computing our self bounds. This should update
            // this.selfBounds itself, returning whether it was actually changed. If it didn't change, we don't want to
            // send a 'selfBounds' event.
            const didSelfBoundsChange = this.updateSelfBounds();
            this._selfBoundsDirty = false;
            if (didSelfBoundsChange) {
                this.selfBoundsProperty.notifyListeners(oldSelfBounds);
            }
            return true;
        }
        return false;
    }
    /**
   * Ensures that cached bounds stored on this Node (and all children) are accurate. Returns true if any sort of dirty
   * flag was set before this was called.
   *
   * @returns - Was something potentially updated?
   */ validateBounds() {
        sceneryLog && sceneryLog.bounds && sceneryLog.bounds(`validateBounds #${this._id}`);
        sceneryLog && sceneryLog.bounds && sceneryLog.push();
        let i;
        const notificationThreshold = 1e-13;
        let wasDirtyBefore = this.validateSelfBounds();
        // We're going to directly mutate these instances
        const ourChildBounds = this.childBoundsProperty._value;
        const ourLocalBounds = this.localBoundsProperty._value;
        const ourSelfBounds = this.selfBoundsProperty._value;
        const ourBounds = this.boundsProperty._value;
        // validate bounds of children if necessary
        if (this._childBoundsDirty) {
            wasDirtyBefore = true;
            sceneryLog && sceneryLog.bounds && sceneryLog.bounds('childBounds dirty');
            // have each child validate their own bounds (potentially multiple times, until there are no changes)
            let changed = true;
            let count = 0;
            while(changed){
                changed = false;
                i = this._children.length;
                while(i--){
                    const child = this._children[i];
                    // Reentrancy might cause the child to be removed
                    if (child) {
                        changed = child.validateBounds() || changed;
                    }
                }
                assert && assert(count++ < 500, 'Infinite loop detected - children are changing bounds during validation');
            }
            // and recompute our childBounds
            const oldChildBounds = scratchBounds2.set(ourChildBounds); // store old value in a temporary Bounds2
            ourChildBounds.set(Bounds2.NOTHING); // initialize to a value that can be unioned with includeBounds()
            i = this._children.length;
            while(i--){
                const child = this._children[i];
                // Reentrancy might cause the child to be removed
                if (child && !this._excludeInvisibleChildrenFromBounds || child.isVisible()) {
                    ourChildBounds.includeBounds(child.bounds);
                }
            }
            // run this before firing the event
            this._childBoundsDirty = false;
            sceneryLog && sceneryLog.bounds && sceneryLog.bounds(`childBounds: ${ourChildBounds}`);
            if (!ourChildBounds.equals(oldChildBounds)) {
                // notifies only on an actual change
                if (!ourChildBounds.equalsEpsilon(oldChildBounds, notificationThreshold)) {
                    this.childBoundsProperty.notifyListeners(oldChildBounds); // RE-ENTRANT CALL HERE, it will validateBounds()
                }
            }
        // WARNING: Think twice before adding code here below the listener notification. The notifyListeners() call can
        // trigger re-entrancy, so this function needs to work when that happens. DO NOT set things based on local
        // variables here.
        }
        if (this._localBoundsDirty) {
            wasDirtyBefore = true;
            sceneryLog && sceneryLog.bounds && sceneryLog.bounds('localBounds dirty');
            this._localBoundsDirty = false; // we only need this to set local bounds as dirty
            const oldLocalBounds = scratchBounds2.set(ourLocalBounds); // store old value in a temporary Bounds2
            // Only adjust the local bounds if it is not overridden
            if (!this._localBoundsOverridden) {
                // local bounds are a union between our self bounds and child bounds
                ourLocalBounds.set(ourSelfBounds).includeBounds(ourChildBounds);
                // apply clipping to the bounds if we have a clip area (all done in the local coordinate frame)
                const clipArea = this.clipArea;
                if (clipArea) {
                    ourLocalBounds.constrainBounds(clipArea.bounds);
                }
            }
            sceneryLog && sceneryLog.bounds && sceneryLog.bounds(`localBounds: ${ourLocalBounds}`);
            // NOTE: we need to update max dimensions still even if we are setting overridden localBounds
            // adjust our transform to match maximum bounds if necessary on a local bounds change
            if (this._maxWidth !== null || this._maxHeight !== null) {
                // needs to run before notifications below, otherwise reentrancy that hits this codepath will have its
                // updateMaxDimension overridden by the eventual original function call, with the now-incorrect local bounds.
                // See https://github.com/phetsims/joist/issues/725
                this.updateMaxDimension(ourLocalBounds);
            }
            if (!ourLocalBounds.equals(oldLocalBounds)) {
                // sanity check, see https://github.com/phetsims/scenery/issues/1071, we're running this before the localBounds
                // listeners are notified, to support limited re-entrance.
                this._boundsDirty = true;
                if (!ourLocalBounds.equalsEpsilon(oldLocalBounds, notificationThreshold)) {
                    this.localBoundsProperty.notifyListeners(oldLocalBounds); // RE-ENTRANT CALL HERE, it will validateBounds()
                }
            }
        // WARNING: Think twice before adding code here below the listener notification. The notifyListeners() call can
        // trigger re-entrancy, so this function needs to work when that happens. DO NOT set things based on local
        // variables here.
        }
        // TODO: layout here? https://github.com/phetsims/scenery/issues/1581
        if (this._boundsDirty) {
            wasDirtyBefore = true;
            sceneryLog && sceneryLog.bounds && sceneryLog.bounds('bounds dirty');
            // run this before firing the event
            this._boundsDirty = false;
            const oldBounds = scratchBounds2.set(ourBounds); // store old value in a temporary Bounds2
            // no need to do the more expensive bounds transformation if we are still axis-aligned
            if (this._transformBounds && !this._transform.getMatrix().isAxisAligned()) {
                // mutates the matrix and bounds during recursion
                const matrix = scratchMatrix3.set(this.getMatrix()); // calls below mutate this matrix
                ourBounds.set(Bounds2.NOTHING);
                // Include each painted self individually, transformed with the exact transform matrix.
                // This is expensive, as we have to do 2 matrix transforms for every descendant.
                this._includeTransformedSubtreeBounds(matrix, ourBounds); // self and children
                const clipArea = this.clipArea;
                if (clipArea) {
                    ourBounds.constrainBounds(clipArea.getBoundsWithTransform(matrix));
                }
            } else {
                // converts local to parent bounds. mutable methods used to minimize number of created bounds instances
                // (we create one so we don't change references to the old one)
                ourBounds.set(ourLocalBounds);
                this.transformBoundsFromLocalToParent(ourBounds);
            }
            sceneryLog && sceneryLog.bounds && sceneryLog.bounds(`bounds: ${ourBounds}`);
            if (!ourBounds.equals(oldBounds)) {
                // if we have a bounds change, we need to invalidate our parents so they can be recomputed
                i = this._parents.length;
                while(i--){
                    this._parents[i].invalidateBounds();
                }
                // TODO: consider changing to parameter object (that may be a problem for the GC overhead) https://github.com/phetsims/scenery/issues/1581
                if (!ourBounds.equalsEpsilon(oldBounds, notificationThreshold)) {
                    this.boundsProperty.notifyListeners(oldBounds); // RE-ENTRANT CALL HERE, it will validateBounds()
                }
            }
        // WARNING: Think twice before adding code here below the listener notification. The notifyListeners() call can
        // trigger re-entrancy, so this function needs to work when that happens. DO NOT set things based on local
        // variables here.
        }
        // if there were side-effects, run the validation again until we are clean
        if (this._childBoundsDirty || this._boundsDirty) {
            sceneryLog && sceneryLog.bounds && sceneryLog.bounds('revalidation');
            // TODO: if there are side-effects in listeners, this could overflow the stack. we should report an error https://github.com/phetsims/scenery/issues/1581
            // instead of locking up
            this.validateBounds(); // RE-ENTRANT CALL HERE, it will validateBounds()
        }
        if (assert) {
            assert(!this._originalBounds || this._originalBounds === this.boundsProperty._value, 'Reference for bounds changed!');
            assert(!this._originalLocalBounds || this._originalLocalBounds === this.localBoundsProperty._value, 'Reference for localBounds changed!');
            assert(!this._originalSelfBounds || this._originalSelfBounds === this.selfBoundsProperty._value, 'Reference for selfBounds changed!');
            assert(!this._originalChildBounds || this._originalChildBounds === this.childBoundsProperty._value, 'Reference for childBounds changed!');
        }
        // double-check that all of our bounds handling has been accurate
        if (assertSlow) {
            // new scope for safety
            (()=>{
                const epsilon = 0.000001;
                const childBounds = Bounds2.NOTHING.copy();
                _.each(this._children, (child)=>{
                    if (!this._excludeInvisibleChildrenFromBounds || child.isVisible()) {
                        childBounds.includeBounds(child.boundsProperty._value);
                    }
                });
                let localBounds = this.selfBoundsProperty._value.union(childBounds);
                const clipArea = this.clipArea;
                if (clipArea) {
                    localBounds = localBounds.intersection(clipArea.bounds);
                }
                const fullBounds = this.localToParentBounds(localBounds);
                assertSlow && assertSlow(this.childBoundsProperty._value.equalsEpsilon(childBounds, epsilon), `Child bounds mismatch after validateBounds: ${this.childBoundsProperty._value.toString()}, expected: ${childBounds.toString()}`);
                assertSlow && assertSlow(this._localBoundsOverridden || this._transformBounds || this.boundsProperty._value.equalsEpsilon(fullBounds, epsilon), `Bounds mismatch after validateBounds: ${this.boundsProperty._value.toString()}, expected: ${fullBounds.toString()}. This could have happened if a bounds instance owned by a Node` + ' was directly mutated (e.g. bounds.erode())');
            })();
        }
        sceneryLog && sceneryLog.bounds && sceneryLog.pop();
        return wasDirtyBefore; // whether any dirty flags were set
    }
    /**
   * Recursion for accurate transformed bounds handling. Mutates bounds with the added bounds.
   * Mutates the matrix (parameter), but mutates it back to the starting point (within floating-point error).
   */ _includeTransformedSubtreeBounds(matrix, bounds) {
        if (!this.selfBounds.isEmpty()) {
            bounds.includeBounds(this.getTransformedSelfBounds(matrix));
        }
        const numChildren = this._children.length;
        for(let i = 0; i < numChildren; i++){
            const child = this._children[i];
            matrix.multiplyMatrix(child._transform.getMatrix());
            child._includeTransformedSubtreeBounds(matrix, bounds);
            matrix.multiplyMatrix(child._transform.getInverse());
        }
        return bounds;
    }
    /**
   * Traverses this subtree and validates bounds only for subtrees that have bounds listeners (trying to exclude as
   * much as possible for performance). This is done so that we can do the minimum bounds validation to prevent any
   * bounds listeners from being triggered in further validateBounds() calls without other Node changes being done.
   * This is required for Display's atomic (non-reentrant) updateDisplay(), so that we don't accidentally trigger
   * bounds listeners while computing bounds during updateDisplay(). (scenery-internal)
   *
   * NOTE: this should pass by (ignore) any overridden localBounds, to trigger listeners below.
   */ validateWatchedBounds() {
        // Since a bounds listener on one of the roots could invalidate bounds on the other, we need to keep running this
        // until they are all clean. Otherwise, side-effects could occur from bounds validations
        // TODO: consider a way to prevent infinite loops here that occur due to bounds listeners triggering cycles https://github.com/phetsims/scenery/issues/1581
        while(this.watchedBoundsScan()){
        // do nothing
        }
    }
    /**
   * Recursive function for validateWatchedBounds. Returned whether any validateBounds() returned true (means we have
   * to traverse again) - scenery-internal
   *
   * @returns - Whether there could have been any changes.
   */ watchedBoundsScan() {
        if (this._boundsEventSelfCount !== 0) {
            // we are a root that should be validated. return whether we updated anything
            return this.validateBounds();
        } else if (this._boundsEventCount > 0 && this._childBoundsDirty) {
            // descendants have watched bounds, traverse!
            let changed = false;
            const numChildren = this._children.length;
            for(let i = 0; i < numChildren; i++){
                changed = this._children[i].watchedBoundsScan() || changed;
            }
            return changed;
        } else {
            // if _boundsEventCount is zero, no bounds are watched below us (don't traverse), and it wasn't changed
            return false;
        }
    }
    /**
   * Marks the bounds of this Node as invalid, so they are recomputed before being accessed again.
   */ invalidateBounds() {
        // TODO: sometimes we won't need to invalidate local bounds! it's not too much of a hassle though? https://github.com/phetsims/scenery/issues/1581
        this._boundsDirty = true;
        this._localBoundsDirty = true;
        // and set flags for all ancestors
        let i = this._parents.length;
        while(i--){
            this._parents[i].invalidateChildBounds();
        }
    }
    /**
   * Recursively tag all ancestors with _childBoundsDirty (scenery-internal)
   */ invalidateChildBounds() {
        // don't bother updating if we've already been tagged
        if (!this._childBoundsDirty) {
            this._childBoundsDirty = true;
            this._localBoundsDirty = true;
            let i = this._parents.length;
            while(i--){
                this._parents[i].invalidateChildBounds();
            }
        }
    }
    /**
   * Should be called to notify that our selfBounds needs to change to this new value.
   */ invalidateSelf(newSelfBounds) {
        assert && assert(newSelfBounds === undefined || newSelfBounds instanceof Bounds2, 'invalidateSelf\'s newSelfBounds, if provided, needs to be Bounds2');
        const ourSelfBounds = this.selfBoundsProperty._value;
        // If no self bounds are provided, rely on the bounds validation to trigger computation (using updateSelfBounds()).
        if (!newSelfBounds) {
            this._selfBoundsDirty = true;
            this.invalidateBounds();
            this._picker.onSelfBoundsDirty();
        } else {
            assert && assert(newSelfBounds.isEmpty() || newSelfBounds.isFinite(), 'Bounds must be empty or finite in invalidateSelf');
            // Don't recompute the self bounds
            this._selfBoundsDirty = false;
            // if these bounds are different than current self bounds
            if (!ourSelfBounds.equals(newSelfBounds)) {
                const oldSelfBounds = scratchBounds2.set(ourSelfBounds);
                // set repaint flags
                this.invalidateBounds();
                this._picker.onSelfBoundsDirty();
                // record the new bounds
                ourSelfBounds.set(newSelfBounds);
                // fire the event immediately
                this.selfBoundsProperty.notifyListeners(oldSelfBounds);
            }
        }
        if (assertSlow) {
            this._picker.audit();
        }
    }
    /**
   * Meant to be overridden by Node sub-types to compute self bounds (if invalidateSelf() with no arguments was called).
   *
   * @returns - Whether the self bounds changed.
   */ updateSelfBounds() {
        // The Node implementation (un-overridden) will never change the self bounds (always NOTHING).
        assert && assert(this.selfBoundsProperty._value.equals(Bounds2.NOTHING));
        return false;
    }
    /**
   * Returns whether a Node is a child of this node.
   *
   * @returns - Whether potentialChild is actually our child.
   */ hasChild(potentialChild) {
        assert && assert(potentialChild && potentialChild instanceof Node, 'hasChild needs to be called with a Node');
        const isOurChild = _.includes(this._children, potentialChild);
        assert && assert(isOurChild === _.includes(potentialChild._parents, this), 'child-parent reference should match parent-child reference');
        return isOurChild;
    }
    /**
   * Returns a Shape that represents the area covered by containsPointSelf.
   */ getSelfShape() {
        const selfBounds = this.selfBounds;
        if (selfBounds.isEmpty()) {
            return new Shape();
        } else {
            return Shape.bounds(this.selfBounds);
        }
    }
    /**
   * Returns our selfBounds (the bounds for this Node's content in the local coordinates, excluding anything from our
   * children and descendants).
   *
   * NOTE: Do NOT mutate the returned value!
   */ getSelfBounds() {
        return this.selfBoundsProperty.value;
    }
    /**
   * See getSelfBounds() for more information
   */ get selfBounds() {
        return this.getSelfBounds();
    }
    /**
   * Returns a bounding box that should contain all self content in the local coordinate frame (our normal self bounds
   * aren't guaranteed this for Text, etc.)
   *
   * Override this to provide different behavior.
   */ getSafeSelfBounds() {
        return this.selfBoundsProperty.value;
    }
    /**
   * See getSafeSelfBounds() for more information
   */ get safeSelfBounds() {
        return this.getSafeSelfBounds();
    }
    /**
   * Returns the bounding box that should contain all content of our children in our local coordinate frame. Does not
   * include our "self" bounds.
   *
   * NOTE: Do NOT mutate the returned value!
   */ getChildBounds() {
        return this.childBoundsProperty.value;
    }
    /**
   * See getChildBounds() for more information
   */ get childBounds() {
        return this.getChildBounds();
    }
    /**
   * Returns the bounding box that should contain all content of our children AND our self in our local coordinate
   * frame.
   *
   * NOTE: Do NOT mutate the returned value!
   */ getLocalBounds() {
        return this.localBoundsProperty.value;
    }
    /**
   * See getLocalBounds() for more information
   */ get localBounds() {
        return this.getLocalBounds();
    }
    /**
   * See setLocalBounds() for more information
   */ set localBounds(value) {
        this.setLocalBounds(value);
    }
    get localBoundsOverridden() {
        return this._localBoundsOverridden;
    }
    /**
   * Allows overriding the value of localBounds (and thus changing things like 'bounds' that depend on localBounds).
   * If it's set to a non-null value, that value will always be used for localBounds until this function is called
   * again. To revert to having Scenery compute the localBounds, set this to null.  The bounds should not be reduced
   * smaller than the visible bounds on the screen.
   */ setLocalBounds(localBounds) {
        assert && assert(localBounds === null || localBounds instanceof Bounds2, 'localBounds override should be set to either null or a Bounds2');
        assert && assert(localBounds === null || !isNaN(localBounds.minX), 'minX for localBounds should not be NaN');
        assert && assert(localBounds === null || !isNaN(localBounds.minY), 'minY for localBounds should not be NaN');
        assert && assert(localBounds === null || !isNaN(localBounds.maxX), 'maxX for localBounds should not be NaN');
        assert && assert(localBounds === null || !isNaN(localBounds.maxY), 'maxY for localBounds should not be NaN');
        const ourLocalBounds = this.localBoundsProperty._value;
        const oldLocalBounds = ourLocalBounds.copy();
        if (localBounds === null) {
            // we can just ignore this if we weren't actually overriding local bounds before
            if (this._localBoundsOverridden) {
                this._localBoundsOverridden = false;
                this.localBoundsProperty.notifyListeners(oldLocalBounds);
                this.invalidateBounds();
            }
        } else {
            // just an instance check for now. consider equals() in the future depending on cost
            const changed = !localBounds.equals(ourLocalBounds) || !this._localBoundsOverridden;
            if (changed) {
                ourLocalBounds.set(localBounds);
            }
            if (!this._localBoundsOverridden) {
                this._localBoundsOverridden = true; // NOTE: has to be done before invalidating bounds, since this disables localBounds computation
            }
            if (changed) {
                this.localBoundsProperty.notifyListeners(oldLocalBounds);
                this.invalidateBounds();
            }
        }
        return this; // allow chaining
    }
    /**
   * Meant to be overridden in sub-types that have more accurate bounds determination for when we are transformed.
   * Usually rotation is significant here, so that transformed bounds for non-rectangular shapes will be different.
   */ getTransformedSelfBounds(matrix) {
        // assume that we take up the entire rectangular bounds by default
        return this.selfBounds.transformed(matrix);
    }
    /**
   * Meant to be overridden in sub-types that have more accurate bounds determination for when we are transformed.
   * Usually rotation is significant here, so that transformed bounds for non-rectangular shapes will be different.
   *
   * This should include the "full" bounds that guarantee everything rendered should be inside (e.g. Text, where the
   * normal bounds may not be sufficient).
   */ getTransformedSafeSelfBounds(matrix) {
        return this.safeSelfBounds.transformed(matrix);
    }
    /**
   * Returns the visual "safe" bounds that are taken up by this Node and its subtree. Notably, this is essentially the
   * combined effects of the "visible" bounds (i.e. invisible nodes do not contribute to bounds), and "safe" bounds
   * (e.g. Text, where we need a larger bounds area to guarantee there is nothing outside). It also tries to "fit"
   * transformed bounds more tightly, where it will handle rotated Path bounds in an improved way.
   *
   * NOTE: This method is not optimized, and may create garbage and not be the fastest.
   *
   * @param [matrix] - If provided, will return the bounds assuming the content is transformed with the
   *                             given matrix.
   */ getSafeTransformedVisibleBounds(matrix) {
        const localMatrix = (matrix || Matrix3.IDENTITY).timesMatrix(this.matrix);
        const bounds = Bounds2.NOTHING.copy();
        if (this.visibleProperty.value) {
            if (!this.selfBounds.isEmpty()) {
                bounds.includeBounds(this.getTransformedSafeSelfBounds(localMatrix));
            }
            if (this._children.length) {
                for(let i = 0; i < this._children.length; i++){
                    bounds.includeBounds(this._children[i].getSafeTransformedVisibleBounds(localMatrix));
                }
            }
        }
        return bounds;
    }
    /**
   * See getSafeTransformedVisibleBounds() for more information -- This is called without any initial parameter
   */ get safeTransformedVisibleBounds() {
        return this.getSafeTransformedVisibleBounds();
    }
    /**
   * Sets the flag that determines whether we will require more accurate (and expensive) bounds computation for this
   * node's transform.
   *
   * If set to false (default), Scenery will get the bounds of content, and then if rotated will determine the on-axis
   * bounds that completely cover the rotated bounds (potentially larger than actual content).
   * If set to true, Scenery will try to get the bounds of the actual rotated/transformed content.
   *
   * A good example of when this is necessary is if there are a bunch of nested children that each have pi/4 rotations.
   *
   * @param transformBounds - Whether accurate transform bounds should be used.
   */ setTransformBounds(transformBounds) {
        if (this._transformBounds !== transformBounds) {
            this._transformBounds = transformBounds;
            this.invalidateBounds();
        }
        return this; // allow chaining
    }
    /**
   * See setTransformBounds() for more information
   */ set transformBounds(value) {
        this.setTransformBounds(value);
    }
    /**
   * See getTransformBounds() for more information
   */ get transformBounds() {
        return this.getTransformBounds();
    }
    /**
   * Returns whether accurate transformation bounds are used in bounds computation (see setTransformBounds).
   */ getTransformBounds() {
        return this._transformBounds;
    }
    /**
   * Returns the bounding box of this Node and all of its sub-trees (in the "parent" coordinate frame).
   *
   * NOTE: Do NOT mutate the returned value!
   * NOTE: This may require computation of this node's subtree bounds, which may incur some performance loss.
   */ getBounds() {
        return this.boundsProperty.value;
    }
    /**
   * See getBounds() for more information
   */ get bounds() {
        return this.getBounds();
    }
    /**
   * Like getLocalBounds() in the "local" coordinate frame, but includes only visible nodes.
   */ getVisibleLocalBounds() {
        // defensive copy, since we use mutable modifications below
        const bounds = this.selfBounds.copy();
        let i = this._children.length;
        while(i--){
            bounds.includeBounds(this._children[i].getVisibleBounds());
        }
        // apply clipping to the bounds if we have a clip area (all done in the local coordinate frame)
        const clipArea = this.clipArea;
        if (clipArea) {
            bounds.constrainBounds(clipArea.bounds);
        }
        assert && assert(bounds.isFinite() || bounds.isEmpty(), 'Visible bounds should not be infinite');
        return bounds;
    }
    /**
   * See getVisibleLocalBounds() for more information
   */ get visibleLocalBounds() {
        return this.getVisibleLocalBounds();
    }
    /**
   * Like getBounds() in the "parent" coordinate frame, but includes only visible nodes
   */ getVisibleBounds() {
        if (this.isVisible()) {
            return this.getVisibleLocalBounds().transform(this.getMatrix());
        } else {
            return Bounds2.NOTHING;
        }
    }
    /**
   * See getVisibleBounds() for more information
   */ get visibleBounds() {
        return this.getVisibleBounds();
    }
    /**
   * Tests whether the given point is "contained" in this node's subtree (optionally using mouse/touch areas), and if
   * so returns the Trail (rooted at this node) to the top-most (in stacking order) Node that contains the given
   * point.
   *
   * NOTE: This is optimized for the current input system (rather than what gets visually displayed on the screen), so
   * pickability (Node's pickable property, visibility, and the presence of input listeners) all may affect the
   * returned value.
   *
   * For example, hit-testing a simple shape (with no pickability) will return null:
   * > new phet.scenery.Circle( 20 ).hitTest( phet.dot.v2( 0, 0 ) ); // null
   *
   * If the same shape is made to be pickable, it will return a trail:
   * > new phet.scenery.Circle( 20, { pickable: true } ).hitTest( phet.dot.v2( 0, 0 ) );
   * > // returns a Trail with the circle as the only node.
   *
   * It will return the result that is visually stacked on top, so e.g.:
   * > new phet.scenery.Node( {
   * >   pickable: true,
   * >   children: [
   * >     new phet.scenery.Circle( 20 ),
   * >     new phet.scenery.Circle( 15 )
   * >   ]
   * > } ).hitTest( phet.dot.v2( 0, 0 ) ); // returns the "top-most" circle (the one with radius:15).
   *
   * This is used by Scenery's internal input system by calling hitTest on a Display's rootNode with the
   * global-coordinate point.
   *
   * @param point - The point (in the parent coordinate frame) to check against this node's subtree.
   * @param [isMouse] - Whether mouseAreas should be used.
   * @param [isTouch] - Whether touchAreas should be used.
   * @returns - Returns null if the point is not contained in the subtree.
   */ hitTest(point, isMouse, isTouch) {
        assert && assert(point.isFinite(), 'The point should be a finite Vector2');
        assert && assert(isMouse === undefined || typeof isMouse === 'boolean', 'If isMouse is provided, it should be a boolean');
        assert && assert(isTouch === undefined || typeof isTouch === 'boolean', 'If isTouch is provided, it should be a boolean');
        return this._picker.hitTest(point, !!isMouse, !!isTouch);
    }
    /**
   * Hit-tests what is under the pointer, and returns a {Trail} to that Node (or null if there is no matching node).
   *
   * See hitTest() for more details about what will be returned.
   */ trailUnderPointer(pointer) {
        return pointer.point === null ? null : this.hitTest(pointer.point, pointer instanceof Mouse, pointer.isTouchLike());
    }
    /**
   * Returns whether a point (in parent coordinates) is contained in this node's sub-tree.
   *
   * See hitTest() for more details about what will be returned.
   *
   * @returns - Whether the point is contained.
   */ containsPoint(point) {
        return this.hitTest(point) !== null;
    }
    /**
   * Override this for computation of whether a point is inside our self content (defaults to selfBounds check).
   *
   * @param point - Considered to be in the local coordinate frame
   */ containsPointSelf(point) {
        // if self bounds are not null default to checking self bounds
        return this.selfBounds.containsPoint(point);
    }
    /**
   * Returns whether this node's selfBounds is intersected by the specified bounds.
   *
   * @param bounds - Bounds to test, assumed to be in the local coordinate frame.
   */ intersectsBoundsSelf(bounds) {
        // if self bounds are not null, child should override this
        return this.selfBounds.intersectsBounds(bounds);
    }
    /**
   * Determine if the Node is a candidate for phet-io autoselect.
   * 1. Invisible things cannot be autoselected
   * 2. Transform the point in the local coordinate frame, so we can test it with the clipArea/children
   * 3. If our point is outside the local-coordinate clipping area, there should be no hit.
   * 4. Note that non-pickable nodes can still be autoselected
   */ isPhetioMouseHittable(point) {
        // unpickable things cannot be autoselected unless there are descendants that could be potential mouse hits.
        // It is important to opt out of these subtrees to make sure that they don't falsely "suck up" a mouse hit that
        // would otherwise go to a target behind the unpickable Node.
        if (this.pickable === false && !this.isAnyDescendantAPhetioMouseHitTarget()) {
            return false;
        }
        return this.visible && (this.clipArea === null || this.clipArea.containsPoint(this._transform.getInverse().timesVector2(point)));
    }
    /**
   * If you need to know if any Node in a subtree could possibly be a phetio mouse hit target.
   * SR and MK ran performance on this function in CCK:DC and CAV in 6/2023 and there was no noticeable problem.
   */ isAnyDescendantAPhetioMouseHitTarget() {
        return this.getPhetioMouseHitTarget() !== 'phetioNotSelectable' || _.some(this.children, (child)=>child.isAnyDescendantAPhetioMouseHitTarget());
    }
    /**
   * Used in Studio Autoselect.  Returns a PhET-iO Element (a PhetioObject) if possible, or null if no hit.
   * "phetioNotSelectable" is an intermediate state used to note when a "hit" has occurred, but the hit was on a Node
   * that didn't have a fit target (see PhetioObject.getPhetioMouseHitTarget())
   * A few notes on the implementation:
   * 1. Prefer the leaf most Node that is at the highest z-index in rendering order
   * 2. Pickable:false Nodes don't prune out subtrees if descendents could still be mouse hit targets
   *    (see PhetioObject.getPhetioMouseHitTarget()).
   * 3. First the algorithm finds a Node that is a "hit", and then it tries to find the most fit "target" for that hit.
   *    a. Itself, see  PhetioObject.getPhetioMouseHitTarget()
   *    b. A class defined substitute, Text.getPhetioMouseHitTarget()
   *    c. A sibling that is rendered behind the hit
   *    d. The most recent descendant that is a usable target.
   *
   * Adapted originally from Picker.recursiveHitTest, with specific tweaks needed for PhET-iO instrumentation, display
   * and filtering.
   * @returns - null if no hit occurred
   *          - A PhetioObject if a hit occurred on a Node with a selectable target
   *          - 'phetioNotSelectable' if a hit occurred, but no suitable target was found from that hit (see
   *             PhetioObject.getPhetioMouseHitTarget())
   */ getPhetioMouseHit(point) {
        if (!this.isPhetioMouseHittable(point)) {
            return null;
        }
        // Transform the point in the local coordinate frame, so we can test it with the clipArea/children
        const localPoint = this._transform.getInverse().timesVector2(point);
        // If any child was hit but returned 'phetioNotSelectable', then that will trigger the "find the best target" portion
        // of the algorithm, moving on from the "find the hit Node" part.
        let childHitWithoutTarget = null;
        // Check children before our "self", since the children are rendered on top.
        // Manual iteration here so we can return directly, and so we can iterate backwards (last node is rendered in front).
        for(let i = this._children.length - 1; i >= 0; i--){
            // Not necessarily a child of this Node (see getPhetioMouseHitTarget())
            const childTargetHit = this._children[i].getPhetioMouseHit(localPoint);
            if (childTargetHit instanceof PhetioObject) {
                return childTargetHit;
            } else if (childTargetHit === 'phetioNotSelectable') {
                childHitWithoutTarget = true;
            }
        // No hit, so keep iterating to next child
        }
        if (childHitWithoutTarget) {
            return this.getPhetioMouseHitTarget();
        }
        // Tests for mouse hit areas before testing containsPointSelf. If there is a mouseArea, then don't ever check selfBounds.
        if (this._mouseArea) {
            return this._mouseArea.containsPoint(localPoint) ? this.getPhetioMouseHitTarget() : null;
        }
        // Didn't hit our children, so check ourselves as a last resort. Check our selfBounds first, so we can potentially
        // avoid hit-testing the actual object (which may be more expensive).
        if (this.selfBounds.containsPoint(localPoint) && this.containsPointSelf(localPoint)) {
            return this.getPhetioMouseHitTarget();
        }
        // No hit
        return null;
    }
    /**
   * Whether this Node itself is painted (displays something itself). Meant to be overridden.
   */ isPainted() {
        // Normal nodes don't render anything
        return false;
    }
    /**
   * Whether this Node's selfBounds are considered to be valid (always containing the displayed self content
   * of this node). Meant to be overridden in subtypes when this can change (e.g. Text).
   *
   * If this value would potentially change, please trigger the event 'selfBoundsValid'.
   */ areSelfBoundsValid() {
        return true;
    }
    /**
   * Returns whether this Node has any parents at all.
   */ hasParent() {
        return this._parents.length !== 0;
    }
    /**
   * Returns whether this Node has any children at all.
   */ hasChildren() {
        return this._children.length > 0;
    }
    /**
   * Returns whether a child should be included for layout (if this Node is a layout container).
   */ isChildIncludedInLayout(child) {
        return child.bounds.isValid() && (!this._excludeInvisibleChildrenFromBounds || child.visible);
    }
    /**
   * Calls the callback on nodes recursively in a depth-first manner.
   */ walkDepthFirst(callback) {
        callback(this);
        const length = this._children.length;
        for(let i = 0; i < length; i++){
            this._children[i].walkDepthFirst(callback);
        }
    }
    /**
   * Adds an input listener.
   *
   * See Input.js documentation for information about how event listeners are used.
   *
   * Additionally, the following fields are supported on a listener:
   *
   * - interrupt {function()}: When a pointer is interrupted, it will attempt to call this method on the input listener
   * - cursor {string|null}: If node.cursor is null, any non-null cursor of an input listener will effectively
   *                         "override" it. NOTE: this can be implemented as an es5 getter, if the cursor can change
   */ addInputListener(listener) {
        assert && assert(!_.includes(this._inputListeners, listener), 'Input listener already registered on this Node');
        assert && assert(listener !== null, 'Input listener cannot be null');
        assert && assert(listener !== undefined, 'Input listener cannot be undefined');
        // don't allow listeners to be added multiple times
        if (!_.includes(this._inputListeners, listener)) {
            this._inputListeners.push(listener);
            this._picker.onAddInputListener();
            if (assertSlow) {
                this._picker.audit();
            }
            // If the listener contains hotkeys, active hotkeys may need to be updated. There is no event
            // for changing input listeners. See hotkeyManager for more information.
            if (listener.hotkeys) {
                hotkeyManager.updateHotkeysFromInputListenerChange(this);
            }
        }
        return this;
    }
    /**
   * Removes an input listener that was previously added with addInputListener.
   */ removeInputListener(listener) {
        const index = _.indexOf(this._inputListeners, listener);
        // ensure the listener is in our list (ignore assertion for disposal, see https://github.com/phetsims/sun/issues/394)
        assert && assert(this.isDisposed || index >= 0, 'Could not find input listener to remove');
        if (index >= 0) {
            this._inputListeners.splice(index, 1);
            this._picker.onRemoveInputListener();
            if (assertSlow) {
                this._picker.audit();
            }
            // If the listener contains hotkeys, active hotkeys may need to be updated. There is no event
            // for changing input listeners. See hotkeyManager for more information.
            if (listener.hotkeys) {
                hotkeyManager.updateHotkeysFromInputListenerChange(this);
            }
        }
        return this;
    }
    /**
   * Returns whether this input listener is currently listening to this node.
   *
   * More efficient than checking node.inputListeners, as that includes a defensive copy.
   */ hasInputListener(listener) {
        for(let i = 0; i < this._inputListeners.length; i++){
            if (this._inputListeners[i] === listener) {
                return true;
            }
        }
        return false;
    }
    /**
   * Interrupts all input listeners that are attached to this node.
   */ interruptInput() {
        const listenersCopy = this.inputListeners;
        for(let i = 0; i < listenersCopy.length; i++){
            const listener = listenersCopy[i];
            listener.interrupt && listener.interrupt();
        }
        return this;
    }
    /**
   * Interrupts all input listeners that are attached to either this node, or a descendant node.
   */ interruptSubtreeInput() {
        this.interruptInput();
        const children = this._children.slice();
        for(let i = 0; i < children.length; i++){
            const child = children[i];
            // Performance enhancement by pruning out subtrees that have no input listeners or would not be pickable anyway.
            // See https://github.com/phetsims/scenery/issues/1645
            if (child._picker.isPotentiallyPickable()) {
                child.interruptSubtreeInput();
            }
        }
        return this;
    }
    translate(x, y, prependInstead) {
        if (typeof x === 'number') {
            // translate( x, y, prependInstead )
            assert && assert(isFinite(x), 'x should be a finite number');
            assert && assert(typeof y === 'number' && isFinite(y), 'y should be a finite number');
            if (Math.abs(x) < 1e-12 && Math.abs(y) < 1e-12) {
                return;
            } // bail out if both are zero
            if (prependInstead) {
                this.prependTranslation(x, y);
            } else {
                this.appendMatrix(scratchMatrix3.setToTranslation(x, y));
            }
        } else {
            // translate( vector, prependInstead )
            const vector = x;
            assert && assert(vector.isFinite(), 'translation should be a finite Vector2 if not finite numbers');
            if (!vector.x && !vector.y) {
                return;
            } // bail out if both are zero
            this.translate(vector.x, vector.y, y); // forward to full version
        }
    }
    scale(x, y, prependInstead) {
        if (typeof x === 'number') {
            assert && assert(isFinite(x), 'scales should be finite');
            if (y === undefined || typeof y === 'boolean') {
                // scale( scale, [prependInstead] )
                this.scale(x, x, y);
            } else {
                // scale( x, y, [prependInstead] )
                assert && assert(isFinite(y), 'scales should be finite numbers');
                assert && assert(prependInstead === undefined || typeof prependInstead === 'boolean', 'If provided, prependInstead should be boolean');
                if (x === 1 && y === 1) {
                    return;
                } // bail out if we are scaling by 1 (identity)
                if (prependInstead) {
                    this.prependMatrix(Matrix3.scaling(x, y));
                } else {
                    this.appendMatrix(Matrix3.scaling(x, y));
                }
            }
        } else {
            // scale( vector, [prependInstead] )
            const vector = x;
            assert && assert(vector.isFinite(), 'scale should be a finite Vector2 if not a finite number');
            this.scale(vector.x, vector.y, y); // forward to full version
        }
    }
    /**
   * Rotates the node's transform. The default "appends" the transform, so that it will
   * appear to happen to the Node before the rest of the transform would apply, but if "prepended", the rest of the
   * transform would apply first.
   *
   * As an example, if a Node is translated to (100,0):
   * rotate( Math.PI ) will rotate the Node around (100,0)
   * rotate( Math.PI, true ) will rotate the Node around the origin, moving it to (-100,0)
   *
   * @param angle - The angle (in radians) to rotate by
   * @param [prependInstead] - Whether the transform should be prepended (defaults to false)
   */ rotate(angle, prependInstead) {
        assert && assert(isFinite(angle), 'angle should be a finite number');
        assert && assert(prependInstead === undefined || typeof prependInstead === 'boolean');
        if (angle % (2 * Math.PI) === 0) {
            return;
        } // bail out if our angle is effectively 0
        if (prependInstead) {
            this.prependMatrix(Matrix3.rotation2(angle));
        } else {
            this.appendMatrix(Matrix3.rotation2(angle));
        }
    }
    /**
   * Rotates the node's transform around a specific point (in the parent coordinate frame) by prepending the transform.
   *
   * TODO: determine whether this should use the appendMatrix method https://github.com/phetsims/scenery/issues/1581
   *
   * @param point - In the parent coordinate frame
   * @param angle - In radians
   */ rotateAround(point, angle) {
        assert && assert(point.isFinite(), 'point should be a finite Vector2');
        assert && assert(isFinite(angle), 'angle should be a finite number');
        let matrix = Matrix3.translation(-point.x, -point.y);
        matrix = Matrix3.rotation2(angle).timesMatrix(matrix);
        matrix = Matrix3.translation(point.x, point.y).timesMatrix(matrix);
        this.prependMatrix(matrix);
        return this;
    }
    /**
   * Shifts the x coordinate (in the parent coordinate frame) of where the node's origin is transformed to.
   */ setX(x) {
        assert && assert(isFinite(x), 'x should be a finite number');
        this.translate(x - this.getX(), 0, true);
        return this;
    }
    /**
   * See setX() for more information
   */ set x(value) {
        this.setX(value);
    }
    /**
   * See getX() for more information
   */ get x() {
        return this.getX();
    }
    /**
   * Returns the x coordinate (in the parent coordinate frame) of where the node's origin is transformed to.
   */ getX() {
        return this._transform.getMatrix().m02();
    }
    /**
   * Shifts the y coordinate (in the parent coordinate frame) of where the node's origin is transformed to.
   */ setY(y) {
        assert && assert(isFinite(y), 'y should be a finite number');
        this.translate(0, y - this.getY(), true);
        return this;
    }
    /**
   * See setY() for more information
   */ set y(value) {
        this.setY(value);
    }
    /**
   * See getY() for more information
   */ get y() {
        return this.getY();
    }
    /**
   * Returns the y coordinate (in the parent coordinate frame) of where the node's origin is transformed to.
   */ getY() {
        return this._transform.getMatrix().m12();
    }
    setScaleMagnitude(a, b) {
        const currentScale = this.getScaleVector();
        if (typeof a === 'number') {
            if (b === undefined) {
                // to map setScaleMagnitude( scale ) => setScaleMagnitude( scale, scale )
                b = a;
            }
            assert && assert(isFinite(a), 'setScaleMagnitude parameters should be finite numbers');
            assert && assert(isFinite(b), 'setScaleMagnitude parameters should be finite numbers');
            // setScaleMagnitude( x, y )
            this.appendMatrix(Matrix3.scaling(a / currentScale.x, b / currentScale.y));
        } else {
            // setScaleMagnitude( vector ), where we set the x-scale to vector.x and y-scale to vector.y
            assert && assert(a.isFinite(), 'first parameter should be a finite Vector2');
            this.appendMatrix(Matrix3.scaling(a.x / currentScale.x, a.y / currentScale.y));
        }
        return this;
    }
    /**
   * Returns a vector with an entry for each axis, e.g. (5,2) for an affine matrix with rows ((5,0,0),(0,2,0),(0,0,1)).
   *
   * It is equivalent to:
   * ( T(1,0).magnitude(), T(0,1).magnitude() ) where T() transforms points with our transform.
   */ getScaleVector() {
        return this._transform.getMatrix().getScaleVector();
    }
    /**
   * Rotates this node's transform so that a unit (1,0) vector would be rotated by this node's transform by the
   * specified amount.
   *
   * @param rotation - In radians
   */ setRotation(rotation) {
        assert && assert(isFinite(rotation), 'rotation should be a finite number');
        this.appendMatrix(scratchMatrix3.setToRotationZ(rotation - this.getRotation()));
        return this;
    }
    /**
   * See setRotation() for more information
   */ set rotation(value) {
        this.setRotation(value);
    }
    /**
   * See getRotation() for more information
   */ get rotation() {
        return this.getRotation();
    }
    /**
   * Returns the rotation (in radians) that would be applied to a unit (1,0) vector when transformed with this Node's
   * transform.
   */ getRotation() {
        return this._transform.getMatrix().getRotation();
    }
    setTranslation(a, b) {
        const m = this._transform.getMatrix();
        const tx = m.m02();
        const ty = m.m12();
        let dx;
        let dy;
        if (typeof a === 'number') {
            assert && assert(isFinite(a), 'Parameters to setTranslation should be finite numbers');
            assert && assert(b !== undefined && isFinite(b), 'Parameters to setTranslation should be finite numbers');
            dx = a - tx;
            dy = b - ty;
        } else {
            assert && assert(a.isFinite(), 'Should be a finite Vector2');
            dx = a.x - tx;
            dy = a.y - ty;
        }
        this.translate(dx, dy, true);
        return this;
    }
    /**
   * See setTranslation() for more information - this should only be used with Vector2
   */ set translation(value) {
        this.setTranslation(value);
    }
    /**
   * See getTranslation() for more information
   */ get translation() {
        return this.getTranslation();
    }
    /**
   * Returns a vector of where this Node's local-coordinate origin will be transformed by it's own transform.
   */ getTranslation() {
        const matrix = this._transform.getMatrix();
        return new Vector2(matrix.m02(), matrix.m12());
    }
    /**
   * Appends a transformation matrix to this Node's transform. Appending means this transform is conceptually applied
   * first before the rest of the Node's current transform (i.e. applied in the local coordinate frame).
   */ appendMatrix(matrix) {
        assert && assert(matrix.isFinite(), 'matrix should be a finite Matrix3');
        assert && assert(matrix.getDeterminant() !== 0, 'matrix should not map plane to a line or point');
        this._transform.append(matrix);
    }
    /**
   * Prepends a transformation matrix to this Node's transform. Prepending means this transform is conceptually applied
   * after the rest of the Node's current transform (i.e. applied in the parent coordinate frame).
   */ prependMatrix(matrix) {
        assert && assert(matrix.isFinite(), 'matrix should be a finite Matrix3');
        assert && assert(matrix.getDeterminant() !== 0, 'matrix should not map plane to a line or point');
        this._transform.prepend(matrix);
    }
    /**
   * Prepends an (x,y) translation to our Node's transform in an efficient manner without allocating a matrix.
   * see https://github.com/phetsims/scenery/issues/119
   */ prependTranslation(x, y) {
        assert && assert(isFinite(x), 'x should be a finite number');
        assert && assert(isFinite(y), 'y should be a finite number');
        if (!x && !y) {
            return;
        } // bail out if both are zero
        this._transform.prependTranslation(x, y);
    }
    /**
   * Changes this Node's transform to match the passed-in transformation matrix.
   */ setMatrix(matrix) {
        assert && assert(matrix.isFinite(), 'matrix should be a finite Matrix3');
        assert && assert(matrix.getDeterminant() !== 0, 'matrix should not map plane to a line or point');
        this._transform.setMatrix(matrix);
    }
    /**
   * See setMatrix() for more information
   */ set matrix(value) {
        this.setMatrix(value);
    }
    /**
   * See getMatrix() for more information
   */ get matrix() {
        return this.getMatrix();
    }
    /**
   * Returns a Matrix3 representing our Node's transform.
   *
   * NOTE: Do not mutate the returned matrix.
   */ getMatrix() {
        return this._transform.getMatrix();
    }
    /**
   * Returns a reference to our Node's transform
   */ getTransform() {
        // for now, return an actual copy. we can consider listening to changes in the future
        return this._transform;
    }
    /**
   * See getTransform() for more information
   */ get transform() {
        return this.getTransform();
    }
    /**
   * Resets our Node's transform to an identity transform (i.e. no transform is applied).
   */ resetTransform() {
        this.setMatrix(Matrix3.IDENTITY);
    }
    /**
   * Callback function that should be called when our transform is changed.
   */ onTransformChange() {
        // TODO: why is local bounds invalidation needed here? https://github.com/phetsims/scenery/issues/1581
        this.invalidateBounds();
        this._picker.onTransformChange();
        if (assertSlow) {
            this._picker.audit();
        }
        this.transformEmitter.emit();
    }
    /**
   * Called when our summary bitmask changes (scenery-internal)
   */ onSummaryChange(oldBitmask, newBitmask) {
        // Defined in ParallelDOM.js
        this._pdomDisplaysInfo.onSummaryChange(oldBitmask, newBitmask);
    }
    /**
   * Updates our node's scale and applied scale factor if we need to change our scale to fit within the maximum
   * dimensions (maxWidth and maxHeight). See documentation in constructor for detailed behavior.
   */ updateMaxDimension(localBounds) {
        assert && this.auditMaxDimensions();
        const currentScale = this._appliedScaleFactor;
        let idealScale = 1;
        if (this._maxWidth !== null) {
            const width = localBounds.width;
            if (width > this._maxWidth) {
                idealScale = Math.min(idealScale, this._maxWidth / width);
            }
        }
        if (this._maxHeight !== null) {
            const height = localBounds.height;
            if (height > this._maxHeight) {
                idealScale = Math.min(idealScale, this._maxHeight / height);
            }
        }
        const scaleAdjustment = idealScale / currentScale;
        if (scaleAdjustment !== 1) {
            // Set this first, for supporting re-entrancy if our content changes based on the scale
            this._appliedScaleFactor = idealScale;
            this.scale(scaleAdjustment);
        }
    }
    /**
   * Scenery-internal method for verifying maximum dimensions are NOT smaller than preferred dimensions
   * NOTE: This has to be public due to mixins not able to access protected/private methods
   */ auditMaxDimensions() {
        assert && assert(this._maxWidth === null || !isWidthSizable(this) || this.preferredWidth === null || this._maxWidth >= this.preferredWidth - 1e-7, 'If maxWidth and preferredWidth are both non-null, maxWidth should NOT be smaller than the preferredWidth. If that happens, it would trigger an infinite loop');
        assert && assert(this._maxHeight === null || !isHeightSizable(this) || this.preferredHeight === null || this._maxHeight >= this.preferredHeight - 1e-7, 'If maxHeight and preferredHeight are both non-null, maxHeight should NOT be smaller than the preferredHeight. If that happens, it would trigger an infinite loop');
    }
    /**
   * Increments/decrements bounds "listener" count based on the values of maxWidth/maxHeight before and after.
   * null is like no listener, non-null is like having a listener, so we increment for null => non-null, and
   * decrement for non-null => null.
   */ onMaxDimensionChange(beforeMaxLength, afterMaxLength) {
        if (beforeMaxLength === null && afterMaxLength !== null) {
            this.changeBoundsEventCount(1);
            this._boundsEventSelfCount++;
        } else if (beforeMaxLength !== null && afterMaxLength === null) {
            this.changeBoundsEventCount(-1);
            this._boundsEventSelfCount--;
        }
    }
    /**
   * Sets the maximum width of the Node (see constructor for documentation on how maximum dimensions work).
   */ setMaxWidth(maxWidth) {
        assert && assert(maxWidth === null || typeof maxWidth === 'number' && maxWidth > 0, 'maxWidth should be null (no constraint) or a positive number');
        if (this._maxWidth !== maxWidth) {
            // update synthetic bounds listener count (to ensure our bounds are validated at the start of updateDisplay)
            this.onMaxDimensionChange(this._maxWidth, maxWidth);
            this._maxWidth = maxWidth;
            this.updateMaxDimension(this.localBoundsProperty.value);
        }
    }
    /**
   * See setMaxWidth() for more information
   */ set maxWidth(value) {
        this.setMaxWidth(value);
    }
    /**
   * See getMaxWidth() for more information
   */ get maxWidth() {
        return this.getMaxWidth();
    }
    /**
   * Returns the maximum width (if any) of the Node.
   */ getMaxWidth() {
        return this._maxWidth;
    }
    /**
   * Sets the maximum height of the Node (see constructor for documentation on how maximum dimensions work).
   */ setMaxHeight(maxHeight) {
        assert && assert(maxHeight === null || typeof maxHeight === 'number' && maxHeight > 0, 'maxHeight should be null (no constraint) or a positive number');
        if (this._maxHeight !== maxHeight) {
            // update synthetic bounds listener count (to ensure our bounds are validated at the start of updateDisplay)
            this.onMaxDimensionChange(this._maxHeight, maxHeight);
            this._maxHeight = maxHeight;
            this.updateMaxDimension(this.localBoundsProperty.value);
        }
    }
    /**
   * See setMaxHeight() for more information
   */ set maxHeight(value) {
        this.setMaxHeight(value);
    }
    /**
   * See getMaxHeight() for more information
   */ get maxHeight() {
        return this.getMaxHeight();
    }
    /**
   * Returns the maximum height (if any) of the Node.
   */ getMaxHeight() {
        return this._maxHeight;
    }
    /**
   * Shifts this Node horizontally so that its left bound (in the parent coordinate frame) is equal to the passed-in
   * 'left' X value.
   *
   * NOTE: This may require computation of this node's subtree bounds, which may incur some performance loss.
   *
   * @param left - After this operation, node.left should approximately equal this value.
   */ setLeft(left) {
        const currentLeft = this.getLeft();
        if (isFinite(currentLeft)) {
            this.translate(left - currentLeft, 0, true);
        }
        return this; // allow chaining
    }
    /**
   * See setLeft() for more information
   */ set left(value) {
        this.setLeft(value);
    }
    /**
   * See getLeft() for more information
   */ get left() {
        return this.getLeft();
    }
    /**
   * Returns the X value of the left side of the bounding box of this Node (in the parent coordinate frame).
   *
   * NOTE: This may require computation of this node's subtree bounds, which may incur some performance loss.
   */ getLeft() {
        return this.getBounds().minX;
    }
    /**
   * Shifts this Node horizontally so that its right bound (in the parent coordinate frame) is equal to the passed-in
   * 'right' X value.
   *
   * NOTE: This may require computation of this node's subtree bounds, which may incur some performance loss.
   *
   * @param right - After this operation, node.right should approximately equal this value.
   */ setRight(right) {
        const currentRight = this.getRight();
        if (isFinite(currentRight)) {
            this.translate(right - currentRight, 0, true);
        }
        return this; // allow chaining
    }
    /**
   * See setRight() for more information
   */ set right(value) {
        this.setRight(value);
    }
    /**
   * See getRight() for more information
   */ get right() {
        return this.getRight();
    }
    /**
   * Returns the X value of the right side of the bounding box of this Node (in the parent coordinate frame).
   *
   * NOTE: This may require computation of this node's subtree bounds, which may incur some performance loss.
   */ getRight() {
        return this.getBounds().maxX;
    }
    /**
   * Shifts this Node horizontally so that its horizontal center (in the parent coordinate frame) is equal to the
   * passed-in center X value.
   *
   * NOTE: This may require computation of this node's subtree bounds, which may incur some performance loss.
   *
   * @param x - After this operation, node.centerX should approximately equal this value.
   */ setCenterX(x) {
        const currentCenterX = this.getCenterX();
        if (isFinite(currentCenterX)) {
            this.translate(x - currentCenterX, 0, true);
        }
        return this; // allow chaining
    }
    /**
   * See setCenterX() for more information
   */ set centerX(value) {
        this.setCenterX(value);
    }
    /**
   * See getCenterX() for more information
   */ get centerX() {
        return this.getCenterX();
    }
    /**
   * Returns the X value of this node's horizontal center (in the parent coordinate frame)
   *
   * NOTE: This may require computation of this node's subtree bounds, which may incur some performance loss.
   */ getCenterX() {
        return this.getBounds().getCenterX();
    }
    /**
   * Shifts this Node vertically so that its vertical center (in the parent coordinate frame) is equal to the
   * passed-in center Y value.
   *
   * NOTE: This may require computation of this node's subtree bounds, which may incur some performance loss.
   *
   * @param y - After this operation, node.centerY should approximately equal this value.
   */ setCenterY(y) {
        const currentCenterY = this.getCenterY();
        if (isFinite(currentCenterY)) {
            this.translate(0, y - currentCenterY, true);
        }
        return this; // allow chaining
    }
    /**
   * See setCenterY() for more information
   */ set centerY(value) {
        this.setCenterY(value);
    }
    /**
   * See getCenterX() for more information
   */ get centerY() {
        return this.getCenterY();
    }
    /**
   * Returns the Y value of this node's vertical center (in the parent coordinate frame)
   *
   * NOTE: This may require computation of this node's subtree bounds, which may incur some performance loss.
   */ getCenterY() {
        return this.getBounds().getCenterY();
    }
    /**
   * Shifts this Node vertically so that its top (in the parent coordinate frame) is equal to the passed-in Y value.
   *
   * NOTE: top is the lowest Y value in our bounds.
   * NOTE: This may require computation of this node's subtree bounds, which may incur some performance loss.
   *
   * @param top - After this operation, node.top should approximately equal this value.
   */ setTop(top) {
        const currentTop = this.getTop();
        if (isFinite(currentTop)) {
            this.translate(0, top - currentTop, true);
        }
        return this; // allow chaining
    }
    /**
   * See setTop() for more information
   */ set top(value) {
        this.setTop(value);
    }
    /**
   * See getTop() for more information
   */ get top() {
        return this.getTop();
    }
    /**
   * Returns the lowest Y value of this node's bounding box (in the parent coordinate frame).
   *
   * NOTE: This may require computation of this node's subtree bounds, which may incur some performance loss.
   */ getTop() {
        return this.getBounds().minY;
    }
    /**
   * Shifts this Node vertically so that its bottom (in the parent coordinate frame) is equal to the passed-in Y value.
   *
   * NOTE: bottom is the highest Y value in our bounds.
   * NOTE: This may require computation of this node's subtree bounds, which may incur some performance loss.
   *
   * @param bottom - After this operation, node.bottom should approximately equal this value.
   */ setBottom(bottom) {
        const currentBottom = this.getBottom();
        if (isFinite(currentBottom)) {
            this.translate(0, bottom - currentBottom, true);
        }
        return this; // allow chaining
    }
    /**
   * See setBottom() for more information
   */ set bottom(value) {
        this.setBottom(value);
    }
    /**
   * See getBottom() for more information
   */ get bottom() {
        return this.getBottom();
    }
    /**
   * Returns the highest Y value of this node's bounding box (in the parent coordinate frame).
   *
   * NOTE: This may require computation of this node's subtree bounds, which may incur some performance loss.
   */ getBottom() {
        return this.getBounds().maxY;
    }
    /*
   * Convenience locations
   *
   * Upper is in terms of the visual layout in Scenery and other programs, so the minY is the "upper", and minY is the "lower"
   *
   *             left (x)     centerX        right
   *          ---------------------------------------
   * top  (y) | leftTop     centerTop     rightTop
   * centerY  | leftCenter  center        rightCenter
   * bottom   | leftBottom  centerBottom  rightBottom
   *
   * NOTE: This requires computation of this node's subtree bounds, which may incur some performance loss.
   */ /**
   * Sets the position of the upper-left corner of this node's bounds to the specified point.
   */ setLeftTop(leftTop) {
        assert && assert(leftTop.isFinite(), 'leftTop should be a finite Vector2');
        const currentLeftTop = this.getLeftTop();
        if (currentLeftTop.isFinite()) {
            this.translate(leftTop.minus(currentLeftTop), true);
        }
        return this;
    }
    /**
   * See setLeftTop() for more information
   */ set leftTop(value) {
        this.setLeftTop(value);
    }
    /**
   * See getLeftTop() for more information
   */ get leftTop() {
        return this.getLeftTop();
    }
    /**
   * Returns the upper-left corner of this node's bounds.
   */ getLeftTop() {
        return this.getBounds().getLeftTop();
    }
    /**
   * Sets the position of the center-top location of this node's bounds to the specified point.
   */ setCenterTop(centerTop) {
        assert && assert(centerTop.isFinite(), 'centerTop should be a finite Vector2');
        const currentCenterTop = this.getCenterTop();
        if (currentCenterTop.isFinite()) {
            this.translate(centerTop.minus(currentCenterTop), true);
        }
        return this;
    }
    /**
   * See setCenterTop() for more information
   */ set centerTop(value) {
        this.setCenterTop(value);
    }
    /**
   * See getCenterTop() for more information
   */ get centerTop() {
        return this.getCenterTop();
    }
    /**
   * Returns the center-top location of this node's bounds.
   */ getCenterTop() {
        return this.getBounds().getCenterTop();
    }
    /**
   * Sets the position of the upper-right corner of this node's bounds to the specified point.
   */ setRightTop(rightTop) {
        assert && assert(rightTop.isFinite(), 'rightTop should be a finite Vector2');
        const currentRightTop = this.getRightTop();
        if (currentRightTop.isFinite()) {
            this.translate(rightTop.minus(currentRightTop), true);
        }
        return this;
    }
    /**
   * See setRightTop() for more information
   */ set rightTop(value) {
        this.setRightTop(value);
    }
    /**
   * See getRightTop() for more information
   */ get rightTop() {
        return this.getRightTop();
    }
    /**
   * Returns the upper-right corner of this node's bounds.
   */ getRightTop() {
        return this.getBounds().getRightTop();
    }
    /**
   * Sets the position of the center-left of this node's bounds to the specified point.
   */ setLeftCenter(leftCenter) {
        assert && assert(leftCenter.isFinite(), 'leftCenter should be a finite Vector2');
        const currentLeftCenter = this.getLeftCenter();
        if (currentLeftCenter.isFinite()) {
            this.translate(leftCenter.minus(currentLeftCenter), true);
        }
        return this;
    }
    /**
   * See setLeftCenter() for more information
   */ set leftCenter(value) {
        this.setLeftCenter(value);
    }
    /**
   * See getLeftCenter() for more information
   */ get leftCenter() {
        return this.getLeftCenter();
    }
    /**
   * Returns the center-left corner of this node's bounds.
   */ getLeftCenter() {
        return this.getBounds().getLeftCenter();
    }
    /**
   * Sets the center of this node's bounds to the specified point.
   */ setCenter(center) {
        assert && assert(center.isFinite(), 'center should be a finite Vector2');
        const currentCenter = this.getCenter();
        if (currentCenter.isFinite()) {
            this.translate(center.minus(currentCenter), true);
        }
        return this;
    }
    /**
   * See setCenter() for more information
   */ set center(value) {
        this.setCenter(value);
    }
    /**
   * See getCenter() for more information
   */ get center() {
        return this.getCenter();
    }
    /**
   * Returns the center of this node's bounds.
   */ getCenter() {
        return this.getBounds().getCenter();
    }
    /**
   * Sets the position of the center-right of this node's bounds to the specified point.
   */ setRightCenter(rightCenter) {
        assert && assert(rightCenter.isFinite(), 'rightCenter should be a finite Vector2');
        const currentRightCenter = this.getRightCenter();
        if (currentRightCenter.isFinite()) {
            this.translate(rightCenter.minus(currentRightCenter), true);
        }
        return this;
    }
    /**
   * See setRightCenter() for more information
   */ set rightCenter(value) {
        this.setRightCenter(value);
    }
    /**
   * See getRightCenter() for more information
   */ get rightCenter() {
        return this.getRightCenter();
    }
    /**
   * Returns the center-right of this node's bounds.
   */ getRightCenter() {
        return this.getBounds().getRightCenter();
    }
    /**
   * Sets the position of the lower-left corner of this node's bounds to the specified point.
   */ setLeftBottom(leftBottom) {
        assert && assert(leftBottom.isFinite(), 'leftBottom should be a finite Vector2');
        const currentLeftBottom = this.getLeftBottom();
        if (currentLeftBottom.isFinite()) {
            this.translate(leftBottom.minus(currentLeftBottom), true);
        }
        return this;
    }
    /**
   * See setLeftBottom() for more information
   */ set leftBottom(value) {
        this.setLeftBottom(value);
    }
    /**
   * See getLeftBottom() for more information
   */ get leftBottom() {
        return this.getLeftBottom();
    }
    /**
   * Returns the lower-left corner of this node's bounds.
   */ getLeftBottom() {
        return this.getBounds().getLeftBottom();
    }
    /**
   * Sets the position of the center-bottom of this node's bounds to the specified point.
   */ setCenterBottom(centerBottom) {
        assert && assert(centerBottom.isFinite(), 'centerBottom should be a finite Vector2');
        const currentCenterBottom = this.getCenterBottom();
        if (currentCenterBottom.isFinite()) {
            this.translate(centerBottom.minus(currentCenterBottom), true);
        }
        return this;
    }
    /**
   * See setCenterBottom() for more information
   */ set centerBottom(value) {
        this.setCenterBottom(value);
    }
    /**
   * See getCenterBottom() for more information
   */ get centerBottom() {
        return this.getCenterBottom();
    }
    /**
   * Returns the center-bottom of this node's bounds.
   */ getCenterBottom() {
        return this.getBounds().getCenterBottom();
    }
    /**
   * Sets the position of the lower-right corner of this node's bounds to the specified point.
   */ setRightBottom(rightBottom) {
        assert && assert(rightBottom.isFinite(), 'rightBottom should be a finite Vector2');
        const currentRightBottom = this.getRightBottom();
        if (currentRightBottom.isFinite()) {
            this.translate(rightBottom.minus(currentRightBottom), true);
        }
        return this;
    }
    /**
   * See setRightBottom() for more information
   */ set rightBottom(value) {
        this.setRightBottom(value);
    }
    /**
   * See getRightBottom() for more information
   */ get rightBottom() {
        return this.getRightBottom();
    }
    /**
   * Returns the lower-right corner of this node's bounds.
   */ getRightBottom() {
        return this.getBounds().getRightBottom();
    }
    /**
   * Returns the width of this node's bounding box (in the parent coordinate frame).
   *
   * NOTE: This may require computation of this node's subtree bounds, which may incur some performance loss.
   */ getWidth() {
        return this.getBounds().getWidth();
    }
    /**
   * See getWidth() for more information
   */ get width() {
        return this.getWidth();
    }
    /**
   * Returns the height of this node's bounding box (in the parent coordinate frame).
   *
   * NOTE: This may require computation of this node's subtree bounds, which may incur some performance loss.
   */ getHeight() {
        return this.getBounds().getHeight();
    }
    /**
   * See getHeight() for more information
   */ get height() {
        return this.getHeight();
    }
    /**
   * Returns the width of this node's bounding box (in the local coordinate frame).
   *
   * NOTE: This may require computation of this node's subtree bounds, which may incur some performance loss.
   */ getLocalWidth() {
        return this.getLocalBounds().getWidth();
    }
    /**
   * See getLocalWidth() for more information
   */ get localWidth() {
        return this.getLocalWidth();
    }
    /**
   * Returns the height of this node's bounding box (in the local coordinate frame).
   *
   * NOTE: This may require computation of this node's subtree bounds, which may incur some performance loss.
   */ getLocalHeight() {
        return this.getLocalBounds().getHeight();
    }
    /**
   * See getLocalHeight() for more information
   */ get localHeight() {
        return this.getLocalHeight();
    }
    /**
   * Returns the X value of the left side of the bounding box of this Node (in the local coordinate frame).
   *
   * NOTE: This may require computation of this node's subtree bounds, which may incur some performance loss.
   */ getLocalLeft() {
        return this.getLocalBounds().minX;
    }
    /**
   * See getLeft() for more information
   */ get localLeft() {
        return this.getLocalLeft();
    }
    /**
   * Returns the X value of the right side of the bounding box of this Node (in the local coordinate frame).
   *
   * NOTE: This may require computation of this node's subtree bounds, which may incur some performance loss.
   */ getLocalRight() {
        return this.getLocalBounds().maxX;
    }
    /**
   * See getRight() for more information
   */ get localRight() {
        return this.getLocalRight();
    }
    /**
   * Returns the X value of this node's horizontal center (in the local coordinate frame)
   *
   * NOTE: This may require computation of this node's subtree bounds, which may incur some performance loss.
   */ getLocalCenterX() {
        return this.getLocalBounds().getCenterX();
    }
    /**
   * See getCenterX() for more information
   */ get localCenterX() {
        return this.getLocalCenterX();
    }
    /**
   * Returns the Y value of this node's vertical center (in the local coordinate frame)
   *
   * NOTE: This may require computation of this node's subtree bounds, which may incur some performance loss.
   */ getLocalCenterY() {
        return this.getLocalBounds().getCenterY();
    }
    /**
   * See getCenterX() for more information
   */ get localCenterY() {
        return this.getLocalCenterY();
    }
    /**
   * Returns the lowest Y value of this node's bounding box (in the local coordinate frame).
   *
   * NOTE: This may require computation of this node's subtree bounds, which may incur some performance loss.
   */ getLocalTop() {
        return this.getLocalBounds().minY;
    }
    /**
   * See getTop() for more information
   */ get localTop() {
        return this.getLocalTop();
    }
    /**
   * Returns the highest Y value of this node's bounding box (in the local coordinate frame).
   *
   * NOTE: This may require computation of this node's subtree bounds, which may incur some performance loss.
   */ getLocalBottom() {
        return this.getLocalBounds().maxY;
    }
    /**
   * See getLocalBottom() for more information
   */ get localBottom() {
        return this.getLocalBottom();
    }
    /**
   * Returns the upper-left corner of this node's localBounds.
   */ getLocalLeftTop() {
        return this.getLocalBounds().getLeftTop();
    }
    /**
   * See getLocalLeftTop() for more information
   */ get localLeftTop() {
        return this.getLocalLeftTop();
    }
    /**
   * Returns the center-top location of this node's localBounds.
   */ getLocalCenterTop() {
        return this.getLocalBounds().getCenterTop();
    }
    /**
   * See getLocalCenterTop() for more information
   */ get localCenterTop() {
        return this.getLocalCenterTop();
    }
    /**
   * Returns the upper-right corner of this node's localBounds.
   */ getLocalRightTop() {
        return this.getLocalBounds().getRightTop();
    }
    /**
   * See getLocalRightTop() for more information
   */ get localRightTop() {
        return this.getLocalRightTop();
    }
    /**
   * Returns the center-left corner of this node's localBounds.
   */ getLocalLeftCenter() {
        return this.getLocalBounds().getLeftCenter();
    }
    /**
   * See getLocalLeftCenter() for more information
   */ get localLeftCenter() {
        return this.getLocalLeftCenter();
    }
    /**
   * Returns the center of this node's localBounds.
   */ getLocalCenter() {
        return this.getLocalBounds().getCenter();
    }
    /**
   * See getLocalCenter() for more information
   */ get localCenter() {
        return this.getLocalCenter();
    }
    /**
   * Returns the center-right of this node's localBounds.
   */ getLocalRightCenter() {
        return this.getLocalBounds().getRightCenter();
    }
    /**
   * See getLocalRightCenter() for more information
   */ get localRightCenter() {
        return this.getLocalRightCenter();
    }
    /**
   * Returns the lower-left corner of this node's localBounds.
   */ getLocalLeftBottom() {
        return this.getLocalBounds().getLeftBottom();
    }
    /**
   * See getLocalLeftBottom() for more information
   */ get localLeftBottom() {
        return this.getLocalLeftBottom();
    }
    /**
   * Returns the center-bottom of this node's localBounds.
   */ getLocalCenterBottom() {
        return this.getLocalBounds().getCenterBottom();
    }
    /**
   * See getLocalCenterBottom() for more information
   */ get localCenterBottom() {
        return this.getLocalCenterBottom();
    }
    /**
   * Returns the lower-right corner of this node's localBounds.
   */ getLocalRightBottom() {
        return this.getLocalBounds().getRightBottom();
    }
    /**
   * See getLocalRightBottom() for more information
   */ get localRightBottom() {
        return this.getLocalRightBottom();
    }
    /**
   * Returns the unique integral ID for this node.
   */ getId() {
        return this._id;
    }
    /**
   * See getId() for more information
   */ get id() {
        return this.getId();
    }
    /**
   * Called when our visibility Property changes values.
   */ onVisiblePropertyChange(visible) {
        // Interrupt the subtree when made invisible by default, see https://github.com/phetsims/scenery/issues/1645
        if (!visible && this._interruptSubtreeOnInvisible) {
            this.interruptSubtreeInput();
        }
        // changing visibility can affect pickability pruning, which affects mouse/touch bounds
        this._picker.onVisibilityChange();
        if (assertSlow) {
            this._picker.audit();
        }
        // Defined in ParallelDOM.js
        this._pdomDisplaysInfo.onVisibilityChange(visible);
        for(let i = 0; i < this._parents.length; i++){
            const parent = this._parents[i];
            if (parent._excludeInvisibleChildrenFromBounds) {
                parent.invalidateChildBounds();
            }
        }
    }
    /**
   * Sets what Property our visibleProperty is backed by, so that changes to this provided Property will change this
   * Node's visibility, and vice versa. This does not change this._visibleProperty. See TinyForwardingProperty.setTargetProperty()
   * for more info.
   *
   * NOTE For PhET-iO use:
   * All PhET-iO instrumented Nodes create their own instrumented visibleProperty (if one is not passed in as
   * an option). Once a Node's visibleProperty has been registered with PhET-iO, it cannot be "swapped out" for another.
   * If you need to "delay" setting an instrumented visibleProperty to this node, pass phetioVisiblePropertyInstrumented
   * to instrumentation call to this Node (where Tandem is provided).
   */ setVisibleProperty(newTarget) {
        return this._visibleProperty.setTargetProperty(newTarget, this, VISIBLE_PROPERTY_TANDEM_NAME);
    }
    /**
   * See setVisibleProperty() for more information
   */ set visibleProperty(property) {
        this.setVisibleProperty(property);
    }
    /**
   * See getVisibleProperty() for more information
   */ get visibleProperty() {
        return this.getVisibleProperty();
    }
    /**
   * Get this Node's visibleProperty. Note! This is not the reciprocal of setVisibleProperty. Node.prototype._visibleProperty
   * is a TinyForwardingProperty, and is set up to listen to changes from the visibleProperty provided by
   * setVisibleProperty(), but the underlying reference does not change. This means the following:
   *     * const myNode = new Node();
   * const visibleProperty = new Property( false );
   * myNode.setVisibleProperty( visibleProperty )
   * => myNode.getVisibleProperty() !== visibleProperty (!!!!!!)
   *
   * Please use this with caution. See setVisibleProperty() for more information.
   */ getVisibleProperty() {
        return this._visibleProperty;
    }
    /**
   * Sets whether this Node is visible.  DO NOT override this as a way of adding additional behavior when a Node's
   * visibility changes, add a listener to this.visibleProperty instead.
   */ setVisible(visible) {
        this.visibleProperty.set(visible);
        return this;
    }
    /**
   * See setVisible() for more information
   */ set visible(value) {
        this.setVisible(value);
    }
    /**
   * See isVisible() for more information
   */ get visible() {
        return this.isVisible();
    }
    /**
   * Returns whether this Node is visible.
   */ isVisible() {
        return this.visibleProperty.value;
    }
    /**
   * Use this to automatically create a forwarded, PhET-iO instrumented visibleProperty internal to Node.
   */ setPhetioVisiblePropertyInstrumented(phetioVisiblePropertyInstrumented) {
        return this._visibleProperty.setTargetPropertyInstrumented(phetioVisiblePropertyInstrumented, this);
    }
    /**
   * See setPhetioVisiblePropertyInstrumented() for more information
   */ set phetioVisiblePropertyInstrumented(value) {
        this.setPhetioVisiblePropertyInstrumented(value);
    }
    /**
   * See getPhetioVisiblePropertyInstrumented() for more information
   */ get phetioVisiblePropertyInstrumented() {
        return this.getPhetioVisiblePropertyInstrumented();
    }
    getPhetioVisiblePropertyInstrumented() {
        return this._visibleProperty.getTargetPropertyInstrumented();
    }
    /**
   * Swap the visibility of this node with another node. The Node that is made visible will receive keyboard focus
   * if it is focusable and the previously visible Node had focus.
   */ swapVisibility(otherNode) {
        assert && assert(this.visible !== otherNode.visible);
        const visibleNode = this.visible ? this : otherNode;
        const invisibleNode = this.visible ? otherNode : this;
        // if the visible node has focus we will restore focus on the invisible Node once it is visible
        const visibleNodeFocused = visibleNode.focused;
        visibleNode.visible = false;
        invisibleNode.visible = true;
        if (visibleNodeFocused && invisibleNode.focusable) {
            invisibleNode.focus();
        }
        return this; // allow chaining
    }
    /**
   * Sets the opacity of this Node (and its sub-tree), where 0 is fully transparent, and 1 is fully opaque.  Values
   * outside of that range throw an Error.
   * @throws Error if opacity out of range
   */ setOpacity(opacity) {
        assert && assert(isFinite(opacity), 'opacity should be a finite number');
        if (opacity < 0 || opacity > 1) {
            throw new Error(`opacity out of range: ${opacity}`);
        }
        this.opacityProperty.value = opacity;
    }
    /**
   * See setOpacity() for more information
   */ set opacity(value) {
        this.setOpacity(value);
    }
    /**
   * See getOpacity() for more information
   */ get opacity() {
        return this.getOpacity();
    }
    /**
   * Returns the opacity of this node.
   */ getOpacity() {
        return this.opacityProperty.value;
    }
    /**
   * Sets the disabledOpacity of this Node (and its sub-tree), where 0 is fully transparent, and 1 is fully opaque.
   * Values outside of that range throw an Error.
   * @throws Error if disabledOpacity out of range
   */ setDisabledOpacity(disabledOpacity) {
        assert && assert(isFinite(disabledOpacity), 'disabledOpacity should be a finite number');
        if (disabledOpacity < 0 || disabledOpacity > 1) {
            throw new Error(`disabledOpacity out of range: ${disabledOpacity}`);
        }
        this.disabledOpacityProperty.value = disabledOpacity;
        return this;
    }
    /**
   * See setDisabledOpacity() for more information
   */ set disabledOpacity(value) {
        this.setDisabledOpacity(value);
    }
    /**
   * See getDisabledOpacity() for more information
   */ get disabledOpacity() {
        return this.getDisabledOpacity();
    }
    /**
   * Returns the disabledOpacity of this node.
   */ getDisabledOpacity() {
        return this.disabledOpacityProperty.value;
    }
    /**
   * Returns the opacity actually applied to the node.
   */ getEffectiveOpacity() {
        return this.opacityProperty.value * (this.enabledProperty.value ? 1 : this.disabledOpacityProperty.value);
    }
    /**
   * See getDisabledOpacity() for more information
   */ get effectiveOpacity() {
        return this.getEffectiveOpacity();
    }
    /**
   * Called when our opacity or other filter changes values
   */ onOpacityPropertyChange() {
        this.filterChangeEmitter.emit();
    }
    /**
   * Called when our opacity or other filter changes values
   */ onDisabledOpacityPropertyChange() {
        if (!this._enabledProperty.value) {
            this.filterChangeEmitter.emit();
        }
    }
    /**
   * Sets the non-opacity filters for this Node.
   *
   * The default is an empty array (no filters). It should be an array of Filter objects, which will be effectively
   * applied in-order on this Node (and its subtree), and will be applied BEFORE opacity/clipping.
   *
   * NOTE: Some filters may decrease performance (and this may be platform-specific). Please read documentation for each
   * filter before using.
   *
   * Typical filter types to use are:
   * - Brightness
   * - Contrast
   * - DropShadow (EXPERIMENTAL)
   * - GaussianBlur (EXPERIMENTAL)
   * - Grayscale (Grayscale.FULL for the full effect)
   * - HueRotate
   * - Invert (Invert.FULL for the full effect)
   * - Saturate
   * - Sepia (Sepia.FULL for the full effect)
   *
   * Filter.js has more information in general on filters.
   */ setFilters(filters) {
        assert && assert(Array.isArray(filters), 'filters should be an array');
        assert && assert(_.every(filters, (filter)=>filter instanceof Filter), 'filters should consist of Filter objects only');
        // We re-use the same array internally, so we don't reference a potentially-mutable array from outside.
        this._filters.length = 0;
        this._filters.push(...filters);
        this.invalidateHint();
        this.filterChangeEmitter.emit();
    }
    /**
   * See setFilters() for more information
   */ set filters(value) {
        this.setFilters(value);
    }
    /**
   * See getFilters() for more information
   */ get filters() {
        return this.getFilters();
    }
    /**
   * Returns the non-opacity filters for this Node.
   */ getFilters() {
        return this._filters.slice();
    }
    /**
   * Sets what Property our pickableProperty is backed by, so that changes to this provided Property will change this
   * Node's pickability, and vice versa. This does not change this._pickableProperty. See TinyForwardingProperty.setTargetProperty()
   * for more info.
   *
   * PhET-iO Instrumented Nodes do not by default create their own instrumented pickableProperty, even though Node.visibleProperty does.
   */ setPickableProperty(newTarget) {
        return this._pickableProperty.setTargetProperty(newTarget, this, null);
    }
    /**
   * See setPickableProperty() for more information
   */ set pickableProperty(property) {
        this.setPickableProperty(property);
    }
    /**
   * See getPickableProperty() for more information
   */ get pickableProperty() {
        return this.getPickableProperty();
    }
    /**
   * Get this Node's pickableProperty. Note! This is not the reciprocal of setPickableProperty. Node.prototype._pickableProperty
   * is a TinyForwardingProperty, and is set up to listen to changes from the pickableProperty provided by
   * setPickableProperty(), but the underlying reference does not change. This means the following:
   * const myNode = new Node();
   * const pickableProperty = new Property( false );
   * myNode.setPickableProperty( pickableProperty )
   * => myNode.getPickableProperty() !== pickableProperty (!!!!!!)
   *
   * Please use this with caution. See setPickableProperty() for more information.
   */ getPickableProperty() {
        return this._pickableProperty;
    }
    /**
   * Sets whether this Node (and its subtree) will allow hit-testing (and thus user interaction), controlling what
   * Trail is returned from node.trailUnderPoint().
   *
   * Pickable can take one of three values:
   * - null: (default) pass-through behavior. Hit-testing will prune this subtree if there are no
   *         ancestors/descendants with either pickable: true set or with any input listeners.
   * - false: Hit-testing is pruned, nothing in this node or its subtree will respond to events or be picked.
   * - true: Hit-testing will not be pruned in this subtree, except for pickable: false cases.
   *
   * Hit testing is accomplished mainly with node.trailUnderPointer() and node.trailUnderPoint(), following the
   * above rules. Nodes that are not pickable (pruned) will not have input events targeted to them.
   *
   * The following rules (applied in the given order) determine whether a Node (really, a Trail) will receive input events:
   * 1. If the node or one of its ancestors has pickable: false OR is invisible, the Node *will not* receive events
   *    or hit testing.
   * 2. If the Node or one of its ancestors or descendants is pickable: true OR has an input listener attached, it
   *    *will* receive events or hit testing.
   * 3. Otherwise, it *will not* receive events or hit testing.
   *
   * This is useful for semi-transparent overlays or other visual elements that should be displayed but should not
   * prevent objects below from being manipulated by user input, and the default null value is used to increase
   * performance by ignoring areas that don't need user input.
   *
   * NOTE: If you want something to be picked "mouse is over it", but block input events even if there are listeners,
   *       then pickable:false is not appropriate, and inputEnabled:false is preferred.
   *
   * For a visual example of how pickability interacts with input listeners and visibility, see the notes at the
   * bottom of http://phetsims.github.io/scenery/doc/implementation-notes, or scenery/assets/pickability.svg.
   */ setPickable(pickable) {
        assert && assert(pickable === null || typeof pickable === 'boolean');
        this._pickableProperty.set(pickable);
        return this;
    }
    /**
   * See setPickable() for more information
   */ set pickable(value) {
        this.setPickable(value);
    }
    /**
   * See isPickable() for more information
   */ get pickable() {
        return this.isPickable();
    }
    /**
   * Returns the pickability of this node.
   */ isPickable() {
        return this._pickableProperty.value;
    }
    /**
   * Called when our pickableProperty changes values.
   */ onPickablePropertyChange(pickable, oldPickable) {
        this._picker.onPickableChange(oldPickable, pickable);
        if (assertSlow) {
            this._picker.audit();
        }
    // TODO: invalidate the cursor somehow? #150
    }
    /**
   * Sets what Property our enabledProperty is backed by, so that changes to this provided Property will change this
   * Node's enabled, and vice versa. This does not change this._enabledProperty. See TinyForwardingProperty.setTargetProperty()
   * for more info.
   *
   *
   * NOTE For PhET-iO use:
   * All PhET-iO instrumented Nodes create their own instrumented enabledProperty (if one is not passed in as
   * an option). Once a Node's enabledProperty has been registered with PhET-iO, it cannot be "swapped out" for another.
   * If you need to "delay" setting an instrumented enabledProperty to this node, pass phetioEnabledPropertyInstrumented
   * to instrumentation call to this Node (where Tandem is provided).
   */ setEnabledProperty(newTarget) {
        return this._enabledProperty.setTargetProperty(newTarget, this, ENABLED_PROPERTY_TANDEM_NAME);
    }
    /**
   * See setEnabledProperty() for more information
   */ set enabledProperty(property) {
        this.setEnabledProperty(property);
    }
    /**
   * See getEnabledProperty() for more information
   */ get enabledProperty() {
        return this.getEnabledProperty();
    }
    /**
   * Get this Node's enabledProperty. Note! This is not the reciprocal of setEnabledProperty. Node.prototype._enabledProperty
   * is a TinyForwardingProperty, and is set up to listen to changes from the enabledProperty provided by
   * setEnabledProperty(), but the underlying reference does not change. This means the following:
   * const myNode = new Node();
   * const enabledProperty = new Property( false );
   * myNode.setEnabledProperty( enabledProperty )
   * => myNode.getEnabledProperty() !== enabledProperty (!!!!!!)
   *
   * Please use this with caution. See setEnabledProperty() for more information.
   */ getEnabledProperty() {
        return this._enabledProperty;
    }
    /**
   * Use this to automatically create a forwarded, PhET-iO instrumented enabledProperty internal to Node. This is different
   * from visible because enabled by default doesn't not create this forwarded Property.
   */ setPhetioEnabledPropertyInstrumented(phetioEnabledPropertyInstrumented) {
        return this._enabledProperty.setTargetPropertyInstrumented(phetioEnabledPropertyInstrumented, this);
    }
    /**
   * See setPhetioEnabledPropertyInstrumented() for more information
   */ set phetioEnabledPropertyInstrumented(value) {
        this.setPhetioEnabledPropertyInstrumented(value);
    }
    /**
   * See getPhetioEnabledPropertyInstrumented() for more information
   */ get phetioEnabledPropertyInstrumented() {
        return this.getPhetioEnabledPropertyInstrumented();
    }
    getPhetioEnabledPropertyInstrumented() {
        return this._enabledProperty.getTargetPropertyInstrumented();
    }
    /**
   * Sets whether this Node is enabled
   */ setEnabled(enabled) {
        assert && assert(enabled === null || typeof enabled === 'boolean');
        this._enabledProperty.set(enabled);
        return this;
    }
    /**
   * See setEnabled() for more information
   */ set enabled(value) {
        this.setEnabled(value);
    }
    /**
   * See isEnabled() for more information
   */ get enabled() {
        return this.isEnabled();
    }
    /**
   * Returns the enabled of this node.
   */ isEnabled() {
        return this._enabledProperty.value;
    }
    /**
   * Called when enabledProperty changes values.
   * - override this to change the behavior of enabled
   */ onEnabledPropertyChange(enabled) {
        !enabled && this.interruptSubtreeInput();
        // We don't want to overstep here if inputEnabledProperty has been set elsewhere to be a DerivedProperty.
        if (this.inputEnabledProperty.isSettable()) {
            this.inputEnabled = enabled;
        }
        // 1 means "no different than the current, enabled opacity", see this.getEffectiveOpacity()
        if (this.disabledOpacityProperty.value !== 1) {
            this.filterChangeEmitter.emit();
        }
    }
    /**
   * Sets what Property our inputEnabledProperty is backed by, so that changes to this provided Property will change this whether this
   * Node's input is enabled, and vice versa. This does not change this._inputEnabledProperty. See TinyForwardingProperty.setTargetProperty()
   * for more info.
   *
   * NOTE For PhET-iO use:
   * All PhET-iO instrumented Nodes create their own instrumented inputEnabledProperty (if one is not passed in as
   * an option). Once a Node's inputEnabledProperty has been registered with PhET-iO, it cannot be "swapped out" for another.
   * If you need to "delay" setting an instrumented inputEnabledProperty to this node, pass phetioInputEnabledPropertyInstrumented
   * to instrumentation call to this Node (where Tandem is provided).
   */ setInputEnabledProperty(newTarget) {
        return this._inputEnabledProperty.setTargetProperty(newTarget, this, INPUT_ENABLED_PROPERTY_TANDEM_NAME);
    }
    /**
   * See setInputEnabledProperty() for more information
   */ set inputEnabledProperty(property) {
        this.setInputEnabledProperty(property);
    }
    /**
   * See getInputEnabledProperty() for more information
   */ get inputEnabledProperty() {
        return this.getInputEnabledProperty();
    }
    /**
   * Get this Node's inputEnabledProperty. Note! This is not the reciprocal of setInputEnabledProperty. Node.prototype._inputEnabledProperty
   * is a TinyForwardingProperty, and is set up to listen to changes from the inputEnabledProperty provided by
   * setInputEnabledProperty(), but the underlying reference does not change. This means the following:
   * const myNode = new Node();
   * const inputEnabledProperty = new Property( false );
   * myNode.setInputEnabledProperty( inputEnabledProperty )
   * => myNode.getInputEnabledProperty() !== inputEnabledProperty (!!!!!!)
   *
   * Please use this with caution. See setInputEnabledProperty() for more information.
   */ getInputEnabledProperty() {
        return this._inputEnabledProperty;
    }
    /**
   * Use this to automatically create a forwarded, PhET-iO instrumented inputEnabledProperty internal to Node. This is different
   * from visible because inputEnabled by default doesn't not create this forwarded Property.
   */ setPhetioInputEnabledPropertyInstrumented(phetioInputEnabledPropertyInstrumented) {
        return this._inputEnabledProperty.setTargetPropertyInstrumented(phetioInputEnabledPropertyInstrumented, this);
    }
    /**
   * See setPhetioInputEnabledPropertyInstrumented() for more information
   */ set phetioInputEnabledPropertyInstrumented(value) {
        this.setPhetioInputEnabledPropertyInstrumented(value);
    }
    /**
   * See getPhetioInputEnabledPropertyInstrumented() for more information
   */ get phetioInputEnabledPropertyInstrumented() {
        return this.getPhetioInputEnabledPropertyInstrumented();
    }
    getPhetioInputEnabledPropertyInstrumented() {
        return this._inputEnabledProperty.getTargetPropertyInstrumented();
    }
    /**
   * Sets whether input is enabled for this Node and its subtree. If false, input event listeners will not be fired
   * on this Node or its descendants in the picked Trail. This does NOT effect picking (what Trail/nodes are under
   * a pointer), but only effects what listeners are fired.
   *
   * Additionally, this will affect cursor behavior. If inputEnabled=false, descendants of this Node will not be
   * checked when determining what cursor will be shown. Instead, if a pointer (e.g. mouse) is over a descendant,
   * this Node's cursor will be checked first, then ancestors will be checked as normal.
   */ setInputEnabled(inputEnabled) {
        this.inputEnabledProperty.value = inputEnabled;
    }
    /**
   * See setInputEnabled() for more information
   */ set inputEnabled(value) {
        this.setInputEnabled(value);
    }
    /**
   * See isInputEnabled() for more information
   */ get inputEnabled() {
        return this.isInputEnabled();
    }
    /**
   * Returns whether input is enabled for this Node and its subtree. See setInputEnabled for more documentation.
   */ isInputEnabled() {
        return this.inputEnabledProperty.value;
    }
    /**
   * Sets all of the input listeners attached to this Node.
   *
   * This is equivalent to removing all current input listeners with removeInputListener() and adding all new
   * listeners (in order) with addInputListener().
   */ setInputListeners(inputListeners) {
        assert && assert(Array.isArray(inputListeners));
        // Remove all old input listeners
        while(this._inputListeners.length){
            this.removeInputListener(this._inputListeners[0]);
        }
        // Add in all new input listeners
        for(let i = 0; i < inputListeners.length; i++){
            this.addInputListener(inputListeners[i]);
        }
        return this;
    }
    /**
   * See setInputListeners() for more information
   */ set inputListeners(value) {
        this.setInputListeners(value);
    }
    /**
   * See getInputListeners() for more information
   */ get inputListeners() {
        return this.getInputListeners();
    }
    /**
   * Returns a copy of all of our input listeners.
   */ getInputListeners() {
        return this._inputListeners.slice(0); // defensive copy
    }
    /**
   * Sets the CSS cursor string that should be used when the mouse is over this node. null is the default, and
   * indicates that ancestor nodes (or the browser default) should be used.
   *
   * @param cursor - A CSS cursor string, like 'pointer', or 'none' - Examples are:
   * auto default none inherit help pointer progress wait crosshair text vertical-text alias copy move no-drop not-allowed
   * e-resize n-resize w-resize s-resize nw-resize ne-resize se-resize sw-resize ew-resize ns-resize nesw-resize nwse-resize
   * context-menu cell col-resize row-resize all-scroll url( ... ) --> does it support data URLs?
   */ setCursor(cursor) {
        // TODO: consider a mapping of types to set reasonable defaults https://github.com/phetsims/scenery/issues/1581
        // allow the 'auto' cursor type to let the ancestors or scene pick the cursor type
        this._cursor = cursor === 'auto' ? null : cursor;
    }
    /**
   * See setCursor() for more information
   */ set cursor(value) {
        this.setCursor(value);
    }
    /**
   * See getCursor() for more information
   */ get cursor() {
        return this.getCursor();
    }
    /**
   * Returns the CSS cursor string for this node, or null if there is no cursor specified.
   */ getCursor() {
        return this._cursor;
    }
    /**
   * Returns the CSS cursor that could be applied either by this Node itself, or from any of its input listeners'
   * preferences. (scenery-internal)
   */ getEffectiveCursor() {
        if (this._cursor) {
            return this._cursor;
        }
        for(let i = 0; i < this._inputListeners.length; i++){
            const inputListener = this._inputListeners[i];
            if (inputListener.cursor) {
                return inputListener.cursor;
            }
        }
        return null;
    }
    /**
   * Sets the hit-tested mouse area for this Node (see constructor for more advanced documentation). Use null for the
   * default behavior.
   */ setMouseArea(area) {
        assert && assert(area === null || area instanceof Shape || area instanceof Bounds2, 'mouseArea needs to be a phet.kite.Shape, phet.dot.Bounds2, or null');
        if (this._mouseArea !== area) {
            this._mouseArea = area; // TODO: could change what is under the mouse, invalidate! https://github.com/phetsims/scenery/issues/1581
            this._picker.onMouseAreaChange();
            if (assertSlow) {
                this._picker.audit();
            }
        }
        return this;
    }
    /**
   * See setMouseArea() for more information
   */ set mouseArea(value) {
        this.setMouseArea(value);
    }
    /**
   * See getMouseArea() for more information
   */ get mouseArea() {
        return this.getMouseArea();
    }
    /**
   * Returns the hit-tested mouse area for this node.
   */ getMouseArea() {
        return this._mouseArea;
    }
    /**
   * Sets the hit-tested touch area for this Node (see constructor for more advanced documentation). Use null for the
   * default behavior.
   */ setTouchArea(area) {
        assert && assert(area === null || area instanceof Shape || area instanceof Bounds2, 'touchArea needs to be a phet.kite.Shape, phet.dot.Bounds2, or null');
        if (this._touchArea !== area) {
            this._touchArea = area; // TODO: could change what is under the touch, invalidate! https://github.com/phetsims/scenery/issues/1581
            this._picker.onTouchAreaChange();
            if (assertSlow) {
                this._picker.audit();
            }
        }
        return this;
    }
    /**
   * See setTouchArea() for more information
   */ set touchArea(value) {
        this.setTouchArea(value);
    }
    /**
   * See getTouchArea() for more information
   */ get touchArea() {
        return this.getTouchArea();
    }
    /**
   * Returns the hit-tested touch area for this node.
   */ getTouchArea() {
        return this._touchArea;
    }
    /**
   * Sets a clipped shape where only content in our local coordinate frame that is inside the clip area will be shown
   * (anything outside is fully transparent).
   */ setClipArea(shape) {
        assert && assert(shape === null || shape instanceof Shape, 'clipArea needs to be a phet.kite.Shape, or null');
        if (this.clipArea !== shape) {
            this.clipAreaProperty.value = shape;
            this.invalidateBounds();
            this._picker.onClipAreaChange();
            if (assertSlow) {
                this._picker.audit();
            }
        }
    }
    /**
   * See setClipArea() for more information
   */ set clipArea(value) {
        this.setClipArea(value);
    }
    /**
   * See getClipArea() for more information
   */ get clipArea() {
        return this.getClipArea();
    }
    /**
   * Returns the clipped area for this node.
   */ getClipArea() {
        return this.clipAreaProperty.value;
    }
    /**
   * Returns whether this Node has a clip area.
   */ hasClipArea() {
        return this.clipArea !== null;
    }
    /**
   * Sets what self renderers (and other bitmask flags) are supported by this node.
   */ setRendererBitmask(bitmask) {
        assert && assert(isFinite(bitmask));
        if (bitmask !== this._rendererBitmask) {
            this._rendererBitmask = bitmask;
            this._rendererSummary.selfChange();
            this.instanceRefreshEmitter.emit();
        }
    }
    /**
   * Meant to be overridden, so that it can be called to ensure that the renderer bitmask will be up-to-date.
   */ invalidateSupportedRenderers() {
    // see docs
    }
    /*---------------------------------------------------------------------------*
   * Hints
   *----------------------------------------------------------------------------*/ /**
   * When ANY hint changes, we refresh everything currently (for safety, this may be possible to make more specific
   * in the future, but hint changes are not particularly common performance bottleneck).
   */ invalidateHint() {
        this.rendererSummaryRefreshEmitter.emit();
        this.instanceRefreshEmitter.emit();
    }
    /**
   * Sets a preferred renderer for this Node and its sub-tree. Scenery will attempt to use this renderer under here
   * unless it isn't supported, OR another preferred renderer is set as a closer ancestor. Acceptable values are:
   * - null (default, no preference)
   * - 'canvas'
   * - 'svg'
   * - 'dom'
   * - 'webgl'
   */ setRenderer(renderer) {
        assert && assert(renderer === null || renderer === 'canvas' || renderer === 'svg' || renderer === 'dom' || renderer === 'webgl', 'Renderer input should be null, or one of: "canvas", "svg", "dom" or "webgl".');
        let newRenderer = 0;
        if (renderer === 'canvas') {
            newRenderer = Renderer.bitmaskCanvas;
        } else if (renderer === 'svg') {
            newRenderer = Renderer.bitmaskSVG;
        } else if (renderer === 'dom') {
            newRenderer = Renderer.bitmaskDOM;
        } else if (renderer === 'webgl') {
            newRenderer = Renderer.bitmaskWebGL;
        }
        assert && assert(renderer === null === (newRenderer === 0), 'We should only end up with no actual renderer if renderer is null');
        if (this._renderer !== newRenderer) {
            this._renderer = newRenderer;
            this.invalidateHint();
        }
    }
    /**
   * See setRenderer() for more information
   */ set renderer(value) {
        this.setRenderer(value);
    }
    /**
   * See getRenderer() for more information
   */ get renderer() {
        return this.getRenderer();
    }
    /**
   * Returns the preferred renderer (if any) of this node, as a string.
   */ getRenderer() {
        if (this._renderer === 0) {
            return null;
        } else if (this._renderer === Renderer.bitmaskCanvas) {
            return 'canvas';
        } else if (this._renderer === Renderer.bitmaskSVG) {
            return 'svg';
        } else if (this._renderer === Renderer.bitmaskDOM) {
            return 'dom';
        } else if (this._renderer === Renderer.bitmaskWebGL) {
            return 'webgl';
        }
        assert && assert(false, 'Seems to be an invalid renderer?');
        return null;
    }
    /**
   * Sets whether or not Scenery will try to put this Node (and its descendants) into a separate SVG/Canvas/WebGL/etc.
   * layer, different from other siblings or other nodes. Can be used for performance purposes.
   */ setLayerSplit(split) {
        if (split !== this._layerSplit) {
            this._layerSplit = split;
            this.invalidateHint();
        }
    }
    /**
   * See setLayerSplit() for more information
   */ set layerSplit(value) {
        this.setLayerSplit(value);
    }
    /**
   * See isLayerSplit() for more information
   */ get layerSplit() {
        return this.isLayerSplit();
    }
    /**
   * Returns whether the layerSplit performance flag is set.
   */ isLayerSplit() {
        return this._layerSplit;
    }
    /**
   * Sets whether or not Scenery will take into account that this Node plans to use opacity. Can have performance
   * gains if there need to be multiple layers for this node's descendants.
   */ setUsesOpacity(usesOpacity) {
        if (usesOpacity !== this._usesOpacity) {
            this._usesOpacity = usesOpacity;
            this.invalidateHint();
        }
    }
    /**
   * See setUsesOpacity() for more information
   */ set usesOpacity(value) {
        this.setUsesOpacity(value);
    }
    /**
   * See getUsesOpacity() for more information
   */ get usesOpacity() {
        return this.getUsesOpacity();
    }
    /**
   * Returns whether the usesOpacity performance flag is set.
   */ getUsesOpacity() {
        return this._usesOpacity;
    }
    /**
   * Sets a flag for whether whether the contents of this Node and its children should be displayed in a separate
   * DOM element that is transformed with CSS transforms. It can have potential speedups, since the browser may not
   * have to re-rasterize contents when it is animated.
   */ setCSSTransform(cssTransform) {
        if (cssTransform !== this._cssTransform) {
            this._cssTransform = cssTransform;
            this.invalidateHint();
        }
    }
    /**
   * See setCSSTransform() for more information
   */ set cssTransform(value) {
        this.setCSSTransform(value);
    }
    /**
   * See isCSSTransformed() for more information
   */ get cssTransform() {
        return this.isCSSTransformed();
    }
    /**
   * Returns whether the cssTransform performance flag is set.
   */ isCSSTransformed() {
        return this._cssTransform;
    }
    /**
   * Sets a performance flag for whether layers/DOM elements should be excluded (or included) when things are
   * invisible. The default is false, and invisible content is in the DOM, but hidden.
   */ setExcludeInvisible(excludeInvisible) {
        if (excludeInvisible !== this._excludeInvisible) {
            this._excludeInvisible = excludeInvisible;
            this.invalidateHint();
        }
    }
    /**
   * See setExcludeInvisible() for more information
   */ set excludeInvisible(value) {
        this.setExcludeInvisible(value);
    }
    /**
   * See isExcludeInvisible() for more information
   */ get excludeInvisible() {
        return this.isExcludeInvisible();
    }
    /**
   * Returns whether the excludeInvisible performance flag is set.
   */ isExcludeInvisible() {
        return this._excludeInvisible;
    }
    /**
   * If this is set to true, child nodes that are invisible will NOT contribute to the bounds of this node.
   *
   * The default is for child nodes bounds' to be included in this node's bounds, but that would in general be a
   * problem for layout containers or other situations, see https://github.com/phetsims/joist/issues/608.
   */ setExcludeInvisibleChildrenFromBounds(excludeInvisibleChildrenFromBounds) {
        if (excludeInvisibleChildrenFromBounds !== this._excludeInvisibleChildrenFromBounds) {
            this._excludeInvisibleChildrenFromBounds = excludeInvisibleChildrenFromBounds;
            this.invalidateBounds();
        }
    }
    /**
   * See setExcludeInvisibleChildrenFromBounds() for more information
   */ set excludeInvisibleChildrenFromBounds(value) {
        this.setExcludeInvisibleChildrenFromBounds(value);
    }
    /**
   * See isExcludeInvisibleChildrenFromBounds() for more information
   */ get excludeInvisibleChildrenFromBounds() {
        return this.isExcludeInvisibleChildrenFromBounds();
    }
    /**
   * Returns whether the excludeInvisibleChildrenFromBounds flag is set, see
   * setExcludeInvisibleChildrenFromBounds() for documentation.
   */ isExcludeInvisibleChildrenFromBounds() {
        return this._excludeInvisibleChildrenFromBounds;
    }
    /**
   * If this is set to true, this node will call interruptSubtreeInput() on itself when it is made invisible.
   * See https://github.com/phetsims/scenery/issues/1645.
   */ setInterruptSubtreeOnInvisible(interruptSubtreeOnInvisible) {
        if (interruptSubtreeOnInvisible !== this._interruptSubtreeOnInvisible) {
            this._interruptSubtreeOnInvisible = interruptSubtreeOnInvisible;
        }
    }
    /**
   * See setInterruptSubtreeOnInvisible() for more information
   */ set interruptSubtreeOnInvisible(value) {
        this.setInterruptSubtreeOnInvisible(value);
    }
    /**
   * See isInterruptSubtreeOnInvisible() for more information
   */ get interruptSubtreeOnInvisible() {
        return this.isInterruptSubtreeOnInvisible();
    }
    /**
   * Returns whether the interruptSubtreeOnInvisible flag is set, see
   * setInterruptSubtreeOnInvisible() for documentation.
   */ isInterruptSubtreeOnInvisible() {
        return this._interruptSubtreeOnInvisible;
    }
    /**
   * Sets options that are provided to layout managers in order to customize positioning of this node.
   */ setLayoutOptions(layoutOptions) {
        assert && assert(layoutOptions === null || typeof layoutOptions === 'object' && Object.getPrototypeOf(layoutOptions) === Object.prototype, 'layoutOptions should be null or an plain options-style object');
        if (layoutOptions !== this._layoutOptions) {
            this._layoutOptions = layoutOptions;
            this.layoutOptionsChangedEmitter.emit();
        }
    }
    set layoutOptions(value) {
        this.setLayoutOptions(value);
    }
    get layoutOptions() {
        return this.getLayoutOptions();
    }
    getLayoutOptions() {
        return this._layoutOptions;
    }
    mutateLayoutOptions(layoutOptions) {
        this.layoutOptions = optionize3()({}, this.layoutOptions || {}, layoutOptions);
    }
    // Defaults indicating that we don't mix in WidthSizable/HeightSizable
    get widthSizable() {
        return false;
    }
    get heightSizable() {
        return false;
    }
    get extendsWidthSizable() {
        return false;
    }
    get extendsHeightSizable() {
        return false;
    }
    get extendsSizable() {
        return false;
    }
    /**
   * Sets the preventFit performance flag.
   */ setPreventFit(preventFit) {
        if (preventFit !== this._preventFit) {
            this._preventFit = preventFit;
            this.invalidateHint();
        }
    }
    /**
   * See setPreventFit() for more information
   */ set preventFit(value) {
        this.setPreventFit(value);
    }
    /**
   * See isPreventFit() for more information
   */ get preventFit() {
        return this.isPreventFit();
    }
    /**
   * Returns whether the preventFit performance flag is set.
   */ isPreventFit() {
        return this._preventFit;
    }
    /**
   * Sets whether there is a custom WebGL scale applied to the Canvas, and if so what scale.
   */ setWebGLScale(webglScale) {
        assert && assert(webglScale === null || typeof webglScale === 'number' && isFinite(webglScale));
        if (webglScale !== this._webglScale) {
            this._webglScale = webglScale;
            this.invalidateHint();
        }
    }
    /**
   * See setWebGLScale() for more information
   */ set webglScale(value) {
        this.setWebGLScale(value);
    }
    /**
   * See getWebGLScale() for more information
   */ get webglScale() {
        return this.getWebGLScale();
    }
    /**
   * Returns the value of the webglScale performance flag.
   */ getWebGLScale() {
        return this._webglScale;
    }
    /*---------------------------------------------------------------------------*
   * Trail operations
   *----------------------------------------------------------------------------*/ /**
   * Returns the one Trail that starts from a node with no parents (or if the predicate is present, a Node that
   * satisfies it), and ends at this node. If more than one Trail would satisfy these conditions, an assertion is
   * thrown (please use getTrails() for those cases).
   *
   * @param [predicate] - If supplied, we will only return trails rooted at a Node that satisfies predicate( node ) == true
   */ getUniqueTrail(predicate) {
        // Without a predicate, we'll be able to bail out the instant we hit a Node with 2+ parents, and it makes the
        // logic easier.
        if (!predicate) {
            const trail = new Trail();
            // eslint-disable-next-line @typescript-eslint/no-this-alias
            let node = this; // eslint-disable-line consistent-this
            while(node){
                assert && assert(node._parents.length <= 1, `getUniqueTrail found a Node with ${node._parents.length} parents.`);
                trail.addAncestor(node);
                node = node._parents[0]; // should be undefined if there aren't any parents
            }
            return trail;
        } else {
            const trails = this.getTrails(predicate);
            assert && assert(trails.length === 1, `getUniqueTrail found ${trails.length} matching trails for the predicate`);
            return trails[0];
        }
    }
    /**
   * Returns a Trail rooted at rootNode and ends at this node. Throws an assertion if the number of trails that match
   * this condition isn't exactly 1.
   */ getUniqueTrailTo(rootNode) {
        return this.getUniqueTrail((node)=>rootNode === node);
    }
    /**
   * Returns an array of all Trails that start from nodes with no parent (or if a predicate is present, those that
   * satisfy the predicate), and ends at this node.
   *
   * @param [predicate] - If supplied, we will only return Trails rooted at nodes that satisfy predicate( node ) == true.
   */ getTrails(predicate) {
        predicate = predicate || Node.defaultTrailPredicate;
        const trails = [];
        const trail = new Trail(this);
        Trail.appendAncestorTrailsWithPredicate(trails, trail, predicate);
        return trails;
    }
    /**
   * Returns an array of all Trails rooted at rootNode and end at this node.
   */ getTrailsTo(rootNode) {
        return this.getTrails((node)=>node === rootNode);
    }
    /**
   * Returns an array of all Trails rooted at this Node and end with nodes with no children (or if a predicate is
   * present, those that satisfy the predicate).
   *
   * @param [predicate] - If supplied, we will only return Trails ending at nodes that satisfy predicate( node ) == true.
   */ getLeafTrails(predicate) {
        predicate = predicate || Node.defaultLeafTrailPredicate;
        const trails = [];
        const trail = new Trail(this);
        Trail.appendDescendantTrailsWithPredicate(trails, trail, predicate);
        return trails;
    }
    /**
   * Returns an array of all Trails rooted at this Node and end with leafNode.
   */ getLeafTrailsTo(leafNode) {
        return this.getLeafTrails((node)=>node === leafNode);
    }
    /**
   * Returns a Trail rooted at this node and ending at a Node that has no children (or if a predicate is provided, a
   * Node that satisfies the predicate). If more than one trail matches this description, an assertion will be fired.
   *
   * @param [predicate] - If supplied, we will return a Trail that ends with a Node that satisfies predicate( node ) == true
   */ getUniqueLeafTrail(predicate) {
        const trails = this.getLeafTrails(predicate);
        assert && assert(trails.length === 1, `getUniqueLeafTrail found ${trails.length} matching trails for the predicate`);
        return trails[0];
    }
    /**
   * Returns a Trail rooted at this Node and ending at leafNode. If more than one trail matches this description,
   * an assertion will be fired.
   */ getUniqueLeafTrailTo(leafNode) {
        return this.getUniqueLeafTrail((node)=>node === leafNode);
    }
    /**
   * Returns all nodes in the connected component, returned in an arbitrary order, including nodes that are ancestors
   * of this node.
   */ getConnectedNodes() {
        const result = [];
        let fresh = this._children.concat(this._parents).concat(this);
        while(fresh.length){
            const node = fresh.pop();
            if (!_.includes(result, node)) {
                result.push(node);
                fresh = fresh.concat(node._children, node._parents);
            }
        }
        return result;
    }
    /**
   * Returns all nodes in the subtree with this Node as its root, returned in an arbitrary order. Like
   * getConnectedNodes, but doesn't include parents.
   */ getSubtreeNodes() {
        const result = [];
        let fresh = this._children.concat(this);
        while(fresh.length){
            const node = fresh.pop();
            if (!_.includes(result, node)) {
                result.push(node);
                fresh = fresh.concat(node._children);
            }
        }
        return result;
    }
    /**
   * Returns all nodes that are connected to this node, sorted in topological order.
   */ getTopologicallySortedNodes() {
        // see http://en.wikipedia.org/wiki/Topological_sorting
        const edges = {};
        const s = [];
        const l = [];
        let n;
        _.each(this.getConnectedNodes(), (node)=>{
            edges[node.id] = {};
            _.each(node._children, (m)=>{
                edges[node.id][m.id] = true;
            });
            if (!node.parents.length) {
                s.push(node);
            }
        });
        function handleChild(m) {
            delete edges[n.id][m.id];
            if (_.every(edges, (children)=>!children[m.id])) {
                // there are no more edges to m
                s.push(m);
            }
        }
        while(s.length){
            n = s.pop();
            l.push(n);
            _.each(n._children, handleChild);
        }
        // ensure that there are no edges left, since then it would contain a circular reference
        assert && assert(_.every(edges, (children)=>_.every(children, (final)=>false)), 'circular reference check');
        return l;
    }
    /**
   * Returns whether this.addChild( child ) will not cause circular references.
   */ canAddChild(child) {
        if (this === child || _.includes(this._children, child)) {
            return false;
        }
        // see http://en.wikipedia.org/wiki/Topological_sorting
        // TODO: remove duplication with above handling? https://github.com/phetsims/scenery/issues/1581
        const edges = {};
        const s = [];
        const l = [];
        let n;
        _.each(this.getConnectedNodes().concat(child.getConnectedNodes()), (node)=>{
            edges[node.id] = {};
            _.each(node._children, (m)=>{
                edges[node.id][m.id] = true;
            });
            if (!node.parents.length && node !== child) {
                s.push(node);
            }
        });
        edges[this.id][child.id] = true; // add in our 'new' edge
        function handleChild(m) {
            delete edges[n.id][m.id];
            if (_.every(edges, (children)=>!children[m.id])) {
                // there are no more edges to m
                s.push(m);
            }
        }
        while(s.length){
            n = s.pop();
            l.push(n);
            _.each(n._children, handleChild);
            // handle our new edge
            if (n === this) {
                handleChild(child);
            }
        }
        // ensure that there are no edges left, since then it would contain a circular reference
        return _.every(edges, (children)=>_.every(children, (final)=>false));
    }
    /**
   * To be overridden in paintable Node types. Should hook into the drawable's prototype (presumably).
   *
   * Draws the current Node's self representation, assuming the wrapper's Canvas context is already in the local
   * coordinate frame of this node.
   *
   * @param wrapper
   * @param matrix - The transformation matrix already applied to the context.
   */ canvasPaintSelf(wrapper, matrix) {
    // See subclass for implementation
    }
    /**
   * Renders this Node only (its self) into the Canvas wrapper, in its local coordinate frame.
   *
   * @param wrapper
   * @param matrix - The transformation matrix already applied to the context.
   */ renderToCanvasSelf(wrapper, matrix) {
        if (this.isPainted() && this._rendererBitmask & Renderer.bitmaskCanvas) {
            this.canvasPaintSelf(wrapper, matrix);
        }
    }
    /**
   * Renders this Node and its descendants into the Canvas wrapper.
   *
   * @param wrapper
   * @param [matrix] - Optional transform to be applied
   */ renderToCanvasSubtree(wrapper, matrix) {
        matrix = matrix || Matrix3.identity();
        wrapper.resetStyles();
        this.renderToCanvasSelf(wrapper, matrix);
        for(let i = 0; i < this._children.length; i++){
            const child = this._children[i];
            // Ignore invalid (empty) bounds, since this would show nothing (and we couldn't compute fitted bounds for it).
            if (child.isVisible() && child.bounds.isValid()) {
                // For anything filter-like, we'll need to create a Canvas, render our child's content into that Canvas,
                // and then (applying the filter) render that into the Canvas provided.
                const requiresScratchCanvas = child.effectiveOpacity !== 1 || child.clipArea || child._filters.length;
                wrapper.context.save();
                matrix.multiplyMatrix(child._transform.getMatrix());
                matrix.canvasSetTransform(wrapper.context);
                if (requiresScratchCanvas) {
                    // We'll attempt to fit the Canvas to the content to minimize memory use, see
                    // https://github.com/phetsims/function-builder/issues/148
                    // We're going to ignore content outside our wrapper context's canvas.
                    // Added padding and round-out for cases where Canvas bounds might not be fully accurate
                    // The matrix already includes the child's transform (so we use localBounds).
                    // We won't go outside our parent canvas' bounds, since this would be a waste of memory (wouldn't be written)
                    // The round-out will make sure we have pixel alignment, so that we won't get blurs or aliasing/blitting
                    // effects when copying things over.
                    const childCanvasBounds = child.localBounds.transformed(matrix).dilate(4).roundOut().constrainBounds(scratchBounds2Extra.setMinMax(0, 0, wrapper.canvas.width, wrapper.canvas.height));
                    if (childCanvasBounds.width > 0 && childCanvasBounds.height > 0) {
                        const canvas = document.createElement('canvas');
                        // We'll set our Canvas to the fitted width, and will handle the offsets below.
                        canvas.width = childCanvasBounds.width;
                        canvas.height = childCanvasBounds.height;
                        const context = canvas.getContext('2d');
                        const childWrapper = new CanvasContextWrapper(canvas, context);
                        // After our ancestor transform is applied, we'll need to apply another offset for fitted Canvas. We'll
                        // need to pass this to descendants AND apply it to the sub-context.
                        const subMatrix = matrix.copy().prependTranslation(-childCanvasBounds.minX, -childCanvasBounds.minY);
                        subMatrix.canvasSetTransform(context);
                        child.renderToCanvasSubtree(childWrapper, subMatrix);
                        wrapper.context.save();
                        if (child.clipArea) {
                            wrapper.context.beginPath();
                            child.clipArea.writeToContext(wrapper.context);
                            wrapper.context.clip();
                        }
                        wrapper.context.setTransform(1, 0, 0, 1, 0, 0); // identity
                        wrapper.context.globalAlpha = child.effectiveOpacity;
                        let setFilter = false;
                        if (child._filters.length) {
                            // Filters shouldn't be too often, so less concerned about the GC here (and this is so much easier to read).
                            // Performance bottleneck for not using this fallback style, so we're allowing it for Chrome even though
                            // the visual differences may be present, see https://github.com/phetsims/scenery/issues/1139
                            if (Features.canvasFilter && _.every(child._filters, (filter)=>filter.isDOMCompatible())) {
                                wrapper.context.filter = child._filters.map((filter)=>filter.getCSSFilterString()).join(' ');
                                setFilter = true;
                            } else {
                                child._filters.forEach((filter)=>filter.applyCanvasFilter(childWrapper));
                            }
                        }
                        // The inverse transform is applied to handle fitting
                        wrapper.context.drawImage(canvas, childCanvasBounds.minX, childCanvasBounds.minY);
                        wrapper.context.restore();
                        if (setFilter) {
                            wrapper.context.filter = 'none';
                        }
                    }
                } else {
                    child.renderToCanvasSubtree(wrapper, matrix);
                }
                matrix.multiplyMatrix(child._transform.getInverse());
                wrapper.context.restore();
            }
        }
    }
    /**
   * @deprecated
   * Render this Node to the Canvas (clearing it first)
   */ renderToCanvas(canvas, context, callback, backgroundColor) {
        assert && deprecationWarning('Node.renderToCanvas() is deprecated, please use Node.rasterized() instead');
        // should basically reset everything (and clear the Canvas)
        canvas.width = canvas.width; // eslint-disable-line no-self-assign
        if (backgroundColor) {
            context.fillStyle = backgroundColor;
            context.fillRect(0, 0, canvas.width, canvas.height);
        }
        const wrapper = new CanvasContextWrapper(canvas, context);
        this.renderToCanvasSubtree(wrapper, Matrix3.identity());
        callback && callback(); // this was originally asynchronous, so we had a callback
    }
    /**
   * Renders this Node to an HTMLCanvasElement. If toCanvas( callback ) is used, the canvas will contain the node's
   * entire bounds (if no x/y/width/height is provided)
   *
   * @param callback - callback( canvas, x, y, width, height ) is called, where x,y are computed if not specified.
   * @param [x] - The X offset for where the upper-left of the content drawn into the Canvas
   * @param [y] - The Y offset for where the upper-left of the content drawn into the Canvas
   * @param [width] - The width of the Canvas output
   * @param [height] - The height of the Canvas output
   */ toCanvas(callback, x, y, width, height) {
        assert && assert(x === undefined || typeof x === 'number', 'If provided, x should be a number');
        assert && assert(y === undefined || typeof y === 'number', 'If provided, y should be a number');
        assert && assert(width === undefined || typeof width === 'number' && width >= 0 && width % 1 === 0, 'If provided, width should be a non-negative integer');
        assert && assert(height === undefined || typeof height === 'number' && height >= 0 && height % 1 === 0, 'If provided, height should be a non-negative integer');
        const padding = 2; // padding used if x and y are not set
        // for now, we add an unpleasant hack around Text and safe bounds in general. We don't want to add another Bounds2 object per Node for now.
        const bounds = this.getBounds().union(this.localToParentBounds(this.getSafeSelfBounds()));
        assert && assert(!bounds.isEmpty() || x !== undefined && y !== undefined && width !== undefined && height !== undefined, 'Should not call toCanvas on a Node with empty bounds, unless all dimensions are provided');
        x = x !== undefined ? x : Math.ceil(padding - bounds.minX);
        y = y !== undefined ? y : Math.ceil(padding - bounds.minY);
        width = width !== undefined ? width : Math.ceil(bounds.getWidth() + 2 * padding);
        height = height !== undefined ? height : Math.ceil(bounds.getHeight() + 2 * padding);
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const context = canvas.getContext('2d');
        // shift our rendering over by the desired amount
        context.translate(x, y);
        // for API compatibility, we apply our own transform here
        this._transform.getMatrix().canvasAppendTransform(context);
        const wrapper = new CanvasContextWrapper(canvas, context);
        this.renderToCanvasSubtree(wrapper, Matrix3.translation(x, y).timesMatrix(this._transform.getMatrix()));
        callback(canvas, x, y, width, height); // we used to be asynchronous
    }
    /**
   * Renders this Node to a Canvas, then calls the callback with the data URI from it.
   *
   * @param callback - callback( dataURI {string}, x, y, width, height ) is called, where x,y are computed if not specified.
   * @param [x] - The X offset for where the upper-left of the content drawn into the Canvas
   * @param [y] - The Y offset for where the upper-left of the content drawn into the Canvas
   * @param [width] - The width of the Canvas output
   * @param [height] - The height of the Canvas output
   */ toDataURL(callback, x, y, width, height) {
        assert && assert(x === undefined || typeof x === 'number', 'If provided, x should be a number');
        assert && assert(y === undefined || typeof y === 'number', 'If provided, y should be a number');
        assert && assert(width === undefined || typeof width === 'number' && width >= 0 && width % 1 === 0, 'If provided, width should be a non-negative integer');
        assert && assert(height === undefined || typeof height === 'number' && height >= 0 && height % 1 === 0, 'If provided, height should be a non-negative integer');
        this.toCanvas((canvas, x, y, width, height)=>{
            // this x and y shadow the outside parameters, and will be different if the outside parameters are undefined
            callback(canvas.toDataURL(), x, y, width, height);
        }, x, y, width, height);
    }
    /**
   * Calls the callback with an HTMLImageElement that contains this Node's subtree's visual form.
   * Will always be asynchronous.
   * @deprecated - Use node.rasterized() for creating a rasterized copy, or generally it's best to get the data
   *               URL instead directly.
   *
   * @param callback - callback( image {HTMLImageElement}, x, y ) is called
   * @param [x] - The X offset for where the upper-left of the content drawn into the Canvas
   * @param [y] - The Y offset for where the upper-left of the content drawn into the Canvas
   * @param [width] - The width of the Canvas output
   * @param [height] - The height of the Canvas output
   */ toImage(callback, x, y, width, height) {
        assert && deprecationWarning('Node.toImage() is deprecated, please use Node.rasterized() instead');
        assert && assert(x === undefined || typeof x === 'number', 'If provided, x should be a number');
        assert && assert(y === undefined || typeof y === 'number', 'If provided, y should be a number');
        assert && assert(width === undefined || typeof width === 'number' && width >= 0 && width % 1 === 0, 'If provided, width should be a non-negative integer');
        assert && assert(height === undefined || typeof height === 'number' && height >= 0 && height % 1 === 0, 'If provided, height should be a non-negative integer');
        this.toDataURL((url, x, y)=>{
            // this x and y shadow the outside parameters, and will be different if the outside parameters are undefined
            const img = document.createElement('img');
            img.onload = ()=>{
                callback(img, x, y);
                try {
                    // @ts-expect-error - I believe we need to delete this
                    delete img.onload;
                } catch (e) {
                // do nothing
                } // fails on Safari 5.1
            };
            img.src = url;
        }, x, y, width, height);
    }
    /**
   * Calls the callback with an Image Node that contains this Node's subtree's visual form. This is always
   * asynchronous, but the resulting image Node can be used with any back-end (Canvas/WebGL/SVG/etc.)
   * @deprecated - Use node.rasterized() instead (should avoid the asynchronous-ness)
   *
   * @param callback - callback( imageNode {Image} ) is called
   * @param [x] - The X offset for where the upper-left of the content drawn into the Canvas
   * @param [y] - The Y offset for where the upper-left of the content drawn into the Canvas
   * @param [width] - The width of the Canvas output
   * @param [height] - The height of the Canvas output
   */ toImageNodeAsynchronous(callback, x, y, width, height) {
        assert && deprecationWarning('Node.toImageNodeAsyncrhonous() is deprecated, please use Node.rasterized() instead');
        assert && assert(x === undefined || typeof x === 'number', 'If provided, x should be a number');
        assert && assert(y === undefined || typeof y === 'number', 'If provided, y should be a number');
        assert && assert(width === undefined || typeof width === 'number' && width >= 0 && width % 1 === 0, 'If provided, width should be a non-negative integer');
        assert && assert(height === undefined || typeof height === 'number' && height >= 0 && height % 1 === 0, 'If provided, height should be a non-negative integer');
        this.toImage((image, x, y)=>{
            callback(new Node({
                children: [
                    new Image(image, {
                        x: -x,
                        y: -y
                    })
                ]
            }));
        }, x, y, width, height);
    }
    /**
   * Creates a Node containing an Image Node that contains this Node's subtree's visual form. This is always
   * synchronous, but the resulting image Node can ONLY used with Canvas/WebGL (NOT SVG).
   * @deprecated - Use node.rasterized() instead, should be mostly equivalent if useCanvas:true is provided.
   *
   * @param [x] - The X offset for where the upper-left of the content drawn into the Canvas
   * @param [y] - The Y offset for where the upper-left of the content drawn into the Canvas
   * @param [width] - The width of the Canvas output
   * @param [height] - The height of the Canvas output
   */ toCanvasNodeSynchronous(x, y, width, height) {
        assert && deprecationWarning('Node.toCanvasNodeSynchronous() is deprecated, please use Node.rasterized() instead');
        assert && assert(x === undefined || typeof x === 'number', 'If provided, x should be a number');
        assert && assert(y === undefined || typeof y === 'number', 'If provided, y should be a number');
        assert && assert(width === undefined || typeof width === 'number' && width >= 0 && width % 1 === 0, 'If provided, width should be a non-negative integer');
        assert && assert(height === undefined || typeof height === 'number' && height >= 0 && height % 1 === 0, 'If provided, height should be a non-negative integer');
        let result = null;
        this.toCanvas((canvas, x, y)=>{
            result = new Node({
                children: [
                    new Image(canvas, {
                        x: -x,
                        y: -y
                    })
                ]
            });
        }, x, y, width, height);
        assert && assert(result, 'toCanvasNodeSynchronous requires that the node can be rendered only using Canvas');
        return result;
    }
    /**
   * Returns an Image that renders this Node. This is always synchronous, and sets initialWidth/initialHeight so that
   * we have the bounds immediately.  Use this method if you need to reduce the number of parent Nodes.
   *
   * NOTE: the resultant Image should be positioned using its bounds rather than (x,y).  To create a Node that can be
   * positioned like any other node, please use toDataURLNodeSynchronous.
   * @deprecated - Use node.rasterized() instead, should be mostly equivalent if wrap:false is provided.
   *
   * @param [x] - The X offset for where the upper-left of the content drawn into the Canvas
   * @param [y] - The Y offset for where the upper-left of the content drawn into the Canvas
   * @param [width] - The width of the Canvas output
   * @param [height] - The height of the Canvas output
   */ toDataURLImageSynchronous(x, y, width, height) {
        assert && deprecationWarning('Node.toDataURLImageSychronous() is deprecated, please use Node.rasterized() instead');
        assert && assert(x === undefined || typeof x === 'number', 'If provided, x should be a number');
        assert && assert(y === undefined || typeof y === 'number', 'If provided, y should be a number');
        assert && assert(width === undefined || typeof width === 'number' && width >= 0 && width % 1 === 0, 'If provided, width should be a non-negative integer');
        assert && assert(height === undefined || typeof height === 'number' && height >= 0 && height % 1 === 0, 'If provided, height should be a non-negative integer');
        let result = null;
        this.toDataURL((dataURL, x, y, width, height)=>{
            result = new Image(dataURL, {
                x: -x,
                y: -y,
                initialWidth: width,
                initialHeight: height
            });
        }, x, y, width, height);
        assert && assert(result, 'toDataURL failed to return a result synchronously');
        return result;
    }
    /**
   * Returns a Node that contains this Node's subtree's visual form. This is always synchronous, and sets
   * initialWidth/initialHeight so that we have the bounds immediately.  An extra wrapper Node is provided
   * so that transforms can be done independently.  Use this method if you need to be able to transform the node
   * the same way as if it had not been rasterized.
   * @deprecated - Use node.rasterized() instead, should be mostly equivalent
   *
   * @param [x] - The X offset for where the upper-left of the content drawn into the Canvas
   * @param [y] - The Y offset for where the upper-left of the content drawn into the Canvas
   * @param [width] - The width of the Canvas output
   * @param [height] - The height of the Canvas output
   */ toDataURLNodeSynchronous(x, y, width, height) {
        assert && deprecationWarning('Node.toDataURLNodeSynchronous() is deprecated, please use Node.rasterized() instead');
        assert && assert(x === undefined || typeof x === 'number', 'If provided, x should be a number');
        assert && assert(y === undefined || typeof y === 'number', 'If provided, y should be a number');
        assert && assert(width === undefined || typeof width === 'number' && width >= 0 && width % 1 === 0, 'If provided, width should be a non-negative integer');
        assert && assert(height === undefined || typeof height === 'number' && height >= 0 && height % 1 === 0, 'If provided, height should be a non-negative integer');
        return new Node({
            children: [
                this.toDataURLImageSynchronous(x, y, width, height)
            ]
        });
    }
    /**
   * Returns a Node (backed by a scenery Image) that is a rasterized version of this node. See options, by default the
   * image is wrapped with a container Node.
   */ rasterized(providedOptions) {
        const options = optionize()({
            resolution: 1,
            sourceBounds: null,
            useTargetBounds: true,
            wrap: true,
            useCanvas: false,
            nodeOptions: {},
            imageOptions: {}
        }, providedOptions);
        const resolution = options.resolution;
        const sourceBounds = options.sourceBounds;
        if (assert) {
            assert(typeof resolution === 'number' && resolution > 0, 'resolution should be a positive number');
            assert(sourceBounds === null || sourceBounds instanceof Bounds2, 'sourceBounds should be null or a Bounds2');
            if (sourceBounds) {
                assert(sourceBounds.isValid(), 'sourceBounds should be valid (finite non-negative)');
                assert(Number.isInteger(sourceBounds.width), 'sourceBounds.width should be an integer');
                assert(Number.isInteger(sourceBounds.height), 'sourceBounds.height should be an integer');
            }
        }
        // We'll need to wrap it in a container Node temporarily (while rasterizing) for the scale
        const tempWrapperNode = new Node({
            scale: resolution,
            children: [
                this
            ]
        });
        let transformedBounds = sourceBounds || this.getSafeTransformedVisibleBounds().dilated(2).roundedOut();
        // Unfortunately if we provide a resolution AND bounds, we can't use the source bounds directly.
        if (resolution !== 1) {
            transformedBounds = new Bounds2(resolution * transformedBounds.minX, resolution * transformedBounds.minY, resolution * transformedBounds.maxX, resolution * transformedBounds.maxY);
            // Compensate for non-integral transformedBounds after our resolution transform
            if (transformedBounds.width % 1 !== 0) {
                transformedBounds.maxX += 1 - transformedBounds.width % 1;
            }
            if (transformedBounds.height % 1 !== 0) {
                transformedBounds.maxY += 1 - transformedBounds.height % 1;
            }
        }
        let imageOrNull = null;
        // NOTE: This callback is executed SYNCHRONOUSLY
        function callback(canvas, x, y, width, height) {
            const imageSource = options.useCanvas ? canvas : canvas.toDataURL();
            imageOrNull = new Image(imageSource, combineOptions({}, options.imageOptions, {
                x: -x,
                y: -y,
                initialWidth: width,
                initialHeight: height
            }));
            // We need to prepend the scale due to order of operations
            imageOrNull.scale(1 / resolution, 1 / resolution, true);
        }
        // NOTE: Rounding necessary due to floating point arithmetic in the width/height computation of the bounds
        tempWrapperNode.toCanvas(callback, -transformedBounds.minX, -transformedBounds.minY, Utils.roundSymmetric(transformedBounds.width), Utils.roundSymmetric(transformedBounds.height));
        assert && assert(imageOrNull, 'The toCanvas should have executed synchronously');
        const image = imageOrNull;
        tempWrapperNode.dispose();
        // For our useTargetBounds option, we do NOT want to include any "safe" bounds, and instead want to stay true to
        // the original bounds. We do filter out invisible subtrees to set the bounds.
        let finalParentBounds = this.getVisibleBounds();
        if (sourceBounds) {
            // If we provide sourceBounds, don't have resulting bounds that go outside.
            finalParentBounds = sourceBounds.intersection(finalParentBounds);
        }
        if (options.useTargetBounds) {
            image.imageBounds = image.parentToLocalBounds(finalParentBounds);
        }
        let returnNode;
        if (options.wrap) {
            const wrappedNode = new Node({
                children: [
                    image
                ]
            });
            if (options.useTargetBounds) {
                wrappedNode.localBounds = finalParentBounds;
            }
            returnNode = wrappedNode;
        } else {
            if (options.useTargetBounds) {
                image.localBounds = image.parentToLocalBounds(finalParentBounds);
            }
            returnNode = image;
        }
        return returnNode.mutate(options.nodeOptions);
    }
    /**
   * Creates a DOM drawable for this Node's self representation. (scenery-internal)
   *
   * Implemented by subtypes that support DOM self drawables. There is no need to implement this for subtypes that
   * do not allow the DOM renderer (not set in its rendererBitmask).
   *
   * @param renderer - In the bitmask format specified by Renderer, which may contain additional bit flags.
   * @param instance - Instance object that will be associated with the drawable
   */ createDOMDrawable(renderer, instance) {
        throw new Error('createDOMDrawable is abstract. The subtype should either override this method, or not support the DOM renderer');
    }
    /**
   * Creates an SVG drawable for this Node's self representation. (scenery-internal)
   *
   * Implemented by subtypes that support SVG self drawables. There is no need to implement this for subtypes that
   * do not allow the SVG renderer (not set in its rendererBitmask).
   *
   * @param renderer - In the bitmask format specified by Renderer, which may contain additional bit flags.
   * @param instance - Instance object that will be associated with the drawable
   */ createSVGDrawable(renderer, instance) {
        throw new Error('createSVGDrawable is abstract. The subtype should either override this method, or not support the DOM renderer');
    }
    /**
   * Creates a Canvas drawable for this Node's self representation. (scenery-internal)
   *
   * Implemented by subtypes that support Canvas self drawables. There is no need to implement this for subtypes that
   * do not allow the Canvas renderer (not set in its rendererBitmask).
   *
   * @param renderer - In the bitmask format specified by Renderer, which may contain additional bit flags.
   * @param instance - Instance object that will be associated with the drawable
   */ createCanvasDrawable(renderer, instance) {
        throw new Error('createCanvasDrawable is abstract. The subtype should either override this method, or not support the DOM renderer');
    }
    /**
   * Creates a WebGL drawable for this Node's self representation. (scenery-internal)
   *
   * Implemented by subtypes that support WebGL self drawables. There is no need to implement this for subtypes that
   * do not allow the WebGL renderer (not set in its rendererBitmask).
   *
   * @param renderer - In the bitmask format specified by Renderer, which may contain additional bit flags.
   * @param instance - Instance object that will be associated with the drawable
   */ createWebGLDrawable(renderer, instance) {
        throw new Error('createWebGLDrawable is abstract. The subtype should either override this method, or not support the DOM renderer');
    }
    /*---------------------------------------------------------------------------*
   * Instance handling
   *----------------------------------------------------------------------------*/ /**
   * Returns a reference to the instances array. (scenery-internal)
   */ getInstances() {
        return this._instances;
    }
    /**
   * See getInstances() for more information (scenery-internal)
   */ get instances() {
        return this.getInstances();
    }
    /**
   * Adds an Instance reference to our array. (scenery-internal)
   */ addInstance(instance) {
        this._instances.push(instance);
        this.changedInstanceEmitter.emit(instance, true);
    }
    /**
   * Removes an Instance reference from our array. (scenery-internal)
   */ removeInstance(instance) {
        const index = _.indexOf(this._instances, instance);
        assert && assert(index !== -1, 'Cannot remove a Instance from a Node if it was not there');
        this._instances.splice(index, 1);
        this.changedInstanceEmitter.emit(instance, false);
    }
    /**
   * Returns whether this Node was visually rendered/displayed by any Display in the last updateDisplay() call. Note
   * that something can be independently displayed visually, and in the PDOM; this method only checks visually.
   *
   * @param [display] - if provided, only check if was visible on this particular Display
   */ wasVisuallyDisplayed(display) {
        for(let i = 0; i < this._instances.length; i++){
            const instance = this._instances[i];
            // If no display is provided, any instance visibility is enough to be visually displayed
            if (instance.visible && (!display || instance.display === display)) {
                return true;
            }
        }
        return false;
    }
    /*---------------------------------------------------------------------------*
   * Display handling
   *----------------------------------------------------------------------------*/ /**
   * Returns a reference to the display array. (scenery-internal)
   */ getRootedDisplays() {
        return this._rootedDisplays;
    }
    /**
   * See getRootedDisplays() for more information (scenery-internal)
   */ get rootedDisplays() {
        return this.getRootedDisplays();
    }
    /**
   * Adds an display reference to our array. (scenery-internal)
   */ addRootedDisplay(display) {
        this._rootedDisplays.push(display);
        // Defined in ParallelDOM.js
        this._pdomDisplaysInfo.onAddedRootedDisplay(display);
        this.rootedDisplayChangedEmitter.emit(display);
    }
    /**
   * Removes a Display reference from our array. (scenery-internal)
   */ removeRootedDisplay(display) {
        const index = _.indexOf(this._rootedDisplays, display);
        assert && assert(index !== -1, 'Cannot remove a Display from a Node if it was not there');
        this._rootedDisplays.splice(index, 1);
        // Defined in ParallelDOM.js
        this._pdomDisplaysInfo.onRemovedRootedDisplay(display);
        this.rootedDisplayChangedEmitter.emit(display);
    }
    getRecursiveConnectedDisplays(displays) {
        if (this.rootedDisplays.length) {
            displays.push(...this.rootedDisplays);
        }
        for(let i = 0; i < this._parents.length; i++){
            displays.push(...this._parents[i].getRecursiveConnectedDisplays(displays));
        }
        // do not allow duplicate Displays to get collected infinitely
        return _.uniq(displays);
    }
    /**
   * Get a list of the displays that are connected to this Node. Gathered by looking up the scene graph ancestors and
   * collected all rooted Displays along the way.
   */ getConnectedDisplays() {
        return _.uniq(this.getRecursiveConnectedDisplays([]));
    }
    /*---------------------------------------------------------------------------*
   * Coordinate transform methods
   *----------------------------------------------------------------------------*/ /**
   * Returns a point transformed from our local coordinate frame into our parent coordinate frame. Applies our node's
   * transform to it.
   */ localToParentPoint(point) {
        return this._transform.transformPosition2(point);
    }
    /**
   * Returns bounds transformed from our local coordinate frame into our parent coordinate frame. If it includes a
   * rotation, the resulting bounding box will include every point that could have been in the original bounding box
   * (and it can be expanded).
   */ localToParentBounds(bounds) {
        return this._transform.transformBounds2(bounds);
    }
    /**
   * Returns a point transformed from our parent coordinate frame into our local coordinate frame. Applies the inverse
   * of our node's transform to it.
   */ parentToLocalPoint(point) {
        return this._transform.inversePosition2(point);
    }
    /**
   * Returns bounds transformed from our parent coordinate frame into our local coordinate frame. If it includes a
   * rotation, the resulting bounding box will include every point that could have been in the original bounding box
   * (and it can be expanded).
   */ parentToLocalBounds(bounds) {
        return this._transform.inverseBounds2(bounds);
    }
    /**
   * A mutable-optimized form of localToParentBounds() that will modify the provided bounds, transforming it from our
   * local coordinate frame to our parent coordinate frame.
   * @returns - The same bounds object.
   */ transformBoundsFromLocalToParent(bounds) {
        return bounds.transform(this._transform.getMatrix());
    }
    /**
   * A mutable-optimized form of parentToLocalBounds() that will modify the provided bounds, transforming it from our
   * parent coordinate frame to our local coordinate frame.
   * @returns - The same bounds object.
   */ transformBoundsFromParentToLocal(bounds) {
        return bounds.transform(this._transform.getInverse());
    }
    /**
   * Returns a new matrix (fresh copy) that would transform points from our local coordinate frame to the global
   * coordinate frame.
   *
   * NOTE: If there are multiple instances of this Node (e.g. this or one ancestor has two parents), it will fail
   * with an assertion (since the transform wouldn't be uniquely defined).
   */ getLocalToGlobalMatrix() {
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        let node = this; // eslint-disable-line consistent-this
        // we need to apply the transformations in the reverse order, so we temporarily store them
        const matrices = [];
        // concatenation like this has been faster than getting a unique trail, getting its transform, and applying it
        while(node){
            matrices.push(node._transform.getMatrix());
            assert && assert(node._parents[1] === undefined, 'getLocalToGlobalMatrix unable to work for DAG');
            node = node._parents[0];
        }
        const matrix = Matrix3.identity(); // will be modified in place
        // iterate from the back forwards (from the root Node to here)
        for(let i = matrices.length - 1; i >= 0; i--){
            matrix.multiplyMatrix(matrices[i]);
        }
        // NOTE: always return a fresh copy, getGlobalToLocalMatrix depends on it to minimize instance usage!
        return matrix;
    }
    /**
   * Returns a Transform3 that would transform things from our local coordinate frame to the global coordinate frame.
   * Equivalent to getUniqueTrail().getTransform(), but faster.
   *
   * NOTE: If there are multiple instances of this Node (e.g. this or one ancestor has two parents), it will fail
   * with an assertion (since the transform wouldn't be uniquely defined).
   */ getUniqueTransform() {
        return new Transform3(this.getLocalToGlobalMatrix());
    }
    /**
   * Returns a new matrix (fresh copy) that would transform points from the global coordinate frame to our local
   * coordinate frame.
   *
   * NOTE: If there are multiple instances of this Node (e.g. this or one ancestor has two parents), it will fail
   * with an assertion (since the transform wouldn't be uniquely defined).
   */ getGlobalToLocalMatrix() {
        return this.getLocalToGlobalMatrix().invert();
    }
    /**
   * Transforms a point from our local coordinate frame to the global coordinate frame.
   *
   * NOTE: If there are multiple instances of this Node (e.g. this or one ancestor has two parents), it will fail
   * with an assertion (since the transform wouldn't be uniquely defined).
   */ localToGlobalPoint(point) {
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        let node = this; // eslint-disable-line consistent-this
        const resultPoint = point.copy();
        while(node){
            // in-place multiplication
            node._transform.getMatrix().multiplyVector2(resultPoint);
            assert && assert(node._parents[1] === undefined, 'localToGlobalPoint unable to work for DAG');
            node = node._parents[0];
        }
        return resultPoint;
    }
    /**
   * Transforms a point from the global coordinate frame to our local coordinate frame.
   *
   * NOTE: If there are multiple instances of this Node (e.g. this or one ancestor has two parents), it will fail
   * with an assertion (since the transform wouldn't be uniquely defined).
   */ globalToLocalPoint(point) {
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        let node = this; // eslint-disable-line consistent-this
        // TODO: performance: test whether it is faster to get a total transform and then invert (won't compute individual inverses) https://github.com/phetsims/scenery/issues/1581
        // we need to apply the transformations in the reverse order, so we temporarily store them
        const transforms = [];
        while(node){
            transforms.push(node._transform);
            assert && assert(node._parents[1] === undefined, 'globalToLocalPoint unable to work for DAG');
            node = node._parents[0];
        }
        // iterate from the back forwards (from the root Node to here)
        const resultPoint = point.copy();
        for(let i = transforms.length - 1; i >= 0; i--){
            // in-place multiplication
            transforms[i].getInverse().multiplyVector2(resultPoint);
        }
        return resultPoint;
    }
    /**
   * Transforms bounds from our local coordinate frame to the global coordinate frame. If it includes a
   * rotation, the resulting bounding box will include every point that could have been in the original bounding box
   * (and it can be expanded).
   *
   * NOTE: If there are multiple instances of this Node (e.g. this or one ancestor has two parents), it will fail
   * with an assertion (since the transform wouldn't be uniquely defined).
   */ localToGlobalBounds(bounds) {
        // apply the bounds transform only once, so we can minimize the expansion encountered from multiple rotations
        // it also seems to be a bit faster this way
        return bounds.transformed(this.getLocalToGlobalMatrix());
    }
    /**
   * Transforms bounds from the global coordinate frame to our local coordinate frame. If it includes a
   * rotation, the resulting bounding box will include every point that could have been in the original bounding box
   * (and it can be expanded).
   *
   * NOTE: If there are multiple instances of this Node (e.g. this or one ancestor has two parents), it will fail
   * with an assertion (since the transform wouldn't be uniquely defined).
   */ globalToLocalBounds(bounds) {
        // apply the bounds transform only once, so we can minimize the expansion encountered from multiple rotations
        return bounds.transformed(this.getGlobalToLocalMatrix());
    }
    /**
   * Transforms a point from our parent coordinate frame to the global coordinate frame.
   *
   * NOTE: If there are multiple instances of this Node (e.g. this or one ancestor has two parents), it will fail
   * with an assertion (since the transform wouldn't be uniquely defined).
   */ parentToGlobalPoint(point) {
        assert && assert(this.parents.length <= 1, 'parentToGlobalPoint unable to work for DAG');
        return this.parents.length ? this.parents[0].localToGlobalPoint(point) : point;
    }
    /**
   * Transforms bounds from our parent coordinate frame to the global coordinate frame. If it includes a
   * rotation, the resulting bounding box will include every point that could have been in the original bounding box
   * (and it can be expanded).
   *
   * NOTE: If there are multiple instances of this Node (e.g. this or one ancestor has two parents), it will fail
   * with an assertion (since the transform wouldn't be uniquely defined).
   */ parentToGlobalBounds(bounds) {
        assert && assert(this.parents.length <= 1, 'parentToGlobalBounds unable to work for DAG');
        return this.parents.length ? this.parents[0].localToGlobalBounds(bounds) : bounds;
    }
    /**
   * Transforms a point from the global coordinate frame to our parent coordinate frame.
   *
   * NOTE: If there are multiple instances of this Node (e.g. this or one ancestor has two parents), it will fail
   * with an assertion (since the transform wouldn't be uniquely defined).
   */ globalToParentPoint(point) {
        assert && assert(this.parents.length <= 1, 'globalToParentPoint unable to work for DAG');
        return this.parents.length ? this.parents[0].globalToLocalPoint(point) : point;
    }
    /**
   * Transforms bounds from the global coordinate frame to our parent coordinate frame. If it includes a
   * rotation, the resulting bounding box will include every point that could have been in the original bounding box
   * (and it can be expanded).
   *
   * NOTE: If there are multiple instances of this Node (e.g. this or one ancestor has two parents), it will fail
   * with an assertion (since the transform wouldn't be uniquely defined).
   */ globalToParentBounds(bounds) {
        assert && assert(this.parents.length <= 1, 'globalToParentBounds unable to work for DAG');
        return this.parents.length ? this.parents[0].globalToLocalBounds(bounds) : bounds;
    }
    /**
   * Returns a bounding box for this Node (and its sub-tree) in the global coordinate frame.
   *
   * NOTE: If there are multiple instances of this Node (e.g. this or one ancestor has two parents), it will fail
   * with an assertion (since the transform wouldn't be uniquely defined).
   *
   * NOTE: This requires computation of this node's subtree bounds, which may incur some performance loss.
   */ getGlobalBounds() {
        assert && assert(this.parents.length <= 1, 'globalBounds unable to work for DAG');
        return this.parentToGlobalBounds(this.getBounds());
    }
    /**
   * See getGlobalBounds() for more information
   */ get globalBounds() {
        return this.getGlobalBounds();
    }
    /**
   * Returns the bounds of any other Node in our local coordinate frame.
   *
   * NOTE: If this node or the passed in Node have multiple instances (e.g. this or one ancestor has two parents), it will fail
   * with an assertion.
   *
   * TODO: Possible to be well-defined and have multiple instances of each. https://github.com/phetsims/scenery/issues/1581
   */ boundsOf(node) {
        return this.globalToLocalBounds(node.getGlobalBounds());
    }
    /**
   * Returns the bounds of this Node in another node's local coordinate frame.
   *
   * NOTE: If this node or the passed in Node have multiple instances (e.g. this or one ancestor has two parents), it will fail
   * with an assertion.
   *
   * TODO: Possible to be well-defined and have multiple instances of each. https://github.com/phetsims/scenery/issues/1581
   */ boundsTo(node) {
        return node.globalToLocalBounds(this.getGlobalBounds());
    }
    /*---------------------------------------------------------------------------*
   * Drawable handling
   *----------------------------------------------------------------------------*/ /**
   * Adds the drawable to our list of drawables to notify of visual changes. (scenery-internal)
   */ attachDrawable(drawable) {
        this._drawables.push(drawable);
        return this; // allow chaining
    }
    /**
   * Removes the drawable from our list of drawables to notify of visual changes. (scenery-internal)
   */ detachDrawable(drawable) {
        const index = _.indexOf(this._drawables, drawable);
        assert && assert(index >= 0, 'Invalid operation: trying to detach a non-referenced drawable');
        this._drawables.splice(index, 1); // TODO: replace with a remove() function https://github.com/phetsims/scenery/issues/1581
        return this;
    }
    /**
   * Scans the options object for key names that correspond to ES5 setters or other setter functions, and calls those
   * with the values.
   *
   * For example:
   *
   * node.mutate( { top: 0, left: 5 } );
   *
   * will be equivalent to:
   *
   * node.left = 5;
   * node.top = 0;
   *
   * In particular, note that the order is different. Mutators will be applied in the order of _mutatorKeys, which can
   * be added to by subtypes.
   *
   * Additionally, some keys are actually direct function names, like 'scale'. mutate( { scale: 2 } ) will call
   * node.scale( 2 ) instead of activating an ES5 setter directly.
   */ mutate(options) {
        if (!options) {
            return this;
        }
        assert && assert(Object.getPrototypeOf(options) === Object.prototype, 'Extra prototype on Node options object is a code smell');
        // @ts-expect-error
        assert && assert(_.filter([
            'translation',
            'x',
            'left',
            'right',
            'centerX',
            'centerTop',
            'rightTop',
            'leftCenter',
            'center',
            'rightCenter',
            'leftBottom',
            'centerBottom',
            'rightBottom'
        ], (key)=>options[key] !== undefined).length <= 1, `More than one mutation on this Node set the x component, check ${Object.keys(options).join(',')}`);
        // @ts-expect-error
        assert && assert(_.filter([
            'translation',
            'y',
            'top',
            'bottom',
            'centerY',
            'centerTop',
            'rightTop',
            'leftCenter',
            'center',
            'rightCenter',
            'leftBottom',
            'centerBottom',
            'rightBottom'
        ], (key)=>options[key] !== undefined).length <= 1, `More than one mutation on this Node set the y component, check ${Object.keys(options).join(',')}`);
        if (assert && options.hasOwnProperty('enabled') && options.hasOwnProperty('enabledProperty')) {
            assert && assert(options.enabledProperty.value === options.enabled, 'If both enabled and enabledProperty are provided, then values should match');
        }
        if (assert && options.hasOwnProperty('inputEnabled') && options.hasOwnProperty('inputEnabledProperty')) {
            assert && assert(options.inputEnabledProperty.value === options.inputEnabled, 'If both inputEnabled and inputEnabledProperty are provided, then values should match');
        }
        if (assert && options.hasOwnProperty('visible') && options.hasOwnProperty('visibleProperty')) {
            assert && assert(options.visibleProperty.value === options.visible, 'If both visible and visibleProperty are provided, then values should match');
        }
        if (assert && options.hasOwnProperty('pdomVisible') && options.hasOwnProperty('pdomVisibleProperty')) {
            assert && assert(options.pdomVisibleProperty.value === options.pdomVisible, 'If both pdomVisible and pdomVisibleProperty are provided, then values should match');
        }
        if (assert && options.hasOwnProperty('pickable') && options.hasOwnProperty('pickableProperty')) {
            assert && assert(options.pickableProperty.value === options.pickable, 'If both pickable and pickableProperty are provided, then values should match');
        }
        const mutatorKeys = this._mutatorKeys;
        for(let i = 0; i < mutatorKeys.length; i++){
            const key = mutatorKeys[i];
            // See https://github.com/phetsims/scenery/issues/580 for more about passing undefined.
            // @ts-expect-error
            assert && assert(!options.hasOwnProperty(key) || options[key] !== undefined, `Undefined not allowed for Node key: ${key}`);
            // @ts-expect-error - Hmm, better way to check this?
            if (options[key] !== undefined) {
                const descriptor = Object.getOwnPropertyDescriptor(Node.prototype, key);
                // if the key refers to a function that is not ES5 writable, it will execute that function with the single argument
                if (descriptor && typeof descriptor.value === 'function') {
                    // @ts-expect-error
                    this[key](options[key]);
                } else {
                    // @ts-expect-error
                    this[key] = options[key];
                }
            }
        }
        this.initializePhetioObject(DEFAULT_PHET_IO_OBJECT_BASE_OPTIONS, options);
        return this; // allow chaining
    }
    initializePhetioObject(baseOptions, config) {
        // Track this, so we only override our visibleProperty once.
        const wasInstrumented = this.isPhetioInstrumented();
        super.initializePhetioObject(baseOptions, config);
        if (Tandem.PHET_IO_ENABLED && !wasInstrumented && this.isPhetioInstrumented()) {
            // For each supported TinyForwardingProperty, if a Property was already specified in the options (in the
            // constructor or mutate), then it will be set as this.targetProperty there. Here we only create the default
            // instrumented one if another hasn't already been specified.
            this._visibleProperty.initializePhetio(this, VISIBLE_PROPERTY_TANDEM_NAME, ()=>new BooleanProperty(this.visible, combineOptions({
                    // by default, use the value from the Node
                    phetioReadOnly: this.phetioReadOnly,
                    tandem: this.tandem.createTandem(VISIBLE_PROPERTY_TANDEM_NAME),
                    phetioDocumentation: 'Controls whether the Node will be visible (and interactive).'
                }, config.visiblePropertyOptions)));
            this._enabledProperty.initializePhetio(this, ENABLED_PROPERTY_TANDEM_NAME, ()=>new EnabledProperty(this.enabled, combineOptions({
                    // by default, use the value from the Node
                    phetioReadOnly: this.phetioReadOnly,
                    phetioDocumentation: 'Sets whether the node is enabled. This will set whether input is enabled for this Node and ' + 'most often children as well. It will also control and toggle the "disabled look" of the node.',
                    tandem: this.tandem.createTandem(ENABLED_PROPERTY_TANDEM_NAME)
                }, config.enabledPropertyOptions)));
            this._inputEnabledProperty.initializePhetio(this, INPUT_ENABLED_PROPERTY_TANDEM_NAME, ()=>new Property(this.inputEnabled, combineOptions({
                    // by default, use the value from the Node
                    phetioReadOnly: this.phetioReadOnly,
                    tandem: this.tandem.createTandem(INPUT_ENABLED_PROPERTY_TANDEM_NAME),
                    phetioValueType: BooleanIO,
                    phetioFeatured: true,
                    phetioDocumentation: 'Sets whether the element will have input enabled, and hence be interactive.'
                }, config.inputEnabledPropertyOptions)));
        }
    }
    /**
   * Set the visibility of this Node with respect to the Voicing feature. Totally separate from graphical display.
   * When visible, this Node and all of its ancestors will be able to speak with Voicing. When voicingVisible
   * is false, all Voicing under this Node will be muted. `voicingVisible` properties exist in Node.ts because
   * it is useful to set `voicingVisible` on a root that is composed with Voicing.ts. We cannot put all of the
   * Voicing.ts implementation in Node because that would have a massive memory impact. See Voicing.ts for more
   * information.
   */ setVoicingVisible(visible) {
        if (this.voicingVisibleProperty.value !== visible) {
            this.voicingVisibleProperty.value = visible;
        }
    }
    set voicingVisible(visible) {
        this.setVoicingVisible(visible);
    }
    get voicingVisible() {
        return this.isVoicingVisible();
    }
    /**
   * Returns whether this Node is voicingVisible. When true Utterances for this Node can be announced with the
   * Voicing feature, see Voicing.ts for more information.
   */ isVoicingVisible() {
        return this.voicingVisibleProperty.value;
    }
    /**
   * Override for extra information in the debugging output (from Display.getDebugHTML()). (scenery-internal)
   */ getDebugHTMLExtras() {
        return '';
    }
    /**
   * Makes this Node's subtree available for inspection.
   */ inspect() {
        localStorage.scenerySnapshot = JSON.stringify({
            type: 'Subtree',
            rootNodeId: this.id,
            nodes: serializeConnectedNodes(this)
        });
    }
    /**
   * Returns a debugging string that is an attempted serialization of this node's sub-tree.
   */ toString() {
        return `${this.constructor.name}#${this.id}`;
    }
    /**
   * Performs checks to see if the internal state of Instance references is correct at a certain point in/after the
   * Display's updateDisplay(). (scenery-internal)
   */ auditInstanceSubtreeForDisplay(display) {
        if (assertSlow) {
            const numInstances = this._instances.length;
            for(let i = 0; i < numInstances; i++){
                const instance = this._instances[i];
                if (instance.display === display) {
                    assertSlow(instance.trail.isValid(), `Invalid trail on Instance: ${instance.toString()} with trail ${instance.trail.toString()}`);
                }
            }
            // audit all of the children
            this.children.forEach((child)=>{
                child.auditInstanceSubtreeForDisplay(display);
            });
        }
    }
    /**
   * When we add or remove any number of bounds listeners, we want to increment/decrement internal information.
   *
   * @param deltaQuantity - If positive, the number of listeners being added, otherwise the number removed
   */ onBoundsListenersAddedOrRemoved(deltaQuantity) {
        this.changeBoundsEventCount(deltaQuantity);
        this._boundsEventSelfCount += deltaQuantity;
    }
    /**
   * Disposes the node, releasing all references that it maintained.
   */ dispose() {
        // remove all PDOM input listeners
        this.disposeParallelDOM();
        // When disposing, remove all children and parents. See https://github.com/phetsims/scenery/issues/629
        this.removeAllChildren();
        this.detach();
        // In opposite order of creation
        this._inputEnabledProperty.dispose();
        this._enabledProperty.dispose();
        this._pickableProperty.dispose();
        this._visibleProperty.dispose();
        // Tear-down in the reverse order Node was created
        super.dispose();
    }
    /**
   * Disposes this Node and all other descendant nodes.
   *
   * NOTE: Use with caution, as you should not re-use any Node touched by this. Not compatible with most DAG
   *       techniques.
   */ disposeSubtree() {
        if (!this.isDisposed) {
            // makes a copy before disposing
            const children = this.children;
            this.dispose();
            for(let i = 0; i < children.length; i++){
                children[i].disposeSubtree();
            }
        }
    }
    /**
   * A default for getTrails() searches, returns whether the Node has no parents.
   */ static defaultTrailPredicate(node) {
        return node._parents.length === 0;
    }
    /**
   * A default for getLeafTrails() searches, returns whether the Node has no parents.
   */ static defaultLeafTrailPredicate(node) {
        return node._children.length === 0;
    }
    /**
   * Creates a Node with options.
   *
   * NOTE: Directly created Nodes (not of any subtype, but created with "new Node( ... )") are generally used as
   *       containers, which can hold other Nodes, subtypes of Node that can display things.
   *
   * Node and its subtypes generally have the last constructor parameter reserved for the 'options' object. This is a
   * key-value map that specifies relevant options that are used by Node and subtypes.
   *
   * For example, one of Node's options is bottom, and one of Circle's options is radius. When a circle is created:
   *   var circle = new Circle( {
   *     radius: 10,
   *     bottom: 200
   *   } );
   * This will create a Circle, set its radius (by executing circle.radius = 10, which uses circle.setRadius()), and
   * then will align the bottom of the circle along y=200 (by executing circle.bottom = 200, which uses
   * node.setBottom()).
   *
   * The options are executed in the order specified by each types _mutatorKeys property.
   *
   * The options object is currently not checked to see whether there are property (key) names that are not used, so it
   * is currently legal to do "new Node( { fork_kitchen_spoon: 5 } )".
   *
   * Usually, an option (e.g. 'visible'), when used in a constructor or mutate() call, will directly use the ES5 setter
   * for that property (e.g. node.visible = ...), which generally forwards to a non-ES5 setter function
   * (e.g. node.setVisible( ... )) that is responsible for the behavior. Documentation is generally on these methods
   * (e.g. setVisible), although some methods may be dynamically created to avoid verbosity (like node.leftTop).
   *
   * Sometimes, options invoke a function instead (e.g. 'scale') because the verb and noun are identical. In this case,
   * instead of setting the setter (node.scale = ..., which would override the function), it will instead call
   * the method directly (e.g. node.scale( ... )).
   */ constructor(options){
        super(), // Whether our localBounds have been set (with the ES5 setter/setLocalBounds()) to a custom
        // overridden value. If true, then localBounds itself will not be updated, but will instead always be the
        // overridden value.
        // (scenery-internal)
        this._localBoundsOverridden = false, // [mutable] Whether invisible children will be excluded from this Node's bounds
        this._excludeInvisibleChildrenFromBounds = false, // [mutable] Whether to interrupt input events on the subtree when this Node is made invisible
        this._interruptSubtreeOnInvisible = true, // Options that can be provided to layout managers to adjust positioning for this node.
        this._layoutOptions = null, // Whether bounds needs to be recomputed to be valid.
        // (scenery-internal)
        this._boundsDirty = true, // Whether localBounds needs to be recomputed to be valid.
        // (scenery-internal)
        this._localBoundsDirty = true, // Whether selfBounds needs to be recomputed to be valid.
        // (scenery-internal)
        this._selfBoundsDirty = true, // Whether childBounds needs to be recomputed to be valid.
        // (scenery-internal)
        this._childBoundsDirty = true, // This is fired only once for any single operation that may change the children of a Node.
        // For example, if a Node's children are [ a, b ] and setChildren( [ a, x, y, z ] ) is called on it, the
        // childrenChanged event will only be fired once after the entire operation of changing the children is completed.
        this.childrenChangedEmitter = new TinyEmitter(), // For every single added child Node, emits with {Node} Node, {number} indexOfChild
        this.childInsertedEmitter = new TinyEmitter(), // For every single removed child Node, emits with {Node} Node, {number} indexOfChild
        this.childRemovedEmitter = new TinyEmitter(), // Provides a given range that may be affected by the reordering
        this.childrenReorderedEmitter = new TinyEmitter(), // Fired whenever a parent is added
        this.parentAddedEmitter = new TinyEmitter(), // Fired whenever a parent is removed
        this.parentRemovedEmitter = new TinyEmitter(), // Fired synchronously when the transform (transformation matrix) of a Node is changed. Any
        // change to a Node's translation/rotation/scale/etc. will trigger this event.
        this.transformEmitter = new TinyEmitter(), // Should be emitted when we need to check full metadata updates directly on Instances,
        // to see if we need to change drawable types, etc.
        this.instanceRefreshEmitter = new TinyEmitter(), // Emitted to when we need to potentially recompute our renderer summary (bitmask flags, or
        // things that could affect descendants)
        this.rendererSummaryRefreshEmitter = new TinyEmitter(), // Emitted to when we change filters (either opacity or generalized filters)
        this.filterChangeEmitter = new TinyEmitter(), // Fired when an instance is changed (added/removed). CAREFUL!! This is potentially a very dangerous thing to listen
        // to. Instances are updated in an asynchronous batch during `updateDisplay()`, and it is very important that display
        // updates do not cause changes the scene graph. Thus, this emitter should NEVER trigger a Node's state to change.
        // Currently, all usages of this cause into updates to the audio view, or updates to a separate display (used as an
        // overlay). Please proceed with caution. Most likely you prefer to use the synchronous support of DisplayedTrailsProperty,
        // see https://github.com/phetsims/scenery/issues/1615 and https://github.com/phetsims/scenery/issues/1620 for details.
        this.changedInstanceEmitter = new TinyEmitter(), // Fired whenever this node is added as a root to a Display OR when it is removed as a root from a Display (i.e.
        // the Display is disposed).
        this.rootedDisplayChangedEmitter = new TinyEmitter(), // Fired when layoutOptions changes
        this.layoutOptionsChangedEmitter = new TinyEmitter(), // Tracks any layout constraint, so that we can avoid having multiple layout constraints on the same node
        // (and avoid the infinite loops that can happen if that is triggered).
        // (scenery-internal)
        this._activeParentLayoutConstraint = null;
        this._id = globalIdCounter++;
        this._instances = [];
        this._rootedDisplays = [];
        this._drawables = [];
        this._visibleProperty = new TinyForwardingProperty(DEFAULT_OPTIONS.visible, DEFAULT_OPTIONS.phetioVisiblePropertyInstrumented, this.onVisiblePropertyChange.bind(this));
        this.opacityProperty = new TinyProperty(DEFAULT_OPTIONS.opacity, this.onOpacityPropertyChange.bind(this));
        this.disabledOpacityProperty = new TinyProperty(DEFAULT_OPTIONS.disabledOpacity, this.onDisabledOpacityPropertyChange.bind(this));
        this._pickableProperty = new TinyForwardingProperty(DEFAULT_OPTIONS.pickable, false, this.onPickablePropertyChange.bind(this));
        this._enabledProperty = new TinyForwardingProperty(DEFAULT_OPTIONS.enabled, DEFAULT_OPTIONS.phetioEnabledPropertyInstrumented, this.onEnabledPropertyChange.bind(this));
        this._inputEnabledProperty = new TinyForwardingProperty(DEFAULT_OPTIONS.inputEnabled, DEFAULT_OPTIONS.phetioInputEnabledPropertyInstrumented);
        this.clipAreaProperty = new TinyProperty(DEFAULT_OPTIONS.clipArea);
        this.voicingVisibleProperty = new TinyProperty(true);
        this._mouseArea = DEFAULT_OPTIONS.mouseArea;
        this._touchArea = DEFAULT_OPTIONS.touchArea;
        this._cursor = DEFAULT_OPTIONS.cursor;
        this._children = [];
        this._parents = [];
        this._transformBounds = DEFAULT_OPTIONS.transformBounds;
        this._transform = new Transform3();
        this._transformListener = this.onTransformChange.bind(this);
        this._transform.changeEmitter.addListener(this._transformListener);
        this._maxWidth = DEFAULT_OPTIONS.maxWidth;
        this._maxHeight = DEFAULT_OPTIONS.maxHeight;
        this._appliedScaleFactor = 1;
        this._inputListeners = [];
        this._renderer = DEFAULT_INTERNAL_RENDERER;
        this._usesOpacity = DEFAULT_OPTIONS.usesOpacity;
        this._layerSplit = DEFAULT_OPTIONS.layerSplit;
        this._cssTransform = DEFAULT_OPTIONS.cssTransform;
        this._excludeInvisible = DEFAULT_OPTIONS.excludeInvisible;
        this._webglScale = DEFAULT_OPTIONS.webglScale;
        this._preventFit = DEFAULT_OPTIONS.preventFit;
        this.inputEnabledProperty.lazyLink(this.pdomBoundInputEnabledListener);
        // Add listener count change notifications into these Properties, since we need to know when their number of listeners
        // changes dynamically.
        const boundsListenersAddedOrRemovedListener = this.onBoundsListenersAddedOrRemoved.bind(this);
        const boundsInvalidationListener = this.validateBounds.bind(this);
        const selfBoundsInvalidationListener = this.validateSelfBounds.bind(this);
        this.boundsProperty = new TinyStaticProperty(Bounds2.NOTHING.copy(), boundsInvalidationListener);
        this.boundsProperty.changeCount = boundsListenersAddedOrRemovedListener;
        this.localBoundsProperty = new TinyStaticProperty(Bounds2.NOTHING.copy(), boundsInvalidationListener);
        this.localBoundsProperty.changeCount = boundsListenersAddedOrRemovedListener;
        this.childBoundsProperty = new TinyStaticProperty(Bounds2.NOTHING.copy(), boundsInvalidationListener);
        this.childBoundsProperty.changeCount = boundsListenersAddedOrRemovedListener;
        this.selfBoundsProperty = new TinyStaticProperty(Bounds2.NOTHING.copy(), selfBoundsInvalidationListener);
        if (assert) {
            // for assertions later to ensure that we are using the same Bounds2 copies as before
            this._originalBounds = this.boundsProperty._value;
            this._originalLocalBounds = this.localBoundsProperty._value;
            this._originalSelfBounds = this.selfBoundsProperty._value;
            this._originalChildBounds = this.childBoundsProperty._value;
        }
        this._filters = [];
        this._rendererBitmask = Renderer.bitmaskNodeDefault;
        this._rendererSummary = new RendererSummary(this);
        this._boundsEventCount = 0;
        this._boundsEventSelfCount = 0;
        this._picker = new Picker(this);
        this._isGettingRemovedFromParent = false;
        if (options) {
            this.mutate(options);
        }
    }
};
// {Object} - A mapping of all of options that require Bounds to be applied properly. Most often these should be set through `mutate` in the end of the construcor instead of being passed through `super()`
Node.REQUIRES_BOUNDS_OPTION_KEYS = REQUIRES_BOUNDS_OPTION_KEYS;
// A mapping of all of the default options provided to Node
Node.DEFAULT_NODE_OPTIONS = DEFAULT_OPTIONS;
Node.prototype._mutatorKeys = ACCESSIBILITY_OPTION_KEYS.concat(NODE_OPTION_KEYS);
/**
 * {Array.<String>} - List of all dirty flags that should be available on drawables created from this Node (or
 *                    subtype). Given a flag (e.g. radius), it indicates the existence of a function
 *                    drawable.markDirtyRadius() that will indicate to the drawable that the radius has changed.
 * (scenery-internal)
 *
 * Should be overridden by subtypes.
 */ Node.prototype.drawableMarkFlags = [];
scenery.register('Node', Node);
// {IOType}
Node.NodeIO = new IOType('NodeIO', {
    valueType: Node,
    documentation: 'The base type for graphical and potentially interactive objects.',
    metadataDefaults: {
        phetioState: PHET_IO_STATE_DEFAULT
    }
});
const DEFAULT_PHET_IO_OBJECT_BASE_OPTIONS = {
    phetioType: Node.NodeIO,
    phetioState: PHET_IO_STATE_DEFAULT
};
// A base class for a node in the Scenery scene graph. Supports general directed acyclic graphics (DAGs).
// Handles multiple layers with assorted types (Canvas 2D, SVG, DOM, WebGL, etc.).
// Note: We use interface extension, so we can't export Node at its declaration location
export default Node;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvbm9kZXMvTm9kZS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxMi0yMDI0LCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuLyoqXG4gKiBBIE5vZGUgZm9yIHRoZSBTY2VuZXJ5IHNjZW5lIGdyYXBoLiBTdXBwb3J0cyBnZW5lcmFsIGRpcmVjdGVkIGFjeWNsaWMgZ3JhcGhpY3MgKERBR3MpLlxuICogSGFuZGxlcyBtdWx0aXBsZSBsYXllcnMgd2l0aCBhc3NvcnRlZCB0eXBlcyAoQ2FudmFzIDJELCBTVkcsIERPTSwgV2ViR0wsIGV0Yy4pLlxuICpcbiAqICMjIEdlbmVyYWwgZGVzY3JpcHRpb24gb2YgTm9kZXNcbiAqXG4gKiBJbiBTY2VuZXJ5LCB0aGUgdmlzdWFsIG91dHB1dCBpcyBkZXRlcm1pbmVkIGJ5IGEgZ3JvdXAgb2YgY29ubmVjdGVkIE5vZGVzIChnZW5lcmFsbHkga25vd24gYXMgYSBzY2VuZSBncmFwaCkuXG4gKiBFYWNoIE5vZGUgaGFzIGEgbGlzdCBvZiAnY2hpbGQnIE5vZGVzLiBXaGVuIGEgTm9kZSBpcyB2aXN1YWxseSBkaXNwbGF5ZWQsIGl0cyBjaGlsZCBOb2RlcyAoY2hpbGRyZW4pIHdpbGwgYWxzbyBiZVxuICogZGlzcGxheWVkLCBhbG9uZyB3aXRoIHRoZWlyIGNoaWxkcmVuLCBldGMuIFRoZXJlIGlzIHR5cGljYWxseSBvbmUgJ3Jvb3QnIE5vZGUgdGhhdCBpcyBwYXNzZWQgdG8gdGhlIFNjZW5lcnkgRGlzcGxheVxuICogd2hvc2UgZGVzY2VuZGFudHMgKE5vZGVzIHRoYXQgY2FuIGJlIHRyYWNlZCBmcm9tIHRoZSByb290IGJ5IGNoaWxkIHJlbGF0aW9uc2hpcHMpIHdpbGwgYmUgZGlzcGxheWVkLlxuICpcbiAqIEZvciBpbnN0YW5jZSwgc2F5IHRoZXJlIGFyZSBOb2RlcyBuYW1lZCBBLCBCLCBDLCBEIGFuZCBFLCB3aG8gaGF2ZSB0aGUgcmVsYXRpb25zaGlwczpcbiAqIC0gQiBpcyBhIGNoaWxkIG9mIEEgKHRodXMgQSBpcyBhIHBhcmVudCBvZiBCKVxuICogLSBDIGlzIGEgY2hpbGQgb2YgQSAodGh1cyBBIGlzIGEgcGFyZW50IG9mIEMpXG4gKiAtIEQgaXMgYSBjaGlsZCBvZiBDICh0aHVzIEMgaXMgYSBwYXJlbnQgb2YgRClcbiAqIC0gRSBpcyBhIGNoaWxkIG9mIEMgKHRodXMgQyBpcyBhIHBhcmVudCBvZiBFKVxuICogd2hlcmUgQSB3b3VsZCBiZSB0aGUgcm9vdCBOb2RlLiBUaGlzIGNhbiBiZSB2aXN1YWxseSByZXByZXNlbnRlZCBhcyBhIHNjZW5lIGdyYXBoLCB3aGVyZSBhIGxpbmUgY29ubmVjdHMgYSBwYXJlbnRcbiAqIE5vZGUgdG8gYSBjaGlsZCBOb2RlICh3aGVyZSB0aGUgcGFyZW50IGlzIHVzdWFsbHkgYWx3YXlzIGF0IHRoZSB0b3Agb2YgdGhlIGxpbmUsIGFuZCB0aGUgY2hpbGQgaXMgYXQgdGhlIGJvdHRvbSk6XG4gKiBGb3IgZXhhbXBsZTpcbiAqXG4gKiAgIEFcbiAqICAvIFxcXG4gKiBCICAgQ1xuICogICAgLyBcXFxuICogICBEICAgRVxuICpcbiAqIEFkZGl0aW9uYWxseSwgaW4gdGhpcyBjYXNlOlxuICogLSBEIGlzIGEgJ2Rlc2NlbmRhbnQnIG9mIEEgKGR1ZSB0byB0aGUgQyBiZWluZyBhIGNoaWxkIG9mIEEsIGFuZCBEIGJlaW5nIGEgY2hpbGQgb2YgQylcbiAqIC0gQSBpcyBhbiAnYW5jZXN0b3InIG9mIEQgKGR1ZSB0byB0aGUgcmV2ZXJzZSlcbiAqIC0gQydzICdzdWJ0cmVlJyBpcyBDLCBEIGFuZCBFLCB3aGljaCBjb25zaXN0cyBvZiBDIGl0c2VsZiBhbmQgYWxsIG9mIGl0cyBkZXNjZW5kYW50cy5cbiAqXG4gKiBOb3RlIHRoYXQgU2NlbmVyeSBhbGxvd3Mgc29tZSBtb3JlIGNvbXBsaWNhdGVkIGZvcm1zLCB3aGVyZSBOb2RlcyBjYW4gaGF2ZSBtdWx0aXBsZSBwYXJlbnRzLCBlLmcuOlxuICpcbiAqICAgQVxuICogIC8gXFxcbiAqIEIgICBDXG4gKiAgXFwgL1xuICogICBEXG4gKlxuICogSW4gdGhpcyBjYXNlLCBEIGhhcyB0d28gcGFyZW50cyAoQiBhbmQgQykuIFNjZW5lcnkgZGlzYWxsb3dzIGFueSBOb2RlIGZyb20gYmVpbmcgaXRzIG93biBhbmNlc3RvciBvciBkZXNjZW5kYW50LFxuICogc28gdGhhdCBsb29wcyBhcmUgbm90IHBvc3NpYmxlLiBXaGVuIGEgTm9kZSBoYXMgdHdvIG9yIG1vcmUgcGFyZW50cywgaXQgbWVhbnMgdGhhdCB0aGUgTm9kZSdzIHN1YnRyZWUgd2lsbCB0eXBpY2FsbHlcbiAqIGJlIGRpc3BsYXllZCB0d2ljZSBvbiB0aGUgc2NyZWVuLiBJbiB0aGUgYWJvdmUgY2FzZSwgRCB3b3VsZCBhcHBlYXIgYm90aCBhdCBCJ3MgcG9zaXRpb24gYW5kIEMncyBwb3NpdGlvbi4gRWFjaFxuICogcGxhY2UgYSBOb2RlIHdvdWxkIGJlIGRpc3BsYXllZCBpcyBrbm93biBhcyBhbiAnaW5zdGFuY2UnLlxuICpcbiAqIEVhY2ggTm9kZSBoYXMgYSAndHJhbnNmb3JtJyBhc3NvY2lhdGVkIHdpdGggaXQsIHdoaWNoIGRldGVybWluZXMgaG93IGl0cyBzdWJ0cmVlICh0aGF0IE5vZGUgYW5kIGFsbCBvZiBpdHNcbiAqIGRlc2NlbmRhbnRzKSB3aWxsIGJlIHBvc2l0aW9uZWQuIFRyYW5zZm9ybXMgY2FuIGNvbnRhaW46XG4gKiAtIFRyYW5zbGF0aW9uLCB3aGljaCBtb3ZlcyB0aGUgcG9zaXRpb24gdGhlIHN1YnRyZWUgaXMgZGlzcGxheWVkXG4gKiAtIFNjYWxlLCB3aGljaCBtYWtlcyB0aGUgZGlzcGxheWVkIHN1YnRyZWUgbGFyZ2VyIG9yIHNtYWxsZXJcbiAqIC0gUm90YXRpb24sIHdoaWNoIGRpc3BsYXlzIHRoZSBzdWJ0cmVlIGF0IGFuIGFuZ2xlXG4gKiAtIG9yIGFueSBjb21iaW5hdGlvbiBvZiB0aGUgYWJvdmUgdGhhdCB1c2VzIGFuIGFmZmluZSBtYXRyaXggKG1vcmUgYWR2YW5jZWQgdHJhbnNmb3JtcyB3aXRoIHNoZWFyIGFuZCBjb21iaW5hdGlvbnNcbiAqICAgYXJlIHBvc3NpYmxlKS5cbiAqXG4gKiBTYXkgd2UgaGF2ZSB0aGUgZm9sbG93aW5nIHNjZW5lIGdyYXBoOlxuICpcbiAqICAgQVxuICogICB8XG4gKiAgIEJcbiAqICAgfFxuICogICBDXG4gKlxuICogd2hlcmUgdGhlcmUgYXJlIHRoZSBmb2xsb3dpbmcgdHJhbnNmb3JtczpcbiAqIC0gQSBoYXMgYSAndHJhbnNsYXRpb24nIHRoYXQgbW92ZXMgdGhlIGNvbnRlbnQgMTAwIHBpeGVscyB0byB0aGUgcmlnaHRcbiAqIC0gQiBoYXMgYSAnc2NhbGUnIHRoYXQgZG91YmxlcyB0aGUgc2l6ZSBvZiB0aGUgY29udGVudFxuICogLSBDIGhhcyBhICdyb3RhdGlvbicgdGhhdCByb3RhdGVzIDE4MC1kZWdyZWVzIGFyb3VuZCB0aGUgb3JpZ2luXG4gKlxuICogSWYgQyBkaXNwbGF5cyBhIHNxdWFyZSB0aGF0IGZpbGxzIHRoZSBhcmVhIHdpdGggMCA8PSB4IDw9IDEwIGFuZCAwIDw9IHkgPD0gMTAsIHdlIGNhbiBkZXRlcm1pbmUgdGhlIHBvc2l0aW9uIG9uXG4gKiB0aGUgZGlzcGxheSBieSBhcHBseWluZyB0cmFuc2Zvcm1zIHN0YXJ0aW5nIGF0IEMgYW5kIG1vdmluZyB0b3dhcmRzIHRoZSByb290IE5vZGUgKGluIHRoaXMgY2FzZSwgQSk6XG4gKiAxLiBXZSBhcHBseSBDJ3Mgcm90YXRpb24gdG8gb3VyIHNxdWFyZSwgc28gdGhlIGZpbGxlZCBhcmVhIHdpbGwgbm93IGJlIC0xMCA8PSB4IDw9IDAgYW5kIC0xMCA8PSB5IDw9IDBcbiAqIDIuIFdlIGFwcGx5IEIncyBzY2FsZSB0byBvdXIgc3F1YXJlLCBzbyBub3cgd2UgaGF2ZSAtMjAgPD0geCA8PSAwIGFuZCAtMjAgPD0geSA8PSAwXG4gKiAzLiBXZSBhcHBseSBBJ3MgdHJhbnNsYXRpb24gdG8gb3VyIHNxdWFyZSwgbW92aW5nIGl0IHRvIDgwIDw9IHggPD0gMTAwIGFuZCAtMjAgPD0geSA8PSAwXG4gKlxuICogTm9kZXMgYWxzbyBoYXZlIGEgbGFyZ2UgbnVtYmVyIG9mIHByb3BlcnRpZXMgdGhhdCB3aWxsIGFmZmVjdCBob3cgdGhlaXIgZW50aXJlIHN1YnRyZWUgaXMgcmVuZGVyZWQsIHN1Y2ggYXNcbiAqIHZpc2liaWxpdHksIG9wYWNpdHksIGV0Yy5cbiAqXG4gKiAjIyBDcmVhdGluZyBOb2Rlc1xuICpcbiAqIEdlbmVyYWxseSwgdGhlcmUgYXJlIHR3byB0eXBlcyBvZiBOb2RlczpcbiAqIC0gTm9kZXMgdGhhdCBkb24ndCBkaXNwbGF5IGFueXRoaW5nLCBidXQgc2VydmUgYXMgYSBjb250YWluZXIgZm9yIG90aGVyIE5vZGVzIChlLmcuIE5vZGUgaXRzZWxmLCBIQm94LCBWQm94KVxuICogLSBOb2RlcyB0aGF0IGRpc3BsYXkgY29udGVudCwgYnV0IEFMU08gc2VydmUgYXMgYSBjb250YWluZXIgKGUuZy4gQ2lyY2xlLCBJbWFnZSwgVGV4dClcbiAqXG4gKiBXaGVuIGEgTm9kZSBpcyBjcmVhdGVkIHdpdGggdGhlIGRlZmF1bHQgTm9kZSBjb25zdHJ1Y3RvciwgZS5nLjpcbiAqICAgdmFyIG5vZGUgPSBuZXcgTm9kZSgpO1xuICogdGhlbiB0aGF0IE5vZGUgd2lsbCBub3QgZGlzcGxheSBhbnl0aGluZyBieSBpdHNlbGYuXG4gKlxuICogR2VuZXJhbGx5IHN1YnR5cGVzIG9mIE5vZGUgYXJlIHVzZWQgZm9yIGRpc3BsYXlpbmcgdGhpbmdzLCBzdWNoIGFzIENpcmNsZSwgZS5nLjpcbiAqICAgdmFyIGNpcmNsZSA9IG5ldyBDaXJjbGUoIDIwICk7IC8vIHJhZGl1cyBvZiAyMFxuICpcbiAqIEFsbW9zdCBhbGwgTm9kZXMgKHdpdGggdGhlIGV4Y2VwdGlvbiBvZiBsZWFmLW9ubHkgTm9kZXMgbGlrZSBTcGFjZXIpIGNhbiBjb250YWluIGNoaWxkcmVuLlxuICpcbiAqICMjIENvbm5lY3RpbmcgTm9kZXMsIGFuZCByZW5kZXJpbmcgb3JkZXJcbiAqXG4gKiBUbyBtYWtlIGEgJ2NoaWxkTm9kZScgYmVjb21lIGEgJ3BhcmVudE5vZGUnLCB0aGUgdHlwaWNhbCB3YXkgaXMgdG8gY2FsbCBhZGRDaGlsZCgpOlxuICogICBwYXJlbnROb2RlLmFkZENoaWxkKCBjaGlsZE5vZGUgKTtcbiAqXG4gKiBUbyByZW1vdmUgdGhpcyBjb25uZWN0aW9uLCB5b3UgY2FuIGNhbGw6XG4gKiAgIHBhcmVudE5vZGUucmVtb3ZlQ2hpbGQoIGNoaWxkTm9kZSApO1xuICpcbiAqIEFkZGluZyBhIGNoaWxkIE5vZGUgd2l0aCBhZGRDaGlsZCgpIHB1dHMgaXQgYXQgdGhlIGVuZCBvZiBwYXJlbnROb2RlJ3MgbGlzdCBvZiBjaGlsZCBOb2Rlcy4gVGhpcyBpcyBpbXBvcnRhbnQsXG4gKiBiZWNhdXNlIHRoZSBvcmRlciBvZiBjaGlsZHJlbiBhZmZlY3RzIHdoYXQgTm9kZXMgYXJlIGRyYXduIG9uIHRoZSAndG9wJyBvciAnYm90dG9tJyB2aXN1YWxseS4gTm9kZXMgdGhhdCBhcmUgYXQgdGhlXG4gKiBlbmQgb2YgdGhlIGxpc3Qgb2YgY2hpbGRyZW4gYXJlIGdlbmVyYWxseSBkcmF3biBvbiB0b3AuXG4gKlxuICogVGhpcyBpcyBnZW5lcmFsbHkgZWFzaWVzdCB0byByZXByZXNlbnQgYnkgbm90YXRpbmcgc2NlbmUgZ3JhcGhzIHdpdGggY2hpbGRyZW4gaW4gb3JkZXIgZnJvbSBsZWZ0IHRvIHJpZ2h0LCB0aHVzOlxuICpcbiAqICAgQVxuICogIC8gXFxcbiAqIEIgICBDXG4gKiAgICAvIFxcXG4gKiAgIEQgICBFXG4gKlxuICogd291bGQgaW5kaWNhdGUgdGhhdCBBJ3MgY2hpbGRyZW4gYXJlIFtCLENdLCBzbyBDJ3Mgc3VidHJlZSBpcyBkcmF3biBPTiBUT1Agb2YgQi4gVGhlIHNhbWUgaXMgdHJ1ZSBvZiBDJ3MgY2hpbGRyZW5cbiAqIFtELEVdLCBzbyBFIGlzIGRyYXduIG9uIHRvcCBvZiBELiBJZiBhIE5vZGUgaXRzZWxmIGhhcyBjb250ZW50LCBpdCBpcyBkcmF3biBiZWxvdyB0aGF0IG9mIGl0cyBjaGlsZHJlbiAoc28gQyBpdHNlbGZcbiAqIHdvdWxkIGJlIGJlbG93IEQgYW5kIEUpLlxuICpcbiAqIFRoaXMgbWVhbnMgdGhhdCBmb3IgZXZlcnkgc2NlbmUgZ3JhcGgsIE5vZGVzIGluc3RhbmNlcyBjYW4gYmUgb3JkZXJlZCBmcm9tIGJvdHRvbSB0byB0b3AuIEZvciB0aGUgYWJvdmUgZXhhbXBsZSwgdGhlXG4gKiBvcmRlciBpczpcbiAqIDEuIEEgKG9uIHRoZSB2ZXJ5IGJvdHRvbSB2aXN1YWxseSwgbWF5IGdldCBjb3ZlcmVkIHVwIGJ5IG90aGVyIE5vZGVzKVxuICogMi4gQlxuICogMy4gQ1xuICogNC4gRFxuICogNS4gRSAob24gdGhlIHZlcnkgdG9wIHZpc3VhbGx5LCBtYXkgYmUgY292ZXJpbmcgb3RoZXIgTm9kZXMpXG4gKlxuICogIyMgVHJhaWxzXG4gKlxuICogRm9yIGV4YW1wbGVzIHdoZXJlIHRoZXJlIGFyZSBtdWx0aXBsZSBwYXJlbnRzIGZvciBzb21lIE5vZGVzIChhbHNvIHJlZmVycmVkIHRvIGFzIERBRyBpbiBzb21lIGNvZGUsIGFzIGl0IHJlcHJlc2VudHNcbiAqIGEgRGlyZWN0ZWQgQWN5Y2xpYyBHcmFwaCksIHdlIG5lZWQgbW9yZSBpbmZvcm1hdGlvbiBhYm91dCB0aGUgcmVuZGVyaW5nIG9yZGVyIChhcyBvdGhlcndpc2UgTm9kZXMgY291bGQgYXBwZWFyXG4gKiBtdWx0aXBsZSBwbGFjZXMgaW4gdGhlIHZpc3VhbCBib3R0b20tdG8tdG9wIG9yZGVyLlxuICpcbiAqIEEgVHJhaWwgaXMgYmFzaWNhbGx5IGEgbGlzdCBvZiBOb2Rlcywgd2hlcmUgZXZlcnkgTm9kZSBpbiB0aGUgbGlzdCBpcyBhIGNoaWxkIG9mIGl0cyBwcmV2aW91cyBlbGVtZW50LCBhbmQgYSBwYXJlbnRcbiAqIG9mIGl0cyBuZXh0IGVsZW1lbnQuIFRodXMgZm9yIHRoZSBzY2VuZSBncmFwaDpcbiAqXG4gKiAgIEFcbiAqICAvIFxcXG4gKiBCICAgQ1xuICogIFxcIC8gXFxcbiAqICAgRCAgIEVcbiAqICAgIFxcIC9cbiAqICAgICBGXG4gKlxuICogdGhlcmUgYXJlIGFjdHVhbGx5IHRocmVlIGluc3RhbmNlcyBvZiBGIGJlaW5nIGRpc3BsYXllZCwgd2l0aCB0aHJlZSB0cmFpbHM6XG4gKiAtIFtBLEIsRCxGXVxuICogLSBbQSxDLEQsRl1cbiAqIC0gW0EsQyxFLEZdXG4gKiBOb3RlIHRoYXQgdGhlIHRyYWlscyBhcmUgZXNzZW50aWFsbHkgbGlzdGluZyBOb2RlcyB1c2VkIGluIHdhbGtpbmcgZnJvbSB0aGUgcm9vdCAoQSkgdG8gdGhlIHJlbGV2YW50IE5vZGUgKEYpIHVzaW5nXG4gKiBjb25uZWN0aW9ucyBiZXR3ZWVuIHBhcmVudHMgYW5kIGNoaWxkcmVuLlxuICpcbiAqIFRoZSB0cmFpbHMgYWJvdmUgYXJlIGluIG9yZGVyIGZyb20gYm90dG9tIHRvIHRvcCAodmlzdWFsbHkpLCBkdWUgdG8gdGhlIG9yZGVyIG9mIGNoaWxkcmVuLiBUaHVzIHNpbmNlIEEncyBjaGlsZHJlblxuICogYXJlIFtCLENdIGluIHRoYXQgb3JkZXIsIEYgd2l0aCB0aGUgdHJhaWwgW0EsQixELEZdIGlzIGRpc3BsYXllZCBiZWxvdyBbQSxDLEQsRl0sIGJlY2F1c2UgQyBpcyBhZnRlciBCLlxuICpcbiAqIEBhdXRob3IgSm9uYXRoYW4gT2xzb24gPGpvbmF0aGFuLm9sc29uQGNvbG9yYWRvLmVkdT5cbiAqL1xuXG5pbXBvcnQgQm9vbGVhblByb3BlcnR5LCB7IEJvb2xlYW5Qcm9wZXJ0eU9wdGlvbnMgfSBmcm9tICcuLi8uLi8uLi9heG9uL2pzL0Jvb2xlYW5Qcm9wZXJ0eS5qcyc7XG5pbXBvcnQgRW5hYmxlZFByb3BlcnR5LCB7IEVuYWJsZWRQcm9wZXJ0eU9wdGlvbnMgfSBmcm9tICcuLi8uLi8uLi9heG9uL2pzL0VuYWJsZWRQcm9wZXJ0eS5qcyc7XG5pbXBvcnQgUHJvcGVydHksIHsgUHJvcGVydHlPcHRpb25zIH0gZnJvbSAnLi4vLi4vLi4vYXhvbi9qcy9Qcm9wZXJ0eS5qcyc7XG5pbXBvcnQgVEVtaXR0ZXIgZnJvbSAnLi4vLi4vLi4vYXhvbi9qcy9URW1pdHRlci5qcyc7XG5pbXBvcnQgVGlueUVtaXR0ZXIgZnJvbSAnLi4vLi4vLi4vYXhvbi9qcy9UaW55RW1pdHRlci5qcyc7XG5pbXBvcnQgVGlueUZvcndhcmRpbmdQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi9heG9uL2pzL1RpbnlGb3J3YXJkaW5nUHJvcGVydHkuanMnO1xuaW1wb3J0IFRpbnlQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi9heG9uL2pzL1RpbnlQcm9wZXJ0eS5qcyc7XG5pbXBvcnQgVGlueVN0YXRpY1Byb3BlcnR5IGZyb20gJy4uLy4uLy4uL2F4b24vanMvVGlueVN0YXRpY1Byb3BlcnR5LmpzJztcbmltcG9ydCBUUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vYXhvbi9qcy9UUHJvcGVydHkuanMnO1xuaW1wb3J0IFRSZWFkT25seVByb3BlcnR5IGZyb20gJy4uLy4uLy4uL2F4b24vanMvVFJlYWRPbmx5UHJvcGVydHkuanMnO1xuaW1wb3J0IEJvdW5kczIgZnJvbSAnLi4vLi4vLi4vZG90L2pzL0JvdW5kczIuanMnO1xuaW1wb3J0IE1hdHJpeDMgZnJvbSAnLi4vLi4vLi4vZG90L2pzL01hdHJpeDMuanMnO1xuaW1wb3J0IFRyYW5zZm9ybTMgZnJvbSAnLi4vLi4vLi4vZG90L2pzL1RyYW5zZm9ybTMuanMnO1xuaW1wb3J0IFV0aWxzIGZyb20gJy4uLy4uLy4uL2RvdC9qcy9VdGlscy5qcyc7XG5pbXBvcnQgVmVjdG9yMiBmcm9tICcuLi8uLi8uLi9kb3QvanMvVmVjdG9yMi5qcyc7XG5pbXBvcnQgeyBTaGFwZSB9IGZyb20gJy4uLy4uLy4uL2tpdGUvanMvaW1wb3J0cy5qcyc7XG5pbXBvcnQgYXJyYXlEaWZmZXJlbmNlIGZyb20gJy4uLy4uLy4uL3BoZXQtY29yZS9qcy9hcnJheURpZmZlcmVuY2UuanMnO1xuaW1wb3J0IGRlcHJlY2F0aW9uV2FybmluZyBmcm9tICcuLi8uLi8uLi9waGV0LWNvcmUvanMvZGVwcmVjYXRpb25XYXJuaW5nLmpzJztcbmltcG9ydCBvcHRpb25pemUsIHsgY29tYmluZU9wdGlvbnMsIEVtcHR5U2VsZk9wdGlvbnMsIG9wdGlvbml6ZTMgfSBmcm9tICcuLi8uLi8uLi9waGV0LWNvcmUvanMvb3B0aW9uaXplLmpzJztcbmltcG9ydCBJbnRlbnRpb25hbEFueSBmcm9tICcuLi8uLi8uLi9waGV0LWNvcmUvanMvdHlwZXMvSW50ZW50aW9uYWxBbnkuanMnO1xuaW1wb3J0IFBoZXRpb09iamVjdCwgeyBQaGV0aW9PYmplY3RPcHRpb25zIH0gZnJvbSAnLi4vLi4vLi4vdGFuZGVtL2pzL1BoZXRpb09iamVjdC5qcyc7XG5pbXBvcnQgVGFuZGVtIGZyb20gJy4uLy4uLy4uL3RhbmRlbS9qcy9UYW5kZW0uanMnO1xuaW1wb3J0IEJvb2xlYW5JTyBmcm9tICcuLi8uLi8uLi90YW5kZW0vanMvdHlwZXMvQm9vbGVhbklPLmpzJztcbmltcG9ydCBJT1R5cGUgZnJvbSAnLi4vLi4vLi4vdGFuZGVtL2pzL3R5cGVzL0lPVHlwZS5qcyc7XG5pbXBvcnQgeyBBQ0NFU1NJQklMSVRZX09QVElPTl9LRVlTLCBDYW52YXNDb250ZXh0V3JhcHBlciwgQ2FudmFzU2VsZkRyYXdhYmxlLCBEaXNwbGF5LCBET01TZWxmRHJhd2FibGUsIERyYXdhYmxlLCBGZWF0dXJlcywgRmlsdGVyLCBob3RrZXlNYW5hZ2VyLCBJbWFnZSwgSW1hZ2VPcHRpb25zLCBJbnN0YW5jZSwgaXNIZWlnaHRTaXphYmxlLCBpc1dpZHRoU2l6YWJsZSwgTGF5b3V0Q29uc3RyYWludCwgTW91c2UsIFBhcmFsbGVsRE9NLCBQYXJhbGxlbERPTU9wdGlvbnMsIFBpY2tlciwgUG9pbnRlciwgUmVuZGVyZXIsIFJlbmRlcmVyU3VtbWFyeSwgc2NlbmVyeSwgc2VyaWFsaXplQ29ubmVjdGVkTm9kZXMsIFNWR1NlbGZEcmF3YWJsZSwgVElucHV0TGlzdGVuZXIsIFRMYXlvdXRPcHRpb25zLCBUcmFpbCwgV2ViR0xTZWxmRHJhd2FibGUgfSBmcm9tICcuLi9pbXBvcnRzLmpzJztcbmltcG9ydCBTY2VuZXJ5UXVlcnlQYXJhbWV0ZXJzIGZyb20gJy4uL1NjZW5lcnlRdWVyeVBhcmFtZXRlcnMuanMnO1xuXG5sZXQgZ2xvYmFsSWRDb3VudGVyID0gMTtcblxuY29uc3Qgc2NyYXRjaEJvdW5kczIgPSBCb3VuZHMyLk5PVEhJTkcuY29weSgpOyAvLyBtdXRhYmxlIHtCb3VuZHMyfSB1c2VkIHRlbXBvcmFyaWx5IGluIG1ldGhvZHNcbmNvbnN0IHNjcmF0Y2hCb3VuZHMyRXh0cmEgPSBCb3VuZHMyLk5PVEhJTkcuY29weSgpOyAvLyBtdXRhYmxlIHtCb3VuZHMyfSB1c2VkIHRlbXBvcmFyaWx5IGluIG1ldGhvZHNcbmNvbnN0IHNjcmF0Y2hNYXRyaXgzID0gbmV3IE1hdHJpeDMoKTtcblxuY29uc3QgRU5BQkxFRF9QUk9QRVJUWV9UQU5ERU1fTkFNRSA9IEVuYWJsZWRQcm9wZXJ0eS5UQU5ERU1fTkFNRTtcbmNvbnN0IFZJU0lCTEVfUFJPUEVSVFlfVEFOREVNX05BTUUgPSAndmlzaWJsZVByb3BlcnR5JztcbmNvbnN0IElOUFVUX0VOQUJMRURfUFJPUEVSVFlfVEFOREVNX05BTUUgPSAnaW5wdXRFbmFibGVkUHJvcGVydHknO1xuXG5jb25zdCBQSEVUX0lPX1NUQVRFX0RFRkFVTFQgPSBmYWxzZTtcblxuLy8gU3RvcmUgdGhlIG51bWJlciBvZiBwYXJlbnRzIGZyb20gdGhlIHNpbmdsZSBOb2RlIGluc3RhbmNlIHRoYXQgaGFzIHRoZSBtb3N0IHBhcmVudHMgaW4gdGhlIHdob2xlIHJ1bnRpbWUuXG5sZXQgbWF4UGFyZW50Q291bnQgPSAwO1xuXG4vLyBTdG9yZSB0aGUgbnVtYmVyIG9mIGNoaWxkcmVuIGZyb20gdGhlIHNpbmdsZSBOb2RlIGluc3RhbmNlIHRoYXQgaGFzIHRoZSBtb3N0IGNoaWxkcmVuIGluIHRoZSB3aG9sZSBydW50aW1lLlxubGV0IG1heENoaWxkQ291bnQgPSAwO1xuXG5leHBvcnQgY29uc3QgUkVRVUlSRVNfQk9VTkRTX09QVElPTl9LRVlTID0gW1xuICAnbGVmdFRvcCcsIC8vIHtWZWN0b3IyfSAtIFRoZSB1cHBlci1sZWZ0IGNvcm5lciBvZiB0aGlzIE5vZGUncyBib3VuZHMsIHNlZSBzZXRMZWZ0VG9wKCkgZm9yIG1vcmUgZG9jdW1lbnRhdGlvblxuICAnY2VudGVyVG9wJywgLy8ge1ZlY3RvcjJ9IC0gVGhlIHRvcC1jZW50ZXIgb2YgdGhpcyBOb2RlJ3MgYm91bmRzLCBzZWUgc2V0Q2VudGVyVG9wKCkgZm9yIG1vcmUgZG9jdW1lbnRhdGlvblxuICAncmlnaHRUb3AnLCAvLyB7VmVjdG9yMn0gLSBUaGUgdXBwZXItcmlnaHQgY29ybmVyIG9mIHRoaXMgTm9kZSdzIGJvdW5kcywgc2VlIHNldFJpZ2h0VG9wKCkgZm9yIG1vcmUgZG9jdW1lbnRhdGlvblxuICAnbGVmdENlbnRlcicsIC8vIHtWZWN0b3IyfSAtIFRoZSBsZWZ0LWNlbnRlciBvZiB0aGlzIE5vZGUncyBib3VuZHMsIHNlZSBzZXRMZWZ0Q2VudGVyKCkgZm9yIG1vcmUgZG9jdW1lbnRhdGlvblxuICAnY2VudGVyJywgLy8ge1ZlY3RvcjJ9IC0gVGhlIGNlbnRlciBvZiB0aGlzIE5vZGUncyBib3VuZHMsIHNlZSBzZXRDZW50ZXIoKSBmb3IgbW9yZSBkb2N1bWVudGF0aW9uXG4gICdyaWdodENlbnRlcicsIC8vIHtWZWN0b3IyfSAtIFRoZSBjZW50ZXItcmlnaHQgb2YgdGhpcyBOb2RlJ3MgYm91bmRzLCBzZWUgc2V0UmlnaHRDZW50ZXIoKSBmb3IgbW9yZSBkb2N1bWVudGF0aW9uXG4gICdsZWZ0Qm90dG9tJywgLy8ge1ZlY3RvcjJ9IC0gVGhlIGJvdHRvbS1sZWZ0IG9mIHRoaXMgTm9kZSdzIGJvdW5kcywgc2VlIHNldExlZnRCb3R0b20oKSBmb3IgbW9yZSBkb2N1bWVudGF0aW9uXG4gICdjZW50ZXJCb3R0b20nLCAvLyB7VmVjdG9yMn0gLSBUaGUgbWlkZGxlIGNlbnRlciBvZiB0aGlzIE5vZGUncyBib3VuZHMsIHNlZSBzZXRDZW50ZXJCb3R0b20oKSBmb3IgbW9yZSBkb2N1bWVudGF0aW9uXG4gICdyaWdodEJvdHRvbScsIC8vIHtWZWN0b3IyfSAtIFRoZSBib3R0b20gcmlnaHQgb2YgdGhpcyBOb2RlJ3MgYm91bmRzLCBzZWUgc2V0UmlnaHRCb3R0b20oKSBmb3IgbW9yZSBkb2N1bWVudGF0aW9uXG4gICdsZWZ0JywgLy8ge251bWJlcn0gLSBUaGUgbGVmdCBzaWRlIG9mIHRoaXMgTm9kZSdzIGJvdW5kcywgc2VlIHNldExlZnQoKSBmb3IgbW9yZSBkb2N1bWVudGF0aW9uXG4gICdyaWdodCcsIC8vIHtudW1iZXJ9IC0gVGhlIHJpZ2h0IHNpZGUgb2YgdGhpcyBOb2RlJ3MgYm91bmRzLCBzZWUgc2V0UmlnaHQoKSBmb3IgbW9yZSBkb2N1bWVudGF0aW9uXG4gICd0b3AnLCAvLyB7bnVtYmVyfSAtIFRoZSB0b3Agc2lkZSBvZiB0aGlzIE5vZGUncyBib3VuZHMsIHNlZSBzZXRUb3AoKSBmb3IgbW9yZSBkb2N1bWVudGF0aW9uXG4gICdib3R0b20nLCAvLyB7bnVtYmVyfSAtIFRoZSBib3R0b20gc2lkZSBvZiB0aGlzIE5vZGUncyBib3VuZHMsIHNlZSBzZXRCb3R0b20oKSBmb3IgbW9yZSBkb2N1bWVudGF0aW9uXG4gICdjZW50ZXJYJywgLy8ge251bWJlcn0gLSBUaGUgeC1jZW50ZXIgb2YgdGhpcyBOb2RlJ3MgYm91bmRzLCBzZWUgc2V0Q2VudGVyWCgpIGZvciBtb3JlIGRvY3VtZW50YXRpb25cbiAgJ2NlbnRlclknIC8vIHtudW1iZXJ9IC0gVGhlIHktY2VudGVyIG9mIHRoaXMgTm9kZSdzIGJvdW5kcywgc2VlIHNldENlbnRlclkoKSBmb3IgbW9yZSBkb2N1bWVudGF0aW9uXG5dO1xuXG4vLyBOb2RlIG9wdGlvbnMsIGluIHRoZSBvcmRlciB0aGV5IGFyZSBleGVjdXRlZCBpbiB0aGUgY29uc3RydWN0b3IvbXV0YXRlKClcbmNvbnN0IE5PREVfT1BUSU9OX0tFWVMgPSBbXG4gICdjaGlsZHJlbicsIC8vIExpc3Qgb2YgY2hpbGRyZW4gdG8gYWRkIChpbiBvcmRlciksIHNlZSBzZXRDaGlsZHJlbiBmb3IgbW9yZSBkb2N1bWVudGF0aW9uXG4gICdjdXJzb3InLCAvLyBDU1MgY3Vyc29yIHRvIGRpc3BsYXkgd2hlbiBvdmVyIHRoaXMgTm9kZSwgc2VlIHNldEN1cnNvcigpIGZvciBtb3JlIGRvY3VtZW50YXRpb25cblxuICAncGhldGlvVmlzaWJsZVByb3BlcnR5SW5zdHJ1bWVudGVkJywgLy8gV2hlbiB0cnVlLCBjcmVhdGUgYW4gaW5zdHJ1bWVudGVkIHZpc2libGVQcm9wZXJ0eSB3aGVuIHRoaXMgTm9kZSBpcyBpbnN0cnVtZW50ZWQsIHNlZSBzZXRQaGV0aW9WaXNpYmxlUHJvcGVydHlJbnN0cnVtZW50ZWQoKSBmb3IgbW9yZSBkb2N1bWVudGF0aW9uXG4gICd2aXNpYmxlUHJvcGVydHknLCAvLyBTZXRzIGZvcndhcmRpbmcgb2YgdGhlIHZpc2libGVQcm9wZXJ0eSwgc2VlIHNldFZpc2libGVQcm9wZXJ0eSgpIGZvciBtb3JlIGRvY3VtZW50YXRpb25cbiAgJ3Zpc2libGUnLCAvLyBXaGV0aGVyIHRoZSBOb2RlIGlzIHZpc2libGUsIHNlZSBzZXRWaXNpYmxlKCkgZm9yIG1vcmUgZG9jdW1lbnRhdGlvblxuXG4gICdwaWNrYWJsZVByb3BlcnR5JywgLy8gU2V0cyBmb3J3YXJkaW5nIG9mIHRoZSBwaWNrYWJsZVByb3BlcnR5LCBzZWUgc2V0UGlja2FibGVQcm9wZXJ0eSgpIGZvciBtb3JlIGRvY3VtZW50YXRpb25cbiAgJ3BpY2thYmxlJywgLy8gV2hldGhlciB0aGUgTm9kZSBpcyBwaWNrYWJsZSwgc2VlIHNldFBpY2thYmxlKCkgZm9yIG1vcmUgZG9jdW1lbnRhdGlvblxuXG4gICdwaGV0aW9FbmFibGVkUHJvcGVydHlJbnN0cnVtZW50ZWQnLCAvLyBXaGVuIHRydWUsIGNyZWF0ZSBhbiBpbnN0cnVtZW50ZWQgZW5hYmxlZFByb3BlcnR5IHdoZW4gdGhpcyBOb2RlIGlzIGluc3RydW1lbnRlZCwgc2VlIHNldFBoZXRpb0VuYWJsZWRQcm9wZXJ0eUluc3RydW1lbnRlZCgpIGZvciBtb3JlIGRvY3VtZW50YXRpb25cbiAgJ2VuYWJsZWRQcm9wZXJ0eScsIC8vIFNldHMgZm9yd2FyZGluZyBvZiB0aGUgZW5hYmxlZFByb3BlcnR5LCBzZWUgc2V0RW5hYmxlZFByb3BlcnR5KCkgZm9yIG1vcmUgZG9jdW1lbnRhdGlvblxuICAnZW5hYmxlZCcsIC8vIFdoZXRoZXIgdGhlIE5vZGUgaXMgZW5hYmxlZCwgc2VlIHNldEVuYWJsZWQoKSBmb3IgbW9yZSBkb2N1bWVudGF0aW9uXG5cbiAgJ3BoZXRpb0lucHV0RW5hYmxlZFByb3BlcnR5SW5zdHJ1bWVudGVkJywgLy8gV2hlbiB0cnVlLCBjcmVhdGUgYW4gaW5zdHJ1bWVudGVkIGlucHV0RW5hYmxlZFByb3BlcnR5IHdoZW4gdGhpcyBOb2RlIGlzIGluc3RydW1lbnRlZCwgc2VlIHNldFBoZXRpb0lucHV0RW5hYmxlZFByb3BlcnR5SW5zdHJ1bWVudGVkKCkgZm9yIG1vcmUgZG9jdW1lbnRhdGlvblxuICAnaW5wdXRFbmFibGVkUHJvcGVydHknLCAvLyBTZXRzIGZvcndhcmRpbmcgb2YgdGhlIGlucHV0RW5hYmxlZFByb3BlcnR5LCBzZWUgc2V0SW5wdXRFbmFibGVkUHJvcGVydHkoKSBmb3IgbW9yZSBkb2N1bWVudGF0aW9uXG4gICdpbnB1dEVuYWJsZWQnLCAvLyB7Ym9vbGVhbn0gV2hldGhlciBpbnB1dCBldmVudHMgY2FuIHJlYWNoIGludG8gdGhpcyBzdWJ0cmVlLCBzZWUgc2V0SW5wdXRFbmFibGVkKCkgZm9yIG1vcmUgZG9jdW1lbnRhdGlvblxuICAnaW5wdXRMaXN0ZW5lcnMnLCAvLyBUaGUgaW5wdXQgbGlzdGVuZXJzIGF0dGFjaGVkIHRvIHRoZSBOb2RlLCBzZWUgc2V0SW5wdXRMaXN0ZW5lcnMoKSBmb3IgbW9yZSBkb2N1bWVudGF0aW9uXG4gICdvcGFjaXR5JywgLy8gT3BhY2l0eSBvZiB0aGlzIE5vZGUncyBzdWJ0cmVlLCBzZWUgc2V0T3BhY2l0eSgpIGZvciBtb3JlIGRvY3VtZW50YXRpb25cbiAgJ2Rpc2FibGVkT3BhY2l0eScsIC8vIEEgbXVsdGlwbGllciB0byB0aGUgb3BhY2l0eSBvZiB0aGlzIE5vZGUncyBzdWJ0cmVlIHdoZW4gdGhlIG5vZGUgaXMgZGlzYWJsZWQsIHNlZSBzZXREaXNhYmxlZE9wYWNpdHkoKSBmb3IgbW9yZSBkb2N1bWVudGF0aW9uXG4gICdmaWx0ZXJzJywgLy8gTm9uLW9wYWNpdHkgZmlsdGVycywgc2VlIHNldEZpbHRlcnMoKSBmb3IgbW9yZSBkb2N1bWVudGF0aW9uXG4gICdtYXRyaXgnLCAvLyBUcmFuc2Zvcm1hdGlvbiBtYXRyaXggb2YgdGhlIE5vZGUsIHNlZSBzZXRNYXRyaXgoKSBmb3IgbW9yZSBkb2N1bWVudGF0aW9uXG4gICd0cmFuc2xhdGlvbicsIC8vIHgveSB0cmFuc2xhdGlvbiBvZiB0aGUgTm9kZSwgc2VlIHNldFRyYW5zbGF0aW9uKCkgZm9yIG1vcmUgZG9jdW1lbnRhdGlvblxuICAneCcsIC8vIHggdHJhbnNsYXRpb24gb2YgdGhlIE5vZGUsIHNlZSBzZXRYKCkgZm9yIG1vcmUgZG9jdW1lbnRhdGlvblxuICAneScsIC8vIHkgdHJhbnNsYXRpb24gb2YgdGhlIE5vZGUsIHNlZSBzZXRZKCkgZm9yIG1vcmUgZG9jdW1lbnRhdGlvblxuICAncm90YXRpb24nLCAvLyByb3RhdGlvbiAoaW4gcmFkaWFucykgb2YgdGhlIE5vZGUsIHNlZSBzZXRSb3RhdGlvbigpIGZvciBtb3JlIGRvY3VtZW50YXRpb25cbiAgJ3NjYWxlJywgLy8gc2NhbGUgb2YgdGhlIE5vZGUsIHNlZSBzY2FsZSgpIGZvciBtb3JlIGRvY3VtZW50YXRpb25cbiAgJ2V4Y2x1ZGVJbnZpc2libGVDaGlsZHJlbkZyb21Cb3VuZHMnLCAvLyBDb250cm9scyBib3VuZHMgZGVwZW5kaW5nIG9uIGNoaWxkIHZpc2liaWxpdHksIHNlZSBzZXRFeGNsdWRlSW52aXNpYmxlQ2hpbGRyZW5Gcm9tQm91bmRzKCkgZm9yIG1vcmUgZG9jdW1lbnRhdGlvblxuICAnaW50ZXJydXB0U3VidHJlZU9uSW52aXNpYmxlJywgLy8gSW50ZXJydXB0cyBzdWJ0cmVlIGlucHV0IGV2ZW50cyB3aGVuIG1hZGUgaW52aXNpYmxlLlxuICAnbGF5b3V0T3B0aW9ucycsIC8vIFByb3ZpZGVkIHRvIGxheW91dCBjb250YWluZXJzIGZvciBvcHRpb25zLCBzZWUgc2V0TGF5b3V0T3B0aW9ucygpIGZvciBtb3JlIGRvY3VtZW50YXRpb25cbiAgJ2xvY2FsQm91bmRzJywgLy8gYm91bmRzIG9mIHN1YnRyZWUgaW4gbG9jYWwgY29vcmRpbmF0ZSBmcmFtZSwgc2VlIHNldExvY2FsQm91bmRzKCkgZm9yIG1vcmUgZG9jdW1lbnRhdGlvblxuICAnbWF4V2lkdGgnLCAvLyBDb25zdHJhaW5zIHdpZHRoIG9mIHRoaXMgTm9kZSwgc2VlIHNldE1heFdpZHRoKCkgZm9yIG1vcmUgZG9jdW1lbnRhdGlvblxuICAnbWF4SGVpZ2h0JywgLy8gQ29uc3RyYWlucyBoZWlnaHQgb2YgdGhpcyBOb2RlLCBzZWUgc2V0TWF4SGVpZ2h0KCkgZm9yIG1vcmUgZG9jdW1lbnRhdGlvblxuICAncmVuZGVyZXInLCAvLyBUaGUgcHJlZmVycmVkIHJlbmRlcmVyIGZvciB0aGlzIHN1YnRyZWUsIHNlZSBzZXRSZW5kZXJlcigpIGZvciBtb3JlIGRvY3VtZW50YXRpb25cbiAgJ2xheWVyU3BsaXQnLCAvLyBGb3JjZXMgdGhpcyBzdWJ0cmVlIGludG8gYSBsYXllciBvZiBpdHMgb3duLCBzZWUgc2V0TGF5ZXJTcGxpdCgpIGZvciBtb3JlIGRvY3VtZW50YXRpb25cbiAgJ3VzZXNPcGFjaXR5JywgLy8gSGludCB0aGF0IG9wYWNpdHkgd2lsbCBiZSBjaGFuZ2VkLCBzZWUgc2V0VXNlc09wYWNpdHkoKSBmb3IgbW9yZSBkb2N1bWVudGF0aW9uXG4gICdjc3NUcmFuc2Zvcm0nLCAvLyBIaW50IHRoYXQgY2FuIHRyaWdnZXIgdXNpbmcgQ1NTIHRyYW5zZm9ybXMsIHNlZSBzZXRDc3NUcmFuc2Zvcm0oKSBmb3IgbW9yZSBkb2N1bWVudGF0aW9uXG4gICdleGNsdWRlSW52aXNpYmxlJywgLy8gSWYgdGhpcyBpcyBpbnZpc2libGUsIGV4Y2x1ZGUgZnJvbSBET00sIHNlZSBzZXRFeGNsdWRlSW52aXNpYmxlKCkgZm9yIG1vcmUgZG9jdW1lbnRhdGlvblxuICAnd2ViZ2xTY2FsZScsIC8vIEhpbnQgdG8gYWRqdXN0IFdlYkdMIHNjYWxpbmcgcXVhbGl0eSBmb3IgdGhpcyBzdWJ0cmVlLCBzZWUgc2V0V2ViZ2xTY2FsZSgpIGZvciBtb3JlIGRvY3VtZW50YXRpb25cbiAgJ3ByZXZlbnRGaXQnLCAvLyBQcmV2ZW50cyBsYXllcnMgZnJvbSBmaXR0aW5nIHRoaXMgc3VidHJlZSwgc2VlIHNldFByZXZlbnRGaXQoKSBmb3IgbW9yZSBkb2N1bWVudGF0aW9uXG4gICdtb3VzZUFyZWEnLCAvLyBDaGFuZ2VzIHRoZSBhcmVhIHRoZSBtb3VzZSBjYW4gaW50ZXJhY3Qgd2l0aCwgc2VlIHNldE1vdXNlQXJlYSgpIGZvciBtb3JlIGRvY3VtZW50YXRpb25cbiAgJ3RvdWNoQXJlYScsIC8vIENoYW5nZXMgdGhlIGFyZWEgdG91Y2hlcyBjYW4gaW50ZXJhY3Qgd2l0aCwgc2VlIHNldFRvdWNoQXJlYSgpIGZvciBtb3JlIGRvY3VtZW50YXRpb25cbiAgJ2NsaXBBcmVhJywgLy8gTWFrZXMgdGhpbmdzIG91dHNpZGUgb2YgYSBzaGFwZSBpbnZpc2libGUsIHNlZSBzZXRDbGlwQXJlYSgpIGZvciBtb3JlIGRvY3VtZW50YXRpb25cbiAgJ3RyYW5zZm9ybUJvdW5kcycsIC8vIEZsYWcgdGhhdCBtYWtlcyBib3VuZHMgdGlnaHRlciwgc2VlIHNldFRyYW5zZm9ybUJvdW5kcygpIGZvciBtb3JlIGRvY3VtZW50YXRpb25cbiAgLi4uUkVRVUlSRVNfQk9VTkRTX09QVElPTl9LRVlTXG5dO1xuXG5jb25zdCBERUZBVUxUX09QVElPTlMgPSB7XG4gIHBoZXRpb1Zpc2libGVQcm9wZXJ0eUluc3RydW1lbnRlZDogdHJ1ZSxcbiAgdmlzaWJsZTogdHJ1ZSxcbiAgb3BhY2l0eTogMSxcbiAgZGlzYWJsZWRPcGFjaXR5OiAxLFxuICBwaWNrYWJsZTogbnVsbCxcbiAgZW5hYmxlZDogdHJ1ZSxcbiAgcGhldGlvRW5hYmxlZFByb3BlcnR5SW5zdHJ1bWVudGVkOiBmYWxzZSxcbiAgaW5wdXRFbmFibGVkOiB0cnVlLFxuICBwaGV0aW9JbnB1dEVuYWJsZWRQcm9wZXJ0eUluc3RydW1lbnRlZDogZmFsc2UsXG4gIGNsaXBBcmVhOiBudWxsLFxuICBtb3VzZUFyZWE6IG51bGwsXG4gIHRvdWNoQXJlYTogbnVsbCxcbiAgY3Vyc29yOiBudWxsLFxuICB0cmFuc2Zvcm1Cb3VuZHM6IGZhbHNlLFxuICBtYXhXaWR0aDogbnVsbCxcbiAgbWF4SGVpZ2h0OiBudWxsLFxuICByZW5kZXJlcjogbnVsbCxcbiAgdXNlc09wYWNpdHk6IGZhbHNlLFxuICBsYXllclNwbGl0OiBmYWxzZSxcbiAgY3NzVHJhbnNmb3JtOiBmYWxzZSxcbiAgZXhjbHVkZUludmlzaWJsZTogZmFsc2UsXG4gIHdlYmdsU2NhbGU6IG51bGwsXG4gIHByZXZlbnRGaXQ6IGZhbHNlXG59O1xuXG5jb25zdCBERUZBVUxUX0lOVEVSTkFMX1JFTkRFUkVSID0gREVGQVVMVF9PUFRJT05TLnJlbmRlcmVyID09PSBudWxsID8gMCA6IFJlbmRlcmVyLmZyb21OYW1lKCBERUZBVUxUX09QVElPTlMucmVuZGVyZXIgKTtcblxuZXhwb3J0IHR5cGUgUmVuZGVyZXJUeXBlID0gJ3N2ZycgfCAnY2FudmFzJyB8ICd3ZWJnbCcgfCAnZG9tJyB8IG51bGw7XG5cbi8vIElzb2xhdGVkIHNvIHRoYXQgd2UgY2FuIGRlbGF5IG9wdGlvbnMgdGhhdCBhcmUgYmFzZWQgb24gYm91bmRzIG9mIHRoZSBOb2RlIHRvIGFmdGVyIGNvbnN0cnVjdGlvbi5cbi8vIFNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvc2NlbmVyeS9pc3N1ZXMvMTMzMlxuZXhwb3J0IHR5cGUgTm9kZUJvdW5kc0Jhc2VkVHJhbnNsYXRpb25PcHRpb25zID0ge1xuICBsZWZ0VG9wPzogVmVjdG9yMjtcbiAgY2VudGVyVG9wPzogVmVjdG9yMjtcbiAgcmlnaHRUb3A/OiBWZWN0b3IyO1xuICBsZWZ0Q2VudGVyPzogVmVjdG9yMjtcbiAgY2VudGVyPzogVmVjdG9yMjtcbiAgcmlnaHRDZW50ZXI/OiBWZWN0b3IyO1xuICBsZWZ0Qm90dG9tPzogVmVjdG9yMjtcbiAgY2VudGVyQm90dG9tPzogVmVjdG9yMjtcbiAgcmlnaHRCb3R0b20/OiBWZWN0b3IyO1xuICBsZWZ0PzogbnVtYmVyO1xuICByaWdodD86IG51bWJlcjtcbiAgdG9wPzogbnVtYmVyO1xuICBib3R0b20/OiBudW1iZXI7XG4gIGNlbnRlclg/OiBudW1iZXI7XG4gIGNlbnRlclk/OiBudW1iZXI7XG59O1xuXG4vLyBBbGwgdHJhbnNsYXRpb24gb3B0aW9ucyAoaW5jbHVkZXMgdGhvc2UgYmFzZWQgb24gYm91bmRzIGFuZCB0aG9zZSB0aGF0IGFyZSBub3QpXG5leHBvcnQgdHlwZSBOb2RlVHJhbnNsYXRpb25PcHRpb25zID0ge1xuICB0cmFuc2xhdGlvbj86IFZlY3RvcjI7XG4gIHg/OiBudW1iZXI7XG4gIHk/OiBudW1iZXI7XG59ICYgTm9kZUJvdW5kc0Jhc2VkVHJhbnNsYXRpb25PcHRpb25zO1xuXG4vLyBBbGwgdHJhbnNmb3JtIG9wdGlvbnMgKGluY2x1ZGVzIHRyYW5zbGF0aW9uIG9wdGlvbnMpXG5leHBvcnQgdHlwZSBOb2RlVHJhbnNmb3JtT3B0aW9ucyA9IHtcbiAgbWF0cml4PzogTWF0cml4MztcbiAgcm90YXRpb24/OiBudW1iZXI7XG4gIHNjYWxlPzogbnVtYmVyIHwgVmVjdG9yMjtcbn0gJiBOb2RlVHJhbnNsYXRpb25PcHRpb25zO1xuXG4vLyBBbGwgYmFzZSBOb2RlIG9wdGlvbnNcbmV4cG9ydCB0eXBlIE5vZGVPcHRpb25zID0ge1xuICBjaGlsZHJlbj86IE5vZGVbXTtcbiAgY3Vyc29yPzogc3RyaW5nIHwgbnVsbDtcbiAgcGhldGlvVmlzaWJsZVByb3BlcnR5SW5zdHJ1bWVudGVkPzogYm9vbGVhbjtcbiAgdmlzaWJsZVByb3BlcnR5PzogVFJlYWRPbmx5UHJvcGVydHk8Ym9vbGVhbj4gfCBudWxsO1xuICB2aXNpYmxlPzogYm9vbGVhbjtcbiAgcGlja2FibGVQcm9wZXJ0eT86IFRSZWFkT25seVByb3BlcnR5PGJvb2xlYW4gfCBudWxsPiB8IG51bGw7XG4gIHBpY2thYmxlPzogYm9vbGVhbiB8IG51bGw7XG4gIHBoZXRpb0VuYWJsZWRQcm9wZXJ0eUluc3RydW1lbnRlZD86IGJvb2xlYW47XG4gIGVuYWJsZWRQcm9wZXJ0eT86IFRSZWFkT25seVByb3BlcnR5PGJvb2xlYW4+IHwgbnVsbDtcbiAgZW5hYmxlZD86IGJvb2xlYW47XG4gIHBoZXRpb0lucHV0RW5hYmxlZFByb3BlcnR5SW5zdHJ1bWVudGVkPzogYm9vbGVhbjtcbiAgaW5wdXRFbmFibGVkUHJvcGVydHk/OiBUUmVhZE9ubHlQcm9wZXJ0eTxib29sZWFuPiB8IG51bGw7XG4gIGlucHV0RW5hYmxlZD86IGJvb2xlYW47XG4gIGlucHV0TGlzdGVuZXJzPzogVElucHV0TGlzdGVuZXJbXTtcbiAgb3BhY2l0eT86IG51bWJlcjtcbiAgZGlzYWJsZWRPcGFjaXR5PzogbnVtYmVyO1xuICBmaWx0ZXJzPzogRmlsdGVyW107XG4gIGV4Y2x1ZGVJbnZpc2libGVDaGlsZHJlbkZyb21Cb3VuZHM/OiBib29sZWFuO1xuICBpbnRlcnJ1cHRTdWJ0cmVlT25JbnZpc2libGU/OiBib29sZWFuO1xuICBsYXlvdXRPcHRpb25zPzogVExheW91dE9wdGlvbnMgfCBudWxsO1xuICBsb2NhbEJvdW5kcz86IEJvdW5kczIgfCBudWxsO1xuICBtYXhXaWR0aD86IG51bWJlciB8IG51bGw7XG4gIG1heEhlaWdodD86IG51bWJlciB8IG51bGw7XG4gIHJlbmRlcmVyPzogUmVuZGVyZXJUeXBlO1xuICBsYXllclNwbGl0PzogYm9vbGVhbjtcbiAgdXNlc09wYWNpdHk/OiBib29sZWFuO1xuICBjc3NUcmFuc2Zvcm0/OiBib29sZWFuO1xuICBleGNsdWRlSW52aXNpYmxlPzogYm9vbGVhbjtcbiAgd2ViZ2xTY2FsZT86IG51bWJlciB8IG51bGw7XG4gIHByZXZlbnRGaXQ/OiBib29sZWFuO1xuICBtb3VzZUFyZWE/OiBTaGFwZSB8IEJvdW5kczIgfCBudWxsO1xuICB0b3VjaEFyZWE/OiBTaGFwZSB8IEJvdW5kczIgfCBudWxsO1xuICBjbGlwQXJlYT86IFNoYXBlIHwgbnVsbDtcbiAgdHJhbnNmb3JtQm91bmRzPzogYm9vbGVhbjtcblxuICAvLyBUaGlzIG9wdGlvbiBpcyB1c2VkIHRvIGNyZWF0ZSB0aGUgaW5zdHJ1bWVudGVkLCBkZWZhdWx0IFBoRVQtaU8gdmlzaWJsZVByb3BlcnR5LiBUaGVzZSBvcHRpb25zIHNob3VsZCBub3RcbiAgLy8gYmUgcHJvdmlkZWQgaWYgYSBgdmlzaWJsZVByb3BlcnR5YCB3YXMgcHJvdmlkZWQgdG8gdGhpcyBOb2RlLCB0aG91Z2ggaWYgdGhleSBhcmUsIHRoZXkgd2lsbCBqdXN0IGJlIGlnbm9yZWQuXG4gIC8vIFRoaXMgZ3JhY2UgaXMgdG8gc3VwcG9ydCBkZWZhdWx0IG9wdGlvbnMgYWNyb3NzIHRoZSBjb21wb25lbnQgaGllcmFyY2h5IG1lbGRpbmcgd2l0aCB1c2FnZXMgcHJvdmlkaW5nIGEgdmlzaWJsZVByb3BlcnR5LlxuICAvLyBUaGlzIG9wdGlvbiBpcyBhIGJpdCBidXJpZWQgYmVjYXVzZSBpdCBjYW4gb25seSBiZSB1c2VkIHdoZW4gdGhlIE5vZGUgaXMgYmVpbmcgaW5zdHJ1bWVudGVkLCB3aGljaCBpcyB3aGVuXG4gIC8vIHRoZSBkZWZhdWx0LCBpbnN0cnVtZW50ZWQgdmlzaWJsZVByb3BlcnR5IGlzIGNvbmRpdGlvbmFsbHkgY3JlYXRlZC4gV2UgZG9uJ3Qgd2FudCB0byBzdG9yZSB0aGVzZSBvbiB0aGUgTm9kZSxcbiAgLy8gYW5kIHRodXMgdGhleSBhcmVuJ3Qgc3VwcG9ydCB0aHJvdWdoIGBtdXRhdGUoKWAuXG4gIHZpc2libGVQcm9wZXJ0eU9wdGlvbnM/OiBQcm9wZXJ0eU9wdGlvbnM8Ym9vbGVhbj47XG4gIGVuYWJsZWRQcm9wZXJ0eU9wdGlvbnM/OiBQcm9wZXJ0eU9wdGlvbnM8Ym9vbGVhbj47XG4gIGlucHV0RW5hYmxlZFByb3BlcnR5T3B0aW9ucz86IFByb3BlcnR5T3B0aW9uczxib29sZWFuPjtcbn0gJiBQYXJhbGxlbERPTU9wdGlvbnMgJiBOb2RlVHJhbnNmb3JtT3B0aW9ucztcblxudHlwZSBSYXN0ZXJpemVkT3B0aW9ucyA9IHtcblxuICAvLyB7bnVtYmVyfSAtIENvbnRyb2xzIHRoZSByZXNvbHV0aW9uIG9mIHRoZSBpbWFnZSByZWxhdGl2ZSB0byB0aGUgbG9jYWwgdmlldyB1bml0cy4gRm9yIGV4YW1wbGUsIGlmIG91ciBOb2RlIGlzXG4gIC8vIH4xMDAgdmlldyB1bml0cyBhY3Jvc3MgKGluIHRoZSBsb2NhbCBjb29yZGluYXRlIGZyYW1lKSBidXQgeW91IHdhbnQgdGhlIGltYWdlIHRvIGFjdHVhbGx5IGhhdmUgYSB+MjAwLXBpeGVsXG4gIC8vIHJlc29sdXRpb24sIHByb3ZpZGUgcmVzb2x1dGlvbjoyLlxuICAvLyBEZWZhdWx0cyB0byAxLjBcbiAgcmVzb2x1dGlvbj86IG51bWJlcjtcblxuICAvLyB7Qm91bmRzMnxudWxsfSAtIElmIHByb3ZpZGVkLCBpdCB3aWxsIGNvbnRyb2wgdGhlIHgveS93aWR0aC9oZWlnaHQgb2YgdGhlIHRvQ2FudmFzIGNhbGwuIFNlZSB0b0NhbnZhcyBmb3JcbiAgLy8gZGV0YWlscyBvbiBob3cgdGhpcyBjb250cm9scyB0aGUgcmFzdGVyaXphdGlvbi4gVGhpcyBpcyBpbiB0aGUgXCJwYXJlbnRcIiBjb29yZGluYXRlIGZyYW1lLCBzaW1pbGFyIHRvXG4gIC8vIG5vZGUuYm91bmRzLlxuICAvLyBEZWZhdWx0cyB0byBudWxsXG4gIHNvdXJjZUJvdW5kcz86IEJvdW5kczIgfCBudWxsO1xuXG4gIC8vIHtib29sZWFufSAtIElmIHRydWUsIHRoZSBsb2NhbEJvdW5kcyBvZiB0aGUgcmVzdWx0IHdpbGwgYmUgc2V0IGluIGEgd2F5IHN1Y2ggdGhhdCBpdCB3aWxsIHByZWNpc2VseSBtYXRjaFxuICAvLyB0aGUgdmlzaWJsZSBib3VuZHMgb2YgdGhlIG9yaWdpbmFsIE5vZGUgKHRoaXMpLiBOb3RlIHRoYXQgYW50aWFsaWFzZWQgY29udGVudCAod2l0aCBhIG11Y2ggbG93ZXIgcmVzb2x1dGlvbilcbiAgLy8gbWF5IHNvbWV3aGF0IHNwaWxsIG91dHNpZGUgdGhlc2UgYm91bmRzIGlmIHRoaXMgaXMgc2V0IHRvIHRydWUuIFVzdWFsbHkgdGhpcyBpcyBmaW5lIGFuZCBzaG91bGQgYmUgdGhlXG4gIC8vIHJlY29tbWVuZGVkIG9wdGlvbi4gSWYgc291cmNlQm91bmRzIGFyZSBwcm92aWRlZCwgdGhleSB3aWxsIHJlc3RyaWN0IHRoZSB1c2VkIGJvdW5kcyAoc28gaXQgd2lsbCBqdXN0XG4gIC8vIHJlcHJlc2VudCB0aGUgYm91bmRzIG9mIHRoZSBzbGljZWQgcGFydCBvZiB0aGUgaW1hZ2UpLlxuICAvLyBEZWZhdWx0cyB0byB0cnVlXG4gIHVzZVRhcmdldEJvdW5kcz86IGJvb2xlYW47XG5cbiAgLy8ge2Jvb2xlYW59IC0gSWYgdHJ1ZSwgdGhlIGNyZWF0ZWQgSW1hZ2UgTm9kZSBnZXRzIHdyYXBwZWQgaW4gYW4gZXh0cmEgTm9kZSBzbyB0aGF0IGl0IGNhbiBiZSB0cmFuc2Zvcm1lZFxuICAvLyBpbmRlcGVuZGVudGx5LiBJZiB0aGVyZSBpcyBubyBuZWVkIHRvIHRyYW5zZm9ybSB0aGUgcmVzdWx0aW5nIG5vZGUsIHdyYXA6ZmFsc2UgY2FuIGJlIHBhc3NlZCBzbyB0aGF0IG5vIGV4dHJhXG4gIC8vIE5vZGUgaXMgY3JlYXRlZC5cbiAgLy8gRGVmYXVsdHMgdG8gdHJ1ZVxuICB3cmFwPzogYm9vbGVhbjtcblxuICAvLyB7Ym9vbGVhbn0gLSBJZiB0cnVlLCBpdCB3aWxsIGRpcmVjdGx5IHVzZSB0aGUgPGNhbnZhcz4gZWxlbWVudCAob25seSB3b3JrcyB3aXRoIGNhbnZhcy93ZWJnbCByZW5kZXJlcnMpXG4gIC8vIGluc3RlYWQgb2YgY29udmVydGluZyB0aGlzIGludG8gYSBmb3JtIHRoYXQgY2FuIGJlIHVzZWQgd2l0aCBhbnkgcmVuZGVyZXIuIE1heSBoYXZlIHNsaWdodGx5IGJldHRlclxuICAvLyBwZXJmb3JtYW5jZSBpZiBzdmcvZG9tIHJlbmRlcmVycyBkbyBub3QgbmVlZCB0byBiZSB1c2VkLlxuICAvLyBEZWZhdWx0cyB0byBmYWxzZVxuICB1c2VDYW52YXM/OiBib29sZWFuO1xuXG4gIC8vIE9wdGlvbnMgdG8gYmUgcGFzc2VkIHRvIHRoZSBOb2RlIHRoYXQgaXMgcmV0dXJuZWQgYnkgdGhlIHJhc3Rlcml6ZWQgY2FsbCwgdGhpcyBjb3VsZCBiZSB0aGUgZGlyZWN0IEltYWdlIG9yIGFcbiAgLy8gd3JhcHBlZCBOb2RlLCBkZXBlbmRpbmcgb24gdGhlIHZhbHVlIG9mIG9wdGlvbnMud3JhcC4gSW4gZ2VuZXJhbCBpdCBpcyBiZXN0IHRvIHVzZSB0aGlzIG9wdGlvbiwgYW5kIG9ubHkgcHJvdmlkZVxuICAvLyBpbWFnZU9wdGlvbnMgZm9yIHNwZWNpZmljIHJlcXVpcmVtZW50cy4gVGhlc2Ugb3B0aW9ucyB3aWxsIG92ZXJyaWRlIGFueSBpbWFnZU9wdGlvbnMgaWYgd3JhcDpmYWxzZS4gRGVmYXVsdHMgdG8gXFxcbiAgLy8gdGhlIGVtcHR5IG9iamVjdC5cbiAgbm9kZU9wdGlvbnM/OiBOb2RlT3B0aW9ucztcblxuICAvLyBUbyBiZSBwYXNzZWQgdG8gdGhlIEltYWdlIG5vZGUgY3JlYXRlZCBmcm9tIHRoZSByYXN0ZXJpemF0aW9uLiBTZWUgYmVsb3cgZm9yIG9wdGlvbnMgdGhhdCB3aWxsIG92ZXJyaWRlXG4gIC8vIHdoYXQgaXMgcGFzc2VkIGluLiBJbiBnZW5lcmFsLCBpdCBpcyBiZXR0ZXIgdG8gdXNlIG5vZGVPcHRpb25zLiBUaGVzZSBvcHRpb25zIGFyZSBvdmVycmlkZGVuIGJ5IG5vZGVPcHRpb25zIHdoZW5cbiAgLy8gd3JhcDpmYWxzZS4gRGVmYXVsdHMgdG8gdGhlIGVtcHR5IG9iamVjdC5cbiAgaW1hZ2VPcHRpb25zPzogSW1hZ2VPcHRpb25zO1xufTtcblxuY2xhc3MgTm9kZSBleHRlbmRzIFBhcmFsbGVsRE9NIHtcbiAgLy8gTk9URTogQWxsIG1lbWJlciBwcm9wZXJ0aWVzIHdpdGggbmFtZXMgc3RhcnRpbmcgd2l0aCAnXycgYXJlIGFzc3VtZWQgdG8gYmUgcHJpdmF0ZS9wcm90ZWN0ZWQhXG5cbiAgLy8gQXNzaWducyBhIHVuaXF1ZSBJRCB0byB0aGlzIE5vZGUgKGFsbG93cyB0cmFpbHMgdG8gZ2V0IGEgdW5pcXVlIGxpc3Qgb2YgSURzKVxuICBwdWJsaWMgX2lkOiBudW1iZXI7XG5cbiAgLy8gQWxsIG9mIHRoZSBJbnN0YW5jZXMgdHJhY2tpbmcgdGhpcyBOb2RlXG4gIHByaXZhdGUgcmVhZG9ubHkgX2luc3RhbmNlczogSW5zdGFuY2VbXTtcblxuICAvLyBBbGwgZGlzcGxheXMgd2hlcmUgdGhpcyBOb2RlIGlzIHRoZSByb290LiAoc2NlbmVyeS1pbnRlcm5hbClcbiAgcHVibGljIHJlYWRvbmx5IF9yb290ZWREaXNwbGF5czogRGlzcGxheVtdO1xuXG4gIC8vIERyYXdhYmxlIHN0YXRlcyB0aGF0IG5lZWQgdG8gYmUgdXBkYXRlZCBvbiBtdXRhdGlvbnMuIEdlbmVyYWxseSBhZGRlZCBieSBTVkcgYW5kXG4gIC8vIERPTSBlbGVtZW50cyB0aGF0IG5lZWQgdG8gY2xvc2VseSB0cmFjayBzdGF0ZSAocG9zc2libHkgYnkgQ2FudmFzIHRvIG1haW50YWluIGRpcnR5IHN0YXRlKS5cbiAgLy8gKHNjZW5lcnktaW50ZXJuYWwpXG4gIHB1YmxpYyByZWFkb25seSBfZHJhd2FibGVzOiBEcmF3YWJsZVtdO1xuXG4gIC8vIFdoZXRoZXIgdGhpcyBOb2RlIChhbmQgaXRzIGNoaWxkcmVuKSB3aWxsIGJlIHZpc2libGUgd2hlbiB0aGUgc2NlbmUgaXMgdXBkYXRlZC5cbiAgLy8gVmlzaWJsZSBOb2RlcyBieSBkZWZhdWx0IHdpbGwgbm90IGJlIHBpY2thYmxlIGVpdGhlci5cbiAgLy8gTk9URTogVGhpcyBpcyBmaXJlZCBzeW5jaHJvbm91c2x5IHdoZW4gdGhlIHZpc2liaWxpdHkgb2YgdGhlIE5vZGUgaXMgdG9nZ2xlZFxuICBwcml2YXRlIHJlYWRvbmx5IF92aXNpYmxlUHJvcGVydHk6IFRpbnlGb3J3YXJkaW5nUHJvcGVydHk8Ym9vbGVhbj47XG5cbiAgLy8gT3BhY2l0eSwgaW4gdGhlIHJhbmdlIGZyb20gMCAoZnVsbHkgdHJhbnNwYXJlbnQpIHRvIDEgKGZ1bGx5IG9wYXF1ZSkuXG4gIC8vIE5PVEU6IFRoaXMgaXMgZmlyZWQgc3luY2hyb25vdXNseSB3aGVuIHRoZSBvcGFjaXR5IG9mIHRoZSBOb2RlIGlzIHRvZ2dsZWRcbiAgcHVibGljIHJlYWRvbmx5IG9wYWNpdHlQcm9wZXJ0eTogVGlueVByb3BlcnR5PG51bWJlcj47XG5cbiAgLy8gRGlzYWJsZWQgb3BhY2l0eSwgaW4gdGhlIHJhbmdlIGZyb20gMCAoZnVsbHkgdHJhbnNwYXJlbnQpIHRvIDEgKGZ1bGx5IG9wYXF1ZSkuXG4gIC8vIGRpc2FibGVkIG9wYWNpdHkgZGVwZW5kcyBncmVhdGx5IG9uIHRoZSB2YWx1ZSBvZiB0aGlzLm9wYWNpdHkuIFRoaXMgYWN0cyBhcyBhIG11bHRpcGxpZXJcbiAgLy8gQ29tYmluZWQgd2l0aCB0aGUgbm9ybWFsIG9wYWNpdHkgT05MWSB3aGVuIHRoZSBub2RlIGlzIGRpc2FibGVkLiBOb3RlLCB0aGUgcmVuZGVyZWRcbiAgLy8gdG8gdGhhdCB2YWx1ZS4gaS5lLiByZWFkIGRpc2FibGVkT3BhY2l0eSA9IC41IGFzIFwiNTAlIG9mIHRoZSBjdXJyZW50IG9wYWNpdHlcIiwgc28gaWZcbiAgLy8gdGhpcy5vcGFjaXR5IGlzIC41LCB0aGVuIHRoaXMgcmVuZGVycyBhcyAyNSUgb3BhY2l0eSwgc2VlIHRoaXMuZ2V0RWZmZWN0aXZlT3BhY2l0eVxuICAvLyBOT1RFOiBUaGlzIGlzIGZpcmVkIHN5bmNocm9ub3VzbHkgd2hlbiB0aGUgb3BhY2l0eSBvZiB0aGUgTm9kZSBpcyB0b2dnbGVkXG4gIHB1YmxpYyByZWFkb25seSBkaXNhYmxlZE9wYWNpdHlQcm9wZXJ0eTogVGlueVByb3BlcnR5PG51bWJlcj47XG5cbiAgLy8gU2VlIHNldFBpY2thYmxlKCkgYW5kIHNldFBpY2thYmxlUHJvcGVydHkoKVxuICAvLyBOT1RFOiBUaGlzIGlzIGZpcmVkIHN5bmNocm9ub3VzbHkgd2hlbiB0aGUgcGlja2FiaWxpdHkgb2YgdGhlIE5vZGUgaXMgdG9nZ2xlZFxuICBwcml2YXRlIHJlYWRvbmx5IF9waWNrYWJsZVByb3BlcnR5OiBUaW55Rm9yd2FyZGluZ1Byb3BlcnR5PGJvb2xlYW4gfCBudWxsPjtcblxuICAvLyBTZWUgc2V0RW5hYmxlZCgpIGFuZCBzZXRFbmFibGVkUHJvcGVydHkoKVxuICBwcml2YXRlIHJlYWRvbmx5IF9lbmFibGVkUHJvcGVydHk6IFRpbnlGb3J3YXJkaW5nUHJvcGVydHk8Ym9vbGVhbj47XG5cbiAgLy8gV2hldGhlciBpbnB1dCBldmVudCBsaXN0ZW5lcnMgb24gdGhpcyBOb2RlIG9yIGRlc2NlbmRhbnRzIG9uIGEgdHJhaWwgd2lsbCBoYXZlXG4gIC8vIGlucHV0IGxpc3RlbmVycy4gdHJpZ2dlcmVkLiBOb3RlIHRoYXQgdGhpcyBkb2VzIE5PVCBlZmZlY3QgcGlja2luZywgYW5kIG9ubHkgcHJldmVudHMgc29tZSBsaXN0ZW5lcnMgZnJvbSBiZWluZ1xuICAvLyBmaXJlZC5cbiAgcHJpdmF0ZSByZWFkb25seSBfaW5wdXRFbmFibGVkUHJvcGVydHk6IFRpbnlGb3J3YXJkaW5nUHJvcGVydHk8Ym9vbGVhbj47XG5cbiAgLy8gVGhpcyBOb2RlIGFuZCBhbGwgY2hpbGRyZW4gd2lsbCBiZSBjbGlwcGVkIGJ5IHRoaXMgc2hhcGUgKGluIGFkZGl0aW9uIHRvIGFueVxuICAvLyBvdGhlciBjbGlwcGluZyBzaGFwZXMpLiBUaGUgc2hhcGUgc2hvdWxkIGJlIGluIHRoZSBsb2NhbCBjb29yZGluYXRlIGZyYW1lLlxuICAvLyBOT1RFOiBUaGlzIGlzIGZpcmVkIHN5bmNocm9ub3VzbHkgd2hlbiB0aGUgY2xpcEFyZWEgb2YgdGhlIE5vZGUgaXMgdG9nZ2xlZFxuICBwdWJsaWMgcmVhZG9ubHkgY2xpcEFyZWFQcm9wZXJ0eTogVGlueVByb3BlcnR5PFNoYXBlIHwgbnVsbD47XG5cbiAgLy8gV2hldGhlciB0aGlzIE5vZGUgYW5kIGl0cyBzdWJ0cmVlIGNhbiBhbm5vdW5jZSBjb250ZW50IHdpdGggVm9pY2luZyBhbmQgU3BlZWNoU3ludGhlc2lzLiBUaG91Z2hcbiAgLy8gcmVsYXRlZCB0byBWb2ljaW5nIGl0IGV4aXN0cyBpbiBOb2RlIGJlY2F1c2UgaXQgaXMgdXNlZnVsIHRvIHNldCB2b2ljaW5nVmlzaWJsZSBvbiBhIHN1YnRyZWUgd2hlcmUgdGhlXG4gIC8vIHJvb3QgZG9lcyBub3QgY29tcG9zZSBWb2ljaW5nLiBUaGlzIGlzIG5vdCBpZGVhbCBidXQgdGhlIGVudGlyZXR5IG9mIFZvaWNpbmcgY2Fubm90IGJlIGNvbXBvc2VkIGludG8gZXZlcnlcbiAgLy8gTm9kZSBiZWNhdXNlIGl0IHdvdWxkIHByb2R1Y2UgaW5jb3JyZWN0IGJlaGF2aW9ycyBhbmQgaGF2ZSBhIG1hc3NpdmUgbWVtb3J5IGZvb3RwcmludC4gU2VlIHNldFZvaWNpbmdWaXNpYmxlKClcbiAgLy8gYW5kIFZvaWNpbmcudHMgZm9yIG1vcmUgaW5mb3JtYXRpb24gYWJvdXQgVm9pY2luZy5cbiAgcHVibGljIHJlYWRvbmx5IHZvaWNpbmdWaXNpYmxlUHJvcGVydHk6IFRpbnlQcm9wZXJ0eTxib29sZWFuPjtcblxuICAvLyBBcmVhcyBmb3IgaGl0IGludGVyc2VjdGlvbi4gSWYgc2V0IG9uIGEgTm9kZSwgbm8gZGVzY2VuZGFudHMgY2FuIGhhbmRsZSBldmVudHMuXG4gIC8vIChzY2VuZXJ5LWludGVybmFsKVxuICBwdWJsaWMgX21vdXNlQXJlYTogU2hhcGUgfCBCb3VuZHMyIHwgbnVsbDsgLy8gZm9yIG1vdXNlIHBvc2l0aW9uIGluIHRoZSBsb2NhbCBjb29yZGluYXRlIGZyYW1lXG4gIHB1YmxpYyBfdG91Y2hBcmVhOiBTaGFwZSB8IEJvdW5kczIgfCBudWxsOyAvLyBmb3IgdG91Y2ggYW5kIHBlbiBwb3NpdGlvbiBpbiB0aGUgbG9jYWwgY29vcmRpbmF0ZSBmcmFtZVxuXG4gIC8vIFRoZSBDU1MgY3Vyc29yIHRvIGJlIGRpc3BsYXllZCBvdmVyIHRoaXMgTm9kZS4gbnVsbCBzaG91bGQgYmUgdGhlIGRlZmF1bHQgKGluaGVyaXQpIHZhbHVlLlxuICBwcml2YXRlIF9jdXJzb3I6IHN0cmluZyB8IG51bGw7XG5cbiAgLy8gT3JkZXJlZCBhcnJheSBvZiBjaGlsZCBOb2Rlcy5cbiAgLy8gKHNjZW5lcnktaW50ZXJuYWwpXG4gIHB1YmxpYyBfY2hpbGRyZW46IE5vZGVbXTtcblxuICAvLyBVbm9yZGVyZWQgYXJyYXkgb2YgcGFyZW50IE5vZGVzLlxuICAvLyAoc2NlbmVyeS1pbnRlcm5hbClcbiAgcHVibGljIF9wYXJlbnRzOiBOb2RlW107XG5cbiAgLy8gV2hldGhlciB3ZSB3aWxsIGRvIG1vcmUgYWNjdXJhdGUgKGFuZCB0aWdodCkgYm91bmRzIGNvbXB1dGF0aW9ucyBmb3Igcm90YXRpb25zIGFuZCBzaGVhcnMuXG4gIHByaXZhdGUgX3RyYW5zZm9ybUJvdW5kczogYm9vbGVhbjtcblxuICAvLyBTZXQgdXAgdGhlIHRyYW5zZm9ybSByZWZlcmVuY2UuIHdlIGFkZCBhIGxpc3RlbmVyIHNvIHRoYXQgdGhlIHRyYW5zZm9ybSBpdHNlbGYgY2FuIGJlIG1vZGlmaWVkIGRpcmVjdGx5XG4gIC8vIGJ5IHJlZmVyZW5jZSwgdHJpZ2dlcmluZyB0aGUgZXZlbnQgbm90aWZpY2F0aW9ucyBmb3IgU2NlbmVyeSBUaGUgcmVmZXJlbmNlIHRvIHRoZSBUcmFuc2Zvcm0zIHdpbGwgbmV2ZXIgY2hhbmdlLlxuICAvLyAoc2NlbmVyeS1pbnRlcm5hbClcbiAgcHVibGljIF90cmFuc2Zvcm06IFRyYW5zZm9ybTM7XG4gIHB1YmxpYyBfdHJhbnNmb3JtTGlzdGVuZXI6ICgpID0+IHZvaWQ7XG5cbiAgLy8gTWF4aW11bSBkaW1lbnNpb25zIGZvciB0aGUgTm9kZSdzIGxvY2FsIGJvdW5kcyBiZWZvcmUgYSBjb3JyZWN0aXZlIHNjYWxpbmcgZmFjdG9yIGlzIGFwcGxpZWQgdG8gbWFpbnRhaW4gc2l6ZS5cbiAgLy8gVGhlIG1heGltdW0gZGltZW5zaW9ucyBhcmUgYWx3YXlzIGNvbXBhcmVkIHRvIGxvY2FsIGJvdW5kcywgYW5kIGFwcGxpZWQgXCJiZWZvcmVcIiB0aGUgTm9kZSdzIHRyYW5zZm9ybS5cbiAgLy8gV2hlbmV2ZXIgdGhlIGxvY2FsIGJvdW5kcyBvciBtYXhpbXVtIGRpbWVuc2lvbnMgb2YgdGhpcyBOb2RlIGNoYW5nZSBhbmQgaXQgaGFzIGF0IGxlYXN0IG9uZSBtYXhpbXVtIGRpbWVuc2lvblxuICAvLyAod2lkdGggb3IgaGVpZ2h0KSwgYW4gaWRlYWwgc2NhbGUgaXMgY29tcHV0ZWQgKGVpdGhlciB0aGUgc21hbGxlc3Qgc2NhbGUgZm9yIG91ciBsb2NhbCBib3VuZHMgdG8gZml0IHRoZVxuICAvLyBkaW1lbnNpb24gY29uc3RyYWludHMsIE9SIDEsIHdoaWNoZXZlciBpcyBsb3dlcikuIFRoZW4gdGhlIE5vZGUncyB0cmFuc2Zvcm0gd2lsbCBiZSBzY2FsZWQgKHByZXBlbmRlZCkgd2l0aFxuICAvLyBhIHNjYWxlIGFkanVzdG1lbnQgb2YgKCBpZGVhbFNjYWxlIC8gYWxyZWFkeUFwcGxpZWRTY2FsZUZhY3RvciApLlxuICAvLyBJbiB0aGUgc2ltcGxlIGNhc2Ugd2hlcmUgdGhlIE5vZGUgaXNuJ3Qgb3RoZXJ3aXNlIHRyYW5zZm9ybWVkLCB0aGlzIHdpbGwgYXBwbHkgYW5kIHVwZGF0ZSB0aGUgTm9kZSdzIHNjYWxlIHNvIHRoYXRcbiAgLy8gdGhlIE5vZGUgbWF0Y2hlcyB0aGUgbWF4aW11bSBkaW1lbnNpb25zLCB3aGlsZSBuZXZlciBzY2FsaW5nIG92ZXIgMS4gTm90ZSB0aGF0IG1hbnVhbGx5IGFwcGx5aW5nIHRyYW5zZm9ybXMgdG9cbiAgLy8gdGhlIE5vZGUgaXMgZmluZSwgYnV0IG1heSBtYWtlIHRoZSBOb2RlJ3Mgd2lkdGggZ3JlYXRlciB0aGFuIHRoZSBtYXhpbXVtIHdpZHRoLlxuICAvLyBOT1RFOiBJZiBhIGRpbWVuc2lvbiBjb25zdHJhaW50IGlzIG51bGwsIG5vIHJlc2l6aW5nIHdpbGwgb2NjdXIgZHVlIHRvIGl0LiBJZiBib3RoIG1heFdpZHRoIGFuZCBtYXhIZWlnaHQgYXJlIG51bGwsXG4gIC8vIG5vIHNjYWxlIGFkanVzdG1lbnQgd2lsbCBiZSBhcHBsaWVkLlxuICAvL1xuICAvLyBBbHNvIG5vdGUgdGhhdCBzZXR0aW5nIG1heFdpZHRoL21heEhlaWdodCBpcyBsaWtlIGFkZGluZyBhIGxvY2FsIGJvdW5kcyBsaXN0ZW5lciAod2lsbCB0cmlnZ2VyIHZhbGlkYXRpb24gb2ZcbiAgLy8gYm91bmRzIGR1cmluZyB0aGUgdXBkYXRlRGlzcGxheSBzdGVwKS4gTk9URTogdGhpcyBtZWFucyB1cGRhdGVzIHRvIHRoZSB0cmFuc2Zvcm0gKG9uIGEgbG9jYWwgYm91bmRzIGNoYW5nZSkgd2lsbFxuICAvLyBoYXBwZW4gd2hlbiBib3VuZHMgYXJlIHZhbGlkYXRlZCAodmFsaWRhdGVCb3VuZHMoKSksIHdoaWNoIGRvZXMgbm90IGhhcHBlbiBzeW5jaHJvbm91c2x5IG9uIGEgY2hpbGQncyBzaXplXG4gIC8vIGNoYW5nZS4gSXQgZG9lcyBoYXBwZW4gYXQgbGVhc3Qgb25jZSBpbiB1cGRhdGVEaXNwbGF5KCkgYmVmb3JlIHJlbmRlcmluZywgYW5kIGNhbGxpbmcgdmFsaWRhdGVCb3VuZHMoKSBjYW4gZm9yY2VcbiAgLy8gYSByZS1jaGVjayBhbmQgdHJhbnNmb3JtLlxuICBwcml2YXRlIF9tYXhXaWR0aDogbnVtYmVyIHwgbnVsbDtcbiAgcHJpdmF0ZSBfbWF4SGVpZ2h0OiBudW1iZXIgfCBudWxsO1xuXG4gIC8vIFNjYWxlIGFwcGxpZWQgZHVlIHRvIHRoZSBtYXhpbXVtIGRpbWVuc2lvbiBjb25zdHJhaW50cy5cbiAgcHJpdmF0ZSBfYXBwbGllZFNjYWxlRmFjdG9yOiBudW1iZXI7XG5cbiAgLy8gRm9yIHVzZXIgaW5wdXQgaGFuZGxpbmcgKG1vdXNlL3RvdWNoKS4gKHNjZW5lcnktaW50ZXJuYWwpXG4gIHB1YmxpYyBfaW5wdXRMaXN0ZW5lcnM6IFRJbnB1dExpc3RlbmVyW107XG5cbiAgLy8gW211dGFibGVdIEJvdW5kcyBmb3IgdGhpcyBOb2RlIGFuZCBpdHMgY2hpbGRyZW4gaW4gdGhlIFwicGFyZW50XCIgY29vcmRpbmF0ZSBmcmFtZS5cbiAgLy8gTk9URTogVGhlIHJlZmVyZW5jZSBoZXJlIHdpbGwgbm90IGNoYW5nZSwgd2Ugd2lsbCBqdXN0IG5vdGlmeSB1c2luZyB0aGUgZXF1aXZhbGVudCBzdGF0aWMgbm90aWZpY2F0aW9uIG1ldGhvZC5cbiAgLy8gTk9URTogVGhpcyBpcyBmaXJlZCAqKmFzeW5jaHJvbm91c2x5KiogKHVzdWFsbHkgYXMgcGFydCBvZiBhIERpc3BsYXkudXBkYXRlRGlzcGxheSgpKSB3aGVuIHRoZSBib3VuZHMgb2YgdGhlIE5vZGVcbiAgLy8gaXMgY2hhbmdlZC5cbiAgcHVibGljIHJlYWRvbmx5IGJvdW5kc1Byb3BlcnR5OiBUaW55U3RhdGljUHJvcGVydHk8Qm91bmRzMj47XG5cbiAgLy8gW211dGFibGVdIEJvdW5kcyBmb3IgdGhpcyBOb2RlIGFuZCBpdHMgY2hpbGRyZW4gaW4gdGhlIFwibG9jYWxcIiBjb29yZGluYXRlIGZyYW1lLlxuICAvLyBOT1RFOiBUaGUgcmVmZXJlbmNlIGhlcmUgd2lsbCBub3QgY2hhbmdlLCB3ZSB3aWxsIGp1c3Qgbm90aWZ5IHVzaW5nIHRoZSBlcXVpdmFsZW50IHN0YXRpYyBub3RpZmljYXRpb24gbWV0aG9kLlxuICAvLyBOT1RFOiBUaGlzIGlzIGZpcmVkICoqYXN5bmNocm9ub3VzbHkqKiAodXN1YWxseSBhcyBwYXJ0IG9mIGEgRGlzcGxheS51cGRhdGVEaXNwbGF5KCkpIHdoZW4gdGhlIGxvY2FsQm91bmRzIG9mXG4gIC8vIHRoZSBOb2RlIGlzIGNoYW5nZWQuXG4gIHB1YmxpYyByZWFkb25seSBsb2NhbEJvdW5kc1Byb3BlcnR5OiBUaW55U3RhdGljUHJvcGVydHk8Qm91bmRzMj47XG5cbiAgLy8gW211dGFibGVdIEJvdW5kcyBqdXN0IGZvciBjaGlsZHJlbiBvZiB0aGlzIE5vZGUgKGFuZCBzdWItdHJlZXMpLCBpbiB0aGUgXCJsb2NhbFwiIGNvb3JkaW5hdGUgZnJhbWUuXG4gIC8vIE5PVEU6IFRoZSByZWZlcmVuY2UgaGVyZSB3aWxsIG5vdCBjaGFuZ2UsIHdlIHdpbGwganVzdCBub3RpZnkgdXNpbmcgdGhlIGVxdWl2YWxlbnQgc3RhdGljIG5vdGlmaWNhdGlvbiBtZXRob2QuXG4gIC8vIE5PVEU6IFRoaXMgaXMgZmlyZWQgKiphc3luY2hyb25vdXNseSoqICh1c3VhbGx5IGFzIHBhcnQgb2YgYSBEaXNwbGF5LnVwZGF0ZURpc3BsYXkoKSkgd2hlbiB0aGUgY2hpbGRCb3VuZHMgb2YgdGhlXG4gIC8vIE5vZGUgaXMgY2hhbmdlZC5cbiAgcHVibGljIHJlYWRvbmx5IGNoaWxkQm91bmRzUHJvcGVydHk6IFRpbnlTdGF0aWNQcm9wZXJ0eTxCb3VuZHMyPjtcblxuICAvLyBbbXV0YWJsZV0gQm91bmRzIGp1c3QgZm9yIHRoaXMgTm9kZSwgaW4gdGhlIFwibG9jYWxcIiBjb29yZGluYXRlIGZyYW1lLlxuICAvLyBOT1RFOiBUaGUgcmVmZXJlbmNlIGhlcmUgd2lsbCBub3QgY2hhbmdlLCB3ZSB3aWxsIGp1c3Qgbm90aWZ5IHVzaW5nIHRoZSBlcXVpdmFsZW50IHN0YXRpYyBub3RpZmljYXRpb24gbWV0aG9kLlxuICAvLyBOT1RFOiBUaGlzIGV2ZW50IGNhbiBiZSBmaXJlZCBzeW5jaHJvbm91c2x5LCBhbmQgaGFwcGVucyB3aXRoIHRoZSBzZWxmLWJvdW5kcyBvZiBhIE5vZGUgaXMgY2hhbmdlZC4gVGhpcyBpcyBOT1RcbiAgLy8gbGlrZSB0aGUgb3RoZXIgYm91bmRzIFByb3BlcnRpZXMsIHdoaWNoIHVzdWFsbHkgZmlyZSBhc3luY2hyb25vdXNseVxuICBwdWJsaWMgcmVhZG9ubHkgc2VsZkJvdW5kc1Byb3BlcnR5OiBUaW55U3RhdGljUHJvcGVydHk8Qm91bmRzMj47XG5cbiAgLy8gV2hldGhlciBvdXIgbG9jYWxCb3VuZHMgaGF2ZSBiZWVuIHNldCAod2l0aCB0aGUgRVM1IHNldHRlci9zZXRMb2NhbEJvdW5kcygpKSB0byBhIGN1c3RvbVxuICAvLyBvdmVycmlkZGVuIHZhbHVlLiBJZiB0cnVlLCB0aGVuIGxvY2FsQm91bmRzIGl0c2VsZiB3aWxsIG5vdCBiZSB1cGRhdGVkLCBidXQgd2lsbCBpbnN0ZWFkIGFsd2F5cyBiZSB0aGVcbiAgLy8gb3ZlcnJpZGRlbiB2YWx1ZS5cbiAgLy8gKHNjZW5lcnktaW50ZXJuYWwpXG4gIHB1YmxpYyBfbG9jYWxCb3VuZHNPdmVycmlkZGVuID0gZmFsc2U7XG5cbiAgLy8gW211dGFibGVdIFdoZXRoZXIgaW52aXNpYmxlIGNoaWxkcmVuIHdpbGwgYmUgZXhjbHVkZWQgZnJvbSB0aGlzIE5vZGUncyBib3VuZHNcbiAgcHJpdmF0ZSBfZXhjbHVkZUludmlzaWJsZUNoaWxkcmVuRnJvbUJvdW5kcyA9IGZhbHNlO1xuXG4gIC8vIFttdXRhYmxlXSBXaGV0aGVyIHRvIGludGVycnVwdCBpbnB1dCBldmVudHMgb24gdGhlIHN1YnRyZWUgd2hlbiB0aGlzIE5vZGUgaXMgbWFkZSBpbnZpc2libGVcbiAgcHJpdmF0ZSBfaW50ZXJydXB0U3VidHJlZU9uSW52aXNpYmxlID0gdHJ1ZTtcblxuICAvLyBPcHRpb25zIHRoYXQgY2FuIGJlIHByb3ZpZGVkIHRvIGxheW91dCBtYW5hZ2VycyB0byBhZGp1c3QgcG9zaXRpb25pbmcgZm9yIHRoaXMgbm9kZS5cbiAgcHJpdmF0ZSBfbGF5b3V0T3B0aW9uczogVExheW91dE9wdGlvbnMgfCBudWxsID0gbnVsbDtcblxuICAvLyBXaGV0aGVyIGJvdW5kcyBuZWVkcyB0byBiZSByZWNvbXB1dGVkIHRvIGJlIHZhbGlkLlxuICAvLyAoc2NlbmVyeS1pbnRlcm5hbClcbiAgcHVibGljIF9ib3VuZHNEaXJ0eSA9IHRydWU7XG5cbiAgLy8gV2hldGhlciBsb2NhbEJvdW5kcyBuZWVkcyB0byBiZSByZWNvbXB1dGVkIHRvIGJlIHZhbGlkLlxuICAvLyAoc2NlbmVyeS1pbnRlcm5hbClcbiAgcHVibGljIF9sb2NhbEJvdW5kc0RpcnR5ID0gdHJ1ZTtcblxuICAvLyBXaGV0aGVyIHNlbGZCb3VuZHMgbmVlZHMgdG8gYmUgcmVjb21wdXRlZCB0byBiZSB2YWxpZC5cbiAgLy8gKHNjZW5lcnktaW50ZXJuYWwpXG4gIHB1YmxpYyBfc2VsZkJvdW5kc0RpcnR5ID0gdHJ1ZTtcblxuICAvLyBXaGV0aGVyIGNoaWxkQm91bmRzIG5lZWRzIHRvIGJlIHJlY29tcHV0ZWQgdG8gYmUgdmFsaWQuXG4gIC8vIChzY2VuZXJ5LWludGVybmFsKVxuICBwdWJsaWMgX2NoaWxkQm91bmRzRGlydHkgPSB0cnVlO1xuXG4gIC8vIChzY2VuZXJ5LWludGVybmFsKVxuICBwdWJsaWMgX2ZpbHRlcnM6IEZpbHRlcltdO1xuXG4gIHByaXZhdGUgX29yaWdpbmFsQm91bmRzPzogQm91bmRzMjsgLy8gSWYgYXNzZXJ0aW9ucyBhcmUgZW5hYmxlZFxuICBwcml2YXRlIF9vcmlnaW5hbExvY2FsQm91bmRzPzogQm91bmRzMjsgLy8gSWYgYXNzZXJ0aW9ucyBhcmUgZW5hYmxlZFxuICBwcml2YXRlIF9vcmlnaW5hbFNlbGZCb3VuZHM/OiBCb3VuZHMyOyAvLyBJZiBhc3NlcnRpb25zIGFyZSBlbmFibGVkXG4gIHByaXZhdGUgX29yaWdpbmFsQ2hpbGRCb3VuZHM/OiBCb3VuZHMyOyAvLyBJZiBhc3NlcnRpb25zIGFyZSBlbmFibGVkXG5cbiAgLy8gKHNjZW5lcnktaW50ZXJuYWwpIFBlcmZvcm1hbmNlIGhpbnQ6IFdoYXQgdHlwZSBvZiByZW5kZXJlciBzaG91bGQgYmUgZm9yY2VkIGZvciB0aGlzIE5vZGUuIFVzZXMgdGhlIGludGVybmFsXG4gIC8vIGJpdG1hc2sgc3RydWN0dXJlIGRlY2xhcmVkIGluIFJlbmRlcmVyLlxuICBwdWJsaWMgX3JlbmRlcmVyOiBudW1iZXI7XG5cbiAgLy8gKHNjZW5lcnktaW50ZXJuYWwpIFBlcmZvcm1hbmNlIGhpbnQ6IFdoZXRoZXIgaXQgaXMgYW50aWNpcGF0ZWQgdGhhdCBvcGFjaXR5IHdpbGwgYmUgc3dpdGNoZWQgb24uIElmIHNvLCBoYXZpbmcgdGhpc1xuICAvLyBzZXQgdG8gdHJ1ZSB3aWxsIG1ha2Ugc3dpdGNoaW5nIGJhY2stYW5kLWZvcnRoIGJldHdlZW4gb3BhY2l0eToxIGFuZCBvdGhlciBvcGFjaXRpZXMgbXVjaCBmYXN0ZXIuXG4gIHB1YmxpYyBfdXNlc09wYWNpdHk6IGJvb2xlYW47XG5cbiAgLy8gKHNjZW5lcnktaW50ZXJuYWwpIFBlcmZvcm1hbmNlIGhpbnQ6IFdoZXRoZXIgbGF5ZXJzIHNob3VsZCBiZSBzcGxpdCBiZWZvcmUgYW5kIGFmdGVyIHRoaXMgTm9kZS5cbiAgcHVibGljIF9sYXllclNwbGl0OiBib29sZWFuO1xuXG4gIC8vIChzY2VuZXJ5LWludGVybmFsKSBQZXJmb3JtYW5jZSBoaW50OiBXaGV0aGVyIHRoaXMgTm9kZSBhbmQgaXRzIHN1YnRyZWUgc2hvdWxkIGhhbmRsZSB0cmFuc2Zvcm1zIGJ5IHVzaW5nIGEgQ1NTXG4gIC8vIHRyYW5zZm9ybSBvZiBhIGRpdi5cbiAgcHVibGljIF9jc3NUcmFuc2Zvcm06IGJvb2xlYW47XG5cbiAgLy8gKHNjZW5lcnktaW50ZXJuYWwpIFBlcmZvcm1hbmNlIGhpbnQ6IFdoZXRoZXIgU1ZHIChvciBvdGhlcikgY29udGVudCBzaG91bGQgYmUgZXhjbHVkZWQgZnJvbSB0aGUgRE9NIHRyZWUgd2hlblxuICAvLyBpbnZpc2libGUgKGluc3RlYWQgb2YganVzdCBiZWluZyBoaWRkZW4pXG4gIHB1YmxpYyBfZXhjbHVkZUludmlzaWJsZTogYm9vbGVhbjtcblxuICAvLyAoc2NlbmVyeS1pbnRlcm5hbCkgUGVyZm9ybWFuY2UgaGludDogSWYgbm9uLW51bGwsIGEgbXVsdGlwbGllciB0byB0aGUgZGV0ZWN0ZWQgcGl4ZWwtdG8tcGl4ZWwgc2NhbGluZyBvZiB0aGVcbiAgLy8gV2ViR0wgQ2FudmFzXG4gIHB1YmxpYyBfd2ViZ2xTY2FsZTogbnVtYmVyIHwgbnVsbDtcblxuICAvLyAoc2NlbmVyeS1pbnRlcm5hbCkgUGVyZm9ybWFuY2UgaGludDogSWYgdHJ1ZSwgU2NlbmVyeSB3aWxsIG5vdCBmaXQgYW55IGJsb2NrcyB0aGF0IGNvbnRhaW4gZHJhd2FibGVzIGF0dGFjaGVkIHRvXG4gIC8vIE5vZGVzIHVuZGVybmVhdGggdGhpcyBOb2RlJ3Mgc3VidHJlZS4gVGhpcyB3aWxsIHR5cGljYWxseSBwcmV2ZW50IFNjZW5lcnkgZnJvbSB0cmlnZ2VyaW5nIGJvdW5kcyBjb21wdXRhdGlvbiBmb3JcbiAgLy8gdGhpcyBzdWItdHJlZSwgYW5kIG1vdmVtZW50IG9mIHRoaXMgTm9kZSBvciBpdHMgZGVzY2VuZGFudHMgd2lsbCBuZXZlciB0cmlnZ2VyIHRoZSByZWZpdHRpbmcgb2YgYSBibG9jay5cbiAgcHVibGljIF9wcmV2ZW50Rml0OiBib29sZWFuO1xuXG4gIC8vIFRoaXMgaXMgZmlyZWQgb25seSBvbmNlIGZvciBhbnkgc2luZ2xlIG9wZXJhdGlvbiB0aGF0IG1heSBjaGFuZ2UgdGhlIGNoaWxkcmVuIG9mIGEgTm9kZS5cbiAgLy8gRm9yIGV4YW1wbGUsIGlmIGEgTm9kZSdzIGNoaWxkcmVuIGFyZSBbIGEsIGIgXSBhbmQgc2V0Q2hpbGRyZW4oIFsgYSwgeCwgeSwgeiBdICkgaXMgY2FsbGVkIG9uIGl0LCB0aGVcbiAgLy8gY2hpbGRyZW5DaGFuZ2VkIGV2ZW50IHdpbGwgb25seSBiZSBmaXJlZCBvbmNlIGFmdGVyIHRoZSBlbnRpcmUgb3BlcmF0aW9uIG9mIGNoYW5naW5nIHRoZSBjaGlsZHJlbiBpcyBjb21wbGV0ZWQuXG4gIHB1YmxpYyByZWFkb25seSBjaGlsZHJlbkNoYW5nZWRFbWl0dGVyOiBURW1pdHRlciA9IG5ldyBUaW55RW1pdHRlcigpO1xuXG4gIC8vIEZvciBldmVyeSBzaW5nbGUgYWRkZWQgY2hpbGQgTm9kZSwgZW1pdHMgd2l0aCB7Tm9kZX0gTm9kZSwge251bWJlcn0gaW5kZXhPZkNoaWxkXG4gIHB1YmxpYyByZWFkb25seSBjaGlsZEluc2VydGVkRW1pdHRlcjogVEVtaXR0ZXI8WyBub2RlOiBOb2RlLCBpbmRleE9mQ2hpbGQ6IG51bWJlciBdPiA9IG5ldyBUaW55RW1pdHRlcigpO1xuXG4gIC8vIEZvciBldmVyeSBzaW5nbGUgcmVtb3ZlZCBjaGlsZCBOb2RlLCBlbWl0cyB3aXRoIHtOb2RlfSBOb2RlLCB7bnVtYmVyfSBpbmRleE9mQ2hpbGRcbiAgcHVibGljIHJlYWRvbmx5IGNoaWxkUmVtb3ZlZEVtaXR0ZXI6IFRFbWl0dGVyPFsgbm9kZTogTm9kZSwgaW5kZXhPZkNoaWxkOiBudW1iZXIgXT4gPSBuZXcgVGlueUVtaXR0ZXIoKTtcblxuICAvLyBQcm92aWRlcyBhIGdpdmVuIHJhbmdlIHRoYXQgbWF5IGJlIGFmZmVjdGVkIGJ5IHRoZSByZW9yZGVyaW5nXG4gIHB1YmxpYyByZWFkb25seSBjaGlsZHJlblJlb3JkZXJlZEVtaXR0ZXI6IFRFbWl0dGVyPFsgbWluQ2hhbmdlZEluZGV4OiBudW1iZXIsIG1heENoYW5nZWRJbmRleDogbnVtYmVyIF0+ID0gbmV3IFRpbnlFbWl0dGVyKCk7XG5cbiAgLy8gRmlyZWQgd2hlbmV2ZXIgYSBwYXJlbnQgaXMgYWRkZWRcbiAgcHVibGljIHJlYWRvbmx5IHBhcmVudEFkZGVkRW1pdHRlcjogVEVtaXR0ZXI8WyBub2RlOiBOb2RlIF0+ID0gbmV3IFRpbnlFbWl0dGVyKCk7XG5cbiAgLy8gRmlyZWQgd2hlbmV2ZXIgYSBwYXJlbnQgaXMgcmVtb3ZlZFxuICBwdWJsaWMgcmVhZG9ubHkgcGFyZW50UmVtb3ZlZEVtaXR0ZXI6IFRFbWl0dGVyPFsgbm9kZTogTm9kZSBdPiA9IG5ldyBUaW55RW1pdHRlcigpO1xuXG4gIC8vIEZpcmVkIHN5bmNocm9ub3VzbHkgd2hlbiB0aGUgdHJhbnNmb3JtICh0cmFuc2Zvcm1hdGlvbiBtYXRyaXgpIG9mIGEgTm9kZSBpcyBjaGFuZ2VkLiBBbnlcbiAgLy8gY2hhbmdlIHRvIGEgTm9kZSdzIHRyYW5zbGF0aW9uL3JvdGF0aW9uL3NjYWxlL2V0Yy4gd2lsbCB0cmlnZ2VyIHRoaXMgZXZlbnQuXG4gIHB1YmxpYyByZWFkb25seSB0cmFuc2Zvcm1FbWl0dGVyOiBURW1pdHRlciA9IG5ldyBUaW55RW1pdHRlcigpO1xuXG4gIC8vIFNob3VsZCBiZSBlbWl0dGVkIHdoZW4gd2UgbmVlZCB0byBjaGVjayBmdWxsIG1ldGFkYXRhIHVwZGF0ZXMgZGlyZWN0bHkgb24gSW5zdGFuY2VzLFxuICAvLyB0byBzZWUgaWYgd2UgbmVlZCB0byBjaGFuZ2UgZHJhd2FibGUgdHlwZXMsIGV0Yy5cbiAgcHVibGljIHJlYWRvbmx5IGluc3RhbmNlUmVmcmVzaEVtaXR0ZXI6IFRFbWl0dGVyID0gbmV3IFRpbnlFbWl0dGVyKCk7XG5cbiAgLy8gRW1pdHRlZCB0byB3aGVuIHdlIG5lZWQgdG8gcG90ZW50aWFsbHkgcmVjb21wdXRlIG91ciByZW5kZXJlciBzdW1tYXJ5IChiaXRtYXNrIGZsYWdzLCBvclxuICAvLyB0aGluZ3MgdGhhdCBjb3VsZCBhZmZlY3QgZGVzY2VuZGFudHMpXG4gIHB1YmxpYyByZWFkb25seSByZW5kZXJlclN1bW1hcnlSZWZyZXNoRW1pdHRlcjogVEVtaXR0ZXIgPSBuZXcgVGlueUVtaXR0ZXIoKTtcblxuICAvLyBFbWl0dGVkIHRvIHdoZW4gd2UgY2hhbmdlIGZpbHRlcnMgKGVpdGhlciBvcGFjaXR5IG9yIGdlbmVyYWxpemVkIGZpbHRlcnMpXG4gIHB1YmxpYyByZWFkb25seSBmaWx0ZXJDaGFuZ2VFbWl0dGVyOiBURW1pdHRlciA9IG5ldyBUaW55RW1pdHRlcigpO1xuXG4gIC8vIEZpcmVkIHdoZW4gYW4gaW5zdGFuY2UgaXMgY2hhbmdlZCAoYWRkZWQvcmVtb3ZlZCkuIENBUkVGVUwhISBUaGlzIGlzIHBvdGVudGlhbGx5IGEgdmVyeSBkYW5nZXJvdXMgdGhpbmcgdG8gbGlzdGVuXG4gIC8vIHRvLiBJbnN0YW5jZXMgYXJlIHVwZGF0ZWQgaW4gYW4gYXN5bmNocm9ub3VzIGJhdGNoIGR1cmluZyBgdXBkYXRlRGlzcGxheSgpYCwgYW5kIGl0IGlzIHZlcnkgaW1wb3J0YW50IHRoYXQgZGlzcGxheVxuICAvLyB1cGRhdGVzIGRvIG5vdCBjYXVzZSBjaGFuZ2VzIHRoZSBzY2VuZSBncmFwaC4gVGh1cywgdGhpcyBlbWl0dGVyIHNob3VsZCBORVZFUiB0cmlnZ2VyIGEgTm9kZSdzIHN0YXRlIHRvIGNoYW5nZS5cbiAgLy8gQ3VycmVudGx5LCBhbGwgdXNhZ2VzIG9mIHRoaXMgY2F1c2UgaW50byB1cGRhdGVzIHRvIHRoZSBhdWRpbyB2aWV3LCBvciB1cGRhdGVzIHRvIGEgc2VwYXJhdGUgZGlzcGxheSAodXNlZCBhcyBhblxuICAvLyBvdmVybGF5KS4gUGxlYXNlIHByb2NlZWQgd2l0aCBjYXV0aW9uLiBNb3N0IGxpa2VseSB5b3UgcHJlZmVyIHRvIHVzZSB0aGUgc3luY2hyb25vdXMgc3VwcG9ydCBvZiBEaXNwbGF5ZWRUcmFpbHNQcm9wZXJ0eSxcbiAgLy8gc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9zY2VuZXJ5L2lzc3Vlcy8xNjE1IGFuZCBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvc2NlbmVyeS9pc3N1ZXMvMTYyMCBmb3IgZGV0YWlscy5cbiAgcHVibGljIHJlYWRvbmx5IGNoYW5nZWRJbnN0YW5jZUVtaXR0ZXI6IFRFbWl0dGVyPFsgaW5zdGFuY2U6IEluc3RhbmNlLCBhZGRlZDogYm9vbGVhbiBdPiA9IG5ldyBUaW55RW1pdHRlcigpO1xuXG4gIC8vIEZpcmVkIHdoZW5ldmVyIHRoaXMgbm9kZSBpcyBhZGRlZCBhcyBhIHJvb3QgdG8gYSBEaXNwbGF5IE9SIHdoZW4gaXQgaXMgcmVtb3ZlZCBhcyBhIHJvb3QgZnJvbSBhIERpc3BsYXkgKGkuZS5cbiAgLy8gdGhlIERpc3BsYXkgaXMgZGlzcG9zZWQpLlxuICBwdWJsaWMgcmVhZG9ubHkgcm9vdGVkRGlzcGxheUNoYW5nZWRFbWl0dGVyOiBURW1pdHRlcjxbIGRpc3BsYXk6IERpc3BsYXkgXT4gPSBuZXcgVGlueUVtaXR0ZXIoKTtcblxuICAvLyBGaXJlZCB3aGVuIGxheW91dE9wdGlvbnMgY2hhbmdlc1xuICBwdWJsaWMgcmVhZG9ubHkgbGF5b3V0T3B0aW9uc0NoYW5nZWRFbWl0dGVyOiBURW1pdHRlciA9IG5ldyBUaW55RW1pdHRlcigpO1xuXG4gIC8vIEEgYml0bWFzayB3aGljaCBzcGVjaWZpZXMgd2hpY2ggcmVuZGVyZXJzIHRoaXMgTm9kZSAoYW5kIG9ubHkgdGhpcyBOb2RlLCBub3QgaXRzIHN1YnRyZWUpIHN1cHBvcnRzLlxuICAvLyAoc2NlbmVyeS1pbnRlcm5hbClcbiAgcHVibGljIF9yZW5kZXJlckJpdG1hc2s6IG51bWJlcjtcblxuICAvLyBBIGJpdG1hc2stbGlrZSBzdW1tYXJ5IG9mIHdoYXQgcmVuZGVyZXJzIGFuZCBvcHRpb25zIGFyZSBzdXBwb3J0ZWQgYnkgdGhpcyBOb2RlIGFuZCBhbGwgb2YgaXRzIGRlc2NlbmRhbnRzXG4gIC8vIChzY2VuZXJ5LWludGVybmFsKVxuICBwdWJsaWMgX3JlbmRlcmVyU3VtbWFyeTogUmVuZGVyZXJTdW1tYXJ5O1xuXG4gIC8vIFNvIHdlIGNhbiB0cmF2ZXJzZSBvbmx5IHRoZSBzdWJ0cmVlcyB0aGF0IHJlcXVpcmUgYm91bmRzIHZhbGlkYXRpb24gZm9yIGV2ZW50cyBmaXJpbmcuXG4gIC8vIFRoaXMgaXMgYSBzdW0gb2YgdGhlIG51bWJlciBvZiBldmVudHMgcmVxdWlyaW5nIGJvdW5kcyB2YWxpZGF0aW9uIG9uIHRoaXMgTm9kZSwgcGx1cyB0aGUgbnVtYmVyIG9mIGNoaWxkcmVuIHdob3NlXG4gIC8vIGNvdW50IGlzIG5vbi16ZXJvLlxuICAvLyBOT1RFOiB0aGlzIG1lYW5zIHRoYXQgaWYgQSBoYXMgYSBjaGlsZCBCLCBhbmQgQiBoYXMgYSBib3VuZHNFdmVudENvdW50IG9mIDUsIGl0IG9ubHkgY29udHJpYnV0ZXMgMSB0byBBJ3MgY291bnQuXG4gIC8vIFRoaXMgYWxsb3dzIHVzIHRvIGhhdmUgY2hhbmdlcyBsb2NhbGl6ZWQgKGluY3JlYXNpbmcgQidzIGNvdW50IHdvbid0IGNoYW5nZSBBIG9yIGFueSBvZiBBJ3MgYW5jZXN0b3JzKSwgYW5kXG4gIC8vIGd1YXJhbnRlZXMgdGhhdCB3ZSB3aWxsIGtub3cgd2hldGhlciBhIHN1YnRyZWUgaGFzIGJvdW5kcyBsaXN0ZW5lcnMuIEFsc28gaW1wb3J0YW50OiBkZWNyZWFzaW5nIEInc1xuICAvLyBib3VuZHNFdmVudENvdW50IGRvd24gdG8gMCB3aWxsIGFsbG93IEEgdG8gZGVjcmVhc2UgaXRzIGNvdW50IGJ5IDEsIHdpdGhvdXQgaGF2aW5nIHRvIGNoZWNrIGl0cyBvdGhlciBjaGlsZHJlblxuICAvLyAoaWYgd2Ugd2VyZSBqdXN0IHVzaW5nIGEgYm9vbGVhbiB2YWx1ZSwgdGhpcyBvcGVyYXRpb24gd291bGQgcmVxdWlyZSBBIHRvIGNoZWNrIGlmIGFueSBPVEhFUiBjaGlsZHJlbiBiZXNpZGVzXG4gIC8vIEIgaGFkIGJvdW5kcyBsaXN0ZW5lcnMpXG4gIC8vIChzY2VuZXJ5LWludGVybmFsKVxuICBwdWJsaWMgX2JvdW5kc0V2ZW50Q291bnQ6IG51bWJlcjtcblxuICAvLyBUaGlzIHNpZ25hbHMgdGhhdCB3ZSBjYW4gdmFsaWRhdGVCb3VuZHMoKSBvbiB0aGlzIHN1YnRyZWUgYW5kIHdlIGRvbid0IGhhdmUgdG8gdHJhdmVyc2UgZnVydGhlclxuICAvLyAoc2NlbmVyeS1pbnRlcm5hbClcbiAgcHVibGljIF9ib3VuZHNFdmVudFNlbGZDb3VudDogbnVtYmVyO1xuXG4gIC8vIFN1YmNvbXBvbmVudCBkZWRpY2F0ZWQgdG8gaGl0IHRlc3RpbmdcbiAgLy8gKHNjZW5lcnktaW50ZXJuYWwpXG4gIHB1YmxpYyBfcGlja2VyOiBQaWNrZXI7XG5cbiAgLy8gVGhlcmUgYXJlIGNlcnRhaW4gc3BlY2lmaWMgY2FzZXMgKGluIHRoaXMgY2FzZSBkdWUgdG8gYTExeSkgd2hlcmUgd2UgbmVlZFxuICAvLyB0byBrbm93IHRoYXQgYSBOb2RlIGlzIGdldHRpbmcgcmVtb3ZlZCBmcm9tIGl0cyBwYXJlbnQgQlVUIHRoYXQgcHJvY2VzcyBoYXMgbm90IGNvbXBsZXRlZCB5ZXQuIEl0IHdvdWxkIGJlIGlkZWFsXG4gIC8vIHRvIG5vdCBuZWVkIHRoaXMuXG4gIC8vIChzY2VuZXJ5LWludGVybmFsKVxuICBwdWJsaWMgX2lzR2V0dGluZ1JlbW92ZWRGcm9tUGFyZW50OiBib29sZWFuO1xuXG4gIC8vIHtPYmplY3R9IC0gQSBtYXBwaW5nIG9mIGFsbCBvZiBvcHRpb25zIHRoYXQgcmVxdWlyZSBCb3VuZHMgdG8gYmUgYXBwbGllZCBwcm9wZXJseS4gTW9zdCBvZnRlbiB0aGVzZSBzaG91bGQgYmUgc2V0IHRocm91Z2ggYG11dGF0ZWAgaW4gdGhlIGVuZCBvZiB0aGUgY29uc3RydWNvciBpbnN0ZWFkIG9mIGJlaW5nIHBhc3NlZCB0aHJvdWdoIGBzdXBlcigpYFxuICBwdWJsaWMgc3RhdGljIHJlYWRvbmx5IFJFUVVJUkVTX0JPVU5EU19PUFRJT05fS0VZUyA9IFJFUVVJUkVTX0JPVU5EU19PUFRJT05fS0VZUztcblxuICAvLyBVc2VkIGJ5IHNjZW5lcnlEZXNlcmlhbGl6ZVxuICAvLyAoc2NlbmVyeS1pbnRlcm5hbClcbiAgcHVibGljIF9zZXJpYWxpemF0aW9uPzogSW50ZW50aW9uYWxBbnk7XG5cbiAgLy8gVHJhY2tzIGFueSBsYXlvdXQgY29uc3RyYWludCwgc28gdGhhdCB3ZSBjYW4gYXZvaWQgaGF2aW5nIG11bHRpcGxlIGxheW91dCBjb25zdHJhaW50cyBvbiB0aGUgc2FtZSBub2RlXG4gIC8vIChhbmQgYXZvaWQgdGhlIGluZmluaXRlIGxvb3BzIHRoYXQgY2FuIGhhcHBlbiBpZiB0aGF0IGlzIHRyaWdnZXJlZCkuXG4gIC8vIChzY2VuZXJ5LWludGVybmFsKVxuICBwdWJsaWMgX2FjdGl2ZVBhcmVudExheW91dENvbnN0cmFpbnQ6IExheW91dENvbnN0cmFpbnQgfCBudWxsID0gbnVsbDtcblxuICAvLyBUaGlzIGlzIGFuIGFycmF5IG9mIHByb3BlcnR5IChzZXR0ZXIpIG5hbWVzIGZvciBOb2RlLm11dGF0ZSgpLCB3aGljaCBhcmUgYWxzbyB1c2VkIHdoZW4gY3JlYXRpbmdcbiAgLy8gTm9kZXMgd2l0aCBwYXJhbWV0ZXIgb2JqZWN0cy5cbiAgLy9cbiAgLy8gRS5nLiBuZXcgcGhldC5zY2VuZXJ5Lk5vZGUoIHsgeDogNSwgcm90YXRpb246IDIwIH0gKSB3aWxsIGNyZWF0ZSBhIFBhdGgsIGFuZCBhcHBseSBzZXR0ZXJzIGluIHRoZSBvcmRlciBiZWxvd1xuICAvLyAobm9kZS54ID0gNTsgbm9kZS5yb3RhdGlvbiA9IDIwKVxuICAvL1xuICAvLyBTb21lIHNwZWNpYWwgY2FzZXMgZXhpc3QgKGZvciBmdW5jdGlvbiBuYW1lcykuIG5ldyBwaGV0LnNjZW5lcnkuTm9kZSggeyBzY2FsZTogMiB9ICkgd2lsbCBhY3R1YWxseSBjYWxsXG4gIC8vIG5vZGUuc2NhbGUoIDIgKS5cbiAgLy9cbiAgLy8gVGhlIG9yZGVyIGJlbG93IGlzIGltcG9ydGFudCEgRG9uJ3QgY2hhbmdlIHRoaXMgd2l0aG91dCBrbm93aW5nIHRoZSBpbXBsaWNhdGlvbnMuXG4gIC8vXG4gIC8vIE5PVEU6IFRyYW5zbGF0aW9uLWJhc2VkIG11dGF0b3JzIGNvbWUgYmVmb3JlIHJvdGF0aW9uL3NjYWxlLCBzaW5jZSB0eXBpY2FsbHkgd2UgdGhpbmsgb2YgdGhlaXIgb3BlcmF0aW9uc1xuICAvLyAgICAgICBvY2N1cnJpbmcgXCJhZnRlclwiIHRoZSByb3RhdGlvbiAvIHNjYWxpbmdcbiAgLy8gTk9URTogbGVmdC9yaWdodC90b3AvYm90dG9tL2NlbnRlclgvY2VudGVyWSBhcmUgYXQgdGhlIGVuZCwgc2luY2UgdGhleSByZWx5IHBvdGVudGlhbGx5IG9uIHJvdGF0aW9uIC8gc2NhbGluZ1xuICAvLyAgICAgICBjaGFuZ2VzIG9mIGJvdW5kcyB0aGF0IG1heSBoYXBwZW4gYmVmb3JlaGFuZFxuICAvLyAoc2NlbmVyeS1pbnRlcm5hbClcbiAgcHVibGljIF9tdXRhdG9yS2V5cyE6IHN0cmluZ1tdO1xuXG4gIC8vIExpc3Qgb2YgYWxsIGRpcnR5IGZsYWdzIHRoYXQgc2hvdWxkIGJlIGF2YWlsYWJsZSBvbiBkcmF3YWJsZXMgY3JlYXRlZCBmcm9tIHRoaXMgTm9kZSAob3JcbiAgLy8gc3VidHlwZSkuIEdpdmVuIGEgZmxhZyAoZS5nLiByYWRpdXMpLCBpdCBpbmRpY2F0ZXMgdGhlIGV4aXN0ZW5jZSBvZiBhIGZ1bmN0aW9uXG4gIC8vIGRyYXdhYmxlLm1hcmtEaXJ0eVJhZGl1cygpIHRoYXQgd2lsbCBpbmRpY2F0ZSB0byB0aGUgZHJhd2FibGUgdGhhdCB0aGUgcmFkaXVzIGhhcyBjaGFuZ2VkLlxuICAvLyAoc2NlbmVyeS1pbnRlcm5hbClcbiAgLy9cbiAgLy8gU2hvdWxkIGJlIG92ZXJyaWRkZW4gYnkgc3VidHlwZXMuXG4gIHB1YmxpYyBkcmF3YWJsZU1hcmtGbGFncyE6IHN0cmluZ1tdO1xuXG4gIC8qKlxuICAgKiBDcmVhdGVzIGEgTm9kZSB3aXRoIG9wdGlvbnMuXG4gICAqXG4gICAqIE5PVEU6IERpcmVjdGx5IGNyZWF0ZWQgTm9kZXMgKG5vdCBvZiBhbnkgc3VidHlwZSwgYnV0IGNyZWF0ZWQgd2l0aCBcIm5ldyBOb2RlKCAuLi4gKVwiKSBhcmUgZ2VuZXJhbGx5IHVzZWQgYXNcbiAgICogICAgICAgY29udGFpbmVycywgd2hpY2ggY2FuIGhvbGQgb3RoZXIgTm9kZXMsIHN1YnR5cGVzIG9mIE5vZGUgdGhhdCBjYW4gZGlzcGxheSB0aGluZ3MuXG4gICAqXG4gICAqIE5vZGUgYW5kIGl0cyBzdWJ0eXBlcyBnZW5lcmFsbHkgaGF2ZSB0aGUgbGFzdCBjb25zdHJ1Y3RvciBwYXJhbWV0ZXIgcmVzZXJ2ZWQgZm9yIHRoZSAnb3B0aW9ucycgb2JqZWN0LiBUaGlzIGlzIGFcbiAgICoga2V5LXZhbHVlIG1hcCB0aGF0IHNwZWNpZmllcyByZWxldmFudCBvcHRpb25zIHRoYXQgYXJlIHVzZWQgYnkgTm9kZSBhbmQgc3VidHlwZXMuXG4gICAqXG4gICAqIEZvciBleGFtcGxlLCBvbmUgb2YgTm9kZSdzIG9wdGlvbnMgaXMgYm90dG9tLCBhbmQgb25lIG9mIENpcmNsZSdzIG9wdGlvbnMgaXMgcmFkaXVzLiBXaGVuIGEgY2lyY2xlIGlzIGNyZWF0ZWQ6XG4gICAqICAgdmFyIGNpcmNsZSA9IG5ldyBDaXJjbGUoIHtcbiAgICogICAgIHJhZGl1czogMTAsXG4gICAqICAgICBib3R0b206IDIwMFxuICAgKiAgIH0gKTtcbiAgICogVGhpcyB3aWxsIGNyZWF0ZSBhIENpcmNsZSwgc2V0IGl0cyByYWRpdXMgKGJ5IGV4ZWN1dGluZyBjaXJjbGUucmFkaXVzID0gMTAsIHdoaWNoIHVzZXMgY2lyY2xlLnNldFJhZGl1cygpKSwgYW5kXG4gICAqIHRoZW4gd2lsbCBhbGlnbiB0aGUgYm90dG9tIG9mIHRoZSBjaXJjbGUgYWxvbmcgeT0yMDAgKGJ5IGV4ZWN1dGluZyBjaXJjbGUuYm90dG9tID0gMjAwLCB3aGljaCB1c2VzXG4gICAqIG5vZGUuc2V0Qm90dG9tKCkpLlxuICAgKlxuICAgKiBUaGUgb3B0aW9ucyBhcmUgZXhlY3V0ZWQgaW4gdGhlIG9yZGVyIHNwZWNpZmllZCBieSBlYWNoIHR5cGVzIF9tdXRhdG9yS2V5cyBwcm9wZXJ0eS5cbiAgICpcbiAgICogVGhlIG9wdGlvbnMgb2JqZWN0IGlzIGN1cnJlbnRseSBub3QgY2hlY2tlZCB0byBzZWUgd2hldGhlciB0aGVyZSBhcmUgcHJvcGVydHkgKGtleSkgbmFtZXMgdGhhdCBhcmUgbm90IHVzZWQsIHNvIGl0XG4gICAqIGlzIGN1cnJlbnRseSBsZWdhbCB0byBkbyBcIm5ldyBOb2RlKCB7IGZvcmtfa2l0Y2hlbl9zcG9vbjogNSB9IClcIi5cbiAgICpcbiAgICogVXN1YWxseSwgYW4gb3B0aW9uIChlLmcuICd2aXNpYmxlJyksIHdoZW4gdXNlZCBpbiBhIGNvbnN0cnVjdG9yIG9yIG11dGF0ZSgpIGNhbGwsIHdpbGwgZGlyZWN0bHkgdXNlIHRoZSBFUzUgc2V0dGVyXG4gICAqIGZvciB0aGF0IHByb3BlcnR5IChlLmcuIG5vZGUudmlzaWJsZSA9IC4uLiksIHdoaWNoIGdlbmVyYWxseSBmb3J3YXJkcyB0byBhIG5vbi1FUzUgc2V0dGVyIGZ1bmN0aW9uXG4gICAqIChlLmcuIG5vZGUuc2V0VmlzaWJsZSggLi4uICkpIHRoYXQgaXMgcmVzcG9uc2libGUgZm9yIHRoZSBiZWhhdmlvci4gRG9jdW1lbnRhdGlvbiBpcyBnZW5lcmFsbHkgb24gdGhlc2UgbWV0aG9kc1xuICAgKiAoZS5nLiBzZXRWaXNpYmxlKSwgYWx0aG91Z2ggc29tZSBtZXRob2RzIG1heSBiZSBkeW5hbWljYWxseSBjcmVhdGVkIHRvIGF2b2lkIHZlcmJvc2l0eSAobGlrZSBub2RlLmxlZnRUb3ApLlxuICAgKlxuICAgKiBTb21ldGltZXMsIG9wdGlvbnMgaW52b2tlIGEgZnVuY3Rpb24gaW5zdGVhZCAoZS5nLiAnc2NhbGUnKSBiZWNhdXNlIHRoZSB2ZXJiIGFuZCBub3VuIGFyZSBpZGVudGljYWwuIEluIHRoaXMgY2FzZSxcbiAgICogaW5zdGVhZCBvZiBzZXR0aW5nIHRoZSBzZXR0ZXIgKG5vZGUuc2NhbGUgPSAuLi4sIHdoaWNoIHdvdWxkIG92ZXJyaWRlIHRoZSBmdW5jdGlvbiksIGl0IHdpbGwgaW5zdGVhZCBjYWxsXG4gICAqIHRoZSBtZXRob2QgZGlyZWN0bHkgKGUuZy4gbm9kZS5zY2FsZSggLi4uICkpLlxuICAgKi9cbiAgcHVibGljIGNvbnN0cnVjdG9yKCBvcHRpb25zPzogTm9kZU9wdGlvbnMgKSB7XG5cbiAgICBzdXBlcigpO1xuXG4gICAgdGhpcy5faWQgPSBnbG9iYWxJZENvdW50ZXIrKztcbiAgICB0aGlzLl9pbnN0YW5jZXMgPSBbXTtcbiAgICB0aGlzLl9yb290ZWREaXNwbGF5cyA9IFtdO1xuICAgIHRoaXMuX2RyYXdhYmxlcyA9IFtdO1xuICAgIHRoaXMuX3Zpc2libGVQcm9wZXJ0eSA9IG5ldyBUaW55Rm9yd2FyZGluZ1Byb3BlcnR5KCBERUZBVUxUX09QVElPTlMudmlzaWJsZSwgREVGQVVMVF9PUFRJT05TLnBoZXRpb1Zpc2libGVQcm9wZXJ0eUluc3RydW1lbnRlZCxcbiAgICAgIHRoaXMub25WaXNpYmxlUHJvcGVydHlDaGFuZ2UuYmluZCggdGhpcyApICk7XG4gICAgdGhpcy5vcGFjaXR5UHJvcGVydHkgPSBuZXcgVGlueVByb3BlcnR5KCBERUZBVUxUX09QVElPTlMub3BhY2l0eSwgdGhpcy5vbk9wYWNpdHlQcm9wZXJ0eUNoYW5nZS5iaW5kKCB0aGlzICkgKTtcbiAgICB0aGlzLmRpc2FibGVkT3BhY2l0eVByb3BlcnR5ID0gbmV3IFRpbnlQcm9wZXJ0eSggREVGQVVMVF9PUFRJT05TLmRpc2FibGVkT3BhY2l0eSwgdGhpcy5vbkRpc2FibGVkT3BhY2l0eVByb3BlcnR5Q2hhbmdlLmJpbmQoIHRoaXMgKSApO1xuICAgIHRoaXMuX3BpY2thYmxlUHJvcGVydHkgPSBuZXcgVGlueUZvcndhcmRpbmdQcm9wZXJ0eTxib29sZWFuIHwgbnVsbD4oIERFRkFVTFRfT1BUSU9OUy5waWNrYWJsZSxcbiAgICAgIGZhbHNlLCB0aGlzLm9uUGlja2FibGVQcm9wZXJ0eUNoYW5nZS5iaW5kKCB0aGlzICkgKTtcbiAgICB0aGlzLl9lbmFibGVkUHJvcGVydHkgPSBuZXcgVGlueUZvcndhcmRpbmdQcm9wZXJ0eTxib29sZWFuPiggREVGQVVMVF9PUFRJT05TLmVuYWJsZWQsXG4gICAgICBERUZBVUxUX09QVElPTlMucGhldGlvRW5hYmxlZFByb3BlcnR5SW5zdHJ1bWVudGVkLCB0aGlzLm9uRW5hYmxlZFByb3BlcnR5Q2hhbmdlLmJpbmQoIHRoaXMgKSApO1xuXG4gICAgdGhpcy5faW5wdXRFbmFibGVkUHJvcGVydHkgPSBuZXcgVGlueUZvcndhcmRpbmdQcm9wZXJ0eSggREVGQVVMVF9PUFRJT05TLmlucHV0RW5hYmxlZCxcbiAgICAgIERFRkFVTFRfT1BUSU9OUy5waGV0aW9JbnB1dEVuYWJsZWRQcm9wZXJ0eUluc3RydW1lbnRlZCApO1xuICAgIHRoaXMuY2xpcEFyZWFQcm9wZXJ0eSA9IG5ldyBUaW55UHJvcGVydHk8U2hhcGUgfCBudWxsPiggREVGQVVMVF9PUFRJT05TLmNsaXBBcmVhICk7XG4gICAgdGhpcy52b2ljaW5nVmlzaWJsZVByb3BlcnR5ID0gbmV3IFRpbnlQcm9wZXJ0eTxib29sZWFuPiggdHJ1ZSApO1xuICAgIHRoaXMuX21vdXNlQXJlYSA9IERFRkFVTFRfT1BUSU9OUy5tb3VzZUFyZWE7XG4gICAgdGhpcy5fdG91Y2hBcmVhID0gREVGQVVMVF9PUFRJT05TLnRvdWNoQXJlYTtcbiAgICB0aGlzLl9jdXJzb3IgPSBERUZBVUxUX09QVElPTlMuY3Vyc29yO1xuICAgIHRoaXMuX2NoaWxkcmVuID0gW107XG4gICAgdGhpcy5fcGFyZW50cyA9IFtdO1xuICAgIHRoaXMuX3RyYW5zZm9ybUJvdW5kcyA9IERFRkFVTFRfT1BUSU9OUy50cmFuc2Zvcm1Cb3VuZHM7XG4gICAgdGhpcy5fdHJhbnNmb3JtID0gbmV3IFRyYW5zZm9ybTMoKTtcbiAgICB0aGlzLl90cmFuc2Zvcm1MaXN0ZW5lciA9IHRoaXMub25UcmFuc2Zvcm1DaGFuZ2UuYmluZCggdGhpcyApO1xuICAgIHRoaXMuX3RyYW5zZm9ybS5jaGFuZ2VFbWl0dGVyLmFkZExpc3RlbmVyKCB0aGlzLl90cmFuc2Zvcm1MaXN0ZW5lciApO1xuICAgIHRoaXMuX21heFdpZHRoID0gREVGQVVMVF9PUFRJT05TLm1heFdpZHRoO1xuICAgIHRoaXMuX21heEhlaWdodCA9IERFRkFVTFRfT1BUSU9OUy5tYXhIZWlnaHQ7XG4gICAgdGhpcy5fYXBwbGllZFNjYWxlRmFjdG9yID0gMTtcbiAgICB0aGlzLl9pbnB1dExpc3RlbmVycyA9IFtdO1xuICAgIHRoaXMuX3JlbmRlcmVyID0gREVGQVVMVF9JTlRFUk5BTF9SRU5ERVJFUjtcbiAgICB0aGlzLl91c2VzT3BhY2l0eSA9IERFRkFVTFRfT1BUSU9OUy51c2VzT3BhY2l0eTtcbiAgICB0aGlzLl9sYXllclNwbGl0ID0gREVGQVVMVF9PUFRJT05TLmxheWVyU3BsaXQ7XG4gICAgdGhpcy5fY3NzVHJhbnNmb3JtID0gREVGQVVMVF9PUFRJT05TLmNzc1RyYW5zZm9ybTtcbiAgICB0aGlzLl9leGNsdWRlSW52aXNpYmxlID0gREVGQVVMVF9PUFRJT05TLmV4Y2x1ZGVJbnZpc2libGU7XG4gICAgdGhpcy5fd2ViZ2xTY2FsZSA9IERFRkFVTFRfT1BUSU9OUy53ZWJnbFNjYWxlO1xuICAgIHRoaXMuX3ByZXZlbnRGaXQgPSBERUZBVUxUX09QVElPTlMucHJldmVudEZpdDtcblxuICAgIHRoaXMuaW5wdXRFbmFibGVkUHJvcGVydHkubGF6eUxpbmsoIHRoaXMucGRvbUJvdW5kSW5wdXRFbmFibGVkTGlzdGVuZXIgKTtcblxuICAgIC8vIEFkZCBsaXN0ZW5lciBjb3VudCBjaGFuZ2Ugbm90aWZpY2F0aW9ucyBpbnRvIHRoZXNlIFByb3BlcnRpZXMsIHNpbmNlIHdlIG5lZWQgdG8ga25vdyB3aGVuIHRoZWlyIG51bWJlciBvZiBsaXN0ZW5lcnNcbiAgICAvLyBjaGFuZ2VzIGR5bmFtaWNhbGx5LlxuICAgIGNvbnN0IGJvdW5kc0xpc3RlbmVyc0FkZGVkT3JSZW1vdmVkTGlzdGVuZXIgPSB0aGlzLm9uQm91bmRzTGlzdGVuZXJzQWRkZWRPclJlbW92ZWQuYmluZCggdGhpcyApO1xuXG4gICAgY29uc3QgYm91bmRzSW52YWxpZGF0aW9uTGlzdGVuZXIgPSB0aGlzLnZhbGlkYXRlQm91bmRzLmJpbmQoIHRoaXMgKTtcbiAgICBjb25zdCBzZWxmQm91bmRzSW52YWxpZGF0aW9uTGlzdGVuZXIgPSB0aGlzLnZhbGlkYXRlU2VsZkJvdW5kcy5iaW5kKCB0aGlzICk7XG5cbiAgICB0aGlzLmJvdW5kc1Byb3BlcnR5ID0gbmV3IFRpbnlTdGF0aWNQcm9wZXJ0eSggQm91bmRzMi5OT1RISU5HLmNvcHkoKSwgYm91bmRzSW52YWxpZGF0aW9uTGlzdGVuZXIgKTtcbiAgICB0aGlzLmJvdW5kc1Byb3BlcnR5LmNoYW5nZUNvdW50ID0gYm91bmRzTGlzdGVuZXJzQWRkZWRPclJlbW92ZWRMaXN0ZW5lcjtcblxuICAgIHRoaXMubG9jYWxCb3VuZHNQcm9wZXJ0eSA9IG5ldyBUaW55U3RhdGljUHJvcGVydHkoIEJvdW5kczIuTk9USElORy5jb3B5KCksIGJvdW5kc0ludmFsaWRhdGlvbkxpc3RlbmVyICk7XG4gICAgdGhpcy5sb2NhbEJvdW5kc1Byb3BlcnR5LmNoYW5nZUNvdW50ID0gYm91bmRzTGlzdGVuZXJzQWRkZWRPclJlbW92ZWRMaXN0ZW5lcjtcblxuICAgIHRoaXMuY2hpbGRCb3VuZHNQcm9wZXJ0eSA9IG5ldyBUaW55U3RhdGljUHJvcGVydHkoIEJvdW5kczIuTk9USElORy5jb3B5KCksIGJvdW5kc0ludmFsaWRhdGlvbkxpc3RlbmVyICk7XG4gICAgdGhpcy5jaGlsZEJvdW5kc1Byb3BlcnR5LmNoYW5nZUNvdW50ID0gYm91bmRzTGlzdGVuZXJzQWRkZWRPclJlbW92ZWRMaXN0ZW5lcjtcblxuICAgIHRoaXMuc2VsZkJvdW5kc1Byb3BlcnR5ID0gbmV3IFRpbnlTdGF0aWNQcm9wZXJ0eSggQm91bmRzMi5OT1RISU5HLmNvcHkoKSwgc2VsZkJvdW5kc0ludmFsaWRhdGlvbkxpc3RlbmVyICk7XG5cbiAgICBpZiAoIGFzc2VydCApIHtcbiAgICAgIC8vIGZvciBhc3NlcnRpb25zIGxhdGVyIHRvIGVuc3VyZSB0aGF0IHdlIGFyZSB1c2luZyB0aGUgc2FtZSBCb3VuZHMyIGNvcGllcyBhcyBiZWZvcmVcbiAgICAgIHRoaXMuX29yaWdpbmFsQm91bmRzID0gdGhpcy5ib3VuZHNQcm9wZXJ0eS5fdmFsdWU7XG4gICAgICB0aGlzLl9vcmlnaW5hbExvY2FsQm91bmRzID0gdGhpcy5sb2NhbEJvdW5kc1Byb3BlcnR5Ll92YWx1ZTtcbiAgICAgIHRoaXMuX29yaWdpbmFsU2VsZkJvdW5kcyA9IHRoaXMuc2VsZkJvdW5kc1Byb3BlcnR5Ll92YWx1ZTtcbiAgICAgIHRoaXMuX29yaWdpbmFsQ2hpbGRCb3VuZHMgPSB0aGlzLmNoaWxkQm91bmRzUHJvcGVydHkuX3ZhbHVlO1xuICAgIH1cblxuICAgIHRoaXMuX2ZpbHRlcnMgPSBbXTtcblxuICAgIHRoaXMuX3JlbmRlcmVyQml0bWFzayA9IFJlbmRlcmVyLmJpdG1hc2tOb2RlRGVmYXVsdDtcbiAgICB0aGlzLl9yZW5kZXJlclN1bW1hcnkgPSBuZXcgUmVuZGVyZXJTdW1tYXJ5KCB0aGlzICk7XG5cbiAgICB0aGlzLl9ib3VuZHNFdmVudENvdW50ID0gMDtcbiAgICB0aGlzLl9ib3VuZHNFdmVudFNlbGZDb3VudCA9IDA7XG4gICAgdGhpcy5fcGlja2VyID0gbmV3IFBpY2tlciggdGhpcyApO1xuICAgIHRoaXMuX2lzR2V0dGluZ1JlbW92ZWRGcm9tUGFyZW50ID0gZmFsc2U7XG5cbiAgICBpZiAoIG9wdGlvbnMgKSB7XG4gICAgICB0aGlzLm11dGF0ZSggb3B0aW9ucyApO1xuICAgIH1cbiAgfVxuXG5cbiAgLyoqXG4gICAqIEluc2VydHMgYSBjaGlsZCBOb2RlIGF0IGEgc3BlY2lmaWMgaW5kZXguXG4gICAqXG4gICAqIG5vZGUuaW5zZXJ0Q2hpbGQoIDAsIGNoaWxkTm9kZSApIHdpbGwgaW5zZXJ0IHRoZSBjaGlsZCBpbnRvIHRoZSBiZWdpbm5pbmcgb2YgdGhlIGNoaWxkcmVuIGFycmF5IChvbiB0aGUgYm90dG9tXG4gICAqIHZpc3VhbGx5KS5cbiAgICpcbiAgICogbm9kZS5pbnNlcnRDaGlsZCggbm9kZS5jaGlsZHJlbi5sZW5ndGgsIGNoaWxkTm9kZSApIGlzIGVxdWl2YWxlbnQgdG8gbm9kZS5hZGRDaGlsZCggY2hpbGROb2RlICksIGFuZCBhcHBlbmRzIGl0XG4gICAqIHRvIHRoZSBlbmQgKHRvcCB2aXN1YWxseSkgb2YgdGhlIGNoaWxkcmVuIGFycmF5LiBJdCBpcyByZWNvbW1lbmRlZCB0byB1c2Ugbm9kZS5hZGRDaGlsZCB3aGVuIHBvc3NpYmxlLlxuICAgKlxuICAgKiBOT1RFOiBvdmVycmlkZGVuIGJ5IExlYWYgZm9yIHNvbWUgc3VidHlwZXNcbiAgICpcbiAgICogQHBhcmFtIGluZGV4IC0gSW5kZXggd2hlcmUgdGhlIGluc2VydGVkIGNoaWxkIE5vZGUgd2lsbCBiZSBhZnRlciB0aGlzIG9wZXJhdGlvbi5cbiAgICogQHBhcmFtIG5vZGUgLSBUaGUgbmV3IGNoaWxkIHRvIGluc2VydC5cbiAgICogQHBhcmFtIFtpc0NvbXBvc2l0ZV0gLSAoc2NlbmVyeS1pbnRlcm5hbCkgSWYgdHJ1ZSwgdGhlIGNoaWxkcmVuQ2hhbmdlZCBldmVudCB3aWxsIG5vdCBiZSBzZW50IG91dC5cbiAgICovXG4gIHB1YmxpYyBpbnNlcnRDaGlsZCggaW5kZXg6IG51bWJlciwgbm9kZTogTm9kZSwgaXNDb21wb3NpdGU/OiBib29sZWFuICk6IHRoaXMge1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIG5vZGUgIT09IG51bGwgJiYgbm9kZSAhPT0gdW5kZWZpbmVkLCAnaW5zZXJ0Q2hpbGQgY2Fubm90IGluc2VydCBhIG51bGwvdW5kZWZpbmVkIGNoaWxkJyApO1xuICAgIGFzc2VydCAmJiBhc3NlcnQoICFfLmluY2x1ZGVzKCB0aGlzLl9jaGlsZHJlbiwgbm9kZSApLCAnUGFyZW50IGFscmVhZHkgY29udGFpbnMgY2hpbGQnICk7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggbm9kZSAhPT0gdGhpcywgJ0Nhbm5vdCBhZGQgc2VsZiBhcyBhIGNoaWxkJyApO1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIG5vZGUuX3BhcmVudHMgIT09IG51bGwsICdUcmllZCB0byBpbnNlcnQgYSBkaXNwb3NlZCBjaGlsZCBub2RlPycgKTtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCAhbm9kZS5pc0Rpc3Bvc2VkLCAnVHJpZWQgdG8gaW5zZXJ0IGEgZGlzcG9zZWQgTm9kZScgKTtcblxuICAgIC8vIG5lZWRzIHRvIGJlIGVhcmx5IHRvIHByZXZlbnQgcmUtZW50cmFudCBjaGlsZHJlbiBtb2RpZmljYXRpb25zXG4gICAgdGhpcy5fcGlja2VyLm9uSW5zZXJ0Q2hpbGQoIG5vZGUgKTtcbiAgICB0aGlzLmNoYW5nZUJvdW5kc0V2ZW50Q291bnQoIG5vZGUuX2JvdW5kc0V2ZW50Q291bnQgPiAwID8gMSA6IDAgKTtcbiAgICB0aGlzLl9yZW5kZXJlclN1bW1hcnkuc3VtbWFyeUNoYW5nZSggUmVuZGVyZXJTdW1tYXJ5LmJpdG1hc2tBbGwsIG5vZGUuX3JlbmRlcmVyU3VtbWFyeS5iaXRtYXNrICk7XG5cbiAgICBub2RlLl9wYXJlbnRzLnB1c2goIHRoaXMgKTtcbiAgICBpZiAoIGFzc2VydCAmJiB3aW5kb3cucGhldD8uY2hpcHBlcj8ucXVlcnlQYXJhbWV0ZXJzICYmIGlzRmluaXRlKCBTY2VuZXJ5UXVlcnlQYXJhbWV0ZXJzLnBhcmVudExpbWl0ICkgKSB7XG4gICAgICBjb25zdCBwYXJlbnRDb3VudCA9IG5vZGUuX3BhcmVudHMubGVuZ3RoO1xuICAgICAgaWYgKCBtYXhQYXJlbnRDb3VudCA8IHBhcmVudENvdW50ICkge1xuICAgICAgICBtYXhQYXJlbnRDb3VudCA9IHBhcmVudENvdW50O1xuICAgICAgICBjb25zb2xlLmxvZyggYE1heCBOb2RlIHBhcmVudHM6ICR7bWF4UGFyZW50Q291bnR9YCApO1xuICAgICAgICBhc3NlcnQoIG1heFBhcmVudENvdW50IDw9IFNjZW5lcnlRdWVyeVBhcmFtZXRlcnMucGFyZW50TGltaXQsXG4gICAgICAgICAgYHBhcmVudCBjb3VudCBvZiAke21heFBhcmVudENvdW50fSBhYm92ZSA/cGFyZW50TGltaXQ9JHtTY2VuZXJ5UXVlcnlQYXJhbWV0ZXJzLnBhcmVudExpbWl0fWAgKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzLl9jaGlsZHJlbi5zcGxpY2UoIGluZGV4LCAwLCBub2RlICk7XG4gICAgaWYgKCBhc3NlcnQgJiYgd2luZG93LnBoZXQ/LmNoaXBwZXI/LnF1ZXJ5UGFyYW1ldGVycyAmJiBpc0Zpbml0ZSggU2NlbmVyeVF1ZXJ5UGFyYW1ldGVycy5jaGlsZExpbWl0ICkgKSB7XG4gICAgICBjb25zdCBjaGlsZENvdW50ID0gdGhpcy5fY2hpbGRyZW4ubGVuZ3RoO1xuICAgICAgaWYgKCBtYXhDaGlsZENvdW50IDwgY2hpbGRDb3VudCApIHtcbiAgICAgICAgbWF4Q2hpbGRDb3VudCA9IGNoaWxkQ291bnQ7XG4gICAgICAgIGNvbnNvbGUubG9nKCBgTWF4IE5vZGUgY2hpbGRyZW46ICR7bWF4Q2hpbGRDb3VudH1gICk7XG4gICAgICAgIGFzc2VydCggbWF4Q2hpbGRDb3VudCA8PSBTY2VuZXJ5UXVlcnlQYXJhbWV0ZXJzLmNoaWxkTGltaXQsXG4gICAgICAgICAgYGNoaWxkIGNvdW50IG9mICR7bWF4Q2hpbGRDb3VudH0gYWJvdmUgP2NoaWxkTGltaXQ9JHtTY2VuZXJ5UXVlcnlQYXJhbWV0ZXJzLmNoaWxkTGltaXR9YCApO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIElmIHRoaXMgYWRkZWQgc3VidHJlZSBjb250YWlucyBQRE9NIGNvbnRlbnQsIHdlIG5lZWQgdG8gbm90aWZ5IGFueSByZWxldmFudCBkaXNwbGF5c1xuICAgIGlmICggIW5vZGUuX3JlbmRlcmVyU3VtbWFyeS5oYXNOb1BET00oKSApIHtcbiAgICAgIHRoaXMub25QRE9NQWRkQ2hpbGQoIG5vZGUgKTtcbiAgICB9XG5cbiAgICBub2RlLmludmFsaWRhdGVCb3VuZHMoKTtcblxuICAgIC8vIGxpa2UgY2FsbGluZyB0aGlzLmludmFsaWRhdGVCb3VuZHMoKSwgYnV0IHdlIGFscmVhZHkgbWFya2VkIGFsbCBhbmNlc3RvcnMgd2l0aCBkaXJ0eSBjaGlsZCBib3VuZHNcbiAgICB0aGlzLl9ib3VuZHNEaXJ0eSA9IHRydWU7XG5cbiAgICB0aGlzLmNoaWxkSW5zZXJ0ZWRFbWl0dGVyLmVtaXQoIG5vZGUsIGluZGV4ICk7XG4gICAgbm9kZS5wYXJlbnRBZGRlZEVtaXR0ZXIuZW1pdCggdGhpcyApO1xuXG4gICAgIWlzQ29tcG9zaXRlICYmIHRoaXMuY2hpbGRyZW5DaGFuZ2VkRW1pdHRlci5lbWl0KCk7XG5cbiAgICBpZiAoIGFzc2VydFNsb3cgKSB7IHRoaXMuX3BpY2tlci5hdWRpdCgpOyB9XG5cbiAgICByZXR1cm4gdGhpczsgLy8gYWxsb3cgY2hhaW5pbmdcbiAgfVxuXG4gIC8qKlxuICAgKiBBcHBlbmRzIGEgY2hpbGQgTm9kZSB0byBvdXIgbGlzdCBvZiBjaGlsZHJlbi5cbiAgICpcbiAgICogVGhlIG5ldyBjaGlsZCBOb2RlIHdpbGwgYmUgZGlzcGxheWVkIGluIGZyb250IChvbiB0b3ApIG9mIGFsbCBvZiB0aGlzIG5vZGUncyBvdGhlciBjaGlsZHJlbi5cbiAgICpcbiAgICogQHBhcmFtIG5vZGVcbiAgICogQHBhcmFtIFtpc0NvbXBvc2l0ZV0gLSAoc2NlbmVyeS1pbnRlcm5hbCkgSWYgdHJ1ZSwgdGhlIGNoaWxkcmVuQ2hhbmdlZCBldmVudCB3aWxsIG5vdCBiZSBzZW50IG91dC5cbiAgICovXG4gIHB1YmxpYyBhZGRDaGlsZCggbm9kZTogTm9kZSwgaXNDb21wb3NpdGU/OiBib29sZWFuICk6IHRoaXMge1xuICAgIHRoaXMuaW5zZXJ0Q2hpbGQoIHRoaXMuX2NoaWxkcmVuLmxlbmd0aCwgbm9kZSwgaXNDb21wb3NpdGUgKTtcblxuICAgIHJldHVybiB0aGlzOyAvLyBhbGxvdyBjaGFpbmluZ1xuICB9XG5cbiAgLyoqXG4gICAqIFJlbW92ZXMgYSBjaGlsZCBOb2RlIGZyb20gb3VyIGxpc3Qgb2YgY2hpbGRyZW4sIHNlZSBodHRwOi8vcGhldHNpbXMuZ2l0aHViLmlvL3NjZW5lcnkvZG9jLyNub2RlLXJlbW92ZUNoaWxkXG4gICAqIFdpbGwgZmFpbCBhbiBhc3NlcnRpb24gaWYgdGhlIE5vZGUgaXMgbm90IGN1cnJlbnRseSBvbmUgb2Ygb3VyIGNoaWxkcmVuXG4gICAqXG4gICAqIEBwYXJhbSBub2RlXG4gICAqIEBwYXJhbSBbaXNDb21wb3NpdGVdIC0gKHNjZW5lcnktaW50ZXJuYWwpIElmIHRydWUsIHRoZSBjaGlsZHJlbkNoYW5nZWQgZXZlbnQgd2lsbCBub3QgYmUgc2VudCBvdXQuXG4gICAqL1xuICBwdWJsaWMgcmVtb3ZlQ2hpbGQoIG5vZGU6IE5vZGUsIGlzQ29tcG9zaXRlPzogYm9vbGVhbiApOiB0aGlzIHtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBub2RlICYmIG5vZGUgaW5zdGFuY2VvZiBOb2RlLCAnTmVlZCB0byBjYWxsIG5vZGUucmVtb3ZlQ2hpbGQoKSB3aXRoIGEgTm9kZS4nICk7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdGhpcy5oYXNDaGlsZCggbm9kZSApLCAnQXR0ZW1wdGVkIHRvIHJlbW92ZUNoaWxkIHdpdGggYSBub2RlIHRoYXQgd2FzIG5vdCBhIGNoaWxkLicgKTtcblxuICAgIGNvbnN0IGluZGV4T2ZDaGlsZCA9IF8uaW5kZXhPZiggdGhpcy5fY2hpbGRyZW4sIG5vZGUgKTtcblxuICAgIHRoaXMucmVtb3ZlQ2hpbGRXaXRoSW5kZXgoIG5vZGUsIGluZGV4T2ZDaGlsZCwgaXNDb21wb3NpdGUgKTtcblxuICAgIHJldHVybiB0aGlzOyAvLyBhbGxvdyBjaGFpbmluZ1xuICB9XG5cbiAgLyoqXG4gICAqIFJlbW92ZXMgYSBjaGlsZCBOb2RlIGF0IGEgc3BlY2lmaWMgaW5kZXggKG5vZGUuY2hpbGRyZW5bIGluZGV4IF0pIGZyb20gb3VyIGxpc3Qgb2YgY2hpbGRyZW4uXG4gICAqIFdpbGwgZmFpbCBpZiB0aGUgaW5kZXggaXMgb3V0IG9mIGJvdW5kcy5cbiAgICpcbiAgICogQHBhcmFtIGluZGV4XG4gICAqIEBwYXJhbSBbaXNDb21wb3NpdGVdIC0gKHNjZW5lcnktaW50ZXJuYWwpIElmIHRydWUsIHRoZSBjaGlsZHJlbkNoYW5nZWQgZXZlbnQgd2lsbCBub3QgYmUgc2VudCBvdXQuXG4gICAqL1xuICBwdWJsaWMgcmVtb3ZlQ2hpbGRBdCggaW5kZXg6IG51bWJlciwgaXNDb21wb3NpdGU/OiBib29sZWFuICk6IHRoaXMge1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIGluZGV4ID49IDAgKTtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBpbmRleCA8IHRoaXMuX2NoaWxkcmVuLmxlbmd0aCApO1xuXG4gICAgY29uc3Qgbm9kZSA9IHRoaXMuX2NoaWxkcmVuWyBpbmRleCBdO1xuXG4gICAgdGhpcy5yZW1vdmVDaGlsZFdpdGhJbmRleCggbm9kZSwgaW5kZXgsIGlzQ29tcG9zaXRlICk7XG5cbiAgICByZXR1cm4gdGhpczsgLy8gYWxsb3cgY2hhaW5pbmdcbiAgfVxuXG4gIC8qKlxuICAgKiBJbnRlcm5hbCBtZXRob2QgZm9yIHJlbW92aW5nIGEgTm9kZSAoYWx3YXlzIGhhcyB0aGUgTm9kZSBhbmQgaW5kZXgpLlxuICAgKlxuICAgKiBOT1RFOiBvdmVycmlkZGVuIGJ5IExlYWYgZm9yIHNvbWUgc3VidHlwZXNcbiAgICpcbiAgICogQHBhcmFtIG5vZGUgLSBUaGUgY2hpbGQgbm9kZSB0byByZW1vdmUgZnJvbSB0aGlzIE5vZGUgKGl0J3MgcGFyZW50KVxuICAgKiBAcGFyYW0gaW5kZXhPZkNoaWxkIC0gU2hvdWxkIHNhdGlzZnkgdGhpcy5jaGlsZHJlblsgaW5kZXhPZkNoaWxkIF0gPT09IG5vZGVcbiAgICogQHBhcmFtIFtpc0NvbXBvc2l0ZV0gLSAoc2NlbmVyeS1pbnRlcm5hbCkgSWYgdHJ1ZSwgdGhlIGNoaWxkcmVuQ2hhbmdlZCBldmVudCB3aWxsIG5vdCBiZSBzZW50IG91dC5cbiAgICovXG4gIHB1YmxpYyByZW1vdmVDaGlsZFdpdGhJbmRleCggbm9kZTogTm9kZSwgaW5kZXhPZkNoaWxkOiBudW1iZXIsIGlzQ29tcG9zaXRlPzogYm9vbGVhbiApOiB2b2lkIHtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBub2RlICYmIG5vZGUgaW5zdGFuY2VvZiBOb2RlLCAnTmVlZCB0byBjYWxsIG5vZGUucmVtb3ZlQ2hpbGRXaXRoSW5kZXgoKSB3aXRoIGEgTm9kZS4nICk7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdGhpcy5oYXNDaGlsZCggbm9kZSApLCAnQXR0ZW1wdGVkIHRvIHJlbW92ZUNoaWxkIHdpdGggYSBub2RlIHRoYXQgd2FzIG5vdCBhIGNoaWxkLicgKTtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0aGlzLl9jaGlsZHJlblsgaW5kZXhPZkNoaWxkIF0gPT09IG5vZGUsICdJbmNvcnJlY3QgaW5kZXggZm9yIHJlbW92ZUNoaWxkV2l0aEluZGV4JyApO1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIG5vZGUuX3BhcmVudHMgIT09IG51bGwsICdUcmllZCB0byByZW1vdmUgYSBkaXNwb3NlZCBjaGlsZCBub2RlPycgKTtcblxuICAgIGNvbnN0IGluZGV4T2ZQYXJlbnQgPSBfLmluZGV4T2YoIG5vZGUuX3BhcmVudHMsIHRoaXMgKTtcblxuICAgIG5vZGUuX2lzR2V0dGluZ1JlbW92ZWRGcm9tUGFyZW50ID0gdHJ1ZTtcblxuICAgIC8vIElmIHRoaXMgYWRkZWQgc3VidHJlZSBjb250YWlucyBQRE9NIGNvbnRlbnQsIHdlIG5lZWQgdG8gbm90aWZ5IGFueSByZWxldmFudCBkaXNwbGF5c1xuICAgIC8vIE5PVEU6IFBvdGVudGlhbGx5IHJlbW92ZXMgYm91bmRzIGxpc3RlbmVycyBoZXJlIVxuICAgIGlmICggIW5vZGUuX3JlbmRlcmVyU3VtbWFyeS5oYXNOb1BET00oKSApIHtcbiAgICAgIHRoaXMub25QRE9NUmVtb3ZlQ2hpbGQoIG5vZGUgKTtcbiAgICB9XG5cbiAgICAvLyBuZWVkcyB0byBiZSBlYXJseSB0byBwcmV2ZW50IHJlLWVudHJhbnQgY2hpbGRyZW4gbW9kaWZpY2F0aW9uc1xuICAgIHRoaXMuX3BpY2tlci5vblJlbW92ZUNoaWxkKCBub2RlICk7XG4gICAgdGhpcy5jaGFuZ2VCb3VuZHNFdmVudENvdW50KCBub2RlLl9ib3VuZHNFdmVudENvdW50ID4gMCA/IC0xIDogMCApO1xuICAgIHRoaXMuX3JlbmRlcmVyU3VtbWFyeS5zdW1tYXJ5Q2hhbmdlKCBub2RlLl9yZW5kZXJlclN1bW1hcnkuYml0bWFzaywgUmVuZGVyZXJTdW1tYXJ5LmJpdG1hc2tBbGwgKTtcblxuICAgIG5vZGUuX3BhcmVudHMuc3BsaWNlKCBpbmRleE9mUGFyZW50LCAxICk7XG4gICAgdGhpcy5fY2hpbGRyZW4uc3BsaWNlKCBpbmRleE9mQ2hpbGQsIDEgKTtcbiAgICBub2RlLl9pc0dldHRpbmdSZW1vdmVkRnJvbVBhcmVudCA9IGZhbHNlOyAvLyBJdCBpcyBcImNvbXBsZXRlXCJcblxuICAgIHRoaXMuaW52YWxpZGF0ZUJvdW5kcygpO1xuICAgIHRoaXMuX2NoaWxkQm91bmRzRGlydHkgPSB0cnVlOyAvLyBmb3JjZSByZWNvbXB1dGF0aW9uIG9mIGNoaWxkIGJvdW5kcyBhZnRlciByZW1vdmluZyBhIGNoaWxkXG5cbiAgICB0aGlzLmNoaWxkUmVtb3ZlZEVtaXR0ZXIuZW1pdCggbm9kZSwgaW5kZXhPZkNoaWxkICk7XG4gICAgbm9kZS5wYXJlbnRSZW1vdmVkRW1pdHRlci5lbWl0KCB0aGlzICk7XG5cbiAgICAhaXNDb21wb3NpdGUgJiYgdGhpcy5jaGlsZHJlbkNoYW5nZWRFbWl0dGVyLmVtaXQoKTtcblxuICAgIGlmICggYXNzZXJ0U2xvdyApIHsgdGhpcy5fcGlja2VyLmF1ZGl0KCk7IH1cbiAgfVxuXG4gIC8qKlxuICAgKiBJZiBhIGNoaWxkIGlzIG5vdCBhdCB0aGUgZ2l2ZW4gaW5kZXgsIGl0IGlzIG1vdmVkIHRvIHRoZSBnaXZlbiBpbmRleC4gVGhpcyByZW9yZGVycyB0aGUgY2hpbGRyZW4gb2YgdGhpcyBOb2RlIHNvXG4gICAqIHRoYXQgYHRoaXMuY2hpbGRyZW5bIGluZGV4IF0gPT09IG5vZGVgLlxuICAgKlxuICAgKiBAcGFyYW0gbm9kZSAtIFRoZSBjaGlsZCBOb2RlIHRvIG1vdmUgaW4gdGhlIG9yZGVyXG4gICAqIEBwYXJhbSBpbmRleCAtIFRoZSBkZXNpcmVkIGluZGV4IChpbnRvIHRoZSBjaGlsZHJlbiBhcnJheSkgb2YgdGhlIGNoaWxkLlxuICAgKi9cbiAgcHVibGljIG1vdmVDaGlsZFRvSW5kZXgoIG5vZGU6IE5vZGUsIGluZGV4OiBudW1iZXIgKTogdGhpcyB7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdGhpcy5oYXNDaGlsZCggbm9kZSApLCAnQXR0ZW1wdGVkIHRvIG1vdmVDaGlsZFRvSW5kZXggd2l0aCBhIG5vZGUgdGhhdCB3YXMgbm90IGEgY2hpbGQuJyApO1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIGluZGV4ICUgMSA9PT0gMCAmJiBpbmRleCA+PSAwICYmIGluZGV4IDwgdGhpcy5fY2hpbGRyZW4ubGVuZ3RoLFxuICAgICAgYEludmFsaWQgaW5kZXg6ICR7aW5kZXh9YCApO1xuXG4gICAgY29uc3QgY3VycmVudEluZGV4ID0gdGhpcy5pbmRleE9mQ2hpbGQoIG5vZGUgKTtcbiAgICBpZiAoIHRoaXMuX2NoaWxkcmVuWyBpbmRleCBdICE9PSBub2RlICkge1xuXG4gICAgICAvLyBBcHBseSB0aGUgYWN0dWFsIGNoaWxkcmVuIGNoYW5nZVxuICAgICAgdGhpcy5fY2hpbGRyZW4uc3BsaWNlKCBjdXJyZW50SW5kZXgsIDEgKTtcbiAgICAgIHRoaXMuX2NoaWxkcmVuLnNwbGljZSggaW5kZXgsIDAsIG5vZGUgKTtcblxuICAgICAgaWYgKCAhdGhpcy5fcmVuZGVyZXJTdW1tYXJ5Lmhhc05vUERPTSgpICkge1xuICAgICAgICB0aGlzLm9uUERPTVJlb3JkZXJlZENoaWxkcmVuKCk7XG4gICAgICB9XG5cbiAgICAgIHRoaXMuY2hpbGRyZW5SZW9yZGVyZWRFbWl0dGVyLmVtaXQoIE1hdGgubWluKCBjdXJyZW50SW5kZXgsIGluZGV4ICksIE1hdGgubWF4KCBjdXJyZW50SW5kZXgsIGluZGV4ICkgKTtcbiAgICAgIHRoaXMuY2hpbGRyZW5DaGFuZ2VkRW1pdHRlci5lbWl0KCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogUmVtb3ZlcyBhbGwgY2hpbGRyZW4gZnJvbSB0aGlzIE5vZGUuXG4gICAqL1xuICBwdWJsaWMgcmVtb3ZlQWxsQ2hpbGRyZW4oKTogdGhpcyB7XG4gICAgdGhpcy5zZXRDaGlsZHJlbiggW10gKTtcblxuICAgIHJldHVybiB0aGlzOyAvLyBhbGxvdyBjaGFpbmluZ1xuICB9XG5cbiAgLyoqXG4gICAqIFNldHMgdGhlIGNoaWxkcmVuIG9mIHRoZSBOb2RlIHRvIGJlIGVxdWl2YWxlbnQgdG8gdGhlIHBhc3NlZC1pbiBhcnJheSBvZiBOb2Rlcy5cbiAgICpcbiAgICogTk9URTogTWVhbnQgdG8gYmUgb3ZlcnJpZGRlbiBpbiBzb21lIGNhc2VzXG4gICAqL1xuICBwdWJsaWMgc2V0Q2hpbGRyZW4oIGNoaWxkcmVuOiBOb2RlW10gKTogdGhpcyB7XG4gICAgLy8gVGhlIGltcGxlbWVudGF0aW9uIGlzIHNwbGl0IGludG8gYmFzaWNhbGx5IHRocmVlIHN0YWdlczpcbiAgICAvLyAxLiBSZW1vdmUgY3VycmVudCBjaGlsZHJlbiB0aGF0IGFyZSBub3QgaW4gdGhlIG5ldyBjaGlsZHJlbiBhcnJheS5cbiAgICAvLyAyLiBSZW9yZGVyIGNoaWxkcmVuIHRoYXQgZXhpc3QgYm90aCBiZWZvcmUvYWZ0ZXIgdGhlIGNoYW5nZS5cbiAgICAvLyAzLiBJbnNlcnQgaW4gbmV3IGNoaWxkcmVuXG5cbiAgICBjb25zdCBiZWZvcmVPbmx5OiBOb2RlW10gPSBbXTsgLy8gV2lsbCBob2xkIGFsbCBub2RlcyB0aGF0IHdpbGwgYmUgcmVtb3ZlZC5cbiAgICBjb25zdCBhZnRlck9ubHk6IE5vZGVbXSA9IFtdOyAvLyBXaWxsIGhvbGQgYWxsIG5vZGVzIHRoYXQgd2lsbCBiZSBcIm5ld1wiIGNoaWxkcmVuIChhZGRlZClcbiAgICBjb25zdCBpbkJvdGg6IE5vZGVbXSA9IFtdOyAvLyBDaGlsZCBub2RlcyB0aGF0IFwic3RheVwiLiBXaWxsIGJlIG9yZGVyZWQgZm9yIHRoZSBcImFmdGVyXCIgY2FzZS5cbiAgICBsZXQgaTtcblxuICAgIC8vIENvbXB1dGUgd2hhdCB0aGluZ3Mgd2VyZSBhZGRlZCwgcmVtb3ZlZCwgb3Igc3RheS5cbiAgICBhcnJheURpZmZlcmVuY2UoIGNoaWxkcmVuLCB0aGlzLl9jaGlsZHJlbiwgYWZ0ZXJPbmx5LCBiZWZvcmVPbmx5LCBpbkJvdGggKTtcblxuICAgIC8vIFJlbW92ZSBhbnkgbm9kZXMgdGhhdCBhcmUgbm90IGluIHRoZSBuZXcgY2hpbGRyZW4uXG4gICAgZm9yICggaSA9IGJlZm9yZU9ubHkubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0gKSB7XG4gICAgICB0aGlzLnJlbW92ZUNoaWxkKCBiZWZvcmVPbmx5WyBpIF0sIHRydWUgKTtcbiAgICB9XG5cbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0aGlzLl9jaGlsZHJlbi5sZW5ndGggPT09IGluQm90aC5sZW5ndGgsXG4gICAgICAnUmVtb3ZpbmcgY2hpbGRyZW4gc2hvdWxkIG5vdCBoYXZlIHRyaWdnZXJlZCBvdGhlciBjaGlsZHJlbiBjaGFuZ2VzJyApO1xuXG4gICAgLy8gSGFuZGxlIHRoZSBtYWluIHJlb3JkZXJpbmcgKG9mIG5vZGVzIHRoYXQgXCJzdGF5XCIpXG4gICAgbGV0IG1pbkNoYW5nZUluZGV4ID0gLTE7IC8vIFdoYXQgaXMgdGhlIHNtYWxsZXN0IGluZGV4IHdoZXJlIHRoaXMuX2NoaWxkcmVuWyBpbmRleCBdICE9PSBpbkJvdGhbIGluZGV4IF1cbiAgICBsZXQgbWF4Q2hhbmdlSW5kZXggPSAtMTsgLy8gV2hhdCBpcyB0aGUgbGFyZ2VzdCBpbmRleCB3aGVyZSB0aGlzLl9jaGlsZHJlblsgaW5kZXggXSAhPT0gaW5Cb3RoWyBpbmRleCBdXG4gICAgZm9yICggaSA9IDA7IGkgPCBpbkJvdGgubGVuZ3RoOyBpKysgKSB7XG4gICAgICBjb25zdCBkZXNpcmVkID0gaW5Cb3RoWyBpIF07XG4gICAgICBpZiAoIHRoaXMuX2NoaWxkcmVuWyBpIF0gIT09IGRlc2lyZWQgKSB7XG4gICAgICAgIHRoaXMuX2NoaWxkcmVuWyBpIF0gPSBkZXNpcmVkO1xuICAgICAgICBpZiAoIG1pbkNoYW5nZUluZGV4ID09PSAtMSApIHtcbiAgICAgICAgICBtaW5DaGFuZ2VJbmRleCA9IGk7XG4gICAgICAgIH1cbiAgICAgICAgbWF4Q2hhbmdlSW5kZXggPSBpO1xuICAgICAgfVxuICAgIH1cbiAgICAvLyBJZiBvdXIgbWluQ2hhbmdlSW5kZXggaXMgc3RpbGwgLTEsIHRoZW4gbm9uZSBvZiB0aG9zZSBub2RlcyB0aGF0IFwic3RheVwiIHdlcmUgcmVvcmRlcmVkLiBJdCdzIGltcG9ydGFudCB0byBjaGVja1xuICAgIC8vIGZvciB0aGlzIGNhc2UsIHNvIHRoYXQgYG5vZGUuY2hpbGRyZW4gPSBub2RlLmNoaWxkcmVuYCBpcyBlZmZlY3RpdmVseSBhIG5vLW9wIHBlcmZvcm1hbmNlLXdpc2UuXG4gICAgY29uc3QgaGFzUmVvcmRlcmluZ0NoYW5nZSA9IG1pbkNoYW5nZUluZGV4ICE9PSAtMTtcblxuICAgIC8vIEltbWVkaWF0ZSBjb25zZXF1ZW5jZXMvdXBkYXRlcyBmcm9tIHJlb3JkZXJpbmdcbiAgICBpZiAoIGhhc1Jlb3JkZXJpbmdDaGFuZ2UgKSB7XG4gICAgICBpZiAoICF0aGlzLl9yZW5kZXJlclN1bW1hcnkuaGFzTm9QRE9NKCkgKSB7XG4gICAgICAgIHRoaXMub25QRE9NUmVvcmRlcmVkQ2hpbGRyZW4oKTtcbiAgICAgIH1cblxuICAgICAgdGhpcy5jaGlsZHJlblJlb3JkZXJlZEVtaXR0ZXIuZW1pdCggbWluQ2hhbmdlSW5kZXgsIG1heENoYW5nZUluZGV4ICk7XG4gICAgfVxuXG4gICAgLy8gQWRkIGluIFwibmV3XCIgY2hpbGRyZW4uXG4gICAgLy8gU2NhbiB0aHJvdWdoIHRoZSBcImVuZGluZ1wiIGNoaWxkcmVuIGluZGljZXMsIGFkZGluZyBpbiB0aGluZ3MgdGhhdCB3ZXJlIGluIHRoZSBcImFmdGVyT25seVwiIHBhcnQuIFRoaXMgc2NhbiBpc1xuICAgIC8vIGRvbmUgdGhyb3VnaCB0aGUgY2hpbGRyZW4gYXJyYXkgaW5zdGVhZCBvZiB0aGUgYWZ0ZXJPbmx5IGFycmF5IChhcyBkZXRlcm1pbmluZyB0aGUgaW5kZXggaW4gY2hpbGRyZW4gd291bGRcbiAgICAvLyB0aGVuIGJlIHF1YWRyYXRpYyBpbiB0aW1lLCB3aGljaCB3b3VsZCBiZSB1bmFjY2VwdGFibGUgaGVyZSkuIEF0IHRoaXMgcG9pbnQsIGEgZm9yd2FyZCBzY2FuIHNob3VsZCBiZVxuICAgIC8vIHN1ZmZpY2llbnQgdG8gaW5zZXJ0IGluLXBsYWNlLCBhbmQgc2hvdWxkIG1vdmUgdGhlIGxlYXN0IGFtb3VudCBvZiBub2RlcyBpbiB0aGUgYXJyYXkuXG4gICAgaWYgKCBhZnRlck9ubHkubGVuZ3RoICkge1xuICAgICAgbGV0IGFmdGVySW5kZXggPSAwO1xuICAgICAgbGV0IGFmdGVyID0gYWZ0ZXJPbmx5WyBhZnRlckluZGV4IF07XG4gICAgICBmb3IgKCBpID0gMDsgaSA8IGNoaWxkcmVuLmxlbmd0aDsgaSsrICkge1xuICAgICAgICBpZiAoIGNoaWxkcmVuWyBpIF0gPT09IGFmdGVyICkge1xuICAgICAgICAgIHRoaXMuaW5zZXJ0Q2hpbGQoIGksIGFmdGVyLCB0cnVlICk7XG4gICAgICAgICAgYWZ0ZXIgPSBhZnRlck9ubHlbICsrYWZ0ZXJJbmRleCBdO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gSWYgd2UgaGFkIGFueSBjaGFuZ2VzLCBzZW5kIHRoZSBnZW5lcmljIFwiY2hhbmdlZFwiIGV2ZW50LlxuICAgIGlmICggYmVmb3JlT25seS5sZW5ndGggIT09IDAgfHwgYWZ0ZXJPbmx5Lmxlbmd0aCAhPT0gMCB8fCBoYXNSZW9yZGVyaW5nQ2hhbmdlICkge1xuICAgICAgdGhpcy5jaGlsZHJlbkNoYW5nZWRFbWl0dGVyLmVtaXQoKTtcbiAgICB9XG5cbiAgICAvLyBTYW5pdHkgY2hlY2tzIHRvIG1ha2Ugc3VyZSBvdXIgcmVzdWx0aW5nIGNoaWxkcmVuIGFycmF5IGlzIGNvcnJlY3QuXG4gICAgaWYgKCBhc3NlcnQgKSB7XG4gICAgICBmb3IgKCBsZXQgaiA9IDA7IGogPCB0aGlzLl9jaGlsZHJlbi5sZW5ndGg7IGorKyApIHtcbiAgICAgICAgYXNzZXJ0KCBjaGlsZHJlblsgaiBdID09PSB0aGlzLl9jaGlsZHJlblsgaiBdLFxuICAgICAgICAgICdJbmNvcnJlY3QgY2hpbGQgYWZ0ZXIgc2V0Q2hpbGRyZW4sIHBvc3NpYmx5IGEgcmVlbnRyYW5jeSBpc3N1ZScgKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBhbGxvdyBjaGFpbmluZ1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIFNlZSBzZXRDaGlsZHJlbigpIGZvciBtb3JlIGluZm9ybWF0aW9uXG4gICAqL1xuICBwdWJsaWMgc2V0IGNoaWxkcmVuKCB2YWx1ZTogTm9kZVtdICkge1xuICAgIHRoaXMuc2V0Q2hpbGRyZW4oIHZhbHVlICk7XG4gIH1cblxuICAvKipcbiAgICogU2VlIGdldENoaWxkcmVuKCkgZm9yIG1vcmUgaW5mb3JtYXRpb25cbiAgICovXG4gIHB1YmxpYyBnZXQgY2hpbGRyZW4oKTogTm9kZVtdIHtcbiAgICByZXR1cm4gdGhpcy5nZXRDaGlsZHJlbigpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgYSBkZWZlbnNpdmUgY29weSBvZiB0aGUgYXJyYXkgb2YgZGlyZWN0IGNoaWxkcmVuIG9mIHRoaXMgbm9kZSwgb3JkZXJlZCBieSB3aGF0IGlzIGluIGZyb250IChub2RlcyBhdFxuICAgKiB0aGUgZW5kIG9mIHRoZSBhcnJheSBhcmUgaW4gZnJvbnQgb2Ygbm9kZXMgYXQgdGhlIHN0YXJ0KS5cbiAgICpcbiAgICogTWFraW5nIGNoYW5nZXMgdG8gdGhlIHJldHVybmVkIHJlc3VsdCB3aWxsIG5vdCBhZmZlY3QgdGhpcyBub2RlJ3MgY2hpbGRyZW4uXG4gICAqL1xuICBwdWJsaWMgZ2V0Q2hpbGRyZW4oKTogTm9kZVtdIHtcbiAgICByZXR1cm4gdGhpcy5fY2hpbGRyZW4uc2xpY2UoIDAgKTsgLy8gY3JlYXRlIGEgZGVmZW5zaXZlIGNvcHlcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGEgY291bnQgb2YgY2hpbGRyZW4sIHdpdGhvdXQgbmVlZGluZyB0byBtYWtlIGEgZGVmZW5zaXZlIGNvcHkuXG4gICAqL1xuICBwdWJsaWMgZ2V0Q2hpbGRyZW5Db3VudCgpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLl9jaGlsZHJlbi5sZW5ndGg7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyBhIGRlZmVuc2l2ZSBjb3B5IG9mIG91ciBwYXJlbnRzLiBUaGlzIGlzIGFuIGFycmF5IG9mIHBhcmVudCBub2RlcyB0aGF0IGlzIHJldHVybmVkIGluIG5vIHBhcnRpY3VsYXJcbiAgICogb3JkZXIgKGFzIG9yZGVyIGlzIG5vdCBpbXBvcnRhbnQgaGVyZSkuXG4gICAqXG4gICAqIE5PVEU6IE1vZGlmeWluZyB0aGUgcmV0dXJuZWQgYXJyYXkgd2lsbCBub3QgaW4gYW55IHdheSBtb2RpZnkgdGhpcyBub2RlJ3MgcGFyZW50cy5cbiAgICovXG4gIHB1YmxpYyBnZXRQYXJlbnRzKCk6IE5vZGVbXSB7XG4gICAgcmV0dXJuIHRoaXMuX3BhcmVudHMuc2xpY2UoIDAgKTsgLy8gY3JlYXRlIGEgZGVmZW5zaXZlIGNvcHlcbiAgfVxuXG4gIC8qKlxuICAgKiBTZWUgZ2V0UGFyZW50cygpIGZvciBtb3JlIGluZm9ybWF0aW9uXG4gICAqL1xuICBwdWJsaWMgZ2V0IHBhcmVudHMoKTogTm9kZVtdIHtcbiAgICByZXR1cm4gdGhpcy5nZXRQYXJlbnRzKCk7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyBhIHNpbmdsZSBwYXJlbnQgaWYgaXQgZXhpc3RzLCBvdGhlcndpc2UgbnVsbCAobm8gcGFyZW50cyksIG9yIGFuIGFzc2VydGlvbiBmYWlsdXJlIChtdWx0aXBsZSBwYXJlbnRzKS5cbiAgICovXG4gIHB1YmxpYyBnZXRQYXJlbnQoKTogTm9kZSB8IG51bGwge1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIHRoaXMuX3BhcmVudHMubGVuZ3RoIDw9IDEsICdDYW5ub3QgY2FsbCBnZXRQYXJlbnQgb24gYSBub2RlIHdpdGggbXVsdGlwbGUgcGFyZW50cycgKTtcbiAgICByZXR1cm4gdGhpcy5fcGFyZW50cy5sZW5ndGggPyB0aGlzLl9wYXJlbnRzWyAwIF0gOiBudWxsO1xuICB9XG5cbiAgLyoqXG4gICAqIFNlZSBnZXRQYXJlbnQoKSBmb3IgbW9yZSBpbmZvcm1hdGlvblxuICAgKi9cbiAgcHVibGljIGdldCBwYXJlbnQoKTogTm9kZSB8IG51bGwge1xuICAgIHJldHVybiB0aGlzLmdldFBhcmVudCgpO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldHMgdGhlIGNoaWxkIGF0IGEgc3BlY2lmaWMgaW5kZXggaW50byB0aGUgY2hpbGRyZW4gYXJyYXkuXG4gICAqL1xuICBwdWJsaWMgZ2V0Q2hpbGRBdCggaW5kZXg6IG51bWJlciApOiBOb2RlIHtcbiAgICByZXR1cm4gdGhpcy5fY2hpbGRyZW5bIGluZGV4IF07XG4gIH1cblxuICAvKipcbiAgICogRmluZHMgdGhlIGluZGV4IG9mIGEgcGFyZW50IE5vZGUgaW4gdGhlIHBhcmVudHMgYXJyYXkuXG4gICAqXG4gICAqIEBwYXJhbSBwYXJlbnQgLSBTaG91bGQgYmUgYSBwYXJlbnQgb2YgdGhpcyBub2RlLlxuICAgKiBAcmV0dXJucyAtIEFuIGluZGV4IHN1Y2ggdGhhdCB0aGlzLnBhcmVudHNbIGluZGV4IF0gPT09IHBhcmVudFxuICAgKi9cbiAgcHVibGljIGluZGV4T2ZQYXJlbnQoIHBhcmVudDogTm9kZSApOiBudW1iZXIge1xuICAgIHJldHVybiBfLmluZGV4T2YoIHRoaXMuX3BhcmVudHMsIHBhcmVudCApO1xuICB9XG5cbiAgLyoqXG4gICAqIEZpbmRzIHRoZSBpbmRleCBvZiBhIGNoaWxkIE5vZGUgaW4gdGhlIGNoaWxkcmVuIGFycmF5LlxuICAgKlxuICAgKiBAcGFyYW0gY2hpbGQgLSBTaG91bGQgYmUgYSBjaGlsZCBvZiB0aGlzIG5vZGUuXG4gICAqIEByZXR1cm5zIC0gQW4gaW5kZXggc3VjaCB0aGF0IHRoaXMuY2hpbGRyZW5bIGluZGV4IF0gPT09IGNoaWxkXG4gICAqL1xuICBwdWJsaWMgaW5kZXhPZkNoaWxkKCBjaGlsZDogTm9kZSApOiBudW1iZXIge1xuICAgIHJldHVybiBfLmluZGV4T2YoIHRoaXMuX2NoaWxkcmVuLCBjaGlsZCApO1xuICB9XG5cbiAgLyoqXG4gICAqIE1vdmVzIHRoaXMgTm9kZSB0byB0aGUgZnJvbnQgKGVuZCkgb2YgYWxsIG9mIGl0cyBwYXJlbnRzIGNoaWxkcmVuIGFycmF5LlxuICAgKi9cbiAgcHVibGljIG1vdmVUb0Zyb250KCk6IHRoaXMge1xuICAgIF8uZWFjaCggdGhpcy5wYXJlbnRzLCBwYXJlbnQgPT4gcGFyZW50Lm1vdmVDaGlsZFRvRnJvbnQoIHRoaXMgKSApO1xuXG4gICAgcmV0dXJuIHRoaXM7IC8vIGFsbG93IGNoYWluaW5nXG4gIH1cblxuICAvKipcbiAgICogTW92ZXMgb25lIG9mIG91ciBjaGlsZHJlbiB0byB0aGUgZnJvbnQgKGVuZCkgb2Ygb3VyIGNoaWxkcmVuIGFycmF5LlxuICAgKlxuICAgKiBAcGFyYW0gY2hpbGQgLSBPdXIgY2hpbGQgdG8gbW92ZSB0byB0aGUgZnJvbnQuXG4gICAqL1xuICBwdWJsaWMgbW92ZUNoaWxkVG9Gcm9udCggY2hpbGQ6IE5vZGUgKTogdGhpcyB7XG4gICAgcmV0dXJuIHRoaXMubW92ZUNoaWxkVG9JbmRleCggY2hpbGQsIHRoaXMuX2NoaWxkcmVuLmxlbmd0aCAtIDEgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBNb3ZlIHRoaXMgbm9kZSBvbmUgaW5kZXggZm9yd2FyZCBpbiBlYWNoIG9mIGl0cyBwYXJlbnRzLiAgSWYgdGhlIE5vZGUgaXMgYWxyZWFkeSBhdCB0aGUgZnJvbnQsIHRoaXMgaXMgYSBuby1vcC5cbiAgICovXG4gIHB1YmxpYyBtb3ZlRm9yd2FyZCgpOiB0aGlzIHtcbiAgICB0aGlzLnBhcmVudHMuZm9yRWFjaCggcGFyZW50ID0+IHBhcmVudC5tb3ZlQ2hpbGRGb3J3YXJkKCB0aGlzICkgKTtcbiAgICByZXR1cm4gdGhpczsgLy8gY2hhaW5pbmdcbiAgfVxuXG4gIC8qKlxuICAgKiBNb3ZlcyB0aGUgc3BlY2lmaWVkIGNoaWxkIGZvcndhcmQgYnkgb25lIGluZGV4LiAgSWYgdGhlIGNoaWxkIGlzIGFscmVhZHkgYXQgdGhlIGZyb250LCB0aGlzIGlzIGEgbm8tb3AuXG4gICAqL1xuICBwdWJsaWMgbW92ZUNoaWxkRm9yd2FyZCggY2hpbGQ6IE5vZGUgKTogdGhpcyB7XG4gICAgY29uc3QgaW5kZXggPSB0aGlzLmluZGV4T2ZDaGlsZCggY2hpbGQgKTtcbiAgICBpZiAoIGluZGV4IDwgdGhpcy5nZXRDaGlsZHJlbkNvdW50KCkgLSAxICkge1xuICAgICAgdGhpcy5tb3ZlQ2hpbGRUb0luZGV4KCBjaGlsZCwgaW5kZXggKyAxICk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzOyAvLyBjaGFpbmluZ1xuICB9XG5cbiAgLyoqXG4gICAqIE1vdmUgdGhpcyBub2RlIG9uZSBpbmRleCBiYWNrd2FyZCBpbiBlYWNoIG9mIGl0cyBwYXJlbnRzLiAgSWYgdGhlIE5vZGUgaXMgYWxyZWFkeSBhdCB0aGUgYmFjaywgdGhpcyBpcyBhIG5vLW9wLlxuICAgKi9cbiAgcHVibGljIG1vdmVCYWNrd2FyZCgpOiB0aGlzIHtcbiAgICB0aGlzLnBhcmVudHMuZm9yRWFjaCggcGFyZW50ID0+IHBhcmVudC5tb3ZlQ2hpbGRCYWNrd2FyZCggdGhpcyApICk7XG4gICAgcmV0dXJuIHRoaXM7IC8vIGNoYWluaW5nXG4gIH1cblxuICAvKipcbiAgICogTW92ZXMgdGhlIHNwZWNpZmllZCBjaGlsZCBmb3J3YXJkIGJ5IG9uZSBpbmRleC4gIElmIHRoZSBjaGlsZCBpcyBhbHJlYWR5IGF0IHRoZSBiYWNrLCB0aGlzIGlzIGEgbm8tb3AuXG4gICAqL1xuICBwdWJsaWMgbW92ZUNoaWxkQmFja3dhcmQoIGNoaWxkOiBOb2RlICk6IHRoaXMge1xuICAgIGNvbnN0IGluZGV4ID0gdGhpcy5pbmRleE9mQ2hpbGQoIGNoaWxkICk7XG4gICAgaWYgKCBpbmRleCA+IDAgKSB7XG4gICAgICB0aGlzLm1vdmVDaGlsZFRvSW5kZXgoIGNoaWxkLCBpbmRleCAtIDEgKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXM7IC8vIGNoYWluaW5nXG4gIH1cblxuICAvKipcbiAgICogTW92ZXMgdGhpcyBOb2RlIHRvIHRoZSBiYWNrIChmcm9udCkgb2YgYWxsIG9mIGl0cyBwYXJlbnRzIGNoaWxkcmVuIGFycmF5LlxuICAgKi9cbiAgcHVibGljIG1vdmVUb0JhY2soKTogdGhpcyB7XG4gICAgXy5lYWNoKCB0aGlzLnBhcmVudHMsIHBhcmVudCA9PiBwYXJlbnQubW92ZUNoaWxkVG9CYWNrKCB0aGlzICkgKTtcblxuICAgIHJldHVybiB0aGlzOyAvLyBhbGxvdyBjaGFpbmluZ1xuICB9XG5cbiAgLyoqXG4gICAqIE1vdmVzIG9uZSBvZiBvdXIgY2hpbGRyZW4gdG8gdGhlIGJhY2sgKGZyb250KSBvZiBvdXIgY2hpbGRyZW4gYXJyYXkuXG4gICAqXG4gICAqIEBwYXJhbSBjaGlsZCAtIE91ciBjaGlsZCB0byBtb3ZlIHRvIHRoZSBiYWNrLlxuICAgKi9cbiAgcHVibGljIG1vdmVDaGlsZFRvQmFjayggY2hpbGQ6IE5vZGUgKTogdGhpcyB7XG4gICAgcmV0dXJuIHRoaXMubW92ZUNoaWxkVG9JbmRleCggY2hpbGQsIDAgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXBsYWNlIGEgY2hpbGQgaW4gdGhpcyBub2RlJ3MgY2hpbGRyZW4gYXJyYXkgd2l0aCBhbm90aGVyIG5vZGUuIElmIHRoZSBvbGQgY2hpbGQgaGFkIERPTSBmb2N1cyBhbmRcbiAgICogdGhlIG5ldyBjaGlsZCBpcyBmb2N1c2FibGUsIHRoZSBuZXcgY2hpbGQgd2lsbCByZWNlaXZlIGZvY3VzIGFmdGVyIGl0IGlzIGFkZGVkLlxuICAgKi9cbiAgcHVibGljIHJlcGxhY2VDaGlsZCggb2xkQ2hpbGQ6IE5vZGUsIG5ld0NoaWxkOiBOb2RlICk6IHRoaXMge1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIHRoaXMuaGFzQ2hpbGQoIG9sZENoaWxkICksICdBdHRlbXB0ZWQgdG8gcmVwbGFjZSBhIG5vZGUgdGhhdCB3YXMgbm90IGEgY2hpbGQuJyApO1xuXG4gICAgLy8gaW5mb3JtYXRpb24gdGhhdCBuZWVkcyB0byBiZSByZXN0b3JlZFxuICAgIGNvbnN0IGluZGV4ID0gdGhpcy5pbmRleE9mQ2hpbGQoIG9sZENoaWxkICk7XG4gICAgY29uc3Qgb2xkQ2hpbGRGb2N1c2VkID0gb2xkQ2hpbGQuZm9jdXNlZDtcblxuICAgIHRoaXMucmVtb3ZlQ2hpbGQoIG9sZENoaWxkLCB0cnVlICk7XG4gICAgdGhpcy5pbnNlcnRDaGlsZCggaW5kZXgsIG5ld0NoaWxkLCB0cnVlICk7XG5cbiAgICB0aGlzLmNoaWxkcmVuQ2hhbmdlZEVtaXR0ZXIuZW1pdCgpO1xuXG4gICAgaWYgKCBvbGRDaGlsZEZvY3VzZWQgJiYgbmV3Q2hpbGQuZm9jdXNhYmxlICkge1xuICAgICAgbmV3Q2hpbGQuZm9jdXMoKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpczsgLy8gYWxsb3cgY2hhaW5pbmdcbiAgfVxuXG4gIC8qKlxuICAgKiBSZW1vdmVzIHRoaXMgTm9kZSBmcm9tIGFsbCBvZiBpdHMgcGFyZW50cy5cbiAgICovXG4gIHB1YmxpYyBkZXRhY2goKTogdGhpcyB7XG4gICAgXy5lYWNoKCB0aGlzLl9wYXJlbnRzLnNsaWNlKCAwICksIHBhcmVudCA9PiBwYXJlbnQucmVtb3ZlQ2hpbGQoIHRoaXMgKSApO1xuXG4gICAgcmV0dXJuIHRoaXM7IC8vIGFsbG93IGNoYWluaW5nXG4gIH1cblxuICAvKipcbiAgICogVXBkYXRlIG91ciBldmVudCBjb3VudCwgdXN1YWxseSBieSAxIG9yIC0xLiBTZWUgZG9jdW1lbnRhdGlvbiBvbiBfYm91bmRzRXZlbnRDb3VudCBpbiBjb25zdHJ1Y3Rvci5cbiAgICpcbiAgICogQHBhcmFtIG4gLSBIb3cgdG8gaW5jcmVtZW50L2RlY3JlbWVudCB0aGUgYm91bmRzIGV2ZW50IGxpc3RlbmVyIGNvdW50XG4gICAqL1xuICBwcml2YXRlIGNoYW5nZUJvdW5kc0V2ZW50Q291bnQoIG46IG51bWJlciApOiB2b2lkIHtcbiAgICBpZiAoIG4gIT09IDAgKSB7XG4gICAgICBjb25zdCB6ZXJvQmVmb3JlID0gdGhpcy5fYm91bmRzRXZlbnRDb3VudCA9PT0gMDtcblxuICAgICAgdGhpcy5fYm91bmRzRXZlbnRDb3VudCArPSBuO1xuICAgICAgYXNzZXJ0ICYmIGFzc2VydCggdGhpcy5fYm91bmRzRXZlbnRDb3VudCA+PSAwLCAnc3VidHJlZSBib3VuZHMgZXZlbnQgY291bnQgc2hvdWxkIGJlIGd1YXJhbnRlZWQgdG8gYmUgPj0gMCcgKTtcblxuICAgICAgY29uc3QgemVyb0FmdGVyID0gdGhpcy5fYm91bmRzRXZlbnRDb3VudCA9PT0gMDtcblxuICAgICAgaWYgKCB6ZXJvQmVmb3JlICE9PSB6ZXJvQWZ0ZXIgKSB7XG4gICAgICAgIC8vIHBhcmVudHMgd2lsbCBvbmx5IGhhdmUgdGhlaXIgY291bnRcbiAgICAgICAgY29uc3QgcGFyZW50RGVsdGEgPSB6ZXJvQmVmb3JlID8gMSA6IC0xO1xuXG4gICAgICAgIGNvbnN0IGxlbiA9IHRoaXMuX3BhcmVudHMubGVuZ3RoO1xuICAgICAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBsZW47IGkrKyApIHtcbiAgICAgICAgICB0aGlzLl9wYXJlbnRzWyBpIF0uY2hhbmdlQm91bmRzRXZlbnRDb3VudCggcGFyZW50RGVsdGEgKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBFbnN1cmVzIHRoYXQgdGhlIGNhY2hlZCBzZWxmQm91bmRzIG9mIHRoaXMgTm9kZSBpcyBhY2N1cmF0ZS4gUmV0dXJucyB0cnVlIGlmIGFueSBzb3J0IG9mIGRpcnR5IGZsYWcgd2FzIHNldFxuICAgKiBiZWZvcmUgdGhpcyB3YXMgY2FsbGVkLlxuICAgKlxuICAgKiBAcmV0dXJucyAtIFdhcyB0aGUgc2VsZi1ib3VuZHMgcG90ZW50aWFsbHkgdXBkYXRlZD9cbiAgICovXG4gIHB1YmxpYyB2YWxpZGF0ZVNlbGZCb3VuZHMoKTogYm9vbGVhbiB7XG4gICAgLy8gdmFsaWRhdGUgYm91bmRzIG9mIG91cnNlbGYgaWYgbmVjZXNzYXJ5XG4gICAgaWYgKCB0aGlzLl9zZWxmQm91bmRzRGlydHkgKSB7XG4gICAgICBjb25zdCBvbGRTZWxmQm91bmRzID0gc2NyYXRjaEJvdW5kczIuc2V0KCB0aGlzLnNlbGZCb3VuZHNQcm9wZXJ0eS5fdmFsdWUgKTtcblxuICAgICAgLy8gUmVseSBvbiBhbiBvdmVybG9hZGFibGUgbWV0aG9kIHRvIGFjY29tcGxpc2ggY29tcHV0aW5nIG91ciBzZWxmIGJvdW5kcy4gVGhpcyBzaG91bGQgdXBkYXRlXG4gICAgICAvLyB0aGlzLnNlbGZCb3VuZHMgaXRzZWxmLCByZXR1cm5pbmcgd2hldGhlciBpdCB3YXMgYWN0dWFsbHkgY2hhbmdlZC4gSWYgaXQgZGlkbid0IGNoYW5nZSwgd2UgZG9uJ3Qgd2FudCB0b1xuICAgICAgLy8gc2VuZCBhICdzZWxmQm91bmRzJyBldmVudC5cbiAgICAgIGNvbnN0IGRpZFNlbGZCb3VuZHNDaGFuZ2UgPSB0aGlzLnVwZGF0ZVNlbGZCb3VuZHMoKTtcbiAgICAgIHRoaXMuX3NlbGZCb3VuZHNEaXJ0eSA9IGZhbHNlO1xuXG4gICAgICBpZiAoIGRpZFNlbGZCb3VuZHNDaGFuZ2UgKSB7XG4gICAgICAgIHRoaXMuc2VsZkJvdW5kc1Byb3BlcnR5Lm5vdGlmeUxpc3RlbmVycyggb2xkU2VsZkJvdW5kcyApO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICAvKipcbiAgICogRW5zdXJlcyB0aGF0IGNhY2hlZCBib3VuZHMgc3RvcmVkIG9uIHRoaXMgTm9kZSAoYW5kIGFsbCBjaGlsZHJlbikgYXJlIGFjY3VyYXRlLiBSZXR1cm5zIHRydWUgaWYgYW55IHNvcnQgb2YgZGlydHlcbiAgICogZmxhZyB3YXMgc2V0IGJlZm9yZSB0aGlzIHdhcyBjYWxsZWQuXG4gICAqXG4gICAqIEByZXR1cm5zIC0gV2FzIHNvbWV0aGluZyBwb3RlbnRpYWxseSB1cGRhdGVkP1xuICAgKi9cbiAgcHVibGljIHZhbGlkYXRlQm91bmRzKCk6IGJvb2xlYW4ge1xuXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLmJvdW5kcyAmJiBzY2VuZXJ5TG9nLmJvdW5kcyggYHZhbGlkYXRlQm91bmRzICMke3RoaXMuX2lkfWAgKTtcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuYm91bmRzICYmIHNjZW5lcnlMb2cucHVzaCgpO1xuXG4gICAgbGV0IGk7XG4gICAgY29uc3Qgbm90aWZpY2F0aW9uVGhyZXNob2xkID0gMWUtMTM7XG5cbiAgICBsZXQgd2FzRGlydHlCZWZvcmUgPSB0aGlzLnZhbGlkYXRlU2VsZkJvdW5kcygpO1xuXG4gICAgLy8gV2UncmUgZ29pbmcgdG8gZGlyZWN0bHkgbXV0YXRlIHRoZXNlIGluc3RhbmNlc1xuICAgIGNvbnN0IG91ckNoaWxkQm91bmRzID0gdGhpcy5jaGlsZEJvdW5kc1Byb3BlcnR5Ll92YWx1ZTtcbiAgICBjb25zdCBvdXJMb2NhbEJvdW5kcyA9IHRoaXMubG9jYWxCb3VuZHNQcm9wZXJ0eS5fdmFsdWU7XG4gICAgY29uc3Qgb3VyU2VsZkJvdW5kcyA9IHRoaXMuc2VsZkJvdW5kc1Byb3BlcnR5Ll92YWx1ZTtcbiAgICBjb25zdCBvdXJCb3VuZHMgPSB0aGlzLmJvdW5kc1Byb3BlcnR5Ll92YWx1ZTtcblxuICAgIC8vIHZhbGlkYXRlIGJvdW5kcyBvZiBjaGlsZHJlbiBpZiBuZWNlc3NhcnlcbiAgICBpZiAoIHRoaXMuX2NoaWxkQm91bmRzRGlydHkgKSB7XG4gICAgICB3YXNEaXJ0eUJlZm9yZSA9IHRydWU7XG5cbiAgICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5ib3VuZHMgJiYgc2NlbmVyeUxvZy5ib3VuZHMoICdjaGlsZEJvdW5kcyBkaXJ0eScgKTtcblxuICAgICAgLy8gaGF2ZSBlYWNoIGNoaWxkIHZhbGlkYXRlIHRoZWlyIG93biBib3VuZHMgKHBvdGVudGlhbGx5IG11bHRpcGxlIHRpbWVzLCB1bnRpbCB0aGVyZSBhcmUgbm8gY2hhbmdlcylcbiAgICAgIGxldCBjaGFuZ2VkID0gdHJ1ZTtcbiAgICAgIGxldCBjb3VudCA9IDA7XG4gICAgICB3aGlsZSAoIGNoYW5nZWQgKSB7XG4gICAgICAgIGNoYW5nZWQgPSBmYWxzZTtcbiAgICAgICAgaSA9IHRoaXMuX2NoaWxkcmVuLmxlbmd0aDtcbiAgICAgICAgd2hpbGUgKCBpLS0gKSB7XG4gICAgICAgICAgY29uc3QgY2hpbGQgPSB0aGlzLl9jaGlsZHJlblsgaSBdO1xuXG4gICAgICAgICAgLy8gUmVlbnRyYW5jeSBtaWdodCBjYXVzZSB0aGUgY2hpbGQgdG8gYmUgcmVtb3ZlZFxuICAgICAgICAgIGlmICggY2hpbGQgKSB7XG4gICAgICAgICAgICBjaGFuZ2VkID0gY2hpbGQudmFsaWRhdGVCb3VuZHMoKSB8fCBjaGFuZ2VkO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGFzc2VydCAmJiBhc3NlcnQoIGNvdW50KysgPCA1MDAsICdJbmZpbml0ZSBsb29wIGRldGVjdGVkIC0gY2hpbGRyZW4gYXJlIGNoYW5naW5nIGJvdW5kcyBkdXJpbmcgdmFsaWRhdGlvbicgKTtcbiAgICAgIH1cblxuICAgICAgLy8gYW5kIHJlY29tcHV0ZSBvdXIgY2hpbGRCb3VuZHNcbiAgICAgIGNvbnN0IG9sZENoaWxkQm91bmRzID0gc2NyYXRjaEJvdW5kczIuc2V0KCBvdXJDaGlsZEJvdW5kcyApOyAvLyBzdG9yZSBvbGQgdmFsdWUgaW4gYSB0ZW1wb3JhcnkgQm91bmRzMlxuICAgICAgb3VyQ2hpbGRCb3VuZHMuc2V0KCBCb3VuZHMyLk5PVEhJTkcgKTsgLy8gaW5pdGlhbGl6ZSB0byBhIHZhbHVlIHRoYXQgY2FuIGJlIHVuaW9uZWQgd2l0aCBpbmNsdWRlQm91bmRzKClcblxuICAgICAgaSA9IHRoaXMuX2NoaWxkcmVuLmxlbmd0aDtcbiAgICAgIHdoaWxlICggaS0tICkge1xuICAgICAgICBjb25zdCBjaGlsZCA9IHRoaXMuX2NoaWxkcmVuWyBpIF07XG5cbiAgICAgICAgLy8gUmVlbnRyYW5jeSBtaWdodCBjYXVzZSB0aGUgY2hpbGQgdG8gYmUgcmVtb3ZlZFxuICAgICAgICBpZiAoIGNoaWxkICYmICF0aGlzLl9leGNsdWRlSW52aXNpYmxlQ2hpbGRyZW5Gcm9tQm91bmRzIHx8IGNoaWxkLmlzVmlzaWJsZSgpICkge1xuICAgICAgICAgIG91ckNoaWxkQm91bmRzLmluY2x1ZGVCb3VuZHMoIGNoaWxkLmJvdW5kcyApO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8vIHJ1biB0aGlzIGJlZm9yZSBmaXJpbmcgdGhlIGV2ZW50XG4gICAgICB0aGlzLl9jaGlsZEJvdW5kc0RpcnR5ID0gZmFsc2U7XG4gICAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuYm91bmRzICYmIHNjZW5lcnlMb2cuYm91bmRzKCBgY2hpbGRCb3VuZHM6ICR7b3VyQ2hpbGRCb3VuZHN9YCApO1xuXG4gICAgICBpZiAoICFvdXJDaGlsZEJvdW5kcy5lcXVhbHMoIG9sZENoaWxkQm91bmRzICkgKSB7XG4gICAgICAgIC8vIG5vdGlmaWVzIG9ubHkgb24gYW4gYWN0dWFsIGNoYW5nZVxuICAgICAgICBpZiAoICFvdXJDaGlsZEJvdW5kcy5lcXVhbHNFcHNpbG9uKCBvbGRDaGlsZEJvdW5kcywgbm90aWZpY2F0aW9uVGhyZXNob2xkICkgKSB7XG4gICAgICAgICAgdGhpcy5jaGlsZEJvdW5kc1Byb3BlcnR5Lm5vdGlmeUxpc3RlbmVycyggb2xkQ2hpbGRCb3VuZHMgKTsgLy8gUkUtRU5UUkFOVCBDQUxMIEhFUkUsIGl0IHdpbGwgdmFsaWRhdGVCb3VuZHMoKVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8vIFdBUk5JTkc6IFRoaW5rIHR3aWNlIGJlZm9yZSBhZGRpbmcgY29kZSBoZXJlIGJlbG93IHRoZSBsaXN0ZW5lciBub3RpZmljYXRpb24uIFRoZSBub3RpZnlMaXN0ZW5lcnMoKSBjYWxsIGNhblxuICAgICAgLy8gdHJpZ2dlciByZS1lbnRyYW5jeSwgc28gdGhpcyBmdW5jdGlvbiBuZWVkcyB0byB3b3JrIHdoZW4gdGhhdCBoYXBwZW5zLiBETyBOT1Qgc2V0IHRoaW5ncyBiYXNlZCBvbiBsb2NhbFxuICAgICAgLy8gdmFyaWFibGVzIGhlcmUuXG4gICAgfVxuXG4gICAgaWYgKCB0aGlzLl9sb2NhbEJvdW5kc0RpcnR5ICkge1xuICAgICAgd2FzRGlydHlCZWZvcmUgPSB0cnVlO1xuXG4gICAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuYm91bmRzICYmIHNjZW5lcnlMb2cuYm91bmRzKCAnbG9jYWxCb3VuZHMgZGlydHknICk7XG5cbiAgICAgIHRoaXMuX2xvY2FsQm91bmRzRGlydHkgPSBmYWxzZTsgLy8gd2Ugb25seSBuZWVkIHRoaXMgdG8gc2V0IGxvY2FsIGJvdW5kcyBhcyBkaXJ0eVxuXG4gICAgICBjb25zdCBvbGRMb2NhbEJvdW5kcyA9IHNjcmF0Y2hCb3VuZHMyLnNldCggb3VyTG9jYWxCb3VuZHMgKTsgLy8gc3RvcmUgb2xkIHZhbHVlIGluIGEgdGVtcG9yYXJ5IEJvdW5kczJcblxuICAgICAgLy8gT25seSBhZGp1c3QgdGhlIGxvY2FsIGJvdW5kcyBpZiBpdCBpcyBub3Qgb3ZlcnJpZGRlblxuICAgICAgaWYgKCAhdGhpcy5fbG9jYWxCb3VuZHNPdmVycmlkZGVuICkge1xuICAgICAgICAvLyBsb2NhbCBib3VuZHMgYXJlIGEgdW5pb24gYmV0d2VlbiBvdXIgc2VsZiBib3VuZHMgYW5kIGNoaWxkIGJvdW5kc1xuICAgICAgICBvdXJMb2NhbEJvdW5kcy5zZXQoIG91clNlbGZCb3VuZHMgKS5pbmNsdWRlQm91bmRzKCBvdXJDaGlsZEJvdW5kcyApO1xuXG4gICAgICAgIC8vIGFwcGx5IGNsaXBwaW5nIHRvIHRoZSBib3VuZHMgaWYgd2UgaGF2ZSBhIGNsaXAgYXJlYSAoYWxsIGRvbmUgaW4gdGhlIGxvY2FsIGNvb3JkaW5hdGUgZnJhbWUpXG4gICAgICAgIGNvbnN0IGNsaXBBcmVhID0gdGhpcy5jbGlwQXJlYTtcbiAgICAgICAgaWYgKCBjbGlwQXJlYSApIHtcbiAgICAgICAgICBvdXJMb2NhbEJvdW5kcy5jb25zdHJhaW5Cb3VuZHMoIGNsaXBBcmVhLmJvdW5kcyApO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5ib3VuZHMgJiYgc2NlbmVyeUxvZy5ib3VuZHMoIGBsb2NhbEJvdW5kczogJHtvdXJMb2NhbEJvdW5kc31gICk7XG5cbiAgICAgIC8vIE5PVEU6IHdlIG5lZWQgdG8gdXBkYXRlIG1heCBkaW1lbnNpb25zIHN0aWxsIGV2ZW4gaWYgd2UgYXJlIHNldHRpbmcgb3ZlcnJpZGRlbiBsb2NhbEJvdW5kc1xuICAgICAgLy8gYWRqdXN0IG91ciB0cmFuc2Zvcm0gdG8gbWF0Y2ggbWF4aW11bSBib3VuZHMgaWYgbmVjZXNzYXJ5IG9uIGEgbG9jYWwgYm91bmRzIGNoYW5nZVxuICAgICAgaWYgKCB0aGlzLl9tYXhXaWR0aCAhPT0gbnVsbCB8fCB0aGlzLl9tYXhIZWlnaHQgIT09IG51bGwgKSB7XG4gICAgICAgIC8vIG5lZWRzIHRvIHJ1biBiZWZvcmUgbm90aWZpY2F0aW9ucyBiZWxvdywgb3RoZXJ3aXNlIHJlZW50cmFuY3kgdGhhdCBoaXRzIHRoaXMgY29kZXBhdGggd2lsbCBoYXZlIGl0c1xuICAgICAgICAvLyB1cGRhdGVNYXhEaW1lbnNpb24gb3ZlcnJpZGRlbiBieSB0aGUgZXZlbnR1YWwgb3JpZ2luYWwgZnVuY3Rpb24gY2FsbCwgd2l0aCB0aGUgbm93LWluY29ycmVjdCBsb2NhbCBib3VuZHMuXG4gICAgICAgIC8vIFNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvam9pc3QvaXNzdWVzLzcyNVxuICAgICAgICB0aGlzLnVwZGF0ZU1heERpbWVuc2lvbiggb3VyTG9jYWxCb3VuZHMgKTtcbiAgICAgIH1cblxuICAgICAgaWYgKCAhb3VyTG9jYWxCb3VuZHMuZXF1YWxzKCBvbGRMb2NhbEJvdW5kcyApICkge1xuICAgICAgICAvLyBzYW5pdHkgY2hlY2ssIHNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvc2NlbmVyeS9pc3N1ZXMvMTA3MSwgd2UncmUgcnVubmluZyB0aGlzIGJlZm9yZSB0aGUgbG9jYWxCb3VuZHNcbiAgICAgICAgLy8gbGlzdGVuZXJzIGFyZSBub3RpZmllZCwgdG8gc3VwcG9ydCBsaW1pdGVkIHJlLWVudHJhbmNlLlxuICAgICAgICB0aGlzLl9ib3VuZHNEaXJ0eSA9IHRydWU7XG5cbiAgICAgICAgaWYgKCAhb3VyTG9jYWxCb3VuZHMuZXF1YWxzRXBzaWxvbiggb2xkTG9jYWxCb3VuZHMsIG5vdGlmaWNhdGlvblRocmVzaG9sZCApICkge1xuICAgICAgICAgIHRoaXMubG9jYWxCb3VuZHNQcm9wZXJ0eS5ub3RpZnlMaXN0ZW5lcnMoIG9sZExvY2FsQm91bmRzICk7IC8vIFJFLUVOVFJBTlQgQ0FMTCBIRVJFLCBpdCB3aWxsIHZhbGlkYXRlQm91bmRzKClcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvLyBXQVJOSU5HOiBUaGluayB0d2ljZSBiZWZvcmUgYWRkaW5nIGNvZGUgaGVyZSBiZWxvdyB0aGUgbGlzdGVuZXIgbm90aWZpY2F0aW9uLiBUaGUgbm90aWZ5TGlzdGVuZXJzKCkgY2FsbCBjYW5cbiAgICAgIC8vIHRyaWdnZXIgcmUtZW50cmFuY3ksIHNvIHRoaXMgZnVuY3Rpb24gbmVlZHMgdG8gd29yayB3aGVuIHRoYXQgaGFwcGVucy4gRE8gTk9UIHNldCB0aGluZ3MgYmFzZWQgb24gbG9jYWxcbiAgICAgIC8vIHZhcmlhYmxlcyBoZXJlLlxuICAgIH1cblxuICAgIC8vIFRPRE86IGxheW91dCBoZXJlPyBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvc2NlbmVyeS9pc3N1ZXMvMTU4MVxuXG4gICAgaWYgKCB0aGlzLl9ib3VuZHNEaXJ0eSApIHtcbiAgICAgIHdhc0RpcnR5QmVmb3JlID0gdHJ1ZTtcblxuICAgICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLmJvdW5kcyAmJiBzY2VuZXJ5TG9nLmJvdW5kcyggJ2JvdW5kcyBkaXJ0eScgKTtcblxuICAgICAgLy8gcnVuIHRoaXMgYmVmb3JlIGZpcmluZyB0aGUgZXZlbnRcbiAgICAgIHRoaXMuX2JvdW5kc0RpcnR5ID0gZmFsc2U7XG5cbiAgICAgIGNvbnN0IG9sZEJvdW5kcyA9IHNjcmF0Y2hCb3VuZHMyLnNldCggb3VyQm91bmRzICk7IC8vIHN0b3JlIG9sZCB2YWx1ZSBpbiBhIHRlbXBvcmFyeSBCb3VuZHMyXG5cbiAgICAgIC8vIG5vIG5lZWQgdG8gZG8gdGhlIG1vcmUgZXhwZW5zaXZlIGJvdW5kcyB0cmFuc2Zvcm1hdGlvbiBpZiB3ZSBhcmUgc3RpbGwgYXhpcy1hbGlnbmVkXG4gICAgICBpZiAoIHRoaXMuX3RyYW5zZm9ybUJvdW5kcyAmJiAhdGhpcy5fdHJhbnNmb3JtLmdldE1hdHJpeCgpLmlzQXhpc0FsaWduZWQoKSApIHtcbiAgICAgICAgLy8gbXV0YXRlcyB0aGUgbWF0cml4IGFuZCBib3VuZHMgZHVyaW5nIHJlY3Vyc2lvblxuXG4gICAgICAgIGNvbnN0IG1hdHJpeCA9IHNjcmF0Y2hNYXRyaXgzLnNldCggdGhpcy5nZXRNYXRyaXgoKSApOyAvLyBjYWxscyBiZWxvdyBtdXRhdGUgdGhpcyBtYXRyaXhcbiAgICAgICAgb3VyQm91bmRzLnNldCggQm91bmRzMi5OT1RISU5HICk7XG4gICAgICAgIC8vIEluY2x1ZGUgZWFjaCBwYWludGVkIHNlbGYgaW5kaXZpZHVhbGx5LCB0cmFuc2Zvcm1lZCB3aXRoIHRoZSBleGFjdCB0cmFuc2Zvcm0gbWF0cml4LlxuICAgICAgICAvLyBUaGlzIGlzIGV4cGVuc2l2ZSwgYXMgd2UgaGF2ZSB0byBkbyAyIG1hdHJpeCB0cmFuc2Zvcm1zIGZvciBldmVyeSBkZXNjZW5kYW50LlxuICAgICAgICB0aGlzLl9pbmNsdWRlVHJhbnNmb3JtZWRTdWJ0cmVlQm91bmRzKCBtYXRyaXgsIG91ckJvdW5kcyApOyAvLyBzZWxmIGFuZCBjaGlsZHJlblxuXG4gICAgICAgIGNvbnN0IGNsaXBBcmVhID0gdGhpcy5jbGlwQXJlYTtcbiAgICAgICAgaWYgKCBjbGlwQXJlYSApIHtcbiAgICAgICAgICBvdXJCb3VuZHMuY29uc3RyYWluQm91bmRzKCBjbGlwQXJlYS5nZXRCb3VuZHNXaXRoVHJhbnNmb3JtKCBtYXRyaXggKSApO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgLy8gY29udmVydHMgbG9jYWwgdG8gcGFyZW50IGJvdW5kcy4gbXV0YWJsZSBtZXRob2RzIHVzZWQgdG8gbWluaW1pemUgbnVtYmVyIG9mIGNyZWF0ZWQgYm91bmRzIGluc3RhbmNlc1xuICAgICAgICAvLyAod2UgY3JlYXRlIG9uZSBzbyB3ZSBkb24ndCBjaGFuZ2UgcmVmZXJlbmNlcyB0byB0aGUgb2xkIG9uZSlcbiAgICAgICAgb3VyQm91bmRzLnNldCggb3VyTG9jYWxCb3VuZHMgKTtcbiAgICAgICAgdGhpcy50cmFuc2Zvcm1Cb3VuZHNGcm9tTG9jYWxUb1BhcmVudCggb3VyQm91bmRzICk7XG4gICAgICB9XG5cbiAgICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5ib3VuZHMgJiYgc2NlbmVyeUxvZy5ib3VuZHMoIGBib3VuZHM6ICR7b3VyQm91bmRzfWAgKTtcblxuICAgICAgaWYgKCAhb3VyQm91bmRzLmVxdWFscyggb2xkQm91bmRzICkgKSB7XG4gICAgICAgIC8vIGlmIHdlIGhhdmUgYSBib3VuZHMgY2hhbmdlLCB3ZSBuZWVkIHRvIGludmFsaWRhdGUgb3VyIHBhcmVudHMgc28gdGhleSBjYW4gYmUgcmVjb21wdXRlZFxuICAgICAgICBpID0gdGhpcy5fcGFyZW50cy5sZW5ndGg7XG4gICAgICAgIHdoaWxlICggaS0tICkge1xuICAgICAgICAgIHRoaXMuX3BhcmVudHNbIGkgXS5pbnZhbGlkYXRlQm91bmRzKCk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBUT0RPOiBjb25zaWRlciBjaGFuZ2luZyB0byBwYXJhbWV0ZXIgb2JqZWN0ICh0aGF0IG1heSBiZSBhIHByb2JsZW0gZm9yIHRoZSBHQyBvdmVyaGVhZCkgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3NjZW5lcnkvaXNzdWVzLzE1ODFcbiAgICAgICAgaWYgKCAhb3VyQm91bmRzLmVxdWFsc0Vwc2lsb24oIG9sZEJvdW5kcywgbm90aWZpY2F0aW9uVGhyZXNob2xkICkgKSB7XG4gICAgICAgICAgdGhpcy5ib3VuZHNQcm9wZXJ0eS5ub3RpZnlMaXN0ZW5lcnMoIG9sZEJvdW5kcyApOyAvLyBSRS1FTlRSQU5UIENBTEwgSEVSRSwgaXQgd2lsbCB2YWxpZGF0ZUJvdW5kcygpXG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLy8gV0FSTklORzogVGhpbmsgdHdpY2UgYmVmb3JlIGFkZGluZyBjb2RlIGhlcmUgYmVsb3cgdGhlIGxpc3RlbmVyIG5vdGlmaWNhdGlvbi4gVGhlIG5vdGlmeUxpc3RlbmVycygpIGNhbGwgY2FuXG4gICAgICAvLyB0cmlnZ2VyIHJlLWVudHJhbmN5LCBzbyB0aGlzIGZ1bmN0aW9uIG5lZWRzIHRvIHdvcmsgd2hlbiB0aGF0IGhhcHBlbnMuIERPIE5PVCBzZXQgdGhpbmdzIGJhc2VkIG9uIGxvY2FsXG4gICAgICAvLyB2YXJpYWJsZXMgaGVyZS5cbiAgICB9XG5cbiAgICAvLyBpZiB0aGVyZSB3ZXJlIHNpZGUtZWZmZWN0cywgcnVuIHRoZSB2YWxpZGF0aW9uIGFnYWluIHVudGlsIHdlIGFyZSBjbGVhblxuICAgIGlmICggdGhpcy5fY2hpbGRCb3VuZHNEaXJ0eSB8fCB0aGlzLl9ib3VuZHNEaXJ0eSApIHtcbiAgICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5ib3VuZHMgJiYgc2NlbmVyeUxvZy5ib3VuZHMoICdyZXZhbGlkYXRpb24nICk7XG5cbiAgICAgIC8vIFRPRE86IGlmIHRoZXJlIGFyZSBzaWRlLWVmZmVjdHMgaW4gbGlzdGVuZXJzLCB0aGlzIGNvdWxkIG92ZXJmbG93IHRoZSBzdGFjay4gd2Ugc2hvdWxkIHJlcG9ydCBhbiBlcnJvciBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvc2NlbmVyeS9pc3N1ZXMvMTU4MVxuICAgICAgLy8gaW5zdGVhZCBvZiBsb2NraW5nIHVwXG4gICAgICB0aGlzLnZhbGlkYXRlQm91bmRzKCk7IC8vIFJFLUVOVFJBTlQgQ0FMTCBIRVJFLCBpdCB3aWxsIHZhbGlkYXRlQm91bmRzKClcbiAgICB9XG5cbiAgICBpZiAoIGFzc2VydCApIHtcbiAgICAgIGFzc2VydCggIXRoaXMuX29yaWdpbmFsQm91bmRzIHx8IHRoaXMuX29yaWdpbmFsQm91bmRzID09PSB0aGlzLmJvdW5kc1Byb3BlcnR5Ll92YWx1ZSwgJ1JlZmVyZW5jZSBmb3IgYm91bmRzIGNoYW5nZWQhJyApO1xuICAgICAgYXNzZXJ0KCAhdGhpcy5fb3JpZ2luYWxMb2NhbEJvdW5kcyB8fCB0aGlzLl9vcmlnaW5hbExvY2FsQm91bmRzID09PSB0aGlzLmxvY2FsQm91bmRzUHJvcGVydHkuX3ZhbHVlLCAnUmVmZXJlbmNlIGZvciBsb2NhbEJvdW5kcyBjaGFuZ2VkIScgKTtcbiAgICAgIGFzc2VydCggIXRoaXMuX29yaWdpbmFsU2VsZkJvdW5kcyB8fCB0aGlzLl9vcmlnaW5hbFNlbGZCb3VuZHMgPT09IHRoaXMuc2VsZkJvdW5kc1Byb3BlcnR5Ll92YWx1ZSwgJ1JlZmVyZW5jZSBmb3Igc2VsZkJvdW5kcyBjaGFuZ2VkIScgKTtcbiAgICAgIGFzc2VydCggIXRoaXMuX29yaWdpbmFsQ2hpbGRCb3VuZHMgfHwgdGhpcy5fb3JpZ2luYWxDaGlsZEJvdW5kcyA9PT0gdGhpcy5jaGlsZEJvdW5kc1Byb3BlcnR5Ll92YWx1ZSwgJ1JlZmVyZW5jZSBmb3IgY2hpbGRCb3VuZHMgY2hhbmdlZCEnICk7XG4gICAgfVxuXG4gICAgLy8gZG91YmxlLWNoZWNrIHRoYXQgYWxsIG9mIG91ciBib3VuZHMgaGFuZGxpbmcgaGFzIGJlZW4gYWNjdXJhdGVcbiAgICBpZiAoIGFzc2VydFNsb3cgKSB7XG4gICAgICAvLyBuZXcgc2NvcGUgZm9yIHNhZmV0eVxuICAgICAgKCAoKSA9PiB7XG4gICAgICAgIGNvbnN0IGVwc2lsb24gPSAwLjAwMDAwMTtcblxuICAgICAgICBjb25zdCBjaGlsZEJvdW5kcyA9IEJvdW5kczIuTk9USElORy5jb3B5KCk7XG4gICAgICAgIF8uZWFjaCggdGhpcy5fY2hpbGRyZW4sIGNoaWxkID0+IHtcbiAgICAgICAgICBpZiAoICF0aGlzLl9leGNsdWRlSW52aXNpYmxlQ2hpbGRyZW5Gcm9tQm91bmRzIHx8IGNoaWxkLmlzVmlzaWJsZSgpICkge1xuICAgICAgICAgICAgY2hpbGRCb3VuZHMuaW5jbHVkZUJvdW5kcyggY2hpbGQuYm91bmRzUHJvcGVydHkuX3ZhbHVlICk7XG4gICAgICAgICAgfVxuICAgICAgICB9ICk7XG5cbiAgICAgICAgbGV0IGxvY2FsQm91bmRzID0gdGhpcy5zZWxmQm91bmRzUHJvcGVydHkuX3ZhbHVlLnVuaW9uKCBjaGlsZEJvdW5kcyApO1xuXG4gICAgICAgIGNvbnN0IGNsaXBBcmVhID0gdGhpcy5jbGlwQXJlYTtcbiAgICAgICAgaWYgKCBjbGlwQXJlYSApIHtcbiAgICAgICAgICBsb2NhbEJvdW5kcyA9IGxvY2FsQm91bmRzLmludGVyc2VjdGlvbiggY2xpcEFyZWEuYm91bmRzICk7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBmdWxsQm91bmRzID0gdGhpcy5sb2NhbFRvUGFyZW50Qm91bmRzKCBsb2NhbEJvdW5kcyApO1xuXG4gICAgICAgIGFzc2VydFNsb3cgJiYgYXNzZXJ0U2xvdyggdGhpcy5jaGlsZEJvdW5kc1Byb3BlcnR5Ll92YWx1ZS5lcXVhbHNFcHNpbG9uKCBjaGlsZEJvdW5kcywgZXBzaWxvbiApLFxuICAgICAgICAgIGBDaGlsZCBib3VuZHMgbWlzbWF0Y2ggYWZ0ZXIgdmFsaWRhdGVCb3VuZHM6ICR7XG4gICAgICAgICAgICB0aGlzLmNoaWxkQm91bmRzUHJvcGVydHkuX3ZhbHVlLnRvU3RyaW5nKCl9LCBleHBlY3RlZDogJHtjaGlsZEJvdW5kcy50b1N0cmluZygpfWAgKTtcbiAgICAgICAgYXNzZXJ0U2xvdyAmJiBhc3NlcnRTbG93KCB0aGlzLl9sb2NhbEJvdW5kc092ZXJyaWRkZW4gfHxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl90cmFuc2Zvcm1Cb3VuZHMgfHxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmJvdW5kc1Byb3BlcnR5Ll92YWx1ZS5lcXVhbHNFcHNpbG9uKCBmdWxsQm91bmRzLCBlcHNpbG9uICksXG4gICAgICAgICAgYEJvdW5kcyBtaXNtYXRjaCBhZnRlciB2YWxpZGF0ZUJvdW5kczogJHt0aGlzLmJvdW5kc1Byb3BlcnR5Ll92YWx1ZS50b1N0cmluZygpXG4gICAgICAgICAgfSwgZXhwZWN0ZWQ6ICR7ZnVsbEJvdW5kcy50b1N0cmluZygpfS4gVGhpcyBjb3VsZCBoYXZlIGhhcHBlbmVkIGlmIGEgYm91bmRzIGluc3RhbmNlIG93bmVkIGJ5IGEgTm9kZWAgK1xuICAgICAgICAgICcgd2FzIGRpcmVjdGx5IG11dGF0ZWQgKGUuZy4gYm91bmRzLmVyb2RlKCkpJyApO1xuICAgICAgfSApKCk7XG4gICAgfVxuXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLmJvdW5kcyAmJiBzY2VuZXJ5TG9nLnBvcCgpO1xuXG4gICAgcmV0dXJuIHdhc0RpcnR5QmVmb3JlOyAvLyB3aGV0aGVyIGFueSBkaXJ0eSBmbGFncyB3ZXJlIHNldFxuICB9XG5cbiAgLyoqXG4gICAqIFJlY3Vyc2lvbiBmb3IgYWNjdXJhdGUgdHJhbnNmb3JtZWQgYm91bmRzIGhhbmRsaW5nLiBNdXRhdGVzIGJvdW5kcyB3aXRoIHRoZSBhZGRlZCBib3VuZHMuXG4gICAqIE11dGF0ZXMgdGhlIG1hdHJpeCAocGFyYW1ldGVyKSwgYnV0IG11dGF0ZXMgaXQgYmFjayB0byB0aGUgc3RhcnRpbmcgcG9pbnQgKHdpdGhpbiBmbG9hdGluZy1wb2ludCBlcnJvcikuXG4gICAqL1xuICBwcml2YXRlIF9pbmNsdWRlVHJhbnNmb3JtZWRTdWJ0cmVlQm91bmRzKCBtYXRyaXg6IE1hdHJpeDMsIGJvdW5kczogQm91bmRzMiApOiBCb3VuZHMyIHtcbiAgICBpZiAoICF0aGlzLnNlbGZCb3VuZHMuaXNFbXB0eSgpICkge1xuICAgICAgYm91bmRzLmluY2x1ZGVCb3VuZHMoIHRoaXMuZ2V0VHJhbnNmb3JtZWRTZWxmQm91bmRzKCBtYXRyaXggKSApO1xuICAgIH1cblxuICAgIGNvbnN0IG51bUNoaWxkcmVuID0gdGhpcy5fY2hpbGRyZW4ubGVuZ3RoO1xuICAgIGZvciAoIGxldCBpID0gMDsgaSA8IG51bUNoaWxkcmVuOyBpKysgKSB7XG4gICAgICBjb25zdCBjaGlsZCA9IHRoaXMuX2NoaWxkcmVuWyBpIF07XG5cbiAgICAgIG1hdHJpeC5tdWx0aXBseU1hdHJpeCggY2hpbGQuX3RyYW5zZm9ybS5nZXRNYXRyaXgoKSApO1xuICAgICAgY2hpbGQuX2luY2x1ZGVUcmFuc2Zvcm1lZFN1YnRyZWVCb3VuZHMoIG1hdHJpeCwgYm91bmRzICk7XG4gICAgICBtYXRyaXgubXVsdGlwbHlNYXRyaXgoIGNoaWxkLl90cmFuc2Zvcm0uZ2V0SW52ZXJzZSgpICk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGJvdW5kcztcbiAgfVxuXG4gIC8qKlxuICAgKiBUcmF2ZXJzZXMgdGhpcyBzdWJ0cmVlIGFuZCB2YWxpZGF0ZXMgYm91bmRzIG9ubHkgZm9yIHN1YnRyZWVzIHRoYXQgaGF2ZSBib3VuZHMgbGlzdGVuZXJzICh0cnlpbmcgdG8gZXhjbHVkZSBhc1xuICAgKiBtdWNoIGFzIHBvc3NpYmxlIGZvciBwZXJmb3JtYW5jZSkuIFRoaXMgaXMgZG9uZSBzbyB0aGF0IHdlIGNhbiBkbyB0aGUgbWluaW11bSBib3VuZHMgdmFsaWRhdGlvbiB0byBwcmV2ZW50IGFueVxuICAgKiBib3VuZHMgbGlzdGVuZXJzIGZyb20gYmVpbmcgdHJpZ2dlcmVkIGluIGZ1cnRoZXIgdmFsaWRhdGVCb3VuZHMoKSBjYWxscyB3aXRob3V0IG90aGVyIE5vZGUgY2hhbmdlcyBiZWluZyBkb25lLlxuICAgKiBUaGlzIGlzIHJlcXVpcmVkIGZvciBEaXNwbGF5J3MgYXRvbWljIChub24tcmVlbnRyYW50KSB1cGRhdGVEaXNwbGF5KCksIHNvIHRoYXQgd2UgZG9uJ3QgYWNjaWRlbnRhbGx5IHRyaWdnZXJcbiAgICogYm91bmRzIGxpc3RlbmVycyB3aGlsZSBjb21wdXRpbmcgYm91bmRzIGR1cmluZyB1cGRhdGVEaXNwbGF5KCkuIChzY2VuZXJ5LWludGVybmFsKVxuICAgKlxuICAgKiBOT1RFOiB0aGlzIHNob3VsZCBwYXNzIGJ5IChpZ25vcmUpIGFueSBvdmVycmlkZGVuIGxvY2FsQm91bmRzLCB0byB0cmlnZ2VyIGxpc3RlbmVycyBiZWxvdy5cbiAgICovXG4gIHB1YmxpYyB2YWxpZGF0ZVdhdGNoZWRCb3VuZHMoKTogdm9pZCB7XG4gICAgLy8gU2luY2UgYSBib3VuZHMgbGlzdGVuZXIgb24gb25lIG9mIHRoZSByb290cyBjb3VsZCBpbnZhbGlkYXRlIGJvdW5kcyBvbiB0aGUgb3RoZXIsIHdlIG5lZWQgdG8ga2VlcCBydW5uaW5nIHRoaXNcbiAgICAvLyB1bnRpbCB0aGV5IGFyZSBhbGwgY2xlYW4uIE90aGVyd2lzZSwgc2lkZS1lZmZlY3RzIGNvdWxkIG9jY3VyIGZyb20gYm91bmRzIHZhbGlkYXRpb25zXG4gICAgLy8gVE9ETzogY29uc2lkZXIgYSB3YXkgdG8gcHJldmVudCBpbmZpbml0ZSBsb29wcyBoZXJlIHRoYXQgb2NjdXIgZHVlIHRvIGJvdW5kcyBsaXN0ZW5lcnMgdHJpZ2dlcmluZyBjeWNsZXMgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3NjZW5lcnkvaXNzdWVzLzE1ODFcbiAgICB3aGlsZSAoIHRoaXMud2F0Y2hlZEJvdW5kc1NjYW4oKSApIHtcbiAgICAgIC8vIGRvIG5vdGhpbmdcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogUmVjdXJzaXZlIGZ1bmN0aW9uIGZvciB2YWxpZGF0ZVdhdGNoZWRCb3VuZHMuIFJldHVybmVkIHdoZXRoZXIgYW55IHZhbGlkYXRlQm91bmRzKCkgcmV0dXJuZWQgdHJ1ZSAobWVhbnMgd2UgaGF2ZVxuICAgKiB0byB0cmF2ZXJzZSBhZ2FpbikgLSBzY2VuZXJ5LWludGVybmFsXG4gICAqXG4gICAqIEByZXR1cm5zIC0gV2hldGhlciB0aGVyZSBjb3VsZCBoYXZlIGJlZW4gYW55IGNoYW5nZXMuXG4gICAqL1xuICBwdWJsaWMgd2F0Y2hlZEJvdW5kc1NjYW4oKTogYm9vbGVhbiB7XG4gICAgaWYgKCB0aGlzLl9ib3VuZHNFdmVudFNlbGZDb3VudCAhPT0gMCApIHtcbiAgICAgIC8vIHdlIGFyZSBhIHJvb3QgdGhhdCBzaG91bGQgYmUgdmFsaWRhdGVkLiByZXR1cm4gd2hldGhlciB3ZSB1cGRhdGVkIGFueXRoaW5nXG4gICAgICByZXR1cm4gdGhpcy52YWxpZGF0ZUJvdW5kcygpO1xuICAgIH1cbiAgICBlbHNlIGlmICggdGhpcy5fYm91bmRzRXZlbnRDb3VudCA+IDAgJiYgdGhpcy5fY2hpbGRCb3VuZHNEaXJ0eSApIHtcbiAgICAgIC8vIGRlc2NlbmRhbnRzIGhhdmUgd2F0Y2hlZCBib3VuZHMsIHRyYXZlcnNlIVxuICAgICAgbGV0IGNoYW5nZWQgPSBmYWxzZTtcbiAgICAgIGNvbnN0IG51bUNoaWxkcmVuID0gdGhpcy5fY2hpbGRyZW4ubGVuZ3RoO1xuICAgICAgZm9yICggbGV0IGkgPSAwOyBpIDwgbnVtQ2hpbGRyZW47IGkrKyApIHtcbiAgICAgICAgY2hhbmdlZCA9IHRoaXMuX2NoaWxkcmVuWyBpIF0ud2F0Y2hlZEJvdW5kc1NjYW4oKSB8fCBjaGFuZ2VkO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGNoYW5nZWQ7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgLy8gaWYgX2JvdW5kc0V2ZW50Q291bnQgaXMgemVybywgbm8gYm91bmRzIGFyZSB3YXRjaGVkIGJlbG93IHVzIChkb24ndCB0cmF2ZXJzZSksIGFuZCBpdCB3YXNuJ3QgY2hhbmdlZFxuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBNYXJrcyB0aGUgYm91bmRzIG9mIHRoaXMgTm9kZSBhcyBpbnZhbGlkLCBzbyB0aGV5IGFyZSByZWNvbXB1dGVkIGJlZm9yZSBiZWluZyBhY2Nlc3NlZCBhZ2Fpbi5cbiAgICovXG4gIHB1YmxpYyBpbnZhbGlkYXRlQm91bmRzKCk6IHZvaWQge1xuICAgIC8vIFRPRE86IHNvbWV0aW1lcyB3ZSB3b24ndCBuZWVkIHRvIGludmFsaWRhdGUgbG9jYWwgYm91bmRzISBpdCdzIG5vdCB0b28gbXVjaCBvZiBhIGhhc3NsZSB0aG91Z2g/IGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9zY2VuZXJ5L2lzc3Vlcy8xNTgxXG4gICAgdGhpcy5fYm91bmRzRGlydHkgPSB0cnVlO1xuICAgIHRoaXMuX2xvY2FsQm91bmRzRGlydHkgPSB0cnVlO1xuXG4gICAgLy8gYW5kIHNldCBmbGFncyBmb3IgYWxsIGFuY2VzdG9yc1xuICAgIGxldCBpID0gdGhpcy5fcGFyZW50cy5sZW5ndGg7XG4gICAgd2hpbGUgKCBpLS0gKSB7XG4gICAgICB0aGlzLl9wYXJlbnRzWyBpIF0uaW52YWxpZGF0ZUNoaWxkQm91bmRzKCk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFJlY3Vyc2l2ZWx5IHRhZyBhbGwgYW5jZXN0b3JzIHdpdGggX2NoaWxkQm91bmRzRGlydHkgKHNjZW5lcnktaW50ZXJuYWwpXG4gICAqL1xuICBwdWJsaWMgaW52YWxpZGF0ZUNoaWxkQm91bmRzKCk6IHZvaWQge1xuICAgIC8vIGRvbid0IGJvdGhlciB1cGRhdGluZyBpZiB3ZSd2ZSBhbHJlYWR5IGJlZW4gdGFnZ2VkXG4gICAgaWYgKCAhdGhpcy5fY2hpbGRCb3VuZHNEaXJ0eSApIHtcbiAgICAgIHRoaXMuX2NoaWxkQm91bmRzRGlydHkgPSB0cnVlO1xuICAgICAgdGhpcy5fbG9jYWxCb3VuZHNEaXJ0eSA9IHRydWU7XG4gICAgICBsZXQgaSA9IHRoaXMuX3BhcmVudHMubGVuZ3RoO1xuICAgICAgd2hpbGUgKCBpLS0gKSB7XG4gICAgICAgIHRoaXMuX3BhcmVudHNbIGkgXS5pbnZhbGlkYXRlQ2hpbGRCb3VuZHMoKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogU2hvdWxkIGJlIGNhbGxlZCB0byBub3RpZnkgdGhhdCBvdXIgc2VsZkJvdW5kcyBuZWVkcyB0byBjaGFuZ2UgdG8gdGhpcyBuZXcgdmFsdWUuXG4gICAqL1xuICBwdWJsaWMgaW52YWxpZGF0ZVNlbGYoIG5ld1NlbGZCb3VuZHM/OiBCb3VuZHMyICk6IHZvaWQge1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIG5ld1NlbGZCb3VuZHMgPT09IHVuZGVmaW5lZCB8fCBuZXdTZWxmQm91bmRzIGluc3RhbmNlb2YgQm91bmRzMixcbiAgICAgICdpbnZhbGlkYXRlU2VsZlxcJ3MgbmV3U2VsZkJvdW5kcywgaWYgcHJvdmlkZWQsIG5lZWRzIHRvIGJlIEJvdW5kczInICk7XG5cbiAgICBjb25zdCBvdXJTZWxmQm91bmRzID0gdGhpcy5zZWxmQm91bmRzUHJvcGVydHkuX3ZhbHVlO1xuXG4gICAgLy8gSWYgbm8gc2VsZiBib3VuZHMgYXJlIHByb3ZpZGVkLCByZWx5IG9uIHRoZSBib3VuZHMgdmFsaWRhdGlvbiB0byB0cmlnZ2VyIGNvbXB1dGF0aW9uICh1c2luZyB1cGRhdGVTZWxmQm91bmRzKCkpLlxuICAgIGlmICggIW5ld1NlbGZCb3VuZHMgKSB7XG4gICAgICB0aGlzLl9zZWxmQm91bmRzRGlydHkgPSB0cnVlO1xuICAgICAgdGhpcy5pbnZhbGlkYXRlQm91bmRzKCk7XG4gICAgICB0aGlzLl9waWNrZXIub25TZWxmQm91bmRzRGlydHkoKTtcbiAgICB9XG4gICAgLy8gT3RoZXJ3aXNlLCBzZXQgdGhlIHNlbGYgYm91bmRzIGRpcmVjdGx5XG4gICAgZWxzZSB7XG4gICAgICBhc3NlcnQgJiYgYXNzZXJ0KCBuZXdTZWxmQm91bmRzLmlzRW1wdHkoKSB8fCBuZXdTZWxmQm91bmRzLmlzRmluaXRlKCksICdCb3VuZHMgbXVzdCBiZSBlbXB0eSBvciBmaW5pdGUgaW4gaW52YWxpZGF0ZVNlbGYnICk7XG5cbiAgICAgIC8vIERvbid0IHJlY29tcHV0ZSB0aGUgc2VsZiBib3VuZHNcbiAgICAgIHRoaXMuX3NlbGZCb3VuZHNEaXJ0eSA9IGZhbHNlO1xuXG4gICAgICAvLyBpZiB0aGVzZSBib3VuZHMgYXJlIGRpZmZlcmVudCB0aGFuIGN1cnJlbnQgc2VsZiBib3VuZHNcbiAgICAgIGlmICggIW91clNlbGZCb3VuZHMuZXF1YWxzKCBuZXdTZWxmQm91bmRzICkgKSB7XG4gICAgICAgIGNvbnN0IG9sZFNlbGZCb3VuZHMgPSBzY3JhdGNoQm91bmRzMi5zZXQoIG91clNlbGZCb3VuZHMgKTtcblxuICAgICAgICAvLyBzZXQgcmVwYWludCBmbGFnc1xuICAgICAgICB0aGlzLmludmFsaWRhdGVCb3VuZHMoKTtcbiAgICAgICAgdGhpcy5fcGlja2VyLm9uU2VsZkJvdW5kc0RpcnR5KCk7XG5cbiAgICAgICAgLy8gcmVjb3JkIHRoZSBuZXcgYm91bmRzXG4gICAgICAgIG91clNlbGZCb3VuZHMuc2V0KCBuZXdTZWxmQm91bmRzICk7XG5cbiAgICAgICAgLy8gZmlyZSB0aGUgZXZlbnQgaW1tZWRpYXRlbHlcbiAgICAgICAgdGhpcy5zZWxmQm91bmRzUHJvcGVydHkubm90aWZ5TGlzdGVuZXJzKCBvbGRTZWxmQm91bmRzICk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKCBhc3NlcnRTbG93ICkgeyB0aGlzLl9waWNrZXIuYXVkaXQoKTsgfVxuICB9XG5cbiAgLyoqXG4gICAqIE1lYW50IHRvIGJlIG92ZXJyaWRkZW4gYnkgTm9kZSBzdWItdHlwZXMgdG8gY29tcHV0ZSBzZWxmIGJvdW5kcyAoaWYgaW52YWxpZGF0ZVNlbGYoKSB3aXRoIG5vIGFyZ3VtZW50cyB3YXMgY2FsbGVkKS5cbiAgICpcbiAgICogQHJldHVybnMgLSBXaGV0aGVyIHRoZSBzZWxmIGJvdW5kcyBjaGFuZ2VkLlxuICAgKi9cbiAgcHJvdGVjdGVkIHVwZGF0ZVNlbGZCb3VuZHMoKTogYm9vbGVhbiB7XG4gICAgLy8gVGhlIE5vZGUgaW1wbGVtZW50YXRpb24gKHVuLW92ZXJyaWRkZW4pIHdpbGwgbmV2ZXIgY2hhbmdlIHRoZSBzZWxmIGJvdW5kcyAoYWx3YXlzIE5PVEhJTkcpLlxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHRoaXMuc2VsZkJvdW5kc1Byb3BlcnR5Ll92YWx1ZS5lcXVhbHMoIEJvdW5kczIuTk9USElORyApICk7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgd2hldGhlciBhIE5vZGUgaXMgYSBjaGlsZCBvZiB0aGlzIG5vZGUuXG4gICAqXG4gICAqIEByZXR1cm5zIC0gV2hldGhlciBwb3RlbnRpYWxDaGlsZCBpcyBhY3R1YWxseSBvdXIgY2hpbGQuXG4gICAqL1xuICBwdWJsaWMgaGFzQ2hpbGQoIHBvdGVudGlhbENoaWxkOiBOb2RlICk6IGJvb2xlYW4ge1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIHBvdGVudGlhbENoaWxkICYmICggcG90ZW50aWFsQ2hpbGQgaW5zdGFuY2VvZiBOb2RlICksICdoYXNDaGlsZCBuZWVkcyB0byBiZSBjYWxsZWQgd2l0aCBhIE5vZGUnICk7XG4gICAgY29uc3QgaXNPdXJDaGlsZCA9IF8uaW5jbHVkZXMoIHRoaXMuX2NoaWxkcmVuLCBwb3RlbnRpYWxDaGlsZCApO1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIGlzT3VyQ2hpbGQgPT09IF8uaW5jbHVkZXMoIHBvdGVudGlhbENoaWxkLl9wYXJlbnRzLCB0aGlzICksICdjaGlsZC1wYXJlbnQgcmVmZXJlbmNlIHNob3VsZCBtYXRjaCBwYXJlbnQtY2hpbGQgcmVmZXJlbmNlJyApO1xuICAgIHJldHVybiBpc091ckNoaWxkO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgYSBTaGFwZSB0aGF0IHJlcHJlc2VudHMgdGhlIGFyZWEgY292ZXJlZCBieSBjb250YWluc1BvaW50U2VsZi5cbiAgICovXG4gIHB1YmxpYyBnZXRTZWxmU2hhcGUoKTogU2hhcGUge1xuICAgIGNvbnN0IHNlbGZCb3VuZHMgPSB0aGlzLnNlbGZCb3VuZHM7XG4gICAgaWYgKCBzZWxmQm91bmRzLmlzRW1wdHkoKSApIHtcbiAgICAgIHJldHVybiBuZXcgU2hhcGUoKTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICByZXR1cm4gU2hhcGUuYm91bmRzKCB0aGlzLnNlbGZCb3VuZHMgKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyBvdXIgc2VsZkJvdW5kcyAodGhlIGJvdW5kcyBmb3IgdGhpcyBOb2RlJ3MgY29udGVudCBpbiB0aGUgbG9jYWwgY29vcmRpbmF0ZXMsIGV4Y2x1ZGluZyBhbnl0aGluZyBmcm9tIG91clxuICAgKiBjaGlsZHJlbiBhbmQgZGVzY2VuZGFudHMpLlxuICAgKlxuICAgKiBOT1RFOiBEbyBOT1QgbXV0YXRlIHRoZSByZXR1cm5lZCB2YWx1ZSFcbiAgICovXG4gIHB1YmxpYyBnZXRTZWxmQm91bmRzKCk6IEJvdW5kczIge1xuICAgIHJldHVybiB0aGlzLnNlbGZCb3VuZHNQcm9wZXJ0eS52YWx1ZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZWUgZ2V0U2VsZkJvdW5kcygpIGZvciBtb3JlIGluZm9ybWF0aW9uXG4gICAqL1xuICBwdWJsaWMgZ2V0IHNlbGZCb3VuZHMoKTogQm91bmRzMiB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0U2VsZkJvdW5kcygpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgYSBib3VuZGluZyBib3ggdGhhdCBzaG91bGQgY29udGFpbiBhbGwgc2VsZiBjb250ZW50IGluIHRoZSBsb2NhbCBjb29yZGluYXRlIGZyYW1lIChvdXIgbm9ybWFsIHNlbGYgYm91bmRzXG4gICAqIGFyZW4ndCBndWFyYW50ZWVkIHRoaXMgZm9yIFRleHQsIGV0Yy4pXG4gICAqXG4gICAqIE92ZXJyaWRlIHRoaXMgdG8gcHJvdmlkZSBkaWZmZXJlbnQgYmVoYXZpb3IuXG4gICAqL1xuICBwdWJsaWMgZ2V0U2FmZVNlbGZCb3VuZHMoKTogQm91bmRzMiB7XG4gICAgcmV0dXJuIHRoaXMuc2VsZkJvdW5kc1Byb3BlcnR5LnZhbHVlO1xuICB9XG5cbiAgLyoqXG4gICAqIFNlZSBnZXRTYWZlU2VsZkJvdW5kcygpIGZvciBtb3JlIGluZm9ybWF0aW9uXG4gICAqL1xuICBwdWJsaWMgZ2V0IHNhZmVTZWxmQm91bmRzKCk6IEJvdW5kczIge1xuICAgIHJldHVybiB0aGlzLmdldFNhZmVTZWxmQm91bmRzKCk7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgYm91bmRpbmcgYm94IHRoYXQgc2hvdWxkIGNvbnRhaW4gYWxsIGNvbnRlbnQgb2Ygb3VyIGNoaWxkcmVuIGluIG91ciBsb2NhbCBjb29yZGluYXRlIGZyYW1lLiBEb2VzIG5vdFxuICAgKiBpbmNsdWRlIG91ciBcInNlbGZcIiBib3VuZHMuXG4gICAqXG4gICAqIE5PVEU6IERvIE5PVCBtdXRhdGUgdGhlIHJldHVybmVkIHZhbHVlIVxuICAgKi9cbiAgcHVibGljIGdldENoaWxkQm91bmRzKCk6IEJvdW5kczIge1xuICAgIHJldHVybiB0aGlzLmNoaWxkQm91bmRzUHJvcGVydHkudmFsdWU7XG4gIH1cblxuICAvKipcbiAgICogU2VlIGdldENoaWxkQm91bmRzKCkgZm9yIG1vcmUgaW5mb3JtYXRpb25cbiAgICovXG4gIHB1YmxpYyBnZXQgY2hpbGRCb3VuZHMoKTogQm91bmRzMiB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0Q2hpbGRCb3VuZHMoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBib3VuZGluZyBib3ggdGhhdCBzaG91bGQgY29udGFpbiBhbGwgY29udGVudCBvZiBvdXIgY2hpbGRyZW4gQU5EIG91ciBzZWxmIGluIG91ciBsb2NhbCBjb29yZGluYXRlXG4gICAqIGZyYW1lLlxuICAgKlxuICAgKiBOT1RFOiBEbyBOT1QgbXV0YXRlIHRoZSByZXR1cm5lZCB2YWx1ZSFcbiAgICovXG4gIHB1YmxpYyBnZXRMb2NhbEJvdW5kcygpOiBCb3VuZHMyIHtcbiAgICByZXR1cm4gdGhpcy5sb2NhbEJvdW5kc1Byb3BlcnR5LnZhbHVlO1xuICB9XG5cbiAgLyoqXG4gICAqIFNlZSBnZXRMb2NhbEJvdW5kcygpIGZvciBtb3JlIGluZm9ybWF0aW9uXG4gICAqL1xuICBwdWJsaWMgZ2V0IGxvY2FsQm91bmRzKCk6IEJvdW5kczIge1xuICAgIHJldHVybiB0aGlzLmdldExvY2FsQm91bmRzKCk7XG4gIH1cblxuICAvKipcbiAgICogU2VlIHNldExvY2FsQm91bmRzKCkgZm9yIG1vcmUgaW5mb3JtYXRpb25cbiAgICovXG4gIHB1YmxpYyBzZXQgbG9jYWxCb3VuZHMoIHZhbHVlOiBCb3VuZHMyIHwgbnVsbCApIHtcbiAgICB0aGlzLnNldExvY2FsQm91bmRzKCB2YWx1ZSApO1xuICB9XG5cbiAgcHVibGljIGdldCBsb2NhbEJvdW5kc092ZXJyaWRkZW4oKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuX2xvY2FsQm91bmRzT3ZlcnJpZGRlbjtcbiAgfVxuXG4gIC8qKlxuICAgKiBBbGxvd3Mgb3ZlcnJpZGluZyB0aGUgdmFsdWUgb2YgbG9jYWxCb3VuZHMgKGFuZCB0aHVzIGNoYW5naW5nIHRoaW5ncyBsaWtlICdib3VuZHMnIHRoYXQgZGVwZW5kIG9uIGxvY2FsQm91bmRzKS5cbiAgICogSWYgaXQncyBzZXQgdG8gYSBub24tbnVsbCB2YWx1ZSwgdGhhdCB2YWx1ZSB3aWxsIGFsd2F5cyBiZSB1c2VkIGZvciBsb2NhbEJvdW5kcyB1bnRpbCB0aGlzIGZ1bmN0aW9uIGlzIGNhbGxlZFxuICAgKiBhZ2Fpbi4gVG8gcmV2ZXJ0IHRvIGhhdmluZyBTY2VuZXJ5IGNvbXB1dGUgdGhlIGxvY2FsQm91bmRzLCBzZXQgdGhpcyB0byBudWxsLiAgVGhlIGJvdW5kcyBzaG91bGQgbm90IGJlIHJlZHVjZWRcbiAgICogc21hbGxlciB0aGFuIHRoZSB2aXNpYmxlIGJvdW5kcyBvbiB0aGUgc2NyZWVuLlxuICAgKi9cbiAgcHVibGljIHNldExvY2FsQm91bmRzKCBsb2NhbEJvdW5kczogQm91bmRzMiB8IG51bGwgKTogdGhpcyB7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggbG9jYWxCb3VuZHMgPT09IG51bGwgfHwgbG9jYWxCb3VuZHMgaW5zdGFuY2VvZiBCb3VuZHMyLCAnbG9jYWxCb3VuZHMgb3ZlcnJpZGUgc2hvdWxkIGJlIHNldCB0byBlaXRoZXIgbnVsbCBvciBhIEJvdW5kczInICk7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggbG9jYWxCb3VuZHMgPT09IG51bGwgfHwgIWlzTmFOKCBsb2NhbEJvdW5kcy5taW5YICksICdtaW5YIGZvciBsb2NhbEJvdW5kcyBzaG91bGQgbm90IGJlIE5hTicgKTtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBsb2NhbEJvdW5kcyA9PT0gbnVsbCB8fCAhaXNOYU4oIGxvY2FsQm91bmRzLm1pblkgKSwgJ21pblkgZm9yIGxvY2FsQm91bmRzIHNob3VsZCBub3QgYmUgTmFOJyApO1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIGxvY2FsQm91bmRzID09PSBudWxsIHx8ICFpc05hTiggbG9jYWxCb3VuZHMubWF4WCApLCAnbWF4WCBmb3IgbG9jYWxCb3VuZHMgc2hvdWxkIG5vdCBiZSBOYU4nICk7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggbG9jYWxCb3VuZHMgPT09IG51bGwgfHwgIWlzTmFOKCBsb2NhbEJvdW5kcy5tYXhZICksICdtYXhZIGZvciBsb2NhbEJvdW5kcyBzaG91bGQgbm90IGJlIE5hTicgKTtcblxuICAgIGNvbnN0IG91ckxvY2FsQm91bmRzID0gdGhpcy5sb2NhbEJvdW5kc1Byb3BlcnR5Ll92YWx1ZTtcbiAgICBjb25zdCBvbGRMb2NhbEJvdW5kcyA9IG91ckxvY2FsQm91bmRzLmNvcHkoKTtcblxuICAgIGlmICggbG9jYWxCb3VuZHMgPT09IG51bGwgKSB7XG4gICAgICAvLyB3ZSBjYW4ganVzdCBpZ25vcmUgdGhpcyBpZiB3ZSB3ZXJlbid0IGFjdHVhbGx5IG92ZXJyaWRpbmcgbG9jYWwgYm91bmRzIGJlZm9yZVxuICAgICAgaWYgKCB0aGlzLl9sb2NhbEJvdW5kc092ZXJyaWRkZW4gKSB7XG5cbiAgICAgICAgdGhpcy5fbG9jYWxCb3VuZHNPdmVycmlkZGVuID0gZmFsc2U7XG4gICAgICAgIHRoaXMubG9jYWxCb3VuZHNQcm9wZXJ0eS5ub3RpZnlMaXN0ZW5lcnMoIG9sZExvY2FsQm91bmRzICk7XG4gICAgICAgIHRoaXMuaW52YWxpZGF0ZUJvdW5kcygpO1xuICAgICAgfVxuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIC8vIGp1c3QgYW4gaW5zdGFuY2UgY2hlY2sgZm9yIG5vdy4gY29uc2lkZXIgZXF1YWxzKCkgaW4gdGhlIGZ1dHVyZSBkZXBlbmRpbmcgb24gY29zdFxuICAgICAgY29uc3QgY2hhbmdlZCA9ICFsb2NhbEJvdW5kcy5lcXVhbHMoIG91ckxvY2FsQm91bmRzICkgfHwgIXRoaXMuX2xvY2FsQm91bmRzT3ZlcnJpZGRlbjtcblxuICAgICAgaWYgKCBjaGFuZ2VkICkge1xuICAgICAgICBvdXJMb2NhbEJvdW5kcy5zZXQoIGxvY2FsQm91bmRzICk7XG4gICAgICB9XG5cbiAgICAgIGlmICggIXRoaXMuX2xvY2FsQm91bmRzT3ZlcnJpZGRlbiApIHtcbiAgICAgICAgdGhpcy5fbG9jYWxCb3VuZHNPdmVycmlkZGVuID0gdHJ1ZTsgLy8gTk9URTogaGFzIHRvIGJlIGRvbmUgYmVmb3JlIGludmFsaWRhdGluZyBib3VuZHMsIHNpbmNlIHRoaXMgZGlzYWJsZXMgbG9jYWxCb3VuZHMgY29tcHV0YXRpb25cbiAgICAgIH1cblxuICAgICAgaWYgKCBjaGFuZ2VkICkge1xuICAgICAgICB0aGlzLmxvY2FsQm91bmRzUHJvcGVydHkubm90aWZ5TGlzdGVuZXJzKCBvbGRMb2NhbEJvdW5kcyApO1xuICAgICAgICB0aGlzLmludmFsaWRhdGVCb3VuZHMoKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gdGhpczsgLy8gYWxsb3cgY2hhaW5pbmdcbiAgfVxuXG4gIC8qKlxuICAgKiBNZWFudCB0byBiZSBvdmVycmlkZGVuIGluIHN1Yi10eXBlcyB0aGF0IGhhdmUgbW9yZSBhY2N1cmF0ZSBib3VuZHMgZGV0ZXJtaW5hdGlvbiBmb3Igd2hlbiB3ZSBhcmUgdHJhbnNmb3JtZWQuXG4gICAqIFVzdWFsbHkgcm90YXRpb24gaXMgc2lnbmlmaWNhbnQgaGVyZSwgc28gdGhhdCB0cmFuc2Zvcm1lZCBib3VuZHMgZm9yIG5vbi1yZWN0YW5ndWxhciBzaGFwZXMgd2lsbCBiZSBkaWZmZXJlbnQuXG4gICAqL1xuICBwdWJsaWMgZ2V0VHJhbnNmb3JtZWRTZWxmQm91bmRzKCBtYXRyaXg6IE1hdHJpeDMgKTogQm91bmRzMiB7XG4gICAgLy8gYXNzdW1lIHRoYXQgd2UgdGFrZSB1cCB0aGUgZW50aXJlIHJlY3Rhbmd1bGFyIGJvdW5kcyBieSBkZWZhdWx0XG4gICAgcmV0dXJuIHRoaXMuc2VsZkJvdW5kcy50cmFuc2Zvcm1lZCggbWF0cml4ICk7XG4gIH1cblxuICAvKipcbiAgICogTWVhbnQgdG8gYmUgb3ZlcnJpZGRlbiBpbiBzdWItdHlwZXMgdGhhdCBoYXZlIG1vcmUgYWNjdXJhdGUgYm91bmRzIGRldGVybWluYXRpb24gZm9yIHdoZW4gd2UgYXJlIHRyYW5zZm9ybWVkLlxuICAgKiBVc3VhbGx5IHJvdGF0aW9uIGlzIHNpZ25pZmljYW50IGhlcmUsIHNvIHRoYXQgdHJhbnNmb3JtZWQgYm91bmRzIGZvciBub24tcmVjdGFuZ3VsYXIgc2hhcGVzIHdpbGwgYmUgZGlmZmVyZW50LlxuICAgKlxuICAgKiBUaGlzIHNob3VsZCBpbmNsdWRlIHRoZSBcImZ1bGxcIiBib3VuZHMgdGhhdCBndWFyYW50ZWUgZXZlcnl0aGluZyByZW5kZXJlZCBzaG91bGQgYmUgaW5zaWRlIChlLmcuIFRleHQsIHdoZXJlIHRoZVxuICAgKiBub3JtYWwgYm91bmRzIG1heSBub3QgYmUgc3VmZmljaWVudCkuXG4gICAqL1xuICBwdWJsaWMgZ2V0VHJhbnNmb3JtZWRTYWZlU2VsZkJvdW5kcyggbWF0cml4OiBNYXRyaXgzICk6IEJvdW5kczIge1xuICAgIHJldHVybiB0aGlzLnNhZmVTZWxmQm91bmRzLnRyYW5zZm9ybWVkKCBtYXRyaXggKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSB2aXN1YWwgXCJzYWZlXCIgYm91bmRzIHRoYXQgYXJlIHRha2VuIHVwIGJ5IHRoaXMgTm9kZSBhbmQgaXRzIHN1YnRyZWUuIE5vdGFibHksIHRoaXMgaXMgZXNzZW50aWFsbHkgdGhlXG4gICAqIGNvbWJpbmVkIGVmZmVjdHMgb2YgdGhlIFwidmlzaWJsZVwiIGJvdW5kcyAoaS5lLiBpbnZpc2libGUgbm9kZXMgZG8gbm90IGNvbnRyaWJ1dGUgdG8gYm91bmRzKSwgYW5kIFwic2FmZVwiIGJvdW5kc1xuICAgKiAoZS5nLiBUZXh0LCB3aGVyZSB3ZSBuZWVkIGEgbGFyZ2VyIGJvdW5kcyBhcmVhIHRvIGd1YXJhbnRlZSB0aGVyZSBpcyBub3RoaW5nIG91dHNpZGUpLiBJdCBhbHNvIHRyaWVzIHRvIFwiZml0XCJcbiAgICogdHJhbnNmb3JtZWQgYm91bmRzIG1vcmUgdGlnaHRseSwgd2hlcmUgaXQgd2lsbCBoYW5kbGUgcm90YXRlZCBQYXRoIGJvdW5kcyBpbiBhbiBpbXByb3ZlZCB3YXkuXG4gICAqXG4gICAqIE5PVEU6IFRoaXMgbWV0aG9kIGlzIG5vdCBvcHRpbWl6ZWQsIGFuZCBtYXkgY3JlYXRlIGdhcmJhZ2UgYW5kIG5vdCBiZSB0aGUgZmFzdGVzdC5cbiAgICpcbiAgICogQHBhcmFtIFttYXRyaXhdIC0gSWYgcHJvdmlkZWQsIHdpbGwgcmV0dXJuIHRoZSBib3VuZHMgYXNzdW1pbmcgdGhlIGNvbnRlbnQgaXMgdHJhbnNmb3JtZWQgd2l0aCB0aGVcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgIGdpdmVuIG1hdHJpeC5cbiAgICovXG4gIHB1YmxpYyBnZXRTYWZlVHJhbnNmb3JtZWRWaXNpYmxlQm91bmRzKCBtYXRyaXg/OiBNYXRyaXgzICk6IEJvdW5kczIge1xuICAgIGNvbnN0IGxvY2FsTWF0cml4ID0gKCBtYXRyaXggfHwgTWF0cml4My5JREVOVElUWSApLnRpbWVzTWF0cml4KCB0aGlzLm1hdHJpeCApO1xuXG4gICAgY29uc3QgYm91bmRzID0gQm91bmRzMi5OT1RISU5HLmNvcHkoKTtcblxuICAgIGlmICggdGhpcy52aXNpYmxlUHJvcGVydHkudmFsdWUgKSB7XG4gICAgICBpZiAoICF0aGlzLnNlbGZCb3VuZHMuaXNFbXB0eSgpICkge1xuICAgICAgICBib3VuZHMuaW5jbHVkZUJvdW5kcyggdGhpcy5nZXRUcmFuc2Zvcm1lZFNhZmVTZWxmQm91bmRzKCBsb2NhbE1hdHJpeCApICk7XG4gICAgICB9XG5cbiAgICAgIGlmICggdGhpcy5fY2hpbGRyZW4ubGVuZ3RoICkge1xuICAgICAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCB0aGlzLl9jaGlsZHJlbi5sZW5ndGg7IGkrKyApIHtcbiAgICAgICAgICBib3VuZHMuaW5jbHVkZUJvdW5kcyggdGhpcy5fY2hpbGRyZW5bIGkgXS5nZXRTYWZlVHJhbnNmb3JtZWRWaXNpYmxlQm91bmRzKCBsb2NhbE1hdHJpeCApICk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gYm91bmRzO1xuICB9XG5cbiAgLyoqXG4gICAqIFNlZSBnZXRTYWZlVHJhbnNmb3JtZWRWaXNpYmxlQm91bmRzKCkgZm9yIG1vcmUgaW5mb3JtYXRpb24gLS0gVGhpcyBpcyBjYWxsZWQgd2l0aG91dCBhbnkgaW5pdGlhbCBwYXJhbWV0ZXJcbiAgICovXG4gIHB1YmxpYyBnZXQgc2FmZVRyYW5zZm9ybWVkVmlzaWJsZUJvdW5kcygpOiBCb3VuZHMyIHtcbiAgICByZXR1cm4gdGhpcy5nZXRTYWZlVHJhbnNmb3JtZWRWaXNpYmxlQm91bmRzKCk7XG4gIH1cblxuICAvKipcbiAgICogU2V0cyB0aGUgZmxhZyB0aGF0IGRldGVybWluZXMgd2hldGhlciB3ZSB3aWxsIHJlcXVpcmUgbW9yZSBhY2N1cmF0ZSAoYW5kIGV4cGVuc2l2ZSkgYm91bmRzIGNvbXB1dGF0aW9uIGZvciB0aGlzXG4gICAqIG5vZGUncyB0cmFuc2Zvcm0uXG4gICAqXG4gICAqIElmIHNldCB0byBmYWxzZSAoZGVmYXVsdCksIFNjZW5lcnkgd2lsbCBnZXQgdGhlIGJvdW5kcyBvZiBjb250ZW50LCBhbmQgdGhlbiBpZiByb3RhdGVkIHdpbGwgZGV0ZXJtaW5lIHRoZSBvbi1heGlzXG4gICAqIGJvdW5kcyB0aGF0IGNvbXBsZXRlbHkgY292ZXIgdGhlIHJvdGF0ZWQgYm91bmRzIChwb3RlbnRpYWxseSBsYXJnZXIgdGhhbiBhY3R1YWwgY29udGVudCkuXG4gICAqIElmIHNldCB0byB0cnVlLCBTY2VuZXJ5IHdpbGwgdHJ5IHRvIGdldCB0aGUgYm91bmRzIG9mIHRoZSBhY3R1YWwgcm90YXRlZC90cmFuc2Zvcm1lZCBjb250ZW50LlxuICAgKlxuICAgKiBBIGdvb2QgZXhhbXBsZSBvZiB3aGVuIHRoaXMgaXMgbmVjZXNzYXJ5IGlzIGlmIHRoZXJlIGFyZSBhIGJ1bmNoIG9mIG5lc3RlZCBjaGlsZHJlbiB0aGF0IGVhY2ggaGF2ZSBwaS80IHJvdGF0aW9ucy5cbiAgICpcbiAgICogQHBhcmFtIHRyYW5zZm9ybUJvdW5kcyAtIFdoZXRoZXIgYWNjdXJhdGUgdHJhbnNmb3JtIGJvdW5kcyBzaG91bGQgYmUgdXNlZC5cbiAgICovXG4gIHB1YmxpYyBzZXRUcmFuc2Zvcm1Cb3VuZHMoIHRyYW5zZm9ybUJvdW5kczogYm9vbGVhbiApOiB0aGlzIHtcblxuICAgIGlmICggdGhpcy5fdHJhbnNmb3JtQm91bmRzICE9PSB0cmFuc2Zvcm1Cb3VuZHMgKSB7XG4gICAgICB0aGlzLl90cmFuc2Zvcm1Cb3VuZHMgPSB0cmFuc2Zvcm1Cb3VuZHM7XG5cbiAgICAgIHRoaXMuaW52YWxpZGF0ZUJvdW5kcygpO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzOyAvLyBhbGxvdyBjaGFpbmluZ1xuICB9XG5cbiAgLyoqXG4gICAqIFNlZSBzZXRUcmFuc2Zvcm1Cb3VuZHMoKSBmb3IgbW9yZSBpbmZvcm1hdGlvblxuICAgKi9cbiAgcHVibGljIHNldCB0cmFuc2Zvcm1Cb3VuZHMoIHZhbHVlOiBib29sZWFuICkge1xuICAgIHRoaXMuc2V0VHJhbnNmb3JtQm91bmRzKCB2YWx1ZSApO1xuICB9XG5cbiAgLyoqXG4gICAqIFNlZSBnZXRUcmFuc2Zvcm1Cb3VuZHMoKSBmb3IgbW9yZSBpbmZvcm1hdGlvblxuICAgKi9cbiAgcHVibGljIGdldCB0cmFuc2Zvcm1Cb3VuZHMoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0VHJhbnNmb3JtQm91bmRzKCk7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB3aGV0aGVyIGFjY3VyYXRlIHRyYW5zZm9ybWF0aW9uIGJvdW5kcyBhcmUgdXNlZCBpbiBib3VuZHMgY29tcHV0YXRpb24gKHNlZSBzZXRUcmFuc2Zvcm1Cb3VuZHMpLlxuICAgKi9cbiAgcHVibGljIGdldFRyYW5zZm9ybUJvdW5kcygpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5fdHJhbnNmb3JtQm91bmRzO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIGJvdW5kaW5nIGJveCBvZiB0aGlzIE5vZGUgYW5kIGFsbCBvZiBpdHMgc3ViLXRyZWVzIChpbiB0aGUgXCJwYXJlbnRcIiBjb29yZGluYXRlIGZyYW1lKS5cbiAgICpcbiAgICogTk9URTogRG8gTk9UIG11dGF0ZSB0aGUgcmV0dXJuZWQgdmFsdWUhXG4gICAqIE5PVEU6IFRoaXMgbWF5IHJlcXVpcmUgY29tcHV0YXRpb24gb2YgdGhpcyBub2RlJ3Mgc3VidHJlZSBib3VuZHMsIHdoaWNoIG1heSBpbmN1ciBzb21lIHBlcmZvcm1hbmNlIGxvc3MuXG4gICAqL1xuICBwdWJsaWMgZ2V0Qm91bmRzKCk6IEJvdW5kczIge1xuICAgIHJldHVybiB0aGlzLmJvdW5kc1Byb3BlcnR5LnZhbHVlO1xuICB9XG5cbiAgLyoqXG4gICAqIFNlZSBnZXRCb3VuZHMoKSBmb3IgbW9yZSBpbmZvcm1hdGlvblxuICAgKi9cbiAgcHVibGljIGdldCBib3VuZHMoKTogQm91bmRzMiB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0Qm91bmRzKCk7XG4gIH1cblxuICAvKipcbiAgICogTGlrZSBnZXRMb2NhbEJvdW5kcygpIGluIHRoZSBcImxvY2FsXCIgY29vcmRpbmF0ZSBmcmFtZSwgYnV0IGluY2x1ZGVzIG9ubHkgdmlzaWJsZSBub2Rlcy5cbiAgICovXG4gIHB1YmxpYyBnZXRWaXNpYmxlTG9jYWxCb3VuZHMoKTogQm91bmRzMiB7XG4gICAgLy8gZGVmZW5zaXZlIGNvcHksIHNpbmNlIHdlIHVzZSBtdXRhYmxlIG1vZGlmaWNhdGlvbnMgYmVsb3dcbiAgICBjb25zdCBib3VuZHMgPSB0aGlzLnNlbGZCb3VuZHMuY29weSgpO1xuXG4gICAgbGV0IGkgPSB0aGlzLl9jaGlsZHJlbi5sZW5ndGg7XG4gICAgd2hpbGUgKCBpLS0gKSB7XG4gICAgICBib3VuZHMuaW5jbHVkZUJvdW5kcyggdGhpcy5fY2hpbGRyZW5bIGkgXS5nZXRWaXNpYmxlQm91bmRzKCkgKTtcbiAgICB9XG5cbiAgICAvLyBhcHBseSBjbGlwcGluZyB0byB0aGUgYm91bmRzIGlmIHdlIGhhdmUgYSBjbGlwIGFyZWEgKGFsbCBkb25lIGluIHRoZSBsb2NhbCBjb29yZGluYXRlIGZyYW1lKVxuICAgIGNvbnN0IGNsaXBBcmVhID0gdGhpcy5jbGlwQXJlYTtcbiAgICBpZiAoIGNsaXBBcmVhICkge1xuICAgICAgYm91bmRzLmNvbnN0cmFpbkJvdW5kcyggY2xpcEFyZWEuYm91bmRzICk7XG4gICAgfVxuXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggYm91bmRzLmlzRmluaXRlKCkgfHwgYm91bmRzLmlzRW1wdHkoKSwgJ1Zpc2libGUgYm91bmRzIHNob3VsZCBub3QgYmUgaW5maW5pdGUnICk7XG4gICAgcmV0dXJuIGJvdW5kcztcbiAgfVxuXG4gIC8qKlxuICAgKiBTZWUgZ2V0VmlzaWJsZUxvY2FsQm91bmRzKCkgZm9yIG1vcmUgaW5mb3JtYXRpb25cbiAgICovXG4gIHB1YmxpYyBnZXQgdmlzaWJsZUxvY2FsQm91bmRzKCk6IEJvdW5kczIge1xuICAgIHJldHVybiB0aGlzLmdldFZpc2libGVMb2NhbEJvdW5kcygpO1xuICB9XG5cbiAgLyoqXG4gICAqIExpa2UgZ2V0Qm91bmRzKCkgaW4gdGhlIFwicGFyZW50XCIgY29vcmRpbmF0ZSBmcmFtZSwgYnV0IGluY2x1ZGVzIG9ubHkgdmlzaWJsZSBub2Rlc1xuICAgKi9cbiAgcHVibGljIGdldFZpc2libGVCb3VuZHMoKTogQm91bmRzMiB7XG4gICAgaWYgKCB0aGlzLmlzVmlzaWJsZSgpICkge1xuICAgICAgcmV0dXJuIHRoaXMuZ2V0VmlzaWJsZUxvY2FsQm91bmRzKCkudHJhbnNmb3JtKCB0aGlzLmdldE1hdHJpeCgpICk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgcmV0dXJuIEJvdW5kczIuTk9USElORztcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogU2VlIGdldFZpc2libGVCb3VuZHMoKSBmb3IgbW9yZSBpbmZvcm1hdGlvblxuICAgKi9cbiAgcHVibGljIGdldCB2aXNpYmxlQm91bmRzKCk6IEJvdW5kczIge1xuICAgIHJldHVybiB0aGlzLmdldFZpc2libGVCb3VuZHMoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBUZXN0cyB3aGV0aGVyIHRoZSBnaXZlbiBwb2ludCBpcyBcImNvbnRhaW5lZFwiIGluIHRoaXMgbm9kZSdzIHN1YnRyZWUgKG9wdGlvbmFsbHkgdXNpbmcgbW91c2UvdG91Y2ggYXJlYXMpLCBhbmQgaWZcbiAgICogc28gcmV0dXJucyB0aGUgVHJhaWwgKHJvb3RlZCBhdCB0aGlzIG5vZGUpIHRvIHRoZSB0b3AtbW9zdCAoaW4gc3RhY2tpbmcgb3JkZXIpIE5vZGUgdGhhdCBjb250YWlucyB0aGUgZ2l2ZW5cbiAgICogcG9pbnQuXG4gICAqXG4gICAqIE5PVEU6IFRoaXMgaXMgb3B0aW1pemVkIGZvciB0aGUgY3VycmVudCBpbnB1dCBzeXN0ZW0gKHJhdGhlciB0aGFuIHdoYXQgZ2V0cyB2aXN1YWxseSBkaXNwbGF5ZWQgb24gdGhlIHNjcmVlbiksIHNvXG4gICAqIHBpY2thYmlsaXR5IChOb2RlJ3MgcGlja2FibGUgcHJvcGVydHksIHZpc2liaWxpdHksIGFuZCB0aGUgcHJlc2VuY2Ugb2YgaW5wdXQgbGlzdGVuZXJzKSBhbGwgbWF5IGFmZmVjdCB0aGVcbiAgICogcmV0dXJuZWQgdmFsdWUuXG4gICAqXG4gICAqIEZvciBleGFtcGxlLCBoaXQtdGVzdGluZyBhIHNpbXBsZSBzaGFwZSAod2l0aCBubyBwaWNrYWJpbGl0eSkgd2lsbCByZXR1cm4gbnVsbDpcbiAgICogPiBuZXcgcGhldC5zY2VuZXJ5LkNpcmNsZSggMjAgKS5oaXRUZXN0KCBwaGV0LmRvdC52MiggMCwgMCApICk7IC8vIG51bGxcbiAgICpcbiAgICogSWYgdGhlIHNhbWUgc2hhcGUgaXMgbWFkZSB0byBiZSBwaWNrYWJsZSwgaXQgd2lsbCByZXR1cm4gYSB0cmFpbDpcbiAgICogPiBuZXcgcGhldC5zY2VuZXJ5LkNpcmNsZSggMjAsIHsgcGlja2FibGU6IHRydWUgfSApLmhpdFRlc3QoIHBoZXQuZG90LnYyKCAwLCAwICkgKTtcbiAgICogPiAvLyByZXR1cm5zIGEgVHJhaWwgd2l0aCB0aGUgY2lyY2xlIGFzIHRoZSBvbmx5IG5vZGUuXG4gICAqXG4gICAqIEl0IHdpbGwgcmV0dXJuIHRoZSByZXN1bHQgdGhhdCBpcyB2aXN1YWxseSBzdGFja2VkIG9uIHRvcCwgc28gZS5nLjpcbiAgICogPiBuZXcgcGhldC5zY2VuZXJ5Lk5vZGUoIHtcbiAgICogPiAgIHBpY2thYmxlOiB0cnVlLFxuICAgKiA+ICAgY2hpbGRyZW46IFtcbiAgICogPiAgICAgbmV3IHBoZXQuc2NlbmVyeS5DaXJjbGUoIDIwICksXG4gICAqID4gICAgIG5ldyBwaGV0LnNjZW5lcnkuQ2lyY2xlKCAxNSApXG4gICAqID4gICBdXG4gICAqID4gfSApLmhpdFRlc3QoIHBoZXQuZG90LnYyKCAwLCAwICkgKTsgLy8gcmV0dXJucyB0aGUgXCJ0b3AtbW9zdFwiIGNpcmNsZSAodGhlIG9uZSB3aXRoIHJhZGl1czoxNSkuXG4gICAqXG4gICAqIFRoaXMgaXMgdXNlZCBieSBTY2VuZXJ5J3MgaW50ZXJuYWwgaW5wdXQgc3lzdGVtIGJ5IGNhbGxpbmcgaGl0VGVzdCBvbiBhIERpc3BsYXkncyByb290Tm9kZSB3aXRoIHRoZVxuICAgKiBnbG9iYWwtY29vcmRpbmF0ZSBwb2ludC5cbiAgICpcbiAgICogQHBhcmFtIHBvaW50IC0gVGhlIHBvaW50IChpbiB0aGUgcGFyZW50IGNvb3JkaW5hdGUgZnJhbWUpIHRvIGNoZWNrIGFnYWluc3QgdGhpcyBub2RlJ3Mgc3VidHJlZS5cbiAgICogQHBhcmFtIFtpc01vdXNlXSAtIFdoZXRoZXIgbW91c2VBcmVhcyBzaG91bGQgYmUgdXNlZC5cbiAgICogQHBhcmFtIFtpc1RvdWNoXSAtIFdoZXRoZXIgdG91Y2hBcmVhcyBzaG91bGQgYmUgdXNlZC5cbiAgICogQHJldHVybnMgLSBSZXR1cm5zIG51bGwgaWYgdGhlIHBvaW50IGlzIG5vdCBjb250YWluZWQgaW4gdGhlIHN1YnRyZWUuXG4gICAqL1xuICBwdWJsaWMgaGl0VGVzdCggcG9pbnQ6IFZlY3RvcjIsIGlzTW91c2U/OiBib29sZWFuLCBpc1RvdWNoPzogYm9vbGVhbiApOiBUcmFpbCB8IG51bGwge1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIHBvaW50LmlzRmluaXRlKCksICdUaGUgcG9pbnQgc2hvdWxkIGJlIGEgZmluaXRlIFZlY3RvcjInICk7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggaXNNb3VzZSA9PT0gdW5kZWZpbmVkIHx8IHR5cGVvZiBpc01vdXNlID09PSAnYm9vbGVhbicsXG4gICAgICAnSWYgaXNNb3VzZSBpcyBwcm92aWRlZCwgaXQgc2hvdWxkIGJlIGEgYm9vbGVhbicgKTtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBpc1RvdWNoID09PSB1bmRlZmluZWQgfHwgdHlwZW9mIGlzVG91Y2ggPT09ICdib29sZWFuJyxcbiAgICAgICdJZiBpc1RvdWNoIGlzIHByb3ZpZGVkLCBpdCBzaG91bGQgYmUgYSBib29sZWFuJyApO1xuXG4gICAgcmV0dXJuIHRoaXMuX3BpY2tlci5oaXRUZXN0KCBwb2ludCwgISFpc01vdXNlLCAhIWlzVG91Y2ggKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBIaXQtdGVzdHMgd2hhdCBpcyB1bmRlciB0aGUgcG9pbnRlciwgYW5kIHJldHVybnMgYSB7VHJhaWx9IHRvIHRoYXQgTm9kZSAob3IgbnVsbCBpZiB0aGVyZSBpcyBubyBtYXRjaGluZyBub2RlKS5cbiAgICpcbiAgICogU2VlIGhpdFRlc3QoKSBmb3IgbW9yZSBkZXRhaWxzIGFib3V0IHdoYXQgd2lsbCBiZSByZXR1cm5lZC5cbiAgICovXG4gIHB1YmxpYyB0cmFpbFVuZGVyUG9pbnRlciggcG9pbnRlcjogUG9pbnRlciApOiBUcmFpbCB8IG51bGwge1xuICAgIHJldHVybiBwb2ludGVyLnBvaW50ID09PSBudWxsID8gbnVsbCA6IHRoaXMuaGl0VGVzdCggcG9pbnRlci5wb2ludCwgcG9pbnRlciBpbnN0YW5jZW9mIE1vdXNlLCBwb2ludGVyLmlzVG91Y2hMaWtlKCkgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHdoZXRoZXIgYSBwb2ludCAoaW4gcGFyZW50IGNvb3JkaW5hdGVzKSBpcyBjb250YWluZWQgaW4gdGhpcyBub2RlJ3Mgc3ViLXRyZWUuXG4gICAqXG4gICAqIFNlZSBoaXRUZXN0KCkgZm9yIG1vcmUgZGV0YWlscyBhYm91dCB3aGF0IHdpbGwgYmUgcmV0dXJuZWQuXG4gICAqXG4gICAqIEByZXR1cm5zIC0gV2hldGhlciB0aGUgcG9pbnQgaXMgY29udGFpbmVkLlxuICAgKi9cbiAgcHVibGljIGNvbnRhaW5zUG9pbnQoIHBvaW50OiBWZWN0b3IyICk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLmhpdFRlc3QoIHBvaW50ICkgIT09IG51bGw7XG4gIH1cblxuICAvKipcbiAgICogT3ZlcnJpZGUgdGhpcyBmb3IgY29tcHV0YXRpb24gb2Ygd2hldGhlciBhIHBvaW50IGlzIGluc2lkZSBvdXIgc2VsZiBjb250ZW50IChkZWZhdWx0cyB0byBzZWxmQm91bmRzIGNoZWNrKS5cbiAgICpcbiAgICogQHBhcmFtIHBvaW50IC0gQ29uc2lkZXJlZCB0byBiZSBpbiB0aGUgbG9jYWwgY29vcmRpbmF0ZSBmcmFtZVxuICAgKi9cbiAgcHVibGljIGNvbnRhaW5zUG9pbnRTZWxmKCBwb2ludDogVmVjdG9yMiApOiBib29sZWFuIHtcbiAgICAvLyBpZiBzZWxmIGJvdW5kcyBhcmUgbm90IG51bGwgZGVmYXVsdCB0byBjaGVja2luZyBzZWxmIGJvdW5kc1xuICAgIHJldHVybiB0aGlzLnNlbGZCb3VuZHMuY29udGFpbnNQb2ludCggcG9pbnQgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHdoZXRoZXIgdGhpcyBub2RlJ3Mgc2VsZkJvdW5kcyBpcyBpbnRlcnNlY3RlZCBieSB0aGUgc3BlY2lmaWVkIGJvdW5kcy5cbiAgICpcbiAgICogQHBhcmFtIGJvdW5kcyAtIEJvdW5kcyB0byB0ZXN0LCBhc3N1bWVkIHRvIGJlIGluIHRoZSBsb2NhbCBjb29yZGluYXRlIGZyYW1lLlxuICAgKi9cbiAgcHVibGljIGludGVyc2VjdHNCb3VuZHNTZWxmKCBib3VuZHM6IEJvdW5kczIgKTogYm9vbGVhbiB7XG4gICAgLy8gaWYgc2VsZiBib3VuZHMgYXJlIG5vdCBudWxsLCBjaGlsZCBzaG91bGQgb3ZlcnJpZGUgdGhpc1xuICAgIHJldHVybiB0aGlzLnNlbGZCb3VuZHMuaW50ZXJzZWN0c0JvdW5kcyggYm91bmRzICk7XG4gIH1cblxuICAvKipcbiAgICogRGV0ZXJtaW5lIGlmIHRoZSBOb2RlIGlzIGEgY2FuZGlkYXRlIGZvciBwaGV0LWlvIGF1dG9zZWxlY3QuXG4gICAqIDEuIEludmlzaWJsZSB0aGluZ3MgY2Fubm90IGJlIGF1dG9zZWxlY3RlZFxuICAgKiAyLiBUcmFuc2Zvcm0gdGhlIHBvaW50IGluIHRoZSBsb2NhbCBjb29yZGluYXRlIGZyYW1lLCBzbyB3ZSBjYW4gdGVzdCBpdCB3aXRoIHRoZSBjbGlwQXJlYS9jaGlsZHJlblxuICAgKiAzLiBJZiBvdXIgcG9pbnQgaXMgb3V0c2lkZSB0aGUgbG9jYWwtY29vcmRpbmF0ZSBjbGlwcGluZyBhcmVhLCB0aGVyZSBzaG91bGQgYmUgbm8gaGl0LlxuICAgKiA0LiBOb3RlIHRoYXQgbm9uLXBpY2thYmxlIG5vZGVzIGNhbiBzdGlsbCBiZSBhdXRvc2VsZWN0ZWRcbiAgICovXG4gIHB1YmxpYyBpc1BoZXRpb01vdXNlSGl0dGFibGUoIHBvaW50OiBWZWN0b3IyICk6IGJvb2xlYW4ge1xuXG4gICAgLy8gdW5waWNrYWJsZSB0aGluZ3MgY2Fubm90IGJlIGF1dG9zZWxlY3RlZCB1bmxlc3MgdGhlcmUgYXJlIGRlc2NlbmRhbnRzIHRoYXQgY291bGQgYmUgcG90ZW50aWFsIG1vdXNlIGhpdHMuXG4gICAgLy8gSXQgaXMgaW1wb3J0YW50IHRvIG9wdCBvdXQgb2YgdGhlc2Ugc3VidHJlZXMgdG8gbWFrZSBzdXJlIHRoYXQgdGhleSBkb24ndCBmYWxzZWx5IFwic3VjayB1cFwiIGEgbW91c2UgaGl0IHRoYXRcbiAgICAvLyB3b3VsZCBvdGhlcndpc2UgZ28gdG8gYSB0YXJnZXQgYmVoaW5kIHRoZSB1bnBpY2thYmxlIE5vZGUuXG4gICAgaWYgKCB0aGlzLnBpY2thYmxlID09PSBmYWxzZSAmJiAhdGhpcy5pc0FueURlc2NlbmRhbnRBUGhldGlvTW91c2VIaXRUYXJnZXQoKSApIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy52aXNpYmxlICYmXG4gICAgICAgICAgICggdGhpcy5jbGlwQXJlYSA9PT0gbnVsbCB8fCB0aGlzLmNsaXBBcmVhLmNvbnRhaW5zUG9pbnQoIHRoaXMuX3RyYW5zZm9ybS5nZXRJbnZlcnNlKCkudGltZXNWZWN0b3IyKCBwb2ludCApICkgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBJZiB5b3UgbmVlZCB0byBrbm93IGlmIGFueSBOb2RlIGluIGEgc3VidHJlZSBjb3VsZCBwb3NzaWJseSBiZSBhIHBoZXRpbyBtb3VzZSBoaXQgdGFyZ2V0LlxuICAgKiBTUiBhbmQgTUsgcmFuIHBlcmZvcm1hbmNlIG9uIHRoaXMgZnVuY3Rpb24gaW4gQ0NLOkRDIGFuZCBDQVYgaW4gNi8yMDIzIGFuZCB0aGVyZSB3YXMgbm8gbm90aWNlYWJsZSBwcm9ibGVtLlxuICAgKi9cbiAgcHVibGljIGlzQW55RGVzY2VuZGFudEFQaGV0aW9Nb3VzZUhpdFRhcmdldCgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5nZXRQaGV0aW9Nb3VzZUhpdFRhcmdldCgpICE9PSAncGhldGlvTm90U2VsZWN0YWJsZScgfHxcbiAgICAgICAgICAgXy5zb21lKCB0aGlzLmNoaWxkcmVuLCBjaGlsZCA9PiBjaGlsZC5pc0FueURlc2NlbmRhbnRBUGhldGlvTW91c2VIaXRUYXJnZXQoKSApO1xuICB9XG5cbiAgLyoqXG4gICAqIFVzZWQgaW4gU3R1ZGlvIEF1dG9zZWxlY3QuICBSZXR1cm5zIGEgUGhFVC1pTyBFbGVtZW50IChhIFBoZXRpb09iamVjdCkgaWYgcG9zc2libGUsIG9yIG51bGwgaWYgbm8gaGl0LlxuICAgKiBcInBoZXRpb05vdFNlbGVjdGFibGVcIiBpcyBhbiBpbnRlcm1lZGlhdGUgc3RhdGUgdXNlZCB0byBub3RlIHdoZW4gYSBcImhpdFwiIGhhcyBvY2N1cnJlZCwgYnV0IHRoZSBoaXQgd2FzIG9uIGEgTm9kZVxuICAgKiB0aGF0IGRpZG4ndCBoYXZlIGEgZml0IHRhcmdldCAoc2VlIFBoZXRpb09iamVjdC5nZXRQaGV0aW9Nb3VzZUhpdFRhcmdldCgpKVxuICAgKiBBIGZldyBub3RlcyBvbiB0aGUgaW1wbGVtZW50YXRpb246XG4gICAqIDEuIFByZWZlciB0aGUgbGVhZiBtb3N0IE5vZGUgdGhhdCBpcyBhdCB0aGUgaGlnaGVzdCB6LWluZGV4IGluIHJlbmRlcmluZyBvcmRlclxuICAgKiAyLiBQaWNrYWJsZTpmYWxzZSBOb2RlcyBkb24ndCBwcnVuZSBvdXQgc3VidHJlZXMgaWYgZGVzY2VuZGVudHMgY291bGQgc3RpbGwgYmUgbW91c2UgaGl0IHRhcmdldHNcbiAgICogICAgKHNlZSBQaGV0aW9PYmplY3QuZ2V0UGhldGlvTW91c2VIaXRUYXJnZXQoKSkuXG4gICAqIDMuIEZpcnN0IHRoZSBhbGdvcml0aG0gZmluZHMgYSBOb2RlIHRoYXQgaXMgYSBcImhpdFwiLCBhbmQgdGhlbiBpdCB0cmllcyB0byBmaW5kIHRoZSBtb3N0IGZpdCBcInRhcmdldFwiIGZvciB0aGF0IGhpdC5cbiAgICogICAgYS4gSXRzZWxmLCBzZWUgIFBoZXRpb09iamVjdC5nZXRQaGV0aW9Nb3VzZUhpdFRhcmdldCgpXG4gICAqICAgIGIuIEEgY2xhc3MgZGVmaW5lZCBzdWJzdGl0dXRlLCBUZXh0LmdldFBoZXRpb01vdXNlSGl0VGFyZ2V0KClcbiAgICogICAgYy4gQSBzaWJsaW5nIHRoYXQgaXMgcmVuZGVyZWQgYmVoaW5kIHRoZSBoaXRcbiAgICogICAgZC4gVGhlIG1vc3QgcmVjZW50IGRlc2NlbmRhbnQgdGhhdCBpcyBhIHVzYWJsZSB0YXJnZXQuXG4gICAqXG4gICAqIEFkYXB0ZWQgb3JpZ2luYWxseSBmcm9tIFBpY2tlci5yZWN1cnNpdmVIaXRUZXN0LCB3aXRoIHNwZWNpZmljIHR3ZWFrcyBuZWVkZWQgZm9yIFBoRVQtaU8gaW5zdHJ1bWVudGF0aW9uLCBkaXNwbGF5XG4gICAqIGFuZCBmaWx0ZXJpbmcuXG4gICAqIEByZXR1cm5zIC0gbnVsbCBpZiBubyBoaXQgb2NjdXJyZWRcbiAgICogICAgICAgICAgLSBBIFBoZXRpb09iamVjdCBpZiBhIGhpdCBvY2N1cnJlZCBvbiBhIE5vZGUgd2l0aCBhIHNlbGVjdGFibGUgdGFyZ2V0XG4gICAqICAgICAgICAgIC0gJ3BoZXRpb05vdFNlbGVjdGFibGUnIGlmIGEgaGl0IG9jY3VycmVkLCBidXQgbm8gc3VpdGFibGUgdGFyZ2V0IHdhcyBmb3VuZCBmcm9tIHRoYXQgaGl0IChzZWVcbiAgICogICAgICAgICAgICAgUGhldGlvT2JqZWN0LmdldFBoZXRpb01vdXNlSGl0VGFyZ2V0KCkpXG4gICAqL1xuICBwdWJsaWMgZ2V0UGhldGlvTW91c2VIaXQoIHBvaW50OiBWZWN0b3IyICk6IFBoZXRpb09iamVjdCB8IG51bGwgfCAncGhldGlvTm90U2VsZWN0YWJsZScge1xuXG4gICAgaWYgKCAhdGhpcy5pc1BoZXRpb01vdXNlSGl0dGFibGUoIHBvaW50ICkgKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICAvLyBUcmFuc2Zvcm0gdGhlIHBvaW50IGluIHRoZSBsb2NhbCBjb29yZGluYXRlIGZyYW1lLCBzbyB3ZSBjYW4gdGVzdCBpdCB3aXRoIHRoZSBjbGlwQXJlYS9jaGlsZHJlblxuICAgIGNvbnN0IGxvY2FsUG9pbnQgPSB0aGlzLl90cmFuc2Zvcm0uZ2V0SW52ZXJzZSgpLnRpbWVzVmVjdG9yMiggcG9pbnQgKTtcblxuICAgIC8vIElmIGFueSBjaGlsZCB3YXMgaGl0IGJ1dCByZXR1cm5lZCAncGhldGlvTm90U2VsZWN0YWJsZScsIHRoZW4gdGhhdCB3aWxsIHRyaWdnZXIgdGhlIFwiZmluZCB0aGUgYmVzdCB0YXJnZXRcIiBwb3J0aW9uXG4gICAgLy8gb2YgdGhlIGFsZ29yaXRobSwgbW92aW5nIG9uIGZyb20gdGhlIFwiZmluZCB0aGUgaGl0IE5vZGVcIiBwYXJ0LlxuICAgIGxldCBjaGlsZEhpdFdpdGhvdXRUYXJnZXQgPSBudWxsO1xuXG4gICAgLy8gQ2hlY2sgY2hpbGRyZW4gYmVmb3JlIG91ciBcInNlbGZcIiwgc2luY2UgdGhlIGNoaWxkcmVuIGFyZSByZW5kZXJlZCBvbiB0b3AuXG4gICAgLy8gTWFudWFsIGl0ZXJhdGlvbiBoZXJlIHNvIHdlIGNhbiByZXR1cm4gZGlyZWN0bHksIGFuZCBzbyB3ZSBjYW4gaXRlcmF0ZSBiYWNrd2FyZHMgKGxhc3Qgbm9kZSBpcyByZW5kZXJlZCBpbiBmcm9udCkuXG4gICAgZm9yICggbGV0IGkgPSB0aGlzLl9jaGlsZHJlbi5sZW5ndGggLSAxOyBpID49IDA7IGktLSApIHtcblxuICAgICAgLy8gTm90IG5lY2Vzc2FyaWx5IGEgY2hpbGQgb2YgdGhpcyBOb2RlIChzZWUgZ2V0UGhldGlvTW91c2VIaXRUYXJnZXQoKSlcbiAgICAgIGNvbnN0IGNoaWxkVGFyZ2V0SGl0ID0gdGhpcy5fY2hpbGRyZW5bIGkgXS5nZXRQaGV0aW9Nb3VzZUhpdCggbG9jYWxQb2ludCApO1xuXG4gICAgICBpZiAoIGNoaWxkVGFyZ2V0SGl0IGluc3RhbmNlb2YgUGhldGlvT2JqZWN0ICkge1xuICAgICAgICByZXR1cm4gY2hpbGRUYXJnZXRIaXQ7XG4gICAgICB9XG4gICAgICBlbHNlIGlmICggY2hpbGRUYXJnZXRIaXQgPT09ICdwaGV0aW9Ob3RTZWxlY3RhYmxlJyApIHtcbiAgICAgICAgY2hpbGRIaXRXaXRob3V0VGFyZ2V0ID0gdHJ1ZTtcbiAgICAgIH1cbiAgICAgIC8vIE5vIGhpdCwgc28ga2VlcCBpdGVyYXRpbmcgdG8gbmV4dCBjaGlsZFxuICAgIH1cblxuICAgIGlmICggY2hpbGRIaXRXaXRob3V0VGFyZ2V0ICkge1xuICAgICAgcmV0dXJuIHRoaXMuZ2V0UGhldGlvTW91c2VIaXRUYXJnZXQoKTtcbiAgICB9XG5cbiAgICAvLyBUZXN0cyBmb3IgbW91c2UgaGl0IGFyZWFzIGJlZm9yZSB0ZXN0aW5nIGNvbnRhaW5zUG9pbnRTZWxmLiBJZiB0aGVyZSBpcyBhIG1vdXNlQXJlYSwgdGhlbiBkb24ndCBldmVyIGNoZWNrIHNlbGZCb3VuZHMuXG4gICAgaWYgKCB0aGlzLl9tb3VzZUFyZWEgKSB7XG4gICAgICByZXR1cm4gdGhpcy5fbW91c2VBcmVhLmNvbnRhaW5zUG9pbnQoIGxvY2FsUG9pbnQgKSA/IHRoaXMuZ2V0UGhldGlvTW91c2VIaXRUYXJnZXQoKSA6IG51bGw7XG4gICAgfVxuXG4gICAgLy8gRGlkbid0IGhpdCBvdXIgY2hpbGRyZW4sIHNvIGNoZWNrIG91cnNlbHZlcyBhcyBhIGxhc3QgcmVzb3J0LiBDaGVjayBvdXIgc2VsZkJvdW5kcyBmaXJzdCwgc28gd2UgY2FuIHBvdGVudGlhbGx5XG4gICAgLy8gYXZvaWQgaGl0LXRlc3RpbmcgdGhlIGFjdHVhbCBvYmplY3QgKHdoaWNoIG1heSBiZSBtb3JlIGV4cGVuc2l2ZSkuXG4gICAgaWYgKCB0aGlzLnNlbGZCb3VuZHMuY29udGFpbnNQb2ludCggbG9jYWxQb2ludCApICYmIHRoaXMuY29udGFpbnNQb2ludFNlbGYoIGxvY2FsUG9pbnQgKSApIHtcbiAgICAgIHJldHVybiB0aGlzLmdldFBoZXRpb01vdXNlSGl0VGFyZ2V0KCk7XG4gICAgfVxuXG4gICAgLy8gTm8gaGl0XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICAvKipcbiAgICogV2hldGhlciB0aGlzIE5vZGUgaXRzZWxmIGlzIHBhaW50ZWQgKGRpc3BsYXlzIHNvbWV0aGluZyBpdHNlbGYpLiBNZWFudCB0byBiZSBvdmVycmlkZGVuLlxuICAgKi9cbiAgcHVibGljIGlzUGFpbnRlZCgpOiBib29sZWFuIHtcbiAgICAvLyBOb3JtYWwgbm9kZXMgZG9uJ3QgcmVuZGVyIGFueXRoaW5nXG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgLyoqXG4gICAqIFdoZXRoZXIgdGhpcyBOb2RlJ3Mgc2VsZkJvdW5kcyBhcmUgY29uc2lkZXJlZCB0byBiZSB2YWxpZCAoYWx3YXlzIGNvbnRhaW5pbmcgdGhlIGRpc3BsYXllZCBzZWxmIGNvbnRlbnRcbiAgICogb2YgdGhpcyBub2RlKS4gTWVhbnQgdG8gYmUgb3ZlcnJpZGRlbiBpbiBzdWJ0eXBlcyB3aGVuIHRoaXMgY2FuIGNoYW5nZSAoZS5nLiBUZXh0KS5cbiAgICpcbiAgICogSWYgdGhpcyB2YWx1ZSB3b3VsZCBwb3RlbnRpYWxseSBjaGFuZ2UsIHBsZWFzZSB0cmlnZ2VyIHRoZSBldmVudCAnc2VsZkJvdW5kc1ZhbGlkJy5cbiAgICovXG4gIHB1YmxpYyBhcmVTZWxmQm91bmRzVmFsaWQoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB3aGV0aGVyIHRoaXMgTm9kZSBoYXMgYW55IHBhcmVudHMgYXQgYWxsLlxuICAgKi9cbiAgcHVibGljIGhhc1BhcmVudCgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5fcGFyZW50cy5sZW5ndGggIT09IDA7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB3aGV0aGVyIHRoaXMgTm9kZSBoYXMgYW55IGNoaWxkcmVuIGF0IGFsbC5cbiAgICovXG4gIHB1YmxpYyBoYXNDaGlsZHJlbigpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5fY2hpbGRyZW4ubGVuZ3RoID4gMDtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHdoZXRoZXIgYSBjaGlsZCBzaG91bGQgYmUgaW5jbHVkZWQgZm9yIGxheW91dCAoaWYgdGhpcyBOb2RlIGlzIGEgbGF5b3V0IGNvbnRhaW5lcikuXG4gICAqL1xuICBwdWJsaWMgaXNDaGlsZEluY2x1ZGVkSW5MYXlvdXQoIGNoaWxkOiBOb2RlICk6IGJvb2xlYW4ge1xuICAgIHJldHVybiBjaGlsZC5ib3VuZHMuaXNWYWxpZCgpICYmICggIXRoaXMuX2V4Y2x1ZGVJbnZpc2libGVDaGlsZHJlbkZyb21Cb3VuZHMgfHwgY2hpbGQudmlzaWJsZSApO1xuICB9XG5cbiAgLyoqXG4gICAqIENhbGxzIHRoZSBjYWxsYmFjayBvbiBub2RlcyByZWN1cnNpdmVseSBpbiBhIGRlcHRoLWZpcnN0IG1hbm5lci5cbiAgICovXG4gIHB1YmxpYyB3YWxrRGVwdGhGaXJzdCggY2FsbGJhY2s6ICggbm9kZTogTm9kZSApID0+IHZvaWQgKTogdm9pZCB7XG4gICAgY2FsbGJhY2soIHRoaXMgKTtcbiAgICBjb25zdCBsZW5ndGggPSB0aGlzLl9jaGlsZHJlbi5sZW5ndGg7XG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgbGVuZ3RoOyBpKysgKSB7XG4gICAgICB0aGlzLl9jaGlsZHJlblsgaSBdLndhbGtEZXB0aEZpcnN0KCBjYWxsYmFjayApO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBBZGRzIGFuIGlucHV0IGxpc3RlbmVyLlxuICAgKlxuICAgKiBTZWUgSW5wdXQuanMgZG9jdW1lbnRhdGlvbiBmb3IgaW5mb3JtYXRpb24gYWJvdXQgaG93IGV2ZW50IGxpc3RlbmVycyBhcmUgdXNlZC5cbiAgICpcbiAgICogQWRkaXRpb25hbGx5LCB0aGUgZm9sbG93aW5nIGZpZWxkcyBhcmUgc3VwcG9ydGVkIG9uIGEgbGlzdGVuZXI6XG4gICAqXG4gICAqIC0gaW50ZXJydXB0IHtmdW5jdGlvbigpfTogV2hlbiBhIHBvaW50ZXIgaXMgaW50ZXJydXB0ZWQsIGl0IHdpbGwgYXR0ZW1wdCB0byBjYWxsIHRoaXMgbWV0aG9kIG9uIHRoZSBpbnB1dCBsaXN0ZW5lclxuICAgKiAtIGN1cnNvciB7c3RyaW5nfG51bGx9OiBJZiBub2RlLmN1cnNvciBpcyBudWxsLCBhbnkgbm9uLW51bGwgY3Vyc29yIG9mIGFuIGlucHV0IGxpc3RlbmVyIHdpbGwgZWZmZWN0aXZlbHlcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgXCJvdmVycmlkZVwiIGl0LiBOT1RFOiB0aGlzIGNhbiBiZSBpbXBsZW1lbnRlZCBhcyBhbiBlczUgZ2V0dGVyLCBpZiB0aGUgY3Vyc29yIGNhbiBjaGFuZ2VcbiAgICovXG4gIHB1YmxpYyBhZGRJbnB1dExpc3RlbmVyKCBsaXN0ZW5lcjogVElucHV0TGlzdGVuZXIgKTogdGhpcyB7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggIV8uaW5jbHVkZXMoIHRoaXMuX2lucHV0TGlzdGVuZXJzLCBsaXN0ZW5lciApLCAnSW5wdXQgbGlzdGVuZXIgYWxyZWFkeSByZWdpc3RlcmVkIG9uIHRoaXMgTm9kZScgKTtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBsaXN0ZW5lciAhPT0gbnVsbCwgJ0lucHV0IGxpc3RlbmVyIGNhbm5vdCBiZSBudWxsJyApO1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIGxpc3RlbmVyICE9PSB1bmRlZmluZWQsICdJbnB1dCBsaXN0ZW5lciBjYW5ub3QgYmUgdW5kZWZpbmVkJyApO1xuXG4gICAgLy8gZG9uJ3QgYWxsb3cgbGlzdGVuZXJzIHRvIGJlIGFkZGVkIG11bHRpcGxlIHRpbWVzXG4gICAgaWYgKCAhXy5pbmNsdWRlcyggdGhpcy5faW5wdXRMaXN0ZW5lcnMsIGxpc3RlbmVyICkgKSB7XG4gICAgICB0aGlzLl9pbnB1dExpc3RlbmVycy5wdXNoKCBsaXN0ZW5lciApO1xuICAgICAgdGhpcy5fcGlja2VyLm9uQWRkSW5wdXRMaXN0ZW5lcigpO1xuICAgICAgaWYgKCBhc3NlcnRTbG93ICkgeyB0aGlzLl9waWNrZXIuYXVkaXQoKTsgfVxuXG4gICAgICAvLyBJZiB0aGUgbGlzdGVuZXIgY29udGFpbnMgaG90a2V5cywgYWN0aXZlIGhvdGtleXMgbWF5IG5lZWQgdG8gYmUgdXBkYXRlZC4gVGhlcmUgaXMgbm8gZXZlbnRcbiAgICAgIC8vIGZvciBjaGFuZ2luZyBpbnB1dCBsaXN0ZW5lcnMuIFNlZSBob3RrZXlNYW5hZ2VyIGZvciBtb3JlIGluZm9ybWF0aW9uLlxuICAgICAgaWYgKCBsaXN0ZW5lci5ob3RrZXlzICkge1xuICAgICAgICBob3RrZXlNYW5hZ2VyLnVwZGF0ZUhvdGtleXNGcm9tSW5wdXRMaXN0ZW5lckNoYW5nZSggdGhpcyApO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBSZW1vdmVzIGFuIGlucHV0IGxpc3RlbmVyIHRoYXQgd2FzIHByZXZpb3VzbHkgYWRkZWQgd2l0aCBhZGRJbnB1dExpc3RlbmVyLlxuICAgKi9cbiAgcHVibGljIHJlbW92ZUlucHV0TGlzdGVuZXIoIGxpc3RlbmVyOiBUSW5wdXRMaXN0ZW5lciApOiB0aGlzIHtcbiAgICBjb25zdCBpbmRleCA9IF8uaW5kZXhPZiggdGhpcy5faW5wdXRMaXN0ZW5lcnMsIGxpc3RlbmVyICk7XG5cbiAgICAvLyBlbnN1cmUgdGhlIGxpc3RlbmVyIGlzIGluIG91ciBsaXN0IChpZ25vcmUgYXNzZXJ0aW9uIGZvciBkaXNwb3NhbCwgc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9zdW4vaXNzdWVzLzM5NClcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0aGlzLmlzRGlzcG9zZWQgfHwgaW5kZXggPj0gMCwgJ0NvdWxkIG5vdCBmaW5kIGlucHV0IGxpc3RlbmVyIHRvIHJlbW92ZScgKTtcbiAgICBpZiAoIGluZGV4ID49IDAgKSB7XG4gICAgICB0aGlzLl9pbnB1dExpc3RlbmVycy5zcGxpY2UoIGluZGV4LCAxICk7XG4gICAgICB0aGlzLl9waWNrZXIub25SZW1vdmVJbnB1dExpc3RlbmVyKCk7XG4gICAgICBpZiAoIGFzc2VydFNsb3cgKSB7IHRoaXMuX3BpY2tlci5hdWRpdCgpOyB9XG5cbiAgICAgIC8vIElmIHRoZSBsaXN0ZW5lciBjb250YWlucyBob3RrZXlzLCBhY3RpdmUgaG90a2V5cyBtYXkgbmVlZCB0byBiZSB1cGRhdGVkLiBUaGVyZSBpcyBubyBldmVudFxuICAgICAgLy8gZm9yIGNoYW5naW5nIGlucHV0IGxpc3RlbmVycy4gU2VlIGhvdGtleU1hbmFnZXIgZm9yIG1vcmUgaW5mb3JtYXRpb24uXG4gICAgICBpZiAoIGxpc3RlbmVyLmhvdGtleXMgKSB7XG4gICAgICAgIGhvdGtleU1hbmFnZXIudXBkYXRlSG90a2V5c0Zyb21JbnB1dExpc3RlbmVyQ2hhbmdlKCB0aGlzICk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB3aGV0aGVyIHRoaXMgaW5wdXQgbGlzdGVuZXIgaXMgY3VycmVudGx5IGxpc3RlbmluZyB0byB0aGlzIG5vZGUuXG4gICAqXG4gICAqIE1vcmUgZWZmaWNpZW50IHRoYW4gY2hlY2tpbmcgbm9kZS5pbnB1dExpc3RlbmVycywgYXMgdGhhdCBpbmNsdWRlcyBhIGRlZmVuc2l2ZSBjb3B5LlxuICAgKi9cbiAgcHVibGljIGhhc0lucHV0TGlzdGVuZXIoIGxpc3RlbmVyOiBUSW5wdXRMaXN0ZW5lciApOiBib29sZWFuIHtcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCB0aGlzLl9pbnB1dExpc3RlbmVycy5sZW5ndGg7IGkrKyApIHtcbiAgICAgIGlmICggdGhpcy5faW5wdXRMaXN0ZW5lcnNbIGkgXSA9PT0gbGlzdGVuZXIgKSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICAvKipcbiAgICogSW50ZXJydXB0cyBhbGwgaW5wdXQgbGlzdGVuZXJzIHRoYXQgYXJlIGF0dGFjaGVkIHRvIHRoaXMgbm9kZS5cbiAgICovXG4gIHB1YmxpYyBpbnRlcnJ1cHRJbnB1dCgpOiB0aGlzIHtcbiAgICBjb25zdCBsaXN0ZW5lcnNDb3B5ID0gdGhpcy5pbnB1dExpc3RlbmVycztcblxuICAgIGZvciAoIGxldCBpID0gMDsgaSA8IGxpc3RlbmVyc0NvcHkubGVuZ3RoOyBpKysgKSB7XG4gICAgICBjb25zdCBsaXN0ZW5lciA9IGxpc3RlbmVyc0NvcHlbIGkgXTtcblxuICAgICAgbGlzdGVuZXIuaW50ZXJydXB0ICYmIGxpc3RlbmVyLmludGVycnVwdCgpO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIEludGVycnVwdHMgYWxsIGlucHV0IGxpc3RlbmVycyB0aGF0IGFyZSBhdHRhY2hlZCB0byBlaXRoZXIgdGhpcyBub2RlLCBvciBhIGRlc2NlbmRhbnQgbm9kZS5cbiAgICovXG4gIHB1YmxpYyBpbnRlcnJ1cHRTdWJ0cmVlSW5wdXQoKTogdGhpcyB7XG4gICAgdGhpcy5pbnRlcnJ1cHRJbnB1dCgpO1xuXG4gICAgY29uc3QgY2hpbGRyZW4gPSB0aGlzLl9jaGlsZHJlbi5zbGljZSgpO1xuICAgIGZvciAoIGxldCBpID0gMDsgaSA8IGNoaWxkcmVuLmxlbmd0aDsgaSsrICkge1xuICAgICAgY29uc3QgY2hpbGQgPSBjaGlsZHJlblsgaSBdO1xuXG4gICAgICAvLyBQZXJmb3JtYW5jZSBlbmhhbmNlbWVudCBieSBwcnVuaW5nIG91dCBzdWJ0cmVlcyB0aGF0IGhhdmUgbm8gaW5wdXQgbGlzdGVuZXJzIG9yIHdvdWxkIG5vdCBiZSBwaWNrYWJsZSBhbnl3YXkuXG4gICAgICAvLyBTZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3NjZW5lcnkvaXNzdWVzLzE2NDVcbiAgICAgIGlmICggY2hpbGQuX3BpY2tlci5pc1BvdGVudGlhbGx5UGlja2FibGUoKSApIHtcbiAgICAgICAgY2hpbGQuaW50ZXJydXB0U3VidHJlZUlucHV0KCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogQ2hhbmdlcyB0aGUgdHJhbnNmb3JtIG9mIHRoaXMgTm9kZSBieSBhZGRpbmcgYSB0cmFuc2Zvcm0uIFRoZSBkZWZhdWx0IFwiYXBwZW5kc1wiIHRoZSB0cmFuc2Zvcm0sIHNvIHRoYXQgaXQgd2lsbFxuICAgKiBhcHBlYXIgdG8gaGFwcGVuIHRvIHRoZSBOb2RlIGJlZm9yZSB0aGUgcmVzdCBvZiB0aGUgdHJhbnNmb3JtIHdvdWxkIGFwcGx5LCBidXQgaWYgXCJwcmVwZW5kZWRcIiwgdGhlIHJlc3Qgb2YgdGhlXG4gICAqIHRyYW5zZm9ybSB3b3VsZCBhcHBseSBmaXJzdC5cbiAgICpcbiAgICogQXMgYW4gZXhhbXBsZSwgaWYgYSBOb2RlIGlzIGNlbnRlcmVkIGF0ICgwLDApIGFuZCBzY2FsZWQgYnkgMjpcbiAgICogdHJhbnNsYXRlKCAxMDAsIDAgKSB3b3VsZCBjYXVzZSB0aGUgY2VudGVyIG9mIHRoZSBOb2RlIChpbiB0aGUgcGFyZW50IGNvb3JkaW5hdGUgZnJhbWUpIHRvIGJlIGF0ICgyMDAsMCkuXG4gICAqIHRyYW5zbGF0ZSggMTAwLCAwLCB0cnVlICkgd291bGQgY2F1c2UgdGhlIGNlbnRlciBvZiB0aGUgTm9kZSAoaW4gdGhlIHBhcmVudCBjb29yZGluYXRlIGZyYW1lKSB0byBiZSBhdCAoMTAwLDApLlxuICAgKlxuICAgKiBBbGxvd2VkIGNhbGwgc2lnbmF0dXJlczpcbiAgICogdHJhbnNsYXRlKCB4IHtudW1iZXJ9LCB5IHtudW1iZXJ9IClcbiAgICogdHJhbnNsYXRlKCB4IHtudW1iZXJ9LCB5IHtudW1iZXJ9LCBwcmVwZW5kSW5zdGVhZCB7Ym9vbGVhbn0gKVxuICAgKiB0cmFuc2xhdGUoIHZlY3RvciB7VmVjdG9yMn0gKVxuICAgKiB0cmFuc2xhdGUoIHZlY3RvciB7VmVjdG9yMn0sIHByZXBlbmRJbnN0ZWFkIHtib29sZWFufSApXG4gICAqXG4gICAqIEBwYXJhbSB4IC0gVGhlIHggY29vcmRpbmF0ZVxuICAgKiBAcGFyYW0geSAtIFRoZSB5IGNvb3JkaW5hdGVcbiAgICogQHBhcmFtIFtwcmVwZW5kSW5zdGVhZF0gLSBXaGV0aGVyIHRoZSB0cmFuc2Zvcm0gc2hvdWxkIGJlIHByZXBlbmRlZCAoZGVmYXVsdHMgdG8gZmFsc2UpXG4gICAqL1xuICBwdWJsaWMgdHJhbnNsYXRlKCB2OiBWZWN0b3IyLCBwcmVwZW5kSW5zdGVhZD86IGJvb2xlYW4gKTogdm9pZDtcbiAgdHJhbnNsYXRlKCB4OiBudW1iZXIsIHk6IG51bWJlciwgcHJlcGVuZEluc3RlYWQ/OiBib29sZWFuICk6IHZvaWQ7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L2V4cGxpY2l0LW1lbWJlci1hY2Nlc3NpYmlsaXR5XG4gIHRyYW5zbGF0ZSggeDogbnVtYmVyIHwgVmVjdG9yMiwgeT86IG51bWJlciB8IGJvb2xlYW4sIHByZXBlbmRJbnN0ZWFkPzogYm9vbGVhbiApOiB2b2lkIHsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvZXhwbGljaXQtbWVtYmVyLWFjY2Vzc2liaWxpdHlcbiAgICBpZiAoIHR5cGVvZiB4ID09PSAnbnVtYmVyJyApIHtcbiAgICAgIC8vIHRyYW5zbGF0ZSggeCwgeSwgcHJlcGVuZEluc3RlYWQgKVxuICAgICAgYXNzZXJ0ICYmIGFzc2VydCggaXNGaW5pdGUoIHggKSwgJ3ggc2hvdWxkIGJlIGEgZmluaXRlIG51bWJlcicgKTtcblxuICAgICAgYXNzZXJ0ICYmIGFzc2VydCggdHlwZW9mIHkgPT09ICdudW1iZXInICYmIGlzRmluaXRlKCB5ICksICd5IHNob3VsZCBiZSBhIGZpbml0ZSBudW1iZXInICk7XG5cbiAgICAgIGlmICggTWF0aC5hYnMoIHggKSA8IDFlLTEyICYmIE1hdGguYWJzKCB5IGFzIG51bWJlciApIDwgMWUtMTIgKSB7IHJldHVybjsgfSAvLyBiYWlsIG91dCBpZiBib3RoIGFyZSB6ZXJvXG4gICAgICBpZiAoIHByZXBlbmRJbnN0ZWFkICkge1xuICAgICAgICB0aGlzLnByZXBlbmRUcmFuc2xhdGlvbiggeCwgeSBhcyBudW1iZXIgKTtcbiAgICAgIH1cbiAgICAgIGVsc2Uge1xuICAgICAgICB0aGlzLmFwcGVuZE1hdHJpeCggc2NyYXRjaE1hdHJpeDMuc2V0VG9UcmFuc2xhdGlvbiggeCwgeSBhcyBudW1iZXIgKSApO1xuICAgICAgfVxuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIC8vIHRyYW5zbGF0ZSggdmVjdG9yLCBwcmVwZW5kSW5zdGVhZCApXG4gICAgICBjb25zdCB2ZWN0b3IgPSB4O1xuICAgICAgYXNzZXJ0ICYmIGFzc2VydCggdmVjdG9yLmlzRmluaXRlKCksICd0cmFuc2xhdGlvbiBzaG91bGQgYmUgYSBmaW5pdGUgVmVjdG9yMiBpZiBub3QgZmluaXRlIG51bWJlcnMnICk7XG4gICAgICBpZiAoICF2ZWN0b3IueCAmJiAhdmVjdG9yLnkgKSB7IHJldHVybjsgfSAvLyBiYWlsIG91dCBpZiBib3RoIGFyZSB6ZXJvXG4gICAgICB0aGlzLnRyYW5zbGF0ZSggdmVjdG9yLngsIHZlY3Rvci55LCB5IGFzIGJvb2xlYW4gKTsgLy8gZm9yd2FyZCB0byBmdWxsIHZlcnNpb25cbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogU2NhbGVzIHRoZSBub2RlJ3MgdHJhbnNmb3JtLiBUaGUgZGVmYXVsdCBcImFwcGVuZHNcIiB0aGUgdHJhbnNmb3JtLCBzbyB0aGF0IGl0IHdpbGxcbiAgICogYXBwZWFyIHRvIGhhcHBlbiB0byB0aGUgTm9kZSBiZWZvcmUgdGhlIHJlc3Qgb2YgdGhlIHRyYW5zZm9ybSB3b3VsZCBhcHBseSwgYnV0IGlmIFwicHJlcGVuZGVkXCIsIHRoZSByZXN0IG9mIHRoZVxuICAgKiB0cmFuc2Zvcm0gd291bGQgYXBwbHkgZmlyc3QuXG4gICAqXG4gICAqIEFzIGFuIGV4YW1wbGUsIGlmIGEgTm9kZSBpcyB0cmFuc2xhdGVkIHRvICgxMDAsMCk6XG4gICAqIHNjYWxlKCAyICkgd2lsbCBsZWF2ZSB0aGUgTm9kZSB0cmFuc2xhdGVkIGF0ICgxMDAsMCksIGJ1dCBpdCB3aWxsIGJlIHR3aWNlIGFzIGJpZyBhcm91bmQgaXRzIG9yaWdpbiBhdCB0aGF0IGxvY2F0aW9uLlxuICAgKiBzY2FsZSggMiwgdHJ1ZSApIHdpbGwgc2hpZnQgdGhlIE5vZGUgdG8gKDIwMCwwKS5cbiAgICpcbiAgICogQWxsb3dlZCBjYWxsIHNpZ25hdHVyZXM6XG4gICAqIChzIGludm9jYXRpb24pOiBzY2FsZSggcyB7bnVtYmVyfFZlY3RvcjJ9LCBbcHJlcGVuZEluc3RlYWRdIHtib29sZWFufSApXG4gICAqICh4LHkgaW52b2NhdGlvbik6IHNjYWxlKCB4IHtudW1iZXJ9LCB5IHtudW1iZXJ9LCBbcHJlcGVuZEluc3RlYWRdIHtib29sZWFufSApXG4gICAqXG4gICAqIEBwYXJhbSB4IC0gKHMgaW52b2NhdGlvbik6IHtudW1iZXJ9IHNjYWxlcyBib3RoIGRpbWVuc2lvbnMgZXF1YWxseSwgb3Ige1ZlY3RvcjJ9IHNjYWxlcyBpbmRlcGVuZGVudGx5XG4gICAqICAgICAgICAgIC0gKHgseSBpbnZvY2F0aW9uKToge251bWJlcn0gc2NhbGUgZm9yIHRoZSB4LWRpbWVuc2lvblxuICAgKiBAcGFyYW0gW3ldIC0gKHMgaW52b2NhdGlvbik6IHtib29sZWFufSBwcmVwZW5kSW5zdGVhZCAtIFdoZXRoZXIgdGhlIHRyYW5zZm9ybSBzaG91bGQgYmUgcHJlcGVuZGVkIChkZWZhdWx0cyB0byBmYWxzZSlcbiAgICogICAgICAgICAgICAtICh4LHkgaW52b2NhdGlvbik6IHtudW1iZXJ9IHkgLSBzY2FsZSBmb3IgdGhlIHktZGltZW5zaW9uXG4gICAqIEBwYXJhbSBbcHJlcGVuZEluc3RlYWRdIC0gKHgseSBpbnZvY2F0aW9uKSBXaGV0aGVyIHRoZSB0cmFuc2Zvcm0gc2hvdWxkIGJlIHByZXBlbmRlZCAoZGVmYXVsdHMgdG8gZmFsc2UpXG4gICAqL1xuICBwdWJsaWMgc2NhbGUoIHM6IG51bWJlciwgcHJlcGVuZEluc3RlYWQ/OiBib29sZWFuICk6IHZvaWQ7XG4gIHNjYWxlKCBzOiBWZWN0b3IyLCBwcmVwZW5kSW5zdGVhZD86IGJvb2xlYW4gKTogdm9pZDsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvZXhwbGljaXQtbWVtYmVyLWFjY2Vzc2liaWxpdHlcbiAgc2NhbGUoIHg6IG51bWJlciwgeTogbnVtYmVyLCBwcmVwZW5kSW5zdGVhZD86IGJvb2xlYW4gKTogdm9pZDsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvZXhwbGljaXQtbWVtYmVyLWFjY2Vzc2liaWxpdHlcbiAgc2NhbGUoIHg6IG51bWJlciB8IFZlY3RvcjIsIHk/OiBudW1iZXIgfCBib29sZWFuLCBwcmVwZW5kSW5zdGVhZD86IGJvb2xlYW4gKTogdm9pZCB7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L2V4cGxpY2l0LW1lbWJlci1hY2Nlc3NpYmlsaXR5XG4gICAgaWYgKCB0eXBlb2YgeCA9PT0gJ251bWJlcicgKSB7XG4gICAgICBhc3NlcnQgJiYgYXNzZXJ0KCBpc0Zpbml0ZSggeCApLCAnc2NhbGVzIHNob3VsZCBiZSBmaW5pdGUnICk7XG4gICAgICBpZiAoIHkgPT09IHVuZGVmaW5lZCB8fCB0eXBlb2YgeSA9PT0gJ2Jvb2xlYW4nICkge1xuICAgICAgICAvLyBzY2FsZSggc2NhbGUsIFtwcmVwZW5kSW5zdGVhZF0gKVxuICAgICAgICB0aGlzLnNjYWxlKCB4LCB4LCB5ICk7XG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgLy8gc2NhbGUoIHgsIHksIFtwcmVwZW5kSW5zdGVhZF0gKVxuICAgICAgICBhc3NlcnQgJiYgYXNzZXJ0KCBpc0Zpbml0ZSggeSApLCAnc2NhbGVzIHNob3VsZCBiZSBmaW5pdGUgbnVtYmVycycgKTtcbiAgICAgICAgYXNzZXJ0ICYmIGFzc2VydCggcHJlcGVuZEluc3RlYWQgPT09IHVuZGVmaW5lZCB8fCB0eXBlb2YgcHJlcGVuZEluc3RlYWQgPT09ICdib29sZWFuJywgJ0lmIHByb3ZpZGVkLCBwcmVwZW5kSW5zdGVhZCBzaG91bGQgYmUgYm9vbGVhbicgKTtcblxuICAgICAgICBpZiAoIHggPT09IDEgJiYgeSA9PT0gMSApIHsgcmV0dXJuOyB9IC8vIGJhaWwgb3V0IGlmIHdlIGFyZSBzY2FsaW5nIGJ5IDEgKGlkZW50aXR5KVxuICAgICAgICBpZiAoIHByZXBlbmRJbnN0ZWFkICkge1xuICAgICAgICAgIHRoaXMucHJlcGVuZE1hdHJpeCggTWF0cml4My5zY2FsaW5nKCB4LCB5ICkgKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICB0aGlzLmFwcGVuZE1hdHJpeCggTWF0cml4My5zY2FsaW5nKCB4LCB5ICkgKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIC8vIHNjYWxlKCB2ZWN0b3IsIFtwcmVwZW5kSW5zdGVhZF0gKVxuICAgICAgY29uc3QgdmVjdG9yID0geDtcbiAgICAgIGFzc2VydCAmJiBhc3NlcnQoIHZlY3Rvci5pc0Zpbml0ZSgpLCAnc2NhbGUgc2hvdWxkIGJlIGEgZmluaXRlIFZlY3RvcjIgaWYgbm90IGEgZmluaXRlIG51bWJlcicgKTtcbiAgICAgIHRoaXMuc2NhbGUoIHZlY3Rvci54LCB2ZWN0b3IueSwgeSBhcyBib29sZWFuICk7IC8vIGZvcndhcmQgdG8gZnVsbCB2ZXJzaW9uXG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFJvdGF0ZXMgdGhlIG5vZGUncyB0cmFuc2Zvcm0uIFRoZSBkZWZhdWx0IFwiYXBwZW5kc1wiIHRoZSB0cmFuc2Zvcm0sIHNvIHRoYXQgaXQgd2lsbFxuICAgKiBhcHBlYXIgdG8gaGFwcGVuIHRvIHRoZSBOb2RlIGJlZm9yZSB0aGUgcmVzdCBvZiB0aGUgdHJhbnNmb3JtIHdvdWxkIGFwcGx5LCBidXQgaWYgXCJwcmVwZW5kZWRcIiwgdGhlIHJlc3Qgb2YgdGhlXG4gICAqIHRyYW5zZm9ybSB3b3VsZCBhcHBseSBmaXJzdC5cbiAgICpcbiAgICogQXMgYW4gZXhhbXBsZSwgaWYgYSBOb2RlIGlzIHRyYW5zbGF0ZWQgdG8gKDEwMCwwKTpcbiAgICogcm90YXRlKCBNYXRoLlBJICkgd2lsbCByb3RhdGUgdGhlIE5vZGUgYXJvdW5kICgxMDAsMClcbiAgICogcm90YXRlKCBNYXRoLlBJLCB0cnVlICkgd2lsbCByb3RhdGUgdGhlIE5vZGUgYXJvdW5kIHRoZSBvcmlnaW4sIG1vdmluZyBpdCB0byAoLTEwMCwwKVxuICAgKlxuICAgKiBAcGFyYW0gYW5nbGUgLSBUaGUgYW5nbGUgKGluIHJhZGlhbnMpIHRvIHJvdGF0ZSBieVxuICAgKiBAcGFyYW0gW3ByZXBlbmRJbnN0ZWFkXSAtIFdoZXRoZXIgdGhlIHRyYW5zZm9ybSBzaG91bGQgYmUgcHJlcGVuZGVkIChkZWZhdWx0cyB0byBmYWxzZSlcbiAgICovXG4gIHB1YmxpYyByb3RhdGUoIGFuZ2xlOiBudW1iZXIsIHByZXBlbmRJbnN0ZWFkPzogYm9vbGVhbiApOiB2b2lkIHtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBpc0Zpbml0ZSggYW5nbGUgKSwgJ2FuZ2xlIHNob3VsZCBiZSBhIGZpbml0ZSBudW1iZXInICk7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggcHJlcGVuZEluc3RlYWQgPT09IHVuZGVmaW5lZCB8fCB0eXBlb2YgcHJlcGVuZEluc3RlYWQgPT09ICdib29sZWFuJyApO1xuICAgIGlmICggYW5nbGUgJSAoIDIgKiBNYXRoLlBJICkgPT09IDAgKSB7IHJldHVybjsgfSAvLyBiYWlsIG91dCBpZiBvdXIgYW5nbGUgaXMgZWZmZWN0aXZlbHkgMFxuICAgIGlmICggcHJlcGVuZEluc3RlYWQgKSB7XG4gICAgICB0aGlzLnByZXBlbmRNYXRyaXgoIE1hdHJpeDMucm90YXRpb24yKCBhbmdsZSApICk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgdGhpcy5hcHBlbmRNYXRyaXgoIE1hdHJpeDMucm90YXRpb24yKCBhbmdsZSApICk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFJvdGF0ZXMgdGhlIG5vZGUncyB0cmFuc2Zvcm0gYXJvdW5kIGEgc3BlY2lmaWMgcG9pbnQgKGluIHRoZSBwYXJlbnQgY29vcmRpbmF0ZSBmcmFtZSkgYnkgcHJlcGVuZGluZyB0aGUgdHJhbnNmb3JtLlxuICAgKlxuICAgKiBUT0RPOiBkZXRlcm1pbmUgd2hldGhlciB0aGlzIHNob3VsZCB1c2UgdGhlIGFwcGVuZE1hdHJpeCBtZXRob2QgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3NjZW5lcnkvaXNzdWVzLzE1ODFcbiAgICpcbiAgICogQHBhcmFtIHBvaW50IC0gSW4gdGhlIHBhcmVudCBjb29yZGluYXRlIGZyYW1lXG4gICAqIEBwYXJhbSBhbmdsZSAtIEluIHJhZGlhbnNcbiAgICovXG4gIHB1YmxpYyByb3RhdGVBcm91bmQoIHBvaW50OiBWZWN0b3IyLCBhbmdsZTogbnVtYmVyICk6IHRoaXMge1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIHBvaW50LmlzRmluaXRlKCksICdwb2ludCBzaG91bGQgYmUgYSBmaW5pdGUgVmVjdG9yMicgKTtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBpc0Zpbml0ZSggYW5nbGUgKSwgJ2FuZ2xlIHNob3VsZCBiZSBhIGZpbml0ZSBudW1iZXInICk7XG5cbiAgICBsZXQgbWF0cml4ID0gTWF0cml4My50cmFuc2xhdGlvbiggLXBvaW50LngsIC1wb2ludC55ICk7XG4gICAgbWF0cml4ID0gTWF0cml4My5yb3RhdGlvbjIoIGFuZ2xlICkudGltZXNNYXRyaXgoIG1hdHJpeCApO1xuICAgIG1hdHJpeCA9IE1hdHJpeDMudHJhbnNsYXRpb24oIHBvaW50LngsIHBvaW50LnkgKS50aW1lc01hdHJpeCggbWF0cml4ICk7XG4gICAgdGhpcy5wcmVwZW5kTWF0cml4KCBtYXRyaXggKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBTaGlmdHMgdGhlIHggY29vcmRpbmF0ZSAoaW4gdGhlIHBhcmVudCBjb29yZGluYXRlIGZyYW1lKSBvZiB3aGVyZSB0aGUgbm9kZSdzIG9yaWdpbiBpcyB0cmFuc2Zvcm1lZCB0by5cbiAgICovXG4gIHB1YmxpYyBzZXRYKCB4OiBudW1iZXIgKTogdGhpcyB7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggaXNGaW5pdGUoIHggKSwgJ3ggc2hvdWxkIGJlIGEgZmluaXRlIG51bWJlcicgKTtcblxuICAgIHRoaXMudHJhbnNsYXRlKCB4IC0gdGhpcy5nZXRYKCksIDAsIHRydWUgKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBTZWUgc2V0WCgpIGZvciBtb3JlIGluZm9ybWF0aW9uXG4gICAqL1xuICBwdWJsaWMgc2V0IHgoIHZhbHVlOiBudW1iZXIgKSB7XG4gICAgdGhpcy5zZXRYKCB2YWx1ZSApO1xuICB9XG5cbiAgLyoqXG4gICAqIFNlZSBnZXRYKCkgZm9yIG1vcmUgaW5mb3JtYXRpb25cbiAgICovXG4gIHB1YmxpYyBnZXQgeCgpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLmdldFgoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSB4IGNvb3JkaW5hdGUgKGluIHRoZSBwYXJlbnQgY29vcmRpbmF0ZSBmcmFtZSkgb2Ygd2hlcmUgdGhlIG5vZGUncyBvcmlnaW4gaXMgdHJhbnNmb3JtZWQgdG8uXG4gICAqL1xuICBwdWJsaWMgZ2V0WCgpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLl90cmFuc2Zvcm0uZ2V0TWF0cml4KCkubTAyKCk7XG4gIH1cblxuICAvKipcbiAgICogU2hpZnRzIHRoZSB5IGNvb3JkaW5hdGUgKGluIHRoZSBwYXJlbnQgY29vcmRpbmF0ZSBmcmFtZSkgb2Ygd2hlcmUgdGhlIG5vZGUncyBvcmlnaW4gaXMgdHJhbnNmb3JtZWQgdG8uXG4gICAqL1xuICBwdWJsaWMgc2V0WSggeTogbnVtYmVyICk6IHRoaXMge1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIGlzRmluaXRlKCB5ICksICd5IHNob3VsZCBiZSBhIGZpbml0ZSBudW1iZXInICk7XG5cbiAgICB0aGlzLnRyYW5zbGF0ZSggMCwgeSAtIHRoaXMuZ2V0WSgpLCB0cnVlICk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogU2VlIHNldFkoKSBmb3IgbW9yZSBpbmZvcm1hdGlvblxuICAgKi9cbiAgcHVibGljIHNldCB5KCB2YWx1ZTogbnVtYmVyICkge1xuICAgIHRoaXMuc2V0WSggdmFsdWUgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZWUgZ2V0WSgpIGZvciBtb3JlIGluZm9ybWF0aW9uXG4gICAqL1xuICBwdWJsaWMgZ2V0IHkoKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5nZXRZKCk7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgeSBjb29yZGluYXRlIChpbiB0aGUgcGFyZW50IGNvb3JkaW5hdGUgZnJhbWUpIG9mIHdoZXJlIHRoZSBub2RlJ3Mgb3JpZ2luIGlzIHRyYW5zZm9ybWVkIHRvLlxuICAgKi9cbiAgcHVibGljIGdldFkoKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5fdHJhbnNmb3JtLmdldE1hdHJpeCgpLm0xMigpO1xuICB9XG5cbiAgLyoqXG4gICAqIFR5cGljYWxseSB3aXRob3V0IHJvdGF0aW9ucyBvciBuZWdhdGl2ZSBwYXJhbWV0ZXJzLCB0aGlzIHNldHMgdGhlIHNjYWxlIGZvciBlYWNoIGF4aXMuIEluIGl0cyBtb3JlIGdlbmVyYWwgZm9ybSxcbiAgICogaXQgbW9kaWZpZXMgdGhlIG5vZGUncyB0cmFuc2Zvcm0gc28gdGhhdDpcbiAgICogLSBUcmFuc2Zvcm1pbmcgKDEsMCkgd2l0aCBvdXIgdHJhbnNmb3JtIHdpbGwgcmVzdWx0IGluIGEgdmVjdG9yIHdpdGggbWFnbml0dWRlIGFicyggeC1zY2FsZS1tYWduaXR1ZGUgKVxuICAgKiAtIFRyYW5zZm9ybWluZyAoMCwxKSB3aXRoIG91ciB0cmFuc2Zvcm0gd2lsbCByZXN1bHQgaW4gYSB2ZWN0b3Igd2l0aCBtYWduaXR1ZGUgYWJzKCB5LXNjYWxlLW1hZ25pdHVkZSApXG4gICAqIC0gSWYgcGFyYW1ldGVycyBhcmUgbmVnYXRpdmUsIGl0IHdpbGwgZmxpcCBvcmllbnRhdGlvbiBpbiB0aGF0IGRpcmVjdC5cbiAgICpcbiAgICogQWxsb3dlZCBjYWxsIHNpZ25hdHVyZXM6XG4gICAqIHNldFNjYWxlTWFnbml0dWRlKCBzIClcbiAgICogc2V0U2NhbGVNYWduaXR1ZGUoIHN4LCBzeSApXG4gICAqIHNldFNjYWxlTWFnbml0dWRlKCB2ZWN0b3IgKVxuICAgKlxuICAgKiBAcGFyYW0gYSAtIFNjYWxlIGZvciBib3RoIGF4ZXMsIG9yIHNjYWxlIGZvciB4LWF4aXMgaWYgdXNpbmcgdGhlIDItcGFyYW1ldGVyIGNhbGxcbiAgICogQHBhcmFtIFtiXSAtIFNjYWxlIGZvciB0aGUgWSBheGlzIChvbmx5IGZvciB0aGUgMi1wYXJhbWV0ZXIgY2FsbClcbiAgICovXG4gIHB1YmxpYyBzZXRTY2FsZU1hZ25pdHVkZSggczogbnVtYmVyICk6IHRoaXM7XG4gIHNldFNjYWxlTWFnbml0dWRlKCB2OiBWZWN0b3IyICk6IHRoaXM7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L2V4cGxpY2l0LW1lbWJlci1hY2Nlc3NpYmlsaXR5XG4gIHNldFNjYWxlTWFnbml0dWRlKCBzeDogbnVtYmVyLCBzeTogbnVtYmVyICk6IHRoaXM7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L2V4cGxpY2l0LW1lbWJlci1hY2Nlc3NpYmlsaXR5XG4gIHNldFNjYWxlTWFnbml0dWRlKCBhOiBudW1iZXIgfCBWZWN0b3IyLCBiPzogbnVtYmVyICk6IHRoaXMgeyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9leHBsaWNpdC1tZW1iZXItYWNjZXNzaWJpbGl0eVxuICAgIGNvbnN0IGN1cnJlbnRTY2FsZSA9IHRoaXMuZ2V0U2NhbGVWZWN0b3IoKTtcblxuICAgIGlmICggdHlwZW9mIGEgPT09ICdudW1iZXInICkge1xuICAgICAgaWYgKCBiID09PSB1bmRlZmluZWQgKSB7XG4gICAgICAgIC8vIHRvIG1hcCBzZXRTY2FsZU1hZ25pdHVkZSggc2NhbGUgKSA9PiBzZXRTY2FsZU1hZ25pdHVkZSggc2NhbGUsIHNjYWxlIClcbiAgICAgICAgYiA9IGE7XG4gICAgICB9XG4gICAgICBhc3NlcnQgJiYgYXNzZXJ0KCBpc0Zpbml0ZSggYSApLCAnc2V0U2NhbGVNYWduaXR1ZGUgcGFyYW1ldGVycyBzaG91bGQgYmUgZmluaXRlIG51bWJlcnMnICk7XG4gICAgICBhc3NlcnQgJiYgYXNzZXJ0KCBpc0Zpbml0ZSggYiApLCAnc2V0U2NhbGVNYWduaXR1ZGUgcGFyYW1ldGVycyBzaG91bGQgYmUgZmluaXRlIG51bWJlcnMnICk7XG4gICAgICAvLyBzZXRTY2FsZU1hZ25pdHVkZSggeCwgeSApXG4gICAgICB0aGlzLmFwcGVuZE1hdHJpeCggTWF0cml4My5zY2FsaW5nKCBhIC8gY3VycmVudFNjYWxlLngsIGIgLyBjdXJyZW50U2NhbGUueSApICk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgLy8gc2V0U2NhbGVNYWduaXR1ZGUoIHZlY3RvciApLCB3aGVyZSB3ZSBzZXQgdGhlIHgtc2NhbGUgdG8gdmVjdG9yLnggYW5kIHktc2NhbGUgdG8gdmVjdG9yLnlcbiAgICAgIGFzc2VydCAmJiBhc3NlcnQoIGEuaXNGaW5pdGUoKSwgJ2ZpcnN0IHBhcmFtZXRlciBzaG91bGQgYmUgYSBmaW5pdGUgVmVjdG9yMicgKTtcblxuICAgICAgdGhpcy5hcHBlbmRNYXRyaXgoIE1hdHJpeDMuc2NhbGluZyggYS54IC8gY3VycmVudFNjYWxlLngsIGEueSAvIGN1cnJlbnRTY2FsZS55ICkgKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyBhIHZlY3RvciB3aXRoIGFuIGVudHJ5IGZvciBlYWNoIGF4aXMsIGUuZy4gKDUsMikgZm9yIGFuIGFmZmluZSBtYXRyaXggd2l0aCByb3dzICgoNSwwLDApLCgwLDIsMCksKDAsMCwxKSkuXG4gICAqXG4gICAqIEl0IGlzIGVxdWl2YWxlbnQgdG86XG4gICAqICggVCgxLDApLm1hZ25pdHVkZSgpLCBUKDAsMSkubWFnbml0dWRlKCkgKSB3aGVyZSBUKCkgdHJhbnNmb3JtcyBwb2ludHMgd2l0aCBvdXIgdHJhbnNmb3JtLlxuICAgKi9cbiAgcHVibGljIGdldFNjYWxlVmVjdG9yKCk6IFZlY3RvcjIge1xuICAgIHJldHVybiB0aGlzLl90cmFuc2Zvcm0uZ2V0TWF0cml4KCkuZ2V0U2NhbGVWZWN0b3IoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSb3RhdGVzIHRoaXMgbm9kZSdzIHRyYW5zZm9ybSBzbyB0aGF0IGEgdW5pdCAoMSwwKSB2ZWN0b3Igd291bGQgYmUgcm90YXRlZCBieSB0aGlzIG5vZGUncyB0cmFuc2Zvcm0gYnkgdGhlXG4gICAqIHNwZWNpZmllZCBhbW91bnQuXG4gICAqXG4gICAqIEBwYXJhbSByb3RhdGlvbiAtIEluIHJhZGlhbnNcbiAgICovXG4gIHB1YmxpYyBzZXRSb3RhdGlvbiggcm90YXRpb246IG51bWJlciApOiB0aGlzIHtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBpc0Zpbml0ZSggcm90YXRpb24gKSxcbiAgICAgICdyb3RhdGlvbiBzaG91bGQgYmUgYSBmaW5pdGUgbnVtYmVyJyApO1xuXG4gICAgdGhpcy5hcHBlbmRNYXRyaXgoIHNjcmF0Y2hNYXRyaXgzLnNldFRvUm90YXRpb25aKCByb3RhdGlvbiAtIHRoaXMuZ2V0Um90YXRpb24oKSApICk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogU2VlIHNldFJvdGF0aW9uKCkgZm9yIG1vcmUgaW5mb3JtYXRpb25cbiAgICovXG4gIHB1YmxpYyBzZXQgcm90YXRpb24oIHZhbHVlOiBudW1iZXIgKSB7XG4gICAgdGhpcy5zZXRSb3RhdGlvbiggdmFsdWUgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZWUgZ2V0Um90YXRpb24oKSBmb3IgbW9yZSBpbmZvcm1hdGlvblxuICAgKi9cbiAgcHVibGljIGdldCByb3RhdGlvbigpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLmdldFJvdGF0aW9uKCk7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgcm90YXRpb24gKGluIHJhZGlhbnMpIHRoYXQgd291bGQgYmUgYXBwbGllZCB0byBhIHVuaXQgKDEsMCkgdmVjdG9yIHdoZW4gdHJhbnNmb3JtZWQgd2l0aCB0aGlzIE5vZGUnc1xuICAgKiB0cmFuc2Zvcm0uXG4gICAqL1xuICBwdWJsaWMgZ2V0Um90YXRpb24oKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5fdHJhbnNmb3JtLmdldE1hdHJpeCgpLmdldFJvdGF0aW9uKCk7XG4gIH1cblxuICAvKipcbiAgICogTW9kaWZpZXMgdGhlIHRyYW5zbGF0aW9uIG9mIHRoaXMgTm9kZSdzIHRyYW5zZm9ybSBzbyB0aGF0IHRoZSBub2RlJ3MgbG9jYWwtY29vcmRpbmF0ZSBvcmlnaW4gd2lsbCBiZSB0cmFuc2Zvcm1lZFxuICAgKiB0byB0aGUgcGFzc2VkLWluIHgveS5cbiAgICpcbiAgICogQWxsb3dlZCBjYWxsIHNpZ25hdHVyZXM6XG4gICAqIHNldFRyYW5zbGF0aW9uKCB4LCB5IClcbiAgICogc2V0VHJhbnNsYXRpb24oIHZlY3RvciApXG4gICAqXG4gICAqIEBwYXJhbSBhIC0gWCB0cmFuc2xhdGlvbiAtIG9yIFZlY3RvciB3aXRoIHgveSB0cmFuc2xhdGlvbiBpbiBjb21wb25lbnRzXG4gICAqIEBwYXJhbSBbYl0gLSBZIHRyYW5zbGF0aW9uXG4gICAqL1xuICBwdWJsaWMgc2V0VHJhbnNsYXRpb24oIHg6IG51bWJlciwgeTogbnVtYmVyICk6IHRoaXM7XG4gIHNldFRyYW5zbGF0aW9uKCB2OiBWZWN0b3IyICk6IHRoaXM7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L2V4cGxpY2l0LW1lbWJlci1hY2Nlc3NpYmlsaXR5XG4gIHNldFRyYW5zbGF0aW9uKCBhOiBudW1iZXIgfCBWZWN0b3IyLCBiPzogbnVtYmVyICk6IHRoaXMgeyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9leHBsaWNpdC1tZW1iZXItYWNjZXNzaWJpbGl0eVxuICAgIGNvbnN0IG0gPSB0aGlzLl90cmFuc2Zvcm0uZ2V0TWF0cml4KCk7XG4gICAgY29uc3QgdHggPSBtLm0wMigpO1xuICAgIGNvbnN0IHR5ID0gbS5tMTIoKTtcblxuICAgIGxldCBkeDtcbiAgICBsZXQgZHk7XG5cbiAgICBpZiAoIHR5cGVvZiBhID09PSAnbnVtYmVyJyApIHtcbiAgICAgIGFzc2VydCAmJiBhc3NlcnQoIGlzRmluaXRlKCBhICksICdQYXJhbWV0ZXJzIHRvIHNldFRyYW5zbGF0aW9uIHNob3VsZCBiZSBmaW5pdGUgbnVtYmVycycgKTtcbiAgICAgIGFzc2VydCAmJiBhc3NlcnQoIGIgIT09IHVuZGVmaW5lZCAmJiBpc0Zpbml0ZSggYiApLCAnUGFyYW1ldGVycyB0byBzZXRUcmFuc2xhdGlvbiBzaG91bGQgYmUgZmluaXRlIG51bWJlcnMnICk7XG4gICAgICBkeCA9IGEgLSB0eDtcbiAgICAgIGR5ID0gYiEgLSB0eTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICBhc3NlcnQgJiYgYXNzZXJ0KCBhLmlzRmluaXRlKCksICdTaG91bGQgYmUgYSBmaW5pdGUgVmVjdG9yMicgKTtcbiAgICAgIGR4ID0gYS54IC0gdHg7XG4gICAgICBkeSA9IGEueSAtIHR5O1xuICAgIH1cblxuICAgIHRoaXMudHJhbnNsYXRlKCBkeCwgZHksIHRydWUgKTtcblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIFNlZSBzZXRUcmFuc2xhdGlvbigpIGZvciBtb3JlIGluZm9ybWF0aW9uIC0gdGhpcyBzaG91bGQgb25seSBiZSB1c2VkIHdpdGggVmVjdG9yMlxuICAgKi9cbiAgcHVibGljIHNldCB0cmFuc2xhdGlvbiggdmFsdWU6IFZlY3RvcjIgKSB7XG4gICAgdGhpcy5zZXRUcmFuc2xhdGlvbiggdmFsdWUgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZWUgZ2V0VHJhbnNsYXRpb24oKSBmb3IgbW9yZSBpbmZvcm1hdGlvblxuICAgKi9cbiAgcHVibGljIGdldCB0cmFuc2xhdGlvbigpOiBWZWN0b3IyIHtcbiAgICByZXR1cm4gdGhpcy5nZXRUcmFuc2xhdGlvbigpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgYSB2ZWN0b3Igb2Ygd2hlcmUgdGhpcyBOb2RlJ3MgbG9jYWwtY29vcmRpbmF0ZSBvcmlnaW4gd2lsbCBiZSB0cmFuc2Zvcm1lZCBieSBpdCdzIG93biB0cmFuc2Zvcm0uXG4gICAqL1xuICBwdWJsaWMgZ2V0VHJhbnNsYXRpb24oKTogVmVjdG9yMiB7XG4gICAgY29uc3QgbWF0cml4ID0gdGhpcy5fdHJhbnNmb3JtLmdldE1hdHJpeCgpO1xuICAgIHJldHVybiBuZXcgVmVjdG9yMiggbWF0cml4Lm0wMigpLCBtYXRyaXgubTEyKCkgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBcHBlbmRzIGEgdHJhbnNmb3JtYXRpb24gbWF0cml4IHRvIHRoaXMgTm9kZSdzIHRyYW5zZm9ybS4gQXBwZW5kaW5nIG1lYW5zIHRoaXMgdHJhbnNmb3JtIGlzIGNvbmNlcHR1YWxseSBhcHBsaWVkXG4gICAqIGZpcnN0IGJlZm9yZSB0aGUgcmVzdCBvZiB0aGUgTm9kZSdzIGN1cnJlbnQgdHJhbnNmb3JtIChpLmUuIGFwcGxpZWQgaW4gdGhlIGxvY2FsIGNvb3JkaW5hdGUgZnJhbWUpLlxuICAgKi9cbiAgcHVibGljIGFwcGVuZE1hdHJpeCggbWF0cml4OiBNYXRyaXgzICk6IHZvaWQge1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIG1hdHJpeC5pc0Zpbml0ZSgpLCAnbWF0cml4IHNob3VsZCBiZSBhIGZpbml0ZSBNYXRyaXgzJyApO1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIG1hdHJpeC5nZXREZXRlcm1pbmFudCgpICE9PSAwLCAnbWF0cml4IHNob3VsZCBub3QgbWFwIHBsYW5lIHRvIGEgbGluZSBvciBwb2ludCcgKTtcbiAgICB0aGlzLl90cmFuc2Zvcm0uYXBwZW5kKCBtYXRyaXggKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBQcmVwZW5kcyBhIHRyYW5zZm9ybWF0aW9uIG1hdHJpeCB0byB0aGlzIE5vZGUncyB0cmFuc2Zvcm0uIFByZXBlbmRpbmcgbWVhbnMgdGhpcyB0cmFuc2Zvcm0gaXMgY29uY2VwdHVhbGx5IGFwcGxpZWRcbiAgICogYWZ0ZXIgdGhlIHJlc3Qgb2YgdGhlIE5vZGUncyBjdXJyZW50IHRyYW5zZm9ybSAoaS5lLiBhcHBsaWVkIGluIHRoZSBwYXJlbnQgY29vcmRpbmF0ZSBmcmFtZSkuXG4gICAqL1xuICBwdWJsaWMgcHJlcGVuZE1hdHJpeCggbWF0cml4OiBNYXRyaXgzICk6IHZvaWQge1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIG1hdHJpeC5pc0Zpbml0ZSgpLCAnbWF0cml4IHNob3VsZCBiZSBhIGZpbml0ZSBNYXRyaXgzJyApO1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIG1hdHJpeC5nZXREZXRlcm1pbmFudCgpICE9PSAwLCAnbWF0cml4IHNob3VsZCBub3QgbWFwIHBsYW5lIHRvIGEgbGluZSBvciBwb2ludCcgKTtcbiAgICB0aGlzLl90cmFuc2Zvcm0ucHJlcGVuZCggbWF0cml4ICk7XG4gIH1cblxuICAvKipcbiAgICogUHJlcGVuZHMgYW4gKHgseSkgdHJhbnNsYXRpb24gdG8gb3VyIE5vZGUncyB0cmFuc2Zvcm0gaW4gYW4gZWZmaWNpZW50IG1hbm5lciB3aXRob3V0IGFsbG9jYXRpbmcgYSBtYXRyaXguXG4gICAqIHNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvc2NlbmVyeS9pc3N1ZXMvMTE5XG4gICAqL1xuICBwdWJsaWMgcHJlcGVuZFRyYW5zbGF0aW9uKCB4OiBudW1iZXIsIHk6IG51bWJlciApOiB2b2lkIHtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBpc0Zpbml0ZSggeCApLCAneCBzaG91bGQgYmUgYSBmaW5pdGUgbnVtYmVyJyApO1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIGlzRmluaXRlKCB5ICksICd5IHNob3VsZCBiZSBhIGZpbml0ZSBudW1iZXInICk7XG5cbiAgICBpZiAoICF4ICYmICF5ICkgeyByZXR1cm47IH0gLy8gYmFpbCBvdXQgaWYgYm90aCBhcmUgemVyb1xuXG4gICAgdGhpcy5fdHJhbnNmb3JtLnByZXBlbmRUcmFuc2xhdGlvbiggeCwgeSApO1xuICB9XG5cbiAgLyoqXG4gICAqIENoYW5nZXMgdGhpcyBOb2RlJ3MgdHJhbnNmb3JtIHRvIG1hdGNoIHRoZSBwYXNzZWQtaW4gdHJhbnNmb3JtYXRpb24gbWF0cml4LlxuICAgKi9cbiAgcHVibGljIHNldE1hdHJpeCggbWF0cml4OiBNYXRyaXgzICk6IHZvaWQge1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIG1hdHJpeC5pc0Zpbml0ZSgpLCAnbWF0cml4IHNob3VsZCBiZSBhIGZpbml0ZSBNYXRyaXgzJyApO1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIG1hdHJpeC5nZXREZXRlcm1pbmFudCgpICE9PSAwLCAnbWF0cml4IHNob3VsZCBub3QgbWFwIHBsYW5lIHRvIGEgbGluZSBvciBwb2ludCcgKTtcblxuICAgIHRoaXMuX3RyYW5zZm9ybS5zZXRNYXRyaXgoIG1hdHJpeCApO1xuICB9XG5cbiAgLyoqXG4gICAqIFNlZSBzZXRNYXRyaXgoKSBmb3IgbW9yZSBpbmZvcm1hdGlvblxuICAgKi9cbiAgcHVibGljIHNldCBtYXRyaXgoIHZhbHVlOiBNYXRyaXgzICkge1xuICAgIHRoaXMuc2V0TWF0cml4KCB2YWx1ZSApO1xuICB9XG5cbiAgLyoqXG4gICAqIFNlZSBnZXRNYXRyaXgoKSBmb3IgbW9yZSBpbmZvcm1hdGlvblxuICAgKi9cbiAgcHVibGljIGdldCBtYXRyaXgoKTogTWF0cml4MyB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0TWF0cml4KCk7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyBhIE1hdHJpeDMgcmVwcmVzZW50aW5nIG91ciBOb2RlJ3MgdHJhbnNmb3JtLlxuICAgKlxuICAgKiBOT1RFOiBEbyBub3QgbXV0YXRlIHRoZSByZXR1cm5lZCBtYXRyaXguXG4gICAqL1xuICBwdWJsaWMgZ2V0TWF0cml4KCk6IE1hdHJpeDMge1xuICAgIHJldHVybiB0aGlzLl90cmFuc2Zvcm0uZ2V0TWF0cml4KCk7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyBhIHJlZmVyZW5jZSB0byBvdXIgTm9kZSdzIHRyYW5zZm9ybVxuICAgKi9cbiAgcHVibGljIGdldFRyYW5zZm9ybSgpOiBUcmFuc2Zvcm0zIHtcbiAgICAvLyBmb3Igbm93LCByZXR1cm4gYW4gYWN0dWFsIGNvcHkuIHdlIGNhbiBjb25zaWRlciBsaXN0ZW5pbmcgdG8gY2hhbmdlcyBpbiB0aGUgZnV0dXJlXG4gICAgcmV0dXJuIHRoaXMuX3RyYW5zZm9ybTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZWUgZ2V0VHJhbnNmb3JtKCkgZm9yIG1vcmUgaW5mb3JtYXRpb25cbiAgICovXG4gIHB1YmxpYyBnZXQgdHJhbnNmb3JtKCk6IFRyYW5zZm9ybTMge1xuICAgIHJldHVybiB0aGlzLmdldFRyYW5zZm9ybSgpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlc2V0cyBvdXIgTm9kZSdzIHRyYW5zZm9ybSB0byBhbiBpZGVudGl0eSB0cmFuc2Zvcm0gKGkuZS4gbm8gdHJhbnNmb3JtIGlzIGFwcGxpZWQpLlxuICAgKi9cbiAgcHVibGljIHJlc2V0VHJhbnNmb3JtKCk6IHZvaWQge1xuICAgIHRoaXMuc2V0TWF0cml4KCBNYXRyaXgzLklERU5USVRZICk7XG4gIH1cblxuICAvKipcbiAgICogQ2FsbGJhY2sgZnVuY3Rpb24gdGhhdCBzaG91bGQgYmUgY2FsbGVkIHdoZW4gb3VyIHRyYW5zZm9ybSBpcyBjaGFuZ2VkLlxuICAgKi9cbiAgcHJpdmF0ZSBvblRyYW5zZm9ybUNoYW5nZSgpOiB2b2lkIHtcbiAgICAvLyBUT0RPOiB3aHkgaXMgbG9jYWwgYm91bmRzIGludmFsaWRhdGlvbiBuZWVkZWQgaGVyZT8gaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3NjZW5lcnkvaXNzdWVzLzE1ODFcbiAgICB0aGlzLmludmFsaWRhdGVCb3VuZHMoKTtcblxuICAgIHRoaXMuX3BpY2tlci5vblRyYW5zZm9ybUNoYW5nZSgpO1xuICAgIGlmICggYXNzZXJ0U2xvdyApIHsgdGhpcy5fcGlja2VyLmF1ZGl0KCk7IH1cblxuICAgIHRoaXMudHJhbnNmb3JtRW1pdHRlci5lbWl0KCk7XG4gIH1cblxuICAvKipcbiAgICogQ2FsbGVkIHdoZW4gb3VyIHN1bW1hcnkgYml0bWFzayBjaGFuZ2VzIChzY2VuZXJ5LWludGVybmFsKVxuICAgKi9cbiAgcHVibGljIG9uU3VtbWFyeUNoYW5nZSggb2xkQml0bWFzazogbnVtYmVyLCBuZXdCaXRtYXNrOiBudW1iZXIgKTogdm9pZCB7XG4gICAgLy8gRGVmaW5lZCBpbiBQYXJhbGxlbERPTS5qc1xuICAgIHRoaXMuX3Bkb21EaXNwbGF5c0luZm8ub25TdW1tYXJ5Q2hhbmdlKCBvbGRCaXRtYXNrLCBuZXdCaXRtYXNrICk7XG4gIH1cblxuICAvKipcbiAgICogVXBkYXRlcyBvdXIgbm9kZSdzIHNjYWxlIGFuZCBhcHBsaWVkIHNjYWxlIGZhY3RvciBpZiB3ZSBuZWVkIHRvIGNoYW5nZSBvdXIgc2NhbGUgdG8gZml0IHdpdGhpbiB0aGUgbWF4aW11bVxuICAgKiBkaW1lbnNpb25zIChtYXhXaWR0aCBhbmQgbWF4SGVpZ2h0KS4gU2VlIGRvY3VtZW50YXRpb24gaW4gY29uc3RydWN0b3IgZm9yIGRldGFpbGVkIGJlaGF2aW9yLlxuICAgKi9cbiAgcHJpdmF0ZSB1cGRhdGVNYXhEaW1lbnNpb24oIGxvY2FsQm91bmRzOiBCb3VuZHMyICk6IHZvaWQge1xuICAgIGFzc2VydCAmJiB0aGlzLmF1ZGl0TWF4RGltZW5zaW9ucygpO1xuXG4gICAgY29uc3QgY3VycmVudFNjYWxlID0gdGhpcy5fYXBwbGllZFNjYWxlRmFjdG9yO1xuICAgIGxldCBpZGVhbFNjYWxlID0gMTtcblxuICAgIGlmICggdGhpcy5fbWF4V2lkdGggIT09IG51bGwgKSB7XG4gICAgICBjb25zdCB3aWR0aCA9IGxvY2FsQm91bmRzLndpZHRoO1xuICAgICAgaWYgKCB3aWR0aCA+IHRoaXMuX21heFdpZHRoICkge1xuICAgICAgICBpZGVhbFNjYWxlID0gTWF0aC5taW4oIGlkZWFsU2NhbGUsIHRoaXMuX21heFdpZHRoIC8gd2lkdGggKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoIHRoaXMuX21heEhlaWdodCAhPT0gbnVsbCApIHtcbiAgICAgIGNvbnN0IGhlaWdodCA9IGxvY2FsQm91bmRzLmhlaWdodDtcbiAgICAgIGlmICggaGVpZ2h0ID4gdGhpcy5fbWF4SGVpZ2h0ICkge1xuICAgICAgICBpZGVhbFNjYWxlID0gTWF0aC5taW4oIGlkZWFsU2NhbGUsIHRoaXMuX21heEhlaWdodCAvIGhlaWdodCApO1xuICAgICAgfVxuICAgIH1cblxuICAgIGNvbnN0IHNjYWxlQWRqdXN0bWVudCA9IGlkZWFsU2NhbGUgLyBjdXJyZW50U2NhbGU7XG4gICAgaWYgKCBzY2FsZUFkanVzdG1lbnQgIT09IDEgKSB7XG4gICAgICAvLyBTZXQgdGhpcyBmaXJzdCwgZm9yIHN1cHBvcnRpbmcgcmUtZW50cmFuY3kgaWYgb3VyIGNvbnRlbnQgY2hhbmdlcyBiYXNlZCBvbiB0aGUgc2NhbGVcbiAgICAgIHRoaXMuX2FwcGxpZWRTY2FsZUZhY3RvciA9IGlkZWFsU2NhbGU7XG5cbiAgICAgIHRoaXMuc2NhbGUoIHNjYWxlQWRqdXN0bWVudCApO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBTY2VuZXJ5LWludGVybmFsIG1ldGhvZCBmb3IgdmVyaWZ5aW5nIG1heGltdW0gZGltZW5zaW9ucyBhcmUgTk9UIHNtYWxsZXIgdGhhbiBwcmVmZXJyZWQgZGltZW5zaW9uc1xuICAgKiBOT1RFOiBUaGlzIGhhcyB0byBiZSBwdWJsaWMgZHVlIHRvIG1peGlucyBub3QgYWJsZSB0byBhY2Nlc3MgcHJvdGVjdGVkL3ByaXZhdGUgbWV0aG9kc1xuICAgKi9cbiAgcHVibGljIGF1ZGl0TWF4RGltZW5zaW9ucygpOiB2b2lkIHtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0aGlzLl9tYXhXaWR0aCA9PT0gbnVsbCB8fCAhaXNXaWR0aFNpemFibGUoIHRoaXMgKSB8fCB0aGlzLnByZWZlcnJlZFdpZHRoID09PSBudWxsIHx8IHRoaXMuX21heFdpZHRoID49IHRoaXMucHJlZmVycmVkV2lkdGggLSAxZS03LFxuICAgICAgJ0lmIG1heFdpZHRoIGFuZCBwcmVmZXJyZWRXaWR0aCBhcmUgYm90aCBub24tbnVsbCwgbWF4V2lkdGggc2hvdWxkIE5PVCBiZSBzbWFsbGVyIHRoYW4gdGhlIHByZWZlcnJlZFdpZHRoLiBJZiB0aGF0IGhhcHBlbnMsIGl0IHdvdWxkIHRyaWdnZXIgYW4gaW5maW5pdGUgbG9vcCcgKTtcblxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHRoaXMuX21heEhlaWdodCA9PT0gbnVsbCB8fCAhaXNIZWlnaHRTaXphYmxlKCB0aGlzICkgfHwgdGhpcy5wcmVmZXJyZWRIZWlnaHQgPT09IG51bGwgfHwgdGhpcy5fbWF4SGVpZ2h0ID49IHRoaXMucHJlZmVycmVkSGVpZ2h0IC0gMWUtNyxcbiAgICAgICdJZiBtYXhIZWlnaHQgYW5kIHByZWZlcnJlZEhlaWdodCBhcmUgYm90aCBub24tbnVsbCwgbWF4SGVpZ2h0IHNob3VsZCBOT1QgYmUgc21hbGxlciB0aGFuIHRoZSBwcmVmZXJyZWRIZWlnaHQuIElmIHRoYXQgaGFwcGVucywgaXQgd291bGQgdHJpZ2dlciBhbiBpbmZpbml0ZSBsb29wJyApO1xuICB9XG5cbiAgLyoqXG4gICAqIEluY3JlbWVudHMvZGVjcmVtZW50cyBib3VuZHMgXCJsaXN0ZW5lclwiIGNvdW50IGJhc2VkIG9uIHRoZSB2YWx1ZXMgb2YgbWF4V2lkdGgvbWF4SGVpZ2h0IGJlZm9yZSBhbmQgYWZ0ZXIuXG4gICAqIG51bGwgaXMgbGlrZSBubyBsaXN0ZW5lciwgbm9uLW51bGwgaXMgbGlrZSBoYXZpbmcgYSBsaXN0ZW5lciwgc28gd2UgaW5jcmVtZW50IGZvciBudWxsID0+IG5vbi1udWxsLCBhbmRcbiAgICogZGVjcmVtZW50IGZvciBub24tbnVsbCA9PiBudWxsLlxuICAgKi9cbiAgcHJpdmF0ZSBvbk1heERpbWVuc2lvbkNoYW5nZSggYmVmb3JlTWF4TGVuZ3RoOiBudW1iZXIgfCBudWxsLCBhZnRlck1heExlbmd0aDogbnVtYmVyIHwgbnVsbCApOiB2b2lkIHtcbiAgICBpZiAoIGJlZm9yZU1heExlbmd0aCA9PT0gbnVsbCAmJiBhZnRlck1heExlbmd0aCAhPT0gbnVsbCApIHtcbiAgICAgIHRoaXMuY2hhbmdlQm91bmRzRXZlbnRDb3VudCggMSApO1xuICAgICAgdGhpcy5fYm91bmRzRXZlbnRTZWxmQ291bnQrKztcbiAgICB9XG4gICAgZWxzZSBpZiAoIGJlZm9yZU1heExlbmd0aCAhPT0gbnVsbCAmJiBhZnRlck1heExlbmd0aCA9PT0gbnVsbCApIHtcbiAgICAgIHRoaXMuY2hhbmdlQm91bmRzRXZlbnRDb3VudCggLTEgKTtcbiAgICAgIHRoaXMuX2JvdW5kc0V2ZW50U2VsZkNvdW50LS07XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFNldHMgdGhlIG1heGltdW0gd2lkdGggb2YgdGhlIE5vZGUgKHNlZSBjb25zdHJ1Y3RvciBmb3IgZG9jdW1lbnRhdGlvbiBvbiBob3cgbWF4aW11bSBkaW1lbnNpb25zIHdvcmspLlxuICAgKi9cbiAgcHVibGljIHNldE1heFdpZHRoKCBtYXhXaWR0aDogbnVtYmVyIHwgbnVsbCApOiB2b2lkIHtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBtYXhXaWR0aCA9PT0gbnVsbCB8fCAoIHR5cGVvZiBtYXhXaWR0aCA9PT0gJ251bWJlcicgJiYgbWF4V2lkdGggPiAwICksXG4gICAgICAnbWF4V2lkdGggc2hvdWxkIGJlIG51bGwgKG5vIGNvbnN0cmFpbnQpIG9yIGEgcG9zaXRpdmUgbnVtYmVyJyApO1xuXG4gICAgaWYgKCB0aGlzLl9tYXhXaWR0aCAhPT0gbWF4V2lkdGggKSB7XG4gICAgICAvLyB1cGRhdGUgc3ludGhldGljIGJvdW5kcyBsaXN0ZW5lciBjb3VudCAodG8gZW5zdXJlIG91ciBib3VuZHMgYXJlIHZhbGlkYXRlZCBhdCB0aGUgc3RhcnQgb2YgdXBkYXRlRGlzcGxheSlcbiAgICAgIHRoaXMub25NYXhEaW1lbnNpb25DaGFuZ2UoIHRoaXMuX21heFdpZHRoLCBtYXhXaWR0aCApO1xuXG4gICAgICB0aGlzLl9tYXhXaWR0aCA9IG1heFdpZHRoO1xuXG4gICAgICB0aGlzLnVwZGF0ZU1heERpbWVuc2lvbiggdGhpcy5sb2NhbEJvdW5kc1Byb3BlcnR5LnZhbHVlICk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFNlZSBzZXRNYXhXaWR0aCgpIGZvciBtb3JlIGluZm9ybWF0aW9uXG4gICAqL1xuICBwdWJsaWMgc2V0IG1heFdpZHRoKCB2YWx1ZTogbnVtYmVyIHwgbnVsbCApIHtcbiAgICB0aGlzLnNldE1heFdpZHRoKCB2YWx1ZSApO1xuICB9XG5cbiAgLyoqXG4gICAqIFNlZSBnZXRNYXhXaWR0aCgpIGZvciBtb3JlIGluZm9ybWF0aW9uXG4gICAqL1xuICBwdWJsaWMgZ2V0IG1heFdpZHRoKCk6IG51bWJlciB8IG51bGwge1xuICAgIHJldHVybiB0aGlzLmdldE1heFdpZHRoKCk7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgbWF4aW11bSB3aWR0aCAoaWYgYW55KSBvZiB0aGUgTm9kZS5cbiAgICovXG4gIHB1YmxpYyBnZXRNYXhXaWR0aCgpOiBudW1iZXIgfCBudWxsIHtcbiAgICByZXR1cm4gdGhpcy5fbWF4V2lkdGg7XG4gIH1cblxuICAvKipcbiAgICogU2V0cyB0aGUgbWF4aW11bSBoZWlnaHQgb2YgdGhlIE5vZGUgKHNlZSBjb25zdHJ1Y3RvciBmb3IgZG9jdW1lbnRhdGlvbiBvbiBob3cgbWF4aW11bSBkaW1lbnNpb25zIHdvcmspLlxuICAgKi9cbiAgcHVibGljIHNldE1heEhlaWdodCggbWF4SGVpZ2h0OiBudW1iZXIgfCBudWxsICk6IHZvaWQge1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIG1heEhlaWdodCA9PT0gbnVsbCB8fCAoIHR5cGVvZiBtYXhIZWlnaHQgPT09ICdudW1iZXInICYmIG1heEhlaWdodCA+IDAgKSxcbiAgICAgICdtYXhIZWlnaHQgc2hvdWxkIGJlIG51bGwgKG5vIGNvbnN0cmFpbnQpIG9yIGEgcG9zaXRpdmUgbnVtYmVyJyApO1xuXG4gICAgaWYgKCB0aGlzLl9tYXhIZWlnaHQgIT09IG1heEhlaWdodCApIHtcbiAgICAgIC8vIHVwZGF0ZSBzeW50aGV0aWMgYm91bmRzIGxpc3RlbmVyIGNvdW50ICh0byBlbnN1cmUgb3VyIGJvdW5kcyBhcmUgdmFsaWRhdGVkIGF0IHRoZSBzdGFydCBvZiB1cGRhdGVEaXNwbGF5KVxuICAgICAgdGhpcy5vbk1heERpbWVuc2lvbkNoYW5nZSggdGhpcy5fbWF4SGVpZ2h0LCBtYXhIZWlnaHQgKTtcblxuICAgICAgdGhpcy5fbWF4SGVpZ2h0ID0gbWF4SGVpZ2h0O1xuXG4gICAgICB0aGlzLnVwZGF0ZU1heERpbWVuc2lvbiggdGhpcy5sb2NhbEJvdW5kc1Byb3BlcnR5LnZhbHVlICk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFNlZSBzZXRNYXhIZWlnaHQoKSBmb3IgbW9yZSBpbmZvcm1hdGlvblxuICAgKi9cbiAgcHVibGljIHNldCBtYXhIZWlnaHQoIHZhbHVlOiBudW1iZXIgfCBudWxsICkge1xuICAgIHRoaXMuc2V0TWF4SGVpZ2h0KCB2YWx1ZSApO1xuICB9XG5cbiAgLyoqXG4gICAqIFNlZSBnZXRNYXhIZWlnaHQoKSBmb3IgbW9yZSBpbmZvcm1hdGlvblxuICAgKi9cbiAgcHVibGljIGdldCBtYXhIZWlnaHQoKTogbnVtYmVyIHwgbnVsbCB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0TWF4SGVpZ2h0KCk7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgbWF4aW11bSBoZWlnaHQgKGlmIGFueSkgb2YgdGhlIE5vZGUuXG4gICAqL1xuICBwdWJsaWMgZ2V0TWF4SGVpZ2h0KCk6IG51bWJlciB8IG51bGwge1xuICAgIHJldHVybiB0aGlzLl9tYXhIZWlnaHQ7XG4gIH1cblxuICAvKipcbiAgICogU2hpZnRzIHRoaXMgTm9kZSBob3Jpem9udGFsbHkgc28gdGhhdCBpdHMgbGVmdCBib3VuZCAoaW4gdGhlIHBhcmVudCBjb29yZGluYXRlIGZyYW1lKSBpcyBlcXVhbCB0byB0aGUgcGFzc2VkLWluXG4gICAqICdsZWZ0JyBYIHZhbHVlLlxuICAgKlxuICAgKiBOT1RFOiBUaGlzIG1heSByZXF1aXJlIGNvbXB1dGF0aW9uIG9mIHRoaXMgbm9kZSdzIHN1YnRyZWUgYm91bmRzLCB3aGljaCBtYXkgaW5jdXIgc29tZSBwZXJmb3JtYW5jZSBsb3NzLlxuICAgKlxuICAgKiBAcGFyYW0gbGVmdCAtIEFmdGVyIHRoaXMgb3BlcmF0aW9uLCBub2RlLmxlZnQgc2hvdWxkIGFwcHJveGltYXRlbHkgZXF1YWwgdGhpcyB2YWx1ZS5cbiAgICovXG4gIHB1YmxpYyBzZXRMZWZ0KCBsZWZ0OiBudW1iZXIgKTogdGhpcyB7XG4gICAgY29uc3QgY3VycmVudExlZnQgPSB0aGlzLmdldExlZnQoKTtcbiAgICBpZiAoIGlzRmluaXRlKCBjdXJyZW50TGVmdCApICkge1xuICAgICAgdGhpcy50cmFuc2xhdGUoIGxlZnQgLSBjdXJyZW50TGVmdCwgMCwgdHJ1ZSApO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzOyAvLyBhbGxvdyBjaGFpbmluZ1xuICB9XG5cbiAgLyoqXG4gICAqIFNlZSBzZXRMZWZ0KCkgZm9yIG1vcmUgaW5mb3JtYXRpb25cbiAgICovXG4gIHB1YmxpYyBzZXQgbGVmdCggdmFsdWU6IG51bWJlciApIHtcbiAgICB0aGlzLnNldExlZnQoIHZhbHVlICk7XG4gIH1cblxuICAvKipcbiAgICogU2VlIGdldExlZnQoKSBmb3IgbW9yZSBpbmZvcm1hdGlvblxuICAgKi9cbiAgcHVibGljIGdldCBsZWZ0KCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0TGVmdCgpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIFggdmFsdWUgb2YgdGhlIGxlZnQgc2lkZSBvZiB0aGUgYm91bmRpbmcgYm94IG9mIHRoaXMgTm9kZSAoaW4gdGhlIHBhcmVudCBjb29yZGluYXRlIGZyYW1lKS5cbiAgICpcbiAgICogTk9URTogVGhpcyBtYXkgcmVxdWlyZSBjb21wdXRhdGlvbiBvZiB0aGlzIG5vZGUncyBzdWJ0cmVlIGJvdW5kcywgd2hpY2ggbWF5IGluY3VyIHNvbWUgcGVyZm9ybWFuY2UgbG9zcy5cbiAgICovXG4gIHB1YmxpYyBnZXRMZWZ0KCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0Qm91bmRzKCkubWluWDtcbiAgfVxuXG4gIC8qKlxuICAgKiBTaGlmdHMgdGhpcyBOb2RlIGhvcml6b250YWxseSBzbyB0aGF0IGl0cyByaWdodCBib3VuZCAoaW4gdGhlIHBhcmVudCBjb29yZGluYXRlIGZyYW1lKSBpcyBlcXVhbCB0byB0aGUgcGFzc2VkLWluXG4gICAqICdyaWdodCcgWCB2YWx1ZS5cbiAgICpcbiAgICogTk9URTogVGhpcyBtYXkgcmVxdWlyZSBjb21wdXRhdGlvbiBvZiB0aGlzIG5vZGUncyBzdWJ0cmVlIGJvdW5kcywgd2hpY2ggbWF5IGluY3VyIHNvbWUgcGVyZm9ybWFuY2UgbG9zcy5cbiAgICpcbiAgICogQHBhcmFtIHJpZ2h0IC0gQWZ0ZXIgdGhpcyBvcGVyYXRpb24sIG5vZGUucmlnaHQgc2hvdWxkIGFwcHJveGltYXRlbHkgZXF1YWwgdGhpcyB2YWx1ZS5cbiAgICovXG4gIHB1YmxpYyBzZXRSaWdodCggcmlnaHQ6IG51bWJlciApOiB0aGlzIHtcbiAgICBjb25zdCBjdXJyZW50UmlnaHQgPSB0aGlzLmdldFJpZ2h0KCk7XG4gICAgaWYgKCBpc0Zpbml0ZSggY3VycmVudFJpZ2h0ICkgKSB7XG4gICAgICB0aGlzLnRyYW5zbGF0ZSggcmlnaHQgLSBjdXJyZW50UmlnaHQsIDAsIHRydWUgKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXM7IC8vIGFsbG93IGNoYWluaW5nXG4gIH1cblxuICAvKipcbiAgICogU2VlIHNldFJpZ2h0KCkgZm9yIG1vcmUgaW5mb3JtYXRpb25cbiAgICovXG4gIHB1YmxpYyBzZXQgcmlnaHQoIHZhbHVlOiBudW1iZXIgKSB7XG4gICAgdGhpcy5zZXRSaWdodCggdmFsdWUgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZWUgZ2V0UmlnaHQoKSBmb3IgbW9yZSBpbmZvcm1hdGlvblxuICAgKi9cbiAgcHVibGljIGdldCByaWdodCgpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLmdldFJpZ2h0KCk7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgWCB2YWx1ZSBvZiB0aGUgcmlnaHQgc2lkZSBvZiB0aGUgYm91bmRpbmcgYm94IG9mIHRoaXMgTm9kZSAoaW4gdGhlIHBhcmVudCBjb29yZGluYXRlIGZyYW1lKS5cbiAgICpcbiAgICogTk9URTogVGhpcyBtYXkgcmVxdWlyZSBjb21wdXRhdGlvbiBvZiB0aGlzIG5vZGUncyBzdWJ0cmVlIGJvdW5kcywgd2hpY2ggbWF5IGluY3VyIHNvbWUgcGVyZm9ybWFuY2UgbG9zcy5cbiAgICovXG4gIHB1YmxpYyBnZXRSaWdodCgpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLmdldEJvdW5kcygpLm1heFg7XG4gIH1cblxuICAvKipcbiAgICogU2hpZnRzIHRoaXMgTm9kZSBob3Jpem9udGFsbHkgc28gdGhhdCBpdHMgaG9yaXpvbnRhbCBjZW50ZXIgKGluIHRoZSBwYXJlbnQgY29vcmRpbmF0ZSBmcmFtZSkgaXMgZXF1YWwgdG8gdGhlXG4gICAqIHBhc3NlZC1pbiBjZW50ZXIgWCB2YWx1ZS5cbiAgICpcbiAgICogTk9URTogVGhpcyBtYXkgcmVxdWlyZSBjb21wdXRhdGlvbiBvZiB0aGlzIG5vZGUncyBzdWJ0cmVlIGJvdW5kcywgd2hpY2ggbWF5IGluY3VyIHNvbWUgcGVyZm9ybWFuY2UgbG9zcy5cbiAgICpcbiAgICogQHBhcmFtIHggLSBBZnRlciB0aGlzIG9wZXJhdGlvbiwgbm9kZS5jZW50ZXJYIHNob3VsZCBhcHByb3hpbWF0ZWx5IGVxdWFsIHRoaXMgdmFsdWUuXG4gICAqL1xuICBwdWJsaWMgc2V0Q2VudGVyWCggeDogbnVtYmVyICk6IHRoaXMge1xuICAgIGNvbnN0IGN1cnJlbnRDZW50ZXJYID0gdGhpcy5nZXRDZW50ZXJYKCk7XG4gICAgaWYgKCBpc0Zpbml0ZSggY3VycmVudENlbnRlclggKSApIHtcbiAgICAgIHRoaXMudHJhbnNsYXRlKCB4IC0gY3VycmVudENlbnRlclgsIDAsIHRydWUgKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpczsgLy8gYWxsb3cgY2hhaW5pbmdcbiAgfVxuXG4gIC8qKlxuICAgKiBTZWUgc2V0Q2VudGVyWCgpIGZvciBtb3JlIGluZm9ybWF0aW9uXG4gICAqL1xuICBwdWJsaWMgc2V0IGNlbnRlclgoIHZhbHVlOiBudW1iZXIgKSB7XG4gICAgdGhpcy5zZXRDZW50ZXJYKCB2YWx1ZSApO1xuICB9XG5cbiAgLyoqXG4gICAqIFNlZSBnZXRDZW50ZXJYKCkgZm9yIG1vcmUgaW5mb3JtYXRpb25cbiAgICovXG4gIHB1YmxpYyBnZXQgY2VudGVyWCgpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLmdldENlbnRlclgoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBYIHZhbHVlIG9mIHRoaXMgbm9kZSdzIGhvcml6b250YWwgY2VudGVyIChpbiB0aGUgcGFyZW50IGNvb3JkaW5hdGUgZnJhbWUpXG4gICAqXG4gICAqIE5PVEU6IFRoaXMgbWF5IHJlcXVpcmUgY29tcHV0YXRpb24gb2YgdGhpcyBub2RlJ3Mgc3VidHJlZSBib3VuZHMsIHdoaWNoIG1heSBpbmN1ciBzb21lIHBlcmZvcm1hbmNlIGxvc3MuXG4gICAqL1xuICBwdWJsaWMgZ2V0Q2VudGVyWCgpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLmdldEJvdW5kcygpLmdldENlbnRlclgoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTaGlmdHMgdGhpcyBOb2RlIHZlcnRpY2FsbHkgc28gdGhhdCBpdHMgdmVydGljYWwgY2VudGVyIChpbiB0aGUgcGFyZW50IGNvb3JkaW5hdGUgZnJhbWUpIGlzIGVxdWFsIHRvIHRoZVxuICAgKiBwYXNzZWQtaW4gY2VudGVyIFkgdmFsdWUuXG4gICAqXG4gICAqIE5PVEU6IFRoaXMgbWF5IHJlcXVpcmUgY29tcHV0YXRpb24gb2YgdGhpcyBub2RlJ3Mgc3VidHJlZSBib3VuZHMsIHdoaWNoIG1heSBpbmN1ciBzb21lIHBlcmZvcm1hbmNlIGxvc3MuXG4gICAqXG4gICAqIEBwYXJhbSB5IC0gQWZ0ZXIgdGhpcyBvcGVyYXRpb24sIG5vZGUuY2VudGVyWSBzaG91bGQgYXBwcm94aW1hdGVseSBlcXVhbCB0aGlzIHZhbHVlLlxuICAgKi9cbiAgcHVibGljIHNldENlbnRlclkoIHk6IG51bWJlciApOiB0aGlzIHtcbiAgICBjb25zdCBjdXJyZW50Q2VudGVyWSA9IHRoaXMuZ2V0Q2VudGVyWSgpO1xuICAgIGlmICggaXNGaW5pdGUoIGN1cnJlbnRDZW50ZXJZICkgKSB7XG4gICAgICB0aGlzLnRyYW5zbGF0ZSggMCwgeSAtIGN1cnJlbnRDZW50ZXJZLCB0cnVlICk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXM7IC8vIGFsbG93IGNoYWluaW5nXG4gIH1cblxuICAvKipcbiAgICogU2VlIHNldENlbnRlclkoKSBmb3IgbW9yZSBpbmZvcm1hdGlvblxuICAgKi9cbiAgcHVibGljIHNldCBjZW50ZXJZKCB2YWx1ZTogbnVtYmVyICkge1xuICAgIHRoaXMuc2V0Q2VudGVyWSggdmFsdWUgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZWUgZ2V0Q2VudGVyWCgpIGZvciBtb3JlIGluZm9ybWF0aW9uXG4gICAqL1xuICBwdWJsaWMgZ2V0IGNlbnRlclkoKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5nZXRDZW50ZXJZKCk7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgWSB2YWx1ZSBvZiB0aGlzIG5vZGUncyB2ZXJ0aWNhbCBjZW50ZXIgKGluIHRoZSBwYXJlbnQgY29vcmRpbmF0ZSBmcmFtZSlcbiAgICpcbiAgICogTk9URTogVGhpcyBtYXkgcmVxdWlyZSBjb21wdXRhdGlvbiBvZiB0aGlzIG5vZGUncyBzdWJ0cmVlIGJvdW5kcywgd2hpY2ggbWF5IGluY3VyIHNvbWUgcGVyZm9ybWFuY2UgbG9zcy5cbiAgICovXG4gIHB1YmxpYyBnZXRDZW50ZXJZKCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0Qm91bmRzKCkuZ2V0Q2VudGVyWSgpO1xuICB9XG5cbiAgLyoqXG4gICAqIFNoaWZ0cyB0aGlzIE5vZGUgdmVydGljYWxseSBzbyB0aGF0IGl0cyB0b3AgKGluIHRoZSBwYXJlbnQgY29vcmRpbmF0ZSBmcmFtZSkgaXMgZXF1YWwgdG8gdGhlIHBhc3NlZC1pbiBZIHZhbHVlLlxuICAgKlxuICAgKiBOT1RFOiB0b3AgaXMgdGhlIGxvd2VzdCBZIHZhbHVlIGluIG91ciBib3VuZHMuXG4gICAqIE5PVEU6IFRoaXMgbWF5IHJlcXVpcmUgY29tcHV0YXRpb24gb2YgdGhpcyBub2RlJ3Mgc3VidHJlZSBib3VuZHMsIHdoaWNoIG1heSBpbmN1ciBzb21lIHBlcmZvcm1hbmNlIGxvc3MuXG4gICAqXG4gICAqIEBwYXJhbSB0b3AgLSBBZnRlciB0aGlzIG9wZXJhdGlvbiwgbm9kZS50b3Agc2hvdWxkIGFwcHJveGltYXRlbHkgZXF1YWwgdGhpcyB2YWx1ZS5cbiAgICovXG4gIHB1YmxpYyBzZXRUb3AoIHRvcDogbnVtYmVyICk6IHRoaXMge1xuICAgIGNvbnN0IGN1cnJlbnRUb3AgPSB0aGlzLmdldFRvcCgpO1xuICAgIGlmICggaXNGaW5pdGUoIGN1cnJlbnRUb3AgKSApIHtcbiAgICAgIHRoaXMudHJhbnNsYXRlKCAwLCB0b3AgLSBjdXJyZW50VG9wLCB0cnVlICk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXM7IC8vIGFsbG93IGNoYWluaW5nXG4gIH1cblxuICAvKipcbiAgICogU2VlIHNldFRvcCgpIGZvciBtb3JlIGluZm9ybWF0aW9uXG4gICAqL1xuICBwdWJsaWMgc2V0IHRvcCggdmFsdWU6IG51bWJlciApIHtcbiAgICB0aGlzLnNldFRvcCggdmFsdWUgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZWUgZ2V0VG9wKCkgZm9yIG1vcmUgaW5mb3JtYXRpb25cbiAgICovXG4gIHB1YmxpYyBnZXQgdG9wKCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0VG9wKCk7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgbG93ZXN0IFkgdmFsdWUgb2YgdGhpcyBub2RlJ3MgYm91bmRpbmcgYm94IChpbiB0aGUgcGFyZW50IGNvb3JkaW5hdGUgZnJhbWUpLlxuICAgKlxuICAgKiBOT1RFOiBUaGlzIG1heSByZXF1aXJlIGNvbXB1dGF0aW9uIG9mIHRoaXMgbm9kZSdzIHN1YnRyZWUgYm91bmRzLCB3aGljaCBtYXkgaW5jdXIgc29tZSBwZXJmb3JtYW5jZSBsb3NzLlxuICAgKi9cbiAgcHVibGljIGdldFRvcCgpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLmdldEJvdW5kcygpLm1pblk7XG4gIH1cblxuICAvKipcbiAgICogU2hpZnRzIHRoaXMgTm9kZSB2ZXJ0aWNhbGx5IHNvIHRoYXQgaXRzIGJvdHRvbSAoaW4gdGhlIHBhcmVudCBjb29yZGluYXRlIGZyYW1lKSBpcyBlcXVhbCB0byB0aGUgcGFzc2VkLWluIFkgdmFsdWUuXG4gICAqXG4gICAqIE5PVEU6IGJvdHRvbSBpcyB0aGUgaGlnaGVzdCBZIHZhbHVlIGluIG91ciBib3VuZHMuXG4gICAqIE5PVEU6IFRoaXMgbWF5IHJlcXVpcmUgY29tcHV0YXRpb24gb2YgdGhpcyBub2RlJ3Mgc3VidHJlZSBib3VuZHMsIHdoaWNoIG1heSBpbmN1ciBzb21lIHBlcmZvcm1hbmNlIGxvc3MuXG4gICAqXG4gICAqIEBwYXJhbSBib3R0b20gLSBBZnRlciB0aGlzIG9wZXJhdGlvbiwgbm9kZS5ib3R0b20gc2hvdWxkIGFwcHJveGltYXRlbHkgZXF1YWwgdGhpcyB2YWx1ZS5cbiAgICovXG4gIHB1YmxpYyBzZXRCb3R0b20oIGJvdHRvbTogbnVtYmVyICk6IHRoaXMge1xuICAgIGNvbnN0IGN1cnJlbnRCb3R0b20gPSB0aGlzLmdldEJvdHRvbSgpO1xuICAgIGlmICggaXNGaW5pdGUoIGN1cnJlbnRCb3R0b20gKSApIHtcbiAgICAgIHRoaXMudHJhbnNsYXRlKCAwLCBib3R0b20gLSBjdXJyZW50Qm90dG9tLCB0cnVlICk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXM7IC8vIGFsbG93IGNoYWluaW5nXG4gIH1cblxuICAvKipcbiAgICogU2VlIHNldEJvdHRvbSgpIGZvciBtb3JlIGluZm9ybWF0aW9uXG4gICAqL1xuICBwdWJsaWMgc2V0IGJvdHRvbSggdmFsdWU6IG51bWJlciApIHtcbiAgICB0aGlzLnNldEJvdHRvbSggdmFsdWUgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZWUgZ2V0Qm90dG9tKCkgZm9yIG1vcmUgaW5mb3JtYXRpb25cbiAgICovXG4gIHB1YmxpYyBnZXQgYm90dG9tKCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0Qm90dG9tKCk7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgaGlnaGVzdCBZIHZhbHVlIG9mIHRoaXMgbm9kZSdzIGJvdW5kaW5nIGJveCAoaW4gdGhlIHBhcmVudCBjb29yZGluYXRlIGZyYW1lKS5cbiAgICpcbiAgICogTk9URTogVGhpcyBtYXkgcmVxdWlyZSBjb21wdXRhdGlvbiBvZiB0aGlzIG5vZGUncyBzdWJ0cmVlIGJvdW5kcywgd2hpY2ggbWF5IGluY3VyIHNvbWUgcGVyZm9ybWFuY2UgbG9zcy5cbiAgICovXG4gIHB1YmxpYyBnZXRCb3R0b20oKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5nZXRCb3VuZHMoKS5tYXhZO1xuICB9XG5cbiAgLypcbiAgICogQ29udmVuaWVuY2UgbG9jYXRpb25zXG4gICAqXG4gICAqIFVwcGVyIGlzIGluIHRlcm1zIG9mIHRoZSB2aXN1YWwgbGF5b3V0IGluIFNjZW5lcnkgYW5kIG90aGVyIHByb2dyYW1zLCBzbyB0aGUgbWluWSBpcyB0aGUgXCJ1cHBlclwiLCBhbmQgbWluWSBpcyB0aGUgXCJsb3dlclwiXG4gICAqXG4gICAqICAgICAgICAgICAgIGxlZnQgKHgpICAgICBjZW50ZXJYICAgICAgICByaWdodFxuICAgKiAgICAgICAgICAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICogdG9wICAoeSkgfCBsZWZ0VG9wICAgICBjZW50ZXJUb3AgICAgIHJpZ2h0VG9wXG4gICAqIGNlbnRlclkgIHwgbGVmdENlbnRlciAgY2VudGVyICAgICAgICByaWdodENlbnRlclxuICAgKiBib3R0b20gICB8IGxlZnRCb3R0b20gIGNlbnRlckJvdHRvbSAgcmlnaHRCb3R0b21cbiAgICpcbiAgICogTk9URTogVGhpcyByZXF1aXJlcyBjb21wdXRhdGlvbiBvZiB0aGlzIG5vZGUncyBzdWJ0cmVlIGJvdW5kcywgd2hpY2ggbWF5IGluY3VyIHNvbWUgcGVyZm9ybWFuY2UgbG9zcy5cbiAgICovXG5cbiAgLyoqXG4gICAqIFNldHMgdGhlIHBvc2l0aW9uIG9mIHRoZSB1cHBlci1sZWZ0IGNvcm5lciBvZiB0aGlzIG5vZGUncyBib3VuZHMgdG8gdGhlIHNwZWNpZmllZCBwb2ludC5cbiAgICovXG4gIHB1YmxpYyBzZXRMZWZ0VG9wKCBsZWZ0VG9wOiBWZWN0b3IyICk6IHRoaXMge1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIGxlZnRUb3AuaXNGaW5pdGUoKSwgJ2xlZnRUb3Agc2hvdWxkIGJlIGEgZmluaXRlIFZlY3RvcjInICk7XG5cbiAgICBjb25zdCBjdXJyZW50TGVmdFRvcCA9IHRoaXMuZ2V0TGVmdFRvcCgpO1xuICAgIGlmICggY3VycmVudExlZnRUb3AuaXNGaW5pdGUoKSApIHtcbiAgICAgIHRoaXMudHJhbnNsYXRlKCBsZWZ0VG9wLm1pbnVzKCBjdXJyZW50TGVmdFRvcCApLCB0cnVlICk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogU2VlIHNldExlZnRUb3AoKSBmb3IgbW9yZSBpbmZvcm1hdGlvblxuICAgKi9cbiAgcHVibGljIHNldCBsZWZ0VG9wKCB2YWx1ZTogVmVjdG9yMiApIHtcbiAgICB0aGlzLnNldExlZnRUb3AoIHZhbHVlICk7XG4gIH1cblxuICAvKipcbiAgICogU2VlIGdldExlZnRUb3AoKSBmb3IgbW9yZSBpbmZvcm1hdGlvblxuICAgKi9cbiAgcHVibGljIGdldCBsZWZ0VG9wKCk6IFZlY3RvcjIge1xuICAgIHJldHVybiB0aGlzLmdldExlZnRUb3AoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSB1cHBlci1sZWZ0IGNvcm5lciBvZiB0aGlzIG5vZGUncyBib3VuZHMuXG4gICAqL1xuICBwdWJsaWMgZ2V0TGVmdFRvcCgpOiBWZWN0b3IyIHtcbiAgICByZXR1cm4gdGhpcy5nZXRCb3VuZHMoKS5nZXRMZWZ0VG9wKCk7XG4gIH1cblxuICAvKipcbiAgICogU2V0cyB0aGUgcG9zaXRpb24gb2YgdGhlIGNlbnRlci10b3AgbG9jYXRpb24gb2YgdGhpcyBub2RlJ3MgYm91bmRzIHRvIHRoZSBzcGVjaWZpZWQgcG9pbnQuXG4gICAqL1xuICBwdWJsaWMgc2V0Q2VudGVyVG9wKCBjZW50ZXJUb3A6IFZlY3RvcjIgKTogdGhpcyB7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggY2VudGVyVG9wLmlzRmluaXRlKCksICdjZW50ZXJUb3Agc2hvdWxkIGJlIGEgZmluaXRlIFZlY3RvcjInICk7XG5cbiAgICBjb25zdCBjdXJyZW50Q2VudGVyVG9wID0gdGhpcy5nZXRDZW50ZXJUb3AoKTtcbiAgICBpZiAoIGN1cnJlbnRDZW50ZXJUb3AuaXNGaW5pdGUoKSApIHtcbiAgICAgIHRoaXMudHJhbnNsYXRlKCBjZW50ZXJUb3AubWludXMoIGN1cnJlbnRDZW50ZXJUb3AgKSwgdHJ1ZSApO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIFNlZSBzZXRDZW50ZXJUb3AoKSBmb3IgbW9yZSBpbmZvcm1hdGlvblxuICAgKi9cbiAgcHVibGljIHNldCBjZW50ZXJUb3AoIHZhbHVlOiBWZWN0b3IyICkge1xuICAgIHRoaXMuc2V0Q2VudGVyVG9wKCB2YWx1ZSApO1xuICB9XG5cbiAgLyoqXG4gICAqIFNlZSBnZXRDZW50ZXJUb3AoKSBmb3IgbW9yZSBpbmZvcm1hdGlvblxuICAgKi9cbiAgcHVibGljIGdldCBjZW50ZXJUb3AoKTogVmVjdG9yMiB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0Q2VudGVyVG9wKCk7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgY2VudGVyLXRvcCBsb2NhdGlvbiBvZiB0aGlzIG5vZGUncyBib3VuZHMuXG4gICAqL1xuICBwdWJsaWMgZ2V0Q2VudGVyVG9wKCk6IFZlY3RvcjIge1xuICAgIHJldHVybiB0aGlzLmdldEJvdW5kcygpLmdldENlbnRlclRvcCgpO1xuICB9XG5cbiAgLyoqXG4gICAqIFNldHMgdGhlIHBvc2l0aW9uIG9mIHRoZSB1cHBlci1yaWdodCBjb3JuZXIgb2YgdGhpcyBub2RlJ3MgYm91bmRzIHRvIHRoZSBzcGVjaWZpZWQgcG9pbnQuXG4gICAqL1xuICBwdWJsaWMgc2V0UmlnaHRUb3AoIHJpZ2h0VG9wOiBWZWN0b3IyICk6IHRoaXMge1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIHJpZ2h0VG9wLmlzRmluaXRlKCksICdyaWdodFRvcCBzaG91bGQgYmUgYSBmaW5pdGUgVmVjdG9yMicgKTtcblxuICAgIGNvbnN0IGN1cnJlbnRSaWdodFRvcCA9IHRoaXMuZ2V0UmlnaHRUb3AoKTtcbiAgICBpZiAoIGN1cnJlbnRSaWdodFRvcC5pc0Zpbml0ZSgpICkge1xuICAgICAgdGhpcy50cmFuc2xhdGUoIHJpZ2h0VG9wLm1pbnVzKCBjdXJyZW50UmlnaHRUb3AgKSwgdHJ1ZSApO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIFNlZSBzZXRSaWdodFRvcCgpIGZvciBtb3JlIGluZm9ybWF0aW9uXG4gICAqL1xuICBwdWJsaWMgc2V0IHJpZ2h0VG9wKCB2YWx1ZTogVmVjdG9yMiApIHtcbiAgICB0aGlzLnNldFJpZ2h0VG9wKCB2YWx1ZSApO1xuICB9XG5cbiAgLyoqXG4gICAqIFNlZSBnZXRSaWdodFRvcCgpIGZvciBtb3JlIGluZm9ybWF0aW9uXG4gICAqL1xuICBwdWJsaWMgZ2V0IHJpZ2h0VG9wKCk6IFZlY3RvcjIge1xuICAgIHJldHVybiB0aGlzLmdldFJpZ2h0VG9wKCk7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgdXBwZXItcmlnaHQgY29ybmVyIG9mIHRoaXMgbm9kZSdzIGJvdW5kcy5cbiAgICovXG4gIHB1YmxpYyBnZXRSaWdodFRvcCgpOiBWZWN0b3IyIHtcbiAgICByZXR1cm4gdGhpcy5nZXRCb3VuZHMoKS5nZXRSaWdodFRvcCgpO1xuICB9XG5cbiAgLyoqXG4gICAqIFNldHMgdGhlIHBvc2l0aW9uIG9mIHRoZSBjZW50ZXItbGVmdCBvZiB0aGlzIG5vZGUncyBib3VuZHMgdG8gdGhlIHNwZWNpZmllZCBwb2ludC5cbiAgICovXG4gIHB1YmxpYyBzZXRMZWZ0Q2VudGVyKCBsZWZ0Q2VudGVyOiBWZWN0b3IyICk6IHRoaXMge1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIGxlZnRDZW50ZXIuaXNGaW5pdGUoKSwgJ2xlZnRDZW50ZXIgc2hvdWxkIGJlIGEgZmluaXRlIFZlY3RvcjInICk7XG5cbiAgICBjb25zdCBjdXJyZW50TGVmdENlbnRlciA9IHRoaXMuZ2V0TGVmdENlbnRlcigpO1xuICAgIGlmICggY3VycmVudExlZnRDZW50ZXIuaXNGaW5pdGUoKSApIHtcbiAgICAgIHRoaXMudHJhbnNsYXRlKCBsZWZ0Q2VudGVyLm1pbnVzKCBjdXJyZW50TGVmdENlbnRlciApLCB0cnVlICk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogU2VlIHNldExlZnRDZW50ZXIoKSBmb3IgbW9yZSBpbmZvcm1hdGlvblxuICAgKi9cbiAgcHVibGljIHNldCBsZWZ0Q2VudGVyKCB2YWx1ZTogVmVjdG9yMiApIHtcbiAgICB0aGlzLnNldExlZnRDZW50ZXIoIHZhbHVlICk7XG4gIH1cblxuICAvKipcbiAgICogU2VlIGdldExlZnRDZW50ZXIoKSBmb3IgbW9yZSBpbmZvcm1hdGlvblxuICAgKi9cbiAgcHVibGljIGdldCBsZWZ0Q2VudGVyKCk6IFZlY3RvcjIge1xuICAgIHJldHVybiB0aGlzLmdldExlZnRDZW50ZXIoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBjZW50ZXItbGVmdCBjb3JuZXIgb2YgdGhpcyBub2RlJ3MgYm91bmRzLlxuICAgKi9cbiAgcHVibGljIGdldExlZnRDZW50ZXIoKTogVmVjdG9yMiB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0Qm91bmRzKCkuZ2V0TGVmdENlbnRlcigpO1xuICB9XG5cbiAgLyoqXG4gICAqIFNldHMgdGhlIGNlbnRlciBvZiB0aGlzIG5vZGUncyBib3VuZHMgdG8gdGhlIHNwZWNpZmllZCBwb2ludC5cbiAgICovXG4gIHB1YmxpYyBzZXRDZW50ZXIoIGNlbnRlcjogVmVjdG9yMiApOiB0aGlzIHtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBjZW50ZXIuaXNGaW5pdGUoKSwgJ2NlbnRlciBzaG91bGQgYmUgYSBmaW5pdGUgVmVjdG9yMicgKTtcblxuICAgIGNvbnN0IGN1cnJlbnRDZW50ZXIgPSB0aGlzLmdldENlbnRlcigpO1xuICAgIGlmICggY3VycmVudENlbnRlci5pc0Zpbml0ZSgpICkge1xuICAgICAgdGhpcy50cmFuc2xhdGUoIGNlbnRlci5taW51cyggY3VycmVudENlbnRlciApLCB0cnVlICk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogU2VlIHNldENlbnRlcigpIGZvciBtb3JlIGluZm9ybWF0aW9uXG4gICAqL1xuICBwdWJsaWMgc2V0IGNlbnRlciggdmFsdWU6IFZlY3RvcjIgKSB7XG4gICAgdGhpcy5zZXRDZW50ZXIoIHZhbHVlICk7XG4gIH1cblxuICAvKipcbiAgICogU2VlIGdldENlbnRlcigpIGZvciBtb3JlIGluZm9ybWF0aW9uXG4gICAqL1xuICBwdWJsaWMgZ2V0IGNlbnRlcigpOiBWZWN0b3IyIHtcbiAgICByZXR1cm4gdGhpcy5nZXRDZW50ZXIoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBjZW50ZXIgb2YgdGhpcyBub2RlJ3MgYm91bmRzLlxuICAgKi9cbiAgcHVibGljIGdldENlbnRlcigpOiBWZWN0b3IyIHtcbiAgICByZXR1cm4gdGhpcy5nZXRCb3VuZHMoKS5nZXRDZW50ZXIoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXRzIHRoZSBwb3NpdGlvbiBvZiB0aGUgY2VudGVyLXJpZ2h0IG9mIHRoaXMgbm9kZSdzIGJvdW5kcyB0byB0aGUgc3BlY2lmaWVkIHBvaW50LlxuICAgKi9cbiAgcHVibGljIHNldFJpZ2h0Q2VudGVyKCByaWdodENlbnRlcjogVmVjdG9yMiApOiB0aGlzIHtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCByaWdodENlbnRlci5pc0Zpbml0ZSgpLCAncmlnaHRDZW50ZXIgc2hvdWxkIGJlIGEgZmluaXRlIFZlY3RvcjInICk7XG5cbiAgICBjb25zdCBjdXJyZW50UmlnaHRDZW50ZXIgPSB0aGlzLmdldFJpZ2h0Q2VudGVyKCk7XG4gICAgaWYgKCBjdXJyZW50UmlnaHRDZW50ZXIuaXNGaW5pdGUoKSApIHtcbiAgICAgIHRoaXMudHJhbnNsYXRlKCByaWdodENlbnRlci5taW51cyggY3VycmVudFJpZ2h0Q2VudGVyICksIHRydWUgKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBTZWUgc2V0UmlnaHRDZW50ZXIoKSBmb3IgbW9yZSBpbmZvcm1hdGlvblxuICAgKi9cbiAgcHVibGljIHNldCByaWdodENlbnRlciggdmFsdWU6IFZlY3RvcjIgKSB7XG4gICAgdGhpcy5zZXRSaWdodENlbnRlciggdmFsdWUgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZWUgZ2V0UmlnaHRDZW50ZXIoKSBmb3IgbW9yZSBpbmZvcm1hdGlvblxuICAgKi9cbiAgcHVibGljIGdldCByaWdodENlbnRlcigpOiBWZWN0b3IyIHtcbiAgICByZXR1cm4gdGhpcy5nZXRSaWdodENlbnRlcigpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIGNlbnRlci1yaWdodCBvZiB0aGlzIG5vZGUncyBib3VuZHMuXG4gICAqL1xuICBwdWJsaWMgZ2V0UmlnaHRDZW50ZXIoKTogVmVjdG9yMiB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0Qm91bmRzKCkuZ2V0UmlnaHRDZW50ZXIoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXRzIHRoZSBwb3NpdGlvbiBvZiB0aGUgbG93ZXItbGVmdCBjb3JuZXIgb2YgdGhpcyBub2RlJ3MgYm91bmRzIHRvIHRoZSBzcGVjaWZpZWQgcG9pbnQuXG4gICAqL1xuICBwdWJsaWMgc2V0TGVmdEJvdHRvbSggbGVmdEJvdHRvbTogVmVjdG9yMiApOiB0aGlzIHtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBsZWZ0Qm90dG9tLmlzRmluaXRlKCksICdsZWZ0Qm90dG9tIHNob3VsZCBiZSBhIGZpbml0ZSBWZWN0b3IyJyApO1xuXG4gICAgY29uc3QgY3VycmVudExlZnRCb3R0b20gPSB0aGlzLmdldExlZnRCb3R0b20oKTtcbiAgICBpZiAoIGN1cnJlbnRMZWZ0Qm90dG9tLmlzRmluaXRlKCkgKSB7XG4gICAgICB0aGlzLnRyYW5zbGF0ZSggbGVmdEJvdHRvbS5taW51cyggY3VycmVudExlZnRCb3R0b20gKSwgdHJ1ZSApO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIFNlZSBzZXRMZWZ0Qm90dG9tKCkgZm9yIG1vcmUgaW5mb3JtYXRpb25cbiAgICovXG4gIHB1YmxpYyBzZXQgbGVmdEJvdHRvbSggdmFsdWU6IFZlY3RvcjIgKSB7XG4gICAgdGhpcy5zZXRMZWZ0Qm90dG9tKCB2YWx1ZSApO1xuICB9XG5cbiAgLyoqXG4gICAqIFNlZSBnZXRMZWZ0Qm90dG9tKCkgZm9yIG1vcmUgaW5mb3JtYXRpb25cbiAgICovXG4gIHB1YmxpYyBnZXQgbGVmdEJvdHRvbSgpOiBWZWN0b3IyIHtcbiAgICByZXR1cm4gdGhpcy5nZXRMZWZ0Qm90dG9tKCk7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgbG93ZXItbGVmdCBjb3JuZXIgb2YgdGhpcyBub2RlJ3MgYm91bmRzLlxuICAgKi9cbiAgcHVibGljIGdldExlZnRCb3R0b20oKTogVmVjdG9yMiB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0Qm91bmRzKCkuZ2V0TGVmdEJvdHRvbSgpO1xuICB9XG5cbiAgLyoqXG4gICAqIFNldHMgdGhlIHBvc2l0aW9uIG9mIHRoZSBjZW50ZXItYm90dG9tIG9mIHRoaXMgbm9kZSdzIGJvdW5kcyB0byB0aGUgc3BlY2lmaWVkIHBvaW50LlxuICAgKi9cbiAgcHVibGljIHNldENlbnRlckJvdHRvbSggY2VudGVyQm90dG9tOiBWZWN0b3IyICk6IHRoaXMge1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIGNlbnRlckJvdHRvbS5pc0Zpbml0ZSgpLCAnY2VudGVyQm90dG9tIHNob3VsZCBiZSBhIGZpbml0ZSBWZWN0b3IyJyApO1xuXG4gICAgY29uc3QgY3VycmVudENlbnRlckJvdHRvbSA9IHRoaXMuZ2V0Q2VudGVyQm90dG9tKCk7XG4gICAgaWYgKCBjdXJyZW50Q2VudGVyQm90dG9tLmlzRmluaXRlKCkgKSB7XG4gICAgICB0aGlzLnRyYW5zbGF0ZSggY2VudGVyQm90dG9tLm1pbnVzKCBjdXJyZW50Q2VudGVyQm90dG9tICksIHRydWUgKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBTZWUgc2V0Q2VudGVyQm90dG9tKCkgZm9yIG1vcmUgaW5mb3JtYXRpb25cbiAgICovXG4gIHB1YmxpYyBzZXQgY2VudGVyQm90dG9tKCB2YWx1ZTogVmVjdG9yMiApIHtcbiAgICB0aGlzLnNldENlbnRlckJvdHRvbSggdmFsdWUgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZWUgZ2V0Q2VudGVyQm90dG9tKCkgZm9yIG1vcmUgaW5mb3JtYXRpb25cbiAgICovXG4gIHB1YmxpYyBnZXQgY2VudGVyQm90dG9tKCk6IFZlY3RvcjIge1xuICAgIHJldHVybiB0aGlzLmdldENlbnRlckJvdHRvbSgpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIGNlbnRlci1ib3R0b20gb2YgdGhpcyBub2RlJ3MgYm91bmRzLlxuICAgKi9cbiAgcHVibGljIGdldENlbnRlckJvdHRvbSgpOiBWZWN0b3IyIHtcbiAgICByZXR1cm4gdGhpcy5nZXRCb3VuZHMoKS5nZXRDZW50ZXJCb3R0b20oKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXRzIHRoZSBwb3NpdGlvbiBvZiB0aGUgbG93ZXItcmlnaHQgY29ybmVyIG9mIHRoaXMgbm9kZSdzIGJvdW5kcyB0byB0aGUgc3BlY2lmaWVkIHBvaW50LlxuICAgKi9cbiAgcHVibGljIHNldFJpZ2h0Qm90dG9tKCByaWdodEJvdHRvbTogVmVjdG9yMiApOiB0aGlzIHtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCByaWdodEJvdHRvbS5pc0Zpbml0ZSgpLCAncmlnaHRCb3R0b20gc2hvdWxkIGJlIGEgZmluaXRlIFZlY3RvcjInICk7XG5cbiAgICBjb25zdCBjdXJyZW50UmlnaHRCb3R0b20gPSB0aGlzLmdldFJpZ2h0Qm90dG9tKCk7XG4gICAgaWYgKCBjdXJyZW50UmlnaHRCb3R0b20uaXNGaW5pdGUoKSApIHtcbiAgICAgIHRoaXMudHJhbnNsYXRlKCByaWdodEJvdHRvbS5taW51cyggY3VycmVudFJpZ2h0Qm90dG9tICksIHRydWUgKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBTZWUgc2V0UmlnaHRCb3R0b20oKSBmb3IgbW9yZSBpbmZvcm1hdGlvblxuICAgKi9cbiAgcHVibGljIHNldCByaWdodEJvdHRvbSggdmFsdWU6IFZlY3RvcjIgKSB7XG4gICAgdGhpcy5zZXRSaWdodEJvdHRvbSggdmFsdWUgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZWUgZ2V0UmlnaHRCb3R0b20oKSBmb3IgbW9yZSBpbmZvcm1hdGlvblxuICAgKi9cbiAgcHVibGljIGdldCByaWdodEJvdHRvbSgpOiBWZWN0b3IyIHtcbiAgICByZXR1cm4gdGhpcy5nZXRSaWdodEJvdHRvbSgpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIGxvd2VyLXJpZ2h0IGNvcm5lciBvZiB0aGlzIG5vZGUncyBib3VuZHMuXG4gICAqL1xuICBwdWJsaWMgZ2V0UmlnaHRCb3R0b20oKTogVmVjdG9yMiB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0Qm91bmRzKCkuZ2V0UmlnaHRCb3R0b20oKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSB3aWR0aCBvZiB0aGlzIG5vZGUncyBib3VuZGluZyBib3ggKGluIHRoZSBwYXJlbnQgY29vcmRpbmF0ZSBmcmFtZSkuXG4gICAqXG4gICAqIE5PVEU6IFRoaXMgbWF5IHJlcXVpcmUgY29tcHV0YXRpb24gb2YgdGhpcyBub2RlJ3Mgc3VidHJlZSBib3VuZHMsIHdoaWNoIG1heSBpbmN1ciBzb21lIHBlcmZvcm1hbmNlIGxvc3MuXG4gICAqL1xuICBwdWJsaWMgZ2V0V2lkdGgoKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5nZXRCb3VuZHMoKS5nZXRXaWR0aCgpO1xuICB9XG5cbiAgLyoqXG4gICAqIFNlZSBnZXRXaWR0aCgpIGZvciBtb3JlIGluZm9ybWF0aW9uXG4gICAqL1xuICBwdWJsaWMgZ2V0IHdpZHRoKCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0V2lkdGgoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBoZWlnaHQgb2YgdGhpcyBub2RlJ3MgYm91bmRpbmcgYm94IChpbiB0aGUgcGFyZW50IGNvb3JkaW5hdGUgZnJhbWUpLlxuICAgKlxuICAgKiBOT1RFOiBUaGlzIG1heSByZXF1aXJlIGNvbXB1dGF0aW9uIG9mIHRoaXMgbm9kZSdzIHN1YnRyZWUgYm91bmRzLCB3aGljaCBtYXkgaW5jdXIgc29tZSBwZXJmb3JtYW5jZSBsb3NzLlxuICAgKi9cbiAgcHVibGljIGdldEhlaWdodCgpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLmdldEJvdW5kcygpLmdldEhlaWdodCgpO1xuICB9XG5cbiAgLyoqXG4gICAqIFNlZSBnZXRIZWlnaHQoKSBmb3IgbW9yZSBpbmZvcm1hdGlvblxuICAgKi9cbiAgcHVibGljIGdldCBoZWlnaHQoKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5nZXRIZWlnaHQoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSB3aWR0aCBvZiB0aGlzIG5vZGUncyBib3VuZGluZyBib3ggKGluIHRoZSBsb2NhbCBjb29yZGluYXRlIGZyYW1lKS5cbiAgICpcbiAgICogTk9URTogVGhpcyBtYXkgcmVxdWlyZSBjb21wdXRhdGlvbiBvZiB0aGlzIG5vZGUncyBzdWJ0cmVlIGJvdW5kcywgd2hpY2ggbWF5IGluY3VyIHNvbWUgcGVyZm9ybWFuY2UgbG9zcy5cbiAgICovXG4gIHB1YmxpYyBnZXRMb2NhbFdpZHRoKCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0TG9jYWxCb3VuZHMoKS5nZXRXaWR0aCgpO1xuICB9XG5cbiAgLyoqXG4gICAqIFNlZSBnZXRMb2NhbFdpZHRoKCkgZm9yIG1vcmUgaW5mb3JtYXRpb25cbiAgICovXG4gIHB1YmxpYyBnZXQgbG9jYWxXaWR0aCgpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLmdldExvY2FsV2lkdGgoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBoZWlnaHQgb2YgdGhpcyBub2RlJ3MgYm91bmRpbmcgYm94IChpbiB0aGUgbG9jYWwgY29vcmRpbmF0ZSBmcmFtZSkuXG4gICAqXG4gICAqIE5PVEU6IFRoaXMgbWF5IHJlcXVpcmUgY29tcHV0YXRpb24gb2YgdGhpcyBub2RlJ3Mgc3VidHJlZSBib3VuZHMsIHdoaWNoIG1heSBpbmN1ciBzb21lIHBlcmZvcm1hbmNlIGxvc3MuXG4gICAqL1xuICBwdWJsaWMgZ2V0TG9jYWxIZWlnaHQoKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5nZXRMb2NhbEJvdW5kcygpLmdldEhlaWdodCgpO1xuICB9XG5cbiAgLyoqXG4gICAqIFNlZSBnZXRMb2NhbEhlaWdodCgpIGZvciBtb3JlIGluZm9ybWF0aW9uXG4gICAqL1xuICBwdWJsaWMgZ2V0IGxvY2FsSGVpZ2h0KCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0TG9jYWxIZWlnaHQoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBYIHZhbHVlIG9mIHRoZSBsZWZ0IHNpZGUgb2YgdGhlIGJvdW5kaW5nIGJveCBvZiB0aGlzIE5vZGUgKGluIHRoZSBsb2NhbCBjb29yZGluYXRlIGZyYW1lKS5cbiAgICpcbiAgICogTk9URTogVGhpcyBtYXkgcmVxdWlyZSBjb21wdXRhdGlvbiBvZiB0aGlzIG5vZGUncyBzdWJ0cmVlIGJvdW5kcywgd2hpY2ggbWF5IGluY3VyIHNvbWUgcGVyZm9ybWFuY2UgbG9zcy5cbiAgICovXG4gIHB1YmxpYyBnZXRMb2NhbExlZnQoKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5nZXRMb2NhbEJvdW5kcygpLm1pblg7XG4gIH1cblxuICAvKipcbiAgICogU2VlIGdldExlZnQoKSBmb3IgbW9yZSBpbmZvcm1hdGlvblxuICAgKi9cbiAgcHVibGljIGdldCBsb2NhbExlZnQoKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5nZXRMb2NhbExlZnQoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBYIHZhbHVlIG9mIHRoZSByaWdodCBzaWRlIG9mIHRoZSBib3VuZGluZyBib3ggb2YgdGhpcyBOb2RlIChpbiB0aGUgbG9jYWwgY29vcmRpbmF0ZSBmcmFtZSkuXG4gICAqXG4gICAqIE5PVEU6IFRoaXMgbWF5IHJlcXVpcmUgY29tcHV0YXRpb24gb2YgdGhpcyBub2RlJ3Mgc3VidHJlZSBib3VuZHMsIHdoaWNoIG1heSBpbmN1ciBzb21lIHBlcmZvcm1hbmNlIGxvc3MuXG4gICAqL1xuICBwdWJsaWMgZ2V0TG9jYWxSaWdodCgpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLmdldExvY2FsQm91bmRzKCkubWF4WDtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZWUgZ2V0UmlnaHQoKSBmb3IgbW9yZSBpbmZvcm1hdGlvblxuICAgKi9cbiAgcHVibGljIGdldCBsb2NhbFJpZ2h0KCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0TG9jYWxSaWdodCgpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIFggdmFsdWUgb2YgdGhpcyBub2RlJ3MgaG9yaXpvbnRhbCBjZW50ZXIgKGluIHRoZSBsb2NhbCBjb29yZGluYXRlIGZyYW1lKVxuICAgKlxuICAgKiBOT1RFOiBUaGlzIG1heSByZXF1aXJlIGNvbXB1dGF0aW9uIG9mIHRoaXMgbm9kZSdzIHN1YnRyZWUgYm91bmRzLCB3aGljaCBtYXkgaW5jdXIgc29tZSBwZXJmb3JtYW5jZSBsb3NzLlxuICAgKi9cbiAgcHVibGljIGdldExvY2FsQ2VudGVyWCgpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLmdldExvY2FsQm91bmRzKCkuZ2V0Q2VudGVyWCgpO1xuICB9XG5cbiAgLyoqXG4gICAqIFNlZSBnZXRDZW50ZXJYKCkgZm9yIG1vcmUgaW5mb3JtYXRpb25cbiAgICovXG4gIHB1YmxpYyBnZXQgbG9jYWxDZW50ZXJYKCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0TG9jYWxDZW50ZXJYKCk7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgWSB2YWx1ZSBvZiB0aGlzIG5vZGUncyB2ZXJ0aWNhbCBjZW50ZXIgKGluIHRoZSBsb2NhbCBjb29yZGluYXRlIGZyYW1lKVxuICAgKlxuICAgKiBOT1RFOiBUaGlzIG1heSByZXF1aXJlIGNvbXB1dGF0aW9uIG9mIHRoaXMgbm9kZSdzIHN1YnRyZWUgYm91bmRzLCB3aGljaCBtYXkgaW5jdXIgc29tZSBwZXJmb3JtYW5jZSBsb3NzLlxuICAgKi9cbiAgcHVibGljIGdldExvY2FsQ2VudGVyWSgpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLmdldExvY2FsQm91bmRzKCkuZ2V0Q2VudGVyWSgpO1xuICB9XG5cbiAgLyoqXG4gICAqIFNlZSBnZXRDZW50ZXJYKCkgZm9yIG1vcmUgaW5mb3JtYXRpb25cbiAgICovXG4gIHB1YmxpYyBnZXQgbG9jYWxDZW50ZXJZKCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0TG9jYWxDZW50ZXJZKCk7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgbG93ZXN0IFkgdmFsdWUgb2YgdGhpcyBub2RlJ3MgYm91bmRpbmcgYm94IChpbiB0aGUgbG9jYWwgY29vcmRpbmF0ZSBmcmFtZSkuXG4gICAqXG4gICAqIE5PVEU6IFRoaXMgbWF5IHJlcXVpcmUgY29tcHV0YXRpb24gb2YgdGhpcyBub2RlJ3Mgc3VidHJlZSBib3VuZHMsIHdoaWNoIG1heSBpbmN1ciBzb21lIHBlcmZvcm1hbmNlIGxvc3MuXG4gICAqL1xuICBwdWJsaWMgZ2V0TG9jYWxUb3AoKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5nZXRMb2NhbEJvdW5kcygpLm1pblk7XG4gIH1cblxuICAvKipcbiAgICogU2VlIGdldFRvcCgpIGZvciBtb3JlIGluZm9ybWF0aW9uXG4gICAqL1xuICBwdWJsaWMgZ2V0IGxvY2FsVG9wKCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0TG9jYWxUb3AoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBoaWdoZXN0IFkgdmFsdWUgb2YgdGhpcyBub2RlJ3MgYm91bmRpbmcgYm94IChpbiB0aGUgbG9jYWwgY29vcmRpbmF0ZSBmcmFtZSkuXG4gICAqXG4gICAqIE5PVEU6IFRoaXMgbWF5IHJlcXVpcmUgY29tcHV0YXRpb24gb2YgdGhpcyBub2RlJ3Mgc3VidHJlZSBib3VuZHMsIHdoaWNoIG1heSBpbmN1ciBzb21lIHBlcmZvcm1hbmNlIGxvc3MuXG4gICAqL1xuICBwdWJsaWMgZ2V0TG9jYWxCb3R0b20oKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5nZXRMb2NhbEJvdW5kcygpLm1heFk7XG4gIH1cblxuICAvKipcbiAgICogU2VlIGdldExvY2FsQm90dG9tKCkgZm9yIG1vcmUgaW5mb3JtYXRpb25cbiAgICovXG4gIHB1YmxpYyBnZXQgbG9jYWxCb3R0b20oKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5nZXRMb2NhbEJvdHRvbSgpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIHVwcGVyLWxlZnQgY29ybmVyIG9mIHRoaXMgbm9kZSdzIGxvY2FsQm91bmRzLlxuICAgKi9cbiAgcHVibGljIGdldExvY2FsTGVmdFRvcCgpOiBWZWN0b3IyIHtcbiAgICByZXR1cm4gdGhpcy5nZXRMb2NhbEJvdW5kcygpLmdldExlZnRUb3AoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZWUgZ2V0TG9jYWxMZWZ0VG9wKCkgZm9yIG1vcmUgaW5mb3JtYXRpb25cbiAgICovXG4gIHB1YmxpYyBnZXQgbG9jYWxMZWZ0VG9wKCk6IFZlY3RvcjIge1xuICAgIHJldHVybiB0aGlzLmdldExvY2FsTGVmdFRvcCgpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIGNlbnRlci10b3AgbG9jYXRpb24gb2YgdGhpcyBub2RlJ3MgbG9jYWxCb3VuZHMuXG4gICAqL1xuICBwdWJsaWMgZ2V0TG9jYWxDZW50ZXJUb3AoKTogVmVjdG9yMiB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0TG9jYWxCb3VuZHMoKS5nZXRDZW50ZXJUb3AoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZWUgZ2V0TG9jYWxDZW50ZXJUb3AoKSBmb3IgbW9yZSBpbmZvcm1hdGlvblxuICAgKi9cbiAgcHVibGljIGdldCBsb2NhbENlbnRlclRvcCgpOiBWZWN0b3IyIHtcbiAgICByZXR1cm4gdGhpcy5nZXRMb2NhbENlbnRlclRvcCgpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIHVwcGVyLXJpZ2h0IGNvcm5lciBvZiB0aGlzIG5vZGUncyBsb2NhbEJvdW5kcy5cbiAgICovXG4gIHB1YmxpYyBnZXRMb2NhbFJpZ2h0VG9wKCk6IFZlY3RvcjIge1xuICAgIHJldHVybiB0aGlzLmdldExvY2FsQm91bmRzKCkuZ2V0UmlnaHRUb3AoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZWUgZ2V0TG9jYWxSaWdodFRvcCgpIGZvciBtb3JlIGluZm9ybWF0aW9uXG4gICAqL1xuICBwdWJsaWMgZ2V0IGxvY2FsUmlnaHRUb3AoKTogVmVjdG9yMiB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0TG9jYWxSaWdodFRvcCgpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIGNlbnRlci1sZWZ0IGNvcm5lciBvZiB0aGlzIG5vZGUncyBsb2NhbEJvdW5kcy5cbiAgICovXG4gIHB1YmxpYyBnZXRMb2NhbExlZnRDZW50ZXIoKTogVmVjdG9yMiB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0TG9jYWxCb3VuZHMoKS5nZXRMZWZ0Q2VudGVyKCk7XG4gIH1cblxuICAvKipcbiAgICogU2VlIGdldExvY2FsTGVmdENlbnRlcigpIGZvciBtb3JlIGluZm9ybWF0aW9uXG4gICAqL1xuICBwdWJsaWMgZ2V0IGxvY2FsTGVmdENlbnRlcigpOiBWZWN0b3IyIHtcbiAgICByZXR1cm4gdGhpcy5nZXRMb2NhbExlZnRDZW50ZXIoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBjZW50ZXIgb2YgdGhpcyBub2RlJ3MgbG9jYWxCb3VuZHMuXG4gICAqL1xuICBwdWJsaWMgZ2V0TG9jYWxDZW50ZXIoKTogVmVjdG9yMiB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0TG9jYWxCb3VuZHMoKS5nZXRDZW50ZXIoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZWUgZ2V0TG9jYWxDZW50ZXIoKSBmb3IgbW9yZSBpbmZvcm1hdGlvblxuICAgKi9cbiAgcHVibGljIGdldCBsb2NhbENlbnRlcigpOiBWZWN0b3IyIHtcbiAgICByZXR1cm4gdGhpcy5nZXRMb2NhbENlbnRlcigpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIGNlbnRlci1yaWdodCBvZiB0aGlzIG5vZGUncyBsb2NhbEJvdW5kcy5cbiAgICovXG4gIHB1YmxpYyBnZXRMb2NhbFJpZ2h0Q2VudGVyKCk6IFZlY3RvcjIge1xuICAgIHJldHVybiB0aGlzLmdldExvY2FsQm91bmRzKCkuZ2V0UmlnaHRDZW50ZXIoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZWUgZ2V0TG9jYWxSaWdodENlbnRlcigpIGZvciBtb3JlIGluZm9ybWF0aW9uXG4gICAqL1xuICBwdWJsaWMgZ2V0IGxvY2FsUmlnaHRDZW50ZXIoKTogVmVjdG9yMiB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0TG9jYWxSaWdodENlbnRlcigpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIGxvd2VyLWxlZnQgY29ybmVyIG9mIHRoaXMgbm9kZSdzIGxvY2FsQm91bmRzLlxuICAgKi9cbiAgcHVibGljIGdldExvY2FsTGVmdEJvdHRvbSgpOiBWZWN0b3IyIHtcbiAgICByZXR1cm4gdGhpcy5nZXRMb2NhbEJvdW5kcygpLmdldExlZnRCb3R0b20oKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZWUgZ2V0TG9jYWxMZWZ0Qm90dG9tKCkgZm9yIG1vcmUgaW5mb3JtYXRpb25cbiAgICovXG4gIHB1YmxpYyBnZXQgbG9jYWxMZWZ0Qm90dG9tKCk6IFZlY3RvcjIge1xuICAgIHJldHVybiB0aGlzLmdldExvY2FsTGVmdEJvdHRvbSgpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIGNlbnRlci1ib3R0b20gb2YgdGhpcyBub2RlJ3MgbG9jYWxCb3VuZHMuXG4gICAqL1xuICBwdWJsaWMgZ2V0TG9jYWxDZW50ZXJCb3R0b20oKTogVmVjdG9yMiB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0TG9jYWxCb3VuZHMoKS5nZXRDZW50ZXJCb3R0b20oKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZWUgZ2V0TG9jYWxDZW50ZXJCb3R0b20oKSBmb3IgbW9yZSBpbmZvcm1hdGlvblxuICAgKi9cbiAgcHVibGljIGdldCBsb2NhbENlbnRlckJvdHRvbSgpOiBWZWN0b3IyIHtcbiAgICByZXR1cm4gdGhpcy5nZXRMb2NhbENlbnRlckJvdHRvbSgpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIGxvd2VyLXJpZ2h0IGNvcm5lciBvZiB0aGlzIG5vZGUncyBsb2NhbEJvdW5kcy5cbiAgICovXG4gIHB1YmxpYyBnZXRMb2NhbFJpZ2h0Qm90dG9tKCk6IFZlY3RvcjIge1xuICAgIHJldHVybiB0aGlzLmdldExvY2FsQm91bmRzKCkuZ2V0UmlnaHRCb3R0b20oKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZWUgZ2V0TG9jYWxSaWdodEJvdHRvbSgpIGZvciBtb3JlIGluZm9ybWF0aW9uXG4gICAqL1xuICBwdWJsaWMgZ2V0IGxvY2FsUmlnaHRCb3R0b20oKTogVmVjdG9yMiB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0TG9jYWxSaWdodEJvdHRvbSgpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIHVuaXF1ZSBpbnRlZ3JhbCBJRCBmb3IgdGhpcyBub2RlLlxuICAgKi9cbiAgcHVibGljIGdldElkKCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMuX2lkO1xuICB9XG5cbiAgLyoqXG4gICAqIFNlZSBnZXRJZCgpIGZvciBtb3JlIGluZm9ybWF0aW9uXG4gICAqL1xuICBwdWJsaWMgZ2V0IGlkKCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0SWQoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDYWxsZWQgd2hlbiBvdXIgdmlzaWJpbGl0eSBQcm9wZXJ0eSBjaGFuZ2VzIHZhbHVlcy5cbiAgICovXG4gIHByaXZhdGUgb25WaXNpYmxlUHJvcGVydHlDaGFuZ2UoIHZpc2libGU6IGJvb2xlYW4gKTogdm9pZCB7XG5cbiAgICAvLyBJbnRlcnJ1cHQgdGhlIHN1YnRyZWUgd2hlbiBtYWRlIGludmlzaWJsZSBieSBkZWZhdWx0LCBzZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3NjZW5lcnkvaXNzdWVzLzE2NDVcbiAgICBpZiAoICF2aXNpYmxlICYmIHRoaXMuX2ludGVycnVwdFN1YnRyZWVPbkludmlzaWJsZSApIHtcbiAgICAgIHRoaXMuaW50ZXJydXB0U3VidHJlZUlucHV0KCk7XG4gICAgfVxuXG4gICAgLy8gY2hhbmdpbmcgdmlzaWJpbGl0eSBjYW4gYWZmZWN0IHBpY2thYmlsaXR5IHBydW5pbmcsIHdoaWNoIGFmZmVjdHMgbW91c2UvdG91Y2ggYm91bmRzXG4gICAgdGhpcy5fcGlja2VyLm9uVmlzaWJpbGl0eUNoYW5nZSgpO1xuXG4gICAgaWYgKCBhc3NlcnRTbG93ICkgeyB0aGlzLl9waWNrZXIuYXVkaXQoKTsgfVxuXG4gICAgLy8gRGVmaW5lZCBpbiBQYXJhbGxlbERPTS5qc1xuICAgIHRoaXMuX3Bkb21EaXNwbGF5c0luZm8ub25WaXNpYmlsaXR5Q2hhbmdlKCB2aXNpYmxlICk7XG5cbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCB0aGlzLl9wYXJlbnRzLmxlbmd0aDsgaSsrICkge1xuICAgICAgY29uc3QgcGFyZW50ID0gdGhpcy5fcGFyZW50c1sgaSBdO1xuICAgICAgaWYgKCBwYXJlbnQuX2V4Y2x1ZGVJbnZpc2libGVDaGlsZHJlbkZyb21Cb3VuZHMgKSB7XG4gICAgICAgIHBhcmVudC5pbnZhbGlkYXRlQ2hpbGRCb3VuZHMoKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogU2V0cyB3aGF0IFByb3BlcnR5IG91ciB2aXNpYmxlUHJvcGVydHkgaXMgYmFja2VkIGJ5LCBzbyB0aGF0IGNoYW5nZXMgdG8gdGhpcyBwcm92aWRlZCBQcm9wZXJ0eSB3aWxsIGNoYW5nZSB0aGlzXG4gICAqIE5vZGUncyB2aXNpYmlsaXR5LCBhbmQgdmljZSB2ZXJzYS4gVGhpcyBkb2VzIG5vdCBjaGFuZ2UgdGhpcy5fdmlzaWJsZVByb3BlcnR5LiBTZWUgVGlueUZvcndhcmRpbmdQcm9wZXJ0eS5zZXRUYXJnZXRQcm9wZXJ0eSgpXG4gICAqIGZvciBtb3JlIGluZm8uXG4gICAqXG4gICAqIE5PVEUgRm9yIFBoRVQtaU8gdXNlOlxuICAgKiBBbGwgUGhFVC1pTyBpbnN0cnVtZW50ZWQgTm9kZXMgY3JlYXRlIHRoZWlyIG93biBpbnN0cnVtZW50ZWQgdmlzaWJsZVByb3BlcnR5IChpZiBvbmUgaXMgbm90IHBhc3NlZCBpbiBhc1xuICAgKiBhbiBvcHRpb24pLiBPbmNlIGEgTm9kZSdzIHZpc2libGVQcm9wZXJ0eSBoYXMgYmVlbiByZWdpc3RlcmVkIHdpdGggUGhFVC1pTywgaXQgY2Fubm90IGJlIFwic3dhcHBlZCBvdXRcIiBmb3IgYW5vdGhlci5cbiAgICogSWYgeW91IG5lZWQgdG8gXCJkZWxheVwiIHNldHRpbmcgYW4gaW5zdHJ1bWVudGVkIHZpc2libGVQcm9wZXJ0eSB0byB0aGlzIG5vZGUsIHBhc3MgcGhldGlvVmlzaWJsZVByb3BlcnR5SW5zdHJ1bWVudGVkXG4gICAqIHRvIGluc3RydW1lbnRhdGlvbiBjYWxsIHRvIHRoaXMgTm9kZSAod2hlcmUgVGFuZGVtIGlzIHByb3ZpZGVkKS5cbiAgICovXG4gIHB1YmxpYyBzZXRWaXNpYmxlUHJvcGVydHkoIG5ld1RhcmdldDogVFJlYWRPbmx5UHJvcGVydHk8Ym9vbGVhbj4gfCBudWxsICk6IHRoaXMge1xuICAgIHJldHVybiB0aGlzLl92aXNpYmxlUHJvcGVydHkuc2V0VGFyZ2V0UHJvcGVydHkoIG5ld1RhcmdldCwgdGhpcywgVklTSUJMRV9QUk9QRVJUWV9UQU5ERU1fTkFNRSApO1xuICB9XG5cbiAgLyoqXG4gICAqIFNlZSBzZXRWaXNpYmxlUHJvcGVydHkoKSBmb3IgbW9yZSBpbmZvcm1hdGlvblxuICAgKi9cbiAgcHVibGljIHNldCB2aXNpYmxlUHJvcGVydHkoIHByb3BlcnR5OiBUUmVhZE9ubHlQcm9wZXJ0eTxib29sZWFuPiB8IG51bGwgKSB7XG4gICAgdGhpcy5zZXRWaXNpYmxlUHJvcGVydHkoIHByb3BlcnR5ICk7XG4gIH1cblxuICAvKipcbiAgICogU2VlIGdldFZpc2libGVQcm9wZXJ0eSgpIGZvciBtb3JlIGluZm9ybWF0aW9uXG4gICAqL1xuICBwdWJsaWMgZ2V0IHZpc2libGVQcm9wZXJ0eSgpOiBUUHJvcGVydHk8Ym9vbGVhbj4ge1xuICAgIHJldHVybiB0aGlzLmdldFZpc2libGVQcm9wZXJ0eSgpO1xuICB9XG5cblxuICAvKipcbiAgICogR2V0IHRoaXMgTm9kZSdzIHZpc2libGVQcm9wZXJ0eS4gTm90ZSEgVGhpcyBpcyBub3QgdGhlIHJlY2lwcm9jYWwgb2Ygc2V0VmlzaWJsZVByb3BlcnR5LiBOb2RlLnByb3RvdHlwZS5fdmlzaWJsZVByb3BlcnR5XG4gICAqIGlzIGEgVGlueUZvcndhcmRpbmdQcm9wZXJ0eSwgYW5kIGlzIHNldCB1cCB0byBsaXN0ZW4gdG8gY2hhbmdlcyBmcm9tIHRoZSB2aXNpYmxlUHJvcGVydHkgcHJvdmlkZWQgYnlcbiAgICogc2V0VmlzaWJsZVByb3BlcnR5KCksIGJ1dCB0aGUgdW5kZXJseWluZyByZWZlcmVuY2UgZG9lcyBub3QgY2hhbmdlLiBUaGlzIG1lYW5zIHRoZSBmb2xsb3dpbmc6XG4gICAqICAgICAqIGNvbnN0IG15Tm9kZSA9IG5ldyBOb2RlKCk7XG4gICAqIGNvbnN0IHZpc2libGVQcm9wZXJ0eSA9IG5ldyBQcm9wZXJ0eSggZmFsc2UgKTtcbiAgICogbXlOb2RlLnNldFZpc2libGVQcm9wZXJ0eSggdmlzaWJsZVByb3BlcnR5IClcbiAgICogPT4gbXlOb2RlLmdldFZpc2libGVQcm9wZXJ0eSgpICE9PSB2aXNpYmxlUHJvcGVydHkgKCEhISEhISlcbiAgICpcbiAgICogUGxlYXNlIHVzZSB0aGlzIHdpdGggY2F1dGlvbi4gU2VlIHNldFZpc2libGVQcm9wZXJ0eSgpIGZvciBtb3JlIGluZm9ybWF0aW9uLlxuICAgKi9cbiAgcHVibGljIGdldFZpc2libGVQcm9wZXJ0eSgpOiBUUHJvcGVydHk8Ym9vbGVhbj4ge1xuICAgIHJldHVybiB0aGlzLl92aXNpYmxlUHJvcGVydHk7XG4gIH1cblxuICAvKipcbiAgICogU2V0cyB3aGV0aGVyIHRoaXMgTm9kZSBpcyB2aXNpYmxlLiAgRE8gTk9UIG92ZXJyaWRlIHRoaXMgYXMgYSB3YXkgb2YgYWRkaW5nIGFkZGl0aW9uYWwgYmVoYXZpb3Igd2hlbiBhIE5vZGUnc1xuICAgKiB2aXNpYmlsaXR5IGNoYW5nZXMsIGFkZCBhIGxpc3RlbmVyIHRvIHRoaXMudmlzaWJsZVByb3BlcnR5IGluc3RlYWQuXG4gICAqL1xuICBwdWJsaWMgc2V0VmlzaWJsZSggdmlzaWJsZTogYm9vbGVhbiApOiB0aGlzIHtcbiAgICB0aGlzLnZpc2libGVQcm9wZXJ0eS5zZXQoIHZpc2libGUgKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBTZWUgc2V0VmlzaWJsZSgpIGZvciBtb3JlIGluZm9ybWF0aW9uXG4gICAqL1xuICBwdWJsaWMgc2V0IHZpc2libGUoIHZhbHVlOiBib29sZWFuICkge1xuICAgIHRoaXMuc2V0VmlzaWJsZSggdmFsdWUgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZWUgaXNWaXNpYmxlKCkgZm9yIG1vcmUgaW5mb3JtYXRpb25cbiAgICovXG4gIHB1YmxpYyBnZXQgdmlzaWJsZSgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5pc1Zpc2libGUoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHdoZXRoZXIgdGhpcyBOb2RlIGlzIHZpc2libGUuXG4gICAqL1xuICBwdWJsaWMgaXNWaXNpYmxlKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLnZpc2libGVQcm9wZXJ0eS52YWx1ZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBVc2UgdGhpcyB0byBhdXRvbWF0aWNhbGx5IGNyZWF0ZSBhIGZvcndhcmRlZCwgUGhFVC1pTyBpbnN0cnVtZW50ZWQgdmlzaWJsZVByb3BlcnR5IGludGVybmFsIHRvIE5vZGUuXG4gICAqL1xuICBwdWJsaWMgc2V0UGhldGlvVmlzaWJsZVByb3BlcnR5SW5zdHJ1bWVudGVkKCBwaGV0aW9WaXNpYmxlUHJvcGVydHlJbnN0cnVtZW50ZWQ6IGJvb2xlYW4gKTogdGhpcyB7XG4gICAgcmV0dXJuIHRoaXMuX3Zpc2libGVQcm9wZXJ0eS5zZXRUYXJnZXRQcm9wZXJ0eUluc3RydW1lbnRlZCggcGhldGlvVmlzaWJsZVByb3BlcnR5SW5zdHJ1bWVudGVkLCB0aGlzICk7XG4gIH1cblxuICAvKipcbiAgICogU2VlIHNldFBoZXRpb1Zpc2libGVQcm9wZXJ0eUluc3RydW1lbnRlZCgpIGZvciBtb3JlIGluZm9ybWF0aW9uXG4gICAqL1xuICBwdWJsaWMgc2V0IHBoZXRpb1Zpc2libGVQcm9wZXJ0eUluc3RydW1lbnRlZCggdmFsdWU6IGJvb2xlYW4gKSB7XG4gICAgdGhpcy5zZXRQaGV0aW9WaXNpYmxlUHJvcGVydHlJbnN0cnVtZW50ZWQoIHZhbHVlICk7XG4gIH1cblxuICAvKipcbiAgICogU2VlIGdldFBoZXRpb1Zpc2libGVQcm9wZXJ0eUluc3RydW1lbnRlZCgpIGZvciBtb3JlIGluZm9ybWF0aW9uXG4gICAqL1xuICBwdWJsaWMgZ2V0IHBoZXRpb1Zpc2libGVQcm9wZXJ0eUluc3RydW1lbnRlZCgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5nZXRQaGV0aW9WaXNpYmxlUHJvcGVydHlJbnN0cnVtZW50ZWQoKTtcbiAgfVxuXG4gIHB1YmxpYyBnZXRQaGV0aW9WaXNpYmxlUHJvcGVydHlJbnN0cnVtZW50ZWQoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuX3Zpc2libGVQcm9wZXJ0eS5nZXRUYXJnZXRQcm9wZXJ0eUluc3RydW1lbnRlZCgpO1xuICB9XG5cbiAgLyoqXG4gICAqIFN3YXAgdGhlIHZpc2liaWxpdHkgb2YgdGhpcyBub2RlIHdpdGggYW5vdGhlciBub2RlLiBUaGUgTm9kZSB0aGF0IGlzIG1hZGUgdmlzaWJsZSB3aWxsIHJlY2VpdmUga2V5Ym9hcmQgZm9jdXNcbiAgICogaWYgaXQgaXMgZm9jdXNhYmxlIGFuZCB0aGUgcHJldmlvdXNseSB2aXNpYmxlIE5vZGUgaGFkIGZvY3VzLlxuICAgKi9cbiAgcHVibGljIHN3YXBWaXNpYmlsaXR5KCBvdGhlck5vZGU6IE5vZGUgKTogdGhpcyB7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdGhpcy52aXNpYmxlICE9PSBvdGhlck5vZGUudmlzaWJsZSApO1xuXG4gICAgY29uc3QgdmlzaWJsZU5vZGUgPSB0aGlzLnZpc2libGUgPyB0aGlzIDogb3RoZXJOb2RlO1xuICAgIGNvbnN0IGludmlzaWJsZU5vZGUgPSB0aGlzLnZpc2libGUgPyBvdGhlck5vZGUgOiB0aGlzO1xuXG4gICAgLy8gaWYgdGhlIHZpc2libGUgbm9kZSBoYXMgZm9jdXMgd2Ugd2lsbCByZXN0b3JlIGZvY3VzIG9uIHRoZSBpbnZpc2libGUgTm9kZSBvbmNlIGl0IGlzIHZpc2libGVcbiAgICBjb25zdCB2aXNpYmxlTm9kZUZvY3VzZWQgPSB2aXNpYmxlTm9kZS5mb2N1c2VkO1xuXG4gICAgdmlzaWJsZU5vZGUudmlzaWJsZSA9IGZhbHNlO1xuICAgIGludmlzaWJsZU5vZGUudmlzaWJsZSA9IHRydWU7XG5cbiAgICBpZiAoIHZpc2libGVOb2RlRm9jdXNlZCAmJiBpbnZpc2libGVOb2RlLmZvY3VzYWJsZSApIHtcbiAgICAgIGludmlzaWJsZU5vZGUuZm9jdXMoKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpczsgLy8gYWxsb3cgY2hhaW5pbmdcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXRzIHRoZSBvcGFjaXR5IG9mIHRoaXMgTm9kZSAoYW5kIGl0cyBzdWItdHJlZSksIHdoZXJlIDAgaXMgZnVsbHkgdHJhbnNwYXJlbnQsIGFuZCAxIGlzIGZ1bGx5IG9wYXF1ZS4gIFZhbHVlc1xuICAgKiBvdXRzaWRlIG9mIHRoYXQgcmFuZ2UgdGhyb3cgYW4gRXJyb3IuXG4gICAqIEB0aHJvd3MgRXJyb3IgaWYgb3BhY2l0eSBvdXQgb2YgcmFuZ2VcbiAgICovXG4gIHB1YmxpYyBzZXRPcGFjaXR5KCBvcGFjaXR5OiBudW1iZXIgKTogdm9pZCB7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggaXNGaW5pdGUoIG9wYWNpdHkgKSwgJ29wYWNpdHkgc2hvdWxkIGJlIGEgZmluaXRlIG51bWJlcicgKTtcblxuICAgIGlmICggb3BhY2l0eSA8IDAgfHwgb3BhY2l0eSA+IDEgKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoIGBvcGFjaXR5IG91dCBvZiByYW5nZTogJHtvcGFjaXR5fWAgKTtcbiAgICB9XG5cbiAgICB0aGlzLm9wYWNpdHlQcm9wZXJ0eS52YWx1ZSA9IG9wYWNpdHk7XG4gIH1cblxuICAvKipcbiAgICogU2VlIHNldE9wYWNpdHkoKSBmb3IgbW9yZSBpbmZvcm1hdGlvblxuICAgKi9cbiAgcHVibGljIHNldCBvcGFjaXR5KCB2YWx1ZTogbnVtYmVyICkge1xuICAgIHRoaXMuc2V0T3BhY2l0eSggdmFsdWUgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZWUgZ2V0T3BhY2l0eSgpIGZvciBtb3JlIGluZm9ybWF0aW9uXG4gICAqL1xuICBwdWJsaWMgZ2V0IG9wYWNpdHkoKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5nZXRPcGFjaXR5KCk7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgb3BhY2l0eSBvZiB0aGlzIG5vZGUuXG4gICAqL1xuICBwdWJsaWMgZ2V0T3BhY2l0eSgpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLm9wYWNpdHlQcm9wZXJ0eS52YWx1ZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXRzIHRoZSBkaXNhYmxlZE9wYWNpdHkgb2YgdGhpcyBOb2RlIChhbmQgaXRzIHN1Yi10cmVlKSwgd2hlcmUgMCBpcyBmdWxseSB0cmFuc3BhcmVudCwgYW5kIDEgaXMgZnVsbHkgb3BhcXVlLlxuICAgKiBWYWx1ZXMgb3V0c2lkZSBvZiB0aGF0IHJhbmdlIHRocm93IGFuIEVycm9yLlxuICAgKiBAdGhyb3dzIEVycm9yIGlmIGRpc2FibGVkT3BhY2l0eSBvdXQgb2YgcmFuZ2VcbiAgICovXG4gIHB1YmxpYyBzZXREaXNhYmxlZE9wYWNpdHkoIGRpc2FibGVkT3BhY2l0eTogbnVtYmVyICk6IHRoaXMge1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIGlzRmluaXRlKCBkaXNhYmxlZE9wYWNpdHkgKSwgJ2Rpc2FibGVkT3BhY2l0eSBzaG91bGQgYmUgYSBmaW5pdGUgbnVtYmVyJyApO1xuXG4gICAgaWYgKCBkaXNhYmxlZE9wYWNpdHkgPCAwIHx8IGRpc2FibGVkT3BhY2l0eSA+IDEgKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoIGBkaXNhYmxlZE9wYWNpdHkgb3V0IG9mIHJhbmdlOiAke2Rpc2FibGVkT3BhY2l0eX1gICk7XG4gICAgfVxuXG4gICAgdGhpcy5kaXNhYmxlZE9wYWNpdHlQcm9wZXJ0eS52YWx1ZSA9IGRpc2FibGVkT3BhY2l0eTtcblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIFNlZSBzZXREaXNhYmxlZE9wYWNpdHkoKSBmb3IgbW9yZSBpbmZvcm1hdGlvblxuICAgKi9cbiAgcHVibGljIHNldCBkaXNhYmxlZE9wYWNpdHkoIHZhbHVlOiBudW1iZXIgKSB7XG4gICAgdGhpcy5zZXREaXNhYmxlZE9wYWNpdHkoIHZhbHVlICk7XG4gIH1cblxuICAvKipcbiAgICogU2VlIGdldERpc2FibGVkT3BhY2l0eSgpIGZvciBtb3JlIGluZm9ybWF0aW9uXG4gICAqL1xuICBwdWJsaWMgZ2V0IGRpc2FibGVkT3BhY2l0eSgpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLmdldERpc2FibGVkT3BhY2l0eSgpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIGRpc2FibGVkT3BhY2l0eSBvZiB0aGlzIG5vZGUuXG4gICAqL1xuICBwdWJsaWMgZ2V0RGlzYWJsZWRPcGFjaXR5KCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMuZGlzYWJsZWRPcGFjaXR5UHJvcGVydHkudmFsdWU7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgb3BhY2l0eSBhY3R1YWxseSBhcHBsaWVkIHRvIHRoZSBub2RlLlxuICAgKi9cbiAgcHVibGljIGdldEVmZmVjdGl2ZU9wYWNpdHkoKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5vcGFjaXR5UHJvcGVydHkudmFsdWUgKiAoIHRoaXMuZW5hYmxlZFByb3BlcnR5LnZhbHVlID8gMSA6IHRoaXMuZGlzYWJsZWRPcGFjaXR5UHJvcGVydHkudmFsdWUgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZWUgZ2V0RGlzYWJsZWRPcGFjaXR5KCkgZm9yIG1vcmUgaW5mb3JtYXRpb25cbiAgICovXG4gIHB1YmxpYyBnZXQgZWZmZWN0aXZlT3BhY2l0eSgpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLmdldEVmZmVjdGl2ZU9wYWNpdHkoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDYWxsZWQgd2hlbiBvdXIgb3BhY2l0eSBvciBvdGhlciBmaWx0ZXIgY2hhbmdlcyB2YWx1ZXNcbiAgICovXG4gIHByaXZhdGUgb25PcGFjaXR5UHJvcGVydHlDaGFuZ2UoKTogdm9pZCB7XG4gICAgdGhpcy5maWx0ZXJDaGFuZ2VFbWl0dGVyLmVtaXQoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDYWxsZWQgd2hlbiBvdXIgb3BhY2l0eSBvciBvdGhlciBmaWx0ZXIgY2hhbmdlcyB2YWx1ZXNcbiAgICovXG4gIHByaXZhdGUgb25EaXNhYmxlZE9wYWNpdHlQcm9wZXJ0eUNoYW5nZSgpOiB2b2lkIHtcbiAgICBpZiAoICF0aGlzLl9lbmFibGVkUHJvcGVydHkudmFsdWUgKSB7XG4gICAgICB0aGlzLmZpbHRlckNoYW5nZUVtaXR0ZXIuZW1pdCgpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBTZXRzIHRoZSBub24tb3BhY2l0eSBmaWx0ZXJzIGZvciB0aGlzIE5vZGUuXG4gICAqXG4gICAqIFRoZSBkZWZhdWx0IGlzIGFuIGVtcHR5IGFycmF5IChubyBmaWx0ZXJzKS4gSXQgc2hvdWxkIGJlIGFuIGFycmF5IG9mIEZpbHRlciBvYmplY3RzLCB3aGljaCB3aWxsIGJlIGVmZmVjdGl2ZWx5XG4gICAqIGFwcGxpZWQgaW4tb3JkZXIgb24gdGhpcyBOb2RlIChhbmQgaXRzIHN1YnRyZWUpLCBhbmQgd2lsbCBiZSBhcHBsaWVkIEJFRk9SRSBvcGFjaXR5L2NsaXBwaW5nLlxuICAgKlxuICAgKiBOT1RFOiBTb21lIGZpbHRlcnMgbWF5IGRlY3JlYXNlIHBlcmZvcm1hbmNlIChhbmQgdGhpcyBtYXkgYmUgcGxhdGZvcm0tc3BlY2lmaWMpLiBQbGVhc2UgcmVhZCBkb2N1bWVudGF0aW9uIGZvciBlYWNoXG4gICAqIGZpbHRlciBiZWZvcmUgdXNpbmcuXG4gICAqXG4gICAqIFR5cGljYWwgZmlsdGVyIHR5cGVzIHRvIHVzZSBhcmU6XG4gICAqIC0gQnJpZ2h0bmVzc1xuICAgKiAtIENvbnRyYXN0XG4gICAqIC0gRHJvcFNoYWRvdyAoRVhQRVJJTUVOVEFMKVxuICAgKiAtIEdhdXNzaWFuQmx1ciAoRVhQRVJJTUVOVEFMKVxuICAgKiAtIEdyYXlzY2FsZSAoR3JheXNjYWxlLkZVTEwgZm9yIHRoZSBmdWxsIGVmZmVjdClcbiAgICogLSBIdWVSb3RhdGVcbiAgICogLSBJbnZlcnQgKEludmVydC5GVUxMIGZvciB0aGUgZnVsbCBlZmZlY3QpXG4gICAqIC0gU2F0dXJhdGVcbiAgICogLSBTZXBpYSAoU2VwaWEuRlVMTCBmb3IgdGhlIGZ1bGwgZWZmZWN0KVxuICAgKlxuICAgKiBGaWx0ZXIuanMgaGFzIG1vcmUgaW5mb3JtYXRpb24gaW4gZ2VuZXJhbCBvbiBmaWx0ZXJzLlxuICAgKi9cbiAgcHVibGljIHNldEZpbHRlcnMoIGZpbHRlcnM6IEZpbHRlcltdICk6IHZvaWQge1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIEFycmF5LmlzQXJyYXkoIGZpbHRlcnMgKSwgJ2ZpbHRlcnMgc2hvdWxkIGJlIGFuIGFycmF5JyApO1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIF8uZXZlcnkoIGZpbHRlcnMsIGZpbHRlciA9PiBmaWx0ZXIgaW5zdGFuY2VvZiBGaWx0ZXIgKSwgJ2ZpbHRlcnMgc2hvdWxkIGNvbnNpc3Qgb2YgRmlsdGVyIG9iamVjdHMgb25seScgKTtcblxuICAgIC8vIFdlIHJlLXVzZSB0aGUgc2FtZSBhcnJheSBpbnRlcm5hbGx5LCBzbyB3ZSBkb24ndCByZWZlcmVuY2UgYSBwb3RlbnRpYWxseS1tdXRhYmxlIGFycmF5IGZyb20gb3V0c2lkZS5cbiAgICB0aGlzLl9maWx0ZXJzLmxlbmd0aCA9IDA7XG4gICAgdGhpcy5fZmlsdGVycy5wdXNoKCAuLi5maWx0ZXJzICk7XG5cbiAgICB0aGlzLmludmFsaWRhdGVIaW50KCk7XG4gICAgdGhpcy5maWx0ZXJDaGFuZ2VFbWl0dGVyLmVtaXQoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZWUgc2V0RmlsdGVycygpIGZvciBtb3JlIGluZm9ybWF0aW9uXG4gICAqL1xuICBwdWJsaWMgc2V0IGZpbHRlcnMoIHZhbHVlOiBGaWx0ZXJbXSApIHtcbiAgICB0aGlzLnNldEZpbHRlcnMoIHZhbHVlICk7XG4gIH1cblxuICAvKipcbiAgICogU2VlIGdldEZpbHRlcnMoKSBmb3IgbW9yZSBpbmZvcm1hdGlvblxuICAgKi9cbiAgcHVibGljIGdldCBmaWx0ZXJzKCk6IEZpbHRlcltdIHtcbiAgICByZXR1cm4gdGhpcy5nZXRGaWx0ZXJzKCk7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgbm9uLW9wYWNpdHkgZmlsdGVycyBmb3IgdGhpcyBOb2RlLlxuICAgKi9cbiAgcHVibGljIGdldEZpbHRlcnMoKTogRmlsdGVyW10ge1xuICAgIHJldHVybiB0aGlzLl9maWx0ZXJzLnNsaWNlKCk7XG4gIH1cblxuICAvKipcbiAgICogU2V0cyB3aGF0IFByb3BlcnR5IG91ciBwaWNrYWJsZVByb3BlcnR5IGlzIGJhY2tlZCBieSwgc28gdGhhdCBjaGFuZ2VzIHRvIHRoaXMgcHJvdmlkZWQgUHJvcGVydHkgd2lsbCBjaGFuZ2UgdGhpc1xuICAgKiBOb2RlJ3MgcGlja2FiaWxpdHksIGFuZCB2aWNlIHZlcnNhLiBUaGlzIGRvZXMgbm90IGNoYW5nZSB0aGlzLl9waWNrYWJsZVByb3BlcnR5LiBTZWUgVGlueUZvcndhcmRpbmdQcm9wZXJ0eS5zZXRUYXJnZXRQcm9wZXJ0eSgpXG4gICAqIGZvciBtb3JlIGluZm8uXG4gICAqXG4gICAqIFBoRVQtaU8gSW5zdHJ1bWVudGVkIE5vZGVzIGRvIG5vdCBieSBkZWZhdWx0IGNyZWF0ZSB0aGVpciBvd24gaW5zdHJ1bWVudGVkIHBpY2thYmxlUHJvcGVydHksIGV2ZW4gdGhvdWdoIE5vZGUudmlzaWJsZVByb3BlcnR5IGRvZXMuXG4gICAqL1xuICBwdWJsaWMgc2V0UGlja2FibGVQcm9wZXJ0eSggbmV3VGFyZ2V0OiBUUmVhZE9ubHlQcm9wZXJ0eTxib29sZWFuIHwgbnVsbD4gfCBudWxsICk6IHRoaXMge1xuICAgIHJldHVybiB0aGlzLl9waWNrYWJsZVByb3BlcnR5LnNldFRhcmdldFByb3BlcnR5KCBuZXdUYXJnZXQgYXMgVFByb3BlcnR5PGJvb2xlYW4gfCBudWxsPiwgdGhpcywgbnVsbCApO1xuICB9XG5cbiAgLyoqXG4gICAqIFNlZSBzZXRQaWNrYWJsZVByb3BlcnR5KCkgZm9yIG1vcmUgaW5mb3JtYXRpb25cbiAgICovXG4gIHB1YmxpYyBzZXQgcGlja2FibGVQcm9wZXJ0eSggcHJvcGVydHk6IFRSZWFkT25seVByb3BlcnR5PGJvb2xlYW4gfCBudWxsPiB8IG51bGwgKSB7XG4gICAgdGhpcy5zZXRQaWNrYWJsZVByb3BlcnR5KCBwcm9wZXJ0eSApO1xuICB9XG5cbiAgLyoqXG4gICAqIFNlZSBnZXRQaWNrYWJsZVByb3BlcnR5KCkgZm9yIG1vcmUgaW5mb3JtYXRpb25cbiAgICovXG4gIHB1YmxpYyBnZXQgcGlja2FibGVQcm9wZXJ0eSgpOiBUUHJvcGVydHk8Ym9vbGVhbiB8IG51bGw+IHtcbiAgICByZXR1cm4gdGhpcy5nZXRQaWNrYWJsZVByb3BlcnR5KCk7XG4gIH1cblxuICAvKipcbiAgICogR2V0IHRoaXMgTm9kZSdzIHBpY2thYmxlUHJvcGVydHkuIE5vdGUhIFRoaXMgaXMgbm90IHRoZSByZWNpcHJvY2FsIG9mIHNldFBpY2thYmxlUHJvcGVydHkuIE5vZGUucHJvdG90eXBlLl9waWNrYWJsZVByb3BlcnR5XG4gICAqIGlzIGEgVGlueUZvcndhcmRpbmdQcm9wZXJ0eSwgYW5kIGlzIHNldCB1cCB0byBsaXN0ZW4gdG8gY2hhbmdlcyBmcm9tIHRoZSBwaWNrYWJsZVByb3BlcnR5IHByb3ZpZGVkIGJ5XG4gICAqIHNldFBpY2thYmxlUHJvcGVydHkoKSwgYnV0IHRoZSB1bmRlcmx5aW5nIHJlZmVyZW5jZSBkb2VzIG5vdCBjaGFuZ2UuIFRoaXMgbWVhbnMgdGhlIGZvbGxvd2luZzpcbiAgICogY29uc3QgbXlOb2RlID0gbmV3IE5vZGUoKTtcbiAgICogY29uc3QgcGlja2FibGVQcm9wZXJ0eSA9IG5ldyBQcm9wZXJ0eSggZmFsc2UgKTtcbiAgICogbXlOb2RlLnNldFBpY2thYmxlUHJvcGVydHkoIHBpY2thYmxlUHJvcGVydHkgKVxuICAgKiA9PiBteU5vZGUuZ2V0UGlja2FibGVQcm9wZXJ0eSgpICE9PSBwaWNrYWJsZVByb3BlcnR5ICghISEhISEpXG4gICAqXG4gICAqIFBsZWFzZSB1c2UgdGhpcyB3aXRoIGNhdXRpb24uIFNlZSBzZXRQaWNrYWJsZVByb3BlcnR5KCkgZm9yIG1vcmUgaW5mb3JtYXRpb24uXG4gICAqL1xuICBwdWJsaWMgZ2V0UGlja2FibGVQcm9wZXJ0eSgpOiBUUHJvcGVydHk8Ym9vbGVhbiB8IG51bGw+IHtcbiAgICByZXR1cm4gdGhpcy5fcGlja2FibGVQcm9wZXJ0eTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXRzIHdoZXRoZXIgdGhpcyBOb2RlIChhbmQgaXRzIHN1YnRyZWUpIHdpbGwgYWxsb3cgaGl0LXRlc3RpbmcgKGFuZCB0aHVzIHVzZXIgaW50ZXJhY3Rpb24pLCBjb250cm9sbGluZyB3aGF0XG4gICAqIFRyYWlsIGlzIHJldHVybmVkIGZyb20gbm9kZS50cmFpbFVuZGVyUG9pbnQoKS5cbiAgICpcbiAgICogUGlja2FibGUgY2FuIHRha2Ugb25lIG9mIHRocmVlIHZhbHVlczpcbiAgICogLSBudWxsOiAoZGVmYXVsdCkgcGFzcy10aHJvdWdoIGJlaGF2aW9yLiBIaXQtdGVzdGluZyB3aWxsIHBydW5lIHRoaXMgc3VidHJlZSBpZiB0aGVyZSBhcmUgbm9cbiAgICogICAgICAgICBhbmNlc3RvcnMvZGVzY2VuZGFudHMgd2l0aCBlaXRoZXIgcGlja2FibGU6IHRydWUgc2V0IG9yIHdpdGggYW55IGlucHV0IGxpc3RlbmVycy5cbiAgICogLSBmYWxzZTogSGl0LXRlc3RpbmcgaXMgcHJ1bmVkLCBub3RoaW5nIGluIHRoaXMgbm9kZSBvciBpdHMgc3VidHJlZSB3aWxsIHJlc3BvbmQgdG8gZXZlbnRzIG9yIGJlIHBpY2tlZC5cbiAgICogLSB0cnVlOiBIaXQtdGVzdGluZyB3aWxsIG5vdCBiZSBwcnVuZWQgaW4gdGhpcyBzdWJ0cmVlLCBleGNlcHQgZm9yIHBpY2thYmxlOiBmYWxzZSBjYXNlcy5cbiAgICpcbiAgICogSGl0IHRlc3RpbmcgaXMgYWNjb21wbGlzaGVkIG1haW5seSB3aXRoIG5vZGUudHJhaWxVbmRlclBvaW50ZXIoKSBhbmQgbm9kZS50cmFpbFVuZGVyUG9pbnQoKSwgZm9sbG93aW5nIHRoZVxuICAgKiBhYm92ZSBydWxlcy4gTm9kZXMgdGhhdCBhcmUgbm90IHBpY2thYmxlIChwcnVuZWQpIHdpbGwgbm90IGhhdmUgaW5wdXQgZXZlbnRzIHRhcmdldGVkIHRvIHRoZW0uXG4gICAqXG4gICAqIFRoZSBmb2xsb3dpbmcgcnVsZXMgKGFwcGxpZWQgaW4gdGhlIGdpdmVuIG9yZGVyKSBkZXRlcm1pbmUgd2hldGhlciBhIE5vZGUgKHJlYWxseSwgYSBUcmFpbCkgd2lsbCByZWNlaXZlIGlucHV0IGV2ZW50czpcbiAgICogMS4gSWYgdGhlIG5vZGUgb3Igb25lIG9mIGl0cyBhbmNlc3RvcnMgaGFzIHBpY2thYmxlOiBmYWxzZSBPUiBpcyBpbnZpc2libGUsIHRoZSBOb2RlICp3aWxsIG5vdCogcmVjZWl2ZSBldmVudHNcbiAgICogICAgb3IgaGl0IHRlc3RpbmcuXG4gICAqIDIuIElmIHRoZSBOb2RlIG9yIG9uZSBvZiBpdHMgYW5jZXN0b3JzIG9yIGRlc2NlbmRhbnRzIGlzIHBpY2thYmxlOiB0cnVlIE9SIGhhcyBhbiBpbnB1dCBsaXN0ZW5lciBhdHRhY2hlZCwgaXRcbiAgICogICAgKndpbGwqIHJlY2VpdmUgZXZlbnRzIG9yIGhpdCB0ZXN0aW5nLlxuICAgKiAzLiBPdGhlcndpc2UsIGl0ICp3aWxsIG5vdCogcmVjZWl2ZSBldmVudHMgb3IgaGl0IHRlc3RpbmcuXG4gICAqXG4gICAqIFRoaXMgaXMgdXNlZnVsIGZvciBzZW1pLXRyYW5zcGFyZW50IG92ZXJsYXlzIG9yIG90aGVyIHZpc3VhbCBlbGVtZW50cyB0aGF0IHNob3VsZCBiZSBkaXNwbGF5ZWQgYnV0IHNob3VsZCBub3RcbiAgICogcHJldmVudCBvYmplY3RzIGJlbG93IGZyb20gYmVpbmcgbWFuaXB1bGF0ZWQgYnkgdXNlciBpbnB1dCwgYW5kIHRoZSBkZWZhdWx0IG51bGwgdmFsdWUgaXMgdXNlZCB0byBpbmNyZWFzZVxuICAgKiBwZXJmb3JtYW5jZSBieSBpZ25vcmluZyBhcmVhcyB0aGF0IGRvbid0IG5lZWQgdXNlciBpbnB1dC5cbiAgICpcbiAgICogTk9URTogSWYgeW91IHdhbnQgc29tZXRoaW5nIHRvIGJlIHBpY2tlZCBcIm1vdXNlIGlzIG92ZXIgaXRcIiwgYnV0IGJsb2NrIGlucHV0IGV2ZW50cyBldmVuIGlmIHRoZXJlIGFyZSBsaXN0ZW5lcnMsXG4gICAqICAgICAgIHRoZW4gcGlja2FibGU6ZmFsc2UgaXMgbm90IGFwcHJvcHJpYXRlLCBhbmQgaW5wdXRFbmFibGVkOmZhbHNlIGlzIHByZWZlcnJlZC5cbiAgICpcbiAgICogRm9yIGEgdmlzdWFsIGV4YW1wbGUgb2YgaG93IHBpY2thYmlsaXR5IGludGVyYWN0cyB3aXRoIGlucHV0IGxpc3RlbmVycyBhbmQgdmlzaWJpbGl0eSwgc2VlIHRoZSBub3RlcyBhdCB0aGVcbiAgICogYm90dG9tIG9mIGh0dHA6Ly9waGV0c2ltcy5naXRodWIuaW8vc2NlbmVyeS9kb2MvaW1wbGVtZW50YXRpb24tbm90ZXMsIG9yIHNjZW5lcnkvYXNzZXRzL3BpY2thYmlsaXR5LnN2Zy5cbiAgICovXG4gIHB1YmxpYyBzZXRQaWNrYWJsZSggcGlja2FibGU6IGJvb2xlYW4gfCBudWxsICk6IHRoaXMge1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIHBpY2thYmxlID09PSBudWxsIHx8IHR5cGVvZiBwaWNrYWJsZSA9PT0gJ2Jvb2xlYW4nICk7XG4gICAgdGhpcy5fcGlja2FibGVQcm9wZXJ0eS5zZXQoIHBpY2thYmxlICk7XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBTZWUgc2V0UGlja2FibGUoKSBmb3IgbW9yZSBpbmZvcm1hdGlvblxuICAgKi9cbiAgcHVibGljIHNldCBwaWNrYWJsZSggdmFsdWU6IGJvb2xlYW4gfCBudWxsICkge1xuICAgIHRoaXMuc2V0UGlja2FibGUoIHZhbHVlICk7XG4gIH1cblxuICAvKipcbiAgICogU2VlIGlzUGlja2FibGUoKSBmb3IgbW9yZSBpbmZvcm1hdGlvblxuICAgKi9cbiAgcHVibGljIGdldCBwaWNrYWJsZSgpOiBib29sZWFuIHwgbnVsbCB7XG4gICAgcmV0dXJuIHRoaXMuaXNQaWNrYWJsZSgpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIHBpY2thYmlsaXR5IG9mIHRoaXMgbm9kZS5cbiAgICovXG4gIHB1YmxpYyBpc1BpY2thYmxlKCk6IGJvb2xlYW4gfCBudWxsIHtcbiAgICByZXR1cm4gdGhpcy5fcGlja2FibGVQcm9wZXJ0eS52YWx1ZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDYWxsZWQgd2hlbiBvdXIgcGlja2FibGVQcm9wZXJ0eSBjaGFuZ2VzIHZhbHVlcy5cbiAgICovXG4gIHByaXZhdGUgb25QaWNrYWJsZVByb3BlcnR5Q2hhbmdlKCBwaWNrYWJsZTogYm9vbGVhbiB8IG51bGwsIG9sZFBpY2thYmxlOiBib29sZWFuIHwgbnVsbCApOiB2b2lkIHtcbiAgICB0aGlzLl9waWNrZXIub25QaWNrYWJsZUNoYW5nZSggb2xkUGlja2FibGUsIHBpY2thYmxlICk7XG4gICAgaWYgKCBhc3NlcnRTbG93ICkgeyB0aGlzLl9waWNrZXIuYXVkaXQoKTsgfVxuICAgIC8vIFRPRE86IGludmFsaWRhdGUgdGhlIGN1cnNvciBzb21laG93PyAjMTUwXG4gIH1cblxuICAvKipcbiAgICogU2V0cyB3aGF0IFByb3BlcnR5IG91ciBlbmFibGVkUHJvcGVydHkgaXMgYmFja2VkIGJ5LCBzbyB0aGF0IGNoYW5nZXMgdG8gdGhpcyBwcm92aWRlZCBQcm9wZXJ0eSB3aWxsIGNoYW5nZSB0aGlzXG4gICAqIE5vZGUncyBlbmFibGVkLCBhbmQgdmljZSB2ZXJzYS4gVGhpcyBkb2VzIG5vdCBjaGFuZ2UgdGhpcy5fZW5hYmxlZFByb3BlcnR5LiBTZWUgVGlueUZvcndhcmRpbmdQcm9wZXJ0eS5zZXRUYXJnZXRQcm9wZXJ0eSgpXG4gICAqIGZvciBtb3JlIGluZm8uXG4gICAqXG4gICAqXG4gICAqIE5PVEUgRm9yIFBoRVQtaU8gdXNlOlxuICAgKiBBbGwgUGhFVC1pTyBpbnN0cnVtZW50ZWQgTm9kZXMgY3JlYXRlIHRoZWlyIG93biBpbnN0cnVtZW50ZWQgZW5hYmxlZFByb3BlcnR5IChpZiBvbmUgaXMgbm90IHBhc3NlZCBpbiBhc1xuICAgKiBhbiBvcHRpb24pLiBPbmNlIGEgTm9kZSdzIGVuYWJsZWRQcm9wZXJ0eSBoYXMgYmVlbiByZWdpc3RlcmVkIHdpdGggUGhFVC1pTywgaXQgY2Fubm90IGJlIFwic3dhcHBlZCBvdXRcIiBmb3IgYW5vdGhlci5cbiAgICogSWYgeW91IG5lZWQgdG8gXCJkZWxheVwiIHNldHRpbmcgYW4gaW5zdHJ1bWVudGVkIGVuYWJsZWRQcm9wZXJ0eSB0byB0aGlzIG5vZGUsIHBhc3MgcGhldGlvRW5hYmxlZFByb3BlcnR5SW5zdHJ1bWVudGVkXG4gICAqIHRvIGluc3RydW1lbnRhdGlvbiBjYWxsIHRvIHRoaXMgTm9kZSAod2hlcmUgVGFuZGVtIGlzIHByb3ZpZGVkKS5cbiAgICovXG4gIHB1YmxpYyBzZXRFbmFibGVkUHJvcGVydHkoIG5ld1RhcmdldDogVFJlYWRPbmx5UHJvcGVydHk8Ym9vbGVhbj4gfCBudWxsICk6IHRoaXMge1xuICAgIHJldHVybiB0aGlzLl9lbmFibGVkUHJvcGVydHkuc2V0VGFyZ2V0UHJvcGVydHkoIG5ld1RhcmdldCwgdGhpcywgRU5BQkxFRF9QUk9QRVJUWV9UQU5ERU1fTkFNRSApO1xuICB9XG5cbiAgLyoqXG4gICAqIFNlZSBzZXRFbmFibGVkUHJvcGVydHkoKSBmb3IgbW9yZSBpbmZvcm1hdGlvblxuICAgKi9cbiAgcHVibGljIHNldCBlbmFibGVkUHJvcGVydHkoIHByb3BlcnR5OiBUUmVhZE9ubHlQcm9wZXJ0eTxib29sZWFuPiB8IG51bGwgKSB7XG4gICAgdGhpcy5zZXRFbmFibGVkUHJvcGVydHkoIHByb3BlcnR5ICk7XG4gIH1cblxuICAvKipcbiAgICogU2VlIGdldEVuYWJsZWRQcm9wZXJ0eSgpIGZvciBtb3JlIGluZm9ybWF0aW9uXG4gICAqL1xuICBwdWJsaWMgZ2V0IGVuYWJsZWRQcm9wZXJ0eSgpOiBUUHJvcGVydHk8Ym9vbGVhbj4ge1xuICAgIHJldHVybiB0aGlzLmdldEVuYWJsZWRQcm9wZXJ0eSgpO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldCB0aGlzIE5vZGUncyBlbmFibGVkUHJvcGVydHkuIE5vdGUhIFRoaXMgaXMgbm90IHRoZSByZWNpcHJvY2FsIG9mIHNldEVuYWJsZWRQcm9wZXJ0eS4gTm9kZS5wcm90b3R5cGUuX2VuYWJsZWRQcm9wZXJ0eVxuICAgKiBpcyBhIFRpbnlGb3J3YXJkaW5nUHJvcGVydHksIGFuZCBpcyBzZXQgdXAgdG8gbGlzdGVuIHRvIGNoYW5nZXMgZnJvbSB0aGUgZW5hYmxlZFByb3BlcnR5IHByb3ZpZGVkIGJ5XG4gICAqIHNldEVuYWJsZWRQcm9wZXJ0eSgpLCBidXQgdGhlIHVuZGVybHlpbmcgcmVmZXJlbmNlIGRvZXMgbm90IGNoYW5nZS4gVGhpcyBtZWFucyB0aGUgZm9sbG93aW5nOlxuICAgKiBjb25zdCBteU5vZGUgPSBuZXcgTm9kZSgpO1xuICAgKiBjb25zdCBlbmFibGVkUHJvcGVydHkgPSBuZXcgUHJvcGVydHkoIGZhbHNlICk7XG4gICAqIG15Tm9kZS5zZXRFbmFibGVkUHJvcGVydHkoIGVuYWJsZWRQcm9wZXJ0eSApXG4gICAqID0+IG15Tm9kZS5nZXRFbmFibGVkUHJvcGVydHkoKSAhPT0gZW5hYmxlZFByb3BlcnR5ICghISEhISEpXG4gICAqXG4gICAqIFBsZWFzZSB1c2UgdGhpcyB3aXRoIGNhdXRpb24uIFNlZSBzZXRFbmFibGVkUHJvcGVydHkoKSBmb3IgbW9yZSBpbmZvcm1hdGlvbi5cbiAgICovXG4gIHB1YmxpYyBnZXRFbmFibGVkUHJvcGVydHkoKTogVFByb3BlcnR5PGJvb2xlYW4+IHtcbiAgICByZXR1cm4gdGhpcy5fZW5hYmxlZFByb3BlcnR5O1xuICB9XG5cbiAgLyoqXG4gICAqIFVzZSB0aGlzIHRvIGF1dG9tYXRpY2FsbHkgY3JlYXRlIGEgZm9yd2FyZGVkLCBQaEVULWlPIGluc3RydW1lbnRlZCBlbmFibGVkUHJvcGVydHkgaW50ZXJuYWwgdG8gTm9kZS4gVGhpcyBpcyBkaWZmZXJlbnRcbiAgICogZnJvbSB2aXNpYmxlIGJlY2F1c2UgZW5hYmxlZCBieSBkZWZhdWx0IGRvZXNuJ3Qgbm90IGNyZWF0ZSB0aGlzIGZvcndhcmRlZCBQcm9wZXJ0eS5cbiAgICovXG4gIHB1YmxpYyBzZXRQaGV0aW9FbmFibGVkUHJvcGVydHlJbnN0cnVtZW50ZWQoIHBoZXRpb0VuYWJsZWRQcm9wZXJ0eUluc3RydW1lbnRlZDogYm9vbGVhbiApOiB0aGlzIHtcbiAgICByZXR1cm4gdGhpcy5fZW5hYmxlZFByb3BlcnR5LnNldFRhcmdldFByb3BlcnR5SW5zdHJ1bWVudGVkKCBwaGV0aW9FbmFibGVkUHJvcGVydHlJbnN0cnVtZW50ZWQsIHRoaXMgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZWUgc2V0UGhldGlvRW5hYmxlZFByb3BlcnR5SW5zdHJ1bWVudGVkKCkgZm9yIG1vcmUgaW5mb3JtYXRpb25cbiAgICovXG4gIHB1YmxpYyBzZXQgcGhldGlvRW5hYmxlZFByb3BlcnR5SW5zdHJ1bWVudGVkKCB2YWx1ZTogYm9vbGVhbiApIHtcbiAgICB0aGlzLnNldFBoZXRpb0VuYWJsZWRQcm9wZXJ0eUluc3RydW1lbnRlZCggdmFsdWUgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZWUgZ2V0UGhldGlvRW5hYmxlZFByb3BlcnR5SW5zdHJ1bWVudGVkKCkgZm9yIG1vcmUgaW5mb3JtYXRpb25cbiAgICovXG4gIHB1YmxpYyBnZXQgcGhldGlvRW5hYmxlZFByb3BlcnR5SW5zdHJ1bWVudGVkKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLmdldFBoZXRpb0VuYWJsZWRQcm9wZXJ0eUluc3RydW1lbnRlZCgpO1xuICB9XG5cbiAgcHVibGljIGdldFBoZXRpb0VuYWJsZWRQcm9wZXJ0eUluc3RydW1lbnRlZCgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5fZW5hYmxlZFByb3BlcnR5LmdldFRhcmdldFByb3BlcnR5SW5zdHJ1bWVudGVkKCk7XG4gIH1cblxuICAvKipcbiAgICogU2V0cyB3aGV0aGVyIHRoaXMgTm9kZSBpcyBlbmFibGVkXG4gICAqL1xuICBwdWJsaWMgc2V0RW5hYmxlZCggZW5hYmxlZDogYm9vbGVhbiApOiB0aGlzIHtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBlbmFibGVkID09PSBudWxsIHx8IHR5cGVvZiBlbmFibGVkID09PSAnYm9vbGVhbicgKTtcbiAgICB0aGlzLl9lbmFibGVkUHJvcGVydHkuc2V0KCBlbmFibGVkICk7XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBTZWUgc2V0RW5hYmxlZCgpIGZvciBtb3JlIGluZm9ybWF0aW9uXG4gICAqL1xuICBwdWJsaWMgc2V0IGVuYWJsZWQoIHZhbHVlOiBib29sZWFuICkge1xuICAgIHRoaXMuc2V0RW5hYmxlZCggdmFsdWUgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZWUgaXNFbmFibGVkKCkgZm9yIG1vcmUgaW5mb3JtYXRpb25cbiAgICovXG4gIHB1YmxpYyBnZXQgZW5hYmxlZCgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5pc0VuYWJsZWQoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBlbmFibGVkIG9mIHRoaXMgbm9kZS5cbiAgICovXG4gIHB1YmxpYyBpc0VuYWJsZWQoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuX2VuYWJsZWRQcm9wZXJ0eS52YWx1ZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDYWxsZWQgd2hlbiBlbmFibGVkUHJvcGVydHkgY2hhbmdlcyB2YWx1ZXMuXG4gICAqIC0gb3ZlcnJpZGUgdGhpcyB0byBjaGFuZ2UgdGhlIGJlaGF2aW9yIG9mIGVuYWJsZWRcbiAgICovXG4gIHByb3RlY3RlZCBvbkVuYWJsZWRQcm9wZXJ0eUNoYW5nZSggZW5hYmxlZDogYm9vbGVhbiApOiB2b2lkIHtcbiAgICAhZW5hYmxlZCAmJiB0aGlzLmludGVycnVwdFN1YnRyZWVJbnB1dCgpO1xuXG4gICAgLy8gV2UgZG9uJ3Qgd2FudCB0byBvdmVyc3RlcCBoZXJlIGlmIGlucHV0RW5hYmxlZFByb3BlcnR5IGhhcyBiZWVuIHNldCBlbHNld2hlcmUgdG8gYmUgYSBEZXJpdmVkUHJvcGVydHkuXG4gICAgaWYgKCB0aGlzLmlucHV0RW5hYmxlZFByb3BlcnR5LmlzU2V0dGFibGUoKSApIHtcbiAgICAgIHRoaXMuaW5wdXRFbmFibGVkID0gZW5hYmxlZDtcbiAgICB9XG5cbiAgICAvLyAxIG1lYW5zIFwibm8gZGlmZmVyZW50IHRoYW4gdGhlIGN1cnJlbnQsIGVuYWJsZWQgb3BhY2l0eVwiLCBzZWUgdGhpcy5nZXRFZmZlY3RpdmVPcGFjaXR5KClcbiAgICBpZiAoIHRoaXMuZGlzYWJsZWRPcGFjaXR5UHJvcGVydHkudmFsdWUgIT09IDEgKSB7XG4gICAgICB0aGlzLmZpbHRlckNoYW5nZUVtaXR0ZXIuZW1pdCgpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBTZXRzIHdoYXQgUHJvcGVydHkgb3VyIGlucHV0RW5hYmxlZFByb3BlcnR5IGlzIGJhY2tlZCBieSwgc28gdGhhdCBjaGFuZ2VzIHRvIHRoaXMgcHJvdmlkZWQgUHJvcGVydHkgd2lsbCBjaGFuZ2UgdGhpcyB3aGV0aGVyIHRoaXNcbiAgICogTm9kZSdzIGlucHV0IGlzIGVuYWJsZWQsIGFuZCB2aWNlIHZlcnNhLiBUaGlzIGRvZXMgbm90IGNoYW5nZSB0aGlzLl9pbnB1dEVuYWJsZWRQcm9wZXJ0eS4gU2VlIFRpbnlGb3J3YXJkaW5nUHJvcGVydHkuc2V0VGFyZ2V0UHJvcGVydHkoKVxuICAgKiBmb3IgbW9yZSBpbmZvLlxuICAgKlxuICAgKiBOT1RFIEZvciBQaEVULWlPIHVzZTpcbiAgICogQWxsIFBoRVQtaU8gaW5zdHJ1bWVudGVkIE5vZGVzIGNyZWF0ZSB0aGVpciBvd24gaW5zdHJ1bWVudGVkIGlucHV0RW5hYmxlZFByb3BlcnR5IChpZiBvbmUgaXMgbm90IHBhc3NlZCBpbiBhc1xuICAgKiBhbiBvcHRpb24pLiBPbmNlIGEgTm9kZSdzIGlucHV0RW5hYmxlZFByb3BlcnR5IGhhcyBiZWVuIHJlZ2lzdGVyZWQgd2l0aCBQaEVULWlPLCBpdCBjYW5ub3QgYmUgXCJzd2FwcGVkIG91dFwiIGZvciBhbm90aGVyLlxuICAgKiBJZiB5b3UgbmVlZCB0byBcImRlbGF5XCIgc2V0dGluZyBhbiBpbnN0cnVtZW50ZWQgaW5wdXRFbmFibGVkUHJvcGVydHkgdG8gdGhpcyBub2RlLCBwYXNzIHBoZXRpb0lucHV0RW5hYmxlZFByb3BlcnR5SW5zdHJ1bWVudGVkXG4gICAqIHRvIGluc3RydW1lbnRhdGlvbiBjYWxsIHRvIHRoaXMgTm9kZSAod2hlcmUgVGFuZGVtIGlzIHByb3ZpZGVkKS5cbiAgICovXG4gIHB1YmxpYyBzZXRJbnB1dEVuYWJsZWRQcm9wZXJ0eSggbmV3VGFyZ2V0OiBUUmVhZE9ubHlQcm9wZXJ0eTxib29sZWFuPiB8IG51bGwgKTogdGhpcyB7XG4gICAgcmV0dXJuIHRoaXMuX2lucHV0RW5hYmxlZFByb3BlcnR5LnNldFRhcmdldFByb3BlcnR5KCBuZXdUYXJnZXQsIHRoaXMsIElOUFVUX0VOQUJMRURfUFJPUEVSVFlfVEFOREVNX05BTUUgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZWUgc2V0SW5wdXRFbmFibGVkUHJvcGVydHkoKSBmb3IgbW9yZSBpbmZvcm1hdGlvblxuICAgKi9cbiAgcHVibGljIHNldCBpbnB1dEVuYWJsZWRQcm9wZXJ0eSggcHJvcGVydHk6IFRSZWFkT25seVByb3BlcnR5PGJvb2xlYW4+IHwgbnVsbCApIHtcbiAgICB0aGlzLnNldElucHV0RW5hYmxlZFByb3BlcnR5KCBwcm9wZXJ0eSApO1xuICB9XG5cbiAgLyoqXG4gICAqIFNlZSBnZXRJbnB1dEVuYWJsZWRQcm9wZXJ0eSgpIGZvciBtb3JlIGluZm9ybWF0aW9uXG4gICAqL1xuICBwdWJsaWMgZ2V0IGlucHV0RW5hYmxlZFByb3BlcnR5KCk6IFRQcm9wZXJ0eTxib29sZWFuPiB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0SW5wdXRFbmFibGVkUHJvcGVydHkoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgdGhpcyBOb2RlJ3MgaW5wdXRFbmFibGVkUHJvcGVydHkuIE5vdGUhIFRoaXMgaXMgbm90IHRoZSByZWNpcHJvY2FsIG9mIHNldElucHV0RW5hYmxlZFByb3BlcnR5LiBOb2RlLnByb3RvdHlwZS5faW5wdXRFbmFibGVkUHJvcGVydHlcbiAgICogaXMgYSBUaW55Rm9yd2FyZGluZ1Byb3BlcnR5LCBhbmQgaXMgc2V0IHVwIHRvIGxpc3RlbiB0byBjaGFuZ2VzIGZyb20gdGhlIGlucHV0RW5hYmxlZFByb3BlcnR5IHByb3ZpZGVkIGJ5XG4gICAqIHNldElucHV0RW5hYmxlZFByb3BlcnR5KCksIGJ1dCB0aGUgdW5kZXJseWluZyByZWZlcmVuY2UgZG9lcyBub3QgY2hhbmdlLiBUaGlzIG1lYW5zIHRoZSBmb2xsb3dpbmc6XG4gICAqIGNvbnN0IG15Tm9kZSA9IG5ldyBOb2RlKCk7XG4gICAqIGNvbnN0IGlucHV0RW5hYmxlZFByb3BlcnR5ID0gbmV3IFByb3BlcnR5KCBmYWxzZSApO1xuICAgKiBteU5vZGUuc2V0SW5wdXRFbmFibGVkUHJvcGVydHkoIGlucHV0RW5hYmxlZFByb3BlcnR5IClcbiAgICogPT4gbXlOb2RlLmdldElucHV0RW5hYmxlZFByb3BlcnR5KCkgIT09IGlucHV0RW5hYmxlZFByb3BlcnR5ICghISEhISEpXG4gICAqXG4gICAqIFBsZWFzZSB1c2UgdGhpcyB3aXRoIGNhdXRpb24uIFNlZSBzZXRJbnB1dEVuYWJsZWRQcm9wZXJ0eSgpIGZvciBtb3JlIGluZm9ybWF0aW9uLlxuICAgKi9cbiAgcHVibGljIGdldElucHV0RW5hYmxlZFByb3BlcnR5KCk6IFRQcm9wZXJ0eTxib29sZWFuPiB7XG4gICAgcmV0dXJuIHRoaXMuX2lucHV0RW5hYmxlZFByb3BlcnR5O1xuICB9XG5cbiAgLyoqXG4gICAqIFVzZSB0aGlzIHRvIGF1dG9tYXRpY2FsbHkgY3JlYXRlIGEgZm9yd2FyZGVkLCBQaEVULWlPIGluc3RydW1lbnRlZCBpbnB1dEVuYWJsZWRQcm9wZXJ0eSBpbnRlcm5hbCB0byBOb2RlLiBUaGlzIGlzIGRpZmZlcmVudFxuICAgKiBmcm9tIHZpc2libGUgYmVjYXVzZSBpbnB1dEVuYWJsZWQgYnkgZGVmYXVsdCBkb2Vzbid0IG5vdCBjcmVhdGUgdGhpcyBmb3J3YXJkZWQgUHJvcGVydHkuXG4gICAqL1xuICBwdWJsaWMgc2V0UGhldGlvSW5wdXRFbmFibGVkUHJvcGVydHlJbnN0cnVtZW50ZWQoIHBoZXRpb0lucHV0RW5hYmxlZFByb3BlcnR5SW5zdHJ1bWVudGVkOiBib29sZWFuICk6IHRoaXMge1xuICAgIHJldHVybiB0aGlzLl9pbnB1dEVuYWJsZWRQcm9wZXJ0eS5zZXRUYXJnZXRQcm9wZXJ0eUluc3RydW1lbnRlZCggcGhldGlvSW5wdXRFbmFibGVkUHJvcGVydHlJbnN0cnVtZW50ZWQsIHRoaXMgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZWUgc2V0UGhldGlvSW5wdXRFbmFibGVkUHJvcGVydHlJbnN0cnVtZW50ZWQoKSBmb3IgbW9yZSBpbmZvcm1hdGlvblxuICAgKi9cbiAgcHVibGljIHNldCBwaGV0aW9JbnB1dEVuYWJsZWRQcm9wZXJ0eUluc3RydW1lbnRlZCggdmFsdWU6IGJvb2xlYW4gKSB7XG4gICAgdGhpcy5zZXRQaGV0aW9JbnB1dEVuYWJsZWRQcm9wZXJ0eUluc3RydW1lbnRlZCggdmFsdWUgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZWUgZ2V0UGhldGlvSW5wdXRFbmFibGVkUHJvcGVydHlJbnN0cnVtZW50ZWQoKSBmb3IgbW9yZSBpbmZvcm1hdGlvblxuICAgKi9cbiAgcHVibGljIGdldCBwaGV0aW9JbnB1dEVuYWJsZWRQcm9wZXJ0eUluc3RydW1lbnRlZCgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5nZXRQaGV0aW9JbnB1dEVuYWJsZWRQcm9wZXJ0eUluc3RydW1lbnRlZCgpO1xuICB9XG5cbiAgcHVibGljIGdldFBoZXRpb0lucHV0RW5hYmxlZFByb3BlcnR5SW5zdHJ1bWVudGVkKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLl9pbnB1dEVuYWJsZWRQcm9wZXJ0eS5nZXRUYXJnZXRQcm9wZXJ0eUluc3RydW1lbnRlZCgpO1xuICB9XG5cbiAgLyoqXG4gICAqIFNldHMgd2hldGhlciBpbnB1dCBpcyBlbmFibGVkIGZvciB0aGlzIE5vZGUgYW5kIGl0cyBzdWJ0cmVlLiBJZiBmYWxzZSwgaW5wdXQgZXZlbnQgbGlzdGVuZXJzIHdpbGwgbm90IGJlIGZpcmVkXG4gICAqIG9uIHRoaXMgTm9kZSBvciBpdHMgZGVzY2VuZGFudHMgaW4gdGhlIHBpY2tlZCBUcmFpbC4gVGhpcyBkb2VzIE5PVCBlZmZlY3QgcGlja2luZyAod2hhdCBUcmFpbC9ub2RlcyBhcmUgdW5kZXJcbiAgICogYSBwb2ludGVyKSwgYnV0IG9ubHkgZWZmZWN0cyB3aGF0IGxpc3RlbmVycyBhcmUgZmlyZWQuXG4gICAqXG4gICAqIEFkZGl0aW9uYWxseSwgdGhpcyB3aWxsIGFmZmVjdCBjdXJzb3IgYmVoYXZpb3IuIElmIGlucHV0RW5hYmxlZD1mYWxzZSwgZGVzY2VuZGFudHMgb2YgdGhpcyBOb2RlIHdpbGwgbm90IGJlXG4gICAqIGNoZWNrZWQgd2hlbiBkZXRlcm1pbmluZyB3aGF0IGN1cnNvciB3aWxsIGJlIHNob3duLiBJbnN0ZWFkLCBpZiBhIHBvaW50ZXIgKGUuZy4gbW91c2UpIGlzIG92ZXIgYSBkZXNjZW5kYW50LFxuICAgKiB0aGlzIE5vZGUncyBjdXJzb3Igd2lsbCBiZSBjaGVja2VkIGZpcnN0LCB0aGVuIGFuY2VzdG9ycyB3aWxsIGJlIGNoZWNrZWQgYXMgbm9ybWFsLlxuICAgKi9cbiAgcHVibGljIHNldElucHV0RW5hYmxlZCggaW5wdXRFbmFibGVkOiBib29sZWFuICk6IHZvaWQge1xuICAgIHRoaXMuaW5wdXRFbmFibGVkUHJvcGVydHkudmFsdWUgPSBpbnB1dEVuYWJsZWQ7XG4gIH1cblxuICAvKipcbiAgICogU2VlIHNldElucHV0RW5hYmxlZCgpIGZvciBtb3JlIGluZm9ybWF0aW9uXG4gICAqL1xuICBwdWJsaWMgc2V0IGlucHV0RW5hYmxlZCggdmFsdWU6IGJvb2xlYW4gKSB7XG4gICAgdGhpcy5zZXRJbnB1dEVuYWJsZWQoIHZhbHVlICk7XG4gIH1cblxuICAvKipcbiAgICogU2VlIGlzSW5wdXRFbmFibGVkKCkgZm9yIG1vcmUgaW5mb3JtYXRpb25cbiAgICovXG4gIHB1YmxpYyBnZXQgaW5wdXRFbmFibGVkKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLmlzSW5wdXRFbmFibGVkKCk7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB3aGV0aGVyIGlucHV0IGlzIGVuYWJsZWQgZm9yIHRoaXMgTm9kZSBhbmQgaXRzIHN1YnRyZWUuIFNlZSBzZXRJbnB1dEVuYWJsZWQgZm9yIG1vcmUgZG9jdW1lbnRhdGlvbi5cbiAgICovXG4gIHB1YmxpYyBpc0lucHV0RW5hYmxlZCgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5pbnB1dEVuYWJsZWRQcm9wZXJ0eS52YWx1ZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXRzIGFsbCBvZiB0aGUgaW5wdXQgbGlzdGVuZXJzIGF0dGFjaGVkIHRvIHRoaXMgTm9kZS5cbiAgICpcbiAgICogVGhpcyBpcyBlcXVpdmFsZW50IHRvIHJlbW92aW5nIGFsbCBjdXJyZW50IGlucHV0IGxpc3RlbmVycyB3aXRoIHJlbW92ZUlucHV0TGlzdGVuZXIoKSBhbmQgYWRkaW5nIGFsbCBuZXdcbiAgICogbGlzdGVuZXJzIChpbiBvcmRlcikgd2l0aCBhZGRJbnB1dExpc3RlbmVyKCkuXG4gICAqL1xuICBwdWJsaWMgc2V0SW5wdXRMaXN0ZW5lcnMoIGlucHV0TGlzdGVuZXJzOiBUSW5wdXRMaXN0ZW5lcltdICk6IHRoaXMge1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIEFycmF5LmlzQXJyYXkoIGlucHV0TGlzdGVuZXJzICkgKTtcblxuICAgIC8vIFJlbW92ZSBhbGwgb2xkIGlucHV0IGxpc3RlbmVyc1xuICAgIHdoaWxlICggdGhpcy5faW5wdXRMaXN0ZW5lcnMubGVuZ3RoICkge1xuICAgICAgdGhpcy5yZW1vdmVJbnB1dExpc3RlbmVyKCB0aGlzLl9pbnB1dExpc3RlbmVyc1sgMCBdICk7XG4gICAgfVxuXG4gICAgLy8gQWRkIGluIGFsbCBuZXcgaW5wdXQgbGlzdGVuZXJzXG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgaW5wdXRMaXN0ZW5lcnMubGVuZ3RoOyBpKysgKSB7XG4gICAgICB0aGlzLmFkZElucHV0TGlzdGVuZXIoIGlucHV0TGlzdGVuZXJzWyBpIF0gKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBTZWUgc2V0SW5wdXRMaXN0ZW5lcnMoKSBmb3IgbW9yZSBpbmZvcm1hdGlvblxuICAgKi9cbiAgcHVibGljIHNldCBpbnB1dExpc3RlbmVycyggdmFsdWU6IFRJbnB1dExpc3RlbmVyW10gKSB7XG4gICAgdGhpcy5zZXRJbnB1dExpc3RlbmVycyggdmFsdWUgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZWUgZ2V0SW5wdXRMaXN0ZW5lcnMoKSBmb3IgbW9yZSBpbmZvcm1hdGlvblxuICAgKi9cbiAgcHVibGljIGdldCBpbnB1dExpc3RlbmVycygpOiBUSW5wdXRMaXN0ZW5lcltdIHtcbiAgICByZXR1cm4gdGhpcy5nZXRJbnB1dExpc3RlbmVycygpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgYSBjb3B5IG9mIGFsbCBvZiBvdXIgaW5wdXQgbGlzdGVuZXJzLlxuICAgKi9cbiAgcHVibGljIGdldElucHV0TGlzdGVuZXJzKCk6IFRJbnB1dExpc3RlbmVyW10ge1xuICAgIHJldHVybiB0aGlzLl9pbnB1dExpc3RlbmVycy5zbGljZSggMCApOyAvLyBkZWZlbnNpdmUgY29weVxuICB9XG5cbiAgLyoqXG4gICAqIFNldHMgdGhlIENTUyBjdXJzb3Igc3RyaW5nIHRoYXQgc2hvdWxkIGJlIHVzZWQgd2hlbiB0aGUgbW91c2UgaXMgb3ZlciB0aGlzIG5vZGUuIG51bGwgaXMgdGhlIGRlZmF1bHQsIGFuZFxuICAgKiBpbmRpY2F0ZXMgdGhhdCBhbmNlc3RvciBub2RlcyAob3IgdGhlIGJyb3dzZXIgZGVmYXVsdCkgc2hvdWxkIGJlIHVzZWQuXG4gICAqXG4gICAqIEBwYXJhbSBjdXJzb3IgLSBBIENTUyBjdXJzb3Igc3RyaW5nLCBsaWtlICdwb2ludGVyJywgb3IgJ25vbmUnIC0gRXhhbXBsZXMgYXJlOlxuICAgKiBhdXRvIGRlZmF1bHQgbm9uZSBpbmhlcml0IGhlbHAgcG9pbnRlciBwcm9ncmVzcyB3YWl0IGNyb3NzaGFpciB0ZXh0IHZlcnRpY2FsLXRleHQgYWxpYXMgY29weSBtb3ZlIG5vLWRyb3Agbm90LWFsbG93ZWRcbiAgICogZS1yZXNpemUgbi1yZXNpemUgdy1yZXNpemUgcy1yZXNpemUgbnctcmVzaXplIG5lLXJlc2l6ZSBzZS1yZXNpemUgc3ctcmVzaXplIGV3LXJlc2l6ZSBucy1yZXNpemUgbmVzdy1yZXNpemUgbndzZS1yZXNpemVcbiAgICogY29udGV4dC1tZW51IGNlbGwgY29sLXJlc2l6ZSByb3ctcmVzaXplIGFsbC1zY3JvbGwgdXJsKCAuLi4gKSAtLT4gZG9lcyBpdCBzdXBwb3J0IGRhdGEgVVJMcz9cbiAgICovXG4gIHB1YmxpYyBzZXRDdXJzb3IoIGN1cnNvcjogc3RyaW5nIHwgbnVsbCApOiB2b2lkIHtcblxuICAgIC8vIFRPRE86IGNvbnNpZGVyIGEgbWFwcGluZyBvZiB0eXBlcyB0byBzZXQgcmVhc29uYWJsZSBkZWZhdWx0cyBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvc2NlbmVyeS9pc3N1ZXMvMTU4MVxuXG4gICAgLy8gYWxsb3cgdGhlICdhdXRvJyBjdXJzb3IgdHlwZSB0byBsZXQgdGhlIGFuY2VzdG9ycyBvciBzY2VuZSBwaWNrIHRoZSBjdXJzb3IgdHlwZVxuICAgIHRoaXMuX2N1cnNvciA9IGN1cnNvciA9PT0gJ2F1dG8nID8gbnVsbCA6IGN1cnNvcjtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZWUgc2V0Q3Vyc29yKCkgZm9yIG1vcmUgaW5mb3JtYXRpb25cbiAgICovXG4gIHB1YmxpYyBzZXQgY3Vyc29yKCB2YWx1ZTogc3RyaW5nIHwgbnVsbCApIHtcbiAgICB0aGlzLnNldEN1cnNvciggdmFsdWUgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZWUgZ2V0Q3Vyc29yKCkgZm9yIG1vcmUgaW5mb3JtYXRpb25cbiAgICovXG4gIHB1YmxpYyBnZXQgY3Vyc29yKCk6IHN0cmluZyB8IG51bGwge1xuICAgIHJldHVybiB0aGlzLmdldEN1cnNvcigpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIENTUyBjdXJzb3Igc3RyaW5nIGZvciB0aGlzIG5vZGUsIG9yIG51bGwgaWYgdGhlcmUgaXMgbm8gY3Vyc29yIHNwZWNpZmllZC5cbiAgICovXG4gIHB1YmxpYyBnZXRDdXJzb3IoKTogc3RyaW5nIHwgbnVsbCB7XG4gICAgcmV0dXJuIHRoaXMuX2N1cnNvcjtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBDU1MgY3Vyc29yIHRoYXQgY291bGQgYmUgYXBwbGllZCBlaXRoZXIgYnkgdGhpcyBOb2RlIGl0c2VsZiwgb3IgZnJvbSBhbnkgb2YgaXRzIGlucHV0IGxpc3RlbmVycydcbiAgICogcHJlZmVyZW5jZXMuIChzY2VuZXJ5LWludGVybmFsKVxuICAgKi9cbiAgcHVibGljIGdldEVmZmVjdGl2ZUN1cnNvcigpOiBzdHJpbmcgfCBudWxsIHtcbiAgICBpZiAoIHRoaXMuX2N1cnNvciApIHtcbiAgICAgIHJldHVybiB0aGlzLl9jdXJzb3I7XG4gICAgfVxuXG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgdGhpcy5faW5wdXRMaXN0ZW5lcnMubGVuZ3RoOyBpKysgKSB7XG4gICAgICBjb25zdCBpbnB1dExpc3RlbmVyID0gdGhpcy5faW5wdXRMaXN0ZW5lcnNbIGkgXTtcblxuICAgICAgaWYgKCBpbnB1dExpc3RlbmVyLmN1cnNvciApIHtcbiAgICAgICAgcmV0dXJuIGlucHV0TGlzdGVuZXIuY3Vyc29yO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgLyoqXG4gICAqIFNldHMgdGhlIGhpdC10ZXN0ZWQgbW91c2UgYXJlYSBmb3IgdGhpcyBOb2RlIChzZWUgY29uc3RydWN0b3IgZm9yIG1vcmUgYWR2YW5jZWQgZG9jdW1lbnRhdGlvbikuIFVzZSBudWxsIGZvciB0aGVcbiAgICogZGVmYXVsdCBiZWhhdmlvci5cbiAgICovXG4gIHB1YmxpYyBzZXRNb3VzZUFyZWEoIGFyZWE6IFNoYXBlIHwgQm91bmRzMiB8IG51bGwgKTogdGhpcyB7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggYXJlYSA9PT0gbnVsbCB8fCBhcmVhIGluc3RhbmNlb2YgU2hhcGUgfHwgYXJlYSBpbnN0YW5jZW9mIEJvdW5kczIsICdtb3VzZUFyZWEgbmVlZHMgdG8gYmUgYSBwaGV0LmtpdGUuU2hhcGUsIHBoZXQuZG90LkJvdW5kczIsIG9yIG51bGwnICk7XG5cbiAgICBpZiAoIHRoaXMuX21vdXNlQXJlYSAhPT0gYXJlYSApIHtcbiAgICAgIHRoaXMuX21vdXNlQXJlYSA9IGFyZWE7IC8vIFRPRE86IGNvdWxkIGNoYW5nZSB3aGF0IGlzIHVuZGVyIHRoZSBtb3VzZSwgaW52YWxpZGF0ZSEgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3NjZW5lcnkvaXNzdWVzLzE1ODFcblxuICAgICAgdGhpcy5fcGlja2VyLm9uTW91c2VBcmVhQ2hhbmdlKCk7XG4gICAgICBpZiAoIGFzc2VydFNsb3cgKSB7IHRoaXMuX3BpY2tlci5hdWRpdCgpOyB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogU2VlIHNldE1vdXNlQXJlYSgpIGZvciBtb3JlIGluZm9ybWF0aW9uXG4gICAqL1xuICBwdWJsaWMgc2V0IG1vdXNlQXJlYSggdmFsdWU6IFNoYXBlIHwgQm91bmRzMiB8IG51bGwgKSB7XG4gICAgdGhpcy5zZXRNb3VzZUFyZWEoIHZhbHVlICk7XG4gIH1cblxuICAvKipcbiAgICogU2VlIGdldE1vdXNlQXJlYSgpIGZvciBtb3JlIGluZm9ybWF0aW9uXG4gICAqL1xuICBwdWJsaWMgZ2V0IG1vdXNlQXJlYSgpOiBTaGFwZSB8IEJvdW5kczIgfCBudWxsIHtcbiAgICByZXR1cm4gdGhpcy5nZXRNb3VzZUFyZWEoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBoaXQtdGVzdGVkIG1vdXNlIGFyZWEgZm9yIHRoaXMgbm9kZS5cbiAgICovXG4gIHB1YmxpYyBnZXRNb3VzZUFyZWEoKTogU2hhcGUgfCBCb3VuZHMyIHwgbnVsbCB7XG4gICAgcmV0dXJuIHRoaXMuX21vdXNlQXJlYTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXRzIHRoZSBoaXQtdGVzdGVkIHRvdWNoIGFyZWEgZm9yIHRoaXMgTm9kZSAoc2VlIGNvbnN0cnVjdG9yIGZvciBtb3JlIGFkdmFuY2VkIGRvY3VtZW50YXRpb24pLiBVc2UgbnVsbCBmb3IgdGhlXG4gICAqIGRlZmF1bHQgYmVoYXZpb3IuXG4gICAqL1xuICBwdWJsaWMgc2V0VG91Y2hBcmVhKCBhcmVhOiBTaGFwZSB8IEJvdW5kczIgfCBudWxsICk6IHRoaXMge1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIGFyZWEgPT09IG51bGwgfHwgYXJlYSBpbnN0YW5jZW9mIFNoYXBlIHx8IGFyZWEgaW5zdGFuY2VvZiBCb3VuZHMyLCAndG91Y2hBcmVhIG5lZWRzIHRvIGJlIGEgcGhldC5raXRlLlNoYXBlLCBwaGV0LmRvdC5Cb3VuZHMyLCBvciBudWxsJyApO1xuXG4gICAgaWYgKCB0aGlzLl90b3VjaEFyZWEgIT09IGFyZWEgKSB7XG4gICAgICB0aGlzLl90b3VjaEFyZWEgPSBhcmVhOyAvLyBUT0RPOiBjb3VsZCBjaGFuZ2Ugd2hhdCBpcyB1bmRlciB0aGUgdG91Y2gsIGludmFsaWRhdGUhIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9zY2VuZXJ5L2lzc3Vlcy8xNTgxXG5cbiAgICAgIHRoaXMuX3BpY2tlci5vblRvdWNoQXJlYUNoYW5nZSgpO1xuICAgICAgaWYgKCBhc3NlcnRTbG93ICkgeyB0aGlzLl9waWNrZXIuYXVkaXQoKTsgfVxuICAgIH1cblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIFNlZSBzZXRUb3VjaEFyZWEoKSBmb3IgbW9yZSBpbmZvcm1hdGlvblxuICAgKi9cbiAgcHVibGljIHNldCB0b3VjaEFyZWEoIHZhbHVlOiBTaGFwZSB8IEJvdW5kczIgfCBudWxsICkge1xuICAgIHRoaXMuc2V0VG91Y2hBcmVhKCB2YWx1ZSApO1xuICB9XG5cbiAgLyoqXG4gICAqIFNlZSBnZXRUb3VjaEFyZWEoKSBmb3IgbW9yZSBpbmZvcm1hdGlvblxuICAgKi9cbiAgcHVibGljIGdldCB0b3VjaEFyZWEoKTogU2hhcGUgfCBCb3VuZHMyIHwgbnVsbCB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0VG91Y2hBcmVhKCk7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgaGl0LXRlc3RlZCB0b3VjaCBhcmVhIGZvciB0aGlzIG5vZGUuXG4gICAqL1xuICBwdWJsaWMgZ2V0VG91Y2hBcmVhKCk6IFNoYXBlIHwgQm91bmRzMiB8IG51bGwge1xuICAgIHJldHVybiB0aGlzLl90b3VjaEFyZWE7XG4gIH1cblxuICAvKipcbiAgICogU2V0cyBhIGNsaXBwZWQgc2hhcGUgd2hlcmUgb25seSBjb250ZW50IGluIG91ciBsb2NhbCBjb29yZGluYXRlIGZyYW1lIHRoYXQgaXMgaW5zaWRlIHRoZSBjbGlwIGFyZWEgd2lsbCBiZSBzaG93blxuICAgKiAoYW55dGhpbmcgb3V0c2lkZSBpcyBmdWxseSB0cmFuc3BhcmVudCkuXG4gICAqL1xuICBwdWJsaWMgc2V0Q2xpcEFyZWEoIHNoYXBlOiBTaGFwZSB8IG51bGwgKTogdm9pZCB7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggc2hhcGUgPT09IG51bGwgfHwgc2hhcGUgaW5zdGFuY2VvZiBTaGFwZSwgJ2NsaXBBcmVhIG5lZWRzIHRvIGJlIGEgcGhldC5raXRlLlNoYXBlLCBvciBudWxsJyApO1xuXG4gICAgaWYgKCB0aGlzLmNsaXBBcmVhICE9PSBzaGFwZSApIHtcbiAgICAgIHRoaXMuY2xpcEFyZWFQcm9wZXJ0eS52YWx1ZSA9IHNoYXBlO1xuXG4gICAgICB0aGlzLmludmFsaWRhdGVCb3VuZHMoKTtcbiAgICAgIHRoaXMuX3BpY2tlci5vbkNsaXBBcmVhQ2hhbmdlKCk7XG5cbiAgICAgIGlmICggYXNzZXJ0U2xvdyApIHsgdGhpcy5fcGlja2VyLmF1ZGl0KCk7IH1cbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogU2VlIHNldENsaXBBcmVhKCkgZm9yIG1vcmUgaW5mb3JtYXRpb25cbiAgICovXG4gIHB1YmxpYyBzZXQgY2xpcEFyZWEoIHZhbHVlOiBTaGFwZSB8IG51bGwgKSB7XG4gICAgdGhpcy5zZXRDbGlwQXJlYSggdmFsdWUgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZWUgZ2V0Q2xpcEFyZWEoKSBmb3IgbW9yZSBpbmZvcm1hdGlvblxuICAgKi9cbiAgcHVibGljIGdldCBjbGlwQXJlYSgpOiBTaGFwZSB8IG51bGwge1xuICAgIHJldHVybiB0aGlzLmdldENsaXBBcmVhKCk7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgY2xpcHBlZCBhcmVhIGZvciB0aGlzIG5vZGUuXG4gICAqL1xuICBwdWJsaWMgZ2V0Q2xpcEFyZWEoKTogU2hhcGUgfCBudWxsIHtcbiAgICByZXR1cm4gdGhpcy5jbGlwQXJlYVByb3BlcnR5LnZhbHVlO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgd2hldGhlciB0aGlzIE5vZGUgaGFzIGEgY2xpcCBhcmVhLlxuICAgKi9cbiAgcHVibGljIGhhc0NsaXBBcmVhKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLmNsaXBBcmVhICE9PSBudWxsO1xuICB9XG5cbiAgLyoqXG4gICAqIFNldHMgd2hhdCBzZWxmIHJlbmRlcmVycyAoYW5kIG90aGVyIGJpdG1hc2sgZmxhZ3MpIGFyZSBzdXBwb3J0ZWQgYnkgdGhpcyBub2RlLlxuICAgKi9cbiAgcHJvdGVjdGVkIHNldFJlbmRlcmVyQml0bWFzayggYml0bWFzazogbnVtYmVyICk6IHZvaWQge1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIGlzRmluaXRlKCBiaXRtYXNrICkgKTtcblxuICAgIGlmICggYml0bWFzayAhPT0gdGhpcy5fcmVuZGVyZXJCaXRtYXNrICkge1xuICAgICAgdGhpcy5fcmVuZGVyZXJCaXRtYXNrID0gYml0bWFzaztcblxuICAgICAgdGhpcy5fcmVuZGVyZXJTdW1tYXJ5LnNlbGZDaGFuZ2UoKTtcblxuICAgICAgdGhpcy5pbnN0YW5jZVJlZnJlc2hFbWl0dGVyLmVtaXQoKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogTWVhbnQgdG8gYmUgb3ZlcnJpZGRlbiwgc28gdGhhdCBpdCBjYW4gYmUgY2FsbGVkIHRvIGVuc3VyZSB0aGF0IHRoZSByZW5kZXJlciBiaXRtYXNrIHdpbGwgYmUgdXAtdG8tZGF0ZS5cbiAgICovXG4gIHB1YmxpYyBpbnZhbGlkYXRlU3VwcG9ydGVkUmVuZGVyZXJzKCk6IHZvaWQge1xuICAgIC8vIHNlZSBkb2NzXG4gIH1cblxuICAvKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSpcbiAgICogSGludHNcbiAgICotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cblxuICAvKipcbiAgICogV2hlbiBBTlkgaGludCBjaGFuZ2VzLCB3ZSByZWZyZXNoIGV2ZXJ5dGhpbmcgY3VycmVudGx5IChmb3Igc2FmZXR5LCB0aGlzIG1heSBiZSBwb3NzaWJsZSB0byBtYWtlIG1vcmUgc3BlY2lmaWNcbiAgICogaW4gdGhlIGZ1dHVyZSwgYnV0IGhpbnQgY2hhbmdlcyBhcmUgbm90IHBhcnRpY3VsYXJseSBjb21tb24gcGVyZm9ybWFuY2UgYm90dGxlbmVjaykuXG4gICAqL1xuICBwcml2YXRlIGludmFsaWRhdGVIaW50KCk6IHZvaWQge1xuICAgIHRoaXMucmVuZGVyZXJTdW1tYXJ5UmVmcmVzaEVtaXR0ZXIuZW1pdCgpO1xuICAgIHRoaXMuaW5zdGFuY2VSZWZyZXNoRW1pdHRlci5lbWl0KCk7XG4gIH1cblxuICAvKipcbiAgICogU2V0cyBhIHByZWZlcnJlZCByZW5kZXJlciBmb3IgdGhpcyBOb2RlIGFuZCBpdHMgc3ViLXRyZWUuIFNjZW5lcnkgd2lsbCBhdHRlbXB0IHRvIHVzZSB0aGlzIHJlbmRlcmVyIHVuZGVyIGhlcmVcbiAgICogdW5sZXNzIGl0IGlzbid0IHN1cHBvcnRlZCwgT1IgYW5vdGhlciBwcmVmZXJyZWQgcmVuZGVyZXIgaXMgc2V0IGFzIGEgY2xvc2VyIGFuY2VzdG9yLiBBY2NlcHRhYmxlIHZhbHVlcyBhcmU6XG4gICAqIC0gbnVsbCAoZGVmYXVsdCwgbm8gcHJlZmVyZW5jZSlcbiAgICogLSAnY2FudmFzJ1xuICAgKiAtICdzdmcnXG4gICAqIC0gJ2RvbSdcbiAgICogLSAnd2ViZ2wnXG4gICAqL1xuICBwdWJsaWMgc2V0UmVuZGVyZXIoIHJlbmRlcmVyOiBSZW5kZXJlclR5cGUgKTogdm9pZCB7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggcmVuZGVyZXIgPT09IG51bGwgfHwgcmVuZGVyZXIgPT09ICdjYW52YXMnIHx8IHJlbmRlcmVyID09PSAnc3ZnJyB8fCByZW5kZXJlciA9PT0gJ2RvbScgfHwgcmVuZGVyZXIgPT09ICd3ZWJnbCcsXG4gICAgICAnUmVuZGVyZXIgaW5wdXQgc2hvdWxkIGJlIG51bGwsIG9yIG9uZSBvZjogXCJjYW52YXNcIiwgXCJzdmdcIiwgXCJkb21cIiBvciBcIndlYmdsXCIuJyApO1xuXG4gICAgbGV0IG5ld1JlbmRlcmVyID0gMDtcbiAgICBpZiAoIHJlbmRlcmVyID09PSAnY2FudmFzJyApIHtcbiAgICAgIG5ld1JlbmRlcmVyID0gUmVuZGVyZXIuYml0bWFza0NhbnZhcztcbiAgICB9XG4gICAgZWxzZSBpZiAoIHJlbmRlcmVyID09PSAnc3ZnJyApIHtcbiAgICAgIG5ld1JlbmRlcmVyID0gUmVuZGVyZXIuYml0bWFza1NWRztcbiAgICB9XG4gICAgZWxzZSBpZiAoIHJlbmRlcmVyID09PSAnZG9tJyApIHtcbiAgICAgIG5ld1JlbmRlcmVyID0gUmVuZGVyZXIuYml0bWFza0RPTTtcbiAgICB9XG4gICAgZWxzZSBpZiAoIHJlbmRlcmVyID09PSAnd2ViZ2wnICkge1xuICAgICAgbmV3UmVuZGVyZXIgPSBSZW5kZXJlci5iaXRtYXNrV2ViR0w7XG4gICAgfVxuICAgIGFzc2VydCAmJiBhc3NlcnQoICggcmVuZGVyZXIgPT09IG51bGwgKSA9PT0gKCBuZXdSZW5kZXJlciA9PT0gMCApLFxuICAgICAgJ1dlIHNob3VsZCBvbmx5IGVuZCB1cCB3aXRoIG5vIGFjdHVhbCByZW5kZXJlciBpZiByZW5kZXJlciBpcyBudWxsJyApO1xuXG4gICAgaWYgKCB0aGlzLl9yZW5kZXJlciAhPT0gbmV3UmVuZGVyZXIgKSB7XG4gICAgICB0aGlzLl9yZW5kZXJlciA9IG5ld1JlbmRlcmVyO1xuXG4gICAgICB0aGlzLmludmFsaWRhdGVIaW50KCk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFNlZSBzZXRSZW5kZXJlcigpIGZvciBtb3JlIGluZm9ybWF0aW9uXG4gICAqL1xuICBwdWJsaWMgc2V0IHJlbmRlcmVyKCB2YWx1ZTogUmVuZGVyZXJUeXBlICkge1xuICAgIHRoaXMuc2V0UmVuZGVyZXIoIHZhbHVlICk7XG4gIH1cblxuICAvKipcbiAgICogU2VlIGdldFJlbmRlcmVyKCkgZm9yIG1vcmUgaW5mb3JtYXRpb25cbiAgICovXG4gIHB1YmxpYyBnZXQgcmVuZGVyZXIoKTogUmVuZGVyZXJUeXBlIHtcbiAgICByZXR1cm4gdGhpcy5nZXRSZW5kZXJlcigpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIHByZWZlcnJlZCByZW5kZXJlciAoaWYgYW55KSBvZiB0aGlzIG5vZGUsIGFzIGEgc3RyaW5nLlxuICAgKi9cbiAgcHVibGljIGdldFJlbmRlcmVyKCk6IFJlbmRlcmVyVHlwZSB7XG4gICAgaWYgKCB0aGlzLl9yZW5kZXJlciA9PT0gMCApIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICBlbHNlIGlmICggdGhpcy5fcmVuZGVyZXIgPT09IFJlbmRlcmVyLmJpdG1hc2tDYW52YXMgKSB7XG4gICAgICByZXR1cm4gJ2NhbnZhcyc7XG4gICAgfVxuICAgIGVsc2UgaWYgKCB0aGlzLl9yZW5kZXJlciA9PT0gUmVuZGVyZXIuYml0bWFza1NWRyApIHtcbiAgICAgIHJldHVybiAnc3ZnJztcbiAgICB9XG4gICAgZWxzZSBpZiAoIHRoaXMuX3JlbmRlcmVyID09PSBSZW5kZXJlci5iaXRtYXNrRE9NICkge1xuICAgICAgcmV0dXJuICdkb20nO1xuICAgIH1cbiAgICBlbHNlIGlmICggdGhpcy5fcmVuZGVyZXIgPT09IFJlbmRlcmVyLmJpdG1hc2tXZWJHTCApIHtcbiAgICAgIHJldHVybiAnd2ViZ2wnO1xuICAgIH1cbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBmYWxzZSwgJ1NlZW1zIHRvIGJlIGFuIGludmFsaWQgcmVuZGVyZXI/JyApO1xuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgLyoqXG4gICAqIFNldHMgd2hldGhlciBvciBub3QgU2NlbmVyeSB3aWxsIHRyeSB0byBwdXQgdGhpcyBOb2RlIChhbmQgaXRzIGRlc2NlbmRhbnRzKSBpbnRvIGEgc2VwYXJhdGUgU1ZHL0NhbnZhcy9XZWJHTC9ldGMuXG4gICAqIGxheWVyLCBkaWZmZXJlbnQgZnJvbSBvdGhlciBzaWJsaW5ncyBvciBvdGhlciBub2Rlcy4gQ2FuIGJlIHVzZWQgZm9yIHBlcmZvcm1hbmNlIHB1cnBvc2VzLlxuICAgKi9cbiAgcHVibGljIHNldExheWVyU3BsaXQoIHNwbGl0OiBib29sZWFuICk6IHZvaWQge1xuICAgIGlmICggc3BsaXQgIT09IHRoaXMuX2xheWVyU3BsaXQgKSB7XG4gICAgICB0aGlzLl9sYXllclNwbGl0ID0gc3BsaXQ7XG5cbiAgICAgIHRoaXMuaW52YWxpZGF0ZUhpbnQoKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogU2VlIHNldExheWVyU3BsaXQoKSBmb3IgbW9yZSBpbmZvcm1hdGlvblxuICAgKi9cbiAgcHVibGljIHNldCBsYXllclNwbGl0KCB2YWx1ZTogYm9vbGVhbiApIHtcbiAgICB0aGlzLnNldExheWVyU3BsaXQoIHZhbHVlICk7XG4gIH1cblxuICAvKipcbiAgICogU2VlIGlzTGF5ZXJTcGxpdCgpIGZvciBtb3JlIGluZm9ybWF0aW9uXG4gICAqL1xuICBwdWJsaWMgZ2V0IGxheWVyU3BsaXQoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuaXNMYXllclNwbGl0KCk7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB3aGV0aGVyIHRoZSBsYXllclNwbGl0IHBlcmZvcm1hbmNlIGZsYWcgaXMgc2V0LlxuICAgKi9cbiAgcHVibGljIGlzTGF5ZXJTcGxpdCgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5fbGF5ZXJTcGxpdDtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXRzIHdoZXRoZXIgb3Igbm90IFNjZW5lcnkgd2lsbCB0YWtlIGludG8gYWNjb3VudCB0aGF0IHRoaXMgTm9kZSBwbGFucyB0byB1c2Ugb3BhY2l0eS4gQ2FuIGhhdmUgcGVyZm9ybWFuY2VcbiAgICogZ2FpbnMgaWYgdGhlcmUgbmVlZCB0byBiZSBtdWx0aXBsZSBsYXllcnMgZm9yIHRoaXMgbm9kZSdzIGRlc2NlbmRhbnRzLlxuICAgKi9cbiAgcHVibGljIHNldFVzZXNPcGFjaXR5KCB1c2VzT3BhY2l0eTogYm9vbGVhbiApOiB2b2lkIHtcbiAgICBpZiAoIHVzZXNPcGFjaXR5ICE9PSB0aGlzLl91c2VzT3BhY2l0eSApIHtcbiAgICAgIHRoaXMuX3VzZXNPcGFjaXR5ID0gdXNlc09wYWNpdHk7XG5cbiAgICAgIHRoaXMuaW52YWxpZGF0ZUhpbnQoKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogU2VlIHNldFVzZXNPcGFjaXR5KCkgZm9yIG1vcmUgaW5mb3JtYXRpb25cbiAgICovXG4gIHB1YmxpYyBzZXQgdXNlc09wYWNpdHkoIHZhbHVlOiBib29sZWFuICkge1xuICAgIHRoaXMuc2V0VXNlc09wYWNpdHkoIHZhbHVlICk7XG4gIH1cblxuICAvKipcbiAgICogU2VlIGdldFVzZXNPcGFjaXR5KCkgZm9yIG1vcmUgaW5mb3JtYXRpb25cbiAgICovXG4gIHB1YmxpYyBnZXQgdXNlc09wYWNpdHkoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0VXNlc09wYWNpdHkoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHdoZXRoZXIgdGhlIHVzZXNPcGFjaXR5IHBlcmZvcm1hbmNlIGZsYWcgaXMgc2V0LlxuICAgKi9cbiAgcHVibGljIGdldFVzZXNPcGFjaXR5KCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLl91c2VzT3BhY2l0eTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXRzIGEgZmxhZyBmb3Igd2hldGhlciB3aGV0aGVyIHRoZSBjb250ZW50cyBvZiB0aGlzIE5vZGUgYW5kIGl0cyBjaGlsZHJlbiBzaG91bGQgYmUgZGlzcGxheWVkIGluIGEgc2VwYXJhdGVcbiAgICogRE9NIGVsZW1lbnQgdGhhdCBpcyB0cmFuc2Zvcm1lZCB3aXRoIENTUyB0cmFuc2Zvcm1zLiBJdCBjYW4gaGF2ZSBwb3RlbnRpYWwgc3BlZWR1cHMsIHNpbmNlIHRoZSBicm93c2VyIG1heSBub3RcbiAgICogaGF2ZSB0byByZS1yYXN0ZXJpemUgY29udGVudHMgd2hlbiBpdCBpcyBhbmltYXRlZC5cbiAgICovXG4gIHB1YmxpYyBzZXRDU1NUcmFuc2Zvcm0oIGNzc1RyYW5zZm9ybTogYm9vbGVhbiApOiB2b2lkIHtcbiAgICBpZiAoIGNzc1RyYW5zZm9ybSAhPT0gdGhpcy5fY3NzVHJhbnNmb3JtICkge1xuICAgICAgdGhpcy5fY3NzVHJhbnNmb3JtID0gY3NzVHJhbnNmb3JtO1xuXG4gICAgICB0aGlzLmludmFsaWRhdGVIaW50KCk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFNlZSBzZXRDU1NUcmFuc2Zvcm0oKSBmb3IgbW9yZSBpbmZvcm1hdGlvblxuICAgKi9cbiAgcHVibGljIHNldCBjc3NUcmFuc2Zvcm0oIHZhbHVlOiBib29sZWFuICkge1xuICAgIHRoaXMuc2V0Q1NTVHJhbnNmb3JtKCB2YWx1ZSApO1xuICB9XG5cbiAgLyoqXG4gICAqIFNlZSBpc0NTU1RyYW5zZm9ybWVkKCkgZm9yIG1vcmUgaW5mb3JtYXRpb25cbiAgICovXG4gIHB1YmxpYyBnZXQgY3NzVHJhbnNmb3JtKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLmlzQ1NTVHJhbnNmb3JtZWQoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHdoZXRoZXIgdGhlIGNzc1RyYW5zZm9ybSBwZXJmb3JtYW5jZSBmbGFnIGlzIHNldC5cbiAgICovXG4gIHB1YmxpYyBpc0NTU1RyYW5zZm9ybWVkKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLl9jc3NUcmFuc2Zvcm07XG4gIH1cblxuICAvKipcbiAgICogU2V0cyBhIHBlcmZvcm1hbmNlIGZsYWcgZm9yIHdoZXRoZXIgbGF5ZXJzL0RPTSBlbGVtZW50cyBzaG91bGQgYmUgZXhjbHVkZWQgKG9yIGluY2x1ZGVkKSB3aGVuIHRoaW5ncyBhcmVcbiAgICogaW52aXNpYmxlLiBUaGUgZGVmYXVsdCBpcyBmYWxzZSwgYW5kIGludmlzaWJsZSBjb250ZW50IGlzIGluIHRoZSBET00sIGJ1dCBoaWRkZW4uXG4gICAqL1xuICBwdWJsaWMgc2V0RXhjbHVkZUludmlzaWJsZSggZXhjbHVkZUludmlzaWJsZTogYm9vbGVhbiApOiB2b2lkIHtcbiAgICBpZiAoIGV4Y2x1ZGVJbnZpc2libGUgIT09IHRoaXMuX2V4Y2x1ZGVJbnZpc2libGUgKSB7XG4gICAgICB0aGlzLl9leGNsdWRlSW52aXNpYmxlID0gZXhjbHVkZUludmlzaWJsZTtcblxuICAgICAgdGhpcy5pbnZhbGlkYXRlSGludCgpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBTZWUgc2V0RXhjbHVkZUludmlzaWJsZSgpIGZvciBtb3JlIGluZm9ybWF0aW9uXG4gICAqL1xuICBwdWJsaWMgc2V0IGV4Y2x1ZGVJbnZpc2libGUoIHZhbHVlOiBib29sZWFuICkge1xuICAgIHRoaXMuc2V0RXhjbHVkZUludmlzaWJsZSggdmFsdWUgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZWUgaXNFeGNsdWRlSW52aXNpYmxlKCkgZm9yIG1vcmUgaW5mb3JtYXRpb25cbiAgICovXG4gIHB1YmxpYyBnZXQgZXhjbHVkZUludmlzaWJsZSgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5pc0V4Y2x1ZGVJbnZpc2libGUoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHdoZXRoZXIgdGhlIGV4Y2x1ZGVJbnZpc2libGUgcGVyZm9ybWFuY2UgZmxhZyBpcyBzZXQuXG4gICAqL1xuICBwdWJsaWMgaXNFeGNsdWRlSW52aXNpYmxlKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLl9leGNsdWRlSW52aXNpYmxlO1xuICB9XG5cbiAgLyoqXG4gICAqIElmIHRoaXMgaXMgc2V0IHRvIHRydWUsIGNoaWxkIG5vZGVzIHRoYXQgYXJlIGludmlzaWJsZSB3aWxsIE5PVCBjb250cmlidXRlIHRvIHRoZSBib3VuZHMgb2YgdGhpcyBub2RlLlxuICAgKlxuICAgKiBUaGUgZGVmYXVsdCBpcyBmb3IgY2hpbGQgbm9kZXMgYm91bmRzJyB0byBiZSBpbmNsdWRlZCBpbiB0aGlzIG5vZGUncyBib3VuZHMsIGJ1dCB0aGF0IHdvdWxkIGluIGdlbmVyYWwgYmUgYVxuICAgKiBwcm9ibGVtIGZvciBsYXlvdXQgY29udGFpbmVycyBvciBvdGhlciBzaXR1YXRpb25zLCBzZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2pvaXN0L2lzc3Vlcy82MDguXG4gICAqL1xuICBwdWJsaWMgc2V0RXhjbHVkZUludmlzaWJsZUNoaWxkcmVuRnJvbUJvdW5kcyggZXhjbHVkZUludmlzaWJsZUNoaWxkcmVuRnJvbUJvdW5kczogYm9vbGVhbiApOiB2b2lkIHtcbiAgICBpZiAoIGV4Y2x1ZGVJbnZpc2libGVDaGlsZHJlbkZyb21Cb3VuZHMgIT09IHRoaXMuX2V4Y2x1ZGVJbnZpc2libGVDaGlsZHJlbkZyb21Cb3VuZHMgKSB7XG4gICAgICB0aGlzLl9leGNsdWRlSW52aXNpYmxlQ2hpbGRyZW5Gcm9tQm91bmRzID0gZXhjbHVkZUludmlzaWJsZUNoaWxkcmVuRnJvbUJvdW5kcztcblxuICAgICAgdGhpcy5pbnZhbGlkYXRlQm91bmRzKCk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFNlZSBzZXRFeGNsdWRlSW52aXNpYmxlQ2hpbGRyZW5Gcm9tQm91bmRzKCkgZm9yIG1vcmUgaW5mb3JtYXRpb25cbiAgICovXG4gIHB1YmxpYyBzZXQgZXhjbHVkZUludmlzaWJsZUNoaWxkcmVuRnJvbUJvdW5kcyggdmFsdWU6IGJvb2xlYW4gKSB7XG4gICAgdGhpcy5zZXRFeGNsdWRlSW52aXNpYmxlQ2hpbGRyZW5Gcm9tQm91bmRzKCB2YWx1ZSApO1xuICB9XG5cbiAgLyoqXG4gICAqIFNlZSBpc0V4Y2x1ZGVJbnZpc2libGVDaGlsZHJlbkZyb21Cb3VuZHMoKSBmb3IgbW9yZSBpbmZvcm1hdGlvblxuICAgKi9cbiAgcHVibGljIGdldCBleGNsdWRlSW52aXNpYmxlQ2hpbGRyZW5Gcm9tQm91bmRzKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLmlzRXhjbHVkZUludmlzaWJsZUNoaWxkcmVuRnJvbUJvdW5kcygpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgd2hldGhlciB0aGUgZXhjbHVkZUludmlzaWJsZUNoaWxkcmVuRnJvbUJvdW5kcyBmbGFnIGlzIHNldCwgc2VlXG4gICAqIHNldEV4Y2x1ZGVJbnZpc2libGVDaGlsZHJlbkZyb21Cb3VuZHMoKSBmb3IgZG9jdW1lbnRhdGlvbi5cbiAgICovXG4gIHB1YmxpYyBpc0V4Y2x1ZGVJbnZpc2libGVDaGlsZHJlbkZyb21Cb3VuZHMoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuX2V4Y2x1ZGVJbnZpc2libGVDaGlsZHJlbkZyb21Cb3VuZHM7XG4gIH1cblxuICAvKipcbiAgICogSWYgdGhpcyBpcyBzZXQgdG8gdHJ1ZSwgdGhpcyBub2RlIHdpbGwgY2FsbCBpbnRlcnJ1cHRTdWJ0cmVlSW5wdXQoKSBvbiBpdHNlbGYgd2hlbiBpdCBpcyBtYWRlIGludmlzaWJsZS5cbiAgICogU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9zY2VuZXJ5L2lzc3Vlcy8xNjQ1LlxuICAgKi9cbiAgcHVibGljIHNldEludGVycnVwdFN1YnRyZWVPbkludmlzaWJsZSggaW50ZXJydXB0U3VidHJlZU9uSW52aXNpYmxlOiBib29sZWFuICk6IHZvaWQge1xuICAgIGlmICggaW50ZXJydXB0U3VidHJlZU9uSW52aXNpYmxlICE9PSB0aGlzLl9pbnRlcnJ1cHRTdWJ0cmVlT25JbnZpc2libGUgKSB7XG4gICAgICB0aGlzLl9pbnRlcnJ1cHRTdWJ0cmVlT25JbnZpc2libGUgPSBpbnRlcnJ1cHRTdWJ0cmVlT25JbnZpc2libGU7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFNlZSBzZXRJbnRlcnJ1cHRTdWJ0cmVlT25JbnZpc2libGUoKSBmb3IgbW9yZSBpbmZvcm1hdGlvblxuICAgKi9cbiAgcHVibGljIHNldCBpbnRlcnJ1cHRTdWJ0cmVlT25JbnZpc2libGUoIHZhbHVlOiBib29sZWFuICkge1xuICAgIHRoaXMuc2V0SW50ZXJydXB0U3VidHJlZU9uSW52aXNpYmxlKCB2YWx1ZSApO1xuICB9XG5cbiAgLyoqXG4gICAqIFNlZSBpc0ludGVycnVwdFN1YnRyZWVPbkludmlzaWJsZSgpIGZvciBtb3JlIGluZm9ybWF0aW9uXG4gICAqL1xuICBwdWJsaWMgZ2V0IGludGVycnVwdFN1YnRyZWVPbkludmlzaWJsZSgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5pc0ludGVycnVwdFN1YnRyZWVPbkludmlzaWJsZSgpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgd2hldGhlciB0aGUgaW50ZXJydXB0U3VidHJlZU9uSW52aXNpYmxlIGZsYWcgaXMgc2V0LCBzZWVcbiAgICogc2V0SW50ZXJydXB0U3VidHJlZU9uSW52aXNpYmxlKCkgZm9yIGRvY3VtZW50YXRpb24uXG4gICAqL1xuICBwdWJsaWMgaXNJbnRlcnJ1cHRTdWJ0cmVlT25JbnZpc2libGUoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuX2ludGVycnVwdFN1YnRyZWVPbkludmlzaWJsZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXRzIG9wdGlvbnMgdGhhdCBhcmUgcHJvdmlkZWQgdG8gbGF5b3V0IG1hbmFnZXJzIGluIG9yZGVyIHRvIGN1c3RvbWl6ZSBwb3NpdGlvbmluZyBvZiB0aGlzIG5vZGUuXG4gICAqL1xuICBwdWJsaWMgc2V0TGF5b3V0T3B0aW9ucyggbGF5b3V0T3B0aW9uczogVExheW91dE9wdGlvbnMgfCBudWxsICk6IHZvaWQge1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIGxheW91dE9wdGlvbnMgPT09IG51bGwgfHwgKCB0eXBlb2YgbGF5b3V0T3B0aW9ucyA9PT0gJ29iamVjdCcgJiYgT2JqZWN0LmdldFByb3RvdHlwZU9mKCBsYXlvdXRPcHRpb25zICkgPT09IE9iamVjdC5wcm90b3R5cGUgKSxcbiAgICAgICdsYXlvdXRPcHRpb25zIHNob3VsZCBiZSBudWxsIG9yIGFuIHBsYWluIG9wdGlvbnMtc3R5bGUgb2JqZWN0JyApO1xuXG4gICAgaWYgKCBsYXlvdXRPcHRpb25zICE9PSB0aGlzLl9sYXlvdXRPcHRpb25zICkge1xuICAgICAgdGhpcy5fbGF5b3V0T3B0aW9ucyA9IGxheW91dE9wdGlvbnM7XG5cbiAgICAgIHRoaXMubGF5b3V0T3B0aW9uc0NoYW5nZWRFbWl0dGVyLmVtaXQoKTtcbiAgICB9XG4gIH1cblxuICBwdWJsaWMgc2V0IGxheW91dE9wdGlvbnMoIHZhbHVlOiBUTGF5b3V0T3B0aW9ucyB8IG51bGwgKSB7XG4gICAgdGhpcy5zZXRMYXlvdXRPcHRpb25zKCB2YWx1ZSApO1xuICB9XG5cbiAgcHVibGljIGdldCBsYXlvdXRPcHRpb25zKCk6IFRMYXlvdXRPcHRpb25zIHwgbnVsbCB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0TGF5b3V0T3B0aW9ucygpO1xuICB9XG5cbiAgcHVibGljIGdldExheW91dE9wdGlvbnMoKTogVExheW91dE9wdGlvbnMgfCBudWxsIHtcbiAgICByZXR1cm4gdGhpcy5fbGF5b3V0T3B0aW9ucztcbiAgfVxuXG4gIHB1YmxpYyBtdXRhdGVMYXlvdXRPcHRpb25zKCBsYXlvdXRPcHRpb25zPzogVExheW91dE9wdGlvbnMgKTogdm9pZCB7XG4gICAgdGhpcy5sYXlvdXRPcHRpb25zID0gb3B0aW9uaXplMzxUTGF5b3V0T3B0aW9ucywgRW1wdHlTZWxmT3B0aW9ucywgVExheW91dE9wdGlvbnM+KCkoIHt9LCB0aGlzLmxheW91dE9wdGlvbnMgfHwge30sIGxheW91dE9wdGlvbnMgKTtcbiAgfVxuXG4gIC8vIERlZmF1bHRzIGluZGljYXRpbmcgdGhhdCB3ZSBkb24ndCBtaXggaW4gV2lkdGhTaXphYmxlL0hlaWdodFNpemFibGVcbiAgcHVibGljIGdldCB3aWR0aFNpemFibGUoKTogYm9vbGVhbiB7IHJldHVybiBmYWxzZTsgfVxuXG4gIHB1YmxpYyBnZXQgaGVpZ2h0U2l6YWJsZSgpOiBib29sZWFuIHsgcmV0dXJuIGZhbHNlOyB9XG5cbiAgcHVibGljIGdldCBleHRlbmRzV2lkdGhTaXphYmxlKCk6IGJvb2xlYW4geyByZXR1cm4gZmFsc2U7IH1cblxuICBwdWJsaWMgZ2V0IGV4dGVuZHNIZWlnaHRTaXphYmxlKCk6IGJvb2xlYW4geyByZXR1cm4gZmFsc2U7IH1cblxuICBwdWJsaWMgZ2V0IGV4dGVuZHNTaXphYmxlKCk6IGJvb2xlYW4geyByZXR1cm4gZmFsc2U7IH1cblxuICAvKipcbiAgICogU2V0cyB0aGUgcHJldmVudEZpdCBwZXJmb3JtYW5jZSBmbGFnLlxuICAgKi9cbiAgcHVibGljIHNldFByZXZlbnRGaXQoIHByZXZlbnRGaXQ6IGJvb2xlYW4gKTogdm9pZCB7XG4gICAgaWYgKCBwcmV2ZW50Rml0ICE9PSB0aGlzLl9wcmV2ZW50Rml0ICkge1xuICAgICAgdGhpcy5fcHJldmVudEZpdCA9IHByZXZlbnRGaXQ7XG5cbiAgICAgIHRoaXMuaW52YWxpZGF0ZUhpbnQoKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogU2VlIHNldFByZXZlbnRGaXQoKSBmb3IgbW9yZSBpbmZvcm1hdGlvblxuICAgKi9cbiAgcHVibGljIHNldCBwcmV2ZW50Rml0KCB2YWx1ZTogYm9vbGVhbiApIHtcbiAgICB0aGlzLnNldFByZXZlbnRGaXQoIHZhbHVlICk7XG4gIH1cblxuICAvKipcbiAgICogU2VlIGlzUHJldmVudEZpdCgpIGZvciBtb3JlIGluZm9ybWF0aW9uXG4gICAqL1xuICBwdWJsaWMgZ2V0IHByZXZlbnRGaXQoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuaXNQcmV2ZW50Rml0KCk7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB3aGV0aGVyIHRoZSBwcmV2ZW50Rml0IHBlcmZvcm1hbmNlIGZsYWcgaXMgc2V0LlxuICAgKi9cbiAgcHVibGljIGlzUHJldmVudEZpdCgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5fcHJldmVudEZpdDtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXRzIHdoZXRoZXIgdGhlcmUgaXMgYSBjdXN0b20gV2ViR0wgc2NhbGUgYXBwbGllZCB0byB0aGUgQ2FudmFzLCBhbmQgaWYgc28gd2hhdCBzY2FsZS5cbiAgICovXG4gIHB1YmxpYyBzZXRXZWJHTFNjYWxlKCB3ZWJnbFNjYWxlOiBudW1iZXIgfCBudWxsICk6IHZvaWQge1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIHdlYmdsU2NhbGUgPT09IG51bGwgfHwgKCB0eXBlb2Ygd2ViZ2xTY2FsZSA9PT0gJ251bWJlcicgJiYgaXNGaW5pdGUoIHdlYmdsU2NhbGUgKSApICk7XG5cbiAgICBpZiAoIHdlYmdsU2NhbGUgIT09IHRoaXMuX3dlYmdsU2NhbGUgKSB7XG4gICAgICB0aGlzLl93ZWJnbFNjYWxlID0gd2ViZ2xTY2FsZTtcblxuICAgICAgdGhpcy5pbnZhbGlkYXRlSGludCgpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBTZWUgc2V0V2ViR0xTY2FsZSgpIGZvciBtb3JlIGluZm9ybWF0aW9uXG4gICAqL1xuICBwdWJsaWMgc2V0IHdlYmdsU2NhbGUoIHZhbHVlOiBudW1iZXIgfCBudWxsICkge1xuICAgIHRoaXMuc2V0V2ViR0xTY2FsZSggdmFsdWUgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZWUgZ2V0V2ViR0xTY2FsZSgpIGZvciBtb3JlIGluZm9ybWF0aW9uXG4gICAqL1xuICBwdWJsaWMgZ2V0IHdlYmdsU2NhbGUoKTogbnVtYmVyIHwgbnVsbCB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0V2ViR0xTY2FsZSgpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIHZhbHVlIG9mIHRoZSB3ZWJnbFNjYWxlIHBlcmZvcm1hbmNlIGZsYWcuXG4gICAqL1xuICBwdWJsaWMgZ2V0V2ViR0xTY2FsZSgpOiBudW1iZXIgfCBudWxsIHtcbiAgICByZXR1cm4gdGhpcy5fd2ViZ2xTY2FsZTtcbiAgfVxuXG4gIC8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKlxuICAgKiBUcmFpbCBvcGVyYXRpb25zXG4gICAqLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIG9uZSBUcmFpbCB0aGF0IHN0YXJ0cyBmcm9tIGEgbm9kZSB3aXRoIG5vIHBhcmVudHMgKG9yIGlmIHRoZSBwcmVkaWNhdGUgaXMgcHJlc2VudCwgYSBOb2RlIHRoYXRcbiAgICogc2F0aXNmaWVzIGl0KSwgYW5kIGVuZHMgYXQgdGhpcyBub2RlLiBJZiBtb3JlIHRoYW4gb25lIFRyYWlsIHdvdWxkIHNhdGlzZnkgdGhlc2UgY29uZGl0aW9ucywgYW4gYXNzZXJ0aW9uIGlzXG4gICAqIHRocm93biAocGxlYXNlIHVzZSBnZXRUcmFpbHMoKSBmb3IgdGhvc2UgY2FzZXMpLlxuICAgKlxuICAgKiBAcGFyYW0gW3ByZWRpY2F0ZV0gLSBJZiBzdXBwbGllZCwgd2Ugd2lsbCBvbmx5IHJldHVybiB0cmFpbHMgcm9vdGVkIGF0IGEgTm9kZSB0aGF0IHNhdGlzZmllcyBwcmVkaWNhdGUoIG5vZGUgKSA9PSB0cnVlXG4gICAqL1xuICBwdWJsaWMgZ2V0VW5pcXVlVHJhaWwoIHByZWRpY2F0ZT86ICggbm9kZTogTm9kZSApID0+IGJvb2xlYW4gKTogVHJhaWwge1xuXG4gICAgLy8gV2l0aG91dCBhIHByZWRpY2F0ZSwgd2UnbGwgYmUgYWJsZSB0byBiYWlsIG91dCB0aGUgaW5zdGFudCB3ZSBoaXQgYSBOb2RlIHdpdGggMisgcGFyZW50cywgYW5kIGl0IG1ha2VzIHRoZVxuICAgIC8vIGxvZ2ljIGVhc2llci5cbiAgICBpZiAoICFwcmVkaWNhdGUgKSB7XG4gICAgICBjb25zdCB0cmFpbCA9IG5ldyBUcmFpbCgpO1xuXG4gICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLXRoaXMtYWxpYXNcbiAgICAgIGxldCBub2RlOiBOb2RlID0gdGhpczsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBjb25zaXN0ZW50LXRoaXNcblxuICAgICAgd2hpbGUgKCBub2RlICkge1xuICAgICAgICBhc3NlcnQgJiYgYXNzZXJ0KCBub2RlLl9wYXJlbnRzLmxlbmd0aCA8PSAxLFxuICAgICAgICAgIGBnZXRVbmlxdWVUcmFpbCBmb3VuZCBhIE5vZGUgd2l0aCAke25vZGUuX3BhcmVudHMubGVuZ3RofSBwYXJlbnRzLmAgKTtcblxuICAgICAgICB0cmFpbC5hZGRBbmNlc3Rvciggbm9kZSApO1xuICAgICAgICBub2RlID0gbm9kZS5fcGFyZW50c1sgMCBdOyAvLyBzaG91bGQgYmUgdW5kZWZpbmVkIGlmIHRoZXJlIGFyZW4ndCBhbnkgcGFyZW50c1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gdHJhaWw7XG4gICAgfVxuICAgIC8vIFdpdGggYSBwcmVkaWNhdGUsIHdlIG5lZWQgdG8gZXhwbG9yZSBtdWx0aXBsZSBwYXJlbnRzIChzaW5jZSB0aGUgcHJlZGljYXRlIG1heSBmaWx0ZXIgb3V0IGFsbCBidXQgb25lKVxuICAgIGVsc2Uge1xuICAgICAgY29uc3QgdHJhaWxzID0gdGhpcy5nZXRUcmFpbHMoIHByZWRpY2F0ZSApO1xuXG4gICAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0cmFpbHMubGVuZ3RoID09PSAxLFxuICAgICAgICBgZ2V0VW5pcXVlVHJhaWwgZm91bmQgJHt0cmFpbHMubGVuZ3RofSBtYXRjaGluZyB0cmFpbHMgZm9yIHRoZSBwcmVkaWNhdGVgICk7XG5cbiAgICAgIHJldHVybiB0cmFpbHNbIDAgXTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyBhIFRyYWlsIHJvb3RlZCBhdCByb290Tm9kZSBhbmQgZW5kcyBhdCB0aGlzIG5vZGUuIFRocm93cyBhbiBhc3NlcnRpb24gaWYgdGhlIG51bWJlciBvZiB0cmFpbHMgdGhhdCBtYXRjaFxuICAgKiB0aGlzIGNvbmRpdGlvbiBpc24ndCBleGFjdGx5IDEuXG4gICAqL1xuICBwdWJsaWMgZ2V0VW5pcXVlVHJhaWxUbyggcm9vdE5vZGU6IE5vZGUgKTogVHJhaWwge1xuICAgIHJldHVybiB0aGlzLmdldFVuaXF1ZVRyYWlsKCBub2RlID0+IHJvb3ROb2RlID09PSBub2RlICk7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyBhbiBhcnJheSBvZiBhbGwgVHJhaWxzIHRoYXQgc3RhcnQgZnJvbSBub2RlcyB3aXRoIG5vIHBhcmVudCAob3IgaWYgYSBwcmVkaWNhdGUgaXMgcHJlc2VudCwgdGhvc2UgdGhhdFxuICAgKiBzYXRpc2Z5IHRoZSBwcmVkaWNhdGUpLCBhbmQgZW5kcyBhdCB0aGlzIG5vZGUuXG4gICAqXG4gICAqIEBwYXJhbSBbcHJlZGljYXRlXSAtIElmIHN1cHBsaWVkLCB3ZSB3aWxsIG9ubHkgcmV0dXJuIFRyYWlscyByb290ZWQgYXQgbm9kZXMgdGhhdCBzYXRpc2Z5IHByZWRpY2F0ZSggbm9kZSApID09IHRydWUuXG4gICAqL1xuICBwdWJsaWMgZ2V0VHJhaWxzKCBwcmVkaWNhdGU/OiAoIG5vZGU6IE5vZGUgKSA9PiBib29sZWFuICk6IFRyYWlsW10ge1xuICAgIHByZWRpY2F0ZSA9IHByZWRpY2F0ZSB8fCBOb2RlLmRlZmF1bHRUcmFpbFByZWRpY2F0ZTtcblxuICAgIGNvbnN0IHRyYWlsczogVHJhaWxbXSA9IFtdO1xuICAgIGNvbnN0IHRyYWlsID0gbmV3IFRyYWlsKCB0aGlzICk7XG4gICAgVHJhaWwuYXBwZW5kQW5jZXN0b3JUcmFpbHNXaXRoUHJlZGljYXRlKCB0cmFpbHMsIHRyYWlsLCBwcmVkaWNhdGUgKTtcblxuICAgIHJldHVybiB0cmFpbHM7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyBhbiBhcnJheSBvZiBhbGwgVHJhaWxzIHJvb3RlZCBhdCByb290Tm9kZSBhbmQgZW5kIGF0IHRoaXMgbm9kZS5cbiAgICovXG4gIHB1YmxpYyBnZXRUcmFpbHNUbyggcm9vdE5vZGU6IE5vZGUgKTogVHJhaWxbXSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0VHJhaWxzKCBub2RlID0+IG5vZGUgPT09IHJvb3ROb2RlICk7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyBhbiBhcnJheSBvZiBhbGwgVHJhaWxzIHJvb3RlZCBhdCB0aGlzIE5vZGUgYW5kIGVuZCB3aXRoIG5vZGVzIHdpdGggbm8gY2hpbGRyZW4gKG9yIGlmIGEgcHJlZGljYXRlIGlzXG4gICAqIHByZXNlbnQsIHRob3NlIHRoYXQgc2F0aXNmeSB0aGUgcHJlZGljYXRlKS5cbiAgICpcbiAgICogQHBhcmFtIFtwcmVkaWNhdGVdIC0gSWYgc3VwcGxpZWQsIHdlIHdpbGwgb25seSByZXR1cm4gVHJhaWxzIGVuZGluZyBhdCBub2RlcyB0aGF0IHNhdGlzZnkgcHJlZGljYXRlKCBub2RlICkgPT0gdHJ1ZS5cbiAgICovXG4gIHB1YmxpYyBnZXRMZWFmVHJhaWxzKCBwcmVkaWNhdGU/OiAoIG5vZGU6IE5vZGUgKSA9PiBib29sZWFuICk6IFRyYWlsW10ge1xuICAgIHByZWRpY2F0ZSA9IHByZWRpY2F0ZSB8fCBOb2RlLmRlZmF1bHRMZWFmVHJhaWxQcmVkaWNhdGU7XG5cbiAgICBjb25zdCB0cmFpbHM6IFRyYWlsW10gPSBbXTtcbiAgICBjb25zdCB0cmFpbCA9IG5ldyBUcmFpbCggdGhpcyApO1xuICAgIFRyYWlsLmFwcGVuZERlc2NlbmRhbnRUcmFpbHNXaXRoUHJlZGljYXRlKCB0cmFpbHMsIHRyYWlsLCBwcmVkaWNhdGUgKTtcblxuICAgIHJldHVybiB0cmFpbHM7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyBhbiBhcnJheSBvZiBhbGwgVHJhaWxzIHJvb3RlZCBhdCB0aGlzIE5vZGUgYW5kIGVuZCB3aXRoIGxlYWZOb2RlLlxuICAgKi9cbiAgcHVibGljIGdldExlYWZUcmFpbHNUbyggbGVhZk5vZGU6IE5vZGUgKTogVHJhaWxbXSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0TGVhZlRyYWlscyggbm9kZSA9PiBub2RlID09PSBsZWFmTm9kZSApO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgYSBUcmFpbCByb290ZWQgYXQgdGhpcyBub2RlIGFuZCBlbmRpbmcgYXQgYSBOb2RlIHRoYXQgaGFzIG5vIGNoaWxkcmVuIChvciBpZiBhIHByZWRpY2F0ZSBpcyBwcm92aWRlZCwgYVxuICAgKiBOb2RlIHRoYXQgc2F0aXNmaWVzIHRoZSBwcmVkaWNhdGUpLiBJZiBtb3JlIHRoYW4gb25lIHRyYWlsIG1hdGNoZXMgdGhpcyBkZXNjcmlwdGlvbiwgYW4gYXNzZXJ0aW9uIHdpbGwgYmUgZmlyZWQuXG4gICAqXG4gICAqIEBwYXJhbSBbcHJlZGljYXRlXSAtIElmIHN1cHBsaWVkLCB3ZSB3aWxsIHJldHVybiBhIFRyYWlsIHRoYXQgZW5kcyB3aXRoIGEgTm9kZSB0aGF0IHNhdGlzZmllcyBwcmVkaWNhdGUoIG5vZGUgKSA9PSB0cnVlXG4gICAqL1xuICBwdWJsaWMgZ2V0VW5pcXVlTGVhZlRyYWlsKCBwcmVkaWNhdGU/OiAoIG5vZGU6IE5vZGUgKSA9PiBib29sZWFuICk6IFRyYWlsIHtcbiAgICBjb25zdCB0cmFpbHMgPSB0aGlzLmdldExlYWZUcmFpbHMoIHByZWRpY2F0ZSApO1xuXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdHJhaWxzLmxlbmd0aCA9PT0gMSxcbiAgICAgIGBnZXRVbmlxdWVMZWFmVHJhaWwgZm91bmQgJHt0cmFpbHMubGVuZ3RofSBtYXRjaGluZyB0cmFpbHMgZm9yIHRoZSBwcmVkaWNhdGVgICk7XG5cbiAgICByZXR1cm4gdHJhaWxzWyAwIF07XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyBhIFRyYWlsIHJvb3RlZCBhdCB0aGlzIE5vZGUgYW5kIGVuZGluZyBhdCBsZWFmTm9kZS4gSWYgbW9yZSB0aGFuIG9uZSB0cmFpbCBtYXRjaGVzIHRoaXMgZGVzY3JpcHRpb24sXG4gICAqIGFuIGFzc2VydGlvbiB3aWxsIGJlIGZpcmVkLlxuICAgKi9cbiAgcHVibGljIGdldFVuaXF1ZUxlYWZUcmFpbFRvKCBsZWFmTm9kZTogTm9kZSApOiBUcmFpbCB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0VW5pcXVlTGVhZlRyYWlsKCBub2RlID0+IG5vZGUgPT09IGxlYWZOb2RlICk7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyBhbGwgbm9kZXMgaW4gdGhlIGNvbm5lY3RlZCBjb21wb25lbnQsIHJldHVybmVkIGluIGFuIGFyYml0cmFyeSBvcmRlciwgaW5jbHVkaW5nIG5vZGVzIHRoYXQgYXJlIGFuY2VzdG9yc1xuICAgKiBvZiB0aGlzIG5vZGUuXG4gICAqL1xuICBwdWJsaWMgZ2V0Q29ubmVjdGVkTm9kZXMoKTogTm9kZVtdIHtcbiAgICBjb25zdCByZXN1bHQ6IE5vZGVbXSA9IFtdO1xuICAgIGxldCBmcmVzaCA9IHRoaXMuX2NoaWxkcmVuLmNvbmNhdCggdGhpcy5fcGFyZW50cyApLmNvbmNhdCggdGhpcyApO1xuICAgIHdoaWxlICggZnJlc2gubGVuZ3RoICkge1xuICAgICAgY29uc3Qgbm9kZSA9IGZyZXNoLnBvcCgpITtcbiAgICAgIGlmICggIV8uaW5jbHVkZXMoIHJlc3VsdCwgbm9kZSApICkge1xuICAgICAgICByZXN1bHQucHVzaCggbm9kZSApO1xuICAgICAgICBmcmVzaCA9IGZyZXNoLmNvbmNhdCggbm9kZS5fY2hpbGRyZW4sIG5vZGUuX3BhcmVudHMgKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGFsbCBub2RlcyBpbiB0aGUgc3VidHJlZSB3aXRoIHRoaXMgTm9kZSBhcyBpdHMgcm9vdCwgcmV0dXJuZWQgaW4gYW4gYXJiaXRyYXJ5IG9yZGVyLiBMaWtlXG4gICAqIGdldENvbm5lY3RlZE5vZGVzLCBidXQgZG9lc24ndCBpbmNsdWRlIHBhcmVudHMuXG4gICAqL1xuICBwdWJsaWMgZ2V0U3VidHJlZU5vZGVzKCk6IE5vZGVbXSB7XG4gICAgY29uc3QgcmVzdWx0OiBOb2RlW10gPSBbXTtcbiAgICBsZXQgZnJlc2ggPSB0aGlzLl9jaGlsZHJlbi5jb25jYXQoIHRoaXMgKTtcbiAgICB3aGlsZSAoIGZyZXNoLmxlbmd0aCApIHtcbiAgICAgIGNvbnN0IG5vZGUgPSBmcmVzaC5wb3AoKSE7XG4gICAgICBpZiAoICFfLmluY2x1ZGVzKCByZXN1bHQsIG5vZGUgKSApIHtcbiAgICAgICAgcmVzdWx0LnB1c2goIG5vZGUgKTtcbiAgICAgICAgZnJlc2ggPSBmcmVzaC5jb25jYXQoIG5vZGUuX2NoaWxkcmVuICk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyBhbGwgbm9kZXMgdGhhdCBhcmUgY29ubmVjdGVkIHRvIHRoaXMgbm9kZSwgc29ydGVkIGluIHRvcG9sb2dpY2FsIG9yZGVyLlxuICAgKi9cbiAgcHVibGljIGdldFRvcG9sb2dpY2FsbHlTb3J0ZWROb2RlcygpOiBOb2RlW10ge1xuICAgIC8vIHNlZSBodHRwOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL1RvcG9sb2dpY2FsX3NvcnRpbmdcbiAgICBjb25zdCBlZGdlczogUmVjb3JkPHN0cmluZywgUmVjb3JkPHN0cmluZywgYm9vbGVhbj4+ID0ge307XG4gICAgY29uc3QgczogTm9kZVtdID0gW107XG4gICAgY29uc3QgbDogTm9kZVtdID0gW107XG4gICAgbGV0IG46IE5vZGU7XG4gICAgXy5lYWNoKCB0aGlzLmdldENvbm5lY3RlZE5vZGVzKCksIG5vZGUgPT4ge1xuICAgICAgZWRnZXNbIG5vZGUuaWQgXSA9IHt9O1xuICAgICAgXy5lYWNoKCBub2RlLl9jaGlsZHJlbiwgbSA9PiB7XG4gICAgICAgIGVkZ2VzWyBub2RlLmlkIF1bIG0uaWQgXSA9IHRydWU7XG4gICAgICB9ICk7XG4gICAgICBpZiAoICFub2RlLnBhcmVudHMubGVuZ3RoICkge1xuICAgICAgICBzLnB1c2goIG5vZGUgKTtcbiAgICAgIH1cbiAgICB9ICk7XG5cbiAgICBmdW5jdGlvbiBoYW5kbGVDaGlsZCggbTogTm9kZSApOiB2b2lkIHtcbiAgICAgIGRlbGV0ZSBlZGdlc1sgbi5pZCBdWyBtLmlkIF07XG4gICAgICBpZiAoIF8uZXZlcnkoIGVkZ2VzLCBjaGlsZHJlbiA9PiAhY2hpbGRyZW5bIG0uaWQgXSApICkge1xuICAgICAgICAvLyB0aGVyZSBhcmUgbm8gbW9yZSBlZGdlcyB0byBtXG4gICAgICAgIHMucHVzaCggbSApO1xuICAgICAgfVxuICAgIH1cblxuICAgIHdoaWxlICggcy5sZW5ndGggKSB7XG4gICAgICBuID0gcy5wb3AoKSE7XG4gICAgICBsLnB1c2goIG4gKTtcblxuICAgICAgXy5lYWNoKCBuLl9jaGlsZHJlbiwgaGFuZGxlQ2hpbGQgKTtcbiAgICB9XG5cbiAgICAvLyBlbnN1cmUgdGhhdCB0aGVyZSBhcmUgbm8gZWRnZXMgbGVmdCwgc2luY2UgdGhlbiBpdCB3b3VsZCBjb250YWluIGEgY2lyY3VsYXIgcmVmZXJlbmNlXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggXy5ldmVyeSggZWRnZXMsIGNoaWxkcmVuID0+IF8uZXZlcnkoIGNoaWxkcmVuLCBmaW5hbCA9PiBmYWxzZSApICksICdjaXJjdWxhciByZWZlcmVuY2UgY2hlY2snICk7XG5cbiAgICByZXR1cm4gbDtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHdoZXRoZXIgdGhpcy5hZGRDaGlsZCggY2hpbGQgKSB3aWxsIG5vdCBjYXVzZSBjaXJjdWxhciByZWZlcmVuY2VzLlxuICAgKi9cbiAgcHVibGljIGNhbkFkZENoaWxkKCBjaGlsZDogTm9kZSApOiBib29sZWFuIHtcbiAgICBpZiAoIHRoaXMgPT09IGNoaWxkIHx8IF8uaW5jbHVkZXMoIHRoaXMuX2NoaWxkcmVuLCBjaGlsZCApICkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIC8vIHNlZSBodHRwOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL1RvcG9sb2dpY2FsX3NvcnRpbmdcbiAgICAvLyBUT0RPOiByZW1vdmUgZHVwbGljYXRpb24gd2l0aCBhYm92ZSBoYW5kbGluZz8gaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3NjZW5lcnkvaXNzdWVzLzE1ODFcbiAgICBjb25zdCBlZGdlczogUmVjb3JkPHN0cmluZywgUmVjb3JkPHN0cmluZywgYm9vbGVhbj4+ID0ge307XG4gICAgY29uc3QgczogTm9kZVtdID0gW107XG4gICAgY29uc3QgbDogTm9kZVtdID0gW107XG4gICAgbGV0IG46IE5vZGU7XG4gICAgXy5lYWNoKCB0aGlzLmdldENvbm5lY3RlZE5vZGVzKCkuY29uY2F0KCBjaGlsZC5nZXRDb25uZWN0ZWROb2RlcygpICksIG5vZGUgPT4ge1xuICAgICAgZWRnZXNbIG5vZGUuaWQgXSA9IHt9O1xuICAgICAgXy5lYWNoKCBub2RlLl9jaGlsZHJlbiwgbSA9PiB7XG4gICAgICAgIGVkZ2VzWyBub2RlLmlkIF1bIG0uaWQgXSA9IHRydWU7XG4gICAgICB9ICk7XG4gICAgICBpZiAoICFub2RlLnBhcmVudHMubGVuZ3RoICYmIG5vZGUgIT09IGNoaWxkICkge1xuICAgICAgICBzLnB1c2goIG5vZGUgKTtcbiAgICAgIH1cbiAgICB9ICk7XG4gICAgZWRnZXNbIHRoaXMuaWQgXVsgY2hpbGQuaWQgXSA9IHRydWU7IC8vIGFkZCBpbiBvdXIgJ25ldycgZWRnZVxuICAgIGZ1bmN0aW9uIGhhbmRsZUNoaWxkKCBtOiBOb2RlICk6IHZvaWQge1xuICAgICAgZGVsZXRlIGVkZ2VzWyBuLmlkIF1bIG0uaWQgXTtcbiAgICAgIGlmICggXy5ldmVyeSggZWRnZXMsIGNoaWxkcmVuID0+ICFjaGlsZHJlblsgbS5pZCBdICkgKSB7XG4gICAgICAgIC8vIHRoZXJlIGFyZSBubyBtb3JlIGVkZ2VzIHRvIG1cbiAgICAgICAgcy5wdXNoKCBtICk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgd2hpbGUgKCBzLmxlbmd0aCApIHtcbiAgICAgIG4gPSBzLnBvcCgpITtcbiAgICAgIGwucHVzaCggbiApO1xuXG4gICAgICBfLmVhY2goIG4uX2NoaWxkcmVuLCBoYW5kbGVDaGlsZCApO1xuXG4gICAgICAvLyBoYW5kbGUgb3VyIG5ldyBlZGdlXG4gICAgICBpZiAoIG4gPT09IHRoaXMgKSB7XG4gICAgICAgIGhhbmRsZUNoaWxkKCBjaGlsZCApO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIGVuc3VyZSB0aGF0IHRoZXJlIGFyZSBubyBlZGdlcyBsZWZ0LCBzaW5jZSB0aGVuIGl0IHdvdWxkIGNvbnRhaW4gYSBjaXJjdWxhciByZWZlcmVuY2VcbiAgICByZXR1cm4gXy5ldmVyeSggZWRnZXMsIGNoaWxkcmVuID0+IF8uZXZlcnkoIGNoaWxkcmVuLCBmaW5hbCA9PiBmYWxzZSApICk7XG4gIH1cblxuICAvKipcbiAgICogVG8gYmUgb3ZlcnJpZGRlbiBpbiBwYWludGFibGUgTm9kZSB0eXBlcy4gU2hvdWxkIGhvb2sgaW50byB0aGUgZHJhd2FibGUncyBwcm90b3R5cGUgKHByZXN1bWFibHkpLlxuICAgKlxuICAgKiBEcmF3cyB0aGUgY3VycmVudCBOb2RlJ3Mgc2VsZiByZXByZXNlbnRhdGlvbiwgYXNzdW1pbmcgdGhlIHdyYXBwZXIncyBDYW52YXMgY29udGV4dCBpcyBhbHJlYWR5IGluIHRoZSBsb2NhbFxuICAgKiBjb29yZGluYXRlIGZyYW1lIG9mIHRoaXMgbm9kZS5cbiAgICpcbiAgICogQHBhcmFtIHdyYXBwZXJcbiAgICogQHBhcmFtIG1hdHJpeCAtIFRoZSB0cmFuc2Zvcm1hdGlvbiBtYXRyaXggYWxyZWFkeSBhcHBsaWVkIHRvIHRoZSBjb250ZXh0LlxuICAgKi9cbiAgcHJvdGVjdGVkIGNhbnZhc1BhaW50U2VsZiggd3JhcHBlcjogQ2FudmFzQ29udGV4dFdyYXBwZXIsIG1hdHJpeDogTWF0cml4MyApOiB2b2lkIHtcbiAgICAvLyBTZWUgc3ViY2xhc3MgZm9yIGltcGxlbWVudGF0aW9uXG4gIH1cblxuICAvKipcbiAgICogUmVuZGVycyB0aGlzIE5vZGUgb25seSAoaXRzIHNlbGYpIGludG8gdGhlIENhbnZhcyB3cmFwcGVyLCBpbiBpdHMgbG9jYWwgY29vcmRpbmF0ZSBmcmFtZS5cbiAgICpcbiAgICogQHBhcmFtIHdyYXBwZXJcbiAgICogQHBhcmFtIG1hdHJpeCAtIFRoZSB0cmFuc2Zvcm1hdGlvbiBtYXRyaXggYWxyZWFkeSBhcHBsaWVkIHRvIHRoZSBjb250ZXh0LlxuICAgKi9cbiAgcHVibGljIHJlbmRlclRvQ2FudmFzU2VsZiggd3JhcHBlcjogQ2FudmFzQ29udGV4dFdyYXBwZXIsIG1hdHJpeDogTWF0cml4MyApOiB2b2lkIHtcbiAgICBpZiAoIHRoaXMuaXNQYWludGVkKCkgJiYgKCB0aGlzLl9yZW5kZXJlckJpdG1hc2sgJiBSZW5kZXJlci5iaXRtYXNrQ2FudmFzICkgKSB7XG4gICAgICB0aGlzLmNhbnZhc1BhaW50U2VsZiggd3JhcHBlciwgbWF0cml4ICk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFJlbmRlcnMgdGhpcyBOb2RlIGFuZCBpdHMgZGVzY2VuZGFudHMgaW50byB0aGUgQ2FudmFzIHdyYXBwZXIuXG4gICAqXG4gICAqIEBwYXJhbSB3cmFwcGVyXG4gICAqIEBwYXJhbSBbbWF0cml4XSAtIE9wdGlvbmFsIHRyYW5zZm9ybSB0byBiZSBhcHBsaWVkXG4gICAqL1xuICBwdWJsaWMgcmVuZGVyVG9DYW52YXNTdWJ0cmVlKCB3cmFwcGVyOiBDYW52YXNDb250ZXh0V3JhcHBlciwgbWF0cml4PzogTWF0cml4MyApOiB2b2lkIHtcbiAgICBtYXRyaXggPSBtYXRyaXggfHwgTWF0cml4My5pZGVudGl0eSgpO1xuXG4gICAgd3JhcHBlci5yZXNldFN0eWxlcygpO1xuXG4gICAgdGhpcy5yZW5kZXJUb0NhbnZhc1NlbGYoIHdyYXBwZXIsIG1hdHJpeCApO1xuICAgIGZvciAoIGxldCBpID0gMDsgaSA8IHRoaXMuX2NoaWxkcmVuLmxlbmd0aDsgaSsrICkge1xuICAgICAgY29uc3QgY2hpbGQgPSB0aGlzLl9jaGlsZHJlblsgaSBdO1xuXG4gICAgICAvLyBJZ25vcmUgaW52YWxpZCAoZW1wdHkpIGJvdW5kcywgc2luY2UgdGhpcyB3b3VsZCBzaG93IG5vdGhpbmcgKGFuZCB3ZSBjb3VsZG4ndCBjb21wdXRlIGZpdHRlZCBib3VuZHMgZm9yIGl0KS5cbiAgICAgIGlmICggY2hpbGQuaXNWaXNpYmxlKCkgJiYgY2hpbGQuYm91bmRzLmlzVmFsaWQoKSApIHtcblxuICAgICAgICAvLyBGb3IgYW55dGhpbmcgZmlsdGVyLWxpa2UsIHdlJ2xsIG5lZWQgdG8gY3JlYXRlIGEgQ2FudmFzLCByZW5kZXIgb3VyIGNoaWxkJ3MgY29udGVudCBpbnRvIHRoYXQgQ2FudmFzLFxuICAgICAgICAvLyBhbmQgdGhlbiAoYXBwbHlpbmcgdGhlIGZpbHRlcikgcmVuZGVyIHRoYXQgaW50byB0aGUgQ2FudmFzIHByb3ZpZGVkLlxuICAgICAgICBjb25zdCByZXF1aXJlc1NjcmF0Y2hDYW52YXMgPSBjaGlsZC5lZmZlY3RpdmVPcGFjaXR5ICE9PSAxIHx8IGNoaWxkLmNsaXBBcmVhIHx8IGNoaWxkLl9maWx0ZXJzLmxlbmd0aDtcblxuICAgICAgICB3cmFwcGVyLmNvbnRleHQuc2F2ZSgpO1xuICAgICAgICBtYXRyaXgubXVsdGlwbHlNYXRyaXgoIGNoaWxkLl90cmFuc2Zvcm0uZ2V0TWF0cml4KCkgKTtcbiAgICAgICAgbWF0cml4LmNhbnZhc1NldFRyYW5zZm9ybSggd3JhcHBlci5jb250ZXh0ICk7XG4gICAgICAgIGlmICggcmVxdWlyZXNTY3JhdGNoQ2FudmFzICkge1xuICAgICAgICAgIC8vIFdlJ2xsIGF0dGVtcHQgdG8gZml0IHRoZSBDYW52YXMgdG8gdGhlIGNvbnRlbnQgdG8gbWluaW1pemUgbWVtb3J5IHVzZSwgc2VlXG4gICAgICAgICAgLy8gaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2Z1bmN0aW9uLWJ1aWxkZXIvaXNzdWVzLzE0OFxuXG4gICAgICAgICAgLy8gV2UncmUgZ29pbmcgdG8gaWdub3JlIGNvbnRlbnQgb3V0c2lkZSBvdXIgd3JhcHBlciBjb250ZXh0J3MgY2FudmFzLlxuICAgICAgICAgIC8vIEFkZGVkIHBhZGRpbmcgYW5kIHJvdW5kLW91dCBmb3IgY2FzZXMgd2hlcmUgQ2FudmFzIGJvdW5kcyBtaWdodCBub3QgYmUgZnVsbHkgYWNjdXJhdGVcbiAgICAgICAgICAvLyBUaGUgbWF0cml4IGFscmVhZHkgaW5jbHVkZXMgdGhlIGNoaWxkJ3MgdHJhbnNmb3JtIChzbyB3ZSB1c2UgbG9jYWxCb3VuZHMpLlxuICAgICAgICAgIC8vIFdlIHdvbid0IGdvIG91dHNpZGUgb3VyIHBhcmVudCBjYW52YXMnIGJvdW5kcywgc2luY2UgdGhpcyB3b3VsZCBiZSBhIHdhc3RlIG9mIG1lbW9yeSAod291bGRuJ3QgYmUgd3JpdHRlbilcbiAgICAgICAgICAvLyBUaGUgcm91bmQtb3V0IHdpbGwgbWFrZSBzdXJlIHdlIGhhdmUgcGl4ZWwgYWxpZ25tZW50LCBzbyB0aGF0IHdlIHdvbid0IGdldCBibHVycyBvciBhbGlhc2luZy9ibGl0dGluZ1xuICAgICAgICAgIC8vIGVmZmVjdHMgd2hlbiBjb3B5aW5nIHRoaW5ncyBvdmVyLlxuICAgICAgICAgIGNvbnN0IGNoaWxkQ2FudmFzQm91bmRzID0gY2hpbGQubG9jYWxCb3VuZHMudHJhbnNmb3JtZWQoIG1hdHJpeCApLmRpbGF0ZSggNCApLnJvdW5kT3V0KCkuY29uc3RyYWluQm91bmRzKFxuICAgICAgICAgICAgc2NyYXRjaEJvdW5kczJFeHRyYS5zZXRNaW5NYXgoIDAsIDAsIHdyYXBwZXIuY2FudmFzLndpZHRoLCB3cmFwcGVyLmNhbnZhcy5oZWlnaHQgKVxuICAgICAgICAgICk7XG5cbiAgICAgICAgICBpZiAoIGNoaWxkQ2FudmFzQm91bmRzLndpZHRoID4gMCAmJiBjaGlsZENhbnZhc0JvdW5kcy5oZWlnaHQgPiAwICkge1xuICAgICAgICAgICAgY29uc3QgY2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCggJ2NhbnZhcycgKTtcblxuICAgICAgICAgICAgLy8gV2UnbGwgc2V0IG91ciBDYW52YXMgdG8gdGhlIGZpdHRlZCB3aWR0aCwgYW5kIHdpbGwgaGFuZGxlIHRoZSBvZmZzZXRzIGJlbG93LlxuICAgICAgICAgICAgY2FudmFzLndpZHRoID0gY2hpbGRDYW52YXNCb3VuZHMud2lkdGg7XG4gICAgICAgICAgICBjYW52YXMuaGVpZ2h0ID0gY2hpbGRDYW52YXNCb3VuZHMuaGVpZ2h0O1xuICAgICAgICAgICAgY29uc3QgY29udGV4dCA9IGNhbnZhcy5nZXRDb250ZXh0KCAnMmQnICkhO1xuICAgICAgICAgICAgY29uc3QgY2hpbGRXcmFwcGVyID0gbmV3IENhbnZhc0NvbnRleHRXcmFwcGVyKCBjYW52YXMsIGNvbnRleHQgKTtcblxuICAgICAgICAgICAgLy8gQWZ0ZXIgb3VyIGFuY2VzdG9yIHRyYW5zZm9ybSBpcyBhcHBsaWVkLCB3ZSdsbCBuZWVkIHRvIGFwcGx5IGFub3RoZXIgb2Zmc2V0IGZvciBmaXR0ZWQgQ2FudmFzLiBXZSdsbFxuICAgICAgICAgICAgLy8gbmVlZCB0byBwYXNzIHRoaXMgdG8gZGVzY2VuZGFudHMgQU5EIGFwcGx5IGl0IHRvIHRoZSBzdWItY29udGV4dC5cbiAgICAgICAgICAgIGNvbnN0IHN1Yk1hdHJpeCA9IG1hdHJpeC5jb3B5KCkucHJlcGVuZFRyYW5zbGF0aW9uKCAtY2hpbGRDYW52YXNCb3VuZHMubWluWCwgLWNoaWxkQ2FudmFzQm91bmRzLm1pblkgKTtcblxuICAgICAgICAgICAgc3ViTWF0cml4LmNhbnZhc1NldFRyYW5zZm9ybSggY29udGV4dCApO1xuICAgICAgICAgICAgY2hpbGQucmVuZGVyVG9DYW52YXNTdWJ0cmVlKCBjaGlsZFdyYXBwZXIsIHN1Yk1hdHJpeCApO1xuXG4gICAgICAgICAgICB3cmFwcGVyLmNvbnRleHQuc2F2ZSgpO1xuICAgICAgICAgICAgaWYgKCBjaGlsZC5jbGlwQXJlYSApIHtcbiAgICAgICAgICAgICAgd3JhcHBlci5jb250ZXh0LmJlZ2luUGF0aCgpO1xuICAgICAgICAgICAgICBjaGlsZC5jbGlwQXJlYS53cml0ZVRvQ29udGV4dCggd3JhcHBlci5jb250ZXh0ICk7XG4gICAgICAgICAgICAgIHdyYXBwZXIuY29udGV4dC5jbGlwKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB3cmFwcGVyLmNvbnRleHQuc2V0VHJhbnNmb3JtKCAxLCAwLCAwLCAxLCAwLCAwICk7IC8vIGlkZW50aXR5XG4gICAgICAgICAgICB3cmFwcGVyLmNvbnRleHQuZ2xvYmFsQWxwaGEgPSBjaGlsZC5lZmZlY3RpdmVPcGFjaXR5O1xuXG4gICAgICAgICAgICBsZXQgc2V0RmlsdGVyID0gZmFsc2U7XG4gICAgICAgICAgICBpZiAoIGNoaWxkLl9maWx0ZXJzLmxlbmd0aCApIHtcbiAgICAgICAgICAgICAgLy8gRmlsdGVycyBzaG91bGRuJ3QgYmUgdG9vIG9mdGVuLCBzbyBsZXNzIGNvbmNlcm5lZCBhYm91dCB0aGUgR0MgaGVyZSAoYW5kIHRoaXMgaXMgc28gbXVjaCBlYXNpZXIgdG8gcmVhZCkuXG4gICAgICAgICAgICAgIC8vIFBlcmZvcm1hbmNlIGJvdHRsZW5lY2sgZm9yIG5vdCB1c2luZyB0aGlzIGZhbGxiYWNrIHN0eWxlLCBzbyB3ZSdyZSBhbGxvd2luZyBpdCBmb3IgQ2hyb21lIGV2ZW4gdGhvdWdoXG4gICAgICAgICAgICAgIC8vIHRoZSB2aXN1YWwgZGlmZmVyZW5jZXMgbWF5IGJlIHByZXNlbnQsIHNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvc2NlbmVyeS9pc3N1ZXMvMTEzOVxuICAgICAgICAgICAgICBpZiAoIEZlYXR1cmVzLmNhbnZhc0ZpbHRlciAmJiBfLmV2ZXJ5KCBjaGlsZC5fZmlsdGVycywgZmlsdGVyID0+IGZpbHRlci5pc0RPTUNvbXBhdGlibGUoKSApICkge1xuICAgICAgICAgICAgICAgIHdyYXBwZXIuY29udGV4dC5maWx0ZXIgPSBjaGlsZC5fZmlsdGVycy5tYXAoIGZpbHRlciA9PiBmaWx0ZXIuZ2V0Q1NTRmlsdGVyU3RyaW5nKCkgKS5qb2luKCAnICcgKTtcbiAgICAgICAgICAgICAgICBzZXRGaWx0ZXIgPSB0cnVlO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIGNoaWxkLl9maWx0ZXJzLmZvckVhY2goIGZpbHRlciA9PiBmaWx0ZXIuYXBwbHlDYW52YXNGaWx0ZXIoIGNoaWxkV3JhcHBlciApICk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gVGhlIGludmVyc2UgdHJhbnNmb3JtIGlzIGFwcGxpZWQgdG8gaGFuZGxlIGZpdHRpbmdcbiAgICAgICAgICAgIHdyYXBwZXIuY29udGV4dC5kcmF3SW1hZ2UoIGNhbnZhcywgY2hpbGRDYW52YXNCb3VuZHMubWluWCwgY2hpbGRDYW52YXNCb3VuZHMubWluWSApO1xuICAgICAgICAgICAgd3JhcHBlci5jb250ZXh0LnJlc3RvcmUoKTtcbiAgICAgICAgICAgIGlmICggc2V0RmlsdGVyICkge1xuICAgICAgICAgICAgICB3cmFwcGVyLmNvbnRleHQuZmlsdGVyID0gJ25vbmUnO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICBjaGlsZC5yZW5kZXJUb0NhbnZhc1N1YnRyZWUoIHdyYXBwZXIsIG1hdHJpeCApO1xuICAgICAgICB9XG4gICAgICAgIG1hdHJpeC5tdWx0aXBseU1hdHJpeCggY2hpbGQuX3RyYW5zZm9ybS5nZXRJbnZlcnNlKCkgKTtcbiAgICAgICAgd3JhcHBlci5jb250ZXh0LnJlc3RvcmUoKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQGRlcHJlY2F0ZWRcbiAgICogUmVuZGVyIHRoaXMgTm9kZSB0byB0aGUgQ2FudmFzIChjbGVhcmluZyBpdCBmaXJzdClcbiAgICovXG4gIHB1YmxpYyByZW5kZXJUb0NhbnZhcyggY2FudmFzOiBIVE1MQ2FudmFzRWxlbWVudCwgY29udGV4dDogQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJELCBjYWxsYmFjaz86ICgpID0+IHZvaWQsIGJhY2tncm91bmRDb2xvcj86IHN0cmluZyApOiB2b2lkIHtcblxuICAgIGFzc2VydCAmJiBkZXByZWNhdGlvbldhcm5pbmcoICdOb2RlLnJlbmRlclRvQ2FudmFzKCkgaXMgZGVwcmVjYXRlZCwgcGxlYXNlIHVzZSBOb2RlLnJhc3Rlcml6ZWQoKSBpbnN0ZWFkJyApO1xuXG4gICAgLy8gc2hvdWxkIGJhc2ljYWxseSByZXNldCBldmVyeXRoaW5nIChhbmQgY2xlYXIgdGhlIENhbnZhcylcbiAgICBjYW52YXMud2lkdGggPSBjYW52YXMud2lkdGg7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tc2VsZi1hc3NpZ25cblxuICAgIGlmICggYmFja2dyb3VuZENvbG9yICkge1xuICAgICAgY29udGV4dC5maWxsU3R5bGUgPSBiYWNrZ3JvdW5kQ29sb3I7XG4gICAgICBjb250ZXh0LmZpbGxSZWN0KCAwLCAwLCBjYW52YXMud2lkdGgsIGNhbnZhcy5oZWlnaHQgKTtcbiAgICB9XG5cbiAgICBjb25zdCB3cmFwcGVyID0gbmV3IENhbnZhc0NvbnRleHRXcmFwcGVyKCBjYW52YXMsIGNvbnRleHQgKTtcblxuICAgIHRoaXMucmVuZGVyVG9DYW52YXNTdWJ0cmVlKCB3cmFwcGVyLCBNYXRyaXgzLmlkZW50aXR5KCkgKTtcblxuICAgIGNhbGxiYWNrICYmIGNhbGxiYWNrKCk7IC8vIHRoaXMgd2FzIG9yaWdpbmFsbHkgYXN5bmNocm9ub3VzLCBzbyB3ZSBoYWQgYSBjYWxsYmFja1xuICB9XG5cbiAgLyoqXG4gICAqIFJlbmRlcnMgdGhpcyBOb2RlIHRvIGFuIEhUTUxDYW52YXNFbGVtZW50LiBJZiB0b0NhbnZhcyggY2FsbGJhY2sgKSBpcyB1c2VkLCB0aGUgY2FudmFzIHdpbGwgY29udGFpbiB0aGUgbm9kZSdzXG4gICAqIGVudGlyZSBib3VuZHMgKGlmIG5vIHgveS93aWR0aC9oZWlnaHQgaXMgcHJvdmlkZWQpXG4gICAqXG4gICAqIEBwYXJhbSBjYWxsYmFjayAtIGNhbGxiYWNrKCBjYW52YXMsIHgsIHksIHdpZHRoLCBoZWlnaHQgKSBpcyBjYWxsZWQsIHdoZXJlIHgseSBhcmUgY29tcHV0ZWQgaWYgbm90IHNwZWNpZmllZC5cbiAgICogQHBhcmFtIFt4XSAtIFRoZSBYIG9mZnNldCBmb3Igd2hlcmUgdGhlIHVwcGVyLWxlZnQgb2YgdGhlIGNvbnRlbnQgZHJhd24gaW50byB0aGUgQ2FudmFzXG4gICAqIEBwYXJhbSBbeV0gLSBUaGUgWSBvZmZzZXQgZm9yIHdoZXJlIHRoZSB1cHBlci1sZWZ0IG9mIHRoZSBjb250ZW50IGRyYXduIGludG8gdGhlIENhbnZhc1xuICAgKiBAcGFyYW0gW3dpZHRoXSAtIFRoZSB3aWR0aCBvZiB0aGUgQ2FudmFzIG91dHB1dFxuICAgKiBAcGFyYW0gW2hlaWdodF0gLSBUaGUgaGVpZ2h0IG9mIHRoZSBDYW52YXMgb3V0cHV0XG4gICAqL1xuICBwdWJsaWMgdG9DYW52YXMoIGNhbGxiYWNrOiAoIGNhbnZhczogSFRNTENhbnZhc0VsZW1lbnQsIHg6IG51bWJlciwgeTogbnVtYmVyLCB3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlciApID0+IHZvaWQsIHg/OiBudW1iZXIsIHk/OiBudW1iZXIsIHdpZHRoPzogbnVtYmVyLCBoZWlnaHQ/OiBudW1iZXIgKTogdm9pZCB7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggeCA9PT0gdW5kZWZpbmVkIHx8IHR5cGVvZiB4ID09PSAnbnVtYmVyJywgJ0lmIHByb3ZpZGVkLCB4IHNob3VsZCBiZSBhIG51bWJlcicgKTtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB5ID09PSB1bmRlZmluZWQgfHwgdHlwZW9mIHkgPT09ICdudW1iZXInLCAnSWYgcHJvdmlkZWQsIHkgc2hvdWxkIGJlIGEgbnVtYmVyJyApO1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIHdpZHRoID09PSB1bmRlZmluZWQgfHwgKCB0eXBlb2Ygd2lkdGggPT09ICdudW1iZXInICYmIHdpZHRoID49IDAgJiYgKCB3aWR0aCAlIDEgPT09IDAgKSApLFxuICAgICAgJ0lmIHByb3ZpZGVkLCB3aWR0aCBzaG91bGQgYmUgYSBub24tbmVnYXRpdmUgaW50ZWdlcicgKTtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBoZWlnaHQgPT09IHVuZGVmaW5lZCB8fCAoIHR5cGVvZiBoZWlnaHQgPT09ICdudW1iZXInICYmIGhlaWdodCA+PSAwICYmICggaGVpZ2h0ICUgMSA9PT0gMCApICksXG4gICAgICAnSWYgcHJvdmlkZWQsIGhlaWdodCBzaG91bGQgYmUgYSBub24tbmVnYXRpdmUgaW50ZWdlcicgKTtcblxuICAgIGNvbnN0IHBhZGRpbmcgPSAyOyAvLyBwYWRkaW5nIHVzZWQgaWYgeCBhbmQgeSBhcmUgbm90IHNldFxuXG4gICAgLy8gZm9yIG5vdywgd2UgYWRkIGFuIHVucGxlYXNhbnQgaGFjayBhcm91bmQgVGV4dCBhbmQgc2FmZSBib3VuZHMgaW4gZ2VuZXJhbC4gV2UgZG9uJ3Qgd2FudCB0byBhZGQgYW5vdGhlciBCb3VuZHMyIG9iamVjdCBwZXIgTm9kZSBmb3Igbm93LlxuICAgIGNvbnN0IGJvdW5kcyA9IHRoaXMuZ2V0Qm91bmRzKCkudW5pb24oIHRoaXMubG9jYWxUb1BhcmVudEJvdW5kcyggdGhpcy5nZXRTYWZlU2VsZkJvdW5kcygpICkgKTtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCAhYm91bmRzLmlzRW1wdHkoKSB8fFxuICAgICAgICAgICAgICAgICAgICAgICggeCAhPT0gdW5kZWZpbmVkICYmIHkgIT09IHVuZGVmaW5lZCAmJiB3aWR0aCAhPT0gdW5kZWZpbmVkICYmIGhlaWdodCAhPT0gdW5kZWZpbmVkICksXG4gICAgICAnU2hvdWxkIG5vdCBjYWxsIHRvQ2FudmFzIG9uIGEgTm9kZSB3aXRoIGVtcHR5IGJvdW5kcywgdW5sZXNzIGFsbCBkaW1lbnNpb25zIGFyZSBwcm92aWRlZCcgKTtcblxuICAgIHggPSB4ICE9PSB1bmRlZmluZWQgPyB4IDogTWF0aC5jZWlsKCBwYWRkaW5nIC0gYm91bmRzLm1pblggKTtcbiAgICB5ID0geSAhPT0gdW5kZWZpbmVkID8geSA6IE1hdGguY2VpbCggcGFkZGluZyAtIGJvdW5kcy5taW5ZICk7XG4gICAgd2lkdGggPSB3aWR0aCAhPT0gdW5kZWZpbmVkID8gd2lkdGggOiBNYXRoLmNlaWwoIGJvdW5kcy5nZXRXaWR0aCgpICsgMiAqIHBhZGRpbmcgKTtcbiAgICBoZWlnaHQgPSBoZWlnaHQgIT09IHVuZGVmaW5lZCA/IGhlaWdodCA6IE1hdGguY2VpbCggYm91bmRzLmdldEhlaWdodCgpICsgMiAqIHBhZGRpbmcgKTtcblxuICAgIGNvbnN0IGNhbnZhcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoICdjYW52YXMnICk7XG4gICAgY2FudmFzLndpZHRoID0gd2lkdGg7XG4gICAgY2FudmFzLmhlaWdodCA9IGhlaWdodDtcbiAgICBjb25zdCBjb250ZXh0ID0gY2FudmFzLmdldENvbnRleHQoICcyZCcgKSE7XG5cbiAgICAvLyBzaGlmdCBvdXIgcmVuZGVyaW5nIG92ZXIgYnkgdGhlIGRlc2lyZWQgYW1vdW50XG4gICAgY29udGV4dC50cmFuc2xhdGUoIHgsIHkgKTtcblxuICAgIC8vIGZvciBBUEkgY29tcGF0aWJpbGl0eSwgd2UgYXBwbHkgb3VyIG93biB0cmFuc2Zvcm0gaGVyZVxuICAgIHRoaXMuX3RyYW5zZm9ybS5nZXRNYXRyaXgoKS5jYW52YXNBcHBlbmRUcmFuc2Zvcm0oIGNvbnRleHQgKTtcblxuICAgIGNvbnN0IHdyYXBwZXIgPSBuZXcgQ2FudmFzQ29udGV4dFdyYXBwZXIoIGNhbnZhcywgY29udGV4dCApO1xuXG4gICAgdGhpcy5yZW5kZXJUb0NhbnZhc1N1YnRyZWUoIHdyYXBwZXIsIE1hdHJpeDMudHJhbnNsYXRpb24oIHgsIHkgKS50aW1lc01hdHJpeCggdGhpcy5fdHJhbnNmb3JtLmdldE1hdHJpeCgpICkgKTtcblxuICAgIGNhbGxiYWNrKCBjYW52YXMsIHgsIHksIHdpZHRoLCBoZWlnaHQgKTsgLy8gd2UgdXNlZCB0byBiZSBhc3luY2hyb25vdXNcbiAgfVxuXG4gIC8qKlxuICAgKiBSZW5kZXJzIHRoaXMgTm9kZSB0byBhIENhbnZhcywgdGhlbiBjYWxscyB0aGUgY2FsbGJhY2sgd2l0aCB0aGUgZGF0YSBVUkkgZnJvbSBpdC5cbiAgICpcbiAgICogQHBhcmFtIGNhbGxiYWNrIC0gY2FsbGJhY2soIGRhdGFVUkkge3N0cmluZ30sIHgsIHksIHdpZHRoLCBoZWlnaHQgKSBpcyBjYWxsZWQsIHdoZXJlIHgseSBhcmUgY29tcHV0ZWQgaWYgbm90IHNwZWNpZmllZC5cbiAgICogQHBhcmFtIFt4XSAtIFRoZSBYIG9mZnNldCBmb3Igd2hlcmUgdGhlIHVwcGVyLWxlZnQgb2YgdGhlIGNvbnRlbnQgZHJhd24gaW50byB0aGUgQ2FudmFzXG4gICAqIEBwYXJhbSBbeV0gLSBUaGUgWSBvZmZzZXQgZm9yIHdoZXJlIHRoZSB1cHBlci1sZWZ0IG9mIHRoZSBjb250ZW50IGRyYXduIGludG8gdGhlIENhbnZhc1xuICAgKiBAcGFyYW0gW3dpZHRoXSAtIFRoZSB3aWR0aCBvZiB0aGUgQ2FudmFzIG91dHB1dFxuICAgKiBAcGFyYW0gW2hlaWdodF0gLSBUaGUgaGVpZ2h0IG9mIHRoZSBDYW52YXMgb3V0cHV0XG4gICAqL1xuICBwdWJsaWMgdG9EYXRhVVJMKCBjYWxsYmFjazogKCBkYXRhVVJJOiBzdHJpbmcsIHg6IG51bWJlciwgeTogbnVtYmVyLCB3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlciApID0+IHZvaWQsIHg/OiBudW1iZXIsIHk/OiBudW1iZXIsIHdpZHRoPzogbnVtYmVyLCBoZWlnaHQ/OiBudW1iZXIgKTogdm9pZCB7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggeCA9PT0gdW5kZWZpbmVkIHx8IHR5cGVvZiB4ID09PSAnbnVtYmVyJywgJ0lmIHByb3ZpZGVkLCB4IHNob3VsZCBiZSBhIG51bWJlcicgKTtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB5ID09PSB1bmRlZmluZWQgfHwgdHlwZW9mIHkgPT09ICdudW1iZXInLCAnSWYgcHJvdmlkZWQsIHkgc2hvdWxkIGJlIGEgbnVtYmVyJyApO1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIHdpZHRoID09PSB1bmRlZmluZWQgfHwgKCB0eXBlb2Ygd2lkdGggPT09ICdudW1iZXInICYmIHdpZHRoID49IDAgJiYgKCB3aWR0aCAlIDEgPT09IDAgKSApLFxuICAgICAgJ0lmIHByb3ZpZGVkLCB3aWR0aCBzaG91bGQgYmUgYSBub24tbmVnYXRpdmUgaW50ZWdlcicgKTtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBoZWlnaHQgPT09IHVuZGVmaW5lZCB8fCAoIHR5cGVvZiBoZWlnaHQgPT09ICdudW1iZXInICYmIGhlaWdodCA+PSAwICYmICggaGVpZ2h0ICUgMSA9PT0gMCApICksXG4gICAgICAnSWYgcHJvdmlkZWQsIGhlaWdodCBzaG91bGQgYmUgYSBub24tbmVnYXRpdmUgaW50ZWdlcicgKTtcblxuICAgIHRoaXMudG9DYW52YXMoICggY2FudmFzLCB4LCB5LCB3aWR0aCwgaGVpZ2h0ICkgPT4ge1xuICAgICAgLy8gdGhpcyB4IGFuZCB5IHNoYWRvdyB0aGUgb3V0c2lkZSBwYXJhbWV0ZXJzLCBhbmQgd2lsbCBiZSBkaWZmZXJlbnQgaWYgdGhlIG91dHNpZGUgcGFyYW1ldGVycyBhcmUgdW5kZWZpbmVkXG4gICAgICBjYWxsYmFjayggY2FudmFzLnRvRGF0YVVSTCgpLCB4LCB5LCB3aWR0aCwgaGVpZ2h0ICk7XG4gICAgfSwgeCwgeSwgd2lkdGgsIGhlaWdodCApO1xuICB9XG5cbiAgLyoqXG4gICAqIENhbGxzIHRoZSBjYWxsYmFjayB3aXRoIGFuIEhUTUxJbWFnZUVsZW1lbnQgdGhhdCBjb250YWlucyB0aGlzIE5vZGUncyBzdWJ0cmVlJ3MgdmlzdWFsIGZvcm0uXG4gICAqIFdpbGwgYWx3YXlzIGJlIGFzeW5jaHJvbm91cy5cbiAgICogQGRlcHJlY2F0ZWQgLSBVc2Ugbm9kZS5yYXN0ZXJpemVkKCkgZm9yIGNyZWF0aW5nIGEgcmFzdGVyaXplZCBjb3B5LCBvciBnZW5lcmFsbHkgaXQncyBiZXN0IHRvIGdldCB0aGUgZGF0YVxuICAgKiAgICAgICAgICAgICAgIFVSTCBpbnN0ZWFkIGRpcmVjdGx5LlxuICAgKlxuICAgKiBAcGFyYW0gY2FsbGJhY2sgLSBjYWxsYmFjayggaW1hZ2Uge0hUTUxJbWFnZUVsZW1lbnR9LCB4LCB5ICkgaXMgY2FsbGVkXG4gICAqIEBwYXJhbSBbeF0gLSBUaGUgWCBvZmZzZXQgZm9yIHdoZXJlIHRoZSB1cHBlci1sZWZ0IG9mIHRoZSBjb250ZW50IGRyYXduIGludG8gdGhlIENhbnZhc1xuICAgKiBAcGFyYW0gW3ldIC0gVGhlIFkgb2Zmc2V0IGZvciB3aGVyZSB0aGUgdXBwZXItbGVmdCBvZiB0aGUgY29udGVudCBkcmF3biBpbnRvIHRoZSBDYW52YXNcbiAgICogQHBhcmFtIFt3aWR0aF0gLSBUaGUgd2lkdGggb2YgdGhlIENhbnZhcyBvdXRwdXRcbiAgICogQHBhcmFtIFtoZWlnaHRdIC0gVGhlIGhlaWdodCBvZiB0aGUgQ2FudmFzIG91dHB1dFxuICAgKi9cbiAgcHVibGljIHRvSW1hZ2UoIGNhbGxiYWNrOiAoIGltYWdlOiBIVE1MSW1hZ2VFbGVtZW50LCB4OiBudW1iZXIsIHk6IG51bWJlciApID0+IHZvaWQsIHg/OiBudW1iZXIsIHk/OiBudW1iZXIsIHdpZHRoPzogbnVtYmVyLCBoZWlnaHQ/OiBudW1iZXIgKTogdm9pZCB7XG5cbiAgICBhc3NlcnQgJiYgZGVwcmVjYXRpb25XYXJuaW5nKCAnTm9kZS50b0ltYWdlKCkgaXMgZGVwcmVjYXRlZCwgcGxlYXNlIHVzZSBOb2RlLnJhc3Rlcml6ZWQoKSBpbnN0ZWFkJyApO1xuXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggeCA9PT0gdW5kZWZpbmVkIHx8IHR5cGVvZiB4ID09PSAnbnVtYmVyJywgJ0lmIHByb3ZpZGVkLCB4IHNob3VsZCBiZSBhIG51bWJlcicgKTtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB5ID09PSB1bmRlZmluZWQgfHwgdHlwZW9mIHkgPT09ICdudW1iZXInLCAnSWYgcHJvdmlkZWQsIHkgc2hvdWxkIGJlIGEgbnVtYmVyJyApO1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIHdpZHRoID09PSB1bmRlZmluZWQgfHwgKCB0eXBlb2Ygd2lkdGggPT09ICdudW1iZXInICYmIHdpZHRoID49IDAgJiYgKCB3aWR0aCAlIDEgPT09IDAgKSApLFxuICAgICAgJ0lmIHByb3ZpZGVkLCB3aWR0aCBzaG91bGQgYmUgYSBub24tbmVnYXRpdmUgaW50ZWdlcicgKTtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBoZWlnaHQgPT09IHVuZGVmaW5lZCB8fCAoIHR5cGVvZiBoZWlnaHQgPT09ICdudW1iZXInICYmIGhlaWdodCA+PSAwICYmICggaGVpZ2h0ICUgMSA9PT0gMCApICksXG4gICAgICAnSWYgcHJvdmlkZWQsIGhlaWdodCBzaG91bGQgYmUgYSBub24tbmVnYXRpdmUgaW50ZWdlcicgKTtcblxuICAgIHRoaXMudG9EYXRhVVJMKCAoIHVybCwgeCwgeSApID0+IHtcbiAgICAgIC8vIHRoaXMgeCBhbmQgeSBzaGFkb3cgdGhlIG91dHNpZGUgcGFyYW1ldGVycywgYW5kIHdpbGwgYmUgZGlmZmVyZW50IGlmIHRoZSBvdXRzaWRlIHBhcmFtZXRlcnMgYXJlIHVuZGVmaW5lZFxuICAgICAgY29uc3QgaW1nID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCggJ2ltZycgKTtcbiAgICAgIGltZy5vbmxvYWQgPSAoKSA9PiB7XG4gICAgICAgIGNhbGxiYWNrKCBpbWcsIHgsIHkgKTtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAvLyBAdHMtZXhwZWN0LWVycm9yIC0gSSBiZWxpZXZlIHdlIG5lZWQgdG8gZGVsZXRlIHRoaXNcbiAgICAgICAgICBkZWxldGUgaW1nLm9ubG9hZDtcbiAgICAgICAgfVxuICAgICAgICBjYXRjaCggZSApIHtcbiAgICAgICAgICAvLyBkbyBub3RoaW5nXG4gICAgICAgIH0gLy8gZmFpbHMgb24gU2FmYXJpIDUuMVxuICAgICAgfTtcbiAgICAgIGltZy5zcmMgPSB1cmw7XG4gICAgfSwgeCwgeSwgd2lkdGgsIGhlaWdodCApO1xuICB9XG5cbiAgLyoqXG4gICAqIENhbGxzIHRoZSBjYWxsYmFjayB3aXRoIGFuIEltYWdlIE5vZGUgdGhhdCBjb250YWlucyB0aGlzIE5vZGUncyBzdWJ0cmVlJ3MgdmlzdWFsIGZvcm0uIFRoaXMgaXMgYWx3YXlzXG4gICAqIGFzeW5jaHJvbm91cywgYnV0IHRoZSByZXN1bHRpbmcgaW1hZ2UgTm9kZSBjYW4gYmUgdXNlZCB3aXRoIGFueSBiYWNrLWVuZCAoQ2FudmFzL1dlYkdML1NWRy9ldGMuKVxuICAgKiBAZGVwcmVjYXRlZCAtIFVzZSBub2RlLnJhc3Rlcml6ZWQoKSBpbnN0ZWFkIChzaG91bGQgYXZvaWQgdGhlIGFzeW5jaHJvbm91cy1uZXNzKVxuICAgKlxuICAgKiBAcGFyYW0gY2FsbGJhY2sgLSBjYWxsYmFjayggaW1hZ2VOb2RlIHtJbWFnZX0gKSBpcyBjYWxsZWRcbiAgICogQHBhcmFtIFt4XSAtIFRoZSBYIG9mZnNldCBmb3Igd2hlcmUgdGhlIHVwcGVyLWxlZnQgb2YgdGhlIGNvbnRlbnQgZHJhd24gaW50byB0aGUgQ2FudmFzXG4gICAqIEBwYXJhbSBbeV0gLSBUaGUgWSBvZmZzZXQgZm9yIHdoZXJlIHRoZSB1cHBlci1sZWZ0IG9mIHRoZSBjb250ZW50IGRyYXduIGludG8gdGhlIENhbnZhc1xuICAgKiBAcGFyYW0gW3dpZHRoXSAtIFRoZSB3aWR0aCBvZiB0aGUgQ2FudmFzIG91dHB1dFxuICAgKiBAcGFyYW0gW2hlaWdodF0gLSBUaGUgaGVpZ2h0IG9mIHRoZSBDYW52YXMgb3V0cHV0XG4gICAqL1xuICBwdWJsaWMgdG9JbWFnZU5vZGVBc3luY2hyb25vdXMoIGNhbGxiYWNrOiAoIGltYWdlOiBOb2RlICkgPT4gdm9pZCwgeD86IG51bWJlciwgeT86IG51bWJlciwgd2lkdGg/OiBudW1iZXIsIGhlaWdodD86IG51bWJlciApOiB2b2lkIHtcblxuICAgIGFzc2VydCAmJiBkZXByZWNhdGlvbldhcm5pbmcoICdOb2RlLnRvSW1hZ2VOb2RlQXN5bmNyaG9ub3VzKCkgaXMgZGVwcmVjYXRlZCwgcGxlYXNlIHVzZSBOb2RlLnJhc3Rlcml6ZWQoKSBpbnN0ZWFkJyApO1xuXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggeCA9PT0gdW5kZWZpbmVkIHx8IHR5cGVvZiB4ID09PSAnbnVtYmVyJywgJ0lmIHByb3ZpZGVkLCB4IHNob3VsZCBiZSBhIG51bWJlcicgKTtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB5ID09PSB1bmRlZmluZWQgfHwgdHlwZW9mIHkgPT09ICdudW1iZXInLCAnSWYgcHJvdmlkZWQsIHkgc2hvdWxkIGJlIGEgbnVtYmVyJyApO1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIHdpZHRoID09PSB1bmRlZmluZWQgfHwgKCB0eXBlb2Ygd2lkdGggPT09ICdudW1iZXInICYmIHdpZHRoID49IDAgJiYgKCB3aWR0aCAlIDEgPT09IDAgKSApLFxuICAgICAgJ0lmIHByb3ZpZGVkLCB3aWR0aCBzaG91bGQgYmUgYSBub24tbmVnYXRpdmUgaW50ZWdlcicgKTtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBoZWlnaHQgPT09IHVuZGVmaW5lZCB8fCAoIHR5cGVvZiBoZWlnaHQgPT09ICdudW1iZXInICYmIGhlaWdodCA+PSAwICYmICggaGVpZ2h0ICUgMSA9PT0gMCApICksXG4gICAgICAnSWYgcHJvdmlkZWQsIGhlaWdodCBzaG91bGQgYmUgYSBub24tbmVnYXRpdmUgaW50ZWdlcicgKTtcblxuICAgIHRoaXMudG9JbWFnZSggKCBpbWFnZSwgeCwgeSApID0+IHtcbiAgICAgIGNhbGxiYWNrKCBuZXcgTm9kZSgge1xuICAgICAgICBjaGlsZHJlbjogW1xuICAgICAgICAgIG5ldyBJbWFnZSggaW1hZ2UsIHsgeDogLXgsIHk6IC15IH0gKVxuICAgICAgICBdXG4gICAgICB9ICkgKTtcbiAgICB9LCB4LCB5LCB3aWR0aCwgaGVpZ2h0ICk7XG4gIH1cblxuICAvKipcbiAgICogQ3JlYXRlcyBhIE5vZGUgY29udGFpbmluZyBhbiBJbWFnZSBOb2RlIHRoYXQgY29udGFpbnMgdGhpcyBOb2RlJ3Mgc3VidHJlZSdzIHZpc3VhbCBmb3JtLiBUaGlzIGlzIGFsd2F5c1xuICAgKiBzeW5jaHJvbm91cywgYnV0IHRoZSByZXN1bHRpbmcgaW1hZ2UgTm9kZSBjYW4gT05MWSB1c2VkIHdpdGggQ2FudmFzL1dlYkdMIChOT1QgU1ZHKS5cbiAgICogQGRlcHJlY2F0ZWQgLSBVc2Ugbm9kZS5yYXN0ZXJpemVkKCkgaW5zdGVhZCwgc2hvdWxkIGJlIG1vc3RseSBlcXVpdmFsZW50IGlmIHVzZUNhbnZhczp0cnVlIGlzIHByb3ZpZGVkLlxuICAgKlxuICAgKiBAcGFyYW0gW3hdIC0gVGhlIFggb2Zmc2V0IGZvciB3aGVyZSB0aGUgdXBwZXItbGVmdCBvZiB0aGUgY29udGVudCBkcmF3biBpbnRvIHRoZSBDYW52YXNcbiAgICogQHBhcmFtIFt5XSAtIFRoZSBZIG9mZnNldCBmb3Igd2hlcmUgdGhlIHVwcGVyLWxlZnQgb2YgdGhlIGNvbnRlbnQgZHJhd24gaW50byB0aGUgQ2FudmFzXG4gICAqIEBwYXJhbSBbd2lkdGhdIC0gVGhlIHdpZHRoIG9mIHRoZSBDYW52YXMgb3V0cHV0XG4gICAqIEBwYXJhbSBbaGVpZ2h0XSAtIFRoZSBoZWlnaHQgb2YgdGhlIENhbnZhcyBvdXRwdXRcbiAgICovXG4gIHB1YmxpYyB0b0NhbnZhc05vZGVTeW5jaHJvbm91cyggeD86IG51bWJlciwgeT86IG51bWJlciwgd2lkdGg/OiBudW1iZXIsIGhlaWdodD86IG51bWJlciApOiBOb2RlIHtcblxuICAgIGFzc2VydCAmJiBkZXByZWNhdGlvbldhcm5pbmcoICdOb2RlLnRvQ2FudmFzTm9kZVN5bmNocm9ub3VzKCkgaXMgZGVwcmVjYXRlZCwgcGxlYXNlIHVzZSBOb2RlLnJhc3Rlcml6ZWQoKSBpbnN0ZWFkJyApO1xuXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggeCA9PT0gdW5kZWZpbmVkIHx8IHR5cGVvZiB4ID09PSAnbnVtYmVyJywgJ0lmIHByb3ZpZGVkLCB4IHNob3VsZCBiZSBhIG51bWJlcicgKTtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB5ID09PSB1bmRlZmluZWQgfHwgdHlwZW9mIHkgPT09ICdudW1iZXInLCAnSWYgcHJvdmlkZWQsIHkgc2hvdWxkIGJlIGEgbnVtYmVyJyApO1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIHdpZHRoID09PSB1bmRlZmluZWQgfHwgKCB0eXBlb2Ygd2lkdGggPT09ICdudW1iZXInICYmIHdpZHRoID49IDAgJiYgKCB3aWR0aCAlIDEgPT09IDAgKSApLFxuICAgICAgJ0lmIHByb3ZpZGVkLCB3aWR0aCBzaG91bGQgYmUgYSBub24tbmVnYXRpdmUgaW50ZWdlcicgKTtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBoZWlnaHQgPT09IHVuZGVmaW5lZCB8fCAoIHR5cGVvZiBoZWlnaHQgPT09ICdudW1iZXInICYmIGhlaWdodCA+PSAwICYmICggaGVpZ2h0ICUgMSA9PT0gMCApICksXG4gICAgICAnSWYgcHJvdmlkZWQsIGhlaWdodCBzaG91bGQgYmUgYSBub24tbmVnYXRpdmUgaW50ZWdlcicgKTtcblxuICAgIGxldCByZXN1bHQ6IE5vZGUgfCBudWxsID0gbnVsbDtcbiAgICB0aGlzLnRvQ2FudmFzKCAoIGNhbnZhcywgeCwgeSApID0+IHtcbiAgICAgIHJlc3VsdCA9IG5ldyBOb2RlKCB7XG4gICAgICAgIGNoaWxkcmVuOiBbXG4gICAgICAgICAgbmV3IEltYWdlKCBjYW52YXMsIHsgeDogLXgsIHk6IC15IH0gKVxuICAgICAgICBdXG4gICAgICB9ICk7XG4gICAgfSwgeCwgeSwgd2lkdGgsIGhlaWdodCApO1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIHJlc3VsdCwgJ3RvQ2FudmFzTm9kZVN5bmNocm9ub3VzIHJlcXVpcmVzIHRoYXQgdGhlIG5vZGUgY2FuIGJlIHJlbmRlcmVkIG9ubHkgdXNpbmcgQ2FudmFzJyApO1xuICAgIHJldHVybiByZXN1bHQhO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgYW4gSW1hZ2UgdGhhdCByZW5kZXJzIHRoaXMgTm9kZS4gVGhpcyBpcyBhbHdheXMgc3luY2hyb25vdXMsIGFuZCBzZXRzIGluaXRpYWxXaWR0aC9pbml0aWFsSGVpZ2h0IHNvIHRoYXRcbiAgICogd2UgaGF2ZSB0aGUgYm91bmRzIGltbWVkaWF0ZWx5LiAgVXNlIHRoaXMgbWV0aG9kIGlmIHlvdSBuZWVkIHRvIHJlZHVjZSB0aGUgbnVtYmVyIG9mIHBhcmVudCBOb2Rlcy5cbiAgICpcbiAgICogTk9URTogdGhlIHJlc3VsdGFudCBJbWFnZSBzaG91bGQgYmUgcG9zaXRpb25lZCB1c2luZyBpdHMgYm91bmRzIHJhdGhlciB0aGFuICh4LHkpLiAgVG8gY3JlYXRlIGEgTm9kZSB0aGF0IGNhbiBiZVxuICAgKiBwb3NpdGlvbmVkIGxpa2UgYW55IG90aGVyIG5vZGUsIHBsZWFzZSB1c2UgdG9EYXRhVVJMTm9kZVN5bmNocm9ub3VzLlxuICAgKiBAZGVwcmVjYXRlZCAtIFVzZSBub2RlLnJhc3Rlcml6ZWQoKSBpbnN0ZWFkLCBzaG91bGQgYmUgbW9zdGx5IGVxdWl2YWxlbnQgaWYgd3JhcDpmYWxzZSBpcyBwcm92aWRlZC5cbiAgICpcbiAgICogQHBhcmFtIFt4XSAtIFRoZSBYIG9mZnNldCBmb3Igd2hlcmUgdGhlIHVwcGVyLWxlZnQgb2YgdGhlIGNvbnRlbnQgZHJhd24gaW50byB0aGUgQ2FudmFzXG4gICAqIEBwYXJhbSBbeV0gLSBUaGUgWSBvZmZzZXQgZm9yIHdoZXJlIHRoZSB1cHBlci1sZWZ0IG9mIHRoZSBjb250ZW50IGRyYXduIGludG8gdGhlIENhbnZhc1xuICAgKiBAcGFyYW0gW3dpZHRoXSAtIFRoZSB3aWR0aCBvZiB0aGUgQ2FudmFzIG91dHB1dFxuICAgKiBAcGFyYW0gW2hlaWdodF0gLSBUaGUgaGVpZ2h0IG9mIHRoZSBDYW52YXMgb3V0cHV0XG4gICAqL1xuICBwdWJsaWMgdG9EYXRhVVJMSW1hZ2VTeW5jaHJvbm91cyggeD86IG51bWJlciwgeT86IG51bWJlciwgd2lkdGg/OiBudW1iZXIsIGhlaWdodD86IG51bWJlciApOiBJbWFnZSB7XG5cbiAgICBhc3NlcnQgJiYgZGVwcmVjYXRpb25XYXJuaW5nKCAnTm9kZS50b0RhdGFVUkxJbWFnZVN5Y2hyb25vdXMoKSBpcyBkZXByZWNhdGVkLCBwbGVhc2UgdXNlIE5vZGUucmFzdGVyaXplZCgpIGluc3RlYWQnICk7XG5cbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB4ID09PSB1bmRlZmluZWQgfHwgdHlwZW9mIHggPT09ICdudW1iZXInLCAnSWYgcHJvdmlkZWQsIHggc2hvdWxkIGJlIGEgbnVtYmVyJyApO1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIHkgPT09IHVuZGVmaW5lZCB8fCB0eXBlb2YgeSA9PT0gJ251bWJlcicsICdJZiBwcm92aWRlZCwgeSBzaG91bGQgYmUgYSBudW1iZXInICk7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggd2lkdGggPT09IHVuZGVmaW5lZCB8fCAoIHR5cGVvZiB3aWR0aCA9PT0gJ251bWJlcicgJiYgd2lkdGggPj0gMCAmJiAoIHdpZHRoICUgMSA9PT0gMCApICksXG4gICAgICAnSWYgcHJvdmlkZWQsIHdpZHRoIHNob3VsZCBiZSBhIG5vbi1uZWdhdGl2ZSBpbnRlZ2VyJyApO1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIGhlaWdodCA9PT0gdW5kZWZpbmVkIHx8ICggdHlwZW9mIGhlaWdodCA9PT0gJ251bWJlcicgJiYgaGVpZ2h0ID49IDAgJiYgKCBoZWlnaHQgJSAxID09PSAwICkgKSxcbiAgICAgICdJZiBwcm92aWRlZCwgaGVpZ2h0IHNob3VsZCBiZSBhIG5vbi1uZWdhdGl2ZSBpbnRlZ2VyJyApO1xuXG4gICAgbGV0IHJlc3VsdDogSW1hZ2UgfCBudWxsID0gbnVsbDtcbiAgICB0aGlzLnRvRGF0YVVSTCggKCBkYXRhVVJMLCB4LCB5LCB3aWR0aCwgaGVpZ2h0ICkgPT4ge1xuICAgICAgcmVzdWx0ID0gbmV3IEltYWdlKCBkYXRhVVJMLCB7IHg6IC14LCB5OiAteSwgaW5pdGlhbFdpZHRoOiB3aWR0aCwgaW5pdGlhbEhlaWdodDogaGVpZ2h0IH0gKTtcbiAgICB9LCB4LCB5LCB3aWR0aCwgaGVpZ2h0ICk7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggcmVzdWx0LCAndG9EYXRhVVJMIGZhaWxlZCB0byByZXR1cm4gYSByZXN1bHQgc3luY2hyb25vdXNseScgKTtcbiAgICByZXR1cm4gcmVzdWx0ITtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGEgTm9kZSB0aGF0IGNvbnRhaW5zIHRoaXMgTm9kZSdzIHN1YnRyZWUncyB2aXN1YWwgZm9ybS4gVGhpcyBpcyBhbHdheXMgc3luY2hyb25vdXMsIGFuZCBzZXRzXG4gICAqIGluaXRpYWxXaWR0aC9pbml0aWFsSGVpZ2h0IHNvIHRoYXQgd2UgaGF2ZSB0aGUgYm91bmRzIGltbWVkaWF0ZWx5LiAgQW4gZXh0cmEgd3JhcHBlciBOb2RlIGlzIHByb3ZpZGVkXG4gICAqIHNvIHRoYXQgdHJhbnNmb3JtcyBjYW4gYmUgZG9uZSBpbmRlcGVuZGVudGx5LiAgVXNlIHRoaXMgbWV0aG9kIGlmIHlvdSBuZWVkIHRvIGJlIGFibGUgdG8gdHJhbnNmb3JtIHRoZSBub2RlXG4gICAqIHRoZSBzYW1lIHdheSBhcyBpZiBpdCBoYWQgbm90IGJlZW4gcmFzdGVyaXplZC5cbiAgICogQGRlcHJlY2F0ZWQgLSBVc2Ugbm9kZS5yYXN0ZXJpemVkKCkgaW5zdGVhZCwgc2hvdWxkIGJlIG1vc3RseSBlcXVpdmFsZW50XG4gICAqXG4gICAqIEBwYXJhbSBbeF0gLSBUaGUgWCBvZmZzZXQgZm9yIHdoZXJlIHRoZSB1cHBlci1sZWZ0IG9mIHRoZSBjb250ZW50IGRyYXduIGludG8gdGhlIENhbnZhc1xuICAgKiBAcGFyYW0gW3ldIC0gVGhlIFkgb2Zmc2V0IGZvciB3aGVyZSB0aGUgdXBwZXItbGVmdCBvZiB0aGUgY29udGVudCBkcmF3biBpbnRvIHRoZSBDYW52YXNcbiAgICogQHBhcmFtIFt3aWR0aF0gLSBUaGUgd2lkdGggb2YgdGhlIENhbnZhcyBvdXRwdXRcbiAgICogQHBhcmFtIFtoZWlnaHRdIC0gVGhlIGhlaWdodCBvZiB0aGUgQ2FudmFzIG91dHB1dFxuICAgKi9cbiAgcHVibGljIHRvRGF0YVVSTE5vZGVTeW5jaHJvbm91cyggeD86IG51bWJlciwgeT86IG51bWJlciwgd2lkdGg/OiBudW1iZXIsIGhlaWdodD86IG51bWJlciApOiBOb2RlIHtcblxuICAgIGFzc2VydCAmJiBkZXByZWNhdGlvbldhcm5pbmcoICdOb2RlLnRvRGF0YVVSTE5vZGVTeW5jaHJvbm91cygpIGlzIGRlcHJlY2F0ZWQsIHBsZWFzZSB1c2UgTm9kZS5yYXN0ZXJpemVkKCkgaW5zdGVhZCcgKTtcblxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHggPT09IHVuZGVmaW5lZCB8fCB0eXBlb2YgeCA9PT0gJ251bWJlcicsICdJZiBwcm92aWRlZCwgeCBzaG91bGQgYmUgYSBudW1iZXInICk7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggeSA9PT0gdW5kZWZpbmVkIHx8IHR5cGVvZiB5ID09PSAnbnVtYmVyJywgJ0lmIHByb3ZpZGVkLCB5IHNob3VsZCBiZSBhIG51bWJlcicgKTtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB3aWR0aCA9PT0gdW5kZWZpbmVkIHx8ICggdHlwZW9mIHdpZHRoID09PSAnbnVtYmVyJyAmJiB3aWR0aCA+PSAwICYmICggd2lkdGggJSAxID09PSAwICkgKSxcbiAgICAgICdJZiBwcm92aWRlZCwgd2lkdGggc2hvdWxkIGJlIGEgbm9uLW5lZ2F0aXZlIGludGVnZXInICk7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggaGVpZ2h0ID09PSB1bmRlZmluZWQgfHwgKCB0eXBlb2YgaGVpZ2h0ID09PSAnbnVtYmVyJyAmJiBoZWlnaHQgPj0gMCAmJiAoIGhlaWdodCAlIDEgPT09IDAgKSApLFxuICAgICAgJ0lmIHByb3ZpZGVkLCBoZWlnaHQgc2hvdWxkIGJlIGEgbm9uLW5lZ2F0aXZlIGludGVnZXInICk7XG5cbiAgICByZXR1cm4gbmV3IE5vZGUoIHtcbiAgICAgIGNoaWxkcmVuOiBbXG4gICAgICAgIHRoaXMudG9EYXRhVVJMSW1hZ2VTeW5jaHJvbm91cyggeCwgeSwgd2lkdGgsIGhlaWdodCApXG4gICAgICBdXG4gICAgfSApO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgYSBOb2RlIChiYWNrZWQgYnkgYSBzY2VuZXJ5IEltYWdlKSB0aGF0IGlzIGEgcmFzdGVyaXplZCB2ZXJzaW9uIG9mIHRoaXMgbm9kZS4gU2VlIG9wdGlvbnMsIGJ5IGRlZmF1bHQgdGhlXG4gICAqIGltYWdlIGlzIHdyYXBwZWQgd2l0aCBhIGNvbnRhaW5lciBOb2RlLlxuICAgKi9cbiAgcHVibGljIHJhc3Rlcml6ZWQoIHByb3ZpZGVkT3B0aW9ucz86IFJhc3Rlcml6ZWRPcHRpb25zICk6IE5vZGUge1xuICAgIGNvbnN0IG9wdGlvbnMgPSBvcHRpb25pemU8UmFzdGVyaXplZE9wdGlvbnMsIFJhc3Rlcml6ZWRPcHRpb25zPigpKCB7XG4gICAgICByZXNvbHV0aW9uOiAxLFxuICAgICAgc291cmNlQm91bmRzOiBudWxsLFxuICAgICAgdXNlVGFyZ2V0Qm91bmRzOiB0cnVlLFxuICAgICAgd3JhcDogdHJ1ZSxcbiAgICAgIHVzZUNhbnZhczogZmFsc2UsXG4gICAgICBub2RlT3B0aW9uczoge30sXG4gICAgICBpbWFnZU9wdGlvbnM6IHt9XG4gICAgfSwgcHJvdmlkZWRPcHRpb25zICk7XG5cbiAgICBjb25zdCByZXNvbHV0aW9uID0gb3B0aW9ucy5yZXNvbHV0aW9uO1xuICAgIGNvbnN0IHNvdXJjZUJvdW5kcyA9IG9wdGlvbnMuc291cmNlQm91bmRzO1xuXG4gICAgaWYgKCBhc3NlcnQgKSB7XG4gICAgICBhc3NlcnQoIHR5cGVvZiByZXNvbHV0aW9uID09PSAnbnVtYmVyJyAmJiByZXNvbHV0aW9uID4gMCwgJ3Jlc29sdXRpb24gc2hvdWxkIGJlIGEgcG9zaXRpdmUgbnVtYmVyJyApO1xuICAgICAgYXNzZXJ0KCBzb3VyY2VCb3VuZHMgPT09IG51bGwgfHwgc291cmNlQm91bmRzIGluc3RhbmNlb2YgQm91bmRzMiwgJ3NvdXJjZUJvdW5kcyBzaG91bGQgYmUgbnVsbCBvciBhIEJvdW5kczInICk7XG4gICAgICBpZiAoIHNvdXJjZUJvdW5kcyApIHtcbiAgICAgICAgYXNzZXJ0KCBzb3VyY2VCb3VuZHMuaXNWYWxpZCgpLCAnc291cmNlQm91bmRzIHNob3VsZCBiZSB2YWxpZCAoZmluaXRlIG5vbi1uZWdhdGl2ZSknICk7XG4gICAgICAgIGFzc2VydCggTnVtYmVyLmlzSW50ZWdlciggc291cmNlQm91bmRzLndpZHRoICksICdzb3VyY2VCb3VuZHMud2lkdGggc2hvdWxkIGJlIGFuIGludGVnZXInICk7XG4gICAgICAgIGFzc2VydCggTnVtYmVyLmlzSW50ZWdlciggc291cmNlQm91bmRzLmhlaWdodCApLCAnc291cmNlQm91bmRzLmhlaWdodCBzaG91bGQgYmUgYW4gaW50ZWdlcicgKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBXZSdsbCBuZWVkIHRvIHdyYXAgaXQgaW4gYSBjb250YWluZXIgTm9kZSB0ZW1wb3JhcmlseSAod2hpbGUgcmFzdGVyaXppbmcpIGZvciB0aGUgc2NhbGVcbiAgICBjb25zdCB0ZW1wV3JhcHBlck5vZGUgPSBuZXcgTm9kZSgge1xuICAgICAgc2NhbGU6IHJlc29sdXRpb24sXG4gICAgICBjaGlsZHJlbjogWyB0aGlzIF1cbiAgICB9ICk7XG5cbiAgICBsZXQgdHJhbnNmb3JtZWRCb3VuZHMgPSBzb3VyY2VCb3VuZHMgfHwgdGhpcy5nZXRTYWZlVHJhbnNmb3JtZWRWaXNpYmxlQm91bmRzKCkuZGlsYXRlZCggMiApLnJvdW5kZWRPdXQoKTtcblxuICAgIC8vIFVuZm9ydHVuYXRlbHkgaWYgd2UgcHJvdmlkZSBhIHJlc29sdXRpb24gQU5EIGJvdW5kcywgd2UgY2FuJ3QgdXNlIHRoZSBzb3VyY2UgYm91bmRzIGRpcmVjdGx5LlxuICAgIGlmICggcmVzb2x1dGlvbiAhPT0gMSApIHtcbiAgICAgIHRyYW5zZm9ybWVkQm91bmRzID0gbmV3IEJvdW5kczIoXG4gICAgICAgIHJlc29sdXRpb24gKiB0cmFuc2Zvcm1lZEJvdW5kcy5taW5YLFxuICAgICAgICByZXNvbHV0aW9uICogdHJhbnNmb3JtZWRCb3VuZHMubWluWSxcbiAgICAgICAgcmVzb2x1dGlvbiAqIHRyYW5zZm9ybWVkQm91bmRzLm1heFgsXG4gICAgICAgIHJlc29sdXRpb24gKiB0cmFuc2Zvcm1lZEJvdW5kcy5tYXhZXG4gICAgICApO1xuICAgICAgLy8gQ29tcGVuc2F0ZSBmb3Igbm9uLWludGVncmFsIHRyYW5zZm9ybWVkQm91bmRzIGFmdGVyIG91ciByZXNvbHV0aW9uIHRyYW5zZm9ybVxuICAgICAgaWYgKCB0cmFuc2Zvcm1lZEJvdW5kcy53aWR0aCAlIDEgIT09IDAgKSB7XG4gICAgICAgIHRyYW5zZm9ybWVkQm91bmRzLm1heFggKz0gMSAtICggdHJhbnNmb3JtZWRCb3VuZHMud2lkdGggJSAxICk7XG4gICAgICB9XG4gICAgICBpZiAoIHRyYW5zZm9ybWVkQm91bmRzLmhlaWdodCAlIDEgIT09IDAgKSB7XG4gICAgICAgIHRyYW5zZm9ybWVkQm91bmRzLm1heFkgKz0gMSAtICggdHJhbnNmb3JtZWRCb3VuZHMuaGVpZ2h0ICUgMSApO1xuICAgICAgfVxuICAgIH1cblxuICAgIGxldCBpbWFnZU9yTnVsbDogSW1hZ2UgfCBudWxsID0gbnVsbDtcblxuICAgIC8vIE5PVEU6IFRoaXMgY2FsbGJhY2sgaXMgZXhlY3V0ZWQgU1lOQ0hST05PVVNMWVxuICAgIGZ1bmN0aW9uIGNhbGxiYWNrKCBjYW52YXM6IEhUTUxDYW52YXNFbGVtZW50LCB4OiBudW1iZXIsIHk6IG51bWJlciwgd2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXIgKTogdm9pZCB7XG4gICAgICBjb25zdCBpbWFnZVNvdXJjZSA9IG9wdGlvbnMudXNlQ2FudmFzID8gY2FudmFzIDogY2FudmFzLnRvRGF0YVVSTCgpO1xuXG4gICAgICBpbWFnZU9yTnVsbCA9IG5ldyBJbWFnZSggaW1hZ2VTb3VyY2UsIGNvbWJpbmVPcHRpb25zPEltYWdlT3B0aW9ucz4oIHt9LCBvcHRpb25zLmltYWdlT3B0aW9ucywge1xuICAgICAgICB4OiAteCxcbiAgICAgICAgeTogLXksXG4gICAgICAgIGluaXRpYWxXaWR0aDogd2lkdGgsXG4gICAgICAgIGluaXRpYWxIZWlnaHQ6IGhlaWdodFxuICAgICAgfSApICk7XG5cbiAgICAgIC8vIFdlIG5lZWQgdG8gcHJlcGVuZCB0aGUgc2NhbGUgZHVlIHRvIG9yZGVyIG9mIG9wZXJhdGlvbnNcbiAgICAgIGltYWdlT3JOdWxsLnNjYWxlKCAxIC8gcmVzb2x1dGlvbiwgMSAvIHJlc29sdXRpb24sIHRydWUgKTtcbiAgICB9XG5cbiAgICAvLyBOT1RFOiBSb3VuZGluZyBuZWNlc3NhcnkgZHVlIHRvIGZsb2F0aW5nIHBvaW50IGFyaXRobWV0aWMgaW4gdGhlIHdpZHRoL2hlaWdodCBjb21wdXRhdGlvbiBvZiB0aGUgYm91bmRzXG4gICAgdGVtcFdyYXBwZXJOb2RlLnRvQ2FudmFzKCBjYWxsYmFjaywgLXRyYW5zZm9ybWVkQm91bmRzLm1pblgsIC10cmFuc2Zvcm1lZEJvdW5kcy5taW5ZLCBVdGlscy5yb3VuZFN5bW1ldHJpYyggdHJhbnNmb3JtZWRCb3VuZHMud2lkdGggKSwgVXRpbHMucm91bmRTeW1tZXRyaWMoIHRyYW5zZm9ybWVkQm91bmRzLmhlaWdodCApICk7XG5cbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBpbWFnZU9yTnVsbCwgJ1RoZSB0b0NhbnZhcyBzaG91bGQgaGF2ZSBleGVjdXRlZCBzeW5jaHJvbm91c2x5JyApO1xuICAgIGNvbnN0IGltYWdlID0gaW1hZ2VPck51bGwhO1xuXG4gICAgdGVtcFdyYXBwZXJOb2RlLmRpc3Bvc2UoKTtcblxuICAgIC8vIEZvciBvdXIgdXNlVGFyZ2V0Qm91bmRzIG9wdGlvbiwgd2UgZG8gTk9UIHdhbnQgdG8gaW5jbHVkZSBhbnkgXCJzYWZlXCIgYm91bmRzLCBhbmQgaW5zdGVhZCB3YW50IHRvIHN0YXkgdHJ1ZSB0b1xuICAgIC8vIHRoZSBvcmlnaW5hbCBib3VuZHMuIFdlIGRvIGZpbHRlciBvdXQgaW52aXNpYmxlIHN1YnRyZWVzIHRvIHNldCB0aGUgYm91bmRzLlxuICAgIGxldCBmaW5hbFBhcmVudEJvdW5kcyA9IHRoaXMuZ2V0VmlzaWJsZUJvdW5kcygpO1xuICAgIGlmICggc291cmNlQm91bmRzICkge1xuICAgICAgLy8gSWYgd2UgcHJvdmlkZSBzb3VyY2VCb3VuZHMsIGRvbid0IGhhdmUgcmVzdWx0aW5nIGJvdW5kcyB0aGF0IGdvIG91dHNpZGUuXG4gICAgICBmaW5hbFBhcmVudEJvdW5kcyA9IHNvdXJjZUJvdW5kcy5pbnRlcnNlY3Rpb24oIGZpbmFsUGFyZW50Qm91bmRzICk7XG4gICAgfVxuXG4gICAgaWYgKCBvcHRpb25zLnVzZVRhcmdldEJvdW5kcyApIHtcbiAgICAgIGltYWdlLmltYWdlQm91bmRzID0gaW1hZ2UucGFyZW50VG9Mb2NhbEJvdW5kcyggZmluYWxQYXJlbnRCb3VuZHMgKTtcbiAgICB9XG5cbiAgICBsZXQgcmV0dXJuTm9kZTogTm9kZTtcbiAgICBpZiAoIG9wdGlvbnMud3JhcCApIHtcbiAgICAgIGNvbnN0IHdyYXBwZWROb2RlID0gbmV3IE5vZGUoIHsgY2hpbGRyZW46IFsgaW1hZ2UgXSB9ICk7XG4gICAgICBpZiAoIG9wdGlvbnMudXNlVGFyZ2V0Qm91bmRzICkge1xuICAgICAgICB3cmFwcGVkTm9kZS5sb2NhbEJvdW5kcyA9IGZpbmFsUGFyZW50Qm91bmRzO1xuICAgICAgfVxuICAgICAgcmV0dXJuTm9kZSA9IHdyYXBwZWROb2RlO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIGlmICggb3B0aW9ucy51c2VUYXJnZXRCb3VuZHMgKSB7XG4gICAgICAgIGltYWdlLmxvY2FsQm91bmRzID0gaW1hZ2UucGFyZW50VG9Mb2NhbEJvdW5kcyggZmluYWxQYXJlbnRCb3VuZHMgKTtcbiAgICAgIH1cbiAgICAgIHJldHVybk5vZGUgPSBpbWFnZTtcbiAgICB9XG5cbiAgICByZXR1cm4gcmV0dXJuTm9kZS5tdXRhdGUoIG9wdGlvbnMubm9kZU9wdGlvbnMgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDcmVhdGVzIGEgRE9NIGRyYXdhYmxlIGZvciB0aGlzIE5vZGUncyBzZWxmIHJlcHJlc2VudGF0aW9uLiAoc2NlbmVyeS1pbnRlcm5hbClcbiAgICpcbiAgICogSW1wbGVtZW50ZWQgYnkgc3VidHlwZXMgdGhhdCBzdXBwb3J0IERPTSBzZWxmIGRyYXdhYmxlcy4gVGhlcmUgaXMgbm8gbmVlZCB0byBpbXBsZW1lbnQgdGhpcyBmb3Igc3VidHlwZXMgdGhhdFxuICAgKiBkbyBub3QgYWxsb3cgdGhlIERPTSByZW5kZXJlciAobm90IHNldCBpbiBpdHMgcmVuZGVyZXJCaXRtYXNrKS5cbiAgICpcbiAgICogQHBhcmFtIHJlbmRlcmVyIC0gSW4gdGhlIGJpdG1hc2sgZm9ybWF0IHNwZWNpZmllZCBieSBSZW5kZXJlciwgd2hpY2ggbWF5IGNvbnRhaW4gYWRkaXRpb25hbCBiaXQgZmxhZ3MuXG4gICAqIEBwYXJhbSBpbnN0YW5jZSAtIEluc3RhbmNlIG9iamVjdCB0aGF0IHdpbGwgYmUgYXNzb2NpYXRlZCB3aXRoIHRoZSBkcmF3YWJsZVxuICAgKi9cbiAgcHVibGljIGNyZWF0ZURPTURyYXdhYmxlKCByZW5kZXJlcjogbnVtYmVyLCBpbnN0YW5jZTogSW5zdGFuY2UgKTogRE9NU2VsZkRyYXdhYmxlIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoICdjcmVhdGVET01EcmF3YWJsZSBpcyBhYnN0cmFjdC4gVGhlIHN1YnR5cGUgc2hvdWxkIGVpdGhlciBvdmVycmlkZSB0aGlzIG1ldGhvZCwgb3Igbm90IHN1cHBvcnQgdGhlIERPTSByZW5kZXJlcicgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDcmVhdGVzIGFuIFNWRyBkcmF3YWJsZSBmb3IgdGhpcyBOb2RlJ3Mgc2VsZiByZXByZXNlbnRhdGlvbi4gKHNjZW5lcnktaW50ZXJuYWwpXG4gICAqXG4gICAqIEltcGxlbWVudGVkIGJ5IHN1YnR5cGVzIHRoYXQgc3VwcG9ydCBTVkcgc2VsZiBkcmF3YWJsZXMuIFRoZXJlIGlzIG5vIG5lZWQgdG8gaW1wbGVtZW50IHRoaXMgZm9yIHN1YnR5cGVzIHRoYXRcbiAgICogZG8gbm90IGFsbG93IHRoZSBTVkcgcmVuZGVyZXIgKG5vdCBzZXQgaW4gaXRzIHJlbmRlcmVyQml0bWFzaykuXG4gICAqXG4gICAqIEBwYXJhbSByZW5kZXJlciAtIEluIHRoZSBiaXRtYXNrIGZvcm1hdCBzcGVjaWZpZWQgYnkgUmVuZGVyZXIsIHdoaWNoIG1heSBjb250YWluIGFkZGl0aW9uYWwgYml0IGZsYWdzLlxuICAgKiBAcGFyYW0gaW5zdGFuY2UgLSBJbnN0YW5jZSBvYmplY3QgdGhhdCB3aWxsIGJlIGFzc29jaWF0ZWQgd2l0aCB0aGUgZHJhd2FibGVcbiAgICovXG4gIHB1YmxpYyBjcmVhdGVTVkdEcmF3YWJsZSggcmVuZGVyZXI6IG51bWJlciwgaW5zdGFuY2U6IEluc3RhbmNlICk6IFNWR1NlbGZEcmF3YWJsZSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCAnY3JlYXRlU1ZHRHJhd2FibGUgaXMgYWJzdHJhY3QuIFRoZSBzdWJ0eXBlIHNob3VsZCBlaXRoZXIgb3ZlcnJpZGUgdGhpcyBtZXRob2QsIG9yIG5vdCBzdXBwb3J0IHRoZSBET00gcmVuZGVyZXInICk7XG4gIH1cblxuICAvKipcbiAgICogQ3JlYXRlcyBhIENhbnZhcyBkcmF3YWJsZSBmb3IgdGhpcyBOb2RlJ3Mgc2VsZiByZXByZXNlbnRhdGlvbi4gKHNjZW5lcnktaW50ZXJuYWwpXG4gICAqXG4gICAqIEltcGxlbWVudGVkIGJ5IHN1YnR5cGVzIHRoYXQgc3VwcG9ydCBDYW52YXMgc2VsZiBkcmF3YWJsZXMuIFRoZXJlIGlzIG5vIG5lZWQgdG8gaW1wbGVtZW50IHRoaXMgZm9yIHN1YnR5cGVzIHRoYXRcbiAgICogZG8gbm90IGFsbG93IHRoZSBDYW52YXMgcmVuZGVyZXIgKG5vdCBzZXQgaW4gaXRzIHJlbmRlcmVyQml0bWFzaykuXG4gICAqXG4gICAqIEBwYXJhbSByZW5kZXJlciAtIEluIHRoZSBiaXRtYXNrIGZvcm1hdCBzcGVjaWZpZWQgYnkgUmVuZGVyZXIsIHdoaWNoIG1heSBjb250YWluIGFkZGl0aW9uYWwgYml0IGZsYWdzLlxuICAgKiBAcGFyYW0gaW5zdGFuY2UgLSBJbnN0YW5jZSBvYmplY3QgdGhhdCB3aWxsIGJlIGFzc29jaWF0ZWQgd2l0aCB0aGUgZHJhd2FibGVcbiAgICovXG4gIHB1YmxpYyBjcmVhdGVDYW52YXNEcmF3YWJsZSggcmVuZGVyZXI6IG51bWJlciwgaW5zdGFuY2U6IEluc3RhbmNlICk6IENhbnZhc1NlbGZEcmF3YWJsZSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCAnY3JlYXRlQ2FudmFzRHJhd2FibGUgaXMgYWJzdHJhY3QuIFRoZSBzdWJ0eXBlIHNob3VsZCBlaXRoZXIgb3ZlcnJpZGUgdGhpcyBtZXRob2QsIG9yIG5vdCBzdXBwb3J0IHRoZSBET00gcmVuZGVyZXInICk7XG4gIH1cblxuICAvKipcbiAgICogQ3JlYXRlcyBhIFdlYkdMIGRyYXdhYmxlIGZvciB0aGlzIE5vZGUncyBzZWxmIHJlcHJlc2VudGF0aW9uLiAoc2NlbmVyeS1pbnRlcm5hbClcbiAgICpcbiAgICogSW1wbGVtZW50ZWQgYnkgc3VidHlwZXMgdGhhdCBzdXBwb3J0IFdlYkdMIHNlbGYgZHJhd2FibGVzLiBUaGVyZSBpcyBubyBuZWVkIHRvIGltcGxlbWVudCB0aGlzIGZvciBzdWJ0eXBlcyB0aGF0XG4gICAqIGRvIG5vdCBhbGxvdyB0aGUgV2ViR0wgcmVuZGVyZXIgKG5vdCBzZXQgaW4gaXRzIHJlbmRlcmVyQml0bWFzaykuXG4gICAqXG4gICAqIEBwYXJhbSByZW5kZXJlciAtIEluIHRoZSBiaXRtYXNrIGZvcm1hdCBzcGVjaWZpZWQgYnkgUmVuZGVyZXIsIHdoaWNoIG1heSBjb250YWluIGFkZGl0aW9uYWwgYml0IGZsYWdzLlxuICAgKiBAcGFyYW0gaW5zdGFuY2UgLSBJbnN0YW5jZSBvYmplY3QgdGhhdCB3aWxsIGJlIGFzc29jaWF0ZWQgd2l0aCB0aGUgZHJhd2FibGVcbiAgICovXG4gIHB1YmxpYyBjcmVhdGVXZWJHTERyYXdhYmxlKCByZW5kZXJlcjogbnVtYmVyLCBpbnN0YW5jZTogSW5zdGFuY2UgKTogV2ViR0xTZWxmRHJhd2FibGUge1xuICAgIHRocm93IG5ldyBFcnJvciggJ2NyZWF0ZVdlYkdMRHJhd2FibGUgaXMgYWJzdHJhY3QuIFRoZSBzdWJ0eXBlIHNob3VsZCBlaXRoZXIgb3ZlcnJpZGUgdGhpcyBtZXRob2QsIG9yIG5vdCBzdXBwb3J0IHRoZSBET00gcmVuZGVyZXInICk7XG4gIH1cblxuICAvKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSpcbiAgICogSW5zdGFuY2UgaGFuZGxpbmdcbiAgICotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cblxuICAvKipcbiAgICogUmV0dXJucyBhIHJlZmVyZW5jZSB0byB0aGUgaW5zdGFuY2VzIGFycmF5LiAoc2NlbmVyeS1pbnRlcm5hbClcbiAgICovXG4gIHB1YmxpYyBnZXRJbnN0YW5jZXMoKTogSW5zdGFuY2VbXSB7XG4gICAgcmV0dXJuIHRoaXMuX2luc3RhbmNlcztcbiAgfVxuXG4gIC8qKlxuICAgKiBTZWUgZ2V0SW5zdGFuY2VzKCkgZm9yIG1vcmUgaW5mb3JtYXRpb24gKHNjZW5lcnktaW50ZXJuYWwpXG4gICAqL1xuICBwdWJsaWMgZ2V0IGluc3RhbmNlcygpOiBJbnN0YW5jZVtdIHtcbiAgICByZXR1cm4gdGhpcy5nZXRJbnN0YW5jZXMoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBZGRzIGFuIEluc3RhbmNlIHJlZmVyZW5jZSB0byBvdXIgYXJyYXkuIChzY2VuZXJ5LWludGVybmFsKVxuICAgKi9cbiAgcHVibGljIGFkZEluc3RhbmNlKCBpbnN0YW5jZTogSW5zdGFuY2UgKTogdm9pZCB7XG4gICAgdGhpcy5faW5zdGFuY2VzLnB1c2goIGluc3RhbmNlICk7XG5cbiAgICB0aGlzLmNoYW5nZWRJbnN0YW5jZUVtaXR0ZXIuZW1pdCggaW5zdGFuY2UsIHRydWUgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZW1vdmVzIGFuIEluc3RhbmNlIHJlZmVyZW5jZSBmcm9tIG91ciBhcnJheS4gKHNjZW5lcnktaW50ZXJuYWwpXG4gICAqL1xuICBwdWJsaWMgcmVtb3ZlSW5zdGFuY2UoIGluc3RhbmNlOiBJbnN0YW5jZSApOiB2b2lkIHtcbiAgICBjb25zdCBpbmRleCA9IF8uaW5kZXhPZiggdGhpcy5faW5zdGFuY2VzLCBpbnN0YW5jZSApO1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIGluZGV4ICE9PSAtMSwgJ0Nhbm5vdCByZW1vdmUgYSBJbnN0YW5jZSBmcm9tIGEgTm9kZSBpZiBpdCB3YXMgbm90IHRoZXJlJyApO1xuICAgIHRoaXMuX2luc3RhbmNlcy5zcGxpY2UoIGluZGV4LCAxICk7XG5cbiAgICB0aGlzLmNoYW5nZWRJbnN0YW5jZUVtaXR0ZXIuZW1pdCggaW5zdGFuY2UsIGZhbHNlICk7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB3aGV0aGVyIHRoaXMgTm9kZSB3YXMgdmlzdWFsbHkgcmVuZGVyZWQvZGlzcGxheWVkIGJ5IGFueSBEaXNwbGF5IGluIHRoZSBsYXN0IHVwZGF0ZURpc3BsYXkoKSBjYWxsLiBOb3RlXG4gICAqIHRoYXQgc29tZXRoaW5nIGNhbiBiZSBpbmRlcGVuZGVudGx5IGRpc3BsYXllZCB2aXN1YWxseSwgYW5kIGluIHRoZSBQRE9NOyB0aGlzIG1ldGhvZCBvbmx5IGNoZWNrcyB2aXN1YWxseS5cbiAgICpcbiAgICogQHBhcmFtIFtkaXNwbGF5XSAtIGlmIHByb3ZpZGVkLCBvbmx5IGNoZWNrIGlmIHdhcyB2aXNpYmxlIG9uIHRoaXMgcGFydGljdWxhciBEaXNwbGF5XG4gICAqL1xuICBwdWJsaWMgd2FzVmlzdWFsbHlEaXNwbGF5ZWQoIGRpc3BsYXk/OiBEaXNwbGF5ICk6IGJvb2xlYW4ge1xuICAgIGZvciAoIGxldCBpID0gMDsgaSA8IHRoaXMuX2luc3RhbmNlcy5sZW5ndGg7IGkrKyApIHtcbiAgICAgIGNvbnN0IGluc3RhbmNlID0gdGhpcy5faW5zdGFuY2VzWyBpIF07XG5cbiAgICAgIC8vIElmIG5vIGRpc3BsYXkgaXMgcHJvdmlkZWQsIGFueSBpbnN0YW5jZSB2aXNpYmlsaXR5IGlzIGVub3VnaCB0byBiZSB2aXN1YWxseSBkaXNwbGF5ZWRcbiAgICAgIGlmICggaW5zdGFuY2UudmlzaWJsZSAmJiAoICFkaXNwbGF5IHx8IGluc3RhbmNlLmRpc3BsYXkgPT09IGRpc3BsYXkgKSApIHtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIC8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKlxuICAgKiBEaXNwbGF5IGhhbmRsaW5nXG4gICAqLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXG5cbiAgLyoqXG4gICAqIFJldHVybnMgYSByZWZlcmVuY2UgdG8gdGhlIGRpc3BsYXkgYXJyYXkuIChzY2VuZXJ5LWludGVybmFsKVxuICAgKi9cbiAgcHVibGljIGdldFJvb3RlZERpc3BsYXlzKCk6IERpc3BsYXlbXSB7XG4gICAgcmV0dXJuIHRoaXMuX3Jvb3RlZERpc3BsYXlzO1xuICB9XG5cbiAgLyoqXG4gICAqIFNlZSBnZXRSb290ZWREaXNwbGF5cygpIGZvciBtb3JlIGluZm9ybWF0aW9uIChzY2VuZXJ5LWludGVybmFsKVxuICAgKi9cbiAgcHVibGljIGdldCByb290ZWREaXNwbGF5cygpOiBEaXNwbGF5W10ge1xuICAgIHJldHVybiB0aGlzLmdldFJvb3RlZERpc3BsYXlzKCk7XG4gIH1cblxuICAvKipcbiAgICogQWRkcyBhbiBkaXNwbGF5IHJlZmVyZW5jZSB0byBvdXIgYXJyYXkuIChzY2VuZXJ5LWludGVybmFsKVxuICAgKi9cbiAgcHVibGljIGFkZFJvb3RlZERpc3BsYXkoIGRpc3BsYXk6IERpc3BsYXkgKTogdm9pZCB7XG4gICAgdGhpcy5fcm9vdGVkRGlzcGxheXMucHVzaCggZGlzcGxheSApO1xuXG4gICAgLy8gRGVmaW5lZCBpbiBQYXJhbGxlbERPTS5qc1xuICAgIHRoaXMuX3Bkb21EaXNwbGF5c0luZm8ub25BZGRlZFJvb3RlZERpc3BsYXkoIGRpc3BsYXkgKTtcblxuICAgIHRoaXMucm9vdGVkRGlzcGxheUNoYW5nZWRFbWl0dGVyLmVtaXQoIGRpc3BsYXkgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZW1vdmVzIGEgRGlzcGxheSByZWZlcmVuY2UgZnJvbSBvdXIgYXJyYXkuIChzY2VuZXJ5LWludGVybmFsKVxuICAgKi9cbiAgcHVibGljIHJlbW92ZVJvb3RlZERpc3BsYXkoIGRpc3BsYXk6IERpc3BsYXkgKTogdm9pZCB7XG4gICAgY29uc3QgaW5kZXggPSBfLmluZGV4T2YoIHRoaXMuX3Jvb3RlZERpc3BsYXlzLCBkaXNwbGF5ICk7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggaW5kZXggIT09IC0xLCAnQ2Fubm90IHJlbW92ZSBhIERpc3BsYXkgZnJvbSBhIE5vZGUgaWYgaXQgd2FzIG5vdCB0aGVyZScgKTtcbiAgICB0aGlzLl9yb290ZWREaXNwbGF5cy5zcGxpY2UoIGluZGV4LCAxICk7XG5cbiAgICAvLyBEZWZpbmVkIGluIFBhcmFsbGVsRE9NLmpzXG4gICAgdGhpcy5fcGRvbURpc3BsYXlzSW5mby5vblJlbW92ZWRSb290ZWREaXNwbGF5KCBkaXNwbGF5ICk7XG5cbiAgICB0aGlzLnJvb3RlZERpc3BsYXlDaGFuZ2VkRW1pdHRlci5lbWl0KCBkaXNwbGF5ICk7XG4gIH1cblxuICBwcml2YXRlIGdldFJlY3Vyc2l2ZUNvbm5lY3RlZERpc3BsYXlzKCBkaXNwbGF5czogRGlzcGxheVtdICk6IERpc3BsYXlbXSB7XG4gICAgaWYgKCB0aGlzLnJvb3RlZERpc3BsYXlzLmxlbmd0aCApIHtcbiAgICAgIGRpc3BsYXlzLnB1c2goIC4uLnRoaXMucm9vdGVkRGlzcGxheXMgKTtcbiAgICB9XG5cbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCB0aGlzLl9wYXJlbnRzLmxlbmd0aDsgaSsrICkge1xuICAgICAgZGlzcGxheXMucHVzaCggLi4udGhpcy5fcGFyZW50c1sgaSBdLmdldFJlY3Vyc2l2ZUNvbm5lY3RlZERpc3BsYXlzKCBkaXNwbGF5cyApICk7XG4gICAgfVxuXG4gICAgLy8gZG8gbm90IGFsbG93IGR1cGxpY2F0ZSBEaXNwbGF5cyB0byBnZXQgY29sbGVjdGVkIGluZmluaXRlbHlcbiAgICByZXR1cm4gXy51bmlxKCBkaXNwbGF5cyApO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldCBhIGxpc3Qgb2YgdGhlIGRpc3BsYXlzIHRoYXQgYXJlIGNvbm5lY3RlZCB0byB0aGlzIE5vZGUuIEdhdGhlcmVkIGJ5IGxvb2tpbmcgdXAgdGhlIHNjZW5lIGdyYXBoIGFuY2VzdG9ycyBhbmRcbiAgICogY29sbGVjdGVkIGFsbCByb290ZWQgRGlzcGxheXMgYWxvbmcgdGhlIHdheS5cbiAgICovXG4gIHB1YmxpYyBnZXRDb25uZWN0ZWREaXNwbGF5cygpOiBEaXNwbGF5W10ge1xuICAgIHJldHVybiBfLnVuaXEoIHRoaXMuZ2V0UmVjdXJzaXZlQ29ubmVjdGVkRGlzcGxheXMoIFtdICkgKTtcbiAgfVxuXG4gIC8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKlxuICAgKiBDb29yZGluYXRlIHRyYW5zZm9ybSBtZXRob2RzXG4gICAqLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXG5cbiAgLyoqXG4gICAqIFJldHVybnMgYSBwb2ludCB0cmFuc2Zvcm1lZCBmcm9tIG91ciBsb2NhbCBjb29yZGluYXRlIGZyYW1lIGludG8gb3VyIHBhcmVudCBjb29yZGluYXRlIGZyYW1lLiBBcHBsaWVzIG91ciBub2RlJ3NcbiAgICogdHJhbnNmb3JtIHRvIGl0LlxuICAgKi9cbiAgcHVibGljIGxvY2FsVG9QYXJlbnRQb2ludCggcG9pbnQ6IFZlY3RvcjIgKTogVmVjdG9yMiB7XG4gICAgcmV0dXJuIHRoaXMuX3RyYW5zZm9ybS50cmFuc2Zvcm1Qb3NpdGlvbjIoIHBvaW50ICk7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyBib3VuZHMgdHJhbnNmb3JtZWQgZnJvbSBvdXIgbG9jYWwgY29vcmRpbmF0ZSBmcmFtZSBpbnRvIG91ciBwYXJlbnQgY29vcmRpbmF0ZSBmcmFtZS4gSWYgaXQgaW5jbHVkZXMgYVxuICAgKiByb3RhdGlvbiwgdGhlIHJlc3VsdGluZyBib3VuZGluZyBib3ggd2lsbCBpbmNsdWRlIGV2ZXJ5IHBvaW50IHRoYXQgY291bGQgaGF2ZSBiZWVuIGluIHRoZSBvcmlnaW5hbCBib3VuZGluZyBib3hcbiAgICogKGFuZCBpdCBjYW4gYmUgZXhwYW5kZWQpLlxuICAgKi9cbiAgcHVibGljIGxvY2FsVG9QYXJlbnRCb3VuZHMoIGJvdW5kczogQm91bmRzMiApOiBCb3VuZHMyIHtcbiAgICByZXR1cm4gdGhpcy5fdHJhbnNmb3JtLnRyYW5zZm9ybUJvdW5kczIoIGJvdW5kcyApO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgYSBwb2ludCB0cmFuc2Zvcm1lZCBmcm9tIG91ciBwYXJlbnQgY29vcmRpbmF0ZSBmcmFtZSBpbnRvIG91ciBsb2NhbCBjb29yZGluYXRlIGZyYW1lLiBBcHBsaWVzIHRoZSBpbnZlcnNlXG4gICAqIG9mIG91ciBub2RlJ3MgdHJhbnNmb3JtIHRvIGl0LlxuICAgKi9cbiAgcHVibGljIHBhcmVudFRvTG9jYWxQb2ludCggcG9pbnQ6IFZlY3RvcjIgKTogVmVjdG9yMiB7XG4gICAgcmV0dXJuIHRoaXMuX3RyYW5zZm9ybS5pbnZlcnNlUG9zaXRpb24yKCBwb2ludCApO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgYm91bmRzIHRyYW5zZm9ybWVkIGZyb20gb3VyIHBhcmVudCBjb29yZGluYXRlIGZyYW1lIGludG8gb3VyIGxvY2FsIGNvb3JkaW5hdGUgZnJhbWUuIElmIGl0IGluY2x1ZGVzIGFcbiAgICogcm90YXRpb24sIHRoZSByZXN1bHRpbmcgYm91bmRpbmcgYm94IHdpbGwgaW5jbHVkZSBldmVyeSBwb2ludCB0aGF0IGNvdWxkIGhhdmUgYmVlbiBpbiB0aGUgb3JpZ2luYWwgYm91bmRpbmcgYm94XG4gICAqIChhbmQgaXQgY2FuIGJlIGV4cGFuZGVkKS5cbiAgICovXG4gIHB1YmxpYyBwYXJlbnRUb0xvY2FsQm91bmRzKCBib3VuZHM6IEJvdW5kczIgKTogQm91bmRzMiB7XG4gICAgcmV0dXJuIHRoaXMuX3RyYW5zZm9ybS5pbnZlcnNlQm91bmRzMiggYm91bmRzICk7XG4gIH1cblxuICAvKipcbiAgICogQSBtdXRhYmxlLW9wdGltaXplZCBmb3JtIG9mIGxvY2FsVG9QYXJlbnRCb3VuZHMoKSB0aGF0IHdpbGwgbW9kaWZ5IHRoZSBwcm92aWRlZCBib3VuZHMsIHRyYW5zZm9ybWluZyBpdCBmcm9tIG91clxuICAgKiBsb2NhbCBjb29yZGluYXRlIGZyYW1lIHRvIG91ciBwYXJlbnQgY29vcmRpbmF0ZSBmcmFtZS5cbiAgICogQHJldHVybnMgLSBUaGUgc2FtZSBib3VuZHMgb2JqZWN0LlxuICAgKi9cbiAgcHVibGljIHRyYW5zZm9ybUJvdW5kc0Zyb21Mb2NhbFRvUGFyZW50KCBib3VuZHM6IEJvdW5kczIgKTogQm91bmRzMiB7XG4gICAgcmV0dXJuIGJvdW5kcy50cmFuc2Zvcm0oIHRoaXMuX3RyYW5zZm9ybS5nZXRNYXRyaXgoKSApO1xuICB9XG5cbiAgLyoqXG4gICAqIEEgbXV0YWJsZS1vcHRpbWl6ZWQgZm9ybSBvZiBwYXJlbnRUb0xvY2FsQm91bmRzKCkgdGhhdCB3aWxsIG1vZGlmeSB0aGUgcHJvdmlkZWQgYm91bmRzLCB0cmFuc2Zvcm1pbmcgaXQgZnJvbSBvdXJcbiAgICogcGFyZW50IGNvb3JkaW5hdGUgZnJhbWUgdG8gb3VyIGxvY2FsIGNvb3JkaW5hdGUgZnJhbWUuXG4gICAqIEByZXR1cm5zIC0gVGhlIHNhbWUgYm91bmRzIG9iamVjdC5cbiAgICovXG4gIHB1YmxpYyB0cmFuc2Zvcm1Cb3VuZHNGcm9tUGFyZW50VG9Mb2NhbCggYm91bmRzOiBCb3VuZHMyICk6IEJvdW5kczIge1xuICAgIHJldHVybiBib3VuZHMudHJhbnNmb3JtKCB0aGlzLl90cmFuc2Zvcm0uZ2V0SW52ZXJzZSgpICk7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyBhIG5ldyBtYXRyaXggKGZyZXNoIGNvcHkpIHRoYXQgd291bGQgdHJhbnNmb3JtIHBvaW50cyBmcm9tIG91ciBsb2NhbCBjb29yZGluYXRlIGZyYW1lIHRvIHRoZSBnbG9iYWxcbiAgICogY29vcmRpbmF0ZSBmcmFtZS5cbiAgICpcbiAgICogTk9URTogSWYgdGhlcmUgYXJlIG11bHRpcGxlIGluc3RhbmNlcyBvZiB0aGlzIE5vZGUgKGUuZy4gdGhpcyBvciBvbmUgYW5jZXN0b3IgaGFzIHR3byBwYXJlbnRzKSwgaXQgd2lsbCBmYWlsXG4gICAqIHdpdGggYW4gYXNzZXJ0aW9uIChzaW5jZSB0aGUgdHJhbnNmb3JtIHdvdWxkbid0IGJlIHVuaXF1ZWx5IGRlZmluZWQpLlxuICAgKi9cbiAgcHVibGljIGdldExvY2FsVG9HbG9iYWxNYXRyaXgoKTogTWF0cml4MyB7XG4gICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby10aGlzLWFsaWFzXG4gICAgbGV0IG5vZGU6IE5vZGUgPSB0aGlzOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIGNvbnNpc3RlbnQtdGhpc1xuXG4gICAgLy8gd2UgbmVlZCB0byBhcHBseSB0aGUgdHJhbnNmb3JtYXRpb25zIGluIHRoZSByZXZlcnNlIG9yZGVyLCBzbyB3ZSB0ZW1wb3JhcmlseSBzdG9yZSB0aGVtXG4gICAgY29uc3QgbWF0cmljZXMgPSBbXTtcblxuICAgIC8vIGNvbmNhdGVuYXRpb24gbGlrZSB0aGlzIGhhcyBiZWVuIGZhc3RlciB0aGFuIGdldHRpbmcgYSB1bmlxdWUgdHJhaWwsIGdldHRpbmcgaXRzIHRyYW5zZm9ybSwgYW5kIGFwcGx5aW5nIGl0XG4gICAgd2hpbGUgKCBub2RlICkge1xuICAgICAgbWF0cmljZXMucHVzaCggbm9kZS5fdHJhbnNmb3JtLmdldE1hdHJpeCgpICk7XG4gICAgICBhc3NlcnQgJiYgYXNzZXJ0KCBub2RlLl9wYXJlbnRzWyAxIF0gPT09IHVuZGVmaW5lZCwgJ2dldExvY2FsVG9HbG9iYWxNYXRyaXggdW5hYmxlIHRvIHdvcmsgZm9yIERBRycgKTtcbiAgICAgIG5vZGUgPSBub2RlLl9wYXJlbnRzWyAwIF07XG4gICAgfVxuXG4gICAgY29uc3QgbWF0cml4ID0gTWF0cml4My5pZGVudGl0eSgpOyAvLyB3aWxsIGJlIG1vZGlmaWVkIGluIHBsYWNlXG5cbiAgICAvLyBpdGVyYXRlIGZyb20gdGhlIGJhY2sgZm9yd2FyZHMgKGZyb20gdGhlIHJvb3QgTm9kZSB0byBoZXJlKVxuICAgIGZvciAoIGxldCBpID0gbWF0cmljZXMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0gKSB7XG4gICAgICBtYXRyaXgubXVsdGlwbHlNYXRyaXgoIG1hdHJpY2VzWyBpIF0gKTtcbiAgICB9XG5cbiAgICAvLyBOT1RFOiBhbHdheXMgcmV0dXJuIGEgZnJlc2ggY29weSwgZ2V0R2xvYmFsVG9Mb2NhbE1hdHJpeCBkZXBlbmRzIG9uIGl0IHRvIG1pbmltaXplIGluc3RhbmNlIHVzYWdlIVxuICAgIHJldHVybiBtYXRyaXg7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyBhIFRyYW5zZm9ybTMgdGhhdCB3b3VsZCB0cmFuc2Zvcm0gdGhpbmdzIGZyb20gb3VyIGxvY2FsIGNvb3JkaW5hdGUgZnJhbWUgdG8gdGhlIGdsb2JhbCBjb29yZGluYXRlIGZyYW1lLlxuICAgKiBFcXVpdmFsZW50IHRvIGdldFVuaXF1ZVRyYWlsKCkuZ2V0VHJhbnNmb3JtKCksIGJ1dCBmYXN0ZXIuXG4gICAqXG4gICAqIE5PVEU6IElmIHRoZXJlIGFyZSBtdWx0aXBsZSBpbnN0YW5jZXMgb2YgdGhpcyBOb2RlIChlLmcuIHRoaXMgb3Igb25lIGFuY2VzdG9yIGhhcyB0d28gcGFyZW50cyksIGl0IHdpbGwgZmFpbFxuICAgKiB3aXRoIGFuIGFzc2VydGlvbiAoc2luY2UgdGhlIHRyYW5zZm9ybSB3b3VsZG4ndCBiZSB1bmlxdWVseSBkZWZpbmVkKS5cbiAgICovXG4gIHB1YmxpYyBnZXRVbmlxdWVUcmFuc2Zvcm0oKTogVHJhbnNmb3JtMyB7XG4gICAgcmV0dXJuIG5ldyBUcmFuc2Zvcm0zKCB0aGlzLmdldExvY2FsVG9HbG9iYWxNYXRyaXgoKSApO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgYSBuZXcgbWF0cml4IChmcmVzaCBjb3B5KSB0aGF0IHdvdWxkIHRyYW5zZm9ybSBwb2ludHMgZnJvbSB0aGUgZ2xvYmFsIGNvb3JkaW5hdGUgZnJhbWUgdG8gb3VyIGxvY2FsXG4gICAqIGNvb3JkaW5hdGUgZnJhbWUuXG4gICAqXG4gICAqIE5PVEU6IElmIHRoZXJlIGFyZSBtdWx0aXBsZSBpbnN0YW5jZXMgb2YgdGhpcyBOb2RlIChlLmcuIHRoaXMgb3Igb25lIGFuY2VzdG9yIGhhcyB0d28gcGFyZW50cyksIGl0IHdpbGwgZmFpbFxuICAgKiB3aXRoIGFuIGFzc2VydGlvbiAoc2luY2UgdGhlIHRyYW5zZm9ybSB3b3VsZG4ndCBiZSB1bmlxdWVseSBkZWZpbmVkKS5cbiAgICovXG4gIHB1YmxpYyBnZXRHbG9iYWxUb0xvY2FsTWF0cml4KCk6IE1hdHJpeDMge1xuICAgIHJldHVybiB0aGlzLmdldExvY2FsVG9HbG9iYWxNYXRyaXgoKS5pbnZlcnQoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBUcmFuc2Zvcm1zIGEgcG9pbnQgZnJvbSBvdXIgbG9jYWwgY29vcmRpbmF0ZSBmcmFtZSB0byB0aGUgZ2xvYmFsIGNvb3JkaW5hdGUgZnJhbWUuXG4gICAqXG4gICAqIE5PVEU6IElmIHRoZXJlIGFyZSBtdWx0aXBsZSBpbnN0YW5jZXMgb2YgdGhpcyBOb2RlIChlLmcuIHRoaXMgb3Igb25lIGFuY2VzdG9yIGhhcyB0d28gcGFyZW50cyksIGl0IHdpbGwgZmFpbFxuICAgKiB3aXRoIGFuIGFzc2VydGlvbiAoc2luY2UgdGhlIHRyYW5zZm9ybSB3b3VsZG4ndCBiZSB1bmlxdWVseSBkZWZpbmVkKS5cbiAgICovXG4gIHB1YmxpYyBsb2NhbFRvR2xvYmFsUG9pbnQoIHBvaW50OiBWZWN0b3IyICk6IFZlY3RvcjIge1xuXG4gICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby10aGlzLWFsaWFzXG4gICAgbGV0IG5vZGU6IE5vZGUgPSB0aGlzOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIGNvbnNpc3RlbnQtdGhpc1xuICAgIGNvbnN0IHJlc3VsdFBvaW50ID0gcG9pbnQuY29weSgpO1xuICAgIHdoaWxlICggbm9kZSApIHtcbiAgICAgIC8vIGluLXBsYWNlIG11bHRpcGxpY2F0aW9uXG4gICAgICBub2RlLl90cmFuc2Zvcm0uZ2V0TWF0cml4KCkubXVsdGlwbHlWZWN0b3IyKCByZXN1bHRQb2ludCApO1xuICAgICAgYXNzZXJ0ICYmIGFzc2VydCggbm9kZS5fcGFyZW50c1sgMSBdID09PSB1bmRlZmluZWQsICdsb2NhbFRvR2xvYmFsUG9pbnQgdW5hYmxlIHRvIHdvcmsgZm9yIERBRycgKTtcbiAgICAgIG5vZGUgPSBub2RlLl9wYXJlbnRzWyAwIF07XG4gICAgfVxuICAgIHJldHVybiByZXN1bHRQb2ludDtcbiAgfVxuXG4gIC8qKlxuICAgKiBUcmFuc2Zvcm1zIGEgcG9pbnQgZnJvbSB0aGUgZ2xvYmFsIGNvb3JkaW5hdGUgZnJhbWUgdG8gb3VyIGxvY2FsIGNvb3JkaW5hdGUgZnJhbWUuXG4gICAqXG4gICAqIE5PVEU6IElmIHRoZXJlIGFyZSBtdWx0aXBsZSBpbnN0YW5jZXMgb2YgdGhpcyBOb2RlIChlLmcuIHRoaXMgb3Igb25lIGFuY2VzdG9yIGhhcyB0d28gcGFyZW50cyksIGl0IHdpbGwgZmFpbFxuICAgKiB3aXRoIGFuIGFzc2VydGlvbiAoc2luY2UgdGhlIHRyYW5zZm9ybSB3b3VsZG4ndCBiZSB1bmlxdWVseSBkZWZpbmVkKS5cbiAgICovXG4gIHB1YmxpYyBnbG9iYWxUb0xvY2FsUG9pbnQoIHBvaW50OiBWZWN0b3IyICk6IFZlY3RvcjIge1xuXG4gICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby10aGlzLWFsaWFzXG4gICAgbGV0IG5vZGU6IE5vZGUgPSB0aGlzOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIGNvbnNpc3RlbnQtdGhpc1xuICAgIC8vIFRPRE86IHBlcmZvcm1hbmNlOiB0ZXN0IHdoZXRoZXIgaXQgaXMgZmFzdGVyIHRvIGdldCBhIHRvdGFsIHRyYW5zZm9ybSBhbmQgdGhlbiBpbnZlcnQgKHdvbid0IGNvbXB1dGUgaW5kaXZpZHVhbCBpbnZlcnNlcykgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3NjZW5lcnkvaXNzdWVzLzE1ODFcblxuICAgIC8vIHdlIG5lZWQgdG8gYXBwbHkgdGhlIHRyYW5zZm9ybWF0aW9ucyBpbiB0aGUgcmV2ZXJzZSBvcmRlciwgc28gd2UgdGVtcG9yYXJpbHkgc3RvcmUgdGhlbVxuICAgIGNvbnN0IHRyYW5zZm9ybXMgPSBbXTtcbiAgICB3aGlsZSAoIG5vZGUgKSB7XG4gICAgICB0cmFuc2Zvcm1zLnB1c2goIG5vZGUuX3RyYW5zZm9ybSApO1xuICAgICAgYXNzZXJ0ICYmIGFzc2VydCggbm9kZS5fcGFyZW50c1sgMSBdID09PSB1bmRlZmluZWQsICdnbG9iYWxUb0xvY2FsUG9pbnQgdW5hYmxlIHRvIHdvcmsgZm9yIERBRycgKTtcbiAgICAgIG5vZGUgPSBub2RlLl9wYXJlbnRzWyAwIF07XG4gICAgfVxuXG4gICAgLy8gaXRlcmF0ZSBmcm9tIHRoZSBiYWNrIGZvcndhcmRzIChmcm9tIHRoZSByb290IE5vZGUgdG8gaGVyZSlcbiAgICBjb25zdCByZXN1bHRQb2ludCA9IHBvaW50LmNvcHkoKTtcbiAgICBmb3IgKCBsZXQgaSA9IHRyYW5zZm9ybXMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0gKSB7XG4gICAgICAvLyBpbi1wbGFjZSBtdWx0aXBsaWNhdGlvblxuICAgICAgdHJhbnNmb3Jtc1sgaSBdLmdldEludmVyc2UoKS5tdWx0aXBseVZlY3RvcjIoIHJlc3VsdFBvaW50ICk7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHRQb2ludDtcbiAgfVxuXG4gIC8qKlxuICAgKiBUcmFuc2Zvcm1zIGJvdW5kcyBmcm9tIG91ciBsb2NhbCBjb29yZGluYXRlIGZyYW1lIHRvIHRoZSBnbG9iYWwgY29vcmRpbmF0ZSBmcmFtZS4gSWYgaXQgaW5jbHVkZXMgYVxuICAgKiByb3RhdGlvbiwgdGhlIHJlc3VsdGluZyBib3VuZGluZyBib3ggd2lsbCBpbmNsdWRlIGV2ZXJ5IHBvaW50IHRoYXQgY291bGQgaGF2ZSBiZWVuIGluIHRoZSBvcmlnaW5hbCBib3VuZGluZyBib3hcbiAgICogKGFuZCBpdCBjYW4gYmUgZXhwYW5kZWQpLlxuICAgKlxuICAgKiBOT1RFOiBJZiB0aGVyZSBhcmUgbXVsdGlwbGUgaW5zdGFuY2VzIG9mIHRoaXMgTm9kZSAoZS5nLiB0aGlzIG9yIG9uZSBhbmNlc3RvciBoYXMgdHdvIHBhcmVudHMpLCBpdCB3aWxsIGZhaWxcbiAgICogd2l0aCBhbiBhc3NlcnRpb24gKHNpbmNlIHRoZSB0cmFuc2Zvcm0gd291bGRuJ3QgYmUgdW5pcXVlbHkgZGVmaW5lZCkuXG4gICAqL1xuICBwdWJsaWMgbG9jYWxUb0dsb2JhbEJvdW5kcyggYm91bmRzOiBCb3VuZHMyICk6IEJvdW5kczIge1xuICAgIC8vIGFwcGx5IHRoZSBib3VuZHMgdHJhbnNmb3JtIG9ubHkgb25jZSwgc28gd2UgY2FuIG1pbmltaXplIHRoZSBleHBhbnNpb24gZW5jb3VudGVyZWQgZnJvbSBtdWx0aXBsZSByb3RhdGlvbnNcbiAgICAvLyBpdCBhbHNvIHNlZW1zIHRvIGJlIGEgYml0IGZhc3RlciB0aGlzIHdheVxuICAgIHJldHVybiBib3VuZHMudHJhbnNmb3JtZWQoIHRoaXMuZ2V0TG9jYWxUb0dsb2JhbE1hdHJpeCgpICk7XG4gIH1cblxuICAvKipcbiAgICogVHJhbnNmb3JtcyBib3VuZHMgZnJvbSB0aGUgZ2xvYmFsIGNvb3JkaW5hdGUgZnJhbWUgdG8gb3VyIGxvY2FsIGNvb3JkaW5hdGUgZnJhbWUuIElmIGl0IGluY2x1ZGVzIGFcbiAgICogcm90YXRpb24sIHRoZSByZXN1bHRpbmcgYm91bmRpbmcgYm94IHdpbGwgaW5jbHVkZSBldmVyeSBwb2ludCB0aGF0IGNvdWxkIGhhdmUgYmVlbiBpbiB0aGUgb3JpZ2luYWwgYm91bmRpbmcgYm94XG4gICAqIChhbmQgaXQgY2FuIGJlIGV4cGFuZGVkKS5cbiAgICpcbiAgICogTk9URTogSWYgdGhlcmUgYXJlIG11bHRpcGxlIGluc3RhbmNlcyBvZiB0aGlzIE5vZGUgKGUuZy4gdGhpcyBvciBvbmUgYW5jZXN0b3IgaGFzIHR3byBwYXJlbnRzKSwgaXQgd2lsbCBmYWlsXG4gICAqIHdpdGggYW4gYXNzZXJ0aW9uIChzaW5jZSB0aGUgdHJhbnNmb3JtIHdvdWxkbid0IGJlIHVuaXF1ZWx5IGRlZmluZWQpLlxuICAgKi9cbiAgcHVibGljIGdsb2JhbFRvTG9jYWxCb3VuZHMoIGJvdW5kczogQm91bmRzMiApOiBCb3VuZHMyIHtcbiAgICAvLyBhcHBseSB0aGUgYm91bmRzIHRyYW5zZm9ybSBvbmx5IG9uY2UsIHNvIHdlIGNhbiBtaW5pbWl6ZSB0aGUgZXhwYW5zaW9uIGVuY291bnRlcmVkIGZyb20gbXVsdGlwbGUgcm90YXRpb25zXG4gICAgcmV0dXJuIGJvdW5kcy50cmFuc2Zvcm1lZCggdGhpcy5nZXRHbG9iYWxUb0xvY2FsTWF0cml4KCkgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBUcmFuc2Zvcm1zIGEgcG9pbnQgZnJvbSBvdXIgcGFyZW50IGNvb3JkaW5hdGUgZnJhbWUgdG8gdGhlIGdsb2JhbCBjb29yZGluYXRlIGZyYW1lLlxuICAgKlxuICAgKiBOT1RFOiBJZiB0aGVyZSBhcmUgbXVsdGlwbGUgaW5zdGFuY2VzIG9mIHRoaXMgTm9kZSAoZS5nLiB0aGlzIG9yIG9uZSBhbmNlc3RvciBoYXMgdHdvIHBhcmVudHMpLCBpdCB3aWxsIGZhaWxcbiAgICogd2l0aCBhbiBhc3NlcnRpb24gKHNpbmNlIHRoZSB0cmFuc2Zvcm0gd291bGRuJ3QgYmUgdW5pcXVlbHkgZGVmaW5lZCkuXG4gICAqL1xuICBwdWJsaWMgcGFyZW50VG9HbG9iYWxQb2ludCggcG9pbnQ6IFZlY3RvcjIgKTogVmVjdG9yMiB7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdGhpcy5wYXJlbnRzLmxlbmd0aCA8PSAxLCAncGFyZW50VG9HbG9iYWxQb2ludCB1bmFibGUgdG8gd29yayBmb3IgREFHJyApO1xuICAgIHJldHVybiB0aGlzLnBhcmVudHMubGVuZ3RoID8gdGhpcy5wYXJlbnRzWyAwIF0ubG9jYWxUb0dsb2JhbFBvaW50KCBwb2ludCApIDogcG9pbnQ7XG4gIH1cblxuICAvKipcbiAgICogVHJhbnNmb3JtcyBib3VuZHMgZnJvbSBvdXIgcGFyZW50IGNvb3JkaW5hdGUgZnJhbWUgdG8gdGhlIGdsb2JhbCBjb29yZGluYXRlIGZyYW1lLiBJZiBpdCBpbmNsdWRlcyBhXG4gICAqIHJvdGF0aW9uLCB0aGUgcmVzdWx0aW5nIGJvdW5kaW5nIGJveCB3aWxsIGluY2x1ZGUgZXZlcnkgcG9pbnQgdGhhdCBjb3VsZCBoYXZlIGJlZW4gaW4gdGhlIG9yaWdpbmFsIGJvdW5kaW5nIGJveFxuICAgKiAoYW5kIGl0IGNhbiBiZSBleHBhbmRlZCkuXG4gICAqXG4gICAqIE5PVEU6IElmIHRoZXJlIGFyZSBtdWx0aXBsZSBpbnN0YW5jZXMgb2YgdGhpcyBOb2RlIChlLmcuIHRoaXMgb3Igb25lIGFuY2VzdG9yIGhhcyB0d28gcGFyZW50cyksIGl0IHdpbGwgZmFpbFxuICAgKiB3aXRoIGFuIGFzc2VydGlvbiAoc2luY2UgdGhlIHRyYW5zZm9ybSB3b3VsZG4ndCBiZSB1bmlxdWVseSBkZWZpbmVkKS5cbiAgICovXG4gIHB1YmxpYyBwYXJlbnRUb0dsb2JhbEJvdW5kcyggYm91bmRzOiBCb3VuZHMyICk6IEJvdW5kczIge1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIHRoaXMucGFyZW50cy5sZW5ndGggPD0gMSwgJ3BhcmVudFRvR2xvYmFsQm91bmRzIHVuYWJsZSB0byB3b3JrIGZvciBEQUcnICk7XG4gICAgcmV0dXJuIHRoaXMucGFyZW50cy5sZW5ndGggPyB0aGlzLnBhcmVudHNbIDAgXS5sb2NhbFRvR2xvYmFsQm91bmRzKCBib3VuZHMgKSA6IGJvdW5kcztcbiAgfVxuXG4gIC8qKlxuICAgKiBUcmFuc2Zvcm1zIGEgcG9pbnQgZnJvbSB0aGUgZ2xvYmFsIGNvb3JkaW5hdGUgZnJhbWUgdG8gb3VyIHBhcmVudCBjb29yZGluYXRlIGZyYW1lLlxuICAgKlxuICAgKiBOT1RFOiBJZiB0aGVyZSBhcmUgbXVsdGlwbGUgaW5zdGFuY2VzIG9mIHRoaXMgTm9kZSAoZS5nLiB0aGlzIG9yIG9uZSBhbmNlc3RvciBoYXMgdHdvIHBhcmVudHMpLCBpdCB3aWxsIGZhaWxcbiAgICogd2l0aCBhbiBhc3NlcnRpb24gKHNpbmNlIHRoZSB0cmFuc2Zvcm0gd291bGRuJ3QgYmUgdW5pcXVlbHkgZGVmaW5lZCkuXG4gICAqL1xuICBwdWJsaWMgZ2xvYmFsVG9QYXJlbnRQb2ludCggcG9pbnQ6IFZlY3RvcjIgKTogVmVjdG9yMiB7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdGhpcy5wYXJlbnRzLmxlbmd0aCA8PSAxLCAnZ2xvYmFsVG9QYXJlbnRQb2ludCB1bmFibGUgdG8gd29yayBmb3IgREFHJyApO1xuICAgIHJldHVybiB0aGlzLnBhcmVudHMubGVuZ3RoID8gdGhpcy5wYXJlbnRzWyAwIF0uZ2xvYmFsVG9Mb2NhbFBvaW50KCBwb2ludCApIDogcG9pbnQ7XG4gIH1cblxuICAvKipcbiAgICogVHJhbnNmb3JtcyBib3VuZHMgZnJvbSB0aGUgZ2xvYmFsIGNvb3JkaW5hdGUgZnJhbWUgdG8gb3VyIHBhcmVudCBjb29yZGluYXRlIGZyYW1lLiBJZiBpdCBpbmNsdWRlcyBhXG4gICAqIHJvdGF0aW9uLCB0aGUgcmVzdWx0aW5nIGJvdW5kaW5nIGJveCB3aWxsIGluY2x1ZGUgZXZlcnkgcG9pbnQgdGhhdCBjb3VsZCBoYXZlIGJlZW4gaW4gdGhlIG9yaWdpbmFsIGJvdW5kaW5nIGJveFxuICAgKiAoYW5kIGl0IGNhbiBiZSBleHBhbmRlZCkuXG4gICAqXG4gICAqIE5PVEU6IElmIHRoZXJlIGFyZSBtdWx0aXBsZSBpbnN0YW5jZXMgb2YgdGhpcyBOb2RlIChlLmcuIHRoaXMgb3Igb25lIGFuY2VzdG9yIGhhcyB0d28gcGFyZW50cyksIGl0IHdpbGwgZmFpbFxuICAgKiB3aXRoIGFuIGFzc2VydGlvbiAoc2luY2UgdGhlIHRyYW5zZm9ybSB3b3VsZG4ndCBiZSB1bmlxdWVseSBkZWZpbmVkKS5cbiAgICovXG4gIHB1YmxpYyBnbG9iYWxUb1BhcmVudEJvdW5kcyggYm91bmRzOiBCb3VuZHMyICk6IEJvdW5kczIge1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIHRoaXMucGFyZW50cy5sZW5ndGggPD0gMSwgJ2dsb2JhbFRvUGFyZW50Qm91bmRzIHVuYWJsZSB0byB3b3JrIGZvciBEQUcnICk7XG4gICAgcmV0dXJuIHRoaXMucGFyZW50cy5sZW5ndGggPyB0aGlzLnBhcmVudHNbIDAgXS5nbG9iYWxUb0xvY2FsQm91bmRzKCBib3VuZHMgKSA6IGJvdW5kcztcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGEgYm91bmRpbmcgYm94IGZvciB0aGlzIE5vZGUgKGFuZCBpdHMgc3ViLXRyZWUpIGluIHRoZSBnbG9iYWwgY29vcmRpbmF0ZSBmcmFtZS5cbiAgICpcbiAgICogTk9URTogSWYgdGhlcmUgYXJlIG11bHRpcGxlIGluc3RhbmNlcyBvZiB0aGlzIE5vZGUgKGUuZy4gdGhpcyBvciBvbmUgYW5jZXN0b3IgaGFzIHR3byBwYXJlbnRzKSwgaXQgd2lsbCBmYWlsXG4gICAqIHdpdGggYW4gYXNzZXJ0aW9uIChzaW5jZSB0aGUgdHJhbnNmb3JtIHdvdWxkbid0IGJlIHVuaXF1ZWx5IGRlZmluZWQpLlxuICAgKlxuICAgKiBOT1RFOiBUaGlzIHJlcXVpcmVzIGNvbXB1dGF0aW9uIG9mIHRoaXMgbm9kZSdzIHN1YnRyZWUgYm91bmRzLCB3aGljaCBtYXkgaW5jdXIgc29tZSBwZXJmb3JtYW5jZSBsb3NzLlxuICAgKi9cbiAgcHVibGljIGdldEdsb2JhbEJvdW5kcygpOiBCb3VuZHMyIHtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0aGlzLnBhcmVudHMubGVuZ3RoIDw9IDEsICdnbG9iYWxCb3VuZHMgdW5hYmxlIHRvIHdvcmsgZm9yIERBRycgKTtcbiAgICByZXR1cm4gdGhpcy5wYXJlbnRUb0dsb2JhbEJvdW5kcyggdGhpcy5nZXRCb3VuZHMoKSApO1xuICB9XG5cbiAgLyoqXG4gICAqIFNlZSBnZXRHbG9iYWxCb3VuZHMoKSBmb3IgbW9yZSBpbmZvcm1hdGlvblxuICAgKi9cbiAgcHVibGljIGdldCBnbG9iYWxCb3VuZHMoKTogQm91bmRzMiB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0R2xvYmFsQm91bmRzKCk7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgYm91bmRzIG9mIGFueSBvdGhlciBOb2RlIGluIG91ciBsb2NhbCBjb29yZGluYXRlIGZyYW1lLlxuICAgKlxuICAgKiBOT1RFOiBJZiB0aGlzIG5vZGUgb3IgdGhlIHBhc3NlZCBpbiBOb2RlIGhhdmUgbXVsdGlwbGUgaW5zdGFuY2VzIChlLmcuIHRoaXMgb3Igb25lIGFuY2VzdG9yIGhhcyB0d28gcGFyZW50cyksIGl0IHdpbGwgZmFpbFxuICAgKiB3aXRoIGFuIGFzc2VydGlvbi5cbiAgICpcbiAgICogVE9ETzogUG9zc2libGUgdG8gYmUgd2VsbC1kZWZpbmVkIGFuZCBoYXZlIG11bHRpcGxlIGluc3RhbmNlcyBvZiBlYWNoLiBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvc2NlbmVyeS9pc3N1ZXMvMTU4MVxuICAgKi9cbiAgcHVibGljIGJvdW5kc09mKCBub2RlOiBOb2RlICk6IEJvdW5kczIge1xuICAgIHJldHVybiB0aGlzLmdsb2JhbFRvTG9jYWxCb3VuZHMoIG5vZGUuZ2V0R2xvYmFsQm91bmRzKCkgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBib3VuZHMgb2YgdGhpcyBOb2RlIGluIGFub3RoZXIgbm9kZSdzIGxvY2FsIGNvb3JkaW5hdGUgZnJhbWUuXG4gICAqXG4gICAqIE5PVEU6IElmIHRoaXMgbm9kZSBvciB0aGUgcGFzc2VkIGluIE5vZGUgaGF2ZSBtdWx0aXBsZSBpbnN0YW5jZXMgKGUuZy4gdGhpcyBvciBvbmUgYW5jZXN0b3IgaGFzIHR3byBwYXJlbnRzKSwgaXQgd2lsbCBmYWlsXG4gICAqIHdpdGggYW4gYXNzZXJ0aW9uLlxuICAgKlxuICAgKiBUT0RPOiBQb3NzaWJsZSB0byBiZSB3ZWxsLWRlZmluZWQgYW5kIGhhdmUgbXVsdGlwbGUgaW5zdGFuY2VzIG9mIGVhY2guIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9zY2VuZXJ5L2lzc3Vlcy8xNTgxXG4gICAqL1xuICBwdWJsaWMgYm91bmRzVG8oIG5vZGU6IE5vZGUgKTogQm91bmRzMiB7XG4gICAgcmV0dXJuIG5vZGUuZ2xvYmFsVG9Mb2NhbEJvdW5kcyggdGhpcy5nZXRHbG9iYWxCb3VuZHMoKSApO1xuICB9XG5cbiAgLyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qXG4gICAqIERyYXdhYmxlIGhhbmRsaW5nXG4gICAqLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXG5cbiAgLyoqXG4gICAqIEFkZHMgdGhlIGRyYXdhYmxlIHRvIG91ciBsaXN0IG9mIGRyYXdhYmxlcyB0byBub3RpZnkgb2YgdmlzdWFsIGNoYW5nZXMuIChzY2VuZXJ5LWludGVybmFsKVxuICAgKi9cbiAgcHVibGljIGF0dGFjaERyYXdhYmxlKCBkcmF3YWJsZTogRHJhd2FibGUgKTogdGhpcyB7XG4gICAgdGhpcy5fZHJhd2FibGVzLnB1c2goIGRyYXdhYmxlICk7XG4gICAgcmV0dXJuIHRoaXM7IC8vIGFsbG93IGNoYWluaW5nXG4gIH1cblxuICAvKipcbiAgICogUmVtb3ZlcyB0aGUgZHJhd2FibGUgZnJvbSBvdXIgbGlzdCBvZiBkcmF3YWJsZXMgdG8gbm90aWZ5IG9mIHZpc3VhbCBjaGFuZ2VzLiAoc2NlbmVyeS1pbnRlcm5hbClcbiAgICovXG4gIHB1YmxpYyBkZXRhY2hEcmF3YWJsZSggZHJhd2FibGU6IERyYXdhYmxlICk6IHRoaXMge1xuICAgIGNvbnN0IGluZGV4ID0gXy5pbmRleE9mKCB0aGlzLl9kcmF3YWJsZXMsIGRyYXdhYmxlICk7XG5cbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBpbmRleCA+PSAwLCAnSW52YWxpZCBvcGVyYXRpb246IHRyeWluZyB0byBkZXRhY2ggYSBub24tcmVmZXJlbmNlZCBkcmF3YWJsZScgKTtcblxuICAgIHRoaXMuX2RyYXdhYmxlcy5zcGxpY2UoIGluZGV4LCAxICk7IC8vIFRPRE86IHJlcGxhY2Ugd2l0aCBhIHJlbW92ZSgpIGZ1bmN0aW9uIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9zY2VuZXJ5L2lzc3Vlcy8xNTgxXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogU2NhbnMgdGhlIG9wdGlvbnMgb2JqZWN0IGZvciBrZXkgbmFtZXMgdGhhdCBjb3JyZXNwb25kIHRvIEVTNSBzZXR0ZXJzIG9yIG90aGVyIHNldHRlciBmdW5jdGlvbnMsIGFuZCBjYWxscyB0aG9zZVxuICAgKiB3aXRoIHRoZSB2YWx1ZXMuXG4gICAqXG4gICAqIEZvciBleGFtcGxlOlxuICAgKlxuICAgKiBub2RlLm11dGF0ZSggeyB0b3A6IDAsIGxlZnQ6IDUgfSApO1xuICAgKlxuICAgKiB3aWxsIGJlIGVxdWl2YWxlbnQgdG86XG4gICAqXG4gICAqIG5vZGUubGVmdCA9IDU7XG4gICAqIG5vZGUudG9wID0gMDtcbiAgICpcbiAgICogSW4gcGFydGljdWxhciwgbm90ZSB0aGF0IHRoZSBvcmRlciBpcyBkaWZmZXJlbnQuIE11dGF0b3JzIHdpbGwgYmUgYXBwbGllZCBpbiB0aGUgb3JkZXIgb2YgX211dGF0b3JLZXlzLCB3aGljaCBjYW5cbiAgICogYmUgYWRkZWQgdG8gYnkgc3VidHlwZXMuXG4gICAqXG4gICAqIEFkZGl0aW9uYWxseSwgc29tZSBrZXlzIGFyZSBhY3R1YWxseSBkaXJlY3QgZnVuY3Rpb24gbmFtZXMsIGxpa2UgJ3NjYWxlJy4gbXV0YXRlKCB7IHNjYWxlOiAyIH0gKSB3aWxsIGNhbGxcbiAgICogbm9kZS5zY2FsZSggMiApIGluc3RlYWQgb2YgYWN0aXZhdGluZyBhbiBFUzUgc2V0dGVyIGRpcmVjdGx5LlxuICAgKi9cbiAgcHVibGljIG11dGF0ZSggb3B0aW9ucz86IE5vZGVPcHRpb25zICk6IHRoaXMge1xuXG4gICAgaWYgKCAhb3B0aW9ucyApIHtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIGFzc2VydCAmJiBhc3NlcnQoIE9iamVjdC5nZXRQcm90b3R5cGVPZiggb3B0aW9ucyApID09PSBPYmplY3QucHJvdG90eXBlLFxuICAgICAgJ0V4dHJhIHByb3RvdHlwZSBvbiBOb2RlIG9wdGlvbnMgb2JqZWN0IGlzIGEgY29kZSBzbWVsbCcgKTtcblxuICAgIC8vIEB0cy1leHBlY3QtZXJyb3JcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBfLmZpbHRlciggWyAndHJhbnNsYXRpb24nLCAneCcsICdsZWZ0JywgJ3JpZ2h0JywgJ2NlbnRlclgnLCAnY2VudGVyVG9wJywgJ3JpZ2h0VG9wJywgJ2xlZnRDZW50ZXInLCAnY2VudGVyJywgJ3JpZ2h0Q2VudGVyJywgJ2xlZnRCb3R0b20nLCAnY2VudGVyQm90dG9tJywgJ3JpZ2h0Qm90dG9tJyBdLCBrZXkgPT4gb3B0aW9uc1sga2V5IF0gIT09IHVuZGVmaW5lZCApLmxlbmd0aCA8PSAxLFxuICAgICAgYE1vcmUgdGhhbiBvbmUgbXV0YXRpb24gb24gdGhpcyBOb2RlIHNldCB0aGUgeCBjb21wb25lbnQsIGNoZWNrICR7T2JqZWN0LmtleXMoIG9wdGlvbnMgKS5qb2luKCAnLCcgKX1gICk7XG5cbiAgICAvLyBAdHMtZXhwZWN0LWVycm9yXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggXy5maWx0ZXIoIFsgJ3RyYW5zbGF0aW9uJywgJ3knLCAndG9wJywgJ2JvdHRvbScsICdjZW50ZXJZJywgJ2NlbnRlclRvcCcsICdyaWdodFRvcCcsICdsZWZ0Q2VudGVyJywgJ2NlbnRlcicsICdyaWdodENlbnRlcicsICdsZWZ0Qm90dG9tJywgJ2NlbnRlckJvdHRvbScsICdyaWdodEJvdHRvbScgXSwga2V5ID0+IG9wdGlvbnNbIGtleSBdICE9PSB1bmRlZmluZWQgKS5sZW5ndGggPD0gMSxcbiAgICAgIGBNb3JlIHRoYW4gb25lIG11dGF0aW9uIG9uIHRoaXMgTm9kZSBzZXQgdGhlIHkgY29tcG9uZW50LCBjaGVjayAke09iamVjdC5rZXlzKCBvcHRpb25zICkuam9pbiggJywnICl9YCApO1xuXG4gICAgaWYgKCBhc3NlcnQgJiYgb3B0aW9ucy5oYXNPd25Qcm9wZXJ0eSggJ2VuYWJsZWQnICkgJiYgb3B0aW9ucy5oYXNPd25Qcm9wZXJ0eSggJ2VuYWJsZWRQcm9wZXJ0eScgKSApIHtcbiAgICAgIGFzc2VydCAmJiBhc3NlcnQoIG9wdGlvbnMuZW5hYmxlZFByb3BlcnR5IS52YWx1ZSA9PT0gb3B0aW9ucy5lbmFibGVkLCAnSWYgYm90aCBlbmFibGVkIGFuZCBlbmFibGVkUHJvcGVydHkgYXJlIHByb3ZpZGVkLCB0aGVuIHZhbHVlcyBzaG91bGQgbWF0Y2gnICk7XG4gICAgfVxuICAgIGlmICggYXNzZXJ0ICYmIG9wdGlvbnMuaGFzT3duUHJvcGVydHkoICdpbnB1dEVuYWJsZWQnICkgJiYgb3B0aW9ucy5oYXNPd25Qcm9wZXJ0eSggJ2lucHV0RW5hYmxlZFByb3BlcnR5JyApICkge1xuICAgICAgYXNzZXJ0ICYmIGFzc2VydCggb3B0aW9ucy5pbnB1dEVuYWJsZWRQcm9wZXJ0eSEudmFsdWUgPT09IG9wdGlvbnMuaW5wdXRFbmFibGVkLCAnSWYgYm90aCBpbnB1dEVuYWJsZWQgYW5kIGlucHV0RW5hYmxlZFByb3BlcnR5IGFyZSBwcm92aWRlZCwgdGhlbiB2YWx1ZXMgc2hvdWxkIG1hdGNoJyApO1xuICAgIH1cbiAgICBpZiAoIGFzc2VydCAmJiBvcHRpb25zLmhhc093blByb3BlcnR5KCAndmlzaWJsZScgKSAmJiBvcHRpb25zLmhhc093blByb3BlcnR5KCAndmlzaWJsZVByb3BlcnR5JyApICkge1xuICAgICAgYXNzZXJ0ICYmIGFzc2VydCggb3B0aW9ucy52aXNpYmxlUHJvcGVydHkhLnZhbHVlID09PSBvcHRpb25zLnZpc2libGUsICdJZiBib3RoIHZpc2libGUgYW5kIHZpc2libGVQcm9wZXJ0eSBhcmUgcHJvdmlkZWQsIHRoZW4gdmFsdWVzIHNob3VsZCBtYXRjaCcgKTtcbiAgICB9XG4gICAgaWYgKCBhc3NlcnQgJiYgb3B0aW9ucy5oYXNPd25Qcm9wZXJ0eSggJ3Bkb21WaXNpYmxlJyApICYmIG9wdGlvbnMuaGFzT3duUHJvcGVydHkoICdwZG9tVmlzaWJsZVByb3BlcnR5JyApICkge1xuICAgICAgYXNzZXJ0ICYmIGFzc2VydCggb3B0aW9ucy5wZG9tVmlzaWJsZVByb3BlcnR5IS52YWx1ZSA9PT0gb3B0aW9ucy5wZG9tVmlzaWJsZSwgJ0lmIGJvdGggcGRvbVZpc2libGUgYW5kIHBkb21WaXNpYmxlUHJvcGVydHkgYXJlIHByb3ZpZGVkLCB0aGVuIHZhbHVlcyBzaG91bGQgbWF0Y2gnICk7XG4gICAgfVxuICAgIGlmICggYXNzZXJ0ICYmIG9wdGlvbnMuaGFzT3duUHJvcGVydHkoICdwaWNrYWJsZScgKSAmJiBvcHRpb25zLmhhc093blByb3BlcnR5KCAncGlja2FibGVQcm9wZXJ0eScgKSApIHtcbiAgICAgIGFzc2VydCAmJiBhc3NlcnQoIG9wdGlvbnMucGlja2FibGVQcm9wZXJ0eSEudmFsdWUgPT09IG9wdGlvbnMucGlja2FibGUsICdJZiBib3RoIHBpY2thYmxlIGFuZCBwaWNrYWJsZVByb3BlcnR5IGFyZSBwcm92aWRlZCwgdGhlbiB2YWx1ZXMgc2hvdWxkIG1hdGNoJyApO1xuICAgIH1cblxuICAgIGNvbnN0IG11dGF0b3JLZXlzID0gdGhpcy5fbXV0YXRvcktleXM7XG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgbXV0YXRvcktleXMubGVuZ3RoOyBpKysgKSB7XG4gICAgICBjb25zdCBrZXkgPSBtdXRhdG9yS2V5c1sgaSBdO1xuXG4gICAgICAvLyBTZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3NjZW5lcnkvaXNzdWVzLzU4MCBmb3IgbW9yZSBhYm91dCBwYXNzaW5nIHVuZGVmaW5lZC5cbiAgICAgIC8vIEB0cy1leHBlY3QtZXJyb3JcbiAgICAgIGFzc2VydCAmJiBhc3NlcnQoICFvcHRpb25zLmhhc093blByb3BlcnR5KCBrZXkgKSB8fCBvcHRpb25zWyBrZXkgXSAhPT0gdW5kZWZpbmVkLCBgVW5kZWZpbmVkIG5vdCBhbGxvd2VkIGZvciBOb2RlIGtleTogJHtrZXl9YCApO1xuXG4gICAgICAvLyBAdHMtZXhwZWN0LWVycm9yIC0gSG1tLCBiZXR0ZXIgd2F5IHRvIGNoZWNrIHRoaXM/XG4gICAgICBpZiAoIG9wdGlvbnNbIGtleSBdICE9PSB1bmRlZmluZWQgKSB7XG4gICAgICAgIGNvbnN0IGRlc2NyaXB0b3IgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKCBOb2RlLnByb3RvdHlwZSwga2V5ICk7XG5cbiAgICAgICAgLy8gaWYgdGhlIGtleSByZWZlcnMgdG8gYSBmdW5jdGlvbiB0aGF0IGlzIG5vdCBFUzUgd3JpdGFibGUsIGl0IHdpbGwgZXhlY3V0ZSB0aGF0IGZ1bmN0aW9uIHdpdGggdGhlIHNpbmdsZSBhcmd1bWVudFxuICAgICAgICBpZiAoIGRlc2NyaXB0b3IgJiYgdHlwZW9mIGRlc2NyaXB0b3IudmFsdWUgPT09ICdmdW5jdGlvbicgKSB7XG4gICAgICAgICAgLy8gQHRzLWV4cGVjdC1lcnJvclxuICAgICAgICAgIHRoaXNbIGtleSBdKCBvcHRpb25zWyBrZXkgXSApO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgIC8vIEB0cy1leHBlY3QtZXJyb3JcbiAgICAgICAgICB0aGlzWyBrZXkgXSA9IG9wdGlvbnNbIGtleSBdO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgdGhpcy5pbml0aWFsaXplUGhldGlvT2JqZWN0KCBERUZBVUxUX1BIRVRfSU9fT0JKRUNUX0JBU0VfT1BUSU9OUywgb3B0aW9ucyApO1xuXG4gICAgcmV0dXJuIHRoaXM7IC8vIGFsbG93IGNoYWluaW5nXG4gIH1cblxuICBwcm90ZWN0ZWQgb3ZlcnJpZGUgaW5pdGlhbGl6ZVBoZXRpb09iamVjdCggYmFzZU9wdGlvbnM6IFBhcnRpYWw8UGhldGlvT2JqZWN0T3B0aW9ucz4sIGNvbmZpZzogTm9kZU9wdGlvbnMgKTogdm9pZCB7XG5cbiAgICAvLyBUcmFjayB0aGlzLCBzbyB3ZSBvbmx5IG92ZXJyaWRlIG91ciB2aXNpYmxlUHJvcGVydHkgb25jZS5cbiAgICBjb25zdCB3YXNJbnN0cnVtZW50ZWQgPSB0aGlzLmlzUGhldGlvSW5zdHJ1bWVudGVkKCk7XG5cbiAgICBzdXBlci5pbml0aWFsaXplUGhldGlvT2JqZWN0KCBiYXNlT3B0aW9ucywgY29uZmlnICk7XG5cbiAgICBpZiAoIFRhbmRlbS5QSEVUX0lPX0VOQUJMRUQgJiYgIXdhc0luc3RydW1lbnRlZCAmJiB0aGlzLmlzUGhldGlvSW5zdHJ1bWVudGVkKCkgKSB7XG5cbiAgICAgIC8vIEZvciBlYWNoIHN1cHBvcnRlZCBUaW55Rm9yd2FyZGluZ1Byb3BlcnR5LCBpZiBhIFByb3BlcnR5IHdhcyBhbHJlYWR5IHNwZWNpZmllZCBpbiB0aGUgb3B0aW9ucyAoaW4gdGhlXG4gICAgICAvLyBjb25zdHJ1Y3RvciBvciBtdXRhdGUpLCB0aGVuIGl0IHdpbGwgYmUgc2V0IGFzIHRoaXMudGFyZ2V0UHJvcGVydHkgdGhlcmUuIEhlcmUgd2Ugb25seSBjcmVhdGUgdGhlIGRlZmF1bHRcbiAgICAgIC8vIGluc3RydW1lbnRlZCBvbmUgaWYgYW5vdGhlciBoYXNuJ3QgYWxyZWFkeSBiZWVuIHNwZWNpZmllZC5cblxuICAgICAgdGhpcy5fdmlzaWJsZVByb3BlcnR5LmluaXRpYWxpemVQaGV0aW8oIHRoaXMsIFZJU0lCTEVfUFJPUEVSVFlfVEFOREVNX05BTUUsICgpID0+IG5ldyBCb29sZWFuUHJvcGVydHkoIHRoaXMudmlzaWJsZSwgY29tYmluZU9wdGlvbnM8Qm9vbGVhblByb3BlcnR5T3B0aW9ucz4oIHtcblxuICAgICAgICAgIC8vIGJ5IGRlZmF1bHQsIHVzZSB0aGUgdmFsdWUgZnJvbSB0aGUgTm9kZVxuICAgICAgICAgIHBoZXRpb1JlYWRPbmx5OiB0aGlzLnBoZXRpb1JlYWRPbmx5LFxuICAgICAgICAgIHRhbmRlbTogdGhpcy50YW5kZW0uY3JlYXRlVGFuZGVtKCBWSVNJQkxFX1BST1BFUlRZX1RBTkRFTV9OQU1FICksXG4gICAgICAgICAgcGhldGlvRG9jdW1lbnRhdGlvbjogJ0NvbnRyb2xzIHdoZXRoZXIgdGhlIE5vZGUgd2lsbCBiZSB2aXNpYmxlIChhbmQgaW50ZXJhY3RpdmUpLidcbiAgICAgICAgfSwgY29uZmlnLnZpc2libGVQcm9wZXJ0eU9wdGlvbnMgKSApXG4gICAgICApO1xuXG4gICAgICB0aGlzLl9lbmFibGVkUHJvcGVydHkuaW5pdGlhbGl6ZVBoZXRpbyggdGhpcywgRU5BQkxFRF9QUk9QRVJUWV9UQU5ERU1fTkFNRSwgKCkgPT4gbmV3IEVuYWJsZWRQcm9wZXJ0eSggdGhpcy5lbmFibGVkLCBjb21iaW5lT3B0aW9uczxFbmFibGVkUHJvcGVydHlPcHRpb25zPigge1xuXG4gICAgICAgICAgLy8gYnkgZGVmYXVsdCwgdXNlIHRoZSB2YWx1ZSBmcm9tIHRoZSBOb2RlXG4gICAgICAgICAgcGhldGlvUmVhZE9ubHk6IHRoaXMucGhldGlvUmVhZE9ubHksXG4gICAgICAgICAgcGhldGlvRG9jdW1lbnRhdGlvbjogJ1NldHMgd2hldGhlciB0aGUgbm9kZSBpcyBlbmFibGVkLiBUaGlzIHdpbGwgc2V0IHdoZXRoZXIgaW5wdXQgaXMgZW5hYmxlZCBmb3IgdGhpcyBOb2RlIGFuZCAnICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnbW9zdCBvZnRlbiBjaGlsZHJlbiBhcyB3ZWxsLiBJdCB3aWxsIGFsc28gY29udHJvbCBhbmQgdG9nZ2xlIHRoZSBcImRpc2FibGVkIGxvb2tcIiBvZiB0aGUgbm9kZS4nLFxuICAgICAgICAgIHRhbmRlbTogdGhpcy50YW5kZW0uY3JlYXRlVGFuZGVtKCBFTkFCTEVEX1BST1BFUlRZX1RBTkRFTV9OQU1FIClcbiAgICAgICAgfSwgY29uZmlnLmVuYWJsZWRQcm9wZXJ0eU9wdGlvbnMgKSApXG4gICAgICApO1xuXG4gICAgICB0aGlzLl9pbnB1dEVuYWJsZWRQcm9wZXJ0eS5pbml0aWFsaXplUGhldGlvKCB0aGlzLCBJTlBVVF9FTkFCTEVEX1BST1BFUlRZX1RBTkRFTV9OQU1FLCAoKSA9PiBuZXcgUHJvcGVydHkoIHRoaXMuaW5wdXRFbmFibGVkLCBjb21iaW5lT3B0aW9uczxQcm9wZXJ0eU9wdGlvbnM8Ym9vbGVhbj4+KCB7XG5cbiAgICAgICAgICAvLyBieSBkZWZhdWx0LCB1c2UgdGhlIHZhbHVlIGZyb20gdGhlIE5vZGVcbiAgICAgICAgICBwaGV0aW9SZWFkT25seTogdGhpcy5waGV0aW9SZWFkT25seSxcbiAgICAgICAgICB0YW5kZW06IHRoaXMudGFuZGVtLmNyZWF0ZVRhbmRlbSggSU5QVVRfRU5BQkxFRF9QUk9QRVJUWV9UQU5ERU1fTkFNRSApLFxuICAgICAgICAgIHBoZXRpb1ZhbHVlVHlwZTogQm9vbGVhbklPLFxuICAgICAgICAgIHBoZXRpb0ZlYXR1cmVkOiB0cnVlLCAvLyBTaW5jZSB0aGlzIHByb3BlcnR5IGlzIG9wdC1pbiwgd2UgdHlwaWNhbGx5IG9ubHkgb3B0LWluIHdoZW4gaXQgc2hvdWxkIGJlIGZlYXR1cmVkXG4gICAgICAgICAgcGhldGlvRG9jdW1lbnRhdGlvbjogJ1NldHMgd2hldGhlciB0aGUgZWxlbWVudCB3aWxsIGhhdmUgaW5wdXQgZW5hYmxlZCwgYW5kIGhlbmNlIGJlIGludGVyYWN0aXZlLidcbiAgICAgICAgfSwgY29uZmlnLmlucHV0RW5hYmxlZFByb3BlcnR5T3B0aW9ucyApIClcbiAgICAgICk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFNldCB0aGUgdmlzaWJpbGl0eSBvZiB0aGlzIE5vZGUgd2l0aCByZXNwZWN0IHRvIHRoZSBWb2ljaW5nIGZlYXR1cmUuIFRvdGFsbHkgc2VwYXJhdGUgZnJvbSBncmFwaGljYWwgZGlzcGxheS5cbiAgICogV2hlbiB2aXNpYmxlLCB0aGlzIE5vZGUgYW5kIGFsbCBvZiBpdHMgYW5jZXN0b3JzIHdpbGwgYmUgYWJsZSB0byBzcGVhayB3aXRoIFZvaWNpbmcuIFdoZW4gdm9pY2luZ1Zpc2libGVcbiAgICogaXMgZmFsc2UsIGFsbCBWb2ljaW5nIHVuZGVyIHRoaXMgTm9kZSB3aWxsIGJlIG11dGVkLiBgdm9pY2luZ1Zpc2libGVgIHByb3BlcnRpZXMgZXhpc3QgaW4gTm9kZS50cyBiZWNhdXNlXG4gICAqIGl0IGlzIHVzZWZ1bCB0byBzZXQgYHZvaWNpbmdWaXNpYmxlYCBvbiBhIHJvb3QgdGhhdCBpcyBjb21wb3NlZCB3aXRoIFZvaWNpbmcudHMuIFdlIGNhbm5vdCBwdXQgYWxsIG9mIHRoZVxuICAgKiBWb2ljaW5nLnRzIGltcGxlbWVudGF0aW9uIGluIE5vZGUgYmVjYXVzZSB0aGF0IHdvdWxkIGhhdmUgYSBtYXNzaXZlIG1lbW9yeSBpbXBhY3QuIFNlZSBWb2ljaW5nLnRzIGZvciBtb3JlXG4gICAqIGluZm9ybWF0aW9uLlxuICAgKi9cbiAgcHVibGljIHNldFZvaWNpbmdWaXNpYmxlKCB2aXNpYmxlOiBib29sZWFuICk6IHZvaWQge1xuICAgIGlmICggdGhpcy52b2ljaW5nVmlzaWJsZVByb3BlcnR5LnZhbHVlICE9PSB2aXNpYmxlICkge1xuICAgICAgdGhpcy52b2ljaW5nVmlzaWJsZVByb3BlcnR5LnZhbHVlID0gdmlzaWJsZTtcbiAgICB9XG4gIH1cblxuICBwdWJsaWMgc2V0IHZvaWNpbmdWaXNpYmxlKCB2aXNpYmxlOiBib29sZWFuICkgeyB0aGlzLnNldFZvaWNpbmdWaXNpYmxlKCB2aXNpYmxlICk7IH1cblxuICBwdWJsaWMgZ2V0IHZvaWNpbmdWaXNpYmxlKCk6IGJvb2xlYW4geyByZXR1cm4gdGhpcy5pc1ZvaWNpbmdWaXNpYmxlKCk7IH1cblxuICAvKipcbiAgICogUmV0dXJucyB3aGV0aGVyIHRoaXMgTm9kZSBpcyB2b2ljaW5nVmlzaWJsZS4gV2hlbiB0cnVlIFV0dGVyYW5jZXMgZm9yIHRoaXMgTm9kZSBjYW4gYmUgYW5ub3VuY2VkIHdpdGggdGhlXG4gICAqIFZvaWNpbmcgZmVhdHVyZSwgc2VlIFZvaWNpbmcudHMgZm9yIG1vcmUgaW5mb3JtYXRpb24uXG4gICAqL1xuICBwdWJsaWMgaXNWb2ljaW5nVmlzaWJsZSgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy52b2ljaW5nVmlzaWJsZVByb3BlcnR5LnZhbHVlO1xuICB9XG5cbiAgLyoqXG4gICAqIE92ZXJyaWRlIGZvciBleHRyYSBpbmZvcm1hdGlvbiBpbiB0aGUgZGVidWdnaW5nIG91dHB1dCAoZnJvbSBEaXNwbGF5LmdldERlYnVnSFRNTCgpKS4gKHNjZW5lcnktaW50ZXJuYWwpXG4gICAqL1xuICBwdWJsaWMgZ2V0RGVidWdIVE1MRXh0cmFzKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuICcnO1xuICB9XG5cbiAgLyoqXG4gICAqIE1ha2VzIHRoaXMgTm9kZSdzIHN1YnRyZWUgYXZhaWxhYmxlIGZvciBpbnNwZWN0aW9uLlxuICAgKi9cbiAgcHVibGljIGluc3BlY3QoKTogdm9pZCB7XG4gICAgbG9jYWxTdG9yYWdlLnNjZW5lcnlTbmFwc2hvdCA9IEpTT04uc3RyaW5naWZ5KCB7XG4gICAgICB0eXBlOiAnU3VidHJlZScsXG4gICAgICByb290Tm9kZUlkOiB0aGlzLmlkLFxuICAgICAgbm9kZXM6IHNlcmlhbGl6ZUNvbm5lY3RlZE5vZGVzKCB0aGlzIClcbiAgICB9ICk7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyBhIGRlYnVnZ2luZyBzdHJpbmcgdGhhdCBpcyBhbiBhdHRlbXB0ZWQgc2VyaWFsaXphdGlvbiBvZiB0aGlzIG5vZGUncyBzdWItdHJlZS5cbiAgICovXG4gIHB1YmxpYyBvdmVycmlkZSB0b1N0cmluZygpOiBzdHJpbmcge1xuICAgIHJldHVybiBgJHt0aGlzLmNvbnN0cnVjdG9yLm5hbWV9IyR7dGhpcy5pZH1gO1xuICB9XG5cbiAgLyoqXG4gICAqIFBlcmZvcm1zIGNoZWNrcyB0byBzZWUgaWYgdGhlIGludGVybmFsIHN0YXRlIG9mIEluc3RhbmNlIHJlZmVyZW5jZXMgaXMgY29ycmVjdCBhdCBhIGNlcnRhaW4gcG9pbnQgaW4vYWZ0ZXIgdGhlXG4gICAqIERpc3BsYXkncyB1cGRhdGVEaXNwbGF5KCkuIChzY2VuZXJ5LWludGVybmFsKVxuICAgKi9cbiAgcHVibGljIGF1ZGl0SW5zdGFuY2VTdWJ0cmVlRm9yRGlzcGxheSggZGlzcGxheTogRGlzcGxheSApOiB2b2lkIHtcbiAgICBpZiAoIGFzc2VydFNsb3cgKSB7XG4gICAgICBjb25zdCBudW1JbnN0YW5jZXMgPSB0aGlzLl9pbnN0YW5jZXMubGVuZ3RoO1xuICAgICAgZm9yICggbGV0IGkgPSAwOyBpIDwgbnVtSW5zdGFuY2VzOyBpKysgKSB7XG4gICAgICAgIGNvbnN0IGluc3RhbmNlID0gdGhpcy5faW5zdGFuY2VzWyBpIF07XG4gICAgICAgIGlmICggaW5zdGFuY2UuZGlzcGxheSA9PT0gZGlzcGxheSApIHtcbiAgICAgICAgICBhc3NlcnRTbG93KCBpbnN0YW5jZS50cmFpbCEuaXNWYWxpZCgpLFxuICAgICAgICAgICAgYEludmFsaWQgdHJhaWwgb24gSW5zdGFuY2U6ICR7aW5zdGFuY2UudG9TdHJpbmcoKX0gd2l0aCB0cmFpbCAke2luc3RhbmNlLnRyYWlsIS50b1N0cmluZygpfWAgKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvLyBhdWRpdCBhbGwgb2YgdGhlIGNoaWxkcmVuXG4gICAgICB0aGlzLmNoaWxkcmVuLmZvckVhY2goIGNoaWxkID0+IHtcbiAgICAgICAgY2hpbGQuYXVkaXRJbnN0YW5jZVN1YnRyZWVGb3JEaXNwbGF5KCBkaXNwbGF5ICk7XG4gICAgICB9ICk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFdoZW4gd2UgYWRkIG9yIHJlbW92ZSBhbnkgbnVtYmVyIG9mIGJvdW5kcyBsaXN0ZW5lcnMsIHdlIHdhbnQgdG8gaW5jcmVtZW50L2RlY3JlbWVudCBpbnRlcm5hbCBpbmZvcm1hdGlvbi5cbiAgICpcbiAgICogQHBhcmFtIGRlbHRhUXVhbnRpdHkgLSBJZiBwb3NpdGl2ZSwgdGhlIG51bWJlciBvZiBsaXN0ZW5lcnMgYmVpbmcgYWRkZWQsIG90aGVyd2lzZSB0aGUgbnVtYmVyIHJlbW92ZWRcbiAgICovXG4gIHByaXZhdGUgb25Cb3VuZHNMaXN0ZW5lcnNBZGRlZE9yUmVtb3ZlZCggZGVsdGFRdWFudGl0eTogbnVtYmVyICk6IHZvaWQge1xuICAgIHRoaXMuY2hhbmdlQm91bmRzRXZlbnRDb3VudCggZGVsdGFRdWFudGl0eSApO1xuICAgIHRoaXMuX2JvdW5kc0V2ZW50U2VsZkNvdW50ICs9IGRlbHRhUXVhbnRpdHk7XG4gIH1cblxuICAvKipcbiAgICogRGlzcG9zZXMgdGhlIG5vZGUsIHJlbGVhc2luZyBhbGwgcmVmZXJlbmNlcyB0aGF0IGl0IG1haW50YWluZWQuXG4gICAqL1xuICBwdWJsaWMgb3ZlcnJpZGUgZGlzcG9zZSgpOiB2b2lkIHtcblxuICAgIC8vIHJlbW92ZSBhbGwgUERPTSBpbnB1dCBsaXN0ZW5lcnNcbiAgICB0aGlzLmRpc3Bvc2VQYXJhbGxlbERPTSgpO1xuXG4gICAgLy8gV2hlbiBkaXNwb3NpbmcsIHJlbW92ZSBhbGwgY2hpbGRyZW4gYW5kIHBhcmVudHMuIFNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvc2NlbmVyeS9pc3N1ZXMvNjI5XG4gICAgdGhpcy5yZW1vdmVBbGxDaGlsZHJlbigpO1xuICAgIHRoaXMuZGV0YWNoKCk7XG5cbiAgICAvLyBJbiBvcHBvc2l0ZSBvcmRlciBvZiBjcmVhdGlvblxuICAgIHRoaXMuX2lucHV0RW5hYmxlZFByb3BlcnR5LmRpc3Bvc2UoKTtcbiAgICB0aGlzLl9lbmFibGVkUHJvcGVydHkuZGlzcG9zZSgpO1xuICAgIHRoaXMuX3BpY2thYmxlUHJvcGVydHkuZGlzcG9zZSgpO1xuICAgIHRoaXMuX3Zpc2libGVQcm9wZXJ0eS5kaXNwb3NlKCk7XG5cbiAgICAvLyBUZWFyLWRvd24gaW4gdGhlIHJldmVyc2Ugb3JkZXIgTm9kZSB3YXMgY3JlYXRlZFxuICAgIHN1cGVyLmRpc3Bvc2UoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBEaXNwb3NlcyB0aGlzIE5vZGUgYW5kIGFsbCBvdGhlciBkZXNjZW5kYW50IG5vZGVzLlxuICAgKlxuICAgKiBOT1RFOiBVc2Ugd2l0aCBjYXV0aW9uLCBhcyB5b3Ugc2hvdWxkIG5vdCByZS11c2UgYW55IE5vZGUgdG91Y2hlZCBieSB0aGlzLiBOb3QgY29tcGF0aWJsZSB3aXRoIG1vc3QgREFHXG4gICAqICAgICAgIHRlY2huaXF1ZXMuXG4gICAqL1xuICBwdWJsaWMgZGlzcG9zZVN1YnRyZWUoKTogdm9pZCB7XG4gICAgaWYgKCAhdGhpcy5pc0Rpc3Bvc2VkICkge1xuICAgICAgLy8gbWFrZXMgYSBjb3B5IGJlZm9yZSBkaXNwb3NpbmdcbiAgICAgIGNvbnN0IGNoaWxkcmVuID0gdGhpcy5jaGlsZHJlbjtcblxuICAgICAgdGhpcy5kaXNwb3NlKCk7XG5cbiAgICAgIGZvciAoIGxldCBpID0gMDsgaSA8IGNoaWxkcmVuLmxlbmd0aDsgaSsrICkge1xuICAgICAgICBjaGlsZHJlblsgaSBdLmRpc3Bvc2VTdWJ0cmVlKCk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cblxuICAvKipcbiAgICogQSBkZWZhdWx0IGZvciBnZXRUcmFpbHMoKSBzZWFyY2hlcywgcmV0dXJucyB3aGV0aGVyIHRoZSBOb2RlIGhhcyBubyBwYXJlbnRzLlxuICAgKi9cbiAgcHVibGljIHN0YXRpYyBkZWZhdWx0VHJhaWxQcmVkaWNhdGUoIG5vZGU6IE5vZGUgKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIG5vZGUuX3BhcmVudHMubGVuZ3RoID09PSAwO1xuICB9XG5cbiAgLyoqXG4gICAqIEEgZGVmYXVsdCBmb3IgZ2V0TGVhZlRyYWlscygpIHNlYXJjaGVzLCByZXR1cm5zIHdoZXRoZXIgdGhlIE5vZGUgaGFzIG5vIHBhcmVudHMuXG4gICAqL1xuICBwdWJsaWMgc3RhdGljIGRlZmF1bHRMZWFmVHJhaWxQcmVkaWNhdGUoIG5vZGU6IE5vZGUgKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIG5vZGUuX2NoaWxkcmVuLmxlbmd0aCA9PT0gMDtcbiAgfVxuXG4gIHB1YmxpYyBzdGF0aWMgTm9kZUlPOiBJT1R5cGU7XG5cbiAgLy8gQSBtYXBwaW5nIG9mIGFsbCBvZiB0aGUgZGVmYXVsdCBvcHRpb25zIHByb3ZpZGVkIHRvIE5vZGVcbiAgcHVibGljIHN0YXRpYyByZWFkb25seSBERUZBVUxUX05PREVfT1BUSU9OUyA9IERFRkFVTFRfT1BUSU9OUztcblxufVxuXG5Ob2RlLnByb3RvdHlwZS5fbXV0YXRvcktleXMgPSBBQ0NFU1NJQklMSVRZX09QVElPTl9LRVlTLmNvbmNhdCggTk9ERV9PUFRJT05fS0VZUyApO1xuXG4vKipcbiAqIHtBcnJheS48U3RyaW5nPn0gLSBMaXN0IG9mIGFsbCBkaXJ0eSBmbGFncyB0aGF0IHNob3VsZCBiZSBhdmFpbGFibGUgb24gZHJhd2FibGVzIGNyZWF0ZWQgZnJvbSB0aGlzIE5vZGUgKG9yXG4gKiAgICAgICAgICAgICAgICAgICAgc3VidHlwZSkuIEdpdmVuIGEgZmxhZyAoZS5nLiByYWRpdXMpLCBpdCBpbmRpY2F0ZXMgdGhlIGV4aXN0ZW5jZSBvZiBhIGZ1bmN0aW9uXG4gKiAgICAgICAgICAgICAgICAgICAgZHJhd2FibGUubWFya0RpcnR5UmFkaXVzKCkgdGhhdCB3aWxsIGluZGljYXRlIHRvIHRoZSBkcmF3YWJsZSB0aGF0IHRoZSByYWRpdXMgaGFzIGNoYW5nZWQuXG4gKiAoc2NlbmVyeS1pbnRlcm5hbClcbiAqXG4gKiBTaG91bGQgYmUgb3ZlcnJpZGRlbiBieSBzdWJ0eXBlcy5cbiAqL1xuTm9kZS5wcm90b3R5cGUuZHJhd2FibGVNYXJrRmxhZ3MgPSBbXTtcblxuc2NlbmVyeS5yZWdpc3RlciggJ05vZGUnLCBOb2RlICk7XG5cbi8vIHtJT1R5cGV9XG5Ob2RlLk5vZGVJTyA9IG5ldyBJT1R5cGUoICdOb2RlSU8nLCB7XG4gIHZhbHVlVHlwZTogTm9kZSxcbiAgZG9jdW1lbnRhdGlvbjogJ1RoZSBiYXNlIHR5cGUgZm9yIGdyYXBoaWNhbCBhbmQgcG90ZW50aWFsbHkgaW50ZXJhY3RpdmUgb2JqZWN0cy4nLFxuICBtZXRhZGF0YURlZmF1bHRzOiB7XG4gICAgcGhldGlvU3RhdGU6IFBIRVRfSU9fU1RBVEVfREVGQVVMVFxuICB9XG59ICk7XG5cbmNvbnN0IERFRkFVTFRfUEhFVF9JT19PQkpFQ1RfQkFTRV9PUFRJT05TID0geyBwaGV0aW9UeXBlOiBOb2RlLk5vZGVJTywgcGhldGlvU3RhdGU6IFBIRVRfSU9fU1RBVEVfREVGQVVMVCB9O1xuXG4vLyBBIGJhc2UgY2xhc3MgZm9yIGEgbm9kZSBpbiB0aGUgU2NlbmVyeSBzY2VuZSBncmFwaC4gU3VwcG9ydHMgZ2VuZXJhbCBkaXJlY3RlZCBhY3ljbGljIGdyYXBoaWNzIChEQUdzKS5cbi8vIEhhbmRsZXMgbXVsdGlwbGUgbGF5ZXJzIHdpdGggYXNzb3J0ZWQgdHlwZXMgKENhbnZhcyAyRCwgU1ZHLCBET00sIFdlYkdMLCBldGMuKS5cbi8vIE5vdGU6IFdlIHVzZSBpbnRlcmZhY2UgZXh0ZW5zaW9uLCBzbyB3ZSBjYW4ndCBleHBvcnQgTm9kZSBhdCBpdHMgZGVjbGFyYXRpb24gbG9jYXRpb25cbmV4cG9ydCBkZWZhdWx0IE5vZGU7Il0sIm5hbWVzIjpbIkJvb2xlYW5Qcm9wZXJ0eSIsIkVuYWJsZWRQcm9wZXJ0eSIsIlByb3BlcnR5IiwiVGlueUVtaXR0ZXIiLCJUaW55Rm9yd2FyZGluZ1Byb3BlcnR5IiwiVGlueVByb3BlcnR5IiwiVGlueVN0YXRpY1Byb3BlcnR5IiwiQm91bmRzMiIsIk1hdHJpeDMiLCJUcmFuc2Zvcm0zIiwiVXRpbHMiLCJWZWN0b3IyIiwiU2hhcGUiLCJhcnJheURpZmZlcmVuY2UiLCJkZXByZWNhdGlvbldhcm5pbmciLCJvcHRpb25pemUiLCJjb21iaW5lT3B0aW9ucyIsIm9wdGlvbml6ZTMiLCJQaGV0aW9PYmplY3QiLCJUYW5kZW0iLCJCb29sZWFuSU8iLCJJT1R5cGUiLCJBQ0NFU1NJQklMSVRZX09QVElPTl9LRVlTIiwiQ2FudmFzQ29udGV4dFdyYXBwZXIiLCJGZWF0dXJlcyIsIkZpbHRlciIsImhvdGtleU1hbmFnZXIiLCJJbWFnZSIsImlzSGVpZ2h0U2l6YWJsZSIsImlzV2lkdGhTaXphYmxlIiwiTW91c2UiLCJQYXJhbGxlbERPTSIsIlBpY2tlciIsIlJlbmRlcmVyIiwiUmVuZGVyZXJTdW1tYXJ5Iiwic2NlbmVyeSIsInNlcmlhbGl6ZUNvbm5lY3RlZE5vZGVzIiwiVHJhaWwiLCJTY2VuZXJ5UXVlcnlQYXJhbWV0ZXJzIiwiZ2xvYmFsSWRDb3VudGVyIiwic2NyYXRjaEJvdW5kczIiLCJOT1RISU5HIiwiY29weSIsInNjcmF0Y2hCb3VuZHMyRXh0cmEiLCJzY3JhdGNoTWF0cml4MyIsIkVOQUJMRURfUFJPUEVSVFlfVEFOREVNX05BTUUiLCJUQU5ERU1fTkFNRSIsIlZJU0lCTEVfUFJPUEVSVFlfVEFOREVNX05BTUUiLCJJTlBVVF9FTkFCTEVEX1BST1BFUlRZX1RBTkRFTV9OQU1FIiwiUEhFVF9JT19TVEFURV9ERUZBVUxUIiwibWF4UGFyZW50Q291bnQiLCJtYXhDaGlsZENvdW50IiwiUkVRVUlSRVNfQk9VTkRTX09QVElPTl9LRVlTIiwiTk9ERV9PUFRJT05fS0VZUyIsIkRFRkFVTFRfT1BUSU9OUyIsInBoZXRpb1Zpc2libGVQcm9wZXJ0eUluc3RydW1lbnRlZCIsInZpc2libGUiLCJvcGFjaXR5IiwiZGlzYWJsZWRPcGFjaXR5IiwicGlja2FibGUiLCJlbmFibGVkIiwicGhldGlvRW5hYmxlZFByb3BlcnR5SW5zdHJ1bWVudGVkIiwiaW5wdXRFbmFibGVkIiwicGhldGlvSW5wdXRFbmFibGVkUHJvcGVydHlJbnN0cnVtZW50ZWQiLCJjbGlwQXJlYSIsIm1vdXNlQXJlYSIsInRvdWNoQXJlYSIsImN1cnNvciIsInRyYW5zZm9ybUJvdW5kcyIsIm1heFdpZHRoIiwibWF4SGVpZ2h0IiwicmVuZGVyZXIiLCJ1c2VzT3BhY2l0eSIsImxheWVyU3BsaXQiLCJjc3NUcmFuc2Zvcm0iLCJleGNsdWRlSW52aXNpYmxlIiwid2ViZ2xTY2FsZSIsInByZXZlbnRGaXQiLCJERUZBVUxUX0lOVEVSTkFMX1JFTkRFUkVSIiwiZnJvbU5hbWUiLCJOb2RlIiwiaW5zZXJ0Q2hpbGQiLCJpbmRleCIsIm5vZGUiLCJpc0NvbXBvc2l0ZSIsIndpbmRvdyIsImFzc2VydCIsInVuZGVmaW5lZCIsIl8iLCJpbmNsdWRlcyIsIl9jaGlsZHJlbiIsIl9wYXJlbnRzIiwiaXNEaXNwb3NlZCIsIl9waWNrZXIiLCJvbkluc2VydENoaWxkIiwiY2hhbmdlQm91bmRzRXZlbnRDb3VudCIsIl9ib3VuZHNFdmVudENvdW50IiwiX3JlbmRlcmVyU3VtbWFyeSIsInN1bW1hcnlDaGFuZ2UiLCJiaXRtYXNrQWxsIiwiYml0bWFzayIsInB1c2giLCJwaGV0IiwiY2hpcHBlciIsInF1ZXJ5UGFyYW1ldGVycyIsImlzRmluaXRlIiwicGFyZW50TGltaXQiLCJwYXJlbnRDb3VudCIsImxlbmd0aCIsImNvbnNvbGUiLCJsb2ciLCJzcGxpY2UiLCJjaGlsZExpbWl0IiwiY2hpbGRDb3VudCIsImhhc05vUERPTSIsIm9uUERPTUFkZENoaWxkIiwiaW52YWxpZGF0ZUJvdW5kcyIsIl9ib3VuZHNEaXJ0eSIsImNoaWxkSW5zZXJ0ZWRFbWl0dGVyIiwiZW1pdCIsInBhcmVudEFkZGVkRW1pdHRlciIsImNoaWxkcmVuQ2hhbmdlZEVtaXR0ZXIiLCJhc3NlcnRTbG93IiwiYXVkaXQiLCJhZGRDaGlsZCIsInJlbW92ZUNoaWxkIiwiaGFzQ2hpbGQiLCJpbmRleE9mQ2hpbGQiLCJpbmRleE9mIiwicmVtb3ZlQ2hpbGRXaXRoSW5kZXgiLCJyZW1vdmVDaGlsZEF0IiwiaW5kZXhPZlBhcmVudCIsIl9pc0dldHRpbmdSZW1vdmVkRnJvbVBhcmVudCIsIm9uUERPTVJlbW92ZUNoaWxkIiwib25SZW1vdmVDaGlsZCIsIl9jaGlsZEJvdW5kc0RpcnR5IiwiY2hpbGRSZW1vdmVkRW1pdHRlciIsInBhcmVudFJlbW92ZWRFbWl0dGVyIiwibW92ZUNoaWxkVG9JbmRleCIsImN1cnJlbnRJbmRleCIsIm9uUERPTVJlb3JkZXJlZENoaWxkcmVuIiwiY2hpbGRyZW5SZW9yZGVyZWRFbWl0dGVyIiwiTWF0aCIsIm1pbiIsIm1heCIsInJlbW92ZUFsbENoaWxkcmVuIiwic2V0Q2hpbGRyZW4iLCJjaGlsZHJlbiIsImJlZm9yZU9ubHkiLCJhZnRlck9ubHkiLCJpbkJvdGgiLCJpIiwibWluQ2hhbmdlSW5kZXgiLCJtYXhDaGFuZ2VJbmRleCIsImRlc2lyZWQiLCJoYXNSZW9yZGVyaW5nQ2hhbmdlIiwiYWZ0ZXJJbmRleCIsImFmdGVyIiwiaiIsInZhbHVlIiwiZ2V0Q2hpbGRyZW4iLCJzbGljZSIsImdldENoaWxkcmVuQ291bnQiLCJnZXRQYXJlbnRzIiwicGFyZW50cyIsImdldFBhcmVudCIsInBhcmVudCIsImdldENoaWxkQXQiLCJjaGlsZCIsIm1vdmVUb0Zyb250IiwiZWFjaCIsIm1vdmVDaGlsZFRvRnJvbnQiLCJtb3ZlRm9yd2FyZCIsImZvckVhY2giLCJtb3ZlQ2hpbGRGb3J3YXJkIiwibW92ZUJhY2t3YXJkIiwibW92ZUNoaWxkQmFja3dhcmQiLCJtb3ZlVG9CYWNrIiwibW92ZUNoaWxkVG9CYWNrIiwicmVwbGFjZUNoaWxkIiwib2xkQ2hpbGQiLCJuZXdDaGlsZCIsIm9sZENoaWxkRm9jdXNlZCIsImZvY3VzZWQiLCJmb2N1c2FibGUiLCJmb2N1cyIsImRldGFjaCIsIm4iLCJ6ZXJvQmVmb3JlIiwiemVyb0FmdGVyIiwicGFyZW50RGVsdGEiLCJsZW4iLCJ2YWxpZGF0ZVNlbGZCb3VuZHMiLCJfc2VsZkJvdW5kc0RpcnR5Iiwib2xkU2VsZkJvdW5kcyIsInNldCIsInNlbGZCb3VuZHNQcm9wZXJ0eSIsIl92YWx1ZSIsImRpZFNlbGZCb3VuZHNDaGFuZ2UiLCJ1cGRhdGVTZWxmQm91bmRzIiwibm90aWZ5TGlzdGVuZXJzIiwidmFsaWRhdGVCb3VuZHMiLCJzY2VuZXJ5TG9nIiwiYm91bmRzIiwiX2lkIiwibm90aWZpY2F0aW9uVGhyZXNob2xkIiwid2FzRGlydHlCZWZvcmUiLCJvdXJDaGlsZEJvdW5kcyIsImNoaWxkQm91bmRzUHJvcGVydHkiLCJvdXJMb2NhbEJvdW5kcyIsImxvY2FsQm91bmRzUHJvcGVydHkiLCJvdXJTZWxmQm91bmRzIiwib3VyQm91bmRzIiwiYm91bmRzUHJvcGVydHkiLCJjaGFuZ2VkIiwiY291bnQiLCJvbGRDaGlsZEJvdW5kcyIsIl9leGNsdWRlSW52aXNpYmxlQ2hpbGRyZW5Gcm9tQm91bmRzIiwiaXNWaXNpYmxlIiwiaW5jbHVkZUJvdW5kcyIsImVxdWFscyIsImVxdWFsc0Vwc2lsb24iLCJfbG9jYWxCb3VuZHNEaXJ0eSIsIm9sZExvY2FsQm91bmRzIiwiX2xvY2FsQm91bmRzT3ZlcnJpZGRlbiIsImNvbnN0cmFpbkJvdW5kcyIsIl9tYXhXaWR0aCIsIl9tYXhIZWlnaHQiLCJ1cGRhdGVNYXhEaW1lbnNpb24iLCJvbGRCb3VuZHMiLCJfdHJhbnNmb3JtQm91bmRzIiwiX3RyYW5zZm9ybSIsImdldE1hdHJpeCIsImlzQXhpc0FsaWduZWQiLCJtYXRyaXgiLCJfaW5jbHVkZVRyYW5zZm9ybWVkU3VidHJlZUJvdW5kcyIsImdldEJvdW5kc1dpdGhUcmFuc2Zvcm0iLCJ0cmFuc2Zvcm1Cb3VuZHNGcm9tTG9jYWxUb1BhcmVudCIsIl9vcmlnaW5hbEJvdW5kcyIsIl9vcmlnaW5hbExvY2FsQm91bmRzIiwiX29yaWdpbmFsU2VsZkJvdW5kcyIsIl9vcmlnaW5hbENoaWxkQm91bmRzIiwiZXBzaWxvbiIsImNoaWxkQm91bmRzIiwibG9jYWxCb3VuZHMiLCJ1bmlvbiIsImludGVyc2VjdGlvbiIsImZ1bGxCb3VuZHMiLCJsb2NhbFRvUGFyZW50Qm91bmRzIiwidG9TdHJpbmciLCJwb3AiLCJzZWxmQm91bmRzIiwiaXNFbXB0eSIsImdldFRyYW5zZm9ybWVkU2VsZkJvdW5kcyIsIm51bUNoaWxkcmVuIiwibXVsdGlwbHlNYXRyaXgiLCJnZXRJbnZlcnNlIiwidmFsaWRhdGVXYXRjaGVkQm91bmRzIiwid2F0Y2hlZEJvdW5kc1NjYW4iLCJfYm91bmRzRXZlbnRTZWxmQ291bnQiLCJpbnZhbGlkYXRlQ2hpbGRCb3VuZHMiLCJpbnZhbGlkYXRlU2VsZiIsIm5ld1NlbGZCb3VuZHMiLCJvblNlbGZCb3VuZHNEaXJ0eSIsInBvdGVudGlhbENoaWxkIiwiaXNPdXJDaGlsZCIsImdldFNlbGZTaGFwZSIsImdldFNlbGZCb3VuZHMiLCJnZXRTYWZlU2VsZkJvdW5kcyIsInNhZmVTZWxmQm91bmRzIiwiZ2V0Q2hpbGRCb3VuZHMiLCJnZXRMb2NhbEJvdW5kcyIsInNldExvY2FsQm91bmRzIiwibG9jYWxCb3VuZHNPdmVycmlkZGVuIiwiaXNOYU4iLCJtaW5YIiwibWluWSIsIm1heFgiLCJtYXhZIiwidHJhbnNmb3JtZWQiLCJnZXRUcmFuc2Zvcm1lZFNhZmVTZWxmQm91bmRzIiwiZ2V0U2FmZVRyYW5zZm9ybWVkVmlzaWJsZUJvdW5kcyIsImxvY2FsTWF0cml4IiwiSURFTlRJVFkiLCJ0aW1lc01hdHJpeCIsInZpc2libGVQcm9wZXJ0eSIsInNhZmVUcmFuc2Zvcm1lZFZpc2libGVCb3VuZHMiLCJzZXRUcmFuc2Zvcm1Cb3VuZHMiLCJnZXRUcmFuc2Zvcm1Cb3VuZHMiLCJnZXRCb3VuZHMiLCJnZXRWaXNpYmxlTG9jYWxCb3VuZHMiLCJnZXRWaXNpYmxlQm91bmRzIiwidmlzaWJsZUxvY2FsQm91bmRzIiwidHJhbnNmb3JtIiwidmlzaWJsZUJvdW5kcyIsImhpdFRlc3QiLCJwb2ludCIsImlzTW91c2UiLCJpc1RvdWNoIiwidHJhaWxVbmRlclBvaW50ZXIiLCJwb2ludGVyIiwiaXNUb3VjaExpa2UiLCJjb250YWluc1BvaW50IiwiY29udGFpbnNQb2ludFNlbGYiLCJpbnRlcnNlY3RzQm91bmRzU2VsZiIsImludGVyc2VjdHNCb3VuZHMiLCJpc1BoZXRpb01vdXNlSGl0dGFibGUiLCJpc0FueURlc2NlbmRhbnRBUGhldGlvTW91c2VIaXRUYXJnZXQiLCJ0aW1lc1ZlY3RvcjIiLCJnZXRQaGV0aW9Nb3VzZUhpdFRhcmdldCIsInNvbWUiLCJnZXRQaGV0aW9Nb3VzZUhpdCIsImxvY2FsUG9pbnQiLCJjaGlsZEhpdFdpdGhvdXRUYXJnZXQiLCJjaGlsZFRhcmdldEhpdCIsIl9tb3VzZUFyZWEiLCJpc1BhaW50ZWQiLCJhcmVTZWxmQm91bmRzVmFsaWQiLCJoYXNQYXJlbnQiLCJoYXNDaGlsZHJlbiIsImlzQ2hpbGRJbmNsdWRlZEluTGF5b3V0IiwiaXNWYWxpZCIsIndhbGtEZXB0aEZpcnN0IiwiY2FsbGJhY2siLCJhZGRJbnB1dExpc3RlbmVyIiwibGlzdGVuZXIiLCJfaW5wdXRMaXN0ZW5lcnMiLCJvbkFkZElucHV0TGlzdGVuZXIiLCJob3RrZXlzIiwidXBkYXRlSG90a2V5c0Zyb21JbnB1dExpc3RlbmVyQ2hhbmdlIiwicmVtb3ZlSW5wdXRMaXN0ZW5lciIsIm9uUmVtb3ZlSW5wdXRMaXN0ZW5lciIsImhhc0lucHV0TGlzdGVuZXIiLCJpbnRlcnJ1cHRJbnB1dCIsImxpc3RlbmVyc0NvcHkiLCJpbnB1dExpc3RlbmVycyIsImludGVycnVwdCIsImludGVycnVwdFN1YnRyZWVJbnB1dCIsImlzUG90ZW50aWFsbHlQaWNrYWJsZSIsInRyYW5zbGF0ZSIsIngiLCJ5IiwicHJlcGVuZEluc3RlYWQiLCJhYnMiLCJwcmVwZW5kVHJhbnNsYXRpb24iLCJhcHBlbmRNYXRyaXgiLCJzZXRUb1RyYW5zbGF0aW9uIiwidmVjdG9yIiwic2NhbGUiLCJwcmVwZW5kTWF0cml4Iiwic2NhbGluZyIsInJvdGF0ZSIsImFuZ2xlIiwiUEkiLCJyb3RhdGlvbjIiLCJyb3RhdGVBcm91bmQiLCJ0cmFuc2xhdGlvbiIsInNldFgiLCJnZXRYIiwibTAyIiwic2V0WSIsImdldFkiLCJtMTIiLCJzZXRTY2FsZU1hZ25pdHVkZSIsImEiLCJiIiwiY3VycmVudFNjYWxlIiwiZ2V0U2NhbGVWZWN0b3IiLCJzZXRSb3RhdGlvbiIsInJvdGF0aW9uIiwic2V0VG9Sb3RhdGlvbloiLCJnZXRSb3RhdGlvbiIsInNldFRyYW5zbGF0aW9uIiwibSIsInR4IiwidHkiLCJkeCIsImR5IiwiZ2V0VHJhbnNsYXRpb24iLCJnZXREZXRlcm1pbmFudCIsImFwcGVuZCIsInByZXBlbmQiLCJzZXRNYXRyaXgiLCJnZXRUcmFuc2Zvcm0iLCJyZXNldFRyYW5zZm9ybSIsIm9uVHJhbnNmb3JtQ2hhbmdlIiwidHJhbnNmb3JtRW1pdHRlciIsIm9uU3VtbWFyeUNoYW5nZSIsIm9sZEJpdG1hc2siLCJuZXdCaXRtYXNrIiwiX3Bkb21EaXNwbGF5c0luZm8iLCJhdWRpdE1heERpbWVuc2lvbnMiLCJfYXBwbGllZFNjYWxlRmFjdG9yIiwiaWRlYWxTY2FsZSIsIndpZHRoIiwiaGVpZ2h0Iiwic2NhbGVBZGp1c3RtZW50IiwicHJlZmVycmVkV2lkdGgiLCJwcmVmZXJyZWRIZWlnaHQiLCJvbk1heERpbWVuc2lvbkNoYW5nZSIsImJlZm9yZU1heExlbmd0aCIsImFmdGVyTWF4TGVuZ3RoIiwic2V0TWF4V2lkdGgiLCJnZXRNYXhXaWR0aCIsInNldE1heEhlaWdodCIsImdldE1heEhlaWdodCIsInNldExlZnQiLCJsZWZ0IiwiY3VycmVudExlZnQiLCJnZXRMZWZ0Iiwic2V0UmlnaHQiLCJyaWdodCIsImN1cnJlbnRSaWdodCIsImdldFJpZ2h0Iiwic2V0Q2VudGVyWCIsImN1cnJlbnRDZW50ZXJYIiwiZ2V0Q2VudGVyWCIsImNlbnRlclgiLCJzZXRDZW50ZXJZIiwiY3VycmVudENlbnRlclkiLCJnZXRDZW50ZXJZIiwiY2VudGVyWSIsInNldFRvcCIsInRvcCIsImN1cnJlbnRUb3AiLCJnZXRUb3AiLCJzZXRCb3R0b20iLCJib3R0b20iLCJjdXJyZW50Qm90dG9tIiwiZ2V0Qm90dG9tIiwic2V0TGVmdFRvcCIsImxlZnRUb3AiLCJjdXJyZW50TGVmdFRvcCIsImdldExlZnRUb3AiLCJtaW51cyIsInNldENlbnRlclRvcCIsImNlbnRlclRvcCIsImN1cnJlbnRDZW50ZXJUb3AiLCJnZXRDZW50ZXJUb3AiLCJzZXRSaWdodFRvcCIsInJpZ2h0VG9wIiwiY3VycmVudFJpZ2h0VG9wIiwiZ2V0UmlnaHRUb3AiLCJzZXRMZWZ0Q2VudGVyIiwibGVmdENlbnRlciIsImN1cnJlbnRMZWZ0Q2VudGVyIiwiZ2V0TGVmdENlbnRlciIsInNldENlbnRlciIsImNlbnRlciIsImN1cnJlbnRDZW50ZXIiLCJnZXRDZW50ZXIiLCJzZXRSaWdodENlbnRlciIsInJpZ2h0Q2VudGVyIiwiY3VycmVudFJpZ2h0Q2VudGVyIiwiZ2V0UmlnaHRDZW50ZXIiLCJzZXRMZWZ0Qm90dG9tIiwibGVmdEJvdHRvbSIsImN1cnJlbnRMZWZ0Qm90dG9tIiwiZ2V0TGVmdEJvdHRvbSIsInNldENlbnRlckJvdHRvbSIsImNlbnRlckJvdHRvbSIsImN1cnJlbnRDZW50ZXJCb3R0b20iLCJnZXRDZW50ZXJCb3R0b20iLCJzZXRSaWdodEJvdHRvbSIsInJpZ2h0Qm90dG9tIiwiY3VycmVudFJpZ2h0Qm90dG9tIiwiZ2V0UmlnaHRCb3R0b20iLCJnZXRXaWR0aCIsImdldEhlaWdodCIsImdldExvY2FsV2lkdGgiLCJsb2NhbFdpZHRoIiwiZ2V0TG9jYWxIZWlnaHQiLCJsb2NhbEhlaWdodCIsImdldExvY2FsTGVmdCIsImxvY2FsTGVmdCIsImdldExvY2FsUmlnaHQiLCJsb2NhbFJpZ2h0IiwiZ2V0TG9jYWxDZW50ZXJYIiwibG9jYWxDZW50ZXJYIiwiZ2V0TG9jYWxDZW50ZXJZIiwibG9jYWxDZW50ZXJZIiwiZ2V0TG9jYWxUb3AiLCJsb2NhbFRvcCIsImdldExvY2FsQm90dG9tIiwibG9jYWxCb3R0b20iLCJnZXRMb2NhbExlZnRUb3AiLCJsb2NhbExlZnRUb3AiLCJnZXRMb2NhbENlbnRlclRvcCIsImxvY2FsQ2VudGVyVG9wIiwiZ2V0TG9jYWxSaWdodFRvcCIsImxvY2FsUmlnaHRUb3AiLCJnZXRMb2NhbExlZnRDZW50ZXIiLCJsb2NhbExlZnRDZW50ZXIiLCJnZXRMb2NhbENlbnRlciIsImxvY2FsQ2VudGVyIiwiZ2V0TG9jYWxSaWdodENlbnRlciIsImxvY2FsUmlnaHRDZW50ZXIiLCJnZXRMb2NhbExlZnRCb3R0b20iLCJsb2NhbExlZnRCb3R0b20iLCJnZXRMb2NhbENlbnRlckJvdHRvbSIsImxvY2FsQ2VudGVyQm90dG9tIiwiZ2V0TG9jYWxSaWdodEJvdHRvbSIsImxvY2FsUmlnaHRCb3R0b20iLCJnZXRJZCIsImlkIiwib25WaXNpYmxlUHJvcGVydHlDaGFuZ2UiLCJfaW50ZXJydXB0U3VidHJlZU9uSW52aXNpYmxlIiwib25WaXNpYmlsaXR5Q2hhbmdlIiwic2V0VmlzaWJsZVByb3BlcnR5IiwibmV3VGFyZ2V0IiwiX3Zpc2libGVQcm9wZXJ0eSIsInNldFRhcmdldFByb3BlcnR5IiwicHJvcGVydHkiLCJnZXRWaXNpYmxlUHJvcGVydHkiLCJzZXRWaXNpYmxlIiwic2V0UGhldGlvVmlzaWJsZVByb3BlcnR5SW5zdHJ1bWVudGVkIiwic2V0VGFyZ2V0UHJvcGVydHlJbnN0cnVtZW50ZWQiLCJnZXRQaGV0aW9WaXNpYmxlUHJvcGVydHlJbnN0cnVtZW50ZWQiLCJnZXRUYXJnZXRQcm9wZXJ0eUluc3RydW1lbnRlZCIsInN3YXBWaXNpYmlsaXR5Iiwib3RoZXJOb2RlIiwidmlzaWJsZU5vZGUiLCJpbnZpc2libGVOb2RlIiwidmlzaWJsZU5vZGVGb2N1c2VkIiwic2V0T3BhY2l0eSIsIkVycm9yIiwib3BhY2l0eVByb3BlcnR5IiwiZ2V0T3BhY2l0eSIsInNldERpc2FibGVkT3BhY2l0eSIsImRpc2FibGVkT3BhY2l0eVByb3BlcnR5IiwiZ2V0RGlzYWJsZWRPcGFjaXR5IiwiZ2V0RWZmZWN0aXZlT3BhY2l0eSIsImVuYWJsZWRQcm9wZXJ0eSIsImVmZmVjdGl2ZU9wYWNpdHkiLCJvbk9wYWNpdHlQcm9wZXJ0eUNoYW5nZSIsImZpbHRlckNoYW5nZUVtaXR0ZXIiLCJvbkRpc2FibGVkT3BhY2l0eVByb3BlcnR5Q2hhbmdlIiwiX2VuYWJsZWRQcm9wZXJ0eSIsInNldEZpbHRlcnMiLCJmaWx0ZXJzIiwiQXJyYXkiLCJpc0FycmF5IiwiZXZlcnkiLCJmaWx0ZXIiLCJfZmlsdGVycyIsImludmFsaWRhdGVIaW50IiwiZ2V0RmlsdGVycyIsInNldFBpY2thYmxlUHJvcGVydHkiLCJfcGlja2FibGVQcm9wZXJ0eSIsInBpY2thYmxlUHJvcGVydHkiLCJnZXRQaWNrYWJsZVByb3BlcnR5Iiwic2V0UGlja2FibGUiLCJpc1BpY2thYmxlIiwib25QaWNrYWJsZVByb3BlcnR5Q2hhbmdlIiwib2xkUGlja2FibGUiLCJvblBpY2thYmxlQ2hhbmdlIiwic2V0RW5hYmxlZFByb3BlcnR5IiwiZ2V0RW5hYmxlZFByb3BlcnR5Iiwic2V0UGhldGlvRW5hYmxlZFByb3BlcnR5SW5zdHJ1bWVudGVkIiwiZ2V0UGhldGlvRW5hYmxlZFByb3BlcnR5SW5zdHJ1bWVudGVkIiwic2V0RW5hYmxlZCIsImlzRW5hYmxlZCIsIm9uRW5hYmxlZFByb3BlcnR5Q2hhbmdlIiwiaW5wdXRFbmFibGVkUHJvcGVydHkiLCJpc1NldHRhYmxlIiwic2V0SW5wdXRFbmFibGVkUHJvcGVydHkiLCJfaW5wdXRFbmFibGVkUHJvcGVydHkiLCJnZXRJbnB1dEVuYWJsZWRQcm9wZXJ0eSIsInNldFBoZXRpb0lucHV0RW5hYmxlZFByb3BlcnR5SW5zdHJ1bWVudGVkIiwiZ2V0UGhldGlvSW5wdXRFbmFibGVkUHJvcGVydHlJbnN0cnVtZW50ZWQiLCJzZXRJbnB1dEVuYWJsZWQiLCJpc0lucHV0RW5hYmxlZCIsInNldElucHV0TGlzdGVuZXJzIiwiZ2V0SW5wdXRMaXN0ZW5lcnMiLCJzZXRDdXJzb3IiLCJfY3Vyc29yIiwiZ2V0Q3Vyc29yIiwiZ2V0RWZmZWN0aXZlQ3Vyc29yIiwiaW5wdXRMaXN0ZW5lciIsInNldE1vdXNlQXJlYSIsImFyZWEiLCJvbk1vdXNlQXJlYUNoYW5nZSIsImdldE1vdXNlQXJlYSIsInNldFRvdWNoQXJlYSIsIl90b3VjaEFyZWEiLCJvblRvdWNoQXJlYUNoYW5nZSIsImdldFRvdWNoQXJlYSIsInNldENsaXBBcmVhIiwic2hhcGUiLCJjbGlwQXJlYVByb3BlcnR5Iiwib25DbGlwQXJlYUNoYW5nZSIsImdldENsaXBBcmVhIiwiaGFzQ2xpcEFyZWEiLCJzZXRSZW5kZXJlckJpdG1hc2siLCJfcmVuZGVyZXJCaXRtYXNrIiwic2VsZkNoYW5nZSIsImluc3RhbmNlUmVmcmVzaEVtaXR0ZXIiLCJpbnZhbGlkYXRlU3VwcG9ydGVkUmVuZGVyZXJzIiwicmVuZGVyZXJTdW1tYXJ5UmVmcmVzaEVtaXR0ZXIiLCJzZXRSZW5kZXJlciIsIm5ld1JlbmRlcmVyIiwiYml0bWFza0NhbnZhcyIsImJpdG1hc2tTVkciLCJiaXRtYXNrRE9NIiwiYml0bWFza1dlYkdMIiwiX3JlbmRlcmVyIiwiZ2V0UmVuZGVyZXIiLCJzZXRMYXllclNwbGl0Iiwic3BsaXQiLCJfbGF5ZXJTcGxpdCIsImlzTGF5ZXJTcGxpdCIsInNldFVzZXNPcGFjaXR5IiwiX3VzZXNPcGFjaXR5IiwiZ2V0VXNlc09wYWNpdHkiLCJzZXRDU1NUcmFuc2Zvcm0iLCJfY3NzVHJhbnNmb3JtIiwiaXNDU1NUcmFuc2Zvcm1lZCIsInNldEV4Y2x1ZGVJbnZpc2libGUiLCJfZXhjbHVkZUludmlzaWJsZSIsImlzRXhjbHVkZUludmlzaWJsZSIsInNldEV4Y2x1ZGVJbnZpc2libGVDaGlsZHJlbkZyb21Cb3VuZHMiLCJleGNsdWRlSW52aXNpYmxlQ2hpbGRyZW5Gcm9tQm91bmRzIiwiaXNFeGNsdWRlSW52aXNpYmxlQ2hpbGRyZW5Gcm9tQm91bmRzIiwic2V0SW50ZXJydXB0U3VidHJlZU9uSW52aXNpYmxlIiwiaW50ZXJydXB0U3VidHJlZU9uSW52aXNpYmxlIiwiaXNJbnRlcnJ1cHRTdWJ0cmVlT25JbnZpc2libGUiLCJzZXRMYXlvdXRPcHRpb25zIiwibGF5b3V0T3B0aW9ucyIsIk9iamVjdCIsImdldFByb3RvdHlwZU9mIiwicHJvdG90eXBlIiwiX2xheW91dE9wdGlvbnMiLCJsYXlvdXRPcHRpb25zQ2hhbmdlZEVtaXR0ZXIiLCJnZXRMYXlvdXRPcHRpb25zIiwibXV0YXRlTGF5b3V0T3B0aW9ucyIsIndpZHRoU2l6YWJsZSIsImhlaWdodFNpemFibGUiLCJleHRlbmRzV2lkdGhTaXphYmxlIiwiZXh0ZW5kc0hlaWdodFNpemFibGUiLCJleHRlbmRzU2l6YWJsZSIsInNldFByZXZlbnRGaXQiLCJfcHJldmVudEZpdCIsImlzUHJldmVudEZpdCIsInNldFdlYkdMU2NhbGUiLCJfd2ViZ2xTY2FsZSIsImdldFdlYkdMU2NhbGUiLCJnZXRVbmlxdWVUcmFpbCIsInByZWRpY2F0ZSIsInRyYWlsIiwiYWRkQW5jZXN0b3IiLCJ0cmFpbHMiLCJnZXRUcmFpbHMiLCJnZXRVbmlxdWVUcmFpbFRvIiwicm9vdE5vZGUiLCJkZWZhdWx0VHJhaWxQcmVkaWNhdGUiLCJhcHBlbmRBbmNlc3RvclRyYWlsc1dpdGhQcmVkaWNhdGUiLCJnZXRUcmFpbHNUbyIsImdldExlYWZUcmFpbHMiLCJkZWZhdWx0TGVhZlRyYWlsUHJlZGljYXRlIiwiYXBwZW5kRGVzY2VuZGFudFRyYWlsc1dpdGhQcmVkaWNhdGUiLCJnZXRMZWFmVHJhaWxzVG8iLCJsZWFmTm9kZSIsImdldFVuaXF1ZUxlYWZUcmFpbCIsImdldFVuaXF1ZUxlYWZUcmFpbFRvIiwiZ2V0Q29ubmVjdGVkTm9kZXMiLCJyZXN1bHQiLCJmcmVzaCIsImNvbmNhdCIsImdldFN1YnRyZWVOb2RlcyIsImdldFRvcG9sb2dpY2FsbHlTb3J0ZWROb2RlcyIsImVkZ2VzIiwicyIsImwiLCJoYW5kbGVDaGlsZCIsImZpbmFsIiwiY2FuQWRkQ2hpbGQiLCJjYW52YXNQYWludFNlbGYiLCJ3cmFwcGVyIiwicmVuZGVyVG9DYW52YXNTZWxmIiwicmVuZGVyVG9DYW52YXNTdWJ0cmVlIiwiaWRlbnRpdHkiLCJyZXNldFN0eWxlcyIsInJlcXVpcmVzU2NyYXRjaENhbnZhcyIsImNvbnRleHQiLCJzYXZlIiwiY2FudmFzU2V0VHJhbnNmb3JtIiwiY2hpbGRDYW52YXNCb3VuZHMiLCJkaWxhdGUiLCJyb3VuZE91dCIsInNldE1pbk1heCIsImNhbnZhcyIsImRvY3VtZW50IiwiY3JlYXRlRWxlbWVudCIsImdldENvbnRleHQiLCJjaGlsZFdyYXBwZXIiLCJzdWJNYXRyaXgiLCJiZWdpblBhdGgiLCJ3cml0ZVRvQ29udGV4dCIsImNsaXAiLCJzZXRUcmFuc2Zvcm0iLCJnbG9iYWxBbHBoYSIsInNldEZpbHRlciIsImNhbnZhc0ZpbHRlciIsImlzRE9NQ29tcGF0aWJsZSIsIm1hcCIsImdldENTU0ZpbHRlclN0cmluZyIsImpvaW4iLCJhcHBseUNhbnZhc0ZpbHRlciIsImRyYXdJbWFnZSIsInJlc3RvcmUiLCJyZW5kZXJUb0NhbnZhcyIsImJhY2tncm91bmRDb2xvciIsImZpbGxTdHlsZSIsImZpbGxSZWN0IiwidG9DYW52YXMiLCJwYWRkaW5nIiwiY2VpbCIsImNhbnZhc0FwcGVuZFRyYW5zZm9ybSIsInRvRGF0YVVSTCIsInRvSW1hZ2UiLCJ1cmwiLCJpbWciLCJvbmxvYWQiLCJlIiwic3JjIiwidG9JbWFnZU5vZGVBc3luY2hyb25vdXMiLCJpbWFnZSIsInRvQ2FudmFzTm9kZVN5bmNocm9ub3VzIiwidG9EYXRhVVJMSW1hZ2VTeW5jaHJvbm91cyIsImRhdGFVUkwiLCJpbml0aWFsV2lkdGgiLCJpbml0aWFsSGVpZ2h0IiwidG9EYXRhVVJMTm9kZVN5bmNocm9ub3VzIiwicmFzdGVyaXplZCIsInByb3ZpZGVkT3B0aW9ucyIsIm9wdGlvbnMiLCJyZXNvbHV0aW9uIiwic291cmNlQm91bmRzIiwidXNlVGFyZ2V0Qm91bmRzIiwid3JhcCIsInVzZUNhbnZhcyIsIm5vZGVPcHRpb25zIiwiaW1hZ2VPcHRpb25zIiwiTnVtYmVyIiwiaXNJbnRlZ2VyIiwidGVtcFdyYXBwZXJOb2RlIiwidHJhbnNmb3JtZWRCb3VuZHMiLCJkaWxhdGVkIiwicm91bmRlZE91dCIsImltYWdlT3JOdWxsIiwiaW1hZ2VTb3VyY2UiLCJyb3VuZFN5bW1ldHJpYyIsImRpc3Bvc2UiLCJmaW5hbFBhcmVudEJvdW5kcyIsImltYWdlQm91bmRzIiwicGFyZW50VG9Mb2NhbEJvdW5kcyIsInJldHVybk5vZGUiLCJ3cmFwcGVkTm9kZSIsIm11dGF0ZSIsImNyZWF0ZURPTURyYXdhYmxlIiwiaW5zdGFuY2UiLCJjcmVhdGVTVkdEcmF3YWJsZSIsImNyZWF0ZUNhbnZhc0RyYXdhYmxlIiwiY3JlYXRlV2ViR0xEcmF3YWJsZSIsImdldEluc3RhbmNlcyIsIl9pbnN0YW5jZXMiLCJpbnN0YW5jZXMiLCJhZGRJbnN0YW5jZSIsImNoYW5nZWRJbnN0YW5jZUVtaXR0ZXIiLCJyZW1vdmVJbnN0YW5jZSIsIndhc1Zpc3VhbGx5RGlzcGxheWVkIiwiZGlzcGxheSIsImdldFJvb3RlZERpc3BsYXlzIiwiX3Jvb3RlZERpc3BsYXlzIiwicm9vdGVkRGlzcGxheXMiLCJhZGRSb290ZWREaXNwbGF5Iiwib25BZGRlZFJvb3RlZERpc3BsYXkiLCJyb290ZWREaXNwbGF5Q2hhbmdlZEVtaXR0ZXIiLCJyZW1vdmVSb290ZWREaXNwbGF5Iiwib25SZW1vdmVkUm9vdGVkRGlzcGxheSIsImdldFJlY3Vyc2l2ZUNvbm5lY3RlZERpc3BsYXlzIiwiZGlzcGxheXMiLCJ1bmlxIiwiZ2V0Q29ubmVjdGVkRGlzcGxheXMiLCJsb2NhbFRvUGFyZW50UG9pbnQiLCJ0cmFuc2Zvcm1Qb3NpdGlvbjIiLCJ0cmFuc2Zvcm1Cb3VuZHMyIiwicGFyZW50VG9Mb2NhbFBvaW50IiwiaW52ZXJzZVBvc2l0aW9uMiIsImludmVyc2VCb3VuZHMyIiwidHJhbnNmb3JtQm91bmRzRnJvbVBhcmVudFRvTG9jYWwiLCJnZXRMb2NhbFRvR2xvYmFsTWF0cml4IiwibWF0cmljZXMiLCJnZXRVbmlxdWVUcmFuc2Zvcm0iLCJnZXRHbG9iYWxUb0xvY2FsTWF0cml4IiwiaW52ZXJ0IiwibG9jYWxUb0dsb2JhbFBvaW50IiwicmVzdWx0UG9pbnQiLCJtdWx0aXBseVZlY3RvcjIiLCJnbG9iYWxUb0xvY2FsUG9pbnQiLCJ0cmFuc2Zvcm1zIiwibG9jYWxUb0dsb2JhbEJvdW5kcyIsImdsb2JhbFRvTG9jYWxCb3VuZHMiLCJwYXJlbnRUb0dsb2JhbFBvaW50IiwicGFyZW50VG9HbG9iYWxCb3VuZHMiLCJnbG9iYWxUb1BhcmVudFBvaW50IiwiZ2xvYmFsVG9QYXJlbnRCb3VuZHMiLCJnZXRHbG9iYWxCb3VuZHMiLCJnbG9iYWxCb3VuZHMiLCJib3VuZHNPZiIsImJvdW5kc1RvIiwiYXR0YWNoRHJhd2FibGUiLCJkcmF3YWJsZSIsIl9kcmF3YWJsZXMiLCJkZXRhY2hEcmF3YWJsZSIsImtleSIsImtleXMiLCJoYXNPd25Qcm9wZXJ0eSIsInBkb21WaXNpYmxlUHJvcGVydHkiLCJwZG9tVmlzaWJsZSIsIm11dGF0b3JLZXlzIiwiX211dGF0b3JLZXlzIiwiZGVzY3JpcHRvciIsImdldE93blByb3BlcnR5RGVzY3JpcHRvciIsImluaXRpYWxpemVQaGV0aW9PYmplY3QiLCJERUZBVUxUX1BIRVRfSU9fT0JKRUNUX0JBU0VfT1BUSU9OUyIsImJhc2VPcHRpb25zIiwiY29uZmlnIiwid2FzSW5zdHJ1bWVudGVkIiwiaXNQaGV0aW9JbnN0cnVtZW50ZWQiLCJQSEVUX0lPX0VOQUJMRUQiLCJpbml0aWFsaXplUGhldGlvIiwicGhldGlvUmVhZE9ubHkiLCJ0YW5kZW0iLCJjcmVhdGVUYW5kZW0iLCJwaGV0aW9Eb2N1bWVudGF0aW9uIiwidmlzaWJsZVByb3BlcnR5T3B0aW9ucyIsImVuYWJsZWRQcm9wZXJ0eU9wdGlvbnMiLCJwaGV0aW9WYWx1ZVR5cGUiLCJwaGV0aW9GZWF0dXJlZCIsImlucHV0RW5hYmxlZFByb3BlcnR5T3B0aW9ucyIsInNldFZvaWNpbmdWaXNpYmxlIiwidm9pY2luZ1Zpc2libGVQcm9wZXJ0eSIsInZvaWNpbmdWaXNpYmxlIiwiaXNWb2ljaW5nVmlzaWJsZSIsImdldERlYnVnSFRNTEV4dHJhcyIsImluc3BlY3QiLCJsb2NhbFN0b3JhZ2UiLCJzY2VuZXJ5U25hcHNob3QiLCJKU09OIiwic3RyaW5naWZ5IiwidHlwZSIsInJvb3ROb2RlSWQiLCJub2RlcyIsImNvbnN0cnVjdG9yIiwibmFtZSIsImF1ZGl0SW5zdGFuY2VTdWJ0cmVlRm9yRGlzcGxheSIsIm51bUluc3RhbmNlcyIsIm9uQm91bmRzTGlzdGVuZXJzQWRkZWRPclJlbW92ZWQiLCJkZWx0YVF1YW50aXR5IiwiZGlzcG9zZVBhcmFsbGVsRE9NIiwiZGlzcG9zZVN1YnRyZWUiLCJfYWN0aXZlUGFyZW50TGF5b3V0Q29uc3RyYWludCIsImJpbmQiLCJfdHJhbnNmb3JtTGlzdGVuZXIiLCJjaGFuZ2VFbWl0dGVyIiwiYWRkTGlzdGVuZXIiLCJsYXp5TGluayIsInBkb21Cb3VuZElucHV0RW5hYmxlZExpc3RlbmVyIiwiYm91bmRzTGlzdGVuZXJzQWRkZWRPclJlbW92ZWRMaXN0ZW5lciIsImJvdW5kc0ludmFsaWRhdGlvbkxpc3RlbmVyIiwic2VsZkJvdW5kc0ludmFsaWRhdGlvbkxpc3RlbmVyIiwiY2hhbmdlQ291bnQiLCJiaXRtYXNrTm9kZURlZmF1bHQiLCJERUZBVUxUX05PREVfT1BUSU9OUyIsImRyYXdhYmxlTWFya0ZsYWdzIiwicmVnaXN0ZXIiLCJOb2RlSU8iLCJ2YWx1ZVR5cGUiLCJkb2N1bWVudGF0aW9uIiwibWV0YWRhdGFEZWZhdWx0cyIsInBoZXRpb1N0YXRlIiwicGhldGlvVHlwZSJdLCJtYXBwaW5ncyI6IkFBQUEsc0RBQXNEO0FBRXREOzs7Ozs7Ozs7Ozs7Ozs7Ozs7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