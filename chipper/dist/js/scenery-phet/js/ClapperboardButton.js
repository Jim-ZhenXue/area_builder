// Copyright 2022-2024, University of Colorado Boulder
/**
 * A Node that produces a variety of loud outputs to support data synchronizing during a recording.
 * This includes sound, visuals, and the PhET-iO data stream.
 *
 * This is prototype code and intended to be used in studies with users to assist with data collection.
 * Not a typical UI component.
 *
 * Next time this is used: Would be nice to emit a PhET-iO state when triggered
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */ import stepTimer from '../../axon/js/stepTimer.js';
import optionize, { combineOptions } from '../../phet-core/js/optionize.js';
import { Node, Path, RichText } from '../../scenery/js/imports.js';
import videoSolidShape from '../../sherpa/js/fontawesome-5/videoSolidShape.js';
import RectangularPushButton from '../../sun/js/buttons/RectangularPushButton.js';
import OscillatorSoundGenerator from '../../tambo/js/sound-generators/OscillatorSoundGenerator.js';
import soundManager from '../../tambo/js/soundManager.js';
import Tandem from '../../tandem/js/Tandem.js';
import BackgroundNode from './BackgroundNode.js';
import sceneryPhet from './sceneryPhet.js';
const SOUND_DURATION = 1000;
const BUTTON_LABEL = 'Synchronize Recording';
let ClapperboardButton = class ClapperboardButton extends Node {
    dispose() {
        this.disposeClapperboardButton();
        super.dispose();
    }
    constructor(providedOptions){
        // A single waveform with a high pitch should hopefully be easy to find in recordings,
        // see https://github.com/phetsims/scenery-phet/issues/739#issuecomment-1142395903
        const soundGenerator = new OscillatorSoundGenerator({
            initialFrequency: 880
        });
        soundManager.addSoundGenerator(soundGenerator);
        const options = optionize()({
            excludeInvisibleChildrenFromBounds: true,
            visualNode: new BackgroundNode(new Path(videoSolidShape, {
                scale: 2,
                fill: 'red'
            }), {
                xMargin: 20,
                yMargin: 20,
                rectangleOptions: {
                    fill: 'black',
                    opacity: 1
                }
            }),
            synchronizeButtonOptions: {
                content: new RichText(BUTTON_LABEL),
                innerContent: BUTTON_LABEL,
                voicingNameResponse: BUTTON_LABEL,
                soundPlayer: {
                    play: ()=>{
                        soundGenerator.play();
                    },
                    stop: _.noop
                }
            },
            // phet-io
            tandem: Tandem.REQUIRED,
            tandemNameSuffix: 'Button'
        }, providedOptions);
        super(options);
        options.visualNode.visible = false;
        this.addChild(options.visualNode);
        const synchronizeButton = new RectangularPushButton(combineOptions({
            listener: ()=>{
                // so that this listener cannot be called more than once
                synchronizeButton.enabled = false;
                options.visualNode.visible = true;
                stepTimer.setTimeout(()=>{
                    options.visualNode.visible = false;
                    soundGenerator.stop();
                }, SOUND_DURATION);
            },
            tandem: options.tandem.createTandem('synchronizeButton')
        }, options.synchronizeButtonOptions));
        this.addChild(synchronizeButton);
        this.disposeClapperboardButton = ()=>{
            synchronizeButton.dispose();
        };
    }
};
sceneryPhet.register('ClapperboardButton', ClapperboardButton);
export default ClapperboardButton;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9DbGFwcGVyYm9hcmRCdXR0b24udHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjItMjAyNCwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbi8qKlxuICogQSBOb2RlIHRoYXQgcHJvZHVjZXMgYSB2YXJpZXR5IG9mIGxvdWQgb3V0cHV0cyB0byBzdXBwb3J0IGRhdGEgc3luY2hyb25pemluZyBkdXJpbmcgYSByZWNvcmRpbmcuXG4gKiBUaGlzIGluY2x1ZGVzIHNvdW5kLCB2aXN1YWxzLCBhbmQgdGhlIFBoRVQtaU8gZGF0YSBzdHJlYW0uXG4gKlxuICogVGhpcyBpcyBwcm90b3R5cGUgY29kZSBhbmQgaW50ZW5kZWQgdG8gYmUgdXNlZCBpbiBzdHVkaWVzIHdpdGggdXNlcnMgdG8gYXNzaXN0IHdpdGggZGF0YSBjb2xsZWN0aW9uLlxuICogTm90IGEgdHlwaWNhbCBVSSBjb21wb25lbnQuXG4gKlxuICogTmV4dCB0aW1lIHRoaXMgaXMgdXNlZDogV291bGQgYmUgbmljZSB0byBlbWl0IGEgUGhFVC1pTyBzdGF0ZSB3aGVuIHRyaWdnZXJlZFxuICpcbiAqIEBhdXRob3IgTWljaGFlbCBLYXV6bWFubiAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcbiAqL1xuXG5pbXBvcnQgc3RlcFRpbWVyIGZyb20gJy4uLy4uL2F4b24vanMvc3RlcFRpbWVyLmpzJztcbmltcG9ydCBvcHRpb25pemUsIHsgY29tYmluZU9wdGlvbnMgfSBmcm9tICcuLi8uLi9waGV0LWNvcmUvanMvb3B0aW9uaXplLmpzJztcbmltcG9ydCBTdHJpY3RPbWl0IGZyb20gJy4uLy4uL3BoZXQtY29yZS9qcy90eXBlcy9TdHJpY3RPbWl0LmpzJztcbmltcG9ydCB7IE5vZGUsIE5vZGVPcHRpb25zLCBQYXRoLCBSaWNoVGV4dCB9IGZyb20gJy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XG5pbXBvcnQgdmlkZW9Tb2xpZFNoYXBlIGZyb20gJy4uLy4uL3NoZXJwYS9qcy9mb250YXdlc29tZS01L3ZpZGVvU29saWRTaGFwZS5qcyc7XG5pbXBvcnQgUmVjdGFuZ3VsYXJQdXNoQnV0dG9uLCB7IFJlY3Rhbmd1bGFyUHVzaEJ1dHRvbk9wdGlvbnMgfSBmcm9tICcuLi8uLi9zdW4vanMvYnV0dG9ucy9SZWN0YW5ndWxhclB1c2hCdXR0b24uanMnO1xuaW1wb3J0IE9zY2lsbGF0b3JTb3VuZEdlbmVyYXRvciBmcm9tICcuLi8uLi90YW1iby9qcy9zb3VuZC1nZW5lcmF0b3JzL09zY2lsbGF0b3JTb3VuZEdlbmVyYXRvci5qcyc7XG5pbXBvcnQgc291bmRNYW5hZ2VyIGZyb20gJy4uLy4uL3RhbWJvL2pzL3NvdW5kTWFuYWdlci5qcyc7XG5pbXBvcnQgVGFuZGVtIGZyb20gJy4uLy4uL3RhbmRlbS9qcy9UYW5kZW0uanMnO1xuaW1wb3J0IEJhY2tncm91bmROb2RlIGZyb20gJy4vQmFja2dyb3VuZE5vZGUuanMnO1xuaW1wb3J0IHNjZW5lcnlQaGV0IGZyb20gJy4vc2NlbmVyeVBoZXQuanMnO1xuXG5jb25zdCBTT1VORF9EVVJBVElPTiA9IDEwMDA7XG5jb25zdCBCVVRUT05fTEFCRUwgPSAnU3luY2hyb25pemUgUmVjb3JkaW5nJztcblxudHlwZSBTZWxmT3B0aW9ucyA9IHtcbiAgdmlzdWFsTm9kZT86IE5vZGU7XG4gIHN5bmNocm9uaXplQnV0dG9uT3B0aW9ucz86IFN0cmljdE9taXQ8UmVjdGFuZ3VsYXJQdXNoQnV0dG9uT3B0aW9ucywgJ2xpc3RlbmVyJyB8ICd0YW5kZW0nPjtcbn07XG5cbnR5cGUgQ2xhcHBlcmJvYXJkQnV0dG9uT3B0aW9ucyA9IFNlbGZPcHRpb25zICYgTm9kZU9wdGlvbnM7XG5cbmNsYXNzIENsYXBwZXJib2FyZEJ1dHRvbiBleHRlbmRzIE5vZGUge1xuICBwcml2YXRlIHJlYWRvbmx5IGRpc3Bvc2VDbGFwcGVyYm9hcmRCdXR0b246ICgpID0+IHZvaWQ7XG5cbiAgcHVibGljIGNvbnN0cnVjdG9yKCBwcm92aWRlZE9wdGlvbnM/OiBDbGFwcGVyYm9hcmRCdXR0b25PcHRpb25zICkge1xuXG4gICAgLy8gQSBzaW5nbGUgd2F2ZWZvcm0gd2l0aCBhIGhpZ2ggcGl0Y2ggc2hvdWxkIGhvcGVmdWxseSBiZSBlYXN5IHRvIGZpbmQgaW4gcmVjb3JkaW5ncyxcbiAgICAvLyBzZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3NjZW5lcnktcGhldC9pc3N1ZXMvNzM5I2lzc3VlY29tbWVudC0xMTQyMzk1OTAzXG4gICAgY29uc3Qgc291bmRHZW5lcmF0b3IgPSBuZXcgT3NjaWxsYXRvclNvdW5kR2VuZXJhdG9yKCB7XG4gICAgICBpbml0aWFsRnJlcXVlbmN5OiA4ODBcbiAgICB9ICk7XG4gICAgc291bmRNYW5hZ2VyLmFkZFNvdW5kR2VuZXJhdG9yKCBzb3VuZEdlbmVyYXRvciApO1xuXG4gICAgY29uc3Qgb3B0aW9ucyA9IG9wdGlvbml6ZTxDbGFwcGVyYm9hcmRCdXR0b25PcHRpb25zLCBTZWxmT3B0aW9ucywgTm9kZU9wdGlvbnM+KCkoIHtcbiAgICAgIGV4Y2x1ZGVJbnZpc2libGVDaGlsZHJlbkZyb21Cb3VuZHM6IHRydWUsXG4gICAgICB2aXN1YWxOb2RlOiBuZXcgQmFja2dyb3VuZE5vZGUoIG5ldyBQYXRoKCB2aWRlb1NvbGlkU2hhcGUsIHsgc2NhbGU6IDIsIGZpbGw6ICdyZWQnIH0gKSwge1xuICAgICAgICB4TWFyZ2luOiAyMCxcbiAgICAgICAgeU1hcmdpbjogMjAsXG4gICAgICAgIHJlY3RhbmdsZU9wdGlvbnM6IHtcbiAgICAgICAgICBmaWxsOiAnYmxhY2snLFxuICAgICAgICAgIG9wYWNpdHk6IDFcbiAgICAgICAgfVxuICAgICAgfSApLFxuICAgICAgc3luY2hyb25pemVCdXR0b25PcHRpb25zOiB7XG4gICAgICAgIGNvbnRlbnQ6IG5ldyBSaWNoVGV4dCggQlVUVE9OX0xBQkVMICksXG4gICAgICAgIGlubmVyQ29udGVudDogQlVUVE9OX0xBQkVMLFxuICAgICAgICB2b2ljaW5nTmFtZVJlc3BvbnNlOiBCVVRUT05fTEFCRUwsXG4gICAgICAgIHNvdW5kUGxheWVyOiB7XG4gICAgICAgICAgcGxheTogKCkgPT4ge1xuICAgICAgICAgICAgc291bmRHZW5lcmF0b3IucGxheSgpO1xuICAgICAgICAgIH0sXG4gICAgICAgICAgc3RvcDogXy5ub29wXG4gICAgICAgIH1cbiAgICAgIH0sXG5cbiAgICAgIC8vIHBoZXQtaW9cbiAgICAgIHRhbmRlbTogVGFuZGVtLlJFUVVJUkVELFxuICAgICAgdGFuZGVtTmFtZVN1ZmZpeDogJ0J1dHRvbidcbiAgICB9LCBwcm92aWRlZE9wdGlvbnMgKTtcblxuICAgIHN1cGVyKCBvcHRpb25zICk7XG5cbiAgICBvcHRpb25zLnZpc3VhbE5vZGUudmlzaWJsZSA9IGZhbHNlO1xuICAgIHRoaXMuYWRkQ2hpbGQoIG9wdGlvbnMudmlzdWFsTm9kZSApO1xuXG4gICAgY29uc3Qgc3luY2hyb25pemVCdXR0b24gPSBuZXcgUmVjdGFuZ3VsYXJQdXNoQnV0dG9uKCBjb21iaW5lT3B0aW9uczxSZWN0YW5ndWxhclB1c2hCdXR0b25PcHRpb25zPigge1xuICAgICAgbGlzdGVuZXI6ICgpID0+IHtcblxuICAgICAgICAvLyBzbyB0aGF0IHRoaXMgbGlzdGVuZXIgY2Fubm90IGJlIGNhbGxlZCBtb3JlIHRoYW4gb25jZVxuICAgICAgICBzeW5jaHJvbml6ZUJ1dHRvbi5lbmFibGVkID0gZmFsc2U7XG5cbiAgICAgICAgb3B0aW9ucy52aXN1YWxOb2RlLnZpc2libGUgPSB0cnVlO1xuICAgICAgICBzdGVwVGltZXIuc2V0VGltZW91dCggKCkgPT4ge1xuICAgICAgICAgIG9wdGlvbnMudmlzdWFsTm9kZS52aXNpYmxlID0gZmFsc2U7XG4gICAgICAgICAgc291bmRHZW5lcmF0b3Iuc3RvcCgpO1xuICAgICAgICB9LCBTT1VORF9EVVJBVElPTiApO1xuICAgICAgfSxcbiAgICAgIHRhbmRlbTogb3B0aW9ucy50YW5kZW0uY3JlYXRlVGFuZGVtKCAnc3luY2hyb25pemVCdXR0b24nIClcbiAgICB9LCBvcHRpb25zLnN5bmNocm9uaXplQnV0dG9uT3B0aW9ucyApICk7XG4gICAgdGhpcy5hZGRDaGlsZCggc3luY2hyb25pemVCdXR0b24gKTtcblxuICAgIHRoaXMuZGlzcG9zZUNsYXBwZXJib2FyZEJ1dHRvbiA9ICgpID0+IHtcbiAgICAgIHN5bmNocm9uaXplQnV0dG9uLmRpc3Bvc2UoKTtcbiAgICB9O1xuICB9XG5cbiAgcHVibGljIG92ZXJyaWRlIGRpc3Bvc2UoKTogdm9pZCB7XG4gICAgdGhpcy5kaXNwb3NlQ2xhcHBlcmJvYXJkQnV0dG9uKCk7XG4gICAgc3VwZXIuZGlzcG9zZSgpO1xuICB9XG59XG5cbnNjZW5lcnlQaGV0LnJlZ2lzdGVyKCAnQ2xhcHBlcmJvYXJkQnV0dG9uJywgQ2xhcHBlcmJvYXJkQnV0dG9uICk7XG5cbmV4cG9ydCBkZWZhdWx0IENsYXBwZXJib2FyZEJ1dHRvbjsiXSwibmFtZXMiOlsic3RlcFRpbWVyIiwib3B0aW9uaXplIiwiY29tYmluZU9wdGlvbnMiLCJOb2RlIiwiUGF0aCIsIlJpY2hUZXh0IiwidmlkZW9Tb2xpZFNoYXBlIiwiUmVjdGFuZ3VsYXJQdXNoQnV0dG9uIiwiT3NjaWxsYXRvclNvdW5kR2VuZXJhdG9yIiwic291bmRNYW5hZ2VyIiwiVGFuZGVtIiwiQmFja2dyb3VuZE5vZGUiLCJzY2VuZXJ5UGhldCIsIlNPVU5EX0RVUkFUSU9OIiwiQlVUVE9OX0xBQkVMIiwiQ2xhcHBlcmJvYXJkQnV0dG9uIiwiZGlzcG9zZSIsImRpc3Bvc2VDbGFwcGVyYm9hcmRCdXR0b24iLCJwcm92aWRlZE9wdGlvbnMiLCJzb3VuZEdlbmVyYXRvciIsImluaXRpYWxGcmVxdWVuY3kiLCJhZGRTb3VuZEdlbmVyYXRvciIsIm9wdGlvbnMiLCJleGNsdWRlSW52aXNpYmxlQ2hpbGRyZW5Gcm9tQm91bmRzIiwidmlzdWFsTm9kZSIsInNjYWxlIiwiZmlsbCIsInhNYXJnaW4iLCJ5TWFyZ2luIiwicmVjdGFuZ2xlT3B0aW9ucyIsIm9wYWNpdHkiLCJzeW5jaHJvbml6ZUJ1dHRvbk9wdGlvbnMiLCJjb250ZW50IiwiaW5uZXJDb250ZW50Iiwidm9pY2luZ05hbWVSZXNwb25zZSIsInNvdW5kUGxheWVyIiwicGxheSIsInN0b3AiLCJfIiwibm9vcCIsInRhbmRlbSIsIlJFUVVJUkVEIiwidGFuZGVtTmFtZVN1ZmZpeCIsInZpc2libGUiLCJhZGRDaGlsZCIsInN5bmNocm9uaXplQnV0dG9uIiwibGlzdGVuZXIiLCJlbmFibGVkIiwic2V0VGltZW91dCIsImNyZWF0ZVRhbmRlbSIsInJlZ2lzdGVyIl0sIm1hcHBpbmdzIjoiQUFBQSxzREFBc0Q7QUFFdEQ7Ozs7Ozs7Ozs7Q0FVQyxHQUVELE9BQU9BLGVBQWUsNkJBQTZCO0FBQ25ELE9BQU9DLGFBQWFDLGNBQWMsUUFBUSxrQ0FBa0M7QUFFNUUsU0FBU0MsSUFBSSxFQUFlQyxJQUFJLEVBQUVDLFFBQVEsUUFBUSw4QkFBOEI7QUFDaEYsT0FBT0MscUJBQXFCLG1EQUFtRDtBQUMvRSxPQUFPQywyQkFBNkQsZ0RBQWdEO0FBQ3BILE9BQU9DLDhCQUE4Qiw4REFBOEQ7QUFDbkcsT0FBT0Msa0JBQWtCLGlDQUFpQztBQUMxRCxPQUFPQyxZQUFZLDRCQUE0QjtBQUMvQyxPQUFPQyxvQkFBb0Isc0JBQXNCO0FBQ2pELE9BQU9DLGlCQUFpQixtQkFBbUI7QUFFM0MsTUFBTUMsaUJBQWlCO0FBQ3ZCLE1BQU1DLGVBQWU7QUFTckIsSUFBQSxBQUFNQyxxQkFBTixNQUFNQSwyQkFBMkJaO0lBaUVmYSxVQUFnQjtRQUM5QixJQUFJLENBQUNDLHlCQUF5QjtRQUM5QixLQUFLLENBQUNEO0lBQ1I7SUFqRUEsWUFBb0JFLGVBQTJDLENBQUc7UUFFaEUsc0ZBQXNGO1FBQ3RGLGtGQUFrRjtRQUNsRixNQUFNQyxpQkFBaUIsSUFBSVgseUJBQTBCO1lBQ25EWSxrQkFBa0I7UUFDcEI7UUFDQVgsYUFBYVksaUJBQWlCLENBQUVGO1FBRWhDLE1BQU1HLFVBQVVyQixZQUFrRTtZQUNoRnNCLG9DQUFvQztZQUNwQ0MsWUFBWSxJQUFJYixlQUFnQixJQUFJUCxLQUFNRSxpQkFBaUI7Z0JBQUVtQixPQUFPO2dCQUFHQyxNQUFNO1lBQU0sSUFBSztnQkFDdEZDLFNBQVM7Z0JBQ1RDLFNBQVM7Z0JBQ1RDLGtCQUFrQjtvQkFDaEJILE1BQU07b0JBQ05JLFNBQVM7Z0JBQ1g7WUFDRjtZQUNBQywwQkFBMEI7Z0JBQ3hCQyxTQUFTLElBQUkzQixTQUFVUztnQkFDdkJtQixjQUFjbkI7Z0JBQ2RvQixxQkFBcUJwQjtnQkFDckJxQixhQUFhO29CQUNYQyxNQUFNO3dCQUNKakIsZUFBZWlCLElBQUk7b0JBQ3JCO29CQUNBQyxNQUFNQyxFQUFFQyxJQUFJO2dCQUNkO1lBQ0Y7WUFFQSxVQUFVO1lBQ1ZDLFFBQVE5QixPQUFPK0IsUUFBUTtZQUN2QkMsa0JBQWtCO1FBQ3BCLEdBQUd4QjtRQUVILEtBQUssQ0FBRUk7UUFFUEEsUUFBUUUsVUFBVSxDQUFDbUIsT0FBTyxHQUFHO1FBQzdCLElBQUksQ0FBQ0MsUUFBUSxDQUFFdEIsUUFBUUUsVUFBVTtRQUVqQyxNQUFNcUIsb0JBQW9CLElBQUl0QyxzQkFBdUJMLGVBQThDO1lBQ2pHNEMsVUFBVTtnQkFFUix3REFBd0Q7Z0JBQ3hERCxrQkFBa0JFLE9BQU8sR0FBRztnQkFFNUJ6QixRQUFRRSxVQUFVLENBQUNtQixPQUFPLEdBQUc7Z0JBQzdCM0MsVUFBVWdELFVBQVUsQ0FBRTtvQkFDcEIxQixRQUFRRSxVQUFVLENBQUNtQixPQUFPLEdBQUc7b0JBQzdCeEIsZUFBZWtCLElBQUk7Z0JBQ3JCLEdBQUd4QjtZQUNMO1lBQ0EyQixRQUFRbEIsUUFBUWtCLE1BQU0sQ0FBQ1MsWUFBWSxDQUFFO1FBQ3ZDLEdBQUczQixRQUFRUyx3QkFBd0I7UUFDbkMsSUFBSSxDQUFDYSxRQUFRLENBQUVDO1FBRWYsSUFBSSxDQUFDNUIseUJBQXlCLEdBQUc7WUFDL0I0QixrQkFBa0I3QixPQUFPO1FBQzNCO0lBQ0Y7QUFNRjtBQUVBSixZQUFZc0MsUUFBUSxDQUFFLHNCQUFzQm5DO0FBRTVDLGVBQWVBLG1CQUFtQiJ9