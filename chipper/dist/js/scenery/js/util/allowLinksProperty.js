// Copyright 2022-2024, University of Colorado Boulder
/**
 * Whether links should be openable
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ var _window_phet_chipper, _window_phet, _window, _window_phet_chipper_queryParameters, _window_phet_chipper1, _window_phet1, _window1;
import BooleanProperty from '../../../axon/js/BooleanProperty.js';
import Tandem from '../../../tandem/js/Tandem.js';
import { scenery } from '../imports.js';
const allowLinksProperty = new BooleanProperty(!((_window = window) == null ? void 0 : (_window_phet = _window.phet) == null ? void 0 : (_window_phet_chipper = _window_phet.chipper) == null ? void 0 : _window_phet_chipper.queryParameters) || ((_window1 = window) == null ? void 0 : (_window_phet1 = _window1.phet) == null ? void 0 : (_window_phet_chipper1 = _window_phet1.chipper) == null ? void 0 : (_window_phet_chipper_queryParameters = _window_phet_chipper1.queryParameters) == null ? void 0 : _window_phet_chipper_queryParameters.allowLinks), {
    tandem: Tandem.GENERAL_MODEL.createTandem('allowLinksProperty')
});
scenery.register('allowLinksProperty', allowLinksProperty);
export default allowLinksProperty;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvdXRpbC9hbGxvd0xpbmtzUHJvcGVydHkudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjItMjAyNCwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbi8qKlxuICogV2hldGhlciBsaW5rcyBzaG91bGQgYmUgb3BlbmFibGVcbiAqXG4gKiBAYXV0aG9yIEpvbmF0aGFuIE9sc29uIDxqb25hdGhhbi5vbHNvbkBjb2xvcmFkby5lZHU+XG4gKi9cbmltcG9ydCBCb29sZWFuUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vYXhvbi9qcy9Cb29sZWFuUHJvcGVydHkuanMnO1xuaW1wb3J0IFRhbmRlbSBmcm9tICcuLi8uLi8uLi90YW5kZW0vanMvVGFuZGVtLmpzJztcbmltcG9ydCB7IHNjZW5lcnkgfSBmcm9tICcuLi9pbXBvcnRzLmpzJztcblxuY29uc3QgYWxsb3dMaW5rc1Byb3BlcnR5ID0gbmV3IEJvb2xlYW5Qcm9wZXJ0eSggISggd2luZG93Py5waGV0Py5jaGlwcGVyPy5xdWVyeVBhcmFtZXRlcnMgKSB8fCAoIHdpbmRvdz8ucGhldD8uY2hpcHBlcj8ucXVlcnlQYXJhbWV0ZXJzPy5hbGxvd0xpbmtzICksIHtcbiAgdGFuZGVtOiBUYW5kZW0uR0VORVJBTF9NT0RFTC5jcmVhdGVUYW5kZW0oICdhbGxvd0xpbmtzUHJvcGVydHknIClcbn0gKTtcblxuc2NlbmVyeS5yZWdpc3RlciggJ2FsbG93TGlua3NQcm9wZXJ0eScsIGFsbG93TGlua3NQcm9wZXJ0eSApO1xuXG5leHBvcnQgZGVmYXVsdCBhbGxvd0xpbmtzUHJvcGVydHk7Il0sIm5hbWVzIjpbIndpbmRvdyIsIkJvb2xlYW5Qcm9wZXJ0eSIsIlRhbmRlbSIsInNjZW5lcnkiLCJhbGxvd0xpbmtzUHJvcGVydHkiLCJwaGV0IiwiY2hpcHBlciIsInF1ZXJ5UGFyYW1ldGVycyIsImFsbG93TGlua3MiLCJ0YW5kZW0iLCJHRU5FUkFMX01PREVMIiwiY3JlYXRlVGFuZGVtIiwicmVnaXN0ZXIiXSwibWFwcGluZ3MiOiJBQUFBLHNEQUFzRDtBQUV0RDs7OztDQUlDLE9BS2tEQSxzQkFBQUEsY0FBQUEsU0FBOENBLHNDQUFBQSx1QkFBQUEsZUFBQUE7QUFKakcsT0FBT0MscUJBQXFCLHNDQUFzQztBQUNsRSxPQUFPQyxZQUFZLCtCQUErQjtBQUNsRCxTQUFTQyxPQUFPLFFBQVEsZ0JBQWdCO0FBRXhDLE1BQU1DLHFCQUFxQixJQUFJSCxnQkFBaUIsR0FBR0QsVUFBQUEsNEJBQUFBLGVBQUFBLFFBQVFLLElBQUksc0JBQVpMLHVCQUFBQSxhQUFjTSxPQUFPLHFCQUFyQk4scUJBQXVCTyxlQUFlLE9BQVFQLFdBQUFBLDRCQUFBQSxnQkFBQUEsU0FBUUssSUFBSSxzQkFBWkwsd0JBQUFBLGNBQWNNLE9BQU8sc0JBQXJCTix1Q0FBQUEsc0JBQXVCTyxlQUFlLHFCQUF0Q1AscUNBQXdDUSxVQUFVLEdBQUk7SUFDckpDLFFBQVFQLE9BQU9RLGFBQWEsQ0FBQ0MsWUFBWSxDQUFFO0FBQzdDO0FBRUFSLFFBQVFTLFFBQVEsQ0FBRSxzQkFBc0JSO0FBRXhDLGVBQWVBLG1CQUFtQiJ9