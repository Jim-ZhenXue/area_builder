// Copyright 2018-2024, University of Colorado Boulder
/**
 * Combines all parts of a runnable's built file into an XHTML structure (with separate files)
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ // modules
import assert from 'assert';
import grunt from '../../../perennial-alias/js/npm-dependencies/grunt.js';
import ChipperConstants from '../common/ChipperConstants.js';
import ChipperStringUtils from '../common/ChipperStringUtils.js';
import getTitleStringKey from './getTitleStringKey.js';
const nodeHtmlEncoder = require('node-html-encoder');
/**
 * From a given set of config (including the JS and other required things), it creates an XHTML structure and writes it to disk.
 */ export default function packageXHTML(xhtmlDir, config) {
    const encoder = new nodeHtmlEncoder.Encoder('entity');
    const { repo, brand, stringMap, initializationScript, licenseScript, scripts, htmlHeader// {string}
     } = config;
    assert(stringMap, 'Requires stringMap');
    assert(scripts, 'Requires scripts');
    const localizedTitle = stringMap[ChipperConstants.FALLBACK_LOCALE][getTitleStringKey(repo)];
    const licenseScriptFilename = `${repo}_license_${brand}.js`;
    const initializationScriptFilename = `${repo}_initialization_${brand}.js`;
    const script = scripts.join('\n');
    const scriptFilename = `${repo}_${brand}.js`;
    const xhtml = ChipperStringUtils.replacePlaceholders(grunt.file.read('../chipper/templates/sim.xhtml'), {
        PHET_SIM_TITLE: encoder.htmlEncode(localizedTitle),
        PHET_HTML_HEADER: htmlHeader,
        PHET_INITIALIZATION_SCRIPT: `<script type="text/javascript" src="${licenseScriptFilename}" charset="utf-8"></script><script type="text/javascript" src="${initializationScriptFilename}" charset="utf-8"></script>`,
        PHET_SIM_SCRIPTS: `<script type="text/javascript" src="${scriptFilename}" charset="utf-8"></script>`
    });
    grunt.file.write(`${xhtmlDir}/${repo}_all${brand === 'phet' ? '' : `_${brand}`}.xhtml`, xhtml);
    grunt.file.write(`${xhtmlDir}/${licenseScriptFilename}`, licenseScript);
    grunt.file.write(`${xhtmlDir}/${initializationScriptFilename}`, initializationScript);
    grunt.file.write(`${xhtmlDir}/${scriptFilename}`, script);
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2pzL2dydW50L3BhY2thZ2VYSFRNTC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxOC0yMDI0LCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuLyoqXG4gKiBDb21iaW5lcyBhbGwgcGFydHMgb2YgYSBydW5uYWJsZSdzIGJ1aWx0IGZpbGUgaW50byBhbiBYSFRNTCBzdHJ1Y3R1cmUgKHdpdGggc2VwYXJhdGUgZmlsZXMpXG4gKlxuICogQGF1dGhvciBKb25hdGhhbiBPbHNvbiA8am9uYXRoYW4ub2xzb25AY29sb3JhZG8uZWR1PlxuICovXG5cbi8vIG1vZHVsZXNcbmltcG9ydCBhc3NlcnQgZnJvbSAnYXNzZXJ0JztcbmltcG9ydCBncnVudCBmcm9tICcuLi8uLi8uLi9wZXJlbm5pYWwtYWxpYXMvanMvbnBtLWRlcGVuZGVuY2llcy9ncnVudC5qcyc7XG5pbXBvcnQgSW50ZW50aW9uYWxBbnkgZnJvbSAnLi4vLi4vLi4vcGhldC1jb3JlL2pzL3R5cGVzL0ludGVudGlvbmFsQW55LmpzJztcbmltcG9ydCBDaGlwcGVyQ29uc3RhbnRzIGZyb20gJy4uL2NvbW1vbi9DaGlwcGVyQ29uc3RhbnRzLmpzJztcbmltcG9ydCBDaGlwcGVyU3RyaW5nVXRpbHMgZnJvbSAnLi4vY29tbW9uL0NoaXBwZXJTdHJpbmdVdGlscy5qcyc7XG5pbXBvcnQgZ2V0VGl0bGVTdHJpbmdLZXkgZnJvbSAnLi9nZXRUaXRsZVN0cmluZ0tleS5qcyc7XG5cbmNvbnN0IG5vZGVIdG1sRW5jb2RlciA9IHJlcXVpcmUoICdub2RlLWh0bWwtZW5jb2RlcicgKTtcblxuLyoqXG4gKiBGcm9tIGEgZ2l2ZW4gc2V0IG9mIGNvbmZpZyAoaW5jbHVkaW5nIHRoZSBKUyBhbmQgb3RoZXIgcmVxdWlyZWQgdGhpbmdzKSwgaXQgY3JlYXRlcyBhbiBYSFRNTCBzdHJ1Y3R1cmUgYW5kIHdyaXRlcyBpdCB0byBkaXNrLlxuICovXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBwYWNrYWdlWEhUTUwoIHhodG1sRGlyOiBzdHJpbmcsIGNvbmZpZzogSW50ZW50aW9uYWxBbnkgKTogdm9pZCB7XG4gIGNvbnN0IGVuY29kZXIgPSBuZXcgbm9kZUh0bWxFbmNvZGVyLkVuY29kZXIoICdlbnRpdHknICk7XG5cbiAgY29uc3Qge1xuICAgIHJlcG8sIC8vIHtzdHJpbmd9XG4gICAgYnJhbmQsIC8vIHtzdHJpbmd9XG4gICAgc3RyaW5nTWFwLCAvLyB7T2JqZWN0fSwgbWFwWyBsb2NhbGUgXVsgc3RyaW5nS2V5IF0gPT4ge3N0cmluZ31cbiAgICBpbml0aWFsaXphdGlvblNjcmlwdCwgLy8ge3N0cmluZ30gLSBzZXBhcmF0ZSBmcm9tIHRoZSByZXN0IG9mIHRoZSBzY3JpcHRzIHNpbmNlIGl0IG5lZWRzIHRvIGJlIGFibGUgdG8gcnVuIGluIElFLlxuICAgIGxpY2Vuc2VTY3JpcHQsIC8vIHtzdHJpbmd9XG4gICAgc2NyaXB0cywgLy8ge0FycmF5LjxzdHJpbmc+fVxuICAgIGh0bWxIZWFkZXIgLy8ge3N0cmluZ31cbiAgfSA9IGNvbmZpZztcbiAgYXNzZXJ0KCBzdHJpbmdNYXAsICdSZXF1aXJlcyBzdHJpbmdNYXAnICk7XG4gIGFzc2VydCggc2NyaXB0cywgJ1JlcXVpcmVzIHNjcmlwdHMnICk7XG5cbiAgY29uc3QgbG9jYWxpemVkVGl0bGUgPSBzdHJpbmdNYXBbIENoaXBwZXJDb25zdGFudHMuRkFMTEJBQ0tfTE9DQUxFIF1bIGdldFRpdGxlU3RyaW5nS2V5KCByZXBvICkgXTtcblxuICBjb25zdCBsaWNlbnNlU2NyaXB0RmlsZW5hbWUgPSBgJHtyZXBvfV9saWNlbnNlXyR7YnJhbmR9LmpzYDtcbiAgY29uc3QgaW5pdGlhbGl6YXRpb25TY3JpcHRGaWxlbmFtZSA9IGAke3JlcG99X2luaXRpYWxpemF0aW9uXyR7YnJhbmR9LmpzYDtcblxuICBjb25zdCBzY3JpcHQgPSBzY3JpcHRzLmpvaW4oICdcXG4nICk7XG4gIGNvbnN0IHNjcmlwdEZpbGVuYW1lID0gYCR7cmVwb31fJHticmFuZH0uanNgO1xuXG4gIGNvbnN0IHhodG1sID0gQ2hpcHBlclN0cmluZ1V0aWxzLnJlcGxhY2VQbGFjZWhvbGRlcnMoIGdydW50LmZpbGUucmVhZCggJy4uL2NoaXBwZXIvdGVtcGxhdGVzL3NpbS54aHRtbCcgKSwge1xuICAgIFBIRVRfU0lNX1RJVExFOiBlbmNvZGVyLmh0bWxFbmNvZGUoIGxvY2FsaXplZFRpdGxlICksXG4gICAgUEhFVF9IVE1MX0hFQURFUjogaHRtbEhlYWRlcixcbiAgICBQSEVUX0lOSVRJQUxJWkFUSU9OX1NDUklQVDogYDxzY3JpcHQgdHlwZT1cInRleHQvamF2YXNjcmlwdFwiIHNyYz1cIiR7bGljZW5zZVNjcmlwdEZpbGVuYW1lfVwiIGNoYXJzZXQ9XCJ1dGYtOFwiPjwvc2NyaXB0PjxzY3JpcHQgdHlwZT1cInRleHQvamF2YXNjcmlwdFwiIHNyYz1cIiR7aW5pdGlhbGl6YXRpb25TY3JpcHRGaWxlbmFtZX1cIiBjaGFyc2V0PVwidXRmLThcIj48L3NjcmlwdD5gLFxuICAgIFBIRVRfU0lNX1NDUklQVFM6IGA8c2NyaXB0IHR5cGU9XCJ0ZXh0L2phdmFzY3JpcHRcIiBzcmM9XCIke3NjcmlwdEZpbGVuYW1lfVwiIGNoYXJzZXQ9XCJ1dGYtOFwiPjwvc2NyaXB0PmBcbiAgfSApO1xuICBncnVudC5maWxlLndyaXRlKCBgJHt4aHRtbERpcn0vJHtyZXBvfV9hbGwke2JyYW5kID09PSAncGhldCcgPyAnJyA6IGBfJHticmFuZH1gfS54aHRtbGAsIHhodG1sICk7XG4gIGdydW50LmZpbGUud3JpdGUoIGAke3hodG1sRGlyfS8ke2xpY2Vuc2VTY3JpcHRGaWxlbmFtZX1gLCBsaWNlbnNlU2NyaXB0ICk7XG4gIGdydW50LmZpbGUud3JpdGUoIGAke3hodG1sRGlyfS8ke2luaXRpYWxpemF0aW9uU2NyaXB0RmlsZW5hbWV9YCwgaW5pdGlhbGl6YXRpb25TY3JpcHQgKTtcbiAgZ3J1bnQuZmlsZS53cml0ZSggYCR7eGh0bWxEaXJ9LyR7c2NyaXB0RmlsZW5hbWV9YCwgc2NyaXB0ICk7XG59Il0sIm5hbWVzIjpbImFzc2VydCIsImdydW50IiwiQ2hpcHBlckNvbnN0YW50cyIsIkNoaXBwZXJTdHJpbmdVdGlscyIsImdldFRpdGxlU3RyaW5nS2V5Iiwibm9kZUh0bWxFbmNvZGVyIiwicmVxdWlyZSIsInBhY2thZ2VYSFRNTCIsInhodG1sRGlyIiwiY29uZmlnIiwiZW5jb2RlciIsIkVuY29kZXIiLCJyZXBvIiwiYnJhbmQiLCJzdHJpbmdNYXAiLCJpbml0aWFsaXphdGlvblNjcmlwdCIsImxpY2Vuc2VTY3JpcHQiLCJzY3JpcHRzIiwiaHRtbEhlYWRlciIsImxvY2FsaXplZFRpdGxlIiwiRkFMTEJBQ0tfTE9DQUxFIiwibGljZW5zZVNjcmlwdEZpbGVuYW1lIiwiaW5pdGlhbGl6YXRpb25TY3JpcHRGaWxlbmFtZSIsInNjcmlwdCIsImpvaW4iLCJzY3JpcHRGaWxlbmFtZSIsInhodG1sIiwicmVwbGFjZVBsYWNlaG9sZGVycyIsImZpbGUiLCJyZWFkIiwiUEhFVF9TSU1fVElUTEUiLCJodG1sRW5jb2RlIiwiUEhFVF9IVE1MX0hFQURFUiIsIlBIRVRfSU5JVElBTElaQVRJT05fU0NSSVBUIiwiUEhFVF9TSU1fU0NSSVBUUyIsIndyaXRlIl0sIm1hcHBpbmdzIjoiQUFBQSxzREFBc0Q7QUFFdEQ7Ozs7Q0FJQyxHQUVELFVBQVU7QUFDVixPQUFPQSxZQUFZLFNBQVM7QUFDNUIsT0FBT0MsV0FBVyx3REFBd0Q7QUFFMUUsT0FBT0Msc0JBQXNCLGdDQUFnQztBQUM3RCxPQUFPQyx3QkFBd0Isa0NBQWtDO0FBQ2pFLE9BQU9DLHVCQUF1Qix5QkFBeUI7QUFFdkQsTUFBTUMsa0JBQWtCQyxRQUFTO0FBRWpDOztDQUVDLEdBQ0QsZUFBZSxTQUFTQyxhQUFjQyxRQUFnQixFQUFFQyxNQUFzQjtJQUM1RSxNQUFNQyxVQUFVLElBQUlMLGdCQUFnQk0sT0FBTyxDQUFFO0lBRTdDLE1BQU0sRUFDSkMsSUFBSSxFQUNKQyxLQUFLLEVBQ0xDLFNBQVMsRUFDVEMsb0JBQW9CLEVBQ3BCQyxhQUFhLEVBQ2JDLE9BQU8sRUFDUEMsVUFBVSxBQUFDLFdBQVc7TUFDdkIsR0FBR1Q7SUFDSlQsT0FBUWMsV0FBVztJQUNuQmQsT0FBUWlCLFNBQVM7SUFFakIsTUFBTUUsaUJBQWlCTCxTQUFTLENBQUVaLGlCQUFpQmtCLGVBQWUsQ0FBRSxDQUFFaEIsa0JBQW1CUSxNQUFRO0lBRWpHLE1BQU1TLHdCQUF3QixHQUFHVCxLQUFLLFNBQVMsRUFBRUMsTUFBTSxHQUFHLENBQUM7SUFDM0QsTUFBTVMsK0JBQStCLEdBQUdWLEtBQUssZ0JBQWdCLEVBQUVDLE1BQU0sR0FBRyxDQUFDO0lBRXpFLE1BQU1VLFNBQVNOLFFBQVFPLElBQUksQ0FBRTtJQUM3QixNQUFNQyxpQkFBaUIsR0FBR2IsS0FBSyxDQUFDLEVBQUVDLE1BQU0sR0FBRyxDQUFDO0lBRTVDLE1BQU1hLFFBQVF2QixtQkFBbUJ3QixtQkFBbUIsQ0FBRTFCLE1BQU0yQixJQUFJLENBQUNDLElBQUksQ0FBRSxtQ0FBb0M7UUFDekdDLGdCQUFnQnBCLFFBQVFxQixVQUFVLENBQUVaO1FBQ3BDYSxrQkFBa0JkO1FBQ2xCZSw0QkFBNEIsQ0FBQyxvQ0FBb0MsRUFBRVosc0JBQXNCLCtEQUErRCxFQUFFQyw2QkFBNkIsMkJBQTJCLENBQUM7UUFDbk5ZLGtCQUFrQixDQUFDLG9DQUFvQyxFQUFFVCxlQUFlLDJCQUEyQixDQUFDO0lBQ3RHO0lBQ0F4QixNQUFNMkIsSUFBSSxDQUFDTyxLQUFLLENBQUUsR0FBRzNCLFNBQVMsQ0FBQyxFQUFFSSxLQUFLLElBQUksRUFBRUMsVUFBVSxTQUFTLEtBQUssQ0FBQyxDQUFDLEVBQUVBLE9BQU8sQ0FBQyxNQUFNLENBQUMsRUFBRWE7SUFDekZ6QixNQUFNMkIsSUFBSSxDQUFDTyxLQUFLLENBQUUsR0FBRzNCLFNBQVMsQ0FBQyxFQUFFYSx1QkFBdUIsRUFBRUw7SUFDMURmLE1BQU0yQixJQUFJLENBQUNPLEtBQUssQ0FBRSxHQUFHM0IsU0FBUyxDQUFDLEVBQUVjLDhCQUE4QixFQUFFUDtJQUNqRWQsTUFBTTJCLElBQUksQ0FBQ08sS0FBSyxDQUFFLEdBQUczQixTQUFTLENBQUMsRUFBRWlCLGdCQUFnQixFQUFFRjtBQUNyRCJ9