// Copyright 2013-2024, University of Colorado Boulder
/**
 * Main class that represents one simulation.
 * Provides default initialization, such as polyfills as well.
 * If the simulation has only one screen, then there is no homescreen, home icon or screen icon in the navigation bar.
 *
 * The type for the contained Screen instances is Screen<any,any> since we do not want to parameterize Sim<[{M1,V1},{M2,V2}]
 * etc.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Chris Malley (PixelZoom, Inc.)
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ import animationFrameTimer from '../../axon/js/animationFrameTimer.js';
import BooleanProperty from '../../axon/js/BooleanProperty.js';
import createObservableArray from '../../axon/js/createObservableArray.js';
import DerivedProperty from '../../axon/js/DerivedProperty.js';
import Emitter from '../../axon/js/Emitter.js';
import Multilink from '../../axon/js/Multilink.js';
import NumberProperty from '../../axon/js/NumberProperty.js';
import Property from '../../axon/js/Property.js';
import stepTimer from '../../axon/js/stepTimer.js';
import LocalizedStringProperty from '../../chipper/js/browser/LocalizedStringProperty.js';
import Bounds2 from '../../dot/js/Bounds2.js';
import Combination from '../../dot/js/Combination.js';
import Dimension2 from '../../dot/js/Dimension2.js';
import dotRandom from '../../dot/js/dotRandom.js';
import Permutation from '../../dot/js/Permutation.js';
import Random from '../../dot/js/Random.js';
import DotUtils from '../../dot/js/Utils.js'; // eslint-disable-line phet/default-import-match-filename
import { addAffirmationHook, setAffirmationDebuggerMode } from '../../perennial-alias/js/browser-and-node/affirm.js';
import optionize from '../../phet-core/js/optionize.js';
import platform from '../../phet-core/js/platform.js';
import StringUtils from '../../phetcommon/js/util/StringUtils.js';
import BarrierRectangle from '../../scenery-phet/js/BarrierRectangle.js';
import { animatedPanZoomSingleton, Color, globalKeyStateTracker, HighlightPath, Node, Utils, voicingManager, voicingUtteranceQueue } from '../../scenery/js/imports.js';
import '../../sherpa/lib/game-up-camera-1.0.0.js';
import soundManager from '../../tambo/js/soundManager.js';
import isSettingPhetioStateProperty from '../../tandem/js/isSettingPhetioStateProperty.js';
import PhetioAction from '../../tandem/js/PhetioAction.js';
import PhetioObject from '../../tandem/js/PhetioObject.js';
import Tandem from '../../tandem/js/Tandem.js';
import ArrayIO from '../../tandem/js/types/ArrayIO.js';
import NumberIO from '../../tandem/js/types/NumberIO.js';
import StringIO from '../../tandem/js/types/StringIO.js';
import audioManager from './audioManager.js';
import Heartbeat from './Heartbeat.js';
import Helper from './Helper.js';
import HomeScreen from './HomeScreen.js';
import HomeScreenView from './HomeScreenView.js';
import joist from './joist.js';
import JoistStrings from './JoistStrings.js';
import launchCounter from './launchCounter.js';
import LookAndFeel from './LookAndFeel.js';
import MemoryMonitor from './MemoryMonitor.js';
import NavigationBar from './NavigationBar.js';
import packageJSON from './packageJSON.js';
import PreferencesModel from './preferences/PreferencesModel.js';
import Profiler from './Profiler.js';
import QueryParametersWarningDialog from './QueryParametersWarningDialog.js';
import Screen from './Screen.js';
import ScreenSelectionSoundGenerator from './ScreenSelectionSoundGenerator.js';
import ScreenshotGenerator from './ScreenshotGenerator.js';
import selectScreens from './selectScreens.js';
import SimDisplay from './SimDisplay.js';
import SimInfo from './SimInfo.js';
import LegendsOfLearningSupport from './thirdPartySupport/LegendsOfLearningSupport.js';
import Toolbar from './toolbar/Toolbar.js';
import updateCheck from './updateCheck.js';
// constants
const PROGRESS_BAR_WIDTH = 273;
const SUPPORTS_GESTURE_DESCRIPTION = platform.android || platform.mobileSafari;
// globals
phet.joist.elapsedTime = 0; // in milliseconds, use this in Tween.start for replicable playbacks
// When the simulation is going to be used to play back a recorded session, the simulation must be put into a special
// mode in which it will only update the model + view based on the playback clock events rather than the system clock.
// This must be set before the simulation is launched in order to ensure that no errant stepSimulation steps are called
// before the playback events begin.  This value is overridden for playback by PhetioEngineIO.
// (phet-io)
phet.joist.playbackModeEnabledProperty = new BooleanProperty(phet.chipper.queryParameters.playbackMode);
assert && assert(typeof phet.chipper.brand === 'string', 'phet.chipper.brand is required to run a sim');
let Sim = class Sim extends PhetioObject {
    /**
   * Update the views of the sim. This is meant to run after the state has been set to make sure that all view
   * elements are in sync with the new, current state of the sim. (even when the sim is inactive, as in the state
   * wrapper).
   */ updateViews() {
        // Trigger layout code
        this.resizeToWindow();
        this.selectedScreenProperty.value.view.step && this.selectedScreenProperty.value.view.step(0);
        // Clear all UtteranceQueue outputs that may have collected Utterances while state-setting logic occurred.
        // This is transient. https://github.com/phetsims/utterance-queue/issues/22 and https://github.com/phetsims/scenery/issues/1397
        this.display.descriptionUtteranceQueue.clear();
        voicingUtteranceQueue.clear();
        // Update the display asynchronously since it can trigger events on pointer validation, see https://github.com/phetsims/ph-scale/issues/212
        animationFrameTimer.runOnNextTick(()=>phet.joist.display.updateDisplay());
    }
    finishInit(screens) {
        _.each(screens, (screen)=>{
            screen.view.layerSplit = true;
            if (!this.detachInactiveScreenViews) {
                this.display.simulationRoot.addChild(screen.view);
            }
        });
        this.display.simulationRoot.addChild(this.navigationBar);
        if (this.preferencesModel.audioModel.supportsVoicing) {
            assert && assert(this.toolbar, 'toolbar should exist for voicing');
            this.display.simulationRoot.addChild(this.toolbar);
            this.display.simulationRoot.pdomOrder = [
                this.toolbar
            ];
            // If Voicing is not "fully" enabled, only the toolbar is able to produce Voicing output.
            // All other simulation components should not voice anything. This must be called only after
            // all ScreenViews have been constructed.
            voicingManager.voicingFullyEnabledProperty.link((fullyEnabled)=>{
                this.setSimVoicingVisible(fullyEnabled);
            });
        }
        this.selectedScreenProperty.link((currentScreen)=>{
            screens.forEach((screen)=>{
                const visible = screen === currentScreen;
                // Make the selected screen visible and active, other screens invisible and inactive.
                // screen.isActiveProperty should change only while the screen is invisible, https://github.com/phetsims/joist/issues/418
                if (visible) {
                    screen.activeProperty.set(visible);
                    if (this.detachInactiveScreenViews && !this.display.simulationRoot.hasChild(screen.view)) {
                        this.display.simulationRoot.insertChild(0, screen.view);
                    }
                }
                screen.view.setVisible(visible);
                if (!visible) {
                    if (this.detachInactiveScreenViews && this.display.simulationRoot.hasChild(screen.view)) {
                        this.display.simulationRoot.removeChild(screen.view);
                    }
                    screen.activeProperty.set(visible);
                }
            });
            this.updateBackground();
            if (!isSettingPhetioStateProperty.value) {
                // Zoom out again after changing screens so we don't pan to the center of the focused ScreenView,
                // and so user has an overview of the new screen, see https://github.com/phetsims/joist/issues/682.
                animatedPanZoomSingleton.listener.resetTransform();
            }
        });
        this.display.simulationRoot.addChild(this.topLayer);
        // Fit to the window and render the initial scene
        // Can't synchronously do this in Firefox, see https://github.com/phetsims/vegas/issues/55 and
        // https://bugzilla.mozilla.org/show_bug.cgi?id=840412.
        const resizeListener = ()=>{
            // Don't resize on window size changes if we are playing back input events.
            // See https://github.com/phetsims/joist/issues/37
            if (!phet.joist.playbackModeEnabledProperty.value) {
                this.resizePending = true;
            }
        };
        $(window).resize(resizeListener);
        window.addEventListener('resize', resizeListener);
        window.addEventListener('orientationchange', resizeListener);
        window.visualViewport && window.visualViewport.addEventListener('resize', resizeListener);
        this.resizeToWindow();
        // Kick off checking for updates, if that is enabled
        updateCheck.check();
        // If there are warnings, show them in a dialog
        if (QueryStringMachine.warnings.length) {
            const warningDialog = new QueryParametersWarningDialog(QueryStringMachine.warnings, {
                closeButtonListener: ()=>{
                    warningDialog.hide();
                    warningDialog.dispose();
                }
            });
            warningDialog.show();
        }
    }
    /*
   * Adds a popup in the global coordinate frame. If the popup is model, it displays a semi-transparent black input
   * barrier behind it. A modal popup prevent the user from interacting with the reset of the application until the
   * popup is hidden. Use hidePopup() to hide the popup.
   * @param popup - the popup, must implemented node.hide(), called by hidePopup
   * @param isModal - whether popup is modal
   */ showPopup(popup, isModal) {
        assert && assert(popup);
        assert && assert(!!popup.hide, 'Missing popup.hide() for showPopup');
        assert && assert(!this.topLayer.hasChild(popup), 'popup already shown');
        if (isModal) {
            this.rootNode.interruptSubtreeInput();
            this.modalNodeStack.push(popup);
            // pdom - modal dialogs should be the only readable content in the sim
            this.setPDOMViewsVisible(false);
            // voicing - responses from Nodes hidden by the modal dialog should not voice.
            this.setNonModalVoicingVisible(false);
        }
        if (popup.layout) {
            popup.layout(this.screenBoundsProperty.value);
        }
        this.topLayer.addChild(popup);
    }
    /*
   * Hides a popup that was previously displayed with showPopup()
   * @param popup
   * @param isModal - whether popup is modal
   */ hidePopup(popup, isModal) {
        assert && assert(popup && this.modalNodeStack.includes(popup));
        assert && assert(this.topLayer.hasChild(popup), 'popup was not shown');
        if (isModal) {
            this.modalNodeStack.remove(popup);
            if (this.modalNodeStack.length === 0) {
                // After hiding all popups, Voicing becomes enabled for components in the simulation window only if
                // "Sim Voicing" switch is on.
                this.setNonModalVoicingVisible(voicingManager.voicingFullyEnabledProperty.value);
                // pdom - when the dialog is hidden, make all ScreenView content visible to assistive technology
                this.setPDOMViewsVisible(true);
            }
        }
        this.topLayer.removeChild(popup);
    }
    resizeToWindow() {
        this.resizePending = false;
        this.resize(window.innerWidth, window.innerHeight); // eslint-disable-line phet/bad-sim-text
    }
    resize(width, height) {
        this.resizeAction.execute(width, height);
    }
    start() {
        // In order to animate the loading progress bar, we must schedule work with setTimeout
        // This array of {function} is the work that must be completed to launch the sim.
        const workItems = [];
        // Schedule instantiation of the screens
        this.screens.forEach((screen)=>{
            workItems.push(()=>{
                // Screens may share the same instance of backgroundProperty, see joist#441
                if (!screen.backgroundColorProperty.hasListener(this.updateBackground)) {
                    screen.backgroundColorProperty.link(this.updateBackground);
                }
                screen.initializeModel();
            });
            workItems.push(()=>{
                screen.initializeView(this.simNameProperty, this.displayedSimNameProperty, this.screens.length, this.homeScreen === screen);
            });
        });
        // loop to run startup items asynchronously so the DOM can be updated to show animation on the progress bar
        const runItem = (i)=>{
            setTimeout(()=>{
                workItems[i]();
                // Move the progress ahead by one so we show the full progress bar for a moment before the sim starts up
                const progress = DotUtils.linear(0, workItems.length - 1, 0.25, 1.0, i);
                // Support iOS Reading Mode, which saves a DOM snapshot after the progressBarForeground has already been
                // removed from the document, see https://github.com/phetsims/joist/issues/389
                if (document.getElementById('progressBarForeground')) {
                    // Grow the progress bar foreground to the right based on the progress so far.
                    document.getElementById('progressBarForeground').setAttribute('width', `${progress * PROGRESS_BAR_WIDTH}`);
                }
                if (i + 1 < workItems.length) {
                    runItem(i + 1);
                } else {
                    setTimeout(()=>{
                        this.finishInit(this.screens);
                        // Make sure requestAnimationFrame is defined
                        Utils.polyfillRequestAnimationFrame();
                        // Option for profiling
                        // if true, prints screen initialization time (total, model, view) to the console and displays
                        // profiling information on the screen
                        if (phet.chipper.queryParameters.profiler) {
                            Profiler.start(this);
                        }
                        // Notify listeners that all models and views have been constructed, and the Sim is ready to be shown.
                        // Used by PhET-iO. This does not coincide with the end of the Sim constructor (because Sim has
                        // asynchronous steps that finish after the constructor is completed )
                        this._isConstructionCompleteProperty.value = true;
                        // place the requestAnimationFrame *before* rendering to assure as close to 60fps with the setTimeout fallback.
                        // http://paulirish.com/2011/requestanimationframe-for-smart-animating/
                        // Launch the bound version so it can easily be swapped out for debugging.
                        // Schedules animation updates and runs the first step()
                        this.boundRunAnimationLoop();
                        // If the sim is in playback mode, then flush the timer's listeners. This makes sure that anything kicked
                        // to the next frame with `timer.runOnNextTick` during startup (like every notification about a PhET-iO
                        // instrumented element in phetioEngine.phetioObjectAdded()) can clear out before beginning playback.
                        if (phet.joist.playbackModeEnabledProperty.value) {
                            let beforeCounts = null;
                            if (assert) {
                                beforeCounts = Array.from(Random.allRandomInstances).map((n)=>n.numberOfCalls);
                            }
                            stepTimer.emit(0);
                            if (assert) {
                                const afterCounts = Array.from(Random.allRandomInstances).map((n)=>n.numberOfCalls);
                                assert && assert(_.isEqual(beforeCounts, afterCounts), `Random was called more times in the playback sim on startup, before: ${beforeCounts}, after: ${afterCounts}`);
                            }
                        }
                        // After the application is ready to go, remove the splash screen and progress bar.  Note the splash
                        // screen is removed after one step(), so the rendering is ready to go when the progress bar is hidden.
                        // no-op otherwise and will be disposed by phetioEngine.
                        if (!Tandem.PHET_IO_ENABLED || phet.preloads.phetio.queryParameters.phetioStandalone) {
                            window.phetSplashScreen.dispose();
                        }
                        // Sanity check that there is no phetio object in phet brand, see https://github.com/phetsims/phet-io/issues/1229
                        phet.chipper.brand === 'phet' && assert && assert(!Tandem.PHET_IO_ENABLED, 'window.phet.preloads.phetio should not exist for phet brand');
                        // Communicate sim load (successfully) to CT or other listening parent frames
                        if (phet.chipper.queryParameters.continuousTest) {
                            phet.chipper.reportContinuousTestResult({
                                type: 'continuous-test-load'
                            });
                        }
                        if (phet.chipper.queryParameters.postMessageOnLoad) {
                            window.parent && window.parent.postMessage(JSON.stringify({
                                type: 'load',
                                url: window.location.href
                            }), '*');
                        }
                    }, 25); // pause for a few milliseconds with the progress bar filled in before going to the home screen
                }
            }, // The following sets the amount of delay between each work item to make it easier to see the changes to the
            // progress bar.  A total value is divided by the number of work items.  This makes it possible to see the
            // progress bar when few work items exist, such as for a single screen sim, but allows things to move
            // reasonably quickly when more work items exist, such as for a four-screen sim.
            30 / workItems.length);
        };
        runItem(0);
    }
    // Bound to this.boundRunAnimationLoop so it can be run in window.requestAnimationFrame
    runAnimationLoop() {
        window.requestAnimationFrame(this.boundRunAnimationLoop);
        // Only run animation frames for an active sim. If in playbackMode, playback logic will handle animation frame
        // stepping manually.
        if (this.activeProperty.value && !phet.joist.playbackModeEnabledProperty.value) {
            // Handle Input fuzzing before stepping the sim because input events occur outside of sim steps, but not before the
            // first sim step (to prevent issues like https://github.com/phetsims/equality-explorer/issues/161).
            this.frameCounter > 0 && this.display.fuzzInputEvents();
            this.stepOneFrame();
        }
        // The animation frame timer runs every frame
        const currentTime = Date.now();
        animationFrameTimer.emit(getDT(this.lastAnimationFrameTime, currentTime));
        this.lastAnimationFrameTime = currentTime;
        if (Tandem.PHET_IO_ENABLED) {
            // PhET-iO batches messages to be sent to other frames, messages must be sent whether the sim is active or not
            phet.phetio.phetioCommandProcessor.onAnimationLoop(this);
        }
    }
    // Run a single frame including model, view and display updates, used by Legends of Learning
    stepOneFrame() {
        // Compute the elapsed time since the last frame, or guess 1/60th of a second if it is the first frame
        const currentTime = Date.now();
        const dt = getDT(this.lastStepTime, currentTime);
        this.lastStepTime = currentTime;
        // Don't run the simulation on steps back in time (see https://github.com/phetsims/joist/issues/409)
        if (dt > 0) {
            this.stepSimulation(dt);
        }
    }
    /**
   * Update the simulation model, view, scenery display with an elapsed time of dt.
   * @param dt - in seconds
   * (phet-io)
   */ stepSimulation(dt) {
        this.stepSimulationAction.execute(dt);
    }
    /**
   * Hide or show all accessible content related to the sim ScreenViews, and navigation bar. This content will
   * remain visible, but not be tab navigable or readable with a screen reader. This is generally useful when
   * displaying a pop up or modal dialog.
   */ setPDOMViewsVisible(visible) {
        for(let i = 0; i < this.screens.length; i++){
            this.screens[i].view.pdomVisible = visible;
        }
        this.navigationBar.pdomVisible = visible;
        this.homeScreen && this.homeScreen.view.setPDOMVisible(visible);
        this.toolbar && this.toolbar.setPDOMVisible(visible);
    }
    /**
   * Set the voicingVisible state of simulation components. When false, ONLY the Toolbar
   * and its buttons will be able to announce Voicing utterances. This is used by the
   * "Sim Voicing" switch in the toolbar which will disable all Voicing in the sim so that
   * only Toolbar content is announced.
   */ setSimVoicingVisible(visible) {
        this.setNonModalVoicingVisible(visible);
        this.topLayer && this.topLayer.setVoicingVisible(visible);
    }
    /**
   * Sets voicingVisible on all elements "behind" the modal node stack. In this case, voicing should not work for those
   * components when set to false.
   * @param visible
   */ setNonModalVoicingVisible(visible) {
        for(let i = 0; i < this.screens.length; i++){
            this.screens[i].view.voicingVisible = visible; // home screen is the first item, if created
        }
        this.navigationBar.voicingVisible = visible;
    }
    /**
   * Checks for whether multi-screen sims have screen names that are in phet.screenNameKeys within package.json,
   * see https://github.com/phetsims/chipper/issues/1367
   */ auditScreenNameKeys() {
        if (this.screens.length >= 2) {
            this.screens.forEach((screen)=>{
                if (!(screen instanceof HomeScreen) && screen.nameProperty instanceof LocalizedStringProperty) {
                    const stringKey = screen.nameProperty.stringKey;
                    assert && assert(packageJSON.phet.screenNameKeys.includes(stringKey), `For a multi-screen sim, the string key (${JSON.stringify(stringKey)}) should be in phet.screenNameKeys within package.json`);
                }
            });
        }
    }
    /**
   * Get helpful information for replicating the bug when an assertion occurs.
   */ getAssertionDebugInfo() {
        var _this_selectedScreenProperty_value, _this_selectedScreenProperty;
        const info = {
            seed: dotRandom.getSeed(),
            currentScreenName: (_this_selectedScreenProperty = this.selectedScreenProperty) == null ? void 0 : (_this_selectedScreenProperty_value = _this_selectedScreenProperty.value) == null ? void 0 : _this_selectedScreenProperty_value.constructor.name
        };
        if (this.topLayer.children.length > 1) {
            info.simTopLayer = this.topLayer.children.map((x)=>`${x.constructor.name}${x.constructor.name.includes('Parent') ? `: ${x.children.map((x)=>x.constructor.name)}` : ''}`);
        }
        return info;
    }
    /**
   * @param simNameProperty - the name of the simulation, to be displayed in the navbar and homescreen
   * @param allSimScreens - the possible screens for the sim in order of declaration (does not include the home screen)
   * @param [providedOptions] - see below for options
   */ constructor(simNameProperty, allSimScreens, providedOptions){
        window.phetSplashScreenDownloadComplete();
        // If an assertion fails while a Sim exists, add some helpful information about the context of the failure
        if (assert) {
            var _QueryStringMachine;
            assert(allSimScreens.length >= 1, 'at least one screen is required');
            window.assertions.assertionHooks.push(()=>{
                console.log('Debug info:', JSON.stringify(this.getAssertionDebugInfo(), null, 2));
            });
            addAffirmationHook(()=>{
                console.log('Debug info:', JSON.stringify(this.getAssertionDebugInfo(), null, 2));
            });
            if ((_QueryStringMachine = QueryStringMachine) == null ? void 0 : _QueryStringMachine.containsKey('debugger')) {
                setAffirmationDebuggerMode(true);
            }
        }
        if (phet.chipper.queryParameters.launchCounter) {
            simNameProperty = launchCounter(simNameProperty);
        }
        const options = optionize()({
            credits: {},
            // a {Node} placed onto the home screen (if available)
            homeScreenWarningNode: null,
            // If a PreferencesModel supports any preferences, the sim will include the PreferencesDialog and a
            // button in the NavigationBar to open it. Simulation conditions (like what locales are available) might enable
            // a PreferencesDialog by default. But PreferencesModel has many options you can provide.
            preferencesModel: null,
            // Passed to SimDisplay, but a top level option for API ease.
            webgl: SimDisplay.DEFAULT_WEBGL,
            detachInactiveScreenViews: false,
            // phet-io
            phetioState: false,
            phetioReadOnly: true,
            tandem: Tandem.ROOT
        }, providedOptions);
        if (!options.preferencesModel) {
            options.preferencesModel = new PreferencesModel();
        }
        // Some options are used by sim and SimDisplay. Promote webgl to top level sim option out of API ease, but it is
        // passed to the SimDisplay.
        const simDisplayOptions = {
            webgl: options.webgl,
            tandem: Tandem.GENERAL_VIEW.createTandem('display'),
            preferencesModel: options.preferencesModel
        };
        super(options), // Indicates sim construction completed, and that all screen models and views have been created.
        // This was added for PhET-iO but can be used by any client. This does not coincide with the end of the Sim
        // constructor (because Sim has asynchronous steps that finish after the constructor is completed)
        this._isConstructionCompleteProperty = new Property(false), this.isConstructionCompleteProperty = this._isConstructionCompleteProperty, // Sim screens normally update by implementing model.step(dt) or view.step(dt).  When that is impossible or
        // relatively awkward, it is possible to listen for a callback when a frame begins, when a frame is being processed
        // or after the frame is complete.  See https://github.com/phetsims/joist/issues/534
        // Indicates when a frame starts.  Listen to this Emitter if you have an action that must be
        // performed before the step begins.
        this.frameStartedEmitter = new Emitter(), this.frameEndedEmitter = new Emitter({
            tandem: Tandem.GENERAL_MODEL.createTandem('frameEndedEmitter'),
            phetioHighFrequency: true,
            phetioDocumentation: 'Indicates when a frame ends. Listen to this Emitter if you have an action that must be ' + 'performed after the model and view step completes.'
        }), // When the sim is active, scenery processes inputs and stepSimulation(dt) runs from the system clock.
        // Set to false for when the sim will be paused.
        this.activeProperty = new BooleanProperty(true, {
            tandem: Tandem.GENERAL_MODEL.createTandem('activeProperty'),
            phetioFeatured: true,
            phetioDocumentation: 'Determines whether the entire simulation is running and processing user input. ' + 'Setting this property to false pauses the simulation, and prevents user interaction.'
        }), // (joist-internal) - How the home screen and navbar are scaled. This scale is based on the
        // HomeScreen's layout bounds to support a consistently sized nav bar and menu. If this scale was based on the
        // layout bounds of the current screen, there could be differences in the nav bar across screens.
        this.scaleProperty = new NumberProperty(1), // (joist-internal) global bounds for the entire simulation. null before first resize
        this.boundsProperty = new Property(null), // (joist-internal) global bounds for the screen-specific part (excludes the navigation bar), null before first resize
        this.screenBoundsProperty = new Property(null), this.lookAndFeel = new LookAndFeel(), this.memoryMonitor = new MemoryMonitor(), // (joist-internal)
        this.version = packageJSON.version, // number of animation frames that have occurred
        this.frameCounter = 0, // Whether the window has resized since our last updateDisplay()
        this.resizePending = true, // Make our locale available
        this.locale = phet.chipper.locale || 'en', // The Toolbar is not created unless requested with a PreferencesModel.
        this.toolbar = null, // list of nodes that are "modal" and hence block input with the barrierRectangle.  Used by modal dialogs
        // and the PhetMenu
        this.modalNodeStack = createObservableArray(), // (joist-internal) Semi-transparent black barrier used to block input events when a dialog (or other popup)
        // is present, and fade out the background.
        this.barrierRectangle = new BarrierRectangle(this.modalNodeStack), // layer for popups, dialogs, and their backgrounds and barriers
        // TODO: How should we handle the popup for navigation? Can we set this to private? https://github.com/phetsims/joist/issues/841
        this.topLayer = new Node({
            children: [
                this.barrierRectangle
            ]
        }), // Keep track of the previous time for computing dt, and initially signify that time hasn't been recorded yet.
        this.lastStepTime = null, this.lastAnimationFrameTime = null;
        this.credits = options.credits;
        this.detachInactiveScreenViews = options.detachInactiveScreenViews;
        this.simNameProperty = simNameProperty;
        // playbackModeEnabledProperty cannot be changed after Sim construction has begun, hence this listener is added before
        // anything else is done, see https://github.com/phetsims/phet-io/issues/1146
        phet.joist.playbackModeEnabledProperty.lazyLink(()=>{
            throw new Error('playbackModeEnabledProperty cannot be changed after Sim construction has begun');
        });
        assert && this.isConstructionCompleteProperty.lazyLink((isConstructionComplete)=>{
            assert && assert(isConstructionComplete, 'Sim construction should never uncomplete');
        });
        const dimensionProperty = new Property(new Dimension2(0, 0), {
            valueComparisonStrategy: 'equalsFunction'
        });
        // Note: the public API is TReadOnlyProperty
        this.dimensionProperty = dimensionProperty;
        this.resizeAction = new PhetioAction((width, height)=>{
            assert && assert(width > 0 && height > 0, 'sim should have a nonzero area');
            dimensionProperty.value = new Dimension2(width, height);
            // Gracefully support bad dimensions, see https://github.com/phetsims/joist/issues/472
            if (width === 0 || height === 0) {
                return;
            }
            const scale = Math.min(width / HomeScreenView.LAYOUT_BOUNDS.width, height / HomeScreenView.LAYOUT_BOUNDS.height);
            // 40 px high on iPad Mobile Safari
            const navBarHeight = scale * NavigationBar.NAVIGATION_BAR_SIZE.height;
            this.navigationBar.layout(scale, width, navBarHeight);
            this.navigationBar.y = height - navBarHeight;
            this.display.setSize(new Dimension2(width, height));
            const screenHeight = height - this.navigationBar.height;
            if (this.toolbar) {
                this.toolbar.layout(scale, screenHeight);
            }
            // The available bounds for screens and top layer children - though currently provided
            // full width and height, will soon be reduced when menus (specifically the Preferences
            // Toolbar) takes up screen space.
            const screenMinX = this.toolbar ? this.toolbar.getDisplayedWidth() : 0;
            const availableScreenBounds = new Bounds2(screenMinX, 0, width, screenHeight);
            // Layout each of the screens
            _.each(this.screens, (m)=>m.view.layout(availableScreenBounds));
            this.topLayer.children.forEach((child)=>{
                child.layout && child.layout(availableScreenBounds);
            });
            // Fixes problems where the div would be way off center on iOS7
            if (platform.mobileSafari) {
                window.scrollTo(0, 0);
            }
            // update our scale and bounds properties after other changes (so listeners can be fired after screens are resized)
            this.scaleProperty.value = scale;
            this.boundsProperty.value = new Bounds2(0, 0, width, height);
            this.screenBoundsProperty.value = availableScreenBounds.copy();
            // set the scale describing the target Node, since scale from window resize is applied to each ScreenView,
            // (children of the PanZoomListener targetNode)
            animatedPanZoomSingleton.listener.setTargetScale(scale);
            // set the bounds which accurately describe the panZoomListener targetNode, since it would otherwise be
            // inaccurate with the very large BarrierRectangle
            animatedPanZoomSingleton.listener.setTargetBounds(this.boundsProperty.value);
            // constrain the simulation pan bounds so that it cannot be moved off screen
            animatedPanZoomSingleton.listener.setPanBounds(this.boundsProperty.value);
            // Set a corrective scaling for all HighlightPaths, so that focus highlight line widths
            // scale and look the same in view coordinates for all layout scales.
            HighlightPath.layoutScale = scale;
        }, {
            tandem: Tandem.GENERAL_MODEL.createTandem('resizeAction'),
            parameters: [
                {
                    name: 'width',
                    phetioType: NumberIO
                },
                {
                    name: 'height',
                    phetioType: NumberIO
                }
            ],
            phetioPlayback: true,
            phetioEventMetadata: {
                // resizeAction needs to always be playbackable because it acts independently of any other playback event.
                // Because of its unique nature, it should be a "top-level" `playback: true` event so that it is never marked as
                // `playback: false`. There are cases where it is nested under another `playback: true` event, like when the
                // wrapper launches the simulation, that cannot be avoided. For this reason, we use this override.
                alwaysPlaybackableOverride: true
            },
            phetioDocumentation: 'Executes when the sim is resized. Values are the sim dimensions in CSS pixels.'
        });
        this.stepSimulationAction = new PhetioAction((dt)=>{
            this.frameStartedEmitter.emit();
            // increment this before we can have an exception thrown, to see if we are missing frames
            this.frameCounter++;
            // Apply time scale effects here before usage
            dt *= phet.chipper.queryParameters.speed;
            if (this.resizePending) {
                this.resizeToWindow();
            }
            // If the user is on the home screen, we won't have a Screen that we'll want to step.  This must be done after
            // fuzz mouse, because fuzzing could change the selected screen, see #130
            const screen = this.selectedScreenProperty.value;
            // cap dt based on the current screen, see https://github.com/phetsims/joist/issues/130
            dt = Math.min(dt, screen.maxDT);
            // TODO: we are /1000 just to *1000?  Seems wasteful and like opportunity for error. See https://github.com/phetsims/joist/issues/387
            // Store the elapsed time in milliseconds for usage by Tween clients
            phet.joist.elapsedTime += dt * 1000;
            // timer step before model/view steps, see https://github.com/phetsims/joist/issues/401
            // Note that this is vital to support Interactive Description and the utterance queue.
            stepTimer.emit(dt);
            // If the dt is 0, we will skip the model step (see https://github.com/phetsims/joist/issues/171)
            if (screen.model.step && dt) {
                screen.model.step(dt);
            }
            // If using the TWEEN animation library, then update tweens before rendering the scene.
            // Update the tweens after the model is updated but before the view step.
            // See https://github.com/phetsims/joist/issues/401.
            //TODO https://github.com/phetsims/joist/issues/404 run TWEENs for the selected screen only
            if (window.TWEEN) {
                window.TWEEN.update(phet.joist.elapsedTime);
            }
            this.display.step(dt);
            // View step is the last thing before updateDisplay(), so we can do paint updates there.
            // See https://github.com/phetsims/joist/issues/401.
            screen.view.step(dt);
            // Do not update the display while PhET-iO is customizing, or it could show the sim before it is fully ready for display.
            if (!(Tandem.PHET_IO_ENABLED && !phet.phetio.phetioEngine.isReadyForDisplay)) {
                this.display.updateDisplay();
            }
            if (phet.chipper.queryParameters.memoryLimit) {
                this.memoryMonitor.measure();
            }
            this.frameEndedEmitter.emit();
        }, {
            tandem: Tandem.GENERAL_MODEL.createTandem('stepSimulationAction'),
            parameters: [
                {
                    name: 'dt',
                    phetioType: NumberIO,
                    phetioDocumentation: 'The amount of time stepped in each call, in seconds.'
                }
            ],
            phetioHighFrequency: true,
            phetioPlayback: true,
            phetioDocumentation: 'A function that steps time forward.'
        });
        const screensTandem = Tandem.GENERAL_MODEL.createTandem('screens');
        const screenData = selectScreens(allSimScreens, phet.chipper.queryParameters.homeScreen, QueryStringMachine.containsKey('homeScreen'), phet.chipper.queryParameters.initialScreen, QueryStringMachine.containsKey('initialScreen'), phet.chipper.queryParameters.screens, QueryStringMachine.containsKey('screens'), (selectedSimScreens)=>{
            const possibleScreenIndices = selectedSimScreens.map((screen)=>{
                return allSimScreens.indexOf(screen) + 1;
            });
            const validValues = _.flatten(Combination.combinationsOf(possibleScreenIndices).map((subset)=>Permutation.permutationsOf(subset))).filter((array)=>array.length > 0).sort();
            // Controls the subset (and order) of screens that appear to the user. Separate from the ?screens query parameter
            // for phet-io purposes. See https://github.com/phetsims/joist/issues/827
            this.availableScreensProperty = new Property(possibleScreenIndices, {
                tandem: screensTandem.createTandem('availableScreensProperty'),
                isValidValue: (value)=>_.some(validValues, (validValue)=>_.isEqual(value, validValue)),
                phetioFeatured: true,
                phetioValueType: ArrayIO(NumberIO),
                phetioDocumentation: 'Controls which screens are available, and the order they are displayed.'
            });
            this.activeSimScreensProperty = new DerivedProperty([
                this.availableScreensProperty
            ], (screenIndices)=>{
                return screenIndices.map((index)=>allSimScreens[index - 1]);
            });
        }, (selectedSimScreens)=>{
            return new HomeScreen(this.simNameProperty, ()=>this.selectedScreenProperty, selectedSimScreens, this.activeSimScreensProperty, {
                tandem: options.tandem.createTandem(window.phetio.PhetioIDUtils.HOME_SCREEN_COMPONENT_NAME),
                warningNode: options.homeScreenWarningNode
            });
        });
        this.homeScreen = screenData.homeScreen;
        this.simScreens = screenData.selectedSimScreens;
        this.screens = screenData.screens;
        this.allScreensCreated = screenData.allScreensCreated;
        this.selectedScreenProperty = new Property(screenData.initialScreen, {
            tandem: screensTandem.createTandem('selectedScreenProperty'),
            phetioFeatured: true,
            phetioDocumentation: 'Determines which screen is selected in the simulation',
            validValues: this.screens,
            phetioValueType: Screen.ScreenIO
        });
        // If the activeSimScreens changes, we'll want to update what the active screen (or selected screen) is for specific
        // cases.
        this.activeSimScreensProperty.lazyLink((screens)=>{
            const screen = this.selectedScreenProperty.value;
            if (screen === this.homeScreen) {
                if (screens.length === 1) {
                    // If we're on the home screen and it switches to a 1-screen sim, go to that screen
                    this.selectedScreenProperty.value = screens[0];
                } else if (!screens.includes(this.homeScreen.model.selectedScreenProperty.value)) {
                    // If we're on the home screen and our "selected" screen disappears, select the first sim screen
                    this.homeScreen.model.selectedScreenProperty.value = screens[0];
                }
            } else if (!screens.includes(screen)) {
                // If we're on a screen that "disappears", go to the first screen
                this.selectedScreenProperty.value = screens[0];
            }
        });
        this.displayedSimNameProperty = DerivedProperty.deriveAny([
            this.availableScreensProperty,
            this.simNameProperty,
            this.selectedScreenProperty,
            JoistStrings.simTitleWithScreenNamePatternStringProperty,
            ..._.uniq(this.screens.map((screen)=>screen.nameProperty)) // To support duplicate screens
        ], ()=>{
            const availableScreens = this.availableScreensProperty.value;
            const simName = this.simNameProperty.value;
            const selectedScreen = this.selectedScreenProperty.value;
            const titleWithScreenPattern = JoistStrings.simTitleWithScreenNamePatternStringProperty.value;
            const screenName = selectedScreen.nameProperty.value;
            const isMultiScreenSimDisplayingSingleScreen = availableScreens.length === 1 && allSimScreens.length > 1;
            // update the titleText based on values of the sim name and screen name
            if (isMultiScreenSimDisplayingSingleScreen && simName && screenName) {
                // If the 'screens' query parameter selects only 1 screen and both the sim and screen name are not the empty
                // string, then update the nav bar title to include a hyphen and the screen name after the sim name.
                return StringUtils.fillIn(titleWithScreenPattern, {
                    simName: simName,
                    screenName: screenName
                });
            } else if (isMultiScreenSimDisplayingSingleScreen && screenName) {
                return screenName;
            } else {
                return simName;
            }
        }, {
            tandem: Tandem.GENERAL_MODEL.createTandem('displayedSimNameProperty'),
            tandemNameSuffix: 'NameProperty',
            phetioDocumentation: 'Customize this string by editing its dependencies.',
            phetioFeatured: true,
            phetioValueType: StringIO
        });
        // Local variable is settable...
        const browserTabVisibleProperty = new BooleanProperty(true, {
            tandem: Tandem.GENERAL_MODEL.createTandem('browserTabVisibleProperty'),
            phetioDocumentation: 'Indicates whether the browser tab containing the simulation is currently visible',
            phetioReadOnly: true,
            phetioFeatured: true
        });
        // ... but the public class attribute is read-only
        this.browserTabVisibleProperty = browserTabVisibleProperty;
        // set the state of the property that indicates if the browser tab is visible
        document.addEventListener('visibilitychange', ()=>{
            browserTabVisibleProperty.set(document.visibilityState === 'visible');
        }, false);
        assert && assert(window.phet.joist.launchCalled, 'Sim must be launched using simLauncher, ' + 'see https://github.com/phetsims/joist/issues/142');
        this.supportsGestureDescription = phet.chipper.queryParameters.supportsInteractiveDescription && SUPPORTS_GESTURE_DESCRIPTION;
        this.hasKeyboardHelpContent = _.some(this.simScreens, (simScreen)=>!!simScreen.createKeyboardHelpNode);
        assert && assert(!window.phet.joist.sim, 'Only supports one sim at a time');
        window.phet.joist.sim = this;
        // commented out because https://github.com/phetsims/joist/issues/553 is deferred for after GQIO-oneone
        // if ( PHET_IO_ENABLED ) {
        //   this.engagementMetrics = new EngagementMetrics( this );
        // }
        this.preferencesModel = options.preferencesModel;
        // initialize audio and audio subcomponents
        audioManager.initialize(this);
        // hook up sound generation for screen changes
        if (this.preferencesModel.audioModel.supportsSound) {
            soundManager.addSoundGenerator(new ScreenSelectionSoundGenerator(this.selectedScreenProperty, this.homeScreen, {
                initialOutputLevel: 0.5
            }), {
                categoryName: 'user-interface'
            });
        }
        // Make ScreenshotGenerator available globally so it can be used in preload files such as PhET-iO.
        window.phet.joist.ScreenshotGenerator = ScreenshotGenerator;
        // If the locale query parameter was specified, then we may be running the all.html file, so adjust the title.
        // See https://github.com/phetsims/chipper/issues/510
        this.simNameProperty.link((simName)=>{
            document.title = simName;
        });
        // For now the Toolbar only includes controls for Voicing and is only constructed when that feature is supported.
        if (this.preferencesModel.audioModel.supportsVoicing) {
            this.toolbar = new Toolbar(this.preferencesModel.audioModel.toolbarEnabledProperty, this.selectedScreenProperty, this.lookAndFeel);
            // when the Toolbar positions update, resize the sim to fit in the available space
            this.toolbar.rightPositionProperty.lazyLink(()=>{
                this.resize(this.boundsProperty.value.width, this.boundsProperty.value.height);
            });
        }
        this.display = new SimDisplay(simDisplayOptions);
        this.rootNode = this.display.rootNode;
        Helper.initialize(this, this.display);
        // Reset last event capture to prevent a maxDT "jump" when resuming, see https://github.com/phetsims/joist/issues/977
        this.activeProperty.lazyLink((active)=>{
            if (active) {
                this.lastStepTime = null;
                this.lastAnimationFrameTime = null;
            }
        });
        Multilink.multilink([
            this.activeProperty,
            phet.joist.playbackModeEnabledProperty
        ], (active, playbackModeEnabled)=>{
            // If in playbackMode is enabled, then the display must be interactive to support PDOM event listeners during
            // playback (which often come directly from sim code and not from user input).
            if (playbackModeEnabled) {
                this.display.interactive = true;
                globalKeyStateTracker.enabled = true;
            } else {
                // When the sim is inactive, make it non-interactive, see https://github.com/phetsims/scenery/issues/414
                this.display.interactive = active;
                globalKeyStateTracker.enabled = active;
            }
        });
        document.body.appendChild(this.display.domElement);
        Heartbeat.start(this);
        this.navigationBar = new NavigationBar(this, Tandem.GENERAL_VIEW.createTandem('navigationBar'));
        this.updateBackground = ()=>{
            this.lookAndFeel.backgroundColorProperty.value = Color.toColor(this.selectedScreenProperty.value.backgroundColorProperty.value);
        };
        this.lookAndFeel.backgroundColorProperty.link((backgroundColor)=>{
            this.display.backgroundColor = backgroundColor;
        });
        this.selectedScreenProperty.link(()=>this.updateBackground());
        // When the user switches screens, interrupt the input on the previous screen.
        // See https://github.com/phetsims/scenery/issues/218
        this.selectedScreenProperty.lazyLink((newScreen, oldScreen)=>oldScreen.view.interruptSubtreeInput());
        this.simInfo = new SimInfo(this);
        // Set up PhET-iO, must be done after phet.joist.sim is assigned
        Tandem.PHET_IO_ENABLED && phet.phetio.phetioEngine.onSimConstructionStarted(this.simInfo, this.isConstructionCompleteProperty, this.frameEndedEmitter, this.display);
        isSettingPhetioStateProperty.lazyLink((isSettingState)=>{
            if (!isSettingState) {
                this.updateViews();
            }
        });
        this.boundRunAnimationLoop = this.runAnimationLoop.bind(this);
        // Third party support
        phet.chipper.queryParameters.legendsOfLearning && new LegendsOfLearningSupport(this).start();
        assert && this.auditScreenNameKeys();
    }
};
export { Sim as default };
/**
 * Compute the dt since the last event
 * @param lastTime - milliseconds, time of the last event, null if there is no last event.
 * @param currentTime - milliseconds, current time.  Passed in instead of computed so there is no "slack" between measurements
 */ function getDT(lastTime, currentTime) {
    assert && lastTime !== null && assert(lastTime > 0, 'time must be positive (it isn\'t 1970 anymore)');
    // Compute the elapsed time since the last frame, or guess 1/60th of a second if it is the first frame
    return lastTime === null ? 1 / 60 : (currentTime - lastTime) / 1000.0;
}
joist.register('Sim', Sim);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2pvaXN0L2pzL1NpbS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxMy0yMDI0LCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuLyoqXG4gKiBNYWluIGNsYXNzIHRoYXQgcmVwcmVzZW50cyBvbmUgc2ltdWxhdGlvbi5cbiAqIFByb3ZpZGVzIGRlZmF1bHQgaW5pdGlhbGl6YXRpb24sIHN1Y2ggYXMgcG9seWZpbGxzIGFzIHdlbGwuXG4gKiBJZiB0aGUgc2ltdWxhdGlvbiBoYXMgb25seSBvbmUgc2NyZWVuLCB0aGVuIHRoZXJlIGlzIG5vIGhvbWVzY3JlZW4sIGhvbWUgaWNvbiBvciBzY3JlZW4gaWNvbiBpbiB0aGUgbmF2aWdhdGlvbiBiYXIuXG4gKlxuICogVGhlIHR5cGUgZm9yIHRoZSBjb250YWluZWQgU2NyZWVuIGluc3RhbmNlcyBpcyBTY3JlZW48YW55LGFueT4gc2luY2Ugd2UgZG8gbm90IHdhbnQgdG8gcGFyYW1ldGVyaXplIFNpbTxbe00xLFYxfSx7TTIsVjJ9XVxuICogZXRjLlxuICpcbiAqIEBhdXRob3IgU2FtIFJlaWQgKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXG4gKiBAYXV0aG9yIENocmlzIE1hbGxleSAoUGl4ZWxab29tLCBJbmMuKVxuICogQGF1dGhvciBKb25hdGhhbiBPbHNvbiA8am9uYXRoYW4ub2xzb25AY29sb3JhZG8uZWR1PlxuICovXG5cbmltcG9ydCBhbmltYXRpb25GcmFtZVRpbWVyIGZyb20gJy4uLy4uL2F4b24vanMvYW5pbWF0aW9uRnJhbWVUaW1lci5qcyc7XG5pbXBvcnQgQm9vbGVhblByb3BlcnR5IGZyb20gJy4uLy4uL2F4b24vanMvQm9vbGVhblByb3BlcnR5LmpzJztcbmltcG9ydCBjcmVhdGVPYnNlcnZhYmxlQXJyYXkgZnJvbSAnLi4vLi4vYXhvbi9qcy9jcmVhdGVPYnNlcnZhYmxlQXJyYXkuanMnO1xuaW1wb3J0IERlcml2ZWRQcm9wZXJ0eSBmcm9tICcuLi8uLi9heG9uL2pzL0Rlcml2ZWRQcm9wZXJ0eS5qcyc7XG5pbXBvcnQgRW1pdHRlciBmcm9tICcuLi8uLi9heG9uL2pzL0VtaXR0ZXIuanMnO1xuaW1wb3J0IE11bHRpbGluayBmcm9tICcuLi8uLi9heG9uL2pzL011bHRpbGluay5qcyc7XG5pbXBvcnQgTnVtYmVyUHJvcGVydHkgZnJvbSAnLi4vLi4vYXhvbi9qcy9OdW1iZXJQcm9wZXJ0eS5qcyc7XG5pbXBvcnQgUHJvcGVydHkgZnJvbSAnLi4vLi4vYXhvbi9qcy9Qcm9wZXJ0eS5qcyc7XG5pbXBvcnQgUmVhZE9ubHlQcm9wZXJ0eSBmcm9tICcuLi8uLi9heG9uL2pzL1JlYWRPbmx5UHJvcGVydHkuanMnO1xuaW1wb3J0IHN0ZXBUaW1lciBmcm9tICcuLi8uLi9heG9uL2pzL3N0ZXBUaW1lci5qcyc7XG5pbXBvcnQgVFJlYWRPbmx5UHJvcGVydHkgZnJvbSAnLi4vLi4vYXhvbi9qcy9UUmVhZE9ubHlQcm9wZXJ0eS5qcyc7XG5pbXBvcnQgTG9jYWxpemVkU3RyaW5nUHJvcGVydHkgZnJvbSAnLi4vLi4vY2hpcHBlci9qcy9icm93c2VyL0xvY2FsaXplZFN0cmluZ1Byb3BlcnR5LmpzJztcbmltcG9ydCBCb3VuZHMyIGZyb20gJy4uLy4uL2RvdC9qcy9Cb3VuZHMyLmpzJztcbmltcG9ydCBDb21iaW5hdGlvbiBmcm9tICcuLi8uLi9kb3QvanMvQ29tYmluYXRpb24uanMnO1xuaW1wb3J0IERpbWVuc2lvbjIgZnJvbSAnLi4vLi4vZG90L2pzL0RpbWVuc2lvbjIuanMnO1xuaW1wb3J0IGRvdFJhbmRvbSBmcm9tICcuLi8uLi9kb3QvanMvZG90UmFuZG9tLmpzJztcbmltcG9ydCBQZXJtdXRhdGlvbiBmcm9tICcuLi8uLi9kb3QvanMvUGVybXV0YXRpb24uanMnO1xuaW1wb3J0IFJhbmRvbSBmcm9tICcuLi8uLi9kb3QvanMvUmFuZG9tLmpzJztcbmltcG9ydCBEb3RVdGlscyBmcm9tICcuLi8uLi9kb3QvanMvVXRpbHMuanMnOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIHBoZXQvZGVmYXVsdC1pbXBvcnQtbWF0Y2gtZmlsZW5hbWVcbmltcG9ydCB7IGFkZEFmZmlybWF0aW9uSG9vaywgc2V0QWZmaXJtYXRpb25EZWJ1Z2dlck1vZGUgfSBmcm9tICcuLi8uLi9wZXJlbm5pYWwtYWxpYXMvanMvYnJvd3Nlci1hbmQtbm9kZS9hZmZpcm0uanMnO1xuaW1wb3J0IG9wdGlvbml6ZSBmcm9tICcuLi8uLi9waGV0LWNvcmUvanMvb3B0aW9uaXplLmpzJztcbmltcG9ydCBwbGF0Zm9ybSBmcm9tICcuLi8uLi9waGV0LWNvcmUvanMvcGxhdGZvcm0uanMnO1xuaW1wb3J0IEludGVudGlvbmFsQW55IGZyb20gJy4uLy4uL3BoZXQtY29yZS9qcy90eXBlcy9JbnRlbnRpb25hbEFueS5qcyc7XG5pbXBvcnQgUGlja09wdGlvbmFsIGZyb20gJy4uLy4uL3BoZXQtY29yZS9qcy90eXBlcy9QaWNrT3B0aW9uYWwuanMnO1xuaW1wb3J0IFN0cmluZ1V0aWxzIGZyb20gJy4uLy4uL3BoZXRjb21tb24vanMvdXRpbC9TdHJpbmdVdGlscy5qcyc7XG5pbXBvcnQgQmFycmllclJlY3RhbmdsZSBmcm9tICcuLi8uLi9zY2VuZXJ5LXBoZXQvanMvQmFycmllclJlY3RhbmdsZS5qcyc7XG5pbXBvcnQgeyBhbmltYXRlZFBhblpvb21TaW5nbGV0b24sIENvbG9yLCBnbG9iYWxLZXlTdGF0ZVRyYWNrZXIsIEhpZ2hsaWdodFBhdGgsIE5vZGUsIFV0aWxzLCB2b2ljaW5nTWFuYWdlciwgdm9pY2luZ1V0dGVyYW5jZVF1ZXVlIH0gZnJvbSAnLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcbmltcG9ydCAnLi4vLi4vc2hlcnBhL2xpYi9nYW1lLXVwLWNhbWVyYS0xLjAuMC5qcyc7XG5pbXBvcnQgeyBQb3B1cGFibGVOb2RlIH0gZnJvbSAnLi4vLi4vc3VuL2pzL1BvcHVwYWJsZS5qcyc7XG5pbXBvcnQgc291bmRNYW5hZ2VyIGZyb20gJy4uLy4uL3RhbWJvL2pzL3NvdW5kTWFuYWdlci5qcyc7XG5pbXBvcnQgaXNTZXR0aW5nUGhldGlvU3RhdGVQcm9wZXJ0eSBmcm9tICcuLi8uLi90YW5kZW0vanMvaXNTZXR0aW5nUGhldGlvU3RhdGVQcm9wZXJ0eS5qcyc7XG5pbXBvcnQgUGhldGlvQWN0aW9uIGZyb20gJy4uLy4uL3RhbmRlbS9qcy9QaGV0aW9BY3Rpb24uanMnO1xuaW1wb3J0IFBoZXRpb09iamVjdCwgeyBQaGV0aW9PYmplY3RPcHRpb25zIH0gZnJvbSAnLi4vLi4vdGFuZGVtL2pzL1BoZXRpb09iamVjdC5qcyc7XG5pbXBvcnQgVGFuZGVtIGZyb20gJy4uLy4uL3RhbmRlbS9qcy9UYW5kZW0uanMnO1xuaW1wb3J0IEFycmF5SU8gZnJvbSAnLi4vLi4vdGFuZGVtL2pzL3R5cGVzL0FycmF5SU8uanMnO1xuaW1wb3J0IE51bWJlcklPIGZyb20gJy4uLy4uL3RhbmRlbS9qcy90eXBlcy9OdW1iZXJJTy5qcyc7XG5pbXBvcnQgU3RyaW5nSU8gZnJvbSAnLi4vLi4vdGFuZGVtL2pzL3R5cGVzL1N0cmluZ0lPLmpzJztcbmltcG9ydCBhdWRpb01hbmFnZXIgZnJvbSAnLi9hdWRpb01hbmFnZXIuanMnO1xuaW1wb3J0IHsgQ3JlZGl0c0RhdGEgfSBmcm9tICcuL0NyZWRpdHNOb2RlLmpzJztcbmltcG9ydCBIZWFydGJlYXQgZnJvbSAnLi9IZWFydGJlYXQuanMnO1xuaW1wb3J0IEhlbHBlciBmcm9tICcuL0hlbHBlci5qcyc7XG5pbXBvcnQgSG9tZVNjcmVlbiBmcm9tICcuL0hvbWVTY3JlZW4uanMnO1xuaW1wb3J0IEhvbWVTY3JlZW5WaWV3IGZyb20gJy4vSG9tZVNjcmVlblZpZXcuanMnO1xuaW1wb3J0IHsgTG9jYWxlIH0gZnJvbSAnLi9pMThuL2xvY2FsZVByb3BlcnR5LmpzJztcbmltcG9ydCBqb2lzdCBmcm9tICcuL2pvaXN0LmpzJztcbmltcG9ydCBKb2lzdFN0cmluZ3MgZnJvbSAnLi9Kb2lzdFN0cmluZ3MuanMnO1xuaW1wb3J0IGxhdW5jaENvdW50ZXIgZnJvbSAnLi9sYXVuY2hDb3VudGVyLmpzJztcbmltcG9ydCBMb29rQW5kRmVlbCBmcm9tICcuL0xvb2tBbmRGZWVsLmpzJztcbmltcG9ydCBNZW1vcnlNb25pdG9yIGZyb20gJy4vTWVtb3J5TW9uaXRvci5qcyc7XG5pbXBvcnQgTmF2aWdhdGlvbkJhciBmcm9tICcuL05hdmlnYXRpb25CYXIuanMnO1xuaW1wb3J0IHBhY2thZ2VKU09OIGZyb20gJy4vcGFja2FnZUpTT04uanMnO1xuaW1wb3J0IFByZWZlcmVuY2VzTW9kZWwgZnJvbSAnLi9wcmVmZXJlbmNlcy9QcmVmZXJlbmNlc01vZGVsLmpzJztcbmltcG9ydCBQcm9maWxlciBmcm9tICcuL1Byb2ZpbGVyLmpzJztcbmltcG9ydCBRdWVyeVBhcmFtZXRlcnNXYXJuaW5nRGlhbG9nIGZyb20gJy4vUXVlcnlQYXJhbWV0ZXJzV2FybmluZ0RpYWxvZy5qcyc7XG5pbXBvcnQgU2NyZWVuLCB7IEFueVNjcmVlbiB9IGZyb20gJy4vU2NyZWVuLmpzJztcbmltcG9ydCBTY3JlZW5TZWxlY3Rpb25Tb3VuZEdlbmVyYXRvciBmcm9tICcuL1NjcmVlblNlbGVjdGlvblNvdW5kR2VuZXJhdG9yLmpzJztcbmltcG9ydCBTY3JlZW5zaG90R2VuZXJhdG9yIGZyb20gJy4vU2NyZWVuc2hvdEdlbmVyYXRvci5qcyc7XG5pbXBvcnQgc2VsZWN0U2NyZWVucyBmcm9tICcuL3NlbGVjdFNjcmVlbnMuanMnO1xuaW1wb3J0IFNpbURpc3BsYXksIHsgU2ltRGlzcGxheU9wdGlvbnMgfSBmcm9tICcuL1NpbURpc3BsYXkuanMnO1xuaW1wb3J0IFNpbUluZm8gZnJvbSAnLi9TaW1JbmZvLmpzJztcbmltcG9ydCBMZWdlbmRzT2ZMZWFybmluZ1N1cHBvcnQgZnJvbSAnLi90aGlyZFBhcnR5U3VwcG9ydC9MZWdlbmRzT2ZMZWFybmluZ1N1cHBvcnQuanMnO1xuaW1wb3J0IFRvb2xiYXIgZnJvbSAnLi90b29sYmFyL1Rvb2xiYXIuanMnO1xuaW1wb3J0IHVwZGF0ZUNoZWNrIGZyb20gJy4vdXBkYXRlQ2hlY2suanMnO1xuXG4vLyBjb25zdGFudHNcbmNvbnN0IFBST0dSRVNTX0JBUl9XSURUSCA9IDI3MztcbmNvbnN0IFNVUFBPUlRTX0dFU1RVUkVfREVTQ1JJUFRJT04gPSBwbGF0Zm9ybS5hbmRyb2lkIHx8IHBsYXRmb3JtLm1vYmlsZVNhZmFyaTtcblxuLy8gZ2xvYmFsc1xucGhldC5qb2lzdC5lbGFwc2VkVGltZSA9IDA7IC8vIGluIG1pbGxpc2Vjb25kcywgdXNlIHRoaXMgaW4gVHdlZW4uc3RhcnQgZm9yIHJlcGxpY2FibGUgcGxheWJhY2tzXG5cbi8vIFdoZW4gdGhlIHNpbXVsYXRpb24gaXMgZ29pbmcgdG8gYmUgdXNlZCB0byBwbGF5IGJhY2sgYSByZWNvcmRlZCBzZXNzaW9uLCB0aGUgc2ltdWxhdGlvbiBtdXN0IGJlIHB1dCBpbnRvIGEgc3BlY2lhbFxuLy8gbW9kZSBpbiB3aGljaCBpdCB3aWxsIG9ubHkgdXBkYXRlIHRoZSBtb2RlbCArIHZpZXcgYmFzZWQgb24gdGhlIHBsYXliYWNrIGNsb2NrIGV2ZW50cyByYXRoZXIgdGhhbiB0aGUgc3lzdGVtIGNsb2NrLlxuLy8gVGhpcyBtdXN0IGJlIHNldCBiZWZvcmUgdGhlIHNpbXVsYXRpb24gaXMgbGF1bmNoZWQgaW4gb3JkZXIgdG8gZW5zdXJlIHRoYXQgbm8gZXJyYW50IHN0ZXBTaW11bGF0aW9uIHN0ZXBzIGFyZSBjYWxsZWRcbi8vIGJlZm9yZSB0aGUgcGxheWJhY2sgZXZlbnRzIGJlZ2luLiAgVGhpcyB2YWx1ZSBpcyBvdmVycmlkZGVuIGZvciBwbGF5YmFjayBieSBQaGV0aW9FbmdpbmVJTy5cbi8vIChwaGV0LWlvKVxucGhldC5qb2lzdC5wbGF5YmFja01vZGVFbmFibGVkUHJvcGVydHkgPSBuZXcgQm9vbGVhblByb3BlcnR5KCBwaGV0LmNoaXBwZXIucXVlcnlQYXJhbWV0ZXJzLnBsYXliYWNrTW9kZSApO1xuXG5hc3NlcnQgJiYgYXNzZXJ0KCB0eXBlb2YgcGhldC5jaGlwcGVyLmJyYW5kID09PSAnc3RyaW5nJywgJ3BoZXQuY2hpcHBlci5icmFuZCBpcyByZXF1aXJlZCB0byBydW4gYSBzaW0nICk7XG5cbnR5cGUgU2VsZk9wdGlvbnMgPSB7XG5cbiAgY3JlZGl0cz86IENyZWRpdHNEYXRhO1xuXG4gIC8vIGEge05vZGV9IHBsYWNlZCBvbnRvIHRoZSBob21lIHNjcmVlbiAoaWYgYXZhaWxhYmxlKVxuICBob21lU2NyZWVuV2FybmluZ05vZGU/OiBudWxsIHwgTm9kZTtcblxuICAvLyBUaGUgUHJlZmVyZW5jZXNNb2RlbCBkZWZpbmVzIHRoZSBhdmFpbGFibGUgZmVhdHVyZXMgZm9yIHRoZSBzaW11bGF0aW9uIHRoYXQgYXJlIGNvbnRyb2xsYWJsZVxuICAvLyB0aHJvdWdoIHRoZSBQcmVmZXJlbmNlcyBEaWFsb2cuIFdpbGwgbm90IGJlIG51bGwhIFRoaXMgaXMgYSB3b3JrYXJvdW5kIHRvIHByZXZlbnQgY3JlYXRpbmcgYSBcImRlZmF1bHRcIiBQcmVmZXJlbmNlc01vZGVsXG4gIHByZWZlcmVuY2VzTW9kZWw/OiBQcmVmZXJlbmNlc01vZGVsIHwgbnVsbDtcblxuICAvLyBQYXNzZWQgdG8gU2ltRGlzcGxheSwgYnV0IGEgdG9wIGxldmVsIG9wdGlvbiBmb3IgQVBJIGVhc2UuXG4gIHdlYmdsPzogYm9vbGVhbjtcblxuICAvLyBXaGVuIGZhbHNlIChkZWZhdWx0KSwgYWxsIFNjcmVlblZpZXdzIHdpbGwgYmUgY2hpbGRyZW4gKGJ1dCBvbmx5IG9uZSB3aWxsIGJlIHZpc2libGUpLiBXaGVuIHRydWUsIG9ubHkgdGhlIHNlbGVjdGVkXG4gIC8vIFNjcmVlblZpZXcgd2lsbCBiZSBhIGNoaWxkLiBUaGlzIGlzIHVzZWZ1bCBmb3IgcGVyZm9ybWFuY2UgcmVhc29ucywgZS5nLiB3aGVuIHVzaW5nIFdlYkdMIG9yIHdpc2ggdG8gcmVkdWNlIG1lbW9yeVxuICAvLyBjb3N0cy4gU2V0dGluZyB0aGlzIHRvIHRydWUgTUFZIGluY3JlYXNlIHRoZSBhbW91bnQgb2YgdGltZSBuZWVkZWQgdG8gc3dpdGNoIHNjcmVlbnMuXG4gIC8vIFNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvZmFyYWRheXMtZWxlY3Ryb21hZ25ldGljLWxhYi9pc3N1ZXMvMTUzXG4gIGRldGFjaEluYWN0aXZlU2NyZWVuVmlld3M/OiBib29sZWFuO1xufTtcblxuZXhwb3J0IHR5cGUgU2ltT3B0aW9ucyA9IFNlbGZPcHRpb25zICYgUGlja09wdGlvbmFsPFBoZXRpb09iamVjdE9wdGlvbnMsICdwaGV0aW9EZXNpZ25lZCc+O1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBTaW0gZXh0ZW5kcyBQaGV0aW9PYmplY3Qge1xuXG4gIC8vIChqb2lzdC1pbnRlcm5hbClcbiAgcHVibGljIHJlYWRvbmx5IHNpbU5hbWVQcm9wZXJ0eTogVFJlYWRPbmx5UHJvcGVydHk8c3RyaW5nPjtcblxuICAvLyBJbmRpY2F0ZXMgc2ltIGNvbnN0cnVjdGlvbiBjb21wbGV0ZWQsIGFuZCB0aGF0IGFsbCBzY3JlZW4gbW9kZWxzIGFuZCB2aWV3cyBoYXZlIGJlZW4gY3JlYXRlZC5cbiAgLy8gVGhpcyB3YXMgYWRkZWQgZm9yIFBoRVQtaU8gYnV0IGNhbiBiZSB1c2VkIGJ5IGFueSBjbGllbnQuIFRoaXMgZG9lcyBub3QgY29pbmNpZGUgd2l0aCB0aGUgZW5kIG9mIHRoZSBTaW1cbiAgLy8gY29uc3RydWN0b3IgKGJlY2F1c2UgU2ltIGhhcyBhc3luY2hyb25vdXMgc3RlcHMgdGhhdCBmaW5pc2ggYWZ0ZXIgdGhlIGNvbnN0cnVjdG9yIGlzIGNvbXBsZXRlZClcbiAgcHJpdmF0ZSByZWFkb25seSBfaXNDb25zdHJ1Y3Rpb25Db21wbGV0ZVByb3BlcnR5ID0gbmV3IFByb3BlcnR5PGJvb2xlYW4+KCBmYWxzZSApO1xuICBwdWJsaWMgcmVhZG9ubHkgaXNDb25zdHJ1Y3Rpb25Db21wbGV0ZVByb3BlcnR5OiBUUmVhZE9ubHlQcm9wZXJ0eTxib29sZWFuPiA9IHRoaXMuX2lzQ29uc3RydWN0aW9uQ29tcGxldGVQcm9wZXJ0eTtcblxuICAvLyBTdG9yZXMgdGhlIGVmZmVjdGl2ZSB3aW5kb3cgZGltZW5zaW9ucyB0aGF0IHRoZSBzaW11bGF0aW9uIHdpbGwgYmUgdGFraW5nIHVwXG4gIHB1YmxpYyByZWFkb25seSBkaW1lbnNpb25Qcm9wZXJ0eTogVFJlYWRPbmx5UHJvcGVydHk8RGltZW5zaW9uMj47XG5cbiAgLy8gSW5kaWNhdGVzIHdoZW4gdGhlIHNpbSByZXNpemVkLiAgVGhpcyBBY3Rpb24gaXMgaW1wbGVtZW50ZWQgc28gaXQgY2FuIGJlIGF1dG9tYXRpY2FsbHkgcGxheWVkIGJhY2suXG4gIHByaXZhdGUgcmVhZG9ubHkgcmVzaXplQWN0aW9uOiBQaGV0aW9BY3Rpb248WyBudW1iZXIsIG51bWJlciBdPjtcblxuICAvLyAoam9pc3QtaW50ZXJuYWwpXG4gIHByaXZhdGUgcmVhZG9ubHkgbmF2aWdhdGlvbkJhcjogTmF2aWdhdGlvbkJhcjtcbiAgcHVibGljIHJlYWRvbmx5IGhvbWVTY3JlZW46IEhvbWVTY3JlZW4gfCBudWxsO1xuXG4gIC8vIFNpbSBzY3JlZW5zIG5vcm1hbGx5IHVwZGF0ZSBieSBpbXBsZW1lbnRpbmcgbW9kZWwuc3RlcChkdCkgb3Igdmlldy5zdGVwKGR0KS4gIFdoZW4gdGhhdCBpcyBpbXBvc3NpYmxlIG9yXG4gIC8vIHJlbGF0aXZlbHkgYXdrd2FyZCwgaXQgaXMgcG9zc2libGUgdG8gbGlzdGVuIGZvciBhIGNhbGxiYWNrIHdoZW4gYSBmcmFtZSBiZWdpbnMsIHdoZW4gYSBmcmFtZSBpcyBiZWluZyBwcm9jZXNzZWRcbiAgLy8gb3IgYWZ0ZXIgdGhlIGZyYW1lIGlzIGNvbXBsZXRlLiAgU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9qb2lzdC9pc3N1ZXMvNTM0XG5cbiAgLy8gSW5kaWNhdGVzIHdoZW4gYSBmcmFtZSBzdGFydHMuICBMaXN0ZW4gdG8gdGhpcyBFbWl0dGVyIGlmIHlvdSBoYXZlIGFuIGFjdGlvbiB0aGF0IG11c3QgYmVcbiAgLy8gcGVyZm9ybWVkIGJlZm9yZSB0aGUgc3RlcCBiZWdpbnMuXG4gIHB1YmxpYyByZWFkb25seSBmcmFtZVN0YXJ0ZWRFbWl0dGVyID0gbmV3IEVtaXR0ZXIoKTtcblxuICBwdWJsaWMgcmVhZG9ubHkgZnJhbWVFbmRlZEVtaXR0ZXIgPSBuZXcgRW1pdHRlcigge1xuICAgIHRhbmRlbTogVGFuZGVtLkdFTkVSQUxfTU9ERUwuY3JlYXRlVGFuZGVtKCAnZnJhbWVFbmRlZEVtaXR0ZXInICksXG4gICAgcGhldGlvSGlnaEZyZXF1ZW5jeTogdHJ1ZSxcbiAgICBwaGV0aW9Eb2N1bWVudGF0aW9uOiAnSW5kaWNhdGVzIHdoZW4gYSBmcmFtZSBlbmRzLiBMaXN0ZW4gdG8gdGhpcyBFbWl0dGVyIGlmIHlvdSBoYXZlIGFuIGFjdGlvbiB0aGF0IG11c3QgYmUgJyArXG4gICAgICAgICAgICAgICAgICAgICAgICAgJ3BlcmZvcm1lZCBhZnRlciB0aGUgbW9kZWwgYW5kIHZpZXcgc3RlcCBjb21wbGV0ZXMuJ1xuICB9ICk7XG5cbiAgLy8gU3RlcHMgdGhlIHNpbXVsYXRpb24uIFRoaXMgQWN0aW9uIGlzIGltcGxlbWVudGVkIHNvIGl0IGNhbiBiZSBhdXRvbWF0aWNhbGx5XG4gIC8vIHBsYXllZCBiYWNrIGZvciBQaEVULWlPIHJlY29yZC9wbGF5YmFjay4gIExpc3RlbiB0byB0aGlzIEFjdGlvbiBpZiB5b3UgaGF2ZSBhbiBhY3Rpb24gdGhhdCBoYXBwZW5zIGR1cmluZyB0aGVcbiAgLy8gc2ltdWxhdGlvbiBzdGVwLlxuICBwdWJsaWMgcmVhZG9ubHkgc3RlcFNpbXVsYXRpb25BY3Rpb246IFBoZXRpb0FjdGlvbjxbIG51bWJlciBdPjtcblxuICAvLyB0aGUgb3JkZXJlZCBsaXN0IG9mIHNpbS1zcGVjaWZpYyBzY3JlZW5zIHRoYXQgYXBwZWFyIGluIHRoaXMgcnVudGltZSBvZiB0aGUgc2ltXG4gIHB1YmxpYyByZWFkb25seSBzaW1TY3JlZW5zOiBBbnlTY3JlZW5bXTtcblxuICAvLyBhbGwgc2NyZWVucyB0aGF0IGFwcGVhciBpbiB0aGUgcnVudGltZSBvZiB0aGlzIHNpbSwgd2l0aCB0aGUgaG9tZVNjcmVlbiBmaXJzdCBpZiBpdCB3YXMgY3JlYXRlZFxuICBwdWJsaWMgcmVhZG9ubHkgc2NyZWVuczogQW55U2NyZWVuW107XG5cbiAgLy8gdGhlIGRpc3BsYXllZCBuYW1lIGluIHRoZSBzaW0uIFRoaXMgZGVwZW5kcyBvbiB3aGF0IHNjcmVlbnMgYXJlIHNob3duIHRoaXMgcnVudGltZSAoZWZmZWN0ZWQgYnkgcXVlcnkgcGFyYW1ldGVycykuXG4gIHB1YmxpYyByZWFkb25seSBkaXNwbGF5ZWRTaW1OYW1lUHJvcGVydHk6IFRSZWFkT25seVByb3BlcnR5PHN0cmluZz47XG4gIHB1YmxpYyByZWFkb25seSBzZWxlY3RlZFNjcmVlblByb3BlcnR5OiBQcm9wZXJ0eTxBbnlTY3JlZW4+O1xuXG4gIC8vIHRydWUgaWYgYWxsIHBvc3NpYmxlIHNjcmVlbnMgYXJlIHByZXNlbnQgKG9yZGVyLWluZGVwZW5kZW50KVxuICBwcml2YXRlIHJlYWRvbmx5IGFsbFNjcmVlbnNDcmVhdGVkOiBib29sZWFuO1xuXG4gIHByaXZhdGUgYXZhaWxhYmxlU2NyZWVuc1Byb3BlcnR5ITogUHJvcGVydHk8bnVtYmVyW10+O1xuICBwdWJsaWMgYWN0aXZlU2ltU2NyZWVuc1Byb3BlcnR5ITogUmVhZE9ubHlQcm9wZXJ0eTxBbnlTY3JlZW5bXT47XG5cbiAgLy8gV2hlbiB0aGUgc2ltIGlzIGFjdGl2ZSwgc2NlbmVyeSBwcm9jZXNzZXMgaW5wdXRzIGFuZCBzdGVwU2ltdWxhdGlvbihkdCkgcnVucyBmcm9tIHRoZSBzeXN0ZW0gY2xvY2suXG4gIC8vIFNldCB0byBmYWxzZSBmb3Igd2hlbiB0aGUgc2ltIHdpbGwgYmUgcGF1c2VkLlxuICBwdWJsaWMgcmVhZG9ubHkgYWN0aXZlUHJvcGVydHkgPSBuZXcgQm9vbGVhblByb3BlcnR5KCB0cnVlLCB7XG4gICAgdGFuZGVtOiBUYW5kZW0uR0VORVJBTF9NT0RFTC5jcmVhdGVUYW5kZW0oICdhY3RpdmVQcm9wZXJ0eScgKSxcbiAgICBwaGV0aW9GZWF0dXJlZDogdHJ1ZSxcbiAgICBwaGV0aW9Eb2N1bWVudGF0aW9uOiAnRGV0ZXJtaW5lcyB3aGV0aGVyIHRoZSBlbnRpcmUgc2ltdWxhdGlvbiBpcyBydW5uaW5nIGFuZCBwcm9jZXNzaW5nIHVzZXIgaW5wdXQuICcgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICdTZXR0aW5nIHRoaXMgcHJvcGVydHkgdG8gZmFsc2UgcGF1c2VzIHRoZSBzaW11bGF0aW9uLCBhbmQgcHJldmVudHMgdXNlciBpbnRlcmFjdGlvbi4nXG4gIH0gKTtcblxuICAvLyBpbmRpY2F0ZXMgd2hldGhlciB0aGUgYnJvd3NlciB0YWIgY29udGFpbmluZyB0aGUgc2ltdWxhdGlvbiBpcyBjdXJyZW50bHkgdmlzaWJsZVxuICBwdWJsaWMgcmVhZG9ubHkgYnJvd3NlclRhYlZpc2libGVQcm9wZXJ0eTogVFJlYWRPbmx5UHJvcGVydHk8Ym9vbGVhbj47XG5cbiAgLy8gKGpvaXN0LWludGVybmFsKSAtIEhvdyB0aGUgaG9tZSBzY3JlZW4gYW5kIG5hdmJhciBhcmUgc2NhbGVkLiBUaGlzIHNjYWxlIGlzIGJhc2VkIG9uIHRoZVxuICAvLyBIb21lU2NyZWVuJ3MgbGF5b3V0IGJvdW5kcyB0byBzdXBwb3J0IGEgY29uc2lzdGVudGx5IHNpemVkIG5hdiBiYXIgYW5kIG1lbnUuIElmIHRoaXMgc2NhbGUgd2FzIGJhc2VkIG9uIHRoZVxuICAvLyBsYXlvdXQgYm91bmRzIG9mIHRoZSBjdXJyZW50IHNjcmVlbiwgdGhlcmUgY291bGQgYmUgZGlmZmVyZW5jZXMgaW4gdGhlIG5hdiBiYXIgYWNyb3NzIHNjcmVlbnMuXG4gIHB1YmxpYyByZWFkb25seSBzY2FsZVByb3BlcnR5ID0gbmV3IE51bWJlclByb3BlcnR5KCAxICk7XG5cbiAgLy8gKGpvaXN0LWludGVybmFsKSBnbG9iYWwgYm91bmRzIGZvciB0aGUgZW50aXJlIHNpbXVsYXRpb24uIG51bGwgYmVmb3JlIGZpcnN0IHJlc2l6ZVxuICBwdWJsaWMgcmVhZG9ubHkgYm91bmRzUHJvcGVydHkgPSBuZXcgUHJvcGVydHk8Qm91bmRzMiB8IG51bGw+KCBudWxsICk7XG5cbiAgLy8gKGpvaXN0LWludGVybmFsKSBnbG9iYWwgYm91bmRzIGZvciB0aGUgc2NyZWVuLXNwZWNpZmljIHBhcnQgKGV4Y2x1ZGVzIHRoZSBuYXZpZ2F0aW9uIGJhciksIG51bGwgYmVmb3JlIGZpcnN0IHJlc2l6ZVxuICBwdWJsaWMgcmVhZG9ubHkgc2NyZWVuQm91bmRzUHJvcGVydHkgPSBuZXcgUHJvcGVydHk8Qm91bmRzMiB8IG51bGw+KCBudWxsICk7XG5cbiAgcHVibGljIHJlYWRvbmx5IGxvb2tBbmRGZWVsID0gbmV3IExvb2tBbmRGZWVsKCk7XG4gIHByaXZhdGUgcmVhZG9ubHkgbWVtb3J5TW9uaXRvciA9IG5ldyBNZW1vcnlNb25pdG9yKCk7XG5cbiAgLy8gcHVibGljIChyZWFkLW9ubHkpIHtib29sZWFufSAtIGlmIHRydWUsIGFkZCBzdXBwb3J0IHNwZWNpZmljIHRvIGFjY2Vzc2libGUgdGVjaG5vbG9neSB0aGF0IHdvcmsgd2l0aCB0b3VjaCBkZXZpY2VzLlxuICBwcml2YXRlIHJlYWRvbmx5IHN1cHBvcnRzR2VzdHVyZURlc2NyaXB0aW9uOiBib29sZWFuO1xuXG4gIC8vIElmIGFueSBzaW0gc2NyZWVuIGhhcyBrZXlib2FyZCBoZWxwIGNvbnRlbnQsIHRyaWdnZXIgY3JlYXRpb24gb2YgYSBrZXlib2FyZCBoZWxwIGJ1dHRvbi5cbiAgcHVibGljIHJlYWRvbmx5IGhhc0tleWJvYXJkSGVscENvbnRlbnQ6IGJvb2xlYW47XG5cbiAgLy8gKGpvaXN0LWludGVybmFsKVxuICBwdWJsaWMgcmVhZG9ubHkgdmVyc2lvbjogc3RyaW5nID0gcGFja2FnZUpTT04udmVyc2lvbjtcblxuICAvLyBudW1iZXIgb2YgYW5pbWF0aW9uIGZyYW1lcyB0aGF0IGhhdmUgb2NjdXJyZWRcbiAgcHVibGljIGZyYW1lQ291bnRlciA9IDA7XG5cbiAgLy8gV2hldGhlciB0aGUgd2luZG93IGhhcyByZXNpemVkIHNpbmNlIG91ciBsYXN0IHVwZGF0ZURpc3BsYXkoKVxuICBwcml2YXRlIHJlc2l6ZVBlbmRpbmcgPSB0cnVlO1xuXG4gIC8vIE1ha2Ugb3VyIGxvY2FsZSBhdmFpbGFibGVcbiAgcHVibGljIHJlYWRvbmx5IGxvY2FsZTogTG9jYWxlID0gcGhldC5jaGlwcGVyLmxvY2FsZSB8fCAnZW4nO1xuXG4gIC8vIGNyZWF0ZSB0aGlzIG9ubHkgYWZ0ZXIgYWxsIG90aGVyIG1lbWJlcnMgaGF2ZSBiZWVuIHNldCBvbiBTaW1cbiAgcHJpdmF0ZSByZWFkb25seSBzaW1JbmZvOiBTaW1JbmZvO1xuICBwdWJsaWMgcmVhZG9ubHkgZGlzcGxheTogU2ltRGlzcGxheTtcblxuICAvLyBUaGUgVG9vbGJhciBpcyBub3QgY3JlYXRlZCB1bmxlc3MgcmVxdWVzdGVkIHdpdGggYSBQcmVmZXJlbmNlc01vZGVsLlxuICBwcml2YXRlIHJlYWRvbmx5IHRvb2xiYXI6IFRvb2xiYXIgfCBudWxsID0gbnVsbDtcblxuICAvLyBNYW5hZ2VzIHN0YXRlIHJlbGF0ZWQgdG8gcHJlZmVyZW5jZXMuIEVuYWJsZWQgZmVhdHVyZXMgZm9yIHByZWZlcmVuY2VzIGFyZSBwcm92aWRlZCB0aHJvdWdoIHRoZVxuICAvLyBQcmVmZXJlbmNlc01vZGVsLlxuICBwdWJsaWMgcmVhZG9ubHkgcHJlZmVyZW5jZXNNb2RlbDogUHJlZmVyZW5jZXNNb2RlbDtcblxuICAvLyBsaXN0IG9mIG5vZGVzIHRoYXQgYXJlIFwibW9kYWxcIiBhbmQgaGVuY2UgYmxvY2sgaW5wdXQgd2l0aCB0aGUgYmFycmllclJlY3RhbmdsZS4gIFVzZWQgYnkgbW9kYWwgZGlhbG9nc1xuICAvLyBhbmQgdGhlIFBoZXRNZW51XG4gIHByaXZhdGUgbW9kYWxOb2RlU3RhY2sgPSBjcmVhdGVPYnNlcnZhYmxlQXJyYXk8UG9wdXBhYmxlTm9kZT4oKTtcblxuICAvLyAoam9pc3QtaW50ZXJuYWwpIFNlbWktdHJhbnNwYXJlbnQgYmxhY2sgYmFycmllciB1c2VkIHRvIGJsb2NrIGlucHV0IGV2ZW50cyB3aGVuIGEgZGlhbG9nIChvciBvdGhlciBwb3B1cClcbiAgLy8gaXMgcHJlc2VudCwgYW5kIGZhZGUgb3V0IHRoZSBiYWNrZ3JvdW5kLlxuICBwcml2YXRlIHJlYWRvbmx5IGJhcnJpZXJSZWN0YW5nbGUgPSBuZXcgQmFycmllclJlY3RhbmdsZSggdGhpcy5tb2RhbE5vZGVTdGFjayApO1xuXG4gIC8vIGxheWVyIGZvciBwb3B1cHMsIGRpYWxvZ3MsIGFuZCB0aGVpciBiYWNrZ3JvdW5kcyBhbmQgYmFycmllcnNcbiAgLy8gVE9ETzogSG93IHNob3VsZCB3ZSBoYW5kbGUgdGhlIHBvcHVwIGZvciBuYXZpZ2F0aW9uPyBDYW4gd2Ugc2V0IHRoaXMgdG8gcHJpdmF0ZT8gaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2pvaXN0L2lzc3Vlcy84NDFcbiAgcHVibGljIHJlYWRvbmx5IHRvcExheWVyID0gbmV3IE5vZGUoIHtcbiAgICBjaGlsZHJlbjogWyB0aGlzLmJhcnJpZXJSZWN0YW5nbGUgXVxuICB9ICkgYXMgVG9wTGF5ZXJOb2RlO1xuXG4gIC8vIHJvb3Qgbm9kZSBmb3IgdGhlIERpc3BsYXlcbiAgcHVibGljIHJlYWRvbmx5IHJvb3ROb2RlOiBOb2RlO1xuXG4gIC8vIEtlZXAgdHJhY2sgb2YgdGhlIHByZXZpb3VzIHRpbWUgZm9yIGNvbXB1dGluZyBkdCwgYW5kIGluaXRpYWxseSBzaWduaWZ5IHRoYXQgdGltZSBoYXNuJ3QgYmVlbiByZWNvcmRlZCB5ZXQuXG4gIHByaXZhdGUgbGFzdFN0ZXBUaW1lOiBudW1iZXIgfCBudWxsID0gbnVsbDtcbiAgcHJpdmF0ZSBsYXN0QW5pbWF0aW9uRnJhbWVUaW1lOiBudW1iZXIgfCBudWxsID0gbnVsbDtcblxuICAvLyAoam9pc3QtaW50ZXJuYWwpIEJpbmQgdGhlIGFuaW1hdGlvbiBsb29wIHNvIGl0IGNhbiBiZSBjYWxsZWQgZnJvbSByZXF1ZXN0QW5pbWF0aW9uRnJhbWUgd2l0aCB0aGUgcmlnaHQgdGhpcy5cbiAgcHJpdmF0ZSByZWFkb25seSBib3VuZFJ1bkFuaW1hdGlvbkxvb3A6ICgpID0+IHZvaWQ7XG4gIHByaXZhdGUgcmVhZG9ubHkgdXBkYXRlQmFja2dyb3VuZDogKCkgPT4gdm9pZDtcbiAgcHVibGljIHJlYWRvbmx5IGNyZWRpdHM6IENyZWRpdHNEYXRhO1xuXG4gIC8vIFN0b3JlZCBvcHRpb24gdG8gY29udHJvbCB3aGV0aGVyIHNjcmVlbiB2aWV3cyBhcmUgcmVtb3ZlZCB3aGVuIG5vdCBhY3RpdmVcbiAgcHJpdmF0ZSByZWFkb25seSBkZXRhY2hJbmFjdGl2ZVNjcmVlblZpZXdzOiBib29sZWFuO1xuXG4gIC8qKlxuICAgKiBAcGFyYW0gc2ltTmFtZVByb3BlcnR5IC0gdGhlIG5hbWUgb2YgdGhlIHNpbXVsYXRpb24sIHRvIGJlIGRpc3BsYXllZCBpbiB0aGUgbmF2YmFyIGFuZCBob21lc2NyZWVuXG4gICAqIEBwYXJhbSBhbGxTaW1TY3JlZW5zIC0gdGhlIHBvc3NpYmxlIHNjcmVlbnMgZm9yIHRoZSBzaW0gaW4gb3JkZXIgb2YgZGVjbGFyYXRpb24gKGRvZXMgbm90IGluY2x1ZGUgdGhlIGhvbWUgc2NyZWVuKVxuICAgKiBAcGFyYW0gW3Byb3ZpZGVkT3B0aW9uc10gLSBzZWUgYmVsb3cgZm9yIG9wdGlvbnNcbiAgICovXG4gIHB1YmxpYyBjb25zdHJ1Y3Rvciggc2ltTmFtZVByb3BlcnR5OiBUUmVhZE9ubHlQcm9wZXJ0eTxzdHJpbmc+LCBhbGxTaW1TY3JlZW5zOiBBbnlTY3JlZW5bXSwgcHJvdmlkZWRPcHRpb25zPzogU2ltT3B0aW9ucyApIHtcblxuICAgIHdpbmRvdy5waGV0U3BsYXNoU2NyZWVuRG93bmxvYWRDb21wbGV0ZSgpO1xuXG4gICAgLy8gSWYgYW4gYXNzZXJ0aW9uIGZhaWxzIHdoaWxlIGEgU2ltIGV4aXN0cywgYWRkIHNvbWUgaGVscGZ1bCBpbmZvcm1hdGlvbiBhYm91dCB0aGUgY29udGV4dCBvZiB0aGUgZmFpbHVyZVxuICAgIGlmICggYXNzZXJ0ICkge1xuXG4gICAgICBhc3NlcnQoIGFsbFNpbVNjcmVlbnMubGVuZ3RoID49IDEsICdhdCBsZWFzdCBvbmUgc2NyZWVuIGlzIHJlcXVpcmVkJyApO1xuXG4gICAgICB3aW5kb3cuYXNzZXJ0aW9ucy5hc3NlcnRpb25Ib29rcy5wdXNoKCAoKSA9PiB7XG4gICAgICAgIGNvbnNvbGUubG9nKCAnRGVidWcgaW5mbzonLCBKU09OLnN0cmluZ2lmeSggdGhpcy5nZXRBc3NlcnRpb25EZWJ1Z0luZm8oKSwgbnVsbCwgMiApICk7XG4gICAgICB9ICk7XG5cbiAgICAgIGFkZEFmZmlybWF0aW9uSG9vayggKCkgPT4ge1xuICAgICAgICBjb25zb2xlLmxvZyggJ0RlYnVnIGluZm86JywgSlNPTi5zdHJpbmdpZnkoIHRoaXMuZ2V0QXNzZXJ0aW9uRGVidWdJbmZvKCksIG51bGwsIDIgKSApO1xuICAgICAgfSApO1xuXG4gICAgICBpZiAoIFF1ZXJ5U3RyaW5nTWFjaGluZT8uY29udGFpbnNLZXkoICdkZWJ1Z2dlcicgKSApIHtcbiAgICAgICAgc2V0QWZmaXJtYXRpb25EZWJ1Z2dlck1vZGUoIHRydWUgKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoIHBoZXQuY2hpcHBlci5xdWVyeVBhcmFtZXRlcnMubGF1bmNoQ291bnRlciApIHtcbiAgICAgIHNpbU5hbWVQcm9wZXJ0eSA9IGxhdW5jaENvdW50ZXIoIHNpbU5hbWVQcm9wZXJ0eSApO1xuICAgIH1cblxuICAgIGNvbnN0IG9wdGlvbnMgPSBvcHRpb25pemU8U2ltT3B0aW9ucywgU2VsZk9wdGlvbnMsIFBoZXRpb09iamVjdE9wdGlvbnM+KCkoIHtcblxuICAgICAgY3JlZGl0czoge30sXG5cbiAgICAgIC8vIGEge05vZGV9IHBsYWNlZCBvbnRvIHRoZSBob21lIHNjcmVlbiAoaWYgYXZhaWxhYmxlKVxuICAgICAgaG9tZVNjcmVlbldhcm5pbmdOb2RlOiBudWxsLFxuXG4gICAgICAvLyBJZiBhIFByZWZlcmVuY2VzTW9kZWwgc3VwcG9ydHMgYW55IHByZWZlcmVuY2VzLCB0aGUgc2ltIHdpbGwgaW5jbHVkZSB0aGUgUHJlZmVyZW5jZXNEaWFsb2cgYW5kIGFcbiAgICAgIC8vIGJ1dHRvbiBpbiB0aGUgTmF2aWdhdGlvbkJhciB0byBvcGVuIGl0LiBTaW11bGF0aW9uIGNvbmRpdGlvbnMgKGxpa2Ugd2hhdCBsb2NhbGVzIGFyZSBhdmFpbGFibGUpIG1pZ2h0IGVuYWJsZVxuICAgICAgLy8gYSBQcmVmZXJlbmNlc0RpYWxvZyBieSBkZWZhdWx0LiBCdXQgUHJlZmVyZW5jZXNNb2RlbCBoYXMgbWFueSBvcHRpb25zIHlvdSBjYW4gcHJvdmlkZS5cbiAgICAgIHByZWZlcmVuY2VzTW9kZWw6IG51bGwsXG5cbiAgICAgIC8vIFBhc3NlZCB0byBTaW1EaXNwbGF5LCBidXQgYSB0b3AgbGV2ZWwgb3B0aW9uIGZvciBBUEkgZWFzZS5cbiAgICAgIHdlYmdsOiBTaW1EaXNwbGF5LkRFRkFVTFRfV0VCR0wsXG4gICAgICBkZXRhY2hJbmFjdGl2ZVNjcmVlblZpZXdzOiBmYWxzZSxcblxuICAgICAgLy8gcGhldC1pb1xuICAgICAgcGhldGlvU3RhdGU6IGZhbHNlLFxuICAgICAgcGhldGlvUmVhZE9ubHk6IHRydWUsXG4gICAgICB0YW5kZW06IFRhbmRlbS5ST09UXG4gICAgfSwgcHJvdmlkZWRPcHRpb25zICk7XG5cbiAgICBpZiAoICFvcHRpb25zLnByZWZlcmVuY2VzTW9kZWwgKSB7XG4gICAgICBvcHRpb25zLnByZWZlcmVuY2VzTW9kZWwgPSBuZXcgUHJlZmVyZW5jZXNNb2RlbCgpO1xuICAgIH1cblxuICAgIC8vIFNvbWUgb3B0aW9ucyBhcmUgdXNlZCBieSBzaW0gYW5kIFNpbURpc3BsYXkuIFByb21vdGUgd2ViZ2wgdG8gdG9wIGxldmVsIHNpbSBvcHRpb24gb3V0IG9mIEFQSSBlYXNlLCBidXQgaXQgaXNcbiAgICAvLyBwYXNzZWQgdG8gdGhlIFNpbURpc3BsYXkuXG4gICAgY29uc3Qgc2ltRGlzcGxheU9wdGlvbnM6IFNpbURpc3BsYXlPcHRpb25zID0ge1xuICAgICAgd2ViZ2w6IG9wdGlvbnMud2ViZ2wsXG4gICAgICB0YW5kZW06IFRhbmRlbS5HRU5FUkFMX1ZJRVcuY3JlYXRlVGFuZGVtKCAnZGlzcGxheScgKSxcbiAgICAgIHByZWZlcmVuY2VzTW9kZWw6IG9wdGlvbnMucHJlZmVyZW5jZXNNb2RlbFxuICAgIH07XG5cbiAgICBzdXBlciggb3B0aW9ucyApO1xuXG4gICAgdGhpcy5jcmVkaXRzID0gb3B0aW9ucy5jcmVkaXRzO1xuICAgIHRoaXMuZGV0YWNoSW5hY3RpdmVTY3JlZW5WaWV3cyA9IG9wdGlvbnMuZGV0YWNoSW5hY3RpdmVTY3JlZW5WaWV3cztcblxuICAgIHRoaXMuc2ltTmFtZVByb3BlcnR5ID0gc2ltTmFtZVByb3BlcnR5O1xuXG4gICAgLy8gcGxheWJhY2tNb2RlRW5hYmxlZFByb3BlcnR5IGNhbm5vdCBiZSBjaGFuZ2VkIGFmdGVyIFNpbSBjb25zdHJ1Y3Rpb24gaGFzIGJlZ3VuLCBoZW5jZSB0aGlzIGxpc3RlbmVyIGlzIGFkZGVkIGJlZm9yZVxuICAgIC8vIGFueXRoaW5nIGVsc2UgaXMgZG9uZSwgc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9waGV0LWlvL2lzc3Vlcy8xMTQ2XG4gICAgcGhldC5qb2lzdC5wbGF5YmFja01vZGVFbmFibGVkUHJvcGVydHkubGF6eUxpbmsoICgpID0+IHtcbiAgICAgIHRocm93IG5ldyBFcnJvciggJ3BsYXliYWNrTW9kZUVuYWJsZWRQcm9wZXJ0eSBjYW5ub3QgYmUgY2hhbmdlZCBhZnRlciBTaW0gY29uc3RydWN0aW9uIGhhcyBiZWd1bicgKTtcbiAgICB9ICk7XG5cbiAgICBhc3NlcnQgJiYgdGhpcy5pc0NvbnN0cnVjdGlvbkNvbXBsZXRlUHJvcGVydHkubGF6eUxpbmsoIGlzQ29uc3RydWN0aW9uQ29tcGxldGUgPT4ge1xuICAgICAgYXNzZXJ0ICYmIGFzc2VydCggaXNDb25zdHJ1Y3Rpb25Db21wbGV0ZSwgJ1NpbSBjb25zdHJ1Y3Rpb24gc2hvdWxkIG5ldmVyIHVuY29tcGxldGUnICk7XG4gICAgfSApO1xuXG4gICAgY29uc3QgZGltZW5zaW9uUHJvcGVydHkgPSBuZXcgUHJvcGVydHkoIG5ldyBEaW1lbnNpb24yKCAwLCAwICksIHtcbiAgICAgIHZhbHVlQ29tcGFyaXNvblN0cmF0ZWd5OiAnZXF1YWxzRnVuY3Rpb24nXG4gICAgfSApO1xuXG4gICAgLy8gTm90ZTogdGhlIHB1YmxpYyBBUEkgaXMgVFJlYWRPbmx5UHJvcGVydHlcbiAgICB0aGlzLmRpbWVuc2lvblByb3BlcnR5ID0gZGltZW5zaW9uUHJvcGVydHk7XG5cbiAgICB0aGlzLnJlc2l6ZUFjdGlvbiA9IG5ldyBQaGV0aW9BY3Rpb248WyBudW1iZXIsIG51bWJlciBdPiggKCB3aWR0aCwgaGVpZ2h0ICkgPT4ge1xuICAgICAgYXNzZXJ0ICYmIGFzc2VydCggd2lkdGggPiAwICYmIGhlaWdodCA+IDAsICdzaW0gc2hvdWxkIGhhdmUgYSBub256ZXJvIGFyZWEnICk7XG5cbiAgICAgIGRpbWVuc2lvblByb3BlcnR5LnZhbHVlID0gbmV3IERpbWVuc2lvbjIoIHdpZHRoLCBoZWlnaHQgKTtcblxuICAgICAgLy8gR3JhY2VmdWxseSBzdXBwb3J0IGJhZCBkaW1lbnNpb25zLCBzZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2pvaXN0L2lzc3Vlcy80NzJcbiAgICAgIGlmICggd2lkdGggPT09IDAgfHwgaGVpZ2h0ID09PSAwICkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBjb25zdCBzY2FsZSA9IE1hdGgubWluKCB3aWR0aCAvIEhvbWVTY3JlZW5WaWV3LkxBWU9VVF9CT1VORFMud2lkdGgsIGhlaWdodCAvIEhvbWVTY3JlZW5WaWV3LkxBWU9VVF9CT1VORFMuaGVpZ2h0ICk7XG5cbiAgICAgIC8vIDQwIHB4IGhpZ2ggb24gaVBhZCBNb2JpbGUgU2FmYXJpXG4gICAgICBjb25zdCBuYXZCYXJIZWlnaHQgPSBzY2FsZSAqIE5hdmlnYXRpb25CYXIuTkFWSUdBVElPTl9CQVJfU0laRS5oZWlnaHQ7XG4gICAgICB0aGlzLm5hdmlnYXRpb25CYXIubGF5b3V0KCBzY2FsZSwgd2lkdGgsIG5hdkJhckhlaWdodCApO1xuICAgICAgdGhpcy5uYXZpZ2F0aW9uQmFyLnkgPSBoZWlnaHQgLSBuYXZCYXJIZWlnaHQ7XG4gICAgICB0aGlzLmRpc3BsYXkuc2V0U2l6ZSggbmV3IERpbWVuc2lvbjIoIHdpZHRoLCBoZWlnaHQgKSApO1xuICAgICAgY29uc3Qgc2NyZWVuSGVpZ2h0ID0gaGVpZ2h0IC0gdGhpcy5uYXZpZ2F0aW9uQmFyLmhlaWdodDtcblxuICAgICAgaWYgKCB0aGlzLnRvb2xiYXIgKSB7XG4gICAgICAgIHRoaXMudG9vbGJhci5sYXlvdXQoIHNjYWxlLCBzY3JlZW5IZWlnaHQgKTtcbiAgICAgIH1cblxuICAgICAgLy8gVGhlIGF2YWlsYWJsZSBib3VuZHMgZm9yIHNjcmVlbnMgYW5kIHRvcCBsYXllciBjaGlsZHJlbiAtIHRob3VnaCBjdXJyZW50bHkgcHJvdmlkZWRcbiAgICAgIC8vIGZ1bGwgd2lkdGggYW5kIGhlaWdodCwgd2lsbCBzb29uIGJlIHJlZHVjZWQgd2hlbiBtZW51cyAoc3BlY2lmaWNhbGx5IHRoZSBQcmVmZXJlbmNlc1xuICAgICAgLy8gVG9vbGJhcikgdGFrZXMgdXAgc2NyZWVuIHNwYWNlLlxuICAgICAgY29uc3Qgc2NyZWVuTWluWCA9IHRoaXMudG9vbGJhciA/IHRoaXMudG9vbGJhci5nZXREaXNwbGF5ZWRXaWR0aCgpIDogMDtcbiAgICAgIGNvbnN0IGF2YWlsYWJsZVNjcmVlbkJvdW5kcyA9IG5ldyBCb3VuZHMyKCBzY3JlZW5NaW5YLCAwLCB3aWR0aCwgc2NyZWVuSGVpZ2h0ICk7XG5cbiAgICAgIC8vIExheW91dCBlYWNoIG9mIHRoZSBzY3JlZW5zXG4gICAgICBfLmVhY2goIHRoaXMuc2NyZWVucywgbSA9PiBtLnZpZXcubGF5b3V0KCBhdmFpbGFibGVTY3JlZW5Cb3VuZHMgKSApO1xuXG4gICAgICB0aGlzLnRvcExheWVyLmNoaWxkcmVuLmZvckVhY2goIGNoaWxkID0+IHtcbiAgICAgICAgY2hpbGQubGF5b3V0ICYmIGNoaWxkLmxheW91dCggYXZhaWxhYmxlU2NyZWVuQm91bmRzICk7XG4gICAgICB9ICk7XG5cbiAgICAgIC8vIEZpeGVzIHByb2JsZW1zIHdoZXJlIHRoZSBkaXYgd291bGQgYmUgd2F5IG9mZiBjZW50ZXIgb24gaU9TN1xuICAgICAgaWYgKCBwbGF0Zm9ybS5tb2JpbGVTYWZhcmkgKSB7XG4gICAgICAgIHdpbmRvdy5zY3JvbGxUbyggMCwgMCApO1xuICAgICAgfVxuXG4gICAgICAvLyB1cGRhdGUgb3VyIHNjYWxlIGFuZCBib3VuZHMgcHJvcGVydGllcyBhZnRlciBvdGhlciBjaGFuZ2VzIChzbyBsaXN0ZW5lcnMgY2FuIGJlIGZpcmVkIGFmdGVyIHNjcmVlbnMgYXJlIHJlc2l6ZWQpXG4gICAgICB0aGlzLnNjYWxlUHJvcGVydHkudmFsdWUgPSBzY2FsZTtcbiAgICAgIHRoaXMuYm91bmRzUHJvcGVydHkudmFsdWUgPSBuZXcgQm91bmRzMiggMCwgMCwgd2lkdGgsIGhlaWdodCApO1xuICAgICAgdGhpcy5zY3JlZW5Cb3VuZHNQcm9wZXJ0eS52YWx1ZSA9IGF2YWlsYWJsZVNjcmVlbkJvdW5kcy5jb3B5KCk7XG5cbiAgICAgIC8vIHNldCB0aGUgc2NhbGUgZGVzY3JpYmluZyB0aGUgdGFyZ2V0IE5vZGUsIHNpbmNlIHNjYWxlIGZyb20gd2luZG93IHJlc2l6ZSBpcyBhcHBsaWVkIHRvIGVhY2ggU2NyZWVuVmlldyxcbiAgICAgIC8vIChjaGlsZHJlbiBvZiB0aGUgUGFuWm9vbUxpc3RlbmVyIHRhcmdldE5vZGUpXG4gICAgICBhbmltYXRlZFBhblpvb21TaW5nbGV0b24ubGlzdGVuZXIuc2V0VGFyZ2V0U2NhbGUoIHNjYWxlICk7XG5cbiAgICAgIC8vIHNldCB0aGUgYm91bmRzIHdoaWNoIGFjY3VyYXRlbHkgZGVzY3JpYmUgdGhlIHBhblpvb21MaXN0ZW5lciB0YXJnZXROb2RlLCBzaW5jZSBpdCB3b3VsZCBvdGhlcndpc2UgYmVcbiAgICAgIC8vIGluYWNjdXJhdGUgd2l0aCB0aGUgdmVyeSBsYXJnZSBCYXJyaWVyUmVjdGFuZ2xlXG4gICAgICBhbmltYXRlZFBhblpvb21TaW5nbGV0b24ubGlzdGVuZXIuc2V0VGFyZ2V0Qm91bmRzKCB0aGlzLmJvdW5kc1Byb3BlcnR5LnZhbHVlICk7XG5cbiAgICAgIC8vIGNvbnN0cmFpbiB0aGUgc2ltdWxhdGlvbiBwYW4gYm91bmRzIHNvIHRoYXQgaXQgY2Fubm90IGJlIG1vdmVkIG9mZiBzY3JlZW5cbiAgICAgIGFuaW1hdGVkUGFuWm9vbVNpbmdsZXRvbi5saXN0ZW5lci5zZXRQYW5Cb3VuZHMoIHRoaXMuYm91bmRzUHJvcGVydHkudmFsdWUgKTtcblxuICAgICAgLy8gU2V0IGEgY29ycmVjdGl2ZSBzY2FsaW5nIGZvciBhbGwgSGlnaGxpZ2h0UGF0aHMsIHNvIHRoYXQgZm9jdXMgaGlnaGxpZ2h0IGxpbmUgd2lkdGhzXG4gICAgICAvLyBzY2FsZSBhbmQgbG9vayB0aGUgc2FtZSBpbiB2aWV3IGNvb3JkaW5hdGVzIGZvciBhbGwgbGF5b3V0IHNjYWxlcy5cbiAgICAgIEhpZ2hsaWdodFBhdGgubGF5b3V0U2NhbGUgPSBzY2FsZTtcbiAgICB9LCB7XG4gICAgICB0YW5kZW06IFRhbmRlbS5HRU5FUkFMX01PREVMLmNyZWF0ZVRhbmRlbSggJ3Jlc2l6ZUFjdGlvbicgKSxcbiAgICAgIHBhcmFtZXRlcnM6IFtcbiAgICAgICAgeyBuYW1lOiAnd2lkdGgnLCBwaGV0aW9UeXBlOiBOdW1iZXJJTyB9LFxuICAgICAgICB7IG5hbWU6ICdoZWlnaHQnLCBwaGV0aW9UeXBlOiBOdW1iZXJJTyB9XG4gICAgICBdLFxuICAgICAgcGhldGlvUGxheWJhY2s6IHRydWUsXG4gICAgICBwaGV0aW9FdmVudE1ldGFkYXRhOiB7XG5cbiAgICAgICAgLy8gcmVzaXplQWN0aW9uIG5lZWRzIHRvIGFsd2F5cyBiZSBwbGF5YmFja2FibGUgYmVjYXVzZSBpdCBhY3RzIGluZGVwZW5kZW50bHkgb2YgYW55IG90aGVyIHBsYXliYWNrIGV2ZW50LlxuICAgICAgICAvLyBCZWNhdXNlIG9mIGl0cyB1bmlxdWUgbmF0dXJlLCBpdCBzaG91bGQgYmUgYSBcInRvcC1sZXZlbFwiIGBwbGF5YmFjazogdHJ1ZWAgZXZlbnQgc28gdGhhdCBpdCBpcyBuZXZlciBtYXJrZWQgYXNcbiAgICAgICAgLy8gYHBsYXliYWNrOiBmYWxzZWAuIFRoZXJlIGFyZSBjYXNlcyB3aGVyZSBpdCBpcyBuZXN0ZWQgdW5kZXIgYW5vdGhlciBgcGxheWJhY2s6IHRydWVgIGV2ZW50LCBsaWtlIHdoZW4gdGhlXG4gICAgICAgIC8vIHdyYXBwZXIgbGF1bmNoZXMgdGhlIHNpbXVsYXRpb24sIHRoYXQgY2Fubm90IGJlIGF2b2lkZWQuIEZvciB0aGlzIHJlYXNvbiwgd2UgdXNlIHRoaXMgb3ZlcnJpZGUuXG4gICAgICAgIGFsd2F5c1BsYXliYWNrYWJsZU92ZXJyaWRlOiB0cnVlXG4gICAgICB9LFxuICAgICAgcGhldGlvRG9jdW1lbnRhdGlvbjogJ0V4ZWN1dGVzIHdoZW4gdGhlIHNpbSBpcyByZXNpemVkLiBWYWx1ZXMgYXJlIHRoZSBzaW0gZGltZW5zaW9ucyBpbiBDU1MgcGl4ZWxzLidcbiAgICB9ICk7XG5cbiAgICB0aGlzLnN0ZXBTaW11bGF0aW9uQWN0aW9uID0gbmV3IFBoZXRpb0FjdGlvbiggZHQgPT4ge1xuICAgICAgdGhpcy5mcmFtZVN0YXJ0ZWRFbWl0dGVyLmVtaXQoKTtcblxuICAgICAgLy8gaW5jcmVtZW50IHRoaXMgYmVmb3JlIHdlIGNhbiBoYXZlIGFuIGV4Y2VwdGlvbiB0aHJvd24sIHRvIHNlZSBpZiB3ZSBhcmUgbWlzc2luZyBmcmFtZXNcbiAgICAgIHRoaXMuZnJhbWVDb3VudGVyKys7XG5cbiAgICAgIC8vIEFwcGx5IHRpbWUgc2NhbGUgZWZmZWN0cyBoZXJlIGJlZm9yZSB1c2FnZVxuICAgICAgZHQgKj0gcGhldC5jaGlwcGVyLnF1ZXJ5UGFyYW1ldGVycy5zcGVlZDtcblxuICAgICAgaWYgKCB0aGlzLnJlc2l6ZVBlbmRpbmcgKSB7XG4gICAgICAgIHRoaXMucmVzaXplVG9XaW5kb3coKTtcbiAgICAgIH1cblxuICAgICAgLy8gSWYgdGhlIHVzZXIgaXMgb24gdGhlIGhvbWUgc2NyZWVuLCB3ZSB3b24ndCBoYXZlIGEgU2NyZWVuIHRoYXQgd2UnbGwgd2FudCB0byBzdGVwLiAgVGhpcyBtdXN0IGJlIGRvbmUgYWZ0ZXJcbiAgICAgIC8vIGZ1enogbW91c2UsIGJlY2F1c2UgZnV6emluZyBjb3VsZCBjaGFuZ2UgdGhlIHNlbGVjdGVkIHNjcmVlbiwgc2VlICMxMzBcbiAgICAgIGNvbnN0IHNjcmVlbiA9IHRoaXMuc2VsZWN0ZWRTY3JlZW5Qcm9wZXJ0eS52YWx1ZTtcblxuICAgICAgLy8gY2FwIGR0IGJhc2VkIG9uIHRoZSBjdXJyZW50IHNjcmVlbiwgc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9qb2lzdC9pc3N1ZXMvMTMwXG4gICAgICBkdCA9IE1hdGgubWluKCBkdCwgc2NyZWVuLm1heERUICk7XG5cbiAgICAgIC8vIFRPRE86IHdlIGFyZSAvMTAwMCBqdXN0IHRvICoxMDAwPyAgU2VlbXMgd2FzdGVmdWwgYW5kIGxpa2Ugb3Bwb3J0dW5pdHkgZm9yIGVycm9yLiBTZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2pvaXN0L2lzc3Vlcy8zODdcbiAgICAgIC8vIFN0b3JlIHRoZSBlbGFwc2VkIHRpbWUgaW4gbWlsbGlzZWNvbmRzIGZvciB1c2FnZSBieSBUd2VlbiBjbGllbnRzXG4gICAgICBwaGV0LmpvaXN0LmVsYXBzZWRUaW1lICs9IGR0ICogMTAwMDtcblxuICAgICAgLy8gdGltZXIgc3RlcCBiZWZvcmUgbW9kZWwvdmlldyBzdGVwcywgc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9qb2lzdC9pc3N1ZXMvNDAxXG4gICAgICAvLyBOb3RlIHRoYXQgdGhpcyBpcyB2aXRhbCB0byBzdXBwb3J0IEludGVyYWN0aXZlIERlc2NyaXB0aW9uIGFuZCB0aGUgdXR0ZXJhbmNlIHF1ZXVlLlxuICAgICAgc3RlcFRpbWVyLmVtaXQoIGR0ICk7XG5cbiAgICAgIC8vIElmIHRoZSBkdCBpcyAwLCB3ZSB3aWxsIHNraXAgdGhlIG1vZGVsIHN0ZXAgKHNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvam9pc3QvaXNzdWVzLzE3MSlcbiAgICAgIGlmICggc2NyZWVuLm1vZGVsLnN0ZXAgJiYgZHQgKSB7XG4gICAgICAgIHNjcmVlbi5tb2RlbC5zdGVwKCBkdCApO1xuICAgICAgfVxuXG4gICAgICAvLyBJZiB1c2luZyB0aGUgVFdFRU4gYW5pbWF0aW9uIGxpYnJhcnksIHRoZW4gdXBkYXRlIHR3ZWVucyBiZWZvcmUgcmVuZGVyaW5nIHRoZSBzY2VuZS5cbiAgICAgIC8vIFVwZGF0ZSB0aGUgdHdlZW5zIGFmdGVyIHRoZSBtb2RlbCBpcyB1cGRhdGVkIGJ1dCBiZWZvcmUgdGhlIHZpZXcgc3RlcC5cbiAgICAgIC8vIFNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvam9pc3QvaXNzdWVzLzQwMS5cbiAgICAgIC8vVE9ETyBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvam9pc3QvaXNzdWVzLzQwNCBydW4gVFdFRU5zIGZvciB0aGUgc2VsZWN0ZWQgc2NyZWVuIG9ubHlcbiAgICAgIGlmICggd2luZG93LlRXRUVOICkge1xuICAgICAgICB3aW5kb3cuVFdFRU4udXBkYXRlKCBwaGV0LmpvaXN0LmVsYXBzZWRUaW1lICk7XG4gICAgICB9XG5cbiAgICAgIHRoaXMuZGlzcGxheS5zdGVwKCBkdCApO1xuXG4gICAgICAvLyBWaWV3IHN0ZXAgaXMgdGhlIGxhc3QgdGhpbmcgYmVmb3JlIHVwZGF0ZURpc3BsYXkoKSwgc28gd2UgY2FuIGRvIHBhaW50IHVwZGF0ZXMgdGhlcmUuXG4gICAgICAvLyBTZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2pvaXN0L2lzc3Vlcy80MDEuXG4gICAgICBzY3JlZW4udmlldy5zdGVwKCBkdCApO1xuXG4gICAgICAvLyBEbyBub3QgdXBkYXRlIHRoZSBkaXNwbGF5IHdoaWxlIFBoRVQtaU8gaXMgY3VzdG9taXppbmcsIG9yIGl0IGNvdWxkIHNob3cgdGhlIHNpbSBiZWZvcmUgaXQgaXMgZnVsbHkgcmVhZHkgZm9yIGRpc3BsYXkuXG4gICAgICBpZiAoICEoIFRhbmRlbS5QSEVUX0lPX0VOQUJMRUQgJiYgIXBoZXQucGhldGlvLnBoZXRpb0VuZ2luZS5pc1JlYWR5Rm9yRGlzcGxheSApICkge1xuICAgICAgICB0aGlzLmRpc3BsYXkudXBkYXRlRGlzcGxheSgpO1xuICAgICAgfVxuXG4gICAgICBpZiAoIHBoZXQuY2hpcHBlci5xdWVyeVBhcmFtZXRlcnMubWVtb3J5TGltaXQgKSB7XG4gICAgICAgIHRoaXMubWVtb3J5TW9uaXRvci5tZWFzdXJlKCk7XG4gICAgICB9XG4gICAgICB0aGlzLmZyYW1lRW5kZWRFbWl0dGVyLmVtaXQoKTtcbiAgICB9LCB7XG4gICAgICB0YW5kZW06IFRhbmRlbS5HRU5FUkFMX01PREVMLmNyZWF0ZVRhbmRlbSggJ3N0ZXBTaW11bGF0aW9uQWN0aW9uJyApLFxuICAgICAgcGFyYW1ldGVyczogWyB7XG4gICAgICAgIG5hbWU6ICdkdCcsXG4gICAgICAgIHBoZXRpb1R5cGU6IE51bWJlcklPLFxuICAgICAgICBwaGV0aW9Eb2N1bWVudGF0aW9uOiAnVGhlIGFtb3VudCBvZiB0aW1lIHN0ZXBwZWQgaW4gZWFjaCBjYWxsLCBpbiBzZWNvbmRzLidcbiAgICAgIH0gXSxcbiAgICAgIHBoZXRpb0hpZ2hGcmVxdWVuY3k6IHRydWUsXG4gICAgICBwaGV0aW9QbGF5YmFjazogdHJ1ZSxcbiAgICAgIHBoZXRpb0RvY3VtZW50YXRpb246ICdBIGZ1bmN0aW9uIHRoYXQgc3RlcHMgdGltZSBmb3J3YXJkLidcbiAgICB9ICk7XG5cbiAgICBjb25zdCBzY3JlZW5zVGFuZGVtID0gVGFuZGVtLkdFTkVSQUxfTU9ERUwuY3JlYXRlVGFuZGVtKCAnc2NyZWVucycgKTtcblxuICAgIGNvbnN0IHNjcmVlbkRhdGEgPSBzZWxlY3RTY3JlZW5zKFxuICAgICAgYWxsU2ltU2NyZWVucyxcbiAgICAgIHBoZXQuY2hpcHBlci5xdWVyeVBhcmFtZXRlcnMuaG9tZVNjcmVlbixcbiAgICAgIFF1ZXJ5U3RyaW5nTWFjaGluZS5jb250YWluc0tleSggJ2hvbWVTY3JlZW4nICksXG4gICAgICBwaGV0LmNoaXBwZXIucXVlcnlQYXJhbWV0ZXJzLmluaXRpYWxTY3JlZW4sXG4gICAgICBRdWVyeVN0cmluZ01hY2hpbmUuY29udGFpbnNLZXkoICdpbml0aWFsU2NyZWVuJyApLFxuICAgICAgcGhldC5jaGlwcGVyLnF1ZXJ5UGFyYW1ldGVycy5zY3JlZW5zLFxuICAgICAgUXVlcnlTdHJpbmdNYWNoaW5lLmNvbnRhaW5zS2V5KCAnc2NyZWVucycgKSxcbiAgICAgIHNlbGVjdGVkU2ltU2NyZWVucyA9PiB7XG4gICAgICAgIGNvbnN0IHBvc3NpYmxlU2NyZWVuSW5kaWNlcyA9IHNlbGVjdGVkU2ltU2NyZWVucy5tYXAoIHNjcmVlbiA9PiB7XG4gICAgICAgICAgcmV0dXJuIGFsbFNpbVNjcmVlbnMuaW5kZXhPZiggc2NyZWVuICkgKyAxO1xuICAgICAgICB9ICk7XG4gICAgICAgIGNvbnN0IHZhbGlkVmFsdWVzID0gXy5mbGF0dGVuKCBDb21iaW5hdGlvbi5jb21iaW5hdGlvbnNPZiggcG9zc2libGVTY3JlZW5JbmRpY2VzICkubWFwKCBzdWJzZXQgPT4gUGVybXV0YXRpb24ucGVybXV0YXRpb25zT2YoIHN1YnNldCApICkgKVxuICAgICAgICAgIC5maWx0ZXIoIGFycmF5ID0+IGFycmF5Lmxlbmd0aCA+IDAgKS5zb3J0KCk7XG5cbiAgICAgICAgLy8gQ29udHJvbHMgdGhlIHN1YnNldCAoYW5kIG9yZGVyKSBvZiBzY3JlZW5zIHRoYXQgYXBwZWFyIHRvIHRoZSB1c2VyLiBTZXBhcmF0ZSBmcm9tIHRoZSA/c2NyZWVucyBxdWVyeSBwYXJhbWV0ZXJcbiAgICAgICAgLy8gZm9yIHBoZXQtaW8gcHVycG9zZXMuIFNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvam9pc3QvaXNzdWVzLzgyN1xuICAgICAgICB0aGlzLmF2YWlsYWJsZVNjcmVlbnNQcm9wZXJ0eSA9IG5ldyBQcm9wZXJ0eSggcG9zc2libGVTY3JlZW5JbmRpY2VzLCB7XG4gICAgICAgICAgdGFuZGVtOiBzY3JlZW5zVGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2F2YWlsYWJsZVNjcmVlbnNQcm9wZXJ0eScgKSxcbiAgICAgICAgICBpc1ZhbGlkVmFsdWU6IHZhbHVlID0+IF8uc29tZSggdmFsaWRWYWx1ZXMsIHZhbGlkVmFsdWUgPT4gXy5pc0VxdWFsKCB2YWx1ZSwgdmFsaWRWYWx1ZSApICksXG4gICAgICAgICAgcGhldGlvRmVhdHVyZWQ6IHRydWUsXG4gICAgICAgICAgcGhldGlvVmFsdWVUeXBlOiBBcnJheUlPKCBOdW1iZXJJTyApLFxuICAgICAgICAgIHBoZXRpb0RvY3VtZW50YXRpb246ICdDb250cm9scyB3aGljaCBzY3JlZW5zIGFyZSBhdmFpbGFibGUsIGFuZCB0aGUgb3JkZXIgdGhleSBhcmUgZGlzcGxheWVkLidcbiAgICAgICAgfSApO1xuXG4gICAgICAgIHRoaXMuYWN0aXZlU2ltU2NyZWVuc1Byb3BlcnR5ID0gbmV3IERlcml2ZWRQcm9wZXJ0eSggWyB0aGlzLmF2YWlsYWJsZVNjcmVlbnNQcm9wZXJ0eSBdLCBzY3JlZW5JbmRpY2VzID0+IHtcbiAgICAgICAgICByZXR1cm4gc2NyZWVuSW5kaWNlcy5tYXAoIGluZGV4ID0+IGFsbFNpbVNjcmVlbnNbIGluZGV4IC0gMSBdICk7XG4gICAgICAgIH0gKTtcbiAgICAgIH0sXG4gICAgICBzZWxlY3RlZFNpbVNjcmVlbnMgPT4ge1xuICAgICAgICByZXR1cm4gbmV3IEhvbWVTY3JlZW4oIHRoaXMuc2ltTmFtZVByb3BlcnR5LCAoKSA9PiB0aGlzLnNlbGVjdGVkU2NyZWVuUHJvcGVydHksIHNlbGVjdGVkU2ltU2NyZWVucywgdGhpcy5hY3RpdmVTaW1TY3JlZW5zUHJvcGVydHksIHtcbiAgICAgICAgICB0YW5kZW06IG9wdGlvbnMudGFuZGVtLmNyZWF0ZVRhbmRlbSggd2luZG93LnBoZXRpby5QaGV0aW9JRFV0aWxzLkhPTUVfU0NSRUVOX0NPTVBPTkVOVF9OQU1FICksXG4gICAgICAgICAgd2FybmluZ05vZGU6IG9wdGlvbnMuaG9tZVNjcmVlbldhcm5pbmdOb2RlXG4gICAgICAgIH0gKTtcbiAgICAgIH1cbiAgICApO1xuXG4gICAgdGhpcy5ob21lU2NyZWVuID0gc2NyZWVuRGF0YS5ob21lU2NyZWVuO1xuICAgIHRoaXMuc2ltU2NyZWVucyA9IHNjcmVlbkRhdGEuc2VsZWN0ZWRTaW1TY3JlZW5zO1xuICAgIHRoaXMuc2NyZWVucyA9IHNjcmVlbkRhdGEuc2NyZWVucztcbiAgICB0aGlzLmFsbFNjcmVlbnNDcmVhdGVkID0gc2NyZWVuRGF0YS5hbGxTY3JlZW5zQ3JlYXRlZDtcblxuICAgIHRoaXMuc2VsZWN0ZWRTY3JlZW5Qcm9wZXJ0eSA9IG5ldyBQcm9wZXJ0eTxBbnlTY3JlZW4+KCBzY3JlZW5EYXRhLmluaXRpYWxTY3JlZW4sIHtcbiAgICAgIHRhbmRlbTogc2NyZWVuc1RhbmRlbS5jcmVhdGVUYW5kZW0oICdzZWxlY3RlZFNjcmVlblByb3BlcnR5JyApLFxuICAgICAgcGhldGlvRmVhdHVyZWQ6IHRydWUsXG4gICAgICBwaGV0aW9Eb2N1bWVudGF0aW9uOiAnRGV0ZXJtaW5lcyB3aGljaCBzY3JlZW4gaXMgc2VsZWN0ZWQgaW4gdGhlIHNpbXVsYXRpb24nLFxuICAgICAgdmFsaWRWYWx1ZXM6IHRoaXMuc2NyZWVucyxcbiAgICAgIHBoZXRpb1ZhbHVlVHlwZTogU2NyZWVuLlNjcmVlbklPXG4gICAgfSApO1xuXG4gICAgLy8gSWYgdGhlIGFjdGl2ZVNpbVNjcmVlbnMgY2hhbmdlcywgd2UnbGwgd2FudCB0byB1cGRhdGUgd2hhdCB0aGUgYWN0aXZlIHNjcmVlbiAob3Igc2VsZWN0ZWQgc2NyZWVuKSBpcyBmb3Igc3BlY2lmaWNcbiAgICAvLyBjYXNlcy5cbiAgICB0aGlzLmFjdGl2ZVNpbVNjcmVlbnNQcm9wZXJ0eS5sYXp5TGluayggc2NyZWVucyA9PiB7XG4gICAgICBjb25zdCBzY3JlZW4gPSB0aGlzLnNlbGVjdGVkU2NyZWVuUHJvcGVydHkudmFsdWU7XG4gICAgICBpZiAoIHNjcmVlbiA9PT0gdGhpcy5ob21lU2NyZWVuICkge1xuICAgICAgICBpZiAoIHNjcmVlbnMubGVuZ3RoID09PSAxICkge1xuICAgICAgICAgIC8vIElmIHdlJ3JlIG9uIHRoZSBob21lIHNjcmVlbiBhbmQgaXQgc3dpdGNoZXMgdG8gYSAxLXNjcmVlbiBzaW0sIGdvIHRvIHRoYXQgc2NyZWVuXG4gICAgICAgICAgdGhpcy5zZWxlY3RlZFNjcmVlblByb3BlcnR5LnZhbHVlID0gc2NyZWVuc1sgMCBdO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKCAhc2NyZWVucy5pbmNsdWRlcyggdGhpcy5ob21lU2NyZWVuLm1vZGVsLnNlbGVjdGVkU2NyZWVuUHJvcGVydHkudmFsdWUgKSApIHtcbiAgICAgICAgICAvLyBJZiB3ZSdyZSBvbiB0aGUgaG9tZSBzY3JlZW4gYW5kIG91ciBcInNlbGVjdGVkXCIgc2NyZWVuIGRpc2FwcGVhcnMsIHNlbGVjdCB0aGUgZmlyc3Qgc2ltIHNjcmVlblxuICAgICAgICAgIHRoaXMuaG9tZVNjcmVlbi5tb2RlbC5zZWxlY3RlZFNjcmVlblByb3BlcnR5LnZhbHVlID0gc2NyZWVuc1sgMCBdO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBlbHNlIGlmICggIXNjcmVlbnMuaW5jbHVkZXMoIHNjcmVlbiApICkge1xuICAgICAgICAvLyBJZiB3ZSdyZSBvbiBhIHNjcmVlbiB0aGF0IFwiZGlzYXBwZWFyc1wiLCBnbyB0byB0aGUgZmlyc3Qgc2NyZWVuXG4gICAgICAgIHRoaXMuc2VsZWN0ZWRTY3JlZW5Qcm9wZXJ0eS52YWx1ZSA9IHNjcmVlbnNbIDAgXTtcbiAgICAgIH1cbiAgICB9ICk7XG5cbiAgICB0aGlzLmRpc3BsYXllZFNpbU5hbWVQcm9wZXJ0eSA9IERlcml2ZWRQcm9wZXJ0eS5kZXJpdmVBbnkoIFtcbiAgICAgIHRoaXMuYXZhaWxhYmxlU2NyZWVuc1Byb3BlcnR5LFxuICAgICAgdGhpcy5zaW1OYW1lUHJvcGVydHksXG4gICAgICB0aGlzLnNlbGVjdGVkU2NyZWVuUHJvcGVydHksXG4gICAgICBKb2lzdFN0cmluZ3Muc2ltVGl0bGVXaXRoU2NyZWVuTmFtZVBhdHRlcm5TdHJpbmdQcm9wZXJ0eSxcbiAgICAgIC4uLl8udW5pcSggdGhpcy5zY3JlZW5zLm1hcCggc2NyZWVuID0+IHNjcmVlbi5uYW1lUHJvcGVydHkgKSApIC8vIFRvIHN1cHBvcnQgZHVwbGljYXRlIHNjcmVlbnNcblxuICAgICAgLy8gV2UganVzdCBuZWVkIG5vdGlmaWNhdGlvbnMgb24gYW55IG9mIHRoZXNlIGNoYW5naW5nLCByZXR1cm4gYXJncyBhcyBhIHVuaXF1ZSB2YWx1ZSB0byBtYWtlIHN1cmUgbGlzdGVuZXJzIGZpcmUuXG4gICAgXSwgKCkgPT4ge1xuICAgICAgY29uc3QgYXZhaWxhYmxlU2NyZWVucyA9IHRoaXMuYXZhaWxhYmxlU2NyZWVuc1Byb3BlcnR5LnZhbHVlO1xuICAgICAgY29uc3Qgc2ltTmFtZSA9IHRoaXMuc2ltTmFtZVByb3BlcnR5LnZhbHVlO1xuICAgICAgY29uc3Qgc2VsZWN0ZWRTY3JlZW4gPSB0aGlzLnNlbGVjdGVkU2NyZWVuUHJvcGVydHkudmFsdWU7XG4gICAgICBjb25zdCB0aXRsZVdpdGhTY3JlZW5QYXR0ZXJuID0gSm9pc3RTdHJpbmdzLnNpbVRpdGxlV2l0aFNjcmVlbk5hbWVQYXR0ZXJuU3RyaW5nUHJvcGVydHkudmFsdWU7XG4gICAgICBjb25zdCBzY3JlZW5OYW1lID0gc2VsZWN0ZWRTY3JlZW4ubmFtZVByb3BlcnR5LnZhbHVlO1xuXG4gICAgICBjb25zdCBpc011bHRpU2NyZWVuU2ltRGlzcGxheWluZ1NpbmdsZVNjcmVlbiA9IGF2YWlsYWJsZVNjcmVlbnMubGVuZ3RoID09PSAxICYmIGFsbFNpbVNjcmVlbnMubGVuZ3RoID4gMTtcblxuICAgICAgLy8gdXBkYXRlIHRoZSB0aXRsZVRleHQgYmFzZWQgb24gdmFsdWVzIG9mIHRoZSBzaW0gbmFtZSBhbmQgc2NyZWVuIG5hbWVcbiAgICAgIGlmICggaXNNdWx0aVNjcmVlblNpbURpc3BsYXlpbmdTaW5nbGVTY3JlZW4gJiYgc2ltTmFtZSAmJiBzY3JlZW5OYW1lICkge1xuXG4gICAgICAgIC8vIElmIHRoZSAnc2NyZWVucycgcXVlcnkgcGFyYW1ldGVyIHNlbGVjdHMgb25seSAxIHNjcmVlbiBhbmQgYm90aCB0aGUgc2ltIGFuZCBzY3JlZW4gbmFtZSBhcmUgbm90IHRoZSBlbXB0eVxuICAgICAgICAvLyBzdHJpbmcsIHRoZW4gdXBkYXRlIHRoZSBuYXYgYmFyIHRpdGxlIHRvIGluY2x1ZGUgYSBoeXBoZW4gYW5kIHRoZSBzY3JlZW4gbmFtZSBhZnRlciB0aGUgc2ltIG5hbWUuXG4gICAgICAgIHJldHVybiBTdHJpbmdVdGlscy5maWxsSW4oIHRpdGxlV2l0aFNjcmVlblBhdHRlcm4sIHtcbiAgICAgICAgICBzaW1OYW1lOiBzaW1OYW1lLFxuICAgICAgICAgIHNjcmVlbk5hbWU6IHNjcmVlbk5hbWVcbiAgICAgICAgfSApO1xuICAgICAgfVxuICAgICAgZWxzZSBpZiAoIGlzTXVsdGlTY3JlZW5TaW1EaXNwbGF5aW5nU2luZ2xlU2NyZWVuICYmIHNjcmVlbk5hbWUgKSB7XG4gICAgICAgIHJldHVybiBzY3JlZW5OYW1lO1xuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgIHJldHVybiBzaW1OYW1lO1xuICAgICAgfVxuICAgIH0sIHtcbiAgICAgIHRhbmRlbTogVGFuZGVtLkdFTkVSQUxfTU9ERUwuY3JlYXRlVGFuZGVtKCAnZGlzcGxheWVkU2ltTmFtZVByb3BlcnR5JyApLFxuICAgICAgdGFuZGVtTmFtZVN1ZmZpeDogJ05hbWVQcm9wZXJ0eScsXG4gICAgICBwaGV0aW9Eb2N1bWVudGF0aW9uOiAnQ3VzdG9taXplIHRoaXMgc3RyaW5nIGJ5IGVkaXRpbmcgaXRzIGRlcGVuZGVuY2llcy4nLFxuICAgICAgcGhldGlvRmVhdHVyZWQ6IHRydWUsXG4gICAgICBwaGV0aW9WYWx1ZVR5cGU6IFN0cmluZ0lPXG4gICAgfSApO1xuXG4gICAgLy8gTG9jYWwgdmFyaWFibGUgaXMgc2V0dGFibGUuLi5cbiAgICBjb25zdCBicm93c2VyVGFiVmlzaWJsZVByb3BlcnR5ID0gbmV3IEJvb2xlYW5Qcm9wZXJ0eSggdHJ1ZSwge1xuICAgICAgdGFuZGVtOiBUYW5kZW0uR0VORVJBTF9NT0RFTC5jcmVhdGVUYW5kZW0oICdicm93c2VyVGFiVmlzaWJsZVByb3BlcnR5JyApLFxuICAgICAgcGhldGlvRG9jdW1lbnRhdGlvbjogJ0luZGljYXRlcyB3aGV0aGVyIHRoZSBicm93c2VyIHRhYiBjb250YWluaW5nIHRoZSBzaW11bGF0aW9uIGlzIGN1cnJlbnRseSB2aXNpYmxlJyxcbiAgICAgIHBoZXRpb1JlYWRPbmx5OiB0cnVlLFxuICAgICAgcGhldGlvRmVhdHVyZWQ6IHRydWVcbiAgICB9ICk7XG5cbiAgICAvLyAuLi4gYnV0IHRoZSBwdWJsaWMgY2xhc3MgYXR0cmlidXRlIGlzIHJlYWQtb25seVxuICAgIHRoaXMuYnJvd3NlclRhYlZpc2libGVQcm9wZXJ0eSA9IGJyb3dzZXJUYWJWaXNpYmxlUHJvcGVydHk7XG5cbiAgICAvLyBzZXQgdGhlIHN0YXRlIG9mIHRoZSBwcm9wZXJ0eSB0aGF0IGluZGljYXRlcyBpZiB0aGUgYnJvd3NlciB0YWIgaXMgdmlzaWJsZVxuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoICd2aXNpYmlsaXR5Y2hhbmdlJywgKCkgPT4ge1xuICAgICAgYnJvd3NlclRhYlZpc2libGVQcm9wZXJ0eS5zZXQoIGRvY3VtZW50LnZpc2liaWxpdHlTdGF0ZSA9PT0gJ3Zpc2libGUnICk7XG4gICAgfSwgZmFsc2UgKTtcblxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHdpbmRvdy5waGV0LmpvaXN0LmxhdW5jaENhbGxlZCwgJ1NpbSBtdXN0IGJlIGxhdW5jaGVkIHVzaW5nIHNpbUxhdW5jaGVyLCAnICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdzZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2pvaXN0L2lzc3Vlcy8xNDInICk7XG5cbiAgICB0aGlzLnN1cHBvcnRzR2VzdHVyZURlc2NyaXB0aW9uID0gcGhldC5jaGlwcGVyLnF1ZXJ5UGFyYW1ldGVycy5zdXBwb3J0c0ludGVyYWN0aXZlRGVzY3JpcHRpb24gJiYgU1VQUE9SVFNfR0VTVFVSRV9ERVNDUklQVElPTjtcbiAgICB0aGlzLmhhc0tleWJvYXJkSGVscENvbnRlbnQgPSBfLnNvbWUoIHRoaXMuc2ltU2NyZWVucywgc2ltU2NyZWVuID0+ICEhc2ltU2NyZWVuLmNyZWF0ZUtleWJvYXJkSGVscE5vZGUgKTtcblxuICAgIGFzc2VydCAmJiBhc3NlcnQoICF3aW5kb3cucGhldC5qb2lzdC5zaW0sICdPbmx5IHN1cHBvcnRzIG9uZSBzaW0gYXQgYSB0aW1lJyApO1xuICAgIHdpbmRvdy5waGV0LmpvaXN0LnNpbSA9IHRoaXM7XG5cbiAgICAvLyBjb21tZW50ZWQgb3V0IGJlY2F1c2UgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2pvaXN0L2lzc3Vlcy81NTMgaXMgZGVmZXJyZWQgZm9yIGFmdGVyIEdRSU8tb25lb25lXG4gICAgLy8gaWYgKCBQSEVUX0lPX0VOQUJMRUQgKSB7XG4gICAgLy8gICB0aGlzLmVuZ2FnZW1lbnRNZXRyaWNzID0gbmV3IEVuZ2FnZW1lbnRNZXRyaWNzKCB0aGlzICk7XG4gICAgLy8gfVxuXG4gICAgdGhpcy5wcmVmZXJlbmNlc01vZGVsID0gb3B0aW9ucy5wcmVmZXJlbmNlc01vZGVsO1xuXG4gICAgLy8gaW5pdGlhbGl6ZSBhdWRpbyBhbmQgYXVkaW8gc3ViY29tcG9uZW50c1xuICAgIGF1ZGlvTWFuYWdlci5pbml0aWFsaXplKCB0aGlzICk7XG5cbiAgICAvLyBob29rIHVwIHNvdW5kIGdlbmVyYXRpb24gZm9yIHNjcmVlbiBjaGFuZ2VzXG4gICAgaWYgKCB0aGlzLnByZWZlcmVuY2VzTW9kZWwuYXVkaW9Nb2RlbC5zdXBwb3J0c1NvdW5kICkge1xuICAgICAgc291bmRNYW5hZ2VyLmFkZFNvdW5kR2VuZXJhdG9yKFxuICAgICAgICBuZXcgU2NyZWVuU2VsZWN0aW9uU291bmRHZW5lcmF0b3IoIHRoaXMuc2VsZWN0ZWRTY3JlZW5Qcm9wZXJ0eSwgdGhpcy5ob21lU2NyZWVuLCB7IGluaXRpYWxPdXRwdXRMZXZlbDogMC41IH0gKSxcbiAgICAgICAge1xuICAgICAgICAgIGNhdGVnb3J5TmFtZTogJ3VzZXItaW50ZXJmYWNlJ1xuICAgICAgICB9XG4gICAgICApO1xuICAgIH1cblxuICAgIC8vIE1ha2UgU2NyZWVuc2hvdEdlbmVyYXRvciBhdmFpbGFibGUgZ2xvYmFsbHkgc28gaXQgY2FuIGJlIHVzZWQgaW4gcHJlbG9hZCBmaWxlcyBzdWNoIGFzIFBoRVQtaU8uXG4gICAgd2luZG93LnBoZXQuam9pc3QuU2NyZWVuc2hvdEdlbmVyYXRvciA9IFNjcmVlbnNob3RHZW5lcmF0b3I7XG5cbiAgICAvLyBJZiB0aGUgbG9jYWxlIHF1ZXJ5IHBhcmFtZXRlciB3YXMgc3BlY2lmaWVkLCB0aGVuIHdlIG1heSBiZSBydW5uaW5nIHRoZSBhbGwuaHRtbCBmaWxlLCBzbyBhZGp1c3QgdGhlIHRpdGxlLlxuICAgIC8vIFNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvY2hpcHBlci9pc3N1ZXMvNTEwXG4gICAgdGhpcy5zaW1OYW1lUHJvcGVydHkubGluayggc2ltTmFtZSA9PiB7XG4gICAgICBkb2N1bWVudC50aXRsZSA9IHNpbU5hbWU7XG4gICAgfSApO1xuXG4gICAgLy8gRm9yIG5vdyB0aGUgVG9vbGJhciBvbmx5IGluY2x1ZGVzIGNvbnRyb2xzIGZvciBWb2ljaW5nIGFuZCBpcyBvbmx5IGNvbnN0cnVjdGVkIHdoZW4gdGhhdCBmZWF0dXJlIGlzIHN1cHBvcnRlZC5cbiAgICBpZiAoIHRoaXMucHJlZmVyZW5jZXNNb2RlbC5hdWRpb01vZGVsLnN1cHBvcnRzVm9pY2luZyApIHtcbiAgICAgIHRoaXMudG9vbGJhciA9IG5ldyBUb29sYmFyKCB0aGlzLnByZWZlcmVuY2VzTW9kZWwuYXVkaW9Nb2RlbC50b29sYmFyRW5hYmxlZFByb3BlcnR5LCB0aGlzLnNlbGVjdGVkU2NyZWVuUHJvcGVydHksXG4gICAgICAgIHRoaXMubG9va0FuZEZlZWwgKTtcblxuICAgICAgLy8gd2hlbiB0aGUgVG9vbGJhciBwb3NpdGlvbnMgdXBkYXRlLCByZXNpemUgdGhlIHNpbSB0byBmaXQgaW4gdGhlIGF2YWlsYWJsZSBzcGFjZVxuICAgICAgdGhpcy50b29sYmFyLnJpZ2h0UG9zaXRpb25Qcm9wZXJ0eS5sYXp5TGluayggKCkgPT4ge1xuICAgICAgICB0aGlzLnJlc2l6ZSggdGhpcy5ib3VuZHNQcm9wZXJ0eS52YWx1ZSEud2lkdGgsIHRoaXMuYm91bmRzUHJvcGVydHkudmFsdWUhLmhlaWdodCApO1xuICAgICAgfSApO1xuICAgIH1cblxuICAgIHRoaXMuZGlzcGxheSA9IG5ldyBTaW1EaXNwbGF5KCBzaW1EaXNwbGF5T3B0aW9ucyApO1xuICAgIHRoaXMucm9vdE5vZGUgPSB0aGlzLmRpc3BsYXkucm9vdE5vZGU7XG5cbiAgICBIZWxwZXIuaW5pdGlhbGl6ZSggdGhpcywgdGhpcy5kaXNwbGF5ICk7XG5cbiAgICAvLyBSZXNldCBsYXN0IGV2ZW50IGNhcHR1cmUgdG8gcHJldmVudCBhIG1heERUIFwianVtcFwiIHdoZW4gcmVzdW1pbmcsIHNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvam9pc3QvaXNzdWVzLzk3N1xuICAgIHRoaXMuYWN0aXZlUHJvcGVydHkubGF6eUxpbmsoIGFjdGl2ZSA9PiB7XG4gICAgICBpZiAoIGFjdGl2ZSApIHtcbiAgICAgICAgdGhpcy5sYXN0U3RlcFRpbWUgPSBudWxsO1xuICAgICAgICB0aGlzLmxhc3RBbmltYXRpb25GcmFtZVRpbWUgPSBudWxsO1xuICAgICAgfVxuICAgIH0gKTtcblxuICAgIE11bHRpbGluay5tdWx0aWxpbmsoIFsgdGhpcy5hY3RpdmVQcm9wZXJ0eSwgcGhldC5qb2lzdC5wbGF5YmFja01vZGVFbmFibGVkUHJvcGVydHkgXSwgKCBhY3RpdmUsIHBsYXliYWNrTW9kZUVuYWJsZWQ6IGJvb2xlYW4gKSA9PiB7XG5cbiAgICAgIC8vIElmIGluIHBsYXliYWNrTW9kZSBpcyBlbmFibGVkLCB0aGVuIHRoZSBkaXNwbGF5IG11c3QgYmUgaW50ZXJhY3RpdmUgdG8gc3VwcG9ydCBQRE9NIGV2ZW50IGxpc3RlbmVycyBkdXJpbmdcbiAgICAgIC8vIHBsYXliYWNrICh3aGljaCBvZnRlbiBjb21lIGRpcmVjdGx5IGZyb20gc2ltIGNvZGUgYW5kIG5vdCBmcm9tIHVzZXIgaW5wdXQpLlxuICAgICAgaWYgKCBwbGF5YmFja01vZGVFbmFibGVkICkge1xuICAgICAgICB0aGlzLmRpc3BsYXkuaW50ZXJhY3RpdmUgPSB0cnVlO1xuICAgICAgICBnbG9iYWxLZXlTdGF0ZVRyYWNrZXIuZW5hYmxlZCA9IHRydWU7XG4gICAgICB9XG4gICAgICBlbHNlIHtcblxuICAgICAgICAvLyBXaGVuIHRoZSBzaW0gaXMgaW5hY3RpdmUsIG1ha2UgaXQgbm9uLWludGVyYWN0aXZlLCBzZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3NjZW5lcnkvaXNzdWVzLzQxNFxuICAgICAgICB0aGlzLmRpc3BsYXkuaW50ZXJhY3RpdmUgPSBhY3RpdmU7XG4gICAgICAgIGdsb2JhbEtleVN0YXRlVHJhY2tlci5lbmFibGVkID0gYWN0aXZlO1xuICAgICAgfVxuICAgIH0gKTtcblxuICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoIHRoaXMuZGlzcGxheS5kb21FbGVtZW50ICk7XG5cbiAgICBIZWFydGJlYXQuc3RhcnQoIHRoaXMgKTtcblxuICAgIHRoaXMubmF2aWdhdGlvbkJhciA9IG5ldyBOYXZpZ2F0aW9uQmFyKCB0aGlzLCBUYW5kZW0uR0VORVJBTF9WSUVXLmNyZWF0ZVRhbmRlbSggJ25hdmlnYXRpb25CYXInICkgKTtcblxuICAgIHRoaXMudXBkYXRlQmFja2dyb3VuZCA9ICgpID0+IHtcbiAgICAgIHRoaXMubG9va0FuZEZlZWwuYmFja2dyb3VuZENvbG9yUHJvcGVydHkudmFsdWUgPSBDb2xvci50b0NvbG9yKCB0aGlzLnNlbGVjdGVkU2NyZWVuUHJvcGVydHkudmFsdWUuYmFja2dyb3VuZENvbG9yUHJvcGVydHkudmFsdWUgKTtcbiAgICB9O1xuXG4gICAgdGhpcy5sb29rQW5kRmVlbC5iYWNrZ3JvdW5kQ29sb3JQcm9wZXJ0eS5saW5rKCBiYWNrZ3JvdW5kQ29sb3IgPT4ge1xuICAgICAgdGhpcy5kaXNwbGF5LmJhY2tncm91bmRDb2xvciA9IGJhY2tncm91bmRDb2xvcjtcbiAgICB9ICk7XG5cbiAgICB0aGlzLnNlbGVjdGVkU2NyZWVuUHJvcGVydHkubGluayggKCkgPT4gdGhpcy51cGRhdGVCYWNrZ3JvdW5kKCkgKTtcblxuICAgIC8vIFdoZW4gdGhlIHVzZXIgc3dpdGNoZXMgc2NyZWVucywgaW50ZXJydXB0IHRoZSBpbnB1dCBvbiB0aGUgcHJldmlvdXMgc2NyZWVuLlxuICAgIC8vIFNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvc2NlbmVyeS9pc3N1ZXMvMjE4XG4gICAgdGhpcy5zZWxlY3RlZFNjcmVlblByb3BlcnR5LmxhenlMaW5rKCAoIG5ld1NjcmVlbiwgb2xkU2NyZWVuICkgPT4gb2xkU2NyZWVuLnZpZXcuaW50ZXJydXB0U3VidHJlZUlucHV0KCkgKTtcblxuICAgIHRoaXMuc2ltSW5mbyA9IG5ldyBTaW1JbmZvKCB0aGlzICk7XG5cbiAgICAvLyBTZXQgdXAgUGhFVC1pTywgbXVzdCBiZSBkb25lIGFmdGVyIHBoZXQuam9pc3Quc2ltIGlzIGFzc2lnbmVkXG4gICAgVGFuZGVtLlBIRVRfSU9fRU5BQkxFRCAmJiBwaGV0LnBoZXRpby5waGV0aW9FbmdpbmUub25TaW1Db25zdHJ1Y3Rpb25TdGFydGVkKFxuICAgICAgdGhpcy5zaW1JbmZvLFxuICAgICAgdGhpcy5pc0NvbnN0cnVjdGlvbkNvbXBsZXRlUHJvcGVydHksXG4gICAgICB0aGlzLmZyYW1lRW5kZWRFbWl0dGVyLFxuICAgICAgdGhpcy5kaXNwbGF5XG4gICAgKTtcblxuICAgIGlzU2V0dGluZ1BoZXRpb1N0YXRlUHJvcGVydHkubGF6eUxpbmsoIGlzU2V0dGluZ1N0YXRlID0+IHtcbiAgICAgIGlmICggIWlzU2V0dGluZ1N0YXRlICkge1xuICAgICAgICB0aGlzLnVwZGF0ZVZpZXdzKCk7XG4gICAgICB9XG4gICAgfSApO1xuXG4gICAgdGhpcy5ib3VuZFJ1bkFuaW1hdGlvbkxvb3AgPSB0aGlzLnJ1bkFuaW1hdGlvbkxvb3AuYmluZCggdGhpcyApO1xuXG4gICAgLy8gVGhpcmQgcGFydHkgc3VwcG9ydFxuICAgIHBoZXQuY2hpcHBlci5xdWVyeVBhcmFtZXRlcnMubGVnZW5kc09mTGVhcm5pbmcgJiYgbmV3IExlZ2VuZHNPZkxlYXJuaW5nU3VwcG9ydCggdGhpcyApLnN0YXJ0KCk7XG5cbiAgICBhc3NlcnQgJiYgdGhpcy5hdWRpdFNjcmVlbk5hbWVLZXlzKCk7XG4gIH1cblxuICAvKipcbiAgICogVXBkYXRlIHRoZSB2aWV3cyBvZiB0aGUgc2ltLiBUaGlzIGlzIG1lYW50IHRvIHJ1biBhZnRlciB0aGUgc3RhdGUgaGFzIGJlZW4gc2V0IHRvIG1ha2Ugc3VyZSB0aGF0IGFsbCB2aWV3XG4gICAqIGVsZW1lbnRzIGFyZSBpbiBzeW5jIHdpdGggdGhlIG5ldywgY3VycmVudCBzdGF0ZSBvZiB0aGUgc2ltLiAoZXZlbiB3aGVuIHRoZSBzaW0gaXMgaW5hY3RpdmUsIGFzIGluIHRoZSBzdGF0ZVxuICAgKiB3cmFwcGVyKS5cbiAgICovXG4gIHByaXZhdGUgdXBkYXRlVmlld3MoKTogdm9pZCB7XG5cbiAgICAvLyBUcmlnZ2VyIGxheW91dCBjb2RlXG4gICAgdGhpcy5yZXNpemVUb1dpbmRvdygpO1xuXG4gICAgdGhpcy5zZWxlY3RlZFNjcmVlblByb3BlcnR5LnZhbHVlLnZpZXcuc3RlcCAmJiB0aGlzLnNlbGVjdGVkU2NyZWVuUHJvcGVydHkudmFsdWUudmlldy5zdGVwKCAwICk7XG5cbiAgICAvLyBDbGVhciBhbGwgVXR0ZXJhbmNlUXVldWUgb3V0cHV0cyB0aGF0IG1heSBoYXZlIGNvbGxlY3RlZCBVdHRlcmFuY2VzIHdoaWxlIHN0YXRlLXNldHRpbmcgbG9naWMgb2NjdXJyZWQuXG4gICAgLy8gVGhpcyBpcyB0cmFuc2llbnQuIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy91dHRlcmFuY2UtcXVldWUvaXNzdWVzLzIyIGFuZCBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvc2NlbmVyeS9pc3N1ZXMvMTM5N1xuICAgIHRoaXMuZGlzcGxheS5kZXNjcmlwdGlvblV0dGVyYW5jZVF1ZXVlLmNsZWFyKCk7XG4gICAgdm9pY2luZ1V0dGVyYW5jZVF1ZXVlLmNsZWFyKCk7XG5cbiAgICAvLyBVcGRhdGUgdGhlIGRpc3BsYXkgYXN5bmNocm9ub3VzbHkgc2luY2UgaXQgY2FuIHRyaWdnZXIgZXZlbnRzIG9uIHBvaW50ZXIgdmFsaWRhdGlvbiwgc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9waC1zY2FsZS9pc3N1ZXMvMjEyXG4gICAgYW5pbWF0aW9uRnJhbWVUaW1lci5ydW5Pbk5leHRUaWNrKCAoKSA9PiBwaGV0LmpvaXN0LmRpc3BsYXkudXBkYXRlRGlzcGxheSgpICk7XG4gIH1cblxuICBwcml2YXRlIGZpbmlzaEluaXQoIHNjcmVlbnM6IEFueVNjcmVlbltdICk6IHZvaWQge1xuXG4gICAgXy5lYWNoKCBzY3JlZW5zLCBzY3JlZW4gPT4ge1xuICAgICAgc2NyZWVuLnZpZXcubGF5ZXJTcGxpdCA9IHRydWU7XG4gICAgICBpZiAoICF0aGlzLmRldGFjaEluYWN0aXZlU2NyZWVuVmlld3MgKSB7XG4gICAgICAgIHRoaXMuZGlzcGxheS5zaW11bGF0aW9uUm9vdC5hZGRDaGlsZCggc2NyZWVuLnZpZXcgKTtcbiAgICAgIH1cbiAgICB9ICk7XG4gICAgdGhpcy5kaXNwbGF5LnNpbXVsYXRpb25Sb290LmFkZENoaWxkKCB0aGlzLm5hdmlnYXRpb25CYXIgKTtcblxuICAgIGlmICggdGhpcy5wcmVmZXJlbmNlc01vZGVsLmF1ZGlvTW9kZWwuc3VwcG9ydHNWb2ljaW5nICkge1xuICAgICAgYXNzZXJ0ICYmIGFzc2VydCggdGhpcy50b29sYmFyLCAndG9vbGJhciBzaG91bGQgZXhpc3QgZm9yIHZvaWNpbmcnICk7XG4gICAgICB0aGlzLmRpc3BsYXkuc2ltdWxhdGlvblJvb3QuYWRkQ2hpbGQoIHRoaXMudG9vbGJhciEgKTtcbiAgICAgIHRoaXMuZGlzcGxheS5zaW11bGF0aW9uUm9vdC5wZG9tT3JkZXIgPSBbIHRoaXMudG9vbGJhciEgXTtcblxuICAgICAgLy8gSWYgVm9pY2luZyBpcyBub3QgXCJmdWxseVwiIGVuYWJsZWQsIG9ubHkgdGhlIHRvb2xiYXIgaXMgYWJsZSB0byBwcm9kdWNlIFZvaWNpbmcgb3V0cHV0LlxuICAgICAgLy8gQWxsIG90aGVyIHNpbXVsYXRpb24gY29tcG9uZW50cyBzaG91bGQgbm90IHZvaWNlIGFueXRoaW5nLiBUaGlzIG11c3QgYmUgY2FsbGVkIG9ubHkgYWZ0ZXJcbiAgICAgIC8vIGFsbCBTY3JlZW5WaWV3cyBoYXZlIGJlZW4gY29uc3RydWN0ZWQuXG4gICAgICB2b2ljaW5nTWFuYWdlci52b2ljaW5nRnVsbHlFbmFibGVkUHJvcGVydHkubGluayggZnVsbHlFbmFibGVkID0+IHtcbiAgICAgICAgdGhpcy5zZXRTaW1Wb2ljaW5nVmlzaWJsZSggZnVsbHlFbmFibGVkICk7XG4gICAgICB9ICk7XG4gICAgfVxuXG4gICAgdGhpcy5zZWxlY3RlZFNjcmVlblByb3BlcnR5LmxpbmsoIGN1cnJlbnRTY3JlZW4gPT4ge1xuICAgICAgc2NyZWVucy5mb3JFYWNoKCBzY3JlZW4gPT4ge1xuICAgICAgICBjb25zdCB2aXNpYmxlID0gc2NyZWVuID09PSBjdXJyZW50U2NyZWVuO1xuXG4gICAgICAgIC8vIE1ha2UgdGhlIHNlbGVjdGVkIHNjcmVlbiB2aXNpYmxlIGFuZCBhY3RpdmUsIG90aGVyIHNjcmVlbnMgaW52aXNpYmxlIGFuZCBpbmFjdGl2ZS5cbiAgICAgICAgLy8gc2NyZWVuLmlzQWN0aXZlUHJvcGVydHkgc2hvdWxkIGNoYW5nZSBvbmx5IHdoaWxlIHRoZSBzY3JlZW4gaXMgaW52aXNpYmxlLCBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvam9pc3QvaXNzdWVzLzQxOFxuICAgICAgICBpZiAoIHZpc2libGUgKSB7XG4gICAgICAgICAgc2NyZWVuLmFjdGl2ZVByb3BlcnR5LnNldCggdmlzaWJsZSApO1xuXG4gICAgICAgICAgaWYgKCB0aGlzLmRldGFjaEluYWN0aXZlU2NyZWVuVmlld3MgJiYgIXRoaXMuZGlzcGxheS5zaW11bGF0aW9uUm9vdC5oYXNDaGlsZCggc2NyZWVuLnZpZXcgKSApIHtcbiAgICAgICAgICAgIHRoaXMuZGlzcGxheS5zaW11bGF0aW9uUm9vdC5pbnNlcnRDaGlsZCggMCwgc2NyZWVuLnZpZXcgKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgc2NyZWVuLnZpZXcuc2V0VmlzaWJsZSggdmlzaWJsZSApO1xuICAgICAgICBpZiAoICF2aXNpYmxlICkge1xuICAgICAgICAgIGlmICggdGhpcy5kZXRhY2hJbmFjdGl2ZVNjcmVlblZpZXdzICYmIHRoaXMuZGlzcGxheS5zaW11bGF0aW9uUm9vdC5oYXNDaGlsZCggc2NyZWVuLnZpZXcgKSApIHtcbiAgICAgICAgICAgIHRoaXMuZGlzcGxheS5zaW11bGF0aW9uUm9vdC5yZW1vdmVDaGlsZCggc2NyZWVuLnZpZXcgKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBzY3JlZW4uYWN0aXZlUHJvcGVydHkuc2V0KCB2aXNpYmxlICk7XG4gICAgICAgIH1cbiAgICAgIH0gKTtcbiAgICAgIHRoaXMudXBkYXRlQmFja2dyb3VuZCgpO1xuXG4gICAgICBpZiAoICFpc1NldHRpbmdQaGV0aW9TdGF0ZVByb3BlcnR5LnZhbHVlICkge1xuXG4gICAgICAgIC8vIFpvb20gb3V0IGFnYWluIGFmdGVyIGNoYW5naW5nIHNjcmVlbnMgc28gd2UgZG9uJ3QgcGFuIHRvIHRoZSBjZW50ZXIgb2YgdGhlIGZvY3VzZWQgU2NyZWVuVmlldyxcbiAgICAgICAgLy8gYW5kIHNvIHVzZXIgaGFzIGFuIG92ZXJ2aWV3IG9mIHRoZSBuZXcgc2NyZWVuLCBzZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2pvaXN0L2lzc3Vlcy82ODIuXG4gICAgICAgIGFuaW1hdGVkUGFuWm9vbVNpbmdsZXRvbi5saXN0ZW5lci5yZXNldFRyYW5zZm9ybSgpO1xuICAgICAgfVxuICAgIH0gKTtcblxuICAgIHRoaXMuZGlzcGxheS5zaW11bGF0aW9uUm9vdC5hZGRDaGlsZCggdGhpcy50b3BMYXllciApO1xuXG4gICAgLy8gRml0IHRvIHRoZSB3aW5kb3cgYW5kIHJlbmRlciB0aGUgaW5pdGlhbCBzY2VuZVxuICAgIC8vIENhbid0IHN5bmNocm9ub3VzbHkgZG8gdGhpcyBpbiBGaXJlZm94LCBzZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3ZlZ2FzL2lzc3Vlcy81NSBhbmRcbiAgICAvLyBodHRwczovL2J1Z3ppbGxhLm1vemlsbGEub3JnL3Nob3dfYnVnLmNnaT9pZD04NDA0MTIuXG4gICAgY29uc3QgcmVzaXplTGlzdGVuZXIgPSAoKSA9PiB7XG5cbiAgICAgIC8vIERvbid0IHJlc2l6ZSBvbiB3aW5kb3cgc2l6ZSBjaGFuZ2VzIGlmIHdlIGFyZSBwbGF5aW5nIGJhY2sgaW5wdXQgZXZlbnRzLlxuICAgICAgLy8gU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9qb2lzdC9pc3N1ZXMvMzdcbiAgICAgIGlmICggIXBoZXQuam9pc3QucGxheWJhY2tNb2RlRW5hYmxlZFByb3BlcnR5LnZhbHVlICkge1xuICAgICAgICB0aGlzLnJlc2l6ZVBlbmRpbmcgPSB0cnVlO1xuICAgICAgfVxuICAgIH07XG4gICAgJCggd2luZG93ICkucmVzaXplKCByZXNpemVMaXN0ZW5lciApO1xuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCAncmVzaXplJywgcmVzaXplTGlzdGVuZXIgKTtcbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lciggJ29yaWVudGF0aW9uY2hhbmdlJywgcmVzaXplTGlzdGVuZXIgKTtcbiAgICB3aW5kb3cudmlzdWFsVmlld3BvcnQgJiYgd2luZG93LnZpc3VhbFZpZXdwb3J0LmFkZEV2ZW50TGlzdGVuZXIoICdyZXNpemUnLCByZXNpemVMaXN0ZW5lciApO1xuICAgIHRoaXMucmVzaXplVG9XaW5kb3coKTtcblxuICAgIC8vIEtpY2sgb2ZmIGNoZWNraW5nIGZvciB1cGRhdGVzLCBpZiB0aGF0IGlzIGVuYWJsZWRcbiAgICB1cGRhdGVDaGVjay5jaGVjaygpO1xuXG4gICAgLy8gSWYgdGhlcmUgYXJlIHdhcm5pbmdzLCBzaG93IHRoZW0gaW4gYSBkaWFsb2dcbiAgICBpZiAoIFF1ZXJ5U3RyaW5nTWFjaGluZS53YXJuaW5ncy5sZW5ndGggKSB7XG4gICAgICBjb25zdCB3YXJuaW5nRGlhbG9nID0gbmV3IFF1ZXJ5UGFyYW1ldGVyc1dhcm5pbmdEaWFsb2coIFF1ZXJ5U3RyaW5nTWFjaGluZS53YXJuaW5ncywge1xuICAgICAgICBjbG9zZUJ1dHRvbkxpc3RlbmVyOiAoKSA9PiB7XG4gICAgICAgICAgd2FybmluZ0RpYWxvZy5oaWRlKCk7XG4gICAgICAgICAgd2FybmluZ0RpYWxvZy5kaXNwb3NlKCk7XG4gICAgICAgIH1cbiAgICAgIH0gKTtcbiAgICAgIHdhcm5pbmdEaWFsb2cuc2hvdygpO1xuICAgIH1cbiAgfVxuXG4gIC8qXG4gICAqIEFkZHMgYSBwb3B1cCBpbiB0aGUgZ2xvYmFsIGNvb3JkaW5hdGUgZnJhbWUuIElmIHRoZSBwb3B1cCBpcyBtb2RlbCwgaXQgZGlzcGxheXMgYSBzZW1pLXRyYW5zcGFyZW50IGJsYWNrIGlucHV0XG4gICAqIGJhcnJpZXIgYmVoaW5kIGl0LiBBIG1vZGFsIHBvcHVwIHByZXZlbnQgdGhlIHVzZXIgZnJvbSBpbnRlcmFjdGluZyB3aXRoIHRoZSByZXNldCBvZiB0aGUgYXBwbGljYXRpb24gdW50aWwgdGhlXG4gICAqIHBvcHVwIGlzIGhpZGRlbi4gVXNlIGhpZGVQb3B1cCgpIHRvIGhpZGUgdGhlIHBvcHVwLlxuICAgKiBAcGFyYW0gcG9wdXAgLSB0aGUgcG9wdXAsIG11c3QgaW1wbGVtZW50ZWQgbm9kZS5oaWRlKCksIGNhbGxlZCBieSBoaWRlUG9wdXBcbiAgICogQHBhcmFtIGlzTW9kYWwgLSB3aGV0aGVyIHBvcHVwIGlzIG1vZGFsXG4gICAqL1xuICBwdWJsaWMgc2hvd1BvcHVwKCBwb3B1cDogUG9wdXBhYmxlTm9kZSwgaXNNb2RhbDogYm9vbGVhbiApOiB2b2lkIHtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBwb3B1cCApO1xuICAgIGFzc2VydCAmJiBhc3NlcnQoICEhcG9wdXAuaGlkZSwgJ01pc3NpbmcgcG9wdXAuaGlkZSgpIGZvciBzaG93UG9wdXAnICk7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggIXRoaXMudG9wTGF5ZXIuaGFzQ2hpbGQoIHBvcHVwICksICdwb3B1cCBhbHJlYWR5IHNob3duJyApO1xuICAgIGlmICggaXNNb2RhbCApIHtcbiAgICAgIHRoaXMucm9vdE5vZGUuaW50ZXJydXB0U3VidHJlZUlucHV0KCk7XG4gICAgICB0aGlzLm1vZGFsTm9kZVN0YWNrLnB1c2goIHBvcHVwICk7XG5cbiAgICAgIC8vIHBkb20gLSBtb2RhbCBkaWFsb2dzIHNob3VsZCBiZSB0aGUgb25seSByZWFkYWJsZSBjb250ZW50IGluIHRoZSBzaW1cbiAgICAgIHRoaXMuc2V0UERPTVZpZXdzVmlzaWJsZSggZmFsc2UgKTtcblxuICAgICAgLy8gdm9pY2luZyAtIHJlc3BvbnNlcyBmcm9tIE5vZGVzIGhpZGRlbiBieSB0aGUgbW9kYWwgZGlhbG9nIHNob3VsZCBub3Qgdm9pY2UuXG4gICAgICB0aGlzLnNldE5vbk1vZGFsVm9pY2luZ1Zpc2libGUoIGZhbHNlICk7XG4gICAgfVxuICAgIGlmICggcG9wdXAubGF5b3V0ICkge1xuICAgICAgcG9wdXAubGF5b3V0KCB0aGlzLnNjcmVlbkJvdW5kc1Byb3BlcnR5LnZhbHVlISApO1xuICAgIH1cbiAgICB0aGlzLnRvcExheWVyLmFkZENoaWxkKCBwb3B1cCApO1xuICB9XG5cbiAgLypcbiAgICogSGlkZXMgYSBwb3B1cCB0aGF0IHdhcyBwcmV2aW91c2x5IGRpc3BsYXllZCB3aXRoIHNob3dQb3B1cCgpXG4gICAqIEBwYXJhbSBwb3B1cFxuICAgKiBAcGFyYW0gaXNNb2RhbCAtIHdoZXRoZXIgcG9wdXAgaXMgbW9kYWxcbiAgICovXG4gIHB1YmxpYyBoaWRlUG9wdXAoIHBvcHVwOiBQb3B1cGFibGVOb2RlLCBpc01vZGFsOiBib29sZWFuICk6IHZvaWQge1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIHBvcHVwICYmIHRoaXMubW9kYWxOb2RlU3RhY2suaW5jbHVkZXMoIHBvcHVwICkgKTtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0aGlzLnRvcExheWVyLmhhc0NoaWxkKCBwb3B1cCApLCAncG9wdXAgd2FzIG5vdCBzaG93bicgKTtcbiAgICBpZiAoIGlzTW9kYWwgKSB7XG4gICAgICB0aGlzLm1vZGFsTm9kZVN0YWNrLnJlbW92ZSggcG9wdXAgKTtcbiAgICAgIGlmICggdGhpcy5tb2RhbE5vZGVTdGFjay5sZW5ndGggPT09IDAgKSB7XG5cbiAgICAgICAgLy8gQWZ0ZXIgaGlkaW5nIGFsbCBwb3B1cHMsIFZvaWNpbmcgYmVjb21lcyBlbmFibGVkIGZvciBjb21wb25lbnRzIGluIHRoZSBzaW11bGF0aW9uIHdpbmRvdyBvbmx5IGlmXG4gICAgICAgIC8vIFwiU2ltIFZvaWNpbmdcIiBzd2l0Y2ggaXMgb24uXG4gICAgICAgIHRoaXMuc2V0Tm9uTW9kYWxWb2ljaW5nVmlzaWJsZSggdm9pY2luZ01hbmFnZXIudm9pY2luZ0Z1bGx5RW5hYmxlZFByb3BlcnR5LnZhbHVlICk7XG5cbiAgICAgICAgLy8gcGRvbSAtIHdoZW4gdGhlIGRpYWxvZyBpcyBoaWRkZW4sIG1ha2UgYWxsIFNjcmVlblZpZXcgY29udGVudCB2aXNpYmxlIHRvIGFzc2lzdGl2ZSB0ZWNobm9sb2d5XG4gICAgICAgIHRoaXMuc2V0UERPTVZpZXdzVmlzaWJsZSggdHJ1ZSApO1xuICAgICAgfVxuICAgIH1cbiAgICB0aGlzLnRvcExheWVyLnJlbW92ZUNoaWxkKCBwb3B1cCApO1xuICB9XG5cbiAgcHJpdmF0ZSByZXNpemVUb1dpbmRvdygpOiB2b2lkIHtcbiAgICB0aGlzLnJlc2l6ZVBlbmRpbmcgPSBmYWxzZTtcbiAgICB0aGlzLnJlc2l6ZSggd2luZG93LmlubmVyV2lkdGgsIHdpbmRvdy5pbm5lckhlaWdodCApOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIHBoZXQvYmFkLXNpbS10ZXh0XG4gIH1cblxuICBwcml2YXRlIHJlc2l6ZSggd2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXIgKTogdm9pZCB7XG4gICAgdGhpcy5yZXNpemVBY3Rpb24uZXhlY3V0ZSggd2lkdGgsIGhlaWdodCApO1xuICB9XG5cbiAgcHVibGljIHN0YXJ0KCk6IHZvaWQge1xuXG4gICAgLy8gSW4gb3JkZXIgdG8gYW5pbWF0ZSB0aGUgbG9hZGluZyBwcm9ncmVzcyBiYXIsIHdlIG11c3Qgc2NoZWR1bGUgd29yayB3aXRoIHNldFRpbWVvdXRcbiAgICAvLyBUaGlzIGFycmF5IG9mIHtmdW5jdGlvbn0gaXMgdGhlIHdvcmsgdGhhdCBtdXN0IGJlIGNvbXBsZXRlZCB0byBsYXVuY2ggdGhlIHNpbS5cbiAgICBjb25zdCB3b3JrSXRlbXM6IEFycmF5PCgpID0+IHZvaWQ+ID0gW107XG5cbiAgICAvLyBTY2hlZHVsZSBpbnN0YW50aWF0aW9uIG9mIHRoZSBzY3JlZW5zXG4gICAgdGhpcy5zY3JlZW5zLmZvckVhY2goIHNjcmVlbiA9PiB7XG4gICAgICB3b3JrSXRlbXMucHVzaCggKCkgPT4ge1xuXG4gICAgICAgIC8vIFNjcmVlbnMgbWF5IHNoYXJlIHRoZSBzYW1lIGluc3RhbmNlIG9mIGJhY2tncm91bmRQcm9wZXJ0eSwgc2VlIGpvaXN0IzQ0MVxuICAgICAgICBpZiAoICFzY3JlZW4uYmFja2dyb3VuZENvbG9yUHJvcGVydHkuaGFzTGlzdGVuZXIoIHRoaXMudXBkYXRlQmFja2dyb3VuZCApICkge1xuICAgICAgICAgIHNjcmVlbi5iYWNrZ3JvdW5kQ29sb3JQcm9wZXJ0eS5saW5rKCB0aGlzLnVwZGF0ZUJhY2tncm91bmQgKTtcbiAgICAgICAgfVxuICAgICAgICBzY3JlZW4uaW5pdGlhbGl6ZU1vZGVsKCk7XG4gICAgICB9ICk7XG4gICAgICB3b3JrSXRlbXMucHVzaCggKCkgPT4ge1xuICAgICAgICBzY3JlZW4uaW5pdGlhbGl6ZVZpZXcoIHRoaXMuc2ltTmFtZVByb3BlcnR5LCB0aGlzLmRpc3BsYXllZFNpbU5hbWVQcm9wZXJ0eSwgdGhpcy5zY3JlZW5zLmxlbmd0aCwgdGhpcy5ob21lU2NyZWVuID09PSBzY3JlZW4gKTtcbiAgICAgIH0gKTtcbiAgICB9ICk7XG5cbiAgICAvLyBsb29wIHRvIHJ1biBzdGFydHVwIGl0ZW1zIGFzeW5jaHJvbm91c2x5IHNvIHRoZSBET00gY2FuIGJlIHVwZGF0ZWQgdG8gc2hvdyBhbmltYXRpb24gb24gdGhlIHByb2dyZXNzIGJhclxuICAgIGNvbnN0IHJ1bkl0ZW0gPSAoIGk6IG51bWJlciApID0+IHtcbiAgICAgIHNldFRpbWVvdXQoIC8vIGVzbGludC1kaXNhYmxlLWxpbmUgcGhldC9iYWQtc2ltLXRleHRcbiAgICAgICAgKCkgPT4ge1xuICAgICAgICAgIHdvcmtJdGVtc1sgaSBdKCk7XG5cbiAgICAgICAgICAvLyBNb3ZlIHRoZSBwcm9ncmVzcyBhaGVhZCBieSBvbmUgc28gd2Ugc2hvdyB0aGUgZnVsbCBwcm9ncmVzcyBiYXIgZm9yIGEgbW9tZW50IGJlZm9yZSB0aGUgc2ltIHN0YXJ0cyB1cFxuXG4gICAgICAgICAgY29uc3QgcHJvZ3Jlc3MgPSBEb3RVdGlscy5saW5lYXIoIDAsIHdvcmtJdGVtcy5sZW5ndGggLSAxLCAwLjI1LCAxLjAsIGkgKTtcblxuICAgICAgICAgIC8vIFN1cHBvcnQgaU9TIFJlYWRpbmcgTW9kZSwgd2hpY2ggc2F2ZXMgYSBET00gc25hcHNob3QgYWZ0ZXIgdGhlIHByb2dyZXNzQmFyRm9yZWdyb3VuZCBoYXMgYWxyZWFkeSBiZWVuXG4gICAgICAgICAgLy8gcmVtb3ZlZCBmcm9tIHRoZSBkb2N1bWVudCwgc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9qb2lzdC9pc3N1ZXMvMzg5XG4gICAgICAgICAgaWYgKCBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCggJ3Byb2dyZXNzQmFyRm9yZWdyb3VuZCcgKSApIHtcblxuICAgICAgICAgICAgLy8gR3JvdyB0aGUgcHJvZ3Jlc3MgYmFyIGZvcmVncm91bmQgdG8gdGhlIHJpZ2h0IGJhc2VkIG9uIHRoZSBwcm9ncmVzcyBzbyBmYXIuXG4gICAgICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCggJ3Byb2dyZXNzQmFyRm9yZWdyb3VuZCcgKSEuc2V0QXR0cmlidXRlKCAnd2lkdGgnLCBgJHtwcm9ncmVzcyAqIFBST0dSRVNTX0JBUl9XSURUSH1gICk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmICggaSArIDEgPCB3b3JrSXRlbXMubGVuZ3RoICkge1xuICAgICAgICAgICAgcnVuSXRlbSggaSArIDEgKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBzZXRUaW1lb3V0KCAoKSA9PiB7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgcGhldC9iYWQtc2ltLXRleHRcbiAgICAgICAgICAgICAgdGhpcy5maW5pc2hJbml0KCB0aGlzLnNjcmVlbnMgKTtcblxuICAgICAgICAgICAgICAvLyBNYWtlIHN1cmUgcmVxdWVzdEFuaW1hdGlvbkZyYW1lIGlzIGRlZmluZWRcbiAgICAgICAgICAgICAgVXRpbHMucG9seWZpbGxSZXF1ZXN0QW5pbWF0aW9uRnJhbWUoKTtcblxuICAgICAgICAgICAgICAvLyBPcHRpb24gZm9yIHByb2ZpbGluZ1xuICAgICAgICAgICAgICAvLyBpZiB0cnVlLCBwcmludHMgc2NyZWVuIGluaXRpYWxpemF0aW9uIHRpbWUgKHRvdGFsLCBtb2RlbCwgdmlldykgdG8gdGhlIGNvbnNvbGUgYW5kIGRpc3BsYXlzXG4gICAgICAgICAgICAgIC8vIHByb2ZpbGluZyBpbmZvcm1hdGlvbiBvbiB0aGUgc2NyZWVuXG4gICAgICAgICAgICAgIGlmICggcGhldC5jaGlwcGVyLnF1ZXJ5UGFyYW1ldGVycy5wcm9maWxlciApIHtcbiAgICAgICAgICAgICAgICBQcm9maWxlci5zdGFydCggdGhpcyApO1xuICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgLy8gTm90aWZ5IGxpc3RlbmVycyB0aGF0IGFsbCBtb2RlbHMgYW5kIHZpZXdzIGhhdmUgYmVlbiBjb25zdHJ1Y3RlZCwgYW5kIHRoZSBTaW0gaXMgcmVhZHkgdG8gYmUgc2hvd24uXG4gICAgICAgICAgICAgIC8vIFVzZWQgYnkgUGhFVC1pTy4gVGhpcyBkb2VzIG5vdCBjb2luY2lkZSB3aXRoIHRoZSBlbmQgb2YgdGhlIFNpbSBjb25zdHJ1Y3RvciAoYmVjYXVzZSBTaW0gaGFzXG4gICAgICAgICAgICAgIC8vIGFzeW5jaHJvbm91cyBzdGVwcyB0aGF0IGZpbmlzaCBhZnRlciB0aGUgY29uc3RydWN0b3IgaXMgY29tcGxldGVkIClcbiAgICAgICAgICAgICAgdGhpcy5faXNDb25zdHJ1Y3Rpb25Db21wbGV0ZVByb3BlcnR5LnZhbHVlID0gdHJ1ZTtcblxuICAgICAgICAgICAgICAvLyBwbGFjZSB0aGUgcmVxdWVzdEFuaW1hdGlvbkZyYW1lICpiZWZvcmUqIHJlbmRlcmluZyB0byBhc3N1cmUgYXMgY2xvc2UgdG8gNjBmcHMgd2l0aCB0aGUgc2V0VGltZW91dCBmYWxsYmFjay5cbiAgICAgICAgICAgICAgLy8gaHR0cDovL3BhdWxpcmlzaC5jb20vMjAxMS9yZXF1ZXN0YW5pbWF0aW9uZnJhbWUtZm9yLXNtYXJ0LWFuaW1hdGluZy9cbiAgICAgICAgICAgICAgLy8gTGF1bmNoIHRoZSBib3VuZCB2ZXJzaW9uIHNvIGl0IGNhbiBlYXNpbHkgYmUgc3dhcHBlZCBvdXQgZm9yIGRlYnVnZ2luZy5cbiAgICAgICAgICAgICAgLy8gU2NoZWR1bGVzIGFuaW1hdGlvbiB1cGRhdGVzIGFuZCBydW5zIHRoZSBmaXJzdCBzdGVwKClcbiAgICAgICAgICAgICAgdGhpcy5ib3VuZFJ1bkFuaW1hdGlvbkxvb3AoKTtcblxuICAgICAgICAgICAgICAvLyBJZiB0aGUgc2ltIGlzIGluIHBsYXliYWNrIG1vZGUsIHRoZW4gZmx1c2ggdGhlIHRpbWVyJ3MgbGlzdGVuZXJzLiBUaGlzIG1ha2VzIHN1cmUgdGhhdCBhbnl0aGluZyBraWNrZWRcbiAgICAgICAgICAgICAgLy8gdG8gdGhlIG5leHQgZnJhbWUgd2l0aCBgdGltZXIucnVuT25OZXh0VGlja2AgZHVyaW5nIHN0YXJ0dXAgKGxpa2UgZXZlcnkgbm90aWZpY2F0aW9uIGFib3V0IGEgUGhFVC1pT1xuICAgICAgICAgICAgICAvLyBpbnN0cnVtZW50ZWQgZWxlbWVudCBpbiBwaGV0aW9FbmdpbmUucGhldGlvT2JqZWN0QWRkZWQoKSkgY2FuIGNsZWFyIG91dCBiZWZvcmUgYmVnaW5uaW5nIHBsYXliYWNrLlxuICAgICAgICAgICAgICBpZiAoIHBoZXQuam9pc3QucGxheWJhY2tNb2RlRW5hYmxlZFByb3BlcnR5LnZhbHVlICkge1xuICAgICAgICAgICAgICAgIGxldCBiZWZvcmVDb3VudHMgPSBudWxsO1xuICAgICAgICAgICAgICAgIGlmICggYXNzZXJ0ICkge1xuICAgICAgICAgICAgICAgICAgYmVmb3JlQ291bnRzID0gQXJyYXkuZnJvbSggUmFuZG9tLmFsbFJhbmRvbUluc3RhbmNlcyApLm1hcCggbiA9PiBuLm51bWJlck9mQ2FsbHMgKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBzdGVwVGltZXIuZW1pdCggMCApO1xuXG4gICAgICAgICAgICAgICAgaWYgKCBhc3NlcnQgKSB7XG4gICAgICAgICAgICAgICAgICBjb25zdCBhZnRlckNvdW50cyA9IEFycmF5LmZyb20oIFJhbmRvbS5hbGxSYW5kb21JbnN0YW5jZXMgKS5tYXAoIG4gPT4gbi5udW1iZXJPZkNhbGxzICk7XG4gICAgICAgICAgICAgICAgICBhc3NlcnQgJiYgYXNzZXJ0KCBfLmlzRXF1YWwoIGJlZm9yZUNvdW50cywgYWZ0ZXJDb3VudHMgKSxcbiAgICAgICAgICAgICAgICAgICAgYFJhbmRvbSB3YXMgY2FsbGVkIG1vcmUgdGltZXMgaW4gdGhlIHBsYXliYWNrIHNpbSBvbiBzdGFydHVwLCBiZWZvcmU6ICR7YmVmb3JlQ291bnRzfSwgYWZ0ZXI6ICR7YWZ0ZXJDb3VudHN9YCApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgIC8vIEFmdGVyIHRoZSBhcHBsaWNhdGlvbiBpcyByZWFkeSB0byBnbywgcmVtb3ZlIHRoZSBzcGxhc2ggc2NyZWVuIGFuZCBwcm9ncmVzcyBiYXIuICBOb3RlIHRoZSBzcGxhc2hcbiAgICAgICAgICAgICAgLy8gc2NyZWVuIGlzIHJlbW92ZWQgYWZ0ZXIgb25lIHN0ZXAoKSwgc28gdGhlIHJlbmRlcmluZyBpcyByZWFkeSB0byBnbyB3aGVuIHRoZSBwcm9ncmVzcyBiYXIgaXMgaGlkZGVuLlxuICAgICAgICAgICAgICAvLyBuby1vcCBvdGhlcndpc2UgYW5kIHdpbGwgYmUgZGlzcG9zZWQgYnkgcGhldGlvRW5naW5lLlxuICAgICAgICAgICAgICBpZiAoICFUYW5kZW0uUEhFVF9JT19FTkFCTEVEIHx8IHBoZXQucHJlbG9hZHMucGhldGlvLnF1ZXJ5UGFyYW1ldGVycy5waGV0aW9TdGFuZGFsb25lICkge1xuICAgICAgICAgICAgICAgIHdpbmRvdy5waGV0U3BsYXNoU2NyZWVuLmRpc3Bvc2UoKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAvLyBTYW5pdHkgY2hlY2sgdGhhdCB0aGVyZSBpcyBubyBwaGV0aW8gb2JqZWN0IGluIHBoZXQgYnJhbmQsIHNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvcGhldC1pby9pc3N1ZXMvMTIyOVxuICAgICAgICAgICAgICBwaGV0LmNoaXBwZXIuYnJhbmQgPT09ICdwaGV0JyAmJiBhc3NlcnQgJiYgYXNzZXJ0KCAhVGFuZGVtLlBIRVRfSU9fRU5BQkxFRCwgJ3dpbmRvdy5waGV0LnByZWxvYWRzLnBoZXRpbyBzaG91bGQgbm90IGV4aXN0IGZvciBwaGV0IGJyYW5kJyApO1xuXG4gICAgICAgICAgICAgIC8vIENvbW11bmljYXRlIHNpbSBsb2FkIChzdWNjZXNzZnVsbHkpIHRvIENUIG9yIG90aGVyIGxpc3RlbmluZyBwYXJlbnQgZnJhbWVzXG4gICAgICAgICAgICAgIGlmICggcGhldC5jaGlwcGVyLnF1ZXJ5UGFyYW1ldGVycy5jb250aW51b3VzVGVzdCApIHtcbiAgICAgICAgICAgICAgICBwaGV0LmNoaXBwZXIucmVwb3J0Q29udGludW91c1Rlc3RSZXN1bHQoIHtcbiAgICAgICAgICAgICAgICAgIHR5cGU6ICdjb250aW51b3VzLXRlc3QtbG9hZCdcbiAgICAgICAgICAgICAgICB9ICk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgaWYgKCBwaGV0LmNoaXBwZXIucXVlcnlQYXJhbWV0ZXJzLnBvc3RNZXNzYWdlT25Mb2FkICkge1xuICAgICAgICAgICAgICAgIHdpbmRvdy5wYXJlbnQgJiYgd2luZG93LnBhcmVudC5wb3N0TWVzc2FnZSggSlNPTi5zdHJpbmdpZnkoIHtcbiAgICAgICAgICAgICAgICAgIHR5cGU6ICdsb2FkJyxcbiAgICAgICAgICAgICAgICAgIHVybDogd2luZG93LmxvY2F0aW9uLmhyZWZcbiAgICAgICAgICAgICAgICB9ICksICcqJyApO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LCAyNSApOyAvLyBwYXVzZSBmb3IgYSBmZXcgbWlsbGlzZWNvbmRzIHdpdGggdGhlIHByb2dyZXNzIGJhciBmaWxsZWQgaW4gYmVmb3JlIGdvaW5nIHRvIHRoZSBob21lIHNjcmVlblxuICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICAvLyBUaGUgZm9sbG93aW5nIHNldHMgdGhlIGFtb3VudCBvZiBkZWxheSBiZXR3ZWVuIGVhY2ggd29yayBpdGVtIHRvIG1ha2UgaXQgZWFzaWVyIHRvIHNlZSB0aGUgY2hhbmdlcyB0byB0aGVcbiAgICAgICAgLy8gcHJvZ3Jlc3MgYmFyLiAgQSB0b3RhbCB2YWx1ZSBpcyBkaXZpZGVkIGJ5IHRoZSBudW1iZXIgb2Ygd29yayBpdGVtcy4gIFRoaXMgbWFrZXMgaXQgcG9zc2libGUgdG8gc2VlIHRoZVxuICAgICAgICAvLyBwcm9ncmVzcyBiYXIgd2hlbiBmZXcgd29yayBpdGVtcyBleGlzdCwgc3VjaCBhcyBmb3IgYSBzaW5nbGUgc2NyZWVuIHNpbSwgYnV0IGFsbG93cyB0aGluZ3MgdG8gbW92ZVxuICAgICAgICAvLyByZWFzb25hYmx5IHF1aWNrbHkgd2hlbiBtb3JlIHdvcmsgaXRlbXMgZXhpc3QsIHN1Y2ggYXMgZm9yIGEgZm91ci1zY3JlZW4gc2ltLlxuICAgICAgICAzMCAvIHdvcmtJdGVtcy5sZW5ndGhcbiAgICAgICk7XG4gICAgfTtcbiAgICBydW5JdGVtKCAwICk7XG4gIH1cblxuICAvLyBCb3VuZCB0byB0aGlzLmJvdW5kUnVuQW5pbWF0aW9uTG9vcCBzbyBpdCBjYW4gYmUgcnVuIGluIHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWVcbiAgcHJpdmF0ZSBydW5BbmltYXRpb25Mb29wKCk6IHZvaWQge1xuICAgIHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUoIHRoaXMuYm91bmRSdW5BbmltYXRpb25Mb29wICk7XG5cbiAgICAvLyBPbmx5IHJ1biBhbmltYXRpb24gZnJhbWVzIGZvciBhbiBhY3RpdmUgc2ltLiBJZiBpbiBwbGF5YmFja01vZGUsIHBsYXliYWNrIGxvZ2ljIHdpbGwgaGFuZGxlIGFuaW1hdGlvbiBmcmFtZVxuICAgIC8vIHN0ZXBwaW5nIG1hbnVhbGx5LlxuICAgIGlmICggdGhpcy5hY3RpdmVQcm9wZXJ0eS52YWx1ZSAmJiAhcGhldC5qb2lzdC5wbGF5YmFja01vZGVFbmFibGVkUHJvcGVydHkudmFsdWUgKSB7XG5cbiAgICAgIC8vIEhhbmRsZSBJbnB1dCBmdXp6aW5nIGJlZm9yZSBzdGVwcGluZyB0aGUgc2ltIGJlY2F1c2UgaW5wdXQgZXZlbnRzIG9jY3VyIG91dHNpZGUgb2Ygc2ltIHN0ZXBzLCBidXQgbm90IGJlZm9yZSB0aGVcbiAgICAgIC8vIGZpcnN0IHNpbSBzdGVwICh0byBwcmV2ZW50IGlzc3VlcyBsaWtlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9lcXVhbGl0eS1leHBsb3Jlci9pc3N1ZXMvMTYxKS5cbiAgICAgIHRoaXMuZnJhbWVDb3VudGVyID4gMCAmJiB0aGlzLmRpc3BsYXkuZnV6eklucHV0RXZlbnRzKCk7XG5cbiAgICAgIHRoaXMuc3RlcE9uZUZyYW1lKCk7XG4gICAgfVxuXG4gICAgLy8gVGhlIGFuaW1hdGlvbiBmcmFtZSB0aW1lciBydW5zIGV2ZXJ5IGZyYW1lXG4gICAgY29uc3QgY3VycmVudFRpbWUgPSBEYXRlLm5vdygpO1xuICAgIGFuaW1hdGlvbkZyYW1lVGltZXIuZW1pdCggZ2V0RFQoIHRoaXMubGFzdEFuaW1hdGlvbkZyYW1lVGltZSwgY3VycmVudFRpbWUgKSApO1xuICAgIHRoaXMubGFzdEFuaW1hdGlvbkZyYW1lVGltZSA9IGN1cnJlbnRUaW1lO1xuXG4gICAgaWYgKCBUYW5kZW0uUEhFVF9JT19FTkFCTEVEICkge1xuXG4gICAgICAvLyBQaEVULWlPIGJhdGNoZXMgbWVzc2FnZXMgdG8gYmUgc2VudCB0byBvdGhlciBmcmFtZXMsIG1lc3NhZ2VzIG11c3QgYmUgc2VudCB3aGV0aGVyIHRoZSBzaW0gaXMgYWN0aXZlIG9yIG5vdFxuICAgICAgcGhldC5waGV0aW8ucGhldGlvQ29tbWFuZFByb2Nlc3Nvci5vbkFuaW1hdGlvbkxvb3AoIHRoaXMgKTtcbiAgICB9XG4gIH1cblxuICAvLyBSdW4gYSBzaW5nbGUgZnJhbWUgaW5jbHVkaW5nIG1vZGVsLCB2aWV3IGFuZCBkaXNwbGF5IHVwZGF0ZXMsIHVzZWQgYnkgTGVnZW5kcyBvZiBMZWFybmluZ1xuICBwdWJsaWMgc3RlcE9uZUZyYW1lKCk6IHZvaWQge1xuXG4gICAgLy8gQ29tcHV0ZSB0aGUgZWxhcHNlZCB0aW1lIHNpbmNlIHRoZSBsYXN0IGZyYW1lLCBvciBndWVzcyAxLzYwdGggb2YgYSBzZWNvbmQgaWYgaXQgaXMgdGhlIGZpcnN0IGZyYW1lXG4gICAgY29uc3QgY3VycmVudFRpbWUgPSBEYXRlLm5vdygpO1xuICAgIGNvbnN0IGR0ID0gZ2V0RFQoIHRoaXMubGFzdFN0ZXBUaW1lLCBjdXJyZW50VGltZSApO1xuICAgIHRoaXMubGFzdFN0ZXBUaW1lID0gY3VycmVudFRpbWU7XG5cbiAgICAvLyBEb24ndCBydW4gdGhlIHNpbXVsYXRpb24gb24gc3RlcHMgYmFjayBpbiB0aW1lIChzZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2pvaXN0L2lzc3Vlcy80MDkpXG4gICAgaWYgKCBkdCA+IDAgKSB7XG4gICAgICB0aGlzLnN0ZXBTaW11bGF0aW9uKCBkdCApO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBVcGRhdGUgdGhlIHNpbXVsYXRpb24gbW9kZWwsIHZpZXcsIHNjZW5lcnkgZGlzcGxheSB3aXRoIGFuIGVsYXBzZWQgdGltZSBvZiBkdC5cbiAgICogQHBhcmFtIGR0IC0gaW4gc2Vjb25kc1xuICAgKiAocGhldC1pbylcbiAgICovXG4gIHB1YmxpYyBzdGVwU2ltdWxhdGlvbiggZHQ6IG51bWJlciApOiB2b2lkIHtcbiAgICB0aGlzLnN0ZXBTaW11bGF0aW9uQWN0aW9uLmV4ZWN1dGUoIGR0ICk7XG4gIH1cblxuICAvKipcbiAgICogSGlkZSBvciBzaG93IGFsbCBhY2Nlc3NpYmxlIGNvbnRlbnQgcmVsYXRlZCB0byB0aGUgc2ltIFNjcmVlblZpZXdzLCBhbmQgbmF2aWdhdGlvbiBiYXIuIFRoaXMgY29udGVudCB3aWxsXG4gICAqIHJlbWFpbiB2aXNpYmxlLCBidXQgbm90IGJlIHRhYiBuYXZpZ2FibGUgb3IgcmVhZGFibGUgd2l0aCBhIHNjcmVlbiByZWFkZXIuIFRoaXMgaXMgZ2VuZXJhbGx5IHVzZWZ1bCB3aGVuXG4gICAqIGRpc3BsYXlpbmcgYSBwb3AgdXAgb3IgbW9kYWwgZGlhbG9nLlxuICAgKi9cbiAgcHVibGljIHNldFBET01WaWV3c1Zpc2libGUoIHZpc2libGU6IGJvb2xlYW4gKTogdm9pZCB7XG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgdGhpcy5zY3JlZW5zLmxlbmd0aDsgaSsrICkge1xuICAgICAgdGhpcy5zY3JlZW5zWyBpIF0udmlldy5wZG9tVmlzaWJsZSA9IHZpc2libGU7XG4gICAgfVxuXG4gICAgdGhpcy5uYXZpZ2F0aW9uQmFyLnBkb21WaXNpYmxlID0gdmlzaWJsZTtcbiAgICB0aGlzLmhvbWVTY3JlZW4gJiYgdGhpcy5ob21lU2NyZWVuLnZpZXcuc2V0UERPTVZpc2libGUoIHZpc2libGUgKTtcbiAgICB0aGlzLnRvb2xiYXIgJiYgdGhpcy50b29sYmFyLnNldFBET01WaXNpYmxlKCB2aXNpYmxlICk7XG4gIH1cblxuICAvKipcbiAgICogU2V0IHRoZSB2b2ljaW5nVmlzaWJsZSBzdGF0ZSBvZiBzaW11bGF0aW9uIGNvbXBvbmVudHMuIFdoZW4gZmFsc2UsIE9OTFkgdGhlIFRvb2xiYXJcbiAgICogYW5kIGl0cyBidXR0b25zIHdpbGwgYmUgYWJsZSB0byBhbm5vdW5jZSBWb2ljaW5nIHV0dGVyYW5jZXMuIFRoaXMgaXMgdXNlZCBieSB0aGVcbiAgICogXCJTaW0gVm9pY2luZ1wiIHN3aXRjaCBpbiB0aGUgdG9vbGJhciB3aGljaCB3aWxsIGRpc2FibGUgYWxsIFZvaWNpbmcgaW4gdGhlIHNpbSBzbyB0aGF0XG4gICAqIG9ubHkgVG9vbGJhciBjb250ZW50IGlzIGFubm91bmNlZC5cbiAgICovXG4gIHB1YmxpYyBzZXRTaW1Wb2ljaW5nVmlzaWJsZSggdmlzaWJsZTogYm9vbGVhbiApOiB2b2lkIHtcbiAgICB0aGlzLnNldE5vbk1vZGFsVm9pY2luZ1Zpc2libGUoIHZpc2libGUgKTtcbiAgICB0aGlzLnRvcExheWVyICYmIHRoaXMudG9wTGF5ZXIuc2V0Vm9pY2luZ1Zpc2libGUoIHZpc2libGUgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXRzIHZvaWNpbmdWaXNpYmxlIG9uIGFsbCBlbGVtZW50cyBcImJlaGluZFwiIHRoZSBtb2RhbCBub2RlIHN0YWNrLiBJbiB0aGlzIGNhc2UsIHZvaWNpbmcgc2hvdWxkIG5vdCB3b3JrIGZvciB0aG9zZVxuICAgKiBjb21wb25lbnRzIHdoZW4gc2V0IHRvIGZhbHNlLlxuICAgKiBAcGFyYW0gdmlzaWJsZVxuICAgKi9cbiAgcHVibGljIHNldE5vbk1vZGFsVm9pY2luZ1Zpc2libGUoIHZpc2libGU6IGJvb2xlYW4gKTogdm9pZCB7XG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgdGhpcy5zY3JlZW5zLmxlbmd0aDsgaSsrICkge1xuICAgICAgdGhpcy5zY3JlZW5zWyBpIF0udmlldy52b2ljaW5nVmlzaWJsZSA9IHZpc2libGU7IC8vIGhvbWUgc2NyZWVuIGlzIHRoZSBmaXJzdCBpdGVtLCBpZiBjcmVhdGVkXG4gICAgfVxuXG4gICAgdGhpcy5uYXZpZ2F0aW9uQmFyLnZvaWNpbmdWaXNpYmxlID0gdmlzaWJsZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDaGVja3MgZm9yIHdoZXRoZXIgbXVsdGktc2NyZWVuIHNpbXMgaGF2ZSBzY3JlZW4gbmFtZXMgdGhhdCBhcmUgaW4gcGhldC5zY3JlZW5OYW1lS2V5cyB3aXRoaW4gcGFja2FnZS5qc29uLFxuICAgKiBzZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2NoaXBwZXIvaXNzdWVzLzEzNjdcbiAgICovXG4gIHByaXZhdGUgYXVkaXRTY3JlZW5OYW1lS2V5cygpOiB2b2lkIHtcbiAgICBpZiAoIHRoaXMuc2NyZWVucy5sZW5ndGggPj0gMiApIHtcbiAgICAgIHRoaXMuc2NyZWVucy5mb3JFYWNoKCBzY3JlZW4gPT4ge1xuICAgICAgICBpZiAoICEoIHNjcmVlbiBpbnN0YW5jZW9mIEhvbWVTY3JlZW4gKSAmJiBzY3JlZW4ubmFtZVByb3BlcnR5IGluc3RhbmNlb2YgTG9jYWxpemVkU3RyaW5nUHJvcGVydHkgKSB7XG4gICAgICAgICAgY29uc3Qgc3RyaW5nS2V5ID0gc2NyZWVuLm5hbWVQcm9wZXJ0eS5zdHJpbmdLZXk7XG4gICAgICAgICAgYXNzZXJ0ICYmIGFzc2VydCggcGFja2FnZUpTT04ucGhldC5zY3JlZW5OYW1lS2V5cy5pbmNsdWRlcyggc3RyaW5nS2V5ICksXG4gICAgICAgICAgICBgRm9yIGEgbXVsdGktc2NyZWVuIHNpbSwgdGhlIHN0cmluZyBrZXkgKCR7SlNPTi5zdHJpbmdpZnkoIHN0cmluZ0tleSApfSkgc2hvdWxkIGJlIGluIHBoZXQuc2NyZWVuTmFtZUtleXMgd2l0aGluIHBhY2thZ2UuanNvbmAgKTtcbiAgICAgICAgfVxuICAgICAgfSApO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgaGVscGZ1bCBpbmZvcm1hdGlvbiBmb3IgcmVwbGljYXRpbmcgdGhlIGJ1ZyB3aGVuIGFuIGFzc2VydGlvbiBvY2N1cnMuXG4gICAqL1xuICBwdWJsaWMgZ2V0QXNzZXJ0aW9uRGVidWdJbmZvKCk6IG9iamVjdCB7XG5cbiAgICBjb25zdCBpbmZvOiBSZWNvcmQ8c3RyaW5nLCBJbnRlbnRpb25hbEFueT4gPSB7XG4gICAgICBzZWVkOiBkb3RSYW5kb20uZ2V0U2VlZCgpLFxuICAgICAgY3VycmVudFNjcmVlbk5hbWU6IHRoaXMuc2VsZWN0ZWRTY3JlZW5Qcm9wZXJ0eT8udmFsdWU/LmNvbnN0cnVjdG9yLm5hbWVcbiAgICB9O1xuICAgIGlmICggdGhpcy50b3BMYXllci5jaGlsZHJlbi5sZW5ndGggPiAxICkge1xuICAgICAgaW5mby5zaW1Ub3BMYXllciA9IHRoaXMudG9wTGF5ZXIuY2hpbGRyZW4ubWFwKCB4ID0+IGAke3guY29uc3RydWN0b3IubmFtZX0ke3guY29uc3RydWN0b3IubmFtZS5pbmNsdWRlcyggJ1BhcmVudCcgKSA/IGA6ICR7eC5jaGlsZHJlbi5tYXAoIHggPT4geC5jb25zdHJ1Y3Rvci5uYW1lICl9YCA6ICcnfWAgKTtcbiAgICB9XG4gICAgcmV0dXJuIGluZm87XG4gIH1cbn1cblxudHlwZSBMYXlvdXROb2RlID0gTm9kZSAmIHtcbiAgbGF5b3V0PzogKCBsYXlvdXRCb3VuZHM6IEJvdW5kczIgKSA9PiB2b2lkO1xufTtcblxuLy8gVGhpcyBOb2RlIHN1cHBvcnRzIGNoaWxkcmVuIHRoYXQgaGF2ZSBsYXlvdXQuXG50eXBlIFRvcExheWVyTm9kZSA9IHtcbiAgYWRkQ2hpbGQoIGNoaWxkOiBMYXlvdXROb2RlICk6IHZvaWQ7XG4gIGNoaWxkcmVuOiBMYXlvdXROb2RlW107XG59ICYgTm9kZTtcblxuLyoqXG4gKiBDb21wdXRlIHRoZSBkdCBzaW5jZSB0aGUgbGFzdCBldmVudFxuICogQHBhcmFtIGxhc3RUaW1lIC0gbWlsbGlzZWNvbmRzLCB0aW1lIG9mIHRoZSBsYXN0IGV2ZW50LCBudWxsIGlmIHRoZXJlIGlzIG5vIGxhc3QgZXZlbnQuXG4gKiBAcGFyYW0gY3VycmVudFRpbWUgLSBtaWxsaXNlY29uZHMsIGN1cnJlbnQgdGltZS4gIFBhc3NlZCBpbiBpbnN0ZWFkIG9mIGNvbXB1dGVkIHNvIHRoZXJlIGlzIG5vIFwic2xhY2tcIiBiZXR3ZWVuIG1lYXN1cmVtZW50c1xuICovXG5mdW5jdGlvbiBnZXREVCggbGFzdFRpbWU6IG51bWJlciB8IG51bGwsIGN1cnJlbnRUaW1lOiBudW1iZXIgKTogbnVtYmVyIHtcbiAgYXNzZXJ0ICYmIGxhc3RUaW1lICE9PSBudWxsICYmIGFzc2VydCggbGFzdFRpbWUgPiAwLCAndGltZSBtdXN0IGJlIHBvc2l0aXZlIChpdCBpc25cXCd0IDE5NzAgYW55bW9yZSknICk7XG5cbiAgLy8gQ29tcHV0ZSB0aGUgZWxhcHNlZCB0aW1lIHNpbmNlIHRoZSBsYXN0IGZyYW1lLCBvciBndWVzcyAxLzYwdGggb2YgYSBzZWNvbmQgaWYgaXQgaXMgdGhlIGZpcnN0IGZyYW1lXG4gIHJldHVybiAoIGxhc3RUaW1lID09PSBudWxsICkgPyAxIC8gNjAgOlxuICAgICAgICAgKCBjdXJyZW50VGltZSAtIGxhc3RUaW1lICkgLyAxMDAwLjA7XG59XG5cbmpvaXN0LnJlZ2lzdGVyKCAnU2ltJywgU2ltICk7Il0sIm5hbWVzIjpbImFuaW1hdGlvbkZyYW1lVGltZXIiLCJCb29sZWFuUHJvcGVydHkiLCJjcmVhdGVPYnNlcnZhYmxlQXJyYXkiLCJEZXJpdmVkUHJvcGVydHkiLCJFbWl0dGVyIiwiTXVsdGlsaW5rIiwiTnVtYmVyUHJvcGVydHkiLCJQcm9wZXJ0eSIsInN0ZXBUaW1lciIsIkxvY2FsaXplZFN0cmluZ1Byb3BlcnR5IiwiQm91bmRzMiIsIkNvbWJpbmF0aW9uIiwiRGltZW5zaW9uMiIsImRvdFJhbmRvbSIsIlBlcm11dGF0aW9uIiwiUmFuZG9tIiwiRG90VXRpbHMiLCJhZGRBZmZpcm1hdGlvbkhvb2siLCJzZXRBZmZpcm1hdGlvbkRlYnVnZ2VyTW9kZSIsIm9wdGlvbml6ZSIsInBsYXRmb3JtIiwiU3RyaW5nVXRpbHMiLCJCYXJyaWVyUmVjdGFuZ2xlIiwiYW5pbWF0ZWRQYW5ab29tU2luZ2xldG9uIiwiQ29sb3IiLCJnbG9iYWxLZXlTdGF0ZVRyYWNrZXIiLCJIaWdobGlnaHRQYXRoIiwiTm9kZSIsIlV0aWxzIiwidm9pY2luZ01hbmFnZXIiLCJ2b2ljaW5nVXR0ZXJhbmNlUXVldWUiLCJzb3VuZE1hbmFnZXIiLCJpc1NldHRpbmdQaGV0aW9TdGF0ZVByb3BlcnR5IiwiUGhldGlvQWN0aW9uIiwiUGhldGlvT2JqZWN0IiwiVGFuZGVtIiwiQXJyYXlJTyIsIk51bWJlcklPIiwiU3RyaW5nSU8iLCJhdWRpb01hbmFnZXIiLCJIZWFydGJlYXQiLCJIZWxwZXIiLCJIb21lU2NyZWVuIiwiSG9tZVNjcmVlblZpZXciLCJqb2lzdCIsIkpvaXN0U3RyaW5ncyIsImxhdW5jaENvdW50ZXIiLCJMb29rQW5kRmVlbCIsIk1lbW9yeU1vbml0b3IiLCJOYXZpZ2F0aW9uQmFyIiwicGFja2FnZUpTT04iLCJQcmVmZXJlbmNlc01vZGVsIiwiUHJvZmlsZXIiLCJRdWVyeVBhcmFtZXRlcnNXYXJuaW5nRGlhbG9nIiwiU2NyZWVuIiwiU2NyZWVuU2VsZWN0aW9uU291bmRHZW5lcmF0b3IiLCJTY3JlZW5zaG90R2VuZXJhdG9yIiwic2VsZWN0U2NyZWVucyIsIlNpbURpc3BsYXkiLCJTaW1JbmZvIiwiTGVnZW5kc09mTGVhcm5pbmdTdXBwb3J0IiwiVG9vbGJhciIsInVwZGF0ZUNoZWNrIiwiUFJPR1JFU1NfQkFSX1dJRFRIIiwiU1VQUE9SVFNfR0VTVFVSRV9ERVNDUklQVElPTiIsImFuZHJvaWQiLCJtb2JpbGVTYWZhcmkiLCJwaGV0IiwiZWxhcHNlZFRpbWUiLCJwbGF5YmFja01vZGVFbmFibGVkUHJvcGVydHkiLCJjaGlwcGVyIiwicXVlcnlQYXJhbWV0ZXJzIiwicGxheWJhY2tNb2RlIiwiYXNzZXJ0IiwiYnJhbmQiLCJTaW0iLCJ1cGRhdGVWaWV3cyIsInJlc2l6ZVRvV2luZG93Iiwic2VsZWN0ZWRTY3JlZW5Qcm9wZXJ0eSIsInZhbHVlIiwidmlldyIsInN0ZXAiLCJkaXNwbGF5IiwiZGVzY3JpcHRpb25VdHRlcmFuY2VRdWV1ZSIsImNsZWFyIiwicnVuT25OZXh0VGljayIsInVwZGF0ZURpc3BsYXkiLCJmaW5pc2hJbml0Iiwic2NyZWVucyIsIl8iLCJlYWNoIiwic2NyZWVuIiwibGF5ZXJTcGxpdCIsImRldGFjaEluYWN0aXZlU2NyZWVuVmlld3MiLCJzaW11bGF0aW9uUm9vdCIsImFkZENoaWxkIiwibmF2aWdhdGlvbkJhciIsInByZWZlcmVuY2VzTW9kZWwiLCJhdWRpb01vZGVsIiwic3VwcG9ydHNWb2ljaW5nIiwidG9vbGJhciIsInBkb21PcmRlciIsInZvaWNpbmdGdWxseUVuYWJsZWRQcm9wZXJ0eSIsImxpbmsiLCJmdWxseUVuYWJsZWQiLCJzZXRTaW1Wb2ljaW5nVmlzaWJsZSIsImN1cnJlbnRTY3JlZW4iLCJmb3JFYWNoIiwidmlzaWJsZSIsImFjdGl2ZVByb3BlcnR5Iiwic2V0IiwiaGFzQ2hpbGQiLCJpbnNlcnRDaGlsZCIsInNldFZpc2libGUiLCJyZW1vdmVDaGlsZCIsInVwZGF0ZUJhY2tncm91bmQiLCJsaXN0ZW5lciIsInJlc2V0VHJhbnNmb3JtIiwidG9wTGF5ZXIiLCJyZXNpemVMaXN0ZW5lciIsInJlc2l6ZVBlbmRpbmciLCIkIiwid2luZG93IiwicmVzaXplIiwiYWRkRXZlbnRMaXN0ZW5lciIsInZpc3VhbFZpZXdwb3J0IiwiY2hlY2siLCJRdWVyeVN0cmluZ01hY2hpbmUiLCJ3YXJuaW5ncyIsImxlbmd0aCIsIndhcm5pbmdEaWFsb2ciLCJjbG9zZUJ1dHRvbkxpc3RlbmVyIiwiaGlkZSIsImRpc3Bvc2UiLCJzaG93Iiwic2hvd1BvcHVwIiwicG9wdXAiLCJpc01vZGFsIiwicm9vdE5vZGUiLCJpbnRlcnJ1cHRTdWJ0cmVlSW5wdXQiLCJtb2RhbE5vZGVTdGFjayIsInB1c2giLCJzZXRQRE9NVmlld3NWaXNpYmxlIiwic2V0Tm9uTW9kYWxWb2ljaW5nVmlzaWJsZSIsImxheW91dCIsInNjcmVlbkJvdW5kc1Byb3BlcnR5IiwiaGlkZVBvcHVwIiwiaW5jbHVkZXMiLCJyZW1vdmUiLCJpbm5lcldpZHRoIiwiaW5uZXJIZWlnaHQiLCJ3aWR0aCIsImhlaWdodCIsInJlc2l6ZUFjdGlvbiIsImV4ZWN1dGUiLCJzdGFydCIsIndvcmtJdGVtcyIsImJhY2tncm91bmRDb2xvclByb3BlcnR5IiwiaGFzTGlzdGVuZXIiLCJpbml0aWFsaXplTW9kZWwiLCJpbml0aWFsaXplVmlldyIsInNpbU5hbWVQcm9wZXJ0eSIsImRpc3BsYXllZFNpbU5hbWVQcm9wZXJ0eSIsImhvbWVTY3JlZW4iLCJydW5JdGVtIiwiaSIsInNldFRpbWVvdXQiLCJwcm9ncmVzcyIsImxpbmVhciIsImRvY3VtZW50IiwiZ2V0RWxlbWVudEJ5SWQiLCJzZXRBdHRyaWJ1dGUiLCJwb2x5ZmlsbFJlcXVlc3RBbmltYXRpb25GcmFtZSIsInByb2ZpbGVyIiwiX2lzQ29uc3RydWN0aW9uQ29tcGxldGVQcm9wZXJ0eSIsImJvdW5kUnVuQW5pbWF0aW9uTG9vcCIsImJlZm9yZUNvdW50cyIsIkFycmF5IiwiZnJvbSIsImFsbFJhbmRvbUluc3RhbmNlcyIsIm1hcCIsIm4iLCJudW1iZXJPZkNhbGxzIiwiZW1pdCIsImFmdGVyQ291bnRzIiwiaXNFcXVhbCIsIlBIRVRfSU9fRU5BQkxFRCIsInByZWxvYWRzIiwicGhldGlvIiwicGhldGlvU3RhbmRhbG9uZSIsInBoZXRTcGxhc2hTY3JlZW4iLCJjb250aW51b3VzVGVzdCIsInJlcG9ydENvbnRpbnVvdXNUZXN0UmVzdWx0IiwidHlwZSIsInBvc3RNZXNzYWdlT25Mb2FkIiwicGFyZW50IiwicG9zdE1lc3NhZ2UiLCJKU09OIiwic3RyaW5naWZ5IiwidXJsIiwibG9jYXRpb24iLCJocmVmIiwicnVuQW5pbWF0aW9uTG9vcCIsInJlcXVlc3RBbmltYXRpb25GcmFtZSIsImZyYW1lQ291bnRlciIsImZ1enpJbnB1dEV2ZW50cyIsInN0ZXBPbmVGcmFtZSIsImN1cnJlbnRUaW1lIiwiRGF0ZSIsIm5vdyIsImdldERUIiwibGFzdEFuaW1hdGlvbkZyYW1lVGltZSIsInBoZXRpb0NvbW1hbmRQcm9jZXNzb3IiLCJvbkFuaW1hdGlvbkxvb3AiLCJkdCIsImxhc3RTdGVwVGltZSIsInN0ZXBTaW11bGF0aW9uIiwic3RlcFNpbXVsYXRpb25BY3Rpb24iLCJwZG9tVmlzaWJsZSIsInNldFBET01WaXNpYmxlIiwic2V0Vm9pY2luZ1Zpc2libGUiLCJ2b2ljaW5nVmlzaWJsZSIsImF1ZGl0U2NyZWVuTmFtZUtleXMiLCJuYW1lUHJvcGVydHkiLCJzdHJpbmdLZXkiLCJzY3JlZW5OYW1lS2V5cyIsImdldEFzc2VydGlvbkRlYnVnSW5mbyIsImluZm8iLCJzZWVkIiwiZ2V0U2VlZCIsImN1cnJlbnRTY3JlZW5OYW1lIiwiY29uc3RydWN0b3IiLCJuYW1lIiwiY2hpbGRyZW4iLCJzaW1Ub3BMYXllciIsIngiLCJhbGxTaW1TY3JlZW5zIiwicHJvdmlkZWRPcHRpb25zIiwicGhldFNwbGFzaFNjcmVlbkRvd25sb2FkQ29tcGxldGUiLCJhc3NlcnRpb25zIiwiYXNzZXJ0aW9uSG9va3MiLCJjb25zb2xlIiwibG9nIiwiY29udGFpbnNLZXkiLCJvcHRpb25zIiwiY3JlZGl0cyIsImhvbWVTY3JlZW5XYXJuaW5nTm9kZSIsIndlYmdsIiwiREVGQVVMVF9XRUJHTCIsInBoZXRpb1N0YXRlIiwicGhldGlvUmVhZE9ubHkiLCJ0YW5kZW0iLCJST09UIiwic2ltRGlzcGxheU9wdGlvbnMiLCJHRU5FUkFMX1ZJRVciLCJjcmVhdGVUYW5kZW0iLCJpc0NvbnN0cnVjdGlvbkNvbXBsZXRlUHJvcGVydHkiLCJmcmFtZVN0YXJ0ZWRFbWl0dGVyIiwiZnJhbWVFbmRlZEVtaXR0ZXIiLCJHRU5FUkFMX01PREVMIiwicGhldGlvSGlnaEZyZXF1ZW5jeSIsInBoZXRpb0RvY3VtZW50YXRpb24iLCJwaGV0aW9GZWF0dXJlZCIsInNjYWxlUHJvcGVydHkiLCJib3VuZHNQcm9wZXJ0eSIsImxvb2tBbmRGZWVsIiwibWVtb3J5TW9uaXRvciIsInZlcnNpb24iLCJsb2NhbGUiLCJiYXJyaWVyUmVjdGFuZ2xlIiwibGF6eUxpbmsiLCJFcnJvciIsImlzQ29uc3RydWN0aW9uQ29tcGxldGUiLCJkaW1lbnNpb25Qcm9wZXJ0eSIsInZhbHVlQ29tcGFyaXNvblN0cmF0ZWd5Iiwic2NhbGUiLCJNYXRoIiwibWluIiwiTEFZT1VUX0JPVU5EUyIsIm5hdkJhckhlaWdodCIsIk5BVklHQVRJT05fQkFSX1NJWkUiLCJ5Iiwic2V0U2l6ZSIsInNjcmVlbkhlaWdodCIsInNjcmVlbk1pblgiLCJnZXREaXNwbGF5ZWRXaWR0aCIsImF2YWlsYWJsZVNjcmVlbkJvdW5kcyIsIm0iLCJjaGlsZCIsInNjcm9sbFRvIiwiY29weSIsInNldFRhcmdldFNjYWxlIiwic2V0VGFyZ2V0Qm91bmRzIiwic2V0UGFuQm91bmRzIiwibGF5b3V0U2NhbGUiLCJwYXJhbWV0ZXJzIiwicGhldGlvVHlwZSIsInBoZXRpb1BsYXliYWNrIiwicGhldGlvRXZlbnRNZXRhZGF0YSIsImFsd2F5c1BsYXliYWNrYWJsZU92ZXJyaWRlIiwic3BlZWQiLCJtYXhEVCIsIm1vZGVsIiwiVFdFRU4iLCJ1cGRhdGUiLCJwaGV0aW9FbmdpbmUiLCJpc1JlYWR5Rm9yRGlzcGxheSIsIm1lbW9yeUxpbWl0IiwibWVhc3VyZSIsInNjcmVlbnNUYW5kZW0iLCJzY3JlZW5EYXRhIiwiaW5pdGlhbFNjcmVlbiIsInNlbGVjdGVkU2ltU2NyZWVucyIsInBvc3NpYmxlU2NyZWVuSW5kaWNlcyIsImluZGV4T2YiLCJ2YWxpZFZhbHVlcyIsImZsYXR0ZW4iLCJjb21iaW5hdGlvbnNPZiIsInN1YnNldCIsInBlcm11dGF0aW9uc09mIiwiZmlsdGVyIiwiYXJyYXkiLCJzb3J0IiwiYXZhaWxhYmxlU2NyZWVuc1Byb3BlcnR5IiwiaXNWYWxpZFZhbHVlIiwic29tZSIsInZhbGlkVmFsdWUiLCJwaGV0aW9WYWx1ZVR5cGUiLCJhY3RpdmVTaW1TY3JlZW5zUHJvcGVydHkiLCJzY3JlZW5JbmRpY2VzIiwiaW5kZXgiLCJQaGV0aW9JRFV0aWxzIiwiSE9NRV9TQ1JFRU5fQ09NUE9ORU5UX05BTUUiLCJ3YXJuaW5nTm9kZSIsInNpbVNjcmVlbnMiLCJhbGxTY3JlZW5zQ3JlYXRlZCIsIlNjcmVlbklPIiwiZGVyaXZlQW55Iiwic2ltVGl0bGVXaXRoU2NyZWVuTmFtZVBhdHRlcm5TdHJpbmdQcm9wZXJ0eSIsInVuaXEiLCJhdmFpbGFibGVTY3JlZW5zIiwic2ltTmFtZSIsInNlbGVjdGVkU2NyZWVuIiwidGl0bGVXaXRoU2NyZWVuUGF0dGVybiIsInNjcmVlbk5hbWUiLCJpc011bHRpU2NyZWVuU2ltRGlzcGxheWluZ1NpbmdsZVNjcmVlbiIsImZpbGxJbiIsInRhbmRlbU5hbWVTdWZmaXgiLCJicm93c2VyVGFiVmlzaWJsZVByb3BlcnR5IiwidmlzaWJpbGl0eVN0YXRlIiwibGF1bmNoQ2FsbGVkIiwic3VwcG9ydHNHZXN0dXJlRGVzY3JpcHRpb24iLCJzdXBwb3J0c0ludGVyYWN0aXZlRGVzY3JpcHRpb24iLCJoYXNLZXlib2FyZEhlbHBDb250ZW50Iiwic2ltU2NyZWVuIiwiY3JlYXRlS2V5Ym9hcmRIZWxwTm9kZSIsInNpbSIsImluaXRpYWxpemUiLCJzdXBwb3J0c1NvdW5kIiwiYWRkU291bmRHZW5lcmF0b3IiLCJpbml0aWFsT3V0cHV0TGV2ZWwiLCJjYXRlZ29yeU5hbWUiLCJ0aXRsZSIsInRvb2xiYXJFbmFibGVkUHJvcGVydHkiLCJyaWdodFBvc2l0aW9uUHJvcGVydHkiLCJhY3RpdmUiLCJtdWx0aWxpbmsiLCJwbGF5YmFja01vZGVFbmFibGVkIiwiaW50ZXJhY3RpdmUiLCJlbmFibGVkIiwiYm9keSIsImFwcGVuZENoaWxkIiwiZG9tRWxlbWVudCIsInRvQ29sb3IiLCJiYWNrZ3JvdW5kQ29sb3IiLCJuZXdTY3JlZW4iLCJvbGRTY3JlZW4iLCJzaW1JbmZvIiwib25TaW1Db25zdHJ1Y3Rpb25TdGFydGVkIiwiaXNTZXR0aW5nU3RhdGUiLCJiaW5kIiwibGVnZW5kc09mTGVhcm5pbmciLCJsYXN0VGltZSIsInJlZ2lzdGVyIl0sIm1hcHBpbmdzIjoiQUFBQSxzREFBc0Q7QUFFdEQ7Ozs7Ozs7Ozs7O0NBV0MsR0FFRCxPQUFPQSx5QkFBeUIsdUNBQXVDO0FBQ3ZFLE9BQU9DLHFCQUFxQixtQ0FBbUM7QUFDL0QsT0FBT0MsMkJBQTJCLHlDQUF5QztBQUMzRSxPQUFPQyxxQkFBcUIsbUNBQW1DO0FBQy9ELE9BQU9DLGFBQWEsMkJBQTJCO0FBQy9DLE9BQU9DLGVBQWUsNkJBQTZCO0FBQ25ELE9BQU9DLG9CQUFvQixrQ0FBa0M7QUFDN0QsT0FBT0MsY0FBYyw0QkFBNEI7QUFFakQsT0FBT0MsZUFBZSw2QkFBNkI7QUFFbkQsT0FBT0MsNkJBQTZCLHNEQUFzRDtBQUMxRixPQUFPQyxhQUFhLDBCQUEwQjtBQUM5QyxPQUFPQyxpQkFBaUIsOEJBQThCO0FBQ3RELE9BQU9DLGdCQUFnQiw2QkFBNkI7QUFDcEQsT0FBT0MsZUFBZSw0QkFBNEI7QUFDbEQsT0FBT0MsaUJBQWlCLDhCQUE4QjtBQUN0RCxPQUFPQyxZQUFZLHlCQUF5QjtBQUM1QyxPQUFPQyxjQUFjLHdCQUF3QixDQUFD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