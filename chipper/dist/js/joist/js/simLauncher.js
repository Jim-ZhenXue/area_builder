// Copyright 2013-2024, University of Colorado Boulder
/* eslint indent: 0 */ // Because ESLint doesn't support import() at the time of this writing
/**
 * Singleton which launches a PhET Simulation, after using PHET_CORE/asyncLoader to make sure resources such as images,
 * sounds, or dynamic modules have finished loading.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */ import asyncLoader from '../../phet-core/js/asyncLoader.js';
import Tandem from '../../tandem/js/Tandem.js';
import joist from './joist.js';
// See below for dynamic imports, which must be locked.
let phetioEngine = null;
const unlockBrand = asyncLoader.createLock({
    name: 'brand'
});
import(/* webpackMode: "eager" */ `../../brand/${phet.chipper.brand}/js/Brand.js`).then((module)=>unlockBrand()).catch((err)=>assert && assert(false, err));
if (Tandem.PHET_IO_ENABLED) {
    const unlockPhetioEngine = asyncLoader.createLock({
        name: 'phetioEngine'
    });
    import(/* webpackMode: "eager" */ '../../phet-io/js/phetioEngine.js').then((module)=>{
        phetioEngine = module.default;
        unlockPhetioEngine();
    }).catch((err)=>assert && assert(false, err));
}
const unlockLaunch = asyncLoader.createLock({
    name: 'launch'
});
let SimLauncher = class SimLauncher {
    /**
   * Launch the Sim by preloading the images and calling the callback.
   * to be called by main()s everywhere
   *
   * callback - the callback function which should create and start the sim, given that all async
   *                              content is loaded
   */ launch(callback) {
        assert && assert(!window.phet.joist.launchCalled, 'Tried to launch twice');
        // Add listener before unlocking the launch lock
        asyncLoader.addListener(()=>{
            window.phet.joist.launchSimulation = ()=>{
                assert && assert(!this.launchComplete, 'should not have completed launching the sim yet');
                this.launchComplete = true;
                // once launchSimulation has been called, the wrapper is ready to receive messages because any listeners it
                // wants have been set up by now.
                if (Tandem.PHET_IO_ENABLED) {
                    phetioEngine == null ? void 0 : phetioEngine.onCrossFrameListenersReady();
                }
                // Instantiate the sim and show it.
                callback();
            };
            // PhET-iO simulations support an initialization phase (before the sim launches)
            if (Tandem.PHET_IO_ENABLED) {
                phetioEngine == null ? void 0 : phetioEngine.initialize(); // calls back to window.phet.joist.launchSimulation
            }
            if (phet.chipper.queryParameters.postMessageOnReady) {
                window.parent && window.parent.postMessage(JSON.stringify({
                    type: 'ready',
                    url: window.location.href
                }), '*');
            }
            if (Tandem.PHET_IO_ENABLED && !phet.preloads.phetio.queryParameters.phetioStandalone || phet.chipper.queryParameters.playbackMode) {
            // Wait for phet-io to finish adding listeners. It will direct the launch from there.
            } else {
                window.phet.joist.launchSimulation();
            }
        });
        unlockLaunch();
        // Signify that the simLauncher was called, see https://github.com/phetsims/joist/issues/142
        window.phet.joist.launchCalled = true;
    }
    constructor(){
        this.launchComplete = false;
    }
};
const simLauncher = new SimLauncher();
joist.register('simLauncher', simLauncher);
export default simLauncher;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2pvaXN0L2pzL3NpbUxhdW5jaGVyLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDEzLTIwMjQsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuLyogZXNsaW50IGluZGVudDogMCAqLyAvLyBCZWNhdXNlIEVTTGludCBkb2Vzbid0IHN1cHBvcnQgaW1wb3J0KCkgYXQgdGhlIHRpbWUgb2YgdGhpcyB3cml0aW5nXG4vKipcbiAqIFNpbmdsZXRvbiB3aGljaCBsYXVuY2hlcyBhIFBoRVQgU2ltdWxhdGlvbiwgYWZ0ZXIgdXNpbmcgUEhFVF9DT1JFL2FzeW5jTG9hZGVyIHRvIG1ha2Ugc3VyZSByZXNvdXJjZXMgc3VjaCBhcyBpbWFnZXMsXG4gKiBzb3VuZHMsIG9yIGR5bmFtaWMgbW9kdWxlcyBoYXZlIGZpbmlzaGVkIGxvYWRpbmcuXG4gKlxuICogQGF1dGhvciBTYW0gUmVpZCAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcbiAqL1xuXG5pbXBvcnQgYXN5bmNMb2FkZXIgZnJvbSAnLi4vLi4vcGhldC1jb3JlL2pzL2FzeW5jTG9hZGVyLmpzJztcbmltcG9ydCB7IFBoZXRpb0VuZ2luZSB9IGZyb20gJy4uLy4uL3BoZXQtaW8vanMvcGhldGlvRW5naW5lLmpzJztcbmltcG9ydCBUYW5kZW0gZnJvbSAnLi4vLi4vdGFuZGVtL2pzL1RhbmRlbS5qcyc7XG5pbXBvcnQgam9pc3QgZnJvbSAnLi9qb2lzdC5qcyc7XG5cbi8vIFNlZSBiZWxvdyBmb3IgZHluYW1pYyBpbXBvcnRzLCB3aGljaCBtdXN0IGJlIGxvY2tlZC5cbmxldCBwaGV0aW9FbmdpbmU6IFBoZXRpb0VuZ2luZSB8IG51bGwgPSBudWxsO1xuXG5jb25zdCB1bmxvY2tCcmFuZCA9IGFzeW5jTG9hZGVyLmNyZWF0ZUxvY2soIHsgbmFtZTogJ2JyYW5kJyB9ICk7XG5pbXBvcnQoIC8qIHdlYnBhY2tNb2RlOiBcImVhZ2VyXCIgKi8gYC4uLy4uL2JyYW5kLyR7cGhldC5jaGlwcGVyLmJyYW5kfS9qcy9CcmFuZC5qc2AgKVxuICAudGhlbiggbW9kdWxlID0+IHVubG9ja0JyYW5kKCkgKVxuICAuY2F0Y2goIGVyciA9PiBhc3NlcnQgJiYgYXNzZXJ0KCBmYWxzZSwgZXJyICkgKTtcblxuaWYgKCBUYW5kZW0uUEhFVF9JT19FTkFCTEVEICkge1xuICBjb25zdCB1bmxvY2tQaGV0aW9FbmdpbmUgPSBhc3luY0xvYWRlci5jcmVhdGVMb2NrKCB7IG5hbWU6ICdwaGV0aW9FbmdpbmUnIH0gKTtcbiAgaW1wb3J0KCAvKiB3ZWJwYWNrTW9kZTogXCJlYWdlclwiICovICcuLi8uLi9waGV0LWlvL2pzL3BoZXRpb0VuZ2luZS5qcycgKVxuICAgIC50aGVuKCBtb2R1bGUgPT4ge1xuICAgICAgcGhldGlvRW5naW5lID0gbW9kdWxlLmRlZmF1bHQ7XG4gICAgICB1bmxvY2tQaGV0aW9FbmdpbmUoKTtcbiAgICB9IClcbiAgICAuY2F0Y2goIGVyciA9PiBhc3NlcnQgJiYgYXNzZXJ0KCBmYWxzZSwgZXJyICkgKTtcbn1cblxuY29uc3QgdW5sb2NrTGF1bmNoID0gYXN5bmNMb2FkZXIuY3JlYXRlTG9jayggeyBuYW1lOiAnbGF1bmNoJyB9ICk7XG5cbmNsYXNzIFNpbUxhdW5jaGVyIHtcblxuICBwcml2YXRlIGxhdW5jaENvbXBsZXRlOiBib29sZWFuOyAvLyBNYXJrZWQgYXMgdHJ1ZSB3aGVuIHNpbUxhdW5jaGVyIGhhcyBmaW5pc2hlZCBpdHMgd29yayBjeWNsZSBhbmQgY29udHJvbCBpcyBnaXZlbiBvdmVyIHRvIHRoZSBzaW11bGF0aW9uIHRvIGZpbmlzaCBpbml0aWFsaXphdGlvbi5cblxuICBwdWJsaWMgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy5sYXVuY2hDb21wbGV0ZSA9IGZhbHNlO1xuICB9XG5cbiAgLyoqXG4gICAqIExhdW5jaCB0aGUgU2ltIGJ5IHByZWxvYWRpbmcgdGhlIGltYWdlcyBhbmQgY2FsbGluZyB0aGUgY2FsbGJhY2suXG4gICAqIHRvIGJlIGNhbGxlZCBieSBtYWluKClzIGV2ZXJ5d2hlcmVcbiAgICpcbiAgICogY2FsbGJhY2sgLSB0aGUgY2FsbGJhY2sgZnVuY3Rpb24gd2hpY2ggc2hvdWxkIGNyZWF0ZSBhbmQgc3RhcnQgdGhlIHNpbSwgZ2l2ZW4gdGhhdCBhbGwgYXN5bmNcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250ZW50IGlzIGxvYWRlZFxuICAgKi9cbiAgcHVibGljIGxhdW5jaCggY2FsbGJhY2s6ICgpID0+IHZvaWQgKTogdm9pZCB7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggIXdpbmRvdy5waGV0LmpvaXN0LmxhdW5jaENhbGxlZCwgJ1RyaWVkIHRvIGxhdW5jaCB0d2ljZScgKTtcblxuICAgIC8vIEFkZCBsaXN0ZW5lciBiZWZvcmUgdW5sb2NraW5nIHRoZSBsYXVuY2ggbG9ja1xuICAgIGFzeW5jTG9hZGVyLmFkZExpc3RlbmVyKCAoKSA9PiB7XG5cbiAgICAgIHdpbmRvdy5waGV0LmpvaXN0LmxhdW5jaFNpbXVsYXRpb24gPSAoKSA9PiB7XG4gICAgICAgIGFzc2VydCAmJiBhc3NlcnQoICF0aGlzLmxhdW5jaENvbXBsZXRlLCAnc2hvdWxkIG5vdCBoYXZlIGNvbXBsZXRlZCBsYXVuY2hpbmcgdGhlIHNpbSB5ZXQnICk7XG4gICAgICAgIHRoaXMubGF1bmNoQ29tcGxldGUgPSB0cnVlO1xuXG4gICAgICAgIC8vIG9uY2UgbGF1bmNoU2ltdWxhdGlvbiBoYXMgYmVlbiBjYWxsZWQsIHRoZSB3cmFwcGVyIGlzIHJlYWR5IHRvIHJlY2VpdmUgbWVzc2FnZXMgYmVjYXVzZSBhbnkgbGlzdGVuZXJzIGl0XG4gICAgICAgIC8vIHdhbnRzIGhhdmUgYmVlbiBzZXQgdXAgYnkgbm93LlxuICAgICAgICBpZiAoIFRhbmRlbS5QSEVUX0lPX0VOQUJMRUQgKSB7XG4gICAgICAgICAgcGhldGlvRW5naW5lPy5vbkNyb3NzRnJhbWVMaXN0ZW5lcnNSZWFkeSgpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gSW5zdGFudGlhdGUgdGhlIHNpbSBhbmQgc2hvdyBpdC5cbiAgICAgICAgY2FsbGJhY2soKTtcbiAgICAgIH07XG5cbiAgICAgIC8vIFBoRVQtaU8gc2ltdWxhdGlvbnMgc3VwcG9ydCBhbiBpbml0aWFsaXphdGlvbiBwaGFzZSAoYmVmb3JlIHRoZSBzaW0gbGF1bmNoZXMpXG4gICAgICBpZiAoIFRhbmRlbS5QSEVUX0lPX0VOQUJMRUQgKSB7XG4gICAgICAgIHBoZXRpb0VuZ2luZT8uaW5pdGlhbGl6ZSgpOyAvLyBjYWxscyBiYWNrIHRvIHdpbmRvdy5waGV0LmpvaXN0LmxhdW5jaFNpbXVsYXRpb25cbiAgICAgIH1cblxuICAgICAgaWYgKCBwaGV0LmNoaXBwZXIucXVlcnlQYXJhbWV0ZXJzLnBvc3RNZXNzYWdlT25SZWFkeSApIHtcbiAgICAgICAgd2luZG93LnBhcmVudCAmJiB3aW5kb3cucGFyZW50LnBvc3RNZXNzYWdlKCBKU09OLnN0cmluZ2lmeSgge1xuICAgICAgICAgIHR5cGU6ICdyZWFkeScsXG4gICAgICAgICAgdXJsOiB3aW5kb3cubG9jYXRpb24uaHJlZlxuICAgICAgICB9ICksICcqJyApO1xuICAgICAgfVxuXG4gICAgICBpZiAoICggVGFuZGVtLlBIRVRfSU9fRU5BQkxFRCAmJiAhcGhldC5wcmVsb2Fkcy5waGV0aW8ucXVlcnlQYXJhbWV0ZXJzLnBoZXRpb1N0YW5kYWxvbmUgKSB8fFxuICAgICAgICAgICBwaGV0LmNoaXBwZXIucXVlcnlQYXJhbWV0ZXJzLnBsYXliYWNrTW9kZSApIHtcblxuICAgICAgICAvLyBXYWl0IGZvciBwaGV0LWlvIHRvIGZpbmlzaCBhZGRpbmcgbGlzdGVuZXJzLiBJdCB3aWxsIGRpcmVjdCB0aGUgbGF1bmNoIGZyb20gdGhlcmUuXG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgd2luZG93LnBoZXQuam9pc3QubGF1bmNoU2ltdWxhdGlvbigpO1xuICAgICAgfVxuICAgIH0gKTtcbiAgICB1bmxvY2tMYXVuY2goKTtcblxuICAgIC8vIFNpZ25pZnkgdGhhdCB0aGUgc2ltTGF1bmNoZXIgd2FzIGNhbGxlZCwgc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9qb2lzdC9pc3N1ZXMvMTQyXG4gICAgd2luZG93LnBoZXQuam9pc3QubGF1bmNoQ2FsbGVkID0gdHJ1ZTtcbiAgfVxufVxuXG5jb25zdCBzaW1MYXVuY2hlciA9IG5ldyBTaW1MYXVuY2hlcigpO1xuXG5qb2lzdC5yZWdpc3RlciggJ3NpbUxhdW5jaGVyJywgc2ltTGF1bmNoZXIgKTtcblxuZXhwb3J0IGRlZmF1bHQgc2ltTGF1bmNoZXI7Il0sIm5hbWVzIjpbImFzeW5jTG9hZGVyIiwiVGFuZGVtIiwiam9pc3QiLCJwaGV0aW9FbmdpbmUiLCJ1bmxvY2tCcmFuZCIsImNyZWF0ZUxvY2siLCJuYW1lIiwicGhldCIsImNoaXBwZXIiLCJicmFuZCIsInRoZW4iLCJtb2R1bGUiLCJjYXRjaCIsImVyciIsImFzc2VydCIsIlBIRVRfSU9fRU5BQkxFRCIsInVubG9ja1BoZXRpb0VuZ2luZSIsImRlZmF1bHQiLCJ1bmxvY2tMYXVuY2giLCJTaW1MYXVuY2hlciIsImxhdW5jaCIsImNhbGxiYWNrIiwid2luZG93IiwibGF1bmNoQ2FsbGVkIiwiYWRkTGlzdGVuZXIiLCJsYXVuY2hTaW11bGF0aW9uIiwibGF1bmNoQ29tcGxldGUiLCJvbkNyb3NzRnJhbWVMaXN0ZW5lcnNSZWFkeSIsImluaXRpYWxpemUiLCJxdWVyeVBhcmFtZXRlcnMiLCJwb3N0TWVzc2FnZU9uUmVhZHkiLCJwYXJlbnQiLCJwb3N0TWVzc2FnZSIsIkpTT04iLCJzdHJpbmdpZnkiLCJ0eXBlIiwidXJsIiwibG9jYXRpb24iLCJocmVmIiwicHJlbG9hZHMiLCJwaGV0aW8iLCJwaGV0aW9TdGFuZGFsb25lIiwicGxheWJhY2tNb2RlIiwic2ltTGF1bmNoZXIiLCJyZWdpc3RlciJdLCJtYXBwaW5ncyI6IkFBQUEsc0RBQXNEO0FBQ3RELG9CQUFvQixHQUFHLHNFQUFzRTtBQUM3Rjs7Ozs7Q0FLQyxHQUVE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