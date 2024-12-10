// Copyright 2021-2024, University of Colorado Boulder
/**
 * Serializes a generalized object
 * @deprecated
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ import ReadOnlyProperty from '../../../axon/js/ReadOnlyProperty.js';
import TinyProperty from '../../../axon/js/TinyProperty.js';
import Bounds2 from '../../../dot/js/Bounds2.js';
import Matrix3 from '../../../dot/js/Matrix3.js';
import Vector2 from '../../../dot/js/Vector2.js';
import { Shape } from '../../../kite/js/imports.js';
import inheritance from '../../../phet-core/js/inheritance.js';
import { CanvasContextWrapper, CanvasNode, Circle, Color, Display, DOM, Gradient, Image, Line, LinearGradient, Node, Paint, PAINTABLE_DEFAULT_OPTIONS, Path, Pattern, RadialGradient, Rectangle, scenery, Text, WebGLNode } from '../imports.js';
const scenerySerialize = (value)=>{
    if (value instanceof Vector2) {
        return {
            type: 'Vector2',
            x: value.x,
            y: value.y
        };
    } else if (value instanceof Matrix3) {
        return {
            type: 'Matrix3',
            m00: value.m00(),
            m01: value.m01(),
            m02: value.m02(),
            m10: value.m10(),
            m11: value.m11(),
            m12: value.m12(),
            m20: value.m20(),
            m21: value.m21(),
            m22: value.m22()
        };
    } else if (value instanceof Bounds2) {
        const bounds = value;
        return {
            type: 'Bounds2',
            maxX: bounds.maxX,
            maxY: bounds.maxY,
            minX: bounds.minX,
            minY: bounds.minY
        };
    } else if (value instanceof Shape) {
        return {
            type: 'Shape',
            path: value.getSVGPath()
        };
    } else if (Array.isArray(value)) {
        return {
            type: 'Array',
            value: value.map(scenerySerialize)
        };
    } else if (value instanceof Color) {
        return {
            type: 'Color',
            red: value.red,
            green: value.green,
            blue: value.blue,
            alpha: value.alpha
        };
    } else if (value instanceof ReadOnlyProperty) {
        return {
            type: 'Property',
            value: scenerySerialize(value.value)
        };
    } else if (value instanceof TinyProperty) {
        return {
            type: 'TinyProperty',
            value: scenerySerialize(value.value)
        };
    } else if (Paint && value instanceof Paint) {
        const paintSerialization = {};
        if (value.transformMatrix) {
            paintSerialization.transformMatrix = scenerySerialize(value.transformMatrix);
        }
        if (Gradient && (value instanceof RadialGradient || value instanceof LinearGradient)) {
            paintSerialization.stops = value.stops.map((stop)=>{
                return {
                    ratio: stop.ratio,
                    stop: scenerySerialize(stop.color)
                };
            });
            paintSerialization.start = scenerySerialize(value.start);
            paintSerialization.end = scenerySerialize(value.end);
            if (LinearGradient && value instanceof LinearGradient) {
                paintSerialization.type = 'LinearGradient';
            } else if (RadialGradient && value instanceof RadialGradient) {
                paintSerialization.type = 'RadialGradient';
                paintSerialization.startRadius = value.startRadius;
                paintSerialization.endRadius = value.endRadius;
            }
        }
        if (Pattern && value instanceof Pattern) {
            paintSerialization.type = 'Pattern';
            paintSerialization.url = value.image.src;
        }
        return paintSerialization;
    } else if (value instanceof Node) {
        const node = value;
        const options = {};
        const setup = {
        };
        [
            'visible',
            'opacity',
            'disabledOpacity',
            'pickable',
            'inputEnabled',
            'cursor',
            'transformBounds',
            'renderer',
            'usesOpacity',
            'layerSplit',
            'cssTransform',
            'excludeInvisible',
            'webglScale',
            'preventFit'
        ].forEach((simpleKey)=>{
            // @ts-expect-error
            if (node[simpleKey] !== Node.DEFAULT_NODE_OPTIONS[simpleKey]) {
                // @ts-expect-error
                options[simpleKey] = node[simpleKey];
            }
        });
        // From ParallelDOM
        [
            'tagName',
            'innerContent',
            'accessibleName',
            'helpText'
        ].forEach((simpleKey)=>{
            // All default to null
            // @ts-expect-error
            if (node[simpleKey] !== null) {
                // @ts-expect-error
                options[simpleKey] = node[simpleKey];
            }
        });
        [
            'maxWidth',
            'maxHeight',
            'clipArea',
            'mouseArea',
            'touchArea'
        ].forEach((serializedKey)=>{
            // @ts-expect-error
            if (node[serializedKey] !== Node.DEFAULT_NODE_OPTIONS[serializedKey]) {
                // @ts-expect-error
                setup[serializedKey] = scenerySerialize(node[serializedKey]);
            }
        });
        if (!node.matrix.isIdentity()) {
            setup.matrix = scenerySerialize(node.matrix);
        }
        if (node._localBoundsOverridden) {
            setup.localBounds = scenerySerialize(node.localBounds);
        }
        setup.children = node.children.map((child)=>{
            return child.id;
        });
        setup.hasInputListeners = node.inputListeners.length > 0;
        const serialization = {
            id: node.id,
            type: 'Node',
            types: inheritance(node.constructor).map((type)=>type.name).filter((name)=>{
                return name && name !== 'Object' && name !== 'Node';
            }),
            name: node.constructor.name,
            options: options,
            setup: setup
        };
        if (Path && node instanceof Path) {
            serialization.type = 'Path';
            setup.path = scenerySerialize(node.shape);
            if (node.boundsMethod !== Path.DEFAULT_PATH_OPTIONS.boundsMethod) {
                options.boundsMethod = node.boundsMethod;
            }
        }
        if (Circle && node instanceof Circle) {
            serialization.type = 'Circle';
            options.radius = node.radius;
        }
        if (Line && node instanceof Line) {
            serialization.type = 'Line';
            options.x1 = node.x1;
            options.y1 = node.y1;
            options.x2 = node.x2;
            options.y2 = node.y2;
        }
        if (Rectangle && node instanceof Rectangle) {
            serialization.type = 'Rectangle';
            options.rectX = node.rectX;
            options.rectY = node.rectY;
            options.rectWidth = node.rectWidth;
            options.rectHeight = node.rectHeight;
            options.cornerXRadius = node.cornerXRadius;
            options.cornerYRadius = node.cornerYRadius;
        }
        if (Text && node instanceof Text) {
            serialization.type = 'Text';
            // TODO: defaults for Text? https://github.com/phetsims/scenery/issues/1581
            if (node.boundsMethod !== 'hybrid') {
                options.boundsMethod = node.boundsMethod;
            }
            options.string = node.string;
            options.font = node.font;
        }
        if (Image && node instanceof Image) {
            serialization.type = 'Image';
            [
                'imageOpacity',
                'initialWidth',
                'initialHeight',
                'mipmapBias',
                'mipmapInitialLevel',
                'mipmapMaxLevel'
            ].forEach((simpleKey)=>{
                // @ts-expect-error
                if (node[simpleKey] !== Image.DEFAULT_IMAGE_OPTIONS[simpleKey]) {
                    // @ts-expect-error
                    options[simpleKey] = node[simpleKey];
                }
            });
            setup.width = node.imageWidth;
            setup.height = node.imageHeight;
            // Initialized with a mipmap
            if (node._mipmapData) {
                setup.imageType = 'mipmapData';
                setup.mipmapData = node._mipmapData.map((level)=>{
                    return {
                        url: level.url,
                        width: level.width,
                        height: level.height
                    };
                });
            } else {
                if (node._mipmap) {
                    setup.generateMipmaps = true;
                }
                if (node._image instanceof HTMLImageElement) {
                    setup.imageType = 'image';
                    setup.src = node._image.src;
                } else if (node._image instanceof HTMLCanvasElement) {
                    setup.imageType = 'canvas';
                    setup.src = node._image.toDataURL();
                }
            }
        }
        if (CanvasNode && node instanceof CanvasNode || WebGLNode && node instanceof WebGLNode) {
            serialization.type = CanvasNode && node instanceof CanvasNode ? 'CanvasNode' : 'WebGLNode';
            setup.canvasBounds = scenerySerialize(node.canvasBounds);
            // Identify the approximate scale of the node
            // let scale = Math.min( 5, node._drawables.length ? ( 1 / _.mean( node._drawables.map( drawable => {
            //   const scaleVector = drawable.instance.trail.getMatrix().getScaleVector();
            //   return ( scaleVector.x + scaleVector.y ) / 2;
            // } ) ) ) : 1 );
            const scale = 1;
            const canvas = document.createElement('canvas');
            canvas.width = Math.ceil(node.canvasBounds.width * scale);
            canvas.height = Math.ceil(node.canvasBounds.height * scale);
            const context = canvas.getContext('2d');
            const wrapper = new CanvasContextWrapper(canvas, context);
            const matrix = Matrix3.scale(1 / scale);
            wrapper.context.setTransform(scale, 0, 0, scale, -node.canvasBounds.left, -node.canvasBounds.top);
            node.renderToCanvasSelf(wrapper, matrix);
            setup.url = canvas.toDataURL();
            setup.scale = scale;
            setup.offset = scenerySerialize(node.canvasBounds.leftTop);
        }
        if (DOM && node instanceof DOM) {
            serialization.type = 'DOM';
            serialization.element = new window.XMLSerializer().serializeToString(node.element);
            if (node.element instanceof window.HTMLCanvasElement) {
                serialization.dataURL = node.element.toDataURL();
            }
            options.preventTransform = node.preventTransform;
        }
        // Paintable
        if (Path && node instanceof Path || Text && node instanceof Text) {
            [
                'fillPickable',
                'strokePickable',
                'lineWidth',
                'lineCap',
                'lineJoin',
                'lineDashOffset',
                'miterLimit'
            ].forEach((simpleKey)=>{
                // @ts-expect-error
                if (node[simpleKey] !== PAINTABLE_DEFAULT_OPTIONS[simpleKey]) {
                    // @ts-expect-error
                    options[simpleKey] = node[simpleKey];
                }
            });
            // Ignoring cachedPaints, since we'd 'double' it anyways
            if (node.fill !== PAINTABLE_DEFAULT_OPTIONS.fill) {
                setup.fill = scenerySerialize(node.fill);
            }
            if (node.stroke !== PAINTABLE_DEFAULT_OPTIONS.stroke) {
                setup.stroke = scenerySerialize(node.stroke);
            }
            if (node.lineDash.length) {
                setup.lineDash = scenerySerialize(node.lineDash);
            }
        }
        return serialization;
    } else if (value instanceof Display) {
        return {
            type: 'Display',
            width: value.width,
            height: value.height,
            backgroundColor: scenerySerialize(value.backgroundColor),
            tree: {
                type: 'Subtree',
                rootNodeId: value.rootNode.id,
                nodes: serializeConnectedNodes(value.rootNode)
            }
        };
    } else {
        return {
            type: 'value',
            value: value
        };
    }
};
const serializeConnectedNodes = (rootNode)=>{
    return rootNode.getSubtreeNodes().map(scenerySerialize);
};
scenery.register('scenerySerialize', scenerySerialize);
export { scenerySerialize as default, serializeConnectedNodes };

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvdXRpbC9zY2VuZXJ5U2VyaWFsaXplLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDIxLTIwMjQsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIFNlcmlhbGl6ZXMgYSBnZW5lcmFsaXplZCBvYmplY3RcbiAqIEBkZXByZWNhdGVkXG4gKlxuICogQGF1dGhvciBKb25hdGhhbiBPbHNvbiA8am9uYXRoYW4ub2xzb25AY29sb3JhZG8uZWR1PlxuICovXG5cbmltcG9ydCBSZWFkT25seVByb3BlcnR5IGZyb20gJy4uLy4uLy4uL2F4b24vanMvUmVhZE9ubHlQcm9wZXJ0eS5qcyc7XG5pbXBvcnQgVGlueVByb3BlcnR5IGZyb20gJy4uLy4uLy4uL2F4b24vanMvVGlueVByb3BlcnR5LmpzJztcbmltcG9ydCBCb3VuZHMyIGZyb20gJy4uLy4uLy4uL2RvdC9qcy9Cb3VuZHMyLmpzJztcbmltcG9ydCBNYXRyaXgzIGZyb20gJy4uLy4uLy4uL2RvdC9qcy9NYXRyaXgzLmpzJztcbmltcG9ydCBWZWN0b3IyIGZyb20gJy4uLy4uLy4uL2RvdC9qcy9WZWN0b3IyLmpzJztcbmltcG9ydCB7IFNoYXBlIH0gZnJvbSAnLi4vLi4vLi4va2l0ZS9qcy9pbXBvcnRzLmpzJztcbmltcG9ydCBpbmhlcml0YW5jZSBmcm9tICcuLi8uLi8uLi9waGV0LWNvcmUvanMvaW5oZXJpdGFuY2UuanMnO1xuaW1wb3J0IEludGVudGlvbmFsQW55IGZyb20gJy4uLy4uLy4uL3BoZXQtY29yZS9qcy90eXBlcy9JbnRlbnRpb25hbEFueS5qcyc7XG5pbXBvcnQgeyBDYW52YXNDb250ZXh0V3JhcHBlciwgQ2FudmFzTm9kZSwgQ2lyY2xlLCBDb2xvciwgRGlzcGxheSwgRE9NLCBHcmFkaWVudCwgSW1hZ2UsIExpbmUsIExpbmVhckdyYWRpZW50LCBOb2RlLCBQYWludCwgUEFJTlRBQkxFX0RFRkFVTFRfT1BUSU9OUywgUGF0aCwgUGF0dGVybiwgUmFkaWFsR3JhZGllbnQsIFJlY3RhbmdsZSwgc2NlbmVyeSwgVGV4dCwgV2ViR0xOb2RlIH0gZnJvbSAnLi4vaW1wb3J0cy5qcyc7XG5cbmNvbnN0IHNjZW5lcnlTZXJpYWxpemUgPSAoIHZhbHVlOiB1bmtub3duICk6IEludGVudGlvbmFsQW55ID0+IHtcbiAgaWYgKCB2YWx1ZSBpbnN0YW5jZW9mIFZlY3RvcjIgKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHR5cGU6ICdWZWN0b3IyJyxcbiAgICAgIHg6ICggdmFsdWUgKS54LFxuICAgICAgeTogKCB2YWx1ZSApLnlcbiAgICB9O1xuICB9XG4gIGVsc2UgaWYgKCB2YWx1ZSBpbnN0YW5jZW9mIE1hdHJpeDMgKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHR5cGU6ICdNYXRyaXgzJyxcbiAgICAgIG0wMDogdmFsdWUubTAwKCksXG4gICAgICBtMDE6IHZhbHVlLm0wMSgpLFxuICAgICAgbTAyOiB2YWx1ZS5tMDIoKSxcbiAgICAgIG0xMDogdmFsdWUubTEwKCksXG4gICAgICBtMTE6IHZhbHVlLm0xMSgpLFxuICAgICAgbTEyOiB2YWx1ZS5tMTIoKSxcbiAgICAgIG0yMDogdmFsdWUubTIwKCksXG4gICAgICBtMjE6IHZhbHVlLm0yMSgpLFxuICAgICAgbTIyOiB2YWx1ZS5tMjIoKVxuICAgIH07XG4gIH1cbiAgZWxzZSBpZiAoIHZhbHVlIGluc3RhbmNlb2YgQm91bmRzMiApIHtcbiAgICBjb25zdCBib3VuZHMgPSB2YWx1ZTtcbiAgICByZXR1cm4ge1xuICAgICAgdHlwZTogJ0JvdW5kczInLFxuICAgICAgbWF4WDogYm91bmRzLm1heFgsXG4gICAgICBtYXhZOiBib3VuZHMubWF4WSxcbiAgICAgIG1pblg6IGJvdW5kcy5taW5YLFxuICAgICAgbWluWTogYm91bmRzLm1pbllcbiAgICB9O1xuICB9XG4gIGVsc2UgaWYgKCB2YWx1ZSBpbnN0YW5jZW9mIFNoYXBlICkge1xuICAgIHJldHVybiB7XG4gICAgICB0eXBlOiAnU2hhcGUnLFxuICAgICAgcGF0aDogdmFsdWUuZ2V0U1ZHUGF0aCgpXG4gICAgfTtcbiAgfVxuICBlbHNlIGlmICggQXJyYXkuaXNBcnJheSggdmFsdWUgKSApIHtcbiAgICByZXR1cm4ge1xuICAgICAgdHlwZTogJ0FycmF5JyxcbiAgICAgIHZhbHVlOiB2YWx1ZS5tYXAoIHNjZW5lcnlTZXJpYWxpemUgKVxuICAgIH07XG4gIH1cbiAgZWxzZSBpZiAoIHZhbHVlIGluc3RhbmNlb2YgQ29sb3IgKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHR5cGU6ICdDb2xvcicsXG4gICAgICByZWQ6IHZhbHVlLnJlZCxcbiAgICAgIGdyZWVuOiB2YWx1ZS5ncmVlbixcbiAgICAgIGJsdWU6IHZhbHVlLmJsdWUsXG4gICAgICBhbHBoYTogdmFsdWUuYWxwaGFcbiAgICB9O1xuICB9XG4gIGVsc2UgaWYgKCB2YWx1ZSBpbnN0YW5jZW9mIFJlYWRPbmx5UHJvcGVydHkgKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHR5cGU6ICdQcm9wZXJ0eScsXG4gICAgICB2YWx1ZTogc2NlbmVyeVNlcmlhbGl6ZSggdmFsdWUudmFsdWUgKVxuICAgIH07XG4gIH1cbiAgZWxzZSBpZiAoIHZhbHVlIGluc3RhbmNlb2YgVGlueVByb3BlcnR5ICkge1xuICAgIHJldHVybiB7XG4gICAgICB0eXBlOiAnVGlueVByb3BlcnR5JyxcbiAgICAgIHZhbHVlOiBzY2VuZXJ5U2VyaWFsaXplKCB2YWx1ZS52YWx1ZSApXG4gICAgfTtcbiAgfVxuICBlbHNlIGlmICggUGFpbnQgJiYgdmFsdWUgaW5zdGFuY2VvZiBQYWludCApIHtcbiAgICBjb25zdCBwYWludFNlcmlhbGl6YXRpb246IEludGVudGlvbmFsQW55ID0ge307XG5cbiAgICBpZiAoIHZhbHVlLnRyYW5zZm9ybU1hdHJpeCApIHtcbiAgICAgIHBhaW50U2VyaWFsaXphdGlvbi50cmFuc2Zvcm1NYXRyaXggPSBzY2VuZXJ5U2VyaWFsaXplKCB2YWx1ZS50cmFuc2Zvcm1NYXRyaXggKTtcbiAgICB9XG5cbiAgICBpZiAoIEdyYWRpZW50ICYmICggdmFsdWUgaW5zdGFuY2VvZiBSYWRpYWxHcmFkaWVudCB8fCB2YWx1ZSBpbnN0YW5jZW9mIExpbmVhckdyYWRpZW50ICkgKSB7XG4gICAgICBwYWludFNlcmlhbGl6YXRpb24uc3RvcHMgPSB2YWx1ZS5zdG9wcy5tYXAoIHN0b3AgPT4ge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIHJhdGlvOiBzdG9wLnJhdGlvLFxuICAgICAgICAgIHN0b3A6IHNjZW5lcnlTZXJpYWxpemUoIHN0b3AuY29sb3IgKVxuICAgICAgICB9O1xuICAgICAgfSApO1xuXG4gICAgICBwYWludFNlcmlhbGl6YXRpb24uc3RhcnQgPSBzY2VuZXJ5U2VyaWFsaXplKCB2YWx1ZS5zdGFydCApO1xuICAgICAgcGFpbnRTZXJpYWxpemF0aW9uLmVuZCA9IHNjZW5lcnlTZXJpYWxpemUoIHZhbHVlLmVuZCApO1xuXG4gICAgICBpZiAoIExpbmVhckdyYWRpZW50ICYmIHZhbHVlIGluc3RhbmNlb2YgTGluZWFyR3JhZGllbnQgKSB7XG4gICAgICAgIHBhaW50U2VyaWFsaXphdGlvbi50eXBlID0gJ0xpbmVhckdyYWRpZW50JztcbiAgICAgIH1cbiAgICAgIGVsc2UgaWYgKCBSYWRpYWxHcmFkaWVudCAmJiB2YWx1ZSBpbnN0YW5jZW9mIFJhZGlhbEdyYWRpZW50ICkge1xuICAgICAgICBwYWludFNlcmlhbGl6YXRpb24udHlwZSA9ICdSYWRpYWxHcmFkaWVudCc7XG4gICAgICAgIHBhaW50U2VyaWFsaXphdGlvbi5zdGFydFJhZGl1cyA9IHZhbHVlLnN0YXJ0UmFkaXVzO1xuICAgICAgICBwYWludFNlcmlhbGl6YXRpb24uZW5kUmFkaXVzID0gdmFsdWUuZW5kUmFkaXVzO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmICggUGF0dGVybiAmJiB2YWx1ZSBpbnN0YW5jZW9mIFBhdHRlcm4gKSB7XG4gICAgICBwYWludFNlcmlhbGl6YXRpb24udHlwZSA9ICdQYXR0ZXJuJztcbiAgICAgIHBhaW50U2VyaWFsaXphdGlvbi51cmwgPSB2YWx1ZS5pbWFnZS5zcmM7XG4gICAgfVxuXG4gICAgcmV0dXJuIHBhaW50U2VyaWFsaXphdGlvbjtcbiAgfVxuICBlbHNlIGlmICggdmFsdWUgaW5zdGFuY2VvZiBOb2RlICkge1xuICAgIGNvbnN0IG5vZGUgPSB2YWx1ZTtcblxuICAgIGNvbnN0IG9wdGlvbnM6IEludGVudGlvbmFsQW55ID0ge307XG4gICAgY29uc3Qgc2V0dXA6IEludGVudGlvbmFsQW55ID0ge1xuICAgICAgLy8gbWF4V2lkdGhcbiAgICAgIC8vIG1heEhlaWdodFxuICAgICAgLy8gY2xpcEFyZWFcbiAgICAgIC8vIG1vdXNlQXJlYVxuICAgICAgLy8gdG91Y2hBcmVhXG4gICAgICAvLyBtYXRyaXhcbiAgICAgIC8vIGxvY2FsQm91bmRzXG4gICAgICAvLyBjaGlsZHJlbiB7QXJyYXkuPG51bWJlcj59IC0gSURzXG4gICAgICAvLyBoYXNJbnB1dExpc3RlbmVycyB7Ym9vbGVhbn1cblxuICAgIH07XG5cbiAgICBbXG4gICAgICAndmlzaWJsZScsXG4gICAgICAnb3BhY2l0eScsXG4gICAgICAnZGlzYWJsZWRPcGFjaXR5JyxcbiAgICAgICdwaWNrYWJsZScsXG4gICAgICAnaW5wdXRFbmFibGVkJyxcbiAgICAgICdjdXJzb3InLFxuICAgICAgJ3RyYW5zZm9ybUJvdW5kcycsXG4gICAgICAncmVuZGVyZXInLFxuICAgICAgJ3VzZXNPcGFjaXR5JyxcbiAgICAgICdsYXllclNwbGl0JyxcbiAgICAgICdjc3NUcmFuc2Zvcm0nLFxuICAgICAgJ2V4Y2x1ZGVJbnZpc2libGUnLFxuICAgICAgJ3dlYmdsU2NhbGUnLFxuICAgICAgJ3ByZXZlbnRGaXQnXG4gICAgXS5mb3JFYWNoKCBzaW1wbGVLZXkgPT4ge1xuICAgICAgLy8gQHRzLWV4cGVjdC1lcnJvclxuICAgICAgaWYgKCBub2RlWyBzaW1wbGVLZXkgXSAhPT0gTm9kZS5ERUZBVUxUX05PREVfT1BUSU9OU1sgc2ltcGxlS2V5IF0gKSB7XG4gICAgICAgIC8vIEB0cy1leHBlY3QtZXJyb3JcbiAgICAgICAgb3B0aW9uc1sgc2ltcGxlS2V5IF0gPSBub2RlWyBzaW1wbGVLZXkgXTtcbiAgICAgIH1cbiAgICB9ICk7XG5cblxuICAgIC8vIEZyb20gUGFyYWxsZWxET01cbiAgICBbXG4gICAgICAndGFnTmFtZScsXG4gICAgICAnaW5uZXJDb250ZW50JyxcbiAgICAgICdhY2Nlc3NpYmxlTmFtZScsXG4gICAgICAnaGVscFRleHQnXG4gICAgXS5mb3JFYWNoKCBzaW1wbGVLZXkgPT4ge1xuXG4gICAgICAvLyBBbGwgZGVmYXVsdCB0byBudWxsXG4gICAgICAvLyBAdHMtZXhwZWN0LWVycm9yXG4gICAgICBpZiAoIG5vZGVbIHNpbXBsZUtleSBdICE9PSBudWxsICkge1xuICAgICAgICAvLyBAdHMtZXhwZWN0LWVycm9yXG4gICAgICAgIG9wdGlvbnNbIHNpbXBsZUtleSBdID0gbm9kZVsgc2ltcGxlS2V5IF07XG4gICAgICB9XG4gICAgfSApO1xuXG4gICAgW1xuICAgICAgJ21heFdpZHRoJyxcbiAgICAgICdtYXhIZWlnaHQnLFxuICAgICAgJ2NsaXBBcmVhJyxcbiAgICAgICdtb3VzZUFyZWEnLFxuICAgICAgJ3RvdWNoQXJlYSdcbiAgICBdLmZvckVhY2goIHNlcmlhbGl6ZWRLZXkgPT4ge1xuICAgICAgLy8gQHRzLWV4cGVjdC1lcnJvclxuICAgICAgaWYgKCBub2RlWyBzZXJpYWxpemVkS2V5IF0gIT09IE5vZGUuREVGQVVMVF9OT0RFX09QVElPTlNbIHNlcmlhbGl6ZWRLZXkgXSApIHtcbiAgICAgICAgLy8gQHRzLWV4cGVjdC1lcnJvclxuICAgICAgICBzZXR1cFsgc2VyaWFsaXplZEtleSBdID0gc2NlbmVyeVNlcmlhbGl6ZSggbm9kZVsgc2VyaWFsaXplZEtleSBdICk7XG4gICAgICB9XG4gICAgfSApO1xuICAgIGlmICggIW5vZGUubWF0cml4LmlzSWRlbnRpdHkoKSApIHtcbiAgICAgIHNldHVwLm1hdHJpeCA9IHNjZW5lcnlTZXJpYWxpemUoIG5vZGUubWF0cml4ICk7XG4gICAgfVxuICAgIGlmICggbm9kZS5fbG9jYWxCb3VuZHNPdmVycmlkZGVuICkge1xuICAgICAgc2V0dXAubG9jYWxCb3VuZHMgPSBzY2VuZXJ5U2VyaWFsaXplKCBub2RlLmxvY2FsQm91bmRzICk7XG4gICAgfVxuICAgIHNldHVwLmNoaWxkcmVuID0gbm9kZS5jaGlsZHJlbi5tYXAoIGNoaWxkID0+IHtcbiAgICAgIHJldHVybiBjaGlsZC5pZDtcbiAgICB9ICk7XG4gICAgc2V0dXAuaGFzSW5wdXRMaXN0ZW5lcnMgPSBub2RlLmlucHV0TGlzdGVuZXJzLmxlbmd0aCA+IDA7XG5cbiAgICBjb25zdCBzZXJpYWxpemF0aW9uOiBJbnRlbnRpb25hbEFueSA9IHtcbiAgICAgIGlkOiBub2RlLmlkLFxuICAgICAgdHlwZTogJ05vZGUnLFxuICAgICAgdHlwZXM6IGluaGVyaXRhbmNlKCBub2RlLmNvbnN0cnVjdG9yICkubWFwKCB0eXBlID0+IHR5cGUubmFtZSApLmZpbHRlciggbmFtZSA9PiB7XG4gICAgICAgIHJldHVybiBuYW1lICYmIG5hbWUgIT09ICdPYmplY3QnICYmIG5hbWUgIT09ICdOb2RlJztcbiAgICAgIH0gKSxcbiAgICAgIG5hbWU6IG5vZGUuY29uc3RydWN0b3IubmFtZSxcbiAgICAgIG9wdGlvbnM6IG9wdGlvbnMsXG4gICAgICBzZXR1cDogc2V0dXBcbiAgICB9O1xuXG4gICAgaWYgKCBQYXRoICYmIG5vZGUgaW5zdGFuY2VvZiBQYXRoICkge1xuICAgICAgc2VyaWFsaXphdGlvbi50eXBlID0gJ1BhdGgnO1xuICAgICAgc2V0dXAucGF0aCA9IHNjZW5lcnlTZXJpYWxpemUoIG5vZGUuc2hhcGUgKTtcbiAgICAgIGlmICggbm9kZS5ib3VuZHNNZXRob2QgIT09IFBhdGguREVGQVVMVF9QQVRIX09QVElPTlMuYm91bmRzTWV0aG9kICkge1xuICAgICAgICBvcHRpb25zLmJvdW5kc01ldGhvZCA9IG5vZGUuYm91bmRzTWV0aG9kO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmICggQ2lyY2xlICYmIG5vZGUgaW5zdGFuY2VvZiBDaXJjbGUgKSB7XG4gICAgICBzZXJpYWxpemF0aW9uLnR5cGUgPSAnQ2lyY2xlJztcbiAgICAgIG9wdGlvbnMucmFkaXVzID0gbm9kZS5yYWRpdXM7XG4gICAgfVxuXG4gICAgaWYgKCBMaW5lICYmIG5vZGUgaW5zdGFuY2VvZiBMaW5lICkge1xuICAgICAgc2VyaWFsaXphdGlvbi50eXBlID0gJ0xpbmUnO1xuICAgICAgb3B0aW9ucy54MSA9IG5vZGUueDE7XG4gICAgICBvcHRpb25zLnkxID0gbm9kZS55MTtcbiAgICAgIG9wdGlvbnMueDIgPSBub2RlLngyO1xuICAgICAgb3B0aW9ucy55MiA9IG5vZGUueTI7XG4gICAgfVxuXG4gICAgaWYgKCBSZWN0YW5nbGUgJiYgbm9kZSBpbnN0YW5jZW9mIFJlY3RhbmdsZSApIHtcbiAgICAgIHNlcmlhbGl6YXRpb24udHlwZSA9ICdSZWN0YW5nbGUnO1xuICAgICAgb3B0aW9ucy5yZWN0WCA9IG5vZGUucmVjdFg7XG4gICAgICBvcHRpb25zLnJlY3RZID0gbm9kZS5yZWN0WTtcbiAgICAgIG9wdGlvbnMucmVjdFdpZHRoID0gbm9kZS5yZWN0V2lkdGg7XG4gICAgICBvcHRpb25zLnJlY3RIZWlnaHQgPSBub2RlLnJlY3RIZWlnaHQ7XG4gICAgICBvcHRpb25zLmNvcm5lclhSYWRpdXMgPSBub2RlLmNvcm5lclhSYWRpdXM7XG4gICAgICBvcHRpb25zLmNvcm5lcllSYWRpdXMgPSBub2RlLmNvcm5lcllSYWRpdXM7XG4gICAgfVxuXG4gICAgaWYgKCBUZXh0ICYmIG5vZGUgaW5zdGFuY2VvZiBUZXh0ICkge1xuICAgICAgc2VyaWFsaXphdGlvbi50eXBlID0gJ1RleHQnO1xuICAgICAgLy8gVE9ETzogZGVmYXVsdHMgZm9yIFRleHQ/IGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9zY2VuZXJ5L2lzc3Vlcy8xNTgxXG4gICAgICBpZiAoIG5vZGUuYm91bmRzTWV0aG9kICE9PSAnaHlicmlkJyApIHtcbiAgICAgICAgb3B0aW9ucy5ib3VuZHNNZXRob2QgPSBub2RlLmJvdW5kc01ldGhvZDtcbiAgICAgIH1cbiAgICAgIG9wdGlvbnMuc3RyaW5nID0gbm9kZS5zdHJpbmc7XG4gICAgICBvcHRpb25zLmZvbnQgPSBub2RlLmZvbnQ7XG4gICAgfVxuXG4gICAgaWYgKCBJbWFnZSAmJiBub2RlIGluc3RhbmNlb2YgSW1hZ2UgKSB7XG4gICAgICBzZXJpYWxpemF0aW9uLnR5cGUgPSAnSW1hZ2UnO1xuICAgICAgW1xuICAgICAgICAnaW1hZ2VPcGFjaXR5JyxcbiAgICAgICAgJ2luaXRpYWxXaWR0aCcsXG4gICAgICAgICdpbml0aWFsSGVpZ2h0JyxcbiAgICAgICAgJ21pcG1hcEJpYXMnLFxuICAgICAgICAnbWlwbWFwSW5pdGlhbExldmVsJyxcbiAgICAgICAgJ21pcG1hcE1heExldmVsJ1xuICAgICAgXS5mb3JFYWNoKCBzaW1wbGVLZXkgPT4ge1xuICAgICAgICAvLyBAdHMtZXhwZWN0LWVycm9yXG4gICAgICAgIGlmICggbm9kZVsgc2ltcGxlS2V5IF0gIT09IEltYWdlLkRFRkFVTFRfSU1BR0VfT1BUSU9OU1sgc2ltcGxlS2V5IF0gKSB7XG4gICAgICAgICAgLy8gQHRzLWV4cGVjdC1lcnJvclxuICAgICAgICAgIG9wdGlvbnNbIHNpbXBsZUtleSBdID0gbm9kZVsgc2ltcGxlS2V5IF07XG4gICAgICAgIH1cbiAgICAgIH0gKTtcblxuICAgICAgc2V0dXAud2lkdGggPSBub2RlLmltYWdlV2lkdGg7XG4gICAgICBzZXR1cC5oZWlnaHQgPSBub2RlLmltYWdlSGVpZ2h0O1xuXG4gICAgICAvLyBJbml0aWFsaXplZCB3aXRoIGEgbWlwbWFwXG4gICAgICBpZiAoIG5vZGUuX21pcG1hcERhdGEgKSB7XG4gICAgICAgIHNldHVwLmltYWdlVHlwZSA9ICdtaXBtYXBEYXRhJztcbiAgICAgICAgc2V0dXAubWlwbWFwRGF0YSA9IG5vZGUuX21pcG1hcERhdGEubWFwKCBsZXZlbCA9PiB7XG4gICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHVybDogbGV2ZWwudXJsLFxuICAgICAgICAgICAgd2lkdGg6IGxldmVsLndpZHRoLFxuICAgICAgICAgICAgaGVpZ2h0OiBsZXZlbC5oZWlnaHRcbiAgICAgICAgICAgIC8vIHdpbGwgcmVjb25zdGl0dXRlIGltZyB7SFRNTEltYWdlRWxlbWVudH0gYW5kIGNhbnZhcyB7SFRNTENhbnZhc0VsZW1lbnR9XG4gICAgICAgICAgfTtcbiAgICAgICAgfSApO1xuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgIGlmICggbm9kZS5fbWlwbWFwICkge1xuICAgICAgICAgIHNldHVwLmdlbmVyYXRlTWlwbWFwcyA9IHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCBub2RlLl9pbWFnZSBpbnN0YW5jZW9mIEhUTUxJbWFnZUVsZW1lbnQgKSB7XG4gICAgICAgICAgc2V0dXAuaW1hZ2VUeXBlID0gJ2ltYWdlJztcbiAgICAgICAgICBzZXR1cC5zcmMgPSBub2RlLl9pbWFnZS5zcmM7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoIG5vZGUuX2ltYWdlIGluc3RhbmNlb2YgSFRNTENhbnZhc0VsZW1lbnQgKSB7XG4gICAgICAgICAgc2V0dXAuaW1hZ2VUeXBlID0gJ2NhbnZhcyc7XG4gICAgICAgICAgc2V0dXAuc3JjID0gbm9kZS5faW1hZ2UudG9EYXRhVVJMKCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoICggQ2FudmFzTm9kZSAmJiBub2RlIGluc3RhbmNlb2YgQ2FudmFzTm9kZSApIHx8XG4gICAgICAgICAoIFdlYkdMTm9kZSAmJiBub2RlIGluc3RhbmNlb2YgV2ViR0xOb2RlICkgKSB7XG4gICAgICBzZXJpYWxpemF0aW9uLnR5cGUgPSAoIENhbnZhc05vZGUgJiYgbm9kZSBpbnN0YW5jZW9mIENhbnZhc05vZGUgKSA/ICdDYW52YXNOb2RlJyA6ICdXZWJHTE5vZGUnO1xuXG4gICAgICBzZXR1cC5jYW52YXNCb3VuZHMgPSBzY2VuZXJ5U2VyaWFsaXplKCBub2RlLmNhbnZhc0JvdW5kcyApO1xuXG4gICAgICAvLyBJZGVudGlmeSB0aGUgYXBwcm94aW1hdGUgc2NhbGUgb2YgdGhlIG5vZGVcbiAgICAgIC8vIGxldCBzY2FsZSA9IE1hdGgubWluKCA1LCBub2RlLl9kcmF3YWJsZXMubGVuZ3RoID8gKCAxIC8gXy5tZWFuKCBub2RlLl9kcmF3YWJsZXMubWFwKCBkcmF3YWJsZSA9PiB7XG4gICAgICAvLyAgIGNvbnN0IHNjYWxlVmVjdG9yID0gZHJhd2FibGUuaW5zdGFuY2UudHJhaWwuZ2V0TWF0cml4KCkuZ2V0U2NhbGVWZWN0b3IoKTtcbiAgICAgIC8vICAgcmV0dXJuICggc2NhbGVWZWN0b3IueCArIHNjYWxlVmVjdG9yLnkgKSAvIDI7XG4gICAgICAvLyB9ICkgKSApIDogMSApO1xuICAgICAgY29uc3Qgc2NhbGUgPSAxO1xuICAgICAgY29uc3QgY2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCggJ2NhbnZhcycgKTtcbiAgICAgIGNhbnZhcy53aWR0aCA9IE1hdGguY2VpbCggbm9kZS5jYW52YXNCb3VuZHMud2lkdGggKiBzY2FsZSApO1xuICAgICAgY2FudmFzLmhlaWdodCA9IE1hdGguY2VpbCggbm9kZS5jYW52YXNCb3VuZHMuaGVpZ2h0ICogc2NhbGUgKTtcbiAgICAgIGNvbnN0IGNvbnRleHQgPSBjYW52YXMuZ2V0Q29udGV4dCggJzJkJyApITtcbiAgICAgIGNvbnN0IHdyYXBwZXIgPSBuZXcgQ2FudmFzQ29udGV4dFdyYXBwZXIoIGNhbnZhcywgY29udGV4dCApO1xuICAgICAgY29uc3QgbWF0cml4ID0gTWF0cml4My5zY2FsZSggMSAvIHNjYWxlICk7XG4gICAgICB3cmFwcGVyLmNvbnRleHQuc2V0VHJhbnNmb3JtKCBzY2FsZSwgMCwgMCwgc2NhbGUsIC1ub2RlLmNhbnZhc0JvdW5kcy5sZWZ0LCAtbm9kZS5jYW52YXNCb3VuZHMudG9wICk7XG4gICAgICBub2RlLnJlbmRlclRvQ2FudmFzU2VsZiggd3JhcHBlciwgbWF0cml4ICk7XG4gICAgICBzZXR1cC51cmwgPSBjYW52YXMudG9EYXRhVVJMKCk7XG4gICAgICBzZXR1cC5zY2FsZSA9IHNjYWxlO1xuICAgICAgc2V0dXAub2Zmc2V0ID0gc2NlbmVyeVNlcmlhbGl6ZSggbm9kZS5jYW52YXNCb3VuZHMubGVmdFRvcCApO1xuICAgIH1cblxuICAgIGlmICggRE9NICYmIG5vZGUgaW5zdGFuY2VvZiBET00gKSB7XG4gICAgICBzZXJpYWxpemF0aW9uLnR5cGUgPSAnRE9NJztcbiAgICAgIHNlcmlhbGl6YXRpb24uZWxlbWVudCA9IG5ldyB3aW5kb3cuWE1MU2VyaWFsaXplcigpLnNlcmlhbGl6ZVRvU3RyaW5nKCBub2RlLmVsZW1lbnQgKTtcbiAgICAgIGlmICggbm9kZS5lbGVtZW50IGluc3RhbmNlb2Ygd2luZG93LkhUTUxDYW52YXNFbGVtZW50ICkge1xuICAgICAgICBzZXJpYWxpemF0aW9uLmRhdGFVUkwgPSBub2RlLmVsZW1lbnQudG9EYXRhVVJMKCk7XG4gICAgICB9XG4gICAgICBvcHRpb25zLnByZXZlbnRUcmFuc2Zvcm0gPSBub2RlLnByZXZlbnRUcmFuc2Zvcm07XG4gICAgfVxuXG4gICAgLy8gUGFpbnRhYmxlXG4gICAgaWYgKCAoIFBhdGggJiYgbm9kZSBpbnN0YW5jZW9mIFBhdGggKSB8fFxuICAgICAgICAgKCBUZXh0ICYmIG5vZGUgaW5zdGFuY2VvZiBUZXh0ICkgKSB7XG5cbiAgICAgIFtcbiAgICAgICAgJ2ZpbGxQaWNrYWJsZScsXG4gICAgICAgICdzdHJva2VQaWNrYWJsZScsXG4gICAgICAgICdsaW5lV2lkdGgnLFxuICAgICAgICAnbGluZUNhcCcsXG4gICAgICAgICdsaW5lSm9pbicsXG4gICAgICAgICdsaW5lRGFzaE9mZnNldCcsXG4gICAgICAgICdtaXRlckxpbWl0J1xuICAgICAgXS5mb3JFYWNoKCBzaW1wbGVLZXkgPT4ge1xuICAgICAgICAvLyBAdHMtZXhwZWN0LWVycm9yXG4gICAgICAgIGlmICggbm9kZVsgc2ltcGxlS2V5IF0gIT09IFBBSU5UQUJMRV9ERUZBVUxUX09QVElPTlNbIHNpbXBsZUtleSBdICkge1xuICAgICAgICAgIC8vIEB0cy1leHBlY3QtZXJyb3JcbiAgICAgICAgICBvcHRpb25zWyBzaW1wbGVLZXkgXSA9IG5vZGVbIHNpbXBsZUtleSBdO1xuICAgICAgICB9XG4gICAgICB9ICk7XG5cbiAgICAgIC8vIElnbm9yaW5nIGNhY2hlZFBhaW50cywgc2luY2Ugd2UnZCAnZG91YmxlJyBpdCBhbnl3YXlzXG5cbiAgICAgIGlmICggbm9kZS5maWxsICE9PSBQQUlOVEFCTEVfREVGQVVMVF9PUFRJT05TLmZpbGwgKSB7XG4gICAgICAgIHNldHVwLmZpbGwgPSBzY2VuZXJ5U2VyaWFsaXplKCBub2RlLmZpbGwgKTtcbiAgICAgIH1cbiAgICAgIGlmICggbm9kZS5zdHJva2UgIT09IFBBSU5UQUJMRV9ERUZBVUxUX09QVElPTlMuc3Ryb2tlICkge1xuICAgICAgICBzZXR1cC5zdHJva2UgPSBzY2VuZXJ5U2VyaWFsaXplKCBub2RlLnN0cm9rZSApO1xuICAgICAgfVxuICAgICAgaWYgKCBub2RlLmxpbmVEYXNoLmxlbmd0aCApIHtcbiAgICAgICAgc2V0dXAubGluZURhc2ggPSBzY2VuZXJ5U2VyaWFsaXplKCBub2RlLmxpbmVEYXNoICk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHNlcmlhbGl6YXRpb247XG4gIH1cbiAgZWxzZSBpZiAoIHZhbHVlIGluc3RhbmNlb2YgRGlzcGxheSApIHtcbiAgICByZXR1cm4ge1xuICAgICAgdHlwZTogJ0Rpc3BsYXknLFxuICAgICAgd2lkdGg6IHZhbHVlLndpZHRoLFxuICAgICAgaGVpZ2h0OiB2YWx1ZS5oZWlnaHQsXG4gICAgICBiYWNrZ3JvdW5kQ29sb3I6IHNjZW5lcnlTZXJpYWxpemUoIHZhbHVlLmJhY2tncm91bmRDb2xvciApLFxuICAgICAgdHJlZToge1xuICAgICAgICB0eXBlOiAnU3VidHJlZScsXG4gICAgICAgIHJvb3ROb2RlSWQ6IHZhbHVlLnJvb3ROb2RlLmlkLFxuICAgICAgICBub2Rlczogc2VyaWFsaXplQ29ubmVjdGVkTm9kZXMoIHZhbHVlLnJvb3ROb2RlIClcbiAgICAgIH1cbiAgICB9O1xuICB9XG4gIGVsc2Uge1xuICAgIHJldHVybiB7XG4gICAgICB0eXBlOiAndmFsdWUnLFxuICAgICAgdmFsdWU6IHZhbHVlXG4gICAgfTtcbiAgfVxufTtcblxuY29uc3Qgc2VyaWFsaXplQ29ubmVjdGVkTm9kZXMgPSAoIHJvb3ROb2RlOiBOb2RlICk6IEludGVudGlvbmFsQW55ID0+IHtcbiAgcmV0dXJuIHJvb3ROb2RlLmdldFN1YnRyZWVOb2RlcygpLm1hcCggc2NlbmVyeVNlcmlhbGl6ZSApO1xufTtcblxuc2NlbmVyeS5yZWdpc3RlciggJ3NjZW5lcnlTZXJpYWxpemUnLCBzY2VuZXJ5U2VyaWFsaXplICk7XG5leHBvcnQgeyBzY2VuZXJ5U2VyaWFsaXplIGFzIGRlZmF1bHQsIHNlcmlhbGl6ZUNvbm5lY3RlZE5vZGVzIH07Il0sIm5hbWVzIjpbIlJlYWRPbmx5UHJvcGVydHkiLCJUaW55UHJvcGVydHkiLCJCb3VuZHMyIiwiTWF0cml4MyIsIlZlY3RvcjIiLCJTaGFwZSIsImluaGVyaXRhbmNlIiwiQ2FudmFzQ29udGV4dFdyYXBwZXIiLCJDYW52YXNOb2RlIiwiQ2lyY2xlIiwiQ29sb3IiLCJEaXNwbGF5IiwiRE9NIiwiR3JhZGllbnQiLCJJbWFnZSIsIkxpbmUiLCJMaW5lYXJHcmFkaWVudCIsIk5vZGUiLCJQYWludCIsIlBBSU5UQUJMRV9ERUZBVUxUX09QVElPTlMiLCJQYXRoIiwiUGF0dGVybiIsIlJhZGlhbEdyYWRpZW50IiwiUmVjdGFuZ2xlIiwic2NlbmVyeSIsIlRleHQiLCJXZWJHTE5vZGUiLCJzY2VuZXJ5U2VyaWFsaXplIiwidmFsdWUiLCJ0eXBlIiwieCIsInkiLCJtMDAiLCJtMDEiLCJtMDIiLCJtMTAiLCJtMTEiLCJtMTIiLCJtMjAiLCJtMjEiLCJtMjIiLCJib3VuZHMiLCJtYXhYIiwibWF4WSIsIm1pblgiLCJtaW5ZIiwicGF0aCIsImdldFNWR1BhdGgiLCJBcnJheSIsImlzQXJyYXkiLCJtYXAiLCJyZWQiLCJncmVlbiIsImJsdWUiLCJhbHBoYSIsInBhaW50U2VyaWFsaXphdGlvbiIsInRyYW5zZm9ybU1hdHJpeCIsInN0b3BzIiwic3RvcCIsInJhdGlvIiwiY29sb3IiLCJzdGFydCIsImVuZCIsInN0YXJ0UmFkaXVzIiwiZW5kUmFkaXVzIiwidXJsIiwiaW1hZ2UiLCJzcmMiLCJub2RlIiwib3B0aW9ucyIsInNldHVwIiwiZm9yRWFjaCIsInNpbXBsZUtleSIsIkRFRkFVTFRfTk9ERV9PUFRJT05TIiwic2VyaWFsaXplZEtleSIsIm1hdHJpeCIsImlzSWRlbnRpdHkiLCJfbG9jYWxCb3VuZHNPdmVycmlkZGVuIiwibG9jYWxCb3VuZHMiLCJjaGlsZHJlbiIsImNoaWxkIiwiaWQiLCJoYXNJbnB1dExpc3RlbmVycyIsImlucHV0TGlzdGVuZXJzIiwibGVuZ3RoIiwic2VyaWFsaXphdGlvbiIsInR5cGVzIiwiY29uc3RydWN0b3IiLCJuYW1lIiwiZmlsdGVyIiwic2hhcGUiLCJib3VuZHNNZXRob2QiLCJERUZBVUxUX1BBVEhfT1BUSU9OUyIsInJhZGl1cyIsIngxIiwieTEiLCJ4MiIsInkyIiwicmVjdFgiLCJyZWN0WSIsInJlY3RXaWR0aCIsInJlY3RIZWlnaHQiLCJjb3JuZXJYUmFkaXVzIiwiY29ybmVyWVJhZGl1cyIsInN0cmluZyIsImZvbnQiLCJERUZBVUxUX0lNQUdFX09QVElPTlMiLCJ3aWR0aCIsImltYWdlV2lkdGgiLCJoZWlnaHQiLCJpbWFnZUhlaWdodCIsIl9taXBtYXBEYXRhIiwiaW1hZ2VUeXBlIiwibWlwbWFwRGF0YSIsImxldmVsIiwiX21pcG1hcCIsImdlbmVyYXRlTWlwbWFwcyIsIl9pbWFnZSIsIkhUTUxJbWFnZUVsZW1lbnQiLCJIVE1MQ2FudmFzRWxlbWVudCIsInRvRGF0YVVSTCIsImNhbnZhc0JvdW5kcyIsInNjYWxlIiwiY2FudmFzIiwiZG9jdW1lbnQiLCJjcmVhdGVFbGVtZW50IiwiTWF0aCIsImNlaWwiLCJjb250ZXh0IiwiZ2V0Q29udGV4dCIsIndyYXBwZXIiLCJzZXRUcmFuc2Zvcm0iLCJsZWZ0IiwidG9wIiwicmVuZGVyVG9DYW52YXNTZWxmIiwib2Zmc2V0IiwibGVmdFRvcCIsImVsZW1lbnQiLCJ3aW5kb3ciLCJYTUxTZXJpYWxpemVyIiwic2VyaWFsaXplVG9TdHJpbmciLCJkYXRhVVJMIiwicHJldmVudFRyYW5zZm9ybSIsImZpbGwiLCJzdHJva2UiLCJsaW5lRGFzaCIsImJhY2tncm91bmRDb2xvciIsInRyZWUiLCJyb290Tm9kZUlkIiwicm9vdE5vZGUiLCJub2RlcyIsInNlcmlhbGl6ZUNvbm5lY3RlZE5vZGVzIiwiZ2V0U3VidHJlZU5vZGVzIiwicmVnaXN0ZXIiLCJkZWZhdWx0Il0sIm1hcHBpbmdzIjoiQUFBQSxzREFBc0Q7QUFFdEQ7Ozs7O0NBS0MsR0FFRCxPQUFPQSxzQkFBc0IsdUNBQXVDO0FBQ3BFLE9BQU9DLGtCQUFrQixtQ0FBbUM7QUFDNUQsT0FBT0MsYUFBYSw2QkFBNkI7QUFDakQsT0FBT0MsYUFBYSw2QkFBNkI7QUFDakQsT0FBT0MsYUFBYSw2QkFBNkI7QUFDakQsU0FBU0MsS0FBSyxRQUFRLDhCQUE4QjtBQUNwRCxPQUFPQyxpQkFBaUIsdUNBQXVDO0FBRS9ELFNBQVNDLG9CQUFvQixFQUFFQyxVQUFVLEVBQUVDLE1BQU0sRUFBRUMsS0FBSyxFQUFFQyxPQUFPLEVBQUVDLEdBQUcsRUFBRUMsUUFBUSxFQUFFQyxLQUFLLEVBQUVDLElBQUksRUFBRUMsY0FBYyxFQUFFQyxJQUFJLEVBQUVDLEtBQUssRUFBRUMseUJBQXlCLEVBQUVDLElBQUksRUFBRUMsT0FBTyxFQUFFQyxjQUFjLEVBQUVDLFNBQVMsRUFBRUMsT0FBTyxFQUFFQyxJQUFJLEVBQUVDLFNBQVMsUUFBUSxnQkFBZ0I7QUFFalAsTUFBTUMsbUJBQW1CLENBQUVDO0lBQ3pC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