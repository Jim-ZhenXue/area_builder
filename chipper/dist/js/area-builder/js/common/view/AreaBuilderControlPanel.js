// Copyright 2014-2022, University of Colorado Boulder
/**
 * Panel that contains controls for turning various tools on and off for the Area Builder game. It is dynamic in the
 * sense that different elements of the panel come and go.
 *
 * @author John Blanco
 */ import Property from '../../../../axon/js/Property.js';
import Bounds2 from '../../../../dot/js/Bounds2.js';
import { Node, VBox } from '../../../../scenery/js/imports.js';
import Checkbox from '../../../../sun/js/Checkbox.js';
import Panel from '../../../../sun/js/Panel.js';
import areaBuilder from '../../areaBuilder.js';
import AreaBuilderSharedConstants from '../AreaBuilderSharedConstants.js';
import DimensionsIcon from './DimensionsIcon.js';
import Grid from './Grid.js';
// constants
const BACKGROUND_COLOR = AreaBuilderSharedConstants.CONTROL_PANEL_BACKGROUND_COLOR;
const PANEL_OPTIONS = {
    fill: BACKGROUND_COLOR,
    yMargin: 10,
    xMargin: 20
};
let AreaBuilderControlPanel = class AreaBuilderControlPanel extends Node {
    /**
   * @param showGridProperty
   * @param showDimensionsProperty
   * @param {Object} [options]
   */ constructor(showGridProperty, showDimensionsProperty, options){
        super();
        // Properties that control which elements are visible and which are hidden.  This constitutes the primary API.
        this.gridControlVisibleProperty = new Property(true);
        this.dimensionsControlVisibleProperty = new Property(true);
        // Create the controls and labels
        const gridCheckbox = new Checkbox(showGridProperty, new Grid(new Bounds2(0, 0, 40, 40), 10, {
            stroke: '#b0b0b0'
        }), {
            spacing: 15
        });
        this.dimensionsIcon = new DimensionsIcon(); // @public so that the icon style can be set
        const dimensionsCheckbox = new Checkbox(showDimensionsProperty, this.dimensionsIcon, {
            spacing: 15
        });
        // Create the panel.
        const vBox = new VBox({
            children: [
                gridCheckbox,
                dimensionsCheckbox
            ],
            spacing: 8,
            align: 'left'
        });
        this.addChild(new Panel(vBox, PANEL_OPTIONS));
        // Add/remove the grid visibility control.
        this.gridControlVisibleProperty.link((gridControlVisible)=>{
            if (gridControlVisible && !vBox.hasChild(gridCheckbox)) {
                vBox.insertChild(0, gridCheckbox);
            } else if (!gridControlVisible && vBox.hasChild(gridCheckbox)) {
                vBox.removeChild(gridCheckbox);
            }
        });
        // Add/remove the dimension visibility control.
        this.dimensionsControlVisibleProperty.link((dimensionsControlVisible)=>{
            if (dimensionsControlVisible && !vBox.hasChild(dimensionsCheckbox)) {
                // Insert at bottom.
                vBox.insertChild(vBox.getChildrenCount(), dimensionsCheckbox);
            } else if (!dimensionsControlVisible && vBox.hasChild(dimensionsCheckbox)) {
                vBox.removeChild(dimensionsCheckbox);
            }
        });
        this.mutate(options);
    }
};
areaBuilder.register('AreaBuilderControlPanel', AreaBuilderControlPanel);
export default AreaBuilderControlPanel;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL2FyZWEtYnVpbGRlci9qcy9jb21tb24vdmlldy9BcmVhQnVpbGRlckNvbnRyb2xQYW5lbC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNC0yMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuLyoqXG4gKiBQYW5lbCB0aGF0IGNvbnRhaW5zIGNvbnRyb2xzIGZvciB0dXJuaW5nIHZhcmlvdXMgdG9vbHMgb24gYW5kIG9mZiBmb3IgdGhlIEFyZWEgQnVpbGRlciBnYW1lLiBJdCBpcyBkeW5hbWljIGluIHRoZVxuICogc2Vuc2UgdGhhdCBkaWZmZXJlbnQgZWxlbWVudHMgb2YgdGhlIHBhbmVsIGNvbWUgYW5kIGdvLlxuICpcbiAqIEBhdXRob3IgSm9obiBCbGFuY29cbiAqL1xuXG5pbXBvcnQgUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9Qcm9wZXJ0eS5qcyc7XG5pbXBvcnQgQm91bmRzMiBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvQm91bmRzMi5qcyc7XG5pbXBvcnQgeyBOb2RlLCBWQm94IH0gZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcbmltcG9ydCBDaGVja2JveCBmcm9tICcuLi8uLi8uLi8uLi9zdW4vanMvQ2hlY2tib3guanMnO1xuaW1wb3J0IFBhbmVsIGZyb20gJy4uLy4uLy4uLy4uL3N1bi9qcy9QYW5lbC5qcyc7XG5pbXBvcnQgYXJlYUJ1aWxkZXIgZnJvbSAnLi4vLi4vYXJlYUJ1aWxkZXIuanMnO1xuaW1wb3J0IEFyZWFCdWlsZGVyU2hhcmVkQ29uc3RhbnRzIGZyb20gJy4uL0FyZWFCdWlsZGVyU2hhcmVkQ29uc3RhbnRzLmpzJztcbmltcG9ydCBEaW1lbnNpb25zSWNvbiBmcm9tICcuL0RpbWVuc2lvbnNJY29uLmpzJztcbmltcG9ydCBHcmlkIGZyb20gJy4vR3JpZC5qcyc7XG5cbi8vIGNvbnN0YW50c1xuY29uc3QgQkFDS0dST1VORF9DT0xPUiA9IEFyZWFCdWlsZGVyU2hhcmVkQ29uc3RhbnRzLkNPTlRST0xfUEFORUxfQkFDS0dST1VORF9DT0xPUjtcbmNvbnN0IFBBTkVMX09QVElPTlMgPSB7IGZpbGw6IEJBQ0tHUk9VTkRfQ09MT1IsIHlNYXJnaW46IDEwLCB4TWFyZ2luOiAyMCB9O1xuXG5jbGFzcyBBcmVhQnVpbGRlckNvbnRyb2xQYW5lbCBleHRlbmRzIE5vZGUge1xuXG4gIC8qKlxuICAgKiBAcGFyYW0gc2hvd0dyaWRQcm9wZXJ0eVxuICAgKiBAcGFyYW0gc2hvd0RpbWVuc2lvbnNQcm9wZXJ0eVxuICAgKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnNdXG4gICAqL1xuICBjb25zdHJ1Y3Rvciggc2hvd0dyaWRQcm9wZXJ0eSwgc2hvd0RpbWVuc2lvbnNQcm9wZXJ0eSwgb3B0aW9ucyApIHtcbiAgICBzdXBlcigpO1xuXG4gICAgLy8gUHJvcGVydGllcyB0aGF0IGNvbnRyb2wgd2hpY2ggZWxlbWVudHMgYXJlIHZpc2libGUgYW5kIHdoaWNoIGFyZSBoaWRkZW4uICBUaGlzIGNvbnN0aXR1dGVzIHRoZSBwcmltYXJ5IEFQSS5cbiAgICB0aGlzLmdyaWRDb250cm9sVmlzaWJsZVByb3BlcnR5ID0gbmV3IFByb3BlcnR5KCB0cnVlICk7XG4gICAgdGhpcy5kaW1lbnNpb25zQ29udHJvbFZpc2libGVQcm9wZXJ0eSA9IG5ldyBQcm9wZXJ0eSggdHJ1ZSApO1xuXG4gICAgLy8gQ3JlYXRlIHRoZSBjb250cm9scyBhbmQgbGFiZWxzXG4gICAgY29uc3QgZ3JpZENoZWNrYm94ID0gbmV3IENoZWNrYm94KCBzaG93R3JpZFByb3BlcnR5LCBuZXcgR3JpZCggbmV3IEJvdW5kczIoIDAsIDAsIDQwLCA0MCApLCAxMCwgeyBzdHJva2U6ICcjYjBiMGIwJyB9ICksIHsgc3BhY2luZzogMTUgfSApO1xuICAgIHRoaXMuZGltZW5zaW9uc0ljb24gPSBuZXcgRGltZW5zaW9uc0ljb24oKTsgLy8gQHB1YmxpYyBzbyB0aGF0IHRoZSBpY29uIHN0eWxlIGNhbiBiZSBzZXRcbiAgICBjb25zdCBkaW1lbnNpb25zQ2hlY2tib3ggPSBuZXcgQ2hlY2tib3goIHNob3dEaW1lbnNpb25zUHJvcGVydHksIHRoaXMuZGltZW5zaW9uc0ljb24sIHsgc3BhY2luZzogMTUgfSApO1xuXG4gICAgLy8gQ3JlYXRlIHRoZSBwYW5lbC5cbiAgICBjb25zdCB2Qm94ID0gbmV3IFZCb3goIHtcbiAgICAgIGNoaWxkcmVuOiBbXG4gICAgICAgIGdyaWRDaGVja2JveCxcbiAgICAgICAgZGltZW5zaW9uc0NoZWNrYm94XG4gICAgICBdLFxuICAgICAgc3BhY2luZzogOCxcbiAgICAgIGFsaWduOiAnbGVmdCdcbiAgICB9ICk7XG4gICAgdGhpcy5hZGRDaGlsZCggbmV3IFBhbmVsKCB2Qm94LCBQQU5FTF9PUFRJT05TICkgKTtcblxuICAgIC8vIEFkZC9yZW1vdmUgdGhlIGdyaWQgdmlzaWJpbGl0eSBjb250cm9sLlxuICAgIHRoaXMuZ3JpZENvbnRyb2xWaXNpYmxlUHJvcGVydHkubGluayggZ3JpZENvbnRyb2xWaXNpYmxlID0+IHtcbiAgICAgIGlmICggZ3JpZENvbnRyb2xWaXNpYmxlICYmICF2Qm94Lmhhc0NoaWxkKCBncmlkQ2hlY2tib3ggKSApIHtcbiAgICAgICAgdkJveC5pbnNlcnRDaGlsZCggMCwgZ3JpZENoZWNrYm94ICk7XG4gICAgICB9XG4gICAgICBlbHNlIGlmICggIWdyaWRDb250cm9sVmlzaWJsZSAmJiB2Qm94Lmhhc0NoaWxkKCBncmlkQ2hlY2tib3ggKSApIHtcbiAgICAgICAgdkJveC5yZW1vdmVDaGlsZCggZ3JpZENoZWNrYm94ICk7XG4gICAgICB9XG4gICAgfSApO1xuXG4gICAgLy8gQWRkL3JlbW92ZSB0aGUgZGltZW5zaW9uIHZpc2liaWxpdHkgY29udHJvbC5cbiAgICB0aGlzLmRpbWVuc2lvbnNDb250cm9sVmlzaWJsZVByb3BlcnR5LmxpbmsoIGRpbWVuc2lvbnNDb250cm9sVmlzaWJsZSA9PiB7XG4gICAgICBpZiAoIGRpbWVuc2lvbnNDb250cm9sVmlzaWJsZSAmJiAhdkJveC5oYXNDaGlsZCggZGltZW5zaW9uc0NoZWNrYm94ICkgKSB7XG4gICAgICAgIC8vIEluc2VydCBhdCBib3R0b20uXG4gICAgICAgIHZCb3guaW5zZXJ0Q2hpbGQoIHZCb3guZ2V0Q2hpbGRyZW5Db3VudCgpLCBkaW1lbnNpb25zQ2hlY2tib3ggKTtcbiAgICAgIH1cbiAgICAgIGVsc2UgaWYgKCAhZGltZW5zaW9uc0NvbnRyb2xWaXNpYmxlICYmIHZCb3guaGFzQ2hpbGQoIGRpbWVuc2lvbnNDaGVja2JveCApICkge1xuICAgICAgICB2Qm94LnJlbW92ZUNoaWxkKCBkaW1lbnNpb25zQ2hlY2tib3ggKTtcbiAgICAgIH1cbiAgICB9ICk7XG5cbiAgICB0aGlzLm11dGF0ZSggb3B0aW9ucyApO1xuICB9XG59XG5cbmFyZWFCdWlsZGVyLnJlZ2lzdGVyKCAnQXJlYUJ1aWxkZXJDb250cm9sUGFuZWwnLCBBcmVhQnVpbGRlckNvbnRyb2xQYW5lbCApO1xuZXhwb3J0IGRlZmF1bHQgQXJlYUJ1aWxkZXJDb250cm9sUGFuZWw7Il0sIm5hbWVzIjpbIlByb3BlcnR5IiwiQm91bmRzMiIsIk5vZGUiLCJWQm94IiwiQ2hlY2tib3giLCJQYW5lbCIsImFyZWFCdWlsZGVyIiwiQXJlYUJ1aWxkZXJTaGFyZWRDb25zdGFudHMiLCJEaW1lbnNpb25zSWNvbiIsIkdyaWQiLCJCQUNLR1JPVU5EX0NPTE9SIiwiQ09OVFJPTF9QQU5FTF9CQUNLR1JPVU5EX0NPTE9SIiwiUEFORUxfT1BUSU9OUyIsImZpbGwiLCJ5TWFyZ2luIiwieE1hcmdpbiIsIkFyZWFCdWlsZGVyQ29udHJvbFBhbmVsIiwiY29uc3RydWN0b3IiLCJzaG93R3JpZFByb3BlcnR5Iiwic2hvd0RpbWVuc2lvbnNQcm9wZXJ0eSIsIm9wdGlvbnMiLCJncmlkQ29udHJvbFZpc2libGVQcm9wZXJ0eSIsImRpbWVuc2lvbnNDb250cm9sVmlzaWJsZVByb3BlcnR5IiwiZ3JpZENoZWNrYm94Iiwic3Ryb2tlIiwic3BhY2luZyIsImRpbWVuc2lvbnNJY29uIiwiZGltZW5zaW9uc0NoZWNrYm94IiwidkJveCIsImNoaWxkcmVuIiwiYWxpZ24iLCJhZGRDaGlsZCIsImxpbmsiLCJncmlkQ29udHJvbFZpc2libGUiLCJoYXNDaGlsZCIsImluc2VydENoaWxkIiwicmVtb3ZlQ2hpbGQiLCJkaW1lbnNpb25zQ29udHJvbFZpc2libGUiLCJnZXRDaGlsZHJlbkNvdW50IiwibXV0YXRlIiwicmVnaXN0ZXIiXSwibWFwcGluZ3MiOiJBQUFBLHNEQUFzRDtBQUV0RDs7Ozs7Q0FLQyxHQUVELE9BQU9BLGNBQWMsa0NBQWtDO0FBQ3ZELE9BQU9DLGFBQWEsZ0NBQWdDO0FBQ3BELFNBQVNDLElBQUksRUFBRUMsSUFBSSxRQUFRLG9DQUFvQztBQUMvRCxPQUFPQyxjQUFjLGlDQUFpQztBQUN0RCxPQUFPQyxXQUFXLDhCQUE4QjtBQUNoRCxPQUFPQyxpQkFBaUIsdUJBQXVCO0FBQy9DLE9BQU9DLGdDQUFnQyxtQ0FBbUM7QUFDMUUsT0FBT0Msb0JBQW9CLHNCQUFzQjtBQUNqRCxPQUFPQyxVQUFVLFlBQVk7QUFFN0IsWUFBWTtBQUNaLE1BQU1DLG1CQUFtQkgsMkJBQTJCSSw4QkFBOEI7QUFDbEYsTUFBTUMsZ0JBQWdCO0lBQUVDLE1BQU1IO0lBQWtCSSxTQUFTO0lBQUlDLFNBQVM7QUFBRztBQUV6RSxJQUFBLEFBQU1DLDBCQUFOLE1BQU1BLGdDQUFnQ2Q7SUFFcEM7Ozs7R0FJQyxHQUNEZSxZQUFhQyxnQkFBZ0IsRUFBRUMsc0JBQXNCLEVBQUVDLE9BQU8sQ0FBRztRQUMvRCxLQUFLO1FBRUwsOEdBQThHO1FBQzlHLElBQUksQ0FBQ0MsMEJBQTBCLEdBQUcsSUFBSXJCLFNBQVU7UUFDaEQsSUFBSSxDQUFDc0IsZ0NBQWdDLEdBQUcsSUFBSXRCLFNBQVU7UUFFdEQsaUNBQWlDO1FBQ2pDLE1BQU11QixlQUFlLElBQUluQixTQUFVYyxrQkFBa0IsSUFBSVQsS0FBTSxJQUFJUixRQUFTLEdBQUcsR0FBRyxJQUFJLEtBQU0sSUFBSTtZQUFFdUIsUUFBUTtRQUFVLElBQUs7WUFBRUMsU0FBUztRQUFHO1FBQ3ZJLElBQUksQ0FBQ0MsY0FBYyxHQUFHLElBQUlsQixrQkFBa0IsNENBQTRDO1FBQ3hGLE1BQU1tQixxQkFBcUIsSUFBSXZCLFNBQVVlLHdCQUF3QixJQUFJLENBQUNPLGNBQWMsRUFBRTtZQUFFRCxTQUFTO1FBQUc7UUFFcEcsb0JBQW9CO1FBQ3BCLE1BQU1HLE9BQU8sSUFBSXpCLEtBQU07WUFDckIwQixVQUFVO2dCQUNSTjtnQkFDQUk7YUFDRDtZQUNERixTQUFTO1lBQ1RLLE9BQU87UUFDVDtRQUNBLElBQUksQ0FBQ0MsUUFBUSxDQUFFLElBQUkxQixNQUFPdUIsTUFBTWhCO1FBRWhDLDBDQUEwQztRQUMxQyxJQUFJLENBQUNTLDBCQUEwQixDQUFDVyxJQUFJLENBQUVDLENBQUFBO1lBQ3BDLElBQUtBLHNCQUFzQixDQUFDTCxLQUFLTSxRQUFRLENBQUVYLGVBQWlCO2dCQUMxREssS0FBS08sV0FBVyxDQUFFLEdBQUdaO1lBQ3ZCLE9BQ0ssSUFBSyxDQUFDVSxzQkFBc0JMLEtBQUtNLFFBQVEsQ0FBRVgsZUFBaUI7Z0JBQy9ESyxLQUFLUSxXQUFXLENBQUViO1lBQ3BCO1FBQ0Y7UUFFQSwrQ0FBK0M7UUFDL0MsSUFBSSxDQUFDRCxnQ0FBZ0MsQ0FBQ1UsSUFBSSxDQUFFSyxDQUFBQTtZQUMxQyxJQUFLQSw0QkFBNEIsQ0FBQ1QsS0FBS00sUUFBUSxDQUFFUCxxQkFBdUI7Z0JBQ3RFLG9CQUFvQjtnQkFDcEJDLEtBQUtPLFdBQVcsQ0FBRVAsS0FBS1UsZ0JBQWdCLElBQUlYO1lBQzdDLE9BQ0ssSUFBSyxDQUFDVSw0QkFBNEJULEtBQUtNLFFBQVEsQ0FBRVAscUJBQXVCO2dCQUMzRUMsS0FBS1EsV0FBVyxDQUFFVDtZQUNwQjtRQUNGO1FBRUEsSUFBSSxDQUFDWSxNQUFNLENBQUVuQjtJQUNmO0FBQ0Y7QUFFQWQsWUFBWWtDLFFBQVEsQ0FBRSwyQkFBMkJ4QjtBQUNqRCxlQUFlQSx3QkFBd0IifQ==