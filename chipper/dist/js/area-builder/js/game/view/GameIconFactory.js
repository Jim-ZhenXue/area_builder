// Copyright 2014-2021, University of Colorado Boulder
/**
 * Static factory for creating the number-on-a-grid icons used in the level selection screen of the Area Builder game.
 *
 * @author John Blanco
 */ import Vector2 from '../../../../dot/js/Vector2.js';
import areaBuilder from '../../areaBuilder.js';
import AreaBuilderSharedConstants from '../../common/AreaBuilderSharedConstants.js';
import GridIcon from '../../common/view/GridIcon.js';
// constants
const NUM_COLUMNS = 8;
const NUM_ROWS = 9;
const CELL_LENGTH = 3;
const GRID_ICON_OPTIONS = {
    gridStroke: '#dddddd',
    gridLineWidth: 0.25,
    shapeLineWidth: 0.25
};
/**
 * Static object, not meant to be instantiated.
 */ const GameIconFactory = {
    createIcon (level) {
        let color;
        let occupiedCells;
        switch(level){
            case 1:
                color = AreaBuilderSharedConstants.ORANGISH_COLOR;
                occupiedCells = [
                    new Vector2(4, 1),
                    new Vector2(3, 2),
                    new Vector2(4, 2),
                    new Vector2(4, 3),
                    new Vector2(4, 4),
                    new Vector2(4, 5),
                    new Vector2(4, 6),
                    new Vector2(3, 7),
                    new Vector2(4, 7),
                    new Vector2(5, 7)
                ];
                break;
            case 2:
                color = AreaBuilderSharedConstants.ORANGE_BROWN_COLOR;
                occupiedCells = [
                    new Vector2(2, 1),
                    new Vector2(3, 1),
                    new Vector2(4, 1),
                    new Vector2(5, 1),
                    new Vector2(2, 2),
                    new Vector2(5, 2),
                    new Vector2(5, 3),
                    new Vector2(2, 4),
                    new Vector2(3, 4),
                    new Vector2(4, 4),
                    new Vector2(5, 4),
                    new Vector2(2, 5),
                    new Vector2(2, 6),
                    new Vector2(2, 7),
                    new Vector2(3, 7),
                    new Vector2(4, 7),
                    new Vector2(5, 7)
                ];
                break;
            case 3:
                color = AreaBuilderSharedConstants.GREENISH_COLOR;
                occupiedCells = [
                    new Vector2(2, 1),
                    new Vector2(3, 1),
                    new Vector2(4, 1),
                    new Vector2(5, 1),
                    new Vector2(5, 2),
                    new Vector2(5, 3),
                    new Vector2(3, 4),
                    new Vector2(4, 4),
                    new Vector2(5, 4),
                    new Vector2(5, 5),
                    new Vector2(5, 6),
                    new Vector2(2, 7),
                    new Vector2(3, 7),
                    new Vector2(4, 7),
                    new Vector2(5, 7)
                ];
                break;
            case 4:
                color = AreaBuilderSharedConstants.DARK_GREEN_COLOR;
                occupiedCells = [
                    new Vector2(5, 1),
                    new Vector2(2, 2),
                    new Vector2(5, 2),
                    new Vector2(2, 3),
                    new Vector2(5, 3),
                    new Vector2(2, 4),
                    new Vector2(5, 4),
                    new Vector2(2, 5),
                    new Vector2(3, 5),
                    new Vector2(4, 5),
                    new Vector2(5, 5),
                    new Vector2(6, 5),
                    new Vector2(5, 6),
                    new Vector2(5, 7)
                ];
                break;
            case 5:
                color = AreaBuilderSharedConstants.PURPLISH_COLOR;
                occupiedCells = [
                    new Vector2(2, 1),
                    new Vector2(3, 1),
                    new Vector2(4, 1),
                    new Vector2(5, 1),
                    new Vector2(2, 2),
                    new Vector2(2, 3),
                    new Vector2(2, 4),
                    new Vector2(3, 4),
                    new Vector2(4, 4),
                    new Vector2(5, 4),
                    new Vector2(5, 5),
                    new Vector2(5, 6),
                    new Vector2(2, 7),
                    new Vector2(3, 7),
                    new Vector2(4, 7),
                    new Vector2(5, 7)
                ];
                break;
            case 6:
                color = AreaBuilderSharedConstants.PINKISH_COLOR;
                occupiedCells = [
                    new Vector2(2, 1),
                    new Vector2(3, 1),
                    new Vector2(4, 1),
                    new Vector2(5, 1),
                    new Vector2(2, 2),
                    new Vector2(2, 3),
                    new Vector2(2, 4),
                    new Vector2(3, 4),
                    new Vector2(4, 4),
                    new Vector2(5, 4),
                    new Vector2(2, 5),
                    new Vector2(5, 5),
                    new Vector2(2, 6),
                    new Vector2(5, 6),
                    new Vector2(2, 7),
                    new Vector2(3, 7),
                    new Vector2(4, 7),
                    new Vector2(5, 7)
                ];
                break;
            default:
                throw new Error(`Unsupported game level: ${level}`);
        }
        return new GridIcon(NUM_COLUMNS, NUM_ROWS, CELL_LENGTH, color, occupiedCells, GRID_ICON_OPTIONS);
    }
};
areaBuilder.register('GameIconFactory', GameIconFactory);
export default GameIconFactory;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL2FyZWEtYnVpbGRlci9qcy9nYW1lL3ZpZXcvR2FtZUljb25GYWN0b3J5LmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE0LTIwMjEsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIFN0YXRpYyBmYWN0b3J5IGZvciBjcmVhdGluZyB0aGUgbnVtYmVyLW9uLWEtZ3JpZCBpY29ucyB1c2VkIGluIHRoZSBsZXZlbCBzZWxlY3Rpb24gc2NyZWVuIG9mIHRoZSBBcmVhIEJ1aWxkZXIgZ2FtZS5cbiAqXG4gKiBAYXV0aG9yIEpvaG4gQmxhbmNvXG4gKi9cblxuaW1wb3J0IFZlY3RvcjIgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL1ZlY3RvcjIuanMnO1xuaW1wb3J0IGFyZWFCdWlsZGVyIGZyb20gJy4uLy4uL2FyZWFCdWlsZGVyLmpzJztcbmltcG9ydCBBcmVhQnVpbGRlclNoYXJlZENvbnN0YW50cyBmcm9tICcuLi8uLi9jb21tb24vQXJlYUJ1aWxkZXJTaGFyZWRDb25zdGFudHMuanMnO1xuaW1wb3J0IEdyaWRJY29uIGZyb20gJy4uLy4uL2NvbW1vbi92aWV3L0dyaWRJY29uLmpzJztcblxuLy8gY29uc3RhbnRzXG5jb25zdCBOVU1fQ09MVU1OUyA9IDg7XG5jb25zdCBOVU1fUk9XUyA9IDk7XG5jb25zdCBDRUxMX0xFTkdUSCA9IDM7XG5jb25zdCBHUklEX0lDT05fT1BUSU9OUyA9IHtcbiAgZ3JpZFN0cm9rZTogJyNkZGRkZGQnLFxuICBncmlkTGluZVdpZHRoOiAwLjI1LFxuICBzaGFwZUxpbmVXaWR0aDogMC4yNVxufTtcblxuLyoqXG4gKiBTdGF0aWMgb2JqZWN0LCBub3QgbWVhbnQgdG8gYmUgaW5zdGFudGlhdGVkLlxuICovXG5jb25zdCBHYW1lSWNvbkZhY3RvcnkgPSB7XG4gIGNyZWF0ZUljb24oIGxldmVsICkge1xuICAgIGxldCBjb2xvcjtcbiAgICBsZXQgb2NjdXBpZWRDZWxscztcbiAgICBzd2l0Y2goIGxldmVsICkge1xuICAgICAgY2FzZSAxOlxuICAgICAgICBjb2xvciA9IEFyZWFCdWlsZGVyU2hhcmVkQ29uc3RhbnRzLk9SQU5HSVNIX0NPTE9SO1xuICAgICAgICBvY2N1cGllZENlbGxzID0gW1xuICAgICAgICAgIG5ldyBWZWN0b3IyKCA0LCAxICksXG4gICAgICAgICAgbmV3IFZlY3RvcjIoIDMsIDIgKSxcbiAgICAgICAgICBuZXcgVmVjdG9yMiggNCwgMiApLFxuICAgICAgICAgIG5ldyBWZWN0b3IyKCA0LCAzICksXG4gICAgICAgICAgbmV3IFZlY3RvcjIoIDQsIDQgKSxcbiAgICAgICAgICBuZXcgVmVjdG9yMiggNCwgNSApLFxuICAgICAgICAgIG5ldyBWZWN0b3IyKCA0LCA2ICksXG4gICAgICAgICAgbmV3IFZlY3RvcjIoIDMsIDcgKSxcbiAgICAgICAgICBuZXcgVmVjdG9yMiggNCwgNyApLFxuICAgICAgICAgIG5ldyBWZWN0b3IyKCA1LCA3IClcbiAgICAgICAgXTtcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGNhc2UgMjpcbiAgICAgICAgY29sb3IgPSBBcmVhQnVpbGRlclNoYXJlZENvbnN0YW50cy5PUkFOR0VfQlJPV05fQ09MT1I7XG4gICAgICAgIG9jY3VwaWVkQ2VsbHMgPSBbXG4gICAgICAgICAgbmV3IFZlY3RvcjIoIDIsIDEgKSxcbiAgICAgICAgICBuZXcgVmVjdG9yMiggMywgMSApLFxuICAgICAgICAgIG5ldyBWZWN0b3IyKCA0LCAxICksXG4gICAgICAgICAgbmV3IFZlY3RvcjIoIDUsIDEgKSxcbiAgICAgICAgICBuZXcgVmVjdG9yMiggMiwgMiApLFxuICAgICAgICAgIG5ldyBWZWN0b3IyKCA1LCAyICksXG4gICAgICAgICAgbmV3IFZlY3RvcjIoIDUsIDMgKSxcbiAgICAgICAgICBuZXcgVmVjdG9yMiggMiwgNCApLFxuICAgICAgICAgIG5ldyBWZWN0b3IyKCAzLCA0ICksXG4gICAgICAgICAgbmV3IFZlY3RvcjIoIDQsIDQgKSxcbiAgICAgICAgICBuZXcgVmVjdG9yMiggNSwgNCApLFxuICAgICAgICAgIG5ldyBWZWN0b3IyKCAyLCA1ICksXG4gICAgICAgICAgbmV3IFZlY3RvcjIoIDIsIDYgKSxcbiAgICAgICAgICBuZXcgVmVjdG9yMiggMiwgNyApLFxuICAgICAgICAgIG5ldyBWZWN0b3IyKCAzLCA3ICksXG4gICAgICAgICAgbmV3IFZlY3RvcjIoIDQsIDcgKSxcbiAgICAgICAgICBuZXcgVmVjdG9yMiggNSwgNyApXG4gICAgICAgIF07XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBjYXNlIDM6XG4gICAgICAgIGNvbG9yID0gQXJlYUJ1aWxkZXJTaGFyZWRDb25zdGFudHMuR1JFRU5JU0hfQ09MT1I7XG4gICAgICAgIG9jY3VwaWVkQ2VsbHMgPSBbXG4gICAgICAgICAgbmV3IFZlY3RvcjIoIDIsIDEgKSxcbiAgICAgICAgICBuZXcgVmVjdG9yMiggMywgMSApLFxuICAgICAgICAgIG5ldyBWZWN0b3IyKCA0LCAxICksXG4gICAgICAgICAgbmV3IFZlY3RvcjIoIDUsIDEgKSxcbiAgICAgICAgICBuZXcgVmVjdG9yMiggNSwgMiApLFxuICAgICAgICAgIG5ldyBWZWN0b3IyKCA1LCAzICksXG4gICAgICAgICAgbmV3IFZlY3RvcjIoIDMsIDQgKSxcbiAgICAgICAgICBuZXcgVmVjdG9yMiggNCwgNCApLFxuICAgICAgICAgIG5ldyBWZWN0b3IyKCA1LCA0ICksXG4gICAgICAgICAgbmV3IFZlY3RvcjIoIDUsIDUgKSxcbiAgICAgICAgICBuZXcgVmVjdG9yMiggNSwgNiApLFxuICAgICAgICAgIG5ldyBWZWN0b3IyKCAyLCA3ICksXG4gICAgICAgICAgbmV3IFZlY3RvcjIoIDMsIDcgKSxcbiAgICAgICAgICBuZXcgVmVjdG9yMiggNCwgNyApLFxuICAgICAgICAgIG5ldyBWZWN0b3IyKCA1LCA3IClcbiAgICAgICAgXTtcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGNhc2UgNDpcbiAgICAgICAgY29sb3IgPSBBcmVhQnVpbGRlclNoYXJlZENvbnN0YW50cy5EQVJLX0dSRUVOX0NPTE9SO1xuICAgICAgICBvY2N1cGllZENlbGxzID0gW1xuICAgICAgICAgIG5ldyBWZWN0b3IyKCA1LCAxICksXG4gICAgICAgICAgbmV3IFZlY3RvcjIoIDIsIDIgKSxcbiAgICAgICAgICBuZXcgVmVjdG9yMiggNSwgMiApLFxuICAgICAgICAgIG5ldyBWZWN0b3IyKCAyLCAzICksXG4gICAgICAgICAgbmV3IFZlY3RvcjIoIDUsIDMgKSxcbiAgICAgICAgICBuZXcgVmVjdG9yMiggMiwgNCApLFxuICAgICAgICAgIG5ldyBWZWN0b3IyKCA1LCA0ICksXG4gICAgICAgICAgbmV3IFZlY3RvcjIoIDIsIDUgKSxcbiAgICAgICAgICBuZXcgVmVjdG9yMiggMywgNSApLFxuICAgICAgICAgIG5ldyBWZWN0b3IyKCA0LCA1ICksXG4gICAgICAgICAgbmV3IFZlY3RvcjIoIDUsIDUgKSxcbiAgICAgICAgICBuZXcgVmVjdG9yMiggNiwgNSApLFxuICAgICAgICAgIG5ldyBWZWN0b3IyKCA1LCA2ICksXG4gICAgICAgICAgbmV3IFZlY3RvcjIoIDUsIDcgKVxuICAgICAgICBdO1xuICAgICAgICBicmVhaztcblxuICAgICAgY2FzZSA1OlxuICAgICAgICBjb2xvciA9IEFyZWFCdWlsZGVyU2hhcmVkQ29uc3RhbnRzLlBVUlBMSVNIX0NPTE9SO1xuICAgICAgICBvY2N1cGllZENlbGxzID0gW1xuICAgICAgICAgIG5ldyBWZWN0b3IyKCAyLCAxICksXG4gICAgICAgICAgbmV3IFZlY3RvcjIoIDMsIDEgKSxcbiAgICAgICAgICBuZXcgVmVjdG9yMiggNCwgMSApLFxuICAgICAgICAgIG5ldyBWZWN0b3IyKCA1LCAxICksXG4gICAgICAgICAgbmV3IFZlY3RvcjIoIDIsIDIgKSxcbiAgICAgICAgICBuZXcgVmVjdG9yMiggMiwgMyApLFxuICAgICAgICAgIG5ldyBWZWN0b3IyKCAyLCA0ICksXG4gICAgICAgICAgbmV3IFZlY3RvcjIoIDMsIDQgKSxcbiAgICAgICAgICBuZXcgVmVjdG9yMiggNCwgNCApLFxuICAgICAgICAgIG5ldyBWZWN0b3IyKCA1LCA0ICksXG4gICAgICAgICAgbmV3IFZlY3RvcjIoIDUsIDUgKSxcbiAgICAgICAgICBuZXcgVmVjdG9yMiggNSwgNiApLFxuICAgICAgICAgIG5ldyBWZWN0b3IyKCAyLCA3ICksXG4gICAgICAgICAgbmV3IFZlY3RvcjIoIDMsIDcgKSxcbiAgICAgICAgICBuZXcgVmVjdG9yMiggNCwgNyApLFxuICAgICAgICAgIG5ldyBWZWN0b3IyKCA1LCA3IClcbiAgICAgICAgXTtcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGNhc2UgNjpcbiAgICAgICAgY29sb3IgPSBBcmVhQnVpbGRlclNoYXJlZENvbnN0YW50cy5QSU5LSVNIX0NPTE9SO1xuICAgICAgICBvY2N1cGllZENlbGxzID0gW1xuICAgICAgICAgIG5ldyBWZWN0b3IyKCAyLCAxICksXG4gICAgICAgICAgbmV3IFZlY3RvcjIoIDMsIDEgKSxcbiAgICAgICAgICBuZXcgVmVjdG9yMiggNCwgMSApLFxuICAgICAgICAgIG5ldyBWZWN0b3IyKCA1LCAxICksXG4gICAgICAgICAgbmV3IFZlY3RvcjIoIDIsIDIgKSxcbiAgICAgICAgICBuZXcgVmVjdG9yMiggMiwgMyApLFxuICAgICAgICAgIG5ldyBWZWN0b3IyKCAyLCA0ICksXG4gICAgICAgICAgbmV3IFZlY3RvcjIoIDMsIDQgKSxcbiAgICAgICAgICBuZXcgVmVjdG9yMiggNCwgNCApLFxuICAgICAgICAgIG5ldyBWZWN0b3IyKCA1LCA0ICksXG4gICAgICAgICAgbmV3IFZlY3RvcjIoIDIsIDUgKSxcbiAgICAgICAgICBuZXcgVmVjdG9yMiggNSwgNSApLFxuICAgICAgICAgIG5ldyBWZWN0b3IyKCAyLCA2ICksXG4gICAgICAgICAgbmV3IFZlY3RvcjIoIDUsIDYgKSxcbiAgICAgICAgICBuZXcgVmVjdG9yMiggMiwgNyApLFxuICAgICAgICAgIG5ldyBWZWN0b3IyKCAzLCA3ICksXG4gICAgICAgICAgbmV3IFZlY3RvcjIoIDQsIDcgKSxcbiAgICAgICAgICBuZXcgVmVjdG9yMiggNSwgNyApXG4gICAgICAgIF07XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBkZWZhdWx0OlxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoIGBVbnN1cHBvcnRlZCBnYW1lIGxldmVsOiAke2xldmVsfWAgKTtcbiAgICB9XG4gICAgcmV0dXJuIG5ldyBHcmlkSWNvbiggTlVNX0NPTFVNTlMsIE5VTV9ST1dTLCBDRUxMX0xFTkdUSCwgY29sb3IsIG9jY3VwaWVkQ2VsbHMsIEdSSURfSUNPTl9PUFRJT05TICk7XG4gIH1cbn07XG5cbmFyZWFCdWlsZGVyLnJlZ2lzdGVyKCAnR2FtZUljb25GYWN0b3J5JywgR2FtZUljb25GYWN0b3J5ICk7XG5leHBvcnQgZGVmYXVsdCBHYW1lSWNvbkZhY3Rvcnk7Il0sIm5hbWVzIjpbIlZlY3RvcjIiLCJhcmVhQnVpbGRlciIsIkFyZWFCdWlsZGVyU2hhcmVkQ29uc3RhbnRzIiwiR3JpZEljb24iLCJOVU1fQ09MVU1OUyIsIk5VTV9ST1dTIiwiQ0VMTF9MRU5HVEgiLCJHUklEX0lDT05fT1BUSU9OUyIsImdyaWRTdHJva2UiLCJncmlkTGluZVdpZHRoIiwic2hhcGVMaW5lV2lkdGgiLCJHYW1lSWNvbkZhY3RvcnkiLCJjcmVhdGVJY29uIiwibGV2ZWwiLCJjb2xvciIsIm9jY3VwaWVkQ2VsbHMiLCJPUkFOR0lTSF9DT0xPUiIsIk9SQU5HRV9CUk9XTl9DT0xPUiIsIkdSRUVOSVNIX0NPTE9SIiwiREFSS19HUkVFTl9DT0xPUiIsIlBVUlBMSVNIX0NPTE9SIiwiUElOS0lTSF9DT0xPUiIsIkVycm9yIiwicmVnaXN0ZXIiXSwibWFwcGluZ3MiOiJBQUFBLHNEQUFzRDtBQUV0RDs7OztDQUlDLEdBRUQsT0FBT0EsYUFBYSxnQ0FBZ0M7QUFDcEQsT0FBT0MsaUJBQWlCLHVCQUF1QjtBQUMvQyxPQUFPQyxnQ0FBZ0MsNkNBQTZDO0FBQ3BGLE9BQU9DLGNBQWMsZ0NBQWdDO0FBRXJELFlBQVk7QUFDWixNQUFNQyxjQUFjO0FBQ3BCLE1BQU1DLFdBQVc7QUFDakIsTUFBTUMsY0FBYztBQUNwQixNQUFNQyxvQkFBb0I7SUFDeEJDLFlBQVk7SUFDWkMsZUFBZTtJQUNmQyxnQkFBZ0I7QUFDbEI7QUFFQTs7Q0FFQyxHQUNELE1BQU1DLGtCQUFrQjtJQUN0QkMsWUFBWUMsS0FBSztRQUNmLElBQUlDO1FBQ0osSUFBSUM7UUFDSixPQUFRRjtZQUNOLEtBQUs7Z0JBQ0hDLFFBQVFaLDJCQUEyQmMsY0FBYztnQkFDakRELGdCQUFnQjtvQkFDZCxJQUFJZixRQUFTLEdBQUc7b0JBQ2hCLElBQUlBLFFBQVMsR0FBRztvQkFDaEIsSUFBSUEsUUFBUyxHQUFHO29CQUNoQixJQUFJQSxRQUFTLEdBQUc7b0JBQ2hCLElBQUlBLFFBQVMsR0FBRztvQkFDaEIsSUFBSUEsUUFBUyxHQUFHO29CQUNoQixJQUFJQSxRQUFTLEdBQUc7b0JBQ2hCLElBQUlBLFFBQVMsR0FBRztvQkFDaEIsSUFBSUEsUUFBUyxHQUFHO29CQUNoQixJQUFJQSxRQUFTLEdBQUc7aUJBQ2pCO2dCQUNEO1lBRUYsS0FBSztnQkFDSGMsUUFBUVosMkJBQTJCZSxrQkFBa0I7Z0JBQ3JERixnQkFBZ0I7b0JBQ2QsSUFBSWYsUUFBUyxHQUFHO29CQUNoQixJQUFJQSxRQUFTLEdBQUc7b0JBQ2hCLElBQUlBLFFBQVMsR0FBRztvQkFDaEIsSUFBSUEsUUFBUyxHQUFHO29CQUNoQixJQUFJQSxRQUFTLEdBQUc7b0JBQ2hCLElBQUlBLFFBQVMsR0FBRztvQkFDaEIsSUFBSUEsUUFBUyxHQUFHO29CQUNoQixJQUFJQSxRQUFTLEdBQUc7b0JBQ2hCLElBQUlBLFFBQVMsR0FBRztvQkFDaEIsSUFBSUEsUUFBUyxHQUFHO29CQUNoQixJQUFJQSxRQUFTLEdBQUc7b0JBQ2hCLElBQUlBLFFBQVMsR0FBRztvQkFDaEIsSUFBSUEsUUFBUyxHQUFHO29CQUNoQixJQUFJQSxRQUFTLEdBQUc7b0JBQ2hCLElBQUlBLFFBQVMsR0FBRztvQkFDaEIsSUFBSUEsUUFBUyxHQUFHO29CQUNoQixJQUFJQSxRQUFTLEdBQUc7aUJBQ2pCO2dCQUNEO1lBRUYsS0FBSztnQkFDSGMsUUFBUVosMkJBQTJCZ0IsY0FBYztnQkFDakRILGdCQUFnQjtvQkFDZCxJQUFJZixRQUFTLEdBQUc7b0JBQ2hCLElBQUlBLFFBQVMsR0FBRztvQkFDaEIsSUFBSUEsUUFBUyxHQUFHO29CQUNoQixJQUFJQSxRQUFTLEdBQUc7b0JBQ2hCLElBQUlBLFFBQVMsR0FBRztvQkFDaEIsSUFBSUEsUUFBUyxHQUFHO29CQUNoQixJQUFJQSxRQUFTLEdBQUc7b0JBQ2hCLElBQUlBLFFBQVMsR0FBRztvQkFDaEIsSUFBSUEsUUFBUyxHQUFHO29CQUNoQixJQUFJQSxRQUFTLEdBQUc7b0JBQ2hCLElBQUlBLFFBQVMsR0FBRztvQkFDaEIsSUFBSUEsUUFBUyxHQUFHO29CQUNoQixJQUFJQSxRQUFTLEdBQUc7b0JBQ2hCLElBQUlBLFFBQVMsR0FBRztvQkFDaEIsSUFBSUEsUUFBUyxHQUFHO2lCQUNqQjtnQkFDRDtZQUVGLEtBQUs7Z0JBQ0hjLFFBQVFaLDJCQUEyQmlCLGdCQUFnQjtnQkFDbkRKLGdCQUFnQjtvQkFDZCxJQUFJZixRQUFTLEdBQUc7b0JBQ2hCLElBQUlBLFFBQVMsR0FBRztvQkFDaEIsSUFBSUEsUUFBUyxHQUFHO29CQUNoQixJQUFJQSxRQUFTLEdBQUc7b0JBQ2hCLElBQUlBLFFBQVMsR0FBRztvQkFDaEIsSUFBSUEsUUFBUyxHQUFHO29CQUNoQixJQUFJQSxRQUFTLEdBQUc7b0JBQ2hCLElBQUlBLFFBQVMsR0FBRztvQkFDaEIsSUFBSUEsUUFBUyxHQUFHO29CQUNoQixJQUFJQSxRQUFTLEdBQUc7b0JBQ2hCLElBQUlBLFFBQVMsR0FBRztvQkFDaEIsSUFBSUEsUUFBUyxHQUFHO29CQUNoQixJQUFJQSxRQUFTLEdBQUc7b0JBQ2hCLElBQUlBLFFBQVMsR0FBRztpQkFDakI7Z0JBQ0Q7WUFFRixLQUFLO2dCQUNIYyxRQUFRWiwyQkFBMkJrQixjQUFjO2dCQUNqREwsZ0JBQWdCO29CQUNkLElBQUlmLFFBQVMsR0FBRztvQkFDaEIsSUFBSUEsUUFBUyxHQUFHO29CQUNoQixJQUFJQSxRQUFTLEdBQUc7b0JBQ2hCLElBQUlBLFFBQVMsR0FBRztvQkFDaEIsSUFBSUEsUUFBUyxHQUFHO29CQUNoQixJQUFJQSxRQUFTLEdBQUc7b0JBQ2hCLElBQUlBLFFBQVMsR0FBRztvQkFDaEIsSUFBSUEsUUFBUyxHQUFHO29CQUNoQixJQUFJQSxRQUFTLEdBQUc7b0JBQ2hCLElBQUlBLFFBQVMsR0FBRztvQkFDaEIsSUFBSUEsUUFBUyxHQUFHO29CQUNoQixJQUFJQSxRQUFTLEdBQUc7b0JBQ2hCLElBQUlBLFFBQVMsR0FBRztvQkFDaEIsSUFBSUEsUUFBUyxHQUFHO29CQUNoQixJQUFJQSxRQUFTLEdBQUc7b0JBQ2hCLElBQUlBLFFBQVMsR0FBRztpQkFDakI7Z0JBQ0Q7WUFFRixLQUFLO2dCQUNIYyxRQUFRWiwyQkFBMkJtQixhQUFhO2dCQUNoRE4sZ0JBQWdCO29CQUNkLElBQUlmLFFBQVMsR0FBRztvQkFDaEIsSUFBSUEsUUFBUyxHQUFHO29CQUNoQixJQUFJQSxRQUFTLEdBQUc7b0JBQ2hCLElBQUlBLFFBQVMsR0FBRztvQkFDaEIsSUFBSUEsUUFBUyxHQUFHO29CQUNoQixJQUFJQSxRQUFTLEdBQUc7b0JBQ2hCLElBQUlBLFFBQVMsR0FBRztvQkFDaEIsSUFBSUEsUUFBUyxHQUFHO29CQUNoQixJQUFJQSxRQUFTLEdBQUc7b0JBQ2hCLElBQUlBLFFBQVMsR0FBRztvQkFDaEIsSUFBSUEsUUFBUyxHQUFHO29CQUNoQixJQUFJQSxRQUFTLEdBQUc7b0JBQ2hCLElBQUlBLFFBQVMsR0FBRztvQkFDaEIsSUFBSUEsUUFBUyxHQUFHO29CQUNoQixJQUFJQSxRQUFTLEdBQUc7b0JBQ2hCLElBQUlBLFFBQVMsR0FBRztvQkFDaEIsSUFBSUEsUUFBUyxHQUFHO29CQUNoQixJQUFJQSxRQUFTLEdBQUc7aUJBQ2pCO2dCQUNEO1lBRUY7Z0JBQ0UsTUFBTSxJQUFJc0IsTUFBTyxDQUFDLHdCQUF3QixFQUFFVCxPQUFPO1FBQ3ZEO1FBQ0EsT0FBTyxJQUFJVixTQUFVQyxhQUFhQyxVQUFVQyxhQUFhUSxPQUFPQyxlQUFlUjtJQUNqRjtBQUNGO0FBRUFOLFlBQVlzQixRQUFRLENBQUUsbUJBQW1CWjtBQUN6QyxlQUFlQSxnQkFBZ0IifQ==