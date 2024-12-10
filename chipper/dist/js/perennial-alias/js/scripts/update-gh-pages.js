// Copyright 2024, University of Colorado Boulder
/**
 * Updates the gh-pages branches for various repos, including building of dot/kite/scenery
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
import winston from 'winston';
import execute from '../common/execute.js';
import gitAdd from '../common/gitAdd.js';
import gitCheckout from '../common/gitCheckout.js';
import gitCommit from '../common/gitCommit.js';
import gitIsClean from '../common/gitIsClean.js';
import gitPull from '../common/gitPull.js';
import gitPush from '../common/gitPush.js';
import gruntCommand from '../common/gruntCommand.js';
import npmUpdate from '../common/npmUpdate.js';
_async_to_generator(function*() {
    winston.info('Updating GitHub pages');
    const taggedRepos = [
        {
            repo: 'assert'
        },
        {
            repo: 'aqua'
        },
        {
            repo: 'tandem'
        },
        {
            repo: 'query-string-machine'
        },
        {
            repo: 'phet-core'
        },
        {
            repo: 'chipper'
        },
        {
            repo: 'sherpa'
        },
        {
            repo: 'axon'
        },
        {
            repo: 'dot',
            build: true
        },
        {
            repo: 'kite',
            build: true
        },
        {
            repo: 'scenery',
            build: true
        }
    ];
    for (const taggedRepo of taggedRepos){
        const repo = taggedRepo.repo;
        winston.info(`Updating ${repo}`);
        yield gitCheckout(repo, 'gh-pages');
        yield gitPull(repo);
        yield execute('git', [
            'merge',
            'main',
            '-m',
            'Update for gh-pages'
        ], `../${repo}`);
        if (taggedRepo.build) {
            yield npmUpdate(repo);
            winston.info(`Building ${repo}`);
            yield execute(gruntCommand, [], `../${repo}`);
            if (!(yield gitIsClean(repo))) {
                yield gitAdd(repo, 'build');
                yield gitCommit(repo, 'Updating for gh-pages build');
            }
        }
        yield gitPush(repo, 'gh-pages');
        yield gitCheckout(repo, 'main');
    }
})();

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3BlcmVubmlhbC1hbGlhcy9qcy9zY3JpcHRzL3VwZGF0ZS1naC1wYWdlcy50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAyNCwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbi8qKlxuICogVXBkYXRlcyB0aGUgZ2gtcGFnZXMgYnJhbmNoZXMgZm9yIHZhcmlvdXMgcmVwb3MsIGluY2x1ZGluZyBidWlsZGluZyBvZiBkb3Qva2l0ZS9zY2VuZXJ5XG4gKiBAYXV0aG9yIEpvbmF0aGFuIE9sc29uIDxqb25hdGhhbi5vbHNvbkBjb2xvcmFkby5lZHU+XG4gKi9cblxuaW1wb3J0IHdpbnN0b24gZnJvbSAnd2luc3Rvbic7XG5pbXBvcnQgZXhlY3V0ZSBmcm9tICcuLi9jb21tb24vZXhlY3V0ZS5qcyc7XG5pbXBvcnQgZ2l0QWRkIGZyb20gJy4uL2NvbW1vbi9naXRBZGQuanMnO1xuaW1wb3J0IGdpdENoZWNrb3V0IGZyb20gJy4uL2NvbW1vbi9naXRDaGVja291dC5qcyc7XG5pbXBvcnQgZ2l0Q29tbWl0IGZyb20gJy4uL2NvbW1vbi9naXRDb21taXQuanMnO1xuaW1wb3J0IGdpdElzQ2xlYW4gZnJvbSAnLi4vY29tbW9uL2dpdElzQ2xlYW4uanMnO1xuaW1wb3J0IGdpdFB1bGwgZnJvbSAnLi4vY29tbW9uL2dpdFB1bGwuanMnO1xuaW1wb3J0IGdpdFB1c2ggZnJvbSAnLi4vY29tbW9uL2dpdFB1c2guanMnO1xuaW1wb3J0IGdydW50Q29tbWFuZCBmcm9tICcuLi9jb21tb24vZ3J1bnRDb21tYW5kLmpzJztcbmltcG9ydCBucG1VcGRhdGUgZnJvbSAnLi4vY29tbW9uL25wbVVwZGF0ZS5qcyc7XG5cbiggKCBhc3luYyAoKSA9PiB7XG5cbiAgd2luc3Rvbi5pbmZvKCAnVXBkYXRpbmcgR2l0SHViIHBhZ2VzJyApO1xuXG4gIGNvbnN0IHRhZ2dlZFJlcG9zID0gW1xuICAgIHsgcmVwbzogJ2Fzc2VydCcgfSxcbiAgICB7IHJlcG86ICdhcXVhJyB9LFxuICAgIHsgcmVwbzogJ3RhbmRlbScgfSxcbiAgICB7IHJlcG86ICdxdWVyeS1zdHJpbmctbWFjaGluZScgfSxcbiAgICB7IHJlcG86ICdwaGV0LWNvcmUnIH0sXG4gICAgeyByZXBvOiAnY2hpcHBlcicgfSxcbiAgICB7IHJlcG86ICdzaGVycGEnIH0sXG4gICAgeyByZXBvOiAnYXhvbicgfSxcbiAgICB7IHJlcG86ICdkb3QnLCBidWlsZDogdHJ1ZSB9LFxuICAgIHsgcmVwbzogJ2tpdGUnLCBidWlsZDogdHJ1ZSB9LFxuICAgIHsgcmVwbzogJ3NjZW5lcnknLCBidWlsZDogdHJ1ZSB9XG4gIF07XG5cbiAgZm9yICggY29uc3QgdGFnZ2VkUmVwbyBvZiB0YWdnZWRSZXBvcyApIHtcbiAgICBjb25zdCByZXBvID0gdGFnZ2VkUmVwby5yZXBvO1xuXG4gICAgd2luc3Rvbi5pbmZvKCBgVXBkYXRpbmcgJHtyZXBvfWAgKTtcblxuICAgIGF3YWl0IGdpdENoZWNrb3V0KCByZXBvLCAnZ2gtcGFnZXMnICk7XG4gICAgYXdhaXQgZ2l0UHVsbCggcmVwbyApO1xuICAgIGF3YWl0IGV4ZWN1dGUoICdnaXQnLCBbICdtZXJnZScsICdtYWluJywgJy1tJywgJ1VwZGF0ZSBmb3IgZ2gtcGFnZXMnIF0sIGAuLi8ke3JlcG99YCApO1xuXG4gICAgaWYgKCB0YWdnZWRSZXBvLmJ1aWxkICkge1xuICAgICAgYXdhaXQgbnBtVXBkYXRlKCByZXBvICk7XG4gICAgICB3aW5zdG9uLmluZm8oIGBCdWlsZGluZyAke3JlcG99YCApO1xuICAgICAgYXdhaXQgZXhlY3V0ZSggZ3J1bnRDb21tYW5kLCBbXSwgYC4uLyR7cmVwb31gICk7XG5cbiAgICAgIGlmICggIWF3YWl0IGdpdElzQ2xlYW4oIHJlcG8gKSApIHtcbiAgICAgICAgYXdhaXQgZ2l0QWRkKCByZXBvLCAnYnVpbGQnICk7XG4gICAgICAgIGF3YWl0IGdpdENvbW1pdCggcmVwbywgJ1VwZGF0aW5nIGZvciBnaC1wYWdlcyBidWlsZCcgKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBhd2FpdCBnaXRQdXNoKCByZXBvLCAnZ2gtcGFnZXMnICk7XG4gICAgYXdhaXQgZ2l0Q2hlY2tvdXQoIHJlcG8sICdtYWluJyApO1xuICB9XG59ICkgKSgpOyJdLCJuYW1lcyI6WyJ3aW5zdG9uIiwiZXhlY3V0ZSIsImdpdEFkZCIsImdpdENoZWNrb3V0IiwiZ2l0Q29tbWl0IiwiZ2l0SXNDbGVhbiIsImdpdFB1bGwiLCJnaXRQdXNoIiwiZ3J1bnRDb21tYW5kIiwibnBtVXBkYXRlIiwiaW5mbyIsInRhZ2dlZFJlcG9zIiwicmVwbyIsImJ1aWxkIiwidGFnZ2VkUmVwbyJdLCJtYXBwaW5ncyI6IkFBQUEsaURBQWlEO0FBRWpEOzs7Q0FHQzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFFRCxPQUFPQSxhQUFhLFVBQVU7QUFDOUIsT0FBT0MsYUFBYSx1QkFBdUI7QUFDM0MsT0FBT0MsWUFBWSxzQkFBc0I7QUFDekMsT0FBT0MsaUJBQWlCLDJCQUEyQjtBQUNuRCxPQUFPQyxlQUFlLHlCQUF5QjtBQUMvQyxPQUFPQyxnQkFBZ0IsMEJBQTBCO0FBQ2pELE9BQU9DLGFBQWEsdUJBQXVCO0FBQzNDLE9BQU9DLGFBQWEsdUJBQXVCO0FBQzNDLE9BQU9DLGtCQUFrQiw0QkFBNEI7QUFDckQsT0FBT0MsZUFBZSx5QkFBeUI7QUFFM0Msb0JBQUE7SUFFRlQsUUFBUVUsSUFBSSxDQUFFO0lBRWQsTUFBTUMsY0FBYztRQUNsQjtZQUFFQyxNQUFNO1FBQVM7UUFDakI7WUFBRUEsTUFBTTtRQUFPO1FBQ2Y7WUFBRUEsTUFBTTtRQUFTO1FBQ2pCO1lBQUVBLE1BQU07UUFBdUI7UUFDL0I7WUFBRUEsTUFBTTtRQUFZO1FBQ3BCO1lBQUVBLE1BQU07UUFBVTtRQUNsQjtZQUFFQSxNQUFNO1FBQVM7UUFDakI7WUFBRUEsTUFBTTtRQUFPO1FBQ2Y7WUFBRUEsTUFBTTtZQUFPQyxPQUFPO1FBQUs7UUFDM0I7WUFBRUQsTUFBTTtZQUFRQyxPQUFPO1FBQUs7UUFDNUI7WUFBRUQsTUFBTTtZQUFXQyxPQUFPO1FBQUs7S0FDaEM7SUFFRCxLQUFNLE1BQU1DLGNBQWNILFlBQWM7UUFDdEMsTUFBTUMsT0FBT0UsV0FBV0YsSUFBSTtRQUU1QlosUUFBUVUsSUFBSSxDQUFFLENBQUMsU0FBUyxFQUFFRSxNQUFNO1FBRWhDLE1BQU1ULFlBQWFTLE1BQU07UUFDekIsTUFBTU4sUUFBU007UUFDZixNQUFNWCxRQUFTLE9BQU87WUFBRTtZQUFTO1lBQVE7WUFBTTtTQUF1QixFQUFFLENBQUMsR0FBRyxFQUFFVyxNQUFNO1FBRXBGLElBQUtFLFdBQVdELEtBQUssRUFBRztZQUN0QixNQUFNSixVQUFXRztZQUNqQlosUUFBUVUsSUFBSSxDQUFFLENBQUMsU0FBUyxFQUFFRSxNQUFNO1lBQ2hDLE1BQU1YLFFBQVNPLGNBQWMsRUFBRSxFQUFFLENBQUMsR0FBRyxFQUFFSSxNQUFNO1lBRTdDLElBQUssQ0FBQyxDQUFBLE1BQU1QLFdBQVlPLEtBQUssR0FBSTtnQkFDL0IsTUFBTVYsT0FBUVUsTUFBTTtnQkFDcEIsTUFBTVIsVUFBV1EsTUFBTTtZQUN6QjtRQUNGO1FBRUEsTUFBTUwsUUFBU0ssTUFBTTtRQUNyQixNQUFNVCxZQUFhUyxNQUFNO0lBQzNCO0FBQ0YifQ==