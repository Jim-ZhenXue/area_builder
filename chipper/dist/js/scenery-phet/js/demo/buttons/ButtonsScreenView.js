// Copyright 2014-2024, University of Colorado Boulder
/**
 * Demonstration of scenery-phet buttons
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Chris Malley (PixelZoom, Inc.)
 */ import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import Property from '../../../../axon/js/Property.js';
import Range from '../../../../dot/js/Range.js';
import ScreenView from '../../../../joist/js/ScreenView.js';
import { HBox, Text, VBox, VStrut } from '../../../../scenery/js/imports.js';
import Checkbox from '../../../../sun/js/Checkbox.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import BackButton from '../../buttons/BackButton.js';
import CameraButton from '../../buttons/CameraButton.js';
import CloseButton from '../../buttons/CloseButton.js';
import EraserButton from '../../buttons/EraserButton.js';
import EyeToggleButton from '../../buttons/EyeToggleButton.js';
import InfoButton from '../../buttons/InfoButton.js';
import MoveToTrashButton from '../../buttons/MoveToTrashButton.js';
import MoveToTrashLegendButton from '../../buttons/MoveToTrashLegendButton.js';
import PlayPauseButton from '../../buttons/PlayPauseButton.js';
import PlayStopButton from '../../buttons/PlayStopButton.js';
import RecordStopButton from '../../buttons/RecordStopButton.js';
import RefreshButton from '../../buttons/RefreshButton.js';
import ResetAllButton from '../../buttons/ResetAllButton.js';
import ResetButton from '../../buttons/ResetButton.js';
import RestartButton from '../../buttons/RestartButton.js';
import ReturnButton from '../../buttons/ReturnButton.js';
import SoundToggleButton from '../../buttons/SoundToggleButton.js';
import StarButton from '../../buttons/StarButton.js';
import StepBackwardButton from '../../buttons/StepBackwardButton.js';
import StepForwardButton from '../../buttons/StepForwardButton.js';
import TimerToggleButton from '../../buttons/TimerToggleButton.js';
import TrashButton from '../../buttons/TrashButton.js';
import ZoomButton from '../../buttons/ZoomButton.js';
import MagnifyingGlassZoomButtonGroup from '../../MagnifyingGlassZoomButtonGroup.js';
import PhetFont from '../../PhetFont.js';
import PlusMinusZoomButtonGroup from '../../PlusMinusZoomButtonGroup.js';
import sceneryPhet from '../../sceneryPhet.js';
let ButtonsScreenView = class ButtonsScreenView extends ScreenView {
    constructor(providedOptions){
        super(providedOptions);
        //------------------------------------------------------------------------------------------------------
        // Push buttons
        const pushButtons = [];
        const backButton = new BackButton({
            listener: ()=>console.log('BackButton pressed')
        });
        pushButtons.push(backButton);
        const closeButton = new CloseButton({
            listener: ()=>console.log('CloseButton pressed')
        });
        pushButtons.push(closeButton);
        const eraserButton = new EraserButton({
            listener: ()=>console.log('EraserButton pressed')
        });
        pushButtons.push(eraserButton);
        const resetButton = new ResetButton({
            listener: ()=>console.log('ResetButton pressed')
        });
        pushButtons.push(resetButton);
        const restartButton = new RestartButton({
            listener: ()=>console.log('RestartButton pressed')
        });
        pushButtons.push(restartButton);
        const starButton = new StarButton({
            listener: ()=>console.log('StarButton pressed')
        });
        pushButtons.push(starButton);
        const stepBackwardButton = new StepBackwardButton({
            listener: ()=>console.log('StepBackwardButton pressed')
        });
        pushButtons.push(stepBackwardButton);
        const stepForwardButton = new StepForwardButton({
            listener: ()=>console.log('StepForwardButton pressed')
        });
        pushButtons.push(stepForwardButton);
        const zoomButton = new ZoomButton({
            listener: ()=>console.log('ZoomButton pressed')
        });
        pushButtons.push(zoomButton);
        const infoButton = new InfoButton({
            listener: ()=>console.log('InfoButton pressed')
        });
        pushButtons.push(infoButton);
        const refreshButton = new RefreshButton({
            listener: ()=>console.log('RefreshButton pressed')
        });
        pushButtons.push(refreshButton);
        const trashButton = new TrashButton({
            listener: ()=>console.log('TrashButton pressed')
        });
        pushButtons.push(trashButton);
        const moveToTrashButton = new MoveToTrashButton({
            arrowColor: 'red',
            listener: ()=>console.log('MoveToTrashButton pressed')
        });
        pushButtons.push(moveToTrashButton);
        pushButtons.push(new MoveToTrashLegendButton({
            arrowColor: 'red',
            listener: ()=>console.log('MoveToTrashLegendButton pressed')
        }));
        const resetAllButton = new ResetAllButton({
            listener: ()=>console.log('ResetAllButton pressed')
        });
        pushButtons.push(resetAllButton);
        const returnButton = new ReturnButton({
            listener: ()=>console.log('ReturnButton pressed')
        });
        pushButtons.push(returnButton);
        const cameraButton = new CameraButton({
            listener: ()=>console.log('cameraButton pressed'),
            tandem: Tandem.OPT_OUT
        });
        pushButtons.push(cameraButton);
        const pushButtonsHBox = new HBox({
            children: pushButtons,
            spacing: 10,
            align: 'center',
            center: this.layoutBounds.center
        });
        //------------------------------------------------------------------------------------------------------
        // Toggle buttons
        const toggleButtons = [];
        // Add button properties here, so that resetAllButton functions properly.
        const toggleButtonProperties = {
            eyeOpenProperty: new Property(true),
            isPlayingProperty: new Property(true),
            stopButtonIsPlayingProperty: new Property(false),
            recordingProperty: new Property(true),
            soundEnabledProperty: new Property(true),
            timerEnabledProperty: new Property(true)
        };
        const eyeButton = new EyeToggleButton(toggleButtonProperties.eyeOpenProperty);
        toggleButtonProperties.eyeOpenProperty.lazyLink((eyeOpen)=>console.log(`EyeToggleButton pressed, eyeOpen=${eyeOpen}`));
        toggleButtons.push(eyeButton);
        const playPauseButton = new PlayPauseButton(toggleButtonProperties.isPlayingProperty);
        toggleButtonProperties.isPlayingProperty.lazyLink((playing)=>console.log(`PlayPauseButton pressed, playing=${playing}`));
        toggleButtons.push(playPauseButton);
        const playStopButton = new PlayStopButton(toggleButtonProperties.stopButtonIsPlayingProperty);
        toggleButtonProperties.stopButtonIsPlayingProperty.lazyLink((playing)=>console.log(`PlayStopButton pressed, playing=${playing}`));
        toggleButtons.push(playStopButton);
        const recordStopButton = new RecordStopButton(toggleButtonProperties.recordingProperty);
        toggleButtonProperties.recordingProperty.lazyLink((recording)=>console.log(`RecordStopButton pressed, recording=${recording}`));
        toggleButtons.push(recordStopButton);
        const soundToggleButton = new SoundToggleButton(toggleButtonProperties.soundEnabledProperty);
        toggleButtonProperties.soundEnabledProperty.lazyLink((soundEnabled)=>console.log(`SoundToggleButton pressed, soundEnabled=${soundEnabled}`));
        toggleButtons.push(soundToggleButton);
        const timerToggleButton = new TimerToggleButton(toggleButtonProperties.timerEnabledProperty);
        toggleButtonProperties.timerEnabledProperty.lazyLink((timerEnabled)=>console.log(`TimerToggleButton pressed, timerEnabled=${timerEnabled}`));
        toggleButtons.push(timerToggleButton);
        const toggleButtonsHBox = new HBox({
            children: toggleButtons,
            spacing: 10,
            align: 'center',
            center: this.layoutBounds.center
        });
        //------------------------------------------------------------------------------------------------------
        // Button groups
        const buttonGroups = [];
        // Property shared by ZoomButtonGroups
        const zoomLevelProperty = new NumberProperty(0, {
            range: new Range(0, 5)
        });
        zoomLevelProperty.lazyLink((zoomLevel)=>console.log(`zoomLevel=${zoomLevel}`));
        // Spacing shared by ZoomButtonGroups
        // Change this value to see how pointer areas are adjusted to prevent overlap.
        // See https://github.com/phetsims/scenery-phet/issues/650
        const spacing = 0;
        const verticalPlusMinusZoomButtonGroup = new PlusMinusZoomButtonGroup(zoomLevelProperty, {
            orientation: 'vertical',
            spacing: spacing,
            mouseAreaXDilation: 5,
            mouseAreaYDilation: 10,
            touchAreaXDilation: 5,
            touchAreaYDilation: 10
        });
        buttonGroups.push(verticalPlusMinusZoomButtonGroup);
        const horizontalPlusMinusZoomButtonGroup = new PlusMinusZoomButtonGroup(zoomLevelProperty, {
            orientation: 'horizontal',
            spacing: spacing,
            mouseAreaXDilation: 10,
            mouseAreaYDilation: 5,
            touchAreaXDilation: 10,
            touchAreaYDilation: 5
        });
        buttonGroups.push(horizontalPlusMinusZoomButtonGroup);
        const verticalMagnifyingGlassZoomButtonGroup = new MagnifyingGlassZoomButtonGroup(zoomLevelProperty, {
            orientation: 'vertical',
            spacing: spacing,
            mouseAreaXDilation: 5,
            mouseAreaYDilation: 10,
            touchAreaXDilation: 5,
            touchAreaYDilation: 10
        });
        buttonGroups.push(verticalMagnifyingGlassZoomButtonGroup);
        const horizontalMagnifyingGlassZoomButtonGroup = new MagnifyingGlassZoomButtonGroup(zoomLevelProperty, {
            orientation: 'horizontal',
            spacing: spacing,
            mouseAreaXDilation: 10,
            mouseAreaYDilation: 5,
            touchAreaXDilation: 10,
            touchAreaYDilation: 5
        });
        buttonGroups.push(horizontalMagnifyingGlassZoomButtonGroup);
        const buttonGroupsHBox = new HBox({
            children: buttonGroups,
            spacing: 20,
            align: 'center',
            center: this.layoutBounds.center
        });
        //------------------------------------------------------------------------------------------------------
        // enabledProperty
        const buttonsEnabledProperty = new BooleanProperty(true);
        buttonsEnabledProperty.link((enabled)=>{
            pushButtons.forEach((button)=>{
                button.enabled = enabled;
            });
            toggleButtons.forEach((button)=>{
                button.enabled = enabled;
            });
        });
        const enabledText = new Text('Enabled', {
            font: new PhetFont(22)
        });
        const enabledCheckbox = new Checkbox(buttonsEnabledProperty, enabledText);
        //------------------------------------------------------------------------------------------------------
        // ScreenView layout
        this.addChild(new VBox({
            align: 'left',
            children: [
                new Text('Push buttons:', {
                    font: new PhetFont(24)
                }),
                pushButtonsHBox,
                new VStrut(20),
                new Text('Toggle buttons:', {
                    font: new PhetFont(24)
                }),
                toggleButtonsHBox,
                new VStrut(20),
                new Text('Button groups:', {
                    font: new PhetFont(24)
                }),
                buttonGroupsHBox,
                new VStrut(20),
                new Text('Tests:', {
                    font: new PhetFont(24)
                }),
                enabledCheckbox
            ],
            spacing: 10,
            center: this.layoutBounds.center
        }));
    }
};
export { ButtonsScreenView as default };
sceneryPhet.register('ButtonsScreenView', ButtonsScreenView);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9kZW1vL2J1dHRvbnMvQnV0dG9uc1NjcmVlblZpZXcudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTQtMjAyNCwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbi8qKlxuICogRGVtb25zdHJhdGlvbiBvZiBzY2VuZXJ5LXBoZXQgYnV0dG9uc1xuICpcbiAqIEBhdXRob3IgU2FtIFJlaWQgKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXG4gKiBAYXV0aG9yIENocmlzIE1hbGxleSAoUGl4ZWxab29tLCBJbmMuKVxuICovXG5cbmltcG9ydCBCb29sZWFuUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9Cb29sZWFuUHJvcGVydHkuanMnO1xuaW1wb3J0IE51bWJlclByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvTnVtYmVyUHJvcGVydHkuanMnO1xuaW1wb3J0IFByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvUHJvcGVydHkuanMnO1xuaW1wb3J0IFJhbmdlIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9SYW5nZS5qcyc7XG5pbXBvcnQgU2NyZWVuVmlldywgeyBTY3JlZW5WaWV3T3B0aW9ucyB9IGZyb20gJy4uLy4uLy4uLy4uL2pvaXN0L2pzL1NjcmVlblZpZXcuanMnO1xuaW1wb3J0IHsgRW1wdHlTZWxmT3B0aW9ucyB9IGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9vcHRpb25pemUuanMnO1xuaW1wb3J0IFBpY2tSZXF1aXJlZCBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvdHlwZXMvUGlja1JlcXVpcmVkLmpzJztcbmltcG9ydCB7IEhCb3gsIFRleHQsIFZCb3gsIFZTdHJ1dCB9IGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XG5pbXBvcnQgQnV0dG9uTm9kZSBmcm9tICcuLi8uLi8uLi8uLi9zdW4vanMvYnV0dG9ucy9CdXR0b25Ob2RlLmpzJztcbmltcG9ydCBDaGVja2JveCBmcm9tICcuLi8uLi8uLi8uLi9zdW4vanMvQ2hlY2tib3guanMnO1xuaW1wb3J0IFRhbmRlbSBmcm9tICcuLi8uLi8uLi8uLi90YW5kZW0vanMvVGFuZGVtLmpzJztcbmltcG9ydCBCYWNrQnV0dG9uIGZyb20gJy4uLy4uL2J1dHRvbnMvQmFja0J1dHRvbi5qcyc7XG5pbXBvcnQgQ2FtZXJhQnV0dG9uIGZyb20gJy4uLy4uL2J1dHRvbnMvQ2FtZXJhQnV0dG9uLmpzJztcbmltcG9ydCBDbG9zZUJ1dHRvbiBmcm9tICcuLi8uLi9idXR0b25zL0Nsb3NlQnV0dG9uLmpzJztcbmltcG9ydCBFcmFzZXJCdXR0b24gZnJvbSAnLi4vLi4vYnV0dG9ucy9FcmFzZXJCdXR0b24uanMnO1xuaW1wb3J0IEV5ZVRvZ2dsZUJ1dHRvbiBmcm9tICcuLi8uLi9idXR0b25zL0V5ZVRvZ2dsZUJ1dHRvbi5qcyc7XG5pbXBvcnQgSW5mb0J1dHRvbiBmcm9tICcuLi8uLi9idXR0b25zL0luZm9CdXR0b24uanMnO1xuaW1wb3J0IE1vdmVUb1RyYXNoQnV0dG9uIGZyb20gJy4uLy4uL2J1dHRvbnMvTW92ZVRvVHJhc2hCdXR0b24uanMnO1xuaW1wb3J0IE1vdmVUb1RyYXNoTGVnZW5kQnV0dG9uIGZyb20gJy4uLy4uL2J1dHRvbnMvTW92ZVRvVHJhc2hMZWdlbmRCdXR0b24uanMnO1xuaW1wb3J0IFBsYXlQYXVzZUJ1dHRvbiBmcm9tICcuLi8uLi9idXR0b25zL1BsYXlQYXVzZUJ1dHRvbi5qcyc7XG5pbXBvcnQgUGxheVN0b3BCdXR0b24gZnJvbSAnLi4vLi4vYnV0dG9ucy9QbGF5U3RvcEJ1dHRvbi5qcyc7XG5pbXBvcnQgUmVjb3JkU3RvcEJ1dHRvbiBmcm9tICcuLi8uLi9idXR0b25zL1JlY29yZFN0b3BCdXR0b24uanMnO1xuaW1wb3J0IFJlZnJlc2hCdXR0b24gZnJvbSAnLi4vLi4vYnV0dG9ucy9SZWZyZXNoQnV0dG9uLmpzJztcbmltcG9ydCBSZXNldEFsbEJ1dHRvbiBmcm9tICcuLi8uLi9idXR0b25zL1Jlc2V0QWxsQnV0dG9uLmpzJztcbmltcG9ydCBSZXNldEJ1dHRvbiBmcm9tICcuLi8uLi9idXR0b25zL1Jlc2V0QnV0dG9uLmpzJztcbmltcG9ydCBSZXN0YXJ0QnV0dG9uIGZyb20gJy4uLy4uL2J1dHRvbnMvUmVzdGFydEJ1dHRvbi5qcyc7XG5pbXBvcnQgUmV0dXJuQnV0dG9uIGZyb20gJy4uLy4uL2J1dHRvbnMvUmV0dXJuQnV0dG9uLmpzJztcbmltcG9ydCBTb3VuZFRvZ2dsZUJ1dHRvbiBmcm9tICcuLi8uLi9idXR0b25zL1NvdW5kVG9nZ2xlQnV0dG9uLmpzJztcbmltcG9ydCBTdGFyQnV0dG9uIGZyb20gJy4uLy4uL2J1dHRvbnMvU3RhckJ1dHRvbi5qcyc7XG5pbXBvcnQgU3RlcEJhY2t3YXJkQnV0dG9uIGZyb20gJy4uLy4uL2J1dHRvbnMvU3RlcEJhY2t3YXJkQnV0dG9uLmpzJztcbmltcG9ydCBTdGVwRm9yd2FyZEJ1dHRvbiBmcm9tICcuLi8uLi9idXR0b25zL1N0ZXBGb3J3YXJkQnV0dG9uLmpzJztcbmltcG9ydCBUaW1lclRvZ2dsZUJ1dHRvbiBmcm9tICcuLi8uLi9idXR0b25zL1RpbWVyVG9nZ2xlQnV0dG9uLmpzJztcbmltcG9ydCBUcmFzaEJ1dHRvbiBmcm9tICcuLi8uLi9idXR0b25zL1RyYXNoQnV0dG9uLmpzJztcbmltcG9ydCBab29tQnV0dG9uIGZyb20gJy4uLy4uL2J1dHRvbnMvWm9vbUJ1dHRvbi5qcyc7XG5pbXBvcnQgTWFnbmlmeWluZ0dsYXNzWm9vbUJ1dHRvbkdyb3VwIGZyb20gJy4uLy4uL01hZ25pZnlpbmdHbGFzc1pvb21CdXR0b25Hcm91cC5qcyc7XG5pbXBvcnQgUGhldEZvbnQgZnJvbSAnLi4vLi4vUGhldEZvbnQuanMnO1xuaW1wb3J0IFBsdXNNaW51c1pvb21CdXR0b25Hcm91cCBmcm9tICcuLi8uLi9QbHVzTWludXNab29tQnV0dG9uR3JvdXAuanMnO1xuaW1wb3J0IHNjZW5lcnlQaGV0IGZyb20gJy4uLy4uL3NjZW5lcnlQaGV0LmpzJztcblxudHlwZSBTZWxmT3B0aW9ucyA9IEVtcHR5U2VsZk9wdGlvbnM7XG50eXBlIEJ1dHRvbnNTY3JlZW5WaWV3T3B0aW9ucyA9IFNlbGZPcHRpb25zICYgUGlja1JlcXVpcmVkPFNjcmVlblZpZXdPcHRpb25zLCAndGFuZGVtJz47XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEJ1dHRvbnNTY3JlZW5WaWV3IGV4dGVuZHMgU2NyZWVuVmlldyB7XG5cbiAgcHVibGljIGNvbnN0cnVjdG9yKCBwcm92aWRlZE9wdGlvbnM6IEJ1dHRvbnNTY3JlZW5WaWV3T3B0aW9ucyApIHtcblxuICAgIHN1cGVyKCBwcm92aWRlZE9wdGlvbnMgKTtcblxuICAgIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgLy8gUHVzaCBidXR0b25zXG5cbiAgICBjb25zdCBwdXNoQnV0dG9uczogQnV0dG9uTm9kZVtdID0gW107XG5cbiAgICBjb25zdCBiYWNrQnV0dG9uID0gbmV3IEJhY2tCdXR0b24oIHtcbiAgICAgIGxpc3RlbmVyOiAoKSA9PiBjb25zb2xlLmxvZyggJ0JhY2tCdXR0b24gcHJlc3NlZCcgKVxuICAgIH0gKTtcbiAgICBwdXNoQnV0dG9ucy5wdXNoKCBiYWNrQnV0dG9uICk7XG5cbiAgICBjb25zdCBjbG9zZUJ1dHRvbiA9IG5ldyBDbG9zZUJ1dHRvbigge1xuICAgICAgbGlzdGVuZXI6ICgpID0+IGNvbnNvbGUubG9nKCAnQ2xvc2VCdXR0b24gcHJlc3NlZCcgKVxuICAgIH0gKTtcbiAgICBwdXNoQnV0dG9ucy5wdXNoKCBjbG9zZUJ1dHRvbiApO1xuXG4gICAgY29uc3QgZXJhc2VyQnV0dG9uID0gbmV3IEVyYXNlckJ1dHRvbigge1xuICAgICAgbGlzdGVuZXI6ICgpID0+IGNvbnNvbGUubG9nKCAnRXJhc2VyQnV0dG9uIHByZXNzZWQnIClcbiAgICB9ICk7XG4gICAgcHVzaEJ1dHRvbnMucHVzaCggZXJhc2VyQnV0dG9uICk7XG5cbiAgICBjb25zdCByZXNldEJ1dHRvbiA9IG5ldyBSZXNldEJ1dHRvbigge1xuICAgICAgbGlzdGVuZXI6ICgpID0+IGNvbnNvbGUubG9nKCAnUmVzZXRCdXR0b24gcHJlc3NlZCcgKVxuICAgIH0gKTtcbiAgICBwdXNoQnV0dG9ucy5wdXNoKCByZXNldEJ1dHRvbiApO1xuXG4gICAgY29uc3QgcmVzdGFydEJ1dHRvbiA9IG5ldyBSZXN0YXJ0QnV0dG9uKCB7XG4gICAgICBsaXN0ZW5lcjogKCkgPT4gY29uc29sZS5sb2coICdSZXN0YXJ0QnV0dG9uIHByZXNzZWQnIClcbiAgICB9ICk7XG4gICAgcHVzaEJ1dHRvbnMucHVzaCggcmVzdGFydEJ1dHRvbiApO1xuXG4gICAgY29uc3Qgc3RhckJ1dHRvbiA9IG5ldyBTdGFyQnV0dG9uKCB7XG4gICAgICBsaXN0ZW5lcjogKCkgPT4gY29uc29sZS5sb2coICdTdGFyQnV0dG9uIHByZXNzZWQnIClcbiAgICB9ICk7XG4gICAgcHVzaEJ1dHRvbnMucHVzaCggc3RhckJ1dHRvbiApO1xuXG4gICAgY29uc3Qgc3RlcEJhY2t3YXJkQnV0dG9uID0gbmV3IFN0ZXBCYWNrd2FyZEJ1dHRvbigge1xuICAgICAgbGlzdGVuZXI6ICgpID0+IGNvbnNvbGUubG9nKCAnU3RlcEJhY2t3YXJkQnV0dG9uIHByZXNzZWQnIClcbiAgICB9ICk7XG4gICAgcHVzaEJ1dHRvbnMucHVzaCggc3RlcEJhY2t3YXJkQnV0dG9uICk7XG5cbiAgICBjb25zdCBzdGVwRm9yd2FyZEJ1dHRvbiA9IG5ldyBTdGVwRm9yd2FyZEJ1dHRvbigge1xuICAgICAgbGlzdGVuZXI6ICgpID0+IGNvbnNvbGUubG9nKCAnU3RlcEZvcndhcmRCdXR0b24gcHJlc3NlZCcgKVxuICAgIH0gKTtcbiAgICBwdXNoQnV0dG9ucy5wdXNoKCBzdGVwRm9yd2FyZEJ1dHRvbiApO1xuXG4gICAgY29uc3Qgem9vbUJ1dHRvbiA9IG5ldyBab29tQnV0dG9uKCB7XG4gICAgICBsaXN0ZW5lcjogKCkgPT4gY29uc29sZS5sb2coICdab29tQnV0dG9uIHByZXNzZWQnIClcbiAgICB9ICk7XG4gICAgcHVzaEJ1dHRvbnMucHVzaCggem9vbUJ1dHRvbiApO1xuXG4gICAgY29uc3QgaW5mb0J1dHRvbiA9IG5ldyBJbmZvQnV0dG9uKCB7XG4gICAgICBsaXN0ZW5lcjogKCkgPT4gY29uc29sZS5sb2coICdJbmZvQnV0dG9uIHByZXNzZWQnIClcbiAgICB9ICk7XG4gICAgcHVzaEJ1dHRvbnMucHVzaCggaW5mb0J1dHRvbiApO1xuXG4gICAgY29uc3QgcmVmcmVzaEJ1dHRvbiA9IG5ldyBSZWZyZXNoQnV0dG9uKCB7XG4gICAgICBsaXN0ZW5lcjogKCkgPT4gY29uc29sZS5sb2coICdSZWZyZXNoQnV0dG9uIHByZXNzZWQnIClcbiAgICB9ICk7XG4gICAgcHVzaEJ1dHRvbnMucHVzaCggcmVmcmVzaEJ1dHRvbiApO1xuXG4gICAgY29uc3QgdHJhc2hCdXR0b24gPSBuZXcgVHJhc2hCdXR0b24oIHtcbiAgICAgIGxpc3RlbmVyOiAoKSA9PiBjb25zb2xlLmxvZyggJ1RyYXNoQnV0dG9uIHByZXNzZWQnIClcbiAgICB9ICk7XG4gICAgcHVzaEJ1dHRvbnMucHVzaCggdHJhc2hCdXR0b24gKTtcblxuICAgIGNvbnN0IG1vdmVUb1RyYXNoQnV0dG9uID0gbmV3IE1vdmVUb1RyYXNoQnV0dG9uKCB7XG4gICAgICBhcnJvd0NvbG9yOiAncmVkJyxcbiAgICAgIGxpc3RlbmVyOiAoKSA9PiBjb25zb2xlLmxvZyggJ01vdmVUb1RyYXNoQnV0dG9uIHByZXNzZWQnIClcbiAgICB9ICk7XG4gICAgcHVzaEJ1dHRvbnMucHVzaCggbW92ZVRvVHJhc2hCdXR0b24gKTtcblxuICAgIHB1c2hCdXR0b25zLnB1c2goIG5ldyBNb3ZlVG9UcmFzaExlZ2VuZEJ1dHRvbigge1xuICAgICAgYXJyb3dDb2xvcjogJ3JlZCcsXG4gICAgICBsaXN0ZW5lcjogKCkgPT4gY29uc29sZS5sb2coICdNb3ZlVG9UcmFzaExlZ2VuZEJ1dHRvbiBwcmVzc2VkJyApXG4gICAgfSApICk7XG5cbiAgICBjb25zdCByZXNldEFsbEJ1dHRvbiA9IG5ldyBSZXNldEFsbEJ1dHRvbigge1xuICAgICAgbGlzdGVuZXI6ICgpID0+IGNvbnNvbGUubG9nKCAnUmVzZXRBbGxCdXR0b24gcHJlc3NlZCcgKVxuICAgIH0gKTtcbiAgICBwdXNoQnV0dG9ucy5wdXNoKCByZXNldEFsbEJ1dHRvbiApO1xuXG4gICAgY29uc3QgcmV0dXJuQnV0dG9uID0gbmV3IFJldHVybkJ1dHRvbigge1xuICAgICAgbGlzdGVuZXI6ICgpID0+IGNvbnNvbGUubG9nKCAnUmV0dXJuQnV0dG9uIHByZXNzZWQnIClcbiAgICB9ICk7XG4gICAgcHVzaEJ1dHRvbnMucHVzaCggcmV0dXJuQnV0dG9uICk7XG5cbiAgICBjb25zdCBjYW1lcmFCdXR0b24gPSBuZXcgQ2FtZXJhQnV0dG9uKCB7XG4gICAgICBsaXN0ZW5lcjogKCkgPT4gY29uc29sZS5sb2coICdjYW1lcmFCdXR0b24gcHJlc3NlZCcgKSxcbiAgICAgIHRhbmRlbTogVGFuZGVtLk9QVF9PVVRcbiAgICB9ICk7XG4gICAgcHVzaEJ1dHRvbnMucHVzaCggY2FtZXJhQnV0dG9uICk7XG5cbiAgICBjb25zdCBwdXNoQnV0dG9uc0hCb3ggPSBuZXcgSEJveCgge1xuICAgICAgY2hpbGRyZW46IHB1c2hCdXR0b25zLFxuICAgICAgc3BhY2luZzogMTAsXG4gICAgICBhbGlnbjogJ2NlbnRlcicsXG4gICAgICBjZW50ZXI6IHRoaXMubGF5b3V0Qm91bmRzLmNlbnRlclxuICAgIH0gKTtcblxuICAgIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgLy8gVG9nZ2xlIGJ1dHRvbnNcblxuICAgIGNvbnN0IHRvZ2dsZUJ1dHRvbnM6IEJ1dHRvbk5vZGVbXSA9IFtdO1xuXG4gICAgLy8gQWRkIGJ1dHRvbiBwcm9wZXJ0aWVzIGhlcmUsIHNvIHRoYXQgcmVzZXRBbGxCdXR0b24gZnVuY3Rpb25zIHByb3Blcmx5LlxuICAgIGNvbnN0IHRvZ2dsZUJ1dHRvblByb3BlcnRpZXMgPSB7XG4gICAgICBleWVPcGVuUHJvcGVydHk6IG5ldyBQcm9wZXJ0eSggdHJ1ZSApLFxuICAgICAgaXNQbGF5aW5nUHJvcGVydHk6IG5ldyBQcm9wZXJ0eSggdHJ1ZSApLFxuICAgICAgc3RvcEJ1dHRvbklzUGxheWluZ1Byb3BlcnR5OiBuZXcgUHJvcGVydHkoIGZhbHNlICksXG4gICAgICByZWNvcmRpbmdQcm9wZXJ0eTogbmV3IFByb3BlcnR5KCB0cnVlICksXG4gICAgICBzb3VuZEVuYWJsZWRQcm9wZXJ0eTogbmV3IFByb3BlcnR5KCB0cnVlICksXG4gICAgICB0aW1lckVuYWJsZWRQcm9wZXJ0eTogbmV3IFByb3BlcnR5KCB0cnVlIClcbiAgICB9O1xuXG4gICAgY29uc3QgZXllQnV0dG9uID0gbmV3IEV5ZVRvZ2dsZUJ1dHRvbiggdG9nZ2xlQnV0dG9uUHJvcGVydGllcy5leWVPcGVuUHJvcGVydHkgKTtcbiAgICB0b2dnbGVCdXR0b25Qcm9wZXJ0aWVzLmV5ZU9wZW5Qcm9wZXJ0eS5sYXp5TGluayhcbiAgICAgIGV5ZU9wZW4gPT4gY29uc29sZS5sb2coIGBFeWVUb2dnbGVCdXR0b24gcHJlc3NlZCwgZXllT3Blbj0ke2V5ZU9wZW59YCApXG4gICAgKTtcbiAgICB0b2dnbGVCdXR0b25zLnB1c2goIGV5ZUJ1dHRvbiApO1xuXG4gICAgY29uc3QgcGxheVBhdXNlQnV0dG9uID0gbmV3IFBsYXlQYXVzZUJ1dHRvbiggdG9nZ2xlQnV0dG9uUHJvcGVydGllcy5pc1BsYXlpbmdQcm9wZXJ0eSApO1xuICAgIHRvZ2dsZUJ1dHRvblByb3BlcnRpZXMuaXNQbGF5aW5nUHJvcGVydHkubGF6eUxpbmsoXG4gICAgICBwbGF5aW5nID0+IGNvbnNvbGUubG9nKCBgUGxheVBhdXNlQnV0dG9uIHByZXNzZWQsIHBsYXlpbmc9JHtwbGF5aW5nfWAgKVxuICAgICk7XG4gICAgdG9nZ2xlQnV0dG9ucy5wdXNoKCBwbGF5UGF1c2VCdXR0b24gKTtcblxuICAgIGNvbnN0IHBsYXlTdG9wQnV0dG9uID0gbmV3IFBsYXlTdG9wQnV0dG9uKCB0b2dnbGVCdXR0b25Qcm9wZXJ0aWVzLnN0b3BCdXR0b25Jc1BsYXlpbmdQcm9wZXJ0eSApO1xuICAgIHRvZ2dsZUJ1dHRvblByb3BlcnRpZXMuc3RvcEJ1dHRvbklzUGxheWluZ1Byb3BlcnR5LmxhenlMaW5rKFxuICAgICAgcGxheWluZyA9PiBjb25zb2xlLmxvZyggYFBsYXlTdG9wQnV0dG9uIHByZXNzZWQsIHBsYXlpbmc9JHtwbGF5aW5nfWAgKVxuICAgICk7XG4gICAgdG9nZ2xlQnV0dG9ucy5wdXNoKCBwbGF5U3RvcEJ1dHRvbiApO1xuXG4gICAgY29uc3QgcmVjb3JkU3RvcEJ1dHRvbiA9IG5ldyBSZWNvcmRTdG9wQnV0dG9uKCB0b2dnbGVCdXR0b25Qcm9wZXJ0aWVzLnJlY29yZGluZ1Byb3BlcnR5ICk7XG4gICAgdG9nZ2xlQnV0dG9uUHJvcGVydGllcy5yZWNvcmRpbmdQcm9wZXJ0eS5sYXp5TGluayhcbiAgICAgIHJlY29yZGluZyA9PiBjb25zb2xlLmxvZyggYFJlY29yZFN0b3BCdXR0b24gcHJlc3NlZCwgcmVjb3JkaW5nPSR7cmVjb3JkaW5nfWAgKVxuICAgICk7XG4gICAgdG9nZ2xlQnV0dG9ucy5wdXNoKCByZWNvcmRTdG9wQnV0dG9uICk7XG5cbiAgICBjb25zdCBzb3VuZFRvZ2dsZUJ1dHRvbiA9IG5ldyBTb3VuZFRvZ2dsZUJ1dHRvbiggdG9nZ2xlQnV0dG9uUHJvcGVydGllcy5zb3VuZEVuYWJsZWRQcm9wZXJ0eSApO1xuICAgIHRvZ2dsZUJ1dHRvblByb3BlcnRpZXMuc291bmRFbmFibGVkUHJvcGVydHkubGF6eUxpbmsoXG4gICAgICBzb3VuZEVuYWJsZWQgPT4gY29uc29sZS5sb2coIGBTb3VuZFRvZ2dsZUJ1dHRvbiBwcmVzc2VkLCBzb3VuZEVuYWJsZWQ9JHtzb3VuZEVuYWJsZWR9YCApXG4gICAgKTtcbiAgICB0b2dnbGVCdXR0b25zLnB1c2goIHNvdW5kVG9nZ2xlQnV0dG9uICk7XG5cbiAgICBjb25zdCB0aW1lclRvZ2dsZUJ1dHRvbiA9IG5ldyBUaW1lclRvZ2dsZUJ1dHRvbiggdG9nZ2xlQnV0dG9uUHJvcGVydGllcy50aW1lckVuYWJsZWRQcm9wZXJ0eSApO1xuICAgIHRvZ2dsZUJ1dHRvblByb3BlcnRpZXMudGltZXJFbmFibGVkUHJvcGVydHkubGF6eUxpbmsoXG4gICAgICB0aW1lckVuYWJsZWQgPT4gY29uc29sZS5sb2coIGBUaW1lclRvZ2dsZUJ1dHRvbiBwcmVzc2VkLCB0aW1lckVuYWJsZWQ9JHt0aW1lckVuYWJsZWR9YCApXG4gICAgKTtcbiAgICB0b2dnbGVCdXR0b25zLnB1c2goIHRpbWVyVG9nZ2xlQnV0dG9uICk7XG5cbiAgICBjb25zdCB0b2dnbGVCdXR0b25zSEJveCA9IG5ldyBIQm94KCB7XG4gICAgICBjaGlsZHJlbjogdG9nZ2xlQnV0dG9ucyxcbiAgICAgIHNwYWNpbmc6IDEwLFxuICAgICAgYWxpZ246ICdjZW50ZXInLFxuICAgICAgY2VudGVyOiB0aGlzLmxheW91dEJvdW5kcy5jZW50ZXJcbiAgICB9ICk7XG5cbiAgICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgIC8vIEJ1dHRvbiBncm91cHNcblxuICAgIGNvbnN0IGJ1dHRvbkdyb3VwcyA9IFtdO1xuXG4gICAgLy8gUHJvcGVydHkgc2hhcmVkIGJ5IFpvb21CdXR0b25Hcm91cHNcbiAgICBjb25zdCB6b29tTGV2ZWxQcm9wZXJ0eSA9IG5ldyBOdW1iZXJQcm9wZXJ0eSggMCwge1xuICAgICAgcmFuZ2U6IG5ldyBSYW5nZSggMCwgNSApXG4gICAgfSApO1xuICAgIHpvb21MZXZlbFByb3BlcnR5LmxhenlMaW5rKCB6b29tTGV2ZWwgPT4gY29uc29sZS5sb2coIGB6b29tTGV2ZWw9JHt6b29tTGV2ZWx9YCApICk7XG5cbiAgICAvLyBTcGFjaW5nIHNoYXJlZCBieSBab29tQnV0dG9uR3JvdXBzXG4gICAgLy8gQ2hhbmdlIHRoaXMgdmFsdWUgdG8gc2VlIGhvdyBwb2ludGVyIGFyZWFzIGFyZSBhZGp1c3RlZCB0byBwcmV2ZW50IG92ZXJsYXAuXG4gICAgLy8gU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9zY2VuZXJ5LXBoZXQvaXNzdWVzLzY1MFxuICAgIGNvbnN0IHNwYWNpbmcgPSAwO1xuXG4gICAgY29uc3QgdmVydGljYWxQbHVzTWludXNab29tQnV0dG9uR3JvdXAgPSBuZXcgUGx1c01pbnVzWm9vbUJ1dHRvbkdyb3VwKCB6b29tTGV2ZWxQcm9wZXJ0eSwge1xuICAgICAgb3JpZW50YXRpb246ICd2ZXJ0aWNhbCcsXG4gICAgICBzcGFjaW5nOiBzcGFjaW5nLFxuICAgICAgbW91c2VBcmVhWERpbGF0aW9uOiA1LFxuICAgICAgbW91c2VBcmVhWURpbGF0aW9uOiAxMCxcbiAgICAgIHRvdWNoQXJlYVhEaWxhdGlvbjogNSxcbiAgICAgIHRvdWNoQXJlYVlEaWxhdGlvbjogMTBcbiAgICB9ICk7XG4gICAgYnV0dG9uR3JvdXBzLnB1c2goIHZlcnRpY2FsUGx1c01pbnVzWm9vbUJ1dHRvbkdyb3VwICk7XG5cbiAgICBjb25zdCBob3Jpem9udGFsUGx1c01pbnVzWm9vbUJ1dHRvbkdyb3VwID0gbmV3IFBsdXNNaW51c1pvb21CdXR0b25Hcm91cCggem9vbUxldmVsUHJvcGVydHksIHtcbiAgICAgIG9yaWVudGF0aW9uOiAnaG9yaXpvbnRhbCcsXG4gICAgICBzcGFjaW5nOiBzcGFjaW5nLFxuICAgICAgbW91c2VBcmVhWERpbGF0aW9uOiAxMCxcbiAgICAgIG1vdXNlQXJlYVlEaWxhdGlvbjogNSxcbiAgICAgIHRvdWNoQXJlYVhEaWxhdGlvbjogMTAsXG4gICAgICB0b3VjaEFyZWFZRGlsYXRpb246IDVcbiAgICB9ICk7XG4gICAgYnV0dG9uR3JvdXBzLnB1c2goIGhvcml6b250YWxQbHVzTWludXNab29tQnV0dG9uR3JvdXAgKTtcblxuICAgIGNvbnN0IHZlcnRpY2FsTWFnbmlmeWluZ0dsYXNzWm9vbUJ1dHRvbkdyb3VwID0gbmV3IE1hZ25pZnlpbmdHbGFzc1pvb21CdXR0b25Hcm91cCggem9vbUxldmVsUHJvcGVydHksIHtcbiAgICAgIG9yaWVudGF0aW9uOiAndmVydGljYWwnLFxuICAgICAgc3BhY2luZzogc3BhY2luZyxcbiAgICAgIG1vdXNlQXJlYVhEaWxhdGlvbjogNSxcbiAgICAgIG1vdXNlQXJlYVlEaWxhdGlvbjogMTAsXG4gICAgICB0b3VjaEFyZWFYRGlsYXRpb246IDUsXG4gICAgICB0b3VjaEFyZWFZRGlsYXRpb246IDEwXG4gICAgfSApO1xuICAgIGJ1dHRvbkdyb3Vwcy5wdXNoKCB2ZXJ0aWNhbE1hZ25pZnlpbmdHbGFzc1pvb21CdXR0b25Hcm91cCApO1xuXG4gICAgY29uc3QgaG9yaXpvbnRhbE1hZ25pZnlpbmdHbGFzc1pvb21CdXR0b25Hcm91cCA9IG5ldyBNYWduaWZ5aW5nR2xhc3Nab29tQnV0dG9uR3JvdXAoIHpvb21MZXZlbFByb3BlcnR5LCB7XG4gICAgICBvcmllbnRhdGlvbjogJ2hvcml6b250YWwnLFxuICAgICAgc3BhY2luZzogc3BhY2luZyxcbiAgICAgIG1vdXNlQXJlYVhEaWxhdGlvbjogMTAsXG4gICAgICBtb3VzZUFyZWFZRGlsYXRpb246IDUsXG4gICAgICB0b3VjaEFyZWFYRGlsYXRpb246IDEwLFxuICAgICAgdG91Y2hBcmVhWURpbGF0aW9uOiA1XG4gICAgfSApO1xuICAgIGJ1dHRvbkdyb3Vwcy5wdXNoKCBob3Jpem9udGFsTWFnbmlmeWluZ0dsYXNzWm9vbUJ1dHRvbkdyb3VwICk7XG5cbiAgICBjb25zdCBidXR0b25Hcm91cHNIQm94ID0gbmV3IEhCb3goIHtcbiAgICAgIGNoaWxkcmVuOiBidXR0b25Hcm91cHMsXG4gICAgICBzcGFjaW5nOiAyMCxcbiAgICAgIGFsaWduOiAnY2VudGVyJyxcbiAgICAgIGNlbnRlcjogdGhpcy5sYXlvdXRCb3VuZHMuY2VudGVyXG4gICAgfSApO1xuXG4gICAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICAvLyBlbmFibGVkUHJvcGVydHlcblxuICAgIGNvbnN0IGJ1dHRvbnNFbmFibGVkUHJvcGVydHkgPSBuZXcgQm9vbGVhblByb3BlcnR5KCB0cnVlICk7XG4gICAgYnV0dG9uc0VuYWJsZWRQcm9wZXJ0eS5saW5rKCBlbmFibGVkID0+IHtcbiAgICAgIHB1c2hCdXR0b25zLmZvckVhY2goIGJ1dHRvbiA9PiB7XG4gICAgICAgIGJ1dHRvbi5lbmFibGVkID0gZW5hYmxlZDtcbiAgICAgIH0gKTtcbiAgICAgIHRvZ2dsZUJ1dHRvbnMuZm9yRWFjaCggYnV0dG9uID0+IHtcbiAgICAgICAgYnV0dG9uLmVuYWJsZWQgPSBlbmFibGVkO1xuICAgICAgfSApO1xuICAgIH0gKTtcblxuICAgIGNvbnN0IGVuYWJsZWRUZXh0ID0gbmV3IFRleHQoICdFbmFibGVkJywgeyBmb250OiBuZXcgUGhldEZvbnQoIDIyICkgfSApO1xuICAgIGNvbnN0IGVuYWJsZWRDaGVja2JveCA9IG5ldyBDaGVja2JveCggYnV0dG9uc0VuYWJsZWRQcm9wZXJ0eSwgZW5hYmxlZFRleHQgKTtcblxuICAgIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgLy8gU2NyZWVuVmlldyBsYXlvdXRcblxuICAgIHRoaXMuYWRkQ2hpbGQoIG5ldyBWQm94KCB7XG4gICAgICBhbGlnbjogJ2xlZnQnLFxuICAgICAgY2hpbGRyZW46IFtcbiAgICAgICAgbmV3IFRleHQoICdQdXNoIGJ1dHRvbnM6JywgeyBmb250OiBuZXcgUGhldEZvbnQoIDI0ICkgfSApLFxuICAgICAgICBwdXNoQnV0dG9uc0hCb3gsXG4gICAgICAgIG5ldyBWU3RydXQoIDIwICksXG4gICAgICAgIG5ldyBUZXh0KCAnVG9nZ2xlIGJ1dHRvbnM6JywgeyBmb250OiBuZXcgUGhldEZvbnQoIDI0ICkgfSApLFxuICAgICAgICB0b2dnbGVCdXR0b25zSEJveCxcbiAgICAgICAgbmV3IFZTdHJ1dCggMjAgKSxcbiAgICAgICAgbmV3IFRleHQoICdCdXR0b24gZ3JvdXBzOicsIHsgZm9udDogbmV3IFBoZXRGb250KCAyNCApIH0gKSxcbiAgICAgICAgYnV0dG9uR3JvdXBzSEJveCxcbiAgICAgICAgbmV3IFZTdHJ1dCggMjAgKSxcbiAgICAgICAgbmV3IFRleHQoICdUZXN0czonLCB7IGZvbnQ6IG5ldyBQaGV0Rm9udCggMjQgKSB9ICksXG4gICAgICAgIGVuYWJsZWRDaGVja2JveFxuICAgICAgXSxcbiAgICAgIHNwYWNpbmc6IDEwLFxuICAgICAgY2VudGVyOiB0aGlzLmxheW91dEJvdW5kcy5jZW50ZXJcbiAgICB9ICkgKTtcbiAgfVxufVxuXG5zY2VuZXJ5UGhldC5yZWdpc3RlciggJ0J1dHRvbnNTY3JlZW5WaWV3JywgQnV0dG9uc1NjcmVlblZpZXcgKTsiXSwibmFtZXMiOlsiQm9vbGVhblByb3BlcnR5IiwiTnVtYmVyUHJvcGVydHkiLCJQcm9wZXJ0eSIsIlJhbmdlIiwiU2NyZWVuVmlldyIsIkhCb3giLCJUZXh0IiwiVkJveCIsIlZTdHJ1dCIsIkNoZWNrYm94IiwiVGFuZGVtIiwiQmFja0J1dHRvbiIsIkNhbWVyYUJ1dHRvbiIsIkNsb3NlQnV0dG9uIiwiRXJhc2VyQnV0dG9uIiwiRXllVG9nZ2xlQnV0dG9uIiwiSW5mb0J1dHRvbiIsIk1vdmVUb1RyYXNoQnV0dG9uIiwiTW92ZVRvVHJhc2hMZWdlbmRCdXR0b24iLCJQbGF5UGF1c2VCdXR0b24iLCJQbGF5U3RvcEJ1dHRvbiIsIlJlY29yZFN0b3BCdXR0b24iLCJSZWZyZXNoQnV0dG9uIiwiUmVzZXRBbGxCdXR0b24iLCJSZXNldEJ1dHRvbiIsIlJlc3RhcnRCdXR0b24iLCJSZXR1cm5CdXR0b24iLCJTb3VuZFRvZ2dsZUJ1dHRvbiIsIlN0YXJCdXR0b24iLCJTdGVwQmFja3dhcmRCdXR0b24iLCJTdGVwRm9yd2FyZEJ1dHRvbiIsIlRpbWVyVG9nZ2xlQnV0dG9uIiwiVHJhc2hCdXR0b24iLCJab29tQnV0dG9uIiwiTWFnbmlmeWluZ0dsYXNzWm9vbUJ1dHRvbkdyb3VwIiwiUGhldEZvbnQiLCJQbHVzTWludXNab29tQnV0dG9uR3JvdXAiLCJzY2VuZXJ5UGhldCIsIkJ1dHRvbnNTY3JlZW5WaWV3IiwicHJvdmlkZWRPcHRpb25zIiwicHVzaEJ1dHRvbnMiLCJiYWNrQnV0dG9uIiwibGlzdGVuZXIiLCJjb25zb2xlIiwibG9nIiwicHVzaCIsImNsb3NlQnV0dG9uIiwiZXJhc2VyQnV0dG9uIiwicmVzZXRCdXR0b24iLCJyZXN0YXJ0QnV0dG9uIiwic3RhckJ1dHRvbiIsInN0ZXBCYWNrd2FyZEJ1dHRvbiIsInN0ZXBGb3J3YXJkQnV0dG9uIiwiem9vbUJ1dHRvbiIsImluZm9CdXR0b24iLCJyZWZyZXNoQnV0dG9uIiwidHJhc2hCdXR0b24iLCJtb3ZlVG9UcmFzaEJ1dHRvbiIsImFycm93Q29sb3IiLCJyZXNldEFsbEJ1dHRvbiIsInJldHVybkJ1dHRvbiIsImNhbWVyYUJ1dHRvbiIsInRhbmRlbSIsIk9QVF9PVVQiLCJwdXNoQnV0dG9uc0hCb3giLCJjaGlsZHJlbiIsInNwYWNpbmciLCJhbGlnbiIsImNlbnRlciIsImxheW91dEJvdW5kcyIsInRvZ2dsZUJ1dHRvbnMiLCJ0b2dnbGVCdXR0b25Qcm9wZXJ0aWVzIiwiZXllT3BlblByb3BlcnR5IiwiaXNQbGF5aW5nUHJvcGVydHkiLCJzdG9wQnV0dG9uSXNQbGF5aW5nUHJvcGVydHkiLCJyZWNvcmRpbmdQcm9wZXJ0eSIsInNvdW5kRW5hYmxlZFByb3BlcnR5IiwidGltZXJFbmFibGVkUHJvcGVydHkiLCJleWVCdXR0b24iLCJsYXp5TGluayIsImV5ZU9wZW4iLCJwbGF5UGF1c2VCdXR0b24iLCJwbGF5aW5nIiwicGxheVN0b3BCdXR0b24iLCJyZWNvcmRTdG9wQnV0dG9uIiwicmVjb3JkaW5nIiwic291bmRUb2dnbGVCdXR0b24iLCJzb3VuZEVuYWJsZWQiLCJ0aW1lclRvZ2dsZUJ1dHRvbiIsInRpbWVyRW5hYmxlZCIsInRvZ2dsZUJ1dHRvbnNIQm94IiwiYnV0dG9uR3JvdXBzIiwiem9vbUxldmVsUHJvcGVydHkiLCJyYW5nZSIsInpvb21MZXZlbCIsInZlcnRpY2FsUGx1c01pbnVzWm9vbUJ1dHRvbkdyb3VwIiwib3JpZW50YXRpb24iLCJtb3VzZUFyZWFYRGlsYXRpb24iLCJtb3VzZUFyZWFZRGlsYXRpb24iLCJ0b3VjaEFyZWFYRGlsYXRpb24iLCJ0b3VjaEFyZWFZRGlsYXRpb24iLCJob3Jpem9udGFsUGx1c01pbnVzWm9vbUJ1dHRvbkdyb3VwIiwidmVydGljYWxNYWduaWZ5aW5nR2xhc3Nab29tQnV0dG9uR3JvdXAiLCJob3Jpem9udGFsTWFnbmlmeWluZ0dsYXNzWm9vbUJ1dHRvbkdyb3VwIiwiYnV0dG9uR3JvdXBzSEJveCIsImJ1dHRvbnNFbmFibGVkUHJvcGVydHkiLCJsaW5rIiwiZW5hYmxlZCIsImZvckVhY2giLCJidXR0b24iLCJlbmFibGVkVGV4dCIsImZvbnQiLCJlbmFibGVkQ2hlY2tib3giLCJhZGRDaGlsZCIsInJlZ2lzdGVyIl0sIm1hcHBpbmdzIjoiQUFBQSxzREFBc0Q7QUFFdEQ7Ozs7O0NBS0MsR0FFRCxPQUFPQSxxQkFBcUIseUNBQXlDO0FBQ3JFLE9BQU9DLG9CQUFvQix3Q0FBd0M7QUFDbkUsT0FBT0MsY0FBYyxrQ0FBa0M7QUFDdkQsT0FBT0MsV0FBVyw4QkFBOEI7QUFDaEQsT0FBT0MsZ0JB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