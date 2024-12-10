// Copyright 2023, University of Colorado Boulder
/**
 * Holds content, and can transition to other content with a variety of animations. During a transition, there is always
 * the "from" content that animates out, and the "to" content that animates in.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ import { Shape } from '../../kite/js/imports.js';
import optionize from '../../phet-core/js/optionize.js';
import { Node } from '../../scenery/js/imports.js';
import Transition from './Transition.js';
import twixt from './twixt.js';
let TransitionNode = class TransitionNode extends Node {
    /**
   * Steps forward in time, animating the transition.
   */ step(dt) {
        this.transition && this.transition.step(dt);
    }
    /**
   * Interrupts the transition, ending it and resetting the animated values.
   */ interrupt() {
        this.transition && this.transition.stop();
    }
    /**
   * Called on bounds changes.
   */ onBoundsChange(bounds) {
        this.interrupt();
        if (this.useBoundsClip) {
            this.clipArea = Shape.bounds(bounds);
        }
        // Provide a localBounds override so that we take up at least the provided bounds. This makes layout easier so
        // that the TransitionNode always provides consistent bounds with clipping. See
        // https://github.com/phetsims/twixt/issues/15.
        this.paddingNode.localBounds = bounds;
    }
    /**
   * Start a transition to replace our content with the new content, using Transition.slideLeft.
   *
   * @param content - If null, the current content will still animate out (with nothing replacing it).
   * @param config - Passed as config to the Animation. Usually a duration should be included.
   * @returns - Available to add end listeners, etc.
   */ slideLeftTo(content, config) {
        this.interrupt();
        return this.startTransition(content, Transition.slideLeft(this.transitionBoundsProperty.value, this.fromContent, content, config));
    }
    /**
   * Start a transition to replace our content with the new content, using Transition.slideRight.
   *
   * @param content - If null, the current content will still animate out (with nothing replacing it).
   * @param config - Passed as config to the Animation. Usually a duration should be included.
   * @returns - Available to add end listeners, etc.
   */ slideRightTo(content, config) {
        this.interrupt();
        return this.startTransition(content, Transition.slideRight(this.transitionBoundsProperty.value, this.fromContent, content, config));
    }
    /**
   * Start a transition to replace our content with the new content, using Transition.slideUp.
   *
   * @param content - If null, the current content will still animate out (with nothing replacing it).
   * @param config - Passed as config to the Animation. Usually a duration should be included.
   * @returns - Available to add end listeners, etc.
   */ slideUpTo(content, config) {
        this.interrupt();
        return this.startTransition(content, Transition.slideUp(this.transitionBoundsProperty.value, this.fromContent, content, config));
    }
    /**
   * Start a transition to replace our content with the new content, using Transition.slideDown.
   *
   * @param content - If null, the current content will still animate out (with nothing replacing it).
   * @param config - Passed as config to the Animation. Usually a duration should be included.
   * @returns - Available to add end listeners, etc.
   */ slideDownTo(content, config) {
        this.interrupt();
        return this.startTransition(content, Transition.slideDown(this.transitionBoundsProperty.value, this.fromContent, content, config));
    }
    /**
   * Start a transition to replace our content with the new content, using Transition.wipeLeft.
   *
   * @param content - If null, the current content will still animate out (with nothing replacing it).
   * @param config - Passed as config to the Animation. Usually a duration should be included.
   * @returns - Available to add end listeners, etc.
   */ wipeLeftTo(content, config) {
        this.interrupt();
        return this.startTransition(content, Transition.wipeLeft(this.transitionBoundsProperty.value, this.fromContent, content, config));
    }
    /**
   * Start a transition to replace our content with the new content, using Transition.wipeRight.
   *
   * @param content - If null, the current content will still animate out (with nothing replacing it).
   * @param config - Passed as config to the Animation. Usually a duration should be included.
   * @returns - Available to add end listeners, etc.
   */ wipeRightTo(content, config) {
        this.interrupt();
        return this.startTransition(content, Transition.wipeRight(this.transitionBoundsProperty.value, this.fromContent, content, config));
    }
    /**
   * Start a transition to replace our content with the new content, using Transition.wipeUp.
   *
   * @param content - If null, the current content will still animate out (with nothing replacing it).
   * @param config - Passed as config to the Animation. Usually a duration should be included.
   * @returns - Available to add end listeners, etc.
   */ wipeUpTo(content, config) {
        this.interrupt();
        return this.startTransition(content, Transition.wipeUp(this.transitionBoundsProperty.value, this.fromContent, content, config));
    }
    /**
   * Start a transition to replace our content with the new content, using Transition.wipeDown.
   *
   * @param content - If null, the current content will still animate out (with nothing replacing it).
   * @param config - Passed as config to the Animation. Usually a duration should be included.
   * @returns - Available to add end listeners, etc.
   */ wipeDownTo(content, config) {
        this.interrupt();
        return this.startTransition(content, Transition.wipeDown(this.transitionBoundsProperty.value, this.fromContent, content, config));
    }
    /**
   * Start a transition to replace our content with the new content, using Transition.dissolve.
   *
   * @param content - If null, the current content will still animate out (with nothing replacing it).
   * @param config - Passed as config to the Animation. Usually a duration should be included.
   * @returns - Available to add end listeners, etc.
   */ dissolveTo(content, config) {
        this.interrupt();
        return this.startTransition(content, Transition.dissolve(this.fromContent, content, config));
    }
    /**
   * Starts a transition, and hooks up a listener to handle state changes when it ends.
   *
   * @returns - Available to add end listeners, etc. (chained)
   */ startTransition(content, transition) {
        // Stop animating if we were before
        this.interrupt();
        this.toContent = content;
        if (content) {
            if (_.includes(this.cachedNodes, content)) {
                content.visible = true;
            } else {
                this.addChild(content);
            }
            assert && assert(this.hasChild(content), 'Should always have the content as a child at the start of a transition');
        }
        this.transition = transition;
        // Simplifies many things if the user can't mess with things while animating.
        if (this.fromContent) {
            this.fromContent.pickable = false;
        }
        if (this.toContent) {
            this.toContent.pickable = false;
        }
        transition.endedEmitter.addListener(()=>{
            if (this.fromContent) {
                this.fromContent.pickable = null;
            }
            if (this.toContent) {
                this.toContent.pickable = null;
            }
            this.transition = null;
            if (this.fromContent) {
                if (_.includes(this.cachedNodes, this.fromContent)) {
                    this.fromContent.visible = false;
                } else {
                    this.removeChild(this.fromContent);
                }
                assert && assert(this.hasChild(this.fromContent) === _.includes(this.cachedNodes, this.fromContent), 'Should have removed the child if it is not included in our cachedNodes');
            }
            this.fromContent = this.toContent;
            this.toContent = null;
        });
        transition.start();
        return transition;
    }
    dispose() {
        this.interrupt();
        this.transitionBoundsProperty.unlink(this.boundsListener);
        super.dispose();
    }
    /**
   * NOTE: The content's transform/pickability/visibility/opacity/clipArea/etc. can be modified, and will be reset to
   * the default value
   *
   * @param transitionBoundsProperty - Use visibleBoundsProperty (from the ScreenView) for full-screen transitions.
   *                                   Generally TransitionNode assumes all content, when it has no transform applied,
   *                                   is meant to by laid out within these bounds.
   * @param [options]
   */ constructor(transitionBoundsProperty, providedOptions){
        const options = optionize()({
            content: null,
            useBoundsClip: true,
            cachedNodes: []
        }, providedOptions);
        assert && assert(!options.children, 'Children should not be specified, since cachedNodes will be applied');
        super(), // Holds the content that we are animating towards.
        this.toContent = null;
        this.transitionBoundsProperty = transitionBoundsProperty;
        this.useBoundsClip = options.useBoundsClip;
        this.cachedNodes = options.cachedNodes;
        this.fromContent = options.content;
        this.children = this.cachedNodes;
        for(let i = 0; i < this.cachedNodes.length; i++){
            const cachedNode = this.cachedNodes[i];
            cachedNode.visible = cachedNode === this.fromContent;
        }
        if (this.fromContent && !_.includes(this.cachedNodes, this.fromContent)) {
            this.addChild(this.fromContent);
        }
        this.transition = null;
        this.paddingNode = new Node();
        this.addChild(this.paddingNode);
        this.boundsListener = this.onBoundsChange.bind(this);
        this.transitionBoundsProperty.link(this.boundsListener);
        this.mutate(options);
    }
};
twixt.register('TransitionNode', TransitionNode);
export default TransitionNode;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3R3aXh0L2pzL1RyYW5zaXRpb25Ob2RlLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDIzLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuLyoqXG4gKiBIb2xkcyBjb250ZW50LCBhbmQgY2FuIHRyYW5zaXRpb24gdG8gb3RoZXIgY29udGVudCB3aXRoIGEgdmFyaWV0eSBvZiBhbmltYXRpb25zLiBEdXJpbmcgYSB0cmFuc2l0aW9uLCB0aGVyZSBpcyBhbHdheXNcbiAqIHRoZSBcImZyb21cIiBjb250ZW50IHRoYXQgYW5pbWF0ZXMgb3V0LCBhbmQgdGhlIFwidG9cIiBjb250ZW50IHRoYXQgYW5pbWF0ZXMgaW4uXG4gKlxuICogQGF1dGhvciBKb25hdGhhbiBPbHNvbiA8am9uYXRoYW4ub2xzb25AY29sb3JhZG8uZWR1PlxuICovXG5cbmltcG9ydCBUUmVhZE9ubHlQcm9wZXJ0eSBmcm9tICcuLi8uLi9heG9uL2pzL1RSZWFkT25seVByb3BlcnR5LmpzJztcbmltcG9ydCBCb3VuZHMyIGZyb20gJy4uLy4uL2RvdC9qcy9Cb3VuZHMyLmpzJztcbmltcG9ydCB7IFNoYXBlIH0gZnJvbSAnLi4vLi4va2l0ZS9qcy9pbXBvcnRzLmpzJztcbmltcG9ydCBvcHRpb25pemUgZnJvbSAnLi4vLi4vcGhldC1jb3JlL2pzL29wdGlvbml6ZS5qcyc7XG5pbXBvcnQgU3RyaWN0T21pdCBmcm9tICcuLi8uLi9waGV0LWNvcmUvanMvdHlwZXMvU3RyaWN0T21pdC5qcyc7XG5pbXBvcnQgeyBOb2RlLCBOb2RlT3B0aW9ucyB9IGZyb20gJy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XG5pbXBvcnQgVHJhbnNpdGlvbiwgeyBEaXNzb2x2ZVRyYW5zaXRpb25PcHRpb25zLCBTbGlkZVRyYW5zaXRpb25PcHRpb25zLCBXaXBlVHJhbnNpdGlvbk9wdGlvbnMgfSBmcm9tICcuL1RyYW5zaXRpb24uanMnO1xuaW1wb3J0IHR3aXh0IGZyb20gJy4vdHdpeHQuanMnO1xuXG50eXBlIFNlbGZPcHRpb25zID0ge1xuICAvLyBPcHRpb25hbGx5IG1heSBoYXZlIGluaXRpYWwgY29udGVudFxuICBjb250ZW50PzogTm9kZSB8IG51bGw7XG5cbiAgLy8gSWYgdHJ1ZSwgYSBjbGlwIGFyZWEgd2lsbCBiZSBzZXQgdG8gdGhlIHZhbHVlIG9mIHRoZSB0cmFuc2l0aW9uQm91bmRzUHJvcGVydHkgc28gdGhhdCBvdXRzaWRlIGNvbnRlbnQgd29uJ3QgYmVcbiAgLy8gc2hvd24uXG4gIHVzZUJvdW5kc0NsaXA/OiBib29sZWFuO1xuXG4gIC8vIEFueSBub2RlIHNwZWNpZmllZCBpbiB0aGlzIGFycmF5IHdpbGwgYmUgYWRkZWQgYXMgYSBwZXJtYW5lbnQgY2hpbGQgaW50ZXJuYWxseSwgc28gdGhhdCB0cmFuc2l0aW9ucyB0by9mcm9tIGl0XG4gIC8vIGRvZXNuJ3QgaW5jdXIgaGlnaGVyIHBlcmZvcm1hbmNlIHBlbmFsdGllcy4gSXQgd2lsbCBpbnN0ZWFkIGp1c3QgYmUgaW52aXNpYmxlIHdoZW4gbm90IGludm9sdmVkIGluIGEgdHJhbnNpdGlvbi5cbiAgLy8gUGVyZm9ybWFuY2UgaXNzdWVzIHdlcmUgaW5pdGlhbGx5IG5vdGVkIGluXG4gIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9lcXVhbGl0eS1leHBsb3Jlci9pc3N1ZXMvNzUuIEFkZGl0aW9uYWwgbm90ZXMgaW5cbiAgLy8gaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3R3aXh0L2lzc3Vlcy8xNy5cbiAgY2FjaGVkTm9kZXM/OiBOb2RlW107XG59O1xuXG5leHBvcnQgdHlwZSBUcmFuc2l0aW9uTm9kZU9wdGlvbnMgPSBTZWxmT3B0aW9ucyAmIFN0cmljdE9taXQ8Tm9kZU9wdGlvbnMsICdjaGlsZHJlbic+O1xuXG5jbGFzcyBUcmFuc2l0aW9uTm9kZSBleHRlbmRzIE5vZGUge1xuXG4gIHByaXZhdGUgcmVhZG9ubHkgdHJhbnNpdGlvbkJvdW5kc1Byb3BlcnR5OiBUUmVhZE9ubHlQcm9wZXJ0eTxCb3VuZHMyPjtcbiAgcHJpdmF0ZSByZWFkb25seSB1c2VCb3VuZHNDbGlwOiBib29sZWFuO1xuICBwcml2YXRlIHJlYWRvbmx5IGNhY2hlZE5vZGVzOiBOb2RlW107XG5cbiAgLy8gV2hlbiBhbmltYXRpbmcsIGl0IGlzIHRoZSBjb250ZW50IHRoYXQgd2UgYXJlIGFuaW1hdGluZyBhd2F5IGZyb20uIE90aGVyd2lzZSwgaXQgaG9sZHMgdGhlIG1haW4gY29udGVudCBub2RlLlxuICBwcml2YXRlIGZyb21Db250ZW50OiBOb2RlIHwgbnVsbDtcblxuICAvLyBIb2xkcyB0aGUgY29udGVudCB0aGF0IHdlIGFyZSBhbmltYXRpbmcgdG93YXJkcy5cbiAgcHJpdmF0ZSB0b0NvbnRlbnQ6IE5vZGUgfCBudWxsID0gbnVsbDtcblxuICAvLyBJZiB3ZSBhcmUgYW5pbWF0aW5nLCB0aGlzIHdpbGwgYmUgbm9uLW51bGxcbiAgcHJpdmF0ZSB0cmFuc2l0aW9uOiBUcmFuc2l0aW9uIHwgbnVsbDtcblxuICBwcml2YXRlIHBhZGRpbmdOb2RlOiBOb2RlO1xuICBwcml2YXRlIGJvdW5kc0xpc3RlbmVyOiAoIGJvdW5kczogQm91bmRzMiApID0+IHZvaWQ7XG5cbiAgLyoqXG4gICAqIE5PVEU6IFRoZSBjb250ZW50J3MgdHJhbnNmb3JtL3BpY2thYmlsaXR5L3Zpc2liaWxpdHkvb3BhY2l0eS9jbGlwQXJlYS9ldGMuIGNhbiBiZSBtb2RpZmllZCwgYW5kIHdpbGwgYmUgcmVzZXQgdG9cbiAgICogdGhlIGRlZmF1bHQgdmFsdWVcbiAgICpcbiAgICogQHBhcmFtIHRyYW5zaXRpb25Cb3VuZHNQcm9wZXJ0eSAtIFVzZSB2aXNpYmxlQm91bmRzUHJvcGVydHkgKGZyb20gdGhlIFNjcmVlblZpZXcpIGZvciBmdWxsLXNjcmVlbiB0cmFuc2l0aW9ucy5cbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIEdlbmVyYWxseSBUcmFuc2l0aW9uTm9kZSBhc3N1bWVzIGFsbCBjb250ZW50LCB3aGVuIGl0IGhhcyBubyB0cmFuc2Zvcm0gYXBwbGllZCxcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlzIG1lYW50IHRvIGJ5IGxhaWQgb3V0IHdpdGhpbiB0aGVzZSBib3VuZHMuXG4gICAqIEBwYXJhbSBbb3B0aW9uc11cbiAgICovXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggdHJhbnNpdGlvbkJvdW5kc1Byb3BlcnR5OiBUUmVhZE9ubHlQcm9wZXJ0eTxCb3VuZHMyPiwgcHJvdmlkZWRPcHRpb25zPzogVHJhbnNpdGlvbk5vZGVPcHRpb25zICkge1xuXG4gICAgY29uc3Qgb3B0aW9ucyA9IG9wdGlvbml6ZTxUcmFuc2l0aW9uTm9kZU9wdGlvbnMsIFNlbGZPcHRpb25zLCBOb2RlT3B0aW9ucz4oKSgge1xuICAgICAgY29udGVudDogbnVsbCxcbiAgICAgIHVzZUJvdW5kc0NsaXA6IHRydWUsXG4gICAgICBjYWNoZWROb2RlczogW11cbiAgICB9LCBwcm92aWRlZE9wdGlvbnMgKTtcblxuICAgIGFzc2VydCAmJiBhc3NlcnQoICFvcHRpb25zLmNoaWxkcmVuLCAnQ2hpbGRyZW4gc2hvdWxkIG5vdCBiZSBzcGVjaWZpZWQsIHNpbmNlIGNhY2hlZE5vZGVzIHdpbGwgYmUgYXBwbGllZCcgKTtcblxuICAgIHN1cGVyKCk7XG5cbiAgICB0aGlzLnRyYW5zaXRpb25Cb3VuZHNQcm9wZXJ0eSA9IHRyYW5zaXRpb25Cb3VuZHNQcm9wZXJ0eTtcbiAgICB0aGlzLnVzZUJvdW5kc0NsaXAgPSBvcHRpb25zLnVzZUJvdW5kc0NsaXA7XG4gICAgdGhpcy5jYWNoZWROb2RlcyA9IG9wdGlvbnMuY2FjaGVkTm9kZXM7XG4gICAgdGhpcy5mcm9tQ29udGVudCA9IG9wdGlvbnMuY29udGVudDtcblxuICAgIHRoaXMuY2hpbGRyZW4gPSB0aGlzLmNhY2hlZE5vZGVzO1xuICAgIGZvciAoIGxldCBpID0gMDsgaSA8IHRoaXMuY2FjaGVkTm9kZXMubGVuZ3RoOyBpKysgKSB7XG4gICAgICBjb25zdCBjYWNoZWROb2RlID0gdGhpcy5jYWNoZWROb2Rlc1sgaSBdO1xuICAgICAgY2FjaGVkTm9kZS52aXNpYmxlID0gY2FjaGVkTm9kZSA9PT0gdGhpcy5mcm9tQ29udGVudDtcbiAgICB9XG5cbiAgICBpZiAoIHRoaXMuZnJvbUNvbnRlbnQgJiYgIV8uaW5jbHVkZXMoIHRoaXMuY2FjaGVkTm9kZXMsIHRoaXMuZnJvbUNvbnRlbnQgKSApIHtcbiAgICAgIHRoaXMuYWRkQ2hpbGQoIHRoaXMuZnJvbUNvbnRlbnQgKTtcbiAgICB9XG5cbiAgICB0aGlzLnRyYW5zaXRpb24gPSBudWxsO1xuXG4gICAgdGhpcy5wYWRkaW5nTm9kZSA9IG5ldyBOb2RlKCk7XG4gICAgdGhpcy5hZGRDaGlsZCggdGhpcy5wYWRkaW5nTm9kZSApO1xuXG4gICAgdGhpcy5ib3VuZHNMaXN0ZW5lciA9IHRoaXMub25Cb3VuZHNDaGFuZ2UuYmluZCggdGhpcyApO1xuICAgIHRoaXMudHJhbnNpdGlvbkJvdW5kc1Byb3BlcnR5LmxpbmsoIHRoaXMuYm91bmRzTGlzdGVuZXIgKTtcblxuICAgIHRoaXMubXV0YXRlKCBvcHRpb25zICk7XG4gIH1cblxuICAvKipcbiAgICogU3RlcHMgZm9yd2FyZCBpbiB0aW1lLCBhbmltYXRpbmcgdGhlIHRyYW5zaXRpb24uXG4gICAqL1xuICBwdWJsaWMgc3RlcCggZHQ6IG51bWJlciApOiB2b2lkIHtcbiAgICB0aGlzLnRyYW5zaXRpb24gJiYgdGhpcy50cmFuc2l0aW9uLnN0ZXAoIGR0ICk7XG4gIH1cblxuICAvKipcbiAgICogSW50ZXJydXB0cyB0aGUgdHJhbnNpdGlvbiwgZW5kaW5nIGl0IGFuZCByZXNldHRpbmcgdGhlIGFuaW1hdGVkIHZhbHVlcy5cbiAgICovXG4gIHB1YmxpYyBpbnRlcnJ1cHQoKTogdm9pZCB7XG4gICAgdGhpcy50cmFuc2l0aW9uICYmIHRoaXMudHJhbnNpdGlvbi5zdG9wKCk7XG4gIH1cblxuICAvKipcbiAgICogQ2FsbGVkIG9uIGJvdW5kcyBjaGFuZ2VzLlxuICAgKi9cbiAgcHJpdmF0ZSBvbkJvdW5kc0NoYW5nZSggYm91bmRzOiBCb3VuZHMyICk6IHZvaWQge1xuICAgIHRoaXMuaW50ZXJydXB0KCk7XG5cbiAgICBpZiAoIHRoaXMudXNlQm91bmRzQ2xpcCApIHtcbiAgICAgIHRoaXMuY2xpcEFyZWEgPSBTaGFwZS5ib3VuZHMoIGJvdW5kcyApO1xuICAgIH1cblxuICAgIC8vIFByb3ZpZGUgYSBsb2NhbEJvdW5kcyBvdmVycmlkZSBzbyB0aGF0IHdlIHRha2UgdXAgYXQgbGVhc3QgdGhlIHByb3ZpZGVkIGJvdW5kcy4gVGhpcyBtYWtlcyBsYXlvdXQgZWFzaWVyIHNvXG4gICAgLy8gdGhhdCB0aGUgVHJhbnNpdGlvbk5vZGUgYWx3YXlzIHByb3ZpZGVzIGNvbnNpc3RlbnQgYm91bmRzIHdpdGggY2xpcHBpbmcuIFNlZVxuICAgIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy90d2l4dC9pc3N1ZXMvMTUuXG4gICAgdGhpcy5wYWRkaW5nTm9kZS5sb2NhbEJvdW5kcyA9IGJvdW5kcztcbiAgfVxuXG4gIC8qKlxuICAgKiBTdGFydCBhIHRyYW5zaXRpb24gdG8gcmVwbGFjZSBvdXIgY29udGVudCB3aXRoIHRoZSBuZXcgY29udGVudCwgdXNpbmcgVHJhbnNpdGlvbi5zbGlkZUxlZnQuXG4gICAqXG4gICAqIEBwYXJhbSBjb250ZW50IC0gSWYgbnVsbCwgdGhlIGN1cnJlbnQgY29udGVudCB3aWxsIHN0aWxsIGFuaW1hdGUgb3V0ICh3aXRoIG5vdGhpbmcgcmVwbGFjaW5nIGl0KS5cbiAgICogQHBhcmFtIGNvbmZpZyAtIFBhc3NlZCBhcyBjb25maWcgdG8gdGhlIEFuaW1hdGlvbi4gVXN1YWxseSBhIGR1cmF0aW9uIHNob3VsZCBiZSBpbmNsdWRlZC5cbiAgICogQHJldHVybnMgLSBBdmFpbGFibGUgdG8gYWRkIGVuZCBsaXN0ZW5lcnMsIGV0Yy5cbiAgICovXG4gIHB1YmxpYyBzbGlkZUxlZnRUbyggY29udGVudDogTm9kZSB8IG51bGwsIGNvbmZpZz86IFNsaWRlVHJhbnNpdGlvbk9wdGlvbnMgKTogVHJhbnNpdGlvbiB7XG4gICAgdGhpcy5pbnRlcnJ1cHQoKTtcbiAgICByZXR1cm4gdGhpcy5zdGFydFRyYW5zaXRpb24oIGNvbnRlbnQsIFRyYW5zaXRpb24uc2xpZGVMZWZ0KCB0aGlzLnRyYW5zaXRpb25Cb3VuZHNQcm9wZXJ0eS52YWx1ZSwgdGhpcy5mcm9tQ29udGVudCwgY29udGVudCwgY29uZmlnICkgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTdGFydCBhIHRyYW5zaXRpb24gdG8gcmVwbGFjZSBvdXIgY29udGVudCB3aXRoIHRoZSBuZXcgY29udGVudCwgdXNpbmcgVHJhbnNpdGlvbi5zbGlkZVJpZ2h0LlxuICAgKlxuICAgKiBAcGFyYW0gY29udGVudCAtIElmIG51bGwsIHRoZSBjdXJyZW50IGNvbnRlbnQgd2lsbCBzdGlsbCBhbmltYXRlIG91dCAod2l0aCBub3RoaW5nIHJlcGxhY2luZyBpdCkuXG4gICAqIEBwYXJhbSBjb25maWcgLSBQYXNzZWQgYXMgY29uZmlnIHRvIHRoZSBBbmltYXRpb24uIFVzdWFsbHkgYSBkdXJhdGlvbiBzaG91bGQgYmUgaW5jbHVkZWQuXG4gICAqIEByZXR1cm5zIC0gQXZhaWxhYmxlIHRvIGFkZCBlbmQgbGlzdGVuZXJzLCBldGMuXG4gICAqL1xuICBwdWJsaWMgc2xpZGVSaWdodFRvKCBjb250ZW50OiBOb2RlIHwgbnVsbCwgY29uZmlnPzogU2xpZGVUcmFuc2l0aW9uT3B0aW9ucyApOiBUcmFuc2l0aW9uIHtcbiAgICB0aGlzLmludGVycnVwdCgpO1xuICAgIHJldHVybiB0aGlzLnN0YXJ0VHJhbnNpdGlvbiggY29udGVudCwgVHJhbnNpdGlvbi5zbGlkZVJpZ2h0KCB0aGlzLnRyYW5zaXRpb25Cb3VuZHNQcm9wZXJ0eS52YWx1ZSwgdGhpcy5mcm9tQ29udGVudCwgY29udGVudCwgY29uZmlnICkgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTdGFydCBhIHRyYW5zaXRpb24gdG8gcmVwbGFjZSBvdXIgY29udGVudCB3aXRoIHRoZSBuZXcgY29udGVudCwgdXNpbmcgVHJhbnNpdGlvbi5zbGlkZVVwLlxuICAgKlxuICAgKiBAcGFyYW0gY29udGVudCAtIElmIG51bGwsIHRoZSBjdXJyZW50IGNvbnRlbnQgd2lsbCBzdGlsbCBhbmltYXRlIG91dCAod2l0aCBub3RoaW5nIHJlcGxhY2luZyBpdCkuXG4gICAqIEBwYXJhbSBjb25maWcgLSBQYXNzZWQgYXMgY29uZmlnIHRvIHRoZSBBbmltYXRpb24uIFVzdWFsbHkgYSBkdXJhdGlvbiBzaG91bGQgYmUgaW5jbHVkZWQuXG4gICAqIEByZXR1cm5zIC0gQXZhaWxhYmxlIHRvIGFkZCBlbmQgbGlzdGVuZXJzLCBldGMuXG4gICAqL1xuICBwdWJsaWMgc2xpZGVVcFRvKCBjb250ZW50OiBOb2RlIHwgbnVsbCwgY29uZmlnPzogU2xpZGVUcmFuc2l0aW9uT3B0aW9ucyApOiBUcmFuc2l0aW9uIHtcbiAgICB0aGlzLmludGVycnVwdCgpO1xuICAgIHJldHVybiB0aGlzLnN0YXJ0VHJhbnNpdGlvbiggY29udGVudCwgVHJhbnNpdGlvbi5zbGlkZVVwKCB0aGlzLnRyYW5zaXRpb25Cb3VuZHNQcm9wZXJ0eS52YWx1ZSwgdGhpcy5mcm9tQ29udGVudCwgY29udGVudCwgY29uZmlnICkgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTdGFydCBhIHRyYW5zaXRpb24gdG8gcmVwbGFjZSBvdXIgY29udGVudCB3aXRoIHRoZSBuZXcgY29udGVudCwgdXNpbmcgVHJhbnNpdGlvbi5zbGlkZURvd24uXG4gICAqXG4gICAqIEBwYXJhbSBjb250ZW50IC0gSWYgbnVsbCwgdGhlIGN1cnJlbnQgY29udGVudCB3aWxsIHN0aWxsIGFuaW1hdGUgb3V0ICh3aXRoIG5vdGhpbmcgcmVwbGFjaW5nIGl0KS5cbiAgICogQHBhcmFtIGNvbmZpZyAtIFBhc3NlZCBhcyBjb25maWcgdG8gdGhlIEFuaW1hdGlvbi4gVXN1YWxseSBhIGR1cmF0aW9uIHNob3VsZCBiZSBpbmNsdWRlZC5cbiAgICogQHJldHVybnMgLSBBdmFpbGFibGUgdG8gYWRkIGVuZCBsaXN0ZW5lcnMsIGV0Yy5cbiAgICovXG4gIHB1YmxpYyBzbGlkZURvd25UbyggY29udGVudDogTm9kZSB8IG51bGwsIGNvbmZpZz86IFNsaWRlVHJhbnNpdGlvbk9wdGlvbnMgKTogVHJhbnNpdGlvbiB7XG4gICAgdGhpcy5pbnRlcnJ1cHQoKTtcbiAgICByZXR1cm4gdGhpcy5zdGFydFRyYW5zaXRpb24oIGNvbnRlbnQsIFRyYW5zaXRpb24uc2xpZGVEb3duKCB0aGlzLnRyYW5zaXRpb25Cb3VuZHNQcm9wZXJ0eS52YWx1ZSwgdGhpcy5mcm9tQ29udGVudCwgY29udGVudCwgY29uZmlnICkgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTdGFydCBhIHRyYW5zaXRpb24gdG8gcmVwbGFjZSBvdXIgY29udGVudCB3aXRoIHRoZSBuZXcgY29udGVudCwgdXNpbmcgVHJhbnNpdGlvbi53aXBlTGVmdC5cbiAgICpcbiAgICogQHBhcmFtIGNvbnRlbnQgLSBJZiBudWxsLCB0aGUgY3VycmVudCBjb250ZW50IHdpbGwgc3RpbGwgYW5pbWF0ZSBvdXQgKHdpdGggbm90aGluZyByZXBsYWNpbmcgaXQpLlxuICAgKiBAcGFyYW0gY29uZmlnIC0gUGFzc2VkIGFzIGNvbmZpZyB0byB0aGUgQW5pbWF0aW9uLiBVc3VhbGx5IGEgZHVyYXRpb24gc2hvdWxkIGJlIGluY2x1ZGVkLlxuICAgKiBAcmV0dXJucyAtIEF2YWlsYWJsZSB0byBhZGQgZW5kIGxpc3RlbmVycywgZXRjLlxuICAgKi9cbiAgcHVibGljIHdpcGVMZWZ0VG8oIGNvbnRlbnQ6IE5vZGUgfCBudWxsLCBjb25maWc/OiBXaXBlVHJhbnNpdGlvbk9wdGlvbnMgKTogVHJhbnNpdGlvbiB7XG4gICAgdGhpcy5pbnRlcnJ1cHQoKTtcbiAgICByZXR1cm4gdGhpcy5zdGFydFRyYW5zaXRpb24oIGNvbnRlbnQsIFRyYW5zaXRpb24ud2lwZUxlZnQoIHRoaXMudHJhbnNpdGlvbkJvdW5kc1Byb3BlcnR5LnZhbHVlLCB0aGlzLmZyb21Db250ZW50LCBjb250ZW50LCBjb25maWcgKSApO1xuICB9XG5cbiAgLyoqXG4gICAqIFN0YXJ0IGEgdHJhbnNpdGlvbiB0byByZXBsYWNlIG91ciBjb250ZW50IHdpdGggdGhlIG5ldyBjb250ZW50LCB1c2luZyBUcmFuc2l0aW9uLndpcGVSaWdodC5cbiAgICpcbiAgICogQHBhcmFtIGNvbnRlbnQgLSBJZiBudWxsLCB0aGUgY3VycmVudCBjb250ZW50IHdpbGwgc3RpbGwgYW5pbWF0ZSBvdXQgKHdpdGggbm90aGluZyByZXBsYWNpbmcgaXQpLlxuICAgKiBAcGFyYW0gY29uZmlnIC0gUGFzc2VkIGFzIGNvbmZpZyB0byB0aGUgQW5pbWF0aW9uLiBVc3VhbGx5IGEgZHVyYXRpb24gc2hvdWxkIGJlIGluY2x1ZGVkLlxuICAgKiBAcmV0dXJucyAtIEF2YWlsYWJsZSB0byBhZGQgZW5kIGxpc3RlbmVycywgZXRjLlxuICAgKi9cbiAgcHVibGljIHdpcGVSaWdodFRvKCBjb250ZW50OiBOb2RlIHwgbnVsbCwgY29uZmlnPzogV2lwZVRyYW5zaXRpb25PcHRpb25zICk6IFRyYW5zaXRpb24ge1xuICAgIHRoaXMuaW50ZXJydXB0KCk7XG4gICAgcmV0dXJuIHRoaXMuc3RhcnRUcmFuc2l0aW9uKCBjb250ZW50LCBUcmFuc2l0aW9uLndpcGVSaWdodCggdGhpcy50cmFuc2l0aW9uQm91bmRzUHJvcGVydHkudmFsdWUsIHRoaXMuZnJvbUNvbnRlbnQsIGNvbnRlbnQsIGNvbmZpZyApICk7XG4gIH1cblxuICAvKipcbiAgICogU3RhcnQgYSB0cmFuc2l0aW9uIHRvIHJlcGxhY2Ugb3VyIGNvbnRlbnQgd2l0aCB0aGUgbmV3IGNvbnRlbnQsIHVzaW5nIFRyYW5zaXRpb24ud2lwZVVwLlxuICAgKlxuICAgKiBAcGFyYW0gY29udGVudCAtIElmIG51bGwsIHRoZSBjdXJyZW50IGNvbnRlbnQgd2lsbCBzdGlsbCBhbmltYXRlIG91dCAod2l0aCBub3RoaW5nIHJlcGxhY2luZyBpdCkuXG4gICAqIEBwYXJhbSBjb25maWcgLSBQYXNzZWQgYXMgY29uZmlnIHRvIHRoZSBBbmltYXRpb24uIFVzdWFsbHkgYSBkdXJhdGlvbiBzaG91bGQgYmUgaW5jbHVkZWQuXG4gICAqIEByZXR1cm5zIC0gQXZhaWxhYmxlIHRvIGFkZCBlbmQgbGlzdGVuZXJzLCBldGMuXG4gICAqL1xuICBwdWJsaWMgd2lwZVVwVG8oIGNvbnRlbnQ6IE5vZGUgfCBudWxsLCBjb25maWc/OiBXaXBlVHJhbnNpdGlvbk9wdGlvbnMgKTogVHJhbnNpdGlvbiB7XG4gICAgdGhpcy5pbnRlcnJ1cHQoKTtcbiAgICByZXR1cm4gdGhpcy5zdGFydFRyYW5zaXRpb24oIGNvbnRlbnQsIFRyYW5zaXRpb24ud2lwZVVwKCB0aGlzLnRyYW5zaXRpb25Cb3VuZHNQcm9wZXJ0eS52YWx1ZSwgdGhpcy5mcm9tQ29udGVudCwgY29udGVudCwgY29uZmlnICkgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTdGFydCBhIHRyYW5zaXRpb24gdG8gcmVwbGFjZSBvdXIgY29udGVudCB3aXRoIHRoZSBuZXcgY29udGVudCwgdXNpbmcgVHJhbnNpdGlvbi53aXBlRG93bi5cbiAgICpcbiAgICogQHBhcmFtIGNvbnRlbnQgLSBJZiBudWxsLCB0aGUgY3VycmVudCBjb250ZW50IHdpbGwgc3RpbGwgYW5pbWF0ZSBvdXQgKHdpdGggbm90aGluZyByZXBsYWNpbmcgaXQpLlxuICAgKiBAcGFyYW0gY29uZmlnIC0gUGFzc2VkIGFzIGNvbmZpZyB0byB0aGUgQW5pbWF0aW9uLiBVc3VhbGx5IGEgZHVyYXRpb24gc2hvdWxkIGJlIGluY2x1ZGVkLlxuICAgKiBAcmV0dXJucyAtIEF2YWlsYWJsZSB0byBhZGQgZW5kIGxpc3RlbmVycywgZXRjLlxuICAgKi9cbiAgcHVibGljIHdpcGVEb3duVG8oIGNvbnRlbnQ6IE5vZGUgfCBudWxsLCBjb25maWc/OiBXaXBlVHJhbnNpdGlvbk9wdGlvbnMgKTogVHJhbnNpdGlvbiB7XG4gICAgdGhpcy5pbnRlcnJ1cHQoKTtcbiAgICByZXR1cm4gdGhpcy5zdGFydFRyYW5zaXRpb24oIGNvbnRlbnQsIFRyYW5zaXRpb24ud2lwZURvd24oIHRoaXMudHJhbnNpdGlvbkJvdW5kc1Byb3BlcnR5LnZhbHVlLCB0aGlzLmZyb21Db250ZW50LCBjb250ZW50LCBjb25maWcgKSApO1xuICB9XG5cbiAgLyoqXG4gICAqIFN0YXJ0IGEgdHJhbnNpdGlvbiB0byByZXBsYWNlIG91ciBjb250ZW50IHdpdGggdGhlIG5ldyBjb250ZW50LCB1c2luZyBUcmFuc2l0aW9uLmRpc3NvbHZlLlxuICAgKlxuICAgKiBAcGFyYW0gY29udGVudCAtIElmIG51bGwsIHRoZSBjdXJyZW50IGNvbnRlbnQgd2lsbCBzdGlsbCBhbmltYXRlIG91dCAod2l0aCBub3RoaW5nIHJlcGxhY2luZyBpdCkuXG4gICAqIEBwYXJhbSBjb25maWcgLSBQYXNzZWQgYXMgY29uZmlnIHRvIHRoZSBBbmltYXRpb24uIFVzdWFsbHkgYSBkdXJhdGlvbiBzaG91bGQgYmUgaW5jbHVkZWQuXG4gICAqIEByZXR1cm5zIC0gQXZhaWxhYmxlIHRvIGFkZCBlbmQgbGlzdGVuZXJzLCBldGMuXG4gICAqL1xuICBwdWJsaWMgZGlzc29sdmVUbyggY29udGVudDogTm9kZSB8IG51bGwsIGNvbmZpZz86IERpc3NvbHZlVHJhbnNpdGlvbk9wdGlvbnMgKTogVHJhbnNpdGlvbiB7XG4gICAgdGhpcy5pbnRlcnJ1cHQoKTtcbiAgICByZXR1cm4gdGhpcy5zdGFydFRyYW5zaXRpb24oIGNvbnRlbnQsIFRyYW5zaXRpb24uZGlzc29sdmUoIHRoaXMuZnJvbUNvbnRlbnQsIGNvbnRlbnQsIGNvbmZpZyApICk7XG4gIH1cblxuICAvKipcbiAgICogU3RhcnRzIGEgdHJhbnNpdGlvbiwgYW5kIGhvb2tzIHVwIGEgbGlzdGVuZXIgdG8gaGFuZGxlIHN0YXRlIGNoYW5nZXMgd2hlbiBpdCBlbmRzLlxuICAgKlxuICAgKiBAcmV0dXJucyAtIEF2YWlsYWJsZSB0byBhZGQgZW5kIGxpc3RlbmVycywgZXRjLiAoY2hhaW5lZClcbiAgICovXG4gIHByaXZhdGUgc3RhcnRUcmFuc2l0aW9uKCBjb250ZW50OiBOb2RlIHwgbnVsbCwgdHJhbnNpdGlvbjogVHJhbnNpdGlvbiApOiBUcmFuc2l0aW9uIHtcblxuICAgIC8vIFN0b3AgYW5pbWF0aW5nIGlmIHdlIHdlcmUgYmVmb3JlXG4gICAgdGhpcy5pbnRlcnJ1cHQoKTtcblxuICAgIHRoaXMudG9Db250ZW50ID0gY29udGVudDtcblxuICAgIGlmICggY29udGVudCApIHtcbiAgICAgIGlmICggXy5pbmNsdWRlcyggdGhpcy5jYWNoZWROb2RlcywgY29udGVudCApICkge1xuICAgICAgICBjb250ZW50LnZpc2libGUgPSB0cnVlO1xuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgIHRoaXMuYWRkQ2hpbGQoIGNvbnRlbnQgKTtcbiAgICAgIH1cbiAgICAgIGFzc2VydCAmJiBhc3NlcnQoIHRoaXMuaGFzQ2hpbGQoIGNvbnRlbnQgKSxcbiAgICAgICAgJ1Nob3VsZCBhbHdheXMgaGF2ZSB0aGUgY29udGVudCBhcyBhIGNoaWxkIGF0IHRoZSBzdGFydCBvZiBhIHRyYW5zaXRpb24nICk7XG4gICAgfVxuXG4gICAgdGhpcy50cmFuc2l0aW9uID0gdHJhbnNpdGlvbjtcblxuICAgIC8vIFNpbXBsaWZpZXMgbWFueSB0aGluZ3MgaWYgdGhlIHVzZXIgY2FuJ3QgbWVzcyB3aXRoIHRoaW5ncyB3aGlsZSBhbmltYXRpbmcuXG4gICAgaWYgKCB0aGlzLmZyb21Db250ZW50ICkge1xuICAgICAgdGhpcy5mcm9tQ29udGVudC5waWNrYWJsZSA9IGZhbHNlO1xuICAgIH1cbiAgICBpZiAoIHRoaXMudG9Db250ZW50ICkge1xuICAgICAgdGhpcy50b0NvbnRlbnQucGlja2FibGUgPSBmYWxzZTtcbiAgICB9XG5cbiAgICB0cmFuc2l0aW9uLmVuZGVkRW1pdHRlci5hZGRMaXN0ZW5lciggKCkgPT4ge1xuICAgICAgaWYgKCB0aGlzLmZyb21Db250ZW50ICkge1xuICAgICAgICB0aGlzLmZyb21Db250ZW50LnBpY2thYmxlID0gbnVsbDtcbiAgICAgIH1cbiAgICAgIGlmICggdGhpcy50b0NvbnRlbnQgKSB7XG4gICAgICAgIHRoaXMudG9Db250ZW50LnBpY2thYmxlID0gbnVsbDtcbiAgICAgIH1cblxuICAgICAgdGhpcy50cmFuc2l0aW9uID0gbnVsbDtcblxuICAgICAgaWYgKCB0aGlzLmZyb21Db250ZW50ICkge1xuICAgICAgICBpZiAoIF8uaW5jbHVkZXMoIHRoaXMuY2FjaGVkTm9kZXMsIHRoaXMuZnJvbUNvbnRlbnQgKSApIHtcbiAgICAgICAgICB0aGlzLmZyb21Db250ZW50LnZpc2libGUgPSBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICB0aGlzLnJlbW92ZUNoaWxkKCB0aGlzLmZyb21Db250ZW50ICk7XG4gICAgICAgIH1cbiAgICAgICAgYXNzZXJ0ICYmIGFzc2VydCggdGhpcy5oYXNDaGlsZCggdGhpcy5mcm9tQ29udGVudCApID09PSBfLmluY2x1ZGVzKCB0aGlzLmNhY2hlZE5vZGVzLCB0aGlzLmZyb21Db250ZW50ICksXG4gICAgICAgICAgJ1Nob3VsZCBoYXZlIHJlbW92ZWQgdGhlIGNoaWxkIGlmIGl0IGlzIG5vdCBpbmNsdWRlZCBpbiBvdXIgY2FjaGVkTm9kZXMnICk7XG4gICAgICB9XG5cbiAgICAgIHRoaXMuZnJvbUNvbnRlbnQgPSB0aGlzLnRvQ29udGVudDtcbiAgICAgIHRoaXMudG9Db250ZW50ID0gbnVsbDtcbiAgICB9ICk7XG5cbiAgICB0cmFuc2l0aW9uLnN0YXJ0KCk7XG5cbiAgICByZXR1cm4gdHJhbnNpdGlvbjtcbiAgfVxuXG4gIHB1YmxpYyBvdmVycmlkZSBkaXNwb3NlKCk6IHZvaWQge1xuICAgIHRoaXMuaW50ZXJydXB0KCk7XG4gICAgdGhpcy50cmFuc2l0aW9uQm91bmRzUHJvcGVydHkudW5saW5rKCB0aGlzLmJvdW5kc0xpc3RlbmVyICk7XG4gICAgc3VwZXIuZGlzcG9zZSgpO1xuICB9XG59XG5cbnR3aXh0LnJlZ2lzdGVyKCAnVHJhbnNpdGlvbk5vZGUnLCBUcmFuc2l0aW9uTm9kZSApO1xuZXhwb3J0IGRlZmF1bHQgVHJhbnNpdGlvbk5vZGU7Il0sIm5hbWVzIjpbIlNoYXBlIiwib3B0aW9uaXplIiwiTm9kZSIsIlRyYW5zaXRpb24iLCJ0d2l4dCIsIlRyYW5zaXRpb25Ob2RlIiwic3RlcCIsImR0IiwidHJhbnNpdGlvbiIsImludGVycnVwdCIsInN0b3AiLCJvbkJvdW5kc0NoYW5nZSIsImJvdW5kcyIsInVzZUJvdW5kc0NsaXAiLCJjbGlwQXJlYSIsInBhZGRpbmdOb2RlIiwibG9jYWxCb3VuZHMiLCJzbGlkZUxlZnRUbyIsImNvbnRlbnQiLCJjb25maWciLCJzdGFydFRyYW5zaXRpb24iLCJzbGlkZUxlZnQiLCJ0cmFuc2l0aW9uQm91bmRzUHJvcGVydHkiLCJ2YWx1ZSIsImZyb21Db250ZW50Iiwic2xpZGVSaWdodFRvIiwic2xpZGVSaWdodCIsInNsaWRlVXBUbyIsInNsaWRlVXAiLCJzbGlkZURvd25UbyIsInNsaWRlRG93biIsIndpcGVMZWZ0VG8iLCJ3aXBlTGVmdCIsIndpcGVSaWdodFRvIiwid2lwZVJpZ2h0Iiwid2lwZVVwVG8iLCJ3aXBlVXAiLCJ3aXBlRG93blRvIiwid2lwZURvd24iLCJkaXNzb2x2ZVRvIiwiZGlzc29sdmUiLCJ0b0NvbnRlbnQiLCJfIiwiaW5jbHVkZXMiLCJjYWNoZWROb2RlcyIsInZpc2libGUiLCJhZGRDaGlsZCIsImFzc2VydCIsImhhc0NoaWxkIiwicGlja2FibGUiLCJlbmRlZEVtaXR0ZXIiLCJhZGRMaXN0ZW5lciIsInJlbW92ZUNoaWxkIiwic3RhcnQiLCJkaXNwb3NlIiwidW5saW5rIiwiYm91bmRzTGlzdGVuZXIiLCJwcm92aWRlZE9wdGlvbnMiLCJvcHRpb25zIiwiY2hpbGRyZW4iLCJpIiwibGVuZ3RoIiwiY2FjaGVkTm9kZSIsImJpbmQiLCJsaW5rIiwibXV0YXRlIiwicmVnaXN0ZXIiXSwibWFwcGlu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