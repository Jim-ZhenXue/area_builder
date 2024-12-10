// Copyright 2013-2024, University of Colorado Boulder
/**
 * Profiles the file size of the built JS file for a given repo.
 *
 * Analyzes the file size of a built file (that has been built with --profileFileSize), and prints out the results.
 * To profile a sim, go to the sim directory and run:
 *
 * grunt --locales=* --brands=phet --profileFileSize
 * sage run ../chipper/js/scripts/profile-file-size.ts
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ /**
 * @author Sam Reid (PhET Interactive Simulations)
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
import fs from 'fs';
import _ from 'lodash';
import zlib from 'zlib';
import getRepo from '../../../perennial-alias/js/grunt/tasks/util/getRepo.js';
let TagMatch = class TagMatch {
    constructor(startIndex, endIndex, isStart, type, name = null){
        this.startIndex = startIndex;
        this.endIndex = endIndex;
        this.isStart = isStart;
        this.type = type;
        this.name = name;
    }
};
let TaggedSection = class TaggedSection {
    getSize() {
        return getUtf8Length(this.getApproxString());
    }
    getGzippedSize() {
        return getGzippedLength(this.getApproxString());
    }
    getApproxString() {
        return this.children.map((child)=>{
            if (typeof child === 'string') {
                return child;
            } else {
                return child.getApproxString();
            }
        }).join('');
    }
    getApproxFilteredString(filter) {
        if (filter(this)) {
            return this.getApproxString();
        } else {
            return this.children.map((child)=>{
                if (typeof child === 'string') {
                    return '';
                } else {
                    return child.getApproxFilteredString(filter);
                }
            }).join('');
        }
    }
    getApproxRepoString(repo) {
        return this.getApproxFilteredString((section)=>!!(section.type === 'MODULE' && section.name && section.name.includes(`chipper/dist/js/${repo}/`)));
    }
    getApproxImagesString() {
        return this.getApproxFilteredString((section)=>!!(section.type === 'MODULE' && section.name && /chipper\/dist\/js\/[^/]+\/(images|mipmaps)\//.test(section.name)));
    }
    getApproxSoundsString() {
        return this.getApproxFilteredString((section)=>!!(section.type === 'MODULE' && section.name && /chipper\/dist\/js\/[^/]+\/sounds\//.test(section.name)));
    }
    getRepos() {
        let repo = null;
        if (this.type === 'MODULE' && this.name && this.name.includes('chipper/dist/js/')) {
            const index = this.name.indexOf('chipper/dist/js/') + 'chipper/dist/js/'.length;
            repo = this.name.slice(index).split('/')[0];
        }
        return _.uniq([
            ...repo ? [
                repo
            ] : [],
            ...this.children.flatMap((child)=>{
                if (typeof child === 'string') {
                    return [];
                } else {
                    return child.getRepos();
                }
            })
        ]);
    }
    toReportString(sort, size, gzippedSize, indent = '') {
        // TOD: sort by gzipped size?
        const children = sort ? _.sortBy(this.children, (child)=>-(typeof child === 'string' ? getUtf8Length(child) : child.getSize())) : this.children;
        return `${getSizeString(this.getApproxString(), size, gzippedSize)} ${indent}${this.type}${this.name ? ' ' + this.name : ''}\n${children.map((child)=>{
            if (typeof child === 'string') {
                return '';
            } else {
                return child.toReportString(sort, size, gzippedSize, `${indent}  `);
            }
        }).join('')}`;
    }
    constructor(type, name = null){
        this.type = type;
        this.name = name;
        this.children = [];
    }
};
const findNextMatch = (string, startIndex)=>{
    const match = /console\.log\("(START|END)_([A-Z_]+)"(,"([^"]+)")?\)/g.exec(string.slice(startIndex));
    if (match) {
        const matchIndex = match.index + startIndex;
        return new TagMatch(matchIndex, matchIndex + match[0].length, match[1] === 'START', match[2], match[4]);
    } else {
        return null;
    }
};
const getUtf8Length = (string)=>Buffer.from(string, 'utf-8').length;
const getGzippedLength = (string)=>zlib.gzipSync(Buffer.from(string, 'utf-8')).length;
const getSizeString = (string, size, gzippedSize)=>{
    const ourSize = getUtf8Length(string);
    const ourGzippedSize = getGzippedLength(string);
    let sizeString = '' + ourSize;
    let gzippedSizeString = '' + ourGzippedSize;
    const sizePercentage = Math.round(ourSize / size * 1000) / 10;
    if (sizePercentage !== 0) {
        sizeString += ` (${sizePercentage}%)`;
    }
    const gzippedSizePercentage = Math.round(ourGzippedSize / gzippedSize * 1000) / 10;
    if (gzippedSizePercentage !== 0) {
        gzippedSizeString += ` (${gzippedSizePercentage}%)`;
    }
    const megabytes = Math.round(ourSize / 1024 / 1024 * 100) / 100;
    if (megabytes !== 0) {
        sizeString += ` ${megabytes} MB`;
    }
    const gzippedMegabytes = Math.round(ourGzippedSize / 1024 / 1024 * 100) / 100;
    if (gzippedMegabytes !== 0) {
        gzippedSizeString += ` ${gzippedMegabytes} MB`;
    }
    return `utf-8: ${sizeString} gzip: ${gzippedSizeString}`;
};
const parseToSections = (string)=>{
    const rootSection = new TaggedSection('ROOT', null);
    const stack = [
        rootSection
    ];
    let index = 0;
    let match;
    // eslint-disable-next-line no-cond-assign
    while(match = findNextMatch(string, index)){
        // console.log( match.type, match.name, match.isStart ? 'START' : 'END', match.startIndex, match.endIndex );
        // Append any string before the match
        if (match.startIndex > index) {
            stack[stack.length - 1].children.push(string.slice(index, match.startIndex));
        }
        if (match.isStart) {
            const newSection = new TaggedSection(match.type, match.name);
            stack[stack.length - 1].children.push(newSection);
            stack.push(newSection);
        } else {
            const popped = stack.pop();
            if (popped.type !== match.type || popped.name !== match.name) {
                throw new Error(`Mismatched tags: ${popped.type} ${popped.name} !== ${match.type} ${match.name}`);
            }
        }
        index = match.endIndex;
    }
    if (index < string.length) {
        stack[stack.length - 1].children.push(string.slice(index));
    }
    return rootSection;
};
_async_to_generator(function*() {
    const repo = getRepo();
    const file = fs.readFileSync(`../${repo}/build/phet/${repo}_all_phet.html`, 'utf-8');
    const rootSection = parseToSections(file);
    const size = rootSection.getSize();
    const gzippedSize = rootSection.getGzippedSize();
    const printString = (name, string)=>{
        console.log(`${name}: ${getSizeString(string, size, gzippedSize)}`);
    };
    const printFilter = (name, filter)=>{
        printString(name, rootSection.getApproxFilteredString(filter));
    };
    console.log('summary:\n');
    printString('TOTAL', rootSection.getApproxString());
    console.log('');
    printString('images', rootSection.getApproxImagesString());
    printString('sounds', rootSection.getApproxSoundsString());
    printFilter('webpack (includes assets)', (section)=>section.type === 'WEBPACK');
    printFilter('preload', (section)=>section.type === 'PRELOAD');
    printFilter('strings', (section)=>section.type === 'STRINGS');
    printFilter('license', (section)=>section.type === 'LICENSE');
    for (const repo of rootSection.getRepos().sort()){
        printString(`js ${repo}`, rootSection.getApproxRepoString(repo));
    }
    console.log('\ndetails:\n');
    console.log(rootSection.toReportString(true, size, gzippedSize));
})();

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2pzL3NjcmlwdHMvcHJvZmlsZS1maWxlLXNpemUudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTMtMjAyNCwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cblxuLyoqXG4gKiBQcm9maWxlcyB0aGUgZmlsZSBzaXplIG9mIHRoZSBidWlsdCBKUyBmaWxlIGZvciBhIGdpdmVuIHJlcG8uXG4gKlxuICogQW5hbHl6ZXMgdGhlIGZpbGUgc2l6ZSBvZiBhIGJ1aWx0IGZpbGUgKHRoYXQgaGFzIGJlZW4gYnVpbHQgd2l0aCAtLXByb2ZpbGVGaWxlU2l6ZSksIGFuZCBwcmludHMgb3V0IHRoZSByZXN1bHRzLlxuICogVG8gcHJvZmlsZSBhIHNpbSwgZ28gdG8gdGhlIHNpbSBkaXJlY3RvcnkgYW5kIHJ1bjpcbiAqXG4gKiBncnVudCAtLWxvY2FsZXM9KiAtLWJyYW5kcz1waGV0IC0tcHJvZmlsZUZpbGVTaXplXG4gKiBzYWdlIHJ1biAuLi9jaGlwcGVyL2pzL3NjcmlwdHMvcHJvZmlsZS1maWxlLXNpemUudHNcbiAqXG4gKiBAYXV0aG9yIEpvbmF0aGFuIE9sc29uIDxqb25hdGhhbi5vbHNvbkBjb2xvcmFkby5lZHU+XG4gKi9cblxuLyoqXG4gKiBAYXV0aG9yIFNhbSBSZWlkIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxuICovXG5cbmltcG9ydCBmcyBmcm9tICdmcyc7XG5pbXBvcnQgXyBmcm9tICdsb2Rhc2gnO1xuaW1wb3J0IHpsaWIgZnJvbSAnemxpYic7XG5pbXBvcnQgZ2V0UmVwbyBmcm9tICcuLi8uLi8uLi9wZXJlbm5pYWwtYWxpYXMvanMvZ3J1bnQvdGFza3MvdXRpbC9nZXRSZXBvLmpzJztcblxuXG5jbGFzcyBUYWdNYXRjaCB7XG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggcHVibGljIHJlYWRvbmx5IHN0YXJ0SW5kZXg6IG51bWJlcixcbiAgICAgICAgICAgICAgICAgICAgICBwdWJsaWMgcmVhZG9ubHkgZW5kSW5kZXg6IG51bWJlcixcbiAgICAgICAgICAgICAgICAgICAgICBwdWJsaWMgcmVhZG9ubHkgaXNTdGFydDogYm9vbGVhbixcbiAgICAgICAgICAgICAgICAgICAgICBwdWJsaWMgcmVhZG9ubHkgdHlwZTogc3RyaW5nLFxuICAgICAgICAgICAgICAgICAgICAgIHB1YmxpYyByZWFkb25seSBuYW1lOiBzdHJpbmcgfCBudWxsID0gbnVsbCApIHtcbiAgfVxufVxuXG5jbGFzcyBUYWdnZWRTZWN0aW9uIHtcbiAgcHVibGljIHJlYWRvbmx5IGNoaWxkcmVuOiAoIFRhZ2dlZFNlY3Rpb24gfCBzdHJpbmcgKVtdID0gW107XG5cbiAgcHVibGljIGNvbnN0cnVjdG9yKCBwdWJsaWMgcmVhZG9ubHkgdHlwZTogc3RyaW5nLCBwdWJsaWMgcmVhZG9ubHkgbmFtZTogc3RyaW5nIHwgbnVsbCA9IG51bGwgKSB7XG4gIH1cblxuICBwdWJsaWMgZ2V0U2l6ZSgpOiBudW1iZXIge1xuICAgIHJldHVybiBnZXRVdGY4TGVuZ3RoKCB0aGlzLmdldEFwcHJveFN0cmluZygpICk7XG4gIH1cblxuICBwdWJsaWMgZ2V0R3ppcHBlZFNpemUoKTogbnVtYmVyIHtcbiAgICByZXR1cm4gZ2V0R3ppcHBlZExlbmd0aCggdGhpcy5nZXRBcHByb3hTdHJpbmcoKSApO1xuICB9XG5cbiAgcHVibGljIGdldEFwcHJveFN0cmluZygpOiBzdHJpbmcge1xuICAgIHJldHVybiB0aGlzLmNoaWxkcmVuLm1hcCggY2hpbGQgPT4ge1xuICAgICAgaWYgKCB0eXBlb2YgY2hpbGQgPT09ICdzdHJpbmcnICkge1xuICAgICAgICByZXR1cm4gY2hpbGQ7XG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgcmV0dXJuIGNoaWxkLmdldEFwcHJveFN0cmluZygpO1xuICAgICAgfVxuICAgIH0gKS5qb2luKCAnJyApO1xuICB9XG5cbiAgcHVibGljIGdldEFwcHJveEZpbHRlcmVkU3RyaW5nKCBmaWx0ZXI6ICggc2VjdGlvbjogVGFnZ2VkU2VjdGlvbiApID0+IGJvb2xlYW4gKTogc3RyaW5nIHtcbiAgICBpZiAoIGZpbHRlciggdGhpcyApICkge1xuICAgICAgcmV0dXJuIHRoaXMuZ2V0QXBwcm94U3RyaW5nKCk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgcmV0dXJuIHRoaXMuY2hpbGRyZW4ubWFwKCBjaGlsZCA9PiB7XG4gICAgICAgIGlmICggdHlwZW9mIGNoaWxkID09PSAnc3RyaW5nJyApIHtcbiAgICAgICAgICByZXR1cm4gJyc7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIGNoaWxkLmdldEFwcHJveEZpbHRlcmVkU3RyaW5nKCBmaWx0ZXIgKTtcbiAgICAgICAgfVxuICAgICAgfSApLmpvaW4oICcnICk7XG4gICAgfVxuICB9XG5cbiAgcHVibGljIGdldEFwcHJveFJlcG9TdHJpbmcoIHJlcG86IHN0cmluZyApOiBzdHJpbmcge1xuICAgIHJldHVybiB0aGlzLmdldEFwcHJveEZpbHRlcmVkU3RyaW5nKCBzZWN0aW9uID0+ICEhKCBzZWN0aW9uLnR5cGUgPT09ICdNT0RVTEUnICYmIHNlY3Rpb24ubmFtZSAmJiBzZWN0aW9uLm5hbWUuaW5jbHVkZXMoIGBjaGlwcGVyL2Rpc3QvanMvJHtyZXBvfS9gICkgKSApO1xuICB9XG5cbiAgcHVibGljIGdldEFwcHJveEltYWdlc1N0cmluZygpOiBzdHJpbmcge1xuICAgIHJldHVybiB0aGlzLmdldEFwcHJveEZpbHRlcmVkU3RyaW5nKCBzZWN0aW9uID0+ICEhKCBzZWN0aW9uLnR5cGUgPT09ICdNT0RVTEUnICYmIHNlY3Rpb24ubmFtZSAmJiAvY2hpcHBlclxcL2Rpc3RcXC9qc1xcL1teL10rXFwvKGltYWdlc3xtaXBtYXBzKVxcLy8udGVzdCggc2VjdGlvbi5uYW1lICkgKSApO1xuICB9XG5cbiAgcHVibGljIGdldEFwcHJveFNvdW5kc1N0cmluZygpOiBzdHJpbmcge1xuICAgIHJldHVybiB0aGlzLmdldEFwcHJveEZpbHRlcmVkU3RyaW5nKCBzZWN0aW9uID0+ICEhKCBzZWN0aW9uLnR5cGUgPT09ICdNT0RVTEUnICYmIHNlY3Rpb24ubmFtZSAmJiAvY2hpcHBlclxcL2Rpc3RcXC9qc1xcL1teL10rXFwvc291bmRzXFwvLy50ZXN0KCBzZWN0aW9uLm5hbWUgKSApICk7XG4gIH1cblxuICBwdWJsaWMgZ2V0UmVwb3MoKTogc3RyaW5nW10ge1xuICAgIGxldCByZXBvID0gbnVsbDtcblxuICAgIGlmICggdGhpcy50eXBlID09PSAnTU9EVUxFJyAmJiB0aGlzLm5hbWUgJiYgdGhpcy5uYW1lLmluY2x1ZGVzKCAnY2hpcHBlci9kaXN0L2pzLycgKSApIHtcbiAgICAgIGNvbnN0IGluZGV4ID0gdGhpcy5uYW1lLmluZGV4T2YoICdjaGlwcGVyL2Rpc3QvanMvJyApICsgJ2NoaXBwZXIvZGlzdC9qcy8nLmxlbmd0aDtcbiAgICAgIHJlcG8gPSB0aGlzLm5hbWUuc2xpY2UoIGluZGV4ICkuc3BsaXQoICcvJyApWyAwIF07XG4gICAgfVxuXG4gICAgcmV0dXJuIF8udW5pcSggW1xuICAgICAgLi4uKCByZXBvID8gWyByZXBvIF0gOiBbXSApLFxuICAgICAgLi4udGhpcy5jaGlsZHJlbi5mbGF0TWFwKCBjaGlsZCA9PiB7XG4gICAgICAgIGlmICggdHlwZW9mIGNoaWxkID09PSAnc3RyaW5nJyApIHtcbiAgICAgICAgICByZXR1cm4gW107XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIGNoaWxkLmdldFJlcG9zKCk7XG4gICAgICAgIH1cbiAgICAgIH0gKVxuICAgIF0gKTtcbiAgfVxuXG4gIHB1YmxpYyB0b1JlcG9ydFN0cmluZyggc29ydDogYm9vbGVhbiwgc2l6ZTogbnVtYmVyLCBnemlwcGVkU2l6ZTogbnVtYmVyLCBpbmRlbnQgPSAnJyApOiBzdHJpbmcge1xuICAgIC8vIFRPRDogc29ydCBieSBnemlwcGVkIHNpemU/XG4gICAgY29uc3QgY2hpbGRyZW4gPSBzb3J0ID8gXy5zb3J0QnkoIHRoaXMuY2hpbGRyZW4sIGNoaWxkID0+IC0oIHR5cGVvZiBjaGlsZCA9PT0gJ3N0cmluZycgPyBnZXRVdGY4TGVuZ3RoKCBjaGlsZCApIDogY2hpbGQuZ2V0U2l6ZSgpICkgKSA6IHRoaXMuY2hpbGRyZW47XG4gICAgcmV0dXJuIGAke2dldFNpemVTdHJpbmcoIHRoaXMuZ2V0QXBwcm94U3RyaW5nKCksIHNpemUsIGd6aXBwZWRTaXplICl9ICR7aW5kZW50fSR7dGhpcy50eXBlfSR7dGhpcy5uYW1lID8gJyAnICsgdGhpcy5uYW1lIDogJyd9XFxuJHtjaGlsZHJlbi5tYXAoIGNoaWxkID0+IHtcbiAgICAgIGlmICggdHlwZW9mIGNoaWxkID09PSAnc3RyaW5nJyApIHtcbiAgICAgICAgcmV0dXJuICcnO1xuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgIHJldHVybiBjaGlsZC50b1JlcG9ydFN0cmluZyggc29ydCwgc2l6ZSwgZ3ppcHBlZFNpemUsIGAke2luZGVudH0gIGAgKTtcbiAgICAgIH1cbiAgICB9ICkuam9pbiggJycgKX1gO1xuICB9XG59XG5cbmNvbnN0IGZpbmROZXh0TWF0Y2ggPSAoIHN0cmluZzogc3RyaW5nLCBzdGFydEluZGV4OiBudW1iZXIgKSA9PiB7XG4gIGNvbnN0IG1hdGNoID0gKCAvY29uc29sZVxcLmxvZ1xcKFwiKFNUQVJUfEVORClfKFtBLVpfXSspXCIoLFwiKFteXCJdKylcIik/XFwpL2cgKS5leGVjKCBzdHJpbmcuc2xpY2UoIHN0YXJ0SW5kZXggKSApO1xuICBpZiAoIG1hdGNoICkge1xuICAgIGNvbnN0IG1hdGNoSW5kZXggPSBtYXRjaC5pbmRleCArIHN0YXJ0SW5kZXg7XG4gICAgcmV0dXJuIG5ldyBUYWdNYXRjaCggbWF0Y2hJbmRleCwgbWF0Y2hJbmRleCArIG1hdGNoWyAwIF0ubGVuZ3RoLCBtYXRjaFsgMSBdID09PSAnU1RBUlQnLCBtYXRjaFsgMiBdLCBtYXRjaFsgNCBdICk7XG4gIH1cbiAgZWxzZSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbn07XG5cbmNvbnN0IGdldFV0ZjhMZW5ndGggPSAoIHN0cmluZzogc3RyaW5nICkgPT4gQnVmZmVyLmZyb20oIHN0cmluZywgJ3V0Zi04JyApLmxlbmd0aDtcbmNvbnN0IGdldEd6aXBwZWRMZW5ndGggPSAoIHN0cmluZzogc3RyaW5nICkgPT4gemxpYi5nemlwU3luYyggQnVmZmVyLmZyb20oIHN0cmluZywgJ3V0Zi04JyApICkubGVuZ3RoO1xuY29uc3QgZ2V0U2l6ZVN0cmluZyA9ICggc3RyaW5nOiBzdHJpbmcsIHNpemU6IG51bWJlciwgZ3ppcHBlZFNpemU6IG51bWJlciApID0+IHtcbiAgY29uc3Qgb3VyU2l6ZSA9IGdldFV0ZjhMZW5ndGgoIHN0cmluZyApO1xuICBjb25zdCBvdXJHemlwcGVkU2l6ZSA9IGdldEd6aXBwZWRMZW5ndGgoIHN0cmluZyApO1xuXG4gIGxldCBzaXplU3RyaW5nID0gJycgKyBvdXJTaXplO1xuICBsZXQgZ3ppcHBlZFNpemVTdHJpbmcgPSAnJyArIG91ckd6aXBwZWRTaXplO1xuXG5cbiAgY29uc3Qgc2l6ZVBlcmNlbnRhZ2UgPSBNYXRoLnJvdW5kKCBvdXJTaXplIC8gc2l6ZSAqIDEwMDAgKSAvIDEwO1xuICBpZiAoIHNpemVQZXJjZW50YWdlICE9PSAwICkge1xuICAgIHNpemVTdHJpbmcgKz0gYCAoJHtzaXplUGVyY2VudGFnZX0lKWA7XG4gIH1cblxuICBjb25zdCBnemlwcGVkU2l6ZVBlcmNlbnRhZ2UgPSBNYXRoLnJvdW5kKCBvdXJHemlwcGVkU2l6ZSAvIGd6aXBwZWRTaXplICogMTAwMCApIC8gMTA7XG4gIGlmICggZ3ppcHBlZFNpemVQZXJjZW50YWdlICE9PSAwICkge1xuICAgIGd6aXBwZWRTaXplU3RyaW5nICs9IGAgKCR7Z3ppcHBlZFNpemVQZXJjZW50YWdlfSUpYDtcbiAgfVxuXG5cbiAgY29uc3QgbWVnYWJ5dGVzID0gTWF0aC5yb3VuZCggb3VyU2l6ZSAvIDEwMjQgLyAxMDI0ICogMTAwICkgLyAxMDA7XG4gIGlmICggbWVnYWJ5dGVzICE9PSAwICkge1xuICAgIHNpemVTdHJpbmcgKz0gYCAke21lZ2FieXRlc30gTUJgO1xuICB9XG5cbiAgY29uc3QgZ3ppcHBlZE1lZ2FieXRlcyA9IE1hdGgucm91bmQoIG91ckd6aXBwZWRTaXplIC8gMTAyNCAvIDEwMjQgKiAxMDAgKSAvIDEwMDtcbiAgaWYgKCBnemlwcGVkTWVnYWJ5dGVzICE9PSAwICkge1xuICAgIGd6aXBwZWRTaXplU3RyaW5nICs9IGAgJHtnemlwcGVkTWVnYWJ5dGVzfSBNQmA7XG4gIH1cblxuICByZXR1cm4gYHV0Zi04OiAke3NpemVTdHJpbmd9IGd6aXA6ICR7Z3ppcHBlZFNpemVTdHJpbmd9YDtcbn07XG5cbmNvbnN0IHBhcnNlVG9TZWN0aW9ucyA9ICggc3RyaW5nOiBzdHJpbmcgKSA9PiB7XG4gIGNvbnN0IHJvb3RTZWN0aW9uID0gbmV3IFRhZ2dlZFNlY3Rpb24oICdST09UJywgbnVsbCApO1xuICBjb25zdCBzdGFjayA9IFsgcm9vdFNlY3Rpb24gXTtcblxuICBsZXQgaW5kZXggPSAwO1xuICBsZXQgbWF0Y2g7XG4gIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1jb25kLWFzc2lnblxuICB3aGlsZSAoIG1hdGNoID0gZmluZE5leHRNYXRjaCggc3RyaW5nLCBpbmRleCApICkge1xuXG4gICAgLy8gY29uc29sZS5sb2coIG1hdGNoLnR5cGUsIG1hdGNoLm5hbWUsIG1hdGNoLmlzU3RhcnQgPyAnU1RBUlQnIDogJ0VORCcsIG1hdGNoLnN0YXJ0SW5kZXgsIG1hdGNoLmVuZEluZGV4ICk7XG5cbiAgICAvLyBBcHBlbmQgYW55IHN0cmluZyBiZWZvcmUgdGhlIG1hdGNoXG4gICAgaWYgKCBtYXRjaC5zdGFydEluZGV4ID4gaW5kZXggKSB7XG4gICAgICBzdGFja1sgc3RhY2subGVuZ3RoIC0gMSBdLmNoaWxkcmVuLnB1c2goIHN0cmluZy5zbGljZSggaW5kZXgsIG1hdGNoLnN0YXJ0SW5kZXggKSApO1xuICAgIH1cblxuICAgIGlmICggbWF0Y2guaXNTdGFydCApIHtcbiAgICAgIGNvbnN0IG5ld1NlY3Rpb24gPSBuZXcgVGFnZ2VkU2VjdGlvbiggbWF0Y2gudHlwZSwgbWF0Y2gubmFtZSApO1xuICAgICAgc3RhY2tbIHN0YWNrLmxlbmd0aCAtIDEgXS5jaGlsZHJlbi5wdXNoKCBuZXdTZWN0aW9uICk7XG4gICAgICBzdGFjay5wdXNoKCBuZXdTZWN0aW9uICk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgY29uc3QgcG9wcGVkID0gc3RhY2sucG9wKCkhO1xuICAgICAgaWYgKCBwb3BwZWQudHlwZSAhPT0gbWF0Y2gudHlwZSB8fCBwb3BwZWQubmFtZSAhPT0gbWF0Y2gubmFtZSApIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCBgTWlzbWF0Y2hlZCB0YWdzOiAke3BvcHBlZC50eXBlfSAke3BvcHBlZC5uYW1lfSAhPT0gJHttYXRjaC50eXBlfSAke21hdGNoLm5hbWV9YCApO1xuICAgICAgfVxuICAgIH1cblxuICAgIGluZGV4ID0gbWF0Y2guZW5kSW5kZXg7XG4gIH1cblxuICBpZiAoIGluZGV4IDwgc3RyaW5nLmxlbmd0aCApIHtcbiAgICBzdGFja1sgc3RhY2subGVuZ3RoIC0gMSBdLmNoaWxkcmVuLnB1c2goIHN0cmluZy5zbGljZSggaW5kZXggKSApO1xuICB9XG5cbiAgcmV0dXJuIHJvb3RTZWN0aW9uO1xufTtcblxuKCBhc3luYyAoKSA9PiB7XG4gIGNvbnN0IHJlcG8gPSBnZXRSZXBvKCk7XG4gIGNvbnN0IGZpbGUgPSBmcy5yZWFkRmlsZVN5bmMoIGAuLi8ke3JlcG99L2J1aWxkL3BoZXQvJHtyZXBvfV9hbGxfcGhldC5odG1sYCwgJ3V0Zi04JyApO1xuXG4gIGNvbnN0IHJvb3RTZWN0aW9uID0gcGFyc2VUb1NlY3Rpb25zKCBmaWxlICk7XG5cbiAgY29uc3Qgc2l6ZSA9IHJvb3RTZWN0aW9uLmdldFNpemUoKTtcbiAgY29uc3QgZ3ppcHBlZFNpemUgPSByb290U2VjdGlvbi5nZXRHemlwcGVkU2l6ZSgpO1xuXG4gIGNvbnN0IHByaW50U3RyaW5nID0gKCBuYW1lOiBzdHJpbmcsIHN0cmluZzogc3RyaW5nICkgPT4ge1xuICAgIGNvbnNvbGUubG9nKCBgJHtuYW1lfTogJHtnZXRTaXplU3RyaW5nKCBzdHJpbmcsIHNpemUsIGd6aXBwZWRTaXplICl9YCApO1xuICB9O1xuXG4gIGNvbnN0IHByaW50RmlsdGVyID0gKCBuYW1lOiBzdHJpbmcsIGZpbHRlcjogKCBzZWN0aW9uOiBUYWdnZWRTZWN0aW9uICkgPT4gYm9vbGVhbiApID0+IHtcbiAgICBwcmludFN0cmluZyggbmFtZSwgcm9vdFNlY3Rpb24uZ2V0QXBwcm94RmlsdGVyZWRTdHJpbmcoIGZpbHRlciApICk7XG4gIH07XG5cbiAgY29uc29sZS5sb2coICdzdW1tYXJ5OlxcbicgKTtcbiAgcHJpbnRTdHJpbmcoICdUT1RBTCcsIHJvb3RTZWN0aW9uLmdldEFwcHJveFN0cmluZygpICk7XG4gIGNvbnNvbGUubG9nKCAnJyApO1xuICBwcmludFN0cmluZyggJ2ltYWdlcycsIHJvb3RTZWN0aW9uLmdldEFwcHJveEltYWdlc1N0cmluZygpICk7XG4gIHByaW50U3RyaW5nKCAnc291bmRzJywgcm9vdFNlY3Rpb24uZ2V0QXBwcm94U291bmRzU3RyaW5nKCkgKTtcbiAgcHJpbnRGaWx0ZXIoICd3ZWJwYWNrIChpbmNsdWRlcyBhc3NldHMpJywgc2VjdGlvbiA9PiBzZWN0aW9uLnR5cGUgPT09ICdXRUJQQUNLJyApO1xuICBwcmludEZpbHRlciggJ3ByZWxvYWQnLCBzZWN0aW9uID0+IHNlY3Rpb24udHlwZSA9PT0gJ1BSRUxPQUQnICk7XG4gIHByaW50RmlsdGVyKCAnc3RyaW5ncycsIHNlY3Rpb24gPT4gc2VjdGlvbi50eXBlID09PSAnU1RSSU5HUycgKTtcbiAgcHJpbnRGaWx0ZXIoICdsaWNlbnNlJywgc2VjdGlvbiA9PiBzZWN0aW9uLnR5cGUgPT09ICdMSUNFTlNFJyApO1xuXG4gIGZvciAoIGNvbnN0IHJlcG8gb2Ygcm9vdFNlY3Rpb24uZ2V0UmVwb3MoKS5zb3J0KCkgKSB7XG4gICAgcHJpbnRTdHJpbmcoIGBqcyAke3JlcG99YCwgcm9vdFNlY3Rpb24uZ2V0QXBwcm94UmVwb1N0cmluZyggcmVwbyApICk7XG4gIH1cblxuICBjb25zb2xlLmxvZyggJ1xcbmRldGFpbHM6XFxuJyApO1xuXG4gIGNvbnNvbGUubG9nKCByb290U2VjdGlvbi50b1JlcG9ydFN0cmluZyggdHJ1ZSwgc2l6ZSwgZ3ppcHBlZFNpemUgKSApO1xuXG59ICkoKTsiXSwibmFtZXMiOlsiZnMiLCJfIiwiemxpYiIsImdldFJlcG8iLCJUYWdNYXRjaCIsInN0YXJ0SW5kZXgiLCJlbmRJbmRleCIsImlzU3RhcnQiLCJ0eXBlIiwibmFtZSIsIlRhZ2dlZFNlY3Rpb24iLCJnZXRTaXplIiwiZ2V0VXRmOExlbmd0aCIsImdldEFwcHJveFN0cmluZyIsImdldEd6aXBwZWRTaXplIiwiZ2V0R3ppcHBlZExlbmd0aCIsImNoaWxkcmVuIiwibWFwIiwiY2hpbGQiLCJqb2luIiwiZ2V0QXBwcm94RmlsdGVyZWRTdHJpbmciLCJmaWx0ZXIiLCJnZXRBcHByb3hSZXBvU3RyaW5nIiwicmVwbyIsInNlY3Rpb24iLCJpbmNsdWRlcyIsImdldEFwcHJveEltYWdlc1N0cmluZyIsInRlc3QiLCJnZXRBcHByb3hTb3VuZHNTdHJpbmciLCJnZXRSZXBvcyIsImluZGV4IiwiaW5kZXhPZiIsImxlbmd0aCIsInNsaWNlIiwic3BsaXQiLCJ1bmlxIiwiZmxhdE1hcCIsInRvUmVwb3J0U3RyaW5nIiwic29ydCIsInNpemUiLCJnemlwcGVkU2l6ZSIsImluZGVudCIsInNvcnRCeSIsImdldFNpemVTdHJpbmciLCJmaW5kTmV4dE1hdGNoIiwic3RyaW5nIiwibWF0Y2giLCJleGVjIiwibWF0Y2hJbmRleCIsIkJ1ZmZlciIsImZyb20iLCJnemlwU3luYyIsIm91clNpemUiLCJvdXJHemlwcGVkU2l6ZSIsInNpemVTdHJpbmciLCJnemlwcGVkU2l6ZVN0cmluZyIsInNpemVQZXJjZW50YWdlIiwiTWF0aCIsInJvdW5kIiwiZ3ppcHBlZFNpemVQZXJjZW50YWdlIiwibWVnYWJ5dGVzIiwiZ3ppcHBlZE1lZ2FieXRlcyIsInBhcnNlVG9TZWN0aW9ucyIsInJvb3RTZWN0aW9uIiwic3RhY2siLCJwdXNoIiwibmV3U2VjdGlvbiIsInBvcHBlZCIsInBvcCIsIkVycm9yIiwiZmlsZSIsInJlYWRGaWxlU3luYyIsInByaW50U3RyaW5nIiwiY29uc29sZSIsImxvZyIsInByaW50RmlsdGVyIl0sIm1hcHBpbmdzIjoiQUFBQSxzREFBc0Q7QUFHdEQ7Ozs7Ozs7Ozs7Q0FVQyxHQUVEOztDQUVDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUVELE9BQU9BLFFBQVEsS0FBSztBQUNwQixPQUFPQyxPQUFPLFNBQVM7QUFDdkIsT0FBT0MsVUFBVSxPQUFPO0FBQ3hCLE9BQU9DLGFBQWEsMERBQTBEO0FBRzlFLElBQUEsQUFBTUMsV0FBTixNQUFNQTtJQUNKLFlBQW9CLEFBQWdCQyxVQUFrQixFQUNsQyxBQUFnQkMsUUFBZ0IsRUFDaEMsQUFBZ0JDLE9BQWdCLEVBQ2hDLEFBQWdCQyxJQUFZLEVBQzVCLEFBQWdCQyxPQUFzQixJQUFJLENBQUc7YUFKN0JKLGFBQUFBO2FBQ0FDLFdBQUFBO2FBQ0FDLFVBQUFBO2FBQ0FDLE9BQUFBO2FBQ0FDLE9BQUFBO0lBQ3BDO0FBQ0Y7QUFFQSxJQUFBLEFBQU1DLGdCQUFOLE1BQU1BO0lBTUdDLFVBQWtCO1FBQ3ZCLE9BQU9DLGNBQWUsSUFBSSxDQUFDQyxlQUFlO0lBQzVDO0lBRU9DLGlCQUF5QjtRQUM5QixPQUFPQyxpQkFBa0IsSUFBSSxDQUFDRixlQUFlO0lBQy9DO0lBRU9BLGtCQUEwQjtRQUMvQixPQUFPLElBQUksQ0FBQ0csUUFBUSxDQUFDQyxHQUFHLENBQUVDLENBQUFBO1lBQ3hCLElBQUssT0FBT0EsVUFBVSxVQUFXO2dCQUMvQixPQUFPQTtZQUNULE9BQ0s7Z0JBQ0gsT0FBT0EsTUFBTUwsZUFBZTtZQUM5QjtRQUNGLEdBQUlNLElBQUksQ0FBRTtJQUNaO0lBRU9DLHdCQUF5QkMsTUFBNkMsRUFB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