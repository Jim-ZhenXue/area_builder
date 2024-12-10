// Copyright 2022-2024, University of Colorado Boulder
/**
 * Demo for PageControl
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */ import { Node, Rectangle } from '../../../../scenery/js/imports.js';
import Carousel from '../../Carousel.js';
import PageControl from '../../PageControl.js';
export default function demoPageControl(layoutBounds) {
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
    const items = [];
    colors.forEach((color)=>{
        items.push({
            createNode: ()=>new Rectangle(0, 0, 100, 100, {
                    fill: color,
                    stroke: 'black'
                })
        });
    });
    // carousel
    const carousel = new Carousel(items, {
        orientation: 'horizontal',
        itemsPerPage: 3
    });
    // page control
    const pageControl = new PageControl(carousel.pageNumberProperty, carousel.numberOfPagesProperty, {
        orientation: 'horizontal',
        interactive: true,
        dotRadius: 10,
        dotSpacing: 18,
        dotTouchAreaDilation: 8,
        dotMouseAreaDilation: 4,
        currentPageFill: 'white',
        currentPageStroke: 'black',
        centerX: carousel.centerX,
        top: carousel.bottom + 10
    });
    return new Node({
        children: [
            carousel,
            pageControl
        ],
        center: layoutBounds.center
    });
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3N1bi9qcy9kZW1vL2NvbXBvbmVudHMvZGVtb1BhZ2VDb250cm9sLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDIyLTIwMjQsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIERlbW8gZm9yIFBhZ2VDb250cm9sXG4gKlxuICogQGF1dGhvciBDaHJpcyBNYWxsZXkgKFBpeGVsWm9vbSwgSW5jLilcbiAqL1xuXG5pbXBvcnQgQm91bmRzMiBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvQm91bmRzMi5qcyc7XG5pbXBvcnQgeyBOb2RlLCBSZWN0YW5nbGUgfSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xuaW1wb3J0IENhcm91c2VsLCB7IENhcm91c2VsSXRlbSB9IGZyb20gJy4uLy4uL0Nhcm91c2VsLmpzJztcbmltcG9ydCBQYWdlQ29udHJvbCBmcm9tICcuLi8uLi9QYWdlQ29udHJvbC5qcyc7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGRlbW9QYWdlQ29udHJvbCggbGF5b3V0Qm91bmRzOiBCb3VuZHMyICk6IE5vZGUge1xuXG4gIC8vIGNyZWF0ZSBpdGVtc1xuICBjb25zdCBjb2xvcnMgPSBbICdyZWQnLCAnYmx1ZScsICdncmVlbicsICd5ZWxsb3cnLCAncGluaycsICd3aGl0ZScsICdvcmFuZ2UnLCAnbWFnZW50YScsICdwdXJwbGUnLCAncGluaycgXTtcbiAgY29uc3QgaXRlbXM6IENhcm91c2VsSXRlbVtdID0gW107XG4gIGNvbG9ycy5mb3JFYWNoKCBjb2xvciA9PiB7XG4gICAgaXRlbXMucHVzaCgge1xuICAgICAgY3JlYXRlTm9kZTogKCkgPT4gbmV3IFJlY3RhbmdsZSggMCwgMCwgMTAwLCAxMDAsIHsgZmlsbDogY29sb3IsIHN0cm9rZTogJ2JsYWNrJyB9IClcbiAgICB9ICk7XG4gIH0gKTtcblxuICAvLyBjYXJvdXNlbFxuICBjb25zdCBjYXJvdXNlbCA9IG5ldyBDYXJvdXNlbCggaXRlbXMsIHtcbiAgICBvcmllbnRhdGlvbjogJ2hvcml6b250YWwnLFxuICAgIGl0ZW1zUGVyUGFnZTogM1xuICB9ICk7XG5cbiAgLy8gcGFnZSBjb250cm9sXG4gIGNvbnN0IHBhZ2VDb250cm9sID0gbmV3IFBhZ2VDb250cm9sKCBjYXJvdXNlbC5wYWdlTnVtYmVyUHJvcGVydHksIGNhcm91c2VsLm51bWJlck9mUGFnZXNQcm9wZXJ0eSwge1xuICAgIG9yaWVudGF0aW9uOiAnaG9yaXpvbnRhbCcsXG4gICAgaW50ZXJhY3RpdmU6IHRydWUsXG4gICAgZG90UmFkaXVzOiAxMCxcbiAgICBkb3RTcGFjaW5nOiAxOCxcbiAgICBkb3RUb3VjaEFyZWFEaWxhdGlvbjogOCxcbiAgICBkb3RNb3VzZUFyZWFEaWxhdGlvbjogNCxcbiAgICBjdXJyZW50UGFnZUZpbGw6ICd3aGl0ZScsXG4gICAgY3VycmVudFBhZ2VTdHJva2U6ICdibGFjaycsXG4gICAgY2VudGVyWDogY2Fyb3VzZWwuY2VudGVyWCxcbiAgICB0b3A6IGNhcm91c2VsLmJvdHRvbSArIDEwXG4gIH0gKTtcblxuICByZXR1cm4gbmV3IE5vZGUoIHtcbiAgICBjaGlsZHJlbjogWyBjYXJvdXNlbCwgcGFnZUNvbnRyb2wgXSxcbiAgICBjZW50ZXI6IGxheW91dEJvdW5kcy5jZW50ZXJcbiAgfSApO1xufSJdLCJuYW1lcyI6WyJOb2RlIiwiUmVjdGFuZ2xlIiwiQ2Fyb3VzZWwiLCJQYWdlQ29udHJvbCIsImRlbW9QYWdlQ29udHJvbCIsImxheW91dEJvdW5kcyIsImNvbG9ycyIsIml0ZW1zIiwiZm9yRWFjaCIsImNvbG9yIiwicHVzaCIsImNyZWF0ZU5vZGUiLCJmaWxsIiwic3Ryb2tlIiwiY2Fyb3VzZWwiLCJvcmllbnRhdGlvbiIsIml0ZW1zUGVyUGFnZSIsInBhZ2VDb250cm9sIiwicGFnZU51bWJlclByb3BlcnR5IiwibnVtYmVyT2ZQYWdlc1Byb3BlcnR5IiwiaW50ZXJhY3RpdmUiLCJkb3RSYWRpdXMiLCJkb3RTcGFjaW5nIiwiZG90VG91Y2hBcmVhRGlsYXRpb24iLCJkb3RNb3VzZUFyZWFEaWxhdGlvbiIsImN1cnJlbnRQYWdlRmlsbCIsImN1cnJlbnRQYWdlU3Ryb2tlIiwiY2VudGVyWCIsInRvcCIsImJvdHRvbSIsImNoaWxkcmVuIiwiY2VudGVyIl0sIm1hcHBpbmdzIjoiQUFBQSxzREFBc0Q7QUFFdEQ7Ozs7Q0FJQyxHQUdELFNBQVNBLElBQUksRUFBRUMsU0FBUyxRQUFRLG9DQUFvQztBQUNwRSxPQUFPQyxjQUFnQyxvQkFBb0I7QUFDM0QsT0FBT0MsaUJBQWlCLHVCQUF1QjtBQUUvQyxlQUFlLFNBQVNDLGdCQUFpQkMsWUFBcUI7SUFFNUQsZUFBZTtJQUNmLE1BQU1DLFNBQVM7UUFBRTtRQUFPO1FBQVE7UUFBUztRQUFVO1FBQVE7UUFBUztRQUFVO1FBQVc7UUFBVTtLQUFRO0lBQzNHLE1BQU1DLFFBQXdCLEVBQUU7SUFDaENELE9BQU9FLE9BQU8sQ0FBRUMsQ0FBQUE7UUFDZEYsTUFBTUcsSUFBSSxDQUFFO1lBQ1ZDLFlBQVksSUFBTSxJQUFJVixVQUFXLEdBQUcsR0FBRyxLQUFLLEtBQUs7b0JBQUVXLE1BQU1IO29CQUFPSSxRQUFRO2dCQUFRO1FBQ2xGO0lBQ0Y7SUFFQSxXQUFXO0lBQ1gsTUFBTUMsV0FBVyxJQUFJWixTQUFVSyxPQUFPO1FBQ3BDUSxhQUFhO1FBQ2JDLGNBQWM7SUFDaEI7SUFFQSxlQUFlO0lBQ2YsTUFBTUMsY0FBYyxJQUFJZCxZQUFhVyxTQUFTSSxrQkFBa0IsRUFBRUosU0FBU0sscUJBQXFCLEVBQUU7UUFDaEdKLGFBQWE7UUFDYkssYUFBYTtRQUNiQyxXQUFXO1FBQ1hDLFlBQVk7UUFDWkMsc0JBQXNCO1FBQ3RCQyxzQkFBc0I7UUFDdEJDLGlCQUFpQjtRQUNqQkMsbUJBQW1CO1FBQ25CQyxTQUFTYixTQUFTYSxPQUFPO1FBQ3pCQyxLQUFLZCxTQUFTZSxNQUFNLEdBQUc7SUFDekI7SUFFQSxPQUFPLElBQUk3QixLQUFNO1FBQ2Y4QixVQUFVO1lBQUVoQjtZQUFVRztTQUFhO1FBQ25DYyxRQUFRMUIsYUFBYTBCLE1BQU07SUFDN0I7QUFDRiJ9