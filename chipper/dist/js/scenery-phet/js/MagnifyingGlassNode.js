// Copyright 2020-2024, University of Colorado Boulder
/**
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */ import optionize from '../../phet-core/js/optionize.js';
import { Circle, Line, Node } from '../../scenery/js/imports.js';
import sceneryPhet from './sceneryPhet.js';
let MagnifyingGlassNode = class MagnifyingGlassNode extends Node {
    constructor(providedOptions){
        const options = optionize()({
            // SelfOptions
            glassRadius: 15,
            glassFill: 'white',
            glassStroke: 'black',
            icon: null
        }, providedOptions);
        // the magnifying glass
        const glassLineWidth = 0.25 * options.glassRadius;
        const glassNode = new Circle(options.glassRadius, {
            fill: options.glassFill,
            stroke: options.glassStroke,
            lineWidth: glassLineWidth
        });
        // handle at lower-left of glass, at a 45-degree angle
        const outsideRadius = options.glassRadius + glassLineWidth / 2; // use outside radius so handle line cap doesn't appear inside glassNode
        const handleNode = new Line(outsideRadius * Math.cos(Math.PI / 4), outsideRadius * Math.sin(Math.PI / 4), options.glassRadius * Math.cos(Math.PI / 4) + 0.65 * options.glassRadius, options.glassRadius * Math.sin(Math.PI / 4) + 0.65 * options.glassRadius, {
            stroke: options.glassStroke,
            lineWidth: 0.4 * options.glassRadius,
            lineCap: 'round'
        });
        options.children = [
            glassNode,
            handleNode
        ];
        if (options.icon) {
            options.icon.center = glassNode.center;
            options.children.push(options.icon);
        }
        super(options);
    }
};
export { MagnifyingGlassNode as default };
sceneryPhet.register('MagnifyingGlassNode', MagnifyingGlassNode);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9NYWduaWZ5aW5nR2xhc3NOb2RlLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDIwLTIwMjQsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqXG4gKiBAYXV0aG9yIFNhbSBSZWlkIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxuICovXG5cbmltcG9ydCBvcHRpb25pemUgZnJvbSAnLi4vLi4vcGhldC1jb3JlL2pzL29wdGlvbml6ZS5qcyc7XG5pbXBvcnQgU3RyaWN0T21pdCBmcm9tICcuLi8uLi9waGV0LWNvcmUvanMvdHlwZXMvU3RyaWN0T21pdC5qcyc7XG5pbXBvcnQgeyBDaXJjbGUsIExpbmUsIE5vZGUsIE5vZGVPcHRpb25zLCBUQ29sb3IgfSBmcm9tICcuLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xuaW1wb3J0IHNjZW5lcnlQaGV0IGZyb20gJy4vc2NlbmVyeVBoZXQuanMnO1xuXG50eXBlIFNlbGZPcHRpb25zID0ge1xuICBnbGFzc1JhZGl1cz86IG51bWJlcjtcbiAgZ2xhc3NGaWxsPzogVENvbG9yOyAvLyBjZW50ZXIgb2YgdGhlIGdsYXNzXG4gIGdsYXNzU3Ryb2tlPzogVENvbG9yOyAvLyByaW0gYW5kIGhhbmRsZVxuICBpY29uPzogTm9kZSB8IG51bGw7IC8vIG9wdGlvbmFsIGljb24gd2lsbCBiZSBjZW50ZXJlZCBpbiB0aGUgZ2xhc3MgYXJlYSwgaWYgcHJvdmlkZWRcbn07XG5cbmV4cG9ydCB0eXBlIE1hZ25pZnlpbmdHbGFzc05vZGVPcHRpb25zID0gU2VsZk9wdGlvbnMgJiBTdHJpY3RPbWl0PE5vZGVPcHRpb25zLCAnY2hpbGRyZW4nPjtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgTWFnbmlmeWluZ0dsYXNzTm9kZSBleHRlbmRzIE5vZGUge1xuXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggcHJvdmlkZWRPcHRpb25zOiBNYWduaWZ5aW5nR2xhc3NOb2RlT3B0aW9ucyApIHtcblxuICAgIGNvbnN0IG9wdGlvbnMgPSBvcHRpb25pemU8TWFnbmlmeWluZ0dsYXNzTm9kZU9wdGlvbnMsIFNlbGZPcHRpb25zLCBOb2RlT3B0aW9ucz4oKSgge1xuXG4gICAgICAvLyBTZWxmT3B0aW9uc1xuICAgICAgZ2xhc3NSYWRpdXM6IDE1LFxuICAgICAgZ2xhc3NGaWxsOiAnd2hpdGUnLFxuICAgICAgZ2xhc3NTdHJva2U6ICdibGFjaycsXG4gICAgICBpY29uOiBudWxsXG4gICAgfSwgcHJvdmlkZWRPcHRpb25zICk7XG5cbiAgICAvLyB0aGUgbWFnbmlmeWluZyBnbGFzc1xuICAgIGNvbnN0IGdsYXNzTGluZVdpZHRoID0gMC4yNSAqIG9wdGlvbnMuZ2xhc3NSYWRpdXM7XG4gICAgY29uc3QgZ2xhc3NOb2RlID0gbmV3IENpcmNsZSggb3B0aW9ucy5nbGFzc1JhZGl1cywge1xuICAgICAgZmlsbDogb3B0aW9ucy5nbGFzc0ZpbGwsXG4gICAgICBzdHJva2U6IG9wdGlvbnMuZ2xhc3NTdHJva2UsXG4gICAgICBsaW5lV2lkdGg6IGdsYXNzTGluZVdpZHRoXG4gICAgfSApO1xuXG4gICAgLy8gaGFuZGxlIGF0IGxvd2VyLWxlZnQgb2YgZ2xhc3MsIGF0IGEgNDUtZGVncmVlIGFuZ2xlXG4gICAgY29uc3Qgb3V0c2lkZVJhZGl1cyA9IG9wdGlvbnMuZ2xhc3NSYWRpdXMgKyAoIGdsYXNzTGluZVdpZHRoIC8gMiApOyAvLyB1c2Ugb3V0c2lkZSByYWRpdXMgc28gaGFuZGxlIGxpbmUgY2FwIGRvZXNuJ3QgYXBwZWFyIGluc2lkZSBnbGFzc05vZGVcbiAgICBjb25zdCBoYW5kbGVOb2RlID0gbmV3IExpbmUoXG4gICAgICBvdXRzaWRlUmFkaXVzICogTWF0aC5jb3MoIE1hdGguUEkgLyA0ICksIG91dHNpZGVSYWRpdXMgKiBNYXRoLnNpbiggTWF0aC5QSSAvIDQgKSxcbiAgICAgIG9wdGlvbnMuZ2xhc3NSYWRpdXMgKiBNYXRoLmNvcyggTWF0aC5QSSAvIDQgKSArICggMC42NSAqIG9wdGlvbnMuZ2xhc3NSYWRpdXMgKSwgb3B0aW9ucy5nbGFzc1JhZGl1cyAqIE1hdGguc2luKCBNYXRoLlBJIC8gNCApICsgKCAwLjY1ICogb3B0aW9ucy5nbGFzc1JhZGl1cyApLCB7XG4gICAgICAgIHN0cm9rZTogb3B0aW9ucy5nbGFzc1N0cm9rZSxcbiAgICAgICAgbGluZVdpZHRoOiAwLjQgKiBvcHRpb25zLmdsYXNzUmFkaXVzLFxuICAgICAgICBsaW5lQ2FwOiAncm91bmQnXG4gICAgICB9ICk7XG5cbiAgICBvcHRpb25zLmNoaWxkcmVuID0gWyBnbGFzc05vZGUsIGhhbmRsZU5vZGUgXTtcblxuICAgIGlmICggb3B0aW9ucy5pY29uICkge1xuICAgICAgb3B0aW9ucy5pY29uLmNlbnRlciA9IGdsYXNzTm9kZS5jZW50ZXI7XG4gICAgICBvcHRpb25zLmNoaWxkcmVuLnB1c2goIG9wdGlvbnMuaWNvbiApO1xuICAgIH1cblxuICAgIHN1cGVyKCBvcHRpb25zICk7XG4gIH1cbn1cblxuc2NlbmVyeVBoZXQucmVnaXN0ZXIoICdNYWduaWZ5aW5nR2xhc3NOb2RlJywgTWFnbmlmeWluZ0dsYXNzTm9kZSApOyJdLCJuYW1lcyI6WyJvcHRpb25pemUiLCJDaXJjbGUiLCJMaW5lIiwiTm9kZSIsInNjZW5lcnlQaGV0IiwiTWFnbmlmeWluZ0dsYXNzTm9kZSIsInByb3ZpZGVkT3B0aW9ucyIsIm9wdGlvbnMiLCJnbGFzc1JhZGl1cyIsImdsYXNzRmlsbCIsImdsYXNzU3Ryb2tlIiwiaWNvbiIsImdsYXNzTGluZVdpZHRoIiwiZ2xhc3NOb2RlIiwiZmlsbCIsInN0cm9rZSIsImxpbmVXaWR0aCIsIm91dHNpZGVSYWRpdXMiLCJoYW5kbGVOb2RlIiwiTWF0aCIsImNvcyIsIlBJIiwic2luIiwibGluZUNhcCIsImNoaWxkcmVuIiwiY2VudGVyIiwicHVzaCIsInJlZ2lzdGVyIl0sIm1hcHBpbmdzIjoiQUFBQSxzREFBc0Q7QUFFdEQ7OztDQUdDLEdBRUQsT0FBT0EsZUFBZSxrQ0FBa0M7QUFFeEQsU0FBU0MsTUFBTSxFQUFFQyxJQUFJLEVBQUVDLElBQUksUUFBNkIsOEJBQThCO0FBQ3RGLE9BQU9DLGlCQUFpQixtQkFBbUI7QUFXNUIsSUFBQSxBQUFNQyxzQkFBTixNQUFNQSw0QkFBNEJGO0lBRS9DLFlBQW9CRyxlQUEyQyxDQUFHO1FBRWhFLE1BQU1DLFVBQVVQLFlBQW1FO1lBRWpGLGNBQWM7WUFDZFEsYUFBYTtZQUNiQyxXQUFXO1lBQ1hDLGFBQWE7WUFDYkMsTUFBTTtRQUNSLEdBQUdMO1FBRUgsdUJBQXVCO1FBQ3ZCLE1BQU1NLGlCQUFpQixPQUFPTCxRQUFRQyxXQUFXO1FBQ2pELE1BQU1LLFlBQVksSUFBSVosT0FBUU0sUUFBUUMsV0FBVyxFQUFFO1lBQ2pETSxNQUFNUCxRQUFRRSxTQUFTO1lBQ3ZCTSxRQUFRUixRQUFRRyxXQUFXO1lBQzNCTSxXQUFXSjtRQUNiO1FBRUEsc0RBQXNEO1FBQ3RELE1BQU1LLGdCQUFnQlYsUUFBUUMsV0FBVyxHQUFLSSxpQkFBaUIsR0FBSyx3RUFBd0U7UUFDNUksTUFBTU0sYUFBYSxJQUFJaEIsS0FDckJlLGdCQUFnQkUsS0FBS0MsR0FBRyxDQUFFRCxLQUFLRSxFQUFFLEdBQUcsSUFBS0osZ0JBQWdCRSxLQUFLRyxHQUFHLENBQUVILEtBQUtFLEVBQUUsR0FBRyxJQUM3RWQsUUFBUUMsV0FBVyxHQUFHVyxLQUFLQyxHQUFHLENBQUVELEtBQUtFLEVBQUUsR0FBRyxLQUFRLE9BQU9kLFFBQVFDLFdBQVcsRUFBSUQsUUFBUUMsV0FBVyxHQUFHVyxLQUFLRyxHQUFHLENBQUVILEtBQUtFLEVBQUUsR0FBRyxLQUFRLE9BQU9kLFFBQVFDLFdBQVcsRUFBSTtZQUM5Sk8sUUFBUVIsUUFBUUcsV0FBVztZQUMzQk0sV0FBVyxNQUFNVCxRQUFRQyxXQUFXO1lBQ3BDZSxTQUFTO1FBQ1g7UUFFRmhCLFFBQVFpQixRQUFRLEdBQUc7WUFBRVg7WUFBV0s7U0FBWTtRQUU1QyxJQUFLWCxRQUFRSSxJQUFJLEVBQUc7WUFDbEJKLFFBQVFJLElBQUksQ0FBQ2MsTUFBTSxHQUFHWixVQUFVWSxNQUFNO1lBQ3RDbEIsUUFBUWlCLFFBQVEsQ0FBQ0UsSUFBSSxDQUFFbkIsUUFBUUksSUFBSTtRQUNyQztRQUVBLEtBQUssQ0FBRUo7SUFDVDtBQUNGO0FBeENBLFNBQXFCRixpQ0F3Q3BCO0FBRURELFlBQVl1QixRQUFRLENBQUUsdUJBQXVCdEIifQ==