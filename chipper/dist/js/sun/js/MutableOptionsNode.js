// Copyright 2017-2022, University of Colorado Boulder
/**
 * Assists "changing" options for types of nodes where the node does not support modifying the option.
 * This will create a new copy of the node whenever the options change, and will swap it into place.
 *
 * Given a type that has an option that can only be provided on construction (e.g. 'color' option for NumberPicker),
 * MutableOptionsNode can act like a mutable form of that Node. For example, if you have a color property:
 *
 * var colorProperty = new Property( 'red' );
 *
 * You can create a NumberPicker equivalent:
 *
 * var pickerContainer = new MutableOptionsNode( NumberPicker, [ arg1, arg2 ], {
 *   font: new PhetFont( 30 ) // normal properties that are passed in directly
 * }, {
 *   color: colorProperty // values wrapped with Property. When these change, a new NumberPicker is created and swapped.
 * }, {
 *   // Options passed to the wrapper node.
 * } );
 *
 * Now pickerContainer will have a child that is a NumberPicker, and pickerContainer.nodeProperty will point to the
 * current NumberPicker instance. The NumberPicker above will be created with like:
 *
 * new NumberPicker( arg1, arg2, {
 *   font: new PhetFont( 30 ),
 *   color: colorProperty.value
 * } )
 *
 * @author Jonathan Olson (PhET Interactive Simulations)
 */ import Multilink from '../../axon/js/Multilink.js';
