// Copyright 2020-2024, University of Colorado Boulder
/**
 * IOType for Nodes that can save their own index (if phetioState: true).  Can be used to customize z-order
 * or layout order.
 *
 * This IOType supports PhET-iO state, but only when every child within a Node's children array is an IndexedNodeIO
 * and is stateful (`phetioState: true`). This applyState algorithm uses Node "swaps" instead of index-based inserts
 * to ensure that by the end of state setting, all Nodes are in the correct order.
 * see https://github.com/phetsims/scenery/issues/1252#issuecomment-888014859 for more information.
 *
 * Invisible nodes are skipped in order to ensure that "move forward" moves past the next visible item and "move backward"
 * moves before the prior visible item. If we did not skip invisible nodes, then a user could press "move forward" and
 * be confused that the visible order does not change (even though the index changes).
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */ import deprecationWarning from '../../../phet-core/js/deprecationWarning.js';
import FunctionIO from '../../../tandem/js/types/FunctionIO.js';
import IOType from '../../../tandem/js/types/IOType.js';
import NullableIO from '../../../tandem/js/types/NullableIO.js';
import NumberIO from '../../../tandem/js/types/NumberIO.js';
import VoidIO from '../../../tandem/js/types/VoidIO.js';
import { Node, scenery } from '../imports.js';
// In order to support unlinking from listening to the index property, keep an indexed map to callback functions
const map = {};
// The next index at which a callback will appear in the map. This always increments and we do reuse old indices
let index = 0;
// Move this node one index forward in each of its parents, jumping over invisible nodes. If the Node is already at the front, this is a no-op.
function moveForward(node) {
    node._parents.forEach((parent)=>moveChild(parent, node, +1));
}
// Move this node one index backward in each of its parents, jumping over invisible nodes.  If the Node is already at the back, this is a no-op.
function moveBackward(node) {
    node._parents.forEach((parent)=>moveChild(parent, node, -1));
}
// factored out for use with the deprecated method name too
function unlinkIndex(index) {
    const method = map[index];
    assert && assert(this.parents.length === 1, 'IndexedNodeIO only supports nodes with a single parent');
    this.parents[0].childrenChangedEmitter.removeListener(method);
    delete map[index];
}
/**
 * Moves the specified child by +1/-1 indices, without going past the beginning or end.
 */ function moveChild(parent, child, delta) {
    const index = parent.indexOfChild(child);
    let targetIndex = index + delta;
    // skip invisible children
    while(targetIndex > 0 && targetIndex < parent.children.length && !parent.children[targetIndex].visible){
        targetIndex += delta;
    }
    if (targetIndex >= 0 && targetIndex < parent.children.length) {
        parent.moveChildToIndex(child, targetIndex);
    }
    parent.onIndexedNodeIOChildMoved && parent.onIndexedNodeIOChildMoved(child);
}
const IndexedNodeIO = new IOType('IndexedNodeIO', {
    valueType: Node,
    documentation: 'Node that can be moved forward/back by index, which specifies z-order and/or layout order',
    supertype: Node.NodeIO,
    toStateObject: (node)=>{
        const stateObject = {
            index: null
        };
        if (node.parents[0]) {
            assert && assert(node.parents.length === 1, 'IndexedNodeIO only supports nodes with a single parent');
            stateObject.index = node.parents[0].indexOfChild(node);
        }
        return stateObject;
    },
    applyState: (node, stateObject)=>{
        const nodeParent = node.parents[0];
        if (nodeParent && stateObject.index) {
            assert && assert(node.parents.length === 1, 'IndexedNodeIO only supports nodes with a single parent');
            // Swap the child at the destination index with current position of this Node, that way the operation is atomic.
            // This implementation assumes that all children are instrumented IndexedNodeIO instances and can have state set
            // on them to "fix them" after this operation. Without this implementation, using Node.moveChildToIndex could blow
            // away another IndexedNode state set. See https://github.com/phetsims/ph-scale/issues/227
            const children = nodeParent.children;
            const currentIndex = nodeParent.indexOfChild(node);
            assert && assert(stateObject.index < children.length, 'index goes beyond number of children');
            children[currentIndex] = children[stateObject.index];
            children[stateObject.index] = node;
            nodeParent.setChildren(children);
        }
    },
    stateSchema: {
        index: NullableIO(NumberIO)
    },
    methods: {
        linkIndex: {
            returnType: NumberIO,
            parameterTypes: [
                FunctionIO(VoidIO, [
                    NumberIO
                ])
            ],
            documentation: 'Following the PropertyIO.link pattern, subscribe for notifications when the index in the parent ' + 'changes, and receive a callback with the current value.  The return value is a numeric ID for use ' + 'with clearLinkIndex.',
            implementation: function(listener) {
                // The callback which signifies the current index
                const callback = ()=>{
                    assert && assert(this.parents.length === 1, 'IndexedNodeIO only supports nodes with a single parent');
                    const index = this.parents[0].indexOfChild(this);
                    listener(index);
                };
                assert && assert(this.parents.length === 1, 'IndexedNodeIO only supports nodes with a single parent');
                this.parents[0].childrenChangedEmitter.addListener(callback);
                callback();
                const myIndex = index;
                map[myIndex] = callback;
                index++;
                return myIndex;
            }
        },
        unlinkIndex: {
            returnType: VoidIO,
            parameterTypes: [
                NumberIO
            ],
            documentation: 'Unlink a listener that has been added using linkIndex, by its numerical ID (like setTimeout/clearTimeout)',
            implementation: unlinkIndex
        },
        clearLinkIndex: {
            returnType: VoidIO,
            parameterTypes: [
                NumberIO
            ],
            documentation: 'Deprecated, see "unlinkIndex".',
            implementation: function(index) {
                assert && deprecationWarning('clearLinkIndex is deprecated, use unlinkIndex instead.', true);
                unlinkIndex.call(this, index);
            }
        },
        moveForward: {
            returnType: VoidIO,
            parameterTypes: [],
            implementation: function() {
                return moveForward(this);
            },
            documentation: 'Move this Node one index forward in each of its parents, skipping invisible Nodes. If the Node is already at the front, this is a no-op.'
        },
        moveBackward: {
            returnType: VoidIO,
            parameterTypes: [],
            implementation: function() {
                return moveBackward(this);
            },
            documentation: 'Move this Node one index backward in each of its parents, skipping invisible Nodes. If the Node is already at the back, this is a no-op.'
        }
    }
});
scenery.register('IndexedNodeIO', IndexedNodeIO);
export default IndexedNodeIO;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvbm9kZXMvSW5kZXhlZE5vZGVJTy50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAyMC0yMDI0LCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuLyoqXG4gKiBJT1R5cGUgZm9yIE5vZGVzIHRoYXQgY2FuIHNhdmUgdGhlaXIgb3duIGluZGV4IChpZiBwaGV0aW9TdGF0ZTogdHJ1ZSkuICBDYW4gYmUgdXNlZCB0byBjdXN0b21pemUgei1vcmRlclxuICogb3IgbGF5b3V0IG9yZGVyLlxuICpcbiAqIFRoaXMgSU9UeXBlIHN1cHBvcnRzIFBoRVQtaU8gc3RhdGUsIGJ1dCBvbmx5IHdoZW4gZXZlcnkgY2hpbGQgd2l0aGluIGEgTm9kZSdzIGNoaWxkcmVuIGFycmF5IGlzIGFuIEluZGV4ZWROb2RlSU9cbiAqIGFuZCBpcyBzdGF0ZWZ1bCAoYHBoZXRpb1N0YXRlOiB0cnVlYCkuIFRoaXMgYXBwbHlTdGF0ZSBhbGdvcml0aG0gdXNlcyBOb2RlIFwic3dhcHNcIiBpbnN0ZWFkIG9mIGluZGV4LWJhc2VkIGluc2VydHNcbiAqIHRvIGVuc3VyZSB0aGF0IGJ5IHRoZSBlbmQgb2Ygc3RhdGUgc2V0dGluZywgYWxsIE5vZGVzIGFyZSBpbiB0aGUgY29ycmVjdCBvcmRlci5cbiAqIHNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvc2NlbmVyeS9pc3N1ZXMvMTI1MiNpc3N1ZWNvbW1lbnQtODg4MDE0ODU5IGZvciBtb3JlIGluZm9ybWF0aW9uLlxuICpcbiAqIEludmlzaWJsZSBub2RlcyBhcmUgc2tpcHBlZCBpbiBvcmRlciB0byBlbnN1cmUgdGhhdCBcIm1vdmUgZm9yd2FyZFwiIG1vdmVzIHBhc3QgdGhlIG5leHQgdmlzaWJsZSBpdGVtIGFuZCBcIm1vdmUgYmFja3dhcmRcIlxuICogbW92ZXMgYmVmb3JlIHRoZSBwcmlvciB2aXNpYmxlIGl0ZW0uIElmIHdlIGRpZCBub3Qgc2tpcCBpbnZpc2libGUgbm9kZXMsIHRoZW4gYSB1c2VyIGNvdWxkIHByZXNzIFwibW92ZSBmb3J3YXJkXCIgYW5kXG4gKiBiZSBjb25mdXNlZCB0aGF0IHRoZSB2aXNpYmxlIG9yZGVyIGRvZXMgbm90IGNoYW5nZSAoZXZlbiB0aG91Z2ggdGhlIGluZGV4IGNoYW5nZXMpLlxuICpcbiAqIEBhdXRob3IgU2FtIFJlaWQgKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXG4gKi9cblxuaW1wb3J0IGRlcHJlY2F0aW9uV2FybmluZyBmcm9tICcuLi8uLi8uLi9waGV0LWNvcmUvanMvZGVwcmVjYXRpb25XYXJuaW5nLmpzJztcbmltcG9ydCBGdW5jdGlvbklPIGZyb20gJy4uLy4uLy4uL3RhbmRlbS9qcy90eXBlcy9GdW5jdGlvbklPLmpzJztcbmltcG9ydCBJT1R5cGUgZnJvbSAnLi4vLi4vLi4vdGFuZGVtL2pzL3R5cGVzL0lPVHlwZS5qcyc7XG5pbXBvcnQgTnVsbGFibGVJTyBmcm9tICcuLi8uLi8uLi90YW5kZW0vanMvdHlwZXMvTnVsbGFibGVJTy5qcyc7XG5pbXBvcnQgTnVtYmVySU8gZnJvbSAnLi4vLi4vLi4vdGFuZGVtL2pzL3R5cGVzL051bWJlcklPLmpzJztcbmltcG9ydCBWb2lkSU8gZnJvbSAnLi4vLi4vLi4vdGFuZGVtL2pzL3R5cGVzL1ZvaWRJTy5qcyc7XG5pbXBvcnQgeyBOb2RlLCBzY2VuZXJ5IH0gZnJvbSAnLi4vaW1wb3J0cy5qcyc7XG5cbmV4cG9ydCB0eXBlIEluZGV4ZWROb2RlSU9QYXJlbnQgPSB7XG4gIG9uSW5kZXhlZE5vZGVJT0NoaWxkTW92ZWQ6ICggbm9kZTogTm9kZSApID0+IHZvaWQ7XG59O1xudHlwZSBJbmRleGVkTm9kZUlPT2JzZXJ2ZXIgPSBQYXJ0aWFsPEluZGV4ZWROb2RlSU9QYXJlbnQ+ICYgTm9kZTtcblxuLy8gSW4gb3JkZXIgdG8gc3VwcG9ydCB1bmxpbmtpbmcgZnJvbSBsaXN0ZW5pbmcgdG8gdGhlIGluZGV4IHByb3BlcnR5LCBrZWVwIGFuIGluZGV4ZWQgbWFwIHRvIGNhbGxiYWNrIGZ1bmN0aW9uc1xuY29uc3QgbWFwOiBSZWNvcmQ8bnVtYmVyLCAoKSA9PiB2b2lkPiA9IHt9O1xuXG4vLyBUaGUgbmV4dCBpbmRleCBhdCB3aGljaCBhIGNhbGxiYWNrIHdpbGwgYXBwZWFyIGluIHRoZSBtYXAuIFRoaXMgYWx3YXlzIGluY3JlbWVudHMgYW5kIHdlIGRvIHJldXNlIG9sZCBpbmRpY2VzXG5sZXQgaW5kZXggPSAwO1xuXG4vLyBNb3ZlIHRoaXMgbm9kZSBvbmUgaW5kZXggZm9yd2FyZCBpbiBlYWNoIG9mIGl0cyBwYXJlbnRzLCBqdW1waW5nIG92ZXIgaW52aXNpYmxlIG5vZGVzLiBJZiB0aGUgTm9kZSBpcyBhbHJlYWR5IGF0IHRoZSBmcm9udCwgdGhpcyBpcyBhIG5vLW9wLlxuZnVuY3Rpb24gbW92ZUZvcndhcmQoIG5vZGU6IE5vZGUgKTogdm9pZCB7XG4gIG5vZGUuX3BhcmVudHMuZm9yRWFjaCggcGFyZW50ID0+IG1vdmVDaGlsZCggcGFyZW50IGFzIEluZGV4ZWROb2RlSU9PYnNlcnZlciwgbm9kZSwgKzEgKSApO1xufVxuXG4vLyBNb3ZlIHRoaXMgbm9kZSBvbmUgaW5kZXggYmFja3dhcmQgaW4gZWFjaCBvZiBpdHMgcGFyZW50cywganVtcGluZyBvdmVyIGludmlzaWJsZSBub2Rlcy4gIElmIHRoZSBOb2RlIGlzIGFscmVhZHkgYXQgdGhlIGJhY2ssIHRoaXMgaXMgYSBuby1vcC5cbmZ1bmN0aW9uIG1vdmVCYWNrd2FyZCggbm9kZTogTm9kZSApOiB2b2lkIHtcbiAgbm9kZS5fcGFyZW50cy5mb3JFYWNoKCBwYXJlbnQgPT4gbW92ZUNoaWxkKCBwYXJlbnQgYXMgSW5kZXhlZE5vZGVJT09ic2VydmVyLCBub2RlLCAtMSApICk7XG59XG5cbi8vIGZhY3RvcmVkIG91dCBmb3IgdXNlIHdpdGggdGhlIGRlcHJlY2F0ZWQgbWV0aG9kIG5hbWUgdG9vXG5mdW5jdGlvbiB1bmxpbmtJbmRleCggdGhpczogTm9kZSwgaW5kZXg6IG51bWJlciApOiB2b2lkIHtcbiAgY29uc3QgbWV0aG9kID0gbWFwWyBpbmRleCBdO1xuICBhc3NlcnQgJiYgYXNzZXJ0KCB0aGlzLnBhcmVudHMubGVuZ3RoID09PSAxLCAnSW5kZXhlZE5vZGVJTyBvbmx5IHN1cHBvcnRzIG5vZGVzIHdpdGggYSBzaW5nbGUgcGFyZW50JyApO1xuICB0aGlzLnBhcmVudHNbIDAgXS5jaGlsZHJlbkNoYW5nZWRFbWl0dGVyLnJlbW92ZUxpc3RlbmVyKCBtZXRob2QgKTtcbiAgZGVsZXRlIG1hcFsgaW5kZXggXTtcbn1cblxuXG4vKipcbiAqIE1vdmVzIHRoZSBzcGVjaWZpZWQgY2hpbGQgYnkgKzEvLTEgaW5kaWNlcywgd2l0aG91dCBnb2luZyBwYXN0IHRoZSBiZWdpbm5pbmcgb3IgZW5kLlxuICovXG5mdW5jdGlvbiBtb3ZlQ2hpbGQoIHBhcmVudDogSW5kZXhlZE5vZGVJT09ic2VydmVyLCBjaGlsZDogTm9kZSwgZGVsdGE6IG51bWJlciApOiB2b2lkIHtcbiAgY29uc3QgaW5kZXggPSBwYXJlbnQuaW5kZXhPZkNoaWxkKCBjaGlsZCApO1xuXG4gIGxldCB0YXJnZXRJbmRleCA9IGluZGV4ICsgZGVsdGE7XG5cbiAgLy8gc2tpcCBpbnZpc2libGUgY2hpbGRyZW5cbiAgd2hpbGUgKCB0YXJnZXRJbmRleCA+IDAgJiYgdGFyZ2V0SW5kZXggPCBwYXJlbnQuY2hpbGRyZW4ubGVuZ3RoICYmICFwYXJlbnQuY2hpbGRyZW5bIHRhcmdldEluZGV4IF0udmlzaWJsZSApIHtcbiAgICB0YXJnZXRJbmRleCArPSBkZWx0YTtcbiAgfVxuXG4gIGlmICggdGFyZ2V0SW5kZXggPj0gMCAmJiB0YXJnZXRJbmRleCA8IHBhcmVudC5jaGlsZHJlbi5sZW5ndGggKSB7XG4gICAgcGFyZW50Lm1vdmVDaGlsZFRvSW5kZXgoIGNoaWxkLCB0YXJnZXRJbmRleCApO1xuICB9XG5cbiAgcGFyZW50Lm9uSW5kZXhlZE5vZGVJT0NoaWxkTW92ZWQgJiYgcGFyZW50Lm9uSW5kZXhlZE5vZGVJT0NoaWxkTW92ZWQoIGNoaWxkICk7XG59XG5cbmNvbnN0IEluZGV4ZWROb2RlSU8gPSBuZXcgSU9UeXBlKCAnSW5kZXhlZE5vZGVJTycsIHtcbiAgdmFsdWVUeXBlOiBOb2RlLFxuICBkb2N1bWVudGF0aW9uOiAnTm9kZSB0aGF0IGNhbiBiZSBtb3ZlZCBmb3J3YXJkL2JhY2sgYnkgaW5kZXgsIHdoaWNoIHNwZWNpZmllcyB6LW9yZGVyIGFuZC9vciBsYXlvdXQgb3JkZXInLFxuICBzdXBlcnR5cGU6IE5vZGUuTm9kZUlPLFxuICB0b1N0YXRlT2JqZWN0OiBub2RlID0+IHtcbiAgICBjb25zdCBzdGF0ZU9iamVjdDogeyBpbmRleDogbnVtYmVyIHwgbnVsbCB9ID0geyBpbmRleDogbnVsbCB9O1xuICAgIGlmICggbm9kZS5wYXJlbnRzWyAwIF0gKSB7XG4gICAgICBhc3NlcnQgJiYgYXNzZXJ0KCBub2RlLnBhcmVudHMubGVuZ3RoID09PSAxLCAnSW5kZXhlZE5vZGVJTyBvbmx5IHN1cHBvcnRzIG5vZGVzIHdpdGggYSBzaW5nbGUgcGFyZW50JyApO1xuICAgICAgc3RhdGVPYmplY3QuaW5kZXggPSBub2RlLnBhcmVudHNbIDAgXS5pbmRleE9mQ2hpbGQoIG5vZGUgKTtcbiAgICB9XG4gICAgcmV0dXJuIHN0YXRlT2JqZWN0O1xuICB9LFxuICBhcHBseVN0YXRlOiAoIG5vZGUsIHN0YXRlT2JqZWN0ICkgPT4ge1xuICAgIGNvbnN0IG5vZGVQYXJlbnQgPSBub2RlLnBhcmVudHNbIDAgXTtcblxuICAgIGlmICggbm9kZVBhcmVudCAmJiBzdGF0ZU9iamVjdC5pbmRleCApIHtcbiAgICAgIGFzc2VydCAmJiBhc3NlcnQoIG5vZGUucGFyZW50cy5sZW5ndGggPT09IDEsICdJbmRleGVkTm9kZUlPIG9ubHkgc3VwcG9ydHMgbm9kZXMgd2l0aCBhIHNpbmdsZSBwYXJlbnQnICk7XG5cbiAgICAgIC8vIFN3YXAgdGhlIGNoaWxkIGF0IHRoZSBkZXN0aW5hdGlvbiBpbmRleCB3aXRoIGN1cnJlbnQgcG9zaXRpb24gb2YgdGhpcyBOb2RlLCB0aGF0IHdheSB0aGUgb3BlcmF0aW9uIGlzIGF0b21pYy5cbiAgICAgIC8vIFRoaXMgaW1wbGVtZW50YXRpb24gYXNzdW1lcyB0aGF0IGFsbCBjaGlsZHJlbiBhcmUgaW5zdHJ1bWVudGVkIEluZGV4ZWROb2RlSU8gaW5zdGFuY2VzIGFuZCBjYW4gaGF2ZSBzdGF0ZSBzZXRcbiAgICAgIC8vIG9uIHRoZW0gdG8gXCJmaXggdGhlbVwiIGFmdGVyIHRoaXMgb3BlcmF0aW9uLiBXaXRob3V0IHRoaXMgaW1wbGVtZW50YXRpb24sIHVzaW5nIE5vZGUubW92ZUNoaWxkVG9JbmRleCBjb3VsZCBibG93XG4gICAgICAvLyBhd2F5IGFub3RoZXIgSW5kZXhlZE5vZGUgc3RhdGUgc2V0LiBTZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3BoLXNjYWxlL2lzc3Vlcy8yMjdcbiAgICAgIGNvbnN0IGNoaWxkcmVuID0gbm9kZVBhcmVudC5jaGlsZHJlbjtcbiAgICAgIGNvbnN0IGN1cnJlbnRJbmRleCA9IG5vZGVQYXJlbnQuaW5kZXhPZkNoaWxkKCBub2RlICk7XG4gICAgICBhc3NlcnQgJiYgYXNzZXJ0KCBzdGF0ZU9iamVjdC5pbmRleCA8IGNoaWxkcmVuLmxlbmd0aCwgJ2luZGV4IGdvZXMgYmV5b25kIG51bWJlciBvZiBjaGlsZHJlbicgKTtcbiAgICAgIGNoaWxkcmVuWyBjdXJyZW50SW5kZXggXSA9IGNoaWxkcmVuWyBzdGF0ZU9iamVjdC5pbmRleCBdO1xuICAgICAgY2hpbGRyZW5bIHN0YXRlT2JqZWN0LmluZGV4IF0gPSBub2RlO1xuICAgICAgbm9kZVBhcmVudC5zZXRDaGlsZHJlbiggY2hpbGRyZW4gKTtcbiAgICB9XG4gIH0sXG4gIHN0YXRlU2NoZW1hOiB7XG4gICAgaW5kZXg6IE51bGxhYmxlSU8oIE51bWJlcklPIClcbiAgfSxcbiAgbWV0aG9kczoge1xuICAgIGxpbmtJbmRleDoge1xuICAgICAgcmV0dXJuVHlwZTogTnVtYmVySU8sXG4gICAgICBwYXJhbWV0ZXJUeXBlczogWyBGdW5jdGlvbklPKCBWb2lkSU8sIFsgTnVtYmVySU8gXSApIF0sXG4gICAgICBkb2N1bWVudGF0aW9uOiAnRm9sbG93aW5nIHRoZSBQcm9wZXJ0eUlPLmxpbmsgcGF0dGVybiwgc3Vic2NyaWJlIGZvciBub3RpZmljYXRpb25zIHdoZW4gdGhlIGluZGV4IGluIHRoZSBwYXJlbnQgJyArXG4gICAgICAgICAgICAgICAgICAgICAnY2hhbmdlcywgYW5kIHJlY2VpdmUgYSBjYWxsYmFjayB3aXRoIHRoZSBjdXJyZW50IHZhbHVlLiAgVGhlIHJldHVybiB2YWx1ZSBpcyBhIG51bWVyaWMgSUQgZm9yIHVzZSAnICtcbiAgICAgICAgICAgICAgICAgICAgICd3aXRoIGNsZWFyTGlua0luZGV4LicsXG4gICAgICBpbXBsZW1lbnRhdGlvbjogZnVuY3Rpb24oIHRoaXM6IE5vZGUsIGxpc3RlbmVyICkge1xuXG4gICAgICAgIC8vIFRoZSBjYWxsYmFjayB3aGljaCBzaWduaWZpZXMgdGhlIGN1cnJlbnQgaW5kZXhcbiAgICAgICAgY29uc3QgY2FsbGJhY2sgPSAoKSA9PiB7XG4gICAgICAgICAgYXNzZXJ0ICYmIGFzc2VydCggdGhpcy5wYXJlbnRzLmxlbmd0aCA9PT0gMSwgJ0luZGV4ZWROb2RlSU8gb25seSBzdXBwb3J0cyBub2RlcyB3aXRoIGEgc2luZ2xlIHBhcmVudCcgKTtcbiAgICAgICAgICBjb25zdCBpbmRleCA9IHRoaXMucGFyZW50c1sgMCBdLmluZGV4T2ZDaGlsZCggdGhpcyApO1xuICAgICAgICAgIGxpc3RlbmVyKCBpbmRleCApO1xuICAgICAgICB9O1xuXG4gICAgICAgIGFzc2VydCAmJiBhc3NlcnQoIHRoaXMucGFyZW50cy5sZW5ndGggPT09IDEsICdJbmRleGVkTm9kZUlPIG9ubHkgc3VwcG9ydHMgbm9kZXMgd2l0aCBhIHNpbmdsZSBwYXJlbnQnICk7XG4gICAgICAgIHRoaXMucGFyZW50c1sgMCBdLmNoaWxkcmVuQ2hhbmdlZEVtaXR0ZXIuYWRkTGlzdGVuZXIoIGNhbGxiYWNrICk7XG4gICAgICAgIGNhbGxiYWNrKCk7XG5cbiAgICAgICAgY29uc3QgbXlJbmRleCA9IGluZGV4O1xuICAgICAgICBtYXBbIG15SW5kZXggXSA9IGNhbGxiYWNrO1xuICAgICAgICBpbmRleCsrO1xuICAgICAgICByZXR1cm4gbXlJbmRleDtcbiAgICAgIH1cbiAgICB9LFxuICAgIHVubGlua0luZGV4OiB7XG4gICAgICByZXR1cm5UeXBlOiBWb2lkSU8sXG4gICAgICBwYXJhbWV0ZXJUeXBlczogWyBOdW1iZXJJTyBdLFxuICAgICAgZG9jdW1lbnRhdGlvbjogJ1VubGluayBhIGxpc3RlbmVyIHRoYXQgaGFzIGJlZW4gYWRkZWQgdXNpbmcgbGlua0luZGV4LCBieSBpdHMgbnVtZXJpY2FsIElEIChsaWtlIHNldFRpbWVvdXQvY2xlYXJUaW1lb3V0KScsXG4gICAgICBpbXBsZW1lbnRhdGlvbjogdW5saW5rSW5kZXhcbiAgICB9LFxuICAgIGNsZWFyTGlua0luZGV4OiB7XG4gICAgICByZXR1cm5UeXBlOiBWb2lkSU8sXG4gICAgICBwYXJhbWV0ZXJUeXBlczogWyBOdW1iZXJJTyBdLFxuICAgICAgZG9jdW1lbnRhdGlvbjogJ0RlcHJlY2F0ZWQsIHNlZSBcInVubGlua0luZGV4XCIuJyxcbiAgICAgIGltcGxlbWVudGF0aW9uOiBmdW5jdGlvbiggdGhpczogTm9kZSwgaW5kZXg6IG51bWJlciApOiB2b2lkIHtcbiAgICAgICAgYXNzZXJ0ICYmIGRlcHJlY2F0aW9uV2FybmluZyggJ2NsZWFyTGlua0luZGV4IGlzIGRlcHJlY2F0ZWQsIHVzZSB1bmxpbmtJbmRleCBpbnN0ZWFkLicsIHRydWUgKTtcbiAgICAgICAgdW5saW5rSW5kZXguY2FsbCggdGhpcywgaW5kZXggKTtcbiAgICAgIH1cbiAgICB9LFxuICAgIG1vdmVGb3J3YXJkOiB7XG4gICAgICByZXR1cm5UeXBlOiBWb2lkSU8sXG4gICAgICBwYXJhbWV0ZXJUeXBlczogW10sXG4gICAgICBpbXBsZW1lbnRhdGlvbjogZnVuY3Rpb24oIHRoaXM6IE5vZGUgKSB7XG4gICAgICAgIHJldHVybiBtb3ZlRm9yd2FyZCggdGhpcyApO1xuICAgICAgfSxcbiAgICAgIGRvY3VtZW50YXRpb246ICdNb3ZlIHRoaXMgTm9kZSBvbmUgaW5kZXggZm9yd2FyZCBpbiBlYWNoIG9mIGl0cyBwYXJlbnRzLCBza2lwcGluZyBpbnZpc2libGUgTm9kZXMuIElmIHRoZSBOb2RlIGlzIGFscmVhZHkgYXQgdGhlIGZyb250LCB0aGlzIGlzIGEgbm8tb3AuJ1xuICAgIH0sXG5cbiAgICBtb3ZlQmFja3dhcmQ6IHtcbiAgICAgIHJldHVyblR5cGU6IFZvaWRJTyxcbiAgICAgIHBhcmFtZXRlclR5cGVzOiBbXSxcbiAgICAgIGltcGxlbWVudGF0aW9uOiBmdW5jdGlvbiggdGhpczogTm9kZSApIHtcbiAgICAgICAgcmV0dXJuIG1vdmVCYWNrd2FyZCggdGhpcyApO1xuICAgICAgfSxcbiAgICAgIGRvY3VtZW50YXRpb246ICdNb3ZlIHRoaXMgTm9kZSBvbmUgaW5kZXggYmFja3dhcmQgaW4gZWFjaCBvZiBpdHMgcGFyZW50cywgc2tpcHBpbmcgaW52aXNpYmxlIE5vZGVzLiBJZiB0aGUgTm9kZSBpcyBhbHJlYWR5IGF0IHRoZSBiYWNrLCB0aGlzIGlzIGEgbm8tb3AuJ1xuICAgIH1cbiAgfVxufSApO1xuXG5zY2VuZXJ5LnJlZ2lzdGVyKCAnSW5kZXhlZE5vZGVJTycsIEluZGV4ZWROb2RlSU8gKTtcbmV4cG9ydCBkZWZhdWx0IEluZGV4ZWROb2RlSU87Il0sIm5hbWVzIjpbImRlcHJlY2F0aW9uV2FybmluZyIsIkZ1bmN0aW9uSU8iLCJJT1R5cGUiLCJOdWxsYWJsZUlPIiwiTnVtYmVySU8iLCJWb2lkSU8iLCJOb2RlIiwic2NlbmVyeSIsIm1hcCIsImluZGV4IiwibW92ZUZvcndhcmQiLCJub2RlIiwiX3BhcmVudHMiLCJmb3JFYWNoIiwicGFyZW50IiwibW92ZUNoaWxkIiwibW92ZUJhY2t3YXJkIiwidW5saW5rSW5kZXgiLCJtZXRob2QiLCJhc3NlcnQiLCJwYXJlbnRzIiwibGVuZ3RoIiwiY2hpbGRyZW5DaGFuZ2VkRW1pdHRlciIsInJlbW92ZUxpc3RlbmVyIiwiY2hpbGQiLCJkZWx0YSIsImluZGV4T2ZDaGlsZCIsInRhcmdldEluZGV4IiwiY2hpbGRyZW4iLCJ2aXNpYmxlIiwibW92ZUNoaWxkVG9JbmRleCIsIm9uSW5kZXhlZE5vZGVJT0NoaWxkTW92ZWQiLCJJbmRleGVkTm9kZUlPIiwidmFsdWVUeXBlIiwiZG9jdW1lbnRhdGlvbiIsInN1cGVydHlwZSIsIk5vZGVJTyIsInRvU3RhdGVPYmplY3QiLCJzdGF0ZU9iamVjdCIsImFwcGx5U3RhdGUiLCJub2RlUGFyZW50IiwiY3VycmVudEluZGV4Iiwic2V0Q2hpbGRyZW4iLCJzdGF0ZVNjaGVtYSIsIm1ldGhvZHMiLCJsaW5rSW5kZXgiLCJyZXR1cm5UeXBlIiwicGFyYW1ldGVyVHlwZXMiLCJpbXBsZW1lbnRhdGlvbiIsImxpc3RlbmVyIiwiY2FsbGJhY2siLCJhZGRMaXN0ZW5lciIsIm15SW5kZXgiLCJjbGVhckxpbmtJbmRleCIsImNhbGwiLCJyZWdpc3RlciJdLCJtYXBwaW5ncyI6IkFBQUEsc0RBQXNEO0FBRXREOzs7Ozs7Ozs7Ozs7OztDQWNDLEdBRUQsT0FBT0Esd0JBQXdCLDhDQUE4QztBQUM3RSxPQUFPQyxnQkFBZ0IseUNBQXlDO0FBQ2hFLE9BQU9DLFlBQVkscUNBQXFDO0FBQ3hELE9BQU9DLGdCQUFnQix5Q0FBeUM7QUFDaEUsT0FBT0MsY0FBYyx1Q0FBdUM7QUFDNUQsT0FBT0MsWUFBWSxxQ0FBcUM7QUFDeEQsU0FBU0MsSUFBSSxFQUFFQyxPQUFPLFFBQVEsZ0JBQWdCO0FBTzlDLGdIQUFnSDtBQUNoSCxNQUFNQyxNQUFrQyxDQUFDO0FBRXpDLGdIQUFnSDtBQUNoSCxJQUFJQyxRQUFRO0FBRVosK0lBQStJO0FBQy9JLFNBQVNDLFlBQWFDLElBQVU7SUFDOUJBLEtBQUtDLFFBQVEsQ0FBQ0MsT0FBTyxDQUFFQyxDQUFBQSxTQUFVQyxVQUFXRCxRQUFpQ0gsTUFBTSxDQUFDO0FB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