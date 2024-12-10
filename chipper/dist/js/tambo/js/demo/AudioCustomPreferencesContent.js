// Copyright 2020-2022, University of Colorado Boulder
/**
 * AudioCustomPreferencesContent is intended as an example of a node that can serve as the content the Preferences
 * dialog that enables the user to select between different candidate sounds that are under consideration for use in a
 * sound design.
 *
 * @author John Blanco (PhET Interactive Simulations)
 */ import NumberProperty from '../../../axon/js/NumberProperty.js';
import PreferencesDialog from '../../../joist/js/preferences/PreferencesDialog.js';
import { Node, Text } from '../../../scenery/js/imports.js';
import AquaRadioButtonGroup from '../../../sun/js/AquaRadioButtonGroup.js';
import tambo from '../tambo.js';
let AudioCustomPreferencesContent = class AudioCustomPreferencesContent extends Node {
    constructor(){
        // global property that specifies which sound to use when balls bounce on the walls of the box (but not the ceiling)
        phet.tambo.soundIndexForWallBounceProperty = new NumberProperty(0);
        const items = [
            {
                value: 0,
                createNode: (tandem)=>new Text('1st option', PreferencesDialog.PANEL_SECTION_CONTENT_OPTIONS)
            },
            {
                value: 1,
                createNode: (tandem)=>new Text('2nd option', PreferencesDialog.PANEL_SECTION_CONTENT_OPTIONS)
            },
            {
                value: 2,
                createNode: (tandem)=>new Text('3rd option', PreferencesDialog.PANEL_SECTION_CONTENT_OPTIONS)
            }
        ];
        const radioButtonGroup = new AquaRadioButtonGroup(phet.tambo.soundIndexForWallBounceProperty, items, {
            orientation: 'vertical',
            align: 'left'
        });
        super({
            children: [
                radioButtonGroup
            ]
        });
    }
};
tambo.register('AudioCustomPreferencesContent', AudioCustomPreferencesContent);
export default AudioCustomPreferencesContent;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3RhbWJvL2pzL2RlbW8vQXVkaW9DdXN0b21QcmVmZXJlbmNlc0NvbnRlbnQudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjAtMjAyMiwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbi8qKlxuICogQXVkaW9DdXN0b21QcmVmZXJlbmNlc0NvbnRlbnQgaXMgaW50ZW5kZWQgYXMgYW4gZXhhbXBsZSBvZiBhIG5vZGUgdGhhdCBjYW4gc2VydmUgYXMgdGhlIGNvbnRlbnQgdGhlIFByZWZlcmVuY2VzXG4gKiBkaWFsb2cgdGhhdCBlbmFibGVzIHRoZSB1c2VyIHRvIHNlbGVjdCBiZXR3ZWVuIGRpZmZlcmVudCBjYW5kaWRhdGUgc291bmRzIHRoYXQgYXJlIHVuZGVyIGNvbnNpZGVyYXRpb24gZm9yIHVzZSBpbiBhXG4gKiBzb3VuZCBkZXNpZ24uXG4gKlxuICogQGF1dGhvciBKb2huIEJsYW5jbyAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcbiAqL1xuXG5pbXBvcnQgTnVtYmVyUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vYXhvbi9qcy9OdW1iZXJQcm9wZXJ0eS5qcyc7XG5pbXBvcnQgUHJlZmVyZW5jZXNEaWFsb2cgZnJvbSAnLi4vLi4vLi4vam9pc3QvanMvcHJlZmVyZW5jZXMvUHJlZmVyZW5jZXNEaWFsb2cuanMnO1xuaW1wb3J0IHsgTm9kZSwgVGV4dCB9IGZyb20gJy4uLy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XG5pbXBvcnQgQXF1YVJhZGlvQnV0dG9uR3JvdXAgZnJvbSAnLi4vLi4vLi4vc3VuL2pzL0FxdWFSYWRpb0J1dHRvbkdyb3VwLmpzJztcbmltcG9ydCBUYW5kZW0gZnJvbSAnLi4vLi4vLi4vdGFuZGVtL2pzL1RhbmRlbS5qcyc7XG5pbXBvcnQgdGFtYm8gZnJvbSAnLi4vdGFtYm8uanMnO1xuXG5jbGFzcyBBdWRpb0N1c3RvbVByZWZlcmVuY2VzQ29udGVudCBleHRlbmRzIE5vZGUge1xuXG4gIHB1YmxpYyBjb25zdHJ1Y3RvcigpIHtcblxuICAgIC8vIGdsb2JhbCBwcm9wZXJ0eSB0aGF0IHNwZWNpZmllcyB3aGljaCBzb3VuZCB0byB1c2Ugd2hlbiBiYWxscyBib3VuY2Ugb24gdGhlIHdhbGxzIG9mIHRoZSBib3ggKGJ1dCBub3QgdGhlIGNlaWxpbmcpXG4gICAgcGhldC50YW1iby5zb3VuZEluZGV4Rm9yV2FsbEJvdW5jZVByb3BlcnR5ID0gbmV3IE51bWJlclByb3BlcnR5KCAwICk7XG5cbiAgICBjb25zdCBpdGVtcyA9IFtcbiAgICAgIHtcbiAgICAgICAgdmFsdWU6IDAsXG4gICAgICAgIGNyZWF0ZU5vZGU6ICggdGFuZGVtOiBUYW5kZW0gKSA9PiBuZXcgVGV4dCggJzFzdCBvcHRpb24nLCBQcmVmZXJlbmNlc0RpYWxvZy5QQU5FTF9TRUNUSU9OX0NPTlRFTlRfT1BUSU9OUyApXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICB2YWx1ZTogMSxcbiAgICAgICAgY3JlYXRlTm9kZTogKCB0YW5kZW06IFRhbmRlbSApID0+IG5ldyBUZXh0KCAnMm5kIG9wdGlvbicsIFByZWZlcmVuY2VzRGlhbG9nLlBBTkVMX1NFQ1RJT05fQ09OVEVOVF9PUFRJT05TIClcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIHZhbHVlOiAyLFxuICAgICAgICBjcmVhdGVOb2RlOiAoIHRhbmRlbTogVGFuZGVtICkgPT4gbmV3IFRleHQoICczcmQgb3B0aW9uJywgUHJlZmVyZW5jZXNEaWFsb2cuUEFORUxfU0VDVElPTl9DT05URU5UX09QVElPTlMgKVxuICAgICAgfVxuICAgIF07XG5cbiAgICBjb25zdCByYWRpb0J1dHRvbkdyb3VwID0gbmV3IEFxdWFSYWRpb0J1dHRvbkdyb3VwKCBwaGV0LnRhbWJvLnNvdW5kSW5kZXhGb3JXYWxsQm91bmNlUHJvcGVydHksIGl0ZW1zLCB7XG4gICAgICBvcmllbnRhdGlvbjogJ3ZlcnRpY2FsJyxcbiAgICAgIGFsaWduOiAnbGVmdCdcbiAgICB9ICk7XG5cbiAgICBzdXBlciggeyBjaGlsZHJlbjogWyByYWRpb0J1dHRvbkdyb3VwIF0gfSApO1xuICB9XG59XG5cbnRhbWJvLnJlZ2lzdGVyKCAnQXVkaW9DdXN0b21QcmVmZXJlbmNlc0NvbnRlbnQnLCBBdWRpb0N1c3RvbVByZWZlcmVuY2VzQ29udGVudCApO1xuXG5leHBvcnQgZGVmYXVsdCBBdWRpb0N1c3RvbVByZWZlcmVuY2VzQ29udGVudDsiXSwibmFtZXMiOlsiTnVtYmVyUHJvcGVydHkiLCJQcmVmZXJlbmNlc0RpYWxvZyIsIk5vZGUiLCJUZXh0IiwiQXF1YVJhZGlvQnV0dG9uR3JvdXAiLCJ0YW1ibyIsIkF1ZGlvQ3VzdG9tUHJlZmVyZW5jZXNDb250ZW50IiwicGhldCIsInNvdW5kSW5kZXhGb3JXYWxsQm91bmNlUHJvcGVydHkiLCJpdGVtcyIsInZhbHVlIiwiY3JlYXRlTm9kZSIsInRhbmRlbSIsIlBBTkVMX1NFQ1RJT05fQ09OVEVOVF9PUFRJT05TIiwicmFkaW9CdXR0b25Hcm91cCIsIm9yaWVudGF0aW9uIiwiYWxpZ24iLCJjaGlsZHJlbiIsInJlZ2lzdGVyIl0sIm1hcHBpbmdzIjoiQUFBQSxzREFBc0Q7QUFFdEQ7Ozs7OztDQU1DLEdBRUQsT0FBT0Esb0JBQW9CLHFDQUFxQztBQUNoRSxPQUFPQyx1QkFBdUIscURBQXFEO0FBQ25GLFNBQVNDLElBQUksRUFBRUMsSUFBSSxRQUFRLGlDQUFpQztBQUM1RCxPQUFPQywwQkFBMEIsMENBQTBDO0FBRTNFLE9BQU9DLFdBQVcsY0FBYztBQUVoQyxJQUFBLEFBQU1DLGdDQUFOLE1BQU1BLHNDQUFzQ0o7SUFFMUMsYUFBcUI7UUFFbkIsb0hBQW9IO1FBQ3BISyxLQUFLRixLQUFLLENBQUNHLCtCQUErQixHQUFHLElBQUlSLGVBQWdCO1FBRWpFLE1BQU1TLFFBQVE7WUFDWjtnQkFDRUMsT0FBTztnQkFDUEMsWUFBWSxDQUFFQyxTQUFvQixJQUFJVCxLQUFNLGNBQWNGLGtCQUFrQlksNkJBQTZCO1lBQzNHO1lBQ0E7Z0JBQ0VILE9BQU87Z0JBQ1BDLFlBQVksQ0FBRUMsU0FBb0IsSUFBSVQsS0FBTSxjQUFjRixrQkFBa0JZLDZCQUE2QjtZQUMzRztZQUNBO2dCQUNFSCxPQUFPO2dCQUNQQyxZQUFZLENBQUVDLFNBQW9CLElBQUlULEtBQU0sY0FBY0Ysa0JBQWtCWSw2QkFBNkI7WUFDM0c7U0FDRDtRQUVELE1BQU1DLG1CQUFtQixJQUFJVixxQkFBc0JHLEtBQUtGLEtBQUssQ0FBQ0csK0JBQStCLEVBQUVDLE9BQU87WUFDcEdNLGFBQWE7WUFDYkMsT0FBTztRQUNUO1FBRUEsS0FBSyxDQUFFO1lBQUVDLFVBQVU7Z0JBQUVIO2FBQWtCO1FBQUM7SUFDMUM7QUFDRjtBQUVBVCxNQUFNYSxRQUFRLENBQUUsaUNBQWlDWjtBQUVqRCxlQUFlQSw4QkFBOEIifQ==