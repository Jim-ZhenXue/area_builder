// Copyright 2018-2024, University of Colorado Boulder
/**
 * a panel that contains controls used to exercise the addition, removal, and disposal of sound generators
 *
 * @author John Blanco
 */ import createObservableArray from '../../../../../axon/js/createObservableArray.js';
import Property from '../../../../../axon/js/Property.js';
import stepTimer from '../../../../../axon/js/stepTimer.js';
import dotRandom from '../../../../../dot/js/dotRandom.js';
import optionize from '../../../../../phet-core/js/optionize.js';
import StringUtils from '../../../../../phetcommon/js/util/StringUtils.js';
import PhetFont from '../../../../../scenery-phet/js/PhetFont.js';
import { HBox, Node, Text, VBox } from '../../../../../scenery/js/imports.js';
import TextPushButton from '../../../../../sun/js/buttons/TextPushButton.js';
import ComboBox from '../../../../../sun/js/ComboBox.js';
import Panel from '../../../../../sun/js/Panel.js';
import birdCall_mp3 from '../../../../sounds/demo-and-test/birdCall_mp3.js';
import cricketsLoop_mp3 from '../../../../sounds/demo-and-test/cricketsLoop_mp3.js';
import PitchedPopGenerator from '../../../sound-generators/PitchedPopGenerator.js';
import SoundClip from '../../../sound-generators/SoundClip.js';
import soundManager from '../../../soundManager.js';
import tambo from '../../../tambo.js';
// constants
const BUTTON_FONT = new PhetFont(18);
const COMBO_BOX_FONT = new PhetFont(16);
const TOTAL_ADDED_TEMPLATE = 'Total Added: {{numSoundGenerators}}';
const ADD_BUTTON_COLOR = '#C0D890';
// info needed for selecting and using different sound generators from the combo box
const SOUND_GENERATOR_INFO = new Map([
    [
        'recordedOneShot',
        {
            comboBoxItemName: 'Recorded one shot',
            createSoundGenerator: ()=>new SoundClip(birdCall_mp3)
        }
    ],
    [
        'recordedLoop',
        {
            comboBoxItemName: 'Recorded loop',
            createSoundGenerator: ()=>new SoundClip(cricketsLoop_mp3, {
                    loop: true
                })
        }
    ],
    [
        'synthesizedSound',
        {
            comboBoxItemName: 'Synthesized sound',
            createSoundGenerator: ()=>new PitchedPopGenerator({
                    numPopGenerators: 2
                })
        }
    ]
]);
let RemoveAndDisposeSoundGeneratorsTestPanel = class RemoveAndDisposeSoundGeneratorsTestPanel extends Panel {
    constructor(providedOptions){
        const options = optionize()({
            fill: '#f5d3b3',
            xMargin: 14,
            yMargin: 14
        }, providedOptions);
        // array of sound generators that have been added and not yet removed and disposed
        const soundGenerators = createObservableArray();
        // node where the content goes, needed so that ComboBox will have a good place to put its list
        const panelContentNode = new Node();
        // informational text that goes at the top of the panel
        const infoText = new Text('Test addition, removal, and disposal of sound generators', {
            font: new PhetFont({
                size: 18,
                weight: 'bold'
            })
        });
        // Create the combo box for selecting the type of sound generator to add.
        const comboBoxItems = [];
        SOUND_GENERATOR_INFO.forEach((soundGenerator, soundGeneratorKey)=>{
            comboBoxItems.push({
                value: soundGeneratorKey,
                createNode: ()=>new Text(soundGenerator.comboBoxItemName, {
                        font: COMBO_BOX_FONT
                    })
            });
        });
        const selectedSoundGeneratorTypeProperty = new Property(comboBoxItems[0].value);
        const comboBox = new ComboBox(selectedSoundGeneratorTypeProperty, comboBoxItems, panelContentNode, {
            buttonFill: 'rgb( 218, 236, 255 )'
        });
        const sgSelectorNode = new HBox({
            children: [
                new Text('SG type to add:', {
                    font: new PhetFont(19)
                }),
                comboBox
            ],
            spacing: 7
        });
        function addSoundGenerators(numberToAdd) {
            _.times(numberToAdd, ()=>{
                const soundGenerator = SOUND_GENERATOR_INFO.get(selectedSoundGeneratorTypeProperty.value).createSoundGenerator();
                soundManager.addSoundGenerator(soundGenerator);
                soundGenerators.push(soundGenerator);
            });
        }
        // create a horizontal set of buttons for adding sound generators at different orders of magnitude
        const addButtonHBox = new HBox({
            children: [
                new TextPushButton('Add 1', {
                    baseColor: ADD_BUTTON_COLOR,
                    font: BUTTON_FONT,
                    listener: ()=>{
                        addSoundGenerators(1);
                    }
                }),
                new TextPushButton('Add 10', {
                    baseColor: ADD_BUTTON_COLOR,
                    font: BUTTON_FONT,
                    listener: ()=>{
                        addSoundGenerators(10);
                    }
                }),
                new TextPushButton('Add 100', {
                    baseColor: ADD_BUTTON_COLOR,
                    font: BUTTON_FONT,
                    listener: ()=>{
                        addSoundGenerators(100);
                    }
                })
            ],
            spacing: 14
        });
        // create a horizontal box with an indicator for the number of sound generators added and a button to remove them all
        const totalAddedIndicator = new Text(TOTAL_ADDED_TEMPLATE, {
            font: new PhetFont(19)
        });
        const removeAllSoundGeneratorsButton = new TextPushButton('Remove All', {
            font: BUTTON_FONT,
            listener: ()=>{
                soundGenerators.clear();
            }
        });
        const showTotalHBox = new HBox({
            children: [
                totalAddedIndicator,
                removeAllSoundGeneratorsButton
            ],
            spacing: 14
        });
        // create a button that will test the most recently added sound generator
        const testLastAddedSGButton = new TextPushButton('Test last added SG', {
            font: BUTTON_FONT,
            baseColor: '#BABFFF',
            listener: ()=>{
                const mostRecentlyAddedSoundGenerator = soundGenerators.get(soundGenerators.length - 1);
                if (mostRecentlyAddedSoundGenerator instanceof SoundClip) {
                    if (mostRecentlyAddedSoundGenerator.loop) {
                        // only start the loop if not already playing
                        if (!mostRecentlyAddedSoundGenerator.isPlaying) {
                            // play the loop for a fixed time and then stop, but make sure the sound generator wasn't removed in the
                            // interim
                            mostRecentlyAddedSoundGenerator.play();
                            stepTimer.setTimeout(()=>{
                                if (soundGenerators.includes(mostRecentlyAddedSoundGenerator)) {
                                    mostRecentlyAddedSoundGenerator.stop();
                                }
                            }, 3000);
                        }
                    } else {
                        // play one-shot sounds whenever the button is pressed
                        mostRecentlyAddedSoundGenerator.play();
                    }
                } else if (mostRecentlyAddedSoundGenerator instanceof PitchedPopGenerator) {
                    mostRecentlyAddedSoundGenerator.playPop(dotRandom.nextDouble());
                }
            }
        });
        // update the total added indicator when the total changes, also the state of the "Remove All" button
        soundGenerators.lengthProperty.link((numSGs)=>{
            totalAddedIndicator.string = StringUtils.fillIn(TOTAL_ADDED_TEMPLATE, {
                numSoundGenerators: numSGs
            });
            testLastAddedSGButton.enabled = numSGs > 0;
            removeAllSoundGeneratorsButton.enabled = numSGs > 0;
        });
        // listen for removal of sound generators from the observable array and remove them from the sound manager
        soundGenerators.addItemRemovedListener((removedSoundGenerator)=>{
            soundManager.removeSoundGenerator(removedSoundGenerator);
            removedSoundGenerator.dispose();
        });
        // add everything to a vertical box
        const rootVBox = new VBox({
            children: [
                infoText,
                sgSelectorNode,
                addButtonHBox,
                showTotalHBox,
                testLastAddedSGButton
            ],
            spacing: 19
        });
        panelContentNode.addChild(rootVBox);
        super(panelContentNode, options);
    }
};
tambo.register('RemoveAndDisposeSoundGeneratorsTestPanel', RemoveAndDisposeSoundGeneratorsTestPanel);
export default RemoveAndDisposeSoundGeneratorsTestPanel;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3RhbWJvL2pzL2RlbW8vdGVzdGluZy92aWV3L1JlbW92ZUFuZERpc3Bvc2VTb3VuZEdlbmVyYXRvcnNUZXN0UGFuZWwudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTgtMjAyNCwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbi8qKlxuICogYSBwYW5lbCB0aGF0IGNvbnRhaW5zIGNvbnRyb2xzIHVzZWQgdG8gZXhlcmNpc2UgdGhlIGFkZGl0aW9uLCByZW1vdmFsLCBhbmQgZGlzcG9zYWwgb2Ygc291bmQgZ2VuZXJhdG9yc1xuICpcbiAqIEBhdXRob3IgSm9obiBCbGFuY29cbiAqL1xuXG5pbXBvcnQgY3JlYXRlT2JzZXJ2YWJsZUFycmF5IGZyb20gJy4uLy4uLy4uLy4uLy4uL2F4b24vanMvY3JlYXRlT2JzZXJ2YWJsZUFycmF5LmpzJztcbmltcG9ydCBQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi8uLi9heG9uL2pzL1Byb3BlcnR5LmpzJztcbmltcG9ydCBzdGVwVGltZXIgZnJvbSAnLi4vLi4vLi4vLi4vLi4vYXhvbi9qcy9zdGVwVGltZXIuanMnO1xuaW1wb3J0IGRvdFJhbmRvbSBmcm9tICcuLi8uLi8uLi8uLi8uLi9kb3QvanMvZG90UmFuZG9tLmpzJztcbmltcG9ydCBvcHRpb25pemUsIHsgRW1wdHlTZWxmT3B0aW9ucyB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9vcHRpb25pemUuanMnO1xuaW1wb3J0IFN0cmluZ1V0aWxzIGZyb20gJy4uLy4uLy4uLy4uLy4uL3BoZXRjb21tb24vanMvdXRpbC9TdHJpbmdVdGlscy5qcyc7XG5pbXBvcnQgUGhldEZvbnQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vc2NlbmVyeS1waGV0L2pzL1BoZXRGb250LmpzJztcbmltcG9ydCB7IEhCb3gsIE5vZGUsIFRleHQsIFZCb3ggfSBmcm9tICcuLi8uLi8uLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xuaW1wb3J0IFRleHRQdXNoQnV0dG9uIGZyb20gJy4uLy4uLy4uLy4uLy4uL3N1bi9qcy9idXR0b25zL1RleHRQdXNoQnV0dG9uLmpzJztcbmltcG9ydCBDb21ib0JveCwgeyBDb21ib0JveEl0ZW0gfSBmcm9tICcuLi8uLi8uLi8uLi8uLi9zdW4vanMvQ29tYm9Cb3guanMnO1xuaW1wb3J0IFBhbmVsLCB7IFBhbmVsT3B0aW9ucyB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3N1bi9qcy9QYW5lbC5qcyc7XG5pbXBvcnQgYmlyZENhbGxfbXAzIGZyb20gJy4uLy4uLy4uLy4uL3NvdW5kcy9kZW1vLWFuZC10ZXN0L2JpcmRDYWxsX21wMy5qcyc7XG5pbXBvcnQgY3JpY2tldHNMb29wX21wMyBmcm9tICcuLi8uLi8uLi8uLi9zb3VuZHMvZGVtby1hbmQtdGVzdC9jcmlja2V0c0xvb3BfbXAzLmpzJztcbmltcG9ydCBQaXRjaGVkUG9wR2VuZXJhdG9yIGZyb20gJy4uLy4uLy4uL3NvdW5kLWdlbmVyYXRvcnMvUGl0Y2hlZFBvcEdlbmVyYXRvci5qcyc7XG5pbXBvcnQgU291bmRDbGlwIGZyb20gJy4uLy4uLy4uL3NvdW5kLWdlbmVyYXRvcnMvU291bmRDbGlwLmpzJztcbmltcG9ydCBTb3VuZEdlbmVyYXRvciBmcm9tICcuLi8uLi8uLi9zb3VuZC1nZW5lcmF0b3JzL1NvdW5kR2VuZXJhdG9yLmpzJztcbmltcG9ydCBzb3VuZE1hbmFnZXIgZnJvbSAnLi4vLi4vLi4vc291bmRNYW5hZ2VyLmpzJztcbmltcG9ydCB0YW1ibyBmcm9tICcuLi8uLi8uLi90YW1iby5qcyc7XG5cbnR5cGUgU2VsZk9wdGlvbnMgPSBFbXB0eVNlbGZPcHRpb25zO1xuZXhwb3J0IHR5cGUgUmVtb3ZlQW5kRGlzcG9zZVNvdW5kR2VuZXJhdG9yc1Rlc3RQYW5lbE9wdGlvbnMgPSBTZWxmT3B0aW9ucyAmIFBhbmVsT3B0aW9ucztcbnR5cGUgU291bmRHZW5lcmF0b3JDb21ib0JveEl0ZW1JbmZvID0ge1xuICBjb21ib0JveEl0ZW1OYW1lOiBzdHJpbmc7XG4gIGNyZWF0ZVNvdW5kR2VuZXJhdG9yOiAoKSA9PiBTb3VuZEdlbmVyYXRvcjtcbn07XG5cbi8vIGNvbnN0YW50c1xuY29uc3QgQlVUVE9OX0ZPTlQgPSBuZXcgUGhldEZvbnQoIDE4ICk7XG5jb25zdCBDT01CT19CT1hfRk9OVCA9IG5ldyBQaGV0Rm9udCggMTYgKTtcbmNvbnN0IFRPVEFMX0FEREVEX1RFTVBMQVRFID0gJ1RvdGFsIEFkZGVkOiB7e251bVNvdW5kR2VuZXJhdG9yc319JztcbmNvbnN0IEFERF9CVVRUT05fQ09MT1IgPSAnI0MwRDg5MCc7XG5cbi8vIGluZm8gbmVlZGVkIGZvciBzZWxlY3RpbmcgYW5kIHVzaW5nIGRpZmZlcmVudCBzb3VuZCBnZW5lcmF0b3JzIGZyb20gdGhlIGNvbWJvIGJveFxuY29uc3QgU09VTkRfR0VORVJBVE9SX0lORk8gPSBuZXcgTWFwPHN0cmluZywgU291bmRHZW5lcmF0b3JDb21ib0JveEl0ZW1JbmZvPiggW1xuICBbXG4gICAgJ3JlY29yZGVkT25lU2hvdCcsXG4gICAge1xuICAgICAgY29tYm9Cb3hJdGVtTmFtZTogJ1JlY29yZGVkIG9uZSBzaG90JyxcbiAgICAgIGNyZWF0ZVNvdW5kR2VuZXJhdG9yOiAoKSA9PiBuZXcgU291bmRDbGlwKCBiaXJkQ2FsbF9tcDMgKVxuICAgIH1cbiAgXSxcbiAgW1xuICAgICdyZWNvcmRlZExvb3AnLFxuICAgIHtcbiAgICAgIGNvbWJvQm94SXRlbU5hbWU6ICdSZWNvcmRlZCBsb29wJyxcbiAgICAgIGNyZWF0ZVNvdW5kR2VuZXJhdG9yOiAoKSA9PiBuZXcgU291bmRDbGlwKCBjcmlja2V0c0xvb3BfbXAzLCB7IGxvb3A6IHRydWUgfSApXG4gICAgfVxuICBdLFxuICBbXG4gICAgJ3N5bnRoZXNpemVkU291bmQnLFxuICAgIHtcbiAgICAgIGNvbWJvQm94SXRlbU5hbWU6ICdTeW50aGVzaXplZCBzb3VuZCcsXG4gICAgICBjcmVhdGVTb3VuZEdlbmVyYXRvcjogKCkgPT4gbmV3IFBpdGNoZWRQb3BHZW5lcmF0b3IoIHsgbnVtUG9wR2VuZXJhdG9yczogMiB9IClcbiAgICB9XG4gIF1cbl0gKTtcblxuY2xhc3MgUmVtb3ZlQW5kRGlzcG9zZVNvdW5kR2VuZXJhdG9yc1Rlc3RQYW5lbCBleHRlbmRzIFBhbmVsIHtcblxuICBwdWJsaWMgY29uc3RydWN0b3IoIHByb3ZpZGVkT3B0aW9ucz86IFJlbW92ZUFuZERpc3Bvc2VTb3VuZEdlbmVyYXRvcnNUZXN0UGFuZWxPcHRpb25zICkge1xuXG4gICAgY29uc3Qgb3B0aW9ucyA9IG9wdGlvbml6ZTxSZW1vdmVBbmREaXNwb3NlU291bmRHZW5lcmF0b3JzVGVzdFBhbmVsT3B0aW9ucywgU2VsZk9wdGlvbnMsIFBhbmVsT3B0aW9ucz4oKSgge1xuICAgICAgZmlsbDogJyNmNWQzYjMnLFxuICAgICAgeE1hcmdpbjogMTQsXG4gICAgICB5TWFyZ2luOiAxNFxuICAgIH0sIHByb3ZpZGVkT3B0aW9ucyApO1xuXG4gICAgLy8gYXJyYXkgb2Ygc291bmQgZ2VuZXJhdG9ycyB0aGF0IGhhdmUgYmVlbiBhZGRlZCBhbmQgbm90IHlldCByZW1vdmVkIGFuZCBkaXNwb3NlZFxuICAgIGNvbnN0IHNvdW5kR2VuZXJhdG9ycyA9IGNyZWF0ZU9ic2VydmFibGVBcnJheTxTb3VuZEdlbmVyYXRvcj4oKTtcblxuICAgIC8vIG5vZGUgd2hlcmUgdGhlIGNvbnRlbnQgZ29lcywgbmVlZGVkIHNvIHRoYXQgQ29tYm9Cb3ggd2lsbCBoYXZlIGEgZ29vZCBwbGFjZSB0byBwdXQgaXRzIGxpc3RcbiAgICBjb25zdCBwYW5lbENvbnRlbnROb2RlID0gbmV3IE5vZGUoKTtcblxuICAgIC8vIGluZm9ybWF0aW9uYWwgdGV4dCB0aGF0IGdvZXMgYXQgdGhlIHRvcCBvZiB0aGUgcGFuZWxcbiAgICBjb25zdCBpbmZvVGV4dCA9IG5ldyBUZXh0KCAnVGVzdCBhZGRpdGlvbiwgcmVtb3ZhbCwgYW5kIGRpc3Bvc2FsIG9mIHNvdW5kIGdlbmVyYXRvcnMnLCB7XG4gICAgICBmb250OiBuZXcgUGhldEZvbnQoIHsgc2l6ZTogMTgsIHdlaWdodDogJ2JvbGQnIH0gKVxuICAgIH0gKTtcblxuICAgIC8vIENyZWF0ZSB0aGUgY29tYm8gYm94IGZvciBzZWxlY3RpbmcgdGhlIHR5cGUgb2Ygc291bmQgZ2VuZXJhdG9yIHRvIGFkZC5cbiAgICBjb25zdCBjb21ib0JveEl0ZW1zOiBDb21ib0JveEl0ZW08c3RyaW5nPltdID0gW107XG4gICAgU09VTkRfR0VORVJBVE9SX0lORk8uZm9yRWFjaCggKCBzb3VuZEdlbmVyYXRvciwgc291bmRHZW5lcmF0b3JLZXkgKSA9PiB7XG4gICAgICBjb21ib0JveEl0ZW1zLnB1c2goIHtcbiAgICAgICAgdmFsdWU6IHNvdW5kR2VuZXJhdG9yS2V5LFxuICAgICAgICBjcmVhdGVOb2RlOiAoKSA9PiBuZXcgVGV4dCggc291bmRHZW5lcmF0b3IuY29tYm9Cb3hJdGVtTmFtZSwgeyBmb250OiBDT01CT19CT1hfRk9OVCB9IClcbiAgICAgIH0gKTtcbiAgICB9ICk7XG4gICAgY29uc3Qgc2VsZWN0ZWRTb3VuZEdlbmVyYXRvclR5cGVQcm9wZXJ0eSA9IG5ldyBQcm9wZXJ0eSggY29tYm9Cb3hJdGVtc1sgMCBdLnZhbHVlICk7XG4gICAgY29uc3QgY29tYm9Cb3ggPSBuZXcgQ29tYm9Cb3goIHNlbGVjdGVkU291bmRHZW5lcmF0b3JUeXBlUHJvcGVydHksIGNvbWJvQm94SXRlbXMsIHBhbmVsQ29udGVudE5vZGUsIHtcbiAgICAgIGJ1dHRvbkZpbGw6ICdyZ2IoIDIxOCwgMjM2LCAyNTUgKSdcbiAgICB9ICk7XG4gICAgY29uc3Qgc2dTZWxlY3Rvck5vZGUgPSBuZXcgSEJveCgge1xuICAgICAgY2hpbGRyZW46IFtcbiAgICAgICAgbmV3IFRleHQoICdTRyB0eXBlIHRvIGFkZDonLCB7IGZvbnQ6IG5ldyBQaGV0Rm9udCggMTkgKSB9ICksXG4gICAgICAgIGNvbWJvQm94XG4gICAgICBdLFxuICAgICAgc3BhY2luZzogN1xuICAgIH0gKTtcblxuICAgIGZ1bmN0aW9uIGFkZFNvdW5kR2VuZXJhdG9ycyggbnVtYmVyVG9BZGQ6IG51bWJlciApOiB2b2lkIHtcbiAgICAgIF8udGltZXMoIG51bWJlclRvQWRkLCAoKSA9PiB7XG4gICAgICAgIGNvbnN0IHNvdW5kR2VuZXJhdG9yID0gU09VTkRfR0VORVJBVE9SX0lORk8uZ2V0KCBzZWxlY3RlZFNvdW5kR2VuZXJhdG9yVHlwZVByb3BlcnR5LnZhbHVlICkhLmNyZWF0ZVNvdW5kR2VuZXJhdG9yKCk7XG4gICAgICAgIHNvdW5kTWFuYWdlci5hZGRTb3VuZEdlbmVyYXRvciggc291bmRHZW5lcmF0b3IgKTtcbiAgICAgICAgc291bmRHZW5lcmF0b3JzLnB1c2goIHNvdW5kR2VuZXJhdG9yICk7XG4gICAgICB9ICk7XG4gICAgfVxuXG4gICAgLy8gY3JlYXRlIGEgaG9yaXpvbnRhbCBzZXQgb2YgYnV0dG9ucyBmb3IgYWRkaW5nIHNvdW5kIGdlbmVyYXRvcnMgYXQgZGlmZmVyZW50IG9yZGVycyBvZiBtYWduaXR1ZGVcbiAgICBjb25zdCBhZGRCdXR0b25IQm94ID0gbmV3IEhCb3goIHtcbiAgICAgIGNoaWxkcmVuOiBbXG4gICAgICAgIG5ldyBUZXh0UHVzaEJ1dHRvbiggJ0FkZCAxJywge1xuICAgICAgICAgIGJhc2VDb2xvcjogQUREX0JVVFRPTl9DT0xPUixcbiAgICAgICAgICBmb250OiBCVVRUT05fRk9OVCxcbiAgICAgICAgICBsaXN0ZW5lcjogKCkgPT4geyBhZGRTb3VuZEdlbmVyYXRvcnMoIDEgKTsgfVxuICAgICAgICB9ICksXG4gICAgICAgIG5ldyBUZXh0UHVzaEJ1dHRvbiggJ0FkZCAxMCcsIHtcbiAgICAgICAgICBiYXNlQ29sb3I6IEFERF9CVVRUT05fQ09MT1IsXG4gICAgICAgICAgZm9udDogQlVUVE9OX0ZPTlQsXG4gICAgICAgICAgbGlzdGVuZXI6ICgpID0+IHsgYWRkU291bmRHZW5lcmF0b3JzKCAxMCApOyB9XG4gICAgICAgIH0gKSxcbiAgICAgICAgbmV3IFRleHRQdXNoQnV0dG9uKCAnQWRkIDEwMCcsIHtcbiAgICAgICAgICBiYXNlQ29sb3I6IEFERF9CVVRUT05fQ09MT1IsXG4gICAgICAgICAgZm9udDogQlVUVE9OX0ZPTlQsXG4gICAgICAgICAgbGlzdGVuZXI6ICgpID0+IHsgYWRkU291bmRHZW5lcmF0b3JzKCAxMDAgKTsgfVxuICAgICAgICB9IClcbiAgICAgIF0sXG4gICAgICBzcGFjaW5nOiAxNFxuICAgIH0gKTtcblxuICAgIC8vIGNyZWF0ZSBhIGhvcml6b250YWwgYm94IHdpdGggYW4gaW5kaWNhdG9yIGZvciB0aGUgbnVtYmVyIG9mIHNvdW5kIGdlbmVyYXRvcnMgYWRkZWQgYW5kIGEgYnV0dG9uIHRvIHJlbW92ZSB0aGVtIGFsbFxuICAgIGNvbnN0IHRvdGFsQWRkZWRJbmRpY2F0b3IgPSBuZXcgVGV4dCggVE9UQUxfQURERURfVEVNUExBVEUsIHsgZm9udDogbmV3IFBoZXRGb250KCAxOSApIH0gKTtcbiAgICBjb25zdCByZW1vdmVBbGxTb3VuZEdlbmVyYXRvcnNCdXR0b24gPSBuZXcgVGV4dFB1c2hCdXR0b24oICdSZW1vdmUgQWxsJywge1xuICAgICAgZm9udDogQlVUVE9OX0ZPTlQsXG4gICAgICBsaXN0ZW5lcjogKCkgPT4geyBzb3VuZEdlbmVyYXRvcnMuY2xlYXIoKTsgfVxuICAgIH0gKTtcbiAgICBjb25zdCBzaG93VG90YWxIQm94ID0gbmV3IEhCb3goIHtcbiAgICAgIGNoaWxkcmVuOiBbXG4gICAgICAgIHRvdGFsQWRkZWRJbmRpY2F0b3IsXG4gICAgICAgIHJlbW92ZUFsbFNvdW5kR2VuZXJhdG9yc0J1dHRvblxuICAgICAgXSxcbiAgICAgIHNwYWNpbmc6IDE0XG4gICAgfSApO1xuXG4gICAgLy8gY3JlYXRlIGEgYnV0dG9uIHRoYXQgd2lsbCB0ZXN0IHRoZSBtb3N0IHJlY2VudGx5IGFkZGVkIHNvdW5kIGdlbmVyYXRvclxuICAgIGNvbnN0IHRlc3RMYXN0QWRkZWRTR0J1dHRvbiA9IG5ldyBUZXh0UHVzaEJ1dHRvbiggJ1Rlc3QgbGFzdCBhZGRlZCBTRycsIHtcbiAgICAgIGZvbnQ6IEJVVFRPTl9GT05ULFxuICAgICAgYmFzZUNvbG9yOiAnI0JBQkZGRicsXG4gICAgICBsaXN0ZW5lcjogKCkgPT4ge1xuICAgICAgICBjb25zdCBtb3N0UmVjZW50bHlBZGRlZFNvdW5kR2VuZXJhdG9yID0gc291bmRHZW5lcmF0b3JzLmdldCggc291bmRHZW5lcmF0b3JzLmxlbmd0aCAtIDEgKTtcblxuICAgICAgICBpZiAoIG1vc3RSZWNlbnRseUFkZGVkU291bmRHZW5lcmF0b3IgaW5zdGFuY2VvZiBTb3VuZENsaXAgKSB7XG4gICAgICAgICAgaWYgKCBtb3N0UmVjZW50bHlBZGRlZFNvdW5kR2VuZXJhdG9yLmxvb3AgKSB7XG5cbiAgICAgICAgICAgIC8vIG9ubHkgc3RhcnQgdGhlIGxvb3AgaWYgbm90IGFscmVhZHkgcGxheWluZ1xuICAgICAgICAgICAgaWYgKCAhbW9zdFJlY2VudGx5QWRkZWRTb3VuZEdlbmVyYXRvci5pc1BsYXlpbmcgKSB7XG5cbiAgICAgICAgICAgICAgLy8gcGxheSB0aGUgbG9vcCBmb3IgYSBmaXhlZCB0aW1lIGFuZCB0aGVuIHN0b3AsIGJ1dCBtYWtlIHN1cmUgdGhlIHNvdW5kIGdlbmVyYXRvciB3YXNuJ3QgcmVtb3ZlZCBpbiB0aGVcbiAgICAgICAgICAgICAgLy8gaW50ZXJpbVxuICAgICAgICAgICAgICBtb3N0UmVjZW50bHlBZGRlZFNvdW5kR2VuZXJhdG9yLnBsYXkoKTtcbiAgICAgICAgICAgICAgc3RlcFRpbWVyLnNldFRpbWVvdXQoICgpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoIHNvdW5kR2VuZXJhdG9ycy5pbmNsdWRlcyggbW9zdFJlY2VudGx5QWRkZWRTb3VuZEdlbmVyYXRvciApICkge1xuICAgICAgICAgICAgICAgICAgbW9zdFJlY2VudGx5QWRkZWRTb3VuZEdlbmVyYXRvci5zdG9wKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9LCAzMDAwICk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIGVsc2Uge1xuXG4gICAgICAgICAgICAvLyBwbGF5IG9uZS1zaG90IHNvdW5kcyB3aGVuZXZlciB0aGUgYnV0dG9uIGlzIHByZXNzZWRcbiAgICAgICAgICAgIG1vc3RSZWNlbnRseUFkZGVkU291bmRHZW5lcmF0b3IucGxheSgpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmICggbW9zdFJlY2VudGx5QWRkZWRTb3VuZEdlbmVyYXRvciBpbnN0YW5jZW9mIFBpdGNoZWRQb3BHZW5lcmF0b3IgKSB7XG4gICAgICAgICAgbW9zdFJlY2VudGx5QWRkZWRTb3VuZEdlbmVyYXRvci5wbGF5UG9wKCBkb3RSYW5kb20ubmV4dERvdWJsZSgpICk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9ICk7XG5cbiAgICAvLyB1cGRhdGUgdGhlIHRvdGFsIGFkZGVkIGluZGljYXRvciB3aGVuIHRoZSB0b3RhbCBjaGFuZ2VzLCBhbHNvIHRoZSBzdGF0ZSBvZiB0aGUgXCJSZW1vdmUgQWxsXCIgYnV0dG9uXG4gICAgc291bmRHZW5lcmF0b3JzLmxlbmd0aFByb3BlcnR5LmxpbmsoIG51bVNHcyA9PiB7XG4gICAgICB0b3RhbEFkZGVkSW5kaWNhdG9yLnN0cmluZyA9IFN0cmluZ1V0aWxzLmZpbGxJbiggVE9UQUxfQURERURfVEVNUExBVEUsIHtcbiAgICAgICAgbnVtU291bmRHZW5lcmF0b3JzOiBudW1TR3NcbiAgICAgIH0gKTtcbiAgICAgIHRlc3RMYXN0QWRkZWRTR0J1dHRvbi5lbmFibGVkID0gbnVtU0dzID4gMDtcbiAgICAgIHJlbW92ZUFsbFNvdW5kR2VuZXJhdG9yc0J1dHRvbi5lbmFibGVkID0gbnVtU0dzID4gMDtcbiAgICB9ICk7XG5cbiAgICAvLyBsaXN0ZW4gZm9yIHJlbW92YWwgb2Ygc291bmQgZ2VuZXJhdG9ycyBmcm9tIHRoZSBvYnNlcnZhYmxlIGFycmF5IGFuZCByZW1vdmUgdGhlbSBmcm9tIHRoZSBzb3VuZCBtYW5hZ2VyXG4gICAgc291bmRHZW5lcmF0b3JzLmFkZEl0ZW1SZW1vdmVkTGlzdGVuZXIoIHJlbW92ZWRTb3VuZEdlbmVyYXRvciA9PiB7XG4gICAgICBzb3VuZE1hbmFnZXIucmVtb3ZlU291bmRHZW5lcmF0b3IoIHJlbW92ZWRTb3VuZEdlbmVyYXRvciApO1xuICAgICAgcmVtb3ZlZFNvdW5kR2VuZXJhdG9yLmRpc3Bvc2UoKTtcbiAgICB9ICk7XG5cbiAgICAvLyBhZGQgZXZlcnl0aGluZyB0byBhIHZlcnRpY2FsIGJveFxuICAgIGNvbnN0IHJvb3RWQm94ID0gbmV3IFZCb3goIHtcbiAgICAgIGNoaWxkcmVuOiBbIGluZm9UZXh0LCBzZ1NlbGVjdG9yTm9kZSwgYWRkQnV0dG9uSEJveCwgc2hvd1RvdGFsSEJveCwgdGVzdExhc3RBZGRlZFNHQnV0dG9uIF0sXG4gICAgICBzcGFjaW5nOiAxOVxuICAgIH0gKTtcblxuICAgIHBhbmVsQ29udGVudE5vZGUuYWRkQ2hpbGQoIHJvb3RWQm94ICk7XG5cbiAgICBzdXBlciggcGFuZWxDb250ZW50Tm9kZSwgb3B0aW9ucyApO1xuICB9XG5cbn1cblxudGFtYm8ucmVnaXN0ZXIoICdSZW1vdmVBbmREaXNwb3NlU291bmRHZW5lcmF0b3JzVGVzdFBhbmVsJywgUmVtb3ZlQW5kRGlzcG9zZVNvdW5kR2VuZXJhdG9yc1Rlc3RQYW5lbCApO1xuXG5leHBvcnQgZGVmYXVsdCBSZW1vdmVBbmREaXNwb3NlU291bmRHZW5lcmF0b3JzVGVzdFBhbmVsOyJdLCJuYW1lcyI6WyJjcmVhdGVPYnNlcnZhYmxlQXJyYXkiLCJQcm9wZXJ0eSIsInN0ZXBUaW1lciIsImRvdFJhbmRvbSIsIm9wdGlvbml6ZSIsIlN0cmluZ1V0aWxzIiwiUGhldEZvbnQiLCJIQm94IiwiTm9kZSIsIlRleHQiLCJWQm94IiwiVGV4dFB1c2hCdXR0b24iLCJDb21ib0JveCIsIlBhbmVsIiwiYmlyZENhbGxfbXAzIiwiY3JpY2tldHNMb29wX21wMyIsIlBpdGNoZWRQb3BHZW5lcmF0b3IiLCJTb3VuZENsaXAiLCJzb3VuZE1hbmFnZXIiLCJ0YW1ibyIsIkJVVFRPTl9GT05UIiwiQ09NQk9fQk9YX0ZPTlQiLCJUT1RBTF9BRERFRF9URU1QTEFURSIsIkFERF9CVVRUT05fQ09MT1IiLCJTT1VORF9HRU5FUkFUT1JfSU5GTyIsIk1hcCIsImNvbWJvQm94SXRlbU5hbWUiLCJjcmVhdGVTb3VuZEdlbmVyYXRvciIsImxvb3AiLCJudW1Qb3BHZW5lcmF0b3JzIiwiUmVtb3ZlQW5kRGlzcG9zZVNvdW5kR2VuZXJhdG9yc1Rlc3RQYW5lbCIsInByb3ZpZGVkT3B0aW9ucyIsIm9wdGlvbnMiLCJmaWxsIiwieE1hcmdpbiIsInlNYXJnaW4iLCJzb3VuZEdlbmVyYXRvcnMiLCJwYW5lbENvbnRlbnROb2RlIiwiaW5mb1RleHQiLCJmb250Iiwic2l6ZSIsIndlaWdodCIsImNvbWJvQm94SXRlbXMiLCJmb3JFYWNoIiwic291bmRHZW5lcmF0b3IiLCJzb3VuZEdlbmVyYXRvcktleSIsInB1c2giLCJ2YWx1ZSIsImNyZWF0ZU5vZGUiLCJzZWxlY3RlZFNvdW5kR2VuZXJhdG9yVHlwZVByb3BlcnR5IiwiY29tYm9Cb3giLCJidXR0b25GaWxsIiwic2dTZWxlY3Rvck5vZGUiLCJjaGlsZHJlbiIsInNwYWNpbmciLCJhZGRTb3VuZEdlbmVyYXRvcnMiLCJudW1iZXJUb0FkZCIsIl8iLCJ0aW1lcyIsImdldCIsImFkZFNvdW5kR2VuZXJhdG9yIiwiYWRkQnV0dG9uSEJveCIsImJhc2VDb2xvciIsImxpc3RlbmVyIiwidG90YWxBZGRlZEluZGljYXRvciIsInJlbW92ZUFsbFNvdW5kR2VuZXJhdG9yc0J1dHRvbiIsImNsZWFyIiwic2hvd1RvdGFsSEJveCIsInRlc3RMYXN0QWRkZWRTR0J1dHRvbiIsIm1vc3RSZWNlbnRseUFkZGVkU291bmRHZW5lcmF0b3IiLCJsZW5ndGgiLCJpc1BsYXlpbmciLCJwbGF5Iiwic2V0VGltZW91dCIsImluY2x1ZGVzIiwic3RvcCIsInBsYXlQb3AiLCJuZXh0RG91YmxlIiwibGVuZ3RoUHJvcGVydHkiLCJsaW5rIiwibnVtU0dzIiwic3RyaW5nIiwiZmlsbEluIiwibnVtU291bmRHZW5lcmF0b3JzIiwiZW5hYmxlZCIsImFkZEl0ZW1SZW1vdmVkTGlzdGVuZXIiLCJyZW1vdmVkU291bmRHZW5lcmF0b3IiLCJyZW1vdmVTb3VuZEdlbmVyYXRvciIsImRpc3Bvc2UiLCJyb290VkJveCIsImFkZENoaWxkIiwicmVnaXN0ZXIiXSwibWFwcGluZ3MiOiJBQUFBLHNEQUFzRDtBQUV0RDs7OztDQUlDLEdBRUQsT0FBT0EsMkJBQTJCLGtEQUFrRDtBQUNwRixPQUFPQyxjQUFjLHFDQUFxQztBQUMxRCxPQUFPQyxlQUFlLHNDQUFzQztBQUM1RCxPQUFPQyxlQUFlLHFDQUFxQztBQUMzRCxPQUFPQyxlQUFxQywyQ0FBMkM7QUFDdkYsT0FBT0MsaUJBQWlCLG1EQUFtRDtBQUMzRSxPQUFPQyxjQUFjLDZDQUE2QztBQUNsRSxTQUFTQyxJQUFJLEVBQUVDLElBQUksRUFBRUMsSUFBSSxFQUFFQyxJQUFJLFFBQVEsdUNBQXVDO0FBQzlFLE9BQU9DLG9CQUFvQixrREFBa0Q7QUFDN0UsT0FBT0MsY0FBZ0Msb0NBQW9DO0FBQzNFLE9BQU9DLFdBQTZCLGlDQUFpQztBQUNyRSxPQUFPQyxrQkFBa0IsbURBQW1EO0FBQzVFLE9BQU9DLHNCQUFzQix1REFBdUQ7QUFDcEYsT0FBT0MseUJBQXlCLG1EQUFtRDtBQUNuRixPQUFPQyxlQUFlLHlDQUF5QztBQUUvRCxPQUFPQyxrQkFBa0IsMkJBQTJCO0FBQ3BELE9BQU9DLFdBQVcsb0JBQW9CO0FBU3RDLFlBQVk7QUFDWixNQUFNQyxjQUFjLElBQUlkLFNBQVU7QUFDbEMsTUFBTWUsaUJBQWlCLElBQUlmLFNBQVU7QUFDckMsTUFBTWdCLHVCQUF1QjtBQUM3QixNQUFNQyxtQkFBbUI7QUFFekIsb0ZBQW9GO0FBQ3BGLE1BQU1DLHVCQUF1QixJQUFJQyxJQUE2QztJQUM1RTtRQUNFO1FBQ0E7WUFDRUMsa0JBQWtCO1lBQ2xCQyxzQkFBc0IsSUFBTSxJQUFJVixVQUFXSDtRQUM3QztLQUNEO0lBQ0Q7UUFDRTtRQUNBO1lBQ0VZLGtCQUFrQjtZQUNsQkMsc0JBQXNCLElBQU0sSUFBSVYsVUFBV0Ysa0JBQWtCO29CQUFFYSxNQUFNO2dCQUFLO1FBQzVFO0tBQ0Q7SUFDRDtRQUNFO1FBQ0E7WUFDRUYsa0JBQWtCO1lBQ2xCQyxzQkFBc0IsSUFBTSxJQUFJWCxvQkFBcUI7b0JBQUVhLGtCQUFrQjtnQkFBRTtRQUM3RTtLQUNEO0NBQ0Y7QUFFRCxJQUFBLEFBQU1DLDJDQUFOLE1BQU1BLGlEQUFpRGpCO0lBRXJELFlBQW9Ca0IsZUFBaUUsQ0FBRztRQUV0RixNQUFNQyxVQUFVNUIsWUFBeUY7WUFDdkc2QixNQUFNO1lBQ05DLFNBQVM7WUFDVEMsU0FBUztRQUNYLEdBQUdKO1FBRUgsa0ZBQWtGO1FBQ2xGLE1BQU1LLGtCQUFrQnBDO1FBRXhCLDhGQUE4RjtRQUM5RixNQUFNcUMsbUJBQW1CLElBQUk3QjtRQUU3Qix1REFBdUQ7UUFDdkQsTUFBTThCLFdBQVcsSUFBSTdCLEtBQU0sNERBQTREO1lBQ3JGOEIsTUFBTSxJQUFJakMsU0FBVTtnQkFBRWtDLE1BQU07Z0JBQUlDLFFBQVE7WUFBTztRQUNqRDtRQUVBLHlFQUF5RTtRQUN6RSxNQUFNQyxnQkFBd0MsRUFBRTtRQUNoRGxCLHFCQUFxQm1CLE9BQU8sQ0FBRSxDQUFFQyxnQkFBZ0JDO1lBQzlDSCxjQUFjSSxJQUFJLENBQUU7Z0JBQ2xCQyxPQUFPRjtnQkFDUEcsWUFBWSxJQUFNLElBQUl2QyxLQUFNbUMsZUFBZWxCLGdCQUFnQixFQUFFO3dCQUFFYSxNQUFNbEI7b0JBQWU7WUFDdEY7UUFDRjtRQUNBLE1BQU00QixxQ0FBcUMsSUFBSWhELFNBQVV5QyxhQUFhLENBQUUsRUFBRyxDQUFDSyxLQUFLO1FBQ2pGLE1BQU1HLFdBQVcsSUFBSXRDLFNBQVVxQyxvQ0FBb0NQLGVBQWVMLGtCQUFrQjtZQUNsR2MsWUFBWTtRQUNkO1FBQ0EsTUFBTUMsaUJBQWlCLElBQUk3QyxLQUFNO1lBQy9COEMsVUFBVTtnQkFDUixJQUFJNUMsS0FBTSxtQkFBbUI7b0JBQUU4QixNQUFNLElBQUlqQyxTQUFVO2dCQUFLO2dCQUN4RDRDO2FBQ0Q7WUFDREksU0FBUztRQUNYO1FBRUEsU0FBU0MsbUJBQW9CQyxXQUFtQjtZQUM5Q0MsRUFBRUMsS0FBSyxDQUFFRixhQUFhO2dCQUNwQixNQUFNWixpQkFBaUJwQixxQkFBcUJtQyxHQUFHLENBQUVWLG1DQUFtQ0YsS0FBSyxFQUFJcEIsb0JBQW9CO2dCQUNqSFQsYUFBYTBDLGlCQUFpQixDQUFFaEI7Z0JBQ2hDUixnQkFBZ0JVLElBQUksQ0FBRUY7WUFDeEI7UUFDRjtRQUVBLGtHQUFrRztRQUNsRyxNQUFNaUIsZ0JBQWdCLElBQUl0RCxLQUFNO1lBQzlCOEMsVUFBVTtnQkFDUixJQUFJMUMsZUFBZ0IsU0FBUztvQkFDM0JtRCxXQUFXdkM7b0JBQ1hnQixNQUFNbkI7b0JBQ04yQyxVQUFVO3dCQUFRUixtQkFBb0I7b0JBQUs7Z0JBQzdDO2dCQUNBLElBQUk1QyxlQUFnQixVQUFVO29CQUM1Qm1ELFdBQVd2QztvQkFDWGdCLE1BQU1uQjtvQkFDTjJDLFVBQVU7d0JBQVFSLG1CQUFvQjtvQkFBTTtnQkFDOUM7Z0JBQ0EsSUFBSTVDLGVBQWdCLFdBQVc7b0JBQzdCbUQsV0FBV3ZDO29CQUNYZ0IsTUFBTW5CO29CQUNOMkMsVUFBVTt3QkFBUVIsbUJBQW9CO29CQUFPO2dCQUMvQzthQUNEO1lBQ0RELFNBQVM7UUFDWDtRQUVBLHFIQUFxSDtRQUNySCxNQUFNVSxzQkFBc0IsSUFBSXZELEtBQU1hLHNCQUFzQjtZQUFFaUIsTUFBTSxJQUFJakMsU0FBVTtRQUFLO1FBQ3ZGLE1BQU0yRCxpQ0FBaUMsSUFBSXRELGVBQWdCLGNBQWM7WUFDdkU0QixNQUFNbkI7WUFDTjJDLFVBQVU7Z0JBQVEzQixnQkFBZ0I4QixLQUFLO1lBQUk7UUFDN0M7UUFDQSxNQUFNQyxnQkFBZ0IsSUFBSTVELEtBQU07WUFDOUI4QyxVQUFVO2dCQUNSVztnQkFDQUM7YUFDRDtZQUNEWCxTQUFTO1FBQ1g7UUFFQSx5RUFBeUU7UUFDekUsTUFBTWMsd0JBQXdCLElBQUl6RCxlQUFnQixzQkFBc0I7WUFDdEU0QixNQUFNbkI7WUFDTjBDLFdBQVc7WUFDWEMsVUFBVTtnQkFDUixNQUFNTSxrQ0FBa0NqQyxnQkFBZ0J1QixHQUFHLENBQUV2QixnQkFBZ0JrQyxNQUFNLEdBQUc7Z0JBRXRGLElBQUtELDJDQUEyQ3BELFdBQVk7b0JBQzFELElBQUtvRCxnQ0FBZ0N6QyxJQUFJLEVBQUc7d0JBRTFDLDZDQUE2Qzt3QkFDN0MsSUFBSyxDQUFDeUMsZ0NBQWdDRSxTQUFTLEVBQUc7NEJBRWhELHdHQUF3Rzs0QkFDeEcsVUFBVTs0QkFDVkYsZ0NBQWdDRyxJQUFJOzRCQUNwQ3RFLFVBQVV1RSxVQUFVLENBQUU7Z0NBQ3BCLElBQUtyQyxnQkFBZ0JzQyxRQUFRLENBQUVMLGtDQUFvQztvQ0FDakVBLGdDQUFnQ00sSUFBSTtnQ0FDdEM7NEJBQ0YsR0FBRzt3QkFDTDtvQkFDRixPQUNLO3dCQUVILHNEQUFzRDt3QkFDdEROLGdDQUFnQ0csSUFBSTtvQkFDdEM7Z0JBQ0YsT0FDSyxJQUFLSCwyQ0FBMkNyRCxxQkFBc0I7b0JBQ3pFcUQsZ0NBQWdDTyxPQUFPLENBQUV6RSxVQUFVMEUsVUFBVTtnQkFDL0Q7WUFDRjtRQUNGO1FBRUEscUdBQXFHO1FBQ3JHekMsZ0JBQWdCMEMsY0FBYyxDQUFDQyxJQUFJLENBQUVDLENBQUFBO1lBQ25DaEIsb0JBQW9CaUIsTUFBTSxHQUFHNUUsWUFBWTZFLE1BQU0sQ0FBRTVELHNCQUFzQjtnQkFDckU2RCxvQkFBb0JIO1lBQ3RCO1lBQ0FaLHNCQUFzQmdCLE9BQU8sR0FBR0osU0FBUztZQUN6Q2YsK0JBQStCbUIsT0FBTyxHQUFHSixTQUFTO1FBQ3BEO1FBRUEsMEdBQTBHO1FBQzFHNUMsZ0JBQWdCaUQsc0JBQXNCLENBQUVDLENBQUFBO1lBQ3RDcEUsYUFBYXFFLG9CQUFvQixDQUFFRDtZQUNuQ0Esc0JBQXNCRSxPQUFPO1FBQy9CO1FBRUEsbUNBQW1DO1FBQ25DLE1BQU1DLFdBQVcsSUFBSS9FLEtBQU07WUFDekIyQyxVQUFVO2dCQUFFZjtnQkFBVWM7Z0JBQWdCUztnQkFBZU07Z0JBQWVDO2FBQXVCO1lBQzNGZCxTQUFTO1FBQ1g7UUFFQWpCLGlCQUFpQnFELFFBQVEsQ0FBRUQ7UUFFM0IsS0FBSyxDQUFFcEQsa0JBQWtCTDtJQUMzQjtBQUVGO0FBRUFiLE1BQU13RSxRQUFRLENBQUUsNENBQTRDN0Q7QUFFNUQsZUFBZUEseUNBQXlDIn0=