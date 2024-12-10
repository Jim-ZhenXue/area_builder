// Copyright 2022-2024, University of Colorado Boulder
/**
 * SliderSoundTestNode is a Scenery Node that contains a number of sliders with different configurations that are meant
 * to test and demonstrate several variations of sound generation.
 *
 * @author John Blanco (PhET Interactive Simulations)
 */ import NumberProperty from '../../../../../axon/js/NumberProperty.js';
import Range from '../../../../../dot/js/Range.js';
import Utils from '../../../../../dot/js/Utils.js';
import { HBox, Text, VBox } from '../../../../../scenery/js/imports.js';
import HSlider from '../../../../../sun/js/HSlider.js';
import VSlider from '../../../../../sun/js/VSlider.js';
import brightMarimbaShort_mp3 from '../../../../sounds/brightMarimbaShort_mp3.js';
import birdCall_mp3 from '../../../../sounds/demo-and-test/birdCall_mp3.js';
import loonCall_mp3 from '../../../../sounds/demo-and-test/loonCall_mp3.js';
import SoundClipPlayer from '../../../sound-generators/SoundClipPlayer.js';
import ValueChangeSoundPlayer from '../../../sound-generators/ValueChangeSoundPlayer.js';
import tambo from '../../../tambo.js';
import SliderPitchChangeSoundGenerator from './SliderPitchChangeSoundGenerator.js';
const PITCH_CHANGE_SLIDER_VALUE_RANGE = new Range(1, 10);
let SliderSoundTestNode = class SliderSoundTestNode extends HBox {
    constructor(labelFont, center){
        const horizontalSliderSet = new VBox({
            children: [
                // very basic continuous slider with default sound
                new Text('Continuous with Defaults', {
                    font: labelFont
                }),
                new HSlider(new NumberProperty(0), new Range(0, 100)),
                // discrete slider
                new Text('Discrete', {
                    font: labelFont
                }),
                new HSlider(new NumberProperty(0), new Range(0, 5), {
                    constrainValue: (value)=>Utils.roundSymmetric(value),
                    keyboardStep: 1,
                    thumbFill: 'green',
                    thumbFillHighlighted: '#80ff80'
                }),
                // a discrete slider where the values lead to some floating point inaccuracies
                new Text('Discrete with Tricky Values', {
                    font: labelFont
                }),
                new HSlider(new NumberProperty(0), new Range(0, 0.7), {
                    constrainValue: (value)=>Utils.roundToInterval(value, 0.05),
                    keyboardStep: 1,
                    thumbFill: '#6600cc',
                    thumbFillHighlighted: '#b366ff',
                    valueChangeSoundGeneratorOptions: {
                        numberOfMiddleThresholds: Utils.roundSymmetric(0.7 / 0.05) - 1
                    }
                }),
                // slider with custom sound generation, intended to be a little "out there"
                new Text('Crazy Custom Sounds', {
                    font: labelFont
                }),
                new HSlider(new NumberProperty(0), new Range(0, 100), {
                    soundGenerator: new ValueChangeSoundPlayer(new Range(0, 100), {
                        middleMovingUpSoundPlayer: new SoundClipPlayer(brightMarimbaShort_mp3, {
                            soundClipOptions: {
                                initialOutputLevel: 0.2
                            },
                            soundManagerOptions: {
                                categoryName: 'user-interface'
                            }
                        }),
                        middleMovingDownSoundPlayer: new SoundClipPlayer(brightMarimbaShort_mp3, {
                            soundClipOptions: {
                                initialOutputLevel: 0.2,
                                initialPlaybackRate: 0.5
                            },
                            soundManagerOptions: {
                                categoryName: 'user-interface'
                            }
                        }),
                        numberOfMiddleThresholds: 5,
                        minSoundPlayer: new SoundClipPlayer(birdCall_mp3, {
                            soundClipOptions: {
                                initialOutputLevel: 0.2
                            },
                            soundManagerOptions: {
                                categoryName: 'user-interface'
                            }
                        }),
                        maxSoundPlayer: new SoundClipPlayer(loonCall_mp3, {
                            soundClipOptions: {
                                initialOutputLevel: 0.2
                            },
                            soundManagerOptions: {
                                categoryName: 'user-interface'
                            }
                        })
                    }),
                    thumbFill: '#ff6666',
                    thumbFillHighlighted: '#ffb3b3'
                }),
                // slider with a sound generator that changes the middle pitches
                new Text('Custom Sounds - Pitch Changes', {
                    font: labelFont
                }),
                new HSlider(new NumberProperty(0), PITCH_CHANGE_SLIDER_VALUE_RANGE, {
                    thumbFill: '#993366',
                    thumbFillHighlighted: '#CC6699',
                    soundGenerator: new SliderPitchChangeSoundGenerator(PITCH_CHANGE_SLIDER_VALUE_RANGE)
                })
            ],
            spacing: 20
        });
        const verticalSliderSet = new VBox({
            children: [
                // very basic continuous slider with default sound
                new Text('Continuous Vertical', {
                    font: labelFont
                }),
                new VSlider(new NumberProperty(0), new Range(0, 100), {
                    thumbFill: '#AB4E52',
                    thumbFillHighlighted: '#CD9397'
                }),
                // discrete slider
                new Text('Discrete Vertical', {
                    font: labelFont
                }),
                new VSlider(new NumberProperty(0), new Range(0, 5), {
                    constrainValue: (value)=>Utils.roundSymmetric(value),
                    keyboardStep: 1,
                    thumbFill: '#9999FF',
                    thumbFillHighlighted: '#CCCCFF'
                })
            ]
        });
        super({
            children: [
                horizontalSliderSet,
                verticalSliderSet
            ],
            center: center
        });
    }
};
tambo.register('SliderSoundTestNode', SliderSoundTestNode);
export default SliderSoundTestNode;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3RhbWJvL2pzL2RlbW8vdWktY29tcG9uZW50cy92aWV3L1NsaWRlclNvdW5kVGVzdE5vZGUudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjItMjAyNCwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbi8qKlxuICogU2xpZGVyU291bmRUZXN0Tm9kZSBpcyBhIFNjZW5lcnkgTm9kZSB0aGF0IGNvbnRhaW5zIGEgbnVtYmVyIG9mIHNsaWRlcnMgd2l0aCBkaWZmZXJlbnQgY29uZmlndXJhdGlvbnMgdGhhdCBhcmUgbWVhbnRcbiAqIHRvIHRlc3QgYW5kIGRlbW9uc3RyYXRlIHNldmVyYWwgdmFyaWF0aW9ucyBvZiBzb3VuZCBnZW5lcmF0aW9uLlxuICpcbiAqIEBhdXRob3IgSm9obiBCbGFuY28gKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXG4gKi9cblxuaW1wb3J0IE51bWJlclByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uLy4uL2F4b24vanMvTnVtYmVyUHJvcGVydHkuanMnO1xuaW1wb3J0IFJhbmdlIGZyb20gJy4uLy4uLy4uLy4uLy4uL2RvdC9qcy9SYW5nZS5qcyc7XG5pbXBvcnQgVXRpbHMgZnJvbSAnLi4vLi4vLi4vLi4vLi4vZG90L2pzL1V0aWxzLmpzJztcbmltcG9ydCBWZWN0b3IyIGZyb20gJy4uLy4uLy4uLy4uLy4uL2RvdC9qcy9WZWN0b3IyLmpzJztcbmltcG9ydCB7IEZvbnQsIEhCb3gsIFRleHQsIFZCb3ggfSBmcm9tICcuLi8uLi8uLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xuaW1wb3J0IEhTbGlkZXIgZnJvbSAnLi4vLi4vLi4vLi4vLi4vc3VuL2pzL0hTbGlkZXIuanMnO1xuaW1wb3J0IFZTbGlkZXIgZnJvbSAnLi4vLi4vLi4vLi4vLi4vc3VuL2pzL1ZTbGlkZXIuanMnO1xuaW1wb3J0IGJyaWdodE1hcmltYmFTaG9ydF9tcDMgZnJvbSAnLi4vLi4vLi4vLi4vc291bmRzL2JyaWdodE1hcmltYmFTaG9ydF9tcDMuanMnO1xuaW1wb3J0IGJpcmRDYWxsX21wMyBmcm9tICcuLi8uLi8uLi8uLi9zb3VuZHMvZGVtby1hbmQtdGVzdC9iaXJkQ2FsbF9tcDMuanMnO1xuaW1wb3J0IGxvb25DYWxsX21wMyBmcm9tICcuLi8uLi8uLi8uLi9zb3VuZHMvZGVtby1hbmQtdGVzdC9sb29uQ2FsbF9tcDMuanMnO1xuaW1wb3J0IFNvdW5kQ2xpcFBsYXllciBmcm9tICcuLi8uLi8uLi9zb3VuZC1nZW5lcmF0b3JzL1NvdW5kQ2xpcFBsYXllci5qcyc7XG5pbXBvcnQgVmFsdWVDaGFuZ2VTb3VuZFBsYXllciBmcm9tICcuLi8uLi8uLi9zb3VuZC1nZW5lcmF0b3JzL1ZhbHVlQ2hhbmdlU291bmRQbGF5ZXIuanMnO1xuaW1wb3J0IHRhbWJvIGZyb20gJy4uLy4uLy4uL3RhbWJvLmpzJztcbmltcG9ydCBTbGlkZXJQaXRjaENoYW5nZVNvdW5kR2VuZXJhdG9yIGZyb20gJy4vU2xpZGVyUGl0Y2hDaGFuZ2VTb3VuZEdlbmVyYXRvci5qcyc7XG5cbmNvbnN0IFBJVENIX0NIQU5HRV9TTElERVJfVkFMVUVfUkFOR0UgPSBuZXcgUmFuZ2UoIDEsIDEwICk7XG5cbmNsYXNzIFNsaWRlclNvdW5kVGVzdE5vZGUgZXh0ZW5kcyBIQm94IHtcblxuICBwdWJsaWMgY29uc3RydWN0b3IoIGxhYmVsRm9udDogRm9udCwgY2VudGVyOiBWZWN0b3IyICkge1xuXG4gICAgY29uc3QgaG9yaXpvbnRhbFNsaWRlclNldCA9IG5ldyBWQm94KCB7XG4gICAgICBjaGlsZHJlbjogW1xuXG4gICAgICAgIC8vIHZlcnkgYmFzaWMgY29udGludW91cyBzbGlkZXIgd2l0aCBkZWZhdWx0IHNvdW5kXG4gICAgICAgIG5ldyBUZXh0KCAnQ29udGludW91cyB3aXRoIERlZmF1bHRzJywgeyBmb250OiBsYWJlbEZvbnQgfSApLFxuICAgICAgICBuZXcgSFNsaWRlciggbmV3IE51bWJlclByb3BlcnR5KCAwICksIG5ldyBSYW5nZSggMCwgMTAwICkgKSxcblxuICAgICAgICAvLyBkaXNjcmV0ZSBzbGlkZXJcbiAgICAgICAgbmV3IFRleHQoICdEaXNjcmV0ZScsIHsgZm9udDogbGFiZWxGb250IH0gKSxcbiAgICAgICAgbmV3IEhTbGlkZXIoIG5ldyBOdW1iZXJQcm9wZXJ0eSggMCApLCBuZXcgUmFuZ2UoIDAsIDUgKSwge1xuICAgICAgICAgIGNvbnN0cmFpblZhbHVlOiB2YWx1ZSA9PiBVdGlscy5yb3VuZFN5bW1ldHJpYyggdmFsdWUgKSxcbiAgICAgICAgICBrZXlib2FyZFN0ZXA6IDEsXG4gICAgICAgICAgdGh1bWJGaWxsOiAnZ3JlZW4nLFxuICAgICAgICAgIHRodW1iRmlsbEhpZ2hsaWdodGVkOiAnIzgwZmY4MCdcbiAgICAgICAgfSApLFxuXG4gICAgICAgIC8vIGEgZGlzY3JldGUgc2xpZGVyIHdoZXJlIHRoZSB2YWx1ZXMgbGVhZCB0byBzb21lIGZsb2F0aW5nIHBvaW50IGluYWNjdXJhY2llc1xuICAgICAgICBuZXcgVGV4dCggJ0Rpc2NyZXRlIHdpdGggVHJpY2t5IFZhbHVlcycsIHsgZm9udDogbGFiZWxGb250IH0gKSxcbiAgICAgICAgbmV3IEhTbGlkZXIoIG5ldyBOdW1iZXJQcm9wZXJ0eSggMCApLCBuZXcgUmFuZ2UoIDAsIDAuNyApLCB7XG4gICAgICAgICAgY29uc3RyYWluVmFsdWU6IHZhbHVlID0+IFV0aWxzLnJvdW5kVG9JbnRlcnZhbCggdmFsdWUsIDAuMDUgKSxcbiAgICAgICAgICBrZXlib2FyZFN0ZXA6IDEsXG4gICAgICAgICAgdGh1bWJGaWxsOiAnIzY2MDBjYycsXG4gICAgICAgICAgdGh1bWJGaWxsSGlnaGxpZ2h0ZWQ6ICcjYjM2NmZmJyxcbiAgICAgICAgICB2YWx1ZUNoYW5nZVNvdW5kR2VuZXJhdG9yT3B0aW9uczogeyBudW1iZXJPZk1pZGRsZVRocmVzaG9sZHM6IFV0aWxzLnJvdW5kU3ltbWV0cmljKCAwLjcgLyAwLjA1ICkgLSAxIH1cbiAgICAgICAgfSApLFxuXG4gICAgICAgIC8vIHNsaWRlciB3aXRoIGN1c3RvbSBzb3VuZCBnZW5lcmF0aW9uLCBpbnRlbmRlZCB0byBiZSBhIGxpdHRsZSBcIm91dCB0aGVyZVwiXG4gICAgICAgIG5ldyBUZXh0KCAnQ3JhenkgQ3VzdG9tIFNvdW5kcycsIHsgZm9udDogbGFiZWxGb250IH0gKSxcbiAgICAgICAgbmV3IEhTbGlkZXIoIG5ldyBOdW1iZXJQcm9wZXJ0eSggMCApLCBuZXcgUmFuZ2UoIDAsIDEwMCApLCB7XG4gICAgICAgICAgc291bmRHZW5lcmF0b3I6IG5ldyBWYWx1ZUNoYW5nZVNvdW5kUGxheWVyKCBuZXcgUmFuZ2UoIDAsIDEwMCApLCB7XG4gICAgICAgICAgICBtaWRkbGVNb3ZpbmdVcFNvdW5kUGxheWVyOiBuZXcgU291bmRDbGlwUGxheWVyKCBicmlnaHRNYXJpbWJhU2hvcnRfbXAzLCB7XG4gICAgICAgICAgICAgIHNvdW5kQ2xpcE9wdGlvbnM6IHsgaW5pdGlhbE91dHB1dExldmVsOiAwLjIgfSxcbiAgICAgICAgICAgICAgc291bmRNYW5hZ2VyT3B0aW9uczogeyBjYXRlZ29yeU5hbWU6ICd1c2VyLWludGVyZmFjZScgfVxuICAgICAgICAgICAgfSApLFxuICAgICAgICAgICAgbWlkZGxlTW92aW5nRG93blNvdW5kUGxheWVyOiBuZXcgU291bmRDbGlwUGxheWVyKCBicmlnaHRNYXJpbWJhU2hvcnRfbXAzLCB7XG4gICAgICAgICAgICAgIHNvdW5kQ2xpcE9wdGlvbnM6IHsgaW5pdGlhbE91dHB1dExldmVsOiAwLjIsIGluaXRpYWxQbGF5YmFja1JhdGU6IDAuNSB9LFxuICAgICAgICAgICAgICBzb3VuZE1hbmFnZXJPcHRpb25zOiB7IGNhdGVnb3J5TmFtZTogJ3VzZXItaW50ZXJmYWNlJyB9XG4gICAgICAgICAgICB9ICksXG4gICAgICAgICAgICBudW1iZXJPZk1pZGRsZVRocmVzaG9sZHM6IDUsXG4gICAgICAgICAgICBtaW5Tb3VuZFBsYXllcjogbmV3IFNvdW5kQ2xpcFBsYXllciggYmlyZENhbGxfbXAzLCB7XG4gICAgICAgICAgICAgIHNvdW5kQ2xpcE9wdGlvbnM6IHsgaW5pdGlhbE91dHB1dExldmVsOiAwLjIgfSxcbiAgICAgICAgICAgICAgc291bmRNYW5hZ2VyT3B0aW9uczogeyBjYXRlZ29yeU5hbWU6ICd1c2VyLWludGVyZmFjZScgfVxuICAgICAgICAgICAgfSApLFxuICAgICAgICAgICAgbWF4U291bmRQbGF5ZXI6IG5ldyBTb3VuZENsaXBQbGF5ZXIoIGxvb25DYWxsX21wMywge1xuICAgICAgICAgICAgICBzb3VuZENsaXBPcHRpb25zOiB7IGluaXRpYWxPdXRwdXRMZXZlbDogMC4yIH0sXG4gICAgICAgICAgICAgIHNvdW5kTWFuYWdlck9wdGlvbnM6IHsgY2F0ZWdvcnlOYW1lOiAndXNlci1pbnRlcmZhY2UnIH1cbiAgICAgICAgICAgIH0gKVxuICAgICAgICAgIH0gKSxcbiAgICAgICAgICB0aHVtYkZpbGw6ICcjZmY2NjY2JyxcbiAgICAgICAgICB0aHVtYkZpbGxIaWdobGlnaHRlZDogJyNmZmIzYjMnXG4gICAgICAgIH0gKSxcblxuICAgICAgICAvLyBzbGlkZXIgd2l0aCBhIHNvdW5kIGdlbmVyYXRvciB0aGF0IGNoYW5nZXMgdGhlIG1pZGRsZSBwaXRjaGVzXG4gICAgICAgIG5ldyBUZXh0KCAnQ3VzdG9tIFNvdW5kcyAtIFBpdGNoIENoYW5nZXMnLCB7IGZvbnQ6IGxhYmVsRm9udCB9ICksXG4gICAgICAgIG5ldyBIU2xpZGVyKCBuZXcgTnVtYmVyUHJvcGVydHkoIDAgKSwgUElUQ0hfQ0hBTkdFX1NMSURFUl9WQUxVRV9SQU5HRSwge1xuICAgICAgICAgIHRodW1iRmlsbDogJyM5OTMzNjYnLFxuICAgICAgICAgIHRodW1iRmlsbEhpZ2hsaWdodGVkOiAnI0NDNjY5OScsXG4gICAgICAgICAgc291bmRHZW5lcmF0b3I6IG5ldyBTbGlkZXJQaXRjaENoYW5nZVNvdW5kR2VuZXJhdG9yKCBQSVRDSF9DSEFOR0VfU0xJREVSX1ZBTFVFX1JBTkdFIClcbiAgICAgICAgfSApXG4gICAgICBdLFxuICAgICAgc3BhY2luZzogMjBcbiAgICB9ICk7XG5cbiAgICBjb25zdCB2ZXJ0aWNhbFNsaWRlclNldCA9IG5ldyBWQm94KCB7XG4gICAgICBjaGlsZHJlbjogW1xuXG4gICAgICAgIC8vIHZlcnkgYmFzaWMgY29udGludW91cyBzbGlkZXIgd2l0aCBkZWZhdWx0IHNvdW5kXG4gICAgICAgIG5ldyBUZXh0KCAnQ29udGludW91cyBWZXJ0aWNhbCcsIHsgZm9udDogbGFiZWxGb250IH0gKSxcbiAgICAgICAgbmV3IFZTbGlkZXIoIG5ldyBOdW1iZXJQcm9wZXJ0eSggMCApLCBuZXcgUmFuZ2UoIDAsIDEwMCApLCB7XG4gICAgICAgICAgdGh1bWJGaWxsOiAnI0FCNEU1MicsXG4gICAgICAgICAgdGh1bWJGaWxsSGlnaGxpZ2h0ZWQ6ICcjQ0Q5Mzk3J1xuICAgICAgICB9ICksXG5cbiAgICAgICAgLy8gZGlzY3JldGUgc2xpZGVyXG4gICAgICAgIG5ldyBUZXh0KCAnRGlzY3JldGUgVmVydGljYWwnLCB7IGZvbnQ6IGxhYmVsRm9udCB9ICksXG4gICAgICAgIG5ldyBWU2xpZGVyKCBuZXcgTnVtYmVyUHJvcGVydHkoIDAgKSwgbmV3IFJhbmdlKCAwLCA1ICksIHtcbiAgICAgICAgICBjb25zdHJhaW5WYWx1ZTogdmFsdWUgPT4gVXRpbHMucm91bmRTeW1tZXRyaWMoIHZhbHVlICksXG4gICAgICAgICAga2V5Ym9hcmRTdGVwOiAxLFxuICAgICAgICAgIHRodW1iRmlsbDogJyM5OTk5RkYnLFxuICAgICAgICAgIHRodW1iRmlsbEhpZ2hsaWdodGVkOiAnI0NDQ0NGRidcbiAgICAgICAgfSApXG4gICAgICBdXG4gICAgfSApO1xuXG4gICAgc3VwZXIoIHtcbiAgICAgIGNoaWxkcmVuOiBbIGhvcml6b250YWxTbGlkZXJTZXQsIHZlcnRpY2FsU2xpZGVyU2V0IF0sXG4gICAgICBjZW50ZXI6IGNlbnRlclxuICAgIH0gKTtcbiAgfVxufVxuXG50YW1iby5yZWdpc3RlciggJ1NsaWRlclNvdW5kVGVzdE5vZGUnLCBTbGlkZXJTb3VuZFRlc3ROb2RlICk7XG5cbmV4cG9ydCBkZWZhdWx0IFNsaWRlclNvdW5kVGVzdE5vZGU7Il0sIm5hbWVzIjpbIk51bWJlclByb3BlcnR5IiwiUmFuZ2UiLCJVdGlscyIsIkhCb3giLCJUZXh0IiwiVkJveCIsIkhTbGlkZXIiLCJWU2xpZGVyIiwiYnJpZ2h0TWFyaW1iYVNob3J0X21wMyIsImJpcmRDYWxsX21wMyIsImxvb25DYWxsX21wMyIsIlNvdW5kQ2xpcFBsYXllciIsIlZhbHVlQ2hhbmdlU291bmRQbGF5ZXIiLCJ0YW1ibyIsIlNsaWRlclBpdGNoQ2hhbmdlU291bmRHZW5lcmF0b3IiLCJQSVRDSF9DSEFOR0VfU0xJREVSX1ZBTFVFX1JBTkdFIiwiU2xpZGVyU291bmRUZXN0Tm9kZSIsImxhYmVsRm9udCIsImNlbnRlciIsImhvcml6b250YWxTbGlkZXJTZXQiLCJjaGlsZHJlbiIsImZvbnQiLCJjb25zdHJhaW5WYWx1ZSIsInZhbHVlIiwicm91bmRTeW1tZXRyaWMiLCJrZXlib2FyZFN0ZXAiLCJ0aHVtYkZpbGwiLCJ0aHVtYkZpbGxIaWdobGlnaHRlZCIsInJvdW5kVG9JbnRlcnZhbCIsInZhbHVlQ2hhbmdlU291bmRHZW5lcmF0b3JPcHRpb25zIiwibnVtYmVyT2ZNaWRkbGVUaHJlc2hvbGRzIiwic291bmRHZW5lcmF0b3IiLCJtaWRkbGVNb3ZpbmdVcFNvdW5kUGxheWVyIiwic291bmRDbGlwT3B0aW9ucyIsImluaXRpYWxPdXRwdXRMZXZlbCIsInNvdW5kTWFuYWdlck9wdGlvbnMiLCJjYXRlZ29yeU5hbWUiLCJtaWRkbGVNb3ZpbmdEb3duU291bmRQbGF5ZXIiLCJpbml0aWFsUGxheWJhY2tSYXRlIiwibWluU291bmRQbGF5ZXIiLCJtYXhTb3VuZFBsYXllciIsInNwYWNpbmciLCJ2ZXJ0aWNhbFNsaWRlclNldCIsInJlZ2lzdGVyIl0sIm1hcHBpbmdzIjoiQUFBQSxzREFBc0Q7QUFFdEQ7Ozs7O0NBS0MsR0FFRCxPQUFPQSxvQkFBb0IsMkNBQTJDO0FBQ3RFLE9BQU9DLFdBQVcsaUNBQWlDO0FBQ25ELE9BQU9DLFdBQVcsaUNBQWlDO0FBRW5ELFNBQWVDLElBQUksRUFBRUMsSUFBSSxFQUFFQyxJQUFJLFFBQVEsdUNBQXVDO0FBQzlFLE9BQU9DLGFBQWEsbUNBQW1DO0FBQ3ZELE9BQU9DLGFBQWEsbUNBQW1DO0FBQ3ZELE9BQU9DLDRCQUE0QiwrQ0FBK0M7QUFDbEYsT0FBT0Msa0JBQWtCLG1EQUFtRDtBQUM1RSxPQUFPQyxrQkFBa0IsbURBQW1EO0FBQzVFLE9BQU9DLHFCQUFxQiwrQ0FBK0M7QUFDM0UsT0FBT0MsNEJBQTRCLHNEQUFzRDtBQUN6RixPQUFPQyxXQUFXLG9CQUFvQjtBQUN0QyxPQUFPQyxxQ0FBcUMsdUNBQXVDO0FBRW5GLE1BQU1DLGtDQUFrQyxJQUFJZCxNQUFPLEdBQUc7QUFFdEQsSUFBQSxBQUFNZSxzQkFBTixNQUFNQSw0QkFBNEJiO0lBRWhDLFlBQW9CYyxTQUFlLEVBQUVDLE1BQWUsQ0FBRztRQUVyRCxNQUFNQyxzQkFBc0IsSUFBSWQsS0FBTTtZQUNwQ2UsVUFBVTtnQkFFUixrREFBa0Q7Z0JBQ2xELElBQUloQixLQUFNLDRCQUE0QjtvQkFBRWlCLE1BQU1KO2dCQUFVO2dCQUN4RCxJQUFJWCxRQUFTLElBQUlOLGVBQWdCLElBQUssSUFBSUMsTUFBTyxHQUFHO2dCQUVwRCxrQkFBa0I7Z0JBQ2xCLElBQUlHLEtBQU0sWUFBWTtvQkFBRWlCLE1BQU1KO2dCQUFVO2dCQUN4QyxJQUFJWCxRQUFTLElBQUlOLGVBQWdCLElBQUssSUFBSUMsTUFBTyxHQUFHLElBQUs7b0JBQ3ZEcUIsZ0JBQWdCQyxDQUFBQSxRQUFTckIsTUFBTXNCLGNBQWMsQ0FBRUQ7b0JBQy9DRSxjQUFjO29CQUNkQyxXQUFXO29CQUNYQyxzQkFBc0I7Z0JBQ3hCO2dCQUVBLDhFQUE4RTtnQkFDOUUsSUFBSXZCLEtBQU0sK0JBQStCO29CQUFFaUIsTUFBTUo7Z0JBQVU7Z0JBQzNELElBQUlYLFFBQVMsSUFBSU4sZUFBZ0IsSUFBSyxJQUFJQyxNQUFPLEdBQUcsTUFBTztvQkFDekRxQixnQkFBZ0JDLENBQUFBLFFBQVNyQixNQUFNMEIsZUFBZSxDQUFFTCxPQUFPO29CQUN2REUsY0FBYztvQkFDZEMsV0FBVztvQkFDWEMsc0JBQXNCO29CQUN0QkUsa0NBQWtDO3dCQUFFQywwQkFBMEI1QixNQUFNc0IsY0FBYyxDQUFFLE1BQU0sUUFBUztvQkFBRTtnQkFDdkc7Z0JBRUEsMkVBQTJFO2dCQUMzRSxJQUFJcEIsS0FBTSx1QkFBdUI7b0JBQUVpQixNQUFNSjtnQkFBVTtnQkFDbkQsSUFBSVgsUUFBUyxJQUFJTixlQUFnQixJQUFLLElBQUlDLE1BQU8sR0FBRyxNQUFPO29CQUN6RDhCLGdCQUFnQixJQUFJbkIsdUJBQXdCLElBQUlYLE1BQU8sR0FBRyxNQUFPO3dCQUMvRCtCLDJCQUEyQixJQUFJckIsZ0JBQWlCSCx3QkFBd0I7NEJBQ3RFeUIsa0JBQWtCO2dDQUFFQyxvQkFBb0I7NEJBQUk7NEJBQzVDQyxxQkFBcUI7Z0NBQUVDLGNBQWM7NEJBQWlCO3dCQUN4RDt3QkFDQUMsNkJBQTZCLElBQUkxQixnQkFBaUJILHdCQUF3Qjs0QkFDeEV5QixrQkFBa0I7Z0NBQUVDLG9CQUFvQjtnQ0FBS0kscUJBQXFCOzRCQUFJOzRCQUN0RUgscUJBQXFCO2dDQUFFQyxjQUFjOzRCQUFpQjt3QkFDeEQ7d0JBQ0FOLDBCQUEwQjt3QkFDMUJTLGdCQUFnQixJQUFJNUIsZ0JBQWlCRixjQUFjOzRCQUNqRHdCLGtCQUFrQjtnQ0FBRUMsb0JBQW9COzRCQUFJOzRCQUM1Q0MscUJBQXFCO2dDQUFFQyxjQUFjOzRCQUFpQjt3QkFDeEQ7d0JBQ0FJLGdCQUFnQixJQUFJN0IsZ0JBQWlCRCxjQUFjOzRCQUNqRHVCLGtCQUFrQjtnQ0FBRUMsb0JBQW9COzRCQUFJOzRCQUM1Q0MscUJBQXFCO2dDQUFFQyxjQUFjOzRCQUFpQjt3QkFDeEQ7b0JBQ0Y7b0JBQ0FWLFdBQVc7b0JBQ1hDLHNCQUFzQjtnQkFDeEI7Z0JBRUEsZ0VBQWdFO2dCQUNoRSxJQUFJdkIsS0FBTSxpQ0FBaUM7b0JBQUVpQixNQUFNSjtnQkFBVTtnQkFDN0QsSUFBSVgsUUFBUyxJQUFJTixlQUFnQixJQUFLZSxpQ0FBaUM7b0JBQ3JFVyxXQUFXO29CQUNYQyxzQkFBc0I7b0JBQ3RCSSxnQkFBZ0IsSUFBSWpCLGdDQUFpQ0M7Z0JBQ3ZEO2FBQ0Q7WUFDRDBCLFNBQVM7UUFDWDtRQUVBLE1BQU1DLG9CQUFvQixJQUFJckMsS0FBTTtZQUNsQ2UsVUFBVTtnQkFFUixrREFBa0Q7Z0JBQ2xELElBQUloQixLQUFNLHVCQUF1QjtvQkFBRWlCLE1BQU1KO2dCQUFVO2dCQUNuRCxJQUFJVixRQUFTLElBQUlQLGVBQWdCLElBQUssSUFBSUMsTUFBTyxHQUFHLE1BQU87b0JBQ3pEeUIsV0FBVztvQkFDWEMsc0JBQXNCO2dCQUN4QjtnQkFFQSxrQkFBa0I7Z0JBQ2xCLElBQUl2QixLQUFNLHFCQUFxQjtvQkFBRWlCLE1BQU1KO2dCQUFVO2dCQUNqRCxJQUFJVixRQUFTLElBQUlQLGVBQWdCLElBQUssSUFBSUMsTUFBTyxHQUFHLElBQUs7b0JBQ3ZEcUIsZ0JBQWdCQyxDQUFBQSxRQUFTckIsTUFBTXNCLGNBQWMsQ0FBRUQ7b0JBQy9DRSxjQUFjO29CQUNkQyxXQUFXO29CQUNYQyxzQkFBc0I7Z0JBQ3hCO2FBQ0Q7UUFDSDtRQUVBLEtBQUssQ0FBRTtZQUNMUCxVQUFVO2dCQUFFRDtnQkFBcUJ1QjthQUFtQjtZQUNwRHhCLFFBQVFBO1FBQ1Y7SUFDRjtBQUNGO0FBRUFMLE1BQU04QixRQUFRLENBQUUsdUJBQXVCM0I7QUFFdkMsZUFBZUEsb0JBQW9CIn0=