// Copyright 2015-2024, University of Colorado Boulder
/**
 * UpdateDialog is a fixed-size dialog that displays the current update status.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ import stepTimer from '../../axon/js/stepTimer.js';
import { Node } from '../../scenery/js/imports.js';
import Dialog from '../../sun/js/Dialog.js';
import joist from './joist.js';
import updateCheck from './updateCheck.js';
import UpdateNodes from './UpdateNodes.js';
import UpdateState from './UpdateState.js';
let UpdateDialog = class UpdateDialog extends Dialog {
    /**
   * Shows the UpdateDialog, registering listeners that should only be called while the dialog is shown.
   * (joist-internal)
   */ show() {
        if (!this.shouldShowPopup()) {
            return;
        }
        if (updateCheck.areUpdatesChecked && !this.isShowingProperty.value) {
            updateCheck.resetTimeout();
            // Fire off a new update check if we were marked as offline or unchecked before, and we handle updates.
            if (updateCheck.stateProperty.value === UpdateState.OFFLINE || updateCheck.stateProperty.value === UpdateState.UNCHECKED) {
                updateCheck.check();
            }
            // Hook up our spinner listener when we're shown
            stepTimer.addListener(this.updateStepListener);
            // Hook up our visibility listener
            updateCheck.stateProperty.link(this.updateVisibilityListener);
        }
        super.show();
    }
    /**
   * Removes listeners that should only be called when the Dialog is shown.
   * (joist-internal)
   */ hide() {
        if (this.isShowingProperty.value) {
            super.hide();
            if (updateCheck.areUpdatesChecked) {
                // Disconnect our visibility listener
                updateCheck.stateProperty.unlink(this.updateVisibilityListener);
                // Disconnect our spinner listener when we're hidden
                stepTimer.removeListener(this.updateStepListener);
            }
        }
    }
    constructor(providedOptions){
        assert && assert(updateCheck.areUpdatesChecked, 'Updates need to be checked for UpdateDialog to be created');
        const positionOptions = {
            centerX: 0,
            centerY: 0,
            big: true
        };
        const checkingNode = UpdateNodes.createCheckingNode(positionOptions);
        const upToDateNode = UpdateNodes.createUpToDateNode(positionOptions);
        const outOfDateNode = new Node({
            // pdom - dialog content contained in parent div so ARIA roles can be applied to all children
            tagName: 'div'
        });
        const offlineNode = UpdateNodes.createOfflineNode(positionOptions);
        const content = new Node({
            children: [
                checkingNode,
                upToDateNode,
                outOfDateNode,
                offlineNode
            ],
            // pdom
            tagName: 'div'
        });
        super(content, providedOptions);
        const updateOutOfDateNode = ()=>{
            // fallback size placeholder for version
            const latestVersionString = updateCheck.latestVersion ? updateCheck.latestVersion.toString() : 'x.x.xx';
            const ourVersionString = updateCheck.ourVersion.toString();
            outOfDateNode.children = [
                UpdateNodes.createOutOfDateDialogNode(this, ourVersionString, latestVersionString, positionOptions)
            ];
        };
        updateOutOfDateNode();
        this.updateStepListener = checkingNode.stepListener;
        this.updateVisibilityListener = (state)=>{
            if (state === UpdateState.OUT_OF_DATE) {
                updateOutOfDateNode();
            }
            checkingNode.visible = state === UpdateState.CHECKING;
            upToDateNode.visible = state === UpdateState.UP_TO_DATE;
            outOfDateNode.visible = state === UpdateState.OUT_OF_DATE;
            offlineNode.visible = state === UpdateState.OFFLINE;
            // pdom - update visibility of update nodes for screen readers by adding/removing content from the DOM,
            // necessary because screen readers will read hidden content in a Dialog
            checkingNode.pdomVisible = checkingNode.visible;
            upToDateNode.pdomVisible = upToDateNode.visible;
            outOfDateNode.pdomVisible = outOfDateNode.visible;
            offlineNode.pdomVisible = offlineNode.visible;
        };
    }
};
export { UpdateDialog as default };
joist.register('UpdateDialog', UpdateDialog);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2pvaXN0L2pzL1VwZGF0ZURpYWxvZy50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNS0yMDI0LCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuLyoqXG4gKiBVcGRhdGVEaWFsb2cgaXMgYSBmaXhlZC1zaXplIGRpYWxvZyB0aGF0IGRpc3BsYXlzIHRoZSBjdXJyZW50IHVwZGF0ZSBzdGF0dXMuXG4gKlxuICogQGF1dGhvciBKb25hdGhhbiBPbHNvbiA8am9uYXRoYW4ub2xzb25AY29sb3JhZG8uZWR1PlxuICovXG5cbmltcG9ydCBzdGVwVGltZXIgZnJvbSAnLi4vLi4vYXhvbi9qcy9zdGVwVGltZXIuanMnO1xuaW1wb3J0IHsgRW1wdHlTZWxmT3B0aW9ucyB9IGZyb20gJy4uLy4uL3BoZXQtY29yZS9qcy9vcHRpb25pemUuanMnO1xuaW1wb3J0IHsgTm9kZSB9IGZyb20gJy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XG5pbXBvcnQgRGlhbG9nLCB7IERpYWxvZ09wdGlvbnMgfSBmcm9tICcuLi8uLi9zdW4vanMvRGlhbG9nLmpzJztcbmltcG9ydCBqb2lzdCBmcm9tICcuL2pvaXN0LmpzJztcbmltcG9ydCB1cGRhdGVDaGVjayBmcm9tICcuL3VwZGF0ZUNoZWNrLmpzJztcbmltcG9ydCBVcGRhdGVOb2RlcyBmcm9tICcuL1VwZGF0ZU5vZGVzLmpzJztcbmltcG9ydCBVcGRhdGVTdGF0ZSBmcm9tICcuL1VwZGF0ZVN0YXRlLmpzJztcblxudHlwZSBTZWxmT3B0aW9ucyA9IEVtcHR5U2VsZk9wdGlvbnM7XG5cbmV4cG9ydCB0eXBlIFVwZGF0ZURpYWxvZ09wdGlvbnMgPSBTZWxmT3B0aW9ucyAmIERpYWxvZ09wdGlvbnM7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFVwZGF0ZURpYWxvZyBleHRlbmRzIERpYWxvZyB7XG5cbiAgLy8gTGlzdGVuZXIgdGhhdCBzaG91bGQgYmUgY2FsbGVkIGV2ZXJ5IGZyYW1lIHdoZXJlIHdlIGFyZSBzaG93biwgd2l0aCB7bnVtYmVyfSBkdCBhcyBhIHNpbmdsZSBwYXJhbWV0ZXIuXG4gIHByaXZhdGUgcmVhZG9ubHkgdXBkYXRlU3RlcExpc3RlbmVyOiAoIGR0OiBudW1iZXIgKSA9PiB2b2lkO1xuXG4gIC8vIExpc3RlbmVyIHRoYXQgc2hvdWxkIGJlIGNhbGxlZCB3aGVuZXZlciBvdXIgdXBkYXRlIHN0YXRlIGNoYW5nZXMgKHdoaWxlIHdlIGFyZSBkaXNwbGF5ZWQpXG4gIHByaXZhdGUgcmVhZG9ubHkgdXBkYXRlVmlzaWJpbGl0eUxpc3RlbmVyOiAoIHN0YXRlOiBVcGRhdGVTdGF0ZSApID0+IHZvaWQ7XG5cbiAgcHVibGljIGNvbnN0cnVjdG9yKCBwcm92aWRlZE9wdGlvbnM/OiBVcGRhdGVEaWFsb2dPcHRpb25zICkge1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIHVwZGF0ZUNoZWNrLmFyZVVwZGF0ZXNDaGVja2VkLFxuICAgICAgJ1VwZGF0ZXMgbmVlZCB0byBiZSBjaGVja2VkIGZvciBVcGRhdGVEaWFsb2cgdG8gYmUgY3JlYXRlZCcgKTtcblxuICAgIGNvbnN0IHBvc2l0aW9uT3B0aW9ucyA9IHsgY2VudGVyWDogMCwgY2VudGVyWTogMCwgYmlnOiB0cnVlIH07XG4gICAgY29uc3QgY2hlY2tpbmdOb2RlID0gVXBkYXRlTm9kZXMuY3JlYXRlQ2hlY2tpbmdOb2RlKCBwb3NpdGlvbk9wdGlvbnMgKTtcbiAgICBjb25zdCB1cFRvRGF0ZU5vZGUgPSBVcGRhdGVOb2Rlcy5jcmVhdGVVcFRvRGF0ZU5vZGUoIHBvc2l0aW9uT3B0aW9ucyApO1xuXG4gICAgY29uc3Qgb3V0T2ZEYXRlTm9kZSA9IG5ldyBOb2RlKCB7XG5cbiAgICAgIC8vIHBkb20gLSBkaWFsb2cgY29udGVudCBjb250YWluZWQgaW4gcGFyZW50IGRpdiBzbyBBUklBIHJvbGVzIGNhbiBiZSBhcHBsaWVkIHRvIGFsbCBjaGlsZHJlblxuICAgICAgdGFnTmFtZTogJ2RpdidcbiAgICB9ICk7XG5cbiAgICBjb25zdCBvZmZsaW5lTm9kZSA9IFVwZGF0ZU5vZGVzLmNyZWF0ZU9mZmxpbmVOb2RlKCBwb3NpdGlvbk9wdGlvbnMgKTtcblxuICAgIGNvbnN0IGNvbnRlbnQgPSBuZXcgTm9kZSgge1xuICAgICAgY2hpbGRyZW46IFtcbiAgICAgICAgY2hlY2tpbmdOb2RlLFxuICAgICAgICB1cFRvRGF0ZU5vZGUsXG4gICAgICAgIG91dE9mRGF0ZU5vZGUsXG4gICAgICAgIG9mZmxpbmVOb2RlXG4gICAgICBdLFxuXG4gICAgICAvLyBwZG9tXG4gICAgICB0YWdOYW1lOiAnZGl2J1xuICAgIH0gKTtcblxuICAgIHN1cGVyKCBjb250ZW50LCBwcm92aWRlZE9wdGlvbnMgKTtcblxuICAgIGNvbnN0IHVwZGF0ZU91dE9mRGF0ZU5vZGUgPSAoKSA9PiB7XG5cbiAgICAgIC8vIGZhbGxiYWNrIHNpemUgcGxhY2Vob2xkZXIgZm9yIHZlcnNpb25cbiAgICAgIGNvbnN0IGxhdGVzdFZlcnNpb25TdHJpbmcgPSB1cGRhdGVDaGVjay5sYXRlc3RWZXJzaW9uID8gdXBkYXRlQ2hlY2subGF0ZXN0VmVyc2lvbi50b1N0cmluZygpIDogJ3gueC54eCc7XG4gICAgICBjb25zdCBvdXJWZXJzaW9uU3RyaW5nID0gdXBkYXRlQ2hlY2sub3VyVmVyc2lvbi50b1N0cmluZygpO1xuXG4gICAgICBvdXRPZkRhdGVOb2RlLmNoaWxkcmVuID0gW1xuICAgICAgICBVcGRhdGVOb2Rlcy5jcmVhdGVPdXRPZkRhdGVEaWFsb2dOb2RlKCB0aGlzLCBvdXJWZXJzaW9uU3RyaW5nLCBsYXRlc3RWZXJzaW9uU3RyaW5nLCBwb3NpdGlvbk9wdGlvbnMgKVxuICAgICAgXTtcbiAgICB9O1xuXG4gICAgdXBkYXRlT3V0T2ZEYXRlTm9kZSgpO1xuXG4gICAgdGhpcy51cGRhdGVTdGVwTGlzdGVuZXIgPSBjaGVja2luZ05vZGUuc3RlcExpc3RlbmVyO1xuXG4gICAgdGhpcy51cGRhdGVWaXNpYmlsaXR5TGlzdGVuZXIgPSBzdGF0ZSA9PiB7XG4gICAgICBpZiAoIHN0YXRlID09PSBVcGRhdGVTdGF0ZS5PVVRfT0ZfREFURSApIHtcbiAgICAgICAgdXBkYXRlT3V0T2ZEYXRlTm9kZSgpO1xuICAgICAgfVxuXG4gICAgICBjaGVja2luZ05vZGUudmlzaWJsZSA9IHN0YXRlID09PSBVcGRhdGVTdGF0ZS5DSEVDS0lORztcbiAgICAgIHVwVG9EYXRlTm9kZS52aXNpYmxlID0gc3RhdGUgPT09IFVwZGF0ZVN0YXRlLlVQX1RPX0RBVEU7XG4gICAgICBvdXRPZkRhdGVOb2RlLnZpc2libGUgPSBzdGF0ZSA9PT0gVXBkYXRlU3RhdGUuT1VUX09GX0RBVEU7XG4gICAgICBvZmZsaW5lTm9kZS52aXNpYmxlID0gc3RhdGUgPT09IFVwZGF0ZVN0YXRlLk9GRkxJTkU7XG5cbiAgICAgIC8vIHBkb20gLSB1cGRhdGUgdmlzaWJpbGl0eSBvZiB1cGRhdGUgbm9kZXMgZm9yIHNjcmVlbiByZWFkZXJzIGJ5IGFkZGluZy9yZW1vdmluZyBjb250ZW50IGZyb20gdGhlIERPTSxcbiAgICAgIC8vIG5lY2Vzc2FyeSBiZWNhdXNlIHNjcmVlbiByZWFkZXJzIHdpbGwgcmVhZCBoaWRkZW4gY29udGVudCBpbiBhIERpYWxvZ1xuICAgICAgY2hlY2tpbmdOb2RlLnBkb21WaXNpYmxlID0gY2hlY2tpbmdOb2RlLnZpc2libGU7XG4gICAgICB1cFRvRGF0ZU5vZGUucGRvbVZpc2libGUgPSB1cFRvRGF0ZU5vZGUudmlzaWJsZTtcbiAgICAgIG91dE9mRGF0ZU5vZGUucGRvbVZpc2libGUgPSBvdXRPZkRhdGVOb2RlLnZpc2libGU7XG4gICAgICBvZmZsaW5lTm9kZS5wZG9tVmlzaWJsZSA9IG9mZmxpbmVOb2RlLnZpc2libGU7XG4gICAgfTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTaG93cyB0aGUgVXBkYXRlRGlhbG9nLCByZWdpc3RlcmluZyBsaXN0ZW5lcnMgdGhhdCBzaG91bGQgb25seSBiZSBjYWxsZWQgd2hpbGUgdGhlIGRpYWxvZyBpcyBzaG93bi5cbiAgICogKGpvaXN0LWludGVybmFsKVxuICAgKi9cbiAgcHVibGljIG92ZXJyaWRlIHNob3coKTogdm9pZCB7XG4gICAgaWYgKCAhdGhpcy5zaG91bGRTaG93UG9wdXAoKSApIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgaWYgKCB1cGRhdGVDaGVjay5hcmVVcGRhdGVzQ2hlY2tlZCAmJiAhdGhpcy5pc1Nob3dpbmdQcm9wZXJ0eS52YWx1ZSApIHtcbiAgICAgIHVwZGF0ZUNoZWNrLnJlc2V0VGltZW91dCgpO1xuXG4gICAgICAvLyBGaXJlIG9mZiBhIG5ldyB1cGRhdGUgY2hlY2sgaWYgd2Ugd2VyZSBtYXJrZWQgYXMgb2ZmbGluZSBvciB1bmNoZWNrZWQgYmVmb3JlLCBhbmQgd2UgaGFuZGxlIHVwZGF0ZXMuXG4gICAgICBpZiAoIHVwZGF0ZUNoZWNrLnN0YXRlUHJvcGVydHkudmFsdWUgPT09IFVwZGF0ZVN0YXRlLk9GRkxJTkUgfHwgdXBkYXRlQ2hlY2suc3RhdGVQcm9wZXJ0eS52YWx1ZSA9PT0gVXBkYXRlU3RhdGUuVU5DSEVDS0VEICkge1xuICAgICAgICB1cGRhdGVDaGVjay5jaGVjaygpO1xuICAgICAgfVxuXG4gICAgICAvLyBIb29rIHVwIG91ciBzcGlubmVyIGxpc3RlbmVyIHdoZW4gd2UncmUgc2hvd25cbiAgICAgIHN0ZXBUaW1lci5hZGRMaXN0ZW5lciggdGhpcy51cGRhdGVTdGVwTGlzdGVuZXIgKTtcblxuICAgICAgLy8gSG9vayB1cCBvdXIgdmlzaWJpbGl0eSBsaXN0ZW5lclxuICAgICAgdXBkYXRlQ2hlY2suc3RhdGVQcm9wZXJ0eS5saW5rKCB0aGlzLnVwZGF0ZVZpc2liaWxpdHlMaXN0ZW5lciApO1xuICAgIH1cblxuICAgIHN1cGVyLnNob3coKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZW1vdmVzIGxpc3RlbmVycyB0aGF0IHNob3VsZCBvbmx5IGJlIGNhbGxlZCB3aGVuIHRoZSBEaWFsb2cgaXMgc2hvd24uXG4gICAqIChqb2lzdC1pbnRlcm5hbClcbiAgICovXG4gIHB1YmxpYyBvdmVycmlkZSBoaWRlKCk6IHZvaWQge1xuICAgIGlmICggdGhpcy5pc1Nob3dpbmdQcm9wZXJ0eS52YWx1ZSApIHtcbiAgICAgIHN1cGVyLmhpZGUoKTtcblxuICAgICAgaWYgKCB1cGRhdGVDaGVjay5hcmVVcGRhdGVzQ2hlY2tlZCApIHtcblxuICAgICAgICAvLyBEaXNjb25uZWN0IG91ciB2aXNpYmlsaXR5IGxpc3RlbmVyXG4gICAgICAgIHVwZGF0ZUNoZWNrLnN0YXRlUHJvcGVydHkudW5saW5rKCB0aGlzLnVwZGF0ZVZpc2liaWxpdHlMaXN0ZW5lciApO1xuXG4gICAgICAgIC8vIERpc2Nvbm5lY3Qgb3VyIHNwaW5uZXIgbGlzdGVuZXIgd2hlbiB3ZSdyZSBoaWRkZW5cbiAgICAgICAgc3RlcFRpbWVyLnJlbW92ZUxpc3RlbmVyKCB0aGlzLnVwZGF0ZVN0ZXBMaXN0ZW5lciApO1xuICAgICAgfVxuICAgIH1cbiAgfVxufVxuXG5qb2lzdC5yZWdpc3RlciggJ1VwZGF0ZURpYWxvZycsIFVwZGF0ZURpYWxvZyApOyJdLCJuYW1lcyI6WyJzdGVwVGltZXIiLCJOb2RlIiwiRGlhbG9nIiwiam9pc3QiLCJ1cGRhdGVDaGVjayIsIlVwZGF0ZU5vZGVzIiwiVXBkYXRlU3RhdGUiLCJVcGRhdGVEaWFsb2ciLCJzaG93Iiwic2hvdWxkU2hvd1BvcHVwIiwiYXJlVXBkYXRlc0NoZWNrZWQiLCJpc1Nob3dpbmdQcm9wZXJ0eSIsInZhbHVlIiwicmVzZXRUaW1lb3V0Iiwic3RhdGVQcm9wZXJ0eSIsIk9GRkxJTkUiLCJVTkNIRUNLRUQiLCJjaGVjayIsImFkZExpc3RlbmVyIiwidXBkYXRlU3RlcExpc3RlbmVyIiwibGluayIsInVwZGF0ZVZpc2liaWxpdHlMaXN0ZW5lciIsImhpZGUiLCJ1bmxpbmsiLCJyZW1vdmVMaXN0ZW5lciIsInByb3ZpZGVkT3B0aW9ucyIsImFzc2VydCIsInBvc2l0aW9uT3B0aW9ucyIsImNlbnRlclgiLCJjZW50ZXJZIiwiYmlnIiwiY2hlY2tpbmdOb2RlIiwiY3JlYXRlQ2hlY2tpbmdOb2RlIiwidXBUb0RhdGVOb2RlIiwiY3JlYXRlVXBUb0RhdGVOb2RlIiwib3V0T2ZEYXRlTm9kZSIsInRhZ05hbWUiLCJvZmZsaW5lTm9kZSIsImNyZWF0ZU9mZmxpbmVOb2RlIiwiY29udGVudCIsImNoaWxkcmVuIiwidXBkYXRlT3V0T2ZEYXRlTm9kZSIsImxhdGVzdFZlcnNpb25TdHJpbmciLCJsYXRlc3RWZXJzaW9uIiwidG9TdHJpbmciLCJvdXJWZXJzaW9uU3RyaW5nIiwib3VyVmVyc2lvbiIsImNyZWF0ZU91dE9mRGF0ZURpYWxvZ05vZGUiLCJzdGVwTGlzdGVuZXIiLCJzdGF0ZSIsIk9VVF9PRl9EQVRFIiwidmlzaWJsZSIsIkNIRUNLSU5HIiwiVVBfVE9fREFURSIsInBkb21WaXNpYmxlIiwicmVnaXN0ZXIiXSwibWFwcGluZ3MiOiJBQUFBLHNEQUFzRDtBQUV0RDs7OztDQUlDLEdBRUQsT0FBT0EsZUFBZSw2QkFBNkI7QUFFbkQsU0FBU0MsSUFBSSxRQUFRLDhCQUE4QjtBQUNuRCxPQUFPQyxZQUErQix5QkFBeUI7QUFDL0QsT0FBT0MsV0FBVyxhQUFhO0FBQy9CLE9BQU9DLGlCQUFpQixtQkFBbUI7QUFDM0MsT0FBT0MsaUJBQWlCLG1CQUFtQjtBQUMzQyxPQUFPQyxpQkFBaUIsbUJBQW1CO0FBTTVCLElBQUEsQUFBTUMsZUFBTixNQUFNQSxxQkFBcUJMO0lBd0V4Qzs7O0dBR0MsR0FDRCxBQUFnQk0sT0FBYTtRQUMzQixJQUFLLENBQUMsSUFBSSxDQUFDQyxlQUFlLElBQUs7WUFDN0I7UUFDRjtRQUNBLElBQUtMLFlBQVlNLGlCQUFpQixJQUFJLENBQUMsSUFBSSxDQUFDQyxpQkFBaUIsQ0FBQ0MsS0FBSyxFQUFHO1lBQ3BFUixZQUFZUyxZQUFZO1lBRXhCLHVHQUF1RztZQUN2RyxJQUFLVCxZQUFZVSxhQUFhLENBQUNGLEtBQUssS0FBS04sWUFBWVMsT0FBTyxJQUFJWCxZQUFZVSxhQUFhLENBQUNGLEtBQUssS0FBS04sWUFBWVUsU0FBUyxFQUFHO2dCQUMxSFos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