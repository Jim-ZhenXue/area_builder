// Copyright 2014-2023, University of Colorado Boulder
/**
 * An accordion box that displays the area and perimeter of shape that may change dynamically.
 *
 * @author John Blanco
 */ import merge from '../../../../phet-core/js/merge.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { Node, Text } from '../../../../scenery/js/imports.js';
import AccordionBox from '../../../../sun/js/AccordionBox.js';
import areaBuilder from '../../areaBuilder.js';
import AreaBuilderStrings from '../../AreaBuilderStrings.js';
const areaString = AreaBuilderStrings.area;
const perimeterString = AreaBuilderStrings.perimeter;
const valuesString = AreaBuilderStrings.values;
// constants
const DISPLAY_FONT = new PhetFont(14);
const MAX_CONTENT_WIDTH = 200; // empirically determined, supports translation
const MAX_TITLE_WIDTH = 190; // empirically determined, supports translation
let AreaAndPerimeterDisplay = class AreaAndPerimeterDisplay extends AccordionBox {
    /**
   * @param {Property.<Object>} areaAndPerimeterProperty - An object containing values for area and perimeter
   * @param {Color} areaTextColor
   * @param {Color} perimeterTextColor
   * @param {Object} [options]
   */ constructor(areaAndPerimeterProperty, areaTextColor, perimeterTextColor, options){
        options = merge({
            maxWidth: Number.POSITIVE_INFINITY,
            cornerRadius: 3,
            titleNode: new Text(valuesString, {
                font: DISPLAY_FONT,
                maxWidth: MAX_TITLE_WIDTH
            }),
            titleAlignX: 'left',
            contentAlign: 'left',
            fill: 'white',
            showTitleWhenExpanded: false,
            contentXMargin: 8,
            contentYMargin: 4,
            expandCollapseButtonOptions: {
                touchAreaXDilation: 10,
                touchAreaYDilation: 10
            }
        }, options);
        const contentNode = new Node();
        const areaCaption = new Text(areaString, {
            font: DISPLAY_FONT
        });
        const perimeterCaption = new Text(perimeterString, {
            font: DISPLAY_FONT
        });
        const tempTwoDigitString = new Text('999', {
            font: DISPLAY_FONT
        });
        const areaReadout = new Text('', {
            font: DISPLAY_FONT,
            fill: areaTextColor
        });
        const perimeterReadout = new Text('', {
            font: DISPLAY_FONT,
            fill: perimeterTextColor
        });
        contentNode.addChild(areaCaption);
        perimeterCaption.left = areaCaption.left;
        perimeterCaption.top = areaCaption.bottom + 5;
        contentNode.addChild(perimeterCaption);
        contentNode.addChild(areaReadout);
        contentNode.addChild(perimeterReadout);
        const readoutsRightEdge = Math.max(perimeterCaption.right, areaCaption.right) + 8 + tempTwoDigitString.width;
        areaAndPerimeterProperty.link((areaAndPerimeter)=>{
            areaReadout.string = areaAndPerimeter.area;
            areaReadout.bottom = areaCaption.bottom;
            areaReadout.right = readoutsRightEdge;
            perimeterReadout.string = areaAndPerimeter.perimeter;
            perimeterReadout.bottom = perimeterCaption.bottom;
            perimeterReadout.right = readoutsRightEdge;
        });
        // in support of translation, scale the content node if it's too big
        if (contentNode.width > MAX_CONTENT_WIDTH) {
            contentNode.scale(MAX_CONTENT_WIDTH / contentNode.width);
        }
        super(contentNode, options);
    }
};
areaBuilder.register('AreaAndPerimeterDisplay', AreaAndPerimeterDisplay);
export default AreaAndPerimeterDisplay;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL2FyZWEtYnVpbGRlci9qcy9leHBsb3JlL3ZpZXcvQXJlYUFuZFBlcmltZXRlckRpc3BsYXkuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTQtMjAyMywgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbi8qKlxuICogQW4gYWNjb3JkaW9uIGJveCB0aGF0IGRpc3BsYXlzIHRoZSBhcmVhIGFuZCBwZXJpbWV0ZXIgb2Ygc2hhcGUgdGhhdCBtYXkgY2hhbmdlIGR5bmFtaWNhbGx5LlxuICpcbiAqIEBhdXRob3IgSm9obiBCbGFuY29cbiAqL1xuXG5pbXBvcnQgbWVyZ2UgZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL21lcmdlLmpzJztcbmltcG9ydCBQaGV0Rm9udCBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5LXBoZXQvanMvUGhldEZvbnQuanMnO1xuaW1wb3J0IHsgTm9kZSwgVGV4dCB9IGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XG5pbXBvcnQgQWNjb3JkaW9uQm94IGZyb20gJy4uLy4uLy4uLy4uL3N1bi9qcy9BY2NvcmRpb25Cb3guanMnO1xuaW1wb3J0IGFyZWFCdWlsZGVyIGZyb20gJy4uLy4uL2FyZWFCdWlsZGVyLmpzJztcbmltcG9ydCBBcmVhQnVpbGRlclN0cmluZ3MgZnJvbSAnLi4vLi4vQXJlYUJ1aWxkZXJTdHJpbmdzLmpzJztcblxuY29uc3QgYXJlYVN0cmluZyA9IEFyZWFCdWlsZGVyU3RyaW5ncy5hcmVhO1xuY29uc3QgcGVyaW1ldGVyU3RyaW5nID0gQXJlYUJ1aWxkZXJTdHJpbmdzLnBlcmltZXRlcjtcbmNvbnN0IHZhbHVlc1N0cmluZyA9IEFyZWFCdWlsZGVyU3RyaW5ncy52YWx1ZXM7XG5cbi8vIGNvbnN0YW50c1xuY29uc3QgRElTUExBWV9GT05UID0gbmV3IFBoZXRGb250KCAxNCApO1xuY29uc3QgTUFYX0NPTlRFTlRfV0lEVEggPSAyMDA7IC8vIGVtcGlyaWNhbGx5IGRldGVybWluZWQsIHN1cHBvcnRzIHRyYW5zbGF0aW9uXG5jb25zdCBNQVhfVElUTEVfV0lEVEggPSAxOTA7IC8vIGVtcGlyaWNhbGx5IGRldGVybWluZWQsIHN1cHBvcnRzIHRyYW5zbGF0aW9uXG5cbmNsYXNzIEFyZWFBbmRQZXJpbWV0ZXJEaXNwbGF5IGV4dGVuZHMgQWNjb3JkaW9uQm94IHtcblxuICAvKipcbiAgICogQHBhcmFtIHtQcm9wZXJ0eS48T2JqZWN0Pn0gYXJlYUFuZFBlcmltZXRlclByb3BlcnR5IC0gQW4gb2JqZWN0IGNvbnRhaW5pbmcgdmFsdWVzIGZvciBhcmVhIGFuZCBwZXJpbWV0ZXJcbiAgICogQHBhcmFtIHtDb2xvcn0gYXJlYVRleHRDb2xvclxuICAgKiBAcGFyYW0ge0NvbG9yfSBwZXJpbWV0ZXJUZXh0Q29sb3JcbiAgICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zXVxuICAgKi9cbiAgY29uc3RydWN0b3IoIGFyZWFBbmRQZXJpbWV0ZXJQcm9wZXJ0eSwgYXJlYVRleHRDb2xvciwgcGVyaW1ldGVyVGV4dENvbG9yLCBvcHRpb25zICkge1xuXG4gICAgb3B0aW9ucyA9IG1lcmdlKCB7XG4gICAgICBtYXhXaWR0aDogTnVtYmVyLlBPU0lUSVZFX0lORklOSVRZLFxuICAgICAgY29ybmVyUmFkaXVzOiAzLFxuICAgICAgdGl0bGVOb2RlOiBuZXcgVGV4dCggdmFsdWVzU3RyaW5nLCB7IGZvbnQ6IERJU1BMQVlfRk9OVCwgbWF4V2lkdGg6IE1BWF9USVRMRV9XSURUSCB9ICksXG4gICAgICB0aXRsZUFsaWduWDogJ2xlZnQnLFxuICAgICAgY29udGVudEFsaWduOiAnbGVmdCcsXG4gICAgICBmaWxsOiAnd2hpdGUnLFxuICAgICAgc2hvd1RpdGxlV2hlbkV4cGFuZGVkOiBmYWxzZSxcbiAgICAgIGNvbnRlbnRYTWFyZ2luOiA4LFxuICAgICAgY29udGVudFlNYXJnaW46IDQsXG4gICAgICBleHBhbmRDb2xsYXBzZUJ1dHRvbk9wdGlvbnM6IHtcbiAgICAgICAgdG91Y2hBcmVhWERpbGF0aW9uOiAxMCxcbiAgICAgICAgdG91Y2hBcmVhWURpbGF0aW9uOiAxMFxuICAgICAgfVxuICAgIH0sIG9wdGlvbnMgKTtcblxuICAgIGNvbnN0IGNvbnRlbnROb2RlID0gbmV3IE5vZGUoKTtcbiAgICBjb25zdCBhcmVhQ2FwdGlvbiA9IG5ldyBUZXh0KCBhcmVhU3RyaW5nLCB7IGZvbnQ6IERJU1BMQVlfRk9OVCB9ICk7XG4gICAgY29uc3QgcGVyaW1ldGVyQ2FwdGlvbiA9IG5ldyBUZXh0KCBwZXJpbWV0ZXJTdHJpbmcsIHsgZm9udDogRElTUExBWV9GT05UIH0gKTtcbiAgICBjb25zdCB0ZW1wVHdvRGlnaXRTdHJpbmcgPSBuZXcgVGV4dCggJzk5OScsIHsgZm9udDogRElTUExBWV9GT05UIH0gKTtcbiAgICBjb25zdCBhcmVhUmVhZG91dCA9IG5ldyBUZXh0KCAnJywgeyBmb250OiBESVNQTEFZX0ZPTlQsIGZpbGw6IGFyZWFUZXh0Q29sb3IgfSApO1xuICAgIGNvbnN0IHBlcmltZXRlclJlYWRvdXQgPSBuZXcgVGV4dCggJycsIHsgZm9udDogRElTUExBWV9GT05ULCBmaWxsOiBwZXJpbWV0ZXJUZXh0Q29sb3IgfSApO1xuXG4gICAgY29udGVudE5vZGUuYWRkQ2hpbGQoIGFyZWFDYXB0aW9uICk7XG4gICAgcGVyaW1ldGVyQ2FwdGlvbi5sZWZ0ID0gYXJlYUNhcHRpb24ubGVmdDtcbiAgICBwZXJpbWV0ZXJDYXB0aW9uLnRvcCA9IGFyZWFDYXB0aW9uLmJvdHRvbSArIDU7XG4gICAgY29udGVudE5vZGUuYWRkQ2hpbGQoIHBlcmltZXRlckNhcHRpb24gKTtcbiAgICBjb250ZW50Tm9kZS5hZGRDaGlsZCggYXJlYVJlYWRvdXQgKTtcbiAgICBjb250ZW50Tm9kZS5hZGRDaGlsZCggcGVyaW1ldGVyUmVhZG91dCApO1xuICAgIGNvbnN0IHJlYWRvdXRzUmlnaHRFZGdlID0gTWF0aC5tYXgoIHBlcmltZXRlckNhcHRpb24ucmlnaHQsIGFyZWFDYXB0aW9uLnJpZ2h0ICkgKyA4ICsgdGVtcFR3b0RpZ2l0U3RyaW5nLndpZHRoO1xuXG4gICAgYXJlYUFuZFBlcmltZXRlclByb3BlcnR5LmxpbmsoIGFyZWFBbmRQZXJpbWV0ZXIgPT4ge1xuICAgICAgYXJlYVJlYWRvdXQuc3RyaW5nID0gYXJlYUFuZFBlcmltZXRlci5hcmVhO1xuICAgICAgYXJlYVJlYWRvdXQuYm90dG9tID0gYXJlYUNhcHRpb24uYm90dG9tO1xuICAgICAgYXJlYVJlYWRvdXQucmlnaHQgPSByZWFkb3V0c1JpZ2h0RWRnZTtcbiAgICAgIHBlcmltZXRlclJlYWRvdXQuc3RyaW5nID0gYXJlYUFuZFBlcmltZXRlci5wZXJpbWV0ZXI7XG4gICAgICBwZXJpbWV0ZXJSZWFkb3V0LmJvdHRvbSA9IHBlcmltZXRlckNhcHRpb24uYm90dG9tO1xuICAgICAgcGVyaW1ldGVyUmVhZG91dC5yaWdodCA9IHJlYWRvdXRzUmlnaHRFZGdlO1xuICAgIH0gKTtcblxuICAgIC8vIGluIHN1cHBvcnQgb2YgdHJhbnNsYXRpb24sIHNjYWxlIHRoZSBjb250ZW50IG5vZGUgaWYgaXQncyB0b28gYmlnXG4gICAgaWYgKCBjb250ZW50Tm9kZS53aWR0aCA+IE1BWF9DT05URU5UX1dJRFRIICkge1xuICAgICAgY29udGVudE5vZGUuc2NhbGUoIE1BWF9DT05URU5UX1dJRFRIIC8gY29udGVudE5vZGUud2lkdGggKTtcbiAgICB9XG5cbiAgICBzdXBlciggY29udGVudE5vZGUsIG9wdGlvbnMgKTtcbiAgfVxufVxuXG5hcmVhQnVpbGRlci5yZWdpc3RlciggJ0FyZWFBbmRQZXJpbWV0ZXJEaXNwbGF5JywgQXJlYUFuZFBlcmltZXRlckRpc3BsYXkgKTtcbmV4cG9ydCBkZWZhdWx0IEFyZWFBbmRQZXJpbWV0ZXJEaXNwbGF5OyJdLCJuYW1lcyI6WyJtZXJnZSIsIlBoZXRGb250IiwiTm9kZSIsIlRleHQiLCJBY2NvcmRpb25Cb3giLCJhcmVhQnVpbGRlciIsIkFyZWFCdWlsZGVyU3RyaW5ncyIsImFyZWFTdHJpbmciLCJhcmVhIiwicGVyaW1ldGVyU3RyaW5nIiwicGVyaW1ldGVyIiwidmFsdWVzU3RyaW5nIiwidmFsdWVzIiwiRElTUExBWV9GT05UIiwiTUFYX0NPTlRFTlRfV0lEVEgiLCJNQVhfVElUTEVfV0lEVEgiLCJBcmVhQW5kUGVyaW1ldGVyRGlzcGxheSIsImNvbnN0cnVjdG9yIiwiYXJlYUFuZFBlcmltZXRlclByb3BlcnR5IiwiYXJlYVRleHRDb2xvciIsInBlcmltZXRlclRleHRDb2xvciIsIm9wdGlvbnMiLCJtYXhXaWR0aCIsIk51bWJlciIsIlBPU0lUSVZFX0lORklOSVRZIiwiY29ybmVyUmFkaXVzIiwidGl0bGVOb2RlIiwiZm9udCIsInRpdGxlQWxpZ25YIiwiY29udGVudEFsaWduIiwiZmlsbCIsInNob3dUaXRsZVdoZW5FeHBhbmRlZCIsImNvbnRlbnRYTWFyZ2luIiwiY29udGVudFlNYXJnaW4iLCJleHBhbmRDb2xsYXBzZUJ1dHRvbk9wdGlvbnMiLCJ0b3VjaEFyZWFYRGlsYXRpb24iLCJ0b3VjaEFyZWFZRGlsYXRpb24iLCJjb250ZW50Tm9kZSIsImFyZWFDYXB0aW9uIiwicGVyaW1ldGVyQ2FwdGlvbiIsInRlbXBUd29EaWdpdFN0cmluZyIsImFyZWFSZWFkb3V0IiwicGVyaW1ldGVyUmVhZG91dCIsImFkZENoaWxkIiwibGVmdCIsInRvcCIsImJvdHRvbSIsInJlYWRvdXRzUmlnaHRFZGdlIiwiTWF0aCIsIm1heCIsInJpZ2h0Iiwid2lkdGgiLCJsaW5rIiwiYXJlYUFuZFBlcmltZXRlciIsInN0cmluZyIsInNjYWxlIiwicmVnaXN0ZXIiXSwibWFwcGluZ3MiOiJBQUFBLHNEQUFzRDtBQUV0RDs7OztDQUlDLEdBRUQsT0FBT0EsV0FBVyxvQ0FBb0M7QUFDdEQsT0FBT0MsY0FBYywwQ0FBMEM7QUFDL0QsU0FBU0MsSUFBSSxFQUFFQyxJQUFJLFFBQVEsb0NBQW9DO0FBQy9ELE9BQU9DLGtCQUFrQixxQ0FBcUM7QUFDOUQsT0FBT0MsaUJBQWlCLHVCQUF1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