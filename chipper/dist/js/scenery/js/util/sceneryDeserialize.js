// Copyright 2022-2024, University of Colorado Boulder
/**
 * Used by the scenery inspector
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ import Property from '../../../axon/js/Property.js';
import TinyProperty from '../../../axon/js/TinyProperty.js';
import Bounds2 from '../../../dot/js/Bounds2.js';
import Matrix3 from '../../../dot/js/Matrix3.js';
import Vector2 from '../../../dot/js/Vector2.js';
import { Shape } from '../../../kite/js/imports.js';
import MipmapElement from '../../../phet-core/js/MipmapElement.js';
import { Circle, Color, DOM, Image, Line, LinearGradient, Node, Path, Pattern, RadialGradient, Rectangle, scenery, Text } from '../imports.js';
const sceneryDeserialize = (value)=>{
    const nodeTypes = [
        'Node',
        'Path',
        'Circle',
        'Line',
        'Rectangle',
        'Text',
        'Image',
        'CanvasNode',
        'WebGLNode',
        'DOM'
    ];
    if (value.type === 'Vector2') {
        return new Vector2(value.x, value.y);
    }
    if (value.type === 'Matrix3') {
        return new Matrix3().rowMajor(value.m00, value.m01, value.m02, value.m10, value.m11, value.m12, value.m20, value.m21, value.m22);
    } else if (value.type === 'Bounds2') {
        return new Bounds2(value.minX, value.minY, value.maxX, value.maxY);
    } else if (value.type === 'Shape') {
        return new Shape(value.path);
    } else if (value.type === 'Array') {
        return value.value.map(sceneryDeserialize);
    } else if (value.type === 'Color') {
        return new Color(value.red, value.green, value.blue, value.alpha);
    } else if (value.type === 'Property') {
        return new Property(sceneryDeserialize(value.value));
    } else if (value.type === 'TinyProperty') {
        return new TinyProperty(sceneryDeserialize(value.value));
    } else if (value.type === 'Pattern' || value.type === 'LinearGradient' || value.type === 'RadialGradient') {
        let paint;
        if (value.type === 'Pattern') {
            const img = new window.Image();
            img.src = value.url;
            paint = new Pattern(img);
        } else {
            const start = sceneryDeserialize(value.start);
            const end = sceneryDeserialize(value.end);
            if (value.type === 'LinearGradient') {
                paint = new LinearGradient(start.x, start.y, end.x, end.y);
            } else if (value.type === 'RadialGradient') {
                paint = new RadialGradient(start.x, start.y, value.startRadius, end.x, end.y, value.endRadius);
            }
            value.stops.forEach((stop)=>{
                paint.addColorStop(stop.ratio, sceneryDeserialize(stop.stop));
            });
        }
        if (value.transformMatrix) {
            paint.setTransformMatrix(sceneryDeserialize(value.transformMatrix));
        }
        return paint;
    } else if (_.includes(nodeTypes, value.type)) {
        let node;
        const setup = value.setup;
        if (value.type === 'Node') {
            node = new Node();
        } else if (value.type === 'Path') {
            node = new Path(sceneryDeserialize(setup.path));
        } else if (value.type === 'Circle') {
            node = new Circle({});
        } else if (value.type === 'Line') {
            node = new Line({});
        } else if (value.type === 'Rectangle') {
            node = new Rectangle({});
        } else if (value.type === 'Text') {
            node = new Text('');
        } else if (value.type === 'Image') {
            if (setup.imageType === 'image' || setup.imageType === 'canvas') {
                node = new Image(setup.src);
                if (setup.generateMipmaps) {
                    node.mipmap = true;
                }
            } else if (setup.imageType === 'mipmapData') {
                const mipmapData = setup.mipmapData.map((level)=>{
                    return new MipmapElement(level.width, level.height, level.url, false);
                });
                node = new Image(mipmapData);
            }
            node.initialWidth = setup.width;
            node.initialHeight = setup.height;
        } else if (value.type === 'CanvasNode' || value.type === 'WebGLNode') {
            // TODO: Record Canvas/WebGL calls? (conditionals would be harder!) https://github.com/phetsims/scenery/issues/1581
            node = new Node({
                children: [
                    new Image(setup.url, {
                        translation: sceneryDeserialize(setup.offset),
                        scale: 1 / setup.scale
                    })
                ]
            });
        } else if (value.type === 'DOM') {
            const div = document.createElement('div');
            div.innerHTML = value.element;
            const element = div.childNodes[0];
            div.removeChild(element);
            if (value.dataURL) {
                const img = new window.Image();
                img.onload = ()=>{
                    const context = element.getContext('2d');
                    context.drawImage(img, 0, 0);
                };
                img.src = value.dataURL;
            }
            node = new DOM(element);
        }
        if (setup.clipArea) {
            node.clipArea = sceneryDeserialize(setup.clipArea);
        }
        if (setup.mouseArea) {
            node.mouseArea = sceneryDeserialize(setup.mouseArea);
        }
        if (setup.touchArea) {
            node.touchArea = sceneryDeserialize(setup.touchArea);
        }
        if (setup.matrix) {
            node.matrix = sceneryDeserialize(setup.matrix);
        }
        if (setup.localBounds) {
            node.localBounds = sceneryDeserialize(setup.localBounds);
        }
        // Paintable, if they exist
        if (setup.fill) {
            node.fill = sceneryDeserialize(setup.fill);
        }
        if (setup.stroke) {
            node.stroke = sceneryDeserialize(setup.stroke);
        }
        if (setup.lineDash) {
            node.lineDash = sceneryDeserialize(setup.lineDash);
        }
        node.mutate(value.options);
        node._serialization = value;
        return node;
    } else if (value.type === 'Subtree') {
        const nodeMap = {};
        const nodes = value.nodes.map(sceneryDeserialize);
        // Index them
        nodes.forEach((node)=>{
            nodeMap[node._serialization.id] = node;
        });
        // Connect children
        nodes.forEach((node)=>{
            node._serialization.setup.children.forEach((childId)=>{
                node.addChild(nodeMap[childId]);
            });
        });
        // The root should be the first one
        return nodeMap[value.rootNodeId];
    } else if (value.type === 'value') {
        return value.value;
    } else {
        return null;
    }
};
scenery.register('sceneryDeserialize', sceneryDeserialize);
export default sceneryDeserialize;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvdXRpbC9zY2VuZXJ5RGVzZXJpYWxpemUudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjItMjAyNCwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbi8qKlxuICogVXNlZCBieSB0aGUgc2NlbmVyeSBpbnNwZWN0b3JcbiAqXG4gKiBAYXV0aG9yIEpvbmF0aGFuIE9sc29uIDxqb25hdGhhbi5vbHNvbkBjb2xvcmFkby5lZHU+XG4gKi9cblxuaW1wb3J0IFByb3BlcnR5IGZyb20gJy4uLy4uLy4uL2F4b24vanMvUHJvcGVydHkuanMnO1xuaW1wb3J0IFRpbnlQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi9heG9uL2pzL1RpbnlQcm9wZXJ0eS5qcyc7XG5pbXBvcnQgQm91bmRzMiBmcm9tICcuLi8uLi8uLi9kb3QvanMvQm91bmRzMi5qcyc7XG5pbXBvcnQgTWF0cml4MyBmcm9tICcuLi8uLi8uLi9kb3QvanMvTWF0cml4My5qcyc7XG5pbXBvcnQgVmVjdG9yMiBmcm9tICcuLi8uLi8uLi9kb3QvanMvVmVjdG9yMi5qcyc7XG5pbXBvcnQgeyBTaGFwZSB9IGZyb20gJy4uLy4uLy4uL2tpdGUvanMvaW1wb3J0cy5qcyc7XG5pbXBvcnQgTWlwbWFwRWxlbWVudCBmcm9tICcuLi8uLi8uLi9waGV0LWNvcmUvanMvTWlwbWFwRWxlbWVudC5qcyc7XG5pbXBvcnQgSW50ZW50aW9uYWxBbnkgZnJvbSAnLi4vLi4vLi4vcGhldC1jb3JlL2pzL3R5cGVzL0ludGVudGlvbmFsQW55LmpzJztcbmltcG9ydCB7IENpcmNsZSwgQ29sb3IsIERPTSwgR3JhZGllbnQsIEltYWdlLCBMaW5lLCBMaW5lYXJHcmFkaWVudCwgTWlwbWFwLCBOb2RlLCBQYWludCwgUGF0aCwgUGF0dGVybiwgUmFkaWFsR3JhZGllbnQsIFJlY3RhbmdsZSwgc2NlbmVyeSwgVGV4dCB9IGZyb20gJy4uL2ltcG9ydHMuanMnO1xuXG5jb25zdCBzY2VuZXJ5RGVzZXJpYWxpemUgPSAoIHZhbHVlOiB7IHR5cGU6IHN0cmluZzsgWyBrZXk6IHN0cmluZyBdOiBJbnRlbnRpb25hbEFueSB9ICk6IEludGVudGlvbmFsQW55ID0+IHtcbiAgY29uc3Qgbm9kZVR5cGVzID0gW1xuICAgICdOb2RlJywgJ1BhdGgnLCAnQ2lyY2xlJywgJ0xpbmUnLCAnUmVjdGFuZ2xlJywgJ1RleHQnLCAnSW1hZ2UnLCAnQ2FudmFzTm9kZScsICdXZWJHTE5vZGUnLCAnRE9NJ1xuICBdO1xuXG4gIGlmICggdmFsdWUudHlwZSA9PT0gJ1ZlY3RvcjInICkge1xuICAgIHJldHVybiBuZXcgVmVjdG9yMiggdmFsdWUueCwgdmFsdWUueSApO1xuICB9XG4gIGlmICggdmFsdWUudHlwZSA9PT0gJ01hdHJpeDMnICkge1xuICAgIHJldHVybiBuZXcgTWF0cml4MygpLnJvd01ham9yKFxuICAgICAgdmFsdWUubTAwLCB2YWx1ZS5tMDEsIHZhbHVlLm0wMixcbiAgICAgIHZhbHVlLm0xMCwgdmFsdWUubTExLCB2YWx1ZS5tMTIsXG4gICAgICB2YWx1ZS5tMjAsIHZhbHVlLm0yMSwgdmFsdWUubTIyXG4gICAgKTtcbiAgfVxuICBlbHNlIGlmICggdmFsdWUudHlwZSA9PT0gJ0JvdW5kczInICkge1xuICAgIHJldHVybiBuZXcgQm91bmRzMiggdmFsdWUubWluWCwgdmFsdWUubWluWSwgdmFsdWUubWF4WCwgdmFsdWUubWF4WSApO1xuICB9XG4gIGVsc2UgaWYgKCB2YWx1ZS50eXBlID09PSAnU2hhcGUnICkge1xuICAgIHJldHVybiBuZXcgU2hhcGUoIHZhbHVlLnBhdGggKTtcbiAgfVxuICBlbHNlIGlmICggdmFsdWUudHlwZSA9PT0gJ0FycmF5JyApIHtcbiAgICByZXR1cm4gdmFsdWUudmFsdWUubWFwKCBzY2VuZXJ5RGVzZXJpYWxpemUgKTtcbiAgfVxuICBlbHNlIGlmICggdmFsdWUudHlwZSA9PT0gJ0NvbG9yJyApIHtcbiAgICByZXR1cm4gbmV3IENvbG9yKCB2YWx1ZS5yZWQsIHZhbHVlLmdyZWVuLCB2YWx1ZS5ibHVlLCB2YWx1ZS5hbHBoYSApO1xuICB9XG4gIGVsc2UgaWYgKCB2YWx1ZS50eXBlID09PSAnUHJvcGVydHknICkge1xuICAgIHJldHVybiBuZXcgUHJvcGVydHkoIHNjZW5lcnlEZXNlcmlhbGl6ZSggdmFsdWUudmFsdWUgKSApO1xuICB9XG4gIGVsc2UgaWYgKCB2YWx1ZS50eXBlID09PSAnVGlueVByb3BlcnR5JyApIHtcbiAgICByZXR1cm4gbmV3IFRpbnlQcm9wZXJ0eSggc2NlbmVyeURlc2VyaWFsaXplKCB2YWx1ZS52YWx1ZSApICk7XG4gIH1cbiAgZWxzZSBpZiAoIHZhbHVlLnR5cGUgPT09ICdQYXR0ZXJuJyB8fCB2YWx1ZS50eXBlID09PSAnTGluZWFyR3JhZGllbnQnIHx8IHZhbHVlLnR5cGUgPT09ICdSYWRpYWxHcmFkaWVudCcgKSB7XG4gICAgbGV0IHBhaW50ITogUGFpbnQ7XG5cbiAgICBpZiAoIHZhbHVlLnR5cGUgPT09ICdQYXR0ZXJuJyApIHtcbiAgICAgIGNvbnN0IGltZyA9IG5ldyB3aW5kb3cuSW1hZ2UoKTtcbiAgICAgIGltZy5zcmMgPSB2YWx1ZS51cmw7XG4gICAgICBwYWludCA9IG5ldyBQYXR0ZXJuKCBpbWcgKTtcbiAgICB9XG4gICAgLy8gR3JhZGllbnRzXG4gICAgZWxzZSB7XG4gICAgICBjb25zdCBzdGFydCA9IHNjZW5lcnlEZXNlcmlhbGl6ZSggdmFsdWUuc3RhcnQgKTtcbiAgICAgIGNvbnN0IGVuZCA9IHNjZW5lcnlEZXNlcmlhbGl6ZSggdmFsdWUuZW5kICk7XG4gICAgICBpZiAoIHZhbHVlLnR5cGUgPT09ICdMaW5lYXJHcmFkaWVudCcgKSB7XG4gICAgICAgIHBhaW50ID0gbmV3IExpbmVhckdyYWRpZW50KCBzdGFydC54LCBzdGFydC55LCBlbmQueCwgZW5kLnkgKTtcbiAgICAgIH1cbiAgICAgIGVsc2UgaWYgKCB2YWx1ZS50eXBlID09PSAnUmFkaWFsR3JhZGllbnQnICkge1xuICAgICAgICBwYWludCA9IG5ldyBSYWRpYWxHcmFkaWVudCggc3RhcnQueCwgc3RhcnQueSwgdmFsdWUuc3RhcnRSYWRpdXMsIGVuZC54LCBlbmQueSwgdmFsdWUuZW5kUmFkaXVzICk7XG4gICAgICB9XG5cbiAgICAgIHZhbHVlLnN0b3BzLmZvckVhY2goICggc3RvcDogSW50ZW50aW9uYWxBbnkgKSA9PiB7XG4gICAgICAgICggcGFpbnQgYXMgR3JhZGllbnQgKS5hZGRDb2xvclN0b3AoIHN0b3AucmF0aW8sIHNjZW5lcnlEZXNlcmlhbGl6ZSggc3RvcC5zdG9wICkgKTtcbiAgICAgIH0gKTtcbiAgICB9XG5cbiAgICBpZiAoIHZhbHVlLnRyYW5zZm9ybU1hdHJpeCApIHtcbiAgICAgIHBhaW50LnNldFRyYW5zZm9ybU1hdHJpeCggc2NlbmVyeURlc2VyaWFsaXplKCB2YWx1ZS50cmFuc2Zvcm1NYXRyaXggKSApO1xuICAgIH1cblxuICAgIHJldHVybiBwYWludDtcbiAgfVxuICBlbHNlIGlmICggXy5pbmNsdWRlcyggbm9kZVR5cGVzLCB2YWx1ZS50eXBlICkgKSB7XG4gICAgbGV0IG5vZGU6IEludGVudGlvbmFsQW55O1xuXG4gICAgY29uc3Qgc2V0dXAgPSB2YWx1ZS5zZXR1cDtcblxuICAgIGlmICggdmFsdWUudHlwZSA9PT0gJ05vZGUnICkge1xuICAgICAgbm9kZSA9IG5ldyBOb2RlKCk7XG4gICAgfVxuICAgIGVsc2UgaWYgKCB2YWx1ZS50eXBlID09PSAnUGF0aCcgKSB7XG4gICAgICBub2RlID0gbmV3IFBhdGgoIHNjZW5lcnlEZXNlcmlhbGl6ZSggc2V0dXAucGF0aCApICk7XG4gICAgfVxuICAgIGVsc2UgaWYgKCB2YWx1ZS50eXBlID09PSAnQ2lyY2xlJyApIHtcbiAgICAgIG5vZGUgPSBuZXcgQ2lyY2xlKCB7fSApO1xuICAgIH1cbiAgICBlbHNlIGlmICggdmFsdWUudHlwZSA9PT0gJ0xpbmUnICkge1xuICAgICAgbm9kZSA9IG5ldyBMaW5lKCB7fSApO1xuICAgIH1cbiAgICBlbHNlIGlmICggdmFsdWUudHlwZSA9PT0gJ1JlY3RhbmdsZScgKSB7XG4gICAgICBub2RlID0gbmV3IFJlY3RhbmdsZSgge30gKTtcbiAgICB9XG4gICAgZWxzZSBpZiAoIHZhbHVlLnR5cGUgPT09ICdUZXh0JyApIHtcbiAgICAgIG5vZGUgPSBuZXcgVGV4dCggJycgKTtcbiAgICB9XG4gICAgZWxzZSBpZiAoIHZhbHVlLnR5cGUgPT09ICdJbWFnZScgKSB7XG4gICAgICBpZiAoIHNldHVwLmltYWdlVHlwZSA9PT0gJ2ltYWdlJyB8fCBzZXR1cC5pbWFnZVR5cGUgPT09ICdjYW52YXMnICkge1xuICAgICAgICBub2RlID0gbmV3IEltYWdlKCBzZXR1cC5zcmMgKTtcbiAgICAgICAgaWYgKCBzZXR1cC5nZW5lcmF0ZU1pcG1hcHMgKSB7XG4gICAgICAgICAgbm9kZS5taXBtYXAgPSB0cnVlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBlbHNlIGlmICggc2V0dXAuaW1hZ2VUeXBlID09PSAnbWlwbWFwRGF0YScgKSB7XG4gICAgICAgIGNvbnN0IG1pcG1hcERhdGEgPSBzZXR1cC5taXBtYXBEYXRhLm1hcCggKCBsZXZlbDogTWlwbWFwWzBdICkgPT4ge1xuICAgICAgICAgIHJldHVybiBuZXcgTWlwbWFwRWxlbWVudCggbGV2ZWwud2lkdGgsIGxldmVsLmhlaWdodCwgbGV2ZWwudXJsLCBmYWxzZSApO1xuICAgICAgICB9ICk7XG4gICAgICAgIG5vZGUgPSBuZXcgSW1hZ2UoIG1pcG1hcERhdGEgKTtcbiAgICAgIH1cbiAgICAgICggbm9kZSEgKS5pbml0aWFsV2lkdGggPSBzZXR1cC53aWR0aDtcbiAgICAgICggbm9kZSEgKS5pbml0aWFsSGVpZ2h0ID0gc2V0dXAuaGVpZ2h0O1xuICAgIH1cbiAgICBlbHNlIGlmICggdmFsdWUudHlwZSA9PT0gJ0NhbnZhc05vZGUnIHx8IHZhbHVlLnR5cGUgPT09ICdXZWJHTE5vZGUnICkge1xuICAgICAgLy8gVE9ETzogUmVjb3JkIENhbnZhcy9XZWJHTCBjYWxscz8gKGNvbmRpdGlvbmFscyB3b3VsZCBiZSBoYXJkZXIhKSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvc2NlbmVyeS9pc3N1ZXMvMTU4MVxuICAgICAgbm9kZSA9IG5ldyBOb2RlKCB7XG4gICAgICAgIGNoaWxkcmVuOiBbXG4gICAgICAgICAgbmV3IEltYWdlKCBzZXR1cC51cmwsIHtcbiAgICAgICAgICAgIHRyYW5zbGF0aW9uOiBzY2VuZXJ5RGVzZXJpYWxpemUoIHNldHVwLm9mZnNldCApLFxuICAgICAgICAgICAgc2NhbGU6IDEgLyBzZXR1cC5zY2FsZVxuICAgICAgICAgIH0gKVxuICAgICAgICBdXG4gICAgICB9ICk7XG4gICAgfVxuICAgIGVsc2UgaWYgKCB2YWx1ZS50eXBlID09PSAnRE9NJyApIHtcbiAgICAgIGNvbnN0IGRpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoICdkaXYnICk7XG4gICAgICBkaXYuaW5uZXJIVE1MID0gdmFsdWUuZWxlbWVudDtcbiAgICAgIGNvbnN0IGVsZW1lbnQgPSBkaXYuY2hpbGROb2Rlc1sgMCBdO1xuICAgICAgZGl2LnJlbW92ZUNoaWxkKCBlbGVtZW50ICk7XG5cbiAgICAgIGlmICggdmFsdWUuZGF0YVVSTCApIHtcbiAgICAgICAgY29uc3QgaW1nID0gbmV3IHdpbmRvdy5JbWFnZSgpO1xuICAgICAgICBpbWcub25sb2FkID0gKCkgPT4ge1xuICAgICAgICAgIGNvbnN0IGNvbnRleHQgPSAoIGVsZW1lbnQgYXMgSFRNTENhbnZhc0VsZW1lbnQgKS5nZXRDb250ZXh0KCAnMmQnICkhO1xuICAgICAgICAgIGNvbnRleHQuZHJhd0ltYWdlKCBpbWcsIDAsIDAgKTtcbiAgICAgICAgfTtcbiAgICAgICAgaW1nLnNyYyA9IHZhbHVlLmRhdGFVUkw7XG4gICAgICB9XG5cbiAgICAgIG5vZGUgPSBuZXcgRE9NKCBlbGVtZW50IGFzIEhUTUxFbGVtZW50ICk7XG4gICAgfVxuXG4gICAgaWYgKCBzZXR1cC5jbGlwQXJlYSApIHtcbiAgICAgICggbm9kZSEgKS5jbGlwQXJlYSA9IHNjZW5lcnlEZXNlcmlhbGl6ZSggc2V0dXAuY2xpcEFyZWEgKTtcbiAgICB9XG4gICAgaWYgKCBzZXR1cC5tb3VzZUFyZWEgKSB7XG4gICAgICAoIG5vZGUhICkubW91c2VBcmVhID0gc2NlbmVyeURlc2VyaWFsaXplKCBzZXR1cC5tb3VzZUFyZWEgKTtcbiAgICB9XG4gICAgaWYgKCBzZXR1cC50b3VjaEFyZWEgKSB7XG4gICAgICAoIG5vZGUhICkudG91Y2hBcmVhID0gc2NlbmVyeURlc2VyaWFsaXplKCBzZXR1cC50b3VjaEFyZWEgKTtcbiAgICB9XG4gICAgaWYgKCBzZXR1cC5tYXRyaXggKSB7XG4gICAgICAoIG5vZGUhICkubWF0cml4ID0gc2NlbmVyeURlc2VyaWFsaXplKCBzZXR1cC5tYXRyaXggKTtcbiAgICB9XG4gICAgaWYgKCBzZXR1cC5sb2NhbEJvdW5kcyApIHtcbiAgICAgICggbm9kZSEgKS5sb2NhbEJvdW5kcyA9IHNjZW5lcnlEZXNlcmlhbGl6ZSggc2V0dXAubG9jYWxCb3VuZHMgKTtcbiAgICB9XG5cbiAgICAvLyBQYWludGFibGUsIGlmIHRoZXkgZXhpc3RcbiAgICBpZiAoIHNldHVwLmZpbGwgKSB7XG4gICAgICAoIG5vZGUgYXMgUGF0aCB8IFRleHQgKS5maWxsID0gc2NlbmVyeURlc2VyaWFsaXplKCBzZXR1cC5maWxsICk7XG4gICAgfVxuICAgIGlmICggc2V0dXAuc3Ryb2tlICkge1xuICAgICAgKCBub2RlIGFzIFBhdGggfCBUZXh0ICkuc3Ryb2tlID0gc2NlbmVyeURlc2VyaWFsaXplKCBzZXR1cC5zdHJva2UgKTtcbiAgICB9XG4gICAgaWYgKCBzZXR1cC5saW5lRGFzaCApIHtcbiAgICAgICggbm9kZSBhcyBQYXRoIHwgVGV4dCApLmxpbmVEYXNoID0gc2NlbmVyeURlc2VyaWFsaXplKCBzZXR1cC5saW5lRGFzaCApO1xuICAgIH1cblxuICAgICggbm9kZSEgKS5tdXRhdGUoIHZhbHVlLm9wdGlvbnMgKTtcblxuICAgICggbm9kZSEgKS5fc2VyaWFsaXphdGlvbiA9IHZhbHVlO1xuXG4gICAgcmV0dXJuIG5vZGU7XG4gIH1cbiAgZWxzZSBpZiAoIHZhbHVlLnR5cGUgPT09ICdTdWJ0cmVlJyApIHtcbiAgICBjb25zdCBub2RlTWFwOiBSZWNvcmQ8c3RyaW5nLCBOb2RlPiA9IHt9O1xuICAgIGNvbnN0IG5vZGVzID0gdmFsdWUubm9kZXMubWFwKCBzY2VuZXJ5RGVzZXJpYWxpemUgKTtcblxuICAgIC8vIEluZGV4IHRoZW1cbiAgICBub2Rlcy5mb3JFYWNoKCAoIG5vZGU6IE5vZGUgKSA9PiB7XG4gICAgICBub2RlTWFwWyBub2RlLl9zZXJpYWxpemF0aW9uLmlkIF0gPSBub2RlO1xuICAgIH0gKTtcblxuICAgIC8vIENvbm5lY3QgY2hpbGRyZW5cbiAgICBub2Rlcy5mb3JFYWNoKCAoIG5vZGU6IE5vZGUgKSA9PiB7XG4gICAgICBub2RlLl9zZXJpYWxpemF0aW9uLnNldHVwLmNoaWxkcmVuLmZvckVhY2goICggY2hpbGRJZDogc3RyaW5nICkgPT4ge1xuICAgICAgICBub2RlLmFkZENoaWxkKCBub2RlTWFwWyBjaGlsZElkIF0gKTtcbiAgICAgIH0gKTtcbiAgICB9ICk7XG5cbiAgICAvLyBUaGUgcm9vdCBzaG91bGQgYmUgdGhlIGZpcnN0IG9uZVxuICAgIHJldHVybiBub2RlTWFwWyB2YWx1ZS5yb290Tm9kZUlkIF07XG4gIH1cbiAgZWxzZSBpZiAoIHZhbHVlLnR5cGUgPT09ICd2YWx1ZScgKSB7XG4gICAgcmV0dXJuIHZhbHVlLnZhbHVlO1xuICB9XG4gIGVsc2Uge1xuICAgIHJldHVybiBudWxsO1xuICB9XG59O1xuXG5zY2VuZXJ5LnJlZ2lzdGVyKCAnc2NlbmVyeURlc2VyaWFsaXplJywgc2NlbmVyeURlc2VyaWFsaXplICk7XG5leHBvcnQgZGVmYXVsdCBzY2VuZXJ5RGVzZXJpYWxpemU7Il0sIm5hbWVzIjpbIlByb3BlcnR5IiwiVGlueVByb3BlcnR5IiwiQm91bmRzMiIsIk1hdHJpeDMiLCJWZWN0b3IyIiwiU2hhcGUiLCJNaXBtYXBFbGVtZW50IiwiQ2lyY2xlIiwiQ29sb3IiLCJET00iLCJJbWFnZSIsIkxpbmUiLCJMaW5lYXJHcmFkaWVudCIsIk5vZGUiLCJQYXRoIiwiUGF0dGVybiIsIlJhZGlhbEdyYWRpZW50IiwiUmVjdGFuZ2xlIiwic2NlbmVyeSIsIlRleHQiLCJzY2VuZXJ5RGVzZXJpYWxpemUiLCJ2YWx1ZSIsIm5vZGVUeXBlcyIsInR5cGUiLCJ4IiwieSIsInJvd01ham9yIiwibTAwIiwibTAxIiwibTAyIiwibTEwIiwibTExIiwibTEyIiwibTIwIiwibTIxIiwibTIyIiwibWluWCIsIm1pblkiLCJtYXhYIiwibWF4WSIsInBhdGgiLCJtYXAiLCJyZWQiLCJncmVlbiIsImJsdWUiLCJhbHBoYSIsInBhaW50IiwiaW1nIiwid2luZG93Iiwic3JjIiwidXJsIiwic3RhcnQiLCJlbmQiLCJzdGFydFJhZGl1cyIsImVuZFJhZGl1cyIsInN0b3BzIiwiZm9yRWFjaCIsInN0b3AiLCJhZGRDb2xvclN0b3AiLCJyYXRpbyIsInRyYW5zZm9ybU1hdHJpeCIsInNldFRyYW5zZm9ybU1hdHJpeCIsIl8iLCJpbmNsdWRlcyIsIm5vZGUiLCJzZXR1cCIsImltYWdlVHlwZSIsImdlbmVyYXRlTWlwbWFwcyIsIm1pcG1hcCIsIm1pcG1hcERhdGEiLCJsZXZlbCIsIndpZHRoIiwiaGVpZ2h0IiwiaW5pdGlhbFdpZHRoIiwiaW5pdGlhbEhlaWdodCIsImNoaWxkcmVuIiwidHJhbnNsYXRpb24iLCJvZmZzZXQiLCJzY2FsZSIsImRpdiIsImRvY3VtZW50IiwiY3JlYXRlRWxlbWVudCIsImlubmVySFRNTCIsImVsZW1lbnQiLCJjaGlsZE5vZGVzIiwicmVtb3ZlQ2hpbGQiLCJkYXRhVVJMIiwib25sb2FkIiwiY29udGV4dCIsImdldENvbnRleHQiLCJkcmF3SW1hZ2UiLCJjbGlwQXJlYSIsIm1vdXNlQXJlYSIsInRvdWNoQXJlYSIsIm1hdHJpeCIsImxvY2FsQm91bmRzIiwiZmlsbCIsInN0cm9rZSIsImxpbmVEYXNoIiwibXV0YXRlIiwib3B0aW9ucyIsIl9zZXJpYWxpemF0aW9uIiwibm9kZU1hcCIsIm5vZGVzIiwiaWQiLCJjaGlsZElkIiwiYWRkQ2hpbGQiLCJyb290Tm9kZUlkIiwicmVnaXN0ZXIiXSwibWFwcGluZ3MiOiJBQUFBLHNEQUFzRDtBQUV0RDs7OztDQUlDLEdBRUQsT0FBT0EsY0FBYywrQkFBK0I7QUFDcEQsT0FBT0Msa0JBQWtCLG1DQUFtQztBQUM1RCxPQUFPQyxhQUFhLDZCQUE2QjtBQUNqRCxPQUFPQyxhQUFhLDZCQUE2QjtBQUNqRCxPQUFPQyxhQUFhLDZCQUE2QjtBQUNqRCxTQUFTQyxLQUFLLFFBQVEsOEJBQThCO0FBQ3BELE9BQU9DLG1CQUFtQix5Q0FBeUM7QUFFbkUsU0FBU0MsTUFBTSxFQUFFQyxLQUFLLEVBQUVDLEdBQUcsRUFBWUMsS0FBSyxFQUFFQyxJQUFJLEVBQUVDLGNBQWMsRUFBVUMsSUFBSSxFQUFTQyxJQUFJLEVBQUVDLE9BQU8sRUFBRUMsY0FBYyxFQUFFQyxTQUFTLEVBQUVDLE9BQU8sRUFBRUMsSUFBSSxRQUFRLGdCQUFnQjtBQUV4SyxNQUFNQyxxQkFBcUIsQ0FBRUM7SUFDM0IsTUFBTUMsWUFBWTtRQUNoQjtRQUFRO1FBQVE7UUFBVTtRQUFRO1FBQWE7UUFBUTtRQUFTO1FBQWM7UUFBYTtLQUM1RjtJQUVELElBQUtELE1BQU1FLElBQUksS0FBSyxXQUFZO1FBQzlCLE9BQU8sSUFBSW5CLFFBQVNpQixNQUFNRyxDQUFDLEVBQUVILE1BQU1JLENBQUM7SUFDdEM7SUFDQSxJQUFLSixNQUFNRSxJQUFJLEtBQUssV0FBWTtRQUM5QixPQUFPLElBQUlwQixVQUFVdUIsUUFBUSxDQUMzQkwsTUFBTU0sR0FBRyxFQUFFTixNQUFNTyxHQUFHLEVBQUVQLE1BQU1RLEdBQUcsRUFDL0JSLE1BQU1TLEdBQUcsRUFBRVQsTUFBTVUsR0FBRyxFQUFFVixNQUFNVyxHQUFHLEVBQy9CWCxNQUFNWSxHQUFHLEVBQUVaLE1BQU1hLEdBQUcsRUFBRWIsTUFBTWMsR0FBRztJQUVuQyxPQUNLLElBQUtk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