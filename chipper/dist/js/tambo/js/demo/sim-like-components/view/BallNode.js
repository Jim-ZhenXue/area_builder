// Copyright 2018-2024, University of Colorado Boulder
/**
 * a Scenery node that represents a ball in the view
 *
 * @author John Blanco (PhET Interactive Simulations)
 */ import { Circle } from '../../../../../scenery/js/imports.js';
import boundaryReached_mp3 from '../../../../sounds/boundaryReached_mp3.js';
import ceilingFloorContact_mp3 from '../../../../sounds/ceilingFloorContact_mp3.js';
import wallContact_mp3 from '../../../../sounds/wallContact_mp3.js';
import SoundClip from '../../../sound-generators/SoundClip.js';
import soundManager from '../../../soundManager.js';
import tambo from '../../../tambo.js';
// constants
const BALL_BOUNCE_OUTPUT_LEVEL = 0.3;
let BallNode = class BallNode extends Circle {
    /**
   * Clean up memory references to avoid leaks.
   */ dispose() {
        this.disposeBallNode();
        super.dispose();
    }
    constructor(ball, modelViewTransform){
        // Create a circle node to represent the ball.
        const radius = modelViewTransform.modelToViewDeltaX(ball.radius);
        super(radius, {
            fill: ball.color,
            stroke: 'gray'
        });
        // Move this node as the model position changes.
        const updatePosition = (position)=>{
            this.center = modelViewTransform.modelToViewPosition(position);
        };
        ball.positionProperty.link(updatePosition);
        // Create the sound clips used when the balls hit the ceiling or the wall.
        this.wallContactSoundClips = [
            new SoundClip(wallContact_mp3, {
                initialOutputLevel: BALL_BOUNCE_OUTPUT_LEVEL
            }),
            new SoundClip(boundaryReached_mp3, {
                initialOutputLevel: BALL_BOUNCE_OUTPUT_LEVEL
            }),
            new SoundClip(ceilingFloorContact_mp3, {
                initialOutputLevel: BALL_BOUNCE_OUTPUT_LEVEL
            })
        ];
        this.ceilingFloorContactSoundClip = new SoundClip(ceilingFloorContact_mp3, {
            initialOutputLevel: BALL_BOUNCE_OUTPUT_LEVEL
        });
        // Add the sound generators.
        this.wallContactSoundClips.forEach((clip)=>{
            soundManager.addSoundGenerator(clip);
        });
        soundManager.addSoundGenerator(this.ceilingFloorContactSoundClip);
        // Play bounce sounds when the ball bounces on the wall or ceiling.
        const bounceListener = (bounceSurface)=>{
            if (bounceSurface === 'left-wall' || bounceSurface === 'right-wall') {
                // play the sound that was selected via the preferences control
                this.wallContactSoundClips[phet.tambo.soundIndexForWallBounceProperty.value].play();
            } else if (bounceSurface === 'floor' || bounceSurface === 'ceiling') {
                this.ceilingFloorContactSoundClip.play();
            }
        };
        ball.bounceEmitter.addListener(bounceListener);
        this.disposeBallNode = ()=>{
            ball.positionProperty.unlink(updatePosition);
            ball.bounceEmitter.removeListener(bounceListener);
            this.wallContactSoundClips.forEach((clip)=>{
                clip.stop();
                soundManager.removeSoundGenerator(clip);
            });
            this.ceilingFloorContactSoundClip.stop();
            soundManager.removeSoundGenerator(this.ceilingFloorContactSoundClip);
        };
    }
};
tambo.register('BallNode', BallNode);
export default BallNode;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3RhbWJvL2pzL2RlbW8vc2ltLWxpa2UtY29tcG9uZW50cy92aWV3L0JhbGxOb2RlLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE4LTIwMjQsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIGEgU2NlbmVyeSBub2RlIHRoYXQgcmVwcmVzZW50cyBhIGJhbGwgaW4gdGhlIHZpZXdcbiAqXG4gKiBAYXV0aG9yIEpvaG4gQmxhbmNvIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxuICovXG5cbmltcG9ydCBWZWN0b3IyIGZyb20gJy4uLy4uLy4uLy4uLy4uL2RvdC9qcy9WZWN0b3IyLmpzJztcbmltcG9ydCBNb2RlbFZpZXdUcmFuc2Zvcm0yIGZyb20gJy4uLy4uLy4uLy4uLy4uL3BoZXRjb21tb24vanMvdmlldy9Nb2RlbFZpZXdUcmFuc2Zvcm0yLmpzJztcbmltcG9ydCB7IENpcmNsZSB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XG5pbXBvcnQgYm91bmRhcnlSZWFjaGVkX21wMyBmcm9tICcuLi8uLi8uLi8uLi9zb3VuZHMvYm91bmRhcnlSZWFjaGVkX21wMy5qcyc7XG5pbXBvcnQgY2VpbGluZ0Zsb29yQ29udGFjdF9tcDMgZnJvbSAnLi4vLi4vLi4vLi4vc291bmRzL2NlaWxpbmdGbG9vckNvbnRhY3RfbXAzLmpzJztcbmltcG9ydCB3YWxsQ29udGFjdF9tcDMgZnJvbSAnLi4vLi4vLi4vLi4vc291bmRzL3dhbGxDb250YWN0X21wMy5qcyc7XG5pbXBvcnQgU291bmRDbGlwIGZyb20gJy4uLy4uLy4uL3NvdW5kLWdlbmVyYXRvcnMvU291bmRDbGlwLmpzJztcbmltcG9ydCBzb3VuZE1hbmFnZXIgZnJvbSAnLi4vLi4vLi4vc291bmRNYW5hZ2VyLmpzJztcbmltcG9ydCB0YW1ibyBmcm9tICcuLi8uLi8uLi90YW1iby5qcyc7XG5pbXBvcnQgQmFsbCBmcm9tICcuLi9tb2RlbC9CYWxsLmpzJztcblxuLy8gY29uc3RhbnRzXG5jb25zdCBCQUxMX0JPVU5DRV9PVVRQVVRfTEVWRUwgPSAwLjM7XG5cbmNsYXNzIEJhbGxOb2RlIGV4dGVuZHMgQ2lyY2xlIHtcblxuICAvLyBzb3VuZHMgZm9yIHdhbGwgY29udGFjdFxuICBwcml2YXRlIHJlYWRvbmx5IHdhbGxDb250YWN0U291bmRDbGlwczogU291bmRDbGlwW107XG5cbiAgLy8gc291bmQgZm9yIGNlaWxpbmcgY29udGFjdFxuICBwcml2YXRlIHJlYWRvbmx5IGNlaWxpbmdGbG9vckNvbnRhY3RTb3VuZENsaXA6IFNvdW5kQ2xpcDtcblxuICAvLyBkaXNwb3NlXG4gIHByaXZhdGUgcmVhZG9ubHkgZGlzcG9zZUJhbGxOb2RlOiAoKSA9PiB2b2lkO1xuXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggYmFsbDogQmFsbCwgbW9kZWxWaWV3VHJhbnNmb3JtOiBNb2RlbFZpZXdUcmFuc2Zvcm0yICkge1xuXG4gICAgLy8gQ3JlYXRlIGEgY2lyY2xlIG5vZGUgdG8gcmVwcmVzZW50IHRoZSBiYWxsLlxuICAgIGNvbnN0IHJhZGl1cyA9IG1vZGVsVmlld1RyYW5zZm9ybS5tb2RlbFRvVmlld0RlbHRhWCggYmFsbC5yYWRpdXMgKTtcbiAgICBzdXBlciggcmFkaXVzLCB7IGZpbGw6IGJhbGwuY29sb3IsIHN0cm9rZTogJ2dyYXknIH0gKTtcblxuICAgIC8vIE1vdmUgdGhpcyBub2RlIGFzIHRoZSBtb2RlbCBwb3NpdGlvbiBjaGFuZ2VzLlxuICAgIGNvbnN0IHVwZGF0ZVBvc2l0aW9uID0gKCBwb3NpdGlvbjogVmVjdG9yMiApID0+IHtcbiAgICAgIHRoaXMuY2VudGVyID0gbW9kZWxWaWV3VHJhbnNmb3JtLm1vZGVsVG9WaWV3UG9zaXRpb24oIHBvc2l0aW9uICk7XG4gICAgfTtcbiAgICBiYWxsLnBvc2l0aW9uUHJvcGVydHkubGluayggdXBkYXRlUG9zaXRpb24gKTtcblxuICAgIC8vIENyZWF0ZSB0aGUgc291bmQgY2xpcHMgdXNlZCB3aGVuIHRoZSBiYWxscyBoaXQgdGhlIGNlaWxpbmcgb3IgdGhlIHdhbGwuXG4gICAgdGhpcy53YWxsQ29udGFjdFNvdW5kQ2xpcHMgPSBbXG4gICAgICBuZXcgU291bmRDbGlwKCB3YWxsQ29udGFjdF9tcDMsIHsgaW5pdGlhbE91dHB1dExldmVsOiBCQUxMX0JPVU5DRV9PVVRQVVRfTEVWRUwgfSApLFxuICAgICAgbmV3IFNvdW5kQ2xpcCggYm91bmRhcnlSZWFjaGVkX21wMywgeyBpbml0aWFsT3V0cHV0TGV2ZWw6IEJBTExfQk9VTkNFX09VVFBVVF9MRVZFTCB9ICksXG4gICAgICBuZXcgU291bmRDbGlwKCBjZWlsaW5nRmxvb3JDb250YWN0X21wMywgeyBpbml0aWFsT3V0cHV0TGV2ZWw6IEJBTExfQk9VTkNFX09VVFBVVF9MRVZFTCB9IClcbiAgICBdO1xuICAgIHRoaXMuY2VpbGluZ0Zsb29yQ29udGFjdFNvdW5kQ2xpcCA9IG5ldyBTb3VuZENsaXAoIGNlaWxpbmdGbG9vckNvbnRhY3RfbXAzLCB7XG4gICAgICBpbml0aWFsT3V0cHV0TGV2ZWw6IEJBTExfQk9VTkNFX09VVFBVVF9MRVZFTFxuICAgIH0gKTtcblxuICAgIC8vIEFkZCB0aGUgc291bmQgZ2VuZXJhdG9ycy5cbiAgICB0aGlzLndhbGxDb250YWN0U291bmRDbGlwcy5mb3JFYWNoKCBjbGlwID0+IHtcbiAgICAgIHNvdW5kTWFuYWdlci5hZGRTb3VuZEdlbmVyYXRvciggY2xpcCApO1xuICAgIH0gKTtcbiAgICBzb3VuZE1hbmFnZXIuYWRkU291bmRHZW5lcmF0b3IoIHRoaXMuY2VpbGluZ0Zsb29yQ29udGFjdFNvdW5kQ2xpcCApO1xuXG4gICAgLy8gUGxheSBib3VuY2Ugc291bmRzIHdoZW4gdGhlIGJhbGwgYm91bmNlcyBvbiB0aGUgd2FsbCBvciBjZWlsaW5nLlxuICAgIGNvbnN0IGJvdW5jZUxpc3RlbmVyID0gKCBib3VuY2VTdXJmYWNlOiBzdHJpbmcgKSA9PiB7XG4gICAgICBpZiAoIGJvdW5jZVN1cmZhY2UgPT09ICdsZWZ0LXdhbGwnIHx8IGJvdW5jZVN1cmZhY2UgPT09ICdyaWdodC13YWxsJyApIHtcblxuICAgICAgICAvLyBwbGF5IHRoZSBzb3VuZCB0aGF0IHdhcyBzZWxlY3RlZCB2aWEgdGhlIHByZWZlcmVuY2VzIGNvbnRyb2xcbiAgICAgICAgdGhpcy53YWxsQ29udGFjdFNvdW5kQ2xpcHNbIHBoZXQudGFtYm8uc291bmRJbmRleEZvcldhbGxCb3VuY2VQcm9wZXJ0eS52YWx1ZSBdLnBsYXkoKTtcbiAgICAgIH1cbiAgICAgIGVsc2UgaWYgKCBib3VuY2VTdXJmYWNlID09PSAnZmxvb3InIHx8IGJvdW5jZVN1cmZhY2UgPT09ICdjZWlsaW5nJyApIHtcbiAgICAgICAgdGhpcy5jZWlsaW5nRmxvb3JDb250YWN0U291bmRDbGlwLnBsYXkoKTtcbiAgICAgIH1cbiAgICB9O1xuICAgIGJhbGwuYm91bmNlRW1pdHRlci5hZGRMaXN0ZW5lciggYm91bmNlTGlzdGVuZXIgKTtcblxuICAgIHRoaXMuZGlzcG9zZUJhbGxOb2RlID0gKCkgPT4ge1xuICAgICAgYmFsbC5wb3NpdGlvblByb3BlcnR5LnVubGluayggdXBkYXRlUG9zaXRpb24gKTtcbiAgICAgIGJhbGwuYm91bmNlRW1pdHRlci5yZW1vdmVMaXN0ZW5lciggYm91bmNlTGlzdGVuZXIgKTtcbiAgICAgIHRoaXMud2FsbENvbnRhY3RTb3VuZENsaXBzLmZvckVhY2goIGNsaXAgPT4ge1xuICAgICAgICBjbGlwLnN0b3AoKTtcbiAgICAgICAgc291bmRNYW5hZ2VyLnJlbW92ZVNvdW5kR2VuZXJhdG9yKCBjbGlwICk7XG4gICAgICB9ICk7XG4gICAgICB0aGlzLmNlaWxpbmdGbG9vckNvbnRhY3RTb3VuZENsaXAuc3RvcCgpO1xuICAgICAgc291bmRNYW5hZ2VyLnJlbW92ZVNvdW5kR2VuZXJhdG9yKCB0aGlzLmNlaWxpbmdGbG9vckNvbnRhY3RTb3VuZENsaXAgKTtcbiAgICB9O1xuICB9XG5cbiAgLyoqXG4gICAqIENsZWFuIHVwIG1lbW9yeSByZWZlcmVuY2VzIHRvIGF2b2lkIGxlYWtzLlxuICAgKi9cbiAgcHVibGljIG92ZXJyaWRlIGRpc3Bvc2UoKTogdm9pZCB7XG4gICAgdGhpcy5kaXNwb3NlQmFsbE5vZGUoKTtcbiAgICBzdXBlci5kaXNwb3NlKCk7XG4gIH1cbn1cblxudGFtYm8ucmVnaXN0ZXIoICdCYWxsTm9kZScsIEJhbGxOb2RlICk7XG5cbmV4cG9ydCBkZWZhdWx0IEJhbGxOb2RlOyJdLCJuYW1lcyI6WyJDaXJjbGUiLCJib3VuZGFyeVJlYWNoZWRfbXAzIiwiY2VpbGluZ0Zsb29yQ29udGFjdF9tcDMiLCJ3YWxsQ29udGFjdF9tcDMiLCJTb3VuZENsaXAiLCJzb3VuZE1hbmFnZXIiLCJ0YW1ibyIsIkJBTExfQk9VTkNFX09VVFBVVF9MRVZFTCIsIkJhbGxOb2RlIiwiZGlzcG9zZSIsImRpc3Bvc2VCYWxsTm9kZSIsImJhbGwiLCJtb2RlbFZpZXdUcmFuc2Zvcm0iLCJyYWRpdXMiLCJtb2RlbFRvVmlld0RlbHRhWCIsImZpbGwiLCJjb2xvciIsInN0cm9rZSIsInVwZGF0ZVBvc2l0aW9uIiwicG9zaXRpb24iLCJjZW50ZXIiLCJtb2RlbFRvVmlld1Bvc2l0aW9uIiwicG9zaXRpb25Qcm9wZXJ0eSIsImxpbmsiLCJ3YWxsQ29udGFjdFNvdW5kQ2xpcHMiLCJpbml0aWFsT3V0cHV0TGV2ZWwiLCJjZWlsaW5nRmxvb3JDb250YWN0U291bmRDbGlwIiwiZm9yRWFjaCIsImNsaXAiLCJhZGRTb3VuZEdlbmVyYXRvciIsImJvdW5jZUxpc3RlbmVyIiwiYm91bmNlU3VyZmFjZSIsInBoZXQiLCJzb3VuZEluZGV4Rm9yV2FsbEJvdW5jZVByb3BlcnR5IiwidmFsdWUiLCJwbGF5IiwiYm91bmNlRW1pdHRlciIsImFkZExpc3RlbmVyIiwidW5saW5rIiwicmVtb3ZlTGlzdGVuZXIiLCJzdG9wIiwicmVtb3ZlU291bmRHZW5lcmF0b3IiLCJyZWdpc3RlciJdLCJtYXBwaW5ncyI6IkFBQUEs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