// Copyright 2024, University of Colorado Boulder
/**
 * Creates a double-headed, dashed arrow used to cue sorting in the "group sort" interaction.
 *
 * @author Marla Schulz (PhET Interactive Simulations)
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */ import optionize, { combineOptions } from '../../../../../phet-core/js/optionize.js';
import { HBox, Rectangle } from '../../../../../scenery/js/imports.js';
import sceneryPhet from '../../../sceneryPhet.js';
import TriangleNode from '../../../TriangleNode.js';
let SortCueArrowNode = class SortCueArrowNode extends HBox {
    constructor(providedOptions){
        const options = optionize()({
            dashHeight: 2,
            dashWidth: 2,
            triangleNodeOptions: {},
            isDisposable: false
        }, providedOptions);
        const createArrowHead = (pointDirection)=>{
            const triangleNodeOptions = combineOptions({
                pointDirection: pointDirection,
                triangleWidth: 6,
                triangleHeight: 5,
                fill: 'black'
            }, options.triangleNodeOptions);
            return new TriangleNode(triangleNodeOptions);
        };
        const dashes = [];
        _.times(options.numberOfDashes, ()=>{
            dashes.push(new Rectangle(0, 0, options.dashWidth, options.dashHeight, {
                fill: 'black'
            }));
        });
        const superOptions = combineOptions({
            children: [
                ...options.doubleHead ? [
                    createArrowHead('left')
                ] : [],
                ...dashes,
                createArrowHead('right')
            ],
            spacing: 2
        }, providedOptions);
        super(superOptions);
    }
};
export { SortCueArrowNode as default };
sceneryPhet.register('SortCueArrowNode', SortCueArrowNode);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9hY2Nlc3NpYmlsaXR5L2dyb3VwLXNvcnQvdmlldy9Tb3J0Q3VlQXJyb3dOb2RlLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDI0LCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuLyoqXG4gKiBDcmVhdGVzIGEgZG91YmxlLWhlYWRlZCwgZGFzaGVkIGFycm93IHVzZWQgdG8gY3VlIHNvcnRpbmcgaW4gdGhlIFwiZ3JvdXAgc29ydFwiIGludGVyYWN0aW9uLlxuICpcbiAqIEBhdXRob3IgTWFybGEgU2NodWx6IChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxuICogQGF1dGhvciBNaWNoYWVsIEthdXptYW5uIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxuICovXG5cbmltcG9ydCBvcHRpb25pemUsIHsgY29tYmluZU9wdGlvbnMgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvb3B0aW9uaXplLmpzJztcbmltcG9ydCBTdHJpY3RPbWl0IGZyb20gJy4uLy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy90eXBlcy9TdHJpY3RPbWl0LmpzJztcbmltcG9ydCB7IEhCb3gsIEhCb3hPcHRpb25zLCBOb2RlLCBSZWN0YW5nbGUgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xuaW1wb3J0IHNjZW5lcnlQaGV0IGZyb20gJy4uLy4uLy4uL3NjZW5lcnlQaGV0LmpzJztcbmltcG9ydCBUcmlhbmdsZU5vZGUsIHsgVHJpYW5nbGVOb2RlT3B0aW9ucyB9IGZyb20gJy4uLy4uLy4uL1RyaWFuZ2xlTm9kZS5qcyc7XG5cbnR5cGUgU2VsZk9wdGlvbnMgPSB7XG4gIG51bWJlck9mRGFzaGVzOiBudW1iZXI7XG4gIGRvdWJsZUhlYWQ6IGJvb2xlYW47XG4gIGRhc2hIZWlnaHQ/OiBudW1iZXI7XG4gIGRhc2hXaWR0aD86IG51bWJlcjtcbiAgdHJpYW5nbGVOb2RlT3B0aW9ucz86IFRyaWFuZ2xlTm9kZU9wdGlvbnM7XG59O1xuXG50eXBlIFNvcnRDdWVBcnJvd05vZGVPcHRpb25zID0gU2VsZk9wdGlvbnMgJiBTdHJpY3RPbWl0PEhCb3hPcHRpb25zLCAnY2hpbGRyZW4nPjtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgU29ydEN1ZUFycm93Tm9kZSBleHRlbmRzIEhCb3gge1xuXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggcHJvdmlkZWRPcHRpb25zOiBTb3J0Q3VlQXJyb3dOb2RlT3B0aW9ucyApIHtcblxuICAgIGNvbnN0IG9wdGlvbnMgPSBvcHRpb25pemU8U29ydEN1ZUFycm93Tm9kZU9wdGlvbnMsIFNlbGZPcHRpb25zLCBIQm94T3B0aW9ucz4oKSgge1xuICAgICAgZGFzaEhlaWdodDogMixcbiAgICAgIGRhc2hXaWR0aDogMixcbiAgICAgIHRyaWFuZ2xlTm9kZU9wdGlvbnM6IHt9LFxuXG4gICAgICBpc0Rpc3Bvc2FibGU6IGZhbHNlXG4gICAgfSwgcHJvdmlkZWRPcHRpb25zICk7XG5cbiAgICBjb25zdCBjcmVhdGVBcnJvd0hlYWQgPSAoIHBvaW50RGlyZWN0aW9uOiAncmlnaHQnIHwgJ2xlZnQnICkgPT4ge1xuXG4gICAgICBjb25zdCB0cmlhbmdsZU5vZGVPcHRpb25zID0gY29tYmluZU9wdGlvbnM8VHJpYW5nbGVOb2RlT3B0aW9ucz4oIHtcbiAgICAgICAgcG9pbnREaXJlY3Rpb246IHBvaW50RGlyZWN0aW9uLFxuICAgICAgICB0cmlhbmdsZVdpZHRoOiA2LFxuICAgICAgICB0cmlhbmdsZUhlaWdodDogNSxcbiAgICAgICAgZmlsbDogJ2JsYWNrJ1xuICAgICAgfSwgb3B0aW9ucy50cmlhbmdsZU5vZGVPcHRpb25zICk7XG5cbiAgICAgIHJldHVybiBuZXcgVHJpYW5nbGVOb2RlKCB0cmlhbmdsZU5vZGVPcHRpb25zICk7XG4gICAgfTtcblxuICAgIGNvbnN0IGRhc2hlczogTm9kZVtdID0gW107XG5cbiAgICBfLnRpbWVzKCBvcHRpb25zLm51bWJlck9mRGFzaGVzLCAoKSA9PiB7XG4gICAgICBkYXNoZXMucHVzaCggbmV3IFJlY3RhbmdsZSggMCwgMCwgb3B0aW9ucy5kYXNoV2lkdGgsIG9wdGlvbnMuZGFzaEhlaWdodCwgeyBmaWxsOiAnYmxhY2snIH0gKSApO1xuICAgIH0gKTtcblxuICAgIGNvbnN0IHN1cGVyT3B0aW9ucyA9IGNvbWJpbmVPcHRpb25zPEhCb3hPcHRpb25zPigge1xuICAgICAgY2hpbGRyZW46IFtcbiAgICAgICAgLi4uKCBvcHRpb25zLmRvdWJsZUhlYWQgPyBbIGNyZWF0ZUFycm93SGVhZCggJ2xlZnQnICkgXSA6IFtdICksXG4gICAgICAgIC4uLmRhc2hlcyxcbiAgICAgICAgY3JlYXRlQXJyb3dIZWFkKCAncmlnaHQnIClcbiAgICAgIF0sXG4gICAgICBzcGFjaW5nOiAyXG4gICAgfSwgcHJvdmlkZWRPcHRpb25zICk7XG5cbiAgICBzdXBlciggc3VwZXJPcHRpb25zICk7XG4gIH1cbn1cblxuc2NlbmVyeVBoZXQucmVnaXN0ZXIoICdTb3J0Q3VlQXJyb3dOb2RlJywgU29ydEN1ZUFycm93Tm9kZSApOyJdLCJuYW1lcyI6WyJvcHRpb25pemUiLCJjb21iaW5lT3B0aW9ucyIsIkhCb3giLCJSZWN0YW5nbGUiLCJzY2VuZXJ5UGhldCIsIlRyaWFuZ2xlTm9kZSIsIlNvcnRDdWVBcnJvd05vZGUiLCJwcm92aWRlZE9wdGlvbnMiLCJvcHRpb25zIiwiZGFzaEhlaWdodCIsImRhc2hXaWR0aCIsInRyaWFuZ2xlTm9kZU9wdGlvbnMiLCJpc0Rpc3Bvc2FibGUiLCJjcmVhdGVBcnJvd0hlYWQiLCJwb2ludERpcmVjdGlvbiIsInRyaWFuZ2xlV2lkdGgiLCJ0cmlhbmdsZUhlaWdodCIsImZpbGwiLCJkYXNoZXMiLCJfIiwidGltZXMiLCJudW1iZXJPZkRhc2hlcyIsInB1c2giLCJzdXBlck9wdGlvbnMiLCJjaGlsZHJlbiIsImRvdWJsZUhlYWQiLCJzcGFjaW5nIiwicmVnaXN0ZXIiXSwibWFwcGluZ3MiOiJBQUFBLGlEQUFpRDtBQUVqRDs7Ozs7Q0FLQyxHQUVELE9BQU9BLGFBQWFDLGNBQWMsUUFBUSwyQ0FBMkM7QUFFckYsU0FBU0MsSUFBSSxFQUFxQkMsU0FBUyxRQUFRLHVDQUF1QztBQUMxRixPQUFPQyxpQkFBaUIsMEJBQTBCO0FBQ2xELE9BQU9DLGtCQUEyQywyQkFBMkI7QUFZOUQsSUFBQSxBQUFNQyxtQkFBTixNQUFNQSx5QkFBeUJKO0lBRTVDLFlBQW9CSyxlQUF3QyxDQUFHO1FBRTdELE1BQU1DLFVBQVVSLFlBQWdFO1lBQzlFUyxZQUFZO1lBQ1pDLFdBQVc7WUFDWEMscUJBQXFCLENBQUM7WUFFdEJDLGNBQWM7UUFDaEIsR0FBR0w7UUFFSCxNQUFNTSxrQkFBa0IsQ0FBRUM7WUFFeEIsTUFBTUgsc0JBQXNCVixlQUFxQztnQkFDL0RhLGdCQUFnQkE7Z0JBQ2hCQyxlQUFlO2dCQUNmQyxnQkFBZ0I7Z0JBQ2hCQyxNQUFNO1lBQ1IsR0FBR1QsUUFBUUcsbUJBQW1CO1lBRTlCLE9BQU8sSUFBSU4sYUFBY007UUFDM0I7UUFFQSxNQUFNTyxTQUFpQixFQUFFO1FBRXpCQyxFQUFFQyxLQUFLLENBQUVaLFFBQVFhLGNBQWMsRUFBRTtZQUMvQkgsT0FBT0ksSUFBSSxDQUFFLElBQUluQixVQUFXLEdBQUcsR0FBR0ssUUFBUUUsU0FBUyxFQUFFRixRQUFRQyxVQUFVLEVBQUU7Z0JBQUVRLE1BQU07WUFBUTtRQUMzRjtRQUVBLE1BQU1NLGVBQWV0QixlQUE2QjtZQUNoRHVCLFVBQVU7bUJBQ0hoQixRQUFRaUIsVUFBVSxHQUFHO29CQUFFWixnQkFBaUI7aUJBQVUsR0FBRyxFQUFFO21CQUN6REs7Z0JBQ0hMLGdCQUFpQjthQUNsQjtZQUNEYSxTQUFTO1FBQ1gsR0FBR25CO1FBRUgsS0FBSyxDQUFFZ0I7SUFDVDtBQUNGO0FBekNBLFNBQXFCakIsOEJBeUNwQjtBQUVERixZQUFZdUIsUUFBUSxDQUFFLG9CQUFvQnJCIn0=