import Property from '../../axon/js/Property.js';
import merge from '../../phet-core/js/merge.js';
import { Node } from '../../scenery/js/imports.js';
import sun from './sun.js';
/**
 * @deprecated Not a good fit for PhET-iO. Please design your component so that the item is mutable.
 */ let MutableOptionsNode = class MutableOptionsNode extends Node {
    /**
   * Creates a copy of our type of node, and replaces any existing copy.
   * @private
   */ replaceCopy() {
        const newCopy = this._constructInstance();
        const oldCopy = this.nodeProperty.value;
        this.nodeProperty.value = newCopy;
        // Add first, so that there's a good chance we won't change bounds (depending on the type)
        this.addChild(newCopy);
        if (oldCopy) {
            this.removeChild(oldCopy);
            this.disposeCopy(oldCopy);
        }
    }
    /**
   * Attempt to dispose an instance of our node.
   * @private
   *
   * @param {Node} copy
   */ disposeCopy(copy) {
        copy.dispose && copy.dispose();
    }
    /**
   * @public
   * @override
   */ dispose() {
        this.multilink.dispose();
        this.disposeCopy(this.nodeProperty.value);
        this.nodeProperty.dispose();
        super.dispose();
    }
    /**
   * @param {Function} nodeSubtype - The type of the node that we'll be constructing copies of.
   * @param {Array.<*>} parameters - Arbitrary initial parameters that will be passed to the type's constructor
   * @param {Object} staticOptions - Options passed in that won't change (will not unwrap properties)
   * @param {Object} dynamicOptions - Options passed in that will change. Should be a map from key names to
   *                                  Property.<*> values.
   * @param {Object} [wrapperOptions] - Node options passed to MutableOptionsNode itself (the wrapper).
   */ constructor(nodeSubtype, parameters, staticOptions, dynamicOptions, wrapperOptions){
        super();
        // @public {Property.<Node|null>} [read-only] - Holds our current copy of the node (or null, so we don't have a
        //                                              specific initial value).
        this.nodeProperty = new Property(null);
        // @private {function} - The constructor for our custom subtype, unwraps the Properties in dynamicOptions.
        this._constructInstance = ()=>Reflect.construct(nodeSubtype, [
                ...parameters,
                merge(_.mapValues(dynamicOptions, (property)=>property.value), staticOptions) // options
            ]);
        // @private {Multilink} - Make a copy, and replace it when one of our dyanmic options changes.
        this.multilink = Multilink.multilink(_.values(dynamicOptions), this.replaceCopy.bind(this));
        // Apply any options that make more sense on the wrapper (typically like positioning)
        this.mutate(wrapperOptions);
    }
};
sun.register('MutableOptionsNode', MutableOptionsNode);
export default MutableOptionsNode;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3N1bi9qcy9NdXRhYmxlT3B0aW9uc05vZGUuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTctMjAyMiwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbi8qKlxuICogQXNzaXN0cyBcImNoYW5naW5nXCIgb3B0aW9ucyBmb3IgdHlwZXMgb2Ygbm9kZXMgd2hlcmUgdGhlIG5vZGUgZG9lcyBub3Qgc3VwcG9ydCBtb2RpZnlpbmcgdGhlIG9wdGlvbi5cbiAqIFRoaXMgd2lsbCBjcmVhdGUgYSBuZXcgY29weSBvZiB0aGUgbm9kZSB3aGVuZXZlciB0aGUgb3B0aW9ucyBjaGFuZ2UsIGFuZCB3aWxsIHN3YXAgaXQgaW50byBwbGFjZS5cbiAqXG4gKiBHaXZlbiBhIHR5cGUgdGhhdCBoYXMgYW4gb3B0aW9uIHRoYXQgY2FuIG9ubHkgYmUgcHJvdmlkZWQgb24gY29uc3RydWN0aW9uIChlLmcuICdjb2xvcicgb3B0aW9uIGZvciBOdW1iZXJQaWNrZXIpLFxuICogTXV0YWJsZU9wdGlvbnNOb2RlIGNhbiBhY3QgbGlrZSBhIG11dGFibGUgZm9ybSBvZiB0aGF0IE5vZGUuIEZvciBleGFtcGxlLCBpZiB5b3UgaGF2ZSBhIGNvbG9yIHByb3BlcnR5OlxuICpcbiAqIHZhciBjb2xvclByb3BlcnR5ID0gbmV3IFByb3BlcnR5KCAncmVkJyApO1xuICpcbiAqIFlvdSBjYW4gY3JlYXRlIGEgTnVtYmVyUGlja2VyIGVxdWl2YWxlbnQ6XG4gKlxuICogdmFyIHBpY2tlckNvbnRhaW5lciA9IG5ldyBNdXRhYmxlT3B0aW9uc05vZGUoIE51bWJlclBpY2tlciwgWyBhcmcxLCBhcmcyIF0sIHtcbiAqICAgZm9udDogbmV3IFBoZXRGb250KCAzMCApIC8vIG5vcm1hbCBwcm9wZXJ0aWVzIHRoYXQgYXJlIHBhc3NlZCBpbiBkaXJlY3RseVxuICogfSwge1xuICogICBjb2xvcjogY29sb3JQcm9wZXJ0eSAvLyB2YWx1ZXMgd3JhcHBlZCB3aXRoIFByb3BlcnR5LiBXaGVuIHRoZXNlIGNoYW5nZSwgYSBuZXcgTnVtYmVyUGlja2VyIGlzIGNyZWF0ZWQgYW5kIHN3YXBwZWQuXG4gKiB9LCB7XG4gKiAgIC8vIE9wdGlvbnMgcGFzc2VkIHRvIHRoZSB3cmFwcGVyIG5vZGUuXG4gKiB9ICk7XG4gKlxuICogTm93IHBpY2tlckNvbnRhaW5lciB3aWxsIGhhdmUgYSBjaGlsZCB0aGF0IGlzIGEgTnVtYmVyUGlja2VyLCBhbmQgcGlja2VyQ29udGFpbmVyLm5vZGVQcm9wZXJ0eSB3aWxsIHBvaW50IHRvIHRoZVxuICogY3VycmVudCBOdW1iZXJQaWNrZXIgaW5zdGFuY2UuIFRoZSBOdW1iZXJQaWNrZXIgYWJvdmUgd2lsbCBiZSBjcmVhdGVkIHdpdGggbGlrZTpcbiAqXG4gKiBuZXcgTnVtYmVyUGlja2VyKCBhcmcxLCBhcmcyLCB7XG4gKiAgIGZvbnQ6IG5ldyBQaGV0Rm9udCggMzAgKSxcbiAqICAgY29sb3I6IGNvbG9yUHJvcGVydHkudmFsdWVcbiAqIH0gKVxuICpcbiAqIEBhdXRob3IgSm9uYXRoYW4gT2xzb24gKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXG4gKi9cblxuaW1wb3J0IE11bHRpbGluayBmcm9tICcuLi8uLi9heG9uL2pzL011bHRpbGluay5qcyc7XG5pbXBvcnQgUHJvcGVydHkgZnJvbSAnLi4vLi4vYXhvbi9qcy9Qcm9wZXJ0eS5qcyc7XG5pbXBvcnQgbWVyZ2UgZnJvbSAnLi4vLi4vcGhldC1jb3JlL2pzL21lcmdlLmpzJztcbmltcG9ydCB7IE5vZGUgfSBmcm9tICcuLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xuaW1wb3J0IHN1biBmcm9tICcuL3N1bi5qcyc7XG5cbi8qKlxuICogQGRlcHJlY2F0ZWQgTm90IGEgZ29vZCBmaXQgZm9yIFBoRVQtaU8uIFBsZWFzZSBkZXNpZ24geW91ciBjb21wb25lbnQgc28gdGhhdCB0aGUgaXRlbSBpcyBtdXRhYmxlLlxuICovXG5jbGFzcyBNdXRhYmxlT3B0aW9uc05vZGUgZXh0ZW5kcyBOb2RlIHtcblxuICAvKipcbiAgICogQHBhcmFtIHtGdW5jdGlvbn0gbm9kZVN1YnR5cGUgLSBUaGUgdHlwZSBvZiB0aGUgbm9kZSB0aGF0IHdlJ2xsIGJlIGNvbnN0cnVjdGluZyBjb3BpZXMgb2YuXG4gICAqIEBwYXJhbSB7QXJyYXkuPCo+fSBwYXJhbWV0ZXJzIC0gQXJiaXRyYXJ5IGluaXRpYWwgcGFyYW1ldGVycyB0aGF0IHdpbGwgYmUgcGFzc2VkIHRvIHRoZSB0eXBlJ3MgY29uc3RydWN0b3JcbiAgICogQHBhcmFtIHtPYmplY3R9IHN0YXRpY09wdGlvbnMgLSBPcHRpb25zIHBhc3NlZCBpbiB0aGF0IHdvbid0IGNoYW5nZSAod2lsbCBub3QgdW53cmFwIHByb3BlcnRpZXMpXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBkeW5hbWljT3B0aW9ucyAtIE9wdGlvbnMgcGFzc2VkIGluIHRoYXQgd2lsbCBjaGFuZ2UuIFNob3VsZCBiZSBhIG1hcCBmcm9tIGtleSBuYW1lcyB0b1xuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBQcm9wZXJ0eS48Kj4gdmFsdWVzLlxuICAgKiBAcGFyYW0ge09iamVjdH0gW3dyYXBwZXJPcHRpb25zXSAtIE5vZGUgb3B0aW9ucyBwYXNzZWQgdG8gTXV0YWJsZU9wdGlvbnNOb2RlIGl0c2VsZiAodGhlIHdyYXBwZXIpLlxuICAgKi9cbiAgY29uc3RydWN0b3IoIG5vZGVTdWJ0eXBlLCBwYXJhbWV0ZXJzLCBzdGF0aWNPcHRpb25zLCBkeW5hbWljT3B0aW9ucywgd3JhcHBlck9wdGlvbnMgKSB7XG4gICAgc3VwZXIoKTtcblxuICAgIC8vIEBwdWJsaWMge1Byb3BlcnR5LjxOb2RlfG51bGw+fSBbcmVhZC1vbmx5XSAtIEhvbGRzIG91ciBjdXJyZW50IGNvcHkgb2YgdGhlIG5vZGUgKG9yIG51bGwsIHNvIHdlIGRvbid0IGhhdmUgYVxuICAgIC8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNwZWNpZmljIGluaXRpYWwgdmFsdWUpLlxuICAgIHRoaXMubm9kZVByb3BlcnR5ID0gbmV3IFByb3BlcnR5KCBudWxsICk7XG5cbiAgICAvLyBAcHJpdmF0ZSB7ZnVuY3Rpb259IC0gVGhlIGNvbnN0cnVjdG9yIGZvciBvdXIgY3VzdG9tIHN1YnR5cGUsIHVud3JhcHMgdGhlIFByb3BlcnRpZXMgaW4gZHluYW1pY09wdGlvbnMuXG4gICAgdGhpcy5fY29uc3RydWN0SW5zdGFuY2UgPSAoKSA9PiBSZWZsZWN0LmNvbnN0cnVjdCggbm9kZVN1YnR5cGUsIFtcbiAgICAgIC4uLnBhcmFtZXRlcnMsXG4gICAgICBtZXJnZSggXy5tYXBWYWx1ZXMoIGR5bmFtaWNPcHRpb25zLCBwcm9wZXJ0eSA9PiBwcm9wZXJ0eS52YWx1ZSApLCBzdGF0aWNPcHRpb25zICkgLy8gb3B0aW9uc1xuICAgIF0gKTtcblxuICAgIC8vIEBwcml2YXRlIHtNdWx0aWxpbmt9IC0gTWFrZSBhIGNvcHksIGFuZCByZXBsYWNlIGl0IHdoZW4gb25lIG9mIG91ciBkeWFubWljIG9wdGlvbnMgY2hhbmdlcy5cbiAgICB0aGlzLm11bHRpbGluayA9IE11bHRpbGluay5tdWx0aWxpbmsoIF8udmFsdWVzKCBkeW5hbWljT3B0aW9ucyApLCB0aGlzLnJlcGxhY2VDb3B5LmJpbmQoIHRoaXMgKSApO1xuXG4gICAgLy8gQXBwbHkgYW55IG9wdGlvbnMgdGhhdCBtYWtlIG1vcmUgc2Vuc2Ugb24gdGhlIHdyYXBwZXIgKHR5cGljYWxseSBsaWtlIHBvc2l0aW9uaW5nKVxuICAgIHRoaXMubXV0YXRlKCB3cmFwcGVyT3B0aW9ucyApO1xuICB9XG5cbiAgLyoqXG4gICAqIENyZWF0ZXMgYSBjb3B5IG9mIG91ciB0eXBlIG9mIG5vZGUsIGFuZCByZXBsYWNlcyBhbnkgZXhpc3RpbmcgY29weS5cbiAgICogQHByaXZhdGVcbiAgICovXG4gIHJlcGxhY2VDb3B5KCkge1xuICAgIGNvbnN0IG5ld0NvcHkgPSB0aGlzLl9jb25zdHJ1Y3RJbnN0YW5jZSgpO1xuICAgIGNvbnN0IG9sZENvcHkgPSB0aGlzLm5vZGVQcm9wZXJ0eS52YWx1ZTtcbiAgICB0aGlzLm5vZGVQcm9wZXJ0eS52YWx1ZSA9IG5ld0NvcHk7XG5cbiAgICAvLyBBZGQgZmlyc3QsIHNvIHRoYXQgdGhlcmUncyBhIGdvb2QgY2hhbmNlIHdlIHdvbid0IGNoYW5nZSBib3VuZHMgKGRlcGVuZGluZyBvbiB0aGUgdHlwZSlcbiAgICB0aGlzLmFkZENoaWxkKCBuZXdDb3B5ICk7XG4gICAgaWYgKCBvbGRDb3B5ICkge1xuICAgICAgdGhpcy5yZW1vdmVDaGlsZCggb2xkQ29weSApO1xuICAgICAgdGhpcy5kaXNwb3NlQ29weSggb2xkQ29weSApO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBBdHRlbXB0IHRvIGRpc3Bvc2UgYW4gaW5zdGFuY2Ugb2Ygb3VyIG5vZGUuXG4gICAqIEBwcml2YXRlXG4gICAqXG4gICAqIEBwYXJhbSB7Tm9kZX0gY29weVxuICAgKi9cbiAgZGlzcG9zZUNvcHkoIGNvcHkgKSB7XG4gICAgY29weS5kaXNwb3NlICYmIGNvcHkuZGlzcG9zZSgpO1xuICB9XG5cbiAgLyoqXG4gICAqIEBwdWJsaWNcbiAgICogQG92ZXJyaWRlXG4gICAqL1xuICBkaXNwb3NlKCkge1xuICAgIHRoaXMubXVsdGlsaW5rLmRpc3Bvc2UoKTtcbiAgICB0aGlzLmRpc3Bvc2VDb3B5KCB0aGlzLm5vZGVQcm9wZXJ0eS52YWx1ZSApO1xuICAgIHRoaXMubm9kZVByb3BlcnR5LmRpc3Bvc2UoKTtcbiAgICBzdXBlci5kaXNwb3NlKCk7XG4gIH1cbn1cblxuc3VuLnJlZ2lzdGVyKCAnTXV0YWJsZU9wdGlvbnNOb2RlJywgTXV0YWJsZU9wdGlvbnNOb2RlICk7XG5leHBvcnQgZGVmYXVsdCBNdXRhYmxlT3B0aW9uc05vZGU7Il0sIm5hbWVzIjpbIk11bHRpbGluayIsIlByb3BlcnR5IiwibWVyZ2UiLCJOb2RlIiwic3VuIiwiTXV0YWJsZU9wdGlvbnNOb2RlIiwicmVwbGFjZUNvcHkiLCJuZXdDb3B5IiwiX2NvbnN0cnVjdEluc3RhbmNlIiwib2xkQ29weSIsIm5vZGVQcm9wZXJ0eSIsInZhbHVlIiwiYWRkQ2hpbGQiLCJyZW1vdmVDaGlsZCIsImRpc3Bvc2VDb3B5IiwiY29weSIsImRpc3Bvc2UiLCJtdWx0aWxpbmsiLCJjb25zdHJ1Y3RvciIsIm5vZGVTdWJ0eXBlIiwicGFyYW1ldGVycyIsInN0YXRpY09wdGlvbnMiLCJkeW5hbWljT3B0aW9ucyIsIndyYXBwZXJPcHRpb25zIiwiUmVmbGVjdCIsImNvbnN0cnVjdCIsIl8iLCJtYXBWYWx1ZXMiLCJwcm9wZXJ0eSIsInZhbHVlcyIsImJpbmQiLCJtdXRhdGUiLCJyZWdpc3RlciJdLCJtYXBwaW5ncyI6IkFBQUEsc0RBQXNEO0FBRXREOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0NBNEJDLEdBRUQsT0FBT0EsZUFBZSw2QkFBNkI7QUFDbkQsT0FBT0MsY0FBYyw0QkFBNEI7QUFDakQsT0FBT0MsV0FBVyw4QkFBOEI7QUFDaEQsU0FBU0MsSUFBSSxRQUFRLDhCQUE4QjtBQUNuRCxPQUFPQyxTQUFTLFdBQVc7QUFFM0I7O0NBRUMsR0FDRCxJQUFBLEFBQU1DLHFCQUFOLE1BQU1BLDJCQUEyQkY7SUE4Qi9COzs7R0FHQyxHQUNERyxjQUFjO1FBQ1osTUFBTUMsVUFBVSxJQUFJLENBQUNDLGtCQUFrQjtRQUN2QyxNQUFNQyxVQUFVLElBQUksQ0FBQ0MsWUFBWSxDQUFDQyxLQUFLO1FBQ3ZDLElBQUksQ0FBQ0QsWUFBWSxDQUFDQyxLQUFLLEdBQUdKO1FBRTFCLDBGQUEwRjtRQUMxRixJQUFJLENBQUNLLFFBQVEsQ0FBRUw7UUFDZixJQUFLRSxTQUFVO1lBQ2IsSUFBSSxDQUFDSSxXQUFXLENBQUVKO1lBQ2xCLElBQUksQ0FBQ0ssV0FBVyxDQUFFTDtRQUNwQjtJQUNGO0lBRUE7Ozs7O0dBS0MsR0FDREssWUFBYUMsSUFBSSxFQUFHO1FBQ2xCQSxLQUFLQyxPQUFPLElBQUlELEtBQUtDLE9BQU87SUFDOUI7SUFFQTs7O0dBR0MsR0FDREEsVUFBVTtRQUNSLElBQUksQ0FBQ0MsU0FBUyxDQUFDRCxPQUFPO1FBQ3RCLElBQUksQ0FBQ0YsV0FBVyxDQUFFLElBQUksQ0FBQ0osWUFBWSxDQUFDQyxLQUFLO1FBQ3pDLElBQUksQ0FBQ0QsWUFBWSxDQUFDTSxPQUFPO1FBQ3pCLEtBQUssQ0FBQ0E7SUFDUjtJQWhFQTs7Ozs7OztHQU9DLEdBQ0RFLFlBQWFDLFdBQVcsRUFBRUMsVUFBVSxFQUFFQyxhQUFhLEVBQUVDLGNBQWMsRUFBRUMsY0FBYyxDQUFHO1FBQ3BGLEtBQUs7UUFFTCwrR0FBK0c7UUFDL0csd0VBQXdFO1FBQ3hFLElBQUksQ0FBQ2IsWUFBWSxHQUFHLElBQUlULFNBQVU7UUFFbEMsMEdBQTBHO1FBQzFHLElBQUksQ0FBQ08sa0JBQWtCLEdBQUcsSUFBTWdCLFFBQVFDLFNBQVMsQ0FBRU4sYUFBYTttQkFDM0RDO2dCQUNIbEIsTUFBT3dCLEVBQUVDLFNBQVMsQ0FBRUwsZ0JBQWdCTSxDQUFBQSxXQUFZQSxTQUFTakIsS0FBSyxHQUFJVSxlQUFnQixVQUFVO2FBQzdGO1FBRUQsOEZBQThGO1FBQzlGLElBQUksQ0FBQ0osU0FBUyxHQUFHakIsVUFBVWlCLFNBQVMsQ0FBRVMsRUFBRUcsTUFBTSxDQUFFUCxpQkFBa0IsSUFBSSxDQUFDaEIsV0FBVyxDQUFDd0IsSUFBSSxDQUFFLElBQUk7UUFFN0YscUZBQXFGO1FBQ3JGLElBQUksQ0FBQ0MsTUFBTSxDQUFFUjtJQUNmO0FBdUNGO0FBRUFuQixJQUFJNEIsUUFBUSxDQUFFLHNCQUFzQjNCO0FBQ3BDLGVBQWVBLG1CQUFtQiJ9