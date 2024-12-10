// Copyright 2019-2023, University of Colorado Boulder
/**
 * DebugLoggerText is a node that can be added as a child to the view and can show debug log messages.
 * This is most often used when a console is not available, such as when debugging on iPads or other tablets.
 *
 * Typically, an instance of this is created and made global for use on a given screen.  Example:
 *   phet.debugLoggerNode = new DebugLoggerText();
 *   this.addChild( phet.debugLoggerNode );
 *
 * ...and then logging is accomplished by calling the logger like this:
 *   phet.debugLoggerNode.log( 'my insightful message' );
 *
 * Tip from MK - start by putting the above line in assert.js
 *
 * @author John Blanco (PhET Interactive Simulations)
 */ import Vector2 from '../../dot/js/Vector2.js';
import merge from '../../phet-core/js/merge.js';
import { Color, RichText } from '../../scenery/js/imports.js';
import PhetFont from './PhetFont.js';
import sceneryPhet from './sceneryPhet.js';
// constants
const DEFAULT_NUM_MESSAGES = 4;
const DEFAULT_POSITION = new Vector2(20, 20);
const DEFAULT_FONT = new PhetFont(20);
const DEFAULT_TEXT_COLOR = Color.red;
let DebugLoggerText = class DebugLoggerText extends RichText {
    /**
   * log a message
   * @param {string} message
   * @public
   */ log(message) {
        if (this.messages.length >= this.numMessagesToDisplay) {
            // remove the oldest message
            this.messages.pop();
        }
        // add the newest message
        this.messages.unshift(message);
        // munge the messages together and set the value of the text
        this.string = _.reduce(this.messages, (memo, compositeMessage)=>{
            return `${memo}<br>${compositeMessage}`;
        });
    }
    /**
   * @param {Object} [options]
   * @constructor
   */ constructor(options){
        options = merge({
            left: DEFAULT_POSITION.x,
            top: DEFAULT_POSITION.y,
            numMessagesToDisplay: DEFAULT_NUM_MESSAGES,
            font: DEFAULT_FONT,
            fill: DEFAULT_TEXT_COLOR
        }, options);
        super('', options);
        this.numMessagesToDisplay = options.numMessagesToDisplay;
        this.messages = [];
    }
};
sceneryPhet.register('DebugLoggerText', DebugLoggerText);
export default DebugLoggerText;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9EZWJ1Z0xvZ2dlclRleHQuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTktMjAyMywgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbi8qKlxuICogRGVidWdMb2dnZXJUZXh0IGlzIGEgbm9kZSB0aGF0IGNhbiBiZSBhZGRlZCBhcyBhIGNoaWxkIHRvIHRoZSB2aWV3IGFuZCBjYW4gc2hvdyBkZWJ1ZyBsb2cgbWVzc2FnZXMuXG4gKiBUaGlzIGlzIG1vc3Qgb2Z0ZW4gdXNlZCB3aGVuIGEgY29uc29sZSBpcyBub3QgYXZhaWxhYmxlLCBzdWNoIGFzIHdoZW4gZGVidWdnaW5nIG9uIGlQYWRzIG9yIG90aGVyIHRhYmxldHMuXG4gKlxuICogVHlwaWNhbGx5LCBhbiBpbnN0YW5jZSBvZiB0aGlzIGlzIGNyZWF0ZWQgYW5kIG1hZGUgZ2xvYmFsIGZvciB1c2Ugb24gYSBnaXZlbiBzY3JlZW4uICBFeGFtcGxlOlxuICogICBwaGV0LmRlYnVnTG9nZ2VyTm9kZSA9IG5ldyBEZWJ1Z0xvZ2dlclRleHQoKTtcbiAqICAgdGhpcy5hZGRDaGlsZCggcGhldC5kZWJ1Z0xvZ2dlck5vZGUgKTtcbiAqXG4gKiAuLi5hbmQgdGhlbiBsb2dnaW5nIGlzIGFjY29tcGxpc2hlZCBieSBjYWxsaW5nIHRoZSBsb2dnZXIgbGlrZSB0aGlzOlxuICogICBwaGV0LmRlYnVnTG9nZ2VyTm9kZS5sb2coICdteSBpbnNpZ2h0ZnVsIG1lc3NhZ2UnICk7XG4gKlxuICogVGlwIGZyb20gTUsgLSBzdGFydCBieSBwdXR0aW5nIHRoZSBhYm92ZSBsaW5lIGluIGFzc2VydC5qc1xuICpcbiAqIEBhdXRob3IgSm9obiBCbGFuY28gKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXG4gKi9cblxuaW1wb3J0IFZlY3RvcjIgZnJvbSAnLi4vLi4vZG90L2pzL1ZlY3RvcjIuanMnO1xuaW1wb3J0IG1lcmdlIGZyb20gJy4uLy4uL3BoZXQtY29yZS9qcy9tZXJnZS5qcyc7XG5pbXBvcnQgeyBDb2xvciwgUmljaFRleHQgfSBmcm9tICcuLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xuaW1wb3J0IFBoZXRGb250IGZyb20gJy4vUGhldEZvbnQuanMnO1xuaW1wb3J0IHNjZW5lcnlQaGV0IGZyb20gJy4vc2NlbmVyeVBoZXQuanMnO1xuXG4vLyBjb25zdGFudHNcbmNvbnN0IERFRkFVTFRfTlVNX01FU1NBR0VTID0gNDtcbmNvbnN0IERFRkFVTFRfUE9TSVRJT04gPSBuZXcgVmVjdG9yMiggMjAsIDIwICk7XG5jb25zdCBERUZBVUxUX0ZPTlQgPSBuZXcgUGhldEZvbnQoIDIwICk7XG5jb25zdCBERUZBVUxUX1RFWFRfQ09MT1IgPSBDb2xvci5yZWQ7XG5cbmNsYXNzIERlYnVnTG9nZ2VyVGV4dCBleHRlbmRzIFJpY2hUZXh0IHtcblxuICAvKipcbiAgICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zXVxuICAgKiBAY29uc3RydWN0b3JcbiAgICovXG4gIGNvbnN0cnVjdG9yKCBvcHRpb25zICkge1xuXG4gICAgb3B0aW9ucyA9IG1lcmdlKCB7XG4gICAgICBsZWZ0OiBERUZBVUxUX1BPU0lUSU9OLngsXG4gICAgICB0b3A6IERFRkFVTFRfUE9TSVRJT04ueSxcbiAgICAgIG51bU1lc3NhZ2VzVG9EaXNwbGF5OiBERUZBVUxUX05VTV9NRVNTQUdFUyxcbiAgICAgIGZvbnQ6IERFRkFVTFRfRk9OVCxcbiAgICAgIGZpbGw6IERFRkFVTFRfVEVYVF9DT0xPUlxuICAgIH0sIG9wdGlvbnMgKTtcblxuICAgIHN1cGVyKCAnJywgb3B0aW9ucyApO1xuXG4gICAgdGhpcy5udW1NZXNzYWdlc1RvRGlzcGxheSA9IG9wdGlvbnMubnVtTWVzc2FnZXNUb0Rpc3BsYXk7XG4gICAgdGhpcy5tZXNzYWdlcyA9IFtdO1xuICB9XG5cbiAgLyoqXG4gICAqIGxvZyBhIG1lc3NhZ2VcbiAgICogQHBhcmFtIHtzdHJpbmd9IG1lc3NhZ2VcbiAgICogQHB1YmxpY1xuICAgKi9cbiAgbG9nKCBtZXNzYWdlICkge1xuXG4gICAgaWYgKCB0aGlzLm1lc3NhZ2VzLmxlbmd0aCA+PSB0aGlzLm51bU1lc3NhZ2VzVG9EaXNwbGF5ICkge1xuXG4gICAgICAvLyByZW1vdmUgdGhlIG9sZGVzdCBtZXNzYWdlXG4gICAgICB0aGlzLm1lc3NhZ2VzLnBvcCgpO1xuICAgIH1cblxuICAgIC8vIGFkZCB0aGUgbmV3ZXN0IG1lc3NhZ2VcbiAgICB0aGlzLm1lc3NhZ2VzLnVuc2hpZnQoIG1lc3NhZ2UgKTtcblxuICAgIC8vIG11bmdlIHRoZSBtZXNzYWdlcyB0b2dldGhlciBhbmQgc2V0IHRoZSB2YWx1ZSBvZiB0aGUgdGV4dFxuICAgIHRoaXMuc3RyaW5nID0gXy5yZWR1Y2UoIHRoaXMubWVzc2FnZXMsICggbWVtbywgY29tcG9zaXRlTWVzc2FnZSApID0+IHtcbiAgICAgIHJldHVybiBgJHttZW1vfTxicj4ke2NvbXBvc2l0ZU1lc3NhZ2V9YDtcbiAgICB9ICk7XG4gIH1cbn1cblxuc2NlbmVyeVBoZXQucmVnaXN0ZXIoICdEZWJ1Z0xvZ2dlclRleHQnLCBEZWJ1Z0xvZ2dlclRleHQgKTtcbmV4cG9ydCBkZWZhdWx0IERlYnVnTG9nZ2VyVGV4dDsiXSwibmFtZXMiOlsiVmVjdG9yMiIsIm1lcmdlIiwiQ29sb3IiLCJSaWNoVGV4dCIsIlBoZXRGb250Iiwic2NlbmVyeVBoZXQiLCJERUZBVUxUX05VTV9NRVNTQUdFUyIsIkRFRkFVTFRfUE9TSVRJT04iLCJERUZBVUxUX0ZPTlQiLCJERUZBVUxUX1RFWFRfQ09MT1IiLCJyZWQiLCJEZWJ1Z0xvZ2dlclRleHQiLCJsb2ciLCJtZXNzYWdlIiwibWVzc2FnZXMiLCJsZW5ndGgiLCJudW1NZXNzYWdlc1RvRGlzcGxheSIsInBvcCIsInVuc2hpZnQiLCJzdHJpbmciLCJfIiwicmVkdWNlIiwibWVtbyIsImNvbXBvc2l0ZU1lc3NhZ2UiLCJjb25zdHJ1Y3RvciIsIm9wdGlvbnMiLCJsZWZ0IiwieCIsInRvcCIsInkiLCJmb250IiwiZmlsbCIsInJlZ2lzdGVyIl0sIm1hcHBpbmdzIjoiQUFBQSxzREFBc0Q7QUFFdEQ7Ozs7Ozs7Ozs7Ozs7O0NBY0MsR0FFRCxPQUFPQSxhQUFhLDBCQUEwQjtBQUM5QyxPQUFPQyxXQUFXLDhCQUE4QjtBQUNoRCxTQUFTQyxLQUFLLEVBQUVDLFFBQVEsUUFBUSw4QkFBOEI7QUFDOUQsT0FBT0MsY0FBYyxnQkFBZ0I7QUFDckMsT0FBT0MsaUJBQWlCLG1CQUFtQjtBQUUzQyxZQUFZO0FBQ1osTUFBTUMsdUJBQXVCO0FBQzdCLE1BQU1DLG1CQUFtQixJQUFJUCxRQUFTLElBQUk7QUFDMUMsTUFBTVEsZUFBZSxJQUFJSixTQUFVO0FBQ25DLE1BQU1LLHFCQUFxQlAsTUFBTVEsR0FBRztBQUVwQyxJQUFBLEFBQU1DLGtCQUFOLE1BQU1BLHdCQUF3QlI7SUFzQjVCOzs7O0dBSUMsR0FDRFMsSUFBS0MsT0FBTyxFQUFHO1FBRWIsSUFBSyxJQUFJLENBQUNDLFFBQVEsQ0FBQ0MsTUFBTSxJQUFJLElBQUksQ0FBQ0Msb0JBQW9CLEVBQUc7WUFFdkQsNEJBQTRCO1lBQzVCLElBQUksQ0FBQ0YsUUFBUSxDQUFDRyxHQUFHO1FBQ25CO1FBRUEseUJBQXlCO1FBQ3pCLElBQUksQ0FBQ0gsUUFBUSxDQUFDSSxPQUFPLENBQUVMO1FBRXZCLDREQUE0RDtRQUM1RCxJQUFJLENBQUNNLE1BQU0sR0FBR0MsRUFBRUMsTUFBTSxDQUFFLElBQUksQ0FBQ1AsUUFBUSxFQUFFLENBQUVRLE1BQU1DO1lBQzdDLE9BQU8sR0FBR0QsS0FBSyxJQUFJLEVBQUVDLGtCQUFrQjtRQUN6QztJQUNGO0lBeENBOzs7R0FHQyxHQUNEQyxZQUFhQyxPQUFPLENBQUc7UUFFckJBLFVBQVV4QixNQUFPO1lBQ2Z5QixNQUFNbkIsaUJBQWlCb0IsQ0FBQztZQUN4QkMsS0FBS3JCLGlCQUFpQnNCLENBQUM7WUFDdkJiLHNCQUFzQlY7WUFDdEJ3QixNQUFNdEI7WUFDTnVCLE1BQU10QjtRQUNSLEdBQUdnQjtRQUVILEtBQUssQ0FBRSxJQUFJQTtRQUVYLElBQUksQ0FBQ1Qsb0JBQW9CLEdBQUdTLFFBQVFULG9CQUFvQjtRQUN4RCxJQUFJLENBQUNGLFFBQVEsR0FBRyxFQUFFO0lBQ3BCO0FBdUJGO0FBRUFULFlBQVkyQixRQUFRLENBQUUsbUJBQW1CckI7QUFDekMsZUFBZUEsZ0JBQWdCIn0=