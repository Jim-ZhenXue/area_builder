// Copyright 2014-2022, University of Colorado Boulder
/**
 * Stitcher that rebuilds all of the blocks and reattaches drawables. Simple, but inefficient.
 *
 * Kept for now as a run-time comparison and baseline for the GreedyStitcher or any other more advanced (but
 * more error-prone) stitching process.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ import { Renderer, scenery, Stitcher } from '../imports.js';
let RebuildStitcher = class RebuildStitcher extends Stitcher {
    /**
   * Main stitch entry point, called directly from the backbone or cache. We are modifying our backbone's blocks and
   * their attached drawables.
   * @public
   *
   * @param {BackboneDrawable} backbone
   * @param {Drawable|null} firstStitchDrawable
   * @param {Drawable|null} lastStitchDrawable
   * @param {Drawable|null} oldFirstStitchDrawable
   * @param {Drawable|null} oldLastStitchDrawable
   * @param {ChangeInterval} firstChangeInterval
   * @param {ChangeInterval} lastChangeInterval
   */ stitch(backbone, firstDrawable, lastDrawable, oldFirstDrawable, oldLastDrawable, firstChangeInterval, lastChangeInterval) {
        this.initialize(backbone, firstDrawable, lastDrawable, oldFirstDrawable, oldLastDrawable, firstChangeInterval, lastChangeInterval);
        for(let d = backbone.previousFirstDrawable; d !== null; d = d.oldNextDrawable){
            this.notePendingRemoval(d);
            if (d === backbone.previousLastDrawable) {
                break;
            }
        }
        this.recordBackboneBoundaries();
        this.removeAllBlocks();
        let currentBlock = null;
        let currentRenderer = 0;
        let firstDrawableForBlock = null;
        // linked-list iteration inclusively from firstDrawable to lastDrawable
        for(let drawable = firstDrawable; drawable !== null; drawable = drawable.nextDrawable){
            // if we need to switch to a new block, create it
            if (!currentBlock || drawable.renderer !== currentRenderer) {
                if (currentBlock) {
                    this.notifyInterval(currentBlock, firstDrawableForBlock, drawable.previousDrawable);
                }
                currentRenderer = drawable.renderer;
                currentBlock = this.createBlock(currentRenderer, drawable);
                if (Renderer.isDOM(currentRenderer)) {
                    currentRenderer = 0;
                }
                this.appendBlock(currentBlock);
                firstDrawableForBlock = drawable;
            }
            this.notePendingAddition(drawable, currentBlock);
            // don't cause an infinite loop!
            if (drawable === lastDrawable) {
                break;
            }
        }
        if (currentBlock) {
            this.notifyInterval(currentBlock, firstDrawableForBlock, lastDrawable);
        }
        this.reindex();
        this.clean();
    }
};
scenery.register('RebuildStitcher', RebuildStitcher);
export default RebuildStitcher;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvZGlzcGxheS9SZWJ1aWxkU3RpdGNoZXIuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTQtMjAyMiwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbi8qKlxuICogU3RpdGNoZXIgdGhhdCByZWJ1aWxkcyBhbGwgb2YgdGhlIGJsb2NrcyBhbmQgcmVhdHRhY2hlcyBkcmF3YWJsZXMuIFNpbXBsZSwgYnV0IGluZWZmaWNpZW50LlxuICpcbiAqIEtlcHQgZm9yIG5vdyBhcyBhIHJ1bi10aW1lIGNvbXBhcmlzb24gYW5kIGJhc2VsaW5lIGZvciB0aGUgR3JlZWR5U3RpdGNoZXIgb3IgYW55IG90aGVyIG1vcmUgYWR2YW5jZWQgKGJ1dFxuICogbW9yZSBlcnJvci1wcm9uZSkgc3RpdGNoaW5nIHByb2Nlc3MuXG4gKlxuICogQGF1dGhvciBKb25hdGhhbiBPbHNvbiA8am9uYXRoYW4ub2xzb25AY29sb3JhZG8uZWR1PlxuICovXG5cbmltcG9ydCB7IFJlbmRlcmVyLCBzY2VuZXJ5LCBTdGl0Y2hlciB9IGZyb20gJy4uL2ltcG9ydHMuanMnO1xuXG5jbGFzcyBSZWJ1aWxkU3RpdGNoZXIgZXh0ZW5kcyBTdGl0Y2hlciB7XG4gIC8qKlxuICAgKiBNYWluIHN0aXRjaCBlbnRyeSBwb2ludCwgY2FsbGVkIGRpcmVjdGx5IGZyb20gdGhlIGJhY2tib25lIG9yIGNhY2hlLiBXZSBhcmUgbW9kaWZ5aW5nIG91ciBiYWNrYm9uZSdzIGJsb2NrcyBhbmRcbiAgICogdGhlaXIgYXR0YWNoZWQgZHJhd2FibGVzLlxuICAgKiBAcHVibGljXG4gICAqXG4gICAqIEBwYXJhbSB7QmFja2JvbmVEcmF3YWJsZX0gYmFja2JvbmVcbiAgICogQHBhcmFtIHtEcmF3YWJsZXxudWxsfSBmaXJzdFN0aXRjaERyYXdhYmxlXG4gICAqIEBwYXJhbSB7RHJhd2FibGV8bnVsbH0gbGFzdFN0aXRjaERyYXdhYmxlXG4gICAqIEBwYXJhbSB7RHJhd2FibGV8bnVsbH0gb2xkRmlyc3RTdGl0Y2hEcmF3YWJsZVxuICAgKiBAcGFyYW0ge0RyYXdhYmxlfG51bGx9IG9sZExhc3RTdGl0Y2hEcmF3YWJsZVxuICAgKiBAcGFyYW0ge0NoYW5nZUludGVydmFsfSBmaXJzdENoYW5nZUludGVydmFsXG4gICAqIEBwYXJhbSB7Q2hhbmdlSW50ZXJ2YWx9IGxhc3RDaGFuZ2VJbnRlcnZhbFxuICAgKi9cbiAgc3RpdGNoKCBiYWNrYm9uZSwgZmlyc3REcmF3YWJsZSwgbGFzdERyYXdhYmxlLCBvbGRGaXJzdERyYXdhYmxlLCBvbGRMYXN0RHJhd2FibGUsIGZpcnN0Q2hhbmdlSW50ZXJ2YWwsIGxhc3RDaGFuZ2VJbnRlcnZhbCApIHtcbiAgICB0aGlzLmluaXRpYWxpemUoIGJhY2tib25lLCBmaXJzdERyYXdhYmxlLCBsYXN0RHJhd2FibGUsIG9sZEZpcnN0RHJhd2FibGUsIG9sZExhc3REcmF3YWJsZSwgZmlyc3RDaGFuZ2VJbnRlcnZhbCwgbGFzdENoYW5nZUludGVydmFsICk7XG5cbiAgICBmb3IgKCBsZXQgZCA9IGJhY2tib25lLnByZXZpb3VzRmlyc3REcmF3YWJsZTsgZCAhPT0gbnVsbDsgZCA9IGQub2xkTmV4dERyYXdhYmxlICkge1xuICAgICAgdGhpcy5ub3RlUGVuZGluZ1JlbW92YWwoIGQgKTtcbiAgICAgIGlmICggZCA9PT0gYmFja2JvbmUucHJldmlvdXNMYXN0RHJhd2FibGUgKSB7IGJyZWFrOyB9XG4gICAgfVxuXG4gICAgdGhpcy5yZWNvcmRCYWNrYm9uZUJvdW5kYXJpZXMoKTtcblxuICAgIHRoaXMucmVtb3ZlQWxsQmxvY2tzKCk7XG5cbiAgICBsZXQgY3VycmVudEJsb2NrID0gbnVsbDtcbiAgICBsZXQgY3VycmVudFJlbmRlcmVyID0gMDtcbiAgICBsZXQgZmlyc3REcmF3YWJsZUZvckJsb2NrID0gbnVsbDtcblxuICAgIC8vIGxpbmtlZC1saXN0IGl0ZXJhdGlvbiBpbmNsdXNpdmVseSBmcm9tIGZpcnN0RHJhd2FibGUgdG8gbGFzdERyYXdhYmxlXG4gICAgZm9yICggbGV0IGRyYXdhYmxlID0gZmlyc3REcmF3YWJsZTsgZHJhd2FibGUgIT09IG51bGw7IGRyYXdhYmxlID0gZHJhd2FibGUubmV4dERyYXdhYmxlICkge1xuXG4gICAgICAvLyBpZiB3ZSBuZWVkIHRvIHN3aXRjaCB0byBhIG5ldyBibG9jaywgY3JlYXRlIGl0XG4gICAgICBpZiAoICFjdXJyZW50QmxvY2sgfHwgZHJhd2FibGUucmVuZGVyZXIgIT09IGN1cnJlbnRSZW5kZXJlciApIHtcbiAgICAgICAgaWYgKCBjdXJyZW50QmxvY2sgKSB7XG4gICAgICAgICAgdGhpcy5ub3RpZnlJbnRlcnZhbCggY3VycmVudEJsb2NrLCBmaXJzdERyYXdhYmxlRm9yQmxvY2ssIGRyYXdhYmxlLnByZXZpb3VzRHJhd2FibGUgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGN1cnJlbnRSZW5kZXJlciA9IGRyYXdhYmxlLnJlbmRlcmVyO1xuXG4gICAgICAgIGN1cnJlbnRCbG9jayA9IHRoaXMuY3JlYXRlQmxvY2soIGN1cnJlbnRSZW5kZXJlciwgZHJhd2FibGUgKTtcbiAgICAgICAgaWYgKCBSZW5kZXJlci5pc0RPTSggY3VycmVudFJlbmRlcmVyICkgKSB7XG4gICAgICAgICAgY3VycmVudFJlbmRlcmVyID0gMDtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuYXBwZW5kQmxvY2soIGN1cnJlbnRCbG9jayApO1xuXG4gICAgICAgIGZpcnN0RHJhd2FibGVGb3JCbG9jayA9IGRyYXdhYmxlO1xuICAgICAgfVxuXG4gICAgICB0aGlzLm5vdGVQZW5kaW5nQWRkaXRpb24oIGRyYXdhYmxlLCBjdXJyZW50QmxvY2sgKTtcblxuICAgICAgLy8gZG9uJ3QgY2F1c2UgYW4gaW5maW5pdGUgbG9vcCFcbiAgICAgIGlmICggZHJhd2FibGUgPT09IGxhc3REcmF3YWJsZSApIHsgYnJlYWs7IH1cbiAgICB9XG4gICAgaWYgKCBjdXJyZW50QmxvY2sgKSB7XG4gICAgICB0aGlzLm5vdGlmeUludGVydmFsKCBjdXJyZW50QmxvY2ssIGZpcnN0RHJhd2FibGVGb3JCbG9jaywgbGFzdERyYXdhYmxlICk7XG4gICAgfVxuXG4gICAgdGhpcy5yZWluZGV4KCk7XG5cbiAgICB0aGlzLmNsZWFuKCk7XG4gIH1cbn1cblxuc2NlbmVyeS5yZWdpc3RlciggJ1JlYnVpbGRTdGl0Y2hlcicsIFJlYnVpbGRTdGl0Y2hlciApO1xuXG5leHBvcnQgZGVmYXVsdCBSZWJ1aWxkU3RpdGNoZXI7Il0sIm5hbWVzIjpbIlJlbmRlcmVyIiwic2NlbmVyeSIsIlN0aXRjaGVyIiwiUmVidWlsZFN0aXRjaGVyIiwic3RpdGNoIiwiYmFja2JvbmUiLCJmaXJzdERyYXdhYmxlIiwibGFzdERyYXdhYmxlIiwib2xkRmlyc3REcmF3YWJsZSIsIm9sZExhc3REcmF3YWJsZSIsImZpcnN0Q2hhbmdlSW50ZXJ2YWwiLCJsYXN0Q2hhbmdlSW50ZXJ2YWwiLCJpbml0aWFsaXplIiwiZCIsInByZXZpb3VzRmlyc3REcmF3YWJsZSIsIm9sZE5leHREcmF3YWJsZSIsIm5vdGVQZW5kaW5nUmVtb3ZhbCIsInByZXZpb3VzTGFzdERyYXdhYmxlIiwicmVjb3JkQmFja2JvbmVCb3VuZGFyaWVzIiwicmVtb3ZlQWxsQmxvY2tzIiwiY3VycmVudEJsb2NrIiwiY3VycmVudFJlbmRlcmVyIiwiZmlyc3REcmF3YWJsZUZvckJsb2NrIiwiZHJhd2FibGUiLCJuZXh0RHJhd2FibGUiLCJyZW5kZXJlciIsIm5vdGlmeUludGVydmFsIiwicHJldmlvdXNEcmF3YWJsZSIsImNyZWF0ZUJsb2NrIiwiaXNET00iLCJhcHBlbmRCbG9jayIsIm5vdGVQZW5kaW5nQWRkaXRpb24iLCJyZWluZGV4IiwiY2xlYW4iLCJyZWdpc3RlciJdLCJtYXBwaW5ncyI6IkFBQUEsc0RBQXNEO0FBRXREOzs7Ozs7O0NBT0MsR0FFRCxTQUFTQSxRQUFRLEVBQUVDLE9BQU8sRUFBRUMsUUFBUSxRQUFRLGdCQUFnQjtBQUU1RCxJQUFBLEFBQU1DLGtCQUFOLE1BQU1BLHdCQUF3QkQ7SUFDNUI7Ozs7Ozs7Ozs7OztHQVlDLEdBQ0RFLE9BQVFDLFFBQVEsRUFBRUMsYUFBYSxFQUFFQyxZQUFZLEVBQUVDLGdCQUFnQixFQUFFQyxlQUFlLEVBQUVDLG1CQUFtQixFQUFFQyxrQkFBa0IsRUFBRztRQUMxSCxJQUFJLENBQUNDLFVBQVUsQ0FBRVAsVUFBVUMsZUFBZUMsY0FBY0Msa0JBQWtCQyxpQkFBaUJDLHFCQUFxQkM7UUFFaEgsSUFBTSxJQUFJRSxJQUFJUixTQUFTUyxxQkFBcUIsRUFBRUQsTUFBTSxNQUFNQSxJQUFJQSxFQUFFRSxlQUFlLENBQUc7WUFDaEYsSUFBSSxDQUFDQyxrQkFBa0IsQ0FBRUg7WUFDekIsSUFBS0EsTUFBTVIsU0FBU1ksb0JBQW9CLEVBQUc7Z0JBQUU7WUFBTztRQUN0RDtRQUVBLElBQUksQ0FBQ0Msd0JBQXdCO1FBRTdCLElBQUksQ0FBQ0MsZUFBZTtRQUVwQixJQUFJQyxlQUFlO1FBQ25CLElBQUlDLGtCQUFrQjtRQUN0QixJQUFJQyx3QkFBd0I7UUFFNUIsdUVBQXVFO1FBQ3ZFLElBQU0sSUFBSUMsV0FBV2pCLGVBQWVpQixhQUFhLE1BQU1BLFdBQVdBLFNBQVNDLFlBQVksQ0FBRztZQUV4RixpREFBaUQ7WUFDakQsSUFBSyxDQUFDSixnQkFBZ0JHLFNBQVNFLFFBQVEsS0FBS0osaUJBQWtCO2dCQUM1RCxJQUFLRCxjQUFlO29CQUNsQixJQUFJLENBQUNNLGNBQWMsQ0FBRU4sY0FBY0UsdUJBQXVCQyxTQUFTSSxnQkFBZ0I7Z0JBQ3JGO2dCQUVBTixrQkFBa0JFLFNBQVNFLFFBQVE7Z0JBRW5DTCxlQUFlLElBQUksQ0FBQ1EsV0FBVyxDQUFFUCxpQkFBaUJFO2dCQUNsRCxJQUFLdkIsU0FBUzZCLEtBQUssQ0FBRVIsa0JBQW9CO29CQUN2Q0Esa0JBQWtCO2dCQUNwQjtnQkFFQSxJQUFJLENBQUNTLFdBQVcsQ0FBRVY7Z0JBRWxCRSx3QkFBd0JDO1lBQzFCO1lBRUEsSUFBSSxDQUFDUSxtQkFBbUIsQ0FBRVIsVUFBVUg7WUFFcEMsZ0NBQWdDO1lBQ2hDLElBQUtHLGFBQWFoQixjQUFlO2dCQUFFO1lBQU87UUFDNUM7UUFDQSxJQUFLYSxjQUFlO1lBQ2xCLElBQUksQ0FBQ00sY0FBYyxDQUFFTixjQUFjRSx1QkFBdUJmO1FBQzVEO1FBRUEsSUFBSSxDQUFDeUIsT0FBTztRQUVaLElBQUksQ0FBQ0MsS0FBSztJQUNaO0FBQ0Y7QUFFQWhDLFFBQVFpQyxRQUFRLENBQUUsbUJBQW1CL0I7QUFFckMsZUFBZUEsZ0JBQWdCIn0=