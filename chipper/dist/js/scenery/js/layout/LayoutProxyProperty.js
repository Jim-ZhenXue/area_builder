// Copyright 2022-2024, University of Colorado Boulder
/**
 * A Property that takes the value of:
 * - a LayoutProxy with the single connected Trail (if it exists)
 * - null if there are zero or 2+ connected Trails between the two Nodes
 *
 * When defined, this will provide a LayoutProxy for the leafNode within the rootNode's local coordinate frame. This
 * will allow positioning the leafNode within the rootNode's coordinate frame (which is ONLY well-defined when there
 * is exactly one trail between the two).
 *
 * Thus, it will only be defined as a proxy if there is a unique trail between the two Nodes. This is needed for layout
 * work, where often we'll need to provide a proxy IF this condition is true, and NO proxy if it's not (since layout
 * would be ambiguous). E.g. for ManualConstraint, if a Node isn't connected to the root, there's nothing the constraint
 * can do.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ import { DerivedProperty1 } from '../../../axon/js/DerivedProperty.js';
import { LayoutProxy, scenery, TrailsBetweenProperty, TransformTracker } from '../imports.js';
let LayoutProxyProperty = class LayoutProxyProperty extends DerivedProperty1 {
    dispose() {
        this.trailsBetweenProperty.dispose();
        this.transformTracker && this.transformTracker.dispose();
        super.dispose();
    }
    /**
   * @param rootNode - The root whose local coordinate frame we'll want the proxy to be in
   * @param leafNode - The leaf that we'll create the proxy for
   * @param providedOptions
   */ constructor(rootNode, leafNode, providedOptions){
        const trailsBetweenProperty = new TrailsBetweenProperty(rootNode, leafNode);
        super([
            trailsBetweenProperty
        ], (trails)=>{
            return trails.length === 1 ? LayoutProxy.pool.create(trails[0].copy().removeAncestor()) : null;
        }), // Should be set if we provide an onTransformChange callback
        this.transformTracker = null;
        this.trailsBetweenProperty = trailsBetweenProperty;
        this.lazyLink((value, oldValue)=>{
            oldValue && oldValue.dispose();
        });
        const onTransformChange = providedOptions == null ? void 0 : providedOptions.onTransformChange;
        if (onTransformChange) {
            this.link((proxy)=>{
                if (this.transformTracker) {
                    this.transformTracker.dispose();
                    this.transformTracker = null;
                }
                if (proxy) {
                    this.transformTracker = new TransformTracker(proxy.trail.copy().addAncestor(rootNode));
                    this.transformTracker.addListener(onTransformChange);
                }
            });
        }
    }
};
export { LayoutProxyProperty as default };
scenery.register('LayoutProxyProperty', LayoutProxyProperty);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvbGF5b3V0L0xheW91dFByb3h5UHJvcGVydHkudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjItMjAyNCwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbi8qKlxuICogQSBQcm9wZXJ0eSB0aGF0IHRha2VzIHRoZSB2YWx1ZSBvZjpcbiAqIC0gYSBMYXlvdXRQcm94eSB3aXRoIHRoZSBzaW5nbGUgY29ubmVjdGVkIFRyYWlsIChpZiBpdCBleGlzdHMpXG4gKiAtIG51bGwgaWYgdGhlcmUgYXJlIHplcm8gb3IgMisgY29ubmVjdGVkIFRyYWlscyBiZXR3ZWVuIHRoZSB0d28gTm9kZXNcbiAqXG4gKiBXaGVuIGRlZmluZWQsIHRoaXMgd2lsbCBwcm92aWRlIGEgTGF5b3V0UHJveHkgZm9yIHRoZSBsZWFmTm9kZSB3aXRoaW4gdGhlIHJvb3ROb2RlJ3MgbG9jYWwgY29vcmRpbmF0ZSBmcmFtZS4gVGhpc1xuICogd2lsbCBhbGxvdyBwb3NpdGlvbmluZyB0aGUgbGVhZk5vZGUgd2l0aGluIHRoZSByb290Tm9kZSdzIGNvb3JkaW5hdGUgZnJhbWUgKHdoaWNoIGlzIE9OTFkgd2VsbC1kZWZpbmVkIHdoZW4gdGhlcmVcbiAqIGlzIGV4YWN0bHkgb25lIHRyYWlsIGJldHdlZW4gdGhlIHR3bykuXG4gKlxuICogVGh1cywgaXQgd2lsbCBvbmx5IGJlIGRlZmluZWQgYXMgYSBwcm94eSBpZiB0aGVyZSBpcyBhIHVuaXF1ZSB0cmFpbCBiZXR3ZWVuIHRoZSB0d28gTm9kZXMuIFRoaXMgaXMgbmVlZGVkIGZvciBsYXlvdXRcbiAqIHdvcmssIHdoZXJlIG9mdGVuIHdlJ2xsIG5lZWQgdG8gcHJvdmlkZSBhIHByb3h5IElGIHRoaXMgY29uZGl0aW9uIGlzIHRydWUsIGFuZCBOTyBwcm94eSBpZiBpdCdzIG5vdCAoc2luY2UgbGF5b3V0XG4gKiB3b3VsZCBiZSBhbWJpZ3VvdXMpLiBFLmcuIGZvciBNYW51YWxDb25zdHJhaW50LCBpZiBhIE5vZGUgaXNuJ3QgY29ubmVjdGVkIHRvIHRoZSByb290LCB0aGVyZSdzIG5vdGhpbmcgdGhlIGNvbnN0cmFpbnRcbiAqIGNhbiBkby5cbiAqXG4gKiBAYXV0aG9yIEpvbmF0aGFuIE9sc29uIDxqb25hdGhhbi5vbHNvbkBjb2xvcmFkby5lZHU+XG4gKi9cblxuaW1wb3J0IHsgRGVyaXZlZFByb3BlcnR5MSB9IGZyb20gJy4uLy4uLy4uL2F4b24vanMvRGVyaXZlZFByb3BlcnR5LmpzJztcbmltcG9ydCB7IExheW91dFByb3h5LCBOb2RlLCBzY2VuZXJ5LCBUcmFpbCwgVHJhaWxzQmV0d2VlblByb3BlcnR5LCBUcmFuc2Zvcm1UcmFja2VyIH0gZnJvbSAnLi4vaW1wb3J0cy5qcyc7XG5cbnR5cGUgU2VsZk9wdGlvbnMgPSB7XG4gIC8vIElmIHByb3ZpZGVkLCB0aGlzIHdpbGwgYmUgY2FsbGVkIHdoZW4gdGhlIHRyYW5zZm9ybSBvZiB0aGUgcHJveHkgY2hhbmdlc1xuICBvblRyYW5zZm9ybUNoYW5nZT86ICgpID0+IHZvaWQ7XG59O1xuXG5leHBvcnQgdHlwZSBMYXlvdXRQcm94eVByb3BlcnR5T3B0aW9ucyA9IFNlbGZPcHRpb25zO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBMYXlvdXRQcm94eVByb3BlcnR5IGV4dGVuZHMgRGVyaXZlZFByb3BlcnR5MTxMYXlvdXRQcm94eSB8IG51bGwsIFRyYWlsW10+IHtcblxuICAvLyBUaGlzIHdpbGwgY29udGFpbiB0aGUgbnVtYmVyIG9mIHRyYWlscyBjb25uZWN0aW5nIG91ciByb290Tm9kZSBhbmQgbGVhZk5vZGUuIE91ciB2YWx1ZSB3aWxsIGJlIHNvbGVseSBiYXNlZCBvZmYgb2ZcbiAgLy8gdGhpcyBQcm9wZXJ0eSdzIHZhbHVlLCBhbmQgaXMgdGh1cyBjcmVhdGVkIGFzIGEgRGVyaXZlZFByb3BlcnR5LlxuICBwcml2YXRlIHJlYWRvbmx5IHRyYWlsc0JldHdlZW5Qcm9wZXJ0eTogVHJhaWxzQmV0d2VlblByb3BlcnR5O1xuXG4gIC8vIFNob3VsZCBiZSBzZXQgaWYgd2UgcHJvdmlkZSBhbiBvblRyYW5zZm9ybUNoYW5nZSBjYWxsYmFja1xuICBwcml2YXRlIHRyYW5zZm9ybVRyYWNrZXI6IFRyYW5zZm9ybVRyYWNrZXIgfCBudWxsID0gbnVsbDtcblxuICAvKipcbiAgICogQHBhcmFtIHJvb3ROb2RlIC0gVGhlIHJvb3Qgd2hvc2UgbG9jYWwgY29vcmRpbmF0ZSBmcmFtZSB3ZSdsbCB3YW50IHRoZSBwcm94eSB0byBiZSBpblxuICAgKiBAcGFyYW0gbGVhZk5vZGUgLSBUaGUgbGVhZiB0aGF0IHdlJ2xsIGNyZWF0ZSB0aGUgcHJveHkgZm9yXG4gICAqIEBwYXJhbSBwcm92aWRlZE9wdGlvbnNcbiAgICovXG4gIHB1YmxpYyBjb25zdHJ1Y3Rvciggcm9vdE5vZGU6IE5vZGUsIGxlYWZOb2RlOiBOb2RlLCBwcm92aWRlZE9wdGlvbnM/OiBMYXlvdXRQcm94eVByb3BlcnR5T3B0aW9ucyApIHtcblxuICAgIGNvbnN0IHRyYWlsc0JldHdlZW5Qcm9wZXJ0eSA9IG5ldyBUcmFpbHNCZXR3ZWVuUHJvcGVydHkoIHJvb3ROb2RlLCBsZWFmTm9kZSApO1xuXG4gICAgc3VwZXIoIFsgdHJhaWxzQmV0d2VlblByb3BlcnR5IF0sIHRyYWlscyA9PiB7XG4gICAgICByZXR1cm4gdHJhaWxzLmxlbmd0aCA9PT0gMSA/IExheW91dFByb3h5LnBvb2wuY3JlYXRlKCB0cmFpbHNbIDAgXS5jb3B5KCkucmVtb3ZlQW5jZXN0b3IoKSApIDogbnVsbDtcbiAgICB9ICk7XG5cbiAgICB0aGlzLnRyYWlsc0JldHdlZW5Qcm9wZXJ0eSA9IHRyYWlsc0JldHdlZW5Qcm9wZXJ0eTtcbiAgICB0aGlzLmxhenlMaW5rKCAoIHZhbHVlLCBvbGRWYWx1ZSApID0+IHtcbiAgICAgIG9sZFZhbHVlICYmIG9sZFZhbHVlLmRpc3Bvc2UoKTtcbiAgICB9ICk7XG5cbiAgICBjb25zdCBvblRyYW5zZm9ybUNoYW5nZSA9IHByb3ZpZGVkT3B0aW9ucz8ub25UcmFuc2Zvcm1DaGFuZ2U7XG4gICAgaWYgKCBvblRyYW5zZm9ybUNoYW5nZSApIHtcbiAgICAgIHRoaXMubGluayggcHJveHkgPT4ge1xuICAgICAgICBpZiAoIHRoaXMudHJhbnNmb3JtVHJhY2tlciApIHtcbiAgICAgICAgICB0aGlzLnRyYW5zZm9ybVRyYWNrZXIuZGlzcG9zZSgpO1xuICAgICAgICAgIHRoaXMudHJhbnNmb3JtVHJhY2tlciA9IG51bGw7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCBwcm94eSApIHtcbiAgICAgICAgICB0aGlzLnRyYW5zZm9ybVRyYWNrZXIgPSBuZXcgVHJhbnNmb3JtVHJhY2tlciggcHJveHkudHJhaWwhLmNvcHkoKS5hZGRBbmNlc3Rvciggcm9vdE5vZGUgKSApO1xuICAgICAgICAgIHRoaXMudHJhbnNmb3JtVHJhY2tlci5hZGRMaXN0ZW5lciggb25UcmFuc2Zvcm1DaGFuZ2UgKTtcbiAgICAgICAgfVxuICAgICAgfSApO1xuICAgIH1cbiAgfVxuXG4gIHB1YmxpYyBvdmVycmlkZSBkaXNwb3NlKCk6IHZvaWQge1xuICAgIHRoaXMudHJhaWxzQmV0d2VlblByb3BlcnR5LmRpc3Bvc2UoKTtcbiAgICB0aGlzLnRyYW5zZm9ybVRyYWNrZXIgJiYgdGhpcy50cmFuc2Zvcm1UcmFja2VyLmRpc3Bvc2UoKTtcblxuICAgIHN1cGVyLmRpc3Bvc2UoKTtcbiAgfVxufVxuXG5zY2VuZXJ5LnJlZ2lzdGVyKCAnTGF5b3V0UHJveHlQcm9wZXJ0eScsIExheW91dFByb3h5UHJvcGVydHkgKTsiXSwibmFtZXMiOlsiRGVyaXZlZFByb3BlcnR5MSIsIkxheW91dFByb3h5Iiwic2NlbmVyeSIsIlRyYWlsc0JldHdlZW5Qcm9wZXJ0eSIsIlRyYW5zZm9ybVRyYWNrZXIiLCJMYXlvdXRQcm94eVByb3BlcnR5IiwiZGlzcG9zZSIsInRyYWlsc0JldHdlZW5Qcm9wZXJ0eSIsInRyYW5zZm9ybVRyYWNrZXIiLCJyb290Tm9kZSIsImxlYWZOb2RlIiwicHJvdmlkZWRPcHRpb25zIiwidHJhaWxzIiwibGVuZ3RoIiwicG9vbCIsImNyZWF0ZSIsImNvcHkiLCJyZW1vdmVBbmNlc3RvciIsImxhenlMaW5rIiwidmFsdWUiLCJvbGRWYWx1ZSIsIm9uVHJhbnNmb3JtQ2hhbmdlIiwibGluayIsInByb3h5IiwidHJhaWwiLCJhZGRBbmNlc3RvciIsImFkZExpc3RlbmVyIiwicmVnaXN0ZXIiXSwibWFwcGluZ3MiOiJBQUFBLHNEQUFzRDtBQUV0RDs7Ozs7Ozs7Ozs7Ozs7O0NBZUMsR0FFRCxTQUFTQSxnQkFBZ0IsUUFBUSxzQ0FBc0M7QUFDdkUsU0FBU0MsV0FBVyxFQUFRQyxPQUFPLEVBQVNDLHFCQUFxQixFQUFFQyxnQkFBZ0IsUUFBUSxnQkFBZ0I7QUFTNUYsSUFBQSxBQUFNQyxzQkFBTixNQUFNQSw0QkFBNEJMO0lBMEMvQk0sVUFBZ0I7UUFDOUIsSUFBSSxDQUFDQyxxQkFBcUIsQ0FBQ0QsT0FBTztRQUNsQyxJQUFJLENBQUNFLGdCQUFnQixJQUFJLElBQUksQ0FBQ0EsZ0JBQWdCLENBQUNGLE9BQU87UUFFdEQsS0FBSyxDQUFDQTtJQUNSO0lBdENBOzs7O0dBSUMsR0FDRCxZQUFvQkcsUUFBYyxFQUFFQyxRQUFjLEVBQUVDLGVBQTRDLENBQUc7UUFFakcsTUFBTUosd0JBQXdCLElBQUlKLHNCQUF1Qk0sVUFBVUM7UUFFbkUsS0FBSyxDQUFFO1lBQUVIO1NBQXVCLEVBQUVLLENBQUFBO1lBQ2hDLE9BQU9BLE9BQU9DLE1BQU0sS0FBSyxJQUFJWixZQUFZYSxJQUFJLENBQUNDLE1BQU0sQ0FBRUgsTUFBTSxDQUFFLEVBQUcsQ0FBQ0ksSUFBSSxHQUFHQyxjQUFjLE1BQU87UUFDaEcsSUFkRiw0REFBNEQ7YUFDcERULG1CQUE0QztRQWVsRCxJQUFJLENBQUNELHFCQUFxQixHQUFHQTtRQUM3QixJQUFJLENBQUNXLFFBQVEsQ0FBRSxDQUFFQyxPQUFPQztZQUN0QkEsWUFBWUEsU0FBU2QsT0FBTztRQUM5QjtRQUVBLE1BQU1lLG9CQUFvQlYsbUNBQUFBLGdCQUFpQlUsaUJBQWlCO1FBQzVELElBQUtBLG1CQUFvQjtZQUN2QixJQUFJLENBQUNDLElBQUksQ0FBRUMsQ0FBQUE7Z0JBQ1QsSUFBSyxJQUFJLENBQUNmLGdCQUFnQixFQUFHO29CQUMzQixJQUFJLENBQUNBLGdCQUFnQixDQUFDRixPQUFPO29CQUM3QixJQUFJLENBQUNFLGdCQUFnQixHQUFHO2dCQUMxQjtnQkFDQSxJQUFLZSxPQUFRO29CQUNYLElBQUksQ0FBQ2YsZ0JBQWdCLEdBQUcsSUFBSUosaUJBQWtCbUIsTUFBTUMsS0FBSyxDQUFFUixJQUFJLEdBQUdTLFdBQVcsQ0FBRWhCO29CQUMvRSxJQUFJLENBQUNELGdCQUFnQixDQUFDa0IsV0FBVyxDQUFFTDtnQkFDckM7WUFDRjtRQUNGO0lBQ0Y7QUFRRjtBQWhEQSxTQUFxQmhCLGlDQWdEcEI7QUFFREgsUUFBUXlCLFFBQVEsQ0FBRSx1QkFBdUJ0QiJ9