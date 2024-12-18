// Copyright 2020-2022, University of Colorado Boulder
/**
 * Unit tests for PhetioObject
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */ import NumberProperty from '../../axon/js/NumberProperty.js';
import Tandem from './Tandem.js';
QUnit.module('Tandem');
QUnit.test('Tandem validation on ROOT', (assert)=>{
    let property = new NumberProperty(0, {
        tandem: Tandem.ROOT_TEST.createTandem('aProperty')
    });
    assert.ok(property.isPhetioInstrumented(), 'should be instrumented');
    property = new NumberProperty(0, {
        tandem: Tandem.ROOT_TEST.createTandem('bProperty')
    });
    assert.ok(property.isPhetioInstrumented(), 'should be instrumented');
    property = new NumberProperty(0, {
        tandem: Tandem.ROOT_TEST.createTandem('cProperty')
    });
    assert.ok(property.isPhetioInstrumented(), 'should be instrumented');
    // Only specific tandems allowed on root when validating tandems
    window.assert && Tandem.VALIDATION && assert.throws(()=>{
        property = new NumberProperty(0, {
            tandem: Tandem.ROOT.createTandem('aProperty') // Should fail because aProperty is not allowed on ROOT Tandem
        });
    });
});
QUnit.test('Tandem excluded', (assert)=>{
    assert.ok(true, 'hello beautiful world.');
    Tandem.ROOT_TEST.createTandem('anythingAllowedHere');
    window.assert && Tandem.VALIDATION && assert.throws(()=>{
        Tandem.ROOT_TEST.createTandem('pickableProperty');
    }, 'pickableProperty should never be instrumented');
});

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3RhbmRlbS9qcy9UYW5kZW1UZXN0cy50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAyMC0yMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuLyoqXG4gKiBVbml0IHRlc3RzIGZvciBQaGV0aW9PYmplY3RcbiAqXG4gKiBAYXV0aG9yIE1pY2hhZWwgS2F1em1hbm4gKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXG4gKi9cblxuaW1wb3J0IE51bWJlclByb3BlcnR5IGZyb20gJy4uLy4uL2F4b24vanMvTnVtYmVyUHJvcGVydHkuanMnO1xuaW1wb3J0IFRhbmRlbSBmcm9tICcuL1RhbmRlbS5qcyc7XG5cblFVbml0Lm1vZHVsZSggJ1RhbmRlbScgKTtcblxuUVVuaXQudGVzdCggJ1RhbmRlbSB2YWxpZGF0aW9uIG9uIFJPT1QnLCBhc3NlcnQgPT4ge1xuXG4gIGxldCBwcm9wZXJ0eSA9IG5ldyBOdW1iZXJQcm9wZXJ0eSggMCwge1xuICAgIHRhbmRlbTogVGFuZGVtLlJPT1RfVEVTVC5jcmVhdGVUYW5kZW0oICdhUHJvcGVydHknIClcbiAgfSApO1xuICBhc3NlcnQub2soIHByb3BlcnR5LmlzUGhldGlvSW5zdHJ1bWVudGVkKCksICdzaG91bGQgYmUgaW5zdHJ1bWVudGVkJyApO1xuXG4gIHByb3BlcnR5ID0gbmV3IE51bWJlclByb3BlcnR5KCAwLCB7XG4gICAgdGFuZGVtOiBUYW5kZW0uUk9PVF9URVNULmNyZWF0ZVRhbmRlbSggJ2JQcm9wZXJ0eScgKVxuICB9ICk7XG4gIGFzc2VydC5vayggcHJvcGVydHkuaXNQaGV0aW9JbnN0cnVtZW50ZWQoKSwgJ3Nob3VsZCBiZSBpbnN0cnVtZW50ZWQnICk7XG5cbiAgcHJvcGVydHkgPSBuZXcgTnVtYmVyUHJvcGVydHkoIDAsIHtcbiAgICB0YW5kZW06IFRhbmRlbS5ST09UX1RFU1QuY3JlYXRlVGFuZGVtKCAnY1Byb3BlcnR5JyApXG4gIH0gKTtcbiAgYXNzZXJ0Lm9rKCBwcm9wZXJ0eS5pc1BoZXRpb0luc3RydW1lbnRlZCgpLCAnc2hvdWxkIGJlIGluc3RydW1lbnRlZCcgKTtcblxuICAvLyBPbmx5IHNwZWNpZmljIHRhbmRlbXMgYWxsb3dlZCBvbiByb290IHdoZW4gdmFsaWRhdGluZyB0YW5kZW1zXG4gIHdpbmRvdy5hc3NlcnQgJiYgVGFuZGVtLlZBTElEQVRJT04gJiYgYXNzZXJ0LnRocm93cyggKCkgPT4ge1xuICAgIHByb3BlcnR5ID0gbmV3IE51bWJlclByb3BlcnR5KCAwLCB7XG4gICAgICB0YW5kZW06IFRhbmRlbS5ST09ULmNyZWF0ZVRhbmRlbSggJ2FQcm9wZXJ0eScgKSAvLyBTaG91bGQgZmFpbCBiZWNhdXNlIGFQcm9wZXJ0eSBpcyBub3QgYWxsb3dlZCBvbiBST09UIFRhbmRlbVxuICAgIH0gKTtcbiAgfSApO1xufSApO1xuXG5RVW5pdC50ZXN0KCAnVGFuZGVtIGV4Y2x1ZGVkJywgYXNzZXJ0ID0+IHtcbiAgYXNzZXJ0Lm9rKCB0cnVlLCAnaGVsbG8gYmVhdXRpZnVsIHdvcmxkLicgKTtcblxuICBUYW5kZW0uUk9PVF9URVNULmNyZWF0ZVRhbmRlbSggJ2FueXRoaW5nQWxsb3dlZEhlcmUnICk7XG5cbiAgd2luZG93LmFzc2VydCAmJiBUYW5kZW0uVkFMSURBVElPTiAmJiBhc3NlcnQudGhyb3dzKCAoKSA9PiB7XG4gICAgVGFuZGVtLlJPT1RfVEVTVC5jcmVhdGVUYW5kZW0oICdwaWNrYWJsZVByb3BlcnR5JyApO1xuICB9LCAncGlja2FibGVQcm9wZXJ0eSBzaG91bGQgbmV2ZXIgYmUgaW5zdHJ1bWVudGVkJyApO1xufSApOyJdLCJuYW1lcyI6WyJOdW1iZXJQcm9wZXJ0eSIsIlRhbmRlbSIsIlFVbml0IiwibW9kdWxlIiwidGVzdCIsImFzc2VydCIsInByb3BlcnR5IiwidGFuZGVtIiwiUk9PVF9URVNUIiwiY3JlYXRlVGFuZGVtIiwib2siLCJpc1BoZXRpb0luc3RydW1lbnRlZCIsIndpbmRvdyIsIlZBTElEQVRJT04iLCJ0aHJvd3MiLCJST09UIl0sIm1hcHBpbmdzIjoiQUFBQSxzREFBc0Q7QUFFdEQ7Ozs7Q0FJQyxHQUVELE9BQU9BLG9CQUFvQixrQ0FBa0M7QUFDN0QsT0FBT0MsWUFBWSxjQUFjO0FBRWpDQyxNQUFNQyxNQUFNLENBQUU7QUFFZEQsTUFBTUUsSUFBSSxDQUFFLDZCQUE2QkMsQ0FBQUE7SUFFdkMsSUFBSUMsV0FBVyxJQUFJTixlQUFnQixHQUFHO1FBQ3BDTyxRQUFRTixPQUFPTyxTQUFTLENBQUNDLFlBQVksQ0FBRTtJQUN6QztJQUNBSixPQUFPSyxFQUFFLENBQUVKLFNBQVNLLG9CQUFvQixJQUFJO0lBRTVDTCxXQUFXLElBQUlOLGVBQWdCLEdBQUc7UUFDaENPLFFBQVFOLE9BQU9PLFNBQVMsQ0FBQ0MsWUFBWSxDQUFFO0lBQ3pDO0lBQ0FKLE9BQU9LLEVBQUUsQ0FBRUosU0FBU0ssb0JBQW9CLElBQUk7SUFFNUNMLFdBQVcsSUFBSU4sZUFBZ0IsR0FBRztRQUNoQ08sUUFBUU4sT0FBT08sU0FBUyxDQUFDQyxZQUFZLENBQUU7SUFDekM7SUFDQUosT0FBT0ssRUFBRSxDQUFFSixTQUFTSyxvQkFBb0IsSUFBSTtJQUU1QyxnRUFBZ0U7SUFDaEVDLE9BQU9QLE1BQU0sSUFBSUosT0FBT1ksVUFBVSxJQUFJUixPQUFPUyxNQUFNLENBQUU7UUFDbkRSLFdBQVcsSUFBSU4sZUFBZ0IsR0FBRztZQUNoQ08sUUFBUU4sT0FBT2MsSUFBSSxDQUFDTixZQUFZLENBQUUsYUFBYyw4REFBOEQ7UUFDaEg7SUFDRjtBQUNGO0FBRUFQLE1BQU1FLElBQUksQ0FBRSxtQkFBbUJDLENBQUFBO0lBQzdCQSxPQUFPSyxFQUFFLENBQUUsTUFBTTtJQUVqQlQsT0FBT08sU0FBUyxDQUFDQyxZQUFZLENBQUU7SUFFL0JHLE9BQU9QLE1BQU0sSUFBSUosT0FBT1ksVUFBVSxJQUFJUixPQUFPUyxNQUFNLENBQUU7UUFDbkRiLE9BQU9PLFNBQVMsQ0FBQ0MsWUFBWSxDQUFFO0lBQ2pDLEdBQUc7QUFDTCJ9