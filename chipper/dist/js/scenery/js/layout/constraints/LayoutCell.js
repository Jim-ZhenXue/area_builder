// Copyright 2022-2024, University of Colorado Boulder
/**
 * A configurable cell containing a Node used for more permanent layouts
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ import Orientation from '../../../../phet-core/js/Orientation.js';
import { LayoutProxyProperty, scenery } from '../../imports.js';
let LayoutCell = class LayoutCell {
    // Can't be abstract, we're using mixins :(
    onLayoutOptionsChange() {
    // Lint rule not needed here
    }
    /**
   * (scenery-internal)
   */ get node() {
        return this._node;
    }
    /**
   * (scenery-internal)
   */ isConnected() {
        return this._proxy !== null;
    }
    /**
   * (scenery-internal)
   */ get proxy() {
        assert && assert(this._proxy);
        return this._proxy;
    }
    /**
   * (scenery-internal)
   */ isSizable(orientation) {
        return orientation === Orientation.HORIZONTAL ? this.proxy.widthSizable : this.proxy.heightSizable;
    }
    /**
   * Releases references
   */ dispose() {
        this.layoutProxyProperty && this.layoutProxyProperty.dispose();
        this.node.layoutOptionsChangedEmitter.removeListener(this.layoutOptionsListener);
    }
    /**
   * NOTE: Consider this scenery-internal AND protected. It's effectively a protected constructor for an abstract type,
   * but cannot be due to how mixins constrain things (TypeScript doesn't work with private/protected things like this)
   *
   * NOTE: Methods can be marked as protected, however!
   *
   * (scenery-internal)
   *
   * @param constraint
   * @param node
   * @param proxy - If not provided, LayoutProxies will be computed and updated based on the ancestorNode of the
   *                constraint. This includes more work, and ideally should be avoided for things like FlowBox/GridBox
   *                (but will be needed by ManualConstraint or other direct LayoutConstraint usage)
   */ constructor(constraint, node, proxy){
        if (proxy) {
            this.layoutProxyProperty = null;
            this._proxy = proxy;
        } else {
            this._proxy = null;
            // If a LayoutProxy is not provided, we'll listen to (a) all the trails between our ancestor and this node,
            // (b) construct layout proxies for it (and assign here), and (c) listen to ancestor transforms to refresh
            // the layout when needed.
            this.layoutProxyProperty = new LayoutProxyProperty(constraint.ancestorNode, node, {
                onTransformChange: ()=>constraint.updateLayoutAutomatically()
            });
            this.layoutProxyProperty.link((proxy)=>{
                this._proxy = proxy;
                constraint.updateLayoutAutomatically();
            });
        }
        this._constraint = constraint;
        this._node = node;
        this.layoutOptionsListener = this.onLayoutOptionsChange.bind(this);
        this.node.layoutOptionsChangedEmitter.addListener(this.layoutOptionsListener);
    }
};
// NOTE: This would be an abstract class, but that is incompatible with how mixin constraints work in TypeScript
export { LayoutCell as default };
scenery.register('LayoutCell', LayoutCell);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvbGF5b3V0L2NvbnN0cmFpbnRzL0xheW91dENlbGwudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjItMjAyNCwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbi8qKlxuICogQSBjb25maWd1cmFibGUgY2VsbCBjb250YWluaW5nIGEgTm9kZSB1c2VkIGZvciBtb3JlIHBlcm1hbmVudCBsYXlvdXRzXG4gKlxuICogQGF1dGhvciBKb25hdGhhbiBPbHNvbiA8am9uYXRoYW4ub2xzb25AY29sb3JhZG8uZWR1PlxuICovXG5cbmltcG9ydCBPcmllbnRhdGlvbiBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvT3JpZW50YXRpb24uanMnO1xuaW1wb3J0IHsgTGF5b3V0Q29uc3RyYWludCwgTGF5b3V0UHJveHksIExheW91dFByb3h5UHJvcGVydHksIE5vZGUsIHNjZW5lcnkgfSBmcm9tICcuLi8uLi9pbXBvcnRzLmpzJztcblxuLy8gTk9URTogVGhpcyB3b3VsZCBiZSBhbiBhYnN0cmFjdCBjbGFzcywgYnV0IHRoYXQgaXMgaW5jb21wYXRpYmxlIHdpdGggaG93IG1peGluIGNvbnN0cmFpbnRzIHdvcmsgaW4gVHlwZVNjcmlwdFxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgTGF5b3V0Q2VsbCB7XG5cbiAgLy8gV2UgbWlnaHQgbmVlZCB0byBub3RpZnkgdGhlIGNvbnN0cmFpbnQgaXQgbmVlZHMgYSBsYXlvdXRcbiAgcHJpdmF0ZSByZWFkb25seSBfY29uc3RyYWludDogTGF5b3V0Q29uc3RyYWludDtcblxuICBwcml2YXRlIHJlYWRvbmx5IF9ub2RlOiBOb2RlO1xuXG4gIC8vIE91ciBwcm94eSB3aWxsIGJlIGR5bmFtaWNhbGx5IGNvbXB1dGVkIGFuZCB1cGRhdGVkIChiYXNlZCBvbiB3aGV0aGVyIHRoZXJlIGlzIGEgdmFsaWQgYW5jZXN0b3JOb2RlPT5ub2RlIHRyYWlsKVxuICAvLyBHZW5lcmFsbHkgdXNlZCB0byBjb21wdXRlIGxheW91dCBpbiB0aGUgbm9kZSdzIHBhcmVudCBjb29yZGluYXRlIGZyYW1lLlxuICBwcml2YXRlIF9wcm94eTogTGF5b3V0UHJveHkgfCBudWxsO1xuXG4gIC8vIENhbGxlZCB3aGVuIGxheW91dE9wdGlvbnMgY2hhbmdlcyBmb3Igb3VyIE5vZGVcbiAgcHJpdmF0ZSByZWFkb25seSBsYXlvdXRPcHRpb25zTGlzdGVuZXI6ICgpID0+IHZvaWQ7XG5cbiAgLy8gSWYgd2UncmUgbm90IHByb3ZpZGVkIGEgKHN0YXRpYykgTGF5b3V0UHJveHkgaW4gb3VyIGNvbnN0cnVjdG9yLCB3ZSdsbCB0cmFjayBhbmQgZ2VuZXJhdGUgTGF5b3V0UHJveGllcyB3aXRoIHRoaXMuXG4gIHByaXZhdGUgcmVhZG9ubHkgbGF5b3V0UHJveHlQcm9wZXJ0eTogTGF5b3V0UHJveHlQcm9wZXJ0eSB8IG51bGw7XG5cbiAgLyoqXG4gICAqIE5PVEU6IENvbnNpZGVyIHRoaXMgc2NlbmVyeS1pbnRlcm5hbCBBTkQgcHJvdGVjdGVkLiBJdCdzIGVmZmVjdGl2ZWx5IGEgcHJvdGVjdGVkIGNvbnN0cnVjdG9yIGZvciBhbiBhYnN0cmFjdCB0eXBlLFxuICAgKiBidXQgY2Fubm90IGJlIGR1ZSB0byBob3cgbWl4aW5zIGNvbnN0cmFpbiB0aGluZ3MgKFR5cGVTY3JpcHQgZG9lc24ndCB3b3JrIHdpdGggcHJpdmF0ZS9wcm90ZWN0ZWQgdGhpbmdzIGxpa2UgdGhpcylcbiAgICpcbiAgICogTk9URTogTWV0aG9kcyBjYW4gYmUgbWFya2VkIGFzIHByb3RlY3RlZCwgaG93ZXZlciFcbiAgICpcbiAgICogKHNjZW5lcnktaW50ZXJuYWwpXG4gICAqXG4gICAqIEBwYXJhbSBjb25zdHJhaW50XG4gICAqIEBwYXJhbSBub2RlXG4gICAqIEBwYXJhbSBwcm94eSAtIElmIG5vdCBwcm92aWRlZCwgTGF5b3V0UHJveGllcyB3aWxsIGJlIGNvbXB1dGVkIGFuZCB1cGRhdGVkIGJhc2VkIG9uIHRoZSBhbmNlc3Rvck5vZGUgb2YgdGhlXG4gICAqICAgICAgICAgICAgICAgIGNvbnN0cmFpbnQuIFRoaXMgaW5jbHVkZXMgbW9yZSB3b3JrLCBhbmQgaWRlYWxseSBzaG91bGQgYmUgYXZvaWRlZCBmb3IgdGhpbmdzIGxpa2UgRmxvd0JveC9HcmlkQm94XG4gICAqICAgICAgICAgICAgICAgIChidXQgd2lsbCBiZSBuZWVkZWQgYnkgTWFudWFsQ29uc3RyYWludCBvciBvdGhlciBkaXJlY3QgTGF5b3V0Q29uc3RyYWludCB1c2FnZSlcbiAgICovXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggY29uc3RyYWludDogTGF5b3V0Q29uc3RyYWludCwgbm9kZTogTm9kZSwgcHJveHk6IExheW91dFByb3h5IHwgbnVsbCApIHtcbiAgICBpZiAoIHByb3h5ICkge1xuICAgICAgdGhpcy5sYXlvdXRQcm94eVByb3BlcnR5ID0gbnVsbDtcbiAgICAgIHRoaXMuX3Byb3h5ID0gcHJveHk7XG4gICAgfVxuICAgIGVsc2Uge1xuXG4gICAgICB0aGlzLl9wcm94eSA9IG51bGw7XG5cbiAgICAgIC8vIElmIGEgTGF5b3V0UHJveHkgaXMgbm90IHByb3ZpZGVkLCB3ZSdsbCBsaXN0ZW4gdG8gKGEpIGFsbCB0aGUgdHJhaWxzIGJldHdlZW4gb3VyIGFuY2VzdG9yIGFuZCB0aGlzIG5vZGUsXG4gICAgICAvLyAoYikgY29uc3RydWN0IGxheW91dCBwcm94aWVzIGZvciBpdCAoYW5kIGFzc2lnbiBoZXJlKSwgYW5kIChjKSBsaXN0ZW4gdG8gYW5jZXN0b3IgdHJhbnNmb3JtcyB0byByZWZyZXNoXG4gICAgICAvLyB0aGUgbGF5b3V0IHdoZW4gbmVlZGVkLlxuICAgICAgdGhpcy5sYXlvdXRQcm94eVByb3BlcnR5ID0gbmV3IExheW91dFByb3h5UHJvcGVydHkoIGNvbnN0cmFpbnQuYW5jZXN0b3JOb2RlLCBub2RlLCB7XG4gICAgICAgIG9uVHJhbnNmb3JtQ2hhbmdlOiAoKSA9PiBjb25zdHJhaW50LnVwZGF0ZUxheW91dEF1dG9tYXRpY2FsbHkoKVxuICAgICAgfSApO1xuICAgICAgdGhpcy5sYXlvdXRQcm94eVByb3BlcnR5LmxpbmsoIHByb3h5ID0+IHtcbiAgICAgICAgdGhpcy5fcHJveHkgPSBwcm94eTtcblxuICAgICAgICBjb25zdHJhaW50LnVwZGF0ZUxheW91dEF1dG9tYXRpY2FsbHkoKTtcbiAgICAgIH0gKTtcbiAgICB9XG5cbiAgICB0aGlzLl9jb25zdHJhaW50ID0gY29uc3RyYWludDtcbiAgICB0aGlzLl9ub2RlID0gbm9kZTtcblxuICAgIHRoaXMubGF5b3V0T3B0aW9uc0xpc3RlbmVyID0gdGhpcy5vbkxheW91dE9wdGlvbnNDaGFuZ2UuYmluZCggdGhpcyApO1xuICAgIHRoaXMubm9kZS5sYXlvdXRPcHRpb25zQ2hhbmdlZEVtaXR0ZXIuYWRkTGlzdGVuZXIoIHRoaXMubGF5b3V0T3B0aW9uc0xpc3RlbmVyICk7XG4gIH1cblxuICAvLyBDYW4ndCBiZSBhYnN0cmFjdCwgd2UncmUgdXNpbmcgbWl4aW5zIDooXG4gIHByb3RlY3RlZCBvbkxheW91dE9wdGlvbnNDaGFuZ2UoKTogdm9pZCB7XG4gICAgLy8gTGludCBydWxlIG5vdCBuZWVkZWQgaGVyZVxuICB9XG5cbiAgLyoqXG4gICAqIChzY2VuZXJ5LWludGVybmFsKVxuICAgKi9cbiAgcHVibGljIGdldCBub2RlKCk6IE5vZGUge1xuICAgIHJldHVybiB0aGlzLl9ub2RlO1xuICB9XG5cbiAgLyoqXG4gICAqIChzY2VuZXJ5LWludGVybmFsKVxuICAgKi9cbiAgcHVibGljIGlzQ29ubmVjdGVkKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLl9wcm94eSAhPT0gbnVsbDtcbiAgfVxuXG4gIC8qKlxuICAgKiAoc2NlbmVyeS1pbnRlcm5hbClcbiAgICovXG4gIHB1YmxpYyBnZXQgcHJveHkoKTogTGF5b3V0UHJveHkge1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIHRoaXMuX3Byb3h5ICk7XG5cbiAgICByZXR1cm4gdGhpcy5fcHJveHkhO1xuICB9XG5cbiAgLyoqXG4gICAqIChzY2VuZXJ5LWludGVybmFsKVxuICAgKi9cbiAgcHVibGljIGlzU2l6YWJsZSggb3JpZW50YXRpb246IE9yaWVudGF0aW9uICk6IGJvb2xlYW4ge1xuICAgIHJldHVybiBvcmllbnRhdGlvbiA9PT0gT3JpZW50YXRpb24uSE9SSVpPTlRBTCA/IHRoaXMucHJveHkud2lkdGhTaXphYmxlIDogdGhpcy5wcm94eS5oZWlnaHRTaXphYmxlO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlbGVhc2VzIHJlZmVyZW5jZXNcbiAgICovXG4gIHB1YmxpYyBkaXNwb3NlKCk6IHZvaWQge1xuICAgIHRoaXMubGF5b3V0UHJveHlQcm9wZXJ0eSAmJiB0aGlzLmxheW91dFByb3h5UHJvcGVydHkuZGlzcG9zZSgpO1xuXG4gICAgdGhpcy5ub2RlLmxheW91dE9wdGlvbnNDaGFuZ2VkRW1pdHRlci5yZW1vdmVMaXN0ZW5lciggdGhpcy5sYXlvdXRPcHRpb25zTGlzdGVuZXIgKTtcbiAgfVxufVxuXG5zY2VuZXJ5LnJlZ2lzdGVyKCAnTGF5b3V0Q2VsbCcsIExheW91dENlbGwgKTsiXSwibmFtZXMiOlsiT3JpZW50YXRpb24iLCJMYXlvdXRQcm94eVByb3BlcnR5Iiwic2NlbmVyeSIsIkxheW91dENlbGwiLCJvbkxheW91dE9wdGlvbnNDaGFuZ2UiLCJub2RlIiwiX25vZGUiLCJpc0Nvbm5lY3RlZCIsIl9wcm94eSIsInByb3h5IiwiYXNzZXJ0IiwiaXNTaXphYmxlIiwib3JpZW50YXRpb24iLCJIT1JJWk9OVEFMIiwid2lkdGhTaXphYmxlIiwiaGVpZ2h0U2l6YWJsZSIsImRpc3Bvc2UiLCJsYXlvdXRQcm94eVByb3BlcnR5IiwibGF5b3V0T3B0aW9uc0NoYW5nZWRFbWl0dGVyIiwicmVtb3ZlTGlzdGVuZXIiLCJsYXlvdXRPcHRpb25zTGlzdGVuZXIiLCJjb25zdHJhaW50IiwiYW5jZXN0b3JOb2RlIiwib25UcmFuc2Zvcm1DaGFuZ2UiLCJ1cGRhdGVMYXlvdXRBdXRvbWF0aWNhbGx5IiwibGluayIsIl9jb25zdHJhaW50IiwiYmluZCIsImFkZExpc3RlbmVyIiwicmVnaXN0ZXIiXSwibWFwcGluZ3MiOiJBQUFBLHNEQUFzRDtBQUV0RDs7OztDQUlDLEdBRUQsT0FBT0EsaUJBQWlCLDBDQUEwQztBQUNsRSxTQUF3Q0MsbUJBQW1CLEVBQVFDLE9BQU8sUUFBUSxtQkFBbUI7QUFHdEYsSUFBQSxBQUFNQyxhQUFOLE1BQU1BO0lBNERuQiwyQ0FBMkM7SUFDakNDLHdCQUE4QjtJQUN0Qyw0QkFBNEI7SUFDOUI7SUFFQTs7R0FFQyxHQUNELElBQVdDLE9BQWE7UUFDdEIsT0FBTyxJQUFJLENBQUNDLEtBQUs7SUFDbkI7SUFFQTs7R0FFQyxHQUNELEFBQU9DLGNBQXVCO1FBQzVCLE9BQU8sSUFBSSxDQUFDQyxNQUFNLEtBQUs7SUFDekI7SUFFQTs7R0FFQyxHQUNELElBQVdDLFFBQXFCO1FBQzlCQyxVQUFVQSxPQUFRLElBQUksQ0FBQ0YsTUFBTTtRQUU3QixPQUFPLElBQUksQ0FBQ0EsTUFBTTtJQUNwQjtJQUVBOztHQUVDLEdBQ0QsQUFBT0csVUFBV0MsV0FBd0IsRUFBWTtRQUNwRCxPQUFPQSxnQkFBZ0JaLFlBQVlhLFVBQVUsR0FBRyxJQUFJLENBQUNKLEtBQUssQ0FBQ0ssWUFBWSxHQUFHLElBQUksQ0FBQ0wsS0FBSyxDQUFDTSxhQUFhO0lBQ3BHO0lBRUE7O0dBRUMsR0FDRCxBQUFPQyxVQUFnQjtRQUNyQixJQUFJLENBQUNDLG1CQUFtQixJQUFJLElBQUksQ0FBQ0EsbUJBQW1CLENBQUNELE9BQU87UUFFNUQsSUFBSSxDQUFDWCxJQUFJLENBQUNhLDJCQUEyQixDQUFDQyxjQUFjLENBQUUsSUFBSSxDQUFDQyxxQkFBcUI7SUFDbEY7SUFyRkE7Ozs7Ozs7Ozs7Ozs7R0FhQyxHQUNELFlBQW9CQyxVQUE0QixFQUFFaEIsSUFBVSxFQUFFSSxLQUF5QixDQUFHO1FBQ3hGLElBQUtBLE9BQVE7WUFDWCxJQUFJLENBQUNRLG1CQUFtQixHQUFHO1lBQzNCLElBQUksQ0FBQ1QsTUFBTSxHQUFHQztRQUNoQixPQUNLO1lBRUgsSUFBSSxDQUFDRCxNQUFNLEdBQUc7WUFFZCwyR0FBMkc7WUFDM0csMEdBQTBHO1lBQzFHLDBCQUEwQjtZQUMxQixJQUFJLENBQUNTLG1CQUFtQixHQUFHLElBQUloQixvQkFBcUJvQixXQUFXQyxZQUFZLEVBQUVqQixNQUFNO2dCQUNqRmtCLG1CQUFtQixJQUFNRixXQUFXRyx5QkFBeUI7WUFDL0Q7WUFDQSxJQUFJLENBQUNQLG1CQUFtQixDQUFDUSxJQUFJLENBQUVoQixDQUFBQTtnQkFDN0IsSUFBSSxDQUFDRCxNQUFNLEdBQUdDO2dCQUVkWSxXQUFXRyx5QkFBeUI7WUFDdEM7UUFDRjtRQUVBLElBQUksQ0FBQ0UsV0FBVyxHQUFHTDtRQUNuQixJQUFJLENBQUNmLEtBQUssR0FBR0Q7UUFFYixJQUFJLENBQUNlLHFCQUFxQixHQUFHLElBQUksQ0FBQ2hCLHFCQUFxQixDQUFDdUIsSUFBSSxDQUFFLElBQUk7UUFDbEUsSUFBSSxDQUFDdEIsSUFBSSxDQUFDYSwyQkFBMkIsQ0FBQ1UsV0FBVyxDQUFFLElBQUksQ0FBQ1IscUJBQXFCO0lBQy9FO0FBNkNGO0FBeEdBLGdIQUFnSDtBQUNoSCxTQUFxQmpCLHdCQXVHcEI7QUFFREQsUUFBUTJCLFFBQVEsQ0FBRSxjQUFjMUIifQ==