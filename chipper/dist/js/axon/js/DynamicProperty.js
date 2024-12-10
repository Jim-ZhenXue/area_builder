// Copyright 2017-2024, University of Colorado Boulder
/**
 * Creates a Property that does synchronization of values with a swappable Property that itself can change.
 * Handles the case where you need a Property that can switch between acting like multiple other Properties.
 *
 * With no other options specified, the value of this Property is:
 * - null, if valuePropertyProperty.value === null
 * - valuePropertyProperty.value.value otherwise
 *
 * The value of this Property (generalized, with the options available) is:
 * - derive( defaultValue ), if valuePropertyProperty.value === null
 * - map( derive( valuePropertyProperty.value ).value ) otherwise
 *
 * Generally, this DynamicProperty uses one-way synchronization (it only listens to the source), but if the
 * 'bidirectional' option is true, it will use two-way synchronization (changes to this Property will change the active
 * source). Thus when this Property changes value (when bidirectional is true), it will set:
 * - derive( valuePropertyProperty.value ).value = inverseMap( this.value ), if valuePropertyProperty.value !== null
 *
 *******************************
 * General example
 *******************************
 *   const firstProperty = new Property( Color.RED );
 *   const secondProperty = new Property( Color.BLUE );
 *   const currentProperty = new Property( firstProperty ); // {Property.<Property.<Color>>}
 *
 *   const backgroundFill = new DynamicProperty( currentProperty ) // Turns into a {Property.<Color>}
 *   backgroundFill.value; // Color.RED, since: currentProperty.value === firstProperty and
 *                                              firstProperty.value === Color.RED
 *   firstProperty.value = Color.YELLOW;
 *   backgroundFill.value; // Color.YELLOW - It's connected to firstProperty right now
 *
 *   currentProperty.value = secondProperty;
 *   backgroundFill.value; // Color.BLUE - It's the secondProperty's value
 *
 *   secondProperty.value = Color.MAGENTA;
 *   backgroundFill.value; // Color.MAGENTA - Yes, it's listening to the other Property now.
 *
 * Also supports falling back to null if our main Property is set to null:
 *   currentProperty.value = null;
 *   backgroundFill.value; // null
 *
 *******************************
 * 'derive' option
 *******************************
 * Additionally, DynamicProperty supports the ability to derive the Property value from our main Property's value.
 * For example, say you have multiple scenes each with the type:
 *   scene: {
 *     backgroundColorProperty: {Property.<Color>}
 *   }
 * and you have a currentSceneProperty: {Property.<Scene>}, you may want to create:
 *   const currentBackgroundColorProperty = new DynamicProperty( currentSceneProperty, {
 *     derive: 'backgroundColorProperty'
 *   } );
 * This would always report the current scene's current background color.
 * What if you sometimes don't have a scene active, e.g. {Property.<Scene|null>}? You can provide a default value:
 *  new DynamicProperty( currentSceneProperty, {
 *    derive: 'backgroundColorProperty',
 *    defaultValue: Color.BLACK
 *  } );
 * So that if the currentSceneProperty's value is null, the value of our DynamicProperty will be Color.BLACK.
 * NOTE there are constraints using derive: 'string' when using parametric type parameters. See https://github.com/phetsims/projectile-data-lab/issues/10
 *
 *******************************
 * 'bidirectional' option
 *******************************
 * If you would like for direct changes to this Property to change the original source (bidirectional synchronization),
 * then pass bidirectional:true:
 *   const firstProperty = new Property( 5 );
 *   const secondProperty = new Property( 10 );
 *   const numberPropertyProperty = new Property( firstProperty );
 *   const dynamicProperty = new DynamicProperty( numberPropertyProperty, { bidirectional: true } );
 *   dynamicProperty.value = 2; // allowed now that it is bidirectional, otherwise prohibited
 *   firstProperty.value; // 2
 *   numberPropertyProperty.value = secondProperty; // change which Property is active
 *   dynamicProperty.value; // 10, from the new Property
 *   dynamicProperty.value = 0;
 *   secondProperty.value; // 0, set above.
 *   firstProperty.value; // still 2 from above, since our dynamic Property switched to the other Property
 *
 *******************************
 * 'map' and 'inverseMap' options
 *******************************
 * DynamicProperty also supports mapping values to different types. For example, say we have a
 * numberPropertyProperty {Property.<Property.<number>>}, but want to have a {Property.<string>} as the output. Then:
 *   new DynamicProperty( numberPropertyProperty, {
 *     map: function( number ) { return '' + number; }
 *   } );
 * will do the trick. If this needs to be done with a bidirectional DynamicProperty, also include inverseMap:
 *   new DynamicProperty( numberPropertyProperty, {
 *     bidirectional: true,
 *     map: function( number ) { return '' + number; },
 *     inverseMap: function( string ) { return Number.parseFloat( string ); }
 *   } );
 * so that changes to the dynamic Property will result in a change in the numberPropertyProperty's value.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ import optionize from '../../phet-core/js/optionize.js';
import axon from './axon.js';
import ReadOnlyProperty from './ReadOnlyProperty.js';
let DynamicProperty = class DynamicProperty extends ReadOnlyProperty {
    /**
   * Listener added to the active inner Property.
   *
   * @param value - Should be either our defaultValue (if valuePropertyProperty.value is null), or
   *                derive( valuePropertyProperty.value ).value otherwise.
   * @param oldValue - Ignored for our purposes, but is the 2nd parameter for Property listeners.
   * @param innerProperty
   */ onPropertyPropertyChange(value, oldValue, innerProperty) {
        // If the value of the inner Property is already the inverse of our value, we will never attempt to update our
        // own value in an attempt to limit "ping-ponging" cases mainly due to numerical error. Otherwise it would be
        // possible, given certain values and map/inverse, for both Properties to toggle back-and-forth.
        // See https://github.com/phetsims/axon/issues/197 for more details.
        if (this.bidirectional && this.valuePropertyProperty.value !== null && innerProperty) {
            const currentProperty = this.derive(this.valuePropertyProperty.value);
            // Notably, we only want to cancel interactions if the Property that sent the notification is still the Property
            // we are paying attention to.
            if (currentProperty === innerProperty && innerProperty.areValuesEqual(this.inverseMap(this.value), innerProperty.get())) {
                return;
            }
        }
        // Since we override the setter here, we need to call the version on the prototype
        super.set(this.map(value));
    }
    /**
   * Listener added to the outer Property.
   *
   * @param newPropertyValue - If derive is not provided then it should be a {Property.<*>|null}
   * @param oldPropertyValue - If derive is not provided then it should be a {Property.<*>|null}.
   *                                              We additionally handle the initial link() case where this is
   *                                              undefined.
   */ onPropertyChange(newPropertyValue, oldPropertyValue) {
        if (oldPropertyValue) {
            const propertyThatIsDerived = this.derive(oldPropertyValue); // eslint-disable-line phet/require-property-suffix
            // This assertion is vital to prevent memory leaks, there are order-dependency cases where this may trigger, (like
            // for PhET-iO State in https://github.com/phetsims/buoyancy/issues/67). In these cases, this unlink should not be
            // graceful because there IS another propertyThatIsDerived out there with this listener attached.
            assert && assert(propertyThatIsDerived.hasListener(this.propertyPropertyListener), 'DynamicProperty tried to clean up a listener on its propertyProperty that doesn\'t exist.');
            propertyThatIsDerived.unlink(this.propertyPropertyListener);
        }
        if (newPropertyValue) {
            this.derive(newPropertyValue).link(this.propertyPropertyListener);
        } else {
            // Switch to null when our Property's value is null.
            this.onPropertyPropertyChange(this.defaultValue, null, null);
        }
    }
    /**
   * Listener added to ourself when we are bidirectional
   */ onSelfChange(value) {
        assert && assert(this.bidirectional);
        if (this.valuePropertyProperty.value !== null) {
            const innerProperty = this.derive(this.valuePropertyProperty.value);
            // If our new value is the result of map() from the inner Property's value, we don't want to propagate that
            // change back to the innerProperty in the case where the map/inverseMap are not exact matches (generally due
            // to floating-point issues).
            // See https://github.com/phetsims/axon/issues/197 for more details.
            if (!this.areValuesEqual(value, this.map(innerProperty.value))) {
                // We'll fail at runtime if needed, this cast is needed since sometimes we can do non-bidirectional work on
                // things like a DerivedProperty
                innerProperty.value = this.inverseMap(value);
            }
        }
    }
    /**
   * Disposes this Property
   */ dispose() {
        assert && assert(!this.isDisposed, 'should not dispose twice, especially for DynamicProperty cleanup');
        this.valuePropertyProperty.unlink(this.propertyListener);
        if (this.valuePropertyProperty.value !== null) {
            const propertyThatIsDerived = this.derive(this.valuePropertyProperty.value); // eslint-disable-line phet/require-property-suffix
            // This assertion is vital to prevent memory leaks, there are order-dependency cases where this may trigger, (like
            // for PhET-iO State in https://github.com/phetsims/buoyancy/issues/67). In these cases, this unlink should not be
            // graceful because there IS another propertyThatIsDerived out there with this listener attached, and so
            // this DynamicProperty won't be disposed.
            assert && assert(propertyThatIsDerived.hasListener(this.propertyPropertyListener), 'DynamicProperty tried to clean up a listener on its propertyProperty that doesn\'t exist.');
            propertyThatIsDerived.unlink(this.propertyPropertyListener);
        }
        super.dispose();
    }
    /**
   * Resets the current property (if it's a Property instead of a TinyProperty)
   */ reset() {
        assert && assert(this.bidirectional, 'Cannot reset a non-bidirectional DynamicProperty');
        if (this.valuePropertyProperty.value !== null) {
            const property = this.derive(this.valuePropertyProperty.value);
            property.reset();
        }
    }
    /**
   * Prevent setting this Property manually if it is not marked as bidirectional.
   */ set(value) {
        assert && assert(this.bidirectional, `Cannot set values directly to a non-bidirectional DynamicProperty, tried to set: ${value}${this.isPhetioInstrumented() ? ' for ' + this.phetioID : ''}`);
        this.isExternallyChanging = true;
        super.set(value);
        this.isExternallyChanging = false;
    }
    /**
   * Overridden to make public
   */ get value() {
        return super.value;
    }
    /**
   * Overridden to make public
   * We ran performance tests on Chrome, and determined that calling super.value = newValue is statistically significantly
   * slower at the p = 0.10 level( looping over 10,000 value calls). Therefore, we prefer this optimization.
   */ set value(value) {
        this.set(value);
    }
    /**
   * Returns true if this Property value can be set externally, by set() or .value =
   */ isSettable() {
        return super.isSettable() || this.bidirectional;
    }
    /**
   * @param valuePropertyProperty - If the value is null, it is considered disconnected.
   * @param [providedOptions] - options
   */ constructor(valuePropertyProperty, providedOptions){
        const options = optionize()({
            bidirectional: false,
            defaultValue: null,
            derive: _.identity,
            map: _.identity,
            inverseMap: _.identity
        }, providedOptions);
        const optionsDerive = options.derive;
        const optionsMap = options.map;
        const optionsInverseMap = options.inverseMap;
        const derive = typeof optionsDerive === 'function' ? optionsDerive : (u)=>u[optionsDerive];
        const map = typeof optionsMap === 'function' ? optionsMap : (v)=>v[optionsMap];
        const inverseMap = typeof optionsInverseMap === 'function' ? optionsInverseMap : (t)=>t[optionsInverseMap];
        // Use the Property's initial value
        const initialValue = valuePropertyProperty.value === null ? map(options.defaultValue) : map(derive(valuePropertyProperty.value).value);
        super(initialValue, options);
        this.defaultValue = options.defaultValue;
        this.derive = derive;
        this.map = map;
        this.inverseMap = inverseMap;
        this.bidirectional = options.bidirectional;
        this.valuePropertyProperty = valuePropertyProperty;
        this.isExternallyChanging = false;
        this.propertyPropertyListener = this.onPropertyPropertyChange.bind(this);
        this.propertyListener = this.onPropertyChange.bind(this);
        // Rehook our listener to whatever is the active Property.
        valuePropertyProperty.link(this.propertyListener);
        // If we aren't bidirectional, we should never add this listener.
        if (options.bidirectional) {
            // No unlink needed, since our own disposal will remove this listener.
            this.lazyLink(this.onSelfChange.bind(this));
        }
    }
};
// ThisValueType: The value type of the resulting DynamicProperty
// InnerValueType: The value type of the inner (derived) Property, whose value gets mapped to ThisValueType and back
// OuterValueType: The value type of the main passed-in Property (whose value may be derived to the InnerValueType)
// e.g.:
// class Foo { colorProperty: Property<Color> }
// new DynamicProperty<number, Color, Foo>( someFooProperty, {
//   derive: 'colorProperty',
//   map: ( color: Color ) => color.alpha
// } );
// Here, ThisValueType=number (we're a Property<number>). You've passed in a Property<Foo>, so OuterValueType is a Foo.
// InnerValueType is what we get from our derive (Color), and what the parameter of our map is.
export { DynamicProperty as default };
axon.register('DynamicProperty', DynamicProperty);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2F4b24vanMvRHluYW1pY1Byb3BlcnR5LnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE3LTIwMjQsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIENyZWF0ZXMgYSBQcm9wZXJ0eSB0aGF0IGRvZXMgc3luY2hyb25pemF0aW9uIG9mIHZhbHVlcyB3aXRoIGEgc3dhcHBhYmxlIFByb3BlcnR5IHRoYXQgaXRzZWxmIGNhbiBjaGFuZ2UuXG4gKiBIYW5kbGVzIHRoZSBjYXNlIHdoZXJlIHlvdSBuZWVkIGEgUHJvcGVydHkgdGhhdCBjYW4gc3dpdGNoIGJldHdlZW4gYWN0aW5nIGxpa2UgbXVsdGlwbGUgb3RoZXIgUHJvcGVydGllcy5cbiAqXG4gKiBXaXRoIG5vIG90aGVyIG9wdGlvbnMgc3BlY2lmaWVkLCB0aGUgdmFsdWUgb2YgdGhpcyBQcm9wZXJ0eSBpczpcbiAqIC0gbnVsbCwgaWYgdmFsdWVQcm9wZXJ0eVByb3BlcnR5LnZhbHVlID09PSBudWxsXG4gKiAtIHZhbHVlUHJvcGVydHlQcm9wZXJ0eS52YWx1ZS52YWx1ZSBvdGhlcndpc2VcbiAqXG4gKiBUaGUgdmFsdWUgb2YgdGhpcyBQcm9wZXJ0eSAoZ2VuZXJhbGl6ZWQsIHdpdGggdGhlIG9wdGlvbnMgYXZhaWxhYmxlKSBpczpcbiAqIC0gZGVyaXZlKCBkZWZhdWx0VmFsdWUgKSwgaWYgdmFsdWVQcm9wZXJ0eVByb3BlcnR5LnZhbHVlID09PSBudWxsXG4gKiAtIG1hcCggZGVyaXZlKCB2YWx1ZVByb3BlcnR5UHJvcGVydHkudmFsdWUgKS52YWx1ZSApIG90aGVyd2lzZVxuICpcbiAqIEdlbmVyYWxseSwgdGhpcyBEeW5hbWljUHJvcGVydHkgdXNlcyBvbmUtd2F5IHN5bmNocm9uaXphdGlvbiAoaXQgb25seSBsaXN0ZW5zIHRvIHRoZSBzb3VyY2UpLCBidXQgaWYgdGhlXG4gKiAnYmlkaXJlY3Rpb25hbCcgb3B0aW9uIGlzIHRydWUsIGl0IHdpbGwgdXNlIHR3by13YXkgc3luY2hyb25pemF0aW9uIChjaGFuZ2VzIHRvIHRoaXMgUHJvcGVydHkgd2lsbCBjaGFuZ2UgdGhlIGFjdGl2ZVxuICogc291cmNlKS4gVGh1cyB3aGVuIHRoaXMgUHJvcGVydHkgY2hhbmdlcyB2YWx1ZSAod2hlbiBiaWRpcmVjdGlvbmFsIGlzIHRydWUpLCBpdCB3aWxsIHNldDpcbiAqIC0gZGVyaXZlKCB2YWx1ZVByb3BlcnR5UHJvcGVydHkudmFsdWUgKS52YWx1ZSA9IGludmVyc2VNYXAoIHRoaXMudmFsdWUgKSwgaWYgdmFsdWVQcm9wZXJ0eVByb3BlcnR5LnZhbHVlICE9PSBudWxsXG4gKlxuICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiAqIEdlbmVyYWwgZXhhbXBsZVxuICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiAqICAgY29uc3QgZmlyc3RQcm9wZXJ0eSA9IG5ldyBQcm9wZXJ0eSggQ29sb3IuUkVEICk7XG4gKiAgIGNvbnN0IHNlY29uZFByb3BlcnR5ID0gbmV3IFByb3BlcnR5KCBDb2xvci5CTFVFICk7XG4gKiAgIGNvbnN0IGN1cnJlbnRQcm9wZXJ0eSA9IG5ldyBQcm9wZXJ0eSggZmlyc3RQcm9wZXJ0eSApOyAvLyB7UHJvcGVydHkuPFByb3BlcnR5LjxDb2xvcj4+fVxuICpcbiAqICAgY29uc3QgYmFja2dyb3VuZEZpbGwgPSBuZXcgRHluYW1pY1Byb3BlcnR5KCBjdXJyZW50UHJvcGVydHkgKSAvLyBUdXJucyBpbnRvIGEge1Byb3BlcnR5LjxDb2xvcj59XG4gKiAgIGJhY2tncm91bmRGaWxsLnZhbHVlOyAvLyBDb2xvci5SRUQsIHNpbmNlOiBjdXJyZW50UHJvcGVydHkudmFsdWUgPT09IGZpcnN0UHJvcGVydHkgYW5kXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaXJzdFByb3BlcnR5LnZhbHVlID09PSBDb2xvci5SRURcbiAqICAgZmlyc3RQcm9wZXJ0eS52YWx1ZSA9IENvbG9yLllFTExPVztcbiAqICAgYmFja2dyb3VuZEZpbGwudmFsdWU7IC8vIENvbG9yLllFTExPVyAtIEl0J3MgY29ubmVjdGVkIHRvIGZpcnN0UHJvcGVydHkgcmlnaHQgbm93XG4gKlxuICogICBjdXJyZW50UHJvcGVydHkudmFsdWUgPSBzZWNvbmRQcm9wZXJ0eTtcbiAqICAgYmFja2dyb3VuZEZpbGwudmFsdWU7IC8vIENvbG9yLkJMVUUgLSBJdCdzIHRoZSBzZWNvbmRQcm9wZXJ0eSdzIHZhbHVlXG4gKlxuICogICBzZWNvbmRQcm9wZXJ0eS52YWx1ZSA9IENvbG9yLk1BR0VOVEE7XG4gKiAgIGJhY2tncm91bmRGaWxsLnZhbHVlOyAvLyBDb2xvci5NQUdFTlRBIC0gWWVzLCBpdCdzIGxpc3RlbmluZyB0byB0aGUgb3RoZXIgUHJvcGVydHkgbm93LlxuICpcbiAqIEFsc28gc3VwcG9ydHMgZmFsbGluZyBiYWNrIHRvIG51bGwgaWYgb3VyIG1haW4gUHJvcGVydHkgaXMgc2V0IHRvIG51bGw6XG4gKiAgIGN1cnJlbnRQcm9wZXJ0eS52YWx1ZSA9IG51bGw7XG4gKiAgIGJhY2tncm91bmRGaWxsLnZhbHVlOyAvLyBudWxsXG4gKlxuICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiAqICdkZXJpdmUnIG9wdGlvblxuICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiAqIEFkZGl0aW9uYWxseSwgRHluYW1pY1Byb3BlcnR5IHN1cHBvcnRzIHRoZSBhYmlsaXR5IHRvIGRlcml2ZSB0aGUgUHJvcGVydHkgdmFsdWUgZnJvbSBvdXIgbWFpbiBQcm9wZXJ0eSdzIHZhbHVlLlxuICogRm9yIGV4YW1wbGUsIHNheSB5b3UgaGF2ZSBtdWx0aXBsZSBzY2VuZXMgZWFjaCB3aXRoIHRoZSB0eXBlOlxuICogICBzY2VuZToge1xuICogICAgIGJhY2tncm91bmRDb2xvclByb3BlcnR5OiB7UHJvcGVydHkuPENvbG9yPn1cbiAqICAgfVxuICogYW5kIHlvdSBoYXZlIGEgY3VycmVudFNjZW5lUHJvcGVydHk6IHtQcm9wZXJ0eS48U2NlbmU+fSwgeW91IG1heSB3YW50IHRvIGNyZWF0ZTpcbiAqICAgY29uc3QgY3VycmVudEJhY2tncm91bmRDb2xvclByb3BlcnR5ID0gbmV3IER5bmFtaWNQcm9wZXJ0eSggY3VycmVudFNjZW5lUHJvcGVydHksIHtcbiAqICAgICBkZXJpdmU6ICdiYWNrZ3JvdW5kQ29sb3JQcm9wZXJ0eSdcbiAqICAgfSApO1xuICogVGhpcyB3b3VsZCBhbHdheXMgcmVwb3J0IHRoZSBjdXJyZW50IHNjZW5lJ3MgY3VycmVudCBiYWNrZ3JvdW5kIGNvbG9yLlxuICogV2hhdCBpZiB5b3Ugc29tZXRpbWVzIGRvbid0IGhhdmUgYSBzY2VuZSBhY3RpdmUsIGUuZy4ge1Byb3BlcnR5LjxTY2VuZXxudWxsPn0/IFlvdSBjYW4gcHJvdmlkZSBhIGRlZmF1bHQgdmFsdWU6XG4gKiAgbmV3IER5bmFtaWNQcm9wZXJ0eSggY3VycmVudFNjZW5lUHJvcGVydHksIHtcbiAqICAgIGRlcml2ZTogJ2JhY2tncm91bmRDb2xvclByb3BlcnR5JyxcbiAqICAgIGRlZmF1bHRWYWx1ZTogQ29sb3IuQkxBQ0tcbiAqICB9ICk7XG4gKiBTbyB0aGF0IGlmIHRoZSBjdXJyZW50U2NlbmVQcm9wZXJ0eSdzIHZhbHVlIGlzIG51bGwsIHRoZSB2YWx1ZSBvZiBvdXIgRHluYW1pY1Byb3BlcnR5IHdpbGwgYmUgQ29sb3IuQkxBQ0suXG4gKiBOT1RFIHRoZXJlIGFyZSBjb25zdHJhaW50cyB1c2luZyBkZXJpdmU6ICdzdHJpbmcnIHdoZW4gdXNpbmcgcGFyYW1ldHJpYyB0eXBlIHBhcmFtZXRlcnMuIFNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvcHJvamVjdGlsZS1kYXRhLWxhYi9pc3N1ZXMvMTBcbiAqXG4gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuICogJ2JpZGlyZWN0aW9uYWwnIG9wdGlvblxuICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiAqIElmIHlvdSB3b3VsZCBsaWtlIGZvciBkaXJlY3QgY2hhbmdlcyB0byB0aGlzIFByb3BlcnR5IHRvIGNoYW5nZSB0aGUgb3JpZ2luYWwgc291cmNlIChiaWRpcmVjdGlvbmFsIHN5bmNocm9uaXphdGlvbiksXG4gKiB0aGVuIHBhc3MgYmlkaXJlY3Rpb25hbDp0cnVlOlxuICogICBjb25zdCBmaXJzdFByb3BlcnR5ID0gbmV3IFByb3BlcnR5KCA1ICk7XG4gKiAgIGNvbnN0IHNlY29uZFByb3BlcnR5ID0gbmV3IFByb3BlcnR5KCAxMCApO1xuICogICBjb25zdCBudW1iZXJQcm9wZXJ0eVByb3BlcnR5ID0gbmV3IFByb3BlcnR5KCBmaXJzdFByb3BlcnR5ICk7XG4gKiAgIGNvbnN0IGR5bmFtaWNQcm9wZXJ0eSA9IG5ldyBEeW5hbWljUHJvcGVydHkoIG51bWJlclByb3BlcnR5UHJvcGVydHksIHsgYmlkaXJlY3Rpb25hbDogdHJ1ZSB9ICk7XG4gKiAgIGR5bmFtaWNQcm9wZXJ0eS52YWx1ZSA9IDI7IC8vIGFsbG93ZWQgbm93IHRoYXQgaXQgaXMgYmlkaXJlY3Rpb25hbCwgb3RoZXJ3aXNlIHByb2hpYml0ZWRcbiAqICAgZmlyc3RQcm9wZXJ0eS52YWx1ZTsgLy8gMlxuICogICBudW1iZXJQcm9wZXJ0eVByb3BlcnR5LnZhbHVlID0gc2Vjb25kUHJvcGVydHk7IC8vIGNoYW5nZSB3aGljaCBQcm9wZXJ0eSBpcyBhY3RpdmVcbiAqICAgZHluYW1pY1Byb3BlcnR5LnZhbHVlOyAvLyAxMCwgZnJvbSB0aGUgbmV3IFByb3BlcnR5XG4gKiAgIGR5bmFtaWNQcm9wZXJ0eS52YWx1ZSA9IDA7XG4gKiAgIHNlY29uZFByb3BlcnR5LnZhbHVlOyAvLyAwLCBzZXQgYWJvdmUuXG4gKiAgIGZpcnN0UHJvcGVydHkudmFsdWU7IC8vIHN0aWxsIDIgZnJvbSBhYm92ZSwgc2luY2Ugb3VyIGR5bmFtaWMgUHJvcGVydHkgc3dpdGNoZWQgdG8gdGhlIG90aGVyIFByb3BlcnR5XG4gKlxuICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiAqICdtYXAnIGFuZCAnaW52ZXJzZU1hcCcgb3B0aW9uc1xuICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiAqIER5bmFtaWNQcm9wZXJ0eSBhbHNvIHN1cHBvcnRzIG1hcHBpbmcgdmFsdWVzIHRvIGRpZmZlcmVudCB0eXBlcy4gRm9yIGV4YW1wbGUsIHNheSB3ZSBoYXZlIGFcbiAqIG51bWJlclByb3BlcnR5UHJvcGVydHkge1Byb3BlcnR5LjxQcm9wZXJ0eS48bnVtYmVyPj59LCBidXQgd2FudCB0byBoYXZlIGEge1Byb3BlcnR5LjxzdHJpbmc+fSBhcyB0aGUgb3V0cHV0LiBUaGVuOlxuICogICBuZXcgRHluYW1pY1Byb3BlcnR5KCBudW1iZXJQcm9wZXJ0eVByb3BlcnR5LCB7XG4gKiAgICAgbWFwOiBmdW5jdGlvbiggbnVtYmVyICkgeyByZXR1cm4gJycgKyBudW1iZXI7IH1cbiAqICAgfSApO1xuICogd2lsbCBkbyB0aGUgdHJpY2suIElmIHRoaXMgbmVlZHMgdG8gYmUgZG9uZSB3aXRoIGEgYmlkaXJlY3Rpb25hbCBEeW5hbWljUHJvcGVydHksIGFsc28gaW5jbHVkZSBpbnZlcnNlTWFwOlxuICogICBuZXcgRHluYW1pY1Byb3BlcnR5KCBudW1iZXJQcm9wZXJ0eVByb3BlcnR5LCB7XG4gKiAgICAgYmlkaXJlY3Rpb25hbDogdHJ1ZSxcbiAqICAgICBtYXA6IGZ1bmN0aW9uKCBudW1iZXIgKSB7IHJldHVybiAnJyArIG51bWJlcjsgfSxcbiAqICAgICBpbnZlcnNlTWFwOiBmdW5jdGlvbiggc3RyaW5nICkgeyByZXR1cm4gTnVtYmVyLnBhcnNlRmxvYXQoIHN0cmluZyApOyB9XG4gKiAgIH0gKTtcbiAqIHNvIHRoYXQgY2hhbmdlcyB0byB0aGUgZHluYW1pYyBQcm9wZXJ0eSB3aWxsIHJlc3VsdCBpbiBhIGNoYW5nZSBpbiB0aGUgbnVtYmVyUHJvcGVydHlQcm9wZXJ0eSdzIHZhbHVlLlxuICpcbiAqIEBhdXRob3IgSm9uYXRoYW4gT2xzb24gPGpvbmF0aGFuLm9sc29uQGNvbG9yYWRvLmVkdT5cbiAqL1xuXG5pbXBvcnQgb3B0aW9uaXplIGZyb20gJy4uLy4uL3BoZXQtY29yZS9qcy9vcHRpb25pemUuanMnO1xuaW1wb3J0IEtleXNNYXRjaGluZyBmcm9tICcuLi8uLi9waGV0LWNvcmUvanMvdHlwZXMvS2V5c01hdGNoaW5nLmpzJztcbmltcG9ydCBheG9uIGZyb20gJy4vYXhvbi5qcyc7XG5pbXBvcnQgUHJvcGVydHksIHsgUHJvcGVydHlPcHRpb25zIH0gZnJvbSAnLi9Qcm9wZXJ0eS5qcyc7XG5pbXBvcnQgUmVhZE9ubHlQcm9wZXJ0eSBmcm9tICcuL1JlYWRPbmx5UHJvcGVydHkuanMnO1xuaW1wb3J0IFRQcm9wZXJ0eSBmcm9tICcuL1RQcm9wZXJ0eS5qcyc7XG5pbXBvcnQgVFJlYWRPbmx5UHJvcGVydHkgZnJvbSAnLi9UUmVhZE9ubHlQcm9wZXJ0eS5qcyc7XG5cbmV4cG9ydCB0eXBlIFROdWxsYWJsZVByb3BlcnR5PFQ+ID0gVFJlYWRPbmx5UHJvcGVydHk8VCB8IG51bGw+IHwgVFJlYWRPbmx5UHJvcGVydHk8VD47XG5cbnR5cGUgU2VsZk9wdGlvbnM8VGhpc1ZhbHVlVHlwZSwgSW5uZXJWYWx1ZVR5cGUsIE91dGVyVmFsdWVUeXBlPiA9IHtcbiAgLy8gSWYgc2V0IHRvIHRydWUgdGhlbiBjaGFuZ2VzIHRvIHRoaXMgUHJvcGVydHkgKGlmIHZhbHVlUHJvcGVydHlQcm9wZXJ0eS52YWx1ZSBpcyBub24tbnVsbCBhdCB0aGUgdGltZSkgd2lsbCBhbHNvIGJlXG4gIC8vIG1hZGUgdG8gZGVyaXZlKCB2YWx1ZVByb3BlcnR5UHJvcGVydHkudmFsdWUgKS5cbiAgYmlkaXJlY3Rpb25hbD86IGJvb2xlYW47XG5cbiAgLy8gSWYgdmFsdWVQcm9wZXJ0eVByb3BlcnR5LnZhbHVlID09PSBudWxsLCB0aGlzIGR5bmFtaWNQcm9wZXJ0eSB3aWxsIGFjdCBpbnN0ZWFkIGxpa2VcbiAgLy8gZGVyaXZlKCB2YWx1ZVByb3BlcnR5UHJvcGVydHkudmFsdWUgKSA9PT0gbmV3IFByb3BlcnR5KCBkZWZhdWx0VmFsdWUgKS4gTm90ZSB0aGF0IGlmIGEgY3VzdG9tIG1hcCBmdW5jdGlvbiBpc1xuICAvLyBwcm92aWRlZCwgaXQgd2lsbCBiZSBhcHBsaWVkIHRvIHRoaXMgZGVmYXVsdFZhbHVlIHRvIGRldGVybWluZSBvdXIgUHJvcGVydHkncyB2YWx1ZS5cbiAgZGVmYXVsdFZhbHVlPzogSW5uZXJWYWx1ZVR5cGU7XG5cbiAgLy8gTWFwcyBhIG5vbi1udWxsIHZhbHVlUHJvcGVydHlQcm9wZXJ0eS52YWx1ZSBpbnRvIHRoZSBQcm9wZXJ0eSB0byBiZSB1c2VkLiBTZWUgdG9wLWxldmVsIGRvY3VtZW50YXRpb24gZm9yIHVzYWdlLlxuICAvLyBJZiBpdCdzIGEgc3RyaW5nLCBpdCB3aWxsIGdyYWIgdGhhdCBuYW1lZCBwcm9wZXJ0eSBvdXQgKGUuZy4gaXQncyBsaWtlIHBhc3NpbmcgdSA9PiB1WyBkZXJpdmUgXSlcbiAgLy8gTk9URTogVGhpcyBhY2NlcHRzIFRSZWFkT25seVByb3BlcnR5LCBidXQgaWYgeW91IGhhdmUgYmlkaXJlY3Rpb25hbDp0cnVlIGl0IG11c3QgYmUgYSBmdWxsIFRQcm9wZXJ0eS5cbiAgLy8gVGhpcyBpcyBub3QgY3VycmVudGx5IHR5cGUgY2hlY2tlZC5cbiAgLy8gTk9URSB0aGVyZSBhcmUgY29uc3RyYWludHMgdXNpbmcgZGVyaXZlOiAnc3RyaW5nJyB3aGVuIHVzaW5nIHBhcmFtZXRyaWMgdHlwZSBwYXJhbWV0ZXJzLiBTZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3Byb2plY3RpbGUtZGF0YS1sYWIvaXNzdWVzLzEwXG4gIGRlcml2ZT86ICggKCBvdXRlclZhbHVlOiBPdXRlclZhbHVlVHlwZSApID0+IFRSZWFkT25seVByb3BlcnR5PElubmVyVmFsdWVUeXBlPiApIHwgS2V5c01hdGNoaW5nPE91dGVyVmFsdWVUeXBlLCBUUmVhZE9ubHlQcm9wZXJ0eTxJbm5lclZhbHVlVHlwZT4+O1xuXG4gIC8vIE1hcHMgb3VyIGlucHV0IFByb3BlcnR5IHZhbHVlIHRvL2Zyb20gdGhpcyBQcm9wZXJ0eSdzIHZhbHVlLiBTZWUgdG9wLWxldmVsIGRvY3VtZW50YXRpb24gZm9yIHVzYWdlLlxuICAvLyBJZiBpdCdzIGEgc3RyaW5nLCBpdCB3aWxsIGdyYWIgdGhhdCBuYW1lZCBwcm9wZXJ0eSBvdXQgKGUuZy4gaXQncyBsaWtlIHBhc3NpbmcgdSA9PiB1WyBkZXJpdmUgXSlcbiAgbWFwPzogKCAoIGlubmVyVmFsdWU6IElubmVyVmFsdWVUeXBlICkgPT4gVGhpc1ZhbHVlVHlwZSApIHwgS2V5c01hdGNoaW5nPElubmVyVmFsdWVUeXBlLCBUaGlzVmFsdWVUeXBlPjtcbiAgaW52ZXJzZU1hcD86ICggKCB2YWx1ZTogVGhpc1ZhbHVlVHlwZSApID0+IElubmVyVmFsdWVUeXBlICkgfCBLZXlzTWF0Y2hpbmc8VGhpc1ZhbHVlVHlwZSwgSW5uZXJWYWx1ZVR5cGU+O1xufTtcblxuZXhwb3J0IHR5cGUgRHluYW1pY1Byb3BlcnR5T3B0aW9uczxUaGlzVmFsdWVUeXBlLCBJbm5lclZhbHVlVHlwZSwgT3V0ZXJWYWx1ZVR5cGU+ID0gU2VsZk9wdGlvbnM8VGhpc1ZhbHVlVHlwZSwgSW5uZXJWYWx1ZVR5cGUsIE91dGVyVmFsdWVUeXBlPiAmIFByb3BlcnR5T3B0aW9uczxUaGlzVmFsdWVUeXBlPjtcblxuLy8gVGhpc1ZhbHVlVHlwZTogVGhlIHZhbHVlIHR5cGUgb2YgdGhlIHJlc3VsdGluZyBEeW5hbWljUHJvcGVydHlcbi8vIElubmVyVmFsdWVUeXBlOiBUaGUgdmFsdWUgdHlwZSBvZiB0aGUgaW5uZXIgKGRlcml2ZWQpIFByb3BlcnR5LCB3aG9zZSB2YWx1ZSBnZXRzIG1hcHBlZCB0byBUaGlzVmFsdWVUeXBlIGFuZCBiYWNrXG4vLyBPdXRlclZhbHVlVHlwZTogVGhlIHZhbHVlIHR5cGUgb2YgdGhlIG1haW4gcGFzc2VkLWluIFByb3BlcnR5ICh3aG9zZSB2YWx1ZSBtYXkgYmUgZGVyaXZlZCB0byB0aGUgSW5uZXJWYWx1ZVR5cGUpXG4vLyBlLmcuOlxuLy8gY2xhc3MgRm9vIHsgY29sb3JQcm9wZXJ0eTogUHJvcGVydHk8Q29sb3I+IH1cbi8vIG5ldyBEeW5hbWljUHJvcGVydHk8bnVtYmVyLCBDb2xvciwgRm9vPiggc29tZUZvb1Byb3BlcnR5LCB7XG4vLyAgIGRlcml2ZTogJ2NvbG9yUHJvcGVydHknLFxuLy8gICBtYXA6ICggY29sb3I6IENvbG9yICkgPT4gY29sb3IuYWxwaGFcbi8vIH0gKTtcbi8vIEhlcmUsIFRoaXNWYWx1ZVR5cGU9bnVtYmVyICh3ZSdyZSBhIFByb3BlcnR5PG51bWJlcj4pLiBZb3UndmUgcGFzc2VkIGluIGEgUHJvcGVydHk8Rm9vPiwgc28gT3V0ZXJWYWx1ZVR5cGUgaXMgYSBGb28uXG4vLyBJbm5lclZhbHVlVHlwZSBpcyB3aGF0IHdlIGdldCBmcm9tIG91ciBkZXJpdmUgKENvbG9yKSwgYW5kIHdoYXQgdGhlIHBhcmFtZXRlciBvZiBvdXIgbWFwIGlzLlxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgRHluYW1pY1Byb3BlcnR5PFRoaXNWYWx1ZVR5cGUsIElubmVyVmFsdWVUeXBlLCBPdXRlclZhbHVlVHlwZT4gZXh0ZW5kcyBSZWFkT25seVByb3BlcnR5PFRoaXNWYWx1ZVR5cGU+IGltcGxlbWVudHMgVFByb3BlcnR5PFRoaXNWYWx1ZVR5cGU+IHtcblxuICAvLyBTZXQgdG8gdHJ1ZSB3aGVuIHRoaXMgUHJvcGVydHkncyB2YWx1ZSBpcyBjaGFuZ2luZyBmcm9tIGFuIGV4dGVybmFsIHNvdXJjZS4gVGhpcyBpcyB1c2VkIGluIFBvbHlub21pYWxFZGl0Tm9kZSB3aGljaCBpcyBub3QgeWV0IGluIFR5cGVTY3JpcHQuXG4gIHByaXZhdGUgaXNFeHRlcm5hbGx5Q2hhbmdpbmc6IGJvb2xlYW47XG5cbiAgcHJpdmF0ZSByZWFkb25seSBkZWZhdWx0VmFsdWU6IElubmVyVmFsdWVUeXBlO1xuICBwcm90ZWN0ZWQgcmVhZG9ubHkgZGVyaXZlOiAoIHU6IE91dGVyVmFsdWVUeXBlICkgPT4gVFJlYWRPbmx5UHJvcGVydHk8SW5uZXJWYWx1ZVR5cGU+O1xuICBwcm90ZWN0ZWQgcmVhZG9ubHkgbWFwOiAoIHY6IElubmVyVmFsdWVUeXBlICkgPT4gVGhpc1ZhbHVlVHlwZTtcbiAgcHJvdGVjdGVkIHJlYWRvbmx5IGludmVyc2VNYXA6ICggdDogVGhpc1ZhbHVlVHlwZSApID0+IElubmVyVmFsdWVUeXBlO1xuICBwcm90ZWN0ZWQgcmVhZG9ubHkgYmlkaXJlY3Rpb25hbDogYm9vbGVhbjtcbiAgcHJpdmF0ZSByZWFkb25seSB2YWx1ZVByb3BlcnR5UHJvcGVydHk6IFROdWxsYWJsZVByb3BlcnR5PE91dGVyVmFsdWVUeXBlPjtcbiAgcHJpdmF0ZSByZWFkb25seSBwcm9wZXJ0eVByb3BlcnR5TGlzdGVuZXI6ICggdmFsdWU6IElubmVyVmFsdWVUeXBlLCBvbGRWYWx1ZTogSW5uZXJWYWx1ZVR5cGUgfCBudWxsLCBpbm5lclByb3BlcnR5OiBUUmVhZE9ubHlQcm9wZXJ0eTxJbm5lclZhbHVlVHlwZT4gfCBudWxsICkgPT4gdm9pZDtcbiAgcHJpdmF0ZSByZWFkb25seSBwcm9wZXJ0eUxpc3RlbmVyOiAoIG5ld1Byb3BlcnR5VmFsdWU6IE91dGVyVmFsdWVUeXBlIHwgbnVsbCwgb2xkUHJvcGVydHlWYWx1ZTogT3V0ZXJWYWx1ZVR5cGUgfCBudWxsIHwgdW5kZWZpbmVkICkgPT4gdm9pZDtcblxuICAvKipcbiAgICogQHBhcmFtIHZhbHVlUHJvcGVydHlQcm9wZXJ0eSAtIElmIHRoZSB2YWx1ZSBpcyBudWxsLCBpdCBpcyBjb25zaWRlcmVkIGRpc2Nvbm5lY3RlZC5cbiAgICogQHBhcmFtIFtwcm92aWRlZE9wdGlvbnNdIC0gb3B0aW9uc1xuICAgKi9cbiAgcHVibGljIGNvbnN0cnVjdG9yKCB2YWx1ZVByb3BlcnR5UHJvcGVydHk6IFROdWxsYWJsZVByb3BlcnR5PE91dGVyVmFsdWVUeXBlPiB8IFRSZWFkT25seVByb3BlcnR5PE91dGVyVmFsdWVUeXBlPiwgcHJvdmlkZWRPcHRpb25zPzogRHluYW1pY1Byb3BlcnR5T3B0aW9uczxUaGlzVmFsdWVUeXBlLCBJbm5lclZhbHVlVHlwZSwgT3V0ZXJWYWx1ZVR5cGU+ICkge1xuXG4gICAgY29uc3Qgb3B0aW9ucyA9IG9wdGlvbml6ZTxEeW5hbWljUHJvcGVydHlPcHRpb25zPFRoaXNWYWx1ZVR5cGUsIElubmVyVmFsdWVUeXBlLCBPdXRlclZhbHVlVHlwZT4sIFNlbGZPcHRpb25zPFRoaXNWYWx1ZVR5cGUsIElubmVyVmFsdWVUeXBlLCBPdXRlclZhbHVlVHlwZT4sIFByb3BlcnR5T3B0aW9uczxUaGlzVmFsdWVUeXBlPj4oKSgge1xuICAgICAgYmlkaXJlY3Rpb25hbDogZmFsc2UsXG4gICAgICBkZWZhdWx0VmFsdWU6IG51bGwgYXMgdW5rbm93biBhcyBJbm5lclZhbHVlVHlwZSxcbiAgICAgIGRlcml2ZTogXy5pZGVudGl0eSxcbiAgICAgIG1hcDogXy5pZGVudGl0eSxcbiAgICAgIGludmVyc2VNYXA6IF8uaWRlbnRpdHlcbiAgICB9LCBwcm92aWRlZE9wdGlvbnMgKTtcblxuICAgIGNvbnN0IG9wdGlvbnNEZXJpdmUgPSBvcHRpb25zLmRlcml2ZTtcbiAgICBjb25zdCBvcHRpb25zTWFwID0gb3B0aW9ucy5tYXA7XG4gICAgY29uc3Qgb3B0aW9uc0ludmVyc2VNYXAgPSBvcHRpb25zLmludmVyc2VNYXA7XG5cbiAgICBjb25zdCBkZXJpdmU6ICggKCB1OiBPdXRlclZhbHVlVHlwZSApID0+IFRSZWFkT25seVByb3BlcnR5PElubmVyVmFsdWVUeXBlPiApID0gdHlwZW9mIG9wdGlvbnNEZXJpdmUgPT09ICdmdW5jdGlvbicgPyBvcHRpb25zRGVyaXZlIDogKCAoIHU6IE91dGVyVmFsdWVUeXBlICkgPT4gdVsgb3B0aW9uc0Rlcml2ZSBdIGFzIHVua25vd24gYXMgVFByb3BlcnR5PElubmVyVmFsdWVUeXBlPiApO1xuICAgIGNvbnN0IG1hcDogKCAoIHY6IElubmVyVmFsdWVUeXBlICkgPT4gVGhpc1ZhbHVlVHlwZSApID0gdHlwZW9mIG9wdGlvbnNNYXAgPT09ICdmdW5jdGlvbicgPyBvcHRpb25zTWFwIDogKCAoIHY6IElubmVyVmFsdWVUeXBlICkgPT4gdlsgb3B0aW9uc01hcCBdIGFzIHVua25vd24gYXMgVGhpc1ZhbHVlVHlwZSApO1xuICAgIGNvbnN0IGludmVyc2VNYXA6ICggKCB0OiBUaGlzVmFsdWVUeXBlICkgPT4gSW5uZXJWYWx1ZVR5cGUgKSA9IHR5cGVvZiBvcHRpb25zSW52ZXJzZU1hcCA9PT0gJ2Z1bmN0aW9uJyA/IG9wdGlvbnNJbnZlcnNlTWFwIDogKCAoIHQ6IFRoaXNWYWx1ZVR5cGUgKSA9PiB0WyBvcHRpb25zSW52ZXJzZU1hcCBdIGFzIHVua25vd24gYXMgSW5uZXJWYWx1ZVR5cGUgKTtcblxuICAgIC8vIFVzZSB0aGUgUHJvcGVydHkncyBpbml0aWFsIHZhbHVlXG4gICAgY29uc3QgaW5pdGlhbFZhbHVlID0gdmFsdWVQcm9wZXJ0eVByb3BlcnR5LnZhbHVlID09PSBudWxsID9cbiAgICAgICAgICAgICAgICAgICAgICAgICBtYXAoIG9wdGlvbnMuZGVmYXVsdFZhbHVlICkgOlxuICAgICAgICAgICAgICAgICAgICAgICAgIG1hcCggZGVyaXZlKCB2YWx1ZVByb3BlcnR5UHJvcGVydHkudmFsdWUgKS52YWx1ZSApO1xuXG4gICAgc3VwZXIoIGluaXRpYWxWYWx1ZSwgb3B0aW9ucyApO1xuXG4gICAgdGhpcy5kZWZhdWx0VmFsdWUgPSBvcHRpb25zLmRlZmF1bHRWYWx1ZTtcbiAgICB0aGlzLmRlcml2ZSA9IGRlcml2ZTtcbiAgICB0aGlzLm1hcCA9IG1hcDtcbiAgICB0aGlzLmludmVyc2VNYXAgPSBpbnZlcnNlTWFwO1xuICAgIHRoaXMuYmlkaXJlY3Rpb25hbCA9IG9wdGlvbnMuYmlkaXJlY3Rpb25hbDtcbiAgICB0aGlzLnZhbHVlUHJvcGVydHlQcm9wZXJ0eSA9IHZhbHVlUHJvcGVydHlQcm9wZXJ0eTtcbiAgICB0aGlzLmlzRXh0ZXJuYWxseUNoYW5naW5nID0gZmFsc2U7XG5cbiAgICB0aGlzLnByb3BlcnR5UHJvcGVydHlMaXN0ZW5lciA9IHRoaXMub25Qcm9wZXJ0eVByb3BlcnR5Q2hhbmdlLmJpbmQoIHRoaXMgKTtcbiAgICB0aGlzLnByb3BlcnR5TGlzdGVuZXIgPSB0aGlzLm9uUHJvcGVydHlDaGFuZ2UuYmluZCggdGhpcyApO1xuXG4gICAgLy8gUmVob29rIG91ciBsaXN0ZW5lciB0byB3aGF0ZXZlciBpcyB0aGUgYWN0aXZlIFByb3BlcnR5LlxuICAgIHZhbHVlUHJvcGVydHlQcm9wZXJ0eS5saW5rKCB0aGlzLnByb3BlcnR5TGlzdGVuZXIgKTtcblxuICAgIC8vIElmIHdlIGFyZW4ndCBiaWRpcmVjdGlvbmFsLCB3ZSBzaG91bGQgbmV2ZXIgYWRkIHRoaXMgbGlzdGVuZXIuXG4gICAgaWYgKCBvcHRpb25zLmJpZGlyZWN0aW9uYWwgKSB7XG4gICAgICAvLyBObyB1bmxpbmsgbmVlZGVkLCBzaW5jZSBvdXIgb3duIGRpc3Bvc2FsIHdpbGwgcmVtb3ZlIHRoaXMgbGlzdGVuZXIuXG4gICAgICB0aGlzLmxhenlMaW5rKCB0aGlzLm9uU2VsZkNoYW5nZS5iaW5kKCB0aGlzICkgKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogTGlzdGVuZXIgYWRkZWQgdG8gdGhlIGFjdGl2ZSBpbm5lciBQcm9wZXJ0eS5cbiAgICpcbiAgICogQHBhcmFtIHZhbHVlIC0gU2hvdWxkIGJlIGVpdGhlciBvdXIgZGVmYXVsdFZhbHVlIChpZiB2YWx1ZVByb3BlcnR5UHJvcGVydHkudmFsdWUgaXMgbnVsbCksIG9yXG4gICAqICAgICAgICAgICAgICAgIGRlcml2ZSggdmFsdWVQcm9wZXJ0eVByb3BlcnR5LnZhbHVlICkudmFsdWUgb3RoZXJ3aXNlLlxuICAgKiBAcGFyYW0gb2xkVmFsdWUgLSBJZ25vcmVkIGZvciBvdXIgcHVycG9zZXMsIGJ1dCBpcyB0aGUgMm5kIHBhcmFtZXRlciBmb3IgUHJvcGVydHkgbGlzdGVuZXJzLlxuICAgKiBAcGFyYW0gaW5uZXJQcm9wZXJ0eVxuICAgKi9cbiAgcHJpdmF0ZSBvblByb3BlcnR5UHJvcGVydHlDaGFuZ2UoIHZhbHVlOiBJbm5lclZhbHVlVHlwZSwgb2xkVmFsdWU6IElubmVyVmFsdWVUeXBlIHwgbnVsbCwgaW5uZXJQcm9wZXJ0eTogVFJlYWRPbmx5UHJvcGVydHk8SW5uZXJWYWx1ZVR5cGU+IHwgbnVsbCApOiB2b2lkIHtcblxuICAgIC8vIElmIHRoZSB2YWx1ZSBvZiB0aGUgaW5uZXIgUHJvcGVydHkgaXMgYWxyZWFkeSB0aGUgaW52ZXJzZSBvZiBvdXIgdmFsdWUsIHdlIHdpbGwgbmV2ZXIgYXR0ZW1wdCB0byB1cGRhdGUgb3VyXG4gICAgLy8gb3duIHZhbHVlIGluIGFuIGF0dGVtcHQgdG8gbGltaXQgXCJwaW5nLXBvbmdpbmdcIiBjYXNlcyBtYWlubHkgZHVlIHRvIG51bWVyaWNhbCBlcnJvci4gT3RoZXJ3aXNlIGl0IHdvdWxkIGJlXG4gICAgLy8gcG9zc2libGUsIGdpdmVuIGNlcnRhaW4gdmFsdWVzIGFuZCBtYXAvaW52ZXJzZSwgZm9yIGJvdGggUHJvcGVydGllcyB0byB0b2dnbGUgYmFjay1hbmQtZm9ydGguXG4gICAgLy8gU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9heG9uL2lzc3Vlcy8xOTcgZm9yIG1vcmUgZGV0YWlscy5cbiAgICBpZiAoIHRoaXMuYmlkaXJlY3Rpb25hbCAmJiB0aGlzLnZhbHVlUHJvcGVydHlQcm9wZXJ0eS52YWx1ZSAhPT0gbnVsbCAmJiBpbm5lclByb3BlcnR5ICkge1xuICAgICAgY29uc3QgY3VycmVudFByb3BlcnR5ID0gdGhpcy5kZXJpdmUoIHRoaXMudmFsdWVQcm9wZXJ0eVByb3BlcnR5LnZhbHVlICk7XG4gICAgICAvLyBOb3RhYmx5LCB3ZSBvbmx5IHdhbnQgdG8gY2FuY2VsIGludGVyYWN0aW9ucyBpZiB0aGUgUHJvcGVydHkgdGhhdCBzZW50IHRoZSBub3RpZmljYXRpb24gaXMgc3RpbGwgdGhlIFByb3BlcnR5XG4gICAgICAvLyB3ZSBhcmUgcGF5aW5nIGF0dGVudGlvbiB0by5cbiAgICAgIGlmICggY3VycmVudFByb3BlcnR5ID09PSBpbm5lclByb3BlcnR5ICYmIGlubmVyUHJvcGVydHkuYXJlVmFsdWVzRXF1YWwoIHRoaXMuaW52ZXJzZU1hcCggdGhpcy52YWx1ZSApLCBpbm5lclByb3BlcnR5LmdldCgpICkgKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBTaW5jZSB3ZSBvdmVycmlkZSB0aGUgc2V0dGVyIGhlcmUsIHdlIG5lZWQgdG8gY2FsbCB0aGUgdmVyc2lvbiBvbiB0aGUgcHJvdG90eXBlXG4gICAgc3VwZXIuc2V0KCB0aGlzLm1hcCggdmFsdWUgKSApO1xuICB9XG5cbiAgLyoqXG4gICAqIExpc3RlbmVyIGFkZGVkIHRvIHRoZSBvdXRlciBQcm9wZXJ0eS5cbiAgICpcbiAgICogQHBhcmFtIG5ld1Byb3BlcnR5VmFsdWUgLSBJZiBkZXJpdmUgaXMgbm90IHByb3ZpZGVkIHRoZW4gaXQgc2hvdWxkIGJlIGEge1Byb3BlcnR5LjwqPnxudWxsfVxuICAgKiBAcGFyYW0gb2xkUHJvcGVydHlWYWx1ZSAtIElmIGRlcml2ZSBpcyBub3QgcHJvdmlkZWQgdGhlbiBpdCBzaG91bGQgYmUgYSB7UHJvcGVydHkuPCo+fG51bGx9LlxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBXZSBhZGRpdGlvbmFsbHkgaGFuZGxlIHRoZSBpbml0aWFsIGxpbmsoKSBjYXNlIHdoZXJlIHRoaXMgaXNcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdW5kZWZpbmVkLlxuICAgKi9cbiAgcHJpdmF0ZSBvblByb3BlcnR5Q2hhbmdlKCBuZXdQcm9wZXJ0eVZhbHVlOiBPdXRlclZhbHVlVHlwZSB8IG51bGwsIG9sZFByb3BlcnR5VmFsdWU6IE91dGVyVmFsdWVUeXBlIHwgbnVsbCB8IHVuZGVmaW5lZCApOiB2b2lkIHtcbiAgICBpZiAoIG9sZFByb3BlcnR5VmFsdWUgKSB7XG4gICAgICBjb25zdCBwcm9wZXJ0eVRoYXRJc0Rlcml2ZWQgPSB0aGlzLmRlcml2ZSggb2xkUHJvcGVydHlWYWx1ZSApOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIHBoZXQvcmVxdWlyZS1wcm9wZXJ0eS1zdWZmaXhcblxuICAgICAgLy8gVGhpcyBhc3NlcnRpb24gaXMgdml0YWwgdG8gcHJldmVudCBtZW1vcnkgbGVha3MsIHRoZXJlIGFyZSBvcmRlci1kZXBlbmRlbmN5IGNhc2VzIHdoZXJlIHRoaXMgbWF5IHRyaWdnZXIsIChsaWtlXG4gICAgICAvLyBmb3IgUGhFVC1pTyBTdGF0ZSBpbiBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvYnVveWFuY3kvaXNzdWVzLzY3KS4gSW4gdGhlc2UgY2FzZXMsIHRoaXMgdW5saW5rIHNob3VsZCBub3QgYmVcbiAgICAgIC8vIGdyYWNlZnVsIGJlY2F1c2UgdGhlcmUgSVMgYW5vdGhlciBwcm9wZXJ0eVRoYXRJc0Rlcml2ZWQgb3V0IHRoZXJlIHdpdGggdGhpcyBsaXN0ZW5lciBhdHRhY2hlZC5cbiAgICAgIGFzc2VydCAmJiBhc3NlcnQoIHByb3BlcnR5VGhhdElzRGVyaXZlZC5oYXNMaXN0ZW5lciggdGhpcy5wcm9wZXJ0eVByb3BlcnR5TGlzdGVuZXIgKSxcbiAgICAgICAgJ0R5bmFtaWNQcm9wZXJ0eSB0cmllZCB0byBjbGVhbiB1cCBhIGxpc3RlbmVyIG9uIGl0cyBwcm9wZXJ0eVByb3BlcnR5IHRoYXQgZG9lc25cXCd0IGV4aXN0LicgKTtcblxuICAgICAgcHJvcGVydHlUaGF0SXNEZXJpdmVkLnVubGluayggdGhpcy5wcm9wZXJ0eVByb3BlcnR5TGlzdGVuZXIgKTtcbiAgICB9XG4gICAgaWYgKCBuZXdQcm9wZXJ0eVZhbHVlICkge1xuICAgICAgdGhpcy5kZXJpdmUoIG5ld1Byb3BlcnR5VmFsdWUgKS5saW5rKCB0aGlzLnByb3BlcnR5UHJvcGVydHlMaXN0ZW5lciApO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIC8vIFN3aXRjaCB0byBudWxsIHdoZW4gb3VyIFByb3BlcnR5J3MgdmFsdWUgaXMgbnVsbC5cbiAgICAgIHRoaXMub25Qcm9wZXJ0eVByb3BlcnR5Q2hhbmdlKCB0aGlzLmRlZmF1bHRWYWx1ZSwgbnVsbCwgbnVsbCApO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBMaXN0ZW5lciBhZGRlZCB0byBvdXJzZWxmIHdoZW4gd2UgYXJlIGJpZGlyZWN0aW9uYWxcbiAgICovXG4gIHByaXZhdGUgb25TZWxmQ2hhbmdlKCB2YWx1ZTogVGhpc1ZhbHVlVHlwZSApOiB2b2lkIHtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0aGlzLmJpZGlyZWN0aW9uYWwgKTtcblxuICAgIGlmICggdGhpcy52YWx1ZVByb3BlcnR5UHJvcGVydHkudmFsdWUgIT09IG51bGwgKSB7XG4gICAgICBjb25zdCBpbm5lclByb3BlcnR5ID0gdGhpcy5kZXJpdmUoIHRoaXMudmFsdWVQcm9wZXJ0eVByb3BlcnR5LnZhbHVlICk7XG5cbiAgICAgIC8vIElmIG91ciBuZXcgdmFsdWUgaXMgdGhlIHJlc3VsdCBvZiBtYXAoKSBmcm9tIHRoZSBpbm5lciBQcm9wZXJ0eSdzIHZhbHVlLCB3ZSBkb24ndCB3YW50IHRvIHByb3BhZ2F0ZSB0aGF0XG4gICAgICAvLyBjaGFuZ2UgYmFjayB0byB0aGUgaW5uZXJQcm9wZXJ0eSBpbiB0aGUgY2FzZSB3aGVyZSB0aGUgbWFwL2ludmVyc2VNYXAgYXJlIG5vdCBleGFjdCBtYXRjaGVzIChnZW5lcmFsbHkgZHVlXG4gICAgICAvLyB0byBmbG9hdGluZy1wb2ludCBpc3N1ZXMpLlxuICAgICAgLy8gU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9heG9uL2lzc3Vlcy8xOTcgZm9yIG1vcmUgZGV0YWlscy5cbiAgICAgIGlmICggIXRoaXMuYXJlVmFsdWVzRXF1YWwoIHZhbHVlLCB0aGlzLm1hcCggaW5uZXJQcm9wZXJ0eS52YWx1ZSApICkgKSB7XG4gICAgICAgIC8vIFdlJ2xsIGZhaWwgYXQgcnVudGltZSBpZiBuZWVkZWQsIHRoaXMgY2FzdCBpcyBuZWVkZWQgc2luY2Ugc29tZXRpbWVzIHdlIGNhbiBkbyBub24tYmlkaXJlY3Rpb25hbCB3b3JrIG9uXG4gICAgICAgIC8vIHRoaW5ncyBsaWtlIGEgRGVyaXZlZFByb3BlcnR5XG4gICAgICAgICggaW5uZXJQcm9wZXJ0eSBhcyBUUHJvcGVydHk8SW5uZXJWYWx1ZVR5cGU+ICkudmFsdWUgPSB0aGlzLmludmVyc2VNYXAoIHZhbHVlICk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIERpc3Bvc2VzIHRoaXMgUHJvcGVydHlcbiAgICovXG4gIHB1YmxpYyBvdmVycmlkZSBkaXNwb3NlKCk6IHZvaWQge1xuICAgIGFzc2VydCAmJiBhc3NlcnQoICF0aGlzLmlzRGlzcG9zZWQsICdzaG91bGQgbm90IGRpc3Bvc2UgdHdpY2UsIGVzcGVjaWFsbHkgZm9yIER5bmFtaWNQcm9wZXJ0eSBjbGVhbnVwJyApO1xuXG4gICAgdGhpcy52YWx1ZVByb3BlcnR5UHJvcGVydHkudW5saW5rKCB0aGlzLnByb3BlcnR5TGlzdGVuZXIgKTtcblxuICAgIGlmICggdGhpcy52YWx1ZVByb3BlcnR5UHJvcGVydHkudmFsdWUgIT09IG51bGwgKSB7XG4gICAgICBjb25zdCBwcm9wZXJ0eVRoYXRJc0Rlcml2ZWQgPSB0aGlzLmRlcml2ZSggdGhpcy52YWx1ZVByb3BlcnR5UHJvcGVydHkudmFsdWUgKTsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBwaGV0L3JlcXVpcmUtcHJvcGVydHktc3VmZml4XG5cbiAgICAgIC8vIFRoaXMgYXNzZXJ0aW9uIGlzIHZpdGFsIHRvIHByZXZlbnQgbWVtb3J5IGxlYWtzLCB0aGVyZSBhcmUgb3JkZXItZGVwZW5kZW5jeSBjYXNlcyB3aGVyZSB0aGlzIG1heSB0cmlnZ2VyLCAobGlrZVxuICAgICAgLy8gZm9yIFBoRVQtaU8gU3RhdGUgaW4gaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2J1b3lhbmN5L2lzc3Vlcy82NykuIEluIHRoZXNlIGNhc2VzLCB0aGlzIHVubGluayBzaG91bGQgbm90IGJlXG4gICAgICAvLyBncmFjZWZ1bCBiZWNhdXNlIHRoZXJlIElTIGFub3RoZXIgcHJvcGVydHlUaGF0SXNEZXJpdmVkIG91dCB0aGVyZSB3aXRoIHRoaXMgbGlzdGVuZXIgYXR0YWNoZWQsIGFuZCBzb1xuICAgICAgLy8gdGhpcyBEeW5hbWljUHJvcGVydHkgd29uJ3QgYmUgZGlzcG9zZWQuXG4gICAgICBhc3NlcnQgJiYgYXNzZXJ0KCBwcm9wZXJ0eVRoYXRJc0Rlcml2ZWQuaGFzTGlzdGVuZXIoIHRoaXMucHJvcGVydHlQcm9wZXJ0eUxpc3RlbmVyICksXG4gICAgICAgICdEeW5hbWljUHJvcGVydHkgdHJpZWQgdG8gY2xlYW4gdXAgYSBsaXN0ZW5lciBvbiBpdHMgcHJvcGVydHlQcm9wZXJ0eSB0aGF0IGRvZXNuXFwndCBleGlzdC4nICk7XG5cbiAgICAgIHByb3BlcnR5VGhhdElzRGVyaXZlZC51bmxpbmsoIHRoaXMucHJvcGVydHlQcm9wZXJ0eUxpc3RlbmVyICk7XG4gICAgfVxuXG4gICAgc3VwZXIuZGlzcG9zZSgpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlc2V0cyB0aGUgY3VycmVudCBwcm9wZXJ0eSAoaWYgaXQncyBhIFByb3BlcnR5IGluc3RlYWQgb2YgYSBUaW55UHJvcGVydHkpXG4gICAqL1xuICBwdWJsaWMgcmVzZXQoKTogdm9pZCB7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdGhpcy5iaWRpcmVjdGlvbmFsLCAnQ2Fubm90IHJlc2V0IGEgbm9uLWJpZGlyZWN0aW9uYWwgRHluYW1pY1Byb3BlcnR5JyApO1xuXG4gICAgaWYgKCB0aGlzLnZhbHVlUHJvcGVydHlQcm9wZXJ0eS52YWx1ZSAhPT0gbnVsbCApIHtcbiAgICAgIGNvbnN0IHByb3BlcnR5ID0gdGhpcy5kZXJpdmUoIHRoaXMudmFsdWVQcm9wZXJ0eVByb3BlcnR5LnZhbHVlICk7XG4gICAgICAoIHByb3BlcnR5IGFzIFByb3BlcnR5PElubmVyVmFsdWVUeXBlPiApLnJlc2V0KCk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFByZXZlbnQgc2V0dGluZyB0aGlzIFByb3BlcnR5IG1hbnVhbGx5IGlmIGl0IGlzIG5vdCBtYXJrZWQgYXMgYmlkaXJlY3Rpb25hbC5cbiAgICovXG4gIHB1YmxpYyBvdmVycmlkZSBzZXQoIHZhbHVlOiBUaGlzVmFsdWVUeXBlICk6IHZvaWQge1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIHRoaXMuYmlkaXJlY3Rpb25hbCxcbiAgICAgIGBDYW5ub3Qgc2V0IHZhbHVlcyBkaXJlY3RseSB0byBhIG5vbi1iaWRpcmVjdGlvbmFsIER5bmFtaWNQcm9wZXJ0eSwgdHJpZWQgdG8gc2V0OiAke3ZhbHVlfSR7dGhpcy5pc1BoZXRpb0luc3RydW1lbnRlZCgpID8gJyBmb3IgJyArIHRoaXMucGhldGlvSUQgOiAnJ31gXG4gICAgKTtcblxuICAgIHRoaXMuaXNFeHRlcm5hbGx5Q2hhbmdpbmcgPSB0cnVlO1xuICAgIHN1cGVyLnNldCggdmFsdWUgKTtcblxuICAgIHRoaXMuaXNFeHRlcm5hbGx5Q2hhbmdpbmcgPSBmYWxzZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBPdmVycmlkZGVuIHRvIG1ha2UgcHVibGljXG4gICAqL1xuICBwdWJsaWMgb3ZlcnJpZGUgZ2V0IHZhbHVlKCk6IFRoaXNWYWx1ZVR5cGUge1xuICAgIHJldHVybiBzdXBlci52YWx1ZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBPdmVycmlkZGVuIHRvIG1ha2UgcHVibGljXG4gICAqIFdlIHJhbiBwZXJmb3JtYW5jZSB0ZXN0cyBvbiBDaHJvbWUsIGFuZCBkZXRlcm1pbmVkIHRoYXQgY2FsbGluZyBzdXBlci52YWx1ZSA9IG5ld1ZhbHVlIGlzIHN0YXRpc3RpY2FsbHkgc2lnbmlmaWNhbnRseVxuICAgKiBzbG93ZXIgYXQgdGhlIHAgPSAwLjEwIGxldmVsKCBsb29waW5nIG92ZXIgMTAsMDAwIHZhbHVlIGNhbGxzKS4gVGhlcmVmb3JlLCB3ZSBwcmVmZXIgdGhpcyBvcHRpbWl6YXRpb24uXG4gICAqL1xuICBwdWJsaWMgb3ZlcnJpZGUgc2V0IHZhbHVlKCB2YWx1ZTogVGhpc1ZhbHVlVHlwZSApIHtcbiAgICB0aGlzLnNldCggdmFsdWUgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRydWUgaWYgdGhpcyBQcm9wZXJ0eSB2YWx1ZSBjYW4gYmUgc2V0IGV4dGVybmFsbHksIGJ5IHNldCgpIG9yIC52YWx1ZSA9XG4gICAqL1xuICBwdWJsaWMgb3ZlcnJpZGUgaXNTZXR0YWJsZSgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gc3VwZXIuaXNTZXR0YWJsZSgpIHx8IHRoaXMuYmlkaXJlY3Rpb25hbDtcbiAgfVxufVxuXG5heG9uLnJlZ2lzdGVyKCAnRHluYW1pY1Byb3BlcnR5JywgRHluYW1pY1Byb3BlcnR5ICk7Il0sIm5hbWVzIjpbIm9wdGlvbml6ZSIsImF4b24iLCJSZWFkT25seVByb3BlcnR5IiwiRHluYW1pY1Byb3BlcnR5Iiwib25Qcm9wZXJ0eVByb3BlcnR5Q2hhbmdlIiwidmFsdWUiLCJvbGRWYWx1ZSIsImlubmVyUHJvcGVydHkiLCJiaWRpcmVjdGlvbmFsIiwidmFsdWVQcm9wZXJ0eVByb3BlcnR5IiwiY3VycmVudFByb3BlcnR5IiwiZGVyaXZlIiwiYXJlVmFsdWVzRXF1YWwiLCJpbnZlcnNlTWFwIiwiZ2V0Iiwic2V0IiwibWFwIiwib25Qcm9wZXJ0eUNoYW5nZSIsIm5ld1Byb3BlcnR5VmFsdWUiLCJvbGRQcm9wZXJ0eVZhbHVlIiwicHJvcGVydHlUaGF0SXNEZXJpdmVkIiwiYXNzZXJ0IiwiaGFzTGlzdGVuZXIiLCJwcm9wZXJ0eVByb3BlcnR5TGlzdGVuZXIiLCJ1bmxpbmsiLCJsaW5rIiwiZGVmYXVsdFZhbHVlIiwib25TZWxmQ2hhbmdlIiwiZGlzcG9zZSIsImlzRGlzcG9zZWQiLCJwcm9wZXJ0eUxpc3RlbmVyIiwicmVzZXQiLCJwcm9wZXJ0eSIsImlzUGhldGlvSW5zdHJ1bWVudGVkIiwicGhldGlvSUQiLCJpc0V4dGVybmFsbHlDaGFuZ2luZyIsImlzU2V0dGFibGUiLCJwcm92aWRlZE9wdGlvbnMiLCJvcHRpb25zIiwiXyIsImlkZW50aXR5Iiwib3B0aW9uc0Rlcml2ZSIsIm9wdGlvbnNNYXAiLCJvcHRpb25zSW52ZXJzZU1hcCIsInUiLCJ2IiwidCIsImluaXRpYWxWYWx1ZSIsImJpbmQiLCJsYXp5TGluayIsInJlZ2lzdGVyIl0sIm1hcHBpbmdzIjoiQUFBQSxzREFBc0Q7QUFFdEQ7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0NBK0ZDLEdBRUQsT0FBT0EsZUFBZSxrQ0FBa0M7QUFFeEQsT0FBT0MsVUFBVSxZQUFZO0FBRTdCLE9BQU9DLHNCQUFzQix3QkFBd0I7QUEwQ3RDLElBQUEsQUFBTUMsa0JBQU4sTUFBTUEsd0JBQXVFRDtJQWdFMUY7Ozs7Ozs7R0FPQyxHQUNELEFBQVFFLHlCQUEwQkMsS0FBcUIsRUFBRUMsUUFBK0IsRUFBRUMsYUFBdUQsRUFBUztRQUV4Siw4R0FBOEc7UUFDOUcsNkdBQTZHO1FBQzdHLGdHQUFnRztRQUNoRyxvRUFBb0U7UUFDcEUsSUFBSyxJQUFJLENBQUNDLGFBQWEsSUFBSSxJQUFJLENBQUNDLHFCQUFxQixDQUFDSixLQUFLLEtBQUssUUFBUUUsZUFBZ0I7WUFDdEYsTUFBTUcsa0JBQWtCLElBQUksQ0FBQ0MsTUFBTSxDQUFFLElBQUksQ0FBQ0YscUJBQXFCLENBQUNKLEtBQUs7WUFDckUsZ0hBQWdIO1lBQ2hILDhCQUE4QjtZQUM5QixJQUFLSyxvQkFBb0JILGlCQUFpQkEsY0FBY0ssY0FBYyxDQUFFLElBQUksQ0FBQ0MsVUFBVSxDQUFFLElBQUksQ0FBQ1IsS0FBSyxHQUFJRSxjQUFjTyxHQUFHLEtBQU87Z0JBQzdIO1lBQ0Y7UUFDRjtRQUVBLGtGQUFrRjtRQUNsRixLQUFLLENBQUNDLElBQUssSUFBSSxDQUFDQyxHQUFHLENBQUVYO0lBQ3ZCO0lBRUE7Ozs7Ozs7R0FPQyxHQUNELEFBQVFZLGlCQUFrQkMsZ0JBQXVDLEVBQUVD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