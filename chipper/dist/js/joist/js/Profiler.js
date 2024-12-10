// Copyright 2014-2022, University of Colorado Boulder
/**
 * This minimalistic profiler is meant to help understand the time spent in running a PhET simulation.
 * It was designed to be minimally invasive, so it won't alter the simulation's performance significantly.
 * Note: just showing the average FPS or ms/frame is not sufficient, since we need to see when garbage collections
 * happen, which are typically a spike in a single frame.  Hence, the data is shown as a histogram. Data that
 * doesn't fit in the histogram appears in an optional 'longTimes' field.
 *
 * When a sim is run with ?profiler, output is displayed in the upper-left corner of the browser window, and updates
 * every 60 frames.
 *
 * The general format is:
 *
 * FPS - ms/frame - histogram [- longTimes]
 *
 * Here's an example:
 *
 * 48 FPS - 21ms/frame - 0,0,5,0,0,0,0,0,1,0,0,0,0,3,1,3,18,19,5,3,1,0,1,0,0,0,0,1,0,0 - 50,37,217
 *
 * The histogram field is a sequence of 30 numbers, for 0-29ms. Each number indicates the number of frames that took
 * that amount of time. In the above example, histogram[2] is 5; there were 5 frames that took 2ms.
 *
 * The longTimes field is the set of frame times that exceeded 29ms, and thus don't fit in the histogram.
 * If 2 frames took 37ms, then 37ms will appear twice.  If no frames exceeded 29ms, then this field will be absent.
 * These values are sorted in descending order, so you can easily identify the largest frame time.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Chris Malley (PixelZoom, Inc.)
 */ import Utils from '../../dot/js/Utils.js';
