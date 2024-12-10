// Copyright 2023-2024, University of Colorado Boulder
/**
 * A Property that will contain a set of all ancestor Nodes of a given Node.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ import TinyEmitter from '../../../axon/js/TinyEmitter.js';
import TinyProperty from '../../../axon/js/TinyProperty.js';
import { scenery } from '../imports.js';
const valueComparisonStrategy = (a, b)=>{
    // Don't fire notifications if it hasn't changed.
    return a.size === b.size && _.every([
        ...a
    ], (node)=>b.has(node));
};
let AncestorNodesProperty = class AncestorNodesProperty extends TinyProperty {
    update() {
        // Nodes that were touched in the scan (we should listen to changes to ANY of these to see if there is a connection
        // or disconnection). This could potentially cause our Property to change
        const nodeSet = new Set();
        // Recursively scan to identify all ancestors
        (function recurse(node) {
            const parents = node.parents;
            parents.forEach((parent)=>{
                nodeSet.add(parent);
                recurse(parent);
            });
        })(this.node);
        // Add in new needed listeners
        nodeSet.forEach((node)=>{
            if (!this.listenedNodeSet.has(node)) {
                this.addNodeListener(node);
            }
        });
        // Remove listeners not needed anymore
        this.listenedNodeSet.forEach((node)=>{
            // NOTE: do NOT remove the listener that is listening to our node for changes (it's not an ancestor, and won't
            // come up in this list)
            if (!nodeSet.has(node) && node !== this.node) {
                this.removeNodeListener(node);
            }
        });
        this.value = nodeSet;
        this.updateEmitter.emit();
    }
    addNodeListener(node) {
        this.listenedNodeSet.add(node);
        node.parentAddedEmitter.addListener(this._nodeUpdateListener);
        node.parentRemovedEmitter.addListener(this._nodeUpdateListener);
    }
    removeNodeListener(node) {
        this.listenedNodeSet.delete(node);
        node.parentAddedEmitter.removeListener(this._nodeUpdateListener);
        node.parentRemovedEmitter.removeListener(this._nodeUpdateListener);
    }
    dispose() {
        this.listenedNodeSet.forEach((node)=>this.removeNodeListener(node));
        super.dispose();
    }
    constructor(node){
        super(new Set()), this.node = node, this.listenedNodeSet = new Set(), this.updateEmitter = new TinyEmitter();
        this.valueComparisonStrategy = valueComparisonStrategy;
        this._nodeUpdateListener = this.update.bind(this);
        // Listen to our own parent changes too (even though we aren't an ancestor)
        this.addNodeListener(node);
        this.update();
    }
};
export { AncestorNodesProperty as default };
scenery.register('AncestorNodesProperty', AncestorNodesProperty);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvdXRpbC9BbmNlc3Rvck5vZGVzUHJvcGVydHkudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjMtMjAyNCwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbi8qKlxuICogQSBQcm9wZXJ0eSB0aGF0IHdpbGwgY29udGFpbiBhIHNldCBvZiBhbGwgYW5jZXN0b3IgTm9kZXMgb2YgYSBnaXZlbiBOb2RlLlxuICpcbiAqIEBhdXRob3IgSm9uYXRoYW4gT2xzb24gPGpvbmF0aGFuLm9sc29uQGNvbG9yYWRvLmVkdT5cbiAqL1xuXG5pbXBvcnQgVGlueUVtaXR0ZXIgZnJvbSAnLi4vLi4vLi4vYXhvbi9qcy9UaW55RW1pdHRlci5qcyc7XG5pbXBvcnQgVGlueVByb3BlcnR5IGZyb20gJy4uLy4uLy4uL2F4b24vanMvVGlueVByb3BlcnR5LmpzJztcbmltcG9ydCB7IE5vZGUsIHNjZW5lcnkgfSBmcm9tICcuLi9pbXBvcnRzLmpzJztcblxuY29uc3QgdmFsdWVDb21wYXJpc29uU3RyYXRlZ3kgPSAoIGE6IFNldDxOb2RlPiwgYjogU2V0PE5vZGU+ICk6IGJvb2xlYW4gPT4ge1xuXG4gIC8vIERvbid0IGZpcmUgbm90aWZpY2F0aW9ucyBpZiBpdCBoYXNuJ3QgY2hhbmdlZC5cbiAgcmV0dXJuIGEuc2l6ZSA9PT0gYi5zaXplICYmIF8uZXZlcnkoIFsgLi4uYSBdLCBub2RlID0+IGIuaGFzKCBub2RlICkgKTtcbn07XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEFuY2VzdG9yTm9kZXNQcm9wZXJ0eSBleHRlbmRzIFRpbnlQcm9wZXJ0eTxTZXQ8Tm9kZT4+IHtcblxuICAvLyBBIHNldCBvZiBub2RlcyB3aGVyZSB3ZSBhcmUgbGlzdGVuaW5nIHRvIHdoZXRoZXIgdGhlaXIgcGFyZW50cyBjaGFuZ2VcbiAgcHJpdmF0ZSByZWFkb25seSBsaXN0ZW5lZE5vZGVTZXQgPSBuZXcgU2V0PE5vZGU+KCk7XG5cbiAgcHJpdmF0ZSByZWFkb25seSBfbm9kZVVwZGF0ZUxpc3RlbmVyOiAoKSA9PiB2b2lkO1xuXG4gIC8vIEZpcmVkIHdoZW5ldmVyIHdlIG5lZWQgdG8gdXBkYXRlIHRoZSBpbnRlcm5hbCB2YWx1ZSAoaS5lLiBhIHBhcmVudCB3YXMgYWRkZWQgb3IgcmVtb3ZlZCBzb21ld2hlcmUgaW4gdGhlIGNoYWluKVxuICBwdWJsaWMgcmVhZG9ubHkgdXBkYXRlRW1pdHRlciA9IG5ldyBUaW55RW1pdHRlcigpO1xuXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggcHVibGljIHJlYWRvbmx5IG5vZGU6IE5vZGUgKSB7XG4gICAgc3VwZXIoIG5ldyBTZXQoKSApO1xuICAgIHRoaXMudmFsdWVDb21wYXJpc29uU3RyYXRlZ3kgPSB2YWx1ZUNvbXBhcmlzb25TdHJhdGVneTtcblxuICAgIHRoaXMuX25vZGVVcGRhdGVMaXN0ZW5lciA9IHRoaXMudXBkYXRlLmJpbmQoIHRoaXMgKTtcblxuICAgIC8vIExpc3RlbiB0byBvdXIgb3duIHBhcmVudCBjaGFuZ2VzIHRvbyAoZXZlbiB0aG91Z2ggd2UgYXJlbid0IGFuIGFuY2VzdG9yKVxuICAgIHRoaXMuYWRkTm9kZUxpc3RlbmVyKCBub2RlICk7XG5cbiAgICB0aGlzLnVwZGF0ZSgpO1xuICB9XG5cbiAgcHJpdmF0ZSB1cGRhdGUoKTogdm9pZCB7XG4gICAgLy8gTm9kZXMgdGhhdCB3ZXJlIHRvdWNoZWQgaW4gdGhlIHNjYW4gKHdlIHNob3VsZCBsaXN0ZW4gdG8gY2hhbmdlcyB0byBBTlkgb2YgdGhlc2UgdG8gc2VlIGlmIHRoZXJlIGlzIGEgY29ubmVjdGlvblxuICAgIC8vIG9yIGRpc2Nvbm5lY3Rpb24pLiBUaGlzIGNvdWxkIHBvdGVudGlhbGx5IGNhdXNlIG91ciBQcm9wZXJ0eSB0byBjaGFuZ2VcbiAgICBjb25zdCBub2RlU2V0ID0gbmV3IFNldDxOb2RlPigpO1xuXG4gICAgLy8gUmVjdXJzaXZlbHkgc2NhbiB0byBpZGVudGlmeSBhbGwgYW5jZXN0b3JzXG4gICAgKCBmdW5jdGlvbiByZWN1cnNlKCBub2RlOiBOb2RlICkge1xuICAgICAgY29uc3QgcGFyZW50cyA9IG5vZGUucGFyZW50cztcblxuICAgICAgcGFyZW50cy5mb3JFYWNoKCBwYXJlbnQgPT4ge1xuICAgICAgICBub2RlU2V0LmFkZCggcGFyZW50ICk7XG4gICAgICAgIHJlY3Vyc2UoIHBhcmVudCApO1xuICAgICAgfSApO1xuICAgIH0gKSggdGhpcy5ub2RlICk7XG5cbiAgICAvLyBBZGQgaW4gbmV3IG5lZWRlZCBsaXN0ZW5lcnNcbiAgICBub2RlU2V0LmZvckVhY2goIG5vZGUgPT4ge1xuICAgICAgaWYgKCAhdGhpcy5saXN0ZW5lZE5vZGVTZXQuaGFzKCBub2RlICkgKSB7XG4gICAgICAgIHRoaXMuYWRkTm9kZUxpc3RlbmVyKCBub2RlICk7XG4gICAgICB9XG4gICAgfSApO1xuXG4gICAgLy8gUmVtb3ZlIGxpc3RlbmVycyBub3QgbmVlZGVkIGFueW1vcmVcbiAgICB0aGlzLmxpc3RlbmVkTm9kZVNldC5mb3JFYWNoKCBub2RlID0+IHtcbiAgICAgIC8vIE5PVEU6IGRvIE5PVCByZW1vdmUgdGhlIGxpc3RlbmVyIHRoYXQgaXMgbGlzdGVuaW5nIHRvIG91ciBub2RlIGZvciBjaGFuZ2VzIChpdCdzIG5vdCBhbiBhbmNlc3RvciwgYW5kIHdvbid0XG4gICAgICAvLyBjb21lIHVwIGluIHRoaXMgbGlzdClcbiAgICAgIGlmICggIW5vZGVTZXQuaGFzKCBub2RlICkgJiYgbm9kZSAhPT0gdGhpcy5ub2RlICkge1xuICAgICAgICB0aGlzLnJlbW92ZU5vZGVMaXN0ZW5lciggbm9kZSApO1xuICAgICAgfVxuICAgIH0gKTtcblxuICAgIHRoaXMudmFsdWUgPSBub2RlU2V0O1xuXG4gICAgdGhpcy51cGRhdGVFbWl0dGVyLmVtaXQoKTtcbiAgfVxuXG4gIHByaXZhdGUgYWRkTm9kZUxpc3RlbmVyKCBub2RlOiBOb2RlICk6IHZvaWQge1xuICAgIHRoaXMubGlzdGVuZWROb2RlU2V0LmFkZCggbm9kZSApO1xuICAgIG5vZGUucGFyZW50QWRkZWRFbWl0dGVyLmFkZExpc3RlbmVyKCB0aGlzLl9ub2RlVXBkYXRlTGlzdGVuZXIgKTtcbiAgICBub2RlLnBhcmVudFJlbW92ZWRFbWl0dGVyLmFkZExpc3RlbmVyKCB0aGlzLl9ub2RlVXBkYXRlTGlzdGVuZXIgKTtcbiAgfVxuXG4gIHByaXZhdGUgcmVtb3ZlTm9kZUxpc3RlbmVyKCBub2RlOiBOb2RlICk6IHZvaWQge1xuICAgIHRoaXMubGlzdGVuZWROb2RlU2V0LmRlbGV0ZSggbm9kZSApO1xuICAgIG5vZGUucGFyZW50QWRkZWRFbWl0dGVyLnJlbW92ZUxpc3RlbmVyKCB0aGlzLl9ub2RlVXBkYXRlTGlzdGVuZXIgKTtcbiAgICBub2RlLnBhcmVudFJlbW92ZWRFbWl0dGVyLnJlbW92ZUxpc3RlbmVyKCB0aGlzLl9ub2RlVXBkYXRlTGlzdGVuZXIgKTtcbiAgfVxuXG4gIHB1YmxpYyBvdmVycmlkZSBkaXNwb3NlKCk6IHZvaWQge1xuICAgIHRoaXMubGlzdGVuZWROb2RlU2V0LmZvckVhY2goIG5vZGUgPT4gdGhpcy5yZW1vdmVOb2RlTGlzdGVuZXIoIG5vZGUgKSApO1xuXG4gICAgc3VwZXIuZGlzcG9zZSgpO1xuICB9XG59XG5cbnNjZW5lcnkucmVnaXN0ZXIoICdBbmNlc3Rvck5vZGVzUHJvcGVydHknLCBBbmNlc3Rvck5vZGVzUHJvcGVydHkgKTsiXSwibmFtZXMiOlsiVGlueUVtaXR0ZXIiLCJUaW55UHJvcGVydHkiLCJzY2VuZXJ5IiwidmFsdWVDb21wYXJpc29uU3RyYXRlZ3kiLCJhIiwiYiIsInNpemUiLCJfIiwiZXZlcnkiLCJub2RlIiwiaGFzIiwiQW5jZXN0b3JOb2Rlc1Byb3BlcnR5IiwidXBkYXRlIiwibm9kZVNldCIsIlNldCIsInJlY3Vyc2UiLCJwYXJlbnRzIiwiZm9yRWFjaCIsInBhcmVudCIsImFkZCIsImxpc3RlbmVkTm9kZVNldCIsImFkZE5vZGVMaXN0ZW5lciIsInJlbW92ZU5vZGVMaXN0ZW5lciIsInZhbHVlIiwidXBkYXRlRW1pdHRlciIsImVtaXQiLCJwYXJlbnRBZGRlZEVtaXR0ZXIiLCJhZGRMaXN0ZW5lciIsIl9ub2RlVXBkYXRlTGlzdGVuZXIiLCJwYXJlbnRSZW1vdmVkRW1pdHRlciIsImRlbGV0ZSIsInJlbW92ZUxpc3RlbmVyIiwiZGlzcG9zZSIsImJpbmQiLCJyZWdpc3RlciJdLCJtYXBwaW5ncyI6IkFBQUEsc0RBQXNEO0FBRXREOzs7O0NBSUMsR0FFRCxPQUFPQSxpQkFBaUIsa0NBQWtDO0FBQzFELE9BQU9DLGtCQUFrQixtQ0FBbUM7QUFDNUQsU0FBZUMsT0FBTyxRQUFRLGdCQUFnQjtBQUU5QyxNQUFNQywwQkFBMEIsQ0FBRUMsR0FBY0M7SUFFOUMsaURBQWlEO0lBQ2pELE9BQU9ELEVBQUVFLElBQUksS0FBS0QsRUFBRUMsSUFBSSxJQUFJQyxFQUFFQyxLQUFLLENBQUU7V0FBS0o7S0FBRyxFQUFFSyxDQUFBQSxPQUFRSixFQUFFSyxHQUFHLENBQUVEO0FBQ2hFO0FBRWUsSUFBQSxBQUFNRSx3QkFBTixNQUFNQSw4QkFBOEJWO0lBc0J6Q1csU0FBZTtRQUNyQixtSEFBbUg7UUFDbkgseUVBQXlFO1FBQ3pFLE1BQU1DLFVBQVUsSUFBSUM7UUFFcEIsNkNBQTZDO1FBQzNDLENBQUEsU0FBU0MsUUFBU04sSUFBVTtZQUM1QixNQUFNTyxVQUFVUCxLQUFLTyxPQUFPO1lBRTVCQSxRQUFRQyxPQUFPLENBQUVDLENBQUFBO2dCQUNmTCxRQUFRTSxHQUFHLENBQUVEO2dCQUNiSCxRQUFTRztZQUNYO1FBQ0YsQ0FBQSxFQUFLLElBQUksQ0FBQ1QsSUFBSTtRQUVkLDhCQUE4QjtRQUM5QkksUUFBUUksT0FBTyxDQUFFUixDQUFBQTtZQUNmLElBQUssQ0FBQyxJQUFJLENBQUNXLGVBQWUsQ0FBQ1YsR0FBRyxDQUFFRCxPQUFTO2dCQUN2QyxJQUFJLENBQUNZLGVBQWUsQ0FBRVo7WUFDeEI7UUFDRjtRQUVBLHNDQUFzQztRQUN0QyxJQUFJLENBQUNXLGVBQWUsQ0FBQ0gsT0FBTyxDQUFFUixDQUFBQTtZQUM1Qiw4R0FBOEc7WUFDOUcsd0JBQXdCO1lBQ3hCLElBQUssQ0FBQ0ksUUFBUUgsR0FBRyxDQUFFRCxTQUFVQSxTQUFTLElBQUksQ0FBQ0EsSUFBSSxFQUFHO2dCQUNoRCxJQUFJLENBQUNhLGtCQUFrQixDQUFFYjtZQUMzQjtRQUNGO1FBRUEsSUFBSSxDQUFDYyxLQUFLLEdBQUdWO1FBRWIsSUFBSSxDQUFDVyxhQUFhLENBQUNDLElBQUk7SUFDekI7SUFFUUosZ0JBQWlCWixJQUFVLEVBQVM7UUFDMUMsSUFBSSxDQUFDVyxlQUFlLENBQUNELEdBQUcsQ0FBRVY7UUFDMUJBLEtBQUtpQixrQkFBa0IsQ0FBQ0MsV0FBVyxDQUFFLElBQUksQ0FBQ0MsbUJBQW1CO1FBQzdEbkIsS0FBS29CLG9CQUFvQixDQUFDRixXQUFXLENBQUUsSUFBSSxDQUFDQyxtQkFBbUI7SUFDakU7SUFFUU4sbUJBQW9CYixJQUFVLEVBQVM7UUFDN0MsSUFBSSxDQUFDVyxlQUFlLENBQUNVLE1BQU0sQ0FBRXJCO1FBQzdCQSxLQUFLaUIsa0JBQWtCLENBQUNLLGNBQWMsQ0FBRSxJQUFJLENBQUNILG1CQUFtQjtRQUNoRW5CLEtBQUtvQixvQkFBb0IsQ0FBQ0UsY0FBYyxDQUFFLElBQUksQ0FBQ0gsbUJBQW1CO0lBQ3BFO0lBRWdCSSxVQUFnQjtRQUM5QixJQUFJLENBQUNaLGVBQWUsQ0FBQ0gsT0FBTyxDQUFFUixDQUFBQSxPQUFRLElBQUksQ0FBQ2Esa0JBQWtCLENBQUViO1FBRS9ELEtBQUssQ0FBQ3VCO0lBQ1I7SUFoRUEsWUFBb0IsQUFBZ0J2QixJQUFVLENBQUc7UUFDL0MsS0FBSyxDQUFFLElBQUlLLGFBRHVCTCxPQUFBQSxXQVBuQlcsa0JBQWtCLElBQUlOLFlBS3ZCVSxnQkFBZ0IsSUFBSXhCO1FBSWxDLElBQUksQ0FBQ0csdUJBQXVCLEdBQUdBO1FBRS9CLElBQUksQ0FBQ3lCLG1CQUFtQixHQUFHLElBQUksQ0FBQ2hCLE1BQU0sQ0FBQ3FCLElBQUksQ0FBRSxJQUFJO1FBRWpELDJFQUEyRTtRQUMzRSxJQUFJLENBQUNaLGVBQWUsQ0FBRVo7UUFFdEIsSUFBSSxDQUFDRyxNQUFNO0lBQ2I7QUF1REY7QUEzRUEsU0FBcUJELG1DQTJFcEI7QUFFRFQsUUFBUWdDLFFBQVEsQ0FBRSx5QkFBeUJ2QiJ9