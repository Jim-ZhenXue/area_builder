// Copyright 2021-2024, University of Colorado Boulder
/**
 * Parses command line arguments--sims=sim1,sim2,... or --simList=path/to/filename to get a list of sims.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */ import fs from 'fs';
export default function getSimList() {
    const args = process.argv.slice(2);
    // if the arg is just a flag, then the callback will be called with a null parameter
    const processKey = (key, callback)=>{
        const prefix = `--${key}`;
        const values = args.filter((arg)=>arg.startsWith(prefix));
        if (values.length === 1) {
            if (values[0].startsWith(`${prefix}=`)) {
                callback(values[0].substring(prefix.length + 1));
            } else {
                callback(null);
            }
        } else if (values.length > 1) {
            console.log(`Too many --${prefix}... specified`);
            process.exit(1);
        }
    };
    let repos = [];
    processKey('simList', (value)=>{
        const contents = fs.readFileSync(value, 'utf8').trim();
        repos = contents.split('\n').map((sim)=>sim.trim());
    });
    processKey('stable', ()=>{
        const contents = fs.readFileSync('../perennial-alias/data/phet-io-api-stable', 'utf8').trim();
        repos = contents.split('\n').map((sim)=>sim.trim());
    });
    processKey('sims', (value)=>{
        repos = value.split(',');
    });
    return repos;
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2pzL2NvbW1vbi9nZXRTaW1MaXN0LnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDIxLTIwMjQsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIFBhcnNlcyBjb21tYW5kIGxpbmUgYXJndW1lbnRzLS1zaW1zPXNpbTEsc2ltMiwuLi4gb3IgLS1zaW1MaXN0PXBhdGgvdG8vZmlsZW5hbWUgdG8gZ2V0IGEgbGlzdCBvZiBzaW1zLlxuICpcbiAqIEBhdXRob3IgU2FtIFJlaWQgKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXG4gKi9cblxuaW1wb3J0IGZzIGZyb20gJ2ZzJztcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gZ2V0U2ltTGlzdCgpOiBzdHJpbmdbXSB7XG4gIGNvbnN0IGFyZ3MgPSBwcm9jZXNzLmFyZ3Yuc2xpY2UoIDIgKTtcblxuICAvLyBpZiB0aGUgYXJnIGlzIGp1c3QgYSBmbGFnLCB0aGVuIHRoZSBjYWxsYmFjayB3aWxsIGJlIGNhbGxlZCB3aXRoIGEgbnVsbCBwYXJhbWV0ZXJcbiAgY29uc3QgcHJvY2Vzc0tleSA9ICgga2V5OiBzdHJpbmcsIGNhbGxiYWNrOiAoIHZhbHVlOiBzdHJpbmcgfCBudWxsICkgPT4gdm9pZCApID0+IHtcbiAgICBjb25zdCBwcmVmaXggPSBgLS0ke2tleX1gO1xuICAgIGNvbnN0IHZhbHVlcyA9IGFyZ3MuZmlsdGVyKCBhcmcgPT4gYXJnLnN0YXJ0c1dpdGgoIHByZWZpeCApICk7XG4gICAgaWYgKCB2YWx1ZXMubGVuZ3RoID09PSAxICkge1xuICAgICAgaWYgKCB2YWx1ZXNbIDAgXS5zdGFydHNXaXRoKCBgJHtwcmVmaXh9PWAgKSApIHtcbiAgICAgICAgY2FsbGJhY2soIHZhbHVlc1sgMCBdLnN1YnN0cmluZyggcHJlZml4Lmxlbmd0aCArIDEgKSApO1xuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgIGNhbGxiYWNrKCBudWxsICk7XG4gICAgICB9XG4gICAgfVxuICAgIGVsc2UgaWYgKCB2YWx1ZXMubGVuZ3RoID4gMSApIHtcbiAgICAgIGNvbnNvbGUubG9nKCBgVG9vIG1hbnkgLS0ke3ByZWZpeH0uLi4gc3BlY2lmaWVkYCApO1xuICAgICAgcHJvY2Vzcy5leGl0KCAxICk7XG4gICAgfVxuICB9O1xuXG4gIGxldCByZXBvczogc3RyaW5nW10gPSBbXTtcbiAgcHJvY2Vzc0tleSggJ3NpbUxpc3QnLCB2YWx1ZSA9PiB7XG4gICAgY29uc3QgY29udGVudHMgPSBmcy5yZWFkRmlsZVN5bmMoIHZhbHVlISwgJ3V0ZjgnICkudHJpbSgpO1xuICAgIHJlcG9zID0gY29udGVudHMuc3BsaXQoICdcXG4nICkubWFwKCBzaW0gPT4gc2ltLnRyaW0oKSApO1xuICB9ICk7XG4gIHByb2Nlc3NLZXkoICdzdGFibGUnLCAoKSA9PiB7XG4gICAgY29uc3QgY29udGVudHMgPSBmcy5yZWFkRmlsZVN5bmMoICcuLi9wZXJlbm5pYWwtYWxpYXMvZGF0YS9waGV0LWlvLWFwaS1zdGFibGUnLCAndXRmOCcgKS50cmltKCk7XG4gICAgcmVwb3MgPSBjb250ZW50cy5zcGxpdCggJ1xcbicgKS5tYXAoIHNpbSA9PiBzaW0udHJpbSgpICk7XG4gIH0gKTtcbiAgcHJvY2Vzc0tleSggJ3NpbXMnLCB2YWx1ZSA9PiB7XG4gICAgcmVwb3MgPSB2YWx1ZSEuc3BsaXQoICcsJyApO1xuICB9ICk7XG5cbiAgcmV0dXJuIHJlcG9zO1xufSJdLCJuYW1lcyI6WyJmcyIsImdldFNpbUxpc3QiLCJhcmdzIiwicHJvY2VzcyIsImFyZ3YiLCJzbGljZSIsInByb2Nlc3NLZXkiLCJrZXkiLCJjYWxsYmFjayIsInByZWZpeCIsInZhbHVlcyIsImZpbHRlciIsImFyZyIsInN0YXJ0c1dpdGgiLCJsZW5ndGgiLCJzdWJzdHJpbmciLCJjb25zb2xlIiwibG9nIiwiZXhpdCIsInJlcG9zIiwidmFsdWUiLCJjb250ZW50cyIsInJlYWRGaWxlU3luYyIsInRyaW0iLCJzcGxpdCIsIm1hcCIsInNpbSJdLCJtYXBwaW5ncyI6IkFBQUEsc0RBQXNEO0FBRXREOzs7O0NBSUMsR0FFRCxPQUFPQSxRQUFRLEtBQUs7QUFFcEIsZUFBZSxTQUFTQztJQUN0QixNQUFNQyxPQUFPQyxRQUFRQyxJQUFJLENBQUNDLEtBQUssQ0FBRTtJQUVqQyxvRkFBb0Y7SUFDcEYsTUFBTUMsYUFBYSxDQUFFQyxLQUFhQztRQUNoQyxNQUFNQyxTQUFTLENBQUMsRUFBRSxFQUFFRixLQUFLO1FBQ3pCLE1BQU1HLFNBQVNSLEtBQUtTLE1BQU0sQ0FBRUMsQ0FBQUEsTUFBT0EsSUFBSUMsVUFBVSxDQUFFSjtRQUNuRCxJQUFLQyxPQUFPSSxNQUFNLEtBQUssR0FBSTtZQUN6QixJQUFLSixNQUFNLENBQUUsRUFBRyxDQUFDRyxVQUFVLENBQUUsR0FBR0osT0FBTyxDQUFDLENBQUMsR0FBSztnQkFDNUNELFNBQVVFLE1BQU0sQ0FBRSxFQUFHLENBQUNLLFNBQVMsQ0FBRU4sT0FBT0ssTUFBTSxHQUFHO1lBQ25ELE9BQ0s7Z0JBQ0hOLFNBQVU7WUFDWjtRQUNGLE9BQ0ssSUFBS0UsT0FBT0ksTUFBTSxHQUFHLEdBQUk7WUFDNUJFLFFBQVFDLEdBQUcsQ0FBRSxDQUFDLFdBQVcsRUFBRVIsT0FBTyxhQUFhLENBQUM7WUFDaEROLFFBQVFlLElBQUksQ0FBRTtRQUNoQjtJQUNGO0lBRUEsSUFBSUMsUUFBa0IsRUFBRTtJQUN4QmIsV0FBWSxXQUFXYyxDQUFBQTtRQUNyQixNQUFNQyxXQUFXckIsR0FBR3NCLFlBQVksQ0FBRUYsT0FBUSxRQUFTRyxJQUFJO1FBQ3ZESixRQUFRRSxTQUFTRyxLQUFLLENBQUUsTUFBT0MsR0FBRyxDQUFFQyxDQUFBQSxNQUFPQSxJQUFJSCxJQUFJO0lBQ3JEO0lBQ0FqQixXQUFZLFVBQVU7UUFDcEIsTUFBTWUsV0FBV3JCLEdBQUdzQixZQUFZLENBQUUsOENBQThDLFFBQVNDLElBQUk7UUFDN0ZKLFFBQVFFLFNBQVNHLEtBQUssQ0FBRSxNQUFPQyxHQUFHLENBQUVDLENBQUFBLE1BQU9BLElBQUlILElBQUk7SUFDckQ7SUFDQWpCLFdBQVksUUFBUWMsQ0FBQUE7UUFDbEJELFFBQVFDLE1BQU9JLEtBQUssQ0FBRTtJQUN4QjtJQUVBLE9BQU9MO0FBQ1QifQ==