// Copyright 2018-2024, University of Colorado Boulder
/**
 * simple model of a ball
 *
 * @author John Blanco (PhET Interactive Simulations)
 */ import Emitter from '../../../../../axon/js/Emitter.js';
import Vector2Property from '../../../../../dot/js/Vector2Property.js';
import tambo from '../../../tambo.js';
let Ball = class Ball {
    /**
   * restore initial state
   */ reset() {
        this.positionProperty.reset();
        this.velocityProperty.reset();
    }
    constructor(radius, color, initialPosition, initialVelocity){
        this.radius = radius;
        this.color = color;
        this.positionProperty = new Vector2Property(initialPosition);
        this.velocityProperty = new Vector2Property(initialVelocity);
        this.bounceEmitter = new Emitter({
            parameters: [
                {
                    valueType: 'string'
                }
            ]
        });
        // monitor the velocity Property and fire the emitter when a bounce occurs
        this.velocityProperty.lazyLink((newVelocity, oldVelocity)=>{
            // check for wall bounce
            if (oldVelocity.x > 0 && newVelocity.x < 0) {
                this.bounceEmitter.emit('right-wall');
            } else if (oldVelocity.x < 0 && newVelocity.x > 0) {
                this.bounceEmitter.emit('left-wall');
            }
            // check for floor and ceiling bounce
            if (oldVelocity.y > 0 && newVelocity.y < 0) {
                this.bounceEmitter.emit('ceiling');
            } else if (oldVelocity.y < 0 && newVelocity.y > 0) {
                this.bounceEmitter.emit('floor');
            }
        });
    }
};
tambo.register('Ball', Ball);
export default Ball;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3RhbWJvL2pzL2RlbW8vc2ltLWxpa2UtY29tcG9uZW50cy9tb2RlbC9CYWxsLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE4LTIwMjQsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIHNpbXBsZSBtb2RlbCBvZiBhIGJhbGxcbiAqXG4gKiBAYXV0aG9yIEpvaG4gQmxhbmNvIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxuICovXG5cbmltcG9ydCBFbWl0dGVyIGZyb20gJy4uLy4uLy4uLy4uLy4uL2F4b24vanMvRW1pdHRlci5qcyc7XG5pbXBvcnQgVEVtaXR0ZXIgZnJvbSAnLi4vLi4vLi4vLi4vLi4vYXhvbi9qcy9URW1pdHRlci5qcyc7XG5pbXBvcnQgVmVjdG9yMiBmcm9tICcuLi8uLi8uLi8uLi8uLi9kb3QvanMvVmVjdG9yMi5qcyc7XG5pbXBvcnQgVmVjdG9yMlByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uLy4uL2RvdC9qcy9WZWN0b3IyUHJvcGVydHkuanMnO1xuaW1wb3J0IHsgQ29sb3IgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xuaW1wb3J0IHRhbWJvIGZyb20gJy4uLy4uLy4uL3RhbWJvLmpzJztcblxuY2xhc3MgQmFsbCB7XG4gIHB1YmxpYyByZWFkb25seSByYWRpdXM6IG51bWJlcjtcbiAgcHVibGljIHJlYWRvbmx5IGNvbG9yOiBDb2xvcjtcbiAgcHVibGljIHJlYWRvbmx5IHBvc2l0aW9uUHJvcGVydHk6IFZlY3RvcjJQcm9wZXJ0eTtcbiAgcHVibGljIHJlYWRvbmx5IHZlbG9jaXR5UHJvcGVydHk6IFZlY3RvcjJQcm9wZXJ0eTtcbiAgcHVibGljIHJlYWRvbmx5IGJvdW5jZUVtaXR0ZXI6IFRFbWl0dGVyPFsgc3RyaW5nIF0+O1xuXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggcmFkaXVzOiBudW1iZXIsIGNvbG9yOiBDb2xvciwgaW5pdGlhbFBvc2l0aW9uOiBWZWN0b3IyLCBpbml0aWFsVmVsb2NpdHk6IFZlY3RvcjIgKSB7XG5cbiAgICB0aGlzLnJhZGl1cyA9IHJhZGl1cztcbiAgICB0aGlzLmNvbG9yID0gY29sb3I7XG4gICAgdGhpcy5wb3NpdGlvblByb3BlcnR5ID0gbmV3IFZlY3RvcjJQcm9wZXJ0eSggaW5pdGlhbFBvc2l0aW9uICk7XG4gICAgdGhpcy52ZWxvY2l0eVByb3BlcnR5ID0gbmV3IFZlY3RvcjJQcm9wZXJ0eSggaW5pdGlhbFZlbG9jaXR5ICk7XG4gICAgdGhpcy5ib3VuY2VFbWl0dGVyID0gbmV3IEVtaXR0ZXIoIHsgcGFyYW1ldGVyczogWyB7IHZhbHVlVHlwZTogJ3N0cmluZycgfSBdIH0gKTtcblxuICAgIC8vIG1vbml0b3IgdGhlIHZlbG9jaXR5IFByb3BlcnR5IGFuZCBmaXJlIHRoZSBlbWl0dGVyIHdoZW4gYSBib3VuY2Ugb2NjdXJzXG4gICAgdGhpcy52ZWxvY2l0eVByb3BlcnR5LmxhenlMaW5rKCAoIG5ld1ZlbG9jaXR5LCBvbGRWZWxvY2l0eSApID0+IHtcblxuICAgICAgLy8gY2hlY2sgZm9yIHdhbGwgYm91bmNlXG4gICAgICBpZiAoIG9sZFZlbG9jaXR5LnggPiAwICYmIG5ld1ZlbG9jaXR5LnggPCAwICkge1xuICAgICAgICB0aGlzLmJvdW5jZUVtaXR0ZXIuZW1pdCggJ3JpZ2h0LXdhbGwnICk7XG4gICAgICB9XG4gICAgICBlbHNlIGlmICggb2xkVmVsb2NpdHkueCA8IDAgJiYgbmV3VmVsb2NpdHkueCA+IDAgKSB7XG4gICAgICAgIHRoaXMuYm91bmNlRW1pdHRlci5lbWl0KCAnbGVmdC13YWxsJyApO1xuICAgICAgfVxuXG4gICAgICAvLyBjaGVjayBmb3IgZmxvb3IgYW5kIGNlaWxpbmcgYm91bmNlXG4gICAgICBpZiAoIG9sZFZlbG9jaXR5LnkgPiAwICYmIG5ld1ZlbG9jaXR5LnkgPCAwICkge1xuICAgICAgICB0aGlzLmJvdW5jZUVtaXR0ZXIuZW1pdCggJ2NlaWxpbmcnICk7XG4gICAgICB9XG4gICAgICBlbHNlIGlmICggb2xkVmVsb2NpdHkueSA8IDAgJiYgbmV3VmVsb2NpdHkueSA+IDAgKSB7XG4gICAgICAgIHRoaXMuYm91bmNlRW1pdHRlci5lbWl0KCAnZmxvb3InICk7XG4gICAgICB9XG4gICAgfSApO1xuICB9XG5cbiAgLyoqXG4gICAqIHJlc3RvcmUgaW5pdGlhbCBzdGF0ZVxuICAgKi9cbiAgcHVibGljIHJlc2V0KCk6IHZvaWQge1xuICAgIHRoaXMucG9zaXRpb25Qcm9wZXJ0eS5yZXNldCgpO1xuICAgIHRoaXMudmVsb2NpdHlQcm9wZXJ0eS5yZXNldCgpO1xuICB9XG59XG5cbnRhbWJvLnJlZ2lzdGVyKCAnQmFsbCcsIEJhbGwgKTtcblxuZXhwb3J0IGRlZmF1bHQgQmFsbDsiXSwibmFtZXMiOlsiRW1pdHRlciIsIlZlY3RvcjJQcm9wZXJ0eSIsInRhbWJvIiwiQmFsbCIsInJlc2V0IiwicG9zaXRpb25Qcm9wZXJ0eSIsInZlbG9jaXR5UHJvcGVydHkiLCJyYWRpdXMiLCJjb2xvciIsImluaXRpYWxQb3NpdGlvbiIsImluaXRpYWxWZWxvY2l0eSIsImJvdW5jZUVtaXR0ZXIiLCJwYXJhbWV0ZXJzIiwidmFsdWVUeXBlIiwibGF6eUxpbmsiLCJuZXdWZWxvY2l0eSIsIm9sZFZlbG9jaXR5IiwieCIsImVtaXQiLCJ5IiwicmVnaXN0ZXIiXSwibWFwcGluZ3MiOiJBQUFBLHNEQUFzRDtBQUV0RDs7OztDQUlDLEdBRUQsT0FBT0EsYUFBYSxvQ0FBb0M7QUFHeEQsT0FBT0MscUJBQXFCLDJDQUEyQztBQUV2RSxPQUFPQyxXQUFXLG9CQUFvQjtBQUV0QyxJQUFBLEFBQU1DLE9BQU4sTUFBTUE7SUFvQ0o7O0dBRUMsR0FDRCxBQUFPQyxRQUFjO1FBQ25CLElBQUksQ0FBQ0MsZ0JBQWdCLENBQUNELEtBQUs7UUFDM0IsSUFBSSxDQUFDRSxnQkFBZ0IsQ0FBQ0YsS0FBSztJQUM3QjtJQW5DQSxZQUFvQkcsTUFBYyxFQUFFQyxLQUFZLEVBQUVDLGVBQXdCLEVBQUVDLGVBQXdCLENBQUc7UUFFckcsSUFBSSxDQUFDSCxNQUFNLEdBQUdBO1FBQ2QsSUFBSSxDQUFDQyxLQUFLLEdBQUdBO1FBQ2IsSUFBSSxDQUFDSCxnQkFBZ0IsR0FBRyxJQUFJSixnQkFBaUJRO1FBQzdDLElBQUksQ0FBQ0gsZ0JBQWdCLEdBQUcsSUFBSUwsZ0JBQWlCUztRQUM3QyxJQUFJLENBQUNDLGFBQWEsR0FBRyxJQUFJWCxRQUFTO1lBQUVZLFlBQVk7Z0JBQUU7b0JBQUVDLFdBQVc7Z0JBQVM7YUFBRztRQUFDO1FBRTVFLDBFQUEwRTtRQUMxRSxJQUFJLENBQUNQLGdCQUFnQixDQUFDUSxRQUFRLENBQUUsQ0FBRUMsYUFBYUM7WUFFN0Msd0JBQXdCO1lBQ3hCLElBQUtBLFlBQVlDLENBQUMsR0FBRyxLQUFLRixZQUFZRSxDQUFDLEdBQUcsR0FBSTtnQkFDNUMsSUFBSSxDQUFDTixhQUFhLENBQUNPLElBQUksQ0FBRTtZQUMzQixPQUNLLElBQUtGLFlBQVlDLENBQUMsR0FBRyxLQUFLRixZQUFZRSxDQUFDLEdBQUcsR0FBSTtnQkFDakQsSUFBSSxDQUFDTixhQUFhLENBQUNPLElBQUksQ0FBRTtZQUMzQjtZQUVBLHFDQUFxQztZQUNyQyxJQUFLRixZQUFZRyxDQUFDLEdBQUcsS0FBS0osWUFBWUksQ0FBQyxHQUFHLEdBQUk7Z0JBQzVDLElBQUksQ0FBQ1IsYUFBYSxDQUFDTyxJQUFJLENBQUU7WUFDM0IsT0FDSyxJQUFLRixZQUFZRyxDQUFDLEdBQUcsS0FBS0osWUFBWUksQ0FBQyxHQUFHLEdBQUk7Z0JBQ2pELElBQUksQ0FBQ1IsYUFBYSxDQUFDTyxJQUFJLENBQUU7WUFDM0I7UUFDRjtJQUNGO0FBU0Y7QUFFQWhCLE1BQU1rQixRQUFRLENBQUUsUUFBUWpCO0FBRXhCLGVBQWVBLEtBQUsifQ==