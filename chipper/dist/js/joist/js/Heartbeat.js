// Copyright 2017-2022, University of Colorado Boulder
/**
 * For preventing Safari from going to sleep - added to the self.display.domElement instead of the body to prevent a VoiceOver bug
 * where the virtual cursor would spontaneously move when the div content changed, see https://github.com/phetsims/joist/issues/140
 *
 * @author Jonathan Olson (PhET Interactive Simulations)
 * @author Sam Reid (PhET Interactive Simulations)
 */ import joist from './joist.js';
// variables
let started = false;
// a boolean to flip back and forth to make sure safari doesn't get sleepy, see usage.
let value = true;
const Heartbeat = {
    /**
   * Initializes the heartbeat div to begin ticking to prevent Safari from going to sleep.
   */ start: function(sim) {
        assert && assert(!started, 'Heartbeat can only be started once');
        started = true;
        const heartbeatDiv = document.createElement('div');
        heartbeatDiv.style.opacity = '0';
        // Extra style (also used for accessibility) that makes it take up no visual layout space.
        // Without this, it could cause some layout issues. See https://github.com/phetsims/gravity-force-lab/issues/39
        heartbeatDiv.style.position = 'absolute';
        heartbeatDiv.style.left = '0';
        heartbeatDiv.style.top = '0';
        heartbeatDiv.style.width = '0';
        heartbeatDiv.style.height = '0';
        heartbeatDiv.style.clip = 'rect(0,0,0,0)';
        heartbeatDiv.setAttribute('aria-hidden', 'true'); // hide div from screen readers (a11y)
        sim.display.domElement.appendChild(heartbeatDiv);
        // prevent Safari from going to sleep, see https://github.com/phetsims/joist/issues/140
        sim.frameStartedEmitter.addListener(()=>{
            if (sim.frameCounter % 1000 === 0) {
                value = !value;
                heartbeatDiv.innerHTML = `${value}`;
            }
        });
    }
};
joist.register('Heartbeat', Heartbeat);
export default Heartbeat;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2pvaXN0L2pzL0hlYXJ0YmVhdC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNy0yMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuLyoqXG4gKiBGb3IgcHJldmVudGluZyBTYWZhcmkgZnJvbSBnb2luZyB0byBzbGVlcCAtIGFkZGVkIHRvIHRoZSBzZWxmLmRpc3BsYXkuZG9tRWxlbWVudCBpbnN0ZWFkIG9mIHRoZSBib2R5IHRvIHByZXZlbnQgYSBWb2ljZU92ZXIgYnVnXG4gKiB3aGVyZSB0aGUgdmlydHVhbCBjdXJzb3Igd291bGQgc3BvbnRhbmVvdXNseSBtb3ZlIHdoZW4gdGhlIGRpdiBjb250ZW50IGNoYW5nZWQsIHNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvam9pc3QvaXNzdWVzLzE0MFxuICpcbiAqIEBhdXRob3IgSm9uYXRoYW4gT2xzb24gKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXG4gKiBAYXV0aG9yIFNhbSBSZWlkIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxuICovXG5cbmltcG9ydCBqb2lzdCBmcm9tICcuL2pvaXN0LmpzJztcbmltcG9ydCBTaW0gZnJvbSAnLi9TaW0uanMnO1xuXG4vLyB2YXJpYWJsZXNcbmxldCBzdGFydGVkID0gZmFsc2U7XG5cbi8vIGEgYm9vbGVhbiB0byBmbGlwIGJhY2sgYW5kIGZvcnRoIHRvIG1ha2Ugc3VyZSBzYWZhcmkgZG9lc24ndCBnZXQgc2xlZXB5LCBzZWUgdXNhZ2UuXG5sZXQgdmFsdWUgPSB0cnVlO1xuXG5jb25zdCBIZWFydGJlYXQgPSB7XG5cbiAgLyoqXG4gICAqIEluaXRpYWxpemVzIHRoZSBoZWFydGJlYXQgZGl2IHRvIGJlZ2luIHRpY2tpbmcgdG8gcHJldmVudCBTYWZhcmkgZnJvbSBnb2luZyB0byBzbGVlcC5cbiAgICovXG4gIHN0YXJ0OiBmdW5jdGlvbiggc2ltOiBTaW0gKTogdm9pZCB7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggIXN0YXJ0ZWQsICdIZWFydGJlYXQgY2FuIG9ubHkgYmUgc3RhcnRlZCBvbmNlJyApO1xuICAgIHN0YXJ0ZWQgPSB0cnVlO1xuXG4gICAgY29uc3QgaGVhcnRiZWF0RGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCggJ2RpdicgKTtcbiAgICBoZWFydGJlYXREaXYuc3R5bGUub3BhY2l0eSA9ICcwJztcblxuICAgIC8vIEV4dHJhIHN0eWxlIChhbHNvIHVzZWQgZm9yIGFjY2Vzc2liaWxpdHkpIHRoYXQgbWFrZXMgaXQgdGFrZSB1cCBubyB2aXN1YWwgbGF5b3V0IHNwYWNlLlxuICAgIC8vIFdpdGhvdXQgdGhpcywgaXQgY291bGQgY2F1c2Ugc29tZSBsYXlvdXQgaXNzdWVzLiBTZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2dyYXZpdHktZm9yY2UtbGFiL2lzc3Vlcy8zOVxuICAgIGhlYXJ0YmVhdERpdi5zdHlsZS5wb3NpdGlvbiA9ICdhYnNvbHV0ZSc7XG4gICAgaGVhcnRiZWF0RGl2LnN0eWxlLmxlZnQgPSAnMCc7XG4gICAgaGVhcnRiZWF0RGl2LnN0eWxlLnRvcCA9ICcwJztcbiAgICBoZWFydGJlYXREaXYuc3R5bGUud2lkdGggPSAnMCc7XG4gICAgaGVhcnRiZWF0RGl2LnN0eWxlLmhlaWdodCA9ICcwJztcbiAgICBoZWFydGJlYXREaXYuc3R5bGUuY2xpcCA9ICdyZWN0KDAsMCwwLDApJztcbiAgICBoZWFydGJlYXREaXYuc2V0QXR0cmlidXRlKCAnYXJpYS1oaWRkZW4nLCAndHJ1ZScgKTsgLy8gaGlkZSBkaXYgZnJvbSBzY3JlZW4gcmVhZGVycyAoYTExeSlcbiAgICBzaW0uZGlzcGxheS5kb21FbGVtZW50LmFwcGVuZENoaWxkKCBoZWFydGJlYXREaXYgKTtcblxuICAgIC8vIHByZXZlbnQgU2FmYXJpIGZyb20gZ29pbmcgdG8gc2xlZXAsIHNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvam9pc3QvaXNzdWVzLzE0MFxuICAgIHNpbS5mcmFtZVN0YXJ0ZWRFbWl0dGVyLmFkZExpc3RlbmVyKCAoKSA9PiB7XG4gICAgICBpZiAoIHNpbS5mcmFtZUNvdW50ZXIgJSAxMDAwID09PSAwICkge1xuICAgICAgICB2YWx1ZSA9ICF2YWx1ZTtcbiAgICAgICAgaGVhcnRiZWF0RGl2LmlubmVySFRNTCA9IGAke3ZhbHVlfWA7XG4gICAgICB9XG4gICAgfSApO1xuICB9XG59O1xuXG5qb2lzdC5yZWdpc3RlciggJ0hlYXJ0YmVhdCcsIEhlYXJ0YmVhdCApO1xuXG5leHBvcnQgZGVmYXVsdCBIZWFydGJlYXQ7Il0sIm5hbWVzIjpbImpvaXN0Iiwic3RhcnRlZCIsInZhbHVlIiwiSGVhcnRiZWF0Iiwic3RhcnQiLCJzaW0iLCJhc3NlcnQiLCJoZWFydGJlYXREaXYiLCJkb2N1bWVudCIsImNyZWF0ZUVsZW1lbnQiLCJzdHlsZSIsIm9wYWNpdHkiLCJwb3NpdGlvbiIsImxlZnQiLCJ0b3AiLCJ3aWR0aCIsImhlaWdodCIsImNsaXAiLCJzZXRBdHRyaWJ1dGUiLCJkaXNwbGF5IiwiZG9tRWxlbWVudCIsImFwcGVuZENoaWxkIiwiZnJhbWVTdGFydGVkRW1pdHRlciIsImFkZExpc3RlbmVyIiwiZnJhbWVDb3VudGVyIiwiaW5uZXJIVE1MIiwicmVnaXN0ZXIiXSwibWFwcGluZ3MiOiJBQUFBLHNEQUFzRDtBQUV0RDs7Ozs7O0NBTUMsR0FFRCxPQUFPQSxXQUFXLGFBQWE7QUFHL0IsWUFBWTtBQUNaLElBQUlDLFVBQVU7QUFFZCxzRkFBc0Y7QUFDdEYsSUFBSUMsUUFBUTtBQUVaLE1BQU1DLFlBQVk7SUFFaEI7O0dBRUMsR0FDREMsT0FBTyxTQUFVQyxHQUFRO1FBQ3ZCQyxVQUFVQSxPQUFRLENBQUNMLFNBQVM7UUFDNUJBLFVBQVU7UUFFVixNQUFNTSxlQUFlQyxTQUFTQyxhQUFhLENBQUU7UUFDN0NGLGFBQWFHLEtBQUssQ0FBQ0MsT0FBTyxHQUFHO1FBRTdCLDBGQUEwRjtRQUMxRiwrR0FBK0c7UUFDL0dKLGFBQWFHLEtBQUssQ0FBQ0UsUUFBUSxHQUFHO1FBQzlCTCxhQUFhRyxLQUFLLENBQUNHLElBQUksR0FBRztRQUMxQk4sYUFBYUcsS0FBSyxDQUFDSSxHQUFHLEdBQUc7UUFDekJQLGFBQWFHLEtBQUssQ0FBQ0ssS0FBSyxHQUFHO1FBQzNCUixhQUFhRyxLQUFLLENBQUNNLE1BQU0sR0FBRztRQUM1QlQsYUFBYUcsS0FBSyxDQUFDTyxJQUFJLEdBQUc7UUFDMUJWLGFBQWFXLFlBQVksQ0FBRSxlQUFlLFNBQVUsc0NBQXNDO1FBQzFGYixJQUFJYyxPQUFPLENBQUNDLFVBQVUsQ0FBQ0MsV0FBVyxDQUFFZDtRQUVwQyx1RkFBdUY7UUFDdkZGLElBQUlpQixtQkFBbUIsQ0FBQ0MsV0FBVyxDQUFFO1lBQ25DLElBQUtsQixJQUFJbUIsWUFBWSxHQUFHLFNBQVMsR0FBSTtnQkFDbkN0QixRQUFRLENBQUNBO2dCQUNUSyxhQUFha0IsU0FBUyxHQUFHLEdBQUd2QixPQUFPO1lBQ3JDO1FBQ0Y7SUFDRjtBQUNGO0FBRUFGLE1BQU0wQixRQUFRLENBQUUsYUFBYXZCO0FBRTdCLGVBQWVBLFVBQVUifQ==