import joist from './joist.js';
// constants
const FIELD_SEPARATOR = ' \u2014 '; // em dash, a long horizontal dash
const HISTOGRAM_LENGTH = 30;
let Profiler = class Profiler {
    static start(sim) {
        const profiler = new Profiler();
        sim.frameStartedEmitter.addListener(()=>profiler.frameStarted());
        sim.frameEndedEmitter.addListener(()=>profiler.frameEnded());
    }
    frameStarted() {
        this.frameStartTime = Date.now();
    }
    frameEnded() {
        // update the display every 60 frames
        if (this.allTimes.length > 0 && this.allTimes.length % 60 === 0) {
            let totalTime = 0;
            for(let i = 0; i < this.allTimes.length; i++){
                totalTime += this.allTimes[i];
            }
            // FPS
            const averageFPS = Utils.roundSymmetric(1000 / (totalTime / this.allTimes.length));
            let text = `${averageFPS} FPS`;
            // ms/frame
            const averageFrameTime = Utils.roundSymmetric(totalTime / this.allTimes.length);
            text = `${text + FIELD_SEPARATOR + averageFrameTime}ms/frame`;
            // histogram
            text = text + FIELD_SEPARATOR + this.histogram;
            // longTimes
            if (this.longTimes.length > 0) {
                this.longTimes.sort((a, b)=>b - a); // sort longTimes in descending order
                text = text + FIELD_SEPARATOR + this.longTimes;
            }
            // update the display
            $('#phetProfiler').html(text);
            // clear data structures
            for(let i = 0; i < HISTOGRAM_LENGTH; i++){
                this.histogram[i] = 0;
            }
            this.longTimes.length = 0;
            this.allTimes.length = 0;
        }
        // record data for the current frame, skip first frame because we can't compute its dt
        if (this.previousFrameStartTime) {
            const dt = this.frameStartTime - this.previousFrameStartTime;
            this.allTimes.push(dt);
            if (dt < HISTOGRAM_LENGTH) {
                this.histogram[dt]++; // increment the histogram cell for the corresponding time
            } else {
                this.longTimes.push(dt); // time doesn't fit in histogram, record in longTimes
            }
        }
        this.previousFrameStartTime = this.frameStartTime;
    }
    constructor(){
        // These data structured were chosen to minimize CPU time.
        this.allTimes = [] // {number[]} times for all frames, in ms
        ;
        this.histogram = [] // {number[]} array index corresponds to number of ms, value is number of frames at that time
        ;
        this.longTimes = [] // {number[]} any frame times that didn't fit in histogram
        ;
        this.frameStartTime = 0 // {number} start time of the current frame
        ;
        this.previousFrameStartTime = 0 // {number} start time of the previous frame
        ;
        // initialize histogram
        for(let i = 0; i < HISTOGRAM_LENGTH; i++){
            this.histogram.push(0);
        }
        // this is where the profiler displays its output
        $('body').append('<div style="z-index: 99999999;position: absolute;color:red; left: 10px;" id="phetProfiler" ></div>');
    }
};
joist.register('Profiler', Profiler);
export default Profiler;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2pvaXN0L2pzL1Byb2ZpbGVyLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE0LTIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIFRoaXMgbWluaW1hbGlzdGljIHByb2ZpbGVyIGlzIG1lYW50IHRvIGhlbHAgdW5kZXJzdGFuZCB0aGUgdGltZSBzcGVudCBpbiBydW5uaW5nIGEgUGhFVCBzaW11bGF0aW9uLlxuICogSXQgd2FzIGRlc2lnbmVkIHRvIGJlIG1pbmltYWxseSBpbnZhc2l2ZSwgc28gaXQgd29uJ3QgYWx0ZXIgdGhlIHNpbXVsYXRpb24ncyBwZXJmb3JtYW5jZSBzaWduaWZpY2FudGx5LlxuICogTm90ZToganVzdCBzaG93aW5nIHRoZSBhdmVyYWdlIEZQUyBvciBtcy9mcmFtZSBpcyBub3Qgc3VmZmljaWVudCwgc2luY2Ugd2UgbmVlZCB0byBzZWUgd2hlbiBnYXJiYWdlIGNvbGxlY3Rpb25zXG4gKiBoYXBwZW4sIHdoaWNoIGFyZSB0eXBpY2FsbHkgYSBzcGlrZSBpbiBhIHNpbmdsZSBmcmFtZS4gIEhlbmNlLCB0aGUgZGF0YSBpcyBzaG93biBhcyBhIGhpc3RvZ3JhbS4gRGF0YSB0aGF0XG4gKiBkb2Vzbid0IGZpdCBpbiB0aGUgaGlzdG9ncmFtIGFwcGVhcnMgaW4gYW4gb3B0aW9uYWwgJ2xvbmdUaW1lcycgZmllbGQuXG4gKlxuICogV2hlbiBhIHNpbSBpcyBydW4gd2l0aCA/cHJvZmlsZXIsIG91dHB1dCBpcyBkaXNwbGF5ZWQgaW4gdGhlIHVwcGVyLWxlZnQgY29ybmVyIG9mIHRoZSBicm93c2VyIHdpbmRvdywgYW5kIHVwZGF0ZXNcbiAqIGV2ZXJ5IDYwIGZyYW1lcy5cbiAqXG4gKiBUaGUgZ2VuZXJhbCBmb3JtYXQgaXM6XG4gKlxuICogRlBTIC0gbXMvZnJhbWUgLSBoaXN0b2dyYW0gWy0gbG9uZ1RpbWVzXVxuICpcbiAqIEhlcmUncyBhbiBleGFtcGxlOlxuICpcbiAqIDQ4IEZQUyAtIDIxbXMvZnJhbWUgLSAwLDAsNSwwLDAsMCwwLDAsMSwwLDAsMCwwLDMsMSwzLDE4LDE5LDUsMywxLDAsMSwwLDAsMCwwLDEsMCwwIC0gNTAsMzcsMjE3XG4gKlxuICogVGhlIGhpc3RvZ3JhbSBmaWVsZCBpcyBhIHNlcXVlbmNlIG9mIDMwIG51bWJlcnMsIGZvciAwLTI5bXMuIEVhY2ggbnVtYmVyIGluZGljYXRlcyB0aGUgbnVtYmVyIG9mIGZyYW1lcyB0aGF0IHRvb2tcbiAqIHRoYXQgYW1vdW50IG9mIHRpbWUuIEluIHRoZSBhYm92ZSBleGFtcGxlLCBoaXN0b2dyYW1bMl0gaXMgNTsgdGhlcmUgd2VyZSA1IGZyYW1lcyB0aGF0IHRvb2sgMm1zLlxuICpcbiAqIFRoZSBsb25nVGltZXMgZmllbGQgaXMgdGhlIHNldCBvZiBmcmFtZSB0aW1lcyB0aGF0IGV4Y2VlZGVkIDI5bXMsIGFuZCB0aHVzIGRvbid0IGZpdCBpbiB0aGUgaGlzdG9ncmFtLlxuICogSWYgMiBmcmFtZXMgdG9vayAzN21zLCB0aGVuIDM3bXMgd2lsbCBhcHBlYXIgdHdpY2UuICBJZiBubyBmcmFtZXMgZXhjZWVkZWQgMjltcywgdGhlbiB0aGlzIGZpZWxkIHdpbGwgYmUgYWJzZW50LlxuICogVGhlc2UgdmFsdWVzIGFyZSBzb3J0ZWQgaW4gZGVzY2VuZGluZyBvcmRlciwgc28geW91IGNhbiBlYXNpbHkgaWRlbnRpZnkgdGhlIGxhcmdlc3QgZnJhbWUgdGltZS5cbiAqXG4gKiBAYXV0aG9yIFNhbSBSZWlkIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxuICogQGF1dGhvciBDaHJpcyBNYWxsZXkgKFBpeGVsWm9vbSwgSW5jLilcbiAqL1xuXG5pbXBvcnQgVXRpbHMgZnJvbSAnLi4vLi4vZG90L2pzL1V0aWxzLmpzJztcbmltcG9ydCBqb2lzdCBmcm9tICcuL2pvaXN0LmpzJztcbmltcG9ydCBTaW0gZnJvbSAnLi9TaW0uanMnO1xuXG4vLyBjb25zdGFudHNcbmNvbnN0IEZJRUxEX1NFUEFSQVRPUiA9ICcgXFx1MjAxNCAnOyAvLyBlbSBkYXNoLCBhIGxvbmcgaG9yaXpvbnRhbCBkYXNoXG5jb25zdCBISVNUT0dSQU1fTEVOR1RIID0gMzA7XG5cbmNsYXNzIFByb2ZpbGVyIHtcblxuXG4gIC8vIFRoZXNlIGRhdGEgc3RydWN0dXJlZCB3ZXJlIGNob3NlbiB0byBtaW5pbWl6ZSBDUFUgdGltZS5cbiAgcHJpdmF0ZSByZWFkb25seSBhbGxUaW1lczogbnVtYmVyW10gPSBbXTsgLy8ge251bWJlcltdfSB0aW1lcyBmb3IgYWxsIGZyYW1lcywgaW4gbXNcbiAgcHJpdmF0ZSByZWFkb25seSBoaXN0b2dyYW06IG51bWJlcltdID0gW107IC8vIHtudW1iZXJbXX0gYXJyYXkgaW5kZXggY29ycmVzcG9uZHMgdG8gbnVtYmVyIG9mIG1zLCB2YWx1ZSBpcyBudW1iZXIgb2YgZnJhbWVzIGF0IHRoYXQgdGltZVxuICBwcml2YXRlIHJlYWRvbmx5IGxvbmdUaW1lczogbnVtYmVyW10gPSBbXTsgLy8ge251bWJlcltdfSBhbnkgZnJhbWUgdGltZXMgdGhhdCBkaWRuJ3QgZml0IGluIGhpc3RvZ3JhbVxuICBwcml2YXRlIGZyYW1lU3RhcnRUaW1lID0gMDsgLy8ge251bWJlcn0gc3RhcnQgdGltZSBvZiB0aGUgY3VycmVudCBmcmFtZVxuICBwcml2YXRlIHByZXZpb3VzRnJhbWVTdGFydFRpbWUgPSAwOyAvLyB7bnVtYmVyfSBzdGFydCB0aW1lIG9mIHRoZSBwcmV2aW91cyBmcmFtZVxuXG4gIHB1YmxpYyBjb25zdHJ1Y3RvcigpIHtcblxuICAgIC8vIGluaXRpYWxpemUgaGlzdG9ncmFtXG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgSElTVE9HUkFNX0xFTkdUSDsgaSsrICkge1xuICAgICAgdGhpcy5oaXN0b2dyYW0ucHVzaCggMCApO1xuICAgIH1cblxuICAgIC8vIHRoaXMgaXMgd2hlcmUgdGhlIHByb2ZpbGVyIGRpc3BsYXlzIGl0cyBvdXRwdXRcbiAgICAkKCAnYm9keScgKS5hcHBlbmQoICc8ZGl2IHN0eWxlPVwiei1pbmRleDogOTk5OTk5OTk7cG9zaXRpb246IGFic29sdXRlO2NvbG9yOnJlZDsgbGVmdDogMTBweDtcIiBpZD1cInBoZXRQcm9maWxlclwiID48L2Rpdj4nICk7XG4gIH1cblxuICBwdWJsaWMgc3RhdGljIHN0YXJ0KCBzaW06IFNpbSApOiB2b2lkIHtcbiAgICBjb25zdCBwcm9maWxlciA9IG5ldyBQcm9maWxlcigpO1xuICAgIHNpbS5mcmFtZVN0YXJ0ZWRFbWl0dGVyLmFkZExpc3RlbmVyKCAoKSA9PiBwcm9maWxlci5mcmFtZVN0YXJ0ZWQoKSApO1xuICAgIHNpbS5mcmFtZUVuZGVkRW1pdHRlci5hZGRMaXN0ZW5lciggKCkgPT4gcHJvZmlsZXIuZnJhbWVFbmRlZCgpICk7XG4gIH1cblxuICBwcml2YXRlIGZyYW1lU3RhcnRlZCgpOiB2b2lkIHtcbiAgICB0aGlzLmZyYW1lU3RhcnRUaW1lID0gRGF0ZS5ub3coKTtcbiAgfVxuXG4gIHByaXZhdGUgZnJhbWVFbmRlZCgpOiB2b2lkIHtcblxuICAgIC8vIHVwZGF0ZSB0aGUgZGlzcGxheSBldmVyeSA2MCBmcmFtZXNcbiAgICBpZiAoIHRoaXMuYWxsVGltZXMubGVuZ3RoID4gMCAmJiB0aGlzLmFsbFRpbWVzLmxlbmd0aCAlIDYwID09PSAwICkge1xuXG4gICAgICBsZXQgdG90YWxUaW1lID0gMDtcbiAgICAgIGZvciAoIGxldCBpID0gMDsgaSA8IHRoaXMuYWxsVGltZXMubGVuZ3RoOyBpKysgKSB7XG4gICAgICAgIHRvdGFsVGltZSArPSB0aGlzLmFsbFRpbWVzWyBpIF07XG4gICAgICB9XG5cbiAgICAgIC8vIEZQU1xuICAgICAgY29uc3QgYXZlcmFnZUZQUyA9IFV0aWxzLnJvdW5kU3ltbWV0cmljKCAxMDAwIC8gKCB0b3RhbFRpbWUgLyB0aGlzLmFsbFRpbWVzLmxlbmd0aCApICk7XG4gICAgICBsZXQgdGV4dCA9IGAke2F2ZXJhZ2VGUFN9IEZQU2A7XG5cbiAgICAgIC8vIG1zL2ZyYW1lXG4gICAgICBjb25zdCBhdmVyYWdlRnJhbWVUaW1lID0gVXRpbHMucm91bmRTeW1tZXRyaWMoIHRvdGFsVGltZSAvIHRoaXMuYWxsVGltZXMubGVuZ3RoICk7XG4gICAgICB0ZXh0ID0gYCR7dGV4dCArIEZJRUxEX1NFUEFSQVRPUiArIGF2ZXJhZ2VGcmFtZVRpbWV9bXMvZnJhbWVgO1xuXG4gICAgICAvLyBoaXN0b2dyYW1cbiAgICAgIHRleHQgPSB0ZXh0ICsgRklFTERfU0VQQVJBVE9SICsgdGhpcy5oaXN0b2dyYW07XG5cbiAgICAgIC8vIGxvbmdUaW1lc1xuICAgICAgaWYgKCB0aGlzLmxvbmdUaW1lcy5sZW5ndGggPiAwICkge1xuICAgICAgICB0aGlzLmxvbmdUaW1lcy5zb3J0KCAoIGEsIGIgKSA9PiAoIGIgLSBhICkgKTsgLy8gc29ydCBsb25nVGltZXMgaW4gZGVzY2VuZGluZyBvcmRlclxuICAgICAgICB0ZXh0ID0gdGV4dCArIEZJRUxEX1NFUEFSQVRPUiArIHRoaXMubG9uZ1RpbWVzO1xuICAgICAgfVxuXG4gICAgICAvLyB1cGRhdGUgdGhlIGRpc3BsYXlcbiAgICAgICQoICcjcGhldFByb2ZpbGVyJyApLmh0bWwoIHRleHQgKTtcblxuICAgICAgLy8gY2xlYXIgZGF0YSBzdHJ1Y3R1cmVzXG4gICAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBISVNUT0dSQU1fTEVOR1RIOyBpKysgKSB7XG4gICAgICAgIHRoaXMuaGlzdG9ncmFtWyBpIF0gPSAwO1xuICAgICAgfVxuICAgICAgdGhpcy5sb25nVGltZXMubGVuZ3RoID0gMDtcbiAgICAgIHRoaXMuYWxsVGltZXMubGVuZ3RoID0gMDtcbiAgICB9XG5cbiAgICAvLyByZWNvcmQgZGF0YSBmb3IgdGhlIGN1cnJlbnQgZnJhbWUsIHNraXAgZmlyc3QgZnJhbWUgYmVjYXVzZSB3ZSBjYW4ndCBjb21wdXRlIGl0cyBkdFxuICAgIGlmICggdGhpcy5wcmV2aW91c0ZyYW1lU3RhcnRUaW1lICkge1xuICAgICAgY29uc3QgZHQgPSB0aGlzLmZyYW1lU3RhcnRUaW1lIC0gdGhpcy5wcmV2aW91c0ZyYW1lU3RhcnRUaW1lO1xuICAgICAgdGhpcy5hbGxUaW1lcy5wdXNoKCBkdCApO1xuICAgICAgaWYgKCBkdCA8IEhJU1RPR1JBTV9MRU5HVEggKSB7XG4gICAgICAgIHRoaXMuaGlzdG9ncmFtWyBkdCBdKys7IC8vIGluY3JlbWVudCB0aGUgaGlzdG9ncmFtIGNlbGwgZm9yIHRoZSBjb3JyZXNwb25kaW5nIHRpbWVcbiAgICAgIH1cbiAgICAgIGVsc2Uge1xuICAgICAgICB0aGlzLmxvbmdUaW1lcy5wdXNoKCBkdCApOyAvLyB0aW1lIGRvZXNuJ3QgZml0IGluIGhpc3RvZ3JhbSwgcmVjb3JkIGluIGxvbmdUaW1lc1xuICAgICAgfVxuICAgIH1cblxuICAgIHRoaXMucHJldmlvdXNGcmFtZVN0YXJ0VGltZSA9IHRoaXMuZnJhbWVTdGFydFRpbWU7XG4gIH1cbn1cblxuam9pc3QucmVnaXN0ZXIoICdQcm9maWxlcicsIFByb2ZpbGVyICk7XG5leHBvcnQgZGVmYXVsdCBQcm9maWxlcjsiXSwibmFtZXMiOlsiVXRpbHMiLCJqb2lzdCIsIkZJRUxEX1NFUEFSQVRPUiIsIkhJU1RPR1JBTV9MRU5HVEgiLCJQcm9maWxlciIsInN0YXJ0Iiwic2ltIiwicHJvZmlsZXIiLCJmcmFtZVN0YXJ0ZWRFbWl0dGVyIiwiYWRkTGlzdGVuZXIiLCJmcmFtZVN0YXJ0ZWQiLCJmcmFtZUVuZGVkRW1pdHRlciIsImZyYW1lRW5kZWQiLCJmcmFtZVN0YXJ0VGltZSIsIkRhdGUiLCJub3ciLCJhbGxUaW1lcyIsImxlbmd0aCIsInRvdGFsVGltZSIsImkiLCJhdmVyYWdlRlBTIiwicm91bmRTeW1tZXRyaWMiLCJ0ZXh0IiwiYXZlcmFnZUZyYW1lVGltZSIsImhpc3RvZ3JhbSIsImxvbmdUaW1lcyIsInNvcnQiLCJhIiwiYiIsIiQiLCJodG1sIiwicHJldmlvdXNGcmFtZVN0YXJ0VGltZSIsImR0IiwicHVzaCIsImFwcGVuZCIsInJlZ2lzdGVyIl0sIm1hcHBpbmdzIjoiQUFBQSxzREFBc0Q7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