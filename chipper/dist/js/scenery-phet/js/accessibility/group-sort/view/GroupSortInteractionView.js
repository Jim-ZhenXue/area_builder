// Copyright 2024, University of Colorado Boulder
/**
 * This doc assumes you have read the doc in GroupSelectModel. Read that first as it explains the "group select
 * interaction" more generally.
 *
 * This type adds sorting on top of the GroupSelectView
 * in the interaction for (keyboard).
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 * @author Marla Schulz (PhET Interactive Simulations)
 */ import Multilink from '../../../../../axon/js/Multilink.js';
import optionize from '../../../../../phet-core/js/optionize.js';
import { KeyboardListener } from '../../../../../scenery/js/imports.js';
import sceneryPhet from '../../../sceneryPhet.js';
import SceneryPhetStrings from '../../../SceneryPhetStrings.js';
import GroupSelectView from './GroupSelectView.js';
const navigableStringProperty = SceneryPhetStrings.a11y.groupSort.navigableStringProperty;
const sortableStringProperty = SceneryPhetStrings.a11y.groupSort.sortableStringProperty;
// A list of all keys that are listened to, except those covered by the numberKeyMapper
const sortingKeys = [
    'd',
    'arrowRight',
    'a',
    'arrowLeft',
    'arrowUp',
    'arrowDown',
    'w',
    's',
    'shift+d',
    'shift+arrowRight',
    'shift+a',
    'shift+arrowLeft',
    'shift+arrowUp',
    'shift+arrowDown',
    'shift+w',
    'shift+s',
    'pageUp',
    'pageDown',
    'home',
    'end' // min/max
];
let GroupSortInteractionView = class GroupSortInteractionView extends GroupSelectView {
    // Conduct the sorting of a value
    onSortedValue(groupItem, value, oldValue) {
        assert && assert(value !== null, 'We should have a value for the group item by the end of the listener.');
        this.sortGroupItem(groupItem, this.sortingRangeProperty.value.constrainValue(value));
        this.onSort(groupItem, oldValue);
        this.model.hasKeyboardSortedGroupItemProperty.value = true;
    }
    /**
   * Get the delta to change the value given what key was pressed. The returned delta may not result in a value in range,
   * please constrain value from range or provide your own defensive measures to this delta.
   */ getDeltaForKey(key) {
        const fullRange = this.sortingRangeProperty.value.getLength();
        return key === 'home' ? -fullRange : key === 'end' ? fullRange : key === 'pageDown' ? -this.pageSortStep : key === 'pageUp' ? this.pageSortStep : [
            'arrowLeft',
            'a',
            'arrowDown',
            's'
        ].includes(key) ? -this.sortStep : [
            'arrowRight',
            'd',
            'arrowUp',
            'w'
        ].includes(key) ? this.sortStep : [
            'shift+arrowLeft',
            'shift+a',
            'shift+arrowDown',
            'shift+s'
        ].includes(key) ? -this.shiftSortStep : [
            'shift+arrowRight',
            'shift+d',
            'shift+arrowUp',
            'shift+w'
        ].includes(key) ? this.shiftSortStep : null;
    }
    dispose() {
        this.groupSortGroupFocusHighlightPath.dispose();
        this.grabReleaseCueNode.dispose();
        this.positionSortCueNodeEmitter.dispose();
        super.dispose();
    }
    /**
   * Creator factory, similar to PhetioObject.create(). This is most useful if you don't need to keep the instance of
   * your GroupSortInteractionView.
   */ static create(model, primaryFocusedNode, providedOptions) {
        return new GroupSortInteractionView(model, primaryFocusedNode, providedOptions);
    }
    constructor(model, primaryFocusedNode, providedOptions){
        const options = optionize()({
            numberKeyMapper: null,
            onSort: _.noop,
            sortStep: 1,
            shiftSortStep: 2,
            pageSortStep: Math.ceil(providedOptions.sortingRangeProperty.value.getLength() / 5),
            sortingRangeListener: (newRange)=>{
                const selectedGroupItem = model.selectedGroupItemProperty.value;
                if (selectedGroupItem) {
                    const currentValue = model.getGroupItemValue(selectedGroupItem);
                    if (currentValue && !newRange.contains(currentValue)) {
                        model.selectedGroupItemProperty.value = providedOptions.getGroupItemToSelect();
                    }
                }
            }
        }, providedOptions);
        super(model, primaryFocusedNode, options);
        this.sortGroupItem = options.sortGroupItem;
        this.onSort = options.onSort;
        this.sortingRangeProperty = options.sortingRangeProperty;
        this.sortStep = options.sortStep;
        this.shiftSortStep = options.shiftSortStep;
        this.pageSortStep = options.pageSortStep;
        const selectedGroupItemProperty = this.model.selectedGroupItemProperty;
        const isGroupItemKeyboardGrabbedProperty = this.model.isGroupItemKeyboardGrabbedProperty;
        // If the new range doesn't include the current selection, reset back to the default heuristic.
        options.sortingRangeProperty.lazyLink(options.sortingRangeListener);
        this.disposeEmitter.addListener(()=>{
            options.sortingRangeProperty.unlink(options.sortingRangeListener);
        });
        const deltaKeyboardListener = new KeyboardListener({
            fireOnHold: true,
            keys: sortingKeys,
            fire: (event, keysPressed)=>{
                if (selectedGroupItemProperty.value !== null) {
                    const groupItem = selectedGroupItemProperty.value;
                    const oldValue = this.model.getGroupItemValue(groupItem);
                    assert && assert(oldValue !== null, 'We should have a group item when responding to input?');
                    // Sorting an item
                    if (isGroupItemKeyboardGrabbedProperty.value) {
                        // Don't do any sorting when disabled
                        // For these keys, the item will move by a particular delta
                        if (this.model.enabled && sortingKeys.includes(keysPressed)) {
                            const delta = this.getDeltaForKey(keysPressed);
                            assert && assert(delta !== null, 'should be a supported key');
                            const newValue = oldValue + delta;
                            this.onSortedValue(groupItem, newValue, oldValue);
                        }
                    } else {
                        // Selecting an item
                        const unclampedDelta = this.getDeltaForKey(keysPressed);
                        if (unclampedDelta !== null) {
                            this.model.hasKeyboardSelectedGroupItemProperty.value = true;
                            const clampedDelta = this.sortingRangeProperty.value.clampDelta(oldValue, unclampedDelta);
                            selectedGroupItemProperty.value = options.getNextSelectedGroupItem(clampedDelta, groupItem);
                        }
                    }
                    this.onGroupItemChange(groupItem);
                }
            }
        });
        if (options.numberKeyMapper) {
            const numbersKeyboardListener = new KeyboardListener({
                fireOnHold: true,
                keys: [
                    '1',
                    '2',
                    '3',
                    '4',
                    '5',
                    '6',
                    '7',
                    '8',
                    '9',
                    '0'
                ],
                fire: (event, keysPressed)=>{
                    if (selectedGroupItemProperty.value !== null && isGroupItemKeyboardGrabbedProperty.value && isSingleDigit(keysPressed)) {
                        const groupItem = selectedGroupItemProperty.value;
                        const oldValue = this.model.getGroupItemValue(groupItem);
                        assert && assert(oldValue !== null, 'We should have a group item when responding to input?');
                        assert && assert(isSingleDigit(keysPressed), 'sanity check on numbers for keyboard listener');
                        const mappedValue = options.numberKeyMapper(keysPressed);
                        if (mappedValue) {
                            this.onSortedValue(groupItem, mappedValue, oldValue);
                            this.onGroupItemChange(groupItem);
                        }
                    }
                }
            });
            primaryFocusedNode.addInputListener(numbersKeyboardListener);
            this.disposeEmitter.addListener(()=>{
                primaryFocusedNode.removeInputListener(numbersKeyboardListener);
                numbersKeyboardListener.dispose();
            });
        }
        primaryFocusedNode.addInputListener(deltaKeyboardListener);
        Multilink.multilink([
            model.isGroupItemKeyboardGrabbedProperty
        ], (isGrabbed)=>{
            primaryFocusedNode.setPDOMAttribute('aria-roledescription', isGrabbed ? sortableStringProperty : navigableStringProperty);
        });
        this.disposeEmitter.addListener(()=>{
            primaryFocusedNode.removeInputListener(deltaKeyboardListener);
            deltaKeyboardListener.dispose();
        });
    }
};
export { GroupSortInteractionView as default };
function isSingleDigit(key) {
    return /^\d$/.test(key);
}
sceneryPhet.register('GroupSortInteractionView', GroupSortInteractionView);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9hY2Nlc3NpYmlsaXR5L2dyb3VwLXNvcnQvdmlldy9Hcm91cFNvcnRJbnRlcmFjdGlvblZpZXcudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjQsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIFRoaXMgZG9jIGFzc3VtZXMgeW91IGhhdmUgcmVhZCB0aGUgZG9jIGluIEdyb3VwU2VsZWN0TW9kZWwuIFJlYWQgdGhhdCBmaXJzdCBhcyBpdCBleHBsYWlucyB0aGUgXCJncm91cCBzZWxlY3RcbiAqIGludGVyYWN0aW9uXCIgbW9yZSBnZW5lcmFsbHkuXG4gKlxuICogVGhpcyB0eXBlIGFkZHMgc29ydGluZyBvbiB0b3Agb2YgdGhlIEdyb3VwU2VsZWN0Vmlld1xuICogaW4gdGhlIGludGVyYWN0aW9uIGZvciAoa2V5Ym9hcmQpLlxuICpcbiAqIEBhdXRob3IgTWljaGFlbCBLYXV6bWFubiAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcbiAqIEBhdXRob3IgTWFybGEgU2NodWx6IChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxuICovXG5cbmltcG9ydCBNdWx0aWxpbmsgZnJvbSAnLi4vLi4vLi4vLi4vLi4vYXhvbi9qcy9NdWx0aWxpbmsuanMnO1xuaW1wb3J0IFRSZWFkT25seVByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uLy4uL2F4b24vanMvVFJlYWRPbmx5UHJvcGVydHkuanMnO1xuaW1wb3J0IFJhbmdlIGZyb20gJy4uLy4uLy4uLy4uLy4uL2RvdC9qcy9SYW5nZS5qcyc7XG5pbXBvcnQgb3B0aW9uaXplIGZyb20gJy4uLy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9vcHRpb25pemUuanMnO1xuaW1wb3J0IHsgS2V5Ym9hcmRMaXN0ZW5lciwgTm9kZSB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XG5pbXBvcnQgc2NlbmVyeVBoZXQgZnJvbSAnLi4vLi4vLi4vc2NlbmVyeVBoZXQuanMnO1xuaW1wb3J0IFNjZW5lcnlQaGV0U3RyaW5ncyBmcm9tICcuLi8uLi8uLi9TY2VuZXJ5UGhldFN0cmluZ3MuanMnO1xuaW1wb3J0IEdyb3VwU2VsZWN0TW9kZWwgZnJvbSAnLi4vbW9kZWwvR3JvdXBTZWxlY3RNb2RlbC5qcyc7XG5pbXBvcnQgR3JvdXBTZWxlY3RWaWV3LCB7IEdyb3VwU2VsZWN0Vmlld09wdGlvbnMgfSBmcm9tICcuL0dyb3VwU2VsZWN0Vmlldy5qcyc7XG5cbmNvbnN0IG5hdmlnYWJsZVN0cmluZ1Byb3BlcnR5ID0gU2NlbmVyeVBoZXRTdHJpbmdzLmExMXkuZ3JvdXBTb3J0Lm5hdmlnYWJsZVN0cmluZ1Byb3BlcnR5O1xuY29uc3Qgc29ydGFibGVTdHJpbmdQcm9wZXJ0eSA9IFNjZW5lcnlQaGV0U3RyaW5ncy5hMTF5Lmdyb3VwU29ydC5zb3J0YWJsZVN0cmluZ1Byb3BlcnR5O1xuXG50eXBlIFNlbGZPcHRpb25zPEl0ZW1Nb2RlbD4gPSB7XG5cbiAgLy8gR2l2ZW4gdGhlIGRlbHRhIChkaWZmZXJlbmNlIGZyb20gY3VycmVudCB2YWx1ZSB0byBuZXcgdmFsdWUpLCByZXR1cm4gdGhlIGNvcnJlc3BvbmRpbmcgbmV4dCBncm91cCBpdGVtIG1vZGVsIHRvIGJlIHNlbGVjdGVkLlxuICBnZXROZXh0U2VsZWN0ZWRHcm91cEl0ZW06ICggZGVsdGE6IG51bWJlciwgY3VycmVudGx5U2VsZWN0ZWRHcm91cEl0ZW06IEl0ZW1Nb2RlbCApID0+IEl0ZW1Nb2RlbDtcblxuICAvLyBUaGUgYXZhaWxhYmxlIHJhbmdlIGZvciBzb3J0aW5nLiBUaGlzIGlzIHRoZSBhY2NlcHRhYmxlIHJhbmdlIGZvciB0aGUgdmFsdWVQcm9wZXJ0eSBvZiBJdGVtTW9kZWwgKHNlZSBtb2RlbC5nZXRHcm91cEl0ZW1WYWx1ZSgpKS5cbiAgc29ydGluZ1JhbmdlUHJvcGVydHk6IFRSZWFkT25seVByb3BlcnR5PFJhbmdlPjtcblxuICBzb3J0aW5nUmFuZ2VMaXN0ZW5lcj86ICggcmFuZ2U6IFJhbmdlICkgPT4gdm9pZDtcblxuICAvLyBEbyB0aGUgc29ydCBvcGVyYXRpb24sIGFsbG93aW5nIGZvciBjdXN0b20gYWN0aW9ucywgbXVzdCBiZSBpbXBsZW1lbnRlZCBieSBhbGwgaW1wbGVtZW50YXRpb25zLCBidXQgbGlrZWx5IGp1c3RcbiAgLy8gc2hvdWxkIGRlZmF1bHQgdG8gdXBkYXRpbmcgdGhlIFwidmFsdWVQcm9wZXJ0eVwiIG9mIHRoZSBzZWxlY3RlZCBncm91cCBpdGVtIHRvIHRoZSBuZXcgdmFsdWUgdGhhdCBpcyBwcm92aWRlZC5cbiAgc29ydEdyb3VwSXRlbTogKCBncm91cEl0ZW06IEl0ZW1Nb2RlbCwgbmV3VmFsdWU6IG51bWJlciApID0+IHZvaWQ7XG5cbiAgLy8gQ2FsbGJhY2sgY2FsbGVkIGFmdGVyIGEgZ3JvdXAgaXRlbSBpcyBzb3J0ZWQuIE5vdGUgdGhhdCBzb3J0aW5nIG1heSBub3QgaGF2ZSBjaGFuZ2VkIGl0cyB2YWx1ZSAobGlrZSBpZiBhdCB0aGUgYm91bmRhcnlcbiAgLy8gdHJ5aW5nIHRvIG1vdmUgcGFzdCB0aGUgcmFuZ2UpLlxuICBvblNvcnQ/OiAoIGdyb3VwSXRlbTogSXRlbU1vZGVsLCBvbGRWYWx1ZTogbnVtYmVyICkgPT4gdm9pZDtcblxuICAvLyBJZiBwcm92aWRlZCwgbGlzdGVuIHRvIHRoZSBudW1iZXIga2V5cyBhcyB3ZWxsIHRvIHNvcnQgdGhlIHNlbGVjdGVkIGdyb3VwIGl0ZW0uIFByb3ZpZGUgdGhlIHZhbHVlIHRoYXQgdGhlXG4gIC8vIG51bWJlciBrZXkgbWFwcyB0by4gQSBkaXJlY3QgdmFsdWUsIG5vdCBhIGRlbHRhLiBJZiB0aGUgZnVuY3Rpb24gcmV0dXJucyBudWxsLCB0aGVuIG5vIGFjdGlvbiB0YWtlcyBwbGFjZSBmb3IgdGhlXG4gIC8vIGlucHV0LiBJZiB0aGUgb3B0aW9uIGlzIHNldCB0byBudWxsLCB0aGVuIG51bWJlciBrZXlzIHdpbGwgbm90IGJlIGxpc3RlbmVkIHRvIGZvciB0aGlzIGludGVyYWN0aW9uLlxuICBudW1iZXJLZXlNYXBwZXI/OiAoICggcHJlc3NlZEtleXM6IHN0cmluZyApID0+ICggbnVtYmVyIHwgbnVsbCApICkgfCBudWxsO1xuXG4gIC8vIFRoZSB2YWx1ZS1jaGFuZ2UgZGVsdGEgc3RlcCBzaXplIHdoZW4gc2VsZWN0aW5nL3NvcnRpbmcgdGhlIGdyb3VwIGl0ZW1zLlxuICBzb3J0U3RlcD86IG51bWJlcjsgICAvLyBhcnJvdyBrZXlzIG9yIFdBU0RcbiAgcGFnZVNvcnRTdGVwPzogbnVtYmVyOyAvLyBwYWdlLXVwL2Rvd24ga2V5c1xuICBzaGlmdFNvcnRTdGVwPzogbnVtYmVyOyAvLyBzaGlmdCthcnJvdyBrZXlzIG9yIHNoaWZ0K1dBU0Rcbn07XG5cbi8vIEEgbGlzdCBvZiBhbGwga2V5cyB0aGF0IGFyZSBsaXN0ZW5lZCB0bywgZXhjZXB0IHRob3NlIGNvdmVyZWQgYnkgdGhlIG51bWJlcktleU1hcHBlclxuY29uc3Qgc29ydGluZ0tleXMgPSBbXG4gICdkJywgJ2Fycm93UmlnaHQnLCAnYScsICdhcnJvd0xlZnQnLCAnYXJyb3dVcCcsICdhcnJvd0Rvd24nLCAndycsICdzJywgLy8gZGVmYXVsdC1zdGVwIHNvcnRcbiAgJ3NoaWZ0K2QnLCAnc2hpZnQrYXJyb3dSaWdodCcsICdzaGlmdCthJywgJ3NoaWZ0K2Fycm93TGVmdCcsICdzaGlmdCthcnJvd1VwJywgJ3NoaWZ0K2Fycm93RG93bicsICdzaGlmdCt3JywgJ3NoaWZ0K3MnLCAvLyBzaGlmdC1zdGVwIHNvcnRcbiAgJ3BhZ2VVcCcsICdwYWdlRG93bicsIC8vIHBhZ2Utc3RlcCBzb3J0XG4gICdob21lJywgJ2VuZCcgLy8gbWluL21heFxuXSBhcyBjb25zdDtcblxudHlwZSBQYXJlbnRPcHRpb25zPEl0ZW1Nb2RlbCwgSXRlbU5vZGUgZXh0ZW5kcyBOb2RlPiA9IEdyb3VwU2VsZWN0Vmlld09wdGlvbnM8SXRlbU1vZGVsLCBJdGVtTm9kZT47XG5leHBvcnQgdHlwZSBHcm91cFNvcnRJbnRlcmFjdGlvblZpZXdPcHRpb25zPEl0ZW1Nb2RlbCwgSXRlbU5vZGUgZXh0ZW5kcyBOb2RlPiA9IFNlbGZPcHRpb25zPEl0ZW1Nb2RlbD4gJlxuICBQYXJlbnRPcHRpb25zPEl0ZW1Nb2RlbCwgSXRlbU5vZGU+O1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBHcm91cFNvcnRJbnRlcmFjdGlvblZpZXc8SXRlbU1vZGVsLCBJdGVtTm9kZSBleHRlbmRzIE5vZGU+IGV4dGVuZHMgR3JvdXBTZWxlY3RWaWV3PEl0ZW1Nb2RlbCwgSXRlbU5vZGU+IHtcbiAgcHJpdmF0ZSByZWFkb25seSBzb3J0R3JvdXBJdGVtOiAoIGdyb3VwSXRlbTogSXRlbU1vZGVsLCBuZXdWYWx1ZTogbnVtYmVyICkgPT4gdm9pZDtcbiAgcHJpdmF0ZSByZWFkb25seSBvblNvcnQ6ICggZ3JvdXBJdGVtOiBJdGVtTW9kZWwsIG9sZFZhbHVlOiBudW1iZXIgKSA9PiB2b2lkO1xuICBwcml2YXRlIHJlYWRvbmx5IHNvcnRpbmdSYW5nZVByb3BlcnR5OiBUUmVhZE9ubHlQcm9wZXJ0eTxSYW5nZT47XG4gIHByaXZhdGUgcmVhZG9ubHkgc29ydFN0ZXA6IG51bWJlcjtcbiAgcHJpdmF0ZSByZWFkb25seSBzaGlmdFNvcnRTdGVwOiBudW1iZXI7XG4gIHByaXZhdGUgcmVhZG9ubHkgcGFnZVNvcnRTdGVwOiBudW1iZXI7XG5cbiAgcHVibGljIGNvbnN0cnVjdG9yKFxuICAgIG1vZGVsOiBHcm91cFNlbGVjdE1vZGVsPEl0ZW1Nb2RlbD4sXG4gICAgcHJpbWFyeUZvY3VzZWROb2RlOiBOb2RlLCAvLyBDbGllbnQgaXMgcmVzcG9uc2libGUgZm9yIHNldHRpbmcgYWNjZXNzaWJsZU5hbWUgYW5kIG5vdGhpbmcgZWxzZSFcbiAgICBwcm92aWRlZE9wdGlvbnM6IEdyb3VwU29ydEludGVyYWN0aW9uVmlld09wdGlvbnM8SXRlbU1vZGVsLCBJdGVtTm9kZT4gKSB7XG5cbiAgICBjb25zdCBvcHRpb25zID0gb3B0aW9uaXplPFxuICAgICAgR3JvdXBTb3J0SW50ZXJhY3Rpb25WaWV3T3B0aW9uczxJdGVtTW9kZWwsIEl0ZW1Ob2RlPixcbiAgICAgIFNlbGZPcHRpb25zPEl0ZW1Nb2RlbD4sXG4gICAgICBQYXJlbnRPcHRpb25zPEl0ZW1Nb2RlbCwgSXRlbU5vZGU+PigpKCB7XG4gICAgICBudW1iZXJLZXlNYXBwZXI6IG51bGwsXG4gICAgICBvblNvcnQ6IF8ubm9vcCxcbiAgICAgIHNvcnRTdGVwOiAxLFxuICAgICAgc2hpZnRTb3J0U3RlcDogMixcbiAgICAgIHBhZ2VTb3J0U3RlcDogTWF0aC5jZWlsKCBwcm92aWRlZE9wdGlvbnMuc29ydGluZ1JhbmdlUHJvcGVydHkudmFsdWUuZ2V0TGVuZ3RoKCkgLyA1ICksXG4gICAgICBzb3J0aW5nUmFuZ2VMaXN0ZW5lcjogKCBuZXdSYW5nZTogUmFuZ2UgKSA9PiB7XG4gICAgICAgIGNvbnN0IHNlbGVjdGVkR3JvdXBJdGVtID0gbW9kZWwuc2VsZWN0ZWRHcm91cEl0ZW1Qcm9wZXJ0eS52YWx1ZTtcbiAgICAgICAgaWYgKCBzZWxlY3RlZEdyb3VwSXRlbSApIHtcbiAgICAgICAgICBjb25zdCBjdXJyZW50VmFsdWUgPSBtb2RlbC5nZXRHcm91cEl0ZW1WYWx1ZSggc2VsZWN0ZWRHcm91cEl0ZW0gKTtcbiAgICAgICAgICBpZiAoIGN1cnJlbnRWYWx1ZSAmJiAhbmV3UmFuZ2UuY29udGFpbnMoIGN1cnJlbnRWYWx1ZSApICkge1xuICAgICAgICAgICAgbW9kZWwuc2VsZWN0ZWRHcm91cEl0ZW1Qcm9wZXJ0eS52YWx1ZSA9IHByb3ZpZGVkT3B0aW9ucy5nZXRHcm91cEl0ZW1Ub1NlbGVjdCgpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sIHByb3ZpZGVkT3B0aW9ucyApO1xuXG4gICAgc3VwZXIoIG1vZGVsLCBwcmltYXJ5Rm9jdXNlZE5vZGUsIG9wdGlvbnMgKTtcblxuICAgIHRoaXMuc29ydEdyb3VwSXRlbSA9IG9wdGlvbnMuc29ydEdyb3VwSXRlbTtcbiAgICB0aGlzLm9uU29ydCA9IG9wdGlvbnMub25Tb3J0O1xuICAgIHRoaXMuc29ydGluZ1JhbmdlUHJvcGVydHkgPSBvcHRpb25zLnNvcnRpbmdSYW5nZVByb3BlcnR5O1xuICAgIHRoaXMuc29ydFN0ZXAgPSBvcHRpb25zLnNvcnRTdGVwO1xuICAgIHRoaXMuc2hpZnRTb3J0U3RlcCA9IG9wdGlvbnMuc2hpZnRTb3J0U3RlcDtcbiAgICB0aGlzLnBhZ2VTb3J0U3RlcCA9IG9wdGlvbnMucGFnZVNvcnRTdGVwO1xuXG4gICAgY29uc3Qgc2VsZWN0ZWRHcm91cEl0ZW1Qcm9wZXJ0eSA9IHRoaXMubW9kZWwuc2VsZWN0ZWRHcm91cEl0ZW1Qcm9wZXJ0eTtcbiAgICBjb25zdCBpc0dyb3VwSXRlbUtleWJvYXJkR3JhYmJlZFByb3BlcnR5ID0gdGhpcy5tb2RlbC5pc0dyb3VwSXRlbUtleWJvYXJkR3JhYmJlZFByb3BlcnR5O1xuXG4gICAgLy8gSWYgdGhlIG5ldyByYW5nZSBkb2Vzbid0IGluY2x1ZGUgdGhlIGN1cnJlbnQgc2VsZWN0aW9uLCByZXNldCBiYWNrIHRvIHRoZSBkZWZhdWx0IGhldXJpc3RpYy5cbiAgICBvcHRpb25zLnNvcnRpbmdSYW5nZVByb3BlcnR5LmxhenlMaW5rKCBvcHRpb25zLnNvcnRpbmdSYW5nZUxpc3RlbmVyICk7XG4gICAgdGhpcy5kaXNwb3NlRW1pdHRlci5hZGRMaXN0ZW5lciggKCkgPT4ge1xuICAgICAgb3B0aW9ucy5zb3J0aW5nUmFuZ2VQcm9wZXJ0eS51bmxpbmsoIG9wdGlvbnMuc29ydGluZ1JhbmdlTGlzdGVuZXIgKTtcbiAgICB9ICk7XG5cbiAgICBjb25zdCBkZWx0YUtleWJvYXJkTGlzdGVuZXIgPSBuZXcgS2V5Ym9hcmRMaXN0ZW5lcigge1xuICAgICAgZmlyZU9uSG9sZDogdHJ1ZSxcbiAgICAgIGtleXM6IHNvcnRpbmdLZXlzLFxuICAgICAgZmlyZTogKCBldmVudCwga2V5c1ByZXNzZWQgKSA9PiB7XG5cbiAgICAgICAgaWYgKCBzZWxlY3RlZEdyb3VwSXRlbVByb3BlcnR5LnZhbHVlICE9PSBudWxsICkge1xuXG4gICAgICAgICAgY29uc3QgZ3JvdXBJdGVtID0gc2VsZWN0ZWRHcm91cEl0ZW1Qcm9wZXJ0eS52YWx1ZTtcbiAgICAgICAgICBjb25zdCBvbGRWYWx1ZSA9IHRoaXMubW9kZWwuZ2V0R3JvdXBJdGVtVmFsdWUoIGdyb3VwSXRlbSApITtcbiAgICAgICAgICBhc3NlcnQgJiYgYXNzZXJ0KCBvbGRWYWx1ZSAhPT0gbnVsbCwgJ1dlIHNob3VsZCBoYXZlIGEgZ3JvdXAgaXRlbSB3aGVuIHJlc3BvbmRpbmcgdG8gaW5wdXQ/JyApO1xuXG4gICAgICAgICAgLy8gU29ydGluZyBhbiBpdGVtXG4gICAgICAgICAgaWYgKCBpc0dyb3VwSXRlbUtleWJvYXJkR3JhYmJlZFByb3BlcnR5LnZhbHVlICkge1xuXG4gICAgICAgICAgICAvLyBEb24ndCBkbyBhbnkgc29ydGluZyB3aGVuIGRpc2FibGVkXG4gICAgICAgICAgICAvLyBGb3IgdGhlc2Uga2V5cywgdGhlIGl0ZW0gd2lsbCBtb3ZlIGJ5IGEgcGFydGljdWxhciBkZWx0YVxuICAgICAgICAgICAgaWYgKCB0aGlzLm1vZGVsLmVuYWJsZWQgJiYgc29ydGluZ0tleXMuaW5jbHVkZXMoIGtleXNQcmVzc2VkICkgKSB7XG4gICAgICAgICAgICAgIGNvbnN0IGRlbHRhID0gdGhpcy5nZXREZWx0YUZvcktleSgga2V5c1ByZXNzZWQgKSE7XG4gICAgICAgICAgICAgIGFzc2VydCAmJiBhc3NlcnQoIGRlbHRhICE9PSBudWxsLCAnc2hvdWxkIGJlIGEgc3VwcG9ydGVkIGtleScgKTtcbiAgICAgICAgICAgICAgY29uc3QgbmV3VmFsdWUgPSBvbGRWYWx1ZSArIGRlbHRhO1xuICAgICAgICAgICAgICB0aGlzLm9uU29ydGVkVmFsdWUoIGdyb3VwSXRlbSwgbmV3VmFsdWUsIG9sZFZhbHVlICk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgLy8gU2VsZWN0aW5nIGFuIGl0ZW1cbiAgICAgICAgICAgIGNvbnN0IHVuY2xhbXBlZERlbHRhID0gdGhpcy5nZXREZWx0YUZvcktleSgga2V5c1ByZXNzZWQgKTtcbiAgICAgICAgICAgIGlmICggdW5jbGFtcGVkRGVsdGEgIT09IG51bGwgKSB7XG4gICAgICAgICAgICAgIHRoaXMubW9kZWwuaGFzS2V5Ym9hcmRTZWxlY3RlZEdyb3VwSXRlbVByb3BlcnR5LnZhbHVlID0gdHJ1ZTtcblxuICAgICAgICAgICAgICBjb25zdCBjbGFtcGVkRGVsdGEgPSB0aGlzLnNvcnRpbmdSYW5nZVByb3BlcnR5LnZhbHVlLmNsYW1wRGVsdGEoIG9sZFZhbHVlLCB1bmNsYW1wZWREZWx0YSApO1xuICAgICAgICAgICAgICBzZWxlY3RlZEdyb3VwSXRlbVByb3BlcnR5LnZhbHVlID0gb3B0aW9ucy5nZXROZXh0U2VsZWN0ZWRHcm91cEl0ZW0oIGNsYW1wZWREZWx0YSwgZ3JvdXBJdGVtICk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIHRoaXMub25Hcm91cEl0ZW1DaGFuZ2UoIGdyb3VwSXRlbSApO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSApO1xuXG4gICAgaWYgKCBvcHRpb25zLm51bWJlcktleU1hcHBlciApIHtcbiAgICAgIGNvbnN0IG51bWJlcnNLZXlib2FyZExpc3RlbmVyID0gbmV3IEtleWJvYXJkTGlzdGVuZXIoIHtcbiAgICAgICAgZmlyZU9uSG9sZDogdHJ1ZSxcbiAgICAgICAga2V5czogWyAnMScsICcyJywgJzMnLCAnNCcsICc1JywgJzYnLCAnNycsICc4JywgJzknLCAnMCcgXSxcbiAgICAgICAgZmlyZTogKCBldmVudCwga2V5c1ByZXNzZWQgKSA9PiB7XG4gICAgICAgICAgaWYgKCBzZWxlY3RlZEdyb3VwSXRlbVByb3BlcnR5LnZhbHVlICE9PSBudWxsICYmIGlzR3JvdXBJdGVtS2V5Ym9hcmRHcmFiYmVkUHJvcGVydHkudmFsdWUgJiZcbiAgICAgICAgICAgICAgIGlzU2luZ2xlRGlnaXQoIGtleXNQcmVzc2VkICkgKSB7XG5cbiAgICAgICAgICAgIGNvbnN0IGdyb3VwSXRlbSA9IHNlbGVjdGVkR3JvdXBJdGVtUHJvcGVydHkudmFsdWU7XG4gICAgICAgICAgICBjb25zdCBvbGRWYWx1ZSA9IHRoaXMubW9kZWwuZ2V0R3JvdXBJdGVtVmFsdWUoIGdyb3VwSXRlbSApITtcbiAgICAgICAgICAgIGFzc2VydCAmJiBhc3NlcnQoIG9sZFZhbHVlICE9PSBudWxsLCAnV2Ugc2hvdWxkIGhhdmUgYSBncm91cCBpdGVtIHdoZW4gcmVzcG9uZGluZyB0byBpbnB1dD8nICk7XG4gICAgICAgICAgICBhc3NlcnQgJiYgYXNzZXJ0KCBpc1NpbmdsZURpZ2l0KCBrZXlzUHJlc3NlZCApLCAnc2FuaXR5IGNoZWNrIG9uIG51bWJlcnMgZm9yIGtleWJvYXJkIGxpc3RlbmVyJyApO1xuXG4gICAgICAgICAgICBjb25zdCBtYXBwZWRWYWx1ZSA9IG9wdGlvbnMubnVtYmVyS2V5TWFwcGVyISgga2V5c1ByZXNzZWQgKTtcbiAgICAgICAgICAgIGlmICggbWFwcGVkVmFsdWUgKSB7XG4gICAgICAgICAgICAgIHRoaXMub25Tb3J0ZWRWYWx1ZSggZ3JvdXBJdGVtLCBtYXBwZWRWYWx1ZSwgb2xkVmFsdWUgKTtcbiAgICAgICAgICAgICAgdGhpcy5vbkdyb3VwSXRlbUNoYW5nZSggZ3JvdXBJdGVtICk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9ICk7XG4gICAgICBwcmltYXJ5Rm9jdXNlZE5vZGUuYWRkSW5wdXRMaXN0ZW5lciggbnVtYmVyc0tleWJvYXJkTGlzdGVuZXIgKTtcbiAgICAgIHRoaXMuZGlzcG9zZUVtaXR0ZXIuYWRkTGlzdGVuZXIoICgpID0+IHtcbiAgICAgICAgcHJpbWFyeUZvY3VzZWROb2RlLnJlbW92ZUlucHV0TGlzdGVuZXIoIG51bWJlcnNLZXlib2FyZExpc3RlbmVyICk7XG4gICAgICAgIG51bWJlcnNLZXlib2FyZExpc3RlbmVyLmRpc3Bvc2UoKTtcbiAgICAgIH0gKTtcbiAgICB9XG4gICAgcHJpbWFyeUZvY3VzZWROb2RlLmFkZElucHV0TGlzdGVuZXIoIGRlbHRhS2V5Ym9hcmRMaXN0ZW5lciApO1xuXG4gICAgTXVsdGlsaW5rLm11bHRpbGluayggW1xuICAgICAgbW9kZWwuaXNHcm91cEl0ZW1LZXlib2FyZEdyYWJiZWRQcm9wZXJ0eVxuICAgIF0sIGlzR3JhYmJlZCA9PiB7XG4gICAgICBwcmltYXJ5Rm9jdXNlZE5vZGUuc2V0UERPTUF0dHJpYnV0ZSggJ2FyaWEtcm9sZWRlc2NyaXB0aW9uJywgaXNHcmFiYmVkID8gc29ydGFibGVTdHJpbmdQcm9wZXJ0eSA6IG5hdmlnYWJsZVN0cmluZ1Byb3BlcnR5ICk7XG4gICAgfSApO1xuXG5cbiAgICB0aGlzLmRpc3Bvc2VFbWl0dGVyLmFkZExpc3RlbmVyKCAoKSA9PiB7XG4gICAgICBwcmltYXJ5Rm9jdXNlZE5vZGUucmVtb3ZlSW5wdXRMaXN0ZW5lciggZGVsdGFLZXlib2FyZExpc3RlbmVyICk7XG4gICAgICBkZWx0YUtleWJvYXJkTGlzdGVuZXIuZGlzcG9zZSgpO1xuICAgIH0gKTtcbiAgfVxuXG4gIC8vIENvbmR1Y3QgdGhlIHNvcnRpbmcgb2YgYSB2YWx1ZVxuICBwcml2YXRlIG9uU29ydGVkVmFsdWUoIGdyb3VwSXRlbTogSXRlbU1vZGVsLCB2YWx1ZTogbnVtYmVyLCBvbGRWYWx1ZTogbnVtYmVyICk6IHZvaWQge1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIHZhbHVlICE9PSBudWxsLCAnV2Ugc2hvdWxkIGhhdmUgYSB2YWx1ZSBmb3IgdGhlIGdyb3VwIGl0ZW0gYnkgdGhlIGVuZCBvZiB0aGUgbGlzdGVuZXIuJyApO1xuXG4gICAgdGhpcy5zb3J0R3JvdXBJdGVtKCBncm91cEl0ZW0sIHRoaXMuc29ydGluZ1JhbmdlUHJvcGVydHkudmFsdWUuY29uc3RyYWluVmFsdWUoIHZhbHVlICkgKTtcbiAgICB0aGlzLm9uU29ydCggZ3JvdXBJdGVtLCBvbGRWYWx1ZSApO1xuICAgIHRoaXMubW9kZWwuaGFzS2V5Ym9hcmRTb3J0ZWRHcm91cEl0ZW1Qcm9wZXJ0eS52YWx1ZSA9IHRydWU7XG4gIH1cblxuICAvKipcbiAgICogR2V0IHRoZSBkZWx0YSB0byBjaGFuZ2UgdGhlIHZhbHVlIGdpdmVuIHdoYXQga2V5IHdhcyBwcmVzc2VkLiBUaGUgcmV0dXJuZWQgZGVsdGEgbWF5IG5vdCByZXN1bHQgaW4gYSB2YWx1ZSBpbiByYW5nZSxcbiAgICogcGxlYXNlIGNvbnN0cmFpbiB2YWx1ZSBmcm9tIHJhbmdlIG9yIHByb3ZpZGUgeW91ciBvd24gZGVmZW5zaXZlIG1lYXN1cmVzIHRvIHRoaXMgZGVsdGEuXG4gICAqL1xuICBwcml2YXRlIGdldERlbHRhRm9yS2V5KCBrZXk6IHN0cmluZyApOiBudW1iZXIgfCBudWxsIHtcbiAgICBjb25zdCBmdWxsUmFuZ2UgPSB0aGlzLnNvcnRpbmdSYW5nZVByb3BlcnR5LnZhbHVlLmdldExlbmd0aCgpO1xuICAgIHJldHVybiBrZXkgPT09ICdob21lJyA/IC1mdWxsUmFuZ2UgOlxuICAgICAgICAgICBrZXkgPT09ICdlbmQnID8gZnVsbFJhbmdlIDpcbiAgICAgICAgICAga2V5ID09PSAncGFnZURvd24nID8gLXRoaXMucGFnZVNvcnRTdGVwIDpcbiAgICAgICAgICAga2V5ID09PSAncGFnZVVwJyA/IHRoaXMucGFnZVNvcnRTdGVwIDpcbiAgICAgICAgICAgWyAnYXJyb3dMZWZ0JywgJ2EnLCAnYXJyb3dEb3duJywgJ3MnIF0uaW5jbHVkZXMoIGtleSApID8gLXRoaXMuc29ydFN0ZXAgOlxuICAgICAgICAgICBbICdhcnJvd1JpZ2h0JywgJ2QnLCAnYXJyb3dVcCcsICd3JyBdLmluY2x1ZGVzKCBrZXkgKSA/IHRoaXMuc29ydFN0ZXAgOlxuICAgICAgICAgICBbICdzaGlmdCthcnJvd0xlZnQnLCAnc2hpZnQrYScsICdzaGlmdCthcnJvd0Rvd24nLCAnc2hpZnQrcycgXS5pbmNsdWRlcygga2V5ICkgPyAtdGhpcy5zaGlmdFNvcnRTdGVwIDpcbiAgICAgICAgICAgWyAnc2hpZnQrYXJyb3dSaWdodCcsICdzaGlmdCtkJywgJ3NoaWZ0K2Fycm93VXAnLCAnc2hpZnQrdycgXS5pbmNsdWRlcygga2V5ICkgPyB0aGlzLnNoaWZ0U29ydFN0ZXAgOlxuICAgICAgICAgICBudWxsO1xuICB9XG5cbiAgcHVibGljIG92ZXJyaWRlIGRpc3Bvc2UoKTogdm9pZCB7XG4gICAgdGhpcy5ncm91cFNvcnRHcm91cEZvY3VzSGlnaGxpZ2h0UGF0aC5kaXNwb3NlKCk7XG4gICAgdGhpcy5ncmFiUmVsZWFzZUN1ZU5vZGUuZGlzcG9zZSgpO1xuICAgIHRoaXMucG9zaXRpb25Tb3J0Q3VlTm9kZUVtaXR0ZXIuZGlzcG9zZSgpO1xuICAgIHN1cGVyLmRpc3Bvc2UoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDcmVhdG9yIGZhY3RvcnksIHNpbWlsYXIgdG8gUGhldGlvT2JqZWN0LmNyZWF0ZSgpLiBUaGlzIGlzIG1vc3QgdXNlZnVsIGlmIHlvdSBkb24ndCBuZWVkIHRvIGtlZXAgdGhlIGluc3RhbmNlIG9mXG4gICAqIHlvdXIgR3JvdXBTb3J0SW50ZXJhY3Rpb25WaWV3LlxuICAgKi9cbiAgcHVibGljIHN0YXRpYyBvdmVycmlkZSBjcmVhdGU8SXRlbU1vZGVsLCBJdGVtTm9kZSBleHRlbmRzIE5vZGU+KFxuICAgIG1vZGVsOiBHcm91cFNlbGVjdE1vZGVsPEl0ZW1Nb2RlbD4sXG4gICAgcHJpbWFyeUZvY3VzZWROb2RlOiBOb2RlLFxuICAgIHByb3ZpZGVkT3B0aW9uczogR3JvdXBTb3J0SW50ZXJhY3Rpb25WaWV3T3B0aW9uczxJdGVtTW9kZWwsIEl0ZW1Ob2RlPiApOiBHcm91cFNvcnRJbnRlcmFjdGlvblZpZXc8SXRlbU1vZGVsLCBJdGVtTm9kZT4ge1xuXG4gICAgcmV0dXJuIG5ldyBHcm91cFNvcnRJbnRlcmFjdGlvblZpZXc8SXRlbU1vZGVsLCBJdGVtTm9kZT4oIG1vZGVsLCBwcmltYXJ5Rm9jdXNlZE5vZGUsIHByb3ZpZGVkT3B0aW9ucyApO1xuICB9XG59XG5cbmZ1bmN0aW9uIGlzU2luZ2xlRGlnaXQoIGtleTogc3RyaW5nICk6IGJvb2xlYW4geyByZXR1cm4gL15cXGQkLy50ZXN0KCBrZXkgKTt9XG5cbnNjZW5lcnlQaGV0LnJlZ2lzdGVyKCAnR3JvdXBTb3J0SW50ZXJhY3Rpb25WaWV3JywgR3JvdXBTb3J0SW50ZXJhY3Rpb25WaWV3ICk7Il0sIm5hbWVzIjpbIk11bHRpbGluayIsIm9wdGlvbml6ZSIsIktleWJvYXJkTGlzdGVuZXIiLCJzY2VuZXJ5UGhldCIsIlNjZW5lcnlQaGV0U3RyaW5ncyIsIkdyb3VwU2VsZWN0VmlldyIsIm5hdmlnYWJsZVN0cmluZ1Byb3BlcnR5IiwiYTExeSIsImdyb3VwU29ydCIsInNvcnRhYmxlU3RyaW5nUHJvcGVydHkiLCJzb3J0aW5nS2V5cyIsIkdyb3VwU29ydEludGVyYWN0aW9uVmlldyIsIm9uU29ydGVkVmFsdWUiLCJncm91cEl0ZW0iLCJ2YWx1ZSIsIm9sZFZhbHVlIiwiYXNzZXJ0Iiwic29ydEdyb3VwSXRlbSIsInNvcnRpbmdSYW5nZVByb3BlcnR5IiwiY29uc3RyYWluVmFsdWUiLCJvblNvcnQiLCJtb2RlbCIsImhhc0tleWJvYXJkU29ydGVkR3JvdXBJdGVtUHJvcGVydHkiLCJnZXREZWx0YUZvcktleSIsImtleSIsImZ1bGxSYW5nZSIsImdldExlbmd0aCIsInBhZ2VTb3J0U3RlcCIsImluY2x1ZGVzIiwic29ydFN0ZXAiLCJzaGlmdFNvcnRTdGVwIiwiZGlzcG9zZSIsImdyb3VwU29ydEdyb3VwRm9jdXNIaWdobGlnaHRQYXRoIiwiZ3JhYlJlbGVhc2VDdWVOb2RlIiwicG9zaXRpb25Tb3J0Q3VlTm9kZUVtaXR0ZXIiLCJjcmVhdGUiLCJwcmltYXJ5Rm9jdXNlZE5vZGUiLCJwcm92aWRlZE9wdGlvbnMiLCJvcHRpb25zIiwibnVtYmVyS2V5TWFwcGVyIiwiXyIsIm5vb3AiLCJNYXRoIiwiY2VpbCIsInNvcnRpbmdSYW5nZUxpc3RlbmVyIiwibmV3UmFuZ2UiLCJzZWxlY3RlZEdyb3VwSXRlbSIsInNlbGVjdGVkR3JvdXBJdGVtUHJvcGVydHkiLCJjdXJyZW50VmFsdWUiLCJnZXRHcm91cEl0ZW1WYWx1ZSIsImNvbnRhaW5zIiwiZ2V0R3JvdXBJdGVtVG9TZWxlY3QiLCJpc0dyb3VwSXRlbUtleWJvYXJkR3JhYmJlZFByb3BlcnR5IiwibGF6eUxpbmsiLCJkaXNwb3NlRW1pdHRlciIsImFkZExpc3RlbmVyIiwidW5saW5rIiwiZGVsdGFLZXlib2FyZExpc3RlbmVyIiwiZmlyZU9uSG9sZCIsImtleXMiLCJmaXJlIiwiZXZlbnQiLCJrZXlzUHJlc3NlZCIsImVuYWJsZWQiLCJkZWx0YSIsIm5ld1ZhbHVlIiwidW5jbGFtcGVkRGVsdGEiLCJoYXNLZXlib2FyZFNlbGVjdGVkR3JvdXBJdGVtUHJvcGVydHkiLCJjbGFtcGVkRGVsdGEiLCJjbGFtcERlbHRhIiwiZ2V0TmV4dFNlbGVjdGVkR3JvdXBJdGVtIiwib25Hcm91cEl0ZW1DaGFuZ2UiLCJudW1iZXJzS2V5Ym9hcmRMaXN0ZW5lciIsImlzU2luZ2xlRGlnaXQiLCJtYXBwZWRWYWx1ZSIsImFkZElucHV0TGlzdGVuZXIiLCJyZW1vdmVJbnB1dExpc3RlbmVyIiwibXVsdGlsaW5rIiwiaXNHcmFiYmVkIiwic2V0UERPTUF0dHJpYnV0ZSIsInRlc3QiLCJyZWdpc3RlciJdLCJtYXBwaW5ncyI6IkFBQUEsaURBQWlEO0FBRWpEOzs7Ozs7Ozs7Q0FTQyxHQUVELE9BQU9BLGVBQWUsc0NBQXNDO0FBRzVELE9BQU9DLGVBQWUsMkNBQTJDO0FBQ2pFLFNBQVNDLGdCQUFnQixRQUFjLHVDQUF1QztBQUM5RSxPQUFPQyxpQkFBaUIsMEJBQTBCO0FBQ2xELE9BQU9DLHdCQUF3QixpQ0FBaUM7QUFFaEUsT0FBT0MscUJBQWlELHVCQUF1QjtBQUUvRSxNQUFNQywwQkFBMEJGLG1CQUFtQkcsSUFBSSxDQUFDQyxTQUFTLENBQUNGLHVCQUF1QjtBQUN6RixNQUFNRyx5QkFBeUJMLG1CQUFtQkcsSUFBSSxDQUFDQyxTQUFTLENB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