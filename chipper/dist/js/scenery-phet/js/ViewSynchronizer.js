// Copyright 2022-2024, University of Colorado Boulder
/**
 * Logic that handles the creation and disposal of model-view pairs.
 *
 * This is helpful to use in cases where you've got to track model-view pairs, and you want to make sure that
 * the view is created/removed when the corresponding model element is created/removed.
 *
 * @author Agustín Vallejo
 * @author Jonathan Olson
 */ import sceneryPhet from './sceneryPhet.js';
let ViewSynchronizer = class ViewSynchronizer {
    /**
   * Adds a model element. An associated view (Node) is created and added to the scene graph.
   */ add(model) {
        const node = this.factory(model);
        this.map.set(model, node);
        this.container.addChild(node);
    }
    /**
   * Removes a model element. Its associated view (Node) is removed from the scene graph and disposed.
   */ remove(model) {
        const node = this.map.get(model);
        this.map.delete(model);
        this.container.removeChild(node);
        node.dispose();
    }
    /**
   * Gets the view (Node) for a specified model element.
   */ getView(model) {
        return this.map.get(model);
    }
    /**
   * Gets the views (Nodes) for all model elements.
   */ getViews() {
        return [
            ...this.map.values()
        ];
    }
    /**
   * Removes all model elements and their associated views (Nodes).
   */ dispose() {
        for (const model of this.map.keys()){
            this.remove(model);
        }
    }
    /**
   * @param container - parent for all Nodes that are created
   * @param factory - function that creates a Node for a given model element
   */ constructor(container, factory){
        this.container = container;
        this.factory = factory;
        this.map = new Map();
    }
};
export { ViewSynchronizer as default };
sceneryPhet.register('ViewSynchronizer', ViewSynchronizer);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9WaWV3U3luY2hyb25pemVyLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDIyLTIwMjQsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIExvZ2ljIHRoYXQgaGFuZGxlcyB0aGUgY3JlYXRpb24gYW5kIGRpc3Bvc2FsIG9mIG1vZGVsLXZpZXcgcGFpcnMuXG4gKlxuICogVGhpcyBpcyBoZWxwZnVsIHRvIHVzZSBpbiBjYXNlcyB3aGVyZSB5b3UndmUgZ290IHRvIHRyYWNrIG1vZGVsLXZpZXcgcGFpcnMsIGFuZCB5b3Ugd2FudCB0byBtYWtlIHN1cmUgdGhhdFxuICogdGhlIHZpZXcgaXMgY3JlYXRlZC9yZW1vdmVkIHdoZW4gdGhlIGNvcnJlc3BvbmRpbmcgbW9kZWwgZWxlbWVudCBpcyBjcmVhdGVkL3JlbW92ZWQuXG4gKlxuICogQGF1dGhvciBBZ3VzdMOtbiBWYWxsZWpvXG4gKiBAYXV0aG9yIEpvbmF0aGFuIE9sc29uXG4gKi9cblxuaW1wb3J0IHsgTm9kZSB9IGZyb20gJy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XG5pbXBvcnQgc2NlbmVyeVBoZXQgZnJvbSAnLi9zY2VuZXJ5UGhldC5qcyc7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFZpZXdTeW5jaHJvbml6ZXI8TW9kZWwsIFZpZXcgZXh0ZW5kcyBOb2RlPiB7XG5cbiAgLy8gTm9kZSB0aGF0IHdpbGwgYmUgdGhlIHBhcmVudCBvZiBhbGwgTm9kZXMgdGhhdCBhcmUgY3JlYXRlZC5cbiAgcHJpdmF0ZSByZWFkb25seSBjb250YWluZXI6IE5vZGU7XG5cbiAgLy8gRmFjdG9yeSBmdW5jdGlvbiB0aGF0IGNyZWF0ZXMgYSB2aWV3IChOb2RlKSBmb3IgYSBnaXZlbiBtb2RlbCBlbGVtZW50LlxuICBwcml2YXRlIHJlYWRvbmx5IGZhY3Rvcnk6ICggeDogTW9kZWwgKSA9PiBWaWV3O1xuXG4gIC8vIE1hcCBmcm9tIG1vZGVsIGVsZW1lbnRzIHRvIHRoZWlyIGFzc29jaWF0ZWQgTm9kZXMuXG4gIHByaXZhdGUgcmVhZG9ubHkgbWFwOiBNYXA8TW9kZWwsIFZpZXc+O1xuXG4gIC8qKlxuICAgKiBAcGFyYW0gY29udGFpbmVyIC0gcGFyZW50IGZvciBhbGwgTm9kZXMgdGhhdCBhcmUgY3JlYXRlZFxuICAgKiBAcGFyYW0gZmFjdG9yeSAtIGZ1bmN0aW9uIHRoYXQgY3JlYXRlcyBhIE5vZGUgZm9yIGEgZ2l2ZW4gbW9kZWwgZWxlbWVudFxuICAgKi9cbiAgcHVibGljIGNvbnN0cnVjdG9yKCBjb250YWluZXI6IE5vZGUsIGZhY3Rvcnk6ICggeDogTW9kZWwgKSA9PiBWaWV3ICkge1xuICAgIHRoaXMuY29udGFpbmVyID0gY29udGFpbmVyO1xuICAgIHRoaXMuZmFjdG9yeSA9IGZhY3Rvcnk7XG4gICAgdGhpcy5tYXAgPSBuZXcgTWFwPE1vZGVsLCBWaWV3PigpO1xuICB9XG5cbiAgLyoqXG4gICAqIEFkZHMgYSBtb2RlbCBlbGVtZW50LiBBbiBhc3NvY2lhdGVkIHZpZXcgKE5vZGUpIGlzIGNyZWF0ZWQgYW5kIGFkZGVkIHRvIHRoZSBzY2VuZSBncmFwaC5cbiAgICovXG4gIHB1YmxpYyBhZGQoIG1vZGVsOiBNb2RlbCApOiB2b2lkIHtcbiAgICBjb25zdCBub2RlID0gdGhpcy5mYWN0b3J5KCBtb2RlbCApO1xuICAgIHRoaXMubWFwLnNldCggbW9kZWwsIG5vZGUgKTtcbiAgICB0aGlzLmNvbnRhaW5lci5hZGRDaGlsZCggbm9kZSApO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlbW92ZXMgYSBtb2RlbCBlbGVtZW50LiBJdHMgYXNzb2NpYXRlZCB2aWV3IChOb2RlKSBpcyByZW1vdmVkIGZyb20gdGhlIHNjZW5lIGdyYXBoIGFuZCBkaXNwb3NlZC5cbiAgICovXG4gIHB1YmxpYyByZW1vdmUoIG1vZGVsOiBNb2RlbCApOiB2b2lkIHtcbiAgICBjb25zdCBub2RlID0gdGhpcy5tYXAuZ2V0KCBtb2RlbCApITtcbiAgICB0aGlzLm1hcC5kZWxldGUoIG1vZGVsICk7XG4gICAgdGhpcy5jb250YWluZXIucmVtb3ZlQ2hpbGQoIG5vZGUgKTtcbiAgICBub2RlLmRpc3Bvc2UoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXRzIHRoZSB2aWV3IChOb2RlKSBmb3IgYSBzcGVjaWZpZWQgbW9kZWwgZWxlbWVudC5cbiAgICovXG4gIHB1YmxpYyBnZXRWaWV3KCBtb2RlbDogTW9kZWwgKTogVmlldyB7XG4gICAgcmV0dXJuIHRoaXMubWFwLmdldCggbW9kZWwgKSE7XG4gIH1cblxuICAvKipcbiAgICogR2V0cyB0aGUgdmlld3MgKE5vZGVzKSBmb3IgYWxsIG1vZGVsIGVsZW1lbnRzLlxuICAgKi9cbiAgcHVibGljIGdldFZpZXdzKCk6IFZpZXdbXSB7XG4gICAgcmV0dXJuIFsgLi4udGhpcy5tYXAudmFsdWVzKCkgXTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZW1vdmVzIGFsbCBtb2RlbCBlbGVtZW50cyBhbmQgdGhlaXIgYXNzb2NpYXRlZCB2aWV3cyAoTm9kZXMpLlxuICAgKi9cbiAgcHVibGljIGRpc3Bvc2UoKTogdm9pZCB7XG4gICAgZm9yICggY29uc3QgbW9kZWwgb2YgdGhpcy5tYXAua2V5cygpICkge1xuICAgICAgdGhpcy5yZW1vdmUoIG1vZGVsICk7XG4gICAgfVxuICB9XG59XG5cbnNjZW5lcnlQaGV0LnJlZ2lzdGVyKCAnVmlld1N5bmNocm9uaXplcicsIFZpZXdTeW5jaHJvbml6ZXIgKTsiXSwibmFtZXMiOlsic2NlbmVyeVBoZXQiLCJWaWV3U3luY2hyb25pemVyIiwiYWRkIiwibW9kZWwiLCJub2RlIiwiZmFjdG9yeSIsIm1hcCIsInNldCIsImNvbnRhaW5lciIsImFkZENoaWxkIiwicmVtb3ZlIiwiZ2V0IiwiZGVsZXRlIiwicmVtb3ZlQ2hpbGQiLCJkaXNwb3NlIiwiZ2V0VmlldyIsImdldFZpZXdzIiwidmFsdWVzIiwia2V5cyIsIk1hcCIsInJlZ2lzdGVyIl0sIm1hcHBpbmdzIjoiQUFBQSxzREFBc0Q7QUFFdEQ7Ozs7Ozs7O0NBUUMsR0FHRCxPQUFPQSxpQkFBaUIsbUJBQW1CO0FBRTVCLElBQUEsQUFBTUMsbUJBQU4sTUFBTUE7SUFxQm5COztHQUVDLEdBQ0QsQUFBT0MsSUFBS0MsS0FBWSxFQUFTO1FBQy9CLE1BQU1DLE9BQU8sSUFBSSxDQUFDQyxPQUFPLENBQUVGO1FBQzNCLElBQUksQ0FBQ0csR0FBRyxDQUFDQyxHQUFHLENBQUVKLE9BQU9DO1FBQ3JCLElBQUksQ0FBQ0ksU0FBUyxDQUFDQyxRQUFRLENBQUVMO0lBQzNCO0lBRUE7O0dBRUMsR0FDRCxBQUFPTSxPQUFRUCxLQUFZLEVBQVM7UUFDbEMsTUFBTUMsT0FBTyxJQUFJLENBQUNFLEdBQUcsQ0FBQ0ssR0FBRyxDQUFFUjtRQUMzQixJQUFJLENBQUNHLEdBQUcsQ0FBQ00sTUFBTSxDQUFFVDtRQUNqQixJQUFJLENBQUNLLFNBQVMsQ0FBQ0ssV0FBVyxDQUFFVDtRQUM1QkEsS0FBS1UsT0FBTztJQUNkO0lBRUE7O0dBRUMsR0FDRCxBQUFPQyxRQUFTWixLQUFZLEVBQVM7UUFDbkMsT0FBTyxJQUFJLENBQUNHLEdBQUcsQ0FBQ0ssR0FBRyxDQUFFUjtJQUN2QjtJQUVBOztHQUVDLEdBQ0QsQUFBT2EsV0FBbUI7UUFDeEIsT0FBTztlQUFLLElBQUksQ0FBQ1YsR0FBRyxDQUFDVyxNQUFNO1NBQUk7SUFDakM7SUFFQTs7R0FFQyxHQUNELEFBQU9ILFVBQWdCO1FBQ3JCLEtBQU0sTUFBTVgsU0FBUyxJQUFJLENBQUNHLEdBQUcsQ0FBQ1ksSUFBSSxHQUFLO1lBQ3JDLElBQUksQ0FBQ1IsTUFBTSxDQUFFUDtRQUNmO0lBQ0Y7SUFsREE7OztHQUdDLEdBQ0QsWUFBb0JLLFNBQWUsRUFBRUgsT0FBNkIsQ0FBRztRQUNuRSxJQUFJLENBQUNHLFNBQVMsR0FBR0E7UUFDakIsSUFBSSxDQUFDSCxPQUFPLEdBQUdBO1FBQ2YsSUFBSSxDQUFDQyxHQUFHLEdBQUcsSUFBSWE7SUFDakI7QUEyQ0Y7QUE5REEsU0FBcUJsQiw4QkE4RHBCO0FBRURELFlBQVlvQixRQUFRLENBQUUsb0JBQW9CbkIifQ==