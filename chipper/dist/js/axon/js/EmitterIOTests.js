// Copyright 2019-2023, University of Colorado Boulder
/**
 * QUnit tests for EmitterIO
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */ import merge from '../../phet-core/js/merge.js';
import NumberIO from '../../tandem/js/types/NumberIO.js';
import Emitter from './Emitter.js';
QUnit.module('EmitterIO');
QUnit.test('test EmitterIO', (assert)=>{
    let emitter;
    if (window.assert) {
        assert.throws(()=>{
            emitter = new Emitter({
                // @ts-expect-error INTENTIONAL, force set phetioType for testing
                phetioType: Emitter.EmitterIO([])
            });
        }, 'cannot supply default EmitterIO type');
        assert.throws(()=>{
            emitter = new Emitter({
                // @ts-expect-error INTENTIONAL, force set phetioType for testing
                phetioType: IOType.ObjectIO
            });
        }, 'cannot supply any phetioType');
    }
    emitter = new Emitter({
        parameters: [
            {
                phetioType: NumberIO,
                name: 'myNumber'
            }
        ]
    });
    emitter.emit(4);
    emitter.emit(10);
    window.assert && assert.throws(()=>emitter.emit('string'), 'cannot emit string');
    window.assert && assert.throws(()=>emitter.emit(null), 'cannot emit string');
    const validator = {
        isValidValue: (v)=>typeof v === 'number' && v < 3
    };
    emitter = new Emitter({
        parameters: [
            merge({
                phetioType: NumberIO,
                name: 'helloIAMNumber'
            }, validator)
        ]
    });
    assert.ok(emitter['parameters'][0].isValidValue === validator.isValidValue, 'should use specified validator instead of NumberIO\'s');
    emitter.emit(2);
    window.assert && assert.throws(()=>emitter.emit('string'), 'cannot emit string with validator');
    window.assert && assert.throws(()=>emitter.emit('a'), 'cannot emit string with  that validator');
    window.assert && assert.throws(()=>emitter.emit(4), 'cannot emit incorrect number');
    const IOType = Emitter.EmitterIO([
        NumberIO
    ]);
    IOType.methods.emit.implementation.call(emitter, 2);
    // @ts-expect-error typescript does not know that getValidationErrors exists
    assert.ok(IOType.methods.getValidationErrors.implementation.call(emitter, 2)[0] === null, 'should be valid');
    // @ts-expect-error typescript does not know that getValidationErrors exists
    assert.ok(IOType.methods.getValidationErrors.implementation.call(emitter, 4)[0] !== null, 'should be invalid');
});

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2F4b24vanMvRW1pdHRlcklPVGVzdHMudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTktMjAyMywgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbi8qKlxuICogUVVuaXQgdGVzdHMgZm9yIEVtaXR0ZXJJT1xuICpcbiAqIEBhdXRob3IgTWljaGFlbCBLYXV6bWFubiAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcbiAqL1xuXG5pbXBvcnQgbWVyZ2UgZnJvbSAnLi4vLi4vcGhldC1jb3JlL2pzL21lcmdlLmpzJztcbmltcG9ydCBOdW1iZXJJTyBmcm9tICcuLi8uLi90YW5kZW0vanMvdHlwZXMvTnVtYmVySU8uanMnO1xuaW1wb3J0IEVtaXR0ZXIgZnJvbSAnLi9FbWl0dGVyLmpzJztcblxuUVVuaXQubW9kdWxlKCAnRW1pdHRlcklPJyApO1xuXG5RVW5pdC50ZXN0KCAndGVzdCBFbWl0dGVySU8nLCBhc3NlcnQgPT4ge1xuXG4gIGxldCBlbWl0dGVyOiBFbWl0dGVyPFsgdW5rbm93biBdPjtcblxuICBpZiAoIHdpbmRvdy5hc3NlcnQgKSB7XG5cbiAgICBhc3NlcnQudGhyb3dzKCAoKSA9PiB7XG4gICAgICBlbWl0dGVyID0gbmV3IEVtaXR0ZXIoIHtcblxuICAgICAgICAvLyBAdHMtZXhwZWN0LWVycm9yIElOVEVOVElPTkFMLCBmb3JjZSBzZXQgcGhldGlvVHlwZSBmb3IgdGVzdGluZ1xuICAgICAgICBwaGV0aW9UeXBlOiBFbWl0dGVyLkVtaXR0ZXJJTyggW10gKVxuICAgICAgfSApO1xuICAgIH0sICdjYW5ub3Qgc3VwcGx5IGRlZmF1bHQgRW1pdHRlcklPIHR5cGUnICk7XG5cbiAgICBhc3NlcnQudGhyb3dzKCAoKSA9PiB7XG4gICAgICBlbWl0dGVyID0gbmV3IEVtaXR0ZXIoIHtcblxuICAgICAgICAvLyBAdHMtZXhwZWN0LWVycm9yIElOVEVOVElPTkFMLCBmb3JjZSBzZXQgcGhldGlvVHlwZSBmb3IgdGVzdGluZ1xuICAgICAgICBwaGV0aW9UeXBlOiBJT1R5cGUuT2JqZWN0SU9cbiAgICAgIH0gKTtcbiAgICB9LCAnY2Fubm90IHN1cHBseSBhbnkgcGhldGlvVHlwZScgKTtcbiAgfVxuXG4gIGVtaXR0ZXIgPSBuZXcgRW1pdHRlcigge1xuICAgIHBhcmFtZXRlcnM6IFtcbiAgICAgIHsgcGhldGlvVHlwZTogTnVtYmVySU8sIG5hbWU6ICdteU51bWJlcicgfVxuICAgIF1cbiAgfSApO1xuICBlbWl0dGVyLmVtaXQoIDQgKTtcbiAgZW1pdHRlci5lbWl0KCAxMCApO1xuICB3aW5kb3cuYXNzZXJ0ICYmIGFzc2VydC50aHJvd3MoICgpID0+IGVtaXR0ZXIuZW1pdCggJ3N0cmluZycgKSwgJ2Nhbm5vdCBlbWl0IHN0cmluZycgKTtcbiAgd2luZG93LmFzc2VydCAmJiBhc3NlcnQudGhyb3dzKCAoKSA9PiBlbWl0dGVyLmVtaXQoIG51bGwgKSwgJ2Nhbm5vdCBlbWl0IHN0cmluZycgKTtcblxuICBjb25zdCB2YWxpZGF0b3IgPSB7IGlzVmFsaWRWYWx1ZTogKCB2OiB1bmtub3duICkgPT4gdHlwZW9mIHYgPT09ICdudW1iZXInICYmIHYgPCAzIH07XG4gIGVtaXR0ZXIgPSBuZXcgRW1pdHRlcigge1xuICAgIHBhcmFtZXRlcnM6IFsgbWVyZ2UoIHsgcGhldGlvVHlwZTogTnVtYmVySU8sIG5hbWU6ICdoZWxsb0lBTU51bWJlcicgfSwgdmFsaWRhdG9yICkgXVxuICB9ICk7XG4gIGFzc2VydC5vayggZW1pdHRlclsgJ3BhcmFtZXRlcnMnIF1bIDAgXS5pc1ZhbGlkVmFsdWUgPT09IHZhbGlkYXRvci5pc1ZhbGlkVmFsdWUsICdzaG91bGQgdXNlIHNwZWNpZmllZCB2YWxpZGF0b3IgaW5zdGVhZCBvZiBOdW1iZXJJT1xcJ3MnICk7XG4gIGVtaXR0ZXIuZW1pdCggMiApO1xuICB3aW5kb3cuYXNzZXJ0ICYmIGFzc2VydC50aHJvd3MoICgpID0+IGVtaXR0ZXIuZW1pdCggJ3N0cmluZycgKSwgJ2Nhbm5vdCBlbWl0IHN0cmluZyB3aXRoIHZhbGlkYXRvcicgKTtcbiAgd2luZG93LmFzc2VydCAmJiBhc3NlcnQudGhyb3dzKCAoKSA9PiBlbWl0dGVyLmVtaXQoICdhJyApLCAnY2Fubm90IGVtaXQgc3RyaW5nIHdpdGggIHRoYXQgdmFsaWRhdG9yJyApO1xuICB3aW5kb3cuYXNzZXJ0ICYmIGFzc2VydC50aHJvd3MoICgpID0+IGVtaXR0ZXIuZW1pdCggNCApLCAnY2Fubm90IGVtaXQgaW5jb3JyZWN0IG51bWJlcicgKTtcblxuICBjb25zdCBJT1R5cGUgPSBFbWl0dGVyLkVtaXR0ZXJJTyggWyBOdW1iZXJJTyBdICk7XG4gIElPVHlwZS5tZXRob2RzIS5lbWl0LmltcGxlbWVudGF0aW9uLmNhbGwoIGVtaXR0ZXIsIDIgKTtcblxuICAvLyBAdHMtZXhwZWN0LWVycm9yIHR5cGVzY3JpcHQgZG9lcyBub3Qga25vdyB0aGF0IGdldFZhbGlkYXRpb25FcnJvcnMgZXhpc3RzXG4gIGFzc2VydC5vayggSU9UeXBlLm1ldGhvZHMhLmdldFZhbGlkYXRpb25FcnJvcnMuaW1wbGVtZW50YXRpb24uY2FsbCggZW1pdHRlciwgMiApWyAwIF0gPT09IG51bGwsICdzaG91bGQgYmUgdmFsaWQnICk7XG5cbiAgLy8gQHRzLWV4cGVjdC1lcnJvciB0eXBlc2NyaXB0IGRvZXMgbm90IGtub3cgdGhhdCBnZXRWYWxpZGF0aW9uRXJyb3JzIGV4aXN0c1xuICBhc3NlcnQub2soIElPVHlwZS5tZXRob2RzIS5nZXRWYWxpZGF0aW9uRXJyb3JzLmltcGxlbWVudGF0aW9uLmNhbGwoIGVtaXR0ZXIsIDQgKVsgMCBdICE9PSBudWxsLCAnc2hvdWxkIGJlIGludmFsaWQnICk7XG59ICk7Il0sIm5hbWVzIjpbIm1lcmdlIiwiTnVtYmVySU8iLCJFbWl0dGVyIiwiUVVuaXQiLCJtb2R1bGUiLCJ0ZXN0IiwiYXNzZXJ0IiwiZW1pdHRlciIsIndpbmRvdyIsInRocm93cyIsInBoZXRpb1R5cGUiLCJFbWl0dGVySU8iLCJJT1R5cGUiLCJPYmplY3RJTyIsInBhcmFtZXRlcnMiLCJuYW1lIiwiZW1pdCIsInZhbGlkYXRvciIsImlzVmFsaWRWYWx1ZSIsInYiLCJvayIsIm1ldGhvZHMiLCJpbXBsZW1lbnRhdGlvbiIsImNhbGwiLCJnZXRWYWxpZGF0aW9uRXJyb3JzIl0sIm1hcHBpbmdzIjoiQUFBQSxzREFBc0Q7QUFFdEQ7Ozs7Q0FJQyxHQUVELE9BQU9BLFdBQVcsOEJBQThCO0FBQ2hELE9BQU9DLGNBQWMsb0NBQW9DO0FBQ3pELE9BQU9DLGFBQWEsZUFBZTtBQUVuQ0MsTUFBTUMsTUFBTSxDQUFFO0FBRWRELE1BQU1FLElBQUksQ0FBRSxrQkFBa0JDLENBQUFBO0lBRTVCLElBQUlDO0lBRUosSUFBS0MsT0FBT0YsTUFBTSxFQUFHO1FBRW5CQSxPQUFPRyxNQUFNLENBQUU7WUFDYkYsVUFBVSxJQUFJTCxRQUFTO2dCQUVyQixpRUFBaUU7Z0JBQ2pFUSxZQUFZUixRQUFRUyxTQUFTLENBQUUsRUFBRTtZQUNuQztRQUNGLEdBQUc7UUFFSEwsT0FBT0csTUFBTSxDQUFFO1lBQ2JGLFVBQVUsSUFBSUwsUUFBUztnQkFFckIsaUVBQWlFO2dCQUNqRVEsWUFBWUUsT0FBT0MsUUFBUTtZQUM3QjtRQUNGLEdBQUc7SUFDTDtJQUVBTixVQUFVLElBQUlMLFFBQVM7UUFDckJZLFlBQVk7WUFDVjtnQkFBRUosWUFBWVQ7Z0JBQVVjLE1BQU07WUFBVztTQUMxQztJQUNIO0lBQ0FSLFFBQVFTLElBQUksQ0FBRTtJQUNkVCxRQUFRUyxJQUFJLENBQUU7SUFDZFIsT0FBT0YsTUFBTSxJQUFJQSxPQUFPRyxNQUFNLENBQUUsSUFBTUYsUUFBUVMsSUFBSSxDQUFFLFdBQVk7SUFDaEVSLE9BQU9GLE1BQU0sSUFBSUEsT0FBT0csTUFBTSxDQUFFLElBQU1GLFFBQVFTLElBQUksQ0FBRSxPQUFRO0lBRTVELE1BQU1DLFlBQVk7UUFBRUMsY0FBYyxDQUFFQyxJQUFnQixPQUFPQSxNQUFNLFlBQVlBLElBQUk7SUFBRTtJQUNuRlosVUFBVSxJQUFJTCxRQUFTO1FBQ3JCWSxZQUFZO1lBQUVkLE1BQU87Z0JBQUVVLFlBQVlUO2dCQUFVYyxNQUFNO1lBQWlCLEdBQUdFO1NBQWE7SUFDdEY7SUFDQVgsT0FBT2MsRUFBRSxDQUFFYixPQUFPLENBQUUsYUFBYyxDQUFFLEVBQUcsQ0FBQ1csWUFBWSxLQUFLRCxVQUFVQyxZQUFZLEVBQUU7SUFDakZYLFFBQVFTLElBQUksQ0FBRTtJQUNkUixPQUFPRixNQUFNLElBQUlBLE9BQU9HLE1BQU0sQ0FBRSxJQUFNRixRQUFRUyxJQUFJLENBQUUsV0FBWTtJQUNoRVIsT0FBT0YsTUFBTSxJQUFJQSxPQUFPRyxNQUFNLENBQUUsSUFBTUYsUUFBUVMsSUFBSSxDQUFFLE1BQU87SUFDM0RSLE9BQU9GLE1BQU0sSUFBSUEsT0FBT0csTUFBTSxDQUFFLElBQU1GLFFBQVFTLElBQUksQ0FBRSxJQUFLO0lBRXpELE1BQU1KLFNBQVNWLFFBQVFTLFNBQVMsQ0FBRTtRQUFFVjtLQUFVO0lBQzlDVyxPQUFPUyxPQUFPLENBQUVMLElBQUksQ0FBQ00sY0FBYyxDQUFDQyxJQUFJLENBQUVoQixTQUFTO0lBRW5ELDRFQUE0RTtJQUM1RUQsT0FBT2MsRUFBRSxDQUFFUixPQUFPUyxPQUFPLENBQUVHLG1CQUFtQixDQUFDRixjQUFjLENBQUNDLElBQUksQ0FBRWhCLFNBQVMsRUFBRyxDQUFFLEVBQUcsS0FBSyxNQUFNO0lBRWhHLDRFQUE0RTtJQUM1RUQsT0FBT2MsRUFBRSxDQUFFUixPQUFPUyxPQUFPLENBQUVHLG1CQUFtQixDQUFDRixjQUFjLENBQUNDLElBQUksQ0FBRWhCLFNBQVMsRUFBRyxDQUFFLEVBQUcsS0FBSyxNQUFNO0FBQ2xHIn0=