// Copyright 2022, University of Colorado Boulder
/**
 * Colors for the fractions simulations.
 *
 * @author Marla Schulz (PhET Interactive Simulations)
 * @author Sam Reid (PhET Interactive Simulations)
 */ import { Color, ProfileColorProperty } from '../../scenery/js/imports.js';
import sceneryPhet from './sceneryPhet.js';
// Initial colors for each profile, by string key. Only profile currently is default (still helpful for making color
// tweaks with the top-level files)
const SceneryPhetColors = {
    emptyBeakerFillProperty: new ProfileColorProperty(sceneryPhet, 'emptyBeakerFill', {
        default: new Color(249, 253, 255, 0.2)
    }),
    solutionFillProperty: new ProfileColorProperty(sceneryPhet, 'solutionFill', {
        default: new Color(165, 217, 242)
    }),
    beakerShineFillProperty: new ProfileColorProperty(sceneryPhet, 'beakerShineFill', {
        default: new Color(255, 255, 255, 0.4)
    }),
    solutionShadowFillProperty: new ProfileColorProperty(sceneryPhet, 'solutionShadowFill', {
        default: new Color(142, 198, 221)
    }),
    solutionShineFillProperty: new ProfileColorProperty(sceneryPhet, 'solutionShineFill', {
        default: new Color(180, 229, 249)
    }),
    beakerStroke: new ProfileColorProperty(sceneryPhet, 'beakerStroke', {
        default: 'black'
    }),
    tickStroke: new ProfileColorProperty(sceneryPhet, 'tickStroke', {
        default: 'black'
    })
};
sceneryPhet.register('SceneryPhetColors', SceneryPhetColors);
export default SceneryPhetColors;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9TY2VuZXJ5UGhldENvbG9ycy50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAyMiwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbi8qKlxuICogQ29sb3JzIGZvciB0aGUgZnJhY3Rpb25zIHNpbXVsYXRpb25zLlxuICpcbiAqIEBhdXRob3IgTWFybGEgU2NodWx6IChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxuICogQGF1dGhvciBTYW0gUmVpZCAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcbiAqL1xuXG5pbXBvcnQgeyBDb2xvciwgUHJvZmlsZUNvbG9yUHJvcGVydHkgfSBmcm9tICcuLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xuaW1wb3J0IHNjZW5lcnlQaGV0IGZyb20gJy4vc2NlbmVyeVBoZXQuanMnO1xuXG4vLyBJbml0aWFsIGNvbG9ycyBmb3IgZWFjaCBwcm9maWxlLCBieSBzdHJpbmcga2V5LiBPbmx5IHByb2ZpbGUgY3VycmVudGx5IGlzIGRlZmF1bHQgKHN0aWxsIGhlbHBmdWwgZm9yIG1ha2luZyBjb2xvclxuLy8gdHdlYWtzIHdpdGggdGhlIHRvcC1sZXZlbCBmaWxlcylcblxuY29uc3QgU2NlbmVyeVBoZXRDb2xvcnMgPSB7XG4gIGVtcHR5QmVha2VyRmlsbFByb3BlcnR5OiBuZXcgUHJvZmlsZUNvbG9yUHJvcGVydHkoIHNjZW5lcnlQaGV0LCAnZW1wdHlCZWFrZXJGaWxsJywgeyBkZWZhdWx0OiBuZXcgQ29sb3IoIDI0OSwgMjUzLCAyNTUsIDAuMiApIH0gKSxcbiAgc29sdXRpb25GaWxsUHJvcGVydHk6IG5ldyBQcm9maWxlQ29sb3JQcm9wZXJ0eSggc2NlbmVyeVBoZXQsICdzb2x1dGlvbkZpbGwnLCB7IGRlZmF1bHQ6IG5ldyBDb2xvciggMTY1LCAyMTcsIDI0MiApIH0gKSxcbiAgYmVha2VyU2hpbmVGaWxsUHJvcGVydHk6IG5ldyBQcm9maWxlQ29sb3JQcm9wZXJ0eSggc2NlbmVyeVBoZXQsICdiZWFrZXJTaGluZUZpbGwnLCB7IGRlZmF1bHQ6IG5ldyBDb2xvciggMjU1LCAyNTUsIDI1NSwgMC40ICkgfSApLFxuICBzb2x1dGlvblNoYWRvd0ZpbGxQcm9wZXJ0eTogbmV3IFByb2ZpbGVDb2xvclByb3BlcnR5KCBzY2VuZXJ5UGhldCwgJ3NvbHV0aW9uU2hhZG93RmlsbCcsIHsgZGVmYXVsdDogbmV3IENvbG9yKCAxNDIsIDE5OCwgMjIxICkgfSApLFxuICBzb2x1dGlvblNoaW5lRmlsbFByb3BlcnR5OiBuZXcgUHJvZmlsZUNvbG9yUHJvcGVydHkoIHNjZW5lcnlQaGV0LCAnc29sdXRpb25TaGluZUZpbGwnLCB7IGRlZmF1bHQ6IG5ldyBDb2xvciggMTgwLCAyMjksIDI0OSApIH0gKSxcbiAgYmVha2VyU3Ryb2tlOiBuZXcgUHJvZmlsZUNvbG9yUHJvcGVydHkoIHNjZW5lcnlQaGV0LCAnYmVha2VyU3Ryb2tlJywgeyBkZWZhdWx0OiAnYmxhY2snIH0gKSxcbiAgdGlja1N0cm9rZTogbmV3IFByb2ZpbGVDb2xvclByb3BlcnR5KCBzY2VuZXJ5UGhldCwgJ3RpY2tTdHJva2UnLCB7IGRlZmF1bHQ6ICdibGFjaycgfSApXG59O1xuXG5zY2VuZXJ5UGhldC5yZWdpc3RlciggJ1NjZW5lcnlQaGV0Q29sb3JzJywgU2NlbmVyeVBoZXRDb2xvcnMgKTtcblxuZXhwb3J0IGRlZmF1bHQgU2NlbmVyeVBoZXRDb2xvcnM7Il0sIm5hbWVzIjpbIkNvbG9yIiwiUHJvZmlsZUNvbG9yUHJvcGVydHkiLCJzY2VuZXJ5UGhldCIsIlNjZW5lcnlQaGV0Q29sb3JzIiwiZW1wdHlCZWFrZXJGaWxsUHJvcGVydHkiLCJkZWZhdWx0Iiwic29sdXRpb25GaWxsUHJvcGVydHkiLCJiZWFrZXJTaGluZUZpbGxQcm9wZXJ0eSIsInNvbHV0aW9uU2hhZG93RmlsbFByb3BlcnR5Iiwic29sdXRpb25TaGluZUZpbGxQcm9wZXJ0eSIsImJlYWtlclN0cm9rZSIsInRpY2tTdHJva2UiLCJyZWdpc3RlciJdLCJtYXBwaW5ncyI6IkFBQUEsaURBQWlEO0FBRWpEOzs7OztDQUtDLEdBRUQsU0FBU0EsS0FBSyxFQUFFQyxvQkFBb0IsUUFBUSw4QkFBOEI7QUFDMUUsT0FBT0MsaUJBQWlCLG1CQUFtQjtBQUUzQyxvSEFBb0g7QUFDcEgsbUNBQW1DO0FBRW5DLE1BQU1DLG9CQUFvQjtJQUN4QkMseUJBQXlCLElBQUlILHFCQUFzQkMsYUFBYSxtQkFBbUI7UUFBRUcsU0FBUyxJQUFJTCxNQUFPLEtBQUssS0FBSyxLQUFLO0lBQU07SUFDOUhNLHNCQUFzQixJQUFJTCxxQkFBc0JDLGFBQWEsZ0JBQWdCO1FBQUVHLFNBQVMsSUFBSUwsTUFBTyxLQUFLLEtBQUs7SUFBTTtJQUNuSE8seUJBQXlCLElBQUlOLHFCQUFzQkMsYUFBYSxtQkFBbUI7UUFBRUcsU0FBUyxJQUFJTCxNQUFPLEtBQUssS0FBSyxLQUFLO0lBQU07SUFDOUhRLDRCQUE0QixJQUFJUCxxQkFBc0JDLGFBQWEsc0JBQXNCO1FBQUVHLFNBQVMsSUFBSUwsTUFBTyxLQUFLLEtBQUs7SUFBTTtJQUMvSFMsMkJBQTJCLElBQUlSLHFCQUFzQkMsYUFBYSxxQkFBcUI7UUFBRUcsU0FBUyxJQUFJTCxNQUFPLEtBQUssS0FBSztJQUFNO0lBQzdIVSxjQUFjLElBQUlULHFCQUFzQkMsYUFBYSxnQkFBZ0I7UUFBRUcsU0FBUztJQUFRO0lBQ3hGTSxZQUFZLElBQUlWLHFCQUFzQkMsYUFBYSxjQUFjO1FBQUVHLFNBQVM7SUFBUTtBQUN0RjtBQUVBSCxZQUFZVSxRQUFRLENBQUUscUJBQXFCVDtBQUUzQyxlQUFlQSxrQkFBa0IifQ==