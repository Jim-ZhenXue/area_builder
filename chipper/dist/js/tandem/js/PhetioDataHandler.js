// Copyright 2022-2024, University of Colorado Boulder
/**
 * Helper type that supports a `parameters` member.
 * This is mostly useful for PhET-iO instrumented sub-class to use that takes a variable number of parameters in their
 * IOType. With this function you gain parameter validation, PhET-iO documentation, and data stream support.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */ import axon from '../../axon/js/axon.js';
import validate from '../../axon/js/validate.js';
import Validation from '../../axon/js/Validation.js';
import assertMutuallyExclusiveOptions from '../../phet-core/js/assertMutuallyExclusiveOptions.js';
import optionize from '../../phet-core/js/optionize.js';
import PhetioObject from './PhetioObject.js';
import Tandem from './Tandem.js';
const VALIDATE_OPTIONS_FALSE = {
    validateValidator: false
};
// Simulations have thousands of Emitters, so we re-use objects where possible.
const EMPTY_ARRAY = [];
assert && Object.freeze(EMPTY_ARRAY);
// Allowed keys to options.parameters, the parameters to emit.
const PARAMETER_KEYS = [
    'name',
    'phetioType',
    'phetioDocumentation',
    // Specify this to keep the parameter private to the PhET-iO API. To support emitting and executing over the PhET-iO
    // API, phetioPrivate parameters must not ever be before a public one. For example `emit1( public1, private1, public2)`
    // is not allowed. Instead, it must be ordered like `emit( public1, public2, private1 )`
    'phetioPrivate'
].concat(Validation.VALIDATOR_KEYS);
// helper closures
const paramToPhetioType = (param)=>param.phetioType;
const paramToName = (param)=>param.name;
let PhetioDataHandler = class PhetioDataHandler extends PhetioObject {
    /**
   * @param parameters
   * @param tandemSupplied - proxy for whether the PhetioObject is instrumented.  We cannot call
   *                                 - PhetioObject.isPhetioInstrumented() until after the supercall, so we use this beforehand.
   */ static validateParameters(parameters, tandemSupplied) {
        // validate the parameters object
        validate(parameters, {
            valueType: Array
        });
        // PhetioDataHandler only supports phetioPrivate parameters at the end of the emit call, so once we hit the first phetioPrivate
        // parameter, then assert that the rest of them afterwards are as well.
        let reachedPhetioPrivate = false;
        // we must iterate from the first parameter to the last parameter to support phetioPrivate
        for(let i = 0; i < parameters.length; i++){
            const parameter = parameters[i]; // metadata about a single parameter
            assert && assert(Object.getPrototypeOf(parameter) === Object.prototype, 'Extra prototype on parameter object is a code smell');
            reachedPhetioPrivate = reachedPhetioPrivate || parameter.phetioPrivate;
            assert && reachedPhetioPrivate && assert(parameter.phetioPrivate, 'after first phetioPrivate parameter, all subsequent parameters must be phetioPrivate');
            assert && tandemSupplied && Tandem.VALIDATION && assert(parameter.phetioType || parameter.phetioPrivate, 'instrumented Emitters must include phetioType for each parameter or be marked as `phetioPrivate`.');
            assert && parameter.phetioType && assert(parameter.name, '`name` is a required parameter for phet-io instrumented parameters.');
            assert && assertMutuallyExclusiveOptions(parameter, [
                'phetioPrivate'
            ], [
                'name',
                'phetioType',
                'phetioDocumentation'
            ]);
            assert && assert(_.intersection(Object.keys(parameter), Validation.VALIDATOR_KEYS).length > 0, `validator must be specified for parameter ${i}`);
            for(const key in parameter){
                assert && assert(PARAMETER_KEYS.includes(key), `unrecognized parameter key: ${key}`);
            }
            // Changing after construction indicates a logic error.
            assert && Object.freeze(parameters[i]);
            // validate the options passed in to validate each PhetioDataHandler argument
            Validation.validateValidator(parameter);
        }
        // Changing after construction indicates a logic error.
        assert && Object.freeze(parameters);
    }
    /**
   * Validate that provided args match the expected schema given via options.parameters.
   */ validateArguments(...args) {
        assert && assert(args.length === this.parameters.length, `Emitted unexpected number of args. Expected: ${this.parameters.length} and received ${args.length}`);
        for(let i = 0; i < this.parameters.length; i++){
            const parameter = this.parameters[i];
            assert && validate(args[i], parameter, VALIDATE_OPTIONS_FALSE);
            // valueType overrides the phetioType validator so we don't use that one if there is a valueType
            if (parameter.phetioType && !parameter.valueType) {
                assert && validate(args[i], parameter.phetioType.validator, VALIDATE_OPTIONS_FALSE);
            }
        }
    }
    /**
   * Validate that provided args match the expected schema given via options.parameters.
   */ getValidationErrors(...args) {
        assert && assert(args.length === this.parameters.length, `Emitted unexpected number of args. Expected: ${this.parameters.length} and received ${args.length}`);
        return this.parameters.map((parameter, index)=>{
            return Validation.getValidationError(args[index], parameter, VALIDATE_OPTIONS_FALSE);
        });
    }
    /**
   * Gets the data that will be emitted to the PhET-iO data stream, for an instrumented simulation.
   * @returns the data, keys dependent on parameter metadata
   */ getPhetioData(...args) {
        assert && assert(Tandem.PHET_IO_ENABLED, 'should only get phet-io data in phet-io brand');
        // null if there are no arguments. dataStream.js omits null values for data
        let data = null;
        if (this.parameters.length > 0) {
            // Enumerate named argsObject for the data stream.
            data = {};
            for(let i = 0; i < this.parameters.length; i++){
                const element = this.parameters[i];
                if (!element.phetioPrivate) {
                    assert && assert(element.name, 'name required');
                    data[element.name] = element.phetioType.toStateObject(args[i]);
                }
            }
        }
        return data;
    }
    /**
   * Get the phetioDocumentation compiled from all the parameters
   */ static getPhetioDocumentation(currentPhetioDocumentation, parameters) {
        const paramToDocString = (param)=>{
            const docText = param.phetioDocumentation ? ` - ${param.phetioDocumentation}` : '';
            return `<li>${param.name}: ${param.phetioType.typeName}${docText}</li>`;
        };
        return currentPhetioDocumentation + (parameters.length === 0 ? '<br>No parameters.' : `${'<br>The parameters are:<br/>' + '<ol>'}${parameters.map(paramToDocString).join('<br/>')}</ol>`);
    }
    constructor(providedOptions){
        var _options_tandem;
        const options = optionize()({
            // SelfOptions
            parameters: EMPTY_ARRAY,
            hasListenerOrderDependencies: false,
            // phet-io - see PhetioObject.js for doc
            phetioPlayback: PhetioObject.DEFAULT_OPTIONS.phetioPlayback,
            phetioEventMetadata: PhetioObject.DEFAULT_OPTIONS.phetioEventMetadata,
            phetioDocumentation: ''
        }, providedOptions);
        assert && PhetioDataHandler.validateParameters(options.parameters, !!((_options_tandem = options.tandem) == null ? void 0 : _options_tandem.supplied));
        assert && assert(options.phetioType === undefined, 'PhetioDataHandler sets its own phetioType. Instead provide parameter phetioTypes through `options.parameters` with a phetioOuterType');
        // list of parameters, see options.parameters. Filter out phetioPrivate parameters, all `phetioPrivate`
        // parameters will not have a `phetioType`, see `validateParameters`.
        const phetioPublicParameters = options.parameters.filter(paramToPhetioType);
        options.phetioType = options.phetioOuterType(phetioPublicParameters.map(paramToPhetioType));
        // phetioPlayback events need to know the order the arguments occur in order to call EmitterIO.emit()
        // Indicate whether the event is for playback, but leave this "sparse"--only indicate when this happens to be true
        if (options.phetioPlayback) {
            options.phetioEventMetadata = options.phetioEventMetadata || {}; // phetioEventMetadata defaults to null
            assert && assert(!options.phetioEventMetadata.hasOwnProperty('dataKeys'), 'dataKeys should be supplied by PhetioDataHandler, not elsewhere');
            options.phetioEventMetadata.dataKeys = options.parameters.map(paramToName);
        }
        options.phetioDocumentation = PhetioDataHandler.getPhetioDocumentation(options.phetioDocumentation, phetioPublicParameters);
        super(options);
        // Note: one test indicates stripping this out via assert && in builds may save around 300kb heap
        this.parameters = options.parameters;
    }
};
axon.register('PhetioDataHandler', PhetioDataHandler);
export default PhetioDataHandler;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3RhbmRlbS9qcy9QaGV0aW9EYXRhSGFuZGxlci50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAyMi0yMDI0LCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuLyoqXG4gKiBIZWxwZXIgdHlwZSB0aGF0IHN1cHBvcnRzIGEgYHBhcmFtZXRlcnNgIG1lbWJlci5cbiAqIFRoaXMgaXMgbW9zdGx5IHVzZWZ1bCBmb3IgUGhFVC1pTyBpbnN0cnVtZW50ZWQgc3ViLWNsYXNzIHRvIHVzZSB0aGF0IHRha2VzIGEgdmFyaWFibGUgbnVtYmVyIG9mIHBhcmFtZXRlcnMgaW4gdGhlaXJcbiAqIElPVHlwZS4gV2l0aCB0aGlzIGZ1bmN0aW9uIHlvdSBnYWluIHBhcmFtZXRlciB2YWxpZGF0aW9uLCBQaEVULWlPIGRvY3VtZW50YXRpb24sIGFuZCBkYXRhIHN0cmVhbSBzdXBwb3J0LlxuICpcbiAqIEBhdXRob3IgU2FtIFJlaWQgKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXG4gKiBAYXV0aG9yIE1pY2hhZWwgS2F1em1hbm4gKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXG4gKi9cblxuaW1wb3J0IGF4b24gZnJvbSAnLi4vLi4vYXhvbi9qcy9heG9uLmpzJztcbmltcG9ydCB2YWxpZGF0ZSBmcm9tICcuLi8uLi9heG9uL2pzL3ZhbGlkYXRlLmpzJztcbmltcG9ydCBWYWxpZGF0aW9uLCB7IFZhbGlkYXRvciB9IGZyb20gJy4uLy4uL2F4b24vanMvVmFsaWRhdGlvbi5qcyc7XG5pbXBvcnQgYXNzZXJ0TXV0dWFsbHlFeGNsdXNpdmVPcHRpb25zIGZyb20gJy4uLy4uL3BoZXQtY29yZS9qcy9hc3NlcnRNdXR1YWxseUV4Y2x1c2l2ZU9wdGlvbnMuanMnO1xuaW1wb3J0IG9wdGlvbml6ZSBmcm9tICcuLi8uLi9waGV0LWNvcmUvanMvb3B0aW9uaXplLmpzJztcbmltcG9ydCBJbnRlbnRpb25hbEFueSBmcm9tICcuLi8uLi9waGV0LWNvcmUvanMvdHlwZXMvSW50ZW50aW9uYWxBbnkuanMnO1xuaW1wb3J0IFN0cmljdE9taXQgZnJvbSAnLi4vLi4vcGhldC1jb3JlL2pzL3R5cGVzL1N0cmljdE9taXQuanMnO1xuaW1wb3J0IFBoZXRpb09iamVjdCwgeyBQaGV0aW9PYmplY3RPcHRpb25zIH0gZnJvbSAnLi9QaGV0aW9PYmplY3QuanMnO1xuaW1wb3J0IFRhbmRlbSBmcm9tICcuL1RhbmRlbS5qcyc7XG5pbXBvcnQgSU9UeXBlIGZyb20gJy4vdHlwZXMvSU9UeXBlLmpzJztcblxuY29uc3QgVkFMSURBVEVfT1BUSU9OU19GQUxTRSA9IHsgdmFsaWRhdGVWYWxpZGF0b3I6IGZhbHNlIH07XG5cbmV4cG9ydCB0eXBlIFBhcmFtZXRlciA9IHtcbiAgbmFtZT86IHN0cmluZztcbiAgcGhldGlvRG9jdW1lbnRhdGlvbj86IHN0cmluZztcbiAgcGhldGlvUHJpdmF0ZT86IGJvb2xlYW47XG59ICYgVmFsaWRhdG9yO1xuXG4vLyBTaW11bGF0aW9ucyBoYXZlIHRob3VzYW5kcyBvZiBFbWl0dGVycywgc28gd2UgcmUtdXNlIG9iamVjdHMgd2hlcmUgcG9zc2libGUuXG5jb25zdCBFTVBUWV9BUlJBWTogUGFyYW1ldGVyW10gPSBbXTtcbmFzc2VydCAmJiBPYmplY3QuZnJlZXplKCBFTVBUWV9BUlJBWSApO1xuXG4vLyBBbGxvd2VkIGtleXMgdG8gb3B0aW9ucy5wYXJhbWV0ZXJzLCB0aGUgcGFyYW1ldGVycyB0byBlbWl0LlxuY29uc3QgUEFSQU1FVEVSX0tFWVMgPSBbXG4gICduYW1lJywgLy8gcmVxdWlyZWQgZm9yIHBoZXQtaW8gaW5zdHJ1bWVudGVkIEFjdGlvbnNcbiAgJ3BoZXRpb1R5cGUnLCAvLyByZXF1aXJlZCBmb3IgcGhldC1pbyBpbnN0cnVtZW50ZWQgQWN0aW9uc1xuICAncGhldGlvRG9jdW1lbnRhdGlvbicsIC8vIG9wdGlvbmFsLCBhZGRpdGlvbmFsIGRvY3VtZW50YXRpb24gZm9yIHRoaXMgc3BlY2lmaWMgcGFyYW1ldGVyXG5cbiAgLy8gU3BlY2lmeSB0aGlzIHRvIGtlZXAgdGhlIHBhcmFtZXRlciBwcml2YXRlIHRvIHRoZSBQaEVULWlPIEFQSS4gVG8gc3VwcG9ydCBlbWl0dGluZyBhbmQgZXhlY3V0aW5nIG92ZXIgdGhlIFBoRVQtaU9cbiAgLy8gQVBJLCBwaGV0aW9Qcml2YXRlIHBhcmFtZXRlcnMgbXVzdCBub3QgZXZlciBiZSBiZWZvcmUgYSBwdWJsaWMgb25lLiBGb3IgZXhhbXBsZSBgZW1pdDEoIHB1YmxpYzEsIHByaXZhdGUxLCBwdWJsaWMyKWBcbiAgLy8gaXMgbm90IGFsbG93ZWQuIEluc3RlYWQsIGl0IG11c3QgYmUgb3JkZXJlZCBsaWtlIGBlbWl0KCBwdWJsaWMxLCBwdWJsaWMyLCBwcml2YXRlMSApYFxuICAncGhldGlvUHJpdmF0ZSdcblxuXS5jb25jYXQoIFZhbGlkYXRpb24uVkFMSURBVE9SX0tFWVMgKTtcblxuLy8gaGVscGVyIGNsb3N1cmVzXG5jb25zdCBwYXJhbVRvUGhldGlvVHlwZSA9ICggcGFyYW06IFBhcmFtZXRlciApID0+IHBhcmFtLnBoZXRpb1R5cGUhO1xuY29uc3QgcGFyYW1Ub05hbWUgPSAoIHBhcmFtOiBQYXJhbWV0ZXIgKSA9PiBwYXJhbS5uYW1lITtcblxudHlwZSBTZWxmT3B0aW9ucyA9IHtcblxuICAvLyBUaGUgcGFyYW1ldGVycyB0byB0aGUgZW1pdCBtZXRob2QgdGhhdCB3aWxsIGJlIGNhbGxlZC5cbiAgLy8gU2VlIFBBUkFNRVRFUl9LRVlTIGZvciBhIGxpc3Qgb2YgbGVnYWwga2V5cywgdGhlaXIgdHlwZXMsIGFuZCBkb2N1bWVudGF0aW9uLlxuICBwYXJhbWV0ZXJzPzogUGFyYW1ldGVyW107XG4gIHBoZXRpb091dGVyVHlwZTogKCB0OiBJT1R5cGVbXSApID0+IElPVHlwZTtcbiAgaGFzTGlzdGVuZXJPcmRlckRlcGVuZGVuY2llcz86IGJvb2xlYW47XG59O1xuXG4vLyBVc2UgZWFjaCBzdWJ0eXBlIHNob3VsZCBwcm92aWRlIGl0cyBvd24gcGhldGlvT3V0ZXJUeXBlLiBUaGF0IGNvdXBsZWQgd2l0aCBwYXJhbWV0ZXIgSU9UeXBlcyB3aWxsIHJlc3VsdCBpbiB0aGVcbi8vIHBoZXRpb1R5cGUuIERvbid0IHBhc3MgdGhpcyBpbiFcbmV4cG9ydCB0eXBlIFBoZXRpb0RhdGFIYW5kbGVyT3B0aW9ucyA9IFNlbGZPcHRpb25zICYgU3RyaWN0T21pdDxQaGV0aW9PYmplY3RPcHRpb25zLCAncGhldGlvVHlwZSc+O1xuXG5jbGFzcyBQaGV0aW9EYXRhSGFuZGxlcjxUIGV4dGVuZHMgSW50ZW50aW9uYWxBbnlbXSA9IFtdPiBleHRlbmRzIFBoZXRpb09iamVjdCB7XG5cbiAgcHJpdmF0ZSByZWFkb25seSBwYXJhbWV0ZXJzOiBQYXJhbWV0ZXJbXTtcblxuICBwdWJsaWMgY29uc3RydWN0b3IoIHByb3ZpZGVkT3B0aW9ucz86IFBoZXRpb0RhdGFIYW5kbGVyT3B0aW9ucyApIHtcbiAgICBjb25zdCBvcHRpb25zID0gb3B0aW9uaXplPFBoZXRpb0RhdGFIYW5kbGVyT3B0aW9ucywgU2VsZk9wdGlvbnMsIFBoZXRpb09iamVjdE9wdGlvbnM+KCkoIHtcblxuICAgICAgLy8gU2VsZk9wdGlvbnNcbiAgICAgIHBhcmFtZXRlcnM6IEVNUFRZX0FSUkFZLFxuICAgICAgaGFzTGlzdGVuZXJPcmRlckRlcGVuZGVuY2llczogZmFsc2UsXG5cbiAgICAgIC8vIHBoZXQtaW8gLSBzZWUgUGhldGlvT2JqZWN0LmpzIGZvciBkb2NcbiAgICAgIHBoZXRpb1BsYXliYWNrOiBQaGV0aW9PYmplY3QuREVGQVVMVF9PUFRJT05TLnBoZXRpb1BsYXliYWNrLFxuICAgICAgcGhldGlvRXZlbnRNZXRhZGF0YTogUGhldGlvT2JqZWN0LkRFRkFVTFRfT1BUSU9OUy5waGV0aW9FdmVudE1ldGFkYXRhLFxuICAgICAgcGhldGlvRG9jdW1lbnRhdGlvbjogJydcbiAgICB9LCBwcm92aWRlZE9wdGlvbnMgKTtcblxuICAgIGFzc2VydCAmJiBQaGV0aW9EYXRhSGFuZGxlci52YWxpZGF0ZVBhcmFtZXRlcnMoIG9wdGlvbnMucGFyYW1ldGVycywgISFvcHRpb25zLnRhbmRlbT8uc3VwcGxpZWQgKTtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBvcHRpb25zLnBoZXRpb1R5cGUgPT09IHVuZGVmaW5lZCxcbiAgICAgICdQaGV0aW9EYXRhSGFuZGxlciBzZXRzIGl0cyBvd24gcGhldGlvVHlwZS4gSW5zdGVhZCBwcm92aWRlIHBhcmFtZXRlciBwaGV0aW9UeXBlcyB0aHJvdWdoIGBvcHRpb25zLnBhcmFtZXRlcnNgIHdpdGggYSBwaGV0aW9PdXRlclR5cGUnICk7XG5cbiAgICAvLyBsaXN0IG9mIHBhcmFtZXRlcnMsIHNlZSBvcHRpb25zLnBhcmFtZXRlcnMuIEZpbHRlciBvdXQgcGhldGlvUHJpdmF0ZSBwYXJhbWV0ZXJzLCBhbGwgYHBoZXRpb1ByaXZhdGVgXG4gICAgLy8gcGFyYW1ldGVycyB3aWxsIG5vdCBoYXZlIGEgYHBoZXRpb1R5cGVgLCBzZWUgYHZhbGlkYXRlUGFyYW1ldGVyc2AuXG4gICAgY29uc3QgcGhldGlvUHVibGljUGFyYW1ldGVycyA9IG9wdGlvbnMucGFyYW1ldGVycy5maWx0ZXIoIHBhcmFtVG9QaGV0aW9UeXBlICk7XG5cbiAgICBvcHRpb25zLnBoZXRpb1R5cGUgPSBvcHRpb25zLnBoZXRpb091dGVyVHlwZSggcGhldGlvUHVibGljUGFyYW1ldGVycy5tYXAoIHBhcmFtVG9QaGV0aW9UeXBlICkgKTtcblxuICAgIC8vIHBoZXRpb1BsYXliYWNrIGV2ZW50cyBuZWVkIHRvIGtub3cgdGhlIG9yZGVyIHRoZSBhcmd1bWVudHMgb2NjdXIgaW4gb3JkZXIgdG8gY2FsbCBFbWl0dGVySU8uZW1pdCgpXG4gICAgLy8gSW5kaWNhdGUgd2hldGhlciB0aGUgZXZlbnQgaXMgZm9yIHBsYXliYWNrLCBidXQgbGVhdmUgdGhpcyBcInNwYXJzZVwiLS1vbmx5IGluZGljYXRlIHdoZW4gdGhpcyBoYXBwZW5zIHRvIGJlIHRydWVcbiAgICBpZiAoIG9wdGlvbnMucGhldGlvUGxheWJhY2sgKSB7XG4gICAgICBvcHRpb25zLnBoZXRpb0V2ZW50TWV0YWRhdGEgPSBvcHRpb25zLnBoZXRpb0V2ZW50TWV0YWRhdGEgfHwge307IC8vIHBoZXRpb0V2ZW50TWV0YWRhdGEgZGVmYXVsdHMgdG8gbnVsbFxuXG4gICAgICBhc3NlcnQgJiYgYXNzZXJ0KCAhb3B0aW9ucy5waGV0aW9FdmVudE1ldGFkYXRhLmhhc093blByb3BlcnR5KCAnZGF0YUtleXMnICksXG4gICAgICAgICdkYXRhS2V5cyBzaG91bGQgYmUgc3VwcGxpZWQgYnkgUGhldGlvRGF0YUhhbmRsZXIsIG5vdCBlbHNld2hlcmUnICk7XG5cbiAgICAgIG9wdGlvbnMucGhldGlvRXZlbnRNZXRhZGF0YS5kYXRhS2V5cyA9IG9wdGlvbnMucGFyYW1ldGVycy5tYXAoIHBhcmFtVG9OYW1lICk7XG4gICAgfVxuICAgIG9wdGlvbnMucGhldGlvRG9jdW1lbnRhdGlvbiA9IFBoZXRpb0RhdGFIYW5kbGVyLmdldFBoZXRpb0RvY3VtZW50YXRpb24oIG9wdGlvbnMucGhldGlvRG9jdW1lbnRhdGlvbiwgcGhldGlvUHVibGljUGFyYW1ldGVycyApO1xuXG4gICAgc3VwZXIoIG9wdGlvbnMgKTtcblxuICAgIC8vIE5vdGU6IG9uZSB0ZXN0IGluZGljYXRlcyBzdHJpcHBpbmcgdGhpcyBvdXQgdmlhIGFzc2VydCAmJiBpbiBidWlsZHMgbWF5IHNhdmUgYXJvdW5kIDMwMGtiIGhlYXBcbiAgICB0aGlzLnBhcmFtZXRlcnMgPSBvcHRpb25zLnBhcmFtZXRlcnM7XG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHBhcmFtZXRlcnNcbiAgICogQHBhcmFtIHRhbmRlbVN1cHBsaWVkIC0gcHJveHkgZm9yIHdoZXRoZXIgdGhlIFBoZXRpb09iamVjdCBpcyBpbnN0cnVtZW50ZWQuICBXZSBjYW5ub3QgY2FsbFxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC0gUGhldGlvT2JqZWN0LmlzUGhldGlvSW5zdHJ1bWVudGVkKCkgdW50aWwgYWZ0ZXIgdGhlIHN1cGVyY2FsbCwgc28gd2UgdXNlIHRoaXMgYmVmb3JlaGFuZC5cbiAgICovXG4gIHByaXZhdGUgc3RhdGljIHZhbGlkYXRlUGFyYW1ldGVycyggcGFyYW1ldGVyczogUGFyYW1ldGVyW10sIHRhbmRlbVN1cHBsaWVkOiBib29sZWFuICk6IHZvaWQge1xuXG4gICAgLy8gdmFsaWRhdGUgdGhlIHBhcmFtZXRlcnMgb2JqZWN0XG4gICAgdmFsaWRhdGUoIHBhcmFtZXRlcnMsIHsgdmFsdWVUeXBlOiBBcnJheSB9ICk7XG5cbiAgICAvLyBQaGV0aW9EYXRhSGFuZGxlciBvbmx5IHN1cHBvcnRzIHBoZXRpb1ByaXZhdGUgcGFyYW1ldGVycyBhdCB0aGUgZW5kIG9mIHRoZSBlbWl0IGNhbGwsIHNvIG9uY2Ugd2UgaGl0IHRoZSBmaXJzdCBwaGV0aW9Qcml2YXRlXG4gICAgLy8gcGFyYW1ldGVyLCB0aGVuIGFzc2VydCB0aGF0IHRoZSByZXN0IG9mIHRoZW0gYWZ0ZXJ3YXJkcyBhcmUgYXMgd2VsbC5cbiAgICBsZXQgcmVhY2hlZFBoZXRpb1ByaXZhdGUgPSBmYWxzZTtcblxuICAgIC8vIHdlIG11c3QgaXRlcmF0ZSBmcm9tIHRoZSBmaXJzdCBwYXJhbWV0ZXIgdG8gdGhlIGxhc3QgcGFyYW1ldGVyIHRvIHN1cHBvcnQgcGhldGlvUHJpdmF0ZVxuICAgIGZvciAoIGxldCBpID0gMDsgaSA8IHBhcmFtZXRlcnMubGVuZ3RoOyBpKysgKSB7XG4gICAgICBjb25zdCBwYXJhbWV0ZXIgPSBwYXJhbWV0ZXJzWyBpIF07IC8vIG1ldGFkYXRhIGFib3V0IGEgc2luZ2xlIHBhcmFtZXRlclxuXG4gICAgICBhc3NlcnQgJiYgYXNzZXJ0KCBPYmplY3QuZ2V0UHJvdG90eXBlT2YoIHBhcmFtZXRlciApID09PSBPYmplY3QucHJvdG90eXBlLFxuICAgICAgICAnRXh0cmEgcHJvdG90eXBlIG9uIHBhcmFtZXRlciBvYmplY3QgaXMgYSBjb2RlIHNtZWxsJyApO1xuXG4gICAgICByZWFjaGVkUGhldGlvUHJpdmF0ZSA9IHJlYWNoZWRQaGV0aW9Qcml2YXRlIHx8IHBhcmFtZXRlci5waGV0aW9Qcml2YXRlITtcbiAgICAgIGFzc2VydCAmJiByZWFjaGVkUGhldGlvUHJpdmF0ZSAmJiBhc3NlcnQoIHBhcmFtZXRlci5waGV0aW9Qcml2YXRlLFxuICAgICAgICAnYWZ0ZXIgZmlyc3QgcGhldGlvUHJpdmF0ZSBwYXJhbWV0ZXIsIGFsbCBzdWJzZXF1ZW50IHBhcmFtZXRlcnMgbXVzdCBiZSBwaGV0aW9Qcml2YXRlJyApO1xuXG4gICAgICBhc3NlcnQgJiYgdGFuZGVtU3VwcGxpZWQgJiYgVGFuZGVtLlZBTElEQVRJT04gJiYgYXNzZXJ0KCBwYXJhbWV0ZXIucGhldGlvVHlwZSB8fCBwYXJhbWV0ZXIucGhldGlvUHJpdmF0ZSxcbiAgICAgICAgJ2luc3RydW1lbnRlZCBFbWl0dGVycyBtdXN0IGluY2x1ZGUgcGhldGlvVHlwZSBmb3IgZWFjaCBwYXJhbWV0ZXIgb3IgYmUgbWFya2VkIGFzIGBwaGV0aW9Qcml2YXRlYC4nICk7XG4gICAgICBhc3NlcnQgJiYgcGFyYW1ldGVyLnBoZXRpb1R5cGUgJiYgYXNzZXJ0KCBwYXJhbWV0ZXIubmFtZSxcbiAgICAgICAgJ2BuYW1lYCBpcyBhIHJlcXVpcmVkIHBhcmFtZXRlciBmb3IgcGhldC1pbyBpbnN0cnVtZW50ZWQgcGFyYW1ldGVycy4nICk7XG4gICAgICBhc3NlcnQgJiYgYXNzZXJ0TXV0dWFsbHlFeGNsdXNpdmVPcHRpb25zKCBwYXJhbWV0ZXIsIFsgJ3BoZXRpb1ByaXZhdGUnIF0sIFtcbiAgICAgICAgJ25hbWUnLCAncGhldGlvVHlwZScsICdwaGV0aW9Eb2N1bWVudGF0aW9uJ1xuICAgICAgXSApO1xuXG4gICAgICBhc3NlcnQgJiYgYXNzZXJ0KCBfLmludGVyc2VjdGlvbiggT2JqZWN0LmtleXMoIHBhcmFtZXRlciApLCBWYWxpZGF0aW9uLlZBTElEQVRPUl9LRVlTICkubGVuZ3RoID4gMCxcbiAgICAgICAgYHZhbGlkYXRvciBtdXN0IGJlIHNwZWNpZmllZCBmb3IgcGFyYW1ldGVyICR7aX1gICk7XG5cbiAgICAgIGZvciAoIGNvbnN0IGtleSBpbiBwYXJhbWV0ZXIgKSB7XG4gICAgICAgIGFzc2VydCAmJiBhc3NlcnQoIFBBUkFNRVRFUl9LRVlTLmluY2x1ZGVzKCBrZXkgKSwgYHVucmVjb2duaXplZCBwYXJhbWV0ZXIga2V5OiAke2tleX1gICk7XG4gICAgICB9XG5cbiAgICAgIC8vIENoYW5naW5nIGFmdGVyIGNvbnN0cnVjdGlvbiBpbmRpY2F0ZXMgYSBsb2dpYyBlcnJvci5cbiAgICAgIGFzc2VydCAmJiBPYmplY3QuZnJlZXplKCBwYXJhbWV0ZXJzWyBpIF0gKTtcblxuICAgICAgLy8gdmFsaWRhdGUgdGhlIG9wdGlvbnMgcGFzc2VkIGluIHRvIHZhbGlkYXRlIGVhY2ggUGhldGlvRGF0YUhhbmRsZXIgYXJndW1lbnRcbiAgICAgIFZhbGlkYXRpb24udmFsaWRhdGVWYWxpZGF0b3IoIHBhcmFtZXRlciApO1xuICAgIH1cblxuICAgIC8vIENoYW5naW5nIGFmdGVyIGNvbnN0cnVjdGlvbiBpbmRpY2F0ZXMgYSBsb2dpYyBlcnJvci5cbiAgICBhc3NlcnQgJiYgT2JqZWN0LmZyZWV6ZSggcGFyYW1ldGVycyApO1xuICB9XG5cbiAgLyoqXG4gICAqIFZhbGlkYXRlIHRoYXQgcHJvdmlkZWQgYXJncyBtYXRjaCB0aGUgZXhwZWN0ZWQgc2NoZW1hIGdpdmVuIHZpYSBvcHRpb25zLnBhcmFtZXRlcnMuXG4gICAqL1xuICBwcm90ZWN0ZWQgdmFsaWRhdGVBcmd1bWVudHMoIC4uLmFyZ3M6IFQgKTogdm9pZCB7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggYXJncy5sZW5ndGggPT09IHRoaXMucGFyYW1ldGVycy5sZW5ndGgsXG4gICAgICBgRW1pdHRlZCB1bmV4cGVjdGVkIG51bWJlciBvZiBhcmdzLiBFeHBlY3RlZDogJHt0aGlzLnBhcmFtZXRlcnMubGVuZ3RofSBhbmQgcmVjZWl2ZWQgJHthcmdzLmxlbmd0aH1gXG4gICAgKTtcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCB0aGlzLnBhcmFtZXRlcnMubGVuZ3RoOyBpKysgKSB7XG4gICAgICBjb25zdCBwYXJhbWV0ZXIgPSB0aGlzLnBhcmFtZXRlcnNbIGkgXTtcbiAgICAgIGFzc2VydCAmJiB2YWxpZGF0ZSggYXJnc1sgaSBdLCBwYXJhbWV0ZXIsIFZBTElEQVRFX09QVElPTlNfRkFMU0UgKTtcblxuICAgICAgLy8gdmFsdWVUeXBlIG92ZXJyaWRlcyB0aGUgcGhldGlvVHlwZSB2YWxpZGF0b3Igc28gd2UgZG9uJ3QgdXNlIHRoYXQgb25lIGlmIHRoZXJlIGlzIGEgdmFsdWVUeXBlXG4gICAgICBpZiAoIHBhcmFtZXRlci5waGV0aW9UeXBlICYmICFwYXJhbWV0ZXIudmFsdWVUeXBlICkge1xuICAgICAgICBhc3NlcnQgJiYgdmFsaWRhdGUoIGFyZ3NbIGkgXSwgcGFyYW1ldGVyLnBoZXRpb1R5cGUudmFsaWRhdG9yLCBWQUxJREFURV9PUFRJT05TX0ZBTFNFICk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFZhbGlkYXRlIHRoYXQgcHJvdmlkZWQgYXJncyBtYXRjaCB0aGUgZXhwZWN0ZWQgc2NoZW1hIGdpdmVuIHZpYSBvcHRpb25zLnBhcmFtZXRlcnMuXG4gICAqL1xuICBwdWJsaWMgZ2V0VmFsaWRhdGlvbkVycm9ycyggLi4uYXJnczogVCApOiBBcnJheTxzdHJpbmcgfCBudWxsPiB7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggYXJncy5sZW5ndGggPT09IHRoaXMucGFyYW1ldGVycy5sZW5ndGgsXG4gICAgICBgRW1pdHRlZCB1bmV4cGVjdGVkIG51bWJlciBvZiBhcmdzLiBFeHBlY3RlZDogJHt0aGlzLnBhcmFtZXRlcnMubGVuZ3RofSBhbmQgcmVjZWl2ZWQgJHthcmdzLmxlbmd0aH1gXG4gICAgKTtcbiAgICByZXR1cm4gdGhpcy5wYXJhbWV0ZXJzLm1hcCggKCBwYXJhbWV0ZXIsIGluZGV4ICkgPT4ge1xuICAgICAgcmV0dXJuIFZhbGlkYXRpb24uZ2V0VmFsaWRhdGlvbkVycm9yKCBhcmdzWyBpbmRleCBdLCBwYXJhbWV0ZXIsIFZBTElEQVRFX09QVElPTlNfRkFMU0UgKTtcbiAgICB9ICk7XG4gIH1cblxuICAvKipcbiAgICogR2V0cyB0aGUgZGF0YSB0aGF0IHdpbGwgYmUgZW1pdHRlZCB0byB0aGUgUGhFVC1pTyBkYXRhIHN0cmVhbSwgZm9yIGFuIGluc3RydW1lbnRlZCBzaW11bGF0aW9uLlxuICAgKiBAcmV0dXJucyB0aGUgZGF0YSwga2V5cyBkZXBlbmRlbnQgb24gcGFyYW1ldGVyIG1ldGFkYXRhXG4gICAqL1xuICBwdWJsaWMgZ2V0UGhldGlvRGF0YSggLi4uYXJnczogVCApOiBudWxsIHwgUmVjb3JkPHN0cmluZywgdW5rbm93bj4ge1xuXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggVGFuZGVtLlBIRVRfSU9fRU5BQkxFRCwgJ3Nob3VsZCBvbmx5IGdldCBwaGV0LWlvIGRhdGEgaW4gcGhldC1pbyBicmFuZCcgKTtcblxuICAgIC8vIG51bGwgaWYgdGhlcmUgYXJlIG5vIGFyZ3VtZW50cy4gZGF0YVN0cmVhbS5qcyBvbWl0cyBudWxsIHZhbHVlcyBmb3IgZGF0YVxuICAgIGxldCBkYXRhOiBSZWNvcmQ8c3RyaW5nLCBvYmplY3Q+IHwgbnVsbCA9IG51bGw7XG4gICAgaWYgKCB0aGlzLnBhcmFtZXRlcnMubGVuZ3RoID4gMCApIHtcblxuICAgICAgLy8gRW51bWVyYXRlIG5hbWVkIGFyZ3NPYmplY3QgZm9yIHRoZSBkYXRhIHN0cmVhbS5cbiAgICAgIGRhdGEgPSB7fTtcbiAgICAgIGZvciAoIGxldCBpID0gMDsgaSA8IHRoaXMucGFyYW1ldGVycy5sZW5ndGg7IGkrKyApIHtcbiAgICAgICAgY29uc3QgZWxlbWVudCA9IHRoaXMucGFyYW1ldGVyc1sgaSBdO1xuICAgICAgICBpZiAoICFlbGVtZW50LnBoZXRpb1ByaXZhdGUgKSB7XG4gICAgICAgICAgYXNzZXJ0ICYmIGFzc2VydCggZWxlbWVudC5uYW1lLCAnbmFtZSByZXF1aXJlZCcgKTtcbiAgICAgICAgICBkYXRhWyBlbGVtZW50Lm5hbWUhIF0gPSBlbGVtZW50LnBoZXRpb1R5cGUhLnRvU3RhdGVPYmplY3QoIGFyZ3NbIGkgXSApO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBkYXRhO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldCB0aGUgcGhldGlvRG9jdW1lbnRhdGlvbiBjb21waWxlZCBmcm9tIGFsbCB0aGUgcGFyYW1ldGVyc1xuICAgKi9cbiAgcHJpdmF0ZSBzdGF0aWMgZ2V0UGhldGlvRG9jdW1lbnRhdGlvbiggY3VycmVudFBoZXRpb0RvY3VtZW50YXRpb246IHN0cmluZywgcGFyYW1ldGVyczogUGFyYW1ldGVyW10gKTogc3RyaW5nIHtcbiAgICBjb25zdCBwYXJhbVRvRG9jU3RyaW5nID0gKCBwYXJhbTogUGFyYW1ldGVyICkgPT4ge1xuXG4gICAgICBjb25zdCBkb2NUZXh0ID0gcGFyYW0ucGhldGlvRG9jdW1lbnRhdGlvbiA/IGAgLSAke3BhcmFtLnBoZXRpb0RvY3VtZW50YXRpb259YCA6ICcnO1xuXG4gICAgICByZXR1cm4gYDxsaT4ke3BhcmFtLm5hbWV9OiAke3BhcmFtLnBoZXRpb1R5cGUhLnR5cGVOYW1lfSR7ZG9jVGV4dH08L2xpPmA7XG4gICAgfTtcblxuICAgIHJldHVybiBjdXJyZW50UGhldGlvRG9jdW1lbnRhdGlvbiArICggcGFyYW1ldGVycy5sZW5ndGggPT09IDAgPyAnPGJyPk5vIHBhcmFtZXRlcnMuJyA6IGAkeyc8YnI+VGhlIHBhcmFtZXRlcnMgYXJlOjxici8+JyArXG4gICAgICAgICAgICc8b2w+J30ke3BhcmFtZXRlcnMubWFwKCBwYXJhbVRvRG9jU3RyaW5nICkuam9pbiggJzxici8+JyApfTwvb2w+YCApO1xuICB9XG59XG5cbmF4b24ucmVnaXN0ZXIoICdQaGV0aW9EYXRhSGFuZGxlcicsIFBoZXRpb0RhdGFIYW5kbGVyICk7XG5leHBvcnQgZGVmYXVsdCBQaGV0aW9EYXRhSGFuZGxlcjsiXSwibmFtZXMiOlsiYXhvbiIsInZhbGlkYXRlIiwiVmFsaWRhdGlvbiIsImFzc2VydE11dHVhbGx5RXhjbHVzaXZlT3B0aW9ucyIsIm9wdGlvbml6ZSIsIlBoZXRpb09iamVjdCIsIlRhbmRlbSIsIlZBTElEQVRFX09QVElPTlNfRkFMU0UiLCJ2YWxpZGF0ZVZhbGlkYXRvciIsIkVNUFRZX0FSUkFZIiwiYXNzZXJ0IiwiT2JqZWN0IiwiZnJlZXplIiwiUEFSQU1FVEVSX0tFWVMiLCJjb25jYXQiLCJWQUxJREFUT1JfS0VZUyIsInBhcmFtVG9QaGV0aW9UeXBlIiwicGFyYW0iLCJwaGV0aW9UeXBlIiwicGFyYW1Ub05hbWUiLCJuYW1lIiwiUGhldGlvRGF0YUhhbmRsZXIiLCJ2YWxpZGF0ZVBhcmFtZXRlcnMiLCJwYXJhbWV0ZXJzIiwidGFuZGVtU3VwcGxpZWQiLCJ2YWx1ZVR5cGUiLCJBcnJheSIsInJlYWNoZWRQaGV0aW9Qcml2YXRlIiwiaSIsImxlbmd0aCIsInBhcmFtZXRlciIsImdldFByb3RvdHlwZU9mIiwicHJvdG90eXBlIiwicGhldGlvUHJpdmF0ZSIsIlZBTElEQVRJT04iLCJfIiwiaW50ZXJzZWN0aW9uIiwia2V5cyIsImtleSIsImluY2x1ZGVzIiwidmFsaWRhdGVBcmd1bWVudHMiLCJhcmdzIiwidmFsaWRhdG9yIiwiZ2V0VmFsaWRhdGlvbkVycm9ycyIsIm1hcCIsImluZGV4IiwiZ2V0VmFsaWRhdGlvbkVycm9yIiwiZ2V0UGhldGlvRGF0YSIsIlBIRVRfSU9fRU5BQkxFRCIsImRhdGEiLCJlbGVtZW50IiwidG9TdGF0ZU9iamVjdCIsImdldFBoZXRpb0RvY3VtZW50YXRpb24iLCJjdXJyZW50UGhldGlvRG9jdW1lbnRhdGlvbiIsInBhcmFtVG9Eb2NTdHJpbmciLCJkb2NUZXh0IiwicGhldGlvRG9jdW1lbnRhdGlvbiIsInR5cGVOYW1lIiwiam9pbiIsInByb3ZpZGVkT3B0aW9ucyIsIm9wdGlvbnMiLCJoYXNMaXN0ZW5lck9yZGVyRGVwZW5kZW5jaWVzIiwicGhldGlvUGxheWJhY2siLCJERUZBVUxUX09QVElPTlMiLCJwaGV0aW9FdmVudE1ldGFkYXRhIiwidGFuZGVtIiwic3VwcGxpZWQiLCJ1bmRlZmluZWQiLCJwaGV0aW9QdWJsaWNQYXJhbWV0ZXJzIiwiZmlsdGVyIiwicGhldGlvT3V0ZXJUeXBlIiwiaGFzT3duUHJvcGVydHkiLCJkYXRhS2V5cyIsInJlZ2lzdGVyIl0sIm1hcHBpbmdzIjoiQUFBQSxzREFBc0Q7QUFFdEQ7Ozs7Ozs7Q0FPQyxHQUVELE9BQU9BLFVBQVUsd0JBQXdCO0FBQ3pDLE9BQU9DLGNBQWMsNEJBQTRCO0FBQ2pELE9BQU9DLGdCQUErQiw4QkFBOEI7QUFDcEUsT0FBT0Msb0NBQW9DLHVEQUF1RDtBQUNsRyxPQUFPQyxlQUFlLGtDQUFrQztBQUd4RCxPQUFPQyxrQkFBMkMsb0JBQW9CO0FBQ3RFLE9BQU9DLFlBQVksY0FBYztBQUdqQyxNQUFNQyx5QkFBeUI7SUFBRUMsbUJBQW1CO0FBQU07QUFRMUQsK0VBQStFO0FBQy9FLE1BQU1DLGNBQTJCLEVBQUU7QUFDbkNDLFVBQVVDLE9BQU9DLE1BQU0sQ0FBRUg7QUFFekIsOERBQThEO0FBQzlELE1BQU1JLGlCQUFpQjtJQUNyQjtJQUNBO0lBQ0E7SUFFQSxvSEFBb0g7SUFDcEgsdUhBQXVIO0lBQ3ZILHdGQUF3RjtJQUN4RjtDQUVELENBQUNDLE1BQU0sQ0FBRVosV0FBV2EsY0FBYztBQUVuQyxrQkFBa0I7QUFDbEIsTUFBTUMsb0JBQW9CLENBQUVDLFFBQXNCQSxNQUFNQyxVQUFVO0FBQ2xFLE1BQU1DLGNBQWMsQ0FBRUYsUUFBc0JBLE1BQU1HLElBQUk7QUFldEQsSUFBQSxBQUFNQyxvQkFBTixNQUFNQSwwQkFBMkRoQjtJQTZDL0Q7Ozs7R0FJQyxHQUNELE9BQWVpQixtQkFBb0JDLFVBQXVCLEVBQUVDLGNBQXVCLEVBQVM7UUFFMUYsaUNBQWlDO1FBQ2pDdkIsU0FBVXNCLFlBQVk7WUFBRUUsV0FBV0M7UUFBTTtRQUV6QywrSEFBK0g7UUFDL0gsdUVBQXVFO1FBQ3ZFLElBQUlDLHVCQUF1QjtRQUUzQiwwRkFBMEY7UUFDMUYs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