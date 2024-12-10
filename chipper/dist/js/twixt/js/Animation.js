// Copyright 2018-2024, University of Colorado Boulder
/**
 * An easing-based controllable animation.
 *
 * We use some terminology to describe points and regions in time for an animation:
 *
 *             starts                            begins                                finishes
 *               |             delay               |             animation                |
 * time-->       |           (waiting)             |     (animated values changing)       |
 * ---------------------------------------------------------------------------------------------------------------------
 *               |------------------------------running-----------------------------------|
 *                                                 |-------------animating----------------|
 *
 * TODO #3: pause/cancel (and stop->cancel renaming)
 * TODO #3: function for blending with angular/rotational values
 * TODO #3: consider keyframed animation helper?
 * TODO #3: Hooks for attaching/detaching stepping via screens/nodes
 * TODO #3: Add documentation examples (contingent on how screen/node hooks work)
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ import BooleanProperty from '../../axon/js/BooleanProperty.js';
import Disposable from '../../axon/js/Disposable.js';
import Emitter from '../../axon/js/Emitter.js';
import stepTimer from '../../axon/js/stepTimer.js';
import TinyEmitter from '../../axon/js/TinyEmitter.js';
import Utils from '../../dot/js/Utils.js';
import optionize from '../../phet-core/js/optionize.js';
import AnimationTarget from './AnimationTarget.js';
import twixt from './twixt.js';
let Animation = class Animation extends Disposable {
    /**
   * Starts the animation (or if it has a delay, sets the animation to start after that delay).
   *
   * @param [dt] - If provided, step this far into the animation initially.  Used for chaining animations.
   */ start(dt) {
        // If we are already animating, do nothing
        if (this.runningProperty.value) {
            return this;
        }
        // The remaining delay needs to be valid immediately after start is called.
        this.remainingDelay = this.delay;
        // Notifications
        this.runningProperty.value = true;
        this.startEmitter.emit();
        // Set up initial state and value
        this.step(dt !== undefined ? dt : 0);
        return this;
    }
    /**
   * Stops the animation (or if waiting for the delay, will not "start" the animation).
   */ stop() {
        // If we are not already animating, do nothing
        if (!this.runningProperty.value) {
            return this;
        }
        // Notifications
        this.runningProperty.value = false;
        this.stopEmitter.emit();
        this.endedEmitter.emit();
        return this;
    }
    /**
   * Steps the animation forward by a certain amount of time.
   *
   * @param dt - In seconds
   */ step(dt) {
        // Ignore the step if our animation is not running
        if (!this.runningProperty.value) {
            return this;
        }
        // First, burn through the delay if animation hasn't started yet.
        if (!this.animatingProperty.value) {
            this.remainingDelay -= dt;
            dt = -this.remainingDelay; // record how far past the delay we go
            // Bail if we are not ready to start the animation
            if (this.remainingDelay > 0) {
                return this;
            }
            // Compute the start/end for each target, and determine the length of our animation
            this.length = this.duration;
            for(let i = 0; i < this.targets.length; i++){
                const target = this.targets[i];
                target.computeStartEnd();
                // If we don't have a computed length yet, check all of our targets
                if (this.length === null) {
                    this.length = target.getPreferredDuration();
                }
            }
            assert && assert(this.length !== null, 'After going through the targets, we should have a length by now');
            this.remainingAnimation = this.length;
            // Notify about the animation starting
            this.animatingProperty.value = true;
            this.beginEmitter.emit();
        }
        // Take our dt off of our remaining time
        this.remainingAnimation -= dt;
        dt = -this.remainingAnimation; // record how far past the animation we go
        assert && assert(this.length !== null);
        const ratio = this.length > 0 ? Utils.clamp((this.length - this.remainingAnimation) / this.length, 0, 1) : 1;
        for(let j = 0; j < this.targets.length; j++){
            this.targets[j].update(ratio);
        }
        // Notification
        this.updateEmitter.emit();
        // Handle finishing the animation if it is over.
        if (ratio === 1) {
            this.animatingProperty.value = false;
            this.runningProperty.value = false;
            // Step into the next animation by the overflow time
            this.finishEmitter.emit(dt);
            this.endedEmitter.emit();
        }
        return this;
    }
    /**
   * After this animation is complete, the given animation will be started.
   *
   * @returns - Returns the passed-in animation so things can be chained nicely.
   */ then(animation) {
        this.finishEmitter.addListener((dt)=>animation.start(dt));
        return animation;
    }
    dispose() {
        this.runningProperty.dispose();
        this.animatingProperty.dispose();
        this.startEmitter.dispose();
        this.beginEmitter.dispose();
        this.finishEmitter.dispose();
        this.stopEmitter.dispose();
        this.endedEmitter.dispose();
        this.updateEmitter.dispose();
        super.dispose();
    }
    /**
   * The constructor config will define one or more animation "targets" (specific values to be animated). The config
   * available for targets is documented in AnimationTarget.
   *
   * If there is only one target, it is recommended to pass in those config in the top-level Animation config, e.g.:
   * | var someNumberProperty = new NumberProperty( 0 );
   * | new Animation( {
   * |   // Options for the Animation as a whole
   * |   duration: 2,
   * |
   * |   // Options for the one target to change
   * |   property: someNumberProperty,
   * |   to: 5
   * | } );
   *
   * However multiple different targets are supported, and should be specified in the `targets` option:
   * | var someNumberProperty = new NumberProperty( 100 );
   * | var someObject = { someAttribute: new Vector2( 100, 5 ) };
   * | new Animation( {
   * |   // Options for the Animation as a whole
   * |   duration: 2,
   * |
   * |   targets: [ {
   * |     // First target
   * |     property: someNumberProperty,
   * |     to: 5
   * |   }, {
   * |     // Second target
   * |     object: someObject,
   * |     attribute: 'someAttribute',
   * |     to: new Vector2( 50, 10 )
   * |   } ]
   * | } );
   *
   * NOTE: The length of the animation needs to be specified in exactly one place. This can usually be done by
   * specifying the `duration` in the config, but `speed` can also be used in any of the targets.
   *
   * EXAMPLE: It's possible to create continuous animation loops, where animations cycle back and forth, e.g.:
   * | var moreOpaque = new Animation( {
   * |   object: animatedCircle,
   * |   attribute: 'opacity',
   * |   from: 0.5,
   * |   to: 1,
   * |   duration: 0.5,
   * |   easing: Easing.QUADRATIC_IN_OUT
   * | } );
   * | var lessOpaque = new Animation( {
   * |   object: animatedCircle,
   * |   attribute: 'opacity',
   * |   from: 1,
   * |   to: 0.5,
   * |   duration: 0.5,
   * |   easing: Easing.QUADRATIC_IN_OUT
   * | } );
   * | moreOpaque.then( lessOpaque );
   * | lessOpaque.then( moreOpaque );
   * | lessOpaque.start();
   */ constructor(providedConfig){
        const config = optionize()({
            targets: null,
            duration: null,
            delay: 0,
            stepEmitter: stepTimer
        }, providedConfig);
        assert && assert(+(config.property !== undefined) + +(config.object !== undefined) + +(config.setValue !== undefined) + +(config.targets !== null) === 1, 'Should have one (and only one) way of defining how to set the animated value. Use one of property/object/setValue/targets');
        assert && assert(typeof config.delay === 'number' && isFinite(config.delay) && config.delay >= 0, 'The delay should be a non-negative number.');
        assert && assert(config.stepEmitter === null || config.stepEmitter instanceof Emitter || config.stepEmitter instanceof TinyEmitter, 'stepEmitter must be null or an (Tiny)Emitter');
        super(config), // Computed length for the animation (in seconds)
        this.length = 0, // Length of time remaining in the "delay" portion. Computed after the animation is started, and only used until the
        // animation "begins".
        this.remainingDelay = 0, // Length of time remaining in the actual animation (after the delay) portion. Computed after the delay has passed,
        // and only used until the animation "ends".
        this.remainingAnimation = 0, // True while the animation is being stepped through (both the delay portion AND the actual animation portion).
        this.runningProperty = new BooleanProperty(false), // True while the animation is actually changing the value (false while waiting for the delay, or while the animation
        // is not running at all).
        this.animatingProperty = new BooleanProperty(false), // Fired when the animation is "started" (i.e. when start() is called and the delay, if one is there, starts).
        this.startEmitter = new Emitter(), // Fired when the actual animation of the value begins (i.e. when the delay finishes and the actual animation begins).
        this.beginEmitter = new Emitter(), // Fired when the animation finishes naturally (was not abnormally stopped). A {number} is provided as a single
        // argument to the emit callback, and represents how much "extra" time occurred after the end of the animation. For
        // example, if you have a 1-second animation and stepped it by 3 seconds, this finished emitter would be called with
        // 2 seconds.
        this.finishEmitter = new Emitter({
            parameters: [
                {
                    valueType: 'number'
                }
            ]
        }), // Fired when the animation is manually stopped (with stop()). Does NOT fire when it finishes normally.
        this.stopEmitter = new Emitter(), // Fired when the animation ends, regardless of whether it fully finished, or was stopped prematurely.
        this.endedEmitter = new Emitter({
            hasListenerOrderDependencies: true
        }) // TODO: listener order dependencies in should be dealt with, https://github.com/phetsims/fraction-matcher/issues/110
        , // Fired when (just after) the animation has changed animated values/targets.
        this.updateEmitter = new Emitter();
        this.targets = (config.targets === null ? [
            config
        ] : config.targets).map((config)=>{
            return new AnimationTarget(config); // TODO #3: strip out the irrelevant config when using config arg
        });
        assert && assert(+(config.duration !== null) + _.sum(_.map(this.targets, (target)=>target.hasPreferredDuration() ? 1 : 0)) === 1, 'Exactly one duration/speed option should be used.');
        this.duration = config.duration;
        this.delay = config.delay;
        // Wire up to the provided Emitter, if any. Whenever this animation is started, it will add a listener to the Timer
        // (and conversely, will be removed when stopped). This means it will animate with the timer, but will not leak
        // memory as long as the animation doesn't last forever.
        const stepEmitter = config.stepEmitter;
        if (stepEmitter) {
            const stepListener = this.step.bind(this);
            this.runningProperty.link((running)=>{
                if (running && !stepEmitter.hasListener(stepListener)) {
                    stepEmitter.addListener(stepListener);
                } else if (!running && stepEmitter.hasListener(stepListener)) {
                    stepEmitter.removeListener(stepListener);
                }
            });
            this.disposeEmitter.addListener(()=>{
                stepEmitter.hasListener(stepListener) && stepEmitter.removeListener(stepListener);
            });
        }
    }
};
twixt.register('Animation', Animation);
export default Animation;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3R3aXh0L2pzL0FuaW1hdGlvbi50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxOC0yMDI0LCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuLyoqXG4gKiBBbiBlYXNpbmctYmFzZWQgY29udHJvbGxhYmxlIGFuaW1hdGlvbi5cbiAqXG4gKiBXZSB1c2Ugc29tZSB0ZXJtaW5vbG9neSB0byBkZXNjcmliZSBwb2ludHMgYW5kIHJlZ2lvbnMgaW4gdGltZSBmb3IgYW4gYW5pbWF0aW9uOlxuICpcbiAqICAgICAgICAgICAgIHN0YXJ0cyAgICAgICAgICAgICAgICAgICAgICAgICAgICBiZWdpbnMgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpbmlzaGVzXG4gKiAgICAgICAgICAgICAgIHwgICAgICAgICAgICAgZGVsYXkgICAgICAgICAgICAgICB8ICAgICAgICAgICAgIGFuaW1hdGlvbiAgICAgICAgICAgICAgICB8XG4gKiB0aW1lLS0+ICAgICAgIHwgICAgICAgICAgICh3YWl0aW5nKSAgICAgICAgICAgICB8ICAgICAoYW5pbWF0ZWQgdmFsdWVzIGNoYW5naW5nKSAgICAgICB8XG4gKiAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAqICAgICAgICAgICAgICAgfC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLXJ1bm5pbmctLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLXxcbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHwtLS0tLS0tLS0tLS0tYW5pbWF0aW5nLS0tLS0tLS0tLS0tLS0tLXxcbiAqXG4gKiBUT0RPICMzOiBwYXVzZS9jYW5jZWwgKGFuZCBzdG9wLT5jYW5jZWwgcmVuYW1pbmcpXG4gKiBUT0RPICMzOiBmdW5jdGlvbiBmb3IgYmxlbmRpbmcgd2l0aCBhbmd1bGFyL3JvdGF0aW9uYWwgdmFsdWVzXG4gKiBUT0RPICMzOiBjb25zaWRlciBrZXlmcmFtZWQgYW5pbWF0aW9uIGhlbHBlcj9cbiAqIFRPRE8gIzM6IEhvb2tzIGZvciBhdHRhY2hpbmcvZGV0YWNoaW5nIHN0ZXBwaW5nIHZpYSBzY3JlZW5zL25vZGVzXG4gKiBUT0RPICMzOiBBZGQgZG9jdW1lbnRhdGlvbiBleGFtcGxlcyAoY29udGluZ2VudCBvbiBob3cgc2NyZWVuL25vZGUgaG9va3Mgd29yaylcbiAqXG4gKiBAYXV0aG9yIEpvbmF0aGFuIE9sc29uIDxqb25hdGhhbi5vbHNvbkBjb2xvcmFkby5lZHU+XG4gKi9cblxuaW1wb3J0IEJvb2xlYW5Qcm9wZXJ0eSBmcm9tICcuLi8uLi9heG9uL2pzL0Jvb2xlYW5Qcm9wZXJ0eS5qcyc7XG5pbXBvcnQgRGlzcG9zYWJsZSwgeyBEaXNwb3NhYmxlT3B0aW9ucyB9IGZyb20gJy4uLy4uL2F4b24vanMvRGlzcG9zYWJsZS5qcyc7XG5pbXBvcnQgRW1pdHRlciBmcm9tICcuLi8uLi9heG9uL2pzL0VtaXR0ZXIuanMnO1xuaW1wb3J0IHN0ZXBUaW1lciBmcm9tICcuLi8uLi9heG9uL2pzL3N0ZXBUaW1lci5qcyc7XG5pbXBvcnQgeyBUUmVhZE9ubHlFbWl0dGVyIH0gZnJvbSAnLi4vLi4vYXhvbi9qcy9URW1pdHRlci5qcyc7XG5pbXBvcnQgVGlueUVtaXR0ZXIgZnJvbSAnLi4vLi4vYXhvbi9qcy9UaW55RW1pdHRlci5qcyc7XG5pbXBvcnQgVXRpbHMgZnJvbSAnLi4vLi4vZG90L2pzL1V0aWxzLmpzJztcbmltcG9ydCBvcHRpb25pemUgZnJvbSAnLi4vLi4vcGhldC1jb3JlL2pzL29wdGlvbml6ZS5qcyc7XG5pbXBvcnQgQW5pbWF0aW9uVGFyZ2V0LCB7IEFuaW1hdGlvblRhcmdldE9wdGlvbnMgfSBmcm9tICcuL0FuaW1hdGlvblRhcmdldC5qcyc7XG5pbXBvcnQgdHdpeHQgZnJvbSAnLi90d2l4dC5qcyc7XG5cbnR5cGUgU2VsZk9wdGlvbnM8VGFyZ2V0VHlwZXMsIFRhcmdldE9iamVjdFR5cGVzIGV4dGVuZHMgeyBbSyBpbiBrZXlvZiBUYXJnZXRUeXBlc106IHVua25vd24gfT4gPSB7XG4gIC8vIENhbiBiZSBwcm92aWRlZCBpbnN0ZWFkIG9mIHNldFZhbHVlL3Byb3BlcnR5L29iamVjdCwgYW5kIGl0IGNvbnRhaW5zIGFuIGFycmF5IG9mIGNvbmZpZy1zdHlsZSBvYmplY3RzIHRoYXQgYWxsb3dzXG4gIC8vIGFuaW1hdGluZyBtdWx0aXBsZSBkaWZmZXJlbnQgdGhpbmdzIGF0IHRoZSBzYW1lIHRpbWUuIFNlZSBBbmltYXRpb25UYXJnZXQgZm9yIGRldGFpbHMgYWJvdXQgYWxsIG9mIHRoZSBzdXBwb3J0ZWRcbiAgLy8gY29uZmlnLlxuICAvLyBOT1RFOiBzcGVlZCwgaWYgcHJvdmlkZWQsIHNob3VsZCBiZSBvbmx5IHNwZWNpZmllZCBvbiBleGFjdGx5IG9uZSBvZiB0aGUgdGFyZ2V0cycgY29uZmlnIGlmIG11bHRpcGxlIHRhcmdldHNcbiAgLy8gYXJlIHNwZWNpZmllZC5cbiAgdGFyZ2V0cz86IHsgW0sgaW4ga2V5b2YgVGFyZ2V0VHlwZXNdOiBBbmltYXRpb25UYXJnZXRPcHRpb25zPFRhcmdldFR5cGVzW0tdLCBUYXJnZXRPYmplY3RUeXBlc1tLXT4gfSB8IG51bGw7XG5cbiAgLy8gSWYgcHJvdmlkZWQsIHRoZSBhbmltYXRpb24ncyBsZW5ndGggd2lsbCBiZSB0aGlzIHZhbHVlIChpbiBzZWNvbmRzKS4gSWYgb21pdHRlZCwgb25lIG9mIHRoZSB0YXJnZXRzJyBgc3BlZWRgIG9wdGlvblxuICAvLyBzaG91bGQgYmUgc2V0ICh0aGUgbGVuZ3RoIG9mIHRoZSBhbmltYXRpb24gd2lsbCBiZSBiYXNlZCBvbiB0aGF0KS5cbiAgZHVyYXRpb24/OiBudW1iZXIgfCBudWxsO1xuXG4gIC8vIFRoZSBhbW91bnQgb2YgdGltZSAoaW4gc2Vjb25kcykgYmV0d2VlbiB3aGVuIHRoZSBhbmltYXRpb24gaXMgXCJzdGFydGVkXCIgYW5kIHdoZW4gdGhlIGFjdHVhbCBhbmltYXRpb24gb2YgdGhlIHZhbHVlXG4gIC8vIGJlZ2lucy4gTmVnYXRpdmUgZGVsYXlzIGFyZSBub3Qgc3VwcG9ydGVkLlxuICBkZWxheT86IG51bWJlcjtcblxuICAvLyBPbmUgb2YgdGhlIGZvbGxvd2luZyBjb25maWc6XG4gIC8vIFRoZSBFbWl0dGVyICh3aGljaCBwcm92aWRlcyBhIGR0IHtudW1iZXJ9IHZhbHVlIG9uIGVtaXQpIHdoaWNoIGRyaXZlcyB0aGUgYW5pbWF0aW9uLCBvciBudWxsIGlmIHRoZSBjbGllbnRcbiAgLy8gd2lsbCBkcml2ZSB0aGUgYW5pbWF0aW9uIGJ5IGNhbGxpbmcgYHN0ZXAoZHQpYCBtYW51YWxseS4gIERlZmF1bHRzIHRvIHRoZSBqb2lzdCBUaW1lciB3aGljaCBydW5zIGF1dG9tYXRpY2FsbHlcbiAgLy8gYXMgcGFydCBvZiB0aGUgU2ltIHRpbWUgc3RlcC5cbiAgLy8gVE9ETyAjMzoge1NjcmVlblZpZXd9IC0gYW5pbWF0ZXMgb25seSB3aGVuIHRoZSBTY3JlZW5WaWV3IGlzIHRoZSBhY3RpdmUgb25lLlxuICAvLyBUT0RPICMzOiB7Tm9kZX0gLSBhbmltYXRlcyBvbmx5IHdoZW4gdGhlIG5vZGUncyB0cmFpbCBpcyB2aXNpYmxlIG9uIGEgRGlzcGxheVxuICBzdGVwRW1pdHRlcj86IFRSZWFkT25seUVtaXR0ZXI8WyBudW1iZXIgXT4gfCBudWxsO1xufTtcblxuLy8gSU1QT1JUQU5UOiBTZWUgQW5pbWF0aW9uVGFyZ2V0J3MgY29uZmlnIGRvY3VtZW50YXRpb24sIGFzIHRob3NlIGNvbmZpZyBjYW4gYmUgcGFzc2VkIGluIGVpdGhlciBoZXJlLCBvciBpblxuLy8gdGhlIHRhcmdldHMgYXJyYXkuXG5leHBvcnQgdHlwZSBBbmltYXRpb25PcHRpb25zPFNlbGZUeXBlID0gdW5rbm93biwgU2VsZk9iamVjdFR5cGUgPSB1bmtub3duLCBUYXJnZXRUeXBlcyA9IHVua25vd25bXSwgVGFyZ2V0T2JqZWN0VHlwZXMgZXh0ZW5kcyB7IFtLIGluIGtleW9mIFRhcmdldFR5cGVzXTogdW5rbm93biB9ID0geyBbSyBpbiBrZXlvZiBUYXJnZXRUeXBlc106IHVua25vd24gfT4gPVxuICBTZWxmT3B0aW9uczxUYXJnZXRUeXBlcywgVGFyZ2V0T2JqZWN0VHlwZXM+ICZcbiAgQW5pbWF0aW9uVGFyZ2V0T3B0aW9uczxTZWxmVHlwZSwgU2VsZk9iamVjdFR5cGU+ICZcbiAgRGlzcG9zYWJsZU9wdGlvbnM7XG5cbmNsYXNzIEFuaW1hdGlvbjxTZWxmVHlwZSA9IHVua25vd24sIFNlbGZPYmplY3RUeXBlID0gdW5rbm93biwgVGFyZ2V0VHlwZXMgPSB1bmtub3duW10sIFRhcmdldE9iamVjdFR5cGVzIGV4dGVuZHMgeyBbSyBpbiBrZXlvZiBUYXJnZXRUeXBlc106IHVua25vd24gfSA9IHsgW0sgaW4ga2V5b2YgVGFyZ2V0VHlwZXNdOiB1bmtub3duIH0+IGV4dGVuZHMgRGlzcG9zYWJsZSB7XG5cbiAgLy8gQWxsIG9mIHRoZSBkaWZmZXJlbnQgdmFsdWVzIHRoYXQgd2lsbCBiZSBhbmltYXRlZCBieSB0aGlzIGFuaW1hdGlvbi5cbiAgLy8gSWYgY29uZmlnLnRhcmdldHMgd2FzIHN1cHBsaWVkLCB0aG9zZSB0YXJnZXRzIHdpbGwgYmUgd3JhcHBlZCBpbnRvIEFuaW1hdGlvblRhcmdldHNcbiAgLy8gSWYgY29uZmlnLnRhcmdldHMgd2FzIG5vdCBzdXBwbGllZCwgdGhlIGNvbmZpZyBmcm9tIHRoaXMgb2JqZWN0IHdpbGwgYmUgd3JhcHBlZCBpbnRvIG9uZSBBbmltYXRpb25UYXJnZXRcbiAgcHJpdmF0ZSByZWFkb25seSB0YXJnZXRzOiBBbmltYXRpb25UYXJnZXQ8dW5rbm93bj5bXTtcblxuICAvLyBTYXZlZCBjb25maWcgdG8gaGVscCBkZXRlcm1pbmUgdGhlIGxlbmd0aCBvZiB0aGUgYW5pbWF0aW9uXG4gIHByaXZhdGUgcmVhZG9ubHkgZHVyYXRpb246IG51bWJlciB8IG51bGw7XG5cbiAgLy8gSW4gc2Vjb25kc1xuICBwcml2YXRlIHJlYWRvbmx5IGRlbGF5OiBudW1iZXI7XG5cbiAgLy8gQ29tcHV0ZWQgbGVuZ3RoIGZvciB0aGUgYW5pbWF0aW9uIChpbiBzZWNvbmRzKVxuICBwcml2YXRlIGxlbmd0aDogbnVtYmVyIHwgbnVsbCA9IDA7XG5cbiAgLy8gTGVuZ3RoIG9mIHRpbWUgcmVtYWluaW5nIGluIHRoZSBcImRlbGF5XCIgcG9ydGlvbi4gQ29tcHV0ZWQgYWZ0ZXIgdGhlIGFuaW1hdGlvbiBpcyBzdGFydGVkLCBhbmQgb25seSB1c2VkIHVudGlsIHRoZVxuICAvLyBhbmltYXRpb24gXCJiZWdpbnNcIi5cbiAgcHJpdmF0ZSByZW1haW5pbmdEZWxheSA9IDA7XG5cbiAgLy8gTGVuZ3RoIG9mIHRpbWUgcmVtYWluaW5nIGluIHRoZSBhY3R1YWwgYW5pbWF0aW9uIChhZnRlciB0aGUgZGVsYXkpIHBvcnRpb24uIENvbXB1dGVkIGFmdGVyIHRoZSBkZWxheSBoYXMgcGFzc2VkLFxuICAvLyBhbmQgb25seSB1c2VkIHVudGlsIHRoZSBhbmltYXRpb24gXCJlbmRzXCIuXG4gIHByaXZhdGUgcmVtYWluaW5nQW5pbWF0aW9uID0gMDtcblxuICAvLyBUcnVlIHdoaWxlIHRoZSBhbmltYXRpb24gaXMgYmVpbmcgc3RlcHBlZCB0aHJvdWdoIChib3RoIHRoZSBkZWxheSBwb3J0aW9uIEFORCB0aGUgYWN0dWFsIGFuaW1hdGlvbiBwb3J0aW9uKS5cbiAgcHVibGljIHJlYWRvbmx5IHJ1bm5pbmdQcm9wZXJ0eSA9IG5ldyBCb29sZWFuUHJvcGVydHkoIGZhbHNlICk7XG5cbiAgLy8gVHJ1ZSB3aGlsZSB0aGUgYW5pbWF0aW9uIGlzIGFjdHVhbGx5IGNoYW5naW5nIHRoZSB2YWx1ZSAoZmFsc2Ugd2hpbGUgd2FpdGluZyBmb3IgdGhlIGRlbGF5LCBvciB3aGlsZSB0aGUgYW5pbWF0aW9uXG4gIC8vIGlzIG5vdCBydW5uaW5nIGF0IGFsbCkuXG4gIHB1YmxpYyByZWFkb25seSBhbmltYXRpbmdQcm9wZXJ0eSA9IG5ldyBCb29sZWFuUHJvcGVydHkoIGZhbHNlICk7XG5cbiAgLy8gRmlyZWQgd2hlbiB0aGUgYW5pbWF0aW9uIGlzIFwic3RhcnRlZFwiIChpLmUuIHdoZW4gc3RhcnQoKSBpcyBjYWxsZWQgYW5kIHRoZSBkZWxheSwgaWYgb25lIGlzIHRoZXJlLCBzdGFydHMpLlxuICBwdWJsaWMgcmVhZG9ubHkgc3RhcnRFbWl0dGVyID0gbmV3IEVtaXR0ZXIoKTtcblxuICAvLyBGaXJlZCB3aGVuIHRoZSBhY3R1YWwgYW5pbWF0aW9uIG9mIHRoZSB2YWx1ZSBiZWdpbnMgKGkuZS4gd2hlbiB0aGUgZGVsYXkgZmluaXNoZXMgYW5kIHRoZSBhY3R1YWwgYW5pbWF0aW9uIGJlZ2lucykuXG4gIHB1YmxpYyByZWFkb25seSBiZWdpbkVtaXR0ZXIgPSBuZXcgRW1pdHRlcigpO1xuXG4gIC8vIEZpcmVkIHdoZW4gdGhlIGFuaW1hdGlvbiBmaW5pc2hlcyBuYXR1cmFsbHkgKHdhcyBub3QgYWJub3JtYWxseSBzdG9wcGVkKS4gQSB7bnVtYmVyfSBpcyBwcm92aWRlZCBhcyBhIHNpbmdsZVxuICAvLyBhcmd1bWVudCB0byB0aGUgZW1pdCBjYWxsYmFjaywgYW5kIHJlcHJlc2VudHMgaG93IG11Y2ggXCJleHRyYVwiIHRpbWUgb2NjdXJyZWQgYWZ0ZXIgdGhlIGVuZCBvZiB0aGUgYW5pbWF0aW9uLiBGb3JcbiAgLy8gZXhhbXBsZSwgaWYgeW91IGhhdmUgYSAxLXNlY29uZCBhbmltYXRpb24gYW5kIHN0ZXBwZWQgaXQgYnkgMyBzZWNvbmRzLCB0aGlzIGZpbmlzaGVkIGVtaXR0ZXIgd291bGQgYmUgY2FsbGVkIHdpdGhcbiAgLy8gMiBzZWNvbmRzLlxuICBwdWJsaWMgcmVhZG9ubHkgZmluaXNoRW1pdHRlciA9IG5ldyBFbWl0dGVyPFsgbnVtYmVyIF0+KCB7IHBhcmFtZXRlcnM6IFsgeyB2YWx1ZVR5cGU6ICdudW1iZXInIH0gXSB9ICk7XG5cbiAgLy8gRmlyZWQgd2hlbiB0aGUgYW5pbWF0aW9uIGlzIG1hbnVhbGx5IHN0b3BwZWQgKHdpdGggc3RvcCgpKS4gRG9lcyBOT1QgZmlyZSB3aGVuIGl0IGZpbmlzaGVzIG5vcm1hbGx5LlxuICBwdWJsaWMgcmVhZG9ubHkgc3RvcEVtaXR0ZXIgPSBuZXcgRW1pdHRlcigpO1xuXG4gIC8vIEZpcmVkIHdoZW4gdGhlIGFuaW1hdGlvbiBlbmRzLCByZWdhcmRsZXNzIG9mIHdoZXRoZXIgaXQgZnVsbHkgZmluaXNoZWQsIG9yIHdhcyBzdG9wcGVkIHByZW1hdHVyZWx5LlxuICBwdWJsaWMgcmVhZG9ubHkgZW5kZWRFbWl0dGVyID0gbmV3IEVtaXR0ZXIoIHsgaGFzTGlzdGVuZXJPcmRlckRlcGVuZGVuY2llczogdHJ1ZSB9ICk7IC8vIFRPRE86IGxpc3RlbmVyIG9yZGVyIGRlcGVuZGVuY2llcyBpbiBzaG91bGQgYmUgZGVhbHQgd2l0aCwgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2ZyYWN0aW9uLW1hdGNoZXIvaXNzdWVzLzExMFxuXG4gIC8vIEZpcmVkIHdoZW4gKGp1c3QgYWZ0ZXIpIHRoZSBhbmltYXRpb24gaGFzIGNoYW5nZWQgYW5pbWF0ZWQgdmFsdWVzL3RhcmdldHMuXG4gIHB1YmxpYyByZWFkb25seSB1cGRhdGVFbWl0dGVyID0gbmV3IEVtaXR0ZXIoKTtcblxuICAvKipcbiAgICogVGhlIGNvbnN0cnVjdG9yIGNvbmZpZyB3aWxsIGRlZmluZSBvbmUgb3IgbW9yZSBhbmltYXRpb24gXCJ0YXJnZXRzXCIgKHNwZWNpZmljIHZhbHVlcyB0byBiZSBhbmltYXRlZCkuIFRoZSBjb25maWdcbiAgICogYXZhaWxhYmxlIGZvciB0YXJnZXRzIGlzIGRvY3VtZW50ZWQgaW4gQW5pbWF0aW9uVGFyZ2V0LlxuICAgKlxuICAgKiBJZiB0aGVyZSBpcyBvbmx5IG9uZSB0YXJnZXQsIGl0IGlzIHJlY29tbWVuZGVkIHRvIHBhc3MgaW4gdGhvc2UgY29uZmlnIGluIHRoZSB0b3AtbGV2ZWwgQW5pbWF0aW9uIGNvbmZpZywgZS5nLjpcbiAgICogfCB2YXIgc29tZU51bWJlclByb3BlcnR5ID0gbmV3IE51bWJlclByb3BlcnR5KCAwICk7XG4gICAqIHwgbmV3IEFuaW1hdGlvbigge1xuICAgKiB8ICAgLy8gT3B0aW9ucyBmb3IgdGhlIEFuaW1hdGlvbiBhcyBhIHdob2xlXG4gICAqIHwgICBkdXJhdGlvbjogMixcbiAgICogfFxuICAgKiB8ICAgLy8gT3B0aW9ucyBmb3IgdGhlIG9uZSB0YXJnZXQgdG8gY2hhbmdlXG4gICAqIHwgICBwcm9wZXJ0eTogc29tZU51bWJlclByb3BlcnR5LFxuICAgKiB8ICAgdG86IDVcbiAgICogfCB9ICk7XG4gICAqXG4gICAqIEhvd2V2ZXIgbXVsdGlwbGUgZGlmZmVyZW50IHRhcmdldHMgYXJlIHN1cHBvcnRlZCwgYW5kIHNob3VsZCBiZSBzcGVjaWZpZWQgaW4gdGhlIGB0YXJnZXRzYCBvcHRpb246XG4gICAqIHwgdmFyIHNvbWVOdW1iZXJQcm9wZXJ0eSA9IG5ldyBOdW1iZXJQcm9wZXJ0eSggMTAwICk7XG4gICAqIHwgdmFyIHNvbWVPYmplY3QgPSB7IHNvbWVBdHRyaWJ1dGU6IG5ldyBWZWN0b3IyKCAxMDAsIDUgKSB9O1xuICAgKiB8IG5ldyBBbmltYXRpb24oIHtcbiAgICogfCAgIC8vIE9wdGlvbnMgZm9yIHRoZSBBbmltYXRpb24gYXMgYSB3aG9sZVxuICAgKiB8ICAgZHVyYXRpb246IDIsXG4gICAqIHxcbiAgICogfCAgIHRhcmdldHM6IFsge1xuICAgKiB8ICAgICAvLyBGaXJzdCB0YXJnZXRcbiAgICogfCAgICAgcHJvcGVydHk6IHNvbWVOdW1iZXJQcm9wZXJ0eSxcbiAgICogfCAgICAgdG86IDVcbiAgICogfCAgIH0sIHtcbiAgICogfCAgICAgLy8gU2Vjb25kIHRhcmdldFxuICAgKiB8ICAgICBvYmplY3Q6IHNvbWVPYmplY3QsXG4gICAqIHwgICAgIGF0dHJpYnV0ZTogJ3NvbWVBdHRyaWJ1dGUnLFxuICAgKiB8ICAgICB0bzogbmV3IFZlY3RvcjIoIDUwLCAxMCApXG4gICAqIHwgICB9IF1cbiAgICogfCB9ICk7XG4gICAqXG4gICAqIE5PVEU6IFRoZSBsZW5ndGggb2YgdGhlIGFuaW1hdGlvbiBuZWVkcyB0byBiZSBzcGVjaWZpZWQgaW4gZXhhY3RseSBvbmUgcGxhY2UuIFRoaXMgY2FuIHVzdWFsbHkgYmUgZG9uZSBieVxuICAgKiBzcGVjaWZ5aW5nIHRoZSBgZHVyYXRpb25gIGluIHRoZSBjb25maWcsIGJ1dCBgc3BlZWRgIGNhbiBhbHNvIGJlIHVzZWQgaW4gYW55IG9mIHRoZSB0YXJnZXRzLlxuICAgKlxuICAgKiBFWEFNUExFOiBJdCdzIHBvc3NpYmxlIHRvIGNyZWF0ZSBjb250aW51b3VzIGFuaW1hdGlvbiBsb29wcywgd2hlcmUgYW5pbWF0aW9ucyBjeWNsZSBiYWNrIGFuZCBmb3J0aCwgZS5nLjpcbiAgICogfCB2YXIgbW9yZU9wYXF1ZSA9IG5ldyBBbmltYXRpb24oIHtcbiAgICogfCAgIG9iamVjdDogYW5pbWF0ZWRDaXJjbGUsXG4gICAqIHwgICBhdHRyaWJ1dGU6ICdvcGFjaXR5JyxcbiAgICogfCAgIGZyb206IDAuNSxcbiAgICogfCAgIHRvOiAxLFxuICAgKiB8ICAgZHVyYXRpb246IDAuNSxcbiAgICogfCAgIGVhc2luZzogRWFzaW5nLlFVQURSQVRJQ19JTl9PVVRcbiAgICogfCB9ICk7XG4gICAqIHwgdmFyIGxlc3NPcGFxdWUgPSBuZXcgQW5pbWF0aW9uKCB7XG4gICAqIHwgICBvYmplY3Q6IGFuaW1hdGVkQ2lyY2xlLFxuICAgKiB8ICAgYXR0cmlidXRlOiAnb3BhY2l0eScsXG4gICAqIHwgICBmcm9tOiAxLFxuICAgKiB8ICAgdG86IDAuNSxcbiAgICogfCAgIGR1cmF0aW9uOiAwLjUsXG4gICAqIHwgICBlYXNpbmc6IEVhc2luZy5RVUFEUkFUSUNfSU5fT1VUXG4gICAqIHwgfSApO1xuICAgKiB8IG1vcmVPcGFxdWUudGhlbiggbGVzc09wYXF1ZSApO1xuICAgKiB8IGxlc3NPcGFxdWUudGhlbiggbW9yZU9wYXF1ZSApO1xuICAgKiB8IGxlc3NPcGFxdWUuc3RhcnQoKTtcbiAgICovXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggcHJvdmlkZWRDb25maWc6IEFuaW1hdGlvbk9wdGlvbnM8U2VsZlR5cGUsIFNlbGZPYmplY3RUeXBlLCBUYXJnZXRUeXBlcywgVGFyZ2V0T2JqZWN0VHlwZXM+ICkge1xuXG4gICAgY29uc3QgY29uZmlnID0gb3B0aW9uaXplPEFuaW1hdGlvbk9wdGlvbnM8U2VsZlR5cGUsIFNlbGZPYmplY3RUeXBlLCBUYXJnZXRUeXBlcywgVGFyZ2V0T2JqZWN0VHlwZXM+LCBTZWxmT3B0aW9uczxUYXJnZXRUeXBlcywgVGFyZ2V0T2JqZWN0VHlwZXM+LCBEaXNwb3NhYmxlT3B0aW9ucz4oKSgge1xuICAgICAgdGFyZ2V0czogbnVsbCxcbiAgICAgIGR1cmF0aW9uOiBudWxsLFxuICAgICAgZGVsYXk6IDAsXG4gICAgICBzdGVwRW1pdHRlcjogc3RlcFRpbWVyXG4gICAgfSwgcHJvdmlkZWRDb25maWcgKTtcblxuICAgIGFzc2VydCAmJiBhc3NlcnQoICsoIGNvbmZpZy5wcm9wZXJ0eSAhPT0gdW5kZWZpbmVkICkgKyArKCBjb25maWcub2JqZWN0ICE9PSB1bmRlZmluZWQgKSArICsoIGNvbmZpZy5zZXRWYWx1ZSAhPT0gdW5kZWZpbmVkICkgKyArKCBjb25maWcudGFyZ2V0cyAhPT0gbnVsbCApID09PSAxLFxuICAgICAgJ1Nob3VsZCBoYXZlIG9uZSAoYW5kIG9ubHkgb25lKSB3YXkgb2YgZGVmaW5pbmcgaG93IHRvIHNldCB0aGUgYW5pbWF0ZWQgdmFsdWUuIFVzZSBvbmUgb2YgcHJvcGVydHkvb2JqZWN0L3NldFZhbHVlL3RhcmdldHMnICk7XG5cbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0eXBlb2YgY29uZmlnLmRlbGF5ID09PSAnbnVtYmVyJyAmJiBpc0Zpbml0ZSggY29uZmlnLmRlbGF5ICkgJiYgY29uZmlnLmRlbGF5ID49IDAsXG4gICAgICAnVGhlIGRlbGF5IHNob3VsZCBiZSBhIG5vbi1uZWdhdGl2ZSBudW1iZXIuJyApO1xuXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggY29uZmlnLnN0ZXBFbWl0dGVyID09PSBudWxsIHx8IGNvbmZpZy5zdGVwRW1pdHRlciBpbnN0YW5jZW9mIEVtaXR0ZXIgfHwgY29uZmlnLnN0ZXBFbWl0dGVyIGluc3RhbmNlb2YgVGlueUVtaXR0ZXIsXG4gICAgICAnc3RlcEVtaXR0ZXIgbXVzdCBiZSBudWxsIG9yIGFuIChUaW55KUVtaXR0ZXInICk7XG5cbiAgICBzdXBlciggY29uZmlnICk7XG5cbiAgICB0aGlzLnRhcmdldHMgPSAoICggY29uZmlnLnRhcmdldHMgPT09IG51bGwgPyBbIGNvbmZpZyBdIDogY29uZmlnLnRhcmdldHMgKSBhcyBBbmltYXRpb25UYXJnZXRPcHRpb25zW10gKS5tYXAoIGNvbmZpZyA9PiB7XG4gICAgICByZXR1cm4gbmV3IEFuaW1hdGlvblRhcmdldCggY29uZmlnICk7IC8vIFRPRE8gIzM6IHN0cmlwIG91dCB0aGUgaXJyZWxldmFudCBjb25maWcgd2hlbiB1c2luZyBjb25maWcgYXJnXG4gICAgfSApO1xuXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggKyggY29uZmlnLmR1cmF0aW9uICE9PSBudWxsICkgKyBfLnN1bSggXy5tYXAoIHRoaXMudGFyZ2V0cyxcbiAgICAgIHRhcmdldCA9PiB0YXJnZXQuaGFzUHJlZmVycmVkRHVyYXRpb24oKSA/IDEgOiAwXG4gICAgKSApID09PSAxLCAnRXhhY3RseSBvbmUgZHVyYXRpb24vc3BlZWQgb3B0aW9uIHNob3VsZCBiZSB1c2VkLicgKTtcblxuICAgIHRoaXMuZHVyYXRpb24gPSBjb25maWcuZHVyYXRpb247XG4gICAgdGhpcy5kZWxheSA9IGNvbmZpZy5kZWxheTtcblxuICAgIC8vIFdpcmUgdXAgdG8gdGhlIHByb3ZpZGVkIEVtaXR0ZXIsIGlmIGFueS4gV2hlbmV2ZXIgdGhpcyBhbmltYXRpb24gaXMgc3RhcnRlZCwgaXQgd2lsbCBhZGQgYSBsaXN0ZW5lciB0byB0aGUgVGltZXJcbiAgICAvLyAoYW5kIGNvbnZlcnNlbHksIHdpbGwgYmUgcmVtb3ZlZCB3aGVuIHN0b3BwZWQpLiBUaGlzIG1lYW5zIGl0IHdpbGwgYW5pbWF0ZSB3aXRoIHRoZSB0aW1lciwgYnV0IHdpbGwgbm90IGxlYWtcbiAgICAvLyBtZW1vcnkgYXMgbG9uZyBhcyB0aGUgYW5pbWF0aW9uIGRvZXNuJ3QgbGFzdCBmb3JldmVyLlxuICAgIGNvbnN0IHN0ZXBFbWl0dGVyID0gY29uZmlnLnN0ZXBFbWl0dGVyO1xuICAgIGlmICggc3RlcEVtaXR0ZXIgKSB7XG4gICAgICBjb25zdCBzdGVwTGlzdGVuZXIgPSB0aGlzLnN0ZXAuYmluZCggdGhpcyApO1xuXG4gICAgICB0aGlzLnJ1bm5pbmdQcm9wZXJ0eS5saW5rKCBydW5uaW5nID0+IHtcbiAgICAgICAgaWYgKCBydW5uaW5nICYmICFzdGVwRW1pdHRlci5oYXNMaXN0ZW5lciggc3RlcExpc3RlbmVyICkgKSB7XG4gICAgICAgICAgc3RlcEVtaXR0ZXIuYWRkTGlzdGVuZXIoIHN0ZXBMaXN0ZW5lciApO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKCAhcnVubmluZyAmJiBzdGVwRW1pdHRlci5oYXNMaXN0ZW5lciggc3RlcExpc3RlbmVyICkgKSB7XG4gICAgICAgICAgc3RlcEVtaXR0ZXIucmVtb3ZlTGlzdGVuZXIoIHN0ZXBMaXN0ZW5lciApO1xuICAgICAgICB9XG4gICAgICB9ICk7XG5cbiAgICAgIHRoaXMuZGlzcG9zZUVtaXR0ZXIuYWRkTGlzdGVuZXIoICgpID0+IHtcbiAgICAgICAgc3RlcEVtaXR0ZXIuaGFzTGlzdGVuZXIoIHN0ZXBMaXN0ZW5lciApICYmIHN0ZXBFbWl0dGVyLnJlbW92ZUxpc3RlbmVyKCBzdGVwTGlzdGVuZXIgKTtcbiAgICAgIH0gKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogU3RhcnRzIHRoZSBhbmltYXRpb24gKG9yIGlmIGl0IGhhcyBhIGRlbGF5LCBzZXRzIHRoZSBhbmltYXRpb24gdG8gc3RhcnQgYWZ0ZXIgdGhhdCBkZWxheSkuXG4gICAqXG4gICAqIEBwYXJhbSBbZHRdIC0gSWYgcHJvdmlkZWQsIHN0ZXAgdGhpcyBmYXIgaW50byB0aGUgYW5pbWF0aW9uIGluaXRpYWxseS4gIFVzZWQgZm9yIGNoYWluaW5nIGFuaW1hdGlvbnMuXG4gICAqL1xuICBwdWJsaWMgc3RhcnQoIGR0PzogbnVtYmVyICk6IHRoaXMge1xuICAgIC8vIElmIHdlIGFyZSBhbHJlYWR5IGFuaW1hdGluZywgZG8gbm90aGluZ1xuICAgIGlmICggdGhpcy5ydW5uaW5nUHJvcGVydHkudmFsdWUgKSB7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICAvLyBUaGUgcmVtYWluaW5nIGRlbGF5IG5lZWRzIHRvIGJlIHZhbGlkIGltbWVkaWF0ZWx5IGFmdGVyIHN0YXJ0IGlzIGNhbGxlZC5cbiAgICB0aGlzLnJlbWFpbmluZ0RlbGF5ID0gdGhpcy5kZWxheTtcblxuICAgIC8vIE5vdGlmaWNhdGlvbnNcbiAgICB0aGlzLnJ1bm5pbmdQcm9wZXJ0eS52YWx1ZSA9IHRydWU7XG4gICAgdGhpcy5zdGFydEVtaXR0ZXIuZW1pdCgpO1xuXG4gICAgLy8gU2V0IHVwIGluaXRpYWwgc3RhdGUgYW5kIHZhbHVlXG4gICAgdGhpcy5zdGVwKCBkdCAhPT0gdW5kZWZpbmVkID8gZHQgOiAwICk7XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBTdG9wcyB0aGUgYW5pbWF0aW9uIChvciBpZiB3YWl0aW5nIGZvciB0aGUgZGVsYXksIHdpbGwgbm90IFwic3RhcnRcIiB0aGUgYW5pbWF0aW9uKS5cbiAgICovXG4gIHB1YmxpYyBzdG9wKCk6IHRoaXMge1xuICAgIC8vIElmIHdlIGFyZSBub3QgYWxyZWFkeSBhbmltYXRpbmcsIGRvIG5vdGhpbmdcbiAgICBpZiAoICF0aGlzLnJ1bm5pbmdQcm9wZXJ0eS52YWx1ZSApIHtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIC8vIE5vdGlmaWNhdGlvbnNcbiAgICB0aGlzLnJ1bm5pbmdQcm9wZXJ0eS52YWx1ZSA9IGZhbHNlO1xuICAgIHRoaXMuc3RvcEVtaXR0ZXIuZW1pdCgpO1xuICAgIHRoaXMuZW5kZWRFbWl0dGVyLmVtaXQoKTtcblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIFN0ZXBzIHRoZSBhbmltYXRpb24gZm9yd2FyZCBieSBhIGNlcnRhaW4gYW1vdW50IG9mIHRpbWUuXG4gICAqXG4gICAqIEBwYXJhbSBkdCAtIEluIHNlY29uZHNcbiAgICovXG4gIHB1YmxpYyBzdGVwKCBkdDogbnVtYmVyICk6IHRoaXMge1xuXG4gICAgLy8gSWdub3JlIHRoZSBzdGVwIGlmIG91ciBhbmltYXRpb24gaXMgbm90IHJ1bm5pbmdcbiAgICBpZiAoICF0aGlzLnJ1bm5pbmdQcm9wZXJ0eS52YWx1ZSApIHtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIC8vIEZpcnN0LCBidXJuIHRocm91Z2ggdGhlIGRlbGF5IGlmIGFuaW1hdGlvbiBoYXNuJ3Qgc3RhcnRlZCB5ZXQuXG4gICAgaWYgKCAhdGhpcy5hbmltYXRpbmdQcm9wZXJ0eS52YWx1ZSApIHtcbiAgICAgIHRoaXMucmVtYWluaW5nRGVsYXkgLT0gZHQ7XG4gICAgICBkdCA9IC10aGlzLnJlbWFpbmluZ0RlbGF5OyAvLyByZWNvcmQgaG93IGZhciBwYXN0IHRoZSBkZWxheSB3ZSBnb1xuXG4gICAgICAvLyBCYWlsIGlmIHdlIGFyZSBub3QgcmVhZHkgdG8gc3RhcnQgdGhlIGFuaW1hdGlvblxuICAgICAgaWYgKCB0aGlzLnJlbWFpbmluZ0RlbGF5ID4gMCApIHtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICB9XG5cbiAgICAgIC8vIENvbXB1dGUgdGhlIHN0YXJ0L2VuZCBmb3IgZWFjaCB0YXJnZXQsIGFuZCBkZXRlcm1pbmUgdGhlIGxlbmd0aCBvZiBvdXIgYW5pbWF0aW9uXG4gICAgICB0aGlzLmxlbmd0aCA9IHRoaXMuZHVyYXRpb247XG4gICAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCB0aGlzLnRhcmdldHMubGVuZ3RoOyBpKysgKSB7XG4gICAgICAgIGNvbnN0IHRhcmdldCA9IHRoaXMudGFyZ2V0c1sgaSBdO1xuICAgICAgICB0YXJnZXQuY29tcHV0ZVN0YXJ0RW5kKCk7XG5cbiAgICAgICAgLy8gSWYgd2UgZG9uJ3QgaGF2ZSBhIGNvbXB1dGVkIGxlbmd0aCB5ZXQsIGNoZWNrIGFsbCBvZiBvdXIgdGFyZ2V0c1xuICAgICAgICBpZiAoIHRoaXMubGVuZ3RoID09PSBudWxsICkge1xuICAgICAgICAgIHRoaXMubGVuZ3RoID0gdGFyZ2V0LmdldFByZWZlcnJlZER1cmF0aW9uKCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGFzc2VydCAmJiBhc3NlcnQoIHRoaXMubGVuZ3RoICE9PSBudWxsLCAnQWZ0ZXIgZ29pbmcgdGhyb3VnaCB0aGUgdGFyZ2V0cywgd2Ugc2hvdWxkIGhhdmUgYSBsZW5ndGggYnkgbm93JyApO1xuICAgICAgdGhpcy5yZW1haW5pbmdBbmltYXRpb24gPSB0aGlzLmxlbmd0aCE7XG5cbiAgICAgIC8vIE5vdGlmeSBhYm91dCB0aGUgYW5pbWF0aW9uIHN0YXJ0aW5nXG4gICAgICB0aGlzLmFuaW1hdGluZ1Byb3BlcnR5LnZhbHVlID0gdHJ1ZTtcbiAgICAgIHRoaXMuYmVnaW5FbWl0dGVyLmVtaXQoKTtcbiAgICB9XG5cbiAgICAvLyBUYWtlIG91ciBkdCBvZmYgb2Ygb3VyIHJlbWFpbmluZyB0aW1lXG4gICAgdGhpcy5yZW1haW5pbmdBbmltYXRpb24gLT0gZHQ7XG4gICAgZHQgPSAtdGhpcy5yZW1haW5pbmdBbmltYXRpb247IC8vIHJlY29yZCBob3cgZmFyIHBhc3QgdGhlIGFuaW1hdGlvbiB3ZSBnb1xuXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdGhpcy5sZW5ndGggIT09IG51bGwgKTtcbiAgICBjb25zdCByYXRpbyA9IHRoaXMubGVuZ3RoISA+IDAgPyBVdGlscy5jbGFtcCggKCB0aGlzLmxlbmd0aCEgLSB0aGlzLnJlbWFpbmluZ0FuaW1hdGlvbiApIC8gdGhpcy5sZW5ndGghLCAwLCAxICkgOiAxO1xuICAgIGZvciAoIGxldCBqID0gMDsgaiA8IHRoaXMudGFyZ2V0cy5sZW5ndGg7IGorKyApIHtcbiAgICAgIHRoaXMudGFyZ2V0c1sgaiBdLnVwZGF0ZSggcmF0aW8gKTtcbiAgICB9XG5cbiAgICAvLyBOb3RpZmljYXRpb25cbiAgICB0aGlzLnVwZGF0ZUVtaXR0ZXIuZW1pdCgpO1xuXG4gICAgLy8gSGFuZGxlIGZpbmlzaGluZyB0aGUgYW5pbWF0aW9uIGlmIGl0IGlzIG92ZXIuXG4gICAgaWYgKCByYXRpbyA9PT0gMSApIHtcbiAgICAgIHRoaXMuYW5pbWF0aW5nUHJvcGVydHkudmFsdWUgPSBmYWxzZTtcbiAgICAgIHRoaXMucnVubmluZ1Byb3BlcnR5LnZhbHVlID0gZmFsc2U7XG5cbiAgICAgIC8vIFN0ZXAgaW50byB0aGUgbmV4dCBhbmltYXRpb24gYnkgdGhlIG92ZXJmbG93IHRpbWVcbiAgICAgIHRoaXMuZmluaXNoRW1pdHRlci5lbWl0KCBkdCApO1xuICAgICAgdGhpcy5lbmRlZEVtaXR0ZXIuZW1pdCgpO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIEFmdGVyIHRoaXMgYW5pbWF0aW9uIGlzIGNvbXBsZXRlLCB0aGUgZ2l2ZW4gYW5pbWF0aW9uIHdpbGwgYmUgc3RhcnRlZC5cbiAgICpcbiAgICogQHJldHVybnMgLSBSZXR1cm5zIHRoZSBwYXNzZWQtaW4gYW5pbWF0aW9uIHNvIHRoaW5ncyBjYW4gYmUgY2hhaW5lZCBuaWNlbHkuXG4gICAqL1xuICBwdWJsaWMgdGhlbiggYW5pbWF0aW9uOiBBbmltYXRpb24gKTogQW5pbWF0aW9uIHtcbiAgICB0aGlzLmZpbmlzaEVtaXR0ZXIuYWRkTGlzdGVuZXIoICggZHQ6IG51bWJlciApID0+IGFuaW1hdGlvbi5zdGFydCggZHQgKSApO1xuICAgIHJldHVybiBhbmltYXRpb247XG4gIH1cblxuICBwdWJsaWMgb3ZlcnJpZGUgZGlzcG9zZSgpOiB2b2lkIHtcbiAgICB0aGlzLnJ1bm5pbmdQcm9wZXJ0eS5kaXNwb3NlKCk7XG4gICAgdGhpcy5hbmltYXRpbmdQcm9wZXJ0eS5kaXNwb3NlKCk7XG4gICAgdGhpcy5zdGFydEVtaXR0ZXIuZGlzcG9zZSgpO1xuICAgIHRoaXMuYmVnaW5FbWl0dGVyLmRpc3Bvc2UoKTtcbiAgICB0aGlzLmZpbmlzaEVtaXR0ZXIuZGlzcG9zZSgpO1xuICAgIHRoaXMuc3RvcEVtaXR0ZXIuZGlzcG9zZSgpO1xuICAgIHRoaXMuZW5kZWRFbWl0dGVyLmRpc3Bvc2UoKTtcbiAgICB0aGlzLnVwZGF0ZUVtaXR0ZXIuZGlzcG9zZSgpO1xuICAgIHN1cGVyLmRpc3Bvc2UoKTtcbiAgfVxufVxuXG50d2l4dC5yZWdpc3RlciggJ0FuaW1hdGlvbicsIEFuaW1hdGlvbiApO1xuZXhwb3J0IGRlZmF1bHQgQW5pbWF0aW9uOyJdLCJuYW1lcyI6WyJCb29sZWFuUHJvcGVydHkiLCJEaXNwb3NhYmxlIiwiRW1pdHRlciIsInN0ZXBUaW1lciIsIlRpbnlFbWl0dGVyIiwiVXRpbHMiLCJvcHRpb25pemUiLCJBbmltYXRpb25UYXJnZXQiLCJ0d2l4dCIsIkFuaW1hdGlvbiIsInN0YXJ0IiwiZHQiLCJydW5uaW5nUHJvcGVydHkiLCJ2YWx1ZSIsInJlbWFpbmluZ0RlbGF5IiwiZGVsYXkiLCJzdGFydEVtaXR0ZXIiLCJlbWl0Iiwic3RlcCIsInVuZGVmaW5lZCIsInN0b3AiLCJzdG9wRW1pdHRlciIsImVuZGVkRW1pdHRlciIsImFuaW1hdGluZ1Byb3BlcnR5IiwibGVuZ3RoIiwiZHVyYXRpb24iLCJpIiwidGFyZ2V0cyIsInRhcmdldCIsImNvbXB1dGVTdGFydEVuZCIsImdldFByZWZlcnJlZER1cmF0aW9uIiwiYXNzZXJ0IiwicmVtYWluaW5nQW5pbWF0aW9uIiwiYmVnaW5FbWl0dGVyIiwicmF0aW8iLCJjbGFtcCIsImoiLCJ1cGRhdGUiLCJ1cGRhdGVFbWl0dGVyIiwiZmluaXNoRW1pdHRlciIsInRoZW4iLCJhbmltYXRpb24iLCJhZGRMaXN0ZW5lciIsImRpc3Bvc2UiLCJwcm92aWRlZENvbmZpZyIsImNvbmZpZyIsInN0ZXBFbWl0dGVyIiwicHJvcGVydHkiLCJvYmplY3QiLCJzZXRWYWx1ZSIsImlzRmluaXRlIiwicGFyYW1ldGVycyIsInZhbHVlVHlwZSIsImhhc0xpc3RlbmVyT3JkZXJEZXBlbmRlbmNpZXMiLCJtYXAiLCJfIiwic3VtIiwiaGFzUHJlZmVycmVkRHVyYXRpb24iLCJzdGVwTGlzdGVuZXIiLCJiaW5kIiwibGluayIsInJ1bm5pbmciLCJoYXNMaXN0ZW5lciIsInJlbW92ZUxpc3RlbmVyIiwiZGlzcG9zZUVtaXR0ZXIiLCJyZWdpc3RlciJdLCJtYXBwaW5ncyI6IkFBQUEsc0RBQXNEO0FBRXREOzs7Ozs7Ozs7Ozs7Ozs7Ozs7O0NBbUJDLEdBRUQsT0FBT0EscUJBQXFCLG1DQUFtQztBQUMvRCxPQUFPQyxnQkFBdUMsOEJBQThCO0FBQzVFLE9BQU9DLGFBQWEsMkJBQTJCO0FBQy9DLE9BQU9DLGVBQWUsNkJBQTZCO0FBRW5ELE9BQU9DLGlCQUFpQiwrQkFBK0I7QUFDdkQsT0FBT0MsV0FBVyx3QkFBd0I7QUFDMUMsT0FBT0MsZUFBZSxrQ0FBa0M7QUFDeEQsT0FBT0MscUJBQWlELHVCQUF1QjtBQUMvRSxPQUFPQyxXQUFXLGFBQWE7QUFrQy9CLElBQUEsQUFBTUMsWUFBTixNQUFNQSxrQkFBa01SO0lBbUt0TTs7OztHQUlDLEdBQ0QsQUFBT1MsTUFBT0MsRUFBVyxFQUFTO1FBQ2hDLDBDQUEwQztRQUMxQyxJQUFLLElBQUksQ0FBQ0MsZUFBZSxDQUFDQyxLQUFLLEVBQUc7WUFDaEMsT0FBTyxJQUFJO1FBQ2I7UUFFQSwyRUFBMkU7UUFDM0UsSUFBSSxDQUFDQyxjQUFjLEdBQUcsSUFBSSxDQUFDQyxLQUFLO1FBRWhDLGdCQUFnQjtRQUNoQixJQUFJLENBQUNILGVBQWUsQ0FBQ0MsS0FBSyxHQUFHO1FBQzdCLElBQUksQ0FBQ0csWUFBWSxDQUFDQyxJQUFJO1FBRXRCLGlDQUFpQztRQUNqQyxJQUFJLENBQUNDLElBQUks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