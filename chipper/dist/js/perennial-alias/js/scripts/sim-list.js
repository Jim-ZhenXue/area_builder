// Copyright 2024, University of Colorado Boulder
/**
 * Prints out a list of live production HTML sims to stderr (can be filtered from other stdout output)
 * --versions : Outputs the sim version after its name.
 *
 * grunt doesn't work well with this, since grunt always prints out extra stuff to stdout. This is an independent
 * node.js script instead.
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */ function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
    try {
        var info = gen[key](arg);
        var value = info.value;
    } catch (error) {
        reject(error);
        return;
    }
    if (info.done) {
        resolve(value);
    } else {
        Promise.resolve(value).then(_next, _throw);
    }
}
function _async_to_generator(fn) {
    return function() {
        var self = this, args = arguments;
        return new Promise(function(resolve, reject) {
            var gen = fn.apply(self, args);
            function _next(value) {
                asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value);
            }
            function _throw(err) {
                asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err);
            }
            _next(undefined);
        });
    };
}
import winston from 'winston';
import simMetadata from '../common/simMetadata.js';
import getOption from '../grunt/tasks/util/getOption.js';
winston.default.transports.console.level = 'error';
_async_to_generator(function*() {
    const data = yield simMetadata({
        type: 'html'
    });
    // @ts-expect-error, remove in https://github.com/phetsims/perennial/issues/369
    console.log(data.projects.map((project)=>{
        let result = project.name.slice(project.name.indexOf('/') + 1);
        if (getOption('versions')) {
            result += ` ${project.version.major}.${project.version.minor}.${project.version.dev}`;
        }
        return result;
    }).join('\n'));
})();

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3BlcmVubmlhbC1hbGlhcy9qcy9zY3JpcHRzL3NpbS1saXN0LnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDI0LCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuLyoqXG4gKiBQcmludHMgb3V0IGEgbGlzdCBvZiBsaXZlIHByb2R1Y3Rpb24gSFRNTCBzaW1zIHRvIHN0ZGVyciAoY2FuIGJlIGZpbHRlcmVkIGZyb20gb3RoZXIgc3Rkb3V0IG91dHB1dClcbiAqIC0tdmVyc2lvbnMgOiBPdXRwdXRzIHRoZSBzaW0gdmVyc2lvbiBhZnRlciBpdHMgbmFtZS5cbiAqXG4gKiBncnVudCBkb2Vzbid0IHdvcmsgd2VsbCB3aXRoIHRoaXMsIHNpbmNlIGdydW50IGFsd2F5cyBwcmludHMgb3V0IGV4dHJhIHN0dWZmIHRvIHN0ZG91dC4gVGhpcyBpcyBhbiBpbmRlcGVuZGVudFxuICogbm9kZS5qcyBzY3JpcHQgaW5zdGVhZC5cbiAqXG4gKiBAYXV0aG9yIE1pY2hhZWwgS2F1em1hbm4gKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXG4gKi9cblxuaW1wb3J0IHdpbnN0b24gZnJvbSAnd2luc3Rvbic7XG5pbXBvcnQgc2ltTWV0YWRhdGEgZnJvbSAnLi4vY29tbW9uL3NpbU1ldGFkYXRhLmpzJztcbmltcG9ydCBnZXRPcHRpb24gZnJvbSAnLi4vZ3J1bnQvdGFza3MvdXRpbC9nZXRPcHRpb24uanMnO1xuXG53aW5zdG9uLmRlZmF1bHQudHJhbnNwb3J0cy5jb25zb2xlLmxldmVsID0gJ2Vycm9yJztcblxuKCBhc3luYyAoKSA9PiB7XG4gIGNvbnN0IGRhdGEgPSBhd2FpdCBzaW1NZXRhZGF0YSgge1xuICAgIHR5cGU6ICdodG1sJ1xuICB9ICk7XG4gIC8vIEB0cy1leHBlY3QtZXJyb3IsIHJlbW92ZSBpbiBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvcGVyZW5uaWFsL2lzc3Vlcy8zNjlcbiAgY29uc29sZS5sb2coIGRhdGEucHJvamVjdHMubWFwKCBwcm9qZWN0ID0+IHtcbiAgICBsZXQgcmVzdWx0ID0gcHJvamVjdC5uYW1lLnNsaWNlKCBwcm9qZWN0Lm5hbWUuaW5kZXhPZiggJy8nICkgKyAxICk7XG4gICAgaWYgKCBnZXRPcHRpb24oICd2ZXJzaW9ucycgKSApIHtcbiAgICAgIHJlc3VsdCArPSBgICR7cHJvamVjdC52ZXJzaW9uLm1ham9yfS4ke3Byb2plY3QudmVyc2lvbi5taW5vcn0uJHtwcm9qZWN0LnZlcnNpb24uZGV2fWA7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG4gIH0gKS5qb2luKCAnXFxuJyApICk7XG59ICkoKTsiXSwibmFtZXMiOlsid2luc3RvbiIsInNpbU1ldGFkYXRhIiwiZ2V0T3B0aW9uIiwiZGVmYXVsdCIsInRyYW5zcG9ydHMiLCJjb25zb2xlIiwibGV2ZWwiLCJkYXRhIiwidHlwZSIsImxvZyIsInByb2plY3RzIiwibWFwIiwicHJvamVjdCIsInJlc3VsdCIsIm5hbWUiLCJzbGljZSIsImluZGV4T2YiLCJ2ZXJzaW9uIiwibWFqb3IiLCJtaW5vciIsImRldiIsImpvaW4iXSwibWFwcGluZ3MiOiJBQUFBLGlEQUFpRDtBQUVqRDs7Ozs7Ozs7Q0FRQzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFFRCxPQUFPQSxhQUFhLFVBQVU7QUFDOUIsT0FBT0MsaUJBQWlCLDJCQUEyQjtBQUNuRCxPQUFPQyxlQUFlLG1DQUFtQztBQUV6REYsUUFBUUcsT0FBTyxDQUFDQyxVQUFVLENBQUNDLE9BQU8sQ0FBQ0MsS0FBSyxHQUFHO0FBRXpDLG9CQUFBO0lBQ0EsTUFBTUMsT0FBTyxNQUFNTixZQUFhO1FBQzlCTyxNQUFNO0lBQ1I7SUFDQSwrRUFBK0U7SUFDL0VILFFBQVFJLEdBQUcsQ0FBRUYsS0FBS0csUUFBUSxDQUFDQyxHQUFHLENBQUVDLENBQUFBO1FBQzlCLElBQUlDLFNBQVNELFFBQVFFLElBQUksQ0FBQ0MsS0FBSyxDQUFFSCxRQUFRRSxJQUFJLENBQUNFLE9BQU8sQ0FBRSxPQUFRO1FBQy9ELElBQUtkLFVBQVcsYUFBZTtZQUM3QlcsVUFBVSxDQUFDLENBQUMsRUFBRUQsUUFBUUssT0FBTyxDQUFDQyxLQUFLLENBQUMsQ0FBQyxFQUFFTixRQUFRSyxPQUFPLENBQUNFLEtBQUssQ0FBQyxDQUFDLEVBQUVQLFFBQVFLLE9BQU8sQ0FBQ0csR0FBRyxFQUFFO1FBQ3ZGO1FBQ0EsT0FBT1A7SUFDVCxHQUFJUSxJQUFJLENBQUU7QUFDWiJ9