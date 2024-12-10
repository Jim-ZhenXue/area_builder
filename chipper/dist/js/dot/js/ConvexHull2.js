// Copyright 2013-2024, University of Colorado Boulder
/**
 * Construction of 2D convex hulls from a list of points.
 *
 * For example:
 * #begin canvasExample grahamScan 256x128
 * #on
 * var points = _.range( 50 ).map( function() {
 *   return new phet.dot.Vector2( 5 + ( 256 - 10 ) * Math.random(), 5 + ( 128 - 10 ) * Math.random() );
 * } );
 * var hullPoints = phet.dot.ConvexHull2.grahamScan( points, false );
 * #off
 * context.beginPath();
 * hullPoints.forEach( function( point ) {
 *   context.lineTo( point.x, point.y );
 * } );
 * context.closePath();
 * context.fillStyle = '#eee';
 * context.fill();
 * context.strokeStyle = '#f00';
 * context.stroke();
 *
 * context.beginPath();
 * points.forEach( function( point ) {
 *   context.arc( point.x, point.y, 2, 0, Math.PI * 2, false );
 *   context.closePath();
 * } );
 * context.fillStyle = '#00f';
 * context.fill();
 * #end canvasExample
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ import dot from './dot.js';
/**
 * counter-clockwise turn if > 0, clockwise turn if < 0, collinear if === 0.
 */ function ccw(p1, p2, p3) {
    return p2.minus(p1).crossScalar(p3.minus(p1));
}
const ConvexHull2 = {
    // TODO testing: all collinear, multiple ways of having same angle, etc. https://github.com/phetsims/dot/issues/96
    /**
   * Given multiple points, this performs a Graham Scan (http://en.wikipedia.org/wiki/Graham_scan) to identify an
   * ordered list of points which define the minimal polygon that contains all of the points.
   *
   * @param points
   * @param includeCollinear - If a point is along an edge of the convex hull (not at one of its vertices),
   *                                     should it be included?
   */ grahamScan: (points, includeCollinear)=>{
        if (points.length <= 2) {
            return points;
        }
        // find the point 'p' with the lowest y value
        let minY = Number.POSITIVE_INFINITY;
        let p = null;
        _.each(points, (point)=>{
            if (point.y <= minY) {
                // if two points have the same y value, take the one with the lowest x
                if (point.y === minY && p) {
                    if (point.x < p.x) {
                        p = point;
                    }
                } else {
                    minY = point.y;
                    p = point;
                }
            }
        });
        // sorts the points by their angle. Between 0 and PI
        points = _.sortBy(points, (point)=>{
            return point.minus(p).angle;
        });
        // remove p from points (relies on the above statement making a defensive copy)
        points.splice(_.indexOf(points, p), 1);
        // our result array
        const result = [
            p
        ];
        _.each(points, (point)=>{
            // ignore points equal to our starting point
            if (p.x === point.x && p.y === point.y) {
                return;
            }
            function isRightTurn() {
                if (result.length < 2) {
                    return false;
                }
                const cross = ccw(result[result.length - 2], result[result.length - 1], point);
                return includeCollinear ? cross < 0 : cross <= 0;
            }
            while(isRightTurn()){
                result.pop();
            }
            result.push(point);
        });
        return result;
    }
};
dot.register('ConvexHull2', ConvexHull2);
export default ConvexHull2;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2RvdC9qcy9Db252ZXhIdWxsMi50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxMy0yMDI0LCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuLyoqXG4gKiBDb25zdHJ1Y3Rpb24gb2YgMkQgY29udmV4IGh1bGxzIGZyb20gYSBsaXN0IG9mIHBvaW50cy5cbiAqXG4gKiBGb3IgZXhhbXBsZTpcbiAqICNiZWdpbiBjYW52YXNFeGFtcGxlIGdyYWhhbVNjYW4gMjU2eDEyOFxuICogI29uXG4gKiB2YXIgcG9pbnRzID0gXy5yYW5nZSggNTAgKS5tYXAoIGZ1bmN0aW9uKCkge1xuICogICByZXR1cm4gbmV3IHBoZXQuZG90LlZlY3RvcjIoIDUgKyAoIDI1NiAtIDEwICkgKiBNYXRoLnJhbmRvbSgpLCA1ICsgKCAxMjggLSAxMCApICogTWF0aC5yYW5kb20oKSApO1xuICogfSApO1xuICogdmFyIGh1bGxQb2ludHMgPSBwaGV0LmRvdC5Db252ZXhIdWxsMi5ncmFoYW1TY2FuKCBwb2ludHMsIGZhbHNlICk7XG4gKiAjb2ZmXG4gKiBjb250ZXh0LmJlZ2luUGF0aCgpO1xuICogaHVsbFBvaW50cy5mb3JFYWNoKCBmdW5jdGlvbiggcG9pbnQgKSB7XG4gKiAgIGNvbnRleHQubGluZVRvKCBwb2ludC54LCBwb2ludC55ICk7XG4gKiB9ICk7XG4gKiBjb250ZXh0LmNsb3NlUGF0aCgpO1xuICogY29udGV4dC5maWxsU3R5bGUgPSAnI2VlZSc7XG4gKiBjb250ZXh0LmZpbGwoKTtcbiAqIGNvbnRleHQuc3Ryb2tlU3R5bGUgPSAnI2YwMCc7XG4gKiBjb250ZXh0LnN0cm9rZSgpO1xuICpcbiAqIGNvbnRleHQuYmVnaW5QYXRoKCk7XG4gKiBwb2ludHMuZm9yRWFjaCggZnVuY3Rpb24oIHBvaW50ICkge1xuICogICBjb250ZXh0LmFyYyggcG9pbnQueCwgcG9pbnQueSwgMiwgMCwgTWF0aC5QSSAqIDIsIGZhbHNlICk7XG4gKiAgIGNvbnRleHQuY2xvc2VQYXRoKCk7XG4gKiB9ICk7XG4gKiBjb250ZXh0LmZpbGxTdHlsZSA9ICcjMDBmJztcbiAqIGNvbnRleHQuZmlsbCgpO1xuICogI2VuZCBjYW52YXNFeGFtcGxlXG4gKlxuICogQGF1dGhvciBKb25hdGhhbiBPbHNvbiA8am9uYXRoYW4ub2xzb25AY29sb3JhZG8uZWR1PlxuICovXG5cbmltcG9ydCBkb3QgZnJvbSAnLi9kb3QuanMnO1xuaW1wb3J0IFZlY3RvcjIgZnJvbSAnLi9WZWN0b3IyLmpzJztcblxuLyoqXG4gKiBjb3VudGVyLWNsb2Nrd2lzZSB0dXJuIGlmID4gMCwgY2xvY2t3aXNlIHR1cm4gaWYgPCAwLCBjb2xsaW5lYXIgaWYgPT09IDAuXG4gKi9cbmZ1bmN0aW9uIGNjdyggcDE6IFZlY3RvcjIsIHAyOiBWZWN0b3IyLCBwMzogVmVjdG9yMiApOiBudW1iZXIge1xuICByZXR1cm4gcDIubWludXMoIHAxICkuY3Jvc3NTY2FsYXIoIHAzLm1pbnVzKCBwMSApICk7XG59XG5cbmNvbnN0IENvbnZleEh1bGwyID0ge1xuICAvLyBUT0RPIHRlc3Rpbmc6IGFsbCBjb2xsaW5lYXIsIG11bHRpcGxlIHdheXMgb2YgaGF2aW5nIHNhbWUgYW5nbGUsIGV0Yy4gaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2RvdC9pc3N1ZXMvOTZcblxuICAvKipcbiAgICogR2l2ZW4gbXVsdGlwbGUgcG9pbnRzLCB0aGlzIHBlcmZvcm1zIGEgR3JhaGFtIFNjYW4gKGh0dHA6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvR3JhaGFtX3NjYW4pIHRvIGlkZW50aWZ5IGFuXG4gICAqIG9yZGVyZWQgbGlzdCBvZiBwb2ludHMgd2hpY2ggZGVmaW5lIHRoZSBtaW5pbWFsIHBvbHlnb24gdGhhdCBjb250YWlucyBhbGwgb2YgdGhlIHBvaW50cy5cbiAgICpcbiAgICogQHBhcmFtIHBvaW50c1xuICAgKiBAcGFyYW0gaW5jbHVkZUNvbGxpbmVhciAtIElmIGEgcG9pbnQgaXMgYWxvbmcgYW4gZWRnZSBvZiB0aGUgY29udmV4IGh1bGwgKG5vdCBhdCBvbmUgb2YgaXRzIHZlcnRpY2VzKSxcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2hvdWxkIGl0IGJlIGluY2x1ZGVkP1xuICAgKi9cbiAgZ3JhaGFtU2NhbjogKCBwb2ludHM6IFZlY3RvcjJbXSwgaW5jbHVkZUNvbGxpbmVhcjogYm9vbGVhbiApOiBWZWN0b3IyW10gPT4ge1xuICAgIGlmICggcG9pbnRzLmxlbmd0aCA8PSAyICkge1xuICAgICAgcmV0dXJuIHBvaW50cztcbiAgICB9XG5cbiAgICAvLyBmaW5kIHRoZSBwb2ludCAncCcgd2l0aCB0aGUgbG93ZXN0IHkgdmFsdWVcbiAgICBsZXQgbWluWSA9IE51bWJlci5QT1NJVElWRV9JTkZJTklUWTtcbiAgICBsZXQgcDogVmVjdG9yMiB8IG51bGwgPSBudWxsO1xuICAgIF8uZWFjaCggcG9pbnRzLCBwb2ludCA9PiB7XG4gICAgICBpZiAoIHBvaW50LnkgPD0gbWluWSApIHtcbiAgICAgICAgLy8gaWYgdHdvIHBvaW50cyBoYXZlIHRoZSBzYW1lIHkgdmFsdWUsIHRha2UgdGhlIG9uZSB3aXRoIHRoZSBsb3dlc3QgeFxuICAgICAgICBpZiAoIHBvaW50LnkgPT09IG1pblkgJiYgcCApIHtcbiAgICAgICAgICBpZiAoIHBvaW50LnggPCBwLnggKSB7XG4gICAgICAgICAgICBwID0gcG9pbnQ7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgIG1pblkgPSBwb2ludC55O1xuICAgICAgICAgIHAgPSBwb2ludDtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0gKTtcblxuICAgIC8vIHNvcnRzIHRoZSBwb2ludHMgYnkgdGhlaXIgYW5nbGUuIEJldHdlZW4gMCBhbmQgUElcbiAgICBwb2ludHMgPSBfLnNvcnRCeSggcG9pbnRzLCBwb2ludCA9PiB7XG4gICAgICByZXR1cm4gcG9pbnQubWludXMoIHAhICkuYW5nbGU7XG4gICAgfSApO1xuXG4gICAgLy8gcmVtb3ZlIHAgZnJvbSBwb2ludHMgKHJlbGllcyBvbiB0aGUgYWJvdmUgc3RhdGVtZW50IG1ha2luZyBhIGRlZmVuc2l2ZSBjb3B5KVxuICAgIHBvaW50cy5zcGxpY2UoIF8uaW5kZXhPZiggcG9pbnRzLCBwICksIDEgKTtcblxuICAgIC8vIG91ciByZXN1bHQgYXJyYXlcbiAgICBjb25zdCByZXN1bHQ6IFZlY3RvcjJbXSA9IFsgcCEgXTtcblxuICAgIF8uZWFjaCggcG9pbnRzLCBwb2ludCA9PiB7XG4gICAgICAvLyBpZ25vcmUgcG9pbnRzIGVxdWFsIHRvIG91ciBzdGFydGluZyBwb2ludFxuICAgICAgaWYgKCBwIS54ID09PSBwb2ludC54ICYmIHAhLnkgPT09IHBvaW50LnkgKSB7IHJldHVybjsgfVxuXG4gICAgICBmdW5jdGlvbiBpc1JpZ2h0VHVybigpOiBib29sZWFuIHtcbiAgICAgICAgaWYgKCByZXN1bHQubGVuZ3RoIDwgMiApIHtcbiAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgY3Jvc3MgPSBjY3coIHJlc3VsdFsgcmVzdWx0Lmxlbmd0aCAtIDIgXSwgcmVzdWx0WyByZXN1bHQubGVuZ3RoIC0gMSBdLCBwb2ludCApO1xuICAgICAgICByZXR1cm4gaW5jbHVkZUNvbGxpbmVhciA/ICggY3Jvc3MgPCAwICkgOiAoIGNyb3NzIDw9IDAgKTtcbiAgICAgIH1cblxuICAgICAgd2hpbGUgKCBpc1JpZ2h0VHVybigpICkge1xuICAgICAgICByZXN1bHQucG9wKCk7XG4gICAgICB9XG4gICAgICByZXN1bHQucHVzaCggcG9pbnQgKTtcbiAgICB9ICk7XG5cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG59O1xuXG5kb3QucmVnaXN0ZXIoICdDb252ZXhIdWxsMicsIENvbnZleEh1bGwyICk7XG5cbmV4cG9ydCBkZWZhdWx0IENvbnZleEh1bGwyOyJdLCJuYW1lcyI6WyJkb3QiLCJjY3ciLCJwMSIsInAyIiwicDMiLCJtaW51cyIsImNyb3NzU2NhbGFyIiwiQ29udmV4SHVsbDIiLCJncmFoYW1TY2FuIiwicG9pbnRzIiwiaW5jbHVkZUNvbGxpbmVhciIsImxlbmd0aCIsIm1pblkiLCJOdW1iZXIiLCJQT1NJVElWRV9JTkZJTklUWSIsInAiLCJfIiwiZWFjaCIsInBvaW50IiwieSIsIngiLCJzb3J0QnkiLCJhbmdsZSIsInNwbGljZSIsImluZGV4T2YiLCJyZXN1bHQiLCJpc1JpZ2h0VHVybiIsImNyb3NzIiwicG9wIiwicHVzaCIsInJlZ2lzdGVyIl0sIm1hcHBpbmdzIjoiQUFBQSxzREFBc0Q7QUFFdEQ7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Q0ErQkMsR0FFRCxPQUFPQSxTQUFTLFdBQVc7QUFHM0I7O0NBRUMsR0FDRCxTQUFTQyxJQUFLQyxFQUFXLEVBQUVDLEVBQVcsRUFBRUMsRUFBVztJQUNqRCxPQUFPRCxHQUFHRSxLQUFLLENBQUVILElBQUtJLFdBQVcsQ0FBRUYsR0FBR0MsS0FBSyxDQUFFSDtBQUMvQztBQUVBLE1BQU1LLGNBQWM7SUFDbEIsa0hBQWtIO0lBRWxIOzs7Ozs7O0dBT0MsR0FDREMsWUFBWSxDQUFFQyxRQUFtQkM7UUFDL0IsSUFBS0QsT0FBT0UsTUFBTSxJQUFJLEdBQUk7WUFDeEIsT0FBT0Y7UUFDVDtRQUVBLDZDQUE2QztRQUM3QyxJQUFJRyxPQUFPQyxPQUFPQyxpQkFBaUI7UUFDbkMsSUFBSUMsSUFBb0I7UUFDeEJDLEVBQUVDLElBQUksQ0FBRVIsUUFBUVMsQ0FBQUE7WUFDZCxJQUFLQSxNQUFNQyxDQUFDLElBQUlQLE1BQU87Z0JBQ3JCLHNFQUFzRTtnQkFDdEUsSUFBS00sTUFBTUMsQ0FBQyxLQUFLUCxRQUFRRyxHQUFJO29CQUMzQixJQUFLRyxNQUFNRSxDQUFDLEdBQUdMLEVBQUVLLENBQUMsRUFBRzt3QkFDbkJMLElBQUlHO29CQUNOO2dCQUNGLE9BQ0s7b0JBQ0hOLE9BQU9NLE1BQU1DLENBQUM7b0JBQ2RKLElBQUlHO2dCQUNOO1lBQ0Y7UUFDRjtRQUVBLG9EQUFvRDtRQUNwRFQsU0FBU08sRUFBRUssTUFBTSxDQUFFWixRQUFRUyxDQUFBQTtZQUN6QixPQUFPQSxNQUFNYixLQUFLLENBQUVVLEdBQUtPLEtBQUs7UUFDaEM7UUFFQSwrRUFBK0U7UUFDL0ViLE9BQU9jLE1BQU0sQ0FBRVAsRUFBRVEsT0FBTyxDQUFFZixRQUFRTSxJQUFLO1FBRXZDLG1CQUFtQjtRQUNuQixNQUFNVSxTQUFvQjtZQUFFVjtTQUFJO1FBRWhDQyxFQUFFQyxJQUFJLENBQUVSLFFBQVFTLENBQUFBO1lBQ2QsNENBQTRDO1lBQzVDLElBQUtILEVBQUdLLENBQUMsS0FBS0YsTUFBTUUsQ0FBQyxJQUFJTCxFQUFHSSxDQUFDLEtBQUtELE1BQU1DLENBQUMsRUFBRztnQkFBRTtZQUFRO1lBRXRELFNBQVNPO2dCQUNQLElBQUtELE9BQU9kLE1BQU0sR0FBRyxHQUFJO29CQUN2QixPQUFPO2dCQUNUO2dCQUNBLE1BQU1nQixRQUFRMUIsSUFBS3dCLE1BQU0sQ0FBRUEsT0FBT2QsTUFBTSxHQUFHLEVBQUcsRUFBRWMsTUFBTSxDQUFFQSxPQUFPZCxNQUFNLEdBQUcsRUFBRyxFQUFFTztnQkFDN0UsT0FBT1IsbUJBQXFCaUIsUUFBUSxJQUFRQSxTQUFTO1lBQ3ZEO1lBRUEsTUFBUUQsY0FBZ0I7Z0JBQ3RCRCxPQUFPRyxHQUFHO1lBQ1o7WUFDQUgsT0FBT0ksSUFBSSxDQUFFWDtRQUNmO1FBRUEsT0FBT087SUFDVDtBQUNGO0FBRUF6QixJQUFJOEIsUUFBUSxDQUFFLGVBQWV2QjtBQUU3QixlQUFlQSxZQUFZIn0=