// Copyright 2022-2024, University of Colorado Boulder
/**
 * Demo for AccordionBox
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */ import dotRandom from '../../../../dot/js/dotRandom.js';
import { Font, Rectangle, Text, VBox } from '../../../../scenery/js/imports.js';
import AccordionBox from '../../AccordionBox.js';
import RectangularPushButton from '../../buttons/RectangularPushButton.js';
export default function demoAccordionBox(layoutBounds) {
    const randomRect = new Rectangle(0, 0, 100, 50, {
        fill: 'red'
    });
    const resizeButton = new RectangularPushButton({
        content: new Text('Resize', {
            font: new Font({
                size: 20
            })
        }),
        listener: ()=>{
            randomRect.rectWidth = 50 + dotRandom.nextDouble() * 150;
            randomRect.rectHeight = 50 + dotRandom.nextDouble() * 150;
            box.center = layoutBounds.center;
        }
    });
    const box = new AccordionBox(new VBox({
        spacing: 10,
        children: [
            resizeButton,
            randomRect
        ]
    }), {
        resize: true,
        center: layoutBounds.center
    });
    return box;
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3N1bi9qcy9kZW1vL2NvbXBvbmVudHMvZGVtb0FjY29yZGlvbkJveC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAyMi0yMDI0LCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuLyoqXG4gKiBEZW1vIGZvciBBY2NvcmRpb25Cb3hcbiAqXG4gKiBAYXV0aG9yIENocmlzIE1hbGxleSAoUGl4ZWxab29tLCBJbmMuKVxuICovXG5cbmltcG9ydCBCb3VuZHMyIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9Cb3VuZHMyLmpzJztcbmltcG9ydCBkb3RSYW5kb20gZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL2RvdFJhbmRvbS5qcyc7XG5pbXBvcnQgeyBGb250LCBOb2RlLCBSZWN0YW5nbGUsIFRleHQsIFZCb3ggfSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xuaW1wb3J0IEFjY29yZGlvbkJveCBmcm9tICcuLi8uLi9BY2NvcmRpb25Cb3guanMnO1xuaW1wb3J0IFJlY3Rhbmd1bGFyUHVzaEJ1dHRvbiBmcm9tICcuLi8uLi9idXR0b25zL1JlY3Rhbmd1bGFyUHVzaEJ1dHRvbi5qcyc7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGRlbW9BY2NvcmRpb25Cb3goIGxheW91dEJvdW5kczogQm91bmRzMiApOiBOb2RlIHtcbiAgY29uc3QgcmFuZG9tUmVjdCA9IG5ldyBSZWN0YW5nbGUoIDAsIDAsIDEwMCwgNTAsIHsgZmlsbDogJ3JlZCcgfSApO1xuXG4gIGNvbnN0IHJlc2l6ZUJ1dHRvbiA9IG5ldyBSZWN0YW5ndWxhclB1c2hCdXR0b24oIHtcbiAgICBjb250ZW50OiBuZXcgVGV4dCggJ1Jlc2l6ZScsIHsgZm9udDogbmV3IEZvbnQoIHsgc2l6ZTogMjAgfSApIH0gKSxcbiAgICBsaXN0ZW5lcjogKCkgPT4ge1xuICAgICAgcmFuZG9tUmVjdC5yZWN0V2lkdGggPSA1MCArIGRvdFJhbmRvbS5uZXh0RG91YmxlKCkgKiAxNTA7XG4gICAgICByYW5kb21SZWN0LnJlY3RIZWlnaHQgPSA1MCArIGRvdFJhbmRvbS5uZXh0RG91YmxlKCkgKiAxNTA7XG4gICAgICBib3guY2VudGVyID0gbGF5b3V0Qm91bmRzLmNlbnRlcjtcbiAgICB9XG4gIH0gKTtcblxuICBjb25zdCBib3ggPSBuZXcgQWNjb3JkaW9uQm94KCBuZXcgVkJveCgge1xuICAgIHNwYWNpbmc6IDEwLFxuICAgIGNoaWxkcmVuOiBbXG4gICAgICByZXNpemVCdXR0b24sXG4gICAgICByYW5kb21SZWN0XG4gICAgXVxuICB9ICksIHtcbiAgICByZXNpemU6IHRydWUsXG4gICAgY2VudGVyOiBsYXlvdXRCb3VuZHMuY2VudGVyXG4gIH0gKTtcblxuICByZXR1cm4gYm94O1xufSJdLCJuYW1lcyI6WyJkb3RSYW5kb20iLCJGb250IiwiUmVjdGFuZ2xlIiwiVGV4dCIsIlZCb3giLCJBY2NvcmRpb25Cb3giLCJSZWN0YW5ndWxhclB1c2hCdXR0b24iLCJkZW1vQWNjb3JkaW9uQm94IiwibGF5b3V0Qm91bmRzIiwicmFuZG9tUmVjdCIsImZpbGwiLCJyZXNpemVCdXR0b24iLCJjb250ZW50IiwiZm9udCIsInNpemUiLCJsaXN0ZW5lciIsInJlY3RXaWR0aCIsIm5leHREb3VibGUiLCJyZWN0SGVpZ2h0IiwiYm94IiwiY2VudGVyIiwic3BhY2luZyIsImNoaWxkcmVuIiwicmVzaXplIl0sIm1hcHBpbmdzIjoiQUFBQSxzREFBc0Q7QUFFdEQ7Ozs7Q0FJQyxHQUdELE9BQU9BLGVBQWUsa0NBQWtDO0FBQ3hELFNBQVNDLElBQUksRUFBUUMsU0FBUyxFQUFFQyxJQUFJLEVBQUVDLElBQUksUUFBUSxvQ0FBb0M7QUFDdEYsT0FBT0Msa0JBQWtCLHdCQUF3QjtBQUNqRCxPQUFPQywyQkFBMkIseUNBQXlDO0FBRTNFLGVBQWUsU0FBU0MsaUJBQWtCQyxZQUFxQjtJQUM3RCxNQUFNQyxhQUFhLElBQUlQLFVBQVcsR0FBRyxHQUFHLEtBQUssSUFBSTtRQUFFUSxNQUFNO0lBQU07SUFFL0QsTUFBTUMsZUFBZSxJQUFJTCxzQkFBdUI7UUFDOUNNLFNBQVMsSUFBSVQsS0FBTSxVQUFVO1lBQUVVLE1BQU0sSUFBSVosS0FBTTtnQkFBRWEsTUFBTTtZQUFHO1FBQUk7UUFDOURDLFVBQVU7WUFDUk4sV0FBV08sU0FBUyxHQUFHLEtBQUtoQixVQUFVaUIsVUFBVSxLQUFLO1lBQ3JEUixXQUFXUyxVQUFVLEdBQUcsS0FBS2xCLFVBQVVpQixVQUFVLEtBQUs7WUFDdERFLElBQUlDLE1BQU0sR0FBR1osYUFBYVksTUFBTTtRQUNsQztJQUNGO0lBRUEsTUFBTUQsTUFBTSxJQUFJZCxhQUFjLElBQUlELEtBQU07UUFDdENpQixTQUFTO1FBQ1RDLFVBQVU7WUFDUlg7WUFDQUY7U0FDRDtJQUNILElBQUs7UUFDSGMsUUFBUTtRQUNSSCxRQUFRWixhQUFhWSxNQUFNO0lBQzdCO0lBRUEsT0FBT0Q7QUFDVCJ9