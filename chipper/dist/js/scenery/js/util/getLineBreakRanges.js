// Copyright 2022-2024, University of Colorado Boulder
import Range from '../../../dot/js/Range.js';
import optionize from '../../../phet-core/js/optionize.js';
/**
 * Returns where possible line breaks can exist in a given string, according to the
 * Unicode Line Breaking Algorithm (UAX #14). Uses https://github.com/foliojs/linebreak.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ import { scenery } from '../imports.js';
/**
 * Returns an array of ranges that each cover a section of the string where they should not be split by line breaks.
 * These ranges may exclude things like whitespace in-between words, so if a line is being used, the ranges included
 * should just use the starting-min and ending-max to determine what should be included.
 */ const getLineBreakRanges = (str, providedOptions)=>{
    const options = optionize()({
        requiredOnly: false
    }, providedOptions);
    const ranges = [];
    const lineBreaker = new LineBreaker(str);
    // Make it iterable (this was refactored out, but the typing was awkward)
    lineBreaker[Symbol.iterator] = ()=>{
        return {
            next () {
                const value = lineBreaker.nextBreak();
                if (value !== null) {
                    return {
                        value: value,
                        done: false
                    };
                } else {
                    return {
                        done: true
                    };
                }
            }
        };
    };
    let lastIndex = 0;
    for (const brk of lineBreaker){
        const index = brk.position;
        if (options.requiredOnly && !brk.required) {
            continue;
        }
        // Don't include empty ranges, if they occur.
        if (lastIndex !== index) {
            ranges.push(new Range(lastIndex, index));
        }
        lastIndex = brk.position;
    }
    // Ending range, if it's not empty
    if (lastIndex < str.length) {
        ranges.push(new Range(lastIndex, str.length));
    }
    return ranges;
};
scenery.register('getLineBreakRanges', getLineBreakRanges);
export default getLineBreakRanges;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvdXRpbC9nZXRMaW5lQnJlYWtSYW5nZXMudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjItMjAyNCwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbmltcG9ydCBSYW5nZSBmcm9tICcuLi8uLi8uLi9kb3QvanMvUmFuZ2UuanMnO1xuaW1wb3J0IG9wdGlvbml6ZSBmcm9tICcuLi8uLi8uLi9waGV0LWNvcmUvanMvb3B0aW9uaXplLmpzJztcbi8qKlxuICogUmV0dXJucyB3aGVyZSBwb3NzaWJsZSBsaW5lIGJyZWFrcyBjYW4gZXhpc3QgaW4gYSBnaXZlbiBzdHJpbmcsIGFjY29yZGluZyB0byB0aGVcbiAqIFVuaWNvZGUgTGluZSBCcmVha2luZyBBbGdvcml0aG0gKFVBWCAjMTQpLiBVc2VzIGh0dHBzOi8vZ2l0aHViLmNvbS9mb2xpb2pzL2xpbmVicmVhay5cbiAqXG4gKiBAYXV0aG9yIEpvbmF0aGFuIE9sc29uIDxqb25hdGhhbi5vbHNvbkBjb2xvcmFkby5lZHU+XG4gKi9cbmltcG9ydCB7IHNjZW5lcnkgfSBmcm9tICcuLi9pbXBvcnRzLmpzJztcblxuZXhwb3J0IHR5cGUgR2V0TGluZUJyZWFrc09wdGlvbnMgPSB7XG4gIC8vIExpbmUgYnJlYWtzIGNhbiBiZSBcInJlcXVpcmVkXCIgb3IgXCJvcHRpb25hbFwiLiBJZiB0aGlzIGlzIHRydWUsIHJhbmdlcyB3aWxsIG9ubHkgYmUgZ2l2ZW4gZm9yIHJlcXVpcmVkIGxpbmUgYnJlYWtzLlxuICByZXF1aXJlZE9ubHk/OiBib29sZWFuO1xufTtcblxuLyoqXG4gKiBSZXR1cm5zIGFuIGFycmF5IG9mIHJhbmdlcyB0aGF0IGVhY2ggY292ZXIgYSBzZWN0aW9uIG9mIHRoZSBzdHJpbmcgd2hlcmUgdGhleSBzaG91bGQgbm90IGJlIHNwbGl0IGJ5IGxpbmUgYnJlYWtzLlxuICogVGhlc2UgcmFuZ2VzIG1heSBleGNsdWRlIHRoaW5ncyBsaWtlIHdoaXRlc3BhY2UgaW4tYmV0d2VlbiB3b3Jkcywgc28gaWYgYSBsaW5lIGlzIGJlaW5nIHVzZWQsIHRoZSByYW5nZXMgaW5jbHVkZWRcbiAqIHNob3VsZCBqdXN0IHVzZSB0aGUgc3RhcnRpbmctbWluIGFuZCBlbmRpbmctbWF4IHRvIGRldGVybWluZSB3aGF0IHNob3VsZCBiZSBpbmNsdWRlZC5cbiAqL1xuY29uc3QgZ2V0TGluZUJyZWFrUmFuZ2VzID0gKCBzdHI6IHN0cmluZywgcHJvdmlkZWRPcHRpb25zPzogR2V0TGluZUJyZWFrc09wdGlvbnMgKTogUmFuZ2VbXSA9PiB7XG4gIGNvbnN0IG9wdGlvbnMgPSBvcHRpb25pemU8R2V0TGluZUJyZWFrc09wdGlvbnM+KCkoIHtcbiAgICByZXF1aXJlZE9ubHk6IGZhbHNlXG4gIH0sIHByb3ZpZGVkT3B0aW9ucyApO1xuXG4gIGNvbnN0IHJhbmdlczogUmFuZ2VbXSA9IFtdO1xuXG4gIGNvbnN0IGxpbmVCcmVha2VyID0gbmV3IExpbmVCcmVha2VyKCBzdHIgKTtcblxuICAvLyBNYWtlIGl0IGl0ZXJhYmxlICh0aGlzIHdhcyByZWZhY3RvcmVkIG91dCwgYnV0IHRoZSB0eXBpbmcgd2FzIGF3a3dhcmQpXG4gIGxpbmVCcmVha2VyWyBTeW1ib2wuaXRlcmF0b3IgXSA9ICgpID0+IHtcbiAgICByZXR1cm4ge1xuICAgICAgbmV4dCgpIHtcbiAgICAgICAgY29uc3QgdmFsdWUgPSBsaW5lQnJlYWtlci5uZXh0QnJlYWsoKTtcbiAgICAgICAgaWYgKCB2YWx1ZSAhPT0gbnVsbCApIHtcbiAgICAgICAgICByZXR1cm4geyB2YWx1ZTogdmFsdWUsIGRvbmU6IGZhbHNlIH07XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIHsgZG9uZTogdHJ1ZSB9O1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfTtcbiAgfTtcblxuICBsZXQgbGFzdEluZGV4ID0gMDtcbiAgZm9yICggY29uc3QgYnJrIG9mIGxpbmVCcmVha2VyICkge1xuICAgIGNvbnN0IGluZGV4ID0gYnJrLnBvc2l0aW9uO1xuXG4gICAgaWYgKCBvcHRpb25zLnJlcXVpcmVkT25seSAmJiAhYnJrLnJlcXVpcmVkICkge1xuICAgICAgY29udGludWU7XG4gICAgfVxuXG4gICAgLy8gRG9uJ3QgaW5jbHVkZSBlbXB0eSByYW5nZXMsIGlmIHRoZXkgb2NjdXIuXG4gICAgaWYgKCBsYXN0SW5kZXggIT09IGluZGV4ICkge1xuICAgICAgcmFuZ2VzLnB1c2goIG5ldyBSYW5nZSggbGFzdEluZGV4LCBpbmRleCApICk7XG4gICAgfVxuXG4gICAgbGFzdEluZGV4ID0gYnJrLnBvc2l0aW9uO1xuICB9XG5cbiAgLy8gRW5kaW5nIHJhbmdlLCBpZiBpdCdzIG5vdCBlbXB0eVxuICBpZiAoIGxhc3RJbmRleCA8IHN0ci5sZW5ndGggKSB7XG4gICAgcmFuZ2VzLnB1c2goIG5ldyBSYW5nZSggbGFzdEluZGV4LCBzdHIubGVuZ3RoICkgKTtcbiAgfVxuXG4gIHJldHVybiByYW5nZXM7XG59O1xuXG5zY2VuZXJ5LnJlZ2lzdGVyKCAnZ2V0TGluZUJyZWFrUmFuZ2VzJywgZ2V0TGluZUJyZWFrUmFuZ2VzICk7XG5cbmV4cG9ydCBkZWZhdWx0IGdldExpbmVCcmVha1JhbmdlczsiXSwibmFtZXMiOlsiUmFuZ2UiLCJvcHRpb25pemUiLCJzY2VuZXJ5IiwiZ2V0TGluZUJyZWFrUmFuZ2VzIiwic3RyIiwicHJvdmlkZWRPcHRpb25zIiwib3B0aW9ucyIsInJlcXVpcmVkT25seSIsInJhbmdlcyIsImxpbmVCcmVha2VyIiwiTGluZUJyZWFrZXIiLCJTeW1ib2wiLCJpdGVyYXRvciIsIm5leHQiLCJ2YWx1ZSIsIm5leHRCcmVhayIsImRvbmUiLCJsYXN0SW5kZXgiLCJicmsiLCJpbmRleCIsInBvc2l0aW9uIiwicmVxdWlyZWQiLCJwdXNoIiwibGVuZ3RoIiwicmVnaXN0ZXIiXSwibWFwcGluZ3MiOiJBQUFBLHNEQUFzRDtBQUV0RCxPQUFPQSxXQUFXLDJCQUEyQjtBQUM3QyxPQUFPQyxlQUFlLHFDQUFxQztBQUMzRDs7Ozs7Q0FLQyxHQUNELFNBQVNDLE9BQU8sUUFBUSxnQkFBZ0I7QUFPeEM7Ozs7Q0FJQyxHQUNELE1BQU1DLHFCQUFxQixDQUFFQyxLQUFhQztJQUN4QyxNQUFNQyxVQUFVTCxZQUFtQztRQUNqRE0sY0FBYztJQUNoQixHQUFHRjtJQUVILE1BQU1HLFNBQWtCLEVBQUU7SUFFMUIsTUFBTUMsY0FBYyxJQUFJQyxZQUFhTjtJQUVyQyx5RUFBeUU7SUFDekVLLFdBQVcsQ0FBRUUsT0FBT0MsUUFBUSxDQUFFLEdBQUc7UUFDL0IsT0FBTztZQUNMQztnQkFDRSxNQUFNQyxRQUFRTCxZQUFZTSxTQUFTO2dCQUNuQyxJQUFLRCxVQUFVLE1BQU87b0JBQ3BCLE9BQU87d0JBQUVBLE9BQU9BO3dCQUFPRSxNQUFNO29CQUFNO2dCQUNyQyxPQUNLO29CQUNILE9BQU87d0JBQUVBLE1BQU07b0JBQUs7Z0JBQ3RCO1lBQ0Y7UUFDRjtJQUNGO0lBRUEsSUFBSUMsWUFBWTtJQUNoQixLQUFNLE1BQU1DLE9BQU9ULFlBQWM7UUFDL0IsTUFBTVUsUUFBUUQsSUFBSUUsUUFBUTtRQUUxQixJQUFLZCxRQUFRQyxZQUFZLElBQUksQ0FBQ1csSUFBSUcsUUFBUSxFQUFHO1lBQzNDO1FBQ0Y7UUFFQSw2Q0FBNkM7UUFDN0MsSUFBS0osY0FBY0UsT0FBUTtZQUN6QlgsT0FBT2MsSUFBSSxDQUFFLElBQUl0QixNQUFPaUIsV0FBV0U7UUFDckM7UUFFQUYsWUFBWUMsSUFBSUUsUUFBUTtJQUMxQjtJQUVBLGtDQUFrQztJQUNsQyxJQUFLSCxZQUFZYixJQUFJbUIsTUFBTSxFQUFHO1FBQzVCZixPQUFPYyxJQUFJLENBQUUsSUFBSXRCLE1BQU9pQixXQUFXYixJQUFJbUIsTUFBTTtJQUMvQztJQUVBLE9BQU9mO0FBQ1Q7QUFFQU4sUUFBUXNCLFFBQVEsQ0FBRSxzQkFBc0JyQjtBQUV4QyxlQUFlQSxtQkFBbUIifQ==