// Copyright 2022-2024, University of Colorado Boulder
/**
 * Demo for LaserPointerNode
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */ import Property from '../../../../axon/js/Property.js';
import { Node, Rectangle } from '../../../../scenery/js/imports.js';
import LaserPointerNode from '../../LaserPointerNode.js';
export default function demoLaserPointerNode(layoutBounds) {
    const leftOnProperty = new Property(false);
    const rightOnProperty = new Property(false);
    // Demonstrate how to adjust lighting
    const leftLaserNode = new LaserPointerNode(leftOnProperty, {
        // these options adjust the lighting
        topColor: LaserPointerNode.DEFAULT_LASER_NODE_OPTIONS.bottomColor,
        bottomColor: LaserPointerNode.DEFAULT_LASER_NODE_OPTIONS.topColor,
        highlightColorStop: 1 - LaserPointerNode.DEFAULT_LASER_NODE_OPTIONS.highlightColorStop,
        buttonOptions: {
            rotation: Math.PI
        },
        rotation: Math.PI,
        right: layoutBounds.centerX - 20,
        centerY: layoutBounds.centerY
    });
    const rightLaserNode = new LaserPointerNode(rightOnProperty, {
        left: layoutBounds.centerX + 20,
        centerY: layoutBounds.centerY,
        hasGlass: true
    });
    const leftBeamNode = new Rectangle(0, 0, 1000, 40, {
        fill: 'yellow',
        right: leftLaserNode.centerX,
        centerY: leftLaserNode.centerY
    });
    const rightBeamNode = new Rectangle(0, 0, 1000, 40, {
        fill: 'yellow',
        left: rightLaserNode.centerX,
        centerY: rightLaserNode.centerY
    });
    leftOnProperty.link((on)=>{
        leftBeamNode.visible = on;
    });
    rightOnProperty.link((on)=>{
        rightBeamNode.visible = on;
    });
    return new Node({
        children: [
            leftBeamNode,
            leftLaserNode,
            rightBeamNode,
            rightLaserNode
        ]
    });
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9kZW1vL2NvbXBvbmVudHMvZGVtb0xhc2VyUG9pbnRlck5vZGUudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjItMjAyNCwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbi8qKlxuICogRGVtbyBmb3IgTGFzZXJQb2ludGVyTm9kZVxuICpcbiAqIEBhdXRob3IgQ2hyaXMgTWFsbGV5IChQaXhlbFpvb20sIEluYy4pXG4gKi9cblxuaW1wb3J0IFByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvUHJvcGVydHkuanMnO1xuaW1wb3J0IEJvdW5kczIgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL0JvdW5kczIuanMnO1xuaW1wb3J0IHsgTm9kZSwgUmVjdGFuZ2xlIH0gZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcbmltcG9ydCBMYXNlclBvaW50ZXJOb2RlIGZyb20gJy4uLy4uL0xhc2VyUG9pbnRlck5vZGUuanMnO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBkZW1vTGFzZXJQb2ludGVyTm9kZSggbGF5b3V0Qm91bmRzOiBCb3VuZHMyICk6IE5vZGUge1xuXG5cbiAgY29uc3QgbGVmdE9uUHJvcGVydHkgPSBuZXcgUHJvcGVydHkoIGZhbHNlICk7XG4gIGNvbnN0IHJpZ2h0T25Qcm9wZXJ0eSA9IG5ldyBQcm9wZXJ0eSggZmFsc2UgKTtcblxuICAvLyBEZW1vbnN0cmF0ZSBob3cgdG8gYWRqdXN0IGxpZ2h0aW5nXG4gIGNvbnN0IGxlZnRMYXNlck5vZGUgPSBuZXcgTGFzZXJQb2ludGVyTm9kZSggbGVmdE9uUHJvcGVydHksIHtcblxuICAgIC8vIHRoZXNlIG9wdGlvbnMgYWRqdXN0IHRoZSBsaWdodGluZ1xuICAgIHRvcENvbG9yOiBMYXNlclBvaW50ZXJOb2RlLkRFRkFVTFRfTEFTRVJfTk9ERV9PUFRJT05TLmJvdHRvbUNvbG9yLFxuICAgIGJvdHRvbUNvbG9yOiBMYXNlclBvaW50ZXJOb2RlLkRFRkFVTFRfTEFTRVJfTk9ERV9PUFRJT05TLnRvcENvbG9yLFxuICAgIGhpZ2hsaWdodENvbG9yU3RvcDogMSAtIExhc2VyUG9pbnRlck5vZGUuREVGQVVMVF9MQVNFUl9OT0RFX09QVElPTlMuaGlnaGxpZ2h0Q29sb3JTdG9wLFxuICAgIGJ1dHRvbk9wdGlvbnM6IHtcbiAgICAgIHJvdGF0aW9uOiBNYXRoLlBJXG4gICAgfSxcbiAgICByb3RhdGlvbjogTWF0aC5QSSxcbiAgICByaWdodDogbGF5b3V0Qm91bmRzLmNlbnRlclggLSAyMCxcbiAgICBjZW50ZXJZOiBsYXlvdXRCb3VuZHMuY2VudGVyWVxuICB9ICk7XG5cbiAgY29uc3QgcmlnaHRMYXNlck5vZGUgPSBuZXcgTGFzZXJQb2ludGVyTm9kZSggcmlnaHRPblByb3BlcnR5LCB7XG4gICAgbGVmdDogbGF5b3V0Qm91bmRzLmNlbnRlclggKyAyMCxcbiAgICBjZW50ZXJZOiBsYXlvdXRCb3VuZHMuY2VudGVyWSxcbiAgICBoYXNHbGFzczogdHJ1ZVxuICB9ICk7XG5cbiAgY29uc3QgbGVmdEJlYW1Ob2RlID0gbmV3IFJlY3RhbmdsZSggMCwgMCwgMTAwMCwgNDAsIHtcbiAgICBmaWxsOiAneWVsbG93JyxcbiAgICByaWdodDogbGVmdExhc2VyTm9kZS5jZW50ZXJYLFxuICAgIGNlbnRlclk6IGxlZnRMYXNlck5vZGUuY2VudGVyWVxuICB9ICk7XG5cbiAgY29uc3QgcmlnaHRCZWFtTm9kZSA9IG5ldyBSZWN0YW5nbGUoIDAsIDAsIDEwMDAsIDQwLCB7XG4gICAgZmlsbDogJ3llbGxvdycsXG4gICAgbGVmdDogcmlnaHRMYXNlck5vZGUuY2VudGVyWCxcbiAgICBjZW50ZXJZOiByaWdodExhc2VyTm9kZS5jZW50ZXJZXG4gIH0gKTtcblxuICBsZWZ0T25Qcm9wZXJ0eS5saW5rKCBvbiA9PiB7XG4gICAgbGVmdEJlYW1Ob2RlLnZpc2libGUgPSBvbjtcbiAgfSApO1xuICByaWdodE9uUHJvcGVydHkubGluayggb24gPT4ge1xuICAgIHJpZ2h0QmVhbU5vZGUudmlzaWJsZSA9IG9uO1xuICB9ICk7XG5cbiAgcmV0dXJuIG5ldyBOb2RlKCB7IGNoaWxkcmVuOiBbIGxlZnRCZWFtTm9kZSwgbGVmdExhc2VyTm9kZSwgcmlnaHRCZWFtTm9kZSwgcmlnaHRMYXNlck5vZGUgXSB9ICk7XG59Il0sIm5hbWVzIjpbIlByb3BlcnR5IiwiTm9kZSIsIlJlY3RhbmdsZSIsIkxhc2VyUG9pbnRlck5vZGUiLCJkZW1vTGFzZXJQb2ludGVyTm9kZSIsImxheW91dEJvdW5kcyIsImxlZnRPblByb3BlcnR5IiwicmlnaHRPblByb3BlcnR5IiwibGVmdExhc2VyTm9kZSIsInRvcENvbG9yIiwiREVGQVVMVF9MQVNFUl9OT0RFX09QVElPTlMiLCJib3R0b21Db2xvciIsImhpZ2hsaWdodENvbG9yU3RvcCIsImJ1dHRvbk9wdGlvbnMiLCJyb3RhdGlvbiIsIk1hdGgiLCJQSSIsInJpZ2h0IiwiY2VudGVyWCIsImNlbnRlclkiLCJyaWdodExhc2VyTm9kZSIsImxlZnQiLCJoYXNHbGFzcyIsImxlZnRCZWFtTm9kZSIsImZpbGwiLCJyaWdodEJlYW1Ob2RlIiwibGluayIsIm9uIiwidmlzaWJsZSIsImNoaWxkcmVuIl0sIm1hcHBpbmdzIjoiQUFBQSxzREFBc0Q7QUFFdEQ7Ozs7Q0FJQyxHQUVELE9BQU9BLGNBQWMsa0NBQWtDO0FBRXZELFNBQVNDLElBQUksRUFBRUMsU0FBUyxRQUFRLG9DQUFvQztBQUNwRSxPQUFPQyxzQkFBc0IsNEJBQTRCO0FBRXpELGVBQWUsU0FBU0MscUJBQXNCQyxZQUFxQjtJQUdqRSxNQUFNQyxpQkFBaUIsSUFBSU4sU0FBVTtJQUNyQyxNQUFNTyxrQkFBa0IsSUFBSVAsU0FBVTtJQUV0QyxxQ0FBcUM7SUFDckMsTUFBTVEsZ0JBQWdCLElBQUlMLGlCQUFrQkcsZ0JBQWdCO1FBRTFELG9DQUFvQztRQUNwQ0csVUFBVU4saUJBQWlCTywwQkFBMEIsQ0FBQ0MsV0FBVztRQUNqRUEsYUFBYVIsaUJBQWlCTywwQkFBMEIsQ0FBQ0QsUUFBUTtRQUNqRUcsb0JBQW9CLElBQUlULGlCQUFpQk8sMEJBQTBCLENBQUNFLGtCQUFrQjtRQUN0RkMsZUFBZTtZQUNiQyxVQUFVQyxLQUFLQyxFQUFFO1FBQ25CO1FBQ0FGLFVBQVVDLEtBQUtDLEVBQUU7UUFDakJDLE9BQU9aLGFBQWFhLE9BQU8sR0FBRztRQUM5QkMsU0FBU2QsYUFBYWMsT0FBTztJQUMvQjtJQUVBLE1BQU1DLGlCQUFpQixJQUFJakIsaUJBQWtCSSxpQkFBaUI7UUFDNURjLE1BQU1oQixhQUFhYSxPQUFPLEdBQUc7UUFDN0JDLFNBQVNkLGFBQWFjLE9BQU87UUFDN0JHLFVBQVU7SUFDWjtJQUVBLE1BQU1DLGVBQWUsSUFBSXJCLFVBQVcsR0FBRyxHQUFHLE1BQU0sSUFBSTtRQUNsRHNCLE1BQU07UUFDTlAsT0FBT1QsY0FBY1UsT0FBTztRQUM1QkMsU0FBU1gsY0FBY1csT0FBTztJQUNoQztJQUVBLE1BQU1NLGdCQUFnQixJQUFJdkIsVUFBVyxHQUFHLEdBQUcsTUFBTSxJQUFJO1FBQ25Ec0IsTUFBTTtRQUNOSCxNQUFNRCxlQUFlRixPQUFPO1FBQzVCQyxTQUFTQyxlQUFlRCxPQUFPO0lBQ2pDO0lBRUFiLGVBQWVvQixJQUFJLENBQUVDLENBQUFBO1FBQ25CSixhQUFhSyxPQUFPLEdBQUdEO0lBQ3pCO0lBQ0FwQixnQkFBZ0JtQixJQUFJLENBQUVDLENBQUFBO1FBQ3BCRixjQUFjRyxPQUFPLEdBQUdEO0lBQzFCO0lBRUEsT0FBTyxJQUFJMUIsS0FBTTtRQUFFNEIsVUFBVTtZQUFFTjtZQUFjZjtZQUFlaUI7WUFBZUw7U0FBZ0I7SUFBQztBQUM5RiJ9