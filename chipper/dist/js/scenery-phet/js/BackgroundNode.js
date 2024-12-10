// Copyright 2022-2024, University of Colorado Boulder
/**
 * BackgroundNode puts a Node on a rectangular background, dynamically sized to fit the Node.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */ import optionize from '../../phet-core/js/optionize.js';
import { Node, Rectangle } from '../../scenery/js/imports.js';
import sceneryPhet from './sceneryPhet.js';
let BackgroundNode = class BackgroundNode extends Node {
    /**
   * @param node - the Node that will be put on the background
   * @param providedOptions
   */ constructor(node, providedOptions){
        const options = optionize()({
            // BackgroundNodeOptions
            xMargin: 2,
            yMargin: 2,
            rectangleOptions: {
                fill: 'white',
                opacity: 0.75
            }
        }, providedOptions);
        super();
        // translucent rectangle, initial size is arbitrary since it is resized below
        this.background = new Rectangle(0, 0, 1, 1, options.rectangleOptions);
        // Wrap the provided Node in a parent to avoid unneeded notifications in the bounds-change listener.
        const wrapperNode = new Node({
            children: [
                node
            ]
        });
        // Size the background rectangle to fit the Node.
        const boundsListener = (bounds)=>{
            if (!bounds.isEmpty()) {
                this.background.setRect(0, 0, node.width + 2 * options.xMargin, node.height + 2 * options.yMargin);
                wrapperNode.center = this.background.center;
            }
        };
        node.boundsProperty.link(boundsListener);
        this.disposeEmitter.addListener(()=>{
            if (node.boundsProperty.hasListener(boundsListener)) {
                node.boundsProperty.unlink(boundsListener);
            }
        });
        options.children = [
            this.background,
            wrapperNode
        ];
        this.mutate(options);
    }
};
export { BackgroundNode as default };
sceneryPhet.register('BackgroundNode', BackgroundNode);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9CYWNrZ3JvdW5kTm9kZS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAyMi0yMDI0LCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuLyoqXG4gKiBCYWNrZ3JvdW5kTm9kZSBwdXRzIGEgTm9kZSBvbiBhIHJlY3Rhbmd1bGFyIGJhY2tncm91bmQsIGR5bmFtaWNhbGx5IHNpemVkIHRvIGZpdCB0aGUgTm9kZS5cbiAqXG4gKiBAYXV0aG9yIENocmlzIE1hbGxleSAoUGl4ZWxab29tLCBJbmMuKVxuICogQGF1dGhvciBNaWNoYWVsIEthdXptYW5uIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxuICovXG5cbmltcG9ydCBCb3VuZHMyIGZyb20gJy4uLy4uL2RvdC9qcy9Cb3VuZHMyLmpzJztcbmltcG9ydCBvcHRpb25pemUgZnJvbSAnLi4vLi4vcGhldC1jb3JlL2pzL29wdGlvbml6ZS5qcyc7XG5pbXBvcnQgU3RyaWN0T21pdCBmcm9tICcuLi8uLi9waGV0LWNvcmUvanMvdHlwZXMvU3RyaWN0T21pdC5qcyc7XG5pbXBvcnQgeyBOb2RlLCBOb2RlT3B0aW9ucywgUmVjdGFuZ2xlLCBSZWN0YW5nbGVPcHRpb25zIH0gZnJvbSAnLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcbmltcG9ydCBzY2VuZXJ5UGhldCBmcm9tICcuL3NjZW5lcnlQaGV0LmpzJztcblxudHlwZSBTZWxmT3B0aW9ucyA9IHtcbiAgeE1hcmdpbj86IG51bWJlcjsgLy8gc2V0IHRoZSB4IG1hcmdpbiBiZXR3ZWVuIHRoZSBOb2RlIGNvbnRlbnQgYW5kIGJhY2tncm91bmQgZWRnZVxuICB5TWFyZ2luPzogbnVtYmVyOyAvLyBzZXQgdGhlIHkgbWFyZ2luIGJldHdlZW4gdGhlIE5vZGUgY29udGVudCBhbmQgYmFja2dyb3VuZCBlZGdlXG4gIHJlY3RhbmdsZU9wdGlvbnM/OiBSZWN0YW5nbGVPcHRpb25zOyAvLyBvcHRpb25zIHBhc3NlZCB0byB0aGUgYmFja2dyb3VuZCBwaGV0LnNjZW5lcnkuUmVjdGFuZ2xlXG59O1xuXG5leHBvcnQgdHlwZSBCYWNrZ3JvdW5kTm9kZU9wdGlvbnMgPSBTZWxmT3B0aW9ucyAmIFN0cmljdE9taXQ8Tm9kZU9wdGlvbnMsICdjaGlsZHJlbic+O1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBCYWNrZ3JvdW5kTm9kZSBleHRlbmRzIE5vZGUge1xuXG4gIHB1YmxpYyByZWFkb25seSBiYWNrZ3JvdW5kOiBSZWN0YW5nbGU7IC8vIFVuZm9ydHVuYXRlIHRoYXQgdGhpcyBpcyBwdWJsaWMgOihcblxuICAvKipcbiAgICogQHBhcmFtIG5vZGUgLSB0aGUgTm9kZSB0aGF0IHdpbGwgYmUgcHV0IG9uIHRoZSBiYWNrZ3JvdW5kXG4gICAqIEBwYXJhbSBwcm92aWRlZE9wdGlvbnNcbiAgICovXG4gIHB1YmxpYyBjb25zdHJ1Y3Rvciggbm9kZTogTm9kZSwgcHJvdmlkZWRPcHRpb25zPzogQmFja2dyb3VuZE5vZGVPcHRpb25zICkge1xuXG4gICAgY29uc3Qgb3B0aW9ucyA9IG9wdGlvbml6ZTxCYWNrZ3JvdW5kTm9kZU9wdGlvbnMsIFNlbGZPcHRpb25zLCBOb2RlT3B0aW9ucz4oKSgge1xuXG4gICAgICAvLyBCYWNrZ3JvdW5kTm9kZU9wdGlvbnNcbiAgICAgIHhNYXJnaW46IDIsXG4gICAgICB5TWFyZ2luOiAyLFxuICAgICAgcmVjdGFuZ2xlT3B0aW9uczoge1xuICAgICAgICBmaWxsOiAnd2hpdGUnLFxuICAgICAgICBvcGFjaXR5OiAwLjc1XG4gICAgICB9XG4gICAgfSwgcHJvdmlkZWRPcHRpb25zICk7XG5cbiAgICBzdXBlcigpO1xuXG4gICAgLy8gdHJhbnNsdWNlbnQgcmVjdGFuZ2xlLCBpbml0aWFsIHNpemUgaXMgYXJiaXRyYXJ5IHNpbmNlIGl0IGlzIHJlc2l6ZWQgYmVsb3dcbiAgICB0aGlzLmJhY2tncm91bmQgPSBuZXcgUmVjdGFuZ2xlKCAwLCAwLCAxLCAxLCBvcHRpb25zLnJlY3RhbmdsZU9wdGlvbnMgKTtcblxuICAgIC8vIFdyYXAgdGhlIHByb3ZpZGVkIE5vZGUgaW4gYSBwYXJlbnQgdG8gYXZvaWQgdW5uZWVkZWQgbm90aWZpY2F0aW9ucyBpbiB0aGUgYm91bmRzLWNoYW5nZSBsaXN0ZW5lci5cbiAgICBjb25zdCB3cmFwcGVyTm9kZSA9IG5ldyBOb2RlKCB7IGNoaWxkcmVuOiBbIG5vZGUgXSB9ICk7XG5cbiAgICAvLyBTaXplIHRoZSBiYWNrZ3JvdW5kIHJlY3RhbmdsZSB0byBmaXQgdGhlIE5vZGUuXG4gICAgY29uc3QgYm91bmRzTGlzdGVuZXIgPSAoIGJvdW5kczogQm91bmRzMiApID0+IHtcbiAgICAgIGlmICggIWJvdW5kcy5pc0VtcHR5KCkgKSB7XG4gICAgICAgIHRoaXMuYmFja2dyb3VuZC5zZXRSZWN0KCAwLCAwLCBub2RlLndpZHRoICsgMiAqIG9wdGlvbnMueE1hcmdpbiwgbm9kZS5oZWlnaHQgKyAyICogb3B0aW9ucy55TWFyZ2luICk7XG4gICAgICAgIHdyYXBwZXJOb2RlLmNlbnRlciA9IHRoaXMuYmFja2dyb3VuZC5jZW50ZXI7XG4gICAgICB9XG4gICAgfTtcbiAgICBub2RlLmJvdW5kc1Byb3BlcnR5LmxpbmsoIGJvdW5kc0xpc3RlbmVyICk7XG5cbiAgICB0aGlzLmRpc3Bvc2VFbWl0dGVyLmFkZExpc3RlbmVyKCAoKSA9PiB7XG4gICAgICBpZiAoIG5vZGUuYm91bmRzUHJvcGVydHkuaGFzTGlzdGVuZXIoIGJvdW5kc0xpc3RlbmVyICkgKSB7XG4gICAgICAgIG5vZGUuYm91bmRzUHJvcGVydHkudW5saW5rKCBib3VuZHNMaXN0ZW5lciApO1xuICAgICAgfVxuICAgIH0gKTtcblxuICAgIG9wdGlvbnMuY2hpbGRyZW4gPSBbIHRoaXMuYmFja2dyb3VuZCwgd3JhcHBlck5vZGUgXTtcbiAgICB0aGlzLm11dGF0ZSggb3B0aW9ucyApO1xuICB9XG59XG5cbnNjZW5lcnlQaGV0LnJlZ2lzdGVyKCAnQmFja2dyb3VuZE5vZGUnLCBCYWNrZ3JvdW5kTm9kZSApOyJdLCJuYW1lcyI6WyJvcHRpb25pemUiLCJOb2RlIiwiUmVjdGFuZ2xlIiwic2NlbmVyeVBoZXQiLCJCYWNrZ3JvdW5kTm9kZSIsIm5vZGUiLCJwcm92aWRlZE9wdGlvbnMiLCJvcHRpb25zIiwieE1hcmdpbiIsInlNYXJnaW4iLCJyZWN0YW5nbGVPcHRpb25zIiwiZmlsbCIsIm9wYWNpdHkiLCJiYWNrZ3JvdW5kIiwid3JhcHBlck5vZGUiLCJjaGlsZHJlbiIsImJvdW5kc0xpc3RlbmVyIiwiYm91bmRzIiwiaXNFbXB0eSIsInNldFJlY3QiLCJ3aWR0aCIsImhlaWdodCIsImNlbnRlciIsImJvdW5kc1Byb3BlcnR5IiwibGluayIsImRpc3Bvc2VFbWl0dGVyIiwiYWRkTGlzdGVuZXIiLCJoYXNMaXN0ZW5lciIsInVubGluayIsIm11dGF0ZSIsInJlZ2lzdGVyIl0sIm1hcHBpbmdzIjoiQUFBQSxzREFBc0Q7QUFFdEQ7Ozs7O0NBS0MsR0FHRCxPQUFPQSxlQUFlLGtDQUFrQztBQUV4RCxTQUFTQyxJQUFJLEVBQWVDLFNBQVMsUUFBMEIsOEJBQThCO0FBQzdGLE9BQU9DLGlCQUFpQixtQkFBbUI7QUFVNUIsSUFBQSxBQUFNQyxpQkFBTixNQUFNQSx1QkFBdUJIO0lBSTFDOzs7R0FHQyxHQUNELFlBQW9CSSxJQUFVLEVBQUVDLGVBQXVDLENBQUc7UUFFeEUsTUFBTUMsVUFBVVAsWUFBOEQ7WUFFNUUsd0JBQXdCO1lBQ3hCUSxTQUFTO1lBQ1RDLFNBQVM7WUFDVEMsa0JBQWtCO2dCQUNoQkMsTUFBTTtnQkFDTkMsU0FBUztZQUNYO1FBQ0YsR0FBR047UUFFSCxLQUFLO1FBRUwsNkVBQTZFO1FBQzdFLElBQUksQ0FBQ08sVUFBVSxHQUFHLElBQUlYLFVBQVcsR0FBRyxHQUFHLEdBQUcsR0FBR0ssUUFBUUcsZ0JBQWdCO1FBRXJFLG9HQUFvRztRQUNwRyxNQUFNSSxjQUFjLElBQUliLEtBQU07WUFBRWMsVUFBVTtnQkFBRVY7YUFBTTtRQUFDO1FBRW5ELGlEQUFpRDtRQUNqRCxNQUFNVyxpQkFBaUIsQ0FBRUM7WUFDdkIsSUFBSyxDQUFDQSxPQUFPQyxPQUFPLElBQUs7Z0JBQ3ZCLElBQUksQ0FBQ0wsVUFBVSxDQUFDTSxPQUFPLENBQUUsR0FBRyxHQUFHZCxLQUFLZSxLQUFLLEdBQUcsSUFBSWIsUUFBUUMsT0FBTyxFQUFFSCxLQUFLZ0IsTUFBTSxHQUFHLElBQUlkLFFBQVFFLE9BQU87Z0JBQ2xHSyxZQUFZUSxNQUFNLEdBQUcsSUFBSSxDQUFDVCxVQUFVLENBQUNTLE1BQU07WUFDN0M7UUFDRjtRQUNBakIsS0FBS2tCLGNBQWMsQ0FBQ0MsSUFBSSxDQUFFUjtRQUUxQixJQUFJLENBQUNTLGNBQWMsQ0FBQ0MsV0FBVyxDQUFFO1lBQy9CLElBQUtyQixLQUFLa0IsY0FBYyxDQUFDSSxXQUFXLENBQUVYLGlCQUFtQjtnQkFDdkRYLEtBQUtrQixjQUFjLENBQUNLLE1BQU0sQ0FBRVo7WUFDOUI7UUFDRjtRQUVBVCxRQUFRUSxRQUFRLEdBQUc7WUFBRSxJQUFJLENBQUNGLFVBQVU7WUFBRUM7U0FBYTtRQUNuRCxJQUFJLENBQUNlLE1BQU0sQ0FBRXRCO0lBQ2Y7QUFDRjtBQS9DQSxTQUFxQkgsNEJBK0NwQjtBQUVERCxZQUFZMkIsUUFBUSxDQUFFLGtCQUFrQjFCIn0=