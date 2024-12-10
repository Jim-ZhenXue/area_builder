// Copyright 2018-2024, University of Colorado Boulder
/**
 * view for a screen that allows testing and demonstration of various sound components and behaviors
 *
 * @author John Blanco (PhET Interactive Simulations)
 */ import BooleanProperty from '../../../../../axon/js/BooleanProperty.js';
import Emitter from '../../../../../axon/js/Emitter.js';
import stepTimer from '../../../../../axon/js/stepTimer.js';
import merge from '../../../../../phet-core/js/merge.js';
import ResetAllButton from '../../../../../scenery-phet/js/buttons/ResetAllButton.js';
import PhetFont from '../../../../../scenery-phet/js/PhetFont.js';
import { HBox, Image, Node, Text, VBox } from '../../../../../scenery/js/imports.js';
import TextPushButton from '../../../../../sun/js/buttons/TextPushButton.js';
import Checkbox from '../../../../../sun/js/Checkbox.js';
import DemosScreenView from '../../../../../sun/js/demo/DemosScreenView.js';
import Panel from '../../../../../sun/js/Panel.js';
import lightning_png from '../../../../images/lightning_png.js';
import checkboxChecked_mp3 from '../../../../sounds/checkboxChecked_mp3.js';
import loonCall_mp3 from '../../../../sounds/demo-and-test/loonCall_mp3.js';
import rhodesChord_mp3 from '../../../../sounds/demo-and-test/rhodesChord_mp3.js';
import thunder_mp3 from '../../../../sounds/demo-and-test/thunder_mp3.js';
import emptyApartmentBedroom06Resampled_mp3 from '../../../../sounds/emptyApartmentBedroom06Resampled_mp3.js';
import nullSoundPlayer from '../../../nullSoundPlayer.js';
import phetAudioContext from '../../../phetAudioContext.js';
import SoundClip from '../../../sound-generators/SoundClip.js';
import SoundLevelEnum from '../../../SoundLevelEnum.js';
import soundManager from '../../../soundManager.js';
import tambo from '../../../tambo.js';
import AmplitudeModulatorDemoNode from './AmplitudeModulatorDemoNode.js';
import CompositeSoundClipTestNode from './CompositeSoundClipTestNode.js';
import ContinuousPropertySoundClipTestNode from './ContinuousPropertySoundClipTestNode.js';
import RemoveAndDisposeSoundGeneratorsTestPanel from './RemoveAndDisposeSoundGeneratorsTestPanel.js';
import SoundClipChordTestNode from './SoundClipChordTestNode.js';
// constants
const CHECKBOX_SIZE = 16;
const FONT = new PhetFont(16);
const LIGHTNING_SHOWN_TIME = 0.750; // in seconds
let TestingScreenView = class TestingScreenView extends DemosScreenView {
    step(dt) {
        this.stepEmitter.emit(dt);
    }
    constructor(){
        // step emitter, needed by some of the demos
        const stepEmitter = new Emitter({
            parameters: [
                {
                    valueType: 'number'
                }
            ]
        });
        // demo items, selected via the combo box in the parent class
        const demos = [
            {
                label: 'AmplitudeModulatorTest',
                createNode: (layoutBounds)=>new AmplitudeModulatorDemoNode({
                        center: layoutBounds.center
                    })
            },
            {
                label: 'AdditionalAudioNodesTestNode',
                createNode: (layoutBounds)=>new AdditionalAudioNodesTestNode({
                        center: layoutBounds.center
                    })
            },
            {
                label: 'BasicAndExtraSounds',
                createNode: (layoutBounds)=>new BasicAndExtraSoundTestNode({
                        center: layoutBounds.center
                    })
            },
            {
                label: 'ContinuousPropertySoundClipTest',
                createNode: (layoutBounds)=>new ContinuousPropertySoundClipTestNode(stepEmitter, {
                        center: layoutBounds.center
                    })
            },
            {
                label: 'CompositeSoundClipTestNode',
                createNode: (layoutBounds)=>new CompositeSoundClipTestNode({
                        center: layoutBounds.center
                    })
            },
            {
                label: 'RemoveAndDisposeSoundGenerators',
                createNode: (layoutBounds)=>new RemoveAndDisposeSoundGeneratorsTestPanel({
                        center: layoutBounds.center
                    })
            },
            {
                label: 'LongSoundTest',
                createNode: (layoutBounds)=>new LongSoundTestPanel({
                        center: layoutBounds.center
                    })
            },
            {
                label: 'SoundClipChordTestNode',
                createNode: (layoutBounds)=>new SoundClipChordTestNode({
                        center: layoutBounds.center
                    })
            }
        ];
        super(demos);
        this.stepEmitter = stepEmitter;
        // add the reset all button
        const resetAllButton = new ResetAllButton({
            right: this.layoutBounds.maxX - 25,
            bottom: this.layoutBounds.maxY - 25
        });
        this.addChild(resetAllButton);
    }
};
/**
 * a node with two buttons, the 2nd of which only produces sound when in 'extra sound' mode
 */ let BasicAndExtraSoundTestNode = class BasicAndExtraSoundTestNode extends VBox {
    /**
   * Release references to avoid memory leaks.
   */ dispose() {
        this.disposeBasicAndExtraSoundTestNode();
        super.dispose();
    }
    constructor(options){
        // sound clips to be played
        const loonCallSoundClip = new SoundClip(loonCall_mp3);
        soundManager.addSoundGenerator(loonCallSoundClip);
        const rhodesChordSoundClip = new SoundClip(rhodesChord_mp3, {
            sonificationLevel: SoundLevelEnum.EXTRA
        });
        soundManager.addSoundGenerator(rhodesChordSoundClip);
        // add a button to play a basic-mode sound
        const playBasicSoundButton = new TextPushButton('Play Basic-Level Sound', {
            baseColor: '#aad6cc',
            font: new PhetFont(16),
            soundPlayer: loonCallSoundClip
        });
        // add button to play extra-mode sound
        const playExtraSoundButton = new TextPushButton('Play Extra-Level Sound', {
            baseColor: '#DBB1CD',
            font: new PhetFont(16),
            soundPlayer: rhodesChordSoundClip
        });
        super(merge({
            children: [
                playBasicSoundButton,
                playExtraSoundButton
            ],
            spacing: 20
        }, options));
        // dispose function
        this.disposeBasicAndExtraSoundTestNode = ()=>{
            soundManager.removeSoundGenerator(loonCallSoundClip);
            loonCallSoundClip.dispose();
            soundManager.removeSoundGenerator(rhodesChordSoundClip);
            rhodesChordSoundClip.dispose();
        };
    }
};
/**
 * A node with buttons for playing sounds in conjunction with reverb nodes.
 */ let AdditionalAudioNodesTestNode = class AdditionalAudioNodesTestNode extends VBox {
    /**
   * Release references to avoid memory leaks.
   */ dispose() {
        this.disposeBasicAndExtraSoundTestNode();
        super.dispose();
    }
    constructor(options){
        // convolver node, which will be used to create the reverb effect
        const convolver = phetAudioContext.createConvolver();
        convolver.buffer = emptyApartmentBedroom06Resampled_mp3.audioBufferProperty.value;
        // sound clips to be played
        const shortSoundNormal = new SoundClip(checkboxChecked_mp3);
        soundManager.addSoundGenerator(shortSoundNormal);
        const shortSoundWithReverb = new SoundClip(checkboxChecked_mp3, {
            additionalAudioNodes: [
                convolver
            ]
        });
        soundManager.addSoundGenerator(shortSoundWithReverb);
        // font for all buttons
        const buttonFont = new PhetFont(16);
        // add a button to play the plain sound
        const playNormalSoundButton = new TextPushButton('Normal Sound Clip', {
            baseColor: '#CCFF00',
            font: buttonFont,
            soundPlayer: shortSoundNormal
        });
        // add button to play the sound with the reverb added in the signal path
        const playSoundWithInsertedAudioNodeButton = new TextPushButton('Same Clip with In-Line Reverb Node', {
            baseColor: '#CC99FF',
            font: buttonFont,
            soundPlayer: shortSoundWithReverb
        });
        // add button to play both sounds at the same time
        const playBothSounds = new TextPushButton('Both Clips Simultaneously', {
            baseColor: '#FF9999',
            font: buttonFont,
            soundPlayer: nullSoundPlayer,
            listener: ()=>{
                shortSoundNormal.play();
                shortSoundWithReverb.play();
            }
        });
        super(merge({
            children: [
                playNormalSoundButton,
                playSoundWithInsertedAudioNodeButton,
                playBothSounds
            ],
            spacing: 20
        }, options));
        // dispose function
        this.disposeBasicAndExtraSoundTestNode = ()=>{
            soundManager.removeSoundGenerator(shortSoundNormal);
            shortSoundNormal.dispose();
            soundManager.removeSoundGenerator(shortSoundWithReverb);
            shortSoundWithReverb.dispose();
        };
    }
};
/**
 * LongSoundTestPanel is a node that contains a button that produces a long sound, and tests how that sound behaves
 * when things happen like a reset or a disable while sound is in progress.
 */ let LongSoundTestPanel = class LongSoundTestPanel extends Node {
    /**
   * release memory to avoid leaks
   */ dispose() {
        this.disposeLongSoundTestPanel();
        super.dispose();
    }
    constructor(options){
        // internal state variables
        const lightningBoltVisibleProperty = new BooleanProperty(false);
        let lightningBoltVisibleTimeout = null;
        // timeout function
        const timeoutFiredListener = ()=>{
            lightningBoltVisibleProperty.set(false);
            lightningBoltVisibleTimeout = null;
        };
        // button that will trigger thunder and lightning
        const fireLightningButton = new TextPushButton('Lightning', {
            font: FONT,
            listener: ()=>{
                assert && assert(lightningBoltVisibleTimeout === null, 'timer should not be running when this fires');
                lightningBoltVisibleProperty.value = true;
                lightningBoltVisibleTimeout = stepTimer.setTimeout(timeoutFiredListener, LIGHTNING_SHOWN_TIME * 1000);
            },
            soundPlayer: nullSoundPlayer
        });
        // disable the button while lightning is visible
        lightningBoltVisibleProperty.link((lightningBoltVisible)=>{
            fireLightningButton.enabled = !lightningBoltVisible;
        });
        const thunderSoundEnabledProperty = new BooleanProperty(true);
        // sound generator for thunder
        const thunderSoundClip = new SoundClip(thunder_mp3, {
            enabledProperty: thunderSoundEnabledProperty,
            initiateWhenDisabled: true,
            associatedViewNode: fireLightningButton
        });
        soundManager.addSoundGenerator(thunderSoundClip);
        lightningBoltVisibleProperty.link((visible)=>{
            if (visible) {
                thunderSoundClip.play();
            }
        });
        // check box that controls whether the thunderSoundClip sound is locally enabled
        const thunderEnabledCheckbox = new Checkbox(thunderSoundEnabledProperty, new Text('Enabled', {
            font: FONT
        }), {
            boxWidth: CHECKBOX_SIZE
        });
        // check box that controls whether the thunderSoundClip sound can be initiated when disabled
        const initiateThunderWhenDisabledProperty = new BooleanProperty(thunderSoundClip.initiateWhenDisabled);
        initiateThunderWhenDisabledProperty.linkAttribute(thunderSoundClip, 'initiateWhenDisabled');
        const initiateThunderWhenDisabledCheckbox = new Checkbox(initiateThunderWhenDisabledProperty, new Text('Initiate when disabled', {
            font: FONT
        }), {
            boxWidth: CHECKBOX_SIZE
        });
        // lay out the set of controls for the thunderSoundClip
        const thunderControl = new VBox({
            children: [
                new Text('Thunder: ', {
                    font: new PhetFont(16)
                }),
                thunderEnabledCheckbox,
                initiateThunderWhenDisabledCheckbox
            ],
            align: 'left',
            spacing: 8
        });
        // panel where thunderSoundClip and lightning are controlled
        const lightningControlPanel = new Panel(new HBox({
            children: [
                fireLightningButton,
                thunderControl
            ],
            spacing: 14,
            align: 'top'
        }), {
            xMargin: 10,
            yMargin: 8,
            fill: '#FCFBE3'
        });
        // add the lightning bolt that will appear when commanded by the user (and make him/her feel like Zeus)
        const lightningBoltNode = new Image(lightning_png, {
            left: lightningControlPanel.left + 25,
            top: lightningControlPanel.bottom - 3,
            maxHeight: 50
        });
        // only show the lightning when the model indicates - this is done after the panel is created so the layout works
        lightningBoltVisibleProperty.linkAttribute(lightningBoltNode, 'visible');
        super(merge({
            children: [
                lightningBoltNode,
                lightningControlPanel
            ]
        }, options));
        // handle reset
        const resetHandler = ()=>{
            stepTimer.clearTimeout(timeoutFiredListener);
        };
        ResetAllButton.isResettingAllProperty.link(resetHandler);
        // dispose function
        this.disposeLongSoundTestPanel = ()=>{
            ResetAllButton.isResettingAllProperty.unlink(resetHandler);
            soundManager.removeSoundGenerator(thunderSoundClip);
            lightningBoltVisibleTimeout && stepTimer.clearTimeout(lightningBoltVisibleTimeout);
        };
    }
};
tambo.register('TestingScreenView', TestingScreenView);
export default TestingScreenView;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3RhbWJvL2pzL2RlbW8vdGVzdGluZy92aWV3L1Rlc3RpbmdTY3JlZW5WaWV3LnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE4LTIwMjQsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIHZpZXcgZm9yIGEgc2NyZWVuIHRoYXQgYWxsb3dzIHRlc3RpbmcgYW5kIGRlbW9uc3RyYXRpb24gb2YgdmFyaW91cyBzb3VuZCBjb21wb25lbnRzIGFuZCBiZWhhdmlvcnNcbiAqXG4gKiBAYXV0aG9yIEpvaG4gQmxhbmNvIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxuICovXG5cbmltcG9ydCBCb29sZWFuUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vLi4vYXhvbi9qcy9Cb29sZWFuUHJvcGVydHkuanMnO1xuaW1wb3J0IEVtaXR0ZXIgZnJvbSAnLi4vLi4vLi4vLi4vLi4vYXhvbi9qcy9FbWl0dGVyLmpzJztcbmltcG9ydCBzdGVwVGltZXIgZnJvbSAnLi4vLi4vLi4vLi4vLi4vYXhvbi9qcy9zdGVwVGltZXIuanMnO1xuaW1wb3J0IFRFbWl0dGVyIGZyb20gJy4uLy4uLy4uLy4uLy4uL2F4b24vanMvVEVtaXR0ZXIuanMnO1xuaW1wb3J0IHsgVGltZXJMaXN0ZW5lciB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL2F4b24vanMvVGltZXIuanMnO1xuaW1wb3J0IEJvdW5kczIgZnJvbSAnLi4vLi4vLi4vLi4vLi4vZG90L2pzL0JvdW5kczIuanMnO1xuaW1wb3J0IG1lcmdlIGZyb20gJy4uLy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9tZXJnZS5qcyc7XG5pbXBvcnQgUmVzZXRBbGxCdXR0b24gZnJvbSAnLi4vLi4vLi4vLi4vLi4vc2NlbmVyeS1waGV0L2pzL2J1dHRvbnMvUmVzZXRBbGxCdXR0b24uanMnO1xuaW1wb3J0IFBoZXRGb250IGZyb20gJy4uLy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9QaGV0Rm9udC5qcyc7XG5pbXBvcnQgeyBIQm94LCBJbWFnZSwgTm9kZSwgTm9kZU9wdGlvbnMsIFRleHQsIFZCb3gsIFZCb3hPcHRpb25zIH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcbmltcG9ydCBUZXh0UHVzaEJ1dHRvbiBmcm9tICcuLi8uLi8uLi8uLi8uLi9zdW4vanMvYnV0dG9ucy9UZXh0UHVzaEJ1dHRvbi5qcyc7XG5pbXBvcnQgQ2hlY2tib3ggZnJvbSAnLi4vLi4vLi4vLi4vLi4vc3VuL2pzL0NoZWNrYm94LmpzJztcbmltcG9ydCBEZW1vc1NjcmVlblZpZXcsIHsgRGVtb0l0ZW1EYXRhIH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vc3VuL2pzL2RlbW8vRGVtb3NTY3JlZW5WaWV3LmpzJztcbmltcG9ydCBQYW5lbCBmcm9tICcuLi8uLi8uLi8uLi8uLi9zdW4vanMvUGFuZWwuanMnO1xuaW1wb3J0IGxpZ2h0bmluZ19wbmcgZnJvbSAnLi4vLi4vLi4vLi4vaW1hZ2VzL2xpZ2h0bmluZ19wbmcuanMnO1xuaW1wb3J0IGNoZWNrYm94Q2hlY2tlZF9tcDMgZnJvbSAnLi4vLi4vLi4vLi4vc291bmRzL2NoZWNrYm94Q2hlY2tlZF9tcDMuanMnO1xuaW1wb3J0IGxvb25DYWxsX21wMyBmcm9tICcuLi8uLi8uLi8uLi9zb3VuZHMvZGVtby1hbmQtdGVzdC9sb29uQ2FsbF9tcDMuanMnO1xuaW1wb3J0IHJob2Rlc0Nob3JkX21wMyBmcm9tICcuLi8uLi8uLi8uLi9zb3VuZHMvZGVtby1hbmQtdGVzdC9yaG9kZXNDaG9yZF9tcDMuanMnO1xuaW1wb3J0IHRodW5kZXJfbXAzIGZyb20gJy4uLy4uLy4uLy4uL3NvdW5kcy9kZW1vLWFuZC10ZXN0L3RodW5kZXJfbXAzLmpzJztcbmltcG9ydCBlbXB0eUFwYXJ0bWVudEJlZHJvb20wNlJlc2FtcGxlZF9tcDMgZnJvbSAnLi4vLi4vLi4vLi4vc291bmRzL2VtcHR5QXBhcnRtZW50QmVkcm9vbTA2UmVzYW1wbGVkX21wMy5qcyc7XG5pbXBvcnQgbnVsbFNvdW5kUGxheWVyIGZyb20gJy4uLy4uLy4uL251bGxTb3VuZFBsYXllci5qcyc7XG5pbXBvcnQgcGhldEF1ZGlvQ29udGV4dCBmcm9tICcuLi8uLi8uLi9waGV0QXVkaW9Db250ZXh0LmpzJztcbmltcG9ydCBTb3VuZENsaXAgZnJvbSAnLi4vLi4vLi4vc291bmQtZ2VuZXJhdG9ycy9Tb3VuZENsaXAuanMnO1xuaW1wb3J0IFNvdW5kTGV2ZWxFbnVtIGZyb20gJy4uLy4uLy4uL1NvdW5kTGV2ZWxFbnVtLmpzJztcbmltcG9ydCBzb3VuZE1hbmFnZXIgZnJvbSAnLi4vLi4vLi4vc291bmRNYW5hZ2VyLmpzJztcbmltcG9ydCB0YW1ibyBmcm9tICcuLi8uLi8uLi90YW1iby5qcyc7XG5pbXBvcnQgQW1wbGl0dWRlTW9kdWxhdG9yRGVtb05vZGUgZnJvbSAnLi9BbXBsaXR1ZGVNb2R1bGF0b3JEZW1vTm9kZS5qcyc7XG5pbXBvcnQgQ29tcG9zaXRlU291bmRDbGlwVGVzdE5vZGUgZnJvbSAnLi9Db21wb3NpdGVTb3VuZENsaXBUZXN0Tm9kZS5qcyc7XG5pbXBvcnQgQ29udGludW91c1Byb3BlcnR5U291bmRDbGlwVGVzdE5vZGUgZnJvbSAnLi9Db250aW51b3VzUHJvcGVydHlTb3VuZENsaXBUZXN0Tm9kZS5qcyc7XG5pbXBvcnQgUmVtb3ZlQW5kRGlzcG9zZVNvdW5kR2VuZXJhdG9yc1Rlc3RQYW5lbCBmcm9tICcuL1JlbW92ZUFuZERpc3Bvc2VTb3VuZEdlbmVyYXRvcnNUZXN0UGFuZWwuanMnO1xuaW1wb3J0IFNvdW5kQ2xpcENob3JkVGVzdE5vZGUgZnJvbSAnLi9Tb3VuZENsaXBDaG9yZFRlc3ROb2RlLmpzJztcblxuLy8gY29uc3RhbnRzXG5jb25zdCBDSEVDS0JPWF9TSVpFID0gMTY7XG5jb25zdCBGT05UID0gbmV3IFBoZXRGb250KCAxNiApO1xuY29uc3QgTElHSFROSU5HX1NIT1dOX1RJTUUgPSAwLjc1MDsgLy8gaW4gc2Vjb25kc1xuXG5jbGFzcyBUZXN0aW5nU2NyZWVuVmlldyBleHRlbmRzIERlbW9zU2NyZWVuVmlldyB7XG5cbiAgcHJpdmF0ZSByZWFkb25seSBzdGVwRW1pdHRlcjogVEVtaXR0ZXI8WyBudW1iZXIgXT47XG5cbiAgcHVibGljIGNvbnN0cnVjdG9yKCkge1xuXG4gICAgLy8gc3RlcCBlbWl0dGVyLCBuZWVkZWQgYnkgc29tZSBvZiB0aGUgZGVtb3NcbiAgICBjb25zdCBzdGVwRW1pdHRlciA9IG5ldyBFbWl0dGVyPFsgbnVtYmVyIF0+KCB7XG4gICAgICBwYXJhbWV0ZXJzOiBbIHsgdmFsdWVUeXBlOiAnbnVtYmVyJyB9IF1cbiAgICB9ICk7XG5cbiAgICAvLyBkZW1vIGl0ZW1zLCBzZWxlY3RlZCB2aWEgdGhlIGNvbWJvIGJveCBpbiB0aGUgcGFyZW50IGNsYXNzXG4gICAgY29uc3QgZGVtb3M6IERlbW9JdGVtRGF0YVtdID0gW1xuICAgICAge1xuICAgICAgICBsYWJlbDogJ0FtcGxpdHVkZU1vZHVsYXRvclRlc3QnLFxuICAgICAgICBjcmVhdGVOb2RlOiAoIGxheW91dEJvdW5kczogQm91bmRzMiApID0+IG5ldyBBbXBsaXR1ZGVNb2R1bGF0b3JEZW1vTm9kZSgge1xuICAgICAgICAgIGNlbnRlcjogbGF5b3V0Qm91bmRzLmNlbnRlclxuICAgICAgICB9IClcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIGxhYmVsOiAnQWRkaXRpb25hbEF1ZGlvTm9kZXNUZXN0Tm9kZScsXG4gICAgICAgIGNyZWF0ZU5vZGU6ICggbGF5b3V0Qm91bmRzOiBCb3VuZHMyICkgPT4gbmV3IEFkZGl0aW9uYWxBdWRpb05vZGVzVGVzdE5vZGUoIHtcbiAgICAgICAgICBjZW50ZXI6IGxheW91dEJvdW5kcy5jZW50ZXJcbiAgICAgICAgfSApXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICBsYWJlbDogJ0Jhc2ljQW5kRXh0cmFTb3VuZHMnLFxuICAgICAgICBjcmVhdGVOb2RlOiAoIGxheW91dEJvdW5kczogQm91bmRzMiApID0+IG5ldyBCYXNpY0FuZEV4dHJhU291bmRUZXN0Tm9kZSgge1xuICAgICAgICAgIGNlbnRlcjogbGF5b3V0Qm91bmRzLmNlbnRlclxuICAgICAgICB9IClcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIGxhYmVsOiAnQ29udGludW91c1Byb3BlcnR5U291bmRDbGlwVGVzdCcsXG4gICAgICAgIGNyZWF0ZU5vZGU6ICggbGF5b3V0Qm91bmRzOiBCb3VuZHMyICkgPT4gbmV3IENvbnRpbnVvdXNQcm9wZXJ0eVNvdW5kQ2xpcFRlc3ROb2RlKCBzdGVwRW1pdHRlciwge1xuICAgICAgICAgIGNlbnRlcjogbGF5b3V0Qm91bmRzLmNlbnRlclxuICAgICAgICB9IClcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIGxhYmVsOiAnQ29tcG9zaXRlU291bmRDbGlwVGVzdE5vZGUnLFxuICAgICAgICBjcmVhdGVOb2RlOiAoIGxheW91dEJvdW5kczogQm91bmRzMiApID0+IG5ldyBDb21wb3NpdGVTb3VuZENsaXBUZXN0Tm9kZSgge1xuICAgICAgICAgIGNlbnRlcjogbGF5b3V0Qm91bmRzLmNlbnRlclxuICAgICAgICB9IClcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIGxhYmVsOiAnUmVtb3ZlQW5kRGlzcG9zZVNvdW5kR2VuZXJhdG9ycycsXG4gICAgICAgIGNyZWF0ZU5vZGU6ICggbGF5b3V0Qm91bmRzOiBCb3VuZHMyICkgPT4gbmV3IFJlbW92ZUFuZERpc3Bvc2VTb3VuZEdlbmVyYXRvcnNUZXN0UGFuZWwoIHtcbiAgICAgICAgICBjZW50ZXI6IGxheW91dEJvdW5kcy5jZW50ZXJcbiAgICAgICAgfSApXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICBsYWJlbDogJ0xvbmdTb3VuZFRlc3QnLFxuICAgICAgICBjcmVhdGVOb2RlOiAoIGxheW91dEJvdW5kczogQm91bmRzMiApID0+IG5ldyBMb25nU291bmRUZXN0UGFuZWwoIHtcbiAgICAgICAgICBjZW50ZXI6IGxheW91dEJvdW5kcy5jZW50ZXJcbiAgICAgICAgfSApXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICBsYWJlbDogJ1NvdW5kQ2xpcENob3JkVGVzdE5vZGUnLFxuICAgICAgICBjcmVhdGVOb2RlOiAoIGxheW91dEJvdW5kczogQm91bmRzMiApID0+IG5ldyBTb3VuZENsaXBDaG9yZFRlc3ROb2RlKCB7XG4gICAgICAgICAgY2VudGVyOiBsYXlvdXRCb3VuZHMuY2VudGVyXG4gICAgICAgIH0gKVxuICAgICAgfVxuICAgIF07XG5cbiAgICBzdXBlciggZGVtb3MgKTtcblxuICAgIHRoaXMuc3RlcEVtaXR0ZXIgPSBzdGVwRW1pdHRlcjtcblxuICAgIC8vIGFkZCB0aGUgcmVzZXQgYWxsIGJ1dHRvblxuICAgIGNvbnN0IHJlc2V0QWxsQnV0dG9uID0gbmV3IFJlc2V0QWxsQnV0dG9uKCB7XG4gICAgICByaWdodDogdGhpcy5sYXlvdXRCb3VuZHMubWF4WCAtIDI1LFxuICAgICAgYm90dG9tOiB0aGlzLmxheW91dEJvdW5kcy5tYXhZIC0gMjVcbiAgICB9ICk7XG4gICAgdGhpcy5hZGRDaGlsZCggcmVzZXRBbGxCdXR0b24gKTtcbiAgfVxuXG4gIHB1YmxpYyBvdmVycmlkZSBzdGVwKCBkdDogbnVtYmVyICk6IHZvaWQge1xuICAgIHRoaXMuc3RlcEVtaXR0ZXIuZW1pdCggZHQgKTtcbiAgfVxufVxuXG4vKipcbiAqIGEgbm9kZSB3aXRoIHR3byBidXR0b25zLCB0aGUgMm5kIG9mIHdoaWNoIG9ubHkgcHJvZHVjZXMgc291bmQgd2hlbiBpbiAnZXh0cmEgc291bmQnIG1vZGVcbiAqL1xuY2xhc3MgQmFzaWNBbmRFeHRyYVNvdW5kVGVzdE5vZGUgZXh0ZW5kcyBWQm94IHtcblxuICBwcml2YXRlIHJlYWRvbmx5IGRpc3Bvc2VCYXNpY0FuZEV4dHJhU291bmRUZXN0Tm9kZTogKCkgPT4gdm9pZDtcblxuICBwdWJsaWMgY29uc3RydWN0b3IoIG9wdGlvbnM6IFZCb3hPcHRpb25zICkge1xuXG4gICAgLy8gc291bmQgY2xpcHMgdG8gYmUgcGxheWVkXG4gICAgY29uc3QgbG9vbkNhbGxTb3VuZENsaXAgPSBuZXcgU291bmRDbGlwKCBsb29uQ2FsbF9tcDMgKTtcbiAgICBzb3VuZE1hbmFnZXIuYWRkU291bmRHZW5lcmF0b3IoIGxvb25DYWxsU291bmRDbGlwICk7XG4gICAgY29uc3QgcmhvZGVzQ2hvcmRTb3VuZENsaXAgPSBuZXcgU291bmRDbGlwKCByaG9kZXNDaG9yZF9tcDMsIHsgc29uaWZpY2F0aW9uTGV2ZWw6IFNvdW5kTGV2ZWxFbnVtLkVYVFJBIH0gKTtcbiAgICBzb3VuZE1hbmFnZXIuYWRkU291bmRHZW5lcmF0b3IoIHJob2Rlc0Nob3JkU291bmRDbGlwICk7XG5cbiAgICAvLyBhZGQgYSBidXR0b24gdG8gcGxheSBhIGJhc2ljLW1vZGUgc291bmRcbiAgICBjb25zdCBwbGF5QmFzaWNTb3VuZEJ1dHRvbiA9IG5ldyBUZXh0UHVzaEJ1dHRvbiggJ1BsYXkgQmFzaWMtTGV2ZWwgU291bmQnLCB7XG4gICAgICBiYXNlQ29sb3I6ICcjYWFkNmNjJyxcbiAgICAgIGZvbnQ6IG5ldyBQaGV0Rm9udCggMTYgKSxcbiAgICAgIHNvdW5kUGxheWVyOiBsb29uQ2FsbFNvdW5kQ2xpcFxuICAgIH0gKTtcblxuICAgIC8vIGFkZCBidXR0b24gdG8gcGxheSBleHRyYS1tb2RlIHNvdW5kXG4gICAgY29uc3QgcGxheUV4dHJhU291bmRCdXR0b24gPSBuZXcgVGV4dFB1c2hCdXR0b24oICdQbGF5IEV4dHJhLUxldmVsIFNvdW5kJywge1xuICAgICAgYmFzZUNvbG9yOiAnI0RCQjFDRCcsXG4gICAgICBmb250OiBuZXcgUGhldEZvbnQoIDE2ICksXG4gICAgICBzb3VuZFBsYXllcjogcmhvZGVzQ2hvcmRTb3VuZENsaXBcbiAgICB9ICk7XG5cbiAgICBzdXBlciggbWVyZ2UoIHtcbiAgICAgIGNoaWxkcmVuOiBbIHBsYXlCYXNpY1NvdW5kQnV0dG9uLCBwbGF5RXh0cmFTb3VuZEJ1dHRvbiBdLFxuICAgICAgc3BhY2luZzogMjBcbiAgICB9LCBvcHRpb25zICkgKTtcblxuICAgIC8vIGRpc3Bvc2UgZnVuY3Rpb25cbiAgICB0aGlzLmRpc3Bvc2VCYXNpY0FuZEV4dHJhU291bmRUZXN0Tm9kZSA9ICgpID0+IHtcbiAgICAgIHNvdW5kTWFuYWdlci5yZW1vdmVTb3VuZEdlbmVyYXRvciggbG9vbkNhbGxTb3VuZENsaXAgKTtcbiAgICAgIGxvb25DYWxsU291bmRDbGlwLmRpc3Bvc2UoKTtcbiAgICAgIHNvdW5kTWFuYWdlci5yZW1vdmVTb3VuZEdlbmVyYXRvciggcmhvZGVzQ2hvcmRTb3VuZENsaXAgKTtcbiAgICAgIHJob2Rlc0Nob3JkU291bmRDbGlwLmRpc3Bvc2UoKTtcbiAgICB9O1xuICB9XG5cbiAgLyoqXG4gICAqIFJlbGVhc2UgcmVmZXJlbmNlcyB0byBhdm9pZCBtZW1vcnkgbGVha3MuXG4gICAqL1xuICBwdWJsaWMgb3ZlcnJpZGUgZGlzcG9zZSgpOiB2b2lkIHtcbiAgICB0aGlzLmRpc3Bvc2VCYXNpY0FuZEV4dHJhU291bmRUZXN0Tm9kZSgpO1xuICAgIHN1cGVyLmRpc3Bvc2UoKTtcbiAgfVxufVxuXG4vKipcbiAqIEEgbm9kZSB3aXRoIGJ1dHRvbnMgZm9yIHBsYXlpbmcgc291bmRzIGluIGNvbmp1bmN0aW9uIHdpdGggcmV2ZXJiIG5vZGVzLlxuICovXG5jbGFzcyBBZGRpdGlvbmFsQXVkaW9Ob2Rlc1Rlc3ROb2RlIGV4dGVuZHMgVkJveCB7XG5cbiAgcHJpdmF0ZSByZWFkb25seSBkaXNwb3NlQmFzaWNBbmRFeHRyYVNvdW5kVGVzdE5vZGU6ICgpID0+IHZvaWQ7XG5cbiAgcHVibGljIGNvbnN0cnVjdG9yKCBvcHRpb25zOiBWQm94T3B0aW9ucyApIHtcblxuICAgIC8vIGNvbnZvbHZlciBub2RlLCB3aGljaCB3aWxsIGJlIHVzZWQgdG8gY3JlYXRlIHRoZSByZXZlcmIgZWZmZWN0XG4gICAgY29uc3QgY29udm9sdmVyID0gcGhldEF1ZGlvQ29udGV4dC5jcmVhdGVDb252b2x2ZXIoKTtcbiAgICBjb252b2x2ZXIuYnVmZmVyID0gZW1wdHlBcGFydG1lbnRCZWRyb29tMDZSZXNhbXBsZWRfbXAzLmF1ZGlvQnVmZmVyUHJvcGVydHkudmFsdWU7XG5cbiAgICAvLyBzb3VuZCBjbGlwcyB0byBiZSBwbGF5ZWRcbiAgICBjb25zdCBzaG9ydFNvdW5kTm9ybWFsID0gbmV3IFNvdW5kQ2xpcCggY2hlY2tib3hDaGVja2VkX21wMyApO1xuICAgIHNvdW5kTWFuYWdlci5hZGRTb3VuZEdlbmVyYXRvciggc2hvcnRTb3VuZE5vcm1hbCApO1xuICAgIGNvbnN0IHNob3J0U291bmRXaXRoUmV2ZXJiID0gbmV3IFNvdW5kQ2xpcCggY2hlY2tib3hDaGVja2VkX21wMywge1xuICAgICAgYWRkaXRpb25hbEF1ZGlvTm9kZXM6IFsgY29udm9sdmVyIF1cbiAgICB9ICk7XG4gICAgc291bmRNYW5hZ2VyLmFkZFNvdW5kR2VuZXJhdG9yKCBzaG9ydFNvdW5kV2l0aFJldmVyYiApO1xuXG4gICAgLy8gZm9udCBmb3IgYWxsIGJ1dHRvbnNcbiAgICBjb25zdCBidXR0b25Gb250ID0gbmV3IFBoZXRGb250KCAxNiApO1xuXG4gICAgLy8gYWRkIGEgYnV0dG9uIHRvIHBsYXkgdGhlIHBsYWluIHNvdW5kXG4gICAgY29uc3QgcGxheU5vcm1hbFNvdW5kQnV0dG9uID0gbmV3IFRleHRQdXNoQnV0dG9uKCAnTm9ybWFsIFNvdW5kIENsaXAnLCB7XG4gICAgICBiYXNlQ29sb3I6ICcjQ0NGRjAwJyxcbiAgICAgIGZvbnQ6IGJ1dHRvbkZvbnQsXG4gICAgICBzb3VuZFBsYXllcjogc2hvcnRTb3VuZE5vcm1hbFxuICAgIH0gKTtcblxuICAgIC8vIGFkZCBidXR0b24gdG8gcGxheSB0aGUgc291bmQgd2l0aCB0aGUgcmV2ZXJiIGFkZGVkIGluIHRoZSBzaWduYWwgcGF0aFxuICAgIGNvbnN0IHBsYXlTb3VuZFdpdGhJbnNlcnRlZEF1ZGlvTm9kZUJ1dHRvbiA9IG5ldyBUZXh0UHVzaEJ1dHRvbiggJ1NhbWUgQ2xpcCB3aXRoIEluLUxpbmUgUmV2ZXJiIE5vZGUnLCB7XG4gICAgICBiYXNlQ29sb3I6ICcjQ0M5OUZGJyxcbiAgICAgIGZvbnQ6IGJ1dHRvbkZvbnQsXG4gICAgICBzb3VuZFBsYXllcjogc2hvcnRTb3VuZFdpdGhSZXZlcmJcbiAgICB9ICk7XG5cbiAgICAvLyBhZGQgYnV0dG9uIHRvIHBsYXkgYm90aCBzb3VuZHMgYXQgdGhlIHNhbWUgdGltZVxuICAgIGNvbnN0IHBsYXlCb3RoU291bmRzID0gbmV3IFRleHRQdXNoQnV0dG9uKCAnQm90aCBDbGlwcyBTaW11bHRhbmVvdXNseScsIHtcbiAgICAgIGJhc2VDb2xvcjogJyNGRjk5OTknLFxuICAgICAgZm9udDogYnV0dG9uRm9udCxcbiAgICAgIHNvdW5kUGxheWVyOiBudWxsU291bmRQbGF5ZXIsIC8vIHR1cm4gb2ZmIGRlZmF1bHQgc291bmQgZ2VuZXJhdGlvblxuICAgICAgbGlzdGVuZXI6ICgpID0+IHtcbiAgICAgICAgc2hvcnRTb3VuZE5vcm1hbC5wbGF5KCk7XG4gICAgICAgIHNob3J0U291bmRXaXRoUmV2ZXJiLnBsYXkoKTtcbiAgICAgIH1cbiAgICB9ICk7XG5cbiAgICBzdXBlciggbWVyZ2UoIHtcbiAgICAgIGNoaWxkcmVuOiBbIHBsYXlOb3JtYWxTb3VuZEJ1dHRvbiwgcGxheVNvdW5kV2l0aEluc2VydGVkQXVkaW9Ob2RlQnV0dG9uLCBwbGF5Qm90aFNvdW5kcyBdLFxuICAgICAgc3BhY2luZzogMjBcbiAgICB9LCBvcHRpb25zICkgKTtcblxuICAgIC8vIGRpc3Bvc2UgZnVuY3Rpb25cbiAgICB0aGlzLmRpc3Bvc2VCYXNpY0FuZEV4dHJhU291bmRUZXN0Tm9kZSA9ICgpID0+IHtcbiAgICAgIHNvdW5kTWFuYWdlci5yZW1vdmVTb3VuZEdlbmVyYXRvciggc2hvcnRTb3VuZE5vcm1hbCApO1xuICAgICAgc2hvcnRTb3VuZE5vcm1hbC5kaXNwb3NlKCk7XG4gICAgICBzb3VuZE1hbmFnZXIucmVtb3ZlU291bmRHZW5lcmF0b3IoIHNob3J0U291bmRXaXRoUmV2ZXJiICk7XG4gICAgICBzaG9ydFNvdW5kV2l0aFJldmVyYi5kaXNwb3NlKCk7XG4gICAgfTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZWxlYXNlIHJlZmVyZW5jZXMgdG8gYXZvaWQgbWVtb3J5IGxlYWtzLlxuICAgKi9cbiAgcHVibGljIG92ZXJyaWRlIGRpc3Bvc2UoKTogdm9pZCB7XG4gICAgdGhpcy5kaXNwb3NlQmFzaWNBbmRFeHRyYVNvdW5kVGVzdE5vZGUoKTtcbiAgICBzdXBlci5kaXNwb3NlKCk7XG4gIH1cbn1cblxuLyoqXG4gKiBMb25nU291bmRUZXN0UGFuZWwgaXMgYSBub2RlIHRoYXQgY29udGFpbnMgYSBidXR0b24gdGhhdCBwcm9kdWNlcyBhIGxvbmcgc291bmQsIGFuZCB0ZXN0cyBob3cgdGhhdCBzb3VuZCBiZWhhdmVzXG4gKiB3aGVuIHRoaW5ncyBoYXBwZW4gbGlrZSBhIHJlc2V0IG9yIGEgZGlzYWJsZSB3aGlsZSBzb3VuZCBpcyBpbiBwcm9ncmVzcy5cbiAqL1xuY2xhc3MgTG9uZ1NvdW5kVGVzdFBhbmVsIGV4dGVuZHMgTm9kZSB7XG5cbiAgcHJpdmF0ZSByZWFkb25seSBkaXNwb3NlTG9uZ1NvdW5kVGVzdFBhbmVsOiAoKSA9PiB2b2lkO1xuXG4gIHB1YmxpYyBjb25zdHJ1Y3Rvciggb3B0aW9uczogTm9kZU9wdGlvbnMgKSB7XG5cbiAgICAvLyBpbnRlcm5hbCBzdGF0ZSB2YXJpYWJsZXNcbiAgICBjb25zdCBsaWdodG5pbmdCb2x0VmlzaWJsZVByb3BlcnR5ID0gbmV3IEJvb2xlYW5Qcm9wZXJ0eSggZmFsc2UgKTtcbiAgICBsZXQgbGlnaHRuaW5nQm9sdFZpc2libGVUaW1lb3V0OiBudWxsIHwgVGltZXJMaXN0ZW5lciA9IG51bGw7XG5cbiAgICAvLyB0aW1lb3V0IGZ1bmN0aW9uXG4gICAgY29uc3QgdGltZW91dEZpcmVkTGlzdGVuZXIgPSAoKSA9PiB7XG4gICAgICBsaWdodG5pbmdCb2x0VmlzaWJsZVByb3BlcnR5LnNldCggZmFsc2UgKTtcbiAgICAgIGxpZ2h0bmluZ0JvbHRWaXNpYmxlVGltZW91dCA9IG51bGw7XG4gICAgfTtcblxuICAgIC8vIGJ1dHRvbiB0aGF0IHdpbGwgdHJpZ2dlciB0aHVuZGVyIGFuZCBsaWdodG5pbmdcbiAgICBjb25zdCBmaXJlTGlnaHRuaW5nQnV0dG9uID0gbmV3IFRleHRQdXNoQnV0dG9uKCAnTGlnaHRuaW5nJywge1xuICAgICAgZm9udDogRk9OVCxcbiAgICAgIGxpc3RlbmVyOiAoKSA9PiB7XG4gICAgICAgIGFzc2VydCAmJiBhc3NlcnQoIGxpZ2h0bmluZ0JvbHRWaXNpYmxlVGltZW91dCA9PT0gbnVsbCwgJ3RpbWVyIHNob3VsZCBub3QgYmUgcnVubmluZyB3aGVuIHRoaXMgZmlyZXMnICk7XG4gICAgICAgIGxpZ2h0bmluZ0JvbHRWaXNpYmxlUHJvcGVydHkudmFsdWUgPSB0cnVlO1xuICAgICAgICBsaWdodG5pbmdCb2x0VmlzaWJsZVRpbWVvdXQgPSBzdGVwVGltZXIuc2V0VGltZW91dCggdGltZW91dEZpcmVkTGlzdGVuZXIsIExJR0hUTklOR19TSE9XTl9USU1FICogMTAwMCApO1xuICAgICAgfSxcbiAgICAgIHNvdW5kUGxheWVyOiBudWxsU291bmRQbGF5ZXJcbiAgICB9ICk7XG5cbiAgICAvLyBkaXNhYmxlIHRoZSBidXR0b24gd2hpbGUgbGlnaHRuaW5nIGlzIHZpc2libGVcbiAgICBsaWdodG5pbmdCb2x0VmlzaWJsZVByb3BlcnR5LmxpbmsoIGxpZ2h0bmluZ0JvbHRWaXNpYmxlID0+IHtcbiAgICAgIGZpcmVMaWdodG5pbmdCdXR0b24uZW5hYmxlZCA9ICFsaWdodG5pbmdCb2x0VmlzaWJsZTtcbiAgICB9ICk7XG5cbiAgICBjb25zdCB0aHVuZGVyU291bmRFbmFibGVkUHJvcGVydHkgPSBuZXcgQm9vbGVhblByb3BlcnR5KCB0cnVlICk7XG5cbiAgICAvLyBzb3VuZCBnZW5lcmF0b3IgZm9yIHRodW5kZXJcbiAgICBjb25zdCB0aHVuZGVyU291bmRDbGlwID0gbmV3IFNvdW5kQ2xpcCggdGh1bmRlcl9tcDMsIHtcbiAgICAgIGVuYWJsZWRQcm9wZXJ0eTogdGh1bmRlclNvdW5kRW5hYmxlZFByb3BlcnR5LFxuICAgICAgaW5pdGlhdGVXaGVuRGlzYWJsZWQ6IHRydWUsXG4gICAgICBhc3NvY2lhdGVkVmlld05vZGU6IGZpcmVMaWdodG5pbmdCdXR0b25cbiAgICB9ICk7XG4gICAgc291bmRNYW5hZ2VyLmFkZFNvdW5kR2VuZXJhdG9yKCB0aHVuZGVyU291bmRDbGlwICk7XG4gICAgbGlnaHRuaW5nQm9sdFZpc2libGVQcm9wZXJ0eS5saW5rKCB2aXNpYmxlID0+IHtcbiAgICAgIGlmICggdmlzaWJsZSApIHtcbiAgICAgICAgdGh1bmRlclNvdW5kQ2xpcC5wbGF5KCk7XG4gICAgICB9XG4gICAgfSApO1xuXG4gICAgLy8gY2hlY2sgYm94IHRoYXQgY29udHJvbHMgd2hldGhlciB0aGUgdGh1bmRlclNvdW5kQ2xpcCBzb3VuZCBpcyBsb2NhbGx5IGVuYWJsZWRcbiAgICBjb25zdCB0aHVuZGVyRW5hYmxlZENoZWNrYm94ID0gbmV3IENoZWNrYm94KFxuICAgICAgdGh1bmRlclNvdW5kRW5hYmxlZFByb3BlcnR5LFxuICAgICAgbmV3IFRleHQoICdFbmFibGVkJywgeyBmb250OiBGT05UIH0gKSxcbiAgICAgIHsgYm94V2lkdGg6IENIRUNLQk9YX1NJWkUgfVxuICAgICk7XG5cbiAgICAvLyBjaGVjayBib3ggdGhhdCBjb250cm9scyB3aGV0aGVyIHRoZSB0aHVuZGVyU291bmRDbGlwIHNvdW5kIGNhbiBiZSBpbml0aWF0ZWQgd2hlbiBkaXNhYmxlZFxuICAgIGNvbnN0IGluaXRpYXRlVGh1bmRlcldoZW5EaXNhYmxlZFByb3BlcnR5ID0gbmV3IEJvb2xlYW5Qcm9wZXJ0eSggdGh1bmRlclNvdW5kQ2xpcC5pbml0aWF0ZVdoZW5EaXNhYmxlZCApO1xuICAgIGluaXRpYXRlVGh1bmRlcldoZW5EaXNhYmxlZFByb3BlcnR5LmxpbmtBdHRyaWJ1dGUoIHRodW5kZXJTb3VuZENsaXAsICdpbml0aWF0ZVdoZW5EaXNhYmxlZCcgKTtcbiAgICBjb25zdCBpbml0aWF0ZVRodW5kZXJXaGVuRGlzYWJsZWRDaGVja2JveCA9IG5ldyBDaGVja2JveCggaW5pdGlhdGVUaHVuZGVyV2hlbkRpc2FibGVkUHJvcGVydHksIG5ldyBUZXh0KCAnSW5pdGlhdGUgd2hlbiBkaXNhYmxlZCcsIHsgZm9udDogRk9OVCB9ICksIHsgYm94V2lkdGg6IENIRUNLQk9YX1NJWkUgfSApO1xuXG4gICAgLy8gbGF5IG91dCB0aGUgc2V0IG9mIGNvbnRyb2xzIGZvciB0aGUgdGh1bmRlclNvdW5kQ2xpcFxuICAgIGNvbnN0IHRodW5kZXJDb250cm9sID0gbmV3IFZCb3goIHtcbiAgICAgIGNoaWxkcmVuOiBbXG4gICAgICAgIG5ldyBUZXh0KCAnVGh1bmRlcjogJywgeyBmb250OiBuZXcgUGhldEZvbnQoIDE2ICkgfSApLFxuICAgICAgICB0aHVuZGVyRW5hYmxlZENoZWNrYm94LFxuICAgICAgICBpbml0aWF0ZVRodW5kZXJXaGVuRGlzYWJsZWRDaGVja2JveFxuICAgICAgXSxcbiAgICAgIGFsaWduOiAnbGVmdCcsXG4gICAgICBzcGFjaW5nOiA4XG4gICAgfSApO1xuXG4gICAgLy8gcGFuZWwgd2hlcmUgdGh1bmRlclNvdW5kQ2xpcCBhbmQgbGlnaHRuaW5nIGFyZSBjb250cm9sbGVkXG4gICAgY29uc3QgbGlnaHRuaW5nQ29udHJvbFBhbmVsID0gbmV3IFBhbmVsKFxuICAgICAgbmV3IEhCb3goIHsgY2hpbGRyZW46IFsgZmlyZUxpZ2h0bmluZ0J1dHRvbiwgdGh1bmRlckNvbnRyb2wgXSwgc3BhY2luZzogMTQsIGFsaWduOiAndG9wJyB9ICksXG4gICAgICB7XG4gICAgICAgIHhNYXJnaW46IDEwLFxuICAgICAgICB5TWFyZ2luOiA4LFxuICAgICAgICBmaWxsOiAnI0ZDRkJFMydcbiAgICAgIH1cbiAgICApO1xuXG4gICAgLy8gYWRkIHRoZSBsaWdodG5pbmcgYm9sdCB0aGF0IHdpbGwgYXBwZWFyIHdoZW4gY29tbWFuZGVkIGJ5IHRoZSB1c2VyIChhbmQgbWFrZSBoaW0vaGVyIGZlZWwgbGlrZSBaZXVzKVxuICAgIGNvbnN0IGxpZ2h0bmluZ0JvbHROb2RlID0gbmV3IEltYWdlKCBsaWdodG5pbmdfcG5nLCB7XG4gICAgICBsZWZ0OiBsaWdodG5pbmdDb250cm9sUGFuZWwubGVmdCArIDI1LFxuICAgICAgdG9wOiBsaWdodG5pbmdDb250cm9sUGFuZWwuYm90dG9tIC0gMyxcbiAgICAgIG1heEhlaWdodDogNTBcbiAgICB9ICk7XG5cbiAgICAvLyBvbmx5IHNob3cgdGhlIGxpZ2h0bmluZyB3aGVuIHRoZSBtb2RlbCBpbmRpY2F0ZXMgLSB0aGlzIGlzIGRvbmUgYWZ0ZXIgdGhlIHBhbmVsIGlzIGNyZWF0ZWQgc28gdGhlIGxheW91dCB3b3Jrc1xuICAgIGxpZ2h0bmluZ0JvbHRWaXNpYmxlUHJvcGVydHkubGlua0F0dHJpYnV0ZSggbGlnaHRuaW5nQm9sdE5vZGUsICd2aXNpYmxlJyApO1xuXG4gICAgc3VwZXIoIG1lcmdlKCB7IGNoaWxkcmVuOiBbIGxpZ2h0bmluZ0JvbHROb2RlLCBsaWdodG5pbmdDb250cm9sUGFuZWwgXSB9LCBvcHRpb25zICkgKTtcblxuICAgIC8vIGhhbmRsZSByZXNldFxuICAgIGNvbnN0IHJlc2V0SGFuZGxlciA9ICgpID0+IHtcbiAgICAgIHN0ZXBUaW1lci5jbGVhclRpbWVvdXQoIHRpbWVvdXRGaXJlZExpc3RlbmVyICk7XG4gICAgfTtcbiAgICBSZXNldEFsbEJ1dHRvbi5pc1Jlc2V0dGluZ0FsbFByb3BlcnR5LmxpbmsoIHJlc2V0SGFuZGxlciApO1xuXG4gICAgLy8gZGlzcG9zZSBmdW5jdGlvblxuICAgIHRoaXMuZGlzcG9zZUxvbmdTb3VuZFRlc3RQYW5lbCA9ICgpID0+IHtcbiAgICAgIFJlc2V0QWxsQnV0dG9uLmlzUmVzZXR0aW5nQWxsUHJvcGVydHkudW5saW5rKCByZXNldEhhbmRsZXIgKTtcbiAgICAgIHNvdW5kTWFuYWdlci5yZW1vdmVTb3VuZEdlbmVyYXRvciggdGh1bmRlclNvdW5kQ2xpcCApO1xuICAgICAgbGlnaHRuaW5nQm9sdFZpc2libGVUaW1lb3V0ICYmIHN0ZXBUaW1lci5jbGVhclRpbWVvdXQoIGxpZ2h0bmluZ0JvbHRWaXNpYmxlVGltZW91dCApO1xuICAgIH07XG4gIH1cblxuICAvKipcbiAgICogcmVsZWFzZSBtZW1vcnkgdG8gYXZvaWQgbGVha3NcbiAgICovXG4gIHB1YmxpYyBvdmVycmlkZSBkaXNwb3NlKCk6IHZvaWQge1xuICAgIHRoaXMuZGlzcG9zZUxvbmdTb3VuZFRlc3RQYW5lbCgpO1xuICAgIHN1cGVyLmRpc3Bvc2UoKTtcbiAgfVxufVxuXG50YW1iby5yZWdpc3RlciggJ1Rlc3RpbmdTY3JlZW5WaWV3JywgVGVzdGluZ1NjcmVlblZpZXcgKTtcblxuZXhwb3J0IGRlZmF1bHQgVGVzdGluZ1NjcmVlblZpZXc7Il0sIm5hbWVzIjpbIkJvb2xlYW5Qcm9wZXJ0eSIsIkVtaXR0ZXIiLCJzdGVwVGltZXIiLCJtZXJnZSIsIlJlc2V0QWxsQnV0dG9uIiwiUGhldEZvbnQiLCJIQm94IiwiSW1hZ2UiLCJOb2RlIiwiVGV4dCIsIlZCb3giLCJUZXh0UHVzaEJ1dHRvbiIsIkNoZWNrYm94IiwiRGVtb3NTY3JlZW5WaWV3IiwiUGFuZWwiLCJsaWdodG5pbmdfcG5nIiwiY2hlY2tib3hDaGVja2VkX21wMyIsImxvb25DYWxsX21wMyIsInJob2Rlc0Nob3JkX21wMyIsInRodW5kZXJfbXAzIiwiZW1wdHlBcGFydG1lbnRCZWRyb29tMDZSZXNhbXBsZWRfbXAzIiwibnVsbFNvdW5kUGxheWVyIiwicGhldEF1ZGlvQ29udGV4dCIsIlNvdW5kQ2xpcCIsIlNvdW5kTGV2ZWxFbnVtIiwic291bmRNYW5hZ2VyIiwidGFtYm8iLCJBbXBsaXR1ZGVNb2R1bGF0b3JEZW1vTm9kZSIsIkNvbXBvc2l0ZVNvdW5kQ2xpcFRlc3ROb2RlIiwiQ29udGludW91c1Byb3BlcnR5U291bmRDbGlwVGVzdE5vZGUiLCJSZW1vdmVBbmREaXNwb3NlU291bmRHZW5lcmF0b3JzVGVzdFBhbmVsIiwiU291bmRDbGlwQ2hvcmRUZXN0Tm9kZSIsIkNIRUNLQk9YX1NJWkUiLCJGT05UIiwiTElHSFROSU5HX1NIT1dOX1RJTUUiLCJUZXN0aW5nU2NyZWVuVmlldyIsInN0ZXAiLCJkdCIsInN0ZXBFbWl0dGVyIiwiZW1pdCIsInBhcmFtZXRlcnMiLCJ2YWx1ZVR5cGUiLCJkZW1vcyIsImxhYmVsIiwiY3JlYXRlTm9kZSIsImxheW91dEJvdW5kcyIsImNlbnRlciIsIkFkZGl0aW9uYWxBdWRpb05vZGVzVGVzdE5vZGUiLCJCYXNpY0FuZEV4dHJhU291bmRUZXN0Tm9kZSIsIkxvbmdTb3VuZFRlc3RQYW5lbCIsInJlc2V0QWxsQnV0dG9uIiwicmlnaHQiLCJtYXhYIiwiYm90dG9tIiwibWF4WSIsImFkZENoaWxkIiwiZGlzcG9zZSIsImRpc3Bvc2VCYXNpY0FuZEV4dHJhU291bmRUZXN0Tm9kZSIsIm9wdGlvbnMiLCJsb29uQ2FsbFNvdW5kQ2xpcCIsImFkZFNvdW5kR2VuZXJhdG9yIiwicmhvZGVzQ2hvcmRTb3VuZENsaXAiLCJzb25pZmljYXRpb25MZXZlbCIsIkVYVFJBIiwicGxheUJhc2ljU291bmRCdXR0b24iLCJiYXNlQ29sb3IiLCJmb250Iiwic291bmRQbGF5ZXIiLCJwbGF5RXh0cmFTb3VuZEJ1dHRvbiIsImNoaWxkcmVuIiwic3BhY2luZyIsInJlbW92ZVNvdW5kR2VuZXJhdG9yIiwiY29udm9sdmVyIiwiY3JlYXRlQ29udm9sdmVyIiwiYnVmZmVyIiwiYXVkaW9CdWZmZXJQcm9wZXJ0eSIsInZhbHVlIiwic2hvcnRTb3VuZE5vcm1hbCIsInNob3J0U291bmRXaXRoUmV2ZXJiIiwiYWRkaXRpb25hbEF1ZGlvTm9kZXMiLCJidXR0b25Gb250IiwicGxheU5vcm1hbFNvdW5kQnV0dG9uIiwicGxheVNvdW5kV2l0aEluc2VydGVkQXVkaW9Ob2RlQnV0dG9uIiwicGxheUJvdGhTb3VuZHMiLCJsaXN0ZW5lciIsInBsYXkiLCJkaXNwb3NlTG9uZ1NvdW5kVGVzdFBhbmVsIiwibGlnaHRuaW5nQm9sdFZpc2libGVQcm9wZXJ0eSIsImxpZ2h0bmluZ0JvbHRWaXNpYmxlVGltZW91dCIsInRpbWVvdXRGaXJlZExpc3RlbmVyIiwic2V0IiwiZmlyZUxpZ2h0bmluZ0J1dHRvbiIsImFzc2VydCIsInNldFRpbWVvdXQiLCJsaW5rIiwibGlnaHRuaW5nQm9sdFZpc2libGUiLCJlbmFibGVkIiwidGh1bmRlclNvdW5kRW5hYmxlZFByb3BlcnR5IiwidGh1bmRlclNvdW5kQ2xpcCIsImVuYWJsZWRQcm9wZXJ0eSIsImluaXRpYXRlV2hlbkRpc2FibGVkIiwiYXNzb2NpYXRlZFZpZXdOb2RlIiwidmlzaWJsZSIsInRodW5kZXJFbmFibGVkQ2hlY2tib3giLCJib3hXaWR0aCIsImluaXRpYXRlVGh1bmRlcldoZW5EaXNhYmxlZFByb3BlcnR5IiwibGlua0F0dHJpYnV0ZSIsImluaXRpYXRlVGh1bmRlcldoZW5EaXNhYmxlZENoZWNrYm94IiwidGh1bmRlckNvbnRyb2wiLCJhbGlnbiIsImxpZ2h0bmluZ0NvbnRyb2xQYW5lbCIsInhNYXJnaW4iLCJ5TWFyZ2luIiwiZmlsbCIsImxpZ2h0bmluZ0JvbHROb2RlIiwibGVmdCIsInRvcCIsIm1heEhlaWdodCIsInJlc2V0SGFuZGxlciIsImNsZWFyVGltZW91dCIsImlzUmVzZXR0aW5nQWxsUHJvcGVydHkiLCJ1bmxpbmsiLCJyZWdpc3RlciJdLCJtYXBwaW5ncyI6IkFBQUEsc0RBQXNEO0FBRXREOzs7O0NBSUMsR0FFRCxPQUFPQSxxQkFBcUIsNENBQTRDO0FBQ3hFLE9BQU9DLGFBQWEsb0NBQW9DO0FBQ3hELE9BQU9DLGVBQWUsc0NBQXNDO0FBSTVELE9BQU9DLFdBQVcsdUNBQXVDO0FBQ3pELE9BQU9DLG9CQUFvQiwyREFBMkQ7QUFDdEYsT0FBT0MsY0FBYyw2Q0FBNkM7QUFDbEUsU0FBU0MsSUFBSSxFQUFFQyxLQUFLLEVBQUVDLElBQUksRUFBZUMsSUFBSSxFQUFFQyxJQUFJLFFBQXFCLHVDQUF1QztBQUMvRyxPQUFPQyxvQkFBb0Isa0RBQWtEO0FB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