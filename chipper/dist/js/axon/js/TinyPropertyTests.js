// Copyright 2020-2024, University of Colorado Boulder
/**
 * QUnit tests for Emitter
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Michael Kauzmann (PhET Interactive Simulations)
 * @author Chris Klusendorf (PhET Interactive Simulations)
 */ import Vector2 from '../../dot/js/Vector2.js';
import TinyProperty from './TinyProperty.js';
QUnit.module('TinyProperty');
QUnit.test('TinyProperty Basics', (assert)=>{
    const property = new TinyProperty('x');
    property.link((value)=>{
        console.log(value);
    });
    assert.ok(true, 'one test');
});
QUnit.test('TinyProperty onBeforeNotify', (assert)=>{
    let MyObservedObject = class MyObservedObject {
        constructor(){
            this.hasFun = false;
            this.hadFun = false;
            this.hasFunProperty = new TinyProperty(false, (newValue, oldValue)=>{
                this.hasFun = newValue;
                this.hadFun = oldValue;
            });
        }
    };
    const x = new MyObservedObject();
    x.hasFunProperty.lazyLink((newValue, oldValue)=>{
        assert.ok(x.hadFun === oldValue, 'old value should match');
        assert.ok(x.hasFun === newValue, 'new value should match');
    });
    x.hasFunProperty.value = true;
    x.hasFunProperty.value = false;
    x.hasFunProperty.value = true;
});
QUnit.test('TinyProperty valueComparisonStrategy', (assert)=>{
    let calledCount = 0;
    const myProperty = new TinyProperty(0);
    myProperty.lazyLink(()=>calledCount++);
    myProperty.value = 0;
    assert.ok(calledCount === 0, 'no value change');
    myProperty.value = 1;
    assert.ok(calledCount === 1, 'reference number valueChange');
    myProperty.valueComparisonStrategy = 'reference';
    myProperty.value = 1;
    assert.ok(calledCount === 1, 'no reference number valueChange');
    myProperty.value = 3;
    assert.ok(calledCount === 2, 'reference number valueChange');
    myProperty.value = new Vector2(0, 0);
    assert.ok(calledCount === 3, 'vector is different');
    myProperty.value = new Vector2(0, 0);
    assert.ok(calledCount === 4, 'still reference vector is different');
    myProperty.valueComparisonStrategy = 'equalsFunction';
    myProperty.value = new Vector2(0, 0);
    assert.ok(calledCount === 4, 'equal');
    myProperty.value = new Vector2(0, 3);
    assert.ok(calledCount === 5, 'not equal');
    myProperty.valueComparisonStrategy = 'lodashDeep';
    myProperty.value = {
        something: 'hi'
    };
    assert.ok(calledCount === 6, 'not equal');
    myProperty.value = {
        something: 'hi'
    };
    assert.ok(calledCount === 6, 'equal');
    myProperty.value = {
        something: 'hi',
        other: false
    };
    assert.ok(calledCount === 7, 'not equal with other key');
});
QUnit.test('TinyProperty reentrant notify order (reentrantNotificationStrategy:queue)', (assert)=>{
    let count = 2; // starts as a value of 1, so 2 is the first value we change to.
    // queue is default
    const myProperty = new TinyProperty(1);
    myProperty.lazyLink((value, oldValue)=>{
        if (value < 10) {
            myProperty.value = value + 1;
            console.log('queue:', oldValue, '->', value);
        }
    });
    // notify-queue:
    // 1->2
    // 2->3
    // 3->4
    // ...
    // 8->9
    myProperty.lazyLink((value, oldValue)=>{
        assert.ok(value === oldValue + 1, `increment each time: ${oldValue} -> ${value}`);
        assert.ok(value === count++, `increment by most recent changed: ${count - 2}->${count - 1}, received: ${oldValue} -> ${value}`);
    });
    myProperty.value = count;
});
QUnit.test('TinyProperty reentrant notify order (reentrantNotificationStrategy:stack)', (assert)=>{
    let count = 2; // starts as a value of 1, so 2 is the first value we change to.
    const finalCount = 10;
    let lastListenerCount = 10;
    const myProperty = new TinyProperty(count - 1, null, null, 'stack');
    myProperty.lazyLink((value, oldValue)=>{
        if (value < finalCount) {
            myProperty.value = value + 1;
            console.log('stack:', oldValue, '->', value);
        }
    });
    // stack-notify:
    // 8->9
    // 7->8
    // 6->7
    // ...
    // 1->2
    myProperty.lazyLink((value, oldValue)=>{
        count++;
        assert.ok(value === oldValue + 1, `increment each time: ${oldValue} -> ${value}`);
        assert.ok(value === lastListenerCount--, `increment in order expected: ${lastListenerCount}->${lastListenerCount + 1}, received: ${oldValue} -> ${value}`);
        assert.ok(oldValue === lastListenerCount, `new count is ${lastListenerCount}: the oldValue (most recent first in stack first`);
    });
    myProperty.value = count;
});
QUnit.test('TinyProperty reentrant lazyLinks (reentrantNotificationStrategy:queue)', (assert)=>{
    const myProperty = new TinyProperty(0, null, null, 'queue');
    let linkCalledCount = 0;
    let reentered = false;
    myProperty.lazyLink((value)=>{
        if (!reentered) {
            reentered = true;
            myProperty.value = value + 1;
            myProperty.link((newValue)=>{
                console.log(value, newValue);
                assert.ok(++linkCalledCount <= 1, 'should not be called from original change, just from link');
            });
            // This is great!. It isn't actually like a queue, but how strange it would be to have the above value change trigger
            // this listener because of the queue based reentrant notification strategy. It is better to guard against that so
            // this isn't called on previously called value changes.
            myProperty.lazyLink(()=>{
                assert.ok(false, 'should not be called from original change');
            });
        }
    });
    myProperty.value = 1;
    myProperty.removeAllListeners();
    /////////////////////////////////////////
    myProperty.value = -1;
    myProperty.lazyLink((originalValue)=>{
        if (originalValue < 5) {
            let lazyLinkCalledCount = originalValue + 1;
            myProperty.value = originalValue + 1;
            assert.equal(myProperty.value, originalValue + 1, 'value is immediately correct for access (reentrantly)');
            myProperty.lazyLink((newValue)=>{
                assert.ok(newValue !== originalValue, `${originalValue}: should not be called from original change`);
                assert.equal(newValue, ++lazyLinkCalledCount, `${lazyLinkCalledCount}: should be called in order (lazyLink)`);
            });
        }
    });
    myProperty.value = 0;
});

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2F4b24vanMvVGlueVByb3BlcnR5VGVzdHMudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjAtMjAyNCwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbi8qKlxuICogUVVuaXQgdGVzdHMgZm9yIEVtaXR0ZXJcbiAqXG4gKiBAYXV0aG9yIFNhbSBSZWlkIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxuICogQGF1dGhvciBNaWNoYWVsIEthdXptYW5uIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxuICogQGF1dGhvciBDaHJpcyBLbHVzZW5kb3JmIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxuICovXG5cbmltcG9ydCBWZWN0b3IyIGZyb20gJy4uLy4uL2RvdC9qcy9WZWN0b3IyLmpzJztcbmltcG9ydCBJbnRlbnRpb25hbEFueSBmcm9tICcuLi8uLi9waGV0LWNvcmUvanMvdHlwZXMvSW50ZW50aW9uYWxBbnkuanMnO1xuaW1wb3J0IFRpbnlQcm9wZXJ0eSBmcm9tICcuL1RpbnlQcm9wZXJ0eS5qcyc7XG5cblFVbml0Lm1vZHVsZSggJ1RpbnlQcm9wZXJ0eScgKTtcblxuUVVuaXQudGVzdCggJ1RpbnlQcm9wZXJ0eSBCYXNpY3MnLCBhc3NlcnQgPT4ge1xuICBjb25zdCBwcm9wZXJ0eSA9IG5ldyBUaW55UHJvcGVydHkoICd4JyApO1xuICBwcm9wZXJ0eS5saW5rKCB2YWx1ZSA9PiB7XG4gICAgY29uc29sZS5sb2coIHZhbHVlICk7XG4gIH0gKTtcblxuICBhc3NlcnQub2soIHRydWUsICdvbmUgdGVzdCcgKTtcbn0gKTtcblxuUVVuaXQudGVzdCggJ1RpbnlQcm9wZXJ0eSBvbkJlZm9yZU5vdGlmeScsIGFzc2VydCA9PiB7XG5cbiAgY2xhc3MgTXlPYnNlcnZlZE9iamVjdCB7XG4gICAgcHVibGljIGhhc0Z1bjogYm9vbGVhbjtcbiAgICBwdWJsaWMgaGFkRnVuOiBib29sZWFuIHwgbnVsbDtcbiAgICBwdWJsaWMgaGFzRnVuUHJvcGVydHk6IFRpbnlQcm9wZXJ0eTxib29sZWFuPjtcblxuICAgIHB1YmxpYyBjb25zdHJ1Y3RvcigpIHtcbiAgICAgIHRoaXMuaGFzRnVuID0gZmFsc2U7XG4gICAgICB0aGlzLmhhZEZ1biA9IGZhbHNlO1xuICAgICAgdGhpcy5oYXNGdW5Qcm9wZXJ0eSA9IG5ldyBUaW55UHJvcGVydHkoIGZhbHNlLCAoIG5ld1ZhbHVlLCBvbGRWYWx1ZSApID0+IHtcbiAgICAgICAgdGhpcy5oYXNGdW4gPSBuZXdWYWx1ZTtcbiAgICAgICAgdGhpcy5oYWRGdW4gPSBvbGRWYWx1ZTtcbiAgICAgIH0gKTtcbiAgICB9XG4gIH1cblxuICBjb25zdCB4ID0gbmV3IE15T2JzZXJ2ZWRPYmplY3QoKTtcblxuICB4Lmhhc0Z1blByb3BlcnR5LmxhenlMaW5rKCAoIG5ld1ZhbHVlLCBvbGRWYWx1ZSApID0+IHtcbiAgICBhc3NlcnQub2soIHguaGFkRnVuID09PSBvbGRWYWx1ZSwgJ29sZCB2YWx1ZSBzaG91bGQgbWF0Y2gnICk7XG4gICAgYXNzZXJ0Lm9rKCB4Lmhhc0Z1biA9PT0gbmV3VmFsdWUsICduZXcgdmFsdWUgc2hvdWxkIG1hdGNoJyApO1xuICB9ICk7XG5cblxuICB4Lmhhc0Z1blByb3BlcnR5LnZhbHVlID0gdHJ1ZTtcbiAgeC5oYXNGdW5Qcm9wZXJ0eS52YWx1ZSA9IGZhbHNlO1xuICB4Lmhhc0Z1blByb3BlcnR5LnZhbHVlID0gdHJ1ZTtcbn0gKTtcblxuUVVuaXQudGVzdCggJ1RpbnlQcm9wZXJ0eSB2YWx1ZUNvbXBhcmlzb25TdHJhdGVneScsIGFzc2VydCA9PiB7XG5cbiAgbGV0IGNhbGxlZENvdW50ID0gMDtcbiAgY29uc3QgbXlQcm9wZXJ0eSA9IG5ldyBUaW55UHJvcGVydHk8SW50ZW50aW9uYWxBbnk+KCAwICk7XG4gIG15UHJvcGVydHkubGF6eUxpbmsoICgpID0+IGNhbGxlZENvdW50KysgKTtcblxuICBteVByb3BlcnR5LnZhbHVlID0gMDtcbiAgYXNzZXJ0Lm9rKCBjYWxsZWRDb3VudCA9PT0gMCwgJ25vIHZhbHVlIGNoYW5nZScgKTtcblxuICBteVByb3BlcnR5LnZhbHVlID0gMTtcbiAgYXNzZXJ0Lm9rKCBjYWxsZWRDb3VudCA9PT0gMSwgJ3JlZmVyZW5jZSBudW1iZXIgdmFsdWVDaGFuZ2UnICk7XG5cbiAgbXlQcm9wZXJ0eS52YWx1ZUNvbXBhcmlzb25TdHJhdGVneSA9ICdyZWZlcmVuY2UnO1xuICBteVByb3BlcnR5LnZhbHVlID0gMTtcbiAgYXNzZXJ0Lm9rKCBjYWxsZWRDb3VudCA9PT0gMSwgJ25vIHJlZmVyZW5jZSBudW1iZXIgdmFsdWVDaGFuZ2UnICk7XG4gIG15UHJvcGVydHkudmFsdWUgPSAzO1xuICBhc3NlcnQub2soIGNhbGxlZENvdW50ID09PSAyLCAncmVmZXJlbmNlIG51bWJlciB2YWx1ZUNoYW5nZScgKTtcblxuICBteVByb3BlcnR5LnZhbHVlID0gbmV3IFZlY3RvcjIoIDAsIDAgKTtcbiAgYXNzZXJ0Lm9rKCBjYWxsZWRDb3VudCA9PT0gMywgJ3ZlY3RvciBpcyBkaWZmZXJlbnQnICk7XG4gIG15UHJvcGVydHkudmFsdWUgPSBuZXcgVmVjdG9yMiggMCwgMCApO1xuICBhc3NlcnQub2soIGNhbGxlZENvdW50ID09PSA0LCAnc3RpbGwgcmVmZXJlbmNlIHZlY3RvciBpcyBkaWZmZXJlbnQnICk7XG4gIG15UHJvcGVydHkudmFsdWVDb21wYXJpc29uU3RyYXRlZ3kgPSAnZXF1YWxzRnVuY3Rpb24nO1xuICBteVByb3BlcnR5LnZhbHVlID0gbmV3IFZlY3RvcjIoIDAsIDAgKTtcbiAgYXNzZXJ0Lm9rKCBjYWxsZWRDb3VudCA9PT0gNCwgJ2VxdWFsJyApO1xuICBteVByb3BlcnR5LnZhbHVlID0gbmV3IFZlY3RvcjIoIDAsIDMgKTtcbiAgYXNzZXJ0Lm9rKCBjYWxsZWRDb3VudCA9PT0gNSwgJ25vdCBlcXVhbCcgKTtcblxuICBteVByb3BlcnR5LnZhbHVlQ29tcGFyaXNvblN0cmF0ZWd5ID0gJ2xvZGFzaERlZXAnO1xuICBteVByb3BlcnR5LnZhbHVlID0geyBzb21ldGhpbmc6ICdoaScgfTtcbiAgYXNzZXJ0Lm9rKCBjYWxsZWRDb3VudCA9PT0gNiwgJ25vdCBlcXVhbCcgKTtcbiAgbXlQcm9wZXJ0eS52YWx1ZSA9IHsgc29tZXRoaW5nOiAnaGknIH07XG4gIGFzc2VydC5vayggY2FsbGVkQ291bnQgPT09IDYsICdlcXVhbCcgKTtcbiAgbXlQcm9wZXJ0eS52YWx1ZSA9IHsgc29tZXRoaW5nOiAnaGknLCBvdGhlcjogZmFsc2UgfTtcbiAgYXNzZXJ0Lm9rKCBjYWxsZWRDb3VudCA9PT0gNywgJ25vdCBlcXVhbCB3aXRoIG90aGVyIGtleScgKTtcbn0gKTtcblxuUVVuaXQudGVzdCggJ1RpbnlQcm9wZXJ0eSByZWVudHJhbnQgbm90aWZ5IG9yZGVyIChyZWVudHJhbnROb3RpZmljYXRpb25TdHJhdGVneTpxdWV1ZSknLCBhc3NlcnQgPT4ge1xuICBsZXQgY291bnQgPSAyOyAvLyBzdGFydHMgYXMgYSB2YWx1ZSBvZiAxLCBzbyAyIGlzIHRoZSBmaXJzdCB2YWx1ZSB3ZSBjaGFuZ2UgdG8uXG5cbiAgLy8gcXVldWUgaXMgZGVmYXVsdFxuICBjb25zdCBteVByb3BlcnR5ID0gbmV3IFRpbnlQcm9wZXJ0eTxudW1iZXI+KCAxICk7XG5cbiAgbXlQcm9wZXJ0eS5sYXp5TGluayggKCB2YWx1ZSwgb2xkVmFsdWUgKSA9PiB7XG4gICAgaWYgKCB2YWx1ZSA8IDEwICkge1xuICAgICAgbXlQcm9wZXJ0eS52YWx1ZSA9IHZhbHVlICsgMTtcbiAgICAgIGNvbnNvbGUubG9nKCAncXVldWU6Jywgb2xkVmFsdWUsICctPicsIHZhbHVlICk7XG4gICAgfVxuICB9ICk7XG5cbiAgLy8gbm90aWZ5LXF1ZXVlOlxuICAvLyAxLT4yXG4gIC8vIDItPjNcbiAgLy8gMy0+NFxuICAvLyAuLi5cbiAgLy8gOC0+OVxuXG4gIG15UHJvcGVydHkubGF6eUxpbmsoICggdmFsdWUsIG9sZFZhbHVlICkgPT4ge1xuICAgIGFzc2VydC5vayggdmFsdWUgPT09IG9sZFZhbHVlICsgMSwgYGluY3JlbWVudCBlYWNoIHRpbWU6ICR7b2xkVmFsdWV9IC0+ICR7dmFsdWV9YCApO1xuICAgIGFzc2VydC5vayggdmFsdWUgPT09IGNvdW50KyssIGBpbmNyZW1lbnQgYnkgbW9zdCByZWNlbnQgY2hhbmdlZDogJHtjb3VudCAtIDJ9LT4ke2NvdW50IC0gMX0sIHJlY2VpdmVkOiAke29sZFZhbHVlfSAtPiAke3ZhbHVlfWAgKTtcbiAgfSApO1xuICBteVByb3BlcnR5LnZhbHVlID0gY291bnQ7XG59ICk7XG5cblFVbml0LnRlc3QoICdUaW55UHJvcGVydHkgcmVlbnRyYW50IG5vdGlmeSBvcmRlciAocmVlbnRyYW50Tm90aWZpY2F0aW9uU3RyYXRlZ3k6c3RhY2spJywgYXNzZXJ0ID0+IHtcbiAgbGV0IGNvdW50ID0gMjsgLy8gc3RhcnRzIGFzIGEgdmFsdWUgb2YgMSwgc28gMiBpcyB0aGUgZmlyc3QgdmFsdWUgd2UgY2hhbmdlIHRvLlxuICBjb25zdCBmaW5hbENvdW50ID0gMTA7XG4gIGxldCBsYXN0TGlzdGVuZXJDb3VudCA9IDEwO1xuXG4gIGNvbnN0IG15UHJvcGVydHkgPSBuZXcgVGlueVByb3BlcnR5PG51bWJlcj4oIGNvdW50IC0gMSwgbnVsbCwgbnVsbCwgJ3N0YWNrJyApO1xuXG4gIG15UHJvcGVydHkubGF6eUxpbmsoICggdmFsdWUsIG9sZFZhbHVlICkgPT4ge1xuICAgIGlmICggdmFsdWUgPCBmaW5hbENvdW50ICkge1xuICAgICAgbXlQcm9wZXJ0eS52YWx1ZSA9IHZhbHVlICsgMTtcbiAgICAgIGNvbnNvbGUubG9nKCAnc3RhY2s6Jywgb2xkVmFsdWUsICctPicsIHZhbHVlICk7XG4gICAgfVxuICB9ICk7XG5cbiAgLy8gc3RhY2stbm90aWZ5OlxuICAvLyA4LT45XG4gIC8vIDctPjhcbiAgLy8gNi0+N1xuICAvLyAuLi5cbiAgLy8gMS0+MlxuICBteVByb3BlcnR5LmxhenlMaW5rKCAoIHZhbHVlLCBvbGRWYWx1ZSApID0+IHtcbiAgICBjb3VudCsrO1xuICAgIGFzc2VydC5vayggdmFsdWUgPT09IG9sZFZhbHVlICsgMSwgYGluY3JlbWVudCBlYWNoIHRpbWU6ICR7b2xkVmFsdWV9IC0+ICR7dmFsdWV9YCApO1xuICAgIGFzc2VydC5vayggdmFsdWUgPT09IGxhc3RMaXN0ZW5lckNvdW50LS0sIGBpbmNyZW1lbnQgaW4gb3JkZXIgZXhwZWN0ZWQ6ICR7bGFzdExpc3RlbmVyQ291bnR9LT4ke2xhc3RMaXN0ZW5lckNvdW50ICsgMX0sIHJlY2VpdmVkOiAke29sZFZhbHVlfSAtPiAke3ZhbHVlfWAgKTtcbiAgICBhc3NlcnQub2soIG9sZFZhbHVlID09PSBsYXN0TGlzdGVuZXJDb3VudCwgYG5ldyBjb3VudCBpcyAke2xhc3RMaXN0ZW5lckNvdW50fTogdGhlIG9sZFZhbHVlIChtb3N0IHJlY2VudCBmaXJzdCBpbiBzdGFjayBmaXJzdGAgKTtcbiAgfSApO1xuICBteVByb3BlcnR5LnZhbHVlID0gY291bnQ7XG59ICk7XG5cblxuUVVuaXQudGVzdCggJ1RpbnlQcm9wZXJ0eSByZWVudHJhbnQgbGF6eUxpbmtzIChyZWVudHJhbnROb3RpZmljYXRpb25TdHJhdGVneTpxdWV1ZSknLCBhc3NlcnQgPT4ge1xuXG4gIGNvbnN0IG15UHJvcGVydHkgPSBuZXcgVGlueVByb3BlcnR5PG51bWJlcj4oIDAsIG51bGwsIG51bGwsICdxdWV1ZScgKTtcbiAgbGV0IGxpbmtDYWxsZWRDb3VudCA9IDA7XG4gIGxldCByZWVudGVyZWQgPSBmYWxzZTtcbiAgbXlQcm9wZXJ0eS5sYXp5TGluayggdmFsdWUgPT4ge1xuICAgIGlmICggIXJlZW50ZXJlZCApIHtcbiAgICAgIHJlZW50ZXJlZCA9IHRydWU7XG4gICAgICBteVByb3BlcnR5LnZhbHVlID0gdmFsdWUgKyAxO1xuXG4gICAgICBteVByb3BlcnR5LmxpbmsoIG5ld1ZhbHVlID0+IHtcbiAgICAgICAgY29uc29sZS5sb2coIHZhbHVlLCBuZXdWYWx1ZSApO1xuICAgICAgICBhc3NlcnQub2soICsrbGlua0NhbGxlZENvdW50IDw9IDEsICdzaG91bGQgbm90IGJlIGNhbGxlZCBmcm9tIG9yaWdpbmFsIGNoYW5nZSwganVzdCBmcm9tIGxpbmsnICk7XG4gICAgICB9ICk7XG5cbiAgICAgIC8vIFRoaXMgaXMgZ3JlYXQhLiBJdCBpc24ndCBhY3R1YWxseSBsaWtlIGEgcXVldWUsIGJ1dCBob3cgc3RyYW5nZSBpdCB3b3VsZCBiZSB0byBoYXZlIHRoZSBhYm92ZSB2YWx1ZSBjaGFuZ2UgdHJpZ2dlclxuICAgICAgLy8gdGhpcyBsaXN0ZW5lciBiZWNhdXNlIG9mIHRoZSBxdWV1ZSBiYXNlZCByZWVudHJhbnQgbm90aWZpY2F0aW9uIHN0cmF0ZWd5LiBJdCBpcyBiZXR0ZXIgdG8gZ3VhcmQgYWdhaW5zdCB0aGF0IHNvXG4gICAgICAvLyB0aGlzIGlzbid0IGNhbGxlZCBvbiBwcmV2aW91c2x5IGNhbGxlZCB2YWx1ZSBjaGFuZ2VzLlxuICAgICAgbXlQcm9wZXJ0eS5sYXp5TGluayggKCkgPT4geyBhc3NlcnQub2soIGZhbHNlLCAnc2hvdWxkIG5vdCBiZSBjYWxsZWQgZnJvbSBvcmlnaW5hbCBjaGFuZ2UnICk7IH0gKTtcbiAgICB9XG4gIH0gKTtcbiAgbXlQcm9wZXJ0eS52YWx1ZSA9IDE7XG5cbiAgbXlQcm9wZXJ0eS5yZW1vdmVBbGxMaXN0ZW5lcnMoKTtcbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4gIG15UHJvcGVydHkudmFsdWUgPSAtMTtcbiAgbXlQcm9wZXJ0eS5sYXp5TGluayggb3JpZ2luYWxWYWx1ZSA9PiB7XG5cbiAgICBpZiAoIG9yaWdpbmFsVmFsdWUgPCA1ICkge1xuICAgICAgbGV0IGxhenlMaW5rQ2FsbGVkQ291bnQgPSBvcmlnaW5hbFZhbHVlICsgMTtcbiAgICAgIG15UHJvcGVydHkudmFsdWUgPSBvcmlnaW5hbFZhbHVlICsgMTtcbiAgICAgIGFzc2VydC5lcXVhbCggbXlQcm9wZXJ0eS52YWx1ZSwgb3JpZ2luYWxWYWx1ZSArIDEsICd2YWx1ZSBpcyBpbW1lZGlhdGVseSBjb3JyZWN0IGZvciBhY2Nlc3MgKHJlZW50cmFudGx5KScgKTtcbiAgICAgIG15UHJvcGVydHkubGF6eUxpbmsoIG5ld1ZhbHVlID0+IHtcbiAgICAgICAgYXNzZXJ0Lm9rKCBuZXdWYWx1ZSAhPT0gb3JpZ2luYWxWYWx1ZSwgYCR7b3JpZ2luYWxWYWx1ZX06IHNob3VsZCBub3QgYmUgY2FsbGVkIGZyb20gb3JpZ2luYWwgY2hhbmdlYCApO1xuICAgICAgICBhc3NlcnQuZXF1YWwoIG5ld1ZhbHVlLCArK2xhenlMaW5rQ2FsbGVkQ291bnQsIGAke2xhenlMaW5rQ2FsbGVkQ291bnR9OiBzaG91bGQgYmUgY2FsbGVkIGluIG9yZGVyIChsYXp5TGluaylgICk7XG4gICAgICB9ICk7XG4gICAgfVxuICB9ICk7XG4gIG15UHJvcGVydHkudmFsdWUgPSAwO1xufSApOyJdLCJuYW1lcyI6WyJWZWN0b3IyIiwiVGlueVByb3BlcnR5IiwiUVVuaXQiLCJtb2R1bGUiLCJ0ZXN0IiwiYXNzZXJ0IiwicHJvcGVydHkiLCJsaW5rIiwidmFsdWUiLCJjb25zb2xlIiwibG9nIiwib2siLCJNeU9ic2VydmVkT2JqZWN0IiwiaGFzRnVuIiwiaGFkRnVuIiwiaGFzRnVuUHJvcGVydHkiLCJuZXdWYWx1ZSIsIm9sZFZhbHVlIiwieCIsImxhenlMaW5rIiwiY2FsbGVkQ291bnQiLCJteVByb3BlcnR5IiwidmFsdWVDb21wYXJpc29uU3RyYXRlZ3kiLCJzb21ldGhpbmciLCJvdGhlciIsImNvdW50IiwiZmluYWxDb3VudCIsImxhc3RMaXN0ZW5lckNvdW50IiwibGlua0NhbGxlZENvdW50IiwicmVlbnRlcmVkIiwicmVtb3ZlQWxsTGlzdGVuZXJzIiwib3JpZ2luYWxWYWx1ZSIsImxhenlMaW5rQ2FsbGVkQ291bnQiLCJlcXVhbCJdLCJtYXBwaW5ncyI6IkFBQUEsc0RBQXNEO0FBRXREOzs7Ozs7Q0FNQyxHQUVELE9BQU9BLGFBQWEsMEJBQTBCO0FBRTlDLE9BQU9DLGtCQUFrQixv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