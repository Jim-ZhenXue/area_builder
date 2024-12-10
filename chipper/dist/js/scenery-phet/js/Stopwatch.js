// Copyright 2019-2024, University of Colorado Boulder
/**
 * Stopwatch is the model for the stopwatch. It is responsible for time, position, and visibility.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */ import BooleanProperty from '../../axon/js/BooleanProperty.js';
import NumberProperty from '../../axon/js/NumberProperty.js';
import Range from '../../dot/js/Range.js';
import Vector2 from '../../dot/js/Vector2.js';
import Vector2Property from '../../dot/js/Vector2Property.js';
import optionize, { combineOptions } from '../../phet-core/js/optionize.js';
import isSettingPhetioStateProperty from '../../tandem/js/isSettingPhetioStateProperty.js';
import PhetioObject from '../../tandem/js/PhetioObject.js';
import Tandem from '../../tandem/js/Tandem.js';
import IOType from '../../tandem/js/types/IOType.js';
import ReferenceIO from '../../tandem/js/types/ReferenceIO.js';
import sceneryPhet from './sceneryPhet.js';
const DEFAULT_TIME_RANGE = new Range(0, Number.POSITIVE_INFINITY);
let Stopwatch = class Stopwatch extends PhetioObject {
    dispose() {
        this.disposeStopwatch();
        super.dispose();
    }
    reset() {
        this.positionProperty.reset();
        this.isVisibleProperty.reset();
        this.isRunningProperty.reset();
        this.timeProperty.reset();
    }
    /**
   * Steps the stopwatch.
   * @param dt - time delta, in units as specified by the client
   */ step(dt) {
        assert && assert(dt > 0, `invalid dt: ${dt}`);
        this.setTime(this.timeProperty.value + dt);
    }
    /**
   * Similar to step() but sets the time to a specific value.
   * @param t
   */ setTime(t) {
        assert && assert(t >= 0, `invalid t: ${t}`);
        if (this.isRunningProperty.value) {
            // Increment time, but don't exceed the range.
            this.timeProperty.value = this.timeProperty.range.constrainValue(t);
            // If the max is reached, then pause.
            if (this.timeProperty.value >= this.timeProperty.range.max) {
                this.isRunningProperty.value = false;
            }
        }
    }
    constructor(providedOptions){
        const options = optionize()({
            // SelfOptions
            position: Vector2.ZERO,
            isVisible: false,
            timePropertyOptions: {
                range: DEFAULT_TIME_RANGE,
                units: 's',
                isValidValue: (value)=>value >= 0,
                phetioReadOnly: true,
                phetioHighFrequency: true
            },
            // PhetioObjectOptions
            tandem: Tandem.REQUIRED,
            tandemNameSuffix: 'Stopwatch',
            phetioType: ReferenceIO(IOType.ObjectIO),
            phetioState: false
        }, providedOptions);
        super(options);
        this.positionProperty = new Vector2Property(options.position, {
            tandem: options.tandem.createTandem('positionProperty'),
            phetioDocumentation: `view coordinates for the upper-left of the stopwatch (initially ${options.position.x},${options.position.y})`,
            phetioFeatured: true
        });
        this.isVisibleProperty = new BooleanProperty(options.isVisible, {
            tandem: options.tandem.createTandem('isVisibleProperty'),
            phetioFeatured: true
        });
        this.isRunningProperty = new BooleanProperty(false, {
            tandem: options.tandem.createTandem('isRunningProperty'),
            phetioFeatured: true
        });
        this.timeProperty = new NumberProperty(0, combineOptions({
            tandem: options.tandem.createTandem('timeProperty'),
            phetioFeatured: true
        }, options.timePropertyOptions));
        // When the stopwatch visibility changes, stop it and reset its value.
        const visibilityListener = ()=>{
            if (!isSettingPhetioStateProperty.value) {
                this.isRunningProperty.value = false;
                this.timeProperty.value = 0;
            }
        };
        this.isVisibleProperty.link(visibilityListener);
        this.disposeStopwatch = ()=>{
            this.isVisibleProperty.unlink(visibilityListener);
            this.positionProperty.dispose();
            this.isVisibleProperty.dispose();
            this.isRunningProperty.dispose();
            this.timeProperty.dispose();
        };
    }
};
Stopwatch.ZERO_TO_ALMOST_SIXTY = new Range(0, 3599.99) // works out to be 59:59.99
;
export { Stopwatch as default };
sceneryPhet.register('Stopwatch', Stopwatch);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9TdG9wd2F0Y2gudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTktMjAyNCwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbi8qKlxuICogU3RvcHdhdGNoIGlzIHRoZSBtb2RlbCBmb3IgdGhlIHN0b3B3YXRjaC4gSXQgaXMgcmVzcG9uc2libGUgZm9yIHRpbWUsIHBvc2l0aW9uLCBhbmQgdmlzaWJpbGl0eS5cbiAqXG4gKiBAYXV0aG9yIENocmlzIE1hbGxleSAoUGl4ZWxab29tLCBJbmMuKVxuICovXG5cbmltcG9ydCBCb29sZWFuUHJvcGVydHkgZnJvbSAnLi4vLi4vYXhvbi9qcy9Cb29sZWFuUHJvcGVydHkuanMnO1xuaW1wb3J0IE51bWJlclByb3BlcnR5LCB7IE51bWJlclByb3BlcnR5T3B0aW9ucyB9IGZyb20gJy4uLy4uL2F4b24vanMvTnVtYmVyUHJvcGVydHkuanMnO1xuaW1wb3J0IFByb3BlcnR5IGZyb20gJy4uLy4uL2F4b24vanMvUHJvcGVydHkuanMnO1xuaW1wb3J0IFJhbmdlIGZyb20gJy4uLy4uL2RvdC9qcy9SYW5nZS5qcyc7XG5pbXBvcnQgVmVjdG9yMiBmcm9tICcuLi8uLi9kb3QvanMvVmVjdG9yMi5qcyc7XG5pbXBvcnQgVmVjdG9yMlByb3BlcnR5IGZyb20gJy4uLy4uL2RvdC9qcy9WZWN0b3IyUHJvcGVydHkuanMnO1xuaW1wb3J0IG9wdGlvbml6ZSwgeyBjb21iaW5lT3B0aW9ucyB9IGZyb20gJy4uLy4uL3BoZXQtY29yZS9qcy9vcHRpb25pemUuanMnO1xuaW1wb3J0IFN0cmljdE9taXQgZnJvbSAnLi4vLi4vcGhldC1jb3JlL2pzL3R5cGVzL1N0cmljdE9taXQuanMnO1xuaW1wb3J0IGlzU2V0dGluZ1BoZXRpb1N0YXRlUHJvcGVydHkgZnJvbSAnLi4vLi4vdGFuZGVtL2pzL2lzU2V0dGluZ1BoZXRpb1N0YXRlUHJvcGVydHkuanMnO1xuaW1wb3J0IFBoZXRpb09iamVjdCwgeyBQaGV0aW9PYmplY3RPcHRpb25zIH0gZnJvbSAnLi4vLi4vdGFuZGVtL2pzL1BoZXRpb09iamVjdC5qcyc7XG5pbXBvcnQgVGFuZGVtIGZyb20gJy4uLy4uL3RhbmRlbS9qcy9UYW5kZW0uanMnO1xuaW1wb3J0IElPVHlwZSBmcm9tICcuLi8uLi90YW5kZW0vanMvdHlwZXMvSU9UeXBlLmpzJztcbmltcG9ydCBSZWZlcmVuY2VJTyBmcm9tICcuLi8uLi90YW5kZW0vanMvdHlwZXMvUmVmZXJlbmNlSU8uanMnO1xuaW1wb3J0IHNjZW5lcnlQaGV0IGZyb20gJy4vc2NlbmVyeVBoZXQuanMnO1xuXG5jb25zdCBERUZBVUxUX1RJTUVfUkFOR0UgPSBuZXcgUmFuZ2UoIDAsIE51bWJlci5QT1NJVElWRV9JTkZJTklUWSApO1xuXG50eXBlIFNlbGZPcHRpb25zID0ge1xuICBwb3NpdGlvbj86IFZlY3RvcjI7XG4gIGlzVmlzaWJsZT86IGJvb2xlYW47XG4gIHRpbWVQcm9wZXJ0eU9wdGlvbnM/OiBTdHJpY3RPbWl0PE51bWJlclByb3BlcnR5T3B0aW9ucywgJ3RhbmRlbSc+O1xufTtcblxuZXhwb3J0IHR5cGUgU3RvcHdhdGNoT3B0aW9ucyA9IFNlbGZPcHRpb25zICYgUGhldGlvT2JqZWN0T3B0aW9ucztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgU3RvcHdhdGNoIGV4dGVuZHMgUGhldGlvT2JqZWN0IHtcblxuICAvLyBwb3NpdGlvbiBvZiB0aGUgc3RvcHdhdGNoLCBpbiB2aWV3IGNvb3JkaW5hdGVzXG4gIHB1YmxpYyByZWFkb25seSBwb3NpdGlvblByb3BlcnR5OiBQcm9wZXJ0eTxWZWN0b3IyPjtcblxuICAvLyB3aGV0aGVyIHRoZSBzdG9wd2F0Y2ggaXMgdmlzaWJsZVxuICBwdWJsaWMgcmVhZG9ubHkgaXNWaXNpYmxlUHJvcGVydHk6IFByb3BlcnR5PGJvb2xlYW4+O1xuXG4gIC8vIHdoZXRoZXIgdGhlIHN0b3B3YXRjaCBpcyBydW5uaW5nXG4gIHB1YmxpYyByZWFkb25seSBpc1J1bm5pbmdQcm9wZXJ0eTogUHJvcGVydHk8Ym9vbGVhbj47XG5cbiAgLy8gdGltZSBkaXNwbGF5ZWQgb24gdGhlIHN0b3B3YXRjaCwgaW4gdW5pdHMgYXMgc3BlY2lmaWVkIGJ5IHRoZSBjbGllbnRcbiAgcHVibGljIHJlYWRvbmx5IHRpbWVQcm9wZXJ0eTogTnVtYmVyUHJvcGVydHk7XG5cbiAgcHJpdmF0ZSByZWFkb25seSBkaXNwb3NlU3RvcHdhdGNoOiAoKSA9PiB2b2lkO1xuXG4gIHB1YmxpYyBzdGF0aWMgcmVhZG9ubHkgWkVST19UT19BTE1PU1RfU0lYVFkgPSBuZXcgUmFuZ2UoIDAsIDM1OTkuOTkgKTsgLy8gd29ya3Mgb3V0IHRvIGJlIDU5OjU5Ljk5XG5cbiAgcHVibGljIGNvbnN0cnVjdG9yKCBwcm92aWRlZE9wdGlvbnM/OiBTdG9wd2F0Y2hPcHRpb25zICkge1xuXG4gICAgY29uc3Qgb3B0aW9ucyA9IG9wdGlvbml6ZTxTdG9wd2F0Y2hPcHRpb25zLCBTZWxmT3B0aW9ucywgUGhldGlvT2JqZWN0T3B0aW9ucz4oKSgge1xuXG4gICAgICAvLyBTZWxmT3B0aW9uc1xuICAgICAgcG9zaXRpb246IFZlY3RvcjIuWkVSTyxcbiAgICAgIGlzVmlzaWJsZTogZmFsc2UsXG4gICAgICB0aW1lUHJvcGVydHlPcHRpb25zOiB7XG4gICAgICAgIHJhbmdlOiBERUZBVUxUX1RJTUVfUkFOR0UsIC8vIFdoZW4gdGltZSByZWFjaGVzIHJhbmdlLm1heCwgdGhlIFN0b3B3YXRjaCBhdXRvbWF0aWNhbGx5IHBhdXNlcy5cbiAgICAgICAgdW5pdHM6ICdzJyxcbiAgICAgICAgaXNWYWxpZFZhbHVlOiAoIHZhbHVlOiBudW1iZXIgKSA9PiB2YWx1ZSA+PSAwLFxuICAgICAgICBwaGV0aW9SZWFkT25seTogdHJ1ZSxcbiAgICAgICAgcGhldGlvSGlnaEZyZXF1ZW5jeTogdHJ1ZVxuICAgICAgfSxcblxuICAgICAgLy8gUGhldGlvT2JqZWN0T3B0aW9uc1xuICAgICAgdGFuZGVtOiBUYW5kZW0uUkVRVUlSRUQsXG4gICAgICB0YW5kZW1OYW1lU3VmZml4OiAnU3RvcHdhdGNoJyxcbiAgICAgIHBoZXRpb1R5cGU6IFJlZmVyZW5jZUlPKCBJT1R5cGUuT2JqZWN0SU8gKSxcbiAgICAgIHBoZXRpb1N0YXRlOiBmYWxzZVxuICAgIH0sIHByb3ZpZGVkT3B0aW9ucyApO1xuXG4gICAgc3VwZXIoIG9wdGlvbnMgKTtcblxuICAgIHRoaXMucG9zaXRpb25Qcm9wZXJ0eSA9IG5ldyBWZWN0b3IyUHJvcGVydHkoIG9wdGlvbnMucG9zaXRpb24sIHtcbiAgICAgIHRhbmRlbTogb3B0aW9ucy50YW5kZW0uY3JlYXRlVGFuZGVtKCAncG9zaXRpb25Qcm9wZXJ0eScgKSxcbiAgICAgIHBoZXRpb0RvY3VtZW50YXRpb246IGB2aWV3IGNvb3JkaW5hdGVzIGZvciB0aGUgdXBwZXItbGVmdCBvZiB0aGUgc3RvcHdhdGNoIChpbml0aWFsbHkgJHtvcHRpb25zLnBvc2l0aW9uLnh9LCR7b3B0aW9ucy5wb3NpdGlvbi55fSlgLFxuICAgICAgcGhldGlvRmVhdHVyZWQ6IHRydWVcbiAgICB9ICk7XG5cbiAgICB0aGlzLmlzVmlzaWJsZVByb3BlcnR5ID0gbmV3IEJvb2xlYW5Qcm9wZXJ0eSggb3B0aW9ucy5pc1Zpc2libGUsIHtcbiAgICAgIHRhbmRlbTogb3B0aW9ucy50YW5kZW0uY3JlYXRlVGFuZGVtKCAnaXNWaXNpYmxlUHJvcGVydHknICksXG4gICAgICBwaGV0aW9GZWF0dXJlZDogdHJ1ZVxuICAgIH0gKTtcblxuICAgIHRoaXMuaXNSdW5uaW5nUHJvcGVydHkgPSBuZXcgQm9vbGVhblByb3BlcnR5KCBmYWxzZSwge1xuICAgICAgdGFuZGVtOiBvcHRpb25zLnRhbmRlbS5jcmVhdGVUYW5kZW0oICdpc1J1bm5pbmdQcm9wZXJ0eScgKSxcbiAgICAgIHBoZXRpb0ZlYXR1cmVkOiB0cnVlXG4gICAgfSApO1xuXG4gICAgdGhpcy50aW1lUHJvcGVydHkgPSBuZXcgTnVtYmVyUHJvcGVydHkoIDAsIGNvbWJpbmVPcHRpb25zPE51bWJlclByb3BlcnR5T3B0aW9ucz4oIHtcbiAgICAgIHRhbmRlbTogb3B0aW9ucy50YW5kZW0uY3JlYXRlVGFuZGVtKCAndGltZVByb3BlcnR5JyApLFxuICAgICAgcGhldGlvRmVhdHVyZWQ6IHRydWVcbiAgICB9LCBvcHRpb25zLnRpbWVQcm9wZXJ0eU9wdGlvbnMgKSApO1xuXG4gICAgLy8gV2hlbiB0aGUgc3RvcHdhdGNoIHZpc2liaWxpdHkgY2hhbmdlcywgc3RvcCBpdCBhbmQgcmVzZXQgaXRzIHZhbHVlLlxuICAgIGNvbnN0IHZpc2liaWxpdHlMaXN0ZW5lciA9ICgpID0+IHtcbiAgICAgIGlmICggIWlzU2V0dGluZ1BoZXRpb1N0YXRlUHJvcGVydHkudmFsdWUgKSB7XG4gICAgICAgIHRoaXMuaXNSdW5uaW5nUHJvcGVydHkudmFsdWUgPSBmYWxzZTtcbiAgICAgICAgdGhpcy50aW1lUHJvcGVydHkudmFsdWUgPSAwO1xuICAgICAgfVxuICAgIH07XG4gICAgdGhpcy5pc1Zpc2libGVQcm9wZXJ0eS5saW5rKCB2aXNpYmlsaXR5TGlzdGVuZXIgKTtcblxuICAgIHRoaXMuZGlzcG9zZVN0b3B3YXRjaCA9ICgpID0+IHtcbiAgICAgIHRoaXMuaXNWaXNpYmxlUHJvcGVydHkudW5saW5rKCB2aXNpYmlsaXR5TGlzdGVuZXIgKTtcbiAgICAgIHRoaXMucG9zaXRpb25Qcm9wZXJ0eS5kaXNwb3NlKCk7XG4gICAgICB0aGlzLmlzVmlzaWJsZVByb3BlcnR5LmRpc3Bvc2UoKTtcbiAgICAgIHRoaXMuaXNSdW5uaW5nUHJvcGVydHkuZGlzcG9zZSgpO1xuICAgICAgdGhpcy50aW1lUHJvcGVydHkuZGlzcG9zZSgpO1xuICAgIH07XG4gIH1cblxuICBwdWJsaWMgb3ZlcnJpZGUgZGlzcG9zZSgpOiB2b2lkIHtcbiAgICB0aGlzLmRpc3Bvc2VTdG9wd2F0Y2goKTtcbiAgICBzdXBlci5kaXNwb3NlKCk7XG4gIH1cblxuICBwdWJsaWMgcmVzZXQoKTogdm9pZCB7XG4gICAgdGhpcy5wb3NpdGlvblByb3BlcnR5LnJlc2V0KCk7XG4gICAgdGhpcy5pc1Zpc2libGVQcm9wZXJ0eS5yZXNldCgpO1xuICAgIHRoaXMuaXNSdW5uaW5nUHJvcGVydHkucmVzZXQoKTtcbiAgICB0aGlzLnRpbWVQcm9wZXJ0eS5yZXNldCgpO1xuICB9XG5cbiAgLyoqXG4gICAqIFN0ZXBzIHRoZSBzdG9wd2F0Y2guXG4gICAqIEBwYXJhbSBkdCAtIHRpbWUgZGVsdGEsIGluIHVuaXRzIGFzIHNwZWNpZmllZCBieSB0aGUgY2xpZW50XG4gICAqL1xuICBwdWJsaWMgc3RlcCggZHQ6IG51bWJlciApOiB2b2lkIHtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBkdCA+IDAsIGBpbnZhbGlkIGR0OiAke2R0fWAgKTtcblxuICAgIHRoaXMuc2V0VGltZSggdGhpcy50aW1lUHJvcGVydHkudmFsdWUgKyBkdCApO1xuICB9XG5cbiAgLyoqXG4gICAqIFNpbWlsYXIgdG8gc3RlcCgpIGJ1dCBzZXRzIHRoZSB0aW1lIHRvIGEgc3BlY2lmaWMgdmFsdWUuXG4gICAqIEBwYXJhbSB0XG4gICAqL1xuICBwdWJsaWMgc2V0VGltZSggdDogbnVtYmVyICk6IHZvaWQge1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIHQgPj0gMCwgYGludmFsaWQgdDogJHt0fWAgKTtcblxuICAgIGlmICggdGhpcy5pc1J1bm5pbmdQcm9wZXJ0eS52YWx1ZSApIHtcblxuICAgICAgLy8gSW5jcmVtZW50IHRpbWUsIGJ1dCBkb24ndCBleGNlZWQgdGhlIHJhbmdlLlxuICAgICAgdGhpcy50aW1lUHJvcGVydHkudmFsdWUgPSB0aGlzLnRpbWVQcm9wZXJ0eS5yYW5nZS5jb25zdHJhaW5WYWx1ZSggdCApO1xuXG4gICAgICAvLyBJZiB0aGUgbWF4IGlzIHJlYWNoZWQsIHRoZW4gcGF1c2UuXG4gICAgICBpZiAoIHRoaXMudGltZVByb3BlcnR5LnZhbHVlID49IHRoaXMudGltZVByb3BlcnR5LnJhbmdlLm1heCApIHtcbiAgICAgICAgdGhpcy5pc1J1bm5pbmdQcm9wZXJ0eS52YWx1ZSA9IGZhbHNlO1xuICAgICAgfVxuICAgIH1cbiAgfVxufVxuXG5zY2VuZXJ5UGhldC5yZWdpc3RlciggJ1N0b3B3YXRjaCcsIFN0b3B3YXRjaCApOyJdLCJuYW1lcyI6WyJCb29sZWFuUHJvcGVydHkiLCJOdW1iZXJQcm9wZXJ0eSIsIlJhbmdlIiwiVmVjdG9yMiIsIlZlY3RvcjJQcm9wZXJ0eSIsIm9wdGlvbml6ZSIsImNvbWJpbmVPcHRpb25zIiwiaXNTZXR0aW5nUGhldGlvU3RhdGVQcm9wZXJ0eSIsIlBoZXRpb09iamVjdCIsIlRhbmRlbSIsIklPVHlwZSIsIlJlZmVyZW5jZUlPIiwic2NlbmVyeVBoZXQiLCJERUZBVUxUX1RJTUVfUkFOR0UiLCJOdW1iZXIiLCJQT1NJVElWRV9JTkZJTklUWSIsIlN0b3B3YXRjaCIsImRpc3Bvc2UiLCJkaXNwb3NlU3RvcHdhdGNoIiwicmVzZXQiLCJwb3NpdGlvblByb3BlcnR5IiwiaXNWaXNpYmxlUHJvcGVydHkiLCJpc1J1bm5pbmdQcm9wZXJ0eSIsInRpbWVQcm9wZXJ0eSIsInN0ZXAiLCJkdCIsImFzc2VydCIsInNldFRpbWUiLCJ2YWx1ZSIsInQiLCJyYW5nZSIsImNvbnN0cmFpblZhbHVlIiwibWF4IiwicHJvdmlkZWRPcHRpb25zIiwib3B0aW9ucyIsInBvc2l0aW9uIiwiWkVSTyIsImlzVmlzaWJsZSIsInRpbWVQcm9wZXJ0eU9wdGlvbnMiLCJ1bml0cyIsImlzVmFsaWRWYWx1ZSIsInBoZXRpb1JlYWRPbmx5IiwicGhldGlvSGlnaEZyZXF1ZW5jeSIsInRhbmRlbSIsIlJFUVVJUkVEIiwidGFuZGVtTmFtZVN1ZmZpeCIsInBoZXRpb1R5cGUiLCJPYmplY3RJTyIsInBoZXRpb1N0YXRlIiwiY3JlYXRlVGFuZGVtIiwicGhldGlvRG9jdW1lbnRhdGlvbiIsIngiLCJ5IiwicGhldGlvRmVhdHVyZWQiLCJ2aXNpYmlsaXR5TGlzdGVuZXIiLCJsaW5rIiwidW5saW5rIiwiWkVST19UT19BTE1PU1RfU0lYVFkiLCJyZWdp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