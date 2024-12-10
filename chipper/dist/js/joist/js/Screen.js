// Copyright 2013-2024, University of Colorado Boulder
/**
 * A Screen is the largest chunk of a simulation. (Java sims used the term Module, but that term
 * is too overloaded to use with JavaScript and Git.)
 *
 * When creating a Sim, Screens are supplied as the arguments. They can be specified as object literals or through
 * instances of this class. This class may centralize default behavior or state for Screens in the future, but right
 * now it only allows you to create Sims without using named parameter object literals.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */ import BooleanProperty from '../../axon/js/BooleanProperty.js';
import DerivedProperty from '../../axon/js/DerivedProperty.js';
import Multilink from '../../axon/js/Multilink.js';
import PatternStringProperty from '../../axon/js/PatternStringProperty.js';
import Property from '../../axon/js/Property.js';
import Dimension2 from '../../dot/js/Dimension2.js';
import { Shape } from '../../kite/js/imports.js';
import optionize from '../../phet-core/js/optionize.js';
import StringUtils from '../../phetcommon/js/util/StringUtils.js';
import { Path, Rectangle } from '../../scenery/js/imports.js';
import PhetioObject from '../../tandem/js/PhetioObject.js';
import Tandem from '../../tandem/js/Tandem.js';
import IOType from '../../tandem/js/types/IOType.js';
import ReferenceIO from '../../tandem/js/types/ReferenceIO.js';
import joist from './joist.js';
import JoistStrings from './JoistStrings.js';
import ScreenIcon from './ScreenIcon.js';
const screenNamePatternStringProperty = JoistStrings.a11y.screenNamePatternStringProperty;
const goToScreenPatternStringProperty = JoistStrings.a11y.goToScreenPatternStringProperty;
const screenSimPatternStringProperty = JoistStrings.a11y.screenSimPatternStringProperty;
const simScreenStringProperty = JoistStrings.a11y.simScreenStringProperty;
// constants
const MINIMUM_HOME_SCREEN_ICON_SIZE = new Dimension2(548, 373);
const MINIMUM_NAVBAR_ICON_SIZE = new Dimension2(147, 100);
const NAVBAR_ICON_ASPECT_RATIO = MINIMUM_NAVBAR_ICON_SIZE.width / MINIMUM_NAVBAR_ICON_SIZE.height;
const HOME_SCREEN_ICON_ASPECT_RATIO = MINIMUM_HOME_SCREEN_ICON_SIZE.width / MINIMUM_HOME_SCREEN_ICON_SIZE.height;
const ICON_ASPECT_RATIO_TOLERANCE = 5E-3; // how close to the ideal aspect ratio an icon must be
// Home screen and navigation bar icons must have the same aspect ratio, see https://github.com/phetsims/joist/issues/76
assert && assert(Math.abs(HOME_SCREEN_ICON_ASPECT_RATIO - HOME_SCREEN_ICON_ASPECT_RATIO) < ICON_ASPECT_RATIO_TOLERANCE, 'MINIMUM_HOME_SCREEN_ICON_SIZE and MINIMUM_NAVBAR_ICON_SIZE must have the same aspect ratio');
// Parameterized on M=Model and V=View
let Screen = class Screen extends PhetioObject {
    // Returns the model (if it has been constructed)
    get model() {
        assert && assert(this._model, 'Model has not yet been constructed');
        return this._model;
    }
    // Returns the view (if it has been constructed)
    get view() {
        assert && assert(this._view, 'View has not yet been constructed');
        return this._view;
    }
    hasModel() {
        return !!this._model;
    }
    hasView() {
        return !!this._view;
    }
    reset() {
    // Background color not reset, as it's a responsibility of the code that changes the property
    }
    /**
   * Initialize the model.
   * (joist-internal)
   */ initializeModel() {
        assert && assert(this._model === null, 'there was already a model');
        this._model = this.createModel();
    }
    /**
   * Initialize the view.
   * (joist-internal)
   * @param simNameProperty - The Property of the name of the sim, used for a11y.
   * @param displayedSimNameProperty - The Property of the display name of the sim, used for a11y. Could change based on screen.
   * @param numberOfScreens - the number of screens in the sim this runtime (could change with `?screens=...`.
   * @param isHomeScreen - if this screen is the home screen.
   */ initializeView(simNameProperty, displayedSimNameProperty, numberOfScreens, isHomeScreen) {
        assert && assert(this._view === null, 'there was already a view');
        this._view = this.createView(this.model);
        this._view.setVisible(false); // a Screen is invisible until selected
        // Show the home screen's layoutBounds
        if (phet.chipper.queryParameters.dev) {
            this._view.addChild(devCreateLayoutBoundsNode(this._view.layoutBounds));
        }
        // For debugging, make it possible to see the visibleBounds.  This is not included with ?dev since
        // it should just be equal to what you see.
        if (phet.chipper.queryParameters.showVisibleBounds) {
            this._view.addChild(devCreateVisibleBoundsNode(this._view));
        }
        // Set the accessible label for the screen.
        Multilink.multilink([
            displayedSimNameProperty,
            simNameProperty,
            this.pdomDisplayNameProperty
        ], (displayedName, simName, pdomDisplayName)=>{
            let titleString;
            // Single screen sims don't need screen names, instead just show the title of the sim.
            // Using total screens for sim breaks modularity a bit, but it also is needed as that parameter changes the
            // labelling of this screen, see https://github.com/phetsims/joist/issues/496
            if (numberOfScreens === 1) {
                titleString = displayedName; // for multiscreen sims, like "Ratio and Proportion -- Create"
            } else if (isHomeScreen) {
                titleString = simName; // Like "Ratio and Propotion"
            } else {
                // initialize proper PDOM labelling for ScreenView
                titleString = StringUtils.fillIn(screenSimPatternStringProperty, {
                    screenName: pdomDisplayName,
                    simName: simName
                });
            }
            // if there is a screenSummaryNode, then set its intro string now
            this._view.setScreenSummaryIntroAndTitle(simName, pdomDisplayName, titleString, numberOfScreens > 1);
        });
        assert && this._view.pdomAudit();
    }
    constructor(createModel, createView, providedOptions){
        const options = optionize()({
            // {TProperty<string>|null} name of the sim, as displayed to the user.
            // For single-screen sims, there is no home screen or navigation bar, and null is OK.
            // For multi-screen sims, this must be provided.
            name: null,
            // {boolean} whether nameProperty should be instrumented. see usage for explanation of its necessity.
            instrumentNameProperty: true,
            backgroundColorProperty: new Property('white'),
            // {Node|null} icon shown on the home screen. If null, then a default is created.
            // For single-screen sims, there is no home screen and the default is OK.
            homeScreenIcon: null,
            // {boolean} whether to draw a frame around the small icons on home screen
            showUnselectedHomeScreenIconFrame: false,
            // {Node|null} icon shown in the navigation bar. If null, then the home screen icon will be used, scaled to fit.
            navigationBarIcon: null,
            // {string|null} show a frame around the screen icon when the navbar's background fill is this color
            // 'black', 'white', or null (no frame)
            showScreenIconFrameForNavigationBarFill: null,
            maxDT: 0.5,
            // a {null|function():Node} placed into the keyboard help dialog that can be opened from the navigation bar when this
            // screen is selected
            createKeyboardHelpNode: null,
            screenButtonsHelpText: null,
            // phet-io
            // @ts-expect-error include a default for un-instrumented, JavaScript sims
            tandem: Tandem.REQUIRED,
            tandemNameSuffix: Tandem.SCREEN_TANDEM_NAME_SUFFIX,
            phetioType: Screen.ScreenIO,
            phetioState: false,
            phetioFeatured: true
        }, providedOptions);
        assert && assert(_.includes([
            'black',
            'white',
            null
        ], options.showScreenIconFrameForNavigationBarFill), `invalid showScreenIconFrameForNavigationBarFill: ${options.showScreenIconFrameForNavigationBarFill}`);
        assert && assert(typeof options.name !== 'string', 'Screen no longer supports a name string, instead it should be a Property<string>');
        super(options);
        // Create a default homeScreenIcon, using the Screen's background color
        if (!options.homeScreenIcon) {
            const iconNode = new Rectangle(0, 0, MINIMUM_HOME_SCREEN_ICON_SIZE.width, MINIMUM_HOME_SCREEN_ICON_SIZE.height);
            options.homeScreenIcon = new ScreenIcon(iconNode, {
                fill: options.backgroundColorProperty.value,
                maxIconWidthProportion: 1,
                maxIconHeightProportion: 1
            });
        }
        // navigationBarIcon defaults to homeScreenIcon, and will be scaled down
        if (!options.navigationBarIcon) {
            options.navigationBarIcon = options.homeScreenIcon;
        }
        // Validate icon sizes
        validateIconSize(options.homeScreenIcon, MINIMUM_HOME_SCREEN_ICON_SIZE, HOME_SCREEN_ICON_ASPECT_RATIO, 'homeScreenIcon');
        validateIconSize(options.navigationBarIcon, MINIMUM_NAVBAR_ICON_SIZE, NAVBAR_ICON_ASPECT_RATIO, 'navigationBarIcon');
        this.backgroundColorProperty = options.backgroundColorProperty;
        if (options.name) {
            this.nameProperty = options.name;
            // Don't instrument this.nameProperty if options.instrumentNameProperty is false or if options.name is not provided.
            // This additional option is needed because designers requested the ability to not instrument a screen's nameProperty
            // even if it has a name, see https://github.com/phetsims/joist/issues/627 and https://github.com/phetsims/joist/issues/629.
            options.instrumentNameProperty && this.addLinkedElement(options.name, {
                tandemName: 'nameProperty'
            });
        } else {
            // may be null for single-screen simulations, just make it blank
            this.nameProperty = new Property('');
        }
        this.homeScreenIcon = options.homeScreenIcon;
        this.navigationBarIcon = options.navigationBarIcon;
        this.showUnselectedHomeScreenIconFrame = options.showUnselectedHomeScreenIconFrame;
        this.showScreenIconFrameForNavigationBarFill = options.showScreenIconFrameForNavigationBarFill;
        this.createKeyboardHelpNode = options.createKeyboardHelpNode;
        // may be null for single-screen simulations
        this.pdomDisplayNameProperty = new DerivedProperty([
            this.nameProperty,
            screenNamePatternStringProperty
        ], (name)=>{
            return name === null ? '' : StringUtils.fillIn(screenNamePatternStringProperty, {
                name: name
            });
        });
        this.maxDT = options.maxDT;
        this.createModel = createModel;
        this.createView = createView;
        // Construction of the model and view are delayed and controlled to enable features like
        // a) faster loading when only loading certain screens
        // b) showing a loading progress bar <not implemented>
        this._model = null;
        this._view = null;
        // Indicates whether the Screen is active. Clients can read this, joist sets it.
        // To prevent potential visual glitches, the value should change only while the screen's view is invisible.
        // That is: transitions from false to true before a Screen becomes visible, and from true to false after a Screen becomes invisible.
        this.activeProperty = new BooleanProperty(true, {
            tandem: options.tandem.createTandem('activeProperty'),
            phetioReadOnly: true,
            phetioDocumentation: 'Indicates whether the screen is currently displayed in the simulation.  For single-screen ' + 'simulations, there is only one screen and it is always active.'
        });
        // The helpText for the screen buttons uses the provided option, but creates reasonable defaults
        // from the nameProperty otherwise.
        this.screenButtonsHelpText = '';
        if (options.screenButtonsHelpText) {
            this.screenButtonsHelpText = options.screenButtonsHelpText;
        } else if (this.nameProperty.value) {
            // Fall back to "Go to {{Screen Name}} Screen" as a default.
            this.screenButtonsHelpText = new PatternStringProperty(goToScreenPatternStringProperty, {
                name: this.nameProperty
            }, {
                tandem: Tandem.OPT_OUT
            });
        } else {
            this.screenButtonsHelpText = simScreenStringProperty; // fall back on generic name
        }
        assert && this.activeProperty.lazyLink(()=>{
            assert && assert(this._view, 'isActive should not change before the Screen view has been initialized');
            // In phet-io mode, the state of a sim can be set without a deterministic order. The activeProperty could be
            // changed before the view's visibility is set.
            if (!Tandem.PHET_IO_ENABLED) {
                assert && assert(!this._view.isVisible(), 'isActive should not change while the Screen view is visible');
            }
        });
    }
};
Screen.HOME_SCREEN_ICON_ASPECT_RATIO = HOME_SCREEN_ICON_ASPECT_RATIO;
Screen.MINIMUM_HOME_SCREEN_ICON_SIZE = MINIMUM_HOME_SCREEN_ICON_SIZE;
Screen.MINIMUM_NAVBAR_ICON_SIZE = MINIMUM_NAVBAR_ICON_SIZE;
Screen.ScreenIO = new IOType('ScreenIO', {
    valueType: Screen,
    supertype: ReferenceIO(IOType.ObjectIO),
    documentation: 'Section of a simulation which has its own model and view.'
});
/**
 * Validates the sizes for the home screen icon and navigation bar icon.
 * @param icon - the icon to validate
 * @param minimumSize - the minimum allowed size for the icon
 * @param aspectRatio - the required aspect ratio
 * @param name - the name of the icon type (for assert messages)
 */ function validateIconSize(icon, minimumSize, aspectRatio, name) {
    assert && assert(icon.width >= minimumSize.width, `${name} width is too small: ${icon.width} < ${minimumSize.width}`);
    assert && assert(icon.height >= minimumSize.height, `${name} height is too small: ${icon.height} < ${minimumSize.height}`);
    // Validate home screen aspect ratio
    const actualAspectRatio = icon.width / icon.height;
    assert && assert(Math.abs(aspectRatio - actualAspectRatio) < ICON_ASPECT_RATIO_TOLERANCE, `${name} has invalid aspect ratio: ${actualAspectRatio}`);
}
/**
 * Creates a Node for visualizing the ScreenView layoutBounds with 'dev' query parameter.
 */ function devCreateLayoutBoundsNode(layoutBounds) {
    return new Path(Shape.bounds(layoutBounds), {
        stroke: 'red',
        lineWidth: 3,
        pickable: false
    });
}
/**
 * Creates a Node for visualizing the ScreenView visibleBoundsProperty with 'showVisibleBounds' query parameter.
 */ function devCreateVisibleBoundsNode(screenView) {
    const path = new Path(Shape.bounds(screenView.visibleBoundsProperty.value), {
        stroke: 'blue',
        lineWidth: 6,
        pickable: false
    });
    screenView.visibleBoundsProperty.link((visibleBounds)=>{
        path.shape = Shape.bounds(visibleBounds);
    });
    return path;
}
joist.register('Screen', Screen);
export default Screen;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2pvaXN0L2pzL1NjcmVlbi50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxMy0yMDI0LCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuLyoqXG4gKiBBIFNjcmVlbiBpcyB0aGUgbGFyZ2VzdCBjaHVuayBvZiBhIHNpbXVsYXRpb24uIChKYXZhIHNpbXMgdXNlZCB0aGUgdGVybSBNb2R1bGUsIGJ1dCB0aGF0IHRlcm1cbiAqIGlzIHRvbyBvdmVybG9hZGVkIHRvIHVzZSB3aXRoIEphdmFTY3JpcHQgYW5kIEdpdC4pXG4gKlxuICogV2hlbiBjcmVhdGluZyBhIFNpbSwgU2NyZWVucyBhcmUgc3VwcGxpZWQgYXMgdGhlIGFyZ3VtZW50cy4gVGhleSBjYW4gYmUgc3BlY2lmaWVkIGFzIG9iamVjdCBsaXRlcmFscyBvciB0aHJvdWdoXG4gKiBpbnN0YW5jZXMgb2YgdGhpcyBjbGFzcy4gVGhpcyBjbGFzcyBtYXkgY2VudHJhbGl6ZSBkZWZhdWx0IGJlaGF2aW9yIG9yIHN0YXRlIGZvciBTY3JlZW5zIGluIHRoZSBmdXR1cmUsIGJ1dCByaWdodFxuICogbm93IGl0IG9ubHkgYWxsb3dzIHlvdSB0byBjcmVhdGUgU2ltcyB3aXRob3V0IHVzaW5nIG5hbWVkIHBhcmFtZXRlciBvYmplY3QgbGl0ZXJhbHMuXG4gKlxuICogQGF1dGhvciBTYW0gUmVpZCAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcbiAqL1xuXG5pbXBvcnQgQm9vbGVhblByb3BlcnR5IGZyb20gJy4uLy4uL2F4b24vanMvQm9vbGVhblByb3BlcnR5LmpzJztcbmltcG9ydCBEZXJpdmVkUHJvcGVydHkgZnJvbSAnLi4vLi4vYXhvbi9qcy9EZXJpdmVkUHJvcGVydHkuanMnO1xuaW1wb3J0IE11bHRpbGluayBmcm9tICcuLi8uLi9heG9uL2pzL011bHRpbGluay5qcyc7XG5pbXBvcnQgUGF0dGVyblN0cmluZ1Byb3BlcnR5IGZyb20gJy4uLy4uL2F4b24vanMvUGF0dGVyblN0cmluZ1Byb3BlcnR5LmpzJztcbmltcG9ydCBQaGV0aW9Qcm9wZXJ0eSBmcm9tICcuLi8uLi9heG9uL2pzL1BoZXRpb1Byb3BlcnR5LmpzJztcbmltcG9ydCBQcm9wZXJ0eSBmcm9tICcuLi8uLi9heG9uL2pzL1Byb3BlcnR5LmpzJztcbmltcG9ydCBUUmVhZE9ubHlQcm9wZXJ0eSBmcm9tICcuLi8uLi9heG9uL2pzL1RSZWFkT25seVByb3BlcnR5LmpzJztcbmltcG9ydCBCb3VuZHMyIGZyb20gJy4uLy4uL2RvdC9qcy9Cb3VuZHMyLmpzJztcbmltcG9ydCBEaW1lbnNpb24yIGZyb20gJy4uLy4uL2RvdC9qcy9EaW1lbnNpb24yLmpzJztcbmltcG9ydCB7IFNoYXBlIH0gZnJvbSAnLi4vLi4va2l0ZS9qcy9pbXBvcnRzLmpzJztcbmltcG9ydCBvcHRpb25pemUgZnJvbSAnLi4vLi4vcGhldC1jb3JlL2pzL29wdGlvbml6ZS5qcyc7XG5pbXBvcnQgSW50ZW50aW9uYWxBbnkgZnJvbSAnLi4vLi4vcGhldC1jb3JlL2pzL3R5cGVzL0ludGVudGlvbmFsQW55LmpzJztcbmltcG9ydCBQaWNrUmVxdWlyZWQgZnJvbSAnLi4vLi4vcGhldC1jb3JlL2pzL3R5cGVzL1BpY2tSZXF1aXJlZC5qcyc7XG5pbXBvcnQgU3RyaWN0T21pdCBmcm9tICcuLi8uLi9waGV0LWNvcmUvanMvdHlwZXMvU3RyaWN0T21pdC5qcyc7XG5pbXBvcnQgU3RyaW5nVXRpbHMgZnJvbSAnLi4vLi4vcGhldGNvbW1vbi9qcy91dGlsL1N0cmluZ1V0aWxzLmpzJztcbmltcG9ydCB7IENvbG9yLCBOb2RlLCBQYXRoLCBQRE9NVmFsdWVUeXBlLCBQcm9maWxlQ29sb3JQcm9wZXJ0eSwgUmVjdGFuZ2xlIH0gZnJvbSAnLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcbmltcG9ydCBQaGV0aW9PYmplY3QsIHsgUGhldGlvT2JqZWN0T3B0aW9ucyB9IGZyb20gJy4uLy4uL3RhbmRlbS9qcy9QaGV0aW9PYmplY3QuanMnO1xuaW1wb3J0IFRhbmRlbSBmcm9tICcuLi8uLi90YW5kZW0vanMvVGFuZGVtLmpzJztcbmltcG9ydCBJT1R5cGUgZnJvbSAnLi4vLi4vdGFuZGVtL2pzL3R5cGVzL0lPVHlwZS5qcyc7XG5pbXBvcnQgUmVmZXJlbmNlSU8gZnJvbSAnLi4vLi4vdGFuZGVtL2pzL3R5cGVzL1JlZmVyZW5jZUlPLmpzJztcbmltcG9ydCBqb2lzdCBmcm9tICcuL2pvaXN0LmpzJztcbmltcG9ydCBKb2lzdFN0cmluZ3MgZnJvbSAnLi9Kb2lzdFN0cmluZ3MuanMnO1xuaW1wb3J0IFNjcmVlbkljb24gZnJvbSAnLi9TY3JlZW5JY29uLmpzJztcbmltcG9ydCBTY3JlZW5WaWV3IGZyb20gJy4vU2NyZWVuVmlldy5qcyc7XG5pbXBvcnQgVE1vZGVsIGZyb20gJy4vVE1vZGVsLmpzJztcblxuY29uc3Qgc2NyZWVuTmFtZVBhdHRlcm5TdHJpbmdQcm9wZXJ0eSA9IEpvaXN0U3RyaW5ncy5hMTF5LnNjcmVlbk5hbWVQYXR0ZXJuU3RyaW5nUHJvcGVydHk7XG5jb25zdCBnb1RvU2NyZWVuUGF0dGVyblN0cmluZ1Byb3BlcnR5ID0gSm9pc3RTdHJpbmdzLmExMXkuZ29Ub1NjcmVlblBhdHRlcm5TdHJpbmdQcm9wZXJ0eTtcbmNvbnN0IHNjcmVlblNpbVBhdHRlcm5TdHJpbmdQcm9wZXJ0eSA9IEpvaXN0U3RyaW5ncy5hMTF5LnNjcmVlblNpbVBhdHRlcm5TdHJpbmdQcm9wZXJ0eTtcbmNvbnN0IHNpbVNjcmVlblN0cmluZ1Byb3BlcnR5ID0gSm9pc3RTdHJpbmdzLmExMXkuc2ltU2NyZWVuU3RyaW5nUHJvcGVydHk7XG5cbi8vIGNvbnN0YW50c1xuY29uc3QgTUlOSU1VTV9IT01FX1NDUkVFTl9JQ09OX1NJWkUgPSBuZXcgRGltZW5zaW9uMiggNTQ4LCAzNzMgKTtcbmNvbnN0IE1JTklNVU1fTkFWQkFSX0lDT05fU0laRSA9IG5ldyBEaW1lbnNpb24yKCAxNDcsIDEwMCApO1xuY29uc3QgTkFWQkFSX0lDT05fQVNQRUNUX1JBVElPID0gTUlOSU1VTV9OQVZCQVJfSUNPTl9TSVpFLndpZHRoIC8gTUlOSU1VTV9OQVZCQVJfSUNPTl9TSVpFLmhlaWdodDtcbmNvbnN0IEhPTUVfU0NSRUVOX0lDT05fQVNQRUNUX1JBVElPID0gTUlOSU1VTV9IT01FX1NDUkVFTl9JQ09OX1NJWkUud2lkdGggLyBNSU5JTVVNX0hPTUVfU0NSRUVOX0lDT05fU0laRS5oZWlnaHQ7XG5jb25zdCBJQ09OX0FTUEVDVF9SQVRJT19UT0xFUkFOQ0UgPSA1RS0zOyAvLyBob3cgY2xvc2UgdG8gdGhlIGlkZWFsIGFzcGVjdCByYXRpbyBhbiBpY29uIG11c3QgYmVcblxuLy8gSG9tZSBzY3JlZW4gYW5kIG5hdmlnYXRpb24gYmFyIGljb25zIG11c3QgaGF2ZSB0aGUgc2FtZSBhc3BlY3QgcmF0aW8sIHNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvam9pc3QvaXNzdWVzLzc2XG5hc3NlcnQgJiYgYXNzZXJ0KCBNYXRoLmFicyggSE9NRV9TQ1JFRU5fSUNPTl9BU1BFQ1RfUkFUSU8gLSBIT01FX1NDUkVFTl9JQ09OX0FTUEVDVF9SQVRJTyApIDwgSUNPTl9BU1BFQ1RfUkFUSU9fVE9MRVJBTkNFLFxuICAnTUlOSU1VTV9IT01FX1NDUkVFTl9JQ09OX1NJWkUgYW5kIE1JTklNVU1fTkFWQkFSX0lDT05fU0laRSBtdXN0IGhhdmUgdGhlIHNhbWUgYXNwZWN0IHJhdGlvJyApO1xuXG4vLyBEb2N1bWVudGF0aW9uIGlzIGJ5IHRoZSBkZWZhdWx0c1xudHlwZSBTZWxmT3B0aW9ucyA9IHtcbiAgbmFtZT86IFBoZXRpb1Byb3BlcnR5PHN0cmluZz4gfCBudWxsO1xuICBpbnN0cnVtZW50TmFtZVByb3BlcnR5PzogYm9vbGVhbjtcblxuICAvLyBJdCB3b3VsZCBiZSBwcmVmZXJhYmxlIHRvIHN1cHBvcnQgUHJvcGVydHk8Q29sb3IgfCBzdHJpbmc+IHNvbGVseSwgYnV0IG1hbnkgc3VidHlwZXMgYXJlIGhhcmRjb2RlZCB0byBiZSBDb2xvciBvbmx5XG4gIC8vIG9yIHN0cmluZyBvbmx5LCBzbyB3ZSBzdXBwb3J0IHRoaXMgcG9seW1vcnBoaWMgZm9ybVxuICBiYWNrZ3JvdW5kQ29sb3JQcm9wZXJ0eT86IFByb3BlcnR5PENvbG9yIHwgc3RyaW5nPiB8IFByb3BlcnR5PENvbG9yPiB8IFByb3BlcnR5PHN0cmluZz4gfCBQcm9maWxlQ29sb3JQcm9wZXJ0eTtcbiAgaG9tZVNjcmVlbkljb24/OiBTY3JlZW5JY29uIHwgbnVsbDtcbiAgc2hvd1Vuc2VsZWN0ZWRIb21lU2NyZWVuSWNvbkZyYW1lPzogYm9vbGVhbjtcbiAgbmF2aWdhdGlvbkJhckljb24/OiBTY3JlZW5JY29uIHwgbnVsbDtcbiAgc2hvd1NjcmVlbkljb25GcmFtZUZvck5hdmlnYXRpb25CYXJGaWxsPzogc3RyaW5nIHwgbnVsbDtcblxuICAvLyBkdCBjYXAgaW4gc2Vjb25kcywgc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9qb2lzdC9pc3N1ZXMvMTMwXG4gIG1heERUPzogbnVtYmVyO1xuICBjcmVhdGVLZXlib2FyZEhlbHBOb2RlPzogbnVsbCB8ICggKCB0YW5kZW06IFRhbmRlbSApID0+IE5vZGUgKTtcblxuICAvLyBIZWxwIHRleHQgdGhhdCB3aWxsIGJlIGFkZGVkIHRvIHRoZSBIb21lIHNjcmVlbiBidXR0b24gYW5kIG5hdmlnYXRpb24gYmFyIGJ1dHRvbiBmb3IgdGhpcyBzY3JlZW4uXG4gIC8vIFRoaXMgaXMgb2Z0ZW4gYSBmdWxsIGJ1dCBzaG9ydCBzZW50ZW5jZSB3aXRoIGEgcGVyaW9kIGF0IHRoZSBlbmQgb2YgaXQuIFRoaXMgaXMgYWxzbyB1c2VkIGFzIHRoZVxuICAvLyBoaW50IHJlc3BvbnNlIGZvciB0aGVzZSBidXR0b25zIHdpdGggdGhlIFZvaWNpbmcgZmVhdHVyZS5cbiAgc2NyZWVuQnV0dG9uc0hlbHBUZXh0PzogUERPTVZhbHVlVHlwZSB8IG51bGw7XG59O1xuZXhwb3J0IHR5cGUgU2NyZWVuT3B0aW9ucyA9IFNlbGZPcHRpb25zICZcbiAgU3RyaWN0T21pdDxQaGV0aW9PYmplY3RPcHRpb25zLCAndGFuZGVtTmFtZVN1ZmZpeCc+ICYgLy8gVGFuZGVtLlJvb3RUYW5kZW0uY3JlYXRlVGFuZGVtIHJlcXVpcmVzIHRoYXQgdGhlIHN1ZmZpeCBpcyBUYW5kZW0uU0NSRUVOX1RBTkRFTV9OQU1FX1NVRkZJWC5cbiAgUGlja1JlcXVpcmVkPFBoZXRpb09iamVjdE9wdGlvbnMsICd0YW5kZW0nPjtcblxuLy8gQGpvaXN0LWludGVybmFsIC0gVGhpcyB0eXBlIGlzIHVzZXMgSW50ZW50aW9uYWxBbnkgdG8gYnJlYWsgdGhlIGNvbnRyYXZhcmlhbmNlIGRlcGVuZGVuY3kgdGhhdCB0aGUgY3JlYXRlVmlldyBmdW5jdGlvblxuLy8gaGFzIG9uIFNjcmVlbi4gSWRlYWxseSB3ZSBjb3VsZCB1c2UgVE1vZGVsIGluc3RlYWQsIGJ1dCB0aGF0IHdvdWxkIGludm9sdmUgYSByZXdyaXRlIG9mIGhvdyB3ZSBwYXNzIGNsb3N1cmVzIGludG9cbi8vIFNjcmVlbiBpbnN0ZWFkIG9mIHRoZSBhbHJlYWR5IGNyZWF0ZWQgTW9kZWwvVmlldyB0aGVtc2VsdmVzLiBTZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2pvaXN0L2lzc3Vlcy83ODMjaXNzdWVjb21tZW50LTEyMzEwMTcyMTNcbmV4cG9ydCB0eXBlIEFueVNjcmVlbiA9IFNjcmVlbjxJbnRlbnRpb25hbEFueSwgU2NyZWVuVmlldz47XG5cbi8vIFBhcmFtZXRlcml6ZWQgb24gTT1Nb2RlbCBhbmQgVj1WaWV3XG5jbGFzcyBTY3JlZW48TSBleHRlbmRzIFRNb2RlbCwgViBleHRlbmRzIFNjcmVlblZpZXc+IGV4dGVuZHMgUGhldGlvT2JqZWN0IHtcblxuICBwdWJsaWMgYmFja2dyb3VuZENvbG9yUHJvcGVydHk6IFByb3BlcnR5PENvbG9yPiB8IFByb3BlcnR5PHN0cmluZz4gfCBQcm9wZXJ0eTxDb2xvciB8IHN0cmluZz47XG5cbiAgLy8gZHQgY2FwIGluIHNlY29uZHMsIHNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvam9pc3QvaXNzdWVzLzEzMFxuICBwdWJsaWMgcmVhZG9ubHkgbWF4RFQ6IG51bWJlcjtcbiAgcHVibGljIHJlYWRvbmx5IGFjdGl2ZVByb3BlcnR5OiBCb29sZWFuUHJvcGVydHk7XG5cbiAgLy8gSGVscCB0ZXh0IHVzZWQgb24gdGhlIHNjcmVlbiBidXR0b25zLCBzZWUgb3B0aW9ucyBhYm92ZS5cbiAgcHVibGljIHJlYWRvbmx5IHNjcmVlbkJ1dHRvbnNIZWxwVGV4dDogUERPTVZhbHVlVHlwZTtcbiAgcHVibGljIHJlYWRvbmx5IG5hbWVQcm9wZXJ0eTogVFJlYWRPbmx5UHJvcGVydHk8c3RyaW5nPjtcblxuICBwdWJsaWMgcmVhZG9ubHkgc2hvd1NjcmVlbkljb25GcmFtZUZvck5hdmlnYXRpb25CYXJGaWxsOiBzdHJpbmcgfCBudWxsO1xuICBwdWJsaWMgcmVhZG9ubHkgaG9tZVNjcmVlbkljb246IFNjcmVlbkljb24gfCBudWxsO1xuICBwdWJsaWMgbmF2aWdhdGlvbkJhckljb246IFNjcmVlbkljb24gfCBudWxsO1xuICBwdWJsaWMgcmVhZG9ubHkgc2hvd1Vuc2VsZWN0ZWRIb21lU2NyZWVuSWNvbkZyYW1lOiBib29sZWFuO1xuICBwdWJsaWMgcmVhZG9ubHkgY3JlYXRlS2V5Ym9hcmRIZWxwTm9kZTogbnVsbCB8ICggKCB0YW5kZW06IFRhbmRlbSApID0+IE5vZGUgKTsgLy8gam9pc3QtaW50ZXJuYWxcbiAgcHVibGljIHJlYWRvbmx5IHBkb21EaXNwbGF5TmFtZVByb3BlcnR5OiBUUmVhZE9ubHlQcm9wZXJ0eTxzdHJpbmc+O1xuICBwcml2YXRlIHJlYWRvbmx5IGNyZWF0ZU1vZGVsOiAoKSA9PiBNO1xuICBwcml2YXRlIHJlYWRvbmx5IGNyZWF0ZVZpZXc6ICggbW9kZWw6IE0gKSA9PiBWO1xuICBwcml2YXRlIF9tb2RlbDogTSB8IG51bGw7XG4gIHByaXZhdGUgX3ZpZXc6IFYgfCBudWxsO1xuXG4gIHB1YmxpYyBzdGF0aWMgcmVhZG9ubHkgSE9NRV9TQ1JFRU5fSUNPTl9BU1BFQ1RfUkFUSU8gPSBIT01FX1NDUkVFTl9JQ09OX0FTUEVDVF9SQVRJTztcbiAgcHVibGljIHN0YXRpYyByZWFkb25seSBNSU5JTVVNX0hPTUVfU0NSRUVOX0lDT05fU0laRSA9IE1JTklNVU1fSE9NRV9TQ1JFRU5fSUNPTl9TSVpFO1xuICBwdWJsaWMgc3RhdGljIHJlYWRvbmx5IE1JTklNVU1fTkFWQkFSX0lDT05fU0laRSA9IE1JTklNVU1fTkFWQkFSX0lDT05fU0laRTtcbiAgcHVibGljIHN0YXRpYyByZWFkb25seSBTY3JlZW5JTyA9IG5ldyBJT1R5cGUoICdTY3JlZW5JTycsIHtcbiAgICB2YWx1ZVR5cGU6IFNjcmVlbixcbiAgICBzdXBlcnR5cGU6IFJlZmVyZW5jZUlPKCBJT1R5cGUuT2JqZWN0SU8gKSxcbiAgICBkb2N1bWVudGF0aW9uOiAnU2VjdGlvbiBvZiBhIHNpbXVsYXRpb24gd2hpY2ggaGFzIGl0cyBvd24gbW9kZWwgYW5kIHZpZXcuJ1xuICB9ICk7XG5cbiAgcHVibGljIGNvbnN0cnVjdG9yKCBjcmVhdGVNb2RlbDogKCkgPT4gTSwgY3JlYXRlVmlldzogKCBtb2RlbDogTSApID0+IFYsIHByb3ZpZGVkT3B0aW9uczogU2NyZWVuT3B0aW9ucyApIHtcblxuICAgIGNvbnN0IG9wdGlvbnMgPSBvcHRpb25pemU8U2NyZWVuT3B0aW9ucywgU2VsZk9wdGlvbnMsIFBoZXRpb09iamVjdE9wdGlvbnM+KCkoIHtcblxuICAgICAgLy8ge1RQcm9wZXJ0eTxzdHJpbmc+fG51bGx9IG5hbWUgb2YgdGhlIHNpbSwgYXMgZGlzcGxheWVkIHRvIHRoZSB1c2VyLlxuICAgICAgLy8gRm9yIHNpbmdsZS1zY3JlZW4gc2ltcywgdGhlcmUgaXMgbm8gaG9tZSBzY3JlZW4gb3IgbmF2aWdhdGlvbiBiYXIsIGFuZCBudWxsIGlzIE9LLlxuICAgICAgLy8gRm9yIG11bHRpLXNjcmVlbiBzaW1zLCB0aGlzIG11c3QgYmUgcHJvdmlkZWQuXG4gICAgICBuYW1lOiBudWxsLFxuXG4gICAgICAvLyB7Ym9vbGVhbn0gd2hldGhlciBuYW1lUHJvcGVydHkgc2hvdWxkIGJlIGluc3RydW1lbnRlZC4gc2VlIHVzYWdlIGZvciBleHBsYW5hdGlvbiBvZiBpdHMgbmVjZXNzaXR5LlxuICAgICAgaW5zdHJ1bWVudE5hbWVQcm9wZXJ0eTogdHJ1ZSxcblxuICAgICAgYmFja2dyb3VuZENvbG9yUHJvcGVydHk6IG5ldyBQcm9wZXJ0eTxDb2xvciB8IHN0cmluZz4oICd3aGl0ZScgKSxcblxuICAgICAgLy8ge05vZGV8bnVsbH0gaWNvbiBzaG93biBvbiB0aGUgaG9tZSBzY3JlZW4uIElmIG51bGwsIHRoZW4gYSBkZWZhdWx0IGlzIGNyZWF0ZWQuXG4gICAgICAvLyBGb3Igc2luZ2xlLXNjcmVlbiBzaW1zLCB0aGVyZSBpcyBubyBob21lIHNjcmVlbiBhbmQgdGhlIGRlZmF1bHQgaXMgT0suXG4gICAgICBob21lU2NyZWVuSWNvbjogbnVsbCxcblxuICAgICAgLy8ge2Jvb2xlYW59IHdoZXRoZXIgdG8gZHJhdyBhIGZyYW1lIGFyb3VuZCB0aGUgc21hbGwgaWNvbnMgb24gaG9tZSBzY3JlZW5cbiAgICAgIHNob3dVbnNlbGVjdGVkSG9tZVNjcmVlbkljb25GcmFtZTogZmFsc2UsXG5cbiAgICAgIC8vIHtOb2RlfG51bGx9IGljb24gc2hvd24gaW4gdGhlIG5hdmlnYXRpb24gYmFyLiBJZiBudWxsLCB0aGVuIHRoZSBob21lIHNjcmVlbiBpY29uIHdpbGwgYmUgdXNlZCwgc2NhbGVkIHRvIGZpdC5cbiAgICAgIG5hdmlnYXRpb25CYXJJY29uOiBudWxsLFxuXG4gICAgICAvLyB7c3RyaW5nfG51bGx9IHNob3cgYSBmcmFtZSBhcm91bmQgdGhlIHNjcmVlbiBpY29uIHdoZW4gdGhlIG5hdmJhcidzIGJhY2tncm91bmQgZmlsbCBpcyB0aGlzIGNvbG9yXG4gICAgICAvLyAnYmxhY2snLCAnd2hpdGUnLCBvciBudWxsIChubyBmcmFtZSlcbiAgICAgIHNob3dTY3JlZW5JY29uRnJhbWVGb3JOYXZpZ2F0aW9uQmFyRmlsbDogbnVsbCxcblxuICAgICAgbWF4RFQ6IDAuNSxcblxuICAgICAgLy8gYSB7bnVsbHxmdW5jdGlvbigpOk5vZGV9IHBsYWNlZCBpbnRvIHRoZSBrZXlib2FyZCBoZWxwIGRpYWxvZyB0aGF0IGNhbiBiZSBvcGVuZWQgZnJvbSB0aGUgbmF2aWdhdGlvbiBiYXIgd2hlbiB0aGlzXG4gICAgICAvLyBzY3JlZW4gaXMgc2VsZWN0ZWRcbiAgICAgIGNyZWF0ZUtleWJvYXJkSGVscE5vZGU6IG51bGwsXG5cbiAgICAgIHNjcmVlbkJ1dHRvbnNIZWxwVGV4dDogbnVsbCxcblxuICAgICAgLy8gcGhldC1pb1xuICAgICAgLy8gQHRzLWV4cGVjdC1lcnJvciBpbmNsdWRlIGEgZGVmYXVsdCBmb3IgdW4taW5zdHJ1bWVudGVkLCBKYXZhU2NyaXB0IHNpbXNcbiAgICAgIHRhbmRlbTogVGFuZGVtLlJFUVVJUkVELFxuICAgICAgdGFuZGVtTmFtZVN1ZmZpeDogVGFuZGVtLlNDUkVFTl9UQU5ERU1fTkFNRV9TVUZGSVgsXG4gICAgICBwaGV0aW9UeXBlOiBTY3JlZW4uU2NyZWVuSU8sXG4gICAgICBwaGV0aW9TdGF0ZTogZmFsc2UsXG4gICAgICBwaGV0aW9GZWF0dXJlZDogdHJ1ZVxuICAgIH0sIHByb3ZpZGVkT3B0aW9ucyApO1xuXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggXy5pbmNsdWRlcyggWyAnYmxhY2snLCAnd2hpdGUnLCBudWxsIF0sIG9wdGlvbnMuc2hvd1NjcmVlbkljb25GcmFtZUZvck5hdmlnYXRpb25CYXJGaWxsICksXG4gICAgICBgaW52YWxpZCBzaG93U2NyZWVuSWNvbkZyYW1lRm9yTmF2aWdhdGlvbkJhckZpbGw6ICR7b3B0aW9ucy5zaG93U2NyZWVuSWNvbkZyYW1lRm9yTmF2aWdhdGlvbkJhckZpbGx9YCApO1xuXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdHlwZW9mIG9wdGlvbnMubmFtZSAhPT0gJ3N0cmluZycsICdTY3JlZW4gbm8gbG9uZ2VyIHN1cHBvcnRzIGEgbmFtZSBzdHJpbmcsIGluc3RlYWQgaXQgc2hvdWxkIGJlIGEgUHJvcGVydHk8c3RyaW5nPicgKTtcblxuICAgIHN1cGVyKCBvcHRpb25zICk7XG5cbiAgICAvLyBDcmVhdGUgYSBkZWZhdWx0IGhvbWVTY3JlZW5JY29uLCB1c2luZyB0aGUgU2NyZWVuJ3MgYmFja2dyb3VuZCBjb2xvclxuICAgIGlmICggIW9wdGlvbnMuaG9tZVNjcmVlbkljb24gKSB7XG4gICAgICBjb25zdCBpY29uTm9kZSA9IG5ldyBSZWN0YW5nbGUoIDAsIDAsIE1JTklNVU1fSE9NRV9TQ1JFRU5fSUNPTl9TSVpFLndpZHRoLCBNSU5JTVVNX0hPTUVfU0NSRUVOX0lDT05fU0laRS5oZWlnaHQgKTtcbiAgICAgIG9wdGlvbnMuaG9tZVNjcmVlbkljb24gPSBuZXcgU2NyZWVuSWNvbiggaWNvbk5vZGUsIHtcbiAgICAgICAgZmlsbDogb3B0aW9ucy5iYWNrZ3JvdW5kQ29sb3JQcm9wZXJ0eS52YWx1ZSxcbiAgICAgICAgbWF4SWNvbldpZHRoUHJvcG9ydGlvbjogMSxcbiAgICAgICAgbWF4SWNvbkhlaWdodFByb3BvcnRpb246IDFcbiAgICAgIH0gKTtcbiAgICB9XG5cbiAgICAvLyBuYXZpZ2F0aW9uQmFySWNvbiBkZWZhdWx0cyB0byBob21lU2NyZWVuSWNvbiwgYW5kIHdpbGwgYmUgc2NhbGVkIGRvd25cbiAgICBpZiAoICFvcHRpb25zLm5hdmlnYXRpb25CYXJJY29uICkge1xuICAgICAgb3B0aW9ucy5uYXZpZ2F0aW9uQmFySWNvbiA9IG9wdGlvbnMuaG9tZVNjcmVlbkljb247XG4gICAgfVxuXG4gICAgLy8gVmFsaWRhdGUgaWNvbiBzaXplc1xuICAgIHZhbGlkYXRlSWNvblNpemUoIG9wdGlvbnMuaG9tZVNjcmVlbkljb24sIE1JTklNVU1fSE9NRV9TQ1JFRU5fSUNPTl9TSVpFLCBIT01FX1NDUkVFTl9JQ09OX0FTUEVDVF9SQVRJTywgJ2hvbWVTY3JlZW5JY29uJyApO1xuICAgIHZhbGlkYXRlSWNvblNpemUoIG9wdGlvbnMubmF2aWdhdGlvbkJhckljb24sIE1JTklNVU1fTkFWQkFSX0lDT05fU0laRSwgTkFWQkFSX0lDT05fQVNQRUNUX1JBVElPLCAnbmF2aWdhdGlvbkJhckljb24nICk7XG5cbiAgICB0aGlzLmJhY2tncm91bmRDb2xvclByb3BlcnR5ID0gb3B0aW9ucy5iYWNrZ3JvdW5kQ29sb3JQcm9wZXJ0eTtcblxuICAgIGlmICggb3B0aW9ucy5uYW1lICkge1xuICAgICAgdGhpcy5uYW1lUHJvcGVydHkgPSBvcHRpb25zLm5hbWU7XG5cbiAgICAgIC8vIERvbid0IGluc3RydW1lbnQgdGhpcy5uYW1lUHJvcGVydHkgaWYgb3B0aW9ucy5pbnN0cnVtZW50TmFtZVByb3BlcnR5IGlzIGZhbHNlIG9yIGlmIG9wdGlvbnMubmFtZSBpcyBub3QgcHJvdmlkZWQuXG4gICAgICAvLyBUaGlzIGFkZGl0aW9uYWwgb3B0aW9uIGlzIG5lZWRlZCBiZWNhdXNlIGRlc2lnbmVycyByZXF1ZXN0ZWQgdGhlIGFiaWxpdHkgdG8gbm90IGluc3RydW1lbnQgYSBzY3JlZW4ncyBuYW1lUHJvcGVydHlcbiAgICAgIC8vIGV2ZW4gaWYgaXQgaGFzIGEgbmFtZSwgc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9qb2lzdC9pc3N1ZXMvNjI3IGFuZCBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvam9pc3QvaXNzdWVzLzYyOS5cbiAgICAgIG9wdGlvbnMuaW5zdHJ1bWVudE5hbWVQcm9wZXJ0eSAmJiB0aGlzLmFkZExpbmtlZEVsZW1lbnQoIG9wdGlvbnMubmFtZSwge1xuICAgICAgICB0YW5kZW1OYW1lOiAnbmFtZVByb3BlcnR5J1xuICAgICAgfSApO1xuICAgIH1cbiAgICBlbHNlIHtcblxuICAgICAgLy8gbWF5IGJlIG51bGwgZm9yIHNpbmdsZS1zY3JlZW4gc2ltdWxhdGlvbnMsIGp1c3QgbWFrZSBpdCBibGFua1xuICAgICAgdGhpcy5uYW1lUHJvcGVydHkgPSBuZXcgUHJvcGVydHkoICcnICk7XG4gICAgfVxuXG4gICAgdGhpcy5ob21lU2NyZWVuSWNvbiA9IG9wdGlvbnMuaG9tZVNjcmVlbkljb247XG4gICAgdGhpcy5uYXZpZ2F0aW9uQmFySWNvbiA9IG9wdGlvbnMubmF2aWdhdGlvbkJhckljb247XG4gICAgdGhpcy5zaG93VW5zZWxlY3RlZEhvbWVTY3JlZW5JY29uRnJhbWUgPSBvcHRpb25zLnNob3dVbnNlbGVjdGVkSG9tZVNjcmVlbkljb25GcmFtZTtcbiAgICB0aGlzLnNob3dTY3JlZW5JY29uRnJhbWVGb3JOYXZpZ2F0aW9uQmFyRmlsbCA9IG9wdGlvbnMuc2hvd1NjcmVlbkljb25GcmFtZUZvck5hdmlnYXRpb25CYXJGaWxsO1xuICAgIHRoaXMuY3JlYXRlS2V5Ym9hcmRIZWxwTm9kZSA9IG9wdGlvbnMuY3JlYXRlS2V5Ym9hcmRIZWxwTm9kZTtcblxuICAgIC8vIG1heSBiZSBudWxsIGZvciBzaW5nbGUtc2NyZWVuIHNpbXVsYXRpb25zXG4gICAgdGhpcy5wZG9tRGlzcGxheU5hbWVQcm9wZXJ0eSA9IG5ldyBEZXJpdmVkUHJvcGVydHkoIFsgdGhpcy5uYW1lUHJvcGVydHksIHNjcmVlbk5hbWVQYXR0ZXJuU3RyaW5nUHJvcGVydHkgXSwgbmFtZSA9PiB7XG4gICAgICByZXR1cm4gbmFtZSA9PT0gbnVsbCA/ICcnIDogU3RyaW5nVXRpbHMuZmlsbEluKCBzY3JlZW5OYW1lUGF0dGVyblN0cmluZ1Byb3BlcnR5LCB7XG4gICAgICAgIG5hbWU6IG5hbWVcbiAgICAgIH0gKTtcbiAgICB9ICk7XG5cbiAgICB0aGlzLm1heERUID0gb3B0aW9ucy5tYXhEVDtcblxuICAgIHRoaXMuY3JlYXRlTW9kZWwgPSBjcmVhdGVNb2RlbDtcbiAgICB0aGlzLmNyZWF0ZVZpZXcgPSBjcmVhdGVWaWV3O1xuXG4gICAgLy8gQ29uc3RydWN0aW9uIG9mIHRoZSBtb2RlbCBhbmQgdmlldyBhcmUgZGVsYXllZCBhbmQgY29udHJvbGxlZCB0byBlbmFibGUgZmVhdHVyZXMgbGlrZVxuICAgIC8vIGEpIGZhc3RlciBsb2FkaW5nIHdoZW4gb25seSBsb2FkaW5nIGNlcnRhaW4gc2NyZWVuc1xuICAgIC8vIGIpIHNob3dpbmcgYSBsb2FkaW5nIHByb2dyZXNzIGJhciA8bm90IGltcGxlbWVudGVkPlxuICAgIHRoaXMuX21vZGVsID0gbnVsbDtcbiAgICB0aGlzLl92aWV3ID0gbnVsbDtcblxuICAgIC8vIEluZGljYXRlcyB3aGV0aGVyIHRoZSBTY3JlZW4gaXMgYWN0aXZlLiBDbGllbnRzIGNhbiByZWFkIHRoaXMsIGpvaXN0IHNldHMgaXQuXG4gICAgLy8gVG8gcHJldmVudCBwb3RlbnRpYWwgdmlzdWFsIGdsaXRjaGVzLCB0aGUgdmFsdWUgc2hvdWxkIGNoYW5nZSBvbmx5IHdoaWxlIHRoZSBzY3JlZW4ncyB2aWV3IGlzIGludmlzaWJsZS5cbiAgICAvLyBUaGF0IGlzOiB0cmFuc2l0aW9ucyBmcm9tIGZhbHNlIHRvIHRydWUgYmVmb3JlIGEgU2NyZWVuIGJlY29tZXMgdmlzaWJsZSwgYW5kIGZyb20gdHJ1ZSB0byBmYWxzZSBhZnRlciBhIFNjcmVlbiBiZWNvbWVzIGludmlzaWJsZS5cbiAgICB0aGlzLmFjdGl2ZVByb3BlcnR5ID0gbmV3IEJvb2xlYW5Qcm9wZXJ0eSggdHJ1ZSwge1xuICAgICAgdGFuZGVtOiBvcHRpb25zLnRhbmRlbS5jcmVhdGVUYW5kZW0oICdhY3RpdmVQcm9wZXJ0eScgKSxcbiAgICAgIHBoZXRpb1JlYWRPbmx5OiB0cnVlLFxuICAgICAgcGhldGlvRG9jdW1lbnRhdGlvbjogJ0luZGljYXRlcyB3aGV0aGVyIHRoZSBzY3JlZW4gaXMgY3VycmVudGx5IGRpc3BsYXllZCBpbiB0aGUgc2ltdWxhdGlvbi4gIEZvciBzaW5nbGUtc2NyZWVuICcgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgJ3NpbXVsYXRpb25zLCB0aGVyZSBpcyBvbmx5IG9uZSBzY3JlZW4gYW5kIGl0IGlzIGFsd2F5cyBhY3RpdmUuJ1xuICAgIH0gKTtcblxuICAgIC8vIFRoZSBoZWxwVGV4dCBmb3IgdGhlIHNjcmVlbiBidXR0b25zIHVzZXMgdGhlIHByb3ZpZGVkIG9wdGlvbiwgYnV0IGNyZWF0ZXMgcmVhc29uYWJsZSBkZWZhdWx0c1xuICAgIC8vIGZyb20gdGhlIG5hbWVQcm9wZXJ0eSBvdGhlcndpc2UuXG4gICAgdGhpcy5zY3JlZW5CdXR0b25zSGVscFRleHQgPSAnJztcbiAgICBpZiAoIG9wdGlvbnMuc2NyZWVuQnV0dG9uc0hlbHBUZXh0ICkge1xuICAgICAgdGhpcy5zY3JlZW5CdXR0b25zSGVscFRleHQgPSBvcHRpb25zLnNjcmVlbkJ1dHRvbnNIZWxwVGV4dDtcbiAgICB9XG4gICAgZWxzZSBpZiAoIHRoaXMubmFtZVByb3BlcnR5LnZhbHVlICkge1xuXG4gICAgICAvLyBGYWxsIGJhY2sgdG8gXCJHbyB0byB7e1NjcmVlbiBOYW1lfX0gU2NyZWVuXCIgYXMgYSBkZWZhdWx0LlxuICAgICAgdGhpcy5zY3JlZW5CdXR0b25zSGVscFRleHQgPSBuZXcgUGF0dGVyblN0cmluZ1Byb3BlcnR5KCBnb1RvU2NyZWVuUGF0dGVyblN0cmluZ1Byb3BlcnR5LCB7XG4gICAgICAgIG5hbWU6IHRoaXMubmFtZVByb3BlcnR5XG4gICAgICB9LCB7IHRhbmRlbTogVGFuZGVtLk9QVF9PVVQgfSApO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIHRoaXMuc2NyZWVuQnV0dG9uc0hlbHBUZXh0ID0gc2ltU2NyZWVuU3RyaW5nUHJvcGVydHk7IC8vIGZhbGwgYmFjayBvbiBnZW5lcmljIG5hbWVcbiAgICB9XG5cbiAgICBhc3NlcnQgJiYgdGhpcy5hY3RpdmVQcm9wZXJ0eS5sYXp5TGluayggKCkgPT4ge1xuICAgICAgYXNzZXJ0ICYmIGFzc2VydCggdGhpcy5fdmlldywgJ2lzQWN0aXZlIHNob3VsZCBub3QgY2hhbmdlIGJlZm9yZSB0aGUgU2NyZWVuIHZpZXcgaGFzIGJlZW4gaW5pdGlhbGl6ZWQnICk7XG5cbiAgICAgIC8vIEluIHBoZXQtaW8gbW9kZSwgdGhlIHN0YXRlIG9mIGEgc2ltIGNhbiBiZSBzZXQgd2l0aG91dCBhIGRldGVybWluaXN0aWMgb3JkZXIuIFRoZSBhY3RpdmVQcm9wZXJ0eSBjb3VsZCBiZVxuICAgICAgLy8gY2hhbmdlZCBiZWZvcmUgdGhlIHZpZXcncyB2aXNpYmlsaXR5IGlzIHNldC5cbiAgICAgIGlmICggIVRhbmRlbS5QSEVUX0lPX0VOQUJMRUQgKSB7XG4gICAgICAgIGFzc2VydCAmJiBhc3NlcnQoICF0aGlzLl92aWV3IS5pc1Zpc2libGUoKSwgJ2lzQWN0aXZlIHNob3VsZCBub3QgY2hhbmdlIHdoaWxlIHRoZSBTY3JlZW4gdmlldyBpcyB2aXNpYmxlJyApO1xuICAgICAgfVxuICAgIH0gKTtcbiAgfVxuXG4gIC8vIFJldHVybnMgdGhlIG1vZGVsIChpZiBpdCBoYXMgYmVlbiBjb25zdHJ1Y3RlZClcbiAgcHVibGljIGdldCBtb2RlbCgpOiBNIHtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0aGlzLl9tb2RlbCwgJ01vZGVsIGhhcyBub3QgeWV0IGJlZW4gY29uc3RydWN0ZWQnICk7XG4gICAgcmV0dXJuIHRoaXMuX21vZGVsITtcbiAgfVxuXG4gIC8vIFJldHVybnMgdGhlIHZpZXcgKGlmIGl0IGhhcyBiZWVuIGNvbnN0cnVjdGVkKVxuICBwdWJsaWMgZ2V0IHZpZXcoKTogViB7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdGhpcy5fdmlldywgJ1ZpZXcgaGFzIG5vdCB5ZXQgYmVlbiBjb25zdHJ1Y3RlZCcgKTtcbiAgICByZXR1cm4gdGhpcy5fdmlldyE7XG4gIH1cblxuICBwdWJsaWMgaGFzTW9kZWwoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuICEhdGhpcy5fbW9kZWw7XG4gIH1cblxuICBwdWJsaWMgaGFzVmlldygpOiBib29sZWFuIHtcbiAgICByZXR1cm4gISF0aGlzLl92aWV3O1xuICB9XG5cbiAgcHVibGljIHJlc2V0KCk6IHZvaWQge1xuXG4gICAgLy8gQmFja2dyb3VuZCBjb2xvciBub3QgcmVzZXQsIGFzIGl0J3MgYSByZXNwb25zaWJpbGl0eSBvZiB0aGUgY29kZSB0aGF0IGNoYW5nZXMgdGhlIHByb3BlcnR5XG4gIH1cblxuICAvKipcbiAgICogSW5pdGlhbGl6ZSB0aGUgbW9kZWwuXG4gICAqIChqb2lzdC1pbnRlcm5hbClcbiAgICovXG4gIHB1YmxpYyBpbml0aWFsaXplTW9kZWwoKTogdm9pZCB7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdGhpcy5fbW9kZWwgPT09IG51bGwsICd0aGVyZSB3YXMgYWxyZWFkeSBhIG1vZGVsJyApO1xuICAgIHRoaXMuX21vZGVsID0gdGhpcy5jcmVhdGVNb2RlbCgpO1xuICB9XG5cbiAgLyoqXG4gICAqIEluaXRpYWxpemUgdGhlIHZpZXcuXG4gICAqIChqb2lzdC1pbnRlcm5hbClcbiAgICogQHBhcmFtIHNpbU5hbWVQcm9wZXJ0eSAtIFRoZSBQcm9wZXJ0eSBvZiB0aGUgbmFtZSBvZiB0aGUgc2ltLCB1c2VkIGZvciBhMTF5LlxuICAgKiBAcGFyYW0gZGlzcGxheWVkU2ltTmFtZVByb3BlcnR5IC0gVGhlIFByb3BlcnR5IG9mIHRoZSBkaXNwbGF5IG5hbWUgb2YgdGhlIHNpbSwgdXNlZCBmb3IgYTExeS4gQ291bGQgY2hhbmdlIGJhc2VkIG9uIHNjcmVlbi5cbiAgICogQHBhcmFtIG51bWJlck9mU2NyZWVucyAtIHRoZSBudW1iZXIgb2Ygc2NyZWVucyBpbiB0aGUgc2ltIHRoaXMgcnVudGltZSAoY291bGQgY2hhbmdlIHdpdGggYD9zY3JlZW5zPS4uLmAuXG4gICAqIEBwYXJhbSBpc0hvbWVTY3JlZW4gLSBpZiB0aGlzIHNjcmVlbiBpcyB0aGUgaG9tZSBzY3JlZW4uXG4gICAqL1xuICBwdWJsaWMgaW5pdGlhbGl6ZVZpZXcoIHNpbU5hbWVQcm9wZXJ0eTogVFJlYWRPbmx5UHJvcGVydHk8c3RyaW5nPiwgZGlzcGxheWVkU2ltTmFtZVByb3BlcnR5OiBUUmVhZE9ubHlQcm9wZXJ0eTxzdHJpbmc+LCBudW1iZXJPZlNjcmVlbnM6IG51bWJlciwgaXNIb21lU2NyZWVuOiBib29sZWFuICk6IHZvaWQge1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIHRoaXMuX3ZpZXcgPT09IG51bGwsICd0aGVyZSB3YXMgYWxyZWFkeSBhIHZpZXcnICk7XG4gICAgdGhpcy5fdmlldyA9IHRoaXMuY3JlYXRlVmlldyggdGhpcy5tb2RlbCApO1xuICAgIHRoaXMuX3ZpZXcuc2V0VmlzaWJsZSggZmFsc2UgKTsgLy8gYSBTY3JlZW4gaXMgaW52aXNpYmxlIHVudGlsIHNlbGVjdGVkXG5cbiAgICAvLyBTaG93IHRoZSBob21lIHNjcmVlbidzIGxheW91dEJvdW5kc1xuICAgIGlmICggcGhldC5jaGlwcGVyLnF1ZXJ5UGFyYW1ldGVycy5kZXYgKSB7XG4gICAgICB0aGlzLl92aWV3LmFkZENoaWxkKCBkZXZDcmVhdGVMYXlvdXRCb3VuZHNOb2RlKCB0aGlzLl92aWV3LmxheW91dEJvdW5kcyApICk7XG4gICAgfVxuXG4gICAgLy8gRm9yIGRlYnVnZ2luZywgbWFrZSBpdCBwb3NzaWJsZSB0byBzZWUgdGhlIHZpc2libGVCb3VuZHMuICBUaGlzIGlzIG5vdCBpbmNsdWRlZCB3aXRoID9kZXYgc2luY2VcbiAgICAvLyBpdCBzaG91bGQganVzdCBiZSBlcXVhbCB0byB3aGF0IHlvdSBzZWUuXG4gICAgaWYgKCBwaGV0LmNoaXBwZXIucXVlcnlQYXJhbWV0ZXJzLnNob3dWaXNpYmxlQm91bmRzICkge1xuICAgICAgdGhpcy5fdmlldy5hZGRDaGlsZCggZGV2Q3JlYXRlVmlzaWJsZUJvdW5kc05vZGUoIHRoaXMuX3ZpZXcgKSApO1xuICAgIH1cblxuICAgIC8vIFNldCB0aGUgYWNjZXNzaWJsZSBsYWJlbCBmb3IgdGhlIHNjcmVlbi5cbiAgICBNdWx0aWxpbmsubXVsdGlsaW5rKCBbIGRpc3BsYXllZFNpbU5hbWVQcm9wZXJ0eSwgc2ltTmFtZVByb3BlcnR5LCB0aGlzLnBkb21EaXNwbGF5TmFtZVByb3BlcnR5IF0sXG4gICAgICAoIGRpc3BsYXllZE5hbWUsIHNpbU5hbWUsIHBkb21EaXNwbGF5TmFtZSApID0+IHtcblxuICAgICAgICBsZXQgdGl0bGVTdHJpbmc7XG5cbiAgICAgICAgLy8gU2luZ2xlIHNjcmVlbiBzaW1zIGRvbid0IG5lZWQgc2NyZWVuIG5hbWVzLCBpbnN0ZWFkIGp1c3Qgc2hvdyB0aGUgdGl0bGUgb2YgdGhlIHNpbS5cbiAgICAgICAgLy8gVXNpbmcgdG90YWwgc2NyZWVucyBmb3Igc2ltIGJyZWFrcyBtb2R1bGFyaXR5IGEgYml0LCBidXQgaXQgYWxzbyBpcyBuZWVkZWQgYXMgdGhhdCBwYXJhbWV0ZXIgY2hhbmdlcyB0aGVcbiAgICAgICAgLy8gbGFiZWxsaW5nIG9mIHRoaXMgc2NyZWVuLCBzZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2pvaXN0L2lzc3Vlcy80OTZcbiAgICAgICAgaWYgKCBudW1iZXJPZlNjcmVlbnMgPT09IDEgKSB7XG4gICAgICAgICAgdGl0bGVTdHJpbmcgPSBkaXNwbGF5ZWROYW1lOyAvLyBmb3IgbXVsdGlzY3JlZW4gc2ltcywgbGlrZSBcIlJhdGlvIGFuZCBQcm9wb3J0aW9uIC0tIENyZWF0ZVwiXG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoIGlzSG9tZVNjcmVlbiApIHtcbiAgICAgICAgICB0aXRsZVN0cmluZyA9IHNpbU5hbWU7IC8vIExpa2UgXCJSYXRpbyBhbmQgUHJvcG90aW9uXCJcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcblxuICAgICAgICAgIC8vIGluaXRpYWxpemUgcHJvcGVyIFBET00gbGFiZWxsaW5nIGZvciBTY3JlZW5WaWV3XG4gICAgICAgICAgdGl0bGVTdHJpbmcgPSBTdHJpbmdVdGlscy5maWxsSW4oIHNjcmVlblNpbVBhdHRlcm5TdHJpbmdQcm9wZXJ0eSwge1xuICAgICAgICAgICAgc2NyZWVuTmFtZTogcGRvbURpc3BsYXlOYW1lLFxuICAgICAgICAgICAgc2ltTmFtZTogc2ltTmFtZVxuICAgICAgICAgIH0gKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIGlmIHRoZXJlIGlzIGEgc2NyZWVuU3VtbWFyeU5vZGUsIHRoZW4gc2V0IGl0cyBpbnRybyBzdHJpbmcgbm93XG4gICAgICAgIHRoaXMuX3ZpZXchLnNldFNjcmVlblN1bW1hcnlJbnRyb0FuZFRpdGxlKCBzaW1OYW1lLCBwZG9tRGlzcGxheU5hbWUsIHRpdGxlU3RyaW5nLCBudW1iZXJPZlNjcmVlbnMgPiAxICk7XG4gICAgICB9ICk7XG5cbiAgICBhc3NlcnQgJiYgdGhpcy5fdmlldy5wZG9tQXVkaXQoKTtcbiAgfVxufVxuXG4vKipcbiAqIFZhbGlkYXRlcyB0aGUgc2l6ZXMgZm9yIHRoZSBob21lIHNjcmVlbiBpY29uIGFuZCBuYXZpZ2F0aW9uIGJhciBpY29uLlxuICogQHBhcmFtIGljb24gLSB0aGUgaWNvbiB0byB2YWxpZGF0ZVxuICogQHBhcmFtIG1pbmltdW1TaXplIC0gdGhlIG1pbmltdW0gYWxsb3dlZCBzaXplIGZvciB0aGUgaWNvblxuICogQHBhcmFtIGFzcGVjdFJhdGlvIC0gdGhlIHJlcXVpcmVkIGFzcGVjdCByYXRpb1xuICogQHBhcmFtIG5hbWUgLSB0aGUgbmFtZSBvZiB0aGUgaWNvbiB0eXBlIChmb3IgYXNzZXJ0IG1lc3NhZ2VzKVxuICovXG5mdW5jdGlvbiB2YWxpZGF0ZUljb25TaXplKCBpY29uOiBOb2RlLCBtaW5pbXVtU2l6ZTogRGltZW5zaW9uMiwgYXNwZWN0UmF0aW86IG51bWJlciwgbmFtZTogc3RyaW5nICk6IHZvaWQge1xuICBhc3NlcnQgJiYgYXNzZXJ0KCBpY29uLndpZHRoID49IG1pbmltdW1TaXplLndpZHRoLCBgJHtuYW1lfSB3aWR0aCBpcyB0b28gc21hbGw6ICR7aWNvbi53aWR0aH0gPCAke21pbmltdW1TaXplLndpZHRofWAgKTtcbiAgYXNzZXJ0ICYmIGFzc2VydCggaWNvbi5oZWlnaHQgPj0gbWluaW11bVNpemUuaGVpZ2h0LCBgJHtuYW1lfSBoZWlnaHQgaXMgdG9vIHNtYWxsOiAke2ljb24uaGVpZ2h0fSA8ICR7bWluaW11bVNpemUuaGVpZ2h0fWAgKTtcblxuICAvLyBWYWxpZGF0ZSBob21lIHNjcmVlbiBhc3BlY3QgcmF0aW9cbiAgY29uc3QgYWN0dWFsQXNwZWN0UmF0aW8gPSBpY29uLndpZHRoIC8gaWNvbi5oZWlnaHQ7XG4gIGFzc2VydCAmJiBhc3NlcnQoXG4gICAgTWF0aC5hYnMoIGFzcGVjdFJhdGlvIC0gYWN0dWFsQXNwZWN0UmF0aW8gKSA8IElDT05fQVNQRUNUX1JBVElPX1RPTEVSQU5DRSxcbiAgICBgJHtuYW1lfSBoYXMgaW52YWxpZCBhc3BlY3QgcmF0aW86ICR7YWN0dWFsQXNwZWN0UmF0aW99YFxuICApO1xufVxuXG4vKipcbiAqIENyZWF0ZXMgYSBOb2RlIGZvciB2aXN1YWxpemluZyB0aGUgU2NyZWVuVmlldyBsYXlvdXRCb3VuZHMgd2l0aCAnZGV2JyBxdWVyeSBwYXJhbWV0ZXIuXG4gKi9cbmZ1bmN0aW9uIGRldkNyZWF0ZUxheW91dEJvdW5kc05vZGUoIGxheW91dEJvdW5kczogQm91bmRzMiApOiBOb2RlIHtcbiAgcmV0dXJuIG5ldyBQYXRoKCBTaGFwZS5ib3VuZHMoIGxheW91dEJvdW5kcyApLCB7XG4gICAgc3Ryb2tlOiAncmVkJyxcbiAgICBsaW5lV2lkdGg6IDMsXG4gICAgcGlja2FibGU6IGZhbHNlXG4gIH0gKTtcbn1cblxuLyoqXG4gKiBDcmVhdGVzIGEgTm9kZSBmb3IgdmlzdWFsaXppbmcgdGhlIFNjcmVlblZpZXcgdmlzaWJsZUJvdW5kc1Byb3BlcnR5IHdpdGggJ3Nob3dWaXNpYmxlQm91bmRzJyBxdWVyeSBwYXJhbWV0ZXIuXG4gKi9cbmZ1bmN0aW9uIGRldkNyZWF0ZVZpc2libGVCb3VuZHNOb2RlKCBzY3JlZW5WaWV3OiBTY3JlZW5WaWV3ICk6IE5vZGUge1xuICBjb25zdCBwYXRoID0gbmV3IFBhdGgoIFNoYXBlLmJvdW5kcyggc2NyZWVuVmlldy52aXNpYmxlQm91bmRzUHJvcGVydHkudmFsdWUgKSwge1xuICAgIHN0cm9rZTogJ2JsdWUnLFxuICAgIGxpbmVXaWR0aDogNixcbiAgICBwaWNrYWJsZTogZmFsc2VcbiAgfSApO1xuICBzY3JlZW5WaWV3LnZpc2libGVCb3VuZHNQcm9wZXJ0eS5saW5rKCB2aXNpYmxlQm91bmRzID0+IHtcbiAgICBwYXRoLnNoYXBlID0gU2hhcGUuYm91bmRzKCB2aXNpYmxlQm91bmRzICk7XG4gIH0gKTtcbiAgcmV0dXJuIHBhdGg7XG59XG5cbmpvaXN0LnJlZ2lzdGVyKCAnU2NyZWVuJywgU2NyZWVuICk7XG5leHBvcnQgZGVmYXVsdCBTY3JlZW47Il0sIm5hbWVzIjpbIkJvb2xlYW5Qcm9wZXJ0eSIsIkRlcml2ZWRQcm9wZXJ0eSIsIk11bHRpbGluayIsIlBhdHRlcm5TdHJpbmdQcm9wZXJ0eSIsIlByb3BlcnR5IiwiRGltZW5zaW9uMiIsIlNoYXBlIiwib3B0aW9uaXplIiwiU3RyaW5nVXRpbHMiLCJQYXRoIiwiUmVjdGFuZ2xlIiwiUGhldGlvT2JqZWN0IiwiVGFuZGVtIiwiSU9UeXBlIiwiUmVmZXJlbmNlSU8iLCJqb2lzdCIsIkpvaXN0U3RyaW5ncyIsIlNjcmVlbkljb24iLCJzY3JlZW5OYW1lUGF0dGVyblN0cmluZ1Byb3BlcnR5IiwiYTExeSIsImdvVG9TY3JlZW5QYXR0ZXJuU3RyaW5nUHJvcGVydHkiLCJzY3JlZW5TaW1QYXR0ZXJuU3RyaW5nUHJvcGVydHkiLCJzaW1TY3JlZW5TdHJpbmdQcm9wZXJ0eSIsIk1JTklNVU1fSE9NRV9TQ1JFRU5fSUNPTl9TSVpFIiwiTUlOSU1VTV9OQVZCQVJfSUNPTl9TSVpFIiwiTkFWQkFSX0lDT05fQVNQRUNUX1JBVElPIiwid2lkdGgiLCJoZWlnaHQiLCJIT01FX1NDUkVFTl9JQ09OX0FTUEVDVF9SQVRJTyIsIklDT05fQVNQRUNUX1JBVElPX1RPTEVSQU5DRSIsImFzc2VydCIsIk1hdGgiLCJhYnMiLCJTY3JlZW4iLCJtb2RlbCIsIl9tb2RlbCIsInZpZXciLCJfdmlldyIsImhhc01vZGVsIiwiaGFzVmlldyIsInJlc2V0IiwiaW5pdGlhbGl6ZU1vZGVsIiwiY3JlYXRlTW9kZWwiLCJpbml0aWFsaXplVmlldyIsInNpbU5hbWVQcm9wZXJ0eSIsImRpc3BsYXllZFNpbU5hbWVQcm9wZXJ0eSIsIm51bWJlck9mU2NyZWVucyIsImlzSG9tZVNjcmVlbiIsImNyZWF0ZVZpZXciLCJzZXRWaXNpYmxlIiwicGhldCIsImNoaXBwZXIiLCJxdWVyeVBhcmFtZXRlcnMiLCJkZXYiLCJhZGRDaGlsZCIsImRldkNyZWF0ZUxheW91dEJvdW5kc05vZGUiLCJsYXlvdXRCb3VuZHMiLCJzaG93VmlzaWJsZUJvdW5kcyIsImRldkNyZWF0ZVZpc2libGVCb3VuZHNOb2RlIiwibXVsdGlsaW5rIiwicGRvbURpc3BsYXlOYW1lUHJvcGVydHkiLCJkaXNwbGF5ZWROYW1lIiwic2ltTmFtZSIsInBkb21EaXNwbGF5TmFtZSIsInRpdGxlU3RyaW5nIiwiZmlsbEluIiwic2NyZWVuTmFtZSIsInNldFNjcmVlblN1bW1hcnlJbnRyb0FuZFRpdGxlIiwicGRvbUF1ZGl0IiwicHJvdmlkZWRPcHRpb25zIiwib3B0aW9ucyIsIm5hbWUiLCJpbnN0cnVtZW50TmFtZVByb3BlcnR5IiwiYmFja2dyb3VuZENvbG9yUHJvcGVydHkiLCJob21lU2NyZWVuSWNvbiIsInNob3dVbnNlbGVjdGVkSG9tZVNjcmVlbkljb25GcmFtZSIsIm5hdmlnYXRpb25CYXJJY29uIiwic2hvd1NjcmVlbkljb25GcmFtZUZvck5hdmlnYXRpb25CYXJGaWxsIiwibWF4RFQiLCJjcmVhdGVLZXlib2FyZEhlbHBOb2RlIiwic2NyZWVuQnV0dG9uc0hlbHBUZXh0IiwidGFuZGVtIiwiUkVRVUlSRUQiLCJ0YW5kZW1OYW1lU3VmZml4IiwiU0NSRUVOX1RBTkRFTV9OQU1FX1NVRkZJWCIsInBoZXRpb1R5cGUiLCJTY3JlZW5JTyIsInBoZXRpb1N0YXRlIiwicGhldGlvRmVhdHVyZWQiLCJfIiwiaW5jbHVkZXMiLCJpY29uTm9kZSIsImZpbGwiLCJ2YWx1ZSIsIm1heEljb25XaWR0aFByb3BvcnRpb24iLCJtYXhJY29uSGVpZ2h0UHJvcG9ydGlvbiIsInZhbGlkYXRlSWNvblNpemUiLCJuYW1lUHJvcGVydHkiLCJhZGRMaW5rZWRFbGVtZW50IiwidGFuZGVtTmFtZSIsImFjdGl2ZVByb3BlcnR5IiwiY3JlYXRlVGFuZGVtIiwicGhldGlvUmVhZE9ubHkiLCJwaGV0aW9Eb2N1bWVudGF0aW9uIiwiT1BUX09VVCIsImxhenlMaW5rIiwiUEhFVF9JT19FTkFCTEVEIiwiaXNWaXNpYmxlIiwidmFsdWVUeXBlIiwic3VwZXJ0eXBlIiwiT2JqZWN0SU8iLCJkb2N1bWVudGF0aW9uIiwiaWNvbiIsIm1pbmltdW1TaXplIiwiYXNwZWN0UmF0aW8iLCJhY3R1YWxBc3BlY3RSYXRpbyIsImJvdW5kcyIsInN0cm9rZSIsImxpbmVXaWR0aCIsInBpY2thYmxlIiwic2NyZWVuVmlldyIsInBhdGgiLCJ2aXNpYmxlQm91bmRzUHJvcGVydHkiLCJsaW5rIiwidmlzaWJsZUJvdW5kcyIsInNoYXBlIiwicmVnaXN0ZXIiXSwibWFwcGluZ3MiOiJBQUFBLHNEQUFzRDtBQUV0RDs7Ozs7Ozs7O0NBU0MsR0FFRCxPQUFPQSxxQkFBcUIsbUNBQW1DO0FBQy9ELE9BQU9DLHFCQUFxQixtQ0FBbUM7QUFDL0QsT0FBT0MsZUFBZSw2QkFBNkI7QUFDbkQsT0FBT0MsMkJBQTJCLHlDQUF5QztBQUUzRSxPQUFPQyxjQUFjLDRCQUE0QjtBQUdqRCxPQUFPQyxnQkFBZ0IsNkJBQTZCO0FBQ3BELFNBQVNDLEtBQUssUUFBUSwyQkFBMkI7QUFDakQsT0FBT0MsZUFBZSxrQ0FBa0M7QUFJeEQsT0FBT0MsaUJBQWlCLDBDQUEwQztBQUNsRSxTQUFzQkMsSUFBSSxFQUF1Q0MsU0FBUyxRQUFRLDhCQUE4QjtBQUNoSCxPQUFPQyxrQkFBMkMsa0NBQWtDO0FBQ3BGLE9BQU9DLFlBQVksNEJBQTRCO0FBQy9DLE9BQU9DLFlBQVksa0NBQWtDO0FBQ3JELE9BQU9DLGlCQUFpQix1Q0FBdUM7QUFDL0QsT0FBT0MsV0FBVyxhQUFhO0FBQy9CLE9BQU9DLGtCQUFrQixvQkFBb0I7QUFDN0MsT0FBT0MsZ0JBQWdCLGtCQUFrQjtBQUl6QyxNQUFNQyxrQ0FBa0NGLGFBQWFHLElBQUksQ0FBQ0QsK0JBQStCO0FBQ3pGLE1BQU1FLGtDQUFrQ0osYUFB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