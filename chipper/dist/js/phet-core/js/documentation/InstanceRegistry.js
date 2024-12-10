// Copyright 2018-2024, University of Colorado Boulder
/**
 * Tracks object allocations for reporting using binder.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */ import phetCore from '../phetCore.js';
function registerImplementation(instance, key, map) {
    instance.toDataURL((dataURL)=>{
        map[key].push(dataURL);
    });
}
let InstanceRegistry = class InstanceRegistry {
    /**
   * Adds a screenshot of the given scenery Node
   */ static registerDataURL(repoName, typeName, instance) {
        if (phet.chipper.queryParameters.binder) {
            // Create the map if we haven't seen that component type before
            const key = `${repoName}/${typeName}`;
            InstanceRegistry.componentMap[key] = InstanceRegistry.componentMap[key] || [];
            try {
                if (instance.boundsProperty.value.isFinite()) {
                    registerImplementation(instance, key, InstanceRegistry.componentMap);
                } else {
                    const boundsListener = (bounds)=>{
                        if (bounds.isFinite()) {
                            registerImplementation(instance, key, InstanceRegistry.componentMap);
                            instance.boundsProperty.unlink(boundsListener); // less for memory, and more to not double add
                        }
                    };
                    instance.boundsProperty.lazyLink(boundsListener);
                }
            } catch (e) {
            // Ignore nodes that don't draw anything
            // TODO https://github.com/phetsims/phet-core/issues/80 is this masking a problem?
            }
        }
    }
    /**
   * Register a toolbox pattern node. There is no strict class for this, so this factored out method can be used by any constructor
   */ static registerToolbox(instance) {
        if (phet.chipper.queryParameters.binder) {
            InstanceRegistry.registerDataURL('sun', 'ToolboxPattern', instance);
        }
    }
    /**
   * Register a Hotkey for binder documentation.
   */ static registerHotkey(hotkeyData) {
        if (phet.chipper.queryParameters.binder) {
            InstanceRegistry.hotkeys.push(hotkeyData.serialize());
        }
    }
};
// Per named component, store image URIs of what their usages look like
InstanceRegistry.componentMap = {};
// An array of all Hotkeys that have been registered.
InstanceRegistry.hotkeys = [];
phetCore.register('InstanceRegistry', InstanceRegistry);
export default InstanceRegistry;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9kb2N1bWVudGF0aW9uL0luc3RhbmNlUmVnaXN0cnkudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTgtMjAyNCwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbi8qKlxuICogVHJhY2tzIG9iamVjdCBhbGxvY2F0aW9ucyBmb3IgcmVwb3J0aW5nIHVzaW5nIGJpbmRlci5cbiAqXG4gKiBAYXV0aG9yIFNhbSBSZWlkIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxuICogQGF1dGhvciBNaWNoYWVsIEthdXptYW5uIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxuICovXG5cbmltcG9ydCBUUmVhZE9ubHlQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi9heG9uL2pzL1RSZWFkT25seVByb3BlcnR5LmpzJztcbmltcG9ydCBCb3VuZHMyIGZyb20gJy4uLy4uLy4uL2RvdC9qcy9Cb3VuZHMyLmpzJztcbmltcG9ydCBwaGV0Q29yZSBmcm9tICcuLi9waGV0Q29yZS5qcyc7XG5cbnR5cGUgTm9kZUxpa2UgPSB7XG4gIHRvRGF0YVVSTDogKCBjYWxsYmFjazogKCBkYXRhOiBzdHJpbmcgKSA9PiB2b2lkICkgPT4gdm9pZDtcbiAgYm91bmRzUHJvcGVydHk6IFRSZWFkT25seVByb3BlcnR5PEJvdW5kczI+O1xufTtcblxudHlwZSBDb21wb25lbnRNYXAgPSBSZWNvcmQ8c3RyaW5nLCBzdHJpbmdbXT47XG5cbi8vIEEgZHVjayB0eXBlIGZvciBIb3RrZXlEYXRhIGluIHNjZW5lcnksIHdoaWNoIHdlIGNhbm5vdCBpbXBvcnQgaW50byBwaGV0LWNvcmUuXG50eXBlIEhvdGtleURhdGEgPSB7XG4gIGtleVN0cmluZ1Byb3BlcnRpZXM6IFRSZWFkT25seVByb3BlcnR5PHN0cmluZz5bXTtcbiAga2V5Ym9hcmRIZWxwRGlhbG9nTGFiZWxTdHJpbmdQcm9wZXJ0eTogVFJlYWRPbmx5UHJvcGVydHk8c3RyaW5nPiB8IG51bGw7XG4gIHNlcmlhbGl6ZTogKCkgPT4gU2VyaWFsaXplZEhvdGtleURhdGE7XG59O1xuXG4vLyBUaGUgZXhwZWN0ZWQgc2VyaWFsaXplZCB0eXBlIGZvciBIb3RrZXlEYXRhIHRvIHBhc3Mgb3ZlciB0byBiaW5kZXIuXG50eXBlIFNlcmlhbGl6ZWRIb3RrZXlEYXRhID0ge1xuICBrZXlTdHJpbmdzOiBzdHJpbmdbXTtcbiAgcmVwb05hbWU6IHN0cmluZztcbiAgYmluZGVyTmFtZTogc3RyaW5nO1xuICBnbG9iYWw6IGJvb2xlYW47XG59O1xuXG5mdW5jdGlvbiByZWdpc3RlckltcGxlbWVudGF0aW9uKCBpbnN0YW5jZTogTm9kZUxpa2UsIGtleTogc3RyaW5nLCBtYXA6IENvbXBvbmVudE1hcCApOiB2b2lkIHtcbiAgaW5zdGFuY2UudG9EYXRhVVJMKCBkYXRhVVJMID0+IHtcbiAgICBtYXBbIGtleSBdLnB1c2goIGRhdGFVUkwgKTtcbiAgfSApO1xufVxuXG5jbGFzcyBJbnN0YW5jZVJlZ2lzdHJ5IHtcblxuICAvLyBQZXIgbmFtZWQgY29tcG9uZW50LCBzdG9yZSBpbWFnZSBVUklzIG9mIHdoYXQgdGhlaXIgdXNhZ2VzIGxvb2sgbGlrZVxuICBwdWJsaWMgc3RhdGljIGNvbXBvbmVudE1hcDogQ29tcG9uZW50TWFwID0ge307XG5cbiAgLy8gQW4gYXJyYXkgb2YgYWxsIEhvdGtleXMgdGhhdCBoYXZlIGJlZW4gcmVnaXN0ZXJlZC5cbiAgcHVibGljIHN0YXRpYyBob3RrZXlzOiBTZXJpYWxpemVkSG90a2V5RGF0YVtdID0gW107XG5cbiAgLyoqXG4gICAqIEFkZHMgYSBzY3JlZW5zaG90IG9mIHRoZSBnaXZlbiBzY2VuZXJ5IE5vZGVcbiAgICovXG4gIHB1YmxpYyBzdGF0aWMgcmVnaXN0ZXJEYXRhVVJMKCByZXBvTmFtZTogc3RyaW5nLCB0eXBlTmFtZTogc3RyaW5nLCBpbnN0YW5jZTogTm9kZUxpa2UgKTogdm9pZCB7XG4gICAgaWYgKCBwaGV0LmNoaXBwZXIucXVlcnlQYXJhbWV0ZXJzLmJpbmRlciApIHtcblxuICAgICAgLy8gQ3JlYXRlIHRoZSBtYXAgaWYgd2UgaGF2ZW4ndCBzZWVuIHRoYXQgY29tcG9uZW50IHR5cGUgYmVmb3JlXG4gICAgICBjb25zdCBrZXkgPSBgJHtyZXBvTmFtZX0vJHt0eXBlTmFtZX1gO1xuICAgICAgSW5zdGFuY2VSZWdpc3RyeS5jb21wb25lbnRNYXBbIGtleSBdID0gSW5zdGFuY2VSZWdpc3RyeS5jb21wb25lbnRNYXBbIGtleSBdIHx8IFtdO1xuXG4gICAgICB0cnkge1xuICAgICAgICBpZiAoIGluc3RhbmNlLmJvdW5kc1Byb3BlcnR5LnZhbHVlLmlzRmluaXRlKCkgKSB7XG4gICAgICAgICAgcmVnaXN0ZXJJbXBsZW1lbnRhdGlvbiggaW5zdGFuY2UsIGtleSwgSW5zdGFuY2VSZWdpc3RyeS5jb21wb25lbnRNYXAgKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICBjb25zdCBib3VuZHNMaXN0ZW5lciA9ICggYm91bmRzOiBCb3VuZHMyICkgPT4ge1xuICAgICAgICAgICAgaWYgKCBib3VuZHMuaXNGaW5pdGUoKSApIHtcbiAgICAgICAgICAgICAgcmVnaXN0ZXJJbXBsZW1lbnRhdGlvbiggaW5zdGFuY2UsIGtleSwgSW5zdGFuY2VSZWdpc3RyeS5jb21wb25lbnRNYXAgKTtcbiAgICAgICAgICAgICAgaW5zdGFuY2UuYm91bmRzUHJvcGVydHkudW5saW5rKCBib3VuZHNMaXN0ZW5lciApOyAvLyBsZXNzIGZvciBtZW1vcnksIGFuZCBtb3JlIHRvIG5vdCBkb3VibGUgYWRkXG4gICAgICAgICAgICB9XG4gICAgICAgICAgfTtcbiAgICAgICAgICBpbnN0YW5jZS5ib3VuZHNQcm9wZXJ0eS5sYXp5TGluayggYm91bmRzTGlzdGVuZXIgKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgY2F0Y2goIGUgKSB7XG5cbiAgICAgICAgLy8gSWdub3JlIG5vZGVzIHRoYXQgZG9uJ3QgZHJhdyBhbnl0aGluZ1xuICAgICAgICAvLyBUT0RPIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9waGV0LWNvcmUvaXNzdWVzLzgwIGlzIHRoaXMgbWFza2luZyBhIHByb2JsZW0/XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFJlZ2lzdGVyIGEgdG9vbGJveCBwYXR0ZXJuIG5vZGUuIFRoZXJlIGlzIG5vIHN0cmljdCBjbGFzcyBmb3IgdGhpcywgc28gdGhpcyBmYWN0b3JlZCBvdXQgbWV0aG9kIGNhbiBiZSB1c2VkIGJ5IGFueSBjb25zdHJ1Y3RvclxuICAgKi9cbiAgcHVibGljIHN0YXRpYyByZWdpc3RlclRvb2xib3goIGluc3RhbmNlOiBOb2RlTGlrZSApOiB2b2lkIHtcbiAgICBpZiAoIHBoZXQuY2hpcHBlci5xdWVyeVBhcmFtZXRlcnMuYmluZGVyICkge1xuICAgICAgSW5zdGFuY2VSZWdpc3RyeS5yZWdpc3RlckRhdGFVUkwoICdzdW4nLCAnVG9vbGJveFBhdHRlcm4nLCBpbnN0YW5jZSApO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBSZWdpc3RlciBhIEhvdGtleSBmb3IgYmluZGVyIGRvY3VtZW50YXRpb24uXG4gICAqL1xuICBwdWJsaWMgc3RhdGljIHJlZ2lzdGVySG90a2V5KCBob3RrZXlEYXRhOiBIb3RrZXlEYXRhICk6IHZvaWQge1xuICAgIGlmICggcGhldC5jaGlwcGVyLnF1ZXJ5UGFyYW1ldGVycy5iaW5kZXIgKSB7XG4gICAgICBJbnN0YW5jZVJlZ2lzdHJ5LmhvdGtleXMucHVzaCggaG90a2V5RGF0YS5zZXJpYWxpemUoKSApO1xuICAgIH1cbiAgfVxufVxuXG5waGV0Q29yZS5yZWdpc3RlciggJ0luc3RhbmNlUmVnaXN0cnknLCBJbnN0YW5jZVJlZ2lzdHJ5ICk7XG5cbmV4cG9ydCBkZWZhdWx0IEluc3RhbmNlUmVnaXN0cnk7Il0sIm5hbWVzIjpbInBoZXRDb3JlIiwicmVnaXN0ZXJJbXBsZW1lbnRhdGlvbiIsImluc3RhbmNlIiwia2V5IiwibWFwIiwidG9EYXRhVVJMIiwiZGF0YVVSTCIsInB1c2giLCJJbnN0YW5jZVJlZ2lzdHJ5IiwicmVnaXN0ZXJEYXRhVVJMIiwicmVwb05hbWUiLCJ0eXBlTmFtZSIsInBoZXQiLCJjaGlwcGVyIiwicXVlcnlQYXJhbWV0ZXJzIiwiYmluZGVyIiwiY29tcG9uZW50TWFwIiwiYm91bmRzUHJvcGVydHkiLCJ2YWx1ZSIsImlzRmluaXRlIiwiYm91bmRzTGlzdGVuZXIiLCJib3VuZHMiLCJ1bmxpbmsiLCJsYXp5TGluayIsImUiLCJyZWdpc3RlclRvb2xib3giLCJyZWdpc3RlckhvdGtleSIsImhvdGtleURhdGEiLCJob3RrZXlzIiwic2VyaWFsaXplIiwicmVnaXN0ZXIiXSwibWFwcGluZ3MiOiJBQUFBLHNEQUFzRDtBQUV0RDs7Ozs7Q0FLQyxHQUlELE9BQU9BLGNBQWMsaUJBQWlCO0FBd0J0QyxTQUFTQyx1QkFBd0JDLFFBQWtCLEVBQUVDLEdBQVcsRUFBRUMsR0FBaUI7SUFDakZGLFNBQVNHLFNBQVMsQ0FBRUMsQ0FBQUE7UUFDbEJGLEdBQUcsQ0FBRUQsSUFBSyxDQUFDSSxJQUFJLENBQUVEO0lBQ25CO0FBQ0Y7QUFFQSxJQUFBLEFBQU1FLG1CQUFOLE1BQU1BO0lBUUo7O0dBRUMsR0FDRCxPQUFjQyxnQkFBaUJDLFFBQWdCLEVBQUVDLFFBQWdCLEVBQUVULFFBQWtCLEVBQVM7UUFDNUYsSUFBS1UsS0FBS0MsT0FBTyxDQUFDQyxlQUFlLENBQUNDLE1BQU0sRUFBRztZQUV6QywrREFBK0Q7WUFDL0QsTUFBTVosTUFBTSxHQUFHTyxTQUFTLENBQUMsRUFBRUMsVUFBVTtZQUNyQ0gsaUJBQWlCUSxZQUFZLENBQUViLElBQUssR0FBR0ssaUJBQWlCUSxZQUFZLENBQUViLElBQUssSUFBSSxFQUFFO1lBRWpGLElBQUk7Z0JBQ0YsSUFBS0QsU0FBU2UsY0FBYyxDQUFDQyxLQUFLLENBQUNDLFFBQVEsSUFBSztvQkFDOUNsQix1QkFBd0JDLFVBQVVDLEtBQUtLLGlCQUFpQlEsWUFBWTtnQkFDdEUsT0FDSztvQkFDSCxNQUFNSSxpQkFBaUIsQ0FBRUM7d0JBQ3ZCLElBQUtBLE9BQU9GLFFBQVEsSUFBSzs0QkFDdkJsQix1QkFBd0JDLFVBQVVDLEtBQUtLLGlCQUFpQlEsWUFBWTs0QkFDcEVkLFNBQVNlLGNBQWMsQ0FBQ0ssTUFBTSxDQUFFRixpQkFBa0IsOENBQThDO3dCQUNsRztvQkFDRjtvQkFDQWxCLFNBQVNlLGNBQWMsQ0FBQ00sUUFBUSxDQUFFSDtnQkFDcEM7WUFDRixFQUNBLE9BQU9JLEdBQUk7WUFFVCx3Q0FBd0M7WUFDeEMsa0ZBQWtGO1lBQ3BGO1FBQ0Y7SUFDRjtJQUVBOztHQUVDLEdBQ0QsT0FBY0MsZ0JBQWlCdkIsUUFBa0IsRUFBUztRQUN4RCxJQUFLVSxLQUFLQyxPQUFPLENBQUNDLGVBQWUsQ0FBQ0MsTUFBTSxFQUFHO1lBQ3pDUCxpQkFBaUJDLGVBQWUsQ0FBRSxPQUFPLGtCQUFrQlA7UUFDN0Q7SUFDRjtJQUVBOztHQUVDLEdBQ0QsT0FBY3dCLGVBQWdCQyxVQUFzQixFQUFTO1FBQzNELElBQUtmLEtBQUtDLE9BQU8sQ0FBQ0MsZUFBZSxDQUFDQyxNQUFNLEVBQUc7WUFDekNQLGlCQUFpQm9CLE9BQU8sQ0FBQ3JCLElBQUksQ0FBRW9CLFdBQVdFLFNBQVM7UUFDckQ7SUFDRjtBQUNGO0FBdkRFLHVFQUF1RTtBQUZuRXJCLGlCQUdVUSxlQUE2QixDQUFDO0FBRTVDLHFEQUFxRDtBQUxqRFIsaUJBTVVvQixVQUFrQyxFQUFFO0FBcURwRDVCLFNBQVM4QixRQUFRLENBQUUsb0JBQW9CdEI7QUFFdkMsZUFBZUEsaUJBQWlCIn0=