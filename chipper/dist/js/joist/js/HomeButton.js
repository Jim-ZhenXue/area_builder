// Copyright 2013-2024, University of Colorado Boulder
/**
 * The Home button that appears in the navigation bar.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */ import Multilink from '../../axon/js/Multilink.js';
import PatternStringProperty from '../../axon/js/PatternStringProperty.js';
import { Shape } from '../../kite/js/imports.js';
import optionize from '../../phet-core/js/optionize.js';
import { Color, Node, Path, Rectangle } from '../../scenery/js/imports.js';
import homeSolidShape from '../../sherpa/js/fontawesome-5/homeSolidShape.js';
import ButtonInteractionState from '../../sun/js/buttons/ButtonInteractionState.js';
import Utterance from '../../utterance-queue/js/Utterance.js';
import joist from './joist.js';
import JoistButton from './JoistButton.js';
import JoistStrings from './JoistStrings.js';
// constants
const homeStringProperty = JoistStrings.a11y.homeStringProperty;
const goToScreenPatternStringProperty = JoistStrings.a11y.goToScreenPatternStringProperty;
let HomeButton = class HomeButton extends JoistButton {
    /**
   * @param navBarHeight
   * @param navigationBarFillProperty - the color of the navbar, as a string.
   * @param pdomDisplayNameProperty - for the HomeScreen, for description
   * @param [providedOptions]
   */ constructor(navBarHeight, navigationBarFillProperty, pdomDisplayNameProperty, providedOptions){
        const descriptionStringProperty = new PatternStringProperty(goToScreenPatternStringProperty, {
            name: homeStringProperty
        });
        const options = optionize()({
            highlightExtensionWidth: 4,
            // pdom,
            containerTagName: 'li',
            descriptionContent: descriptionStringProperty,
            appendDescription: true,
            voicingHintResponse: descriptionStringProperty
        }, providedOptions);
        const homeIcon = new Path(homeSolidShape);
        // scale so that the icon is slightly taller than screen button icons, value determined empirically, see joist#127
        homeIcon.setScaleMagnitude(0.48 * navBarHeight / homeIcon.height * 0.85);
        // transparent background, size determined empirically so that highlight is the same size as highlight on screen buttons
        const background = new Rectangle(0, 0, homeIcon.width / 0.85 + 12, navBarHeight);
        homeIcon.center = background.center;
        const content = new Node({
            children: [
                background,
                homeIcon
            ]
        });
        // Create a new Utterance that isn't registered through Voicing so that it isn't silenced when the
        // home screen is hidden upon selection. (invisible nodes have their voicing silenced).
        const buttonSelectionUtterance = new Utterance();
        const providedListener = options.listener;
        options.listener = ()=>{
            providedListener && providedListener();
            this.voicingSpeakFullResponse({
                objectResponse: null,
                hintResponse: null,
                utterance: buttonSelectionUtterance
            });
        };
        super(content, navigationBarFillProperty, options);
        // pdom - Pass a shape to the focusHighlight to prevent dilation, then tweak the bottom up just a hair so it
        // isn't off the screen.
        this.focusHighlight = Shape.bounds(this.bounds.setMaxY(this.bounds.maxY - 2));
        Multilink.multilink([
            this.interactionStateProperty,
            navigationBarFillProperty
        ], (interactionState, navigationBarFill)=>{
            if (navigationBarFill.equals(Color.BLACK)) {
                homeIcon.fill = interactionState === ButtonInteractionState.PRESSED ? 'gray' : 'white';
            } else {
                homeIcon.fill = interactionState === ButtonInteractionState.PRESSED ? '#444' : '#222';
            }
        });
        this.addInputListener({
            focus: ()=>{
                this.voicingSpeakFullResponse({
                    objectResponse: null,
                    contextResponse: null
                });
            }
        });
        pdomDisplayNameProperty.link((name)=>{
            this.innerContent = name;
            this.voicingNameResponse = name;
        });
    }
};
export { HomeButton as default };
joist.register('HomeButton', HomeButton);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2pvaXN0L2pzL0hvbWVCdXR0b24udHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTMtMjAyNCwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbi8qKlxuICogVGhlIEhvbWUgYnV0dG9uIHRoYXQgYXBwZWFycyBpbiB0aGUgbmF2aWdhdGlvbiBiYXIuXG4gKlxuICogQGF1dGhvciBTYW0gUmVpZCAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcbiAqL1xuXG5pbXBvcnQgTXVsdGlsaW5rIGZyb20gJy4uLy4uL2F4b24vanMvTXVsdGlsaW5rLmpzJztcbmltcG9ydCBQYXR0ZXJuU3RyaW5nUHJvcGVydHkgZnJvbSAnLi4vLi4vYXhvbi9qcy9QYXR0ZXJuU3RyaW5nUHJvcGVydHkuanMnO1xuaW1wb3J0IFRSZWFkT25seVByb3BlcnR5IGZyb20gJy4uLy4uL2F4b24vanMvVFJlYWRPbmx5UHJvcGVydHkuanMnO1xuaW1wb3J0IHsgU2hhcGUgfSBmcm9tICcuLi8uLi9raXRlL2pzL2ltcG9ydHMuanMnO1xuaW1wb3J0IG9wdGlvbml6ZSwgeyBFbXB0eVNlbGZPcHRpb25zIH0gZnJvbSAnLi4vLi4vcGhldC1jb3JlL2pzL29wdGlvbml6ZS5qcyc7XG5pbXBvcnQgUGlja1JlcXVpcmVkIGZyb20gJy4uLy4uL3BoZXQtY29yZS9qcy90eXBlcy9QaWNrUmVxdWlyZWQuanMnO1xuaW1wb3J0IHsgQ29sb3IsIE5vZGUsIFBhdGgsIFJlY3RhbmdsZSB9IGZyb20gJy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XG5pbXBvcnQgaG9tZVNvbGlkU2hhcGUgZnJvbSAnLi4vLi4vc2hlcnBhL2pzL2ZvbnRhd2Vzb21lLTUvaG9tZVNvbGlkU2hhcGUuanMnO1xuaW1wb3J0IEJ1dHRvbkludGVyYWN0aW9uU3RhdGUgZnJvbSAnLi4vLi4vc3VuL2pzL2J1dHRvbnMvQnV0dG9uSW50ZXJhY3Rpb25TdGF0ZS5qcyc7XG5pbXBvcnQgVXR0ZXJhbmNlIGZyb20gJy4uLy4uL3V0dGVyYW5jZS1xdWV1ZS9qcy9VdHRlcmFuY2UuanMnO1xuaW1wb3J0IGpvaXN0IGZyb20gJy4vam9pc3QuanMnO1xuaW1wb3J0IEpvaXN0QnV0dG9uLCB7IEpvaXN0QnV0dG9uT3B0aW9ucyB9IGZyb20gJy4vSm9pc3RCdXR0b24uanMnO1xuaW1wb3J0IEpvaXN0U3RyaW5ncyBmcm9tICcuL0pvaXN0U3RyaW5ncy5qcyc7XG5cbi8vIGNvbnN0YW50c1xuY29uc3QgaG9tZVN0cmluZ1Byb3BlcnR5ID0gSm9pc3RTdHJpbmdzLmExMXkuaG9tZVN0cmluZ1Byb3BlcnR5O1xuY29uc3QgZ29Ub1NjcmVlblBhdHRlcm5TdHJpbmdQcm9wZXJ0eSA9IEpvaXN0U3RyaW5ncy5hMTF5LmdvVG9TY3JlZW5QYXR0ZXJuU3RyaW5nUHJvcGVydHk7XG5cbnR5cGUgU2VsZk9wdGlvbnMgPSBFbXB0eVNlbGZPcHRpb25zO1xudHlwZSBIb21lQnV0dG9uT3B0aW9ucyA9IFNlbGZPcHRpb25zICYgSm9pc3RCdXR0b25PcHRpb25zICYgUGlja1JlcXVpcmVkPEpvaXN0QnV0dG9uT3B0aW9ucywgJ2xpc3RlbmVyJyB8ICd0YW5kZW0nPjtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgSG9tZUJ1dHRvbiBleHRlbmRzIEpvaXN0QnV0dG9uIHtcblxuICAvKipcbiAgICogQHBhcmFtIG5hdkJhckhlaWdodFxuICAgKiBAcGFyYW0gbmF2aWdhdGlvbkJhckZpbGxQcm9wZXJ0eSAtIHRoZSBjb2xvciBvZiB0aGUgbmF2YmFyLCBhcyBhIHN0cmluZy5cbiAgICogQHBhcmFtIHBkb21EaXNwbGF5TmFtZVByb3BlcnR5IC0gZm9yIHRoZSBIb21lU2NyZWVuLCBmb3IgZGVzY3JpcHRpb25cbiAgICogQHBhcmFtIFtwcm92aWRlZE9wdGlvbnNdXG4gICAqL1xuICBwdWJsaWMgY29uc3RydWN0b3IoXG4gICAgbmF2QmFySGVpZ2h0OiBudW1iZXIsXG4gICAgbmF2aWdhdGlvbkJhckZpbGxQcm9wZXJ0eTogVFJlYWRPbmx5UHJvcGVydHk8Q29sb3I+LFxuICAgIHBkb21EaXNwbGF5TmFtZVByb3BlcnR5OiBUUmVhZE9ubHlQcm9wZXJ0eTxzdHJpbmcgfCBudWxsPixcbiAgICBwcm92aWRlZE9wdGlvbnM6IEhvbWVCdXR0b25PcHRpb25zXG4gICkge1xuXG4gICAgY29uc3QgZGVzY3JpcHRpb25TdHJpbmdQcm9wZXJ0eSA9IG5ldyBQYXR0ZXJuU3RyaW5nUHJvcGVydHkoIGdvVG9TY3JlZW5QYXR0ZXJuU3RyaW5nUHJvcGVydHksIHtcbiAgICAgIG5hbWU6IGhvbWVTdHJpbmdQcm9wZXJ0eVxuICAgIH0gKTtcblxuICAgIGNvbnN0IG9wdGlvbnMgPSBvcHRpb25pemU8SG9tZUJ1dHRvbk9wdGlvbnMsIFNlbGZPcHRpb25zLCBKb2lzdEJ1dHRvbk9wdGlvbnM+KCkoIHtcbiAgICAgIGhpZ2hsaWdodEV4dGVuc2lvbldpZHRoOiA0LFxuXG4gICAgICAvLyBwZG9tLFxuICAgICAgY29udGFpbmVyVGFnTmFtZTogJ2xpJyxcbiAgICAgIGRlc2NyaXB0aW9uQ29udGVudDogZGVzY3JpcHRpb25TdHJpbmdQcm9wZXJ0eSxcbiAgICAgIGFwcGVuZERlc2NyaXB0aW9uOiB0cnVlLFxuXG4gICAgICB2b2ljaW5nSGludFJlc3BvbnNlOiBkZXNjcmlwdGlvblN0cmluZ1Byb3BlcnR5XG4gICAgfSwgcHJvdmlkZWRPcHRpb25zICk7XG5cbiAgICBjb25zdCBob21lSWNvbiA9IG5ldyBQYXRoKCBob21lU29saWRTaGFwZSApO1xuXG4gICAgLy8gc2NhbGUgc28gdGhhdCB0aGUgaWNvbiBpcyBzbGlnaHRseSB0YWxsZXIgdGhhbiBzY3JlZW4gYnV0dG9uIGljb25zLCB2YWx1ZSBkZXRlcm1pbmVkIGVtcGlyaWNhbGx5LCBzZWUgam9pc3QjMTI3XG4gICAgaG9tZUljb24uc2V0U2NhbGVNYWduaXR1ZGUoIDAuNDggKiBuYXZCYXJIZWlnaHQgLyBob21lSWNvbi5oZWlnaHQgKiAwLjg1ICk7XG5cbiAgICAvLyB0cmFuc3BhcmVudCBiYWNrZ3JvdW5kLCBzaXplIGRldGVybWluZWQgZW1waXJpY2FsbHkgc28gdGhhdCBoaWdobGlnaHQgaXMgdGhlIHNhbWUgc2l6ZSBhcyBoaWdobGlnaHQgb24gc2NyZWVuIGJ1dHRvbnNcbiAgICBjb25zdCBiYWNrZ3JvdW5kID0gbmV3IFJlY3RhbmdsZSggMCwgMCwgaG9tZUljb24ud2lkdGggLyAwLjg1ICsgMTIsIG5hdkJhckhlaWdodCApO1xuICAgIGhvbWVJY29uLmNlbnRlciA9IGJhY2tncm91bmQuY2VudGVyO1xuXG4gICAgY29uc3QgY29udGVudCA9IG5ldyBOb2RlKCB7IGNoaWxkcmVuOiBbIGJhY2tncm91bmQsIGhvbWVJY29uIF0gfSApO1xuXG4gICAgLy8gQ3JlYXRlIGEgbmV3IFV0dGVyYW5jZSB0aGF0IGlzbid0IHJlZ2lzdGVyZWQgdGhyb3VnaCBWb2ljaW5nIHNvIHRoYXQgaXQgaXNuJ3Qgc2lsZW5jZWQgd2hlbiB0aGVcbiAgICAvLyBob21lIHNjcmVlbiBpcyBoaWRkZW4gdXBvbiBzZWxlY3Rpb24uIChpbnZpc2libGUgbm9kZXMgaGF2ZSB0aGVpciB2b2ljaW5nIHNpbGVuY2VkKS5cbiAgICBjb25zdCBidXR0b25TZWxlY3Rpb25VdHRlcmFuY2UgPSBuZXcgVXR0ZXJhbmNlKCk7XG5cbiAgICBjb25zdCBwcm92aWRlZExpc3RlbmVyID0gb3B0aW9ucy5saXN0ZW5lcjtcbiAgICBvcHRpb25zLmxpc3RlbmVyID0gKCkgPT4ge1xuICAgICAgcHJvdmlkZWRMaXN0ZW5lciAmJiBwcm92aWRlZExpc3RlbmVyKCk7XG5cbiAgICAgIHRoaXMudm9pY2luZ1NwZWFrRnVsbFJlc3BvbnNlKCB7XG4gICAgICAgIG9iamVjdFJlc3BvbnNlOiBudWxsLFxuICAgICAgICBoaW50UmVzcG9uc2U6IG51bGwsXG4gICAgICAgIHV0dGVyYW5jZTogYnV0dG9uU2VsZWN0aW9uVXR0ZXJhbmNlXG4gICAgICB9ICk7XG4gICAgfTtcblxuICAgIHN1cGVyKCBjb250ZW50LCBuYXZpZ2F0aW9uQmFyRmlsbFByb3BlcnR5LCBvcHRpb25zICk7XG5cbiAgICAvLyBwZG9tIC0gUGFzcyBhIHNoYXBlIHRvIHRoZSBmb2N1c0hpZ2hsaWdodCB0byBwcmV2ZW50IGRpbGF0aW9uLCB0aGVuIHR3ZWFrIHRoZSBib3R0b20gdXAganVzdCBhIGhhaXIgc28gaXRcbiAgICAvLyBpc24ndCBvZmYgdGhlIHNjcmVlbi5cbiAgICB0aGlzLmZvY3VzSGlnaGxpZ2h0ID0gU2hhcGUuYm91bmRzKCB0aGlzLmJvdW5kcy5zZXRNYXhZKCB0aGlzLmJvdW5kcy5tYXhZIC0gMiApICk7XG5cbiAgICBNdWx0aWxpbmsubXVsdGlsaW5rKCBbIHRoaXMuaW50ZXJhY3Rpb25TdGF0ZVByb3BlcnR5LCBuYXZpZ2F0aW9uQmFyRmlsbFByb3BlcnR5IF0sXG4gICAgICAoIGludGVyYWN0aW9uU3RhdGUsIG5hdmlnYXRpb25CYXJGaWxsICkgPT4ge1xuICAgICAgICBpZiAoIG5hdmlnYXRpb25CYXJGaWxsLmVxdWFscyggQ29sb3IuQkxBQ0sgKSApIHtcbiAgICAgICAgICBob21lSWNvbi5maWxsID0gaW50ZXJhY3Rpb25TdGF0ZSA9PT0gQnV0dG9uSW50ZXJhY3Rpb25TdGF0ZS5QUkVTU0VEID8gJ2dyYXknIDogJ3doaXRlJztcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICBob21lSWNvbi5maWxsID0gaW50ZXJhY3Rpb25TdGF0ZSA9PT0gQnV0dG9uSW50ZXJhY3Rpb25TdGF0ZS5QUkVTU0VEID8gJyM0NDQnIDogJyMyMjInO1xuICAgICAgICB9XG4gICAgICB9ICk7XG5cbiAgICB0aGlzLmFkZElucHV0TGlzdGVuZXIoIHtcbiAgICAgIGZvY3VzOiAoKSA9PiB7XG4gICAgICAgIHRoaXMudm9pY2luZ1NwZWFrRnVsbFJlc3BvbnNlKCB7XG4gICAgICAgICAgb2JqZWN0UmVzcG9uc2U6IG51bGwsXG4gICAgICAgICAgY29udGV4dFJlc3BvbnNlOiBudWxsXG4gICAgICAgIH0gKTtcbiAgICAgIH1cbiAgICB9ICk7XG5cbiAgICBwZG9tRGlzcGxheU5hbWVQcm9wZXJ0eS5saW5rKCBuYW1lID0+IHtcbiAgICAgIHRoaXMuaW5uZXJDb250ZW50ID0gbmFtZTtcbiAgICAgIHRoaXMudm9pY2luZ05hbWVSZXNwb25zZSA9IG5hbWU7XG4gICAgfSApO1xuICB9XG59XG5cbmpvaXN0LnJlZ2lzdGVyKCAnSG9tZUJ1dHRvbicsIEhvbWVCdXR0b24gKTsiXSwibmFtZXMiOlsiTXVsdGlsaW5rIiwiUGF0dGVyblN0cmluZ1Byb3BlcnR5IiwiU2hhcGUiLCJvcHRpb25pemUiLCJDb2xvciIsIk5vZGUiLCJQYXRoIiwiUmVjdGFuZ2xlIiwiaG9tZVNvbGlkU2hhcGUiLCJCdXR0b25JbnRlcmFjdGlvblN0YXRlIiwiVXR0ZXJhbmNlIiwiam9pc3QiLCJKb2lzdEJ1dHRvbiIsIkpvaXN0U3RyaW5ncyIsImhvbWVTdHJpbmdQcm9wZXJ0eSIsImExMXkiLCJnb1RvU2NyZWVuUGF0dGVyblN0cmluZ1Byb3BlcnR5IiwiSG9tZUJ1dHRvbiIsIm5hdkJhckhlaWdodCIsIm5hdmlnYXRpb25CYXJGaWxsUHJvcGVydHkiLCJwZG9tRGlzcGxheU5hbWVQcm9wZXJ0eSIsInByb3ZpZGVkT3B0aW9ucyIsImRlc2NyaXB0aW9uU3RyaW5nUHJvcGVydHkiLCJuYW1lIiwib3B0aW9ucyIsImhpZ2hsaWdodEV4dGVuc2lvbldpZHRoIiwiY29udGFpbmVyVGFnTmFtZSIsImRlc2NyaXB0aW9uQ29udGVudCIsImFwcGVuZERlc2NyaXB0aW9uIiwidm9pY2luZ0hpbnRSZXNwb25zZSIsImhvbWVJY29uIiwic2V0U2NhbGVNYWduaXR1ZGUiLCJoZWlnaHQiLCJiYWNrZ3JvdW5kIiwid2lkdGgiLCJjZW50ZXIiLCJjb250ZW50IiwiY2hpbGRyZW4iLCJidXR0b25TZWxlY3Rpb25VdHRlcmFuY2UiLCJwcm92aWRlZExpc3RlbmVyIiwibGlzdGVuZXIiLCJ2b2ljaW5nU3BlYWtGdWxsUmVzcG9uc2UiLCJvYmplY3RSZXNwb25zZSIsImhpbnRSZXNwb25zZSIsInV0dGVyYW5jZSIsImZvY3VzSGlnaGxpZ2h0IiwiYm91bmRzIiwic2V0TWF4WSIsIm1heFkiLCJtdWx0aWxpbmsiLCJpbnRlcmFjdGlvblN0YXRlUHJvcGVydHkiLCJpbnRlcmFjdGlvblN0YXRlIiwibmF2aWdhdGlvbkJhckZpbGwiLCJlcXVhbHMiLCJCTEFDSyIsImZpbGwiLCJQUkVTU0VEIiwiYWRkSW5wdXRMaXN0ZW5lciIsImZvY3VzIiwiY29udGV4dFJlc3BvbnNlIiwibGluayIsImlubmVyQ29udGVudCIsInZvaWNpbmdOYW1lUmVzcG9uc2UiLCJyZWdpc3RlciJdLCJtYXBwaW5ncyI6IkFBQUEsc0RBQXNEO0FBRXREOzs7O0NBSUMsR0FFRCxPQUFPQSxlQUFlLDZCQUE2QjtBQUNuRCxPQUFPQywyQkFBMkIseUNBQXlDO0FBRTNFLFNBQVNDLEtBQUssUUFBUSwyQkFBMkI7QUFDakQsT0FBT0MsZUFBcUMsa0NBQWtDO0FBRTlFLFNBQVNDLEtBQUssRUFBRUMsSUFBSSxFQUFFQyxJQUFJLEVBQUVDLFNBQVMsUUFBUSw4QkFBOEI7QUFDM0UsT0FBT0Msb0JBQW9CLGtEQUFrRDtBQUM3RSxPQUFPQyw0QkFBNEIsaURBQWlEO0FBQ3BGLE9BQU9DLGVBQWUsd0NBQXdDO0FBQzlELE9BQU9DLFdBQVcsYUFBYTtBQUMvQixPQUFPQyxpQkFBeUMsbUJBQW1CO0FBQ25FLE9BQU9DLGtCQUFrQixvQkFBb0I7QUFFN0MsWUFBWTtBQUNaLE1BQU1DLHFCQUFxQkQsYUFBYUUsSUFBSSxDQUFDRCxrQkFBa0I7QUFDL0QsTUFBTUUsa0NBQWtDSCxhQUFhRSxJQUFJLENBQUNDLCtCQUErQjtBQUsxRSxJQUFBLEFBQU1DLGFBQU4sTUFBTUEsbUJBQW1CTDtJQUV0Qzs7Ozs7R0FLQyxHQUNELFlBQ0VNLFlBQW9CLEVBQ3BCQyx5QkFBbUQsRUFDbkRDLHVCQUF5RCxFQUN6REMsZUFBa0MsQ0FDbEM7UUFFQSxNQUFNQyw0QkFBNEIsSUFBSXJCLHNCQUF1QmUsaUNBQWlDO1lBQzVGTyxNQUFNVDtRQUNSO1FBRUEsTUFBTVUsVUFBVXJCLFlBQWlFO1lBQy9Fc0IseUJBQXlCO1lBRXpCLFFBQVE7WUFDUkMsa0JBQWtCO1lBQ2xCQyxvQkFBb0JMO1lBQ3BCTSxtQkFBbUI7WUFFbkJDLHFCQUFxQlA7UUFDdkIsR0FBR0Q7UUFFSCxNQUFNUyxXQUFXLElBQUl4QixLQUFNRTtRQUUzQixrSEFBa0g7UUFDbEhzQixTQUFTQyxpQkFBaUIsQ0FBRSxPQUFPYixlQUFlWSxTQUFTRSxNQUFNLEdBQUc7UUFFcEUsd0hBQXdIO1FBQ3hILE1BQU1DLGFBQWEsSUFBSTFCLFVBQVcsR0FBRyxHQUFHdUIsU0FBU0ksS0FBSyxHQUFHLE9BQU8sSUFBSWhCO1FBQ3BFWSxTQUFTSyxNQUFNLEdBQUdGLFdBQVdFLE1BQU07UUFFbkMsTUFBTUMsVUFBVSxJQUFJL0IsS0FBTTtZQUFFZ0MsVUFBVTtnQkFBRUo7Z0JBQVlIO2FBQVU7UUFBQztRQUUvRCxrR0FBa0c7UUFDbEcsdUZBQXVGO1FBQ3ZGLE1BQU1RLDJCQUEyQixJQUFJNUI7UUFFckMsTUFBTTZCLG1CQUFtQmYsUUFBUWdCLFFBQVE7UUFDekNoQixRQUFRZ0IsUUFBUSxHQUFHO1lBQ2pCRCxvQkFBb0JBO1lBRXBCLElBQUksQ0FBQ0Usd0JBQXdCLENBQUU7Z0JBQzdCQyxnQkFBZ0I7Z0JBQ2hCQyxjQUFjO2dCQUNkQyxXQUFXTjtZQUNiO1FBQ0Y7UUFFQSxLQUFLLENBQUVGLFNBQVNqQiwyQkFBMkJLO1FBRTNDLDRHQUE0RztRQUM1Ryx3QkFBd0I7UUFDeEIsSUFBSSxDQUFDcUIsY0FBYyxHQUFHM0MsTUFBTTRDLE1BQU0sQ0FBRSxJQUFJLENBQUNBLE1BQU0sQ0FBQ0MsT0FBTyxDQUFFLElBQUksQ0FBQ0QsTUFBTSxDQUFDRSxJQUFJLEdBQUc7UUFFNUVoRCxVQUFVaUQsU0FBUyxDQUFFO1lBQUUsSUFBSSxDQUFDQyx3QkFBd0I7WUFBRS9CO1NBQTJCLEVBQy9FLENBQUVnQyxrQkFBa0JDO1lBQ2xCLElBQUtBLGtCQUFrQkMsTUFBTSxDQUFFakQsTUFBTWtELEtBQUssR0FBSztnQkFDN0N4QixTQUFTeUIsSUFBSSxHQUFHSixxQkFBcUIxQyx1QkFBdUIrQyxPQUFPLEdBQUcsU0FBUztZQUNqRixPQUNLO2dCQUNIMUIsU0FBU3lCLElBQUksR0FBR0oscUJBQXFCMUMsdUJBQXVCK0MsT0FBTyxHQUFHLFNBQVM7WUFDakY7UUFDRjtRQUVGLElBQUksQ0FBQ0MsZ0JBQWdCLENBQUU7WUFDckJDLE9BQU87Z0JBQ0wsSUFBSSxDQUFDakIsd0JBQXdCLENBQUU7b0JBQzdCQyxnQkFBZ0I7b0JBQ2hCaUIsaUJBQWlCO2dCQUNuQjtZQUNGO1FBQ0Y7UUFFQXZDLHdCQUF3QndDLElBQUksQ0FBRXJDLENBQUFBO1lBQzVCLElBQUksQ0FBQ3NDLFlBQVksR0FBR3RDO1lBQ3BCLElBQUksQ0FBQ3VDLG1CQUFtQixHQUFHdkM7UUFDN0I7SUFDRjtBQUNGO0FBdEZBLFNBQXFCTix3QkFzRnBCO0FBRUROLE1BQU1vRCxRQUFRLENBQUUsY0FBYzlDIn0=