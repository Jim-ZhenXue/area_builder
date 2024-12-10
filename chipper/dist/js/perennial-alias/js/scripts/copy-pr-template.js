// Copyright 2023, University of Colorado Boulder
/**
 * Copy the pull request template to the core set of common repos.
 * This script is meant to be run in the root of the PhET project
 * directory.
 *
 * @author Liam Mulhall <liammulh@gmail.com>
 */ import { execSync } from 'node:child_process';
import { copyFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { chdir, cwd } from 'node:process';
import coreCommonRepos from './core-common-repos.js';
const pathToPrTemplate = join(cwd(), 'community', '.github', 'pull_request_template.md');
for (const repo of coreCommonRepos){
    const dest = join(cwd(), repo, '.github', 'pull_request_template.md');
    const destDir = dirname(dest);
    const destDirDoesNotExist = !existsSync(destDir);
    if (destDirDoesNotExist) {
        mkdirSync(destDir, {
            recursive: true
        });
    }
    copyFileSync(pathToPrTemplate, dest);
    chdir(repo);
    const commitMessage = '"automated commit from phetsims/community; adding PR template, see https://github.com/phetsims/community/issues/9"';
    const commands = [
        'git pull origin main',
        'git add .github',
        `git commit --message ${commitMessage} --no-verify`,
        'git push origin main'
    ];
    for (const command of commands){
        console.log(`executing command: ${command}`);
        execSync(command);
    }
    console.log('going back one directory');
    chdir('..');
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3BlcmVubmlhbC1hbGlhcy9qcy9zY3JpcHRzL2NvcHktcHItdGVtcGxhdGUuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjMsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIENvcHkgdGhlIHB1bGwgcmVxdWVzdCB0ZW1wbGF0ZSB0byB0aGUgY29yZSBzZXQgb2YgY29tbW9uIHJlcG9zLlxuICogVGhpcyBzY3JpcHQgaXMgbWVhbnQgdG8gYmUgcnVuIGluIHRoZSByb290IG9mIHRoZSBQaEVUIHByb2plY3RcbiAqIGRpcmVjdG9yeS5cbiAqXG4gKiBAYXV0aG9yIExpYW0gTXVsaGFsbCA8bGlhbW11bGhAZ21haWwuY29tPlxuICovXG5cbmltcG9ydCB7IGV4ZWNTeW5jIH0gZnJvbSAnbm9kZTpjaGlsZF9wcm9jZXNzJztcbmltcG9ydCB7IGNvcHlGaWxlU3luYywgZXhpc3RzU3luYywgbWtkaXJTeW5jIH0gZnJvbSAnbm9kZTpmcyc7XG5pbXBvcnQgeyBkaXJuYW1lLCBqb2luIH0gZnJvbSAnbm9kZTpwYXRoJztcbmltcG9ydCB7IGNoZGlyLCBjd2QgfSBmcm9tICdub2RlOnByb2Nlc3MnO1xuXG5pbXBvcnQgY29yZUNvbW1vblJlcG9zIGZyb20gJy4vY29yZS1jb21tb24tcmVwb3MuanMnO1xuXG5jb25zdCBwYXRoVG9QclRlbXBsYXRlID0gam9pbiggY3dkKCksICdjb21tdW5pdHknLCAnLmdpdGh1YicsICdwdWxsX3JlcXVlc3RfdGVtcGxhdGUubWQnICk7XG5cbmZvciAoIGNvbnN0IHJlcG8gb2YgY29yZUNvbW1vblJlcG9zICkge1xuICBjb25zdCBkZXN0ID0gam9pbiggY3dkKCksIHJlcG8sICcuZ2l0aHViJywgJ3B1bGxfcmVxdWVzdF90ZW1wbGF0ZS5tZCcgKTtcbiAgY29uc3QgZGVzdERpciA9IGRpcm5hbWUoIGRlc3QgKTtcbiAgY29uc3QgZGVzdERpckRvZXNOb3RFeGlzdCA9ICFleGlzdHNTeW5jKCBkZXN0RGlyICk7XG4gIGlmICggZGVzdERpckRvZXNOb3RFeGlzdCApIHtcbiAgICBta2RpclN5bmMoIGRlc3REaXIsIHsgcmVjdXJzaXZlOiB0cnVlIH0gKTtcbiAgfVxuICBjb3B5RmlsZVN5bmMoIHBhdGhUb1ByVGVtcGxhdGUsIGRlc3QgKTtcbiAgY2hkaXIoIHJlcG8gKTtcbiAgY29uc3QgY29tbWl0TWVzc2FnZSA9ICdcImF1dG9tYXRlZCBjb21taXQgZnJvbSBwaGV0c2ltcy9jb21tdW5pdHk7IGFkZGluZyBQUiB0ZW1wbGF0ZSwgc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9jb21tdW5pdHkvaXNzdWVzLzlcIic7XG4gIGNvbnN0IGNvbW1hbmRzID0gW1xuICAgICdnaXQgcHVsbCBvcmlnaW4gbWFpbicsXG4gICAgJ2dpdCBhZGQgLmdpdGh1YicsXG4gICAgYGdpdCBjb21taXQgLS1tZXNzYWdlICR7Y29tbWl0TWVzc2FnZX0gLS1uby12ZXJpZnlgLFxuICAgICdnaXQgcHVzaCBvcmlnaW4gbWFpbidcbiAgXTtcbiAgZm9yICggY29uc3QgY29tbWFuZCBvZiBjb21tYW5kcyApIHtcbiAgICBjb25zb2xlLmxvZyggYGV4ZWN1dGluZyBjb21tYW5kOiAke2NvbW1hbmR9YCApO1xuICAgIGV4ZWNTeW5jKCBjb21tYW5kICk7XG4gIH1cbiAgY29uc29sZS5sb2coICdnb2luZyBiYWNrIG9uZSBkaXJlY3RvcnknICk7XG4gIGNoZGlyKCAnLi4nICk7XG59Il0sIm5hbWVzIjpbImV4ZWNTeW5jIiwiY29weUZpbGVTeW5jIiwiZXhpc3RzU3luYyIsIm1rZGlyU3luYyIsImRpcm5hbWUiLCJqb2luIiwiY2hkaXIiLCJjd2QiLCJjb3JlQ29tbW9uUmVwb3MiLCJwYXRoVG9QclRlbXBsYXRlIiwicmVwbyIsImRlc3QiLCJkZXN0RGlyIiwiZGVzdERpckRvZXNOb3RFeGlzdCIsInJlY3Vyc2l2ZSIsImNvbW1pdE1lc3NhZ2UiLCJjb21tYW5kcyIsImNvbW1hbmQiLCJjb25zb2xlIiwibG9nIl0sIm1hcHBpbmdzIjoiQUFBQSxpREFBaUQ7QUFFakQ7Ozs7OztDQU1DLEdBRUQsU0FBU0EsUUFBUSxRQUFRLHFCQUFxQjtBQUM5QyxTQUFTQyxZQUFZLEVBQUVDLFVBQVUsRUFBRUMsU0FBUyxRQUFRLFVBQVU7QUFDOUQsU0FBU0MsT0FBTyxFQUFFQyxJQUFJLFFBQVEsWUFBWTtBQUMxQyxTQUFTQyxLQUFLLEVBQUVDLEdBQUcsUUFBUSxlQUFlO0FBRTFDLE9BQU9DLHFCQUFxQix5QkFBeUI7QUFFckQsTUFBTUMsbUJBQW1CSixLQUFNRSxPQUFPLGFBQWEsV0FBVztBQUU5RCxLQUFNLE1BQU1HLFFBQVFGLGdCQUFrQjtJQUNwQyxNQUFNRyxPQUFPTixLQUFNRSxPQUFPRyxNQUFNLFdBQVc7SUFDM0MsTUFBTUUsVUFBVVIsUUFBU087SUFDekIsTUFBTUUsc0JBQXNCLENBQUNYLFdBQVlVO0lBQ3pDLElBQUtDLHFCQUFzQjtRQUN6QlYsVUFBV1MsU0FBUztZQUFFRSxXQUFXO1FBQUs7SUFDeEM7SUFDQWIsYUFBY1Esa0JBQWtCRTtJQUNoQ0wsTUFBT0k7SUFDUCxNQUFNSyxnQkFBZ0I7SUFDdEIsTUFBTUMsV0FBVztRQUNmO1FBQ0E7UUFDQSxDQUFDLHFCQUFxQixFQUFFRCxjQUFjLFlBQVksQ0FBQztRQUNuRDtLQUNEO0lBQ0QsS0FBTSxNQUFNRSxXQUFXRCxTQUFXO1FBQ2hDRSxRQUFRQyxHQUFHLENBQUUsQ0FBQyxtQkFBbUIsRUFBRUYsU0FBUztRQUM1Q2pCLFNBQVVpQjtJQUNaO0lBQ0FDLFFBQVFDLEdBQUcsQ0FBRTtJQUNiYixNQUFPO0FBQ1QifQ==