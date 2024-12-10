// Copyright 2013-2024, University of Colorado Boulder
/**
 * FiniteStatusBar is the status bar for games that have a finite number of challenges per level.
 * This was adapted from and replaces ScoreboardBar. See https://github.com/phetsims/vegas/issues/66.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */ import DerivedProperty from '../../axon/js/DerivedProperty.js';
import Multilink from '../../axon/js/Multilink.js';
import optionize, { combineOptions } from '../../phet-core/js/optionize.js';
import StringUtils from '../../phetcommon/js/util/StringUtils.js';
import PhetColorScheme from '../../scenery-phet/js/PhetColorScheme.js';
import StatusBar from '../../scenery-phet/js/StatusBar.js';
import { HBox, Rectangle, Text } from '../../scenery/js/imports.js';
import TextPushButton from '../../sun/js/buttons/TextPushButton.js';
import ElapsedTimeNode from './ElapsedTimeNode.js';
import ScoreDisplayLabeledNumber from './ScoreDisplayLabeledNumber.js';
import vegas from './vegas.js';
import VegasStrings from './VegasStrings.js';
let FiniteStatusBar = class FiniteStatusBar extends StatusBar {
    dispose() {
        this.disposeFiniteStatusBar();
        super.dispose();
    }
    /**
   * @param layoutBounds - layoutBounds of the ScreenView
   * @param visibleBoundsProperty - visible bounds of the ScreenView
   * @param scoreProperty
   * @param providedOptions
   */ constructor(layoutBounds, visibleBoundsProperty, scoreProperty, providedOptions){
        var _options_tandem;
        const options = optionize()({
            // SelfOptions
            challengeIndexProperty: null,
            numberOfChallengesProperty: null,
            levelProperty: null,
            elapsedTimeProperty: null,
            timerEnabledProperty: null,
            levelVisible: true,
            challengeNumberVisible: true,
            font: StatusBar.DEFAULT_FONT,
            textFill: StatusBar.DEFAULT_TEXT_FILL,
            createScoreDisplay: (scoreProperty)=>new ScoreDisplayLabeledNumber(scoreProperty, {
                    font: providedOptions && providedOptions.font ? providedOptions.font : StatusBar.DEFAULT_FONT,
                    textFill: providedOptions && providedOptions.textFill ? providedOptions.textFill : StatusBar.DEFAULT_TEXT_FILL
                }),
            startOverButtonText: VegasStrings.startOverStringProperty,
            clockIconRadius: 15,
            xSpacing: 50,
            xMargin: 20,
            yMargin: 10,
            barFill: null,
            barStroke: null
        }, providedOptions);
        // nested options for 'Start Over' button
        options.startOverButtonOptions = combineOptions({
            font: options.font,
            textFill: options.textFill,
            baseColor: PhetColorScheme.BUTTON_YELLOW,
            xMargin: 10,
            yMargin: 8,
            listener: _.noop,
            tandem: (_options_tandem = options.tandem) == null ? void 0 : _options_tandem.createTandem('startOverButton'),
            maxWidth: 0.2 * (layoutBounds.width - 2 * options.xMargin // use 20% of available width
            )
        }, options.startOverButtonOptions);
        assert && assert(options.challengeIndexProperty && options.numberOfChallengesProperty || !options.challengeIndexProperty && !options.numberOfChallengesProperty, 'challengeIndexProperty and numberOfChallengesProperty are both or neither');
        // nested options for 'Level N' text
        options.levelTextOptions = combineOptions({
            fill: options.textFill,
            font: options.font
        }, options.levelTextOptions);
        // nested options for 'Challenge N of M' text
        options.challengeTextOptions = combineOptions({
            fill: options.textFill,
            font: options.font
        }, options.challengeTextOptions);
        // the rectangular bar, size will be set by visibleBoundsListener
        const barNode = new Rectangle({
            fill: options.barFill,
            stroke: options.barStroke
        });
        // Nodes on the left end of the bar
        const leftChildren = [];
        // Level N
        let levelText;
        if (options.levelProperty && options.levelVisible) {
            var _options_tandem1;
            const levelStringProperty = new DerivedProperty([
                VegasStrings.label.levelStringProperty,
                options.levelProperty
            ], (pattern, level)=>StringUtils.format(pattern, level));
            levelText = new Text(levelStringProperty, combineOptions({
                tandem: (_options_tandem1 = options.tandem) == null ? void 0 : _options_tandem1.createTandem('levelText')
            }, options.levelTextOptions));
            leftChildren.push(levelText);
        }
        // Challenge N of M
        let challengeNumberText;
        if (options.challengeIndexProperty && options.numberOfChallengesProperty) {
            var _options_tandem2;
            const challengeNumberStringProperty = new DerivedProperty([
                VegasStrings.pattern['0challenge']['1maxStringProperty'],
                options.challengeIndexProperty,
                options.numberOfChallengesProperty
            ], (pattern, challengeIndex, numberOfChallenges)=>StringUtils.format(pattern, challengeIndex + 1, numberOfChallenges));
            challengeNumberText = new Text(challengeNumberStringProperty, combineOptions({
                tandem: (_options_tandem2 = options.tandem) == null ? void 0 : _options_tandem2.createTandem('challengeNumberText')
            }, options.challengeTextOptions));
            leftChildren.push(challengeNumberText);
        }
        // Score
        const scoreDisplay = options.createScoreDisplay(scoreProperty);
        leftChildren.push(scoreDisplay);
        // Timer (optional)
        let elapsedTimeNode;
        if (options.elapsedTimeProperty && options.timerEnabledProperty) {
            elapsedTimeNode = new ElapsedTimeNode(options.elapsedTimeProperty, {
                visibleProperty: options.timerEnabledProperty,
                clockIconRadius: options.clockIconRadius,
                font: options.font,
                textFill: options.textFill
            });
            leftChildren.push(elapsedTimeNode);
        }
        // Start Over button
        const startOverButton = new TextPushButton(options.startOverButtonText, options.startOverButtonOptions);
        // Nodes on the left end of the bar
        const leftNodes = new HBox({
            // Because elapsedTimeNode needs to be considered regardless of whether it's visible,
            // see https://github.com/phetsims/vegas/issues/80
            excludeInvisibleChildrenFromBounds: false,
            spacing: options.xSpacing,
            children: leftChildren
        });
        options.children = [
            barNode,
            leftNodes,
            startOverButton
        ];
        options.barHeight = Math.max(leftNodes.height, scoreDisplay.height) + 2 * options.yMargin;
        super(layoutBounds, visibleBoundsProperty, options);
        // Dynamically position components on the bar.
        Multilink.multilink([
            this.positioningBoundsProperty,
            leftNodes.boundsProperty,
            startOverButton.boundsProperty
        ], (positioningBounds, leftNodeBounds, startOverButtonBounds)=>{
            leftNodes.maxWidth = layoutBounds.width - 2 * options.xMargin - startOverButtonBounds.width - options.xSpacing;
            leftNodes.left = positioningBounds.left;
            leftNodes.centerY = positioningBounds.centerY;
            startOverButton.right = positioningBounds.right;
            startOverButton.centerY = positioningBounds.centerY;
        });
        this.disposeFiniteStatusBar = ()=>{
            levelText.dispose();
            challengeNumberText.dispose();
            scoreDisplay.dispose();
            elapsedTimeNode && elapsedTimeNode.dispose();
            startOverButton.dispose();
            elapsedTimeNode && elapsedTimeNode.dispose();
        };
    }
};
export { FiniteStatusBar as default };
vegas.register('FiniteStatusBar', FiniteStatusBar);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3ZlZ2FzL2pzL0Zpbml0ZVN0YXR1c0Jhci50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxMy0yMDI0LCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuLyoqXG4gKiBGaW5pdGVTdGF0dXNCYXIgaXMgdGhlIHN0YXR1cyBiYXIgZm9yIGdhbWVzIHRoYXQgaGF2ZSBhIGZpbml0ZSBudW1iZXIgb2YgY2hhbGxlbmdlcyBwZXIgbGV2ZWwuXG4gKiBUaGlzIHdhcyBhZGFwdGVkIGZyb20gYW5kIHJlcGxhY2VzIFNjb3JlYm9hcmRCYXIuIFNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvdmVnYXMvaXNzdWVzLzY2LlxuICpcbiAqIEBhdXRob3IgQ2hyaXMgTWFsbGV5IChQaXhlbFpvb20sIEluYy4pXG4gKi9cblxuaW1wb3J0IERlcml2ZWRQcm9wZXJ0eSBmcm9tICcuLi8uLi9heG9uL2pzL0Rlcml2ZWRQcm9wZXJ0eS5qcyc7XG5pbXBvcnQgTXVsdGlsaW5rIGZyb20gJy4uLy4uL2F4b24vanMvTXVsdGlsaW5rLmpzJztcbmltcG9ydCBUUHJvcGVydHkgZnJvbSAnLi4vLi4vYXhvbi9qcy9UUHJvcGVydHkuanMnO1xuaW1wb3J0IFRSZWFkT25seVByb3BlcnR5IGZyb20gJy4uLy4uL2F4b24vanMvVFJlYWRPbmx5UHJvcGVydHkuanMnO1xuaW1wb3J0IEJvdW5kczIgZnJvbSAnLi4vLi4vZG90L2pzL0JvdW5kczIuanMnO1xuaW1wb3J0IG9wdGlvbml6ZSwgeyBjb21iaW5lT3B0aW9ucyB9IGZyb20gJy4uLy4uL3BoZXQtY29yZS9qcy9vcHRpb25pemUuanMnO1xuaW1wb3J0IFN0cmljdE9taXQgZnJvbSAnLi4vLi4vcGhldC1jb3JlL2pzL3R5cGVzL1N0cmljdE9taXQuanMnO1xuaW1wb3J0IFN0cmluZ1V0aWxzIGZyb20gJy4uLy4uL3BoZXRjb21tb24vanMvdXRpbC9TdHJpbmdVdGlscy5qcyc7XG5pbXBvcnQgUGhldENvbG9yU2NoZW1lIGZyb20gJy4uLy4uL3NjZW5lcnktcGhldC9qcy9QaGV0Q29sb3JTY2hlbWUuanMnO1xuaW1wb3J0IFN0YXR1c0JhciwgeyBTdGF0dXNCYXJPcHRpb25zIH0gZnJvbSAnLi4vLi4vc2NlbmVyeS1waGV0L2pzL1N0YXR1c0Jhci5qcyc7XG5pbXBvcnQgeyBGb250LCBIQm94LCBOb2RlLCBSZWN0YW5nbGUsIFRDb2xvciwgVGV4dCwgVGV4dE9wdGlvbnMgfSBmcm9tICcuLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xuaW1wb3J0IFRleHRQdXNoQnV0dG9uLCB7IFRleHRQdXNoQnV0dG9uT3B0aW9ucyB9IGZyb20gJy4uLy4uL3N1bi9qcy9idXR0b25zL1RleHRQdXNoQnV0dG9uLmpzJztcbmltcG9ydCBFbGFwc2VkVGltZU5vZGUgZnJvbSAnLi9FbGFwc2VkVGltZU5vZGUuanMnO1xuaW1wb3J0IFNjb3JlRGlzcGxheUxhYmVsZWROdW1iZXIgZnJvbSAnLi9TY29yZURpc3BsYXlMYWJlbGVkTnVtYmVyLmpzJztcbmltcG9ydCB2ZWdhcyBmcm9tICcuL3ZlZ2FzLmpzJztcbmltcG9ydCBWZWdhc1N0cmluZ3MgZnJvbSAnLi9WZWdhc1N0cmluZ3MuanMnO1xuXG50eXBlIFNlbGZPcHRpb25zID0ge1xuXG4gIC8vIG9wdGlvbmFsIFByb3BlcnRpZXNcbiAgY2hhbGxlbmdlSW5kZXhQcm9wZXJ0eT86IFRSZWFkT25seVByb3BlcnR5PG51bWJlcj4gfCBudWxsO1xuICBudW1iZXJPZkNoYWxsZW5nZXNQcm9wZXJ0eT86IFRSZWFkT25seVByb3BlcnR5PG51bWJlcj4gfCBudWxsO1xuICBsZXZlbFByb3BlcnR5PzogVFJlYWRPbmx5UHJvcGVydHk8bnVtYmVyPiB8IG51bGw7XG4gIGVsYXBzZWRUaW1lUHJvcGVydHk/OiBUUmVhZE9ubHlQcm9wZXJ0eTxudW1iZXI+IHwgbnVsbDtcbiAgdGltZXJFbmFibGVkUHJvcGVydHk/OiBUUmVhZE9ubHlQcm9wZXJ0eTxib29sZWFuPiB8IG51bGw7XG5cbiAgLy8gdGhpbmdzIHRoYXQgY2FuIGJlIGhpZGRlblxuICBsZXZlbFZpc2libGU/OiBib29sZWFuO1xuICBjaGFsbGVuZ2VOdW1iZXJWaXNpYmxlPzogYm9vbGVhbjtcblxuICAvLyBhbGwgdGV4dFxuICBmb250PzogRm9udDtcbiAgdGV4dEZpbGw/OiBUQ29sb3I7XG5cbiAgLy8gc2NvcmUgZGlzcGxheVxuICBjcmVhdGVTY29yZURpc3BsYXk/OiAoIHNjb3JlUHJvcGVydHk6IFRQcm9wZXJ0eTxudW1iZXI+ICkgPT4gTm9kZTtcblxuICAvLyBuZXN0ZWQgb3B0aW9ucyBmb3IgJ1N0YXJ0IE92ZXInIGJ1dHRvbiwgZmlsbGVkIGluIGJlbG93XG4gIHN0YXJ0T3ZlckJ1dHRvbk9wdGlvbnM/OiBUZXh0UHVzaEJ1dHRvbk9wdGlvbnM7XG4gIHN0YXJ0T3ZlckJ1dHRvblRleHQ/OiBzdHJpbmcgfCBUUmVhZE9ubHlQcm9wZXJ0eTxzdHJpbmc+O1xuXG4gIC8vIG9wdGlvbnMgZm9yIHRoZSB0aW1lciBub2RlXG4gIGNsb2NrSWNvblJhZGl1cz86IG51bWJlcjtcblxuICAvLyBzcGFjaW5nIGFuZCBtYXJnaW4gZm9yIHRoaW5ncyBpbiB0aGUgYmFyXG4gIHhTcGFjaW5nPzogbnVtYmVyO1xuICB4TWFyZ2luPzogbnVtYmVyO1xuICB5TWFyZ2luPzogbnVtYmVyO1xuXG4gIGxldmVsVGV4dE9wdGlvbnM/OiBUZXh0T3B0aW9uczsgLy8gcGFzc2VkIHRvIHRoZSBcIkxldmVsIE5cIiB0ZXh0XG4gIGNoYWxsZW5nZVRleHRPcHRpb25zPzogVGV4dE9wdGlvbnM7IC8vIHBhc3NlZCB0byB0aGUgXCJDaGFsbGVuZ2UgTiBvZiBNXCIgdGV4dFxuXG4gIGJhckZpbGw/OiBUQ29sb3I7XG4gIGJhclN0cm9rZT86IFRDb2xvcjtcbn07XG5cbmV4cG9ydCB0eXBlIEZpbml0ZVN0YXR1c0Jhck9wdGlvbnMgPSBTZWxmT3B0aW9ucyAmIFN0cmljdE9taXQ8U3RhdHVzQmFyT3B0aW9ucywgJ2NoaWxkcmVuJyB8ICdiYXJIZWlnaHQnPjtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgRmluaXRlU3RhdHVzQmFyIGV4dGVuZHMgU3RhdHVzQmFyIHtcblxuICBwcml2YXRlIHJlYWRvbmx5IGRpc3Bvc2VGaW5pdGVTdGF0dXNCYXI6ICgpID0+IHZvaWQ7XG5cbiAgLyoqXG4gICAqIEBwYXJhbSBsYXlvdXRCb3VuZHMgLSBsYXlvdXRCb3VuZHMgb2YgdGhlIFNjcmVlblZpZXdcbiAgICogQHBhcmFtIHZpc2libGVCb3VuZHNQcm9wZXJ0eSAtIHZpc2libGUgYm91bmRzIG9mIHRoZSBTY3JlZW5WaWV3XG4gICAqIEBwYXJhbSBzY29yZVByb3BlcnR5XG4gICAqIEBwYXJhbSBwcm92aWRlZE9wdGlvbnNcbiAgICovXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggbGF5b3V0Qm91bmRzOiBCb3VuZHMyLCB2aXNpYmxlQm91bmRzUHJvcGVydHk6IFRSZWFkT25seVByb3BlcnR5PEJvdW5kczI+LCBzY29yZVByb3BlcnR5OiBUUHJvcGVydHk8bnVtYmVyPixcbiAgICAgICAgICAgICAgICAgICAgICBwcm92aWRlZE9wdGlvbnM/OiBGaW5pdGVTdGF0dXNCYXJPcHRpb25zICkge1xuXG4gICAgY29uc3Qgb3B0aW9ucyA9IG9wdGlvbml6ZTxGaW5pdGVTdGF0dXNCYXJPcHRpb25zLFxuICAgICAgU3RyaWN0T21pdDxTZWxmT3B0aW9ucywgJ3N0YXJ0T3ZlckJ1dHRvbk9wdGlvbnMnIHwgJ2xldmVsVGV4dE9wdGlvbnMnIHwgJ2NoYWxsZW5nZVRleHRPcHRpb25zJz4sXG4gICAgICBTdGF0dXNCYXJPcHRpb25zPigpKCB7XG5cbiAgICAgIC8vIFNlbGZPcHRpb25zXG4gICAgICBjaGFsbGVuZ2VJbmRleFByb3BlcnR5OiBudWxsLFxuICAgICAgbnVtYmVyT2ZDaGFsbGVuZ2VzUHJvcGVydHk6IG51bGwsXG4gICAgICBsZXZlbFByb3BlcnR5OiBudWxsLFxuICAgICAgZWxhcHNlZFRpbWVQcm9wZXJ0eTogbnVsbCxcbiAgICAgIHRpbWVyRW5hYmxlZFByb3BlcnR5OiBudWxsLFxuICAgICAgbGV2ZWxWaXNpYmxlOiB0cnVlLFxuICAgICAgY2hhbGxlbmdlTnVtYmVyVmlzaWJsZTogdHJ1ZSxcbiAgICAgIGZvbnQ6IFN0YXR1c0Jhci5ERUZBVUxUX0ZPTlQsXG4gICAgICB0ZXh0RmlsbDogU3RhdHVzQmFyLkRFRkFVTFRfVEVYVF9GSUxMLFxuICAgICAgY3JlYXRlU2NvcmVEaXNwbGF5OiBzY29yZVByb3BlcnR5ID0+IG5ldyBTY29yZURpc3BsYXlMYWJlbGVkTnVtYmVyKCBzY29yZVByb3BlcnR5LCB7XG4gICAgICAgIGZvbnQ6IHByb3ZpZGVkT3B0aW9ucyAmJiBwcm92aWRlZE9wdGlvbnMuZm9udCA/IHByb3ZpZGVkT3B0aW9ucy5mb250IDogU3RhdHVzQmFyLkRFRkFVTFRfRk9OVCxcbiAgICAgICAgdGV4dEZpbGw6IHByb3ZpZGVkT3B0aW9ucyAmJiBwcm92aWRlZE9wdGlvbnMudGV4dEZpbGwgPyBwcm92aWRlZE9wdGlvbnMudGV4dEZpbGwgOiBTdGF0dXNCYXIuREVGQVVMVF9URVhUX0ZJTExcbiAgICAgIH0gKSxcbiAgICAgIHN0YXJ0T3ZlckJ1dHRvblRleHQ6IFZlZ2FzU3RyaW5ncy5zdGFydE92ZXJTdHJpbmdQcm9wZXJ0eSxcbiAgICAgIGNsb2NrSWNvblJhZGl1czogMTUsXG4gICAgICB4U3BhY2luZzogNTAsXG4gICAgICB4TWFyZ2luOiAyMCxcbiAgICAgIHlNYXJnaW46IDEwLFxuICAgICAgYmFyRmlsbDogbnVsbCxcbiAgICAgIGJhclN0cm9rZTogbnVsbFxuICAgIH0sIHByb3ZpZGVkT3B0aW9ucyApO1xuXG4gICAgLy8gbmVzdGVkIG9wdGlvbnMgZm9yICdTdGFydCBPdmVyJyBidXR0b25cbiAgICBvcHRpb25zLnN0YXJ0T3ZlckJ1dHRvbk9wdGlvbnMgPSBjb21iaW5lT3B0aW9uczxUZXh0UHVzaEJ1dHRvbk9wdGlvbnM+KCB7XG4gICAgICBmb250OiBvcHRpb25zLmZvbnQsXG4gICAgICB0ZXh0RmlsbDogb3B0aW9ucy50ZXh0RmlsbCxcbiAgICAgIGJhc2VDb2xvcjogUGhldENvbG9yU2NoZW1lLkJVVFRPTl9ZRUxMT1csXG4gICAgICB4TWFyZ2luOiAxMCxcbiAgICAgIHlNYXJnaW46IDgsXG4gICAgICBsaXN0ZW5lcjogXy5ub29wLFxuICAgICAgdGFuZGVtOiBvcHRpb25zLnRhbmRlbT8uY3JlYXRlVGFuZGVtKCAnc3RhcnRPdmVyQnV0dG9uJyApLFxuICAgICAgbWF4V2lkdGg6IDAuMiAqICggbGF5b3V0Qm91bmRzLndpZHRoIC0gKCAyICogb3B0aW9ucy54TWFyZ2luICkgKSAvLyB1c2UgMjAlIG9mIGF2YWlsYWJsZSB3aWR0aFxuICAgIH0sIG9wdGlvbnMuc3RhcnRPdmVyQnV0dG9uT3B0aW9ucyApO1xuXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggKCBvcHRpb25zLmNoYWxsZW5nZUluZGV4UHJvcGVydHkgJiYgb3B0aW9ucy5udW1iZXJPZkNoYWxsZW5nZXNQcm9wZXJ0eSApIHx8XG4gICAgICAgICAgICAgICAgICAgICAgKCAhb3B0aW9ucy5jaGFsbGVuZ2VJbmRleFByb3BlcnR5ICYmICFvcHRpb25zLm51bWJlck9mQ2hhbGxlbmdlc1Byb3BlcnR5ICksXG4gICAgICAnY2hhbGxlbmdlSW5kZXhQcm9wZXJ0eSBhbmQgbnVtYmVyT2ZDaGFsbGVuZ2VzUHJvcGVydHkgYXJlIGJvdGggb3IgbmVpdGhlcicgKTtcblxuICAgIC8vIG5lc3RlZCBvcHRpb25zIGZvciAnTGV2ZWwgTicgdGV4dFxuICAgIG9wdGlvbnMubGV2ZWxUZXh0T3B0aW9ucyA9IGNvbWJpbmVPcHRpb25zPFRleHRPcHRpb25zPigge1xuICAgICAgZmlsbDogb3B0aW9ucy50ZXh0RmlsbCxcbiAgICAgIGZvbnQ6IG9wdGlvbnMuZm9udFxuICAgIH0sIG9wdGlvbnMubGV2ZWxUZXh0T3B0aW9ucyApO1xuXG4gICAgLy8gbmVzdGVkIG9wdGlvbnMgZm9yICdDaGFsbGVuZ2UgTiBvZiBNJyB0ZXh0XG4gICAgb3B0aW9ucy5jaGFsbGVuZ2VUZXh0T3B0aW9ucyA9IGNvbWJpbmVPcHRpb25zPFRleHRPcHRpb25zPigge1xuICAgICAgZmlsbDogb3B0aW9ucy50ZXh0RmlsbCxcbiAgICAgIGZvbnQ6IG9wdGlvbnMuZm9udFxuICAgIH0sIG9wdGlvbnMuY2hhbGxlbmdlVGV4dE9wdGlvbnMgKTtcblxuICAgIC8vIHRoZSByZWN0YW5ndWxhciBiYXIsIHNpemUgd2lsbCBiZSBzZXQgYnkgdmlzaWJsZUJvdW5kc0xpc3RlbmVyXG4gICAgY29uc3QgYmFyTm9kZSA9IG5ldyBSZWN0YW5nbGUoIHtcbiAgICAgIGZpbGw6IG9wdGlvbnMuYmFyRmlsbCxcbiAgICAgIHN0cm9rZTogb3B0aW9ucy5iYXJTdHJva2VcbiAgICB9ICk7XG5cbiAgICAvLyBOb2RlcyBvbiB0aGUgbGVmdCBlbmQgb2YgdGhlIGJhclxuICAgIGNvbnN0IGxlZnRDaGlsZHJlbiA9IFtdO1xuXG4gICAgLy8gTGV2ZWwgTlxuICAgIGxldCBsZXZlbFRleHQ6IE5vZGU7XG4gICAgaWYgKCBvcHRpb25zLmxldmVsUHJvcGVydHkgJiYgb3B0aW9ucy5sZXZlbFZpc2libGUgKSB7XG5cbiAgICAgIGNvbnN0IGxldmVsU3RyaW5nUHJvcGVydHkgPSBuZXcgRGVyaXZlZFByb3BlcnR5KFxuICAgICAgICBbIFZlZ2FzU3RyaW5ncy5sYWJlbC5sZXZlbFN0cmluZ1Byb3BlcnR5LCBvcHRpb25zLmxldmVsUHJvcGVydHkgXSxcbiAgICAgICAgKCBwYXR0ZXJuOiBzdHJpbmcsIGxldmVsOiBudW1iZXIgKSA9PiBTdHJpbmdVdGlscy5mb3JtYXQoIHBhdHRlcm4sIGxldmVsIClcbiAgICAgICk7XG5cbiAgICAgIGxldmVsVGV4dCA9IG5ldyBUZXh0KCBsZXZlbFN0cmluZ1Byb3BlcnR5LCBjb21iaW5lT3B0aW9uczxUZXh0T3B0aW9ucz4oIHtcbiAgICAgICAgdGFuZGVtOiBvcHRpb25zLnRhbmRlbT8uY3JlYXRlVGFuZGVtKCAnbGV2ZWxUZXh0JyApXG4gICAgICB9LCBvcHRpb25zLmxldmVsVGV4dE9wdGlvbnMgKSApO1xuICAgICAgbGVmdENoaWxkcmVuLnB1c2goIGxldmVsVGV4dCApO1xuICAgIH1cblxuICAgIC8vIENoYWxsZW5nZSBOIG9mIE1cbiAgICBsZXQgY2hhbGxlbmdlTnVtYmVyVGV4dDogTm9kZTtcbiAgICBpZiAoIG9wdGlvbnMuY2hhbGxlbmdlSW5kZXhQcm9wZXJ0eSAmJiBvcHRpb25zLm51bWJlck9mQ2hhbGxlbmdlc1Byb3BlcnR5ICkge1xuXG4gICAgICBjb25zdCBjaGFsbGVuZ2VOdW1iZXJTdHJpbmdQcm9wZXJ0eSA9IG5ldyBEZXJpdmVkUHJvcGVydHkoXG4gICAgICAgIFsgVmVnYXNTdHJpbmdzLnBhdHRlcm5bICcwY2hhbGxlbmdlJyBdWyAnMW1heFN0cmluZ1Byb3BlcnR5JyBdLCBvcHRpb25zLmNoYWxsZW5nZUluZGV4UHJvcGVydHksIG9wdGlvbnMubnVtYmVyT2ZDaGFsbGVuZ2VzUHJvcGVydHkgXSxcbiAgICAgICAgKCBwYXR0ZXJuOiBzdHJpbmcsIGNoYWxsZW5nZUluZGV4OiBudW1iZXIsIG51bWJlck9mQ2hhbGxlbmdlczogbnVtYmVyICkgPT5cbiAgICAgICAgICBTdHJpbmdVdGlscy5mb3JtYXQoIHBhdHRlcm4sIGNoYWxsZW5nZUluZGV4ICsgMSwgbnVtYmVyT2ZDaGFsbGVuZ2VzIClcbiAgICAgICk7XG5cbiAgICAgIGNoYWxsZW5nZU51bWJlclRleHQgPSBuZXcgVGV4dCggY2hhbGxlbmdlTnVtYmVyU3RyaW5nUHJvcGVydHksIGNvbWJpbmVPcHRpb25zPFRleHRPcHRpb25zPigge1xuICAgICAgICB0YW5kZW06IG9wdGlvbnMudGFuZGVtPy5jcmVhdGVUYW5kZW0oICdjaGFsbGVuZ2VOdW1iZXJUZXh0JyApXG4gICAgICB9LCBvcHRpb25zLmNoYWxsZW5nZVRleHRPcHRpb25zICkgKTtcbiAgICAgIGxlZnRDaGlsZHJlbi5wdXNoKCBjaGFsbGVuZ2VOdW1iZXJUZXh0ICk7XG4gICAgfVxuXG4gICAgLy8gU2NvcmVcbiAgICBjb25zdCBzY29yZURpc3BsYXkgPSBvcHRpb25zLmNyZWF0ZVNjb3JlRGlzcGxheSggc2NvcmVQcm9wZXJ0eSApO1xuICAgIGxlZnRDaGlsZHJlbi5wdXNoKCBzY29yZURpc3BsYXkgKTtcblxuICAgIC8vIFRpbWVyIChvcHRpb25hbClcbiAgICBsZXQgZWxhcHNlZFRpbWVOb2RlOiBOb2RlO1xuICAgIGlmICggb3B0aW9ucy5lbGFwc2VkVGltZVByb3BlcnR5ICYmIG9wdGlvbnMudGltZXJFbmFibGVkUHJvcGVydHkgKSB7XG4gICAgICBlbGFwc2VkVGltZU5vZGUgPSBuZXcgRWxhcHNlZFRpbWVOb2RlKCBvcHRpb25zLmVsYXBzZWRUaW1lUHJvcGVydHksIHtcbiAgICAgICAgdmlzaWJsZVByb3BlcnR5OiBvcHRpb25zLnRpbWVyRW5hYmxlZFByb3BlcnR5LFxuICAgICAgICBjbG9ja0ljb25SYWRpdXM6IG9wdGlvbnMuY2xvY2tJY29uUmFkaXVzLFxuICAgICAgICBmb250OiBvcHRpb25zLmZvbnQsXG4gICAgICAgIHRleHRGaWxsOiBvcHRpb25zLnRleHRGaWxsXG4gICAgICB9ICk7XG4gICAgICBsZWZ0Q2hpbGRyZW4ucHVzaCggZWxhcHNlZFRpbWVOb2RlICk7XG4gICAgfVxuXG4gICAgLy8gU3RhcnQgT3ZlciBidXR0b25cbiAgICBjb25zdCBzdGFydE92ZXJCdXR0b24gPSBuZXcgVGV4dFB1c2hCdXR0b24oIG9wdGlvbnMuc3RhcnRPdmVyQnV0dG9uVGV4dCwgb3B0aW9ucy5zdGFydE92ZXJCdXR0b25PcHRpb25zICk7XG5cbiAgICAvLyBOb2RlcyBvbiB0aGUgbGVmdCBlbmQgb2YgdGhlIGJhclxuICAgIGNvbnN0IGxlZnROb2RlcyA9IG5ldyBIQm94KCB7XG5cbiAgICAgIC8vIEJlY2F1c2UgZWxhcHNlZFRpbWVOb2RlIG5lZWRzIHRvIGJlIGNvbnNpZGVyZWQgcmVnYXJkbGVzcyBvZiB3aGV0aGVyIGl0J3MgdmlzaWJsZSxcbiAgICAgIC8vIHNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvdmVnYXMvaXNzdWVzLzgwXG4gICAgICBleGNsdWRlSW52aXNpYmxlQ2hpbGRyZW5Gcm9tQm91bmRzOiBmYWxzZSxcbiAgICAgIHNwYWNpbmc6IG9wdGlvbnMueFNwYWNpbmcsXG4gICAgICBjaGlsZHJlbjogbGVmdENoaWxkcmVuXG4gICAgfSApO1xuXG4gICAgb3B0aW9ucy5jaGlsZHJlbiA9IFsgYmFyTm9kZSwgbGVmdE5vZGVzLCBzdGFydE92ZXJCdXR0b24gXTtcblxuICAgIG9wdGlvbnMuYmFySGVpZ2h0ID0gTWF0aC5tYXgoIGxlZnROb2Rlcy5oZWlnaHQsIHNjb3JlRGlzcGxheS5oZWlnaHQgKSArICggMiAqIG9wdGlvbnMueU1hcmdpbiApO1xuXG4gICAgc3VwZXIoIGxheW91dEJvdW5kcywgdmlzaWJsZUJvdW5kc1Byb3BlcnR5LCBvcHRpb25zICk7XG5cbiAgICAvLyBEeW5hbWljYWxseSBwb3NpdGlvbiBjb21wb25lbnRzIG9uIHRoZSBiYXIuXG4gICAgTXVsdGlsaW5rLm11bHRpbGluayggWyB0aGlzLnBvc2l0aW9uaW5nQm91bmRzUHJvcGVydHksIGxlZnROb2Rlcy5ib3VuZHNQcm9wZXJ0eSwgc3RhcnRPdmVyQnV0dG9uLmJvdW5kc1Byb3BlcnR5IF0sXG4gICAgICAoIHBvc2l0aW9uaW5nQm91bmRzOiBCb3VuZHMyLCBsZWZ0Tm9kZUJvdW5kczogQm91bmRzMiwgc3RhcnRPdmVyQnV0dG9uQm91bmRzOiBCb3VuZHMyICkgPT4ge1xuICAgICAgICBsZWZ0Tm9kZXMubWF4V2lkdGggPSAoIGxheW91dEJvdW5kcy53aWR0aCAtICggMiAqIG9wdGlvbnMueE1hcmdpbiApIC0gc3RhcnRPdmVyQnV0dG9uQm91bmRzLndpZHRoIC0gb3B0aW9ucy54U3BhY2luZyApO1xuICAgICAgICBsZWZ0Tm9kZXMubGVmdCA9IHBvc2l0aW9uaW5nQm91bmRzLmxlZnQ7XG4gICAgICAgIGxlZnROb2Rlcy5jZW50ZXJZID0gcG9zaXRpb25pbmdCb3VuZHMuY2VudGVyWTtcbiAgICAgICAgc3RhcnRPdmVyQnV0dG9uLnJpZ2h0ID0gcG9zaXRpb25pbmdCb3VuZHMucmlnaHQ7XG4gICAgICAgIHN0YXJ0T3ZlckJ1dHRvbi5jZW50ZXJZID0gcG9zaXRpb25pbmdCb3VuZHMuY2VudGVyWTtcbiAgICAgIH0gKTtcblxuICAgIHRoaXMuZGlzcG9zZUZpbml0ZVN0YXR1c0JhciA9ICgpID0+IHtcbiAgICAgIGxldmVsVGV4dC5kaXNwb3NlKCk7XG4gICAgICBjaGFsbGVuZ2VOdW1iZXJUZXh0LmRpc3Bvc2UoKTtcbiAgICAgIHNjb3JlRGlzcGxheS5kaXNwb3NlKCk7XG4gICAgICBlbGFwc2VkVGltZU5vZGUgJiYgZWxhcHNlZFRpbWVOb2RlLmRpc3Bvc2UoKTtcbiAgICAgIHN0YXJ0T3ZlckJ1dHRvbi5kaXNwb3NlKCk7XG4gICAgICBlbGFwc2VkVGltZU5vZGUgJiYgZWxhcHNlZFRpbWVOb2RlLmRpc3Bvc2UoKTtcbiAgICB9O1xuICB9XG5cbiAgcHVibGljIG92ZXJyaWRlIGRpc3Bvc2UoKTogdm9pZCB7XG4gICAgdGhpcy5kaXNwb3NlRmluaXRlU3RhdHVzQmFyKCk7XG4gICAgc3VwZXIuZGlzcG9zZSgpO1xuICB9XG59XG5cbnZlZ2FzLnJlZ2lzdGVyKCAnRmluaXRlU3RhdHVzQmFyJywgRmluaXRlU3RhdHVzQmFyICk7Il0sIm5hbWVzIjpbIkRlcml2ZWRQcm9wZXJ0eSIsIk11bHRpbGluayIsIm9wdGlvbml6ZSIsImNvbWJpbmVPcHRpb25zIiwiU3RyaW5nVXRpbHMiLCJQaGV0Q29sb3JTY2hlbWUiLCJTdGF0dXNCYXIiLCJIQm94IiwiUmVjdGFuZ2xlIiwiVGV4dCIsIlRleHRQdXNoQnV0dG9uIiwiRWxhcHNlZFRpbWVOb2RlIiwiU2NvcmVEaXNwbGF5TGFiZWxlZE51bWJlciIsInZlZ2FzIiwiVmVnYXNTdHJpbmdzIiwiRmluaXRlU3RhdHVzQmFyIiwiZGlzcG9zZSIsImRpc3Bvc2VGaW5pdGVTdGF0dXNCYXIiLCJsYXlvdXRCb3VuZHMiLCJ2aXNpYmxlQm91bmRzUHJvcGVydHkiLCJzY29yZVByb3BlcnR5IiwicHJvdmlkZWRPcHRpb25zIiwib3B0aW9ucyIsImNoYWxsZW5nZUluZGV4UHJvcGVydHkiLCJudW1iZXJPZkNoYWxsZW5nZXNQcm9wZXJ0eSIsImxldmVsUHJvcGVydHkiLCJlbGFwc2VkVGltZVByb3BlcnR5IiwidGltZXJFbmFibGVkUHJvcGVydHkiLCJsZXZlbFZpc2libGUiLCJjaGFsbGVuZ2VOdW1iZXJWaXNpYmxlIiwiZm9udCIsIkRFRkFVTFRfRk9OVCIsInRleHRGaWxsIiwiREVGQVVMVF9URVhUX0ZJTEwiLCJjcmVhdGVTY29yZURpc3BsYXkiLCJzdGFydE92ZXJCdXR0b25UZXh0Iiwic3RhcnRPdmVyU3RyaW5nUHJvcGVydHkiLCJjbG9ja0ljb25SYWRpdXMiLCJ4U3BhY2luZyIsInhNYXJnaW4iLCJ5TWFyZ2luIiwiYmFyRmlsbCIsImJhclN0cm9rZSIsInN0YXJ0T3ZlckJ1dHRvbk9wdGlvbnMiLCJiYXNlQ29sb3IiLCJCVVRUT05fWUVMTE9XIiwibGlzdGVuZXIiLCJfIiwibm9vcCIsInRhbmRlbSIsImNyZWF0ZVRhbmRlbSIsIm1heFdpZHRoIiwid2lkdGgiLCJhc3NlcnQiLCJsZXZlbFRleHRPcHRpb25zIiwiZmlsbCIsImNoYWxsZW5nZVRleHRPcHRpb25zIiwiYmFyTm9kZSIsInN0cm9rZSIsImxlZnRDaGlsZHJlbiIsImxldmVsVGV4dCIsImxldmVsU3RyaW5nUHJvcGVydHkiLCJsYWJlbCIsInBhdHRlcm4iLCJsZXZlbCIsImZvcm1hdCIsInB1c2giLCJjaGFsbGVuZ2VOdW1iZXJUZXh0IiwiY2hhbGxlbmdlTnVtYmVyU3RyaW5nUHJvcGVydHkiLCJjaGFsbGVuZ2VJbmRleCIsIm51bWJlck9mQ2hhbGxlbmdlcyIsInNjb3JlRGlzcGxheSIsImVsYXBzZWRUaW1lTm9kZSIsInZpc2libGVQcm9wZXJ0eSIsInN0YXJ0T3ZlckJ1dHRvbiIsImxlZnROb2RlcyIsImV4Y2x1ZGVJbnZpc2libGVDaGlsZHJlbkZyb21Cb3VuZHMiLCJzcGFjaW5nIiwiY2hpbGRyZW4iLCJiYXJIZWlnaHQiLCJNYXRoIiwibWF4IiwiaGVpZ2h0IiwibXVsdGlsaW5rIiwicG9zaXRpb25pbmdCb3VuZHNQcm9wZXJ0eSIsImJvdW5kc1Byb3BlcnR5IiwicG9zaXRpb25pbmdCb3VuZHMiLCJsZWZ0Tm9kZUJvdW5kcyIsInN0YXJ0T3ZlckJ1dHRvbkJvdW5kcyIsImxlZnQiLCJjZW50ZXJZIiwicmlnaHQiLCJyZWdpc3RlciJdLCJtYXBwaW5ncyI6IkFBQUEsc0RBQXNEO0FBRXREOzs7OztDQUtDLEdBRUQsT0FBT0EscUJBQXFCLG1DQUFtQztBQUMvRCxPQUFPQyxlQUFlLDZCQUE2QjtBQUluRCxPQUFPQyxhQUFhQyxjQUFjLFFBQVEsa0NBQWtDO0FBRTVFLE9BQU9DLGlCQUFpQiwwQ0FBMEM7QUFDbEUsT0FBT0MscUJBQXFCLDJDQUEyQztBQUN2RSxPQUFPQyxlQUFxQyxxQ0FBcUM7QUFDakYsU0FBZUMsSUFBSSxFQUFRQyxTQUFTLEVBQVVDLElBQUksUUFBcUIsOEJBQThCO0FBQ3JHLE9BQU9DLG9CQUErQyx5Q0FBeUM7QUFDL0YsT0FBT0MscUJBQXFCLHVCQUF1QjtBQUNuRCxPQUFPQywrQkFBK0IsaUNBQWlDO0FBQ3ZFLE9BQU9DLFdBQVcsYUFBYTtBQUMvQixPQUFPQyxrQkFBa0Isb0JBQW9CO0FBMkM5QixJQUFBLEFBQU1DLGtCQUFOLE1BQU1BLHdCQUF3QlQ7SUFtSzNCVSxVQUFnQjtRQUM5QixJQUFJLENBQUNDLHNCQUFzQjtRQUMzQixLQUFLLENBQUNEO0lBQ1I7SUFsS0E7Ozs7O0dBS0MsR0FDRCxZQUFvQkUsWUFBcUIsRUFBRUMscUJBQWlELEVBQUVDLGFBQWdDLEVBQzFHQyxlQUF3QyxDQUFHO1lBcUNuREM7UUFuQ1YsTUFBTUEsVUFBVXBCLFlBRU87WUFFckIsY0FBYztZQUNkcUIsd0JBQXdCO1lBQ3hCQyw0QkFBNEI7WUFDNUJDLGVBQWU7WUFDZkMscUJBQXFCO1lBQ3JCQyxzQkFBc0I7WUFDdEJDLGNBQWM7WUFDZEMsd0JBQXdCO1lBQ3hCQyxNQUFNeEIs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