// Copyright 2020-2024, University of Colorado Boulder
/**
 * HomeScreenSoundGenerator is responsible for generating sounds that are associated with the home screen, such as the
 * sound for switching between screen icons and the sound for returning to the home screen from a sim screen.
 *
 * @author John Blanco (PhET Interactive Simulations)
 */ import Enumeration from '../../phet-core/js/Enumeration.js';
import EnumerationValue from '../../phet-core/js/EnumerationValue.js';
import MultiClip from '../../tambo/js/sound-generators/MultiClip.js';
import screenSelectionHomeV3_mp3 from '../sounds/screenSelectionHomeV3_mp3.js';
import switchingScreenSelectorIcons003_mp3 from '../sounds/switchingScreenSelectorIcons003_mp3.js';
import joist from './joist.js';
let SoundType = class SoundType extends EnumerationValue {
};
SoundType.HOME_SCREEN_SELECTED = new SoundType();
SoundType.DIFFERENT_ICON_SELECTED = new SoundType();
SoundType.enumeration = new Enumeration(SoundType);
let HomeScreenSoundGenerator = class HomeScreenSoundGenerator extends MultiClip {
    constructor(homeScreenModel, providedOptions){
        // create the map of home screen actions to sounds
        const valuesToSoundsMap = new Map([
            [
                SoundType.HOME_SCREEN_SELECTED,
                screenSelectionHomeV3_mp3
            ],
            [
                SoundType.DIFFERENT_ICON_SELECTED,
                switchingScreenSelectorIcons003_mp3
            ]
        ]);
        super(valuesToSoundsMap, providedOptions);
        homeScreenModel.screenProperty.lazyLink((screen)=>{
            if (screen.model === homeScreenModel) {
                this.playAssociatedSound(SoundType.HOME_SCREEN_SELECTED);
            }
        });
        // play the sound when the user selects a different icon on the home screen
        homeScreenModel.selectedScreenProperty.lazyLink(()=>{
            if (homeScreenModel.screenProperty.value.model === homeScreenModel) {
                this.playAssociatedSound(SoundType.DIFFERENT_ICON_SELECTED);
            }
        });
    }
};
joist.register('HomeScreenSoundGenerator', HomeScreenSoundGenerator);
export default HomeScreenSoundGenerator;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2pvaXN0L2pzL0hvbWVTY3JlZW5Tb3VuZEdlbmVyYXRvci50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAyMC0yMDI0LCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuLyoqXG4gKiBIb21lU2NyZWVuU291bmRHZW5lcmF0b3IgaXMgcmVzcG9uc2libGUgZm9yIGdlbmVyYXRpbmcgc291bmRzIHRoYXQgYXJlIGFzc29jaWF0ZWQgd2l0aCB0aGUgaG9tZSBzY3JlZW4sIHN1Y2ggYXMgdGhlXG4gKiBzb3VuZCBmb3Igc3dpdGNoaW5nIGJldHdlZW4gc2NyZWVuIGljb25zIGFuZCB0aGUgc291bmQgZm9yIHJldHVybmluZyB0byB0aGUgaG9tZSBzY3JlZW4gZnJvbSBhIHNpbSBzY3JlZW4uXG4gKlxuICogQGF1dGhvciBKb2huIEJsYW5jbyAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcbiAqL1xuXG5pbXBvcnQgRW51bWVyYXRpb24gZnJvbSAnLi4vLi4vcGhldC1jb3JlL2pzL0VudW1lcmF0aW9uLmpzJztcbmltcG9ydCBFbnVtZXJhdGlvblZhbHVlIGZyb20gJy4uLy4uL3BoZXQtY29yZS9qcy9FbnVtZXJhdGlvblZhbHVlLmpzJztcbmltcG9ydCBNdWx0aUNsaXAsIHsgTXVsdGlDbGlwT3B0aW9ucyB9IGZyb20gJy4uLy4uL3RhbWJvL2pzL3NvdW5kLWdlbmVyYXRvcnMvTXVsdGlDbGlwLmpzJztcbmltcG9ydCBzY3JlZW5TZWxlY3Rpb25Ib21lVjNfbXAzIGZyb20gJy4uL3NvdW5kcy9zY3JlZW5TZWxlY3Rpb25Ib21lVjNfbXAzLmpzJztcbmltcG9ydCBzd2l0Y2hpbmdTY3JlZW5TZWxlY3Rvckljb25zMDAzX21wMyBmcm9tICcuLi9zb3VuZHMvc3dpdGNoaW5nU2NyZWVuU2VsZWN0b3JJY29uczAwM19tcDMuanMnO1xuaW1wb3J0IEhvbWVTY3JlZW5Nb2RlbCBmcm9tICcuL0hvbWVTY3JlZW5Nb2RlbC5qcyc7XG5pbXBvcnQgam9pc3QgZnJvbSAnLi9qb2lzdC5qcyc7XG5cbmNsYXNzIFNvdW5kVHlwZSBleHRlbmRzIEVudW1lcmF0aW9uVmFsdWUge1xuICBwdWJsaWMgc3RhdGljIHJlYWRvbmx5IEhPTUVfU0NSRUVOX1NFTEVDVEVEID0gbmV3IFNvdW5kVHlwZSgpO1xuICBwdWJsaWMgc3RhdGljIHJlYWRvbmx5IERJRkZFUkVOVF9JQ09OX1NFTEVDVEVEID0gbmV3IFNvdW5kVHlwZSgpO1xuXG4gIHB1YmxpYyBzdGF0aWMgcmVhZG9ubHkgZW51bWVyYXRpb24gPSBuZXcgRW51bWVyYXRpb24oIFNvdW5kVHlwZSApO1xufVxuXG5jbGFzcyBIb21lU2NyZWVuU291bmRHZW5lcmF0b3IgZXh0ZW5kcyBNdWx0aUNsaXA8U291bmRUeXBlPiB7XG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggaG9tZVNjcmVlbk1vZGVsOiBIb21lU2NyZWVuTW9kZWwsIHByb3ZpZGVkT3B0aW9ucz86IE11bHRpQ2xpcE9wdGlvbnMgKSB7XG5cbiAgICAvLyBjcmVhdGUgdGhlIG1hcCBvZiBob21lIHNjcmVlbiBhY3Rpb25zIHRvIHNvdW5kc1xuICAgIGNvbnN0IHZhbHVlc1RvU291bmRzTWFwID0gbmV3IE1hcCggW1xuICAgICAgWyBTb3VuZFR5cGUuSE9NRV9TQ1JFRU5fU0VMRUNURUQsIHNjcmVlblNlbGVjdGlvbkhvbWVWM19tcDMgXSxcbiAgICAgIFsgU291bmRUeXBlLkRJRkZFUkVOVF9JQ09OX1NFTEVDVEVELCBzd2l0Y2hpbmdTY3JlZW5TZWxlY3Rvckljb25zMDAzX21wMyBdXG4gICAgXSApO1xuXG4gICAgc3VwZXIoIHZhbHVlc1RvU291bmRzTWFwLCBwcm92aWRlZE9wdGlvbnMgKTtcblxuICAgIGhvbWVTY3JlZW5Nb2RlbC5zY3JlZW5Qcm9wZXJ0eS5sYXp5TGluayggc2NyZWVuID0+IHtcbiAgICAgIGlmICggc2NyZWVuLm1vZGVsID09PSBob21lU2NyZWVuTW9kZWwgKSB7XG4gICAgICAgIHRoaXMucGxheUFzc29jaWF0ZWRTb3VuZCggU291bmRUeXBlLkhPTUVfU0NSRUVOX1NFTEVDVEVEICk7XG4gICAgICB9XG4gICAgfSApO1xuXG4gICAgLy8gcGxheSB0aGUgc291bmQgd2hlbiB0aGUgdXNlciBzZWxlY3RzIGEgZGlmZmVyZW50IGljb24gb24gdGhlIGhvbWUgc2NyZWVuXG4gICAgaG9tZVNjcmVlbk1vZGVsLnNlbGVjdGVkU2NyZWVuUHJvcGVydHkubGF6eUxpbmsoICgpID0+IHtcbiAgICAgIGlmICggaG9tZVNjcmVlbk1vZGVsLnNjcmVlblByb3BlcnR5LnZhbHVlLm1vZGVsID09PSBob21lU2NyZWVuTW9kZWwgKSB7XG4gICAgICAgIHRoaXMucGxheUFzc29jaWF0ZWRTb3VuZCggU291bmRUeXBlLkRJRkZFUkVOVF9JQ09OX1NFTEVDVEVEICk7XG4gICAgICB9XG4gICAgfSApO1xuICB9XG59XG5cbmpvaXN0LnJlZ2lzdGVyKCAnSG9tZVNjcmVlblNvdW5kR2VuZXJhdG9yJywgSG9tZVNjcmVlblNvdW5kR2VuZXJhdG9yICk7XG5leHBvcnQgZGVmYXVsdCBIb21lU2NyZWVuU291bmRHZW5lcmF0b3I7Il0sIm5hbWVzIjpbIkVudW1lcmF0aW9uIiwiRW51bWVyYXRpb25WYWx1ZSIsIk11bHRpQ2xpcCIsInNjcmVlblNlbGVjdGlvbkhvbWVWM19tcDMiLCJzd2l0Y2hpbmdTY3JlZW5TZWxlY3Rvckljb25zMDAzX21wMyIsImpvaXN0IiwiU291bmRUeXBlIiwiSE9NRV9TQ1JFRU5fU0VMRUNURUQiLCJESUZGRVJFTlRfSUNPTl9TRUxFQ1RFRCIsImVudW1lcmF0aW9uIiwiSG9tZVNjcmVlblNvdW5kR2VuZXJhdG9yIiwiaG9tZVNjcmVlbk1vZGVsIiwicHJvdmlkZWRPcHRpb25zIiwidmFsdWVzVG9Tb3VuZHNNYXAiLCJNYXAiLCJzY3JlZW5Qcm9wZXJ0eSIsImxhenlMaW5rIiwic2NyZWVuIiwibW9kZWwiLCJwbGF5QXNzb2NpYXRlZFNvdW5kIiwic2VsZWN0ZWRTY3JlZW5Qcm9wZXJ0eSIsInZhbHVlIiwicmVnaXN0ZXIiXSwibWFwcGluZ3MiOiJBQUFBLHNEQUFzRDtBQUV0RDs7Ozs7Q0FLQyxHQUVELE9BQU9BLGlCQUFpQixvQ0FBb0M7QUFDNUQsT0FBT0Msc0JBQXNCLHlDQUF5QztBQUN0RSxPQUFPQyxlQUFxQywrQ0FBK0M7QUFDM0YsT0FBT0MsK0JBQStCLHlDQUF5QztBQUMvRSxPQUFPQyx5Q0FBeUMsbURBQW1EO0FBRW5HLE9BQU9DLFdBQVcsYUFBYTtBQUUvQixJQUFBLEFBQU1DLFlBQU4sTUFBTUEsa0JBQWtCTDtBQUt4QjtBQUxNSyxVQUNtQkMsdUJBQXVCLElBQUlEO0FBRDlDQSxVQUVtQkUsMEJBQTBCLElBQUlGO0FBRmpEQSxVQUltQkcsY0FBYyxJQUFJVCxZQUFhTTtBQUd4RCxJQUFBLEFBQU1JLDJCQUFOLE1BQU1BLGlDQUFpQ1I7SUFDckMsWUFBb0JTLGVBQWdDLEVBQUVDLGVBQWtDLENBQUc7UUFFekYsa0RBQWtEO1FBQ2xELE1BQU1DLG9CQUFvQixJQUFJQyxJQUFLO1lBQ2pDO2dCQUFFUixVQUFVQyxvQkFBb0I7Z0JBQUVKO2FBQTJCO1lBQzdEO2dCQUFFRyxVQUFVRSx1QkFBdUI7Z0JBQUVKO2FBQXFDO1NBQzNFO1FBRUQsS0FBSyxDQUFFUyxtQkFBbUJEO1FBRTFCRCxnQkFBZ0JJLGNBQWMsQ0FBQ0MsUUFBUSxDQUFFQyxDQUFBQTtZQUN2QyxJQUFLQSxPQUFPQyxLQUFLLEtBQUtQLGlCQUFrQjtnQkFDdEMsSUFBSSxDQUFDUSxtQkFBbUIsQ0FBRWIsVUFBVUMsb0JBQW9CO1lBQzFEO1FBQ0Y7UUFFQSwyRUFBMkU7UUFDM0VJLGdCQUFnQlMsc0JBQXNCLENBQUNKLFFBQVEsQ0FBRTtZQUMvQyxJQUFLTCxnQkFBZ0JJLGNBQWMsQ0FBQ00sS0FBSyxDQUFDSCxLQUFLLEtBQUtQLGlCQUFrQjtnQkFDcEUsSUFBSSxDQUFDUSxtQkFBbUIsQ0FBRWIsVUFBVUUsdUJBQXVCO1lBQzdEO1FBQ0Y7SUFDRjtBQUNGO0FBRUFILE1BQU1pQixRQUFRLENBQUUsNEJBQTRCWjtBQUM1QyxlQUFlQSx5QkFBeUIifQ==