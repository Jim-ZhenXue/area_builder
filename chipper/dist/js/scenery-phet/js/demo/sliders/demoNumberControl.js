// Copyright 2022-2024, University of Colorado Boulder
/**
 * Demo for NumberControl
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */ import Property from '../../../../axon/js/Property.js';
import RangeWithValue from '../../../../dot/js/RangeWithValue.js';
import { combineOptions } from '../../../../phet-core/js/optionize.js';
import Orientation from '../../../../phet-core/js/Orientation.js';
import { HBox, Text, VBox } from '../../../../scenery/js/imports.js';
import Checkbox from '../../../../sun/js/Checkbox.js';
import NumberControl from '../../NumberControl.js';
import PhetFont from '../../PhetFont.js';
export default function demoNumberControl(layoutBounds) {
    const weightRange = new RangeWithValue(0, 300, 100);
    // all NumberControls will be synchronized with these Properties
    const weightProperty = new Property(weightRange.defaultValue);
    const enabledProperty = new Property(true);
    // options shared by all NumberControls
    const numberControlOptions = {
        enabledProperty: enabledProperty,
        titleNodeOptions: {
            font: new PhetFont(20)
        },
        numberDisplayOptions: {
            textOptions: {
                font: new PhetFont(20)
            },
            valuePattern: '{0} lbs'
        },
        sliderOptions: {
            majorTicks: [
                {
                    value: weightRange.min,
                    label: new Text(weightRange.min, {
                        font: new PhetFont(20)
                    })
                },
                {
                    value: weightRange.getCenter(),
                    label: new Text(weightRange.getCenter(), {
                        font: new PhetFont(20)
                    })
                },
                {
                    value: weightRange.max,
                    label: new Text(weightRange.max, {
                        font: new PhetFont(20)
                    })
                }
            ],
            minorTickSpacing: 50
        }
    };
    // NumberControl with default layout
    const numberControl1 = new NumberControl('Weight:', weightProperty, weightRange, numberControlOptions);
    // NumberControl with a predefined alternate layout
    const numberControl2 = new NumberControl('Weight:', weightProperty, weightRange, combineOptions({
        layoutFunction: NumberControl.createLayoutFunction2()
    }, numberControlOptions));
    // NumberControl with options provided for a predefined alternate layout
    const numberControl3 = new NumberControl('Weight:', weightProperty, weightRange, combineOptions({
        layoutFunction: NumberControl.createLayoutFunction3({
            alignTitle: 'left'
        })
    }, numberControlOptions));
    // NumberControl with alternate layout provided by the client
    const numberControl4 = new NumberControl('Weight:', weightProperty, weightRange, combineOptions({
        layoutFunction: (titleNode, numberDisplay, slider, leftArrowButton, rightArrowButton)=>{
            assert && assert(leftArrowButton && rightArrowButton);
            return new HBox({
                spacing: 8,
                resize: false,
                children: [
                    titleNode,
                    numberDisplay,
                    leftArrowButton,
                    slider,
                    rightArrowButton
                ]
            });
        }
    }, numberControlOptions));
    const verticalNumberControl = new NumberControl('Weight', weightProperty, weightRange, combineOptions({
        sliderOptions: {
            orientation: Orientation.VERTICAL
        },
        layoutFunction: (titleNode, numberDisplay, slider, leftArrowButton, rightArrowButton)=>{
            assert && assert(leftArrowButton && rightArrowButton);
            return new VBox({
                spacing: 8,
                resize: false,
                align: 'center',
                children: [
                    titleNode,
                    new HBox({
                        children: [
                            leftArrowButton,
                            numberDisplay,
                            rightArrowButton
                        ],
                        spacing: 4
                    }),
                    slider
                ]
            });
        }
    }, numberControlOptions));
    // Checkbox that will disable all NumberControls
    const enabledCheckbox = new Checkbox(enabledProperty, new Text('enabled', {
        font: new PhetFont(20)
    }));
    const vBox = new VBox({
        spacing: 30,
        resize: false,
        children: [
            numberControl1,
            numberControl2,
            numberControl3,
            numberControl4,
            enabledCheckbox
        ]
    });
    return new HBox({
        spacing: 30,
        resize: false,
        children: [
            verticalNumberControl,
            vBox
        ],
        center: layoutBounds.center
    });
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9kZW1vL3NsaWRlcnMvZGVtb051bWJlckNvbnRyb2wudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjItMjAyNCwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbi8qKlxuICogRGVtbyBmb3IgTnVtYmVyQ29udHJvbFxuICpcbiAqIEBhdXRob3IgQ2hyaXMgTWFsbGV5IChQaXhlbFpvb20sIEluYy4pXG4gKi9cblxuaW1wb3J0IFByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvUHJvcGVydHkuanMnO1xuaW1wb3J0IEJvdW5kczIgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL0JvdW5kczIuanMnO1xuaW1wb3J0IFJhbmdlV2l0aFZhbHVlIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9SYW5nZVdpdGhWYWx1ZS5qcyc7XG5pbXBvcnQgeyBjb21iaW5lT3B0aW9ucyB9IGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9vcHRpb25pemUuanMnO1xuaW1wb3J0IE9yaWVudGF0aW9uIGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9PcmllbnRhdGlvbi5qcyc7XG5pbXBvcnQgeyBIQm94LCBOb2RlLCBUZXh0LCBWQm94IH0gZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcbmltcG9ydCBDaGVja2JveCBmcm9tICcuLi8uLi8uLi8uLi9zdW4vanMvQ2hlY2tib3guanMnO1xuaW1wb3J0IE51bWJlckNvbnRyb2wsIHsgTnVtYmVyQ29udHJvbE9wdGlvbnMgfSBmcm9tICcuLi8uLi9OdW1iZXJDb250cm9sLmpzJztcbmltcG9ydCBQaGV0Rm9udCBmcm9tICcuLi8uLi9QaGV0Rm9udC5qcyc7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGRlbW9OdW1iZXJDb250cm9sKCBsYXlvdXRCb3VuZHM6IEJvdW5kczIgKTogTm9kZSB7XG5cbiAgY29uc3Qgd2VpZ2h0UmFuZ2UgPSBuZXcgUmFuZ2VXaXRoVmFsdWUoIDAsIDMwMCwgMTAwICk7XG5cbiAgLy8gYWxsIE51bWJlckNvbnRyb2xzIHdpbGwgYmUgc3luY2hyb25pemVkIHdpdGggdGhlc2UgUHJvcGVydGllc1xuICBjb25zdCB3ZWlnaHRQcm9wZXJ0eSA9IG5ldyBQcm9wZXJ0eSggd2VpZ2h0UmFuZ2UuZGVmYXVsdFZhbHVlICk7XG4gIGNvbnN0IGVuYWJsZWRQcm9wZXJ0eSA9IG5ldyBQcm9wZXJ0eSggdHJ1ZSApO1xuXG4gIC8vIG9wdGlvbnMgc2hhcmVkIGJ5IGFsbCBOdW1iZXJDb250cm9sc1xuICBjb25zdCBudW1iZXJDb250cm9sT3B0aW9uczogTnVtYmVyQ29udHJvbE9wdGlvbnMgPSB7XG4gICAgZW5hYmxlZFByb3BlcnR5OiBlbmFibGVkUHJvcGVydHksXG4gICAgdGl0bGVOb2RlT3B0aW9uczoge1xuICAgICAgZm9udDogbmV3IFBoZXRGb250KCAyMCApXG4gICAgfSxcbiAgICBudW1iZXJEaXNwbGF5T3B0aW9uczoge1xuICAgICAgdGV4dE9wdGlvbnM6IHtcbiAgICAgICAgZm9udDogbmV3IFBoZXRGb250KCAyMCApXG4gICAgICB9LFxuICAgICAgdmFsdWVQYXR0ZXJuOiAnezB9IGxicydcbiAgICB9LFxuICAgIHNsaWRlck9wdGlvbnM6IHtcbiAgICAgIG1ham9yVGlja3M6IFtcbiAgICAgICAgeyB2YWx1ZTogd2VpZ2h0UmFuZ2UubWluLCBsYWJlbDogbmV3IFRleHQoIHdlaWdodFJhbmdlLm1pbiwgeyBmb250OiBuZXcgUGhldEZvbnQoIDIwICkgfSApIH0sXG4gICAgICAgIHsgdmFsdWU6IHdlaWdodFJhbmdlLmdldENlbnRlcigpLCBsYWJlbDogbmV3IFRleHQoIHdlaWdodFJhbmdlLmdldENlbnRlcigpLCB7IGZvbnQ6IG5ldyBQaGV0Rm9udCggMjAgKSB9ICkgfSxcbiAgICAgICAgeyB2YWx1ZTogd2VpZ2h0UmFuZ2UubWF4LCBsYWJlbDogbmV3IFRleHQoIHdlaWdodFJhbmdlLm1heCwgeyBmb250OiBuZXcgUGhldEZvbnQoIDIwICkgfSApIH1cbiAgICAgIF0sXG4gICAgICBtaW5vclRpY2tTcGFjaW5nOiA1MFxuICAgIH1cbiAgfTtcblxuICAvLyBOdW1iZXJDb250cm9sIHdpdGggZGVmYXVsdCBsYXlvdXRcbiAgY29uc3QgbnVtYmVyQ29udHJvbDEgPSBuZXcgTnVtYmVyQ29udHJvbCggJ1dlaWdodDonLCB3ZWlnaHRQcm9wZXJ0eSwgd2VpZ2h0UmFuZ2UsIG51bWJlckNvbnRyb2xPcHRpb25zICk7XG5cbiAgLy8gTnVtYmVyQ29udHJvbCB3aXRoIGEgcHJlZGVmaW5lZCBhbHRlcm5hdGUgbGF5b3V0XG4gIGNvbnN0IG51bWJlckNvbnRyb2wyID0gbmV3IE51bWJlckNvbnRyb2woICdXZWlnaHQ6Jywgd2VpZ2h0UHJvcGVydHksIHdlaWdodFJhbmdlLFxuICAgIGNvbWJpbmVPcHRpb25zPE51bWJlckNvbnRyb2xPcHRpb25zPigge1xuICAgICAgbGF5b3V0RnVuY3Rpb246IE51bWJlckNvbnRyb2wuY3JlYXRlTGF5b3V0RnVuY3Rpb24yKClcbiAgICB9LCBudW1iZXJDb250cm9sT3B0aW9ucyApICk7XG5cbiAgLy8gTnVtYmVyQ29udHJvbCB3aXRoIG9wdGlvbnMgcHJvdmlkZWQgZm9yIGEgcHJlZGVmaW5lZCBhbHRlcm5hdGUgbGF5b3V0XG4gIGNvbnN0IG51bWJlckNvbnRyb2wzID0gbmV3IE51bWJlckNvbnRyb2woICdXZWlnaHQ6Jywgd2VpZ2h0UHJvcGVydHksIHdlaWdodFJhbmdlLFxuICAgIGNvbWJpbmVPcHRpb25zPE51bWJlckNvbnRyb2xPcHRpb25zPigge1xuICAgICAgbGF5b3V0RnVuY3Rpb246IE51bWJlckNvbnRyb2wuY3JlYXRlTGF5b3V0RnVuY3Rpb24zKCB7XG4gICAgICAgIGFsaWduVGl0bGU6ICdsZWZ0J1xuICAgICAgfSApXG4gICAgfSwgbnVtYmVyQ29udHJvbE9wdGlvbnMgKSApO1xuXG4gIC8vIE51bWJlckNvbnRyb2wgd2l0aCBhbHRlcm5hdGUgbGF5b3V0IHByb3ZpZGVkIGJ5IHRoZSBjbGllbnRcbiAgY29uc3QgbnVtYmVyQ29udHJvbDQgPSBuZXcgTnVtYmVyQ29udHJvbCggJ1dlaWdodDonLCB3ZWlnaHRQcm9wZXJ0eSwgd2VpZ2h0UmFuZ2UsXG4gICAgY29tYmluZU9wdGlvbnM8TnVtYmVyQ29udHJvbE9wdGlvbnM+KCB7XG4gICAgICBsYXlvdXRGdW5jdGlvbjogKCB0aXRsZU5vZGUsIG51bWJlckRpc3BsYXksIHNsaWRlciwgbGVmdEFycm93QnV0dG9uLCByaWdodEFycm93QnV0dG9uICkgPT4ge1xuICAgICAgICBhc3NlcnQgJiYgYXNzZXJ0KCBsZWZ0QXJyb3dCdXR0b24gJiYgcmlnaHRBcnJvd0J1dHRvbiApO1xuICAgICAgICByZXR1cm4gbmV3IEhCb3goIHtcbiAgICAgICAgICBzcGFjaW5nOiA4LFxuICAgICAgICAgIHJlc2l6ZTogZmFsc2UsIC8vIHByZXZlbnQgc2xpZGVycyBmcm9tIGNhdXNpbmcgYSByZXNpemUgd2hlbiB0aHVtYiBpcyBhdCBtaW4gb3IgbWF4XG4gICAgICAgICAgY2hpbGRyZW46IFsgdGl0bGVOb2RlLCBudW1iZXJEaXNwbGF5LCBsZWZ0QXJyb3dCdXR0b24hLCBzbGlkZXIsIHJpZ2h0QXJyb3dCdXR0b24hIF1cbiAgICAgICAgfSApO1xuICAgICAgfVxuICAgIH0sIG51bWJlckNvbnRyb2xPcHRpb25zICkgKTtcblxuICBjb25zdCB2ZXJ0aWNhbE51bWJlckNvbnRyb2wgPSBuZXcgTnVtYmVyQ29udHJvbCggJ1dlaWdodCcsIHdlaWdodFByb3BlcnR5LCB3ZWlnaHRSYW5nZSxcbiAgICBjb21iaW5lT3B0aW9uczxOdW1iZXJDb250cm9sT3B0aW9ucz4oIHtcbiAgICAgIHNsaWRlck9wdGlvbnM6IHtcbiAgICAgICAgb3JpZW50YXRpb246IE9yaWVudGF0aW9uLlZFUlRJQ0FMXG4gICAgICB9LFxuICAgICAgbGF5b3V0RnVuY3Rpb246ICggdGl0bGVOb2RlLCBudW1iZXJEaXNwbGF5LCBzbGlkZXIsIGxlZnRBcnJvd0J1dHRvbiwgcmlnaHRBcnJvd0J1dHRvbiApID0+IHtcbiAgICAgICAgYXNzZXJ0ICYmIGFzc2VydCggbGVmdEFycm93QnV0dG9uICYmIHJpZ2h0QXJyb3dCdXR0b24gKTtcbiAgICAgICAgcmV0dXJuIG5ldyBWQm94KCB7XG4gICAgICAgICAgc3BhY2luZzogOCxcbiAgICAgICAgICByZXNpemU6IGZhbHNlLFxuICAgICAgICAgIGFsaWduOiAnY2VudGVyJyxcbiAgICAgICAgICBjaGlsZHJlbjogW1xuICAgICAgICAgICAgdGl0bGVOb2RlLFxuICAgICAgICAgICAgbmV3IEhCb3goIHtcbiAgICAgICAgICAgICAgY2hpbGRyZW46IFsgbGVmdEFycm93QnV0dG9uISwgbnVtYmVyRGlzcGxheSwgcmlnaHRBcnJvd0J1dHRvbiEgXSxcbiAgICAgICAgICAgICAgc3BhY2luZzogNFxuICAgICAgICAgICAgfSApLFxuICAgICAgICAgICAgc2xpZGVyXG4gICAgICAgICAgXVxuICAgICAgICB9ICk7XG4gICAgICB9XG4gICAgfSwgbnVtYmVyQ29udHJvbE9wdGlvbnMgKSApO1xuXG4gIC8vIENoZWNrYm94IHRoYXQgd2lsbCBkaXNhYmxlIGFsbCBOdW1iZXJDb250cm9sc1xuICBjb25zdCBlbmFibGVkQ2hlY2tib3ggPSBuZXcgQ2hlY2tib3goIGVuYWJsZWRQcm9wZXJ0eSwgbmV3IFRleHQoICdlbmFibGVkJywgeyBmb250OiBuZXcgUGhldEZvbnQoIDIwICkgfSApICk7XG5cbiAgY29uc3QgdkJveCA9IG5ldyBWQm94KCB7XG4gICAgc3BhY2luZzogMzAsXG4gICAgcmVzaXplOiBmYWxzZSwgLy8gcHJldmVudCBzbGlkZXJzIGZyb20gY2F1c2luZyBhIHJlc2l6ZSB3aGVuIHRodW1iIGlzIGF0IG1pbiBvciBtYXhcbiAgICBjaGlsZHJlbjogWyBudW1iZXJDb250cm9sMSwgbnVtYmVyQ29udHJvbDIsIG51bWJlckNvbnRyb2wzLCBudW1iZXJDb250cm9sNCwgZW5hYmxlZENoZWNrYm94IF1cbiAgfSApO1xuXG4gIHJldHVybiBuZXcgSEJveCgge1xuICAgIHNwYWNpbmc6IDMwLFxuICAgIHJlc2l6ZTogZmFsc2UsXG4gICAgY2hpbGRyZW46IFsgdmVydGljYWxOdW1iZXJDb250cm9sLCB2Qm94IF0sXG4gICAgY2VudGVyOiBsYXlvdXRCb3VuZHMuY2VudGVyXG4gIH0gKTtcbn0iXSwibmFtZXMiOlsiUHJvcGVydHkiLCJSYW5nZVdpdGhWYWx1ZSIsImNvbWJpbmVPcHRpb25zIiwiT3JpZW50YXRpb24iLCJIQm94IiwiVGV4dCIsIlZCb3giLCJDaGVja2JveCIsIk51bWJlckNvbnRyb2wiLCJQaGV0Rm9udCIsImRlbW9OdW1iZXJDb250cm9sIiwibGF5b3V0Qm91bmRzIiwid2VpZ2h0UmFuZ2UiLCJ3ZWlnaHRQcm9wZXJ0eSIsImRlZmF1bHRWYWx1ZSIsImVuYWJsZWRQcm9wZXJ0eSIsIm51bWJlckNvbnRyb2xPcHRpb25zIiwidGl0bGVOb2RlT3B0aW9ucyIsImZvbnQiLCJudW1iZXJEaXNwbGF5T3B0aW9ucyIsInRleHRPcHRpb25zIiwidmFsdWVQYXR0ZXJuIiwic2xpZGVyT3B0aW9ucyIsIm1ham9yVGlja3MiLCJ2YWx1ZSIsIm1pbiIsImxhYmVsIiwiZ2V0Q2VudGVyIiwibWF4IiwibWlub3JUaWNrU3BhY2luZyIsIm51bWJlckNvbnRyb2wxIiwibnVtYmVyQ29udHJvbDIiLCJsYXlvdXRGdW5jdGlvbiIsImNyZWF0ZUxheW91dEZ1bmN0aW9uMiIsIm51bWJlckNvbnRyb2wzIiwiY3JlYXRlTGF5b3V0RnVuY3Rpb24zIiwiYWxpZ25UaXRsZSIsIm51bWJlckNvbnRyb2w0IiwidGl0bGVOb2RlIiwibnVtYmVyRGlzcGxheSIsInNsaWRlciIsImxlZnRBcnJvd0J1dHRvbiIsInJpZ2h0QXJyb3dCdXR0b24iLCJhc3NlcnQiLCJzcGFjaW5nIiwicmVzaXplIiwiY2hpbGRyZW4iLCJ2ZXJ0aWNhbE51bWJlckNvbnRyb2wiLCJvcmllbnRh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