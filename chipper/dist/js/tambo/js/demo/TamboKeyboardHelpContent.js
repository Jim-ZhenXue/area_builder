// Copyright 2018-2022, University of Colorado Boulder
/**
 * Content for the "Keyboard Shortcuts" dialog that can be brought up from the sim navigation bar.  This is stubbed,
 * since we need it for testing but this sim is not meant to be used outside of PhET.
 *
 * @author John Blanco (PhET Interactive Simulations)
 */ import BasicActionsKeyboardHelpSection from '../../../scenery-phet/js/keyboard/help/BasicActionsKeyboardHelpSection.js';
import { HBox } from '../../../scenery/js/imports.js';
import tambo from '../tambo.js';
let TamboKeyboardHelpContent = class TamboKeyboardHelpContent extends HBox {
    constructor(){
        super({
            children: [
                new BasicActionsKeyboardHelpSection()
            ],
            align: 'top',
            spacing: 30
        });
    }
};
tambo.register('TamboKeyboardHelpContent', TamboKeyboardHelpContent);
export default TamboKeyboardHelpContent;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3RhbWJvL2pzL2RlbW8vVGFtYm9LZXlib2FyZEhlbHBDb250ZW50LnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE4LTIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIENvbnRlbnQgZm9yIHRoZSBcIktleWJvYXJkIFNob3J0Y3V0c1wiIGRpYWxvZyB0aGF0IGNhbiBiZSBicm91Z2h0IHVwIGZyb20gdGhlIHNpbSBuYXZpZ2F0aW9uIGJhci4gIFRoaXMgaXMgc3R1YmJlZCxcbiAqIHNpbmNlIHdlIG5lZWQgaXQgZm9yIHRlc3RpbmcgYnV0IHRoaXMgc2ltIGlzIG5vdCBtZWFudCB0byBiZSB1c2VkIG91dHNpZGUgb2YgUGhFVC5cbiAqXG4gKiBAYXV0aG9yIEpvaG4gQmxhbmNvIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxuICovXG5cbmltcG9ydCBCYXNpY0FjdGlvbnNLZXlib2FyZEhlbHBTZWN0aW9uIGZyb20gJy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9rZXlib2FyZC9oZWxwL0Jhc2ljQWN0aW9uc0tleWJvYXJkSGVscFNlY3Rpb24uanMnO1xuaW1wb3J0IHsgSEJveCB9IGZyb20gJy4uLy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XG5pbXBvcnQgdGFtYm8gZnJvbSAnLi4vdGFtYm8uanMnO1xuXG5jbGFzcyBUYW1ib0tleWJvYXJkSGVscENvbnRlbnQgZXh0ZW5kcyBIQm94IHtcbiAgcHVibGljIGNvbnN0cnVjdG9yKCkge1xuICAgIHN1cGVyKCB7IGNoaWxkcmVuOiBbIG5ldyBCYXNpY0FjdGlvbnNLZXlib2FyZEhlbHBTZWN0aW9uKCkgXSwgYWxpZ246ICd0b3AnLCBzcGFjaW5nOiAzMCB9ICk7XG4gIH1cbn1cblxudGFtYm8ucmVnaXN0ZXIoICdUYW1ib0tleWJvYXJkSGVscENvbnRlbnQnLCBUYW1ib0tleWJvYXJkSGVscENvbnRlbnQgKTtcblxuZXhwb3J0IGRlZmF1bHQgVGFtYm9LZXlib2FyZEhlbHBDb250ZW50OyJdLCJuYW1lcyI6WyJCYXNpY0FjdGlvbnNLZXlib2FyZEhlbHBTZWN0aW9uIiwiSEJveCIsInRhbWJvIiwiVGFtYm9LZXlib2FyZEhlbHBDb250ZW50IiwiY2hpbGRyZW4iLCJhbGlnbiIsInNwYWNpbmciLCJyZWdpc3RlciJdLCJtYXBwaW5ncyI6IkFBQUEsc0RBQXNEO0FBRXREOzs7OztDQUtDLEdBRUQsT0FBT0EscUNBQXFDLDRFQUE0RTtBQUN4SCxTQUFTQyxJQUFJLFFBQVEsaUNBQWlDO0FBQ3RELE9BQU9DLFdBQVcsY0FBYztBQUVoQyxJQUFBLEFBQU1DLDJCQUFOLE1BQU1BLGlDQUFpQ0Y7SUFDckMsYUFBcUI7UUFDbkIsS0FBSyxDQUFFO1lBQUVHLFVBQVU7Z0JBQUUsSUFBSUo7YUFBbUM7WUFBRUssT0FBTztZQUFPQyxTQUFTO1FBQUc7SUFDMUY7QUFDRjtBQUVBSixNQUFNSyxRQUFRLENBQUUsNEJBQTRCSjtBQUU1QyxlQUFlQSx5QkFBeUIifQ==