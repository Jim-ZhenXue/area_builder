// Copyright 2022-2024, University of Colorado Boulder
/**
 * A Property that will synchronously contain all Trails between two nodes (in a root-leaf direction).
 * Listens from the child to the parent (since we tend to branch much less that way).
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ import TinyProperty from '../../../axon/js/TinyProperty.js';
import { scenery, Trail } from '../imports.js';
let TrailsBetweenProperty = class TrailsBetweenProperty extends TinyProperty {
    update() {
        // Trails accumulated in our recursion that will be our Property's value
        const trails = [];
        // Nodes that were touched in the scan (we should listen to changes to ANY of these to see if there is a connection
        // or disconnection. This could potentially cause our Property to change
        const nodeSet = new Set();
        // Modified in-place during the search
        const trail = new Trail(this.leafNode);
        const rootNode = this.rootNode;
        (function recurse() {
            const root = trail.rootNode();
            nodeSet.add(root);
            if (root === rootNode) {
                // Create a permanent copy that won't be mutated
                trails.push(trail.copy());
            }
            root.parents.forEach((parent)=>{
                trail.addAncestor(parent);
                recurse();
                trail.removeAncestor();
            });
        })();
        // Add in new needed listeners
        nodeSet.forEach((node)=>{
            if (!this.listenedNodeSet.has(node)) {
                this.addNodeListener(node);
            }
        });
        // Remove listeners not needed anymore
        this.listenedNodeSet.forEach((node)=>{
            if (!nodeSet.has(node)) {
                this.removeNodeListener(node);
            }
        });
        // Guard in a way that deepEquality on the Property wouldn't (because of the Array wrapper)
        const currentTrails = this.value;
        let trailsEqual = currentTrails.length === trails.length;
        if (trailsEqual) {
            for(let i = 0; i < trails.length; i++){
                if (!currentTrails[i].equals(trails[i])) {
                    trailsEqual = false;
                    break;
                }
            }
        }
        if (!trailsEqual) {
            this.value = trails;
        }
    }
    addNodeListener(node) {
        this.listenedNodeSet.add(node);
        node.parentAddedEmitter.addListener(this._trailUpdateListener);
        node.parentRemovedEmitter.addListener(this._trailUpdateListener);
    }
    removeNodeListener(node) {
        this.listenedNodeSet.delete(node);
        node.parentAddedEmitter.removeListener(this._trailUpdateListener);
        node.parentRemovedEmitter.removeListener(this._trailUpdateListener);
    }
    dispose() {
        this.listenedNodeSet.forEach((node)=>this.removeNodeListener(node));
        super.dispose();
    }
    constructor(rootNode, leafNode){
        super([]), this.listenedNodeSet = new Set();
        this.rootNode = rootNode;
        this.leafNode = leafNode;
        this._trailUpdateListener = this.update.bind(this);
        this.update();
    }
};
export { TrailsBetweenProperty as default };
scenery.register('TrailsBetweenProperty', TrailsBetweenProperty);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvdXRpbC9UcmFpbHNCZXR3ZWVuUHJvcGVydHkudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjItMjAyNCwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbi8qKlxuICogQSBQcm9wZXJ0eSB0aGF0IHdpbGwgc3luY2hyb25vdXNseSBjb250YWluIGFsbCBUcmFpbHMgYmV0d2VlbiB0d28gbm9kZXMgKGluIGEgcm9vdC1sZWFmIGRpcmVjdGlvbikuXG4gKiBMaXN0ZW5zIGZyb20gdGhlIGNoaWxkIHRvIHRoZSBwYXJlbnQgKHNpbmNlIHdlIHRlbmQgdG8gYnJhbmNoIG11Y2ggbGVzcyB0aGF0IHdheSkuXG4gKlxuICogQGF1dGhvciBKb25hdGhhbiBPbHNvbiA8am9uYXRoYW4ub2xzb25AY29sb3JhZG8uZWR1PlxuICovXG5cbmltcG9ydCBUaW55UHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vYXhvbi9qcy9UaW55UHJvcGVydHkuanMnO1xuaW1wb3J0IHsgTm9kZSwgc2NlbmVyeSwgVHJhaWwgfSBmcm9tICcuLi9pbXBvcnRzLmpzJztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgVHJhaWxzQmV0d2VlblByb3BlcnR5IGV4dGVuZHMgVGlueVByb3BlcnR5PFRyYWlsW10+IHtcblxuICBwdWJsaWMgcmVhZG9ubHkgcm9vdE5vZGU6IE5vZGU7XG4gIHB1YmxpYyByZWFkb25seSBsZWFmTm9kZTogTm9kZTtcbiAgcHVibGljIHJlYWRvbmx5IGxpc3RlbmVkTm9kZVNldDogU2V0PE5vZGU+ID0gbmV3IFNldDxOb2RlPigpO1xuICBwcml2YXRlIHJlYWRvbmx5IF90cmFpbFVwZGF0ZUxpc3RlbmVyOiAoKSA9PiB2b2lkO1xuXG4gIHB1YmxpYyBjb25zdHJ1Y3Rvciggcm9vdE5vZGU6IE5vZGUsIGxlYWZOb2RlOiBOb2RlICkge1xuICAgIHN1cGVyKCBbXSApO1xuXG4gICAgdGhpcy5yb290Tm9kZSA9IHJvb3ROb2RlO1xuICAgIHRoaXMubGVhZk5vZGUgPSBsZWFmTm9kZTtcblxuICAgIHRoaXMuX3RyYWlsVXBkYXRlTGlzdGVuZXIgPSB0aGlzLnVwZGF0ZS5iaW5kKCB0aGlzICk7XG5cbiAgICB0aGlzLnVwZGF0ZSgpO1xuICB9XG5cbiAgcHJpdmF0ZSB1cGRhdGUoKTogdm9pZCB7XG4gICAgLy8gVHJhaWxzIGFjY3VtdWxhdGVkIGluIG91ciByZWN1cnNpb24gdGhhdCB3aWxsIGJlIG91ciBQcm9wZXJ0eSdzIHZhbHVlXG4gICAgY29uc3QgdHJhaWxzOiBUcmFpbFtdID0gW107XG5cbiAgICAvLyBOb2RlcyB0aGF0IHdlcmUgdG91Y2hlZCBpbiB0aGUgc2NhbiAod2Ugc2hvdWxkIGxpc3RlbiB0byBjaGFuZ2VzIHRvIEFOWSBvZiB0aGVzZSB0byBzZWUgaWYgdGhlcmUgaXMgYSBjb25uZWN0aW9uXG4gICAgLy8gb3IgZGlzY29ubmVjdGlvbi4gVGhpcyBjb3VsZCBwb3RlbnRpYWxseSBjYXVzZSBvdXIgUHJvcGVydHkgdG8gY2hhbmdlXG4gICAgY29uc3Qgbm9kZVNldCA9IG5ldyBTZXQ8Tm9kZT4oKTtcblxuICAgIC8vIE1vZGlmaWVkIGluLXBsYWNlIGR1cmluZyB0aGUgc2VhcmNoXG4gICAgY29uc3QgdHJhaWwgPSBuZXcgVHJhaWwoIHRoaXMubGVhZk5vZGUgKTtcblxuICAgIGNvbnN0IHJvb3ROb2RlID0gdGhpcy5yb290Tm9kZTtcbiAgICAoIGZ1bmN0aW9uIHJlY3Vyc2UoKSB7XG4gICAgICBjb25zdCByb290ID0gdHJhaWwucm9vdE5vZGUoKTtcblxuICAgICAgbm9kZVNldC5hZGQoIHJvb3QgKTtcblxuICAgICAgaWYgKCByb290ID09PSByb290Tm9kZSApIHtcbiAgICAgICAgLy8gQ3JlYXRlIGEgcGVybWFuZW50IGNvcHkgdGhhdCB3b24ndCBiZSBtdXRhdGVkXG4gICAgICAgIHRyYWlscy5wdXNoKCB0cmFpbC5jb3B5KCkgKTtcbiAgICAgIH1cblxuICAgICAgcm9vdC5wYXJlbnRzLmZvckVhY2goIHBhcmVudCA9PiB7XG4gICAgICAgIHRyYWlsLmFkZEFuY2VzdG9yKCBwYXJlbnQgKTtcbiAgICAgICAgcmVjdXJzZSgpO1xuICAgICAgICB0cmFpbC5yZW1vdmVBbmNlc3RvcigpO1xuICAgICAgfSApO1xuICAgIH0gKSgpO1xuXG4gICAgLy8gQWRkIGluIG5ldyBuZWVkZWQgbGlzdGVuZXJzXG4gICAgbm9kZVNldC5mb3JFYWNoKCBub2RlID0+IHtcbiAgICAgIGlmICggIXRoaXMubGlzdGVuZWROb2RlU2V0Lmhhcyggbm9kZSApICkge1xuICAgICAgICB0aGlzLmFkZE5vZGVMaXN0ZW5lciggbm9kZSApO1xuICAgICAgfVxuICAgIH0gKTtcblxuICAgIC8vIFJlbW92ZSBsaXN0ZW5lcnMgbm90IG5lZWRlZCBhbnltb3JlXG4gICAgdGhpcy5saXN0ZW5lZE5vZGVTZXQuZm9yRWFjaCggbm9kZSA9PiB7XG4gICAgICBpZiAoICFub2RlU2V0Lmhhcyggbm9kZSApICkge1xuICAgICAgICB0aGlzLnJlbW92ZU5vZGVMaXN0ZW5lciggbm9kZSApO1xuICAgICAgfVxuICAgIH0gKTtcblxuICAgIC8vIEd1YXJkIGluIGEgd2F5IHRoYXQgZGVlcEVxdWFsaXR5IG9uIHRoZSBQcm9wZXJ0eSB3b3VsZG4ndCAoYmVjYXVzZSBvZiB0aGUgQXJyYXkgd3JhcHBlcilcbiAgICBjb25zdCBjdXJyZW50VHJhaWxzID0gdGhpcy52YWx1ZTtcbiAgICBsZXQgdHJhaWxzRXF1YWwgPSBjdXJyZW50VHJhaWxzLmxlbmd0aCA9PT0gdHJhaWxzLmxlbmd0aDtcbiAgICBpZiAoIHRyYWlsc0VxdWFsICkge1xuICAgICAgZm9yICggbGV0IGkgPSAwOyBpIDwgdHJhaWxzLmxlbmd0aDsgaSsrICkge1xuICAgICAgICBpZiAoICFjdXJyZW50VHJhaWxzWyBpIF0uZXF1YWxzKCB0cmFpbHNbIGkgXSApICkge1xuICAgICAgICAgIHRyYWlsc0VxdWFsID0gZmFsc2U7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoICF0cmFpbHNFcXVhbCApIHtcbiAgICAgIHRoaXMudmFsdWUgPSB0cmFpbHM7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBhZGROb2RlTGlzdGVuZXIoIG5vZGU6IE5vZGUgKTogdm9pZCB7XG4gICAgdGhpcy5saXN0ZW5lZE5vZGVTZXQuYWRkKCBub2RlICk7XG4gICAgbm9kZS5wYXJlbnRBZGRlZEVtaXR0ZXIuYWRkTGlzdGVuZXIoIHRoaXMuX3RyYWlsVXBkYXRlTGlzdGVuZXIgKTtcbiAgICBub2RlLnBhcmVudFJlbW92ZWRFbWl0dGVyLmFkZExpc3RlbmVyKCB0aGlzLl90cmFpbFVwZGF0ZUxpc3RlbmVyICk7XG4gIH1cblxuICBwcml2YXRlIHJlbW92ZU5vZGVMaXN0ZW5lciggbm9kZTogTm9kZSApOiB2b2lkIHtcbiAgICB0aGlzLmxpc3RlbmVkTm9kZVNldC5kZWxldGUoIG5vZGUgKTtcbiAgICBub2RlLnBhcmVudEFkZGVkRW1pdHRlci5yZW1vdmVMaXN0ZW5lciggdGhpcy5fdHJhaWxVcGRhdGVMaXN0ZW5lciApO1xuICAgIG5vZGUucGFyZW50UmVtb3ZlZEVtaXR0ZXIucmVtb3ZlTGlzdGVuZXIoIHRoaXMuX3RyYWlsVXBkYXRlTGlzdGVuZXIgKTtcbiAgfVxuXG4gIHB1YmxpYyBvdmVycmlkZSBkaXNwb3NlKCk6IHZvaWQge1xuICAgIHRoaXMubGlzdGVuZWROb2RlU2V0LmZvckVhY2goIG5vZGUgPT4gdGhpcy5yZW1vdmVOb2RlTGlzdGVuZXIoIG5vZGUgKSApO1xuXG4gICAgc3VwZXIuZGlzcG9zZSgpO1xuICB9XG59XG5cbnNjZW5lcnkucmVnaXN0ZXIoICdUcmFpbHNCZXR3ZWVuUHJvcGVydHknLCBUcmFpbHNCZXR3ZWVuUHJvcGVydHkgKTsiXSwibmFtZXMiOlsiVGlueVByb3BlcnR5Iiwic2NlbmVyeSIsIlRyYWlsIiwiVHJhaWxzQmV0d2VlblByb3BlcnR5IiwidXBkYXRlIiwidHJhaWxzIiwibm9kZVNldCIsIlNldCIsInRyYWlsIiwibGVhZk5vZGUiLCJyb290Tm9kZSIsInJlY3Vyc2UiLCJyb290IiwiYWRkIiwicHVzaCIsImNvcHkiLCJwYXJlbnRzIiwiZm9yRWFjaCIsInBhcmVudCIsImFkZEFuY2VzdG9yIiwicmVtb3ZlQW5jZXN0b3IiLCJub2RlIiwibGlzdGVuZWROb2RlU2V0IiwiaGFzIiwiYWRkTm9kZUxpc3RlbmVyIiwicmVtb3ZlTm9kZUxpc3RlbmVyIiwiY3VycmVudFRyYWlscyIsInZhbHVlIiwidHJhaWxzRXF1YWwiLCJsZW5ndGgiLCJpIiwiZXF1YWxzIiwicGFyZW50QWRkZWRFbWl0dGVyIiwiYWRkTGlzdGVuZXIiLCJfdHJhaWxVcGRhdGVMaXN0ZW5lciIsInBhcmVudFJlbW92ZWRFbWl0dGVyIiwiZGVsZXRlIiwicmVtb3ZlTGlzdGVuZXIiLCJkaXNwb3NlIiwiYmluZCIsInJlZ2lzdGVyIl0sIm1hcHBpbmdzIjoiQUFBQSxzREFBc0Q7QUFFdEQ7Ozs7O0NBS0MsR0FFRCxPQUFPQSxrQkFBa0IsbUNBQW1DO0FBQzVELFNBQWVDLE9BQU8sRUFBRUMsS0FBSyxRQUFRLGdCQUFnQjtBQUV0QyxJQUFBLEFBQU1DLHdCQUFOLE1BQU1BLDhCQUE4Qkg7SUFrQnpDSSxTQUFlO1FBQ3JCLHdFQUF3RTtRQUN4RSxNQUFNQyxTQUFrQixFQUFFO1FBRTFCLG1IQUFtSDtRQUNuSCx3RUFBd0U7UUFDeEUsTUFBTUMsVUFBVSxJQUFJQztRQUVwQixzQ0FBc0M7UUFDdEMsTUFBTUMsUUFBUSxJQUFJTixNQUFPLElBQUksQ0FBQ08sUUFBUTtRQUV0QyxNQUFNQyxXQUFXLElBQUksQ0FBQ0EsUUFBUTtRQUM1QixDQUFBLFNBQVNDO1lBQ1QsTUFBTUMsT0FBT0osTUFBTUUsUUFBUTtZQUUzQkosUUFBUU8sR0FBRyxDQUFFRDtZQUViLElBQUtBLFNBQVNGLFVBQVc7Z0JBQ3ZCLGdEQUFnRDtnQkFDaERMLE9BQU9TLElBQUksQ0FBRU4sTUFBTU8sSUFBSTtZQUN6QjtZQUVBSCxLQUFLSSxPQUFPLENBQUNDLE9BQU8sQ0FBRUMsQ0FBQUE7Z0JBQ3BCVixNQUFNVyxXQUFXLENBQUVEO2dCQUNuQlA7Z0JBQ0FILE1BQU1ZLGNBQWM7WUFDdEI7UUFDRixDQUFBO1FBRUEsOEJBQThCO1FBQzlCZCxRQUFRVyxPQUFPLENBQUVJLENBQUFBO1lBQ2YsSUFBSyxDQUFDLElBQUksQ0FBQ0MsZUFBZSxDQUFDQyxHQUFHLENBQUVGLE9BQVM7Z0JBQ3ZDLElBQUksQ0FBQ0csZUFBZSxDQUFFSDtZQUN4QjtRQUNGO1FBRUEsc0NBQXNDO1FBQ3RDLElBQUksQ0FBQ0MsZUFBZSxDQUFDTCxPQUFPLENBQUVJLENBQUFBO1lBQzVCLElBQUssQ0FBQ2YsUUFBUWlCLEdBQUcsQ0FBRUYsT0FBUztnQkFDMUIsSUFBSSxDQUFDSSxrQkFBa0IsQ0FBRUo7WUFDM0I7UUFDRjtRQUVBLDJGQUEyRjtRQUMzRixNQUFNSyxnQkFBZ0IsSUFBSSxDQUFDQyxLQUFLO1FBQ2hDLElBQUlDLGNBQWNGLGNBQWNHLE1BQU0sS0FBS3hCLE9BQU93QixNQUFNO1FBQ3hELElBQUtELGFBQWM7WUFDakIsSUFBTSxJQUFJRSxJQUFJLEdBQUdBLElBQUl6QixPQUFPd0IsTUFBTSxFQUFFQyxJQUFNO2dCQUN4QyxJQUFLLENBQUNKLGFBQWEsQ0FBRUksRUFBRyxDQUFDQyxNQUFNLENBQUUxQixNQUFNLENBQUV5QixFQUFHLEdBQUs7b0JBQy9DRixjQUFjO29CQUNkO2dCQUNGO1lBQ0Y7UUFDRjtRQUVBLElBQUssQ0FBQ0EsYUFBYztZQUNsQixJQUFJLENBQUNELEtBQUssR0FBR3RCO1FBQ2Y7SUFDRjtJQUVRbUIsZ0JBQWlCSCxJQUFVLEVBQVM7UUFDMUMsSUFBSSxDQUFDQyxlQUFlLENBQUNULEdBQUcsQ0FBRVE7UUFDMUJBLEtBQUtXLGtCQUFrQixDQUFDQyxXQUFXLENBQUUsSUFBSSxDQUFDQyxvQkFBb0I7UUFDOURiLEtBQUtjLG9CQUFvQixDQUFDRixXQUFXLENBQUUsSUFBSSxDQUFDQyxvQkFBb0I7SUFDbEU7SUFFUVQsbUJBQW9CSixJQUFVLEVBQVM7UUFDN0MsSUFBSSxDQUFDQyxlQUFlLENBQUNjLE1BQU0sQ0FBRWY7UUFDN0JBLEtBQUtXLGtCQUFrQixDQUFDSyxjQUFjLENBQUUsSUFBSSxDQUFDSCxvQkFBb0I7UUFDakViLEtBQUtjLG9CQUFvQixDQUFDRSxjQUFjLENBQUUsSUFBSSxDQUFDSCxvQkFBb0I7SUFDckU7SUFFZ0JJLFVBQWdCO1FBQzlCLElBQUksQ0FBQ2hCLGVBQWUsQ0FBQ0wsT0FBTyxDQUFFSSxDQUFBQSxPQUFRLElBQUksQ0FBQ0ksa0JBQWtCLENBQUVKO1FBRS9ELEtBQUssQ0FBQ2lCO0lBQ1I7SUF2RkEsWUFBb0I1QixRQUFjLEVBQUVELFFBQWMsQ0FBRztRQUNuRCxLQUFLLENBQUUsRUFBRSxRQUpLYSxrQkFBNkIsSUFBSWY7UUFNL0MsSUFBSSxDQUFDRyxRQUFRLEdBQUdBO1FBQ2hCLElBQUksQ0FBQ0QsUUFBUSxHQUFHQTtRQUVoQixJQUFJLENBQUN5QixvQkFBb0IsR0FBRyxJQUFJLENBQUM5QixNQUFNLENBQUNtQyxJQUFJLENBQUUsSUFBSTtRQUVsRCxJQUFJLENBQUNuQyxNQUFNO0lBQ2I7QUErRUY7QUEvRkEsU0FBcUJELG1DQStGcEI7QUFFREYsUUFBUXVDLFFBQVEsQ0FBRSx5QkFBeUJyQyJ9