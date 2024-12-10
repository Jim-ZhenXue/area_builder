// Copyright 2015-2021, University of Colorado Boulder
import additionalBadText from '../../phet-rules/additional-bad-text.js';
import authorAnnotation from '../../phet-rules/author-annotation.js';
import badChipperText from '../../phet-rules/bad-chipper-text.js';
import badPhetLibraryText from '../../phet-rules/bad-phet-library-text.js';
import badSimText from '../../phet-rules/bad-sim-text.js';
import badText from '../../phet-rules/bad-text.js';
import badTypescriptText from '../../phet-rules/bad-typescript-text.js';
import copyright from '../../phet-rules/copyright.js';
import defaultExportClassShouldRegisterNamespace from '../../phet-rules/default-export-class-should-register-namespace.js';
import defaultExportMatchFilename from '../../phet-rules/default-export-match-filename.js';
import defaultImportMatchFilename from '../../phet-rules/default-import-match-filename.js';
import explicitMethodReturnType from '../../phet-rules/explicit-method-return-type.js';
import gruntTaskKebabCase from '../../phet-rules/grunt-task-kebab-case.js';
import importStatementExtensionJs from '../../phet-rules/import-statement-extension-js.js';
import importStatementExtension from '../../phet-rules/import-statement-extension.js';
import jsxTextElementsContainMatchingClass from '../../phet-rules/jsx-text-elements-contain-matching-class.js';
import namespaceMatch from '../../phet-rules/namespace-match.js';
import noHtmlConstructors from '../../phet-rules/no-html-constructors.js';
import noImportFromGruntTasks from '../../phet-rules/no-import-from-grunt-tasks.js';
import noInstanceofArray from '../../phet-rules/no-instanceof-array.js';
import noObjectSpreadOnNonLiterals from '../../phet-rules/no-object-spread-on-non-literals.js';
import noPropertyInRequireStatement from '../../phet-rules/no-property-in-require-statement.js';
import noSimpleTypeCheckingAssertions from '../../phet-rules/no-simple-type-checking-assertions.js';
import noViewImportedFromModel from '../../phet-rules/no-view-imported-from-model.js';
import phetIoObjectOptionsShouldNotPickFromPhetIoObject from '../../phet-rules/phet-io-object-options-should-not-pick-from-phet-io-object.js';
import phetObjectShorthand from '../../phet-rules/phet-object-shorthand.js';
import preferDerivedStringProperty from '../../phet-rules/prefer-derived-string-property.js';
import requirePropertySuffix from '../../phet-rules/require-property-suffix.js';
import requireStatementExtension from '../../phet-rules/require-statement-extension.js';
import requireStatementMatch from '../../phet-rules/require-statement-match.js';
import singleLineImport from '../../phet-rules/single-line-import.js';
import tandemNameShouldMatch from '../../phet-rules/tandem-name-should-match.js';
import todoShouldHaveIssue from '../../phet-rules/todo-should-have-issue.js';
import uppercaseStaticsShouldBeReadonly from '../../phet-rules/uppercase-statics-should-be-readonly.js';
import visibilityAnnotation from '../../phet-rules/visibility-annotation.js';
/**
 * Custom PhET rules for ESLint.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */ export default {
    rules: {
        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        // Custom Rules
        //
        'additional-bad-text': additionalBadText,
        'bad-text': badText,
        'bad-chipper-text': badChipperText,
        'bad-phet-library-text': badPhetLibraryText,
        'bad-sim-text': badSimText,
        'bad-typescript-text': badTypescriptText,
        copyright: copyright,
        // Custom rule for checking the copyright.copyright
        // Custom rule for checking TO-DOs have issues
        'todo-should-have-issue': todoShouldHaveIssue,
        // Custom rule for ensuring that images and text use scenery node
        'no-html-constructors': noHtmlConstructors,
        // Custom rule for avoiding instanceof Array.
        'no-instanceof-array': noInstanceofArray,
        // Custom rule for keeping import statements on a single line.
        'single-line-import': singleLineImport,
        // method declarations must have a visibility annotation
        'visibility-annotation': visibilityAnnotation,
        // key and value arguments to namespace.register() must match
        'namespace-match': namespaceMatch,
        // phet-specific require statement rule
        'require-statement-extension': requireStatementExtension,
        // phet-specific import statement rule
        'import-statement-extension': importStatementExtension,
        // phet-specific import statement rule
        'import-statement-extension-js': importStatementExtensionJs,
        // phet-specific require statement rule
        'require-statement-match': requireStatementMatch,
        // Require @public/@private for this.something = result;
        'no-property-in-require-statement': noPropertyInRequireStatement,
        // never allow object shorthand for properties, functions are ok.
        'phet-object-shorthand': phetObjectShorthand,
        // a default import variable name should be the same as the filename
        'default-import-match-filename': defaultImportMatchFilename,
        // When the default export of a file is a class, it should have a namespace register call
        'default-export-class-should-register-namespace': defaultExportClassShouldRegisterNamespace,
        // Importing the view from the model, uh oh. TODO: This is still in discussion, numerous repos opt out, see: https://github.com/phetsims/chipper/issues/1385
        'no-view-imported-from-model': noViewImportedFromModel,
        // Class names should match filename when exported.
        'default-export-match-filename': defaultExportMatchFilename,
        // Use DerivedStringProperty for its PhET-iO benefits and consistency, see https://github.com/phetsims/phet-io/issues/1943
        'prefer-derived-string-property': preferDerivedStringProperty,
        // A variable or attribute name should generally match the tandem name.
        'tandem-name-should-match': tandemNameShouldMatch,
        // Each source file should list at least one author
        'author-annotation': authorAnnotation,
        // Used for the website code, do not remove!
        'jsx-text-elements-contain-matching-class': jsxTextElementsContainMatchingClass,
        // Used for grunt sub-process Typescript pattern
        'no-import-from-grunt-tasks': noImportFromGruntTasks,
        // Used for kebab-case convention for grunt tasks
        'grunt-task-kebab-case': gruntTaskKebabCase,
        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        // Type checking rules. Documentation is at the usage site below
        'no-simple-type-checking-assertions': noSimpleTypeCheckingAssertions,
        'explicit-method-return-type': explicitMethodReturnType,
        'require-property-suffix': requirePropertySuffix,
        'uppercase-statics-should-be-readonly': uppercaseStaticsShouldBeReadonly,
        'no-object-spread-on-non-literals': noObjectSpreadOnNonLiterals,
        'phet-io-object-options-should-not-pick-from-phet-io-object': phetIoObjectOptionsShouldNotPickFromPhetIoObject
    }
};

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BlcmVubmlhbC1hbGlhcy9qcy9lc2xpbnQvY29uZmlnL3V0aWwvcGhldFJ1bGVzUGx1Z2luLm1qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNS0yMDIxLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuaW1wb3J0IGFkZGl0aW9uYWxCYWRUZXh0IGZyb20gJy4uLy4uL3BoZXQtcnVsZXMvYWRkaXRpb25hbC1iYWQtdGV4dC5qcyc7XG5pbXBvcnQgYXV0aG9yQW5ub3RhdGlvbiBmcm9tICcuLi8uLi9waGV0LXJ1bGVzL2F1dGhvci1hbm5vdGF0aW9uLmpzJztcbmltcG9ydCBiYWRDaGlwcGVyVGV4dCBmcm9tICcuLi8uLi9waGV0LXJ1bGVzL2JhZC1jaGlwcGVyLXRleHQuanMnO1xuaW1wb3J0IGJhZFBoZXRMaWJyYXJ5VGV4dCBmcm9tICcuLi8uLi9waGV0LXJ1bGVzL2JhZC1waGV0LWxpYnJhcnktdGV4dC5qcyc7XG5pbXBvcnQgYmFkU2ltVGV4dCBmcm9tICcuLi8uLi9waGV0LXJ1bGVzL2JhZC1zaW0tdGV4dC5qcyc7XG5pbXBvcnQgYmFkVGV4dCBmcm9tICcuLi8uLi9waGV0LXJ1bGVzL2JhZC10ZXh0LmpzJztcbmltcG9ydCBiYWRUeXBlc2NyaXB0VGV4dCBmcm9tICcuLi8uLi9waGV0LXJ1bGVzL2JhZC10eXBlc2NyaXB0LXRleHQuanMnO1xuaW1wb3J0IGNvcHlyaWdodCBmcm9tICcuLi8uLi9waGV0LXJ1bGVzL2NvcHlyaWdodC5qcyc7XG5pbXBvcnQgZGVmYXVsdEV4cG9ydENsYXNzU2hvdWxkUmVnaXN0ZXJOYW1lc3BhY2UgZnJvbSAnLi4vLi4vcGhldC1ydWxlcy9kZWZhdWx0LWV4cG9ydC1jbGFzcy1zaG91bGQtcmVnaXN0ZXItbmFtZXNwYWNlLmpzJztcbmltcG9ydCBkZWZhdWx0RXhwb3J0TWF0Y2hGaWxlbmFtZSBmcm9tICcuLi8uLi9waGV0LXJ1bGVzL2RlZmF1bHQtZXhwb3J0LW1hdGNoLWZpbGVuYW1lLmpzJztcbmltcG9ydCBkZWZhdWx0SW1wb3J0TWF0Y2hGaWxlbmFtZSBmcm9tICcuLi8uLi9waGV0LXJ1bGVzL2RlZmF1bHQtaW1wb3J0LW1hdGNoLWZpbGVuYW1lLmpzJztcbmltcG9ydCBleHBsaWNpdE1ldGhvZFJldHVyblR5cGUgZnJvbSAnLi4vLi4vcGhldC1ydWxlcy9leHBsaWNpdC1tZXRob2QtcmV0dXJuLXR5cGUuanMnO1xuaW1wb3J0IGdydW50VGFza0tlYmFiQ2FzZSBmcm9tICcuLi8uLi9waGV0LXJ1bGVzL2dydW50LXRhc2sta2ViYWItY2FzZS5qcyc7XG5pbXBvcnQgaW1wb3J0U3RhdGVtZW50RXh0ZW5zaW9uSnMgZnJvbSAnLi4vLi4vcGhldC1ydWxlcy9pbXBvcnQtc3RhdGVtZW50LWV4dGVuc2lvbi1qcy5qcyc7XG5pbXBvcnQgaW1wb3J0U3RhdGVtZW50RXh0ZW5zaW9uIGZyb20gJy4uLy4uL3BoZXQtcnVsZXMvaW1wb3J0LXN0YXRlbWVudC1leHRlbnNpb24uanMnO1xuaW1wb3J0IGpzeFRleHRFbGVtZW50c0NvbnRhaW5NYXRjaGluZ0NsYXNzIGZyb20gJy4uLy4uL3BoZXQtcnVsZXMvanN4LXRleHQtZWxlbWVudHMtY29udGFpbi1tYXRjaGluZy1jbGFzcy5qcyc7XG5pbXBvcnQgbmFtZXNwYWNlTWF0Y2ggZnJvbSAnLi4vLi4vcGhldC1ydWxlcy9uYW1lc3BhY2UtbWF0Y2guanMnO1xuaW1wb3J0IG5vSHRtbENvbnN0cnVjdG9ycyBmcm9tICcuLi8uLi9waGV0LXJ1bGVzL25vLWh0bWwtY29uc3RydWN0b3JzLmpzJztcbmltcG9ydCBub0ltcG9ydEZyb21HcnVudFRhc2tzIGZyb20gJy4uLy4uL3BoZXQtcnVsZXMvbm8taW1wb3J0LWZyb20tZ3J1bnQtdGFza3MuanMnO1xuaW1wb3J0IG5vSW5zdGFuY2VvZkFycmF5IGZyb20gJy4uLy4uL3BoZXQtcnVsZXMvbm8taW5zdGFuY2VvZi1hcnJheS5qcyc7XG5pbXBvcnQgbm9PYmplY3RTcHJlYWRPbk5vbkxpdGVyYWxzIGZyb20gJy4uLy4uL3BoZXQtcnVsZXMvbm8tb2JqZWN0LXNwcmVhZC1vbi1ub24tbGl0ZXJhbHMuanMnO1xuaW1wb3J0IG5vUHJvcGVydHlJblJlcXVpcmVTdGF0ZW1lbnQgZnJvbSAnLi4vLi4vcGhldC1ydWxlcy9uby1wcm9wZXJ0eS1pbi1yZXF1aXJlLXN0YXRlbWVudC5qcyc7XG5pbXBvcnQgbm9TaW1wbGVUeXBlQ2hlY2tpbmdBc3NlcnRpb25zIGZyb20gJy4uLy4uL3BoZXQtcnVsZXMvbm8tc2ltcGxlLXR5cGUtY2hlY2tpbmctYXNzZXJ0aW9ucy5qcyc7XG5pbXBvcnQgbm9WaWV3SW1wb3J0ZWRGcm9tTW9kZWwgZnJvbSAnLi4vLi4vcGhldC1ydWxlcy9uby12aWV3LWltcG9ydGVkLWZyb20tbW9kZWwuanMnO1xuaW1wb3J0IHBoZXRJb09iamVjdE9wdGlvbnNTaG91bGROb3RQaWNrRnJvbVBoZXRJb09iamVjdCBmcm9tICcuLi8uLi9waGV0LXJ1bGVzL3BoZXQtaW8tb2JqZWN0LW9wdGlvbnMtc2hvdWxkLW5vdC1waWNrLWZyb20tcGhldC1pby1vYmplY3QuanMnO1xuaW1wb3J0IHBoZXRPYmplY3RTaG9ydGhhbmQgZnJvbSAnLi4vLi4vcGhldC1ydWxlcy9waGV0LW9iamVjdC1zaG9ydGhhbmQuanMnO1xuaW1wb3J0IHByZWZlckRlcml2ZWRTdHJpbmdQcm9wZXJ0eSBmcm9tICcuLi8uLi9waGV0LXJ1bGVzL3ByZWZlci1kZXJpdmVkLXN0cmluZy1wcm9wZXJ0eS5qcyc7XG5pbXBvcnQgcmVxdWlyZVByb3BlcnR5U3VmZml4IGZyb20gJy4uLy4uL3BoZXQtcnVsZXMvcmVxdWlyZS1wcm9wZXJ0eS1zdWZmaXguanMnO1xuaW1wb3J0IHJlcXVpcmVTdGF0ZW1lbnRFeHRlbnNpb24gZnJvbSAnLi4vLi4vcGhldC1ydWxlcy9yZXF1aXJlLXN0YXRlbWVudC1leHRlbnNpb24uanMnO1xuaW1wb3J0IHJlcXVpcmVTdGF0ZW1lbnRNYXRjaCBmcm9tICcuLi8uLi9waGV0LXJ1bGVzL3JlcXVpcmUtc3RhdGVtZW50LW1hdGNoLmpzJztcbmltcG9ydCBzaW5nbGVMaW5lSW1wb3J0IGZyb20gJy4uLy4uL3BoZXQtcnVsZXMvc2luZ2xlLWxpbmUtaW1wb3J0LmpzJztcbmltcG9ydCB0YW5kZW1OYW1lU2hvdWxkTWF0Y2ggZnJvbSAnLi4vLi4vcGhldC1ydWxlcy90YW5kZW0tbmFtZS1zaG91bGQtbWF0Y2guanMnO1xuaW1wb3J0IHRvZG9TaG91bGRIYXZlSXNzdWUgZnJvbSAnLi4vLi4vcGhldC1ydWxlcy90b2RvLXNob3VsZC1oYXZlLWlzc3VlLmpzJztcbmltcG9ydCB1cHBlcmNhc2VTdGF0aWNzU2hvdWxkQmVSZWFkb25seSBmcm9tICcuLi8uLi9waGV0LXJ1bGVzL3VwcGVyY2FzZS1zdGF0aWNzLXNob3VsZC1iZS1yZWFkb25seS5qcyc7XG5pbXBvcnQgdmlzaWJpbGl0eUFubm90YXRpb24gZnJvbSAnLi4vLi4vcGhldC1ydWxlcy92aXNpYmlsaXR5LWFubm90YXRpb24uanMnO1xuXG4vKipcbiAqIEN1c3RvbSBQaEVUIHJ1bGVzIGZvciBFU0xpbnQuXG4gKlxuICogQGF1dGhvciBTYW0gUmVpZCAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcbiAqIEBhdXRob3IgTWljaGFlbCBLYXV6bWFubiAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcbiAqL1xuZXhwb3J0IGRlZmF1bHQge1xuICBydWxlczoge1xuXG4gICAgLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbiAgICAvLyBDdXN0b20gUnVsZXNcbiAgICAvL1xuXG4gICAgJ2FkZGl0aW9uYWwtYmFkLXRleHQnOiBhZGRpdGlvbmFsQmFkVGV4dCxcbiAgICAnYmFkLXRleHQnOiBiYWRUZXh0LFxuICAgICdiYWQtY2hpcHBlci10ZXh0JzogYmFkQ2hpcHBlclRleHQsXG4gICAgJ2JhZC1waGV0LWxpYnJhcnktdGV4dCc6IGJhZFBoZXRMaWJyYXJ5VGV4dCxcbiAgICAnYmFkLXNpbS10ZXh0JzogYmFkU2ltVGV4dCxcbiAgICAnYmFkLXR5cGVzY3JpcHQtdGV4dCc6IGJhZFR5cGVzY3JpcHRUZXh0LFxuXG4gICAgY29weXJpZ2h0OiBjb3B5cmlnaHQsXG4gICAgLy8gQ3VzdG9tIHJ1bGUgZm9yIGNoZWNraW5nIHRoZSBjb3B5cmlnaHQuY29weXJpZ2h0XG5cbiAgICAvLyBDdXN0b20gcnVsZSBmb3IgY2hlY2tpbmcgVE8tRE9zIGhhdmUgaXNzdWVzXG4gICAgJ3RvZG8tc2hvdWxkLWhhdmUtaXNzdWUnOiB0b2RvU2hvdWxkSGF2ZUlzc3VlLFxuXG4gICAgLy8gQ3VzdG9tIHJ1bGUgZm9yIGVuc3VyaW5nIHRoYXQgaW1hZ2VzIGFuZCB0ZXh0IHVzZSBzY2VuZXJ5IG5vZGVcbiAgICAnbm8taHRtbC1jb25zdHJ1Y3RvcnMnOiBub0h0bWxDb25zdHJ1Y3RvcnMsXG5cbiAgICAvLyBDdXN0b20gcnVsZSBmb3IgYXZvaWRpbmcgaW5zdGFuY2VvZiBBcnJheS5cbiAgICAnbm8taW5zdGFuY2VvZi1hcnJheSc6IG5vSW5zdGFuY2VvZkFycmF5LFxuXG4gICAgLy8gQ3VzdG9tIHJ1bGUgZm9yIGtlZXBpbmcgaW1wb3J0IHN0YXRlbWVudHMgb24gYSBzaW5nbGUgbGluZS5cbiAgICAnc2luZ2xlLWxpbmUtaW1wb3J0Jzogc2luZ2xlTGluZUltcG9ydCxcblxuICAgIC8vIG1ldGhvZCBkZWNsYXJhdGlvbnMgbXVzdCBoYXZlIGEgdmlzaWJpbGl0eSBhbm5vdGF0aW9uXG4gICAgJ3Zpc2liaWxpdHktYW5ub3RhdGlvbic6IHZpc2liaWxpdHlBbm5vdGF0aW9uLFxuXG4gICAgLy8ga2V5IGFuZCB2YWx1ZSBhcmd1bWVudHMgdG8gbmFtZXNwYWNlLnJlZ2lzdGVyKCkgbXVzdCBtYXRjaFxuICAgICduYW1lc3BhY2UtbWF0Y2gnOiBuYW1lc3BhY2VNYXRjaCxcblxuICAgIC8vIHBoZXQtc3BlY2lmaWMgcmVxdWlyZSBzdGF0ZW1lbnQgcnVsZVxuICAgICdyZXF1aXJlLXN0YXRlbWVudC1leHRlbnNpb24nOiByZXF1aXJlU3RhdGVtZW50RXh0ZW5zaW9uLFxuXG4gICAgLy8gcGhldC1zcGVjaWZpYyBpbXBvcnQgc3RhdGVtZW50IHJ1bGVcbiAgICAnaW1wb3J0LXN0YXRlbWVudC1leHRlbnNpb24nOiBpbXBvcnRTdGF0ZW1lbnRFeHRlbnNpb24sXG5cbiAgICAvLyBwaGV0LXNwZWNpZmljIGltcG9ydCBzdGF0ZW1lbnQgcnVsZVxuICAgICdpbXBvcnQtc3RhdGVtZW50LWV4dGVuc2lvbi1qcyc6IGltcG9ydFN0YXRlbWVudEV4dGVuc2lvbkpzLFxuXG4gICAgLy8gcGhldC1zcGVjaWZpYyByZXF1aXJlIHN0YXRlbWVudCBydWxlXG4gICAgJ3JlcXVpcmUtc3RhdGVtZW50LW1hdGNoJzogcmVxdWlyZVN0YXRlbWVudE1hdGNoLFxuXG4gICAgLy8gUmVxdWlyZSBAcHVibGljL0Bwcml2YXRlIGZvciB0aGlzLnNvbWV0aGluZyA9IHJlc3VsdDtcbiAgICAnbm8tcHJvcGVydHktaW4tcmVxdWlyZS1zdGF0ZW1lbnQnOiBub1Byb3BlcnR5SW5SZXF1aXJlU3RhdGVtZW50LFxuXG4gICAgLy8gbmV2ZXIgYWxsb3cgb2JqZWN0IHNob3J0aGFuZCBmb3IgcHJvcGVydGllcywgZnVuY3Rpb25zIGFyZSBvay5cbiAgICAncGhldC1vYmplY3Qtc2hvcnRoYW5kJzogcGhldE9iamVjdFNob3J0aGFuZCxcblxuICAgIC8vIGEgZGVmYXVsdCBpbXBvcnQgdmFyaWFibGUgbmFtZSBzaG91bGQgYmUgdGhlIHNhbWUgYXMgdGhlIGZpbGVuYW1lXG4gICAgJ2RlZmF1bHQtaW1wb3J0LW1hdGNoLWZpbGVuYW1lJzogZGVmYXVsdEltcG9ydE1hdGNoRmlsZW5hbWUsXG5cbiAgICAvLyBXaGVuIHRoZSBkZWZhdWx0IGV4cG9ydCBvZiBhIGZpbGUgaXMgYSBjbGFzcywgaXQgc2hvdWxkIGhhdmUgYSBuYW1lc3BhY2UgcmVnaXN0ZXIgY2FsbFxuICAgICdkZWZhdWx0LWV4cG9ydC1jbGFzcy1zaG91bGQtcmVnaXN0ZXItbmFtZXNwYWNlJzogZGVmYXVsdEV4cG9ydENsYXNzU2hvdWxkUmVnaXN0ZXJOYW1lc3BhY2UsXG5cbiAgICAvLyBJbXBvcnRpbmcgdGhlIHZpZXcgZnJvbSB0aGUgbW9kZWwsIHVoIG9oLiBUT0RPOiBUaGlzIGlzIHN0aWxsIGluIGRpc2N1c3Npb24sIG51bWVyb3VzIHJlcG9zIG9wdCBvdXQsIHNlZTogaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2NoaXBwZXIvaXNzdWVzLzEzODVcbiAgICAnbm8tdmlldy1pbXBvcnRlZC1mcm9tLW1vZGVsJzogbm9WaWV3SW1wb3J0ZWRGcm9tTW9kZWwsXG5cbiAgICAvLyBDbGFzcyBuYW1lcyBzaG91bGQgbWF0Y2ggZmlsZW5hbWUgd2hlbiBleHBvcnRlZC5cbiAgICAnZGVmYXVsdC1leHBvcnQtbWF0Y2gtZmlsZW5hbWUnOiBkZWZhdWx0RXhwb3J0TWF0Y2hGaWxlbmFtZSxcblxuICAgIC8vIFVzZSBEZXJpdmVkU3RyaW5nUHJvcGVydHkgZm9yIGl0cyBQaEVULWlPIGJlbmVmaXRzIGFuZCBjb25zaXN0ZW5jeSwgc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9waGV0LWlvL2lzc3Vlcy8xOTQzXG4gICAgJ3ByZWZlci1kZXJpdmVkLXN0cmluZy1wcm9wZXJ0eSc6IHByZWZlckRlcml2ZWRTdHJpbmdQcm9wZXJ0eSxcblxuICAgIC8vIEEgdmFyaWFibGUgb3IgYXR0cmlidXRlIG5hbWUgc2hvdWxkIGdlbmVyYWxseSBtYXRjaCB0aGUgdGFuZGVtIG5hbWUuXG4gICAgJ3RhbmRlbS1uYW1lLXNob3VsZC1tYXRjaCc6IHRhbmRlbU5hbWVTaG91bGRNYXRjaCxcblxuICAgIC8vIEVhY2ggc291cmNlIGZpbGUgc2hvdWxkIGxpc3QgYXQgbGVhc3Qgb25lIGF1dGhvclxuICAgICdhdXRob3ItYW5ub3RhdGlvbic6IGF1dGhvckFubm90YXRpb24sXG5cbiAgICAvLyBVc2VkIGZvciB0aGUgd2Vic2l0ZSBjb2RlLCBkbyBub3QgcmVtb3ZlIVxuICAgICdqc3gtdGV4dC1lbGVtZW50cy1jb250YWluLW1hdGNoaW5nLWNsYXNzJzoganN4VGV4dEVsZW1lbnRzQ29udGFpbk1hdGNoaW5nQ2xhc3MsXG5cbiAgICAvLyBVc2VkIGZvciBncnVudCBzdWItcHJvY2VzcyBUeXBlc2NyaXB0IHBhdHRlcm5cbiAgICAnbm8taW1wb3J0LWZyb20tZ3J1bnQtdGFza3MnOiBub0ltcG9ydEZyb21HcnVudFRhc2tzLFxuXG4gICAgLy8gVXNlZCBmb3Iga2ViYWItY2FzZSBjb252ZW50aW9uIGZvciBncnVudCB0YXNrc1xuICAgICdncnVudC10YXNrLWtlYmFiLWNhc2UnOiBncnVudFRhc2tLZWJhYkNhc2UsXG5cbiAgICAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuICAgIC8vIFR5cGUgY2hlY2tpbmcgcnVsZXMuIERvY3VtZW50YXRpb24gaXMgYXQgdGhlIHVzYWdlIHNpdGUgYmVsb3dcbiAgICAnbm8tc2ltcGxlLXR5cGUtY2hlY2tpbmctYXNzZXJ0aW9ucyc6IG5vU2ltcGxlVHlwZUNoZWNraW5nQXNzZXJ0aW9ucyxcbiAgICAnZXhwbGljaXQtbWV0aG9kLXJldHVybi10eXBlJzogZXhwbGljaXRNZXRob2RSZXR1cm5UeXBlLFxuICAgICdyZXF1aXJlLXByb3BlcnR5LXN1ZmZpeCc6IHJlcXVpcmVQcm9wZXJ0eVN1ZmZpeCxcbiAgICAndXBwZXJjYXNlLXN0YXRpY3Mtc2hvdWxkLWJlLXJlYWRvbmx5JzogdXBwZXJjYXNlU3RhdGljc1Nob3VsZEJlUmVhZG9ubHksXG4gICAgJ25vLW9iamVjdC1zcHJlYWQtb24tbm9uLWxpdGVyYWxzJzogbm9PYmplY3RTcHJlYWRPbk5vbkxpdGVyYWxzLFxuICAgICdwaGV0LWlvLW9iamVjdC1vcHRpb25zLXNob3VsZC1ub3QtcGljay1mcm9tLXBoZXQtaW8tb2JqZWN0JzogcGhldElvT2JqZWN0T3B0aW9uc1Nob3VsZE5vdFBpY2tGcm9tUGhldElvT2JqZWN0XG4gICAgLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuICB9XG59OyJdLCJuYW1lcyI6WyJhZGRpdGlvbmFsQmFkVGV4dCIsImF1dGhvckFubm90YXRpb24iLCJiYWRDaGlwcGVyVGV4dCIsImJhZFBoZXRMaWJyYXJ5VGV4dCIsImJhZFNpbVRleHQiLCJiYWRUZXh0IiwiYmFkVHlwZXNjcmlwdFRleHQiLCJjb3B5cmlnaHQiLCJkZWZhdWx0RXhwb3J0Q2xhc3NTaG91bGRSZWdpc3Rlck5hbWVzcGFjZSIsImRlZmF1bHRFeHBvcnRNYXRjaEZpbGVuYW1lIiwiZGVmYXVsdEltcG9ydE1hdGNoRmlsZW5hbWUiLCJleHBsaWNpdE1ldGhvZFJldHVyblR5cGUiLCJncnVudFRhc2tLZWJhYkNhc2UiLCJpbXBvcnRTdGF0ZW1lbnRFeHRlbnNpb25KcyIsImltcG9ydFN0YXRlbWVudEV4dGVuc2lvbiIsImpzeFRleHRFbGVtZW50c0NvbnRhaW5NYXRjaGluZ0NsYXNzIiwibmFtZXNwYWNlTWF0Y2giLCJub0h0bWxDb25zdHJ1Y3RvcnMiLCJub0ltcG9ydEZyb21HcnVudFRhc2tzIiwibm9JbnN0YW5jZW9mQXJyYXkiLCJub09iamVjdFNwcmVhZE9uTm9uTGl0ZXJhbHMiLCJub1Byb3BlcnR5SW5SZXF1aXJlU3RhdGVtZW50Iiwibm9TaW1wbGVUeXBlQ2hlY2tpbmdBc3NlcnRpb25zIiwibm9WaWV3SW1wb3J0ZWRGcm9tTW9kZWwiLCJwaGV0SW9PYmplY3RPcHRpb25zU2hvdWxkTm90UGlja0Zyb21QaGV0SW9PYmplY3QiLCJwaGV0T2JqZWN0U2hvcnRoYW5kIiwicHJlZmVyRGVyaXZlZFN0cmluZ1Byb3BlcnR5IiwicmVxdWlyZVByb3BlcnR5U3VmZml4IiwicmVxdWlyZVN0YXRlbWVudEV4dGVuc2lvbiIsInJlcXVpcmVTdGF0ZW1lbnRNYXRjaCIsInNpbmdsZUxpbmVJbXBvcnQiLCJ0YW5kZW1OYW1lU2hvdWxkTWF0Y2giLCJ0b2RvU2hvdWxkSGF2ZUlzc3VlIiwidXBwZXJjYXNlU3RhdGljc1Nob3VsZEJlUmVhZG9ubHkiLCJ2aXNpYmlsaXR5QW5ub3RhdGlvbiIsInJ1bGVzIl0sIm1hcHBpbmdzIjoiQUFBQSxzREFBc0Q7QUFFdEQsT0FBT0EsdUJBQXVCLDBDQUEwQztBQUN4RSxPQUFPQyxzQkFBc0Isd0NBQXdDO0FBQ3JFLE9BQU9DLG9CQUFvQix1Q0FBdUM7QUFDbEUsT0FBT0Msd0JBQXdCLDRDQUE0QztBQUMzRSxPQUFPQyxnQkFBZ0IsbUNBQW1DO0FBQzFELE9BQU9DLGFBQWEsK0JBQStCO0FBQ25ELE9BQU9DLHVCQUF1QiwwQ0FBMEM7QUFDeEUsT0FBT0MsZUFBZSxnQ0FBZ0M7QUFDdEQsT0FBT0MsK0NBQStDLHFFQUFxRTtBQUMzSCxPQUFPQyxnQ0FBZ0Msb0RBQW9EO0FBQzNGLE9BQU9DLGdDQUFnQyxvREFBb0Q7QUFDM0YsT0FBT0MsOEJBQThCLGtEQUFrRDtBQUN2RixPQUFPQyx3QkFBd0IsNENBQTRDO0FBQzNFLE9BQU9DLGdDQUFnQyxvREFBb0Q7QUFDM0YsT0FBT0MsOEJBQThCLGlEQUFpRDtBQUN0RixPQUFPQyx5Q0FBeUMsK0RBQStEO0FBQy9HLE9BQU9DLG9CQUFvQixzQ0FBc0M7QUFDakUsT0FBT0Msd0JBQXdCLDJDQUEyQztBQUMxRSxPQUFPQyw0QkFBNEIsaURBQWlEO0FBQ3BGLE9BQU9DLHVCQUF1QiwwQ0FBMEM7QUFDeEUsT0FBT0MsaUNBQWlDLHVEQUF1RDtBQUMvRixPQUFPQyxrQ0FBa0MsdURBQXVEO0FBQ2hHLE9BQU9DLG9DQUFvQyx5REFBeUQ7QUFDcEcsT0FBT0MsNkJBQTZCLGtEQUFrRDtBQUN0RixPQUFPQyxzREFBc0QsaUZBQWlGO0FBQzlJLE9BQU9DLHlCQUF5Qiw0Q0FBNEM7QUFDNUUsT0FBT0MsaUNBQWlDLHFEQUFxRDtBQUM3RixPQUFPQywyQkFBMkIsOENBQThDO0FBQ2hGLE9BQU9DLCtCQUErQixrREFBa0Q7QUFDeEYsT0FBT0MsMkJBQTJCLDhDQUE4QztBQUNoRixPQUFPQyxzQkFBc0IseUNBQXlDO0FBQ3RFLE9BQU9DLDJCQUEyQiwrQ0FBK0M7QUFDakYsT0FBT0MseUJBQXlCLDZDQUE2QztBQUM3RSxPQUFPQyxzQ0FBc0MsMkRBQTJEO0FBQ3hHLE9BQU9DLDBCQUEwQiw0Q0FBNEM7QUFFN0U7Ozs7O0NBS0MsR0FDRCxlQUFlO0lBQ2JDLE9BQU87UUFFTCxvSEFBb0g7UUFDcEgsZUFBZTtRQUNmLEVBQUU7UUFFRix1QkFBdUJuQztRQUN2QixZQUFZSztRQUNaLG9CQUFvQkg7UUFDcEIseUJBQXlCQztRQUN6QixnQkFBZ0JDO1FBQ2hCLHVCQUF1QkU7UUFFdkJDLFdBQVdBO1FBQ1gsbURBQW1EO1FBRW5ELDhDQUE4QztRQUM5QywwQkFBMEJ5QjtRQUUxQixpRUFBaUU7UUFDakUsd0JBQXdCZjtRQUV4Qiw2Q0FBNkM7UUFDN0MsdUJBQXVCRTtRQUV2Qiw4REFBOEQ7UUFDOUQsc0JBQXNCVztRQUV0Qix3REFBd0Q7UUFDeEQseUJBQXlCSTtRQUV6Qiw2REFBNkQ7UUFDN0QsbUJBQW1CbEI7UUFFbkIsdUNBQXVDO1FBQ3ZDLCtCQUErQlk7UUFFL0Isc0NBQXNDO1FBQ3RDLDhCQUE4QmQ7UUFFOUIsc0NBQXNDO1FBQ3RDLGlDQUFpQ0Q7UUFFakMsdUNBQXVDO1FBQ3ZDLDJCQUEyQmdCO1FBRTNCLHdEQUF3RDtRQUN4RCxvQ0FBb0NSO1FBRXBDLGlFQUFpRTtRQUNqRSx5QkFBeUJJO1FBRXpCLG9FQUFvRTtRQUNwRSxpQ0FBaUNmO1FBRWpDLHlGQUF5RjtRQUN6RixrREFBa0RGO1FBRWxELDRKQUE0SjtRQUM1SiwrQkFBK0JlO1FBRS9CLG1EQUFtRDtRQUNuRCxpQ0FBaUNkO1FBRWpDLDBIQUEwSDtRQUMxSCxrQ0FBa0NpQjtRQUVsQyx1RUFBdUU7UUFDdkUsNEJBQTRCSztRQUU1QixtREFBbUQ7UUFDbkQscUJBQXFCOUI7UUFFckIsNENBQTRDO1FBQzVDLDRDQUE0Q2M7UUFFNUMsZ0RBQWdEO1FBQ2hELDhCQUE4Qkc7UUFFOUIsaURBQWlEO1FBQ2pELHlCQUF5Qk47UUFFekIsb0hBQW9IO1FBQ3BILGdFQUFnRTtRQUNoRSxzQ0FBc0NVO1FBQ3RDLCtCQUErQlg7UUFDL0IsMkJBQTJCZ0I7UUFDM0Isd0NBQXdDTTtRQUN4QyxvQ0FBb0NiO1FBQ3BDLDhEQUE4REk7SUFFaEU7QUFDRixFQUFFIn0=