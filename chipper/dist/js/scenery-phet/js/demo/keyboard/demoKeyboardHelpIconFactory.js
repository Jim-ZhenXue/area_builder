// Copyright 2022-2024, University of Colorado Boulder
/**
 * Demo for KeyboardHelpIconFactory
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */ import { GridBox } from '../../../../scenery/js/imports.js';
import KeyboardHelpIconFactory from '../../keyboard/help/KeyboardHelpIconFactory.js';
import TextKeyNode from '../../keyboard/TextKeyNode.js';
export default function demoKeyboardHelpIconFactory(layoutBounds, providedOptions) {
    return new GridBox({
        xSpacing: 75,
        ySpacing: 20,
        columns: [
            [
                KeyboardHelpIconFactory.iconRow([
                    new TextKeyNode('A'),
                    new TextKeyNode('B')
                ]),
                KeyboardHelpIconFactory.iconOrIcon(new TextKeyNode('A'), new TextKeyNode('B')),
                KeyboardHelpIconFactory.iconToIcon(new TextKeyNode('A'), new TextKeyNode('B')),
                KeyboardHelpIconFactory.iconPlusIcon(new TextKeyNode('A'), new TextKeyNode('B')),
                KeyboardHelpIconFactory.shiftPlusIcon(new TextKeyNode('A'))
            ],
            [
                KeyboardHelpIconFactory.spaceOrEnter(),
                KeyboardHelpIconFactory.upOrDown(),
                KeyboardHelpIconFactory.wasdRowIcon(),
                KeyboardHelpIconFactory.arrowKeysRowIcon()
            ],
            [
                KeyboardHelpIconFactory.arrowOrWasdKeysRowIcon(),
                KeyboardHelpIconFactory.pageUpPageDownRowIcon(),
                KeyboardHelpIconFactory.leftRightArrowKeysRowIcon()
            ]
        ],
        center: layoutBounds.center
    });
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9kZW1vL2tleWJvYXJkL2RlbW9LZXlib2FyZEhlbHBJY29uRmFjdG9yeS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAyMi0yMDI0LCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuLyoqXG4gKiBEZW1vIGZvciBLZXlib2FyZEhlbHBJY29uRmFjdG9yeVxuICpcbiAqIEBhdXRob3IgQ2hyaXMgTWFsbGV5IChQaXhlbFpvb20sIEluYy4pXG4gKi9cblxuaW1wb3J0IEJvdW5kczIgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL0JvdW5kczIuanMnO1xuaW1wb3J0IHsgR3JpZEJveCwgTm9kZSB9IGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XG5pbXBvcnQgeyBTdW5EZW1vT3B0aW9ucyB9IGZyb20gJy4uLy4uLy4uLy4uL3N1bi9qcy9kZW1vL0RlbW9zU2NyZWVuVmlldy5qcyc7XG5pbXBvcnQgS2V5Ym9hcmRIZWxwSWNvbkZhY3RvcnkgZnJvbSAnLi4vLi4va2V5Ym9hcmQvaGVscC9LZXlib2FyZEhlbHBJY29uRmFjdG9yeS5qcyc7XG5pbXBvcnQgVGV4dEtleU5vZGUgZnJvbSAnLi4vLi4va2V5Ym9hcmQvVGV4dEtleU5vZGUuanMnO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBkZW1vS2V5Ym9hcmRIZWxwSWNvbkZhY3RvcnkoIGxheW91dEJvdW5kczogQm91bmRzMiwgcHJvdmlkZWRPcHRpb25zPzogU3VuRGVtb09wdGlvbnMgKTogTm9kZSB7XG4gIHJldHVybiBuZXcgR3JpZEJveCgge1xuICAgIHhTcGFjaW5nOiA3NSxcbiAgICB5U3BhY2luZzogMjAsXG4gICAgY29sdW1uczogW1xuICAgICAgW1xuICAgICAgICBLZXlib2FyZEhlbHBJY29uRmFjdG9yeS5pY29uUm93KCBbIG5ldyBUZXh0S2V5Tm9kZSggJ0EnICksIG5ldyBUZXh0S2V5Tm9kZSggJ0InICkgXSApLFxuICAgICAgICBLZXlib2FyZEhlbHBJY29uRmFjdG9yeS5pY29uT3JJY29uKCBuZXcgVGV4dEtleU5vZGUoICdBJyApLCBuZXcgVGV4dEtleU5vZGUoICdCJyApICksXG4gICAgICAgIEtleWJvYXJkSGVscEljb25GYWN0b3J5Lmljb25Ub0ljb24oIG5ldyBUZXh0S2V5Tm9kZSggJ0EnICksIG5ldyBUZXh0S2V5Tm9kZSggJ0InICkgKSxcbiAgICAgICAgS2V5Ym9hcmRIZWxwSWNvbkZhY3RvcnkuaWNvblBsdXNJY29uKCBuZXcgVGV4dEtleU5vZGUoICdBJyApLCBuZXcgVGV4dEtleU5vZGUoICdCJyApICksXG4gICAgICAgIEtleWJvYXJkSGVscEljb25GYWN0b3J5LnNoaWZ0UGx1c0ljb24oIG5ldyBUZXh0S2V5Tm9kZSggJ0EnICkgKVxuICAgICAgXSxcbiAgICAgIFtcbiAgICAgICAgS2V5Ym9hcmRIZWxwSWNvbkZhY3Rvcnkuc3BhY2VPckVudGVyKCksXG4gICAgICAgIEtleWJvYXJkSGVscEljb25GYWN0b3J5LnVwT3JEb3duKCksXG4gICAgICAgIEtleWJvYXJkSGVscEljb25GYWN0b3J5Lndhc2RSb3dJY29uKCksXG4gICAgICAgIEtleWJvYXJkSGVscEljb25GYWN0b3J5LmFycm93S2V5c1Jvd0ljb24oKVxuICAgICAgXSxcbiAgICAgIFtcbiAgICAgICAgS2V5Ym9hcmRIZWxwSWNvbkZhY3RvcnkuYXJyb3dPcldhc2RLZXlzUm93SWNvbigpLFxuICAgICAgICBLZXlib2FyZEhlbHBJY29uRmFjdG9yeS5wYWdlVXBQYWdlRG93blJvd0ljb24oKSxcbiAgICAgICAgS2V5Ym9hcmRIZWxwSWNvbkZhY3RvcnkubGVmdFJpZ2h0QXJyb3dLZXlzUm93SWNvbigpXG4gICAgICBdXG4gICAgXSxcbiAgICBjZW50ZXI6IGxheW91dEJvdW5kcy5jZW50ZXJcbiAgfSApO1xufSJdLCJuYW1lcyI6WyJHcmlkQm94IiwiS2V5Ym9hcmRIZWxwSWNvbkZhY3RvcnkiLCJUZXh0S2V5Tm9kZSIsImRlbW9LZXlib2FyZEhlbHBJY29uRmFjdG9yeSIsImxheW91dEJvdW5kcyIsInByb3ZpZGVkT3B0aW9ucyIsInhTcGFjaW5nIiwieVNwYWNpbmciLCJjb2x1bW5zIiwiaWNvblJvdyIsImljb25Pckljb24iLCJpY29uVG9JY29uIiwiaWNvblBsdXNJY29uIiwic2hpZnRQbHVzSWNvbiIsInNwYWNlT3JFbnRlciIsInVwT3JEb3duIiwid2FzZFJvd0ljb24iLCJhcnJvd0tleXNSb3dJY29uIiwiYXJyb3dPcldhc2RLZXlzUm93SWNvbiIsInBhZ2VVcFBhZ2VEb3duUm93SWNvbiIsImxlZnRSaWdodEFycm93S2V5c1Jvd0ljb24iLCJjZW50ZXIiXSwibWFwcGluZ3MiOiJBQUFBLHNEQUFzRDtBQUV0RDs7OztDQUlDLEdBR0QsU0FBU0EsT0FBTyxRQUFjLG9DQUFvQztBQUVsRSxPQUFPQyw2QkFBNkIsaURBQWlEO0FBQ3JGLE9BQU9DLGlCQUFpQixnQ0FBZ0M7QUFFeEQsZUFBZSxTQUFTQyw0QkFBNkJDLFlBQXFCLEVBQUVDLGVBQWdDO0lBQzFHLE9BQU8sSUFBSUwsUUFBUztRQUNsQk0sVUFBVTtRQUNWQyxVQUFVO1FBQ1ZDLFNBQVM7WUFDUDtnQkFDRVAsd0JBQXdCUSxPQUFPLENBQUU7b0JBQUUsSUFBSVAsWUFBYTtvQkFBTyxJQUFJQSxZQUFhO2lCQUFPO2dCQUNuRkQsd0JBQXdCUyxVQUFVLENBQUUsSUFBSVIsWUFBYSxNQUFPLElBQUlBLFlBQWE7Z0JBQzdFRCx3QkFBd0JVLFVBQVUsQ0FBRSxJQUFJVCxZQUFhLE1BQU8sSUFBSUEsWUFBYTtnQkFDN0VELHdCQUF3QlcsWUFBWSxDQUFFLElBQUlWLFlBQWEsTUFBTyxJQUFJQSxZQUFhO2dCQUMvRUQsd0JBQXdCWSxhQUFhLENBQUUsSUFBSVgsWUFBYTthQUN6RDtZQUNEO2dCQUNFRCx3QkFBd0JhLFlBQVk7Z0JBQ3BDYix3QkFBd0JjLFFBQVE7Z0JBQ2hDZCx3QkFBd0JlLFdBQVc7Z0JBQ25DZix3QkFBd0JnQixnQkFBZ0I7YUFDekM7WUFDRDtnQkFDRWhCLHdCQUF3QmlCLHNCQUFzQjtnQkFDOUNqQix3QkFBd0JrQixxQkFBcUI7Z0JBQzdDbEIsd0JBQXdCbUIseUJBQXlCO2FBQ2xEO1NBQ0Y7UUFDREMsUUFBUWpCLGFBQWFpQixNQUFNO0lBQzdCO0FBQ0YifQ==