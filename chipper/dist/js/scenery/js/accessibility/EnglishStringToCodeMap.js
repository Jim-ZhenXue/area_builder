// Copyright 2022-2024, University of Colorado Boulder
/**
 * Maps the english key you want to use to the associated KeyboardEvent.codes for usage in listeners.
 * If a key has multiple code values, listener behavior will fire if either are pressed.
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */ import { KeyboardUtils, scenery } from '../imports.js';
const EnglishStringToCodeMap = {
    // Letter keys
    q: [
        KeyboardUtils.KEY_Q
    ],
    w: [
        KeyboardUtils.KEY_W
    ],
    e: [
        KeyboardUtils.KEY_E
    ],
    r: [
        KeyboardUtils.KEY_R
    ],
    t: [
        KeyboardUtils.KEY_T
    ],
    y: [
        KeyboardUtils.KEY_Y
    ],
    u: [
        KeyboardUtils.KEY_U
    ],
    i: [
        KeyboardUtils.KEY_I
    ],
    o: [
        KeyboardUtils.KEY_O
    ],
    p: [
        KeyboardUtils.KEY_P
    ],
    a: [
        KeyboardUtils.KEY_A
    ],
    s: [
        KeyboardUtils.KEY_S
    ],
    d: [
        KeyboardUtils.KEY_D
    ],
    f: [
        KeyboardUtils.KEY_F
    ],
    g: [
        KeyboardUtils.KEY_G
    ],
    h: [
        KeyboardUtils.KEY_H
    ],
    j: [
        KeyboardUtils.KEY_J
    ],
    k: [
        KeyboardUtils.KEY_K
    ],
    l: [
        KeyboardUtils.KEY_L
    ],
    z: [
        KeyboardUtils.KEY_Z
    ],
    x: [
        KeyboardUtils.KEY_X
    ],
    c: [
        KeyboardUtils.KEY_C
    ],
    v: [
        KeyboardUtils.KEY_V
    ],
    b: [
        KeyboardUtils.KEY_B
    ],
    n: [
        KeyboardUtils.KEY_N
    ],
    m: [
        KeyboardUtils.KEY_M
    ],
    // number keys - number and numpad
    0: [
        KeyboardUtils.KEY_0,
        KeyboardUtils.KEY_NUMPAD_0
    ],
    1: [
        KeyboardUtils.KEY_1,
        KeyboardUtils.KEY_NUMPAD_1
    ],
    2: [
        KeyboardUtils.KEY_2,
        KeyboardUtils.KEY_NUMPAD_2
    ],
    3: [
        KeyboardUtils.KEY_3,
        KeyboardUtils.KEY_NUMPAD_3
    ],
    4: [
        KeyboardUtils.KEY_4,
        KeyboardUtils.KEY_NUMPAD_4
    ],
    5: [
        KeyboardUtils.KEY_5,
        KeyboardUtils.KEY_NUMPAD_5
    ],
    6: [
        KeyboardUtils.KEY_6,
        KeyboardUtils.KEY_NUMPAD_6
    ],
    7: [
        KeyboardUtils.KEY_7,
        KeyboardUtils.KEY_NUMPAD_7
    ],
    8: [
        KeyboardUtils.KEY_8,
        KeyboardUtils.KEY_NUMPAD_8
    ],
    9: [
        KeyboardUtils.KEY_9,
        KeyboardUtils.KEY_NUMPAD_9
    ],
    // various command keys
    enter: [
        KeyboardUtils.KEY_ENTER
    ],
    tab: [
        KeyboardUtils.KEY_TAB
    ],
    equals: [
        KeyboardUtils.KEY_EQUALS
    ],
    plus: [
        KeyboardUtils.KEY_PLUS,
        KeyboardUtils.KEY_NUMPAD_PLUS
    ],
    minus: [
        KeyboardUtils.KEY_MINUS,
        KeyboardUtils.KEY_NUMPAD_MINUS
    ],
    period: [
        KeyboardUtils.KEY_PERIOD,
        KeyboardUtils.KEY_NUMPAD_DECIMAL
    ],
    escape: [
        KeyboardUtils.KEY_ESCAPE
    ],
    delete: [
        KeyboardUtils.KEY_DELETE
    ],
    backspace: [
        KeyboardUtils.KEY_BACKSPACE
    ],
    pageUp: [
        KeyboardUtils.KEY_PAGE_UP
    ],
    pageDown: [
        KeyboardUtils.KEY_PAGE_DOWN
    ],
    end: [
        KeyboardUtils.KEY_END
    ],
    home: [
        KeyboardUtils.KEY_HOME
    ],
    space: [
        KeyboardUtils.KEY_SPACE
    ],
    arrowLeft: [
        KeyboardUtils.KEY_LEFT_ARROW
    ],
    arrowRight: [
        KeyboardUtils.KEY_RIGHT_ARROW
    ],
    arrowUp: [
        KeyboardUtils.KEY_UP_ARROW
    ],
    arrowDown: [
        KeyboardUtils.KEY_DOWN_ARROW
    ],
    // modifier keys
    ctrl: KeyboardUtils.CONTROL_KEYS,
    alt: KeyboardUtils.ALT_KEYS,
    shift: KeyboardUtils.SHIFT_KEYS,
    meta: KeyboardUtils.META_KEYS
};
scenery.register('EnglishStringToCodeMap', EnglishStringToCodeMap);
export default EnglishStringToCodeMap;
export const metaEnglishKeys = [
    'ctrl',
    'alt',
    'shift',
    'meta'
];
/**
 * Returns the first EnglishStringToCodeMap that corresponds to the provided event.code. Null if no match is found.
 * Useful when matching an english string used by KeyboardListener to the event code from a
 * SceneryEvent.domEvent.code.
 *
 * For example:
 *
 *   KeyboardUtils.eventCodeToEnglishString( 'KeyA' ) === 'a'
 *   KeyboardUtils.eventCodeToEnglishString( 'Numpad0' ) === '0'
 *   KeyboardUtils.eventCodeToEnglishString( 'Digit0' ) === '0'
 *
 * NOTE: This cannot be in KeyboardUtils because it would create a circular dependency.
 */ export const eventCodeToEnglishString = (eventCode)=>{
    for(const key in EnglishStringToCodeMap){
        if (EnglishStringToCodeMap.hasOwnProperty(key) && EnglishStringToCodeMap[key].includes(eventCode)) {
            return key;
        }
    }
    return null;
};

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvYWNjZXNzaWJpbGl0eS9FbmdsaXNoU3RyaW5nVG9Db2RlTWFwLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDIyLTIwMjQsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIE1hcHMgdGhlIGVuZ2xpc2gga2V5IHlvdSB3YW50IHRvIHVzZSB0byB0aGUgYXNzb2NpYXRlZCBLZXlib2FyZEV2ZW50LmNvZGVzIGZvciB1c2FnZSBpbiBsaXN0ZW5lcnMuXG4gKiBJZiBhIGtleSBoYXMgbXVsdGlwbGUgY29kZSB2YWx1ZXMsIGxpc3RlbmVyIGJlaGF2aW9yIHdpbGwgZmlyZSBpZiBlaXRoZXIgYXJlIHByZXNzZWQuXG4gKlxuICogQGF1dGhvciBKZXNzZSBHcmVlbmJlcmcgKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXG4gKi9cblxuaW1wb3J0IHsgS2V5Ym9hcmRVdGlscywgc2NlbmVyeSB9IGZyb20gJy4uL2ltcG9ydHMuanMnO1xuXG5leHBvcnQgdHlwZSBFbmdsaXNoS2V5ID0ga2V5b2YgdHlwZW9mIEVuZ2xpc2hTdHJpbmdUb0NvZGVNYXA7XG5leHBvcnQgdHlwZSBFbmdsaXNoS2V5U3RyaW5nID0gYCR7RW5nbGlzaEtleX1gO1xuXG5jb25zdCBFbmdsaXNoU3RyaW5nVG9Db2RlTWFwID0ge1xuXG4gIC8vIExldHRlciBrZXlzXG4gIHE6IFsgS2V5Ym9hcmRVdGlscy5LRVlfUSBdLFxuICB3OiBbIEtleWJvYXJkVXRpbHMuS0VZX1cgXSxcbiAgZTogWyBLZXlib2FyZFV0aWxzLktFWV9FIF0sXG4gIHI6IFsgS2V5Ym9hcmRVdGlscy5LRVlfUiBdLFxuICB0OiBbIEtleWJvYXJkVXRpbHMuS0VZX1QgXSxcbiAgeTogWyBLZXlib2FyZFV0aWxzLktFWV9ZIF0sXG4gIHU6IFsgS2V5Ym9hcmRVdGlscy5LRVlfVSBdLFxuICBpOiBbIEtleWJvYXJkVXRpbHMuS0VZX0kgXSxcbiAgbzogWyBLZXlib2FyZFV0aWxzLktFWV9PIF0sXG4gIHA6IFsgS2V5Ym9hcmRVdGlscy5LRVlfUCBdLFxuICBhOiBbIEtleWJvYXJkVXRpbHMuS0VZX0EgXSxcbiAgczogWyBLZXlib2FyZFV0aWxzLktFWV9TIF0sXG4gIGQ6IFsgS2V5Ym9hcmRVdGlscy5LRVlfRCBdLFxuICBmOiBbIEtleWJvYXJkVXRpbHMuS0VZX0YgXSxcbiAgZzogWyBLZXlib2FyZFV0aWxzLktFWV9HIF0sXG4gIGg6IFsgS2V5Ym9hcmRVdGlscy5LRVlfSCBdLFxuICBqOiBbIEtleWJvYXJkVXRpbHMuS0VZX0ogXSxcbiAgazogWyBLZXlib2FyZFV0aWxzLktFWV9LIF0sXG4gIGw6IFsgS2V5Ym9hcmRVdGlscy5LRVlfTCBdLFxuICB6OiBbIEtleWJvYXJkVXRpbHMuS0VZX1ogXSxcbiAgeDogWyBLZXlib2FyZFV0aWxzLktFWV9YIF0sXG4gIGM6IFsgS2V5Ym9hcmRVdGlscy5LRVlfQyBdLFxuICB2OiBbIEtleWJvYXJkVXRpbHMuS0VZX1YgXSxcbiAgYjogWyBLZXlib2FyZFV0aWxzLktFWV9CIF0sXG4gIG46IFsgS2V5Ym9hcmRVdGlscy5LRVlfTiBdLFxuICBtOiBbIEtleWJvYXJkVXRpbHMuS0VZX00gXSxcblxuICAvLyBudW1iZXIga2V5cyAtIG51bWJlciBhbmQgbnVtcGFkXG4gIDA6IFsgS2V5Ym9hcmRVdGlscy5LRVlfMCwgS2V5Ym9hcmRVdGlscy5LRVlfTlVNUEFEXzAgXSxcbiAgMTogWyBLZXlib2FyZFV0aWxzLktFWV8xLCBLZXlib2FyZFV0aWxzLktFWV9OVU1QQURfMSBdLFxuICAyOiBbIEtleWJvYXJkVXRpbHMuS0VZXzIsIEtleWJvYXJkVXRpbHMuS0VZX05VTVBBRF8yIF0sXG4gIDM6IFsgS2V5Ym9hcmRVdGlscy5LRVlfMywgS2V5Ym9hcmRVdGlscy5LRVlfTlVNUEFEXzMgXSxcbiAgNDogWyBLZXlib2FyZFV0aWxzLktFWV80LCBLZXlib2FyZFV0aWxzLktFWV9OVU1QQURfNCBdLFxuICA1OiBbIEtleWJvYXJkVXRpbHMuS0VZXzUsIEtleWJvYXJkVXRpbHMuS0VZX05VTVBBRF81IF0sXG4gIDY6IFsgS2V5Ym9hcmRVdGlscy5LRVlfNiwgS2V5Ym9hcmRVdGlscy5LRVlfTlVNUEFEXzYgXSxcbiAgNzogWyBLZXlib2FyZFV0aWxzLktFWV83LCBLZXlib2FyZFV0aWxzLktFWV9OVU1QQURfNyBdLFxuICA4OiBbIEtleWJvYXJkVXRpbHMuS0VZXzgsIEtleWJvYXJkVXRpbHMuS0VZX05VTVBBRF84IF0sXG4gIDk6IFsgS2V5Ym9hcmRVdGlscy5LRVlfOSwgS2V5Ym9hcmRVdGlscy5LRVlfTlVNUEFEXzkgXSxcblxuICAvLyB2YXJpb3VzIGNvbW1hbmQga2V5c1xuICBlbnRlcjogWyBLZXlib2FyZFV0aWxzLktFWV9FTlRFUiBdLFxuICB0YWI6IFsgS2V5Ym9hcmRVdGlscy5LRVlfVEFCIF0sXG4gIGVxdWFsczogWyBLZXlib2FyZFV0aWxzLktFWV9FUVVBTFMgXSxcbiAgcGx1czogWyBLZXlib2FyZFV0aWxzLktFWV9QTFVTLCBLZXlib2FyZFV0aWxzLktFWV9OVU1QQURfUExVUyBdLFxuICBtaW51czogWyBLZXlib2FyZFV0aWxzLktFWV9NSU5VUywgS2V5Ym9hcmRVdGlscy5LRVlfTlVNUEFEX01JTlVTIF0sXG4gIHBlcmlvZDogWyBLZXlib2FyZFV0aWxzLktFWV9QRVJJT0QsIEtleWJvYXJkVXRpbHMuS0VZX05VTVBBRF9ERUNJTUFMIF0sXG4gIGVzY2FwZTogWyBLZXlib2FyZFV0aWxzLktFWV9FU0NBUEUgXSxcbiAgZGVsZXRlOiBbIEtleWJvYXJkVXRpbHMuS0VZX0RFTEVURSBdLFxuICBiYWNrc3BhY2U6IFsgS2V5Ym9hcmRVdGlscy5LRVlfQkFDS1NQQUNFIF0sXG4gIHBhZ2VVcDogWyBLZXlib2FyZFV0aWxzLktFWV9QQUdFX1VQIF0sXG4gIHBhZ2VEb3duOiBbIEtleWJvYXJkVXRpbHMuS0VZX1BBR0VfRE9XTiBdLFxuICBlbmQ6IFsgS2V5Ym9hcmRVdGlscy5LRVlfRU5EIF0sXG4gIGhvbWU6IFsgS2V5Ym9hcmRVdGlscy5LRVlfSE9NRSBdLFxuICBzcGFjZTogWyBLZXlib2FyZFV0aWxzLktFWV9TUEFDRSBdLFxuICBhcnJvd0xlZnQ6IFsgS2V5Ym9hcmRVdGlscy5LRVlfTEVGVF9BUlJPVyBdLFxuICBhcnJvd1JpZ2h0OiBbIEtleWJvYXJkVXRpbHMuS0VZX1JJR0hUX0FSUk9XIF0sXG4gIGFycm93VXA6IFsgS2V5Ym9hcmRVdGlscy5LRVlfVVBfQVJST1cgXSxcbiAgYXJyb3dEb3duOiBbIEtleWJvYXJkVXRpbHMuS0VZX0RPV05fQVJST1cgXSxcblxuICAvLyBtb2RpZmllciBrZXlzXG4gIGN0cmw6IEtleWJvYXJkVXRpbHMuQ09OVFJPTF9LRVlTLFxuICBhbHQ6IEtleWJvYXJkVXRpbHMuQUxUX0tFWVMsXG4gIHNoaWZ0OiBLZXlib2FyZFV0aWxzLlNISUZUX0tFWVMsXG4gIG1ldGE6IEtleWJvYXJkVXRpbHMuTUVUQV9LRVlTXG59O1xuXG5zY2VuZXJ5LnJlZ2lzdGVyKCAnRW5nbGlzaFN0cmluZ1RvQ29kZU1hcCcsIEVuZ2xpc2hTdHJpbmdUb0NvZGVNYXAgKTtcbmV4cG9ydCBkZWZhdWx0IEVuZ2xpc2hTdHJpbmdUb0NvZGVNYXA7XG5cbmV4cG9ydCBjb25zdCBtZXRhRW5nbGlzaEtleXM6IEVuZ2xpc2hLZXlTdHJpbmdbXSA9IFsgJ2N0cmwnLCAnYWx0JywgJ3NoaWZ0JywgJ21ldGEnIF07XG5cbi8qKlxuICogUmV0dXJucyB0aGUgZmlyc3QgRW5nbGlzaFN0cmluZ1RvQ29kZU1hcCB0aGF0IGNvcnJlc3BvbmRzIHRvIHRoZSBwcm92aWRlZCBldmVudC5jb2RlLiBOdWxsIGlmIG5vIG1hdGNoIGlzIGZvdW5kLlxuICogVXNlZnVsIHdoZW4gbWF0Y2hpbmcgYW4gZW5nbGlzaCBzdHJpbmcgdXNlZCBieSBLZXlib2FyZExpc3RlbmVyIHRvIHRoZSBldmVudCBjb2RlIGZyb20gYVxuICogU2NlbmVyeUV2ZW50LmRvbUV2ZW50LmNvZGUuXG4gKlxuICogRm9yIGV4YW1wbGU6XG4gKlxuICogICBLZXlib2FyZFV0aWxzLmV2ZW50Q29kZVRvRW5nbGlzaFN0cmluZyggJ0tleUEnICkgPT09ICdhJ1xuICogICBLZXlib2FyZFV0aWxzLmV2ZW50Q29kZVRvRW5nbGlzaFN0cmluZyggJ051bXBhZDAnICkgPT09ICcwJ1xuICogICBLZXlib2FyZFV0aWxzLmV2ZW50Q29kZVRvRW5nbGlzaFN0cmluZyggJ0RpZ2l0MCcgKSA9PT0gJzAnXG4gKlxuICogTk9URTogVGhpcyBjYW5ub3QgYmUgaW4gS2V5Ym9hcmRVdGlscyBiZWNhdXNlIGl0IHdvdWxkIGNyZWF0ZSBhIGNpcmN1bGFyIGRlcGVuZGVuY3kuXG4gKi9cbmV4cG9ydCBjb25zdCBldmVudENvZGVUb0VuZ2xpc2hTdHJpbmcgPSAoIGV2ZW50Q29kZTogc3RyaW5nICk6IEVuZ2xpc2hLZXlTdHJpbmcgfCBudWxsID0+IHtcbiAgZm9yICggY29uc3Qga2V5IGluIEVuZ2xpc2hTdHJpbmdUb0NvZGVNYXAgKSB7XG4gICAgaWYgKCBFbmdsaXNoU3RyaW5nVG9Db2RlTWFwLmhhc093blByb3BlcnR5KCBrZXkgKSAmJlxuICAgICAgICAgKCBFbmdsaXNoU3RyaW5nVG9Db2RlTWFwWyBrZXkgYXMgRW5nbGlzaEtleSBdICkuaW5jbHVkZXMoIGV2ZW50Q29kZSApICkge1xuICAgICAgcmV0dXJuIGtleSBhcyBFbmdsaXNoS2V5U3RyaW5nO1xuICAgIH1cbiAgfVxuICByZXR1cm4gbnVsbDtcbn07Il0sIm5hbWVzIjpbIktleWJvYXJkVXRpbHMiLCJzY2VuZXJ5IiwiRW5nbGlzaFN0cmluZ1RvQ29kZU1hcCIsInEiLCJLRVlfUSIsInciLCJLRVlfVyIsImUiLCJLRVlfRSIsInIiLCJLRVlfUiIsInQiLCJLRVlfVCIsInkiLCJLRVlfWSIsInUiLCJLRVlfVSIsImkiLCJLRVlfSSIsIm8iLCJLRVlfTyIsInAiLCJLRVlfUCIsImEiLCJLRVlfQSIsInMiLCJLRVlfUyIsImQiLCJLRVlfRCIsImYiLCJLRVlfRiIsImciLCJLRVlfRyIsImgiLCJLRVlfSCIsImoiLCJLRVlfSiIsImsiLCJLRVlfSyIsImwiLCJLRVlfTCIsInoiLCJLRVlfWiIsIngiLCJLRVlfWCIsImMiLCJLRVlfQyIsInYiLCJLRVlfViIsImIiLCJLRVlfQiIsIm4iLCJLRVlfTiIsIm0iLCJLRVlfTSIsIktFWV8wIiwiS0VZX05VTVBBRF8wIiwiS0VZXzEiLCJLRVlfTlVNUEFEXzEiLCJLRVlfMiIsIktFWV9OVU1QQURfMiIsIktFWV8zIiwiS0VZX05VTVBBRF8zIiwiS0VZXzQiLCJLRVlfTlVNUEFEXzQiLCJLRVlfNSIsIktFWV9OVU1QQURfNSIsIktFWV82IiwiS0VZX05VTVBBRF82IiwiS0VZXzciLCJLRVlfTlVNUEFEXzciLCJLRVlfOCIsIktFWV9OVU1QQURfOCIsIktFWV85IiwiS0VZX05VTVBBRF85IiwiZW50ZXIiLCJLRVlfRU5URVIiLCJ0YWIiLCJLRVlfVEFCIiwiZXF1YWxzIiwiS0VZX0VRVUFMUyIsInBsdXMiLCJLRVlfUExVUyIsIktFWV9OVU1QQURfUExVUyIsIm1pbnVzIiwiS0VZX01JTlVTIiwiS0VZX05VTVBBRF9NSU5VUyIsInBlcmlvZCIsIktFWV9QRVJJT0QiLCJLRVlfTlVNUEFEX0RFQ0lNQUwiLCJlc2NhcGUiLCJLRVlfRVNDQVBFIiwiZGVsZXRlIiwiS0VZX0RFTEVURSIsImJhY2tzcGFjZSIsIktFWV9CQUNLU1BBQ0UiLCJwYWdlVXAiLCJLRVlfUEFHRV9VUCIsInBhZ2VEb3duIiwiS0VZX1BBR0VfRE9XTiIsImVuZCIsIktFWV9FTkQiLCJob21lIiwiS0VZX0hPTUUiLCJzcGFjZSIsIktFWV9TUEFDRSIsImFycm93TGVmdCIsIktFWV9MRUZUX0FSUk9XIiwiYXJyb3dSaWdodCIsIktFWV9SSUdIVF9BUlJPVyIsImFycm93VXAiLCJLRVlfVVBfQVJST1ciLCJhcnJvd0Rvd24iLCJLRVlfRE9XTl9BUlJPVyIsImN0cmwiLCJDT05UUk9MX0tFWVMiLCJhbHQiLCJBTFRfS0VZUyIsInNoaWZ0IiwiU0hJRlRfS0VZUyIsIm1ldGEiLCJNRVRBX0tFWVMiLCJyZWdpc3RlciIsIm1ldGFFbmdsaXNoS2V5cyIsImV2ZW50Q29kZVRvRW5nbGlzaFN0cmluZyIsImV2ZW50Q29kZSIsImtleSIsImhhc093blByb3BlcnR5IiwiaW5jbHVkZXMiXSwibWFwcGluZ3MiOiJBQUFBLHNEQUFzRDtBQUV0RDs7Ozs7Q0FLQyxHQUVELFNBQVNBLGFBQWEsRUFBRUMsT0FBTyxRQUFRLGdCQUFnQjtBQUt2RCxNQUFNQyx5QkFBeUI7SUFFN0IsY0FBYztJQUNkQyxHQUFHO1FBQUVILGNBQWNJLEtBQUs7S0FBRTtJQUMxQkMsR0FBRztRQUFFTCxjQUFjTSxLQUFLO0tBQUU7SUFDMUJDLEdBQUc7UUFBRVAsY0FBY1EsS0FBSztLQUFFO0lBQzFCQyxHQUFHO1FBQUVULGNBQWNVLEtBQUs7S0FBRTtJQUMxQkMsR0FBRztRQUFFWCxjQUFjWSxLQUFLO0tBQUU7SUFDMUJDLEdBQUc7UUFBRWIsY0FBY2MsS0FBSztLQUFFO0lBQzFCQyxHQUFHO1FBQUVmLGNBQWNnQixLQUFLO0tBQUU7SUFDMUJDLEdBQUc7UUFBRWpCLGNBQWNrQixLQUFLO0tBQUU7SUFDMUJDLEdBQUc7UUFBRW5CLGNBQWNvQixLQUFLO0tBQUU7SUFDMUJDLEdBQUc7UUFBRXJCLGNBQWNzQixLQUFLO0tBQUU7SUFDMUJDLEdBQUc7UUFBRXZCLGNBQWN3QixLQUFLO0tBQUU7SUFDMUJDLEdBQUc7UUFBRXpCLGNBQWMwQixLQUFLO0tBQUU7SUFDMUJDLEdBQUc7UUFBRTNCLGNBQWM0QixLQUFLO0tBQUU7SUFDMUJDLEdBQUc7UUFBRTdCLGNBQWM4QixLQUFLO0tBQUU7SUFDMUJDLEdBQUc7UUFBRS9CLGNBQWNnQyxLQUFLO0tBQUU7SUFDMUJDLEdBQUc7UUFBRWpDLGNBQWNrQyxLQUFLO0tBQUU7SUFDMUJDLEdBQUc7UUFBRW5DLGNBQWNvQyxLQUFLO0tBQUU7SUFDMUJDLEdBQUc7UUFBRXJDLGNBQWNzQyxLQUFLO0tBQUU7SUFDMUJDLEdBQUc7UUFBRXZDLGNBQWN3QyxLQUFLO0tBQUU7SUFD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