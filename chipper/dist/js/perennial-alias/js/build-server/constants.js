// Copyright 2017, University of Colorado Boulder
/**
 * Constants required for the build-server
 *
 * @author Matt Pennington
 */ const fs = require('graceful-fs'); // eslint-disable-line phet/require-statement-match
const getBuildServerConfig = require('./getBuildServerConfig');
const BUILD_SERVER_CONFIG = getBuildServerConfig(fs);
module.exports = {
    BUILD_SERVER_CONFIG: BUILD_SERVER_CONFIG,
    LISTEN_PORT: 16371,
    HTML_SIMS_DIRECTORY: BUILD_SERVER_CONFIG.htmlSimsDirectory,
    PHET_IO_SIMS_DIRECTORY: BUILD_SERVER_CONFIG.phetioSimsDirectory,
    REPOS_KEY: 'repos',
    DEPENDENCIES_KEY: 'dependencies',
    LOCALES_KEY: 'locales',
    API_KEY: 'api',
    SIM_NAME_KEY: 'simName',
    VERSION_KEY: 'version',
    OPTION_KEY: 'option',
    EMAIL_KEY: 'email',
    BRANCH_KEY: 'branch',
    USER_ID_KEY: 'userId',
    TRANSLATOR_ID_KEY: 'translatorId',
    AUTHORIZATION_KEY: 'authorizationCode',
    SERVERS_KEY: 'servers',
    BRANDS_KEY: 'brands',
    PRODUCTION_SERVER: 'production',
    DEV_SERVER: 'dev',
    PHET_BRAND: 'phet',
    PHET_IO_BRAND: 'phet-io',
    ENGLISH_LOCALE: 'en',
    PERENNIAL: '.'
};

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3BlcmVubmlhbC1hbGlhcy9qcy9idWlsZC1zZXJ2ZXIvY29uc3RhbnRzLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE3LCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuLyoqXG4gKiBDb25zdGFudHMgcmVxdWlyZWQgZm9yIHRoZSBidWlsZC1zZXJ2ZXJcbiAqXG4gKiBAYXV0aG9yIE1hdHQgUGVubmluZ3RvblxuICovXG5cblxuY29uc3QgZnMgPSByZXF1aXJlKCAnZ3JhY2VmdWwtZnMnICk7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgcGhldC9yZXF1aXJlLXN0YXRlbWVudC1tYXRjaFxuY29uc3QgZ2V0QnVpbGRTZXJ2ZXJDb25maWcgPSByZXF1aXJlKCAnLi9nZXRCdWlsZFNlcnZlckNvbmZpZycgKTtcblxuY29uc3QgQlVJTERfU0VSVkVSX0NPTkZJRyA9IGdldEJ1aWxkU2VydmVyQ29uZmlnKCBmcyApO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgQlVJTERfU0VSVkVSX0NPTkZJRzogQlVJTERfU0VSVkVSX0NPTkZJRyxcbiAgTElTVEVOX1BPUlQ6IDE2MzcxLFxuICBIVE1MX1NJTVNfRElSRUNUT1JZOiBCVUlMRF9TRVJWRVJfQ09ORklHLmh0bWxTaW1zRGlyZWN0b3J5LFxuICBQSEVUX0lPX1NJTVNfRElSRUNUT1JZOiBCVUlMRF9TRVJWRVJfQ09ORklHLnBoZXRpb1NpbXNEaXJlY3RvcnksXG4gIFJFUE9TX0tFWTogJ3JlcG9zJyxcbiAgREVQRU5ERU5DSUVTX0tFWTogJ2RlcGVuZGVuY2llcycsXG4gIExPQ0FMRVNfS0VZOiAnbG9jYWxlcycsXG4gIEFQSV9LRVk6ICdhcGknLFxuICBTSU1fTkFNRV9LRVk6ICdzaW1OYW1lJyxcbiAgVkVSU0lPTl9LRVk6ICd2ZXJzaW9uJyxcbiAgT1BUSU9OX0tFWTogJ29wdGlvbicsXG4gIEVNQUlMX0tFWTogJ2VtYWlsJyxcbiAgQlJBTkNIX0tFWTogJ2JyYW5jaCcsXG4gIFVTRVJfSURfS0VZOiAndXNlcklkJyxcbiAgVFJBTlNMQVRPUl9JRF9LRVk6ICd0cmFuc2xhdG9ySWQnLFxuICBBVVRIT1JJWkFUSU9OX0tFWTogJ2F1dGhvcml6YXRpb25Db2RlJyxcbiAgU0VSVkVSU19LRVk6ICdzZXJ2ZXJzJyxcbiAgQlJBTkRTX0tFWTogJ2JyYW5kcycsXG4gIFBST0RVQ1RJT05fU0VSVkVSOiAncHJvZHVjdGlvbicsXG4gIERFVl9TRVJWRVI6ICdkZXYnLFxuICBQSEVUX0JSQU5EOiAncGhldCcsXG4gIFBIRVRfSU9fQlJBTkQ6ICdwaGV0LWlvJyxcbiAgRU5HTElTSF9MT0NBTEU6ICdlbicsXG4gIFBFUkVOTklBTDogJy4nXG59OyJdLCJuYW1lcyI6WyJmcyIsInJlcXVpcmUiLCJnZXRCdWlsZFNlcnZlckNvbmZpZyIsIkJVSUxEX1NFUlZFUl9DT05GSUciLCJtb2R1bGUiLCJleHBvcnRzIiwiTElTVEVOX1BPUlQiLCJIVE1MX1NJTVNfRElSRUNUT1JZIiwiaHRtbFNpbXNEaXJlY3RvcnkiLCJQSEVUX0lPX1NJTVNfRElSRUNUT1JZIiwicGhldGlvU2ltc0RpcmVjdG9yeSIsIlJFUE9TX0tFWSIsIkRFUEVOREVOQ0lFU19LRVkiLCJMT0NBTEVTX0tFWSIsIkFQSV9LRVkiLCJTSU1fTkFNRV9LRVkiLCJWRVJTSU9OX0tFWSIsIk9QVElPTl9LRVkiLCJFTUFJTF9LRVkiLCJCUkFOQ0hfS0VZIiwiVVNFUl9JRF9LRVkiLCJUUkFOU0xBVE9SX0lEX0tFWSIsIkFVVEhPUklaQVRJT05fS0VZIiwiU0VSVkVSU19LRVkiLCJCUkFORFNfS0VZIiwiUFJPRFVDVElPTl9TRVJWRVIiLCJERVZfU0VSVkVSIiwiUEhFVF9CUkFORCIsIlBIRVRfSU9fQlJBTkQiLCJFTkdMSVNIX0xPQ0FMRSIsIlBFUkVOTklBTCJdLCJtYXBwaW5ncyI6IkFBQUEsaURBQWlEO0FBRWpEOzs7O0NBSUMsR0FHRCxNQUFNQSxLQUFLQyxRQUFTLGdCQUFpQixtREFBbUQ7QUFDeEYsTUFBTUMsdUJBQXVCRCxRQUFTO0FBRXRDLE1BQU1FLHNCQUFzQkQscUJBQXNCRjtBQUVsREksT0FBT0MsT0FBTyxHQUFHO0lBQ2ZGLHFCQUFxQkE7SUFDckJHLGFBQWE7SUFDYkMscUJBQXFCSixvQkFBb0JLLGlCQUFpQjtJQUMxREMsd0JBQXdCTixvQkFBb0JPLG1CQUFtQjtJQUMvREMsV0FBVztJQUNYQyxrQkFBa0I7SUFDbEJDLGFBQWE7SUFDYkMsU0FBUztJQUNUQyxjQUFjO0lBQ2RDLGFBQWE7SUFDYkMsWUFBWTtJQUNaQyxXQUFXO0lBQ1hDLFlBQVk7SUFDWkMsYUFBYTtJQUNiQyxtQkFBbUI7SUFDbkJDLG1CQUFtQjtJQUNuQkMsYUFBYTtJQUNiQyxZQUFZO0lBQ1pDLG1CQUFtQjtJQUNuQkMsWUFBWTtJQUNaQyxZQUFZO0lBQ1pDLGVBQWU7SUFDZkMsZ0JBQWdCO0lBQ2hCQyxXQUFXO0FBQ2IifQ==