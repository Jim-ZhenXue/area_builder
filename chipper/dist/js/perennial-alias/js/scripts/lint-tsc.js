// Copyright 2021, University of Colorado Boulder
/**
 * Lints and typechecks, reporting any errors
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
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
const execute = require('../common/execute').default;
const gruntCommand = require('../common/gruntCommand');
const winston = require('winston');
winston.default.transports.console.level = 'error';
// ANSI escape sequences to move to the right (in the same line) or to apply or reset colors
const red = '\u001b[31m';
const green = '\u001b[32m';
const reset = '\u001b[0m';
_async_to_generator(function*() {
    // {code:number,stdout:string,stderr:string}
    let lintResults = null;
    let typeCheckResults = null;
    const outputResult = (name, results)=>{
        if (results.code === 0) {
            console.log(`${green}${name} OK${reset}`);
        } else {
            console.log(`${red}${name} FAIL${reset}`);
            if (results.stdout.trim().length > 0) {
                console.log(results.stdout);
            }
            if (results.stderr.trim().length > 0) {
                console.log(results.stderr);
            }
        }
    };
    const runLint = /*#__PURE__*/ _async_to_generator(function*() {
        lintResults = yield execute(gruntCommand, [
            'lint',
            '--all'
        ], `${__dirname}/../../`, {
            errors: 'resolve'
        });
        outputResult('lint', lintResults);
    });
    const runTsc = /*#__PURE__*/ _async_to_generator(function*() {
        typeCheckResults = yield execute(gruntCommand, [
            'type-check',
            '--all'
        ], `${__dirname}/../../`, {
            errors: 'resolve'
        });
        outputResult('type-check', typeCheckResults);
    });
    // const runAPIChecks = async () => {
    //   lintResults = await execute( gruntCommand, [ 'compare-phet-io-api', '--stable' ], `${__dirname}/../../../chipper`, {
    //     errors: 'resolve'
    //   } );
    //   outputResult( 'compare-phet-io-api', lintResults );
    // };
    // await Promise.all( [ runLint(), runTsc(), runAPIChecks() ] );
    yield Promise.all([
        runLint(),
        runTsc()
    ]);
    console.log(`\n${lintResults.code === 0 && typeCheckResults.code === 0 ? green : red}-----=====] finished [=====-----${reset}\n`);
})();

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3BlcmVubmlhbC1hbGlhcy9qcy9zY3JpcHRzL2xpbnQtdHNjLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDIxLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuLyoqXG4gKiBMaW50cyBhbmQgdHlwZWNoZWNrcywgcmVwb3J0aW5nIGFueSBlcnJvcnNcbiAqXG4gKiBAYXV0aG9yIEpvbmF0aGFuIE9sc29uIDxqb25hdGhhbi5vbHNvbkBjb2xvcmFkby5lZHU+XG4gKi9cblxuY29uc3QgZXhlY3V0ZSA9IHJlcXVpcmUoICcuLi9jb21tb24vZXhlY3V0ZScgKS5kZWZhdWx0O1xuY29uc3QgZ3J1bnRDb21tYW5kID0gcmVxdWlyZSggJy4uL2NvbW1vbi9ncnVudENvbW1hbmQnICk7XG5jb25zdCB3aW5zdG9uID0gcmVxdWlyZSggJ3dpbnN0b24nICk7XG5cbndpbnN0b24uZGVmYXVsdC50cmFuc3BvcnRzLmNvbnNvbGUubGV2ZWwgPSAnZXJyb3InO1xuXG4vLyBBTlNJIGVzY2FwZSBzZXF1ZW5jZXMgdG8gbW92ZSB0byB0aGUgcmlnaHQgKGluIHRoZSBzYW1lIGxpbmUpIG9yIHRvIGFwcGx5IG9yIHJlc2V0IGNvbG9yc1xuY29uc3QgcmVkID0gJ1xcdTAwMWJbMzFtJztcbmNvbnN0IGdyZWVuID0gJ1xcdTAwMWJbMzJtJztcbmNvbnN0IHJlc2V0ID0gJ1xcdTAwMWJbMG0nO1xuXG4oIGFzeW5jICgpID0+IHtcblxuICAvLyB7Y29kZTpudW1iZXIsc3Rkb3V0OnN0cmluZyxzdGRlcnI6c3RyaW5nfVxuICBsZXQgbGludFJlc3VsdHMgPSBudWxsO1xuICBsZXQgdHlwZUNoZWNrUmVzdWx0cyA9IG51bGw7XG5cbiAgY29uc3Qgb3V0cHV0UmVzdWx0ID0gKCBuYW1lLCByZXN1bHRzICkgPT4ge1xuICAgIGlmICggcmVzdWx0cy5jb2RlID09PSAwICkge1xuICAgICAgY29uc29sZS5sb2coIGAke2dyZWVufSR7bmFtZX0gT0ske3Jlc2V0fWAgKTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICBjb25zb2xlLmxvZyggYCR7cmVkfSR7bmFtZX0gRkFJTCR7cmVzZXR9YCApO1xuXG4gICAgICBpZiAoIHJlc3VsdHMuc3Rkb3V0LnRyaW0oKS5sZW5ndGggPiAwICkge1xuICAgICAgICBjb25zb2xlLmxvZyggcmVzdWx0cy5zdGRvdXQgKTtcbiAgICAgIH1cbiAgICAgIGlmICggcmVzdWx0cy5zdGRlcnIudHJpbSgpLmxlbmd0aCA+IDAgKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCByZXN1bHRzLnN0ZGVyciApO1xuICAgICAgfVxuICAgIH1cbiAgfTtcblxuICBjb25zdCBydW5MaW50ID0gYXN5bmMgKCkgPT4ge1xuICAgIGxpbnRSZXN1bHRzID0gYXdhaXQgZXhlY3V0ZSggZ3J1bnRDb21tYW5kLCBbICdsaW50JywgJy0tYWxsJyBdLCBgJHtfX2Rpcm5hbWV9Ly4uLy4uL2AsIHtcbiAgICAgIGVycm9yczogJ3Jlc29sdmUnXG4gICAgfSApO1xuICAgIG91dHB1dFJlc3VsdCggJ2xpbnQnLCBsaW50UmVzdWx0cyApO1xuICB9O1xuXG4gIGNvbnN0IHJ1blRzYyA9IGFzeW5jICgpID0+IHtcbiAgICB0eXBlQ2hlY2tSZXN1bHRzID0gYXdhaXQgZXhlY3V0ZSggZ3J1bnRDb21tYW5kLCBbICd0eXBlLWNoZWNrJywgJy0tYWxsJyBdLCBgJHtfX2Rpcm5hbWV9Ly4uLy4uL2AsIHtcbiAgICAgIGVycm9yczogJ3Jlc29sdmUnXG4gICAgfSApO1xuICAgIG91dHB1dFJlc3VsdCggJ3R5cGUtY2hlY2snLCB0eXBlQ2hlY2tSZXN1bHRzICk7XG4gIH07XG5cbiAgLy8gY29uc3QgcnVuQVBJQ2hlY2tzID0gYXN5bmMgKCkgPT4ge1xuICAvLyAgIGxpbnRSZXN1bHRzID0gYXdhaXQgZXhlY3V0ZSggZ3J1bnRDb21tYW5kLCBbICdjb21wYXJlLXBoZXQtaW8tYXBpJywgJy0tc3RhYmxlJyBdLCBgJHtfX2Rpcm5hbWV9Ly4uLy4uLy4uL2NoaXBwZXJgLCB7XG4gIC8vICAgICBlcnJvcnM6ICdyZXNvbHZlJ1xuICAvLyAgIH0gKTtcbiAgLy8gICBvdXRwdXRSZXN1bHQoICdjb21wYXJlLXBoZXQtaW8tYXBpJywgbGludFJlc3VsdHMgKTtcbiAgLy8gfTtcblxuICAvLyBhd2FpdCBQcm9taXNlLmFsbCggWyBydW5MaW50KCksIHJ1blRzYygpLCBydW5BUElDaGVja3MoKSBdICk7XG4gIGF3YWl0IFByb21pc2UuYWxsKCBbIHJ1bkxpbnQoKSwgcnVuVHNjKCkgXSApO1xuXG4gIGNvbnNvbGUubG9nKCBgXFxuJHtsaW50UmVzdWx0cy5jb2RlID09PSAwICYmIHR5cGVDaGVja1Jlc3VsdHMuY29kZSA9PT0gMCA/IGdyZWVuIDogcmVkfS0tLS0tPT09PT1dIGZpbmlzaGVkIFs9PT09PS0tLS0tJHtyZXNldH1cXG5gICk7XG59ICkoKTsiXSwibmFtZXMiOlsiZXhlY3V0ZSIsInJlcXVpcmUiLCJkZWZhdWx0IiwiZ3J1bnRDb21tYW5kIiwid2luc3RvbiIsInRyYW5zcG9ydHMiLCJjb25zb2xlIiwibGV2ZWwiLCJyZWQiLCJncmVlbiIsInJlc2V0IiwibGludFJlc3VsdHMiLCJ0eXBlQ2hlY2tSZXN1bHRzIiwib3V0cHV0UmVzdWx0IiwibmFtZSIsInJlc3VsdHMiLCJjb2RlIiwibG9nIiwic3Rkb3V0IiwidHJpbSIsImxlbmd0aCIsInN0ZGVyciIsInJ1bkxpbnQiLCJfX2Rpcm5hbWUiLCJlcnJvcnMiLCJydW5Uc2MiLCJQcm9taXNlIiwiYWxsIl0sIm1hcHBpbmdzIjoiQUFBQSxpREFBaUQ7QUFFakQ7Ozs7Q0FJQzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFFRCxNQUFNQSxVQUFVQyxRQUFTLHFCQUFzQkMsT0FBTztBQUN0RCxNQUFNQyxlQUFlRixRQUFTO0FBQzlCLE1BQU1HLFVBQVVILFFBQVM7QUFFekJHLFFBQVFGLE9BQU8sQ0FBQ0csVUFBVSxDQUFDQyxPQUFPLENBQUNDLEtBQUssR0FBRztBQUUzQyw0RkFBNEY7QUFDNUYsTUFBTUMsTUFBTTtBQUNaLE1BQU1DLFFBQVE7QUFDZCxNQUFNQyxRQUFRO0FBRVosb0JBQUE7SUFFQSw0Q0FBNEM7SUFDNUMsSUFBSUMsY0FBYztJQUNsQixJQUFJQyxtQkFBbUI7SUFFdkIsTUFBTUMsZUFBZSxDQUFFQyxNQUFNQztRQUMzQixJQUFLQSxRQUFRQyxJQUFJLEtBQUssR0FBSTtZQUN4QlYsUUFBUVcsR0FBRyxDQUFFLEdBQUdSLFFBQVFLLEtBQUssR0FBRyxFQUFFSixPQUFPO1FBQzNDLE9BQ0s7WUFDSEosUUFBUVcsR0FBRyxDQUFFLEdBQUdULE1BQU1NLEtBQUssS0FBSyxFQUFFSixPQUFPO1lBRXpDLElBQUtLLFFBQVFHLE1BQU0sQ0FBQ0MsSUFBSSxHQUFHQyxNQUFNLEdBQUcsR0FBSTtnQkFDdENkLFFBQVFXLEdBQUcsQ0FBRUYsUUFBUUcsTUFBTTtZQUM3QjtZQUNBLElBQUtILFFBQVFNLE1BQU0sQ0FBQ0YsSUFBSSxHQUFHQyxNQUFNLEdBQUcsR0FBSTtnQkFDdENkLFFBQVFXLEdBQUcsQ0FBRUYsUUFBUU0sTUFBTTtZQUM3QjtRQUNGO0lBQ0Y7SUFFQSxNQUFNQyw0Q0FBVTtRQUNkWCxjQUFjLE1BQU1YLFFBQVNHLGNBQWM7WUFBRTtZQUFRO1NBQVMsRUFBRSxHQUFHb0IsVUFBVSxPQUFPLENBQUMsRUFBRTtZQUNyRkMsUUFBUTtRQUNWO1FBQ0FYLGFBQWMsUUFBUUY7SUFDeEI7SUFFQSxNQUFNYywyQ0FBUztRQUNiYixtQkFBbUIsTUFBTVosUUFBU0csY0FBYztZQUFFO1lBQWM7U0FBUyxFQUFFLEdBQUdvQixVQUFVLE9BQU8sQ0FBQyxFQUFFO1lBQ2hHQyxRQUFRO1FBQ1Y7UUFDQVgsYUFBYyxjQUFjRDtJQUM5QjtJQUVBLHFDQUFxQztJQUNyQyx5SEFBeUg7SUFDekgsd0JBQXdCO0lBQ3hCLFNBQVM7SUFDVCx3REFBd0Q7SUFDeEQsS0FBSztJQUVMLGdFQUFnRTtJQUNoRSxNQUFNYyxRQUFRQyxHQUFHLENBQUU7UUFBRUw7UUFBV0c7S0FBVTtJQUUxQ25CLFFBQVFXLEdBQUcsQ0FBRSxDQUFDLEVBQUUsRUFBRU4sWUFBWUssSUFBSSxLQUFLLEtBQUtKLGlCQUFpQkksSUFBSSxLQUFLLElBQUlQLFFBQVFELElBQUksZ0NBQWdDLEVBQUVFLE1BQU0sRUFBRSxDQUFDO0FBQ25JIn0=