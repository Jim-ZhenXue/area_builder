// Copyright 2024, University of Colorado Boulder
import os from 'os';
const MAX_BATCH_SIZE = 50;
/**
 * Divides an array of repository names into batches based on specified rules:
 * - No batch contains more than MAX_BATCH_SIZE repositories.
 * - Preferably utilize all PROCESS_COUNT processors by creating up to PROCESS_COUNT batches when possible.
 *
 * @param originalRepos - Array of repository names.
 * @returns An array of batches, where each batch is an array of repository names.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */ export default function divideIntoBatches(originalRepos, maxProcesses) {
    const N = originalRepos.length;
    // Use most of the processors. for instance, on Macbook air m1, we have 8 cores and we use 6, which has good performance
    const numCPUs = os.cpus().length; // as of 11/2024 -- MK: 20, SR: 16, sparky: 128
    const processCount = Math.min(Math.round(numCPUs / 4), maxProcesses);
    const batches = [];
    if (N === 0) {
        return batches; // Return empty array if no repositories
    }
    if (N <= processCount) {
        // Create N batches, each with 1 repository
        for (const repo of originalRepos){
            batches.push([
                repo
            ]);
        }
    } else if (N <= processCount * MAX_BATCH_SIZE) {
        // Aim for 6 batches, distributing repositories as evenly as possible
        const baseSize = Math.floor(N / processCount);
        const extra = N % processCount;
        let start = 0;
        for(let i = 0; i < processCount; i++){
            // Distribute the extra repositories one by one to the first 'extra' batches
            const batchSize = baseSize + (i < extra ? 1 : 0);
            const end = start + batchSize;
            batches.push(originalRepos.slice(start, end));
            start = end;
        }
    } else {
        // Create as many batches of 50 as needed
        for(let i = 0; i < N; i += MAX_BATCH_SIZE){
            batches.push(originalRepos.slice(i, i + MAX_BATCH_SIZE));
        }
    }
    return batches;
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3BlcmVubmlhbC1hbGlhcy9qcy9lc2xpbnQvZGl2aWRlSW50b0JhdGNoZXMudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjQsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG5pbXBvcnQgb3MgZnJvbSAnb3MnO1xuaW1wb3J0IHsgUmVwbyB9IGZyb20gJy4uL2Jyb3dzZXItYW5kLW5vZGUvUGVyZW5uaWFsVHlwZXMuanMnO1xuXG5jb25zdCBNQVhfQkFUQ0hfU0laRSA9IDUwO1xuXG4vKipcbiAqIERpdmlkZXMgYW4gYXJyYXkgb2YgcmVwb3NpdG9yeSBuYW1lcyBpbnRvIGJhdGNoZXMgYmFzZWQgb24gc3BlY2lmaWVkIHJ1bGVzOlxuICogLSBObyBiYXRjaCBjb250YWlucyBtb3JlIHRoYW4gTUFYX0JBVENIX1NJWkUgcmVwb3NpdG9yaWVzLlxuICogLSBQcmVmZXJhYmx5IHV0aWxpemUgYWxsIFBST0NFU1NfQ09VTlQgcHJvY2Vzc29ycyBieSBjcmVhdGluZyB1cCB0byBQUk9DRVNTX0NPVU5UIGJhdGNoZXMgd2hlbiBwb3NzaWJsZS5cbiAqXG4gKiBAcGFyYW0gb3JpZ2luYWxSZXBvcyAtIEFycmF5IG9mIHJlcG9zaXRvcnkgbmFtZXMuXG4gKiBAcmV0dXJucyBBbiBhcnJheSBvZiBiYXRjaGVzLCB3aGVyZSBlYWNoIGJhdGNoIGlzIGFuIGFycmF5IG9mIHJlcG9zaXRvcnkgbmFtZXMuXG4gKlxuICogQGF1dGhvciBTYW0gUmVpZCAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcbiAqL1xuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gZGl2aWRlSW50b0JhdGNoZXMoIG9yaWdpbmFsUmVwb3M6IFJlcG9bXSwgbWF4UHJvY2Vzc2VzOiBudW1iZXIgKTogUmVwb1tdW10ge1xuXG4gIGNvbnN0IE4gPSBvcmlnaW5hbFJlcG9zLmxlbmd0aDtcblxuICAvLyBVc2UgbW9zdCBvZiB0aGUgcHJvY2Vzc29ycy4gZm9yIGluc3RhbmNlLCBvbiBNYWNib29rIGFpciBtMSwgd2UgaGF2ZSA4IGNvcmVzIGFuZCB3ZSB1c2UgNiwgd2hpY2ggaGFzIGdvb2QgcGVyZm9ybWFuY2VcbiAgY29uc3QgbnVtQ1BVcyA9IG9zLmNwdXMoKS5sZW5ndGg7IC8vIGFzIG9mIDExLzIwMjQgLS0gTUs6IDIwLCBTUjogMTYsIHNwYXJreTogMTI4XG4gIGNvbnN0IHByb2Nlc3NDb3VudCA9IE1hdGgubWluKCBNYXRoLnJvdW5kKCBudW1DUFVzIC8gNCApLCBtYXhQcm9jZXNzZXMgKTtcblxuICBjb25zdCBiYXRjaGVzOiBSZXBvW11bXSA9IFtdO1xuXG4gIGlmICggTiA9PT0gMCApIHtcbiAgICByZXR1cm4gYmF0Y2hlczsgLy8gUmV0dXJuIGVtcHR5IGFycmF5IGlmIG5vIHJlcG9zaXRvcmllc1xuICB9XG5cbiAgaWYgKCBOIDw9IHByb2Nlc3NDb3VudCApIHtcblxuICAgIC8vIENyZWF0ZSBOIGJhdGNoZXMsIGVhY2ggd2l0aCAxIHJlcG9zaXRvcnlcbiAgICBmb3IgKCBjb25zdCByZXBvIG9mIG9yaWdpbmFsUmVwb3MgKSB7XG4gICAgICBiYXRjaGVzLnB1c2goIFsgcmVwbyBdICk7XG4gICAgfVxuICB9XG4gIGVsc2UgaWYgKCBOIDw9IHByb2Nlc3NDb3VudCAqIE1BWF9CQVRDSF9TSVpFICkge1xuXG4gICAgLy8gQWltIGZvciA2IGJhdGNoZXMsIGRpc3RyaWJ1dGluZyByZXBvc2l0b3JpZXMgYXMgZXZlbmx5IGFzIHBvc3NpYmxlXG4gICAgY29uc3QgYmFzZVNpemUgPSBNYXRoLmZsb29yKCBOIC8gcHJvY2Vzc0NvdW50ICk7XG4gICAgY29uc3QgZXh0cmEgPSBOICUgcHJvY2Vzc0NvdW50O1xuICAgIGxldCBzdGFydCA9IDA7XG5cbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBwcm9jZXNzQ291bnQ7IGkrKyApIHtcblxuICAgICAgLy8gRGlzdHJpYnV0ZSB0aGUgZXh0cmEgcmVwb3NpdG9yaWVzIG9uZSBieSBvbmUgdG8gdGhlIGZpcnN0ICdleHRyYScgYmF0Y2hlc1xuICAgICAgY29uc3QgYmF0Y2hTaXplID0gYmFzZVNpemUgKyAoIGkgPCBleHRyYSA/IDEgOiAwICk7XG4gICAgICBjb25zdCBlbmQgPSBzdGFydCArIGJhdGNoU2l6ZTtcbiAgICAgIGJhdGNoZXMucHVzaCggb3JpZ2luYWxSZXBvcy5zbGljZSggc3RhcnQsIGVuZCApICk7XG4gICAgICBzdGFydCA9IGVuZDtcbiAgICB9XG4gIH1cbiAgZWxzZSB7XG5cbiAgICAvLyBDcmVhdGUgYXMgbWFueSBiYXRjaGVzIG9mIDUwIGFzIG5lZWRlZFxuICAgIGZvciAoIGxldCBpID0gMDsgaSA8IE47IGkgKz0gTUFYX0JBVENIX1NJWkUgKSB7XG4gICAgICBiYXRjaGVzLnB1c2goIG9yaWdpbmFsUmVwb3Muc2xpY2UoIGksIGkgKyBNQVhfQkFUQ0hfU0laRSApICk7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGJhdGNoZXM7XG59Il0sIm5hbWVzIjpbIm9zIiwiTUFYX0JBVENIX1NJWkUiLCJkaXZpZGVJbnRvQmF0Y2hlcyIsIm9yaWdpbmFsUmVwb3MiLCJtYXhQcm9jZXNzZXMiLCJOIiwibGVuZ3RoIiwibnVtQ1BVcyIsImNwdXMiLCJwcm9jZXNzQ291bnQiLCJNYXRoIiwibWluIiwicm91bmQiLCJiYXRjaGVzIiwicmVwbyIsInB1c2giLCJiYXNlU2l6ZSIsImZsb29yIiwiZXh0cmEiLCJzdGFydCIsImkiLCJiYXRjaFNpemUiLCJlbmQiLCJzbGljZSJdLCJtYXBwaW5ncyI6IkFBQUEsaURBQWlEO0FBRWpELE9BQU9BLFFBQVEsS0FBSztBQUdwQixNQUFNQyxpQkFBaUI7QUFFdkI7Ozs7Ozs7OztDQVNDLEdBQ0QsZUFBZSxTQUFTQyxrQkFBbUJDLGFBQXFCLEVBQUVDLFlBQW9CO0lBRXBGLE1BQU1DLElBQUlGLGNBQWNHLE1BQU07SUFFOUIsd0hBQXdIO0lBQ3hILE1BQU1DLFVBQVVQLEdBQUdRLElBQUksR0FBR0YsTUFBTSxFQUFFLCtDQUErQztJQUNqRixNQUFNRyxlQUFlQyxLQUFLQyxHQUFHLENBQUVELEtBQUtFLEtBQUssQ0FBRUwsVUFBVSxJQUFLSDtJQUUxRCxNQUFNUyxVQUFvQixFQUFFO0lBRTVCLElBQUtSLE1BQU0sR0FBSTtRQUNiLE9BQU9RLFNBQVMsd0NBQXdDO0lBQzFEO0lBRUEsSUFBS1IsS0FBS0ksY0FBZTtRQUV2QiwyQ0FBMkM7UUFDM0MsS0FBTSxNQUFNSyxRQUFRWCxjQUFnQjtZQUNsQ1UsUUFBUUUsSUFBSSxDQUFFO2dCQUFFRDthQUFNO1FBQ3hCO0lBQ0YsT0FDSyxJQUFLVCxLQUFLSSxlQUFlUixnQkFBaUI7UUFFN0MscUVBQXFFO1FBQ3JFLE1BQU1lLFdBQVdOLEtBQUtPLEtBQUssQ0FBRVosSUFBSUk7UUFDakMsTUFBTVMsUUFBUWIsSUFBSUk7UUFDbEIsSUFBSVUsUUFBUTtRQUVaLElBQU0sSUFBSUMsSUFBSSxHQUFHQSxJQUFJWCxjQUFjVyxJQUFNO1lBRXZDLDRFQUE0RTtZQUM1RSxNQUFNQyxZQUFZTCxXQUFhSSxDQUFBQSxJQUFJRixRQUFRLElBQUksQ0FBQTtZQUMvQyxNQUFNSSxNQUFNSCxRQUFRRTtZQUNwQlIsUUFBUUUsSUFBSSxDQUFFWixjQUFjb0IsS0FBSyxDQUFFSixPQUFPRztZQUMxQ0gsUUFBUUc7UUFDVjtJQUNGLE9BQ0s7UUFFSCx5Q0FBeUM7UUFDekMsSUFBTSxJQUFJRixJQUFJLEdBQUdBLElBQUlmLEdBQUdlLEtBQUtuQixlQUFpQjtZQUM1Q1ksUUFBUUUsSUFBSSxDQUFFWixjQUFjb0IsS0FBSyxDQUFFSCxHQUFHQSxJQUFJbkI7UUFDNUM7SUFDRjtJQUVBLE9BQU9ZO0FBQ1QifQ==