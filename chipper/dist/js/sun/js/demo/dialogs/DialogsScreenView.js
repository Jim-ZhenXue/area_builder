// Copyright 2018-2024, University of Colorado Boulder
/**
 * View for demonstrating dialogs.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */ import dotRandom from '../../../../dot/js/dotRandom.js';
import ScreenView from '../../../../joist/js/ScreenView.js';
import { Font, Node, Rectangle, Text } from '../../../../scenery/js/imports.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import RectangularPushButton from '../../buttons/RectangularPushButton.js';
import Dialog from '../../Dialog.js';
import sun from '../../sun.js';
// constants
const BUTTON_FONT = new Font({
    size: 20
});
let DialogsScreenView = class DialogsScreenView extends ScreenView {
    constructor(providedOptions){
        super(providedOptions);
        // dialog will be created the first time the button is pressed, lazily because Dialog
        // requires sim bounds during Dialog construction
        let dialog = null;
        const modalDialogButton = new RectangularPushButton({
            content: new Text('modal dialog', {
                font: BUTTON_FONT
            }),
            listener: ()=>{
                if (!dialog) {
                    dialog = createDialog(true);
                }
                dialog.show();
            },
            left: this.layoutBounds.left + 100,
            top: this.layoutBounds.top + 100,
            tandem: Tandem.OPT_OUT
        });
        this.addChild(modalDialogButton);
    }
};
function createDialog(isModal) {
    const resizeButton = new RectangularPushButton({
        content: new Text('Resize', {
            font: new Font({
                size: 18
            })
        })
    });
    const minWidth = 1.5 * resizeButton.width;
    const minHeight = 1.5 * resizeButton.height;
    // This rectangle represents that bounds of the Dialog's content.
    const randomRect = new Rectangle(0, 0, minWidth, minHeight, {
        stroke: 'red'
    });
    resizeButton.center = randomRect.center;
    resizeButton.addListener(()=>{
        randomRect.rectWidth = minWidth + dotRandom.nextDouble() * 200;
        randomRect.rectHeight = minHeight + dotRandom.nextDouble() * 100;
        resizeButton.center = randomRect.center;
    });
    const contentNode = new Node({
        children: [
            randomRect,
            resizeButton
        ]
    });
    return new Dialog(contentNode, {
        titleAlign: 'center',
        isModal: isModal,
        title: new Text('Title', {
            font: new Font({
                size: 32
            })
        })
    });
}
sun.register('DialogsScreenView', DialogsScreenView);
export default DialogsScreenView;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3N1bi9qcy9kZW1vL2RpYWxvZ3MvRGlhbG9nc1NjcmVlblZpZXcudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTgtMjAyNCwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbi8qKlxuICogVmlldyBmb3IgZGVtb25zdHJhdGluZyBkaWFsb2dzLlxuICpcbiAqIEBhdXRob3IgQ2hyaXMgTWFsbGV5IChQaXhlbFpvb20sIEluYy4pXG4gKi9cblxuaW1wb3J0IGRvdFJhbmRvbSBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvZG90UmFuZG9tLmpzJztcbmltcG9ydCBTY3JlZW5WaWV3IGZyb20gJy4uLy4uLy4uLy4uL2pvaXN0L2pzL1NjcmVlblZpZXcuanMnO1xuaW1wb3J0IHsgRW1wdHlTZWxmT3B0aW9ucyB9IGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9vcHRpb25pemUuanMnO1xuaW1wb3J0IFBpY2tSZXF1aXJlZCBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvdHlwZXMvUGlja1JlcXVpcmVkLmpzJztcbmltcG9ydCB7IEZvbnQsIE5vZGUsIFJlY3RhbmdsZSwgVGV4dCB9IGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XG5pbXBvcnQgVGFuZGVtIGZyb20gJy4uLy4uLy4uLy4uL3RhbmRlbS9qcy9UYW5kZW0uanMnO1xuaW1wb3J0IFJlY3Rhbmd1bGFyUHVzaEJ1dHRvbiBmcm9tICcuLi8uLi9idXR0b25zL1JlY3Rhbmd1bGFyUHVzaEJ1dHRvbi5qcyc7XG5pbXBvcnQgRGlhbG9nIGZyb20gJy4uLy4uL0RpYWxvZy5qcyc7XG5pbXBvcnQgc3VuIGZyb20gJy4uLy4uL3N1bi5qcyc7XG5pbXBvcnQgeyBEZW1vc1NjcmVlblZpZXdPcHRpb25zIH0gZnJvbSAnLi4vRGVtb3NTY3JlZW5WaWV3LmpzJztcblxuLy8gY29uc3RhbnRzXG5jb25zdCBCVVRUT05fRk9OVCA9IG5ldyBGb250KCB7IHNpemU6IDIwIH0gKTtcblxudHlwZSBTZWxmT3B0aW9ucyA9IEVtcHR5U2VsZk9wdGlvbnM7XG50eXBlIERpYWxvZ3NTY3JlZW5WaWV3T3B0aW9ucyA9IFNlbGZPcHRpb25zICYgUGlja1JlcXVpcmVkPERlbW9zU2NyZWVuVmlld09wdGlvbnMsICd0YW5kZW0nPjtcblxuY2xhc3MgRGlhbG9nc1NjcmVlblZpZXcgZXh0ZW5kcyBTY3JlZW5WaWV3IHtcblxuICBwdWJsaWMgY29uc3RydWN0b3IoIHByb3ZpZGVkT3B0aW9uczogRGlhbG9nc1NjcmVlblZpZXdPcHRpb25zICkge1xuXG4gICAgc3VwZXIoIHByb3ZpZGVkT3B0aW9ucyApO1xuXG4gICAgLy8gZGlhbG9nIHdpbGwgYmUgY3JlYXRlZCB0aGUgZmlyc3QgdGltZSB0aGUgYnV0dG9uIGlzIHByZXNzZWQsIGxhemlseSBiZWNhdXNlIERpYWxvZ1xuICAgIC8vIHJlcXVpcmVzIHNpbSBib3VuZHMgZHVyaW5nIERpYWxvZyBjb25zdHJ1Y3Rpb25cbiAgICBsZXQgZGlhbG9nOiBEaWFsb2cgfCBudWxsID0gbnVsbDtcblxuICAgIGNvbnN0IG1vZGFsRGlhbG9nQnV0dG9uID0gbmV3IFJlY3Rhbmd1bGFyUHVzaEJ1dHRvbigge1xuICAgICAgY29udGVudDogbmV3IFRleHQoICdtb2RhbCBkaWFsb2cnLCB7IGZvbnQ6IEJVVFRPTl9GT05UIH0gKSxcbiAgICAgIGxpc3RlbmVyOiAoKSA9PiB7XG4gICAgICAgIGlmICggIWRpYWxvZyApIHtcbiAgICAgICAgICBkaWFsb2cgPSBjcmVhdGVEaWFsb2coIHRydWUgKTtcbiAgICAgICAgfVxuICAgICAgICBkaWFsb2cuc2hvdygpO1xuICAgICAgfSxcbiAgICAgIGxlZnQ6IHRoaXMubGF5b3V0Qm91bmRzLmxlZnQgKyAxMDAsXG4gICAgICB0b3A6IHRoaXMubGF5b3V0Qm91bmRzLnRvcCArIDEwMCxcbiAgICAgIHRhbmRlbTogVGFuZGVtLk9QVF9PVVRcbiAgICB9ICk7XG4gICAgdGhpcy5hZGRDaGlsZCggbW9kYWxEaWFsb2dCdXR0b24gKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBjcmVhdGVEaWFsb2coIGlzTW9kYWw6IGJvb2xlYW4gKTogRGlhbG9nIHtcblxuICBjb25zdCByZXNpemVCdXR0b24gPSBuZXcgUmVjdGFuZ3VsYXJQdXNoQnV0dG9uKCB7XG4gICAgY29udGVudDogbmV3IFRleHQoICdSZXNpemUnLCB7IGZvbnQ6IG5ldyBGb250KCB7IHNpemU6IDE4IH0gKSB9IClcbiAgfSApO1xuXG4gIGNvbnN0IG1pbldpZHRoID0gMS41ICogcmVzaXplQnV0dG9uLndpZHRoO1xuICBjb25zdCBtaW5IZWlnaHQgPSAxLjUgKiByZXNpemVCdXR0b24uaGVpZ2h0O1xuXG4gIC8vIFRoaXMgcmVjdGFuZ2xlIHJlcHJlc2VudHMgdGhhdCBib3VuZHMgb2YgdGhlIERpYWxvZydzIGNvbnRlbnQuXG4gIGNvbnN0IHJhbmRvbVJlY3QgPSBuZXcgUmVjdGFuZ2xlKCAwLCAwLCBtaW5XaWR0aCwgbWluSGVpZ2h0LCB7IHN0cm9rZTogJ3JlZCcgfSApO1xuICByZXNpemVCdXR0b24uY2VudGVyID0gcmFuZG9tUmVjdC5jZW50ZXI7XG5cbiAgcmVzaXplQnV0dG9uLmFkZExpc3RlbmVyKCAoKSA9PiB7XG4gICAgcmFuZG9tUmVjdC5yZWN0V2lkdGggPSBtaW5XaWR0aCArIGRvdFJhbmRvbS5uZXh0RG91YmxlKCkgKiAyMDA7XG4gICAgcmFuZG9tUmVjdC5yZWN0SGVpZ2h0ID0gbWluSGVpZ2h0ICsgZG90UmFuZG9tLm5leHREb3VibGUoKSAqIDEwMDtcbiAgICByZXNpemVCdXR0b24uY2VudGVyID0gcmFuZG9tUmVjdC5jZW50ZXI7XG4gIH0gKTtcblxuICBjb25zdCBjb250ZW50Tm9kZSA9IG5ldyBOb2RlKCB7IGNoaWxkcmVuOiBbIHJhbmRvbVJlY3QsIHJlc2l6ZUJ1dHRvbiBdIH0gKTtcblxuICByZXR1cm4gbmV3IERpYWxvZyggY29udGVudE5vZGUsIHtcbiAgICB0aXRsZUFsaWduOiAnY2VudGVyJyxcbiAgICBpc01vZGFsOiBpc01vZGFsLFxuICAgIHRpdGxlOiBuZXcgVGV4dCggJ1RpdGxlJywgeyBmb250OiBuZXcgRm9udCggeyBzaXplOiAzMiB9ICkgfSApXG4gIH0gKTtcbn1cblxuc3VuLnJlZ2lzdGVyKCAnRGlhbG9nc1NjcmVlblZpZXcnLCBEaWFsb2dzU2NyZWVuVmlldyApO1xuZXhwb3J0IGRlZmF1bHQgRGlhbG9nc1NjcmVlblZpZXc7Il0sIm5hbWVzIjpbImRvdFJhbmRvbSIsIlNjcmVlblZpZXciLCJGb250IiwiTm9kZSIsIlJlY3RhbmdsZSIsIlRleHQiLCJUYW5kZW0iLCJSZWN0YW5ndWxhclB1c2hCdXR0b24iLCJEaWFsb2ciLCJzdW4iLCJCVVRUT05fRk9OVCIsInNpemUiLCJEaWFsb2dzU2NyZWVuVmlldyIsInByb3ZpZGVkT3B0aW9ucyIsImRpYWxvZyIsIm1vZGFsRGlhbG9nQnV0dG9uIiwiY29udGVudCIsImZvbnQiLCJsaXN0ZW5lciIsImNyZWF0ZURpYWxvZyIsInNob3ciLCJsZWZ0IiwibGF5b3V0Qm91bmRzIiwidG9wIiwidGFuZGVtIiwiT1BUX09VVCIsImFkZENoaWxkIiwiaXNNb2RhbCIsInJlc2l6ZUJ1dHRvbiIsIm1pbldpZHRoIiwid2lkdGgiLCJtaW5IZWlnaHQiLCJoZWlnaHQiLCJyYW5kb21SZWN0Iiwic3Ryb2tlIiwiY2VudGVyIiwiYWRkTGlzdGVuZXIiLCJyZWN0V2lkdGgiLCJuZXh0RG91YmxlIiwicmVjdEhlaWdodCIsImNvbnRlbnROb2RlIiwiY2hpbGRyZW4iLCJ0aXRsZUFsaWduIiwidGl0bGUiLCJyZWdpc3RlciJdLCJtYXBwaW5ncyI6IkFBQUEsc0RBQXNEO0FBRXREOzs7O0NBSUMsR0FFRCxPQUFPQSxlQUFlLGtDQUFrQztBQUN4RCxPQUFPQyxnQkFBZ0IscUNBQXFDO0FBRzVELFNBQVNDLElBQUksRUFBRUMsSUFBSSxFQUFFQyxTQUFTLEVBQUVDLElBQUksUUFBUSxvQ0FBb0M7QUFDaEYsT0FBT0MsWUFBWSxrQ0FBa0M7QUFDckQsT0FBT0MsMkJBQTJCLHlDQUF5QztBQUMzRSxPQUFPQyxZQUFZLGtCQUFrQjtBQUNyQyxPQUFPQyxTQUFTLGVBQWU7QUFHL0IsWUFBWTtBQUNaLE1BQU1DLGNBQWMsSUFBSVIsS0FBTTtJQUFFUyxNQUFNO0FBQUc7QUFLekMsSUFBQSxBQUFNQyxvQkFBTixNQUFNQSwwQkFBMEJYO0lBRTlCLFlBQW9CWSxlQUF5QyxDQUFHO1FBRTlELEtBQUssQ0FBRUE7UUFFUCxxRkFBcUY7UUFDckYsaURBQWlEO1FBQ2pELElBQUlDLFNBQXdCO1FBRTVCLE1BQU1DLG9CQUFvQixJQUFJUixzQkFBdUI7WUFDbkRTLFNBQVMsSUFBSVgsS0FBTSxnQkFBZ0I7Z0JBQUVZLE1BQU1QO1lBQVk7WUFDdkRRLFVBQVU7Z0JBQ1IsSUFBSyxDQUFDSixRQUFTO29CQUNiQSxTQUFTSyxhQUFjO2dCQUN6QjtnQkFDQUwsT0FBT00sSUFBSTtZQUNiO1lBQ0FDLE1BQU0sSUFBSSxDQUFDQyxZQUFZLENBQUNELElBQUksR0FBRztZQUMvQkUsS0FBSyxJQUFJLENBQUNELFlBQVksQ0FBQ0MsR0FBRyxHQUFHO1lBQzdCQyxRQUFRbEIsT0FBT21CLE9BQU87UUFDeEI7UUFDQSxJQUFJLENBQUNDLFFBQVEsQ0FBRVg7SUFDakI7QUFDRjtBQUVBLFNBQVNJLGFBQWNRLE9BQWdCO0lBRXJDLE1BQU1DLGVBQWUsSUFBSXJCLHNCQUF1QjtRQUM5Q1MsU0FBUyxJQUFJWCxLQUFNLFVBQVU7WUFBRVksTUFBTSxJQUFJZixLQUFNO2dCQUFFUyxNQUFNO1lBQUc7UUFBSTtJQUNoRTtJQUVBLE1BQU1rQixXQUFXLE1BQU1ELGFBQWFFLEtBQUs7SUFDekMsTUFBTUMsWUFBWSxNQUFNSCxhQUFhSSxNQUFNO0lBRTNDLGlFQUFpRTtJQUNqRSxNQUFNQyxhQUFhLElBQUk3QixVQUFXLEdBQUcsR0FBR3lCLFVBQVVFLFdBQVc7UUFBRUcsUUFBUTtJQUFNO0lBQzdFTixhQUFhTyxNQUFNLEdBQUdGLFdBQVdFLE1BQU07SUFFdkNQLGFBQWFRLFdBQVcsQ0FBRTtRQUN4QkgsV0FBV0ksU0FBUyxHQUFHUixXQUFXN0IsVUFBVXNDLFVBQVUsS0FBSztRQUMzREwsV0FBV00sVUFBVSxHQUFHUixZQUFZL0IsVUFBVXNDLFVBQVUsS0FBSztRQUM3RFYsYUFBYU8sTUFBTSxHQUFHRixXQUFXRSxNQUFNO0lBQ3pDO0lBRUEsTUFBTUssY0FBYyxJQUFJckMsS0FBTTtRQUFFc0MsVUFBVTtZQUFFUjtZQUFZTDtTQUFjO0lBQUM7SUFFdkUsT0FBTyxJQUFJcEIsT0FBUWdDLGFBQWE7UUFDOUJFLFlBQVk7UUFDWmYsU0FBU0E7UUFDVGdCLE9BQU8sSUFBSXRDLEtBQU0sU0FBUztZQUFFWSxNQUFNLElBQUlmLEtBQU07Z0JBQUVTLE1BQU07WUFBRztRQUFJO0lBQzdEO0FBQ0Y7QUFFQUYsSUFBSW1DLFFBQVEsQ0FBRSxxQkFBcUJoQztBQUNuQyxlQUFlQSxrQkFBa0IifQ==