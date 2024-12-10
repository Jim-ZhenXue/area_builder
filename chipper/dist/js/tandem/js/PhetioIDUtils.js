// Copyright 2017-2023, University of Colorado Boulder
/**
 * Utilities for creating and manipulating the unique identifiers assigned to instrumented PhET-iO instances, aka
 * phetioIDs.
 *
 * Many of these functions' jsdoc is rendered and visible publicly to PhET-iO client. Those sections should be
 * marked, see top level comment in PhetioClient.js about private vs public documentation
 *
 * @author Chris Malley (PixelZoom, Inc.)
 * @author Sam Reid (PhET Interactive Simulations)
 */ (function() {
    // define the phetio global
    window.phetio = window.phetio || {};
    // constants
    const SEPARATOR = '.';
    const GROUP_SEPARATOR = '_';
    const INTER_TERM_SEPARATOR = '-';
    const GENERAL_COMPONENT_NAME = 'general';
    const GLOBAL_COMPONENT_NAME = 'global';
    const HOME_SCREEN_COMPONENT_NAME = 'homeScreen';
    const MODEL_COMPONENT_NAME = 'model';
    const VIEW_COMPONENT_NAME = 'view';
    const COLORS_COMPONENT_NAME = 'colors';
    const STRINGS_COMPONENT_NAME = 'strings';
    const CONTROLLER_COMPONENT_NAME = 'controller';
    const SCREEN_COMPONENT_NAME = 'Screen';
    const ARCHETYPE = 'archetype';
    const CAPSULE_SUFFIX = 'Capsule';
    /**
   * Helpful methods for manipulating phetioIDs. Used to minimize the amount of duplicated logic specific to the string
   * structure of the phetioID. Available in the main PhET-iO js import.
   * @namespace
   */ window.phetio.PhetioIDUtils = {
        // Private Doc: The below jsdoc is public to the PhET-iO API documentation. Change wisely.
        /**
     * Appends a component to an existing phetioID to create a new unique phetioID for the component.
     * @example
     * append( 'myScreen.myControlPanel', 'myComboBox' )
     * -->  'myScreen.myControlPanel.myComboBox'
     * @public
     * @param {string} phetioID - the ID of the PhET-iO Element
     * @param {string|string[]} componentNames - the name or list of names to append to the ID
     * @returns {string} - the appended phetioID
     */ append: function(phetioID, ...componentNames) {
            componentNames.forEach((componentName)=>{
                assert && assert(componentName.indexOf(SEPARATOR) === -1, `separator appears in componentName: ${componentName}`);
                if (componentName === '') {
                    return;
                }
                const separator = phetioID === '' ? '' : SEPARATOR;
                phetioID += separator + componentName;
            });
            return phetioID;
        },
        // Private Doc: The below jsdoc is public to the PhET-iO API documentation. Change wisely.
        /**
     * Given a phetioID for a PhET-iO Element, get the part of that ID that pertains to the component (basically the
     * tail piece).
     * @example
     * getComponentName( 'myScreen.myControlPanel.myComboBox' )
     * -->  'myComboBox'
     * @public
     * @param {string} phetioID - the ID of the PhET-iO Element
     * @returns {string} - the component name
     */ getComponentName: function(phetioID) {
            assert && assert(phetioID.length > 0);
            const indexOfLastSeparator = phetioID.lastIndexOf(SEPARATOR);
            if (indexOfLastSeparator === -1) {
                return phetioID;
            } else {
                return phetioID.substring(indexOfLastSeparator + 1, phetioID.length);
            }
        },
        // Private Doc: The below jsdoc is public to the PhET-iO API documentation. Change wisely.
        /**
     * Given a phetioID for a PhET-iO Element, get the phetioID of the parent component.
     * @example
     * getParentID( 'myScreen.myControlPanel.myComboBox' )
     * -->  'myScreen.myControlPanel'
     * @public
     * @param {string} phetioID - the ID of the PhET-iO Element
     * @returns {string|null} - the phetioID of the parent, or null if there is no parent
     */ getParentID: function(phetioID) {
            const indexOfLastSeparator = phetioID.lastIndexOf(SEPARATOR);
            return indexOfLastSeparator === -1 ? null : phetioID.substring(0, indexOfLastSeparator);
        },
        // Private Doc: The below jsdoc is public to the PhET-iO API documentation. Change wisely.
        /**
     * Given a phetioID for an instrumented object, get a string that can be used to assign an ID to a DOM element
     * @param {string} phetioID - the ID of the PhET-iO Element
     * @returns {string}
     * @public
     * @deprecated
     */ getDOMElementID: function(phetioID) {
            return `phetioID:${phetioID}`;
        },
        // Private Doc: The below jsdoc is public to the PhET-iO API documentation. Change wisely.
        /**
     * Get the screen id from the phetioID.
     * @example
     * getScreenID( 'sim.myScreen.model.property' )
     * --> sim.myScreen
     * getScreenID( 'sim.myScreen' )
     * --> sim.myScreen
     * getScreenID( 'sim.general.activeProperty' )
     * --> null
     * @param {string} phetioID
     * @returns {string|null} - null if there is no screen component name in the phetioID
     */ getScreenID: function(phetioID) {
            const screenIDParts = [];
            const phetioIDParts = phetioID.split(SEPARATOR);
            for(let i = 0; i < phetioIDParts.length; i++){
                const componentPart = phetioIDParts[i];
                screenIDParts.push(componentPart);
                const indexOfScreenMarker = componentPart.indexOf(SCREEN_COMPONENT_NAME);
                if (indexOfScreenMarker > 0 && indexOfScreenMarker + SCREEN_COMPONENT_NAME.length === componentPart.length) {
                    return screenIDParts.join(SEPARATOR);
                }
            }
            return null;
        },
        // Private Doc: The below jsdoc is public to the PhET-iO API documentation. Change wisely.
        /**
     * Get the index number from the component name of the component name provided.
     * @param {string} componentName
     * @returns {number}
     * @example
     * getGroupElementIndex( 'particle_1' )
     * --> 1
     * @public
     */ getGroupElementIndex: function(componentName) {
            assert && assert(componentName.indexOf(window.phetio.PhetioIDUtils.GROUP_SEPARATOR) >= 0, 'component name for phetioID should have group element syntax');
            return Number(componentName.split(window.phetio.PhetioIDUtils.GROUP_SEPARATOR)[1]);
        },
        /**
     * Returns true if the potential ancestor is indeed an ancestor of the potential descendant, but not the same phetioID
     * @param {string} potentialAncestorPhetioID
     * @param {string} potentialDescendantPhetioID
     * @returns {boolean}
     * @public
     */ isAncestor: function(potentialAncestorPhetioID, potentialDescendantPhetioID) {
            const ancestorComponents = potentialAncestorPhetioID.split(SEPARATOR);
            const descendantComponents = potentialDescendantPhetioID.split(SEPARATOR);
            for(let i = 0; i < ancestorComponents.length; i++){
                if (ancestorComponents[i] !== descendantComponents[i]) {
                    return false;
                }
            }
            // not the same child
            return potentialDescendantPhetioID !== potentialAncestorPhetioID;
        },
        /**
     * Converts a given phetioID to one where all dynamic element terms (i.e. ones with an underscore, like battery_4)
     * are replaced with the term 'archetype'. This helps when looking up the archetype phetioID or metadata for a given
     * dynamic element. Also support INTER_TERM_SEPARATOR delimited parts, like 'sim.screen1.myObject.term1-and-term2-battery_4-term4-etc'.
     *
     * See unit tests and examples in PhetioIDUtilsTests.ts.
     * @param {string} phetioID
     * @returns {string}
     */ getArchetypalPhetioID: function(phetioID) {
            const phetioIDParts = phetioID.split(SEPARATOR);
            for(let i = 0; i < phetioIDParts.length; i++){
                const term = phetioIDParts[i];
                if (term.endsWith(CAPSULE_SUFFIX) && i < phetioIDParts.length - 1) {
                    phetioIDParts[i + 1] = ARCHETYPE;
                    i++;
                } else {
                    const mappedInnerTerms = term.split(INTER_TERM_SEPARATOR).map((term)=>term.includes(GROUP_SEPARATOR) ? ARCHETYPE : term);
                    phetioIDParts[i] = mappedInnerTerms.join(INTER_TERM_SEPARATOR);
                }
            }
            return phetioIDParts.join(SEPARATOR);
        },
        // Private Doc: The below jsdoc is public to the PhET-iO API documentation. Change wisely.
        /**
     * The separator used to piece together a phet-io ID.
     * @type {string}
     * @constant
     * @public
     */ SEPARATOR: SEPARATOR,
        // Private Doc: The below jsdoc is public to the PhET-iO API documentation. Change wisely.
        /**
     * The separator used to specify the count of a element in a group.
     * @type {string}
     * @constant
     * @public
     */ GROUP_SEPARATOR: GROUP_SEPARATOR,
        /**
     * The separator used to specify terms in a phetioID that is used by another phetioID. For example:
     *
     * sim.general.view.sim-global-otherID
     *
     * @type {string}
     * @constant
     * @public
     */ INTER_TERM_SEPARATOR: INTER_TERM_SEPARATOR,
        // Private Doc: The below jsdoc is public to the PhET-iO API documentation. Change wisely.
        /**
     * The component name for the id section that holds phet-io elements general to all simulations.
     * @type {string}
     * @constant
     * @public
     */ GENERAL_COMPONENT_NAME: GENERAL_COMPONENT_NAME,
        // Private Doc: The below jsdoc is public to the PhET-iO API documentation. Change wisely.
        /**
     * The component name for the id section that holds simulation specific elements that don't belong in a screen.
     * @type {string}
     * @constant
     * @public
     */ GLOBAL_COMPONENT_NAME: GLOBAL_COMPONENT_NAME,
        // Private Doc: The below jsdoc is public to the PhET-iO API documentation. Change wisely.
        /**
     * The component name for the id section that holds the home screen.
     * @type {string}
     * @constant
     * @public
     */ HOME_SCREEN_COMPONENT_NAME: HOME_SCREEN_COMPONENT_NAME,
        // Private Doc: The below jsdoc is public to the PhET-iO API documentation. Change wisely.
        /**
     * The component name for an id section that holds model specific elements.
     * @type {string}
     * @constant
     * @public
     */ MODEL_COMPONENT_NAME: MODEL_COMPONENT_NAME,
        // Private Doc: The below jsdoc is public to the PhET-iO API documentation. Change wisely.
        /**
     * The component name for an id section that holds view specific elements.
     * @type {string}
     * @constant
     * @public
     */ VIEW_COMPONENT_NAME: VIEW_COMPONENT_NAME,
        // Private Doc: The below jsdoc is public to the PhET-iO API documentation. Change wisely.
        /**
     * The component name for an id section that holds controller specific elements.
     * @type {string}
     * @constant
     * @public
     */ CONTROLLER_COMPONENT_NAME: CONTROLLER_COMPONENT_NAME,
        /**
     * The component name for a section that holds colors
     * @type {string}
     * @constant
     * @public
     */ COLORS_COMPONENT_NAME: COLORS_COMPONENT_NAME,
        /**
     * The component name for a section that holds strings
     * @type {string}
     * @constant
     * @public
     */ STRINGS_COMPONENT_NAME: STRINGS_COMPONENT_NAME,
        /**
     * The component name for a dynamic element archetype
     * @type {string}
     * @constant
     * @public
     */ ARCHETYPE: ARCHETYPE,
        /**
     * The component name suffix for the container (parent) of a dynamic element that doesn't have an '_' in it.
     * @type {string}
     * @constant
     * @public
     */ CAPSULE_SUFFIX: CAPSULE_SUFFIX
    };
})();

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3RhbmRlbS9qcy9QaGV0aW9JRFV0aWxzLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE3LTIwMjMsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIFV0aWxpdGllcyBmb3IgY3JlYXRpbmcgYW5kIG1hbmlwdWxhdGluZyB0aGUgdW5pcXVlIGlkZW50aWZpZXJzIGFzc2lnbmVkIHRvIGluc3RydW1lbnRlZCBQaEVULWlPIGluc3RhbmNlcywgYWthXG4gKiBwaGV0aW9JRHMuXG4gKlxuICogTWFueSBvZiB0aGVzZSBmdW5jdGlvbnMnIGpzZG9jIGlzIHJlbmRlcmVkIGFuZCB2aXNpYmxlIHB1YmxpY2x5IHRvIFBoRVQtaU8gY2xpZW50LiBUaG9zZSBzZWN0aW9ucyBzaG91bGQgYmVcbiAqIG1hcmtlZCwgc2VlIHRvcCBsZXZlbCBjb21tZW50IGluIFBoZXRpb0NsaWVudC5qcyBhYm91dCBwcml2YXRlIHZzIHB1YmxpYyBkb2N1bWVudGF0aW9uXG4gKlxuICogQGF1dGhvciBDaHJpcyBNYWxsZXkgKFBpeGVsWm9vbSwgSW5jLilcbiAqIEBhdXRob3IgU2FtIFJlaWQgKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXG4gKi9cbiggZnVuY3Rpb24oKSB7XG5cblxuICAvLyBkZWZpbmUgdGhlIHBoZXRpbyBnbG9iYWxcbiAgd2luZG93LnBoZXRpbyA9IHdpbmRvdy5waGV0aW8gfHwge307XG5cbiAgLy8gY29uc3RhbnRzXG4gIGNvbnN0IFNFUEFSQVRPUiA9ICcuJztcbiAgY29uc3QgR1JPVVBfU0VQQVJBVE9SID0gJ18nO1xuICBjb25zdCBJTlRFUl9URVJNX1NFUEFSQVRPUiA9ICctJztcbiAgY29uc3QgR0VORVJBTF9DT01QT05FTlRfTkFNRSA9ICdnZW5lcmFsJztcbiAgY29uc3QgR0xPQkFMX0NPTVBPTkVOVF9OQU1FID0gJ2dsb2JhbCc7XG4gIGNvbnN0IEhPTUVfU0NSRUVOX0NPTVBPTkVOVF9OQU1FID0gJ2hvbWVTY3JlZW4nO1xuICBjb25zdCBNT0RFTF9DT01QT05FTlRfTkFNRSA9ICdtb2RlbCc7XG4gIGNvbnN0IFZJRVdfQ09NUE9ORU5UX05BTUUgPSAndmlldyc7XG4gIGNvbnN0IENPTE9SU19DT01QT05FTlRfTkFNRSA9ICdjb2xvcnMnO1xuICBjb25zdCBTVFJJTkdTX0NPTVBPTkVOVF9OQU1FID0gJ3N0cmluZ3MnO1xuICBjb25zdCBDT05UUk9MTEVSX0NPTVBPTkVOVF9OQU1FID0gJ2NvbnRyb2xsZXInO1xuICBjb25zdCBTQ1JFRU5fQ09NUE9ORU5UX05BTUUgPSAnU2NyZWVuJztcbiAgY29uc3QgQVJDSEVUWVBFID0gJ2FyY2hldHlwZSc7XG4gIGNvbnN0IENBUFNVTEVfU1VGRklYID0gJ0NhcHN1bGUnO1xuXG4gIC8qKlxuICAgKiBIZWxwZnVsIG1ldGhvZHMgZm9yIG1hbmlwdWxhdGluZyBwaGV0aW9JRHMuIFVzZWQgdG8gbWluaW1pemUgdGhlIGFtb3VudCBvZiBkdXBsaWNhdGVkIGxvZ2ljIHNwZWNpZmljIHRvIHRoZSBzdHJpbmdcbiAgICogc3RydWN0dXJlIG9mIHRoZSBwaGV0aW9JRC4gQXZhaWxhYmxlIGluIHRoZSBtYWluIFBoRVQtaU8ganMgaW1wb3J0LlxuICAgKiBAbmFtZXNwYWNlXG4gICAqL1xuICB3aW5kb3cucGhldGlvLlBoZXRpb0lEVXRpbHMgPSB7XG5cbiAgICAvLyBQcml2YXRlIERvYzogVGhlIGJlbG93IGpzZG9jIGlzIHB1YmxpYyB0byB0aGUgUGhFVC1pTyBBUEkgZG9jdW1lbnRhdGlvbi4gQ2hhbmdlIHdpc2VseS5cbiAgICAvKipcbiAgICAgKiBBcHBlbmRzIGEgY29tcG9uZW50IHRvIGFuIGV4aXN0aW5nIHBoZXRpb0lEIHRvIGNyZWF0ZSBhIG5ldyB1bmlxdWUgcGhldGlvSUQgZm9yIHRoZSBjb21wb25lbnQuXG4gICAgICogQGV4YW1wbGVcbiAgICAgKiBhcHBlbmQoICdteVNjcmVlbi5teUNvbnRyb2xQYW5lbCcsICdteUNvbWJvQm94JyApXG4gICAgICogLS0+ICAnbXlTY3JlZW4ubXlDb250cm9sUGFuZWwubXlDb21ib0JveCdcbiAgICAgKiBAcHVibGljXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHBoZXRpb0lEIC0gdGhlIElEIG9mIHRoZSBQaEVULWlPIEVsZW1lbnRcbiAgICAgKiBAcGFyYW0ge3N0cmluZ3xzdHJpbmdbXX0gY29tcG9uZW50TmFtZXMgLSB0aGUgbmFtZSBvciBsaXN0IG9mIG5hbWVzIHRvIGFwcGVuZCB0byB0aGUgSURcbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nfSAtIHRoZSBhcHBlbmRlZCBwaGV0aW9JRFxuICAgICAqL1xuICAgIGFwcGVuZDogZnVuY3Rpb24oIHBoZXRpb0lELCAuLi5jb21wb25lbnROYW1lcyApIHtcbiAgICAgIGNvbXBvbmVudE5hbWVzLmZvckVhY2goIGNvbXBvbmVudE5hbWUgPT4ge1xuICAgICAgICBhc3NlcnQgJiYgYXNzZXJ0KCBjb21wb25lbnROYW1lLmluZGV4T2YoIFNFUEFSQVRPUiApID09PSAtMSwgYHNlcGFyYXRvciBhcHBlYXJzIGluIGNvbXBvbmVudE5hbWU6ICR7Y29tcG9uZW50TmFtZX1gICk7XG4gICAgICAgIGlmICggY29tcG9uZW50TmFtZSA9PT0gJycgKSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHNlcGFyYXRvciA9IHBoZXRpb0lEID09PSAnJyA/ICcnIDogU0VQQVJBVE9SO1xuICAgICAgICBwaGV0aW9JRCArPSBzZXBhcmF0b3IgKyBjb21wb25lbnROYW1lO1xuICAgICAgfSApO1xuICAgICAgcmV0dXJuIHBoZXRpb0lEO1xuICAgIH0sXG5cbiAgICAvLyBQcml2YXRlIERvYzogVGhlIGJlbG93IGpzZG9jIGlzIHB1YmxpYyB0byB0aGUgUGhFVC1pTyBBUEkgZG9jdW1lbnRhdGlvbi4gQ2hhbmdlIHdpc2VseS5cbiAgICAvKipcbiAgICAgKiBHaXZlbiBhIHBoZXRpb0lEIGZvciBhIFBoRVQtaU8gRWxlbWVudCwgZ2V0IHRoZSBwYXJ0IG9mIHRoYXQgSUQgdGhhdCBwZXJ0YWlucyB0byB0aGUgY29tcG9uZW50IChiYXNpY2FsbHkgdGhlXG4gICAgICogdGFpbCBwaWVjZSkuXG4gICAgICogQGV4YW1wbGVcbiAgICAgKiBnZXRDb21wb25lbnROYW1lKCAnbXlTY3JlZW4ubXlDb250cm9sUGFuZWwubXlDb21ib0JveCcgKVxuICAgICAqIC0tPiAgJ215Q29tYm9Cb3gnXG4gICAgICogQHB1YmxpY1xuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBwaGV0aW9JRCAtIHRoZSBJRCBvZiB0aGUgUGhFVC1pTyBFbGVtZW50XG4gICAgICogQHJldHVybnMge3N0cmluZ30gLSB0aGUgY29tcG9uZW50IG5hbWVcbiAgICAgKi9cbiAgICBnZXRDb21wb25lbnROYW1lOiBmdW5jdGlvbiggcGhldGlvSUQgKSB7XG4gICAgICBhc3NlcnQgJiYgYXNzZXJ0KCBwaGV0aW9JRC5sZW5ndGggPiAwICk7XG4gICAgICBjb25zdCBpbmRleE9mTGFzdFNlcGFyYXRvciA9IHBoZXRpb0lELmxhc3RJbmRleE9mKCBTRVBBUkFUT1IgKTtcbiAgICAgIGlmICggaW5kZXhPZkxhc3RTZXBhcmF0b3IgPT09IC0xICkge1xuICAgICAgICByZXR1cm4gcGhldGlvSUQ7XG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgcmV0dXJuIHBoZXRpb0lELnN1YnN0cmluZyggaW5kZXhPZkxhc3RTZXBhcmF0b3IgKyAxLCBwaGV0aW9JRC5sZW5ndGggKTtcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgLy8gUHJpdmF0ZSBEb2M6IFRoZSBiZWxvdyBqc2RvYyBpcyBwdWJsaWMgdG8gdGhlIFBoRVQtaU8gQVBJIGRvY3VtZW50YXRpb24uIENoYW5nZSB3aXNlbHkuXG4gICAgLyoqXG4gICAgICogR2l2ZW4gYSBwaGV0aW9JRCBmb3IgYSBQaEVULWlPIEVsZW1lbnQsIGdldCB0aGUgcGhldGlvSUQgb2YgdGhlIHBhcmVudCBjb21wb25lbnQuXG4gICAgICogQGV4YW1wbGVcbiAgICAgKiBnZXRQYXJlbnRJRCggJ215U2NyZWVuLm15Q29udHJvbFBhbmVsLm15Q29tYm9Cb3gnIClcbiAgICAgKiAtLT4gICdteVNjcmVlbi5teUNvbnRyb2xQYW5lbCdcbiAgICAgKiBAcHVibGljXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHBoZXRpb0lEIC0gdGhlIElEIG9mIHRoZSBQaEVULWlPIEVsZW1lbnRcbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nfG51bGx9IC0gdGhlIHBoZXRpb0lEIG9mIHRoZSBwYXJlbnQsIG9yIG51bGwgaWYgdGhlcmUgaXMgbm8gcGFyZW50XG4gICAgICovXG4gICAgZ2V0UGFyZW50SUQ6IGZ1bmN0aW9uKCBwaGV0aW9JRCApIHtcbiAgICAgIGNvbnN0IGluZGV4T2ZMYXN0U2VwYXJhdG9yID0gcGhldGlvSUQubGFzdEluZGV4T2YoIFNFUEFSQVRPUiApO1xuICAgICAgcmV0dXJuIGluZGV4T2ZMYXN0U2VwYXJhdG9yID09PSAtMSA/IG51bGwgOiBwaGV0aW9JRC5zdWJzdHJpbmcoIDAsIGluZGV4T2ZMYXN0U2VwYXJhdG9yICk7XG4gICAgfSxcblxuICAgIC8vIFByaXZhdGUgRG9jOiBUaGUgYmVsb3cganNkb2MgaXMgcHVibGljIHRvIHRoZSBQaEVULWlPIEFQSSBkb2N1bWVudGF0aW9uLiBDaGFuZ2Ugd2lzZWx5LlxuICAgIC8qKlxuICAgICAqIEdpdmVuIGEgcGhldGlvSUQgZm9yIGFuIGluc3RydW1lbnRlZCBvYmplY3QsIGdldCBhIHN0cmluZyB0aGF0IGNhbiBiZSB1c2VkIHRvIGFzc2lnbiBhbiBJRCB0byBhIERPTSBlbGVtZW50XG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHBoZXRpb0lEIC0gdGhlIElEIG9mIHRoZSBQaEVULWlPIEVsZW1lbnRcbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nfVxuICAgICAqIEBwdWJsaWNcbiAgICAgKiBAZGVwcmVjYXRlZFxuICAgICAqL1xuICAgIGdldERPTUVsZW1lbnRJRDogZnVuY3Rpb24oIHBoZXRpb0lEICkge1xuICAgICAgcmV0dXJuIGBwaGV0aW9JRDoke3BoZXRpb0lEfWA7XG4gICAgfSxcblxuICAgIC8vIFByaXZhdGUgRG9jOiBUaGUgYmVsb3cganNkb2MgaXMgcHVibGljIHRvIHRoZSBQaEVULWlPIEFQSSBkb2N1bWVudGF0aW9uLiBDaGFuZ2Ugd2lzZWx5LlxuICAgIC8qKlxuICAgICAqIEdldCB0aGUgc2NyZWVuIGlkIGZyb20gdGhlIHBoZXRpb0lELlxuICAgICAqIEBleGFtcGxlXG4gICAgICogZ2V0U2NyZWVuSUQoICdzaW0ubXlTY3JlZW4ubW9kZWwucHJvcGVydHknIClcbiAgICAgKiAtLT4gc2ltLm15U2NyZWVuXG4gICAgICogZ2V0U2NyZWVuSUQoICdzaW0ubXlTY3JlZW4nIClcbiAgICAgKiAtLT4gc2ltLm15U2NyZWVuXG4gICAgICogZ2V0U2NyZWVuSUQoICdzaW0uZ2VuZXJhbC5hY3RpdmVQcm9wZXJ0eScgKVxuICAgICAqIC0tPiBudWxsXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHBoZXRpb0lEXG4gICAgICogQHJldHVybnMge3N0cmluZ3xudWxsfSAtIG51bGwgaWYgdGhlcmUgaXMgbm8gc2NyZWVuIGNvbXBvbmVudCBuYW1lIGluIHRoZSBwaGV0aW9JRFxuICAgICAqL1xuICAgIGdldFNjcmVlbklEOiBmdW5jdGlvbiggcGhldGlvSUQgKSB7XG4gICAgICBjb25zdCBzY3JlZW5JRFBhcnRzID0gW107XG4gICAgICBjb25zdCBwaGV0aW9JRFBhcnRzID0gcGhldGlvSUQuc3BsaXQoIFNFUEFSQVRPUiApO1xuICAgICAgZm9yICggbGV0IGkgPSAwOyBpIDwgcGhldGlvSURQYXJ0cy5sZW5ndGg7IGkrKyApIHtcbiAgICAgICAgY29uc3QgY29tcG9uZW50UGFydCA9IHBoZXRpb0lEUGFydHNbIGkgXTtcbiAgICAgICAgc2NyZWVuSURQYXJ0cy5wdXNoKCBjb21wb25lbnRQYXJ0ICk7XG4gICAgICAgIGNvbnN0IGluZGV4T2ZTY3JlZW5NYXJrZXIgPSBjb21wb25lbnRQYXJ0LmluZGV4T2YoIFNDUkVFTl9DT01QT05FTlRfTkFNRSApO1xuICAgICAgICBpZiAoIGluZGV4T2ZTY3JlZW5NYXJrZXIgPiAwICYmIGluZGV4T2ZTY3JlZW5NYXJrZXIgKyBTQ1JFRU5fQ09NUE9ORU5UX05BTUUubGVuZ3RoID09PSBjb21wb25lbnRQYXJ0Lmxlbmd0aCApIHsgLy8gZW5kc1dpdGggcHJveHlcbiAgICAgICAgICByZXR1cm4gc2NyZWVuSURQYXJ0cy5qb2luKCBTRVBBUkFUT1IgKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfSxcblxuICAgIC8vIFByaXZhdGUgRG9jOiBUaGUgYmVsb3cganNkb2MgaXMgcHVibGljIHRvIHRoZSBQaEVULWlPIEFQSSBkb2N1bWVudGF0aW9uLiBDaGFuZ2Ugd2lzZWx5LlxuICAgIC8qKlxuICAgICAqIEdldCB0aGUgaW5kZXggbnVtYmVyIGZyb20gdGhlIGNvbXBvbmVudCBuYW1lIG9mIHRoZSBjb21wb25lbnQgbmFtZSBwcm92aWRlZC5cbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gY29tcG9uZW50TmFtZVxuICAgICAqIEByZXR1cm5zIHtudW1iZXJ9XG4gICAgICogQGV4YW1wbGVcbiAgICAgKiBnZXRHcm91cEVsZW1lbnRJbmRleCggJ3BhcnRpY2xlXzEnIClcbiAgICAgKiAtLT4gMVxuICAgICAqIEBwdWJsaWNcbiAgICAgKi9cbiAgICBnZXRHcm91cEVsZW1lbnRJbmRleDogZnVuY3Rpb24oIGNvbXBvbmVudE5hbWUgKSB7XG4gICAgICBhc3NlcnQgJiYgYXNzZXJ0KCBjb21wb25lbnROYW1lLmluZGV4T2YoIHdpbmRvdy5waGV0aW8uUGhldGlvSURVdGlscy5HUk9VUF9TRVBBUkFUT1IgKSA+PSAwLFxuICAgICAgICAnY29tcG9uZW50IG5hbWUgZm9yIHBoZXRpb0lEIHNob3VsZCBoYXZlIGdyb3VwIGVsZW1lbnQgc3ludGF4JyApO1xuICAgICAgcmV0dXJuIE51bWJlciggY29tcG9uZW50TmFtZS5zcGxpdCggd2luZG93LnBoZXRpby5QaGV0aW9JRFV0aWxzLkdST1VQX1NFUEFSQVRPUiApWyAxIF0gKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmV0dXJucyB0cnVlIGlmIHRoZSBwb3RlbnRpYWwgYW5jZXN0b3IgaXMgaW5kZWVkIGFuIGFuY2VzdG9yIG9mIHRoZSBwb3RlbnRpYWwgZGVzY2VuZGFudCwgYnV0IG5vdCB0aGUgc2FtZSBwaGV0aW9JRFxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBwb3RlbnRpYWxBbmNlc3RvclBoZXRpb0lEXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHBvdGVudGlhbERlc2NlbmRhbnRQaGV0aW9JRFxuICAgICAqIEByZXR1cm5zIHtib29sZWFufVxuICAgICAqIEBwdWJsaWNcbiAgICAgKi9cbiAgICBpc0FuY2VzdG9yOiBmdW5jdGlvbiggcG90ZW50aWFsQW5jZXN0b3JQaGV0aW9JRCwgcG90ZW50aWFsRGVzY2VuZGFudFBoZXRpb0lEICkge1xuICAgICAgY29uc3QgYW5jZXN0b3JDb21wb25lbnRzID0gcG90ZW50aWFsQW5jZXN0b3JQaGV0aW9JRC5zcGxpdCggU0VQQVJBVE9SICk7XG4gICAgICBjb25zdCBkZXNjZW5kYW50Q29tcG9uZW50cyA9IHBvdGVudGlhbERlc2NlbmRhbnRQaGV0aW9JRC5zcGxpdCggU0VQQVJBVE9SICk7XG4gICAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBhbmNlc3RvckNvbXBvbmVudHMubGVuZ3RoOyBpKysgKSB7XG4gICAgICAgIGlmICggYW5jZXN0b3JDb21wb25lbnRzWyBpIF0gIT09IGRlc2NlbmRhbnRDb21wb25lbnRzWyBpIF0gKSB7XG4gICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8vIG5vdCB0aGUgc2FtZSBjaGlsZFxuICAgICAgcmV0dXJuIHBvdGVudGlhbERlc2NlbmRhbnRQaGV0aW9JRCAhPT0gcG90ZW50aWFsQW5jZXN0b3JQaGV0aW9JRDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQ29udmVydHMgYSBnaXZlbiBwaGV0aW9JRCB0byBvbmUgd2hlcmUgYWxsIGR5bmFtaWMgZWxlbWVudCB0ZXJtcyAoaS5lLiBvbmVzIHdpdGggYW4gdW5kZXJzY29yZSwgbGlrZSBiYXR0ZXJ5XzQpXG4gICAgICogYXJlIHJlcGxhY2VkIHdpdGggdGhlIHRlcm0gJ2FyY2hldHlwZScuIFRoaXMgaGVscHMgd2hlbiBsb29raW5nIHVwIHRoZSBhcmNoZXR5cGUgcGhldGlvSUQgb3IgbWV0YWRhdGEgZm9yIGEgZ2l2ZW5cbiAgICAgKiBkeW5hbWljIGVsZW1lbnQuIEFsc28gc3VwcG9ydCBJTlRFUl9URVJNX1NFUEFSQVRPUiBkZWxpbWl0ZWQgcGFydHMsIGxpa2UgJ3NpbS5zY3JlZW4xLm15T2JqZWN0LnRlcm0xLWFuZC10ZXJtMi1iYXR0ZXJ5XzQtdGVybTQtZXRjJy5cbiAgICAgKlxuICAgICAqIFNlZSB1bml0IHRlc3RzIGFuZCBleGFtcGxlcyBpbiBQaGV0aW9JRFV0aWxzVGVzdHMudHMuXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHBoZXRpb0lEXG4gICAgICogQHJldHVybnMge3N0cmluZ31cbiAgICAgKi9cbiAgICBnZXRBcmNoZXR5cGFsUGhldGlvSUQ6IGZ1bmN0aW9uKCBwaGV0aW9JRCApIHtcbiAgICAgIGNvbnN0IHBoZXRpb0lEUGFydHMgPSBwaGV0aW9JRC5zcGxpdCggU0VQQVJBVE9SICk7XG5cbiAgICAgIGZvciAoIGxldCBpID0gMDsgaSA8IHBoZXRpb0lEUGFydHMubGVuZ3RoOyBpKysgKSB7XG4gICAgICAgIGNvbnN0IHRlcm0gPSBwaGV0aW9JRFBhcnRzWyBpIF07XG5cbiAgICAgICAgaWYgKCB0ZXJtLmVuZHNXaXRoKCBDQVBTVUxFX1NVRkZJWCApICYmIGkgPCBwaGV0aW9JRFBhcnRzLmxlbmd0aCAtIDEgKSB7XG4gICAgICAgICAgcGhldGlvSURQYXJ0c1sgaSArIDEgXSA9IEFSQ0hFVFlQRTtcbiAgICAgICAgICBpKys7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgY29uc3QgbWFwcGVkSW5uZXJUZXJtcyA9IHRlcm0uc3BsaXQoIElOVEVSX1RFUk1fU0VQQVJBVE9SICkubWFwKCB0ZXJtID0+IHRlcm0uaW5jbHVkZXMoIEdST1VQX1NFUEFSQVRPUiApID8gQVJDSEVUWVBFIDogdGVybSApO1xuICAgICAgICAgIHBoZXRpb0lEUGFydHNbIGkgXSA9IG1hcHBlZElubmVyVGVybXMuam9pbiggSU5URVJfVEVSTV9TRVBBUkFUT1IgKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIHBoZXRpb0lEUGFydHMuam9pbiggU0VQQVJBVE9SICk7XG4gICAgfSxcblxuICAgIC8vIFByaXZhdGUgRG9jOiBUaGUgYmVsb3cganNkb2MgaXMgcHVibGljIHRvIHRoZSBQaEVULWlPIEFQSSBkb2N1bWVudGF0aW9uLiBDaGFuZ2Ugd2lzZWx5LlxuICAgIC8qKlxuICAgICAqIFRoZSBzZXBhcmF0b3IgdXNlZCB0byBwaWVjZSB0b2dldGhlciBhIHBoZXQtaW8gSUQuXG4gICAgICogQHR5cGUge3N0cmluZ31cbiAgICAgKiBAY29uc3RhbnRcbiAgICAgKiBAcHVibGljXG4gICAgICovXG4gICAgU0VQQVJBVE9SOiBTRVBBUkFUT1IsXG5cbiAgICAvLyBQcml2YXRlIERvYzogVGhlIGJlbG93IGpzZG9jIGlzIHB1YmxpYyB0byB0aGUgUGhFVC1pTyBBUEkgZG9jdW1lbnRhdGlvbi4gQ2hhbmdlIHdpc2VseS5cbiAgICAvKipcbiAgICAgKiBUaGUgc2VwYXJhdG9yIHVzZWQgdG8gc3BlY2lmeSB0aGUgY291bnQgb2YgYSBlbGVtZW50IGluIGEgZ3JvdXAuXG4gICAgICogQHR5cGUge3N0cmluZ31cbiAgICAgKiBAY29uc3RhbnRcbiAgICAgKiBAcHVibGljXG4gICAgICovXG4gICAgR1JPVVBfU0VQQVJBVE9SOiBHUk9VUF9TRVBBUkFUT1IsXG5cbiAgICAvKipcbiAgICAgKiBUaGUgc2VwYXJhdG9yIHVzZWQgdG8gc3BlY2lmeSB0ZXJtcyBpbiBhIHBoZXRpb0lEIHRoYXQgaXMgdXNlZCBieSBhbm90aGVyIHBoZXRpb0lELiBGb3IgZXhhbXBsZTpcbiAgICAgKlxuICAgICAqIHNpbS5nZW5lcmFsLnZpZXcuc2ltLWdsb2JhbC1vdGhlcklEXG4gICAgICpcbiAgICAgKiBAdHlwZSB7c3RyaW5nfVxuICAgICAqIEBjb25zdGFudFxuICAgICAqIEBwdWJsaWNcbiAgICAgKi9cbiAgICBJTlRFUl9URVJNX1NFUEFSQVRPUjogSU5URVJfVEVSTV9TRVBBUkFUT1IsXG5cbiAgICAvLyBQcml2YXRlIERvYzogVGhlIGJlbG93IGpzZG9jIGlzIHB1YmxpYyB0byB0aGUgUGhFVC1pTyBBUEkgZG9jdW1lbnRhdGlvbi4gQ2hhbmdlIHdpc2VseS5cbiAgICAvKipcbiAgICAgKiBUaGUgY29tcG9uZW50IG5hbWUgZm9yIHRoZSBpZCBzZWN0aW9uIHRoYXQgaG9sZHMgcGhldC1pbyBlbGVtZW50cyBnZW5lcmFsIHRvIGFsbCBzaW11bGF0aW9ucy5cbiAgICAgKiBAdHlwZSB7c3RyaW5nfVxuICAgICAqIEBjb25zdGFudFxuICAgICAqIEBwdWJsaWNcbiAgICAgKi9cbiAgICBHRU5FUkFMX0NPTVBPTkVOVF9OQU1FOiBHRU5FUkFMX0NPTVBPTkVOVF9OQU1FLFxuXG4gICAgLy8gUHJpdmF0ZSBEb2M6IFRoZSBiZWxvdyBqc2RvYyBpcyBwdWJsaWMgdG8gdGhlIFBoRVQtaU8gQVBJIGRvY3VtZW50YXRpb24uIENoYW5nZSB3aXNlbHkuXG4gICAgLyoqXG4gICAgICogVGhlIGNvbXBvbmVudCBuYW1lIGZvciB0aGUgaWQgc2VjdGlvbiB0aGF0IGhvbGRzIHNpbXVsYXRpb24gc3BlY2lmaWMgZWxlbWVudHMgdGhhdCBkb24ndCBiZWxvbmcgaW4gYSBzY3JlZW4uXG4gICAgICogQHR5cGUge3N0cmluZ31cbiAgICAgKiBAY29uc3RhbnRcbiAgICAgKiBAcHVibGljXG4gICAgICovXG4gICAgR0xPQkFMX0NPTVBPTkVOVF9OQU1FOiBHTE9CQUxfQ09NUE9ORU5UX05BTUUsXG5cbiAgICAvLyBQcml2YXRlIERvYzogVGhlIGJlbG93IGpzZG9jIGlzIHB1YmxpYyB0byB0aGUgUGhFVC1pTyBBUEkgZG9jdW1lbnRhdGlvbi4gQ2hhbmdlIHdpc2VseS5cbiAgICAvKipcbiAgICAgKiBUaGUgY29tcG9uZW50IG5hbWUgZm9yIHRoZSBpZCBzZWN0aW9uIHRoYXQgaG9sZHMgdGhlIGhvbWUgc2NyZWVuLlxuICAgICAqIEB0eXBlIHtzdHJpbmd9XG4gICAgICogQGNvbnN0YW50XG4gICAgICogQHB1YmxpY1xuICAgICAqL1xuICAgIEhPTUVfU0NSRUVOX0NPTVBPTkVOVF9OQU1FOiBIT01FX1NDUkVFTl9DT01QT05FTlRfTkFNRSxcblxuICAgIC8vIFByaXZhdGUgRG9jOiBUaGUgYmVsb3cganNkb2MgaXMgcHVibGljIHRvIHRoZSBQaEVULWlPIEFQSSBkb2N1bWVudGF0aW9uLiBDaGFuZ2Ugd2lzZWx5LlxuICAgIC8qKlxuICAgICAqIFRoZSBjb21wb25lbnQgbmFtZSBmb3IgYW4gaWQgc2VjdGlvbiB0aGF0IGhvbGRzIG1vZGVsIHNwZWNpZmljIGVsZW1lbnRzLlxuICAgICAqIEB0eXBlIHtzdHJpbmd9XG4gICAgICogQGNvbnN0YW50XG4gICAgICogQHB1YmxpY1xuICAgICAqL1xuICAgIE1PREVMX0NPTVBPTkVOVF9OQU1FOiBNT0RFTF9DT01QT05FTlRfTkFNRSxcblxuICAgIC8vIFByaXZhdGUgRG9jOiBUaGUgYmVsb3cganNkb2MgaXMgcHVibGljIHRvIHRoZSBQaEVULWlPIEFQSSBkb2N1bWVudGF0aW9uLiBDaGFuZ2Ugd2lzZWx5LlxuICAgIC8qKlxuICAgICAqIFRoZSBjb21wb25lbnQgbmFtZSBmb3IgYW4gaWQgc2VjdGlvbiB0aGF0IGhvbGRzIHZpZXcgc3BlY2lmaWMgZWxlbWVudHMuXG4gICAgICogQHR5cGUge3N0cmluZ31cbiAgICAgKiBAY29uc3RhbnRcbiAgICAgKiBAcHVibGljXG4gICAgICovXG4gICAgVklFV19DT01QT05FTlRfTkFNRTogVklFV19DT01QT05FTlRfTkFNRSxcblxuICAgIC8vIFByaXZhdGUgRG9jOiBUaGUgYmVsb3cganNkb2MgaXMgcHVibGljIHRvIHRoZSBQaEVULWlPIEFQSSBkb2N1bWVudGF0aW9uLiBDaGFuZ2Ugd2lzZWx5LlxuICAgIC8qKlxuICAgICAqIFRoZSBjb21wb25lbnQgbmFtZSBmb3IgYW4gaWQgc2VjdGlvbiB0aGF0IGhvbGRzIGNvbnRyb2xsZXIgc3BlY2lmaWMgZWxlbWVudHMuXG4gICAgICogQHR5cGUge3N0cmluZ31cbiAgICAgKiBAY29uc3RhbnRcbiAgICAgKiBAcHVibGljXG4gICAgICovXG4gICAgQ09OVFJPTExFUl9DT01QT05FTlRfTkFNRTogQ09OVFJPTExFUl9DT01QT05FTlRfTkFNRSxcblxuICAgIC8qKlxuICAgICAqIFRoZSBjb21wb25lbnQgbmFtZSBmb3IgYSBzZWN0aW9uIHRoYXQgaG9sZHMgY29sb3JzXG4gICAgICogQHR5cGUge3N0cmluZ31cbiAgICAgKiBAY29uc3RhbnRcbiAgICAgKiBAcHVibGljXG4gICAgICovXG4gICAgQ09MT1JTX0NPTVBPTkVOVF9OQU1FOiBDT0xPUlNfQ09NUE9ORU5UX05BTUUsXG5cbiAgICAvKipcbiAgICAgKiBUaGUgY29tcG9uZW50IG5hbWUgZm9yIGEgc2VjdGlvbiB0aGF0IGhvbGRzIHN0cmluZ3NcbiAgICAgKiBAdHlwZSB7c3RyaW5nfVxuICAgICAqIEBjb25zdGFudFxuICAgICAqIEBwdWJsaWNcbiAgICAgKi9cbiAgICBTVFJJTkdTX0NPTVBPTkVOVF9OQU1FOiBTVFJJTkdTX0NPTVBPTkVOVF9OQU1FLFxuXG4gICAgLyoqXG4gICAgICogVGhlIGNvbXBvbmVudCBuYW1lIGZvciBhIGR5bmFtaWMgZWxlbWVudCBhcmNoZXR5cGVcbiAgICAgKiBAdHlwZSB7c3RyaW5nfVxuICAgICAqIEBjb25zdGFudFxuICAgICAqIEBwdWJsaWNcbiAgICAgKi9cbiAgICBBUkNIRVRZUEU6IEFSQ0hFVFlQRSxcblxuICAgIC8qKlxuICAgICAqIFRoZSBjb21wb25lbnQgbmFtZSBzdWZmaXggZm9yIHRoZSBjb250YWluZXIgKHBhcmVudCkgb2YgYSBkeW5hbWljIGVsZW1lbnQgdGhhdCBkb2Vzbid0IGhhdmUgYW4gJ18nIGluIGl0LlxuICAgICAqIEB0eXBlIHtzdHJpbmd9XG4gICAgICogQGNvbnN0YW50XG4gICAgICogQHB1YmxpY1xuICAgICAqL1xuICAgIENBUFNVTEVfU1VGRklYOiBDQVBTVUxFX1NVRkZJWFxuICB9O1xufSApKCk7Il0sIm5hbWVzIjpbIndpbmRvdyIsInBoZXRpbyIsIlNFUEFSQVRPUiIsIkdST1VQX1NFUEFSQVRPUiIsIklOVEVSX1RFUk1fU0VQQVJBVE9SIiwiR0VORVJBTF9DT01QT05FTlRfTkFNRSIsIkdMT0JBTF9DT01QT05FTlRfTkFNRSIsIkhPTUVfU0NSRUVOX0NPTVBPTkVOVF9OQU1FIiwiTU9ERUxfQ09NUE9ORU5UX05BTUUiLCJWSUVXX0NPTVBPTkVOVF9OQU1FIiwiQ09MT1JTX0NPTVBPTkVOVF9OQU1FIiwiU1RSSU5HU19DT01QT05FTlRfTkFNRSIsIkNPTlRST0xMRVJfQ09NUE9ORU5UX05BTUUiLCJTQ1JFRU5fQ09NUE9ORU5UX05BTUUiLCJBUkNIRVRZUEUiLCJDQVBTVUxFX1NVRkZJWCIsIlBoZXRpb0lEVXRpbHMiLCJhcHBlbmQiLCJwaGV0aW9JRCIsImNvbXBvbmVudE5hbWVzIiwiZm9yRWFjaCIsImNvbXBvbmVudE5hbWUiLCJhc3NlcnQiLCJpbmRleE9mIiwic2VwYXJhdG9yIiwiZ2V0Q29tcG9uZW50TmFtZSIsImxlbmd0aCIsImluZGV4T2ZMYXN0U2VwYXJhdG9yIiwibGFzdEluZGV4T2YiLCJzdWJzdHJpbmciLCJnZXRQYXJlbnRJRCIsImdldERPTUVsZW1lbnRJRCIsImdldFNjcmVlbklEIiwic2NyZWVuSURQYXJ0cyIsInBoZXRpb0lEUGFydHMiLCJzcGxpdCIsImkiLCJjb21wb25lbnRQYXJ0IiwicHVzaCIsImluZGV4T2ZTY3JlZW5NYXJrZXIiLCJqb2luIiwiZ2V0R3JvdXBFbGVtZW50SW5kZXgiLCJOdW1iZXIiLCJpc0FuY2VzdG9yIiwicG90ZW50aWFsQW5jZXN0b3JQaGV0aW9JRCIsInBvdGVudGlhbERlc2NlbmRhbnRQaGV0aW9JRCIsImFuY2VzdG9yQ29tcG9uZW50cyIsImRlc2NlbmRhbnRDb21wb25lbnRzIiwiZ2V0QXJjaGV0eXBhbFBoZXRpb0lEIiwidGVybSIsImVuZHNXaXRoIiwibWFwcGVkSW5uZXJUZXJtcyIsIm1hcCIsImluY2x1ZGVzIl0sIm1hcHBpbmdzIjoiQUFBQSxzREFBc0Q7QUFFdEQ7Ozs7Ozs7OztDQVNDLEdBQ0MsQ0FBQTtJQUdBLDJCQUEyQjtJQUMzQkEsT0FBT0MsTUFBTSxHQUFHRCxPQUFPQyxNQUFNLElBQUksQ0FBQztJQUVsQyxZQUFZO0lBQ1osTUFBTUMsWUFBWTtJQUNsQixNQUFNQyxrQkFBa0I7SUFDeEIsTUFBTUMsdUJBQXVCO0lBQzdCLE1BQU1DLHlCQUF5QjtJQUMvQixNQUFNQyx3QkFBd0I7SUFDOUIsTUFBTUMsNkJBQTZCO0lBQ25DLE1BQU1DLHVCQUF1QjtJQUM3QixNQUFNQyxzQkFBc0I7SUFDNUIsTUFBTUMsd0JBQXdCO0lBQzlCLE1BQU1DLHlCQUF5QjtJQUMvQixNQUFNQyw0QkFBNEI7SUFDbEMsTUFBTUMsd0JBQXdCO0lBQzlCLE1BQU1DLFlBQVk7SUFDbEIsTUFBTUMsaUJBQWlCO0lBRXZCOzs7O0dBSUMsR0FDRGYsT0FBT0MsTUFBTSxDQUFDZSxhQUFhLEdBQUc7UUFFNUIsMEZBQTBGO1FBQzFGOzs7Ozs7Ozs7S0FTQyxHQUNEQyxRQUFRLFNBQVVDLFFBQVEsRUFBRSxHQUFHQyxjQUFjO1lBQzNDQSxlQUFlQyxPQUFPLENBQUVDLENBQUFBO2dCQUN0QkMsVUFBVUEsT0FBUUQsY0FBY0UsT0FBTyxDQUFFckIsZUFBZ0IsQ0FBQyxHQUFHLENBQUMsb0NBQW9DLEVBQUVtQixlQUFlO2dCQUNuSCxJQUFLQSxrQkFBa0IsSUFBSztvQkFDMUI7Z0JBQ0Y7Z0JBQ0EsTUFBTUcsWUFBWU4sYUFBYSxLQUFLLEtB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