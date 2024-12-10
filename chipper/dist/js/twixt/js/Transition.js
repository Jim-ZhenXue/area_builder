// Copyright 2023-2024, University of Colorado Boulder
/**
 * An animation that will animate one object (usually a Node) out, and another in.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ import { Shape } from '../../kite/js/imports.js';
import merge from '../../phet-core/js/merge.js';
import optionize, { combineOptions } from '../../phet-core/js/optionize.js';
import required from '../../phet-core/js/required.js';
import Animation from './Animation.js';
import twixt from './twixt.js';
let Transition = class Transition extends Animation {
    /**
   * Creates an animation that slides the `fromNode` out to the left (and the `toNode` in from the right).
   *
   * @param bounds
   * @param fromNode
   * @param toNode
   * @param [options] - Usually specify duration, easing, or other Animation options.
   */ static slideLeft(bounds, fromNode, toNode, options) {
        return Transition.createSlide(fromNode, toNode, 'x', bounds.width, true, options);
    }
    /**
   * Creates an animation that slides the `fromNode` out to the right (and the `toNode` in from the left).
   *
   * @param bounds
   * @param fromNode
   * @param toNode
   * @param [options] - Usually specify duration, easing, or other Animation options.
   */ static slideRight(bounds, fromNode, toNode, options) {
        return Transition.createSlide(fromNode, toNode, 'x', bounds.width, false, options);
    }
    /**
   * Creates an animation that slides the `fromNode` out to the top (and the `toNode` in from the bottom).
   *
   * @param bounds
   * @param fromNode
   * @param toNode
   * @param [options] - Usually specify duration, easing, or other Animation options.
   */ static slideUp(bounds, fromNode, toNode, options) {
        return Transition.createSlide(fromNode, toNode, 'y', bounds.height, true, options);
    }
    /**
   * Creates an animation that slides the `fromNode` out to the bottom (and the `toNode` in from the top).
   *
   * @param bounds
   * @param fromNode
   * @param toNode
   * @param [options] - Usually specify duration, easing, or other Animation options.
   */ static slideDown(bounds, fromNode, toNode, options) {
        return Transition.createSlide(fromNode, toNode, 'y', bounds.height, false, options);
    }
    /**
   * Creates a transition that wipes across the screen, moving to the left.
   *
   * @param bounds
   * @param fromNode
   * @param toNode
   * @param [options] - Usually specify duration, easing, or other Animation options.
   */ static wipeLeft(bounds, fromNode, toNode, options) {
        return Transition.createWipe(bounds, fromNode, toNode, 'maxX', 'minX', options);
    }
    /**
   * Creates a transition that wipes across the screen, moving to the right.
   *
   * @param bounds
   * @param fromNode
   * @param toNode
   * @param [options] - Usually specify duration, easing, or other Animation options.
   */ static wipeRight(bounds, fromNode, toNode, options) {
        return Transition.createWipe(bounds, fromNode, toNode, 'minX', 'maxX', options);
    }
    /**
   * Creates a transition that wipes across the screen, moving up.
   *
   * @param bounds
   * @param fromNode
   * @param toNode
   * @param [options] - Usually specify duration, easing, or other Animation options.
   */ static wipeUp(bounds, fromNode, toNode, options) {
        return Transition.createWipe(bounds, fromNode, toNode, 'maxY', 'minY', options);
    }
    /**
   * Creates a transition that wipes across the screen, moving down.
   *
   * @param bounds
   * @param fromNode
   * @param toNode
   * @param [options] - Usually specify duration, easing, or other Animation options.
   */ static wipeDown(bounds, fromNode, toNode, options) {
        return Transition.createWipe(bounds, fromNode, toNode, 'minY', 'maxY', options);
    }
    /**
   * Creates a transition that fades from `fromNode` to `toNode` by varying the opacity of both.
   *
   * @param fromNode
   * @param toNode
   * @param [providedOptions] - Usually specify duration, easing, or other Animation options.
   */ static dissolve(fromNode, toNode, providedOptions) {
        const gammaBlend = (a, b, ratio)=>{
            return Math.pow((1 - ratio) * a + ratio * b, options.gamma);
        };
        const options = optionize()({
            // Handles gamma correction for the opacity when required
            gamma: 1,
            fromTargets: [
                {
                    attribute: 'opacity',
                    from: 1,
                    to: 0,
                    blend: gammaBlend
                }
            ],
            toTargets: [
                {
                    attribute: 'opacity',
                    from: 0,
                    to: 1,
                    blend: gammaBlend
                }
            ],
            resetNode: (node)=>{
                node.opacity = 1;
            }
        }, providedOptions);
        // @ts-expect-error WHY?
        return new Transition(fromNode, toNode, options);
    }
    /**
   * Creates a sliding transition within the bounds.
   *
   * @param fromNode
   * @param toNode
   * @param attribute - The positional attribute to animate
   * @param size - The size of the animation (for the positional attribute)
   * @param reversed - Whether to reverse the animation. By default it goes right/down.
   * @param [options]
   */ static createSlide(fromNode, toNode, attribute, size, reversed, options) {
        const sign = reversed ? -1 : 1;
        return new Transition(fromNode, toNode, optionize()({
            fromTargets: [
                {
                    attribute: attribute,
                    from: 0,
                    to: size * sign
                }
            ],
            toTargets: [
                {
                    attribute: attribute,
                    from: -size * sign,
                    to: 0
                }
            ],
            resetNode: (node)=>{
                // @ts-expect-error
                node[attribute] = 0;
            }
        }, options));
    }
    /**
   * Creates a wiping transition within the bounds.
   *
   * @param bounds
   * @param fromNode
   * @param toNode
   * @param minAttribute - One side of the bounds on the minimal side (where the animation starts)
   * @param maxAttribute - The other side of the bounds (where animation ends)
   * @param [options]
   */ static createWipe(bounds, fromNode, toNode, minAttribute, maxAttribute, options) {
        const fromNodeBounds = bounds.copy();
        const toNodeBounds = bounds.copy();
        fromNodeBounds[minAttribute] = bounds[maxAttribute];
        toNodeBounds[maxAttribute] = bounds[minAttribute];
        // We need to apply custom clip area interpolation
        const clipBlend = (boundsA, boundsB, ratio)=>{
            return Shape.bounds(boundsA.blend(boundsB, ratio));
        };
        return new Transition(fromNode, toNode, optionize()({
            fromTargets: [
                {
                    attribute: 'clipArea',
                    from: bounds,
                    to: fromNodeBounds,
                    // @ts-expect-error EEEEK - we're relying on blend to convert a bounds to a shape...?
                    blend: clipBlend
                }
            ],
            toTargets: [
                {
                    attribute: 'clipArea',
                    from: toNodeBounds,
                    to: bounds,
                    // @ts-expect-error EEEEK - we're relying on blend to convert a bounds to a shape...?
                    blend: clipBlend
                }
            ],
            resetNode: function(node) {
                node.clipArea = null;
            }
        }, options));
    }
    /**
   * NOTE: The nodes' transform/pickability/visibility/opacity/clipArea/etc. can be modified, and will be reset to
   * the default value when the transition finishes.
   */ constructor(fromNode, toNode, config){
        const defaults = {
            fromTargets: required(config.fromTargets),
            toTargets: required(config.toTargets),
            resetNode: required(config.resetNode),
            // {Object|null} (optional) - Passed as additional objects to every target
            targetOptions: null
        };
        config = merge({}, defaults, config);
        assert && assert(typeof config.resetNode === 'function');
        const targetOptions = merge({
        }, config.targetOptions);
        let targets = [];
        if (fromNode) {
            targets = targets.concat(config.fromTargets.map((target)=>{
                return combineOptions(target, {
                    object: fromNode
                }, targetOptions);
            }));
        }
        if (toNode) {
            targets = targets.concat(config.toTargets.map((target)=>{
                return combineOptions(target, {
                    object: toNode
                }, targetOptions);
            }));
        }
        super(combineOptions({
            // @ts-expect-error - Because we can't unroll the types in the maps above.
            targets: targets
        }, _.omit(config, _.keys(defaults))));
        // When this animation ends, reset the values for both nodes
        this.endedEmitter.addListener(()=>{
            fromNode && config.resetNode(fromNode);
            toNode && config.resetNode(toNode);
        });
    }
};
twixt.register('Transition', Transition);
export default Transition;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3R3aXh0L2pzL1RyYW5zaXRpb24udHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjMtMjAyNCwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbi8qKlxuICogQW4gYW5pbWF0aW9uIHRoYXQgd2lsbCBhbmltYXRlIG9uZSBvYmplY3QgKHVzdWFsbHkgYSBOb2RlKSBvdXQsIGFuZCBhbm90aGVyIGluLlxuICpcbiAqIEBhdXRob3IgSm9uYXRoYW4gT2xzb24gPGpvbmF0aGFuLm9sc29uQGNvbG9yYWRvLmVkdT5cbiAqL1xuXG5pbXBvcnQgQm91bmRzMiBmcm9tICcuLi8uLi9kb3QvanMvQm91bmRzMi5qcyc7XG5pbXBvcnQgeyBTaGFwZSB9IGZyb20gJy4uLy4uL2tpdGUvanMvaW1wb3J0cy5qcyc7XG5pbXBvcnQgbWVyZ2UgZnJvbSAnLi4vLi4vcGhldC1jb3JlL2pzL21lcmdlLmpzJztcbmltcG9ydCBvcHRpb25pemUsIHsgY29tYmluZU9wdGlvbnMsIEVtcHR5U2VsZk9wdGlvbnMgfSBmcm9tICcuLi8uLi9waGV0LWNvcmUvanMvb3B0aW9uaXplLmpzJztcbmltcG9ydCByZXF1aXJlZCBmcm9tICcuLi8uLi9waGV0LWNvcmUvanMvcmVxdWlyZWQuanMnO1xuaW1wb3J0IEtleXNNYXRjaGluZyBmcm9tICcuLi8uLi9waGV0LWNvcmUvanMvdHlwZXMvS2V5c01hdGNoaW5nLmpzJztcbmltcG9ydCBTdHJpY3RPbWl0IGZyb20gJy4uLy4uL3BoZXQtY29yZS9qcy90eXBlcy9TdHJpY3RPbWl0LmpzJztcbmltcG9ydCBXcml0YWJsZUtleXMgZnJvbSAnLi4vLi4vcGhldC1jb3JlL2pzL3R5cGVzL1dyaXRhYmxlS2V5cy5qcyc7XG5pbXBvcnQgeyBOb2RlIH0gZnJvbSAnLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcbmltcG9ydCBBbmltYXRpb24sIHsgQW5pbWF0aW9uT3B0aW9ucyB9IGZyb20gJy4vQW5pbWF0aW9uLmpzJztcbmltcG9ydCB7IEFuaW1hdGlvblRhcmdldE9wdGlvbnMgfSBmcm9tICcuL0FuaW1hdGlvblRhcmdldC5qcyc7XG5pbXBvcnQgdHdpeHQgZnJvbSAnLi90d2l4dC5qcyc7XG5cbnR5cGUgU2VsZk9wdGlvbnM8VGFyZ2V0VHlwZXM+ID0ge1xuICAvLyBBIGxpc3Qgb2YgcGFydGlhbCBjb25maWd1cmF0aW9ucyB0aGF0IHdpbGwgaW5kaXZpZHVhbGx5IGJlIHBhc3NlZCB0byB0aGUgdGFyZ2V0cyBmb3IgYW4gQW5pbWF0aW9uIChhbmQgdGh1cyB0b1xuICAvLyBBbmltYXRpb25UYXJnZXQpLiBUaGV5IHdpbGwgYmUgY29tYmluZWQgd2l0aCBgb2JqZWN0OiBub2RlYCBhbmQgb3B0aW9ucy50YXJnZXRPcHRpb25zIHRvIGNyZWF0ZSB0aGUgQW5pbWF0aW9uLlxuICAvLyBTZWUgQW5pbWF0aW9uJ3MgdGFyZ2V0cyBwYXJhbWV0ZXIgZm9yIG1vcmUgaW5mb3JtYXRpb25cbiAgZnJvbVRhcmdldHM6IHsgW0sgaW4ga2V5b2YgVGFyZ2V0VHlwZXNdOiBBbmltYXRpb25UYXJnZXRPcHRpb25zPFRhcmdldFR5cGVzW0tdLCBOb2RlPiB9O1xuICB0b1RhcmdldHM6IHsgW0sgaW4ga2V5b2YgVGFyZ2V0VHlwZXNdOiBBbmltYXRpb25UYXJnZXRPcHRpb25zPFRhcmdldFR5cGVzW0tdLCBOb2RlPiB9O1xuXG4gIC8vIHJlc2V0cyB0aGUgYW5pbWF0ZWQgcGFyYW1ldGVyKHMpIHRvIHRoZWlyIGRlZmF1bHQgdmFsdWVzLlxuICByZXNldE5vZGU6ICggbm9kZTogTm9kZSApID0+IHZvaWQ7XG5cbiAgdGFyZ2V0T3B0aW9ucz86IEFuaW1hdGlvblRhcmdldE9wdGlvbnM8dW5rbm93biwgTm9kZT47XG59O1xuXG5leHBvcnQgdHlwZSBQYXJ0aWFsVHJhbnNpdGlvbk9wdGlvbnM8VD4gPSBTdHJpY3RPbWl0PFNlbGZPcHRpb25zPFsgVCBdPiwgJ2Zyb21UYXJnZXRzJyB8ICd0b1RhcmdldHMnIHwgJ3Jlc2V0Tm9kZSc+ICYgQW5pbWF0aW9uT3B0aW9uczx1bmtub3duLCB1bmtub3duLCBbIFQgXSwgWyBOb2RlIF0+O1xuXG5leHBvcnQgdHlwZSBTbGlkZVRyYW5zaXRpb25PcHRpb25zID0gUGFydGlhbFRyYW5zaXRpb25PcHRpb25zPG51bWJlcj47XG5leHBvcnQgdHlwZSBXaXBlVHJhbnNpdGlvbk9wdGlvbnMgPSBQYXJ0aWFsVHJhbnNpdGlvbk9wdGlvbnM8U2hhcGU+O1xuXG5leHBvcnQgdHlwZSBEaXNzb2x2ZVRyYW5zaXRpb25TZWxmT3B0aW9ucyA9IHsgZ2FtbWE/OiBudW1iZXIgfTtcbmV4cG9ydCB0eXBlIERpc3NvbHZlVHJhbnNpdGlvbk9wdGlvbnMgPSBQYXJ0aWFsVHJhbnNpdGlvbk9wdGlvbnM8bnVtYmVyPiAmIERpc3NvbHZlVHJhbnNpdGlvblNlbGZPcHRpb25zO1xuXG5leHBvcnQgdHlwZSBUcmFuc2l0aW9uT3B0aW9uczxTZWxmVHlwZSA9IHVua25vd24sIFNlbGZPYmplY3RUeXBlID0gdW5rbm93biwgVGFyZ2V0VHlwZXMgPSB1bmtub3duW10sIFRhcmdldE9iamVjdFR5cGVzIGV4dGVuZHMgeyBbSyBpbiBrZXlvZiBUYXJnZXRUeXBlc106IE5vZGUgfSA9IHsgW0sgaW4ga2V5b2YgVGFyZ2V0VHlwZXNdOiBOb2RlIH0+ID0gU2VsZk9wdGlvbnM8VGFyZ2V0VHlwZXM+ICYgQW5pbWF0aW9uT3B0aW9uczxTZWxmVHlwZSwgU2VsZk9iamVjdFR5cGUsIFRhcmdldFR5cGVzLCBUYXJnZXRPYmplY3RUeXBlcz47XG5cbmNsYXNzIFRyYW5zaXRpb248U2VsZlR5cGUgPSB1bmtub3duLCBTZWxmT2JqZWN0VHlwZSA9IHVua25vd24sIFRhcmdldFR5cGVzID0gdW5rbm93bltdLCBUYXJnZXRPYmplY3RUeXBlcyBleHRlbmRzIHsgW0sgaW4ga2V5b2YgVGFyZ2V0VHlwZXNdOiBOb2RlIH0gPSB7IFtLIGluIGtleW9mIFRhcmdldFR5cGVzXTogTm9kZSB9PiBleHRlbmRzIEFuaW1hdGlvbjxTZWxmVHlwZSwgU2VsZk9iamVjdFR5cGUsIFRhcmdldFR5cGVzLCBUYXJnZXRPYmplY3RUeXBlcz4ge1xuXG4gIC8qKlxuICAgKiBOT1RFOiBUaGUgbm9kZXMnIHRyYW5zZm9ybS9waWNrYWJpbGl0eS92aXNpYmlsaXR5L29wYWNpdHkvY2xpcEFyZWEvZXRjLiBjYW4gYmUgbW9kaWZpZWQsIGFuZCB3aWxsIGJlIHJlc2V0IHRvXG4gICAqIHRoZSBkZWZhdWx0IHZhbHVlIHdoZW4gdGhlIHRyYW5zaXRpb24gZmluaXNoZXMuXG4gICAqL1xuICBwdWJsaWMgY29uc3RydWN0b3IoIGZyb21Ob2RlOiBOb2RlIHwgbnVsbCwgdG9Ob2RlOiBOb2RlIHwgbnVsbCwgY29uZmlnOiBUcmFuc2l0aW9uT3B0aW9ucyApIHtcbiAgICBjb25zdCBkZWZhdWx0cyA9IHtcbiAgICAgIGZyb21UYXJnZXRzOiByZXF1aXJlZCggY29uZmlnLmZyb21UYXJnZXRzICksXG4gICAgICB0b1RhcmdldHM6IHJlcXVpcmVkKCBjb25maWcudG9UYXJnZXRzICksXG4gICAgICByZXNldE5vZGU6IHJlcXVpcmVkKCBjb25maWcucmVzZXROb2RlICksXG5cbiAgICAgIC8vIHtPYmplY3R8bnVsbH0gKG9wdGlvbmFsKSAtIFBhc3NlZCBhcyBhZGRpdGlvbmFsIG9iamVjdHMgdG8gZXZlcnkgdGFyZ2V0XG4gICAgICB0YXJnZXRPcHRpb25zOiBudWxsXG4gICAgfTtcbiAgICBjb25maWcgPSBtZXJnZSgge30sIGRlZmF1bHRzLCBjb25maWcgKTtcblxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHR5cGVvZiBjb25maWcucmVzZXROb2RlID09PSAnZnVuY3Rpb24nICk7XG5cbiAgICBjb25zdCB0YXJnZXRPcHRpb25zID0gbWVyZ2UoIHtcbiAgICAgIC8vIE5PVEU6IG5vIGRlZmF1bHRzLCBidXQgd2Ugd2FudCBpdCB0byBiZSBhbiBvYmplY3Qgc28gd2UgbWVyZ2UgYW55d2F5c1xuICAgIH0sIGNvbmZpZy50YXJnZXRPcHRpb25zICk7XG5cbiAgICBsZXQgdGFyZ2V0czogQW5pbWF0aW9uVGFyZ2V0T3B0aW9uczx1bmtub3duLCBOb2RlPltdID0gW107XG5cbiAgICBpZiAoIGZyb21Ob2RlICkge1xuICAgICAgdGFyZ2V0cyA9IHRhcmdldHMuY29uY2F0KCBjb25maWcuZnJvbVRhcmdldHMubWFwKCB0YXJnZXQgPT4ge1xuICAgICAgICByZXR1cm4gY29tYmluZU9wdGlvbnM8QW5pbWF0aW9uVGFyZ2V0T3B0aW9uczx1bmtub3duLCBOb2RlPj4oIHRhcmdldCwge1xuICAgICAgICAgIG9iamVjdDogZnJvbU5vZGVcbiAgICAgICAgfSwgdGFyZ2V0T3B0aW9ucyApO1xuICAgICAgfSApICk7XG4gICAgfVxuICAgIGlmICggdG9Ob2RlICkge1xuICAgICAgdGFyZ2V0cyA9IHRhcmdldHMuY29uY2F0KCBjb25maWcudG9UYXJnZXRzLm1hcCggdGFyZ2V0ID0+IHtcbiAgICAgICAgcmV0dXJuIGNvbWJpbmVPcHRpb25zPEFuaW1hdGlvblRhcmdldE9wdGlvbnM8dW5rbm93biwgTm9kZT4+KCB0YXJnZXQsIHtcbiAgICAgICAgICBvYmplY3Q6IHRvTm9kZVxuICAgICAgICB9LCB0YXJnZXRPcHRpb25zICk7XG4gICAgICB9ICkgKTtcbiAgICB9XG5cbiAgICBzdXBlciggY29tYmluZU9wdGlvbnM8QW5pbWF0aW9uT3B0aW9uczxTZWxmVHlwZSwgU2VsZk9iamVjdFR5cGUsIFRhcmdldFR5cGVzLCBUYXJnZXRPYmplY3RUeXBlcz4+KCB7XG4gICAgICAvLyBAdHMtZXhwZWN0LWVycm9yIC0gQmVjYXVzZSB3ZSBjYW4ndCB1bnJvbGwgdGhlIHR5cGVzIGluIHRoZSBtYXBzIGFib3ZlLlxuICAgICAgdGFyZ2V0czogdGFyZ2V0c1xuICAgIH0sIF8ub21pdCggY29uZmlnLCBfLmtleXMoIGRlZmF1bHRzICkgKSApICk7XG5cbiAgICAvLyBXaGVuIHRoaXMgYW5pbWF0aW9uIGVuZHMsIHJlc2V0IHRoZSB2YWx1ZXMgZm9yIGJvdGggbm9kZXNcbiAgICB0aGlzLmVuZGVkRW1pdHRlci5hZGRMaXN0ZW5lciggKCkgPT4ge1xuICAgICAgZnJvbU5vZGUgJiYgY29uZmlnLnJlc2V0Tm9kZSggZnJvbU5vZGUgKTtcbiAgICAgIHRvTm9kZSAmJiBjb25maWcucmVzZXROb2RlKCB0b05vZGUgKTtcbiAgICB9ICk7XG4gIH1cblxuICAvKipcbiAgICogQ3JlYXRlcyBhbiBhbmltYXRpb24gdGhhdCBzbGlkZXMgdGhlIGBmcm9tTm9kZWAgb3V0IHRvIHRoZSBsZWZ0IChhbmQgdGhlIGB0b05vZGVgIGluIGZyb20gdGhlIHJpZ2h0KS5cbiAgICpcbiAgICogQHBhcmFtIGJvdW5kc1xuICAgKiBAcGFyYW0gZnJvbU5vZGVcbiAgICogQHBhcmFtIHRvTm9kZVxuICAgKiBAcGFyYW0gW29wdGlvbnNdIC0gVXN1YWxseSBzcGVjaWZ5IGR1cmF0aW9uLCBlYXNpbmcsIG9yIG90aGVyIEFuaW1hdGlvbiBvcHRpb25zLlxuICAgKi9cbiAgcHVibGljIHN0YXRpYyBzbGlkZUxlZnQoIGJvdW5kczogQm91bmRzMiwgZnJvbU5vZGU6IE5vZGUgfCBudWxsLCB0b05vZGU6IE5vZGUgfCBudWxsLCBvcHRpb25zPzogU2xpZGVUcmFuc2l0aW9uT3B0aW9ucyApOiBUcmFuc2l0aW9uIHtcbiAgICByZXR1cm4gVHJhbnNpdGlvbi5jcmVhdGVTbGlkZSggZnJvbU5vZGUsIHRvTm9kZSwgJ3gnLCBib3VuZHMud2lkdGgsIHRydWUsIG9wdGlvbnMgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDcmVhdGVzIGFuIGFuaW1hdGlvbiB0aGF0IHNsaWRlcyB0aGUgYGZyb21Ob2RlYCBvdXQgdG8gdGhlIHJpZ2h0IChhbmQgdGhlIGB0b05vZGVgIGluIGZyb20gdGhlIGxlZnQpLlxuICAgKlxuICAgKiBAcGFyYW0gYm91bmRzXG4gICAqIEBwYXJhbSBmcm9tTm9kZVxuICAgKiBAcGFyYW0gdG9Ob2RlXG4gICAqIEBwYXJhbSBbb3B0aW9uc10gLSBVc3VhbGx5IHNwZWNpZnkgZHVyYXRpb24sIGVhc2luZywgb3Igb3RoZXIgQW5pbWF0aW9uIG9wdGlvbnMuXG4gICAqL1xuICBwdWJsaWMgc3RhdGljIHNsaWRlUmlnaHQoIGJvdW5kczogQm91bmRzMiwgZnJvbU5vZGU6IE5vZGUgfCBudWxsLCB0b05vZGU6IE5vZGUgfCBudWxsLCBvcHRpb25zPzogU2xpZGVUcmFuc2l0aW9uT3B0aW9ucyApOiBUcmFuc2l0aW9uIHtcbiAgICByZXR1cm4gVHJhbnNpdGlvbi5jcmVhdGVTbGlkZSggZnJvbU5vZGUsIHRvTm9kZSwgJ3gnLCBib3VuZHMud2lkdGgsIGZhbHNlLCBvcHRpb25zICk7XG4gIH1cblxuICAvKipcbiAgICogQ3JlYXRlcyBhbiBhbmltYXRpb24gdGhhdCBzbGlkZXMgdGhlIGBmcm9tTm9kZWAgb3V0IHRvIHRoZSB0b3AgKGFuZCB0aGUgYHRvTm9kZWAgaW4gZnJvbSB0aGUgYm90dG9tKS5cbiAgICpcbiAgICogQHBhcmFtIGJvdW5kc1xuICAgKiBAcGFyYW0gZnJvbU5vZGVcbiAgICogQHBhcmFtIHRvTm9kZVxuICAgKiBAcGFyYW0gW29wdGlvbnNdIC0gVXN1YWxseSBzcGVjaWZ5IGR1cmF0aW9uLCBlYXNpbmcsIG9yIG90aGVyIEFuaW1hdGlvbiBvcHRpb25zLlxuICAgKi9cbiAgcHVibGljIHN0YXRpYyBzbGlkZVVwKCBib3VuZHM6IEJvdW5kczIsIGZyb21Ob2RlOiBOb2RlIHwgbnVsbCwgdG9Ob2RlOiBOb2RlIHwgbnVsbCwgb3B0aW9ucz86IFNsaWRlVHJhbnNpdGlvbk9wdGlvbnMgKTogVHJhbnNpdGlvbiB7XG4gICAgcmV0dXJuIFRyYW5zaXRpb24uY3JlYXRlU2xpZGUoIGZyb21Ob2RlLCB0b05vZGUsICd5JywgYm91bmRzLmhlaWdodCwgdHJ1ZSwgb3B0aW9ucyApO1xuICB9XG5cbiAgLyoqXG4gICAqIENyZWF0ZXMgYW4gYW5pbWF0aW9uIHRoYXQgc2xpZGVzIHRoZSBgZnJvbU5vZGVgIG91dCB0byB0aGUgYm90dG9tIChhbmQgdGhlIGB0b05vZGVgIGluIGZyb20gdGhlIHRvcCkuXG4gICAqXG4gICAqIEBwYXJhbSBib3VuZHNcbiAgICogQHBhcmFtIGZyb21Ob2RlXG4gICAqIEBwYXJhbSB0b05vZGVcbiAgICogQHBhcmFtIFtvcHRpb25zXSAtIFVzdWFsbHkgc3BlY2lmeSBkdXJhdGlvbiwgZWFzaW5nLCBvciBvdGhlciBBbmltYXRpb24gb3B0aW9ucy5cbiAgICovXG4gIHB1YmxpYyBzdGF0aWMgc2xpZGVEb3duKCBib3VuZHM6IEJvdW5kczIsIGZyb21Ob2RlOiBOb2RlIHwgbnVsbCwgdG9Ob2RlOiBOb2RlIHwgbnVsbCwgb3B0aW9ucz86IFNsaWRlVHJhbnNpdGlvbk9wdGlvbnMgKTogVHJhbnNpdGlvbiB7XG4gICAgcmV0dXJuIFRyYW5zaXRpb24uY3JlYXRlU2xpZGUoIGZyb21Ob2RlLCB0b05vZGUsICd5JywgYm91bmRzLmhlaWdodCwgZmFsc2UsIG9wdGlvbnMgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDcmVhdGVzIGEgdHJhbnNpdGlvbiB0aGF0IHdpcGVzIGFjcm9zcyB0aGUgc2NyZWVuLCBtb3ZpbmcgdG8gdGhlIGxlZnQuXG4gICAqXG4gICAqIEBwYXJhbSBib3VuZHNcbiAgICogQHBhcmFtIGZyb21Ob2RlXG4gICAqIEBwYXJhbSB0b05vZGVcbiAgICogQHBhcmFtIFtvcHRpb25zXSAtIFVzdWFsbHkgc3BlY2lmeSBkdXJhdGlvbiwgZWFzaW5nLCBvciBvdGhlciBBbmltYXRpb24gb3B0aW9ucy5cbiAgICovXG4gIHB1YmxpYyBzdGF0aWMgd2lwZUxlZnQoIGJvdW5kczogQm91bmRzMiwgZnJvbU5vZGU6IE5vZGUgfCBudWxsLCB0b05vZGU6IE5vZGUgfCBudWxsLCBvcHRpb25zPzogV2lwZVRyYW5zaXRpb25PcHRpb25zICk6IFRyYW5zaXRpb24ge1xuICAgIHJldHVybiBUcmFuc2l0aW9uLmNyZWF0ZVdpcGUoIGJvdW5kcywgZnJvbU5vZGUsIHRvTm9kZSwgJ21heFgnLCAnbWluWCcsIG9wdGlvbnMgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDcmVhdGVzIGEgdHJhbnNpdGlvbiB0aGF0IHdpcGVzIGFjcm9zcyB0aGUgc2NyZWVuLCBtb3ZpbmcgdG8gdGhlIHJpZ2h0LlxuICAgKlxuICAgKiBAcGFyYW0gYm91bmRzXG4gICAqIEBwYXJhbSBmcm9tTm9kZVxuICAgKiBAcGFyYW0gdG9Ob2RlXG4gICAqIEBwYXJhbSBbb3B0aW9uc10gLSBVc3VhbGx5IHNwZWNpZnkgZHVyYXRpb24sIGVhc2luZywgb3Igb3RoZXIgQW5pbWF0aW9uIG9wdGlvbnMuXG4gICAqL1xuICBwdWJsaWMgc3RhdGljIHdpcGVSaWdodCggYm91bmRzOiBCb3VuZHMyLCBmcm9tTm9kZTogTm9kZSB8IG51bGwsIHRvTm9kZTogTm9kZSB8IG51bGwsIG9wdGlvbnM/OiBXaXBlVHJhbnNpdGlvbk9wdGlvbnMgKTogVHJhbnNpdGlvbiB7XG4gICAgcmV0dXJuIFRyYW5zaXRpb24uY3JlYXRlV2lwZSggYm91bmRzLCBmcm9tTm9kZSwgdG9Ob2RlLCAnbWluWCcsICdtYXhYJywgb3B0aW9ucyApO1xuICB9XG5cbiAgLyoqXG4gICAqIENyZWF0ZXMgYSB0cmFuc2l0aW9uIHRoYXQgd2lwZXMgYWNyb3NzIHRoZSBzY3JlZW4sIG1vdmluZyB1cC5cbiAgICpcbiAgICogQHBhcmFtIGJvdW5kc1xuICAgKiBAcGFyYW0gZnJvbU5vZGVcbiAgICogQHBhcmFtIHRvTm9kZVxuICAgKiBAcGFyYW0gW29wdGlvbnNdIC0gVXN1YWxseSBzcGVjaWZ5IGR1cmF0aW9uLCBlYXNpbmcsIG9yIG90aGVyIEFuaW1hdGlvbiBvcHRpb25zLlxuICAgKi9cbiAgcHVibGljIHN0YXRpYyB3aXBlVXAoIGJvdW5kczogQm91bmRzMiwgZnJvbU5vZGU6IE5vZGUgfCBudWxsLCB0b05vZGU6IE5vZGUgfCBudWxsLCBvcHRpb25zPzogV2lwZVRyYW5zaXRpb25PcHRpb25zICk6IFRyYW5zaXRpb24ge1xuICAgIHJldHVybiBUcmFuc2l0aW9uLmNyZWF0ZVdpcGUoIGJvdW5kcywgZnJvbU5vZGUsIHRvTm9kZSwgJ21heFknLCAnbWluWScsIG9wdGlvbnMgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDcmVhdGVzIGEgdHJhbnNpdGlvbiB0aGF0IHdpcGVzIGFjcm9zcyB0aGUgc2NyZWVuLCBtb3ZpbmcgZG93bi5cbiAgICpcbiAgICogQHBhcmFtIGJvdW5kc1xuICAgKiBAcGFyYW0gZnJvbU5vZGVcbiAgICogQHBhcmFtIHRvTm9kZVxuICAgKiBAcGFyYW0gW29wdGlvbnNdIC0gVXN1YWxseSBzcGVjaWZ5IGR1cmF0aW9uLCBlYXNpbmcsIG9yIG90aGVyIEFuaW1hdGlvbiBvcHRpb25zLlxuICAgKi9cbiAgcHVibGljIHN0YXRpYyB3aXBlRG93biggYm91bmRzOiBCb3VuZHMyLCBmcm9tTm9kZTogTm9kZSB8IG51bGwsIHRvTm9kZTogTm9kZSB8IG51bGwsIG9wdGlvbnM/OiBXaXBlVHJhbnNpdGlvbk9wdGlvbnMgKTogVHJhbnNpdGlvbiB7XG4gICAgcmV0dXJuIFRyYW5zaXRpb24uY3JlYXRlV2lwZSggYm91bmRzLCBmcm9tTm9kZSwgdG9Ob2RlLCAnbWluWScsICdtYXhZJywgb3B0aW9ucyApO1xuICB9XG5cbiAgLyoqXG4gICAqIENyZWF0ZXMgYSB0cmFuc2l0aW9uIHRoYXQgZmFkZXMgZnJvbSBgZnJvbU5vZGVgIHRvIGB0b05vZGVgIGJ5IHZhcnlpbmcgdGhlIG9wYWNpdHkgb2YgYm90aC5cbiAgICpcbiAgICogQHBhcmFtIGZyb21Ob2RlXG4gICAqIEBwYXJhbSB0b05vZGVcbiAgICogQHBhcmFtIFtwcm92aWRlZE9wdGlvbnNdIC0gVXN1YWxseSBzcGVjaWZ5IGR1cmF0aW9uLCBlYXNpbmcsIG9yIG90aGVyIEFuaW1hdGlvbiBvcHRpb25zLlxuICAgKi9cbiAgcHVibGljIHN0YXRpYyBkaXNzb2x2ZSggZnJvbU5vZGU6IE5vZGUgfCBudWxsLCB0b05vZGU6IE5vZGUgfCBudWxsLCBwcm92aWRlZE9wdGlvbnM/OiBEaXNzb2x2ZVRyYW5zaXRpb25PcHRpb25zICk6IFRyYW5zaXRpb24ge1xuXG4gICAgY29uc3QgZ2FtbWFCbGVuZCA9ICggYTogbnVtYmVyLCBiOiBudW1iZXIsIHJhdGlvOiBudW1iZXIgKTogbnVtYmVyID0+IHtcbiAgICAgIHJldHVybiBNYXRoLnBvdyggKCAxIC0gcmF0aW8gKSAqIGEgKyByYXRpbyAqIGIsIG9wdGlvbnMuZ2FtbWEgKTtcbiAgICB9O1xuXG4gICAgY29uc3Qgb3B0aW9ucyA9IG9wdGlvbml6ZTxEaXNzb2x2ZVRyYW5zaXRpb25PcHRpb25zLCBEaXNzb2x2ZVRyYW5zaXRpb25TZWxmT3B0aW9ucywgVHJhbnNpdGlvbk9wdGlvbnM8dW5rbm93biwgdW5rbm93biwgWyBudW1iZXIgXSwgWyBOb2RlIF0+PigpKCB7XG4gICAgICAvLyBIYW5kbGVzIGdhbW1hIGNvcnJlY3Rpb24gZm9yIHRoZSBvcGFjaXR5IHdoZW4gcmVxdWlyZWRcbiAgICAgIGdhbW1hOiAxLFxuXG4gICAgICBmcm9tVGFyZ2V0czogWyB7XG4gICAgICAgIGF0dHJpYnV0ZTogJ29wYWNpdHknLFxuICAgICAgICBmcm9tOiAxLFxuICAgICAgICB0bzogMCxcbiAgICAgICAgYmxlbmQ6IGdhbW1hQmxlbmRcbiAgICAgIH0gXSxcbiAgICAgIHRvVGFyZ2V0czogWyB7XG4gICAgICAgIGF0dHJpYnV0ZTogJ29wYWNpdHknLFxuICAgICAgICBmcm9tOiAwLFxuICAgICAgICB0bzogMSxcbiAgICAgICAgYmxlbmQ6IGdhbW1hQmxlbmRcbiAgICAgIH0gXSxcbiAgICAgIHJlc2V0Tm9kZTogKCBub2RlOiBOb2RlICkgPT4ge1xuICAgICAgICBub2RlLm9wYWNpdHkgPSAxO1xuICAgICAgfVxuICAgIH0sIHByb3ZpZGVkT3B0aW9ucyApO1xuXG4gICAgLy8gQHRzLWV4cGVjdC1lcnJvciBXSFk/XG4gICAgcmV0dXJuIG5ldyBUcmFuc2l0aW9uKCBmcm9tTm9kZSwgdG9Ob2RlLCBvcHRpb25zICk7XG4gIH1cblxuICAvKipcbiAgICogQ3JlYXRlcyBhIHNsaWRpbmcgdHJhbnNpdGlvbiB3aXRoaW4gdGhlIGJvdW5kcy5cbiAgICpcbiAgICogQHBhcmFtIGZyb21Ob2RlXG4gICAqIEBwYXJhbSB0b05vZGVcbiAgICogQHBhcmFtIGF0dHJpYnV0ZSAtIFRoZSBwb3NpdGlvbmFsIGF0dHJpYnV0ZSB0byBhbmltYXRlXG4gICAqIEBwYXJhbSBzaXplIC0gVGhlIHNpemUgb2YgdGhlIGFuaW1hdGlvbiAoZm9yIHRoZSBwb3NpdGlvbmFsIGF0dHJpYnV0ZSlcbiAgICogQHBhcmFtIHJldmVyc2VkIC0gV2hldGhlciB0byByZXZlcnNlIHRoZSBhbmltYXRpb24uIEJ5IGRlZmF1bHQgaXQgZ29lcyByaWdodC9kb3duLlxuICAgKiBAcGFyYW0gW29wdGlvbnNdXG4gICAqL1xuICBwcml2YXRlIHN0YXRpYyBjcmVhdGVTbGlkZSggZnJvbU5vZGU6IE5vZGUgfCBudWxsLCB0b05vZGU6IE5vZGUgfCBudWxsLCBhdHRyaWJ1dGU6IEtleXNNYXRjaGluZzxOb2RlLCBudW1iZXI+ICYgV3JpdGFibGVLZXlzPE5vZGU+LCBzaXplOiBudW1iZXIsIHJldmVyc2VkOiBib29sZWFuLCBvcHRpb25zPzogUGFydGlhbFRyYW5zaXRpb25PcHRpb25zPG51bWJlcj4gKTogVHJhbnNpdGlvbiB7XG4gICAgY29uc3Qgc2lnbiA9IHJldmVyc2VkID8gLTEgOiAxO1xuICAgIHJldHVybiBuZXcgVHJhbnNpdGlvbiggZnJvbU5vZGUsIHRvTm9kZSwgb3B0aW9uaXplPFBhcnRpYWxUcmFuc2l0aW9uT3B0aW9uczxudW1iZXI+LCBFbXB0eVNlbGZPcHRpb25zLCBUcmFuc2l0aW9uT3B0aW9ucz4oKSgge1xuICAgICAgZnJvbVRhcmdldHM6IFsge1xuICAgICAgICBhdHRyaWJ1dGU6IGF0dHJpYnV0ZSxcbiAgICAgICAgZnJvbTogMCxcbiAgICAgICAgdG86IHNpemUgKiBzaWduXG4gICAgICB9IF0sXG4gICAgICB0b1RhcmdldHM6IFsge1xuICAgICAgICBhdHRyaWJ1dGU6IGF0dHJpYnV0ZSxcbiAgICAgICAgZnJvbTogLXNpemUgKiBzaWduLFxuICAgICAgICB0bzogMFxuICAgICAgfSBdLFxuICAgICAgcmVzZXROb2RlOiAoIG5vZGU6IE5vZGUgKSA9PiB7XG4gICAgICAgIC8vIEB0cy1leHBlY3QtZXJyb3JcbiAgICAgICAgbm9kZVsgYXR0cmlidXRlIF0gPSAwO1xuICAgICAgfVxuICAgIH0sIG9wdGlvbnMgKSApO1xuICB9XG5cbiAgLyoqXG4gICAqIENyZWF0ZXMgYSB3aXBpbmcgdHJhbnNpdGlvbiB3aXRoaW4gdGhlIGJvdW5kcy5cbiAgICpcbiAgICogQHBhcmFtIGJvdW5kc1xuICAgKiBAcGFyYW0gZnJvbU5vZGVcbiAgICogQHBhcmFtIHRvTm9kZVxuICAgKiBAcGFyYW0gbWluQXR0cmlidXRlIC0gT25lIHNpZGUgb2YgdGhlIGJvdW5kcyBvbiB0aGUgbWluaW1hbCBzaWRlICh3aGVyZSB0aGUgYW5pbWF0aW9uIHN0YXJ0cylcbiAgICogQHBhcmFtIG1heEF0dHJpYnV0ZSAtIFRoZSBvdGhlciBzaWRlIG9mIHRoZSBib3VuZHMgKHdoZXJlIGFuaW1hdGlvbiBlbmRzKVxuICAgKiBAcGFyYW0gW29wdGlvbnNdXG4gICAqL1xuICBwcml2YXRlIHN0YXRpYyBjcmVhdGVXaXBlKCBib3VuZHM6IEJvdW5kczIsIGZyb21Ob2RlOiBOb2RlIHwgbnVsbCwgdG9Ob2RlOiBOb2RlIHwgbnVsbCwgbWluQXR0cmlidXRlOiAnbWluWCcgfCAnbWluWScgfCAnbWF4WCcgfCAnbWF4WScsIG1heEF0dHJpYnV0ZTogJ21pblgnIHwgJ21pblknIHwgJ21heFgnIHwgJ21heFknLCBvcHRpb25zPzogUGFydGlhbFRyYW5zaXRpb25PcHRpb25zPFNoYXBlPiApOiBUcmFuc2l0aW9uIHtcbiAgICBjb25zdCBmcm9tTm9kZUJvdW5kcyA9IGJvdW5kcy5jb3B5KCk7XG4gICAgY29uc3QgdG9Ob2RlQm91bmRzID0gYm91bmRzLmNvcHkoKTtcblxuICAgIGZyb21Ob2RlQm91bmRzWyBtaW5BdHRyaWJ1dGUgXSA9IGJvdW5kc1sgbWF4QXR0cmlidXRlIF07XG4gICAgdG9Ob2RlQm91bmRzWyBtYXhBdHRyaWJ1dGUgXSA9IGJvdW5kc1sgbWluQXR0cmlidXRlIF07XG5cbiAgICAvLyBXZSBuZWVkIHRvIGFwcGx5IGN1c3RvbSBjbGlwIGFyZWEgaW50ZXJwb2xhdGlvblxuICAgIGNvbnN0IGNsaXBCbGVuZCA9ICggYm91bmRzQTogQm91bmRzMiwgYm91bmRzQjogQm91bmRzMiwgcmF0aW86IG51bWJlciApID0+IHtcbiAgICAgIHJldHVybiBTaGFwZS5ib3VuZHMoIGJvdW5kc0EuYmxlbmQoIGJvdW5kc0IsIHJhdGlvICkgKTtcbiAgICB9O1xuXG4gICAgcmV0dXJuIG5ldyBUcmFuc2l0aW9uKCBmcm9tTm9kZSwgdG9Ob2RlLCBvcHRpb25pemU8UGFydGlhbFRyYW5zaXRpb25PcHRpb25zPFNoYXBlPiwgRW1wdHlTZWxmT3B0aW9ucywgVHJhbnNpdGlvbk9wdGlvbnM+KCkoIHtcbiAgICAgIGZyb21UYXJnZXRzOiBbIHtcbiAgICAgICAgYXR0cmlidXRlOiAnY2xpcEFyZWEnLFxuICAgICAgICBmcm9tOiBib3VuZHMsXG4gICAgICAgIHRvOiBmcm9tTm9kZUJvdW5kcyxcbiAgICAgICAgLy8gQHRzLWV4cGVjdC1lcnJvciBFRUVFSyAtIHdlJ3JlIHJlbHlpbmcgb24gYmxlbmQgdG8gY29udmVydCBhIGJvdW5kcyB0byBhIHNoYXBlLi4uP1xuICAgICAgICBibGVuZDogY2xpcEJsZW5kXG4gICAgICB9IF0sXG4gICAgICB0b1RhcmdldHM6IFsge1xuICAgICAgICBhdHRyaWJ1dGU6ICdjbGlwQXJlYScsXG4gICAgICAgIGZyb206IHRvTm9kZUJvdW5kcyxcbiAgICAgICAgdG86IGJvdW5kcyxcbiAgICAgICAgLy8gQHRzLWV4cGVjdC1lcnJvciBFRUVFSyAtIHdlJ3JlIHJlbHlpbmcgb24gYmxlbmQgdG8gY29udmVydCBhIGJvdW5kcyB0byBhIHNoYXBlLi4uP1xuICAgICAgICBibGVuZDogY2xpcEJsZW5kXG4gICAgICB9IF0sXG4gICAgICByZXNldE5vZGU6IGZ1bmN0aW9uKCBub2RlICkge1xuICAgICAgICBub2RlLmNsaXBBcmVhID0gbnVsbDtcbiAgICAgIH1cbiAgICB9LCBvcHRpb25zICkgKTtcbiAgfVxufVxuXG50d2l4dC5yZWdpc3RlciggJ1RyYW5zaXRpb24nLCBUcmFuc2l0aW9uICk7XG5leHBvcnQgZGVmYXVsdCBUcmFuc2l0aW9uOyJdLCJuYW1lcyI6WyJTaGFwZSIsIm1lcmdlIiwib3B0aW9uaXplIiwiY29tYmluZU9wdGlvbnMiLCJyZXF1aXJlZCIsIkFuaW1hdGlvbiIsInR3aXh0IiwiVHJhbnNpdGlvbiIsInNsaWRlTGVmdCIsImJvdW5kcyIsImZyb21Ob2RlIiwidG9Ob2RlIiwib3B0aW9ucyIsImNyZWF0ZVNsaWRlIiwid2lkdGgiLCJzbGlkZVJpZ2h0Iiwic2xpZGVVcCIsImhlaWdodCIsInNsaWRlRG93biIsIndpcGVMZWZ0IiwiY3JlYXRlV2lwZSIsIndpcGVSaWdodCIsIndpcGVVcCIsIndpcGVEb3duIiwiZGlzc29sdmUiLCJwcm92aWRlZE9wdGlvbnMiLCJnYW1tYUJsZW5kIiwiYSIsImIiLCJyYXRpbyIsIk1hdGgiLCJwb3ciLCJnYW1tYSIsImZyb21UYXJnZXRzIiwiYXR0cmlidXRlIiwiZnJvbSIsInRvIiwiYmxlbmQiLCJ0b1RhcmdldHMiLCJyZXNldE5vZGUiLCJub2RlIiwib3BhY2l0eSIsInNpemUiLCJyZXZlcnNlZCIsInNpZ24iLCJtaW5BdHRyaWJ1dGUiLCJtYXhBdHRyaWJ1dGUiLCJmcm9tTm9kZUJvdW5kcyIsImNvcHkiLCJ0b05vZGVCb3VuZHMiLCJjbGlwQmxlbmQiLCJib3VuZHNBIiwiYm91bmRzQiIsImNsaXBBcmVhIiwiY29uZmlnIiwiZGVmYXVsdHMiLCJ0YXJnZXRPcHRpb25zIiwiYXNzZXJ0IiwidGFyZ2V0cyIsImNvbmNhdCIsIm1hcCIsInRhcmdldCIsIm9iamVjdCIsIl8iLCJvbWl0Iiwia2V5cyIsImVuZGVkRW1pdHRlciIsImFkZExpc3RlbmVyIiwicmVnaXN0ZXIiXSwibWFwcGluZ3MiOiJBQUFBLHNEQUFzRDtBQUV0RDs7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