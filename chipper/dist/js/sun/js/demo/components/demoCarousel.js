// Copyright 2022-2024, University of Colorado Boulder
/**
 * Demo for Carousel
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */ import { Circle, Font, Node, Rectangle, Text, VBox } from '../../../../scenery/js/imports.js';
import RectangularPushButton from '../../buttons/RectangularPushButton.js';
import Carousel from '../../Carousel.js';
const FONT = new Font({
    size: 20
});
export default function demoCarousel(layoutBounds) {
    // create items
    const colors = [
        'red',
        'blue',
        'green',
        'yellow',
        'pink',
        'white',
        'orange',
        'magenta',
        'purple',
        'pink'
    ];
    const vItems = [];
    const hItems = [];
    colors.forEach((color)=>{
        vItems.push({
            createNode: ()=>new Rectangle(0, 0, 60, 60, {
                    fill: color,
                    stroke: 'black'
                })
        });
        hItems.push({
            createNode: ()=>new Circle(30, {
                    fill: color,
                    stroke: 'black'
                })
        });
    });
    // vertical carousel
    const vCarousel = new Carousel(vItems, {
        orientation: 'vertical',
        separatorsVisible: true,
        buttonOptions: {
            touchAreaXDilation: 5,
            touchAreaYDilation: 15,
            mouseAreaXDilation: 2,
            mouseAreaYDilation: 7
        }
    });
    // horizontal carousel
    const hCarousel = new Carousel(hItems, {
        orientation: 'horizontal',
        separatorsVisible: true,
        buttonOptions: {
            touchAreaXDilation: 15,
            touchAreaYDilation: 5,
            mouseAreaXDilation: 7,
            mouseAreaYDilation: 2
        },
        centerX: vCarousel.centerX,
        top: vCarousel.bottom + 50
    });
    // button that scrolls the horizontal carousel to a specific item
    const itemIndex = 4;
    const hScrollToItemButton = new RectangularPushButton({
        content: new Text(`scroll to item ${itemIndex}`, {
            font: FONT
        }),
        listener: ()=>hCarousel.scrollToItem(hItems[itemIndex])
    });
    // button that sets the horizontal carousel to a specific page number
    const pageNumber = 0;
    const hScrollToPageButton = new RectangularPushButton({
        content: new Text(`scroll to page ${pageNumber}`, {
            font: FONT
        }),
        listener: ()=>hCarousel.pageNumberProperty.set(pageNumber)
    });
    // group the buttons
    const buttonGroup = new VBox({
        children: [
            hScrollToItemButton,
            hScrollToPageButton
        ],
        align: 'left',
        spacing: 7,
        left: hCarousel.right + 30,
        centerY: hCarousel.centerY
    });
    return new Node({
        children: [
            vCarousel,
            hCarousel,
            buttonGroup
        ],
        center: layoutBounds.center
    });
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3N1bi9qcy9kZW1vL2NvbXBvbmVudHMvZGVtb0Nhcm91c2VsLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDIyLTIwMjQsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIERlbW8gZm9yIENhcm91c2VsXG4gKlxuICogQGF1dGhvciBDaHJpcyBNYWxsZXkgKFBpeGVsWm9vbSwgSW5jLilcbiAqL1xuXG5pbXBvcnQgQm91bmRzMiBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvQm91bmRzMi5qcyc7XG5pbXBvcnQgeyBDaXJjbGUsIEZvbnQsIE5vZGUsIFJlY3RhbmdsZSwgVGV4dCwgVkJveCB9IGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XG5pbXBvcnQgUmVjdGFuZ3VsYXJQdXNoQnV0dG9uIGZyb20gJy4uLy4uL2J1dHRvbnMvUmVjdGFuZ3VsYXJQdXNoQnV0dG9uLmpzJztcbmltcG9ydCBDYXJvdXNlbCwgeyBDYXJvdXNlbEl0ZW0gfSBmcm9tICcuLi8uLi9DYXJvdXNlbC5qcyc7XG5cbmNvbnN0IEZPTlQgPSBuZXcgRm9udCggeyBzaXplOiAyMCB9ICk7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGRlbW9DYXJvdXNlbCggbGF5b3V0Qm91bmRzOiBCb3VuZHMyICk6IE5vZGUge1xuXG4gIC8vIGNyZWF0ZSBpdGVtc1xuICBjb25zdCBjb2xvcnMgPSBbICdyZWQnLCAnYmx1ZScsICdncmVlbicsICd5ZWxsb3cnLCAncGluaycsICd3aGl0ZScsICdvcmFuZ2UnLCAnbWFnZW50YScsICdwdXJwbGUnLCAncGluaycgXTtcbiAgY29uc3Qgdkl0ZW1zOiBDYXJvdXNlbEl0ZW1bXSA9IFtdO1xuICBjb25zdCBoSXRlbXM6IENhcm91c2VsSXRlbVtdID0gW107XG4gIGNvbG9ycy5mb3JFYWNoKCBjb2xvciA9PiB7XG4gICAgdkl0ZW1zLnB1c2goIHsgY3JlYXRlTm9kZTogKCkgPT4gbmV3IFJlY3RhbmdsZSggMCwgMCwgNjAsIDYwLCB7IGZpbGw6IGNvbG9yLCBzdHJva2U6ICdibGFjaycgfSApIH0gKTtcbiAgICBoSXRlbXMucHVzaCggeyBjcmVhdGVOb2RlOiAoKSA9PiBuZXcgQ2lyY2xlKCAzMCwgeyBmaWxsOiBjb2xvciwgc3Ryb2tlOiAnYmxhY2snIH0gKSB9ICk7XG4gIH0gKTtcblxuICAvLyB2ZXJ0aWNhbCBjYXJvdXNlbFxuICBjb25zdCB2Q2Fyb3VzZWwgPSBuZXcgQ2Fyb3VzZWwoIHZJdGVtcywge1xuICAgIG9yaWVudGF0aW9uOiAndmVydGljYWwnLFxuICAgIHNlcGFyYXRvcnNWaXNpYmxlOiB0cnVlLFxuICAgIGJ1dHRvbk9wdGlvbnM6IHtcbiAgICAgIHRvdWNoQXJlYVhEaWxhdGlvbjogNSxcbiAgICAgIHRvdWNoQXJlYVlEaWxhdGlvbjogMTUsXG4gICAgICBtb3VzZUFyZWFYRGlsYXRpb246IDIsXG4gICAgICBtb3VzZUFyZWFZRGlsYXRpb246IDdcbiAgICB9XG4gIH0gKTtcblxuICAvLyBob3Jpem9udGFsIGNhcm91c2VsXG4gIGNvbnN0IGhDYXJvdXNlbCA9IG5ldyBDYXJvdXNlbCggaEl0ZW1zLCB7XG4gICAgb3JpZW50YXRpb246ICdob3Jpem9udGFsJyxcbiAgICBzZXBhcmF0b3JzVmlzaWJsZTogdHJ1ZSxcbiAgICBidXR0b25PcHRpb25zOiB7XG4gICAgICB0b3VjaEFyZWFYRGlsYXRpb246IDE1LFxuICAgICAgdG91Y2hBcmVhWURpbGF0aW9uOiA1LFxuICAgICAgbW91c2VBcmVhWERpbGF0aW9uOiA3LFxuICAgICAgbW91c2VBcmVhWURpbGF0aW9uOiAyXG4gICAgfSxcbiAgICBjZW50ZXJYOiB2Q2Fyb3VzZWwuY2VudGVyWCxcbiAgICB0b3A6IHZDYXJvdXNlbC5ib3R0b20gKyA1MFxuICB9ICk7XG5cbiAgLy8gYnV0dG9uIHRoYXQgc2Nyb2xscyB0aGUgaG9yaXpvbnRhbCBjYXJvdXNlbCB0byBhIHNwZWNpZmljIGl0ZW1cbiAgY29uc3QgaXRlbUluZGV4ID0gNDtcbiAgY29uc3QgaFNjcm9sbFRvSXRlbUJ1dHRvbiA9IG5ldyBSZWN0YW5ndWxhclB1c2hCdXR0b24oIHtcbiAgICBjb250ZW50OiBuZXcgVGV4dCggYHNjcm9sbCB0byBpdGVtICR7aXRlbUluZGV4fWAsIHsgZm9udDogRk9OVCB9ICksXG4gICAgbGlzdGVuZXI6ICgpID0+IGhDYXJvdXNlbC5zY3JvbGxUb0l0ZW0oIGhJdGVtc1sgaXRlbUluZGV4IF0gKVxuICB9ICk7XG5cbiAgLy8gYnV0dG9uIHRoYXQgc2V0cyB0aGUgaG9yaXpvbnRhbCBjYXJvdXNlbCB0byBhIHNwZWNpZmljIHBhZ2UgbnVtYmVyXG4gIGNvbnN0IHBhZ2VOdW1iZXIgPSAwO1xuICBjb25zdCBoU2Nyb2xsVG9QYWdlQnV0dG9uID0gbmV3IFJlY3Rhbmd1bGFyUHVzaEJ1dHRvbigge1xuICAgIGNvbnRlbnQ6IG5ldyBUZXh0KCBgc2Nyb2xsIHRvIHBhZ2UgJHtwYWdlTnVtYmVyfWAsIHsgZm9udDogRk9OVCB9ICksXG4gICAgbGlzdGVuZXI6ICgpID0+IGhDYXJvdXNlbC5wYWdlTnVtYmVyUHJvcGVydHkuc2V0KCBwYWdlTnVtYmVyIClcbiAgfSApO1xuXG4gIC8vIGdyb3VwIHRoZSBidXR0b25zXG4gIGNvbnN0IGJ1dHRvbkdyb3VwID0gbmV3IFZCb3goIHtcbiAgICBjaGlsZHJlbjogWyBoU2Nyb2xsVG9JdGVtQnV0dG9uLCBoU2Nyb2xsVG9QYWdlQnV0dG9uIF0sXG4gICAgYWxpZ246ICdsZWZ0JyxcbiAgICBzcGFjaW5nOiA3LFxuICAgIGxlZnQ6IGhDYXJvdXNlbC5yaWdodCArIDMwLFxuICAgIGNlbnRlclk6IGhDYXJvdXNlbC5jZW50ZXJZXG4gIH0gKTtcblxuICByZXR1cm4gbmV3IE5vZGUoIHtcbiAgICBjaGlsZHJlbjogWyB2Q2Fyb3VzZWwsIGhDYXJvdXNlbCwgYnV0dG9uR3JvdXAgXSxcbiAgICBjZW50ZXI6IGxheW91dEJvdW5kcy5jZW50ZXJcbiAgfSApO1xufSJdLCJuYW1lcyI6WyJDaXJjbGUiLCJGb250IiwiTm9kZSIsIlJlY3RhbmdsZSIsIlRleHQiLCJWQm94IiwiUmVjdGFuZ3VsYXJQdXNoQnV0dG9uIiwiQ2Fyb3VzZWwiLCJGT05UIiwic2l6ZSIsImRlbW9DYXJvdXNlbCIsImxheW91dEJvdW5kcyIsImNvbG9ycyIsInZJdGVtcyIsImhJdGVtcyIsImZvckVhY2giLCJjb2xvciIsInB1c2giLCJjcmVhdGVOb2RlIiwiZmlsbCIsInN0cm9rZSIsInZDYXJvdXNlbCIsIm9yaWVudGF0aW9uIiwic2VwYXJhdG9yc1Zpc2libGUiLCJidXR0b25PcHRpb25zIiwidG91Y2hBcmVhWERpbGF0aW9uIiwidG91Y2hBcmVhWURpbGF0aW9uIiwibW91c2VBcmVhWERpbGF0aW9uIiwibW91c2VBcmVhWURpbGF0aW9uIiwiaENhcm91c2VsIiwiY2VudGVyWCIsInRvcCIsImJvdHRvbSIsIml0ZW1JbmRleCIsImhTY3JvbGxUb0l0ZW1CdXR0b24iLCJjb250ZW50IiwiZm9udCIsImxpc3RlbmVyIiwic2Nyb2xsVG9JdGVtIiwicGFnZU51bWJlciIsImhTY3JvbGxUb1BhZ2VCdXR0b24iLCJwYWdlTnVtYmVyUHJvcGVydHkiLCJzZXQiLCJidXR0b25Hcm91cCIsImNoaWxkcmVuIiwiYWxpZ24iLCJzcGFjaW5nIiwibGVmdCIsInJpZ2h0IiwiY2VudGVyWSIsImNlbnRlciJdLCJtYXBwaW5ncyI6IkFBQUEsc0RBQXNEO0FBRXREOzs7O0NBSUMsR0FHRCxTQUFTQSxNQUFNLEVBQUVDLElBQUksRUFBRUMsSUFBSSxFQUFFQyxTQUFTLEVBQUVDLElBQUksRUFBRUMsSUFBSSxRQUFRLG9DQUFvQztBQUM5RixPQUFPQywyQkFBMkIseUNBQXlDO0FBQzNFLE9BQU9DLGNBQWdDLG9CQUFvQjtBQUUzRCxNQUFNQyxPQUFPLElBQUlQLEtBQU07SUFBRVEsTUFBTTtBQUFHO0FBRWxDLGVBQWUsU0FBU0MsYUFBY0MsWUFBcUI7SUFFekQsZUFBZTtJQUNmLE1BQU1DLFNBQVM7UUFBRTtRQUFPO1FBQVE7UUFBUztRQUFVO1FBQVE7UUFBUztRQUFVO1FBQVc7UUFBVTtLQUFRO0lBQzNHLE1BQU1DLFNBQXlCLEVBQUU7SUFDakMsTUFBTUMsU0FBeUIsRUFBRTtJQUNqQ0YsT0FBT0csT0FBTyxDQUFFQyxDQUFBQTtRQUNkSCxPQUFPSSxJQUFJLENBQUU7WUFBRUMsWUFBWSxJQUFNLElBQUlmLFVBQVcsR0FBRyxHQUFHLElBQUksSUFBSTtvQkFBRWdCLE1BQU1IO29CQUFPSSxRQUFRO2dCQUFRO1FBQUk7UUFDakdOLE9BQU9HLElBQUksQ0FBRTtZQUFFQyxZQUFZLElBQU0sSUFBSWxCLE9BQVEsSUFBSTtvQkFBRW1CLE1BQU1IO29CQUFPSSxRQUFRO2dCQUFRO1FBQUk7SUFDdEY7SUFFQSxvQkFBb0I7SUFDcEIsTUFBTUMsWUFBWSxJQUFJZCxTQUFVTSxRQUFRO1FBQ3RDUyxhQUFhO1FBQ2JDLG1CQUFtQjtRQUNuQkMsZUFBZTtZQUNiQyxvQkFBb0I7WUFDcEJDLG9CQUFvQjtZQUNwQkMsb0JBQW9CO1lBQ3BCQyxvQkFBb0I7UUFDdEI7SUFDRjtJQUVBLHNCQUFzQjtJQUN0QixNQUFNQyxZQUFZLElBQUl0QixTQUFVTyxRQUFRO1FBQ3RDUSxhQUFhO1FBQ2JDLG1CQUFtQjtRQUNuQkMsZUFBZTtZQUNiQyxvQkFBb0I7WUFDcEJDLG9CQUFvQjtZQUNwQkMsb0JBQW9CO1lBQ3BCQyxvQkFBb0I7UUFDdEI7UUFDQUUsU0FBU1QsVUFBVVMsT0FBTztRQUMxQkMsS0FBS1YsVUFBVVcsTUFBTSxHQUFHO0lBQzFCO0lBRUEsaUVBQWlFO0lBQ2pFLE1BQU1DLFlBQVk7SUFDbEIsTUFBTUMsc0JBQXNCLElBQUk1QixzQkFBdUI7UUFDckQ2QixTQUFTLElBQUkvQixLQUFNLENBQUMsZUFBZSxFQUFFNkIsV0FBVyxFQUFFO1lBQUVHLE1BQU01QjtRQUFLO1FBQy9ENkIsVUFBVSxJQUFNUixVQUFVUyxZQUFZLENBQUV4QixNQUFNLENBQUVtQixVQUFXO0lBQzdEO0lBRUEscUVBQXFFO0lBQ3JFLE1BQU1NLGFBQWE7SUFDbkIsTUFBTUMsc0JBQXNCLElBQUlsQyxzQkFBdUI7UUFDckQ2QixTQUFTLElBQUkvQixLQUFNLENBQUMsZUFBZSxFQUFFbUMsWUFBWSxFQUFFO1lBQUVILE1BQU01QjtRQUFLO1FBQ2hFNkIsVUFBVSxJQUFNUixVQUFVWSxrQkFBa0IsQ0FBQ0MsR0FBRyxDQUFFSDtJQUNwRDtJQUVBLG9CQUFvQjtJQUNwQixNQUFNSSxjQUFjLElBQUl0QyxLQUFNO1FBQzVCdUMsVUFBVTtZQUFFVjtZQUFxQk07U0FBcUI7UUFDdERLLE9BQU87UUFDUEMsU0FBUztRQUNUQyxNQUFNbEIsVUFBVW1CLEtBQUssR0FBRztRQUN4QkMsU0FBU3BCLFVBQVVvQixPQUFPO0lBQzVCO0lBRUEsT0FBTyxJQUFJL0MsS0FBTTtRQUNmMEMsVUFBVTtZQUFFdkI7WUFBV1E7WUFBV2M7U0FBYTtRQUMvQ08sUUFBUXZDLGFBQWF1QyxNQUFNO0lBQzdCO0FBQ0YifQ==