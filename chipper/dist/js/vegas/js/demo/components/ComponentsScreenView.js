// Copyright 2022-2024, University of Colorado Boulder
/**
 * ComponentsScreenView demonstrates various vegas UI components.
 * Demos are selected from a combo box, and are instantiated on demand.
 * Use the 'component' query parameter to set the initial selection of the combo box.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */ import DemosScreenView from '../../../../sun/js/demo/DemosScreenView.js';
import vegas from '../../vegas.js';
import demoAllLevelsCompletedNode from './demoAllLevelsCompletedNode.js';
import demoGameInfoDialog from './demoGameInfoDialog.js';
import demoLevelCompletedNode from './demoLevelCompletedNode.js';
import demoLevelSelectionButton from './demoLevelSelectionButton.js';
import demoLevelSelectionButtonGroup from './demoLevelSelectionButtonGroup.js';
import demoRewardNode from './demoRewardNode.js';
import demoScoreDisplays from './demoScoreDisplays.js';
let ComponentsScreenView = class ComponentsScreenView extends DemosScreenView {
    constructor(options){
        // To add a demo, add an entry here of type DemoItemData.
        const demos = [
            {
                label: 'AllLevelsCompletedNode',
                createNode: demoAllLevelsCompletedNode
            },
            {
                label: 'GameInfoDialog',
                createNode: demoGameInfoDialog
            },
            {
                label: 'LevelCompletedNode',
                createNode: demoLevelCompletedNode
            },
            {
                label: 'LevelSelectionButton',
                createNode: demoLevelSelectionButton
            },
            {
                label: 'LevelSelectionButtonGroup',
                createNode: demoLevelSelectionButtonGroup
            },
            {
                label: 'RewardNode',
                createNode: demoRewardNode
            },
            {
                label: 'ScoreDisplays',
                createNode: demoScoreDisplays
            }
        ];
        super(demos, options);
    }
};
export { ComponentsScreenView as default };
vegas.register('ComponentsScreenView', ComponentsScreenView);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3ZlZ2FzL2pzL2RlbW8vY29tcG9uZW50cy9Db21wb25lbnRzU2NyZWVuVmlldy50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAyMi0yMDI0LCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuLyoqXG4gKiBDb21wb25lbnRzU2NyZWVuVmlldyBkZW1vbnN0cmF0ZXMgdmFyaW91cyB2ZWdhcyBVSSBjb21wb25lbnRzLlxuICogRGVtb3MgYXJlIHNlbGVjdGVkIGZyb20gYSBjb21ibyBib3gsIGFuZCBhcmUgaW5zdGFudGlhdGVkIG9uIGRlbWFuZC5cbiAqIFVzZSB0aGUgJ2NvbXBvbmVudCcgcXVlcnkgcGFyYW1ldGVyIHRvIHNldCB0aGUgaW5pdGlhbCBzZWxlY3Rpb24gb2YgdGhlIGNvbWJvIGJveC5cbiAqXG4gKiBAYXV0aG9yIENocmlzIE1hbGxleSAoUGl4ZWxab29tLCBJbmMuKVxuICovXG5cbmltcG9ydCB7IEVtcHR5U2VsZk9wdGlvbnMgfSBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvb3B0aW9uaXplLmpzJztcbmltcG9ydCBEZW1vc1NjcmVlblZpZXcsIHsgRGVtb3NTY3JlZW5WaWV3T3B0aW9ucyB9IGZyb20gJy4uLy4uLy4uLy4uL3N1bi9qcy9kZW1vL0RlbW9zU2NyZWVuVmlldy5qcyc7XG5pbXBvcnQgdmVnYXMgZnJvbSAnLi4vLi4vdmVnYXMuanMnO1xuaW1wb3J0IGRlbW9BbGxMZXZlbHNDb21wbGV0ZWROb2RlIGZyb20gJy4vZGVtb0FsbExldmVsc0NvbXBsZXRlZE5vZGUuanMnO1xuaW1wb3J0IGRlbW9HYW1lSW5mb0RpYWxvZyBmcm9tICcuL2RlbW9HYW1lSW5mb0RpYWxvZy5qcyc7XG5pbXBvcnQgZGVtb0xldmVsQ29tcGxldGVkTm9kZSBmcm9tICcuL2RlbW9MZXZlbENvbXBsZXRlZE5vZGUuanMnO1xuaW1wb3J0IGRlbW9MZXZlbFNlbGVjdGlvbkJ1dHRvbiBmcm9tICcuL2RlbW9MZXZlbFNlbGVjdGlvbkJ1dHRvbi5qcyc7XG5pbXBvcnQgZGVtb0xldmVsU2VsZWN0aW9uQnV0dG9uR3JvdXAgZnJvbSAnLi9kZW1vTGV2ZWxTZWxlY3Rpb25CdXR0b25Hcm91cC5qcyc7XG5pbXBvcnQgZGVtb1Jld2FyZE5vZGUgZnJvbSAnLi9kZW1vUmV3YXJkTm9kZS5qcyc7XG5pbXBvcnQgZGVtb1Njb3JlRGlzcGxheXMgZnJvbSAnLi9kZW1vU2NvcmVEaXNwbGF5cy5qcyc7XG5cbnR5cGUgU2VsZk9wdGlvbnMgPSBFbXB0eVNlbGZPcHRpb25zO1xudHlwZSBDb21wb25lbnRzU2NyZWVuVmlld09wdGlvbnMgPSBTZWxmT3B0aW9ucyAmIERlbW9zU2NyZWVuVmlld09wdGlvbnM7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIENvbXBvbmVudHNTY3JlZW5WaWV3IGV4dGVuZHMgRGVtb3NTY3JlZW5WaWV3IHtcblxuICBwdWJsaWMgY29uc3RydWN0b3IoIG9wdGlvbnM/OiBDb21wb25lbnRzU2NyZWVuVmlld09wdGlvbnMgKSB7XG5cbiAgICAvLyBUbyBhZGQgYSBkZW1vLCBhZGQgYW4gZW50cnkgaGVyZSBvZiB0eXBlIERlbW9JdGVtRGF0YS5cbiAgICBjb25zdCBkZW1vcyA9IFtcbiAgICAgIHsgbGFiZWw6ICdBbGxMZXZlbHNDb21wbGV0ZWROb2RlJywgY3JlYXRlTm9kZTogZGVtb0FsbExldmVsc0NvbXBsZXRlZE5vZGUgfSxcbiAgICAgIHsgbGFiZWw6ICdHYW1lSW5mb0RpYWxvZycsIGNyZWF0ZU5vZGU6IGRlbW9HYW1lSW5mb0RpYWxvZyB9LFxuICAgICAgeyBsYWJlbDogJ0xldmVsQ29tcGxldGVkTm9kZScsIGNyZWF0ZU5vZGU6IGRlbW9MZXZlbENvbXBsZXRlZE5vZGUgfSxcbiAgICAgIHsgbGFiZWw6ICdMZXZlbFNlbGVjdGlvbkJ1dHRvbicsIGNyZWF0ZU5vZGU6IGRlbW9MZXZlbFNlbGVjdGlvbkJ1dHRvbiB9LFxuICAgICAgeyBsYWJlbDogJ0xldmVsU2VsZWN0aW9uQnV0dG9uR3JvdXAnLCBjcmVhdGVOb2RlOiBkZW1vTGV2ZWxTZWxlY3Rpb25CdXR0b25Hcm91cCB9LFxuICAgICAgeyBsYWJlbDogJ1Jld2FyZE5vZGUnLCBjcmVhdGVOb2RlOiBkZW1vUmV3YXJkTm9kZSB9LFxuICAgICAgeyBsYWJlbDogJ1Njb3JlRGlzcGxheXMnLCBjcmVhdGVOb2RlOiBkZW1vU2NvcmVEaXNwbGF5cyB9XG4gICAgXTtcblxuICAgIHN1cGVyKCBkZW1vcywgb3B0aW9ucyApO1xuICB9XG59XG5cbnZlZ2FzLnJlZ2lzdGVyKCAnQ29tcG9uZW50c1NjcmVlblZpZXcnLCBDb21wb25lbnRzU2NyZWVuVmlldyApOyJdLCJuYW1lcyI6WyJEZW1vc1NjcmVlblZpZXciLCJ2ZWdhcyIsImRlbW9BbGxMZXZlbHNDb21wbGV0ZWROb2RlIiwiZGVtb0dhbWVJbmZvRGlhbG9nIiwiZGVtb0xldmVsQ29tcGxldGVkTm9kZSIsImRlbW9MZXZlbFNlbGVjdGlvbkJ1dHRvbiIsImRlbW9MZXZlbFNlbGVjdGlvbkJ1dHRvbkdyb3VwIiwiZGVtb1Jld2FyZE5vZGUiLCJkZW1vU2NvcmVEaXNwbGF5cyIsIkNvbXBvbmVudHNTY3JlZW5WaWV3Iiwib3B0aW9ucyIsImRlbW9zIiwibGFiZWwiLCJjcmVhdGVOb2RlIiwicmVnaXN0ZXIiXSwibWFwcGluZ3MiOiJBQUFBLHNEQUFzRDtBQUV0RDs7Ozs7O0NBTUMsR0FHRCxPQUFPQSxxQkFBaUQsNkNBQTZDO0FBQ3JHLE9BQU9DLFdBQVcsaUJBQWlCO0FBQ25DLE9BQU9DLGdDQUFnQyxrQ0FBa0M7QUFDekUsT0FBT0Msd0JBQXdCLDBCQUEwQjtBQUN6RCxPQUFPQyw0QkFBNEIsOEJBQThCO0FBQ2pFLE9BQU9DLDhCQUE4QixnQ0FBZ0M7QUFDckUsT0FBT0MsbUNBQW1DLHFDQUFxQztBQUMvRSxPQUFPQyxvQkFBb0Isc0JBQXNCO0FBQ2pELE9BQU9DLHVCQUF1Qix5QkFBeUI7QUFLeEMsSUFBQSxBQUFNQyx1QkFBTixNQUFNQSw2QkFBNkJUO0lBRWhELFlBQW9CVSxPQUFxQyxDQUFHO1FBRTFELHlEQUF5RDtRQUN6RCxNQUFNQyxRQUFRO1lBQ1o7Z0JBQUVDLE9BQU87Z0JBQTBCQyxZQUFZWDtZQUEyQjtZQUMxRTtnQkFBRVUsT0FBTztnQkFBa0JDLFlBQVlWO1lBQW1CO1lBQzFEO2dCQUFFUyxPQUFPO2dCQUFzQkMsWUFBWVQ7WUFBdUI7WUFDbEU7Z0JBQUVRLE9BQU87Z0JBQXdCQyxZQUFZUjtZQUF5QjtZQUN0RTtnQkFBRU8sT0FBTztnQkFBNkJDLFlBQVlQO1lBQThCO1lBQ2hGO2dCQUFFTSxPQUFPO2dCQUFjQyxZQUFZTjtZQUFlO1lBQ2xEO2dCQUFFSyxPQUFPO2dCQUFpQkMsWUFBWUw7WUFBa0I7U0FDekQ7UUFFRCxLQUFLLENBQUVHLE9BQU9EO0lBQ2hCO0FBQ0Y7QUFqQkEsU0FBcUJELGtDQWlCcEI7QUFFRFIsTUFBTWEsUUFBUSxDQUFFLHdCQUF3QkwifQ==