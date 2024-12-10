// Copyright 2017-2024, University of Colorado Boulder
/**
 * Display tests
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */ import { Shape } from '../../../kite/js/imports.js';
import Circle from '../nodes/Circle.js';
import DOM from '../nodes/DOM.js';
import Image from '../nodes/Image.js';
import Line from '../nodes/Line.js';
import Node from '../nodes/Node.js';
import Path from '../nodes/Path.js';
import Rectangle from '../nodes/Rectangle.js';
import Text from '../nodes/Text.js';
import CanvasContextWrapper from '../util/CanvasContextWrapper.js';
import Display from './Display.js';
import CircleCanvasDrawable from './drawables/CircleCanvasDrawable.js';
import CircleDOMDrawable from './drawables/CircleDOMDrawable.js';
import CircleSVGDrawable from './drawables/CircleSVGDrawable.js';
import DOMDrawable from './drawables/DOMDrawable.js';
import ImageCanvasDrawable from './drawables/ImageCanvasDrawable.js';
import ImageDOMDrawable from './drawables/ImageDOMDrawable.js';
import ImageSVGDrawable from './drawables/ImageSVGDrawable.js';
import LineCanvasDrawable from './drawables/LineCanvasDrawable.js';
import LineSVGDrawable from './drawables/LineSVGDrawable.js';
import PathCanvasDrawable from './drawables/PathCanvasDrawable.js';
import PathSVGDrawable from './drawables/PathSVGDrawable.js';
import RectangleCanvasDrawable from './drawables/RectangleCanvasDrawable.js';
import RectangleDOMDrawable from './drawables/RectangleDOMDrawable.js';
import RectangleSVGDrawable from './drawables/RectangleSVGDrawable.js';
import TextCanvasDrawable from './drawables/TextCanvasDrawable.js';
import TextDOMDrawable from './drawables/TextDOMDrawable.js';
import TextSVGDrawable from './drawables/TextSVGDrawable.js';
import Instance from './Instance.js';
import Renderer from './Renderer.js';
QUnit.module('Display');
QUnit.test('Drawables (Rectangle)', (assert)=>{
    // The stubDisplay It's a hack that implements the subset of the Display API needed where called. It will definitely
    // be removed. The reason it stores the frame ID is because much of Scenery 0.2 uses ID comparison to determine
    // dirty state. That allows us to not have to set dirty states back to "clean" afterwards.  See #296
    const stubDisplay = {
        _frameId: 5,
        isWebGLAllowed: ()=>true
    };
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 48;
    const context = canvas.getContext('2d');
    const wrapper = new CanvasContextWrapper(canvas, context);
    const r1 = new Rectangle(5, 10, 100, 50, 0, 0, {
        fill: 'red',
        stroke: 'blue',
        lineWidth: 5
    });
    const r1i = new Instance(stubDisplay, r1.getUniqueTrail());
    const r1dd = r1.createDOMDrawable(Renderer.bitmaskDOM, r1i);
    const r1ds = r1.createSVGDrawable(Renderer.bitmaskSVG, r1i);
    const r1dc = r1.createCanvasDrawable(Renderer.bitmaskCanvas, r1i);
    assert.ok(r1._drawables.length === 3, 'After init, should have drawable refs');
    r1dd.updateDOM();
    r1ds.updateSVG();
    r1dc.paintCanvas(wrapper, r1);
    r1.setRect(0, 0, 100, 100, 5, 5);
    r1dd.updateDOM();
    r1ds.updateSVG();
    r1dc.paintCanvas(wrapper, r1);
    r1.stroke = null;
    r1.fill = null;
    r1dd.updateDOM();
    r1ds.updateSVG();
    r1dc.paintCanvas(wrapper, r1);
    r1dd.dispose();
    r1ds.dispose();
    r1dc.dispose();
    assert.ok(r1._drawables.length === 0, 'After dispose, should not have drawable refs');
    assert.ok(RectangleDOMDrawable.pool.length > 0, 'Disposed drawable returned to pool');
    assert.ok(RectangleSVGDrawable.pool.length > 0, 'Disposed drawable returned to pool');
    assert.ok(RectangleCanvasDrawable.pool.length > 0, 'Disposed drawable returned to pool');
});
QUnit.test('Drawables (Circle)', (assert)=>{
    const stubDisplay = {
        _frameId: 5,
        isWebGLAllowed: ()=>true
    };
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 48;
    const context = canvas.getContext('2d');
    const wrapper = new CanvasContextWrapper(canvas, context);
    const r1 = new Circle(50, {
        fill: 'red',
        stroke: 'blue',
        lineWidth: 5
    });
    const r1i = new Instance(stubDisplay, r1.getUniqueTrail());
    const r1dd = r1.createDOMDrawable(Renderer.bitmaskDOM, r1i);
    const r1ds = r1.createSVGDrawable(Renderer.bitmaskSVG, r1i);
    const r1dc = r1.createCanvasDrawable(Renderer.bitmaskCanvas, r1i);
    assert.ok(r1._drawables.length === 3, 'After init, should have drawable refs');
    r1dd.updateDOM();
    r1ds.updateSVG();
    r1dc.paintCanvas(wrapper, r1);
    r1.setRadius(100);
    r1dd.updateDOM();
    r1ds.updateSVG();
    r1dc.paintCanvas(wrapper, r1);
    r1.stroke = null;
    r1.fill = null;
    r1dd.updateDOM();
    r1ds.updateSVG();
    r1dc.paintCanvas(wrapper, r1);
    r1dd.dispose();
    r1ds.dispose();
    r1dc.dispose();
    assert.ok(r1._drawables.length === 0, 'After dispose, should not have drawable refs');
    assert.ok(CircleDOMDrawable.pool.length > 0, 'Disposed drawable returned to pool');
    assert.ok(CircleSVGDrawable.pool.length > 0, 'Disposed drawable returned to pool');
    assert.ok(CircleCanvasDrawable.pool.length > 0, 'Disposed drawable returned to pool');
});
QUnit.test('Drawables (Line)', (assert)=>{
    const stubDisplay = {
        _frameId: 5,
        isWebGLAllowed: ()=>true
    };
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 48;
    const context = canvas.getContext('2d');
    const wrapper = new CanvasContextWrapper(canvas, context);
    const r1 = new Line(0, 1, 2, 3, {
        fill: 'red',
        stroke: 'blue',
        lineWidth: 5
    });
    const r1i = new Instance(stubDisplay, r1.getUniqueTrail());
    const r1ds = r1.createSVGDrawable(Renderer.bitmaskSVG, r1i);
    const r1dc = r1.createCanvasDrawable(Renderer.bitmaskCanvas, r1i);
    assert.ok(r1._drawables.length === 2, 'After init, should have drawable refs');
    r1ds.updateSVG();
    r1dc.paintCanvas(wrapper, r1);
    r1.x1 = 50;
    r1.x2 = 100;
    r1ds.updateSVG();
    r1dc.paintCanvas(wrapper, r1);
    r1.stroke = null;
    r1.fill = null;
    r1ds.updateSVG();
    r1dc.paintCanvas(wrapper, r1);
    r1ds.dispose();
    r1dc.dispose();
    assert.ok(r1._drawables.length === 0, 'After dispose, should not have drawable refs');
    assert.ok(LineSVGDrawable.pool.length > 0, 'Disposed drawable returned to pool');
    assert.ok(LineCanvasDrawable.pool.length > 0, 'Disposed drawable returned to pool');
});
QUnit.test('Drawables (Path)', (assert)=>{
    const stubDisplay = {
        _frameId: 5,
        isWebGLAllowed: ()=>true
    };
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 48;
    const context = canvas.getContext('2d');
    const wrapper = new CanvasContextWrapper(canvas, context);
    const r1 = new Path(Shape.regularPolygon(5, 10), {
        fill: 'red',
        stroke: 'blue',
        lineWidth: 5
    });
    const r1i = new Instance(stubDisplay, r1.getUniqueTrail());
    const r1ds = r1.createSVGDrawable(Renderer.bitmaskSVG, r1i);
    const r1dc = r1.createCanvasDrawable(Renderer.bitmaskCanvas, r1i);
    assert.ok(r1._drawables.length === 2, 'After init, should have drawable refs');
    r1ds.updateSVG();
    r1dc.paintCanvas(wrapper, r1);
    r1.shape = Shape.regularPolygon(6, 20);
    r1ds.updateSVG();
    r1dc.paintCanvas(wrapper, r1);
    r1.stroke = null;
    r1.fill = null;
    r1ds.updateSVG();
    r1dc.paintCanvas(wrapper, r1);
    r1.shape = null;
    r1ds.updateSVG();
    r1dc.paintCanvas(wrapper, r1);
    r1ds.dispose();
    r1dc.dispose();
    assert.ok(r1._drawables.length === 0, 'After dispose, should not have drawable refs');
    assert.ok(PathSVGDrawable.pool.length > 0, 'Disposed drawable returned to pool');
    assert.ok(PathCanvasDrawable.pool.length > 0, 'Disposed drawable returned to pool');
});
QUnit.test('Drawables (Text)', (assert)=>{
    const stubDisplay = {
        _frameId: 5,
        isWebGLAllowed: ()=>true
    };
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 48;
    const context = canvas.getContext('2d');
    const wrapper = new CanvasContextWrapper(canvas, context);
    const r1 = new Text('Wow!', {
        fill: 'red',
        stroke: 'blue',
        lineWidth: 5
    });
    const r1i = new Instance(stubDisplay, r1.getUniqueTrail());
    const r1dd = r1.createDOMDrawable(Renderer.bitmaskDOM, r1i);
    const r1ds = r1.createSVGDrawable(Renderer.bitmaskSVG, r1i);
    const r1dc = r1.createCanvasDrawable(Renderer.bitmaskCanvas, r1i);
    assert.ok(r1._drawables.length === 3, 'After init, should have drawable refs');
    r1dd.updateDOM();
    r1ds.updateSVG();
    r1dc.paintCanvas(wrapper, r1);
    r1.string = 'b';
    r1dd.updateDOM();
    r1ds.updateSVG();
    r1dc.paintCanvas(wrapper, r1);
    r1.font = '20px sans-serif';
    r1dd.updateDOM();
    r1ds.updateSVG();
    r1dc.paintCanvas(wrapper, r1);
    r1.stroke = null;
    r1.fill = null;
    r1dd.updateDOM();
    r1ds.updateSVG();
    r1dc.paintCanvas(wrapper, r1);
    r1dd.dispose();
    r1ds.dispose();
    r1dc.dispose();
    assert.ok(r1._drawables.length === 0, 'After dispose, should not have drawable refs');
    assert.ok(TextDOMDrawable.pool.length > 0, 'Disposed drawable returned to pool');
    assert.ok(TextSVGDrawable.pool.length > 0, 'Disposed drawable returned to pool');
    assert.ok(TextCanvasDrawable.pool.length > 0, 'Disposed drawable returned to pool');
});
QUnit.test('Drawables (Image)', (assert)=>{
    const stubDisplay = {
        _frameId: 5,
        isWebGLAllowed: ()=>true
    };
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 48;
    const context = canvas.getContext('2d');
    const wrapper = new CanvasContextWrapper(canvas, context);
    // 1x1 black PNG
    const r1 = new Image('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIW2NkYGD4DwABCQEBtxmN7wAAAABJRU5ErkJggg==');
    const r1i = new Instance(stubDisplay, r1.getUniqueTrail());
    const r1dd = r1.createDOMDrawable(Renderer.bitmaskDOM, r1i);
    const r1ds = r1.createSVGDrawable(Renderer.bitmaskSVG, r1i);
    const r1dc = r1.createCanvasDrawable(Renderer.bitmaskCanvas, r1i);
    assert.ok(r1._drawables.length === 3, 'After init, should have drawable refs');
    r1dd.updateDOM();
    r1ds.updateSVG();
    r1dc.paintCanvas(wrapper, r1);
    // 1x1 black JPG
    r1.image = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAMCAgICAgMCAgIDAwMDBAYEBAQEBAgGBgUGCQgKCgkICQkKDA8MCgsOCwkJDRENDg8QEBEQCgwSExIQEw8QEBD/2wBDAQMDAwQDBAgEBAgQCwkLEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBD/wAARCAABAAEDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwD8qqKKKAP/2Q==';
    r1dd.updateDOM();
    r1ds.updateSVG();
    r1dc.paintCanvas(wrapper, r1);
    r1dd.dispose();
    r1ds.dispose();
    r1dc.dispose();
    assert.ok(r1._drawables.length === 0, 'After dispose, should not have drawable refs');
    assert.ok(ImageDOMDrawable.pool.length > 0, 'Disposed drawable returned to pool');
    assert.ok(ImageSVGDrawable.pool.length > 0, 'Disposed drawable returned to pool');
    assert.ok(ImageCanvasDrawable.pool.length > 0, 'Disposed drawable returned to pool');
});
QUnit.test('Drawables (DOM)', (assert)=>{
    const stubDisplay = {
        _frameId: 5,
        isWebGLAllowed: ()=>true
    };
    const r1 = new DOM(document.createElement('canvas'));
    const r1i = new Instance(stubDisplay, r1.getUniqueTrail());
    const r1dd = r1.createDOMDrawable(Renderer.bitmaskDOM, r1i);
    assert.ok(r1._drawables.length === 1, 'After init, should have drawable refs');
    r1dd.updateDOM();
    r1dd.dispose();
    assert.ok(r1._drawables.length === 0, 'After dispose, should not have drawable refs');
    assert.ok(DOMDrawable.pool.length > 0, 'Disposed drawable returned to pool');
});
QUnit.test('Renderer order bitmask', (assert)=>{
    // init test
    let mask = Renderer.createOrderBitmask(Renderer.bitmaskCanvas, Renderer.bitmaskSVG, Renderer.bitmaskDOM, Renderer.bitmaskWebGL);
    assert.equal(Renderer.bitmaskOrder(mask, 0), Renderer.bitmaskCanvas);
    assert.equal(Renderer.bitmaskOrder(mask, 1), Renderer.bitmaskSVG);
    assert.equal(Renderer.bitmaskOrder(mask, 2), Renderer.bitmaskDOM);
    assert.equal(Renderer.bitmaskOrder(mask, 3), Renderer.bitmaskWebGL);
    // empty test
    mask = Renderer.createOrderBitmask();
    assert.equal(Renderer.bitmaskOrder(mask, 0), 0);
    assert.equal(Renderer.bitmaskOrder(mask, 1), 0);
    assert.equal(Renderer.bitmaskOrder(mask, 2), 0);
    assert.equal(Renderer.bitmaskOrder(mask, 3), 0);
    // pushing single renderer should work
    mask = Renderer.pushOrderBitmask(mask, Renderer.bitmaskSVG);
    assert.equal(Renderer.bitmaskOrder(mask, 0), Renderer.bitmaskSVG);
    assert.equal(Renderer.bitmaskOrder(mask, 1), 0);
    assert.equal(Renderer.bitmaskOrder(mask, 2), 0);
    assert.equal(Renderer.bitmaskOrder(mask, 3), 0);
    // pushing again should have no change
    mask = Renderer.pushOrderBitmask(mask, Renderer.bitmaskSVG);
    assert.equal(Renderer.bitmaskOrder(mask, 0), Renderer.bitmaskSVG);
    assert.equal(Renderer.bitmaskOrder(mask, 1), 0);
    assert.equal(Renderer.bitmaskOrder(mask, 2), 0);
    assert.equal(Renderer.bitmaskOrder(mask, 3), 0);
    // pushing Canvas will put it first, SVG second
    mask = Renderer.pushOrderBitmask(mask, Renderer.bitmaskCanvas);
    assert.equal(Renderer.bitmaskOrder(mask, 0), Renderer.bitmaskCanvas);
    assert.equal(Renderer.bitmaskOrder(mask, 1), Renderer.bitmaskSVG);
    assert.equal(Renderer.bitmaskOrder(mask, 2), 0);
    assert.equal(Renderer.bitmaskOrder(mask, 3), 0);
    // pushing SVG will reverse the two
    mask = Renderer.pushOrderBitmask(mask, Renderer.bitmaskSVG);
    assert.equal(Renderer.bitmaskOrder(mask, 0), Renderer.bitmaskSVG);
    assert.equal(Renderer.bitmaskOrder(mask, 1), Renderer.bitmaskCanvas);
    assert.equal(Renderer.bitmaskOrder(mask, 2), 0);
    assert.equal(Renderer.bitmaskOrder(mask, 3), 0);
    assert.equal(Renderer.bitmaskOrder(mask, 4), 0);
    // pushing DOM shifts the other two down
    mask = Renderer.pushOrderBitmask(mask, Renderer.bitmaskDOM);
    assert.equal(Renderer.bitmaskOrder(mask, 0), Renderer.bitmaskDOM);
    assert.equal(Renderer.bitmaskOrder(mask, 1), Renderer.bitmaskSVG);
    assert.equal(Renderer.bitmaskOrder(mask, 2), Renderer.bitmaskCanvas);
    assert.equal(Renderer.bitmaskOrder(mask, 3), 0);
    // pushing DOM results in no change
    mask = Renderer.pushOrderBitmask(mask, Renderer.bitmaskDOM);
    assert.equal(Renderer.bitmaskOrder(mask, 0), Renderer.bitmaskDOM);
    assert.equal(Renderer.bitmaskOrder(mask, 1), Renderer.bitmaskSVG);
    assert.equal(Renderer.bitmaskOrder(mask, 2), Renderer.bitmaskCanvas);
    assert.equal(Renderer.bitmaskOrder(mask, 3), 0);
    // pushing Canvas moves it to the front
    mask = Renderer.pushOrderBitmask(mask, Renderer.bitmaskCanvas);
    assert.equal(Renderer.bitmaskOrder(mask, 0), Renderer.bitmaskCanvas);
    assert.equal(Renderer.bitmaskOrder(mask, 1), Renderer.bitmaskDOM);
    assert.equal(Renderer.bitmaskOrder(mask, 2), Renderer.bitmaskSVG);
    assert.equal(Renderer.bitmaskOrder(mask, 3), 0);
    // pushing DOM again swaps it with the Canvas
    mask = Renderer.pushOrderBitmask(mask, Renderer.bitmaskDOM);
    assert.equal(Renderer.bitmaskOrder(mask, 0), Renderer.bitmaskDOM);
    assert.equal(Renderer.bitmaskOrder(mask, 1), Renderer.bitmaskCanvas);
    assert.equal(Renderer.bitmaskOrder(mask, 2), Renderer.bitmaskSVG);
    assert.equal(Renderer.bitmaskOrder(mask, 3), 0);
    // console.log( mask.toString( 16 ) );
    // pushing WebGL shifts everything
    mask = Renderer.pushOrderBitmask(mask, Renderer.bitmaskWebGL);
    assert.equal(Renderer.bitmaskOrder(mask, 0), Renderer.bitmaskWebGL);
    assert.equal(Renderer.bitmaskOrder(mask, 1), Renderer.bitmaskDOM);
    assert.equal(Renderer.bitmaskOrder(mask, 2), Renderer.bitmaskCanvas);
    assert.equal(Renderer.bitmaskOrder(mask, 3), Renderer.bitmaskSVG);
// console.log( mask.toString( 16 ) );
});
QUnit.test('Empty Display usage', (assert)=>{
    const n = new Node();
    const d = new Display(n);
    d.updateDisplay();
    d.updateDisplay();
    assert.ok(true, 'so we have at least 1 test in this set');
    d.dispose();
});
QUnit.test('Simple Display usage', (assert)=>{
    const r = new Rectangle(0, 0, 50, 50, {
        fill: 'red'
    });
    const d = new Display(r);
    d.updateDisplay();
    r.rectWidth = 100;
    d.updateDisplay();
    assert.ok(true, 'so we have at least 1 test in this set');
    d.dispose();
});
QUnit.test('Stitch patterns #1', (assert)=>{
    const n = new Node();
    const d = new Display(n);
    d.updateDisplay();
    n.addChild(new Rectangle(0, 0, 50, 50, {
        fill: 'red'
    }));
    d.updateDisplay();
    n.addChild(new Rectangle(0, 0, 50, 50, {
        fill: 'red'
    }));
    d.updateDisplay();
    n.addChild(new Rectangle(0, 0, 50, 50, {
        fill: 'red'
    }));
    d.updateDisplay();
    n.children[1].visible = false;
    d.updateDisplay();
    n.children[1].visible = true;
    d.updateDisplay();
    n.removeChild(n.children[0]);
    d.updateDisplay();
    n.removeChild(n.children[1]);
    d.updateDisplay();
    n.removeChild(n.children[0]);
    d.updateDisplay();
    assert.ok(true, 'so we have at least 1 test in this set');
    d.dispose();
});
QUnit.test('Invisible append', (assert)=>{
    const scene = new Node();
    const display = new Display(scene);
    display.updateDisplay();
    const a = new Rectangle(0, 0, 100, 50, {
        fill: 'red'
    });
    scene.addChild(a);
    display.updateDisplay();
    const b = new Rectangle(0, 0, 100, 50, {
        fill: 'red',
        visible: false
    });
    scene.addChild(b);
    display.updateDisplay();
    assert.ok(true, 'so we have at least 1 test in this set');
    display.dispose();
});
QUnit.test('Stitching problem A (GitHub Issue #339)', (assert)=>{
    const scene = new Node();
    const display = new Display(scene);
    const a = new Rectangle(0, 0, 100, 50, {
        fill: 'red'
    });
    const b = new Rectangle(0, 0, 50, 50, {
        fill: 'blue'
    });
    const c = new DOM(document.createElement('div'));
    const d = new Rectangle(100, 0, 100, 50, {
        fill: 'red'
    });
    const e = new Rectangle(100, 0, 50, 50, {
        fill: 'blue'
    });
    const f = new Rectangle(0, 50, 100, 50, {
        fill: 'green'
    });
    const g = new DOM(document.createElement('div'));
    scene.addChild(a);
    scene.addChild(f);
    scene.addChild(b);
    scene.addChild(c);
    scene.addChild(d);
    scene.addChild(e);
    display.updateDisplay();
    scene.removeChild(f);
    scene.insertChild(4, g);
    display.updateDisplay();
    assert.ok(true, 'so we have at least 1 test in this set');
    display.dispose();
});
QUnit.test('SVG group disposal issue (GitHub Issue #354) A', (assert)=>{
    const scene = new Node();
    const display = new Display(scene);
    const node = new Node({
        renderer: 'svg',
        cssTransform: true
    });
    const rect = new Rectangle(0, 0, 100, 50, {
        fill: 'red'
    });
    scene.addChild(node);
    node.addChild(rect);
    display.updateDisplay();
    scene.removeChild(node);
    display.updateDisplay();
    assert.ok(true, 'so we have at least 1 test in this set');
    display.dispose();
});
QUnit.test('SVG group disposal issue (GitHub Issue #354) B', (assert)=>{
    const scene = new Node();
    const display = new Display(scene);
    const node = new Node();
    const rect = new Rectangle(0, 0, 100, 50, {
        fill: 'red',
        renderer: 'svg',
        cssTransform: true
    });
    scene.addChild(node);
    node.addChild(rect);
    display.updateDisplay();
    scene.removeChild(node);
    display.updateDisplay();
    assert.ok(true, 'so we have at least 1 test in this set');
    display.dispose();
});
QUnit.test('Empty path display test', (assert)=>{
    const scene = new Node();
    const display = new Display(scene);
    scene.addChild(new Path(null));
    display.updateDisplay();
    assert.ok(true, 'so we have at least 1 test in this set');
    display.dispose();
});
QUnit.test('Double remove related to #392', (assert)=>{
    const scene = new Node();
    const display = new Display(scene);
    display.updateDisplay();
    const n1 = new Node();
    const n2 = new Node();
    scene.addChild(n1);
    n1.addChild(n2);
    scene.addChild(n2); // so the tree has a reference to the Node that we can trigger the failure on
    display.updateDisplay();
    scene.removeChild(n1);
    n1.removeChild(n2);
    display.updateDisplay();
    assert.ok(true, 'so we have at least 1 test in this set');
    display.dispose();
});

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvZGlzcGxheS9EaXNwbGF5VGVzdHMuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTctMjAyNCwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbi8qKlxuICogRGlzcGxheSB0ZXN0c1xuICpcbiAqIEBhdXRob3IgU2FtIFJlaWQgKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXG4gKi9cblxuaW1wb3J0IHsgU2hhcGUgfSBmcm9tICcuLi8uLi8uLi9raXRlL2pzL2ltcG9ydHMuanMnO1xuaW1wb3J0IENpcmNsZSBmcm9tICcuLi9ub2Rlcy9DaXJjbGUuanMnO1xuaW1wb3J0IERPTSBmcm9tICcuLi9ub2Rlcy9ET00uanMnO1xuaW1wb3J0IEltYWdlIGZyb20gJy4uL25vZGVzL0ltYWdlLmpzJztcbmltcG9ydCBMaW5lIGZyb20gJy4uL25vZGVzL0xpbmUuanMnO1xuaW1wb3J0IE5vZGUgZnJvbSAnLi4vbm9kZXMvTm9kZS5qcyc7XG5pbXBvcnQgUGF0aCBmcm9tICcuLi9ub2Rlcy9QYXRoLmpzJztcbmltcG9ydCBSZWN0YW5nbGUgZnJvbSAnLi4vbm9kZXMvUmVjdGFuZ2xlLmpzJztcbmltcG9ydCBUZXh0IGZyb20gJy4uL25vZGVzL1RleHQuanMnO1xuaW1wb3J0IENhbnZhc0NvbnRleHRXcmFwcGVyIGZyb20gJy4uL3V0aWwvQ2FudmFzQ29udGV4dFdyYXBwZXIuanMnO1xuaW1wb3J0IERpc3BsYXkgZnJvbSAnLi9EaXNwbGF5LmpzJztcbmltcG9ydCBDaXJjbGVDYW52YXNEcmF3YWJsZSBmcm9tICcuL2RyYXdhYmxlcy9DaXJjbGVDYW52YXNEcmF3YWJsZS5qcyc7XG5pbXBvcnQgQ2lyY2xlRE9NRHJhd2FibGUgZnJvbSAnLi9kcmF3YWJsZXMvQ2lyY2xlRE9NRHJhd2FibGUuanMnO1xuaW1wb3J0IENpcmNsZVNWR0RyYXdhYmxlIGZyb20gJy4vZHJhd2FibGVzL0NpcmNsZVNWR0RyYXdhYmxlLmpzJztcbmltcG9ydCBET01EcmF3YWJsZSBmcm9tICcuL2RyYXdhYmxlcy9ET01EcmF3YWJsZS5qcyc7XG5pbXBvcnQgSW1hZ2VDYW52YXNEcmF3YWJsZSBmcm9tICcuL2RyYXdhYmxlcy9JbWFnZUNhbnZhc0RyYXdhYmxlLmpzJztcbmltcG9ydCBJbWFnZURPTURyYXdhYmxlIGZyb20gJy4vZHJhd2FibGVzL0ltYWdlRE9NRHJhd2FibGUuanMnO1xuaW1wb3J0IEltYWdlU1ZHRHJhd2FibGUgZnJvbSAnLi9kcmF3YWJsZXMvSW1hZ2VTVkdEcmF3YWJsZS5qcyc7XG5pbXBvcnQgTGluZUNhbnZhc0RyYXdhYmxlIGZyb20gJy4vZHJhd2FibGVzL0xpbmVDYW52YXNEcmF3YWJsZS5qcyc7XG5pbXBvcnQgTGluZVNWR0RyYXdhYmxlIGZyb20gJy4vZHJhd2FibGVzL0xpbmVTVkdEcmF3YWJsZS5qcyc7XG5pbXBvcnQgUGF0aENhbnZhc0RyYXdhYmxlIGZyb20gJy4vZHJhd2FibGVzL1BhdGhDYW52YXNEcmF3YWJsZS5qcyc7XG5pbXBvcnQgUGF0aFNWR0RyYXdhYmxlIGZyb20gJy4vZHJhd2FibGVzL1BhdGhTVkdEcmF3YWJsZS5qcyc7XG5pbXBvcnQgUmVjdGFuZ2xlQ2FudmFzRHJhd2FibGUgZnJvbSAnLi9kcmF3YWJsZXMvUmVjdGFuZ2xlQ2FudmFzRHJhd2FibGUuanMnO1xuaW1wb3J0IFJlY3RhbmdsZURPTURyYXdhYmxlIGZyb20gJy4vZHJhd2FibGVzL1JlY3RhbmdsZURPTURyYXdhYmxlLmpzJztcbmltcG9ydCBSZWN0YW5nbGVTVkdEcmF3YWJsZSBmcm9tICcuL2RyYXdhYmxlcy9SZWN0YW5nbGVTVkdEcmF3YWJsZS5qcyc7XG5pbXBvcnQgVGV4dENhbnZhc0RyYXdhYmxlIGZyb20gJy4vZHJhd2FibGVzL1RleHRDYW52YXNEcmF3YWJsZS5qcyc7XG5pbXBvcnQgVGV4dERPTURyYXdhYmxlIGZyb20gJy4vZHJhd2FibGVzL1RleHRET01EcmF3YWJsZS5qcyc7XG5pbXBvcnQgVGV4dFNWR0RyYXdhYmxlIGZyb20gJy4vZHJhd2FibGVzL1RleHRTVkdEcmF3YWJsZS5qcyc7XG5pbXBvcnQgSW5zdGFuY2UgZnJvbSAnLi9JbnN0YW5jZS5qcyc7XG5pbXBvcnQgUmVuZGVyZXIgZnJvbSAnLi9SZW5kZXJlci5qcyc7XG5cblFVbml0Lm1vZHVsZSggJ0Rpc3BsYXknICk7XG5cblFVbml0LnRlc3QoICdEcmF3YWJsZXMgKFJlY3RhbmdsZSknLCBhc3NlcnQgPT4ge1xuXG4gIC8vIFRoZSBzdHViRGlzcGxheSBJdCdzIGEgaGFjayB0aGF0IGltcGxlbWVudHMgdGhlIHN1YnNldCBvZiB0aGUgRGlzcGxheSBBUEkgbmVlZGVkIHdoZXJlIGNhbGxlZC4gSXQgd2lsbCBkZWZpbml0ZWx5XG4gIC8vIGJlIHJlbW92ZWQuIFRoZSByZWFzb24gaXQgc3RvcmVzIHRoZSBmcmFtZSBJRCBpcyBiZWNhdXNlIG11Y2ggb2YgU2NlbmVyeSAwLjIgdXNlcyBJRCBjb21wYXJpc29uIHRvIGRldGVybWluZVxuICAvLyBkaXJ0eSBzdGF0ZS4gVGhhdCBhbGxvd3MgdXMgdG8gbm90IGhhdmUgdG8gc2V0IGRpcnR5IHN0YXRlcyBiYWNrIHRvIFwiY2xlYW5cIiBhZnRlcndhcmRzLiAgU2VlICMyOTZcbiAgY29uc3Qgc3R1YkRpc3BsYXkgPSB7IF9mcmFtZUlkOiA1LCBpc1dlYkdMQWxsb3dlZDogKCkgPT4gdHJ1ZSB9O1xuXG4gIGNvbnN0IGNhbnZhcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoICdjYW52YXMnICk7XG4gIGNhbnZhcy53aWR0aCA9IDY0O1xuICBjYW52YXMuaGVpZ2h0ID0gNDg7XG4gIGNvbnN0IGNvbnRleHQgPSBjYW52YXMuZ2V0Q29udGV4dCggJzJkJyApO1xuICBjb25zdCB3cmFwcGVyID0gbmV3IENhbnZhc0NvbnRleHRXcmFwcGVyKCBjYW52YXMsIGNvbnRleHQgKTtcblxuXG4gIGNvbnN0IHIxID0gbmV3IFJlY3RhbmdsZSggNSwgMTAsIDEwMCwgNTAsIDAsIDAsIHsgZmlsbDogJ3JlZCcsIHN0cm9rZTogJ2JsdWUnLCBsaW5lV2lkdGg6IDUgfSApO1xuICBjb25zdCByMWkgPSBuZXcgSW5zdGFuY2UoIHN0dWJEaXNwbGF5LCByMS5nZXRVbmlxdWVUcmFpbCgpICk7XG4gIGNvbnN0IHIxZGQgPSByMS5jcmVhdGVET01EcmF3YWJsZSggUmVuZGVyZXIuYml0bWFza0RPTSwgcjFpICk7XG4gIGNvbnN0IHIxZHMgPSByMS5jcmVhdGVTVkdEcmF3YWJsZSggUmVuZGVyZXIuYml0bWFza1NWRywgcjFpICk7XG4gIGNvbnN0IHIxZGMgPSByMS5jcmVhdGVDYW52YXNEcmF3YWJsZSggUmVuZGVyZXIuYml0bWFza0NhbnZhcywgcjFpICk7XG5cbiAgYXNzZXJ0Lm9rKCByMS5fZHJhd2FibGVzLmxlbmd0aCA9PT0gMywgJ0FmdGVyIGluaXQsIHNob3VsZCBoYXZlIGRyYXdhYmxlIHJlZnMnICk7XG5cbiAgcjFkZC51cGRhdGVET00oKTtcbiAgcjFkcy51cGRhdGVTVkcoKTtcbiAgcjFkYy5wYWludENhbnZhcyggd3JhcHBlciwgcjEgKTtcblxuICByMS5zZXRSZWN0KCAwLCAwLCAxMDAsIDEwMCwgNSwgNSApO1xuXG4gIHIxZGQudXBkYXRlRE9NKCk7XG4gIHIxZHMudXBkYXRlU1ZHKCk7XG4gIHIxZGMucGFpbnRDYW52YXMoIHdyYXBwZXIsIHIxICk7XG5cbiAgcjEuc3Ryb2tlID0gbnVsbDtcbiAgcjEuZmlsbCA9IG51bGw7XG5cbiAgcjFkZC51cGRhdGVET00oKTtcbiAgcjFkcy51cGRhdGVTVkcoKTtcbiAgcjFkYy5wYWludENhbnZhcyggd3JhcHBlciwgcjEgKTtcblxuICByMWRkLmRpc3Bvc2UoKTtcbiAgcjFkcy5kaXNwb3NlKCk7XG4gIHIxZGMuZGlzcG9zZSgpO1xuXG4gIGFzc2VydC5vayggcjEuX2RyYXdhYmxlcy5sZW5ndGggPT09IDAsICdBZnRlciBkaXNwb3NlLCBzaG91bGQgbm90IGhhdmUgZHJhd2FibGUgcmVmcycgKTtcblxuICBhc3NlcnQub2soIFJlY3RhbmdsZURPTURyYXdhYmxlLnBvb2wubGVuZ3RoID4gMCwgJ0Rpc3Bvc2VkIGRyYXdhYmxlIHJldHVybmVkIHRvIHBvb2wnICk7XG4gIGFzc2VydC5vayggUmVjdGFuZ2xlU1ZHRHJhd2FibGUucG9vbC5sZW5ndGggPiAwLCAnRGlzcG9zZWQgZHJhd2FibGUgcmV0dXJuZWQgdG8gcG9vbCcgKTtcbiAgYXNzZXJ0Lm9rKCBSZWN0YW5nbGVDYW52YXNEcmF3YWJsZS5wb29sLmxlbmd0aCA+IDAsICdEaXNwb3NlZCBkcmF3YWJsZSByZXR1cm5lZCB0byBwb29sJyApO1xufSApO1xuXG5RVW5pdC50ZXN0KCAnRHJhd2FibGVzIChDaXJjbGUpJywgYXNzZXJ0ID0+IHtcbiAgY29uc3Qgc3R1YkRpc3BsYXkgPSB7IF9mcmFtZUlkOiA1LCBpc1dlYkdMQWxsb3dlZDogKCkgPT4gdHJ1ZSB9O1xuXG4gIGNvbnN0IGNhbnZhcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoICdjYW52YXMnICk7XG4gIGNhbnZhcy53aWR0aCA9IDY0O1xuICBjYW52YXMuaGVpZ2h0ID0gNDg7XG4gIGNvbnN0IGNvbnRleHQgPSBjYW52YXMuZ2V0Q29udGV4dCggJzJkJyApO1xuICBjb25zdCB3cmFwcGVyID0gbmV3IENhbnZhc0NvbnRleHRXcmFwcGVyKCBjYW52YXMsIGNvbnRleHQgKTtcblxuXG4gIGNvbnN0IHIxID0gbmV3IENpcmNsZSggNTAsIHsgZmlsbDogJ3JlZCcsIHN0cm9rZTogJ2JsdWUnLCBsaW5lV2lkdGg6IDUgfSApO1xuICBjb25zdCByMWkgPSBuZXcgSW5zdGFuY2UoIHN0dWJEaXNwbGF5LCByMS5nZXRVbmlxdWVUcmFpbCgpICk7XG4gIGNvbnN0IHIxZGQgPSByMS5jcmVhdGVET01EcmF3YWJsZSggUmVuZGVyZXIuYml0bWFza0RPTSwgcjFpICk7XG4gIGNvbnN0IHIxZHMgPSByMS5jcmVhdGVTVkdEcmF3YWJsZSggUmVuZGVyZXIuYml0bWFza1NWRywgcjFpICk7XG4gIGNvbnN0IHIxZGMgPSByMS5jcmVhdGVDYW52YXNEcmF3YWJsZSggUmVuZGVyZXIuYml0bWFza0NhbnZhcywgcjFpICk7XG5cbiAgYXNzZXJ0Lm9rKCByMS5fZHJhd2FibGVzLmxlbmd0aCA9PT0gMywgJ0FmdGVyIGluaXQsIHNob3VsZCBoYXZlIGRyYXdhYmxlIHJlZnMnICk7XG5cbiAgcjFkZC51cGRhdGVET00oKTtcbiAgcjFkcy51cGRhdGVTVkcoKTtcbiAgcjFkYy5wYWludENhbnZhcyggd3JhcHBlciwgcjEgKTtcblxuICByMS5zZXRSYWRpdXMoIDEwMCApO1xuXG4gIHIxZGQudXBkYXRlRE9NKCk7XG4gIHIxZHMudXBkYXRlU1ZHKCk7XG4gIHIxZGMucGFpbnRDYW52YXMoIHdyYXBwZXIsIHIxICk7XG5cbiAgcjEuc3Ryb2tlID0gbnVsbDtcbiAgcjEuZmlsbCA9IG51bGw7XG5cbiAgcjFkZC51cGRhdGVET00oKTtcbiAgcjFkcy51cGRhdGVTVkcoKTtcbiAgcjFkYy5wYWludENhbnZhcyggd3JhcHBlciwgcjEgKTtcblxuICByMWRkLmRpc3Bvc2UoKTtcbiAgcjFkcy5kaXNwb3NlKCk7XG4gIHIxZGMuZGlzcG9zZSgpO1xuXG4gIGFzc2VydC5vayggcjEuX2RyYXdhYmxlcy5sZW5ndGggPT09IDAsICdBZnRlciBkaXNwb3NlLCBzaG91bGQgbm90IGhhdmUgZHJhd2FibGUgcmVmcycgKTtcblxuICBhc3NlcnQub2soIENpcmNsZURPTURyYXdhYmxlLnBvb2wubGVuZ3RoID4gMCwgJ0Rpc3Bvc2VkIGRyYXdhYmxlIHJldHVybmVkIHRvIHBvb2wnICk7XG4gIGFzc2VydC5vayggQ2lyY2xlU1ZHRHJhd2FibGUucG9vbC5sZW5ndGggPiAwLCAnRGlzcG9zZWQgZHJhd2FibGUgcmV0dXJuZWQgdG8gcG9vbCcgKTtcbiAgYXNzZXJ0Lm9rKCBDaXJjbGVDYW52YXNEcmF3YWJsZS5wb29sLmxlbmd0aCA+IDAsICdEaXNwb3NlZCBkcmF3YWJsZSByZXR1cm5lZCB0byBwb29sJyApO1xufSApO1xuXG5RVW5pdC50ZXN0KCAnRHJhd2FibGVzIChMaW5lKScsIGFzc2VydCA9PiB7XG4gIGNvbnN0IHN0dWJEaXNwbGF5ID0geyBfZnJhbWVJZDogNSwgaXNXZWJHTEFsbG93ZWQ6ICgpID0+IHRydWUgfTtcblxuICBjb25zdCBjYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCAnY2FudmFzJyApO1xuICBjYW52YXMud2lkdGggPSA2NDtcbiAgY2FudmFzLmhlaWdodCA9IDQ4O1xuICBjb25zdCBjb250ZXh0ID0gY2FudmFzLmdldENvbnRleHQoICcyZCcgKTtcbiAgY29uc3Qgd3JhcHBlciA9IG5ldyBDYW52YXNDb250ZXh0V3JhcHBlciggY2FudmFzLCBjb250ZXh0ICk7XG5cbiAgY29uc3QgcjEgPSBuZXcgTGluZSggMCwgMSwgMiwgMywgeyBmaWxsOiAncmVkJywgc3Ryb2tlOiAnYmx1ZScsIGxpbmVXaWR0aDogNSB9ICk7XG4gIGNvbnN0IHIxaSA9IG5ldyBJbnN0YW5jZSggc3R1YkRpc3BsYXksIHIxLmdldFVuaXF1ZVRyYWlsKCkgKTtcbiAgY29uc3QgcjFkcyA9IHIxLmNyZWF0ZVNWR0RyYXdhYmxlKCBSZW5kZXJlci5iaXRtYXNrU1ZHLCByMWkgKTtcbiAgY29uc3QgcjFkYyA9IHIxLmNyZWF0ZUNhbnZhc0RyYXdhYmxlKCBSZW5kZXJlci5iaXRtYXNrQ2FudmFzLCByMWkgKTtcblxuICBhc3NlcnQub2soIHIxLl9kcmF3YWJsZXMubGVuZ3RoID09PSAyLCAnQWZ0ZXIgaW5pdCwgc2hvdWxkIGhhdmUgZHJhd2FibGUgcmVmcycgKTtcblxuICByMWRzLnVwZGF0ZVNWRygpO1xuICByMWRjLnBhaW50Q2FudmFzKCB3cmFwcGVyLCByMSApO1xuXG4gIHIxLngxID0gNTA7XG4gIHIxLngyID0gMTAwO1xuXG4gIHIxZHMudXBkYXRlU1ZHKCk7XG4gIHIxZGMucGFpbnRDYW52YXMoIHdyYXBwZXIsIHIxICk7XG5cbiAgcjEuc3Ryb2tlID0gbnVsbDtcbiAgcjEuZmlsbCA9IG51bGw7XG5cbiAgcjFkcy51cGRhdGVTVkcoKTtcbiAgcjFkYy5wYWludENhbnZhcyggd3JhcHBlciwgcjEgKTtcblxuICByMWRzLmRpc3Bvc2UoKTtcbiAgcjFkYy5kaXNwb3NlKCk7XG5cbiAgYXNzZXJ0Lm9rKCByMS5fZHJhd2FibGVzLmxlbmd0aCA9PT0gMCwgJ0FmdGVyIGRpc3Bvc2UsIHNob3VsZCBub3QgaGF2ZSBkcmF3YWJsZSByZWZzJyApO1xuXG4gIGFzc2VydC5vayggTGluZVNWR0RyYXdhYmxlLnBvb2wubGVuZ3RoID4gMCwgJ0Rpc3Bvc2VkIGRyYXdhYmxlIHJldHVybmVkIHRvIHBvb2wnICk7XG4gIGFzc2VydC5vayggTGluZUNhbnZhc0RyYXdhYmxlLnBvb2wubGVuZ3RoID4gMCwgJ0Rpc3Bvc2VkIGRyYXdhYmxlIHJldHVybmVkIHRvIHBvb2wnICk7XG59ICk7XG5cblFVbml0LnRlc3QoICdEcmF3YWJsZXMgKFBhdGgpJywgYXNzZXJ0ID0+IHtcbiAgY29uc3Qgc3R1YkRpc3BsYXkgPSB7IF9mcmFtZUlkOiA1LCBpc1dlYkdMQWxsb3dlZDogKCkgPT4gdHJ1ZSB9O1xuXG4gIGNvbnN0IGNhbnZhcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoICdjYW52YXMnICk7XG4gIGNhbnZhcy53aWR0aCA9IDY0O1xuICBjYW52YXMuaGVpZ2h0ID0gNDg7XG4gIGNvbnN0IGNvbnRleHQgPSBjYW52YXMuZ2V0Q29udGV4dCggJzJkJyApO1xuICBjb25zdCB3cmFwcGVyID0gbmV3IENhbnZhc0NvbnRleHRXcmFwcGVyKCBjYW52YXMsIGNvbnRleHQgKTtcblxuXG4gIGNvbnN0IHIxID0gbmV3IFBhdGgoIFNoYXBlLnJlZ3VsYXJQb2x5Z29uKCA1LCAxMCApLCB7IGZpbGw6ICdyZWQnLCBzdHJva2U6ICdibHVlJywgbGluZVdpZHRoOiA1IH0gKTtcbiAgY29uc3QgcjFpID0gbmV3IEluc3RhbmNlKCBzdHViRGlzcGxheSwgcjEuZ2V0VW5pcXVlVHJhaWwoKSApO1xuICBjb25zdCByMWRzID0gcjEuY3JlYXRlU1ZHRHJhd2FibGUoIFJlbmRlcmVyLmJpdG1hc2tTVkcsIHIxaSApO1xuICBjb25zdCByMWRjID0gcjEuY3JlYXRlQ2FudmFzRHJhd2FibGUoIFJlbmRlcmVyLmJpdG1hc2tDYW52YXMsIHIxaSApO1xuXG4gIGFzc2VydC5vayggcjEuX2RyYXdhYmxlcy5sZW5ndGggPT09IDIsICdBZnRlciBpbml0LCBzaG91bGQgaGF2ZSBkcmF3YWJsZSByZWZzJyApO1xuXG4gIHIxZHMudXBkYXRlU1ZHKCk7XG4gIHIxZGMucGFpbnRDYW52YXMoIHdyYXBwZXIsIHIxICk7XG5cbiAgcjEuc2hhcGUgPSBTaGFwZS5yZWd1bGFyUG9seWdvbiggNiwgMjAgKTtcblxuICByMWRzLnVwZGF0ZVNWRygpO1xuICByMWRjLnBhaW50Q2FudmFzKCB3cmFwcGVyLCByMSApO1xuXG4gIHIxLnN0cm9rZSA9IG51bGw7XG4gIHIxLmZpbGwgPSBudWxsO1xuXG4gIHIxZHMudXBkYXRlU1ZHKCk7XG4gIHIxZGMucGFpbnRDYW52YXMoIHdyYXBwZXIsIHIxICk7XG5cbiAgcjEuc2hhcGUgPSBudWxsO1xuXG4gIHIxZHMudXBkYXRlU1ZHKCk7XG4gIHIxZGMucGFpbnRDYW52YXMoIHdyYXBwZXIsIHIxICk7XG5cbiAgcjFkcy5kaXNwb3NlKCk7XG4gIHIxZGMuZGlzcG9zZSgpO1xuXG4gIGFzc2VydC5vayggcjEuX2RyYXdhYmxlcy5sZW5ndGggPT09IDAsICdBZnRlciBkaXNwb3NlLCBzaG91bGQgbm90IGhhdmUgZHJhd2FibGUgcmVmcycgKTtcblxuICBhc3NlcnQub2soIFBhdGhTVkdEcmF3YWJsZS5wb29sLmxlbmd0aCA+IDAsICdEaXNwb3NlZCBkcmF3YWJsZSByZXR1cm5lZCB0byBwb29sJyApO1xuICBhc3NlcnQub2soIFBhdGhDYW52YXNEcmF3YWJsZS5wb29sLmxlbmd0aCA+IDAsICdEaXNwb3NlZCBkcmF3YWJsZSByZXR1cm5lZCB0byBwb29sJyApO1xufSApO1xuXG5RVW5pdC50ZXN0KCAnRHJhd2FibGVzIChUZXh0KScsIGFzc2VydCA9PiB7XG4gIGNvbnN0IHN0dWJEaXNwbGF5ID0geyBfZnJhbWVJZDogNSwgaXNXZWJHTEFsbG93ZWQ6ICgpID0+IHRydWUgfTtcblxuICBjb25zdCBjYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCAnY2FudmFzJyApO1xuICBjYW52YXMud2lkdGggPSA2NDtcbiAgY2FudmFzLmhlaWdodCA9IDQ4O1xuICBjb25zdCBjb250ZXh0ID0gY2FudmFzLmdldENvbnRleHQoICcyZCcgKTtcbiAgY29uc3Qgd3JhcHBlciA9IG5ldyBDYW52YXNDb250ZXh0V3JhcHBlciggY2FudmFzLCBjb250ZXh0ICk7XG5cblxuICBjb25zdCByMSA9IG5ldyBUZXh0KCAnV293IScsIHsgZmlsbDogJ3JlZCcsIHN0cm9rZTogJ2JsdWUnLCBsaW5lV2lkdGg6IDUgfSApO1xuICBjb25zdCByMWkgPSBuZXcgSW5zdGFuY2UoIHN0dWJEaXNwbGF5LCByMS5nZXRVbmlxdWVUcmFpbCgpICk7XG4gIGNvbnN0IHIxZGQgPSByMS5jcmVhdGVET01EcmF3YWJsZSggUmVuZGVyZXIuYml0bWFza0RPTSwgcjFpICk7XG4gIGNvbnN0IHIxZHMgPSByMS5jcmVhdGVTVkdEcmF3YWJsZSggUmVuZGVyZXIuYml0bWFza1NWRywgcjFpICk7XG4gIGNvbnN0IHIxZGMgPSByMS5jcmVhdGVDYW52YXNEcmF3YWJsZSggUmVuZGVyZXIuYml0bWFza0NhbnZhcywgcjFpICk7XG5cbiAgYXNzZXJ0Lm9rKCByMS5fZHJhd2FibGVzLmxlbmd0aCA9PT0gMywgJ0FmdGVyIGluaXQsIHNob3VsZCBoYXZlIGRyYXdhYmxlIHJlZnMnICk7XG5cbiAgcjFkZC51cGRhdGVET00oKTtcbiAgcjFkcy51cGRhdGVTVkcoKTtcbiAgcjFkYy5wYWludENhbnZhcyggd3JhcHBlciwgcjEgKTtcblxuICByMS5zdHJpbmcgPSAnYic7XG5cbiAgcjFkZC51cGRhdGVET00oKTtcbiAgcjFkcy51cGRhdGVTVkcoKTtcbiAgcjFkYy5wYWludENhbnZhcyggd3JhcHBlciwgcjEgKTtcblxuICByMS5mb250ID0gJzIwcHggc2Fucy1zZXJpZic7XG5cbiAgcjFkZC51cGRhdGVET00oKTtcbiAgcjFkcy51cGRhdGVTVkcoKTtcbiAgcjFkYy5wYWludENhbnZhcyggd3JhcHBlciwgcjEgKTtcblxuICByMS5zdHJva2UgPSBudWxsO1xuICByMS5maWxsID0gbnVsbDtcblxuICByMWRkLnVwZGF0ZURPTSgpO1xuICByMWRzLnVwZGF0ZVNWRygpO1xuICByMWRjLnBhaW50Q2FudmFzKCB3cmFwcGVyLCByMSApO1xuXG4gIHIxZGQuZGlzcG9zZSgpO1xuICByMWRzLmRpc3Bvc2UoKTtcbiAgcjFkYy5kaXNwb3NlKCk7XG5cbiAgYXNzZXJ0Lm9rKCByMS5fZHJhd2FibGVzLmxlbmd0aCA9PT0gMCwgJ0FmdGVyIGRpc3Bvc2UsIHNob3VsZCBub3QgaGF2ZSBkcmF3YWJsZSByZWZzJyApO1xuXG4gIGFzc2VydC5vayggVGV4dERPTURyYXdhYmxlLnBvb2wubGVuZ3RoID4gMCwgJ0Rpc3Bvc2VkIGRyYXdhYmxlIHJldHVybmVkIHRvIHBvb2wnICk7XG4gIGFzc2VydC5vayggVGV4dFNWR0RyYXdhYmxlLnBvb2wubGVuZ3RoID4gMCwgJ0Rpc3Bvc2VkIGRyYXdhYmxlIHJldHVybmVkIHRvIHBvb2wnICk7XG4gIGFzc2VydC5vayggVGV4dENhbnZhc0RyYXdhYmxlLnBvb2wubGVuZ3RoID4gMCwgJ0Rpc3Bvc2VkIGRyYXdhYmxlIHJldHVybmVkIHRvIHBvb2wnICk7XG59ICk7XG5cblFVbml0LnRlc3QoICdEcmF3YWJsZXMgKEltYWdlKScsIGFzc2VydCA9PiB7XG4gIGNvbnN0IHN0dWJEaXNwbGF5ID0geyBfZnJhbWVJZDogNSwgaXNXZWJHTEFsbG93ZWQ6ICgpID0+IHRydWUgfTtcblxuICBjb25zdCBjYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCAnY2FudmFzJyApO1xuICBjYW52YXMud2lkdGggPSA2NDtcbiAgY2FudmFzLmhlaWdodCA9IDQ4O1xuICBjb25zdCBjb250ZXh0ID0gY2FudmFzLmdldENvbnRleHQoICcyZCcgKTtcbiAgY29uc3Qgd3JhcHBlciA9IG5ldyBDYW52YXNDb250ZXh0V3JhcHBlciggY2FudmFzLCBjb250ZXh0ICk7XG5cbiAgLy8gMXgxIGJsYWNrIFBOR1xuICBjb25zdCByMSA9IG5ldyBJbWFnZSggJ2RhdGE6aW1hZ2UvcG5nO2Jhc2U2NCxpVkJPUncwS0dnb0FBQUFOU1VoRVVnQUFBQUVBQUFBQkNBWUFBQUFmRmNTSkFBQUFEVWxFUVZRSVcyTmtZR0Q0RHdBQkNRRUJ0eG1ON3dBQUFBQkpSVTVFcmtKZ2dnPT0nICk7XG4gIGNvbnN0IHIxaSA9IG5ldyBJbnN0YW5jZSggc3R1YkRpc3BsYXksIHIxLmdldFVuaXF1ZVRyYWlsKCkgKTtcbiAgY29uc3QgcjFkZCA9IHIxLmNyZWF0ZURPTURyYXdhYmxlKCBSZW5kZXJlci5iaXRtYXNrRE9NLCByMWkgKTtcbiAgY29uc3QgcjFkcyA9IHIxLmNyZWF0ZVNWR0RyYXdhYmxlKCBSZW5kZXJlci5iaXRtYXNrU1ZHLCByMWkgKTtcbiAgY29uc3QgcjFkYyA9IHIxLmNyZWF0ZUNhbnZhc0RyYXdhYmxlKCBSZW5kZXJlci5iaXRtYXNrQ2FudmFzLCByMWkgKTtcblxuICBhc3NlcnQub2soIHIxLl9kcmF3YWJsZXMubGVuZ3RoID09PSAzLCAnQWZ0ZXIgaW5pdCwgc2hvdWxkIGhhdmUgZHJhd2FibGUgcmVmcycgKTtcblxuICByMWRkLnVwZGF0ZURPTSgpO1xuICByMWRzLnVwZGF0ZVNWRygpO1xuICByMWRjLnBhaW50Q2FudmFzKCB3cmFwcGVyLCByMSApO1xuXG4gIC8vIDF4MSBibGFjayBKUEdcbiAgcjEuaW1hZ2UgPSAnZGF0YTppbWFnZS9qcGVnO2Jhc2U2NCwvOWovNEFBUVNrWkpSZ0FCQVFBQUFRQUJBQUQvMndCREFBTUNBZ0lDQWdNQ0FnSURBd01EQkFZRUJBUUVCQWdHQmdVR0NRZ0tDZ2tJQ1FrS0RBOE1DZ3NPQ3drSkRSRU5EZzhRRUJFUUNnd1NFeElRRXc4UUVCRC8yd0JEQVFNREF3UURCQWdFQkFnUUN3a0xFQkFRRUJBUUVCQVFFQkFRRUJBUUVCQVFFQkFRRUJBUUVCQVFFQkFRRUJBUUVCQVFFQkFRRUJBUUVCQVFFQkFRRUJEL3dBQVJDQUFCQUFFREFTSUFBaEVCQXhFQi84UUFId0FBQVFVQkFRRUJBUUVBQUFBQUFBQUFBQUVDQXdRRkJnY0lDUW9MLzhRQXRSQUFBZ0VEQXdJRUF3VUZCQVFBQUFGOUFRSURBQVFSQlJJaE1VRUdFMUZoQnlKeEZES0JrYUVJSTBLeHdSVlMwZkFrTTJKeWdna0tGaGNZR1JvbEppY29LU28wTlRZM09EazZRMFJGUmtkSVNVcFRWRlZXVjFoWldtTmtaV1puYUdscWMzUjFkbmQ0ZVhxRGhJV0doNGlKaXBLVGxKV1dsNWlabXFLanBLV21wNmlwcXJLenRMVzJ0N2k1dXNMRHhNWEd4OGpKeXRMVDFOWFcxOWpaMnVIaTQrVGw1dWZvNmVyeDh2UDA5ZmIzK1BuNi84UUFId0VBQXdFQkFRRUJBUUVCQVFBQUFBQUFBQUVDQXdRRkJnY0lDUW9MLzhRQXRSRUFBZ0VDQkFRREJBY0ZCQVFBQVFKM0FBRUNBeEVFQlNFeEJoSkJVUWRoY1JNaU1vRUlGRUtSb2JIQkNTTXpVdkFWWW5MUkNoWWtOT0VsOFJjWUdSb21KeWdwS2pVMk56ZzVPa05FUlVaSFNFbEtVMVJWVmxkWVdWcGpaR1ZtWjJocGFuTjBkWFozZUhsNmdvT0VoWWFIaUltS2twT1VsWmFYbUptYW9xT2twYWFucUttcXNyTzB0YmEzdUxtNndzUEV4Y2JIeU1uSzB0UFUxZGJYMk5uYTR1UGs1ZWJuNk9ucTh2UDA5ZmIzK1BuNi85b0FEQU1CQUFJUkF4RUFQd0Q4cXFLS0tBUC8yUT09JztcblxuICByMWRkLnVwZGF0ZURPTSgpO1xuICByMWRzLnVwZGF0ZVNWRygpO1xuICByMWRjLnBhaW50Q2FudmFzKCB3cmFwcGVyLCByMSApO1xuXG4gIHIxZGQuZGlzcG9zZSgpO1xuICByMWRzLmRpc3Bvc2UoKTtcbiAgcjFkYy5kaXNwb3NlKCk7XG5cbiAgYXNzZXJ0Lm9rKCByMS5fZHJhd2FibGVzLmxlbmd0aCA9PT0gMCwgJ0FmdGVyIGRpc3Bvc2UsIHNob3VsZCBub3QgaGF2ZSBkcmF3YWJsZSByZWZzJyApO1xuXG4gIGFzc2VydC5vayggSW1hZ2VET01EcmF3YWJsZS5wb29sLmxlbmd0aCA+IDAsICdEaXNwb3NlZCBkcmF3YWJsZSByZXR1cm5lZCB0byBwb29sJyApO1xuICBhc3NlcnQub2soIEltYWdlU1ZHRHJhd2FibGUucG9vbC5sZW5ndGggPiAwLCAnRGlzcG9zZWQgZHJhd2FibGUgcmV0dXJuZWQgdG8gcG9vbCcgKTtcbiAgYXNzZXJ0Lm9rKCBJbWFnZUNhbnZhc0RyYXdhYmxlLnBvb2wubGVuZ3RoID4gMCwgJ0Rpc3Bvc2VkIGRyYXdhYmxlIHJldHVybmVkIHRvIHBvb2wnICk7XG59ICk7XG5cblFVbml0LnRlc3QoICdEcmF3YWJsZXMgKERPTSknLCBhc3NlcnQgPT4ge1xuICBjb25zdCBzdHViRGlzcGxheSA9IHsgX2ZyYW1lSWQ6IDUsIGlzV2ViR0xBbGxvd2VkOiAoKSA9PiB0cnVlIH07XG5cbiAgY29uc3QgcjEgPSBuZXcgRE9NKCBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCAnY2FudmFzJyApICk7XG4gIGNvbnN0IHIxaSA9IG5ldyBJbnN0YW5jZSggc3R1YkRpc3BsYXksIHIxLmdldFVuaXF1ZVRyYWlsKCkgKTtcbiAgY29uc3QgcjFkZCA9IHIxLmNyZWF0ZURPTURyYXdhYmxlKCBSZW5kZXJlci5iaXRtYXNrRE9NLCByMWkgKTtcblxuICBhc3NlcnQub2soIHIxLl9kcmF3YWJsZXMubGVuZ3RoID09PSAxLCAnQWZ0ZXIgaW5pdCwgc2hvdWxkIGhhdmUgZHJhd2FibGUgcmVmcycgKTtcblxuICByMWRkLnVwZGF0ZURPTSgpO1xuXG4gIHIxZGQuZGlzcG9zZSgpO1xuXG4gIGFzc2VydC5vayggcjEuX2RyYXdhYmxlcy5sZW5ndGggPT09IDAsICdBZnRlciBkaXNwb3NlLCBzaG91bGQgbm90IGhhdmUgZHJhd2FibGUgcmVmcycgKTtcblxuICBhc3NlcnQub2soIERPTURyYXdhYmxlLnBvb2wubGVuZ3RoID4gMCwgJ0Rpc3Bvc2VkIGRyYXdhYmxlIHJldHVybmVkIHRvIHBvb2wnICk7XG59ICk7XG5cblFVbml0LnRlc3QoICdSZW5kZXJlciBvcmRlciBiaXRtYXNrJywgYXNzZXJ0ID0+IHtcblxuICAvLyBpbml0IHRlc3RcbiAgbGV0IG1hc2sgPSBSZW5kZXJlci5jcmVhdGVPcmRlckJpdG1hc2soIFJlbmRlcmVyLmJpdG1hc2tDYW52YXMsIFJlbmRlcmVyLmJpdG1hc2tTVkcsIFJlbmRlcmVyLmJpdG1hc2tET00sIFJlbmRlcmVyLmJpdG1hc2tXZWJHTCApO1xuICBhc3NlcnQuZXF1YWwoIFJlbmRlcmVyLmJpdG1hc2tPcmRlciggbWFzaywgMCApLCBSZW5kZXJlci5iaXRtYXNrQ2FudmFzICk7XG4gIGFzc2VydC5lcXVhbCggUmVuZGVyZXIuYml0bWFza09yZGVyKCBtYXNrLCAxICksIFJlbmRlcmVyLmJpdG1hc2tTVkcgKTtcbiAgYXNzZXJ0LmVxdWFsKCBSZW5kZXJlci5iaXRtYXNrT3JkZXIoIG1hc2ssIDIgKSwgUmVuZGVyZXIuYml0bWFza0RPTSApO1xuICBhc3NlcnQuZXF1YWwoIFJlbmRlcmVyLmJpdG1hc2tPcmRlciggbWFzaywgMyApLCBSZW5kZXJlci5iaXRtYXNrV2ViR0wgKTtcblxuICAvLyBlbXB0eSB0ZXN0XG4gIG1hc2sgPSBSZW5kZXJlci5jcmVhdGVPcmRlckJpdG1hc2soKTtcbiAgYXNzZXJ0LmVxdWFsKCBSZW5kZXJlci5iaXRtYXNrT3JkZXIoIG1hc2ssIDAgKSwgMCApO1xuICBhc3NlcnQuZXF1YWwoIFJlbmRlcmVyLmJpdG1hc2tPcmRlciggbWFzaywgMSApLCAwICk7XG4gIGFzc2VydC5lcXVhbCggUmVuZGVyZXIuYml0bWFza09yZGVyKCBtYXNrLCAyICksIDAgKTtcbiAgYXNzZXJ0LmVxdWFsKCBSZW5kZXJlci5iaXRtYXNrT3JkZXIoIG1hc2ssIDMgKSwgMCApO1xuXG4gIC8vIHB1c2hpbmcgc2luZ2xlIHJlbmRlcmVyIHNob3VsZCB3b3JrXG4gIG1hc2sgPSBSZW5kZXJlci5wdXNoT3JkZXJCaXRtYXNrKCBtYXNrLCBSZW5kZXJlci5iaXRtYXNrU1ZHICk7XG4gIGFzc2VydC5lcXVhbCggUmVuZGVyZXIuYml0bWFza09yZGVyKCBtYXNrLCAwICksIFJlbmRlcmVyLmJpdG1hc2tTVkcgKTtcbiAgYXNzZXJ0LmVxdWFsKCBSZW5kZXJlci5iaXRtYXNrT3JkZXIoIG1hc2ssIDEgKSwgMCApO1xuICBhc3NlcnQuZXF1YWwoIFJlbmRlcmVyLmJpdG1hc2tPcmRlciggbWFzaywgMiApLCAwICk7XG4gIGFzc2VydC5lcXVhbCggUmVuZGVyZXIuYml0bWFza09yZGVyKCBtYXNrLCAzICksIDAgKTtcblxuICAvLyBwdXNoaW5nIGFnYWluIHNob3VsZCBoYXZlIG5vIGNoYW5nZVxuICBtYXNrID0gUmVuZGVyZXIucHVzaE9yZGVyQml0bWFzayggbWFzaywgUmVuZGVyZXIuYml0bWFza1NWRyApO1xuICBhc3NlcnQuZXF1YWwoIFJlbmRlcmVyLmJpdG1hc2tPcmRlciggbWFzaywgMCApLCBSZW5kZXJlci5iaXRtYXNrU1ZHICk7XG4gIGFzc2VydC5lcXVhbCggUmVuZGVyZXIuYml0bWFza09yZGVyKCBtYXNrLCAxICksIDAgKTtcbiAgYXNzZXJ0LmVxdWFsKCBSZW5kZXJlci5iaXRtYXNrT3JkZXIoIG1hc2ssIDIgKSwgMCApO1xuICBhc3NlcnQuZXF1YWwoIFJlbmRlcmVyLmJpdG1hc2tPcmRlciggbWFzaywgMyApLCAwICk7XG5cbiAgLy8gcHVzaGluZyBDYW52YXMgd2lsbCBwdXQgaXQgZmlyc3QsIFNWRyBzZWNvbmRcbiAgbWFzayA9IFJlbmRlcmVyLnB1c2hPcmRlckJpdG1hc2soIG1hc2ssIFJlbmRlcmVyLmJpdG1hc2tDYW52YXMgKTtcbiAgYXNzZXJ0LmVxdWFsKCBSZW5kZXJlci5iaXRtYXNrT3JkZXIoIG1hc2ssIDAgKSwgUmVuZGVyZXIuYml0bWFza0NhbnZhcyApO1xuICBhc3NlcnQuZXF1YWwoIFJlbmRlcmVyLmJpdG1hc2tPcmRlciggbWFzaywgMSApLCBSZW5kZXJlci5iaXRtYXNrU1ZHICk7XG4gIGFzc2VydC5lcXVhbCggUmVuZGVyZXIuYml0bWFza09yZGVyKCBtYXNrLCAyICksIDAgKTtcbiAgYXNzZXJ0LmVxdWFsKCBSZW5kZXJlci5iaXRtYXNrT3JkZXIoIG1hc2ssIDMgKSwgMCApO1xuXG4gIC8vIHB1c2hpbmcgU1ZHIHdpbGwgcmV2ZXJzZSB0aGUgdHdvXG4gIG1hc2sgPSBSZW5kZXJlci5wdXNoT3JkZXJCaXRtYXNrKCBtYXNrLCBSZW5kZXJlci5iaXRtYXNrU1ZHICk7XG4gIGFzc2VydC5lcXVhbCggUmVuZGVyZXIuYml0bWFza09yZGVyKCBtYXNrLCAwICksIFJlbmRlcmVyLmJpdG1hc2tTVkcgKTtcbiAgYXNzZXJ0LmVxdWFsKCBSZW5kZXJlci5iaXRtYXNrT3JkZXIoIG1hc2ssIDEgKSwgUmVuZGVyZXIuYml0bWFza0NhbnZhcyApO1xuICBhc3NlcnQuZXF1YWwoIFJlbmRlcmVyLmJpdG1hc2tPcmRlciggbWFzaywgMiApLCAwICk7XG4gIGFzc2VydC5lcXVhbCggUmVuZGVyZXIuYml0bWFza09yZGVyKCBtYXNrLCAzICksIDAgKTtcbiAgYXNzZXJ0LmVxdWFsKCBSZW5kZXJlci5iaXRtYXNrT3JkZXIoIG1hc2ssIDQgKSwgMCApO1xuXG4gIC8vIHB1c2hpbmcgRE9NIHNoaWZ0cyB0aGUgb3RoZXIgdHdvIGRvd25cbiAgbWFzayA9IFJlbmRlcmVyLnB1c2hPcmRlckJpdG1hc2soIG1hc2ssIFJlbmRlcmVyLmJpdG1hc2tET00gKTtcbiAgYXNzZXJ0LmVxdWFsKCBSZW5kZXJlci5iaXRtYXNrT3JkZXIoIG1hc2ssIDAgKSwgUmVuZGVyZXIuYml0bWFza0RPTSApO1xuICBhc3NlcnQuZXF1YWwoIFJlbmRlcmVyLmJpdG1hc2tPcmRlciggbWFzaywgMSApLCBSZW5kZXJlci5iaXRtYXNrU1ZHICk7XG4gIGFzc2VydC5lcXVhbCggUmVuZGVyZXIuYml0bWFza09yZGVyKCBtYXNrLCAyICksIFJlbmRlcmVyLmJpdG1hc2tDYW52YXMgKTtcbiAgYXNzZXJ0LmVxdWFsKCBSZW5kZXJlci5iaXRtYXNrT3JkZXIoIG1hc2ssIDMgKSwgMCApO1xuXG4gIC8vIHB1c2hpbmcgRE9NIHJlc3VsdHMgaW4gbm8gY2hhbmdlXG4gIG1hc2sgPSBSZW5kZXJlci5wdXNoT3JkZXJCaXRtYXNrKCBtYXNrLCBSZW5kZXJlci5iaXRtYXNrRE9NICk7XG4gIGFzc2VydC5lcXVhbCggUmVuZGVyZXIuYml0bWFza09yZGVyKCBtYXNrLCAwICksIFJlbmRlcmVyLmJpdG1hc2tET00gKTtcbiAgYXNzZXJ0LmVxdWFsKCBSZW5kZXJlci5iaXRtYXNrT3JkZXIoIG1hc2ssIDEgKSwgUmVuZGVyZXIuYml0bWFza1NWRyApO1xuICBhc3NlcnQuZXF1YWwoIFJlbmRlcmVyLmJpdG1hc2tPcmRlciggbWFzaywgMiApLCBSZW5kZXJlci5iaXRtYXNrQ2FudmFzICk7XG4gIGFzc2VydC5lcXVhbCggUmVuZGVyZXIuYml0bWFza09yZGVyKCBtYXNrLCAzICksIDAgKTtcblxuICAvLyBwdXNoaW5nIENhbnZhcyBtb3ZlcyBpdCB0byB0aGUgZnJvbnRcbiAgbWFzayA9IFJlbmRlcmVyLnB1c2hPcmRlckJpdG1hc2soIG1hc2ssIFJlbmRlcmVyLmJpdG1hc2tDYW52YXMgKTtcbiAgYXNzZXJ0LmVxdWFsKCBSZW5kZXJlci5iaXRtYXNrT3JkZXIoIG1hc2ssIDAgKSwgUmVuZGVyZXIuYml0bWFza0NhbnZhcyApO1xuICBhc3NlcnQuZXF1YWwoIFJlbmRlcmVyLmJpdG1hc2tPcmRlciggbWFzaywgMSApLCBSZW5kZXJlci5iaXRtYXNrRE9NICk7XG4gIGFzc2VydC5lcXVhbCggUmVuZGVyZXIuYml0bWFza09yZGVyKCBtYXNrLCAyICksIFJlbmRlcmVyLmJpdG1hc2tTVkcgKTtcbiAgYXNzZXJ0LmVxdWFsKCBSZW5kZXJlci5iaXRtYXNrT3JkZXIoIG1hc2ssIDMgKSwgMCApO1xuXG4gIC8vIHB1c2hpbmcgRE9NIGFnYWluIHN3YXBzIGl0IHdpdGggdGhlIENhbnZhc1xuICBtYXNrID0gUmVuZGVyZXIucHVzaE9yZGVyQml0bWFzayggbWFzaywgUmVuZGVyZXIuYml0bWFza0RPTSApO1xuICBhc3NlcnQuZXF1YWwoIFJlbmRlcmVyLmJpdG1hc2tPcmRlciggbWFzaywgMCApLCBSZW5kZXJlci5iaXRtYXNrRE9NICk7XG4gIGFzc2VydC5lcXVhbCggUmVuZGVyZXIuYml0bWFza09yZGVyKCBtYXNrLCAxICksIFJlbmRlcmVyLmJpdG1hc2tDYW52YXMgKTtcbiAgYXNzZXJ0LmVxdWFsKCBSZW5kZXJlci5iaXRtYXNrT3JkZXIoIG1hc2ssIDIgKSwgUmVuZGVyZXIuYml0bWFza1NWRyApO1xuICBhc3NlcnQuZXF1YWwoIFJlbmRlcmVyLmJpdG1hc2tPcmRlciggbWFzaywgMyApLCAwICk7XG4gIC8vIGNvbnNvbGUubG9nKCBtYXNrLnRvU3RyaW5nKCAxNiApICk7XG4gIC8vIHB1c2hpbmcgV2ViR0wgc2hpZnRzIGV2ZXJ5dGhpbmdcbiAgbWFzayA9IFJlbmRlcmVyLnB1c2hPcmRlckJpdG1hc2soIG1hc2ssIFJlbmRlcmVyLmJpdG1hc2tXZWJHTCApO1xuICBhc3NlcnQuZXF1YWwoIFJlbmRlcmVyLmJpdG1hc2tPcmRlciggbWFzaywgMCApLCBSZW5kZXJlci5iaXRtYXNrV2ViR0wgKTtcbiAgYXNzZXJ0LmVxdWFsKCBSZW5kZXJlci5iaXRtYXNrT3JkZXIoIG1hc2ssIDEgKSwgUmVuZGVyZXIuYml0bWFza0RPTSApO1xuICBhc3NlcnQuZXF1YWwoIFJlbmRlcmVyLmJpdG1hc2tPcmRlciggbWFzaywgMiApLCBSZW5kZXJlci5iaXRtYXNrQ2FudmFzICk7XG4gIGFzc2VydC5lcXVhbCggUmVuZGVyZXIuYml0bWFza09yZGVyKCBtYXNrLCAzICksIFJlbmRlcmVyLmJpdG1hc2tTVkcgKTtcbiAgLy8gY29uc29sZS5sb2coIG1hc2sudG9TdHJpbmcoIDE2ICkgKTtcbn0gKTtcblxuXG5RVW5pdC50ZXN0KCAnRW1wdHkgRGlzcGxheSB1c2FnZScsIGFzc2VydCA9PiB7XG4gIGNvbnN0IG4gPSBuZXcgTm9kZSgpO1xuICBjb25zdCBkID0gbmV3IERpc3BsYXkoIG4gKTtcbiAgZC51cGRhdGVEaXNwbGF5KCk7XG4gIGQudXBkYXRlRGlzcGxheSgpO1xuXG4gIGFzc2VydC5vayggdHJ1ZSwgJ3NvIHdlIGhhdmUgYXQgbGVhc3QgMSB0ZXN0IGluIHRoaXMgc2V0JyApO1xuICBkLmRpc3Bvc2UoKTtcbn0gKTtcblxuUVVuaXQudGVzdCggJ1NpbXBsZSBEaXNwbGF5IHVzYWdlJywgYXNzZXJ0ID0+IHtcbiAgY29uc3QgciA9IG5ldyBSZWN0YW5nbGUoIDAsIDAsIDUwLCA1MCwgeyBmaWxsOiAncmVkJyB9ICk7XG4gIGNvbnN0IGQgPSBuZXcgRGlzcGxheSggciApO1xuICBkLnVwZGF0ZURpc3BsYXkoKTtcbiAgci5yZWN0V2lkdGggPSAxMDA7XG4gIGQudXBkYXRlRGlzcGxheSgpO1xuXG4gIGFzc2VydC5vayggdHJ1ZSwgJ3NvIHdlIGhhdmUgYXQgbGVhc3QgMSB0ZXN0IGluIHRoaXMgc2V0JyApO1xuICBkLmRpc3Bvc2UoKTtcbn0gKTtcblxuUVVuaXQudGVzdCggJ1N0aXRjaCBwYXR0ZXJucyAjMScsIGFzc2VydCA9PiB7XG4gIGNvbnN0IG4gPSBuZXcgTm9kZSgpO1xuICBjb25zdCBkID0gbmV3IERpc3BsYXkoIG4gKTtcbiAgZC51cGRhdGVEaXNwbGF5KCk7XG5cbiAgbi5hZGRDaGlsZCggbmV3IFJlY3RhbmdsZSggMCwgMCwgNTAsIDUwLCB7IGZpbGw6ICdyZWQnIH0gKSApO1xuICBkLnVwZGF0ZURpc3BsYXkoKTtcblxuICBuLmFkZENoaWxkKCBuZXcgUmVjdGFuZ2xlKCAwLCAwLCA1MCwgNTAsIHsgZmlsbDogJ3JlZCcgfSApICk7XG4gIGQudXBkYXRlRGlzcGxheSgpO1xuXG4gIG4uYWRkQ2hpbGQoIG5ldyBSZWN0YW5nbGUoIDAsIDAsIDUwLCA1MCwgeyBmaWxsOiAncmVkJyB9ICkgKTtcbiAgZC51cGRhdGVEaXNwbGF5KCk7XG5cbiAgbi5jaGlsZHJlblsgMSBdLnZpc2libGUgPSBmYWxzZTtcbiAgZC51cGRhdGVEaXNwbGF5KCk7XG5cbiAgbi5jaGlsZHJlblsgMSBdLnZpc2libGUgPSB0cnVlO1xuICBkLnVwZGF0ZURpc3BsYXkoKTtcblxuICBuLnJlbW92ZUNoaWxkKCBuLmNoaWxkcmVuWyAwIF0gKTtcbiAgZC51cGRhdGVEaXNwbGF5KCk7XG5cbiAgbi5yZW1vdmVDaGlsZCggbi5jaGlsZHJlblsgMSBdICk7XG4gIGQudXBkYXRlRGlzcGxheSgpO1xuXG4gIG4ucmVtb3ZlQ2hpbGQoIG4uY2hpbGRyZW5bIDAgXSApO1xuICBkLnVwZGF0ZURpc3BsYXkoKTtcblxuICBhc3NlcnQub2soIHRydWUsICdzbyB3ZSBoYXZlIGF0IGxlYXN0IDEgdGVzdCBpbiB0aGlzIHNldCcgKTtcbiAgZC5kaXNwb3NlKCk7XG59ICk7XG5cblFVbml0LnRlc3QoICdJbnZpc2libGUgYXBwZW5kJywgYXNzZXJ0ID0+IHtcbiAgY29uc3Qgc2NlbmUgPSBuZXcgTm9kZSgpO1xuICBjb25zdCBkaXNwbGF5ID0gbmV3IERpc3BsYXkoIHNjZW5lICk7XG4gIGRpc3BsYXkudXBkYXRlRGlzcGxheSgpO1xuXG4gIGNvbnN0IGEgPSBuZXcgUmVjdGFuZ2xlKCAwLCAwLCAxMDAsIDUwLCB7IGZpbGw6ICdyZWQnIH0gKTtcbiAgc2NlbmUuYWRkQ2hpbGQoIGEgKTtcbiAgZGlzcGxheS51cGRhdGVEaXNwbGF5KCk7XG5cbiAgY29uc3QgYiA9IG5ldyBSZWN0YW5nbGUoIDAsIDAsIDEwMCwgNTAsIHsgZmlsbDogJ3JlZCcsIHZpc2libGU6IGZhbHNlIH0gKTtcbiAgc2NlbmUuYWRkQ2hpbGQoIGIgKTtcbiAgZGlzcGxheS51cGRhdGVEaXNwbGF5KCk7XG5cbiAgYXNzZXJ0Lm9rKCB0cnVlLCAnc28gd2UgaGF2ZSBhdCBsZWFzdCAxIHRlc3QgaW4gdGhpcyBzZXQnICk7XG4gIGRpc3BsYXkuZGlzcG9zZSgpO1xuXG59ICk7XG5cblFVbml0LnRlc3QoICdTdGl0Y2hpbmcgcHJvYmxlbSBBIChHaXRIdWIgSXNzdWUgIzMzOSknLCBhc3NlcnQgPT4ge1xuICBjb25zdCBzY2VuZSA9IG5ldyBOb2RlKCk7XG4gIGNvbnN0IGRpc3BsYXkgPSBuZXcgRGlzcGxheSggc2NlbmUgKTtcblxuICBjb25zdCBhID0gbmV3IFJlY3RhbmdsZSggMCwgMCwgMTAwLCA1MCwgeyBmaWxsOiAncmVkJyB9ICk7XG4gIGNvbnN0IGIgPSBuZXcgUmVjdGFuZ2xlKCAwLCAwLCA1MCwgNTAsIHsgZmlsbDogJ2JsdWUnIH0gKTtcbiAgY29uc3QgYyA9IG5ldyBET00oIGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoICdkaXYnICkgKTtcbiAgY29uc3QgZCA9IG5ldyBSZWN0YW5nbGUoIDEwMCwgMCwgMTAwLCA1MCwgeyBmaWxsOiAncmVkJyB9ICk7XG4gIGNvbnN0IGUgPSBuZXcgUmVjdGFuZ2xlKCAxMDAsIDAsIDUwLCA1MCwgeyBmaWxsOiAnYmx1ZScgfSApO1xuXG4gIGNvbnN0IGYgPSBuZXcgUmVjdGFuZ2xlKCAwLCA1MCwgMTAwLCA1MCwgeyBmaWxsOiAnZ3JlZW4nIH0gKTtcbiAgY29uc3QgZyA9IG5ldyBET00oIGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoICdkaXYnICkgKTtcblxuICBzY2VuZS5hZGRDaGlsZCggYSApO1xuICBzY2VuZS5hZGRDaGlsZCggZiApO1xuICBzY2VuZS5hZGRDaGlsZCggYiApO1xuICBzY2VuZS5hZGRDaGlsZCggYyApO1xuICBzY2VuZS5hZGRDaGlsZCggZCApO1xuICBzY2VuZS5hZGRDaGlsZCggZSApO1xuICBkaXNwbGF5LnVwZGF0ZURpc3BsYXkoKTtcblxuICBzY2VuZS5yZW1vdmVDaGlsZCggZiApO1xuICBzY2VuZS5pbnNlcnRDaGlsZCggNCwgZyApO1xuICBkaXNwbGF5LnVwZGF0ZURpc3BsYXkoKTtcblxuICBhc3NlcnQub2soIHRydWUsICdzbyB3ZSBoYXZlIGF0IGxlYXN0IDEgdGVzdCBpbiB0aGlzIHNldCcgKTtcbiAgZGlzcGxheS5kaXNwb3NlKCk7XG5cbn0gKTtcblxuUVVuaXQudGVzdCggJ1NWRyBncm91cCBkaXNwb3NhbCBpc3N1ZSAoR2l0SHViIElzc3VlICMzNTQpIEEnLCBhc3NlcnQgPT4ge1xuICBjb25zdCBzY2VuZSA9IG5ldyBOb2RlKCk7XG4gIGNvbnN0IGRpc3BsYXkgPSBuZXcgRGlzcGxheSggc2NlbmUgKTtcblxuICBjb25zdCBub2RlID0gbmV3IE5vZGUoIHtcbiAgICByZW5kZXJlcjogJ3N2ZycsXG4gICAgY3NzVHJhbnNmb3JtOiB0cnVlXG4gIH0gKTtcbiAgY29uc3QgcmVjdCA9IG5ldyBSZWN0YW5nbGUoIDAsIDAsIDEwMCwgNTAsIHsgZmlsbDogJ3JlZCcgfSApO1xuXG4gIHNjZW5lLmFkZENoaWxkKCBub2RlICk7XG4gIG5vZGUuYWRkQ2hpbGQoIHJlY3QgKTtcbiAgZGlzcGxheS51cGRhdGVEaXNwbGF5KCk7XG5cbiAgc2NlbmUucmVtb3ZlQ2hpbGQoIG5vZGUgKTtcbiAgZGlzcGxheS51cGRhdGVEaXNwbGF5KCk7XG5cbiAgYXNzZXJ0Lm9rKCB0cnVlLCAnc28gd2UgaGF2ZSBhdCBsZWFzdCAxIHRlc3QgaW4gdGhpcyBzZXQnICk7XG4gIGRpc3BsYXkuZGlzcG9zZSgpO1xuXG59ICk7XG5cblFVbml0LnRlc3QoICdTVkcgZ3JvdXAgZGlzcG9zYWwgaXNzdWUgKEdpdEh1YiBJc3N1ZSAjMzU0KSBCJywgYXNzZXJ0ID0+IHtcbiAgY29uc3Qgc2NlbmUgPSBuZXcgTm9kZSgpO1xuICBjb25zdCBkaXNwbGF5ID0gbmV3IERpc3BsYXkoIHNjZW5lICk7XG5cbiAgY29uc3Qgbm9kZSA9IG5ldyBOb2RlKCk7XG4gIGNvbnN0IHJlY3QgPSBuZXcgUmVjdGFuZ2xlKCAwLCAwLCAxMDAsIDUwLCB7XG4gICAgZmlsbDogJ3JlZCcsXG4gICAgcmVuZGVyZXI6ICdzdmcnLFxuICAgIGNzc1RyYW5zZm9ybTogdHJ1ZVxuICB9ICk7XG5cbiAgc2NlbmUuYWRkQ2hpbGQoIG5vZGUgKTtcbiAgbm9kZS5hZGRDaGlsZCggcmVjdCApO1xuICBkaXNwbGF5LnVwZGF0ZURpc3BsYXkoKTtcblxuICBzY2VuZS5yZW1vdmVDaGlsZCggbm9kZSApO1xuICBkaXNwbGF5LnVwZGF0ZURpc3BsYXkoKTtcblxuICBhc3NlcnQub2soIHRydWUsICdzbyB3ZSBoYXZlIGF0IGxlYXN0IDEgdGVzdCBpbiB0aGlzIHNldCcgKTtcbiAgZGlzcGxheS5kaXNwb3NlKCk7XG59ICk7XG5cblFVbml0LnRlc3QoICdFbXB0eSBwYXRoIGRpc3BsYXkgdGVzdCcsIGFzc2VydCA9PiB7XG4gIGNvbnN0IHNjZW5lID0gbmV3IE5vZGUoKTtcbiAgY29uc3QgZGlzcGxheSA9IG5ldyBEaXNwbGF5KCBzY2VuZSApO1xuXG4gIHNjZW5lLmFkZENoaWxkKCBuZXcgUGF0aCggbnVsbCApICk7XG4gIGRpc3BsYXkudXBkYXRlRGlzcGxheSgpO1xuXG4gIGFzc2VydC5vayggdHJ1ZSwgJ3NvIHdlIGhhdmUgYXQgbGVhc3QgMSB0ZXN0IGluIHRoaXMgc2V0JyApO1xuICBkaXNwbGF5LmRpc3Bvc2UoKTtcbn0gKTtcblxuUVVuaXQudGVzdCggJ0RvdWJsZSByZW1vdmUgcmVsYXRlZCB0byAjMzkyJywgYXNzZXJ0ID0+IHtcbiAgY29uc3Qgc2NlbmUgPSBuZXcgTm9kZSgpO1xuICBjb25zdCBkaXNwbGF5ID0gbmV3IERpc3BsYXkoIHNjZW5lICk7XG5cbiAgZGlzcGxheS51cGRhdGVEaXNwbGF5KCk7XG5cbiAgY29uc3QgbjEgPSBuZXcgTm9kZSgpO1xuICBjb25zdCBuMiA9IG5ldyBOb2RlKCk7XG4gIHNjZW5lLmFkZENoaWxkKCBuMSApO1xuICBuMS5hZGRDaGlsZCggbjIgKTtcbiAgc2NlbmUuYWRkQ2hpbGQoIG4yICk7IC8vIHNvIHRoZSB0cmVlIGhhcyBhIHJlZmVyZW5jZSB0byB0aGUgTm9kZSB0aGF0IHdlIGNhbiB0cmlnZ2VyIHRoZSBmYWlsdXJlIG9uXG5cbiAgZGlzcGxheS51cGRhdGVEaXNwbGF5KCk7XG5cbiAgc2NlbmUucmVtb3ZlQ2hpbGQoIG4xICk7XG4gIG4xLnJlbW92ZUNoaWxkKCBuMiApO1xuXG4gIGRpc3BsYXkudXBkYXRlRGlzcGxheSgpO1xuXG4gIGFzc2VydC5vayggdHJ1ZSwgJ3NvIHdlIGhhdmUgYXQgbGVhc3QgMSB0ZXN0IGluIHRoaXMgc2V0JyApO1xuICBkaXNwbGF5LmRpc3Bvc2UoKTtcbn0gKTsiXSwibmFtZXMiOlsiU2hhcGUiLCJDaXJjbGUiLCJET00iLCJJbWFnZSIsIkxpbmUiLCJOb2RlIiwiUGF0aCIsIlJlY3RhbmdsZSIsIlRleHQiLCJDYW52YXNDb250ZXh0V3JhcHBlciIsIkRpc3BsYXkiLCJDaXJjbGVDYW52YXNEcmF3YWJsZSIsIkNpcmNsZURPTURyYXdhYmxlIiwiQ2lyY2xlU1ZHRHJhd2FibGUiLCJET01EcmF3YWJsZSIsIkltYWdlQ2FudmFzRHJhd2FibGUiLCJJbWFnZURPTURyYXdhYmxlIiwiSW1hZ2VTVkdEcmF3YWJsZSIsIkxpbmVDYW52YXNEcmF3YWJsZSIsIkxpbmVTVkdEcmF3YWJsZSIsIlBhdGhDYW52YXNEcmF3YWJsZSIsIlBhdGhTVkdEcmF3YWJsZSIsIlJlY3RhbmdsZUNhbnZhc0RyYXdhYmxlIiwiUmVjdGFuZ2xlRE9NRHJhd2FibGUiLCJSZWN0YW5nbGVTVkdEcmF3YWJsZSIsIlRleHRDYW52YXNEcmF3YWJsZSIsIlRleHRET01EcmF3YWJsZSIsIlRleHRTVkdEcmF3YWJsZSIsIkluc3RhbmNlIiwiUmVuZGVyZXIiLCJRVW5pdCIsIm1vZHVsZSIsInRlc3QiLCJhc3NlcnQiLCJzdHViRGlzcGxheSIsIl9mcmFtZUlkIiwiaXNXZWJHTEFsbG93ZWQiLCJjYW52YXMiLCJkb2N1bWVudCIsImNyZWF0ZUVsZW1lbnQiLCJ3aWR0aCIsImhlaWdodCIsImNvbnRleHQiLCJnZXRDb250ZXh0Iiwid3JhcHBlciIsInIxIiwiZmlsbCIsInN0cm9rZSIsImxpbmVXaWR0aCIsInIxaSIsImdldFVuaXF1ZVRyYWlsIiwicjFkZCIsImNyZWF0ZURPTURyYXdhYmxlIiwiYml0bWFza0RPTSIsInIxZHMiLCJjcmVhdGVTVkdEcmF3YWJsZSIsImJpdG1hc2tTVkciLCJyMWRjIiwiY3JlYXRlQ2FudmFzRHJhd2FibGUiLCJiaXRtYXNrQ2FudmFzIiwib2siLCJfZHJhd2FibGVzIiwibGVuZ3RoIiwidXBkYXRlRE9NIiwidXBkYXRlU1ZHIiwicGFpbnRDYW52YXMiLCJzZXRSZWN0IiwiZGlzcG9zZSIsInBvb2wiLCJzZXRSYWRpdXMiLCJ4MSIsIngyIiwicmVndWxhclBvbHlnb24iLCJzaGFwZSIsInN0cmluZyIsImZvbnQiLCJpbWFnZSIsIm1hc2siLCJjcmVhdGVPcmRlckJpdG1hc2siLCJiaXRtYXNrV2ViR0wiLCJlcXVhbCIsImJpdG1hc2tPcmRlciIsInB1c2hPcmRlckJpdG1hc2siLCJuIiwiZCIsInVwZGF0ZURpc3BsYXkiLCJyIiwicmVjdFdpZHRoIiwiYWRkQ2hpbGQiLCJjaGlsZHJlbiIsInZpc2libGUiLCJyZW1vdmVDaGlsZCIsInNjZW5lIiwiZGlzcGxheSIsImEiLCJiIiwiYyIsImUiLCJmIiwiZyIsImluc2VydENoaWxkIiwibm9kZSIsInJlbmRlcmVyIiwiY3NzVHJhbnNmb3JtIiwicmVjdCIsIm4xIiwibjIiXSwibWFwcGluZ3MiOiJBQUFBLHNEQUFzRDtBQUV0RDs7OztDQUlDLEdBRUQsU0FBU0EsS0FBSyxRQUFRLDhCQUE4QjtBQUNwRCxPQUFPQyxZQUFZLHFCQUFxQjtBQUN4QyxPQUFPQyxTQUFTLGtCQUFrQjtBQUNsQyxPQUFPQyxXQUFXLG9CQUFvQjtBQUN0QyxPQUFPQyxVQUFVLG1CQUFtQjtBQUNwQyxPQUFPQyxVQUFVLG1CQUFtQjtBQUNwQyxPQUFPQyxVQUFVLG1CQUFtQjtBQUNwQyxPQUFPQyxlQUFlLHdCQUF3QjtBQUM5QyxPQUFPQyxVQUFVLG1CQUFtQjtBQUNwQyxPQUFPQywwQkFBMEIsa0NBQWtDO0FBQ25FLE9BQU9DLGFBQWEsZUFBZTtBQUNuQyxPQUFPQywwQkFBMEIsc0NBQXNDO0FBQ3ZFLE9BQU9DLHVCQUF1QixtQ0FBbUM7QUFDakUsT0FBT0MsdUJBQXVCLG1DQUFtQztBQUNqRSxPQUFPQyxpQkFBaUIsNkJBQTZCO0FBQ3JELE9BQU9DLHlCQUF5QixxQ0FBcUM7QUFDckUsT0FBT0Msc0JBQXNCLGtDQUFrQztB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