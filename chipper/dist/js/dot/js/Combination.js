// Copyright 2022, University of Colorado Boulder
/**
 * An immutable combination that represents a subset of a set
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ import dot from './dot.js';
let Combination = class Combination {
    size() {
        return this.inclusions.length;
    }
    includes(index) {
        return this.inclusions[index];
    }
    /**
   * Applies the combination to an array, returning a new array with the used elements.
   */ apply(array) {
        return array.filter((element, index)=>this.inclusions[index]);
    }
    /**
   * Creates a new combination that is the inverse of this (includes the opposite elements)
   */ inverted() {
        return new Combination(this.inclusions.map((inclusion)=>!inclusion));
    }
    getIncludedIndices() {
        return _.range(0, this.size()).filter((i)=>this.inclusions[i]);
    }
    toString() {
        return `C[${this.inclusions.map((i)=>i ? '1' : '0').join('')}]`;
    }
    equals(combination) {
        return this.inclusions.length === combination.inclusions.length && _.isEqual(this.inclusions, combination.inclusions);
    }
    /**
   * Creates an empty combination of a given size.
   */ static empty(size) {
        return new Combination(_.range(0, size).map(()=>false));
    }
    /**
   * Creates a full combination of a given size.
   */ static full(size) {
        return new Combination(_.range(0, size).map(()=>true));
    }
    /**
   * Lists all combinations from a given size
   */ static combinations(size) {
        const combinations = [];
        const stack = [];
        (function recurse(index) {
            if (index === size) {
                combinations.push(new Combination(stack.slice()));
            } else {
                stack.push(false);
                recurse(index + 1);
                stack.pop();
                stack.push(true);
                recurse(index + 1);
                stack.pop();
            }
        })(0);
        return combinations;
    }
    /**
   * Calls a callback on every single possible permutation of the given Array
   *
   * @param array
   * @param callback - Called on each permuted version of the array possible
   */ static forEachCombination(array, callback) {
        const stack = [];
        (function recurse(index) {
            if (index === array.length) {
                callback(stack);
            } else {
                recurse(index + 1);
                stack.push(array[index]);
                recurse(index + 1);
                stack.pop();
            }
        })(0);
    }
    static combinationsOf(array) {
        const results = [];
        Combination.forEachCombination(array, (result)=>{
            results.push(result.slice());
        });
        return results;
    }
    /**
   * Creates a combination that will include elements where list[i] === true
   */ constructor(inclusions){
        this.inclusions = inclusions;
    }
};
dot.register('Combination', Combination);
export default Combination;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2RvdC9qcy9Db21iaW5hdGlvbi50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAyMiwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbi8qKlxuICogQW4gaW1tdXRhYmxlIGNvbWJpbmF0aW9uIHRoYXQgcmVwcmVzZW50cyBhIHN1YnNldCBvZiBhIHNldFxuICpcbiAqIEBhdXRob3IgSm9uYXRoYW4gT2xzb24gPGpvbmF0aGFuLm9sc29uQGNvbG9yYWRvLmVkdT5cbiAqL1xuXG5pbXBvcnQgZG90IGZyb20gJy4vZG90LmpzJztcblxuY2xhc3MgQ29tYmluYXRpb24ge1xuXG4gIHB1YmxpYyByZWFkb25seSBpbmNsdXNpb25zOiBib29sZWFuW107XG5cbiAgLyoqXG4gICAqIENyZWF0ZXMgYSBjb21iaW5hdGlvbiB0aGF0IHdpbGwgaW5jbHVkZSBlbGVtZW50cyB3aGVyZSBsaXN0W2ldID09PSB0cnVlXG4gICAqL1xuICBwdWJsaWMgY29uc3RydWN0b3IoIGluY2x1c2lvbnM6IGJvb2xlYW5bXSApIHtcbiAgICB0aGlzLmluY2x1c2lvbnMgPSBpbmNsdXNpb25zO1xuICB9XG5cbiAgcHVibGljIHNpemUoKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5pbmNsdXNpb25zLmxlbmd0aDtcbiAgfVxuXG4gIHB1YmxpYyBpbmNsdWRlcyggaW5kZXg6IG51bWJlciApOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5pbmNsdXNpb25zWyBpbmRleCBdO1xuICB9XG5cbiAgLyoqXG4gICAqIEFwcGxpZXMgdGhlIGNvbWJpbmF0aW9uIHRvIGFuIGFycmF5LCByZXR1cm5pbmcgYSBuZXcgYXJyYXkgd2l0aCB0aGUgdXNlZCBlbGVtZW50cy5cbiAgICovXG4gIHB1YmxpYyBhcHBseTxUPiggYXJyYXk6IFRbXSApOiBUW10ge1xuICAgIHJldHVybiBhcnJheS5maWx0ZXIoICggZWxlbWVudCwgaW5kZXggKSA9PiB0aGlzLmluY2x1c2lvbnNbIGluZGV4IF0gKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDcmVhdGVzIGEgbmV3IGNvbWJpbmF0aW9uIHRoYXQgaXMgdGhlIGludmVyc2Ugb2YgdGhpcyAoaW5jbHVkZXMgdGhlIG9wcG9zaXRlIGVsZW1lbnRzKVxuICAgKi9cbiAgcHVibGljIGludmVydGVkKCk6IENvbWJpbmF0aW9uIHtcbiAgICByZXR1cm4gbmV3IENvbWJpbmF0aW9uKCB0aGlzLmluY2x1c2lvbnMubWFwKCBpbmNsdXNpb24gPT4gIWluY2x1c2lvbiApICk7XG4gIH1cblxuICBwdWJsaWMgZ2V0SW5jbHVkZWRJbmRpY2VzKCk6IG51bWJlcltdIHtcbiAgICByZXR1cm4gXy5yYW5nZSggMCwgdGhpcy5zaXplKCkgKS5maWx0ZXIoIGkgPT4gdGhpcy5pbmNsdXNpb25zWyBpIF0gKTtcbiAgfVxuXG4gIHB1YmxpYyB0b1N0cmluZygpOiBzdHJpbmcge1xuICAgIHJldHVybiBgQ1ske3RoaXMuaW5jbHVzaW9ucy5tYXAoIGkgPT4gaSA/ICcxJyA6ICcwJyApLmpvaW4oICcnICl9XWA7XG4gIH1cblxuICBwdWJsaWMgZXF1YWxzKCBjb21iaW5hdGlvbjogQ29tYmluYXRpb24gKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuaW5jbHVzaW9ucy5sZW5ndGggPT09IGNvbWJpbmF0aW9uLmluY2x1c2lvbnMubGVuZ3RoICYmIF8uaXNFcXVhbCggdGhpcy5pbmNsdXNpb25zLCBjb21iaW5hdGlvbi5pbmNsdXNpb25zICk7XG4gIH1cblxuICAvKipcbiAgICogQ3JlYXRlcyBhbiBlbXB0eSBjb21iaW5hdGlvbiBvZiBhIGdpdmVuIHNpemUuXG4gICAqL1xuICBwdWJsaWMgc3RhdGljIGVtcHR5KCBzaXplOiBudW1iZXIgKTogQ29tYmluYXRpb24ge1xuICAgIHJldHVybiBuZXcgQ29tYmluYXRpb24oIF8ucmFuZ2UoIDAsIHNpemUgKS5tYXAoICgpID0+IGZhbHNlICkgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDcmVhdGVzIGEgZnVsbCBjb21iaW5hdGlvbiBvZiBhIGdpdmVuIHNpemUuXG4gICAqL1xuICBwdWJsaWMgc3RhdGljIGZ1bGwoIHNpemU6IG51bWJlciApOiBDb21iaW5hdGlvbiB7XG4gICAgcmV0dXJuIG5ldyBDb21iaW5hdGlvbiggXy5yYW5nZSggMCwgc2l6ZSApLm1hcCggKCkgPT4gdHJ1ZSApICk7XG4gIH1cblxuICAvKipcbiAgICogTGlzdHMgYWxsIGNvbWJpbmF0aW9ucyBmcm9tIGEgZ2l2ZW4gc2l6ZVxuICAgKi9cbiAgcHVibGljIHN0YXRpYyBjb21iaW5hdGlvbnMoIHNpemU6IG51bWJlciApOiBDb21iaW5hdGlvbltdIHtcblxuICAgIGNvbnN0IGNvbWJpbmF0aW9uczogQ29tYmluYXRpb25bXSA9IFtdO1xuICAgIGNvbnN0IHN0YWNrOiBib29sZWFuW10gPSBbXTtcblxuICAgICggZnVuY3Rpb24gcmVjdXJzZSggaW5kZXg6IG51bWJlciApOiB2b2lkIHtcbiAgICAgIGlmICggaW5kZXggPT09IHNpemUgKSB7XG4gICAgICAgIGNvbWJpbmF0aW9ucy5wdXNoKCBuZXcgQ29tYmluYXRpb24oIHN0YWNrLnNsaWNlKCkgKSApO1xuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgIHN0YWNrLnB1c2goIGZhbHNlICk7XG4gICAgICAgIHJlY3Vyc2UoIGluZGV4ICsgMSApO1xuICAgICAgICBzdGFjay5wb3AoKTtcbiAgICAgICAgc3RhY2sucHVzaCggdHJ1ZSApO1xuICAgICAgICByZWN1cnNlKCBpbmRleCArIDEgKTtcbiAgICAgICAgc3RhY2sucG9wKCk7XG4gICAgICB9XG4gICAgfSApKCAwICk7XG5cbiAgICByZXR1cm4gY29tYmluYXRpb25zO1xuICB9XG5cbiAgLyoqXG4gICAqIENhbGxzIGEgY2FsbGJhY2sgb24gZXZlcnkgc2luZ2xlIHBvc3NpYmxlIHBlcm11dGF0aW9uIG9mIHRoZSBnaXZlbiBBcnJheVxuICAgKlxuICAgKiBAcGFyYW0gYXJyYXlcbiAgICogQHBhcmFtIGNhbGxiYWNrIC0gQ2FsbGVkIG9uIGVhY2ggcGVybXV0ZWQgdmVyc2lvbiBvZiB0aGUgYXJyYXkgcG9zc2libGVcbiAgICovXG4gIHB1YmxpYyBzdGF0aWMgZm9yRWFjaENvbWJpbmF0aW9uPFQ+KCBhcnJheTogVFtdLCBjYWxsYmFjazogKCBhcnJheTogcmVhZG9ubHkgVFtdICkgPT4gdm9pZCApOiB2b2lkIHtcbiAgICBjb25zdCBzdGFjazogVFtdID0gW107XG5cbiAgICAoIGZ1bmN0aW9uIHJlY3Vyc2UoIGluZGV4OiBudW1iZXIgKTogdm9pZCB7XG4gICAgICBpZiAoIGluZGV4ID09PSBhcnJheS5sZW5ndGggKSB7XG4gICAgICAgIGNhbGxiYWNrKCBzdGFjayApO1xuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgIHJlY3Vyc2UoIGluZGV4ICsgMSApO1xuICAgICAgICBzdGFjay5wdXNoKCBhcnJheVsgaW5kZXggXSApO1xuICAgICAgICByZWN1cnNlKCBpbmRleCArIDEgKTtcbiAgICAgICAgc3RhY2sucG9wKCk7XG4gICAgICB9XG4gICAgfSApKCAwICk7XG4gIH1cblxuICBwdWJsaWMgc3RhdGljIGNvbWJpbmF0aW9uc09mPFQ+KCBhcnJheTogVFtdICk6IFRbXVtdIHtcbiAgICBjb25zdCByZXN1bHRzOiBUW11bXSA9IFtdO1xuICAgIENvbWJpbmF0aW9uLmZvckVhY2hDb21iaW5hdGlvbiggYXJyYXksIHJlc3VsdCA9PiB7XG4gICAgICByZXN1bHRzLnB1c2goIHJlc3VsdC5zbGljZSgpICk7XG4gICAgfSApO1xuICAgIHJldHVybiByZXN1bHRzO1xuICB9XG59XG5cbmRvdC5yZWdpc3RlciggJ0NvbWJpbmF0aW9uJywgQ29tYmluYXRpb24gKTtcblxuZXhwb3J0IGRlZmF1bHQgQ29tYmluYXRpb247Il0sIm5hbWVzIjpbImRvdCIsIkNvbWJpbmF0aW9uIiwic2l6ZSIsImluY2x1c2lvbnMiLCJsZW5ndGgiLCJpbmNsdWRlcyIsImluZGV4IiwiYXBwbHkiLCJhcnJheSIsImZpbHRlciIsImVsZW1lbnQiLCJpbnZlcnRlZCIsIm1hcCIsImluY2x1c2lvbiIsImdldEluY2x1ZGVkSW5kaWNlcyIsIl8iLCJyYW5nZSIsImkiLCJ0b1N0cmluZyIsImpvaW4iLCJlcXVhbHMiLCJjb21iaW5hdGlvbiIsImlzRXF1YWwiLCJlbXB0eSIsImZ1bGwiLCJjb21iaW5hdGlvbnMiLCJzdGFjayIsInJlY3Vyc2UiLCJwdXNoIiwic2xpY2UiLCJwb3AiLCJmb3JFYWNoQ29tYmluYXRpb24iLCJjYWxsYmFjayIsImNvbWJpbmF0aW9uc09mIiwicmVzdWx0cyIsInJlc3VsdCIsInJlZ2lzdGVyIl0sIm1hcHBpbmdzIjoiQUFBQSxpREFBaUQ7QUFFakQ7Ozs7Q0FJQyxHQUVELE9BQU9BLFNBQVMsV0FBVztBQUUzQixJQUFBLEFBQU1DLGNBQU4sTUFBTUE7SUFXR0MsT0FBZTtRQUNwQixPQUFPLElBQUksQ0FBQ0MsVUFBVSxDQUFDQyxNQUFNO0lBQy9CO0lBRU9DLFNBQVVDLEtBQWEsRUFBWTtRQUN4QyxPQUFPLElBQUksQ0FBQ0gsVUFBVSxDQUFFRyxNQUFPO0lBQ2pDO0lBRUE7O0dBRUMsR0FDRCxBQUFPQyxNQUFVQyxLQUFVLEVBQVE7UUFDakMsT0FBT0EsTUFBTUMsTUFBTSxDQUFFLENBQUVDLFNBQVNKLFFBQVcsSUFBSSxDQUFDSCxVQUFVLENBQUVHLE1BQU87SUFDckU7SUFFQTs7R0FFQyxHQUNELEFBQU9LLFdBQXdCO1FBQzdCLE9BQU8sSUFBSVYsWUFBYSxJQUFJLENBQUNFLFVBQVUsQ0FBQ1MsR0FBRyxDQUFFQyxDQUFBQSxZQUFhLENBQUNBO0lBQzdEO0lBRU9DLHFCQUErQjtRQUNwQyxPQUFPQyxFQUFFQyxLQUFLLENBQUUsR0FBRyxJQUFJLENBQUNkLElBQUksSUFBS08sTUFBTSxDQUFFUSxDQUFBQSxJQUFLLElBQUksQ0FBQ2QsVUFBVSxDQUFFYyxFQUFHO0lBQ3BFO0lBRU9DLFdBQW1CO1FBQ3hCLE9BQU8sQ0FBQyxFQUFFLEVBQUUsSUFBSSxDQUFDZixVQUFVLENBQUNTLEdBQUcsQ0FBRUssQ0FBQUEsSUFBS0EsSUFBSSxNQUFNLEtBQU1FLElBQUksQ0FBRSxJQUFLLENBQUMsQ0FBQztJQUNyRTtJQUVPQyxPQUFRQyxXQUF3QixFQUFZO1FBQ2pELE9BQU8sSUFBSSxDQUFDbEIsVUFBVSxDQUFDQyxNQUFNLEtBQUtpQixZQUFZbEIsVUFBVSxDQUFDQyxNQUFNLElBQUlXLEVBQUVPLE9BQU8sQ0FBRSxJQUFJLENBQUNuQixVQUFVLEVBQUVrQixZQUFZbEIsVUFBVTtJQUN2SDtJQUVBOztHQUVDLEdBQ0QsT0FBY29CLE1BQU9yQixJQUFZLEVBQWdCO1FBQy9DLE9BQU8sSUFBSUQsWUFBYWMsRUFBRUMsS0FBSyxDQUFFLEdBQUdkLE1BQU9VLEdBQUcsQ0FBRSxJQUFNO0lBQ3hEO0lBRUE7O0dBRUMsR0FDRCxPQUFjWSxLQUFNdEIsSUFBWSxFQUFnQjtRQUM5QyxPQUFPLElBQUlELFlBQWFjLEVBQUVDLEtBQUssQ0FBRSxHQUFHZCxNQUFPVSxHQUFHLENBQUUsSUFBTTtJQUN4RDtJQUVBOztHQUVDLEdBQ0QsT0FBY2EsYUFBY3ZCLElBQVksRUFBa0I7UUFFeEQsTUFBTXVCLGVBQThCLEVBQUU7UUFDdEMsTUFBTUMsUUFBbUIsRUFBRTtRQUV6QixDQUFBLFNBQVNDLFFBQVNyQixLQUFhO1lBQy9CLElBQUtBLFVBQVVKLE1BQU87Z0JBQ3BCdUIsYUFBYUcsSUFBSSxDQUFFLElBQUkzQixZQUFheUIsTUFBTUcsS0FBSztZQUNqRCxPQUNLO2dCQUNISCxNQUFNRSxJQUFJLENBQUU7Z0JBQ1pELFFBQVNyQixRQUFRO2dCQUNqQm9CLE1BQU1JLEdBQUc7Z0JBQ1RKLE1BQU1FLElBQUksQ0FBRTtnQkFDWkQsUUFBU3JCLFFBQVE7Z0JBQ2pCb0IsTUFBTUksR0FBRztZQUNYO1FBQ0YsQ0FBQSxFQUFLO1FBRUwsT0FBT0w7SUFDVDtJQUVBOzs7OztHQUtDLEdBQ0QsT0FBY00sbUJBQXVCdkIsS0FBVSxFQUFFd0IsUUFBeUMsRUFBUztRQUNqRyxNQUFNTixRQUFhLEVBQUU7UUFFbkIsQ0FBQSxTQUFTQyxRQUFTckIsS0FBYTtZQUMvQixJQUFLQSxVQUFVRSxNQUFNSixNQUFNLEVBQUc7Z0JBQzVCNEIsU0FBVU47WUFDWixPQUNLO2dCQUNIQyxRQUFTckIsUUFBUTtnQkFDakJvQixNQUFNRSxJQUFJLENBQUVwQixLQUFLLENBQUVGLE1BQU87Z0JBQzFCcUIsUUFBU3JCLFFBQVE7Z0JBQ2pCb0IsTUFBTUksR0FBRztZQUNYO1FBQ0YsQ0FBQSxFQUFLO0lBQ1A7SUFFQSxPQUFjRyxlQUFtQnpCLEtBQVUsRUFBVTtRQUNuRCxNQUFNMEIsVUFBaUIsRUFBRTtRQUN6QmpDLFlBQVk4QixrQkFBa0IsQ0FBRXZCLE9BQU8yQixDQUFBQTtZQUNyQ0QsUUFBUU4sSUFBSSxDQUFFTyxPQUFPTixLQUFLO1FBQzVCO1FBQ0EsT0FBT0s7SUFDVDtJQTVHQTs7R0FFQyxHQUNELFlBQW9CL0IsVUFBcUIsQ0FBRztRQUMxQyxJQUFJLENBQUNBLFVBQVUsR0FBR0E7SUFDcEI7QUF3R0Y7QUFFQUgsSUFBSW9DLFFBQVEsQ0FBRSxlQUFlbkM7QUFFN0IsZUFBZUEsWUFBWSJ9