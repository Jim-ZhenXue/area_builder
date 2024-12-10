// Copyright 2018-2021, University of Colorado Boulder
/**
 * FireListener tests
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ import Tandem from '../../../tandem/js/Tandem.js';
import FireListener from './FireListener.js';
import ListenerTestUtils from './ListenerTestUtils.js';
QUnit.module('FireListener');
QUnit.test('Basics', (assert)=>{
    ListenerTestUtils.simpleRectangleTest((display, rect, node)=>{
        let fireCount = 0;
        const listener = new FireListener({
            tandem: Tandem.ROOT_TEST.createTandem('myListener'),
            fire: ()=>{
                fireCount++;
            }
        });
        rect.addInputListener(listener);
        ListenerTestUtils.mouseMove(display, 10, 10);
        assert.equal(fireCount, 0, 'Not yet fired on move');
        ListenerTestUtils.mouseDown(display, 10, 10);
        assert.equal(fireCount, 0, 'Not yet fired on initial press');
        ListenerTestUtils.mouseUp(display, 10, 10);
        assert.equal(fireCount, 1, 'It fired on release');
        ListenerTestUtils.mouseMove(display, 50, 10);
        ListenerTestUtils.mouseDown(display, 50, 10);
        ListenerTestUtils.mouseUp(display, 50, 10);
        assert.equal(fireCount, 1, 'Should not fire when the mouse totally misses');
        ListenerTestUtils.mouseMove(display, 10, 10);
        ListenerTestUtils.mouseDown(display, 10, 10);
        ListenerTestUtils.mouseMove(display, 50, 10);
        ListenerTestUtils.mouseUp(display, 50, 10);
        assert.equal(fireCount, 1, 'Should NOT fire when pressed and then moved away');
        ListenerTestUtils.mouseMove(display, 50, 10);
        ListenerTestUtils.mouseDown(display, 50, 10);
        ListenerTestUtils.mouseMove(display, 10, 10);
        ListenerTestUtils.mouseUp(display, 10, 10);
        assert.equal(fireCount, 1, 'Should NOT fire when the press misses (even if the release is over)');
        ListenerTestUtils.mouseMove(display, 10, 10);
        ListenerTestUtils.mouseDown(display, 10, 10);
        listener.interrupt();
        ListenerTestUtils.mouseUp(display, 10, 10);
        assert.equal(fireCount, 1, 'Should NOT fire on an interruption');
        ListenerTestUtils.mouseMove(display, 10, 10);
        ListenerTestUtils.mouseDown(display, 10, 10);
        ListenerTestUtils.mouseMove(display, 50, 10);
        ListenerTestUtils.mouseMove(display, 10, 10);
        ListenerTestUtils.mouseUp(display, 10, 10);
        assert.equal(fireCount, 2, 'Should fire if the mouse is moved away after press (but moved back before release)');
        listener.dispose();
    });
});

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvbGlzdGVuZXJzL0ZpcmVMaXN0ZW5lclRlc3RzLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE4LTIwMjEsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIEZpcmVMaXN0ZW5lciB0ZXN0c1xuICpcbiAqIEBhdXRob3IgSm9uYXRoYW4gT2xzb24gPGpvbmF0aGFuLm9sc29uQGNvbG9yYWRvLmVkdT5cbiAqL1xuXG5pbXBvcnQgVGFuZGVtIGZyb20gJy4uLy4uLy4uL3RhbmRlbS9qcy9UYW5kZW0uanMnO1xuaW1wb3J0IEZpcmVMaXN0ZW5lciBmcm9tICcuL0ZpcmVMaXN0ZW5lci5qcyc7XG5pbXBvcnQgTGlzdGVuZXJUZXN0VXRpbHMgZnJvbSAnLi9MaXN0ZW5lclRlc3RVdGlscy5qcyc7XG5cblFVbml0Lm1vZHVsZSggJ0ZpcmVMaXN0ZW5lcicgKTtcblxuUVVuaXQudGVzdCggJ0Jhc2ljcycsIGFzc2VydCA9PiB7XG4gIExpc3RlbmVyVGVzdFV0aWxzLnNpbXBsZVJlY3RhbmdsZVRlc3QoICggZGlzcGxheSwgcmVjdCwgbm9kZSApID0+IHtcbiAgICBsZXQgZmlyZUNvdW50ID0gMDtcbiAgICBjb25zdCBsaXN0ZW5lciA9IG5ldyBGaXJlTGlzdGVuZXIoIHtcbiAgICAgIHRhbmRlbTogVGFuZGVtLlJPT1RfVEVTVC5jcmVhdGVUYW5kZW0oICdteUxpc3RlbmVyJyApLFxuICAgICAgZmlyZTogKCkgPT4ge1xuICAgICAgICBmaXJlQ291bnQrKztcbiAgICAgIH1cbiAgICB9ICk7XG4gICAgcmVjdC5hZGRJbnB1dExpc3RlbmVyKCBsaXN0ZW5lciApO1xuXG4gICAgTGlzdGVuZXJUZXN0VXRpbHMubW91c2VNb3ZlKCBkaXNwbGF5LCAxMCwgMTAgKTtcbiAgICBhc3NlcnQuZXF1YWwoIGZpcmVDb3VudCwgMCwgJ05vdCB5ZXQgZmlyZWQgb24gbW92ZScgKTtcbiAgICBMaXN0ZW5lclRlc3RVdGlscy5tb3VzZURvd24oIGRpc3BsYXksIDEwLCAxMCApO1xuICAgIGFzc2VydC5lcXVhbCggZmlyZUNvdW50LCAwLCAnTm90IHlldCBmaXJlZCBvbiBpbml0aWFsIHByZXNzJyApO1xuICAgIExpc3RlbmVyVGVzdFV0aWxzLm1vdXNlVXAoIGRpc3BsYXksIDEwLCAxMCApO1xuICAgIGFzc2VydC5lcXVhbCggZmlyZUNvdW50LCAxLCAnSXQgZmlyZWQgb24gcmVsZWFzZScgKTtcblxuICAgIExpc3RlbmVyVGVzdFV0aWxzLm1vdXNlTW92ZSggZGlzcGxheSwgNTAsIDEwICk7XG4gICAgTGlzdGVuZXJUZXN0VXRpbHMubW91c2VEb3duKCBkaXNwbGF5LCA1MCwgMTAgKTtcbiAgICBMaXN0ZW5lclRlc3RVdGlscy5tb3VzZVVwKCBkaXNwbGF5LCA1MCwgMTAgKTtcbiAgICBhc3NlcnQuZXF1YWwoIGZpcmVDb3VudCwgMSwgJ1Nob3VsZCBub3QgZmlyZSB3aGVuIHRoZSBtb3VzZSB0b3RhbGx5IG1pc3NlcycgKTtcblxuICAgIExpc3RlbmVyVGVzdFV0aWxzLm1vdXNlTW92ZSggZGlzcGxheSwgMTAsIDEwICk7XG4gICAgTGlzdGVuZXJUZXN0VXRpbHMubW91c2VEb3duKCBkaXNwbGF5LCAxMCwgMTAgKTtcbiAgICBMaXN0ZW5lclRlc3RVdGlscy5tb3VzZU1vdmUoIGRpc3BsYXksIDUwLCAxMCApO1xuICAgIExpc3RlbmVyVGVzdFV0aWxzLm1vdXNlVXAoIGRpc3BsYXksIDUwLCAxMCApO1xuICAgIGFzc2VydC5lcXVhbCggZmlyZUNvdW50LCAxLCAnU2hvdWxkIE5PVCBmaXJlIHdoZW4gcHJlc3NlZCBhbmQgdGhlbiBtb3ZlZCBhd2F5JyApO1xuXG4gICAgTGlzdGVuZXJUZXN0VXRpbHMubW91c2VNb3ZlKCBkaXNwbGF5LCA1MCwgMTAgKTtcbiAgICBMaXN0ZW5lclRlc3RVdGlscy5tb3VzZURvd24oIGRpc3BsYXksIDUwLCAxMCApO1xuICAgIExpc3RlbmVyVGVzdFV0aWxzLm1vdXNlTW92ZSggZGlzcGxheSwgMTAsIDEwICk7XG4gICAgTGlzdGVuZXJUZXN0VXRpbHMubW91c2VVcCggZGlzcGxheSwgMTAsIDEwICk7XG4gICAgYXNzZXJ0LmVxdWFsKCBmaXJlQ291bnQsIDEsICdTaG91bGQgTk9UIGZpcmUgd2hlbiB0aGUgcHJlc3MgbWlzc2VzIChldmVuIGlmIHRoZSByZWxlYXNlIGlzIG92ZXIpJyApO1xuXG4gICAgTGlzdGVuZXJUZXN0VXRpbHMubW91c2VNb3ZlKCBkaXNwbGF5LCAxMCwgMTAgKTtcbiAgICBMaXN0ZW5lclRlc3RVdGlscy5tb3VzZURvd24oIGRpc3BsYXksIDEwLCAxMCApO1xuICAgIGxpc3RlbmVyLmludGVycnVwdCgpO1xuICAgIExpc3RlbmVyVGVzdFV0aWxzLm1vdXNlVXAoIGRpc3BsYXksIDEwLCAxMCApO1xuICAgIGFzc2VydC5lcXVhbCggZmlyZUNvdW50LCAxLCAnU2hvdWxkIE5PVCBmaXJlIG9uIGFuIGludGVycnVwdGlvbicgKTtcblxuICAgIExpc3RlbmVyVGVzdFV0aWxzLm1vdXNlTW92ZSggZGlzcGxheSwgMTAsIDEwICk7XG4gICAgTGlzdGVuZXJUZXN0VXRpbHMubW91c2VEb3duKCBkaXNwbGF5LCAxMCwgMTAgKTtcbiAgICBMaXN0ZW5lclRlc3RVdGlscy5tb3VzZU1vdmUoIGRpc3BsYXksIDUwLCAxMCApO1xuICAgIExpc3RlbmVyVGVzdFV0aWxzLm1vdXNlTW92ZSggZGlzcGxheSwgMTAsIDEwICk7XG4gICAgTGlzdGVuZXJUZXN0VXRpbHMubW91c2VVcCggZGlzcGxheSwgMTAsIDEwICk7XG4gICAgYXNzZXJ0LmVxdWFsKCBmaXJlQ291bnQsIDIsICdTaG91bGQgZmlyZSBpZiB0aGUgbW91c2UgaXMgbW92ZWQgYXdheSBhZnRlciBwcmVzcyAoYnV0IG1vdmVkIGJhY2sgYmVmb3JlIHJlbGVhc2UpJyApO1xuXG4gICAgbGlzdGVuZXIuZGlzcG9zZSgpO1xuICB9ICk7XG59ICk7Il0sIm5hbWVzIjpbIlRhbmRlbSIsIkZpcmVMaXN0ZW5lciIsIkxpc3RlbmVyVGVzdFV0aWxzIiwiUVVuaXQiLCJtb2R1bGUiLCJ0ZXN0IiwiYXNzZXJ0Iiwic2ltcGxlUmVjdGFuZ2xlVGVzdCIsImRpc3BsYXkiLCJyZWN0Iiwibm9kZSIsImZpcmVDb3VudCIsImxpc3RlbmVyIiwidGFuZGVtIiwiUk9PVF9URVNUIiwiY3JlYXRlVGFuZGVtIiwiZmlyZSIsImFkZElucHV0TGlzdGVuZXIiLCJtb3VzZU1vdmUiLCJlcXVhbCIsIm1vdXNlRG93biIsIm1vdXNlVXAiLCJpbnRlcnJ1cHQiLCJkaXNwb3NlIl0sIm1hcHBpbmdzIjoiQUFBQSxzREFBc0Q7QUFFdEQ7Ozs7Q0FJQyxHQUVELE9BQU9BLFlBQVksK0JBQStCO0FBQ2xELE9BQU9DLGtCQUFrQixvQkFBb0I7QUFDN0MsT0FBT0MsdUJBQXVCLHlCQUF5QjtBQUV2REMsTUFBTUMsTUFBTSxDQUFFO0FBRWRELE1BQU1FLElBQUksQ0FBRSxVQUFVQyxDQUFBQTtJQUNwQkosa0JBQWtCSyxtQkFBbUIsQ0FBRSxDQUFFQyxTQUFTQyxNQUFNQztRQUN0RCxJQUFJQyxZQUFZO1FBQ2hCLE1BQU1DLFdBQVcsSUFBSVgsYUFBYztZQUNqQ1ksUUFBUWIsT0FBT2MsU0FBUyxDQUFDQyxZQUFZLENBQUU7WUFDdkNDLE1BQU07Z0JBQ0pMO1lBQ0Y7UUFDRjtRQUNBRixLQUFLUSxnQkFBZ0IsQ0FBRUw7UUFFdkJWLGtCQUFrQmdCLFNBQVMsQ0FBRVYsU0FBUyxJQUFJO1FBQzFDRixPQUFPYSxLQUFLLENBQUVSLFdBQVcsR0FBRztRQUM1QlQsa0JBQWtCa0IsU0FBUyxDQUFFWixTQUFTLElBQUk7UUFDMUNGLE9BQU9hLEtBQUssQ0FBRVIsV0FBVyxHQUFHO1FBQzVCVCxrQkFBa0JtQixPQUFPLENBQUViLFNBQVMsSUFBSTtRQUN4Q0YsT0FBT2EsS0FBSyxDQUFFUixXQUFXLEdBQUc7UUFFNUJULGtCQUFrQmdCLFNBQVMsQ0FBRVYsU0FBUyxJQUFJO1FBQzFDTixrQkFBa0JrQixTQUFTLENBQUVaLFNBQVMsSUFBSTtRQUMxQ04sa0JBQWtCbUIsT0FBTyxDQUFFYixTQUFTLElBQUk7UUFDeENGLE9BQU9hLEtBQUssQ0FBRVIsV0FBVyxHQUFHO1FBRTVCVCxrQkFBa0JnQixTQUFTLENBQUVWLFNBQVMsSUFBSTtRQUMxQ04sa0JBQWtCa0IsU0FBUyxDQUFFWixTQUFTLElBQUk7UUFDMUNOLGtCQUFrQmdCLFNBQVMsQ0FBRVYsU0FBUyxJQUFJO1FBQzFDTixrQkFBa0JtQixPQUFPLENBQUViLFNBQVMsSUFBSTtRQUN4Q0YsT0FBT2EsS0FBSyxDQUFFUixXQUFXLEdBQUc7UUFFNUJULGtCQUFrQmdCLFNBQVMsQ0FBRVYsU0FBUyxJQUFJO1FBQzFDTixrQkFBa0JrQixTQUFTLENBQUVaLFNBQVMsSUFBSTtRQUMxQ04sa0JBQWtCZ0IsU0FBUyxDQUFFVixTQUFTLElBQUk7UUFDMUNOLGtCQUFrQm1CLE9BQU8sQ0FBRWIsU0FBUyxJQUFJO1FBQ3hDRixPQUFPYSxLQUFLLENBQUVSLFdBQVcsR0FBRztRQUU1QlQsa0JBQWtCZ0IsU0FBUyxDQUFFVixTQUFTLElBQUk7UUFDMUNOLGtCQUFrQmtCLFNBQVMsQ0FBRVosU0FBUyxJQUFJO1FBQzFDSSxTQUFTVSxTQUFTO1FBQ2xCcEIsa0JBQWtCbUIsT0FBTyxDQUFFYixTQUFTLElBQUk7UUFDeENGLE9BQU9hLEtBQUssQ0FBRVIsV0FBVyxHQUFHO1FBRTVCVCxrQkFBa0JnQixTQUFTLENBQUVWLFNBQVMsSUFBSTtRQUMxQ04sa0JBQWtCa0IsU0FBUyxDQUFFWixTQUFTLElBQUk7UUFDMUNOLGtCQUFrQmdCLFNBQVMsQ0FBRVYsU0FBUyxJQUFJO1FBQzFDTixrQkFBa0JnQixTQUFTLENBQUVWLFNBQVMsSUFBSTtRQUMxQ04sa0JBQWtCbUIsT0FBTyxDQUFFYixTQUFTLElBQUk7UUFDeENGLE9BQU9hLEtBQUssQ0FBRVIsV0FBVyxHQUFHO1FBRTVCQyxTQUFTVyxPQUFPO0lBQ2xCO0FBQ0YifQ==