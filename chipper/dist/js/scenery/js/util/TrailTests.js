// Copyright 2017-2023, University of Colorado Boulder
/**
 * Trail tests
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */ import Bounds2 from '../../../dot/js/Bounds2.js';
import Vector2 from '../../../dot/js/Vector2.js';
import { Shape } from '../../../kite/js/imports.js';
import { CanvasNode, Color, Display, HStrut, Line, Node, Path, Rectangle, Renderer, Spacer, Text, TextBounds, Trail, TrailPointer, Utils, VStrut, WebGLNode } from '../imports.js';
QUnit.module('Trail');
function equalsApprox(assert, a, b, message) {
    assert.ok(Math.abs(a - b) < 0.0000001, `${(message ? `${message}: ` : '') + a} =? ${b}`);
}
/*
The test tree:
n
  n
    n
    n
      n
    n
    n
      n
        n
      n
    n
  n
  n
 */ function createTestNodeTree() {
    const node = new Node();
    node.addChild(new Node());
    node.addChild(new Node());
    node.addChild(new Node());
    node.children[0].addChild(new Node());
    node.children[0].addChild(new Node());
    node.children[0].addChild(new Node());
    node.children[0].addChild(new Node());
    node.children[0].addChild(new Node());
    node.children[0].children[1].addChild(new Node());
    node.children[0].children[3].addChild(new Node());
    node.children[0].children[3].addChild(new Node());
    node.children[0].children[3].children[0].addChild(new Node());
    return node;
}
QUnit.test('Dirty bounds propagation test', (assert)=>{
    const node = createTestNodeTree();
    node.validateBounds();
    assert.ok(!node._childBoundsDirty);
    node.children[0].children[3].children[0].invalidateBounds();
    assert.ok(node._childBoundsDirty);
});
QUnit.test('Canvas 2D Context and Features', (assert)=>{
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    assert.ok(context, 'context');
    const neededMethods = [
        'arc',
        'arcTo',
        'beginPath',
        'bezierCurveTo',
        'clearRect',
        'clip',
        'closePath',
        'fill',
        'fillRect',
        'fillStyle',
        'isPointInPath',
        'lineTo',
        'moveTo',
        'rect',
        'restore',
        'quadraticCurveTo',
        'save',
        'setTransform',
        'stroke',
        'strokeRect',
        'strokeStyle'
    ];
    _.each(neededMethods, (method)=>{
        assert.ok(context[method] !== undefined, `context.${method}`);
    });
});
QUnit.test('Trail next/previous', (assert)=>{
    const node = createTestNodeTree();
    // walk it forward
    let trail = new Trail([
        node
    ]);
    assert.equal(1, trail.length);
    trail = trail.next();
    assert.equal(2, trail.length);
    trail = trail.next();
    assert.equal(3, trail.length);
    trail = trail.next();
    assert.equal(3, trail.length);
    trail = trail.next();
    assert.equal(4, trail.length);
    trail = trail.next();
    assert.equal(3, trail.length);
    trail = trail.next();
    assert.equal(3, trail.length);
    trail = trail.next();
    assert.equal(4, trail.length);
    trail = trail.next();
    assert.equal(5, trail.length);
    trail = trail.next();
    assert.equal(4, trail.length);
    trail = trail.next();
    assert.equal(3, trail.length);
    trail = trail.next();
    assert.equal(2, trail.length);
    trail = trail.next();
    assert.equal(2, trail.length);
    // make sure walking off the end gives us null
    assert.equal(null, trail.next());
    trail = trail.previous();
    assert.equal(2, trail.length);
    trail = trail.previous();
    assert.equal(3, trail.length);
    trail = trail.previous();
    assert.equal(4, trail.length);
    trail = trail.previous();
    assert.equal(5, trail.length);
    trail = trail.previous();
    assert.equal(4, trail.length);
    trail = trail.previous();
    assert.equal(3, trail.length);
    trail = trail.previous();
    assert.equal(3, trail.length);
    trail = trail.previous();
    assert.equal(4, trail.length);
    trail = trail.previous();
    assert.equal(3, trail.length);
    trail = trail.previous();
    assert.equal(3, trail.length);
    trail = trail.previous();
    assert.equal(2, trail.length);
    trail = trail.previous();
    assert.equal(1, trail.length);
    // make sure walking off the start gives us null
    assert.equal(null, trail.previous());
});
QUnit.test('Trail comparison', (assert)=>{
    const node = createTestNodeTree();
    // get a list of all trails in render order
    const trails = [];
    let currentTrail = new Trail(node); // start at the first node
    while(currentTrail){
        trails.push(currentTrail);
        currentTrail = currentTrail.next();
    }
    assert.equal(13, trails.length, 'Trail for each node');
    for(let i = 0; i < trails.length; i++){
        for(let j = i; j < trails.length; j++){
            const comparison = trails[i].compare(trails[j]);
            // make sure that every trail compares as expected (0 and they are equal, -1 and i < j)
            assert.equal(i === j ? 0 : i < j ? -1 : 1, comparison, `${i},${j}`);
        }
    }
});
QUnit.test('Trail eachTrailBetween', (assert)=>{
    const node = createTestNodeTree();
    // get a list of all trails in render order
    const trails = [];
    let currentTrail = new Trail(node); // start at the first node
    while(currentTrail){
        trails.push(currentTrail);
        currentTrail = currentTrail.next();
    }
    assert.equal(13, trails.length, `Trails: ${_.map(trails, (trail)=>trail.toString()).join('\n')}`);
    for(let i = 0; i < trails.length; i++){
        for(let j = i; j < trails.length; j++){
            const inclusiveList = [];
            Trail.eachTrailBetween(trails[i], trails[j], (trail)=>{
                inclusiveList.push(trail.copy());
            }, false, node);
            const trailString = `${i},${j} ${trails[i].toString()} to ${trails[j].toString()}`;
            assert.ok(inclusiveList[0].equals(trails[i]), `inclusive start on ${trailString} is ${inclusiveList[0].toString()}`);
            assert.ok(inclusiveList[inclusiveList.length - 1].equals(trails[j]), `inclusive end on ${trailString}is ${inclusiveList[inclusiveList.length - 1].toString()}`);
            assert.equal(inclusiveList.length, j - i + 1, `inclusive length on ${trailString} is ${inclusiveList.length}, ${_.map(inclusiveList, (trail)=>trail.toString()).join('\n')}`);
            if (i < j) {
                const exclusiveList = [];
                Trail.eachTrailBetween(trails[i], trails[j], (trail)=>{
                    exclusiveList.push(trail.copy());
                }, true, node);
                assert.equal(exclusiveList.length, j - i - 1, `exclusive length on ${i},${j}`);
            }
        }
    }
});
QUnit.test('depthFirstUntil depthFirstUntil with subtree skipping', (assert)=>{
    const node = createTestNodeTree();
    node.children[0].children[2].visible = false;
    node.children[0].children[3].visible = false;
    new TrailPointer(new Trail(node), true).depthFirstUntil(new TrailPointer(new Trail(node), false), (pointer)=>{
        if (!pointer.trail.lastNode().isVisible()) {
            // should skip
            return true;
        }
        assert.ok(pointer.trail.isVisible(), `Trail visibility for ${pointer.trail.toString()}`);
        return false;
    }, false);
});
QUnit.test('Trail eachTrailUnder with subtree skipping', (assert)=>{
    const node = createTestNodeTree();
    node.children[0].children[2].visible = false;
    node.children[0].children[3].visible = false;
    new Trail(node).eachTrailUnder((trail)=>{
        if (!trail.lastNode().isVisible()) {
            // should skip
            return true;
        }
        assert.ok(trail.isVisible(), `Trail visibility for ${trail.toString()}`);
        return false;
    });
});
QUnit.test('TrailPointer render comparison', (assert)=>{
    const node = createTestNodeTree();
    assert.equal(0, new TrailPointer(node.getUniqueTrail(), true).compareRender(new TrailPointer(node.getUniqueTrail(), true)), 'Same before pointer');
    assert.equal(0, new TrailPointer(node.getUniqueTrail(), false).compareRender(new TrailPointer(node.getUniqueTrail(), false)), 'Same after pointer');
    assert.equal(-1, new TrailPointer(node.getUniqueTrail(), true).compareRender(new TrailPointer(node.getUniqueTrail(), false)), 'Same node before/after root');
    assert.equal(-1, new TrailPointer(node.children[0].getUniqueTrail(), true).compareRender(new TrailPointer(node.children[0].getUniqueTrail(), false)), 'Same node before/after nonroot');
    assert.equal(0, new TrailPointer(node.children[0].children[1].children[0].getUniqueTrail(), false).compareRender(new TrailPointer(node.children[0].children[2].getUniqueTrail(), true)), 'Equivalence of before/after');
    // all pointers in the render order
    const pointers = [
        new TrailPointer(node.getUniqueTrail(), true),
        new TrailPointer(node.getUniqueTrail(), false),
        new TrailPointer(node.children[0].getUniqueTrail(), true),
        new TrailPointer(node.children[0].getUniqueTrail(), false),
        new TrailPointer(node.children[0].children[0].getUniqueTrail(), true),
        new TrailPointer(node.children[0].children[0].getUniqueTrail(), false),
        new TrailPointer(node.children[0].children[1].getUniqueTrail(), true),
        new TrailPointer(node.children[0].children[1].getUniqueTrail(), false),
        new TrailPointer(node.children[0].children[1].children[0].getUniqueTrail(), true),
        new TrailPointer(node.children[0].children[1].children[0].getUniqueTrail(), false),
        new TrailPointer(node.children[0].children[2].getUniqueTrail(), true),
        new TrailPointer(node.children[0].children[2].getUniqueTrail(), false),
        new TrailPointer(node.children[0].children[3].getUniqueTrail(), true),
        new TrailPointer(node.children[0].children[3].getUniqueTrail(), false),
        new TrailPointer(node.children[0].children[3].children[0].getUniqueTrail(), true),
        new TrailPointer(node.children[0].children[3].children[0].getUniqueTrail(), false),
        new TrailPointer(node.children[0].children[3].children[0].children[0].getUniqueTrail(), true),
        new TrailPointer(node.children[0].children[3].children[0].children[0].getUniqueTrail(), false),
        new TrailPointer(node.children[0].children[3].children[1].getUniqueTrail(), true),
        new TrailPointer(node.children[0].children[3].children[1].getUniqueTrail(), false),
        new TrailPointer(node.children[0].children[4].getUniqueTrail(), true),
        new TrailPointer(node.children[0].children[4].getUniqueTrail(), false),
        new TrailPointer(node.children[1].getUniqueTrail(), true),
        new TrailPointer(node.children[1].getUniqueTrail(), false),
        new TrailPointer(node.children[2].getUniqueTrail(), true),
        new TrailPointer(node.children[2].getUniqueTrail(), false)
    ];
    // compare the pointers. different ones can be equal if they represent the same place, so we only check if they compare differently
    for(let i = 0; i < pointers.length; i++){
        for(let j = i; j < pointers.length; j++){
            const comparison = pointers[i].compareRender(pointers[j]);
            if (comparison === -1) {
                assert.ok(i < j, `${i},${j}`);
            }
            if (comparison === 1) {
                assert.ok(i > j, `${i},${j}`);
            }
        }
    }
});
QUnit.test('TrailPointer nested comparison and fowards/backwards', (assert)=>{
    const node = createTestNodeTree();
    // all pointers in the nested order
    const pointers = [
        new TrailPointer(node.getUniqueTrail(), true),
        new TrailPointer(node.children[0].getUniqueTrail(), true),
        new TrailPointer(node.children[0].children[0].getUniqueTrail(), true),
        new TrailPointer(node.children[0].children[0].getUniqueTrail(), false),
        new TrailPointer(node.children[0].children[1].getUniqueTrail(), true),
        new TrailPointer(node.children[0].children[1].children[0].getUniqueTrail(), true),
        new TrailPointer(node.children[0].children[1].children[0].getUniqueTrail(), false),
        new TrailPointer(node.children[0].children[1].getUniqueTrail(), false),
        new TrailPointer(node.children[0].children[2].getUniqueTrail(), true),
        new TrailPointer(node.children[0].children[2].getUniqueTrail(), false),
        new TrailPointer(node.children[0].children[3].getUniqueTrail(), true),
        new TrailPointer(node.children[0].children[3].children[0].getUniqueTrail(), true),
        new TrailPointer(node.children[0].children[3].children[0].children[0].getUniqueTrail(), true),
        new TrailPointer(node.children[0].children[3].children[0].children[0].getUniqueTrail(), false),
        new TrailPointer(node.children[0].children[3].children[0].getUniqueTrail(), false),
        new TrailPointer(node.children[0].children[3].children[1].getUniqueTrail(), true),
        new TrailPointer(node.children[0].children[3].children[1].getUniqueTrail(), false),
        new TrailPointer(node.children[0].children[3].getUniqueTrail(), false),
        new TrailPointer(node.children[0].children[4].getUniqueTrail(), true),
        new TrailPointer(node.children[0].children[4].getUniqueTrail(), false),
        new TrailPointer(node.children[0].getUniqueTrail(), false),
        new TrailPointer(node.children[1].getUniqueTrail(), true),
        new TrailPointer(node.children[1].getUniqueTrail(), false),
        new TrailPointer(node.children[2].getUniqueTrail(), true),
        new TrailPointer(node.children[2].getUniqueTrail(), false),
        new TrailPointer(node.getUniqueTrail(), false)
    ];
    // exhaustively verify the ordering between each ordered pair
    for(let i = 0; i < pointers.length; i++){
        for(let j = i; j < pointers.length; j++){
            const comparison = pointers[i].compareNested(pointers[j]);
            // make sure that every pointer compares as expected (0 and they are equal, -1 and i < j)
            assert.equal(comparison, i === j ? 0 : i < j ? -1 : 1, `compareNested: ${i},${j}`);
        }
    }
    // verify forwards and backwards, as well as copy constructors
    for(let i = 1; i < pointers.length; i++){
        const a = pointers[i - 1];
        const b = pointers[i];
        const forwardsCopy = a.copy();
        forwardsCopy.nestedForwards();
        assert.equal(forwardsCopy.compareNested(b), 0, `forwardsPointerCheck ${i - 1} to ${i}`);
        const backwardsCopy = b.copy();
        backwardsCopy.nestedBackwards();
        assert.equal(backwardsCopy.compareNested(a), 0, `backwardsPointerCheck ${i} to ${i - 1}`);
    }
    // exhaustively check depthFirstUntil inclusive
    for(let i = 0; i < pointers.length; i++){
        for(let j = i + 1; j < pointers.length; j++){
            // i < j guaranteed
            const contents = [];
            pointers[i].depthFirstUntil(pointers[j], (pointer)=>{
                contents.push(pointer.copy());
            }, false);
            assert.equal(contents.length, j - i + 1, `depthFirstUntil inclusive ${i},${j} count check`);
            // do an actual pointer to pointer comparison
            let isOk = true;
            for(let k = 0; k < contents.length; k++){
                const comparison = contents[k].compareNested(pointers[i + k]);
                if (comparison !== 0) {
                    assert.equal(comparison, 0, `depthFirstUntil inclusive ${i},${j},${k} comparison check ${contents[k].trail.indices.join()} - ${pointers[i + k].trail.indices.join()}`);
                    isOk = false;
                }
            }
            assert.ok(isOk, `depthFirstUntil inclusive ${i},${j} comparison check`);
        }
    }
    // exhaustively check depthFirstUntil exclusive
    for(let i = 0; i < pointers.length; i++){
        for(let j = i + 1; j < pointers.length; j++){
            // i < j guaranteed
            const contents = [];
            pointers[i].depthFirstUntil(pointers[j], (pointer)=>{
                contents.push(pointer.copy());
            }, true);
            assert.equal(contents.length, j - i - 1, `depthFirstUntil exclusive ${i},${j} count check`);
            // do an actual pointer to pointer comparison
            let isOk = true;
            for(let k = 0; k < contents.length; k++){
                const comparison = contents[k].compareNested(pointers[i + k + 1]);
                if (comparison !== 0) {
                    assert.equal(comparison, 0, `depthFirstUntil exclusive ${i},${j},${k} comparison check ${contents[k].trail.indices.join()} - ${pointers[i + k].trail.indices.join()}`);
                    isOk = false;
                }
            }
            assert.ok(isOk, `depthFirstUntil exclusive ${i},${j} comparison check`);
        }
    }
});
// QUnit.test( 'TrailInterval', function(assert) {
//   let node = createTestNodeTree();
//   let i, j;
//   // a subset of trails to test on
//   let trails = [
//     null,
//     node.children[0].getUniqueTrail(),
//     node.children[0].children[1].getUniqueTrail(), // commented out since it quickly creates many tests to include
//     node.children[0].children[3].children[0].getUniqueTrail(),
//     node.children[1].getUniqueTrail(),
//     null
//   ];
//   // get a list of all trails
//   let allTrails = [];
//   let t = node.getUniqueTrail();
//   while ( t ) {
//     allTrails.push( t );
//     t = t.next();
//   }
//   // get a list of all intervals using our 'trails' array
//   let intervals = [];
//   for ( i = 0; i < trails.length; i++ ) {
//     // only create proper intervals where i < j, since we specified them in order
//     for ( j = i + 1; j < trails.length; j++ ) {
//       let interval = new TrailInterval( trails[i], trails[j] );
//       intervals.push( interval );
//       // tag the interval, so we can do additional verification later
//       interval.i = i;
//       interval.j = j;
//     }
//   }
//   // check every combination of intervals
//   for ( i = 0; i < intervals.length; i++ ) {
//     let a = intervals[i];
//     for ( j = 0; j < intervals.length; j++ ) {
//       let b = intervals[j];
//       let union = a.union( b );
//       if ( a.exclusiveUnionable( b ) ) {
//         _.each( allTrails, function( trail ) {
//           if ( trail ) {
//             let msg = 'union check of trail ' + trail.toString() + ' with ' + a.toString() + ' and ' + b.toString() + ' with union ' + union.toString();
//            assert.equal( a.exclusiveContains( trail ) || b.exclusiveContains( trail ), union.exclusiveContains( trail ), msg );
//           }
//         } );
//       } else {
//         let wouldBeBadUnion = false;
//         let containsAnything = false;
//         _.each( allTrails, function( trail ) {
//           if ( trail ) {
//             if ( union.exclusiveContains( trail ) ) {
//               containsAnything = true;
//               if ( !a.exclusiveContains( trail ) && !b.exclusiveContains( trail ) ) {
//                 wouldBeBadUnion = true;
//               }
//             }
//           }
//         } );
//         assert.ok( containsAnything && wouldBeBadUnion, 'Not a bad union?: ' + a.toString() + ' and ' + b.toString() + ' with union ' + union.toString() );
//       }
//     }
//   }
// } );
QUnit.test('Text width measurement in canvas', (assert)=>{
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    const metrics = context.measureText('Hello World');
    assert.ok(metrics.width, 'metrics.width');
});
QUnit.test('Sceneless node handling', (assert)=>{
    const a = new Path(null);
    const b = new Path(null);
    const c = new Path(null);
    a.setShape(Shape.rectangle(0, 0, 20, 20));
    c.setShape(Shape.rectangle(10, 10, 30, 30));
    a.addChild(b);
    b.addChild(c);
    a.validateBounds();
    a.removeChild(b);
    c.addChild(a);
    b.validateBounds();
    assert.ok(true, 'so we have at least 1 test in this set');
});
QUnit.test('Correct bounds on rectangle', (assert)=>{
    const rectBounds = Utils.canvasAccurateBounds((context)=>{
        context.fillRect(100, 100, 200, 200);
    });
    assert.ok(Math.abs(rectBounds.minX - 100) < 0.01, rectBounds.minX);
    assert.ok(Math.abs(rectBounds.minY - 100) < 0.01, rectBounds.minY);
    assert.ok(Math.abs(rectBounds.maxX - 300) < 0.01, rectBounds.maxX);
    assert.ok(Math.abs(rectBounds.maxY - 300) < 0.01, rectBounds.maxY);
});
QUnit.test('Consistent and precise bounds range on Text', (assert)=>{
    const textBounds = Utils.canvasAccurateBounds((context)=>{
        context.fillText('test string', 0, 0);
    });
    assert.ok(textBounds.isConsistent, textBounds.toString());
    // precision of 0.001 (or lower given different parameters) is possible on non-Chome browsers (Firefox, IE9, Opera)
    assert.ok(textBounds.precision < 0.15, `precision: ${textBounds.precision}`);
});
QUnit.test('Consistent and precise bounds range on Text', (assert)=>{
    const text = new Text('0\u0489');
    const textBounds = TextBounds.accurateCanvasBoundsFallback(text);
    assert.ok(textBounds.isConsistent, textBounds.toString());
    // precision of 0.001 (or lower given different parameters) is possible on non-Chome browsers (Firefox, IE9, Opera)
    assert.ok(textBounds.precision < 1, `precision: ${textBounds.precision}`);
});
QUnit.test('ES5 Setter / Getter tests', (assert)=>{
    const node = new Path(null);
    const fill = '#abcdef';
    node.fill = fill;
    assert.equal(node.fill, fill);
    assert.equal(node.getFill(), fill);
    const otherNode = new Path(Shape.rectangle(0, 0, 10, 10), {
        fill: fill
    });
    assert.equal(otherNode.fill, fill);
});
QUnit.test('Piccolo-like behavior', (assert)=>{
    const node = new Node();
    node.scale(2);
    node.translate(1, 3);
    node.rotate(Math.PI / 2);
    node.translate(-31, 21);
    equalsApprox(assert, node.getMatrix().m00(), 0);
    equalsApprox(assert, node.getMatrix().m01(), -2);
    equalsApprox(assert, node.getMatrix().m02(), -40);
    equalsApprox(assert, node.getMatrix().m10(), 2);
    equalsApprox(assert, node.getMatrix().m11(), 0);
    equalsApprox(assert, node.getMatrix().m12(), -56);
    equalsApprox(assert, node.x, -40);
    equalsApprox(assert, node.y, -56);
    equalsApprox(assert, node.rotation, Math.PI / 2);
    node.translation = new Vector2(-5, 7);
    equalsApprox(assert, node.getMatrix().m02(), -5);
    equalsApprox(assert, node.getMatrix().m12(), 7);
    node.rotation = 1.2;
    equalsApprox(assert, node.getMatrix().m01(), -1.864078171934453);
    node.rotation = -0.7;
    equalsApprox(assert, node.getMatrix().m10(), -1.288435374475382);
});
QUnit.test('Setting left/right of node', (assert)=>{
    const node = new Path(Shape.rectangle(-20, -20, 50, 50), {
        scale: 2
    });
    equalsApprox(assert, node.left, -40);
    equalsApprox(assert, node.right, 60);
    node.left = 10;
    equalsApprox(assert, node.left, 10);
    equalsApprox(assert, node.right, 110);
    node.right = 10;
    equalsApprox(assert, node.left, -90);
    equalsApprox(assert, node.right, 10);
    node.centerX = 5;
    equalsApprox(assert, node.centerX, 5);
    equalsApprox(assert, node.left, -45);
    equalsApprox(assert, node.right, 55);
});
QUnit.test('Path with empty shape', (assert)=>{
    const scene = new Node();
    const node = new Path(new Shape());
    scene.addChild(node);
    assert.ok(true, 'so we have at least 1 test in this set');
});
QUnit.test('Path with null shape', (assert)=>{
    const scene = new Node();
    const node = new Path(null);
    scene.addChild(node);
    assert.ok(true, 'so we have at least 1 test in this set');
});
QUnit.test('Display resize event', (assert)=>{
    const scene = new Node();
    const display = new Display(scene);
    let width;
    let height;
    let count = 0;
    display.sizeProperty.lazyLink((size)=>{
        width = size.width;
        height = size.height;
        count++;
    });
    display.setWidthHeight(712, 217);
    assert.equal(width, 712, 'Scene resize width');
    assert.equal(height, 217, 'Scene resize height');
    assert.equal(count, 1, 'Scene resize count');
});
QUnit.test('Bounds events', (assert)=>{
    const node = new Node();
    node.y = 10;
    const rect = new Rectangle(0, 0, 100, 50, {
        fill: '#f00'
    });
    rect.x = 10; // a transform, so we can verify everything is handled correctly
    node.addChild(rect);
    node.validateBounds();
    const epsilon = 0.0000001;
    node.childBoundsProperty.lazyLink(()=>{
        assert.ok(node.childBounds.equalsEpsilon(new Bounds2(10, 0, 110, 30), epsilon), `Parent child bounds check: ${node.childBounds.toString()}`);
    });
    node.boundsProperty.lazyLink(()=>{
        assert.ok(node.bounds.equalsEpsilon(new Bounds2(10, 10, 110, 40), epsilon), `Parent bounds check: ${node.bounds.toString()}`);
    });
    node.selfBoundsProperty.lazyLink(()=>{
        assert.ok(false, 'Self bounds should not change for parent node');
    });
    rect.selfBoundsProperty.lazyLink(()=>{
        assert.ok(rect.selfBounds.equalsEpsilon(new Bounds2(0, 0, 100, 30), epsilon), `Self bounds check: ${rect.selfBounds.toString()}`);
    });
    rect.boundsProperty.lazyLink(()=>{
        assert.ok(rect.bounds.equalsEpsilon(new Bounds2(10, 0, 110, 30), epsilon), `Bounds check: ${rect.bounds.toString()}`);
    });
    rect.childBoundsProperty.lazyLink(()=>{
        assert.ok(false, 'Child bounds should not change for leaf node');
    });
    rect.rectHeight = 30;
    node.validateBounds();
});
QUnit.test('Using a color instance', (assert)=>{
    const scene = new Node();
    const rect = new Rectangle(0, 0, 100, 50);
    assert.ok(rect.fill === null, 'Always starts with a null fill');
    scene.addChild(rect);
    const color = new Color(255, 0, 0);
    rect.fill = color;
    color.setRGBA(0, 255, 0, 1);
});
QUnit.test('Bounds and Visible Bounds', (assert)=>{
    const node = new Node();
    const rect = new Rectangle(0, 0, 100, 50);
    node.addChild(rect);
    assert.ok(node.visibleBounds.equals(new Bounds2(0, 0, 100, 50)), 'Visible Bounds Visible');
    assert.ok(node.bounds.equals(new Bounds2(0, 0, 100, 50)), 'Complete Bounds Visible');
    rect.visible = false;
    assert.ok(node.visibleBounds.equals(Bounds2.NOTHING), 'Visible Bounds Invisible');
    assert.ok(node.bounds.equals(new Bounds2(0, 0, 100, 50)), 'Complete Bounds Invisible');
});
QUnit.test('localBounds override', (assert)=>{
    const node = new Node({
        y: 5
    });
    const rect = new Rectangle(0, 0, 100, 50);
    node.addChild(rect);
    rect.localBounds = new Bounds2(0, 0, 50, 50);
    assert.ok(node.localBounds.equals(new Bounds2(0, 0, 50, 50)), 'localBounds override on self');
    assert.ok(node.bounds.equals(new Bounds2(0, 5, 50, 55)), 'localBounds override on self');
    rect.localBounds = new Bounds2(0, 0, 50, 100);
    assert.ok(node.bounds.equals(new Bounds2(0, 5, 50, 105)), 'localBounds override 2nd on self');
    // reset local bounds (have them computed again)
    rect.localBounds = null;
    assert.ok(node.bounds.equals(new Bounds2(0, 5, 100, 55)), 'localBounds override reset on self');
    node.localBounds = new Bounds2(0, 0, 50, 200);
    assert.ok(node.localBounds.equals(new Bounds2(0, 0, 50, 200)), 'localBounds override on parent');
    assert.ok(node.bounds.equals(new Bounds2(0, 5, 50, 205)), 'localBounds override on parent');
});
function compareTrailArrays(a, b) {
    // defensive copies
    a = a.slice();
    b = b.slice();
    for(let i = 0; i < a.length; i++){
        // for each A, remove the first matching one in B
        for(let j = 0; j < b.length; j++){
            if (a[i].equals(b[j])) {
                b.splice(j, 1);
                break;
            }
        }
    }
    // now B should be empty
    return b.length === 0;
}
QUnit.test('getTrails/getUniqueTrail', (assert)=>{
    const a = new Node();
    const b = new Node();
    const c = new Node();
    const d = new Node();
    const e = new Node();
    // DAG-like structure
    a.addChild(b);
    a.addChild(c);
    b.addChild(d);
    c.addChild(d);
    c.addChild(e);
    // getUniqueTrail()
    window.assert && assert.throws(()=>{
        d.getUniqueTrail();
    }, 'D has no unique trail, since there are two');
    assert.ok(a.getUniqueTrail().equals(new Trail([
        a
    ])), 'a.getUniqueTrail()');
    assert.ok(b.getUniqueTrail().equals(new Trail([
        a,
        b
    ])), 'b.getUniqueTrail()');
    assert.ok(c.getUniqueTrail().equals(new Trail([
        a,
        c
    ])), 'c.getUniqueTrail()');
    assert.ok(e.getUniqueTrail().equals(new Trail([
        a,
        c,
        e
    ])), 'e.getUniqueTrail()');
    // getTrails()
    let trails;
    trails = a.getTrails();
    assert.ok(trails.length === 1 && trails[0].equals(new Trail([
        a
    ])), 'a.getTrails()');
    trails = b.getTrails();
    assert.ok(trails.length === 1 && trails[0].equals(new Trail([
        a,
        b
    ])), 'b.getTrails()');
    trails = c.getTrails();
    assert.ok(trails.length === 1 && trails[0].equals(new Trail([
        a,
        c
    ])), 'c.getTrails()');
    trails = d.getTrails();
    assert.ok(trails.length === 2 && compareTrailArrays(trails, [
        new Trail([
            a,
            b,
            d
        ]),
        new Trail([
            a,
            c,
            d
        ])
    ]), 'd.getTrails()');
    trails = e.getTrails();
    assert.ok(trails.length === 1 && trails[0].equals(new Trail([
        a,
        c,
        e
    ])), 'e.getTrails()');
    // getUniqueTrail( predicate )
    window.assert && assert.throws(()=>{
        e.getUniqueTrail((node)=>false);
    }, 'Fails on false predicate');
    window.assert && assert.throws(()=>{
        e.getUniqueTrail((node)=>false);
    }, 'Fails on false predicate');
    assert.ok(e.getUniqueTrail((node)=>node === a).equals(new Trail([
        a,
        c,
        e
    ])));
    assert.ok(e.getUniqueTrail((node)=>node === c).equals(new Trail([
        c,
        e
    ])));
    assert.ok(e.getUniqueTrail((node)=>node === e).equals(new Trail([
        e
    ])));
    assert.ok(d.getUniqueTrail((node)=>node === b).equals(new Trail([
        b,
        d
    ])));
    assert.ok(d.getUniqueTrail((node)=>node === c).equals(new Trail([
        c,
        d
    ])));
    assert.ok(d.getUniqueTrail((node)=>node === d).equals(new Trail([
        d
    ])));
    // getTrails( predicate )
    trails = d.getTrails((node)=>false);
    assert.ok(trails.length === 0);
    trails = d.getTrails((node)=>true);
    assert.ok(compareTrailArrays(trails, [
        new Trail([
            a,
            b,
            d
        ]),
        new Trail([
            b,
            d
        ]),
        new Trail([
            a,
            c,
            d
        ]),
        new Trail([
            c,
            d
        ]),
        new Trail([
            d
        ])
    ]));
    trails = d.getTrails((node)=>node === a);
    assert.ok(compareTrailArrays(trails, [
        new Trail([
            a,
            b,
            d
        ]),
        new Trail([
            a,
            c,
            d
        ])
    ]));
    trails = d.getTrails((node)=>node === b);
    assert.ok(compareTrailArrays(trails, [
        new Trail([
            b,
            d
        ])
    ]));
    trails = d.getTrails((node)=>node.parents.length === 1);
    assert.ok(compareTrailArrays(trails, [
        new Trail([
            b,
            d
        ]),
        new Trail([
            c,
            d
        ])
    ]));
});
QUnit.test('getLeafTrails', (assert)=>{
    const a = new Node();
    const b = new Node();
    const c = new Node();
    const d = new Node();
    const e = new Node();
    // DAG-like structure
    a.addChild(b);
    a.addChild(c);
    b.addChild(d);
    c.addChild(d);
    c.addChild(e);
    // getUniqueLeafTrail()
    window.assert && assert.throws(()=>{
        a.getUniqueLeafTrail();
    }, 'A has no unique leaf trail, since there are three');
    assert.ok(b.getUniqueLeafTrail().equals(new Trail([
        b,
        d
    ])), 'a.getUniqueLeafTrail()');
    assert.ok(d.getUniqueLeafTrail().equals(new Trail([
        d
    ])), 'b.getUniqueLeafTrail()');
    assert.ok(e.getUniqueLeafTrail().equals(new Trail([
        e
    ])), 'c.getUniqueLeafTrail()');
    // getLeafTrails()
    let trails;
    trails = a.getLeafTrails();
    assert.ok(trails.length === 3 && compareTrailArrays(trails, [
        new Trail([
            a,
            b,
            d
        ]),
        new Trail([
            a,
            c,
            d
        ]),
        new Trail([
            a,
            c,
            e
        ])
    ]), 'a.getLeafTrails()');
    trails = b.getLeafTrails();
    assert.ok(trails.length === 1 && trails[0].equals(new Trail([
        b,
        d
    ])), 'b.getLeafTrails()');
    trails = c.getLeafTrails();
    assert.ok(trails.length === 2 && compareTrailArrays(trails, [
        new Trail([
            c,
            d
        ]),
        new Trail([
            c,
            e
        ])
    ]), 'c.getLeafTrails()');
    trails = d.getLeafTrails();
    assert.ok(trails.length === 1 && trails[0].equals(new Trail([
        d
    ])), 'd.getLeafTrails()');
    trails = e.getLeafTrails();
    assert.ok(trails.length === 1 && trails[0].equals(new Trail([
        e
    ])), 'e.getLeafTrails()');
    // getUniqueLeafTrail( predicate )
    window.assert && assert.throws(()=>{
        e.getUniqueLeafTrail((node)=>false);
    }, 'Fails on false predicate');
    window.assert && assert.throws(()=>{
        a.getUniqueLeafTrail((node)=>true);
    }, 'Fails on multiples');
    assert.ok(a.getUniqueLeafTrail((node)=>node === e).equals(new Trail([
        a,
        c,
        e
    ])));
    // getLeafTrails( predicate )
    trails = a.getLeafTrails((node)=>false);
    assert.ok(trails.length === 0);
    trails = a.getLeafTrails((node)=>true);
    assert.ok(compareTrailArrays(trails, [
        new Trail([
            a
        ]),
        new Trail([
            a,
            b
        ]),
        new Trail([
            a,
            b,
            d
        ]),
        new Trail([
            a,
            c
        ]),
        new Trail([
            a,
            c,
            d
        ]),
        new Trail([
            a,
            c,
            e
        ])
    ]));
    // getLeafTrailsTo( node )
    trails = a.getLeafTrailsTo(d);
    assert.ok(compareTrailArrays(trails, [
        new Trail([
            a,
            b,
            d
        ]),
        new Trail([
            a,
            c,
            d
        ])
    ]));
});
QUnit.test('Line stroked bounds', (assert)=>{
    const line = new Line(0, 0, 50, 0, {
        stroke: 'red',
        lineWidth: 5
    });
    const positions = [
        {
            x1: 50,
            y1: 0,
            x2: 0,
            y2: 0
        },
        {
            x1: 0,
            y1: 50,
            x2: 0,
            y2: 0
        },
        {
            x1: 0,
            y1: 0,
            x2: 50,
            y2: 0
        },
        {
            x1: 0,
            y1: 0,
            x2: 0,
            y2: 50
        },
        {
            x1: 50,
            y1: 10,
            x2: 0,
            y2: 0
        },
        {
            x1: 10,
            y1: 50,
            x2: 0,
            y2: 0
        },
        {
            x1: 0,
            y1: 0,
            x2: 50,
            y2: 10
        },
        {
            x1: 0,
            y1: 0,
            x2: 10,
            y2: 50
        },
        {
            x1: 50,
            y1: -10,
            x2: 0,
            y2: 0
        },
        {
            x1: -10,
            y1: 50,
            x2: 0,
            y2: 0
        },
        {
            x1: 0,
            y1: 0,
            x2: 50,
            y2: -10
        },
        {
            x1: 0,
            y1: 0,
            x2: -10,
            y2: 50
        },
        {
            x1: 50,
            y1: 0,
            x2: 0,
            y2: 10
        },
        {
            x1: 0,
            y1: 50,
            x2: 10,
            y2: 0
        },
        {
            x1: 0,
            y1: 10,
            x2: 50,
            y2: 0
        },
        {
            x1: 10,
            y1: 0,
            x2: 0,
            y2: 50
        },
        {
            x1: 50,
            y1: 0,
            x2: 0,
            y2: -10
        },
        {
            x1: 0,
            y1: 50,
            x2: -10,
            y2: 0
        },
        {
            x1: 0,
            y1: -10,
            x2: 50,
            y2: 0
        },
        {
            x1: -10,
            y1: 0,
            x2: 0,
            y2: 50
        }
    ];
    const caps = [
        'round',
        'butt',
        'square'
    ];
    _.each(positions, (position)=>{
        line.mutate(position);
        // line.setLine( position.x1, position.y1, position.x2, position.y2 );
        _.each(caps, (cap)=>{
            line.lineCap = cap;
            assert.ok(line.bounds.equalsEpsilon(line.getShape().getStrokedShape(line.getLineStyles()).bounds, 0.0001), `Line stroked bounds with ${JSON.stringify(position)} and ${cap} ${line.bounds.toString()}`);
        });
    });
});
QUnit.test('maxWidth/maxHeight for Node', (assert)=>{
    const rect = new Rectangle(0, 0, 100, 50, {
        fill: 'red'
    });
    const node = new Node({
        children: [
            rect
        ]
    });
    assert.ok(node.bounds.equals(new Bounds2(0, 0, 100, 50)), 'Initial bounds');
    node.maxWidth = 50;
    assert.ok(node.bounds.equals(new Bounds2(0, 0, 50, 25)), 'Halved transform after max width of half');
    node.maxWidth = 120;
    assert.ok(node.bounds.equals(new Bounds2(0, 0, 100, 50)), 'Back to normal after a big max width');
    node.scale(2);
    assert.ok(node.bounds.equals(new Bounds2(0, 0, 200, 100)), 'Scale up should be unaffected');
    node.maxWidth = 25;
    assert.ok(node.bounds.equals(new Bounds2(0, 0, 50, 25)), 'Scaled back down with both applied');
    node.maxWidth = null;
    assert.ok(node.bounds.equals(new Bounds2(0, 0, 200, 100)), 'Without maxWidth');
    node.scale(0.5);
    assert.ok(node.bounds.equals(new Bounds2(0, 0, 100, 50)), 'Back to normal');
    node.left = 50;
    assert.ok(node.bounds.equals(new Bounds2(50, 0, 150, 50)), 'After a translation');
    node.maxWidth = 50;
    assert.ok(node.bounds.equals(new Bounds2(50, 0, 100, 25)), 'maxWidth being applied after a translation, in local frame');
    rect.rectWidth = 200;
    assert.ok(node.bounds.equals(new Bounds2(50, 0, 100, 12.5)), 'Now with a bigger rectangle');
    rect.rectWidth = 100;
    node.maxWidth = null;
    assert.ok(node.bounds.equals(new Bounds2(50, 0, 150, 50)), 'Back to a translation');
    rect.maxWidth = 50;
    assert.ok(node.bounds.equals(new Bounds2(50, 0, 100, 25)), 'After maxWidth A');
    rect.maxHeight = 12.5;
    assert.ok(node.bounds.equals(new Bounds2(50, 0, 75, 12.5)), 'After maxHeight A');
});
QUnit.test('Spacers', (assert)=>{
    const spacer = new Spacer(100, 50, {
        x: 50
    });
    assert.ok(spacer.bounds.equals(new Bounds2(50, 0, 150, 50)), 'Spacer bounds with translation');
    const hstrut = new HStrut(100, {
        y: 50
    });
    assert.ok(hstrut.bounds.equals(new Bounds2(0, 50, 100, 50)), 'HStrut bounds with translation');
    const vstrut = new VStrut(100, {
        x: 50
    });
    assert.ok(vstrut.bounds.equals(new Bounds2(50, 0, 50, 100)), 'VStrut bounds with translation');
    assert.throws(()=>{
        spacer.addChild(new Node());
    }, 'No way to add children to Spacer');
    assert.throws(()=>{
        hstrut.addChild(new Node());
    }, 'No way to add children to HStrut');
    assert.throws(()=>{
        vstrut.addChild(new Node());
    }, 'No way to add children to VStrut');
});
QUnit.test('Renderer Summary', (assert)=>{
    const canvasNode = new CanvasNode({
        canvasBounds: new Bounds2(0, 0, 10, 10)
    });
    const webglNode = new WebGLNode(()=>{}, {
        canvasBounds: new Bounds2(0, 0, 10, 10)
    });
    const rect = new Rectangle(0, 0, 100, 50);
    const node = new Node({
        children: [
            canvasNode,
            webglNode,
            rect
        ]
    });
    const emptyNode = new Node();
    assert.ok(canvasNode._rendererSummary.isSubtreeFullyCompatible(Renderer.bitmaskCanvas), 'CanvasNode fully compatible: Canvas');
    assert.ok(!canvasNode._rendererSummary.isSubtreeFullyCompatible(Renderer.bitmaskSVG), 'CanvasNode not fully compatible: SVG');
    assert.ok(canvasNode._rendererSummary.isSubtreeContainingCompatible(Renderer.bitmaskCanvas), 'CanvasNode partially compatible: Canvas');
    assert.ok(!canvasNode._rendererSummary.isSubtreeContainingCompatible(Renderer.bitmaskSVG), 'CanvasNode not partially compatible: SVG');
    assert.ok(canvasNode._rendererSummary.isSingleCanvasSupported(), 'CanvasNode supports single Canvas');
    assert.ok(!canvasNode._rendererSummary.isSingleSVGSupported(), 'CanvasNode does not support single SVG');
    assert.ok(!canvasNode._rendererSummary.isNotPainted(), 'CanvasNode is painted');
    assert.ok(canvasNode._rendererSummary.areBoundsValid(), 'CanvasNode has valid bounds');
    assert.ok(webglNode._rendererSummary.isSubtreeFullyCompatible(Renderer.bitmaskWebGL), 'WebGLNode fully compatible: WebGL');
    assert.ok(!webglNode._rendererSummary.isSubtreeFullyCompatible(Renderer.bitmaskSVG), 'WebGLNode not fully compatible: SVG');
    assert.ok(webglNode._rendererSummary.isSubtreeContainingCompatible(Renderer.bitmaskWebGL), 'WebGLNode partially compatible: WebGL');
    assert.ok(!webglNode._rendererSummary.isSubtreeContainingCompatible(Renderer.bitmaskSVG), 'WebGLNode not partially compatible: SVG');
    assert.ok(!webglNode._rendererSummary.isSingleCanvasSupported(), 'WebGLNode does not support single Canvas');
    assert.ok(!webglNode._rendererSummary.isSingleSVGSupported(), 'WebGLNode does not support single SVG');
    assert.ok(!webglNode._rendererSummary.isNotPainted(), 'WebGLNode is painted');
    assert.ok(webglNode._rendererSummary.areBoundsValid(), 'WebGLNode has valid bounds');
    assert.ok(rect._rendererSummary.isSubtreeFullyCompatible(Renderer.bitmaskCanvas), 'Rectangle fully compatible: Canvas');
    assert.ok(rect._rendererSummary.isSubtreeFullyCompatible(Renderer.bitmaskSVG), 'Rectangle fully compatible: SVG');
    assert.ok(rect._rendererSummary.isSubtreeContainingCompatible(Renderer.bitmaskCanvas), 'Rectangle partially compatible: Canvas');
    assert.ok(rect._rendererSummary.isSubtreeContainingCompatible(Renderer.bitmaskSVG), 'Rectangle partially compatible: SVG');
    assert.ok(rect._rendererSummary.isSingleCanvasSupported(), 'Rectangle does support single Canvas');
    assert.ok(rect._rendererSummary.isSingleSVGSupported(), 'Rectangle does support single SVG');
    assert.ok(!rect._rendererSummary.isNotPainted(), 'Rectangle is painted');
    assert.ok(rect._rendererSummary.areBoundsValid(), 'Rectangle has valid bounds');
    assert.ok(!node._rendererSummary.isSubtreeFullyCompatible(Renderer.bitmaskCanvas), 'Container node fully compatible: Canvas');
    assert.ok(!node._rendererSummary.isSubtreeFullyCompatible(Renderer.bitmaskSVG), 'Container node not fully compatible: SVG');
    assert.ok(node._rendererSummary.isSubtreeContainingCompatible(Renderer.bitmaskCanvas), 'Container node partially compatible: Canvas');
    assert.ok(node._rendererSummary.isSubtreeContainingCompatible(Renderer.bitmaskSVG), 'Container node partially compatible: SVG');
    assert.ok(!node._rendererSummary.isSingleCanvasSupported(), 'Container node does not support single Canvas');
    assert.ok(!node._rendererSummary.isSingleSVGSupported(), 'Container node does not support single SVG');
    assert.ok(!node._rendererSummary.isNotPainted(), 'Container node is painted');
    assert.ok(node._rendererSummary.areBoundsValid(), 'Container node has valid bounds');
    assert.ok(emptyNode._rendererSummary.isSubtreeFullyCompatible(Renderer.bitmaskCanvas), 'Empty node fully compatible: Canvas');
    assert.ok(emptyNode._rendererSummary.isSubtreeFullyCompatible(Renderer.bitmaskSVG), 'Empty node fully compatible: SVG');
    assert.ok(!emptyNode._rendererSummary.isSubtreeContainingCompatible(Renderer.bitmaskCanvas), 'Empty node partially compatible: Canvas');
    assert.ok(!emptyNode._rendererSummary.isSubtreeContainingCompatible(Renderer.bitmaskSVG), 'Empty node partially compatible: SVG');
    assert.ok(emptyNode._rendererSummary.isSingleCanvasSupported(), 'Empty node supports single Canvas');
    assert.ok(emptyNode._rendererSummary.isSingleSVGSupported(), 'Empty node supports single SVG');
    assert.ok(emptyNode._rendererSummary.isNotPainted(), 'Empty node is not painted');
    assert.ok(emptyNode._rendererSummary.areBoundsValid(), 'Empty node has valid bounds');
});

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvdXRpbC9UcmFpbFRlc3RzLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE3LTIwMjMsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIFRyYWlsIHRlc3RzXG4gKlxuICogQGF1dGhvciBTYW0gUmVpZCAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcbiAqL1xuXG5pbXBvcnQgQm91bmRzMiBmcm9tICcuLi8uLi8uLi9kb3QvanMvQm91bmRzMi5qcyc7XG5pbXBvcnQgVmVjdG9yMiBmcm9tICcuLi8uLi8uLi9kb3QvanMvVmVjdG9yMi5qcyc7XG5pbXBvcnQgeyBTaGFwZSB9IGZyb20gJy4uLy4uLy4uL2tpdGUvanMvaW1wb3J0cy5qcyc7XG5pbXBvcnQgeyBDYW52YXNOb2RlLCBDb2xvciwgRGlzcGxheSwgSFN0cnV0LCBMaW5lLCBOb2RlLCBQYXRoLCBSZWN0YW5nbGUsIFJlbmRlcmVyLCBTcGFjZXIsIFRleHQsIFRleHRCb3VuZHMsIFRyYWlsLCBUcmFpbFBvaW50ZXIsIFV0aWxzLCBWU3RydXQsIFdlYkdMTm9kZSB9IGZyb20gJy4uL2ltcG9ydHMuanMnO1xuXG5RVW5pdC5tb2R1bGUoICdUcmFpbCcgKTtcblxuZnVuY3Rpb24gZXF1YWxzQXBwcm94KCBhc3NlcnQsIGEsIGIsIG1lc3NhZ2UgKSB7XG4gIGFzc2VydC5vayggTWF0aC5hYnMoIGEgLSBiICkgPCAwLjAwMDAwMDEsIGAkeyggbWVzc2FnZSA/IGAke21lc3NhZ2V9OiBgIDogJycgKSArIGF9ID0/ICR7Yn1gICk7XG59XG5cblxuLypcblRoZSB0ZXN0IHRyZWU6XG5uXG4gIG5cbiAgICBuXG4gICAgblxuICAgICAgblxuICAgIG5cbiAgICBuXG4gICAgICBuXG4gICAgICAgIG5cbiAgICAgIG5cbiAgICBuXG4gIG5cbiAgblxuICovXG5mdW5jdGlvbiBjcmVhdGVUZXN0Tm9kZVRyZWUoKSB7XG4gIGNvbnN0IG5vZGUgPSBuZXcgTm9kZSgpO1xuICBub2RlLmFkZENoaWxkKCBuZXcgTm9kZSgpICk7XG4gIG5vZGUuYWRkQ2hpbGQoIG5ldyBOb2RlKCkgKTtcbiAgbm9kZS5hZGRDaGlsZCggbmV3IE5vZGUoKSApO1xuXG4gIG5vZGUuY2hpbGRyZW5bIDAgXS5hZGRDaGlsZCggbmV3IE5vZGUoKSApO1xuICBub2RlLmNoaWxkcmVuWyAwIF0uYWRkQ2hpbGQoIG5ldyBOb2RlKCkgKTtcbiAgbm9kZS5jaGlsZHJlblsgMCBdLmFkZENoaWxkKCBuZXcgTm9kZSgpICk7XG4gIG5vZGUuY2hpbGRyZW5bIDAgXS5hZGRDaGlsZCggbmV3IE5vZGUoKSApO1xuICBub2RlLmNoaWxkcmVuWyAwIF0uYWRkQ2hpbGQoIG5ldyBOb2RlKCkgKTtcblxuICBub2RlLmNoaWxkcmVuWyAwIF0uY2hpbGRyZW5bIDEgXS5hZGRDaGlsZCggbmV3IE5vZGUoKSApO1xuICBub2RlLmNoaWxkcmVuWyAwIF0uY2hpbGRyZW5bIDMgXS5hZGRDaGlsZCggbmV3IE5vZGUoKSApO1xuICBub2RlLmNoaWxkcmVuWyAwIF0uY2hpbGRyZW5bIDMgXS5hZGRDaGlsZCggbmV3IE5vZGUoKSApO1xuXG4gIG5vZGUuY2hpbGRyZW5bIDAgXS5jaGlsZHJlblsgMyBdLmNoaWxkcmVuWyAwIF0uYWRkQ2hpbGQoIG5ldyBOb2RlKCkgKTtcblxuICByZXR1cm4gbm9kZTtcbn1cblxuUVVuaXQudGVzdCggJ0RpcnR5IGJvdW5kcyBwcm9wYWdhdGlvbiB0ZXN0JywgYXNzZXJ0ID0+IHtcbiAgY29uc3Qgbm9kZSA9IGNyZWF0ZVRlc3ROb2RlVHJlZSgpO1xuXG4gIG5vZGUudmFsaWRhdGVCb3VuZHMoKTtcblxuICBhc3NlcnQub2soICFub2RlLl9jaGlsZEJvdW5kc0RpcnR5ICk7XG5cbiAgbm9kZS5jaGlsZHJlblsgMCBdLmNoaWxkcmVuWyAzIF0uY2hpbGRyZW5bIDAgXS5pbnZhbGlkYXRlQm91bmRzKCk7XG5cbiAgYXNzZXJ0Lm9rKCBub2RlLl9jaGlsZEJvdW5kc0RpcnR5ICk7XG59ICk7XG5cblFVbml0LnRlc3QoICdDYW52YXMgMkQgQ29udGV4dCBhbmQgRmVhdHVyZXMnLCBhc3NlcnQgPT4ge1xuICBjb25zdCBjYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCAnY2FudmFzJyApO1xuICBjb25zdCBjb250ZXh0ID0gY2FudmFzLmdldENvbnRleHQoICcyZCcgKTtcblxuICBhc3NlcnQub2soIGNvbnRleHQsICdjb250ZXh0JyApO1xuXG4gIGNvbnN0IG5lZWRlZE1ldGhvZHMgPSBbXG4gICAgJ2FyYycsXG4gICAgJ2FyY1RvJyxcbiAgICAnYmVnaW5QYXRoJyxcbiAgICAnYmV6aWVyQ3VydmVUbycsXG4gICAgJ2NsZWFyUmVjdCcsXG4gICAgJ2NsaXAnLFxuICAgICdjbG9zZVBhdGgnLFxuICAgICdmaWxsJyxcbiAgICAnZmlsbFJlY3QnLFxuICAgICdmaWxsU3R5bGUnLFxuICAgICdpc1BvaW50SW5QYXRoJyxcbiAgICAnbGluZVRvJyxcbiAgICAnbW92ZVRvJyxcbiAgICAncmVjdCcsXG4gICAgJ3Jlc3RvcmUnLFxuICAgICdxdWFkcmF0aWNDdXJ2ZVRvJyxcbiAgICAnc2F2ZScsXG4gICAgJ3NldFRyYW5zZm9ybScsXG4gICAgJ3N0cm9rZScsXG4gICAgJ3N0cm9rZVJlY3QnLFxuICAgICdzdHJva2VTdHlsZSdcbiAgXTtcbiAgXy5lYWNoKCBuZWVkZWRNZXRob2RzLCBtZXRob2QgPT4ge1xuICAgIGFzc2VydC5vayggY29udGV4dFsgbWV0aG9kIF0gIT09IHVuZGVmaW5lZCwgYGNvbnRleHQuJHttZXRob2R9YCApO1xuICB9ICk7XG59ICk7XG5cblFVbml0LnRlc3QoICdUcmFpbCBuZXh0L3ByZXZpb3VzJywgYXNzZXJ0ID0+IHtcbiAgY29uc3Qgbm9kZSA9IGNyZWF0ZVRlc3ROb2RlVHJlZSgpO1xuXG4gIC8vIHdhbGsgaXQgZm9yd2FyZFxuICBsZXQgdHJhaWwgPSBuZXcgVHJhaWwoIFsgbm9kZSBdICk7XG4gIGFzc2VydC5lcXVhbCggMSwgdHJhaWwubGVuZ3RoICk7XG4gIHRyYWlsID0gdHJhaWwubmV4dCgpO1xuICBhc3NlcnQuZXF1YWwoIDIsIHRyYWlsLmxlbmd0aCApO1xuICB0cmFpbCA9IHRyYWlsLm5leHQoKTtcbiAgYXNzZXJ0LmVxdWFsKCAzLCB0cmFpbC5sZW5ndGggKTtcbiAgdHJhaWwgPSB0cmFpbC5uZXh0KCk7XG4gIGFzc2VydC5lcXVhbCggMywgdHJhaWwubGVuZ3RoICk7XG4gIHRyYWlsID0gdHJhaWwubmV4dCgpO1xuICBhc3NlcnQuZXF1YWwoIDQsIHRyYWlsLmxlbmd0aCApO1xuICB0cmFpbCA9IHRyYWlsLm5leHQoKTtcbiAgYXNzZXJ0LmVxdWFsKCAzLCB0cmFpbC5sZW5ndGggKTtcbiAgdHJhaWwgPSB0cmFpbC5uZXh0KCk7XG4gIGFzc2VydC5lcXVhbCggMywgdHJhaWwubGVuZ3RoICk7XG4gIHRyYWlsID0gdHJhaWwubmV4dCgpO1xuICBhc3NlcnQuZXF1YWwoIDQsIHRyYWlsLmxlbmd0aCApO1xuICB0cmFpbCA9IHRyYWlsLm5leHQoKTtcbiAgYXNzZXJ0LmVxdWFsKCA1LCB0cmFpbC5sZW5ndGggKTtcbiAgdHJhaWwgPSB0cmFpbC5uZXh0KCk7XG4gIGFzc2VydC5lcXVhbCggNCwgdHJhaWwubGVuZ3RoICk7XG4gIHRyYWlsID0gdHJhaWwubmV4dCgpO1xuICBhc3NlcnQuZXF1YWwoIDMsIHRyYWlsLmxlbmd0aCApO1xuICB0cmFpbCA9IHRyYWlsLm5leHQoKTtcbiAgYXNzZXJ0LmVxdWFsKCAyLCB0cmFpbC5sZW5ndGggKTtcbiAgdHJhaWwgPSB0cmFpbC5uZXh0KCk7XG4gIGFzc2VydC5lcXVhbCggMiwgdHJhaWwubGVuZ3RoICk7XG5cbiAgLy8gbWFrZSBzdXJlIHdhbGtpbmcgb2ZmIHRoZSBlbmQgZ2l2ZXMgdXMgbnVsbFxuICBhc3NlcnQuZXF1YWwoIG51bGwsIHRyYWlsLm5leHQoKSApO1xuXG4gIHRyYWlsID0gdHJhaWwucHJldmlvdXMoKTtcbiAgYXNzZXJ0LmVxdWFsKCAyLCB0cmFpbC5sZW5ndGggKTtcbiAgdHJhaWwgPSB0cmFpbC5wcmV2aW91cygpO1xuICBhc3NlcnQuZXF1YWwoIDMsIHRyYWlsLmxlbmd0aCApO1xuICB0cmFpbCA9IHRyYWlsLnByZXZpb3VzKCk7XG4gIGFzc2VydC5lcXVhbCggNCwgdHJhaWwubGVuZ3RoICk7XG4gIHRyYWlsID0gdHJhaWwucHJldmlvdXMoKTtcbiAgYXNzZXJ0LmVxdWFsKCA1LCB0cmFpbC5sZW5ndGggKTtcbiAgdHJhaWwgPSB0cmFpbC5wcmV2aW91cygpO1xuICBhc3NlcnQuZXF1YWwoIDQsIHRyYWlsLmxlbmd0aCApO1xuICB0cmFpbCA9IHRyYWlsLnByZXZpb3VzKCk7XG4gIGFzc2VydC5lcXVhbCggMywgdHJhaWwubGVuZ3RoICk7XG4gIHRyYWlsID0gdHJhaWwucHJldmlvdXMoKTtcbiAgYXNzZXJ0LmVxdWFsKCAzLCB0cmFpbC5sZW5ndGggKTtcbiAgdHJhaWwgPSB0cmFpbC5wcmV2aW91cygpO1xuICBhc3NlcnQuZXF1YWwoIDQsIHRyYWlsLmxlbmd0aCApO1xuICB0cmFpbCA9IHRyYWlsLnByZXZpb3VzKCk7XG4gIGFzc2VydC5lcXVhbCggMywgdHJhaWwubGVuZ3RoICk7XG4gIHRyYWlsID0gdHJhaWwucHJldmlvdXMoKTtcbiAgYXNzZXJ0LmVxdWFsKCAzLCB0cmFpbC5sZW5ndGggKTtcbiAgdHJhaWwgPSB0cmFpbC5wcmV2aW91cygpO1xuICBhc3NlcnQuZXF1YWwoIDIsIHRyYWlsLmxlbmd0aCApO1xuICB0cmFpbCA9IHRyYWlsLnByZXZpb3VzKCk7XG4gIGFzc2VydC5lcXVhbCggMSwgdHJhaWwubGVuZ3RoICk7XG5cbiAgLy8gbWFrZSBzdXJlIHdhbGtpbmcgb2ZmIHRoZSBzdGFydCBnaXZlcyB1cyBudWxsXG4gIGFzc2VydC5lcXVhbCggbnVsbCwgdHJhaWwucHJldmlvdXMoKSApO1xufSApO1xuXG5RVW5pdC50ZXN0KCAnVHJhaWwgY29tcGFyaXNvbicsIGFzc2VydCA9PiB7XG4gIGNvbnN0IG5vZGUgPSBjcmVhdGVUZXN0Tm9kZVRyZWUoKTtcblxuICAvLyBnZXQgYSBsaXN0IG9mIGFsbCB0cmFpbHMgaW4gcmVuZGVyIG9yZGVyXG4gIGNvbnN0IHRyYWlscyA9IFtdO1xuICBsZXQgY3VycmVudFRyYWlsID0gbmV3IFRyYWlsKCBub2RlICk7IC8vIHN0YXJ0IGF0IHRoZSBmaXJzdCBub2RlXG5cbiAgd2hpbGUgKCBjdXJyZW50VHJhaWwgKSB7XG4gICAgdHJhaWxzLnB1c2goIGN1cnJlbnRUcmFpbCApO1xuICAgIGN1cnJlbnRUcmFpbCA9IGN1cnJlbnRUcmFpbC5uZXh0KCk7XG4gIH1cblxuICBhc3NlcnQuZXF1YWwoIDEzLCB0cmFpbHMubGVuZ3RoLCAnVHJhaWwgZm9yIGVhY2ggbm9kZScgKTtcblxuICBmb3IgKCBsZXQgaSA9IDA7IGkgPCB0cmFpbHMubGVuZ3RoOyBpKysgKSB7XG4gICAgZm9yICggbGV0IGogPSBpOyBqIDwgdHJhaWxzLmxlbmd0aDsgaisrICkge1xuICAgICAgY29uc3QgY29tcGFyaXNvbiA9IHRyYWlsc1sgaSBdLmNvbXBhcmUoIHRyYWlsc1sgaiBdICk7XG5cbiAgICAgIC8vIG1ha2Ugc3VyZSB0aGF0IGV2ZXJ5IHRyYWlsIGNvbXBhcmVzIGFzIGV4cGVjdGVkICgwIGFuZCB0aGV5IGFyZSBlcXVhbCwgLTEgYW5kIGkgPCBqKVxuICAgICAgYXNzZXJ0LmVxdWFsKCBpID09PSBqID8gMCA6ICggaSA8IGogPyAtMSA6IDEgKSwgY29tcGFyaXNvbiwgYCR7aX0sJHtqfWAgKTtcbiAgICB9XG4gIH1cbn0gKTtcblxuUVVuaXQudGVzdCggJ1RyYWlsIGVhY2hUcmFpbEJldHdlZW4nLCBhc3NlcnQgPT4ge1xuICBjb25zdCBub2RlID0gY3JlYXRlVGVzdE5vZGVUcmVlKCk7XG5cbiAgLy8gZ2V0IGEgbGlzdCBvZiBhbGwgdHJhaWxzIGluIHJlbmRlciBvcmRlclxuICBjb25zdCB0cmFpbHMgPSBbXTtcbiAgbGV0IGN1cnJlbnRUcmFpbCA9IG5ldyBUcmFpbCggbm9kZSApOyAvLyBzdGFydCBhdCB0aGUgZmlyc3Qgbm9kZVxuXG4gIHdoaWxlICggY3VycmVudFRyYWlsICkge1xuICAgIHRyYWlscy5wdXNoKCBjdXJyZW50VHJhaWwgKTtcbiAgICBjdXJyZW50VHJhaWwgPSBjdXJyZW50VHJhaWwubmV4dCgpO1xuICB9XG5cbiAgYXNzZXJ0LmVxdWFsKCAxMywgdHJhaWxzLmxlbmd0aCwgYFRyYWlsczogJHtfLm1hcCggdHJhaWxzLCB0cmFpbCA9PiB0cmFpbC50b1N0cmluZygpICkuam9pbiggJ1xcbicgKX1gICk7XG5cbiAgZm9yICggbGV0IGkgPSAwOyBpIDwgdHJhaWxzLmxlbmd0aDsgaSsrICkge1xuICAgIGZvciAoIGxldCBqID0gaTsgaiA8IHRyYWlscy5sZW5ndGg7IGorKyApIHtcbiAgICAgIGNvbnN0IGluY2x1c2l2ZUxpc3QgPSBbXTtcbiAgICAgIFRyYWlsLmVhY2hUcmFpbEJldHdlZW4oIHRyYWlsc1sgaSBdLCB0cmFpbHNbIGogXSwgdHJhaWwgPT4ge1xuICAgICAgICBpbmNsdXNpdmVMaXN0LnB1c2goIHRyYWlsLmNvcHkoKSApO1xuICAgICAgfSwgZmFsc2UsIG5vZGUgKTtcbiAgICAgIGNvbnN0IHRyYWlsU3RyaW5nID0gYCR7aX0sJHtqfSAke3RyYWlsc1sgaSBdLnRvU3RyaW5nKCl9IHRvICR7dHJhaWxzWyBqIF0udG9TdHJpbmcoKX1gO1xuICAgICAgYXNzZXJ0Lm9rKCBpbmNsdXNpdmVMaXN0WyAwIF0uZXF1YWxzKCB0cmFpbHNbIGkgXSApLCBgaW5jbHVzaXZlIHN0YXJ0IG9uICR7dHJhaWxTdHJpbmd9IGlzICR7aW5jbHVzaXZlTGlzdFsgMCBdLnRvU3RyaW5nKCl9YCApO1xuICAgICAgYXNzZXJ0Lm9rKCBpbmNsdXNpdmVMaXN0WyBpbmNsdXNpdmVMaXN0Lmxlbmd0aCAtIDEgXS5lcXVhbHMoIHRyYWlsc1sgaiBdICksIGBpbmNsdXNpdmUgZW5kIG9uICR7dHJhaWxTdHJpbmd9aXMgJHtpbmNsdXNpdmVMaXN0WyBpbmNsdXNpdmVMaXN0Lmxlbmd0aCAtIDEgXS50b1N0cmluZygpfWAgKTtcbiAgICAgIGFzc2VydC5lcXVhbCggaW5jbHVzaXZlTGlzdC5sZW5ndGgsIGogLSBpICsgMSwgYGluY2x1c2l2ZSBsZW5ndGggb24gJHt0cmFpbFN0cmluZ30gaXMgJHtpbmNsdXNpdmVMaXN0Lmxlbmd0aH0sICR7Xy5tYXAoIGluY2x1c2l2ZUxpc3QsIHRyYWlsID0+IHRyYWlsLnRvU3RyaW5nKCkgKS5qb2luKCAnXFxuJyApfWAgKTtcblxuICAgICAgaWYgKCBpIDwgaiApIHtcbiAgICAgICAgY29uc3QgZXhjbHVzaXZlTGlzdCA9IFtdO1xuICAgICAgICBUcmFpbC5lYWNoVHJhaWxCZXR3ZWVuKCB0cmFpbHNbIGkgXSwgdHJhaWxzWyBqIF0sIHRyYWlsID0+IHtcbiAgICAgICAgICBleGNsdXNpdmVMaXN0LnB1c2goIHRyYWlsLmNvcHkoKSApO1xuICAgICAgICB9LCB0cnVlLCBub2RlICk7XG4gICAgICAgIGFzc2VydC5lcXVhbCggZXhjbHVzaXZlTGlzdC5sZW5ndGgsIGogLSBpIC0gMSwgYGV4Y2x1c2l2ZSBsZW5ndGggb24gJHtpfSwke2p9YCApO1xuICAgICAgfVxuICAgIH1cbiAgfVxufSApO1xuXG5RVW5pdC50ZXN0KCAnZGVwdGhGaXJzdFVudGlsIGRlcHRoRmlyc3RVbnRpbCB3aXRoIHN1YnRyZWUgc2tpcHBpbmcnLCBhc3NlcnQgPT4ge1xuICBjb25zdCBub2RlID0gY3JlYXRlVGVzdE5vZGVUcmVlKCk7XG4gIG5vZGUuY2hpbGRyZW5bIDAgXS5jaGlsZHJlblsgMiBdLnZpc2libGUgPSBmYWxzZTtcbiAgbm9kZS5jaGlsZHJlblsgMCBdLmNoaWxkcmVuWyAzIF0udmlzaWJsZSA9IGZhbHNlO1xuICBuZXcgVHJhaWxQb2ludGVyKCBuZXcgVHJhaWwoIG5vZGUgKSwgdHJ1ZSApLmRlcHRoRmlyc3RVbnRpbCggbmV3IFRyYWlsUG9pbnRlciggbmV3IFRyYWlsKCBub2RlICksIGZhbHNlICksIHBvaW50ZXIgPT4ge1xuICAgIGlmICggIXBvaW50ZXIudHJhaWwubGFzdE5vZGUoKS5pc1Zpc2libGUoKSApIHtcbiAgICAgIC8vIHNob3VsZCBza2lwXG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgYXNzZXJ0Lm9rKCBwb2ludGVyLnRyYWlsLmlzVmlzaWJsZSgpLCBgVHJhaWwgdmlzaWJpbGl0eSBmb3IgJHtwb2ludGVyLnRyYWlsLnRvU3RyaW5nKCl9YCApO1xuICAgIHJldHVybiBmYWxzZTtcbiAgfSwgZmFsc2UgKTtcbn0gKTtcblxuUVVuaXQudGVzdCggJ1RyYWlsIGVhY2hUcmFpbFVuZGVyIHdpdGggc3VidHJlZSBza2lwcGluZycsIGFzc2VydCA9PiB7XG4gIGNvbnN0IG5vZGUgPSBjcmVhdGVUZXN0Tm9kZVRyZWUoKTtcbiAgbm9kZS5jaGlsZHJlblsgMCBdLmNoaWxkcmVuWyAyIF0udmlzaWJsZSA9IGZhbHNlO1xuICBub2RlLmNoaWxkcmVuWyAwIF0uY2hpbGRyZW5bIDMgXS52aXNpYmxlID0gZmFsc2U7XG4gIG5ldyBUcmFpbCggbm9kZSApLmVhY2hUcmFpbFVuZGVyKCB0cmFpbCA9PiB7XG4gICAgaWYgKCAhdHJhaWwubGFzdE5vZGUoKS5pc1Zpc2libGUoKSApIHtcbiAgICAgIC8vIHNob3VsZCBza2lwXG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgYXNzZXJ0Lm9rKCB0cmFpbC5pc1Zpc2libGUoKSwgYFRyYWlsIHZpc2liaWxpdHkgZm9yICR7dHJhaWwudG9TdHJpbmcoKX1gICk7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9ICk7XG59ICk7XG5cblFVbml0LnRlc3QoICdUcmFpbFBvaW50ZXIgcmVuZGVyIGNvbXBhcmlzb24nLCBhc3NlcnQgPT4ge1xuICBjb25zdCBub2RlID0gY3JlYXRlVGVzdE5vZGVUcmVlKCk7XG5cbiAgYXNzZXJ0LmVxdWFsKCAwLCBuZXcgVHJhaWxQb2ludGVyKCBub2RlLmdldFVuaXF1ZVRyYWlsKCksIHRydWUgKS5jb21wYXJlUmVuZGVyKCBuZXcgVHJhaWxQb2ludGVyKCBub2RlLmdldFVuaXF1ZVRyYWlsKCksIHRydWUgKSApLCAnU2FtZSBiZWZvcmUgcG9pbnRlcicgKTtcbiAgYXNzZXJ0LmVxdWFsKCAwLCBuZXcgVHJhaWxQb2ludGVyKCBub2RlLmdldFVuaXF1ZVRyYWlsKCksIGZhbHNlICkuY29tcGFyZVJlbmRlciggbmV3IFRyYWlsUG9pbnRlciggbm9kZS5nZXRVbmlxdWVUcmFpbCgpLCBmYWxzZSApICksICdTYW1lIGFmdGVyIHBvaW50ZXInICk7XG4gIGFzc2VydC5lcXVhbCggLTEsIG5ldyBUcmFpbFBvaW50ZXIoIG5vZGUuZ2V0VW5pcXVlVHJhaWwoKSwgdHJ1ZSApLmNvbXBhcmVSZW5kZXIoIG5ldyBUcmFpbFBvaW50ZXIoIG5vZGUuZ2V0VW5pcXVlVHJhaWwoKSwgZmFsc2UgKSApLCAnU2FtZSBub2RlIGJlZm9yZS9hZnRlciByb290JyApO1xuICBhc3NlcnQuZXF1YWwoIC0xLCBuZXcgVHJhaWxQb2ludGVyKCBub2RlLmNoaWxkcmVuWyAwIF0uZ2V0VW5pcXVlVHJhaWwoKSwgdHJ1ZSApLmNvbXBhcmVSZW5kZXIoIG5ldyBUcmFpbFBvaW50ZXIoIG5vZGUuY2hpbGRyZW5bIDAgXS5nZXRVbmlxdWVUcmFpbCgpLCBmYWxzZSApICksICdTYW1lIG5vZGUgYmVmb3JlL2FmdGVyIG5vbnJvb3QnICk7XG4gIGFzc2VydC5lcXVhbCggMCwgbmV3IFRyYWlsUG9pbnRlciggbm9kZS5jaGlsZHJlblsgMCBdLmNoaWxkcmVuWyAxIF0uY2hpbGRyZW5bIDAgXS5nZXRVbmlxdWVUcmFpbCgpLCBmYWxzZSApLmNvbXBhcmVSZW5kZXIoIG5ldyBUcmFpbFBvaW50ZXIoIG5vZGUuY2hpbGRyZW5bIDAgXS5jaGlsZHJlblsgMiBdLmdldFVuaXF1ZVRyYWlsKCksIHRydWUgKSApLCAnRXF1aXZhbGVuY2Ugb2YgYmVmb3JlL2FmdGVyJyApO1xuXG4gIC8vIGFsbCBwb2ludGVycyBpbiB0aGUgcmVuZGVyIG9yZGVyXG4gIGNvbnN0IHBvaW50ZXJzID0gW1xuICAgIG5ldyBUcmFpbFBvaW50ZXIoIG5vZGUuZ2V0VW5pcXVlVHJhaWwoKSwgdHJ1ZSApLFxuICAgIG5ldyBUcmFpbFBvaW50ZXIoIG5vZGUuZ2V0VW5pcXVlVHJhaWwoKSwgZmFsc2UgKSxcbiAgICBuZXcgVHJhaWxQb2ludGVyKCBub2RlLmNoaWxkcmVuWyAwIF0uZ2V0VW5pcXVlVHJhaWwoKSwgdHJ1ZSApLFxuICAgIG5ldyBUcmFpbFBvaW50ZXIoIG5vZGUuY2hpbGRyZW5bIDAgXS5nZXRVbmlxdWVUcmFpbCgpLCBmYWxzZSApLFxuICAgIG5ldyBUcmFpbFBvaW50ZXIoIG5vZGUuY2hpbGRyZW5bIDAgXS5jaGlsZHJlblsgMCBdLmdldFVuaXF1ZVRyYWlsKCksIHRydWUgKSxcbiAgICBuZXcgVHJhaWxQb2ludGVyKCBub2RlLmNoaWxkcmVuWyAwIF0uY2hpbGRyZW5bIDAgXS5nZXRVbmlxdWVUcmFpbCgpLCBmYWxzZSApLFxuICAgIG5ldyBUcmFpbFBvaW50ZXIoIG5vZGUuY2hpbGRyZW5bIDAgXS5jaGlsZHJlblsgMSBdLmdldFVuaXF1ZVRyYWlsKCksIHRydWUgKSxcbiAgICBuZXcgVHJhaWxQb2ludGVyKCBub2RlLmNoaWxkcmVuWyAwIF0uY2hpbGRyZW5bIDEgXS5nZXRVbmlxdWVUcmFpbCgpLCBmYWxzZSApLFxuICAgIG5ldyBUcmFpbFBvaW50ZXIoIG5vZGUuY2hpbGRyZW5bIDAgXS5jaGlsZHJlblsgMSBdLmNoaWxkcmVuWyAwIF0uZ2V0VW5pcXVlVHJhaWwoKSwgdHJ1ZSApLFxuICAgIG5ldyBUcmFpbFBvaW50ZXIoIG5vZGUuY2hpbGRyZW5bIDAgXS5jaGlsZHJlblsgMSBdLmNoaWxkcmVuWyAwIF0uZ2V0VW5pcXVlVHJhaWwoKSwgZmFsc2UgKSxcbiAgICBuZXcgVHJhaWxQb2ludGVyKCBub2RlLmNoaWxkcmVuWyAwIF0uY2hpbGRyZW5bIDIgXS5nZXRVbmlxdWVUcmFpbCgpLCB0cnVlICksXG4gICAgbmV3IFRyYWlsUG9pbnRlciggbm9kZS5jaGlsZHJlblsgMCBdLmNoaWxkcmVuWyAyIF0uZ2V0VW5pcXVlVHJhaWwoKSwgZmFsc2UgKSxcbiAgICBuZXcgVHJhaWxQb2ludGVyKCBub2RlLmNoaWxkcmVuWyAwIF0uY2hpbGRyZW5bIDMgXS5nZXRVbmlxdWVUcmFpbCgpLCB0cnVlICksXG4gICAgbmV3IFRyYWlsUG9pbnRlciggbm9kZS5jaGlsZHJlblsgMCBdLmNoaWxkcmVuWyAzIF0uZ2V0VW5pcXVlVHJhaWwoKSwgZmFsc2UgKSxcbiAgICBuZXcgVHJhaWxQb2ludGVyKCBub2RlLmNoaWxkcmVuWyAwIF0uY2hpbGRyZW5bIDMgXS5jaGlsZHJlblsgMCBdLmdldFVuaXF1ZVRyYWlsKCksIHRydWUgKSxcbiAgICBuZXcgVHJhaWxQb2ludGVyKCBub2RlLmNoaWxkcmVuWyAwIF0uY2hpbGRyZW5bIDMgXS5jaGlsZHJlblsgMCBdLmdldFVuaXF1ZVRyYWlsKCksIGZhbHNlICksXG4gICAgbmV3IFRyYWlsUG9pbnRlciggbm9kZS5jaGlsZHJlblsgMCBdLmNoaWxkcmVuWyAzIF0uY2hpbGRyZW5bIDAgXS5jaGlsZHJlblsgMCBdLmdldFVuaXF1ZVRyYWlsKCksIHRydWUgKSxcbiAgICBuZXcgVHJhaWxQb2ludGVyKCBub2RlLmNoaWxkcmVuWyAwIF0uY2hpbGRyZW5bIDMgXS5jaGlsZHJlblsgMCBdLmNoaWxkcmVuWyAwIF0uZ2V0VW5pcXVlVHJhaWwoKSwgZmFsc2UgKSxcbiAgICBuZXcgVHJhaWxQb2ludGVyKCBub2RlLmNoaWxkcmVuWyAwIF0uY2hpbGRyZW5bIDMgXS5jaGlsZHJlblsgMSBdLmdldFVuaXF1ZVRyYWlsKCksIHRydWUgKSxcbiAgICBuZXcgVHJhaWxQb2ludGVyKCBub2RlLmNoaWxkcmVuWyAwIF0uY2hpbGRyZW5bIDMgXS5jaGlsZHJlblsgMSBdLmdldFVuaXF1ZVRyYWlsKCksIGZhbHNlICksXG4gICAgbmV3IFRyYWlsUG9pbnRlciggbm9kZS5jaGlsZHJlblsgMCBdLmNoaWxkcmVuWyA0IF0uZ2V0VW5pcXVlVHJhaWwoKSwgdHJ1ZSApLFxuICAgIG5ldyBUcmFpbFBvaW50ZXIoIG5vZGUuY2hpbGRyZW5bIDAgXS5jaGlsZHJlblsgNCBdLmdldFVuaXF1ZVRyYWlsKCksIGZhbHNlICksXG4gICAgbmV3IFRyYWlsUG9pbnRlciggbm9kZS5jaGlsZHJlblsgMSBdLmdldFVuaXF1ZVRyYWlsKCksIHRydWUgKSxcbiAgICBuZXcgVHJhaWxQb2ludGVyKCBub2RlLmNoaWxkcmVuWyAxIF0uZ2V0VW5pcXVlVHJhaWwoKSwgZmFsc2UgKSxcbiAgICBuZXcgVHJhaWxQb2ludGVyKCBub2RlLmNoaWxkcmVuWyAyIF0uZ2V0VW5pcXVlVHJhaWwoKSwgdHJ1ZSApLFxuICAgIG5ldyBUcmFpbFBvaW50ZXIoIG5vZGUuY2hpbGRyZW5bIDIgXS5nZXRVbmlxdWVUcmFpbCgpLCBmYWxzZSApXG4gIF07XG5cbiAgLy8gY29tcGFyZSB0aGUgcG9pbnRlcnMuIGRpZmZlcmVudCBvbmVzIGNhbiBiZSBlcXVhbCBpZiB0aGV5IHJlcHJlc2VudCB0aGUgc2FtZSBwbGFjZSwgc28gd2Ugb25seSBjaGVjayBpZiB0aGV5IGNvbXBhcmUgZGlmZmVyZW50bHlcbiAgZm9yICggbGV0IGkgPSAwOyBpIDwgcG9pbnRlcnMubGVuZ3RoOyBpKysgKSB7XG4gICAgZm9yICggbGV0IGogPSBpOyBqIDwgcG9pbnRlcnMubGVuZ3RoOyBqKysgKSB7XG4gICAgICBjb25zdCBjb21wYXJpc29uID0gcG9pbnRlcnNbIGkgXS5jb21wYXJlUmVuZGVyKCBwb2ludGVyc1sgaiBdICk7XG5cbiAgICAgIGlmICggY29tcGFyaXNvbiA9PT0gLTEgKSB7XG4gICAgICAgIGFzc2VydC5vayggaSA8IGosIGAke2l9LCR7an1gICk7XG4gICAgICB9XG4gICAgICBpZiAoIGNvbXBhcmlzb24gPT09IDEgKSB7XG4gICAgICAgIGFzc2VydC5vayggaSA+IGosIGAke2l9LCR7an1gICk7XG4gICAgICB9XG4gICAgfVxuICB9XG59ICk7XG5cblFVbml0LnRlc3QoICdUcmFpbFBvaW50ZXIgbmVzdGVkIGNvbXBhcmlzb24gYW5kIGZvd2FyZHMvYmFja3dhcmRzJywgYXNzZXJ0ID0+IHtcbiAgY29uc3Qgbm9kZSA9IGNyZWF0ZVRlc3ROb2RlVHJlZSgpO1xuXG4gIC8vIGFsbCBwb2ludGVycyBpbiB0aGUgbmVzdGVkIG9yZGVyXG4gIGNvbnN0IHBvaW50ZXJzID0gW1xuICAgIG5ldyBUcmFpbFBvaW50ZXIoIG5vZGUuZ2V0VW5pcXVlVHJhaWwoKSwgdHJ1ZSApLFxuICAgIG5ldyBUcmFpbFBvaW50ZXIoIG5vZGUuY2hpbGRyZW5bIDAgXS5nZXRVbmlxdWVUcmFpbCgpLCB0cnVlICksXG4gICAgbmV3IFRyYWlsUG9pbnRlciggbm9kZS5jaGlsZHJlblsgMCBdLmNoaWxkcmVuWyAwIF0uZ2V0VW5pcXVlVHJhaWwoKSwgdHJ1ZSApLFxuICAgIG5ldyBUcmFpbFBvaW50ZXIoIG5vZGUuY2hpbGRyZW5bIDAgXS5jaGlsZHJlblsgMCBdLmdldFVuaXF1ZVRyYWlsKCksIGZhbHNlICksXG4gICAgbmV3IFRyYWlsUG9pbnRlciggbm9kZS5jaGlsZHJlblsgMCBdLmNoaWxkcmVuWyAxIF0uZ2V0VW5pcXVlVHJhaWwoKSwgdHJ1ZSApLFxuICAgIG5ldyBUcmFpbFBvaW50ZXIoIG5vZGUuY2hpbGRyZW5bIDAgXS5jaGlsZHJlblsgMSBdLmNoaWxkcmVuWyAwIF0uZ2V0VW5pcXVlVHJhaWwoKSwgdHJ1ZSApLFxuICAgIG5ldyBUcmFpbFBvaW50ZXIoIG5vZGUuY2hpbGRyZW5bIDAgXS5jaGlsZHJlblsgMSBdLmNoaWxkcmVuWyAwIF0uZ2V0VW5pcXVlVHJhaWwoKSwgZmFsc2UgKSxcbiAgICBuZXcgVHJhaWxQb2ludGVyKCBub2RlLmNoaWxkcmVuWyAwIF0uY2hpbGRyZW5bIDEgXS5nZXRVbmlxdWVUcmFpbCgpLCBmYWxzZSApLFxuICAgIG5ldyBUcmFpbFBvaW50ZXIoIG5vZGUuY2hpbGRyZW5bIDAgXS5jaGlsZHJlblsgMiBdLmdldFVuaXF1ZVRyYWlsKCksIHRydWUgKSxcbiAgICBuZXcgVHJhaWxQb2ludGVyKCBub2RlLmNoaWxkcmVuWyAwIF0uY2hpbGRyZW5bIDIgXS5nZXRVbmlxdWVUcmFpbCgpLCBmYWxzZSApLFxuICAgIG5ldyBUcmFpbFBvaW50ZXIoIG5vZGUuY2hpbGRyZW5bIDAgXS5jaGlsZHJlblsgMyBdLmdldFVuaXF1ZVRyYWlsKCksIHRydWUgKSxcbiAgICBuZXcgVHJhaWxQb2ludGVyKCBub2RlLmNoaWxkcmVuWyAwIF0uY2hpbGRyZW5bIDMgXS5jaGlsZHJlblsgMCBdLmdldFVuaXF1ZVRyYWlsKCksIHRydWUgKSxcbiAgICBuZXcgVHJhaWxQb2ludGVyKCBub2RlLmNoaWxkcmVuWyAwIF0uY2hpbGRyZW5bIDMgXS5jaGlsZHJlblsgMCBdLmNoaWxkcmVuWyAwIF0uZ2V0VW5pcXVlVHJhaWwoKSwgdHJ1ZSApLFxuICAgIG5ldyBUcmFpbFBvaW50ZXIoIG5vZGUuY2hpbGRyZW5bIDAgXS5jaGlsZHJlblsgMyBdLmNoaWxkcmVuWyAwIF0uY2hpbGRyZW5bIDAgXS5nZXRVbmlxdWVUcmFpbCgpLCBmYWxzZSApLFxuICAgIG5ldyBUcmFpbFBvaW50ZXIoIG5vZGUuY2hpbGRyZW5bIDAgXS5jaGlsZHJlblsgMyBdLmNoaWxkcmVuWyAwIF0uZ2V0VW5pcXVlVHJhaWwoKSwgZmFsc2UgKSxcbiAgICBuZXcgVHJhaWxQb2ludGVyKCBub2RlLmNoaWxkcmVuWyAwIF0uY2hpbGRyZW5bIDMgXS5jaGlsZHJlblsgMSBdLmdldFVuaXF1ZVRyYWlsKCksIHRydWUgKSxcbiAgICBuZXcgVHJhaWxQb2ludGVyKCBub2RlLmNoaWxkcmVuWyAwIF0uY2hpbGRyZW5bIDMgXS5jaGlsZHJlblsgMSBdLmdldFVuaXF1ZVRyYWlsKCksIGZhbHNlICksXG4gICAgbmV3IFRyYWlsUG9pbnRlciggbm9kZS5jaGlsZHJlblsgMCBdLmNoaWxkcmVuWyAzIF0uZ2V0VW5pcXVlVHJhaWwoKSwgZmFsc2UgKSxcbiAgICBuZXcgVHJhaWxQb2ludGVyKCBub2RlLmNoaWxkcmVuWyAwIF0uY2hpbGRyZW5bIDQgXS5nZXRVbmlxdWVUcmFpbCgpLCB0cnVlICksXG4gICAgbmV3IFRyYWlsUG9pbnRlciggbm9kZS5jaGlsZHJlblsgMCBdLmNoaWxkcmVuWyA0IF0uZ2V0VW5pcXVlVHJhaWwoKSwgZmFsc2UgKSxcbiAgICBuZXcgVHJhaWxQb2ludGVyKCBub2RlLmNoaWxkcmVuWyAwIF0uZ2V0VW5pcXVlVHJhaWwoKSwgZmFsc2UgKSxcbiAgICBuZXcgVHJhaWxQb2ludGVyKCBub2RlLmNoaWxkcmVuWyAxIF0uZ2V0VW5pcXVlVHJhaWwoKSwgdHJ1ZSApLFxuICAgIG5ldyBUcmFpbFBvaW50ZXIoIG5vZGUuY2hpbGRyZW5bIDEgXS5nZXRVbmlxdWVUcmFpbCgpLCBmYWxzZSApLFxuICAgIG5ldyBUcmFpbFBvaW50ZXIoIG5vZGUuY2hpbGRyZW5bIDIgXS5nZXRVbmlxdWVUcmFpbCgpLCB0cnVlICksXG4gICAgbmV3IFRyYWlsUG9pbnRlciggbm9kZS5jaGlsZHJlblsgMiBdLmdldFVuaXF1ZVRyYWlsKCksIGZhbHNlICksXG4gICAgbmV3IFRyYWlsUG9pbnRlciggbm9kZS5nZXRVbmlxdWVUcmFpbCgpLCBmYWxzZSApXG4gIF07XG5cbiAgLy8gZXhoYXVzdGl2ZWx5IHZlcmlmeSB0aGUgb3JkZXJpbmcgYmV0d2VlbiBlYWNoIG9yZGVyZWQgcGFpclxuICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBwb2ludGVycy5sZW5ndGg7IGkrKyApIHtcbiAgICBmb3IgKCBsZXQgaiA9IGk7IGogPCBwb2ludGVycy5sZW5ndGg7IGorKyApIHtcbiAgICAgIGNvbnN0IGNvbXBhcmlzb24gPSBwb2ludGVyc1sgaSBdLmNvbXBhcmVOZXN0ZWQoIHBvaW50ZXJzWyBqIF0gKTtcblxuICAgICAgLy8gbWFrZSBzdXJlIHRoYXQgZXZlcnkgcG9pbnRlciBjb21wYXJlcyBhcyBleHBlY3RlZCAoMCBhbmQgdGhleSBhcmUgZXF1YWwsIC0xIGFuZCBpIDwgailcbiAgICAgIGFzc2VydC5lcXVhbCggY29tcGFyaXNvbiwgaSA9PT0gaiA/IDAgOiAoIGkgPCBqID8gLTEgOiAxICksIGBjb21wYXJlTmVzdGVkOiAke2l9LCR7an1gICk7XG4gICAgfVxuICB9XG5cbiAgLy8gdmVyaWZ5IGZvcndhcmRzIGFuZCBiYWNrd2FyZHMsIGFzIHdlbGwgYXMgY29weSBjb25zdHJ1Y3RvcnNcbiAgZm9yICggbGV0IGkgPSAxOyBpIDwgcG9pbnRlcnMubGVuZ3RoOyBpKysgKSB7XG4gICAgY29uc3QgYSA9IHBvaW50ZXJzWyBpIC0gMSBdO1xuICAgIGNvbnN0IGIgPSBwb2ludGVyc1sgaSBdO1xuXG4gICAgY29uc3QgZm9yd2FyZHNDb3B5ID0gYS5jb3B5KCk7XG4gICAgZm9yd2FyZHNDb3B5Lm5lc3RlZEZvcndhcmRzKCk7XG4gICAgYXNzZXJ0LmVxdWFsKCBmb3J3YXJkc0NvcHkuY29tcGFyZU5lc3RlZCggYiApLCAwLCBgZm9yd2FyZHNQb2ludGVyQ2hlY2sgJHtpIC0gMX0gdG8gJHtpfWAgKTtcblxuICAgIGNvbnN0IGJhY2t3YXJkc0NvcHkgPSBiLmNvcHkoKTtcbiAgICBiYWNrd2FyZHNDb3B5Lm5lc3RlZEJhY2t3YXJkcygpO1xuICAgIGFzc2VydC5lcXVhbCggYmFja3dhcmRzQ29weS5jb21wYXJlTmVzdGVkKCBhICksIDAsIGBiYWNrd2FyZHNQb2ludGVyQ2hlY2sgJHtpfSB0byAke2kgLSAxfWAgKTtcbiAgfVxuXG4gIC8vIGV4aGF1c3RpdmVseSBjaGVjayBkZXB0aEZpcnN0VW50aWwgaW5jbHVzaXZlXG4gIGZvciAoIGxldCBpID0gMDsgaSA8IHBvaW50ZXJzLmxlbmd0aDsgaSsrICkge1xuICAgIGZvciAoIGxldCBqID0gaSArIDE7IGogPCBwb2ludGVycy5sZW5ndGg7IGorKyApIHtcbiAgICAgIC8vIGkgPCBqIGd1YXJhbnRlZWRcbiAgICAgIGNvbnN0IGNvbnRlbnRzID0gW107XG4gICAgICBwb2ludGVyc1sgaSBdLmRlcHRoRmlyc3RVbnRpbCggcG9pbnRlcnNbIGogXSwgcG9pbnRlciA9PiB7IGNvbnRlbnRzLnB1c2goIHBvaW50ZXIuY29weSgpICk7IH0sIGZhbHNlICk7XG4gICAgICBhc3NlcnQuZXF1YWwoIGNvbnRlbnRzLmxlbmd0aCwgaiAtIGkgKyAxLCBgZGVwdGhGaXJzdFVudGlsIGluY2x1c2l2ZSAke2l9LCR7an0gY291bnQgY2hlY2tgICk7XG5cbiAgICAgIC8vIGRvIGFuIGFjdHVhbCBwb2ludGVyIHRvIHBvaW50ZXIgY29tcGFyaXNvblxuICAgICAgbGV0IGlzT2sgPSB0cnVlO1xuICAgICAgZm9yICggbGV0IGsgPSAwOyBrIDwgY29udGVudHMubGVuZ3RoOyBrKysgKSB7XG4gICAgICAgIGNvbnN0IGNvbXBhcmlzb24gPSBjb250ZW50c1sgayBdLmNvbXBhcmVOZXN0ZWQoIHBvaW50ZXJzWyBpICsgayBdICk7XG4gICAgICAgIGlmICggY29tcGFyaXNvbiAhPT0gMCApIHtcbiAgICAgICAgICBhc3NlcnQuZXF1YWwoIGNvbXBhcmlzb24sIDAsIGBkZXB0aEZpcnN0VW50aWwgaW5jbHVzaXZlICR7aX0sJHtqfSwke2t9IGNvbXBhcmlzb24gY2hlY2sgJHtjb250ZW50c1sgayBdLnRyYWlsLmluZGljZXMuam9pbigpfSAtICR7cG9pbnRlcnNbIGkgKyBrIF0udHJhaWwuaW5kaWNlcy5qb2luKCl9YCApO1xuICAgICAgICAgIGlzT2sgPSBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgYXNzZXJ0Lm9rKCBpc09rLCBgZGVwdGhGaXJzdFVudGlsIGluY2x1c2l2ZSAke2l9LCR7an0gY29tcGFyaXNvbiBjaGVja2AgKTtcbiAgICB9XG4gIH1cblxuICAvLyBleGhhdXN0aXZlbHkgY2hlY2sgZGVwdGhGaXJzdFVudGlsIGV4Y2x1c2l2ZVxuICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBwb2ludGVycy5sZW5ndGg7IGkrKyApIHtcbiAgICBmb3IgKCBsZXQgaiA9IGkgKyAxOyBqIDwgcG9pbnRlcnMubGVuZ3RoOyBqKysgKSB7XG4gICAgICAvLyBpIDwgaiBndWFyYW50ZWVkXG4gICAgICBjb25zdCBjb250ZW50cyA9IFtdO1xuICAgICAgcG9pbnRlcnNbIGkgXS5kZXB0aEZpcnN0VW50aWwoIHBvaW50ZXJzWyBqIF0sIHBvaW50ZXIgPT4geyBjb250ZW50cy5wdXNoKCBwb2ludGVyLmNvcHkoKSApOyB9LCB0cnVlICk7XG4gICAgICBhc3NlcnQuZXF1YWwoIGNvbnRlbnRzLmxlbmd0aCwgaiAtIGkgLSAxLCBgZGVwdGhGaXJzdFVudGlsIGV4Y2x1c2l2ZSAke2l9LCR7an0gY291bnQgY2hlY2tgICk7XG5cbiAgICAgIC8vIGRvIGFuIGFjdHVhbCBwb2ludGVyIHRvIHBvaW50ZXIgY29tcGFyaXNvblxuICAgICAgbGV0IGlzT2sgPSB0cnVlO1xuICAgICAgZm9yICggbGV0IGsgPSAwOyBrIDwgY29udGVudHMubGVuZ3RoOyBrKysgKSB7XG4gICAgICAgIGNvbnN0IGNvbXBhcmlzb24gPSBjb250ZW50c1sgayBdLmNvbXBhcmVOZXN0ZWQoIHBvaW50ZXJzWyBpICsgayArIDEgXSApO1xuICAgICAgICBpZiAoIGNvbXBhcmlzb24gIT09IDAgKSB7XG4gICAgICAgICAgYXNzZXJ0LmVxdWFsKCBjb21wYXJpc29uLCAwLCBgZGVwdGhGaXJzdFVudGlsIGV4Y2x1c2l2ZSAke2l9LCR7an0sJHtrfSBjb21wYXJpc29uIGNoZWNrICR7Y29udGVudHNbIGsgXS50cmFpbC5pbmRpY2VzLmpvaW4oKX0gLSAke3BvaW50ZXJzWyBpICsgayBdLnRyYWlsLmluZGljZXMuam9pbigpfWAgKTtcbiAgICAgICAgICBpc09rID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGFzc2VydC5vayggaXNPaywgYGRlcHRoRmlyc3RVbnRpbCBleGNsdXNpdmUgJHtpfSwke2p9IGNvbXBhcmlzb24gY2hlY2tgICk7XG4gICAgfVxuICB9XG59ICk7XG5cbi8vIFFVbml0LnRlc3QoICdUcmFpbEludGVydmFsJywgZnVuY3Rpb24oYXNzZXJ0KSB7XG4vLyAgIGxldCBub2RlID0gY3JlYXRlVGVzdE5vZGVUcmVlKCk7XG4vLyAgIGxldCBpLCBqO1xuXG4vLyAgIC8vIGEgc3Vic2V0IG9mIHRyYWlscyB0byB0ZXN0IG9uXG4vLyAgIGxldCB0cmFpbHMgPSBbXG4vLyAgICAgbnVsbCxcbi8vICAgICBub2RlLmNoaWxkcmVuWzBdLmdldFVuaXF1ZVRyYWlsKCksXG4vLyAgICAgbm9kZS5jaGlsZHJlblswXS5jaGlsZHJlblsxXS5nZXRVbmlxdWVUcmFpbCgpLCAvLyBjb21tZW50ZWQgb3V0IHNpbmNlIGl0IHF1aWNrbHkgY3JlYXRlcyBtYW55IHRlc3RzIHRvIGluY2x1ZGVcbi8vICAgICBub2RlLmNoaWxkcmVuWzBdLmNoaWxkcmVuWzNdLmNoaWxkcmVuWzBdLmdldFVuaXF1ZVRyYWlsKCksXG4vLyAgICAgbm9kZS5jaGlsZHJlblsxXS5nZXRVbmlxdWVUcmFpbCgpLFxuLy8gICAgIG51bGxcbi8vICAgXTtcblxuLy8gICAvLyBnZXQgYSBsaXN0IG9mIGFsbCB0cmFpbHNcbi8vICAgbGV0IGFsbFRyYWlscyA9IFtdO1xuLy8gICBsZXQgdCA9IG5vZGUuZ2V0VW5pcXVlVHJhaWwoKTtcbi8vICAgd2hpbGUgKCB0ICkge1xuLy8gICAgIGFsbFRyYWlscy5wdXNoKCB0ICk7XG4vLyAgICAgdCA9IHQubmV4dCgpO1xuLy8gICB9XG5cbi8vICAgLy8gZ2V0IGEgbGlzdCBvZiBhbGwgaW50ZXJ2YWxzIHVzaW5nIG91ciAndHJhaWxzJyBhcnJheVxuLy8gICBsZXQgaW50ZXJ2YWxzID0gW107XG5cbi8vICAgZm9yICggaSA9IDA7IGkgPCB0cmFpbHMubGVuZ3RoOyBpKysgKSB7XG4vLyAgICAgLy8gb25seSBjcmVhdGUgcHJvcGVyIGludGVydmFscyB3aGVyZSBpIDwgaiwgc2luY2Ugd2Ugc3BlY2lmaWVkIHRoZW0gaW4gb3JkZXJcbi8vICAgICBmb3IgKCBqID0gaSArIDE7IGogPCB0cmFpbHMubGVuZ3RoOyBqKysgKSB7XG4vLyAgICAgICBsZXQgaW50ZXJ2YWwgPSBuZXcgVHJhaWxJbnRlcnZhbCggdHJhaWxzW2ldLCB0cmFpbHNbal0gKTtcbi8vICAgICAgIGludGVydmFscy5wdXNoKCBpbnRlcnZhbCApO1xuXG4vLyAgICAgICAvLyB0YWcgdGhlIGludGVydmFsLCBzbyB3ZSBjYW4gZG8gYWRkaXRpb25hbCB2ZXJpZmljYXRpb24gbGF0ZXJcbi8vICAgICAgIGludGVydmFsLmkgPSBpO1xuLy8gICAgICAgaW50ZXJ2YWwuaiA9IGo7XG4vLyAgICAgfVxuLy8gICB9XG5cbi8vICAgLy8gY2hlY2sgZXZlcnkgY29tYmluYXRpb24gb2YgaW50ZXJ2YWxzXG4vLyAgIGZvciAoIGkgPSAwOyBpIDwgaW50ZXJ2YWxzLmxlbmd0aDsgaSsrICkge1xuLy8gICAgIGxldCBhID0gaW50ZXJ2YWxzW2ldO1xuLy8gICAgIGZvciAoIGogPSAwOyBqIDwgaW50ZXJ2YWxzLmxlbmd0aDsgaisrICkge1xuLy8gICAgICAgbGV0IGIgPSBpbnRlcnZhbHNbal07XG5cbi8vICAgICAgIGxldCB1bmlvbiA9IGEudW5pb24oIGIgKTtcbi8vICAgICAgIGlmICggYS5leGNsdXNpdmVVbmlvbmFibGUoIGIgKSApIHtcbi8vICAgICAgICAgXy5lYWNoKCBhbGxUcmFpbHMsIGZ1bmN0aW9uKCB0cmFpbCApIHtcbi8vICAgICAgICAgICBpZiAoIHRyYWlsICkge1xuLy8gICAgICAgICAgICAgbGV0IG1zZyA9ICd1bmlvbiBjaGVjayBvZiB0cmFpbCAnICsgdHJhaWwudG9TdHJpbmcoKSArICcgd2l0aCAnICsgYS50b1N0cmluZygpICsgJyBhbmQgJyArIGIudG9TdHJpbmcoKSArICcgd2l0aCB1bmlvbiAnICsgdW5pb24udG9TdHJpbmcoKTtcbi8vICAgICAgICAgICAgYXNzZXJ0LmVxdWFsKCBhLmV4Y2x1c2l2ZUNvbnRhaW5zKCB0cmFpbCApIHx8IGIuZXhjbHVzaXZlQ29udGFpbnMoIHRyYWlsICksIHVuaW9uLmV4Y2x1c2l2ZUNvbnRhaW5zKCB0cmFpbCApLCBtc2cgKTtcbi8vICAgICAgICAgICB9XG4vLyAgICAgICAgIH0gKTtcbi8vICAgICAgIH0gZWxzZSB7XG4vLyAgICAgICAgIGxldCB3b3VsZEJlQmFkVW5pb24gPSBmYWxzZTtcbi8vICAgICAgICAgbGV0IGNvbnRhaW5zQW55dGhpbmcgPSBmYWxzZTtcbi8vICAgICAgICAgXy5lYWNoKCBhbGxUcmFpbHMsIGZ1bmN0aW9uKCB0cmFpbCApIHtcbi8vICAgICAgICAgICBpZiAoIHRyYWlsICkge1xuLy8gICAgICAgICAgICAgaWYgKCB1bmlvbi5leGNsdXNpdmVDb250YWlucyggdHJhaWwgKSApIHtcbi8vICAgICAgICAgICAgICAgY29udGFpbnNBbnl0aGluZyA9IHRydWU7XG4vLyAgICAgICAgICAgICAgIGlmICggIWEuZXhjbHVzaXZlQ29udGFpbnMoIHRyYWlsICkgJiYgIWIuZXhjbHVzaXZlQ29udGFpbnMoIHRyYWlsICkgKSB7XG4vLyAgICAgICAgICAgICAgICAgd291bGRCZUJhZFVuaW9uID0gdHJ1ZTtcbi8vICAgICAgICAgICAgICAgfVxuLy8gICAgICAgICAgICAgfVxuLy8gICAgICAgICAgIH1cbi8vICAgICAgICAgfSApO1xuLy8gICAgICAgICBhc3NlcnQub2soIGNvbnRhaW5zQW55dGhpbmcgJiYgd291bGRCZUJhZFVuaW9uLCAnTm90IGEgYmFkIHVuaW9uPzogJyArIGEudG9TdHJpbmcoKSArICcgYW5kICcgKyBiLnRvU3RyaW5nKCkgKyAnIHdpdGggdW5pb24gJyArIHVuaW9uLnRvU3RyaW5nKCkgKTtcbi8vICAgICAgIH1cbi8vICAgICB9XG4vLyAgIH1cbi8vIH0gKTtcblxuUVVuaXQudGVzdCggJ1RleHQgd2lkdGggbWVhc3VyZW1lbnQgaW4gY2FudmFzJywgYXNzZXJ0ID0+IHtcbiAgY29uc3QgY2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCggJ2NhbnZhcycgKTtcbiAgY29uc3QgY29udGV4dCA9IGNhbnZhcy5nZXRDb250ZXh0KCAnMmQnICk7XG4gIGNvbnN0IG1ldHJpY3MgPSBjb250ZXh0Lm1lYXN1cmVUZXh0KCAnSGVsbG8gV29ybGQnICk7XG4gIGFzc2VydC5vayggbWV0cmljcy53aWR0aCwgJ21ldHJpY3Mud2lkdGgnICk7XG59ICk7XG5cblFVbml0LnRlc3QoICdTY2VuZWxlc3Mgbm9kZSBoYW5kbGluZycsIGFzc2VydCA9PiB7XG4gIGNvbnN0IGEgPSBuZXcgUGF0aCggbnVsbCApO1xuICBjb25zdCBiID0gbmV3IFBhdGgoIG51bGwgKTtcbiAgY29uc3QgYyA9IG5ldyBQYXRoKCBudWxsICk7XG5cbiAgYS5zZXRTaGFwZSggU2hhcGUucmVjdGFuZ2xlKCAwLCAwLCAyMCwgMjAgKSApO1xuICBjLnNldFNoYXBlKCBTaGFwZS5yZWN0YW5nbGUoIDEwLCAxMCwgMzAsIDMwICkgKTtcblxuICBhLmFkZENoaWxkKCBiICk7XG4gIGIuYWRkQ2hpbGQoIGMgKTtcblxuICBhLnZhbGlkYXRlQm91bmRzKCk7XG5cbiAgYS5yZW1vdmVDaGlsZCggYiApO1xuICBjLmFkZENoaWxkKCBhICk7XG5cbiAgYi52YWxpZGF0ZUJvdW5kcygpO1xuXG4gIGFzc2VydC5vayggdHJ1ZSwgJ3NvIHdlIGhhdmUgYXQgbGVhc3QgMSB0ZXN0IGluIHRoaXMgc2V0JyApO1xufSApO1xuXG5RVW5pdC50ZXN0KCAnQ29ycmVjdCBib3VuZHMgb24gcmVjdGFuZ2xlJywgYXNzZXJ0ID0+IHtcbiAgY29uc3QgcmVjdEJvdW5kcyA9IFV0aWxzLmNhbnZhc0FjY3VyYXRlQm91bmRzKCBjb250ZXh0ID0+IHsgY29udGV4dC5maWxsUmVjdCggMTAwLCAxMDAsIDIwMCwgMjAwICk7IH0gKTtcbiAgYXNzZXJ0Lm9rKCBNYXRoLmFicyggcmVjdEJvdW5kcy5taW5YIC0gMTAwICkgPCAwLjAxLCByZWN0Qm91bmRzLm1pblggKTtcbiAgYXNzZXJ0Lm9rKCBNYXRoLmFicyggcmVjdEJvdW5kcy5taW5ZIC0gMTAwICkgPCAwLjAxLCByZWN0Qm91bmRzLm1pblkgKTtcbiAgYXNzZXJ0Lm9rKCBNYXRoLmFicyggcmVjdEJvdW5kcy5tYXhYIC0gMzAwICkgPCAwLjAxLCByZWN0Qm91bmRzLm1heFggKTtcbiAgYXNzZXJ0Lm9rKCBNYXRoLmFicyggcmVjdEJvdW5kcy5tYXhZIC0gMzAwICkgPCAwLjAxLCByZWN0Qm91bmRzLm1heFkgKTtcbn0gKTtcblxuUVVuaXQudGVzdCggJ0NvbnNpc3RlbnQgYW5kIHByZWNpc2UgYm91bmRzIHJhbmdlIG9uIFRleHQnLCBhc3NlcnQgPT4ge1xuICBjb25zdCB0ZXh0Qm91bmRzID0gVXRpbHMuY2FudmFzQWNjdXJhdGVCb3VuZHMoIGNvbnRleHQgPT4geyBjb250ZXh0LmZpbGxUZXh0KCAndGVzdCBzdHJpbmcnLCAwLCAwICk7IH0gKTtcbiAgYXNzZXJ0Lm9rKCB0ZXh0Qm91bmRzLmlzQ29uc2lzdGVudCwgdGV4dEJvdW5kcy50b1N0cmluZygpICk7XG5cbiAgLy8gcHJlY2lzaW9uIG9mIDAuMDAxIChvciBsb3dlciBnaXZlbiBkaWZmZXJlbnQgcGFyYW1ldGVycykgaXMgcG9zc2libGUgb24gbm9uLUNob21lIGJyb3dzZXJzIChGaXJlZm94LCBJRTksIE9wZXJhKVxuICBhc3NlcnQub2soIHRleHRCb3VuZHMucHJlY2lzaW9uIDwgMC4xNSwgYHByZWNpc2lvbjogJHt0ZXh0Qm91bmRzLnByZWNpc2lvbn1gICk7XG59ICk7XG5cblFVbml0LnRlc3QoICdDb25zaXN0ZW50IGFuZCBwcmVjaXNlIGJvdW5kcyByYW5nZSBvbiBUZXh0JywgYXNzZXJ0ID0+IHtcbiAgY29uc3QgdGV4dCA9IG5ldyBUZXh0KCAnMFxcdTA0ODknICk7XG4gIGNvbnN0IHRleHRCb3VuZHMgPSBUZXh0Qm91bmRzLmFjY3VyYXRlQ2FudmFzQm91bmRzRmFsbGJhY2soIHRleHQgKTtcbiAgYXNzZXJ0Lm9rKCB0ZXh0Qm91bmRzLmlzQ29uc2lzdGVudCwgdGV4dEJvdW5kcy50b1N0cmluZygpICk7XG5cbiAgLy8gcHJlY2lzaW9uIG9mIDAuMDAxIChvciBsb3dlciBnaXZlbiBkaWZmZXJlbnQgcGFyYW1ldGVycykgaXMgcG9zc2libGUgb24gbm9uLUNob21lIGJyb3dzZXJzIChGaXJlZm94LCBJRTksIE9wZXJhKVxuICBhc3NlcnQub2soIHRleHRCb3VuZHMucHJlY2lzaW9uIDwgMSwgYHByZWNpc2lvbjogJHt0ZXh0Qm91bmRzLnByZWNpc2lvbn1gICk7XG59ICk7XG5cblFVbml0LnRlc3QoICdFUzUgU2V0dGVyIC8gR2V0dGVyIHRlc3RzJywgYXNzZXJ0ID0+IHtcbiAgY29uc3Qgbm9kZSA9IG5ldyBQYXRoKCBudWxsICk7XG4gIGNvbnN0IGZpbGwgPSAnI2FiY2RlZic7XG4gIG5vZGUuZmlsbCA9IGZpbGw7XG4gIGFzc2VydC5lcXVhbCggbm9kZS5maWxsLCBmaWxsICk7XG4gIGFzc2VydC5lcXVhbCggbm9kZS5nZXRGaWxsKCksIGZpbGwgKTtcblxuICBjb25zdCBvdGhlck5vZGUgPSBuZXcgUGF0aCggU2hhcGUucmVjdGFuZ2xlKCAwLCAwLCAxMCwgMTAgKSwgeyBmaWxsOiBmaWxsIH0gKTtcblxuICBhc3NlcnQuZXF1YWwoIG90aGVyTm9kZS5maWxsLCBmaWxsICk7XG59ICk7XG5cblFVbml0LnRlc3QoICdQaWNjb2xvLWxpa2UgYmVoYXZpb3InLCBhc3NlcnQgPT4ge1xuICBjb25zdCBub2RlID0gbmV3IE5vZGUoKTtcblxuICBub2RlLnNjYWxlKCAyICk7XG4gIG5vZGUudHJhbnNsYXRlKCAxLCAzICk7XG4gIG5vZGUucm90YXRlKCBNYXRoLlBJIC8gMiApO1xuICBub2RlLnRyYW5zbGF0ZSggLTMxLCAyMSApO1xuXG4gIGVxdWFsc0FwcHJveCggYXNzZXJ0LCBub2RlLmdldE1hdHJpeCgpLm0wMCgpLCAwICk7XG4gIGVxdWFsc0FwcHJveCggYXNzZXJ0LCBub2RlLmdldE1hdHJpeCgpLm0wMSgpLCAtMiApO1xuICBlcXVhbHNBcHByb3goIGFzc2VydCwgbm9kZS5nZXRNYXRyaXgoKS5tMDIoKSwgLTQwICk7XG4gIGVxdWFsc0FwcHJveCggYXNzZXJ0LCBub2RlLmdldE1hdHJpeCgpLm0xMCgpLCAyICk7XG4gIGVxdWFsc0FwcHJveCggYXNzZXJ0LCBub2RlLmdldE1hdHJpeCgpLm0xMSgpLCAwICk7XG4gIGVxdWFsc0FwcHJveCggYXNzZXJ0LCBub2RlLmdldE1hdHJpeCgpLm0xMigpLCAtNTYgKTtcblxuICBlcXVhbHNBcHByb3goIGFzc2VydCwgbm9kZS54LCAtNDAgKTtcbiAgZXF1YWxzQXBwcm94KCBhc3NlcnQsIG5vZGUueSwgLTU2ICk7XG4gIGVxdWFsc0FwcHJveCggYXNzZXJ0LCBub2RlLnJvdGF0aW9uLCBNYXRoLlBJIC8gMiApO1xuXG4gIG5vZGUudHJhbnNsYXRpb24gPSBuZXcgVmVjdG9yMiggLTUsIDcgKTtcblxuICBlcXVhbHNBcHByb3goIGFzc2VydCwgbm9kZS5nZXRNYXRyaXgoKS5tMDIoKSwgLTUgKTtcbiAgZXF1YWxzQXBwcm94KCBhc3NlcnQsIG5vZGUuZ2V0TWF0cml4KCkubTEyKCksIDcgKTtcblxuICBub2RlLnJvdGF0aW9uID0gMS4yO1xuXG4gIGVxdWFsc0FwcHJveCggYXNzZXJ0LCBub2RlLmdldE1hdHJpeCgpLm0wMSgpLCAtMS44NjQwNzgxNzE5MzQ0NTMgKTtcblxuICBub2RlLnJvdGF0aW9uID0gLTAuNztcblxuICBlcXVhbHNBcHByb3goIGFzc2VydCwgbm9kZS5nZXRNYXRyaXgoKS5tMTAoKSwgLTEuMjg4NDM1Mzc0NDc1MzgyICk7XG59ICk7XG5cblFVbml0LnRlc3QoICdTZXR0aW5nIGxlZnQvcmlnaHQgb2Ygbm9kZScsIGFzc2VydCA9PiB7XG4gIGNvbnN0IG5vZGUgPSBuZXcgUGF0aCggU2hhcGUucmVjdGFuZ2xlKCAtMjAsIC0yMCwgNTAsIDUwICksIHtcbiAgICBzY2FsZTogMlxuICB9ICk7XG5cbiAgZXF1YWxzQXBwcm94KCBhc3NlcnQsIG5vZGUubGVmdCwgLTQwICk7XG4gIGVxdWFsc0FwcHJveCggYXNzZXJ0LCBub2RlLnJpZ2h0LCA2MCApO1xuXG4gIG5vZGUubGVmdCA9IDEwO1xuICBlcXVhbHNBcHByb3goIGFzc2VydCwgbm9kZS5sZWZ0LCAxMCApO1xuICBlcXVhbHNBcHByb3goIGFzc2VydCwgbm9kZS5yaWdodCwgMTEwICk7XG5cbiAgbm9kZS5yaWdodCA9IDEwO1xuICBlcXVhbHNBcHByb3goIGFzc2VydCwgbm9kZS5sZWZ0LCAtOTAgKTtcbiAgZXF1YWxzQXBwcm94KCBhc3NlcnQsIG5vZGUucmlnaHQsIDEwICk7XG5cbiAgbm9kZS5jZW50ZXJYID0gNTtcbiAgZXF1YWxzQXBwcm94KCBhc3NlcnQsIG5vZGUuY2VudGVyWCwgNSApO1xuICBlcXVhbHNBcHByb3goIGFzc2VydCwgbm9kZS5sZWZ0LCAtNDUgKTtcbiAgZXF1YWxzQXBwcm94KCBhc3NlcnQsIG5vZGUucmlnaHQsIDU1ICk7XG59ICk7XG5cblFVbml0LnRlc3QoICdQYXRoIHdpdGggZW1wdHkgc2hhcGUnLCBhc3NlcnQgPT4ge1xuICBjb25zdCBzY2VuZSA9IG5ldyBOb2RlKCk7XG4gIGNvbnN0IG5vZGUgPSBuZXcgUGF0aCggbmV3IFNoYXBlKCkgKTtcbiAgc2NlbmUuYWRkQ2hpbGQoIG5vZGUgKTtcbiAgYXNzZXJ0Lm9rKCB0cnVlLCAnc28gd2UgaGF2ZSBhdCBsZWFzdCAxIHRlc3QgaW4gdGhpcyBzZXQnICk7XG59ICk7XG5cblFVbml0LnRlc3QoICdQYXRoIHdpdGggbnVsbCBzaGFwZScsIGFzc2VydCA9PiB7XG4gIGNvbnN0IHNjZW5lID0gbmV3IE5vZGUoKTtcbiAgY29uc3Qgbm9kZSA9IG5ldyBQYXRoKCBudWxsICk7XG4gIHNjZW5lLmFkZENoaWxkKCBub2RlICk7XG4gIGFzc2VydC5vayggdHJ1ZSwgJ3NvIHdlIGhhdmUgYXQgbGVhc3QgMSB0ZXN0IGluIHRoaXMgc2V0JyApO1xufSApO1xuXG5RVW5pdC50ZXN0KCAnRGlzcGxheSByZXNpemUgZXZlbnQnLCBhc3NlcnQgPT4ge1xuICBjb25zdCBzY2VuZSA9IG5ldyBOb2RlKCk7XG4gIGNvbnN0IGRpc3BsYXkgPSBuZXcgRGlzcGxheSggc2NlbmUgKTtcblxuICBsZXQgd2lkdGg7XG4gIGxldCBoZWlnaHQ7XG4gIGxldCBjb3VudCA9IDA7XG5cbiAgZGlzcGxheS5zaXplUHJvcGVydHkubGF6eUxpbmsoIHNpemUgPT4ge1xuICAgIHdpZHRoID0gc2l6ZS53aWR0aDtcbiAgICBoZWlnaHQgPSBzaXplLmhlaWdodDtcbiAgICBjb3VudCsrO1xuICB9ICk7XG5cbiAgZGlzcGxheS5zZXRXaWR0aEhlaWdodCggNzEyLCAyMTcgKTtcblxuICBhc3NlcnQuZXF1YWwoIHdpZHRoLCA3MTIsICdTY2VuZSByZXNpemUgd2lkdGgnICk7XG4gIGFzc2VydC5lcXVhbCggaGVpZ2h0LCAyMTcsICdTY2VuZSByZXNpemUgaGVpZ2h0JyApO1xuICBhc3NlcnQuZXF1YWwoIGNvdW50LCAxLCAnU2NlbmUgcmVzaXplIGNvdW50JyApO1xufSApO1xuXG5RVW5pdC50ZXN0KCAnQm91bmRzIGV2ZW50cycsIGFzc2VydCA9PiB7XG4gIGNvbnN0IG5vZGUgPSBuZXcgTm9kZSgpO1xuICBub2RlLnkgPSAxMDtcblxuICBjb25zdCByZWN0ID0gbmV3IFJlY3RhbmdsZSggMCwgMCwgMTAwLCA1MCwgeyBmaWxsOiAnI2YwMCcgfSApO1xuICByZWN0LnggPSAxMDsgLy8gYSB0cmFuc2Zvcm0sIHNvIHdlIGNhbiB2ZXJpZnkgZXZlcnl0aGluZyBpcyBoYW5kbGVkIGNvcnJlY3RseVxuICBub2RlLmFkZENoaWxkKCByZWN0ICk7XG5cbiAgbm9kZS52YWxpZGF0ZUJvdW5kcygpO1xuXG4gIGNvbnN0IGVwc2lsb24gPSAwLjAwMDAwMDE7XG5cbiAgbm9kZS5jaGlsZEJvdW5kc1Byb3BlcnR5LmxhenlMaW5rKCAoKSA9PiB7XG4gICAgYXNzZXJ0Lm9rKCBub2RlLmNoaWxkQm91bmRzLmVxdWFsc0Vwc2lsb24oIG5ldyBCb3VuZHMyKCAxMCwgMCwgMTEwLCAzMCApLCBlcHNpbG9uICksIGBQYXJlbnQgY2hpbGQgYm91bmRzIGNoZWNrOiAke25vZGUuY2hpbGRCb3VuZHMudG9TdHJpbmcoKX1gICk7XG4gIH0gKTtcblxuICBub2RlLmJvdW5kc1Byb3BlcnR5LmxhenlMaW5rKCAoKSA9PiB7XG4gICAgYXNzZXJ0Lm9rKCBub2RlLmJvdW5kcy5lcXVhbHNFcHNpbG9uKCBuZXcgQm91bmRzMiggMTAsIDEwLCAxMTAsIDQwICksIGVwc2lsb24gKSwgYFBhcmVudCBib3VuZHMgY2hlY2s6ICR7bm9kZS5ib3VuZHMudG9TdHJpbmcoKX1gICk7XG4gIH0gKTtcblxuICBub2RlLnNlbGZCb3VuZHNQcm9wZXJ0eS5sYXp5TGluayggKCkgPT4ge1xuICAgIGFzc2VydC5vayggZmFsc2UsICdTZWxmIGJvdW5kcyBzaG91bGQgbm90IGNoYW5nZSBmb3IgcGFyZW50IG5vZGUnICk7XG4gIH0gKTtcblxuICByZWN0LnNlbGZCb3VuZHNQcm9wZXJ0eS5sYXp5TGluayggKCkgPT4ge1xuICAgIGFzc2VydC5vayggcmVjdC5zZWxmQm91bmRzLmVxdWFsc0Vwc2lsb24oIG5ldyBCb3VuZHMyKCAwLCAwLCAxMDAsIDMwICksIGVwc2lsb24gKSwgYFNlbGYgYm91bmRzIGNoZWNrOiAke3JlY3Quc2VsZkJvdW5kcy50b1N0cmluZygpfWAgKTtcbiAgfSApO1xuXG4gIHJlY3QuYm91bmRzUHJvcGVydHkubGF6eUxpbmsoICgpID0+IHtcbiAgICBhc3NlcnQub2soIHJlY3QuYm91bmRzLmVxdWFsc0Vwc2lsb24oIG5ldyBCb3VuZHMyKCAxMCwgMCwgMTEwLCAzMCApLCBlcHNpbG9uICksIGBCb3VuZHMgY2hlY2s6ICR7cmVjdC5ib3VuZHMudG9TdHJpbmcoKX1gICk7XG4gIH0gKTtcblxuICByZWN0LmNoaWxkQm91bmRzUHJvcGVydHkubGF6eUxpbmsoICgpID0+IHtcbiAgICBhc3NlcnQub2soIGZhbHNlLCAnQ2hpbGQgYm91bmRzIHNob3VsZCBub3QgY2hhbmdlIGZvciBsZWFmIG5vZGUnICk7XG4gIH0gKTtcblxuICByZWN0LnJlY3RIZWlnaHQgPSAzMDtcbiAgbm9kZS52YWxpZGF0ZUJvdW5kcygpO1xufSApO1xuXG5RVW5pdC50ZXN0KCAnVXNpbmcgYSBjb2xvciBpbnN0YW5jZScsIGFzc2VydCA9PiB7XG4gIGNvbnN0IHNjZW5lID0gbmV3IE5vZGUoKTtcblxuICBjb25zdCByZWN0ID0gbmV3IFJlY3RhbmdsZSggMCwgMCwgMTAwLCA1MCApO1xuICBhc3NlcnQub2soIHJlY3QuZmlsbCA9PT0gbnVsbCwgJ0Fsd2F5cyBzdGFydHMgd2l0aCBhIG51bGwgZmlsbCcgKTtcbiAgc2NlbmUuYWRkQ2hpbGQoIHJlY3QgKTtcbiAgY29uc3QgY29sb3IgPSBuZXcgQ29sb3IoIDI1NSwgMCwgMCApO1xuICByZWN0LmZpbGwgPSBjb2xvcjtcbiAgY29sb3Iuc2V0UkdCQSggMCwgMjU1LCAwLCAxICk7XG59ICk7XG5cblFVbml0LnRlc3QoICdCb3VuZHMgYW5kIFZpc2libGUgQm91bmRzJywgYXNzZXJ0ID0+IHtcbiAgY29uc3Qgbm9kZSA9IG5ldyBOb2RlKCk7XG4gIGNvbnN0IHJlY3QgPSBuZXcgUmVjdGFuZ2xlKCAwLCAwLCAxMDAsIDUwICk7XG4gIG5vZGUuYWRkQ2hpbGQoIHJlY3QgKTtcblxuICBhc3NlcnQub2soIG5vZGUudmlzaWJsZUJvdW5kcy5lcXVhbHMoIG5ldyBCb3VuZHMyKCAwLCAwLCAxMDAsIDUwICkgKSwgJ1Zpc2libGUgQm91bmRzIFZpc2libGUnICk7XG4gIGFzc2VydC5vayggbm9kZS5ib3VuZHMuZXF1YWxzKCBuZXcgQm91bmRzMiggMCwgMCwgMTAwLCA1MCApICksICdDb21wbGV0ZSBCb3VuZHMgVmlzaWJsZScgKTtcblxuICByZWN0LnZpc2libGUgPSBmYWxzZTtcblxuICBhc3NlcnQub2soIG5vZGUudmlzaWJsZUJvdW5kcy5lcXVhbHMoIEJvdW5kczIuTk9USElORyApLCAnVmlzaWJsZSBCb3VuZHMgSW52aXNpYmxlJyApO1xuICBhc3NlcnQub2soIG5vZGUuYm91bmRzLmVxdWFscyggbmV3IEJvdW5kczIoIDAsIDAsIDEwMCwgNTAgKSApLCAnQ29tcGxldGUgQm91bmRzIEludmlzaWJsZScgKTtcbn0gKTtcblxuUVVuaXQudGVzdCggJ2xvY2FsQm91bmRzIG92ZXJyaWRlJywgYXNzZXJ0ID0+IHtcbiAgY29uc3Qgbm9kZSA9IG5ldyBOb2RlKCB7IHk6IDUgfSApO1xuICBjb25zdCByZWN0ID0gbmV3IFJlY3RhbmdsZSggMCwgMCwgMTAwLCA1MCApO1xuICBub2RlLmFkZENoaWxkKCByZWN0ICk7XG5cbiAgcmVjdC5sb2NhbEJvdW5kcyA9IG5ldyBCb3VuZHMyKCAwLCAwLCA1MCwgNTAgKTtcbiAgYXNzZXJ0Lm9rKCBub2RlLmxvY2FsQm91bmRzLmVxdWFscyggbmV3IEJvdW5kczIoIDAsIDAsIDUwLCA1MCApICksICdsb2NhbEJvdW5kcyBvdmVycmlkZSBvbiBzZWxmJyApO1xuICBhc3NlcnQub2soIG5vZGUuYm91bmRzLmVxdWFscyggbmV3IEJvdW5kczIoIDAsIDUsIDUwLCA1NSApICksICdsb2NhbEJvdW5kcyBvdmVycmlkZSBvbiBzZWxmJyApO1xuXG4gIHJlY3QubG9jYWxCb3VuZHMgPSBuZXcgQm91bmRzMiggMCwgMCwgNTAsIDEwMCApO1xuICBhc3NlcnQub2soIG5vZGUuYm91bmRzLmVxdWFscyggbmV3IEJvdW5kczIoIDAsIDUsIDUwLCAxMDUgKSApLCAnbG9jYWxCb3VuZHMgb3ZlcnJpZGUgMm5kIG9uIHNlbGYnICk7XG5cbiAgLy8gcmVzZXQgbG9jYWwgYm91bmRzIChoYXZlIHRoZW0gY29tcHV0ZWQgYWdhaW4pXG4gIHJlY3QubG9jYWxCb3VuZHMgPSBudWxsO1xuICBhc3NlcnQub2soIG5vZGUuYm91bmRzLmVxdWFscyggbmV3IEJvdW5kczIoIDAsIDUsIDEwMCwgNTUgKSApLCAnbG9jYWxCb3VuZHMgb3ZlcnJpZGUgcmVzZXQgb24gc2VsZicgKTtcblxuICBub2RlLmxvY2FsQm91bmRzID0gbmV3IEJvdW5kczIoIDAsIDAsIDUwLCAyMDAgKTtcbiAgYXNzZXJ0Lm9rKCBub2RlLmxvY2FsQm91bmRzLmVxdWFscyggbmV3IEJvdW5kczIoIDAsIDAsIDUwLCAyMDAgKSApLCAnbG9jYWxCb3VuZHMgb3ZlcnJpZGUgb24gcGFyZW50JyApO1xuICBhc3NlcnQub2soIG5vZGUuYm91bmRzLmVxdWFscyggbmV3IEJvdW5kczIoIDAsIDUsIDUwLCAyMDUgKSApLCAnbG9jYWxCb3VuZHMgb3ZlcnJpZGUgb24gcGFyZW50JyApO1xufSApO1xuXG5mdW5jdGlvbiBjb21wYXJlVHJhaWxBcnJheXMoIGEsIGIgKSB7XG4gIC8vIGRlZmVuc2l2ZSBjb3BpZXNcbiAgYSA9IGEuc2xpY2UoKTtcbiAgYiA9IGIuc2xpY2UoKTtcblxuICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBhLmxlbmd0aDsgaSsrICkge1xuICAgIC8vIGZvciBlYWNoIEEsIHJlbW92ZSB0aGUgZmlyc3QgbWF0Y2hpbmcgb25lIGluIEJcbiAgICBmb3IgKCBsZXQgaiA9IDA7IGogPCBiLmxlbmd0aDsgaisrICkge1xuICAgICAgaWYgKCBhWyBpIF0uZXF1YWxzKCBiWyBqIF0gKSApIHtcbiAgICAgICAgYi5zcGxpY2UoIGosIDEgKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLy8gbm93IEIgc2hvdWxkIGJlIGVtcHR5XG4gIHJldHVybiBiLmxlbmd0aCA9PT0gMDtcbn1cblxuUVVuaXQudGVzdCggJ2dldFRyYWlscy9nZXRVbmlxdWVUcmFpbCcsIGFzc2VydCA9PiB7XG4gIGNvbnN0IGEgPSBuZXcgTm9kZSgpO1xuICBjb25zdCBiID0gbmV3IE5vZGUoKTtcbiAgY29uc3QgYyA9IG5ldyBOb2RlKCk7XG4gIGNvbnN0IGQgPSBuZXcgTm9kZSgpO1xuICBjb25zdCBlID0gbmV3IE5vZGUoKTtcblxuICAvLyBEQUctbGlrZSBzdHJ1Y3R1cmVcbiAgYS5hZGRDaGlsZCggYiApO1xuICBhLmFkZENoaWxkKCBjICk7XG4gIGIuYWRkQ2hpbGQoIGQgKTtcbiAgYy5hZGRDaGlsZCggZCApO1xuICBjLmFkZENoaWxkKCBlICk7XG5cbiAgLy8gZ2V0VW5pcXVlVHJhaWwoKVxuICB3aW5kb3cuYXNzZXJ0ICYmIGFzc2VydC50aHJvd3MoICgpID0+IHsgZC5nZXRVbmlxdWVUcmFpbCgpOyB9LCAnRCBoYXMgbm8gdW5pcXVlIHRyYWlsLCBzaW5jZSB0aGVyZSBhcmUgdHdvJyApO1xuICBhc3NlcnQub2soIGEuZ2V0VW5pcXVlVHJhaWwoKS5lcXVhbHMoIG5ldyBUcmFpbCggWyBhIF0gKSApLCAnYS5nZXRVbmlxdWVUcmFpbCgpJyApO1xuICBhc3NlcnQub2soIGIuZ2V0VW5pcXVlVHJhaWwoKS5lcXVhbHMoIG5ldyBUcmFpbCggWyBhLCBiIF0gKSApLCAnYi5nZXRVbmlxdWVUcmFpbCgpJyApO1xuICBhc3NlcnQub2soIGMuZ2V0VW5pcXVlVHJhaWwoKS5lcXVhbHMoIG5ldyBUcmFpbCggWyBhLCBjIF0gKSApLCAnYy5nZXRVbmlxdWVUcmFpbCgpJyApO1xuICBhc3NlcnQub2soIGUuZ2V0VW5pcXVlVHJhaWwoKS5lcXVhbHMoIG5ldyBUcmFpbCggWyBhLCBjLCBlIF0gKSApLCAnZS5nZXRVbmlxdWVUcmFpbCgpJyApO1xuXG4gIC8vIGdldFRyYWlscygpXG4gIGxldCB0cmFpbHM7XG4gIHRyYWlscyA9IGEuZ2V0VHJhaWxzKCk7XG4gIGFzc2VydC5vayggdHJhaWxzLmxlbmd0aCA9PT0gMSAmJiB0cmFpbHNbIDAgXS5lcXVhbHMoIG5ldyBUcmFpbCggWyBhIF0gKSApLCAnYS5nZXRUcmFpbHMoKScgKTtcbiAgdHJhaWxzID0gYi5nZXRUcmFpbHMoKTtcbiAgYXNzZXJ0Lm9rKCB0cmFpbHMubGVuZ3RoID09PSAxICYmIHRyYWlsc1sgMCBdLmVxdWFscyggbmV3IFRyYWlsKCBbIGEsIGIgXSApICksICdiLmdldFRyYWlscygpJyApO1xuICB0cmFpbHMgPSBjLmdldFRyYWlscygpO1xuICBhc3NlcnQub2soIHRyYWlscy5sZW5ndGggPT09IDEgJiYgdHJhaWxzWyAwIF0uZXF1YWxzKCBuZXcgVHJhaWwoIFsgYSwgYyBdICkgKSwgJ2MuZ2V0VHJhaWxzKCknICk7XG4gIHRyYWlscyA9IGQuZ2V0VHJhaWxzKCk7XG4gIGFzc2VydC5vayggdHJhaWxzLmxlbmd0aCA9PT0gMiAmJiBjb21wYXJlVHJhaWxBcnJheXMoIHRyYWlscywgWyBuZXcgVHJhaWwoIFsgYSwgYiwgZCBdICksIG5ldyBUcmFpbCggWyBhLCBjLCBkIF0gKSBdICksICdkLmdldFRyYWlscygpJyApO1xuICB0cmFpbHMgPSBlLmdldFRyYWlscygpO1xuICBhc3NlcnQub2soIHRyYWlscy5sZW5ndGggPT09IDEgJiYgdHJhaWxzWyAwIF0uZXF1YWxzKCBuZXcgVHJhaWwoIFsgYSwgYywgZSBdICkgKSwgJ2UuZ2V0VHJhaWxzKCknICk7XG5cbiAgLy8gZ2V0VW5pcXVlVHJhaWwoIHByZWRpY2F0ZSApXG4gIHdpbmRvdy5hc3NlcnQgJiYgYXNzZXJ0LnRocm93cyggKCkgPT4geyBlLmdldFVuaXF1ZVRyYWlsKCBub2RlID0+IGZhbHNlICk7IH0sICdGYWlscyBvbiBmYWxzZSBwcmVkaWNhdGUnICk7XG4gIHdpbmRvdy5hc3NlcnQgJiYgYXNzZXJ0LnRocm93cyggKCkgPT4geyBlLmdldFVuaXF1ZVRyYWlsKCBub2RlID0+IGZhbHNlICk7IH0sICdGYWlscyBvbiBmYWxzZSBwcmVkaWNhdGUnICk7XG4gIGFzc2VydC5vayggZS5nZXRVbmlxdWVUcmFpbCggbm9kZSA9PiBub2RlID09PSBhICkuZXF1YWxzKCBuZXcgVHJhaWwoIFsgYSwgYywgZSBdICkgKSApO1xuICBhc3NlcnQub2soIGUuZ2V0VW5pcXVlVHJhaWwoIG5vZGUgPT4gbm9kZSA9PT0gYyApLmVxdWFscyggbmV3IFRyYWlsKCBbIGMsIGUgXSApICkgKTtcbiAgYXNzZXJ0Lm9rKCBlLmdldFVuaXF1ZVRyYWlsKCBub2RlID0+IG5vZGUgPT09IGUgKS5lcXVhbHMoIG5ldyBUcmFpbCggWyBlIF0gKSApICk7XG4gIGFzc2VydC5vayggZC5nZXRVbmlxdWVUcmFpbCggbm9kZSA9PiBub2RlID09PSBiICkuZXF1YWxzKCBuZXcgVHJhaWwoIFsgYiwgZCBdICkgKSApO1xuICBhc3NlcnQub2soIGQuZ2V0VW5pcXVlVHJhaWwoIG5vZGUgPT4gbm9kZSA9PT0gYyApLmVxdWFscyggbmV3IFRyYWlsKCBbIGMsIGQgXSApICkgKTtcbiAgYXNzZXJ0Lm9rKCBkLmdldFVuaXF1ZVRyYWlsKCBub2RlID0+IG5vZGUgPT09IGQgKS5lcXVhbHMoIG5ldyBUcmFpbCggWyBkIF0gKSApICk7XG5cbiAgLy8gZ2V0VHJhaWxzKCBwcmVkaWNhdGUgKVxuICB0cmFpbHMgPSBkLmdldFRyYWlscyggbm9kZSA9PiBmYWxzZSApO1xuICBhc3NlcnQub2soIHRyYWlscy5sZW5ndGggPT09IDAgKTtcbiAgdHJhaWxzID0gZC5nZXRUcmFpbHMoIG5vZGUgPT4gdHJ1ZSApO1xuICBhc3NlcnQub2soIGNvbXBhcmVUcmFpbEFycmF5cyggdHJhaWxzLCBbXG4gICAgbmV3IFRyYWlsKCBbIGEsIGIsIGQgXSApLFxuICAgIG5ldyBUcmFpbCggWyBiLCBkIF0gKSxcbiAgICBuZXcgVHJhaWwoIFsgYSwgYywgZCBdICksXG4gICAgbmV3IFRyYWlsKCBbIGMsIGQgXSApLFxuICAgIG5ldyBUcmFpbCggWyBkIF0gKVxuICBdICkgKTtcbiAgdHJhaWxzID0gZC5nZXRUcmFpbHMoIG5vZGUgPT4gbm9kZSA9PT0gYSApO1xuICBhc3NlcnQub2soIGNvbXBhcmVUcmFpbEFycmF5cyggdHJhaWxzLCBbXG4gICAgbmV3IFRyYWlsKCBbIGEsIGIsIGQgXSApLFxuICAgIG5ldyBUcmFpbCggWyBhLCBjLCBkIF0gKVxuICBdICkgKTtcbiAgdHJhaWxzID0gZC5nZXRUcmFpbHMoIG5vZGUgPT4gbm9kZSA9PT0gYiApO1xuICBhc3NlcnQub2soIGNvbXBhcmVUcmFpbEFycmF5cyggdHJhaWxzLCBbXG4gICAgbmV3IFRyYWlsKCBbIGIsIGQgXSApXG4gIF0gKSApO1xuICB0cmFpbHMgPSBkLmdldFRyYWlscyggbm9kZSA9PiBub2RlLnBhcmVudHMubGVuZ3RoID09PSAxICk7XG4gIGFzc2VydC5vayggY29tcGFyZVRyYWlsQXJyYXlzKCB0cmFpbHMsIFtcbiAgICBuZXcgVHJhaWwoIFsgYiwgZCBdICksXG4gICAgbmV3IFRyYWlsKCBbIGMsIGQgXSApXG4gIF0gKSApO1xufSApO1xuXG5RVW5pdC50ZXN0KCAnZ2V0TGVhZlRyYWlscycsIGFzc2VydCA9PiB7XG4gIGNvbnN0IGEgPSBuZXcgTm9kZSgpO1xuICBjb25zdCBiID0gbmV3IE5vZGUoKTtcbiAgY29uc3QgYyA9IG5ldyBOb2RlKCk7XG4gIGNvbnN0IGQgPSBuZXcgTm9kZSgpO1xuICBjb25zdCBlID0gbmV3IE5vZGUoKTtcblxuICAvLyBEQUctbGlrZSBzdHJ1Y3R1cmVcbiAgYS5hZGRDaGlsZCggYiApO1xuICBhLmFkZENoaWxkKCBjICk7XG4gIGIuYWRkQ2hpbGQoIGQgKTtcbiAgYy5hZGRDaGlsZCggZCApO1xuICBjLmFkZENoaWxkKCBlICk7XG5cbiAgLy8gZ2V0VW5pcXVlTGVhZlRyYWlsKClcbiAgd2luZG93LmFzc2VydCAmJiBhc3NlcnQudGhyb3dzKCAoKSA9PiB7IGEuZ2V0VW5pcXVlTGVhZlRyYWlsKCk7IH0sICdBIGhhcyBubyB1bmlxdWUgbGVhZiB0cmFpbCwgc2luY2UgdGhlcmUgYXJlIHRocmVlJyApO1xuICBhc3NlcnQub2soIGIuZ2V0VW5pcXVlTGVhZlRyYWlsKCkuZXF1YWxzKCBuZXcgVHJhaWwoIFsgYiwgZCBdICkgKSwgJ2EuZ2V0VW5pcXVlTGVhZlRyYWlsKCknICk7XG4gIGFzc2VydC5vayggZC5nZXRVbmlxdWVMZWFmVHJhaWwoKS5lcXVhbHMoIG5ldyBUcmFpbCggWyBkIF0gKSApLCAnYi5nZXRVbmlxdWVMZWFmVHJhaWwoKScgKTtcbiAgYXNzZXJ0Lm9rKCBlLmdldFVuaXF1ZUxlYWZUcmFpbCgpLmVxdWFscyggbmV3IFRyYWlsKCBbIGUgXSApICksICdjLmdldFVuaXF1ZUxlYWZUcmFpbCgpJyApO1xuXG4gIC8vIGdldExlYWZUcmFpbHMoKVxuICBsZXQgdHJhaWxzO1xuICB0cmFpbHMgPSBhLmdldExlYWZUcmFpbHMoKTtcbiAgYXNzZXJ0Lm9rKCB0cmFpbHMubGVuZ3RoID09PSAzICYmIGNvbXBhcmVUcmFpbEFycmF5cyggdHJhaWxzLCBbXG4gICAgbmV3IFRyYWlsKCBbIGEsIGIsIGQgXSApLFxuICAgIG5ldyBUcmFpbCggWyBhLCBjLCBkIF0gKSxcbiAgICBuZXcgVHJhaWwoIFsgYSwgYywgZSBdIClcbiAgXSApLCAnYS5nZXRMZWFmVHJhaWxzKCknICk7XG4gIHRyYWlscyA9IGIuZ2V0TGVhZlRyYWlscygpO1xuICBhc3NlcnQub2soIHRyYWlscy5sZW5ndGggPT09IDEgJiYgdHJhaWxzWyAwIF0uZXF1YWxzKCBuZXcgVHJhaWwoIFsgYiwgZCBdICkgKSwgJ2IuZ2V0TGVhZlRyYWlscygpJyApO1xuICB0cmFpbHMgPSBjLmdldExlYWZUcmFpbHMoKTtcbiAgYXNzZXJ0Lm9rKCB0cmFpbHMubGVuZ3RoID09PSAyICYmIGNvbXBhcmVUcmFpbEFycmF5cyggdHJhaWxzLCBbXG4gICAgbmV3IFRyYWlsKCBbIGMsIGQgXSApLFxuICAgIG5ldyBUcmFpbCggWyBjLCBlIF0gKVxuICBdICksICdjLmdldExlYWZUcmFpbHMoKScgKTtcbiAgdHJhaWxzID0gZC5nZXRMZWFmVHJhaWxzKCk7XG4gIGFzc2VydC5vayggdHJhaWxzLmxlbmd0aCA9PT0gMSAmJiB0cmFpbHNbIDAgXS5lcXVhbHMoIG5ldyBUcmFpbCggWyBkIF0gKSApLCAnZC5nZXRMZWFmVHJhaWxzKCknICk7XG4gIHRyYWlscyA9IGUuZ2V0TGVhZlRyYWlscygpO1xuICBhc3NlcnQub2soIHRyYWlscy5sZW5ndGggPT09IDEgJiYgdHJhaWxzWyAwIF0uZXF1YWxzKCBuZXcgVHJhaWwoIFsgZSBdICkgKSwgJ2UuZ2V0TGVhZlRyYWlscygpJyApO1xuXG4gIC8vIGdldFVuaXF1ZUxlYWZUcmFpbCggcHJlZGljYXRlIClcbiAgd2luZG93LmFzc2VydCAmJiBhc3NlcnQudGhyb3dzKCAoKSA9PiB7IGUuZ2V0VW5pcXVlTGVhZlRyYWlsKCBub2RlID0+IGZhbHNlICk7IH0sICdGYWlscyBvbiBmYWxzZSBwcmVkaWNhdGUnICk7XG4gIHdpbmRvdy5hc3NlcnQgJiYgYXNzZXJ0LnRocm93cyggKCkgPT4geyBhLmdldFVuaXF1ZUxlYWZUcmFpbCggbm9kZSA9PiB0cnVlICk7IH0sICdGYWlscyBvbiBtdWx0aXBsZXMnICk7XG4gIGFzc2VydC5vayggYS5nZXRVbmlxdWVMZWFmVHJhaWwoIG5vZGUgPT4gbm9kZSA9PT0gZSApLmVxdWFscyggbmV3IFRyYWlsKCBbIGEsIGMsIGUgXSApICkgKTtcblxuICAvLyBnZXRMZWFmVHJhaWxzKCBwcmVkaWNhdGUgKVxuICB0cmFpbHMgPSBhLmdldExlYWZUcmFpbHMoIG5vZGUgPT4gZmFsc2UgKTtcbiAgYXNzZXJ0Lm9rKCB0cmFpbHMubGVuZ3RoID09PSAwICk7XG4gIHRyYWlscyA9IGEuZ2V0TGVhZlRyYWlscyggbm9kZSA9PiB0cnVlICk7XG4gIGFzc2VydC5vayggY29tcGFyZVRyYWlsQXJyYXlzKCB0cmFpbHMsIFtcbiAgICBuZXcgVHJhaWwoIFsgYSBdICksXG4gICAgbmV3IFRyYWlsKCBbIGEsIGIgXSApLFxuICAgIG5ldyBUcmFpbCggWyBhLCBiLCBkIF0gKSxcbiAgICBuZXcgVHJhaWwoIFsgYSwgYyBdICksXG4gICAgbmV3IFRyYWlsKCBbIGEsIGMsIGQgXSApLFxuICAgIG5ldyBUcmFpbCggWyBhLCBjLCBlIF0gKVxuICBdICkgKTtcblxuICAvLyBnZXRMZWFmVHJhaWxzVG8oIG5vZGUgKVxuICB0cmFpbHMgPSBhLmdldExlYWZUcmFpbHNUbyggZCApO1xuICBhc3NlcnQub2soIGNvbXBhcmVUcmFpbEFycmF5cyggdHJhaWxzLCBbXG4gICAgbmV3IFRyYWlsKCBbIGEsIGIsIGQgXSApLFxuICAgIG5ldyBUcmFpbCggWyBhLCBjLCBkIF0gKVxuICBdICkgKTtcbn0gKTtcblxuUVVuaXQudGVzdCggJ0xpbmUgc3Ryb2tlZCBib3VuZHMnLCBhc3NlcnQgPT4ge1xuICBjb25zdCBsaW5lID0gbmV3IExpbmUoIDAsIDAsIDUwLCAwLCB7IHN0cm9rZTogJ3JlZCcsIGxpbmVXaWR0aDogNSB9ICk7XG5cbiAgY29uc3QgcG9zaXRpb25zID0gW1xuICAgIHsgeDE6IDUwLCB5MTogMCwgeDI6IDAsIHkyOiAwIH0sXG4gICAgeyB4MTogMCwgeTE6IDUwLCB4MjogMCwgeTI6IDAgfSxcbiAgICB7IHgxOiAwLCB5MTogMCwgeDI6IDUwLCB5MjogMCB9LFxuICAgIHsgeDE6IDAsIHkxOiAwLCB4MjogMCwgeTI6IDUwIH0sXG4gICAgeyB4MTogNTAsIHkxOiAxMCwgeDI6IDAsIHkyOiAwIH0sXG4gICAgeyB4MTogMTAsIHkxOiA1MCwgeDI6IDAsIHkyOiAwIH0sXG4gICAgeyB4MTogMCwgeTE6IDAsIHgyOiA1MCwgeTI6IDEwIH0sXG4gICAgeyB4MTogMCwgeTE6IDAsIHgyOiAxMCwgeTI6IDUwIH0sXG4gICAgeyB4MTogNTAsIHkxOiAtMTAsIHgyOiAwLCB5MjogMCB9LFxuICAgIHsgeDE6IC0xMCwgeTE6IDUwLCB4MjogMCwgeTI6IDAgfSxcbiAgICB7IHgxOiAwLCB5MTogMCwgeDI6IDUwLCB5MjogLTEwIH0sXG4gICAgeyB4MTogMCwgeTE6IDAsIHgyOiAtMTAsIHkyOiA1MCB9LFxuICAgIHsgeDE6IDUwLCB5MTogMCwgeDI6IDAsIHkyOiAxMCB9LFxuICAgIHsgeDE6IDAsIHkxOiA1MCwgeDI6IDEwLCB5MjogMCB9LFxuICAgIHsgeDE6IDAsIHkxOiAxMCwgeDI6IDUwLCB5MjogMCB9LFxuICAgIHsgeDE6IDEwLCB5MTogMCwgeDI6IDAsIHkyOiA1MCB9LFxuICAgIHsgeDE6IDUwLCB5MTogMCwgeDI6IDAsIHkyOiAtMTAgfSxcbiAgICB7IHgxOiAwLCB5MTogNTAsIHgyOiAtMTAsIHkyOiAwIH0sXG4gICAgeyB4MTogMCwgeTE6IC0xMCwgeDI6IDUwLCB5MjogMCB9LFxuICAgIHsgeDE6IC0xMCwgeTE6IDAsIHgyOiAwLCB5MjogNTAgfVxuICBdO1xuXG4gIGNvbnN0IGNhcHMgPSBbXG4gICAgJ3JvdW5kJyxcbiAgICAnYnV0dCcsXG4gICAgJ3NxdWFyZSdcbiAgXTtcblxuICBfLmVhY2goIHBvc2l0aW9ucywgcG9zaXRpb24gPT4ge1xuICAgIGxpbmUubXV0YXRlKCBwb3NpdGlvbiApO1xuICAgIC8vIGxpbmUuc2V0TGluZSggcG9zaXRpb24ueDEsIHBvc2l0aW9uLnkxLCBwb3NpdGlvbi54MiwgcG9zaXRpb24ueTIgKTtcbiAgICBfLmVhY2goIGNhcHMsIGNhcCA9PiB7XG4gICAgICBsaW5lLmxpbmVDYXAgPSBjYXA7XG5cbiAgICAgIGFzc2VydC5vayggbGluZS5ib3VuZHMuZXF1YWxzRXBzaWxvbiggbGluZS5nZXRTaGFwZSgpLmdldFN0cm9rZWRTaGFwZSggbGluZS5nZXRMaW5lU3R5bGVzKCkgKS5ib3VuZHMsIDAuMDAwMSApLFxuICAgICAgICBgTGluZSBzdHJva2VkIGJvdW5kcyB3aXRoICR7SlNPTi5zdHJpbmdpZnkoIHBvc2l0aW9uICl9IGFuZCAke2NhcH0gJHtsaW5lLmJvdW5kcy50b1N0cmluZygpfWAgKTtcbiAgICB9ICk7XG4gIH0gKTtcbn0gKTtcblxuUVVuaXQudGVzdCggJ21heFdpZHRoL21heEhlaWdodCBmb3IgTm9kZScsIGFzc2VydCA9PiB7XG4gIGNvbnN0IHJlY3QgPSBuZXcgUmVjdGFuZ2xlKCAwLCAwLCAxMDAsIDUwLCB7IGZpbGw6ICdyZWQnIH0gKTtcbiAgY29uc3Qgbm9kZSA9IG5ldyBOb2RlKCB7IGNoaWxkcmVuOiBbIHJlY3QgXSB9ICk7XG5cbiAgYXNzZXJ0Lm9rKCBub2RlLmJvdW5kcy5lcXVhbHMoIG5ldyBCb3VuZHMyKCAwLCAwLCAxMDAsIDUwICkgKSwgJ0luaXRpYWwgYm91bmRzJyApO1xuXG4gIG5vZGUubWF4V2lkdGggPSA1MDtcblxuICBhc3NlcnQub2soIG5vZGUuYm91bmRzLmVxdWFscyggbmV3IEJvdW5kczIoIDAsIDAsIDUwLCAyNSApICksICdIYWx2ZWQgdHJhbnNmb3JtIGFmdGVyIG1heCB3aWR0aCBvZiBoYWxmJyApO1xuXG4gIG5vZGUubWF4V2lkdGggPSAxMjA7XG5cbiAgYXNzZXJ0Lm9rKCBub2RlLmJvdW5kcy5lcXVhbHMoIG5ldyBCb3VuZHMyKCAwLCAwLCAxMDAsIDUwICkgKSwgJ0JhY2sgdG8gbm9ybWFsIGFmdGVyIGEgYmlnIG1heCB3aWR0aCcgKTtcblxuICBub2RlLnNjYWxlKCAyICk7XG5cbiAgYXNzZXJ0Lm9rKCBub2RlLmJvdW5kcy5lcXVhbHMoIG5ldyBCb3VuZHMyKCAwLCAwLCAyMDAsIDEwMCApICksICdTY2FsZSB1cCBzaG91bGQgYmUgdW5hZmZlY3RlZCcgKTtcblxuICBub2RlLm1heFdpZHRoID0gMjU7XG5cbiAgYXNzZXJ0Lm9rKCBub2RlLmJvdW5kcy5lcXVhbHMoIG5ldyBCb3VuZHMyKCAwLCAwLCA1MCwgMjUgKSApLCAnU2NhbGVkIGJhY2sgZG93biB3aXRoIGJvdGggYXBwbGllZCcgKTtcblxuICBub2RlLm1heFdpZHRoID0gbnVsbDtcblxuICBhc3NlcnQub2soIG5vZGUuYm91bmRzLmVxdWFscyggbmV3IEJvdW5kczIoIDAsIDAsIDIwMCwgMTAwICkgKSwgJ1dpdGhvdXQgbWF4V2lkdGgnICk7XG5cbiAgbm9kZS5zY2FsZSggMC41ICk7XG5cbiAgYXNzZXJ0Lm9rKCBub2RlLmJvdW5kcy5lcXVhbHMoIG5ldyBCb3VuZHMyKCAwLCAwLCAxMDAsIDUwICkgKSwgJ0JhY2sgdG8gbm9ybWFsJyApO1xuXG4gIG5vZGUubGVmdCA9IDUwO1xuXG4gIGFzc2VydC5vayggbm9kZS5ib3VuZHMuZXF1YWxzKCBuZXcgQm91bmRzMiggNTAsIDAsIDE1MCwgNTAgKSApLCAnQWZ0ZXIgYSB0cmFuc2xhdGlvbicgKTtcblxuICBub2RlLm1heFdpZHRoID0gNTA7XG5cbiAgYXNzZXJ0Lm9rKCBub2RlLmJvdW5kcy5lcXVhbHMoIG5ldyBCb3VuZHMyKCA1MCwgMCwgMTAwLCAyNSApICksICdtYXhXaWR0aCBiZWluZyBhcHBsaWVkIGFmdGVyIGEgdHJhbnNsYXRpb24sIGluIGxvY2FsIGZyYW1lJyApO1xuXG4gIHJlY3QucmVjdFdpZHRoID0gMjAwO1xuXG4gIGFzc2VydC5vayggbm9kZS5ib3VuZHMuZXF1YWxzKCBuZXcgQm91bmRzMiggNTAsIDAsIDEwMCwgMTIuNSApICksICdOb3cgd2l0aCBhIGJpZ2dlciByZWN0YW5nbGUnICk7XG5cbiAgcmVjdC5yZWN0V2lkdGggPSAxMDA7XG4gIG5vZGUubWF4V2lkdGggPSBudWxsO1xuXG4gIGFzc2VydC5vayggbm9kZS5ib3VuZHMuZXF1YWxzKCBuZXcgQm91bmRzMiggNTAsIDAsIDE1MCwgNTAgKSApLCAnQmFjayB0byBhIHRyYW5zbGF0aW9uJyApO1xuXG4gIHJlY3QubWF4V2lkdGggPSA1MDtcblxuICBhc3NlcnQub2soIG5vZGUuYm91bmRzLmVxdWFscyggbmV3IEJvdW5kczIoIDUwLCAwLCAxMDAsIDI1ICkgKSwgJ0FmdGVyIG1heFdpZHRoIEEnICk7XG5cbiAgcmVjdC5tYXhIZWlnaHQgPSAxMi41O1xuXG4gIGFzc2VydC5vayggbm9kZS5ib3VuZHMuZXF1YWxzKCBuZXcgQm91bmRzMiggNTAsIDAsIDc1LCAxMi41ICkgKSwgJ0FmdGVyIG1heEhlaWdodCBBJyApO1xufSApO1xuXG5RVW5pdC50ZXN0KCAnU3BhY2VycycsIGFzc2VydCA9PiB7XG4gIGNvbnN0IHNwYWNlciA9IG5ldyBTcGFjZXIoIDEwMCwgNTAsIHsgeDogNTAgfSApO1xuICBhc3NlcnQub2soIHNwYWNlci5ib3VuZHMuZXF1YWxzKCBuZXcgQm91bmRzMiggNTAsIDAsIDE1MCwgNTAgKSApLCAnU3BhY2VyIGJvdW5kcyB3aXRoIHRyYW5zbGF0aW9uJyApO1xuXG4gIGNvbnN0IGhzdHJ1dCA9IG5ldyBIU3RydXQoIDEwMCwgeyB5OiA1MCB9ICk7XG4gIGFzc2VydC5vayggaHN0cnV0LmJvdW5kcy5lcXVhbHMoIG5ldyBCb3VuZHMyKCAwLCA1MCwgMTAwLCA1MCApICksICdIU3RydXQgYm91bmRzIHdpdGggdHJhbnNsYXRpb24nICk7XG5cbiAgY29uc3QgdnN0cnV0ID0gbmV3IFZTdHJ1dCggMTAwLCB7IHg6IDUwIH0gKTtcbiAgYXNzZXJ0Lm9rKCB2c3RydXQuYm91bmRzLmVxdWFscyggbmV3IEJvdW5kczIoIDUwLCAwLCA1MCwgMTAwICkgKSwgJ1ZTdHJ1dCBib3VuZHMgd2l0aCB0cmFuc2xhdGlvbicgKTtcblxuICBhc3NlcnQudGhyb3dzKCAoKSA9PiB7XG4gICAgc3BhY2VyLmFkZENoaWxkKCBuZXcgTm9kZSgpICk7XG4gIH0sICdObyB3YXkgdG8gYWRkIGNoaWxkcmVuIHRvIFNwYWNlcicgKTtcblxuICBhc3NlcnQudGhyb3dzKCAoKSA9PiB7XG4gICAgaHN0cnV0LmFkZENoaWxkKCBuZXcgTm9kZSgpICk7XG4gIH0sICdObyB3YXkgdG8gYWRkIGNoaWxkcmVuIHRvIEhTdHJ1dCcgKTtcblxuICBhc3NlcnQudGhyb3dzKCAoKSA9PiB7XG4gICAgdnN0cnV0LmFkZENoaWxkKCBuZXcgTm9kZSgpICk7XG4gIH0sICdObyB3YXkgdG8gYWRkIGNoaWxkcmVuIHRvIFZTdHJ1dCcgKTtcbn0gKTtcblxuUVVuaXQudGVzdCggJ1JlbmRlcmVyIFN1bW1hcnknLCBhc3NlcnQgPT4ge1xuICBjb25zdCBjYW52YXNOb2RlID0gbmV3IENhbnZhc05vZGUoIHsgY2FudmFzQm91bmRzOiBuZXcgQm91bmRzMiggMCwgMCwgMTAsIDEwICkgfSApO1xuICBjb25zdCB3ZWJnbE5vZGUgPSBuZXcgV2ViR0xOb2RlKCAoKSA9PiB7fSwgeyBjYW52YXNCb3VuZHM6IG5ldyBCb3VuZHMyKCAwLCAwLCAxMCwgMTAgKSB9ICk7XG4gIGNvbnN0IHJlY3QgPSBuZXcgUmVjdGFuZ2xlKCAwLCAwLCAxMDAsIDUwICk7XG4gIGNvbnN0IG5vZGUgPSBuZXcgTm9kZSggeyBjaGlsZHJlbjogWyBjYW52YXNOb2RlLCB3ZWJnbE5vZGUsIHJlY3QgXSB9ICk7XG4gIGNvbnN0IGVtcHR5Tm9kZSA9IG5ldyBOb2RlKCk7XG5cbiAgYXNzZXJ0Lm9rKCBjYW52YXNOb2RlLl9yZW5kZXJlclN1bW1hcnkuaXNTdWJ0cmVlRnVsbHlDb21wYXRpYmxlKCBSZW5kZXJlci5iaXRtYXNrQ2FudmFzICksICdDYW52YXNOb2RlIGZ1bGx5IGNvbXBhdGlibGU6IENhbnZhcycgKTtcbiAgYXNzZXJ0Lm9rKCAhY2FudmFzTm9kZS5fcmVuZGVyZXJTdW1tYXJ5LmlzU3VidHJlZUZ1bGx5Q29tcGF0aWJsZSggUmVuZGVyZXIuYml0bWFza1NWRyApLCAnQ2FudmFzTm9kZSBub3QgZnVsbHkgY29tcGF0aWJsZTogU1ZHJyApO1xuICBhc3NlcnQub2soIGNhbnZhc05vZGUuX3JlbmRlcmVyU3VtbWFyeS5pc1N1YnRyZWVDb250YWluaW5nQ29tcGF0aWJsZSggUmVuZGVyZXIuYml0bWFza0NhbnZhcyApLCAnQ2FudmFzTm9kZSBwYXJ0aWFsbHkgY29tcGF0aWJsZTogQ2FudmFzJyApO1xuICBhc3NlcnQub2soICFjYW52YXNOb2RlLl9yZW5kZXJlclN1bW1hcnkuaXNTdWJ0cmVlQ29udGFpbmluZ0NvbXBhdGlibGUoIFJlbmRlcmVyLmJpdG1hc2tTVkcgKSwgJ0NhbnZhc05vZGUgbm90IHBhcnRpYWxseSBjb21wYXRpYmxlOiBTVkcnICk7XG4gIGFzc2VydC5vayggY2FudmFzTm9kZS5fcmVuZGVyZXJTdW1tYXJ5LmlzU2luZ2xlQ2FudmFzU3VwcG9ydGVkKCksICdDYW52YXNOb2RlIHN1cHBvcnRzIHNpbmdsZSBDYW52YXMnICk7XG4gIGFzc2VydC5vayggIWNhbnZhc05vZGUuX3JlbmRlcmVyU3VtbWFyeS5pc1NpbmdsZVNWR1N1cHBvcnRlZCgpLCAnQ2FudmFzTm9kZSBkb2VzIG5vdCBzdXBwb3J0IHNpbmdsZSBTVkcnICk7XG4gIGFzc2VydC5vayggIWNhbnZhc05vZGUuX3JlbmRlcmVyU3VtbWFyeS5pc05vdFBhaW50ZWQoKSwgJ0NhbnZhc05vZGUgaXMgcGFpbnRlZCcgKTtcbiAgYXNzZXJ0Lm9rKCBjYW52YXNOb2RlLl9yZW5kZXJlclN1bW1hcnkuYXJlQm91bmRzVmFsaWQoKSwgJ0NhbnZhc05vZGUgaGFzIHZhbGlkIGJvdW5kcycgKTtcblxuICBhc3NlcnQub2soIHdlYmdsTm9kZS5fcmVuZGVyZXJTdW1tYXJ5LmlzU3VidHJlZUZ1bGx5Q29tcGF0aWJsZSggUmVuZGVyZXIuYml0bWFza1dlYkdMICksICdXZWJHTE5vZGUgZnVsbHkgY29tcGF0aWJsZTogV2ViR0wnICk7XG4gIGFzc2VydC5vayggIXdlYmdsTm9kZS5fcmVuZGVyZXJTdW1tYXJ5LmlzU3VidHJlZUZ1bGx5Q29tcGF0aWJsZSggUmVuZGVyZXIuYml0bWFza1NWRyApLCAnV2ViR0xOb2RlIG5vdCBmdWxseSBjb21wYXRpYmxlOiBTVkcnICk7XG4gIGFzc2VydC5vayggd2ViZ2xOb2RlLl9yZW5kZXJlclN1bW1hcnkuaXNTdWJ0cmVlQ29udGFpbmluZ0NvbXBhdGlibGUoIFJlbmRlcmVyLmJpdG1hc2tXZWJHTCApLCAnV2ViR0xOb2RlIHBhcnRpYWxseSBjb21wYXRpYmxlOiBXZWJHTCcgKTtcbiAgYXNzZXJ0Lm9rKCAhd2ViZ2xOb2RlLl9yZW5kZXJlclN1bW1hcnkuaXNTdWJ0cmVlQ29udGFpbmluZ0NvbXBhdGlibGUoIFJlbmRlcmVyLmJpdG1hc2tTVkcgKSwgJ1dlYkdMTm9kZSBub3QgcGFydGlhbGx5IGNvbXBhdGlibGU6IFNWRycgKTtcbiAgYXNzZXJ0Lm9rKCAhd2ViZ2xOb2RlLl9yZW5kZXJlclN1bW1hcnkuaXNTaW5nbGVDYW52YXNTdXBwb3J0ZWQoKSwgJ1dlYkdMTm9kZSBkb2VzIG5vdCBzdXBwb3J0IHNpbmdsZSBDYW52YXMnICk7XG4gIGFzc2VydC5vayggIXdlYmdsTm9kZS5fcmVuZGVyZXJTdW1tYXJ5LmlzU2luZ2xlU1ZHU3VwcG9ydGVkKCksICdXZWJHTE5vZGUgZG9lcyBub3Qgc3VwcG9ydCBzaW5nbGUgU1ZHJyApO1xuICBhc3NlcnQub2soICF3ZWJnbE5vZGUuX3JlbmRlcmVyU3VtbWFyeS5pc05vdFBhaW50ZWQoKSwgJ1dlYkdMTm9kZSBpcyBwYWludGVkJyApO1xuICBhc3NlcnQub2soIHdlYmdsTm9kZS5fcmVuZGVyZXJTdW1tYXJ5LmFyZUJvdW5kc1ZhbGlkKCksICdXZWJHTE5vZGUgaGFzIHZhbGlkIGJvdW5kcycgKTtcblxuICBhc3NlcnQub2soIHJlY3QuX3JlbmRlcmVyU3VtbWFyeS5pc1N1YnRyZWVGdWxseUNvbXBhdGlibGUoIFJlbmRlcmVyLmJpdG1hc2tDYW52YXMgKSwgJ1JlY3RhbmdsZSBmdWxseSBjb21wYXRpYmxlOiBDYW52YXMnICk7XG4gIGFzc2VydC5vayggcmVjdC5fcmVuZGVyZXJTdW1tYXJ5LmlzU3VidHJlZUZ1bGx5Q29tcGF0aWJsZSggUmVuZGVyZXIuYml0bWFza1NWRyApLCAnUmVjdGFuZ2xlIGZ1bGx5IGNvbXBhdGlibGU6IFNWRycgKTtcbiAgYXNzZXJ0Lm9rKCByZWN0Ll9yZW5kZXJlclN1bW1hcnkuaXNTdWJ0cmVlQ29udGFpbmluZ0NvbXBhdGlibGUoIFJlbmRlcmVyLmJpdG1hc2tDYW52YXMgKSwgJ1JlY3RhbmdsZSBwYXJ0aWFsbHkgY29tcGF0aWJsZTogQ2FudmFzJyApO1xuICBhc3NlcnQub2soIHJlY3QuX3JlbmRlcmVyU3VtbWFyeS5pc1N1YnRyZWVDb250YWluaW5nQ29tcGF0aWJsZSggUmVuZGVyZXIuYml0bWFza1NWRyApLCAnUmVjdGFuZ2xlIHBhcnRpYWxseSBjb21wYXRpYmxlOiBTVkcnICk7XG4gIGFzc2VydC5vayggcmVjdC5fcmVuZGVyZXJTdW1tYXJ5LmlzU2luZ2xlQ2FudmFzU3VwcG9ydGVkKCksICdSZWN0YW5nbGUgZG9lcyBzdXBwb3J0IHNpbmdsZSBDYW52YXMnICk7XG4gIGFzc2VydC5vayggcmVjdC5fcmVuZGVyZXJTdW1tYXJ5LmlzU2luZ2xlU1ZHU3VwcG9ydGVkKCksICdSZWN0YW5nbGUgZG9lcyBzdXBwb3J0IHNpbmdsZSBTVkcnICk7XG4gIGFzc2VydC5vayggIXJlY3QuX3JlbmRlcmVyU3VtbWFyeS5pc05vdFBhaW50ZWQoKSwgJ1JlY3RhbmdsZSBpcyBwYWludGVkJyApO1xuICBhc3NlcnQub2soIHJlY3QuX3JlbmRlcmVyU3VtbWFyeS5hcmVCb3VuZHNWYWxpZCgpLCAnUmVjdGFuZ2xlIGhhcyB2YWxpZCBib3VuZHMnICk7XG5cbiAgYXNzZXJ0Lm9rKCAhbm9kZS5fcmVuZGVyZXJTdW1tYXJ5LmlzU3VidHJlZUZ1bGx5Q29tcGF0aWJsZSggUmVuZGVyZXIuYml0bWFza0NhbnZhcyApLCAnQ29udGFpbmVyIG5vZGUgZnVsbHkgY29tcGF0aWJsZTogQ2FudmFzJyApO1xuICBhc3NlcnQub2soICFub2RlLl9yZW5kZXJlclN1bW1hcnkuaXNTdWJ0cmVlRnVsbHlDb21wYXRpYmxlKCBSZW5kZXJlci5iaXRtYXNrU1ZHICksICdDb250YWluZXIgbm9kZSBub3QgZnVsbHkgY29tcGF0aWJsZTogU1ZHJyApO1xuICBhc3NlcnQub2soIG5vZGUuX3JlbmRlcmVyU3VtbWFyeS5pc1N1YnRyZWVDb250YWluaW5nQ29tcGF0aWJsZSggUmVuZGVyZXIuYml0bWFza0NhbnZhcyApLCAnQ29udGFpbmVyIG5vZGUgcGFydGlhbGx5IGNvbXBhdGlibGU6IENhbnZhcycgKTtcbiAgYXNzZXJ0Lm9rKCBub2RlLl9yZW5kZXJlclN1bW1hcnkuaXNTdWJ0cmVlQ29udGFpbmluZ0NvbXBhdGlibGUoIFJlbmRlcmVyLmJpdG1hc2tTVkcgKSwgJ0NvbnRhaW5lciBub2RlIHBhcnRpYWxseSBjb21wYXRpYmxlOiBTVkcnICk7XG4gIGFzc2VydC5vayggIW5vZGUuX3JlbmRlcmVyU3VtbWFyeS5pc1NpbmdsZUNhbnZhc1N1cHBvcnRlZCgpLCAnQ29udGFpbmVyIG5vZGUgZG9lcyBub3Qgc3VwcG9ydCBzaW5nbGUgQ2FudmFzJyApO1xuICBhc3NlcnQub2soICFub2RlLl9yZW5kZXJlclN1bW1hcnkuaXNTaW5nbGVTVkdTdXBwb3J0ZWQoKSwgJ0NvbnRhaW5lciBub2RlIGRvZXMgbm90IHN1cHBvcnQgc2luZ2xlIFNWRycgKTtcbiAgYXNzZXJ0Lm9rKCAhbm9kZS5fcmVuZGVyZXJTdW1tYXJ5LmlzTm90UGFpbnRlZCgpLCAnQ29udGFpbmVyIG5vZGUgaXMgcGFpbnRlZCcgKTtcbiAgYXNzZXJ0Lm9rKCBub2RlLl9yZW5kZXJlclN1bW1hcnkuYXJlQm91bmRzVmFsaWQoKSwgJ0NvbnRhaW5lciBub2RlIGhhcyB2YWxpZCBib3VuZHMnICk7XG5cbiAgYXNzZXJ0Lm9rKCBlbXB0eU5vZGUuX3JlbmRlcmVyU3VtbWFyeS5pc1N1YnRyZWVGdWxseUNvbXBhdGlibGUoIFJlbmRlcmVyLmJpdG1hc2tDYW52YXMgKSwgJ0VtcHR5IG5vZGUgZnVsbHkgY29tcGF0aWJsZTogQ2FudmFzJyApO1xuICBhc3NlcnQub2soIGVtcHR5Tm9kZS5fcmVuZGVyZXJTdW1tYXJ5LmlzU3VidHJlZUZ1bGx5Q29tcGF0aWJsZSggUmVuZGVyZXIuYml0bWFza1NWRyApLCAnRW1wdHkgbm9kZSBmdWxseSBjb21wYXRpYmxlOiBTVkcnICk7XG4gIGFzc2VydC5vayggIWVtcHR5Tm9kZS5fcmVuZGVyZXJTdW1tYXJ5LmlzU3VidHJlZUNvbnRhaW5pbmdDb21wYXRpYmxlKCBSZW5kZXJlci5iaXRtYXNrQ2FudmFzICksICdFbXB0eSBub2RlIHBhcnRpYWxseSBjb21wYXRpYmxlOiBDYW52YXMnICk7XG4gIGFzc2VydC5vayggIWVtcHR5Tm9kZS5fcmVuZGVyZXJTdW1tYXJ5LmlzU3VidHJlZUNvbnRhaW5pbmdDb21wYXRpYmxlKCBSZW5kZXJlci5iaXRtYXNrU1ZHICksICdFbXB0eSBub2RlIHBhcnRpYWxseSBjb21wYXRpYmxlOiBTVkcnICk7XG4gIGFzc2VydC5vayggZW1wdHlOb2RlLl9yZW5kZXJlclN1bW1hcnkuaXNTaW5nbGVDYW52YXNTdXBwb3J0ZWQoKSwgJ0VtcHR5IG5vZGUgc3VwcG9ydHMgc2luZ2xlIENhbnZhcycgKTtcbiAgYXNzZXJ0Lm9rKCBlbXB0eU5vZGUuX3JlbmRlcmVyU3VtbWFyeS5pc1NpbmdsZVNWR1N1cHBvcnRlZCgpLCAnRW1wdHkgbm9kZSBzdXBwb3J0cyBzaW5nbGUgU1ZHJyApO1xuICBhc3NlcnQub2soIGVtcHR5Tm9kZS5fcmVuZGVyZXJTdW1tYXJ5LmlzTm90UGFpbnRlZCgpLCAnRW1wdHkgbm9kZSBpcyBub3QgcGFpbnRlZCcgKTtcbiAgYXNzZXJ0Lm9rKCBlbXB0eU5vZGUuX3JlbmRlcmVyU3VtbWFyeS5hcmVCb3VuZHNWYWxpZCgpLCAnRW1wdHkgbm9kZSBoYXMgdmFsaWQgYm91bmRzJyApO1xufSApOyJdLCJuYW1lcyI6WyJCb3VuZHMyIiwiVmVjdG9yMiIsIlNoYXBlIiwiQ2FudmFzTm9kZSIsIkNvbG9yIiwiRGlzcGxheSIsIkhTdHJ1dCIsIkxpbmUiLCJOb2RlIiwiUGF0aCIsIlJlY3RhbmdsZSIsIlJlbmRlcmVyIiwiU3BhY2VyIiwiVGV4dCIsIlRleHRCb3VuZHMiLCJUcmFpbCIsIlRyYWlsUG9pbnRlciIsIlV0aWxzIiwiVlN0cnV0IiwiV2ViR0xOb2RlIiwiUVVuaXQiLCJtb2R1bGUiLCJlcXVhbHNBcHByb3giLCJhc3NlcnQiLCJhIiwiYiIsIm1lc3NhZ2UiLCJvayIsIk1hdGgiLCJhYnMiLCJjcmVhdGVUZXN0Tm9kZVRyZWUiLCJub2RlIiwiYWRkQ2hpbGQiLCJjaGlsZHJlbiIsInRlc3QiLCJ2YWxpZGF0ZUJvdW5kcyIsIl9jaGlsZEJvdW5kc0RpcnR5IiwiaW52YWxpZGF0ZUJvdW5kcyIsImNhbnZhcyIsImRvY3VtZW50IiwiY3JlYXRlRWxlbWVudCIsImNvbnRleHQiLCJnZXRDb250ZXh0IiwibmVlZGVkTWV0aG9kcyIsIl8iLCJlYWNoIiwibWV0aG9kIiwidW5kZWZpbmVkIiwidHJhaWwiLCJlcXVhbCIsImxlbmd0aCIsIm5leHQiLCJwcmV2aW91cyIsInRyYWlscyIsImN1cnJlbnRUcmFpbCIsInB1c2giLCJpIiwiaiIsImNvbXBhcmlzb24iLCJjb21wYXJlIiwibWFwIiwidG9TdHJpbmciLCJqb2luIiwiaW5jbHVzaXZlTGlzdCIsImVhY2hUcmFpbEJldHdlZW4iLCJjb3B5IiwidHJhaWxTdHJpbmciLCJlcXVhbHMiLCJleGNsdXNpdmVMaXN0IiwidmlzaWJsZSIsImRlcHRoRmlyc3RVbnRpbCIsInBvaW50ZXIiLCJsYXN0Tm9kZSIsImlzVmlzaWJsZSIsImVhY2hUcmFpbFVuZGVyIiwiZ2V0VW5pcXVlVHJhaWwiLCJjb21wYXJlUmVuZGVyIiwicG9pbnRlcnMiLCJjb21wYXJlTmVzdGVkIiwiZm9yd2FyZHNDb3B5IiwibmVzdGVkRm9yd2FyZHMiLCJiYWNrd2FyZHNDb3B5IiwibmVzdGVkQmFja3dhcmRzIiwiY29udGVudHMiLCJpc09rIiwiayIsImluZGljZXMiLCJtZXRyaWNzIiwibWVhc3VyZVRleHQiLCJ3aWR0aCIsImMiLCJzZXRTaGFwZSIsInJlY3RhbmdsZSIsInJlbW92ZUNoaWxkIiwicmVjdEJvdW5kcyIsImNhbnZhc0FjY3VyYXRlQm91bmRzIiwiZmlsbFJlY3QiLCJtaW5YIiwibWluWSIsIm1heFgiLCJtYXhZIiwidGV4dEJvdW5kcyIsImZpbGxUZXh0IiwiaXNDb25zaXN0ZW50IiwicHJlY2lzaW9uIiwidGV4dCIsImFjY3VyYXRlQ2FudmFzQm91bmRzRmFsbGJhY2siLCJmaWxsIiwiZ2V0RmlsbCIsIm90aGVyTm9kZSIsInNjYWxlIiwidHJhbnNsYXRlIiwicm90YXRlIiwiUEkiLCJnZXRNYXRyaXgiLCJtMDAiLCJtMDEiLCJtMDIiLCJtMTAiLCJtMTEiLCJtMTIiLCJ4IiwieSIsInJvdGF0aW9uIiwidHJhbnNsYXRpb24iLCJsZWZ0IiwicmlnaHQiLCJjZW50ZXJYIiwic2NlbmUiLCJkaXNwbGF5IiwiaGVpZ2h0IiwiY291bnQiLCJzaXplUHJvcGVydHkiLCJsYXp5TGluayIsInNpemUiLCJzZXRXaWR0aEhlaWdodCIsInJlY3QiLCJlcHNpbG9uIiwiY2hpbGRCb3VuZHNQcm9wZXJ0eSIsImNoaWxkQm91bmRzIiwiZXF1YWxzRXBzaWxvbiIsImJvdW5kc1Byb3BlcnR5IiwiYm91bmRzIiwic2VsZkJvdW5kc1Byb3BlcnR5Iiwic2VsZkJvdW5kcyIsInJlY3RIZWlnaHQiLCJjb2xvciIsInNldFJHQkEiLCJ2aXNpYmxlQm91bmRzIiwiTk9USElORyIsImxvY2FsQm91bmRzIiwiY29tcGFyZVRyYWlsQXJyYXlzIiwic2xpY2UiLCJzcGxpY2UiLCJkIiwiZSIsIndpbmRvdyIsInRocm93cyIsImdldFRyYWlscyIsInBhcmVudHMiLCJnZXRVbmlxdWVMZWFmVHJhaWwiLCJnZXRMZWFmVHJhaWxzIiwiZ2V0TGVhZlRyYWlsc1RvIiwibGluZSIsInN0cm9rZSIsImxpbmVXaWR0aCIsInBvc2l0aW9ucyIsIngxIiwieTEiLCJ4MiIsInkyIiwiY2FwcyIsInBvc2l0aW9uIiwibXV0YXRlIiwiY2FwIiwibGluZUNhcCIsImdldFNoYXBlIiwiZ2V0U3Ryb2tlZFNoYXBlIiwiZ2V0TGluZVN0eWxlcyIsIkpTT04iLCJzdHJpbmdpZnkiLCJtYXhXaWR0aCIsInJlY3RXaWR0aCIsIm1heEhlaWdodCIsInNwYWNlciIsImhzdHJ1dCIsInZzdHJ1dCIsImNhbnZhc05vZGUiLCJjYW52YXNCb3VuZHMiLCJ3ZWJnbE5vZGUiLCJlbXB0eU5vZGUiLCJfcmVuZGVyZXJTdW1tYXJ5IiwiaXNTdWJ0cmVlRnVsbHlDb21wYXRpYmxlIiwiYml0bWFza0NhbnZhcyIsImJpdG1hc2tTVkciLCJpc1N1YnRyZWVDb250YWluaW5nQ29tcGF0aWJsZSIsImlzU2luZ2xlQ2FudmFzU3VwcG9ydGVkIiwiaXNTaW5nbGVTVkdTdXBwb3J0ZWQiLCJpc05vdFBhaW50ZWQiLCJhcmVCb3VuZHNWYWxpZCIsImJpdG1hc2tXZWJHTCJdLCJtYXBwaW5ncyI6IkFBQUEsc0RBQXNEO0FBRXREOzs7O0NBSUMsR0FFRCxPQUFPQSxhQUFhLDZCQUE2QjtBQUNqRCxPQUFPQyxhQUFhLDZCQUE2QjtBQUNqRCxTQUFTQyxLQUFLLFFBQVEsOEJBQThCO0FBQ3BELFNBQVNDLFVBQVUsRUFBRUMsS0FBSyxFQUFFQyxPQUFPLEVBQUVDLE1BQU0sRUFBRUMsSUFBSSxFQUFFQyxJQUFJLEVBQUVDLElBQUksRUFBRUMsU0FBUyxFQUFFQyxRQUFRLEVBQUVDLE1BQU0sRUFBRUMsSUFBSSxFQUFFQyxVQUFVLEVBQUVDLEtBQUssRUFBRUMsWUFBWSxFQUFFQyxLQUFLLEVBQUVDLE1BQU0sRUFBRUMsU0FBUyxRQUFRLGdCQUFnQjtBQUVuTEMsTUFBTUMsTUFBTSxDQUFFO0FBRWQsU0FBU0MsYUFBY0MsTUFBTSxFQUFFQyxDQUFDLEVBQUVDLENBQUMsRUFBRUMsT0FBTztJQUMxQ0gsT0FBT0ksRUFBRSxDQUFFQyxLQUFLQyxHQUFHLENBQUVMLElBQUlDLEtBQU0sV0FBVyxHQUFHLEFBQUVDLENBQUFBLFVBQVUsR0FBR0EsUUFBUSxFQUFFLENBQUMsR0FBRyxFQUFDLElBQU1GLEVBQUUsSUFBSSxFQUFFQyxH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QSxNQUFNRyxJQUFJO0lBQ2xCNUIsT0FBTzBCLEtBQUssQ0FBRSxHQUFHRCxNQUFNRSxNQUFNO0lBQzdCRixRQUFRQSxNQUFNRyxJQUFJO0lBQ2xCNUIsT0FBTzBCLEtBQUssQ0FBRSxHQUFHRCxNQUFNRSxNQUFNO0lBQzdCRixRQUFRQSxNQUFNRyxJQUFJO0lBQ2xCNUIsT0FBTzBCLEtBQUssQ0FBRSxHQUFHRCxNQUFNRSxNQUFNO0lBQzdCRixRQUFRQSxNQUFNRyxJQUFJO0lBQ2xCNUIsT0FBTzBCLEtBQUssQ0FBRSxHQUFHRCxNQUFNRSxNQUFNO0lBQzdCRixRQUFRQSxNQUFNRyxJQUFJO0lBQ2xCNUIsT0FBTzBCLEtBQUssQ0FBRSxHQUFHRCxNQUFNRSxNQUFNO0lBQzdCRixRQUFRQSxNQUFNRyxJQUFJO0lBQ2xCNUIsT0FBTzBCLEtBQUssQ0FBRSxHQUFHRCxNQUFNRSxNQUFNO0lBQzdCRixRQUFRQSxNQUFNRyxJQUFJO0lBQ2xCNUIsT0FBTzBCLEtBQUssQ0FBRSxHQUFHRCxNQUFNRSxNQUFNO0lBQzdCRixRQUFRQSxNQUFNRyxJQUFJO0lBQ2xCNUIsT0FBTzBCLEtBQUssQ0FBRSxHQUFHRCxNQUFNRSxNQUFNO0lBRTdCLDhDQUE4QztJQUM5QzNCLE9BQU8wQixLQUFLLENBQUUsTUFBTUQsTUFBTUcsSUFBSTtJQUU5QkgsUUFBUUEsTUFBTUksUUFBUTtJQUN0QjdCLE9BQU8wQixLQUFLLENBQUUsR0FBR0QsTUFBTUUsTUFBTTtJQUM3QkYsUUFBUUEsTUFBTUksUUFBUTtJQUN0QjdCLE9BQU8wQixLQUFLLENBQUUsR0FBR0QsTUFBTUUsTUFBTTtJQUM3QkYsUUFBUUEsTUFBTUksUUFBUTtJQUN0QjdCLE9BQU8wQixLQUFLLENBQUUsR0FBR0QsTUFBTUUsTUFBTTtJQUM3QkYsUUFBUUEsTUFBTUksUUFBUTtJQUN0QjdCLE9BQU8wQixLQUFLLENBQUUsR0FBR0QsTUFBTUUsTUFBTTtJQUM3QkYsUUFBUUEsTUFBTUksUUFBUTtJQUN0QjdCLE9BQU8wQixLQUFLLENBQUUsR0FBR0QsTUFBTUUsTUFB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YyxJQUFJO1FBQ3ZELElBQUkzRCxhQUFjZSxLQUFLRSxRQUFRLENBQUUsRUFBRyxDQUFDQSxRQUFRLENBQUUsRUFBRyxDQUFDMEMsY0FBYyxJQUFJO1FBQ3JFLElBQUkzRCxhQUFjZSxLQUFLRSxRQUFRLENBQUUsRUFBRyxDQUFDQSxRQUFRLENBQUUsRUFBRyxDQUFDMEMsY0FBYyxJQUFJO1FBQ3JFLElBQUkzRCxhQUFjZSxLQUFLRSxRQUFRLENBQUUsRUFBRyxDQUFDQSxRQUFRLENBQUUsRUFBRyxDQUFDMEMsY0FBYyxJQUFJO1FBQ3JFLElBQUkzRCxhQUFjZSxLQUFLRSxRQUFRLENBQUUsRUFBRyxDQUFDQSxRQUFRLENBQUUsRUFBRyxDQUFDMEMsY0FBYyxJQUFJO1FBQ3JFLElBQUkzRCxhQUFjZSxLQUFLRSxRQUFRLENBQUUsRUFBRyxDQUFDQSxRQUFRLENBQUUsRUFBRyxDQUFDQSxRQUFRLENBQUUsRUFBRyxDQUFDMEMsY0FBYyxJQUFJO1FBQ25GLElBQUkzRCxhQUFjZSxLQUFLRSxRQUFRLENBQUUsRUFBRyxDQUFDQSxRQUFRLENBQUUsRUFBRyxDQUFDQSxRQUFRLENBQUUsRUFBRyxDQUFDMEMsY0FBYyxJQUFJO1FBQ25GLElBQUkzRCxhQUFjZSxLQUFLRSxRQUFRLENBQUUsRUFBRyxDQUFDQSxRQUFRLENBQUUsRUFBRyxDQUFDMEMsY0FBYyxJQUFJO1FBQ3JFLElBQUkzRCxhQUFjZSxLQUFLRSxRQUFRLENBQUUsRUFBRyxDQUFDQSxRQUFRLENBQUUsRUFBRyxDQUFDMEMsY0FBYyxJQUFJO1FBQ3JFLElBQUkzRCxhQUFjZSxLQUFLRSxRQUFRLENBQUUsRUFBRyxDQUFDQSxRQUFRLENBQUUsRUFBRyxDQUFDMEMsY0FBYyxJQUFJO1FBQ3JFLElBQUkzRCxhQUFjZSxLQUFLRSxRQUFRLENBQUUsRUFBRyxDQUFDQSxRQUFRLENBQUUsRUFBRyxDQUFDMEMsY0FBYyxJQUFJO1FBQ3JFLElBQUkzRCxhQUFjZSxLQUFLRSxRQUFRLENBQUUsRUFBRyxDQUFDQSxRQUFRLENBQUUsRUFBRyxDQUFDQSxRQUFRLENBQUUsRUFBRyxDQUFDMEMsY0FBYyxJQUFJO1FBQ25GLElBQUkzRCxhQUFjZSxLQUFLRSxRQUFRLENBQUUsRUFBRyxDQUFDQSxRQUFRLENBQUUsRUFBRyxDQUFDQSxRQUFRLENBQUUsRUFBRyxDQUFDMEMsY0FBYyxJQUFJO1FBQ25GLElBQUkzRCxhQUFjZSxLQUFLRSxRQUFRLENBQUUsRUFBRyxDQUFDQSxRQUFRLENBQUUsRUFBRyxDQUFDQSxRQUFRLENBQUUsRUFBRyxDQUFDQSxRQUFRLENBQUUsRUFBRyxDQUFDMEMsY0FBYyxJQUFJO1FBQ2pHLElBQUkzRCxhQUFjZSxLQUFLRSxRQUFRLENBQUUsRUFBRyxDQUFDQSxRQUFRLENBQUUsRUFBRyxDQUFDQSxRQUFRLENBQUUsRUFBRyxDQUFDQSxRQUFRLENBQUUsRUFBRyxDQUFDMEMsY0FBYyxJQUFJO1FBQ2pHLElBQUkzRCxhQUFjZSxLQUFLRSxRQUFRLENBQUUsRUFBRyxDQUFDQSxRQUFRLENBQUUsRUFBRyxDQUFDQSxRQUFRLENBQUUsRUFBRyxDQUFDMEMsY0FBYyxJQUFJO1FBQ25GLElBQUkzRCxhQUFjZSxLQUFLRSxRQUFRLENBQUUsRUFBRyxDQUFDQSxRQUFRLENBQUUsRUFBRyxDQUFDQSxRQUFRLENBQUUsRUFBRyxDQUFDMEMsY0FBYyxJQUFJO1FBQ25GLElBQUkzRCxhQUFjZSxLQUFLRSxRQUFRLENBQUUsRUFBRyxDQUFDQSxRQUFRLENBQUUsRUFBRyxDQUFDMEMsY0FBYyxJQUFJO1FBQ3JFLElBQUkzRCxhQUFjZSxLQUFLRSxRQUFRLENBQUUsRUFBRyxDQUFDQSxRQUFRLENBQUUsRUFBRyxDQUFDMEMsY0FBYyxJQUFJO1FBQ3JFLElBQUkzRCxhQUFjZSxLQUFLRSxRQUFRLENBQUUsRUFBRyxDQUFDMEMsY0FBYyxJQUFJO1FBQ3ZELElBQUkzRCxhQUFjZSxLQUFLRSxRQUFRLENBQUUsRUFBRyxDQUFDMEMsY0FBYyxJQUFJO1FBQ3ZELElBQUkzRCxhQUFjZSxLQUFLRSxRQUFRLENBQUUsRUFBRyxDQUFDMEMsY0FBYyxJQUFJO1FBQ3ZELElBQUkzRCxhQUFjZSxLQUFLRSxRQUFRLENBQUUsRUFBRyxDQUFDMEMsY0FBYyxJQUFJO0tBQ3hEO0lBRUQsbUlBQW1JO0lBQ25JLElBQU0sSUFBSW5CLElBQUksR0FBR0EsSUFBSXFCLFNBQVMzQixNQUFNLEVBQUVNLElBQU07UUFDMUMsSUFBTSxJQUFJQyxJQUFJRCxHQUFHQyxJQUFJb0IsU0FBUzNCLE1BQU0sRUFBRU8sSUFBTTtZQUMxQyxNQUFNQyxhQUFhbUIsUUFBUSxDQUFFckIsRUFBRyxDQUFDb0IsYUFBYSxDQUFFQyxRQUFRLENBQUVwQixFQUFHO1lBRTdELElBQUtDLGVBQWUsQ0FBQyxHQUFJO2dCQUN2Qm5DLE9BQU9JLEVBQUUsQ0FBRTZCLElBQUlDLEdBQUcsR0FBR0QsRUFBRSxDQUFDLEVBQUVDLEdBQUc7WUFDL0I7WUFDQSxJQUFLQyxlQUFlLEdBQUk7Z0JBQ3RCbkMsT0FBT0ksRUFBRSxDQUFFNkIsSUFBSUMsR0FBRyxHQUFHRCxFQUFFLENBQUMsRUFBRUMsR0FBRztZQUMvQjtRQUNGO0lBQ0Y7QUFDRjtBQUVBckMsTUFBTWMsSUFBSSxDQUFFLHdEQUF3RFgsQ0FBQUE7SUFDbEUsTUFBTVEsT0FBT0Q7SUFFYixtQ0FBbUM7SUFDbkMsTUFBTStDLFdBQVc7UUFDZixJQUFJN0QsYUFBY2UsS0FBSzRDLGNBQWMsSUFBSTtRQUN6QyxJQUFJM0QsYUFBY2UsS0FBS0UsUUFBUSxDQUFFLEVBQUcsQ0FBQzBDLGNBQWMsSUFBSTtRQUN2RCxJQUFJM0QsYUFBY2UsS0FBS0UsUUFBUSxDQUFFLEVBQUcsQ0FBQ0EsUUFBUSxDQUFFLEVBQUcsQ0FBQzBDLGNBQWMsSUFBSTtRQUNyRSxJQUFJM0QsYUFBY2UsS0FBS0UsUUFBUSxDQUFFLEVBQUcsQ0FBQ0EsUUFBUSxDQUFFLEVBQUcsQ0FBQzBDLGNBQWMsSUFBSTtRQUNyRSxJQUFJM0QsYUFBY2UsS0FBS0UsUUFBUSxDQUFFLEVBQUcsQ0FBQ0EsUUFBUSxDQUFFLEVBQUcsQ0FBQzBDLGNBQWMsSUFBSTtRQUNyRSxJQUFJM0QsYUFBY2UsS0FBS0UsUUFBUSxDQUFFLEVBQUcsQ0FBQ0EsUUFBUSxDQUFFLEVBQUcsQ0FBQ0EsUUFBUSxDQUFFLEVBQUcsQ0FBQzBDLGNBQWMsSUFBSTtRQUNuRixJQUFJM0QsYUFBY2UsS0FBS0UsUUFBUSxDQUFFLEVBQUcsQ0FBQ0EsUUFBUSxDQUFFLEVBQUcsQ0FBQ0EsUUFBUSxDQUFFLEVBQUcsQ0FBQzBDLGNBQWMsSUFBSTtRQUNuRixJQUFJM0QsYUFBY2UsS0FBS0UsUUFBUSxDQUFFLEVBQUcsQ0FBQ0EsUUFBUSxDQUFFLEVBQUcsQ0FBQzBDLGNBQWMsSUFBSTtRQUNyRSxJQUFJM0QsYUFBY2UsS0FBS0UsUUFBUSxDQUFFLEVBQUcsQ0FBQ0EsUUFBUSxDQUFFLEVBQUcsQ0FBQzBDLGNBQWMsSUFBSTtRQUNyRSxJQUFJM0QsYUFBY2UsS0FBS0UsUUFBUSxDQUFFLEVBQUcsQ0FBQ0EsUUFBUSxDQUFFLEVBQUcsQ0FBQzBDLGNBQWMsSUFBSTtRQUNyRSxJQUFJM0QsYUFBY2UsS0FBS0UsUUFBUSxDQUFFLEVBQUcsQ0FBQ0EsUUFBUSxDQUFFLEVBQUcsQ0FBQzBDLGNBQWMsSUFBSTtRQUNyRSxJQUFJM0QsYUFBY2UsS0FBS0UsUUFBUSxDQUFFLEVBQUcsQ0FBQ0EsUUFBUSxDQUFFLEVBQUcsQ0FBQ0EsUUFBUSxDQUFFLEVBQUcsQ0FBQzBDLGNBQWMsSUFBSTtRQUNuRixJQUFJM0QsYUFBY2UsS0FBS0UsUUFBUSxDQUFFLEVBQUcsQ0FBQ0EsUUFBUSxDQUFFLEVBQUcsQ0FBQ0EsUUFBUSxDQUFFLEVBQUcsQ0FBQ0EsUUFBUSxDQUFFLEVBQUcsQ0FBQzBDLGNBQWMsSUFBSTtRQUNqRyxJQUFJM0QsYUFBY2UsS0FBS0UsUUFBUSxDQUFFLEVBQUcsQ0FBQ0EsUUFBUSxDQUFFLEVBQUcsQ0FBQ0EsUUFBUSxDQUFFLEVBQUcsQ0FBQ0EsUUFBUSxDQUFFLEVBQUcsQ0FBQzBDLGNBQWMsSUFBSTtRQUNqRyxJQUFJM0QsYUFBY2UsS0FBS0UsUUFBUSxDQUFFLEVBQUcsQ0FBQ0EsUUFBUSxDQUFFLEVBQUcsQ0FBQ0EsUUFBUSxDQUFFLEVBQUcsQ0FBQzBDLGNBQWMsSUFBSTtRQUNuRixJQUFJM0QsYUFBY2UsS0FBS0UsUUFBUSxDQUFFLEVBQUcsQ0FBQ0EsUUFBUSxDQUFFLEVBQUcsQ0FBQ0EsUUFBUSxDQUFFLEVBQUcsQ0FBQzBDLGNBQWMsSUFBSTtRQUNuRixJQUFJM0QsYUFBY2UsS0FBS0UsUUFBUSxDQUFFLEVBQUcsQ0FBQ0EsUUFBUSxDQUFFLEVBQUcsQ0FBQ0EsUUFBUSxDQUFFLEVBQUcsQ0FBQzBDLGNBQWMsSUFBSTtRQUNuRixJQUFJM0QsYUFBY2UsS0FBS0UsUUFBUSxDQUFFLEVBQUcsQ0FBQ0EsUUFBUSxDQUFFLEVBQUcsQ0FBQzBDLGNBQWMsSUFBSTtRQUNyRSxJQUFJM0QsYUFBY2UsS0FBS0UsUUFBUSxDQUFFLEVBQUcsQ0FBQ0EsUUFBUSxDQUFFLEVBQUcsQ0FBQzBDLGNBQWMsSUFBSTtRQUNyRSxJQUFJM0QsYUFBY2UsS0FBS0UsUUFBUSxDQUFFLEVBQUcsQ0FBQ0EsUUFBUSxDQUFFLEVBQUcsQ0FBQzBDLGNBQWMsSUFBSTtRQUNyRSxJQUFJM0QsYUFBY2UsS0FBS0UsUUFBUSxDQUFFLEVBQUcsQ0FBQzBDLGNBQWMsSUFBSTtRQUN2RCxJQUFJM0QsYUFBY2UsS0FBS0UsUUFBUSxDQUFFLEVBQUcsQ0FBQzBDLGNBQWMsSUFBSTtRQUN2RCxJQUFJM0QsYUFBY2UsS0FBS0UsUUFBUSxDQUFFLEVBQUcsQ0FBQzBDLGNBQWMsSUFBSTtRQUN2RCxJQUFJM0QsYUFBY2UsS0FBS0UsUUFBUSxDQUFFLEVBQUcsQ0FBQzBDLGNBQWMsSUFBSTtRQUN2RCxJQUFJM0QsYUFBY2UsS0FBS0UsUUFBUSxDQUFFLEVBQUcsQ0FBQzBDLGNBQWMsSUFBSTtRQUN2RCxJQUFJM0QsYUFBY2UsS0FBSzRDLGNBQWMsSUFBSTtLQUMxQztJQUVELDZEQUE2RDtJQUM3RCxJQUFNLElBQUluQixJQUFJLEdBQUdBLElBQUlxQixTQUFTM0IsTUFBTSxFQUFFTSxJQUFNO1FBQzFDLElBQU0sSUFBSUMsSUFBSUQsR0FBR0MsSUFBSW9CLFNBQVMzQixNQUFNLEVB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