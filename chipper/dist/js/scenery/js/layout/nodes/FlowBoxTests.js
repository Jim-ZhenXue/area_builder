// Copyright 2024, University of Colorado Boulder
/**
 * Tests for FlowBox. Covering its various features such as:
 *
 *  - basic layout
 *  - resizing of cells
 *  - grow for cells
 *  - stretch for cells
 *  - constraining cell sizes
 *  - justify
 *  - wrap
 *  - align
 *  - justifyLines
 *  - spacing
 *  - lineSpacing
 *  - margins
 *  - per-cell layout options
 *  - separators
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */ import Rectangle from '../../nodes/Rectangle.js';
import LayoutTestUtils from '../LayoutTestUtils.js';
import HBox from './HBox.js';
import VBox from './VBox.js';
import VSeparator from './VSeparator.js';
const RECT_WIDTH = LayoutTestUtils.RECT_WIDTH;
const RECT_HEIGHT = LayoutTestUtils.RECT_HEIGHT;
QUnit.module('FlowBox');
QUnit.test('Basic HBox/VBox tests', (assert)=>{
    const [a, b] = LayoutTestUtils.createRectangles(2);
    const hBox = new HBox({
        children: [
            a,
            b
        ]
    });
    hBox.validateBounds();
    assert.equal(a.right, b.left, 'a.right === b.left for hBox');
    assert.equal(b.left, a.width, 'b.left === a.width for hBox');
    // translate box and make sure layout is correct
    hBox.left = 200;
    hBox.validateBounds();
    assert.equal(b.globalBounds.left, 200 + RECT_WIDTH, 'b.globalBounds.left === 200 + RECT_WIDTH');
    hBox.dispose();
    const vBox = new VBox({
        children: [
            a,
            b
        ]
    });
    vBox.validateBounds();
    assert.equal(a.bottom, b.top, 'a.bottom === b.top for vBox');
    assert.equal(b.top, a.height, 'b.top === a.height for vBox');
    // translate box and make sure layout is correct
    vBox.top = 200;
    vBox.validateBounds();
    assert.equal(b.globalBounds.top, 200 + RECT_HEIGHT, 'b.globalBounds.top === 200 + RECT_HEIGHT');
    vBox.dispose();
});
QUnit.test('FlowBox cell resizing', (assert)=>{
    let [a, b] = LayoutTestUtils.createRectangles(2);
    const hBox = new HBox({
        children: [
            a,
            b
        ]
    });
    hBox.validateBounds();
    // resize a and make sure layout is correct
    a.rectWidth = RECT_WIDTH * 2;
    hBox.validateBounds();
    assert.equal(a.right, b.left, 'a.right === b.left for hBox after resize');
    assert.equal(b.left, a.width, 'b.left === a.width for hBox after resize');
    assert.equal(b.left, RECT_WIDTH * 2, 'b.left === RECT_WIDTH * 2 for hBox after resize');
    hBox.dispose();
    const vBox = new VBox({
        children: [
            a,
            b
        ]
    });
    vBox.validateBounds();
    // resize a and make sure layout is correct
    a.rectHeight = RECT_HEIGHT * 2;
    vBox.validateBounds();
    assert.equal(a.bottom, b.top, 'a.bottom === b.top for vBox after resize');
    assert.equal(b.top, a.height, 'b.top === a.height for vBox after resize');
    assert.equal(b.top, RECT_HEIGHT * 2, 'b.top === RECT_WIDTH * 2 for vBox after resize');
    vBox.dispose();
    //---------------------------------------------------------------------------------
    // Tests that disable resizing
    //---------------------------------------------------------------------------------
    [a, b] = LayoutTestUtils.createRectangles(2);
    const hBoxNoResize = new HBox({
        children: [
            a,
            b
        ],
        resize: false
    });
    // resize a and make sure layout is correct - it should not adjust
    a.rectWidth = RECT_WIDTH * 2;
    hBoxNoResize.validateBounds();
    assert.equal(a.right, RECT_WIDTH * 2, 'a.right === RECT_WIDTH * 2 for hBoxNoResize after resize');
    assert.equal(b.left, RECT_WIDTH, 'b.left === RECT_WIDTH for hBox after resize');
    hBoxNoResize.dispose();
    const vBoxNoResize = new VBox({
        children: [
            a,
            b
        ],
        resize: false
    });
    // resize a and make sure layout is correct - it should not adjust
    a.rectHeight = RECT_HEIGHT * 2;
    vBoxNoResize.validateBounds();
    assert.equal(a.bottom, RECT_HEIGHT * 2, 'a.bottom === RECT_HEIGHT * 2 for vBoxNoResize after resize');
    assert.equal(b.top, RECT_HEIGHT, 'b.top === RECT_HEIGHT for vBox after resize');
    vBoxNoResize.dispose();
});
QUnit.test('Invisible children', (assert)=>{
    const [c, d, e] = LayoutTestUtils.createRectangles(3);
    d.visible = false;
    // Invisible Nodes should not be included in layout bounds by default.
    const hBoxInvisible = new HBox({
        children: [
            c,
            d,
            e
        ]
    });
    assert.equal(hBoxInvisible.width, RECT_WIDTH * 2, 'width should not include invisible node');
    assert.equal(c.right, e.left, 'c.right === e.left for middle Node invisible in HBox');
    // Invisible Nodes can be included in layout bounds if specified.
    hBoxInvisible.setExcludeInvisibleChildrenFromBounds(false);
    assert.equal(hBoxInvisible.width, RECT_WIDTH * 3, 'width should include invisible node');
    assert.notEqual(c.right, e.left, 'c.right !== e.left when invisible node is included in HBox bounds');
    assert.equal(c.right, d.left, 'c.right === d.left when invisible node is included in HBox bounds');
    assert.equal(d.right, e.left, 'd.right === e.left when invisible node is included in HBox bounds');
    hBoxInvisible.dispose();
});
QUnit.test('Children that grow, stretch, and have size constraints', (assert)=>{
    const [a, b, c] = LayoutTestUtils.createRectangles(3, (index)=>{
        // Make these rectangles sizable so that they can grow/stretch for these tests
        return {
            sizable: true,
            localMinimumWidth: RECT_WIDTH,
            localMinimumHeight: RECT_HEIGHT
        };
    });
    // initial test
    const hBox = new HBox({
        children: [
            a,
            b,
            c
        ]
    });
    assert.equal(hBox.width, RECT_WIDTH * 3, 'width should be sum of children widths');
    // Make it larger than its contents to test
    hBox.preferredWidth = RECT_WIDTH * 6;
    assert.equal(hBox.width, RECT_WIDTH * 6, 'width should take up preferred width');
    assert.equal(b.width, RECT_WIDTH, 'b.width should be RECT_WIDTH');
    // Make b grow to take up all remaining space
    b.layoutOptions = {
        grow: 1
    };
    assert.equal(b.width, RECT_WIDTH * 4, 'b.width should be RECT_WIDTH * 4');
    // Make a grow and extra space should be shared between a and b
    a.layoutOptions = {
        grow: 1
    };
    assert.equal(a.width, RECT_WIDTH * 2.5, 'a.width should be RECT_WIDTH * 2');
    assert.equal(b.width, RECT_WIDTH * 2.5, 'b.width should be RECT_WIDTH * 4');
    assert.equal(c.width, RECT_WIDTH, 'c.width should be RECT_WIDTH');
    // make c grow and extra space should be shared between all three
    c.layoutOptions = {
        grow: 1
    };
    assert.equal(a.width, RECT_WIDTH * 2, 'a.width should be RECT_WIDTH * 2');
    assert.equal(b.width, RECT_WIDTH * 2, 'b.width should be RECT_WIDTH * 2');
    assert.equal(c.width, RECT_WIDTH * 2, 'c.width should be RECT_WIDTH * 2');
    // Double c's grow value and it should take up proportionally more space - each should tak up the minimum width
    // plus its proportion of teh remaining space as specified by grow.
    c.layoutOptions = {
        grow: 2
    };
    // grow lets nodes take up the remaining EXTRA space, so the distribution should be:
    const extraSpace = RECT_WIDTH * 6 - RECT_WIDTH * 3; // preferred width - sum of minimum widths
    const expectedAWidth = RECT_WIDTH + extraSpace / 4; // distribution of grow values
    const expectedBWidth = RECT_WIDTH + extraSpace / 4;
    const expectedCWidth = RECT_WIDTH + extraSpace / 2;
    assert.equal(a.width, expectedAWidth, 'a.width should be RECT_WIDTH');
    assert.equal(b.width, expectedBWidth, 'b.width should be RECT_WIDTH');
    assert.equal(c.width, expectedCWidth, 'c.width should be RECT_WIDTH');
    //---------------------------------------------------------------------------------
    // stretch
    //---------------------------------------------------------------------------------
    hBox.preferredHeight = RECT_HEIGHT * 3; // extend height of the container
    assert.equal(a.height, RECT_HEIGHT, 'a.height should be RECT_HEIGHT before stretch');
    a.layoutOptions = {
        stretch: true
    };
    assert.equal(a.height, RECT_HEIGHT * 3, 'a.height should be RECT_HEIGHT * 3 after stretch');
    //---------------------------------------------------------------------------------
    // size constraints
    //---------------------------------------------------------------------------------
    a.layoutOptions = {
        stretch: false,
        grow: 1,
        maxContentWidth: RECT_WIDTH,
        maxContentHeight: RECT_HEIGHT
    };
    b.layoutOptions = {
        stretch: true,
        grow: 1
    };
    c.layoutOptions = {
        stretch: false,
        grow: 1
    };
    hBox.preferredWidth = RECT_WIDTH * 10;
    hBox.preferredHeight = RECT_HEIGHT * 10;
    const remainingWidth = RECT_WIDTH * 10 - RECT_WIDTH; // the preferred width minus the constrained width of rect a
    assert.equal(a.width, RECT_WIDTH, 'a.width should be RECT_WIDTH because of maxContentWidth, even though it grows');
    assert.equal(a.height, RECT_HEIGHT, 'a.height should be RECT_HEIGHT because of maxContentHeight, even though it stretches');
    assert.equal(b.width, remainingWidth / 2, 'b.width should be half of the remaining width');
    assert.equal(b.height, RECT_HEIGHT * 10, 'b.height should be RECT_HEIGHT * 10 because it stretches');
    assert.equal(c.width, remainingWidth / 2, 'c.width should be half of the remaining width');
    assert.equal(c.height, RECT_HEIGHT, 'c.height should be RECT_HEIGHT because it doesnt stretch');
    //---------------------------------------------------------------------------------
    // size constraints on the container
    //---------------------------------------------------------------------------------
    const [d, e] = LayoutTestUtils.createRectangles(3);
    const [f, g] = LayoutTestUtils.createRectangles(2);
    const hBoxWithConstraint = new HBox({
        layoutOptions: {
            minContentWidth: RECT_WIDTH * 4
        },
        children: [
            d,
            e
        ]
    });
    const vBoxWithConstraint = new VBox({
        layoutOptions: {
            minContentWidth: RECT_WIDTH * 4
        },
        children: [
            f,
            g
        ]
    });
    const combinedBox = new HBox({
        children: [
            hBoxWithConstraint,
            vBoxWithConstraint
        ]
    });
    assert.equal(combinedBox.width, RECT_WIDTH * 8, 'width should be sum of children minContentWidths (applied to all cells)');
});
QUnit.test('Justify tests', (assert)=>{
    const [a, b, c, d] = LayoutTestUtils.createRectangles(4);
    const hBox = new HBox({
        children: [
            a,
            b,
            c,
            d
        ]
    });
    assert.equal(hBox.width, 4 * RECT_WIDTH, 'width should be sum of children widths');
    // Double the preferred width of the container to play with justify effects
    hBox.preferredWidth = RECT_WIDTH * 8;
    assert.equal(hBox.width, RECT_WIDTH * 8, 'width should be the preferred width');
    //---------------------------------------------------------------------------------
    // justify left
    //---------------------------------------------------------------------------------
    hBox.justify = 'left';
    assert.equal(a.left, hBox.left, 'a.left should be hBox.left');
    assert.equal(a.right, b.left, 'a.right should be b.left');
    assert.equal(b.right, c.left, 'b.right should be c.left');
    assert.equal(c.right, d.left, 'c.right should be d.left');
    assert.equal(d.right, 4 * RECT_WIDTH, 'd.right should be 4 * RECT_WIDTH');
    //---------------------------------------------------------------------------------
    // justify right
    //---------------------------------------------------------------------------------
    hBox.justify = 'right';
    assert.equal(a.left, 4 * RECT_WIDTH, 'a.left should be 4 * RECT_WIDTH');
    assert.equal(b.left, a.right, 'b.left should be a.right');
    assert.equal(c.left, b.right, 'c.left should be b.right');
    assert.equal(d.left, c.right, 'd.left should be c.right');
    assert.equal(d.right, hBox.right, 'd.right should be hBox.right');
    //---------------------------------------------------------------------------------
    // justify spaceBetween
    //---------------------------------------------------------------------------------
    hBox.justify = 'spaceBetween';
    assert.equal(a.left, hBox.left, 'a.left should be hBox.left');
    assert.equal(d.right, hBox.right, 'd.right should be hBox.right');
    assert.ok(LayoutTestUtils.aboutEqual(b.left - a.right, c.left - b.right), 'space between a and b should be equal to space between b and c');
    assert.ok(LayoutTestUtils.aboutEqual(c.left - b.right, d.left - c.right), 'space between b and c should be equal to space between c and d');
    //---------------------------------------------------------------------------------
    // justify spaceAround
    //---------------------------------------------------------------------------------
    hBox.justify = 'spaceAround';
    // space around has half the space on the outside of the first and last nodes, and the other half between each pair
    // of nodes
    const totalSpace = hBox.width - 4 * RECT_WIDTH;
    const sideSpacing = totalSpace / 4 / 2; // Each Node gets half space to the left and right
    assert.ok(LayoutTestUtils.aboutEqual(a.left, hBox.left + sideSpacing), 'a.left should be hBox.left + spaceAround');
    assert.ok(LayoutTestUtils.aboutEqual(a.right + sideSpacing * 2, b.left), 'a.right + sideSpacing * 2 should be b.left');
    assert.ok(LayoutTestUtils.aboutEqual(b.right + sideSpacing * 2, c.left), 'b.right + sideSpacing * 2 should be c.left');
    assert.ok(LayoutTestUtils.aboutEqual(c.right + sideSpacing * 2, d.left), 'c.right + sideSpacing * 2 should be d.left');
    assert.ok(LayoutTestUtils.aboutEqual(d.right, hBox.right - sideSpacing), 'd.right should be hBox.right - spaceAround');
    //---------------------------------------------------------------------------------
    // justify spaceEvenly
    //---------------------------------------------------------------------------------
    hBox.justify = 'spaceEvenly';
    // space evenly has equal space between each pair of nodes and on the outside of the first and last nodes
    const spaceBetween = totalSpace / 5; // 4 spaces between 5 nodes
    assert.ok(LayoutTestUtils.aboutEqual(a.left, hBox.left + spaceBetween), 'a.left should be hBox.left + spaceEvenly');
    assert.ok(LayoutTestUtils.aboutEqual(a.right + spaceBetween, b.left), 'a.right + spaceBetween should be b.left');
    assert.ok(LayoutTestUtils.aboutEqual(b.right + spaceBetween, c.left), 'b.right + spaceBetween should be c.left');
    assert.ok(LayoutTestUtils.aboutEqual(c.right + spaceBetween, d.left), 'c.right + spaceBetween should be d.left');
    assert.ok(LayoutTestUtils.aboutEqual(d.right, hBox.right - spaceBetween), 'd.right should be hBox.right - spaceEvenly');
    //---------------------------------------------------------------------------------
    // justify center
    //---------------------------------------------------------------------------------
    hBox.justify = 'center';
    const remainingSpace = hBox.width - 4 * RECT_WIDTH;
    const halfRemainingSpace = remainingSpace / 2;
    assert.ok(LayoutTestUtils.aboutEqual(a.left, hBox.left + halfRemainingSpace), 'a.left should be hBox.left + halfRemainingSpace');
    assert.equal(a.right, b.left, 'a.right should be b.left');
    assert.equal(b.right, c.left, 'b.right should be c.left');
    assert.equal(c.right, d.left, 'c.right should be d.left');
    assert.ok(LayoutTestUtils.aboutEqual(d.right, hBox.right - halfRemainingSpace), 'd.right should be hBox.right - halfRemainingSpace');
});
QUnit.test('Wrap tests', (assert)=>{
    const [a, b, c, d] = LayoutTestUtils.createRectangles(4);
    const hBox = new HBox({
        children: [
            a,
            b,
            c,
            d
        ],
        wrap: true
    });
    assert.equal(hBox.width, 4 * RECT_WIDTH, 'width should be sum of children widths');
    assert.equal(hBox.height, RECT_HEIGHT, 'height should be RECT_HEIGHT');
    // restrict the preferred width of the container to test wrap
    hBox.preferredWidth = RECT_WIDTH * 2;
    assert.equal(hBox.width, RECT_WIDTH * 2, 'width should be the preferred width');
    assert.equal(hBox.height, RECT_HEIGHT * 2, 'height should be larger due to wrap');
    // make the container even smaller to test wrap
    hBox.preferredWidth = RECT_WIDTH;
    assert.equal(hBox.width, RECT_WIDTH, 'width should be the preferred width');
    assert.equal(hBox.height, RECT_HEIGHT * 4, 'height should be larger due to wrap');
});
QUnit.test('Align tests', (assert)=>{
    const a = new Rectangle(0, 0, RECT_WIDTH, 10);
    const b = new Rectangle(0, 0, RECT_WIDTH, 20);
    const c = new Rectangle(0, 0, RECT_WIDTH, 30);
    const d = new Rectangle(0, 0, RECT_WIDTH, 40);
    const hBox = new HBox({
        children: [
            a,
            b,
            c,
            d
        ]
    });
    //---------------------------------------------------------------------------------
    // align top
    //---------------------------------------------------------------------------------
    hBox.align = 'top';
    assert.equal(a.top, hBox.top, 'a.top should be hBox.top (align top)');
    assert.equal(b.top, hBox.top, 'b.top should be hBox.top (align top)');
    assert.equal(c.top, hBox.top, 'c.top should be hBox.top (align top)');
    assert.equal(d.top, hBox.top, 'd.top should be hBox.top (align top)');
    assert.notEqual(a.bottom, b.bottom, 'a.bottom should not be b.bottom (align top)');
    assert.notEqual(b.bottom, c.bottom, 'b.bottom should not be c.bottom (align top)');
    assert.notEqual(c.bottom, d.bottom, 'c.bottom should not be d.bottom (align top)');
    //---------------------------------------------------------------------------------
    // align bottom
    //---------------------------------------------------------------------------------
    hBox.align = 'bottom';
    assert.equal(a.bottom, hBox.bottom, 'a.bottom should be hBox.bottom (align bottom)');
    assert.equal(b.bottom, hBox.bottom, 'b.bottom should be hBox.bottom (align bottom)');
    assert.equal(c.bottom, hBox.bottom, 'c.bottom should be hBox.bottom (align bottom)');
    assert.equal(d.bottom, hBox.bottom, 'd.bottom should be hBox.bottom (align bottom)');
    assert.notEqual(a.top, b.top, 'a.top should not be b.top (align bottom)');
    assert.notEqual(b.top, c.top, 'b.top should not be c.top (align bottom)');
    assert.notEqual(c.top, d.top, 'c.top should not be d.top (align bottom)');
    //---------------------------------------------------------------------------------
    // align center
    //---------------------------------------------------------------------------------
    hBox.align = 'center';
    assert.equal(a.centerY, hBox.centerY, 'a.centerY should be hBox.centerY (align center)');
    assert.equal(b.centerY, hBox.centerY, 'b.centerY should be hBox.centerY (align center)');
    assert.equal(c.centerY, hBox.centerY, 'c.centerY should be hBox.centerY (align center)');
    assert.equal(d.centerY, hBox.centerY, 'd.centerY should be hBox.centerY (align center)');
    //---------------------------------------------------------------------------------
    // align origin
    //---------------------------------------------------------------------------------
    hBox.align = 'origin';
    // rectangle origins at top left
    assert.equal(a.top, hBox.top, 'a.top should be hBox.top (align origin)');
    assert.equal(b.top, hBox.top, 'b.top should be hBox.top (align origin)');
    assert.equal(c.top, hBox.top, 'c.top should be hBox.top (align origin)');
    assert.equal(d.top, hBox.top, 'd.top should be hBox.top (align origin)');
});
QUnit.test('Justify Lines Tests', (assert)=>{
    const [a, b, c, d] = LayoutTestUtils.createRectangles(4);
    const hBox = new HBox({
        children: [
            a,
            b,
            c,
            d
        ],
        // so that rectangles will stack on the secondary axis
        preferredWidth: RECT_WIDTH,
        wrap: true,
        // so there is plenty of room on the secondary axis to test justifyLines
        preferredHeight: RECT_HEIGHT * 8
    });
    //---------------------------------------------------------------------------------
    // justifyLines top
    //---------------------------------------------------------------------------------
    hBox.justifyLines = 'top';
    assert.equal(a.top, hBox.top, 'a.top should be hBox.top (justifyLines top)');
    assert.equal(b.top, a.bottom, 'b.top should be a.bottom (justifyLines top)');
    assert.equal(c.top, b.bottom, 'c.top should be b.bottom (justifyLines top)');
    assert.equal(d.top, c.bottom, 'd.top should be c.bottom (justifyLines top)');
    //---------------------------------------------------------------------------------
    // justifyLines bottom
    //---------------------------------------------------------------------------------
    hBox.justifyLines = 'bottom';
    assert.equal(d.bottom, hBox.bottom, 'd.bottom should be hBox.bottom (justifyLines bottom)');
    assert.equal(c.bottom, d.top, 'c.bottom should be d.top (justifyLines bottom)');
    assert.equal(b.bottom, c.top, 'b.bottom should be c.top (justifyLines bottom)');
    assert.equal(a.bottom, b.top, 'a.bottom should be b.top (justifyLines bottom)');
    //---------------------------------------------------------------------------------
    // justifyLines center
    //---------------------------------------------------------------------------------
    hBox.justifyLines = 'center';
    assert.equal(a.top, hBox.height / 2 - RECT_HEIGHT * 2, 'a.top should be half the height minus half the height of the rectangles');
    assert.equal(b.top, a.bottom, 'b.top should be a.bottom (justifyLines center)');
    assert.equal(c.top, b.bottom, 'c.top should be b.bottom (justifyLines center)');
    assert.equal(d.top, c.bottom, 'd.top should be c.bottom (justifyLines center)');
    //---------------------------------------------------------------------------------
    // justifyLines spaceBetween
    //---------------------------------------------------------------------------------
    hBox.justifyLines = 'spaceBetween';
    assert.ok(LayoutTestUtils.aboutEqual(a.top, hBox.top), 'a.top should be hBox.top (justifyLines spaceBetween)');
    assert.ok(LayoutTestUtils.aboutEqual(d.bottom, hBox.bottom), 'd.bottom should be hBox.bottom (justifyLines spaceBetween)');
    assert.ok(LayoutTestUtils.aboutEqual(b.top - a.bottom, c.top - b.bottom), 'space between a and b should be equal to space between b and c');
    assert.ok(LayoutTestUtils.aboutEqual(c.top - b.bottom, d.top - c.bottom), 'space between b and c should be equal to space between c and d');
    //---------------------------------------------------------------------------------
    // justifyLines spaceAround
    //---------------------------------------------------------------------------------
    hBox.justifyLines = 'spaceAround';
    const totalSpace = hBox.height - 4 * RECT_HEIGHT;
    const sideSpacing = totalSpace / 4 / 2; // Each Node gets half space to the top and bottom
    assert.ok(LayoutTestUtils.aboutEqual(a.top, hBox.top + sideSpacing), 'a.top should be hBox.top + spaceAround');
    assert.ok(LayoutTestUtils.aboutEqual(a.bottom + sideSpacing * 2, b.top), 'a.bottom + sideSpacing * 2 should be b.top');
    assert.ok(LayoutTestUtils.aboutEqual(b.bottom + sideSpacing * 2, c.top), 'b.bottom + sideSpacing * 2 should be c.top');
    assert.ok(LayoutTestUtils.aboutEqual(c.bottom + sideSpacing * 2, d.top), 'c.bottom + sideSpacing * 2 should be d.top');
    assert.ok(LayoutTestUtils.aboutEqual(d.bottom, hBox.bottom - sideSpacing), 'd.bottom should be hBox.bottom - spaceAround');
    //---------------------------------------------------------------------------------
    // justifyLines spaceEvenly
    //---------------------------------------------------------------------------------
    hBox.justifyLines = 'spaceEvenly';
    const spaceBetween = totalSpace / 5; // 4 spaces between 5 nodes
    assert.ok(LayoutTestUtils.aboutEqual(a.top, hBox.top + spaceBetween), 'a.top should be hBox.top + spaceEvenly');
    assert.ok(LayoutTestUtils.aboutEqual(a.bottom + spaceBetween, b.top), 'a.bottom + spaceBetween should be b.top');
    assert.ok(LayoutTestUtils.aboutEqual(b.bottom + spaceBetween, c.top), 'b.bottom + spaceBetween should be c.top');
    assert.ok(LayoutTestUtils.aboutEqual(c.bottom + spaceBetween, d.top), 'c.bottom + spaceBetween should be d.top');
    assert.ok(LayoutTestUtils.aboutEqual(d.bottom, hBox.bottom - spaceBetween), 'd.bottom should be hBox.bottom - spaceEvenly');
    //---------------------------------------------------------------------------------
    // justifyLines null (default to stretch (same as spaceAround))
    //---------------------------------------------------------------------------------
    hBox.justifyLines = null;
    assert.ok(LayoutTestUtils.aboutEqual(a.top, hBox.top + sideSpacing), 'a.top should be hBox.top + spaceAround');
    assert.ok(LayoutTestUtils.aboutEqual(a.bottom + sideSpacing * 2, b.top), 'a.bottom + sideSpacing * 2 should be b.top');
    assert.ok(LayoutTestUtils.aboutEqual(b.bottom + sideSpacing * 2, c.top), 'b.bottom + sideSpacing * 2 should be c.top');
    assert.ok(LayoutTestUtils.aboutEqual(c.bottom + sideSpacing * 2, d.top), 'c.bottom + sideSpacing * 2 should be d.top');
    assert.ok(LayoutTestUtils.aboutEqual(d.bottom, hBox.bottom - sideSpacing), 'd.bottom should be hBox.bottom - spaceAround');
});
QUnit.test('Spacing tests', (assert)=>{
    const [a, b, c, d] = LayoutTestUtils.createRectangles(4);
    const hBox = new HBox({
        children: [
            a,
            b,
            c,
            d
        ],
        spacing: 10
    });
    assert.ok(LayoutTestUtils.aboutEqual(b.left - a.right, 10), 'b.left - a.right should be 10');
    assert.ok(LayoutTestUtils.aboutEqual(c.left - b.right, 10), 'c.left - b.right should be 10');
    assert.ok(LayoutTestUtils.aboutEqual(d.left - c.right, 10), 'd.left - c.right should be 10');
    assert.ok(LayoutTestUtils.aboutEqual(hBox.width, 4 * RECT_WIDTH + 3 * 10), 'width should be sum of children widths plus spacing');
});
QUnit.test('lineSpacing tests', (assert)=>{
    // Line spacing is the spacing between lines of nodes in a wrap layout
    const [a, b, c, d] = LayoutTestUtils.createRectangles(4);
    const hBox = new HBox({
        children: [
            a,
            b,
            c,
            d
        ],
        lineSpacing: 10,
        // so that the contents wrap and we can test lineSpacing
        wrap: true,
        preferredWidth: RECT_WIDTH
    });
    assert.ok(LayoutTestUtils.aboutEqual(a.top, hBox.top), 'a.top should be hBox.top');
    assert.ok(LayoutTestUtils.aboutEqual(b.top - a.bottom, 10), 'b.top - a.bottom should be 10');
    assert.ok(LayoutTestUtils.aboutEqual(c.top - b.bottom, 10), 'c.top - b.bottom should be 10');
    assert.ok(LayoutTestUtils.aboutEqual(d.top - c.bottom, 10), 'd.top - c.bottom should be 10');
    assert.ok(LayoutTestUtils.aboutEqual(hBox.height, 4 * RECT_HEIGHT + 3 * 10), 'height should be sum of children heights plus lineSpacing');
});
QUnit.test('Margins tests', (assert)=>{
    const [a, b, c, d] = LayoutTestUtils.createRectangles(4);
    const hBox = new HBox({
        children: [
            a,
            b,
            c,
            d
        ]
    });
    //---------------------------------------------------------------------------------
    // margin tests
    //---------------------------------------------------------------------------------
    hBox.margin = 10;
    assert.ok(LayoutTestUtils.aboutEqual(a.left, hBox.left + 10), 'a.left should be hBox.left + 10');
    assert.ok(LayoutTestUtils.aboutEqual(b.left, a.right + 20), 'b.left should be a.right + 10');
    assert.ok(LayoutTestUtils.aboutEqual(c.left, b.right + 20), 'c.left should be b.right + 10');
    assert.ok(LayoutTestUtils.aboutEqual(d.left, c.right + 20), 'd.left should be c.right + 10');
    assert.ok(LayoutTestUtils.aboutEqual(d.right, hBox.right - 10), 'd.right should be hBox.right - 10');
    assert.ok(LayoutTestUtils.aboutEqual(a.top, hBox.top + 10), 'a.top should be hBox.top + 10');
    assert.ok(LayoutTestUtils.aboutEqual(b.top, hBox.top + 10), 'b.top should be hBox.top + 10');
    assert.ok(LayoutTestUtils.aboutEqual(c.top, hBox.top + 10), 'c.top should be hBox.top + 10');
    assert.ok(LayoutTestUtils.aboutEqual(d.top, hBox.top + 10), 'd.top should be hBox.top + 10');
    //---------------------------------------------------------------------------------
    // left margin tests
    //---------------------------------------------------------------------------------
    hBox.margin = 0;
    hBox.leftMargin = 10;
    assert.ok(LayoutTestUtils.aboutEqual(a.left, hBox.left + 10), 'a.left should be hBox.left');
    assert.ok(LayoutTestUtils.aboutEqual(b.left, a.right + 10), 'b.left should be a.right + 10');
    assert.ok(LayoutTestUtils.aboutEqual(c.left, b.right + 10), 'c.left should be b.right + 10');
    assert.ok(LayoutTestUtils.aboutEqual(d.left, c.right + 10), 'd.left should be c.right + 10');
    assert.ok(LayoutTestUtils.aboutEqual(d.right, hBox.right), 'd.right should be hBox.right');
});
QUnit.test('Per-cell layout options', (assert)=>{
    const [a, b, c, d] = LayoutTestUtils.createRectangles(4);
    const hBox = new HBox({
        children: [
            a,
            b,
            c,
            d
        ]
    });
    //---------------------------------------------------------------------------------
    // per-cel margins
    //---------------------------------------------------------------------------------
    const margin = 10;
    a.layoutOptions = {
        topMargin: margin
    };
    d.layoutOptions = {
        leftMargin: margin
    };
    assert.ok(LayoutTestUtils.aboutEqual(a.top, hBox.top + margin), 'a.top should be hBox.top + margin');
    assert.ok(LayoutTestUtils.aboutEqual(b.top, hBox.top + margin / 2), 'hBox dimensions grow but b remains centered by default');
    assert.ok(LayoutTestUtils.aboutEqual(c.top, hBox.top + margin / 2), 'hBox dimensions grow but c remains centered by default');
    assert.ok(LayoutTestUtils.aboutEqual(d.left, c.right + margin), 'd.left should be c.left + margin');
    assert.ok(LayoutTestUtils.aboutEqual(d.right, hBox.right), 'd.right should be hBox.right');
    //---------------------------------------------------------------------------------
    // per-cel alignment
    //---------------------------------------------------------------------------------
    hBox.preferredHeight = RECT_HEIGHT * 2; // extend height of the container
    a.layoutOptions = {
        align: 'top'
    };
    b.layoutOptions = {
        align: 'bottom'
    };
    c.layoutOptions = {
        align: 'center'
    };
    d.layoutOptions = {};
    assert.ok(LayoutTestUtils.aboutEqual(a.top, hBox.top), 'a.top should be hBox.top');
    assert.ok(LayoutTestUtils.aboutEqual(b.bottom, hBox.bottom), 'b.bottom should be hBox.bottom');
    assert.ok(LayoutTestUtils.aboutEqual(c.centerY, hBox.centerY), 'c.centerY should be hBox.centerY');
    assert.ok(LayoutTestUtils.aboutEqual(d.centerY, hBox.centerY), 'd.centerY should be hBox.centerY');
    //---------------------------------------------------------------------------------
    // cells override the container
    //---------------------------------------------------------------------------------
    hBox.align = 'top';
    a.layoutOptions = {
        align: 'bottom'
    };
    b.layoutOptions = {
        align: 'center'
    };
    c.layoutOptions = {
        align: 'bottom'
    };
    d.layoutOptions = {};
    assert.ok(LayoutTestUtils.aboutEqual(a.bottom, hBox.bottom), 'a.bottom should be hBox.bottom');
    assert.ok(LayoutTestUtils.aboutEqual(b.centerY, hBox.centerY), 'b.centerY should be hBox.centerY');
    assert.ok(LayoutTestUtils.aboutEqual(c.bottom, hBox.bottom), 'c.bottom should be hBox.bottom');
    assert.ok(LayoutTestUtils.aboutEqual(d.top, hBox.top), 'd.top should be hBox.top');
});
QUnit.test('Separators', (assert)=>{
    const margin = 5;
    const [a, b, c, d] = LayoutTestUtils.createRectangles(4);
    const hBox = new HBox({
        margin: margin
    });
    const verifySeparatorLayout = (separatorWidth)=>{
        assert.ok(LayoutTestUtils.aboutEqual(b.left, a.right + separatorWidth + margin * 4), 'b.left should be a.right + separatorWidth + margin * 4 (each side of rectangles + each side of separator)');
        assert.ok(LayoutTestUtils.aboutEqual(c.left, b.right + separatorWidth + margin * 4), 'c.left should be b.right + separatorWidth + margin * 4');
        assert.ok(LayoutTestUtils.aboutEqual(d.left, c.right + separatorWidth + margin * 4), 'd.left should be c.right + separatorWidth + margin * 4');
    };
    const testSeparator = new VSeparator();
    //---------------------------------------------------------------------------------
    // basic tests
    //---------------------------------------------------------------------------------
    hBox.children = [
        a,
        new VSeparator(),
        b,
        new VSeparator(),
        c,
        new VSeparator(),
        d
    ];
    verifySeparatorLayout(testSeparator.width);
    //---------------------------------------------------------------------------------
    // duplicate separators are removed
    //---------------------------------------------------------------------------------
    hBox.children = [
        a,
        new VSeparator(),
        new VSeparator(),
        b,
        new VSeparator(),
        c,
        new VSeparator(),
        new VSeparator(),
        d
    ];
    verifySeparatorLayout(testSeparator.width);
    //---------------------------------------------------------------------------------
    // separators at the ends are removed
    //---------------------------------------------------------------------------------
    hBox.children = [
        new VSeparator(),
        a,
        new VSeparator(),
        b,
        new VSeparator(),
        c,
        new VSeparator(),
        d,
        new VSeparator()
    ];
    verifySeparatorLayout(testSeparator.width);
    assert.ok(LayoutTestUtils.aboutEqual(a.left, hBox.left + margin), 'a.left should be hBox.left + margin (separator removed)');
    assert.ok(LayoutTestUtils.aboutEqual(d.right, hBox.right - margin), 'd.right should be hBox.right - margin (separator removed)');
    //---------------------------------------------------------------------------------
    // custom separators
    //---------------------------------------------------------------------------------
    const createCustomSeparator = ()=>new Rectangle(0, 0, 10, 10, {
            layoutOptions: {
                isSeparator: true
            }
        });
    const testCustomSeparator = createCustomSeparator();
    // basic
    hBox.children = [
        a,
        createCustomSeparator(),
        b,
        createCustomSeparator(),
        c,
        createCustomSeparator(),
        d
    ];
    verifySeparatorLayout(testCustomSeparator.width);
    // duplicates removed
    hBox.children = [
        a,
        createCustomSeparator(),
        createCustomSeparator(),
        b,
        createCustomSeparator(),
        c,
        createCustomSeparator(),
        createCustomSeparator(),
        d
    ];
    verifySeparatorLayout(testCustomSeparator.width);
    // separators at the ends are removed
    hBox.children = [
        createCustomSeparator(),
        a,
        createCustomSeparator(),
        b,
        createCustomSeparator(),
        c,
        createCustomSeparator(),
        d,
        createCustomSeparator()
    ];
    verifySeparatorLayout(testCustomSeparator.width);
    assert.ok(LayoutTestUtils.aboutEqual(a.left, hBox.left + margin), 'a.left should be hBox.left + margin (separator removed)');
    assert.ok(LayoutTestUtils.aboutEqual(d.right, hBox.right - margin), 'd.right should be hBox.right - margin (separator removed)');
});

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvbGF5b3V0L25vZGVzL0Zsb3dCb3hUZXN0cy50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAyNCwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbi8qKlxuICogVGVzdHMgZm9yIEZsb3dCb3guIENvdmVyaW5nIGl0cyB2YXJpb3VzIGZlYXR1cmVzIHN1Y2ggYXM6XG4gKlxuICogIC0gYmFzaWMgbGF5b3V0XG4gKiAgLSByZXNpemluZyBvZiBjZWxsc1xuICogIC0gZ3JvdyBmb3IgY2VsbHNcbiAqICAtIHN0cmV0Y2ggZm9yIGNlbGxzXG4gKiAgLSBjb25zdHJhaW5pbmcgY2VsbCBzaXplc1xuICogIC0ganVzdGlmeVxuICogIC0gd3JhcFxuICogIC0gYWxpZ25cbiAqICAtIGp1c3RpZnlMaW5lc1xuICogIC0gc3BhY2luZ1xuICogIC0gbGluZVNwYWNpbmdcbiAqICAtIG1hcmdpbnNcbiAqICAtIHBlci1jZWxsIGxheW91dCBvcHRpb25zXG4gKiAgLSBzZXBhcmF0b3JzXG4gKlxuICogQGF1dGhvciBKZXNzZSBHcmVlbmJlcmcgKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXG4gKi9cblxuaW1wb3J0IFJlY3RhbmdsZSBmcm9tICcuLi8uLi9ub2Rlcy9SZWN0YW5nbGUuanMnO1xuaW1wb3J0IExheW91dFRlc3RVdGlscyBmcm9tICcuLi9MYXlvdXRUZXN0VXRpbHMuanMnO1xuaW1wb3J0IEhCb3ggZnJvbSAnLi9IQm94LmpzJztcbmltcG9ydCBWQm94IGZyb20gJy4vVkJveC5qcyc7XG5pbXBvcnQgVlNlcGFyYXRvciBmcm9tICcuL1ZTZXBhcmF0b3IuanMnO1xuXG5jb25zdCBSRUNUX1dJRFRIID0gTGF5b3V0VGVzdFV0aWxzLlJFQ1RfV0lEVEg7XG5jb25zdCBSRUNUX0hFSUdIVCA9IExheW91dFRlc3RVdGlscy5SRUNUX0hFSUdIVDtcblxuUVVuaXQubW9kdWxlKCAnRmxvd0JveCcgKTtcblxuUVVuaXQudGVzdCggJ0Jhc2ljIEhCb3gvVkJveCB0ZXN0cycsIGFzc2VydCA9PiB7XG5cbiAgY29uc3QgWyBhLCBiIF0gPSBMYXlvdXRUZXN0VXRpbHMuY3JlYXRlUmVjdGFuZ2xlcyggMiApO1xuXG4gIGNvbnN0IGhCb3ggPSBuZXcgSEJveCggeyBjaGlsZHJlbjogWyBhLCBiIF0gfSApO1xuICBoQm94LnZhbGlkYXRlQm91bmRzKCk7XG5cbiAgYXNzZXJ0LmVxdWFsKCBhLnJpZ2h0LCBiLmxlZnQsICdhLnJpZ2h0ID09PSBiLmxlZnQgZm9yIGhCb3gnICk7XG4gIGFzc2VydC5lcXVhbCggYi5sZWZ0LCBhLndpZHRoLCAnYi5sZWZ0ID09PSBhLndpZHRoIGZvciBoQm94JyApO1xuXG4gIC8vIHRyYW5zbGF0ZSBib3ggYW5kIG1ha2Ugc3VyZSBsYXlvdXQgaXMgY29ycmVjdFxuICBoQm94LmxlZnQgPSAyMDA7XG4gIGhCb3gudmFsaWRhdGVCb3VuZHMoKTtcbiAgYXNzZXJ0LmVxdWFsKCBiLmdsb2JhbEJvdW5kcy5sZWZ0LCAyMDAgKyBSRUNUX1dJRFRILCAnYi5nbG9iYWxCb3VuZHMubGVmdCA9PT0gMjAwICsgUkVDVF9XSURUSCcgKTtcbiAgaEJveC5kaXNwb3NlKCk7XG5cbiAgY29uc3QgdkJveCA9IG5ldyBWQm94KCB7IGNoaWxkcmVuOiBbIGEsIGIgXSB9ICk7XG4gIHZCb3gudmFsaWRhdGVCb3VuZHMoKTtcblxuICBhc3NlcnQuZXF1YWwoIGEuYm90dG9tLCBiLnRvcCwgJ2EuYm90dG9tID09PSBiLnRvcCBmb3IgdkJveCcgKTtcbiAgYXNzZXJ0LmVxdWFsKCBiLnRvcCwgYS5oZWlnaHQsICdiLnRvcCA9PT0gYS5oZWlnaHQgZm9yIHZCb3gnICk7XG5cbiAgLy8gdHJhbnNsYXRlIGJveCBhbmQgbWFrZSBzdXJlIGxheW91dCBpcyBjb3JyZWN0XG4gIHZCb3gudG9wID0gMjAwO1xuICB2Qm94LnZhbGlkYXRlQm91bmRzKCk7XG4gIGFzc2VydC5lcXVhbCggYi5nbG9iYWxCb3VuZHMudG9wLCAyMDAgKyBSRUNUX0hFSUdIVCwgJ2IuZ2xvYmFsQm91bmRzLnRvcCA9PT0gMjAwICsgUkVDVF9IRUlHSFQnICk7XG4gIHZCb3guZGlzcG9zZSgpO1xufSApO1xuXG5RVW5pdC50ZXN0KCAnRmxvd0JveCBjZWxsIHJlc2l6aW5nJywgYXNzZXJ0ID0+IHtcblxuICBsZXQgWyBhLCBiIF0gPSBMYXlvdXRUZXN0VXRpbHMuY3JlYXRlUmVjdGFuZ2xlcyggMiApO1xuICBjb25zdCBoQm94ID0gbmV3IEhCb3goIHsgY2hpbGRyZW46IFsgYSwgYiBdIH0gKTtcbiAgaEJveC52YWxpZGF0ZUJvdW5kcygpO1xuXG4gIC8vIHJlc2l6ZSBhIGFuZCBtYWtlIHN1cmUgbGF5b3V0IGlzIGNvcnJlY3RcbiAgYS5yZWN0V2lkdGggPSBSRUNUX1dJRFRIICogMjtcbiAgaEJveC52YWxpZGF0ZUJvdW5kcygpO1xuICBhc3NlcnQuZXF1YWwoIGEucmlnaHQsIGIubGVmdCwgJ2EucmlnaHQgPT09IGIubGVmdCBmb3IgaEJveCBhZnRlciByZXNpemUnICk7XG4gIGFzc2VydC5lcXVhbCggYi5sZWZ0LCBhLndpZHRoLCAnYi5sZWZ0ID09PSBhLndpZHRoIGZvciBoQm94IGFmdGVyIHJlc2l6ZScgKTtcbiAgYXNzZXJ0LmVxdWFsKCBiLmxlZnQsIFJFQ1RfV0lEVEggKiAyLCAnYi5sZWZ0ID09PSBSRUNUX1dJRFRIICogMiBmb3IgaEJveCBhZnRlciByZXNpemUnICk7XG4gIGhCb3guZGlzcG9zZSgpO1xuXG4gIGNvbnN0IHZCb3ggPSBuZXcgVkJveCggeyBjaGlsZHJlbjogWyBhLCBiIF0gfSApO1xuICB2Qm94LnZhbGlkYXRlQm91bmRzKCk7XG5cbiAgLy8gcmVzaXplIGEgYW5kIG1ha2Ugc3VyZSBsYXlvdXQgaXMgY29ycmVjdFxuICBhLnJlY3RIZWlnaHQgPSBSRUNUX0hFSUdIVCAqIDI7XG4gIHZCb3gudmFsaWRhdGVCb3VuZHMoKTtcbiAgYXNzZXJ0LmVxdWFsKCBhLmJvdHRvbSwgYi50b3AsICdhLmJvdHRvbSA9PT0gYi50b3AgZm9yIHZCb3ggYWZ0ZXIgcmVzaXplJyApO1xuICBhc3NlcnQuZXF1YWwoIGIudG9wLCBhLmhlaWdodCwgJ2IudG9wID09PSBhLmhlaWdodCBmb3IgdkJveCBhZnRlciByZXNpemUnICk7XG4gIGFzc2VydC5lcXVhbCggYi50b3AsIFJFQ1RfSEVJR0hUICogMiwgJ2IudG9wID09PSBSRUNUX1dJRFRIICogMiBmb3IgdkJveCBhZnRlciByZXNpemUnICk7XG4gIHZCb3guZGlzcG9zZSgpO1xuXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIC8vIFRlc3RzIHRoYXQgZGlzYWJsZSByZXNpemluZ1xuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICBbIGEsIGIgXSA9IExheW91dFRlc3RVdGlscy5jcmVhdGVSZWN0YW5nbGVzKCAyICk7XG4gIGNvbnN0IGhCb3hOb1Jlc2l6ZSA9IG5ldyBIQm94KCB7IGNoaWxkcmVuOiBbIGEsIGIgXSwgcmVzaXplOiBmYWxzZSB9ICk7XG5cbiAgLy8gcmVzaXplIGEgYW5kIG1ha2Ugc3VyZSBsYXlvdXQgaXMgY29ycmVjdCAtIGl0IHNob3VsZCBub3QgYWRqdXN0XG4gIGEucmVjdFdpZHRoID0gUkVDVF9XSURUSCAqIDI7XG4gIGhCb3hOb1Jlc2l6ZS52YWxpZGF0ZUJvdW5kcygpO1xuICBhc3NlcnQuZXF1YWwoIGEucmlnaHQsIFJFQ1RfV0lEVEggKiAyLCAnYS5yaWdodCA9PT0gUkVDVF9XSURUSCAqIDIgZm9yIGhCb3hOb1Jlc2l6ZSBhZnRlciByZXNpemUnICk7XG4gIGFzc2VydC5lcXVhbCggYi5sZWZ0LCBSRUNUX1dJRFRILCAnYi5sZWZ0ID09PSBSRUNUX1dJRFRIIGZvciBoQm94IGFmdGVyIHJlc2l6ZScgKTtcbiAgaEJveE5vUmVzaXplLmRpc3Bvc2UoKTtcblxuICBjb25zdCB2Qm94Tm9SZXNpemUgPSBuZXcgVkJveCggeyBjaGlsZHJlbjogWyBhLCBiIF0sIHJlc2l6ZTogZmFsc2UgfSApO1xuXG4gIC8vIHJlc2l6ZSBhIGFuZCBtYWtlIHN1cmUgbGF5b3V0IGlzIGNvcnJlY3QgLSBpdCBzaG91bGQgbm90IGFkanVzdFxuICBhLnJlY3RIZWlnaHQgPSBSRUNUX0hFSUdIVCAqIDI7XG4gIHZCb3hOb1Jlc2l6ZS52YWxpZGF0ZUJvdW5kcygpO1xuICBhc3NlcnQuZXF1YWwoIGEuYm90dG9tLCBSRUNUX0hFSUdIVCAqIDIsICdhLmJvdHRvbSA9PT0gUkVDVF9IRUlHSFQgKiAyIGZvciB2Qm94Tm9SZXNpemUgYWZ0ZXIgcmVzaXplJyApO1xuICBhc3NlcnQuZXF1YWwoIGIudG9wLCBSRUNUX0hFSUdIVCwgJ2IudG9wID09PSBSRUNUX0hFSUdIVCBmb3IgdkJveCBhZnRlciByZXNpemUnICk7XG4gIHZCb3hOb1Jlc2l6ZS5kaXNwb3NlKCk7XG59ICk7XG5cblFVbml0LnRlc3QoICdJbnZpc2libGUgY2hpbGRyZW4nLCBhc3NlcnQgPT4ge1xuICBjb25zdCBbIGMsIGQsIGUgXSA9IExheW91dFRlc3RVdGlscy5jcmVhdGVSZWN0YW5nbGVzKCAzICk7XG4gIGQudmlzaWJsZSA9IGZhbHNlO1xuXG4gIC8vIEludmlzaWJsZSBOb2RlcyBzaG91bGQgbm90IGJlIGluY2x1ZGVkIGluIGxheW91dCBib3VuZHMgYnkgZGVmYXVsdC5cbiAgY29uc3QgaEJveEludmlzaWJsZSA9IG5ldyBIQm94KCB7IGNoaWxkcmVuOiBbIGMsIGQsIGUgXSB9ICk7XG5cbiAgYXNzZXJ0LmVxdWFsKCBoQm94SW52aXNpYmxlLndpZHRoLCBSRUNUX1dJRFRIICogMiwgJ3dpZHRoIHNob3VsZCBub3QgaW5jbHVkZSBpbnZpc2libGUgbm9kZScgKTtcbiAgYXNzZXJ0LmVxdWFsKCBjLnJpZ2h0LCBlLmxlZnQsICdjLnJpZ2h0ID09PSBlLmxlZnQgZm9yIG1pZGRsZSBOb2RlIGludmlzaWJsZSBpbiBIQm94JyApO1xuXG4gIC8vIEludmlzaWJsZSBOb2RlcyBjYW4gYmUgaW5jbHVkZWQgaW4gbGF5b3V0IGJvdW5kcyBpZiBzcGVjaWZpZWQuXG4gIGhCb3hJbnZpc2libGUuc2V0RXhjbHVkZUludmlzaWJsZUNoaWxkcmVuRnJvbUJvdW5kcyggZmFsc2UgKTtcbiAgYXNzZXJ0LmVxdWFsKCBoQm94SW52aXNpYmxlLndpZHRoLCBSRUNUX1dJRFRIICogMywgJ3dpZHRoIHNob3VsZCBpbmNsdWRlIGludmlzaWJsZSBub2RlJyApO1xuICBhc3NlcnQubm90RXF1YWwoIGMucmlnaHQsIGUubGVmdCwgJ2MucmlnaHQgIT09IGUubGVmdCB3aGVuIGludmlzaWJsZSBub2RlIGlzIGluY2x1ZGVkIGluIEhCb3ggYm91bmRzJyApO1xuICBhc3NlcnQuZXF1YWwoIGMucmlnaHQsIGQubGVmdCwgJ2MucmlnaHQgPT09IGQubGVmdCB3aGVuIGludmlzaWJsZSBub2RlIGlzIGluY2x1ZGVkIGluIEhCb3ggYm91bmRzJyApO1xuICBhc3NlcnQuZXF1YWwoIGQucmlnaHQsIGUubGVmdCwgJ2QucmlnaHQgPT09IGUubGVmdCB3aGVuIGludmlzaWJsZSBub2RlIGlzIGluY2x1ZGVkIGluIEhCb3ggYm91bmRzJyApO1xuICBoQm94SW52aXNpYmxlLmRpc3Bvc2UoKTtcbn0gKTtcblxuUVVuaXQudGVzdCggJ0NoaWxkcmVuIHRoYXQgZ3Jvdywgc3RyZXRjaCwgYW5kIGhhdmUgc2l6ZSBjb25zdHJhaW50cycsIGFzc2VydCA9PiB7XG4gIGNvbnN0IFsgYSwgYiwgYyBdID0gTGF5b3V0VGVzdFV0aWxzLmNyZWF0ZVJlY3RhbmdsZXMoIDMsIGluZGV4ID0+IHtcblxuICAgIC8vIE1ha2UgdGhlc2UgcmVjdGFuZ2xlcyBzaXphYmxlIHNvIHRoYXQgdGhleSBjYW4gZ3Jvdy9zdHJldGNoIGZvciB0aGVzZSB0ZXN0c1xuICAgIHJldHVybiB7XG4gICAgICBzaXphYmxlOiB0cnVlLFxuICAgICAgbG9jYWxNaW5pbXVtV2lkdGg6IFJFQ1RfV0lEVEgsXG4gICAgICBsb2NhbE1pbmltdW1IZWlnaHQ6IFJFQ1RfSEVJR0hUXG4gICAgfTtcbiAgfSApO1xuXG4gIC8vIGluaXRpYWwgdGVzdFxuICBjb25zdCBoQm94ID0gbmV3IEhCb3goIHsgY2hpbGRyZW46IFsgYSwgYiwgYyBdIH0gKTtcbiAgYXNzZXJ0LmVxdWFsKCBoQm94LndpZHRoLCBSRUNUX1dJRFRIICogMywgJ3dpZHRoIHNob3VsZCBiZSBzdW0gb2YgY2hpbGRyZW4gd2lkdGhzJyApO1xuXG4gIC8vIE1ha2UgaXQgbGFyZ2VyIHRoYW4gaXRzIGNvbnRlbnRzIHRvIHRlc3RcbiAgaEJveC5wcmVmZXJyZWRXaWR0aCA9IFJFQ1RfV0lEVEggKiA2O1xuICBhc3NlcnQuZXF1YWwoIGhCb3gud2lkdGgsIFJFQ1RfV0lEVEggKiA2LCAnd2lkdGggc2hvdWxkIHRha2UgdXAgcHJlZmVycmVkIHdpZHRoJyApO1xuICBhc3NlcnQuZXF1YWwoIGIud2lkdGgsIFJFQ1RfV0lEVEgsICdiLndpZHRoIHNob3VsZCBiZSBSRUNUX1dJRFRIJyApO1xuXG4gIC8vIE1ha2UgYiBncm93IHRvIHRha2UgdXAgYWxsIHJlbWFpbmluZyBzcGFjZVxuICBiLmxheW91dE9wdGlvbnMgPSB7IGdyb3c6IDEgfTtcbiAgYXNzZXJ0LmVxdWFsKCBiLndpZHRoLCBSRUNUX1dJRFRIICogNCwgJ2Iud2lkdGggc2hvdWxkIGJlIFJFQ1RfV0lEVEggKiA0JyApO1xuXG4gIC8vIE1ha2UgYSBncm93IGFuZCBleHRyYSBzcGFjZSBzaG91bGQgYmUgc2hhcmVkIGJldHdlZW4gYSBhbmQgYlxuICBhLmxheW91dE9wdGlvbnMgPSB7IGdyb3c6IDEgfTtcbiAgYXNzZXJ0LmVxdWFsKCBhLndpZHRoLCBSRUNUX1dJRFRIICogMi41LCAnYS53aWR0aCBzaG91bGQgYmUgUkVDVF9XSURUSCAqIDInICk7XG4gIGFzc2VydC5lcXVhbCggYi53aWR0aCwgUkVDVF9XSURUSCAqIDIuNSwgJ2Iud2lkdGggc2hvdWxkIGJlIFJFQ1RfV0lEVEggKiA0JyApO1xuICBhc3NlcnQuZXF1YWwoIGMud2lkdGgsIFJFQ1RfV0lEVEgsICdjLndpZHRoIHNob3VsZCBiZSBSRUNUX1dJRFRIJyApO1xuXG4gIC8vIG1ha2UgYyBncm93IGFuZCBleHRyYSBzcGFjZSBzaG91bGQgYmUgc2hhcmVkIGJldHdlZW4gYWxsIHRocmVlXG4gIGMubGF5b3V0T3B0aW9ucyA9IHsgZ3JvdzogMSB9O1xuICBhc3NlcnQuZXF1YWwoIGEud2lkdGgsIFJFQ1RfV0lEVEggKiAyLCAnYS53aWR0aCBzaG91bGQgYmUgUkVDVF9XSURUSCAqIDInICk7XG4gIGFzc2VydC5lcXVhbCggYi53aWR0aCwgUkVDVF9XSURUSCAqIDIsICdiLndpZHRoIHNob3VsZCBiZSBSRUNUX1dJRFRIICogMicgKTtcbiAgYXNzZXJ0LmVxdWFsKCBjLndpZHRoLCBSRUNUX1dJRFRIICogMiwgJ2Mud2lkdGggc2hvdWxkIGJlIFJFQ1RfV0lEVEggKiAyJyApO1xuXG4gIC8vIERvdWJsZSBjJ3MgZ3JvdyB2YWx1ZSBhbmQgaXQgc2hvdWxkIHRha2UgdXAgcHJvcG9ydGlvbmFsbHkgbW9yZSBzcGFjZSAtIGVhY2ggc2hvdWxkIHRhayB1cCB0aGUgbWluaW11bSB3aWR0aFxuICAvLyBwbHVzIGl0cyBwcm9wb3J0aW9uIG9mIHRlaCByZW1haW5pbmcgc3BhY2UgYXMgc3BlY2lmaWVkIGJ5IGdyb3cuXG4gIGMubGF5b3V0T3B0aW9ucyA9IHsgZ3JvdzogMiB9O1xuXG4gIC8vIGdyb3cgbGV0cyBub2RlcyB0YWtlIHVwIHRoZSByZW1haW5pbmcgRVhUUkEgc3BhY2UsIHNvIHRoZSBkaXN0cmlidXRpb24gc2hvdWxkIGJlOlxuICBjb25zdCBleHRyYVNwYWNlID0gUkVDVF9XSURUSCAqIDYgLSBSRUNUX1dJRFRIICogMzsgLy8gcHJlZmVycmVkIHdpZHRoIC0gc3VtIG9mIG1pbmltdW0gd2lkdGhzXG4gIGNvbnN0IGV4cGVjdGVkQVdpZHRoID0gUkVDVF9XSURUSCArIGV4dHJhU3BhY2UgLyA0OyAvLyBkaXN0cmlidXRpb24gb2YgZ3JvdyB2YWx1ZXNcbiAgY29uc3QgZXhwZWN0ZWRCV2lkdGggPSBSRUNUX1dJRFRIICsgZXh0cmFTcGFjZSAvIDQ7XG4gIGNvbnN0IGV4cGVjdGVkQ1dpZHRoID0gUkVDVF9XSURUSCArIGV4dHJhU3BhY2UgLyAyO1xuXG4gIGFzc2VydC5lcXVhbCggYS53aWR0aCwgZXhwZWN0ZWRBV2lkdGgsICdhLndpZHRoIHNob3VsZCBiZSBSRUNUX1dJRFRIJyApO1xuICBhc3NlcnQuZXF1YWwoIGIud2lkdGgsIGV4cGVjdGVkQldpZHRoLCAnYi53aWR0aCBzaG91bGQgYmUgUkVDVF9XSURUSCcgKTtcbiAgYXNzZXJ0LmVxdWFsKCBjLndpZHRoLCBleHBlY3RlZENXaWR0aCwgJ2Mud2lkdGggc2hvdWxkIGJlIFJFQ1RfV0lEVEgnICk7XG5cbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgLy8gc3RyZXRjaFxuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICBoQm94LnByZWZlcnJlZEhlaWdodCA9IFJFQ1RfSEVJR0hUICogMzsgLy8gZXh0ZW5kIGhlaWdodCBvZiB0aGUgY29udGFpbmVyXG4gIGFzc2VydC5lcXVhbCggYS5oZWlnaHQsIFJFQ1RfSEVJR0hULCAnYS5oZWlnaHQgc2hvdWxkIGJlIFJFQ1RfSEVJR0hUIGJlZm9yZSBzdHJldGNoJyApO1xuICBhLmxheW91dE9wdGlvbnMgPSB7IHN0cmV0Y2g6IHRydWUgfTtcbiAgYXNzZXJ0LmVxdWFsKCBhLmhlaWdodCwgUkVDVF9IRUlHSFQgKiAzLCAnYS5oZWlnaHQgc2hvdWxkIGJlIFJFQ1RfSEVJR0hUICogMyBhZnRlciBzdHJldGNoJyApO1xuXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIC8vIHNpemUgY29uc3RyYWludHNcbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgYS5sYXlvdXRPcHRpb25zID0geyBzdHJldGNoOiBmYWxzZSwgZ3JvdzogMSwgbWF4Q29udGVudFdpZHRoOiBSRUNUX1dJRFRILCBtYXhDb250ZW50SGVpZ2h0OiBSRUNUX0hFSUdIVCB9O1xuICBiLmxheW91dE9wdGlvbnMgPSB7IHN0cmV0Y2g6IHRydWUsIGdyb3c6IDEgfTtcbiAgYy5sYXlvdXRPcHRpb25zID0geyBzdHJldGNoOiBmYWxzZSwgZ3JvdzogMSB9O1xuXG4gIGhCb3gucHJlZmVycmVkV2lkdGggPSBSRUNUX1dJRFRIICogMTA7XG4gIGhCb3gucHJlZmVycmVkSGVpZ2h0ID0gUkVDVF9IRUlHSFQgKiAxMDtcblxuICBjb25zdCByZW1haW5pbmdXaWR0aCA9IFJFQ1RfV0lEVEggKiAxMCAtIFJFQ1RfV0lEVEg7IC8vIHRoZSBwcmVmZXJyZWQgd2lkdGggbWludXMgdGhlIGNvbnN0cmFpbmVkIHdpZHRoIG9mIHJlY3QgYVxuXG4gIGFzc2VydC5lcXVhbCggYS53aWR0aCwgUkVDVF9XSURUSCwgJ2Eud2lkdGggc2hvdWxkIGJlIFJFQ1RfV0lEVEggYmVjYXVzZSBvZiBtYXhDb250ZW50V2lkdGgsIGV2ZW4gdGhvdWdoIGl0IGdyb3dzJyApO1xuICBhc3NlcnQuZXF1YWwoIGEuaGVpZ2h0LCBSRUNUX0hFSUdIVCwgJ2EuaGVpZ2h0IHNob3VsZCBiZSBSRUNUX0hFSUdIVCBiZWNhdXNlIG9mIG1heENvbnRlbnRIZWlnaHQsIGV2ZW4gdGhvdWdoIGl0IHN0cmV0Y2hlcycgKTtcblxuICBhc3NlcnQuZXF1YWwoIGIud2lkdGgsIHJlbWFpbmluZ1dpZHRoIC8gMiwgJ2Iud2lkdGggc2hvdWxkIGJlIGhhbGYgb2YgdGhlIHJlbWFpbmluZyB3aWR0aCcgKTtcbiAgYXNzZXJ0LmVxdWFsKCBiLmhlaWdodCwgUkVDVF9IRUlHSFQgKiAxMCwgJ2IuaGVpZ2h0IHNob3VsZCBiZSBSRUNUX0hFSUdIVCAqIDEwIGJlY2F1c2UgaXQgc3RyZXRjaGVzJyApO1xuXG4gIGFzc2VydC5lcXVhbCggYy53aWR0aCwgcmVtYWluaW5nV2lkdGggLyAyLCAnYy53aWR0aCBzaG91bGQgYmUgaGFsZiBvZiB0aGUgcmVtYWluaW5nIHdpZHRoJyApO1xuICBhc3NlcnQuZXF1YWwoIGMuaGVpZ2h0LCBSRUNUX0hFSUdIVCwgJ2MuaGVpZ2h0IHNob3VsZCBiZSBSRUNUX0hFSUdIVCBiZWNhdXNlIGl0IGRvZXNudCBzdHJldGNoJyApO1xuXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIC8vIHNpemUgY29uc3RyYWludHMgb24gdGhlIGNvbnRhaW5lclxuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICBjb25zdCBbIGQsIGUgXSA9IExheW91dFRlc3RVdGlscy5jcmVhdGVSZWN0YW5nbGVzKCAzICk7XG4gIGNvbnN0IFsgZiwgZyBdID0gTGF5b3V0VGVzdFV0aWxzLmNyZWF0ZVJlY3RhbmdsZXMoIDIgKTtcblxuICBjb25zdCBoQm94V2l0aENvbnN0cmFpbnQgPSBuZXcgSEJveCgge1xuICAgIGxheW91dE9wdGlvbnM6IHtcbiAgICAgIG1pbkNvbnRlbnRXaWR0aDogUkVDVF9XSURUSCAqIDRcbiAgICB9LFxuICAgIGNoaWxkcmVuOiBbIGQsIGUgXVxuICB9ICk7XG5cbiAgY29uc3QgdkJveFdpdGhDb25zdHJhaW50ID0gbmV3IFZCb3goIHtcbiAgICBsYXlvdXRPcHRpb25zOiB7XG4gICAgICBtaW5Db250ZW50V2lkdGg6IFJFQ1RfV0lEVEggKiA0XG4gICAgfSxcbiAgICBjaGlsZHJlbjogWyBmLCBnIF1cbiAgfSApO1xuXG4gIGNvbnN0IGNvbWJpbmVkQm94ID0gbmV3IEhCb3goIHtcbiAgICBjaGlsZHJlbjogWyBoQm94V2l0aENvbnN0cmFpbnQsIHZCb3hXaXRoQ29uc3RyYWludCBdXG4gIH0gKTtcblxuICBhc3NlcnQuZXF1YWwoIGNvbWJpbmVkQm94LndpZHRoLCBSRUNUX1dJRFRIICogOCwgJ3dpZHRoIHNob3VsZCBiZSBzdW0gb2YgY2hpbGRyZW4gbWluQ29udGVudFdpZHRocyAoYXBwbGllZCB0byBhbGwgY2VsbHMpJyApO1xufSApO1xuXG5RVW5pdC50ZXN0KCAnSnVzdGlmeSB0ZXN0cycsIGFzc2VydCA9PiB7XG4gIGNvbnN0IFsgYSwgYiwgYywgZCBdID0gTGF5b3V0VGVzdFV0aWxzLmNyZWF0ZVJlY3RhbmdsZXMoIDQgKTtcblxuICBjb25zdCBoQm94ID0gbmV3IEhCb3goIHsgY2hpbGRyZW46IFsgYSwgYiwgYywgZCBdIH0gKTtcbiAgYXNzZXJ0LmVxdWFsKCBoQm94LndpZHRoLCA0ICogUkVDVF9XSURUSCwgJ3dpZHRoIHNob3VsZCBiZSBzdW0gb2YgY2hpbGRyZW4gd2lkdGhzJyApO1xuXG4gIC8vIERvdWJsZSB0aGUgcHJlZmVycmVkIHdpZHRoIG9mIHRoZSBjb250YWluZXIgdG8gcGxheSB3aXRoIGp1c3RpZnkgZWZmZWN0c1xuICBoQm94LnByZWZlcnJlZFdpZHRoID0gUkVDVF9XSURUSCAqIDg7XG5cbiAgYXNzZXJ0LmVxdWFsKCBoQm94LndpZHRoLCBSRUNUX1dJRFRIICogOCwgJ3dpZHRoIHNob3VsZCBiZSB0aGUgcHJlZmVycmVkIHdpZHRoJyApO1xuXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIC8vIGp1c3RpZnkgbGVmdFxuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICBoQm94Lmp1c3RpZnkgPSAnbGVmdCc7XG4gIGFzc2VydC5lcXVhbCggYS5sZWZ0LCBoQm94LmxlZnQsICdhLmxlZnQgc2hvdWxkIGJlIGhCb3gubGVmdCcgKTtcbiAgYXNzZXJ0LmVxdWFsKCBhLnJpZ2h0LCBiLmxlZnQsICdhLnJpZ2h0IHNob3VsZCBiZSBiLmxlZnQnICk7XG4gIGFzc2VydC5lcXVhbCggYi5yaWdodCwgYy5sZWZ0LCAnYi5yaWdodCBzaG91bGQgYmUgYy5sZWZ0JyApO1xuICBhc3NlcnQuZXF1YWwoIGMucmlnaHQsIGQubGVmdCwgJ2MucmlnaHQgc2hvdWxkIGJlIGQubGVmdCcgKTtcbiAgYXNzZXJ0LmVxdWFsKCBkLnJpZ2h0LCA0ICogUkVDVF9XSURUSCwgJ2QucmlnaHQgc2hvdWxkIGJlIDQgKiBSRUNUX1dJRFRIJyApO1xuXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIC8vIGp1c3RpZnkgcmlnaHRcbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgaEJveC5qdXN0aWZ5ID0gJ3JpZ2h0JztcbiAgYXNzZXJ0LmVxdWFsKCBhLmxlZnQsIDQgKiBSRUNUX1dJRFRILCAnYS5sZWZ0IHNob3VsZCBiZSA0ICogUkVDVF9XSURUSCcgKTtcbiAgYXNzZXJ0LmVxdWFsKCBiLmxlZnQsIGEucmlnaHQsICdiLmxlZnQgc2hvdWxkIGJlIGEucmlnaHQnICk7XG4gIGFzc2VydC5lcXVhbCggYy5sZWZ0LCBiLnJpZ2h0LCAnYy5sZWZ0IHNob3VsZCBiZSBiLnJpZ2h0JyApO1xuICBhc3NlcnQuZXF1YWwoIGQubGVmdCwgYy5yaWdodCwgJ2QubGVmdCBzaG91bGQgYmUgYy5yaWdodCcgKTtcbiAgYXNzZXJ0LmVxdWFsKCBkLnJpZ2h0LCBoQm94LnJpZ2h0LCAnZC5yaWdodCBzaG91bGQgYmUgaEJveC5yaWdodCcgKTtcblxuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAvLyBqdXN0aWZ5IHNwYWNlQmV0d2VlblxuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICBoQm94Lmp1c3RpZnkgPSAnc3BhY2VCZXR3ZWVuJztcbiAgYXNzZXJ0LmVxdWFsKCBhLmxlZnQsIGhCb3gubGVmdCwgJ2EubGVmdCBzaG91bGQgYmUgaEJveC5sZWZ0JyApO1xuICBhc3NlcnQuZXF1YWwoIGQucmlnaHQsIGhCb3gucmlnaHQsICdkLnJpZ2h0IHNob3VsZCBiZSBoQm94LnJpZ2h0JyApO1xuICBhc3NlcnQub2soIExheW91dFRlc3RVdGlscy5hYm91dEVxdWFsKCBiLmxlZnQgLSBhLnJpZ2h0LCBjLmxlZnQgLSBiLnJpZ2h0ICksICdzcGFjZSBiZXR3ZWVuIGEgYW5kIGIgc2hvdWxkIGJlIGVxdWFsIHRvIHNwYWNlIGJldHdlZW4gYiBhbmQgYycgKTtcbiAgYXNzZXJ0Lm9rKCBMYXlvdXRUZXN0VXRpbHMuYWJvdXRFcXVhbCggYy5sZWZ0IC0gYi5yaWdodCwgZC5sZWZ0IC0gYy5yaWdodCApLCAnc3BhY2UgYmV0d2VlbiBiIGFuZCBjIHNob3VsZCBiZSBlcXVhbCB0byBzcGFjZSBiZXR3ZWVuIGMgYW5kIGQnICk7XG5cbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgLy8ganVzdGlmeSBzcGFjZUFyb3VuZFxuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICBoQm94Lmp1c3RpZnkgPSAnc3BhY2VBcm91bmQnO1xuXG4gIC8vIHNwYWNlIGFyb3VuZCBoYXMgaGFsZiB0aGUgc3BhY2Ugb24gdGhlIG91dHNpZGUgb2YgdGhlIGZpcnN0IGFuZCBsYXN0IG5vZGVzLCBhbmQgdGhlIG90aGVyIGhhbGYgYmV0d2VlbiBlYWNoIHBhaXJcbiAgLy8gb2Ygbm9kZXNcbiAgY29uc3QgdG90YWxTcGFjZSA9IGhCb3gud2lkdGggLSA0ICogUkVDVF9XSURUSDtcbiAgY29uc3Qgc2lkZVNwYWNpbmcgPSB0b3RhbFNwYWNlIC8gNCAvIDI7IC8vIEVhY2ggTm9kZSBnZXRzIGhhbGYgc3BhY2UgdG8gdGhlIGxlZnQgYW5kIHJpZ2h0XG5cbiAgYXNzZXJ0Lm9rKCBMYXlvdXRUZXN0VXRpbHMuYWJvdXRFcXVhbCggYS5sZWZ0LCBoQm94LmxlZnQgKyBzaWRlU3BhY2luZyApLCAnYS5sZWZ0IHNob3VsZCBiZSBoQm94LmxlZnQgKyBzcGFjZUFyb3VuZCcgKTtcbiAgYXNzZXJ0Lm9rKCBMYXlvdXRUZXN0VXRpbHMuYWJvdXRFcXVhbCggYS5yaWdodCArIHNpZGVTcGFjaW5nICogMiwgYi5sZWZ0ICksICdhLnJpZ2h0ICsgc2lkZVNwYWNpbmcgKiAyIHNob3VsZCBiZSBiLmxlZnQnICk7XG4gIGFzc2VydC5vayggTGF5b3V0VGVzdFV0aWxzLmFib3V0RXF1YWwoIGIucmlnaHQgKyBzaWRlU3BhY2luZyAqIDIsIGMubGVmdCApLCAnYi5yaWdodCArIHNpZGVTcGFjaW5nICogMiBzaG91bGQgYmUgYy5sZWZ0JyApO1xuICBhc3NlcnQub2soIExheW91dFRlc3RVdGlscy5hYm91dEVxdWFsKCBjLnJpZ2h0ICsgc2lkZVNwYWNpbmcgKiAyLCBkLmxlZnQgKSwgJ2MucmlnaHQgKyBzaWRlU3BhY2luZyAqIDIgc2hvdWxkIGJlIGQubGVmdCcgKTtcbiAgYXNzZXJ0Lm9rKCBMYXlvdXRUZXN0VXRpbHMuYWJvdXRFcXVhbCggZC5yaWdodCwgaEJveC5yaWdodCAtIHNpZGVTcGFjaW5nICksICdkLnJpZ2h0IHNob3VsZCBiZSBoQm94LnJpZ2h0IC0gc3BhY2VBcm91bmQnICk7XG5cbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgLy8ganVzdGlmeSBzcGFjZUV2ZW5seVxuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICBoQm94Lmp1c3RpZnkgPSAnc3BhY2VFdmVubHknO1xuXG4gIC8vIHNwYWNlIGV2ZW5seSBoYXMgZXF1YWwgc3BhY2UgYmV0d2VlbiBlYWNoIHBhaXIgb2Ygbm9kZXMgYW5kIG9uIHRoZSBvdXRzaWRlIG9mIHRoZSBmaXJzdCBhbmQgbGFzdCBub2Rlc1xuICBjb25zdCBzcGFjZUJldHdlZW4gPSB0b3RhbFNwYWNlIC8gNTsgLy8gNCBzcGFjZXMgYmV0d2VlbiA1IG5vZGVzXG5cbiAgYXNzZXJ0Lm9rKCBMYXlvdXRUZXN0VXRpbHMuYWJvdXRFcXVhbCggYS5sZWZ0LCBoQm94LmxlZnQgKyBzcGFjZUJldHdlZW4gKSwgJ2EubGVmdCBzaG91bGQgYmUgaEJveC5sZWZ0ICsgc3BhY2VFdmVubHknICk7XG4gIGFzc2VydC5vayggTGF5b3V0VGVzdFV0aWxzLmFib3V0RXF1YWwoIGEucmlnaHQgKyBzcGFjZUJldHdlZW4sIGIubGVmdCApLCAnYS5yaWdodCArIHNwYWNlQmV0d2VlbiBzaG91bGQgYmUgYi5sZWZ0JyApO1xuICBhc3NlcnQub2soIExheW91dFRlc3RVdGlscy5hYm91dEVxdWFsKCBiLnJpZ2h0ICsgc3BhY2VCZXR3ZWVuLCBjLmxlZnQgKSwgJ2IucmlnaHQgKyBzcGFjZUJldHdlZW4gc2hvdWxkIGJlIGMubGVmdCcgKTtcbiAgYXNzZXJ0Lm9rKCBMYXlvdXRUZXN0VXRpbHMuYWJvdXRFcXVhbCggYy5yaWdodCArIHNwYWNlQmV0d2VlbiwgZC5sZWZ0ICksICdjLnJpZ2h0ICsgc3BhY2VCZXR3ZWVuIHNob3VsZCBiZSBkLmxlZnQnICk7XG4gIGFzc2VydC5vayggTGF5b3V0VGVzdFV0aWxzLmFib3V0RXF1YWwoIGQucmlnaHQsIGhCb3gucmlnaHQgLSBzcGFjZUJldHdlZW4gKSwgJ2QucmlnaHQgc2hvdWxkIGJlIGhCb3gucmlnaHQgLSBzcGFjZUV2ZW5seScgKTtcblxuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAvLyBqdXN0aWZ5IGNlbnRlclxuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICBoQm94Lmp1c3RpZnkgPSAnY2VudGVyJztcblxuICBjb25zdCByZW1haW5pbmdTcGFjZSA9IGhCb3gud2lkdGggLSA0ICogUkVDVF9XSURUSDtcbiAgY29uc3QgaGFsZlJlbWFpbmluZ1NwYWNlID0gcmVtYWluaW5nU3BhY2UgLyAyO1xuXG4gIGFzc2VydC5vayggTGF5b3V0VGVzdFV0aWxzLmFib3V0RXF1YWwoIGEubGVmdCwgaEJveC5sZWZ0ICsgaGFsZlJlbWFpbmluZ1NwYWNlICksICdhLmxlZnQgc2hvdWxkIGJlIGhCb3gubGVmdCArIGhhbGZSZW1haW5pbmdTcGFjZScgKTtcbiAgYXNzZXJ0LmVxdWFsKCBhLnJpZ2h0LCBiLmxlZnQsICdhLnJpZ2h0IHNob3VsZCBiZSBiLmxlZnQnICk7XG4gIGFzc2VydC5lcXVhbCggYi5yaWdodCwgYy5sZWZ0LCAnYi5yaWdodCBzaG91bGQgYmUgYy5sZWZ0JyApO1xuICBhc3NlcnQuZXF1YWwoIGMucmlnaHQsIGQubGVmdCwgJ2MucmlnaHQgc2hvdWxkIGJlIGQubGVmdCcgKTtcbiAgYXNzZXJ0Lm9rKCBMYXlvdXRUZXN0VXRpbHMuYWJvdXRFcXVhbCggZC5yaWdodCwgaEJveC5yaWdodCAtIGhhbGZSZW1haW5pbmdTcGFjZSApLCAnZC5yaWdodCBzaG91bGQgYmUgaEJveC5yaWdodCAtIGhhbGZSZW1haW5pbmdTcGFjZScgKTtcbn0gKTtcblxuUVVuaXQudGVzdCggJ1dyYXAgdGVzdHMnLCBhc3NlcnQgPT4ge1xuICBjb25zdCBbIGEsIGIsIGMsIGQgXSA9IExheW91dFRlc3RVdGlscy5jcmVhdGVSZWN0YW5nbGVzKCA0ICk7XG4gIGNvbnN0IGhCb3ggPSBuZXcgSEJveCggeyBjaGlsZHJlbjogWyBhLCBiLCBjLCBkIF0sIHdyYXA6IHRydWUgfSApO1xuXG4gIGFzc2VydC5lcXVhbCggaEJveC53aWR0aCwgNCAqIFJFQ1RfV0lEVEgsICd3aWR0aCBzaG91bGQgYmUgc3VtIG9mIGNoaWxkcmVuIHdpZHRocycgKTtcbiAgYXNzZXJ0LmVxdWFsKCBoQm94LmhlaWdodCwgUkVDVF9IRUlHSFQsICdoZWlnaHQgc2hvdWxkIGJlIFJFQ1RfSEVJR0hUJyApO1xuXG4gIC8vIHJlc3RyaWN0IHRoZSBwcmVmZXJyZWQgd2lkdGggb2YgdGhlIGNvbnRhaW5lciB0byB0ZXN0IHdyYXBcbiAgaEJveC5wcmVmZXJyZWRXaWR0aCA9IFJFQ1RfV0lEVEggKiAyO1xuXG4gIGFzc2VydC5lcXVhbCggaEJveC53aWR0aCwgUkVDVF9XSURUSCAqIDIsICd3aWR0aCBzaG91bGQgYmUgdGhlIHByZWZlcnJlZCB3aWR0aCcgKTtcbiAgYXNzZXJ0LmVxdWFsKCBoQm94LmhlaWdodCwgUkVDVF9IRUlHSFQgKiAyLCAnaGVpZ2h0IHNob3VsZCBiZSBsYXJnZXIgZHVlIHRvIHdyYXAnICk7XG5cbiAgLy8gbWFrZSB0aGUgY29udGFpbmVyIGV2ZW4gc21hbGxlciB0byB0ZXN0IHdyYXBcbiAgaEJveC5wcmVmZXJyZWRXaWR0aCA9IFJFQ1RfV0lEVEg7XG4gIGFzc2VydC5lcXVhbCggaEJveC53aWR0aCwgUkVDVF9XSURUSCwgJ3dpZHRoIHNob3VsZCBiZSB0aGUgcHJlZmVycmVkIHdpZHRoJyApO1xuICBhc3NlcnQuZXF1YWwoIGhCb3guaGVpZ2h0LCBSRUNUX0hFSUdIVCAqIDQsICdoZWlnaHQgc2hvdWxkIGJlIGxhcmdlciBkdWUgdG8gd3JhcCcgKTtcbn0gKTtcblxuUVVuaXQudGVzdCggJ0FsaWduIHRlc3RzJywgYXNzZXJ0ID0+IHtcbiAgY29uc3QgYSA9IG5ldyBSZWN0YW5nbGUoIDAsIDAsIFJFQ1RfV0lEVEgsIDEwICk7XG4gIGNvbnN0IGIgPSBuZXcgUmVjdGFuZ2xlKCAwLCAwLCBSRUNUX1dJRFRILCAyMCApO1xuICBjb25zdCBjID0gbmV3IFJlY3RhbmdsZSggMCwgMCwgUkVDVF9XSURUSCwgMzAgKTtcbiAgY29uc3QgZCA9IG5ldyBSZWN0YW5nbGUoIDAsIDAsIFJFQ1RfV0lEVEgsIDQwICk7XG5cbiAgY29uc3QgaEJveCA9IG5ldyBIQm94KCB7IGNoaWxkcmVuOiBbIGEsIGIsIGMsIGQgXSB9ICk7XG5cbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgLy8gYWxpZ24gdG9wXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIGhCb3guYWxpZ24gPSAndG9wJztcblxuICBhc3NlcnQuZXF1YWwoIGEudG9wLCBoQm94LnRvcCwgJ2EudG9wIHNob3VsZCBiZSBoQm94LnRvcCAoYWxpZ24gdG9wKScgKTtcbiAgYXNzZXJ0LmVxdWFsKCBiLnRvcCwgaEJveC50b3AsICdiLnRvcCBzaG91bGQgYmUgaEJveC50b3AgKGFsaWduIHRvcCknICk7XG4gIGFzc2VydC5lcXVhbCggYy50b3AsIGhCb3gudG9wLCAnYy50b3Agc2hvdWxkIGJlIGhCb3gudG9wIChhbGlnbiB0b3ApJyApO1xuICBhc3NlcnQuZXF1YWwoIGQudG9wLCBoQm94LnRvcCwgJ2QudG9wIHNob3VsZCBiZSBoQm94LnRvcCAoYWxpZ24gdG9wKScgKTtcbiAgYXNzZXJ0Lm5vdEVxdWFsKCBhLmJvdHRvbSwgYi5ib3R0b20sICdhLmJvdHRvbSBzaG91bGQgbm90IGJlIGIuYm90dG9tIChhbGlnbiB0b3ApJyApO1xuICBhc3NlcnQubm90RXF1YWwoIGIuYm90dG9tLCBjLmJvdHRvbSwgJ2IuYm90dG9tIHNob3VsZCBub3QgYmUgYy5ib3R0b20gKGFsaWduIHRvcCknICk7XG4gIGFzc2VydC5ub3RFcXVhbCggYy5ib3R0b20sIGQuYm90dG9tLCAnYy5ib3R0b20gc2hvdWxkIG5vdCBiZSBkLmJvdHRvbSAoYWxpZ24gdG9wKScgKTtcblxuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAvLyBhbGlnbiBib3R0b21cbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgaEJveC5hbGlnbiA9ICdib3R0b20nO1xuXG4gIGFzc2VydC5lcXVhbCggYS5ib3R0b20sIGhCb3guYm90dG9tLCAnYS5ib3R0b20gc2hvdWxkIGJlIGhCb3guYm90dG9tIChhbGlnbiBib3R0b20pJyApO1xuICBhc3NlcnQuZXF1YWwoIGIuYm90dG9tLCBoQm94LmJvdHRvbSwgJ2IuYm90dG9tIHNob3VsZCBiZSBoQm94LmJvdHRvbSAoYWxpZ24gYm90dG9tKScgKTtcbiAgYXNzZXJ0LmVxdWFsKCBjLmJvdHRvbSwgaEJveC5ib3R0b20sICdjLmJvdHRvbSBzaG91bGQgYmUgaEJveC5ib3R0b20gKGFsaWduIGJvdHRvbSknICk7XG4gIGFzc2VydC5lcXVhbCggZC5ib3R0b20sIGhCb3guYm90dG9tLCAnZC5ib3R0b20gc2hvdWxkIGJlIGhCb3guYm90dG9tIChhbGlnbiBib3R0b20pJyApO1xuICBhc3NlcnQubm90RXF1YWwoIGEudG9wLCBiLnRvcCwgJ2EudG9wIHNob3VsZCBub3QgYmUgYi50b3AgKGFsaWduIGJvdHRvbSknICk7XG4gIGFzc2VydC5ub3RFcXVhbCggYi50b3AsIGMudG9wLCAnYi50b3Agc2hvdWxkIG5vdCBiZSBjLnRvcCAoYWxpZ24gYm90dG9tKScgKTtcbiAgYXNzZXJ0Lm5vdEVxdWFsKCBjLnRvcCwgZC50b3AsICdjLnRvcCBzaG91bGQgbm90IGJlIGQudG9wIChhbGlnbiBib3R0b20pJyApO1xuXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIC8vIGFsaWduIGNlbnRlclxuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICBoQm94LmFsaWduID0gJ2NlbnRlcic7XG5cbiAgYXNzZXJ0LmVxdWFsKCBhLmNlbnRlclksIGhCb3guY2VudGVyWSwgJ2EuY2VudGVyWSBzaG91bGQgYmUgaEJveC5jZW50ZXJZIChhbGlnbiBjZW50ZXIpJyApO1xuICBhc3NlcnQuZXF1YWwoIGIuY2VudGVyWSwgaEJveC5jZW50ZXJZLCAnYi5jZW50ZXJZIHNob3VsZCBiZSBoQm94LmNlbnRlclkgKGFsaWduIGNlbnRlciknICk7XG4gIGFzc2VydC5lcXVhbCggYy5jZW50ZXJZLCBoQm94LmNlbnRlclksICdjLmNlbnRlclkgc2hvdWxkIGJlIGhCb3guY2VudGVyWSAoYWxpZ24gY2VudGVyKScgKTtcbiAgYXNzZXJ0LmVxdWFsKCBkLmNlbnRlclksIGhCb3guY2VudGVyWSwgJ2QuY2VudGVyWSBzaG91bGQgYmUgaEJveC5jZW50ZXJZIChhbGlnbiBjZW50ZXIpJyApO1xuXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIC8vIGFsaWduIG9yaWdpblxuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICBoQm94LmFsaWduID0gJ29yaWdpbic7XG5cbiAgLy8gcmVjdGFuZ2xlIG9yaWdpbnMgYXQgdG9wIGxlZnRcbiAgYXNzZXJ0LmVxdWFsKCBhLnRvcCwgaEJveC50b3AsICdhLnRvcCBzaG91bGQgYmUgaEJveC50b3AgKGFsaWduIG9yaWdpbiknICk7XG4gIGFzc2VydC5lcXVhbCggYi50b3AsIGhCb3gudG9wLCAnYi50b3Agc2hvdWxkIGJlIGhCb3gudG9wIChhbGlnbiBvcmlnaW4pJyApO1xuICBhc3NlcnQuZXF1YWwoIGMudG9wLCBoQm94LnRvcCwgJ2MudG9wIHNob3VsZCBiZSBoQm94LnRvcCAoYWxpZ24gb3JpZ2luKScgKTtcbiAgYXNzZXJ0LmVxdWFsKCBkLnRvcCwgaEJveC50b3AsICdkLnRvcCBzaG91bGQgYmUgaEJveC50b3AgKGFsaWduIG9yaWdpbiknICk7XG59ICk7XG5cblxuUVVuaXQudGVzdCggJ0p1c3RpZnkgTGluZXMgVGVzdHMnLCBhc3NlcnQgPT4ge1xuXG4gIGNvbnN0IFsgYSwgYiwgYywgZCBdID0gTGF5b3V0VGVzdFV0aWxzLmNyZWF0ZVJlY3RhbmdsZXMoIDQgKTtcbiAgY29uc3QgaEJveCA9IG5ldyBIQm94KCB7XG4gICAgY2hpbGRyZW46IFsgYSwgYiwgYywgZCBdLFxuXG4gICAgLy8gc28gdGhhdCByZWN0YW5nbGVzIHdpbGwgc3RhY2sgb24gdGhlIHNlY29uZGFyeSBheGlzXG4gICAgcHJlZmVycmVkV2lkdGg6IFJFQ1RfV0lEVEgsXG4gICAgd3JhcDogdHJ1ZSxcblxuICAgIC8vIHNvIHRoZXJlIGlzIHBsZW50eSBvZiByb29tIG9uIHRoZSBzZWNvbmRhcnkgYXhpcyB0byB0ZXN0IGp1c3RpZnlMaW5lc1xuICAgIHByZWZlcnJlZEhlaWdodDogUkVDVF9IRUlHSFQgKiA4XG4gIH0gKTtcblxuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAvLyBqdXN0aWZ5TGluZXMgdG9wXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIGhCb3guanVzdGlmeUxpbmVzID0gJ3RvcCc7XG5cbiAgYXNzZXJ0LmVxdWFsKCBhLnRvcCwgaEJveC50b3AsICdhLnRvcCBzaG91bGQgYmUgaEJveC50b3AgKGp1c3RpZnlMaW5lcyB0b3ApJyApO1xuICBhc3NlcnQuZXF1YWwoIGIudG9wLCBhLmJvdHRvbSwgJ2IudG9wIHNob3VsZCBiZSBhLmJvdHRvbSAoanVzdGlmeUxpbmVzIHRvcCknICk7XG4gIGFzc2VydC5lcXVhbCggYy50b3AsIGIuYm90dG9tLCAnYy50b3Agc2hvdWxkIGJlIGIuYm90dG9tIChqdXN0aWZ5TGluZXMgdG9wKScgKTtcbiAgYXNzZXJ0LmVxdWFsKCBkLnRvcCwgYy5ib3R0b20sICdkLnRvcCBzaG91bGQgYmUgYy5ib3R0b20gKGp1c3RpZnlMaW5lcyB0b3ApJyApO1xuXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIC8vIGp1c3RpZnlMaW5lcyBib3R0b21cbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgaEJveC5qdXN0aWZ5TGluZXMgPSAnYm90dG9tJztcblxuICBhc3NlcnQuZXF1YWwoIGQuYm90dG9tLCBoQm94LmJvdHRvbSwgJ2QuYm90dG9tIHNob3VsZCBiZSBoQm94LmJvdHRvbSAoanVzdGlmeUxpbmVzIGJvdHRvbSknICk7XG4gIGFzc2VydC5lcXVhbCggYy5ib3R0b20sIGQudG9wLCAnYy5ib3R0b20gc2hvdWxkIGJlIGQudG9wIChqdXN0aWZ5TGluZXMgYm90dG9tKScgKTtcbiAgYXNzZXJ0LmVxdWFsKCBiLmJvdHRvbSwgYy50b3AsICdiLmJvdHRvbSBzaG91bGQgYmUgYy50b3AgKGp1c3RpZnlMaW5lcyBib3R0b20pJyApO1xuICBhc3NlcnQuZXF1YWwoIGEuYm90dG9tLCBiLnRvcCwgJ2EuYm90dG9tIHNob3VsZCBiZSBiLnRvcCAoanVzdGlmeUxpbmVzIGJvdHRvbSknICk7XG5cbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgLy8ganVzdGlmeUxpbmVzIGNlbnRlclxuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICBoQm94Lmp1c3RpZnlMaW5lcyA9ICdjZW50ZXInO1xuXG4gIGFzc2VydC5lcXVhbCggYS50b3AsIGhCb3guaGVpZ2h0IC8gMiAtIFJFQ1RfSEVJR0hUICogMiwgJ2EudG9wIHNob3VsZCBiZSBoYWxmIHRoZSBoZWlnaHQgbWludXMgaGFsZiB0aGUgaGVpZ2h0IG9mIHRoZSByZWN0YW5nbGVzJyApO1xuICBhc3NlcnQuZXF1YWwoIGIudG9wLCBhLmJvdHRvbSwgJ2IudG9wIHNob3VsZCBiZSBhLmJvdHRvbSAoanVzdGlmeUxpbmVzIGNlbnRlciknICk7XG4gIGFzc2VydC5lcXVhbCggYy50b3AsIGIuYm90dG9tLCAnYy50b3Agc2hvdWxkIGJlIGIuYm90dG9tIChqdXN0aWZ5TGluZXMgY2VudGVyKScgKTtcbiAgYXNzZXJ0LmVxdWFsKCBkLnRvcCwgYy5ib3R0b20sICdkLnRvcCBzaG91bGQgYmUgYy5ib3R0b20gKGp1c3RpZnlMaW5lcyBjZW50ZXIpJyApO1xuXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIC8vIGp1c3RpZnlMaW5lcyBzcGFjZUJldHdlZW5cbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgaEJveC5qdXN0aWZ5TGluZXMgPSAnc3BhY2VCZXR3ZWVuJztcblxuICBhc3NlcnQub2soIExheW91dFRlc3RVdGlscy5hYm91dEVxdWFsKCBhLnRvcCwgaEJveC50b3AgKSwgJ2EudG9wIHNob3VsZCBiZSBoQm94LnRvcCAoanVzdGlmeUxpbmVzIHNwYWNlQmV0d2VlbiknICk7XG4gIGFzc2VydC5vayggTGF5b3V0VGVzdFV0aWxzLmFib3V0RXF1YWwoIGQuYm90dG9tLCBoQm94LmJvdHRvbSApLCAnZC5ib3R0b20gc2hvdWxkIGJlIGhCb3guYm90dG9tIChqdXN0aWZ5TGluZXMgc3BhY2VCZXR3ZWVuKScgKTtcbiAgYXNzZXJ0Lm9rKCBMYXlvdXRUZXN0VXRpbHMuYWJvdXRFcXVhbCggYi50b3AgLSBhLmJvdHRvbSwgYy50b3AgLSBiLmJvdHRvbSApLCAnc3BhY2UgYmV0d2VlbiBhIGFuZCBiIHNob3VsZCBiZSBlcXVhbCB0byBzcGFjZSBiZXR3ZWVuIGIgYW5kIGMnICk7XG4gIGFzc2VydC5vayggTGF5b3V0VGVzdFV0aWxzLmFib3V0RXF1YWwoIGMudG9wIC0gYi5ib3R0b20sIGQudG9wIC0gYy5ib3R0b20gKSwgJ3NwYWNlIGJldHdlZW4gYiBhbmQgYyBzaG91bGQgYmUgZXF1YWwgdG8gc3BhY2UgYmV0d2VlbiBjIGFuZCBkJyApO1xuXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIC8vIGp1c3RpZnlMaW5lcyBzcGFjZUFyb3VuZFxuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICBoQm94Lmp1c3RpZnlMaW5lcyA9ICdzcGFjZUFyb3VuZCc7XG5cbiAgY29uc3QgdG90YWxTcGFjZSA9IGhCb3guaGVpZ2h0IC0gNCAqIFJFQ1RfSEVJR0hUO1xuICBjb25zdCBzaWRlU3BhY2luZyA9IHRvdGFsU3BhY2UgLyA0IC8gMjsgLy8gRWFjaCBOb2RlIGdldHMgaGFsZiBzcGFjZSB0byB0aGUgdG9wIGFuZCBib3R0b21cblxuICBhc3NlcnQub2soIExheW91dFRlc3RVdGlscy5hYm91dEVxdWFsKCBhLnRvcCwgaEJveC50b3AgKyBzaWRlU3BhY2luZyApLCAnYS50b3Agc2hvdWxkIGJlIGhCb3gudG9wICsgc3BhY2VBcm91bmQnICk7XG4gIGFzc2VydC5vayggTGF5b3V0VGVzdFV0aWxzLmFib3V0RXF1YWwoIGEuYm90dG9tICsgc2lkZVNwYWNpbmcgKiAyLCBiLnRvcCApLCAnYS5ib3R0b20gKyBzaWRlU3BhY2luZyAqIDIgc2hvdWxkIGJlIGIudG9wJyApO1xuICBhc3NlcnQub2soIExheW91dFRlc3RVdGlscy5hYm91dEVxdWFsKCBiLmJvdHRvbSArIHNpZGVTcGFjaW5nICogMiwgYy50b3AgKSwgJ2IuYm90dG9tICsgc2lkZVNwYWNpbmcgKiAyIHNob3VsZCBiZSBjLnRvcCcgKTtcbiAgYXNzZXJ0Lm9rKCBMYXlvdXRUZXN0VXRpbHMuYWJvdXRFcXVhbCggYy5ib3R0b20gKyBzaWRlU3BhY2luZyAqIDIsIGQudG9wICksICdjLmJvdHRvbSArIHNpZGVTcGFjaW5nICogMiBzaG91bGQgYmUgZC50b3AnICk7XG4gIGFzc2VydC5vayggTGF5b3V0VGVzdFV0aWxzLmFib3V0RXF1YWwoIGQuYm90dG9tLCBoQm94LmJvdHRvbSAtIHNpZGVTcGFjaW5nICksICdkLmJvdHRvbSBzaG91bGQgYmUgaEJveC5ib3R0b20gLSBzcGFjZUFyb3VuZCcgKTtcblxuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAvLyBqdXN0aWZ5TGluZXMgc3BhY2VFdmVubHlcbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgaEJveC5qdXN0aWZ5TGluZXMgPSAnc3BhY2VFdmVubHknO1xuXG4gIGNvbnN0IHNwYWNlQmV0d2VlbiA9IHRvdGFsU3BhY2UgLyA1OyAvLyA0IHNwYWNlcyBiZXR3ZWVuIDUgbm9kZXNcblxuICBhc3NlcnQub2soIExheW91dFRlc3RVdGlscy5hYm91dEVxdWFsKCBhLnRvcCwgaEJveC50b3AgKyBzcGFjZUJldHdlZW4gKSwgJ2EudG9wIHNob3VsZCBiZSBoQm94LnRvcCArIHNwYWNlRXZlbmx5JyApO1xuICBhc3NlcnQub2soIExheW91dFRlc3RVdGlscy5hYm91dEVxdWFsKCBhLmJvdHRvbSArIHNwYWNlQmV0d2VlbiwgYi50b3AgKSwgJ2EuYm90dG9tICsgc3BhY2VCZXR3ZWVuIHNob3VsZCBiZSBiLnRvcCcgKTtcbiAgYXNzZXJ0Lm9rKCBMYXlvdXRUZXN0VXRpbHMuYWJvdXRFcXVhbCggYi5ib3R0b20gKyBzcGFjZUJldHdlZW4sIGMudG9wICksICdiLmJvdHRvbSArIHNwYWNlQmV0d2VlbiBzaG91bGQgYmUgYy50b3AnICk7XG4gIGFzc2VydC5vayggTGF5b3V0VGVzdFV0aWxzLmFib3V0RXF1YWwoIGMuYm90dG9tICsgc3BhY2VCZXR3ZWVuLCBkLnRvcCApLCAnYy5ib3R0b20gKyBzcGFjZUJldHdlZW4gc2hvdWxkIGJlIGQudG9wJyApO1xuICBhc3NlcnQub2soIExheW91dFRlc3RVdGlscy5hYm91dEVxdWFsKCBkLmJvdHRvbSwgaEJveC5ib3R0b20gLSBzcGFjZUJldHdlZW4gKSwgJ2QuYm90dG9tIHNob3VsZCBiZSBoQm94LmJvdHRvbSAtIHNwYWNlRXZlbmx5JyApO1xuXG5cbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgLy8ganVzdGlmeUxpbmVzIG51bGwgKGRlZmF1bHQgdG8gc3RyZXRjaCAoc2FtZSBhcyBzcGFjZUFyb3VuZCkpXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIGhCb3guanVzdGlmeUxpbmVzID0gbnVsbDtcblxuICBhc3NlcnQub2soIExheW91dFRlc3RVdGlscy5hYm91dEVxdWFsKCBhLnRvcCwgaEJveC50b3AgKyBzaWRlU3BhY2luZyApLCAnYS50b3Agc2hvdWxkIGJlIGhCb3gudG9wICsgc3BhY2VBcm91bmQnICk7XG4gIGFzc2VydC5vayggTGF5b3V0VGVzdFV0aWxzLmFib3V0RXF1YWwoIGEuYm90dG9tICsgc2lkZVNwYWNpbmcgKiAyLCBiLnRvcCApLCAnYS5ib3R0b20gKyBzaWRlU3BhY2luZyAqIDIgc2hvdWxkIGJlIGIudG9wJyApO1xuICBhc3NlcnQub2soIExheW91dFRlc3RVdGlscy5hYm91dEVxdWFsKCBiLmJvdHRvbSArIHNpZGVTcGFjaW5nICogMiwgYy50b3AgKSwgJ2IuYm90dG9tICsgc2lkZVNwYWNpbmcgKiAyIHNob3VsZCBiZSBjLnRvcCcgKTtcbiAgYXNzZXJ0Lm9rKCBMYXlvdXRUZXN0VXRpbHMuYWJvdXRFcXVhbCggYy5ib3R0b20gKyBzaWRlU3BhY2luZyAqIDIsIGQudG9wICksICdjLmJvdHRvbSArIHNpZGVTcGFjaW5nICogMiBzaG91bGQgYmUgZC50b3AnICk7XG4gIGFzc2VydC5vayggTGF5b3V0VGVzdFV0aWxzLmFib3V0RXF1YWwoIGQuYm90dG9tLCBoQm94LmJvdHRvbSAtIHNpZGVTcGFjaW5nICksICdkLmJvdHRvbSBzaG91bGQgYmUgaEJveC5ib3R0b20gLSBzcGFjZUFyb3VuZCcgKTtcbn0gKTtcblxuUVVuaXQudGVzdCggJ1NwYWNpbmcgdGVzdHMnLCBhc3NlcnQgPT4ge1xuICBjb25zdCBbIGEsIGIsIGMsIGQgXSA9IExheW91dFRlc3RVdGlscy5jcmVhdGVSZWN0YW5nbGVzKCA0ICk7XG5cbiAgY29uc3QgaEJveCA9IG5ldyBIQm94KCB7IGNoaWxkcmVuOiBbIGEsIGIsIGMsIGQgXSwgc3BhY2luZzogMTAgfSApO1xuXG4gIGFzc2VydC5vayggTGF5b3V0VGVzdFV0aWxzLmFib3V0RXF1YWwoIGIubGVmdCAtIGEucmlnaHQsIDEwICksICdiLmxlZnQgLSBhLnJpZ2h0IHNob3VsZCBiZSAxMCcgKTtcbiAgYXNzZXJ0Lm9rKCBMYXlvdXRUZXN0VXRpbHMuYWJvdXRFcXVhbCggYy5sZWZ0IC0gYi5yaWdodCwgMTAgKSwgJ2MubGVmdCAtIGIucmlnaHQgc2hvdWxkIGJlIDEwJyApO1xuICBhc3NlcnQub2soIExheW91dFRlc3RVdGlscy5hYm91dEVxdWFsKCBkLmxlZnQgLSBjLnJpZ2h0LCAxMCApLCAnZC5sZWZ0IC0gYy5yaWdodCBzaG91bGQgYmUgMTAnICk7XG4gIGFzc2VydC5vayggTGF5b3V0VGVzdFV0aWxzLmFib3V0RXF1YWwoIGhCb3gud2lkdGgsIDQgKiBSRUNUX1dJRFRIICsgMyAqIDEwICksICd3aWR0aCBzaG91bGQgYmUgc3VtIG9mIGNoaWxkcmVuIHdpZHRocyBwbHVzIHNwYWNpbmcnICk7XG59ICk7XG5cblFVbml0LnRlc3QoICdsaW5lU3BhY2luZyB0ZXN0cycsIGFzc2VydCA9PiB7XG5cbiAgLy8gTGluZSBzcGFjaW5nIGlzIHRoZSBzcGFjaW5nIGJldHdlZW4gbGluZXMgb2Ygbm9kZXMgaW4gYSB3cmFwIGxheW91dFxuICBjb25zdCBbIGEsIGIsIGMsIGQgXSA9IExheW91dFRlc3RVdGlscy5jcmVhdGVSZWN0YW5nbGVzKCA0ICk7XG5cbiAgY29uc3QgaEJveCA9IG5ldyBIQm94KCB7XG4gICAgY2hpbGRyZW46IFsgYSwgYiwgYywgZCBdLFxuICAgIGxpbmVTcGFjaW5nOiAxMCxcblxuICAgIC8vIHNvIHRoYXQgdGhlIGNvbnRlbnRzIHdyYXAgYW5kIHdlIGNhbiB0ZXN0IGxpbmVTcGFjaW5nXG4gICAgd3JhcDogdHJ1ZSxcbiAgICBwcmVmZXJyZWRXaWR0aDogUkVDVF9XSURUSFxuICB9ICk7XG5cbiAgYXNzZXJ0Lm9rKCBMYXlvdXRUZXN0VXRpbHMuYWJvdXRFcXVhbCggYS50b3AsIGhCb3gudG9wICksICdhLnRvcCBzaG91bGQgYmUgaEJveC50b3AnICk7XG4gIGFzc2VydC5vayggTGF5b3V0VGVzdFV0aWxzLmFib3V0RXF1YWwoIGIudG9wIC0gYS5ib3R0b20sIDEwICksICdiLnRvcCAtIGEuYm90dG9tIHNob3VsZCBiZSAxMCcgKTtcbiAgYXNzZXJ0Lm9rKCBMYXlvdXRUZXN0VXRpbHMuYWJvdXRFcXVhbCggYy50b3AgLSBiLmJvdHRvbSwgMTAgKSwgJ2MudG9wIC0gYi5ib3R0b20gc2hvdWxkIGJlIDEwJyApO1xuICBhc3NlcnQub2soIExheW91dFRlc3RVdGlscy5hYm91dEVxdWFsKCBkLnRvcCAtIGMuYm90dG9tLCAxMCApLCAnZC50b3AgLSBjLmJvdHRvbSBzaG91bGQgYmUgMTAnICk7XG4gIGFzc2VydC5vayggTGF5b3V0VGVzdFV0aWxzLmFib3V0RXF1YWwoIGhCb3guaGVpZ2h0LCA0ICogUkVDVF9IRUlHSFQgKyAzICogMTAgKSwgJ2hlaWdodCBzaG91bGQgYmUgc3VtIG9mIGNoaWxkcmVuIGhlaWdodHMgcGx1cyBsaW5lU3BhY2luZycgKTtcbn0gKTtcblxuUVVuaXQudGVzdCggJ01hcmdpbnMgdGVzdHMnLCBhc3NlcnQgPT4ge1xuXG4gIGNvbnN0IFsgYSwgYiwgYywgZCBdID0gTGF5b3V0VGVzdFV0aWxzLmNyZWF0ZVJlY3RhbmdsZXMoIDQgKTtcblxuICBjb25zdCBoQm94ID0gbmV3IEhCb3goIHtcbiAgICBjaGlsZHJlbjogWyBhLCBiLCBjLCBkIF1cbiAgfSApO1xuXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIC8vIG1hcmdpbiB0ZXN0c1xuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICBoQm94Lm1hcmdpbiA9IDEwO1xuXG4gIGFzc2VydC5vayggTGF5b3V0VGVzdFV0aWxzLmFib3V0RXF1YWwoIGEubGVmdCwgaEJveC5sZWZ0ICsgMTAgKSwgJ2EubGVmdCBzaG91bGQgYmUgaEJveC5sZWZ0ICsgMTAnICk7XG4gIGFzc2VydC5vayggTGF5b3V0VGVzdFV0aWxzLmFib3V0RXF1YWwoIGIubGVmdCwgYS5yaWdodCArIDIwICksICdiLmxlZnQgc2hvdWxkIGJlIGEucmlnaHQgKyAxMCcgKTtcbiAgYXNzZXJ0Lm9rKCBMYXlvdXRUZXN0VXRpbHMuYWJvdXRFcXVhbCggYy5sZWZ0LCBiLnJpZ2h0ICsgMjAgKSwgJ2MubGVmdCBzaG91bGQgYmUgYi5yaWdodCArIDEwJyApO1xuICBhc3NlcnQub2soIExheW91dFRlc3RVdGlscy5hYm91dEVxdWFsKCBkLmxlZnQsIGMucmlnaHQgKyAyMCApLCAnZC5sZWZ0IHNob3VsZCBiZSBjLnJpZ2h0ICsgMTAnICk7XG4gIGFzc2VydC5vayggTGF5b3V0VGVzdFV0aWxzLmFib3V0RXF1YWwoIGQucmlnaHQsIGhCb3gucmlnaHQgLSAxMCApLCAnZC5yaWdodCBzaG91bGQgYmUgaEJveC5yaWdodCAtIDEwJyApO1xuICBhc3NlcnQub2soIExheW91dFRlc3RVdGlscy5hYm91dEVxdWFsKCBhLnRvcCwgaEJveC50b3AgKyAxMCApLCAnYS50b3Agc2hvdWxkIGJlIGhCb3gudG9wICsgMTAnICk7XG4gIGFzc2VydC5vayggTGF5b3V0VGVzdFV0aWxzLmFib3V0RXF1YWwoIGIudG9wLCBoQm94LnRvcCArIDEwICksICdiLnRvcCBzaG91bGQgYmUgaEJveC50b3AgKyAxMCcgKTtcbiAgYXNzZXJ0Lm9rKCBMYXlvdXRUZXN0VXRpbHMuYWJvdXRFcXVhbCggYy50b3AsIGhCb3gudG9wICsgMTAgKSwgJ2MudG9wIHNob3VsZCBiZSBoQm94LnRvcCArIDEwJyApO1xuICBhc3NlcnQub2soIExheW91dFRlc3RVdGlscy5hYm91dEVxdWFsKCBkLnRvcCwgaEJveC50b3AgKyAxMCApLCAnZC50b3Agc2hvdWxkIGJlIGhCb3gudG9wICsgMTAnICk7XG5cbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgLy8gbGVmdCBtYXJnaW4gdGVzdHNcbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgaEJveC5tYXJnaW4gPSAwO1xuICBoQm94LmxlZnRNYXJnaW4gPSAxMDtcblxuICBhc3NlcnQub2soIExheW91dFRlc3RVdGlscy5hYm91dEVxdWFsKCBhLmxlZnQsIGhCb3gubGVmdCArIDEwICksICdhLmxlZnQgc2hvdWxkIGJlIGhCb3gubGVmdCcgKTtcbiAgYXNzZXJ0Lm9rKCBMYXlvdXRUZXN0VXRpbHMuYWJvdXRFcXVhbCggYi5sZWZ0LCBhLnJpZ2h0ICsgMTAgKSwgJ2IubGVmdCBzaG91bGQgYmUgYS5yaWdodCArIDEwJyApO1xuICBhc3NlcnQub2soIExheW91dFRlc3RVdGlscy5hYm91dEVxdWFsKCBjLmxlZnQsIGIucmlnaHQgKyAxMCApLCAnYy5sZWZ0IHNob3VsZCBiZSBiLnJpZ2h0ICsgMTAnICk7XG4gIGFzc2VydC5vayggTGF5b3V0VGVzdFV0aWxzLmFib3V0RXF1YWwoIGQubGVmdCwgYy5yaWdodCArIDEwICksICdkLmxlZnQgc2hvdWxkIGJlIGMucmlnaHQgKyAxMCcgKTtcbiAgYXNzZXJ0Lm9rKCBMYXlvdXRUZXN0VXRpbHMuYWJvdXRFcXVhbCggZC5yaWdodCwgaEJveC5yaWdodCApLCAnZC5yaWdodCBzaG91bGQgYmUgaEJveC5yaWdodCcgKTtcbn0gKTtcblxuUVVuaXQudGVzdCggJ1Blci1jZWxsIGxheW91dCBvcHRpb25zJywgYXNzZXJ0ID0+IHtcbiAgY29uc3QgWyBhLCBiLCBjLCBkIF0gPSBMYXlvdXRUZXN0VXRpbHMuY3JlYXRlUmVjdGFuZ2xlcyggNCApO1xuXG4gIGNvbnN0IGhCb3ggPSBuZXcgSEJveCgge1xuICAgIGNoaWxkcmVuOiBbIGEsIGIsIGMsIGQgXVxuICB9ICk7XG5cbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgLy8gcGVyLWNlbCBtYXJnaW5zXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgY29uc3QgbWFyZ2luID0gMTA7XG4gIGEubGF5b3V0T3B0aW9ucyA9IHsgdG9wTWFyZ2luOiBtYXJnaW4gfTtcbiAgZC5sYXlvdXRPcHRpb25zID0geyBsZWZ0TWFyZ2luOiBtYXJnaW4gfTtcblxuICBhc3NlcnQub2soIExheW91dFRlc3RVdGlscy5hYm91dEVxdWFsKCBhLnRvcCwgaEJveC50b3AgKyBtYXJnaW4gKSwgJ2EudG9wIHNob3VsZCBiZSBoQm94LnRvcCArIG1hcmdpbicgKTtcbiAgYXNzZXJ0Lm9rKCBMYXlvdXRUZXN0VXRpbHMuYWJvdXRFcXVhbCggYi50b3AsIGhCb3gudG9wICsgbWFyZ2luIC8gMiApLCAnaEJveCBkaW1lbnNpb25zIGdyb3cgYnV0IGIgcmVtYWlucyBjZW50ZXJlZCBieSBkZWZhdWx0JyApO1xuICBhc3NlcnQub2soIExheW91dFRlc3RVdGlscy5hYm91dEVxdWFsKCBjLnRvcCwgaEJveC50b3AgKyBtYXJnaW4gLyAyICksICdoQm94IGRpbWVuc2lvbnMgZ3JvdyBidXQgYyByZW1haW5zIGNlbnRlcmVkIGJ5IGRlZmF1bHQnICk7XG4gIGFzc2VydC5vayggTGF5b3V0VGVzdFV0aWxzLmFib3V0RXF1YWwoIGQubGVmdCwgYy5yaWdodCArIG1hcmdpbiApLCAnZC5sZWZ0IHNob3VsZCBiZSBjLmxlZnQgKyBtYXJnaW4nICk7XG4gIGFzc2VydC5vayggTGF5b3V0VGVzdFV0aWxzLmFib3V0RXF1YWwoIGQucmlnaHQsIGhCb3gucmlnaHQgKSwgJ2QucmlnaHQgc2hvdWxkIGJlIGhCb3gucmlnaHQnICk7XG5cbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgLy8gcGVyLWNlbCBhbGlnbm1lbnRcbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgaEJveC5wcmVmZXJyZWRIZWlnaHQgPSBSRUNUX0hFSUdIVCAqIDI7IC8vIGV4dGVuZCBoZWlnaHQgb2YgdGhlIGNvbnRhaW5lclxuICBhLmxheW91dE9wdGlvbnMgPSB7IGFsaWduOiAndG9wJyB9O1xuICBiLmxheW91dE9wdGlvbnMgPSB7IGFsaWduOiAnYm90dG9tJyB9O1xuICBjLmxheW91dE9wdGlvbnMgPSB7IGFsaWduOiAnY2VudGVyJyB9O1xuICBkLmxheW91dE9wdGlvbnMgPSB7fTtcblxuICBhc3NlcnQub2soIExheW91dFRlc3RVdGlscy5hYm91dEVxdWFsKCBhLnRvcCwgaEJveC50b3AgKSwgJ2EudG9wIHNob3VsZCBiZSBoQm94LnRvcCcgKTtcbiAgYXNzZXJ0Lm9rKCBMYXlvdXRUZXN0VXRpbHMuYWJvdXRFcXVhbCggYi5ib3R0b20sIGhCb3guYm90dG9tICksICdiLmJvdHRvbSBzaG91bGQgYmUgaEJveC5ib3R0b20nICk7XG4gIGFzc2VydC5vayggTGF5b3V0VGVzdFV0aWxzLmFib3V0RXF1YWwoIGMuY2VudGVyWSwgaEJveC5jZW50ZXJZICksICdjLmNlbnRlclkgc2hvdWxkIGJlIGhCb3guY2VudGVyWScgKTtcbiAgYXNzZXJ0Lm9rKCBMYXlvdXRUZXN0VXRpbHMuYWJvdXRFcXVhbCggZC5jZW50ZXJZLCBoQm94LmNlbnRlclkgKSwgJ2QuY2VudGVyWSBzaG91bGQgYmUgaEJveC5jZW50ZXJZJyApO1xuXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIC8vIGNlbGxzIG92ZXJyaWRlIHRoZSBjb250YWluZXJcbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgaEJveC5hbGlnbiA9ICd0b3AnO1xuXG4gIGEubGF5b3V0T3B0aW9ucyA9IHsgYWxpZ246ICdib3R0b20nIH07XG4gIGIubGF5b3V0T3B0aW9ucyA9IHsgYWxpZ246ICdjZW50ZXInIH07XG4gIGMubGF5b3V0T3B0aW9ucyA9IHsgYWxpZ246ICdib3R0b20nIH07XG4gIGQubGF5b3V0T3B0aW9ucyA9IHt9O1xuXG4gIGFzc2VydC5vayggTGF5b3V0VGVzdFV0aWxzLmFib3V0RXF1YWwoIGEuYm90dG9tLCBoQm94LmJvdHRvbSApLCAnYS5ib3R0b20gc2hvdWxkIGJlIGhCb3guYm90dG9tJyApO1xuICBhc3NlcnQub2soIExheW91dFRlc3RVdGlscy5hYm91dEVxdWFsKCBiLmNlbnRlclksIGhCb3guY2VudGVyWSApLCAnYi5jZW50ZXJZIHNob3VsZCBiZSBoQm94LmNlbnRlclknICk7XG4gIGFzc2VydC5vayggTGF5b3V0VGVzdFV0aWxzLmFib3V0RXF1YWwoIGMuYm90dG9tLCBoQm94LmJvdHRvbSApLCAnYy5ib3R0b20gc2hvdWxkIGJlIGhCb3guYm90dG9tJyApO1xuICBhc3NlcnQub2soIExheW91dFRlc3RVdGlscy5hYm91dEVxdWFsKCBkLnRvcCwgaEJveC50b3AgKSwgJ2QudG9wIHNob3VsZCBiZSBoQm94LnRvcCcgKTtcbn0gKTtcblxuUVVuaXQudGVzdCggJ1NlcGFyYXRvcnMnLCBhc3NlcnQgPT4ge1xuICBjb25zdCBtYXJnaW4gPSA1O1xuXG4gIGNvbnN0IFsgYSwgYiwgYywgZCBdID0gTGF5b3V0VGVzdFV0aWxzLmNyZWF0ZVJlY3RhbmdsZXMoIDQgKTtcbiAgY29uc3QgaEJveCA9IG5ldyBIQm94KCB7XG4gICAgbWFyZ2luOiBtYXJnaW5cbiAgfSApO1xuXG4gIGNvbnN0IHZlcmlmeVNlcGFyYXRvckxheW91dCA9ICggc2VwYXJhdG9yV2lkdGg6IG51bWJlciApID0+IHtcbiAgICBhc3NlcnQub2soIExheW91dFRlc3RVdGlscy5hYm91dEVxdWFsKCBiLmxlZnQsIGEucmlnaHQgKyBzZXBhcmF0b3JXaWR0aCArIG1hcmdpbiAqIDQgKSwgJ2IubGVmdCBzaG91bGQgYmUgYS5yaWdodCArIHNlcGFyYXRvcldpZHRoICsgbWFyZ2luICogNCAoZWFjaCBzaWRlIG9mIHJlY3RhbmdsZXMgKyBlYWNoIHNpZGUgb2Ygc2VwYXJhdG9yKScgKTtcbiAgICBhc3NlcnQub2soIExheW91dFRlc3RVdGlscy5hYm91dEVxdWFsKCBjLmxlZnQsIGIucmlnaHQgKyBzZXBhcmF0b3JXaWR0aCArIG1hcmdpbiAqIDQgKSwgJ2MubGVmdCBzaG91bGQgYmUgYi5yaWdodCArIHNlcGFyYXRvcldpZHRoICsgbWFyZ2luICogNCcgKTtcbiAgICBhc3NlcnQub2soIExheW91dFRlc3RVdGlscy5hYm91dEVxdWFsKCBkLmxlZnQsIGMucmlnaHQgKyBzZXBhcmF0b3JXaWR0aCArIG1hcmdpbiAqIDQgKSwgJ2QubGVmdCBzaG91bGQgYmUgYy5yaWdodCArIHNlcGFyYXRvcldpZHRoICsgbWFyZ2luICogNCcgKTtcbiAgfTtcblxuICBjb25zdCB0ZXN0U2VwYXJhdG9yID0gbmV3IFZTZXBhcmF0b3IoKTtcblxuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAvLyBiYXNpYyB0ZXN0c1xuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICBoQm94LmNoaWxkcmVuID0gWyBhLCBuZXcgVlNlcGFyYXRvcigpLCBiLCBuZXcgVlNlcGFyYXRvcigpLCBjLCBuZXcgVlNlcGFyYXRvcigpLCBkIF07XG4gIHZlcmlmeVNlcGFyYXRvckxheW91dCggdGVzdFNlcGFyYXRvci53aWR0aCApO1xuXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIC8vIGR1cGxpY2F0ZSBzZXBhcmF0b3JzIGFyZSByZW1vdmVkXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIGhCb3guY2hpbGRyZW4gPSBbIGEsIG5ldyBWU2VwYXJhdG9yKCksIG5ldyBWU2VwYXJhdG9yKCksIGIsIG5ldyBWU2VwYXJhdG9yKCksIGMsIG5ldyBWU2VwYXJhdG9yKCksIG5ldyBWU2VwYXJhdG9yKCksIGQgXTtcbiAgdmVyaWZ5U2VwYXJhdG9yTGF5b3V0KCB0ZXN0U2VwYXJhdG9yLndpZHRoICk7XG5cbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgLy8gc2VwYXJhdG9ycyBhdCB0aGUgZW5kcyBhcmUgcmVtb3ZlZFxuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICBoQm94LmNoaWxkcmVuID0gWyBuZXcgVlNlcGFyYXRvcigpLCBhLCBuZXcgVlNlcGFyYXRvcigpLCBiLCBuZXcgVlNlcGFyYXRvcigpLCBjLCBuZXcgVlNlcGFyYXRvcigpLCBkLCBuZXcgVlNlcGFyYXRvcigpIF07XG4gIHZlcmlmeVNlcGFyYXRvckxheW91dCggdGVzdFNlcGFyYXRvci53aWR0aCApO1xuICBhc3NlcnQub2soIExheW91dFRlc3RVdGlscy5hYm91dEVxdWFsKCBhLmxlZnQsIGhCb3gubGVmdCArIG1hcmdpbiApLCAnYS5sZWZ0IHNob3VsZCBiZSBoQm94LmxlZnQgKyBtYXJnaW4gKHNlcGFyYXRvciByZW1vdmVkKScgKTtcbiAgYXNzZXJ0Lm9rKCBMYXlvdXRUZXN0VXRpbHMuYWJvdXRFcXVhbCggZC5yaWdodCwgaEJveC5yaWdodCAtIG1hcmdpbiApLCAnZC5yaWdodCBzaG91bGQgYmUgaEJveC5yaWdodCAtIG1hcmdpbiAoc2VwYXJhdG9yIHJlbW92ZWQpJyApO1xuXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIC8vIGN1c3RvbSBzZXBhcmF0b3JzXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIGNvbnN0IGNyZWF0ZUN1c3RvbVNlcGFyYXRvciA9ICgpID0+IG5ldyBSZWN0YW5nbGUoIDAsIDAsIDEwLCAxMCwgeyBsYXlvdXRPcHRpb25zOiB7IGlzU2VwYXJhdG9yOiB0cnVlIH0gfSApO1xuICBjb25zdCB0ZXN0Q3VzdG9tU2VwYXJhdG9yID0gY3JlYXRlQ3VzdG9tU2VwYXJhdG9yKCk7XG5cbiAgLy8gYmFzaWNcbiAgaEJveC5jaGlsZHJlbiA9IFsgYSwgY3JlYXRlQ3VzdG9tU2VwYXJhdG9yKCksIGIsIGNyZWF0ZUN1c3RvbVNlcGFyYXRvcigpLCBjLCBjcmVhdGVDdXN0b21TZXBhcmF0b3IoKSwgZCBdO1xuICB2ZXJpZnlTZXBhcmF0b3JMYXlvdXQoIHRlc3RDdXN0b21TZXBhcmF0b3Iud2lkdGggKTtcblxuICAvLyBkdXBsaWNhdGVzIHJlbW92ZWRcbiAgaEJveC5jaGlsZHJlbiA9IFsgYSwgY3JlYXRlQ3VzdG9tU2VwYXJhdG9yKCksIGNyZWF0ZUN1c3RvbVNlcGFyYXRvcigpLCBiLCBjcmVhdGVDdXN0b21TZXBhcmF0b3IoKSwgYywgY3JlYXRlQ3VzdG9tU2VwYXJhdG9yKCksIGNyZWF0ZUN1c3RvbVNlcGFyYXRvcigpLCBkIF07XG4gIHZlcmlmeVNlcGFyYXRvckxheW91dCggdGVzdEN1c3RvbVNlcGFyYXRvci53aWR0aCApO1xuXG4gIC8vIHNlcGFyYXRvcnMgYXQgdGhlIGVuZHMgYXJlIHJlbW92ZWRcbiAgaEJveC5jaGlsZHJlbiA9IFsgY3JlYXRlQ3VzdG9tU2VwYXJhdG9yKCksIGEsIGNyZWF0ZUN1c3RvbVNlcGFyYXRvcigpLCBiLCBjcmVhdGVDdXN0b21TZXBhcmF0b3IoKSwgYywgY3JlYXRlQ3VzdG9tU2VwYXJhdG9yKCksIGQsIGNyZWF0ZUN1c3RvbVNlcGFyYXRvcigpIF07XG4gIHZlcmlmeVNlcGFyYXRvckxheW91dCggdGVzdEN1c3RvbVNlcGFyYXRvci53aWR0aCApO1xuICBhc3NlcnQub2soIExheW91dFRlc3RVdGlscy5hYm91dEVxdWFsKCBhLmxlZnQsIGhCb3gubGVmdCArIG1hcmdpbiApLCAnYS5sZWZ0IHNob3VsZCBiZSBoQm94LmxlZnQgKyBtYXJnaW4gKHNlcGFyYXRvciByZW1vdmVkKScgKTtcbiAgYXNzZXJ0Lm9rKCBMYXlvdXRUZXN0VXRpbHMuYWJvdXRFcXVhbCggZC5yaWdodCwgaEJveC5yaWdodCAtIG1hcmdpbiApLCAnZC5yaWdodCBzaG91bGQgYmUgaEJveC5yaWdodCAtIG1hcmdpbiAoc2VwYXJhdG9yIHJlbW92ZWQpJyApO1xufSApOyJdLCJuYW1lcyI6WyJSZWN0YW5nbGUiLCJMYXlvdXRUZXN0VXRpbHMiLCJIQm94IiwiVkJveCIsIlZTZXBhcmF0b3IiLCJSRUNUX1dJRFRIIiwiUkVDVF9IRUlHSFQiLCJRVW5pdCIsIm1vZHVsZSIsInRlc3QiLCJhc3NlcnQiLCJhIiwiYiIsImNyZWF0ZVJlY3RhbmdsZXMiLCJoQm94IiwiY2hpbGRyZW4iLCJ2YWxpZGF0ZUJvdW5kcyIsImVxdWFsIiwicmlnaHQiLCJsZWZ0Iiwid2lkdGgiLCJnbG9iYWxCb3VuZHMiLCJkaXNwb3NlIiwidkJveCIsImJvdHRvbSIsInRvcCIsImhlaWdodCIsInJlY3RXaWR0aCIsInJlY3RIZWlnaHQiLCJoQm94Tm9SZXNpemUiLCJyZXNpemUiLCJ2Qm94Tm9SZXNpemUiLCJjIiwiZCIsImUiLCJ2aXNpYmxlIiwiaEJveEludmlzaWJsZSIsInNldEV4Y2x1ZGVJbnZpc2libGVDaGlsZHJlbkZyb21Cb3VuZHMiLCJub3RFcXVhbCIsImluZGV4Iiwic2l6YWJsZSIsImxvY2FsTWluaW11bVdpZHRoIiwibG9jYWxNaW5pbXVtSGVpZ2h0IiwicHJlZmVycmVkV2lkdGgiLCJsYXlvdXRPcHRpb25zIiwiZ3JvdyIsImV4dHJhU3BhY2UiLCJleHBlY3RlZEFXaWR0aCIsImV4cGVjdGVkQldpZHRoIiwiZXhwZWN0ZWRDV2lkdGgiLCJwcmVmZXJyZWRIZWlnaHQiLCJzdHJldGNoIiwibWF4Q29udGVudFdpZHRoIiwibWF4Q29udGVudEhlaWdodCIsInJlbWFpbmluZ1dpZHRoIiwiZiIsImciLCJoQm94V2l0aENvbnN0cmFpbnQiLCJtaW5Db250ZW50V2lkdGgiLCJ2Qm94V2l0aENvbnN0cmFpbnQiLCJjb21iaW5lZEJveCIsImp1c3RpZnkiLCJvayIsImFib3V0RXF1YWwiLCJ0b3RhbFNwYWNlIiwic2lkZVNwYWNpbmciLCJzcGFjZUJldHdlZW4iLCJyZW1haW5pbmdTcGFjZSIsImhhbGZSZW1haW5pbmdTcGFjZSIsIndyYXAiLCJhbGlnbiIsImNlbnRlclkiLCJqdXN0aWZ5TGluZXMiLCJzcGFjaW5nIiwibGluZVNwYWNpbmciLCJtYXJnaW4iLCJsZWZ0TWFyZ2luIiwidG9wTWFyZ2luIiwidmVyaWZ5U2VwYXJhdG9yTGF5b3V0Iiwic2VwYXJhdG9yV2lkdGgiLCJ0ZXN0U2VwYXJhdG9yIiwiY3JlYXRlQ3VzdG9tU2VwYXJhdG9yIiwiaXNTZXBhcmF0b3IiLCJ0ZXN0Q3VzdG9tU2VwYXJhdG9yIl0sIm1hcHBpbmdzIjoiQUFBQSxpREFBaUQ7QUFFakQ7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Q0FtQkMsR0FFRCxPQUFPQSxlQUFlLDJCQUEyQjtBQUNqRCxPQUFPQyxxQkFBcUIsd0JBQXdCO0FBQ3BELE9BQU9DLFVBQVUsWUFBWTtBQUM3QixPQUFPQyxVQUFVLFlBQVk7QUFDN0IsT0FBT0MsZ0JBQWdCLGtCQUFrQjtBQUV6QyxNQUFNQyxhQUFhSixnQkFBZ0JJLFVBQVU7QUFDN0MsTUFBTUMsY0FBY0wsZ0JBQWdCSyxXQUFXO0FBRS9DQyxNQUFNQyxNQUFNLENBQUU7QUFFZEQsTUFBTUUsSUFBSSxDQUFFLHlCQUF5QkMsQ0FBQUE7SUFFbkMsTUFBTSxDQUFFQyxHQUFHQyxFQUFHLEdBQUdYLGdCQUFnQlksZ0JBQWdCLENBQUU7SUFFbkQsTUFBTUMsT0FBTyxJQUFJWixLQUFNO1FBQUVhLFVBQVU7WUFBRUo7WUFBR0M7U0FBRztJQUFDO0lBQzVDRSxLQUFLRSxjQUFjO0lBRW5CTixPQUFPTyxLQUFLLENBQUVOLEVBQUVPLEtBQUssRUFBRU4sRUFBRU8sSUFBSSxFQUFFO0lBQy9CVCxPQUFPTyxLQUFLLENBQUVMLEVBQUVPLElBQUksRUFBRVIsRUFBRVMsS0FBSyxFQUFFO0lBRS9CLGdEQUFnRDtJQUNoRE4sS0FBS0ssSUFB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