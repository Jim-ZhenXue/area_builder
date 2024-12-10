// Copyright 2013-2024, University of Colorado Boulder
/**
 * Shows a central node surrounded with next/previous arrows. Need to implement next(),previous(),
 * and when availability changes modify hasNextProperty and hasPreviousProperty
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ import Property from '../../axon/js/Property.js';
import { Shape } from '../../kite/js/imports.js';
import deprecationWarning from '../../phet-core/js/deprecationWarning.js';
import merge from '../../phet-core/js/merge.js';
import { Color, FireListener, Node, Path } from '../../scenery/js/imports.js';
import sceneryPhet from './sceneryPhet.js';
/**
 * @deprecated Do not use in new code until https://github.com/phetsims/scenery-phet/issues/763 is addressed.
 * This is currently used only in build-a-molecule.
 */ let NextPreviousNavigationNode = class NextPreviousNavigationNode extends Node {
    /**
   * @param {Node} centerNode
   * @param {Object} [selfOptions]  Valid options are:
   *                                arrowColor         - color for the arrow's fill
   *                                arrowStrokeColor   - color for the arrow's stroke
   *                                arrowWidth         - the width of the arrow, from its point to its side
   *                                arrowHeight        - the height of the arrow, from tip to tip
   *                                next               - a function to be called when the "next" arrow is pressed
   *                                previous           - a function to be called when the "previous" arrow is pressed
   *                                createTouchAreaShape - function( shape, isPrevious ) that returns the touch area for the specified arrow
   * @param {Object} [nodeOptions] passed to the Node (super) constructor
   */ constructor(centerNode, selfOptions, nodeOptions){
        assert && deprecationWarning('NextPreviousNavigationNode is deprecated, see https://github.com/phetsims/scenery-phet/issues/763');
        selfOptions = merge({
            arrowColor: Color.YELLOW,
            arrowStrokeColor: Color.BLACK,
            arrowWidth: 14,
            arrowHeight: 18,
            arrowPadding: 15,
            next: null,
            previous: null,
            createTouchAreaShape: function(shape, isPrevious) {
                return null; // pass in function that returns a shape given the shape of the arrow
            }
        }, selfOptions);
        super();
        // @public
        this.hasNextProperty = new Property(false);
        this.hasPreviousProperty = new Property(false);
        const arrowWidth = selfOptions.arrowWidth;
        const arrowHeight = selfOptions.arrowHeight;
        /*---------------------------------------------------------------------------*
     * previous
     *----------------------------------------------------------------------------*/ // triangle pointing to the left
        const previousShape = new Shape().moveTo(0, arrowHeight / 2).lineTo(arrowWidth, 0).lineTo(arrowWidth, arrowHeight).close();
        const previousKitNode = new Path(previousShape, {
            fill: selfOptions.arrowColor,
            stroke: selfOptions.arrowStrokeColor,
            cursor: 'pointer',
            touchArea: selfOptions.createTouchAreaShape(previousShape, true)
        });
        previousKitNode.addInputListener(new FireListener({
            fire: ()=>{
                if (this.hasPreviousProperty.value) {
                    selfOptions.previous && selfOptions.previous();
                }
            }
        }));
        this.hasPreviousProperty.link((available)=>{
            previousKitNode.visible = available;
        });
        this.addChild(previousKitNode);
        /*---------------------------------------------------------------------------*
     * center
     *----------------------------------------------------------------------------*/ this.addChild(centerNode);
        /*---------------------------------------------------------------------------*
     * next
     *----------------------------------------------------------------------------*/ // triangle pointing to the right
        const nextShape = new Shape().moveTo(arrowWidth, arrowHeight / 2).lineTo(0, 0).lineTo(0, arrowHeight).close();
        const nextKitNode = new Path(nextShape, {
            fill: selfOptions.arrowColor,
            stroke: selfOptions.arrowStrokeColor,
            cursor: 'pointer',
            touchArea: selfOptions.createTouchAreaShape(nextShape, false)
        });
        nextKitNode.addInputListener(new FireListener({
            fire: ()=>{
                if (this.hasNextProperty.value) {
                    selfOptions.next && selfOptions.next();
                }
            }
        }));
        this.hasNextProperty.link((available)=>{
            nextKitNode.visible = available;
        });
        this.addChild(nextKitNode);
        /*---------------------------------------------------------------------------*
     * positioning
     *----------------------------------------------------------------------------*/ const maxHeight = Math.max(arrowHeight, centerNode.height);
        previousKitNode.centerY = maxHeight / 2;
        centerNode.centerY = maxHeight / 2;
        nextKitNode.centerY = maxHeight / 2;
        // previousKitNode.x = 0;
        centerNode.x = arrowWidth + selfOptions.arrowPadding;
        nextKitNode.x = centerNode.right + selfOptions.arrowPadding;
        this.mutate(nodeOptions);
    }
};
sceneryPhet.register('NextPreviousNavigationNode', NextPreviousNavigationNode);
export default NextPreviousNavigationNode;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9OZXh0UHJldmlvdXNOYXZpZ2F0aW9uTm9kZS5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxMy0yMDI0LCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuLyoqXG4gKiBTaG93cyBhIGNlbnRyYWwgbm9kZSBzdXJyb3VuZGVkIHdpdGggbmV4dC9wcmV2aW91cyBhcnJvd3MuIE5lZWQgdG8gaW1wbGVtZW50IG5leHQoKSxwcmV2aW91cygpLFxuICogYW5kIHdoZW4gYXZhaWxhYmlsaXR5IGNoYW5nZXMgbW9kaWZ5IGhhc05leHRQcm9wZXJ0eSBhbmQgaGFzUHJldmlvdXNQcm9wZXJ0eVxuICpcbiAqIEBhdXRob3IgSm9uYXRoYW4gT2xzb24gPGpvbmF0aGFuLm9sc29uQGNvbG9yYWRvLmVkdT5cbiAqL1xuXG5pbXBvcnQgUHJvcGVydHkgZnJvbSAnLi4vLi4vYXhvbi9qcy9Qcm9wZXJ0eS5qcyc7XG5pbXBvcnQgeyBTaGFwZSB9IGZyb20gJy4uLy4uL2tpdGUvanMvaW1wb3J0cy5qcyc7XG5pbXBvcnQgZGVwcmVjYXRpb25XYXJuaW5nIGZyb20gJy4uLy4uL3BoZXQtY29yZS9qcy9kZXByZWNhdGlvbldhcm5pbmcuanMnO1xuaW1wb3J0IG1lcmdlIGZyb20gJy4uLy4uL3BoZXQtY29yZS9qcy9tZXJnZS5qcyc7XG5pbXBvcnQgeyBDb2xvciwgRmlyZUxpc3RlbmVyLCBOb2RlLCBQYXRoIH0gZnJvbSAnLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcbmltcG9ydCBzY2VuZXJ5UGhldCBmcm9tICcuL3NjZW5lcnlQaGV0LmpzJztcblxuLyoqXG4gKiBAZGVwcmVjYXRlZCBEbyBub3QgdXNlIGluIG5ldyBjb2RlIHVudGlsIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9zY2VuZXJ5LXBoZXQvaXNzdWVzLzc2MyBpcyBhZGRyZXNzZWQuXG4gKiBUaGlzIGlzIGN1cnJlbnRseSB1c2VkIG9ubHkgaW4gYnVpbGQtYS1tb2xlY3VsZS5cbiAqL1xuY2xhc3MgTmV4dFByZXZpb3VzTmF2aWdhdGlvbk5vZGUgZXh0ZW5kcyBOb2RlIHtcblxuICAvKipcbiAgICogQHBhcmFtIHtOb2RlfSBjZW50ZXJOb2RlXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBbc2VsZk9wdGlvbnNdICBWYWxpZCBvcHRpb25zIGFyZTpcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFycm93Q29sb3IgICAgICAgICAtIGNvbG9yIGZvciB0aGUgYXJyb3cncyBmaWxsXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcnJvd1N0cm9rZUNvbG9yICAgLSBjb2xvciBmb3IgdGhlIGFycm93J3Mgc3Ryb2tlXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcnJvd1dpZHRoICAgICAgICAgLSB0aGUgd2lkdGggb2YgdGhlIGFycm93LCBmcm9tIGl0cyBwb2ludCB0byBpdHMgc2lkZVxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXJyb3dIZWlnaHQgICAgICAgIC0gdGhlIGhlaWdodCBvZiB0aGUgYXJyb3csIGZyb20gdGlwIHRvIHRpcFxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV4dCAgICAgICAgICAgICAgIC0gYSBmdW5jdGlvbiB0byBiZSBjYWxsZWQgd2hlbiB0aGUgXCJuZXh0XCIgYXJyb3cgaXMgcHJlc3NlZFxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJldmlvdXMgICAgICAgICAgIC0gYSBmdW5jdGlvbiB0byBiZSBjYWxsZWQgd2hlbiB0aGUgXCJwcmV2aW91c1wiIGFycm93IGlzIHByZXNzZWRcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNyZWF0ZVRvdWNoQXJlYVNoYXBlIC0gZnVuY3Rpb24oIHNoYXBlLCBpc1ByZXZpb3VzICkgdGhhdCByZXR1cm5zIHRoZSB0b3VjaCBhcmVhIGZvciB0aGUgc3BlY2lmaWVkIGFycm93XG4gICAqIEBwYXJhbSB7T2JqZWN0fSBbbm9kZU9wdGlvbnNdIHBhc3NlZCB0byB0aGUgTm9kZSAoc3VwZXIpIGNvbnN0cnVjdG9yXG4gICAqL1xuICBjb25zdHJ1Y3RvciggY2VudGVyTm9kZSwgc2VsZk9wdGlvbnMsIG5vZGVPcHRpb25zICkge1xuICAgIGFzc2VydCAmJiBkZXByZWNhdGlvbldhcm5pbmcoICdOZXh0UHJldmlvdXNOYXZpZ2F0aW9uTm9kZSBpcyBkZXByZWNhdGVkLCBzZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3NjZW5lcnktcGhldC9pc3N1ZXMvNzYzJyApO1xuXG4gICAgc2VsZk9wdGlvbnMgPSBtZXJnZSgge1xuICAgICAgYXJyb3dDb2xvcjogQ29sb3IuWUVMTE9XLFxuICAgICAgYXJyb3dTdHJva2VDb2xvcjogQ29sb3IuQkxBQ0ssXG4gICAgICBhcnJvd1dpZHRoOiAxNCxcbiAgICAgIGFycm93SGVpZ2h0OiAxOCxcbiAgICAgIGFycm93UGFkZGluZzogMTUsXG4gICAgICBuZXh0OiBudWxsLCAvLyBmdW5jdGlvbigpIHsgLi4uIH1cbiAgICAgIHByZXZpb3VzOiBudWxsLCAvLyBmdW5jdGlvbigpIHsgLi4uIH1cbiAgICAgIGNyZWF0ZVRvdWNoQXJlYVNoYXBlOiBmdW5jdGlvbiggc2hhcGUsIGlzUHJldmlvdXMgKSB7XG4gICAgICAgIHJldHVybiBudWxsOyAvLyBwYXNzIGluIGZ1bmN0aW9uIHRoYXQgcmV0dXJucyBhIHNoYXBlIGdpdmVuIHRoZSBzaGFwZSBvZiB0aGUgYXJyb3dcbiAgICAgIH1cbiAgICB9LCBzZWxmT3B0aW9ucyApO1xuXG4gICAgc3VwZXIoKTtcblxuICAgIC8vIEBwdWJsaWNcbiAgICB0aGlzLmhhc05leHRQcm9wZXJ0eSA9IG5ldyBQcm9wZXJ0eSggZmFsc2UgKTtcbiAgICB0aGlzLmhhc1ByZXZpb3VzUHJvcGVydHkgPSBuZXcgUHJvcGVydHkoIGZhbHNlICk7XG5cbiAgICBjb25zdCBhcnJvd1dpZHRoID0gc2VsZk9wdGlvbnMuYXJyb3dXaWR0aDtcbiAgICBjb25zdCBhcnJvd0hlaWdodCA9IHNlbGZPcHRpb25zLmFycm93SGVpZ2h0O1xuXG4gICAgLyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qXG4gICAgICogcHJldmlvdXNcbiAgICAgKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xuXG4gICAgLy8gdHJpYW5nbGUgcG9pbnRpbmcgdG8gdGhlIGxlZnRcbiAgICBjb25zdCBwcmV2aW91c1NoYXBlID0gbmV3IFNoYXBlKCkubW92ZVRvKCAwLCBhcnJvd0hlaWdodCAvIDIgKVxuICAgICAgLmxpbmVUbyggYXJyb3dXaWR0aCwgMCApXG4gICAgICAubGluZVRvKCBhcnJvd1dpZHRoLCBhcnJvd0hlaWdodCApXG4gICAgICAuY2xvc2UoKTtcblxuICAgIGNvbnN0IHByZXZpb3VzS2l0Tm9kZSA9IG5ldyBQYXRoKCBwcmV2aW91c1NoYXBlLCB7XG4gICAgICBmaWxsOiBzZWxmT3B0aW9ucy5hcnJvd0NvbG9yLFxuICAgICAgc3Ryb2tlOiBzZWxmT3B0aW9ucy5hcnJvd1N0cm9rZUNvbG9yLFxuICAgICAgY3Vyc29yOiAncG9pbnRlcicsXG4gICAgICB0b3VjaEFyZWE6IHNlbGZPcHRpb25zLmNyZWF0ZVRvdWNoQXJlYVNoYXBlKCBwcmV2aW91c1NoYXBlLCB0cnVlIClcbiAgICB9ICk7XG4gICAgcHJldmlvdXNLaXROb2RlLmFkZElucHV0TGlzdGVuZXIoIG5ldyBGaXJlTGlzdGVuZXIoIHtcbiAgICAgIGZpcmU6ICgpID0+IHtcbiAgICAgICAgaWYgKCB0aGlzLmhhc1ByZXZpb3VzUHJvcGVydHkudmFsdWUgKSB7XG4gICAgICAgICAgc2VsZk9wdGlvbnMucHJldmlvdXMgJiYgc2VsZk9wdGlvbnMucHJldmlvdXMoKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0gKSApO1xuICAgIHRoaXMuaGFzUHJldmlvdXNQcm9wZXJ0eS5saW5rKCBhdmFpbGFibGUgPT4ge1xuICAgICAgcHJldmlvdXNLaXROb2RlLnZpc2libGUgPSBhdmFpbGFibGU7XG4gICAgfSApO1xuXG4gICAgdGhpcy5hZGRDaGlsZCggcHJldmlvdXNLaXROb2RlICk7XG5cbiAgICAvKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSpcbiAgICAgKiBjZW50ZXJcbiAgICAgKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xuXG4gICAgdGhpcy5hZGRDaGlsZCggY2VudGVyTm9kZSApO1xuXG4gICAgLyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qXG4gICAgICogbmV4dFxuICAgICAqLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXG5cbiAgICAvLyB0cmlhbmdsZSBwb2ludGluZyB0byB0aGUgcmlnaHRcbiAgICBjb25zdCBuZXh0U2hhcGUgPSBuZXcgU2hhcGUoKS5tb3ZlVG8oIGFycm93V2lkdGgsIGFycm93SGVpZ2h0IC8gMiApXG4gICAgICAubGluZVRvKCAwLCAwIClcbiAgICAgIC5saW5lVG8oIDAsIGFycm93SGVpZ2h0IClcbiAgICAgIC5jbG9zZSgpO1xuXG4gICAgY29uc3QgbmV4dEtpdE5vZGUgPSBuZXcgUGF0aCggbmV4dFNoYXBlLCB7XG4gICAgICBmaWxsOiBzZWxmT3B0aW9ucy5hcnJvd0NvbG9yLFxuICAgICAgc3Ryb2tlOiBzZWxmT3B0aW9ucy5hcnJvd1N0cm9rZUNvbG9yLFxuICAgICAgY3Vyc29yOiAncG9pbnRlcicsXG4gICAgICB0b3VjaEFyZWE6IHNlbGZPcHRpb25zLmNyZWF0ZVRvdWNoQXJlYVNoYXBlKCBuZXh0U2hhcGUsIGZhbHNlIClcbiAgICB9ICk7XG4gICAgbmV4dEtpdE5vZGUuYWRkSW5wdXRMaXN0ZW5lciggbmV3IEZpcmVMaXN0ZW5lcigge1xuICAgICAgZmlyZTogKCkgPT4ge1xuICAgICAgICBpZiAoIHRoaXMuaGFzTmV4dFByb3BlcnR5LnZhbHVlICkge1xuICAgICAgICAgIHNlbGZPcHRpb25zLm5leHQgJiYgc2VsZk9wdGlvbnMubmV4dCgpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSApICk7XG4gICAgdGhpcy5oYXNOZXh0UHJvcGVydHkubGluayggYXZhaWxhYmxlID0+IHtcbiAgICAgIG5leHRLaXROb2RlLnZpc2libGUgPSBhdmFpbGFibGU7XG4gICAgfSApO1xuXG4gICAgdGhpcy5hZGRDaGlsZCggbmV4dEtpdE5vZGUgKTtcblxuICAgIC8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKlxuICAgICAqIHBvc2l0aW9uaW5nXG4gICAgICotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cblxuICAgIGNvbnN0IG1heEhlaWdodCA9IE1hdGgubWF4KCBhcnJvd0hlaWdodCwgY2VudGVyTm9kZS5oZWlnaHQgKTtcblxuICAgIHByZXZpb3VzS2l0Tm9kZS5jZW50ZXJZID0gbWF4SGVpZ2h0IC8gMjtcbiAgICBjZW50ZXJOb2RlLmNlbnRlclkgPSBtYXhIZWlnaHQgLyAyO1xuICAgIG5leHRLaXROb2RlLmNlbnRlclkgPSBtYXhIZWlnaHQgLyAyO1xuXG4gICAgLy8gcHJldmlvdXNLaXROb2RlLnggPSAwO1xuICAgIGNlbnRlck5vZGUueCA9IGFycm93V2lkdGggKyBzZWxmT3B0aW9ucy5hcnJvd1BhZGRpbmc7XG4gICAgbmV4dEtpdE5vZGUueCA9IGNlbnRlck5vZGUucmlnaHQgKyBzZWxmT3B0aW9ucy5hcnJvd1BhZGRpbmc7XG5cbiAgICB0aGlzLm11dGF0ZSggbm9kZU9wdGlvbnMgKTtcbiAgfVxufVxuXG5zY2VuZXJ5UGhldC5yZWdpc3RlciggJ05leHRQcmV2aW91c05hdmlnYXRpb25Ob2RlJywgTmV4dFByZXZpb3VzTmF2aWdhdGlvbk5vZGUgKTtcbmV4cG9ydCBkZWZhdWx0IE5leHRQcmV2aW91c05hdmlnYXRpb25Ob2RlOyJdLCJuYW1lcyI6WyJQcm9wZXJ0eSIsIlNoYXBlIiwiZGVwcmVjYXRpb25XYXJuaW5nIiwibWVyZ2UiLCJDb2xvciIsIkZpcmVMaXN0ZW5lciIsIk5vZGUiLCJQYXRoIiwic2NlbmVyeVBoZXQiLCJOZXh0UHJldmlvdXNOYXZpZ2F0aW9uTm9kZSIsImNvbnN0cnVjdG9yIiwiY2VudGVyTm9kZSIsInNlbGZPcHRpb25zIiwibm9kZU9wdGlvbnMiLCJhc3NlcnQiLCJhcnJvd0NvbG9yIiwiWUVMTE9XIiwiYXJyb3dTdHJva2VDb2xvciIsIkJMQUNLIiwiYXJyb3dXaWR0aCIsImFycm93SGVpZ2h0IiwiYXJyb3dQYWRkaW5nIiwibmV4dCIsInByZXZpb3VzIiwiY3JlYXRlVG91Y2hBcmVhU2hhcGUiLCJzaGFwZSIsImlzUHJldmlvdXMiLCJoYXNOZXh0UHJvcGVydHkiLCJoYXNQcmV2aW91c1Byb3BlcnR5IiwicHJldmlvdXNTaGFwZSIsIm1vdmVUbyIsImxpbmVUbyIsImNsb3NlIiwicHJldmlvdXNLaXROb2RlIiwiZmlsbCIsInN0cm9rZSIsImN1cnNvciIsInRvdWNoQXJlYSIsImFkZElucHV0TGlzdGVuZXIiLCJmaXJlIiwidmFsdWUiLCJsaW5rIiwiYXZhaWxhYmxlIiwidmlzaWJsZSIsImFkZENoaWxkIiwibmV4dFNoYXBlIiwibmV4dEtpdE5vZGUiLCJtYXhIZWlnaHQiLCJNYXRoIiwibWF4IiwiaGVpZ2h0IiwiY2VudGVyWSIsIngiLCJyaWdodCIsIm11dGF0ZSIsInJlZ2lzdGVyIl0sIm1hcHBpbmdzIjoiQUFBQSxzREFBc0Q7QUFFdEQ7Ozs7O0NBS0MsR0FFRCxPQUFPQSxjQUFjLDRCQUE0QjtBQUNqRCxTQUFTQyxLQUFLLFFBQVEsMkJBQTJCO0FBQ2pELE9BQU9DLHdCQUF3QiwyQ0FBMkM7QUFDMUUsT0FBT0MsV0FBVyw4QkFBOEI7QUFDaEQsU0FBU0MsS0FBSyxFQUFFQyxZQUFZLEVBQUVDLElBQUksRUFBRUMsSUFBSSxRQUFRLDhCQUE4QjtBQUM5RSxPQUFPQyxpQkFBaUIsbUJBQW1CO0FBRTNDOzs7Q0FHQyxHQUNELElBQUEsQUFBTUMsNkJBQU4sTUFBTUEsbUNBQW1DSDtJQUV2Qzs7Ozs7Ozs7Ozs7R0FXQyxHQUNESSxZQUFhQyxVQUFVLEVBQUVDLFdBQVcsRUFBRUMsV0FBVyxDQUFHO1FBQ2xEQyxVQUFVWixtQkFBb0I7UUFFOUJVLGNBQWNULE1BQU87WUFDbkJZLFlBQVlYLE1BQU1ZLE1BQU07WUFDeEJDLGtCQUFrQmIsTUFBTWMsS0FBSztZQUM3QkMsWUFBWTtZQUNaQyxhQUFhO1lBQ2JDLGNBQWM7WUFDZEMsTUFBTTtZQUNOQyxVQUFVO1lBQ1ZDLHNCQUFzQixTQUFVQyxLQUFLLEVBQUVDLFVBQVU7Z0JBQy9DLE9BQU8sTUFBTSxxRUFBcUU7WUFDcEY7UUFDRixHQUFHZDtRQUVILEtBQUs7UUFFTCxVQUFVO1FBQ1YsSUFBSSxDQUFDZSxlQUFlLEdBQUcsSUFBSTNCLFNBQVU7UUFDckMsSUFBSSxDQUFDNEIsbUJBQW1CLEdBQUcsSUFBSTVCLFNBQVU7UUFFekMsTUFBTW1CLGFBQWFQLFlBQVlPLFVBQVU7UUFDekMsTUFBTUMsY0FBY1IsWUFBWVEsV0FBVztRQUUzQzs7a0ZBRThFLEdBRTlFLGdDQUFnQztRQUNoQyxNQUFNUyxnQkFBZ0IsSUFBSTVCLFFBQVE2QixNQUFNLENBQUUsR0FBR1YsY0FBYyxHQUN4RFcsTUFBTSxDQUFFWixZQUFZLEdBQ3BCWSxNQUFNLENBQUVaLFlBQVlDLGFBQ3BCWSxLQUFLO1FBRVIsTUFBTUMsa0JBQWtCLElBQUkxQixLQUFNc0IsZUFBZTtZQUMvQ0ssTUFBTXRCLFlBQVlHLFVBQVU7WUFDNUJvQixRQUFRdkIsWUFBWUssZ0JBQWdCO1lBQ3BDbUIsUUFBUTtZQUNSQyxXQUFXekIsWUFBWVksb0JBQW9CLENBQUVLLGVBQWU7UUFDOUQ7UUFDQUksZ0JBQWdCSyxnQkFBZ0IsQ0FBRSxJQUFJakMsYUFBYztZQUNsRGtDLE1BQU07Z0JBQ0osSUFBSyxJQUFJLENBQUNYLG1CQUFtQixDQUFDWSxLQUFLLEVBQUc7b0JBQ3BDNUIsWUFBWVcsUUFBUSxJQUFJWCxZQUFZVyxRQUFRO2dCQUM5QztZQUNGO1FBQ0Y7UUFDQSxJQUFJLENBQUNLLG1CQUFtQixDQUFDYSxJQUFJLENBQUVDLENBQUFBO1lBQzdCVCxnQkFBZ0JVLE9BQU8sR0FBR0Q7UUFDNUI7UUFFQSxJQUFJLENBQUNFLFFBQVEsQ0FBRVg7UUFFZjs7a0ZBRThFLEdBRTlFLElBQUksQ0FBQ1csUUFBUSxDQUFFakM7UUFFZjs7a0ZBRThFLEdBRTlFLGlDQUFpQztRQUNqQyxNQUFNa0MsWUFBWSxJQUFJNUMsUUFBUTZCLE1BQU0sQ0FBRVgsWUFBWUMsY0FBYyxHQUM3RFcsTUFBTSxDQUFFLEdBQUcsR0FDWEEsTUFBTSxDQUFFLEdBQUdYLGFBQ1hZLEtBQUs7UUFFUixNQUFNYyxjQUFjLElBQUl2QyxLQUFNc0MsV0FBVztZQUN2Q1gsTUFBTXRCLFlBQVlHLFVBQVU7WUFDNUJvQixRQUFRdkIsWUFBWUssZ0JBQWdCO1lBQ3BDbUIsUUFBUTtZQUNSQyxXQUFXekIsWUFBWVksb0JBQW9CLENBQUVxQixXQUFXO1FBQzFEO1FBQ0FDLFlBQVlSLGdCQUFnQixDQUFFLElBQUlqQyxhQUFjO1lBQzlDa0MsTUFBTTtnQkFDSixJQUFLLElBQUksQ0FBQ1osZUFBZSxDQUFDYSxLQUFLLEVBQUc7b0JBQ2hDNUIsWUFBWVUsSUFBSSxJQUFJVixZQUFZVSxJQUFJO2dCQUN0QztZQUNGO1FBQ0Y7UUFDQSxJQUFJLENBQUNLLGVBQWUsQ0FBQ2MsSUFBSSxDQUFFQyxDQUFBQTtZQUN6QkksWUFBWUgsT0FBTyxHQUFHRDtRQUN4QjtRQUVBLElBQUksQ0FBQ0UsUUFBUSxDQUFFRTtRQUVmOztrRkFFOEUsR0FFOUUsTUFBTUMsWUFBWUMsS0FBS0MsR0FBRyxDQUFFN0IsYUFBYVQsV0FBV3VDLE1BQU07UUFFMURqQixnQkFBZ0JrQixPQUFPLEdBQUdKLFlBQVk7UUFDdENwQyxXQUFXd0MsT0FBTyxHQUFHSixZQUFZO1FBQ2pDRCxZQUFZSyxPQUFPLEdBQUdKLFlBQVk7UUFFbEMseUJBQXlCO1FBQ3pCcEMsV0FBV3lDLENBQUMsR0FBR2pDLGFBQWFQLFlBQVlTLFlBQVk7UUFDcER5QixZQUFZTSxDQUFDLEdBQUd6QyxXQUFXMEMsS0FBSyxHQUFHekMsWUFBWVMsWUFBWTtRQUUzRCxJQUFJLENBQUNpQyxNQUFNLENBQUV6QztJQUNmO0FBQ0Y7QUFFQUwsWUFBWStDLFFBQVEsQ0FBRSw4QkFBOEI5QztBQUNwRCxlQUFlQSwyQkFBMkIifQ==