// Copyright 2022-2024, University of Colorado Boulder
/**
 * Demo for GameInfoDialog
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */ import InfoButton from '../../../../scenery-phet/js/buttons/InfoButton.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { Text } from '../../../../scenery/js/imports.js';
import GameInfoDialog from '../../GameInfoDialog.js';
import vegasQueryParameters, { NUMBER_OF_GAME_LEVELS } from '../../vegasQueryParameters.js';
export default function demoGameInfoDialog(layoutBounds) {
    const levelDescriptions = [];
    for(let i = 1; i <= NUMBER_OF_GAME_LEVELS; i++){
        levelDescriptions.push(`Description of level ${i}`);
    }
    const dialog = new GameInfoDialog(levelDescriptions, {
        gameLevels: vegasQueryParameters.gameLevels,
        title: new Text('Your Title', {
            font: new PhetFont({
                size: 30,
                weight: 'bold'
            })
        }),
        ySpacing: 20
    });
    return new InfoButton({
        listener: ()=>dialog.show(),
        center: layoutBounds.center
    });
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3ZlZ2FzL2pzL2RlbW8vY29tcG9uZW50cy9kZW1vR2FtZUluZm9EaWFsb2cudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjItMjAyNCwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbi8qKlxuICogRGVtbyBmb3IgR2FtZUluZm9EaWFsb2dcbiAqXG4gKiBAYXV0aG9yIENocmlzIE1hbGxleSAoUGl4ZWxab29tLCBJbmMuKVxuICovXG5cbmltcG9ydCBCb3VuZHMyIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9Cb3VuZHMyLmpzJztcbmltcG9ydCBJbmZvQnV0dG9uIGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9idXR0b25zL0luZm9CdXR0b24uanMnO1xuaW1wb3J0IFBoZXRGb250IGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9QaGV0Rm9udC5qcyc7XG5pbXBvcnQgeyBOb2RlLCBUZXh0IH0gZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcbmltcG9ydCBHYW1lSW5mb0RpYWxvZyBmcm9tICcuLi8uLi9HYW1lSW5mb0RpYWxvZy5qcyc7XG5pbXBvcnQgdmVnYXNRdWVyeVBhcmFtZXRlcnMsIHsgTlVNQkVSX09GX0dBTUVfTEVWRUxTIH0gZnJvbSAnLi4vLi4vdmVnYXNRdWVyeVBhcmFtZXRlcnMuanMnO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBkZW1vR2FtZUluZm9EaWFsb2coIGxheW91dEJvdW5kczogQm91bmRzMiApOiBOb2RlIHtcblxuICBjb25zdCBsZXZlbERlc2NyaXB0aW9uczogc3RyaW5nW10gPSBbXTtcbiAgZm9yICggbGV0IGkgPSAxOyBpIDw9IE5VTUJFUl9PRl9HQU1FX0xFVkVMUzsgaSsrICkge1xuICAgIGxldmVsRGVzY3JpcHRpb25zLnB1c2goIGBEZXNjcmlwdGlvbiBvZiBsZXZlbCAke2l9YCApO1xuICB9XG5cbiAgY29uc3QgZGlhbG9nID0gbmV3IEdhbWVJbmZvRGlhbG9nKCBsZXZlbERlc2NyaXB0aW9ucywge1xuICAgIGdhbWVMZXZlbHM6IHZlZ2FzUXVlcnlQYXJhbWV0ZXJzLmdhbWVMZXZlbHMsXG4gICAgdGl0bGU6IG5ldyBUZXh0KCAnWW91ciBUaXRsZScsIHtcbiAgICAgIGZvbnQ6IG5ldyBQaGV0Rm9udCggeyBzaXplOiAzMCwgd2VpZ2h0OiAnYm9sZCcgfSApXG4gICAgfSApLFxuICAgIHlTcGFjaW5nOiAyMFxuICB9ICk7XG5cbiAgcmV0dXJuIG5ldyBJbmZvQnV0dG9uKCB7XG4gICAgbGlzdGVuZXI6ICgpID0+IGRpYWxvZy5zaG93KCksXG4gICAgY2VudGVyOiBsYXlvdXRCb3VuZHMuY2VudGVyXG4gIH0gKTtcbn0iXSwibmFtZXMiOlsiSW5mb0J1dHRvbiIsIlBoZXRGb250IiwiVGV4dCIsIkdhbWVJbmZvRGlhbG9nIiwidmVnYXNRdWVyeVBhcmFtZXRlcnMiLCJOVU1CRVJfT0ZfR0FNRV9MRVZFTFMiLCJkZW1vR2FtZUluZm9EaWFsb2ciLCJsYXlvdXRCb3VuZHMiLCJsZXZlbERlc2NyaXB0aW9ucyIsImkiLCJwdXNoIiwiZGlhbG9nIiwiZ2FtZUxldmVscyIsInRpdGxlIiwiZm9udCIsInNpemUiLCJ3ZWlnaHQiLCJ5U3BhY2luZyIsImxpc3RlbmVyIiwic2hvdyIsImNlbnRlciJdLCJtYXBwaW5ncyI6IkFBQUEsc0RBQXNEO0FBRXREOzs7O0NBSUMsR0FHRCxPQUFPQSxnQkFBZ0Isb0RBQW9EO0FBQzNFLE9BQU9DLGNBQWMsMENBQTBDO0FBQy9ELFNBQWVDLElBQUksUUFBUSxvQ0FBb0M7QUFDL0QsT0FBT0Msb0JBQW9CLDBCQUEwQjtBQUNyRCxPQUFPQyx3QkFBd0JDLHFCQUFxQixRQUFRLGdDQUFnQztBQUU1RixlQUFlLFNBQVNDLG1CQUFvQkMsWUFBcUI7SUFFL0QsTUFBTUMsb0JBQThCLEVBQUU7SUFDdEMsSUFBTSxJQUFJQyxJQUFJLEdBQUdBLEtBQUtKLHVCQUF1QkksSUFBTTtRQUNqREQsa0JBQWtCRSxJQUFJLENBQUUsQ0FBQyxxQkFBcUIsRUFBRUQsR0FBRztJQUNyRDtJQUVBLE1BQU1FLFNBQVMsSUFBSVIsZUFBZ0JLLG1CQUFtQjtRQUNwREksWUFBWVIscUJBQXFCUSxVQUFVO1FBQzNDQyxPQUFPLElBQUlYLEtBQU0sY0FBYztZQUM3QlksTUFBTSxJQUFJYixTQUFVO2dCQUFFYyxNQUFNO2dCQUFJQyxRQUFRO1lBQU87UUFDakQ7UUFDQUMsVUFBVTtJQUNaO0lBRUEsT0FBTyxJQUFJakIsV0FBWTtRQUNyQmtCLFVBQVUsSUFBTVAsT0FBT1EsSUFBSTtRQUMzQkMsUUFBUWIsYUFBYWEsTUFBTTtJQUM3QjtBQUNGIn0=