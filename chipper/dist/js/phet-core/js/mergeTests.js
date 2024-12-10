// Copyright 2019-2024, University of Colorado Boulder
// @author Michael Kauzmann (PhET Interactive Simulations)
import Property from '../../axon/js/Property.js';
import EnumerationDeprecated from './EnumerationDeprecated.js';
import merge from './merge.js';
QUnit.module('merge');
// test proper merger for 2 objects
QUnit.test('merge two objects', (assert)=>{
    const original = {
        prop1: 'value1',
        prop2: 'value2',
        subcomponentOptions: {
            subProp1: 'subValue1',
            subProp2: 'subValue2'
        },
        subcomponentOptions2: {
            subSubcomponentOptions: {
                subSubProp1: 'subSubValue1'
            }
        },
        prop3: 'value3'
    };
    const merge1 = {
        subcomponentOptions: {
            subProp1: 'subvalue1 changed',
            subProp3: 'new subvalue'
        },
        subcomponentOptions2: {
            subSubcomponentOptions: {
                subSubProp1: 'all gone now',
                test: 'this is here too'
            }
        },
        prop3: 'new value3',
        prop4: 'value4'
    };
    const preMergeSourceCopy = Object.assign({}, merge1);
    const merged = merge(original, merge1);
    assert.equal(merged.prop1, 'value1', 'merge should not alter target keys that aren\'t in the source');
    assert.equal(merged.prop4, 'value4', 'merge should not alter source keys that aren\'t in the target');
    let shouldBe = {
        subProp1: 'subvalue1 changed',
        subProp2: 'subValue2',
        subProp3: 'new subvalue'
    };
    assert.deepEqual(merged.subcomponentOptions, shouldBe, 'merge should combine singly nested objects');
    shouldBe = {
        prop1: 'value1',
        prop2: 'value2',
        subcomponentOptions: {
            subProp1: 'subvalue1 changed',
            subProp3: 'new subvalue',
            subProp2: 'subValue2'
        },
        subcomponentOptions2: {
            subSubcomponentOptions: {
                subSubProp1: 'all gone now',
                test: 'this is here too'
            }
        },
        prop3: 'new value3',
        prop4: 'value4'
    };
    assert.deepEqual(merged, shouldBe, 'merge should combine arbitrarily nested objects');
    assert.deepEqual(merge1, preMergeSourceCopy, 'merge should not alter sources');
});
// test multiple objects
QUnit.test('test multiple objects', (assert)=>{
    const original = {
        prop1: 'value1',
        prop2: 'value2',
        subcomponentOptions: {
            subProp1: 'subValue1',
            subProp2: 'subValue2'
        },
        subcomponentOptions2: {
            subSubcomponentOptions: {
                subSubProp1: 'subSubValue1'
            }
        },
        prop3: 'value3'
    };
    const merge1 = {
        subcomponentOptions: {
            subProp1: 'subvalue1 changed',
            subProp3: 'new subvalue',
            except: 'me'
        },
        subcomponentOptions2: {
            subSubcomponentOptions: {
                subSubProp1: 'all gone now',
                test: 'this is here too'
            }
        },
        prop3: 'new value3',
        prop4: 'value4'
    };
    const merge2 = {
        prop5: 'value5',
        subcomponentOptions: {
            subProp1: 'everything',
            subProp2: 'here is',
            subProp3: 'from',
            subProp4: 'merge2'
        }
    };
    const merge3 = {
        prop6: 'value6',
        prop5: 'value5 from merge3',
        subcomponentOptions: {
            subProp5: 'BONJOUR'
        },
        subcomponentOptions2: {
            test2: [
                'test2',
                'test3'
            ],
            subSubcomponentOptions: {
                test: 'test form merge3',
                subSubProp1: 'subSub from merge3'
            }
        }
    };
    const merge1Copy = _.cloneDeep(merge1);
    const merge2Copy = _.cloneDeep(merge2);
    const merge3Copy = _.cloneDeep(merge3);
    Object.freeze(merge1);
    Object.freeze(merge2);
    Object.freeze(merge3);
    const merged = merge(original, merge1, merge2, merge3);
    const expected = {
        prop1: 'value1',
        prop2: 'value2',
        subcomponentOptions: {
            subProp1: 'everything',
            subProp2: 'here is',
            subProp3: 'from',
            subProp4: 'merge2',
            except: 'me',
            subProp5: 'BONJOUR'
        },
        subcomponentOptions2: {
            test2: [
                'test2',
                'test3'
            ],
            subSubcomponentOptions: {
                test: 'test form merge3',
                subSubProp1: 'subSub from merge3'
            }
        },
        prop3: 'new value3',
        prop4: 'value4',
        prop5: 'value5 from merge3',
        prop6: 'value6'
    };
    assert.notEqual(merged, expected, 'sanity check: ensure merged and expected objects are not the same reference');
    assert.deepEqual(merged, expected, 'merge should properly combine multiple objects');
    assert.deepEqual(merge1, merge1Copy, 'merge should not alter source objects');
    assert.deepEqual(merge2, merge2Copy, 'merge should not alter source objects');
    assert.deepEqual(merge3, merge3Copy, 'merge should not alter source objects');
});
// check that it errors loudly if something other than an object is used
QUnit.test('check for proper assertion errors', (assert)=>{
    const original = {
        subOptions: {
            test: 'val',
            test2: 'val2'
        }
    };
    const TestClass = class {
        constructor(){
            this.test = 'class';
        }
    };
    const merges = {
        a: {
            subOptions: [
                'val',
                'val2'
            ]
        },
        b: {
            subOptions: Object.create({
                test: 'a',
                test1: 3
            })
        },
        c: {
            subOptions: 'a string to test'
        },
        d: {
            subOptions: 42
        },
        e: {
            // @ts-expect-error
            subOptions: function() {
                this.a = 42;
            }
        },
        f: {
            subOptions: new TestClass()
        }
    };
    const getterMerge = {
        get subOptions () {
            return {
                test: 'should not work'
            };
        }
    };
    if (window.assert) {
        assert.throws(()=>merge(original, merges.a), 'merge should not allow arrays to be merged');
        assert.throws(()=>merge(original, merges.b), 'merge should not allow inherited objects to be merged');
        assert.throws(()=>merge(original, merges.f), 'merge should not allow instances to be merged');
        assert.throws(()=>merge(original, merges.c), 'merge should not allow strings to be merged');
        assert.throws(()=>merge(original, merges.d), 'merge should not allow numbers to be merged');
        assert.throws(()=>merge(original, merges.e), 'merge should not allow functions to be merged');
        assert.throws(()=>merge(original, getterMerge), 'merge should not work with getters');
        // @ts-expect-error INTENTIONAL
        assert.throws(()=>merge(original), 'merge should not work without a source');
    }
    assert.equal(1, 1, 'for no ?ea query param');
});
QUnit.test('check for reference level equality (e.g. for object literals, Properties, Enumerations)', (assert)=>{
    const testEnum = {
        A: {
            testA: 'valueA'
        },
        B: {
            testB: 'valueB'
        },
        C: {
            testC: 'valueC'
        }
    };
    const testProperty = {
        value: 42
    };
    const testProperty2 = {
        value: 'forty two'
    };
    const original = {
        prop: testProperty,
        nestedOptions: {
            needsAnEnum: testEnum.A,
            moreOptions: {
                needsAnEnum: testEnum.C
            }
        }
    };
    const merger = {
        prop: testProperty2,
        nestedOptions: {
            needsAnEnum: testEnum.B,
            moreOptions: {
                needsDifferentEnum: testEnum.A
            }
        }
    };
    const originalCopy = _.cloneDeep(original);
    Object.freeze(original);
    const mergedFresh = merge({}, original, merger);
    assert.equal(original.prop.value, originalCopy.prop.value, 'merge should not alter source object values');
    assert.ok(_.isEqual(original, originalCopy), 'merge should not alter source objects');
    assert.equal(mergedFresh.nestedOptions.needsAnEnum, testEnum.B, 'merge should preserve references to overwritten object literals');
    assert.equal(mergedFresh.nestedOptions.moreOptions.needsAnEnum, testEnum.C, 'merge should preserve object literals from target');
    assert.equal(mergedFresh.nestedOptions.moreOptions.needsDifferentEnum, testEnum.A, 'merge should preserve object literals from source');
    mergedFresh.prop.value = 'forty three';
    assert.equal(testProperty2.value, 'forty three', 'merge should pass object literal references');
    assert.equal(testProperty.value, 42, 'original object literal should be overwritten');
    const merged = merge({}, original, merger);
    assert.ok(merged.nestedOptions.needsAnEnum === testEnum.B, 'merge should preserve overwritten EnumerationDeprecated types');
    assert.ok(merged.nestedOptions.moreOptions.needsAnEnum === testEnum.C, 'merge should preserve EnumerationDeprecated types from target');
    assert.ok(merged.nestedOptions.moreOptions.needsDifferentEnum === testEnum.A, 'merge should preserve EnumerationDeprecated types from source');
});
QUnit.test('try a horribly nested case', (assert)=>{
    const original = {
        p1Options: {
            n1Options: {
                n2Options: {
                    n3Options: {
                        n4Options: {
                            n5: 'overwrite me'
                        }
                    }
                }
            }
        },
        p2Options: {
            n1Options: {
                p3: 'keep me'
            }
        }
    };
    const merge1 = {
        p1Options: {
            n1Options: {
                n2Options: {
                    n3Options: {
                        n4Options: {
                            n5: 'overwritten'
                        }
                    }
                }
            }
        },
        p2Options: {
            n1Options: {
                p4: 'p3 kept',
                n2Options: {
                    n3Options: {
                        n4Options: {
                            n5Options: {
                                n6Options: {
                                    p5: 'never make options like this'
                                }
                            }
                        }
                    }
                }
            }
        }
    };
    Object.freeze(merge1);
    const merged = merge(original, merge1);
    const expected = {
        p1Options: {
            n1Options: {
                n2Options: {
                    n3Options: {
                        n4Options: {
                            n5: 'overwritten'
                        }
                    }
                }
            }
        },
        p2Options: {
            n1Options: {
                p3: 'keep me',
                p4: 'p3 kept',
                n2Options: {
                    n3Options: {
                        n4Options: {
                            n5Options: {
                                n6Options: {
                                    p5: 'never make options like this'
                                }
                            }
                        }
                    }
                }
            }
        }
    };
    assert.deepEqual(merged, expected, 'merge should handle some deeply nested stuff');
});
QUnit.test('minor change', (assert)=>{
    const a = {
        sliderOptions: {
            hello: 'there'
        }
    };
    const b = {
        sliderOptions: {
            time: 'now'
        }
    };
    merge({}, a, b);
    assert.ok(!a.sliderOptions.hasOwnProperty('time'), 'time shouldnt leak over to a');
});
QUnit.test('test wrong args', (assert)=>{
    if (window.assert) {
        // in first arg
        assert.throws(()=>merge(undefined, {}), 'unsupported first arg "undefined"');
        assert.throws(()=>merge(null, {}), 'unsupported arg "null"');
        assert.throws(()=>merge(true, {}), 'unsupported arg "boolean"');
        assert.throws(()=>merge('hello', {}), 'unsupported arg "string"');
        assert.throws(()=>merge(4, {}), 'unsupported arg "number"');
        assert.throws(()=>merge(Image, {}), 'unsupported arg of Object with extra prototype');
        assert.throws(()=>merge({
                get hi () {
                    return 3;
                }
            }, {}), 'unsupported arg with getter');
        assert.throws(()=>merge({
                set hi (stuff){}
            }, {}), 'unsupported arg with setter');
        // in second arg
        assert.throws(()=>merge({}, true, {}), 'unsupported second arg "boolean"');
        assert.throws(()=>merge({}, 'hello', {}), 'unsupported second arg "string"');
        assert.throws(()=>merge({}, 4, {}), 'unsupported second arg "number"');
        assert.throws(()=>merge({}, Image, {}), 'unsupported second arg of Object with extra prototype');
        assert.throws(()=>merge({}, {
                get hi () {
                    return 3;
                }
            }, {}), 'unsupported second arg with getter');
        assert.throws(()=>merge({}, {
                set hi (stuff){}
            }, {}), 'unsupported second arg with setter');
        // in second arg with no third object
        assert.throws(()=>merge({}, true), 'unsupported second arg with no third "boolean"');
        assert.throws(()=>merge({}, 'hello'), 'unsupported second arg with no third "string"');
        assert.throws(()=>merge({}, 4), 'unsupported second arg with no third "number"');
        assert.throws(()=>merge({}, Image), 'unsupported second arg with no third of Object with extra prototype');
        assert.throws(()=>merge({}, {
                get hi () {
                    return 3;
                }
            }), 'unsupported second arg with no third with getter');
        assert.throws(()=>merge({}, {
                set hi (stuff){}
            }), 'unsupported second arg with no third with getter');
        // in some options
        assert.throws(()=>merge({}, {
                someOptions: true
            }, {}), 'unsupported arg in options "boolean"');
        assert.throws(()=>merge({}, {
                someOptions: 'hello'
            }, {}), 'unsupported arg in options "string"');
        assert.throws(()=>merge({}, {
                someOptions: 4
            }, {}), 'unsupported arg in options "number"');
        assert.throws(()=>merge({}, {
                someOptions: Image
            }, {}), 'unsupported arg in options of Object with extra prototype');
        assert.throws(()=>merge({}, {
                someOptions: {
                    get hi () {
                        return 3;
                    }
                }
            }, {}), 'unsupported arg in options with getter');
        assert.throws(()=>merge({}, {
                someOptions: {
                    set hi (stuff){}
                }
            }, {}), 'unsupported arg in options with getter');
    } else {
        assert.ok(true, 'no assertions enabled');
    }
    // allowed cases that should not error
    merge({}, null, {});
    merge({}, null);
    merge({}, {}, null);
    merge({
        xOptions: {
            test: 1
        }
    }, {
        xOptions: null
    });
    merge({}, {
        someOptions: null
    }, {});
    merge({}, {
        someOptions: undefined
    }, {});
});
QUnit.test('do not recurse for non *Options', (assert)=>{
    const testFirstProperty = new Property('hi');
    const testSecondProperty = new Property('hi2');
    const TestEnumeration = EnumerationDeprecated.byKeys([
        'ONE',
        'TWO'
    ]);
    const TestEnumeration2 = EnumerationDeprecated.byKeys([
        'ONE1',
        'TWO2'
    ]);
    const original = {
        prop: testFirstProperty,
        enum: TestEnumeration,
        someOptions: {
            nestedProp: testFirstProperty
        }
    };
    let newObject = merge({}, original);
    assert.ok(_.isEqual(original, newObject), 'should be equal from reference equality');
    assert.ok(original.prop === newObject.prop, 'same Property');
    assert.ok(original.enum === newObject.enum, 'same EnumerationDeprecated');
    // test defaults with other non mergeable objects
    newObject = merge({
        prop: testSecondProperty,
        enum: TestEnumeration2,
        someOptions: {
            nestedProp: testSecondProperty
        }
    }, original);
    assert.ok(_.isEqual(original, newObject), 'should be equal');
    assert.ok(original.prop === newObject.prop, 'same Property, ignore default');
    assert.ok(original.enum === newObject.enum, 'same EnumerationDeprecated, ignore default');
});
QUnit.test('support optional options', (assert)=>{
    const mergeXYZ = (options)=>{
        return merge({
            x: 1,
            y: 2,
            z: 3
        }, options);
    };
    const noOptions = mergeXYZ();
    assert.ok(noOptions.x === 1, 'x property should be merged from default');
    assert.ok(noOptions.y === 2, 'y property should be merged from default');
    assert.ok(noOptions.z === 3, 'z property should be merged from default');
    const testNestedFunctionCallOptions = (options)=>{
        return mergeXYZ(merge({
            x: 2,
            g: 54,
            treeSays: 'hello'
        }, options));
    };
    const noOptions2 = testNestedFunctionCallOptions();
    assert.ok(noOptions2.x === 2, 'x property should be merged from default');
    assert.ok(noOptions2.y === 2, 'y property should be merged from default');
    assert.ok(noOptions2.z === 3, 'z property should be merged from default');
    assert.ok(noOptions2.g === 54, 'g property should be merged from default');
    assert.ok(noOptions2.treeSays === 'hello', 'property should be merged from default');
});
QUnit.test('does not support deep equals on keyname of "Options"', (assert)=>{
    const referenceObject = {
        hello: 2
    };
    const merged = merge({}, {
        Options: referenceObject
    });
    const deepMerged = merge({}, {
        someOptions: referenceObject
    });
    assert.ok(merged.Options === referenceObject, '"Options" should not deep equal');
    referenceObject.hello = 3;
    assert.ok(merged.Options.hello === 3, 'value should change because it is a reference');
    assert.ok(deepMerged.someOptions.hello === 2, 'value should not change because it was deep copied');
});

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9tZXJnZVRlc3RzLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE5LTIwMjQsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuLy8gQGF1dGhvciBNaWNoYWVsIEthdXptYW5uIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxuXG5cbmltcG9ydCBQcm9wZXJ0eSBmcm9tICcuLi8uLi9heG9uL2pzL1Byb3BlcnR5LmpzJztcbmltcG9ydCBFbnVtZXJhdGlvbkRlcHJlY2F0ZWQgZnJvbSAnLi9FbnVtZXJhdGlvbkRlcHJlY2F0ZWQuanMnO1xuaW1wb3J0IG1lcmdlIGZyb20gJy4vbWVyZ2UuanMnO1xuaW1wb3J0IEludGVudGlvbmFsQW55IGZyb20gJy4vdHlwZXMvSW50ZW50aW9uYWxBbnkuanMnO1xuXG5RVW5pdC5tb2R1bGUoICdtZXJnZScgKTtcblxuLy8gdGVzdCBwcm9wZXIgbWVyZ2VyIGZvciAyIG9iamVjdHNcblFVbml0LnRlc3QoICdtZXJnZSB0d28gb2JqZWN0cycsIGFzc2VydCA9PiB7XG4gIGNvbnN0IG9yaWdpbmFsID0ge1xuICAgIHByb3AxOiAndmFsdWUxJyxcbiAgICBwcm9wMjogJ3ZhbHVlMicsXG4gICAgc3ViY29tcG9uZW50T3B0aW9uczoge1xuICAgICAgc3ViUHJvcDE6ICdzdWJWYWx1ZTEnLFxuICAgICAgc3ViUHJvcDI6ICdzdWJWYWx1ZTInXG4gICAgfSxcbiAgICBzdWJjb21wb25lbnRPcHRpb25zMjoge1xuICAgICAgc3ViU3ViY29tcG9uZW50T3B0aW9uczoge1xuICAgICAgICBzdWJTdWJQcm9wMTogJ3N1YlN1YlZhbHVlMSdcbiAgICAgIH1cbiAgICB9LFxuICAgIHByb3AzOiAndmFsdWUzJ1xuICB9O1xuXG4gIGNvbnN0IG1lcmdlMSA9IHtcbiAgICBzdWJjb21wb25lbnRPcHRpb25zOiB7XG4gICAgICBzdWJQcm9wMTogJ3N1YnZhbHVlMSBjaGFuZ2VkJyxcbiAgICAgIHN1YlByb3AzOiAnbmV3IHN1YnZhbHVlJ1xuICAgIH0sXG4gICAgc3ViY29tcG9uZW50T3B0aW9uczI6IHtcbiAgICAgIHN1YlN1YmNvbXBvbmVudE9wdGlvbnM6IHtcbiAgICAgICAgc3ViU3ViUHJvcDE6ICdhbGwgZ29uZSBub3cnLFxuICAgICAgICB0ZXN0OiAndGhpcyBpcyBoZXJlIHRvbydcbiAgICAgIH1cbiAgICB9LFxuICAgIHByb3AzOiAnbmV3IHZhbHVlMycsXG4gICAgcHJvcDQ6ICd2YWx1ZTQnXG4gIH07XG4gIGNvbnN0IHByZU1lcmdlU291cmNlQ29weSA9IE9iamVjdC5hc3NpZ24oIHt9LCBtZXJnZTEgKTtcbiAgY29uc3QgbWVyZ2VkID0gbWVyZ2UoIG9yaWdpbmFsLCBtZXJnZTEgKTtcblxuICBhc3NlcnQuZXF1YWwoIG1lcmdlZC5wcm9wMSwgJ3ZhbHVlMScsICdtZXJnZSBzaG91bGQgbm90IGFsdGVyIHRhcmdldCBrZXlzIHRoYXQgYXJlblxcJ3QgaW4gdGhlIHNvdXJjZScgKTtcbiAgYXNzZXJ0LmVxdWFsKCBtZXJnZWQucHJvcDQsICd2YWx1ZTQnLCAnbWVyZ2Ugc2hvdWxkIG5vdCBhbHRlciBzb3VyY2Uga2V5cyB0aGF0IGFyZW5cXCd0IGluIHRoZSB0YXJnZXQnICk7XG5cbiAgbGV0IHNob3VsZEJlOiBJbnRlbnRpb25hbEFueSA9IHtcbiAgICBzdWJQcm9wMTogJ3N1YnZhbHVlMSBjaGFuZ2VkJyxcbiAgICBzdWJQcm9wMjogJ3N1YlZhbHVlMicsXG4gICAgc3ViUHJvcDM6ICduZXcgc3VidmFsdWUnXG4gIH07XG4gIGFzc2VydC5kZWVwRXF1YWwoIG1lcmdlZC5zdWJjb21wb25lbnRPcHRpb25zLCBzaG91bGRCZSwgJ21lcmdlIHNob3VsZCBjb21iaW5lIHNpbmdseSBuZXN0ZWQgb2JqZWN0cycgKTtcblxuICBzaG91bGRCZSA9IHtcbiAgICBwcm9wMTogJ3ZhbHVlMScsXG4gICAgcHJvcDI6ICd2YWx1ZTInLFxuICAgIHN1YmNvbXBvbmVudE9wdGlvbnM6IHtcbiAgICAgIHN1YlByb3AxOiAnc3VidmFsdWUxIGNoYW5nZWQnLFxuICAgICAgc3ViUHJvcDM6ICduZXcgc3VidmFsdWUnLFxuICAgICAgc3ViUHJvcDI6ICdzdWJWYWx1ZTInXG4gICAgfSxcbiAgICBzdWJjb21wb25lbnRPcHRpb25zMjoge1xuICAgICAgc3ViU3ViY29tcG9uZW50T3B0aW9uczoge1xuICAgICAgICBzdWJTdWJQcm9wMTogJ2FsbCBnb25lIG5vdycsXG4gICAgICAgIHRlc3Q6ICd0aGlzIGlzIGhlcmUgdG9vJ1xuICAgICAgfVxuICAgIH0sXG4gICAgcHJvcDM6ICduZXcgdmFsdWUzJyxcbiAgICBwcm9wNDogJ3ZhbHVlNCdcbiAgfTtcbiAgYXNzZXJ0LmRlZXBFcXVhbCggbWVyZ2VkLCBzaG91bGRCZSwgJ21lcmdlIHNob3VsZCBjb21iaW5lIGFyYml0cmFyaWx5IG5lc3RlZCBvYmplY3RzJyApO1xuICBhc3NlcnQuZGVlcEVxdWFsKCBtZXJnZTEsIHByZU1lcmdlU291cmNlQ29weSwgJ21lcmdlIHNob3VsZCBub3QgYWx0ZXIgc291cmNlcycgKTtcbn0gKTtcblxuLy8gdGVzdCBtdWx0aXBsZSBvYmplY3RzXG5RVW5pdC50ZXN0KCAndGVzdCBtdWx0aXBsZSBvYmplY3RzJywgYXNzZXJ0ID0+IHtcbiAgY29uc3Qgb3JpZ2luYWwgPSB7XG4gICAgcHJvcDE6ICd2YWx1ZTEnLFxuICAgIHByb3AyOiAndmFsdWUyJyxcbiAgICBzdWJjb21wb25lbnRPcHRpb25zOiB7XG4gICAgICBzdWJQcm9wMTogJ3N1YlZhbHVlMScsXG4gICAgICBzdWJQcm9wMjogJ3N1YlZhbHVlMidcbiAgICB9LFxuICAgIHN1YmNvbXBvbmVudE9wdGlvbnMyOiB7XG4gICAgICBzdWJTdWJjb21wb25lbnRPcHRpb25zOiB7XG4gICAgICAgIHN1YlN1YlByb3AxOiAnc3ViU3ViVmFsdWUxJ1xuICAgICAgfVxuICAgIH0sXG4gICAgcHJvcDM6ICd2YWx1ZTMnXG4gIH07XG5cbiAgY29uc3QgbWVyZ2UxID0ge1xuICAgIHN1YmNvbXBvbmVudE9wdGlvbnM6IHtcbiAgICAgIHN1YlByb3AxOiAnc3VidmFsdWUxIGNoYW5nZWQnLFxuICAgICAgc3ViUHJvcDM6ICduZXcgc3VidmFsdWUnLFxuICAgICAgZXhjZXB0OiAnbWUnXG4gICAgfSxcbiAgICBzdWJjb21wb25lbnRPcHRpb25zMjoge1xuICAgICAgc3ViU3ViY29tcG9uZW50T3B0aW9uczoge1xuICAgICAgICBzdWJTdWJQcm9wMTogJ2FsbCBnb25lIG5vdycsXG4gICAgICAgIHRlc3Q6ICd0aGlzIGlzIGhlcmUgdG9vJ1xuICAgICAgfVxuICAgIH0sXG4gICAgcHJvcDM6ICduZXcgdmFsdWUzJyxcbiAgICBwcm9wNDogJ3ZhbHVlNCdcbiAgfTtcblxuICBjb25zdCBtZXJnZTIgPSB7XG4gICAgcHJvcDU6ICd2YWx1ZTUnLFxuICAgIHN1YmNvbXBvbmVudE9wdGlvbnM6IHtcbiAgICAgIHN1YlByb3AxOiAnZXZlcnl0aGluZycsXG4gICAgICBzdWJQcm9wMjogJ2hlcmUgaXMnLFxuICAgICAgc3ViUHJvcDM6ICdmcm9tJyxcbiAgICAgIHN1YlByb3A0OiAnbWVyZ2UyJ1xuICAgIH1cbiAgfTtcblxuICBjb25zdCBtZXJnZTMgPSB7XG4gICAgcHJvcDY6ICd2YWx1ZTYnLFxuICAgIHByb3A1OiAndmFsdWU1IGZyb20gbWVyZ2UzJyxcbiAgICBzdWJjb21wb25lbnRPcHRpb25zOiB7XG4gICAgICBzdWJQcm9wNTogJ0JPTkpPVVInXG4gICAgfSxcbiAgICBzdWJjb21wb25lbnRPcHRpb25zMjoge1xuICAgICAgdGVzdDI6IFsgJ3Rlc3QyJywgJ3Rlc3QzJyBdLFxuICAgICAgc3ViU3ViY29tcG9uZW50T3B0aW9uczoge1xuICAgICAgICB0ZXN0OiAndGVzdCBmb3JtIG1lcmdlMycsXG4gICAgICAgIHN1YlN1YlByb3AxOiAnc3ViU3ViIGZyb20gbWVyZ2UzJ1xuICAgICAgfVxuICAgIH1cbiAgfTtcbiAgY29uc3QgbWVyZ2UxQ29weSA9IF8uY2xvbmVEZWVwKCBtZXJnZTEgKTtcbiAgY29uc3QgbWVyZ2UyQ29weSA9IF8uY2xvbmVEZWVwKCBtZXJnZTIgKTtcbiAgY29uc3QgbWVyZ2UzQ29weSA9IF8uY2xvbmVEZWVwKCBtZXJnZTMgKTtcblxuICBPYmplY3QuZnJlZXplKCBtZXJnZTEgKTtcbiAgT2JqZWN0LmZyZWV6ZSggbWVyZ2UyICk7XG4gIE9iamVjdC5mcmVlemUoIG1lcmdlMyApO1xuICBjb25zdCBtZXJnZWQgPSBtZXJnZSggb3JpZ2luYWwsIG1lcmdlMSwgbWVyZ2UyLCBtZXJnZTMgKTtcblxuICBjb25zdCBleHBlY3RlZCA9IHtcbiAgICBwcm9wMTogJ3ZhbHVlMScsXG4gICAgcHJvcDI6ICd2YWx1ZTInLFxuICAgIHN1YmNvbXBvbmVudE9wdGlvbnM6IHtcbiAgICAgIHN1YlByb3AxOiAnZXZlcnl0aGluZycsXG4gICAgICBzdWJQcm9wMjogJ2hlcmUgaXMnLFxuICAgICAgc3ViUHJvcDM6ICdmcm9tJyxcbiAgICAgIHN1YlByb3A0OiAnbWVyZ2UyJyxcbiAgICAgIGV4Y2VwdDogJ21lJyxcbiAgICAgIHN1YlByb3A1OiAnQk9OSk9VUidcbiAgICB9LFxuICAgIHN1YmNvbXBvbmVudE9wdGlvbnMyOiB7XG4gICAgICB0ZXN0MjogWyAndGVzdDInLCAndGVzdDMnIF0sXG4gICAgICBzdWJTdWJjb21wb25lbnRPcHRpb25zOiB7XG4gICAgICAgIHRlc3Q6ICd0ZXN0IGZvcm0gbWVyZ2UzJyxcbiAgICAgICAgc3ViU3ViUHJvcDE6ICdzdWJTdWIgZnJvbSBtZXJnZTMnXG4gICAgICB9XG4gICAgfSxcbiAgICBwcm9wMzogJ25ldyB2YWx1ZTMnLFxuICAgIHByb3A0OiAndmFsdWU0JyxcbiAgICBwcm9wNTogJ3ZhbHVlNSBmcm9tIG1lcmdlMycsXG4gICAgcHJvcDY6ICd2YWx1ZTYnXG4gIH07XG4gIGFzc2VydC5ub3RFcXVhbCggbWVyZ2VkLCBleHBlY3RlZCwgJ3Nhbml0eSBjaGVjazogZW5zdXJlIG1lcmdlZCBhbmQgZXhwZWN0ZWQgb2JqZWN0cyBhcmUgbm90IHRoZSBzYW1lIHJlZmVyZW5jZScgKTtcbiAgYXNzZXJ0LmRlZXBFcXVhbCggbWVyZ2VkLCBleHBlY3RlZCwgJ21lcmdlIHNob3VsZCBwcm9wZXJseSBjb21iaW5lIG11bHRpcGxlIG9iamVjdHMnICk7XG4gIGFzc2VydC5kZWVwRXF1YWwoIG1lcmdlMSwgbWVyZ2UxQ29weSwgJ21lcmdlIHNob3VsZCBub3QgYWx0ZXIgc291cmNlIG9iamVjdHMnICk7XG4gIGFzc2VydC5kZWVwRXF1YWwoIG1lcmdlMiwgbWVyZ2UyQ29weSwgJ21lcmdlIHNob3VsZCBub3QgYWx0ZXIgc291cmNlIG9iamVjdHMnICk7XG4gIGFzc2VydC5kZWVwRXF1YWwoIG1lcmdlMywgbWVyZ2UzQ29weSwgJ21lcmdlIHNob3VsZCBub3QgYWx0ZXIgc291cmNlIG9iamVjdHMnICk7XG59ICk7XG5cbi8vIGNoZWNrIHRoYXQgaXQgZXJyb3JzIGxvdWRseSBpZiBzb21ldGhpbmcgb3RoZXIgdGhhbiBhbiBvYmplY3QgaXMgdXNlZFxuUVVuaXQudGVzdCggJ2NoZWNrIGZvciBwcm9wZXIgYXNzZXJ0aW9uIGVycm9ycycsIGFzc2VydCA9PiB7XG4gIGNvbnN0IG9yaWdpbmFsID0ge1xuICAgIHN1Yk9wdGlvbnM6IHtcbiAgICAgIHRlc3Q6ICd2YWwnLFxuICAgICAgdGVzdDI6ICd2YWwyJ1xuICAgIH1cbiAgfTtcblxuICBjb25zdCBUZXN0Q2xhc3MgPSBjbGFzcyB7XG4gICAgcHJpdmF0ZSB0ZXN0OiBzdHJpbmc7XG5cbiAgICBwdWJsaWMgY29uc3RydWN0b3IoKSB7XG4gICAgICB0aGlzLnRlc3QgPSAnY2xhc3MnO1xuICAgIH1cbiAgfTtcblxuICBjb25zdCBtZXJnZXMgPSB7XG4gICAgYToge1xuICAgICAgc3ViT3B0aW9uczogWyAndmFsJywgJ3ZhbDInIF1cbiAgICB9LFxuICAgIGI6IHtcbiAgICAgIHN1Yk9wdGlvbnM6IE9iamVjdC5jcmVhdGUoIHsgdGVzdDogJ2EnLCB0ZXN0MTogMyB9IClcbiAgICB9LFxuICAgIGM6IHtcbiAgICAgIHN1Yk9wdGlvbnM6ICdhIHN0cmluZyB0byB0ZXN0J1xuICAgIH0sXG4gICAgZDoge1xuICAgICAgc3ViT3B0aW9uczogNDJcbiAgICB9LFxuICAgIGU6IHtcbiAgICAgIC8vIEB0cy1leHBlY3QtZXJyb3JcbiAgICAgIHN1Yk9wdGlvbnM6IGZ1bmN0aW9uKCkgeyB0aGlzLmEgPSA0MjsgfVxuICAgIH0sXG4gICAgZjoge1xuICAgICAgc3ViT3B0aW9uczogbmV3IFRlc3RDbGFzcygpXG4gICAgfVxuICB9O1xuXG4gIGNvbnN0IGdldHRlck1lcmdlID0ge1xuICAgIGdldCBzdWJPcHRpb25zKCkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgdGVzdDogJ3Nob3VsZCBub3Qgd29yaydcbiAgICAgIH07XG4gICAgfVxuICB9O1xuXG4gIGlmICggd2luZG93LmFzc2VydCApIHtcbiAgICBhc3NlcnQudGhyb3dzKCAoKSA9PiBtZXJnZSggb3JpZ2luYWwsIG1lcmdlcy5hICksICdtZXJnZSBzaG91bGQgbm90IGFsbG93IGFycmF5cyB0byBiZSBtZXJnZWQnICk7XG4gICAgYXNzZXJ0LnRocm93cyggKCkgPT4gbWVyZ2UoIG9yaWdpbmFsLCBtZXJnZXMuYiApLCAnbWVyZ2Ugc2hvdWxkIG5vdCBhbGxvdyBpbmhlcml0ZWQgb2JqZWN0cyB0byBiZSBtZXJnZWQnICk7XG4gICAgYXNzZXJ0LnRocm93cyggKCkgPT4gbWVyZ2UoIG9yaWdpbmFsLCBtZXJnZXMuZiApLCAnbWVyZ2Ugc2hvdWxkIG5vdCBhbGxvdyBpbnN0YW5jZXMgdG8gYmUgbWVyZ2VkJyApO1xuICAgIGFzc2VydC50aHJvd3MoICgpID0+IG1lcmdlKCBvcmlnaW5hbCwgbWVyZ2VzLmMgKSwgJ21lcmdlIHNob3VsZCBub3QgYWxsb3cgc3RyaW5ncyB0byBiZSBtZXJnZWQnICk7XG4gICAgYXNzZXJ0LnRocm93cyggKCkgPT4gbWVyZ2UoIG9yaWdpbmFsLCBtZXJnZXMuZCApLCAnbWVyZ2Ugc2hvdWxkIG5vdCBhbGxvdyBudW1iZXJzIHRvIGJlIG1lcmdlZCcgKTtcbiAgICBhc3NlcnQudGhyb3dzKCAoKSA9PiBtZXJnZSggb3JpZ2luYWwsIG1lcmdlcy5lICksICdtZXJnZSBzaG91bGQgbm90IGFsbG93IGZ1bmN0aW9ucyB0byBiZSBtZXJnZWQnICk7XG4gICAgYXNzZXJ0LnRocm93cyggKCkgPT4gbWVyZ2UoIG9yaWdpbmFsLCBnZXR0ZXJNZXJnZSApLCAnbWVyZ2Ugc2hvdWxkIG5vdCB3b3JrIHdpdGggZ2V0dGVycycgKTtcblxuICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgSU5URU5USU9OQUxcbiAgICBhc3NlcnQudGhyb3dzKCAoKSA9PiBtZXJnZSggb3JpZ2luYWwgKSwgJ21lcmdlIHNob3VsZCBub3Qgd29yayB3aXRob3V0IGEgc291cmNlJyApO1xuICB9XG4gIGFzc2VydC5lcXVhbCggMSwgMSwgJ2ZvciBubyA/ZWEgcXVlcnkgcGFyYW0nICk7XG59ICk7XG5cblFVbml0LnRlc3QoICdjaGVjayBmb3IgcmVmZXJlbmNlIGxldmVsIGVxdWFsaXR5IChlLmcuIGZvciBvYmplY3QgbGl0ZXJhbHMsIFByb3BlcnRpZXMsIEVudW1lcmF0aW9ucyknLCBhc3NlcnQgPT4ge1xuICBjb25zdCB0ZXN0RW51bSA9IHtcbiAgICBBOiB7XG4gICAgICB0ZXN0QTogJ3ZhbHVlQSdcbiAgICB9LFxuICAgIEI6IHtcbiAgICAgIHRlc3RCOiAndmFsdWVCJ1xuICAgIH0sXG4gICAgQzoge1xuICAgICAgdGVzdEM6ICd2YWx1ZUMnXG4gICAgfVxuICB9O1xuXG4gIHR5cGUgVmFsdWVhYmxlID0geyB2YWx1ZTogbnVtYmVyIHwgc3RyaW5nIH07XG4gIGNvbnN0IHRlc3RQcm9wZXJ0eTogVmFsdWVhYmxlID0geyB2YWx1ZTogNDIgfTtcbiAgY29uc3QgdGVzdFByb3BlcnR5MjogVmFsdWVhYmxlID0geyB2YWx1ZTogJ2ZvcnR5IHR3bycgfTtcbiAgY29uc3Qgb3JpZ2luYWwgPSB7XG4gICAgcHJvcDogdGVzdFByb3BlcnR5LFxuICAgIG5lc3RlZE9wdGlvbnM6IHtcbiAgICAgIG5lZWRzQW5FbnVtOiB0ZXN0RW51bS5BLFxuICAgICAgbW9yZU9wdGlvbnM6IHtcbiAgICAgICAgbmVlZHNBbkVudW06IHRlc3RFbnVtLkNcbiAgICAgIH1cbiAgICB9XG4gIH07XG4gIGNvbnN0IG1lcmdlciA9IHtcbiAgICBwcm9wOiB0ZXN0UHJvcGVydHkyLFxuICAgIG5lc3RlZE9wdGlvbnM6IHtcbiAgICAgIG5lZWRzQW5FbnVtOiB0ZXN0RW51bS5CLFxuICAgICAgbW9yZU9wdGlvbnM6IHtcbiAgICAgICAgbmVlZHNEaWZmZXJlbnRFbnVtOiB0ZXN0RW51bS5BXG4gICAgICB9XG4gICAgfVxuICB9O1xuICBjb25zdCBvcmlnaW5hbENvcHkgPSBfLmNsb25lRGVlcCggb3JpZ2luYWwgKTtcbiAgT2JqZWN0LmZyZWV6ZSggb3JpZ2luYWwgKTtcbiAgY29uc3QgbWVyZ2VkRnJlc2ggPSBtZXJnZSgge30sIG9yaWdpbmFsLCBtZXJnZXIgKTtcbiAgYXNzZXJ0LmVxdWFsKCBvcmlnaW5hbC5wcm9wLnZhbHVlLCBvcmlnaW5hbENvcHkucHJvcC52YWx1ZSwgJ21lcmdlIHNob3VsZCBub3QgYWx0ZXIgc291cmNlIG9iamVjdCB2YWx1ZXMnICk7XG4gIGFzc2VydC5vayggXy5pc0VxdWFsKCBvcmlnaW5hbCwgb3JpZ2luYWxDb3B5ICksICdtZXJnZSBzaG91bGQgbm90IGFsdGVyIHNvdXJjZSBvYmplY3RzJyApO1xuICBhc3NlcnQuZXF1YWwoIG1lcmdlZEZyZXNoLm5lc3RlZE9wdGlvbnMubmVlZHNBbkVudW0sIHRlc3RFbnVtLkIsICdtZXJnZSBzaG91bGQgcHJlc2VydmUgcmVmZXJlbmNlcyB0byBvdmVyd3JpdHRlbiBvYmplY3QgbGl0ZXJhbHMnICk7XG4gIGFzc2VydC5lcXVhbCggbWVyZ2VkRnJlc2gubmVzdGVkT3B0aW9ucy5tb3JlT3B0aW9ucy5uZWVkc0FuRW51bSwgdGVzdEVudW0uQywgJ21lcmdlIHNob3VsZCBwcmVzZXJ2ZSBvYmplY3QgbGl0ZXJhbHMgZnJvbSB0YXJnZXQnICk7XG4gIGFzc2VydC5lcXVhbCggbWVyZ2VkRnJlc2gubmVzdGVkT3B0aW9ucy5tb3JlT3B0aW9ucy5uZWVkc0RpZmZlcmVudEVudW0sIHRlc3RFbnVtLkEsICdtZXJnZSBzaG91bGQgcHJlc2VydmUgb2JqZWN0IGxpdGVyYWxzIGZyb20gc291cmNlJyApO1xuICBtZXJnZWRGcmVzaC5wcm9wLnZhbHVlID0gJ2ZvcnR5IHRocmVlJztcbiAgYXNzZXJ0LmVxdWFsKCB0ZXN0UHJvcGVydHkyLnZhbHVlLCAnZm9ydHkgdGhyZWUnLCAnbWVyZ2Ugc2hvdWxkIHBhc3Mgb2JqZWN0IGxpdGVyYWwgcmVmZXJlbmNlcycgKTtcbiAgYXNzZXJ0LmVxdWFsKCB0ZXN0UHJvcGVydHkudmFsdWUsIDQyLCAnb3JpZ2luYWwgb2JqZWN0IGxpdGVyYWwgc2hvdWxkIGJlIG92ZXJ3cml0dGVuJyApO1xuXG4gIGNvbnN0IG1lcmdlZCA9IG1lcmdlKCB7fSwgb3JpZ2luYWwsIG1lcmdlciApO1xuICBhc3NlcnQub2soIG1lcmdlZC5uZXN0ZWRPcHRpb25zLm5lZWRzQW5FbnVtID09PSB0ZXN0RW51bS5CLCAnbWVyZ2Ugc2hvdWxkIHByZXNlcnZlIG92ZXJ3cml0dGVuIEVudW1lcmF0aW9uRGVwcmVjYXRlZCB0eXBlcycgKTtcbiAgYXNzZXJ0Lm9rKCBtZXJnZWQubmVzdGVkT3B0aW9ucy5tb3JlT3B0aW9ucy5uZWVkc0FuRW51bSA9PT0gdGVzdEVudW0uQywgJ21lcmdlIHNob3VsZCBwcmVzZXJ2ZSBFbnVtZXJhdGlvbkRlcHJlY2F0ZWQgdHlwZXMgZnJvbSB0YXJnZXQnICk7XG4gIGFzc2VydC5vayggbWVyZ2VkLm5lc3RlZE9wdGlvbnMubW9yZU9wdGlvbnMubmVlZHNEaWZmZXJlbnRFbnVtID09PSB0ZXN0RW51bS5BLCAnbWVyZ2Ugc2hvdWxkIHByZXNlcnZlIEVudW1lcmF0aW9uRGVwcmVjYXRlZCB0eXBlcyBmcm9tIHNvdXJjZScgKTtcbn0gKTtcblxuUVVuaXQudGVzdCggJ3RyeSBhIGhvcnJpYmx5IG5lc3RlZCBjYXNlJywgYXNzZXJ0ID0+IHtcbiAgY29uc3Qgb3JpZ2luYWwgPSB7XG4gICAgcDFPcHRpb25zOiB7IG4xT3B0aW9uczogeyBuMk9wdGlvbnM6IHsgbjNPcHRpb25zOiB7IG40T3B0aW9uczogeyBuNTogJ292ZXJ3cml0ZSBtZScgfSB9IH0gfSB9LFxuICAgIHAyT3B0aW9uczoge1xuICAgICAgbjFPcHRpb25zOiB7XG4gICAgICAgIHAzOiAna2VlcCBtZSdcbiAgICAgIH1cbiAgICB9XG4gIH07XG4gIGNvbnN0IG1lcmdlMSA9IHtcbiAgICBwMU9wdGlvbnM6IHtcbiAgICAgIG4xT3B0aW9uczoge1xuICAgICAgICBuMk9wdGlvbnM6IHtcbiAgICAgICAgICBuM09wdGlvbnM6IHtcbiAgICAgICAgICAgIG40T3B0aW9uczoge1xuICAgICAgICAgICAgICBuNTogJ292ZXJ3cml0dGVuJ1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sXG4gICAgcDJPcHRpb25zOiB7XG4gICAgICBuMU9wdGlvbnM6IHtcbiAgICAgICAgcDQ6ICdwMyBrZXB0JyxcbiAgICAgICAgbjJPcHRpb25zOiB7XG4gICAgICAgICAgbjNPcHRpb25zOiB7XG4gICAgICAgICAgICBuNE9wdGlvbnM6IHtcbiAgICAgICAgICAgICAgbjVPcHRpb25zOiB7XG4gICAgICAgICAgICAgICAgbjZPcHRpb25zOiB7XG4gICAgICAgICAgICAgICAgICBwNTogJ25ldmVyIG1ha2Ugb3B0aW9ucyBsaWtlIHRoaXMnXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9O1xuXG4gIE9iamVjdC5mcmVlemUoIG1lcmdlMSApO1xuICBjb25zdCBtZXJnZWQgPSBtZXJnZSggb3JpZ2luYWwsIG1lcmdlMSApO1xuICBjb25zdCBleHBlY3RlZCA9IHtcbiAgICBwMU9wdGlvbnM6IHtcbiAgICAgIG4xT3B0aW9uczoge1xuICAgICAgICBuMk9wdGlvbnM6IHtcbiAgICAgICAgICBuM09wdGlvbnM6IHtcbiAgICAgICAgICAgIG40T3B0aW9uczoge1xuICAgICAgICAgICAgICBuNTogJ292ZXJ3cml0dGVuJ1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sXG4gICAgcDJPcHRpb25zOiB7XG4gICAgICBuMU9wdGlvbnM6IHtcbiAgICAgICAgcDM6ICdrZWVwIG1lJyxcbiAgICAgICAgcDQ6ICdwMyBrZXB0JyxcbiAgICAgICAgbjJPcHRpb25zOiB7XG4gICAgICAgICAgbjNPcHRpb25zOiB7XG4gICAgICAgICAgICBuNE9wdGlvbnM6IHtcbiAgICAgICAgICAgICAgbjVPcHRpb25zOiB7XG4gICAgICAgICAgICAgICAgbjZPcHRpb25zOiB7XG4gICAgICAgICAgICAgICAgICBwNTogJ25ldmVyIG1ha2Ugb3B0aW9ucyBsaWtlIHRoaXMnXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9O1xuICBhc3NlcnQuZGVlcEVxdWFsKCBtZXJnZWQsIGV4cGVjdGVkLCAnbWVyZ2Ugc2hvdWxkIGhhbmRsZSBzb21lIGRlZXBseSBuZXN0ZWQgc3R1ZmYnICk7XG59ICk7XG5cblFVbml0LnRlc3QoICdtaW5vciBjaGFuZ2UnLCBhc3NlcnQgPT4ge1xuICBjb25zdCBhID0ge1xuICAgIHNsaWRlck9wdGlvbnM6IHtcbiAgICAgIGhlbGxvOiAndGhlcmUnXG4gICAgfVxuICB9O1xuICBjb25zdCBiID0ge1xuICAgIHNsaWRlck9wdGlvbnM6IHtcbiAgICAgIHRpbWU6ICdub3cnXG4gICAgfVxuICB9O1xuICBtZXJnZSgge30sIGEsIGIgKTtcbiAgYXNzZXJ0Lm9rKCAhYS5zbGlkZXJPcHRpb25zLmhhc093blByb3BlcnR5KCAndGltZScgKSwgJ3RpbWUgc2hvdWxkbnQgbGVhayBvdmVyIHRvIGEnICk7XG59ICk7XG5cblFVbml0LnRlc3QoICd0ZXN0IHdyb25nIGFyZ3MnLCBhc3NlcnQgPT4ge1xuICBpZiAoIHdpbmRvdy5hc3NlcnQgKSB7XG5cbiAgICAvLyBpbiBmaXJzdCBhcmdcbiAgICBhc3NlcnQudGhyb3dzKCAoKSA9PiBtZXJnZSggdW5kZWZpbmVkLCB7fSApLCAndW5zdXBwb3J0ZWQgZmlyc3QgYXJnIFwidW5kZWZpbmVkXCInICk7XG4gICAgYXNzZXJ0LnRocm93cyggKCkgPT4gbWVyZ2UoIG51bGwsIHt9ICksICd1bnN1cHBvcnRlZCBhcmcgXCJudWxsXCInICk7XG4gICAgYXNzZXJ0LnRocm93cyggKCkgPT4gbWVyZ2UoIHRydWUsIHt9ICksICd1bnN1cHBvcnRlZCBhcmcgXCJib29sZWFuXCInICk7XG4gICAgYXNzZXJ0LnRocm93cyggKCkgPT4gbWVyZ2UoICdoZWxsbycsIHt9ICksICd1bnN1cHBvcnRlZCBhcmcgXCJzdHJpbmdcIicgKTtcbiAgICBhc3NlcnQudGhyb3dzKCAoKSA9PiBtZXJnZSggNCwge30gKSwgJ3Vuc3VwcG9ydGVkIGFyZyBcIm51bWJlclwiJyApO1xuICAgIGFzc2VydC50aHJvd3MoICgpID0+IG1lcmdlKCBJbWFnZSwge30gKSwgJ3Vuc3VwcG9ydGVkIGFyZyBvZiBPYmplY3Qgd2l0aCBleHRyYSBwcm90b3R5cGUnICk7XG4gICAgYXNzZXJ0LnRocm93cyggKCkgPT4gbWVyZ2UoIHsgZ2V0IGhpKCkgeyByZXR1cm4gMzsgfSB9LCB7fSApLCAndW5zdXBwb3J0ZWQgYXJnIHdpdGggZ2V0dGVyJyApO1xuICAgIGFzc2VydC50aHJvd3MoICgpID0+IG1lcmdlKCB7IHNldCBoaSggc3R1ZmY6IG51bWJlciApIHsgLyogbm9vcCAqL30gfSwge30gKSwgJ3Vuc3VwcG9ydGVkIGFyZyB3aXRoIHNldHRlcicgKTtcblxuICAgIC8vIGluIHNlY29uZCBhcmdcbiAgICBhc3NlcnQudGhyb3dzKCAoKSA9PiBtZXJnZSgge30sIHRydWUsIHt9ICksICd1bnN1cHBvcnRlZCBzZWNvbmQgYXJnIFwiYm9vbGVhblwiJyApO1xuICAgIGFzc2VydC50aHJvd3MoICgpID0+IG1lcmdlKCB7fSwgJ2hlbGxvJywge30gKSwgJ3Vuc3VwcG9ydGVkIHNlY29uZCBhcmcgXCJzdHJpbmdcIicgKTtcbiAgICBhc3NlcnQudGhyb3dzKCAoKSA9PiBtZXJnZSgge30sIDQsIHt9ICksICd1bnN1cHBvcnRlZCBzZWNvbmQgYXJnIFwibnVtYmVyXCInICk7XG4gICAgYXNzZXJ0LnRocm93cyggKCkgPT4gbWVyZ2UoIHt9LCBJbWFnZSwge30gKSwgJ3Vuc3VwcG9ydGVkIHNlY29uZCBhcmcgb2YgT2JqZWN0IHdpdGggZXh0cmEgcHJvdG90eXBlJyApO1xuICAgIGFzc2VydC50aHJvd3MoICgpID0+IG1lcmdlKCB7fSwgeyBnZXQgaGkoKSB7IHJldHVybiAzOyB9IH0sIHt9ICksICd1bnN1cHBvcnRlZCBzZWNvbmQgYXJnIHdpdGggZ2V0dGVyJyApO1xuICAgIGFzc2VydC50aHJvd3MoICgpID0+IG1lcmdlKCB7fSwgeyBzZXQgaGkoIHN0dWZmOiBudW1iZXIgKSB7Lyogbm9vcCAqL30gfSwge30gKSwgJ3Vuc3VwcG9ydGVkIHNlY29uZCBhcmcgd2l0aCBzZXR0ZXInICk7XG5cbiAgICAvLyBpbiBzZWNvbmQgYXJnIHdpdGggbm8gdGhpcmQgb2JqZWN0XG4gICAgYXNzZXJ0LnRocm93cyggKCkgPT4gbWVyZ2UoIHt9LCB0cnVlICksICd1bnN1cHBvcnRlZCBzZWNvbmQgYXJnIHdpdGggbm8gdGhpcmQgXCJib29sZWFuXCInICk7XG4gICAgYXNzZXJ0LnRocm93cyggKCkgPT4gbWVyZ2UoIHt9LCAnaGVsbG8nICksICd1bnN1cHBvcnRlZCBzZWNvbmQgYXJnIHdpdGggbm8gdGhpcmQgXCJzdHJpbmdcIicgKTtcbiAgICBhc3NlcnQudGhyb3dzKCAoKSA9PiBtZXJnZSgge30sIDQgKSwgJ3Vuc3VwcG9ydGVkIHNlY29uZCBhcmcgd2l0aCBubyB0aGlyZCBcIm51bWJlclwiJyApO1xuICAgIGFzc2VydC50aHJvd3MoICgpID0+IG1lcmdlKCB7fSwgSW1hZ2UgKSwgJ3Vuc3VwcG9ydGVkIHNlY29uZCBhcmcgd2l0aCBubyB0aGlyZCBvZiBPYmplY3Qgd2l0aCBleHRyYSBwcm90b3R5cGUnICk7XG4gICAgYXNzZXJ0LnRocm93cyggKCkgPT4gbWVyZ2UoIHt9LCB7IGdldCBoaSgpIHsgcmV0dXJuIDM7IH0gfSApLCAndW5zdXBwb3J0ZWQgc2Vjb25kIGFyZyB3aXRoIG5vIHRoaXJkIHdpdGggZ2V0dGVyJyApO1xuICAgIGFzc2VydC50aHJvd3MoICgpID0+IG1lcmdlKCB7fSwgeyBzZXQgaGkoIHN0dWZmOiBudW1iZXIgKSB7Lyogbm9vcCAqL30gfSApLCAndW5zdXBwb3J0ZWQgc2Vjb25kIGFyZyB3aXRoIG5vIHRoaXJkIHdpdGggZ2V0dGVyJyApO1xuXG4gICAgLy8gaW4gc29tZSBvcHRpb25zXG4gICAgYXNzZXJ0LnRocm93cyggKCkgPT4gbWVyZ2UoIHt9LCB7IHNvbWVPcHRpb25zOiB0cnVlIH0sIHt9ICksICd1bnN1cHBvcnRlZCBhcmcgaW4gb3B0aW9ucyBcImJvb2xlYW5cIicgKTtcbiAgICBhc3NlcnQudGhyb3dzKCAoKSA9PiBtZXJnZSgge30sIHsgc29tZU9wdGlvbnM6ICdoZWxsbycgfSwge30gKSwgJ3Vuc3VwcG9ydGVkIGFyZyBpbiBvcHRpb25zIFwic3RyaW5nXCInICk7XG4gICAgYXNzZXJ0LnRocm93cyggKCkgPT4gbWVyZ2UoIHt9LCB7IHNvbWVPcHRpb25zOiA0IH0sIHt9ICksICd1bnN1cHBvcnRlZCBhcmcgaW4gb3B0aW9ucyBcIm51bWJlclwiJyApO1xuICAgIGFzc2VydC50aHJvd3MoICgpID0+IG1lcmdlKCB7fSwgeyBzb21lT3B0aW9uczogSW1hZ2UgfSwge30gKSwgJ3Vuc3VwcG9ydGVkIGFyZyBpbiBvcHRpb25zIG9mIE9iamVjdCB3aXRoIGV4dHJhIHByb3RvdHlwZScgKTtcbiAgICBhc3NlcnQudGhyb3dzKCAoKSA9PiBtZXJnZSgge30sIHsgc29tZU9wdGlvbnM6IHsgZ2V0IGhpKCkgeyByZXR1cm4gMzsgfSB9IH0sIHt9ICksICd1bnN1cHBvcnRlZCBhcmcgaW4gb3B0aW9ucyB3aXRoIGdldHRlcicgKTtcbiAgICBhc3NlcnQudGhyb3dzKCAoKSA9PiBtZXJnZSgge30sIHsgc29tZU9wdGlvbnM6IHsgc2V0IGhpKCBzdHVmZjogbnVtYmVyICkgey8qIG5vb3AgKi99IH0gfSwge30gKSwgJ3Vuc3VwcG9ydGVkIGFyZyBpbiBvcHRpb25zIHdpdGggZ2V0dGVyJyApO1xuICB9XG4gIGVsc2Uge1xuICAgIGFzc2VydC5vayggdHJ1ZSwgJ25vIGFzc2VydGlvbnMgZW5hYmxlZCcgKTtcbiAgfVxuXG4gIC8vIGFsbG93ZWQgY2FzZXMgdGhhdCBzaG91bGQgbm90IGVycm9yXG4gIG1lcmdlKCB7fSwgbnVsbCwge30gKTtcbiAgbWVyZ2UoIHt9LCBudWxsICk7XG4gIG1lcmdlKCB7fSwge30sIG51bGwgKTtcbiAgbWVyZ2UoIHsgeE9wdGlvbnM6IHsgdGVzdDogMSB9IH0sIHsgeE9wdGlvbnM6IG51bGwgfSApO1xuICBtZXJnZSgge30sIHsgc29tZU9wdGlvbnM6IG51bGwgfSwge30gKTtcbiAgbWVyZ2UoIHt9LCB7IHNvbWVPcHRpb25zOiB1bmRlZmluZWQgfSwge30gKTtcbn0gKTtcblxuUVVuaXQudGVzdCggJ2RvIG5vdCByZWN1cnNlIGZvciBub24gKk9wdGlvbnMnLCBhc3NlcnQgPT4ge1xuXG4gIGNvbnN0IHRlc3RGaXJzdFByb3BlcnR5ID0gbmV3IFByb3BlcnR5KCAnaGknICk7XG4gIGNvbnN0IHRlc3RTZWNvbmRQcm9wZXJ0eSA9IG5ldyBQcm9wZXJ0eSggJ2hpMicgKTtcbiAgY29uc3QgVGVzdEVudW1lcmF0aW9uID0gRW51bWVyYXRpb25EZXByZWNhdGVkLmJ5S2V5cyggWyAnT05FJywgJ1RXTycgXSApO1xuICBjb25zdCBUZXN0RW51bWVyYXRpb24yID0gRW51bWVyYXRpb25EZXByZWNhdGVkLmJ5S2V5cyggWyAnT05FMScsICdUV08yJyBdICk7XG4gIGNvbnN0IG9yaWdpbmFsID0ge1xuICAgIHByb3A6IHRlc3RGaXJzdFByb3BlcnR5LFxuICAgIGVudW06IFRlc3RFbnVtZXJhdGlvbixcbiAgICBzb21lT3B0aW9uczogeyBuZXN0ZWRQcm9wOiB0ZXN0Rmlyc3RQcm9wZXJ0eSB9XG4gIH07XG5cbiAgbGV0IG5ld09iamVjdCA9IG1lcmdlKCB7fSwgb3JpZ2luYWwgKTtcbiAgYXNzZXJ0Lm9rKCBfLmlzRXF1YWwoIG9yaWdpbmFsLCBuZXdPYmplY3QgKSwgJ3Nob3VsZCBiZSBlcXVhbCBmcm9tIHJlZmVyZW5jZSBlcXVhbGl0eScgKTtcbiAgYXNzZXJ0Lm9rKCBvcmlnaW5hbC5wcm9wID09PSBuZXdPYmplY3QucHJvcCwgJ3NhbWUgUHJvcGVydHknICk7XG4gIGFzc2VydC5vayggb3JpZ2luYWwuZW51bSA9PT0gbmV3T2JqZWN0LmVudW0sICdzYW1lIEVudW1lcmF0aW9uRGVwcmVjYXRlZCcgKTtcblxuICAvLyB0ZXN0IGRlZmF1bHRzIHdpdGggb3RoZXIgbm9uIG1lcmdlYWJsZSBvYmplY3RzXG4gIG5ld09iamVjdCA9IG1lcmdlKCB7XG4gICAgcHJvcDogdGVzdFNlY29uZFByb3BlcnR5LFxuICAgIGVudW06IFRlc3RFbnVtZXJhdGlvbjIsXG4gICAgc29tZU9wdGlvbnM6IHsgbmVzdGVkUHJvcDogdGVzdFNlY29uZFByb3BlcnR5IH1cbiAgfSwgb3JpZ2luYWwgKTtcbiAgYXNzZXJ0Lm9rKCBfLmlzRXF1YWwoIG9yaWdpbmFsLCBuZXdPYmplY3QgKSwgJ3Nob3VsZCBiZSBlcXVhbCcgKTtcbiAgYXNzZXJ0Lm9rKCBvcmlnaW5hbC5wcm9wID09PSBuZXdPYmplY3QucHJvcCwgJ3NhbWUgUHJvcGVydHksIGlnbm9yZSBkZWZhdWx0JyApO1xuICBhc3NlcnQub2soIG9yaWdpbmFsLmVudW0gPT09IG5ld09iamVjdC5lbnVtLCAnc2FtZSBFbnVtZXJhdGlvbkRlcHJlY2F0ZWQsIGlnbm9yZSBkZWZhdWx0JyApO1xufSApO1xuXG5RVW5pdC50ZXN0KCAnc3VwcG9ydCBvcHRpb25hbCBvcHRpb25zJywgYXNzZXJ0ID0+IHtcblxuICBjb25zdCBtZXJnZVhZWiA9ICggb3B0aW9ucz86IFJlY29yZDxzdHJpbmcsIHVua25vd24+ICkgPT4ge1xuICAgIHJldHVybiBtZXJnZSgge1xuICAgICAgeDogMSxcbiAgICAgIHk6IDIsXG4gICAgICB6OiAzXG4gICAgfSwgb3B0aW9ucyApO1xuICB9O1xuICBjb25zdCBub09wdGlvbnMgPSBtZXJnZVhZWigpO1xuICBhc3NlcnQub2soIG5vT3B0aW9ucy54ID09PSAxLCAneCBwcm9wZXJ0eSBzaG91bGQgYmUgbWVyZ2VkIGZyb20gZGVmYXVsdCcgKTtcbiAgYXNzZXJ0Lm9rKCBub09wdGlvbnMueSA9PT0gMiwgJ3kgcHJvcGVydHkgc2hvdWxkIGJlIG1lcmdlZCBmcm9tIGRlZmF1bHQnICk7XG4gIGFzc2VydC5vayggbm9PcHRpb25zLnogPT09IDMsICd6IHByb3BlcnR5IHNob3VsZCBiZSBtZXJnZWQgZnJvbSBkZWZhdWx0JyApO1xuXG4gIGNvbnN0IHRlc3ROZXN0ZWRGdW5jdGlvbkNhbGxPcHRpb25zID0gKCBvcHRpb25zPzogUmVjb3JkPHN0cmluZywgdW5rbm93bj4gKSA9PiB7XG4gICAgcmV0dXJuIG1lcmdlWFlaKCBtZXJnZSgge1xuICAgICAgeDogMixcbiAgICAgIGc6IDU0LFxuICAgICAgdHJlZVNheXM6ICdoZWxsbydcbiAgICB9LCBvcHRpb25zICkgKTtcbiAgfTtcblxuICBjb25zdCBub09wdGlvbnMyID0gdGVzdE5lc3RlZEZ1bmN0aW9uQ2FsbE9wdGlvbnMoKTtcbiAgYXNzZXJ0Lm9rKCBub09wdGlvbnMyLnggPT09IDIsICd4IHByb3BlcnR5IHNob3VsZCBiZSBtZXJnZWQgZnJvbSBkZWZhdWx0JyApO1xuICBhc3NlcnQub2soIG5vT3B0aW9uczIueSA9PT0gMiwgJ3kgcHJvcGVydHkgc2hvdWxkIGJlIG1lcmdlZCBmcm9tIGRlZmF1bHQnICk7XG4gIGFzc2VydC5vayggbm9PcHRpb25zMi56ID09PSAzLCAneiBwcm9wZXJ0eSBzaG91bGQgYmUgbWVyZ2VkIGZyb20gZGVmYXVsdCcgKTtcblxuICBhc3NlcnQub2soIG5vT3B0aW9uczIuZyA9PT0gNTQsICdnIHByb3BlcnR5IHNob3VsZCBiZSBtZXJnZWQgZnJvbSBkZWZhdWx0JyApO1xuICBhc3NlcnQub2soIG5vT3B0aW9uczIudHJlZVNheXMgPT09ICdoZWxsbycsICdwcm9wZXJ0eSBzaG91bGQgYmUgbWVyZ2VkIGZyb20gZGVmYXVsdCcgKTtcbn0gKTtcblxuUVVuaXQudGVzdCggJ2RvZXMgbm90IHN1cHBvcnQgZGVlcCBlcXVhbHMgb24ga2V5bmFtZSBvZiBcIk9wdGlvbnNcIicsIGFzc2VydCA9PiB7XG5cbiAgY29uc3QgcmVmZXJlbmNlT2JqZWN0ID0ge1xuICAgIGhlbGxvOiAyXG4gIH07XG5cbiAgY29uc3QgbWVyZ2VkID0gbWVyZ2UoIHt9LCB7XG4gICAgT3B0aW9uczogcmVmZXJlbmNlT2JqZWN0XG4gIH0gKTtcblxuICBjb25zdCBkZWVwTWVyZ2VkID0gbWVyZ2UoIHt9LCB7XG4gICAgc29tZU9wdGlvbnM6IHJlZmVyZW5jZU9iamVjdFxuICB9ICk7XG5cbiAgYXNzZXJ0Lm9rKCBtZXJnZWQuT3B0aW9ucyA9PT0gcmVmZXJlbmNlT2JqZWN0LCAnXCJPcHRpb25zXCIgc2hvdWxkIG5vdCBkZWVwIGVxdWFsJyApO1xuICByZWZlcmVuY2VPYmplY3QuaGVsbG8gPSAzO1xuICBhc3NlcnQub2soIG1lcmdlZC5PcHRpb25zLmhlbGxvID09PSAzLCAndmFsdWUgc2hvdWxkIGNoYW5nZSBiZWNhdXNlIGl0IGlzIGEgcmVmZXJlbmNlJyApO1xuICBhc3NlcnQub2soIGRlZXBNZXJnZWQuc29tZU9wdGlvbnMuaGVsbG8gPT09IDIsICd2YWx1ZSBzaG91bGQgbm90IGNoYW5nZSBiZWNhdXNlIGl0IHdhcyBkZWVwIGNvcGllZCcgKTtcbn0gKTsiXSwibmFtZXMiOlsiUHJvcGVydHkiLCJFbnVtZXJhdGlvbkRlcHJlY2F0ZWQiLCJtZXJnZSIsIlFVbml0IiwibW9kdWxlIiwidGVzdCIsImFzc2VydCIsIm9yaWdpbmFsIiwicHJvcDEiLCJwcm9wMiIsInN1YmNvbXBvbmVudE9wdGlvbnMiLCJzdWJQcm9wMSIsInN1YlByb3AyIiwic3ViY29tcG9uZW50T3B0aW9uczIiLCJzdWJTdWJjb21wb25lbnRPcHRpb25zIiwic3ViU3ViUHJvcDEiLCJwcm9wMyIsIm1lcmdlMSIsInN1YlByb3AzIiwicHJvcDQiLCJwcmVNZXJnZVNvdXJjZUNvcHkiLCJPYmplY3QiLCJhc3NpZ24iLCJtZXJnZWQiLCJlcXVhbCIsInNob3VsZEJlIiwiZGVlcEVxdWFsIiwiZXhjZXB0IiwibWVyZ2UyIiwicHJvcDUiLCJzdWJQcm9wNCIsIm1lcmdlMyIsInByb3A2Iiwic3ViUHJvcDUiLCJ0ZXN0MiIsIm1lcmdlMUNvcHkiLCJfIiwiY2xvbmVEZWVwIiwibWVyZ2UyQ29weSIsIm1lcmdlM0NvcHkiLCJmcmVlemUiLCJleHBlY3RlZCIsIm5vdEVxdWFsIiwic3ViT3B0aW9ucyIsIlRlc3RDbGFzcyIsIm1lcmdlcyIsImEiLCJiIiwiY3JlYXRlIiwidGVzdDEiLCJjIiwiZCIsImUiLCJmIiwiZ2V0dGVyTWVyZ2UiLCJ3aW5kb3ciLCJ0aHJvd3MiLCJ0ZXN0RW51bSIsIkEiLCJ0ZXN0QSIsIkIiLCJ0ZXN0QiIsIkMiLCJ0ZXN0QyIsInRlc3RQcm9wZXJ0eSIsInZhbHVlIiwidGVzdFByb3BlcnR5MiIsInByb3AiLCJuZXN0ZWRPcHRpb25zIiwibmVlZHNBbkVudW0iLCJtb3JlT3B0aW9ucyIsIm1lcmdlciIsIm5lZWRzRGlmZmVyZW50RW51bSIsIm9yaWdpbmFsQ29weSIsIm1lcmdlZEZyZXNoIiwib2siLCJpc0VxdWFsIiwicDFPcHRpb25zIiwibjFPcHRpb25zIiwibjJPcHRpb25zIiwibjNPcHRpb25zIiwibjRPcHRpb25zIiwibjUiLCJwMk9wdGlvbnMiLCJwMyIsInA0IiwibjVPcHRpb25zIiwibjZPcHRpb25zIiwicDUiLCJzbGlkZXJPcHRpb25zIiwiaGVsbG8iLCJ0aW1lIiwiaGFzT3duUHJvcGVydHkiLCJ1bmRlZmluZWQiLCJJbWFnZSIsImhpIiwic3R1ZmYiLCJzb21lT3B0aW9ucyIsInhPcHRpb25zIiwidGVzdEZpcnN0UHJvcGVydHkiLCJ0ZXN0U2Vjb25kUHJvcGVydHkiLCJUZXN0RW51bWVyYXRpb24iLCJieUtleXMiLCJUZXN0RW51bWVyYXRpb24yIiwiZW51bSIsIm5lc3RlZFByb3AiLCJuZXdPYmplY3QiLCJtZXJnZVhZWiIsIm9wdGlvbnMiLCJ4IiwieSIsInoiLCJub09wdGlvbnMiLCJ0ZXN0TmVzdGVkRnVuY3Rpb25DYWxsT3B0aW9ucyIsImciLCJ0cmVlU2F5cyIsIm5vT3B0aW9uczIiLCJyZWZlcmVuY2VPYmplY3QiLCJPcHRpb25zIiwiZGVlcE1lcmdlZCJdLCJtYXBwaW5ncyI6IkFBQUEsc0RBQXNEO0FBQ3RELDBEQUEwRDtBQUcxRCxPQUFPQSxjQUFjLDRCQUE0QjtBQUNqRCxPQUFPQywyQkFBMkIsNkJBQTZCO0FBQy9ELE9BQU9DLFdBQVcsYUFBYTtBQUcvQkMsTUFBTUMsTUFBTSxDQUFFO0FBRWQsbUNBQW1DO0FBQ25DRCxNQUFNRSxJQUFJLENBQUUscUJBQXFCQyxDQUFBQTtJQUMvQixNQUFNQyxXQUFXO1FBQ2ZDLE9BQU87UUFDUEMsT0FBTztRQUNQQyxxQkFBcUI7WUFDbkJDLFVBQVU7WUFDVkMsVUFBVTtRQUNaO1FBQ0FDLHNCQUFzQjtZQUNwQkMsd0JBQXdCO2dCQUN0QkMsYUFBYTtZQUNmO1FBQ0Y7UUFDQUMsT0FBTztJQUNUO0lBRUEsTUFBTUMsU0FBUztRQUNiUCxxQkFBcUI7WUFDbkJDLFVBQVU7WUFDVk8sVUFBVTtRQUNaO1FBQ0FMLHNCQUFzQjtZQUNwQkMsd0JBQXdCO2dCQUN0QkMsYUFBYTtnQkFDYlYsTUFBTTtZQUNSO1FBQ0Y7UUFDQVcsT0FBTztRQUNQRyxPQUFPO0lBQ1Q7SUFDQSxNQUFNQyxxQkFB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