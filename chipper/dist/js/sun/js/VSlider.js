// Copyright 2018-2024, University of Colorado Boulder
/**
 * Convenience type for vertical slider.
 * See https://github.com/phetsims/sun/issues/380
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */ import InstanceRegistry from '../../phet-core/js/documentation/InstanceRegistry.js';
import optionize from '../../phet-core/js/optionize.js';
import Orientation from '../../phet-core/js/Orientation.js';
import { default as Slider } from './Slider.js';
import sun from './sun.js';
let VSlider = class VSlider extends Slider {
    constructor(valueProperty, range, options){
        var _window_phet_chipper_queryParameters, _window_phet_chipper, _window_phet;
        options = optionize()({
            orientation: Orientation.VERTICAL
        }, options);
        super(valueProperty, range, options);
        // support for binder documentation, stripped out in builds and only runs when ?binder is specified
        assert && ((_window_phet = window.phet) == null ? void 0 : (_window_phet_chipper = _window_phet.chipper) == null ? void 0 : (_window_phet_chipper_queryParameters = _window_phet_chipper.queryParameters) == null ? void 0 : _window_phet_chipper_queryParameters.binder) && InstanceRegistry.registerDataURL('sun', 'VSlider', this);
    }
};
export { VSlider as default };
sun.register('VSlider', VSlider);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3N1bi9qcy9WU2xpZGVyLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE4LTIwMjQsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIENvbnZlbmllbmNlIHR5cGUgZm9yIHZlcnRpY2FsIHNsaWRlci5cbiAqIFNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvc3VuL2lzc3Vlcy8zODBcbiAqXG4gKiBAYXV0aG9yIENocmlzIE1hbGxleSAoUGl4ZWxab29tLCBJbmMuKVxuICovXG5cbmltcG9ydCBQaGV0aW9Qcm9wZXJ0eSBmcm9tICcuLi8uLi9heG9uL2pzL1BoZXRpb1Byb3BlcnR5LmpzJztcbmltcG9ydCBSYW5nZSBmcm9tICcuLi8uLi9kb3QvanMvUmFuZ2UuanMnO1xuaW1wb3J0IEluc3RhbmNlUmVnaXN0cnkgZnJvbSAnLi4vLi4vcGhldC1jb3JlL2pzL2RvY3VtZW50YXRpb24vSW5zdGFuY2VSZWdpc3RyeS5qcyc7XG5pbXBvcnQgb3B0aW9uaXplLCB7IEVtcHR5U2VsZk9wdGlvbnMgfSBmcm9tICcuLi8uLi9waGV0LWNvcmUvanMvb3B0aW9uaXplLmpzJztcbmltcG9ydCBPcmllbnRhdGlvbiBmcm9tICcuLi8uLi9waGV0LWNvcmUvanMvT3JpZW50YXRpb24uanMnO1xuaW1wb3J0IFN0cmljdE9taXQgZnJvbSAnLi4vLi4vcGhldC1jb3JlL2pzL3R5cGVzL1N0cmljdE9taXQuanMnO1xuaW1wb3J0IHsgZGVmYXVsdCBhcyBTbGlkZXIsIFNsaWRlck9wdGlvbnMgfSBmcm9tICcuL1NsaWRlci5qcyc7XG5pbXBvcnQgc3VuIGZyb20gJy4vc3VuLmpzJztcblxudHlwZSBTZWxmT3B0aW9ucyA9IEVtcHR5U2VsZk9wdGlvbnM7XG5cbmV4cG9ydCB0eXBlIFZTbGlkZXJPcHRpb25zID0gU2VsZk9wdGlvbnMgJiBTdHJpY3RPbWl0PFNsaWRlck9wdGlvbnMsICdvcmllbnRhdGlvbic+O1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBWU2xpZGVyIGV4dGVuZHMgU2xpZGVyIHtcblxuICBwdWJsaWMgY29uc3RydWN0b3IoIHZhbHVlUHJvcGVydHk6IFBoZXRpb1Byb3BlcnR5PG51bWJlcj4sIHJhbmdlOiBSYW5nZSwgb3B0aW9ucz86IFZTbGlkZXJPcHRpb25zICkge1xuXG4gICAgb3B0aW9ucyA9IG9wdGlvbml6ZTxWU2xpZGVyT3B0aW9ucywgU2VsZk9wdGlvbnMsIFNsaWRlck9wdGlvbnM+KCkoIHtcbiAgICAgIG9yaWVudGF0aW9uOiBPcmllbnRhdGlvbi5WRVJUSUNBTFxuICAgIH0sIG9wdGlvbnMgKTtcblxuICAgIHN1cGVyKCB2YWx1ZVByb3BlcnR5LCByYW5nZSwgb3B0aW9ucyApO1xuXG4gICAgLy8gc3VwcG9ydCBmb3IgYmluZGVyIGRvY3VtZW50YXRpb24sIHN0cmlwcGVkIG91dCBpbiBidWlsZHMgYW5kIG9ubHkgcnVucyB3aGVuID9iaW5kZXIgaXMgc3BlY2lmaWVkXG4gICAgYXNzZXJ0ICYmIHdpbmRvdy5waGV0Py5jaGlwcGVyPy5xdWVyeVBhcmFtZXRlcnM/LmJpbmRlciAmJiBJbnN0YW5jZVJlZ2lzdHJ5LnJlZ2lzdGVyRGF0YVVSTCggJ3N1bicsICdWU2xpZGVyJywgdGhpcyApO1xuICB9XG59XG5cbnN1bi5yZWdpc3RlciggJ1ZTbGlkZXInLCBWU2xpZGVyICk7Il0sIm5hbWVzIjpbIkluc3RhbmNlUmVnaXN0cnkiLCJvcHRpb25pemUiLCJPcmllbnRhdGlvbiIsImRlZmF1bHQiLCJTbGlkZXIiLCJzdW4iLCJWU2xpZGVyIiwidmFsdWVQcm9wZXJ0eSIsInJhbmdlIiwib3B0aW9ucyIsIndpbmRvdyIsIm9yaWVudGF0aW9uIiwiVkVSVElDQUwiLCJhc3NlcnQiLCJwaGV0IiwiY2hpcHBlciIsInF1ZXJ5UGFyYW1ldGVycyIsImJpbmRlciIsInJlZ2lzdGVyRGF0YVVSTCIsInJlZ2lzdGVyIl0sIm1hcHBpbmdzIjoiQUFBQSxzREFBc0Q7QUFFdEQ7Ozs7O0NBS0MsR0FJRCxPQUFPQSxzQkFBc0IsdURBQXVEO0FBQ3BGLE9BQU9DLGVBQXFDLGtDQUFrQztBQUM5RSxPQUFPQyxpQkFBaUIsb0NBQW9DO0FBRTVELFNBQVNDLFdBQVdDLE1BQU0sUUFBdUIsY0FBYztBQUMvRCxPQUFPQyxTQUFTLFdBQVc7QUFNWixJQUFBLEFBQU1DLFVBQU4sTUFBTUEsZ0JBQWdCRjtJQUVuQyxZQUFvQkcsYUFBcUMsRUFBRUMsS0FBWSxFQUFFQyxPQUF3QixDQUFHO1lBU3hGQyxzQ0FBQUEsc0JBQUFBO1FBUFZELFVBQVVSLFlBQXlEO1lBQ2pFVSxhQUFhVCxZQUFZVSxRQUFRO1FBQ25DLEdBQUdIO1FBRUgsS0FBSyxDQUFFRixlQUFlQyxPQUFPQztRQUU3QixtR0FBbUc7UUFDbkdJLFlBQVVILGVBQUFBLE9BQU9JLElBQUksc0JBQVhKLHVCQUFBQSxhQUFhSyxPQUFPLHNCQUFwQkwsdUNBQUFBLHFCQUFzQk0sZUFBZSxxQkFBckNOLHFDQUF1Q08sTUFBTSxLQUFJakIsaUJBQWlCa0IsZUFBZSxDQUFFLE9BQU8sV0FBVyxJQUFJO0lBQ3JIO0FBQ0Y7QUFiQSxTQUFxQloscUJBYXBCO0FBRURELElBQUljLFFBQVEsQ0FBRSxXQUFXYiJ9