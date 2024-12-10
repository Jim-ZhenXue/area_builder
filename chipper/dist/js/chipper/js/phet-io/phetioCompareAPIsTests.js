// Copyright 2021-2024, University of Colorado Boulder
/**
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */ import _ from 'lodash';
import qunit from '../../../perennial-alias/js/npm-dependencies/qunit.js';
import phetioCompareAPIs from '../browser-and-node/phetioCompareAPIs.js';
qunit.module('phetioCompareAPIs');
const _phetioCompareAPIs = (referenceAPI, proposedAPI, options)=>{
    return phetioCompareAPIs(referenceAPI, proposedAPI, _, options);
};
// To cover the boilerplate that will be largely copied around otherwise.
const DEFAULT_API = {
    phetioElements: {},
    phetioFullAPI: true,
    phetioTypes: {
        ObjectIO: {
            documentation: 'The root of the PhET-iO Type hierarchy',
            events: [],
            metadataDefaults: {
                phetioArchetypePhetioID: null,
                phetioDesigned: false,
                phetioDocumentation: '',
                phetioDynamicElement: false,
                phetioEventType: 'MODEL',
                phetioFeatured: false,
                phetioHighFrequency: false,
                phetioIsArchetype: false,
                phetioPlayback: false,
                phetioReadOnly: false,
                phetioState: true,
                phetioTypeName: 'ObjectIO'
            },
            methodOrder: [],
            methods: {},
            parameterTypes: [],
            supertype: null,
            typeName: 'ObjectIO'
        }
    },
    sim: 'natural-selection',
    version: {
        major: 1,
        minor: 0
    }
};
qunit.test('basics', (assert)=>{
    const referenceAPI = _.merge({
        phetioElements: {
            phetioEngine: {
                _metadata: {
                    phetioDocumentation: 'Central point for PhET-iO interoperability. Please see the PhET-iO Type Documentation for API details.',
                    phetioEventType: 'MODEL',
                    phetioState: false,
                    phetioTypeName: 'ObjectIO'
                }
            }
        }
    }, DEFAULT_API);
    const proposedAPI = _.cloneDeep(referenceAPI);
    let report = _phetioCompareAPIs(referenceAPI, proposedAPI);
    assert.ok(report.breakingProblems.length === 0, 'no breaking problems when compare to self');
    assert.ok(report.designedProblems.length === 0, 'no designed problems when compare to self');
    // @ts-expect-error
    proposedAPI.phetioElements.phetioEngine._metadata.phetioPlayback = true;
    report = _phetioCompareAPIs(referenceAPI, proposedAPI);
    assert.ok(report.breakingProblems.length === 1, 'no breaking problems when compare to self');
    assert.ok(report.designedProblems.length === 0, 'no designed problems when compare to self');
});
qunit.test('designed changes', (assert)=>{
    const referenceAPI = _.merge({
        phetioElements: {
            designedElement: {
                _metadata: {
                    phetioDesigned: true
                },
                designedChild: {
                    _metadata: {}
                }
            }
        }
    }, DEFAULT_API);
    const proposedAPI = _.cloneDeep(referenceAPI);
    // @ts-expect-error
    proposedAPI.phetioElements.designedElement._metadata.phetioDocumentation = 'changed though I am designed, oh boy, this cannot be good.';
    let report = _phetioCompareAPIs(referenceAPI, proposedAPI);
    assert.ok(report.breakingProblems.length === 0, 'no breaking problems when compare to design change');
    assert.ok(report.designedProblems.length === 1, 'no designed problems when changing designed problem');
    // @ts-expect-error
    proposedAPI.phetioElements.designedElement.designedChild._metadata.phetioDocumentation = 'changed though I am a child of designed, oh boy, this cannot be good.';
    report = _phetioCompareAPIs(referenceAPI, proposedAPI);
    assert.ok(report.breakingProblems.length === 0, 'no breaking problems when compare to design change');
    assert.ok(report.designedProblems.length === 2, 'no designed problems when changing designed problem on child');
    // in the reference, but not the proposed
    // @ts-expect-error
    referenceAPI.phetioElements.designedElement.otherChild = {
        _metadata: {}
    };
    report = _phetioCompareAPIs(referenceAPI, proposedAPI);
    assert.ok(report.breakingProblems.length === 1, 'cannot delete children like otherChild');
    // test shut off switch suppresses problems
    report = _phetioCompareAPIs(referenceAPI, proposedAPI, {
        compareDesignedAPIChanges: false,
        compareBreakingAPIChanges: false
    });
    assert.ok(report.breakingProblems.length === 0, 'no breaking problems if not testing for them');
    assert.ok(report.designedProblems.length === 0, 'no designed problems if not testing for them');
});
qunit.test('breaking element API changes', (assert)=>{
    const referenceAPI = _.merge({
        phetioElements: {
            breakingElement: {
                _metadata: {
                    phetioDesigned: true
                },
                designedChild: {
                    _metadata: {}
                }
            }
        }
    }, DEFAULT_API);
    let proposedAPI = _.cloneDeep(referenceAPI);
    // @ts-expect-error
    delete proposedAPI.phetioElements.breakingElement.designedChild;
    let report = _phetioCompareAPIs(referenceAPI, proposedAPI);
    assert.ok(report.breakingProblems.length === 1, 'missing an element');
    assert.ok(report.designedProblems.length === 1, 'missing element is also a designed problem');
    referenceAPI.phetioElements.breakingElement._metadata.phetioDesigned = false;
    report = _phetioCompareAPIs(referenceAPI, proposedAPI);
    assert.ok(report.breakingProblems.length === 1, 'missing an element');
    assert.ok(report.designedProblems.length === 0, 'not a problem if not designed in the reference');
    const testMetadataKeyChange = (metadataKey, valueThatBreaksAPI)=>{
        proposedAPI = _.cloneDeep(referenceAPI);
        // @ts-expect-error
        proposedAPI.phetioElements.breakingElement._metadata[metadataKey] = valueThatBreaksAPI;
        report = _phetioCompareAPIs(referenceAPI, proposedAPI, {
            compareDesignedAPIChanges: false
        });
        assert.ok(report.breakingProblems.length === 1, `it is a breaking change for ${metadataKey} to become ${valueThatBreaksAPI}`);
    };
    // All values that would constitute a breaking change, sometimes breaking the comparison task with an assertion.
    const metadataBreakingData = [
        {
            metadataKey: 'phetioTypeName',
            value: 'OtherTypeIO',
            assert: true
        },
        {
            metadataKey: 'phetioTypeName',
            value: true,
            assert: true
        },
        {
            metadataKey: 'phetioEventType',
            value: true
        },
        {
            metadataKey: 'phetioEventType',
            value: 'MOdDEL'
        },
        {
            metadataKey: 'phetioEventType',
            value: 'USER'
        },
        {
            metadataKey: 'phetioPlayback',
            value: true
        },
        {
            metadataKey: 'phetioPlayback',
            value: '"a string"'
        },
        {
            metadataKey: 'phetioDynamicElement',
            value: true
        },
        {
            metadataKey: 'phetioIsArchetype',
            value: true
        },
        {
            metadataKey: 'phetioIsArchetype',
            value: 'hi'
        },
        {
            metadataKey: 'phetioArchetypePhetioID',
            value: true
        },
        {
            metadataKey: 'phetioArchetypePhetioID',
            value: false
        },
        {
            metadataKey: 'phetioArchetypePhetioID',
            value: 'wrongPhetioID'
        },
        {
            metadataKey: 'phetioState',
            value: false
        },
        {
            metadataKey: 'phetioReadOnly',
            value: true
        }
    ];
    metadataBreakingData.forEach((testData)=>{
        const test = ()=>testMetadataKeyChange(testData.metadataKey, testData.value);
        if (testData.assert) {
            assert.throws(()=>{
                test();
            // @ts-expect-error
            }, `assertion expected with key: ${testData.key}, and wrong value: ${testData.value}`);
        } else {
            test();
        }
    });
});
qunit.test('testing PhetioTypes', (assert)=>{
    const referenceAPI = {
        version: {
            major: 1,
            minor: 1
        },
        phetioElements: {},
        phetioTypes: {
            'PropertyIO<Vector2IO>': {
                apiStateKeys: [
                    'validValues',
                    'units'
                ],
                dataDefaults: {},
                documentation: 'Observable values that send out notifications when the value changes. This differs from the traditional listener pattern in that added listeners also receive a callback with the current value when the listeners are registered. This is a widely-used pattern in PhET-iO simulations.',
                events: [
                    'changed'
                ],
                metadataDefaults: {},
                methodOrder: [
                    'link',
                    'lazyLink'
                ],
                methods: {
                    getValidationError: {
                        documentation: 'Checks to see if a proposed value is valid. Returns the first validation error, or null if the value is valid.',
                        parameterTypes: [
                            'Vector2IO'
                        ],
                        returnType: 'NullableIO<StringIO>'
                    },
                    getValue: {
                        documentation: 'Gets the current value.',
                        parameterTypes: [],
                        returnType: 'Vector2IO'
                    },
                    lazyLink: {
                        documentation: 'Adds a listener which will be called when the value changes. This method is like "link", but without the current-value callback on registration. The listener takes two arguments, the new value and the previous value.',
                        parameterTypes: [
                            'FunctionIO(Vector2IO,NullableIO<Vector2IO>)=>VoidIO'
                        ],
                        returnType: 'VoidIO'
                    },
                    link: {
                        documentation: 'Adds a listener which will be called when the value changes. On registration, the listener is also called with the current value. The listener takes two arguments, the new value and the previous value.',
                        parameterTypes: [
                            'FunctionIO(Vector2IO,NullableIO<Vector2IO>)=>VoidIO'
                        ],
                        returnType: 'VoidIO'
                    },
                    setValue: {
                        documentation: 'Sets the value of the Property. If the value differs from the previous value, listeners are notified with the new value.',
                        invocableForReadOnlyElements: false,
                        parameterTypes: [
                            'Vector2IO'
                        ],
                        returnType: 'VoidIO'
                    },
                    unlink: {
                        documentation: 'Removes a listener.',
                        parameterTypes: [
                            'FunctionIO(Vector2IO)=>VoidIO'
                        ],
                        returnType: 'VoidIO'
                    }
                },
                parameterTypes: [
                    'Vector2IO'
                ],
                stateSchema: {
                    units: 'NullableIO<StringIO>',
                    validValues: 'NullableIO<ArrayIO<Vector2IO>>',
                    value: 'Vector2IO'
                },
                supertype: 'ObjectIO',
                typeName: 'PropertyIO<Vector2IO>'
            }
        }
    };
    const proposedAPI = _.cloneDeep(referenceAPI);
    let report = _phetioCompareAPIs(referenceAPI, proposedAPI);
    assert.ok(report.breakingProblems.length === 0, 'missing an element');
    assert.ok(report.designedProblems.length === 0, 'missing element is also a designed problem');
    const propertyIOEntry = proposedAPI.phetioTypes['PropertyIO<Vector2IO>'];
    propertyIOEntry.apiStateKeys.push('hi');
    report = _phetioCompareAPIs(referenceAPI, proposedAPI);
    assert.ok(report.breakingProblems.length === 0, 'missing an element');
    assert.ok(report.designedProblems.length === 1, 'apiStateKeys cannot be different for designed');
    propertyIOEntry.apiStateKeys = propertyIOEntry.apiStateKeys.slice(0, 1);
    report = _phetioCompareAPIs(referenceAPI, proposedAPI);
    assert.ok(report.breakingProblems.length === 1);
    assert.ok(report.designedProblems.length === 1);
    // @ts-expect-error
    delete propertyIOEntry.apiStateKeys;
    report = _phetioCompareAPIs(referenceAPI, proposedAPI);
    assert.ok(report.breakingProblems.length === 1);
    assert.ok(report.designedProblems.length === 1);
    propertyIOEntry.apiStateKeys = [
        'hi'
    ];
    // @ts-expect-error
    delete referenceAPI.phetioTypes['PropertyIO<Vector2IO>'].apiStateKeys;
    report = _phetioCompareAPIs(referenceAPI, proposedAPI);
    assert.ok(report.breakingProblems.length === 0);
    assert.ok(report.designedProblems.length === 1);
});

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2pzL3BoZXQtaW8vcGhldGlvQ29tcGFyZUFQSXNUZXN0cy50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAyMS0yMDI0LCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuLyoqXG4gKiBAYXV0aG9yIE1pY2hhZWwgS2F1em1hbm4gKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXG4gKi9cblxuaW1wb3J0IF8gZnJvbSAnbG9kYXNoJztcbmltcG9ydCBxdW5pdCBmcm9tICcuLi8uLi8uLi9wZXJlbm5pYWwtYWxpYXMvanMvbnBtLWRlcGVuZGVuY2llcy9xdW5pdC5qcyc7XG5pbXBvcnQgeyBQaGV0aW9BUEkgfSBmcm9tICcuLi8uLi8uLi90YW5kZW0vanMvcGhldC1pby10eXBlcy5qcyc7XG5pbXBvcnQgcGhldGlvQ29tcGFyZUFQSXMsIHsgUGhldGlvQ29tcGFyZUFQSXNPcHRpb25zIH0gZnJvbSAnLi4vYnJvd3Nlci1hbmQtbm9kZS9waGV0aW9Db21wYXJlQVBJcy5qcyc7XG5cbnF1bml0Lm1vZHVsZSggJ3BoZXRpb0NvbXBhcmVBUElzJyApO1xuXG5jb25zdCBfcGhldGlvQ29tcGFyZUFQSXMgPSAoIHJlZmVyZW5jZUFQSTogUGhldGlvQVBJLCBwcm9wb3NlZEFQSTogUGhldGlvQVBJLCBvcHRpb25zPzogUGFydGlhbDxQaGV0aW9Db21wYXJlQVBJc09wdGlvbnM+ICkgPT4ge1xuICByZXR1cm4gcGhldGlvQ29tcGFyZUFQSXMoIHJlZmVyZW5jZUFQSSwgcHJvcG9zZWRBUEksIF8sIG9wdGlvbnMgKTtcbn07XG5cbi8vIFRvIGNvdmVyIHRoZSBib2lsZXJwbGF0ZSB0aGF0IHdpbGwgYmUgbGFyZ2VseSBjb3BpZWQgYXJvdW5kIG90aGVyd2lzZS5cbmNvbnN0IERFRkFVTFRfQVBJID0ge1xuICBwaGV0aW9FbGVtZW50czoge30sXG4gIHBoZXRpb0Z1bGxBUEk6IHRydWUsXG4gIHBoZXRpb1R5cGVzOiB7XG4gICAgT2JqZWN0SU86IHtcbiAgICAgIGRvY3VtZW50YXRpb246ICdUaGUgcm9vdCBvZiB0aGUgUGhFVC1pTyBUeXBlIGhpZXJhcmNoeScsXG4gICAgICBldmVudHM6IFtdLFxuICAgICAgbWV0YWRhdGFEZWZhdWx0czoge1xuICAgICAgICBwaGV0aW9BcmNoZXR5cGVQaGV0aW9JRDogbnVsbCxcbiAgICAgICAgcGhldGlvRGVzaWduZWQ6IGZhbHNlLFxuICAgICAgICBwaGV0aW9Eb2N1bWVudGF0aW9uOiAnJyxcbiAgICAgICAgcGhldGlvRHluYW1pY0VsZW1lbnQ6IGZhbHNlLFxuICAgICAgICBwaGV0aW9FdmVudFR5cGU6ICdNT0RFTCcsXG4gICAgICAgIHBoZXRpb0ZlYXR1cmVkOiBmYWxzZSxcbiAgICAgICAgcGhldGlvSGlnaEZyZXF1ZW5jeTogZmFsc2UsXG4gICAgICAgIHBoZXRpb0lzQXJjaGV0eXBlOiBmYWxzZSxcbiAgICAgICAgcGhldGlvUGxheWJhY2s6IGZhbHNlLFxuICAgICAgICBwaGV0aW9SZWFkT25seTogZmFsc2UsXG4gICAgICAgIHBoZXRpb1N0YXRlOiB0cnVlLFxuICAgICAgICBwaGV0aW9UeXBlTmFtZTogJ09iamVjdElPJ1xuICAgICAgfSxcbiAgICAgIG1ldGhvZE9yZGVyOiBbXSxcbiAgICAgIG1ldGhvZHM6IHt9LFxuICAgICAgcGFyYW1ldGVyVHlwZXM6IFtdLFxuICAgICAgc3VwZXJ0eXBlOiBudWxsLFxuICAgICAgdHlwZU5hbWU6ICdPYmplY3RJTydcbiAgICB9XG4gIH0sXG4gIHNpbTogJ25hdHVyYWwtc2VsZWN0aW9uJyxcbiAgdmVyc2lvbjoge1xuICAgIG1ham9yOiAxLFxuICAgIG1pbm9yOiAwXG4gIH1cbn07XG5cblxucXVuaXQudGVzdCggJ2Jhc2ljcycsIGFzc2VydCA9PiB7XG5cbiAgY29uc3QgcmVmZXJlbmNlQVBJID0gXy5tZXJnZSgge1xuICAgIHBoZXRpb0VsZW1lbnRzOiB7XG4gICAgICBwaGV0aW9FbmdpbmU6IHtcbiAgICAgICAgX21ldGFkYXRhOiB7XG4gICAgICAgICAgcGhldGlvRG9jdW1lbnRhdGlvbjogJ0NlbnRyYWwgcG9pbnQgZm9yIFBoRVQtaU8gaW50ZXJvcGVyYWJpbGl0eS4gUGxlYXNlIHNlZSB0aGUgUGhFVC1pTyBUeXBlIERvY3VtZW50YXRpb24gZm9yIEFQSSBkZXRhaWxzLicsXG4gICAgICAgICAgcGhldGlvRXZlbnRUeXBlOiAnTU9ERUwnLFxuICAgICAgICAgIHBoZXRpb1N0YXRlOiBmYWxzZSxcbiAgICAgICAgICBwaGV0aW9UeXBlTmFtZTogJ09iamVjdElPJ1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9LCBERUZBVUxUX0FQSSApO1xuXG4gIGNvbnN0IHByb3Bvc2VkQVBJID0gXy5jbG9uZURlZXAoIHJlZmVyZW5jZUFQSSApO1xuXG4gIGxldCByZXBvcnQgPSBfcGhldGlvQ29tcGFyZUFQSXMoIHJlZmVyZW5jZUFQSSBhcyB1bmtub3duIGFzIFBoZXRpb0FQSSwgcHJvcG9zZWRBUEkgYXMgdW5rbm93biBhcyBQaGV0aW9BUEkgKTtcblxuICBhc3NlcnQub2soIHJlcG9ydC5icmVha2luZ1Byb2JsZW1zLmxlbmd0aCA9PT0gMCwgJ25vIGJyZWFraW5nIHByb2JsZW1zIHdoZW4gY29tcGFyZSB0byBzZWxmJyApO1xuICBhc3NlcnQub2soIHJlcG9ydC5kZXNpZ25lZFByb2JsZW1zLmxlbmd0aCA9PT0gMCwgJ25vIGRlc2lnbmVkIHByb2JsZW1zIHdoZW4gY29tcGFyZSB0byBzZWxmJyApO1xuXG5cbiAgLy8gQHRzLWV4cGVjdC1lcnJvclxuICBwcm9wb3NlZEFQSS5waGV0aW9FbGVtZW50cy5waGV0aW9FbmdpbmUuX21ldGFkYXRhLnBoZXRpb1BsYXliYWNrID0gdHJ1ZTtcblxuICByZXBvcnQgPSBfcGhldGlvQ29tcGFyZUFQSXMoIHJlZmVyZW5jZUFQSSBhcyB1bmtub3duIGFzIFBoZXRpb0FQSSwgcHJvcG9zZWRBUEkgYXMgdW5rbm93biBhcyBQaGV0aW9BUEkgKTtcblxuICBhc3NlcnQub2soIHJlcG9ydC5icmVha2luZ1Byb2JsZW1zLmxlbmd0aCA9PT0gMSwgJ25vIGJyZWFraW5nIHByb2JsZW1zIHdoZW4gY29tcGFyZSB0byBzZWxmJyApO1xuICBhc3NlcnQub2soIHJlcG9ydC5kZXNpZ25lZFByb2JsZW1zLmxlbmd0aCA9PT0gMCwgJ25vIGRlc2lnbmVkIHByb2JsZW1zIHdoZW4gY29tcGFyZSB0byBzZWxmJyApO1xufSApO1xuXG5cbnF1bml0LnRlc3QoICdkZXNpZ25lZCBjaGFuZ2VzJywgYXNzZXJ0ID0+IHtcbiAgY29uc3QgcmVmZXJlbmNlQVBJID0gXy5tZXJnZSgge1xuICAgIHBoZXRpb0VsZW1lbnRzOiB7XG4gICAgICBkZXNpZ25lZEVsZW1lbnQ6IHtcbiAgICAgICAgX21ldGFkYXRhOiB7XG4gICAgICAgICAgcGhldGlvRGVzaWduZWQ6IHRydWVcbiAgICAgICAgfSxcbiAgICAgICAgZGVzaWduZWRDaGlsZDoge1xuICAgICAgICAgIF9tZXRhZGF0YToge31cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfSwgREVGQVVMVF9BUEkgKTtcblxuICBjb25zdCBwcm9wb3NlZEFQSSA9IF8uY2xvbmVEZWVwKCByZWZlcmVuY2VBUEkgKTtcblxuICAvLyBAdHMtZXhwZWN0LWVycm9yXG4gIHByb3Bvc2VkQVBJLnBoZXRpb0VsZW1lbnRzLmRlc2lnbmVkRWxlbWVudC5fbWV0YWRhdGEucGhldGlvRG9jdW1lbnRhdGlvbiA9ICdjaGFuZ2VkIHRob3VnaCBJIGFtIGRlc2lnbmVkLCBvaCBib3ksIHRoaXMgY2Fubm90IGJlIGdvb2QuJztcblxuICBsZXQgcmVwb3J0ID0gX3BoZXRpb0NvbXBhcmVBUElzKCByZWZlcmVuY2VBUEkgYXMgdW5rbm93biBhcyBQaGV0aW9BUEksIHByb3Bvc2VkQVBJIGFzIHVua25vd24gYXMgUGhldGlvQVBJICk7XG4gIGFzc2VydC5vayggcmVwb3J0LmJyZWFraW5nUHJvYmxlbXMubGVuZ3RoID09PSAwLCAnbm8gYnJlYWtpbmcgcHJvYmxlbXMgd2hlbiBjb21wYXJlIHRvIGRlc2lnbiBjaGFuZ2UnICk7XG4gIGFzc2VydC5vayggcmVwb3J0LmRlc2lnbmVkUHJvYmxlbXMubGVuZ3RoID09PSAxLCAnbm8gZGVzaWduZWQgcHJvYmxlbXMgd2hlbiBjaGFuZ2luZyBkZXNpZ25lZCBwcm9ibGVtJyApO1xuXG4gIC8vIEB0cy1leHBlY3QtZXJyb3JcbiAgcHJvcG9zZWRBUEkucGhldGlvRWxlbWVudHMuZGVzaWduZWRFbGVtZW50LmRlc2lnbmVkQ2hpbGQuX21ldGFkYXRhLnBoZXRpb0RvY3VtZW50YXRpb24gPVxuICAgICdjaGFuZ2VkIHRob3VnaCBJIGFtIGEgY2hpbGQgb2YgZGVzaWduZWQsIG9oIGJveSwgdGhpcyBjYW5ub3QgYmUgZ29vZC4nO1xuXG4gIHJlcG9ydCA9IF9waGV0aW9Db21wYXJlQVBJcyggcmVmZXJlbmNlQVBJIGFzIHVua25vd24gYXMgUGhldGlvQVBJLCBwcm9wb3NlZEFQSSBhcyB1bmtub3duIGFzIFBoZXRpb0FQSSApO1xuICBhc3NlcnQub2soIHJlcG9ydC5icmVha2luZ1Byb2JsZW1zLmxlbmd0aCA9PT0gMCwgJ25vIGJyZWFraW5nIHByb2JsZW1zIHdoZW4gY29tcGFyZSB0byBkZXNpZ24gY2hhbmdlJyApO1xuICBhc3NlcnQub2soIHJlcG9ydC5kZXNpZ25lZFByb2JsZW1zLmxlbmd0aCA9PT0gMiwgJ25vIGRlc2lnbmVkIHByb2JsZW1zIHdoZW4gY2hhbmdpbmcgZGVzaWduZWQgcHJvYmxlbSBvbiBjaGlsZCcgKTtcblxuXG4gIC8vIGluIHRoZSByZWZlcmVuY2UsIGJ1dCBub3QgdGhlIHByb3Bvc2VkXG4gIC8vIEB0cy1leHBlY3QtZXJyb3JcbiAgcmVmZXJlbmNlQVBJLnBoZXRpb0VsZW1lbnRzLmRlc2lnbmVkRWxlbWVudC5vdGhlckNoaWxkID0geyBfbWV0YWRhdGE6IHt9IH07XG4gIHJlcG9ydCA9IF9waGV0aW9Db21wYXJlQVBJcyggcmVmZXJlbmNlQVBJIGFzIHVua25vd24gYXMgUGhldGlvQVBJLCBwcm9wb3NlZEFQSSBhcyB1bmtub3duIGFzIFBoZXRpb0FQSSApO1xuICBhc3NlcnQub2soIHJlcG9ydC5icmVha2luZ1Byb2JsZW1zLmxlbmd0aCA9PT0gMSwgJ2Nhbm5vdCBkZWxldGUgY2hpbGRyZW4gbGlrZSBvdGhlckNoaWxkJyApO1xuXG4gIC8vIHRlc3Qgc2h1dCBvZmYgc3dpdGNoIHN1cHByZXNzZXMgcHJvYmxlbXNcbiAgcmVwb3J0ID0gX3BoZXRpb0NvbXBhcmVBUElzKCByZWZlcmVuY2VBUEkgYXMgdW5rbm93biBhcyBQaGV0aW9BUEksIHByb3Bvc2VkQVBJIGFzIHVua25vd24gYXMgUGhldGlvQVBJLCB7XG4gICAgY29tcGFyZURlc2lnbmVkQVBJQ2hhbmdlczogZmFsc2UsXG4gICAgY29tcGFyZUJyZWFraW5nQVBJQ2hhbmdlczogZmFsc2VcbiAgfSApO1xuICBhc3NlcnQub2soIHJlcG9ydC5icmVha2luZ1Byb2JsZW1zLmxlbmd0aCA9PT0gMCwgJ25vIGJyZWFraW5nIHByb2JsZW1zIGlmIG5vdCB0ZXN0aW5nIGZvciB0aGVtJyApO1xuICBhc3NlcnQub2soIHJlcG9ydC5kZXNpZ25lZFByb2JsZW1zLmxlbmd0aCA9PT0gMCwgJ25vIGRlc2lnbmVkIHByb2JsZW1zIGlmIG5vdCB0ZXN0aW5nIGZvciB0aGVtJyApO1xufSApO1xuXG5cbnF1bml0LnRlc3QoICdicmVha2luZyBlbGVtZW50IEFQSSBjaGFuZ2VzJywgYXNzZXJ0ID0+IHtcbiAgY29uc3QgcmVmZXJlbmNlQVBJID0gXy5tZXJnZSgge1xuICAgIHBoZXRpb0VsZW1lbnRzOiB7XG4gICAgICBicmVha2luZ0VsZW1lbnQ6IHtcbiAgICAgICAgX21ldGFkYXRhOiB7XG4gICAgICAgICAgcGhldGlvRGVzaWduZWQ6IHRydWVcbiAgICAgICAgfSxcbiAgICAgICAgZGVzaWduZWRDaGlsZDoge1xuICAgICAgICAgIF9tZXRhZGF0YToge31cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfSwgREVGQVVMVF9BUEkgKTtcblxuICBsZXQgcHJvcG9zZWRBUEkgPSBfLmNsb25lRGVlcCggcmVmZXJlbmNlQVBJICk7XG5cbiAgLy8gQHRzLWV4cGVjdC1lcnJvclxuICBkZWxldGUgcHJvcG9zZWRBUEkucGhldGlvRWxlbWVudHMuYnJlYWtpbmdFbGVtZW50LmRlc2lnbmVkQ2hpbGQ7XG5cbiAgbGV0IHJlcG9ydCA9IF9waGV0aW9Db21wYXJlQVBJcyggcmVmZXJlbmNlQVBJIGFzIHVua25vd24gYXMgUGhldGlvQVBJLCBwcm9wb3NlZEFQSSBhcyB1bmtub3duIGFzIFBoZXRpb0FQSSApO1xuICBhc3NlcnQub2soIHJlcG9ydC5icmVha2luZ1Byb2JsZW1zLmxlbmd0aCA9PT0gMSwgJ21pc3NpbmcgYW4gZWxlbWVudCcgKTtcbiAgYXNzZXJ0Lm9rKCByZXBvcnQuZGVzaWduZWRQcm9ibGVtcy5sZW5ndGggPT09IDEsICdtaXNzaW5nIGVsZW1lbnQgaXMgYWxzbyBhIGRlc2lnbmVkIHByb2JsZW0nICk7XG5cbiAgcmVmZXJlbmNlQVBJLnBoZXRpb0VsZW1lbnRzLmJyZWFraW5nRWxlbWVudC5fbWV0YWRhdGEucGhldGlvRGVzaWduZWQgPSBmYWxzZTtcblxuICByZXBvcnQgPSBfcGhldGlvQ29tcGFyZUFQSXMoIHJlZmVyZW5jZUFQSSBhcyB1bmtub3duIGFzIFBoZXRpb0FQSSwgcHJvcG9zZWRBUEkgYXMgdW5rbm93biBhcyBQaGV0aW9BUEkgKTtcbiAgYXNzZXJ0Lm9rKCByZXBvcnQuYnJlYWtpbmdQcm9ibGVtcy5sZW5ndGggPT09IDEsICdtaXNzaW5nIGFuIGVsZW1lbnQnICk7XG4gIGFzc2VydC5vayggcmVwb3J0LmRlc2lnbmVkUHJvYmxlbXMubGVuZ3RoID09PSAwLCAnbm90IGEgcHJvYmxlbSBpZiBub3QgZGVzaWduZWQgaW4gdGhlIHJlZmVyZW5jZScgKTtcblxuICBjb25zdCB0ZXN0TWV0YWRhdGFLZXlDaGFuZ2UgPSAoIG1ldGFkYXRhS2V5OiBzdHJpbmcsIHZhbHVlVGhhdEJyZWFrc0FQSTogc3RyaW5nIHwgYm9vbGVhbiApID0+IHtcblxuICAgIHByb3Bvc2VkQVBJID0gXy5jbG9uZURlZXAoIHJlZmVyZW5jZUFQSSApO1xuXG4gICAgLy8gQHRzLWV4cGVjdC1lcnJvclxuICAgIHByb3Bvc2VkQVBJLnBoZXRpb0VsZW1lbnRzLmJyZWFraW5nRWxlbWVudC5fbWV0YWRhdGFbIG1ldGFkYXRhS2V5IF0gPSB2YWx1ZVRoYXRCcmVha3NBUEk7XG5cbiAgICByZXBvcnQgPSBfcGhldGlvQ29tcGFyZUFQSXMoIHJlZmVyZW5jZUFQSSBhcyB1bmtub3duIGFzIFBoZXRpb0FQSSwgcHJvcG9zZWRBUEkgYXMgdW5rbm93biBhcyBQaGV0aW9BUEksIHtcbiAgICAgIGNvbXBhcmVEZXNpZ25lZEFQSUNoYW5nZXM6IGZhbHNlXG4gICAgfSApO1xuICAgIGFzc2VydC5vayggcmVwb3J0LmJyZWFraW5nUHJvYmxlbXMubGVuZ3RoID09PSAxLCBgaXQgaXMgYSBicmVha2luZyBjaGFuZ2UgZm9yICR7bWV0YWRhdGFLZXl9IHRvIGJlY29tZSAke3ZhbHVlVGhhdEJyZWFrc0FQSX1gICk7XG4gIH07XG5cbiAgLy8gQWxsIHZhbHVlcyB0aGF0IHdvdWxkIGNvbnN0aXR1dGUgYSBicmVha2luZyBjaGFuZ2UsIHNvbWV0aW1lcyBicmVha2luZyB0aGUgY29tcGFyaXNvbiB0YXNrIHdpdGggYW4gYXNzZXJ0aW9uLlxuICBjb25zdCBtZXRhZGF0YUJyZWFraW5nRGF0YSA9IFtcbiAgICB7IG1ldGFkYXRhS2V5OiAncGhldGlvVHlwZU5hbWUnLCB2YWx1ZTogJ090aGVyVHlwZUlPJywgYXNzZXJ0OiB0cnVlIH0sXG4gICAgeyBtZXRhZGF0YUtleTogJ3BoZXRpb1R5cGVOYW1lJywgdmFsdWU6IHRydWUsIGFzc2VydDogdHJ1ZSB9LFxuICAgIHsgbWV0YWRhdGFLZXk6ICdwaGV0aW9FdmVudFR5cGUnLCB2YWx1ZTogdHJ1ZSB9LFxuICAgIHsgbWV0YWRhdGFLZXk6ICdwaGV0aW9FdmVudFR5cGUnLCB2YWx1ZTogJ01PZERFTCcgfSxcbiAgICB7IG1ldGFkYXRhS2V5OiAncGhldGlvRXZlbnRUeXBlJywgdmFsdWU6ICdVU0VSJyB9LFxuICAgIHsgbWV0YWRhdGFLZXk6ICdwaGV0aW9QbGF5YmFjaycsIHZhbHVlOiB0cnVlIH0sXG4gICAgeyBtZXRhZGF0YUtleTogJ3BoZXRpb1BsYXliYWNrJywgdmFsdWU6ICdcImEgc3RyaW5nXCInIH0sXG4gICAgeyBtZXRhZGF0YUtleTogJ3BoZXRpb0R5bmFtaWNFbGVtZW50JywgdmFsdWU6IHRydWUgfSxcbiAgICB7IG1ldGFkYXRhS2V5OiAncGhldGlvSXNBcmNoZXR5cGUnLCB2YWx1ZTogdHJ1ZSB9LFxuICAgIHsgbWV0YWRhdGFLZXk6ICdwaGV0aW9Jc0FyY2hldHlwZScsIHZhbHVlOiAnaGknIH0sXG4gICAgeyBtZXRhZGF0YUtleTogJ3BoZXRpb0FyY2hldHlwZVBoZXRpb0lEJywgdmFsdWU6IHRydWUgfSxcbiAgICB7IG1ldGFkYXRhS2V5OiAncGhldGlvQXJjaGV0eXBlUGhldGlvSUQnLCB2YWx1ZTogZmFsc2UgfSxcbiAgICB7IG1ldGFkYXRhS2V5OiAncGhldGlvQXJjaGV0eXBlUGhldGlvSUQnLCB2YWx1ZTogJ3dyb25nUGhldGlvSUQnIH0sXG4gICAgeyBtZXRhZGF0YUtleTogJ3BoZXRpb1N0YXRlJywgdmFsdWU6IGZhbHNlIH0sXG4gICAgeyBtZXRhZGF0YUtleTogJ3BoZXRpb1JlYWRPbmx5JywgdmFsdWU6IHRydWUgfVxuICBdO1xuXG4gIG1ldGFkYXRhQnJlYWtpbmdEYXRhLmZvckVhY2goIHRlc3REYXRhID0+IHtcblxuICAgIGNvbnN0IHRlc3QgPSAoKSA9PiB0ZXN0TWV0YWRhdGFLZXlDaGFuZ2UoIHRlc3REYXRhLm1ldGFkYXRhS2V5LCB0ZXN0RGF0YS52YWx1ZSApO1xuXG4gICAgaWYgKCB0ZXN0RGF0YS5hc3NlcnQgKSB7XG4gICAgICBhc3NlcnQudGhyb3dzKCAoKSA9PiB7XG4gICAgICAgIHRlc3QoKTtcbiAgICAgICAgLy8gQHRzLWV4cGVjdC1lcnJvclxuICAgICAgfSwgYGFzc2VydGlvbiBleHBlY3RlZCB3aXRoIGtleTogJHt0ZXN0RGF0YS5rZXl9LCBhbmQgd3JvbmcgdmFsdWU6ICR7dGVzdERhdGEudmFsdWV9YCApO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIHRlc3QoKTtcbiAgICB9XG4gIH0gKTtcbn0gKTtcblxucXVuaXQudGVzdCggJ3Rlc3RpbmcgUGhldGlvVHlwZXMnLCBhc3NlcnQgPT4ge1xuICBjb25zdCByZWZlcmVuY2VBUEkgPSB7XG4gICAgdmVyc2lvbjogeyBtYWpvcjogMSwgbWlub3I6IDEgfSxcbiAgICBwaGV0aW9FbGVtZW50czoge30sXG4gICAgcGhldGlvVHlwZXM6IHtcbiAgICAgICdQcm9wZXJ0eUlPPFZlY3RvcjJJTz4nOiB7XG4gICAgICAgIGFwaVN0YXRlS2V5czogW1xuICAgICAgICAgICd2YWxpZFZhbHVlcycsXG4gICAgICAgICAgJ3VuaXRzJ1xuICAgICAgICBdLFxuICAgICAgICBkYXRhRGVmYXVsdHM6IHt9LFxuICAgICAgICBkb2N1bWVudGF0aW9uOiAnT2JzZXJ2YWJsZSB2YWx1ZXMgdGhhdCBzZW5kIG91dCBub3RpZmljYXRpb25zIHdoZW4gdGhlIHZhbHVlIGNoYW5nZXMuIFRoaXMgZGlmZmVycyBmcm9tIHRoZSB0cmFkaXRpb25hbCBsaXN0ZW5lciBwYXR0ZXJuIGluIHRoYXQgYWRkZWQgbGlzdGVuZXJzIGFsc28gcmVjZWl2ZSBhIGNhbGxiYWNrIHdpdGggdGhlIGN1cnJlbnQgdmFsdWUgd2hlbiB0aGUgbGlzdGVuZXJzIGFyZSByZWdpc3RlcmVkLiBUaGlzIGlzIGEgd2lkZWx5LXVzZWQgcGF0dGVybiBpbiBQaEVULWlPIHNpbXVsYXRpb25zLicsXG4gICAgICAgIGV2ZW50czogW1xuICAgICAgICAgICdjaGFuZ2VkJ1xuICAgICAgICBdLFxuICAgICAgICBtZXRhZGF0YURlZmF1bHRzOiB7fSxcbiAgICAgICAgbWV0aG9kT3JkZXI6IFtcbiAgICAgICAgICAnbGluaycsXG4gICAgICAgICAgJ2xhenlMaW5rJ1xuICAgICAgICBdLFxuICAgICAgICBtZXRob2RzOiB7XG4gICAgICAgICAgZ2V0VmFsaWRhdGlvbkVycm9yOiB7XG4gICAgICAgICAgICBkb2N1bWVudGF0aW9uOiAnQ2hlY2tzIHRvIHNlZSBpZiBhIHByb3Bvc2VkIHZhbHVlIGlzIHZhbGlkLiBSZXR1cm5zIHRoZSBmaXJzdCB2YWxpZGF0aW9uIGVycm9yLCBvciBudWxsIGlmIHRoZSB2YWx1ZSBpcyB2YWxpZC4nLFxuICAgICAgICAgICAgcGFyYW1ldGVyVHlwZXM6IFtcbiAgICAgICAgICAgICAgJ1ZlY3RvcjJJTydcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICByZXR1cm5UeXBlOiAnTnVsbGFibGVJTzxTdHJpbmdJTz4nXG4gICAgICAgICAgfSxcbiAgICAgICAgICBnZXRWYWx1ZToge1xuICAgICAgICAgICAgZG9jdW1lbnRhdGlvbjogJ0dldHMgdGhlIGN1cnJlbnQgdmFsdWUuJyxcbiAgICAgICAgICAgIHBhcmFtZXRlclR5cGVzOiBbXSxcbiAgICAgICAgICAgIHJldHVyblR5cGU6ICdWZWN0b3IySU8nXG4gICAgICAgICAgfSxcbiAgICAgICAgICBsYXp5TGluazoge1xuICAgICAgICAgICAgZG9jdW1lbnRhdGlvbjogJ0FkZHMgYSBsaXN0ZW5lciB3aGljaCB3aWxsIGJlIGNhbGxlZCB3aGVuIHRoZSB2YWx1ZSBjaGFuZ2VzLiBUaGlzIG1ldGhvZCBpcyBsaWtlIFwibGlua1wiLCBidXQgd2l0aG91dCB0aGUgY3VycmVudC12YWx1ZSBjYWxsYmFjayBvbiByZWdpc3RyYXRpb24uIFRoZSBsaXN0ZW5lciB0YWtlcyB0d28gYXJndW1lbnRzLCB0aGUgbmV3IHZhbHVlIGFuZCB0aGUgcHJldmlvdXMgdmFsdWUuJyxcbiAgICAgICAgICAgIHBhcmFtZXRlclR5cGVzOiBbXG4gICAgICAgICAgICAgICdGdW5jdGlvbklPKFZlY3RvcjJJTyxOdWxsYWJsZUlPPFZlY3RvcjJJTz4pPT5Wb2lkSU8nXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgcmV0dXJuVHlwZTogJ1ZvaWRJTydcbiAgICAgICAgICB9LFxuICAgICAgICAgIGxpbms6IHtcbiAgICAgICAgICAgIGRvY3VtZW50YXRpb246ICdBZGRzIGEgbGlzdGVuZXIgd2hpY2ggd2lsbCBiZSBjYWxsZWQgd2hlbiB0aGUgdmFsdWUgY2hhbmdlcy4gT24gcmVnaXN0cmF0aW9uLCB0aGUgbGlzdGVuZXIgaXMgYWxzbyBjYWxsZWQgd2l0aCB0aGUgY3VycmVudCB2YWx1ZS4gVGhlIGxpc3RlbmVyIHRha2VzIHR3byBhcmd1bWVudHMsIHRoZSBuZXcgdmFsdWUgYW5kIHRoZSBwcmV2aW91cyB2YWx1ZS4nLFxuICAgICAgICAgICAgcGFyYW1ldGVyVHlwZXM6IFtcbiAgICAgICAgICAgICAgJ0Z1bmN0aW9uSU8oVmVjdG9yMklPLE51bGxhYmxlSU88VmVjdG9yMklPPik9PlZvaWRJTydcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICByZXR1cm5UeXBlOiAnVm9pZElPJ1xuICAgICAgICAgIH0sXG4gICAgICAgICAgc2V0VmFsdWU6IHtcbiAgICAgICAgICAgIGRvY3VtZW50YXRpb246ICdTZXRzIHRoZSB2YWx1ZSBvZiB0aGUgUHJvcGVydHkuIElmIHRoZSB2YWx1ZSBkaWZmZXJzIGZyb20gdGhlIHByZXZpb3VzIHZhbHVlLCBsaXN0ZW5lcnMgYXJlIG5vdGlmaWVkIHdpdGggdGhlIG5ldyB2YWx1ZS4nLFxuICAgICAgICAgICAgaW52b2NhYmxlRm9yUmVhZE9ubHlFbGVtZW50czogZmFsc2UsXG4gICAgICAgICAgICBwYXJhbWV0ZXJUeXBlczogW1xuICAgICAgICAgICAgICAnVmVjdG9yMklPJ1xuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIHJldHVyblR5cGU6ICdWb2lkSU8nXG4gICAgICAgICAgfSxcbiAgICAgICAgICB1bmxpbms6IHtcbiAgICAgICAgICAgIGRvY3VtZW50YXRpb246ICdSZW1vdmVzIGEgbGlzdGVuZXIuJyxcbiAgICAgICAgICAgIHBhcmFtZXRlclR5cGVzOiBbXG4gICAgICAgICAgICAgICdGdW5jdGlvbklPKFZlY3RvcjJJTyk9PlZvaWRJTydcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICByZXR1cm5UeXBlOiAnVm9pZElPJ1xuICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgcGFyYW1ldGVyVHlwZXM6IFtcbiAgICAgICAgICAnVmVjdG9yMklPJ1xuICAgICAgICBdLFxuICAgICAgICBzdGF0ZVNjaGVtYToge1xuICAgICAgICAgIHVuaXRzOiAnTnVsbGFibGVJTzxTdHJpbmdJTz4nLFxuICAgICAgICAgIHZhbGlkVmFsdWVzOiAnTnVsbGFibGVJTzxBcnJheUlPPFZlY3RvcjJJTz4+JyxcbiAgICAgICAgICB2YWx1ZTogJ1ZlY3RvcjJJTydcbiAgICAgICAgfSxcbiAgICAgICAgc3VwZXJ0eXBlOiAnT2JqZWN0SU8nLFxuICAgICAgICB0eXBlTmFtZTogJ1Byb3BlcnR5SU88VmVjdG9yMklPPidcbiAgICAgIH1cbiAgICB9XG4gIH07XG5cbiAgY29uc3QgcHJvcG9zZWRBUEkgPSBfLmNsb25lRGVlcCggcmVmZXJlbmNlQVBJICk7XG5cblxuICBsZXQgcmVwb3J0ID0gX3BoZXRpb0NvbXBhcmVBUElzKCByZWZlcmVuY2VBUEkgYXMgdW5rbm93biBhcyBQaGV0aW9BUEksIHByb3Bvc2VkQVBJIGFzIHVua25vd24gYXMgUGhldGlvQVBJICk7XG4gIGFzc2VydC5vayggcmVwb3J0LmJyZWFraW5nUHJvYmxlbXMubGVuZ3RoID09PSAwLCAnbWlzc2luZyBhbiBlbGVtZW50JyApO1xuICBhc3NlcnQub2soIHJlcG9ydC5kZXNpZ25lZFByb2JsZW1zLmxlbmd0aCA9PT0gMCwgJ21pc3NpbmcgZWxlbWVudCBpcyBhbHNvIGEgZGVzaWduZWQgcHJvYmxlbScgKTtcblxuICBjb25zdCBwcm9wZXJ0eUlPRW50cnkgPSBwcm9wb3NlZEFQSS5waGV0aW9UeXBlc1sgJ1Byb3BlcnR5SU88VmVjdG9yMklPPicgXTtcbiAgcHJvcGVydHlJT0VudHJ5LmFwaVN0YXRlS2V5cy5wdXNoKCAnaGknICk7XG5cbiAgcmVwb3J0ID0gX3BoZXRpb0NvbXBhcmVBUElzKCByZWZlcmVuY2VBUEkgYXMgdW5rbm93biBhcyBQaGV0aW9BUEksIHByb3Bvc2VkQVBJIGFzIHVua25vd24gYXMgUGhldGlvQVBJICk7XG4gIGFzc2VydC5vayggcmVwb3J0LmJyZWFraW5nUHJvYmxlbXMubGVuZ3RoID09PSAwLCAnbWlzc2luZyBhbiBlbGVtZW50JyApO1xuICBhc3NlcnQub2soIHJlcG9ydC5kZXNpZ25lZFByb2JsZW1zLmxlbmd0aCA9PT0gMSwgJ2FwaVN0YXRlS2V5cyBjYW5ub3QgYmUgZGlmZmVyZW50IGZvciBkZXNpZ25lZCcgKTtcblxuICBwcm9wZXJ0eUlPRW50cnkuYXBpU3RhdGVLZXlzID0gcHJvcGVydHlJT0VudHJ5LmFwaVN0YXRlS2V5cy5zbGljZSggMCwgMSApO1xuICByZXBvcnQgPSBfcGhldGlvQ29tcGFyZUFQSXMoIHJlZmVyZW5jZUFQSSBhcyB1bmtub3duIGFzIFBoZXRpb0FQSSwgcHJvcG9zZWRBUEkgYXMgdW5rbm93biBhcyBQaGV0aW9BUEkgKTtcbiAgYXNzZXJ0Lm9rKCByZXBvcnQuYnJlYWtpbmdQcm9ibGVtcy5sZW5ndGggPT09IDEgKTtcbiAgYXNzZXJ0Lm9rKCByZXBvcnQuZGVzaWduZWRQcm9ibGVtcy5sZW5ndGggPT09IDEgKTtcblxuICAvLyBAdHMtZXhwZWN0LWVycm9yXG4gIGRlbGV0ZSBwcm9wZXJ0eUlPRW50cnkuYXBpU3RhdGVLZXlzO1xuICByZXBvcnQgPSBfcGhldGlvQ29tcGFyZUFQSXMoIHJlZmVyZW5jZUFQSSBhcyB1bmtub3duIGFzIFBoZXRpb0FQSSwgcHJvcG9zZWRBUEkgYXMgdW5rbm93biBhcyBQaGV0aW9BUEkgKTtcbiAgYXNzZXJ0Lm9rKCByZXBvcnQuYnJlYWtpbmdQcm9ibGVtcy5sZW5ndGggPT09IDEgKTtcbiAgYXNzZXJ0Lm9rKCByZXBvcnQuZGVzaWduZWRQcm9ibGVtcy5sZW5ndGggPT09IDEgKTtcblxuICBwcm9wZXJ0eUlPRW50cnkuYXBpU3RhdGVLZXlzID0gWyAnaGknIF07XG4gIC8vIEB0cy1leHBlY3QtZXJyb3JcbiAgZGVsZXRlIHJlZmVyZW5jZUFQSS5waGV0aW9UeXBlc1sgJ1Byb3BlcnR5SU88VmVjdG9yMklPPicgXS5hcGlTdGF0ZUtleXM7XG4gIHJlcG9ydCA9IF9waGV0aW9Db21wYXJlQVBJcyggcmVmZXJlbmNlQVBJIGFzIHVua25vd24gYXMgUGhldGlvQVBJLCBwcm9wb3NlZEFQSSBhcyB1bmtub3duIGFzIFBoZXRpb0FQSSApO1xuICBhc3NlcnQub2soIHJlcG9ydC5icmVha2luZ1Byb2JsZW1zLmxlbmd0aCA9PT0gMCApO1xuICBhc3NlcnQub2soIHJlcG9ydC5kZXNpZ25lZFByb2JsZW1zLmxlbmd0aCA9PT0gMSApO1xufSApOyJdLCJuYW1lcyI6WyJfIiwicXVuaXQiLCJwaGV0aW9Db21wYXJlQVBJcyIsIm1vZHVsZSIsIl9waGV0aW9Db21wYXJlQVBJcyIsInJlZmVyZW5jZUFQSSIsInByb3Bvc2VkQVBJIiwib3B0aW9ucyIsIkRFRkFVTFRfQVBJIiwicGhldGlvRWxlbWVudHMiLCJwaGV0aW9GdWxsQVBJIiwicGhldGlvVHlwZXMiLCJPYmplY3RJTyIsImRvY3VtZW50YXRpb24iLCJldmVudHMiLCJtZXRhZGF0YURlZmF1bHRzIiwicGhldGlvQXJjaGV0eXBlUGhldGlvSUQiLCJwaGV0aW9EZXNpZ25lZCIsInBoZXRpb0RvY3VtZW50YXRpb24iLCJwaGV0aW9EeW5hbWljRWxlbWVudCIsInBoZXRpb0V2ZW50VHlwZSIsInBoZXRpb0ZlYXR1cmVkIiwicGhldGlvSGlnaEZyZXF1ZW5jeSIsInBoZXRpb0lzQXJjaGV0eXBlIiwicGhldGlvUGxheWJhY2siLCJwaGV0aW9SZWFkT25seSIsInBoZXRpb1N0YXRlIiwicGhldGlvVHlwZU5hbWUiLCJtZXRob2RPcmRlciIsIm1ldGhvZHMiLCJwYXJhbWV0ZXJUeXBlcyIsInN1cGVydHlwZSIsInR5cGVOYW1lIiwic2ltIiwidmVyc2lvbiIsIm1ham9yIiwibWlub3IiLCJ0ZXN0IiwiYXNzZXJ0IiwibWVyZ2UiLCJwaGV0aW9FbmdpbmUiLCJfbWV0YWRhdGEiLCJjbG9uZURlZXAiLCJyZXBvcnQiLCJvayIsImJyZWFraW5nUHJvYmxlbXMiLCJsZW5ndGgiLCJkZXNpZ25lZFByb2JsZW1zIiwiZGVzaWduZWRFbGVtZW50IiwiZGVzaWduZWRDaGlsZCIsIm90aGVyQ2hpbGQiLCJjb21wYXJlRGVzaWduZWRBUElDaGFuZ2VzIiwiY29tcGFyZUJyZWFraW5nQVBJQ2hhbmdlcyIsImJyZWFraW5nRWxlbWVudCIsInRlc3RNZXRhZGF0YUtleUNoYW5nZSIsIm1ldGFkYXRhS2V5IiwidmFsdWVUaGF0QnJlYWtzQVBJIiwibWV0YWRhdGFCcmVha2luZ0RhdGEiLCJ2YWx1ZSIsImZvckVhY2giLCJ0ZXN0RGF0YSIsInRocm93cyIsImtleSIsImFwaVN0YXRlS2V5cyIsImRhdGFEZWZhdWx0cyIsImdldFZhbGlkYXRpb25FcnJvciIsInJldHVyblR5cGUiLCJnZXRWYWx1ZSIsImxhenlMaW5rIiwibGluayIsInNldFZhbHVlIiwiaW52b2NhYmxlRm9yUmVhZE9ubHlFbGVtZW50cyIsInVubGluayIsInN0YXRlU2NoZW1hIiwidW5pdHMiLCJ2YWxpZFZhbHVlcyIsInByb3BlcnR5SU9FbnRyeSIsInB1c2giLCJzbGljZSJdLCJtYXBwaW5ncyI6IkFBQUEsc0RBQXNEO0FBRXREOztDQUVDLEdBRUQsT0FBT0EsT0FBTyxTQUFTO0FBQ3ZCLE9BQU9DLFdBQVcsd0RBQXdEO0FBRTFFLE9BQU9DLHVCQUFxRCwyQ0FBMkM7QUFFdkdELE1BQU1FLE1BQU0sQ0FBRTtBQUVkLE1BQU1DLHFCQUFxQixDQUFFQyxjQUF5QkMsYUFBd0JDO0lBQzVFLE9BQU9MLGtCQUFtQkcsY0FBY0MsYUFBYU4sR0FBR087QUFDMUQ7QUFFQSx5RUFBeUU7QUFDekUsTUFBTUMsY0FBYztJQUNsQkMsZ0JBQWdCLENBQUM7SUFDakJDLGVBQWU7SUFDZkMsYUFBYTtRQUNYQyxVQUFVO1lB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