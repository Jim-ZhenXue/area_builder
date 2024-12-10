// Copyright 2017-2024, University of Colorado Boulder
/**
 * Node tests
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */ import BooleanProperty from '../../../axon/js/BooleanProperty.js';
import Bounds2 from '../../../dot/js/Bounds2.js';
import Vector2 from '../../../dot/js/Vector2.js';
import { Shape } from '../../../kite/js/imports.js';
import Tandem from '../../../tandem/js/Tandem.js';
import Touch from '../input/Touch.js';
import Node from './Node.js';
import Rectangle from './Rectangle.js';
QUnit.module('Node');
function fakeTouchPointer(vector) {
    return new Touch(0, vector, {});
}
QUnit.test('Mouse and Touch areas', (assert)=>{
    const node = new Node();
    const rect = new Rectangle(0, 0, 100, 50);
    rect.pickable = true;
    node.addChild(rect);
    assert.ok(!!rect.hitTest(new Vector2(10, 10)), 'Rectangle intersection');
    assert.ok(!!rect.hitTest(new Vector2(90, 10)), 'Rectangle intersection');
    assert.ok(!rect.hitTest(new Vector2(-10, 10)), 'Rectangle no intersection');
    node.touchArea = Shape.rectangle(-50, -50, 100, 100);
    assert.ok(!!node.hitTest(new Vector2(10, 10)), 'Node intersection');
    assert.ok(!!node.hitTest(new Vector2(90, 10)), 'Node intersection');
    assert.ok(!node.hitTest(new Vector2(-10, 10)), 'Node no intersection');
    assert.ok(!!node.trailUnderPointer(fakeTouchPointer(new Vector2(10, 10))), 'Node intersection (isTouch)');
    assert.ok(!!node.trailUnderPointer(fakeTouchPointer(new Vector2(90, 10))), 'Node intersection (isTouch)');
    assert.ok(!!node.trailUnderPointer(fakeTouchPointer(new Vector2(-10, 10))), 'Node intersection (isTouch)');
    node.clipArea = Shape.rectangle(0, 0, 50, 50);
    // points outside the clip area shouldn't register as hits
    assert.ok(!!node.trailUnderPointer(fakeTouchPointer(new Vector2(10, 10))), 'Node intersection (isTouch with clipArea)');
    assert.ok(!node.trailUnderPointer(fakeTouchPointer(new Vector2(90, 10))), 'Node no intersection (isTouch with clipArea)');
    assert.ok(!node.trailUnderPointer(fakeTouchPointer(new Vector2(-10, 10))), 'Node no intersection (isTouch with clipArea)');
});
const epsilon = 0.000000001;
QUnit.test('Points (parent and child)', (assert)=>{
    const a = new Node();
    const b = new Node();
    a.addChild(b);
    a.x = 10;
    b.y = 10;
    assert.ok(new Vector2(5, 15).equalsEpsilon(b.localToParentPoint(new Vector2(5, 5)), epsilon), 'localToParentPoint on child');
    assert.ok(new Vector2(15, 5).equalsEpsilon(a.localToParentPoint(new Vector2(5, 5)), epsilon), 'localToParentPoint on root');
    assert.ok(new Vector2(5, -5).equalsEpsilon(b.parentToLocalPoint(new Vector2(5, 5)), epsilon), 'parentToLocalPoint on child');
    assert.ok(new Vector2(-5, 5).equalsEpsilon(a.parentToLocalPoint(new Vector2(5, 5)), epsilon), 'parentToLocalPoint on root');
    assert.ok(new Vector2(15, 15).equalsEpsilon(b.localToGlobalPoint(new Vector2(5, 5)), epsilon), 'localToGlobalPoint on child');
    assert.ok(new Vector2(15, 5).equalsEpsilon(a.localToGlobalPoint(new Vector2(5, 5)), epsilon), 'localToGlobalPoint on root (same as localToparent)');
    assert.ok(new Vector2(-5, -5).equalsEpsilon(b.globalToLocalPoint(new Vector2(5, 5)), epsilon), 'globalToLocalPoint on child');
    assert.ok(new Vector2(-5, 5).equalsEpsilon(a.globalToLocalPoint(new Vector2(5, 5)), epsilon), 'globalToLocalPoint on root (same as localToparent)');
    assert.ok(new Vector2(15, 5).equalsEpsilon(b.parentToGlobalPoint(new Vector2(5, 5)), epsilon), 'parentToGlobalPoint on child');
    assert.ok(new Vector2(5, 5).equalsEpsilon(a.parentToGlobalPoint(new Vector2(5, 5)), epsilon), 'parentToGlobalPoint on root');
    assert.ok(new Vector2(-5, 5).equalsEpsilon(b.globalToParentPoint(new Vector2(5, 5)), epsilon), 'globalToParentPoint on child');
    assert.ok(new Vector2(5, 5).equalsEpsilon(a.globalToParentPoint(new Vector2(5, 5)), epsilon), 'globalToParentPoint on root');
});
QUnit.test('Bounds (parent and child)', (assert)=>{
    const a = new Node();
    const b = new Node();
    a.addChild(b);
    a.x = 10;
    b.y = 10;
    const bounds = new Bounds2(4, 4, 20, 30);
    assert.ok(new Bounds2(4, 14, 20, 40).equalsEpsilon(b.localToParentBounds(bounds), epsilon), 'localToParentBounds on child');
    assert.ok(new Bounds2(14, 4, 30, 30).equalsEpsilon(a.localToParentBounds(bounds), epsilon), 'localToParentBounds on root');
    assert.ok(new Bounds2(4, -6, 20, 20).equalsEpsilon(b.parentToLocalBounds(bounds), epsilon), 'parentToLocalBounds on child');
    assert.ok(new Bounds2(-6, 4, 10, 30).equalsEpsilon(a.parentToLocalBounds(bounds), epsilon), 'parentToLocalBounds on root');
    assert.ok(new Bounds2(14, 14, 30, 40).equalsEpsilon(b.localToGlobalBounds(bounds), epsilon), 'localToGlobalBounds on child');
    assert.ok(new Bounds2(14, 4, 30, 30).equalsEpsilon(a.localToGlobalBounds(bounds), epsilon), 'localToGlobalBounds on root (same as localToParent)');
    assert.ok(new Bounds2(-6, -6, 10, 20).equalsEpsilon(b.globalToLocalBounds(bounds), epsilon), 'globalToLocalBounds on child');
    assert.ok(new Bounds2(-6, 4, 10, 30).equalsEpsilon(a.globalToLocalBounds(bounds), epsilon), 'globalToLocalBounds on root (same as localToParent)');
    assert.ok(new Bounds2(14, 4, 30, 30).equalsEpsilon(b.parentToGlobalBounds(bounds), epsilon), 'parentToGlobalBounds on child');
    assert.ok(new Bounds2(4, 4, 20, 30).equalsEpsilon(a.parentToGlobalBounds(bounds), epsilon), 'parentToGlobalBounds on root');
    assert.ok(new Bounds2(-6, 4, 10, 30).equalsEpsilon(b.globalToParentBounds(bounds), epsilon), 'globalToParentBounds on child');
    assert.ok(new Bounds2(4, 4, 20, 30).equalsEpsilon(a.globalToParentBounds(bounds), epsilon), 'globalToParentBounds on root');
});
QUnit.test('Points (order of transforms)', (assert)=>{
    const a = new Node();
    const b = new Node();
    const c = new Node();
    a.addChild(b);
    b.addChild(c);
    a.x = 10;
    b.scale(2);
    c.y = 10;
    assert.ok(new Vector2(20, 30).equalsEpsilon(c.localToGlobalPoint(new Vector2(5, 5)), epsilon), 'localToGlobalPoint');
    assert.ok(new Vector2(-2.5, -7.5).equalsEpsilon(c.globalToLocalPoint(new Vector2(5, 5)), epsilon), 'globalToLocalPoint');
    assert.ok(new Vector2(20, 10).equalsEpsilon(c.parentToGlobalPoint(new Vector2(5, 5)), epsilon), 'parentToGlobalPoint');
    assert.ok(new Vector2(-2.5, 2.5).equalsEpsilon(c.globalToParentPoint(new Vector2(5, 5)), epsilon), 'globalToParentPoint');
});
QUnit.test('Bounds (order of transforms)', (assert)=>{
    const a = new Node();
    const b = new Node();
    const c = new Node();
    a.addChild(b);
    b.addChild(c);
    a.x = 10;
    b.scale(2);
    c.y = 10;
    const bounds = new Bounds2(4, 4, 20, 30);
    assert.ok(new Bounds2(18, 28, 50, 80).equalsEpsilon(c.localToGlobalBounds(bounds), epsilon), 'localToGlobalBounds');
    assert.ok(new Bounds2(-3, -8, 5, 5).equalsEpsilon(c.globalToLocalBounds(bounds), epsilon), 'globalToLocalBounds');
    assert.ok(new Bounds2(18, 8, 50, 60).equalsEpsilon(c.parentToGlobalBounds(bounds), epsilon), 'parentToGlobalBounds');
    assert.ok(new Bounds2(-3, 2, 5, 15).equalsEpsilon(c.globalToParentBounds(bounds), epsilon), 'globalToParentBounds');
});
QUnit.test('Trail and Node transform equivalence', (assert)=>{
    const a = new Node();
    const b = new Node();
    const c = new Node();
    a.addChild(b);
    b.addChild(c);
    a.x = 10;
    b.scale(2);
    c.y = 10;
    const trailMatrix = c.getUniqueTrail().getMatrix();
    const nodeMatrix = c.getUniqueTransform().getMatrix();
    assert.ok(trailMatrix.equalsEpsilon(nodeMatrix, epsilon), 'Trail and Node transform equivalence');
});
QUnit.test('Mutually exclusive options', (assert)=>{
    assert.ok(true, 'always true, even when assertions are not on.');
    const visibleProperty = new BooleanProperty(true);
    window.assert && assert.throws(()=>{
        return new Node({
            visible: false,
            visibleProperty: visibleProperty
        });
    }, 'visible and visibleProperty values do not match');
    const pickableProperty = new BooleanProperty(true);
    window.assert && assert.throws(()=>{
        return new Node({
            pickable: false,
            pickableProperty: pickableProperty
        });
    }, 'pickable and pickableProperty values do not match');
    const enabledProperty = new BooleanProperty(true);
    window.assert && assert.throws(()=>{
        return new Node({
            enabled: false,
            enabledProperty: enabledProperty
        });
    }, 'enabled and enabledProperty values do not match');
    const inputEnabledProperty = new BooleanProperty(true);
    window.assert && assert.throws(()=>{
        return new Node({
            inputEnabled: false,
            inputEnabledProperty: inputEnabledProperty
        });
    }, 'inputEnabled and inputEnabledProperty values do not match');
});
if (Tandem.PHET_IO_ENABLED) {
    QUnit.test('Node instrumented visibleProperty', (assert)=>testInstrumentedNodeProperty(assert, 'visible', 'visibleProperty', 'setVisibleProperty', true, 'phetioVisiblePropertyInstrumented'));
    QUnit.test('Node instrumented enabledProperty', (assert)=>testInstrumentedNodeProperty(assert, 'enabled', 'enabledProperty', 'setEnabledProperty', Node.DEFAULT_NODE_OPTIONS.phetioEnabledPropertyInstrumented, 'phetioEnabledPropertyInstrumented'));
    QUnit.test('Node instrumented inputEnabledProperty', (assert)=>testInstrumentedNodeProperty(assert, 'inputEnabled', 'inputEnabledProperty', 'setInputEnabledProperty', Node.DEFAULT_NODE_OPTIONS.phetioInputEnabledPropertyInstrumented, 'phetioInputEnabledPropertyInstrumented'));
    /**
   * Factor out a way to test added Properties to Node and their PhET-iO instrumentation
   * @param assert - from qunit test
   * @param nodeField - name of getter/setter, like `visible`
   * @param nodeProperty - name of public property, like `visibleProperty`
   * @param nodePropertySetter - name of setter function, like `setVisibleProperty`
   * @param ownedPropertyInstrumented - default value of phetioNodePropertyInstrumentedKeyName option in Node.
   * @param phetioNodePropertyInstrumentedKeyName - key name for setting opt-in PhET-iO instrumentation
   */ const testInstrumentedNodeProperty = (assert, nodeField, nodeProperty, nodePropertySetter, ownedPropertyInstrumented, phetioNodePropertyInstrumentedKeyName)=>{
        const apiValidation = phet.tandem.phetioAPIValidation;
        const previousAPIValidationEnabled = apiValidation.enabled;
        const previousSimStarted = apiValidation.simHasStarted;
        apiValidation.simHasStarted = false;
        const testNodeAndProperty = (node, property)=>{
            const initialValue = node[nodeField];
            assert.ok(property.value === node[nodeField], 'initial values should be the same');
            // @ts-expect-error - no sure now to do this well in typescript
            node[nodeField] = !initialValue;
            assert.ok(property.value === !initialValue, 'property should reflect node change');
            property.value = initialValue;
            assert.ok(node[nodeField] === initialValue, 'node should reflect property change');
            // @ts-expect-error - no sure now to do this well in typescript
            node[nodeField] = initialValue;
        };
        const instrumentedProperty = new BooleanProperty(false, {
            tandem: Tandem.ROOT_TEST.createTandem(`${nodeField}MyProperty`)
        });
        const otherInstrumentedProperty = new BooleanProperty(false, {
            tandem: Tandem.ROOT_TEST.createTandem(`${nodeField}MyOtherProperty`)
        });
        const uninstrumentedProperty = new BooleanProperty(false);
        /***************************************
     /* Testing uninstrumented Nodes
     */ // uninstrumentedNode => no property (before startup)
        let uninstrumented = new Node();
        // @ts-expect-error - no sure now to do this well in typescript
        assert.ok(uninstrumented[nodeProperty]['targetProperty'] === undefined);
        // @ts-expect-error - no sure now to do this well in typescript
        testNodeAndProperty(uninstrumented, uninstrumented[nodeProperty]);
        // uninstrumentedNode => uninstrumented property (before startup)
        uninstrumented = new Node({
            [nodeProperty]: uninstrumentedProperty
        });
        // @ts-expect-error - no sure now to do this well in typescript
        assert.ok(uninstrumented[nodeProperty]['targetProperty'] === uninstrumentedProperty);
        testNodeAndProperty(uninstrumented, uninstrumentedProperty);
        //uninstrumentedNode => instrumented property (before startup)
        uninstrumented = new Node();
        uninstrumented.mutate({
            [nodeProperty]: instrumentedProperty
        });
        // @ts-expect-error - no sure now to do this well in typescript
        assert.ok(uninstrumented[nodeProperty]['targetProperty'] === instrumentedProperty);
        testNodeAndProperty(uninstrumented, instrumentedProperty);
        //  uninstrumentedNode => instrumented property => instrument the Node (before startup) OK
        uninstrumented = new Node();
        uninstrumented.mutate({
            [nodeProperty]: instrumentedProperty
        });
        uninstrumented.mutate({
            tandem: Tandem.ROOT_TEST.createTandem(`${nodeField}MyNode`)
        });
        // @ts-expect-error - no sure now to do this well in typescript
        assert.ok(uninstrumented[nodeProperty]['targetProperty'] === instrumentedProperty);
        testNodeAndProperty(uninstrumented, instrumentedProperty);
        uninstrumented.dispose();
        //////////////////////////////////////////////////
        apiValidation.simHasStarted = true;
        // uninstrumentedNode => no property (before startup)
        uninstrumented = new Node();
        // @ts-expect-error - no sure now to do this well in typescript
        assert.ok(uninstrumented[nodeProperty]['targetProperty'] === undefined);
        // @ts-expect-error - no sure now to do this well in typescript
        testNodeAndProperty(uninstrumented, uninstrumented[nodeProperty]);
        // uninstrumentedNode => uninstrumented property (before startup)
        uninstrumented = new Node({
            [nodeProperty]: uninstrumentedProperty
        });
        // @ts-expect-error - no sure now to do this well in typescript
        assert.ok(uninstrumented[nodeProperty]['targetProperty'] === uninstrumentedProperty);
        testNodeAndProperty(uninstrumented, uninstrumentedProperty);
        //uninstrumentedNode => instrumented property (before startup)
        uninstrumented = new Node();
        uninstrumented.mutate({
            [nodeProperty]: instrumentedProperty
        });
        // @ts-expect-error - no sure now to do this well in typescript
        assert.ok(uninstrumented[nodeProperty]['targetProperty'] === instrumentedProperty);
        testNodeAndProperty(uninstrumented, instrumentedProperty);
        //  uninstrumentedNode => instrumented property => instrument the Node (before startup) OK
        uninstrumented = new Node();
        uninstrumented.mutate({
            [nodeProperty]: instrumentedProperty
        });
        uninstrumented.mutate({
            tandem: Tandem.ROOT_TEST.createTandem(`${nodeField}MyNode`)
        });
        // @ts-expect-error - no sure now to do this well in typescript
        assert.ok(uninstrumented[nodeProperty]['targetProperty'] === instrumentedProperty);
        testNodeAndProperty(uninstrumented, instrumentedProperty);
        uninstrumented.dispose();
        apiValidation.simHasStarted = false;
        /***************************************
     /* Testing instrumented nodes
     */ // instrumentedNodeWithDefaultInstrumentedProperty => instrumented property (before startup)
        let instrumented = new Node({
            tandem: Tandem.ROOT_TEST.createTandem(`${nodeField}MyNode`),
            [phetioNodePropertyInstrumentedKeyName]: true
        });
        // @ts-expect-error - no sure now to do this well in typescript
        assert.ok(instrumented[nodeProperty]['targetProperty'] === instrumented[nodeProperty].ownedPhetioProperty);
        // @ts-expect-error - no sure now to do this well in typescript
        assert.ok(instrumented['linkedElements'].length === 0, `no linked elements for default ${nodeProperty}`);
        // @ts-expect-error - no sure now to do this well in typescript
        testNodeAndProperty(instrumented, instrumented[nodeProperty]);
        instrumented.dispose();
        // instrumentedNodeWithDefaultInstrumentedProperty => uninstrumented property (before startup)
        instrumented = new Node({
            tandem: Tandem.ROOT_TEST.createTandem(`${nodeField}MyNode`),
            [phetioNodePropertyInstrumentedKeyName]: true
        });
        // @ts-expect-error - no sure now to do this well in typescript
        instrumented.hasOwnProperty('phetioNodePropertyInstrumentedKeyName') && assert.ok(instrumented[phetioNodePropertyInstrumentedKeyName] === true, 'getter should work');
        window.assert && assert.throws(()=>{
            instrumented.mutate({
                [nodeProperty]: uninstrumentedProperty
            });
        }, `cannot remove instrumentation from the Node's ${nodeProperty}`);
        instrumented.dispose();
        // instrumentedNodeWithPassedInInstrumentedProperty => instrumented property (before startup)
        instrumented = new Node({
            tandem: Tandem.ROOT_TEST.createTandem(`${nodeField}MyNode`),
            [phetioNodePropertyInstrumentedKeyName]: true
        });
        instrumented.mutate({
            [nodeProperty]: instrumentedProperty
        });
        // @ts-expect-error - no sure now to do this well in typescript
        assert.ok(instrumented[nodeProperty]['targetProperty'] === instrumentedProperty);
        // @ts-expect-error - no sure now to do this well in typescript
        assert.ok(instrumented['linkedElements'].length === 1, 'added linked element');
        // @ts-expect-error - no sure now to do this well in typescript
        assert.ok(instrumented['linkedElements'][0].element === instrumentedProperty, `added linked element should be for ${nodeProperty}`);
        testNodeAndProperty(instrumented, instrumentedProperty);
        instrumented.dispose();
        instrumented = new Node({
            tandem: Tandem.ROOT_TEST.createTandem(`${nodeField}MyNode`),
            [nodeProperty]: instrumentedProperty
        });
        // @ts-expect-error - no sure now to do this well in typescript
        assert.ok(instrumented[nodeProperty]['targetProperty'] === instrumentedProperty);
        // @ts-expect-error - no sure now to do this well in typescript
        assert.ok(instrumented['linkedElements'].length === 1, 'added linked element');
        // @ts-expect-error - no sure now to do this well in typescript
        assert.ok(instrumented['linkedElements'][0].element === instrumentedProperty, `added linked element should be for ${nodeProperty}`);
        testNodeAndProperty(instrumented, instrumentedProperty);
        instrumented.dispose();
        // instrumentedNodeWithPassedInInstrumentedProperty => uninstrumented property (before startup)
        instrumented = new Node({
            tandem: Tandem.ROOT_TEST.createTandem(`${nodeField}MyNode`),
            [nodeProperty]: instrumentedProperty
        });
        window.assert && assert.throws(()=>{
            instrumented.mutate({
                [nodeProperty]: uninstrumentedProperty
            });
        }, `cannot remove instrumentation from the Node's ${nodeProperty}`);
        instrumented.dispose();
        instrumented = new Node({
            tandem: Tandem.ROOT_TEST.createTandem(`${nodeField}MyNode`)
        });
        instrumented.mutate({
            [nodeProperty]: instrumentedProperty
        });
        window.assert && assert.throws(()=>{
            instrumented.mutate({
                [nodeProperty]: uninstrumentedProperty
            });
        }, `cannot remove instrumentation from the Node's ${nodeProperty}`);
        instrumented.dispose();
        apiValidation.enabled = true;
        apiValidation.simHasStarted = true;
        // instrumentedNodeWithDefaultInstrumentedProperty => instrumented property (after startup)
        const instrumented1 = new Node({
            tandem: Tandem.ROOT_TEST.createTandem(`${nodeField}MyUniquelyNamedNodeThatWillNotBeDuplicated1`),
            [phetioNodePropertyInstrumentedKeyName]: true
        });
        // @ts-expect-error - no sure now to do this well in typescript
        assert.ok(instrumented1[nodeProperty]['targetProperty'] === instrumented1[nodeProperty].ownedPhetioProperty);
        // @ts-expect-error - no sure now to do this well in typescript
        assert.ok(instrumented1['linkedElements'].length === 0, `no linked elements for default ${nodeProperty}`);
        // @ts-expect-error - no sure now to do this well in typescript
        testNodeAndProperty(instrumented1, instrumented1[nodeProperty]);
        // instrumentedNodeWithDefaultInstrumentedProperty => uninstrumented property (after startup)
        const instrumented2 = new Node({
            tandem: Tandem.ROOT_TEST.createTandem(`${nodeField}MyUniquelyNamedNodeThatWillNotBeDuplicated2`),
            [phetioNodePropertyInstrumentedKeyName]: true
        });
        window.assert && assert.throws(()=>{
            // @ts-expect-error - no sure now to do this well in typescript
            instrumented2[nodePropertySetter](uninstrumentedProperty);
        }, `cannot remove instrumentation from the Node's ${nodeProperty}`);
        // instrumentedNodeWithPassedInInstrumentedProperty => instrumented property (after startup)
        const instrumented3 = new Node({
            tandem: Tandem.ROOT_TEST.createTandem(`${nodeField}MyUniquelyNamedNodeThatWillNotBeDuplicated3`),
            [nodeProperty]: instrumentedProperty
        });
        window.assert && assert.throws(()=>{
            instrumented3.mutate({
                [nodeProperty]: otherInstrumentedProperty
            });
        }, 'cannot swap out one instrumented for another');
        // instrumentedNodeWithPassedInInstrumentedProperty => uninstrumented property (after startup)
        const instrumented4 = new Node({
            tandem: Tandem.ROOT_TEST.createTandem(`${nodeField}MyUniquelyNamedNodeThatWillNotBeDuplicated4`),
            [nodeProperty]: instrumentedProperty
        });
        window.assert && assert.throws(()=>{
            instrumented4.mutate({
                [nodeProperty]: uninstrumentedProperty
            });
        }, `cannot remove instrumentation from the Node's ${nodeProperty}`);
        const instrumented5 = new Node({});
        instrumented5.mutate({
            [nodeProperty]: instrumentedProperty
        });
        instrumented5.mutate({
            tandem: Tandem.ROOT_TEST.createTandem(`${nodeField}MyUniquelyNamedNodeThatWillNotBeDuplicated5`)
        });
        window.assert && assert.throws(()=>{
            instrumented5.mutate({
                [nodeProperty]: uninstrumentedProperty
            });
        }, `cannot remove instrumentation from the Node's ${nodeProperty}`);
        apiValidation.enabled = false;
        apiValidation.enabled = true;
        apiValidation.simHasStarted = false;
        // instrumentedNodeOptsOutOfDefault => instrumented Property set later (but before startup)
        const instrumented6 = new Node({
            tandem: Tandem.ROOT_TEST.createTandem(`${nodeField}MyNode6`),
            [phetioNodePropertyInstrumentedKeyName]: false // required when passing in an instrumented one later
        });
        // @ts-expect-error - no sure now to do this well in typescript
        instrumented6[nodeProperty] = new BooleanProperty(false, {
            tandem: Tandem.ROOT_TEST.createTandem(`${nodeField}MyBooleanProperty`)
        });
        apiValidation.enabled = false;
        instrumented6.dispose();
        instrumented1.dispose();
        // These can't be disposed because they were broken while creating (on purpose in an assert.throws()). These elements
        // have special Tandem component names to make sure that they don't interfere with other tests (since they can't be
        // removed from the registry
        // instrumented2.dispose();
        // instrumented3.dispose();
        // instrumented4.dispose();
        // instrumented5.dispose();
        instrumented = new Node({
            tandem: Tandem.ROOT_TEST.createTandem(`${nodeField}MyNode`),
            [phetioNodePropertyInstrumentedKeyName]: true
        });
        window.assert && assert.throws(()=>{
            // @ts-expect-error - no sure now to do this well in typescript
            instrumented[nodePropertySetter](null);
        }, `cannot clear out an instrumented ${nodeProperty}`);
        instrumented.dispose();
        // If by default this property isn't instrumented, then this should cause an error
        if (!ownedPropertyInstrumented) {
            instrumented = new Node({
                tandem: Tandem.ROOT_TEST.createTandem(`${nodeField}MyNode`)
            });
            window.assert && assert.throws(()=>{
                // @ts-expect-error - no sure now to do this well in typescript
                instrumented[phetioNodePropertyInstrumentedKeyName] = true;
            }, `cannot set ${phetioNodePropertyInstrumentedKeyName} after instrumentation`);
            instrumented.dispose();
        }
        instrumentedProperty.dispose();
        otherInstrumentedProperty.dispose();
        apiValidation.simHasStarted = previousSimStarted;
        apiValidation.enabled = previousAPIValidationEnabled;
    };
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvbm9kZXMvTm9kZVRlc3RzLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE3LTIwMjQsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIE5vZGUgdGVzdHNcbiAqXG4gKiBAYXV0aG9yIFNhbSBSZWlkIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxuICovXG5cbmltcG9ydCBCb29sZWFuUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vYXhvbi9qcy9Cb29sZWFuUHJvcGVydHkuanMnO1xuaW1wb3J0IFRQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi9heG9uL2pzL1RQcm9wZXJ0eS5qcyc7XG5pbXBvcnQgQm91bmRzMiBmcm9tICcuLi8uLi8uLi9kb3QvanMvQm91bmRzMi5qcyc7XG5pbXBvcnQgVmVjdG9yMiBmcm9tICcuLi8uLi8uLi9kb3QvanMvVmVjdG9yMi5qcyc7XG5pbXBvcnQgeyBTaGFwZSB9IGZyb20gJy4uLy4uLy4uL2tpdGUvanMvaW1wb3J0cy5qcyc7XG5pbXBvcnQgSW50ZW50aW9uYWxBbnkgZnJvbSAnLi4vLi4vLi4vcGhldC1jb3JlL2pzL3R5cGVzL0ludGVudGlvbmFsQW55LmpzJztcbmltcG9ydCBUYW5kZW0gZnJvbSAnLi4vLi4vLi4vdGFuZGVtL2pzL1RhbmRlbS5qcyc7XG5pbXBvcnQgVG91Y2ggZnJvbSAnLi4vaW5wdXQvVG91Y2guanMnO1xuaW1wb3J0IE5vZGUgZnJvbSAnLi9Ob2RlLmpzJztcbmltcG9ydCBSZWN0YW5nbGUgZnJvbSAnLi9SZWN0YW5nbGUuanMnO1xuXG5RVW5pdC5tb2R1bGUoICdOb2RlJyApO1xuXG5mdW5jdGlvbiBmYWtlVG91Y2hQb2ludGVyKCB2ZWN0b3I6IFZlY3RvcjIgKTogVG91Y2gge1xuICByZXR1cm4gbmV3IFRvdWNoKCAwLCB2ZWN0b3IsIHt9IGFzIEV2ZW50ICk7XG59XG5cblFVbml0LnRlc3QoICdNb3VzZSBhbmQgVG91Y2ggYXJlYXMnLCBhc3NlcnQgPT4ge1xuICBjb25zdCBub2RlID0gbmV3IE5vZGUoKTtcbiAgY29uc3QgcmVjdCA9IG5ldyBSZWN0YW5nbGUoIDAsIDAsIDEwMCwgNTAgKTtcbiAgcmVjdC5waWNrYWJsZSA9IHRydWU7XG5cbiAgbm9kZS5hZGRDaGlsZCggcmVjdCApO1xuXG4gIGFzc2VydC5vayggISFyZWN0LmhpdFRlc3QoIG5ldyBWZWN0b3IyKCAxMCwgMTAgKSApLCAnUmVjdGFuZ2xlIGludGVyc2VjdGlvbicgKTtcbiAgYXNzZXJ0Lm9rKCAhIXJlY3QuaGl0VGVzdCggbmV3IFZlY3RvcjIoIDkwLCAxMCApICksICdSZWN0YW5nbGUgaW50ZXJzZWN0aW9uJyApO1xuICBhc3NlcnQub2soICFyZWN0LmhpdFRlc3QoIG5ldyBWZWN0b3IyKCAtMTAsIDEwICkgKSwgJ1JlY3RhbmdsZSBubyBpbnRlcnNlY3Rpb24nICk7XG5cbiAgbm9kZS50b3VjaEFyZWEgPSBTaGFwZS5yZWN0YW5nbGUoIC01MCwgLTUwLCAxMDAsIDEwMCApO1xuXG4gIGFzc2VydC5vayggISFub2RlLmhpdFRlc3QoIG5ldyBWZWN0b3IyKCAxMCwgMTAgKSApLCAnTm9kZSBpbnRlcnNlY3Rpb24nICk7XG4gIGFzc2VydC5vayggISFub2RlLmhpdFRlc3QoIG5ldyBWZWN0b3IyKCA5MCwgMTAgKSApLCAnTm9kZSBpbnRlcnNlY3Rpb24nICk7XG4gIGFzc2VydC5vayggIW5vZGUuaGl0VGVzdCggbmV3IFZlY3RvcjIoIC0xMCwgMTAgKSApLCAnTm9kZSBubyBpbnRlcnNlY3Rpb24nICk7XG5cbiAgYXNzZXJ0Lm9rKCAhIW5vZGUudHJhaWxVbmRlclBvaW50ZXIoIGZha2VUb3VjaFBvaW50ZXIoIG5ldyBWZWN0b3IyKCAxMCwgMTAgKSApICksICdOb2RlIGludGVyc2VjdGlvbiAoaXNUb3VjaCknICk7XG4gIGFzc2VydC5vayggISFub2RlLnRyYWlsVW5kZXJQb2ludGVyKCBmYWtlVG91Y2hQb2ludGVyKCBuZXcgVmVjdG9yMiggOTAsIDEwICkgKSApLCAnTm9kZSBpbnRlcnNlY3Rpb24gKGlzVG91Y2gpJyApO1xuICBhc3NlcnQub2soICEhbm9kZS50cmFpbFVuZGVyUG9pbnRlciggZmFrZVRvdWNoUG9pbnRlciggbmV3IFZlY3RvcjIoIC0xMCwgMTAgKSApICksICdOb2RlIGludGVyc2VjdGlvbiAoaXNUb3VjaCknICk7XG5cbiAgbm9kZS5jbGlwQXJlYSA9IFNoYXBlLnJlY3RhbmdsZSggMCwgMCwgNTAsIDUwICk7XG5cbiAgLy8gcG9pbnRzIG91dHNpZGUgdGhlIGNsaXAgYXJlYSBzaG91bGRuJ3QgcmVnaXN0ZXIgYXMgaGl0c1xuICBhc3NlcnQub2soICEhbm9kZS50cmFpbFVuZGVyUG9pbnRlciggZmFrZVRvdWNoUG9pbnRlciggbmV3IFZlY3RvcjIoIDEwLCAxMCApICkgKSwgJ05vZGUgaW50ZXJzZWN0aW9uIChpc1RvdWNoIHdpdGggY2xpcEFyZWEpJyApO1xuICBhc3NlcnQub2soICFub2RlLnRyYWlsVW5kZXJQb2ludGVyKCBmYWtlVG91Y2hQb2ludGVyKCBuZXcgVmVjdG9yMiggOTAsIDEwICkgKSApLCAnTm9kZSBubyBpbnRlcnNlY3Rpb24gKGlzVG91Y2ggd2l0aCBjbGlwQXJlYSknICk7XG4gIGFzc2VydC5vayggIW5vZGUudHJhaWxVbmRlclBvaW50ZXIoIGZha2VUb3VjaFBvaW50ZXIoIG5ldyBWZWN0b3IyKCAtMTAsIDEwICkgKSApLCAnTm9kZSBubyBpbnRlcnNlY3Rpb24gKGlzVG91Y2ggd2l0aCBjbGlwQXJlYSknICk7XG59ICk7XG5cblxuY29uc3QgZXBzaWxvbiA9IDAuMDAwMDAwMDAxO1xuXG5RVW5pdC50ZXN0KCAnUG9pbnRzIChwYXJlbnQgYW5kIGNoaWxkKScsIGFzc2VydCA9PiB7XG4gIGNvbnN0IGEgPSBuZXcgTm9kZSgpO1xuICBjb25zdCBiID0gbmV3IE5vZGUoKTtcbiAgYS5hZGRDaGlsZCggYiApO1xuICBhLnggPSAxMDtcbiAgYi55ID0gMTA7XG5cbiAgYXNzZXJ0Lm9rKCBuZXcgVmVjdG9yMiggNSwgMTUgKS5lcXVhbHNFcHNpbG9uKCBiLmxvY2FsVG9QYXJlbnRQb2ludCggbmV3IFZlY3RvcjIoIDUsIDUgKSApLCBlcHNpbG9uICksICdsb2NhbFRvUGFyZW50UG9pbnQgb24gY2hpbGQnICk7XG4gIGFzc2VydC5vayggbmV3IFZlY3RvcjIoIDE1LCA1ICkuZXF1YWxzRXBzaWxvbiggYS5sb2NhbFRvUGFyZW50UG9pbnQoIG5ldyBWZWN0b3IyKCA1LCA1ICkgKSwgZXBzaWxvbiApLCAnbG9jYWxUb1BhcmVudFBvaW50IG9uIHJvb3QnICk7XG5cbiAgYXNzZXJ0Lm9rKCBuZXcgVmVjdG9yMiggNSwgLTUgKS5lcXVhbHNFcHNpbG9uKCBiLnBhcmVudFRvTG9jYWxQb2ludCggbmV3IFZlY3RvcjIoIDUsIDUgKSApLCBlcHNpbG9uICksICdwYXJlbnRUb0xvY2FsUG9pbnQgb24gY2hpbGQnICk7XG4gIGFzc2VydC5vayggbmV3IFZlY3RvcjIoIC01LCA1ICkuZXF1YWxzRXBzaWxvbiggYS5wYXJlbnRUb0xvY2FsUG9pbnQoIG5ldyBWZWN0b3IyKCA1LCA1ICkgKSwgZXBzaWxvbiApLCAncGFyZW50VG9Mb2NhbFBvaW50IG9uIHJvb3QnICk7XG5cbiAgYXNzZXJ0Lm9rKCBuZXcgVmVjdG9yMiggMTUsIDE1ICkuZXF1YWxzRXBzaWxvbiggYi5sb2NhbFRvR2xvYmFsUG9pbnQoIG5ldyBWZWN0b3IyKCA1LCA1ICkgKSwgZXBzaWxvbiApLCAnbG9jYWxUb0dsb2JhbFBvaW50IG9uIGNoaWxkJyApO1xuICBhc3NlcnQub2soIG5ldyBWZWN0b3IyKCAxNSwgNSApLmVxdWFsc0Vwc2lsb24oIGEubG9jYWxUb0dsb2JhbFBvaW50KCBuZXcgVmVjdG9yMiggNSwgNSApICksIGVwc2lsb24gKSwgJ2xvY2FsVG9HbG9iYWxQb2ludCBvbiByb290IChzYW1lIGFzIGxvY2FsVG9wYXJlbnQpJyApO1xuXG4gIGFzc2VydC5vayggbmV3IFZlY3RvcjIoIC01LCAtNSApLmVxdWFsc0Vwc2lsb24oIGIuZ2xvYmFsVG9Mb2NhbFBvaW50KCBuZXcgVmVjdG9yMiggNSwgNSApICksIGVwc2lsb24gKSwgJ2dsb2JhbFRvTG9jYWxQb2ludCBvbiBjaGlsZCcgKTtcbiAgYXNzZXJ0Lm9rKCBuZXcgVmVjdG9yMiggLTUsIDUgKS5lcXVhbHNFcHNpbG9uKCBhLmdsb2JhbFRvTG9jYWxQb2ludCggbmV3IFZlY3RvcjIoIDUsIDUgKSApLCBlcHNpbG9uICksICdnbG9iYWxUb0xvY2FsUG9pbnQgb24gcm9vdCAoc2FtZSBhcyBsb2NhbFRvcGFyZW50KScgKTtcblxuICBhc3NlcnQub2soIG5ldyBWZWN0b3IyKCAxNSwgNSApLmVxdWFsc0Vwc2lsb24oIGIucGFyZW50VG9HbG9iYWxQb2ludCggbmV3IFZlY3RvcjIoIDUsIDUgKSApLCBlcHNpbG9uICksICdwYXJlbnRUb0dsb2JhbFBvaW50IG9uIGNoaWxkJyApO1xuICBhc3NlcnQub2soIG5ldyBWZWN0b3IyKCA1LCA1ICkuZXF1YWxzRXBzaWxvbiggYS5wYXJlbnRUb0dsb2JhbFBvaW50KCBuZXcgVmVjdG9yMiggNSwgNSApICksIGVwc2lsb24gKSwgJ3BhcmVudFRvR2xvYmFsUG9pbnQgb24gcm9vdCcgKTtcblxuICBhc3NlcnQub2soIG5ldyBWZWN0b3IyKCAtNSwgNSApLmVxdWFsc0Vwc2lsb24oIGIuZ2xvYmFsVG9QYXJlbnRQb2ludCggbmV3IFZlY3RvcjIoIDUsIDUgKSApLCBlcHNpbG9uICksICdnbG9iYWxUb1BhcmVudFBvaW50IG9uIGNoaWxkJyApO1xuICBhc3NlcnQub2soIG5ldyBWZWN0b3IyKCA1LCA1ICkuZXF1YWxzRXBzaWxvbiggYS5nbG9iYWxUb1BhcmVudFBvaW50KCBuZXcgVmVjdG9yMiggNSwgNSApICksIGVwc2lsb24gKSwgJ2dsb2JhbFRvUGFyZW50UG9pbnQgb24gcm9vdCcgKTtcblxufSApO1xuXG5RVW5pdC50ZXN0KCAnQm91bmRzIChwYXJlbnQgYW5kIGNoaWxkKScsIGFzc2VydCA9PiB7XG4gIGNvbnN0IGEgPSBuZXcgTm9kZSgpO1xuICBjb25zdCBiID0gbmV3IE5vZGUoKTtcbiAgYS5hZGRDaGlsZCggYiApO1xuICBhLnggPSAxMDtcbiAgYi55ID0gMTA7XG5cbiAgY29uc3QgYm91bmRzID0gbmV3IEJvdW5kczIoIDQsIDQsIDIwLCAzMCApO1xuXG4gIGFzc2VydC5vayggbmV3IEJvdW5kczIoIDQsIDE0LCAyMCwgNDAgKS5lcXVhbHNFcHNpbG9uKCBiLmxvY2FsVG9QYXJlbnRCb3VuZHMoIGJvdW5kcyApLCBlcHNpbG9uICksICdsb2NhbFRvUGFyZW50Qm91bmRzIG9uIGNoaWxkJyApO1xuICBhc3NlcnQub2soIG5ldyBCb3VuZHMyKCAxNCwgNCwgMzAsIDMwICkuZXF1YWxzRXBzaWxvbiggYS5sb2NhbFRvUGFyZW50Qm91bmRzKCBib3VuZHMgKSwgZXBzaWxvbiApLCAnbG9jYWxUb1BhcmVudEJvdW5kcyBvbiByb290JyApO1xuXG4gIGFzc2VydC5vayggbmV3IEJvdW5kczIoIDQsIC02LCAyMCwgMjAgKS5lcXVhbHNFcHNpbG9uKCBiLnBhcmVudFRvTG9jYWxCb3VuZHMoIGJvdW5kcyApLCBlcHNpbG9uICksICdwYXJlbnRUb0xvY2FsQm91bmRzIG9uIGNoaWxkJyApO1xuICBhc3NlcnQub2soIG5ldyBCb3VuZHMyKCAtNiwgNCwgMTAsIDMwICkuZXF1YWxzRXBzaWxvbiggYS5wYXJlbnRUb0xvY2FsQm91bmRzKCBib3VuZHMgKSwgZXBzaWxvbiApLCAncGFyZW50VG9Mb2NhbEJvdW5kcyBvbiByb290JyApO1xuXG4gIGFzc2VydC5vayggbmV3IEJvdW5kczIoIDE0LCAxNCwgMzAsIDQwICkuZXF1YWxzRXBzaWxvbiggYi5sb2NhbFRvR2xvYmFsQm91bmRzKCBib3VuZHMgKSwgZXBzaWxvbiApLCAnbG9jYWxUb0dsb2JhbEJvdW5kcyBvbiBjaGlsZCcgKTtcbiAgYXNzZXJ0Lm9rKCBuZXcgQm91bmRzMiggMTQsIDQsIDMwLCAzMCApLmVxdWFsc0Vwc2lsb24oIGEubG9jYWxUb0dsb2JhbEJvdW5kcyggYm91bmRzICksIGVwc2lsb24gKSwgJ2xvY2FsVG9HbG9iYWxCb3VuZHMgb24gcm9vdCAoc2FtZSBhcyBsb2NhbFRvUGFyZW50KScgKTtcblxuICBhc3NlcnQub2soIG5ldyBCb3VuZHMyKCAtNiwgLTYsIDEwLCAyMCApLmVxdWFsc0Vwc2lsb24oIGIuZ2xvYmFsVG9Mb2NhbEJvdW5kcyggYm91bmRzICksIGVwc2lsb24gKSwgJ2dsb2JhbFRvTG9jYWxCb3VuZHMgb24gY2hpbGQnICk7XG4gIGFzc2VydC5vayggbmV3IEJvdW5kczIoIC02LCA0LCAxMCwgMzAgKS5lcXVhbHNFcHNpbG9uKCBhLmdsb2JhbFRvTG9jYWxCb3VuZHMoIGJvdW5kcyApLCBlcHNpbG9uICksICdnbG9iYWxUb0xvY2FsQm91bmRzIG9uIHJvb3QgKHNhbWUgYXMgbG9jYWxUb1BhcmVudCknICk7XG5cbiAgYXNzZXJ0Lm9rKCBuZXcgQm91bmRzMiggMTQsIDQsIDMwLCAzMCApLmVxdWFsc0Vwc2lsb24oIGIucGFyZW50VG9HbG9iYWxCb3VuZHMoIGJvdW5kcyApLCBlcHNpbG9uICksICdwYXJlbnRUb0dsb2JhbEJvdW5kcyBvbiBjaGlsZCcgKTtcbiAgYXNzZXJ0Lm9rKCBuZXcgQm91bmRzMiggNCwgNCwgMjAsIDMwICkuZXF1YWxzRXBzaWxvbiggYS5wYXJlbnRUb0dsb2JhbEJvdW5kcyggYm91bmRzICksIGVwc2lsb24gKSwgJ3BhcmVudFRvR2xvYmFsQm91bmRzIG9uIHJvb3QnICk7XG5cbiAgYXNzZXJ0Lm9rKCBuZXcgQm91bmRzMiggLTYsIDQsIDEwLCAzMCApLmVxdWFsc0Vwc2lsb24oIGIuZ2xvYmFsVG9QYXJlbnRCb3VuZHMoIGJvdW5kcyApLCBlcHNpbG9uICksICdnbG9iYWxUb1BhcmVudEJvdW5kcyBvbiBjaGlsZCcgKTtcbiAgYXNzZXJ0Lm9rKCBuZXcgQm91bmRzMiggNCwgNCwgMjAsIDMwICkuZXF1YWxzRXBzaWxvbiggYS5nbG9iYWxUb1BhcmVudEJvdW5kcyggYm91bmRzICksIGVwc2lsb24gKSwgJ2dsb2JhbFRvUGFyZW50Qm91bmRzIG9uIHJvb3QnICk7XG59ICk7XG5cblFVbml0LnRlc3QoICdQb2ludHMgKG9yZGVyIG9mIHRyYW5zZm9ybXMpJywgYXNzZXJ0ID0+IHtcbiAgY29uc3QgYSA9IG5ldyBOb2RlKCk7XG4gIGNvbnN0IGIgPSBuZXcgTm9kZSgpO1xuICBjb25zdCBjID0gbmV3IE5vZGUoKTtcbiAgYS5hZGRDaGlsZCggYiApO1xuICBiLmFkZENoaWxkKCBjICk7XG4gIGEueCA9IDEwO1xuICBiLnNjYWxlKCAyICk7XG4gIGMueSA9IDEwO1xuXG4gIGFzc2VydC5vayggbmV3IFZlY3RvcjIoIDIwLCAzMCApLmVxdWFsc0Vwc2lsb24oIGMubG9jYWxUb0dsb2JhbFBvaW50KCBuZXcgVmVjdG9yMiggNSwgNSApICksIGVwc2lsb24gKSwgJ2xvY2FsVG9HbG9iYWxQb2ludCcgKTtcbiAgYXNzZXJ0Lm9rKCBuZXcgVmVjdG9yMiggLTIuNSwgLTcuNSApLmVxdWFsc0Vwc2lsb24oIGMuZ2xvYmFsVG9Mb2NhbFBvaW50KCBuZXcgVmVjdG9yMiggNSwgNSApICksIGVwc2lsb24gKSwgJ2dsb2JhbFRvTG9jYWxQb2ludCcgKTtcbiAgYXNzZXJ0Lm9rKCBuZXcgVmVjdG9yMiggMjAsIDEwICkuZXF1YWxzRXBzaWxvbiggYy5wYXJlbnRUb0dsb2JhbFBvaW50KCBuZXcgVmVjdG9yMiggNSwgNSApICksIGVwc2lsb24gKSwgJ3BhcmVudFRvR2xvYmFsUG9pbnQnICk7XG4gIGFzc2VydC5vayggbmV3IFZlY3RvcjIoIC0yLjUsIDIuNSApLmVxdWFsc0Vwc2lsb24oIGMuZ2xvYmFsVG9QYXJlbnRQb2ludCggbmV3IFZlY3RvcjIoIDUsIDUgKSApLCBlcHNpbG9uICksICdnbG9iYWxUb1BhcmVudFBvaW50JyApO1xufSApO1xuXG5RVW5pdC50ZXN0KCAnQm91bmRzIChvcmRlciBvZiB0cmFuc2Zvcm1zKScsIGFzc2VydCA9PiB7XG4gIGNvbnN0IGEgPSBuZXcgTm9kZSgpO1xuICBjb25zdCBiID0gbmV3IE5vZGUoKTtcbiAgY29uc3QgYyA9IG5ldyBOb2RlKCk7XG4gIGEuYWRkQ2hpbGQoIGIgKTtcbiAgYi5hZGRDaGlsZCggYyApO1xuICBhLnggPSAxMDtcbiAgYi5zY2FsZSggMiApO1xuICBjLnkgPSAxMDtcblxuICBjb25zdCBib3VuZHMgPSBuZXcgQm91bmRzMiggNCwgNCwgMjAsIDMwICk7XG5cbiAgYXNzZXJ0Lm9rKCBuZXcgQm91bmRzMiggMTgsIDI4LCA1MCwgODAgKS5lcXVhbHNFcHNpbG9uKCBjLmxvY2FsVG9HbG9iYWxCb3VuZHMoIGJvdW5kcyApLCBlcHNpbG9uICksICdsb2NhbFRvR2xvYmFsQm91bmRzJyApO1xuICBhc3NlcnQub2soIG5ldyBCb3VuZHMyKCAtMywgLTgsIDUsIDUgKS5lcXVhbHNFcHNpbG9uKCBjLmdsb2JhbFRvTG9jYWxCb3VuZHMoIGJvdW5kcyApLCBlcHNpbG9uICksICdnbG9iYWxUb0xvY2FsQm91bmRzJyApO1xuICBhc3NlcnQub2soIG5ldyBCb3VuZHMyKCAxOCwgOCwgNTAsIDYwICkuZXF1YWxzRXBzaWxvbiggYy5wYXJlbnRUb0dsb2JhbEJvdW5kcyggYm91bmRzICksIGVwc2lsb24gKSwgJ3BhcmVudFRvR2xvYmFsQm91bmRzJyApO1xuICBhc3NlcnQub2soIG5ldyBCb3VuZHMyKCAtMywgMiwgNSwgMTUgKS5lcXVhbHNFcHNpbG9uKCBjLmdsb2JhbFRvUGFyZW50Qm91bmRzKCBib3VuZHMgKSwgZXBzaWxvbiApLCAnZ2xvYmFsVG9QYXJlbnRCb3VuZHMnICk7XG59ICk7XG5cblFVbml0LnRlc3QoICdUcmFpbCBhbmQgTm9kZSB0cmFuc2Zvcm0gZXF1aXZhbGVuY2UnLCBhc3NlcnQgPT4ge1xuICBjb25zdCBhID0gbmV3IE5vZGUoKTtcbiAgY29uc3QgYiA9IG5ldyBOb2RlKCk7XG4gIGNvbnN0IGMgPSBuZXcgTm9kZSgpO1xuICBhLmFkZENoaWxkKCBiICk7XG4gIGIuYWRkQ2hpbGQoIGMgKTtcbiAgYS54ID0gMTA7XG4gIGIuc2NhbGUoIDIgKTtcbiAgYy55ID0gMTA7XG5cbiAgY29uc3QgdHJhaWxNYXRyaXggPSBjLmdldFVuaXF1ZVRyYWlsKCkuZ2V0TWF0cml4KCk7XG4gIGNvbnN0IG5vZGVNYXRyaXggPSBjLmdldFVuaXF1ZVRyYW5zZm9ybSgpLmdldE1hdHJpeCgpO1xuICBhc3NlcnQub2soIHRyYWlsTWF0cml4LmVxdWFsc0Vwc2lsb24oIG5vZGVNYXRyaXgsIGVwc2lsb24gKSwgJ1RyYWlsIGFuZCBOb2RlIHRyYW5zZm9ybSBlcXVpdmFsZW5jZScgKTtcbn0gKTtcblxuUVVuaXQudGVzdCggJ011dHVhbGx5IGV4Y2x1c2l2ZSBvcHRpb25zJywgYXNzZXJ0ID0+IHtcblxuICBhc3NlcnQub2soIHRydWUsICdhbHdheXMgdHJ1ZSwgZXZlbiB3aGVuIGFzc2VydGlvbnMgYXJlIG5vdCBvbi4nICk7XG5cbiAgY29uc3QgdmlzaWJsZVByb3BlcnR5ID0gbmV3IEJvb2xlYW5Qcm9wZXJ0eSggdHJ1ZSApO1xuICB3aW5kb3cuYXNzZXJ0ICYmIGFzc2VydC50aHJvd3MoICgpID0+IHtcbiAgICByZXR1cm4gbmV3IE5vZGUoIHtcbiAgICAgIHZpc2libGU6IGZhbHNlLFxuICAgICAgdmlzaWJsZVByb3BlcnR5OiB2aXNpYmxlUHJvcGVydHlcbiAgICB9ICk7XG4gIH0sICd2aXNpYmxlIGFuZCB2aXNpYmxlUHJvcGVydHkgdmFsdWVzIGRvIG5vdCBtYXRjaCcgKTtcblxuICBjb25zdCBwaWNrYWJsZVByb3BlcnR5ID0gbmV3IEJvb2xlYW5Qcm9wZXJ0eSggdHJ1ZSApO1xuICB3aW5kb3cuYXNzZXJ0ICYmIGFzc2VydC50aHJvd3MoICgpID0+IHtcbiAgICByZXR1cm4gbmV3IE5vZGUoIHtcbiAgICAgIHBpY2thYmxlOiBmYWxzZSxcbiAgICAgIHBpY2thYmxlUHJvcGVydHk6IHBpY2thYmxlUHJvcGVydHlcbiAgICB9ICk7XG4gIH0sICdwaWNrYWJsZSBhbmQgcGlja2FibGVQcm9wZXJ0eSB2YWx1ZXMgZG8gbm90IG1hdGNoJyApO1xuXG4gIGNvbnN0IGVuYWJsZWRQcm9wZXJ0eSA9IG5ldyBCb29sZWFuUHJvcGVydHkoIHRydWUgKTtcbiAgd2luZG93LmFzc2VydCAmJiBhc3NlcnQudGhyb3dzKCAoKSA9PiB7XG4gICAgcmV0dXJuIG5ldyBOb2RlKCB7XG4gICAgICBlbmFibGVkOiBmYWxzZSxcbiAgICAgIGVuYWJsZWRQcm9wZXJ0eTogZW5hYmxlZFByb3BlcnR5XG4gICAgfSApO1xuICB9LCAnZW5hYmxlZCBhbmQgZW5hYmxlZFByb3BlcnR5IHZhbHVlcyBkbyBub3QgbWF0Y2gnICk7XG5cbiAgY29uc3QgaW5wdXRFbmFibGVkUHJvcGVydHkgPSBuZXcgQm9vbGVhblByb3BlcnR5KCB0cnVlICk7XG4gIHdpbmRvdy5hc3NlcnQgJiYgYXNzZXJ0LnRocm93cyggKCkgPT4ge1xuICAgIHJldHVybiBuZXcgTm9kZSgge1xuICAgICAgaW5wdXRFbmFibGVkOiBmYWxzZSxcbiAgICAgIGlucHV0RW5hYmxlZFByb3BlcnR5OiBpbnB1dEVuYWJsZWRQcm9wZXJ0eVxuICAgIH0gKTtcbiAgfSwgJ2lucHV0RW5hYmxlZCBhbmQgaW5wdXRFbmFibGVkUHJvcGVydHkgdmFsdWVzIGRvIG5vdCBtYXRjaCcgKTtcblxufSApO1xuXG5pZiAoIFRhbmRlbS5QSEVUX0lPX0VOQUJMRUQgKSB7XG5cbiAgUVVuaXQudGVzdCggJ05vZGUgaW5zdHJ1bWVudGVkIHZpc2libGVQcm9wZXJ0eScsIGFzc2VydCA9PiB0ZXN0SW5zdHJ1bWVudGVkTm9kZVByb3BlcnR5KCBhc3NlcnQsICd2aXNpYmxlJyxcbiAgICAndmlzaWJsZVByb3BlcnR5JywgJ3NldFZpc2libGVQcm9wZXJ0eScsXG4gICAgdHJ1ZSwgJ3BoZXRpb1Zpc2libGVQcm9wZXJ0eUluc3RydW1lbnRlZCcgKSApO1xuXG4gIFFVbml0LnRlc3QoICdOb2RlIGluc3RydW1lbnRlZCBlbmFibGVkUHJvcGVydHknLCBhc3NlcnQgPT4gdGVzdEluc3RydW1lbnRlZE5vZGVQcm9wZXJ0eSggYXNzZXJ0LCAnZW5hYmxlZCcsXG4gICAgJ2VuYWJsZWRQcm9wZXJ0eScsICdzZXRFbmFibGVkUHJvcGVydHknLFxuICAgIE5vZGUuREVGQVVMVF9OT0RFX09QVElPTlMucGhldGlvRW5hYmxlZFByb3BlcnR5SW5zdHJ1bWVudGVkLCAncGhldGlvRW5hYmxlZFByb3BlcnR5SW5zdHJ1bWVudGVkJyApICk7XG5cbiAgUVVuaXQudGVzdCggJ05vZGUgaW5zdHJ1bWVudGVkIGlucHV0RW5hYmxlZFByb3BlcnR5JywgYXNzZXJ0ID0+IHRlc3RJbnN0cnVtZW50ZWROb2RlUHJvcGVydHkoIGFzc2VydCwgJ2lucHV0RW5hYmxlZCcsXG4gICAgJ2lucHV0RW5hYmxlZFByb3BlcnR5JywgJ3NldElucHV0RW5hYmxlZFByb3BlcnR5JyxcbiAgICBOb2RlLkRFRkFVTFRfTk9ERV9PUFRJT05TLnBoZXRpb0lucHV0RW5hYmxlZFByb3BlcnR5SW5zdHJ1bWVudGVkLCAncGhldGlvSW5wdXRFbmFibGVkUHJvcGVydHlJbnN0cnVtZW50ZWQnICkgKTtcblxuICAvKipcbiAgICogRmFjdG9yIG91dCBhIHdheSB0byB0ZXN0IGFkZGVkIFByb3BlcnRpZXMgdG8gTm9kZSBhbmQgdGhlaXIgUGhFVC1pTyBpbnN0cnVtZW50YXRpb25cbiAgICogQHBhcmFtIGFzc2VydCAtIGZyb20gcXVuaXQgdGVzdFxuICAgKiBAcGFyYW0gbm9kZUZpZWxkIC0gbmFtZSBvZiBnZXR0ZXIvc2V0dGVyLCBsaWtlIGB2aXNpYmxlYFxuICAgKiBAcGFyYW0gbm9kZVByb3BlcnR5IC0gbmFtZSBvZiBwdWJsaWMgcHJvcGVydHksIGxpa2UgYHZpc2libGVQcm9wZXJ0eWBcbiAgICogQHBhcmFtIG5vZGVQcm9wZXJ0eVNldHRlciAtIG5hbWUgb2Ygc2V0dGVyIGZ1bmN0aW9uLCBsaWtlIGBzZXRWaXNpYmxlUHJvcGVydHlgXG4gICAqIEBwYXJhbSBvd25lZFByb3BlcnR5SW5zdHJ1bWVudGVkIC0gZGVmYXVsdCB2YWx1ZSBvZiBwaGV0aW9Ob2RlUHJvcGVydHlJbnN0cnVtZW50ZWRLZXlOYW1lIG9wdGlvbiBpbiBOb2RlLlxuICAgKiBAcGFyYW0gcGhldGlvTm9kZVByb3BlcnR5SW5zdHJ1bWVudGVkS2V5TmFtZSAtIGtleSBuYW1lIGZvciBzZXR0aW5nIG9wdC1pbiBQaEVULWlPIGluc3RydW1lbnRhdGlvblxuICAgKi9cbiAgY29uc3QgdGVzdEluc3RydW1lbnRlZE5vZGVQcm9wZXJ0eSA9ICggYXNzZXJ0OiBBc3NlcnQsIG5vZGVGaWVsZDoga2V5b2YgTm9kZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbm9kZVByb3BlcnR5OiBzdHJpbmcsIG5vZGVQcm9wZXJ0eVNldHRlcjogc3RyaW5nLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvd25lZFByb3BlcnR5SW5zdHJ1bWVudGVkOiBib29sZWFuLCBwaGV0aW9Ob2RlUHJvcGVydHlJbnN0cnVtZW50ZWRLZXlOYW1lOiBzdHJpbmcgKTogdm9pZCA9PiB7XG5cbiAgICBjb25zdCBhcGlWYWxpZGF0aW9uID0gcGhldC50YW5kZW0ucGhldGlvQVBJVmFsaWRhdGlvbjtcbiAgICBjb25zdCBwcmV2aW91c0FQSVZhbGlkYXRpb25FbmFibGVkID0gYXBpVmFsaWRhdGlvbi5lbmFibGVkO1xuICAgIGNvbnN0IHByZXZpb3VzU2ltU3RhcnRlZCA9IGFwaVZhbGlkYXRpb24uc2ltSGFzU3RhcnRlZDtcblxuICAgIGFwaVZhbGlkYXRpb24uc2ltSGFzU3RhcnRlZCA9IGZhbHNlO1xuXG4gICAgY29uc3QgdGVzdE5vZGVBbmRQcm9wZXJ0eSA9ICggbm9kZTogTm9kZSwgcHJvcGVydHk6IFRQcm9wZXJ0eTxJbnRlbnRpb25hbEFueT4gKSA9PiB7XG4gICAgICBjb25zdCBpbml0aWFsVmFsdWUgPSBub2RlWyBub2RlRmllbGQgXTtcbiAgICAgIGFzc2VydC5vayggcHJvcGVydHkudmFsdWUgPT09IG5vZGVbIG5vZGVGaWVsZCBdLCAnaW5pdGlhbCB2YWx1ZXMgc2hvdWxkIGJlIHRoZSBzYW1lJyApO1xuICAgICAgLy8gQHRzLWV4cGVjdC1lcnJvciAtIG5vIHN1cmUgbm93IHRvIGRvIHRoaXMgd2VsbCBpbiB0eXBlc2NyaXB0XG4gICAgICBub2RlWyBub2RlRmllbGQgXSA9ICFpbml0aWFsVmFsdWU7XG4gICAgICBhc3NlcnQub2soIHByb3BlcnR5LnZhbHVlID09PSAhaW5pdGlhbFZhbHVlLCAncHJvcGVydHkgc2hvdWxkIHJlZmxlY3Qgbm9kZSBjaGFuZ2UnICk7XG4gICAgICBwcm9wZXJ0eS52YWx1ZSA9IGluaXRpYWxWYWx1ZTtcbiAgICAgIGFzc2VydC5vayggbm9kZVsgbm9kZUZpZWxkIF0gPT09IGluaXRpYWxWYWx1ZSwgJ25vZGUgc2hvdWxkIHJlZmxlY3QgcHJvcGVydHkgY2hhbmdlJyApO1xuXG4gICAgICAvLyBAdHMtZXhwZWN0LWVycm9yIC0gbm8gc3VyZSBub3cgdG8gZG8gdGhpcyB3ZWxsIGluIHR5cGVzY3JpcHRcbiAgICAgIG5vZGVbIG5vZGVGaWVsZCBdID0gaW5pdGlhbFZhbHVlO1xuICAgIH07XG5cbiAgICBjb25zdCBpbnN0cnVtZW50ZWRQcm9wZXJ0eSA9IG5ldyBCb29sZWFuUHJvcGVydHkoIGZhbHNlLCB7IHRhbmRlbTogVGFuZGVtLlJPT1RfVEVTVC5jcmVhdGVUYW5kZW0oIGAke25vZGVGaWVsZH1NeVByb3BlcnR5YCApIH0gKTtcbiAgICBjb25zdCBvdGhlckluc3RydW1lbnRlZFByb3BlcnR5ID0gbmV3IEJvb2xlYW5Qcm9wZXJ0eSggZmFsc2UsIHsgdGFuZGVtOiBUYW5kZW0uUk9PVF9URVNULmNyZWF0ZVRhbmRlbSggYCR7bm9kZUZpZWxkfU15T3RoZXJQcm9wZXJ0eWAgKSB9ICk7XG4gICAgY29uc3QgdW5pbnN0cnVtZW50ZWRQcm9wZXJ0eSA9IG5ldyBCb29sZWFuUHJvcGVydHkoIGZhbHNlICk7XG5cbiAgICAvKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4gICAgIC8qIFRlc3RpbmcgdW5pbnN0cnVtZW50ZWQgTm9kZXNcbiAgICAgKi9cblxuXG4gICAgICAvLyB1bmluc3RydW1lbnRlZE5vZGUgPT4gbm8gcHJvcGVydHkgKGJlZm9yZSBzdGFydHVwKVxuICAgIGxldCB1bmluc3RydW1lbnRlZCA9IG5ldyBOb2RlKCk7XG4gICAgLy8gQHRzLWV4cGVjdC1lcnJvciAtIG5vIHN1cmUgbm93IHRvIGRvIHRoaXMgd2VsbCBpbiB0eXBlc2NyaXB0XG4gICAgYXNzZXJ0Lm9rKCB1bmluc3RydW1lbnRlZFsgbm9kZVByb3BlcnR5IF1bICd0YXJnZXRQcm9wZXJ0eScgXSA9PT0gdW5kZWZpbmVkICk7XG4gICAgLy8gQHRzLWV4cGVjdC1lcnJvciAtIG5vIHN1cmUgbm93IHRvIGRvIHRoaXMgd2VsbCBpbiB0eXBlc2NyaXB0XG4gICAgdGVzdE5vZGVBbmRQcm9wZXJ0eSggdW5pbnN0cnVtZW50ZWQsIHVuaW5zdHJ1bWVudGVkWyBub2RlUHJvcGVydHkgXSApO1xuXG4gICAgLy8gdW5pbnN0cnVtZW50ZWROb2RlID0+IHVuaW5zdHJ1bWVudGVkIHByb3BlcnR5IChiZWZvcmUgc3RhcnR1cClcbiAgICB1bmluc3RydW1lbnRlZCA9IG5ldyBOb2RlKCB7IFsgbm9kZVByb3BlcnR5IF06IHVuaW5zdHJ1bWVudGVkUHJvcGVydHkgfSApO1xuICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgLSBubyBzdXJlIG5vdyB0byBkbyB0aGlzIHdlbGwgaW4gdHlwZXNjcmlwdFxuICAgIGFzc2VydC5vayggdW5pbnN0cnVtZW50ZWRbIG5vZGVQcm9wZXJ0eSBdWyAndGFyZ2V0UHJvcGVydHknIF0gPT09IHVuaW5zdHJ1bWVudGVkUHJvcGVydHkgKTtcbiAgICB0ZXN0Tm9kZUFuZFByb3BlcnR5KCB1bmluc3RydW1lbnRlZCwgdW5pbnN0cnVtZW50ZWRQcm9wZXJ0eSApO1xuXG4gICAgLy91bmluc3RydW1lbnRlZE5vZGUgPT4gaW5zdHJ1bWVudGVkIHByb3BlcnR5IChiZWZvcmUgc3RhcnR1cClcbiAgICB1bmluc3RydW1lbnRlZCA9IG5ldyBOb2RlKCk7XG4gICAgdW5pbnN0cnVtZW50ZWQubXV0YXRlKCB7XG4gICAgICBbIG5vZGVQcm9wZXJ0eSBdOiBpbnN0cnVtZW50ZWRQcm9wZXJ0eVxuICAgIH0gKTtcbiAgICAvLyBAdHMtZXhwZWN0LWVycm9yIC0gbm8gc3VyZSBub3cgdG8gZG8gdGhpcyB3ZWxsIGluIHR5cGVzY3JpcHRcbiAgICBhc3NlcnQub2soIHVuaW5zdHJ1bWVudGVkWyBub2RlUHJvcGVydHkgXVsgJ3RhcmdldFByb3BlcnR5JyBdID09PSBpbnN0cnVtZW50ZWRQcm9wZXJ0eSApO1xuICAgIHRlc3ROb2RlQW5kUHJvcGVydHkoIHVuaW5zdHJ1bWVudGVkLCBpbnN0cnVtZW50ZWRQcm9wZXJ0eSApO1xuXG4gICAgLy8gIHVuaW5zdHJ1bWVudGVkTm9kZSA9PiBpbnN0cnVtZW50ZWQgcHJvcGVydHkgPT4gaW5zdHJ1bWVudCB0aGUgTm9kZSAoYmVmb3JlIHN0YXJ0dXApIE9LXG4gICAgdW5pbnN0cnVtZW50ZWQgPSBuZXcgTm9kZSgpO1xuICAgIHVuaW5zdHJ1bWVudGVkLm11dGF0ZSgge1xuICAgICAgWyBub2RlUHJvcGVydHkgXTogaW5zdHJ1bWVudGVkUHJvcGVydHlcbiAgICB9ICk7XG4gICAgdW5pbnN0cnVtZW50ZWQubXV0YXRlKCB7IHRhbmRlbTogVGFuZGVtLlJPT1RfVEVTVC5jcmVhdGVUYW5kZW0oIGAke25vZGVGaWVsZH1NeU5vZGVgICkgfSApO1xuICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgLSBubyBzdXJlIG5vdyB0byBkbyB0aGlzIHdlbGwgaW4gdHlwZXNjcmlwdFxuICAgIGFzc2VydC5vayggdW5pbnN0cnVtZW50ZWRbIG5vZGVQcm9wZXJ0eSBdWyAndGFyZ2V0UHJvcGVydHknIF0gPT09IGluc3RydW1lbnRlZFByb3BlcnR5ICk7XG4gICAgdGVzdE5vZGVBbmRQcm9wZXJ0eSggdW5pbnN0cnVtZW50ZWQsIGluc3RydW1lbnRlZFByb3BlcnR5ICk7XG4gICAgdW5pbnN0cnVtZW50ZWQuZGlzcG9zZSgpO1xuXG4gICAgLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbiAgICBhcGlWYWxpZGF0aW9uLnNpbUhhc1N0YXJ0ZWQgPSB0cnVlO1xuXG4gICAgLy8gdW5pbnN0cnVtZW50ZWROb2RlID0+IG5vIHByb3BlcnR5IChiZWZvcmUgc3RhcnR1cClcbiAgICB1bmluc3RydW1lbnRlZCA9IG5ldyBOb2RlKCk7XG4gICAgLy8gQHRzLWV4cGVjdC1lcnJvciAtIG5vIHN1cmUgbm93IHRvIGRvIHRoaXMgd2VsbCBpbiB0eXBlc2NyaXB0XG4gICAgYXNzZXJ0Lm9rKCB1bmluc3RydW1lbnRlZFsgbm9kZVByb3BlcnR5IF1bICd0YXJnZXRQcm9wZXJ0eScgXSA9PT0gdW5kZWZpbmVkICk7XG4gICAgLy8gQHRzLWV4cGVjdC1lcnJvciAtIG5vIHN1cmUgbm93IHRvIGRvIHRoaXMgd2VsbCBpbiB0eXBlc2NyaXB0XG4gICAgdGVzdE5vZGVBbmRQcm9wZXJ0eSggdW5pbnN0cnVtZW50ZWQsIHVuaW5zdHJ1bWVudGVkWyBub2RlUHJvcGVydHkgXSApO1xuXG4gICAgLy8gdW5pbnN0cnVtZW50ZWROb2RlID0+IHVuaW5zdHJ1bWVudGVkIHByb3BlcnR5IChiZWZvcmUgc3RhcnR1cClcbiAgICB1bmluc3RydW1lbnRlZCA9IG5ldyBOb2RlKCB7IFsgbm9kZVByb3BlcnR5IF06IHVuaW5zdHJ1bWVudGVkUHJvcGVydHkgfSApO1xuICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgLSBubyBzdXJlIG5vdyB0byBkbyB0aGlzIHdlbGwgaW4gdHlwZXNjcmlwdFxuICAgIGFzc2VydC5vayggdW5pbnN0cnVtZW50ZWRbIG5vZGVQcm9wZXJ0eSBdWyAndGFyZ2V0UHJvcGVydHknIF0gPT09IHVuaW5zdHJ1bWVudGVkUHJvcGVydHkgKTtcbiAgICB0ZXN0Tm9kZUFuZFByb3BlcnR5KCB1bmluc3RydW1lbnRlZCwgdW5pbnN0cnVtZW50ZWRQcm9wZXJ0eSApO1xuXG4gICAgLy91bmluc3RydW1lbnRlZE5vZGUgPT4gaW5zdHJ1bWVudGVkIHByb3BlcnR5IChiZWZvcmUgc3RhcnR1cClcbiAgICB1bmluc3RydW1lbnRlZCA9IG5ldyBOb2RlKCk7XG4gICAgdW5pbnN0cnVtZW50ZWQubXV0YXRlKCB7XG4gICAgICBbIG5vZGVQcm9wZXJ0eSBdOiBpbnN0cnVtZW50ZWRQcm9wZXJ0eVxuICAgIH0gKTtcbiAgICAvLyBAdHMtZXhwZWN0LWVycm9yIC0gbm8gc3VyZSBub3cgdG8gZG8gdGhpcyB3ZWxsIGluIHR5cGVzY3JpcHRcbiAgICBhc3NlcnQub2soIHVuaW5zdHJ1bWVudGVkWyBub2RlUHJvcGVydHkgXVsgJ3RhcmdldFByb3BlcnR5JyBdID09PSBpbnN0cnVtZW50ZWRQcm9wZXJ0eSApO1xuICAgIHRlc3ROb2RlQW5kUHJvcGVydHkoIHVuaW5zdHJ1bWVudGVkLCBpbnN0cnVtZW50ZWRQcm9wZXJ0eSApO1xuXG4gICAgLy8gIHVuaW5zdHJ1bWVudGVkTm9kZSA9PiBpbnN0cnVtZW50ZWQgcHJvcGVydHkgPT4gaW5zdHJ1bWVudCB0aGUgTm9kZSAoYmVmb3JlIHN0YXJ0dXApIE9LXG4gICAgdW5pbnN0cnVtZW50ZWQgPSBuZXcgTm9kZSgpO1xuICAgIHVuaW5zdHJ1bWVudGVkLm11dGF0ZSgge1xuICAgICAgWyBub2RlUHJvcGVydHkgXTogaW5zdHJ1bWVudGVkUHJvcGVydHlcbiAgICB9ICk7XG5cbiAgICB1bmluc3RydW1lbnRlZC5tdXRhdGUoIHsgdGFuZGVtOiBUYW5kZW0uUk9PVF9URVNULmNyZWF0ZVRhbmRlbSggYCR7bm9kZUZpZWxkfU15Tm9kZWAgKSB9ICk7XG4gICAgLy8gQHRzLWV4cGVjdC1lcnJvciAtIG5vIHN1cmUgbm93IHRvIGRvIHRoaXMgd2VsbCBpbiB0eXBlc2NyaXB0XG4gICAgYXNzZXJ0Lm9rKCB1bmluc3RydW1lbnRlZFsgbm9kZVByb3BlcnR5IF1bICd0YXJnZXRQcm9wZXJ0eScgXSA9PT0gaW5zdHJ1bWVudGVkUHJvcGVydHkgKTtcbiAgICB0ZXN0Tm9kZUFuZFByb3BlcnR5KCB1bmluc3RydW1lbnRlZCwgaW5zdHJ1bWVudGVkUHJvcGVydHkgKTtcbiAgICB1bmluc3RydW1lbnRlZC5kaXNwb3NlKCk7XG4gICAgYXBpVmFsaWRhdGlvbi5zaW1IYXNTdGFydGVkID0gZmFsc2U7XG5cblxuICAgIC8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiAgICAgLyogVGVzdGluZyBpbnN0cnVtZW50ZWQgbm9kZXNcbiAgICAgKi9cblxuICAgICAgLy8gaW5zdHJ1bWVudGVkTm9kZVdpdGhEZWZhdWx0SW5zdHJ1bWVudGVkUHJvcGVydHkgPT4gaW5zdHJ1bWVudGVkIHByb3BlcnR5IChiZWZvcmUgc3RhcnR1cClcbiAgICBsZXQgaW5zdHJ1bWVudGVkID0gbmV3IE5vZGUoIHtcbiAgICAgICAgdGFuZGVtOiBUYW5kZW0uUk9PVF9URVNULmNyZWF0ZVRhbmRlbSggYCR7bm9kZUZpZWxkfU15Tm9kZWAgKSxcbiAgICAgICAgWyBwaGV0aW9Ob2RlUHJvcGVydHlJbnN0cnVtZW50ZWRLZXlOYW1lIF06IHRydWVcbiAgICAgIH0gKTtcbiAgICAvLyBAdHMtZXhwZWN0LWVycm9yIC0gbm8gc3VyZSBub3cgdG8gZG8gdGhpcyB3ZWxsIGluIHR5cGVzY3JpcHRcbiAgICBhc3NlcnQub2soIGluc3RydW1lbnRlZFsgbm9kZVByb3BlcnR5IF1bICd0YXJnZXRQcm9wZXJ0eScgXSA9PT0gaW5zdHJ1bWVudGVkWyBub2RlUHJvcGVydHkgXS5vd25lZFBoZXRpb1Byb3BlcnR5ICk7XG4gICAgLy8gQHRzLWV4cGVjdC1lcnJvciAtIG5vIHN1cmUgbm93IHRvIGRvIHRoaXMgd2VsbCBpbiB0eXBlc2NyaXB0XG4gICAgYXNzZXJ0Lm9rKCBpbnN0cnVtZW50ZWRbICdsaW5rZWRFbGVtZW50cycgXS5sZW5ndGggPT09IDAsIGBubyBsaW5rZWQgZWxlbWVudHMgZm9yIGRlZmF1bHQgJHtub2RlUHJvcGVydHl9YCApO1xuICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgLSBubyBzdXJlIG5vdyB0byBkbyB0aGlzIHdlbGwgaW4gdHlwZXNjcmlwdFxuICAgIHRlc3ROb2RlQW5kUHJvcGVydHkoIGluc3RydW1lbnRlZCwgaW5zdHJ1bWVudGVkWyBub2RlUHJvcGVydHkgXSApO1xuICAgIGluc3RydW1lbnRlZC5kaXNwb3NlKCk7XG5cbiAgICAvLyBpbnN0cnVtZW50ZWROb2RlV2l0aERlZmF1bHRJbnN0cnVtZW50ZWRQcm9wZXJ0eSA9PiB1bmluc3RydW1lbnRlZCBwcm9wZXJ0eSAoYmVmb3JlIHN0YXJ0dXApXG4gICAgaW5zdHJ1bWVudGVkID0gbmV3IE5vZGUoIHtcbiAgICAgIHRhbmRlbTogVGFuZGVtLlJPT1RfVEVTVC5jcmVhdGVUYW5kZW0oIGAke25vZGVGaWVsZH1NeU5vZGVgICksXG4gICAgICBbIHBoZXRpb05vZGVQcm9wZXJ0eUluc3RydW1lbnRlZEtleU5hbWUgXTogdHJ1ZVxuICAgIH0gKTtcbiAgICAvLyBAdHMtZXhwZWN0LWVycm9yIC0gbm8gc3VyZSBub3cgdG8gZG8gdGhpcyB3ZWxsIGluIHR5cGVzY3JpcHRcbiAgICBpbnN0cnVtZW50ZWQuaGFzT3duUHJvcGVydHkoICdwaGV0aW9Ob2RlUHJvcGVydHlJbnN0cnVtZW50ZWRLZXlOYW1lJyApICYmIGFzc2VydC5vayggaW5zdHJ1bWVudGVkWyBwaGV0aW9Ob2RlUHJvcGVydHlJbnN0cnVtZW50ZWRLZXlOYW1lIF0gPT09IHRydWUsICdnZXR0ZXIgc2hvdWxkIHdvcmsnICk7XG4gICAgd2luZG93LmFzc2VydCAmJiBhc3NlcnQudGhyb3dzKCAoKSA9PiB7XG4gICAgICBpbnN0cnVtZW50ZWQubXV0YXRlKCB7IFsgbm9kZVByb3BlcnR5IF06IHVuaW5zdHJ1bWVudGVkUHJvcGVydHkgfSApO1xuICAgIH0sIGBjYW5ub3QgcmVtb3ZlIGluc3RydW1lbnRhdGlvbiBmcm9tIHRoZSBOb2RlJ3MgJHtub2RlUHJvcGVydHl9YCApO1xuICAgIGluc3RydW1lbnRlZC5kaXNwb3NlKCk7XG5cbiAgICAvLyBpbnN0cnVtZW50ZWROb2RlV2l0aFBhc3NlZEluSW5zdHJ1bWVudGVkUHJvcGVydHkgPT4gaW5zdHJ1bWVudGVkIHByb3BlcnR5IChiZWZvcmUgc3RhcnR1cClcbiAgICBpbnN0cnVtZW50ZWQgPSBuZXcgTm9kZSgge1xuICAgICAgdGFuZGVtOiBUYW5kZW0uUk9PVF9URVNULmNyZWF0ZVRhbmRlbSggYCR7bm9kZUZpZWxkfU15Tm9kZWAgKSxcbiAgICAgIFsgcGhldGlvTm9kZVByb3BlcnR5SW5zdHJ1bWVudGVkS2V5TmFtZSBdOiB0cnVlXG4gICAgfSApO1xuICAgIGluc3RydW1lbnRlZC5tdXRhdGUoIHsgWyBub2RlUHJvcGVydHkgXTogaW5zdHJ1bWVudGVkUHJvcGVydHkgfSApO1xuICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgLSBubyBzdXJlIG5vdyB0byBkbyB0aGlzIHdlbGwgaW4gdHlwZXNjcmlwdFxuICAgIGFzc2VydC5vayggaW5zdHJ1bWVudGVkWyBub2RlUHJvcGVydHkgXVsgJ3RhcmdldFByb3BlcnR5JyBdID09PSBpbnN0cnVtZW50ZWRQcm9wZXJ0eSApO1xuICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgLSBubyBzdXJlIG5vdyB0byBkbyB0aGlzIHdlbGwgaW4gdHlwZXNjcmlwdFxuICAgIGFzc2VydC5vayggaW5zdHJ1bWVudGVkWyAnbGlua2VkRWxlbWVudHMnIF0ubGVuZ3RoID09PSAxLCAnYWRkZWQgbGlua2VkIGVsZW1lbnQnICk7XG4gICAgLy8gQHRzLWV4cGVjdC1lcnJvciAtIG5vIHN1cmUgbm93IHRvIGRvIHRoaXMgd2VsbCBpbiB0eXBlc2NyaXB0XG4gICAgYXNzZXJ0Lm9rKCBpbnN0cnVtZW50ZWRbICdsaW5rZWRFbGVtZW50cycgXVsgMCBdLmVsZW1lbnQgPT09IGluc3RydW1lbnRlZFByb3BlcnR5LFxuICAgICAgYGFkZGVkIGxpbmtlZCBlbGVtZW50IHNob3VsZCBiZSBmb3IgJHtub2RlUHJvcGVydHl9YCApO1xuICAgIHRlc3ROb2RlQW5kUHJvcGVydHkoIGluc3RydW1lbnRlZCwgaW5zdHJ1bWVudGVkUHJvcGVydHkgKTtcbiAgICBpbnN0cnVtZW50ZWQuZGlzcG9zZSgpO1xuXG4gICAgaW5zdHJ1bWVudGVkID0gbmV3IE5vZGUoIHtcbiAgICAgIHRhbmRlbTogVGFuZGVtLlJPT1RfVEVTVC5jcmVhdGVUYW5kZW0oIGAke25vZGVGaWVsZH1NeU5vZGVgICksXG4gICAgICBbIG5vZGVQcm9wZXJ0eSBdOiBpbnN0cnVtZW50ZWRQcm9wZXJ0eVxuICAgIH0gKTtcbiAgICAvLyBAdHMtZXhwZWN0LWVycm9yIC0gbm8gc3VyZSBub3cgdG8gZG8gdGhpcyB3ZWxsIGluIHR5cGVzY3JpcHRcbiAgICBhc3NlcnQub2soIGluc3RydW1lbnRlZFsgbm9kZVByb3BlcnR5IF1bICd0YXJnZXRQcm9wZXJ0eScgXSA9PT0gaW5zdHJ1bWVudGVkUHJvcGVydHkgKTtcbiAgICAvLyBAdHMtZXhwZWN0LWVycm9yIC0gbm8gc3VyZSBub3cgdG8gZG8gdGhpcyB3ZWxsIGluIHR5cGVzY3JpcHRcbiAgICBhc3NlcnQub2soIGluc3RydW1lbnRlZFsgJ2xpbmtlZEVsZW1lbnRzJyBdLmxlbmd0aCA9PT0gMSwgJ2FkZGVkIGxpbmtlZCBlbGVtZW50JyApO1xuICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgLSBubyBzdXJlIG5vdyB0byBkbyB0aGlzIHdlbGwgaW4gdHlwZXNjcmlwdFxuICAgIGFzc2VydC5vayggaW5zdHJ1bWVudGVkWyAnbGlua2VkRWxlbWVudHMnIF1bIDAgXS5lbGVtZW50ID09PSBpbnN0cnVtZW50ZWRQcm9wZXJ0eSxcbiAgICAgIGBhZGRlZCBsaW5rZWQgZWxlbWVudCBzaG91bGQgYmUgZm9yICR7bm9kZVByb3BlcnR5fWAgKTtcbiAgICB0ZXN0Tm9kZUFuZFByb3BlcnR5KCBpbnN0cnVtZW50ZWQsIGluc3RydW1lbnRlZFByb3BlcnR5ICk7XG4gICAgaW5zdHJ1bWVudGVkLmRpc3Bvc2UoKTtcblxuICAgIC8vIGluc3RydW1lbnRlZE5vZGVXaXRoUGFzc2VkSW5JbnN0cnVtZW50ZWRQcm9wZXJ0eSA9PiB1bmluc3RydW1lbnRlZCBwcm9wZXJ0eSAoYmVmb3JlIHN0YXJ0dXApXG4gICAgaW5zdHJ1bWVudGVkID0gbmV3IE5vZGUoIHtcbiAgICAgIHRhbmRlbTogVGFuZGVtLlJPT1RfVEVTVC5jcmVhdGVUYW5kZW0oIGAke25vZGVGaWVsZH1NeU5vZGVgICksXG4gICAgICBbIG5vZGVQcm9wZXJ0eSBdOiBpbnN0cnVtZW50ZWRQcm9wZXJ0eVxuICAgIH0gKTtcbiAgICB3aW5kb3cuYXNzZXJ0ICYmIGFzc2VydC50aHJvd3MoICgpID0+IHtcbiAgICAgIGluc3RydW1lbnRlZC5tdXRhdGUoIHsgWyBub2RlUHJvcGVydHkgXTogdW5pbnN0cnVtZW50ZWRQcm9wZXJ0eSB9ICk7XG4gICAgfSwgYGNhbm5vdCByZW1vdmUgaW5zdHJ1bWVudGF0aW9uIGZyb20gdGhlIE5vZGUncyAke25vZGVQcm9wZXJ0eX1gICk7XG4gICAgaW5zdHJ1bWVudGVkLmRpc3Bvc2UoKTtcbiAgICBpbnN0cnVtZW50ZWQgPSBuZXcgTm9kZSgge1xuICAgICAgdGFuZGVtOiBUYW5kZW0uUk9PVF9URVNULmNyZWF0ZVRhbmRlbSggYCR7bm9kZUZpZWxkfU15Tm9kZWAgKVxuICAgIH0gKTtcbiAgICBpbnN0cnVtZW50ZWQubXV0YXRlKCB7IFsgbm9kZVByb3BlcnR5IF06IGluc3RydW1lbnRlZFByb3BlcnR5IH0gKTtcbiAgICB3aW5kb3cuYXNzZXJ0ICYmIGFzc2VydC50aHJvd3MoICgpID0+IHtcbiAgICAgIGluc3RydW1lbnRlZC5tdXRhdGUoIHsgWyBub2RlUHJvcGVydHkgXTogdW5pbnN0cnVtZW50ZWRQcm9wZXJ0eSB9ICk7XG4gICAgfSwgYGNhbm5vdCByZW1vdmUgaW5zdHJ1bWVudGF0aW9uIGZyb20gdGhlIE5vZGUncyAke25vZGVQcm9wZXJ0eX1gICk7XG4gICAgaW5zdHJ1bWVudGVkLmRpc3Bvc2UoKTtcblxuICAgIGFwaVZhbGlkYXRpb24uZW5hYmxlZCA9IHRydWU7XG4gICAgYXBpVmFsaWRhdGlvbi5zaW1IYXNTdGFydGVkID0gdHJ1ZTtcbiAgICAvLyBpbnN0cnVtZW50ZWROb2RlV2l0aERlZmF1bHRJbnN0cnVtZW50ZWRQcm9wZXJ0eSA9PiBpbnN0cnVtZW50ZWQgcHJvcGVydHkgKGFmdGVyIHN0YXJ0dXApXG4gICAgY29uc3QgaW5zdHJ1bWVudGVkMSA9IG5ldyBOb2RlKCB7XG4gICAgICB0YW5kZW06IFRhbmRlbS5ST09UX1RFU1QuY3JlYXRlVGFuZGVtKCBgJHtub2RlRmllbGR9TXlVbmlxdWVseU5hbWVkTm9kZVRoYXRXaWxsTm90QmVEdXBsaWNhdGVkMWAgKSxcbiAgICAgIFsgcGhldGlvTm9kZVByb3BlcnR5SW5zdHJ1bWVudGVkS2V5TmFtZSBdOiB0cnVlXG4gICAgfSApO1xuICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgLSBubyBzdXJlIG5vdyB0byBkbyB0aGlzIHdlbGwgaW4gdHlwZXNjcmlwdFxuICAgIGFzc2VydC5vayggaW5zdHJ1bWVudGVkMVsgbm9kZVByb3BlcnR5IF1bICd0YXJnZXRQcm9wZXJ0eScgXSA9PT0gaW5zdHJ1bWVudGVkMVsgbm9kZVByb3BlcnR5IF0ub3duZWRQaGV0aW9Qcm9wZXJ0eSApO1xuICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgLSBubyBzdXJlIG5vdyB0byBkbyB0aGlzIHdlbGwgaW4gdHlwZXNjcmlwdFxuICAgIGFzc2VydC5vayggaW5zdHJ1bWVudGVkMVsgJ2xpbmtlZEVsZW1lbnRzJyBdLmxlbmd0aCA9PT0gMCwgYG5vIGxpbmtlZCBlbGVtZW50cyBmb3IgZGVmYXVsdCAke25vZGVQcm9wZXJ0eX1gICk7XG4gICAgLy8gQHRzLWV4cGVjdC1lcnJvciAtIG5vIHN1cmUgbm93IHRvIGRvIHRoaXMgd2VsbCBpbiB0eXBlc2NyaXB0XG4gICAgdGVzdE5vZGVBbmRQcm9wZXJ0eSggaW5zdHJ1bWVudGVkMSwgaW5zdHJ1bWVudGVkMVsgbm9kZVByb3BlcnR5IF0gKTtcblxuICAgIC8vIGluc3RydW1lbnRlZE5vZGVXaXRoRGVmYXVsdEluc3RydW1lbnRlZFByb3BlcnR5ID0+IHVuaW5zdHJ1bWVudGVkIHByb3BlcnR5IChhZnRlciBzdGFydHVwKVxuICAgIGNvbnN0IGluc3RydW1lbnRlZDIgPSBuZXcgTm9kZSgge1xuICAgICAgdGFuZGVtOiBUYW5kZW0uUk9PVF9URVNULmNyZWF0ZVRhbmRlbSggYCR7bm9kZUZpZWxkfU15VW5pcXVlbHlOYW1lZE5vZGVUaGF0V2lsbE5vdEJlRHVwbGljYXRlZDJgICksXG4gICAgICBbIHBoZXRpb05vZGVQcm9wZXJ0eUluc3RydW1lbnRlZEtleU5hbWUgXTogdHJ1ZVxuICAgIH0gKTtcbiAgICB3aW5kb3cuYXNzZXJ0ICYmIGFzc2VydC50aHJvd3MoICgpID0+IHtcbiAgICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgLSBubyBzdXJlIG5vdyB0byBkbyB0aGlzIHdlbGwgaW4gdHlwZXNjcmlwdFxuICAgICAgaW5zdHJ1bWVudGVkMlsgbm9kZVByb3BlcnR5U2V0dGVyIF0oIHVuaW5zdHJ1bWVudGVkUHJvcGVydHkgKTtcbiAgICB9LCBgY2Fubm90IHJlbW92ZSBpbnN0cnVtZW50YXRpb24gZnJvbSB0aGUgTm9kZSdzICR7bm9kZVByb3BlcnR5fWAgKTtcblxuICAgIC8vIGluc3RydW1lbnRlZE5vZGVXaXRoUGFzc2VkSW5JbnN0cnVtZW50ZWRQcm9wZXJ0eSA9PiBpbnN0cnVtZW50ZWQgcHJvcGVydHkgKGFmdGVyIHN0YXJ0dXApXG4gICAgY29uc3QgaW5zdHJ1bWVudGVkMyA9IG5ldyBOb2RlKCB7XG4gICAgICB0YW5kZW06IFRhbmRlbS5ST09UX1RFU1QuY3JlYXRlVGFuZGVtKCBgJHtub2RlRmllbGR9TXlVbmlxdWVseU5hbWVkTm9kZVRoYXRXaWxsTm90QmVEdXBsaWNhdGVkM2AgKSxcbiAgICAgIFsgbm9kZVByb3BlcnR5IF06IGluc3RydW1lbnRlZFByb3BlcnR5XG4gICAgfSApO1xuXG4gICAgd2luZG93LmFzc2VydCAmJiBhc3NlcnQudGhyb3dzKCAoKSA9PiB7XG4gICAgICBpbnN0cnVtZW50ZWQzLm11dGF0ZSggeyBbIG5vZGVQcm9wZXJ0eSBdOiBvdGhlckluc3RydW1lbnRlZFByb3BlcnR5IH0gKTtcbiAgICB9LCAnY2Fubm90IHN3YXAgb3V0IG9uZSBpbnN0cnVtZW50ZWQgZm9yIGFub3RoZXInICk7XG5cbiAgICAvLyBpbnN0cnVtZW50ZWROb2RlV2l0aFBhc3NlZEluSW5zdHJ1bWVudGVkUHJvcGVydHkgPT4gdW5pbnN0cnVtZW50ZWQgcHJvcGVydHkgKGFmdGVyIHN0YXJ0dXApXG4gICAgY29uc3QgaW5zdHJ1bWVudGVkNCA9IG5ldyBOb2RlKCB7XG4gICAgICB0YW5kZW06IFRhbmRlbS5ST09UX1RFU1QuY3JlYXRlVGFuZGVtKCBgJHtub2RlRmllbGR9TXlVbmlxdWVseU5hbWVkTm9kZVRoYXRXaWxsTm90QmVEdXBsaWNhdGVkNGAgKSxcbiAgICAgIFsgbm9kZVByb3BlcnR5IF06IGluc3RydW1lbnRlZFByb3BlcnR5XG4gICAgfSApO1xuICAgIHdpbmRvdy5hc3NlcnQgJiYgYXNzZXJ0LnRocm93cyggKCkgPT4ge1xuICAgICAgaW5zdHJ1bWVudGVkNC5tdXRhdGUoIHsgWyBub2RlUHJvcGVydHkgXTogdW5pbnN0cnVtZW50ZWRQcm9wZXJ0eSB9ICk7XG4gICAgfSwgYGNhbm5vdCByZW1vdmUgaW5zdHJ1bWVudGF0aW9uIGZyb20gdGhlIE5vZGUncyAke25vZGVQcm9wZXJ0eX1gICk7XG4gICAgY29uc3QgaW5zdHJ1bWVudGVkNSA9IG5ldyBOb2RlKCB7fSApO1xuICAgIGluc3RydW1lbnRlZDUubXV0YXRlKCB7IFsgbm9kZVByb3BlcnR5IF06IGluc3RydW1lbnRlZFByb3BlcnR5IH0gKTtcbiAgICBpbnN0cnVtZW50ZWQ1Lm11dGF0ZSggeyB0YW5kZW06IFRhbmRlbS5ST09UX1RFU1QuY3JlYXRlVGFuZGVtKCBgJHtub2RlRmllbGR9TXlVbmlxdWVseU5hbWVkTm9kZVRoYXRXaWxsTm90QmVEdXBsaWNhdGVkNWAgKSB9ICk7XG4gICAgd2luZG93LmFzc2VydCAmJiBhc3NlcnQudGhyb3dzKCAoKSA9PiB7XG4gICAgICBpbnN0cnVtZW50ZWQ1Lm11dGF0ZSggeyBbIG5vZGVQcm9wZXJ0eSBdOiB1bmluc3RydW1lbnRlZFByb3BlcnR5IH0gKTtcbiAgICB9LCBgY2Fubm90IHJlbW92ZSBpbnN0cnVtZW50YXRpb24gZnJvbSB0aGUgTm9kZSdzICR7bm9kZVByb3BlcnR5fWAgKTtcbiAgICBhcGlWYWxpZGF0aW9uLmVuYWJsZWQgPSBmYWxzZTtcblxuICAgIGFwaVZhbGlkYXRpb24uZW5hYmxlZCA9IHRydWU7XG5cbiAgICBhcGlWYWxpZGF0aW9uLnNpbUhhc1N0YXJ0ZWQgPSBmYWxzZTtcblxuICAgIC8vIGluc3RydW1lbnRlZE5vZGVPcHRzT3V0T2ZEZWZhdWx0ID0+IGluc3RydW1lbnRlZCBQcm9wZXJ0eSBzZXQgbGF0ZXIgKGJ1dCBiZWZvcmUgc3RhcnR1cClcbiAgICBjb25zdCBpbnN0cnVtZW50ZWQ2ID0gbmV3IE5vZGUoIHtcbiAgICAgIHRhbmRlbTogVGFuZGVtLlJPT1RfVEVTVC5jcmVhdGVUYW5kZW0oIGAke25vZGVGaWVsZH1NeU5vZGU2YCApLFxuICAgICAgWyBwaGV0aW9Ob2RlUHJvcGVydHlJbnN0cnVtZW50ZWRLZXlOYW1lIF06IGZhbHNlIC8vIHJlcXVpcmVkIHdoZW4gcGFzc2luZyBpbiBhbiBpbnN0cnVtZW50ZWQgb25lIGxhdGVyXG4gICAgfSApO1xuXG4gICAgLy8gQHRzLWV4cGVjdC1lcnJvciAtIG5vIHN1cmUgbm93IHRvIGRvIHRoaXMgd2VsbCBpbiB0eXBlc2NyaXB0XG4gICAgaW5zdHJ1bWVudGVkNlsgbm9kZVByb3BlcnR5IF0gPSBuZXcgQm9vbGVhblByb3BlcnR5KCBmYWxzZSwge1xuICAgICAgdGFuZGVtOiBUYW5kZW0uUk9PVF9URVNULmNyZWF0ZVRhbmRlbSggYCR7bm9kZUZpZWxkfU15Qm9vbGVhblByb3BlcnR5YCApXG4gICAgfSApO1xuICAgIGFwaVZhbGlkYXRpb24uZW5hYmxlZCA9IGZhbHNlO1xuXG4gICAgaW5zdHJ1bWVudGVkNi5kaXNwb3NlKCk7XG4gICAgaW5zdHJ1bWVudGVkMS5kaXNwb3NlKCk7XG5cbiAgICAvLyBUaGVzZSBjYW4ndCBiZSBkaXNwb3NlZCBiZWNhdXNlIHRoZXkgd2VyZSBicm9rZW4gd2hpbGUgY3JlYXRpbmcgKG9uIHB1cnBvc2UgaW4gYW4gYXNzZXJ0LnRocm93cygpKS4gVGhlc2UgZWxlbWVudHNcbiAgICAvLyBoYXZlIHNwZWNpYWwgVGFuZGVtIGNvbXBvbmVudCBuYW1lcyB0byBtYWtlIHN1cmUgdGhhdCB0aGV5IGRvbid0IGludGVyZmVyZSB3aXRoIG90aGVyIHRlc3RzIChzaW5jZSB0aGV5IGNhbid0IGJlXG4gICAgLy8gcmVtb3ZlZCBmcm9tIHRoZSByZWdpc3RyeVxuICAgIC8vIGluc3RydW1lbnRlZDIuZGlzcG9zZSgpO1xuICAgIC8vIGluc3RydW1lbnRlZDMuZGlzcG9zZSgpO1xuICAgIC8vIGluc3RydW1lbnRlZDQuZGlzcG9zZSgpO1xuICAgIC8vIGluc3RydW1lbnRlZDUuZGlzcG9zZSgpO1xuXG4gICAgaW5zdHJ1bWVudGVkID0gbmV3IE5vZGUoIHtcbiAgICAgIHRhbmRlbTogVGFuZGVtLlJPT1RfVEVTVC5jcmVhdGVUYW5kZW0oIGAke25vZGVGaWVsZH1NeU5vZGVgICksXG4gICAgICBbIHBoZXRpb05vZGVQcm9wZXJ0eUluc3RydW1lbnRlZEtleU5hbWUgXTogdHJ1ZVxuICAgIH0gKTtcbiAgICB3aW5kb3cuYXNzZXJ0ICYmIGFzc2VydC50aHJvd3MoICgpID0+IHtcbiAgICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgLSBubyBzdXJlIG5vdyB0byBkbyB0aGlzIHdlbGwgaW4gdHlwZXNjcmlwdFxuICAgICAgaW5zdHJ1bWVudGVkWyBub2RlUHJvcGVydHlTZXR0ZXIgXSggbnVsbCApO1xuICAgIH0sIGBjYW5ub3QgY2xlYXIgb3V0IGFuIGluc3RydW1lbnRlZCAke25vZGVQcm9wZXJ0eX1gICk7XG4gICAgaW5zdHJ1bWVudGVkLmRpc3Bvc2UoKTtcblxuXG4gICAgLy8gSWYgYnkgZGVmYXVsdCB0aGlzIHByb3BlcnR5IGlzbid0IGluc3RydW1lbnRlZCwgdGhlbiB0aGlzIHNob3VsZCBjYXVzZSBhbiBlcnJvclxuICAgIGlmICggIW93bmVkUHJvcGVydHlJbnN0cnVtZW50ZWQgKSB7XG5cbiAgICAgIGluc3RydW1lbnRlZCA9IG5ldyBOb2RlKCB7XG4gICAgICAgIHRhbmRlbTogVGFuZGVtLlJPT1RfVEVTVC5jcmVhdGVUYW5kZW0oIGAke25vZGVGaWVsZH1NeU5vZGVgIClcbiAgICAgIH0gKTtcbiAgICAgIHdpbmRvdy5hc3NlcnQgJiYgYXNzZXJ0LnRocm93cyggKCkgPT4ge1xuXG4gICAgICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgLSBubyBzdXJlIG5vdyB0byBkbyB0aGlzIHdlbGwgaW4gdHlwZXNjcmlwdFxuICAgICAgICBpbnN0cnVtZW50ZWRbIHBoZXRpb05vZGVQcm9wZXJ0eUluc3RydW1lbnRlZEtleU5hbWUgXSA9IHRydWU7XG4gICAgICB9LCBgY2Fubm90IHNldCAke3BoZXRpb05vZGVQcm9wZXJ0eUluc3RydW1lbnRlZEtleU5hbWV9IGFmdGVyIGluc3RydW1lbnRhdGlvbmAgKTtcbiAgICAgIGluc3RydW1lbnRlZC5kaXNwb3NlKCk7XG4gICAgfVxuXG5cbiAgICBpbnN0cnVtZW50ZWRQcm9wZXJ0eS5kaXNwb3NlKCk7XG4gICAgb3RoZXJJbnN0cnVtZW50ZWRQcm9wZXJ0eS5kaXNwb3NlKCk7XG4gICAgYXBpVmFsaWRhdGlvbi5zaW1IYXNTdGFydGVkID0gcHJldmlvdXNTaW1TdGFydGVkO1xuICAgIGFwaVZhbGlkYXRpb24uZW5hYmxlZCA9IHByZXZpb3VzQVBJVmFsaWRhdGlvbkVuYWJsZWQ7XG4gIH07XG59Il0sIm5hbWVzIjpbIkJvb2xlYW5Qcm9wZXJ0eSIsIkJvdW5kczIiLCJWZWN0b3IyIiwiU2hhcGUiLCJUYW5kZW0iLCJUb3VjaCIsIk5vZGUiLCJSZWN0YW5nbGUiLCJRVW5pdCIsIm1vZHVsZSIsImZha2VUb3VjaFBvaW50ZXIiLCJ2ZWN0b3IiLCJ0ZXN0IiwiYXNzZXJ0Iiwibm9kZSIsInJlY3QiLCJwaWNrYWJsZSIsImFkZENoaWxkIiwib2siLCJoaXRUZXN0IiwidG91Y2hBcmVhIiwicmVjdGFuZ2xlIiwidHJhaWxVbmRlclBvaW50ZXIiLCJjbGlwQXJlYSIsImVwc2lsb24iLCJhIiwiYiIsIngiLCJ5IiwiZXF1YWxzRXBzaWxvbiIsImxvY2FsVG9QYXJlbnRQb2ludCIsInBhcmVudFRvTG9jYWxQb2ludCIsImxvY2FsVG9HbG9iYWxQb2ludCIsImdsb2JhbFRvTG9jYWxQb2ludCIsInBhcmVudFRvR2xvYmFsUG9pbnQiLCJnbG9iYWxUb1BhcmVudFBvaW50IiwiYm91bmRzIiwibG9jYWxUb1BhcmVudEJvdW5kcyIsInBhcmVudFRvTG9jYWxCb3VuZHMiLCJsb2NhbFRvR2xvYmFsQm91bmRzIiwiZ2xvYmFsVG9Mb2NhbEJvdW5kcyIsInBhcmVudFRvR2xvYmFsQm91bmRzIiwiZ2xvYmFsVG9QYXJlbnRCb3VuZHMiLCJjIiwic2NhbGUiLCJ0cmFpbE1hdHJpeCIsImdldFVuaXF1ZVRyYWlsIiwiZ2V0TWF0cml4Iiwibm9kZU1hdHJpeCIsImdldFVuaXF1ZVRyYW5zZm9ybSIsInZpc2libGVQcm9wZXJ0eSIsIndpbmRvdyIsInRocm93cyIsInZpc2libGUiLCJwaWNrYWJsZVByb3BlcnR5IiwiZW5hYmxlZFByb3BlcnR5IiwiZW5hYmxlZCIsImlucHV0RW5hYmxlZFByb3BlcnR5IiwiaW5wdXRFbmFibGVkIiwiUEhFVF9JT19FTkFCTEVEIiwidGVzdEluc3RydW1lbnRlZE5vZGVQcm9wZXJ0eSIsIkRFRkFVTFRfTk9ERV9PUFRJT05TIiwicGhldGlvRW5hYmxlZFByb3BlcnR5SW5zdHJ1bWVudGVkIiwicGhldGlvSW5wdXRFbmFibGVkUHJvcGVydHlJbnN0cnVtZW50ZWQiLCJub2RlRmllbGQiLCJub2RlUHJvcGVydHkiLCJub2RlUHJvcGVydHlTZXR0ZXIiLCJvd25lZFByb3BlcnR5SW5zdHJ1bWVudGVkIiwicGhldGlvTm9kZVByb3BlcnR5SW5zdHJ1bWVudGVkS2V5TmFtZSIsImFwaVZhbGlkYXRpb24iLCJwaGV0IiwidGFuZGVtIiwicGhldGlvQVBJVmFsaWRhdGlvbiIsInByZXZpb3VzQVBJVmFsaWRhdGlvbkVuYWJsZWQiLCJwcmV2aW91c1NpbVN0YXJ0ZWQiLCJzaW1IYXNTdGFydGVkIiwidGVzdE5vZGVBbmRQcm9wZXJ0eSIsInByb3BlcnR5IiwiaW5pdGlhbFZhbHVlIiwidmFsdWUiLCJpbnN0cnVtZW50ZWRQcm9wZXJ0eSIsIlJPT1RfVEVTVCIsImNyZWF0ZVRhbmRlbSIsIm90aGVySW5zdHJ1bWVudGVkUHJvcGVydHkiLCJ1bmluc3RydW1lbnRlZFByb3BlcnR5IiwidW5pbnN0cnVtZW50ZWQiLCJ1bmRlZmluZWQiLCJtdXRhdGUiLCJkaXNwb3NlIiwiaW5zdHJ1bWVudGVkIiwib3duZWRQaGV0aW9Qcm9wZXJ0eSIsImxlbmd0aCIsImhhc093blByb3BlcnR5IiwiZWxlbWVudCIsImluc3RydW1lbnRlZDEiLCJpbnN0cnVtZW50ZWQyIiwiaW5zdHJ1bWVudGVkMyIsImluc3RydW1lbnRlZDQiLCJpbnN0cnVtZW50ZWQ1IiwiaW5zdHJ1bWVudGVkNiJdLCJtYXBwaW5ncyI6IkFBQUEsc0RBQXNEO0FBRXREOzs7O0NBSUMsR0FFRCxPQUFPQSxxQkFBcUIsc0NBQXNDO0FBRWxFLE9BQU9DLGFBQWEsNkJBQTZCO0FBQ2pELE9BQU9DLGFBQWEsNkJBQTZCO0FBQ2pELFNBQVNDLEtBQUssUUFBUSw4QkFBOEI7QUFFcEQsT0FBT0MsWUFBWSwrQkFBK0I7QUFDbEQsT0FBT0MsV0FBVyxvQkFBb0I7QUFDdEMsT0FBT0MsVUFBVSxZQUFZO0FBQzdCLE9BQU9DLGVBQWUsaUJBQWlCO0FBRXZDQyxNQUFNQyxNQUFNLENBQUU7QUFFZCxTQUFTQyxpQkFBa0JDLE1BQWU7SUFDeEMsT0FBTyxJQUFJTixNQUFPLEdBQUdNLFFBQVEsQ0FBQztBQUNoQztBQUVBSCxNQUFNSSxJQUFJLENBQUUseUJBQXlCQyxDQUFBQTtJQUNuQyxNQUFNQyxPQUFPLElBQUlSO0lBQ2pCLE1BQU1TLE9BQU8sSUFBSVIsVUFBVyxHQUFH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