// Copyright 2021-2024, University of Colorado Boulder
/**
 * A singleton UtteranceQueue that is used for Voicing. It uses the voicingManager to announce Utterances,
 * which uses HTML5 SpeechSynthesis. This UtteranceQueue can take special VoicingUtterances, which
 * have some extra functionality for controlling flow of alerts.
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */ import UtteranceQueue from '../../../../utterance-queue/js/UtteranceQueue.js';
import { scenery, voicingManager } from '../../imports.js';
const voicingUtteranceQueue = new UtteranceQueue(voicingManager, {
    featureSpecificAnnouncingControlPropertyName: 'voicingCanAnnounceProperty'
});
// voicingUtteranceQueue should be disabled until requested
voicingUtteranceQueue.enabled = false;
scenery.register('voicingUtteranceQueue', voicingUtteranceQueue);
export default voicingUtteranceQueue;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvYWNjZXNzaWJpbGl0eS92b2ljaW5nL3ZvaWNpbmdVdHRlcmFuY2VRdWV1ZS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAyMS0yMDI0LCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuLyoqXG4gKiBBIHNpbmdsZXRvbiBVdHRlcmFuY2VRdWV1ZSB0aGF0IGlzIHVzZWQgZm9yIFZvaWNpbmcuIEl0IHVzZXMgdGhlIHZvaWNpbmdNYW5hZ2VyIHRvIGFubm91bmNlIFV0dGVyYW5jZXMsXG4gKiB3aGljaCB1c2VzIEhUTUw1IFNwZWVjaFN5bnRoZXNpcy4gVGhpcyBVdHRlcmFuY2VRdWV1ZSBjYW4gdGFrZSBzcGVjaWFsIFZvaWNpbmdVdHRlcmFuY2VzLCB3aGljaFxuICogaGF2ZSBzb21lIGV4dHJhIGZ1bmN0aW9uYWxpdHkgZm9yIGNvbnRyb2xsaW5nIGZsb3cgb2YgYWxlcnRzLlxuICpcbiAqIEBhdXRob3IgSmVzc2UgR3JlZW5iZXJnIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxuICovXG5cbmltcG9ydCBVdHRlcmFuY2VRdWV1ZSBmcm9tICcuLi8uLi8uLi8uLi91dHRlcmFuY2UtcXVldWUvanMvVXR0ZXJhbmNlUXVldWUuanMnO1xuaW1wb3J0IHsgc2NlbmVyeSwgdm9pY2luZ01hbmFnZXIgfSBmcm9tICcuLi8uLi9pbXBvcnRzLmpzJztcblxuY29uc3Qgdm9pY2luZ1V0dGVyYW5jZVF1ZXVlOiBVdHRlcmFuY2VRdWV1ZSA9IG5ldyBVdHRlcmFuY2VRdWV1ZSggdm9pY2luZ01hbmFnZXIsIHtcbiAgZmVhdHVyZVNwZWNpZmljQW5ub3VuY2luZ0NvbnRyb2xQcm9wZXJ0eU5hbWU6ICd2b2ljaW5nQ2FuQW5ub3VuY2VQcm9wZXJ0eSdcbn0gKTtcblxuLy8gdm9pY2luZ1V0dGVyYW5jZVF1ZXVlIHNob3VsZCBiZSBkaXNhYmxlZCB1bnRpbCByZXF1ZXN0ZWRcbnZvaWNpbmdVdHRlcmFuY2VRdWV1ZS5lbmFibGVkID0gZmFsc2U7XG5cbnNjZW5lcnkucmVnaXN0ZXIoICd2b2ljaW5nVXR0ZXJhbmNlUXVldWUnLCB2b2ljaW5nVXR0ZXJhbmNlUXVldWUgKTtcbmV4cG9ydCBkZWZhdWx0IHZvaWNpbmdVdHRlcmFuY2VRdWV1ZTsiXSwibmFtZXMiOlsiVXR0ZXJhbmNlUXVldWUiLCJzY2VuZXJ5Iiwidm9pY2luZ01hbmFnZXIiLCJ2b2ljaW5nVXR0ZXJhbmNlUXVldWUiLCJmZWF0dXJlU3BlY2lmaWNBbm5vdW5jaW5nQ29udHJvbFByb3BlcnR5TmFtZSIsImVuYWJsZWQiLCJyZWdpc3RlciJdLCJtYXBwaW5ncyI6IkFBQUEsc0RBQXNEO0FBRXREOzs7Ozs7Q0FNQyxHQUVELE9BQU9BLG9CQUFvQixtREFBbUQ7QUFDOUUsU0FBU0MsT0FBTyxFQUFFQyxjQUFjLFFBQVEsbUJBQW1CO0FBRTNELE1BQU1DLHdCQUF3QyxJQUFJSCxlQUFnQkUsZ0JBQWdCO0lBQ2hGRSw4Q0FBOEM7QUFDaEQ7QUFFQSwyREFBMkQ7QUFDM0RELHNCQUFzQkUsT0FBTyxHQUFHO0FBRWhDSixRQUFRSyxRQUFRLENBQUUseUJBQXlCSDtBQUMzQyxlQUFlQSxzQkFBc0IifQ==