// Copyright 2013-2024, University of Colorado Boulder
/**
 * Shows the home screen for a multi-screen simulation, which lets the user see all of the screens and select one.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */ import PatternStringProperty from '../../axon/js/PatternStringProperty.js';
import Bounds2 from '../../dot/js/Bounds2.js';
import optionize from '../../phet-core/js/optionize.js';
import StringUtils from '../../phetcommon/js/util/StringUtils.js';
import PhetFont from '../../scenery-phet/js/PhetFont.js';
import { AlignBox, HBox, Node, Text } from '../../scenery/js/imports.js';
import soundManager from '../../tambo/js/soundManager.js';
import Tandem from '../../tandem/js/Tandem.js';
import HomeScreenButton from './HomeScreenButton.js';
import HomeScreenSoundGenerator from './HomeScreenSoundGenerator.js';
import joist from './joist.js';
import JoistStrings from './JoistStrings.js';
import ScreenView from './ScreenView.js';
let HomeScreenView = class HomeScreenView extends ScreenView {
    /**
   * For a11y, highlight the currently selected screen button
   */ focusHighlightedScreenButton() {
        for(let i = 0; i < this.screenButtons.length; i++){
            const screenButton = this.screenButtons[i];
            if (screenButton.screen === this.selectedScreenProperty.value) {
                screenButton.focus();
                break;
            }
        }
    }
    /**
   * To support voicing.
   */ getVoicingOverviewContent() {
        return this.homeScreenScreenSummaryIntroProperty;
    }
    /**
   * To support voicing.
   */ getVoicingDetailsContent() {
        let details = '';
        // Do this dynamically so that it supports changes that may occur to the pdomDisplayNameProperty
        this.screenButtons.forEach((screenButton)=>{
            if (details !== '') {
                details += ' ';
            }
            details += StringUtils.fillIn(JoistStrings.a11y.homeScreenButtonDetailsPatternStringProperty, {
                name: screenButton.screen.pdomDisplayNameProperty.value,
                screenHint: screenButton.screen.screenButtonsHelpText
            });
        });
        return details;
    }
    /**
   * To support voicing.
   */ getVoicingHintContent() {
        return JoistStrings.a11y.homeScreenHintStringProperty;
    }
    /**
   * @param simNameProperty - the internationalized text for the sim name
   * @param model
   * @param [providedOptions]
   */ constructor(simNameProperty, model, providedOptions){
        const options = optionize()({
            layoutBounds: HomeScreenView.LAYOUT_BOUNDS,
            warningNode: null,
            // Remove the "normal" PDOM structure Nodes like the screen summary, play area, and control area Nodes from the
            // HomeScreen. The HomeScreen handles its own description.
            includePDOMNodes: false
        }, providedOptions);
        super(options);
        const homeScreenPDOMNode = new Node({
            tagName: 'p'
        });
        this.addChild(homeScreenPDOMNode);
        this.selectedScreenProperty = model.selectedScreenProperty;
        const titleText = new Text(simNameProperty, {
            font: new PhetFont({
                size: 52,
                family: HomeScreenView.TITLE_FONT_FAMILY
            }),
            fill: 'white',
            y: 130,
            maxWidth: this.layoutBounds.width - 10
        });
        // Have this before adding the child to support the startup layout. Use `localBoundsProperty` to avoid an infinite loop.
        titleText.localBoundsProperty.link(()=>{
            titleText.centerX = this.layoutBounds.centerX;
        });
        this.addChild(titleText);
        const buttonGroupTandem = options.tandem.createTandem('buttonGroup');
        this.screenButtons = _.map(model.simScreens, (screen)=>{
            assert && assert(screen.nameProperty.value, `name is required for screen ${model.simScreens.indexOf(screen)}`);
            assert && assert(screen.homeScreenIcon, `homeScreenIcon is required for screen ${screen.nameProperty.value}`);
            const homeScreenButton = new HomeScreenButton(screen, model, {
                showUnselectedHomeScreenIconFrame: screen.showUnselectedHomeScreenIconFrame,
                // pdom
                descriptionContent: screen.screenButtonsHelpText,
                // voicing
                voicingHintResponse: screen.screenButtonsHelpText,
                // phet-io
                tandem: screen.tandem.supplied ? buttonGroupTandem.createTandem(`${screen.tandem.name}Button`) : Tandem.REQUIRED
            });
            homeScreenButton.voicingNameResponse = screen.pdomDisplayNameProperty;
            homeScreenButton.innerContent = screen.pdomDisplayNameProperty;
            return homeScreenButton;
        });
        // Space the icons out more if there are fewer, so they will be spaced nicely.
        // Cannot have only 1 screen because for 1-screen sims there is no home screen.
        let spacing = 60;
        if (model.simScreens.length === 4) {
            spacing = 33;
        }
        if (model.simScreens.length >= 5) {
            spacing = 20;
        }
        this.homeScreenScreenSummaryIntroProperty = new PatternStringProperty(JoistStrings.a11y.homeScreenDescriptionPatternStringProperty, {
            name: simNameProperty,
            screens: model.simScreens.length
        }, {
            tandem: Tandem.OPT_OUT
        });
        // Add the home screen description, since there are no PDOM container Nodes for this ScreenView
        homeScreenPDOMNode.innerContent = new PatternStringProperty(JoistStrings.a11y.homeScreenIntroPatternStringProperty, {
            description: this.homeScreenScreenSummaryIntroProperty,
            hint: JoistStrings.a11y.homeScreenHintStringProperty
        }, {
            tandem: Tandem.OPT_OUT
        });
        this.screenButtons.forEach((screenButton)=>{
            screenButton.voicingContextResponse = simNameProperty;
        });
        const buttonBox = new HBox({
            spacing: spacing,
            align: 'top',
            maxWidth: this.layoutBounds.width - 118,
            // pdom
            tagName: 'ol'
        });
        model.activeSimScreensProperty.link((simScreens)=>{
            buttonBox.children = simScreens.map((screen)=>_.find(this.screenButtons, (screenButton)=>screenButton.screen === screen));
        });
        this.addChild(new AlignBox(buttonBox, {
            alignBounds: this.layoutBounds,
            yAlign: 'top',
            topMargin: this.layoutBounds.height / 3 + 20
        }));
        // Add sound generation for screen selection.  This generates sound for all changes between screens, not just for the
        // home screen.
        soundManager.addSoundGenerator(new HomeScreenSoundGenerator(model, {
            initialOutputLevel: 0.5
        }), {
            categoryName: 'user-interface'
        });
        if (options.warningNode) {
            const warningNode = options.warningNode;
            this.addChild(warningNode);
            warningNode.centerX = this.layoutBounds.centerX;
            warningNode.bottom = this.layoutBounds.maxY - 2;
        }
    }
};
// NOTE: In https://github.com/phetsims/joist/issues/640, we attempted to use ScreenView.DEFAULT_LAYOUT_BOUNDS here.
// Lots of problems were encountered, since both the Home screen and navigation bar are dependent on this value.
// If/when joist is cleaned up, this should be ScreenView.DEFAULT_LAYOUT_BOUNDS.
HomeScreenView.LAYOUT_BOUNDS = new Bounds2(0, 0, 768, 504);
// iPad doesn't support Century Gothic, so fall back to Futura, see http://wordpress.org/support/topic/font-not-working-on-ipad-browser
HomeScreenView.TITLE_FONT_FAMILY = 'Century Gothic, Futura';
joist.register('HomeScreenView', HomeScreenView);
export default HomeScreenView;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2pvaXN0L2pzL0hvbWVTY3JlZW5WaWV3LnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDEzLTIwMjQsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIFNob3dzIHRoZSBob21lIHNjcmVlbiBmb3IgYSBtdWx0aS1zY3JlZW4gc2ltdWxhdGlvbiwgd2hpY2ggbGV0cyB0aGUgdXNlciBzZWUgYWxsIG9mIHRoZSBzY3JlZW5zIGFuZCBzZWxlY3Qgb25lLlxuICpcbiAqIEBhdXRob3IgU2FtIFJlaWQgKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXG4gKi9cblxuaW1wb3J0IFBhdHRlcm5TdHJpbmdQcm9wZXJ0eSBmcm9tICcuLi8uLi9heG9uL2pzL1BhdHRlcm5TdHJpbmdQcm9wZXJ0eS5qcyc7XG5pbXBvcnQgUHJvcGVydHkgZnJvbSAnLi4vLi4vYXhvbi9qcy9Qcm9wZXJ0eS5qcyc7XG5pbXBvcnQgVFJlYWRPbmx5UHJvcGVydHkgZnJvbSAnLi4vLi4vYXhvbi9qcy9UUmVhZE9ubHlQcm9wZXJ0eS5qcyc7XG5pbXBvcnQgQm91bmRzMiBmcm9tICcuLi8uLi9kb3QvanMvQm91bmRzMi5qcyc7XG5pbXBvcnQgb3B0aW9uaXplIGZyb20gJy4uLy4uL3BoZXQtY29yZS9qcy9vcHRpb25pemUuanMnO1xuaW1wb3J0IFBpY2tSZXF1aXJlZCBmcm9tICcuLi8uLi9waGV0LWNvcmUvanMvdHlwZXMvUGlja1JlcXVpcmVkLmpzJztcbmltcG9ydCBTdHJpbmdVdGlscyBmcm9tICcuLi8uLi9waGV0Y29tbW9uL2pzL3V0aWwvU3RyaW5nVXRpbHMuanMnO1xuaW1wb3J0IFBoZXRGb250IGZyb20gJy4uLy4uL3NjZW5lcnktcGhldC9qcy9QaGV0Rm9udC5qcyc7XG5pbXBvcnQgeyBBbGlnbkJveCwgSEJveCwgTm9kZSwgVGV4dCB9IGZyb20gJy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XG5pbXBvcnQgc291bmRNYW5hZ2VyIGZyb20gJy4uLy4uL3RhbWJvL2pzL3NvdW5kTWFuYWdlci5qcyc7XG5pbXBvcnQgVGFuZGVtIGZyb20gJy4uLy4uL3RhbmRlbS9qcy9UYW5kZW0uanMnO1xuaW1wb3J0IEhvbWVTY3JlZW5CdXR0b24gZnJvbSAnLi9Ib21lU2NyZWVuQnV0dG9uLmpzJztcbmltcG9ydCBIb21lU2NyZWVuTW9kZWwgZnJvbSAnLi9Ib21lU2NyZWVuTW9kZWwuanMnO1xuaW1wb3J0IEhvbWVTY3JlZW5Tb3VuZEdlbmVyYXRvciBmcm9tICcuL0hvbWVTY3JlZW5Tb3VuZEdlbmVyYXRvci5qcyc7XG5pbXBvcnQgam9pc3QgZnJvbSAnLi9qb2lzdC5qcyc7XG5pbXBvcnQgSm9pc3RTdHJpbmdzIGZyb20gJy4vSm9pc3RTdHJpbmdzLmpzJztcbmltcG9ydCB7IEFueVNjcmVlbiB9IGZyb20gJy4vU2NyZWVuLmpzJztcbmltcG9ydCBTY3JlZW5WaWV3LCB7IFNjcmVlblZpZXdPcHRpb25zIH0gZnJvbSAnLi9TY3JlZW5WaWV3LmpzJztcblxudHlwZSBTZWxmT3B0aW9ucyA9IHtcblxuICAvLyB0byBkaXNwbGF5IGJlbG93IHRoZSBpY29ucyBhcyBhIHdhcm5pbmcgaWYgYXZhaWxhYmxlXG4gIHdhcm5pbmdOb2RlPzogTm9kZSB8IG51bGw7XG59O1xuXG50eXBlIEhvbWVTY3JlZW5WaWV3T3B0aW9ucyA9IFNlbGZPcHRpb25zICYgUGlja1JlcXVpcmVkPFNjcmVlblZpZXdPcHRpb25zLCAndGFuZGVtJz47XG5cbmNsYXNzIEhvbWVTY3JlZW5WaWV3IGV4dGVuZHMgU2NyZWVuVmlldyB7XG5cbiAgcHJpdmF0ZSBob21lU2NyZWVuU2NyZWVuU3VtbWFyeUludHJvUHJvcGVydHkhOiBUUmVhZE9ubHlQcm9wZXJ0eTxzdHJpbmc+O1xuICBwcml2YXRlIHNlbGVjdGVkU2NyZWVuUHJvcGVydHk6IFByb3BlcnR5PEFueVNjcmVlbj47XG4gIHB1YmxpYyBzY3JlZW5CdXR0b25zOiBIb21lU2NyZWVuQnV0dG9uW107XG5cbiAgLy8gTk9URTogSW4gaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2pvaXN0L2lzc3Vlcy82NDAsIHdlIGF0dGVtcHRlZCB0byB1c2UgU2NyZWVuVmlldy5ERUZBVUxUX0xBWU9VVF9CT1VORFMgaGVyZS5cbiAgLy8gTG90cyBvZiBwcm9ibGVtcyB3ZXJlIGVuY291bnRlcmVkLCBzaW5jZSBib3RoIHRoZSBIb21lIHNjcmVlbiBhbmQgbmF2aWdhdGlvbiBiYXIgYXJlIGRlcGVuZGVudCBvbiB0aGlzIHZhbHVlLlxuICAvLyBJZi93aGVuIGpvaXN0IGlzIGNsZWFuZWQgdXAsIHRoaXMgc2hvdWxkIGJlIFNjcmVlblZpZXcuREVGQVVMVF9MQVlPVVRfQk9VTkRTLlxuICBwdWJsaWMgc3RhdGljIHJlYWRvbmx5IExBWU9VVF9CT1VORFMgPSBuZXcgQm91bmRzMiggMCwgMCwgNzY4LCA1MDQgKTtcblxuICAvLyBpUGFkIGRvZXNuJ3Qgc3VwcG9ydCBDZW50dXJ5IEdvdGhpYywgc28gZmFsbCBiYWNrIHRvIEZ1dHVyYSwgc2VlIGh0dHA6Ly93b3JkcHJlc3Mub3JnL3N1cHBvcnQvdG9waWMvZm9udC1ub3Qtd29ya2luZy1vbi1pcGFkLWJyb3dzZXJcbiAgcHVibGljIHN0YXRpYyByZWFkb25seSBUSVRMRV9GT05UX0ZBTUlMWSA9ICdDZW50dXJ5IEdvdGhpYywgRnV0dXJhJztcblxuICAvKipcbiAgICogQHBhcmFtIHNpbU5hbWVQcm9wZXJ0eSAtIHRoZSBpbnRlcm5hdGlvbmFsaXplZCB0ZXh0IGZvciB0aGUgc2ltIG5hbWVcbiAgICogQHBhcmFtIG1vZGVsXG4gICAqIEBwYXJhbSBbcHJvdmlkZWRPcHRpb25zXVxuICAgKi9cbiAgcHVibGljIGNvbnN0cnVjdG9yKCBzaW1OYW1lUHJvcGVydHk6IFRSZWFkT25seVByb3BlcnR5PHN0cmluZz4sIG1vZGVsOiBIb21lU2NyZWVuTW9kZWwsIHByb3ZpZGVkT3B0aW9ucz86IEhvbWVTY3JlZW5WaWV3T3B0aW9ucyApIHtcblxuICAgIGNvbnN0IG9wdGlvbnMgPSBvcHRpb25pemU8SG9tZVNjcmVlblZpZXdPcHRpb25zLCBTZWxmT3B0aW9ucywgU2NyZWVuVmlld09wdGlvbnM+KCkoIHtcbiAgICAgIGxheW91dEJvdW5kczogSG9tZVNjcmVlblZpZXcuTEFZT1VUX0JPVU5EUyxcbiAgICAgIHdhcm5pbmdOb2RlOiBudWxsLFxuXG4gICAgICAvLyBSZW1vdmUgdGhlIFwibm9ybWFsXCIgUERPTSBzdHJ1Y3R1cmUgTm9kZXMgbGlrZSB0aGUgc2NyZWVuIHN1bW1hcnksIHBsYXkgYXJlYSwgYW5kIGNvbnRyb2wgYXJlYSBOb2RlcyBmcm9tIHRoZVxuICAgICAgLy8gSG9tZVNjcmVlbi4gVGhlIEhvbWVTY3JlZW4gaGFuZGxlcyBpdHMgb3duIGRlc2NyaXB0aW9uLlxuICAgICAgaW5jbHVkZVBET01Ob2RlczogZmFsc2VcbiAgICB9LCBwcm92aWRlZE9wdGlvbnMgKTtcblxuICAgIHN1cGVyKCBvcHRpb25zICk7XG5cbiAgICBjb25zdCBob21lU2NyZWVuUERPTU5vZGUgPSBuZXcgTm9kZSgge1xuICAgICAgdGFnTmFtZTogJ3AnXG4gICAgfSApO1xuICAgIHRoaXMuYWRkQ2hpbGQoIGhvbWVTY3JlZW5QRE9NTm9kZSApO1xuXG4gICAgdGhpcy5zZWxlY3RlZFNjcmVlblByb3BlcnR5ID0gbW9kZWwuc2VsZWN0ZWRTY3JlZW5Qcm9wZXJ0eTtcblxuICAgIGNvbnN0IHRpdGxlVGV4dCA9IG5ldyBUZXh0KCBzaW1OYW1lUHJvcGVydHksIHtcbiAgICAgIGZvbnQ6IG5ldyBQaGV0Rm9udCgge1xuICAgICAgICBzaXplOiA1MixcbiAgICAgICAgZmFtaWx5OiBIb21lU2NyZWVuVmlldy5USVRMRV9GT05UX0ZBTUlMWVxuICAgICAgfSApLFxuICAgICAgZmlsbDogJ3doaXRlJyxcbiAgICAgIHk6IDEzMCxcbiAgICAgIG1heFdpZHRoOiB0aGlzLmxheW91dEJvdW5kcy53aWR0aCAtIDEwXG4gICAgfSApO1xuXG4gICAgLy8gSGF2ZSB0aGlzIGJlZm9yZSBhZGRpbmcgdGhlIGNoaWxkIHRvIHN1cHBvcnQgdGhlIHN0YXJ0dXAgbGF5b3V0LiBVc2UgYGxvY2FsQm91bmRzUHJvcGVydHlgIHRvIGF2b2lkIGFuIGluZmluaXRlIGxvb3AuXG4gICAgdGl0bGVUZXh0LmxvY2FsQm91bmRzUHJvcGVydHkubGluayggKCkgPT4ge1xuICAgICAgdGl0bGVUZXh0LmNlbnRlclggPSB0aGlzLmxheW91dEJvdW5kcy5jZW50ZXJYO1xuICAgIH0gKTtcbiAgICB0aGlzLmFkZENoaWxkKCB0aXRsZVRleHQgKTtcblxuICAgIGNvbnN0IGJ1dHRvbkdyb3VwVGFuZGVtID0gb3B0aW9ucy50YW5kZW0uY3JlYXRlVGFuZGVtKCAnYnV0dG9uR3JvdXAnICk7XG5cbiAgICB0aGlzLnNjcmVlbkJ1dHRvbnMgPSBfLm1hcCggbW9kZWwuc2ltU2NyZWVucywgKCBzY3JlZW46IEFueVNjcmVlbiApID0+IHtcblxuICAgICAgYXNzZXJ0ICYmIGFzc2VydCggc2NyZWVuLm5hbWVQcm9wZXJ0eS52YWx1ZSwgYG5hbWUgaXMgcmVxdWlyZWQgZm9yIHNjcmVlbiAke21vZGVsLnNpbVNjcmVlbnMuaW5kZXhPZiggc2NyZWVuICl9YCApO1xuICAgICAgYXNzZXJ0ICYmIGFzc2VydCggc2NyZWVuLmhvbWVTY3JlZW5JY29uLCBgaG9tZVNjcmVlbkljb24gaXMgcmVxdWlyZWQgZm9yIHNjcmVlbiAke3NjcmVlbi5uYW1lUHJvcGVydHkudmFsdWV9YCApO1xuXG4gICAgICBjb25zdCBob21lU2NyZWVuQnV0dG9uID0gbmV3IEhvbWVTY3JlZW5CdXR0b24oXG4gICAgICAgIHNjcmVlbixcbiAgICAgICAgbW9kZWwsIHtcbiAgICAgICAgICBzaG93VW5zZWxlY3RlZEhvbWVTY3JlZW5JY29uRnJhbWU6IHNjcmVlbi5zaG93VW5zZWxlY3RlZEhvbWVTY3JlZW5JY29uRnJhbWUsXG5cbiAgICAgICAgICAvLyBwZG9tXG4gICAgICAgICAgZGVzY3JpcHRpb25Db250ZW50OiBzY3JlZW4uc2NyZWVuQnV0dG9uc0hlbHBUZXh0LFxuXG4gICAgICAgICAgLy8gdm9pY2luZ1xuICAgICAgICAgIHZvaWNpbmdIaW50UmVzcG9uc2U6IHNjcmVlbi5zY3JlZW5CdXR0b25zSGVscFRleHQsXG5cbiAgICAgICAgICAvLyBwaGV0LWlvXG4gICAgICAgICAgdGFuZGVtOiBzY3JlZW4udGFuZGVtLnN1cHBsaWVkID8gYnV0dG9uR3JvdXBUYW5kZW0uY3JlYXRlVGFuZGVtKCBgJHtzY3JlZW4udGFuZGVtLm5hbWV9QnV0dG9uYCApIDogVGFuZGVtLlJFUVVJUkVEXG4gICAgICAgIH0gKTtcblxuICAgICAgaG9tZVNjcmVlbkJ1dHRvbi52b2ljaW5nTmFtZVJlc3BvbnNlID0gc2NyZWVuLnBkb21EaXNwbGF5TmFtZVByb3BlcnR5O1xuICAgICAgaG9tZVNjcmVlbkJ1dHRvbi5pbm5lckNvbnRlbnQgPSBzY3JlZW4ucGRvbURpc3BsYXlOYW1lUHJvcGVydHk7XG5cbiAgICAgIHJldHVybiBob21lU2NyZWVuQnV0dG9uO1xuICAgIH0gKTtcblxuICAgIC8vIFNwYWNlIHRoZSBpY29ucyBvdXQgbW9yZSBpZiB0aGVyZSBhcmUgZmV3ZXIsIHNvIHRoZXkgd2lsbCBiZSBzcGFjZWQgbmljZWx5LlxuICAgIC8vIENhbm5vdCBoYXZlIG9ubHkgMSBzY3JlZW4gYmVjYXVzZSBmb3IgMS1zY3JlZW4gc2ltcyB0aGVyZSBpcyBubyBob21lIHNjcmVlbi5cbiAgICBsZXQgc3BhY2luZyA9IDYwO1xuICAgIGlmICggbW9kZWwuc2ltU2NyZWVucy5sZW5ndGggPT09IDQgKSB7XG4gICAgICBzcGFjaW5nID0gMzM7XG4gICAgfVxuICAgIGlmICggbW9kZWwuc2ltU2NyZWVucy5sZW5ndGggPj0gNSApIHtcbiAgICAgIHNwYWNpbmcgPSAyMDtcbiAgICB9XG5cbiAgICB0aGlzLmhvbWVTY3JlZW5TY3JlZW5TdW1tYXJ5SW50cm9Qcm9wZXJ0eSA9IG5ldyBQYXR0ZXJuU3RyaW5nUHJvcGVydHkoIEpvaXN0U3RyaW5ncy5hMTF5LmhvbWVTY3JlZW5EZXNjcmlwdGlvblBhdHRlcm5TdHJpbmdQcm9wZXJ0eSwge1xuICAgICAgbmFtZTogc2ltTmFtZVByb3BlcnR5LFxuICAgICAgc2NyZWVuczogbW9kZWwuc2ltU2NyZWVucy5sZW5ndGhcbiAgICB9LCB7IHRhbmRlbTogVGFuZGVtLk9QVF9PVVQgfSApO1xuXG5cbiAgICAvLyBBZGQgdGhlIGhvbWUgc2NyZWVuIGRlc2NyaXB0aW9uLCBzaW5jZSB0aGVyZSBhcmUgbm8gUERPTSBjb250YWluZXIgTm9kZXMgZm9yIHRoaXMgU2NyZWVuVmlld1xuICAgIGhvbWVTY3JlZW5QRE9NTm9kZS5pbm5lckNvbnRlbnQgPSBuZXcgUGF0dGVyblN0cmluZ1Byb3BlcnR5KCBKb2lzdFN0cmluZ3MuYTExeS5ob21lU2NyZWVuSW50cm9QYXR0ZXJuU3RyaW5nUHJvcGVydHksIHtcbiAgICAgIGRlc2NyaXB0aW9uOiB0aGlzLmhvbWVTY3JlZW5TY3JlZW5TdW1tYXJ5SW50cm9Qcm9wZXJ0eSxcbiAgICAgIGhpbnQ6IEpvaXN0U3RyaW5ncy5hMTF5LmhvbWVTY3JlZW5IaW50U3RyaW5nUHJvcGVydHlcbiAgICB9LCB7IHRhbmRlbTogVGFuZGVtLk9QVF9PVVQgfSApO1xuXG4gICAgdGhpcy5zY3JlZW5CdXR0b25zLmZvckVhY2goIHNjcmVlbkJ1dHRvbiA9PiB7XG4gICAgICBzY3JlZW5CdXR0b24udm9pY2luZ0NvbnRleHRSZXNwb25zZSA9IHNpbU5hbWVQcm9wZXJ0eTtcbiAgICB9ICk7XG5cbiAgICBjb25zdCBidXR0b25Cb3ggPSBuZXcgSEJveCgge1xuICAgICAgc3BhY2luZzogc3BhY2luZyxcbiAgICAgIGFsaWduOiAndG9wJyxcbiAgICAgIG1heFdpZHRoOiB0aGlzLmxheW91dEJvdW5kcy53aWR0aCAtIDExOCxcblxuICAgICAgLy8gcGRvbVxuICAgICAgdGFnTmFtZTogJ29sJ1xuICAgIH0gKTtcbiAgICBtb2RlbC5hY3RpdmVTaW1TY3JlZW5zUHJvcGVydHkubGluayggc2ltU2NyZWVucyA9PiB7XG4gICAgICBidXR0b25Cb3guY2hpbGRyZW4gPSBzaW1TY3JlZW5zLm1hcCggc2NyZWVuID0+IF8uZmluZCggdGhpcy5zY3JlZW5CdXR0b25zLCBzY3JlZW5CdXR0b24gPT4gc2NyZWVuQnV0dG9uLnNjcmVlbiA9PT0gc2NyZWVuICkhICk7XG4gICAgfSApO1xuXG4gICAgdGhpcy5hZGRDaGlsZCggbmV3IEFsaWduQm94KCBidXR0b25Cb3gsIHtcbiAgICAgIGFsaWduQm91bmRzOiB0aGlzLmxheW91dEJvdW5kcyxcbiAgICAgIHlBbGlnbjogJ3RvcCcsXG4gICAgICB0b3BNYXJnaW46IHRoaXMubGF5b3V0Qm91bmRzLmhlaWdodCAvIDMgKyAyMFxuICAgIH0gKSApO1xuXG4gICAgLy8gQWRkIHNvdW5kIGdlbmVyYXRpb24gZm9yIHNjcmVlbiBzZWxlY3Rpb24uICBUaGlzIGdlbmVyYXRlcyBzb3VuZCBmb3IgYWxsIGNoYW5nZXMgYmV0d2VlbiBzY3JlZW5zLCBub3QganVzdCBmb3IgdGhlXG4gICAgLy8gaG9tZSBzY3JlZW4uXG4gICAgc291bmRNYW5hZ2VyLmFkZFNvdW5kR2VuZXJhdG9yKCBuZXcgSG9tZVNjcmVlblNvdW5kR2VuZXJhdG9yKCBtb2RlbCwgeyBpbml0aWFsT3V0cHV0TGV2ZWw6IDAuNSB9ICksIHtcbiAgICAgIGNhdGVnb3J5TmFtZTogJ3VzZXItaW50ZXJmYWNlJ1xuICAgIH0gKTtcblxuICAgIGlmICggb3B0aW9ucy53YXJuaW5nTm9kZSApIHtcbiAgICAgIGNvbnN0IHdhcm5pbmdOb2RlID0gb3B0aW9ucy53YXJuaW5nTm9kZTtcbiAgICAgIHRoaXMuYWRkQ2hpbGQoIHdhcm5pbmdOb2RlICk7XG4gICAgICB3YXJuaW5nTm9kZS5jZW50ZXJYID0gdGhpcy5sYXlvdXRCb3VuZHMuY2VudGVyWDtcbiAgICAgIHdhcm5pbmdOb2RlLmJvdHRvbSA9IHRoaXMubGF5b3V0Qm91bmRzLm1heFkgLSAyO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBGb3IgYTExeSwgaGlnaGxpZ2h0IHRoZSBjdXJyZW50bHkgc2VsZWN0ZWQgc2NyZWVuIGJ1dHRvblxuICAgKi9cbiAgcHVibGljIGZvY3VzSGlnaGxpZ2h0ZWRTY3JlZW5CdXR0b24oKTogdm9pZCB7XG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgdGhpcy5zY3JlZW5CdXR0b25zLmxlbmd0aDsgaSsrICkge1xuICAgICAgY29uc3Qgc2NyZWVuQnV0dG9uID0gdGhpcy5zY3JlZW5CdXR0b25zWyBpIF07XG4gICAgICBpZiAoIHNjcmVlbkJ1dHRvbi5zY3JlZW4gPT09IHRoaXMuc2VsZWN0ZWRTY3JlZW5Qcm9wZXJ0eS52YWx1ZSApIHtcbiAgICAgICAgc2NyZWVuQnV0dG9uLmZvY3VzKCk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBUbyBzdXBwb3J0IHZvaWNpbmcuXG4gICAqL1xuICBwdWJsaWMgb3ZlcnJpZGUgZ2V0Vm9pY2luZ092ZXJ2aWV3Q29udGVudCgpOiBUUmVhZE9ubHlQcm9wZXJ0eTxzdHJpbmc+IHtcbiAgICByZXR1cm4gdGhpcy5ob21lU2NyZWVuU2NyZWVuU3VtbWFyeUludHJvUHJvcGVydHk7XG4gIH1cblxuICAvKipcbiAgICogVG8gc3VwcG9ydCB2b2ljaW5nLlxuICAgKi9cbiAgcHVibGljIG92ZXJyaWRlIGdldFZvaWNpbmdEZXRhaWxzQ29udGVudCgpOiBzdHJpbmcge1xuXG4gICAgbGV0IGRldGFpbHMgPSAnJztcblxuICAgIC8vIERvIHRoaXMgZHluYW1pY2FsbHkgc28gdGhhdCBpdCBzdXBwb3J0cyBjaGFuZ2VzIHRoYXQgbWF5IG9jY3VyIHRvIHRoZSBwZG9tRGlzcGxheU5hbWVQcm9wZXJ0eVxuICAgIHRoaXMuc2NyZWVuQnV0dG9ucy5mb3JFYWNoKCBzY3JlZW5CdXR0b24gPT4ge1xuICAgICAgaWYgKCBkZXRhaWxzICE9PSAnJyApIHtcbiAgICAgICAgZGV0YWlscyArPSAnICc7XG4gICAgICB9XG4gICAgICBkZXRhaWxzICs9IFN0cmluZ1V0aWxzLmZpbGxJbiggSm9pc3RTdHJpbmdzLmExMXkuaG9tZVNjcmVlbkJ1dHRvbkRldGFpbHNQYXR0ZXJuU3RyaW5nUHJvcGVydHksIHtcbiAgICAgICAgbmFtZTogc2NyZWVuQnV0dG9uLnNjcmVlbi5wZG9tRGlzcGxheU5hbWVQcm9wZXJ0eS52YWx1ZSxcbiAgICAgICAgc2NyZWVuSGludDogc2NyZWVuQnV0dG9uLnNjcmVlbi5zY3JlZW5CdXR0b25zSGVscFRleHRcbiAgICAgIH0gKTtcbiAgICB9ICk7XG4gICAgcmV0dXJuIGRldGFpbHM7XG4gIH1cblxuICAvKipcbiAgICogVG8gc3VwcG9ydCB2b2ljaW5nLlxuICAgKi9cbiAgcHVibGljIG92ZXJyaWRlIGdldFZvaWNpbmdIaW50Q29udGVudCgpOiBUUmVhZE9ubHlQcm9wZXJ0eTxzdHJpbmc+IHtcbiAgICByZXR1cm4gSm9pc3RTdHJpbmdzLmExMXkuaG9tZVNjcmVlbkhpbnRTdHJpbmdQcm9wZXJ0eTtcbiAgfVxufVxuXG5qb2lzdC5yZWdpc3RlciggJ0hvbWVTY3JlZW5WaWV3JywgSG9tZVNjcmVlblZpZXcgKTtcbmV4cG9ydCBkZWZhdWx0IEhvbWVTY3JlZW5WaWV3OyJdLCJuYW1lcyI6WyJQYXR0ZXJuU3RyaW5nUHJvcGVydHkiLCJCb3VuZHMyIiwib3B0aW9uaXplIiwiU3RyaW5nVXRpbHMiLCJQaGV0Rm9udCIsIkFsaWduQm94IiwiSEJveCIsIk5vZGUiLCJUZXh0Iiwic291bmRNYW5hZ2VyIiwiVGFuZGVtIiwiSG9tZVNjcmVlbkJ1dHRvbiIsIkhvbWVTY3JlZW5Tb3VuZEdlbmVyYXRvciIsImpvaXN0IiwiSm9pc3RTdHJpbmdzIiwiU2NyZWVuVmlldyIsIkhvbWVTY3JlZW5WaWV3IiwiZm9jdXNIaWdobGlnaHRlZFNjcmVlbkJ1dHRvbiIsImkiLCJzY3JlZW5CdXR0b25zIiwibGVuZ3RoIiwic2NyZWVuQnV0dG9uIiwic2NyZWVuIiwic2VsZWN0ZWRTY3JlZW5Qcm9wZXJ0eSIsInZhbHVlIiwiZm9jdXMiLCJnZXRWb2ljaW5nT3ZlcnZpZXdDb250ZW50IiwiaG9tZVNjcmVlblNjcmVlblN1bW1hcnlJbnRyb1Byb3BlcnR5IiwiZ2V0Vm9pY2luZ0RldGFpbHNDb250ZW50IiwiZGV0YWlscyIsImZvckVhY2giLCJmaWxsSW4iLCJhMTF5IiwiaG9tZVNjcmVlbkJ1dHRvbkRldGFpbHNQYXR0ZXJuU3RyaW5nUHJvcGVydHkiLCJuYW1lIiwicGRvbURpc3BsYXlOYW1lUHJvcGVydHkiLCJzY3JlZW5IaW50Iiwic2NyZWVuQnV0dG9uc0hlbHBUZXh0IiwiZ2V0Vm9pY2luZ0hpbnRDb250ZW50IiwiaG9tZVNjcmVlbkhpbnRTdHJpbmdQcm9wZXJ0eSIsInNpbU5hbWVQcm9wZXJ0eSIsIm1vZGVsIiwicHJvdmlkZWRPcHRpb25zIiwib3B0aW9ucyIsImxheW91dEJvdW5kcyIsIkxBWU9VVF9CT1VORFMiLCJ3YXJuaW5nTm9kZSIsImluY2x1ZGVQRE9NTm9kZXMiLCJob21lU2NyZWVuUERPTU5vZGUiLCJ0YWdOYW1lIiwiYWRkQ2hpbGQiLCJ0aXRsZVRleHQiLCJmb250Iiwic2l6ZSIsImZhbWlseSIsIlRJVExFX0ZPTlRfRkFNSUxZIiwiZmlsbCIsInkiLCJtYXhXaWR0aCIsIndpZHRoIiwibG9jYWxCb3VuZHNQcm9wZXJ0eSIsImxpbmsiLCJjZW50ZXJYIiwiYnV0dG9uR3JvdXBUYW5kZW0iLCJ0YW5kZW0iLCJjcmVhdGVUYW5kZW0iLCJfIiwibWFwIiwic2ltU2NyZWVucyIsImFzc2VydCIsIm5hbWVQcm9wZXJ0eSIsImluZGV4T2YiLCJob21lU2NyZWVuSWNvbiIsImhvbWVTY3JlZW5CdXR0b24iLCJzaG93VW5zZWxlY3RlZEhvbWVTY3JlZW5JY29uRnJhbWUiLCJkZXNjcmlwdGlvbkNvbnRlbnQiLCJ2b2ljaW5nSGludFJlc3BvbnNlIiwic3VwcGxpZWQiLCJSRVFVSVJFRCIsInZvaWNpbmdOYW1lUmVzcG9uc2UiLCJpbm5lckNvbnRlbnQiLCJzcGFjaW5nIiwiaG9tZVNjcmVlbkRlc2NyaXB0aW9uUGF0dGVyblN0cmluZ1Byb3BlcnR5Iiwic2NyZWVucyIsIk9QVF9PVVQiLCJob21lU2NyZWVuSW50cm9QYXR0ZXJuU3RyaW5nUHJvcGVydHkiLCJkZXNjcmlwdGlvbiIsImhpbnQiLCJ2b2ljaW5nQ29udGV4dFJlc3BvbnNlIiwiYnV0dG9uQm94IiwiYWxpZ24iLCJhY3RpdmVTaW1TY3JlZW5zUHJvcGVydHkiLCJjaGlsZHJlbiIsImZpbmQiLCJhbGlnbkJvdW5kcyIsInlBbGlnbiIsInRvcE1hcmdpbiIsImhlaWdodCIsImFkZFNvdW5kR2VuZXJhdG9yIiwiaW5pdGlhbE91dHB1dExldmVsIiwiY2F0ZWdvcnlOYW1lIiwiYm90dG9tIiwibWF4WSIsInJlZ2lzdGVyIl0sIm1hcHBpbmdzIjoiQUFBQSxzREFBc0Q7QUFFdEQ7Ozs7Q0FJQyxHQUVELE9BQU9BLDJCQUEyQix5Q0FBeUM7QUFHM0UsT0FBT0MsYUFBYSwwQkFBMEI7QUFDOUMsT0FBT0MsZUFBZSxrQ0FBa0M7QUFFeEQsT0FBT0MsaUJBQWlCLDBDQUEwQztBQUNsRSxPQUFPQyxjQUFjLG9DQUFvQztBQUN6RCxTQUFTQyxRQUFRLEVBQUVDLElBQUksRUFBRUMsSUFBSSxFQUFFQyxJQUFJLFFBQVEsOEJBQThCO0FBQ3pFLE9BQU9DLGtCQUFrQixpQ0FBaUM7QUFDMUQsT0FBT0MsWUFBWSw0QkFBNEI7QUFDL0MsT0FBT0Msc0JBQXNCLHdCQUF3QjtBQUVyRCxPQUFPQyw4QkFBOEIsZ0NBQWdDO0FBQ3JFLE9BQU9DLFdBQVcsYUFBYTtBQUMvQixPQUFPQyxrQkFBa0Isb0JBQW9CO0FBRTdDLE9BQU9DLGdCQUF1QyxrQkFBa0I7QUFVaEUsSUFBQSxBQUFNQyxpQkFBTixNQUFNQSx1QkFBdUJEO0lBNkkzQjs7R0FFQyxHQUNELEFBQU9FLCtCQUFxQztRQUMxQyxJQUFNLElBQUlDLElBQUksR0FBR0EsSUFBSSxJQUFJLENBQUNDLGFBQWEsQ0FBQ0MsTUFBTSxFQUFFRixJQUFNO1lBQ3BELE1BQU1HLGVBQWUsSUFBSSxDQUFDRixhQUFhLENBQUVELEVBQUc7WUFDNUMsSUFBS0csYUFBYUMs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