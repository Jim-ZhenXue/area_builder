// Copyright 2021, University of Colorado Boulder
function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
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
import booleanPrompt from '../common/booleanPrompt.js';
import execute from '../common/execute.js';
/**
 * Copy the history of a file or directory to a different repo.
 *
 * ### REQUIREMENT: `git filter-repo`############################################
 * ###
 * ### This process requires the command `git filter-repo`, which is recommended by the git documentation as an improvement
 * ### over `git filter-branch`, https://git-scm.com/docs/git-filter-branch#_warning. I used `git --exec-path` to see the
 * ### path for auxiliary git commands.
 * ###
 * ### On SR's mac it was `/Library/Developer/CommandLineTools/usr/libexec/git-core`
 * ### On SR's win it was `/C/Program\ Files/Git/mingw64/libexec/git-core`
 * ### On MK's win it was `/C/Program\ Files\ (x86)/Git/mingw32/libexec/git-core`
 * ###
 * ### Installing `git filter-repo` on Windows consisted of these steps:
 * ### 1. Install python and confirm it is in the path and works from the command line
 * ### 2. Copy the raw contents of https://github.com/newren/git-filter-repo/blob/main/git-filter-repo into a file
 *        "git-filter-repo" in the --exec-path (it is easiest to write a file to you desktop and then click and drag
 *        the file into the admin-protected directory).
 * ### 3. If your system uses "python" instead of "python3", change that in the 1st line of the file.
 * ### 4. Test using "git filter-repo", if it is installed correctly it will say something like: "No arguments specified"
 * ###
 * ### More instructions about installing are listed here:
 * ### https://github.com/newren/git-filter-repo#how-do-i-install-it
 * ##############################################################################
 *
 * USAGE:
 * sage run perennial/js/scripts/copy-history-to-different-repo.ts source-path destination-repo
 *
 * EXAMPLE:
 * sage run perennial/js/scripts/copy-history-to-different-repo.ts center-and-variability/js/common/view/QuestionBar.ts scenery-phet
 * sage run perennial/js/scripts/copy-history-to-different-repo.ts counting-common/js/ number-suite-common
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Chris Klusendorf (PhET Interactive Simulations)
 */ _async_to_generator(function*() {
    const args = process.argv.slice(2);
    const sourceRepo = args[0].split('/')[0];
    const relativePath = args[0].split('/').slice(1).join('/');
    const targetRepo = args[1];
    console.log(`Copying ${relativePath} from ${sourceRepo} to ${targetRepo}`);
    // git log --oneline --follow -M --name-status -- js/ABSwitch.ts
    // const stdout = await execute( 'git', `log --oneline --follow -M --name-status -- ${relativePath}`.split( ' ' ), `./perennial/${sourceRepo}` );
    const gitlog = yield execute('git', `log --oneline --follow -M --name-status -- ${relativePath}`.split(' '), `./${sourceRepo}`);
    const allFilenames = new Set();
    gitlog.split('\n').forEach((line)=>{
        if (line.length > 0 && // Catch lines that start with an uppercase letter
        line[0].toUpperCase() === line[0] && // Avoid lines that do not start with a letter.  Only letters have uppercase and lowercase
        line[0].toUpperCase() !== line[0].toLowerCase()) {
            const terms = line.split('\t');
            const filenamesFromTerm = terms.slice(1);
            filenamesFromTerm.forEach((filenameFromTerm)=>{
                allFilenames.add(filenameFromTerm);
            });
        }
    });
    const filenameArray = Array.from(allFilenames.values());
    console.log(filenameArray.join('\n'));
    // git clone https://github.com/phetsims/vegas.git vegas-backup
    const historyCopyRepo = `${sourceRepo}-history-copy`;
    yield execute('git', `clone -b main --single-branch https://github.com/phetsims/${sourceRepo}.git ${historyCopyRepo}`.split(' '), '.');
    const filterArgs = [
        'filter-repo'
    ];
    filenameArray.forEach((filename)=>{
        filterArgs.push('--path');
        filterArgs.push(filename);
    });
    console.log(filterArgs.join(' '));
    const filterResults = yield execute('git', filterArgs, historyCopyRepo);
    console.log(filterResults);
    if (!(yield booleanPrompt(`Please inspect the filtered repo ${historyCopyRepo} to make sure it is ready for 
  merging. It should include all detected files:\n\n${filenameArray.join('\n')}\nWant to merge into ${targetRepo}?`, false))) {
        console.log('Aborted');
        return;
    }
    yield execute('git', `remote add ${historyCopyRepo} ../${historyCopyRepo}`.split(' '), `./${targetRepo}`);
    yield execute('git', `fetch ${historyCopyRepo}`.split(' '), `./${targetRepo}`);
    yield execute('git', `merge ${historyCopyRepo}/main --allow-unrelated`.split(' '), `./${targetRepo}`);
    yield execute('git', `remote remove ${historyCopyRepo}`.split(' '), `./${targetRepo}`);
    const aboutToPush = yield execute('git', 'diff --stat --cached origin/main'.split(' '), `./${targetRepo}`);
    console.log('About to push: ' + aboutToPush);
    const unpushedCommits = yield execute('git', 'log origin/main..main'.split(' '), `./${targetRepo}`);
    console.log(unpushedCommits);
    console.log(`Merged into target repo ${targetRepo}. The remaining steps are manual:   
* Inspect the merged repo ${targetRepo} files and history and see if the result looks good.
* Delete the temporary cloned repo: rm -rf ${historyCopyRepo}
* Update the namespace and registry statement, if appropriate.
* Move the file to the desired directory.
* Type-check, lint and test the new code.
* If the history, file, type checks and lint all seem good, git push the changes. (otherwise re-clone).
* Delete the copy in the prior directory. In the commit message, refer to an issue so there is a paper trail.
`);
    // When running tsx in combination with readline, the process does not exit properly, so we need to force it. See https://github.com/phetsims/perennial/issues/389
    process.exit(0);
})();

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3BlcmVubmlhbC1hbGlhcy9qcy9zY3JpcHRzL2NvcHktaGlzdG9yeS10by1kaWZmZXJlbnQtcmVwby50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAyMSwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbmltcG9ydCBib29sZWFuUHJvbXB0IGZyb20gJy4uL2NvbW1vbi9ib29sZWFuUHJvbXB0LmpzJztcbmltcG9ydCBleGVjdXRlIGZyb20gJy4uL2NvbW1vbi9leGVjdXRlLmpzJztcblxuLyoqXG4gKiBDb3B5IHRoZSBoaXN0b3J5IG9mIGEgZmlsZSBvciBkaXJlY3RvcnkgdG8gYSBkaWZmZXJlbnQgcmVwby5cbiAqXG4gKiAjIyMgUkVRVUlSRU1FTlQ6IGBnaXQgZmlsdGVyLXJlcG9gIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyNcbiAqICMjI1xuICogIyMjIFRoaXMgcHJvY2VzcyByZXF1aXJlcyB0aGUgY29tbWFuZCBgZ2l0IGZpbHRlci1yZXBvYCwgd2hpY2ggaXMgcmVjb21tZW5kZWQgYnkgdGhlIGdpdCBkb2N1bWVudGF0aW9uIGFzIGFuIGltcHJvdmVtZW50XG4gKiAjIyMgb3ZlciBgZ2l0IGZpbHRlci1icmFuY2hgLCBodHRwczovL2dpdC1zY20uY29tL2RvY3MvZ2l0LWZpbHRlci1icmFuY2gjX3dhcm5pbmcuIEkgdXNlZCBgZ2l0IC0tZXhlYy1wYXRoYCB0byBzZWUgdGhlXG4gKiAjIyMgcGF0aCBmb3IgYXV4aWxpYXJ5IGdpdCBjb21tYW5kcy5cbiAqICMjI1xuICogIyMjIE9uIFNSJ3MgbWFjIGl0IHdhcyBgL0xpYnJhcnkvRGV2ZWxvcGVyL0NvbW1hbmRMaW5lVG9vbHMvdXNyL2xpYmV4ZWMvZ2l0LWNvcmVgXG4gKiAjIyMgT24gU1IncyB3aW4gaXQgd2FzIGAvQy9Qcm9ncmFtXFwgRmlsZXMvR2l0L21pbmd3NjQvbGliZXhlYy9naXQtY29yZWBcbiAqICMjIyBPbiBNSydzIHdpbiBpdCB3YXMgYC9DL1Byb2dyYW1cXCBGaWxlc1xcICh4ODYpL0dpdC9taW5ndzMyL2xpYmV4ZWMvZ2l0LWNvcmVgXG4gKiAjIyNcbiAqICMjIyBJbnN0YWxsaW5nIGBnaXQgZmlsdGVyLXJlcG9gIG9uIFdpbmRvd3MgY29uc2lzdGVkIG9mIHRoZXNlIHN0ZXBzOlxuICogIyMjIDEuIEluc3RhbGwgcHl0aG9uIGFuZCBjb25maXJtIGl0IGlzIGluIHRoZSBwYXRoIGFuZCB3b3JrcyBmcm9tIHRoZSBjb21tYW5kIGxpbmVcbiAqICMjIyAyLiBDb3B5IHRoZSByYXcgY29udGVudHMgb2YgaHR0cHM6Ly9naXRodWIuY29tL25ld3Jlbi9naXQtZmlsdGVyLXJlcG8vYmxvYi9tYWluL2dpdC1maWx0ZXItcmVwbyBpbnRvIGEgZmlsZVxuICogICAgICAgIFwiZ2l0LWZpbHRlci1yZXBvXCIgaW4gdGhlIC0tZXhlYy1wYXRoIChpdCBpcyBlYXNpZXN0IHRvIHdyaXRlIGEgZmlsZSB0byB5b3UgZGVza3RvcCBhbmQgdGhlbiBjbGljayBhbmQgZHJhZ1xuICogICAgICAgIHRoZSBmaWxlIGludG8gdGhlIGFkbWluLXByb3RlY3RlZCBkaXJlY3RvcnkpLlxuICogIyMjIDMuIElmIHlvdXIgc3lzdGVtIHVzZXMgXCJweXRob25cIiBpbnN0ZWFkIG9mIFwicHl0aG9uM1wiLCBjaGFuZ2UgdGhhdCBpbiB0aGUgMXN0IGxpbmUgb2YgdGhlIGZpbGUuXG4gKiAjIyMgNC4gVGVzdCB1c2luZyBcImdpdCBmaWx0ZXItcmVwb1wiLCBpZiBpdCBpcyBpbnN0YWxsZWQgY29ycmVjdGx5IGl0IHdpbGwgc2F5IHNvbWV0aGluZyBsaWtlOiBcIk5vIGFyZ3VtZW50cyBzcGVjaWZpZWRcIlxuICogIyMjXG4gKiAjIyMgTW9yZSBpbnN0cnVjdGlvbnMgYWJvdXQgaW5zdGFsbGluZyBhcmUgbGlzdGVkIGhlcmU6XG4gKiAjIyMgaHR0cHM6Ly9naXRodWIuY29tL25ld3Jlbi9naXQtZmlsdGVyLXJlcG8jaG93LWRvLWktaW5zdGFsbC1pdFxuICogIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjXG4gKlxuICogVVNBR0U6XG4gKiBzYWdlIHJ1biBwZXJlbm5pYWwvanMvc2NyaXB0cy9jb3B5LWhpc3RvcnktdG8tZGlmZmVyZW50LXJlcG8udHMgc291cmNlLXBhdGggZGVzdGluYXRpb24tcmVwb1xuICpcbiAqIEVYQU1QTEU6XG4gKiBzYWdlIHJ1biBwZXJlbm5pYWwvanMvc2NyaXB0cy9jb3B5LWhpc3RvcnktdG8tZGlmZmVyZW50LXJlcG8udHMgY2VudGVyLWFuZC12YXJpYWJpbGl0eS9qcy9jb21tb24vdmlldy9RdWVzdGlvbkJhci50cyBzY2VuZXJ5LXBoZXRcbiAqIHNhZ2UgcnVuIHBlcmVubmlhbC9qcy9zY3JpcHRzL2NvcHktaGlzdG9yeS10by1kaWZmZXJlbnQtcmVwby50cyBjb3VudGluZy1jb21tb24vanMvIG51bWJlci1zdWl0ZS1jb21tb25cbiAqXG4gKiBAYXV0aG9yIFNhbSBSZWlkIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxuICogQGF1dGhvciBDaHJpcyBLbHVzZW5kb3JmIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxuICovXG4oIGFzeW5jICgpID0+IHtcbiAgY29uc3QgYXJncyA9IHByb2Nlc3MuYXJndi5zbGljZSggMiApO1xuXG4gIGNvbnN0IHNvdXJjZVJlcG8gPSBhcmdzWyAwIF0uc3BsaXQoICcvJyApWyAwIF07XG4gIGNvbnN0IHJlbGF0aXZlUGF0aCA9IGFyZ3NbIDAgXS5zcGxpdCggJy8nICkuc2xpY2UoIDEgKS5qb2luKCAnLycgKTtcblxuICBjb25zdCB0YXJnZXRSZXBvID0gYXJnc1sgMSBdO1xuXG4gIGNvbnNvbGUubG9nKCBgQ29weWluZyAke3JlbGF0aXZlUGF0aH0gZnJvbSAke3NvdXJjZVJlcG99IHRvICR7dGFyZ2V0UmVwb31gICk7XG5cbiAgLy8gZ2l0IGxvZyAtLW9uZWxpbmUgLS1mb2xsb3cgLU0gLS1uYW1lLXN0YXR1cyAtLSBqcy9BQlN3aXRjaC50c1xuICAvLyBjb25zdCBzdGRvdXQgPSBhd2FpdCBleGVjdXRlKCAnZ2l0JywgYGxvZyAtLW9uZWxpbmUgLS1mb2xsb3cgLU0gLS1uYW1lLXN0YXR1cyAtLSAke3JlbGF0aXZlUGF0aH1gLnNwbGl0KCAnICcgKSwgYC4vcGVyZW5uaWFsLyR7c291cmNlUmVwb31gICk7XG4gIGNvbnN0IGdpdGxvZyA9IGF3YWl0IGV4ZWN1dGUoICdnaXQnLCBgbG9nIC0tb25lbGluZSAtLWZvbGxvdyAtTSAtLW5hbWUtc3RhdHVzIC0tICR7cmVsYXRpdmVQYXRofWAuc3BsaXQoICcgJyApLCBgLi8ke3NvdXJjZVJlcG99YCApO1xuXG4gIGNvbnN0IGFsbEZpbGVuYW1lcyA9IG5ldyBTZXQ8c3RyaW5nPigpO1xuICBnaXRsb2cuc3BsaXQoICdcXG4nICkuZm9yRWFjaCggKCBsaW5lOiBzdHJpbmcgKSA9PiB7XG4gICAgaWYgKCBsaW5lLmxlbmd0aCA+IDAgJiZcblxuICAgICAgICAgLy8gQ2F0Y2ggbGluZXMgdGhhdCBzdGFydCB3aXRoIGFuIHVwcGVyY2FzZSBsZXR0ZXJcbiAgICAgICAgIGxpbmVbIDAgXS50b1VwcGVyQ2FzZSgpID09PSBsaW5lWyAwIF0gJiZcblxuICAgICAgICAgLy8gQXZvaWQgbGluZXMgdGhhdCBkbyBub3Qgc3RhcnQgd2l0aCBhIGxldHRlci4gIE9ubHkgbGV0dGVycyBoYXZlIHVwcGVyY2FzZSBhbmQgbG93ZXJjYXNlXG4gICAgICAgICBsaW5lWyAwIF0udG9VcHBlckNhc2UoKSAhPT0gbGluZVsgMCBdLnRvTG93ZXJDYXNlKClcbiAgICApIHtcbiAgICAgIGNvbnN0IHRlcm1zID0gbGluZS5zcGxpdCggJ1xcdCcgKTtcbiAgICAgIGNvbnN0IGZpbGVuYW1lc0Zyb21UZXJtID0gdGVybXMuc2xpY2UoIDEgKTtcblxuICAgICAgZmlsZW5hbWVzRnJvbVRlcm0uZm9yRWFjaCggZmlsZW5hbWVGcm9tVGVybSA9PiB7XG4gICAgICAgIGFsbEZpbGVuYW1lcy5hZGQoIGZpbGVuYW1lRnJvbVRlcm0gKTtcbiAgICAgIH0gKTtcbiAgICB9XG4gIH0gKTtcblxuICBjb25zdCBmaWxlbmFtZUFycmF5ID0gQXJyYXkuZnJvbSggYWxsRmlsZW5hbWVzLnZhbHVlcygpICk7XG4gIGNvbnNvbGUubG9nKCBmaWxlbmFtZUFycmF5LmpvaW4oICdcXG4nICkgKTtcblxuICAvLyBnaXQgY2xvbmUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3ZlZ2FzLmdpdCB2ZWdhcy1iYWNrdXBcbiAgY29uc3QgaGlzdG9yeUNvcHlSZXBvID0gYCR7c291cmNlUmVwb30taGlzdG9yeS1jb3B5YDtcbiAgYXdhaXQgZXhlY3V0ZSggJ2dpdCcsIGBjbG9uZSAtYiBtYWluIC0tc2luZ2xlLWJyYW5jaCBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvJHtzb3VyY2VSZXBvfS5naXQgJHtoaXN0b3J5Q29weVJlcG99YC5zcGxpdCggJyAnICksICcuJyApO1xuXG4gIGNvbnN0IGZpbHRlckFyZ3M6IHN0cmluZ1tdID0gWyAnZmlsdGVyLXJlcG8nIF07XG4gIGZpbGVuYW1lQXJyYXkuZm9yRWFjaCggZmlsZW5hbWUgPT4ge1xuICAgIGZpbHRlckFyZ3MucHVzaCggJy0tcGF0aCcgKTtcbiAgICBmaWx0ZXJBcmdzLnB1c2goIGZpbGVuYW1lICk7XG4gIH0gKTtcbiAgY29uc29sZS5sb2coIGZpbHRlckFyZ3Muam9pbiggJyAnICkgKTtcbiAgY29uc3QgZmlsdGVyUmVzdWx0cyA9IGF3YWl0IGV4ZWN1dGUoICdnaXQnLCBmaWx0ZXJBcmdzLCBoaXN0b3J5Q29weVJlcG8gKTtcblxuICBjb25zb2xlLmxvZyggZmlsdGVyUmVzdWx0cyApO1xuXG4gIGlmICggIWF3YWl0IGJvb2xlYW5Qcm9tcHQoIGBQbGVhc2UgaW5zcGVjdCB0aGUgZmlsdGVyZWQgcmVwbyAke2hpc3RvcnlDb3B5UmVwb30gdG8gbWFrZSBzdXJlIGl0IGlzIHJlYWR5IGZvciBcbiAgbWVyZ2luZy4gSXQgc2hvdWxkIGluY2x1ZGUgYWxsIGRldGVjdGVkIGZpbGVzOlxcblxcbiR7ZmlsZW5hbWVBcnJheS5qb2luKCAnXFxuJyApfVxcbldhbnQgdG8gbWVyZ2UgaW50byAke3RhcmdldFJlcG99P2AsIGZhbHNlICkgKSB7XG4gICAgY29uc29sZS5sb2coICdBYm9ydGVkJyApO1xuICAgIHJldHVybjtcbiAgfVxuXG4gIGF3YWl0IGV4ZWN1dGUoICdnaXQnLCBgcmVtb3RlIGFkZCAke2hpc3RvcnlDb3B5UmVwb30gLi4vJHtoaXN0b3J5Q29weVJlcG99YC5zcGxpdCggJyAnICksIGAuLyR7dGFyZ2V0UmVwb31gICk7XG4gIGF3YWl0IGV4ZWN1dGUoICdnaXQnLCBgZmV0Y2ggJHtoaXN0b3J5Q29weVJlcG99YC5zcGxpdCggJyAnICksIGAuLyR7dGFyZ2V0UmVwb31gICk7XG4gIGF3YWl0IGV4ZWN1dGUoICdnaXQnLCBgbWVyZ2UgJHtoaXN0b3J5Q29weVJlcG99L21haW4gLS1hbGxvdy11bnJlbGF0ZWRgLnNwbGl0KCAnICcgKSwgYC4vJHt0YXJnZXRSZXBvfWAgKTtcbiAgYXdhaXQgZXhlY3V0ZSggJ2dpdCcsIGByZW1vdGUgcmVtb3ZlICR7aGlzdG9yeUNvcHlSZXBvfWAuc3BsaXQoICcgJyApLCBgLi8ke3RhcmdldFJlcG99YCApO1xuXG4gIGNvbnN0IGFib3V0VG9QdXNoID0gYXdhaXQgZXhlY3V0ZSggJ2dpdCcsICdkaWZmIC0tc3RhdCAtLWNhY2hlZCBvcmlnaW4vbWFpbicuc3BsaXQoICcgJyApLCBgLi8ke3RhcmdldFJlcG99YCApO1xuXG4gIGNvbnNvbGUubG9nKCAnQWJvdXQgdG8gcHVzaDogJyArIGFib3V0VG9QdXNoICk7XG5cbiAgY29uc3QgdW5wdXNoZWRDb21taXRzID0gYXdhaXQgZXhlY3V0ZSggJ2dpdCcsICdsb2cgb3JpZ2luL21haW4uLm1haW4nLnNwbGl0KCAnICcgKSwgYC4vJHt0YXJnZXRSZXBvfWAgKTtcbiAgY29uc29sZS5sb2coIHVucHVzaGVkQ29tbWl0cyApO1xuXG4gIGNvbnNvbGUubG9nKFxuICAgIGBNZXJnZWQgaW50byB0YXJnZXQgcmVwbyAke3RhcmdldFJlcG99LiBUaGUgcmVtYWluaW5nIHN0ZXBzIGFyZSBtYW51YWw6ICAgXG4qIEluc3BlY3QgdGhlIG1lcmdlZCByZXBvICR7dGFyZ2V0UmVwb30gZmlsZXMgYW5kIGhpc3RvcnkgYW5kIHNlZSBpZiB0aGUgcmVzdWx0IGxvb2tzIGdvb2QuXG4qIERlbGV0ZSB0aGUgdGVtcG9yYXJ5IGNsb25lZCByZXBvOiBybSAtcmYgJHtoaXN0b3J5Q29weVJlcG99XG4qIFVwZGF0ZSB0aGUgbmFtZXNwYWNlIGFuZCByZWdpc3RyeSBzdGF0ZW1lbnQsIGlmIGFwcHJvcHJpYXRlLlxuKiBNb3ZlIHRoZSBmaWxlIHRvIHRoZSBkZXNpcmVkIGRpcmVjdG9yeS5cbiogVHlwZS1jaGVjaywgbGludCBhbmQgdGVzdCB0aGUgbmV3IGNvZGUuXG4qIElmIHRoZSBoaXN0b3J5LCBmaWxlLCB0eXBlIGNoZWNrcyBhbmQgbGludCBhbGwgc2VlbSBnb29kLCBnaXQgcHVzaCB0aGUgY2hhbmdlcy4gKG90aGVyd2lzZSByZS1jbG9uZSkuXG4qIERlbGV0ZSB0aGUgY29weSBpbiB0aGUgcHJpb3IgZGlyZWN0b3J5LiBJbiB0aGUgY29tbWl0IG1lc3NhZ2UsIHJlZmVyIHRvIGFuIGlzc3VlIHNvIHRoZXJlIGlzIGEgcGFwZXIgdHJhaWwuXG5gICk7XG5cbiAgLy8gV2hlbiBydW5uaW5nIHRzeCBpbiBjb21iaW5hdGlvbiB3aXRoIHJlYWRsaW5lLCB0aGUgcHJvY2VzcyBkb2VzIG5vdCBleGl0IHByb3Blcmx5LCBzbyB3ZSBuZWVkIHRvIGZvcmNlIGl0LiBTZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3BlcmVubmlhbC9pc3N1ZXMvMzg5XG4gIHByb2Nlc3MuZXhpdCggMCApO1xufSApKCk7Il0sIm5hbWVzIjpbImJvb2xlYW5Qcm9tcHQiLCJleGVjdXRlIiwiYXJncyIsInByb2Nlc3MiLCJhcmd2Iiwic2xpY2UiLCJzb3VyY2VSZXBvIiwic3BsaXQiLCJyZWxhdGl2ZVBhdGgiLCJqb2luIiwidGFyZ2V0UmVwbyIsImNvbnNvbGUiLCJsb2ciLCJnaXRsb2ciLCJhbGxGaWxlbmFtZXMiLCJTZXQiLCJmb3JFYWNoIiwibGluZSIsImxlbmd0aCIsInRvVXBwZXJDYXNlIiwidG9Mb3dlckNhc2UiLCJ0ZXJtcyIsImZpbGVuYW1lc0Zyb21UZXJtIiwiZmlsZW5hbWVGcm9tVGVybSIsImFkZCIsImZpbGVuYW1lQXJyYXkiLCJBcnJheSIsImZyb20iLCJ2YWx1ZXMiLCJoaXN0b3J5Q29weVJlcG8iLCJmaWx0ZXJBcmdzIiwiZmlsZW5hbWUiLCJwdXNoIiwiZmlsdGVyUmVzdWx0cyIsImFib3V0VG9QdXNoIiwidW5wdXNoZWRDb21taXRzIiwiZXhpdCJdLCJtYXBwaW5ncyI6IkFBQUEsaURBQWlEOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFFakQsT0FBT0EsbUJBQW1CLDZCQUE2QjtBQUN2RCxPQUFPQyxhQUFhLHVCQUF1QjtBQUUzQzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztDQWtDQyxHQUNDLG9CQUFBO0lBQ0EsTUFBTUMsT0FBT0MsUUFBUUMsSUFBSSxDQUFDQyxLQUFLLENBQUU7SUFFakMsTUFBTUMsYUFBYUosSUFBSSxDQUFFLEVBQUcsQ0FBQ0ssS0FBSyxDQUFFLElBQUssQ0FBRSxFQUFHO0lBQzlDLE1BQU1DLGVBQWVOLElBQUksQ0FBRSxFQUFHLENBQUNLLEtBQUssQ0FBRSxLQUFNRixLQUFLLENBQUUsR0FBSUksSUFBSSxDQUFFO0lBRTdELE1BQU1DLGFBQWFSLElBQUksQ0FBRSxFQUFHO0lBRTVCUyxRQUFRQyxHQUFHLENBQUUsQ0FBQyxRQUFRLEVBQUVKLGFBQWEsTUFBTSxFQUFFRixXQUFXLElBQUksRUFBRUksWUFBWTtJQUUxRSxnRUFBZ0U7SUFDaEUsaUpBQWlKO0lBQ2pKLE1BQU1HLFNBQVMsTUFBTVosUUFBUyxPQUFPLENBQUMsMkNBQTJD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