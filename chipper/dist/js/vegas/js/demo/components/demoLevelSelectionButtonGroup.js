// Copyright 2022-2024, University of Colorado Boulder
/**
 * Demo for LevelSelectionButtonGroup
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */ import NumberProperty from '../../../../axon/js/NumberProperty.js';
import Range from '../../../../dot/js/Range.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { GridBox, HBox, Text, VBox } from '../../../../scenery/js/imports.js';
import HSlider from '../../../../sun/js/HSlider.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import LevelSelectionButtonGroup from '../../LevelSelectionButtonGroup.js';
import ScoreDisplayStars from '../../ScoreDisplayStars.js';
import vegasQueryParameters, { NUMBER_OF_GAME_LEVELS } from '../../vegasQueryParameters.js';
const BUTTON_WIDTH = 75;
const BUTTON_HEIGHT = 75;
export default function demoLevelSelectionButtonGroup(layoutBounds) {
    // Properties used by LevelSelectionButtonGroupItem
    const scoreProperty = new NumberProperty(0, {
        range: new Range(0, 1000)
    });
    // A few examples of LevelSelectionButtonGroup, all wired to scoreProperty
    const singleRowButtonGroup = new SingleRowButtonGroup(scoreProperty);
    const multiRowButtonGroup = new MultiRowButtonGroup(scoreProperty);
    const xButtonGroup = new XButtonGroup(scoreProperty);
    const scoreSlider = new HBox({
        spacing: 10,
        children: [
            new Text('Score: ', {
                font: new PhetFont(20)
            }),
            new HSlider(scoreProperty, scoreProperty.range)
        ]
    });
    return new HBox({
        children: [
            new VBox({
                spacing: 50,
                children: [
                    singleRowButtonGroup,
                    multiRowButtonGroup
                ]
            }),
            new VBox({
                spacing: 50,
                children: [
                    xButtonGroup,
                    scoreSlider
                ]
            })
        ],
        spacing: 100,
        center: layoutBounds.center
    });
}
/**
 * Demonstrates the default layout of LevelSelectionButtonGroup, a single row of buttons.
 */ let SingleRowButtonGroup = class SingleRowButtonGroup extends LevelSelectionButtonGroup {
    constructor(scoreProperty){
        // Describe the buttons. For demonstration purposes, all buttons are associated with the same scoreProperty and
        // bestTimeProperty. In a real game, each level would have its own scoreProperty and bestTimeProperty.
        const items = [];
        for(let level = 1; level <= NUMBER_OF_GAME_LEVELS; level++){
            items.push({
                // The button icon is simply its level number.
                icon: new Text(level, {
                    font: new PhetFont(15)
                }),
                scoreProperty: scoreProperty,
                options: {
                    createScoreDisplay: ()=>new ScoreDisplayStars(scoreProperty, {
                            perfectScore: scoreProperty.range.max
                        })
                }
            });
        }
        super(items, {
            levelSelectionButtonOptions: {
                baseColor: 'pink'
            },
            flowBoxOptions: {
                spacing: 30
            },
            groupButtonWidth: BUTTON_WIDTH,
            groupButtonHeight: BUTTON_HEIGHT,
            gameLevels: vegasQueryParameters.gameLevels,
            tandem: Tandem.OPT_OUT
        });
    }
};
/**
 * Demonstrates how to customize LevelSelectionButtonGroup to provide multiple rows of buttons.
 * Note the use of options preferredWidth, wrap, and justify.
 */ let MultiRowButtonGroup = class MultiRowButtonGroup extends LevelSelectionButtonGroup {
    constructor(scoreProperty){
        // Describe the buttons. For demonstration purposes, all buttons are associated with the same scoreProperty and
        // bestTimeProperty. In a real game, each level would have its own scoreProperty and bestTimeProperty.
        const items = [];
        for(let level = 1; level <= NUMBER_OF_GAME_LEVELS; level++){
            items.push({
                // The button icon is simply its level number.
                icon: new Text(level, {
                    font: new PhetFont(15)
                }),
                scoreProperty: scoreProperty,
                options: {
                    createScoreDisplay: ()=>new ScoreDisplayStars(scoreProperty, {
                            perfectScore: scoreProperty.range.max
                        })
                }
            });
        }
        // constants related to the buttons and their layout
        const buttonsPerRow = 3;
        const buttonLineWidth = 3;
        const xSpacing = 20;
        const ySpacing = 20;
        // preferredWidth is used to limit the width of the FlowBox, so that it displays a maximum number of buttons
        // per row. When combined with wrap:true, this causes buttons to wrap to a new line.
        // It would also be acceptable to set this value empirically.
        const preferredWidth = buttonsPerRow * BUTTON_WIDTH + // width of the buttons
        (buttonsPerRow - 1) * xSpacing + // space between the buttons
        2 * buttonsPerRow * buttonLineWidth; // lineWidth of the buttons
        super(items, {
            levelSelectionButtonOptions: {
                baseColor: 'lightGreen',
                lineWidth: buttonLineWidth
            },
            flowBoxOptions: {
                spacing: xSpacing,
                lineSpacing: ySpacing,
                preferredWidth: preferredWidth,
                wrap: true,
                justify: 'center' // horizontal justification
            },
            groupButtonWidth: BUTTON_WIDTH,
            groupButtonHeight: BUTTON_HEIGHT,
            gameLevels: vegasQueryParameters.gameLevels,
            tandem: Tandem.OPT_OUT
        });
    }
};
/**
 * Demonstrates how to create a custom layout, in this case, an 'X' pattern.
 * Note the use of option createLayoutNode.
 */ let XButtonGroup = class XButtonGroup extends LevelSelectionButtonGroup {
    constructor(scoreProperty){
        // Describe the buttons. For demonstration purposes, all buttons are associated with the same scoreProperty and
        // bestTimeProperty. In a real game, each level would have its own scoreProperty and bestTimeProperty.
        const items = [];
        for(let level = 1; level <= NUMBER_OF_GAME_LEVELS; level++){
            items.push({
                // The button icon is simply its level number.
                icon: new Text(level, {
                    font: new PhetFont(15)
                }),
                scoreProperty: scoreProperty,
                options: {
                    createScoreDisplay: ()=>new ScoreDisplayStars(scoreProperty, {
                            perfectScore: scoreProperty.range.max
                        })
                }
            });
        }
        super(items, {
            levelSelectionButtonOptions: {
                baseColor: 'orange'
            },
            groupButtonWidth: BUTTON_WIDTH,
            groupButtonHeight: BUTTON_HEIGHT,
            // Create a custom layout, not possible via the default FlowBox and flowBoxOptions.
            createLayoutNode: (buttons)=>{
                assert && assert(buttons.length === 5, 'rows option value is hardcoded for 5 levels');
                return new GridBox({
                    xSpacing: 5,
                    ySpacing: 5,
                    // Layout in an X pattern, by making every-other cell empty (null).
                    // We'd never do anything this brute-force in production code, but this is a demo.
                    rows: [
                        [
                            buttons[0],
                            null,
                            buttons[1]
                        ],
                        [
                            null,
                            buttons[2],
                            null
                        ],
                        [
                            buttons[3],
                            null,
                            buttons[4]
                        ]
                    ]
                });
            },
            gameLevels: vegasQueryParameters.gameLevels,
            tandem: Tandem.OPT_OUT
        });
    }
};

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3ZlZ2FzL2pzL2RlbW8vY29tcG9uZW50cy9kZW1vTGV2ZWxTZWxlY3Rpb25CdXR0b25Hcm91cC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAyMi0yMDI0LCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuLyoqXG4gKiBEZW1vIGZvciBMZXZlbFNlbGVjdGlvbkJ1dHRvbkdyb3VwXG4gKlxuICogQGF1dGhvciBDaHJpcyBNYWxsZXkgKFBpeGVsWm9vbSwgSW5jLilcbiAqL1xuXG5pbXBvcnQgTnVtYmVyUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9OdW1iZXJQcm9wZXJ0eS5qcyc7XG5pbXBvcnQgQm91bmRzMiBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvQm91bmRzMi5qcyc7XG5pbXBvcnQgUmFuZ2UgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL1JhbmdlLmpzJztcbmltcG9ydCBQaGV0Rm9udCBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5LXBoZXQvanMvUGhldEZvbnQuanMnO1xuaW1wb3J0IHsgR3JpZEJveCwgSEJveCwgTm9kZSwgVGV4dCwgVkJveCB9IGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XG5pbXBvcnQgSFNsaWRlciBmcm9tICcuLi8uLi8uLi8uLi9zdW4vanMvSFNsaWRlci5qcyc7XG5pbXBvcnQgVGFuZGVtIGZyb20gJy4uLy4uLy4uLy4uL3RhbmRlbS9qcy9UYW5kZW0uanMnO1xuaW1wb3J0IExldmVsU2VsZWN0aW9uQnV0dG9uIGZyb20gJy4uLy4uL0xldmVsU2VsZWN0aW9uQnV0dG9uLmpzJztcbmltcG9ydCBMZXZlbFNlbGVjdGlvbkJ1dHRvbkdyb3VwLCB7IExldmVsU2VsZWN0aW9uQnV0dG9uR3JvdXBJdGVtIH0gZnJvbSAnLi4vLi4vTGV2ZWxTZWxlY3Rpb25CdXR0b25Hcm91cC5qcyc7XG5pbXBvcnQgU2NvcmVEaXNwbGF5U3RhcnMgZnJvbSAnLi4vLi4vU2NvcmVEaXNwbGF5U3RhcnMuanMnO1xuaW1wb3J0IHZlZ2FzUXVlcnlQYXJhbWV0ZXJzLCB7IE5VTUJFUl9PRl9HQU1FX0xFVkVMUyB9IGZyb20gJy4uLy4uL3ZlZ2FzUXVlcnlQYXJhbWV0ZXJzLmpzJztcblxuY29uc3QgQlVUVE9OX1dJRFRIID0gNzU7XG5jb25zdCBCVVRUT05fSEVJR0hUID0gNzU7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGRlbW9MZXZlbFNlbGVjdGlvbkJ1dHRvbkdyb3VwKCBsYXlvdXRCb3VuZHM6IEJvdW5kczIgKTogTm9kZSB7XG5cbiAgLy8gUHJvcGVydGllcyB1c2VkIGJ5IExldmVsU2VsZWN0aW9uQnV0dG9uR3JvdXBJdGVtXG4gIGNvbnN0IHNjb3JlUHJvcGVydHkgPSBuZXcgTnVtYmVyUHJvcGVydHkoIDAsIHtcbiAgICByYW5nZTogbmV3IFJhbmdlKCAwLCAxMDAwIClcbiAgfSApO1xuXG4gIC8vIEEgZmV3IGV4YW1wbGVzIG9mIExldmVsU2VsZWN0aW9uQnV0dG9uR3JvdXAsIGFsbCB3aXJlZCB0byBzY29yZVByb3BlcnR5XG4gIGNvbnN0IHNpbmdsZVJvd0J1dHRvbkdyb3VwID0gbmV3IFNpbmdsZVJvd0J1dHRvbkdyb3VwKCBzY29yZVByb3BlcnR5ICk7XG4gIGNvbnN0IG11bHRpUm93QnV0dG9uR3JvdXAgPSBuZXcgTXVsdGlSb3dCdXR0b25Hcm91cCggc2NvcmVQcm9wZXJ0eSApO1xuICBjb25zdCB4QnV0dG9uR3JvdXAgPSBuZXcgWEJ1dHRvbkdyb3VwKCBzY29yZVByb3BlcnR5ICk7XG5cbiAgY29uc3Qgc2NvcmVTbGlkZXIgPSBuZXcgSEJveCgge1xuICAgIHNwYWNpbmc6IDEwLFxuICAgIGNoaWxkcmVuOiBbXG4gICAgICBuZXcgVGV4dCggJ1Njb3JlOiAnLCB7IGZvbnQ6IG5ldyBQaGV0Rm9udCggMjAgKSB9ICksXG4gICAgICBuZXcgSFNsaWRlciggc2NvcmVQcm9wZXJ0eSwgc2NvcmVQcm9wZXJ0eS5yYW5nZSApXG4gICAgXVxuICB9ICk7XG5cbiAgcmV0dXJuIG5ldyBIQm94KCB7XG4gICAgY2hpbGRyZW46IFtcbiAgICAgIG5ldyBWQm94KCB7XG4gICAgICAgIHNwYWNpbmc6IDUwLFxuICAgICAgICBjaGlsZHJlbjogWyBzaW5nbGVSb3dCdXR0b25Hcm91cCwgbXVsdGlSb3dCdXR0b25Hcm91cCBdXG4gICAgICB9ICksXG4gICAgICBuZXcgVkJveCgge1xuICAgICAgICBzcGFjaW5nOiA1MCxcbiAgICAgICAgY2hpbGRyZW46IFsgeEJ1dHRvbkdyb3VwLCBzY29yZVNsaWRlciBdXG4gICAgICB9IClcbiAgICBdLFxuICAgIHNwYWNpbmc6IDEwMCxcbiAgICBjZW50ZXI6IGxheW91dEJvdW5kcy5jZW50ZXJcbiAgfSApO1xufVxuXG4vKipcbiAqIERlbW9uc3RyYXRlcyB0aGUgZGVmYXVsdCBsYXlvdXQgb2YgTGV2ZWxTZWxlY3Rpb25CdXR0b25Hcm91cCwgYSBzaW5nbGUgcm93IG9mIGJ1dHRvbnMuXG4gKi9cbmNsYXNzIFNpbmdsZVJvd0J1dHRvbkdyb3VwIGV4dGVuZHMgTGV2ZWxTZWxlY3Rpb25CdXR0b25Hcm91cCB7XG5cbiAgcHVibGljIGNvbnN0cnVjdG9yKCBzY29yZVByb3BlcnR5OiBOdW1iZXJQcm9wZXJ0eSApIHtcblxuICAgIC8vIERlc2NyaWJlIHRoZSBidXR0b25zLiBGb3IgZGVtb25zdHJhdGlvbiBwdXJwb3NlcywgYWxsIGJ1dHRvbnMgYXJlIGFzc29jaWF0ZWQgd2l0aCB0aGUgc2FtZSBzY29yZVByb3BlcnR5IGFuZFxuICAgIC8vIGJlc3RUaW1lUHJvcGVydHkuIEluIGEgcmVhbCBnYW1lLCBlYWNoIGxldmVsIHdvdWxkIGhhdmUgaXRzIG93biBzY29yZVByb3BlcnR5IGFuZCBiZXN0VGltZVByb3BlcnR5LlxuICAgIGNvbnN0IGl0ZW1zOiBMZXZlbFNlbGVjdGlvbkJ1dHRvbkdyb3VwSXRlbVtdID0gW107XG4gICAgZm9yICggbGV0IGxldmVsID0gMTsgbGV2ZWwgPD0gTlVNQkVSX09GX0dBTUVfTEVWRUxTOyBsZXZlbCsrICkge1xuICAgICAgaXRlbXMucHVzaCgge1xuXG4gICAgICAgIC8vIFRoZSBidXR0b24gaWNvbiBpcyBzaW1wbHkgaXRzIGxldmVsIG51bWJlci5cbiAgICAgICAgaWNvbjogbmV3IFRleHQoIGxldmVsLCB7IGZvbnQ6IG5ldyBQaGV0Rm9udCggMTUgKSB9ICksXG4gICAgICAgIHNjb3JlUHJvcGVydHk6IHNjb3JlUHJvcGVydHksXG4gICAgICAgIG9wdGlvbnM6IHtcbiAgICAgICAgICBjcmVhdGVTY29yZURpc3BsYXk6ICgpID0+IG5ldyBTY29yZURpc3BsYXlTdGFycyggc2NvcmVQcm9wZXJ0eSwge1xuICAgICAgICAgICAgcGVyZmVjdFNjb3JlOiBzY29yZVByb3BlcnR5LnJhbmdlLm1heFxuICAgICAgICAgIH0gKVxuICAgICAgICB9XG4gICAgICB9ICk7XG4gICAgfVxuXG4gICAgc3VwZXIoIGl0ZW1zLCB7XG4gICAgICBsZXZlbFNlbGVjdGlvbkJ1dHRvbk9wdGlvbnM6IHtcbiAgICAgICAgYmFzZUNvbG9yOiAncGluaydcbiAgICAgIH0sXG4gICAgICBmbG93Qm94T3B0aW9uczoge1xuICAgICAgICBzcGFjaW5nOiAzMFxuICAgICAgfSxcbiAgICAgIGdyb3VwQnV0dG9uV2lkdGg6IEJVVFRPTl9XSURUSCxcbiAgICAgIGdyb3VwQnV0dG9uSGVpZ2h0OiBCVVRUT05fSEVJR0hULFxuICAgICAgZ2FtZUxldmVsczogdmVnYXNRdWVyeVBhcmFtZXRlcnMuZ2FtZUxldmVscyxcbiAgICAgIHRhbmRlbTogVGFuZGVtLk9QVF9PVVRcbiAgICB9ICk7XG4gIH1cbn1cblxuLyoqXG4gKiBEZW1vbnN0cmF0ZXMgaG93IHRvIGN1c3RvbWl6ZSBMZXZlbFNlbGVjdGlvbkJ1dHRvbkdyb3VwIHRvIHByb3ZpZGUgbXVsdGlwbGUgcm93cyBvZiBidXR0b25zLlxuICogTm90ZSB0aGUgdXNlIG9mIG9wdGlvbnMgcHJlZmVycmVkV2lkdGgsIHdyYXAsIGFuZCBqdXN0aWZ5LlxuICovXG5jbGFzcyBNdWx0aVJvd0J1dHRvbkdyb3VwIGV4dGVuZHMgTGV2ZWxTZWxlY3Rpb25CdXR0b25Hcm91cCB7XG5cbiAgcHVibGljIGNvbnN0cnVjdG9yKCBzY29yZVByb3BlcnR5OiBOdW1iZXJQcm9wZXJ0eSApIHtcblxuICAgIC8vIERlc2NyaWJlIHRoZSBidXR0b25zLiBGb3IgZGVtb25zdHJhdGlvbiBwdXJwb3NlcywgYWxsIGJ1dHRvbnMgYXJlIGFzc29jaWF0ZWQgd2l0aCB0aGUgc2FtZSBzY29yZVByb3BlcnR5IGFuZFxuICAgIC8vIGJlc3RUaW1lUHJvcGVydHkuIEluIGEgcmVhbCBnYW1lLCBlYWNoIGxldmVsIHdvdWxkIGhhdmUgaXRzIG93biBzY29yZVByb3BlcnR5IGFuZCBiZXN0VGltZVByb3BlcnR5LlxuICAgIGNvbnN0IGl0ZW1zOiBMZXZlbFNlbGVjdGlvbkJ1dHRvbkdyb3VwSXRlbVtdID0gW107XG4gICAgZm9yICggbGV0IGxldmVsID0gMTsgbGV2ZWwgPD0gTlVNQkVSX09GX0dBTUVfTEVWRUxTOyBsZXZlbCsrICkge1xuICAgICAgaXRlbXMucHVzaCgge1xuXG4gICAgICAgIC8vIFRoZSBidXR0b24gaWNvbiBpcyBzaW1wbHkgaXRzIGxldmVsIG51bWJlci5cbiAgICAgICAgaWNvbjogbmV3IFRleHQoIGxldmVsLCB7IGZvbnQ6IG5ldyBQaGV0Rm9udCggMTUgKSB9ICksXG4gICAgICAgIHNjb3JlUHJvcGVydHk6IHNjb3JlUHJvcGVydHksXG4gICAgICAgIG9wdGlvbnM6IHtcbiAgICAgICAgICBjcmVhdGVTY29yZURpc3BsYXk6ICgpID0+IG5ldyBTY29yZURpc3BsYXlTdGFycyggc2NvcmVQcm9wZXJ0eSwge1xuICAgICAgICAgICAgcGVyZmVjdFNjb3JlOiBzY29yZVByb3BlcnR5LnJhbmdlLm1heFxuICAgICAgICAgIH0gKVxuICAgICAgICB9XG4gICAgICB9ICk7XG4gICAgfVxuXG4gICAgLy8gY29uc3RhbnRzIHJlbGF0ZWQgdG8gdGhlIGJ1dHRvbnMgYW5kIHRoZWlyIGxheW91dFxuICAgIGNvbnN0IGJ1dHRvbnNQZXJSb3cgPSAzO1xuICAgIGNvbnN0IGJ1dHRvbkxpbmVXaWR0aCA9IDM7XG4gICAgY29uc3QgeFNwYWNpbmcgPSAyMDtcbiAgICBjb25zdCB5U3BhY2luZyA9IDIwO1xuXG4gICAgLy8gcHJlZmVycmVkV2lkdGggaXMgdXNlZCB0byBsaW1pdCB0aGUgd2lkdGggb2YgdGhlIEZsb3dCb3gsIHNvIHRoYXQgaXQgZGlzcGxheXMgYSBtYXhpbXVtIG51bWJlciBvZiBidXR0b25zXG4gICAgLy8gcGVyIHJvdy4gV2hlbiBjb21iaW5lZCB3aXRoIHdyYXA6dHJ1ZSwgdGhpcyBjYXVzZXMgYnV0dG9ucyB0byB3cmFwIHRvIGEgbmV3IGxpbmUuXG4gICAgLy8gSXQgd291bGQgYWxzbyBiZSBhY2NlcHRhYmxlIHRvIHNldCB0aGlzIHZhbHVlIGVtcGlyaWNhbGx5LlxuICAgIGNvbnN0IHByZWZlcnJlZFdpZHRoID0gKCBidXR0b25zUGVyUm93ICogQlVUVE9OX1dJRFRIICkgKyAgLy8gd2lkdGggb2YgdGhlIGJ1dHRvbnNcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICggKCBidXR0b25zUGVyUm93IC0gMSApICogeFNwYWNpbmcgKSArIC8vIHNwYWNlIGJldHdlZW4gdGhlIGJ1dHRvbnNcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICggMiAqIGJ1dHRvbnNQZXJSb3cgKiBidXR0b25MaW5lV2lkdGggKTsgLy8gbGluZVdpZHRoIG9mIHRoZSBidXR0b25zXG5cbiAgICBzdXBlciggaXRlbXMsIHtcbiAgICAgIGxldmVsU2VsZWN0aW9uQnV0dG9uT3B0aW9uczoge1xuICAgICAgICBiYXNlQ29sb3I6ICdsaWdodEdyZWVuJyxcbiAgICAgICAgbGluZVdpZHRoOiBidXR0b25MaW5lV2lkdGhcbiAgICAgIH0sXG4gICAgICBmbG93Qm94T3B0aW9uczoge1xuICAgICAgICBzcGFjaW5nOiB4U3BhY2luZywgLy8gaG9yaXpvbnRhbCBzcGFjaW5nXG4gICAgICAgIGxpbmVTcGFjaW5nOiB5U3BhY2luZywgLy8gdmVydGljYWwgc3BhY2luZ1xuICAgICAgICBwcmVmZXJyZWRXaWR0aDogcHJlZmVycmVkV2lkdGgsXG4gICAgICAgIHdyYXA6IHRydWUsIC8vIHN0YXJ0IGEgbmV3IHJvdyB3aGVuIHByZWZlcnJlZFdpZHRoIGlzIHJlYWNoZWRcbiAgICAgICAganVzdGlmeTogJ2NlbnRlcicgLy8gaG9yaXpvbnRhbCBqdXN0aWZpY2F0aW9uXG4gICAgICB9LFxuICAgICAgZ3JvdXBCdXR0b25XaWR0aDogQlVUVE9OX1dJRFRILFxuICAgICAgZ3JvdXBCdXR0b25IZWlnaHQ6IEJVVFRPTl9IRUlHSFQsXG4gICAgICBnYW1lTGV2ZWxzOiB2ZWdhc1F1ZXJ5UGFyYW1ldGVycy5nYW1lTGV2ZWxzLFxuICAgICAgdGFuZGVtOiBUYW5kZW0uT1BUX09VVFxuICAgIH0gKTtcbiAgfVxufVxuXG4vKipcbiAqIERlbW9uc3RyYXRlcyBob3cgdG8gY3JlYXRlIGEgY3VzdG9tIGxheW91dCwgaW4gdGhpcyBjYXNlLCBhbiAnWCcgcGF0dGVybi5cbiAqIE5vdGUgdGhlIHVzZSBvZiBvcHRpb24gY3JlYXRlTGF5b3V0Tm9kZS5cbiAqL1xuY2xhc3MgWEJ1dHRvbkdyb3VwIGV4dGVuZHMgTGV2ZWxTZWxlY3Rpb25CdXR0b25Hcm91cCB7XG5cbiAgcHVibGljIGNvbnN0cnVjdG9yKCBzY29yZVByb3BlcnR5OiBOdW1iZXJQcm9wZXJ0eSApIHtcblxuICAgIC8vIERlc2NyaWJlIHRoZSBidXR0b25zLiBGb3IgZGVtb25zdHJhdGlvbiBwdXJwb3NlcywgYWxsIGJ1dHRvbnMgYXJlIGFzc29jaWF0ZWQgd2l0aCB0aGUgc2FtZSBzY29yZVByb3BlcnR5IGFuZFxuICAgIC8vIGJlc3RUaW1lUHJvcGVydHkuIEluIGEgcmVhbCBnYW1lLCBlYWNoIGxldmVsIHdvdWxkIGhhdmUgaXRzIG93biBzY29yZVByb3BlcnR5IGFuZCBiZXN0VGltZVByb3BlcnR5LlxuICAgIGNvbnN0IGl0ZW1zOiBMZXZlbFNlbGVjdGlvbkJ1dHRvbkdyb3VwSXRlbVtdID0gW107XG4gICAgZm9yICggbGV0IGxldmVsID0gMTsgbGV2ZWwgPD0gTlVNQkVSX09GX0dBTUVfTEVWRUxTOyBsZXZlbCsrICkge1xuICAgICAgaXRlbXMucHVzaCgge1xuXG4gICAgICAgIC8vIFRoZSBidXR0b24gaWNvbiBpcyBzaW1wbHkgaXRzIGxldmVsIG51bWJlci5cbiAgICAgICAgaWNvbjogbmV3IFRleHQoIGxldmVsLCB7IGZvbnQ6IG5ldyBQaGV0Rm9udCggMTUgKSB9ICksXG4gICAgICAgIHNjb3JlUHJvcGVydHk6IHNjb3JlUHJvcGVydHksXG4gICAgICAgIG9wdGlvbnM6IHtcbiAgICAgICAgICBjcmVhdGVTY29yZURpc3BsYXk6ICgpID0+IG5ldyBTY29yZURpc3BsYXlTdGFycyggc2NvcmVQcm9wZXJ0eSwge1xuICAgICAgICAgICAgcGVyZmVjdFNjb3JlOiBzY29yZVByb3BlcnR5LnJhbmdlLm1heFxuICAgICAgICAgIH0gKVxuICAgICAgICB9XG4gICAgICB9ICk7XG4gICAgfVxuXG4gICAgc3VwZXIoIGl0ZW1zLCB7XG4gICAgICBsZXZlbFNlbGVjdGlvbkJ1dHRvbk9wdGlvbnM6IHtcbiAgICAgICAgYmFzZUNvbG9yOiAnb3JhbmdlJ1xuICAgICAgfSxcbiAgICAgIGdyb3VwQnV0dG9uV2lkdGg6IEJVVFRPTl9XSURUSCxcbiAgICAgIGdyb3VwQnV0dG9uSGVpZ2h0OiBCVVRUT05fSEVJR0hULFxuXG4gICAgICAvLyBDcmVhdGUgYSBjdXN0b20gbGF5b3V0LCBub3QgcG9zc2libGUgdmlhIHRoZSBkZWZhdWx0IEZsb3dCb3ggYW5kIGZsb3dCb3hPcHRpb25zLlxuICAgICAgY3JlYXRlTGF5b3V0Tm9kZTogKCBidXR0b25zOiBMZXZlbFNlbGVjdGlvbkJ1dHRvbltdICkgPT4ge1xuICAgICAgICBhc3NlcnQgJiYgYXNzZXJ0KCBidXR0b25zLmxlbmd0aCA9PT0gNSwgJ3Jvd3Mgb3B0aW9uIHZhbHVlIGlzIGhhcmRjb2RlZCBmb3IgNSBsZXZlbHMnICk7XG4gICAgICAgIHJldHVybiBuZXcgR3JpZEJveCgge1xuICAgICAgICAgIHhTcGFjaW5nOiA1LFxuICAgICAgICAgIHlTcGFjaW5nOiA1LFxuXG4gICAgICAgICAgLy8gTGF5b3V0IGluIGFuIFggcGF0dGVybiwgYnkgbWFraW5nIGV2ZXJ5LW90aGVyIGNlbGwgZW1wdHkgKG51bGwpLlxuICAgICAgICAgIC8vIFdlJ2QgbmV2ZXIgZG8gYW55dGhpbmcgdGhpcyBicnV0ZS1mb3JjZSBpbiBwcm9kdWN0aW9uIGNvZGUsIGJ1dCB0aGlzIGlzIGEgZGVtby5cbiAgICAgICAgICByb3dzOiBbXG4gICAgICAgICAgICBbIGJ1dHRvbnNbIDAgXSwgbnVsbCwgYnV0dG9uc1sgMSBdIF0sXG4gICAgICAgICAgICBbIG51bGwsIGJ1dHRvbnNbIDIgXSwgbnVsbCBdLFxuICAgICAgICAgICAgWyBidXR0b25zWyAzIF0sIG51bGwsIGJ1dHRvbnNbIDQgXSBdXG4gICAgICAgICAgXVxuICAgICAgICB9ICk7XG4gICAgICB9LFxuICAgICAgZ2FtZUxldmVsczogdmVnYXNRdWVyeVBhcmFtZXRlcnMuZ2FtZUxldmVscyxcbiAgICAgIHRhbmRlbTogVGFuZGVtLk9QVF9PVVRcbiAgICB9ICk7XG4gIH1cbn0iXSwibmFtZXMiOlsiTnVtYmVyUHJvcGVydHkiLCJSYW5nZSIsIlBoZXRGb250IiwiR3JpZEJveCIsIkhCb3giLCJUZXh0IiwiVkJveCIsIkhTbGlkZXIiLCJUYW5kZW0iLCJMZXZlbFNlbGVjdGlvbkJ1dHRvbkdyb3VwIiwiU2NvcmVEaXNwbGF5U3RhcnMiLCJ2ZWdhc1F1ZXJ5UGFyYW1ldGVycyIsIk5VTUJFUl9PRl9HQU1FX0xFVkVMUyIsIkJVVFRPTl9XSURUSCIsIkJVVFRPTl9IRUlHSFQiLCJkZW1vTGV2ZWxTZWxlY3Rpb25CdXR0b25Hcm91cCIsImxheW91dEJvdW5kcyIsInNjb3JlUHJvcGVydHkiLCJyYW5nZSIsInNpbmdsZVJvd0J1dHRvbkdyb3VwIiwiU2luZ2xlUm93QnV0dG9uR3JvdXAiLCJtdWx0aVJvd0J1dHRvbkdyb3VwIiwiTXVsdGlSb3dCdXR0b25Hcm91cCIsInhCdXR0b25Hcm91cCIsIlhCdXR0b25Hcm91cCIsInNjb3JlU2xpZGVyIiwic3BhY2luZyIsImNoaWxkcmVuIiwiZm9udCIsImNlbnRlciIsIml0ZW1zIiwibGV2ZWwiLCJwdXNoIiwiaWNvbiIsIm9wdGlvbnMiLCJjcmVhdGVTY29yZURpc3BsYXkiLCJwZXJmZWN0U2NvcmUiLCJtYXgiLCJsZXZlbFNlbGVjdGlvbkJ1dHRvbk9wdGlvbnMiLCJiYXNlQ29sb3IiLCJmbG93Qm94T3B0aW9ucyIsImdyb3VwQnV0dG9uV2lkdGgiLCJncm91cEJ1dHRvbkhlaWdodCIsImdhbWVMZXZlbHMiLCJ0YW5kZW0iLCJPUFRfT1VUIiwiYnV0dG9uc1BlclJvdyIsImJ1dHRvbkxpbmVXaWR0aCIsInhTcGFjaW5nIiwieVNwYWNpbmciLCJwcmVmZXJyZWRXaWR0aCIsImxpbmVXaWR0aCIsImxpbmVTcGFjaW5nIiwid3JhcCIsImp1c3RpZnkiLCJjcmVhdGVMYXlvdXROb2RlIiwiYnV0dG9ucyIsImFzc2VydCIsImxlbmd0aCIsInJvd3MiXSwibWFwcGluZ3MiOiJBQUFBLHNEQUFzRDtBQUV0RDs7OztDQUlDLEdBRUQsT0FBT0Esb0JBQW9CLHdDQUF3QztBQUVuRSxPQUFPQyxXQUFXLDhCQUE4QjtBQUNoRCxPQUFPQyxjQUFjLDBDQUEwQztBQUMvRCxTQUFTQyxPQUFPLEVBQUVDLElBQUksRUFBUUMsSUFBSSxFQUFFQyxJQUFJLFFBQVEsb0NBQW9DO0FBQ3BGLE9BQU9DLGFBQWEsZ0NBQWdDO0FBQ3BELE9BQU9DLFlBQVksa0NBQWtDO0FBRXJELE9BQU9DLCtCQUFrRSxxQ0FBcUM7QUFDOUcsT0FBT0MsdUJBQXVCLDZCQUE2QjtBQUMzRCxPQUFPQyx3QkFBd0JDLHFCQUFxQixRQUFRLGdDQUFnQztBQUU1RixNQUFNQyxlQUFlO0FBQ3JCLE1BQU1DLGdCQUFnQjtBQUV0QixlQUFl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