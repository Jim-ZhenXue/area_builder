// Copyright 2022-2024, University of Colorado Boulder
/**
 * Supertype for layout Nodes
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ import Vector2 from '../../../../dot/js/Vector2.js';
import Vector2Property from '../../../../dot/js/Vector2Property.js';
import { Node, scenery, Sizable } from '../../imports.js';
export const LAYOUT_NODE_OPTION_KEYS = [
    'resize',
    'layoutOrigin'
];
let LayoutNode = class LayoutNode extends Sizable(Node) {
    linkLayoutBounds() {
        // Adjust the localBounds to be the laid-out area (defined by the constraint)
        this._constraint.layoutBoundsProperty.link((layoutBounds)=>{
            this.localBounds = layoutBounds;
        });
    }
    setExcludeInvisibleChildrenFromBounds(excludeInvisibleChildrenFromBounds) {
        super.setExcludeInvisibleChildrenFromBounds(excludeInvisibleChildrenFromBounds);
        this._constraint.excludeInvisible = excludeInvisibleChildrenFromBounds;
    }
    setChildren(children) {
        // If the layout is already locked, we need to bail and only call Node's setChildren. This is fine, our layout will
        // be handled once whatever locked us unlocks (so we don't have to override to handle layout or locking/unlocking.
        if (this.constraint.isLocked) {
            return super.setChildren(children);
        }
        const oldChildren = this.getChildren(); // defensive copy
        // Lock layout while the children are removed and added
        this.constraint.lock();
        super.setChildren(children);
        this.constraint.unlock();
        // Determine if the children array has changed. We'll gain a performance benefit by not triggering layout when
        // the children haven't changed.
        if (!_.isEqual(oldChildren, children)) {
            this.constraint.updateLayoutAutomatically();
        }
        return this;
    }
    /**
   * Manually run the layout (for instance, if resize:false is currently set, or if there is other hackery going on).
   */ updateLayout() {
        this._constraint.updateLayout();
    }
    get resize() {
        return this._constraint.enabled;
    }
    set resize(value) {
        this._constraint.enabled = value;
    }
    get layoutOrigin() {
        return this.layoutOriginProperty.value;
    }
    set layoutOrigin(value) {
        this.layoutOriginProperty.value = value;
    }
    /**
   * Manual access to the constraint. This is needed by subtypes to lock/unlock or force layout updates, but may also
   * be needed to read layout information out (for overlays, GridBackgroundNode, etc.)
   */ get constraint() {
        return this._constraint;
    }
    /**
   * Releases references
   */ dispose() {
        this._constraint.dispose();
        super.dispose();
    }
    constructor(providedOptions){
        super(providedOptions), this.layoutOriginProperty = new Vector2Property(Vector2.ZERO);
    }
};
export { LayoutNode as default };
scenery.register('LayoutNode', LayoutNode);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvbGF5b3V0L25vZGVzL0xheW91dE5vZGUudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjItMjAyNCwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbi8qKlxuICogU3VwZXJ0eXBlIGZvciBsYXlvdXQgTm9kZXNcbiAqXG4gKiBAYXV0aG9yIEpvbmF0aGFuIE9sc29uIDxqb25hdGhhbi5vbHNvbkBjb2xvcmFkby5lZHU+XG4gKi9cblxuaW1wb3J0IFRQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL1RQcm9wZXJ0eS5qcyc7XG5pbXBvcnQgVmVjdG9yMiBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvVmVjdG9yMi5qcyc7XG5pbXBvcnQgVmVjdG9yMlByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9WZWN0b3IyUHJvcGVydHkuanMnO1xuaW1wb3J0IHsgTm9kZSwgTm9kZUxheW91dENvbnN0cmFpbnQsIE5vZGVPcHRpb25zLCBzY2VuZXJ5LCBTaXphYmxlLCBTaXphYmxlT3B0aW9ucyB9IGZyb20gJy4uLy4uL2ltcG9ydHMuanMnO1xuXG50eXBlIFNlbGZPcHRpb25zID0ge1xuICAvLyBDb250cm9scyB3aGV0aGVyIHRoZSBsYXlvdXQgY29udGFpbmVyIHdpbGwgcmUtdHJpZ2dlciBsYXlvdXQgYXV0b21hdGljYWxseSBhZnRlciB0aGUgXCJmaXJzdFwiIGxheW91dCBkdXJpbmdcbiAgLy8gY29uc3RydWN0aW9uLiBUaGUgbGF5b3V0IGNvbnRhaW5lciB3aWxsIGxheW91dCBvbmNlIGFmdGVyIHByb2Nlc3NpbmcgdGhlIG9wdGlvbnMgb2JqZWN0LCBidXQgaWYgcmVzaXplOmZhbHNlLFxuICAvLyB0aGVuIGFmdGVyIHRoYXQgbWFudWFsIGxheW91dCBjYWxscyB3aWxsIG5lZWQgdG8gYmUgZG9uZSAod2l0aCB1cGRhdGVMYXlvdXQoKSlcbiAgcmVzaXplPzogYm9vbGVhbjtcblxuICAvLyBDb250cm9scyB3aGVyZSB0aGUgb3JpZ2luIG9mIHRoZSBcImxheW91dFwiIGlzIHBsYWNlZCAodXN1YWxseSB3aXRoaW4gdGhlIE5vZGUgaXRzZWxmKS4gRm9yIHR5cGljYWwgdXNhZ2VzLCB0aGlzIHdpbGxcbiAgLy8gYmUgKDAsMCkgYW5kIHRoZSB1cHBlci1sZWZ0IG9mIHRoZSBjb250ZW50IHdpbGwgYmUgcGxhY2VkIHRoZXJlLiBgbGF5b3V0T3JpZ2luYCB3aWxsIGFkanVzdCB0aGlzIHBvaW50LlxuICAvLyBOT1RFOiBJZiB0aGVyZSBpcyBvcmlnaW4tYmFzZWQgY29udGVudCwgdGhhdCBjb250ZW50IHdpbGwgYmUgcGxhY2VkIGF0IHRoaXMgb3JpZ2luIChhbmQgbWF5IGdvIHRvIHRoZSB0b3AvbGVmdCBvZlxuICAvLyB0aGlzIGxheW91dE9yaWdpbikuXG4gIGxheW91dE9yaWdpbj86IFZlY3RvcjI7XG59O1xuXG5leHBvcnQgY29uc3QgTEFZT1VUX05PREVfT1BUSU9OX0tFWVMgPSBbICdyZXNpemUnLCAnbGF5b3V0T3JpZ2luJyBdIGFzIGNvbnN0O1xuXG50eXBlIFBhcmVudE9wdGlvbnMgPSBOb2RlT3B0aW9ucyAmIFNpemFibGVPcHRpb25zO1xuXG5leHBvcnQgdHlwZSBMYXlvdXROb2RlT3B0aW9ucyA9IFNlbGZPcHRpb25zICYgUGFyZW50T3B0aW9ucztcblxuZXhwb3J0IGRlZmF1bHQgYWJzdHJhY3QgY2xhc3MgTGF5b3V0Tm9kZTxDb25zdHJhaW50IGV4dGVuZHMgTm9kZUxheW91dENvbnN0cmFpbnQ+IGV4dGVuZHMgU2l6YWJsZSggTm9kZSApIHtcblxuICBwcm90ZWN0ZWQgX2NvbnN0cmFpbnQhOiBDb25zdHJhaW50OyAvLyBDYW4ndCBiZSByZWFkb25seSBiZWNhdXNlIHRoZSBzdWJ0eXBlIHNldHMgdGhpc1xuXG4gIHB1YmxpYyByZWFkb25seSBsYXlvdXRPcmlnaW5Qcm9wZXJ0eTogVFByb3BlcnR5PFZlY3RvcjI+ID0gbmV3IFZlY3RvcjJQcm9wZXJ0eSggVmVjdG9yMi5aRVJPICk7XG5cbiAgcHJvdGVjdGVkIGNvbnN0cnVjdG9yKCBwcm92aWRlZE9wdGlvbnM/OiBMYXlvdXROb2RlT3B0aW9ucyApIHtcbiAgICBzdXBlciggcHJvdmlkZWRPcHRpb25zICk7XG4gIH1cblxuICBwcm90ZWN0ZWQgbGlua0xheW91dEJvdW5kcygpOiB2b2lkIHtcbiAgICAvLyBBZGp1c3QgdGhlIGxvY2FsQm91bmRzIHRvIGJlIHRoZSBsYWlkLW91dCBhcmVhIChkZWZpbmVkIGJ5IHRoZSBjb25zdHJhaW50KVxuICAgIHRoaXMuX2NvbnN0cmFpbnQubGF5b3V0Qm91bmRzUHJvcGVydHkubGluayggbGF5b3V0Qm91bmRzID0+IHtcbiAgICAgIHRoaXMubG9jYWxCb3VuZHMgPSBsYXlvdXRCb3VuZHM7XG4gICAgfSApO1xuICB9XG5cbiAgcHVibGljIG92ZXJyaWRlIHNldEV4Y2x1ZGVJbnZpc2libGVDaGlsZHJlbkZyb21Cb3VuZHMoIGV4Y2x1ZGVJbnZpc2libGVDaGlsZHJlbkZyb21Cb3VuZHM6IGJvb2xlYW4gKTogdm9pZCB7XG4gICAgc3VwZXIuc2V0RXhjbHVkZUludmlzaWJsZUNoaWxkcmVuRnJvbUJvdW5kcyggZXhjbHVkZUludmlzaWJsZUNoaWxkcmVuRnJvbUJvdW5kcyApO1xuXG4gICAgdGhpcy5fY29uc3RyYWludC5leGNsdWRlSW52aXNpYmxlID0gZXhjbHVkZUludmlzaWJsZUNoaWxkcmVuRnJvbUJvdW5kcztcbiAgfVxuXG4gIHB1YmxpYyBvdmVycmlkZSBzZXRDaGlsZHJlbiggY2hpbGRyZW46IE5vZGVbXSApOiB0aGlzIHtcblxuICAgIC8vIElmIHRoZSBsYXlvdXQgaXMgYWxyZWFkeSBsb2NrZWQsIHdlIG5lZWQgdG8gYmFpbCBhbmQgb25seSBjYWxsIE5vZGUncyBzZXRDaGlsZHJlbi4gVGhpcyBpcyBmaW5lLCBvdXIgbGF5b3V0IHdpbGxcbiAgICAvLyBiZSBoYW5kbGVkIG9uY2Ugd2hhdGV2ZXIgbG9ja2VkIHVzIHVubG9ja3MgKHNvIHdlIGRvbid0IGhhdmUgdG8gb3ZlcnJpZGUgdG8gaGFuZGxlIGxheW91dCBvciBsb2NraW5nL3VubG9ja2luZy5cbiAgICBpZiAoIHRoaXMuY29uc3RyYWludC5pc0xvY2tlZCApIHtcbiAgICAgIHJldHVybiBzdXBlci5zZXRDaGlsZHJlbiggY2hpbGRyZW4gKTtcbiAgICB9XG5cbiAgICBjb25zdCBvbGRDaGlsZHJlbiA9IHRoaXMuZ2V0Q2hpbGRyZW4oKTsgLy8gZGVmZW5zaXZlIGNvcHlcblxuICAgIC8vIExvY2sgbGF5b3V0IHdoaWxlIHRoZSBjaGlsZHJlbiBhcmUgcmVtb3ZlZCBhbmQgYWRkZWRcbiAgICB0aGlzLmNvbnN0cmFpbnQubG9jaygpO1xuICAgIHN1cGVyLnNldENoaWxkcmVuKCBjaGlsZHJlbiApO1xuICAgIHRoaXMuY29uc3RyYWludC51bmxvY2soKTtcblxuICAgIC8vIERldGVybWluZSBpZiB0aGUgY2hpbGRyZW4gYXJyYXkgaGFzIGNoYW5nZWQuIFdlJ2xsIGdhaW4gYSBwZXJmb3JtYW5jZSBiZW5lZml0IGJ5IG5vdCB0cmlnZ2VyaW5nIGxheW91dCB3aGVuXG4gICAgLy8gdGhlIGNoaWxkcmVuIGhhdmVuJ3QgY2hhbmdlZC5cbiAgICBpZiAoICFfLmlzRXF1YWwoIG9sZENoaWxkcmVuLCBjaGlsZHJlbiApICkge1xuICAgICAgdGhpcy5jb25zdHJhaW50LnVwZGF0ZUxheW91dEF1dG9tYXRpY2FsbHkoKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBNYW51YWxseSBydW4gdGhlIGxheW91dCAoZm9yIGluc3RhbmNlLCBpZiByZXNpemU6ZmFsc2UgaXMgY3VycmVudGx5IHNldCwgb3IgaWYgdGhlcmUgaXMgb3RoZXIgaGFja2VyeSBnb2luZyBvbikuXG4gICAqL1xuICBwdWJsaWMgdXBkYXRlTGF5b3V0KCk6IHZvaWQge1xuICAgIHRoaXMuX2NvbnN0cmFpbnQudXBkYXRlTGF5b3V0KCk7XG4gIH1cblxuICBwdWJsaWMgZ2V0IHJlc2l6ZSgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5fY29uc3RyYWludC5lbmFibGVkO1xuICB9XG5cbiAgcHVibGljIHNldCByZXNpemUoIHZhbHVlOiBib29sZWFuICkge1xuICAgIHRoaXMuX2NvbnN0cmFpbnQuZW5hYmxlZCA9IHZhbHVlO1xuICB9XG5cbiAgcHVibGljIGdldCBsYXlvdXRPcmlnaW4oKTogVmVjdG9yMiB7XG4gICAgcmV0dXJuIHRoaXMubGF5b3V0T3JpZ2luUHJvcGVydHkudmFsdWU7XG4gIH1cblxuICBwdWJsaWMgc2V0IGxheW91dE9yaWdpbiggdmFsdWU6IFZlY3RvcjIgKSB7XG4gICAgdGhpcy5sYXlvdXRPcmlnaW5Qcm9wZXJ0eS52YWx1ZSA9IHZhbHVlO1xuICB9XG5cbiAgLyoqXG4gICAqIE1hbnVhbCBhY2Nlc3MgdG8gdGhlIGNvbnN0cmFpbnQuIFRoaXMgaXMgbmVlZGVkIGJ5IHN1YnR5cGVzIHRvIGxvY2svdW5sb2NrIG9yIGZvcmNlIGxheW91dCB1cGRhdGVzLCBidXQgbWF5IGFsc29cbiAgICogYmUgbmVlZGVkIHRvIHJlYWQgbGF5b3V0IGluZm9ybWF0aW9uIG91dCAoZm9yIG92ZXJsYXlzLCBHcmlkQmFja2dyb3VuZE5vZGUsIGV0Yy4pXG4gICAqL1xuICBwdWJsaWMgZ2V0IGNvbnN0cmFpbnQoKTogQ29uc3RyYWludCB7XG4gICAgcmV0dXJuIHRoaXMuX2NvbnN0cmFpbnQ7XG4gIH1cblxuICAvKipcbiAgICogUmVsZWFzZXMgcmVmZXJlbmNlc1xuICAgKi9cbiAgcHVibGljIG92ZXJyaWRlIGRpc3Bvc2UoKTogdm9pZCB7XG4gICAgdGhpcy5fY29uc3RyYWludC5kaXNwb3NlKCk7XG5cbiAgICBzdXBlci5kaXNwb3NlKCk7XG4gIH1cbn1cblxuc2NlbmVyeS5yZWdpc3RlciggJ0xheW91dE5vZGUnLCBMYXlvdXROb2RlICk7Il0sIm5hbWVzIjpbIlZlY3RvcjIiLCJWZWN0b3IyUHJvcGVydHkiLCJOb2RlIiwic2NlbmVyeSIsIlNpemFibGUiLCJMQVlPVVRfTk9ERV9PUFRJT05fS0VZUyIsIkxheW91dE5vZGUiLCJsaW5rTGF5b3V0Qm91bmRzIiwiX2NvbnN0cmFpbnQiLCJsYXlvdXRCb3VuZHNQcm9wZXJ0eSIsImxpbmsiLCJsYXlvdXRCb3VuZHMiLCJsb2NhbEJvdW5kcyIsInNldEV4Y2x1ZGVJbnZpc2libGVDaGlsZHJlbkZyb21Cb3VuZHMiLCJleGNsdWRlSW52aXNpYmxlQ2hpbGRyZW5Gcm9tQm91bmRzIiwiZXhjbHVkZUludmlzaWJsZSIsInNldENoaWxkcmVuIiwiY2hpbGRyZW4iLCJjb25zdHJhaW50IiwiaXNMb2NrZWQiLCJvbGRDaGlsZHJlbiIsImdldENoaWxkcmVuIiwibG9jayIsInVubG9jayIsIl8iLCJpc0VxdWFsIiwidXBkYXRlTGF5b3V0QXV0b21hdGljYWxseSIsInVwZGF0ZUxheW91dCIsInJlc2l6ZSIsImVuYWJsZWQiLCJ2YWx1ZSIsImxheW91dE9yaWdpbiIsImxheW91dE9yaWdpblByb3BlcnR5IiwiZGlzcG9zZSIsInByb3ZpZGVkT3B0aW9ucyIsIlpFUk8iLCJyZWdpc3RlciJdLCJtYXBwaW5ncyI6IkFBQUEsc0RBQXNEO0FBRXREOzs7O0NBSUMsR0FHRCxPQUFPQSxhQUFhLGdDQUFnQztBQUNwRCxPQUFPQyxxQkFBcUIsd0NBQXdDO0FBQ3BFLFNBQVNDLElBQUksRUFBcUNDLE9BQU8sRUFBRUMsT0FBTyxRQUF3QixtQkFBbUI7QUFlN0csT0FBTyxNQUFNQywwQkFBMEI7SUFBRTtJQUFVO0NBQWdCLENBQVU7QUFNOUQsSUFBQSxBQUFlQyxhQUFmLE1BQWVBLG1CQUE0REYsUUFBU0Y7SUFVdkZLLG1CQUF5QjtRQUNqQyw2RUFBNkU7UUFDN0UsSUFBSSxDQUFDQyxXQUFXLENBQUNDLG9CQUFvQixDQUFDQyxJQUFJLENBQUVDLENBQUFBO1lBQzFDLElBQUksQ0FBQ0MsV0FBVyxHQUFHRDtRQUNyQjtJQUNGO0lBRWdCRSxzQ0FBdUNDLGtDQUEyQyxFQUFTO1FBQ3pHLEtBQUssQ0FBQ0Qsc0NBQXVDQztRQUU3QyxJQUFJLENBQUNOLFdBQVcsQ0FBQ08sZ0JBQWdCLEdBQUdEO0lBQ3RDO0lBRWdCRSxZQUFhQyxRQUFnQixFQUFTO1FBRXBELG1IQUFtSDtRQUNuSCxrSEFBa0g7UUFDbEgsSUFBSyxJQUFJLENBQUNDLFVBQVUsQ0FBQ0MsUUFBUSxFQUFHO1lBQzlCLE9BQU8sS0FBSyxDQUFDSCxZQUFhQztRQUM1QjtRQUVBLE1BQU1HLGNBQWMsSUFBSSxDQUFDQyxXQUFXLElBQUksaUJBQWlCO1FBRXpELHVEQUF1RDtRQUN2RCxJQUFJLENBQUNILFVBQVUsQ0FBQ0ksSUFBSTtRQUNwQixLQUFLLENBQUNOLFlBQWFDO1FBQ25CLElBQUksQ0FBQ0MsVUFBVSxDQUFDSyxNQUFNO1FBRXRCLDhHQUE4RztRQUM5RyxnQ0FBZ0M7UUFDaEMsSUFBSyxDQUFDQyxFQUFFQyxPQUFPLENBQUVMLGFBQWFILFdBQWE7WUFDekMsSUFBSSxDQUFDQyxVQUFVLENBQUNRLHlCQUF5QjtRQUMzQztRQUVBLE9BQU8sSUFBSTtJQUNiO0lBRUE7O0dBRUMsR0FDRCxBQUFPQyxlQUFxQjtRQUMxQixJQUFJLENBQUNuQixXQUFXLENBQUNtQixZQUFZO0lBQy9CO0lBRUEsSUFBV0MsU0FBa0I7UUFDM0IsT0FBTyxJQUFJLENBQUNwQixXQUFXLENBQUNxQixPQUFPO0lBQ2pDO0lBRUEsSUFBV0QsT0FBUUUsS0FBYyxFQUFHO1FBQ2xDLElBQUksQ0FBQ3RCLFdBQVcsQ0FBQ3FCLE9BQU8sR0FBR0M7SUFDN0I7SUFFQSxJQUFXQyxlQUF3QjtRQUNqQyxPQUFPLElBQUksQ0FBQ0Msb0JBQW9CLENBQUNGLEtBQUs7SUFDeEM7SUFFQSxJQUFXQyxhQUFjRCxLQUFjLEVBQUc7UUFDeEMsSUFBSSxDQUFDRSxvQkFBb0IsQ0FBQ0YsS0FBSyxHQUFHQTtJQUNwQztJQUVBOzs7R0FHQyxHQUNELElBQVdaLGFBQXlCO1FBQ2xDLE9BQU8sSUFBSSxDQUFDVixXQUFXO0lBQ3pCO0lBRUE7O0dBRUMsR0FDRCxBQUFnQnlCLFVBQWdCO1FBQzlCLElBQUksQ0FBQ3pCLFdBQVcsQ0FBQ3lCLE9BQU87UUFFeEIsS0FBSyxDQUFDQTtJQUNSO0lBL0VBLFlBQXVCQyxlQUFtQyxDQUFHO1FBQzNELEtBQUssQ0FBRUEsdUJBSE9GLHVCQUEyQyxJQUFJL0IsZ0JBQWlCRCxRQUFRbUMsSUFBSTtJQUk1RjtBQThFRjtBQXRGQSxTQUE4QjdCLHdCQXNGN0I7QUFFREgsUUFBUWlDLFFBQVEsQ0FBRSxjQUFjOUIifQ==