// Copyright 2013-2023, University of Colorado Boulder
/**
 * An immutable permutation that can permute an array
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ import dot from './dot.js';
import Utils from './Utils.js';
let Permutation = class Permutation {
    size() {
        return this.indices.length;
    }
    /**
   * Applies the permutation, returning either a new array or number (whatever was provided).
   */ apply(arrayOrInt) {
        if (typeof arrayOrInt === 'number') {
            // @ts-expect-error
            return this.indices[arrayOrInt];
        } else {
            if (arrayOrInt.length !== this.size()) {
                throw new Error(`Permutation length ${this.size()} not equal to list length ${arrayOrInt.length}`);
            }
            // permute it as an array
            const result = new Array(arrayOrInt.length);
            for(let i = 0; i < arrayOrInt.length; i++){
                result[i] = arrayOrInt[this.indices[i]];
            }
            // @ts-expect-error
            return result;
        }
    }
    /**
   * Creates a new permutation that is the inverse of this.
   */ inverted() {
        const newPermutation = new Array(this.size());
        for(let i = 0; i < this.size(); i++){
            newPermutation[this.indices[i]] = i;
        }
        return new Permutation(newPermutation);
    }
    withIndicesPermuted(indices) {
        const result = [];
        Permutation.forEachPermutation(indices, (integers)=>{
            const oldIndices = this.indices;
            const newPermutation = oldIndices.slice(0);
            for(let i = 0; i < indices.length; i++){
                newPermutation[indices[i]] = oldIndices[integers[i]];
            }
            result.push(new Permutation(newPermutation));
        });
        return result;
    }
    toString() {
        return `P[${this.indices.join(', ')}]`;
    }
    equals(permutation) {
        return this.indices.length === permutation.indices.length && _.isEqual(this.indices, permutation.indices);
    }
    /**
   * Creates an identity permutation of a given size.
   */ static identity(size) {
        assert && assert(size >= 0);
        const indices = new Array(size);
        for(let i = 0; i < size; i++){
            indices[i] = i;
        }
        return new Permutation(indices);
    }
    /**
   * Lists all permutations that have a given size
   */ static permutations(size) {
        const result = [];
        Permutation.forEachPermutation(Utils.rangeInclusive(0, size - 1), (integers)=>{
            result.push(new Permutation(integers.slice()));
        });
        return result;
    }
    /**
   * Calls a callback on every single possible permutation of the given Array
   *
   * @param array
   * @param callback - Called on each permuted version of the array possible
   */ static forEachPermutation(array, callback) {
        recursiveForEachPermutation(array, [], callback);
    }
    static permutationsOf(array) {
        const results = [];
        Permutation.forEachPermutation(array, (result)=>{
            results.push(result.slice());
        });
        return results;
    }
    /**
   * Creates a permutation that will rearrange a list so that newList[i] = oldList[permutation[i]]
   */ constructor(indices){
        this.indices = indices;
    }
};
dot.register('Permutation', Permutation);
/**
 * Call our function with each permutation of the provided list PREFIXED by prefix, in lexicographic order
 *
 * @param array   List to generate permutations of
 * @param prefix   Elements that should be inserted at the front of each list before each call
 * @param callback Function to call
 */ function recursiveForEachPermutation(array, prefix, callback) {
    if (array.length === 0) {
        callback(prefix);
    } else {
        for(let i = 0; i < array.length; i++){
            const element = array[i];
            // remove the element from the array
            const nextArray = array.slice(0);
            nextArray.splice(i, 1);
            // add it into the prefix
            const nextPrefix = prefix.slice(0);
            nextPrefix.push(element);
            recursiveForEachPermutation(nextArray, nextPrefix, callback);
        }
    }
}
export default Permutation;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2RvdC9qcy9QZXJtdXRhdGlvbi50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxMy0yMDIzLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuLyoqXG4gKiBBbiBpbW11dGFibGUgcGVybXV0YXRpb24gdGhhdCBjYW4gcGVybXV0ZSBhbiBhcnJheVxuICpcbiAqIEBhdXRob3IgSm9uYXRoYW4gT2xzb24gPGpvbmF0aGFuLm9sc29uQGNvbG9yYWRvLmVkdT5cbiAqL1xuXG5pbXBvcnQgZG90IGZyb20gJy4vZG90LmpzJztcbmltcG9ydCBVdGlscyBmcm9tICcuL1V0aWxzLmpzJztcblxuY2xhc3MgUGVybXV0YXRpb24ge1xuXG4gIHB1YmxpYyByZWFkb25seSBpbmRpY2VzOiBudW1iZXJbXTtcblxuICAvKipcbiAgICogQ3JlYXRlcyBhIHBlcm11dGF0aW9uIHRoYXQgd2lsbCByZWFycmFuZ2UgYSBsaXN0IHNvIHRoYXQgbmV3TGlzdFtpXSA9IG9sZExpc3RbcGVybXV0YXRpb25baV1dXG4gICAqL1xuICBwdWJsaWMgY29uc3RydWN0b3IoIGluZGljZXM6IG51bWJlcltdICkge1xuICAgIHRoaXMuaW5kaWNlcyA9IGluZGljZXM7XG4gIH1cblxuICBwdWJsaWMgc2l6ZSgpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLmluZGljZXMubGVuZ3RoO1xuICB9XG5cbiAgLyoqXG4gICAqIEFwcGxpZXMgdGhlIHBlcm11dGF0aW9uLCByZXR1cm5pbmcgZWl0aGVyIGEgbmV3IGFycmF5IG9yIG51bWJlciAod2hhdGV2ZXIgd2FzIHByb3ZpZGVkKS5cbiAgICovXG4gIHB1YmxpYyBhcHBseTxFLCBUIGV4dGVuZHMgRVtdIHwgbnVtYmVyPiggYXJyYXlPckludDogVCApOiBUIGV4dGVuZHMgRVtdID8gbnVtYmVyW10gOiBudW1iZXIge1xuICAgIGlmICggdHlwZW9mIGFycmF5T3JJbnQgPT09ICdudW1iZXInICkge1xuICAgICAgLy8gQHRzLWV4cGVjdC1lcnJvclxuICAgICAgcmV0dXJuIHRoaXMuaW5kaWNlc1sgYXJyYXlPckludCBdO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIGlmICggYXJyYXlPckludC5sZW5ndGggIT09IHRoaXMuc2l6ZSgpICkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoIGBQZXJtdXRhdGlvbiBsZW5ndGggJHt0aGlzLnNpemUoKX0gbm90IGVxdWFsIHRvIGxpc3QgbGVuZ3RoICR7YXJyYXlPckludC5sZW5ndGh9YCApO1xuICAgICAgfVxuXG4gICAgICAvLyBwZXJtdXRlIGl0IGFzIGFuIGFycmF5XG4gICAgICBjb25zdCByZXN1bHQ6IEVbXSA9IG5ldyBBcnJheSggYXJyYXlPckludC5sZW5ndGggKTtcbiAgICAgIGZvciAoIGxldCBpID0gMDsgaSA8IGFycmF5T3JJbnQubGVuZ3RoOyBpKysgKSB7XG4gICAgICAgIHJlc3VsdFsgaSBdID0gYXJyYXlPckludFsgdGhpcy5pbmRpY2VzWyBpIF0gXTtcbiAgICAgIH1cbiAgICAgIC8vIEB0cy1leHBlY3QtZXJyb3JcbiAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIENyZWF0ZXMgYSBuZXcgcGVybXV0YXRpb24gdGhhdCBpcyB0aGUgaW52ZXJzZSBvZiB0aGlzLlxuICAgKi9cbiAgcHVibGljIGludmVydGVkKCk6IFBlcm11dGF0aW9uIHtcbiAgICBjb25zdCBuZXdQZXJtdXRhdGlvbiA9IG5ldyBBcnJheSggdGhpcy5zaXplKCkgKTtcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCB0aGlzLnNpemUoKTsgaSsrICkge1xuICAgICAgbmV3UGVybXV0YXRpb25bIHRoaXMuaW5kaWNlc1sgaSBdIF0gPSBpO1xuICAgIH1cbiAgICByZXR1cm4gbmV3IFBlcm11dGF0aW9uKCBuZXdQZXJtdXRhdGlvbiApO1xuICB9XG5cbiAgcHVibGljIHdpdGhJbmRpY2VzUGVybXV0ZWQoIGluZGljZXM6IG51bWJlcltdICk6IFBlcm11dGF0aW9uW10ge1xuICAgIGNvbnN0IHJlc3VsdDogUGVybXV0YXRpb25bXSA9IFtdO1xuICAgIFBlcm11dGF0aW9uLmZvckVhY2hQZXJtdXRhdGlvbiggaW5kaWNlcywgaW50ZWdlcnMgPT4ge1xuICAgICAgY29uc3Qgb2xkSW5kaWNlcyA9IHRoaXMuaW5kaWNlcztcbiAgICAgIGNvbnN0IG5ld1Blcm11dGF0aW9uID0gb2xkSW5kaWNlcy5zbGljZSggMCApO1xuXG4gICAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBpbmRpY2VzLmxlbmd0aDsgaSsrICkge1xuICAgICAgICBuZXdQZXJtdXRhdGlvblsgaW5kaWNlc1sgaSBdIF0gPSBvbGRJbmRpY2VzWyBpbnRlZ2Vyc1sgaSBdIF07XG4gICAgICB9XG4gICAgICByZXN1bHQucHVzaCggbmV3IFBlcm11dGF0aW9uKCBuZXdQZXJtdXRhdGlvbiApICk7XG4gICAgfSApO1xuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cblxuICBwdWJsaWMgdG9TdHJpbmcoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gYFBbJHt0aGlzLmluZGljZXMuam9pbiggJywgJyApfV1gO1xuICB9XG5cbiAgcHVibGljIGVxdWFscyggcGVybXV0YXRpb246IFBlcm11dGF0aW9uICk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLmluZGljZXMubGVuZ3RoID09PSBwZXJtdXRhdGlvbi5pbmRpY2VzLmxlbmd0aCAmJiBfLmlzRXF1YWwoIHRoaXMuaW5kaWNlcywgcGVybXV0YXRpb24uaW5kaWNlcyApO1xuICB9XG5cbiAgLyoqXG4gICAqIENyZWF0ZXMgYW4gaWRlbnRpdHkgcGVybXV0YXRpb24gb2YgYSBnaXZlbiBzaXplLlxuICAgKi9cbiAgcHVibGljIHN0YXRpYyBpZGVudGl0eSggc2l6ZTogbnVtYmVyICk6IFBlcm11dGF0aW9uIHtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBzaXplID49IDAgKTtcbiAgICBjb25zdCBpbmRpY2VzID0gbmV3IEFycmF5KCBzaXplICk7XG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgc2l6ZTsgaSsrICkge1xuICAgICAgaW5kaWNlc1sgaSBdID0gaTtcbiAgICB9XG4gICAgcmV0dXJuIG5ldyBQZXJtdXRhdGlvbiggaW5kaWNlcyApO1xuICB9XG5cbiAgLyoqXG4gICAqIExpc3RzIGFsbCBwZXJtdXRhdGlvbnMgdGhhdCBoYXZlIGEgZ2l2ZW4gc2l6ZVxuICAgKi9cbiAgcHVibGljIHN0YXRpYyBwZXJtdXRhdGlvbnMoIHNpemU6IG51bWJlciApOiBQZXJtdXRhdGlvbltdIHtcbiAgICBjb25zdCByZXN1bHQ6IFBlcm11dGF0aW9uW10gPSBbXTtcbiAgICBQZXJtdXRhdGlvbi5mb3JFYWNoUGVybXV0YXRpb24oIFV0aWxzLnJhbmdlSW5jbHVzaXZlKCAwLCBzaXplIC0gMSApLCBpbnRlZ2VycyA9PiB7XG4gICAgICByZXN1bHQucHVzaCggbmV3IFBlcm11dGF0aW9uKCBpbnRlZ2Vycy5zbGljZSgpICkgKTtcbiAgICB9ICk7XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuXG4gIC8qKlxuICAgKiBDYWxscyBhIGNhbGxiYWNrIG9uIGV2ZXJ5IHNpbmdsZSBwb3NzaWJsZSBwZXJtdXRhdGlvbiBvZiB0aGUgZ2l2ZW4gQXJyYXlcbiAgICpcbiAgICogQHBhcmFtIGFycmF5XG4gICAqIEBwYXJhbSBjYWxsYmFjayAtIENhbGxlZCBvbiBlYWNoIHBlcm11dGVkIHZlcnNpb24gb2YgdGhlIGFycmF5IHBvc3NpYmxlXG4gICAqL1xuICBwdWJsaWMgc3RhdGljIGZvckVhY2hQZXJtdXRhdGlvbjxUPiggYXJyYXk6IFRbXSwgY2FsbGJhY2s6ICggYXJyYXk6IHJlYWRvbmx5IFRbXSApID0+IHZvaWQgKTogdm9pZCB7XG4gICAgcmVjdXJzaXZlRm9yRWFjaFBlcm11dGF0aW9uKCBhcnJheSwgW10sIGNhbGxiYWNrICk7XG4gIH1cblxuICBwdWJsaWMgc3RhdGljIHBlcm11dGF0aW9uc09mPFQ+KCBhcnJheTogVFtdICk6IFRbXVtdIHtcbiAgICBjb25zdCByZXN1bHRzOiBUW11bXSA9IFtdO1xuICAgIFBlcm11dGF0aW9uLmZvckVhY2hQZXJtdXRhdGlvbiggYXJyYXksIHJlc3VsdCA9PiB7XG4gICAgICByZXN1bHRzLnB1c2goIHJlc3VsdC5zbGljZSgpICk7XG4gICAgfSApO1xuICAgIHJldHVybiByZXN1bHRzO1xuICB9XG59XG5cbmRvdC5yZWdpc3RlciggJ1Blcm11dGF0aW9uJywgUGVybXV0YXRpb24gKTtcblxuLyoqXG4gKiBDYWxsIG91ciBmdW5jdGlvbiB3aXRoIGVhY2ggcGVybXV0YXRpb24gb2YgdGhlIHByb3ZpZGVkIGxpc3QgUFJFRklYRUQgYnkgcHJlZml4LCBpbiBsZXhpY29ncmFwaGljIG9yZGVyXG4gKlxuICogQHBhcmFtIGFycmF5ICAgTGlzdCB0byBnZW5lcmF0ZSBwZXJtdXRhdGlvbnMgb2ZcbiAqIEBwYXJhbSBwcmVmaXggICBFbGVtZW50cyB0aGF0IHNob3VsZCBiZSBpbnNlcnRlZCBhdCB0aGUgZnJvbnQgb2YgZWFjaCBsaXN0IGJlZm9yZSBlYWNoIGNhbGxcbiAqIEBwYXJhbSBjYWxsYmFjayBGdW5jdGlvbiB0byBjYWxsXG4gKi9cbmZ1bmN0aW9uIHJlY3Vyc2l2ZUZvckVhY2hQZXJtdXRhdGlvbjxUPiggYXJyYXk6IFRbXSwgcHJlZml4OiBUW10sIGNhbGxiYWNrOiAoIGFycmF5OiByZWFkb25seSBUW10gKSA9PiB2b2lkICk6IHZvaWQge1xuICBpZiAoIGFycmF5Lmxlbmd0aCA9PT0gMCApIHtcbiAgICBjYWxsYmFjayggcHJlZml4ICk7XG4gIH1cbiAgZWxzZSB7XG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgYXJyYXkubGVuZ3RoOyBpKysgKSB7XG4gICAgICBjb25zdCBlbGVtZW50ID0gYXJyYXlbIGkgXTtcblxuICAgICAgLy8gcmVtb3ZlIHRoZSBlbGVtZW50IGZyb20gdGhlIGFycmF5XG4gICAgICBjb25zdCBuZXh0QXJyYXkgPSBhcnJheS5zbGljZSggMCApO1xuICAgICAgbmV4dEFycmF5LnNwbGljZSggaSwgMSApO1xuXG4gICAgICAvLyBhZGQgaXQgaW50byB0aGUgcHJlZml4XG4gICAgICBjb25zdCBuZXh0UHJlZml4ID0gcHJlZml4LnNsaWNlKCAwICk7XG4gICAgICBuZXh0UHJlZml4LnB1c2goIGVsZW1lbnQgKTtcblxuICAgICAgcmVjdXJzaXZlRm9yRWFjaFBlcm11dGF0aW9uKCBuZXh0QXJyYXksIG5leHRQcmVmaXgsIGNhbGxiYWNrICk7XG4gICAgfVxuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IFBlcm11dGF0aW9uOyJdLCJuYW1lcyI6WyJkb3QiLCJVdGlscyIsIlBlcm11dGF0aW9uIiwic2l6ZSIsImluZGljZXMiLCJsZW5ndGgiLCJhcHBseSIsImFycmF5T3JJbnQiLCJFcnJvciIsInJlc3VsdCIsIkFycmF5IiwiaSIsImludmVydGVkIiwibmV3UGVybXV0YXRpb24iLCJ3aXRoSW5kaWNlc1Blcm11dGVkIiwiZm9yRWFjaFBlcm11dGF0aW9uIiwiaW50ZWdlcnMiLCJvbGRJbmRpY2VzIiwic2xpY2UiLCJwdXNoIiwidG9TdHJpbmciLCJqb2luIiwiZXF1YWxzIiwicGVybXV0YXRpb24iLCJfIiwiaXNFcXVhbCIsImlkZW50aXR5IiwiYXNzZXJ0IiwicGVybXV0YXRpb25zIiwicmFuZ2VJbmNsdXNpdmUiLCJhcnJheSIsImNhbGxiYWNrIiwicmVjdXJzaXZlRm9yRWFjaFBlcm11dGF0aW9uIiwicGVybXV0YXRpb25zT2YiLCJyZXN1bHRzIiwicmVnaXN0ZXIiLCJwcmVmaXgiLCJlbGVtZW50IiwibmV4dEFycmF5Iiwic3BsaWNlIiwibmV4dFByZWZpeCJdLCJtYXBwaW5ncyI6IkFBQUEsc0RBQXNEO0FBRXREOzs7O0NBSUMsR0FFRCxPQUFPQSxTQUFTLFdBQVc7QUFDM0IsT0FBT0MsV0FBVyxhQUFhO0FBRS9CLElBQUEsQUFBTUMsY0FBTixNQUFNQTtJQVdHQyxPQUFlO1FBQ3BCLE9BQU8sSUFBSSxDQUFDQyxPQUFPLENBQUNDLE1BQU07SUFDNUI7SUFF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