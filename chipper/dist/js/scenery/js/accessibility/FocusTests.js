// Copyright 2017-2023, University of Colorado Boulder
/**
 * Focus tests
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */ import { Display, FocusManager, Node, Trail } from '../imports.js';
QUnit.module('Focus');
// Arrays of items of the type { trail: {Trail}, children: {Array.<Item>} }
function nestedEquality(assert, a, b) {
    assert.equal(a.length, b.length);
    for(let i = 0; i < a.length; i++){
        const aItem = a[i];
        const bItem = b[i];
        if (aItem.trail && bItem.trail) {
            assert.ok(aItem.trail.equals(bItem.trail));
        }
        nestedEquality(assert, aItem.children, bItem.children);
    }
}
QUnit.test('Simple Test', (assert)=>{
    const a1 = new Node({
        tagName: 'div'
    });
    const a2 = new Node({
        tagName: 'div'
    });
    const b1 = new Node({
        tagName: 'div'
    });
    const b2 = new Node({
        tagName: 'div'
    });
    const a = new Node({
        children: [
            a1,
            a2
        ]
    });
    const b = new Node({
        children: [
            b1,
            b2
        ]
    });
    const root = new Node({
        children: [
            a,
            b
        ]
    });
    const nestedOrder = root.getNestedPDOMOrder();
    nestedEquality(assert, nestedOrder, [
        {
            trail: new Trail([
                root,
                a,
                a1
            ]),
            children: []
        },
        {
            trail: new Trail([
                root,
                a,
                a2
            ]),
            children: []
        },
        {
            trail: new Trail([
                root,
                b,
                b1
            ]),
            children: []
        },
        {
            trail: new Trail([
                root,
                b,
                b2
            ]),
            children: []
        }
    ]);
});
QUnit.test('pdomOrder Simple Test', (assert)=>{
    const a1 = new Node({
        tagName: 'div'
    });
    const a2 = new Node({
        tagName: 'div'
    });
    const b1 = new Node({
        tagName: 'div'
    });
    const b2 = new Node({
        tagName: 'div'
    });
    const a = new Node({
        children: [
            a1,
            a2
        ]
    });
    const b = new Node({
        children: [
            b1,
            b2
        ]
    });
    const root = new Node({
        children: [
            a,
            b
        ],
        pdomOrder: [
            b,
            a
        ]
    });
    const nestedOrder = root.getNestedPDOMOrder();
    nestedEquality(assert, nestedOrder, [
        {
            trail: new Trail([
                root,
                b,
                b1
            ]),
            children: []
        },
        {
            trail: new Trail([
                root,
                b,
                b2
            ]),
            children: []
        },
        {
            trail: new Trail([
                root,
                a,
                a1
            ]),
            children: []
        },
        {
            trail: new Trail([
                root,
                a,
                a2
            ]),
            children: []
        }
    ]);
});
QUnit.test('pdomOrder Descendant Test', (assert)=>{
    const a1 = new Node({
        tagName: 'div'
    });
    const a2 = new Node({
        tagName: 'div'
    });
    const b1 = new Node({
        tagName: 'div'
    });
    const b2 = new Node({
        tagName: 'div'
    });
    const a = new Node({
        children: [
            a1,
            a2
        ]
    });
    const b = new Node({
        children: [
            b1,
            b2
        ]
    });
    const root = new Node({
        children: [
            a,
            b
        ],
        pdomOrder: [
            a1,
            b1,
            a2,
            b2
        ]
    });
    const nestedOrder = root.getNestedPDOMOrder();
    nestedEquality(assert, nestedOrder, [
        {
            trail: new Trail([
                root,
                a,
                a1
            ]),
            children: []
        },
        {
            trail: new Trail([
                root,
                b,
                b1
            ]),
            children: []
        },
        {
            trail: new Trail([
                root,
                a,
                a2
            ]),
            children: []
        },
        {
            trail: new Trail([
                root,
                b,
                b2
            ]),
            children: []
        }
    ]);
});
QUnit.test('pdomOrder Descendant Pruning Test', (assert)=>{
    const a1 = new Node({
        tagName: 'div'
    });
    const a2 = new Node({
        tagName: 'div'
    });
    const b1 = new Node({
        tagName: 'div'
    });
    const b2 = new Node({
        tagName: 'div'
    });
    const c1 = new Node({
        tagName: 'div'
    });
    const c2 = new Node({
        tagName: 'div'
    });
    const c = new Node({
        children: [
            c1,
            c2
        ]
    });
    const a = new Node({
        children: [
            a1,
            a2,
            c
        ]
    });
    const b = new Node({
        children: [
            b1,
            b2
        ]
    });
    const root = new Node({
        children: [
            a,
            b
        ],
        pdomOrder: [
            c1,
            a,
            a2,
            b2
        ]
    });
    const nestedOrder = root.getNestedPDOMOrder();
    nestedEquality(assert, nestedOrder, [
        {
            trail: new Trail([
                root,
                a,
                c,
                c1
            ]),
            children: []
        },
        {
            trail: new Trail([
                root,
                a,
                a1
            ]),
            children: []
        },
        {
            trail: new Trail([
                root,
                a,
                c,
                c2
            ]),
            children: []
        },
        {
            trail: new Trail([
                root,
                a,
                a2
            ]),
            children: []
        },
        {
            trail: new Trail([
                root,
                b,
                b2
            ]),
            children: []
        },
        {
            trail: new Trail([
                root,
                b,
                b1
            ]),
            children: []
        }
    ]);
});
QUnit.test('pdomOrder Descendant Override', (assert)=>{
    const a1 = new Node({
        tagName: 'div'
    });
    const a2 = new Node({
        tagName: 'div'
    });
    const b1 = new Node({
        tagName: 'div'
    });
    const b2 = new Node({
        tagName: 'div'
    });
    const a = new Node({
        children: [
            a1,
            a2
        ]
    });
    const b = new Node({
        children: [
            b1,
            b2
        ],
        pdomOrder: [
            b1,
            b2
        ]
    });
    const root = new Node({
        children: [
            a,
            b
        ],
        pdomOrder: [
            b,
            b1,
            a
        ]
    });
    const nestedOrder = root.getNestedPDOMOrder();
    nestedEquality(assert, nestedOrder, [
        {
            trail: new Trail([
                root,
                b,
                b2
            ]),
            children: []
        },
        {
            trail: new Trail([
                root,
                b,
                b1
            ]),
            children: []
        },
        {
            trail: new Trail([
                root,
                a,
                a1
            ]),
            children: []
        },
        {
            trail: new Trail([
                root,
                a,
                a2
            ]),
            children: []
        }
    ]);
});
QUnit.test('pdomOrder Hierarchy', (assert)=>{
    const a1 = new Node({
        tagName: 'div'
    });
    const a2 = new Node({
        tagName: 'div'
    });
    const b1 = new Node({
        tagName: 'div'
    });
    const b2 = new Node({
        tagName: 'div'
    });
    const a = new Node({
        children: [
            a1,
            a2
        ],
        pdomOrder: [
            a2
        ]
    });
    const b = new Node({
        children: [
            b1,
            b2
        ],
        pdomOrder: [
            b2,
            b1
        ]
    });
    const root = new Node({
        children: [
            a,
            b
        ],
        pdomOrder: [
            b,
            a
        ]
    });
    const nestedOrder = root.getNestedPDOMOrder();
    nestedEquality(assert, nestedOrder, [
        {
            trail: new Trail([
                root,
                b,
                b2
            ]),
            children: []
        },
        {
            trail: new Trail([
                root,
                b,
                b1
            ]),
            children: []
        },
        {
            trail: new Trail([
                root,
                a,
                a2
            ]),
            children: []
        },
        {
            trail: new Trail([
                root,
                a,
                a1
            ]),
            children: []
        }
    ]);
});
QUnit.test('pdomOrder DAG test', (assert)=>{
    const a1 = new Node({
        tagName: 'div'
    });
    const a2 = new Node({
        tagName: 'div'
    });
    const a = new Node({
        children: [
            a1,
            a2
        ],
        pdomOrder: [
            a2,
            a1
        ]
    });
    const b = new Node({
        children: [
            a1,
            a2
        ],
        pdomOrder: [
            a1,
            a2
        ]
    });
    const root = new Node({
        children: [
            a,
            b
        ]
    });
    const nestedOrder = root.getNestedPDOMOrder();
    nestedEquality(assert, nestedOrder, [
        {
            trail: new Trail([
                root,
                a,
                a2
            ]),
            children: []
        },
        {
            trail: new Trail([
                root,
                a,
                a1
            ]),
            children: []
        },
        {
            trail: new Trail([
                root,
                b,
                a1
            ]),
            children: []
        },
        {
            trail: new Trail([
                root,
                b,
                a2
            ]),
            children: []
        }
    ]);
});
QUnit.test('pdomOrder DAG test', (assert)=>{
    const x = new Node();
    const a = new Node();
    const b = new Node();
    const c = new Node();
    const d = new Node({
        tagName: 'div'
    });
    const e = new Node();
    const f = new Node({
        tagName: 'div'
    });
    const g = new Node({
        tagName: 'div'
    });
    const h = new Node({
        tagName: 'div'
    });
    const i = new Node({
        tagName: 'div'
    });
    const j = new Node({
        tagName: 'div'
    });
    const k = new Node({
        tagName: 'div'
    });
    const l = new Node();
    x.children = [
        a
    ];
    a.children = [
        k,
        b,
        c
    ];
    b.children = [
        d,
        e
    ];
    c.children = [
        e
    ];
    e.children = [
        j,
        f,
        g
    ];
    f.children = [
        h,
        i
    ];
    x.pdomOrder = [
        f,
        c,
        d,
        l
    ];
    a.pdomOrder = [
        c,
        b
    ];
    e.pdomOrder = [
        g,
        f,
        j
    ];
    const nestedOrder = x.getNestedPDOMOrder();
    nestedEquality(assert, nestedOrder, [
        // x order's F
        {
            trail: new Trail([
                x,
                a,
                b,
                e,
                f
            ]),
            children: [
                {
                    trail: new Trail([
                        x,
                        a,
                        b,
                        e,
                        f,
                        h
                    ]),
                    children: []
                },
                {
                    trail: new Trail([
                        x,
                        a,
                        b,
                        e,
                        f,
                        i
                    ]),
                    children: []
                }
            ]
        },
        {
            trail: new Trail([
                x,
                a,
                c,
                e,
                f
            ]),
            children: [
                {
                    trail: new Trail([
                        x,
                        a,
                        c,
                        e,
                        f,
                        h
                    ]),
                    children: []
                },
                {
                    trail: new Trail([
                        x,
                        a,
                        c,
                        e,
                        f,
                        i
                    ]),
                    children: []
                }
            ]
        },
        // X order's C
        {
            trail: new Trail([
                x,
                a,
                c,
                e,
                g
            ]),
            children: []
        },
        {
            trail: new Trail([
                x,
                a,
                c,
                e,
                j
            ]),
            children: []
        },
        // X order's D
        {
            trail: new Trail([
                x,
                a,
                b,
                d
            ]),
            children: []
        },
        // X everything else
        {
            trail: new Trail([
                x,
                a,
                b,
                e,
                g
            ]),
            children: []
        },
        {
            trail: new Trail([
                x,
                a,
                b,
                e,
                j
            ]),
            children: []
        },
        {
            trail: new Trail([
                x,
                a,
                k
            ]),
            children: []
        }
    ]);
});
QUnit.test('setting pdomOrder', (assert)=>{
    const rootNode = new Node();
    var display = new Display(rootNode); // eslint-disable-line no-var
    document.body.appendChild(display.domElement);
    const a = new Node({
        tagName: 'div'
    });
    const b = new Node({
        tagName: 'div'
    });
    const c = new Node({
        tagName: 'div'
    });
    const d = new Node({
        tagName: 'div'
    });
    rootNode.children = [
        a,
        b,
        c,
        d
    ];
    // reverse accessible order
    rootNode.pdomOrder = [
        d,
        c,
        b,
        a
    ];
    assert.ok(display._rootPDOMInstance, 'should exist');
    const divRoot = display._rootPDOMInstance.peer.primarySibling;
    const divA = a.pdomInstances[0].peer.primarySibling;
    const divB = b.pdomInstances[0].peer.primarySibling;
    const divC = c.pdomInstances[0].peer.primarySibling;
    const divD = d.pdomInstances[0].peer.primarySibling;
    assert.ok(divRoot.children[0] === divD, 'divD should be first child');
    assert.ok(divRoot.children[1] === divC, 'divC should be second child');
    assert.ok(divRoot.children[2] === divB, 'divB should be third child');
    assert.ok(divRoot.children[3] === divA, 'divA should be fourth child');
    display.dispose();
    display.domElement.parentElement.removeChild(display.domElement);
});
QUnit.test('setting pdomOrder before setting accessible content', (assert)=>{
    const rootNode = new Node();
    var display = new Display(rootNode); // eslint-disable-line no-var
    document.body.appendChild(display.domElement);
    const a = new Node();
    const b = new Node();
    const c = new Node();
    const d = new Node();
    rootNode.children = [
        a,
        b,
        c,
        d
    ];
    // reverse accessible order
    rootNode.pdomOrder = [
        d,
        c,
        b,
        a
    ];
    a.tagName = 'div';
    b.tagName = 'div';
    c.tagName = 'div';
    d.tagName = 'div';
    const divRoot = display._rootPDOMInstance.peer.primarySibling;
    const divA = a.pdomInstances[0].peer.primarySibling;
    const divB = b.pdomInstances[0].peer.primarySibling;
    const divC = c.pdomInstances[0].peer.primarySibling;
    const divD = d.pdomInstances[0].peer.primarySibling;
    assert.ok(divRoot.children[0] === divD, 'divD should be first child');
    assert.ok(divRoot.children[1] === divC, 'divC should be second child');
    assert.ok(divRoot.children[2] === divB, 'divB should be third child');
    assert.ok(divRoot.children[3] === divA, 'divA should be fourth child');
    display.dispose();
    display.domElement.parentElement.removeChild(display.domElement);
});
QUnit.test('setting accessible order on nodes with no accessible content', (assert)=>{
    const rootNode = new Node();
    var display = new Display(rootNode); // eslint-disable-line no-var
    document.body.appendChild(display.domElement);
    // root
    //    a
    //      b
    //     c   e
    //        d  f
    const a = new Node({
        tagName: 'div'
    });
    const b = new Node({
        tagName: 'div'
    });
    const c = new Node({
        tagName: 'div'
    });
    const d = new Node({
        tagName: 'div'
    });
    const e = new Node({
        tagName: 'div'
    });
    const f = new Node({
        tagName: 'div'
    });
    rootNode.addChild(a);
    a.addChild(b);
    b.addChild(c);
    b.addChild(e);
    c.addChild(d);
    c.addChild(f);
    b.pdomOrder = [
        e,
        c
    ];
    const divB = b.pdomInstances[0].peer.primarySibling;
    const divC = c.pdomInstances[0].peer.primarySibling;
    const divE = e.pdomInstances[0].peer.primarySibling;
    assert.ok(divB.children[0] === divE, 'div E should be first child of div B');
    assert.ok(divB.children[1] === divC, 'div C should be second child of div B');
    display.dispose();
    display.domElement.parentElement.removeChild(display.domElement);
});
QUnit.test('setting accessible order on nodes with no accessible content', (assert)=>{
    const rootNode = new Node();
    const display = new Display(rootNode);
    document.body.appendChild(display.domElement);
    const a = new Node({
        tagName: 'div'
    });
    const b = new Node();
    const c = new Node({
        tagName: 'div'
    });
    const d = new Node({
        tagName: 'div'
    });
    const e = new Node({
        tagName: 'div'
    });
    const f = new Node({
        tagName: 'div'
    });
    rootNode.addChild(a);
    a.addChild(b);
    b.addChild(c);
    b.addChild(e);
    c.addChild(d);
    c.addChild(f);
    a.pdomOrder = [
        e,
        c
    ];
    const divA = a.pdomInstances[0].peer.primarySibling;
    const divC = c.pdomInstances[0].peer.primarySibling;
    const divE = e.pdomInstances[0].peer.primarySibling;
    assert.ok(divA.children[0] === divE, 'div E should be first child of div B');
    assert.ok(divA.children[1] === divC, 'div C should be second child of div B');
    display.dispose();
    display.domElement.parentElement.removeChild(display.domElement);
});
QUnit.test('setting accessible order on a Node with focus', (assert)=>{
    if (!document.hasFocus()) {
        assert.ok(true, 'Opting out of test because document does not have focus');
        return;
    }
    const rootNode = new Node();
    const display = new Display(rootNode);
    display.initializeEvents();
    document.body.appendChild(display.domElement);
    const a1 = new Node({
        tagName: 'div'
    });
    const b1 = new Node({
        tagName: 'div',
        focusable: true
    });
    const c1 = new Node({
        tagName: 'div',
        focusable: true
    });
    const d1 = new Node({
        tagName: 'div',
        focusable: true
    });
    const d2 = new Node({
        tagName: 'div',
        focusable: true
    });
    const d3 = new Node({
        tagName: 'div',
        focusable: true
    });
    const d4 = new Node({
        tagName: 'div',
        focusable: true
    });
    // a scene graph where d nodes are children of b, but will be moved under c in the pdomOrder
    rootNode.addChild(a1);
    a1.children = [
        b1,
        c1
    ];
    b1.children = [
        d1,
        d2,
        d3,
        d4
    ];
    d1.focus();
    assert.ok(d1.focused, 'd1 should be focused');
    b1.pdomOrder = [
        d3,
        d4
    ];
    assert.ok(d1.focused, 'd1 should still have focus after order change');
    b1.pdomOrder = null;
    c1.pdomOrder = [
        d4,
        d3,
        d2,
        d1
    ];
    assert.ok(d1.focused, 'd1 should still have focus after order change');
    c1.pdomOrder = null;
    a1.pdomOrder = [
        d1,
        d2,
        d3
    ];
    assert.ok(d1.focused, 'd1 should still have focus after order change');
    display.detachEvents();
});
QUnit.test('pdomOrder with reentrant events', (assert)=>{
    if (!document.hasFocus()) {
        assert.ok(true, 'Opting out of test because document does not have focus');
        return;
    }
    const rootNode = new Node();
    const display = new Display(rootNode);
    display.initializeEvents();
    document.body.appendChild(display.domElement);
    const a1 = new Node({
        tagName: 'div'
    });
    const b1 = new Node({
        tagName: 'button',
        focusable: true
    });
    const c1 = new Node({
        tagName: 'div',
        focusable: true
    });
    const d1 = new Node({
        tagName: 'div',
        focusable: true
    });
    const d2 = new Node({
        tagName: 'div',
        focusable: true
    });
    const getDOMElement = (node)=>node.pdomInstances[0].peer.primarySibling;
    rootNode.addChild(a1);
    a1.children = [
        b1,
        c1
    ];
    b1.children = [
        d1
    ];
    b1.addInputListener({
        click: (event)=>{
            // focus another thing, inside of the click listener - generates reentrant events
            d1.focus();
            assert.ok(d1.focused, 'd1 should have focus even though focus was set in a reentrant event');
            assert.ok(FocusManager.pdomFocusedNode === d1, 'pdomFocusedNode should be correct during reentrant events');
            assert.ok(document.activeElement === getDOMElement(d1), 'activeElement should be correct during reentrant events');
            // change the trail to the Node
            a1.pdomOrder = [
                d1,
                d2,
                null
            ];
            // verify that focus is still correct after PDOM rearrangement
            assert.ok(d1.focused, 'd1 should still trail change operations in reentrant events');
        }
    });
    // Focus the button and trigger a click
    b1.focus();
    getDOMElement(b1).click();
    assert.ok(true, 'dummy test that should run after click events');
    b1.blur();
    display.detachEvents();
});
QUnit.test('Testing FocusManager.windowHasFocusProperty', (assert)=>{
    // detach the FocusManager first just in case it was attached by a previous test
    FocusManager.detachFromWindow();
    const rootNode = new Node();
    const display = new Display(rootNode);
    document.body.appendChild(display.domElement);
    const focusableNode = new Node({
        tagName: 'button'
    });
    rootNode.addChild(focusableNode);
    assert.ok(!FocusManager.windowHasFocusProperty.value, 'should not have focus at start');
    // First, test detachFromWindow, once focus is in the window it is impossible to remove it from
    // the window with JavaScript.
    FocusManager.attachToWindow();
    FocusManager.detachFromWindow();
    assert.ok(!FocusManager.windowHasFocusProperty.value, 'should not have focus after detaching');
    focusableNode.focus();
    assert.ok(!FocusManager.windowHasFocusProperty.value, 'Should not be watching window focus changes after detaching');
    // now test changes to windowHasFocusProperty - window focus listeners will only work if tests are being run
    // in the foreground (dev cannot be using dev tools, running in puppeteer, minimized, etc...)
    if (document.hasFocus()) {
        FocusManager.attachToWindow();
        assert.ok(FocusManager.windowHasFocusProperty.value, 'Focus was moved into window from previous tests, this attach should reflect window already has focus.');
        focusableNode.focus();
        assert.ok(FocusManager.windowHasFocusProperty.value, 'Window has focus, is now in the foreground');
        focusableNode.blur();
        assert.ok(FocusManager.windowHasFocusProperty.value, 'window still has focus after a blur (focus on body)');
    // NOTE - don't detach the FocusManager here, it is globally attached and it needs to beused
    // for other tests
    }
});

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvYWNjZXNzaWJpbGl0eS9Gb2N1c1Rlc3RzLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE3LTIwMjMsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIEZvY3VzIHRlc3RzXG4gKlxuICogQGF1dGhvciBTYW0gUmVpZCAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcbiAqL1xuXG5pbXBvcnQgeyBEaXNwbGF5LCBGb2N1c01hbmFnZXIsIE5vZGUsIFRyYWlsIH0gZnJvbSAnLi4vaW1wb3J0cy5qcyc7XG5cblFVbml0Lm1vZHVsZSggJ0ZvY3VzJyApO1xuXG50eXBlIEVxdWFsaXR5SXRlbSA9IHtcbiAgdHJhaWw/OiBUcmFpbDtcbiAgY2hpbGRyZW46IE5vZGVbXTtcbn07XG5cbnR5cGUgTmVzdGVkRXF1YWxpdHlJdGVtID0ge1xuICB0cmFpbD86IFRyYWlsO1xuICBjaGlsZHJlbjogTmVzdGVkRXF1YWxpdHlJdGVtW107XG59O1xuXG4vLyBBcnJheXMgb2YgaXRlbXMgb2YgdGhlIHR5cGUgeyB0cmFpbDoge1RyYWlsfSwgY2hpbGRyZW46IHtBcnJheS48SXRlbT59IH1cbmZ1bmN0aW9uIG5lc3RlZEVxdWFsaXR5KCBhc3NlcnQ6IEFzc2VydCwgYTogRXF1YWxpdHlJdGVtW10sIGI6IE5lc3RlZEVxdWFsaXR5SXRlbVtdICk6IHZvaWQge1xuICBhc3NlcnQuZXF1YWwoIGEubGVuZ3RoLCBiLmxlbmd0aCApO1xuXG4gIGZvciAoIGxldCBpID0gMDsgaSA8IGEubGVuZ3RoOyBpKysgKSB7XG4gICAgY29uc3QgYUl0ZW0gPSBhWyBpIF07XG4gICAgY29uc3QgYkl0ZW0gPSBiWyBpIF07XG5cbiAgICBpZiAoIGFJdGVtLnRyYWlsICYmIGJJdGVtLnRyYWlsICkge1xuICAgICAgYXNzZXJ0Lm9rKCBhSXRlbS50cmFpbC5lcXVhbHMoIGJJdGVtLnRyYWlsICkgKTtcbiAgICB9XG5cbiAgICBuZXN0ZWRFcXVhbGl0eSggYXNzZXJ0LCBhSXRlbS5jaGlsZHJlbiwgYkl0ZW0uY2hpbGRyZW4gKTtcbiAgfVxufVxuXG5RVW5pdC50ZXN0KCAnU2ltcGxlIFRlc3QnLCBhc3NlcnQgPT4ge1xuXG4gIGNvbnN0IGExID0gbmV3IE5vZGUoIHsgdGFnTmFtZTogJ2RpdicgfSApO1xuICBjb25zdCBhMiA9IG5ldyBOb2RlKCB7IHRhZ05hbWU6ICdkaXYnIH0gKTtcblxuICBjb25zdCBiMSA9IG5ldyBOb2RlKCB7IHRhZ05hbWU6ICdkaXYnIH0gKTtcbiAgY29uc3QgYjIgPSBuZXcgTm9kZSggeyB0YWdOYW1lOiAnZGl2JyB9ICk7XG5cbiAgY29uc3QgYSA9IG5ldyBOb2RlKCB7IGNoaWxkcmVuOiBbIGExLCBhMiBdIH0gKTtcbiAgY29uc3QgYiA9IG5ldyBOb2RlKCB7IGNoaWxkcmVuOiBbIGIxLCBiMiBdIH0gKTtcblxuICBjb25zdCByb290ID0gbmV3IE5vZGUoIHsgY2hpbGRyZW46IFsgYSwgYiBdIH0gKTtcblxuICBjb25zdCBuZXN0ZWRPcmRlciA9IHJvb3QuZ2V0TmVzdGVkUERPTU9yZGVyKCk7XG5cbiAgbmVzdGVkRXF1YWxpdHkoIGFzc2VydCwgbmVzdGVkT3JkZXIsIFtcbiAgICB7IHRyYWlsOiBuZXcgVHJhaWwoIFsgcm9vdCwgYSwgYTEgXSApLCBjaGlsZHJlbjogW10gfSxcbiAgICB7IHRyYWlsOiBuZXcgVHJhaWwoIFsgcm9vdCwgYSwgYTIgXSApLCBjaGlsZHJlbjogW10gfSxcbiAgICB7IHRyYWlsOiBuZXcgVHJhaWwoIFsgcm9vdCwgYiwgYjEgXSApLCBjaGlsZHJlbjogW10gfSxcbiAgICB7IHRyYWlsOiBuZXcgVHJhaWwoIFsgcm9vdCwgYiwgYjIgXSApLCBjaGlsZHJlbjogW10gfVxuICBdICk7XG59ICk7XG5cblFVbml0LnRlc3QoICdwZG9tT3JkZXIgU2ltcGxlIFRlc3QnLCBhc3NlcnQgPT4ge1xuXG4gIGNvbnN0IGExID0gbmV3IE5vZGUoIHsgdGFnTmFtZTogJ2RpdicgfSApO1xuICBjb25zdCBhMiA9IG5ldyBOb2RlKCB7IHRhZ05hbWU6ICdkaXYnIH0gKTtcblxuICBjb25zdCBiMSA9IG5ldyBOb2RlKCB7IHRhZ05hbWU6ICdkaXYnIH0gKTtcbiAgY29uc3QgYjIgPSBuZXcgTm9kZSggeyB0YWdOYW1lOiAnZGl2JyB9ICk7XG5cbiAgY29uc3QgYSA9IG5ldyBOb2RlKCB7IGNoaWxkcmVuOiBbIGExLCBhMiBdIH0gKTtcbiAgY29uc3QgYiA9IG5ldyBOb2RlKCB7IGNoaWxkcmVuOiBbIGIxLCBiMiBdIH0gKTtcblxuICBjb25zdCByb290ID0gbmV3IE5vZGUoIHsgY2hpbGRyZW46IFsgYSwgYiBdLCBwZG9tT3JkZXI6IFsgYiwgYSBdIH0gKTtcblxuICBjb25zdCBuZXN0ZWRPcmRlciA9IHJvb3QuZ2V0TmVzdGVkUERPTU9yZGVyKCk7XG5cbiAgbmVzdGVkRXF1YWxpdHkoIGFzc2VydCwgbmVzdGVkT3JkZXIsIFtcbiAgICB7IHRyYWlsOiBuZXcgVHJhaWwoIFsgcm9vdCwgYiwgYjEgXSApLCBjaGlsZHJlbjogW10gfSxcbiAgICB7IHRyYWlsOiBuZXcgVHJhaWwoIFsgcm9vdCwgYiwgYjIgXSApLCBjaGlsZHJlbjogW10gfSxcbiAgICB7IHRyYWlsOiBuZXcgVHJhaWwoIFsgcm9vdCwgYSwgYTEgXSApLCBjaGlsZHJlbjogW10gfSxcbiAgICB7IHRyYWlsOiBuZXcgVHJhaWwoIFsgcm9vdCwgYSwgYTIgXSApLCBjaGlsZHJlbjogW10gfVxuICBdICk7XG59ICk7XG5cblFVbml0LnRlc3QoICdwZG9tT3JkZXIgRGVzY2VuZGFudCBUZXN0JywgYXNzZXJ0ID0+IHtcblxuICBjb25zdCBhMSA9IG5ldyBOb2RlKCB7IHRhZ05hbWU6ICdkaXYnIH0gKTtcbiAgY29uc3QgYTIgPSBuZXcgTm9kZSggeyB0YWdOYW1lOiAnZGl2JyB9ICk7XG5cbiAgY29uc3QgYjEgPSBuZXcgTm9kZSggeyB0YWdOYW1lOiAnZGl2JyB9ICk7XG4gIGNvbnN0IGIyID0gbmV3IE5vZGUoIHsgdGFnTmFtZTogJ2RpdicgfSApO1xuXG4gIGNvbnN0IGEgPSBuZXcgTm9kZSggeyBjaGlsZHJlbjogWyBhMSwgYTIgXSB9ICk7XG4gIGNvbnN0IGIgPSBuZXcgTm9kZSggeyBjaGlsZHJlbjogWyBiMSwgYjIgXSB9ICk7XG5cbiAgY29uc3Qgcm9vdCA9IG5ldyBOb2RlKCB7IGNoaWxkcmVuOiBbIGEsIGIgXSwgcGRvbU9yZGVyOiBbIGExLCBiMSwgYTIsIGIyIF0gfSApO1xuXG4gIGNvbnN0IG5lc3RlZE9yZGVyID0gcm9vdC5nZXROZXN0ZWRQRE9NT3JkZXIoKTtcblxuICBuZXN0ZWRFcXVhbGl0eSggYXNzZXJ0LCBuZXN0ZWRPcmRlciwgW1xuICAgIHsgdHJhaWw6IG5ldyBUcmFpbCggWyByb290LCBhLCBhMSBdICksIGNoaWxkcmVuOiBbXSB9LFxuICAgIHsgdHJhaWw6IG5ldyBUcmFpbCggWyByb290LCBiLCBiMSBdICksIGNoaWxkcmVuOiBbXSB9LFxuICAgIHsgdHJhaWw6IG5ldyBUcmFpbCggWyByb290LCBhLCBhMiBdICksIGNoaWxkcmVuOiBbXSB9LFxuICAgIHsgdHJhaWw6IG5ldyBUcmFpbCggWyByb290LCBiLCBiMiBdICksIGNoaWxkcmVuOiBbXSB9XG4gIF0gKTtcbn0gKTtcblxuUVVuaXQudGVzdCggJ3Bkb21PcmRlciBEZXNjZW5kYW50IFBydW5pbmcgVGVzdCcsIGFzc2VydCA9PiB7XG5cbiAgY29uc3QgYTEgPSBuZXcgTm9kZSggeyB0YWdOYW1lOiAnZGl2JyB9ICk7XG4gIGNvbnN0IGEyID0gbmV3IE5vZGUoIHsgdGFnTmFtZTogJ2RpdicgfSApO1xuXG4gIGNvbnN0IGIxID0gbmV3IE5vZGUoIHsgdGFnTmFtZTogJ2RpdicgfSApO1xuICBjb25zdCBiMiA9IG5ldyBOb2RlKCB7IHRhZ05hbWU6ICdkaXYnIH0gKTtcblxuICBjb25zdCBjMSA9IG5ldyBOb2RlKCB7IHRhZ05hbWU6ICdkaXYnIH0gKTtcbiAgY29uc3QgYzIgPSBuZXcgTm9kZSggeyB0YWdOYW1lOiAnZGl2JyB9ICk7XG5cbiAgY29uc3QgYyA9IG5ldyBOb2RlKCB7IGNoaWxkcmVuOiBbIGMxLCBjMiBdIH0gKTtcblxuICBjb25zdCBhID0gbmV3IE5vZGUoIHsgY2hpbGRyZW46IFsgYTEsIGEyLCBjIF0gfSApO1xuICBjb25zdCBiID0gbmV3IE5vZGUoIHsgY2hpbGRyZW46IFsgYjEsIGIyIF0gfSApO1xuXG4gIGNvbnN0IHJvb3QgPSBuZXcgTm9kZSggeyBjaGlsZHJlbjogWyBhLCBiIF0sIHBkb21PcmRlcjogWyBjMSwgYSwgYTIsIGIyIF0gfSApO1xuXG4gIGNvbnN0IG5lc3RlZE9yZGVyID0gcm9vdC5nZXROZXN0ZWRQRE9NT3JkZXIoKTtcblxuICBuZXN0ZWRFcXVhbGl0eSggYXNzZXJ0LCBuZXN0ZWRPcmRlciwgW1xuICAgIHsgdHJhaWw6IG5ldyBUcmFpbCggWyByb290LCBhLCBjLCBjMSBdICksIGNoaWxkcmVuOiBbXSB9LFxuICAgIHsgdHJhaWw6IG5ldyBUcmFpbCggWyByb290LCBhLCBhMSBdICksIGNoaWxkcmVuOiBbXSB9LFxuICAgIHsgdHJhaWw6IG5ldyBUcmFpbCggWyByb290LCBhLCBjLCBjMiBdICksIGNoaWxkcmVuOiBbXSB9LFxuICAgIHsgdHJhaWw6IG5ldyBUcmFpbCggWyByb290LCBhLCBhMiBdICksIGNoaWxkcmVuOiBbXSB9LFxuICAgIHsgdHJhaWw6IG5ldyBUcmFpbCggWyByb290LCBiLCBiMiBdICksIGNoaWxkcmVuOiBbXSB9LFxuICAgIHsgdHJhaWw6IG5ldyBUcmFpbCggWyByb290LCBiLCBiMSBdICksIGNoaWxkcmVuOiBbXSB9XG4gIF0gKTtcbn0gKTtcblxuUVVuaXQudGVzdCggJ3Bkb21PcmRlciBEZXNjZW5kYW50IE92ZXJyaWRlJywgYXNzZXJ0ID0+IHtcblxuICBjb25zdCBhMSA9IG5ldyBOb2RlKCB7IHRhZ05hbWU6ICdkaXYnIH0gKTtcbiAgY29uc3QgYTIgPSBuZXcgTm9kZSggeyB0YWdOYW1lOiAnZGl2JyB9ICk7XG5cbiAgY29uc3QgYjEgPSBuZXcgTm9kZSggeyB0YWdOYW1lOiAnZGl2JyB9ICk7XG4gIGNvbnN0IGIyID0gbmV3IE5vZGUoIHsgdGFnTmFtZTogJ2RpdicgfSApO1xuXG4gIGNvbnN0IGEgPSBuZXcgTm9kZSggeyBjaGlsZHJlbjogWyBhMSwgYTIgXSB9ICk7XG4gIGNvbnN0IGIgPSBuZXcgTm9kZSggeyBjaGlsZHJlbjogWyBiMSwgYjIgXSwgcGRvbU9yZGVyOiBbIGIxLCBiMiBdIH0gKTtcblxuICBjb25zdCByb290ID0gbmV3IE5vZGUoIHsgY2hpbGRyZW46IFsgYSwgYiBdLCBwZG9tT3JkZXI6IFsgYiwgYjEsIGEgXSB9ICk7XG5cbiAgY29uc3QgbmVzdGVkT3JkZXIgPSByb290LmdldE5lc3RlZFBET01PcmRlcigpO1xuXG4gIG5lc3RlZEVxdWFsaXR5KCBhc3NlcnQsIG5lc3RlZE9yZGVyLCBbXG4gICAgeyB0cmFpbDogbmV3IFRyYWlsKCBbIHJvb3QsIGIsIGIyIF0gKSwgY2hpbGRyZW46IFtdIH0sXG4gICAgeyB0cmFpbDogbmV3IFRyYWlsKCBbIHJvb3QsIGIsIGIxIF0gKSwgY2hpbGRyZW46IFtdIH0sXG4gICAgeyB0cmFpbDogbmV3IFRyYWlsKCBbIHJvb3QsIGEsIGExIF0gKSwgY2hpbGRyZW46IFtdIH0sXG4gICAgeyB0cmFpbDogbmV3IFRyYWlsKCBbIHJvb3QsIGEsIGEyIF0gKSwgY2hpbGRyZW46IFtdIH1cbiAgXSApO1xufSApO1xuXG5RVW5pdC50ZXN0KCAncGRvbU9yZGVyIEhpZXJhcmNoeScsIGFzc2VydCA9PiB7XG5cbiAgY29uc3QgYTEgPSBuZXcgTm9kZSggeyB0YWdOYW1lOiAnZGl2JyB9ICk7XG4gIGNvbnN0IGEyID0gbmV3IE5vZGUoIHsgdGFnTmFtZTogJ2RpdicgfSApO1xuXG4gIGNvbnN0IGIxID0gbmV3IE5vZGUoIHsgdGFnTmFtZTogJ2RpdicgfSApO1xuICBjb25zdCBiMiA9IG5ldyBOb2RlKCB7IHRhZ05hbWU6ICdkaXYnIH0gKTtcblxuICBjb25zdCBhID0gbmV3IE5vZGUoIHsgY2hpbGRyZW46IFsgYTEsIGEyIF0sIHBkb21PcmRlcjogWyBhMiBdIH0gKTtcbiAgY29uc3QgYiA9IG5ldyBOb2RlKCB7IGNoaWxkcmVuOiBbIGIxLCBiMiBdLCBwZG9tT3JkZXI6IFsgYjIsIGIxIF0gfSApO1xuXG4gIGNvbnN0IHJvb3QgPSBuZXcgTm9kZSggeyBjaGlsZHJlbjogWyBhLCBiIF0sIHBkb21PcmRlcjogWyBiLCBhIF0gfSApO1xuXG4gIGNvbnN0IG5lc3RlZE9yZGVyID0gcm9vdC5nZXROZXN0ZWRQRE9NT3JkZXIoKTtcblxuICBuZXN0ZWRFcXVhbGl0eSggYXNzZXJ0LCBuZXN0ZWRPcmRlciwgW1xuICAgIHsgdHJhaWw6IG5ldyBUcmFpbCggWyByb290LCBiLCBiMiBdICksIGNoaWxkcmVuOiBbXSB9LFxuICAgIHsgdHJhaWw6IG5ldyBUcmFpbCggWyByb290LCBiLCBiMSBdICksIGNoaWxkcmVuOiBbXSB9LFxuICAgIHsgdHJhaWw6IG5ldyBUcmFpbCggWyByb290LCBhLCBhMiBdICksIGNoaWxkcmVuOiBbXSB9LFxuICAgIHsgdHJhaWw6IG5ldyBUcmFpbCggWyByb290LCBhLCBhMSBdICksIGNoaWxkcmVuOiBbXSB9XG4gIF0gKTtcbn0gKTtcblxuUVVuaXQudGVzdCggJ3Bkb21PcmRlciBEQUcgdGVzdCcsIGFzc2VydCA9PiB7XG5cbiAgY29uc3QgYTEgPSBuZXcgTm9kZSggeyB0YWdOYW1lOiAnZGl2JyB9ICk7XG4gIGNvbnN0IGEyID0gbmV3IE5vZGUoIHsgdGFnTmFtZTogJ2RpdicgfSApO1xuXG4gIGNvbnN0IGEgPSBuZXcgTm9kZSggeyBjaGlsZHJlbjogWyBhMSwgYTIgXSwgcGRvbU9yZGVyOiBbIGEyLCBhMSBdIH0gKTtcbiAgY29uc3QgYiA9IG5ldyBOb2RlKCB7IGNoaWxkcmVuOiBbIGExLCBhMiBdLCBwZG9tT3JkZXI6IFsgYTEsIGEyIF0gfSApO1xuXG4gIGNvbnN0IHJvb3QgPSBuZXcgTm9kZSggeyBjaGlsZHJlbjogWyBhLCBiIF0gfSApO1xuXG4gIGNvbnN0IG5lc3RlZE9yZGVyID0gcm9vdC5nZXROZXN0ZWRQRE9NT3JkZXIoKTtcblxuICBuZXN0ZWRFcXVhbGl0eSggYXNzZXJ0LCBuZXN0ZWRPcmRlciwgW1xuICAgIHsgdHJhaWw6IG5ldyBUcmFpbCggWyByb290LCBhLCBhMiBdICksIGNoaWxkcmVuOiBbXSB9LFxuICAgIHsgdHJhaWw6IG5ldyBUcmFpbCggWyByb290LCBhLCBhMSBdICksIGNoaWxkcmVuOiBbXSB9LFxuICAgIHsgdHJhaWw6IG5ldyBUcmFpbCggWyByb290LCBiLCBhMSBdICksIGNoaWxkcmVuOiBbXSB9LFxuICAgIHsgdHJhaWw6IG5ldyBUcmFpbCggWyByb290LCBiLCBhMiBdICksIGNoaWxkcmVuOiBbXSB9XG4gIF0gKTtcbn0gKTtcblxuUVVuaXQudGVzdCggJ3Bkb21PcmRlciBEQUcgdGVzdCcsIGFzc2VydCA9PiB7XG5cbiAgY29uc3QgeCA9IG5ldyBOb2RlKCk7XG4gIGNvbnN0IGEgPSBuZXcgTm9kZSgpO1xuICBjb25zdCBiID0gbmV3IE5vZGUoKTtcbiAgY29uc3QgYyA9IG5ldyBOb2RlKCk7XG4gIGNvbnN0IGQgPSBuZXcgTm9kZSggeyB0YWdOYW1lOiAnZGl2JyB9ICk7XG4gIGNvbnN0IGUgPSBuZXcgTm9kZSgpO1xuICBjb25zdCBmID0gbmV3IE5vZGUoIHsgdGFnTmFtZTogJ2RpdicgfSApO1xuICBjb25zdCBnID0gbmV3IE5vZGUoIHsgdGFnTmFtZTogJ2RpdicgfSApO1xuICBjb25zdCBoID0gbmV3IE5vZGUoIHsgdGFnTmFtZTogJ2RpdicgfSApO1xuICBjb25zdCBpID0gbmV3IE5vZGUoIHsgdGFnTmFtZTogJ2RpdicgfSApO1xuICBjb25zdCBqID0gbmV3IE5vZGUoIHsgdGFnTmFtZTogJ2RpdicgfSApO1xuICBjb25zdCBrID0gbmV3IE5vZGUoIHsgdGFnTmFtZTogJ2RpdicgfSApO1xuICBjb25zdCBsID0gbmV3IE5vZGUoKTtcblxuICB4LmNoaWxkcmVuID0gWyBhIF07XG4gIGEuY2hpbGRyZW4gPSBbIGssIGIsIGMgXTtcbiAgYi5jaGlsZHJlbiA9IFsgZCwgZSBdO1xuICBjLmNoaWxkcmVuID0gWyBlIF07XG4gIGUuY2hpbGRyZW4gPSBbIGosIGYsIGcgXTtcbiAgZi5jaGlsZHJlbiA9IFsgaCwgaSBdO1xuXG4gIHgucGRvbU9yZGVyID0gWyBmLCBjLCBkLCBsIF07XG4gIGEucGRvbU9yZGVyID0gWyBjLCBiIF07XG4gIGUucGRvbU9yZGVyID0gWyBnLCBmLCBqIF07XG5cbiAgY29uc3QgbmVzdGVkT3JkZXIgPSB4LmdldE5lc3RlZFBET01PcmRlcigpO1xuXG4gIG5lc3RlZEVxdWFsaXR5KCBhc3NlcnQsIG5lc3RlZE9yZGVyLCBbXG4gICAgLy8geCBvcmRlcidzIEZcbiAgICB7XG4gICAgICB0cmFpbDogbmV3IFRyYWlsKCBbIHgsIGEsIGIsIGUsIGYgXSApLCBjaGlsZHJlbjogW1xuICAgICAgICB7IHRyYWlsOiBuZXcgVHJhaWwoIFsgeCwgYSwgYiwgZSwgZiwgaCBdICksIGNoaWxkcmVuOiBbXSB9LFxuICAgICAgICB7IHRyYWlsOiBuZXcgVHJhaWwoIFsgeCwgYSwgYiwgZSwgZiwgaSBdICksIGNoaWxkcmVuOiBbXSB9XG4gICAgICBdXG4gICAgfSxcbiAgICB7XG4gICAgICB0cmFpbDogbmV3IFRyYWlsKCBbIHgsIGEsIGMsIGUsIGYgXSApLCBjaGlsZHJlbjogW1xuICAgICAgICB7IHRyYWlsOiBuZXcgVHJhaWwoIFsgeCwgYSwgYywgZSwgZiwgaCBdICksIGNoaWxkcmVuOiBbXSB9LFxuICAgICAgICB7IHRyYWlsOiBuZXcgVHJhaWwoIFsgeCwgYSwgYywgZSwgZiwgaSBdICksIGNoaWxkcmVuOiBbXSB9XG4gICAgICBdXG4gICAgfSxcblxuICAgIC8vIFggb3JkZXIncyBDXG4gICAgeyB0cmFpbDogbmV3IFRyYWlsKCBbIHgsIGEsIGMsIGUsIGcgXSApLCBjaGlsZHJlbjogW10gfSxcbiAgICB7IHRyYWlsOiBuZXcgVHJhaWwoIFsgeCwgYSwgYywgZSwgaiBdICksIGNoaWxkcmVuOiBbXSB9LFxuXG4gICAgLy8gWCBvcmRlcidzIERcbiAgICB7IHRyYWlsOiBuZXcgVHJhaWwoIFsgeCwgYSwgYiwgZCBdICksIGNoaWxkcmVuOiBbXSB9LFxuXG4gICAgLy8gWCBldmVyeXRoaW5nIGVsc2VcbiAgICB7IHRyYWlsOiBuZXcgVHJhaWwoIFsgeCwgYSwgYiwgZSwgZyBdICksIGNoaWxkcmVuOiBbXSB9LFxuICAgIHsgdHJhaWw6IG5ldyBUcmFpbCggWyB4LCBhLCBiLCBlLCBqIF0gKSwgY2hpbGRyZW46IFtdIH0sXG4gICAgeyB0cmFpbDogbmV3IFRyYWlsKCBbIHgsIGEsIGsgXSApLCBjaGlsZHJlbjogW10gfVxuICBdICk7XG59ICk7XG5cblFVbml0LnRlc3QoICdzZXR0aW5nIHBkb21PcmRlcicsIGFzc2VydCA9PiB7XG5cbiAgY29uc3Qgcm9vdE5vZGUgPSBuZXcgTm9kZSgpO1xuICB2YXIgZGlzcGxheSA9IG5ldyBEaXNwbGF5KCByb290Tm9kZSApOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLXZhclxuICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKCBkaXNwbGF5LmRvbUVsZW1lbnQgKTtcblxuICBjb25zdCBhID0gbmV3IE5vZGUoIHsgdGFnTmFtZTogJ2RpdicgfSApO1xuICBjb25zdCBiID0gbmV3IE5vZGUoIHsgdGFnTmFtZTogJ2RpdicgfSApO1xuICBjb25zdCBjID0gbmV3IE5vZGUoIHsgdGFnTmFtZTogJ2RpdicgfSApO1xuICBjb25zdCBkID0gbmV3IE5vZGUoIHsgdGFnTmFtZTogJ2RpdicgfSApO1xuICByb290Tm9kZS5jaGlsZHJlbiA9IFsgYSwgYiwgYywgZCBdO1xuXG4gIC8vIHJldmVyc2UgYWNjZXNzaWJsZSBvcmRlclxuICByb290Tm9kZS5wZG9tT3JkZXIgPSBbIGQsIGMsIGIsIGEgXTtcblxuICBhc3NlcnQub2soIGRpc3BsYXkuX3Jvb3RQRE9NSW5zdGFuY2UsICdzaG91bGQgZXhpc3QnICk7XG5cbiAgY29uc3QgZGl2Um9vdCA9IGRpc3BsYXkuX3Jvb3RQRE9NSW5zdGFuY2UhLnBlZXIhLnByaW1hcnlTaWJsaW5nITtcbiAgY29uc3QgZGl2QSA9IGEucGRvbUluc3RhbmNlc1sgMCBdLnBlZXIhLnByaW1hcnlTaWJsaW5nO1xuICBjb25zdCBkaXZCID0gYi5wZG9tSW5zdGFuY2VzWyAwIF0ucGVlciEucHJpbWFyeVNpYmxpbmc7XG4gIGNvbnN0IGRpdkMgPSBjLnBkb21JbnN0YW5jZXNbIDAgXS5wZWVyIS5wcmltYXJ5U2libGluZztcbiAgY29uc3QgZGl2RCA9IGQucGRvbUluc3RhbmNlc1sgMCBdLnBlZXIhLnByaW1hcnlTaWJsaW5nO1xuXG4gIGFzc2VydC5vayggZGl2Um9vdC5jaGlsZHJlblsgMCBdID09PSBkaXZELCAnZGl2RCBzaG91bGQgYmUgZmlyc3QgY2hpbGQnICk7XG4gIGFzc2VydC5vayggZGl2Um9vdC5jaGlsZHJlblsgMSBdID09PSBkaXZDLCAnZGl2QyBzaG91bGQgYmUgc2Vjb25kIGNoaWxkJyApO1xuICBhc3NlcnQub2soIGRpdlJvb3QuY2hpbGRyZW5bIDIgXSA9PT0gZGl2QiwgJ2RpdkIgc2hvdWxkIGJlIHRoaXJkIGNoaWxkJyApO1xuICBhc3NlcnQub2soIGRpdlJvb3QuY2hpbGRyZW5bIDMgXSA9PT0gZGl2QSwgJ2RpdkEgc2hvdWxkIGJlIGZvdXJ0aCBjaGlsZCcgKTtcbiAgZGlzcGxheS5kaXNwb3NlKCk7XG4gIGRpc3BsYXkuZG9tRWxlbWVudC5wYXJlbnRFbGVtZW50IS5yZW1vdmVDaGlsZCggZGlzcGxheS5kb21FbGVtZW50ICk7XG59ICk7XG5cblFVbml0LnRlc3QoICdzZXR0aW5nIHBkb21PcmRlciBiZWZvcmUgc2V0dGluZyBhY2Nlc3NpYmxlIGNvbnRlbnQnLCBhc3NlcnQgPT4ge1xuICBjb25zdCByb290Tm9kZSA9IG5ldyBOb2RlKCk7XG4gIHZhciBkaXNwbGF5ID0gbmV3IERpc3BsYXkoIHJvb3ROb2RlICk7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tdmFyXG4gIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoIGRpc3BsYXkuZG9tRWxlbWVudCApO1xuXG4gIGNvbnN0IGEgPSBuZXcgTm9kZSgpO1xuICBjb25zdCBiID0gbmV3IE5vZGUoKTtcbiAgY29uc3QgYyA9IG5ldyBOb2RlKCk7XG4gIGNvbnN0IGQgPSBuZXcgTm9kZSgpO1xuICByb290Tm9kZS5jaGlsZHJlbiA9IFsgYSwgYiwgYywgZCBdO1xuXG4gIC8vIHJldmVyc2UgYWNjZXNzaWJsZSBvcmRlclxuICByb290Tm9kZS5wZG9tT3JkZXIgPSBbIGQsIGMsIGIsIGEgXTtcblxuICBhLnRhZ05hbWUgPSAnZGl2JztcbiAgYi50YWdOYW1lID0gJ2Rpdic7XG4gIGMudGFnTmFtZSA9ICdkaXYnO1xuICBkLnRhZ05hbWUgPSAnZGl2JztcblxuICBjb25zdCBkaXZSb290ID0gZGlzcGxheS5fcm9vdFBET01JbnN0YW5jZSEucGVlciEucHJpbWFyeVNpYmxpbmchO1xuICBjb25zdCBkaXZBID0gYS5wZG9tSW5zdGFuY2VzWyAwIF0ucGVlciEucHJpbWFyeVNpYmxpbmc7XG4gIGNvbnN0IGRpdkIgPSBiLnBkb21JbnN0YW5jZXNbIDAgXS5wZWVyIS5wcmltYXJ5U2libGluZztcbiAgY29uc3QgZGl2QyA9IGMucGRvbUluc3RhbmNlc1sgMCBdLnBlZXIhLnByaW1hcnlTaWJsaW5nO1xuICBjb25zdCBkaXZEID0gZC5wZG9tSW5zdGFuY2VzWyAwIF0ucGVlciEucHJpbWFyeVNpYmxpbmc7XG5cbiAgYXNzZXJ0Lm9rKCBkaXZSb290LmNoaWxkcmVuWyAwIF0gPT09IGRpdkQsICdkaXZEIHNob3VsZCBiZSBmaXJzdCBjaGlsZCcgKTtcbiAgYXNzZXJ0Lm9rKCBkaXZSb290LmNoaWxkcmVuWyAxIF0gPT09IGRpdkMsICdkaXZDIHNob3VsZCBiZSBzZWNvbmQgY2hpbGQnICk7XG4gIGFzc2VydC5vayggZGl2Um9vdC5jaGlsZHJlblsgMiBdID09PSBkaXZCLCAnZGl2QiBzaG91bGQgYmUgdGhpcmQgY2hpbGQnICk7XG4gIGFzc2VydC5vayggZGl2Um9vdC5jaGlsZHJlblsgMyBdID09PSBkaXZBLCAnZGl2QSBzaG91bGQgYmUgZm91cnRoIGNoaWxkJyApO1xuICBkaXNwbGF5LmRpc3Bvc2UoKTtcbiAgZGlzcGxheS5kb21FbGVtZW50LnBhcmVudEVsZW1lbnQhLnJlbW92ZUNoaWxkKCBkaXNwbGF5LmRvbUVsZW1lbnQgKTtcblxufSApO1xuXG5RVW5pdC50ZXN0KCAnc2V0dGluZyBhY2Nlc3NpYmxlIG9yZGVyIG9uIG5vZGVzIHdpdGggbm8gYWNjZXNzaWJsZSBjb250ZW50JywgYXNzZXJ0ID0+IHtcbiAgY29uc3Qgcm9vdE5vZGUgPSBuZXcgTm9kZSgpO1xuICB2YXIgZGlzcGxheSA9IG5ldyBEaXNwbGF5KCByb290Tm9kZSApOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLXZhclxuICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKCBkaXNwbGF5LmRvbUVsZW1lbnQgKTtcblxuICAvLyByb290XG4gIC8vICAgIGFcbiAgLy8gICAgICBiXG4gIC8vICAgICBjICAgZVxuICAvLyAgICAgICAgZCAgZlxuXG4gIGNvbnN0IGEgPSBuZXcgTm9kZSggeyB0YWdOYW1lOiAnZGl2JyB9ICk7XG4gIGNvbnN0IGIgPSBuZXcgTm9kZSggeyB0YWdOYW1lOiAnZGl2JyB9ICk7XG4gIGNvbnN0IGMgPSBuZXcgTm9kZSggeyB0YWdOYW1lOiAnZGl2JyB9ICk7XG4gIGNvbnN0IGQgPSBuZXcgTm9kZSggeyB0YWdOYW1lOiAnZGl2JyB9ICk7XG4gIGNvbnN0IGUgPSBuZXcgTm9kZSggeyB0YWdOYW1lOiAnZGl2JyB9ICk7XG4gIGNvbnN0IGYgPSBuZXcgTm9kZSggeyB0YWdOYW1lOiAnZGl2JyB9ICk7XG4gIHJvb3ROb2RlLmFkZENoaWxkKCBhICk7XG4gIGEuYWRkQ2hpbGQoIGIgKTtcbiAgYi5hZGRDaGlsZCggYyApO1xuICBiLmFkZENoaWxkKCBlICk7XG4gIGMuYWRkQ2hpbGQoIGQgKTtcbiAgYy5hZGRDaGlsZCggZiApO1xuICBiLnBkb21PcmRlciA9IFsgZSwgYyBdO1xuXG4gIGNvbnN0IGRpdkIgPSBiLnBkb21JbnN0YW5jZXNbIDAgXS5wZWVyIS5wcmltYXJ5U2libGluZyE7XG4gIGNvbnN0IGRpdkMgPSBjLnBkb21JbnN0YW5jZXNbIDAgXS5wZWVyIS5wcmltYXJ5U2libGluZyE7XG4gIGNvbnN0IGRpdkUgPSBlLnBkb21JbnN0YW5jZXNbIDAgXS5wZWVyIS5wcmltYXJ5U2libGluZyE7XG5cbiAgYXNzZXJ0Lm9rKCBkaXZCLmNoaWxkcmVuWyAwIF0gPT09IGRpdkUsICdkaXYgRSBzaG91bGQgYmUgZmlyc3QgY2hpbGQgb2YgZGl2IEInICk7XG4gIGFzc2VydC5vayggZGl2Qi5jaGlsZHJlblsgMSBdID09PSBkaXZDLCAnZGl2IEMgc2hvdWxkIGJlIHNlY29uZCBjaGlsZCBvZiBkaXYgQicgKTtcbiAgZGlzcGxheS5kaXNwb3NlKCk7XG4gIGRpc3BsYXkuZG9tRWxlbWVudC5wYXJlbnRFbGVtZW50IS5yZW1vdmVDaGlsZCggZGlzcGxheS5kb21FbGVtZW50ICk7XG5cbn0gKTtcblxuUVVuaXQudGVzdCggJ3NldHRpbmcgYWNjZXNzaWJsZSBvcmRlciBvbiBub2RlcyB3aXRoIG5vIGFjY2Vzc2libGUgY29udGVudCcsIGFzc2VydCA9PiB7XG4gIGNvbnN0IHJvb3ROb2RlID0gbmV3IE5vZGUoKTtcbiAgY29uc3QgZGlzcGxheSA9IG5ldyBEaXNwbGF5KCByb290Tm9kZSApO1xuICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKCBkaXNwbGF5LmRvbUVsZW1lbnQgKTtcblxuICBjb25zdCBhID0gbmV3IE5vZGUoIHsgdGFnTmFtZTogJ2RpdicgfSApO1xuICBjb25zdCBiID0gbmV3IE5vZGUoKTtcbiAgY29uc3QgYyA9IG5ldyBOb2RlKCB7IHRhZ05hbWU6ICdkaXYnIH0gKTtcbiAgY29uc3QgZCA9IG5ldyBOb2RlKCB7IHRhZ05hbWU6ICdkaXYnIH0gKTtcbiAgY29uc3QgZSA9IG5ldyBOb2RlKCB7IHRhZ05hbWU6ICdkaXYnIH0gKTtcbiAgY29uc3QgZiA9IG5ldyBOb2RlKCB7IHRhZ05hbWU6ICdkaXYnIH0gKTtcbiAgcm9vdE5vZGUuYWRkQ2hpbGQoIGEgKTtcbiAgYS5hZGRDaGlsZCggYiApO1xuICBiLmFkZENoaWxkKCBjICk7XG4gIGIuYWRkQ2hpbGQoIGUgKTtcbiAgYy5hZGRDaGlsZCggZCApO1xuICBjLmFkZENoaWxkKCBmICk7XG4gIGEucGRvbU9yZGVyID0gWyBlLCBjIF07XG5cbiAgY29uc3QgZGl2QSA9IGEucGRvbUluc3RhbmNlc1sgMCBdLnBlZXIhLnByaW1hcnlTaWJsaW5nITtcbiAgY29uc3QgZGl2QyA9IGMucGRvbUluc3RhbmNlc1sgMCBdLnBlZXIhLnByaW1hcnlTaWJsaW5nITtcbiAgY29uc3QgZGl2RSA9IGUucGRvbUluc3RhbmNlc1sgMCBdLnBlZXIhLnByaW1hcnlTaWJsaW5nITtcblxuICBhc3NlcnQub2soIGRpdkEuY2hpbGRyZW5bIDAgXSA9PT0gZGl2RSwgJ2RpdiBFIHNob3VsZCBiZSBmaXJzdCBjaGlsZCBvZiBkaXYgQicgKTtcbiAgYXNzZXJ0Lm9rKCBkaXZBLmNoaWxkcmVuWyAxIF0gPT09IGRpdkMsICdkaXYgQyBzaG91bGQgYmUgc2Vjb25kIGNoaWxkIG9mIGRpdiBCJyApO1xuICBkaXNwbGF5LmRpc3Bvc2UoKTtcbiAgZGlzcGxheS5kb21FbGVtZW50LnBhcmVudEVsZW1lbnQhLnJlbW92ZUNoaWxkKCBkaXNwbGF5LmRvbUVsZW1lbnQgKTtcbn0gKTtcblxuUVVuaXQudGVzdCggJ3NldHRpbmcgYWNjZXNzaWJsZSBvcmRlciBvbiBhIE5vZGUgd2l0aCBmb2N1cycsIGFzc2VydCA9PiB7XG4gIGlmICggIWRvY3VtZW50Lmhhc0ZvY3VzKCkgKSB7XG4gICAgYXNzZXJ0Lm9rKCB0cnVlLCAnT3B0aW5nIG91dCBvZiB0ZXN0IGJlY2F1c2UgZG9jdW1lbnQgZG9lcyBub3QgaGF2ZSBmb2N1cycgKTtcbiAgICByZXR1cm47XG4gIH1cblxuICBjb25zdCByb290Tm9kZSA9IG5ldyBOb2RlKCk7XG4gIGNvbnN0IGRpc3BsYXkgPSBuZXcgRGlzcGxheSggcm9vdE5vZGUgKTtcbiAgZGlzcGxheS5pbml0aWFsaXplRXZlbnRzKCk7XG4gIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoIGRpc3BsYXkuZG9tRWxlbWVudCApO1xuXG4gIGNvbnN0IGExID0gbmV3IE5vZGUoIHsgdGFnTmFtZTogJ2RpdicgfSApO1xuICBjb25zdCBiMSA9IG5ldyBOb2RlKCB7IHRhZ05hbWU6ICdkaXYnLCBmb2N1c2FibGU6IHRydWUgfSApO1xuICBjb25zdCBjMSA9IG5ldyBOb2RlKCB7IHRhZ05hbWU6ICdkaXYnLCBmb2N1c2FibGU6IHRydWUgfSApO1xuICBjb25zdCBkMSA9IG5ldyBOb2RlKCB7IHRhZ05hbWU6ICdkaXYnLCBmb2N1c2FibGU6IHRydWUgfSApO1xuICBjb25zdCBkMiA9IG5ldyBOb2RlKCB7IHRhZ05hbWU6ICdkaXYnLCBmb2N1c2FibGU6IHRydWUgfSApO1xuICBjb25zdCBkMyA9IG5ldyBOb2RlKCB7IHRhZ05hbWU6ICdkaXYnLCBmb2N1c2FibGU6IHRydWUgfSApO1xuICBjb25zdCBkNCA9IG5ldyBOb2RlKCB7IHRhZ05hbWU6ICdkaXYnLCBmb2N1c2FibGU6IHRydWUgfSApO1xuXG4gIC8vIGEgc2NlbmUgZ3JhcGggd2hlcmUgZCBub2RlcyBhcmUgY2hpbGRyZW4gb2YgYiwgYnV0IHdpbGwgYmUgbW92ZWQgdW5kZXIgYyBpbiB0aGUgcGRvbU9yZGVyXG4gIHJvb3ROb2RlLmFkZENoaWxkKCBhMSApO1xuICBhMS5jaGlsZHJlbiA9IFsgYjEsIGMxIF07XG4gIGIxLmNoaWxkcmVuID0gWyBkMSwgZDIsIGQzLCBkNCBdO1xuXG4gIGQxLmZvY3VzKCk7XG4gIGFzc2VydC5vayggZDEuZm9jdXNlZCwgJ2QxIHNob3VsZCBiZSBmb2N1c2VkJyApO1xuXG4gIGIxLnBkb21PcmRlciA9IFsgZDMsIGQ0IF07XG4gIGFzc2VydC5vayggZDEuZm9jdXNlZCwgJ2QxIHNob3VsZCBzdGlsbCBoYXZlIGZvY3VzIGFmdGVyIG9yZGVyIGNoYW5nZScgKTtcbiAgYjEucGRvbU9yZGVyID0gbnVsbDtcblxuICBjMS5wZG9tT3JkZXIgPSBbIGQ0LCBkMywgZDIsIGQxIF07XG4gIGFzc2VydC5vayggZDEuZm9jdXNlZCwgJ2QxIHNob3VsZCBzdGlsbCBoYXZlIGZvY3VzIGFmdGVyIG9yZGVyIGNoYW5nZScgKTtcbiAgYzEucGRvbU9yZGVyID0gbnVsbDtcblxuICBhMS5wZG9tT3JkZXIgPSBbIGQxLCBkMiwgZDMgXTtcbiAgYXNzZXJ0Lm9rKCBkMS5mb2N1c2VkLCAnZDEgc2hvdWxkIHN0aWxsIGhhdmUgZm9jdXMgYWZ0ZXIgb3JkZXIgY2hhbmdlJyApO1xuXG4gIGRpc3BsYXkuZGV0YWNoRXZlbnRzKCk7XG59ICk7XG5cblFVbml0LnRlc3QoICdwZG9tT3JkZXIgd2l0aCByZWVudHJhbnQgZXZlbnRzJywgYXNzZXJ0ID0+IHtcbiAgaWYgKCAhZG9jdW1lbnQuaGFzRm9jdXMoKSApIHtcbiAgICBhc3NlcnQub2soIHRydWUsICdPcHRpbmcgb3V0IG9mIHRlc3QgYmVjYXVzZSBkb2N1bWVudCBkb2VzIG5vdCBoYXZlIGZvY3VzJyApO1xuICAgIHJldHVybjtcbiAgfVxuXG4gIGNvbnN0IHJvb3ROb2RlID0gbmV3IE5vZGUoKTtcbiAgY29uc3QgZGlzcGxheSA9IG5ldyBEaXNwbGF5KCByb290Tm9kZSApO1xuICBkaXNwbGF5LmluaXRpYWxpemVFdmVudHMoKTtcbiAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZCggZGlzcGxheS5kb21FbGVtZW50ICk7XG5cbiAgY29uc3QgYTEgPSBuZXcgTm9kZSggeyB0YWdOYW1lOiAnZGl2JyB9ICk7XG4gIGNvbnN0IGIxID0gbmV3IE5vZGUoIHsgdGFnTmFtZTogJ2J1dHRvbicsIGZvY3VzYWJsZTogdHJ1ZSB9ICk7XG4gIGNvbnN0IGMxID0gbmV3IE5vZGUoIHsgdGFnTmFtZTogJ2RpdicsIGZvY3VzYWJsZTogdHJ1ZSB9ICk7XG4gIGNvbnN0IGQxID0gbmV3IE5vZGUoIHsgdGFnTmFtZTogJ2RpdicsIGZvY3VzYWJsZTogdHJ1ZSB9ICk7XG4gIGNvbnN0IGQyID0gbmV3IE5vZGUoIHsgdGFnTmFtZTogJ2RpdicsIGZvY3VzYWJsZTogdHJ1ZSB9ICk7XG5cbiAgY29uc3QgZ2V0RE9NRWxlbWVudCA9ICggbm9kZTogTm9kZSApID0+IG5vZGUucGRvbUluc3RhbmNlc1sgMCBdLnBlZXIhLnByaW1hcnlTaWJsaW5nITtcblxuICByb290Tm9kZS5hZGRDaGlsZCggYTEgKTtcbiAgYTEuY2hpbGRyZW4gPSBbIGIxLCBjMSBdO1xuICBiMS5jaGlsZHJlbiA9IFsgZDEgXTtcblxuICBiMS5hZGRJbnB1dExpc3RlbmVyKCB7XG4gICAgY2xpY2s6IGV2ZW50ID0+IHtcblxuICAgICAgLy8gZm9jdXMgYW5vdGhlciB0aGluZywgaW5zaWRlIG9mIHRoZSBjbGljayBsaXN0ZW5lciAtIGdlbmVyYXRlcyByZWVudHJhbnQgZXZlbnRzXG4gICAgICBkMS5mb2N1cygpO1xuXG4gICAgICBhc3NlcnQub2soIGQxLmZvY3VzZWQsICdkMSBzaG91bGQgaGF2ZSBmb2N1cyBldmVuIHRob3VnaCBmb2N1cyB3YXMgc2V0IGluIGEgcmVlbnRyYW50IGV2ZW50JyApO1xuICAgICAgYXNzZXJ0Lm9rKCBGb2N1c01hbmFnZXIucGRvbUZvY3VzZWROb2RlID09PSBkMSwgJ3Bkb21Gb2N1c2VkTm9kZSBzaG91bGQgYmUgY29ycmVjdCBkdXJpbmcgcmVlbnRyYW50IGV2ZW50cycgKTtcbiAgICAgIGFzc2VydC5vayggZG9jdW1lbnQuYWN0aXZlRWxlbWVudCA9PT0gZ2V0RE9NRWxlbWVudCggZDEgKSwgJ2FjdGl2ZUVsZW1lbnQgc2hvdWxkIGJlIGNvcnJlY3QgZHVyaW5nIHJlZW50cmFudCBldmVudHMnICk7XG5cbiAgICAgIC8vIGNoYW5nZSB0aGUgdHJhaWwgdG8gdGhlIE5vZGVcbiAgICAgIGExLnBkb21PcmRlciA9IFsgZDEsIGQyLCBudWxsIF07XG5cbiAgICAgIC8vIHZlcmlmeSB0aGF0IGZvY3VzIGlzIHN0aWxsIGNvcnJlY3QgYWZ0ZXIgUERPTSByZWFycmFuZ2VtZW50XG4gICAgICBhc3NlcnQub2soIGQxLmZvY3VzZWQsICdkMSBzaG91bGQgc3RpbGwgdHJhaWwgY2hhbmdlIG9wZXJhdGlvbnMgaW4gcmVlbnRyYW50IGV2ZW50cycgKTtcbiAgICB9XG4gIH0gKTtcblxuICAvLyBGb2N1cyB0aGUgYnV0dG9uIGFuZCB0cmlnZ2VyIGEgY2xpY2tcbiAgYjEuZm9jdXMoKTtcbiAgZ2V0RE9NRWxlbWVudCggYjEgKS5jbGljaygpO1xuICBhc3NlcnQub2soIHRydWUsICdkdW1teSB0ZXN0IHRoYXQgc2hvdWxkIHJ1biBhZnRlciBjbGljayBldmVudHMnICk7XG5cbiAgYjEuYmx1cigpO1xuXG4gIGRpc3BsYXkuZGV0YWNoRXZlbnRzKCk7XG59ICk7XG5cblFVbml0LnRlc3QoICdUZXN0aW5nIEZvY3VzTWFuYWdlci53aW5kb3dIYXNGb2N1c1Byb3BlcnR5JywgYXNzZXJ0ID0+IHtcblxuICAvLyBkZXRhY2ggdGhlIEZvY3VzTWFuYWdlciBmaXJzdCBqdXN0IGluIGNhc2UgaXQgd2FzIGF0dGFjaGVkIGJ5IGEgcHJldmlvdXMgdGVzdFxuICBGb2N1c01hbmFnZXIuZGV0YWNoRnJvbVdpbmRvdygpO1xuXG4gIGNvbnN0IHJvb3ROb2RlID0gbmV3IE5vZGUoKTtcbiAgY29uc3QgZGlzcGxheSA9IG5ldyBEaXNwbGF5KCByb290Tm9kZSApO1xuICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKCBkaXNwbGF5LmRvbUVsZW1lbnQgKTtcblxuICBjb25zdCBmb2N1c2FibGVOb2RlID0gbmV3IE5vZGUoIHsgdGFnTmFtZTogJ2J1dHRvbicgfSApO1xuICByb290Tm9kZS5hZGRDaGlsZCggZm9jdXNhYmxlTm9kZSApO1xuXG4gIGFzc2VydC5vayggIUZvY3VzTWFuYWdlci53aW5kb3dIYXNGb2N1c1Byb3BlcnR5LnZhbHVlLCAnc2hvdWxkIG5vdCBoYXZlIGZvY3VzIGF0IHN0YXJ0JyApO1xuXG4gIC8vIEZpcnN0LCB0ZXN0IGRldGFjaEZyb21XaW5kb3csIG9uY2UgZm9jdXMgaXMgaW4gdGhlIHdpbmRvdyBpdCBpcyBpbXBvc3NpYmxlIHRvIHJlbW92ZSBpdCBmcm9tXG4gIC8vIHRoZSB3aW5kb3cgd2l0aCBKYXZhU2NyaXB0LlxuICBGb2N1c01hbmFnZXIuYXR0YWNoVG9XaW5kb3coKTtcbiAgRm9jdXNNYW5hZ2VyLmRldGFjaEZyb21XaW5kb3coKTtcblxuICBhc3NlcnQub2soICFGb2N1c01hbmFnZXIud2luZG93SGFzRm9jdXNQcm9wZXJ0eS52YWx1ZSwgJ3Nob3VsZCBub3QgaGF2ZSBmb2N1cyBhZnRlciBkZXRhY2hpbmcnICk7XG4gIGZvY3VzYWJsZU5vZGUuZm9jdXMoKTtcbiAgYXNzZXJ0Lm9rKCAhRm9jdXNNYW5hZ2VyLndpbmRvd0hhc0ZvY3VzUHJvcGVydHkudmFsdWUsICdTaG91bGQgbm90IGJlIHdhdGNoaW5nIHdpbmRvdyBmb2N1cyBjaGFuZ2VzIGFmdGVyIGRldGFjaGluZycgKTtcblxuICAvLyBub3cgdGVzdCBjaGFuZ2VzIHRvIHdpbmRvd0hhc0ZvY3VzUHJvcGVydHkgLSB3aW5kb3cgZm9jdXMgbGlzdGVuZXJzIHdpbGwgb25seSB3b3JrIGlmIHRlc3RzIGFyZSBiZWluZyBydW5cbiAgLy8gaW4gdGhlIGZvcmVncm91bmQgKGRldiBjYW5ub3QgYmUgdXNpbmcgZGV2IHRvb2xzLCBydW5uaW5nIGluIHB1cHBldGVlciwgbWluaW1pemVkLCBldGMuLi4pXG4gIGlmICggZG9jdW1lbnQuaGFzRm9jdXMoKSApIHtcbiAgICBGb2N1c01hbmFnZXIuYXR0YWNoVG9XaW5kb3coKTtcbiAgICBhc3NlcnQub2soIEZvY3VzTWFuYWdlci53aW5kb3dIYXNGb2N1c1Byb3BlcnR5LnZhbHVlLCAnRm9jdXMgd2FzIG1vdmVkIGludG8gd2luZG93IGZyb20gcHJldmlvdXMgdGVzdHMsIHRoaXMgYXR0YWNoIHNob3VsZCByZWZsZWN0IHdpbmRvdyBhbHJlYWR5IGhhcyBmb2N1cy4nICk7XG4gICAgZm9jdXNhYmxlTm9kZS5mb2N1cygpO1xuICAgIGFzc2VydC5vayggRm9jdXNNYW5hZ2VyLndpbmRvd0hhc0ZvY3VzUHJvcGVydHkudmFsdWUsICdXaW5kb3cgaGFzIGZvY3VzLCBpcyBub3cgaW4gdGhlIGZvcmVncm91bmQnICk7XG4gICAgZm9jdXNhYmxlTm9kZS5ibHVyKCk7XG4gICAgYXNzZXJ0Lm9rKCBGb2N1c01hbmFnZXIud2luZG93SGFzRm9jdXNQcm9wZXJ0eS52YWx1ZSwgJ3dpbmRvdyBzdGlsbCBoYXMgZm9jdXMgYWZ0ZXIgYSBibHVyIChmb2N1cyBvbiBib2R5KScgKTtcblxuICAgIC8vIE5PVEUgLSBkb24ndCBkZXRhY2ggdGhlIEZvY3VzTWFuYWdlciBoZXJlLCBpdCBpcyBnbG9iYWxseSBhdHRhY2hlZCBhbmQgaXQgbmVlZHMgdG8gYmV1c2VkXG4gICAgLy8gZm9yIG90aGVyIHRlc3RzXG4gIH1cbn0gKTsiXSwibmFtZXMiOlsiRGlzcGxheSIsIkZvY3VzTWFuYWdlciIsIk5vZGUiLCJUcmFpbCIsIlFVbml0IiwibW9kdWxlIiwibmVzdGVkRXF1YWxpdHkiLCJhc3NlcnQiLCJhIiwiYiIsImVxdWFsIiwibGVuZ3RoIiwiaSIsImFJdGVtIiwiYkl0ZW0iLCJ0cmFpbCIsIm9rIiwiZXF1YWxzIiwiY2hpbGRyZW4iLCJ0ZXN0IiwiYTEiLCJ0YWdOYW1lIiwiYTIiLCJiMSIsImIyIiwicm9vdCIsIm5lc3RlZE9yZGVyIiwiZ2V0TmVzdGVkUERPTU9yZGVyIiwicGRvbU9yZGVyIiwiYzEiLCJjMiIsImMiLCJ4IiwiZCIsImUiLCJmIiwiZyIsImgiLCJqIiwiayIsImwiLCJyb290Tm9kZSIsImRpc3BsYXkiLCJkb2N1bWVudCIsImJvZHkiLCJhcHBlbmRDaGlsZCIsImRvbUVsZW1lbnQiLCJfcm9vdFBET01JbnN0YW5jZSIsImRpdlJvb3QiLCJwZWVyIiwicHJpbWFyeVNpYmxpbmciLCJkaXZBIiwicGRvbUluc3RhbmNlcyIsImRpdkIiLCJkaXZDIiwiZGl2RCIsImRpc3Bvc2UiLCJwYXJlbnRFbGVtZW50IiwicmVtb3ZlQ2hpbGQiLCJhZGRDaGlsZCIsImRpdkUiLCJoYXNGb2N1cyIsImluaXRpYWxpemVFdmVudHMiLCJmb2N1c2FibGUiLCJkMSIsImQyIiwiZDMiLCJkNCIsImZvY3VzIiwiZm9jdXNlZCIsImRldGFjaEV2ZW50cyIsImdldERPTUVsZW1lbnQiLCJub2RlIiwiYWRkSW5wdXRMaXN0ZW5lciIsImNsaWNrIiwiZXZlbnQiLCJwZG9tRm9jdXNlZE5vZGUiLCJhY3RpdmVFbGVtZW50IiwiYmx1ciIsImRldGFjaEZyb21XaW5kb3ciLCJmb2N1c2FibGVOb2RlIiwid2luZG93SGFzRm9jdXNQcm9wZXJ0eSIsInZhbHVlIiwiYXR0YWNoVG9XaW5kb3ciXSwibWFwcGluZ3MiOiJBQUFBLHNEQUFzRDtBQUV0RDs7OztDQUlDLEdBRUQsU0FBU0EsT0FBTyxFQUFFQyxZQUFZLEVBQUVDLElBQUksRUFBRUMsS0FBSyxRQUFRLGdCQUFnQjtBQUVuRUMsTUFBTUMsTUFBTSxDQUFFO0FBWWQsMkVBQTJFO0FBQzNFLFNBQVNDLGVBQWdCQyxNQUFjLEVBQUVDLENBQWlCLEVBQUVDLENBQXVCO0lBQ2pGRixPQUFPRyxLQUFLLENBQUVGLEVBQUVHLE1BQU0sRUFBRUYsRUFBRUUsTUFBTTtJQUVoQyxJQUFNLElBQUlDLElBQUksR0FBR0EsSUFBSUosRUFBRUcsTUFBTSxFQUFFQyxJQUFNO1FBQ25DLE1BQU1DLFFBQVFMLENBQUMsQ0FBRUksRUFBRztRQUNwQixNQUFNRSxRQUFRTCxDQUFDLENBQUVHLEVBQUc7UUFFcEIsSUFBS0MsTUFBTUUsS0FBSyxJQUFJRCxNQUFNQyxLQUFLLEVBQUc7WUFDaENSLE9BQU9TLEVBQUUsQ0FBRUgsTUFBTUUsS0FBSyxDQUFDRSxNQUFNLENBQUVILE1BQU1DLEtBQUs7UUFDNUM7UUFFQVQsZUFBZ0JDLFFBQVFNLE1BQU1LLFFBQVEsRUFBRUosTUFBTUksUUFBUTtJQUN4RDtBQUNGO0FBRUFkLE1BQU1lLElBQUksQ0FBRSxlQUFlWixDQUFBQTtJQUV6QixNQUFNYSxLQUFLLElBQUlsQixLQUFNO1FBQUVtQixT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