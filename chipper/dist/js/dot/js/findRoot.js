// Copyright 2024, University of Colorado Boulder
/**
 * Hybrid root-finding given our constraints (guaranteed interval, value/derivative). Combines Newton's and bisection.
 *
 * @author Jonathan Olson (PhET Interactive Simulations)
 */ export function findRoot(minX, maxX, tolerance, valueFunction, derivativeFunction) {
    let x = (minX + maxX) / 2;
    let y;
    let dy;
    while(Math.abs(y = valueFunction(x)) > tolerance){
        dy = derivativeFunction(x);
        if (y < 0) {
            minX = x;
        } else {
            maxX = x;
        }
        // Newton's method first
        x -= y / dy;
        // Bounded to be bisection at the very least
        if (x <= minX || x >= maxX) {
            x = (minX + maxX) / 2;
            // Check to see if it's impossible to pass our tolerance
            if (x === minX || x === maxX) {
                break;
            }
        }
    }
    return x;
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2RvdC9qcy9maW5kUm9vdC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAyNCwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG4vKipcbiAqIEh5YnJpZCByb290LWZpbmRpbmcgZ2l2ZW4gb3VyIGNvbnN0cmFpbnRzIChndWFyYW50ZWVkIGludGVydmFsLCB2YWx1ZS9kZXJpdmF0aXZlKS4gQ29tYmluZXMgTmV3dG9uJ3MgYW5kIGJpc2VjdGlvbi5cbiAqXG4gKiBAYXV0aG9yIEpvbmF0aGFuIE9sc29uIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxuICovXG5leHBvcnQgZnVuY3Rpb24gZmluZFJvb3QoIG1pblg6IG51bWJlciwgbWF4WDogbnVtYmVyLCB0b2xlcmFuY2U6IG51bWJlciwgdmFsdWVGdW5jdGlvbjogKCBuOiBudW1iZXIgKSA9PiBudW1iZXIsIGRlcml2YXRpdmVGdW5jdGlvbjogKCBuOiBudW1iZXIgKSA9PiBudW1iZXIgKTogbnVtYmVyIHtcbiAgbGV0IHggPSAoIG1pblggKyBtYXhYICkgLyAyO1xuXG4gIGxldCB5O1xuICBsZXQgZHk7XG5cbiAgd2hpbGUgKCBNYXRoLmFicyggeSA9IHZhbHVlRnVuY3Rpb24oIHggKSApID4gdG9sZXJhbmNlICkge1xuICAgIGR5ID0gZGVyaXZhdGl2ZUZ1bmN0aW9uKCB4ICk7XG5cbiAgICBpZiAoIHkgPCAwICkge1xuICAgICAgbWluWCA9IHg7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgbWF4WCA9IHg7XG4gICAgfVxuXG4gICAgLy8gTmV3dG9uJ3MgbWV0aG9kIGZpcnN0XG4gICAgeCAtPSB5IC8gZHk7XG5cbiAgICAvLyBCb3VuZGVkIHRvIGJlIGJpc2VjdGlvbiBhdCB0aGUgdmVyeSBsZWFzdFxuICAgIGlmICggeCA8PSBtaW5YIHx8IHggPj0gbWF4WCApIHtcbiAgICAgIHggPSAoIG1pblggKyBtYXhYICkgLyAyO1xuXG4gICAgICAvLyBDaGVjayB0byBzZWUgaWYgaXQncyBpbXBvc3NpYmxlIHRvIHBhc3Mgb3VyIHRvbGVyYW5jZVxuICAgICAgaWYgKCB4ID09PSBtaW5YIHx8IHggPT09IG1heFggKSB7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiB4O1xufSJdLCJuYW1lcyI6WyJmaW5kUm9vdCIsIm1pblgiLCJtYXhYIiwidG9sZXJhbmNlIiwidmFsdWVGdW5jdGlvbiIsImRlcml2YXRpdmVGdW5jdGlvbiIsIngiLCJ5IiwiZHkiLCJNYXRoIiwiYWJzIl0sIm1hcHBpbmdzIjoiQUFBQSxpREFBaUQ7QUFDakQ7Ozs7Q0FJQyxHQUNELE9BQU8sU0FBU0EsU0FBVUMsSUFBWSxFQUFFQyxJQUFZLEVBQUVDLFNBQWlCLEVBQUVDLGFBQXNDLEVBQUVDLGtCQUEyQztJQUMxSixJQUFJQyxJQUFJLEFBQUVMLENBQUFBLE9BQU9DLElBQUcsSUFBTTtJQUUxQixJQUFJSztJQUNKLElBQUlDO0lBRUosTUFBUUMsS0FBS0MsR0FBRyxDQUFFSCxJQUFJSCxjQUFlRSxNQUFRSCxVQUFZO1FBQ3ZESyxLQUFLSCxtQkFBb0JDO1FBRXpCLElBQUtDLElBQUksR0FBSTtZQUNYTixPQUFPSztRQUNULE9BQ0s7WUFDSEosT0FBT0k7UUFDVDtRQUVBLHdCQUF3QjtRQUN4QkEsS0FBS0MsSUFBSUM7UUFFVCw0Q0FBNEM7UUFDNUMsSUFBS0YsS0FBS0wsUUFBUUssS0FBS0osTUFBTztZQUM1QkksSUFBSSxBQUFFTCxDQUFBQSxPQUFPQyxJQUFHLElBQU07WUFFdEIsd0RBQXdEO1lBQ3hELElBQUtJLE1BQU1MLFFBQVFLLE1BQU1KLE1BQU87Z0JBQzlCO1lBQ0Y7UUFDRjtJQUNGO0lBRUEsT0FBT0k7QUFDVCJ9