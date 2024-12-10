!function(e) {
    if ("object" == typeof exports) module.exports = e();
    else if ("function" == typeof define && define.amd) define(e);
    else {
        var f;
        "undefined" != typeof window ? f = window : "undefined" != typeof global ? f = global : "undefined" != typeof self && (f = self), f.poly2tri = e();
    }
}(function() {
    var define1, module1, exports1;
    return (function e(t, n, r) {
        function s(o, u) {
            if (!n[o]) {
                if (!t[o]) {
                    var a = typeof require == "function" && require;
                    if (!u && a) return a(o, !0);
                    if (i) return i(o, !0);
                    throw new Error("Cannot find module '" + o + "'");
                }
                var f = n[o] = {
                    exports: {}
                };
                t[o][0].call(f.exports, function(e) {
                    var n = t[o][1][e];
                    return s(n ? n : e);
                }, f, f.exports, e, t, n, r);
            }
            return n[o].exports;
        }
        var i = typeof require == "function" && require;
        for(var o = 0; o < r.length; o++)s(r[o]);
        return s;
    })({
        1: [
            function(_dereq_, module1, exports1) {
                module1.exports = {
                    "version": "1.3.5"
                };
            },
            {}
        ],
        2: [
            function(_dereq_, module1, exports1) {
                /*
   * Poly2Tri Copyright (c) 2009-2014, Poly2Tri Contributors
   * http://code.google.com/p/poly2tri/
   *
   * poly2tri.js (JavaScript port) (c) 2009-2014, Poly2Tri Contributors
   * https://github.com/r3mi/poly2tri.js
   *
   * All rights reserved.
   *
   * Distributed under the 3-clause BSD License, see LICENSE.txt
   */ /* jshint maxcomplexity:11 */ "use strict";
                /*
   * Note
   * ====
   * the structure of this JavaScript version of poly2tri intentionally follows
   * as closely as possible the structure of the reference C++ version, to make it
   * easier to keep the 2 versions in sync.
   */ // -------------------------------------------------------------------------Node
                /**
   * Advancing front node
   * @constructor
   * @private
   * @struct
   * @param {!XY} p - Point
   * @param {Triangle=} t triangle (optional)
   */ var Node = function(p, t) {
                    /** @type {XY} */ this.point = p;
                    /** @type {Triangle|null} */ this.triangle = t || null;
                    /** @type {Node|null} */ this.next = null;
                    /** @type {Node|null} */ this.prev = null;
                    /** @type {number} */ this.value = p.x;
                };
                // ---------------------------------------------------------------AdvancingFront
                /**
   * @constructor
   * @private
   * @struct
   * @param {Node} head
   * @param {Node} tail
   */ var AdvancingFront = function(head, tail) {
                    /** @type {Node} */ this.head_ = head;
                    /** @type {Node} */ this.tail_ = tail;
                    /** @type {Node} */ this.search_node_ = head;
                };
                /** @return {Node} */ AdvancingFront.prototype.head = function() {
                    return this.head_;
                };
                /** @param {Node} node */ AdvancingFront.prototype.setHead = function(node) {
                    this.head_ = node;
                };
                /** @return {Node} */ AdvancingFront.prototype.tail = function() {
                    return this.tail_;
                };
                /** @param {Node} node */ AdvancingFront.prototype.setTail = function(node) {
                    this.tail_ = node;
                };
                /** @return {Node} */ AdvancingFront.prototype.search = function() {
                    return this.search_node_;
                };
                /** @param {Node} node */ AdvancingFront.prototype.setSearch = function(node) {
                    this.search_node_ = node;
                };
                /** @return {Node} */ AdvancingFront.prototype.findSearchNode = function() {
                    // TODO: implement BST index
                    return this.search_node_;
                };
                /**
   * @param {number} x value
   * @return {Node}
   */ AdvancingFront.prototype.locateNode = function(x) {
                    var node = this.search_node_;
                    /* jshint boss:true */ if (x < node.value) {
                        while(node = node.prev){
                            if (x >= node.value) {
                                this.search_node_ = node;
                                return node;
                            }
                        }
                    } else {
                        while(node = node.next){
                            if (x < node.value) {
                                this.search_node_ = node.prev;
                                return node.prev;
                            }
                        }
                    }
                    return null;
                };
                /**
   * @param {!XY} point - Point
   * @return {Node}
   */ AdvancingFront.prototype.locatePoint = function(point) {
                    var px = point.x;
                    var node = this.findSearchNode(px);
                    var nx = node.point.x;
                    if (px === nx) {
                        // Here we are comparing point references, not values
                        if (point !== node.point) {
                            // We might have two nodes with same x value for a short time
                            if (point === node.prev.point) {
                                node = node.prev;
                            } else if (point === node.next.point) {
                                node = node.next;
                            } else {
                                throw new Error('poly2tri Invalid AdvancingFront.locatePoint() call');
                            }
                        }
                    } else if (px < nx) {
                        /* jshint boss:true */ while(node = node.prev){
                            if (point === node.point) {
                                break;
                            }
                        }
                    } else {
                        while(node = node.next){
                            if (point === node.point) {
                                break;
                            }
                        }
                    }
                    if (node) {
                        this.search_node_ = node;
                    }
                    return node;
                };
                // ----------------------------------------------------------------------Exports
                module1.exports = AdvancingFront;
                module1.exports.Node = Node;
            },
            {}
        ],
        3: [
            function(_dereq_, module1, exports1) {
                /*
   * Poly2Tri Copyright (c) 2009-2014, Poly2Tri Contributors
   * http://code.google.com/p/poly2tri/
   *
   * poly2tri.js (JavaScript port) (c) 2009-2014, Poly2Tri Contributors
   * https://github.com/r3mi/poly2tri.js
   *
   * All rights reserved.
   *
   * Distributed under the 3-clause BSD License, see LICENSE.txt
   */ "use strict";
                /*
   * Function added in the JavaScript version (was not present in the c++ version)
   */ /**
   * assert and throw an exception.
   *
   * @private
   * @param {boolean} condition   the condition which is asserted
   * @param {string} message      the message which is display is condition is falsy
   */ function assert(condition, message) {
                    if (!condition) {
                        throw new Error(message || "Assert Failed");
                    }
                }
                module1.exports = assert;
            },
            {}
        ],
        4: [
            function(_dereq_, module1, exports1) {
                /*
   * Poly2Tri Copyright (c) 2009-2014, Poly2Tri Contributors
   * http://code.google.com/p/poly2tri/
   *
   * poly2tri.js (JavaScript port) (c) 2009-2014, Poly2Tri Contributors
   * https://github.com/r3mi/poly2tri.js
   *
   * All rights reserved.
   *
   * Distributed under the 3-clause BSD License, see LICENSE.txt
   */ "use strict";
                /*
   * Note
   * ====
   * the structure of this JavaScript version of poly2tri intentionally follows
   * as closely as possible the structure of the reference C++ version, to make it
   * easier to keep the 2 versions in sync.
   */ var xy = _dereq_('./xy');
                // ------------------------------------------------------------------------Point
                /**
   * Construct a point
   * @example
   *      var point = new poly2tri.Point(150, 150);
   * @public
   * @constructor
   * @struct
   * @param {number=} x    coordinate (0 if undefined)
   * @param {number=} y    coordinate (0 if undefined)
   */ var Point = function(x, y) {
                    /**
     * @type {number}
     * @expose
     */ this.x = +x || 0;
                    /**
     * @type {number}
     * @expose
     */ this.y = +y || 0;
                    // All extra fields added to Point are prefixed with _p2t_
                    // to avoid collisions if custom Point class is used.
                    /**
     * The edges this point constitutes an upper ending point
     * @private
     * @type {Array.<Edge>}
     */ this._p2t_edge_list = null;
                };
                /**
   * For pretty printing
   * @example
   *      "p=" + new poly2tri.Point(5,42)
   *      // → "p=(5;42)"
   * @returns {string} <code>"(x;y)"</code>
   */ Point.prototype.toString = function() {
                    return xy.toStringBase(this);
                };
                /**
   * JSON output, only coordinates
   * @example
   *      JSON.stringify(new poly2tri.Point(1,2))
   *      // → '{"x":1,"y":2}'
   */ Point.prototype.toJSON = function() {
                    return {
                        x: this.x,
                        y: this.y
                    };
                };
                /**
   * Creates a copy of this Point object.
   * @return {Point} new cloned point
   */ Point.prototype.clone = function() {
                    return new Point(this.x, this.y);
                };
                /**
   * Set this Point instance to the origo. <code>(0; 0)</code>
   * @return {Point} this (for chaining)
   */ Point.prototype.set_zero = function() {
                    this.x = 0.0;
                    this.y = 0.0;
                    return this; // for chaining
                };
                /**
   * Set the coordinates of this instance.
   * @param {number} x   coordinate
   * @param {number} y   coordinate
   * @return {Point} this (for chaining)
   */ Point.prototype.set = function(x, y) {
                    this.x = +x || 0;
                    this.y = +y || 0;
                    return this; // for chaining
                };
                /**
   * Negate this Point instance. (component-wise)
   * @return {Point} this (for chaining)
   */ Point.prototype.negate = function() {
                    this.x = -this.x;
                    this.y = -this.y;
                    return this; // for chaining
                };
                /**
   * Add another Point object to this instance. (component-wise)
   * @param {!Point} n - Point object.
   * @return {Point} this (for chaining)
   */ Point.prototype.add = function(n) {
                    this.x += n.x;
                    this.y += n.y;
                    return this; // for chaining
                };
                /**
   * Subtract this Point instance with another point given. (component-wise)
   * @param {!Point} n - Point object.
   * @return {Point} this (for chaining)
   */ Point.prototype.sub = function(n) {
                    this.x -= n.x;
                    this.y -= n.y;
                    return this; // for chaining
                };
                /**
   * Multiply this Point instance by a scalar. (component-wise)
   * @param {number} s   scalar.
   * @return {Point} this (for chaining)
   */ Point.prototype.mul = function(s) {
                    this.x *= s;
                    this.y *= s;
                    return this; // for chaining
                };
                /**
   * Return the distance of this Point instance from the origo.
   * @return {number} distance
   */ Point.prototype.length = function() {
                    return Math.sqrt(this.x * this.x + this.y * this.y);
                };
                /**
   * Normalize this Point instance (as a vector).
   * @return {number} The original distance of this instance from the origo.
   */ Point.prototype.normalize = function() {
                    var len = this.length();
                    this.x /= len;
                    this.y /= len;
                    return len;
                };
                /**
   * Test this Point object with another for equality.
   * @param {!XY} p - any "Point like" object with {x,y}
   * @return {boolean} <code>true</code> if same x and y coordinates, <code>false</code> otherwise.
   */ Point.prototype.equals = function(p) {
                    return this.x === p.x && this.y === p.y;
                };
                // -----------------------------------------------------Point ("static" methods)
                /**
   * Negate a point component-wise and return the result as a new Point object.
   * @param {!XY} p - any "Point like" object with {x,y}
   * @return {Point} the resulting Point object.
   */ Point.negate = function(p) {
                    return new Point(-p.x, -p.y);
                };
                /**
   * Add two points component-wise and return the result as a new Point object.
   * @param {!XY} a - any "Point like" object with {x,y}
   * @param {!XY} b - any "Point like" object with {x,y}
   * @return {Point} the resulting Point object.
   */ Point.add = function(a, b) {
                    return new Point(a.x + b.x, a.y + b.y);
                };
                /**
   * Subtract two points component-wise and return the result as a new Point object.
   * @param {!XY} a - any "Point like" object with {x,y}
   * @param {!XY} b - any "Point like" object with {x,y}
   * @return {Point} the resulting Point object.
   */ Point.sub = function(a, b) {
                    return new Point(a.x - b.x, a.y - b.y);
                };
                /**
   * Multiply a point by a scalar and return the result as a new Point object.
   * @param {number} s - the scalar
   * @param {!XY} p - any "Point like" object with {x,y}
   * @return {Point} the resulting Point object.
   */ Point.mul = function(s, p) {
                    return new Point(s * p.x, s * p.y);
                };
                /**
   * Perform the cross product on either two points (this produces a scalar)
   * or a point and a scalar (this produces a point).
   * This function requires two parameters, either may be a Point object or a
   * number.
   * @param  {XY|number} a - Point object or scalar.
   * @param  {XY|number} b - Point object or scalar.
   * @return {Point|number} a Point object or a number, depending on the parameters.
   */ Point.cross = function(a, b) {
                    if (typeof a === 'number') {
                        if (typeof b === 'number') {
                            return a * b;
                        } else {
                            return new Point(-a * b.y, a * b.x);
                        }
                    } else {
                        if (typeof b === 'number') {
                            return new Point(b * a.y, -b * a.x);
                        } else {
                            return a.x * b.y - a.y * b.x;
                        }
                    }
                };
                // -----------------------------------------------------------------"Point-Like"
                /*
   * The following functions operate on "Point" or any "Point like" object
   * with {x,y} (duck typing).
   */ Point.toString = xy.toString;
                Point.compare = xy.compare;
                Point.cmp = xy.compare; // backward compatibility
                Point.equals = xy.equals;
                /**
   * Peform the dot product on two vectors.
   * @public
   * @param {!XY} a - any "Point like" object with {x,y}
   * @param {!XY} b - any "Point like" object with {x,y}
   * @return {number} The dot product
   */ Point.dot = function(a, b) {
                    return a.x * b.x + a.y * b.y;
                };
                // ---------------------------------------------------------Exports (public API)
                module1.exports = Point;
            },
            {
                "./xy": 11
            }
        ],
        5: [
            function(_dereq_, module1, exports1) {
                /*
   * Poly2Tri Copyright (c) 2009-2014, Poly2Tri Contributors
   * http://code.google.com/p/poly2tri/
   *
   * poly2tri.js (JavaScript port) (c) 2009-2014, Poly2Tri Contributors
   * https://github.com/r3mi/poly2tri.js
   *
   * All rights reserved.
   *
   * Distributed under the 3-clause BSD License, see LICENSE.txt
   */ "use strict";
                /*
   * Class added in the JavaScript version (was not present in the c++ version)
   */ var xy = _dereq_('./xy');
                /**
   * Custom exception class to indicate invalid Point values
   * @constructor
   * @public
   * @extends Error
   * @struct
   * @param {string=} message - error message
   * @param {Array.<XY>=} points - invalid points
   */ var PointError = function(message, points) {
                    this.name = "PointError";
                    /**
     * Invalid points
     * @public
     * @type {Array.<XY>}
     */ this.points = points = points || [];
                    /**
     * Error message
     * @public
     * @type {string}
     */ this.message = message || "Invalid Points!";
                    for(var i = 0; i < points.length; i++){
                        this.message += " " + xy.toString(points[i]);
                    }
                };
                PointError.prototype = new Error();
                PointError.prototype.constructor = PointError;
                module1.exports = PointError;
            },
            {
                "./xy": 11
            }
        ],
        6: [
            function(_dereq_, module1, exports1) {
                (function(global1) {
                    /*
     * Poly2Tri Copyright (c) 2009-2014, Poly2Tri Contributors
     * http://code.google.com/p/poly2tri/
     *
     * poly2tri.js (JavaScript port) (c) 2009-2014, Poly2Tri Contributors
     * https://github.com/r3mi/poly2tri.js
     *
     * All rights reserved.
     *
     * Redistribution and use in source and binary forms, with or without modification,
     * are permitted provided that the following conditions are met:
     *
     * * Redistributions of source code must retain the above copyright notice,
     *   this list of conditions and the following disclaimer.
     * * Redistributions in binary form must reproduce the above copyright notice,
     *   this list of conditions and the following disclaimer in the documentation
     *   and/or other materials provided with the distribution.
     * * Neither the name of Poly2Tri nor the names of its contributors may be
     *   used to endorse or promote products derived from this software without specific
     *   prior written permission.
     *
     * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
     * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
     * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
     * A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR
     * CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
     * EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
     * PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
     * PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
     * LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
     * NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
     * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
     */ "use strict";
                    /**
     * Public API for poly2tri.js
     * @module poly2tri
     */ /**
     * If you are not using a module system (e.g. CommonJS, RequireJS), you can access this library
     * as a global variable <code>poly2tri</code> i.e. <code>window.poly2tri</code> in a browser.
     * @name poly2tri
     * @global
     * @public
     * @type {module:poly2tri}
     */ var previousPoly2tri = global1.poly2tri;
                    /**
     * For Browser + &lt;script&gt; :
     * reverts the {@linkcode poly2tri} global object to its previous value,
     * and returns a reference to the instance called.
     *
     * @example
     *              var p = poly2tri.noConflict();
     * @public
     * @return {module:poly2tri} instance called
     */ // (this feature is not automatically provided by browserify).
                    exports1.noConflict = function() {
                        global1.poly2tri = previousPoly2tri;
                        return exports1;
                    };
                    /**
     * poly2tri library version
     * @public
     * @const {string}
     */ exports1.VERSION = _dereq_('../dist/version.json').version;
                    /**
     * Exports the {@linkcode PointError} class.
     * @public
     * @typedef {PointError} module:poly2tri.PointError
     * @function
     */ exports1.PointError = _dereq_('./pointerror');
                    /**
     * Exports the {@linkcode Point} class.
     * @public
     * @typedef {Point} module:poly2tri.Point
     * @function
     */ exports1.Point = _dereq_('./point');
                    /**
     * Exports the {@linkcode Triangle} class.
     * @public
     * @typedef {Triangle} module:poly2tri.Triangle
     * @function
     */ exports1.Triangle = _dereq_('./triangle');
                    /**
     * Exports the {@linkcode SweepContext} class.
     * @public
     * @typedef {SweepContext} module:poly2tri.SweepContext
     * @function
     */ exports1.SweepContext = _dereq_('./sweepcontext');
                    // Backward compatibility
                    var sweep = _dereq_('./sweep');
                    /**
     * @function
     * @deprecated use {@linkcode SweepContext#triangulate} instead
     */ exports1.triangulate = sweep.triangulate;
                    /**
     * @deprecated use {@linkcode SweepContext#triangulate} instead
     * @property {function} Triangulate - use {@linkcode SweepContext#triangulate} instead
     */ exports1.sweep = {
                        Triangulate: sweep.triangulate
                    };
                }).call(this, typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {});
            },
            {
                "../dist/version.json": 1,
                "./point": 4,
                "./pointerror": 5,
                "./sweep": 7,
                "./sweepcontext": 8,
                "./triangle": 9
            }
        ],
        7: [
            function(_dereq_, module1, exports1) {
                /*
   * Poly2Tri Copyright (c) 2009-2014, Poly2Tri Contributors
   * http://code.google.com/p/poly2tri/
   *
   * poly2tri.js (JavaScript port) (c) 2009-2014, Poly2Tri Contributors
   * https://github.com/r3mi/poly2tri.js
   *
   * All rights reserved.
   *
   * Distributed under the 3-clause BSD License, see LICENSE.txt
   */ /* jshint latedef:nofunc, maxcomplexity:9 */ "use strict";
                /**
   * This 'Sweep' module is present in order to keep this JavaScript version
   * as close as possible to the reference C++ version, even though almost all
   * functions could be declared as methods on the {@linkcode module:sweepcontext~SweepContext} object.
   * @module
   * @private
   */ /*
   * Note
   * ====
   * the structure of this JavaScript version of poly2tri intentionally follows
   * as closely as possible the structure of the reference C++ version, to make it
   * easier to keep the 2 versions in sync.
   */ var assert = _dereq_('./assert');
                var PointError = _dereq_('./pointerror');
                var Triangle = _dereq_('./triangle');
                var Node = _dereq_('./advancingfront').Node;
                // ------------------------------------------------------------------------utils
                var utils = _dereq_('./utils');
                /** @const */ var EPSILON = utils.EPSILON;
                /** @const */ var Orientation = utils.Orientation;
                /** @const */ var orient2d = utils.orient2d;
                /** @const */ var inScanArea = utils.inScanArea;
                /** @const */ var isAngleObtuse = utils.isAngleObtuse;
                // ------------------------------------------------------------------------Sweep
                /**
   * Triangulate the polygon with holes and Steiner points.
   * Do this AFTER you've added the polyline, holes, and Steiner points
   * @private
   * @param {!SweepContext} tcx - SweepContext object
   */ function triangulate(tcx) {
                    tcx.initTriangulation();
                    tcx.createAdvancingFront();
                    // Sweep points; build mesh
                    sweepPoints(tcx);
                    // Clean up
                    finalizationPolygon(tcx);
                }
                /**
   * Start sweeping the Y-sorted point set from bottom to top
   * @param {!SweepContext} tcx - SweepContext object
   */ function sweepPoints(tcx) {
                    var i, len = tcx.pointCount();
                    for(i = 1; i < len; ++i){
                        var point = tcx.getPoint(i);
                        var node = pointEvent(tcx, point);
                        var edges = point._p2t_edge_list;
                        for(var j = 0; edges && j < edges.length; ++j){
                            edgeEventByEdge(tcx, edges[j], node);
                        }
                    }
                }
                /**
   * @param {!SweepContext} tcx - SweepContext object
   */ function finalizationPolygon(tcx) {
                    // Get an Internal triangle to start with
                    var t = tcx.front().head().next.triangle;
                    var p = tcx.front().head().next.point;
                    while(!t.getConstrainedEdgeCW(p)){
                        t = t.neighborCCW(p);
                    }
                    // Collect interior triangles constrained by edges
                    tcx.meshClean(t);
                }
                /**
   * Find closes node to the left of the new point and
   * create a new triangle. If needed new holes and basins
   * will be filled to.
   * @param {!SweepContext} tcx - SweepContext object
   * @param {!XY} point   Point
   */ function pointEvent(tcx, point) {
                    var node = tcx.locateNode(point);
                    var new_node = newFrontTriangle(tcx, point, node);
                    // Only need to check +epsilon since point never have smaller
                    // x value than node due to how we fetch nodes from the front
                    if (point.x <= node.point.x + EPSILON) {
                        fill(tcx, node);
                    }
                    //tcx.AddNode(new_node);
                    fillAdvancingFront(tcx, new_node);
                    return new_node;
                }
                function edgeEventByEdge(tcx, edge, node) {
                    tcx.edge_event.constrained_edge = edge;
                    tcx.edge_event.right = edge.p.x > edge.q.x;
                    if (isEdgeSideOfTriangle(node.triangle, edge.p, edge.q)) {
                        return;
                    }
                    // For now we will do all needed filling
                    // TODO: integrate with flip process might give some better performance
                    //       but for now this avoid the issue with cases that needs both flips and fills
                    fillEdgeEvent(tcx, edge, node);
                    edgeEventByPoints(tcx, edge.p, edge.q, node.triangle, edge.q);
                }
                function edgeEventByPoints(tcx, ep, eq, triangle, point) {
                    if (isEdgeSideOfTriangle(triangle, ep, eq)) {
                        return;
                    }
                    var p1 = triangle.pointCCW(point);
                    var o1 = orient2d(eq, p1, ep);
                    if (o1 === Orientation.COLLINEAR) {
                        // TODO integrate here changes from C++ version
                        // (C++ repo revision 09880a869095 dated March 8, 2011)
                        throw new PointError('poly2tri EdgeEvent: Collinear not supported!', [
                            eq,
                            p1,
                            ep
                        ]);
                    }
                    var p2 = triangle.pointCW(point);
                    var o2 = orient2d(eq, p2, ep);
                    if (o2 === Orientation.COLLINEAR) {
                        // TODO integrate here changes from C++ version
                        // (C++ repo revision 09880a869095 dated March 8, 2011)
                        throw new PointError('poly2tri EdgeEvent: Collinear not supported!', [
                            eq,
                            p2,
                            ep
                        ]);
                    }
                    if (o1 === o2) {
                        // Need to decide if we are rotating CW or CCW to get to a triangle
                        // that will cross edge
                        if (o1 === Orientation.CW) {
                            triangle = triangle.neighborCCW(point);
                        } else {
                            triangle = triangle.neighborCW(point);
                        }
                        edgeEventByPoints(tcx, ep, eq, triangle, point);
                    } else {
                        // This triangle crosses constraint so lets flippin start!
                        flipEdgeEvent(tcx, ep, eq, triangle, point);
                    }
                }
                function isEdgeSideOfTriangle(triangle, ep, eq) {
                    var index = triangle.edgeIndex(ep, eq);
                    if (index !== -1) {
                        triangle.markConstrainedEdgeByIndex(index);
                        var t = triangle.getNeighbor(index);
                        if (t) {
                            t.markConstrainedEdgeByPoints(ep, eq);
                        }
                        return true;
                    }
                    return false;
                }
                /**
   * Creates a new front triangle and legalize it
   * @param {!SweepContext} tcx - SweepContext object
   */ function newFrontTriangle(tcx, point, node) {
                    var triangle = new Triangle(point, node.point, node.next.point);
                    triangle.markNeighbor(node.triangle);
                    tcx.addToMap(triangle);
                    var new_node = new Node(point);
                    new_node.next = node.next;
                    new_node.prev = node;
                    node.next.prev = new_node;
                    node.next = new_node;
                    if (!legalize(tcx, triangle)) {
                        tcx.mapTriangleToNodes(triangle);
                    }
                    return new_node;
                }
                /**
   * Adds a triangle to the advancing front to fill a hole.
   * @param {!SweepContext} tcx - SweepContext object
   * @param node - middle node, that is the bottom of the hole
   */ function fill(tcx, node) {
                    var triangle = new Triangle(node.prev.point, node.point, node.next.point);
                    // TODO: should copy the constrained_edge value from neighbor triangles
                    //       for now constrained_edge values are copied during the legalize
                    triangle.markNeighbor(node.prev.triangle);
                    triangle.markNeighbor(node.triangle);
                    tcx.addToMap(triangle);
                    // Update the advancing front
                    node.prev.next = node.next;
                    node.next.prev = node.prev;
                    // If it was legalized the triangle has already been mapped
                    if (!legalize(tcx, triangle)) {
                        tcx.mapTriangleToNodes(triangle);
                    }
                //tcx.removeNode(node);
                }
                /**
   * Fills holes in the Advancing Front
   * @param {!SweepContext} tcx - SweepContext object
   */ function fillAdvancingFront(tcx, n) {
                    // Fill right holes
                    var node = n.next;
                    while(node.next){
                        // TODO integrate here changes from C++ version
                        // (C++ repo revision acf81f1f1764 dated April 7, 2012)
                        if (isAngleObtuse(node.point, node.next.point, node.prev.point)) {
                            break;
                        }
                        fill(tcx, node);
                        node = node.next;
                    }
                    // Fill left holes
                    node = n.prev;
                    while(node.prev){
                        // TODO integrate here changes from C++ version
                        // (C++ repo revision acf81f1f1764 dated April 7, 2012)
                        if (isAngleObtuse(node.point, node.next.point, node.prev.point)) {
                            break;
                        }
                        fill(tcx, node);
                        node = node.prev;
                    }
                    // Fill right basins
                    if (n.next && n.next.next) {
                        if (isBasinAngleRight(n)) {
                            fillBasin(tcx, n);
                        }
                    }
                }
                /**
   * The basin angle is decided against the horizontal line [1,0].
   * @param {Node} node
   * @return {boolean} true if angle < 3*π/4
   */ function isBasinAngleRight(node) {
                    var ax = node.point.x - node.next.next.point.x;
                    var ay = node.point.y - node.next.next.point.y;
                    assert(ay >= 0, "unordered y");
                    return ax >= 0 || Math.abs(ax) < ay;
                }
                /**
   * Returns true if triangle was legalized
   * @param {!SweepContext} tcx - SweepContext object
   * @return {boolean}
   */ function legalize(tcx, t) {
                    // To legalize a triangle we start by finding if any of the three edges
                    // violate the Delaunay condition
                    for(var i = 0; i < 3; ++i){
                        if (t.delaunay_edge[i]) {
                            continue;
                        }
                        var ot = t.getNeighbor(i);
                        if (ot) {
                            var p = t.getPoint(i);
                            var op = ot.oppositePoint(t, p);
                            var oi = ot.index(op);
                            // If this is a Constrained Edge or a Delaunay Edge(only during recursive legalization)
                            // then we should not try to legalize
                            if (ot.constrained_edge[oi] || ot.delaunay_edge[oi]) {
                                t.constrained_edge[i] = ot.constrained_edge[oi];
                                continue;
                            }
                            var inside = inCircle(p, t.pointCCW(p), t.pointCW(p), op);
                            if (inside) {
                                // Lets mark this shared edge as Delaunay
                                t.delaunay_edge[i] = true;
                                ot.delaunay_edge[oi] = true;
                                // Lets rotate shared edge one vertex CW to legalize it
                                rotateTrianglePair(t, p, ot, op);
                                // We now got one valid Delaunay Edge shared by two triangles
                                // This gives us 4 new edges to check for Delaunay
                                // Make sure that triangle to node mapping is done only one time for a specific triangle
                                var not_legalized = !legalize(tcx, t);
                                if (not_legalized) {
                                    tcx.mapTriangleToNodes(t);
                                }
                                not_legalized = !legalize(tcx, ot);
                                if (not_legalized) {
                                    tcx.mapTriangleToNodes(ot);
                                }
                                // Reset the Delaunay edges, since they only are valid Delaunay edges
                                // until we add a new triangle or point.
                                // XXX: need to think about this. Can these edges be tried after we
                                //      return to previous recursive level?
                                t.delaunay_edge[i] = false;
                                ot.delaunay_edge[oi] = false;
                                // If triangle have been legalized no need to check the other edges since
                                // the recursive legalization will handles those so we can end here.
                                return true;
                            }
                        }
                    }
                    return false;
                }
                /**
   * <b>Requirement</b>:<br>
   * 1. a,b and c form a triangle.<br>
   * 2. a and d is know to be on opposite side of bc<br>
   * <pre>
   *                a
   *                +
   *               / \
   *              /   \
   *            b/     \c
   *            +-------+
   *           /    d    \
   *          /           \
   * </pre>
   * <b>Fact</b>: d has to be in area B to have a chance to be inside the circle formed by
   *  a,b and c<br>
   *  d is outside B if orient2d(a,b,d) or orient2d(c,a,d) is CW<br>
   *  This preknowledge gives us a way to optimize the incircle test
   * @param pa - triangle point, opposite d
   * @param pb - triangle point
   * @param pc - triangle point
   * @param pd - point opposite a
   * @return {boolean} true if d is inside circle, false if on circle edge
   */ function inCircle(pa, pb, pc, pd) {
                    var adx = pa.x - pd.x;
                    var ady = pa.y - pd.y;
                    var bdx = pb.x - pd.x;
                    var bdy = pb.y - pd.y;
                    var adxbdy = adx * bdy;
                    var bdxady = bdx * ady;
                    var oabd = adxbdy - bdxady;
                    if (oabd <= 0) {
                        return false;
                    }
                    var cdx = pc.x - pd.x;
                    var cdy = pc.y - pd.y;
                    var cdxady = cdx * ady;
                    var adxcdy = adx * cdy;
                    var ocad = cdxady - adxcdy;
                    if (ocad <= 0) {
                        return false;
                    }
                    var bdxcdy = bdx * cdy;
                    var cdxbdy = cdx * bdy;
                    var alift = adx * adx + ady * ady;
                    var blift = bdx * bdx + bdy * bdy;
                    var clift = cdx * cdx + cdy * cdy;
                    var det = alift * (bdxcdy - cdxbdy) + blift * ocad + clift * oabd;
                    return det > 0;
                }
                /**
   * Rotates a triangle pair one vertex CW
   *<pre>
   *       n2                    n2
   *  P +-----+             P +-----+
   *    | t  /|               |\  t |
   *    |   / |               | \   |
   *  n1|  /  |n3           n1|  \  |n3
   *    | /   |    after CW   |   \ |
   *    |/ oT |               | oT \|
   *    +-----+ oP            +-----+
   *       n4                    n4
   * </pre>
   */ function rotateTrianglePair(t, p, ot, op) {
                    var n1, n2, n3, n4;
                    n1 = t.neighborCCW(p);
                    n2 = t.neighborCW(p);
                    n3 = ot.neighborCCW(op);
                    n4 = ot.neighborCW(op);
                    var ce1, ce2, ce3, ce4;
                    ce1 = t.getConstrainedEdgeCCW(p);
                    ce2 = t.getConstrainedEdgeCW(p);
                    ce3 = ot.getConstrainedEdgeCCW(op);
                    ce4 = ot.getConstrainedEdgeCW(op);
                    var de1, de2, de3, de4;
                    de1 = t.getDelaunayEdgeCCW(p);
                    de2 = t.getDelaunayEdgeCW(p);
                    de3 = ot.getDelaunayEdgeCCW(op);
                    de4 = ot.getDelaunayEdgeCW(op);
                    t.legalize(p, op);
                    ot.legalize(op, p);
                    // Remap delaunay_edge
                    ot.setDelaunayEdgeCCW(p, de1);
                    t.setDelaunayEdgeCW(p, de2);
                    t.setDelaunayEdgeCCW(op, de3);
                    ot.setDelaunayEdgeCW(op, de4);
                    // Remap constrained_edge
                    ot.setConstrainedEdgeCCW(p, ce1);
                    t.setConstrainedEdgeCW(p, ce2);
                    t.setConstrainedEdgeCCW(op, ce3);
                    ot.setConstrainedEdgeCW(op, ce4);
                    // Remap neighbors
                    // XXX: might optimize the markNeighbor by keeping track of
                    //      what side should be assigned to what neighbor after the
                    //      rotation. Now mark neighbor does lots of testing to find
                    //      the right side.
                    t.clearNeighbors();
                    ot.clearNeighbors();
                    if (n1) {
                        ot.markNeighbor(n1);
                    }
                    if (n2) {
                        t.markNeighbor(n2);
                    }
                    if (n3) {
                        t.markNeighbor(n3);
                    }
                    if (n4) {
                        ot.markNeighbor(n4);
                    }
                    t.markNeighbor(ot);
                }
                /**
   * Fills a basin that has formed on the Advancing Front to the right
   * of given node.<br>
   * First we decide a left,bottom and right node that forms the
   * boundaries of the basin. Then we do a reqursive fill.
   *
   * @param {!SweepContext} tcx - SweepContext object
   * @param node - starting node, this or next node will be left node
   */ function fillBasin(tcx, node) {
                    if (orient2d(node.point, node.next.point, node.next.next.point) === Orientation.CCW) {
                        tcx.basin.left_node = node.next.next;
                    } else {
                        tcx.basin.left_node = node.next;
                    }
                    // Find the bottom and right node
                    tcx.basin.bottom_node = tcx.basin.left_node;
                    while(tcx.basin.bottom_node.next && tcx.basin.bottom_node.point.y >= tcx.basin.bottom_node.next.point.y){
                        tcx.basin.bottom_node = tcx.basin.bottom_node.next;
                    }
                    if (tcx.basin.bottom_node === tcx.basin.left_node) {
                        // No valid basin
                        return;
                    }
                    tcx.basin.right_node = tcx.basin.bottom_node;
                    while(tcx.basin.right_node.next && tcx.basin.right_node.point.y < tcx.basin.right_node.next.point.y){
                        tcx.basin.right_node = tcx.basin.right_node.next;
                    }
                    if (tcx.basin.right_node === tcx.basin.bottom_node) {
                        // No valid basins
                        return;
                    }
                    tcx.basin.width = tcx.basin.right_node.point.x - tcx.basin.left_node.point.x;
                    tcx.basin.left_highest = tcx.basin.left_node.point.y > tcx.basin.right_node.point.y;
                    fillBasinReq(tcx, tcx.basin.bottom_node);
                }
                /**
   * Recursive algorithm to fill a Basin with triangles
   *
   * @param {!SweepContext} tcx - SweepContext object
   * @param node - bottom_node
   */ function fillBasinReq(tcx, node) {
                    // if shallow stop filling
                    if (isShallow(tcx, node)) {
                        return;
                    }
                    fill(tcx, node);
                    var o;
                    if (node.prev === tcx.basin.left_node && node.next === tcx.basin.right_node) {
                        return;
                    } else if (node.prev === tcx.basin.left_node) {
                        o = orient2d(node.point, node.next.point, node.next.next.point);
                        if (o === Orientation.CW) {
                            return;
                        }
                        node = node.next;
                    } else if (node.next === tcx.basin.right_node) {
                        o = orient2d(node.point, node.prev.point, node.prev.prev.point);
                        if (o === Orientation.CCW) {
                            return;
                        }
                        node = node.prev;
                    } else {
                        // Continue with the neighbor node with lowest Y value
                        if (node.prev.point.y < node.next.point.y) {
                            node = node.prev;
                        } else {
                            node = node.next;
                        }
                    }
                    fillBasinReq(tcx, node);
                }
                function isShallow(tcx, node) {
                    var height;
                    if (tcx.basin.left_highest) {
                        height = tcx.basin.left_node.point.y - node.point.y;
                    } else {
                        height = tcx.basin.right_node.point.y - node.point.y;
                    }
                    // if shallow stop filling
                    if (tcx.basin.width > height) {
                        return true;
                    }
                    return false;
                }
                function fillEdgeEvent(tcx, edge, node) {
                    if (tcx.edge_event.right) {
                        fillRightAboveEdgeEvent(tcx, edge, node);
                    } else {
                        fillLeftAboveEdgeEvent(tcx, edge, node);
                    }
                }
                function fillRightAboveEdgeEvent(tcx, edge, node) {
                    while(node.next.point.x < edge.p.x){
                        // Check if next node is below the edge
                        if (orient2d(edge.q, node.next.point, edge.p) === Orientation.CCW) {
                            fillRightBelowEdgeEvent(tcx, edge, node);
                        } else {
                            node = node.next;
                        }
                    }
                }
                function fillRightBelowEdgeEvent(tcx, edge, node) {
                    if (node.point.x < edge.p.x) {
                        if (orient2d(node.point, node.next.point, node.next.next.point) === Orientation.CCW) {
                            // Concave
                            fillRightConcaveEdgeEvent(tcx, edge, node);
                        } else {
                            // Convex
                            fillRightConvexEdgeEvent(tcx, edge, node);
                            // Retry this one
                            fillRightBelowEdgeEvent(tcx, edge, node);
                        }
                    }
                }
                function fillRightConcaveEdgeEvent(tcx, edge, node) {
                    fill(tcx, node.next);
                    if (node.next.point !== edge.p) {
                        // Next above or below edge?
                        if (orient2d(edge.q, node.next.point, edge.p) === Orientation.CCW) {
                            // Below
                            if (orient2d(node.point, node.next.point, node.next.next.point) === Orientation.CCW) {
                                // Next is concave
                                fillRightConcaveEdgeEvent(tcx, edge, node);
                            } else {
                            // Next is convex
                            /* jshint noempty:false */ }
                        }
                    }
                }
                function fillRightConvexEdgeEvent(tcx, edge, node) {
                    // Next concave or convex?
                    if (orient2d(node.next.point, node.next.next.point, node.next.next.next.point) === Orientation.CCW) {
                        // Concave
                        fillRightConcaveEdgeEvent(tcx, edge, node.next);
                    } else {
                        // Convex
                        // Next above or below edge?
                        if (orient2d(edge.q, node.next.next.point, edge.p) === Orientation.CCW) {
                            // Below
                            fillRightConvexEdgeEvent(tcx, edge, node.next);
                        } else {
                        // Above
                        /* jshint noempty:false */ }
                    }
                }
                function fillLeftAboveEdgeEvent(tcx, edge, node) {
                    while(node.prev.point.x > edge.p.x){
                        // Check if next node is below the edge
                        if (orient2d(edge.q, node.prev.point, edge.p) === Orientation.CW) {
                            fillLeftBelowEdgeEvent(tcx, edge, node);
                        } else {
                            node = node.prev;
                        }
                    }
                }
                function fillLeftBelowEdgeEvent(tcx, edge, node) {
                    if (node.point.x > edge.p.x) {
                        if (orient2d(node.point, node.prev.point, node.prev.prev.point) === Orientation.CW) {
                            // Concave
                            fillLeftConcaveEdgeEvent(tcx, edge, node);
                        } else {
                            // Convex
                            fillLeftConvexEdgeEvent(tcx, edge, node);
                            // Retry this one
                            fillLeftBelowEdgeEvent(tcx, edge, node);
                        }
                    }
                }
                function fillLeftConvexEdgeEvent(tcx, edge, node) {
                    // Next concave or convex?
                    if (orient2d(node.prev.point, node.prev.prev.point, node.prev.prev.prev.point) === Orientation.CW) {
                        // Concave
                        fillLeftConcaveEdgeEvent(tcx, edge, node.prev);
                    } else {
                        // Convex
                        // Next above or below edge?
                        if (orient2d(edge.q, node.prev.prev.point, edge.p) === Orientation.CW) {
                            // Below
                            fillLeftConvexEdgeEvent(tcx, edge, node.prev);
                        } else {
                        // Above
                        /* jshint noempty:false */ }
                    }
                }
                function fillLeftConcaveEdgeEvent(tcx, edge, node) {
                    fill(tcx, node.prev);
                    if (node.prev.point !== edge.p) {
                        // Next above or below edge?
                        if (orient2d(edge.q, node.prev.point, edge.p) === Orientation.CW) {
                            // Below
                            if (orient2d(node.point, node.prev.point, node.prev.prev.point) === Orientation.CW) {
                                // Next is concave
                                fillLeftConcaveEdgeEvent(tcx, edge, node);
                            } else {
                            // Next is convex
                            /* jshint noempty:false */ }
                        }
                    }
                }
                function flipEdgeEvent(tcx, ep, eq, t, p) {
                    var ot = t.neighborAcross(p);
                    assert(ot, "FLIP failed due to missing triangle!");
                    var op = ot.oppositePoint(t, p);
                    // Additional check from Java version (see issue #88)
                    if (t.getConstrainedEdgeAcross(p)) {
                        var index = t.index(p);
                        throw new PointError("poly2tri Intersecting Constraints", [
                            p,
                            op,
                            t.getPoint((index + 1) % 3),
                            t.getPoint((index + 2) % 3)
                        ]);
                    }
                    if (inScanArea(p, t.pointCCW(p), t.pointCW(p), op)) {
                        // Lets rotate shared edge one vertex CW
                        rotateTrianglePair(t, p, ot, op);
                        tcx.mapTriangleToNodes(t);
                        tcx.mapTriangleToNodes(ot);
                        // XXX: in the original C++ code for the next 2 lines, we are
                        // comparing point values (and not pointers). In this JavaScript
                        // code, we are comparing point references (pointers). This works
                        // because we can't have 2 different points with the same values.
                        // But to be really equivalent, we should use "Point.equals" here.
                        if (p === eq && op === ep) {
                            if (eq === tcx.edge_event.constrained_edge.q && ep === tcx.edge_event.constrained_edge.p) {
                                t.markConstrainedEdgeByPoints(ep, eq);
                                ot.markConstrainedEdgeByPoints(ep, eq);
                                legalize(tcx, t);
                                legalize(tcx, ot);
                            } else {
                            // XXX: I think one of the triangles should be legalized here?
                            /* jshint noempty:false */ }
                        } else {
                            var o = orient2d(eq, op, ep);
                            t = nextFlipTriangle(tcx, o, t, ot, p, op);
                            flipEdgeEvent(tcx, ep, eq, t, p);
                        }
                    } else {
                        var newP = nextFlipPoint(ep, eq, ot, op);
                        flipScanEdgeEvent(tcx, ep, eq, t, ot, newP);
                        edgeEventByPoints(tcx, ep, eq, t, p);
                    }
                }
                /**
   * After a flip we have two triangles and know that only one will still be
   * intersecting the edge. So decide which to contiune with and legalize the other
   *
   * @param {!SweepContext} tcx - SweepContext object
   * @param o - should be the result of an orient2d( eq, op, ep )
   * @param t - triangle 1
   * @param ot - triangle 2
   * @param p - a point shared by both triangles
   * @param op - another point shared by both triangles
   * @return returns the triangle still intersecting the edge
   */ function nextFlipTriangle(tcx, o, t, ot, p, op) {
                    var edge_index;
                    if (o === Orientation.CCW) {
                        // ot is not crossing edge after flip
                        edge_index = ot.edgeIndex(p, op);
                        ot.delaunay_edge[edge_index] = true;
                        legalize(tcx, ot);
                        ot.clearDelaunayEdges();
                        return t;
                    }
                    // t is not crossing edge after flip
                    edge_index = t.edgeIndex(p, op);
                    t.delaunay_edge[edge_index] = true;
                    legalize(tcx, t);
                    t.clearDelaunayEdges();
                    return ot;
                }
                /**
   * When we need to traverse from one triangle to the next we need
   * the point in current triangle that is the opposite point to the next
   * triangle.
   */ function nextFlipPoint(ep, eq, ot, op) {
                    var o2d = orient2d(eq, op, ep);
                    if (o2d === Orientation.CW) {
                        // Right
                        return ot.pointCCW(op);
                    } else if (o2d === Orientation.CCW) {
                        // Left
                        return ot.pointCW(op);
                    } else {
                        throw new PointError("poly2tri [Unsupported] nextFlipPoint: opposing point on constrained edge!", [
                            eq,
                            op,
                            ep
                        ]);
                    }
                }
                /**
   * Scan part of the FlipScan algorithm<br>
   * When a triangle pair isn't flippable we will scan for the next
   * point that is inside the flip triangle scan area. When found
   * we generate a new flipEdgeEvent
   *
   * @param {!SweepContext} tcx - SweepContext object
   * @param ep - last point on the edge we are traversing
   * @param eq - first point on the edge we are traversing
   * @param {!Triangle} flip_triangle - the current triangle sharing the point eq with edge
   * @param t
   * @param p
   */ function flipScanEdgeEvent(tcx, ep, eq, flip_triangle, t, p) {
                    var ot = t.neighborAcross(p);
                    assert(ot, "FLIP failed due to missing triangle");
                    var op = ot.oppositePoint(t, p);
                    if (inScanArea(eq, flip_triangle.pointCCW(eq), flip_triangle.pointCW(eq), op)) {
                        // flip with new edge op.eq
                        flipEdgeEvent(tcx, eq, op, ot, op);
                    } else {
                        var newP = nextFlipPoint(ep, eq, ot, op);
                        flipScanEdgeEvent(tcx, ep, eq, flip_triangle, ot, newP);
                    }
                }
                // ----------------------------------------------------------------------Exports
                exports1.triangulate = triangulate;
            },
            {
                "./advancingfront": 2,
                "./assert": 3,
                "./pointerror": 5,
                "./triangle": 9,
                "./utils": 10
            }
        ],
        8: [
            function(_dereq_, module1, exports1) {
                /*
   * Poly2Tri Copyright (c) 2009-2014, Poly2Tri Contributors
   * http://code.google.com/p/poly2tri/
   *
   * poly2tri.js (JavaScript port) (c) 2009-2014, Poly2Tri Contributors
   * https://github.com/r3mi/poly2tri.js
   *
   * All rights reserved.
   *
   * Distributed under the 3-clause BSD License, see LICENSE.txt
   */ /* jshint maxcomplexity:6 */ "use strict";
                /*
   * Note
   * ====
   * the structure of this JavaScript version of poly2tri intentionally follows
   * as closely as possible the structure of the reference C++ version, to make it
   * easier to keep the 2 versions in sync.
   */ var PointError = _dereq_('./pointerror');
                var Point = _dereq_('./point');
                var Triangle = _dereq_('./triangle');
                var sweep = _dereq_('./sweep');
                var AdvancingFront = _dereq_('./advancingfront');
                var Node = AdvancingFront.Node;
                // ------------------------------------------------------------------------utils
                /**
   * Initial triangle factor, seed triangle will extend 30% of
   * PointSet width to both left and right.
   * @private
   * @const
   */ var kAlpha = 0.3;
                // -------------------------------------------------------------------------Edge
                /**
   * Represents a simple polygon's edge
   * @constructor
   * @struct
   * @private
   * @param {Point} p1
   * @param {Point} p2
   * @throw {PointError} if p1 is same as p2
   */ var Edge = function(p1, p2) {
                    this.p = p1;
                    this.q = p2;
                    if (p1.y > p2.y) {
                        this.q = p1;
                        this.p = p2;
                    } else if (p1.y === p2.y) {
                        if (p1.x > p2.x) {
                            this.q = p1;
                            this.p = p2;
                        } else if (p1.x === p2.x) {
                            throw new PointError('poly2tri Invalid Edge constructor: repeated points!', [
                                p1
                            ]);
                        }
                    }
                    if (!this.q._p2t_edge_list) {
                        this.q._p2t_edge_list = [];
                    }
                    this.q._p2t_edge_list.push(this);
                };
                // ------------------------------------------------------------------------Basin
                /**
   * @constructor
   * @struct
   * @private
   */ var Basin = function() {
                    /** @type {Node} */ this.left_node = null;
                    /** @type {Node} */ this.bottom_node = null;
                    /** @type {Node} */ this.right_node = null;
                    /** @type {number} */ this.width = 0.0;
                    /** @type {boolean} */ this.left_highest = false;
                };
                Basin.prototype.clear = function() {
                    this.left_node = null;
                    this.bottom_node = null;
                    this.right_node = null;
                    this.width = 0.0;
                    this.left_highest = false;
                };
                // --------------------------------------------------------------------EdgeEvent
                /**
   * @constructor
   * @struct
   * @private
   */ var EdgeEvent = function() {
                    /** @type {Edge} */ this.constrained_edge = null;
                    /** @type {boolean} */ this.right = false;
                };
                // ----------------------------------------------------SweepContext (public API)
                /**
   * SweepContext constructor option
   * @typedef {Object} SweepContextOptions
   * @property {boolean=} cloneArrays - if <code>true</code>, do a shallow copy of the Array parameters
   *                  (contour, holes). Points inside arrays are never copied.
   *                  Default is <code>false</code> : keep a reference to the array arguments,
   *                  who will be modified in place.
   */ /**
   * Constructor for the triangulation context.
   * It accepts a simple polyline (with non repeating points),
   * which defines the constrained edges.
   *
   * @example
   *          var contour = [
   *              new poly2tri.Point(100, 100),
   *              new poly2tri.Point(100, 300),
   *              new poly2tri.Point(300, 300),
   *              new poly2tri.Point(300, 100)
   *          ];
   *          var swctx = new poly2tri.SweepContext(contour, {cloneArrays: true});
   * @example
   *          var contour = [{x:100, y:100}, {x:100, y:300}, {x:300, y:300}, {x:300, y:100}];
   *          var swctx = new poly2tri.SweepContext(contour, {cloneArrays: true});
   * @constructor
   * @public
   * @struct
   * @param {Array.<XY>} contour - array of point objects. The points can be either {@linkcode Point} instances,
   *          or any "Point like" custom class with <code>{x, y}</code> attributes.
   * @param {SweepContextOptions=} options - constructor options
   */ var SweepContext = function(contour, options) {
                    options = options || {};
                    this.triangles_ = [];
                    this.map_ = [];
                    this.points_ = options.cloneArrays ? contour.slice(0) : contour;
                    this.edge_list = [];
                    // Bounding box of all points. Computed at the start of the triangulation,
                    // it is stored in case it is needed by the caller.
                    this.pmin_ = this.pmax_ = null;
                    /**
     * Advancing front
     * @private
     * @type {AdvancingFront}
     */ this.front_ = null;
                    /**
     * head point used with advancing front
     * @private
     * @type {Point}
     */ this.head_ = null;
                    /**
     * tail point used with advancing front
     * @private
     * @type {Point}
     */ this.tail_ = null;
                    /**
     * @private
     * @type {Node}
     */ this.af_head_ = null;
                    /**
     * @private
     * @type {Node}
     */ this.af_middle_ = null;
                    /**
     * @private
     * @type {Node}
     */ this.af_tail_ = null;
                    this.basin = new Basin();
                    this.edge_event = new EdgeEvent();
                    this.initEdges(this.points_);
                };
                /**
   * Add a hole to the constraints
   * @example
   *      var swctx = new poly2tri.SweepContext(contour);
   *      var hole = [
   *          new poly2tri.Point(200, 200),
   *          new poly2tri.Point(200, 250),
   *          new poly2tri.Point(250, 250)
   *      ];
   *      swctx.addHole(hole);
   * @example
   *      var swctx = new poly2tri.SweepContext(contour);
   *      swctx.addHole([{x:200, y:200}, {x:200, y:250}, {x:250, y:250}]);
   * @public
   * @param {Array.<XY>} polyline - array of "Point like" objects with {x,y}
   */ SweepContext.prototype.addHole = function(polyline) {
                    this.initEdges(polyline);
                    var i, len = polyline.length;
                    for(i = 0; i < len; i++){
                        this.points_.push(polyline[i]);
                    }
                    return this; // for chaining
                };
                /**
   * For backward compatibility
   * @function
   * @deprecated use {@linkcode SweepContext#addHole} instead
   */ SweepContext.prototype.AddHole = SweepContext.prototype.addHole;
                /**
   * Add several holes to the constraints
   * @example
   *      var swctx = new poly2tri.SweepContext(contour);
   *      var holes = [
   *          [ new poly2tri.Point(200, 200), new poly2tri.Point(200, 250), new poly2tri.Point(250, 250) ],
   *          [ new poly2tri.Point(300, 300), new poly2tri.Point(300, 350), new poly2tri.Point(350, 350) ]
   *      ];
   *      swctx.addHoles(holes);
   * @example
   *      var swctx = new poly2tri.SweepContext(contour);
   *      var holes = [
   *          [{x:200, y:200}, {x:200, y:250}, {x:250, y:250}],
   *          [{x:300, y:300}, {x:300, y:350}, {x:350, y:350}]
   *      ];
   *      swctx.addHoles(holes);
   * @public
   * @param {Array.<Array.<XY>>} holes - array of array of "Point like" objects with {x,y}
   */ // Method added in the JavaScript version (was not present in the c++ version)
                SweepContext.prototype.addHoles = function(holes) {
                    var i, len = holes.length;
                    for(i = 0; i < len; i++){
                        this.initEdges(holes[i]);
                    }
                    this.points_ = this.points_.concat.apply(this.points_, holes);
                    return this; // for chaining
                };
                /**
   * Add a Steiner point to the constraints
   * @example
   *      var swctx = new poly2tri.SweepContext(contour);
   *      var point = new poly2tri.Point(150, 150);
   *      swctx.addPoint(point);
   * @example
   *      var swctx = new poly2tri.SweepContext(contour);
   *      swctx.addPoint({x:150, y:150});
   * @public
   * @param {XY} point - any "Point like" object with {x,y}
   */ SweepContext.prototype.addPoint = function(point) {
                    this.points_.push(point);
                    return this; // for chaining
                };
                /**
   * For backward compatibility
   * @function
   * @deprecated use {@linkcode SweepContext#addPoint} instead
   */ SweepContext.prototype.AddPoint = SweepContext.prototype.addPoint;
                /**
   * Add several Steiner points to the constraints
   * @example
   *      var swctx = new poly2tri.SweepContext(contour);
   *      var points = [
   *          new poly2tri.Point(150, 150),
   *          new poly2tri.Point(200, 250),
   *          new poly2tri.Point(250, 250)
   *      ];
   *      swctx.addPoints(points);
   * @example
   *      var swctx = new poly2tri.SweepContext(contour);
   *      swctx.addPoints([{x:150, y:150}, {x:200, y:250}, {x:250, y:250}]);
   * @public
   * @param {Array.<XY>} points - array of "Point like" object with {x,y}
   */ // Method added in the JavaScript version (was not present in the c++ version)
                SweepContext.prototype.addPoints = function(points) {
                    this.points_ = this.points_.concat(points);
                    return this; // for chaining
                };
                /**
   * Triangulate the polygon with holes and Steiner points.
   * Do this AFTER you've added the polyline, holes, and Steiner points
   * @example
   *      var swctx = new poly2tri.SweepContext(contour);
   *      swctx.triangulate();
   *      var triangles = swctx.getTriangles();
   * @public
   */ // Shortcut method for sweep.triangulate(SweepContext).
                // Method added in the JavaScript version (was not present in the c++ version)
                SweepContext.prototype.triangulate = function() {
                    sweep.triangulate(this);
                    return this; // for chaining
                };
                /**
   * Get the bounding box of the provided constraints (contour, holes and
   * Steinter points). Warning : these values are not available if the triangulation
   * has not been done yet.
   * @public
   * @returns {{min:Point,max:Point}} object with 'min' and 'max' Point
   */ // Method added in the JavaScript version (was not present in the c++ version)
                SweepContext.prototype.getBoundingBox = function() {
                    return {
                        min: this.pmin_,
                        max: this.pmax_
                    };
                };
                /**
   * Get result of triangulation.
   * The output triangles have vertices which are references
   * to the initial input points (not copies): any custom fields in the
   * initial points can be retrieved in the output triangles.
   * @example
   *      var swctx = new poly2tri.SweepContext(contour);
   *      swctx.triangulate();
   *      var triangles = swctx.getTriangles();
   * @example
   *      var contour = [{x:100, y:100, id:1}, {x:100, y:300, id:2}, {x:300, y:300, id:3}];
   *      var swctx = new poly2tri.SweepContext(contour);
   *      swctx.triangulate();
   *      var triangles = swctx.getTriangles();
   *      typeof triangles[0].getPoint(0).id
   *      // → "number"
   * @public
   * @returns {array<Triangle>}   array of triangles
   */ SweepContext.prototype.getTriangles = function() {
                    return this.triangles_;
                };
                /**
   * For backward compatibility
   * @function
   * @deprecated use {@linkcode SweepContext#getTriangles} instead
   */ SweepContext.prototype.GetTriangles = SweepContext.prototype.getTriangles;
                // ---------------------------------------------------SweepContext (private API)
                /** @private */ SweepContext.prototype.front = function() {
                    return this.front_;
                };
                /** @private */ SweepContext.prototype.pointCount = function() {
                    return this.points_.length;
                };
                /** @private */ SweepContext.prototype.head = function() {
                    return this.head_;
                };
                /** @private */ SweepContext.prototype.setHead = function(p1) {
                    this.head_ = p1;
                };
                /** @private */ SweepContext.prototype.tail = function() {
                    return this.tail_;
                };
                /** @private */ SweepContext.prototype.setTail = function(p1) {
                    this.tail_ = p1;
                };
                /** @private */ SweepContext.prototype.getMap = function() {
                    return this.map_;
                };
                /** @private */ SweepContext.prototype.initTriangulation = function() {
                    var xmax = this.points_[0].x;
                    var xmin = this.points_[0].x;
                    var ymax = this.points_[0].y;
                    var ymin = this.points_[0].y;
                    // Calculate bounds
                    var i, len = this.points_.length;
                    for(i = 1; i < len; i++){
                        var p = this.points_[i];
                        /* jshint expr:true */ p.x > xmax && (xmax = p.x);
                        p.x < xmin && (xmin = p.x);
                        p.y > ymax && (ymax = p.y);
                        p.y < ymin && (ymin = p.y);
                    }
                    this.pmin_ = new Point(xmin, ymin);
                    this.pmax_ = new Point(xmax, ymax);
                    var dx = kAlpha * (xmax - xmin);
                    var dy = kAlpha * (ymax - ymin);
                    this.head_ = new Point(xmax + dx, ymin - dy);
                    this.tail_ = new Point(xmin - dx, ymin - dy);
                    // Sort points along y-axis
                    this.points_.sort(Point.compare);
                };
                /** @private */ SweepContext.prototype.initEdges = function(polyline) {
                    var i, len = polyline.length;
                    for(i = 0; i < len; ++i){
                        this.edge_list.push(new Edge(polyline[i], polyline[(i + 1) % len]));
                    }
                };
                /** @private */ SweepContext.prototype.getPoint = function(index) {
                    return this.points_[index];
                };
                /** @private */ SweepContext.prototype.addToMap = function(triangle) {
                    this.map_.push(triangle);
                };
                /** @private */ SweepContext.prototype.locateNode = function(point) {
                    return this.front_.locateNode(point.x);
                };
                /** @private */ SweepContext.prototype.createAdvancingFront = function() {
                    var head;
                    var middle;
                    var tail;
                    // Initial triangle
                    var triangle = new Triangle(this.points_[0], this.tail_, this.head_);
                    this.map_.push(triangle);
                    head = new Node(triangle.getPoint(1), triangle);
                    middle = new Node(triangle.getPoint(0), triangle);
                    tail = new Node(triangle.getPoint(2));
                    this.front_ = new AdvancingFront(head, tail);
                    head.next = middle;
                    middle.next = tail;
                    middle.prev = head;
                    tail.prev = middle;
                };
                /** @private */ SweepContext.prototype.removeNode = function(node) {
                // do nothing
                /* jshint unused:false */ };
                /** @private */ SweepContext.prototype.mapTriangleToNodes = function(t) {
                    for(var i = 0; i < 3; ++i){
                        if (!t.getNeighbor(i)) {
                            var n = this.front_.locatePoint(t.pointCW(t.getPoint(i)));
                            if (n) {
                                n.triangle = t;
                            }
                        }
                    }
                };
                /** @private */ SweepContext.prototype.removeFromMap = function(triangle) {
                    var i, map = this.map_, len = map.length;
                    for(i = 0; i < len; i++){
                        if (map[i] === triangle) {
                            map.splice(i, 1);
                            break;
                        }
                    }
                };
                /**
   * Do a depth first traversal to collect triangles
   * @private
   * @param {Triangle} triangle start
   */ SweepContext.prototype.meshClean = function(triangle) {
                    // New implementation avoids recursive calls and use a loop instead.
                    // Cf. issues # 57, 65 and 69.
                    var triangles = [
                        triangle
                    ], t, i;
                    /* jshint boss:true */ while(t = triangles.pop()){
                        if (!t.isInterior()) {
                            t.setInterior(true);
                            this.triangles_.push(t);
                            for(i = 0; i < 3; i++){
                                if (!t.constrained_edge[i]) {
                                    triangles.push(t.getNeighbor(i));
                                }
                            }
                        }
                    }
                };
                // ----------------------------------------------------------------------Exports
                module1.exports = SweepContext;
            },
            {
                "./advancingfront": 2,
                "./point": 4,
                "./pointerror": 5,
                "./sweep": 7,
                "./triangle": 9
            }
        ],
        9: [
            function(_dereq_, module1, exports1) {
                /*
   * Poly2Tri Copyright (c) 2009-2014, Poly2Tri Contributors
   * http://code.google.com/p/poly2tri/
   *
   * poly2tri.js (JavaScript port) (c) 2009-2014, Poly2Tri Contributors
   * https://github.com/r3mi/poly2tri.js
   *
   * All rights reserved.
   *
   * Distributed under the 3-clause BSD License, see LICENSE.txt
   */ /* jshint maxcomplexity:10 */ "use strict";
                /*
   * Note
   * ====
   * the structure of this JavaScript version of poly2tri intentionally follows
   * as closely as possible the structure of the reference C++ version, to make it
   * easier to keep the 2 versions in sync.
   */ var xy = _dereq_("./xy");
                // ---------------------------------------------------------------------Triangle
                /**
   * Triangle class.<br>
   * Triangle-based data structures are known to have better performance than
   * quad-edge structures.
   * See: J. Shewchuk, "Triangle: Engineering a 2D Quality Mesh Generator and
   * Delaunay Triangulator", "Triangulations in CGAL"
   *
   * @constructor
   * @struct
   * @param {!XY} pa  point object with {x,y}
   * @param {!XY} pb  point object with {x,y}
   * @param {!XY} pc  point object with {x,y}
   */ var Triangle = function(a, b, c) {
                    /**
     * Triangle points
     * @private
     * @type {Array.<XY>}
     */ this.points_ = [
                        a,
                        b,
                        c
                    ];
                    /**
     * Neighbor list
     * @private
     * @type {Array.<Triangle>}
     */ this.neighbors_ = [
                        null,
                        null,
                        null
                    ];
                    /**
     * Has this triangle been marked as an interior triangle?
     * @private
     * @type {boolean}
     */ this.interior_ = false;
                    /**
     * Flags to determine if an edge is a Constrained edge
     * @private
     * @type {Array.<boolean>}
     */ this.constrained_edge = [
                        false,
                        false,
                        false
                    ];
                    /**
     * Flags to determine if an edge is a Delauney edge
     * @private
     * @type {Array.<boolean>}
     */ this.delaunay_edge = [
                        false,
                        false,
                        false
                    ];
                };
                var p2s = xy.toString;
                /**
   * For pretty printing ex. <code>"[(5;42)(10;20)(21;30)]"</code>.
   * @public
   * @return {string}
   */ Triangle.prototype.toString = function() {
                    return "[" + p2s(this.points_[0]) + p2s(this.points_[1]) + p2s(this.points_[2]) + "]";
                };
                /**
   * Get one vertice of the triangle.
   * The output triangles of a triangulation have vertices which are references
   * to the initial input points (not copies): any custom fields in the
   * initial points can be retrieved in the output triangles.
   * @example
   *      var contour = [{x:100, y:100, id:1}, {x:100, y:300, id:2}, {x:300, y:300, id:3}];
   *      var swctx = new poly2tri.SweepContext(contour);
   *      swctx.triangulate();
   *      var triangles = swctx.getTriangles();
   *      typeof triangles[0].getPoint(0).id
   *      // → "number"
   * @param {number} index - vertice index: 0, 1 or 2
   * @public
   * @returns {XY}
   */ Triangle.prototype.getPoint = function(index) {
                    return this.points_[index];
                };
                /**
   * For backward compatibility
   * @function
   * @deprecated use {@linkcode Triangle#getPoint} instead
   */ Triangle.prototype.GetPoint = Triangle.prototype.getPoint;
                /**
   * Get all 3 vertices of the triangle as an array
   * @public
   * @return {Array.<XY>}
   */ // Method added in the JavaScript version (was not present in the c++ version)
                Triangle.prototype.getPoints = function() {
                    return this.points_;
                };
                /**
   * @private
   * @param {number} index
   * @returns {?Triangle}
   */ Triangle.prototype.getNeighbor = function(index) {
                    return this.neighbors_[index];
                };
                /**
   * Test if this Triangle contains the Point object given as parameter as one of its vertices.
   * Only point references are compared, not values.
   * @public
   * @param {XY} point - point object with {x,y}
   * @return {boolean} <code>True</code> if the Point object is of the Triangle's vertices,
   *         <code>false</code> otherwise.
   */ Triangle.prototype.containsPoint = function(point) {
                    var points = this.points_;
                    // Here we are comparing point references, not values
                    return point === points[0] || point === points[1] || point === points[2];
                };
                /**
   * Test if this Triangle contains the Edge object given as parameter as its
   * bounding edges. Only point references are compared, not values.
   * @private
   * @param {Edge} edge
   * @return {boolean} <code>True</code> if the Edge object is of the Triangle's bounding
   *         edges, <code>false</code> otherwise.
   */ Triangle.prototype.containsEdge = function(edge) {
                    return this.containsPoint(edge.p) && this.containsPoint(edge.q);
                };
                /**
   * Test if this Triangle contains the two Point objects given as parameters among its vertices.
   * Only point references are compared, not values.
   * @param {XY} p1 - point object with {x,y}
   * @param {XY} p2 - point object with {x,y}
   * @return {boolean}
   */ Triangle.prototype.containsPoints = function(p1, p2) {
                    return this.containsPoint(p1) && this.containsPoint(p2);
                };
                /**
   * Has this triangle been marked as an interior triangle?
   * @returns {boolean}
   */ Triangle.prototype.isInterior = function() {
                    return this.interior_;
                };
                /**
   * Mark this triangle as an interior triangle
   * @private
   * @param {boolean} interior
   * @returns {Triangle} this
   */ Triangle.prototype.setInterior = function(interior) {
                    this.interior_ = interior;
                    return this;
                };
                /**
   * Update neighbor pointers.
   * @private
   * @param {XY} p1 - point object with {x,y}
   * @param {XY} p2 - point object with {x,y}
   * @param {Triangle} t Triangle object.
   * @throws {Error} if can't find objects
   */ Triangle.prototype.markNeighborPointers = function(p1, p2, t) {
                    var points = this.points_;
                    // Here we are comparing point references, not values
                    if (p1 === points[2] && p2 === points[1] || p1 === points[1] && p2 === points[2]) {
                        this.neighbors_[0] = t;
                    } else if (p1 === points[0] && p2 === points[2] || p1 === points[2] && p2 === points[0]) {
                        this.neighbors_[1] = t;
                    } else if (p1 === points[0] && p2 === points[1] || p1 === points[1] && p2 === points[0]) {
                        this.neighbors_[2] = t;
                    } else {
                        throw new Error('poly2tri Invalid Triangle.markNeighborPointers() call');
                    }
                };
                /**
   * Exhaustive search to update neighbor pointers
   * @private
   * @param {!Triangle} t
   */ Triangle.prototype.markNeighbor = function(t) {
                    var points = this.points_;
                    if (t.containsPoints(points[1], points[2])) {
                        this.neighbors_[0] = t;
                        t.markNeighborPointers(points[1], points[2], this);
                    } else if (t.containsPoints(points[0], points[2])) {
                        this.neighbors_[1] = t;
                        t.markNeighborPointers(points[0], points[2], this);
                    } else if (t.containsPoints(points[0], points[1])) {
                        this.neighbors_[2] = t;
                        t.markNeighborPointers(points[0], points[1], this);
                    }
                };
                Triangle.prototype.clearNeighbors = function() {
                    this.neighbors_[0] = null;
                    this.neighbors_[1] = null;
                    this.neighbors_[2] = null;
                };
                Triangle.prototype.clearDelaunayEdges = function() {
                    this.delaunay_edge[0] = false;
                    this.delaunay_edge[1] = false;
                    this.delaunay_edge[2] = false;
                };
                /**
   * Returns the point clockwise to the given point.
   * @private
   * @param {XY} p - point object with {x,y}
   */ Triangle.prototype.pointCW = function(p) {
                    var points = this.points_;
                    // Here we are comparing point references, not values
                    if (p === points[0]) {
                        return points[2];
                    } else if (p === points[1]) {
                        return points[0];
                    } else if (p === points[2]) {
                        return points[1];
                    } else {
                        return null;
                    }
                };
                /**
   * Returns the point counter-clockwise to the given point.
   * @private
   * @param {XY} p - point object with {x,y}
   */ Triangle.prototype.pointCCW = function(p) {
                    var points = this.points_;
                    // Here we are comparing point references, not values
                    if (p === points[0]) {
                        return points[1];
                    } else if (p === points[1]) {
                        return points[2];
                    } else if (p === points[2]) {
                        return points[0];
                    } else {
                        return null;
                    }
                };
                /**
   * Returns the neighbor clockwise to given point.
   * @private
   * @param {XY} p - point object with {x,y}
   */ Triangle.prototype.neighborCW = function(p) {
                    // Here we are comparing point references, not values
                    if (p === this.points_[0]) {
                        return this.neighbors_[1];
                    } else if (p === this.points_[1]) {
                        return this.neighbors_[2];
                    } else {
                        return this.neighbors_[0];
                    }
                };
                /**
   * Returns the neighbor counter-clockwise to given point.
   * @private
   * @param {XY} p - point object with {x,y}
   */ Triangle.prototype.neighborCCW = function(p) {
                    // Here we are comparing point references, not values
                    if (p === this.points_[0]) {
                        return this.neighbors_[2];
                    } else if (p === this.points_[1]) {
                        return this.neighbors_[0];
                    } else {
                        return this.neighbors_[1];
                    }
                };
                Triangle.prototype.getConstrainedEdgeCW = function(p) {
                    // Here we are comparing point references, not values
                    if (p === this.points_[0]) {
                        return this.constrained_edge[1];
                    } else if (p === this.points_[1]) {
                        return this.constrained_edge[2];
                    } else {
                        return this.constrained_edge[0];
                    }
                };
                Triangle.prototype.getConstrainedEdgeCCW = function(p) {
                    // Here we are comparing point references, not values
                    if (p === this.points_[0]) {
                        return this.constrained_edge[2];
                    } else if (p === this.points_[1]) {
                        return this.constrained_edge[0];
                    } else {
                        return this.constrained_edge[1];
                    }
                };
                // Additional check from Java version (see issue #88)
                Triangle.prototype.getConstrainedEdgeAcross = function(p) {
                    // Here we are comparing point references, not values
                    if (p === this.points_[0]) {
                        return this.constrained_edge[0];
                    } else if (p === this.points_[1]) {
                        return this.constrained_edge[1];
                    } else {
                        return this.constrained_edge[2];
                    }
                };
                Triangle.prototype.setConstrainedEdgeCW = function(p, ce) {
                    // Here we are comparing point references, not values
                    if (p === this.points_[0]) {
                        this.constrained_edge[1] = ce;
                    } else if (p === this.points_[1]) {
                        this.constrained_edge[2] = ce;
                    } else {
                        this.constrained_edge[0] = ce;
                    }
                };
                Triangle.prototype.setConstrainedEdgeCCW = function(p, ce) {
                    // Here we are comparing point references, not values
                    if (p === this.points_[0]) {
                        this.constrained_edge[2] = ce;
                    } else if (p === this.points_[1]) {
                        this.constrained_edge[0] = ce;
                    } else {
                        this.constrained_edge[1] = ce;
                    }
                };
                Triangle.prototype.getDelaunayEdgeCW = function(p) {
                    // Here we are comparing point references, not values
                    if (p === this.points_[0]) {
                        return this.delaunay_edge[1];
                    } else if (p === this.points_[1]) {
                        return this.delaunay_edge[2];
                    } else {
                        return this.delaunay_edge[0];
                    }
                };
                Triangle.prototype.getDelaunayEdgeCCW = function(p) {
                    // Here we are comparing point references, not values
                    if (p === this.points_[0]) {
                        return this.delaunay_edge[2];
                    } else if (p === this.points_[1]) {
                        return this.delaunay_edge[0];
                    } else {
                        return this.delaunay_edge[1];
                    }
                };
                Triangle.prototype.setDelaunayEdgeCW = function(p, e) {
                    // Here we are comparing point references, not values
                    if (p === this.points_[0]) {
                        this.delaunay_edge[1] = e;
                    } else if (p === this.points_[1]) {
                        this.delaunay_edge[2] = e;
                    } else {
                        this.delaunay_edge[0] = e;
                    }
                };
                Triangle.prototype.setDelaunayEdgeCCW = function(p, e) {
                    // Here we are comparing point references, not values
                    if (p === this.points_[0]) {
                        this.delaunay_edge[2] = e;
                    } else if (p === this.points_[1]) {
                        this.delaunay_edge[0] = e;
                    } else {
                        this.delaunay_edge[1] = e;
                    }
                };
                /**
   * The neighbor across to given point.
   * @private
   * @param {XY} p - point object with {x,y}
   * @returns {Triangle}
   */ Triangle.prototype.neighborAcross = function(p) {
                    // Here we are comparing point references, not values
                    if (p === this.points_[0]) {
                        return this.neighbors_[0];
                    } else if (p === this.points_[1]) {
                        return this.neighbors_[1];
                    } else {
                        return this.neighbors_[2];
                    }
                };
                /**
   * @private
   * @param {!Triangle} t Triangle object.
   * @param {XY} p - point object with {x,y}
   */ Triangle.prototype.oppositePoint = function(t, p) {
                    var cw = t.pointCW(p);
                    return this.pointCW(cw);
                };
                /**
   * Legalize triangle by rotating clockwise around oPoint
   * @private
   * @param {XY} opoint - point object with {x,y}
   * @param {XY} npoint - point object with {x,y}
   * @throws {Error} if oPoint can not be found
   */ Triangle.prototype.legalize = function(opoint, npoint) {
                    var points = this.points_;
                    // Here we are comparing point references, not values
                    if (opoint === points[0]) {
                        points[1] = points[0];
                        points[0] = points[2];
                        points[2] = npoint;
                    } else if (opoint === points[1]) {
                        points[2] = points[1];
                        points[1] = points[0];
                        points[0] = npoint;
                    } else if (opoint === points[2]) {
                        points[0] = points[2];
                        points[2] = points[1];
                        points[1] = npoint;
                    } else {
                        throw new Error('poly2tri Invalid Triangle.legalize() call');
                    }
                };
                /**
   * Returns the index of a point in the triangle.
   * The point *must* be a reference to one of the triangle's vertices.
   * @private
   * @param {XY} p - point object with {x,y}
   * @returns {number} index 0, 1 or 2
   * @throws {Error} if p can not be found
   */ Triangle.prototype.index = function(p) {
                    var points = this.points_;
                    // Here we are comparing point references, not values
                    if (p === points[0]) {
                        return 0;
                    } else if (p === points[1]) {
                        return 1;
                    } else if (p === points[2]) {
                        return 2;
                    } else {
                        throw new Error('poly2tri Invalid Triangle.index() call');
                    }
                };
                /**
   * @private
   * @param {XY} p1 - point object with {x,y}
   * @param {XY} p2 - point object with {x,y}
   * @return {number} index 0, 1 or 2, or -1 if errror
   */ Triangle.prototype.edgeIndex = function(p1, p2) {
                    var points = this.points_;
                    // Here we are comparing point references, not values
                    if (p1 === points[0]) {
                        if (p2 === points[1]) {
                            return 2;
                        } else if (p2 === points[2]) {
                            return 1;
                        }
                    } else if (p1 === points[1]) {
                        if (p2 === points[2]) {
                            return 0;
                        } else if (p2 === points[0]) {
                            return 2;
                        }
                    } else if (p1 === points[2]) {
                        if (p2 === points[0]) {
                            return 1;
                        } else if (p2 === points[1]) {
                            return 0;
                        }
                    }
                    return -1;
                };
                /**
   * Mark an edge of this triangle as constrained.
   * @private
   * @param {number} index - edge index
   */ Triangle.prototype.markConstrainedEdgeByIndex = function(index) {
                    this.constrained_edge[index] = true;
                };
                /**
   * Mark an edge of this triangle as constrained.
   * @private
   * @param {Edge} edge instance
   */ Triangle.prototype.markConstrainedEdgeByEdge = function(edge) {
                    this.markConstrainedEdgeByPoints(edge.p, edge.q);
                };
                /**
   * Mark an edge of this triangle as constrained.
   * This method takes two Point instances defining the edge of the triangle.
   * @private
   * @param {XY} p - point object with {x,y}
   * @param {XY} q - point object with {x,y}
   */ Triangle.prototype.markConstrainedEdgeByPoints = function(p, q) {
                    var points = this.points_;
                    // Here we are comparing point references, not values
                    if (q === points[0] && p === points[1] || q === points[1] && p === points[0]) {
                        this.constrained_edge[2] = true;
                    } else if (q === points[0] && p === points[2] || q === points[2] && p === points[0]) {
                        this.constrained_edge[1] = true;
                    } else if (q === points[1] && p === points[2] || q === points[2] && p === points[1]) {
                        this.constrained_edge[0] = true;
                    }
                };
                // ---------------------------------------------------------Exports (public API)
                module1.exports = Triangle;
            },
            {
                "./xy": 11
            }
        ],
        10: [
            function(_dereq_, module1, exports1) {
                /*
   * Poly2Tri Copyright (c) 2009-2014, Poly2Tri Contributors
   * http://code.google.com/p/poly2tri/
   *
   * poly2tri.js (JavaScript port) (c) 2009-2014, Poly2Tri Contributors
   * https://github.com/r3mi/poly2tri.js
   *
   * All rights reserved.
   *
   * Distributed under the 3-clause BSD License, see LICENSE.txt
   */ "use strict";
                /**
   * Precision to detect repeated or collinear points
   * @private
   * @const {number}
   * @default
   */ var EPSILON = 1e-12;
                exports1.EPSILON = EPSILON;
                /**
   * @private
   * @enum {number}
   * @readonly
   */ var Orientation = {
                    "CW": 1,
                    "CCW": -1,
                    "COLLINEAR": 0
                };
                exports1.Orientation = Orientation;
                /**
   * Formula to calculate signed area<br>
   * Positive if CCW<br>
   * Negative if CW<br>
   * 0 if collinear<br>
   * <pre>
   * A[P1,P2,P3]  =  (x1*y2 - y1*x2) + (x2*y3 - y2*x3) + (x3*y1 - y3*x1)
   *              =  (x1-x3)*(y2-y3) - (y1-y3)*(x2-x3)
   * </pre>
   *
   * @private
   * @param {!XY} pa  point object with {x,y}
   * @param {!XY} pb  point object with {x,y}
   * @param {!XY} pc  point object with {x,y}
   * @return {Orientation}
   */ function orient2d(pa, pb, pc) {
                    var detleft = (pa.x - pc.x) * (pb.y - pc.y);
                    var detright = (pa.y - pc.y) * (pb.x - pc.x);
                    var val = detleft - detright;
                    if (val > -EPSILON && val < EPSILON) {
                        return Orientation.COLLINEAR;
                    } else if (val > 0) {
                        return Orientation.CCW;
                    } else {
                        return Orientation.CW;
                    }
                }
                exports1.orient2d = orient2d;
                /**
   *
   * @private
   * @param {!XY} pa  point object with {x,y}
   * @param {!XY} pb  point object with {x,y}
   * @param {!XY} pc  point object with {x,y}
   * @param {!XY} pd  point object with {x,y}
   * @return {boolean}
   */ function inScanArea(pa, pb, pc, pd) {
                    var oadb = (pa.x - pb.x) * (pd.y - pb.y) - (pd.x - pb.x) * (pa.y - pb.y);
                    if (oadb >= -EPSILON) {
                        return false;
                    }
                    var oadc = (pa.x - pc.x) * (pd.y - pc.y) - (pd.x - pc.x) * (pa.y - pc.y);
                    if (oadc <= EPSILON) {
                        return false;
                    }
                    return true;
                }
                exports1.inScanArea = inScanArea;
                /**
   * Check if the angle between (pa,pb) and (pa,pc) is obtuse i.e. (angle > π/2 || angle < -π/2)
   *
   * @private
   * @param {!XY} pa  point object with {x,y}
   * @param {!XY} pb  point object with {x,y}
   * @param {!XY} pc  point object with {x,y}
   * @return {boolean} true if angle is obtuse
   */ function isAngleObtuse(pa, pb, pc) {
                    var ax = pb.x - pa.x;
                    var ay = pb.y - pa.y;
                    var bx = pc.x - pa.x;
                    var by = pc.y - pa.y;
                    return ax * bx + ay * by < 0;
                }
                exports1.isAngleObtuse = isAngleObtuse;
            },
            {}
        ],
        11: [
            function(_dereq_, module1, exports1) {
                /*
   * Poly2Tri Copyright (c) 2009-2014, Poly2Tri Contributors
   * http://code.google.com/p/poly2tri/
   *
   * poly2tri.js (JavaScript port) (c) 2009-2014, Poly2Tri Contributors
   * https://github.com/r3mi/poly2tri.js
   *
   * All rights reserved.
   *
   * Distributed under the 3-clause BSD License, see LICENSE.txt
   */ "use strict";
                /**
   * The following functions operate on "Point" or any "Point like" object with {x,y},
   * as defined by the {@link XY} type
   * ([duck typing]{@link http://en.wikipedia.org/wiki/Duck_typing}).
   * @module
   * @private
   */ /**
   * poly2tri.js supports using custom point class instead of {@linkcode Point}.
   * Any "Point like" object with <code>{x, y}</code> attributes is supported
   * to initialize the SweepContext polylines and points
   * ([duck typing]{@link http://en.wikipedia.org/wiki/Duck_typing}).
   *
   * poly2tri.js might add extra fields to the point objects when computing the
   * triangulation : they are prefixed with <code>_p2t_</code> to avoid collisions
   * with fields in the custom class.
   *
   * @example
   *      var contour = [{x:100, y:100}, {x:100, y:300}, {x:300, y:300}, {x:300, y:100}];
   *      var swctx = new poly2tri.SweepContext(contour);
   *
   * @typedef {Object} XY
   * @property {number} x - x coordinate
   * @property {number} y - y coordinate
   */ /**
   * Point pretty printing : prints x and y coordinates.
   * @example
   *      xy.toStringBase({x:5, y:42})
   *      // → "(5;42)"
   * @protected
   * @param {!XY} p - point object with {x,y}
   * @returns {string} <code>"(x;y)"</code>
   */ function toStringBase(p) {
                    return "(" + p.x + ";" + p.y + ")";
                }
                /**
   * Point pretty printing. Delegates to the point's custom "toString()" method if exists,
   * else simply prints x and y coordinates.
   * @example
   *      xy.toString({x:5, y:42})
   *      // → "(5;42)"
   * @example
   *      xy.toString({x:5,y:42,toString:function() {return this.x+":"+this.y;}})
   *      // → "5:42"
   * @param {!XY} p - point object with {x,y}
   * @returns {string} <code>"(x;y)"</code>
   */ function toString(p) {
                    // Try a custom toString first, and fallback to own implementation if none
                    var s = p.toString();
                    return s === '[object Object]' ? toStringBase(p) : s;
                }
                /**
   * Compare two points component-wise. Ordered by y axis first, then x axis.
   * @param {!XY} a - point object with {x,y}
   * @param {!XY} b - point object with {x,y}
   * @return {number} <code>&lt; 0</code> if <code>a &lt; b</code>,
   *         <code>&gt; 0</code> if <code>a &gt; b</code>,
   *         <code>0</code> otherwise.
   */ function compare(a, b) {
                    if (a.y === b.y) {
                        return a.x - b.x;
                    } else {
                        return a.y - b.y;
                    }
                }
                /**
   * Test two Point objects for equality.
   * @param {!XY} a - point object with {x,y}
   * @param {!XY} b - point object with {x,y}
   * @return {boolean} <code>True</code> if <code>a == b</code>, <code>false</code> otherwise.
   */ function equals(a, b) {
                    return a.x === b.x && a.y === b.y;
                }
                module1.exports = {
                    toString: toString,
                    toStringBase: toStringBase,
                    compare: compare,
                    equals: equals
                };
            },
            {}
        ]
    }, {}, [
        6
    ])(6);
});

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NoZXJwYS9saWIvcG9seTJ0cmktMS4zLjUuanMiXSwic291cmNlc0NvbnRlbnQiOlsiIWZ1bmN0aW9uKGUpe2lmKFwib2JqZWN0XCI9PXR5cGVvZiBleHBvcnRzKW1vZHVsZS5leHBvcnRzPWUoKTtlbHNlIGlmKFwiZnVuY3Rpb25cIj09dHlwZW9mIGRlZmluZSYmZGVmaW5lLmFtZClkZWZpbmUoZSk7ZWxzZXt2YXIgZjtcInVuZGVmaW5lZFwiIT10eXBlb2Ygd2luZG93P2Y9d2luZG93OlwidW5kZWZpbmVkXCIhPXR5cGVvZiBnbG9iYWw/Zj1nbG9iYWw6XCJ1bmRlZmluZWRcIiE9dHlwZW9mIHNlbGYmJihmPXNlbGYpLGYucG9seTJ0cmk9ZSgpfX0oZnVuY3Rpb24oKXt2YXIgZGVmaW5lLG1vZHVsZSxleHBvcnRzO3JldHVybiAoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3Rocm93IG5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIil9dmFyIGY9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGYuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sZixmLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSh7MTpbZnVuY3Rpb24oX2RlcmVxXyxtb2R1bGUsZXhwb3J0cyl7XG4gIG1vZHVsZS5leHBvcnRzPXtcInZlcnNpb25cIjogXCIxLjMuNVwifVxufSx7fV0sMjpbZnVuY3Rpb24oX2RlcmVxXyxtb2R1bGUsZXhwb3J0cyl7XG4gIC8qXG4gICAqIFBvbHkyVHJpIENvcHlyaWdodCAoYykgMjAwOS0yMDE0LCBQb2x5MlRyaSBDb250cmlidXRvcnNcbiAgICogaHR0cDovL2NvZGUuZ29vZ2xlLmNvbS9wL3BvbHkydHJpL1xuICAgKlxuICAgKiBwb2x5MnRyaS5qcyAoSmF2YVNjcmlwdCBwb3J0KSAoYykgMjAwOS0yMDE0LCBQb2x5MlRyaSBDb250cmlidXRvcnNcbiAgICogaHR0cHM6Ly9naXRodWIuY29tL3IzbWkvcG9seTJ0cmkuanNcbiAgICpcbiAgICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAgICpcbiAgICogRGlzdHJpYnV0ZWQgdW5kZXIgdGhlIDMtY2xhdXNlIEJTRCBMaWNlbnNlLCBzZWUgTElDRU5TRS50eHRcbiAgICovXG5cbiAgLyoganNoaW50IG1heGNvbXBsZXhpdHk6MTEgKi9cblxuICBcInVzZSBzdHJpY3RcIjtcblxuXG4gIC8qXG4gICAqIE5vdGVcbiAgICogPT09PVxuICAgKiB0aGUgc3RydWN0dXJlIG9mIHRoaXMgSmF2YVNjcmlwdCB2ZXJzaW9uIG9mIHBvbHkydHJpIGludGVudGlvbmFsbHkgZm9sbG93c1xuICAgKiBhcyBjbG9zZWx5IGFzIHBvc3NpYmxlIHRoZSBzdHJ1Y3R1cmUgb2YgdGhlIHJlZmVyZW5jZSBDKysgdmVyc2lvbiwgdG8gbWFrZSBpdFxuICAgKiBlYXNpZXIgdG8ga2VlcCB0aGUgMiB2ZXJzaW9ucyBpbiBzeW5jLlxuICAgKi9cblxuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tTm9kZVxuXG4gIC8qKlxuICAgKiBBZHZhbmNpbmcgZnJvbnQgbm9kZVxuICAgKiBAY29uc3RydWN0b3JcbiAgICogQHByaXZhdGVcbiAgICogQHN0cnVjdFxuICAgKiBAcGFyYW0geyFYWX0gcCAtIFBvaW50XG4gICAqIEBwYXJhbSB7VHJpYW5nbGU9fSB0IHRyaWFuZ2xlIChvcHRpb25hbClcbiAgICovXG4gIHZhciBOb2RlID0gZnVuY3Rpb24ocCwgdCkge1xuICAgIC8qKiBAdHlwZSB7WFl9ICovXG4gICAgdGhpcy5wb2ludCA9IHA7XG5cbiAgICAvKiogQHR5cGUge1RyaWFuZ2xlfG51bGx9ICovXG4gICAgdGhpcy50cmlhbmdsZSA9IHQgfHwgbnVsbDtcblxuICAgIC8qKiBAdHlwZSB7Tm9kZXxudWxsfSAqL1xuICAgIHRoaXMubmV4dCA9IG51bGw7XG4gICAgLyoqIEB0eXBlIHtOb2RlfG51bGx9ICovXG4gICAgdGhpcy5wcmV2ID0gbnVsbDtcblxuICAgIC8qKiBAdHlwZSB7bnVtYmVyfSAqL1xuICAgIHRoaXMudmFsdWUgPSBwLng7XG4gIH07XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLUFkdmFuY2luZ0Zyb250XG4gIC8qKlxuICAgKiBAY29uc3RydWN0b3JcbiAgICogQHByaXZhdGVcbiAgICogQHN0cnVjdFxuICAgKiBAcGFyYW0ge05vZGV9IGhlYWRcbiAgICogQHBhcmFtIHtOb2RlfSB0YWlsXG4gICAqL1xuICB2YXIgQWR2YW5jaW5nRnJvbnQgPSBmdW5jdGlvbihoZWFkLCB0YWlsKSB7XG4gICAgLyoqIEB0eXBlIHtOb2RlfSAqL1xuICAgIHRoaXMuaGVhZF8gPSBoZWFkO1xuICAgIC8qKiBAdHlwZSB7Tm9kZX0gKi9cbiAgICB0aGlzLnRhaWxfID0gdGFpbDtcbiAgICAvKiogQHR5cGUge05vZGV9ICovXG4gICAgdGhpcy5zZWFyY2hfbm9kZV8gPSBoZWFkO1xuICB9O1xuXG4gIC8qKiBAcmV0dXJuIHtOb2RlfSAqL1xuICBBZHZhbmNpbmdGcm9udC5wcm90b3R5cGUuaGVhZCA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLmhlYWRfO1xuICB9O1xuXG4gIC8qKiBAcGFyYW0ge05vZGV9IG5vZGUgKi9cbiAgQWR2YW5jaW5nRnJvbnQucHJvdG90eXBlLnNldEhlYWQgPSBmdW5jdGlvbihub2RlKSB7XG4gICAgdGhpcy5oZWFkXyA9IG5vZGU7XG4gIH07XG5cbiAgLyoqIEByZXR1cm4ge05vZGV9ICovXG4gIEFkdmFuY2luZ0Zyb250LnByb3RvdHlwZS50YWlsID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMudGFpbF87XG4gIH07XG5cbiAgLyoqIEBwYXJhbSB7Tm9kZX0gbm9kZSAqL1xuICBBZHZhbmNpbmdGcm9udC5wcm90b3R5cGUuc2V0VGFpbCA9IGZ1bmN0aW9uKG5vZGUpIHtcbiAgICB0aGlzLnRhaWxfID0gbm9kZTtcbiAgfTtcblxuICAvKiogQHJldHVybiB7Tm9kZX0gKi9cbiAgQWR2YW5jaW5nRnJvbnQucHJvdG90eXBlLnNlYXJjaCA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLnNlYXJjaF9ub2RlXztcbiAgfTtcblxuICAvKiogQHBhcmFtIHtOb2RlfSBub2RlICovXG4gIEFkdmFuY2luZ0Zyb250LnByb3RvdHlwZS5zZXRTZWFyY2ggPSBmdW5jdGlvbihub2RlKSB7XG4gICAgdGhpcy5zZWFyY2hfbm9kZV8gPSBub2RlO1xuICB9O1xuXG4gIC8qKiBAcmV0dXJuIHtOb2RlfSAqL1xuICBBZHZhbmNpbmdGcm9udC5wcm90b3R5cGUuZmluZFNlYXJjaE5vZGUgPSBmdW5jdGlvbigvKngqLykge1xuICAgIC8vIFRPRE86IGltcGxlbWVudCBCU1QgaW5kZXhcbiAgICByZXR1cm4gdGhpcy5zZWFyY2hfbm9kZV87XG4gIH07XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7bnVtYmVyfSB4IHZhbHVlXG4gICAqIEByZXR1cm4ge05vZGV9XG4gICAqL1xuICBBZHZhbmNpbmdGcm9udC5wcm90b3R5cGUubG9jYXRlTm9kZSA9IGZ1bmN0aW9uKHgpIHtcbiAgICB2YXIgbm9kZSA9IHRoaXMuc2VhcmNoX25vZGVfO1xuXG4gICAgLyoganNoaW50IGJvc3M6dHJ1ZSAqL1xuICAgIGlmICh4IDwgbm9kZS52YWx1ZSkge1xuICAgICAgd2hpbGUgKG5vZGUgPSBub2RlLnByZXYpIHtcbiAgICAgICAgaWYgKHggPj0gbm9kZS52YWx1ZSkge1xuICAgICAgICAgIHRoaXMuc2VhcmNoX25vZGVfID0gbm9kZTtcbiAgICAgICAgICByZXR1cm4gbm9kZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICB3aGlsZSAobm9kZSA9IG5vZGUubmV4dCkge1xuICAgICAgICBpZiAoeCA8IG5vZGUudmFsdWUpIHtcbiAgICAgICAgICB0aGlzLnNlYXJjaF9ub2RlXyA9IG5vZGUucHJldjtcbiAgICAgICAgICByZXR1cm4gbm9kZS5wcmV2O1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBudWxsO1xuICB9O1xuXG4gIC8qKlxuICAgKiBAcGFyYW0geyFYWX0gcG9pbnQgLSBQb2ludFxuICAgKiBAcmV0dXJuIHtOb2RlfVxuICAgKi9cbiAgQWR2YW5jaW5nRnJvbnQucHJvdG90eXBlLmxvY2F0ZVBvaW50ID0gZnVuY3Rpb24ocG9pbnQpIHtcbiAgICB2YXIgcHggPSBwb2ludC54O1xuICAgIHZhciBub2RlID0gdGhpcy5maW5kU2VhcmNoTm9kZShweCk7XG4gICAgdmFyIG54ID0gbm9kZS5wb2ludC54O1xuXG4gICAgaWYgKHB4ID09PSBueCkge1xuICAgICAgLy8gSGVyZSB3ZSBhcmUgY29tcGFyaW5nIHBvaW50IHJlZmVyZW5jZXMsIG5vdCB2YWx1ZXNcbiAgICAgIGlmIChwb2ludCAhPT0gbm9kZS5wb2ludCkge1xuICAgICAgICAvLyBXZSBtaWdodCBoYXZlIHR3byBub2RlcyB3aXRoIHNhbWUgeCB2YWx1ZSBmb3IgYSBzaG9ydCB0aW1lXG4gICAgICAgIGlmIChwb2ludCA9PT0gbm9kZS5wcmV2LnBvaW50KSB7XG4gICAgICAgICAgbm9kZSA9IG5vZGUucHJldjtcbiAgICAgICAgfSBlbHNlIGlmIChwb2ludCA9PT0gbm9kZS5uZXh0LnBvaW50KSB7XG4gICAgICAgICAgbm9kZSA9IG5vZGUubmV4dDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ3BvbHkydHJpIEludmFsaWQgQWR2YW5jaW5nRnJvbnQubG9jYXRlUG9pbnQoKSBjYWxsJyk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKHB4IDwgbngpIHtcbiAgICAgIC8qIGpzaGludCBib3NzOnRydWUgKi9cbiAgICAgIHdoaWxlIChub2RlID0gbm9kZS5wcmV2KSB7XG4gICAgICAgIGlmIChwb2ludCA9PT0gbm9kZS5wb2ludCkge1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHdoaWxlIChub2RlID0gbm9kZS5uZXh0KSB7XG4gICAgICAgIGlmIChwb2ludCA9PT0gbm9kZS5wb2ludCkge1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKG5vZGUpIHtcbiAgICAgIHRoaXMuc2VhcmNoX25vZGVfID0gbm9kZTtcbiAgICB9XG4gICAgcmV0dXJuIG5vZGU7XG4gIH07XG5cblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLUV4cG9ydHNcblxuICBtb2R1bGUuZXhwb3J0cyA9IEFkdmFuY2luZ0Zyb250O1xuICBtb2R1bGUuZXhwb3J0cy5Ob2RlID0gTm9kZTtcblxuXG59LHt9XSwzOltmdW5jdGlvbihfZGVyZXFfLG1vZHVsZSxleHBvcnRzKXtcbiAgLypcbiAgICogUG9seTJUcmkgQ29weXJpZ2h0IChjKSAyMDA5LTIwMTQsIFBvbHkyVHJpIENvbnRyaWJ1dG9yc1xuICAgKiBodHRwOi8vY29kZS5nb29nbGUuY29tL3AvcG9seTJ0cmkvXG4gICAqXG4gICAqIHBvbHkydHJpLmpzIChKYXZhU2NyaXB0IHBvcnQpIChjKSAyMDA5LTIwMTQsIFBvbHkyVHJpIENvbnRyaWJ1dG9yc1xuICAgKiBodHRwczovL2dpdGh1Yi5jb20vcjNtaS9wb2x5MnRyaS5qc1xuICAgKlxuICAgKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICAgKlxuICAgKiBEaXN0cmlidXRlZCB1bmRlciB0aGUgMy1jbGF1c2UgQlNEIExpY2Vuc2UsIHNlZSBMSUNFTlNFLnR4dFxuICAgKi9cblxuICBcInVzZSBzdHJpY3RcIjtcblxuICAvKlxuICAgKiBGdW5jdGlvbiBhZGRlZCBpbiB0aGUgSmF2YVNjcmlwdCB2ZXJzaW9uICh3YXMgbm90IHByZXNlbnQgaW4gdGhlIGMrKyB2ZXJzaW9uKVxuICAgKi9cblxuICAvKipcbiAgICogYXNzZXJ0IGFuZCB0aHJvdyBhbiBleGNlcHRpb24uXG4gICAqXG4gICAqIEBwcml2YXRlXG4gICAqIEBwYXJhbSB7Ym9vbGVhbn0gY29uZGl0aW9uICAgdGhlIGNvbmRpdGlvbiB3aGljaCBpcyBhc3NlcnRlZFxuICAgKiBAcGFyYW0ge3N0cmluZ30gbWVzc2FnZSAgICAgIHRoZSBtZXNzYWdlIHdoaWNoIGlzIGRpc3BsYXkgaXMgY29uZGl0aW9uIGlzIGZhbHN5XG4gICAqL1xuICBmdW5jdGlvbiBhc3NlcnQoY29uZGl0aW9uLCBtZXNzYWdlKSB7XG4gICAgaWYgKCFjb25kaXRpb24pIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihtZXNzYWdlIHx8IFwiQXNzZXJ0IEZhaWxlZFwiKTtcbiAgICB9XG4gIH1cbiAgbW9kdWxlLmV4cG9ydHMgPSBhc3NlcnQ7XG5cblxuXG59LHt9XSw0OltmdW5jdGlvbihfZGVyZXFfLG1vZHVsZSxleHBvcnRzKXtcbiAgLypcbiAgICogUG9seTJUcmkgQ29weXJpZ2h0IChjKSAyMDA5LTIwMTQsIFBvbHkyVHJpIENvbnRyaWJ1dG9yc1xuICAgKiBodHRwOi8vY29kZS5nb29nbGUuY29tL3AvcG9seTJ0cmkvXG4gICAqXG4gICAqIHBvbHkydHJpLmpzIChKYXZhU2NyaXB0IHBvcnQpIChjKSAyMDA5LTIwMTQsIFBvbHkyVHJpIENvbnRyaWJ1dG9yc1xuICAgKiBodHRwczovL2dpdGh1Yi5jb20vcjNtaS9wb2x5MnRyaS5qc1xuICAgKlxuICAgKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICAgKlxuICAgKiBEaXN0cmlidXRlZCB1bmRlciB0aGUgMy1jbGF1c2UgQlNEIExpY2Vuc2UsIHNlZSBMSUNFTlNFLnR4dFxuICAgKi9cblxuICBcInVzZSBzdHJpY3RcIjtcblxuXG4gIC8qXG4gICAqIE5vdGVcbiAgICogPT09PVxuICAgKiB0aGUgc3RydWN0dXJlIG9mIHRoaXMgSmF2YVNjcmlwdCB2ZXJzaW9uIG9mIHBvbHkydHJpIGludGVudGlvbmFsbHkgZm9sbG93c1xuICAgKiBhcyBjbG9zZWx5IGFzIHBvc3NpYmxlIHRoZSBzdHJ1Y3R1cmUgb2YgdGhlIHJlZmVyZW5jZSBDKysgdmVyc2lvbiwgdG8gbWFrZSBpdFxuICAgKiBlYXNpZXIgdG8ga2VlcCB0aGUgMiB2ZXJzaW9ucyBpbiBzeW5jLlxuICAgKi9cblxuICB2YXIgeHkgPSBfZGVyZXFfKCcuL3h5Jyk7XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVBvaW50XG4gIC8qKlxuICAgKiBDb25zdHJ1Y3QgYSBwb2ludFxuICAgKiBAZXhhbXBsZVxuICAgKiAgICAgIHZhciBwb2ludCA9IG5ldyBwb2x5MnRyaS5Qb2ludCgxNTAsIDE1MCk7XG4gICAqIEBwdWJsaWNcbiAgICogQGNvbnN0cnVjdG9yXG4gICAqIEBzdHJ1Y3RcbiAgICogQHBhcmFtIHtudW1iZXI9fSB4ICAgIGNvb3JkaW5hdGUgKDAgaWYgdW5kZWZpbmVkKVxuICAgKiBAcGFyYW0ge251bWJlcj19IHkgICAgY29vcmRpbmF0ZSAoMCBpZiB1bmRlZmluZWQpXG4gICAqL1xuICB2YXIgUG9pbnQgPSBmdW5jdGlvbih4LCB5KSB7XG4gICAgLyoqXG4gICAgICogQHR5cGUge251bWJlcn1cbiAgICAgKiBAZXhwb3NlXG4gICAgICovXG4gICAgdGhpcy54ID0gK3ggfHwgMDtcbiAgICAvKipcbiAgICAgKiBAdHlwZSB7bnVtYmVyfVxuICAgICAqIEBleHBvc2VcbiAgICAgKi9cbiAgICB0aGlzLnkgPSAreSB8fCAwO1xuXG4gICAgLy8gQWxsIGV4dHJhIGZpZWxkcyBhZGRlZCB0byBQb2ludCBhcmUgcHJlZml4ZWQgd2l0aCBfcDJ0X1xuICAgIC8vIHRvIGF2b2lkIGNvbGxpc2lvbnMgaWYgY3VzdG9tIFBvaW50IGNsYXNzIGlzIHVzZWQuXG5cbiAgICAvKipcbiAgICAgKiBUaGUgZWRnZXMgdGhpcyBwb2ludCBjb25zdGl0dXRlcyBhbiB1cHBlciBlbmRpbmcgcG9pbnRcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqIEB0eXBlIHtBcnJheS48RWRnZT59XG4gICAgICovXG4gICAgdGhpcy5fcDJ0X2VkZ2VfbGlzdCA9IG51bGw7XG4gIH07XG5cbiAgLyoqXG4gICAqIEZvciBwcmV0dHkgcHJpbnRpbmdcbiAgICogQGV4YW1wbGVcbiAgICogICAgICBcInA9XCIgKyBuZXcgcG9seTJ0cmkuUG9pbnQoNSw0MilcbiAgICogICAgICAvLyDihpIgXCJwPSg1OzQyKVwiXG4gICAqIEByZXR1cm5zIHtzdHJpbmd9IDxjb2RlPlwiKHg7eSlcIjwvY29kZT5cbiAgICovXG4gIFBvaW50LnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB4eS50b1N0cmluZ0Jhc2UodGhpcyk7XG4gIH07XG5cbiAgLyoqXG4gICAqIEpTT04gb3V0cHV0LCBvbmx5IGNvb3JkaW5hdGVzXG4gICAqIEBleGFtcGxlXG4gICAqICAgICAgSlNPTi5zdHJpbmdpZnkobmV3IHBvbHkydHJpLlBvaW50KDEsMikpXG4gICAqICAgICAgLy8g4oaSICd7XCJ4XCI6MSxcInlcIjoyfSdcbiAgICovXG4gIFBvaW50LnByb3RvdHlwZS50b0pTT04gPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4geyB4OiB0aGlzLngsIHk6IHRoaXMueSB9O1xuICB9O1xuXG4gIC8qKlxuICAgKiBDcmVhdGVzIGEgY29weSBvZiB0aGlzIFBvaW50IG9iamVjdC5cbiAgICogQHJldHVybiB7UG9pbnR9IG5ldyBjbG9uZWQgcG9pbnRcbiAgICovXG4gIFBvaW50LnByb3RvdHlwZS5jbG9uZSA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBuZXcgUG9pbnQodGhpcy54LCB0aGlzLnkpO1xuICB9O1xuXG4gIC8qKlxuICAgKiBTZXQgdGhpcyBQb2ludCBpbnN0YW5jZSB0byB0aGUgb3JpZ28uIDxjb2RlPigwOyAwKTwvY29kZT5cbiAgICogQHJldHVybiB7UG9pbnR9IHRoaXMgKGZvciBjaGFpbmluZylcbiAgICovXG4gIFBvaW50LnByb3RvdHlwZS5zZXRfemVybyA9IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMueCA9IDAuMDtcbiAgICB0aGlzLnkgPSAwLjA7XG4gICAgcmV0dXJuIHRoaXM7IC8vIGZvciBjaGFpbmluZ1xuICB9O1xuXG4gIC8qKlxuICAgKiBTZXQgdGhlIGNvb3JkaW5hdGVzIG9mIHRoaXMgaW5zdGFuY2UuXG4gICAqIEBwYXJhbSB7bnVtYmVyfSB4ICAgY29vcmRpbmF0ZVxuICAgKiBAcGFyYW0ge251bWJlcn0geSAgIGNvb3JkaW5hdGVcbiAgICogQHJldHVybiB7UG9pbnR9IHRoaXMgKGZvciBjaGFpbmluZylcbiAgICovXG4gIFBvaW50LnByb3RvdHlwZS5zZXQgPSBmdW5jdGlvbih4LCB5KSB7XG4gICAgdGhpcy54ID0gK3ggfHwgMDtcbiAgICB0aGlzLnkgPSAreSB8fCAwO1xuICAgIHJldHVybiB0aGlzOyAvLyBmb3IgY2hhaW5pbmdcbiAgfTtcblxuICAvKipcbiAgICogTmVnYXRlIHRoaXMgUG9pbnQgaW5zdGFuY2UuIChjb21wb25lbnQtd2lzZSlcbiAgICogQHJldHVybiB7UG9pbnR9IHRoaXMgKGZvciBjaGFpbmluZylcbiAgICovXG4gIFBvaW50LnByb3RvdHlwZS5uZWdhdGUgPSBmdW5jdGlvbigpIHtcbiAgICB0aGlzLnggPSAtdGhpcy54O1xuICAgIHRoaXMueSA9IC10aGlzLnk7XG4gICAgcmV0dXJuIHRoaXM7IC8vIGZvciBjaGFpbmluZ1xuICB9O1xuXG4gIC8qKlxuICAgKiBBZGQgYW5vdGhlciBQb2ludCBvYmplY3QgdG8gdGhpcyBpbnN0YW5jZS4gKGNvbXBvbmVudC13aXNlKVxuICAgKiBAcGFyYW0geyFQb2ludH0gbiAtIFBvaW50IG9iamVjdC5cbiAgICogQHJldHVybiB7UG9pbnR9IHRoaXMgKGZvciBjaGFpbmluZylcbiAgICovXG4gIFBvaW50LnByb3RvdHlwZS5hZGQgPSBmdW5jdGlvbihuKSB7XG4gICAgdGhpcy54ICs9IG4ueDtcbiAgICB0aGlzLnkgKz0gbi55O1xuICAgIHJldHVybiB0aGlzOyAvLyBmb3IgY2hhaW5pbmdcbiAgfTtcblxuICAvKipcbiAgICogU3VidHJhY3QgdGhpcyBQb2ludCBpbnN0YW5jZSB3aXRoIGFub3RoZXIgcG9pbnQgZ2l2ZW4uIChjb21wb25lbnQtd2lzZSlcbiAgICogQHBhcmFtIHshUG9pbnR9IG4gLSBQb2ludCBvYmplY3QuXG4gICAqIEByZXR1cm4ge1BvaW50fSB0aGlzIChmb3IgY2hhaW5pbmcpXG4gICAqL1xuICBQb2ludC5wcm90b3R5cGUuc3ViID0gZnVuY3Rpb24obikge1xuICAgIHRoaXMueCAtPSBuLng7XG4gICAgdGhpcy55IC09IG4ueTtcbiAgICByZXR1cm4gdGhpczsgLy8gZm9yIGNoYWluaW5nXG4gIH07XG5cbiAgLyoqXG4gICAqIE11bHRpcGx5IHRoaXMgUG9pbnQgaW5zdGFuY2UgYnkgYSBzY2FsYXIuIChjb21wb25lbnQtd2lzZSlcbiAgICogQHBhcmFtIHtudW1iZXJ9IHMgICBzY2FsYXIuXG4gICAqIEByZXR1cm4ge1BvaW50fSB0aGlzIChmb3IgY2hhaW5pbmcpXG4gICAqL1xuICBQb2ludC5wcm90b3R5cGUubXVsID0gZnVuY3Rpb24ocykge1xuICAgIHRoaXMueCAqPSBzO1xuICAgIHRoaXMueSAqPSBzO1xuICAgIHJldHVybiB0aGlzOyAvLyBmb3IgY2hhaW5pbmdcbiAgfTtcblxuICAvKipcbiAgICogUmV0dXJuIHRoZSBkaXN0YW5jZSBvZiB0aGlzIFBvaW50IGluc3RhbmNlIGZyb20gdGhlIG9yaWdvLlxuICAgKiBAcmV0dXJuIHtudW1iZXJ9IGRpc3RhbmNlXG4gICAqL1xuICBQb2ludC5wcm90b3R5cGUubGVuZ3RoID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIE1hdGguc3FydCh0aGlzLnggKiB0aGlzLnggKyB0aGlzLnkgKiB0aGlzLnkpO1xuICB9O1xuXG4gIC8qKlxuICAgKiBOb3JtYWxpemUgdGhpcyBQb2ludCBpbnN0YW5jZSAoYXMgYSB2ZWN0b3IpLlxuICAgKiBAcmV0dXJuIHtudW1iZXJ9IFRoZSBvcmlnaW5hbCBkaXN0YW5jZSBvZiB0aGlzIGluc3RhbmNlIGZyb20gdGhlIG9yaWdvLlxuICAgKi9cbiAgUG9pbnQucHJvdG90eXBlLm5vcm1hbGl6ZSA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBsZW4gPSB0aGlzLmxlbmd0aCgpO1xuICAgIHRoaXMueCAvPSBsZW47XG4gICAgdGhpcy55IC89IGxlbjtcbiAgICByZXR1cm4gbGVuO1xuICB9O1xuXG4gIC8qKlxuICAgKiBUZXN0IHRoaXMgUG9pbnQgb2JqZWN0IHdpdGggYW5vdGhlciBmb3IgZXF1YWxpdHkuXG4gICAqIEBwYXJhbSB7IVhZfSBwIC0gYW55IFwiUG9pbnQgbGlrZVwiIG9iamVjdCB3aXRoIHt4LHl9XG4gICAqIEByZXR1cm4ge2Jvb2xlYW59IDxjb2RlPnRydWU8L2NvZGU+IGlmIHNhbWUgeCBhbmQgeSBjb29yZGluYXRlcywgPGNvZGU+ZmFsc2U8L2NvZGU+IG90aGVyd2lzZS5cbiAgICovXG4gIFBvaW50LnByb3RvdHlwZS5lcXVhbHMgPSBmdW5jdGlvbihwKSB7XG4gICAgcmV0dXJuIHRoaXMueCA9PT0gcC54ICYmIHRoaXMueSA9PT0gcC55O1xuICB9O1xuXG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tUG9pbnQgKFwic3RhdGljXCIgbWV0aG9kcylcblxuICAvKipcbiAgICogTmVnYXRlIGEgcG9pbnQgY29tcG9uZW50LXdpc2UgYW5kIHJldHVybiB0aGUgcmVzdWx0IGFzIGEgbmV3IFBvaW50IG9iamVjdC5cbiAgICogQHBhcmFtIHshWFl9IHAgLSBhbnkgXCJQb2ludCBsaWtlXCIgb2JqZWN0IHdpdGgge3gseX1cbiAgICogQHJldHVybiB7UG9pbnR9IHRoZSByZXN1bHRpbmcgUG9pbnQgb2JqZWN0LlxuICAgKi9cbiAgUG9pbnQubmVnYXRlID0gZnVuY3Rpb24ocCkge1xuICAgIHJldHVybiBuZXcgUG9pbnQoLXAueCwgLXAueSk7XG4gIH07XG5cbiAgLyoqXG4gICAqIEFkZCB0d28gcG9pbnRzIGNvbXBvbmVudC13aXNlIGFuZCByZXR1cm4gdGhlIHJlc3VsdCBhcyBhIG5ldyBQb2ludCBvYmplY3QuXG4gICAqIEBwYXJhbSB7IVhZfSBhIC0gYW55IFwiUG9pbnQgbGlrZVwiIG9iamVjdCB3aXRoIHt4LHl9XG4gICAqIEBwYXJhbSB7IVhZfSBiIC0gYW55IFwiUG9pbnQgbGlrZVwiIG9iamVjdCB3aXRoIHt4LHl9XG4gICAqIEByZXR1cm4ge1BvaW50fSB0aGUgcmVzdWx0aW5nIFBvaW50IG9iamVjdC5cbiAgICovXG4gIFBvaW50LmFkZCA9IGZ1bmN0aW9uKGEsIGIpIHtcbiAgICByZXR1cm4gbmV3IFBvaW50KGEueCArIGIueCwgYS55ICsgYi55KTtcbiAgfTtcblxuICAvKipcbiAgICogU3VidHJhY3QgdHdvIHBvaW50cyBjb21wb25lbnQtd2lzZSBhbmQgcmV0dXJuIHRoZSByZXN1bHQgYXMgYSBuZXcgUG9pbnQgb2JqZWN0LlxuICAgKiBAcGFyYW0geyFYWX0gYSAtIGFueSBcIlBvaW50IGxpa2VcIiBvYmplY3Qgd2l0aCB7eCx5fVxuICAgKiBAcGFyYW0geyFYWX0gYiAtIGFueSBcIlBvaW50IGxpa2VcIiBvYmplY3Qgd2l0aCB7eCx5fVxuICAgKiBAcmV0dXJuIHtQb2ludH0gdGhlIHJlc3VsdGluZyBQb2ludCBvYmplY3QuXG4gICAqL1xuICBQb2ludC5zdWIgPSBmdW5jdGlvbihhLCBiKSB7XG4gICAgcmV0dXJuIG5ldyBQb2ludChhLnggLSBiLngsIGEueSAtIGIueSk7XG4gIH07XG5cbiAgLyoqXG4gICAqIE11bHRpcGx5IGEgcG9pbnQgYnkgYSBzY2FsYXIgYW5kIHJldHVybiB0aGUgcmVzdWx0IGFzIGEgbmV3IFBvaW50IG9iamVjdC5cbiAgICogQHBhcmFtIHtudW1iZXJ9IHMgLSB0aGUgc2NhbGFyXG4gICAqIEBwYXJhbSB7IVhZfSBwIC0gYW55IFwiUG9pbnQgbGlrZVwiIG9iamVjdCB3aXRoIHt4LHl9XG4gICAqIEByZXR1cm4ge1BvaW50fSB0aGUgcmVzdWx0aW5nIFBvaW50IG9iamVjdC5cbiAgICovXG4gIFBvaW50Lm11bCA9IGZ1bmN0aW9uKHMsIHApIHtcbiAgICByZXR1cm4gbmV3IFBvaW50KHMgKiBwLngsIHMgKiBwLnkpO1xuICB9O1xuXG4gIC8qKlxuICAgKiBQZXJmb3JtIHRoZSBjcm9zcyBwcm9kdWN0IG9uIGVpdGhlciB0d28gcG9pbnRzICh0aGlzIHByb2R1Y2VzIGEgc2NhbGFyKVxuICAgKiBvciBhIHBvaW50IGFuZCBhIHNjYWxhciAodGhpcyBwcm9kdWNlcyBhIHBvaW50KS5cbiAgICogVGhpcyBmdW5jdGlvbiByZXF1aXJlcyB0d28gcGFyYW1ldGVycywgZWl0aGVyIG1heSBiZSBhIFBvaW50IG9iamVjdCBvciBhXG4gICAqIG51bWJlci5cbiAgICogQHBhcmFtICB7WFl8bnVtYmVyfSBhIC0gUG9pbnQgb2JqZWN0IG9yIHNjYWxhci5cbiAgICogQHBhcmFtICB7WFl8bnVtYmVyfSBiIC0gUG9pbnQgb2JqZWN0IG9yIHNjYWxhci5cbiAgICogQHJldHVybiB7UG9pbnR8bnVtYmVyfSBhIFBvaW50IG9iamVjdCBvciBhIG51bWJlciwgZGVwZW5kaW5nIG9uIHRoZSBwYXJhbWV0ZXJzLlxuICAgKi9cbiAgUG9pbnQuY3Jvc3MgPSBmdW5jdGlvbihhLCBiKSB7XG4gICAgaWYgKHR5cGVvZihhKSA9PT0gJ251bWJlcicpIHtcbiAgICAgIGlmICh0eXBlb2YoYikgPT09ICdudW1iZXInKSB7XG4gICAgICAgIHJldHVybiBhICogYjtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBuZXcgUG9pbnQoLWEgKiBiLnksIGEgKiBiLngpO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBpZiAodHlwZW9mKGIpID09PSAnbnVtYmVyJykge1xuICAgICAgICByZXR1cm4gbmV3IFBvaW50KGIgKiBhLnksIC1iICogYS54KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBhLnggKiBiLnkgLSBhLnkgKiBiLng7XG4gICAgICB9XG4gICAgfVxuICB9O1xuXG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXCJQb2ludC1MaWtlXCJcbiAgLypcbiAgICogVGhlIGZvbGxvd2luZyBmdW5jdGlvbnMgb3BlcmF0ZSBvbiBcIlBvaW50XCIgb3IgYW55IFwiUG9pbnQgbGlrZVwiIG9iamVjdFxuICAgKiB3aXRoIHt4LHl9IChkdWNrIHR5cGluZykuXG4gICAqL1xuXG4gIFBvaW50LnRvU3RyaW5nID0geHkudG9TdHJpbmc7XG4gIFBvaW50LmNvbXBhcmUgPSB4eS5jb21wYXJlO1xuICBQb2ludC5jbXAgPSB4eS5jb21wYXJlOyAvLyBiYWNrd2FyZCBjb21wYXRpYmlsaXR5XG4gIFBvaW50LmVxdWFscyA9IHh5LmVxdWFscztcblxuICAvKipcbiAgICogUGVmb3JtIHRoZSBkb3QgcHJvZHVjdCBvbiB0d28gdmVjdG9ycy5cbiAgICogQHB1YmxpY1xuICAgKiBAcGFyYW0geyFYWX0gYSAtIGFueSBcIlBvaW50IGxpa2VcIiBvYmplY3Qgd2l0aCB7eCx5fVxuICAgKiBAcGFyYW0geyFYWX0gYiAtIGFueSBcIlBvaW50IGxpa2VcIiBvYmplY3Qgd2l0aCB7eCx5fVxuICAgKiBAcmV0dXJuIHtudW1iZXJ9IFRoZSBkb3QgcHJvZHVjdFxuICAgKi9cbiAgUG9pbnQuZG90ID0gZnVuY3Rpb24oYSwgYikge1xuICAgIHJldHVybiBhLnggKiBiLnggKyBhLnkgKiBiLnk7XG4gIH07XG5cblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tRXhwb3J0cyAocHVibGljIEFQSSlcblxuICBtb2R1bGUuZXhwb3J0cyA9IFBvaW50O1xuXG59LHtcIi4veHlcIjoxMX1dLDU6W2Z1bmN0aW9uKF9kZXJlcV8sbW9kdWxlLGV4cG9ydHMpe1xuICAvKlxuICAgKiBQb2x5MlRyaSBDb3B5cmlnaHQgKGMpIDIwMDktMjAxNCwgUG9seTJUcmkgQ29udHJpYnV0b3JzXG4gICAqIGh0dHA6Ly9jb2RlLmdvb2dsZS5jb20vcC9wb2x5MnRyaS9cbiAgICpcbiAgICogcG9seTJ0cmkuanMgKEphdmFTY3JpcHQgcG9ydCkgKGMpIDIwMDktMjAxNCwgUG9seTJUcmkgQ29udHJpYnV0b3JzXG4gICAqIGh0dHBzOi8vZ2l0aHViLmNvbS9yM21pL3BvbHkydHJpLmpzXG4gICAqXG4gICAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gICAqXG4gICAqIERpc3RyaWJ1dGVkIHVuZGVyIHRoZSAzLWNsYXVzZSBCU0QgTGljZW5zZSwgc2VlIExJQ0VOU0UudHh0XG4gICAqL1xuXG4gIFwidXNlIHN0cmljdFwiO1xuXG4gIC8qXG4gICAqIENsYXNzIGFkZGVkIGluIHRoZSBKYXZhU2NyaXB0IHZlcnNpb24gKHdhcyBub3QgcHJlc2VudCBpbiB0aGUgYysrIHZlcnNpb24pXG4gICAqL1xuXG4gIHZhciB4eSA9IF9kZXJlcV8oJy4veHknKTtcblxuICAvKipcbiAgICogQ3VzdG9tIGV4Y2VwdGlvbiBjbGFzcyB0byBpbmRpY2F0ZSBpbnZhbGlkIFBvaW50IHZhbHVlc1xuICAgKiBAY29uc3RydWN0b3JcbiAgICogQHB1YmxpY1xuICAgKiBAZXh0ZW5kcyBFcnJvclxuICAgKiBAc3RydWN0XG4gICAqIEBwYXJhbSB7c3RyaW5nPX0gbWVzc2FnZSAtIGVycm9yIG1lc3NhZ2VcbiAgICogQHBhcmFtIHtBcnJheS48WFk+PX0gcG9pbnRzIC0gaW52YWxpZCBwb2ludHNcbiAgICovXG4gIHZhciBQb2ludEVycm9yID0gZnVuY3Rpb24obWVzc2FnZSwgcG9pbnRzKSB7XG4gICAgdGhpcy5uYW1lID0gXCJQb2ludEVycm9yXCI7XG4gICAgLyoqXG4gICAgICogSW52YWxpZCBwb2ludHNcbiAgICAgKiBAcHVibGljXG4gICAgICogQHR5cGUge0FycmF5LjxYWT59XG4gICAgICovXG4gICAgdGhpcy5wb2ludHMgPSBwb2ludHMgPSBwb2ludHMgfHwgW107XG4gICAgLyoqXG4gICAgICogRXJyb3IgbWVzc2FnZVxuICAgICAqIEBwdWJsaWNcbiAgICAgKiBAdHlwZSB7c3RyaW5nfVxuICAgICAqL1xuICAgIHRoaXMubWVzc2FnZSA9IG1lc3NhZ2UgfHwgXCJJbnZhbGlkIFBvaW50cyFcIjtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHBvaW50cy5sZW5ndGg7IGkrKykge1xuICAgICAgdGhpcy5tZXNzYWdlICs9IFwiIFwiICsgeHkudG9TdHJpbmcocG9pbnRzW2ldKTtcbiAgICB9XG4gIH07XG4gIFBvaW50RXJyb3IucHJvdG90eXBlID0gbmV3IEVycm9yKCk7XG4gIFBvaW50RXJyb3IucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gUG9pbnRFcnJvcjtcblxuXG4gIG1vZHVsZS5leHBvcnRzID0gUG9pbnRFcnJvcjtcblxufSx7XCIuL3h5XCI6MTF9XSw2OltmdW5jdGlvbihfZGVyZXFfLG1vZHVsZSxleHBvcnRzKXtcbiAgKGZ1bmN0aW9uIChnbG9iYWwpe1xuICAgIC8qXG4gICAgICogUG9seTJUcmkgQ29weXJpZ2h0IChjKSAyMDA5LTIwMTQsIFBvbHkyVHJpIENvbnRyaWJ1dG9yc1xuICAgICAqIGh0dHA6Ly9jb2RlLmdvb2dsZS5jb20vcC9wb2x5MnRyaS9cbiAgICAgKlxuICAgICAqIHBvbHkydHJpLmpzIChKYXZhU2NyaXB0IHBvcnQpIChjKSAyMDA5LTIwMTQsIFBvbHkyVHJpIENvbnRyaWJ1dG9yc1xuICAgICAqIGh0dHBzOi8vZ2l0aHViLmNvbS9yM21pL3BvbHkydHJpLmpzXG4gICAgICpcbiAgICAgKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICAgICAqXG4gICAgICogUmVkaXN0cmlidXRpb24gYW5kIHVzZSBpbiBzb3VyY2UgYW5kIGJpbmFyeSBmb3Jtcywgd2l0aCBvciB3aXRob3V0IG1vZGlmaWNhdGlvbixcbiAgICAgKiBhcmUgcGVybWl0dGVkIHByb3ZpZGVkIHRoYXQgdGhlIGZvbGxvd2luZyBjb25kaXRpb25zIGFyZSBtZXQ6XG4gICAgICpcbiAgICAgKiAqIFJlZGlzdHJpYnV0aW9ucyBvZiBzb3VyY2UgY29kZSBtdXN0IHJldGFpbiB0aGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSxcbiAgICAgKiAgIHRoaXMgbGlzdCBvZiBjb25kaXRpb25zIGFuZCB0aGUgZm9sbG93aW5nIGRpc2NsYWltZXIuXG4gICAgICogKiBSZWRpc3RyaWJ1dGlvbnMgaW4gYmluYXJ5IGZvcm0gbXVzdCByZXByb2R1Y2UgdGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UsXG4gICAgICogICB0aGlzIGxpc3Qgb2YgY29uZGl0aW9ucyBhbmQgdGhlIGZvbGxvd2luZyBkaXNjbGFpbWVyIGluIHRoZSBkb2N1bWVudGF0aW9uXG4gICAgICogICBhbmQvb3Igb3RoZXIgbWF0ZXJpYWxzIHByb3ZpZGVkIHdpdGggdGhlIGRpc3RyaWJ1dGlvbi5cbiAgICAgKiAqIE5laXRoZXIgdGhlIG5hbWUgb2YgUG9seTJUcmkgbm9yIHRoZSBuYW1lcyBvZiBpdHMgY29udHJpYnV0b3JzIG1heSBiZVxuICAgICAqICAgdXNlZCB0byBlbmRvcnNlIG9yIHByb21vdGUgcHJvZHVjdHMgZGVyaXZlZCBmcm9tIHRoaXMgc29mdHdhcmUgd2l0aG91dCBzcGVjaWZpY1xuICAgICAqICAgcHJpb3Igd3JpdHRlbiBwZXJtaXNzaW9uLlxuICAgICAqXG4gICAgICogVEhJUyBTT0ZUV0FSRSBJUyBQUk9WSURFRCBCWSBUSEUgQ09QWVJJR0hUIEhPTERFUlMgQU5EIENPTlRSSUJVVE9SU1xuICAgICAqIFwiQVMgSVNcIiBBTkQgQU5ZIEVYUFJFU1MgT1IgSU1QTElFRCBXQVJSQU5USUVTLCBJTkNMVURJTkcsIEJVVCBOT1RcbiAgICAgKiBMSU1JVEVEIFRPLCBUSEUgSU1QTElFRCBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSBBTkQgRklUTkVTUyBGT1JcbiAgICAgKiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBUkUgRElTQ0xBSU1FRC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFIENPUFlSSUdIVCBPV05FUiBPUlxuICAgICAqIENPTlRSSUJVVE9SUyBCRSBMSUFCTEUgRk9SIEFOWSBESVJFQ1QsIElORElSRUNULCBJTkNJREVOVEFMLCBTUEVDSUFMLFxuICAgICAqIEVYRU1QTEFSWSwgT1IgQ09OU0VRVUVOVElBTCBEQU1BR0VTIChJTkNMVURJTkcsIEJVVCBOT1QgTElNSVRFRCBUTyxcbiAgICAgKiBQUk9DVVJFTUVOVCBPRiBTVUJTVElUVVRFIEdPT0RTIE9SIFNFUlZJQ0VTOyBMT1NTIE9GIFVTRSwgREFUQSwgT1JcbiAgICAgKiBQUk9GSVRTOyBPUiBCVVNJTkVTUyBJTlRFUlJVUFRJT04pIEhPV0VWRVIgQ0FVU0VEIEFORCBPTiBBTlkgVEhFT1JZIE9GXG4gICAgICogTElBQklMSVRZLCBXSEVUSEVSIElOIENPTlRSQUNULCBTVFJJQ1QgTElBQklMSVRZLCBPUiBUT1JUIChJTkNMVURJTkdcbiAgICAgKiBORUdMSUdFTkNFIE9SIE9USEVSV0lTRSkgQVJJU0lORyBJTiBBTlkgV0FZIE9VVCBPRiBUSEUgVVNFIE9GIFRISVNcbiAgICAgKiBTT0ZUV0FSRSwgRVZFTiBJRiBBRFZJU0VEIE9GIFRIRSBQT1NTSUJJTElUWSBPRiBTVUNIIERBTUFHRS5cbiAgICAgKi9cblxuICAgIFwidXNlIHN0cmljdFwiO1xuXG4gICAgLyoqXG4gICAgICogUHVibGljIEFQSSBmb3IgcG9seTJ0cmkuanNcbiAgICAgKiBAbW9kdWxlIHBvbHkydHJpXG4gICAgICovXG5cblxuICAgIC8qKlxuICAgICAqIElmIHlvdSBhcmUgbm90IHVzaW5nIGEgbW9kdWxlIHN5c3RlbSAoZS5nLiBDb21tb25KUywgUmVxdWlyZUpTKSwgeW91IGNhbiBhY2Nlc3MgdGhpcyBsaWJyYXJ5XG4gICAgICogYXMgYSBnbG9iYWwgdmFyaWFibGUgPGNvZGU+cG9seTJ0cmk8L2NvZGU+IGkuZS4gPGNvZGU+d2luZG93LnBvbHkydHJpPC9jb2RlPiBpbiBhIGJyb3dzZXIuXG4gICAgICogQG5hbWUgcG9seTJ0cmlcbiAgICAgKiBAZ2xvYmFsXG4gICAgICogQHB1YmxpY1xuICAgICAqIEB0eXBlIHttb2R1bGU6cG9seTJ0cml9XG4gICAgICovXG4gICAgdmFyIHByZXZpb3VzUG9seTJ0cmkgPSBnbG9iYWwucG9seTJ0cmk7XG4gICAgLyoqXG4gICAgICogRm9yIEJyb3dzZXIgKyAmbHQ7c2NyaXB0Jmd0OyA6XG4gICAgICogcmV2ZXJ0cyB0aGUge0BsaW5rY29kZSBwb2x5MnRyaX0gZ2xvYmFsIG9iamVjdCB0byBpdHMgcHJldmlvdXMgdmFsdWUsXG4gICAgICogYW5kIHJldHVybnMgYSByZWZlcmVuY2UgdG8gdGhlIGluc3RhbmNlIGNhbGxlZC5cbiAgICAgKlxuICAgICAqIEBleGFtcGxlXG4gICAgICogICAgICAgICAgICAgIHZhciBwID0gcG9seTJ0cmkubm9Db25mbGljdCgpO1xuICAgICAqIEBwdWJsaWNcbiAgICAgKiBAcmV0dXJuIHttb2R1bGU6cG9seTJ0cml9IGluc3RhbmNlIGNhbGxlZFxuICAgICAqL1xuLy8gKHRoaXMgZmVhdHVyZSBpcyBub3QgYXV0b21hdGljYWxseSBwcm92aWRlZCBieSBicm93c2VyaWZ5KS5cbiAgICBleHBvcnRzLm5vQ29uZmxpY3QgPSBmdW5jdGlvbigpIHtcbiAgICAgIGdsb2JhbC5wb2x5MnRyaSA9IHByZXZpb3VzUG9seTJ0cmk7XG4gICAgICByZXR1cm4gZXhwb3J0cztcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogcG9seTJ0cmkgbGlicmFyeSB2ZXJzaW9uXG4gICAgICogQHB1YmxpY1xuICAgICAqIEBjb25zdCB7c3RyaW5nfVxuICAgICAqL1xuICAgIGV4cG9ydHMuVkVSU0lPTiA9IF9kZXJlcV8oJy4uL2Rpc3QvdmVyc2lvbi5qc29uJykudmVyc2lvbjtcblxuICAgIC8qKlxuICAgICAqIEV4cG9ydHMgdGhlIHtAbGlua2NvZGUgUG9pbnRFcnJvcn0gY2xhc3MuXG4gICAgICogQHB1YmxpY1xuICAgICAqIEB0eXBlZGVmIHtQb2ludEVycm9yfSBtb2R1bGU6cG9seTJ0cmkuUG9pbnRFcnJvclxuICAgICAqIEBmdW5jdGlvblxuICAgICAqL1xuICAgIGV4cG9ydHMuUG9pbnRFcnJvciA9IF9kZXJlcV8oJy4vcG9pbnRlcnJvcicpO1xuICAgIC8qKlxuICAgICAqIEV4cG9ydHMgdGhlIHtAbGlua2NvZGUgUG9pbnR9IGNsYXNzLlxuICAgICAqIEBwdWJsaWNcbiAgICAgKiBAdHlwZWRlZiB7UG9pbnR9IG1vZHVsZTpwb2x5MnRyaS5Qb2ludFxuICAgICAqIEBmdW5jdGlvblxuICAgICAqL1xuICAgIGV4cG9ydHMuUG9pbnQgPSBfZGVyZXFfKCcuL3BvaW50Jyk7XG4gICAgLyoqXG4gICAgICogRXhwb3J0cyB0aGUge0BsaW5rY29kZSBUcmlhbmdsZX0gY2xhc3MuXG4gICAgICogQHB1YmxpY1xuICAgICAqIEB0eXBlZGVmIHtUcmlhbmdsZX0gbW9kdWxlOnBvbHkydHJpLlRyaWFuZ2xlXG4gICAgICogQGZ1bmN0aW9uXG4gICAgICovXG4gICAgZXhwb3J0cy5UcmlhbmdsZSA9IF9kZXJlcV8oJy4vdHJpYW5nbGUnKTtcbiAgICAvKipcbiAgICAgKiBFeHBvcnRzIHRoZSB7QGxpbmtjb2RlIFN3ZWVwQ29udGV4dH0gY2xhc3MuXG4gICAgICogQHB1YmxpY1xuICAgICAqIEB0eXBlZGVmIHtTd2VlcENvbnRleHR9IG1vZHVsZTpwb2x5MnRyaS5Td2VlcENvbnRleHRcbiAgICAgKiBAZnVuY3Rpb25cbiAgICAgKi9cbiAgICBleHBvcnRzLlN3ZWVwQ29udGV4dCA9IF9kZXJlcV8oJy4vc3dlZXBjb250ZXh0Jyk7XG5cblxuLy8gQmFja3dhcmQgY29tcGF0aWJpbGl0eVxuICAgIHZhciBzd2VlcCA9IF9kZXJlcV8oJy4vc3dlZXAnKTtcbiAgICAvKipcbiAgICAgKiBAZnVuY3Rpb25cbiAgICAgKiBAZGVwcmVjYXRlZCB1c2Uge0BsaW5rY29kZSBTd2VlcENvbnRleHQjdHJpYW5ndWxhdGV9IGluc3RlYWRcbiAgICAgKi9cbiAgICBleHBvcnRzLnRyaWFuZ3VsYXRlID0gc3dlZXAudHJpYW5ndWxhdGU7XG4gICAgLyoqXG4gICAgICogQGRlcHJlY2F0ZWQgdXNlIHtAbGlua2NvZGUgU3dlZXBDb250ZXh0I3RyaWFuZ3VsYXRlfSBpbnN0ZWFkXG4gICAgICogQHByb3BlcnR5IHtmdW5jdGlvbn0gVHJpYW5ndWxhdGUgLSB1c2Uge0BsaW5rY29kZSBTd2VlcENvbnRleHQjdHJpYW5ndWxhdGV9IGluc3RlYWRcbiAgICAgKi9cbiAgICBleHBvcnRzLnN3ZWVwID0ge1RyaWFuZ3VsYXRlOiBzd2VlcC50cmlhbmd1bGF0ZX07XG5cbiAgfSkuY2FsbCh0aGlzLHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSlcbn0se1wiLi4vZGlzdC92ZXJzaW9uLmpzb25cIjoxLFwiLi9wb2ludFwiOjQsXCIuL3BvaW50ZXJyb3JcIjo1LFwiLi9zd2VlcFwiOjcsXCIuL3N3ZWVwY29udGV4dFwiOjgsXCIuL3RyaWFuZ2xlXCI6OX1dLDc6W2Z1bmN0aW9uKF9kZXJlcV8sbW9kdWxlLGV4cG9ydHMpe1xuICAvKlxuICAgKiBQb2x5MlRyaSBDb3B5cmlnaHQgKGMpIDIwMDktMjAxNCwgUG9seTJUcmkgQ29udHJpYnV0b3JzXG4gICAqIGh0dHA6Ly9jb2RlLmdvb2dsZS5jb20vcC9wb2x5MnRyaS9cbiAgICpcbiAgICogcG9seTJ0cmkuanMgKEphdmFTY3JpcHQgcG9ydCkgKGMpIDIwMDktMjAxNCwgUG9seTJUcmkgQ29udHJpYnV0b3JzXG4gICAqIGh0dHBzOi8vZ2l0aHViLmNvbS9yM21pL3BvbHkydHJpLmpzXG4gICAqXG4gICAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gICAqXG4gICAqIERpc3RyaWJ1dGVkIHVuZGVyIHRoZSAzLWNsYXVzZSBCU0QgTGljZW5zZSwgc2VlIExJQ0VOU0UudHh0XG4gICAqL1xuXG4gIC8qIGpzaGludCBsYXRlZGVmOm5vZnVuYywgbWF4Y29tcGxleGl0eTo5ICovXG5cbiAgXCJ1c2Ugc3RyaWN0XCI7XG5cbiAgLyoqXG4gICAqIFRoaXMgJ1N3ZWVwJyBtb2R1bGUgaXMgcHJlc2VudCBpbiBvcmRlciB0byBrZWVwIHRoaXMgSmF2YVNjcmlwdCB2ZXJzaW9uXG4gICAqIGFzIGNsb3NlIGFzIHBvc3NpYmxlIHRvIHRoZSByZWZlcmVuY2UgQysrIHZlcnNpb24sIGV2ZW4gdGhvdWdoIGFsbW9zdCBhbGxcbiAgICogZnVuY3Rpb25zIGNvdWxkIGJlIGRlY2xhcmVkIGFzIG1ldGhvZHMgb24gdGhlIHtAbGlua2NvZGUgbW9kdWxlOnN3ZWVwY29udGV4dH5Td2VlcENvbnRleHR9IG9iamVjdC5cbiAgICogQG1vZHVsZVxuICAgKiBAcHJpdmF0ZVxuICAgKi9cblxuICAvKlxuICAgKiBOb3RlXG4gICAqID09PT1cbiAgICogdGhlIHN0cnVjdHVyZSBvZiB0aGlzIEphdmFTY3JpcHQgdmVyc2lvbiBvZiBwb2x5MnRyaSBpbnRlbnRpb25hbGx5IGZvbGxvd3NcbiAgICogYXMgY2xvc2VseSBhcyBwb3NzaWJsZSB0aGUgc3RydWN0dXJlIG9mIHRoZSByZWZlcmVuY2UgQysrIHZlcnNpb24sIHRvIG1ha2UgaXRcbiAgICogZWFzaWVyIHRvIGtlZXAgdGhlIDIgdmVyc2lvbnMgaW4gc3luYy5cbiAgICovXG5cbiAgdmFyIGFzc2VydCA9IF9kZXJlcV8oJy4vYXNzZXJ0Jyk7XG4gIHZhciBQb2ludEVycm9yID0gX2RlcmVxXygnLi9wb2ludGVycm9yJyk7XG4gIHZhciBUcmlhbmdsZSA9IF9kZXJlcV8oJy4vdHJpYW5nbGUnKTtcbiAgdmFyIE5vZGUgPSBfZGVyZXFfKCcuL2FkdmFuY2luZ2Zyb250JykuTm9kZTtcblxuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS11dGlsc1xuXG4gIHZhciB1dGlscyA9IF9kZXJlcV8oJy4vdXRpbHMnKTtcblxuICAvKiogQGNvbnN0ICovXG4gIHZhciBFUFNJTE9OID0gdXRpbHMuRVBTSUxPTjtcblxuICAvKiogQGNvbnN0ICovXG4gIHZhciBPcmllbnRhdGlvbiA9IHV0aWxzLk9yaWVudGF0aW9uO1xuICAvKiogQGNvbnN0ICovXG4gIHZhciBvcmllbnQyZCA9IHV0aWxzLm9yaWVudDJkO1xuICAvKiogQGNvbnN0ICovXG4gIHZhciBpblNjYW5BcmVhID0gdXRpbHMuaW5TY2FuQXJlYTtcbiAgLyoqIEBjb25zdCAqL1xuICB2YXIgaXNBbmdsZU9idHVzZSA9IHV0aWxzLmlzQW5nbGVPYnR1c2U7XG5cblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tU3dlZXBcblxuICAvKipcbiAgICogVHJpYW5ndWxhdGUgdGhlIHBvbHlnb24gd2l0aCBob2xlcyBhbmQgU3RlaW5lciBwb2ludHMuXG4gICAqIERvIHRoaXMgQUZURVIgeW91J3ZlIGFkZGVkIHRoZSBwb2x5bGluZSwgaG9sZXMsIGFuZCBTdGVpbmVyIHBvaW50c1xuICAgKiBAcHJpdmF0ZVxuICAgKiBAcGFyYW0geyFTd2VlcENvbnRleHR9IHRjeCAtIFN3ZWVwQ29udGV4dCBvYmplY3RcbiAgICovXG4gIGZ1bmN0aW9uIHRyaWFuZ3VsYXRlKHRjeCkge1xuICAgIHRjeC5pbml0VHJpYW5ndWxhdGlvbigpO1xuICAgIHRjeC5jcmVhdGVBZHZhbmNpbmdGcm9udCgpO1xuICAgIC8vIFN3ZWVwIHBvaW50czsgYnVpbGQgbWVzaFxuICAgIHN3ZWVwUG9pbnRzKHRjeCk7XG4gICAgLy8gQ2xlYW4gdXBcbiAgICBmaW5hbGl6YXRpb25Qb2x5Z29uKHRjeCk7XG4gIH1cblxuICAvKipcbiAgICogU3RhcnQgc3dlZXBpbmcgdGhlIFktc29ydGVkIHBvaW50IHNldCBmcm9tIGJvdHRvbSB0byB0b3BcbiAgICogQHBhcmFtIHshU3dlZXBDb250ZXh0fSB0Y3ggLSBTd2VlcENvbnRleHQgb2JqZWN0XG4gICAqL1xuICBmdW5jdGlvbiBzd2VlcFBvaW50cyh0Y3gpIHtcbiAgICB2YXIgaSwgbGVuID0gdGN4LnBvaW50Q291bnQoKTtcbiAgICBmb3IgKGkgPSAxOyBpIDwgbGVuOyArK2kpIHtcbiAgICAgIHZhciBwb2ludCA9IHRjeC5nZXRQb2ludChpKTtcbiAgICAgIHZhciBub2RlID0gcG9pbnRFdmVudCh0Y3gsIHBvaW50KTtcbiAgICAgIHZhciBlZGdlcyA9IHBvaW50Ll9wMnRfZWRnZV9saXN0O1xuICAgICAgZm9yICh2YXIgaiA9IDA7IGVkZ2VzICYmIGogPCBlZGdlcy5sZW5ndGg7ICsraikge1xuICAgICAgICBlZGdlRXZlbnRCeUVkZ2UodGN4LCBlZGdlc1tqXSwgbm9kZSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7IVN3ZWVwQ29udGV4dH0gdGN4IC0gU3dlZXBDb250ZXh0IG9iamVjdFxuICAgKi9cbiAgZnVuY3Rpb24gZmluYWxpemF0aW9uUG9seWdvbih0Y3gpIHtcbiAgICAvLyBHZXQgYW4gSW50ZXJuYWwgdHJpYW5nbGUgdG8gc3RhcnQgd2l0aFxuICAgIHZhciB0ID0gdGN4LmZyb250KCkuaGVhZCgpLm5leHQudHJpYW5nbGU7XG4gICAgdmFyIHAgPSB0Y3guZnJvbnQoKS5oZWFkKCkubmV4dC5wb2ludDtcbiAgICB3aGlsZSAoIXQuZ2V0Q29uc3RyYWluZWRFZGdlQ1cocCkpIHtcbiAgICAgIHQgPSB0Lm5laWdoYm9yQ0NXKHApO1xuICAgIH1cblxuICAgIC8vIENvbGxlY3QgaW50ZXJpb3IgdHJpYW5nbGVzIGNvbnN0cmFpbmVkIGJ5IGVkZ2VzXG4gICAgdGN4Lm1lc2hDbGVhbih0KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBGaW5kIGNsb3NlcyBub2RlIHRvIHRoZSBsZWZ0IG9mIHRoZSBuZXcgcG9pbnQgYW5kXG4gICAqIGNyZWF0ZSBhIG5ldyB0cmlhbmdsZS4gSWYgbmVlZGVkIG5ldyBob2xlcyBhbmQgYmFzaW5zXG4gICAqIHdpbGwgYmUgZmlsbGVkIHRvLlxuICAgKiBAcGFyYW0geyFTd2VlcENvbnRleHR9IHRjeCAtIFN3ZWVwQ29udGV4dCBvYmplY3RcbiAgICogQHBhcmFtIHshWFl9IHBvaW50ICAgUG9pbnRcbiAgICovXG4gIGZ1bmN0aW9uIHBvaW50RXZlbnQodGN4LCBwb2ludCkge1xuICAgIHZhciBub2RlID0gdGN4LmxvY2F0ZU5vZGUocG9pbnQpO1xuICAgIHZhciBuZXdfbm9kZSA9IG5ld0Zyb250VHJpYW5nbGUodGN4LCBwb2ludCwgbm9kZSk7XG5cbiAgICAvLyBPbmx5IG5lZWQgdG8gY2hlY2sgK2Vwc2lsb24gc2luY2UgcG9pbnQgbmV2ZXIgaGF2ZSBzbWFsbGVyXG4gICAgLy8geCB2YWx1ZSB0aGFuIG5vZGUgZHVlIHRvIGhvdyB3ZSBmZXRjaCBub2RlcyBmcm9tIHRoZSBmcm9udFxuICAgIGlmIChwb2ludC54IDw9IG5vZGUucG9pbnQueCArIChFUFNJTE9OKSkge1xuICAgICAgZmlsbCh0Y3gsIG5vZGUpO1xuICAgIH1cblxuICAgIC8vdGN4LkFkZE5vZGUobmV3X25vZGUpO1xuXG4gICAgZmlsbEFkdmFuY2luZ0Zyb250KHRjeCwgbmV3X25vZGUpO1xuICAgIHJldHVybiBuZXdfbm9kZTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGVkZ2VFdmVudEJ5RWRnZSh0Y3gsIGVkZ2UsIG5vZGUpIHtcbiAgICB0Y3guZWRnZV9ldmVudC5jb25zdHJhaW5lZF9lZGdlID0gZWRnZTtcbiAgICB0Y3guZWRnZV9ldmVudC5yaWdodCA9IChlZGdlLnAueCA+IGVkZ2UucS54KTtcblxuICAgIGlmIChpc0VkZ2VTaWRlT2ZUcmlhbmdsZShub2RlLnRyaWFuZ2xlLCBlZGdlLnAsIGVkZ2UucSkpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBGb3Igbm93IHdlIHdpbGwgZG8gYWxsIG5lZWRlZCBmaWxsaW5nXG4gICAgLy8gVE9ETzogaW50ZWdyYXRlIHdpdGggZmxpcCBwcm9jZXNzIG1pZ2h0IGdpdmUgc29tZSBiZXR0ZXIgcGVyZm9ybWFuY2VcbiAgICAvLyAgICAgICBidXQgZm9yIG5vdyB0aGlzIGF2b2lkIHRoZSBpc3N1ZSB3aXRoIGNhc2VzIHRoYXQgbmVlZHMgYm90aCBmbGlwcyBhbmQgZmlsbHNcbiAgICBmaWxsRWRnZUV2ZW50KHRjeCwgZWRnZSwgbm9kZSk7XG4gICAgZWRnZUV2ZW50QnlQb2ludHModGN4LCBlZGdlLnAsIGVkZ2UucSwgbm9kZS50cmlhbmdsZSwgZWRnZS5xKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGVkZ2VFdmVudEJ5UG9pbnRzKHRjeCwgZXAsIGVxLCB0cmlhbmdsZSwgcG9pbnQpIHtcbiAgICBpZiAoaXNFZGdlU2lkZU9mVHJpYW5nbGUodHJpYW5nbGUsIGVwLCBlcSkpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB2YXIgcDEgPSB0cmlhbmdsZS5wb2ludENDVyhwb2ludCk7XG4gICAgdmFyIG8xID0gb3JpZW50MmQoZXEsIHAxLCBlcCk7XG4gICAgaWYgKG8xID09PSBPcmllbnRhdGlvbi5DT0xMSU5FQVIpIHtcbiAgICAgIC8vIFRPRE8gaW50ZWdyYXRlIGhlcmUgY2hhbmdlcyBmcm9tIEMrKyB2ZXJzaW9uXG4gICAgICAvLyAoQysrIHJlcG8gcmV2aXNpb24gMDk4ODBhODY5MDk1IGRhdGVkIE1hcmNoIDgsIDIwMTEpXG4gICAgICB0aHJvdyBuZXcgUG9pbnRFcnJvcigncG9seTJ0cmkgRWRnZUV2ZW50OiBDb2xsaW5lYXIgbm90IHN1cHBvcnRlZCEnLCBbZXEsIHAxLCBlcF0pO1xuICAgIH1cblxuICAgIHZhciBwMiA9IHRyaWFuZ2xlLnBvaW50Q1cocG9pbnQpO1xuICAgIHZhciBvMiA9IG9yaWVudDJkKGVxLCBwMiwgZXApO1xuICAgIGlmIChvMiA9PT0gT3JpZW50YXRpb24uQ09MTElORUFSKSB7XG4gICAgICAvLyBUT0RPIGludGVncmF0ZSBoZXJlIGNoYW5nZXMgZnJvbSBDKysgdmVyc2lvblxuICAgICAgLy8gKEMrKyByZXBvIHJldmlzaW9uIDA5ODgwYTg2OTA5NSBkYXRlZCBNYXJjaCA4LCAyMDExKVxuICAgICAgdGhyb3cgbmV3IFBvaW50RXJyb3IoJ3BvbHkydHJpIEVkZ2VFdmVudDogQ29sbGluZWFyIG5vdCBzdXBwb3J0ZWQhJywgW2VxLCBwMiwgZXBdKTtcbiAgICB9XG5cbiAgICBpZiAobzEgPT09IG8yKSB7XG4gICAgICAvLyBOZWVkIHRvIGRlY2lkZSBpZiB3ZSBhcmUgcm90YXRpbmcgQ1cgb3IgQ0NXIHRvIGdldCB0byBhIHRyaWFuZ2xlXG4gICAgICAvLyB0aGF0IHdpbGwgY3Jvc3MgZWRnZVxuICAgICAgaWYgKG8xID09PSBPcmllbnRhdGlvbi5DVykge1xuICAgICAgICB0cmlhbmdsZSA9IHRyaWFuZ2xlLm5laWdoYm9yQ0NXKHBvaW50KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRyaWFuZ2xlID0gdHJpYW5nbGUubmVpZ2hib3JDVyhwb2ludCk7XG4gICAgICB9XG4gICAgICBlZGdlRXZlbnRCeVBvaW50cyh0Y3gsIGVwLCBlcSwgdHJpYW5nbGUsIHBvaW50KTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gVGhpcyB0cmlhbmdsZSBjcm9zc2VzIGNvbnN0cmFpbnQgc28gbGV0cyBmbGlwcGluIHN0YXJ0IVxuICAgICAgZmxpcEVkZ2VFdmVudCh0Y3gsIGVwLCBlcSwgdHJpYW5nbGUsIHBvaW50KTtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBpc0VkZ2VTaWRlT2ZUcmlhbmdsZSh0cmlhbmdsZSwgZXAsIGVxKSB7XG4gICAgdmFyIGluZGV4ID0gdHJpYW5nbGUuZWRnZUluZGV4KGVwLCBlcSk7XG4gICAgaWYgKGluZGV4ICE9PSAtMSkge1xuICAgICAgdHJpYW5nbGUubWFya0NvbnN0cmFpbmVkRWRnZUJ5SW5kZXgoaW5kZXgpO1xuICAgICAgdmFyIHQgPSB0cmlhbmdsZS5nZXROZWlnaGJvcihpbmRleCk7XG4gICAgICBpZiAodCkge1xuICAgICAgICB0Lm1hcmtDb25zdHJhaW5lZEVkZ2VCeVBvaW50cyhlcCwgZXEpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDcmVhdGVzIGEgbmV3IGZyb250IHRyaWFuZ2xlIGFuZCBsZWdhbGl6ZSBpdFxuICAgKiBAcGFyYW0geyFTd2VlcENvbnRleHR9IHRjeCAtIFN3ZWVwQ29udGV4dCBvYmplY3RcbiAgICovXG4gIGZ1bmN0aW9uIG5ld0Zyb250VHJpYW5nbGUodGN4LCBwb2ludCwgbm9kZSkge1xuICAgIHZhciB0cmlhbmdsZSA9IG5ldyBUcmlhbmdsZShwb2ludCwgbm9kZS5wb2ludCwgbm9kZS5uZXh0LnBvaW50KTtcblxuICAgIHRyaWFuZ2xlLm1hcmtOZWlnaGJvcihub2RlLnRyaWFuZ2xlKTtcbiAgICB0Y3guYWRkVG9NYXAodHJpYW5nbGUpO1xuXG4gICAgdmFyIG5ld19ub2RlID0gbmV3IE5vZGUocG9pbnQpO1xuICAgIG5ld19ub2RlLm5leHQgPSBub2RlLm5leHQ7XG4gICAgbmV3X25vZGUucHJldiA9IG5vZGU7XG4gICAgbm9kZS5uZXh0LnByZXYgPSBuZXdfbm9kZTtcbiAgICBub2RlLm5leHQgPSBuZXdfbm9kZTtcblxuICAgIGlmICghbGVnYWxpemUodGN4LCB0cmlhbmdsZSkpIHtcbiAgICAgIHRjeC5tYXBUcmlhbmdsZVRvTm9kZXModHJpYW5nbGUpO1xuICAgIH1cblxuICAgIHJldHVybiBuZXdfbm9kZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBZGRzIGEgdHJpYW5nbGUgdG8gdGhlIGFkdmFuY2luZyBmcm9udCB0byBmaWxsIGEgaG9sZS5cbiAgICogQHBhcmFtIHshU3dlZXBDb250ZXh0fSB0Y3ggLSBTd2VlcENvbnRleHQgb2JqZWN0XG4gICAqIEBwYXJhbSBub2RlIC0gbWlkZGxlIG5vZGUsIHRoYXQgaXMgdGhlIGJvdHRvbSBvZiB0aGUgaG9sZVxuICAgKi9cbiAgZnVuY3Rpb24gZmlsbCh0Y3gsIG5vZGUpIHtcbiAgICB2YXIgdHJpYW5nbGUgPSBuZXcgVHJpYW5nbGUobm9kZS5wcmV2LnBvaW50LCBub2RlLnBvaW50LCBub2RlLm5leHQucG9pbnQpO1xuXG4gICAgLy8gVE9ETzogc2hvdWxkIGNvcHkgdGhlIGNvbnN0cmFpbmVkX2VkZ2UgdmFsdWUgZnJvbSBuZWlnaGJvciB0cmlhbmdsZXNcbiAgICAvLyAgICAgICBmb3Igbm93IGNvbnN0cmFpbmVkX2VkZ2UgdmFsdWVzIGFyZSBjb3BpZWQgZHVyaW5nIHRoZSBsZWdhbGl6ZVxuICAgIHRyaWFuZ2xlLm1hcmtOZWlnaGJvcihub2RlLnByZXYudHJpYW5nbGUpO1xuICAgIHRyaWFuZ2xlLm1hcmtOZWlnaGJvcihub2RlLnRyaWFuZ2xlKTtcblxuICAgIHRjeC5hZGRUb01hcCh0cmlhbmdsZSk7XG5cbiAgICAvLyBVcGRhdGUgdGhlIGFkdmFuY2luZyBmcm9udFxuICAgIG5vZGUucHJldi5uZXh0ID0gbm9kZS5uZXh0O1xuICAgIG5vZGUubmV4dC5wcmV2ID0gbm9kZS5wcmV2O1xuXG5cbiAgICAvLyBJZiBpdCB3YXMgbGVnYWxpemVkIHRoZSB0cmlhbmdsZSBoYXMgYWxyZWFkeSBiZWVuIG1hcHBlZFxuICAgIGlmICghbGVnYWxpemUodGN4LCB0cmlhbmdsZSkpIHtcbiAgICAgIHRjeC5tYXBUcmlhbmdsZVRvTm9kZXModHJpYW5nbGUpO1xuICAgIH1cblxuICAgIC8vdGN4LnJlbW92ZU5vZGUobm9kZSk7XG4gIH1cblxuICAvKipcbiAgICogRmlsbHMgaG9sZXMgaW4gdGhlIEFkdmFuY2luZyBGcm9udFxuICAgKiBAcGFyYW0geyFTd2VlcENvbnRleHR9IHRjeCAtIFN3ZWVwQ29udGV4dCBvYmplY3RcbiAgICovXG4gIGZ1bmN0aW9uIGZpbGxBZHZhbmNpbmdGcm9udCh0Y3gsIG4pIHtcbiAgICAvLyBGaWxsIHJpZ2h0IGhvbGVzXG4gICAgdmFyIG5vZGUgPSBuLm5leHQ7XG4gICAgd2hpbGUgKG5vZGUubmV4dCkge1xuICAgICAgLy8gVE9ETyBpbnRlZ3JhdGUgaGVyZSBjaGFuZ2VzIGZyb20gQysrIHZlcnNpb25cbiAgICAgIC8vIChDKysgcmVwbyByZXZpc2lvbiBhY2Y4MWYxZjE3NjQgZGF0ZWQgQXByaWwgNywgMjAxMilcbiAgICAgIGlmIChpc0FuZ2xlT2J0dXNlKG5vZGUucG9pbnQsIG5vZGUubmV4dC5wb2ludCwgbm9kZS5wcmV2LnBvaW50KSkge1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICAgIGZpbGwodGN4LCBub2RlKTtcbiAgICAgIG5vZGUgPSBub2RlLm5leHQ7XG4gICAgfVxuXG4gICAgLy8gRmlsbCBsZWZ0IGhvbGVzXG4gICAgbm9kZSA9IG4ucHJldjtcbiAgICB3aGlsZSAobm9kZS5wcmV2KSB7XG4gICAgICAvLyBUT0RPIGludGVncmF0ZSBoZXJlIGNoYW5nZXMgZnJvbSBDKysgdmVyc2lvblxuICAgICAgLy8gKEMrKyByZXBvIHJldmlzaW9uIGFjZjgxZjFmMTc2NCBkYXRlZCBBcHJpbCA3LCAyMDEyKVxuICAgICAgaWYgKGlzQW5nbGVPYnR1c2Uobm9kZS5wb2ludCwgbm9kZS5uZXh0LnBvaW50LCBub2RlLnByZXYucG9pbnQpKSB7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgICAgZmlsbCh0Y3gsIG5vZGUpO1xuICAgICAgbm9kZSA9IG5vZGUucHJldjtcbiAgICB9XG5cbiAgICAvLyBGaWxsIHJpZ2h0IGJhc2luc1xuICAgIGlmIChuLm5leHQgJiYgbi5uZXh0Lm5leHQpIHtcbiAgICAgIGlmIChpc0Jhc2luQW5nbGVSaWdodChuKSkge1xuICAgICAgICBmaWxsQmFzaW4odGN4LCBuKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogVGhlIGJhc2luIGFuZ2xlIGlzIGRlY2lkZWQgYWdhaW5zdCB0aGUgaG9yaXpvbnRhbCBsaW5lIFsxLDBdLlxuICAgKiBAcGFyYW0ge05vZGV9IG5vZGVcbiAgICogQHJldHVybiB7Ym9vbGVhbn0gdHJ1ZSBpZiBhbmdsZSA8IDMqz4AvNFxuICAgKi9cbiAgZnVuY3Rpb24gaXNCYXNpbkFuZ2xlUmlnaHQobm9kZSkge1xuICAgIHZhciBheCA9IG5vZGUucG9pbnQueCAtIG5vZGUubmV4dC5uZXh0LnBvaW50Lng7XG4gICAgdmFyIGF5ID0gbm9kZS5wb2ludC55IC0gbm9kZS5uZXh0Lm5leHQucG9pbnQueTtcbiAgICBhc3NlcnQoYXkgPj0gMCwgXCJ1bm9yZGVyZWQgeVwiKTtcbiAgICByZXR1cm4gKGF4ID49IDAgfHwgTWF0aC5hYnMoYXgpIDwgYXkpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdHJ1ZSBpZiB0cmlhbmdsZSB3YXMgbGVnYWxpemVkXG4gICAqIEBwYXJhbSB7IVN3ZWVwQ29udGV4dH0gdGN4IC0gU3dlZXBDb250ZXh0IG9iamVjdFxuICAgKiBAcmV0dXJuIHtib29sZWFufVxuICAgKi9cbiAgZnVuY3Rpb24gbGVnYWxpemUodGN4LCB0KSB7XG4gICAgLy8gVG8gbGVnYWxpemUgYSB0cmlhbmdsZSB3ZSBzdGFydCBieSBmaW5kaW5nIGlmIGFueSBvZiB0aGUgdGhyZWUgZWRnZXNcbiAgICAvLyB2aW9sYXRlIHRoZSBEZWxhdW5heSBjb25kaXRpb25cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IDM7ICsraSkge1xuICAgICAgaWYgKHQuZGVsYXVuYXlfZWRnZVtpXSkge1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cbiAgICAgIHZhciBvdCA9IHQuZ2V0TmVpZ2hib3IoaSk7XG4gICAgICBpZiAob3QpIHtcbiAgICAgICAgdmFyIHAgPSB0LmdldFBvaW50KGkpO1xuICAgICAgICB2YXIgb3AgPSBvdC5vcHBvc2l0ZVBvaW50KHQsIHApO1xuICAgICAgICB2YXIgb2kgPSBvdC5pbmRleChvcCk7XG5cbiAgICAgICAgLy8gSWYgdGhpcyBpcyBhIENvbnN0cmFpbmVkIEVkZ2Ugb3IgYSBEZWxhdW5heSBFZGdlKG9ubHkgZHVyaW5nIHJlY3Vyc2l2ZSBsZWdhbGl6YXRpb24pXG4gICAgICAgIC8vIHRoZW4gd2Ugc2hvdWxkIG5vdCB0cnkgdG8gbGVnYWxpemVcbiAgICAgICAgaWYgKG90LmNvbnN0cmFpbmVkX2VkZ2Vbb2ldIHx8IG90LmRlbGF1bmF5X2VkZ2Vbb2ldKSB7XG4gICAgICAgICAgdC5jb25zdHJhaW5lZF9lZGdlW2ldID0gb3QuY29uc3RyYWluZWRfZWRnZVtvaV07XG4gICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgaW5zaWRlID0gaW5DaXJjbGUocCwgdC5wb2ludENDVyhwKSwgdC5wb2ludENXKHApLCBvcCk7XG4gICAgICAgIGlmIChpbnNpZGUpIHtcbiAgICAgICAgICAvLyBMZXRzIG1hcmsgdGhpcyBzaGFyZWQgZWRnZSBhcyBEZWxhdW5heVxuICAgICAgICAgIHQuZGVsYXVuYXlfZWRnZVtpXSA9IHRydWU7XG4gICAgICAgICAgb3QuZGVsYXVuYXlfZWRnZVtvaV0gPSB0cnVlO1xuXG4gICAgICAgICAgLy8gTGV0cyByb3RhdGUgc2hhcmVkIGVkZ2Ugb25lIHZlcnRleCBDVyB0byBsZWdhbGl6ZSBpdFxuICAgICAgICAgIHJvdGF0ZVRyaWFuZ2xlUGFpcih0LCBwLCBvdCwgb3ApO1xuXG4gICAgICAgICAgLy8gV2Ugbm93IGdvdCBvbmUgdmFsaWQgRGVsYXVuYXkgRWRnZSBzaGFyZWQgYnkgdHdvIHRyaWFuZ2xlc1xuICAgICAgICAgIC8vIFRoaXMgZ2l2ZXMgdXMgNCBuZXcgZWRnZXMgdG8gY2hlY2sgZm9yIERlbGF1bmF5XG5cbiAgICAgICAgICAvLyBNYWtlIHN1cmUgdGhhdCB0cmlhbmdsZSB0byBub2RlIG1hcHBpbmcgaXMgZG9uZSBvbmx5IG9uZSB0aW1lIGZvciBhIHNwZWNpZmljIHRyaWFuZ2xlXG4gICAgICAgICAgdmFyIG5vdF9sZWdhbGl6ZWQgPSAhbGVnYWxpemUodGN4LCB0KTtcbiAgICAgICAgICBpZiAobm90X2xlZ2FsaXplZCkge1xuICAgICAgICAgICAgdGN4Lm1hcFRyaWFuZ2xlVG9Ob2Rlcyh0KTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBub3RfbGVnYWxpemVkID0gIWxlZ2FsaXplKHRjeCwgb3QpO1xuICAgICAgICAgIGlmIChub3RfbGVnYWxpemVkKSB7XG4gICAgICAgICAgICB0Y3gubWFwVHJpYW5nbGVUb05vZGVzKG90KTtcbiAgICAgICAgICB9XG4gICAgICAgICAgLy8gUmVzZXQgdGhlIERlbGF1bmF5IGVkZ2VzLCBzaW5jZSB0aGV5IG9ubHkgYXJlIHZhbGlkIERlbGF1bmF5IGVkZ2VzXG4gICAgICAgICAgLy8gdW50aWwgd2UgYWRkIGEgbmV3IHRyaWFuZ2xlIG9yIHBvaW50LlxuICAgICAgICAgIC8vIFhYWDogbmVlZCB0byB0aGluayBhYm91dCB0aGlzLiBDYW4gdGhlc2UgZWRnZXMgYmUgdHJpZWQgYWZ0ZXIgd2VcbiAgICAgICAgICAvLyAgICAgIHJldHVybiB0byBwcmV2aW91cyByZWN1cnNpdmUgbGV2ZWw/XG4gICAgICAgICAgdC5kZWxhdW5heV9lZGdlW2ldID0gZmFsc2U7XG4gICAgICAgICAgb3QuZGVsYXVuYXlfZWRnZVtvaV0gPSBmYWxzZTtcblxuICAgICAgICAgIC8vIElmIHRyaWFuZ2xlIGhhdmUgYmVlbiBsZWdhbGl6ZWQgbm8gbmVlZCB0byBjaGVjayB0aGUgb3RoZXIgZWRnZXMgc2luY2VcbiAgICAgICAgICAvLyB0aGUgcmVjdXJzaXZlIGxlZ2FsaXphdGlvbiB3aWxsIGhhbmRsZXMgdGhvc2Ugc28gd2UgY2FuIGVuZCBoZXJlLlxuICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIC8qKlxuICAgKiA8Yj5SZXF1aXJlbWVudDwvYj46PGJyPlxuICAgKiAxLiBhLGIgYW5kIGMgZm9ybSBhIHRyaWFuZ2xlLjxicj5cbiAgICogMi4gYSBhbmQgZCBpcyBrbm93IHRvIGJlIG9uIG9wcG9zaXRlIHNpZGUgb2YgYmM8YnI+XG4gICAqIDxwcmU+XG4gICAqICAgICAgICAgICAgICAgIGFcbiAgICogICAgICAgICAgICAgICAgK1xuICAgKiAgICAgICAgICAgICAgIC8gXFxcbiAgICogICAgICAgICAgICAgIC8gICBcXFxuICAgKiAgICAgICAgICAgIGIvICAgICBcXGNcbiAgICogICAgICAgICAgICArLS0tLS0tLStcbiAgICogICAgICAgICAgIC8gICAgZCAgICBcXFxuICAgKiAgICAgICAgICAvICAgICAgICAgICBcXFxuICAgKiA8L3ByZT5cbiAgICogPGI+RmFjdDwvYj46IGQgaGFzIHRvIGJlIGluIGFyZWEgQiB0byBoYXZlIGEgY2hhbmNlIHRvIGJlIGluc2lkZSB0aGUgY2lyY2xlIGZvcm1lZCBieVxuICAgKiAgYSxiIGFuZCBjPGJyPlxuICAgKiAgZCBpcyBvdXRzaWRlIEIgaWYgb3JpZW50MmQoYSxiLGQpIG9yIG9yaWVudDJkKGMsYSxkKSBpcyBDVzxicj5cbiAgICogIFRoaXMgcHJla25vd2xlZGdlIGdpdmVzIHVzIGEgd2F5IHRvIG9wdGltaXplIHRoZSBpbmNpcmNsZSB0ZXN0XG4gICAqIEBwYXJhbSBwYSAtIHRyaWFuZ2xlIHBvaW50LCBvcHBvc2l0ZSBkXG4gICAqIEBwYXJhbSBwYiAtIHRyaWFuZ2xlIHBvaW50XG4gICAqIEBwYXJhbSBwYyAtIHRyaWFuZ2xlIHBvaW50XG4gICAqIEBwYXJhbSBwZCAtIHBvaW50IG9wcG9zaXRlIGFcbiAgICogQHJldHVybiB7Ym9vbGVhbn0gdHJ1ZSBpZiBkIGlzIGluc2lkZSBjaXJjbGUsIGZhbHNlIGlmIG9uIGNpcmNsZSBlZGdlXG4gICAqL1xuICBmdW5jdGlvbiBpbkNpcmNsZShwYSwgcGIsIHBjLCBwZCkge1xuICAgIHZhciBhZHggPSBwYS54IC0gcGQueDtcbiAgICB2YXIgYWR5ID0gcGEueSAtIHBkLnk7XG4gICAgdmFyIGJkeCA9IHBiLnggLSBwZC54O1xuICAgIHZhciBiZHkgPSBwYi55IC0gcGQueTtcblxuICAgIHZhciBhZHhiZHkgPSBhZHggKiBiZHk7XG4gICAgdmFyIGJkeGFkeSA9IGJkeCAqIGFkeTtcbiAgICB2YXIgb2FiZCA9IGFkeGJkeSAtIGJkeGFkeTtcbiAgICBpZiAob2FiZCA8PSAwKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgdmFyIGNkeCA9IHBjLnggLSBwZC54O1xuICAgIHZhciBjZHkgPSBwYy55IC0gcGQueTtcblxuICAgIHZhciBjZHhhZHkgPSBjZHggKiBhZHk7XG4gICAgdmFyIGFkeGNkeSA9IGFkeCAqIGNkeTtcbiAgICB2YXIgb2NhZCA9IGNkeGFkeSAtIGFkeGNkeTtcbiAgICBpZiAob2NhZCA8PSAwKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgdmFyIGJkeGNkeSA9IGJkeCAqIGNkeTtcbiAgICB2YXIgY2R4YmR5ID0gY2R4ICogYmR5O1xuXG4gICAgdmFyIGFsaWZ0ID0gYWR4ICogYWR4ICsgYWR5ICogYWR5O1xuICAgIHZhciBibGlmdCA9IGJkeCAqIGJkeCArIGJkeSAqIGJkeTtcbiAgICB2YXIgY2xpZnQgPSBjZHggKiBjZHggKyBjZHkgKiBjZHk7XG5cbiAgICB2YXIgZGV0ID0gYWxpZnQgKiAoYmR4Y2R5IC0gY2R4YmR5KSArIGJsaWZ0ICogb2NhZCArIGNsaWZ0ICogb2FiZDtcbiAgICByZXR1cm4gZGV0ID4gMDtcbiAgfVxuXG4gIC8qKlxuICAgKiBSb3RhdGVzIGEgdHJpYW5nbGUgcGFpciBvbmUgdmVydGV4IENXXG4gICAqPHByZT5cbiAgICogICAgICAgbjIgICAgICAgICAgICAgICAgICAgIG4yXG4gICAqICBQICstLS0tLSsgICAgICAgICAgICAgUCArLS0tLS0rXG4gICAqICAgIHwgdCAgL3wgICAgICAgICAgICAgICB8XFwgIHQgfFxuICAgKiAgICB8ICAgLyB8ICAgICAgICAgICAgICAgfCBcXCAgIHxcbiAgICogIG4xfCAgLyAgfG4zICAgICAgICAgICBuMXwgIFxcICB8bjNcbiAgICogICAgfCAvICAgfCAgICBhZnRlciBDVyAgIHwgICBcXCB8XG4gICAqICAgIHwvIG9UIHwgICAgICAgICAgICAgICB8IG9UIFxcfFxuICAgKiAgICArLS0tLS0rIG9QICAgICAgICAgICAgKy0tLS0tK1xuICAgKiAgICAgICBuNCAgICAgICAgICAgICAgICAgICAgbjRcbiAgICogPC9wcmU+XG4gICAqL1xuICBmdW5jdGlvbiByb3RhdGVUcmlhbmdsZVBhaXIodCwgcCwgb3QsIG9wKSB7XG4gICAgdmFyIG4xLCBuMiwgbjMsIG40O1xuICAgIG4xID0gdC5uZWlnaGJvckNDVyhwKTtcbiAgICBuMiA9IHQubmVpZ2hib3JDVyhwKTtcbiAgICBuMyA9IG90Lm5laWdoYm9yQ0NXKG9wKTtcbiAgICBuNCA9IG90Lm5laWdoYm9yQ1cob3ApO1xuXG4gICAgdmFyIGNlMSwgY2UyLCBjZTMsIGNlNDtcbiAgICBjZTEgPSB0LmdldENvbnN0cmFpbmVkRWRnZUNDVyhwKTtcbiAgICBjZTIgPSB0LmdldENvbnN0cmFpbmVkRWRnZUNXKHApO1xuICAgIGNlMyA9IG90LmdldENvbnN0cmFpbmVkRWRnZUNDVyhvcCk7XG4gICAgY2U0ID0gb3QuZ2V0Q29uc3RyYWluZWRFZGdlQ1cob3ApO1xuXG4gICAgdmFyIGRlMSwgZGUyLCBkZTMsIGRlNDtcbiAgICBkZTEgPSB0LmdldERlbGF1bmF5RWRnZUNDVyhwKTtcbiAgICBkZTIgPSB0LmdldERlbGF1bmF5RWRnZUNXKHApO1xuICAgIGRlMyA9IG90LmdldERlbGF1bmF5RWRnZUNDVyhvcCk7XG4gICAgZGU0ID0gb3QuZ2V0RGVsYXVuYXlFZGdlQ1cob3ApO1xuXG4gICAgdC5sZWdhbGl6ZShwLCBvcCk7XG4gICAgb3QubGVnYWxpemUob3AsIHApO1xuXG4gICAgLy8gUmVtYXAgZGVsYXVuYXlfZWRnZVxuICAgIG90LnNldERlbGF1bmF5RWRnZUNDVyhwLCBkZTEpO1xuICAgIHQuc2V0RGVsYXVuYXlFZGdlQ1cocCwgZGUyKTtcbiAgICB0LnNldERlbGF1bmF5RWRnZUNDVyhvcCwgZGUzKTtcbiAgICBvdC5zZXREZWxhdW5heUVkZ2VDVyhvcCwgZGU0KTtcblxuICAgIC8vIFJlbWFwIGNvbnN0cmFpbmVkX2VkZ2VcbiAgICBvdC5zZXRDb25zdHJhaW5lZEVkZ2VDQ1cocCwgY2UxKTtcbiAgICB0LnNldENvbnN0cmFpbmVkRWRnZUNXKHAsIGNlMik7XG4gICAgdC5zZXRDb25zdHJhaW5lZEVkZ2VDQ1cob3AsIGNlMyk7XG4gICAgb3Quc2V0Q29uc3RyYWluZWRFZGdlQ1cob3AsIGNlNCk7XG5cbiAgICAvLyBSZW1hcCBuZWlnaGJvcnNcbiAgICAvLyBYWFg6IG1pZ2h0IG9wdGltaXplIHRoZSBtYXJrTmVpZ2hib3IgYnkga2VlcGluZyB0cmFjayBvZlxuICAgIC8vICAgICAgd2hhdCBzaWRlIHNob3VsZCBiZSBhc3NpZ25lZCB0byB3aGF0IG5laWdoYm9yIGFmdGVyIHRoZVxuICAgIC8vICAgICAgcm90YXRpb24uIE5vdyBtYXJrIG5laWdoYm9yIGRvZXMgbG90cyBvZiB0ZXN0aW5nIHRvIGZpbmRcbiAgICAvLyAgICAgIHRoZSByaWdodCBzaWRlLlxuICAgIHQuY2xlYXJOZWlnaGJvcnMoKTtcbiAgICBvdC5jbGVhck5laWdoYm9ycygpO1xuICAgIGlmIChuMSkge1xuICAgICAgb3QubWFya05laWdoYm9yKG4xKTtcbiAgICB9XG4gICAgaWYgKG4yKSB7XG4gICAgICB0Lm1hcmtOZWlnaGJvcihuMik7XG4gICAgfVxuICAgIGlmIChuMykge1xuICAgICAgdC5tYXJrTmVpZ2hib3IobjMpO1xuICAgIH1cbiAgICBpZiAobjQpIHtcbiAgICAgIG90Lm1hcmtOZWlnaGJvcihuNCk7XG4gICAgfVxuICAgIHQubWFya05laWdoYm9yKG90KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBGaWxscyBhIGJhc2luIHRoYXQgaGFzIGZvcm1lZCBvbiB0aGUgQWR2YW5jaW5nIEZyb250IHRvIHRoZSByaWdodFxuICAgKiBvZiBnaXZlbiBub2RlLjxicj5cbiAgICogRmlyc3Qgd2UgZGVjaWRlIGEgbGVmdCxib3R0b20gYW5kIHJpZ2h0IG5vZGUgdGhhdCBmb3JtcyB0aGVcbiAgICogYm91bmRhcmllcyBvZiB0aGUgYmFzaW4uIFRoZW4gd2UgZG8gYSByZXF1cnNpdmUgZmlsbC5cbiAgICpcbiAgICogQHBhcmFtIHshU3dlZXBDb250ZXh0fSB0Y3ggLSBTd2VlcENvbnRleHQgb2JqZWN0XG4gICAqIEBwYXJhbSBub2RlIC0gc3RhcnRpbmcgbm9kZSwgdGhpcyBvciBuZXh0IG5vZGUgd2lsbCBiZSBsZWZ0IG5vZGVcbiAgICovXG4gIGZ1bmN0aW9uIGZpbGxCYXNpbih0Y3gsIG5vZGUpIHtcbiAgICBpZiAob3JpZW50MmQobm9kZS5wb2ludCwgbm9kZS5uZXh0LnBvaW50LCBub2RlLm5leHQubmV4dC5wb2ludCkgPT09IE9yaWVudGF0aW9uLkNDVykge1xuICAgICAgdGN4LmJhc2luLmxlZnRfbm9kZSA9IG5vZGUubmV4dC5uZXh0O1xuICAgIH0gZWxzZSB7XG4gICAgICB0Y3guYmFzaW4ubGVmdF9ub2RlID0gbm9kZS5uZXh0O1xuICAgIH1cblxuICAgIC8vIEZpbmQgdGhlIGJvdHRvbSBhbmQgcmlnaHQgbm9kZVxuICAgIHRjeC5iYXNpbi5ib3R0b21fbm9kZSA9IHRjeC5iYXNpbi5sZWZ0X25vZGU7XG4gICAgd2hpbGUgKHRjeC5iYXNpbi5ib3R0b21fbm9kZS5uZXh0ICYmIHRjeC5iYXNpbi5ib3R0b21fbm9kZS5wb2ludC55ID49IHRjeC5iYXNpbi5ib3R0b21fbm9kZS5uZXh0LnBvaW50LnkpIHtcbiAgICAgIHRjeC5iYXNpbi5ib3R0b21fbm9kZSA9IHRjeC5iYXNpbi5ib3R0b21fbm9kZS5uZXh0O1xuICAgIH1cbiAgICBpZiAodGN4LmJhc2luLmJvdHRvbV9ub2RlID09PSB0Y3guYmFzaW4ubGVmdF9ub2RlKSB7XG4gICAgICAvLyBObyB2YWxpZCBiYXNpblxuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRjeC5iYXNpbi5yaWdodF9ub2RlID0gdGN4LmJhc2luLmJvdHRvbV9ub2RlO1xuICAgIHdoaWxlICh0Y3guYmFzaW4ucmlnaHRfbm9kZS5uZXh0ICYmIHRjeC5iYXNpbi5yaWdodF9ub2RlLnBvaW50LnkgPCB0Y3guYmFzaW4ucmlnaHRfbm9kZS5uZXh0LnBvaW50LnkpIHtcbiAgICAgIHRjeC5iYXNpbi5yaWdodF9ub2RlID0gdGN4LmJhc2luLnJpZ2h0X25vZGUubmV4dDtcbiAgICB9XG4gICAgaWYgKHRjeC5iYXNpbi5yaWdodF9ub2RlID09PSB0Y3guYmFzaW4uYm90dG9tX25vZGUpIHtcbiAgICAgIC8vIE5vIHZhbGlkIGJhc2luc1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRjeC5iYXNpbi53aWR0aCA9IHRjeC5iYXNpbi5yaWdodF9ub2RlLnBvaW50LnggLSB0Y3guYmFzaW4ubGVmdF9ub2RlLnBvaW50Lng7XG4gICAgdGN4LmJhc2luLmxlZnRfaGlnaGVzdCA9IHRjeC5iYXNpbi5sZWZ0X25vZGUucG9pbnQueSA+IHRjeC5iYXNpbi5yaWdodF9ub2RlLnBvaW50Lnk7XG5cbiAgICBmaWxsQmFzaW5SZXEodGN4LCB0Y3guYmFzaW4uYm90dG9tX25vZGUpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlY3Vyc2l2ZSBhbGdvcml0aG0gdG8gZmlsbCBhIEJhc2luIHdpdGggdHJpYW5nbGVzXG4gICAqXG4gICAqIEBwYXJhbSB7IVN3ZWVwQ29udGV4dH0gdGN4IC0gU3dlZXBDb250ZXh0IG9iamVjdFxuICAgKiBAcGFyYW0gbm9kZSAtIGJvdHRvbV9ub2RlXG4gICAqL1xuICBmdW5jdGlvbiBmaWxsQmFzaW5SZXEodGN4LCBub2RlKSB7XG4gICAgLy8gaWYgc2hhbGxvdyBzdG9wIGZpbGxpbmdcbiAgICBpZiAoaXNTaGFsbG93KHRjeCwgbm9kZSkpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBmaWxsKHRjeCwgbm9kZSk7XG5cbiAgICB2YXIgbztcbiAgICBpZiAobm9kZS5wcmV2ID09PSB0Y3guYmFzaW4ubGVmdF9ub2RlICYmIG5vZGUubmV4dCA9PT0gdGN4LmJhc2luLnJpZ2h0X25vZGUpIHtcbiAgICAgIHJldHVybjtcbiAgICB9IGVsc2UgaWYgKG5vZGUucHJldiA9PT0gdGN4LmJhc2luLmxlZnRfbm9kZSkge1xuICAgICAgbyA9IG9yaWVudDJkKG5vZGUucG9pbnQsIG5vZGUubmV4dC5wb2ludCwgbm9kZS5uZXh0Lm5leHQucG9pbnQpO1xuICAgICAgaWYgKG8gPT09IE9yaWVudGF0aW9uLkNXKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIG5vZGUgPSBub2RlLm5leHQ7XG4gICAgfSBlbHNlIGlmIChub2RlLm5leHQgPT09IHRjeC5iYXNpbi5yaWdodF9ub2RlKSB7XG4gICAgICBvID0gb3JpZW50MmQobm9kZS5wb2ludCwgbm9kZS5wcmV2LnBvaW50LCBub2RlLnByZXYucHJldi5wb2ludCk7XG4gICAgICBpZiAobyA9PT0gT3JpZW50YXRpb24uQ0NXKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIG5vZGUgPSBub2RlLnByZXY7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIENvbnRpbnVlIHdpdGggdGhlIG5laWdoYm9yIG5vZGUgd2l0aCBsb3dlc3QgWSB2YWx1ZVxuICAgICAgaWYgKG5vZGUucHJldi5wb2ludC55IDwgbm9kZS5uZXh0LnBvaW50LnkpIHtcbiAgICAgICAgbm9kZSA9IG5vZGUucHJldjtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIG5vZGUgPSBub2RlLm5leHQ7XG4gICAgICB9XG4gICAgfVxuXG4gICAgZmlsbEJhc2luUmVxKHRjeCwgbm9kZSk7XG4gIH1cblxuICBmdW5jdGlvbiBpc1NoYWxsb3codGN4LCBub2RlKSB7XG4gICAgdmFyIGhlaWdodDtcbiAgICBpZiAodGN4LmJhc2luLmxlZnRfaGlnaGVzdCkge1xuICAgICAgaGVpZ2h0ID0gdGN4LmJhc2luLmxlZnRfbm9kZS5wb2ludC55IC0gbm9kZS5wb2ludC55O1xuICAgIH0gZWxzZSB7XG4gICAgICBoZWlnaHQgPSB0Y3guYmFzaW4ucmlnaHRfbm9kZS5wb2ludC55IC0gbm9kZS5wb2ludC55O1xuICAgIH1cblxuICAgIC8vIGlmIHNoYWxsb3cgc3RvcCBmaWxsaW5nXG4gICAgaWYgKHRjeC5iYXNpbi53aWR0aCA+IGhlaWdodCkge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGZpbGxFZGdlRXZlbnQodGN4LCBlZGdlLCBub2RlKSB7XG4gICAgaWYgKHRjeC5lZGdlX2V2ZW50LnJpZ2h0KSB7XG4gICAgICBmaWxsUmlnaHRBYm92ZUVkZ2VFdmVudCh0Y3gsIGVkZ2UsIG5vZGUpO1xuICAgIH0gZWxzZSB7XG4gICAgICBmaWxsTGVmdEFib3ZlRWRnZUV2ZW50KHRjeCwgZWRnZSwgbm9kZSk7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gZmlsbFJpZ2h0QWJvdmVFZGdlRXZlbnQodGN4LCBlZGdlLCBub2RlKSB7XG4gICAgd2hpbGUgKG5vZGUubmV4dC5wb2ludC54IDwgZWRnZS5wLngpIHtcbiAgICAgIC8vIENoZWNrIGlmIG5leHQgbm9kZSBpcyBiZWxvdyB0aGUgZWRnZVxuICAgICAgaWYgKG9yaWVudDJkKGVkZ2UucSwgbm9kZS5uZXh0LnBvaW50LCBlZGdlLnApID09PSBPcmllbnRhdGlvbi5DQ1cpIHtcbiAgICAgICAgZmlsbFJpZ2h0QmVsb3dFZGdlRXZlbnQodGN4LCBlZGdlLCBub2RlKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIG5vZGUgPSBub2RlLm5leHQ7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gZmlsbFJpZ2h0QmVsb3dFZGdlRXZlbnQodGN4LCBlZGdlLCBub2RlKSB7XG4gICAgaWYgKG5vZGUucG9pbnQueCA8IGVkZ2UucC54KSB7XG4gICAgICBpZiAob3JpZW50MmQobm9kZS5wb2ludCwgbm9kZS5uZXh0LnBvaW50LCBub2RlLm5leHQubmV4dC5wb2ludCkgPT09IE9yaWVudGF0aW9uLkNDVykge1xuICAgICAgICAvLyBDb25jYXZlXG4gICAgICAgIGZpbGxSaWdodENvbmNhdmVFZGdlRXZlbnQodGN4LCBlZGdlLCBub2RlKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIENvbnZleFxuICAgICAgICBmaWxsUmlnaHRDb252ZXhFZGdlRXZlbnQodGN4LCBlZGdlLCBub2RlKTtcbiAgICAgICAgLy8gUmV0cnkgdGhpcyBvbmVcbiAgICAgICAgZmlsbFJpZ2h0QmVsb3dFZGdlRXZlbnQodGN4LCBlZGdlLCBub2RlKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBmaWxsUmlnaHRDb25jYXZlRWRnZUV2ZW50KHRjeCwgZWRnZSwgbm9kZSkge1xuICAgIGZpbGwodGN4LCBub2RlLm5leHQpO1xuICAgIGlmIChub2RlLm5leHQucG9pbnQgIT09IGVkZ2UucCkge1xuICAgICAgLy8gTmV4dCBhYm92ZSBvciBiZWxvdyBlZGdlP1xuICAgICAgaWYgKG9yaWVudDJkKGVkZ2UucSwgbm9kZS5uZXh0LnBvaW50LCBlZGdlLnApID09PSBPcmllbnRhdGlvbi5DQ1cpIHtcbiAgICAgICAgLy8gQmVsb3dcbiAgICAgICAgaWYgKG9yaWVudDJkKG5vZGUucG9pbnQsIG5vZGUubmV4dC5wb2ludCwgbm9kZS5uZXh0Lm5leHQucG9pbnQpID09PSBPcmllbnRhdGlvbi5DQ1cpIHtcbiAgICAgICAgICAvLyBOZXh0IGlzIGNvbmNhdmVcbiAgICAgICAgICBmaWxsUmlnaHRDb25jYXZlRWRnZUV2ZW50KHRjeCwgZWRnZSwgbm9kZSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgLy8gTmV4dCBpcyBjb252ZXhcbiAgICAgICAgICAvKiBqc2hpbnQgbm9lbXB0eTpmYWxzZSAqL1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gZmlsbFJpZ2h0Q29udmV4RWRnZUV2ZW50KHRjeCwgZWRnZSwgbm9kZSkge1xuICAgIC8vIE5leHQgY29uY2F2ZSBvciBjb252ZXg/XG4gICAgaWYgKG9yaWVudDJkKG5vZGUubmV4dC5wb2ludCwgbm9kZS5uZXh0Lm5leHQucG9pbnQsIG5vZGUubmV4dC5uZXh0Lm5leHQucG9pbnQpID09PSBPcmllbnRhdGlvbi5DQ1cpIHtcbiAgICAgIC8vIENvbmNhdmVcbiAgICAgIGZpbGxSaWdodENvbmNhdmVFZGdlRXZlbnQodGN4LCBlZGdlLCBub2RlLm5leHQpO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBDb252ZXhcbiAgICAgIC8vIE5leHQgYWJvdmUgb3IgYmVsb3cgZWRnZT9cbiAgICAgIGlmIChvcmllbnQyZChlZGdlLnEsIG5vZGUubmV4dC5uZXh0LnBvaW50LCBlZGdlLnApID09PSBPcmllbnRhdGlvbi5DQ1cpIHtcbiAgICAgICAgLy8gQmVsb3dcbiAgICAgICAgZmlsbFJpZ2h0Q29udmV4RWRnZUV2ZW50KHRjeCwgZWRnZSwgbm9kZS5uZXh0KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIEFib3ZlXG4gICAgICAgIC8qIGpzaGludCBub2VtcHR5OmZhbHNlICovXG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gZmlsbExlZnRBYm92ZUVkZ2VFdmVudCh0Y3gsIGVkZ2UsIG5vZGUpIHtcbiAgICB3aGlsZSAobm9kZS5wcmV2LnBvaW50LnggPiBlZGdlLnAueCkge1xuICAgICAgLy8gQ2hlY2sgaWYgbmV4dCBub2RlIGlzIGJlbG93IHRoZSBlZGdlXG4gICAgICBpZiAob3JpZW50MmQoZWRnZS5xLCBub2RlLnByZXYucG9pbnQsIGVkZ2UucCkgPT09IE9yaWVudGF0aW9uLkNXKSB7XG4gICAgICAgIGZpbGxMZWZ0QmVsb3dFZGdlRXZlbnQodGN4LCBlZGdlLCBub2RlKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIG5vZGUgPSBub2RlLnByZXY7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gZmlsbExlZnRCZWxvd0VkZ2VFdmVudCh0Y3gsIGVkZ2UsIG5vZGUpIHtcbiAgICBpZiAobm9kZS5wb2ludC54ID4gZWRnZS5wLngpIHtcbiAgICAgIGlmIChvcmllbnQyZChub2RlLnBvaW50LCBub2RlLnByZXYucG9pbnQsIG5vZGUucHJldi5wcmV2LnBvaW50KSA9PT0gT3JpZW50YXRpb24uQ1cpIHtcbiAgICAgICAgLy8gQ29uY2F2ZVxuICAgICAgICBmaWxsTGVmdENvbmNhdmVFZGdlRXZlbnQodGN4LCBlZGdlLCBub2RlKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIENvbnZleFxuICAgICAgICBmaWxsTGVmdENvbnZleEVkZ2VFdmVudCh0Y3gsIGVkZ2UsIG5vZGUpO1xuICAgICAgICAvLyBSZXRyeSB0aGlzIG9uZVxuICAgICAgICBmaWxsTGVmdEJlbG93RWRnZUV2ZW50KHRjeCwgZWRnZSwgbm9kZSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gZmlsbExlZnRDb252ZXhFZGdlRXZlbnQodGN4LCBlZGdlLCBub2RlKSB7XG4gICAgLy8gTmV4dCBjb25jYXZlIG9yIGNvbnZleD9cbiAgICBpZiAob3JpZW50MmQobm9kZS5wcmV2LnBvaW50LCBub2RlLnByZXYucHJldi5wb2ludCwgbm9kZS5wcmV2LnByZXYucHJldi5wb2ludCkgPT09IE9yaWVudGF0aW9uLkNXKSB7XG4gICAgICAvLyBDb25jYXZlXG4gICAgICBmaWxsTGVmdENvbmNhdmVFZGdlRXZlbnQodGN4LCBlZGdlLCBub2RlLnByZXYpO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBDb252ZXhcbiAgICAgIC8vIE5leHQgYWJvdmUgb3IgYmVsb3cgZWRnZT9cbiAgICAgIGlmIChvcmllbnQyZChlZGdlLnEsIG5vZGUucHJldi5wcmV2LnBvaW50LCBlZGdlLnApID09PSBPcmllbnRhdGlvbi5DVykge1xuICAgICAgICAvLyBCZWxvd1xuICAgICAgICBmaWxsTGVmdENvbnZleEVkZ2VFdmVudCh0Y3gsIGVkZ2UsIG5vZGUucHJldik7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBBYm92ZVxuICAgICAgICAvKiBqc2hpbnQgbm9lbXB0eTpmYWxzZSAqL1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIGZpbGxMZWZ0Q29uY2F2ZUVkZ2VFdmVudCh0Y3gsIGVkZ2UsIG5vZGUpIHtcbiAgICBmaWxsKHRjeCwgbm9kZS5wcmV2KTtcbiAgICBpZiAobm9kZS5wcmV2LnBvaW50ICE9PSBlZGdlLnApIHtcbiAgICAgIC8vIE5leHQgYWJvdmUgb3IgYmVsb3cgZWRnZT9cbiAgICAgIGlmIChvcmllbnQyZChlZGdlLnEsIG5vZGUucHJldi5wb2ludCwgZWRnZS5wKSA9PT0gT3JpZW50YXRpb24uQ1cpIHtcbiAgICAgICAgLy8gQmVsb3dcbiAgICAgICAgaWYgKG9yaWVudDJkKG5vZGUucG9pbnQsIG5vZGUucHJldi5wb2ludCwgbm9kZS5wcmV2LnByZXYucG9pbnQpID09PSBPcmllbnRhdGlvbi5DVykge1xuICAgICAgICAgIC8vIE5leHQgaXMgY29uY2F2ZVxuICAgICAgICAgIGZpbGxMZWZ0Q29uY2F2ZUVkZ2VFdmVudCh0Y3gsIGVkZ2UsIG5vZGUpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8vIE5leHQgaXMgY29udmV4XG4gICAgICAgICAgLyoganNoaW50IG5vZW1wdHk6ZmFsc2UgKi9cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIGZsaXBFZGdlRXZlbnQodGN4LCBlcCwgZXEsIHQsIHApIHtcbiAgICB2YXIgb3QgPSB0Lm5laWdoYm9yQWNyb3NzKHApO1xuICAgIGFzc2VydChvdCwgXCJGTElQIGZhaWxlZCBkdWUgdG8gbWlzc2luZyB0cmlhbmdsZSFcIik7XG5cbiAgICB2YXIgb3AgPSBvdC5vcHBvc2l0ZVBvaW50KHQsIHApO1xuXG4gICAgLy8gQWRkaXRpb25hbCBjaGVjayBmcm9tIEphdmEgdmVyc2lvbiAoc2VlIGlzc3VlICM4OClcbiAgICBpZiAodC5nZXRDb25zdHJhaW5lZEVkZ2VBY3Jvc3MocCkpIHtcbiAgICAgIHZhciBpbmRleCA9IHQuaW5kZXgocCk7XG4gICAgICB0aHJvdyBuZXcgUG9pbnRFcnJvcihcInBvbHkydHJpIEludGVyc2VjdGluZyBDb25zdHJhaW50c1wiLFxuICAgICAgICBbcCwgb3AsIHQuZ2V0UG9pbnQoKGluZGV4ICsgMSkgJSAzKSwgdC5nZXRQb2ludCgoaW5kZXggKyAyKSAlIDMpXSk7XG4gICAgfVxuXG4gICAgaWYgKGluU2NhbkFyZWEocCwgdC5wb2ludENDVyhwKSwgdC5wb2ludENXKHApLCBvcCkpIHtcbiAgICAgIC8vIExldHMgcm90YXRlIHNoYXJlZCBlZGdlIG9uZSB2ZXJ0ZXggQ1dcbiAgICAgIHJvdGF0ZVRyaWFuZ2xlUGFpcih0LCBwLCBvdCwgb3ApO1xuICAgICAgdGN4Lm1hcFRyaWFuZ2xlVG9Ob2Rlcyh0KTtcbiAgICAgIHRjeC5tYXBUcmlhbmdsZVRvTm9kZXMob3QpO1xuXG4gICAgICAvLyBYWFg6IGluIHRoZSBvcmlnaW5hbCBDKysgY29kZSBmb3IgdGhlIG5leHQgMiBsaW5lcywgd2UgYXJlXG4gICAgICAvLyBjb21wYXJpbmcgcG9pbnQgdmFsdWVzIChhbmQgbm90IHBvaW50ZXJzKS4gSW4gdGhpcyBKYXZhU2NyaXB0XG4gICAgICAvLyBjb2RlLCB3ZSBhcmUgY29tcGFyaW5nIHBvaW50IHJlZmVyZW5jZXMgKHBvaW50ZXJzKS4gVGhpcyB3b3Jrc1xuICAgICAgLy8gYmVjYXVzZSB3ZSBjYW4ndCBoYXZlIDIgZGlmZmVyZW50IHBvaW50cyB3aXRoIHRoZSBzYW1lIHZhbHVlcy5cbiAgICAgIC8vIEJ1dCB0byBiZSByZWFsbHkgZXF1aXZhbGVudCwgd2Ugc2hvdWxkIHVzZSBcIlBvaW50LmVxdWFsc1wiIGhlcmUuXG4gICAgICBpZiAocCA9PT0gZXEgJiYgb3AgPT09IGVwKSB7XG4gICAgICAgIGlmIChlcSA9PT0gdGN4LmVkZ2VfZXZlbnQuY29uc3RyYWluZWRfZWRnZS5xICYmIGVwID09PSB0Y3guZWRnZV9ldmVudC5jb25zdHJhaW5lZF9lZGdlLnApIHtcbiAgICAgICAgICB0Lm1hcmtDb25zdHJhaW5lZEVkZ2VCeVBvaW50cyhlcCwgZXEpO1xuICAgICAgICAgIG90Lm1hcmtDb25zdHJhaW5lZEVkZ2VCeVBvaW50cyhlcCwgZXEpO1xuICAgICAgICAgIGxlZ2FsaXplKHRjeCwgdCk7XG4gICAgICAgICAgbGVnYWxpemUodGN4LCBvdCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgLy8gWFhYOiBJIHRoaW5rIG9uZSBvZiB0aGUgdHJpYW5nbGVzIHNob3VsZCBiZSBsZWdhbGl6ZWQgaGVyZT9cbiAgICAgICAgICAvKiBqc2hpbnQgbm9lbXB0eTpmYWxzZSAqL1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB2YXIgbyA9IG9yaWVudDJkKGVxLCBvcCwgZXApO1xuICAgICAgICB0ID0gbmV4dEZsaXBUcmlhbmdsZSh0Y3gsIG8sIHQsIG90LCBwLCBvcCk7XG4gICAgICAgIGZsaXBFZGdlRXZlbnQodGN4LCBlcCwgZXEsIHQsIHApO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICB2YXIgbmV3UCA9IG5leHRGbGlwUG9pbnQoZXAsIGVxLCBvdCwgb3ApO1xuICAgICAgZmxpcFNjYW5FZGdlRXZlbnQodGN4LCBlcCwgZXEsIHQsIG90LCBuZXdQKTtcbiAgICAgIGVkZ2VFdmVudEJ5UG9pbnRzKHRjeCwgZXAsIGVxLCB0LCBwKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQWZ0ZXIgYSBmbGlwIHdlIGhhdmUgdHdvIHRyaWFuZ2xlcyBhbmQga25vdyB0aGF0IG9ubHkgb25lIHdpbGwgc3RpbGwgYmVcbiAgICogaW50ZXJzZWN0aW5nIHRoZSBlZGdlLiBTbyBkZWNpZGUgd2hpY2ggdG8gY29udGl1bmUgd2l0aCBhbmQgbGVnYWxpemUgdGhlIG90aGVyXG4gICAqXG4gICAqIEBwYXJhbSB7IVN3ZWVwQ29udGV4dH0gdGN4IC0gU3dlZXBDb250ZXh0IG9iamVjdFxuICAgKiBAcGFyYW0gbyAtIHNob3VsZCBiZSB0aGUgcmVzdWx0IG9mIGFuIG9yaWVudDJkKCBlcSwgb3AsIGVwIClcbiAgICogQHBhcmFtIHQgLSB0cmlhbmdsZSAxXG4gICAqIEBwYXJhbSBvdCAtIHRyaWFuZ2xlIDJcbiAgICogQHBhcmFtIHAgLSBhIHBvaW50IHNoYXJlZCBieSBib3RoIHRyaWFuZ2xlc1xuICAgKiBAcGFyYW0gb3AgLSBhbm90aGVyIHBvaW50IHNoYXJlZCBieSBib3RoIHRyaWFuZ2xlc1xuICAgKiBAcmV0dXJuIHJldHVybnMgdGhlIHRyaWFuZ2xlIHN0aWxsIGludGVyc2VjdGluZyB0aGUgZWRnZVxuICAgKi9cbiAgZnVuY3Rpb24gbmV4dEZsaXBUcmlhbmdsZSh0Y3gsIG8sIHQsIG90LCBwLCBvcCkge1xuICAgIHZhciBlZGdlX2luZGV4O1xuICAgIGlmIChvID09PSBPcmllbnRhdGlvbi5DQ1cpIHtcbiAgICAgIC8vIG90IGlzIG5vdCBjcm9zc2luZyBlZGdlIGFmdGVyIGZsaXBcbiAgICAgIGVkZ2VfaW5kZXggPSBvdC5lZGdlSW5kZXgocCwgb3ApO1xuICAgICAgb3QuZGVsYXVuYXlfZWRnZVtlZGdlX2luZGV4XSA9IHRydWU7XG4gICAgICBsZWdhbGl6ZSh0Y3gsIG90KTtcbiAgICAgIG90LmNsZWFyRGVsYXVuYXlFZGdlcygpO1xuICAgICAgcmV0dXJuIHQ7XG4gICAgfVxuXG4gICAgLy8gdCBpcyBub3QgY3Jvc3NpbmcgZWRnZSBhZnRlciBmbGlwXG4gICAgZWRnZV9pbmRleCA9IHQuZWRnZUluZGV4KHAsIG9wKTtcblxuICAgIHQuZGVsYXVuYXlfZWRnZVtlZGdlX2luZGV4XSA9IHRydWU7XG4gICAgbGVnYWxpemUodGN4LCB0KTtcbiAgICB0LmNsZWFyRGVsYXVuYXlFZGdlcygpO1xuICAgIHJldHVybiBvdDtcbiAgfVxuXG4gIC8qKlxuICAgKiBXaGVuIHdlIG5lZWQgdG8gdHJhdmVyc2UgZnJvbSBvbmUgdHJpYW5nbGUgdG8gdGhlIG5leHQgd2UgbmVlZFxuICAgKiB0aGUgcG9pbnQgaW4gY3VycmVudCB0cmlhbmdsZSB0aGF0IGlzIHRoZSBvcHBvc2l0ZSBwb2ludCB0byB0aGUgbmV4dFxuICAgKiB0cmlhbmdsZS5cbiAgICovXG4gIGZ1bmN0aW9uIG5leHRGbGlwUG9pbnQoZXAsIGVxLCBvdCwgb3ApIHtcbiAgICB2YXIgbzJkID0gb3JpZW50MmQoZXEsIG9wLCBlcCk7XG4gICAgaWYgKG8yZCA9PT0gT3JpZW50YXRpb24uQ1cpIHtcbiAgICAgIC8vIFJpZ2h0XG4gICAgICByZXR1cm4gb3QucG9pbnRDQ1cob3ApO1xuICAgIH0gZWxzZSBpZiAobzJkID09PSBPcmllbnRhdGlvbi5DQ1cpIHtcbiAgICAgIC8vIExlZnRcbiAgICAgIHJldHVybiBvdC5wb2ludENXKG9wKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhyb3cgbmV3IFBvaW50RXJyb3IoXCJwb2x5MnRyaSBbVW5zdXBwb3J0ZWRdIG5leHRGbGlwUG9pbnQ6IG9wcG9zaW5nIHBvaW50IG9uIGNvbnN0cmFpbmVkIGVkZ2UhXCIsIFtlcSwgb3AsIGVwXSk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFNjYW4gcGFydCBvZiB0aGUgRmxpcFNjYW4gYWxnb3JpdGhtPGJyPlxuICAgKiBXaGVuIGEgdHJpYW5nbGUgcGFpciBpc24ndCBmbGlwcGFibGUgd2Ugd2lsbCBzY2FuIGZvciB0aGUgbmV4dFxuICAgKiBwb2ludCB0aGF0IGlzIGluc2lkZSB0aGUgZmxpcCB0cmlhbmdsZSBzY2FuIGFyZWEuIFdoZW4gZm91bmRcbiAgICogd2UgZ2VuZXJhdGUgYSBuZXcgZmxpcEVkZ2VFdmVudFxuICAgKlxuICAgKiBAcGFyYW0geyFTd2VlcENvbnRleHR9IHRjeCAtIFN3ZWVwQ29udGV4dCBvYmplY3RcbiAgICogQHBhcmFtIGVwIC0gbGFzdCBwb2ludCBvbiB0aGUgZWRnZSB3ZSBhcmUgdHJhdmVyc2luZ1xuICAgKiBAcGFyYW0gZXEgLSBmaXJzdCBwb2ludCBvbiB0aGUgZWRnZSB3ZSBhcmUgdHJhdmVyc2luZ1xuICAgKiBAcGFyYW0geyFUcmlhbmdsZX0gZmxpcF90cmlhbmdsZSAtIHRoZSBjdXJyZW50IHRyaWFuZ2xlIHNoYXJpbmcgdGhlIHBvaW50IGVxIHdpdGggZWRnZVxuICAgKiBAcGFyYW0gdFxuICAgKiBAcGFyYW0gcFxuICAgKi9cbiAgZnVuY3Rpb24gZmxpcFNjYW5FZGdlRXZlbnQodGN4LCBlcCwgZXEsIGZsaXBfdHJpYW5nbGUsIHQsIHApIHtcbiAgICB2YXIgb3QgPSB0Lm5laWdoYm9yQWNyb3NzKHApO1xuICAgIGFzc2VydChvdCwgXCJGTElQIGZhaWxlZCBkdWUgdG8gbWlzc2luZyB0cmlhbmdsZVwiKTtcblxuICAgIHZhciBvcCA9IG90Lm9wcG9zaXRlUG9pbnQodCwgcCk7XG5cbiAgICBpZiAoaW5TY2FuQXJlYShlcSwgZmxpcF90cmlhbmdsZS5wb2ludENDVyhlcSksIGZsaXBfdHJpYW5nbGUucG9pbnRDVyhlcSksIG9wKSkge1xuICAgICAgLy8gZmxpcCB3aXRoIG5ldyBlZGdlIG9wLmVxXG4gICAgICBmbGlwRWRnZUV2ZW50KHRjeCwgZXEsIG9wLCBvdCwgb3ApO1xuICAgIH0gZWxzZSB7XG4gICAgICB2YXIgbmV3UCA9IG5leHRGbGlwUG9pbnQoZXAsIGVxLCBvdCwgb3ApO1xuICAgICAgZmxpcFNjYW5FZGdlRXZlbnQodGN4LCBlcCwgZXEsIGZsaXBfdHJpYW5nbGUsIG90LCBuZXdQKTtcbiAgICB9XG4gIH1cblxuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tRXhwb3J0c1xuXG4gIGV4cG9ydHMudHJpYW5ndWxhdGUgPSB0cmlhbmd1bGF0ZTtcblxufSx7XCIuL2FkdmFuY2luZ2Zyb250XCI6MixcIi4vYXNzZXJ0XCI6MyxcIi4vcG9pbnRlcnJvclwiOjUsXCIuL3RyaWFuZ2xlXCI6OSxcIi4vdXRpbHNcIjoxMH1dLDg6W2Z1bmN0aW9uKF9kZXJlcV8sbW9kdWxlLGV4cG9ydHMpe1xuICAvKlxuICAgKiBQb2x5MlRyaSBDb3B5cmlnaHQgKGMpIDIwMDktMjAxNCwgUG9seTJUcmkgQ29udHJpYnV0b3JzXG4gICAqIGh0dHA6Ly9jb2RlLmdvb2dsZS5jb20vcC9wb2x5MnRyaS9cbiAgICpcbiAgICogcG9seTJ0cmkuanMgKEphdmFTY3JpcHQgcG9ydCkgKGMpIDIwMDktMjAxNCwgUG9seTJUcmkgQ29udHJpYnV0b3JzXG4gICAqIGh0dHBzOi8vZ2l0aHViLmNvbS9yM21pL3BvbHkydHJpLmpzXG4gICAqXG4gICAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gICAqXG4gICAqIERpc3RyaWJ1dGVkIHVuZGVyIHRoZSAzLWNsYXVzZSBCU0QgTGljZW5zZSwgc2VlIExJQ0VOU0UudHh0XG4gICAqL1xuXG4gIC8qIGpzaGludCBtYXhjb21wbGV4aXR5OjYgKi9cblxuICBcInVzZSBzdHJpY3RcIjtcblxuXG4gIC8qXG4gICAqIE5vdGVcbiAgICogPT09PVxuICAgKiB0aGUgc3RydWN0dXJlIG9mIHRoaXMgSmF2YVNjcmlwdCB2ZXJzaW9uIG9mIHBvbHkydHJpIGludGVudGlvbmFsbHkgZm9sbG93c1xuICAgKiBhcyBjbG9zZWx5IGFzIHBvc3NpYmxlIHRoZSBzdHJ1Y3R1cmUgb2YgdGhlIHJlZmVyZW5jZSBDKysgdmVyc2lvbiwgdG8gbWFrZSBpdFxuICAgKiBlYXNpZXIgdG8ga2VlcCB0aGUgMiB2ZXJzaW9ucyBpbiBzeW5jLlxuICAgKi9cblxuICB2YXIgUG9pbnRFcnJvciA9IF9kZXJlcV8oJy4vcG9pbnRlcnJvcicpO1xuICB2YXIgUG9pbnQgPSBfZGVyZXFfKCcuL3BvaW50Jyk7XG4gIHZhciBUcmlhbmdsZSA9IF9kZXJlcV8oJy4vdHJpYW5nbGUnKTtcbiAgdmFyIHN3ZWVwID0gX2RlcmVxXygnLi9zd2VlcCcpO1xuICB2YXIgQWR2YW5jaW5nRnJvbnQgPSBfZGVyZXFfKCcuL2FkdmFuY2luZ2Zyb250Jyk7XG4gIHZhciBOb2RlID0gQWR2YW5jaW5nRnJvbnQuTm9kZTtcblxuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS11dGlsc1xuXG4gIC8qKlxuICAgKiBJbml0aWFsIHRyaWFuZ2xlIGZhY3Rvciwgc2VlZCB0cmlhbmdsZSB3aWxsIGV4dGVuZCAzMCUgb2ZcbiAgICogUG9pbnRTZXQgd2lkdGggdG8gYm90aCBsZWZ0IGFuZCByaWdodC5cbiAgICogQHByaXZhdGVcbiAgICogQGNvbnN0XG4gICAqL1xuICB2YXIga0FscGhhID0gMC4zO1xuXG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1FZGdlXG4gIC8qKlxuICAgKiBSZXByZXNlbnRzIGEgc2ltcGxlIHBvbHlnb24ncyBlZGdlXG4gICAqIEBjb25zdHJ1Y3RvclxuICAgKiBAc3RydWN0XG4gICAqIEBwcml2YXRlXG4gICAqIEBwYXJhbSB7UG9pbnR9IHAxXG4gICAqIEBwYXJhbSB7UG9pbnR9IHAyXG4gICAqIEB0aHJvdyB7UG9pbnRFcnJvcn0gaWYgcDEgaXMgc2FtZSBhcyBwMlxuICAgKi9cbiAgdmFyIEVkZ2UgPSBmdW5jdGlvbihwMSwgcDIpIHtcbiAgICB0aGlzLnAgPSBwMTtcbiAgICB0aGlzLnEgPSBwMjtcblxuICAgIGlmIChwMS55ID4gcDIueSkge1xuICAgICAgdGhpcy5xID0gcDE7XG4gICAgICB0aGlzLnAgPSBwMjtcbiAgICB9IGVsc2UgaWYgKHAxLnkgPT09IHAyLnkpIHtcbiAgICAgIGlmIChwMS54ID4gcDIueCkge1xuICAgICAgICB0aGlzLnEgPSBwMTtcbiAgICAgICAgdGhpcy5wID0gcDI7XG4gICAgICB9IGVsc2UgaWYgKHAxLnggPT09IHAyLngpIHtcbiAgICAgICAgdGhyb3cgbmV3IFBvaW50RXJyb3IoJ3BvbHkydHJpIEludmFsaWQgRWRnZSBjb25zdHJ1Y3RvcjogcmVwZWF0ZWQgcG9pbnRzIScsIFtwMV0pO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmICghdGhpcy5xLl9wMnRfZWRnZV9saXN0KSB7XG4gICAgICB0aGlzLnEuX3AydF9lZGdlX2xpc3QgPSBbXTtcbiAgICB9XG4gICAgdGhpcy5xLl9wMnRfZWRnZV9saXN0LnB1c2godGhpcyk7XG4gIH07XG5cblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tQmFzaW5cbiAgLyoqXG4gICAqIEBjb25zdHJ1Y3RvclxuICAgKiBAc3RydWN0XG4gICAqIEBwcml2YXRlXG4gICAqL1xuICB2YXIgQmFzaW4gPSBmdW5jdGlvbigpIHtcbiAgICAvKiogQHR5cGUge05vZGV9ICovXG4gICAgdGhpcy5sZWZ0X25vZGUgPSBudWxsO1xuICAgIC8qKiBAdHlwZSB7Tm9kZX0gKi9cbiAgICB0aGlzLmJvdHRvbV9ub2RlID0gbnVsbDtcbiAgICAvKiogQHR5cGUge05vZGV9ICovXG4gICAgdGhpcy5yaWdodF9ub2RlID0gbnVsbDtcbiAgICAvKiogQHR5cGUge251bWJlcn0gKi9cbiAgICB0aGlzLndpZHRoID0gMC4wO1xuICAgIC8qKiBAdHlwZSB7Ym9vbGVhbn0gKi9cbiAgICB0aGlzLmxlZnRfaGlnaGVzdCA9IGZhbHNlO1xuICB9O1xuXG4gIEJhc2luLnByb3RvdHlwZS5jbGVhciA9IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMubGVmdF9ub2RlID0gbnVsbDtcbiAgICB0aGlzLmJvdHRvbV9ub2RlID0gbnVsbDtcbiAgICB0aGlzLnJpZ2h0X25vZGUgPSBudWxsO1xuICAgIHRoaXMud2lkdGggPSAwLjA7XG4gICAgdGhpcy5sZWZ0X2hpZ2hlc3QgPSBmYWxzZTtcbiAgfTtcblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1FZGdlRXZlbnRcbiAgLyoqXG4gICAqIEBjb25zdHJ1Y3RvclxuICAgKiBAc3RydWN0XG4gICAqIEBwcml2YXRlXG4gICAqL1xuICB2YXIgRWRnZUV2ZW50ID0gZnVuY3Rpb24oKSB7XG4gICAgLyoqIEB0eXBlIHtFZGdlfSAqL1xuICAgIHRoaXMuY29uc3RyYWluZWRfZWRnZSA9IG51bGw7XG4gICAgLyoqIEB0eXBlIHtib29sZWFufSAqL1xuICAgIHRoaXMucmlnaHQgPSBmYWxzZTtcbiAgfTtcblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVN3ZWVwQ29udGV4dCAocHVibGljIEFQSSlcbiAgLyoqXG4gICAqIFN3ZWVwQ29udGV4dCBjb25zdHJ1Y3RvciBvcHRpb25cbiAgICogQHR5cGVkZWYge09iamVjdH0gU3dlZXBDb250ZXh0T3B0aW9uc1xuICAgKiBAcHJvcGVydHkge2Jvb2xlYW49fSBjbG9uZUFycmF5cyAtIGlmIDxjb2RlPnRydWU8L2NvZGU+LCBkbyBhIHNoYWxsb3cgY29weSBvZiB0aGUgQXJyYXkgcGFyYW1ldGVyc1xuICAgKiAgICAgICAgICAgICAgICAgIChjb250b3VyLCBob2xlcykuIFBvaW50cyBpbnNpZGUgYXJyYXlzIGFyZSBuZXZlciBjb3BpZWQuXG4gICAqICAgICAgICAgICAgICAgICAgRGVmYXVsdCBpcyA8Y29kZT5mYWxzZTwvY29kZT4gOiBrZWVwIGEgcmVmZXJlbmNlIHRvIHRoZSBhcnJheSBhcmd1bWVudHMsXG4gICAqICAgICAgICAgICAgICAgICAgd2hvIHdpbGwgYmUgbW9kaWZpZWQgaW4gcGxhY2UuXG4gICAqL1xuICAvKipcbiAgICogQ29uc3RydWN0b3IgZm9yIHRoZSB0cmlhbmd1bGF0aW9uIGNvbnRleHQuXG4gICAqIEl0IGFjY2VwdHMgYSBzaW1wbGUgcG9seWxpbmUgKHdpdGggbm9uIHJlcGVhdGluZyBwb2ludHMpLFxuICAgKiB3aGljaCBkZWZpbmVzIHRoZSBjb25zdHJhaW5lZCBlZGdlcy5cbiAgICpcbiAgICogQGV4YW1wbGVcbiAgICogICAgICAgICAgdmFyIGNvbnRvdXIgPSBbXG4gICAqICAgICAgICAgICAgICBuZXcgcG9seTJ0cmkuUG9pbnQoMTAwLCAxMDApLFxuICAgKiAgICAgICAgICAgICAgbmV3IHBvbHkydHJpLlBvaW50KDEwMCwgMzAwKSxcbiAgICogICAgICAgICAgICAgIG5ldyBwb2x5MnRyaS5Qb2ludCgzMDAsIDMwMCksXG4gICAqICAgICAgICAgICAgICBuZXcgcG9seTJ0cmkuUG9pbnQoMzAwLCAxMDApXG4gICAqICAgICAgICAgIF07XG4gICAqICAgICAgICAgIHZhciBzd2N0eCA9IG5ldyBwb2x5MnRyaS5Td2VlcENvbnRleHQoY29udG91ciwge2Nsb25lQXJyYXlzOiB0cnVlfSk7XG4gICAqIEBleGFtcGxlXG4gICAqICAgICAgICAgIHZhciBjb250b3VyID0gW3t4OjEwMCwgeToxMDB9LCB7eDoxMDAsIHk6MzAwfSwge3g6MzAwLCB5OjMwMH0sIHt4OjMwMCwgeToxMDB9XTtcbiAgICogICAgICAgICAgdmFyIHN3Y3R4ID0gbmV3IHBvbHkydHJpLlN3ZWVwQ29udGV4dChjb250b3VyLCB7Y2xvbmVBcnJheXM6IHRydWV9KTtcbiAgICogQGNvbnN0cnVjdG9yXG4gICAqIEBwdWJsaWNcbiAgICogQHN0cnVjdFxuICAgKiBAcGFyYW0ge0FycmF5LjxYWT59IGNvbnRvdXIgLSBhcnJheSBvZiBwb2ludCBvYmplY3RzLiBUaGUgcG9pbnRzIGNhbiBiZSBlaXRoZXIge0BsaW5rY29kZSBQb2ludH0gaW5zdGFuY2VzLFxuICAgKiAgICAgICAgICBvciBhbnkgXCJQb2ludCBsaWtlXCIgY3VzdG9tIGNsYXNzIHdpdGggPGNvZGU+e3gsIHl9PC9jb2RlPiBhdHRyaWJ1dGVzLlxuICAgKiBAcGFyYW0ge1N3ZWVwQ29udGV4dE9wdGlvbnM9fSBvcHRpb25zIC0gY29uc3RydWN0b3Igb3B0aW9uc1xuICAgKi9cbiAgdmFyIFN3ZWVwQ29udGV4dCA9IGZ1bmN0aW9uKGNvbnRvdXIsIG9wdGlvbnMpIHtcbiAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcbiAgICB0aGlzLnRyaWFuZ2xlc18gPSBbXTtcbiAgICB0aGlzLm1hcF8gPSBbXTtcbiAgICB0aGlzLnBvaW50c18gPSAob3B0aW9ucy5jbG9uZUFycmF5cyA/IGNvbnRvdXIuc2xpY2UoMCkgOiBjb250b3VyKTtcbiAgICB0aGlzLmVkZ2VfbGlzdCA9IFtdO1xuXG4gICAgLy8gQm91bmRpbmcgYm94IG9mIGFsbCBwb2ludHMuIENvbXB1dGVkIGF0IHRoZSBzdGFydCBvZiB0aGUgdHJpYW5ndWxhdGlvbixcbiAgICAvLyBpdCBpcyBzdG9yZWQgaW4gY2FzZSBpdCBpcyBuZWVkZWQgYnkgdGhlIGNhbGxlci5cbiAgICB0aGlzLnBtaW5fID0gdGhpcy5wbWF4XyA9IG51bGw7XG5cbiAgICAvKipcbiAgICAgKiBBZHZhbmNpbmcgZnJvbnRcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqIEB0eXBlIHtBZHZhbmNpbmdGcm9udH1cbiAgICAgKi9cbiAgICB0aGlzLmZyb250XyA9IG51bGw7XG5cbiAgICAvKipcbiAgICAgKiBoZWFkIHBvaW50IHVzZWQgd2l0aCBhZHZhbmNpbmcgZnJvbnRcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqIEB0eXBlIHtQb2ludH1cbiAgICAgKi9cbiAgICB0aGlzLmhlYWRfID0gbnVsbDtcblxuICAgIC8qKlxuICAgICAqIHRhaWwgcG9pbnQgdXNlZCB3aXRoIGFkdmFuY2luZyBmcm9udFxuICAgICAqIEBwcml2YXRlXG4gICAgICogQHR5cGUge1BvaW50fVxuICAgICAqL1xuICAgIHRoaXMudGFpbF8gPSBudWxsO1xuXG4gICAgLyoqXG4gICAgICogQHByaXZhdGVcbiAgICAgKiBAdHlwZSB7Tm9kZX1cbiAgICAgKi9cbiAgICB0aGlzLmFmX2hlYWRfID0gbnVsbDtcbiAgICAvKipcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqIEB0eXBlIHtOb2RlfVxuICAgICAqL1xuICAgIHRoaXMuYWZfbWlkZGxlXyA9IG51bGw7XG4gICAgLyoqXG4gICAgICogQHByaXZhdGVcbiAgICAgKiBAdHlwZSB7Tm9kZX1cbiAgICAgKi9cbiAgICB0aGlzLmFmX3RhaWxfID0gbnVsbDtcblxuICAgIHRoaXMuYmFzaW4gPSBuZXcgQmFzaW4oKTtcbiAgICB0aGlzLmVkZ2VfZXZlbnQgPSBuZXcgRWRnZUV2ZW50KCk7XG5cbiAgICB0aGlzLmluaXRFZGdlcyh0aGlzLnBvaW50c18pO1xuICB9O1xuXG5cbiAgLyoqXG4gICAqIEFkZCBhIGhvbGUgdG8gdGhlIGNvbnN0cmFpbnRzXG4gICAqIEBleGFtcGxlXG4gICAqICAgICAgdmFyIHN3Y3R4ID0gbmV3IHBvbHkydHJpLlN3ZWVwQ29udGV4dChjb250b3VyKTtcbiAgICogICAgICB2YXIgaG9sZSA9IFtcbiAgICogICAgICAgICAgbmV3IHBvbHkydHJpLlBvaW50KDIwMCwgMjAwKSxcbiAgICogICAgICAgICAgbmV3IHBvbHkydHJpLlBvaW50KDIwMCwgMjUwKSxcbiAgICogICAgICAgICAgbmV3IHBvbHkydHJpLlBvaW50KDI1MCwgMjUwKVxuICAgKiAgICAgIF07XG4gICAqICAgICAgc3djdHguYWRkSG9sZShob2xlKTtcbiAgICogQGV4YW1wbGVcbiAgICogICAgICB2YXIgc3djdHggPSBuZXcgcG9seTJ0cmkuU3dlZXBDb250ZXh0KGNvbnRvdXIpO1xuICAgKiAgICAgIHN3Y3R4LmFkZEhvbGUoW3t4OjIwMCwgeToyMDB9LCB7eDoyMDAsIHk6MjUwfSwge3g6MjUwLCB5OjI1MH1dKTtcbiAgICogQHB1YmxpY1xuICAgKiBAcGFyYW0ge0FycmF5LjxYWT59IHBvbHlsaW5lIC0gYXJyYXkgb2YgXCJQb2ludCBsaWtlXCIgb2JqZWN0cyB3aXRoIHt4LHl9XG4gICAqL1xuICBTd2VlcENvbnRleHQucHJvdG90eXBlLmFkZEhvbGUgPSBmdW5jdGlvbihwb2x5bGluZSkge1xuICAgIHRoaXMuaW5pdEVkZ2VzKHBvbHlsaW5lKTtcbiAgICB2YXIgaSwgbGVuID0gcG9seWxpbmUubGVuZ3RoO1xuICAgIGZvciAoaSA9IDA7IGkgPCBsZW47IGkrKykge1xuICAgICAgdGhpcy5wb2ludHNfLnB1c2gocG9seWxpbmVbaV0pO1xuICAgIH1cbiAgICByZXR1cm4gdGhpczsgLy8gZm9yIGNoYWluaW5nXG4gIH07XG5cbiAgLyoqXG4gICAqIEZvciBiYWNrd2FyZCBjb21wYXRpYmlsaXR5XG4gICAqIEBmdW5jdGlvblxuICAgKiBAZGVwcmVjYXRlZCB1c2Uge0BsaW5rY29kZSBTd2VlcENvbnRleHQjYWRkSG9sZX0gaW5zdGVhZFxuICAgKi9cbiAgU3dlZXBDb250ZXh0LnByb3RvdHlwZS5BZGRIb2xlID0gU3dlZXBDb250ZXh0LnByb3RvdHlwZS5hZGRIb2xlO1xuXG5cbiAgLyoqXG4gICAqIEFkZCBzZXZlcmFsIGhvbGVzIHRvIHRoZSBjb25zdHJhaW50c1xuICAgKiBAZXhhbXBsZVxuICAgKiAgICAgIHZhciBzd2N0eCA9IG5ldyBwb2x5MnRyaS5Td2VlcENvbnRleHQoY29udG91cik7XG4gICAqICAgICAgdmFyIGhvbGVzID0gW1xuICAgKiAgICAgICAgICBbIG5ldyBwb2x5MnRyaS5Qb2ludCgyMDAsIDIwMCksIG5ldyBwb2x5MnRyaS5Qb2ludCgyMDAsIDI1MCksIG5ldyBwb2x5MnRyaS5Qb2ludCgyNTAsIDI1MCkgXSxcbiAgICogICAgICAgICAgWyBuZXcgcG9seTJ0cmkuUG9pbnQoMzAwLCAzMDApLCBuZXcgcG9seTJ0cmkuUG9pbnQoMzAwLCAzNTApLCBuZXcgcG9seTJ0cmkuUG9pbnQoMzUwLCAzNTApIF1cbiAgICogICAgICBdO1xuICAgKiAgICAgIHN3Y3R4LmFkZEhvbGVzKGhvbGVzKTtcbiAgICogQGV4YW1wbGVcbiAgICogICAgICB2YXIgc3djdHggPSBuZXcgcG9seTJ0cmkuU3dlZXBDb250ZXh0KGNvbnRvdXIpO1xuICAgKiAgICAgIHZhciBob2xlcyA9IFtcbiAgICogICAgICAgICAgW3t4OjIwMCwgeToyMDB9LCB7eDoyMDAsIHk6MjUwfSwge3g6MjUwLCB5OjI1MH1dLFxuICAgKiAgICAgICAgICBbe3g6MzAwLCB5OjMwMH0sIHt4OjMwMCwgeTozNTB9LCB7eDozNTAsIHk6MzUwfV1cbiAgICogICAgICBdO1xuICAgKiAgICAgIHN3Y3R4LmFkZEhvbGVzKGhvbGVzKTtcbiAgICogQHB1YmxpY1xuICAgKiBAcGFyYW0ge0FycmF5LjxBcnJheS48WFk+Pn0gaG9sZXMgLSBhcnJheSBvZiBhcnJheSBvZiBcIlBvaW50IGxpa2VcIiBvYmplY3RzIHdpdGgge3gseX1cbiAgICovXG4vLyBNZXRob2QgYWRkZWQgaW4gdGhlIEphdmFTY3JpcHQgdmVyc2lvbiAod2FzIG5vdCBwcmVzZW50IGluIHRoZSBjKysgdmVyc2lvbilcbiAgU3dlZXBDb250ZXh0LnByb3RvdHlwZS5hZGRIb2xlcyA9IGZ1bmN0aW9uKGhvbGVzKSB7XG4gICAgdmFyIGksIGxlbiA9IGhvbGVzLmxlbmd0aDtcbiAgICBmb3IgKGkgPSAwOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgIHRoaXMuaW5pdEVkZ2VzKGhvbGVzW2ldKTtcbiAgICB9XG4gICAgdGhpcy5wb2ludHNfID0gdGhpcy5wb2ludHNfLmNvbmNhdC5hcHBseSh0aGlzLnBvaW50c18sIGhvbGVzKTtcbiAgICByZXR1cm4gdGhpczsgLy8gZm9yIGNoYWluaW5nXG4gIH07XG5cblxuICAvKipcbiAgICogQWRkIGEgU3RlaW5lciBwb2ludCB0byB0aGUgY29uc3RyYWludHNcbiAgICogQGV4YW1wbGVcbiAgICogICAgICB2YXIgc3djdHggPSBuZXcgcG9seTJ0cmkuU3dlZXBDb250ZXh0KGNvbnRvdXIpO1xuICAgKiAgICAgIHZhciBwb2ludCA9IG5ldyBwb2x5MnRyaS5Qb2ludCgxNTAsIDE1MCk7XG4gICAqICAgICAgc3djdHguYWRkUG9pbnQocG9pbnQpO1xuICAgKiBAZXhhbXBsZVxuICAgKiAgICAgIHZhciBzd2N0eCA9IG5ldyBwb2x5MnRyaS5Td2VlcENvbnRleHQoY29udG91cik7XG4gICAqICAgICAgc3djdHguYWRkUG9pbnQoe3g6MTUwLCB5OjE1MH0pO1xuICAgKiBAcHVibGljXG4gICAqIEBwYXJhbSB7WFl9IHBvaW50IC0gYW55IFwiUG9pbnQgbGlrZVwiIG9iamVjdCB3aXRoIHt4LHl9XG4gICAqL1xuICBTd2VlcENvbnRleHQucHJvdG90eXBlLmFkZFBvaW50ID0gZnVuY3Rpb24ocG9pbnQpIHtcbiAgICB0aGlzLnBvaW50c18ucHVzaChwb2ludCk7XG4gICAgcmV0dXJuIHRoaXM7IC8vIGZvciBjaGFpbmluZ1xuICB9O1xuXG4gIC8qKlxuICAgKiBGb3IgYmFja3dhcmQgY29tcGF0aWJpbGl0eVxuICAgKiBAZnVuY3Rpb25cbiAgICogQGRlcHJlY2F0ZWQgdXNlIHtAbGlua2NvZGUgU3dlZXBDb250ZXh0I2FkZFBvaW50fSBpbnN0ZWFkXG4gICAqL1xuICBTd2VlcENvbnRleHQucHJvdG90eXBlLkFkZFBvaW50ID0gU3dlZXBDb250ZXh0LnByb3RvdHlwZS5hZGRQb2ludDtcblxuXG4gIC8qKlxuICAgKiBBZGQgc2V2ZXJhbCBTdGVpbmVyIHBvaW50cyB0byB0aGUgY29uc3RyYWludHNcbiAgICogQGV4YW1wbGVcbiAgICogICAgICB2YXIgc3djdHggPSBuZXcgcG9seTJ0cmkuU3dlZXBDb250ZXh0KGNvbnRvdXIpO1xuICAgKiAgICAgIHZhciBwb2ludHMgPSBbXG4gICAqICAgICAgICAgIG5ldyBwb2x5MnRyaS5Qb2ludCgxNTAsIDE1MCksXG4gICAqICAgICAgICAgIG5ldyBwb2x5MnRyaS5Qb2ludCgyMDAsIDI1MCksXG4gICAqICAgICAgICAgIG5ldyBwb2x5MnRyaS5Qb2ludCgyNTAsIDI1MClcbiAgICogICAgICBdO1xuICAgKiAgICAgIHN3Y3R4LmFkZFBvaW50cyhwb2ludHMpO1xuICAgKiBAZXhhbXBsZVxuICAgKiAgICAgIHZhciBzd2N0eCA9IG5ldyBwb2x5MnRyaS5Td2VlcENvbnRleHQoY29udG91cik7XG4gICAqICAgICAgc3djdHguYWRkUG9pbnRzKFt7eDoxNTAsIHk6MTUwfSwge3g6MjAwLCB5OjI1MH0sIHt4OjI1MCwgeToyNTB9XSk7XG4gICAqIEBwdWJsaWNcbiAgICogQHBhcmFtIHtBcnJheS48WFk+fSBwb2ludHMgLSBhcnJheSBvZiBcIlBvaW50IGxpa2VcIiBvYmplY3Qgd2l0aCB7eCx5fVxuICAgKi9cbi8vIE1ldGhvZCBhZGRlZCBpbiB0aGUgSmF2YVNjcmlwdCB2ZXJzaW9uICh3YXMgbm90IHByZXNlbnQgaW4gdGhlIGMrKyB2ZXJzaW9uKVxuICBTd2VlcENvbnRleHQucHJvdG90eXBlLmFkZFBvaW50cyA9IGZ1bmN0aW9uKHBvaW50cykge1xuICAgIHRoaXMucG9pbnRzXyA9IHRoaXMucG9pbnRzXy5jb25jYXQocG9pbnRzKTtcbiAgICByZXR1cm4gdGhpczsgLy8gZm9yIGNoYWluaW5nXG4gIH07XG5cblxuICAvKipcbiAgICogVHJpYW5ndWxhdGUgdGhlIHBvbHlnb24gd2l0aCBob2xlcyBhbmQgU3RlaW5lciBwb2ludHMuXG4gICAqIERvIHRoaXMgQUZURVIgeW91J3ZlIGFkZGVkIHRoZSBwb2x5bGluZSwgaG9sZXMsIGFuZCBTdGVpbmVyIHBvaW50c1xuICAgKiBAZXhhbXBsZVxuICAgKiAgICAgIHZhciBzd2N0eCA9IG5ldyBwb2x5MnRyaS5Td2VlcENvbnRleHQoY29udG91cik7XG4gICAqICAgICAgc3djdHgudHJpYW5ndWxhdGUoKTtcbiAgICogICAgICB2YXIgdHJpYW5nbGVzID0gc3djdHguZ2V0VHJpYW5nbGVzKCk7XG4gICAqIEBwdWJsaWNcbiAgICovXG4vLyBTaG9ydGN1dCBtZXRob2QgZm9yIHN3ZWVwLnRyaWFuZ3VsYXRlKFN3ZWVwQ29udGV4dCkuXG4vLyBNZXRob2QgYWRkZWQgaW4gdGhlIEphdmFTY3JpcHQgdmVyc2lvbiAod2FzIG5vdCBwcmVzZW50IGluIHRoZSBjKysgdmVyc2lvbilcbiAgU3dlZXBDb250ZXh0LnByb3RvdHlwZS50cmlhbmd1bGF0ZSA9IGZ1bmN0aW9uKCkge1xuICAgIHN3ZWVwLnRyaWFuZ3VsYXRlKHRoaXMpO1xuICAgIHJldHVybiB0aGlzOyAvLyBmb3IgY2hhaW5pbmdcbiAgfTtcblxuXG4gIC8qKlxuICAgKiBHZXQgdGhlIGJvdW5kaW5nIGJveCBvZiB0aGUgcHJvdmlkZWQgY29uc3RyYWludHMgKGNvbnRvdXIsIGhvbGVzIGFuZFxuICAgKiBTdGVpbnRlciBwb2ludHMpLiBXYXJuaW5nIDogdGhlc2UgdmFsdWVzIGFyZSBub3QgYXZhaWxhYmxlIGlmIHRoZSB0cmlhbmd1bGF0aW9uXG4gICAqIGhhcyBub3QgYmVlbiBkb25lIHlldC5cbiAgICogQHB1YmxpY1xuICAgKiBAcmV0dXJucyB7e21pbjpQb2ludCxtYXg6UG9pbnR9fSBvYmplY3Qgd2l0aCAnbWluJyBhbmQgJ21heCcgUG9pbnRcbiAgICovXG4vLyBNZXRob2QgYWRkZWQgaW4gdGhlIEphdmFTY3JpcHQgdmVyc2lvbiAod2FzIG5vdCBwcmVzZW50IGluIHRoZSBjKysgdmVyc2lvbilcbiAgU3dlZXBDb250ZXh0LnByb3RvdHlwZS5nZXRCb3VuZGluZ0JveCA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB7bWluOiB0aGlzLnBtaW5fLCBtYXg6IHRoaXMucG1heF99O1xuICB9O1xuXG4gIC8qKlxuICAgKiBHZXQgcmVzdWx0IG9mIHRyaWFuZ3VsYXRpb24uXG4gICAqIFRoZSBvdXRwdXQgdHJpYW5nbGVzIGhhdmUgdmVydGljZXMgd2hpY2ggYXJlIHJlZmVyZW5jZXNcbiAgICogdG8gdGhlIGluaXRpYWwgaW5wdXQgcG9pbnRzIChub3QgY29waWVzKTogYW55IGN1c3RvbSBmaWVsZHMgaW4gdGhlXG4gICAqIGluaXRpYWwgcG9pbnRzIGNhbiBiZSByZXRyaWV2ZWQgaW4gdGhlIG91dHB1dCB0cmlhbmdsZXMuXG4gICAqIEBleGFtcGxlXG4gICAqICAgICAgdmFyIHN3Y3R4ID0gbmV3IHBvbHkydHJpLlN3ZWVwQ29udGV4dChjb250b3VyKTtcbiAgICogICAgICBzd2N0eC50cmlhbmd1bGF0ZSgpO1xuICAgKiAgICAgIHZhciB0cmlhbmdsZXMgPSBzd2N0eC5nZXRUcmlhbmdsZXMoKTtcbiAgICogQGV4YW1wbGVcbiAgICogICAgICB2YXIgY29udG91ciA9IFt7eDoxMDAsIHk6MTAwLCBpZDoxfSwge3g6MTAwLCB5OjMwMCwgaWQ6Mn0sIHt4OjMwMCwgeTozMDAsIGlkOjN9XTtcbiAgICogICAgICB2YXIgc3djdHggPSBuZXcgcG9seTJ0cmkuU3dlZXBDb250ZXh0KGNvbnRvdXIpO1xuICAgKiAgICAgIHN3Y3R4LnRyaWFuZ3VsYXRlKCk7XG4gICAqICAgICAgdmFyIHRyaWFuZ2xlcyA9IHN3Y3R4LmdldFRyaWFuZ2xlcygpO1xuICAgKiAgICAgIHR5cGVvZiB0cmlhbmdsZXNbMF0uZ2V0UG9pbnQoMCkuaWRcbiAgICogICAgICAvLyDihpIgXCJudW1iZXJcIlxuICAgKiBAcHVibGljXG4gICAqIEByZXR1cm5zIHthcnJheTxUcmlhbmdsZT59ICAgYXJyYXkgb2YgdHJpYW5nbGVzXG4gICAqL1xuICBTd2VlcENvbnRleHQucHJvdG90eXBlLmdldFRyaWFuZ2xlcyA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLnRyaWFuZ2xlc187XG4gIH07XG5cbiAgLyoqXG4gICAqIEZvciBiYWNrd2FyZCBjb21wYXRpYmlsaXR5XG4gICAqIEBmdW5jdGlvblxuICAgKiBAZGVwcmVjYXRlZCB1c2Uge0BsaW5rY29kZSBTd2VlcENvbnRleHQjZ2V0VHJpYW5nbGVzfSBpbnN0ZWFkXG4gICAqL1xuICBTd2VlcENvbnRleHQucHJvdG90eXBlLkdldFRyaWFuZ2xlcyA9IFN3ZWVwQ29udGV4dC5wcm90b3R5cGUuZ2V0VHJpYW5nbGVzO1xuXG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVN3ZWVwQ29udGV4dCAocHJpdmF0ZSBBUEkpXG5cbiAgLyoqIEBwcml2YXRlICovXG4gIFN3ZWVwQ29udGV4dC5wcm90b3R5cGUuZnJvbnQgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy5mcm9udF87XG4gIH07XG5cbiAgLyoqIEBwcml2YXRlICovXG4gIFN3ZWVwQ29udGV4dC5wcm90b3R5cGUucG9pbnRDb3VudCA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLnBvaW50c18ubGVuZ3RoO1xuICB9O1xuXG4gIC8qKiBAcHJpdmF0ZSAqL1xuICBTd2VlcENvbnRleHQucHJvdG90eXBlLmhlYWQgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy5oZWFkXztcbiAgfTtcblxuICAvKiogQHByaXZhdGUgKi9cbiAgU3dlZXBDb250ZXh0LnByb3RvdHlwZS5zZXRIZWFkID0gZnVuY3Rpb24ocDEpIHtcbiAgICB0aGlzLmhlYWRfID0gcDE7XG4gIH07XG5cbiAgLyoqIEBwcml2YXRlICovXG4gIFN3ZWVwQ29udGV4dC5wcm90b3R5cGUudGFpbCA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLnRhaWxfO1xuICB9O1xuXG4gIC8qKiBAcHJpdmF0ZSAqL1xuICBTd2VlcENvbnRleHQucHJvdG90eXBlLnNldFRhaWwgPSBmdW5jdGlvbihwMSkge1xuICAgIHRoaXMudGFpbF8gPSBwMTtcbiAgfTtcblxuICAvKiogQHByaXZhdGUgKi9cbiAgU3dlZXBDb250ZXh0LnByb3RvdHlwZS5nZXRNYXAgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy5tYXBfO1xuICB9O1xuXG4gIC8qKiBAcHJpdmF0ZSAqL1xuICBTd2VlcENvbnRleHQucHJvdG90eXBlLmluaXRUcmlhbmd1bGF0aW9uID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIHhtYXggPSB0aGlzLnBvaW50c19bMF0ueDtcbiAgICB2YXIgeG1pbiA9IHRoaXMucG9pbnRzX1swXS54O1xuICAgIHZhciB5bWF4ID0gdGhpcy5wb2ludHNfWzBdLnk7XG4gICAgdmFyIHltaW4gPSB0aGlzLnBvaW50c19bMF0ueTtcblxuICAgIC8vIENhbGN1bGF0ZSBib3VuZHNcbiAgICB2YXIgaSwgbGVuID0gdGhpcy5wb2ludHNfLmxlbmd0aDtcbiAgICBmb3IgKGkgPSAxOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgIHZhciBwID0gdGhpcy5wb2ludHNfW2ldO1xuICAgICAgLyoganNoaW50IGV4cHI6dHJ1ZSAqL1xuICAgICAgKHAueCA+IHhtYXgpICYmICh4bWF4ID0gcC54KTtcbiAgICAgIChwLnggPCB4bWluKSAmJiAoeG1pbiA9IHAueCk7XG4gICAgICAocC55ID4geW1heCkgJiYgKHltYXggPSBwLnkpO1xuICAgICAgKHAueSA8IHltaW4pICYmICh5bWluID0gcC55KTtcbiAgICB9XG4gICAgdGhpcy5wbWluXyA9IG5ldyBQb2ludCh4bWluLCB5bWluKTtcbiAgICB0aGlzLnBtYXhfID0gbmV3IFBvaW50KHhtYXgsIHltYXgpO1xuXG4gICAgdmFyIGR4ID0ga0FscGhhICogKHhtYXggLSB4bWluKTtcbiAgICB2YXIgZHkgPSBrQWxwaGEgKiAoeW1heCAtIHltaW4pO1xuICAgIHRoaXMuaGVhZF8gPSBuZXcgUG9pbnQoeG1heCArIGR4LCB5bWluIC0gZHkpO1xuICAgIHRoaXMudGFpbF8gPSBuZXcgUG9pbnQoeG1pbiAtIGR4LCB5bWluIC0gZHkpO1xuXG4gICAgLy8gU29ydCBwb2ludHMgYWxvbmcgeS1heGlzXG4gICAgdGhpcy5wb2ludHNfLnNvcnQoUG9pbnQuY29tcGFyZSk7XG4gIH07XG5cbiAgLyoqIEBwcml2YXRlICovXG4gIFN3ZWVwQ29udGV4dC5wcm90b3R5cGUuaW5pdEVkZ2VzID0gZnVuY3Rpb24ocG9seWxpbmUpIHtcbiAgICB2YXIgaSwgbGVuID0gcG9seWxpbmUubGVuZ3RoO1xuICAgIGZvciAoaSA9IDA7IGkgPCBsZW47ICsraSkge1xuICAgICAgdGhpcy5lZGdlX2xpc3QucHVzaChuZXcgRWRnZShwb2x5bGluZVtpXSwgcG9seWxpbmVbKGkgKyAxKSAlIGxlbl0pKTtcbiAgICB9XG4gIH07XG5cbiAgLyoqIEBwcml2YXRlICovXG4gIFN3ZWVwQ29udGV4dC5wcm90b3R5cGUuZ2V0UG9pbnQgPSBmdW5jdGlvbihpbmRleCkge1xuICAgIHJldHVybiB0aGlzLnBvaW50c19baW5kZXhdO1xuICB9O1xuXG4gIC8qKiBAcHJpdmF0ZSAqL1xuICBTd2VlcENvbnRleHQucHJvdG90eXBlLmFkZFRvTWFwID0gZnVuY3Rpb24odHJpYW5nbGUpIHtcbiAgICB0aGlzLm1hcF8ucHVzaCh0cmlhbmdsZSk7XG4gIH07XG5cbiAgLyoqIEBwcml2YXRlICovXG4gIFN3ZWVwQ29udGV4dC5wcm90b3R5cGUubG9jYXRlTm9kZSA9IGZ1bmN0aW9uKHBvaW50KSB7XG4gICAgcmV0dXJuIHRoaXMuZnJvbnRfLmxvY2F0ZU5vZGUocG9pbnQueCk7XG4gIH07XG5cbiAgLyoqIEBwcml2YXRlICovXG4gIFN3ZWVwQ29udGV4dC5wcm90b3R5cGUuY3JlYXRlQWR2YW5jaW5nRnJvbnQgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgaGVhZDtcbiAgICB2YXIgbWlkZGxlO1xuICAgIHZhciB0YWlsO1xuICAgIC8vIEluaXRpYWwgdHJpYW5nbGVcbiAgICB2YXIgdHJpYW5nbGUgPSBuZXcgVHJpYW5nbGUodGhpcy5wb2ludHNfWzBdLCB0aGlzLnRhaWxfLCB0aGlzLmhlYWRfKTtcblxuICAgIHRoaXMubWFwXy5wdXNoKHRyaWFuZ2xlKTtcblxuICAgIGhlYWQgPSBuZXcgTm9kZSh0cmlhbmdsZS5nZXRQb2ludCgxKSwgdHJpYW5nbGUpO1xuICAgIG1pZGRsZSA9IG5ldyBOb2RlKHRyaWFuZ2xlLmdldFBvaW50KDApLCB0cmlhbmdsZSk7XG4gICAgdGFpbCA9IG5ldyBOb2RlKHRyaWFuZ2xlLmdldFBvaW50KDIpKTtcblxuICAgIHRoaXMuZnJvbnRfID0gbmV3IEFkdmFuY2luZ0Zyb250KGhlYWQsIHRhaWwpO1xuXG4gICAgaGVhZC5uZXh0ID0gbWlkZGxlO1xuICAgIG1pZGRsZS5uZXh0ID0gdGFpbDtcbiAgICBtaWRkbGUucHJldiA9IGhlYWQ7XG4gICAgdGFpbC5wcmV2ID0gbWlkZGxlO1xuICB9O1xuXG4gIC8qKiBAcHJpdmF0ZSAqL1xuICBTd2VlcENvbnRleHQucHJvdG90eXBlLnJlbW92ZU5vZGUgPSBmdW5jdGlvbihub2RlKSB7XG4gICAgLy8gZG8gbm90aGluZ1xuICAgIC8qIGpzaGludCB1bnVzZWQ6ZmFsc2UgKi9cbiAgfTtcblxuICAvKiogQHByaXZhdGUgKi9cbiAgU3dlZXBDb250ZXh0LnByb3RvdHlwZS5tYXBUcmlhbmdsZVRvTm9kZXMgPSBmdW5jdGlvbih0KSB7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCAzOyArK2kpIHtcbiAgICAgIGlmICghdC5nZXROZWlnaGJvcihpKSkge1xuICAgICAgICB2YXIgbiA9IHRoaXMuZnJvbnRfLmxvY2F0ZVBvaW50KHQucG9pbnRDVyh0LmdldFBvaW50KGkpKSk7XG4gICAgICAgIGlmIChuKSB7XG4gICAgICAgICAgbi50cmlhbmdsZSA9IHQ7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH07XG5cbiAgLyoqIEBwcml2YXRlICovXG4gIFN3ZWVwQ29udGV4dC5wcm90b3R5cGUucmVtb3ZlRnJvbU1hcCA9IGZ1bmN0aW9uKHRyaWFuZ2xlKSB7XG4gICAgdmFyIGksIG1hcCA9IHRoaXMubWFwXywgbGVuID0gbWFwLmxlbmd0aDtcbiAgICBmb3IgKGkgPSAwOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgIGlmIChtYXBbaV0gPT09IHRyaWFuZ2xlKSB7XG4gICAgICAgIG1hcC5zcGxpY2UoaSwgMSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cbiAgfTtcblxuICAvKipcbiAgICogRG8gYSBkZXB0aCBmaXJzdCB0cmF2ZXJzYWwgdG8gY29sbGVjdCB0cmlhbmdsZXNcbiAgICogQHByaXZhdGVcbiAgICogQHBhcmFtIHtUcmlhbmdsZX0gdHJpYW5nbGUgc3RhcnRcbiAgICovXG4gIFN3ZWVwQ29udGV4dC5wcm90b3R5cGUubWVzaENsZWFuID0gZnVuY3Rpb24odHJpYW5nbGUpIHtcbiAgICAvLyBOZXcgaW1wbGVtZW50YXRpb24gYXZvaWRzIHJlY3Vyc2l2ZSBjYWxscyBhbmQgdXNlIGEgbG9vcCBpbnN0ZWFkLlxuICAgIC8vIENmLiBpc3N1ZXMgIyA1NywgNjUgYW5kIDY5LlxuICAgIHZhciB0cmlhbmdsZXMgPSBbdHJpYW5nbGVdLCB0LCBpO1xuICAgIC8qIGpzaGludCBib3NzOnRydWUgKi9cbiAgICB3aGlsZSAodCA9IHRyaWFuZ2xlcy5wb3AoKSkge1xuICAgICAgaWYgKCF0LmlzSW50ZXJpb3IoKSkge1xuICAgICAgICB0LnNldEludGVyaW9yKHRydWUpO1xuICAgICAgICB0aGlzLnRyaWFuZ2xlc18ucHVzaCh0KTtcbiAgICAgICAgZm9yIChpID0gMDsgaSA8IDM7IGkrKykge1xuICAgICAgICAgIGlmICghdC5jb25zdHJhaW5lZF9lZGdlW2ldKSB7XG4gICAgICAgICAgICB0cmlhbmdsZXMucHVzaCh0LmdldE5laWdoYm9yKGkpKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH07XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1FeHBvcnRzXG5cbiAgbW9kdWxlLmV4cG9ydHMgPSBTd2VlcENvbnRleHQ7XG5cbn0se1wiLi9hZHZhbmNpbmdmcm9udFwiOjIsXCIuL3BvaW50XCI6NCxcIi4vcG9pbnRlcnJvclwiOjUsXCIuL3N3ZWVwXCI6NyxcIi4vdHJpYW5nbGVcIjo5fV0sOTpbZnVuY3Rpb24oX2RlcmVxXyxtb2R1bGUsZXhwb3J0cyl7XG4gIC8qXG4gICAqIFBvbHkyVHJpIENvcHlyaWdodCAoYykgMjAwOS0yMDE0LCBQb2x5MlRyaSBDb250cmlidXRvcnNcbiAgICogaHR0cDovL2NvZGUuZ29vZ2xlLmNvbS9wL3BvbHkydHJpL1xuICAgKlxuICAgKiBwb2x5MnRyaS5qcyAoSmF2YVNjcmlwdCBwb3J0KSAoYykgMjAwOS0yMDE0LCBQb2x5MlRyaSBDb250cmlidXRvcnNcbiAgICogaHR0cHM6Ly9naXRodWIuY29tL3IzbWkvcG9seTJ0cmkuanNcbiAgICpcbiAgICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAgICpcbiAgICogRGlzdHJpYnV0ZWQgdW5kZXIgdGhlIDMtY2xhdXNlIEJTRCBMaWNlbnNlLCBzZWUgTElDRU5TRS50eHRcbiAgICovXG5cbiAgLyoganNoaW50IG1heGNvbXBsZXhpdHk6MTAgKi9cblxuICBcInVzZSBzdHJpY3RcIjtcblxuXG4gIC8qXG4gICAqIE5vdGVcbiAgICogPT09PVxuICAgKiB0aGUgc3RydWN0dXJlIG9mIHRoaXMgSmF2YVNjcmlwdCB2ZXJzaW9uIG9mIHBvbHkydHJpIGludGVudGlvbmFsbHkgZm9sbG93c1xuICAgKiBhcyBjbG9zZWx5IGFzIHBvc3NpYmxlIHRoZSBzdHJ1Y3R1cmUgb2YgdGhlIHJlZmVyZW5jZSBDKysgdmVyc2lvbiwgdG8gbWFrZSBpdFxuICAgKiBlYXNpZXIgdG8ga2VlcCB0aGUgMiB2ZXJzaW9ucyBpbiBzeW5jLlxuICAgKi9cblxuICB2YXIgeHkgPSBfZGVyZXFfKFwiLi94eVwiKTtcblxuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1UcmlhbmdsZVxuICAvKipcbiAgICogVHJpYW5nbGUgY2xhc3MuPGJyPlxuICAgKiBUcmlhbmdsZS1iYXNlZCBkYXRhIHN0cnVjdHVyZXMgYXJlIGtub3duIHRvIGhhdmUgYmV0dGVyIHBlcmZvcm1hbmNlIHRoYW5cbiAgICogcXVhZC1lZGdlIHN0cnVjdHVyZXMuXG4gICAqIFNlZTogSi4gU2hld2NodWssIFwiVHJpYW5nbGU6IEVuZ2luZWVyaW5nIGEgMkQgUXVhbGl0eSBNZXNoIEdlbmVyYXRvciBhbmRcbiAgICogRGVsYXVuYXkgVHJpYW5ndWxhdG9yXCIsIFwiVHJpYW5ndWxhdGlvbnMgaW4gQ0dBTFwiXG4gICAqXG4gICAqIEBjb25zdHJ1Y3RvclxuICAgKiBAc3RydWN0XG4gICAqIEBwYXJhbSB7IVhZfSBwYSAgcG9pbnQgb2JqZWN0IHdpdGgge3gseX1cbiAgICogQHBhcmFtIHshWFl9IHBiICBwb2ludCBvYmplY3Qgd2l0aCB7eCx5fVxuICAgKiBAcGFyYW0geyFYWX0gcGMgIHBvaW50IG9iamVjdCB3aXRoIHt4LHl9XG4gICAqL1xuICB2YXIgVHJpYW5nbGUgPSBmdW5jdGlvbihhLCBiLCBjKSB7XG4gICAgLyoqXG4gICAgICogVHJpYW5nbGUgcG9pbnRzXG4gICAgICogQHByaXZhdGVcbiAgICAgKiBAdHlwZSB7QXJyYXkuPFhZPn1cbiAgICAgKi9cbiAgICB0aGlzLnBvaW50c18gPSBbYSwgYiwgY107XG5cbiAgICAvKipcbiAgICAgKiBOZWlnaGJvciBsaXN0XG4gICAgICogQHByaXZhdGVcbiAgICAgKiBAdHlwZSB7QXJyYXkuPFRyaWFuZ2xlPn1cbiAgICAgKi9cbiAgICB0aGlzLm5laWdoYm9yc18gPSBbbnVsbCwgbnVsbCwgbnVsbF07XG5cbiAgICAvKipcbiAgICAgKiBIYXMgdGhpcyB0cmlhbmdsZSBiZWVuIG1hcmtlZCBhcyBhbiBpbnRlcmlvciB0cmlhbmdsZT9cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqIEB0eXBlIHtib29sZWFufVxuICAgICAqL1xuICAgIHRoaXMuaW50ZXJpb3JfID0gZmFsc2U7XG5cbiAgICAvKipcbiAgICAgKiBGbGFncyB0byBkZXRlcm1pbmUgaWYgYW4gZWRnZSBpcyBhIENvbnN0cmFpbmVkIGVkZ2VcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqIEB0eXBlIHtBcnJheS48Ym9vbGVhbj59XG4gICAgICovXG4gICAgdGhpcy5jb25zdHJhaW5lZF9lZGdlID0gW2ZhbHNlLCBmYWxzZSwgZmFsc2VdO1xuXG4gICAgLyoqXG4gICAgICogRmxhZ3MgdG8gZGV0ZXJtaW5lIGlmIGFuIGVkZ2UgaXMgYSBEZWxhdW5leSBlZGdlXG4gICAgICogQHByaXZhdGVcbiAgICAgKiBAdHlwZSB7QXJyYXkuPGJvb2xlYW4+fVxuICAgICAqL1xuICAgIHRoaXMuZGVsYXVuYXlfZWRnZSA9IFtmYWxzZSwgZmFsc2UsIGZhbHNlXTtcbiAgfTtcblxuICB2YXIgcDJzID0geHkudG9TdHJpbmc7XG4gIC8qKlxuICAgKiBGb3IgcHJldHR5IHByaW50aW5nIGV4LiA8Y29kZT5cIlsoNTs0MikoMTA7MjApKDIxOzMwKV1cIjwvY29kZT4uXG4gICAqIEBwdWJsaWNcbiAgICogQHJldHVybiB7c3RyaW5nfVxuICAgKi9cbiAgVHJpYW5nbGUucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIChcIltcIiArIHAycyh0aGlzLnBvaW50c19bMF0pICsgcDJzKHRoaXMucG9pbnRzX1sxXSkgKyBwMnModGhpcy5wb2ludHNfWzJdKSArIFwiXVwiKTtcbiAgfTtcblxuICAvKipcbiAgICogR2V0IG9uZSB2ZXJ0aWNlIG9mIHRoZSB0cmlhbmdsZS5cbiAgICogVGhlIG91dHB1dCB0cmlhbmdsZXMgb2YgYSB0cmlhbmd1bGF0aW9uIGhhdmUgdmVydGljZXMgd2hpY2ggYXJlIHJlZmVyZW5jZXNcbiAgICogdG8gdGhlIGluaXRpYWwgaW5wdXQgcG9pbnRzIChub3QgY29waWVzKTogYW55IGN1c3RvbSBmaWVsZHMgaW4gdGhlXG4gICAqIGluaXRpYWwgcG9pbnRzIGNhbiBiZSByZXRyaWV2ZWQgaW4gdGhlIG91dHB1dCB0cmlhbmdsZXMuXG4gICAqIEBleGFtcGxlXG4gICAqICAgICAgdmFyIGNvbnRvdXIgPSBbe3g6MTAwLCB5OjEwMCwgaWQ6MX0sIHt4OjEwMCwgeTozMDAsIGlkOjJ9LCB7eDozMDAsIHk6MzAwLCBpZDozfV07XG4gICAqICAgICAgdmFyIHN3Y3R4ID0gbmV3IHBvbHkydHJpLlN3ZWVwQ29udGV4dChjb250b3VyKTtcbiAgICogICAgICBzd2N0eC50cmlhbmd1bGF0ZSgpO1xuICAgKiAgICAgIHZhciB0cmlhbmdsZXMgPSBzd2N0eC5nZXRUcmlhbmdsZXMoKTtcbiAgICogICAgICB0eXBlb2YgdHJpYW5nbGVzWzBdLmdldFBvaW50KDApLmlkXG4gICAqICAgICAgLy8g4oaSIFwibnVtYmVyXCJcbiAgICogQHBhcmFtIHtudW1iZXJ9IGluZGV4IC0gdmVydGljZSBpbmRleDogMCwgMSBvciAyXG4gICAqIEBwdWJsaWNcbiAgICogQHJldHVybnMge1hZfVxuICAgKi9cbiAgVHJpYW5nbGUucHJvdG90eXBlLmdldFBvaW50ID0gZnVuY3Rpb24oaW5kZXgpIHtcbiAgICByZXR1cm4gdGhpcy5wb2ludHNfW2luZGV4XTtcbiAgfTtcblxuICAvKipcbiAgICogRm9yIGJhY2t3YXJkIGNvbXBhdGliaWxpdHlcbiAgICogQGZ1bmN0aW9uXG4gICAqIEBkZXByZWNhdGVkIHVzZSB7QGxpbmtjb2RlIFRyaWFuZ2xlI2dldFBvaW50fSBpbnN0ZWFkXG4gICAqL1xuICBUcmlhbmdsZS5wcm90b3R5cGUuR2V0UG9pbnQgPSBUcmlhbmdsZS5wcm90b3R5cGUuZ2V0UG9pbnQ7XG5cbiAgLyoqXG4gICAqIEdldCBhbGwgMyB2ZXJ0aWNlcyBvZiB0aGUgdHJpYW5nbGUgYXMgYW4gYXJyYXlcbiAgICogQHB1YmxpY1xuICAgKiBAcmV0dXJuIHtBcnJheS48WFk+fVxuICAgKi9cbi8vIE1ldGhvZCBhZGRlZCBpbiB0aGUgSmF2YVNjcmlwdCB2ZXJzaW9uICh3YXMgbm90IHByZXNlbnQgaW4gdGhlIGMrKyB2ZXJzaW9uKVxuICBUcmlhbmdsZS5wcm90b3R5cGUuZ2V0UG9pbnRzID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMucG9pbnRzXztcbiAgfTtcblxuICAvKipcbiAgICogQHByaXZhdGVcbiAgICogQHBhcmFtIHtudW1iZXJ9IGluZGV4XG4gICAqIEByZXR1cm5zIHs/VHJpYW5nbGV9XG4gICAqL1xuICBUcmlhbmdsZS5wcm90b3R5cGUuZ2V0TmVpZ2hib3IgPSBmdW5jdGlvbihpbmRleCkge1xuICAgIHJldHVybiB0aGlzLm5laWdoYm9yc19baW5kZXhdO1xuICB9O1xuXG4gIC8qKlxuICAgKiBUZXN0IGlmIHRoaXMgVHJpYW5nbGUgY29udGFpbnMgdGhlIFBvaW50IG9iamVjdCBnaXZlbiBhcyBwYXJhbWV0ZXIgYXMgb25lIG9mIGl0cyB2ZXJ0aWNlcy5cbiAgICogT25seSBwb2ludCByZWZlcmVuY2VzIGFyZSBjb21wYXJlZCwgbm90IHZhbHVlcy5cbiAgICogQHB1YmxpY1xuICAgKiBAcGFyYW0ge1hZfSBwb2ludCAtIHBvaW50IG9iamVjdCB3aXRoIHt4LHl9XG4gICAqIEByZXR1cm4ge2Jvb2xlYW59IDxjb2RlPlRydWU8L2NvZGU+IGlmIHRoZSBQb2ludCBvYmplY3QgaXMgb2YgdGhlIFRyaWFuZ2xlJ3MgdmVydGljZXMsXG4gICAqICAgICAgICAgPGNvZGU+ZmFsc2U8L2NvZGU+IG90aGVyd2lzZS5cbiAgICovXG4gIFRyaWFuZ2xlLnByb3RvdHlwZS5jb250YWluc1BvaW50ID0gZnVuY3Rpb24ocG9pbnQpIHtcbiAgICB2YXIgcG9pbnRzID0gdGhpcy5wb2ludHNfO1xuICAgIC8vIEhlcmUgd2UgYXJlIGNvbXBhcmluZyBwb2ludCByZWZlcmVuY2VzLCBub3QgdmFsdWVzXG4gICAgcmV0dXJuIChwb2ludCA9PT0gcG9pbnRzWzBdIHx8IHBvaW50ID09PSBwb2ludHNbMV0gfHwgcG9pbnQgPT09IHBvaW50c1syXSk7XG4gIH07XG5cbiAgLyoqXG4gICAqIFRlc3QgaWYgdGhpcyBUcmlhbmdsZSBjb250YWlucyB0aGUgRWRnZSBvYmplY3QgZ2l2ZW4gYXMgcGFyYW1ldGVyIGFzIGl0c1xuICAgKiBib3VuZGluZyBlZGdlcy4gT25seSBwb2ludCByZWZlcmVuY2VzIGFyZSBjb21wYXJlZCwgbm90IHZhbHVlcy5cbiAgICogQHByaXZhdGVcbiAgICogQHBhcmFtIHtFZGdlfSBlZGdlXG4gICAqIEByZXR1cm4ge2Jvb2xlYW59IDxjb2RlPlRydWU8L2NvZGU+IGlmIHRoZSBFZGdlIG9iamVjdCBpcyBvZiB0aGUgVHJpYW5nbGUncyBib3VuZGluZ1xuICAgKiAgICAgICAgIGVkZ2VzLCA8Y29kZT5mYWxzZTwvY29kZT4gb3RoZXJ3aXNlLlxuICAgKi9cbiAgVHJpYW5nbGUucHJvdG90eXBlLmNvbnRhaW5zRWRnZSA9IGZ1bmN0aW9uKGVkZ2UpIHtcbiAgICByZXR1cm4gdGhpcy5jb250YWluc1BvaW50KGVkZ2UucCkgJiYgdGhpcy5jb250YWluc1BvaW50KGVkZ2UucSk7XG4gIH07XG5cbiAgLyoqXG4gICAqIFRlc3QgaWYgdGhpcyBUcmlhbmdsZSBjb250YWlucyB0aGUgdHdvIFBvaW50IG9iamVjdHMgZ2l2ZW4gYXMgcGFyYW1ldGVycyBhbW9uZyBpdHMgdmVydGljZXMuXG4gICAqIE9ubHkgcG9pbnQgcmVmZXJlbmNlcyBhcmUgY29tcGFyZWQsIG5vdCB2YWx1ZXMuXG4gICAqIEBwYXJhbSB7WFl9IHAxIC0gcG9pbnQgb2JqZWN0IHdpdGgge3gseX1cbiAgICogQHBhcmFtIHtYWX0gcDIgLSBwb2ludCBvYmplY3Qgd2l0aCB7eCx5fVxuICAgKiBAcmV0dXJuIHtib29sZWFufVxuICAgKi9cbiAgVHJpYW5nbGUucHJvdG90eXBlLmNvbnRhaW5zUG9pbnRzID0gZnVuY3Rpb24ocDEsIHAyKSB7XG4gICAgcmV0dXJuIHRoaXMuY29udGFpbnNQb2ludChwMSkgJiYgdGhpcy5jb250YWluc1BvaW50KHAyKTtcbiAgfTtcblxuICAvKipcbiAgICogSGFzIHRoaXMgdHJpYW5nbGUgYmVlbiBtYXJrZWQgYXMgYW4gaW50ZXJpb3IgdHJpYW5nbGU/XG4gICAqIEByZXR1cm5zIHtib29sZWFufVxuICAgKi9cbiAgVHJpYW5nbGUucHJvdG90eXBlLmlzSW50ZXJpb3IgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy5pbnRlcmlvcl87XG4gIH07XG5cbiAgLyoqXG4gICAqIE1hcmsgdGhpcyB0cmlhbmdsZSBhcyBhbiBpbnRlcmlvciB0cmlhbmdsZVxuICAgKiBAcHJpdmF0ZVxuICAgKiBAcGFyYW0ge2Jvb2xlYW59IGludGVyaW9yXG4gICAqIEByZXR1cm5zIHtUcmlhbmdsZX0gdGhpc1xuICAgKi9cbiAgVHJpYW5nbGUucHJvdG90eXBlLnNldEludGVyaW9yID0gZnVuY3Rpb24oaW50ZXJpb3IpIHtcbiAgICB0aGlzLmludGVyaW9yXyA9IGludGVyaW9yO1xuICAgIHJldHVybiB0aGlzO1xuICB9O1xuXG4gIC8qKlxuICAgKiBVcGRhdGUgbmVpZ2hib3IgcG9pbnRlcnMuXG4gICAqIEBwcml2YXRlXG4gICAqIEBwYXJhbSB7WFl9IHAxIC0gcG9pbnQgb2JqZWN0IHdpdGgge3gseX1cbiAgICogQHBhcmFtIHtYWX0gcDIgLSBwb2ludCBvYmplY3Qgd2l0aCB7eCx5fVxuICAgKiBAcGFyYW0ge1RyaWFuZ2xlfSB0IFRyaWFuZ2xlIG9iamVjdC5cbiAgICogQHRocm93cyB7RXJyb3J9IGlmIGNhbid0IGZpbmQgb2JqZWN0c1xuICAgKi9cbiAgVHJpYW5nbGUucHJvdG90eXBlLm1hcmtOZWlnaGJvclBvaW50ZXJzID0gZnVuY3Rpb24ocDEsIHAyLCB0KSB7XG4gICAgdmFyIHBvaW50cyA9IHRoaXMucG9pbnRzXztcbiAgICAvLyBIZXJlIHdlIGFyZSBjb21wYXJpbmcgcG9pbnQgcmVmZXJlbmNlcywgbm90IHZhbHVlc1xuICAgIGlmICgocDEgPT09IHBvaW50c1syXSAmJiBwMiA9PT0gcG9pbnRzWzFdKSB8fCAocDEgPT09IHBvaW50c1sxXSAmJiBwMiA9PT0gcG9pbnRzWzJdKSkge1xuICAgICAgdGhpcy5uZWlnaGJvcnNfWzBdID0gdDtcbiAgICB9IGVsc2UgaWYgKChwMSA9PT0gcG9pbnRzWzBdICYmIHAyID09PSBwb2ludHNbMl0pIHx8IChwMSA9PT0gcG9pbnRzWzJdICYmIHAyID09PSBwb2ludHNbMF0pKSB7XG4gICAgICB0aGlzLm5laWdoYm9yc19bMV0gPSB0O1xuICAgIH0gZWxzZSBpZiAoKHAxID09PSBwb2ludHNbMF0gJiYgcDIgPT09IHBvaW50c1sxXSkgfHwgKHAxID09PSBwb2ludHNbMV0gJiYgcDIgPT09IHBvaW50c1swXSkpIHtcbiAgICAgIHRoaXMubmVpZ2hib3JzX1syXSA9IHQ7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcigncG9seTJ0cmkgSW52YWxpZCBUcmlhbmdsZS5tYXJrTmVpZ2hib3JQb2ludGVycygpIGNhbGwnKTtcbiAgICB9XG4gIH07XG5cbiAgLyoqXG4gICAqIEV4aGF1c3RpdmUgc2VhcmNoIHRvIHVwZGF0ZSBuZWlnaGJvciBwb2ludGVyc1xuICAgKiBAcHJpdmF0ZVxuICAgKiBAcGFyYW0geyFUcmlhbmdsZX0gdFxuICAgKi9cbiAgVHJpYW5nbGUucHJvdG90eXBlLm1hcmtOZWlnaGJvciA9IGZ1bmN0aW9uKHQpIHtcbiAgICB2YXIgcG9pbnRzID0gdGhpcy5wb2ludHNfO1xuICAgIGlmICh0LmNvbnRhaW5zUG9pbnRzKHBvaW50c1sxXSwgcG9pbnRzWzJdKSkge1xuICAgICAgdGhpcy5uZWlnaGJvcnNfWzBdID0gdDtcbiAgICAgIHQubWFya05laWdoYm9yUG9pbnRlcnMocG9pbnRzWzFdLCBwb2ludHNbMl0sIHRoaXMpO1xuICAgIH0gZWxzZSBpZiAodC5jb250YWluc1BvaW50cyhwb2ludHNbMF0sIHBvaW50c1syXSkpIHtcbiAgICAgIHRoaXMubmVpZ2hib3JzX1sxXSA9IHQ7XG4gICAgICB0Lm1hcmtOZWlnaGJvclBvaW50ZXJzKHBvaW50c1swXSwgcG9pbnRzWzJdLCB0aGlzKTtcbiAgICB9IGVsc2UgaWYgKHQuY29udGFpbnNQb2ludHMocG9pbnRzWzBdLCBwb2ludHNbMV0pKSB7XG4gICAgICB0aGlzLm5laWdoYm9yc19bMl0gPSB0O1xuICAgICAgdC5tYXJrTmVpZ2hib3JQb2ludGVycyhwb2ludHNbMF0sIHBvaW50c1sxXSwgdGhpcyk7XG4gICAgfVxuICB9O1xuXG5cbiAgVHJpYW5nbGUucHJvdG90eXBlLmNsZWFyTmVpZ2hib3JzID0gZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5uZWlnaGJvcnNfWzBdID0gbnVsbDtcbiAgICB0aGlzLm5laWdoYm9yc19bMV0gPSBudWxsO1xuICAgIHRoaXMubmVpZ2hib3JzX1syXSA9IG51bGw7XG4gIH07XG5cbiAgVHJpYW5nbGUucHJvdG90eXBlLmNsZWFyRGVsYXVuYXlFZGdlcyA9IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuZGVsYXVuYXlfZWRnZVswXSA9IGZhbHNlO1xuICAgIHRoaXMuZGVsYXVuYXlfZWRnZVsxXSA9IGZhbHNlO1xuICAgIHRoaXMuZGVsYXVuYXlfZWRnZVsyXSA9IGZhbHNlO1xuICB9O1xuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBwb2ludCBjbG9ja3dpc2UgdG8gdGhlIGdpdmVuIHBvaW50LlxuICAgKiBAcHJpdmF0ZVxuICAgKiBAcGFyYW0ge1hZfSBwIC0gcG9pbnQgb2JqZWN0IHdpdGgge3gseX1cbiAgICovXG4gIFRyaWFuZ2xlLnByb3RvdHlwZS5wb2ludENXID0gZnVuY3Rpb24ocCkge1xuICAgIHZhciBwb2ludHMgPSB0aGlzLnBvaW50c187XG4gICAgLy8gSGVyZSB3ZSBhcmUgY29tcGFyaW5nIHBvaW50IHJlZmVyZW5jZXMsIG5vdCB2YWx1ZXNcbiAgICBpZiAocCA9PT0gcG9pbnRzWzBdKSB7XG4gICAgICByZXR1cm4gcG9pbnRzWzJdO1xuICAgIH0gZWxzZSBpZiAocCA9PT0gcG9pbnRzWzFdKSB7XG4gICAgICByZXR1cm4gcG9pbnRzWzBdO1xuICAgIH0gZWxzZSBpZiAocCA9PT0gcG9pbnRzWzJdKSB7XG4gICAgICByZXR1cm4gcG9pbnRzWzFdO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gIH07XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIHBvaW50IGNvdW50ZXItY2xvY2t3aXNlIHRvIHRoZSBnaXZlbiBwb2ludC5cbiAgICogQHByaXZhdGVcbiAgICogQHBhcmFtIHtYWX0gcCAtIHBvaW50IG9iamVjdCB3aXRoIHt4LHl9XG4gICAqL1xuICBUcmlhbmdsZS5wcm90b3R5cGUucG9pbnRDQ1cgPSBmdW5jdGlvbihwKSB7XG4gICAgdmFyIHBvaW50cyA9IHRoaXMucG9pbnRzXztcbiAgICAvLyBIZXJlIHdlIGFyZSBjb21wYXJpbmcgcG9pbnQgcmVmZXJlbmNlcywgbm90IHZhbHVlc1xuICAgIGlmIChwID09PSBwb2ludHNbMF0pIHtcbiAgICAgIHJldHVybiBwb2ludHNbMV07XG4gICAgfSBlbHNlIGlmIChwID09PSBwb2ludHNbMV0pIHtcbiAgICAgIHJldHVybiBwb2ludHNbMl07XG4gICAgfSBlbHNlIGlmIChwID09PSBwb2ludHNbMl0pIHtcbiAgICAgIHJldHVybiBwb2ludHNbMF07XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgfTtcblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgbmVpZ2hib3IgY2xvY2t3aXNlIHRvIGdpdmVuIHBvaW50LlxuICAgKiBAcHJpdmF0ZVxuICAgKiBAcGFyYW0ge1hZfSBwIC0gcG9pbnQgb2JqZWN0IHdpdGgge3gseX1cbiAgICovXG4gIFRyaWFuZ2xlLnByb3RvdHlwZS5uZWlnaGJvckNXID0gZnVuY3Rpb24ocCkge1xuICAgIC8vIEhlcmUgd2UgYXJlIGNvbXBhcmluZyBwb2ludCByZWZlcmVuY2VzLCBub3QgdmFsdWVzXG4gICAgaWYgKHAgPT09IHRoaXMucG9pbnRzX1swXSkge1xuICAgICAgcmV0dXJuIHRoaXMubmVpZ2hib3JzX1sxXTtcbiAgICB9IGVsc2UgaWYgKHAgPT09IHRoaXMucG9pbnRzX1sxXSkge1xuICAgICAgcmV0dXJuIHRoaXMubmVpZ2hib3JzX1syXTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHRoaXMubmVpZ2hib3JzX1swXTtcbiAgICB9XG4gIH07XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIG5laWdoYm9yIGNvdW50ZXItY2xvY2t3aXNlIHRvIGdpdmVuIHBvaW50LlxuICAgKiBAcHJpdmF0ZVxuICAgKiBAcGFyYW0ge1hZfSBwIC0gcG9pbnQgb2JqZWN0IHdpdGgge3gseX1cbiAgICovXG4gIFRyaWFuZ2xlLnByb3RvdHlwZS5uZWlnaGJvckNDVyA9IGZ1bmN0aW9uKHApIHtcbiAgICAvLyBIZXJlIHdlIGFyZSBjb21wYXJpbmcgcG9pbnQgcmVmZXJlbmNlcywgbm90IHZhbHVlc1xuICAgIGlmIChwID09PSB0aGlzLnBvaW50c19bMF0pIHtcbiAgICAgIHJldHVybiB0aGlzLm5laWdoYm9yc19bMl07XG4gICAgfSBlbHNlIGlmIChwID09PSB0aGlzLnBvaW50c19bMV0pIHtcbiAgICAgIHJldHVybiB0aGlzLm5laWdoYm9yc19bMF07XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB0aGlzLm5laWdoYm9yc19bMV07XG4gICAgfVxuICB9O1xuXG4gIFRyaWFuZ2xlLnByb3RvdHlwZS5nZXRDb25zdHJhaW5lZEVkZ2VDVyA9IGZ1bmN0aW9uKHApIHtcbiAgICAvLyBIZXJlIHdlIGFyZSBjb21wYXJpbmcgcG9pbnQgcmVmZXJlbmNlcywgbm90IHZhbHVlc1xuICAgIGlmIChwID09PSB0aGlzLnBvaW50c19bMF0pIHtcbiAgICAgIHJldHVybiB0aGlzLmNvbnN0cmFpbmVkX2VkZ2VbMV07XG4gICAgfSBlbHNlIGlmIChwID09PSB0aGlzLnBvaW50c19bMV0pIHtcbiAgICAgIHJldHVybiB0aGlzLmNvbnN0cmFpbmVkX2VkZ2VbMl07XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB0aGlzLmNvbnN0cmFpbmVkX2VkZ2VbMF07XG4gICAgfVxuICB9O1xuXG4gIFRyaWFuZ2xlLnByb3RvdHlwZS5nZXRDb25zdHJhaW5lZEVkZ2VDQ1cgPSBmdW5jdGlvbihwKSB7XG4gICAgLy8gSGVyZSB3ZSBhcmUgY29tcGFyaW5nIHBvaW50IHJlZmVyZW5jZXMsIG5vdCB2YWx1ZXNcbiAgICBpZiAocCA9PT0gdGhpcy5wb2ludHNfWzBdKSB7XG4gICAgICByZXR1cm4gdGhpcy5jb25zdHJhaW5lZF9lZGdlWzJdO1xuICAgIH0gZWxzZSBpZiAocCA9PT0gdGhpcy5wb2ludHNfWzFdKSB7XG4gICAgICByZXR1cm4gdGhpcy5jb25zdHJhaW5lZF9lZGdlWzBdO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gdGhpcy5jb25zdHJhaW5lZF9lZGdlWzFdO1xuICAgIH1cbiAgfTtcblxuLy8gQWRkaXRpb25hbCBjaGVjayBmcm9tIEphdmEgdmVyc2lvbiAoc2VlIGlzc3VlICM4OClcbiAgVHJpYW5nbGUucHJvdG90eXBlLmdldENvbnN0cmFpbmVkRWRnZUFjcm9zcyA9IGZ1bmN0aW9uKHApIHtcbiAgICAvLyBIZXJlIHdlIGFyZSBjb21wYXJpbmcgcG9pbnQgcmVmZXJlbmNlcywgbm90IHZhbHVlc1xuICAgIGlmIChwID09PSB0aGlzLnBvaW50c19bMF0pIHtcbiAgICAgIHJldHVybiB0aGlzLmNvbnN0cmFpbmVkX2VkZ2VbMF07XG4gICAgfSBlbHNlIGlmIChwID09PSB0aGlzLnBvaW50c19bMV0pIHtcbiAgICAgIHJldHVybiB0aGlzLmNvbnN0cmFpbmVkX2VkZ2VbMV07XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB0aGlzLmNvbnN0cmFpbmVkX2VkZ2VbMl07XG4gICAgfVxuICB9O1xuXG4gIFRyaWFuZ2xlLnByb3RvdHlwZS5zZXRDb25zdHJhaW5lZEVkZ2VDVyA9IGZ1bmN0aW9uKHAsIGNlKSB7XG4gICAgLy8gSGVyZSB3ZSBhcmUgY29tcGFyaW5nIHBvaW50IHJlZmVyZW5jZXMsIG5vdCB2YWx1ZXNcbiAgICBpZiAocCA9PT0gdGhpcy5wb2ludHNfWzBdKSB7XG4gICAgICB0aGlzLmNvbnN0cmFpbmVkX2VkZ2VbMV0gPSBjZTtcbiAgICB9IGVsc2UgaWYgKHAgPT09IHRoaXMucG9pbnRzX1sxXSkge1xuICAgICAgdGhpcy5jb25zdHJhaW5lZF9lZGdlWzJdID0gY2U7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuY29uc3RyYWluZWRfZWRnZVswXSA9IGNlO1xuICAgIH1cbiAgfTtcblxuICBUcmlhbmdsZS5wcm90b3R5cGUuc2V0Q29uc3RyYWluZWRFZGdlQ0NXID0gZnVuY3Rpb24ocCwgY2UpIHtcbiAgICAvLyBIZXJlIHdlIGFyZSBjb21wYXJpbmcgcG9pbnQgcmVmZXJlbmNlcywgbm90IHZhbHVlc1xuICAgIGlmIChwID09PSB0aGlzLnBvaW50c19bMF0pIHtcbiAgICAgIHRoaXMuY29uc3RyYWluZWRfZWRnZVsyXSA9IGNlO1xuICAgIH0gZWxzZSBpZiAocCA9PT0gdGhpcy5wb2ludHNfWzFdKSB7XG4gICAgICB0aGlzLmNvbnN0cmFpbmVkX2VkZ2VbMF0gPSBjZTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5jb25zdHJhaW5lZF9lZGdlWzFdID0gY2U7XG4gICAgfVxuICB9O1xuXG4gIFRyaWFuZ2xlLnByb3RvdHlwZS5nZXREZWxhdW5heUVkZ2VDVyA9IGZ1bmN0aW9uKHApIHtcbiAgICAvLyBIZXJlIHdlIGFyZSBjb21wYXJpbmcgcG9pbnQgcmVmZXJlbmNlcywgbm90IHZhbHVlc1xuICAgIGlmIChwID09PSB0aGlzLnBvaW50c19bMF0pIHtcbiAgICAgIHJldHVybiB0aGlzLmRlbGF1bmF5X2VkZ2VbMV07XG4gICAgfSBlbHNlIGlmIChwID09PSB0aGlzLnBvaW50c19bMV0pIHtcbiAgICAgIHJldHVybiB0aGlzLmRlbGF1bmF5X2VkZ2VbMl07XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB0aGlzLmRlbGF1bmF5X2VkZ2VbMF07XG4gICAgfVxuICB9O1xuXG4gIFRyaWFuZ2xlLnByb3RvdHlwZS5nZXREZWxhdW5heUVkZ2VDQ1cgPSBmdW5jdGlvbihwKSB7XG4gICAgLy8gSGVyZSB3ZSBhcmUgY29tcGFyaW5nIHBvaW50IHJlZmVyZW5jZXMsIG5vdCB2YWx1ZXNcbiAgICBpZiAocCA9PT0gdGhpcy5wb2ludHNfWzBdKSB7XG4gICAgICByZXR1cm4gdGhpcy5kZWxhdW5heV9lZGdlWzJdO1xuICAgIH0gZWxzZSBpZiAocCA9PT0gdGhpcy5wb2ludHNfWzFdKSB7XG4gICAgICByZXR1cm4gdGhpcy5kZWxhdW5heV9lZGdlWzBdO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gdGhpcy5kZWxhdW5heV9lZGdlWzFdO1xuICAgIH1cbiAgfTtcblxuICBUcmlhbmdsZS5wcm90b3R5cGUuc2V0RGVsYXVuYXlFZGdlQ1cgPSBmdW5jdGlvbihwLCBlKSB7XG4gICAgLy8gSGVyZSB3ZSBhcmUgY29tcGFyaW5nIHBvaW50IHJlZmVyZW5jZXMsIG5vdCB2YWx1ZXNcbiAgICBpZiAocCA9PT0gdGhpcy5wb2ludHNfWzBdKSB7XG4gICAgICB0aGlzLmRlbGF1bmF5X2VkZ2VbMV0gPSBlO1xuICAgIH0gZWxzZSBpZiAocCA9PT0gdGhpcy5wb2ludHNfWzFdKSB7XG4gICAgICB0aGlzLmRlbGF1bmF5X2VkZ2VbMl0gPSBlO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmRlbGF1bmF5X2VkZ2VbMF0gPSBlO1xuICAgIH1cbiAgfTtcblxuICBUcmlhbmdsZS5wcm90b3R5cGUuc2V0RGVsYXVuYXlFZGdlQ0NXID0gZnVuY3Rpb24ocCwgZSkge1xuICAgIC8vIEhlcmUgd2UgYXJlIGNvbXBhcmluZyBwb2ludCByZWZlcmVuY2VzLCBub3QgdmFsdWVzXG4gICAgaWYgKHAgPT09IHRoaXMucG9pbnRzX1swXSkge1xuICAgICAgdGhpcy5kZWxhdW5heV9lZGdlWzJdID0gZTtcbiAgICB9IGVsc2UgaWYgKHAgPT09IHRoaXMucG9pbnRzX1sxXSkge1xuICAgICAgdGhpcy5kZWxhdW5heV9lZGdlWzBdID0gZTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5kZWxhdW5heV9lZGdlWzFdID0gZTtcbiAgICB9XG4gIH07XG5cbiAgLyoqXG4gICAqIFRoZSBuZWlnaGJvciBhY3Jvc3MgdG8gZ2l2ZW4gcG9pbnQuXG4gICAqIEBwcml2YXRlXG4gICAqIEBwYXJhbSB7WFl9IHAgLSBwb2ludCBvYmplY3Qgd2l0aCB7eCx5fVxuICAgKiBAcmV0dXJucyB7VHJpYW5nbGV9XG4gICAqL1xuICBUcmlhbmdsZS5wcm90b3R5cGUubmVpZ2hib3JBY3Jvc3MgPSBmdW5jdGlvbihwKSB7XG4gICAgLy8gSGVyZSB3ZSBhcmUgY29tcGFyaW5nIHBvaW50IHJlZmVyZW5jZXMsIG5vdCB2YWx1ZXNcbiAgICBpZiAocCA9PT0gdGhpcy5wb2ludHNfWzBdKSB7XG4gICAgICByZXR1cm4gdGhpcy5uZWlnaGJvcnNfWzBdO1xuICAgIH0gZWxzZSBpZiAocCA9PT0gdGhpcy5wb2ludHNfWzFdKSB7XG4gICAgICByZXR1cm4gdGhpcy5uZWlnaGJvcnNfWzFdO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gdGhpcy5uZWlnaGJvcnNfWzJdO1xuICAgIH1cbiAgfTtcblxuICAvKipcbiAgICogQHByaXZhdGVcbiAgICogQHBhcmFtIHshVHJpYW5nbGV9IHQgVHJpYW5nbGUgb2JqZWN0LlxuICAgKiBAcGFyYW0ge1hZfSBwIC0gcG9pbnQgb2JqZWN0IHdpdGgge3gseX1cbiAgICovXG4gIFRyaWFuZ2xlLnByb3RvdHlwZS5vcHBvc2l0ZVBvaW50ID0gZnVuY3Rpb24odCwgcCkge1xuICAgIHZhciBjdyA9IHQucG9pbnRDVyhwKTtcbiAgICByZXR1cm4gdGhpcy5wb2ludENXKGN3KTtcbiAgfTtcblxuICAvKipcbiAgICogTGVnYWxpemUgdHJpYW5nbGUgYnkgcm90YXRpbmcgY2xvY2t3aXNlIGFyb3VuZCBvUG9pbnRcbiAgICogQHByaXZhdGVcbiAgICogQHBhcmFtIHtYWX0gb3BvaW50IC0gcG9pbnQgb2JqZWN0IHdpdGgge3gseX1cbiAgICogQHBhcmFtIHtYWX0gbnBvaW50IC0gcG9pbnQgb2JqZWN0IHdpdGgge3gseX1cbiAgICogQHRocm93cyB7RXJyb3J9IGlmIG9Qb2ludCBjYW4gbm90IGJlIGZvdW5kXG4gICAqL1xuICBUcmlhbmdsZS5wcm90b3R5cGUubGVnYWxpemUgPSBmdW5jdGlvbihvcG9pbnQsIG5wb2ludCkge1xuICAgIHZhciBwb2ludHMgPSB0aGlzLnBvaW50c187XG4gICAgLy8gSGVyZSB3ZSBhcmUgY29tcGFyaW5nIHBvaW50IHJlZmVyZW5jZXMsIG5vdCB2YWx1ZXNcbiAgICBpZiAob3BvaW50ID09PSBwb2ludHNbMF0pIHtcbiAgICAgIHBvaW50c1sxXSA9IHBvaW50c1swXTtcbiAgICAgIHBvaW50c1swXSA9IHBvaW50c1syXTtcbiAgICAgIHBvaW50c1syXSA9IG5wb2ludDtcbiAgICB9IGVsc2UgaWYgKG9wb2ludCA9PT0gcG9pbnRzWzFdKSB7XG4gICAgICBwb2ludHNbMl0gPSBwb2ludHNbMV07XG4gICAgICBwb2ludHNbMV0gPSBwb2ludHNbMF07XG4gICAgICBwb2ludHNbMF0gPSBucG9pbnQ7XG4gICAgfSBlbHNlIGlmIChvcG9pbnQgPT09IHBvaW50c1syXSkge1xuICAgICAgcG9pbnRzWzBdID0gcG9pbnRzWzJdO1xuICAgICAgcG9pbnRzWzJdID0gcG9pbnRzWzFdO1xuICAgICAgcG9pbnRzWzFdID0gbnBvaW50O1xuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ3BvbHkydHJpIEludmFsaWQgVHJpYW5nbGUubGVnYWxpemUoKSBjYWxsJyk7XG4gICAgfVxuICB9O1xuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBpbmRleCBvZiBhIHBvaW50IGluIHRoZSB0cmlhbmdsZS5cbiAgICogVGhlIHBvaW50ICptdXN0KiBiZSBhIHJlZmVyZW5jZSB0byBvbmUgb2YgdGhlIHRyaWFuZ2xlJ3MgdmVydGljZXMuXG4gICAqIEBwcml2YXRlXG4gICAqIEBwYXJhbSB7WFl9IHAgLSBwb2ludCBvYmplY3Qgd2l0aCB7eCx5fVxuICAgKiBAcmV0dXJucyB7bnVtYmVyfSBpbmRleCAwLCAxIG9yIDJcbiAgICogQHRocm93cyB7RXJyb3J9IGlmIHAgY2FuIG5vdCBiZSBmb3VuZFxuICAgKi9cbiAgVHJpYW5nbGUucHJvdG90eXBlLmluZGV4ID0gZnVuY3Rpb24ocCkge1xuICAgIHZhciBwb2ludHMgPSB0aGlzLnBvaW50c187XG4gICAgLy8gSGVyZSB3ZSBhcmUgY29tcGFyaW5nIHBvaW50IHJlZmVyZW5jZXMsIG5vdCB2YWx1ZXNcbiAgICBpZiAocCA9PT0gcG9pbnRzWzBdKSB7XG4gICAgICByZXR1cm4gMDtcbiAgICB9IGVsc2UgaWYgKHAgPT09IHBvaW50c1sxXSkge1xuICAgICAgcmV0dXJuIDE7XG4gICAgfSBlbHNlIGlmIChwID09PSBwb2ludHNbMl0pIHtcbiAgICAgIHJldHVybiAyO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ3BvbHkydHJpIEludmFsaWQgVHJpYW5nbGUuaW5kZXgoKSBjYWxsJyk7XG4gICAgfVxuICB9O1xuXG4gIC8qKlxuICAgKiBAcHJpdmF0ZVxuICAgKiBAcGFyYW0ge1hZfSBwMSAtIHBvaW50IG9iamVjdCB3aXRoIHt4LHl9XG4gICAqIEBwYXJhbSB7WFl9IHAyIC0gcG9pbnQgb2JqZWN0IHdpdGgge3gseX1cbiAgICogQHJldHVybiB7bnVtYmVyfSBpbmRleCAwLCAxIG9yIDIsIG9yIC0xIGlmIGVycnJvclxuICAgKi9cbiAgVHJpYW5nbGUucHJvdG90eXBlLmVkZ2VJbmRleCA9IGZ1bmN0aW9uKHAxLCBwMikge1xuICAgIHZhciBwb2ludHMgPSB0aGlzLnBvaW50c187XG4gICAgLy8gSGVyZSB3ZSBhcmUgY29tcGFyaW5nIHBvaW50IHJlZmVyZW5jZXMsIG5vdCB2YWx1ZXNcbiAgICBpZiAocDEgPT09IHBvaW50c1swXSkge1xuICAgICAgaWYgKHAyID09PSBwb2ludHNbMV0pIHtcbiAgICAgICAgcmV0dXJuIDI7XG4gICAgICB9IGVsc2UgaWYgKHAyID09PSBwb2ludHNbMl0pIHtcbiAgICAgICAgcmV0dXJuIDE7XG4gICAgICB9XG4gICAgfSBlbHNlIGlmIChwMSA9PT0gcG9pbnRzWzFdKSB7XG4gICAgICBpZiAocDIgPT09IHBvaW50c1syXSkge1xuICAgICAgICByZXR1cm4gMDtcbiAgICAgIH0gZWxzZSBpZiAocDIgPT09IHBvaW50c1swXSkge1xuICAgICAgICByZXR1cm4gMjtcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKHAxID09PSBwb2ludHNbMl0pIHtcbiAgICAgIGlmIChwMiA9PT0gcG9pbnRzWzBdKSB7XG4gICAgICAgIHJldHVybiAxO1xuICAgICAgfSBlbHNlIGlmIChwMiA9PT0gcG9pbnRzWzFdKSB7XG4gICAgICAgIHJldHVybiAwO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gLTE7XG4gIH07XG5cbiAgLyoqXG4gICAqIE1hcmsgYW4gZWRnZSBvZiB0aGlzIHRyaWFuZ2xlIGFzIGNvbnN0cmFpbmVkLlxuICAgKiBAcHJpdmF0ZVxuICAgKiBAcGFyYW0ge251bWJlcn0gaW5kZXggLSBlZGdlIGluZGV4XG4gICAqL1xuICBUcmlhbmdsZS5wcm90b3R5cGUubWFya0NvbnN0cmFpbmVkRWRnZUJ5SW5kZXggPSBmdW5jdGlvbihpbmRleCkge1xuICAgIHRoaXMuY29uc3RyYWluZWRfZWRnZVtpbmRleF0gPSB0cnVlO1xuICB9O1xuICAvKipcbiAgICogTWFyayBhbiBlZGdlIG9mIHRoaXMgdHJpYW5nbGUgYXMgY29uc3RyYWluZWQuXG4gICAqIEBwcml2YXRlXG4gICAqIEBwYXJhbSB7RWRnZX0gZWRnZSBpbnN0YW5jZVxuICAgKi9cbiAgVHJpYW5nbGUucHJvdG90eXBlLm1hcmtDb25zdHJhaW5lZEVkZ2VCeUVkZ2UgPSBmdW5jdGlvbihlZGdlKSB7XG4gICAgdGhpcy5tYXJrQ29uc3RyYWluZWRFZGdlQnlQb2ludHMoZWRnZS5wLCBlZGdlLnEpO1xuICB9O1xuICAvKipcbiAgICogTWFyayBhbiBlZGdlIG9mIHRoaXMgdHJpYW5nbGUgYXMgY29uc3RyYWluZWQuXG4gICAqIFRoaXMgbWV0aG9kIHRha2VzIHR3byBQb2ludCBpbnN0YW5jZXMgZGVmaW5pbmcgdGhlIGVkZ2Ugb2YgdGhlIHRyaWFuZ2xlLlxuICAgKiBAcHJpdmF0ZVxuICAgKiBAcGFyYW0ge1hZfSBwIC0gcG9pbnQgb2JqZWN0IHdpdGgge3gseX1cbiAgICogQHBhcmFtIHtYWX0gcSAtIHBvaW50IG9iamVjdCB3aXRoIHt4LHl9XG4gICAqL1xuICBUcmlhbmdsZS5wcm90b3R5cGUubWFya0NvbnN0cmFpbmVkRWRnZUJ5UG9pbnRzID0gZnVuY3Rpb24ocCwgcSkge1xuICAgIHZhciBwb2ludHMgPSB0aGlzLnBvaW50c187XG4gICAgLy8gSGVyZSB3ZSBhcmUgY29tcGFyaW5nIHBvaW50IHJlZmVyZW5jZXMsIG5vdCB2YWx1ZXNcbiAgICBpZiAoKHEgPT09IHBvaW50c1swXSAmJiBwID09PSBwb2ludHNbMV0pIHx8IChxID09PSBwb2ludHNbMV0gJiYgcCA9PT0gcG9pbnRzWzBdKSkge1xuICAgICAgdGhpcy5jb25zdHJhaW5lZF9lZGdlWzJdID0gdHJ1ZTtcbiAgICB9IGVsc2UgaWYgKChxID09PSBwb2ludHNbMF0gJiYgcCA9PT0gcG9pbnRzWzJdKSB8fCAocSA9PT0gcG9pbnRzWzJdICYmIHAgPT09IHBvaW50c1swXSkpIHtcbiAgICAgIHRoaXMuY29uc3RyYWluZWRfZWRnZVsxXSA9IHRydWU7XG4gICAgfSBlbHNlIGlmICgocSA9PT0gcG9pbnRzWzFdICYmIHAgPT09IHBvaW50c1syXSkgfHwgKHEgPT09IHBvaW50c1syXSAmJiBwID09PSBwb2ludHNbMV0pKSB7XG4gICAgICB0aGlzLmNvbnN0cmFpbmVkX2VkZ2VbMF0gPSB0cnVlO1xuICAgIH1cbiAgfTtcblxuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1FeHBvcnRzIChwdWJsaWMgQVBJKVxuXG4gIG1vZHVsZS5leHBvcnRzID0gVHJpYW5nbGU7XG5cbn0se1wiLi94eVwiOjExfV0sMTA6W2Z1bmN0aW9uKF9kZXJlcV8sbW9kdWxlLGV4cG9ydHMpe1xuICAvKlxuICAgKiBQb2x5MlRyaSBDb3B5cmlnaHQgKGMpIDIwMDktMjAxNCwgUG9seTJUcmkgQ29udHJpYnV0b3JzXG4gICAqIGh0dHA6Ly9jb2RlLmdvb2dsZS5jb20vcC9wb2x5MnRyaS9cbiAgICpcbiAgICogcG9seTJ0cmkuanMgKEphdmFTY3JpcHQgcG9ydCkgKGMpIDIwMDktMjAxNCwgUG9seTJUcmkgQ29udHJpYnV0b3JzXG4gICAqIGh0dHBzOi8vZ2l0aHViLmNvbS9yM21pL3BvbHkydHJpLmpzXG4gICAqXG4gICAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gICAqXG4gICAqIERpc3RyaWJ1dGVkIHVuZGVyIHRoZSAzLWNsYXVzZSBCU0QgTGljZW5zZSwgc2VlIExJQ0VOU0UudHh0XG4gICAqL1xuXG4gIFwidXNlIHN0cmljdFwiO1xuXG4gIC8qKlxuICAgKiBQcmVjaXNpb24gdG8gZGV0ZWN0IHJlcGVhdGVkIG9yIGNvbGxpbmVhciBwb2ludHNcbiAgICogQHByaXZhdGVcbiAgICogQGNvbnN0IHtudW1iZXJ9XG4gICAqIEBkZWZhdWx0XG4gICAqL1xuICB2YXIgRVBTSUxPTiA9IDFlLTEyO1xuICBleHBvcnRzLkVQU0lMT04gPSBFUFNJTE9OO1xuXG4gIC8qKlxuICAgKiBAcHJpdmF0ZVxuICAgKiBAZW51bSB7bnVtYmVyfVxuICAgKiBAcmVhZG9ubHlcbiAgICovXG4gIHZhciBPcmllbnRhdGlvbiA9IHtcbiAgICBcIkNXXCI6IDEsXG4gICAgXCJDQ1dcIjogLTEsXG4gICAgXCJDT0xMSU5FQVJcIjogMFxuICB9O1xuICBleHBvcnRzLk9yaWVudGF0aW9uID0gT3JpZW50YXRpb247XG5cblxuICAvKipcbiAgICogRm9ybXVsYSB0byBjYWxjdWxhdGUgc2lnbmVkIGFyZWE8YnI+XG4gICAqIFBvc2l0aXZlIGlmIENDVzxicj5cbiAgICogTmVnYXRpdmUgaWYgQ1c8YnI+XG4gICAqIDAgaWYgY29sbGluZWFyPGJyPlxuICAgKiA8cHJlPlxuICAgKiBBW1AxLFAyLFAzXSAgPSAgKHgxKnkyIC0geTEqeDIpICsgKHgyKnkzIC0geTIqeDMpICsgKHgzKnkxIC0geTMqeDEpXG4gICAqICAgICAgICAgICAgICA9ICAoeDEteDMpKih5Mi15MykgLSAoeTEteTMpKih4Mi14MylcbiAgICogPC9wcmU+XG4gICAqXG4gICAqIEBwcml2YXRlXG4gICAqIEBwYXJhbSB7IVhZfSBwYSAgcG9pbnQgb2JqZWN0IHdpdGgge3gseX1cbiAgICogQHBhcmFtIHshWFl9IHBiICBwb2ludCBvYmplY3Qgd2l0aCB7eCx5fVxuICAgKiBAcGFyYW0geyFYWX0gcGMgIHBvaW50IG9iamVjdCB3aXRoIHt4LHl9XG4gICAqIEByZXR1cm4ge09yaWVudGF0aW9ufVxuICAgKi9cbiAgZnVuY3Rpb24gb3JpZW50MmQocGEsIHBiLCBwYykge1xuICAgIHZhciBkZXRsZWZ0ID0gKHBhLnggLSBwYy54KSAqIChwYi55IC0gcGMueSk7XG4gICAgdmFyIGRldHJpZ2h0ID0gKHBhLnkgLSBwYy55KSAqIChwYi54IC0gcGMueCk7XG4gICAgdmFyIHZhbCA9IGRldGxlZnQgLSBkZXRyaWdodDtcbiAgICBpZiAodmFsID4gLShFUFNJTE9OKSAmJiB2YWwgPCAoRVBTSUxPTikpIHtcbiAgICAgIHJldHVybiBPcmllbnRhdGlvbi5DT0xMSU5FQVI7XG4gICAgfSBlbHNlIGlmICh2YWwgPiAwKSB7XG4gICAgICByZXR1cm4gT3JpZW50YXRpb24uQ0NXO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gT3JpZW50YXRpb24uQ1c7XG4gICAgfVxuICB9XG4gIGV4cG9ydHMub3JpZW50MmQgPSBvcmllbnQyZDtcblxuXG4gIC8qKlxuICAgKlxuICAgKiBAcHJpdmF0ZVxuICAgKiBAcGFyYW0geyFYWX0gcGEgIHBvaW50IG9iamVjdCB3aXRoIHt4LHl9XG4gICAqIEBwYXJhbSB7IVhZfSBwYiAgcG9pbnQgb2JqZWN0IHdpdGgge3gseX1cbiAgICogQHBhcmFtIHshWFl9IHBjICBwb2ludCBvYmplY3Qgd2l0aCB7eCx5fVxuICAgKiBAcGFyYW0geyFYWX0gcGQgIHBvaW50IG9iamVjdCB3aXRoIHt4LHl9XG4gICAqIEByZXR1cm4ge2Jvb2xlYW59XG4gICAqL1xuICBmdW5jdGlvbiBpblNjYW5BcmVhKHBhLCBwYiwgcGMsIHBkKSB7XG4gICAgdmFyIG9hZGIgPSAocGEueCAtIHBiLngpICogKHBkLnkgLSBwYi55KSAtIChwZC54IC0gcGIueCkgKiAocGEueSAtIHBiLnkpO1xuICAgIGlmIChvYWRiID49IC1FUFNJTE9OKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgdmFyIG9hZGMgPSAocGEueCAtIHBjLngpICogKHBkLnkgLSBwYy55KSAtIChwZC54IC0gcGMueCkgKiAocGEueSAtIHBjLnkpO1xuICAgIGlmIChvYWRjIDw9IEVQU0lMT04pIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cbiAgZXhwb3J0cy5pblNjYW5BcmVhID0gaW5TY2FuQXJlYTtcblxuXG4gIC8qKlxuICAgKiBDaGVjayBpZiB0aGUgYW5nbGUgYmV0d2VlbiAocGEscGIpIGFuZCAocGEscGMpIGlzIG9idHVzZSBpLmUuIChhbmdsZSA+IM+ALzIgfHwgYW5nbGUgPCAtz4AvMilcbiAgICpcbiAgICogQHByaXZhdGVcbiAgICogQHBhcmFtIHshWFl9IHBhICBwb2ludCBvYmplY3Qgd2l0aCB7eCx5fVxuICAgKiBAcGFyYW0geyFYWX0gcGIgIHBvaW50IG9iamVjdCB3aXRoIHt4LHl9XG4gICAqIEBwYXJhbSB7IVhZfSBwYyAgcG9pbnQgb2JqZWN0IHdpdGgge3gseX1cbiAgICogQHJldHVybiB7Ym9vbGVhbn0gdHJ1ZSBpZiBhbmdsZSBpcyBvYnR1c2VcbiAgICovXG4gIGZ1bmN0aW9uIGlzQW5nbGVPYnR1c2UocGEsIHBiLCBwYykge1xuICAgIHZhciBheCA9IHBiLnggLSBwYS54O1xuICAgIHZhciBheSA9IHBiLnkgLSBwYS55O1xuICAgIHZhciBieCA9IHBjLnggLSBwYS54O1xuICAgIHZhciBieSA9IHBjLnkgLSBwYS55O1xuICAgIHJldHVybiAoYXggKiBieCArIGF5ICogYnkpIDwgMDtcbiAgfVxuICBleHBvcnRzLmlzQW5nbGVPYnR1c2UgPSBpc0FuZ2xlT2J0dXNlO1xuXG5cbn0se31dLDExOltmdW5jdGlvbihfZGVyZXFfLG1vZHVsZSxleHBvcnRzKXtcbiAgLypcbiAgICogUG9seTJUcmkgQ29weXJpZ2h0IChjKSAyMDA5LTIwMTQsIFBvbHkyVHJpIENvbnRyaWJ1dG9yc1xuICAgKiBodHRwOi8vY29kZS5nb29nbGUuY29tL3AvcG9seTJ0cmkvXG4gICAqXG4gICAqIHBvbHkydHJpLmpzIChKYXZhU2NyaXB0IHBvcnQpIChjKSAyMDA5LTIwMTQsIFBvbHkyVHJpIENvbnRyaWJ1dG9yc1xuICAgKiBodHRwczovL2dpdGh1Yi5jb20vcjNtaS9wb2x5MnRyaS5qc1xuICAgKlxuICAgKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICAgKlxuICAgKiBEaXN0cmlidXRlZCB1bmRlciB0aGUgMy1jbGF1c2UgQlNEIExpY2Vuc2UsIHNlZSBMSUNFTlNFLnR4dFxuICAgKi9cblxuICBcInVzZSBzdHJpY3RcIjtcblxuICAvKipcbiAgICogVGhlIGZvbGxvd2luZyBmdW5jdGlvbnMgb3BlcmF0ZSBvbiBcIlBvaW50XCIgb3IgYW55IFwiUG9pbnQgbGlrZVwiIG9iamVjdCB3aXRoIHt4LHl9LFxuICAgKiBhcyBkZWZpbmVkIGJ5IHRoZSB7QGxpbmsgWFl9IHR5cGVcbiAgICogKFtkdWNrIHR5cGluZ117QGxpbmsgaHR0cDovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9EdWNrX3R5cGluZ30pLlxuICAgKiBAbW9kdWxlXG4gICAqIEBwcml2YXRlXG4gICAqL1xuXG4gIC8qKlxuICAgKiBwb2x5MnRyaS5qcyBzdXBwb3J0cyB1c2luZyBjdXN0b20gcG9pbnQgY2xhc3MgaW5zdGVhZCBvZiB7QGxpbmtjb2RlIFBvaW50fS5cbiAgICogQW55IFwiUG9pbnQgbGlrZVwiIG9iamVjdCB3aXRoIDxjb2RlPnt4LCB5fTwvY29kZT4gYXR0cmlidXRlcyBpcyBzdXBwb3J0ZWRcbiAgICogdG8gaW5pdGlhbGl6ZSB0aGUgU3dlZXBDb250ZXh0IHBvbHlsaW5lcyBhbmQgcG9pbnRzXG4gICAqIChbZHVjayB0eXBpbmdde0BsaW5rIGh0dHA6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvRHVja190eXBpbmd9KS5cbiAgICpcbiAgICogcG9seTJ0cmkuanMgbWlnaHQgYWRkIGV4dHJhIGZpZWxkcyB0byB0aGUgcG9pbnQgb2JqZWN0cyB3aGVuIGNvbXB1dGluZyB0aGVcbiAgICogdHJpYW5ndWxhdGlvbiA6IHRoZXkgYXJlIHByZWZpeGVkIHdpdGggPGNvZGU+X3AydF88L2NvZGU+IHRvIGF2b2lkIGNvbGxpc2lvbnNcbiAgICogd2l0aCBmaWVsZHMgaW4gdGhlIGN1c3RvbSBjbGFzcy5cbiAgICpcbiAgICogQGV4YW1wbGVcbiAgICogICAgICB2YXIgY29udG91ciA9IFt7eDoxMDAsIHk6MTAwfSwge3g6MTAwLCB5OjMwMH0sIHt4OjMwMCwgeTozMDB9LCB7eDozMDAsIHk6MTAwfV07XG4gICAqICAgICAgdmFyIHN3Y3R4ID0gbmV3IHBvbHkydHJpLlN3ZWVwQ29udGV4dChjb250b3VyKTtcbiAgICpcbiAgICogQHR5cGVkZWYge09iamVjdH0gWFlcbiAgICogQHByb3BlcnR5IHtudW1iZXJ9IHggLSB4IGNvb3JkaW5hdGVcbiAgICogQHByb3BlcnR5IHtudW1iZXJ9IHkgLSB5IGNvb3JkaW5hdGVcbiAgICovXG5cblxuICAvKipcbiAgICogUG9pbnQgcHJldHR5IHByaW50aW5nIDogcHJpbnRzIHggYW5kIHkgY29vcmRpbmF0ZXMuXG4gICAqIEBleGFtcGxlXG4gICAqICAgICAgeHkudG9TdHJpbmdCYXNlKHt4OjUsIHk6NDJ9KVxuICAgKiAgICAgIC8vIOKGkiBcIig1OzQyKVwiXG4gICAqIEBwcm90ZWN0ZWRcbiAgICogQHBhcmFtIHshWFl9IHAgLSBwb2ludCBvYmplY3Qgd2l0aCB7eCx5fVxuICAgKiBAcmV0dXJucyB7c3RyaW5nfSA8Y29kZT5cIih4O3kpXCI8L2NvZGU+XG4gICAqL1xuICBmdW5jdGlvbiB0b1N0cmluZ0Jhc2UocCkge1xuICAgIHJldHVybiAoXCIoXCIgKyBwLnggKyBcIjtcIiArIHAueSArIFwiKVwiKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBQb2ludCBwcmV0dHkgcHJpbnRpbmcuIERlbGVnYXRlcyB0byB0aGUgcG9pbnQncyBjdXN0b20gXCJ0b1N0cmluZygpXCIgbWV0aG9kIGlmIGV4aXN0cyxcbiAgICogZWxzZSBzaW1wbHkgcHJpbnRzIHggYW5kIHkgY29vcmRpbmF0ZXMuXG4gICAqIEBleGFtcGxlXG4gICAqICAgICAgeHkudG9TdHJpbmcoe3g6NSwgeTo0Mn0pXG4gICAqICAgICAgLy8g4oaSIFwiKDU7NDIpXCJcbiAgICogQGV4YW1wbGVcbiAgICogICAgICB4eS50b1N0cmluZyh7eDo1LHk6NDIsdG9TdHJpbmc6ZnVuY3Rpb24oKSB7cmV0dXJuIHRoaXMueCtcIjpcIit0aGlzLnk7fX0pXG4gICAqICAgICAgLy8g4oaSIFwiNTo0MlwiXG4gICAqIEBwYXJhbSB7IVhZfSBwIC0gcG9pbnQgb2JqZWN0IHdpdGgge3gseX1cbiAgICogQHJldHVybnMge3N0cmluZ30gPGNvZGU+XCIoeDt5KVwiPC9jb2RlPlxuICAgKi9cbiAgZnVuY3Rpb24gdG9TdHJpbmcocCkge1xuICAgIC8vIFRyeSBhIGN1c3RvbSB0b1N0cmluZyBmaXJzdCwgYW5kIGZhbGxiYWNrIHRvIG93biBpbXBsZW1lbnRhdGlvbiBpZiBub25lXG4gICAgdmFyIHMgPSBwLnRvU3RyaW5nKCk7XG4gICAgcmV0dXJuIChzID09PSAnW29iamVjdCBPYmplY3RdJyA/IHRvU3RyaW5nQmFzZShwKSA6IHMpO1xuICB9XG5cblxuICAvKipcbiAgICogQ29tcGFyZSB0d28gcG9pbnRzIGNvbXBvbmVudC13aXNlLiBPcmRlcmVkIGJ5IHkgYXhpcyBmaXJzdCwgdGhlbiB4IGF4aXMuXG4gICAqIEBwYXJhbSB7IVhZfSBhIC0gcG9pbnQgb2JqZWN0IHdpdGgge3gseX1cbiAgICogQHBhcmFtIHshWFl9IGIgLSBwb2ludCBvYmplY3Qgd2l0aCB7eCx5fVxuICAgKiBAcmV0dXJuIHtudW1iZXJ9IDxjb2RlPiZsdDsgMDwvY29kZT4gaWYgPGNvZGU+YSAmbHQ7IGI8L2NvZGU+LFxuICAgKiAgICAgICAgIDxjb2RlPiZndDsgMDwvY29kZT4gaWYgPGNvZGU+YSAmZ3Q7IGI8L2NvZGU+LFxuICAgKiAgICAgICAgIDxjb2RlPjA8L2NvZGU+IG90aGVyd2lzZS5cbiAgICovXG4gIGZ1bmN0aW9uIGNvbXBhcmUoYSwgYikge1xuICAgIGlmIChhLnkgPT09IGIueSkge1xuICAgICAgcmV0dXJuIGEueCAtIGIueDtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIGEueSAtIGIueTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogVGVzdCB0d28gUG9pbnQgb2JqZWN0cyBmb3IgZXF1YWxpdHkuXG4gICAqIEBwYXJhbSB7IVhZfSBhIC0gcG9pbnQgb2JqZWN0IHdpdGgge3gseX1cbiAgICogQHBhcmFtIHshWFl9IGIgLSBwb2ludCBvYmplY3Qgd2l0aCB7eCx5fVxuICAgKiBAcmV0dXJuIHtib29sZWFufSA8Y29kZT5UcnVlPC9jb2RlPiBpZiA8Y29kZT5hID09IGI8L2NvZGU+LCA8Y29kZT5mYWxzZTwvY29kZT4gb3RoZXJ3aXNlLlxuICAgKi9cbiAgZnVuY3Rpb24gZXF1YWxzKGEsIGIpIHtcbiAgICByZXR1cm4gYS54ID09PSBiLnggJiYgYS55ID09PSBiLnk7XG4gIH1cblxuXG4gIG1vZHVsZS5leHBvcnRzID0ge1xuICAgIHRvU3RyaW5nOiB0b1N0cmluZyxcbiAgICB0b1N0cmluZ0Jhc2U6IHRvU3RyaW5nQmFzZSxcbiAgICBjb21wYXJlOiBjb21wYXJlLFxuICAgIGVxdWFsczogZXF1YWxzXG4gIH07XG5cbn0se31dfSx7fSxbNl0pXG4oNilcbn0pOyJdLCJuYW1lcyI6WyJlIiwiZXhwb3J0cyIsIm1vZHVsZSIsImRlZmluZSIsImFtZCIsImYiLCJ3aW5kb3ciLCJnbG9iYWwiLCJzZWxmIiwicG9seTJ0cmkiLCJ0IiwibiIsInIiLCJzIiwibyIsInUiLCJhIiwicmVxdWlyZSIsImkiLCJFcnJvciIsImNhbGwiLCJsZW5ndGgiLCJfZGVyZXFfIiwiTm9kZSIsInAiLCJwb2ludCIsInRyaWFuZ2xlIiwibmV4dCIsInByZXYiLCJ2YWx1ZSIsIngiLCJBZHZhbmNpbmdGcm9udCIsImhlYWQiLCJ0YWlsIiwiaGVhZF8iLCJ0YWlsXyIsInNlYXJjaF9ub2RlXyIsInByb3RvdHlwZSIsInNldEhlYWQiLCJub2RlIiwic2V0VGFpbCIsInNlYXJjaCIsInNldFNlYXJjaCIsImZpbmRTZWFyY2hOb2RlIiwibG9jYXRlTm9kZSIsImxvY2F0ZVBvaW50IiwicHgiLCJueCIsImFzc2VydCIsImNvbmRpdGlvbiIsIm1lc3NhZ2UiLCJ4eSIsIlBvaW50IiwieSIsIl9wMnRfZWRnZV9saXN0IiwidG9TdHJpbmciLCJ0b1N0cmluZ0Jhc2UiLCJ0b0pTT04iLCJjbG9uZSIsInNldF96ZXJvIiwic2V0IiwibmVnYXRlIiwiYWRkIiwic3ViIiwibXVsIiwiTWF0aCIsInNxcnQiLCJub3JtYWxpemUiLCJsZW4iLCJlcXVhbHMiLCJiIiwiY3Jvc3MiLCJjb21wYXJlIiwiY21wIiwiZG90IiwiUG9pbnRFcnJvciIsInBvaW50cyIsIm5hbWUiLCJjb25zdHJ1Y3RvciIsInByZXZpb3VzUG9seTJ0cmkiLCJub0NvbmZsaWN0IiwiVkVSU0lPTiIsInZlcnNpb24iLCJUcmlhbmdsZSIsIlN3ZWVwQ29udGV4dCIsInN3ZWVwIiwidHJpYW5ndWxhdGUiLCJUcmlhbmd1bGF0ZSIsInV0aWxzIiwiRVBTSUxPTiIsIk9yaWVudGF0aW9uIiwib3JpZW50MmQiLCJpblNjYW5BcmVhIiwiaXNBbmdsZU9idHVzZSIsInRjeCIsImluaXRUcmlhbmd1bGF0aW9uIiwiY3JlYXRlQWR2YW5jaW5nRnJvbnQiLCJzd2VlcFBvaW50cyIsImZpbmFsaXphdGlvblBvbHlnb24iLCJwb2ludENvdW50IiwiZ2V0UG9pbnQiLCJwb2ludEV2ZW50IiwiZWRnZXMiLCJqIiwiZWRnZUV2ZW50QnlFZGdlIiwiZnJvbnQiLCJnZXRDb25zdHJhaW5lZEVkZ2VDVyIsIm5laWdoYm9yQ0NXIiwibWVzaENsZWFuIiwibmV3X25vZGUiLCJuZXdGcm9udFRyaWFuZ2xlIiwiZmlsbCIsImZpbGxBZHZhbmNpbmdGcm9udCIsImVkZ2UiLCJlZGdlX2V2ZW50IiwiY29uc3RyYWluZWRfZWRnZSIsInJpZ2h0IiwicSIsImlzRWRnZVNpZGVPZlRyaWFuZ2xlIiwiZmlsbEVkZ2VFdmVudCIsImVkZ2VFdmVudEJ5UG9pbnRzIiwiZXAiLCJlcSIsInAxIiwicG9pbnRDQ1ciLCJvMSIsIkNPTExJTkVBUiIsInAyIiwicG9pbnRDVyIsIm8yIiwiQ1ciLCJuZWlnaGJvckNXIiwiZmxpcEVkZ2VFdmVudCIsImluZGV4IiwiZWRnZUluZGV4IiwibWFya0NvbnN0cmFpbmVkRWRnZUJ5SW5kZXgiLCJnZXROZWlnaGJvciIsIm1hcmtDb25zdHJhaW5lZEVkZ2VCeVBvaW50cyIsIm1hcmtOZWlnaGJvciIsImFkZFRvTWFwIiwibGVnYWxpemUiLCJtYXBUcmlhbmdsZVRvTm9kZXMiLCJpc0Jhc2luQW5nbGVSaWdodCIsImZpbGxCYXNpbiIsImF4IiwiYXkiLCJhYnMiLCJkZWxhdW5heV9lZGdlIiwib3QiLCJvcCIsIm9wcG9zaXRlUG9pbnQiLCJvaSIsImluc2lkZSIsImluQ2lyY2xlIiwicm90YXRlVHJpYW5nbGVQYWlyIiwibm90X2xlZ2FsaXplZCIsInBhIiwicGIiLCJwYyIsInBkIiwiYWR4IiwiYWR5IiwiYmR4IiwiYmR5IiwiYWR4YmR5IiwiYmR4YWR5Iiwib2FiZCIsImNkeCIsImNkeSIsImNkeGFkeSIsImFkeGNkeSIsIm9jYWQiLCJiZHhjZHkiLCJjZHhiZHkiLCJhbGlmdCIsImJsaWZ0IiwiY2xpZnQiLCJkZXQiLCJuMSIsIm4yIiwibjMiLCJuNCIsImNlMSIsImNlMiIsImNlMyIsImNlNCIsImdldENvbnN0cmFpbmVkRWRnZUNDVyIsImRlMSIsImRlMiIsImRlMyIsImRlNCIsImdldERlbGF1bmF5RWRnZUNDVyIsImdldERlbGF1bmF5RWRnZUNXIiwic2V0RGVsYXVuYXlFZGdlQ0NXIiwic2V0RGVsYXVuYXlFZGdlQ1ciLCJzZXRDb25zdHJhaW5lZEVkZ2VDQ1ciLCJzZXRDb25zdHJhaW5lZEVkZ2VDVyIsImNsZWFyTmVpZ2hib3JzIiwiQ0NXIiwiYmFzaW4iLCJsZWZ0X25vZGUiLCJib3R0b21fbm9kZSIsInJpZ2h0X25vZGUiLCJ3aWR0aCIsImxlZnRfaGlnaGVzdCIsImZpbGxCYXNpblJlcSIsImlzU2hhbGxvdyIsImhlaWdodCIsImZpbGxSaWdodEFib3ZlRWRnZUV2ZW50IiwiZmlsbExlZnRBYm92ZUVkZ2VFdmVudCIsImZpbGxSaWdodEJlbG93RWRnZUV2ZW50IiwiZmlsbFJpZ2h0Q29uY2F2ZUVkZ2VFdmVudCIsImZpbGxSaWdodENvbnZleEVkZ2VFdmVudCIsImZpbGxMZWZ0QmVsb3dFZGdlRXZlbnQiLCJmaWxsTGVmdENvbmNhdmVFZGdlRXZlbnQiLCJmaWxsTGVmdENvbnZleEVkZ2VFdmVudCIsIm5laWdoYm9yQWNyb3NzIiwiZ2V0Q29uc3RyYWluZWRFZGdlQWNyb3NzIiwibmV4dEZsaXBUcmlhbmdsZSIsIm5ld1AiLCJuZXh0RmxpcFBvaW50IiwiZmxpcFNjYW5FZGdlRXZlbnQiLCJlZGdlX2luZGV4IiwiY2xlYXJEZWxhdW5heUVkZ2VzIiwibzJkIiwiZmxpcF90cmlhbmdsZSIsImtBbHBoYSIsIkVkZ2UiLCJwdXNoIiwiQmFzaW4iLCJjbGVhciIsIkVkZ2VFdmVudCIsImNvbnRvdXIiLCJvcHRpb25zIiwidHJpYW5nbGVzXyIsIm1hcF8iLCJwb2ludHNfIiwiY2xvbmVBcnJheXMiLCJzbGljZSIsImVkZ2VfbGlzdCIsInBtaW5fIiwicG1heF8iLCJmcm9udF8iLCJhZl9oZWFkXyIsImFmX21pZGRsZV8iLCJhZl90YWlsXyIsImluaXRFZGdlcyIsImFkZEhvbGUiLCJwb2x5bGluZSIsIkFkZEhvbGUiLCJhZGRIb2xlcyIsImhvbGVzIiwiY29uY2F0IiwiYXBwbHkiLCJhZGRQb2ludCIsIkFkZFBvaW50IiwiYWRkUG9pbnRzIiwiZ2V0Qm91bmRpbmdCb3giLCJtaW4iLCJtYXgiLCJnZXRUcmlhbmdsZXMiLCJHZXRUcmlhbmdsZXMiLCJnZXRNYXAiLCJ4bWF4IiwieG1pbiIsInltYXgiLCJ5bWluIiwiZHgiLCJkeSIsInNvcnQiLCJtaWRkbGUiLCJyZW1vdmVOb2RlIiwicmVtb3ZlRnJvbU1hcCIsIm1hcCIsInNwbGljZSIsInRyaWFuZ2xlcyIsInBvcCIsImlzSW50ZXJpb3IiLCJzZXRJbnRlcmlvciIsImMiLCJuZWlnaGJvcnNfIiwiaW50ZXJpb3JfIiwicDJzIiwiR2V0UG9pbnQiLCJnZXRQb2ludHMiLCJjb250YWluc1BvaW50IiwiY29udGFpbnNFZGdlIiwiY29udGFpbnNQb2ludHMiLCJpbnRlcmlvciIsIm1hcmtOZWlnaGJvclBvaW50ZXJzIiwiY2UiLCJjdyIsIm9wb2ludCIsIm5wb2ludCIsIm1hcmtDb25zdHJhaW5lZEVkZ2VCeUVkZ2UiLCJkZXRsZWZ0IiwiZGV0cmlnaHQiLCJ2YWwiLCJvYWRiIiwib2FkYyIsImJ4IiwiYnkiXSwibWFwcGluZ3MiOiJBQUFBLENBQUMsU0FBU0EsQ0FBQztJQUFFLElBQUcsWUFBVSxPQUFPQyxTQUFRQyxPQUFPRCxPQUFPLEdBQUNEO1NBQVMsSUFBRyxjQUFZLE9BQU9HLFVBQVFBLE9BQU9DLEdBQUcsRUFBQ0QsT0FBT0g7U0FBTztRQUFDLElBQUlLO1FBQUUsZUFBYSxPQUFPQyxTQUFPRCxJQUFFQyxTQUFPLGVBQWEsT0FBT0MsU0FBT0YsSUFBRUUsU0FBTyxlQUFhLE9BQU9DLFFBQU9ILENBQUFBLElBQUVHLElBQUcsR0FBR0gsRUFBRUksUUFBUSxHQUFDVDtJQUFHO0FBQUMsRUFBRTtJQUFXLElBQUlHLFNBQU9ELFNBQU9EO0lBQVEsT0FBTyxBQUFDLENBQUEsU0FBU0QsRUFBRVUsQ0FBQyxFQUFDQyxDQUFDLEVBQUNDLENBQUM7UUFBRSxTQUFTQyxFQUFFQyxDQUFDLEVBQUNDLENBQUM7WUFBRSxJQUFHLENBQUNKLENBQUMsQ0FBQ0csRUFBRSxFQUFDO2dCQUFDLElBQUcsQ0FBQ0osQ0FBQyxDQUFDSSxFQUFFLEVBQUM7b0JBQUMsSUFBSUUsSUFBRSxPQUFPQyxXQUFTLGNBQVlBO29CQUFRLElBQUcsQ0FBQ0YsS0FBR0MsR0FBRSxPQUFPQSxFQUFFRixHQUFFLENBQUM7b0JBQUcsSUFBR0ksR0FBRSxPQUFPQSxFQUFFSixHQUFFLENBQUM7b0JBQUcsTUFBTSxJQUFJSyxNQUFNLHlCQUF1QkwsSUFBRTtnQkFBSTtnQkFBQyxJQUFJVCxJQUFFTSxDQUFDLENBQUNHLEVBQUUsR0FBQztvQkFBQ2IsU0FBUSxDQUFDO2dCQUFDO2dCQUFFUyxDQUFDLENBQUNJLEVBQUUsQ0FBQyxFQUFFLENBQUNNLElBQUksQ0FBQ2YsRUFBRUosT0FBTyxFQUFDLFNBQVNELENBQUM7b0JBQUUsSUFBSVcsSUFBRUQsQ0FBQyxDQUFDSSxFQUFFLENBQUMsRUFBRSxDQUFDZCxFQUFFO29CQUFDLE9BQU9hLEVBQUVGLElBQUVBLElBQUVYO2dCQUFFLEdBQUVLLEdBQUVBLEVBQUVKLE9BQU8sRUFBQ0QsR0FBRVUsR0FBRUMsR0FBRUM7WUFBRTtZQUFDLE9BQU9ELENBQUMsQ0FBQ0csRUFBRSxDQUFDYixPQUFPO1FBQUE7UUFBQyxJQUFJaUIsSUFBRSxPQUFPRCxXQUFTLGNBQVlBO1FBQVEsSUFBSSxJQUFJSCxJQUFFLEdBQUVBLElBQUVGLEVBQUVTLE1BQU0sRUFBQ1AsSUFBSUQsRUFBRUQsQ0FBQyxDQUFDRSxFQUFFO1FBQUUsT0FBT0Q7SUFBQyxDQUFBLEVBQUc7UUFBQyxHQUFFO1lBQUMsU0FBU1MsT0FBTyxFQUFDcEIsT0FBTSxFQUFDRCxRQUFPO2dCQUNqdUJDLFFBQU9ELE9BQU8sR0FBQztvQkFBQyxXQUFXO2dCQUFPO1lBQ3BDO1lBQUUsQ0FBQztTQUFFO1FBQUMsR0FBRTtZQUFDLFNBQVNxQixPQUFPLEVBQUNwQixPQUFNLEVBQUNELFFBQU87Z0JBQ3RDOzs7Ozs7Ozs7O0dBVUMsR0FFRCwyQkFBMkIsR0FFM0I7Z0JBR0E7Ozs7OztHQU1DLEdBR0gsZ0ZBQWdGO2dCQUU5RTs7Ozs7OztHQU9DLEdBQ0QsSUFBSXNCLE9BQU8sU0FBU0MsQ0FBQyxFQUFFZCxDQUFDO29CQUN0QixlQUFlLEdBQ2YsSUFBSSxDQUFDZSxLQUFLLEdBQUdEO29CQUViLDBCQUEwQixHQUMxQixJQUFJLENBQUNFLFFBQVEsR0FBR2hCLEtBQUs7b0JBRXJCLHNCQUFzQixHQUN0QixJQUFJLENBQUNpQixJQUFJLEdBQUc7b0JBQ1osc0JBQXNCLEdBQ3RCLElBQUksQ0FBQ0MsSUFBSSxHQUFHO29CQUVaLG1CQUFtQixHQUNuQixJQUFJLENBQUNDLEtBQUssR0FBR0wsRUFBRU0sQ0FBQztnQkFDbEI7Z0JBRUYsZ0ZBQWdGO2dCQUM5RTs7Ozs7O0dBTUMsR0FDRCxJQUFJQyxpQkFBaUIsU0FBU0MsSUFBSSxFQUFFQyxJQUFJO29CQUN0QyxpQkFBaUIsR0FDakIsSUFBSSxDQUFDQyxLQUFLLEdBQUdGO29CQUNiLGlCQUFpQixHQUNqQixJQUFJLENBQUNHLEtBQUssR0FBR0Y7b0JBQ2IsaUJBQWlCLEdBQ2pCLElBQUksQ0FBQ0csWUFBWSxHQUFHSjtnQkFDdEI7Z0JBRUEsbUJBQW1CLEdBQ25CRCxlQUFlTSxTQUFTLENBQUNMLElBQUksR0FBRztvQkFDOUIsT0FBTyxJQUFJLENBQUNFLEtBQUs7Z0JBQ25CO2dCQUVBLHVCQUF1QixHQUN2QkgsZUFBZU0sU0FBUyxDQUFDQyxPQUFPLEdBQUcsU0FBU0MsSUFBSTtvQkFDOUMsSUFBSSxDQUFDTCxLQUFLLEdBQUdLO2dCQUNmO2dCQUVBLG1CQUFtQixHQUNuQlIsZUFBZU0sU0FBUyxDQUFDSixJQUFJLEdBQUc7b0JBQzlCLE9BQU8sSUFBSSxDQUFDRSxLQUFLO2dCQUNuQjtnQkFFQSx1QkFBdUIsR0FDdkJKLGVBQWVNLFNBQVMsQ0FBQ0csT0FBTyxHQUFHLFNBQVNELElBQUk7b0JBQzlDLElBQUksQ0FBQ0osS0FBSyxHQUFHSTtnQkFDZjtnQkFFQSxtQkFBbUIsR0FDbkJSLGVBQWVNLFNBQVMsQ0FBQ0ksTUFBTSxHQUFHO29CQUNoQyxPQUFPLElBQUksQ0FBQ0wsWUFBWTtnQkFDMUI7Z0JBRUEsdUJBQXVCLEdBQ3ZCTCxlQUFlTSxTQUFTLENBQUNLLFNBQVMsR0FBRyxTQUFTSCxJQUFJO29CQUNoRCxJQUFJLENBQUNILFlBQVksR0FBR0c7Z0JBQ3RCO2dCQUVBLG1CQUFtQixHQUNuQlIsZUFBZU0sU0FBUyxDQUFDTSxjQUFjLEdBQUc7b0JBQ3hDLDRCQUE0QjtvQkFDNUIsT0FBTyxJQUFJLENBQUNQLFlBQVk7Z0JBQzFCO2dCQUVBOzs7R0FHQyxHQUNETCxlQUFlTSxTQUFTLENBQUNPLFVBQVUsR0FBRyxTQUFTZCxDQUFDO29CQUM5QyxJQUFJUyxPQUFPLElBQUksQ0FBQ0gsWUFBWTtvQkFFNUIsb0JBQW9CLEdBQ3BCLElBQUlOLElBQUlTLEtBQUtWLEtBQUssRUFBRTt3QkFDbEIsTUFBT1UsT0FBT0EsS0FBS1gsSUFBSSxDQUFFOzRCQUN2QixJQUFJRSxLQUFLUyxLQUFLVixLQUFLLEVBQUU7Z0NBQ25CLElBQUksQ0FBQ08sWUFBWSxHQUFHRztnQ0FDcEIsT0FBT0E7NEJBQ1Q7d0JBQ0Y7b0JBQ0YsT0FBTzt3QkFDTCxNQUFPQSxPQUFPQSxLQUFLWixJQUFJLENBQUU7NEJBQ3ZCLElBQUlHLElBQUlTLEtBQUtWLEtBQUssRUFBRTtnQ0FDbEIsSUFBSSxDQUFDTyxZQUFZLEdBQUdHLEtBQUtYLElBQUk7Z0NBQzdCLE9BQU9XLEtBQUtYLElBQUk7NEJBQ2xCO3dCQUNGO29CQUNGO29CQUNBLE9BQU87Z0JBQ1Q7Z0JBRUE7OztHQUdDLEdBQ0RHLGVBQWVNLFNBQVMsQ0FBQ1EsV0FBVyxHQUFHLFNBQVNwQixLQUFLO29CQUNuRCxJQUFJcUIsS0FBS3JCLE1BQU1LLENBQUM7b0JBQ2hCLElBQUlTLE9BQU8sSUFBSSxDQUFDSSxjQUFjLENBQUNHO29CQUMvQixJQUFJQyxLQUFLUixLQUFLZCxLQUFLLENBQUNLLENBQUM7b0JBRXJCLElBQUlnQixPQUFPQyxJQUFJO3dCQUNiLHFEQUFxRDt3QkFDckQsSUFBSXRCLFVBQVVjLEtBQUtkLEtBQUssRUFBRTs0QkFDeEIsNkRBQTZEOzRCQUM3RCxJQUFJQSxVQUFVYyxLQUFLWCxJQUFJLENBQUNILEtBQUssRUFBRTtnQ0FDN0JjLE9BQU9BLEtBQUtYLElBQUk7NEJBQ2xCLE9BQU8sSUFBSUgsVUFBVWMsS0FBS1osSUFBSSxDQUFDRixLQUFLLEVBQUU7Z0NBQ3BDYyxPQUFPQSxLQUFLWixJQUFJOzRCQUNsQixPQUFPO2dDQUNMLE1BQU0sSUFBSVIsTUFBTTs0QkFDbEI7d0JBQ0Y7b0JBQ0YsT0FBTyxJQUFJMkIsS0FBS0MsSUFBSTt3QkFDbEIsb0JBQW9CLEdBQ3BCLE1BQU9SLE9BQU9BLEtBQUtYLElBQUksQ0FBRTs0QkFDdkIsSUFBSUgsVUFBVWMsS0FBS2QsS0FBSyxFQUFFO2dDQUN4Qjs0QkFDRjt3QkFDRjtvQkFDRixPQUFPO3dCQUNMLE1BQU9jLE9BQU9BLEtBQUtaLElBQUksQ0FBRTs0QkFDdkIsSUFBSUYsVUFBVWMsS0FBS2QsS0FBSyxFQUFFO2dDQUN4Qjs0QkFDRjt3QkFDRjtvQkFDRjtvQkFFQSxJQUFJYyxNQUFNO3dCQUNSLElBQUksQ0FBQ0gsWUFBWSxHQUFHRztvQkFDdEI7b0JBQ0EsT0FBT0E7Z0JBQ1Q7Z0JBR0YsZ0ZBQWdGO2dCQUU5RXJDLFFBQU9ELE9BQU8sR0FBRzhCO2dCQUNqQjdCLFFBQU9ELE9BQU8sQ0FBQ3NCLElBQUksR0FBR0E7WUFHeEI7WUFBRSxDQUFDO1NBQUU7UUFBQyxHQUFFO1lBQUMsU0FBU0QsT0FBTyxFQUFDcEIsT0FBTSxFQUFDRCxRQUFPO2dCQUN0Qzs7Ozs7Ozs7OztHQVVDLEdBRUQ7Z0JBRUE7O0dBRUMsR0FFRDs7Ozs7O0dBTUMsR0FDRCxTQUFTK0MsT0FBT0MsU0FBUyxFQUFFQyxPQUFPO29CQUNoQyxJQUFJLENBQUNELFdBQVc7d0JBQ2QsTUFBTSxJQUFJOUIsTUFBTStCLFdBQVc7b0JBQzdCO2dCQUNGO2dCQUNBaEQsUUFBT0QsT0FBTyxHQUFHK0M7WUFJbkI7WUFBRSxDQUFDO1NBQUU7UUFBQyxHQUFFO1lBQUMsU0FBUzFCLE9BQU8sRUFBQ3BCLE9BQU0sRUFBQ0QsUUFBTztnQkFDdEM7Ozs7Ozs7Ozs7R0FVQyxHQUVEO2dCQUdBOzs7Ozs7R0FNQyxHQUVELElBQUlrRCxLQUFLN0IsUUFBUTtnQkFFbkIsZ0ZBQWdGO2dCQUM5RTs7Ozs7Ozs7O0dBU0MsR0FDRCxJQUFJOEIsUUFBUSxTQUFTdEIsQ0FBQyxFQUFFdUIsQ0FBQztvQkFDdkI7OztLQUdDLEdBQ0QsSUFBSSxDQUFDdkIsQ0FBQyxHQUFHLENBQUNBLEtBQUs7b0JBQ2Y7OztLQUdDLEdBQ0QsSUFBSSxDQUFDdUIsQ0FBQyxHQUFHLENBQUNBLEtBQUs7b0JBRWYsMERBQTBEO29CQUMxRCxxREFBcUQ7b0JBRXJEOzs7O0tBSUMsR0FDRCxJQUFJLENBQUNDLGNBQWMsR0FBRztnQkFDeEI7Z0JBRUE7Ozs7OztHQU1DLEdBQ0RGLE1BQU1mLFNBQVMsQ0FBQ2tCLFFBQVEsR0FBRztvQkFDekIsT0FBT0osR0FBR0ssWUFBWSxDQUFDLElBQUk7Z0JBQzdCO2dCQUVBOzs7OztHQUtDLEdBQ0RKLE1BQU1mLFNBQVMsQ0FBQ29CLE1BQU0sR0FBRztvQkFDdkIsT0FBTzt3QkFBRTNCLEdBQUcsSUFBSSxDQUFDQSxDQUFDO3dCQUFFdUIsR0FBRyxJQUFJLENBQUNBLENBQUM7b0JBQUM7Z0JBQ2hDO2dCQUVBOzs7R0FHQyxHQUNERCxNQUFNZixTQUFTLENBQUNxQixLQUFLLEdBQUc7b0JBQ3RCLE9BQU8sSUFBSU4sTUFBTSxJQUFJLENBQUN0QixDQUFDLEVBQUUsSUFBSSxDQUFDdUIsQ0FBQztnQkFDakM7Z0JBRUE7OztHQUdDLEdBQ0RELE1BQU1mLFNBQVMsQ0FBQ3NCLFFBQVEsR0FBRztvQkFDekIsSUFBSSxDQUFDN0IsQ0FBQyxHQUFHO29CQUNULElBQUksQ0FBQ3VCLENBQUMsR0FBRztvQkFDVCxPQUFPLElBQUksRUFBRSxlQUFlO2dCQUM5QjtnQkFFQTs7Ozs7R0FLQyxHQUNERCxNQUFNZixTQUFTLENBQUN1QixHQUFHLEdBQUcsU0FBUzlCLENBQUMsRUFBRXVCLENBQUM7b0JBQ2pDLElBQUksQ0FBQ3ZCLENBQUMsR0FBRyxDQUFDQSxLQUFLO29CQUNmLElBQUksQ0FBQ3VCLENBQUMsR0FBRyxDQUFDQSxLQUFLO29CQUNmLE9BQU8sSUFBSSxFQUFFLGVBQWU7Z0JBQzlCO2dCQUVBOzs7R0FHQyxHQUNERCxNQUFNZixTQUFTLENBQUN3QixNQUFNLEdBQUc7b0JBQ3ZCLElBQUksQ0FBQy9CLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQ0EsQ0FBQztvQkFDaEIsSUFBSSxDQUFDdUIsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDQSxDQUFDO29CQUNoQixPQUFPLElBQUksRUFBRSxlQUFlO2dCQUM5QjtnQkFFQTs7OztHQUlDLEdBQ0RELE1BQU1mLFNBQVMsQ0FBQ3lCLEdBQUcsR0FBRyxTQUFTbkQsQ0FBQztvQkFDOUIsSUFBSSxDQUFDbUIsQ0FBQyxJQUFJbkIsRUFBRW1CLENBQUM7b0JBQ2IsSUFBSSxDQUFDdUIsQ0FBQyxJQUFJMUMsRUFBRTBDLENBQUM7b0JBQ2IsT0FBTyxJQUFJLEVBQUUsZUFBZTtnQkFDOUI7Z0JBRUE7Ozs7R0FJQyxHQUNERCxNQUFNZixTQUFTLENBQUMwQixHQUFHLEdBQUcsU0FBU3BELENBQUM7b0JBQzlCLElBQUksQ0FBQ21CLENBQUMsSUFBSW5CLEVBQUVtQixDQUFDO29CQUNiLElBQUksQ0FBQ3VCLENBQUMsSUFBSTFDLEVBQUUwQyxDQUFDO29CQUNiLE9BQU8sSUFBSSxFQUFFLGVBQWU7Z0JBQzlCO2dCQUVBOzs7O0dBSUMsR0FDREQsTUFBTWYsU0FBUyxDQUFDMkIsR0FBRyxHQUFHLFNBQVNuRCxDQUFDO29CQUM5QixJQUFJLENBQUNpQixDQUFDLElBQUlqQjtvQkFDVixJQUFJLENBQUN3QyxDQUFDLElBQUl4QztvQkFDVixPQUFPLElBQUksRUFBRSxlQUFlO2dCQUM5QjtnQkFFQTs7O0dBR0MsR0FDRHVDLE1BQU1mLFNBQVMsQ0FBQ2hCLE1BQU0sR0FBRztvQkFDdkIsT0FBTzRDLEtBQUtDLElBQUksQ0FBQyxJQUFJLENBQUNwQyxDQUFDLEdBQUcsSUFBSSxDQUFDQSxDQUFDLEdBQUcsSUFBSSxDQUFDdUIsQ0FBQyxHQUFHLElBQUksQ0FBQ0EsQ0FBQztnQkFDcEQ7Z0JBRUE7OztHQUdDLEdBQ0RELE1BQU1mLFNBQVMsQ0FBQzhCLFNBQVMsR0FBRztvQkFDMUIsSUFBSUMsTUFBTSxJQUFJLENBQUMvQyxNQUFNO29CQUNyQixJQUFJLENBQUNTLENBQUMsSUFBSXNDO29CQUNWLElBQUksQ0FBQ2YsQ0FBQyxJQUFJZTtvQkFDVixPQUFPQTtnQkFDVDtnQkFFQTs7OztHQUlDLEdBQ0RoQixNQUFNZixTQUFTLENBQUNnQyxNQUFNLEdBQUcsU0FBUzdDLENBQUM7b0JBQ2pDLE9BQU8sSUFBSSxDQUFDTSxDQUFDLEtBQUtOLEVBQUVNLENBQUMsSUFBSSxJQUFJLENBQUN1QixDQUFDLEtBQUs3QixFQUFFNkIsQ0FBQztnQkFDekM7Z0JBR0YsZ0ZBQWdGO2dCQUU5RTs7OztHQUlDLEdBQ0RELE1BQU1TLE1BQU0sR0FBRyxTQUFTckMsQ0FBQztvQkFDdkIsT0FBTyxJQUFJNEIsTUFBTSxDQUFDNUIsRUFBRU0sQ0FBQyxFQUFFLENBQUNOLEVBQUU2QixDQUFDO2dCQUM3QjtnQkFFQTs7Ozs7R0FLQyxHQUNERCxNQUFNVSxHQUFHLEdBQUcsU0FBUzlDLENBQUMsRUFBRXNELENBQUM7b0JBQ3ZCLE9BQU8sSUFBSWxCLE1BQU1wQyxFQUFFYyxDQUFDLEdBQUd3QyxFQUFFeEMsQ0FBQyxFQUFFZCxFQUFFcUMsQ0FBQyxHQUFHaUIsRUFBRWpCLENBQUM7Z0JBQ3ZDO2dCQUVBOzs7OztHQUtDLEdBQ0RELE1BQU1XLEdBQUcsR0FBRyxTQUFTL0MsQ0FBQyxFQUFFc0QsQ0FBQztvQkFDdkIsT0FBTyxJQUFJbEIsTUFBTXBDLEVBQUVjLENBQUMsR0FBR3dDLEVBQUV4QyxDQUFDLEVBQUVkLEVBQUVxQyxDQUFDLEdBQUdpQixFQUFFakIsQ0FBQztnQkFDdkM7Z0JBRUE7Ozs7O0dBS0MsR0FDREQsTUFBTVksR0FBRyxHQUFHLFNBQVNuRCxDQUFDLEVBQUVXLENBQUM7b0JBQ3ZCLE9BQU8sSUFBSTRCLE1BQU12QyxJQUFJVyxFQUFFTSxDQUFDLEVBQUVqQixJQUFJVyxFQUFFNkIsQ0FBQztnQkFDbkM7Z0JBRUE7Ozs7Ozs7O0dBUUMsR0FDREQsTUFBTW1CLEtBQUssR0FBRyxTQUFTdkQsQ0FBQyxFQUFFc0QsQ0FBQztvQkFDekIsSUFBSSxPQUFPdEQsTUFBTyxVQUFVO3dCQUMxQixJQUFJLE9BQU9zRCxNQUFPLFVBQVU7NEJBQzFCLE9BQU90RCxJQUFJc0Q7d0JBQ2IsT0FBTzs0QkFDTCxPQUFPLElBQUlsQixNQUFNLENBQUNwQyxJQUFJc0QsRUFBRWpCLENBQUMsRUFBRXJDLElBQUlzRCxFQUFFeEMsQ0FBQzt3QkFDcEM7b0JBQ0YsT0FBTzt3QkFDTCxJQUFJLE9BQU93QyxNQUFPLFVBQVU7NEJBQzFCLE9BQU8sSUFBSWxCLE1BQU1rQixJQUFJdEQsRUFBRXFDLENBQUMsRUFBRSxDQUFDaUIsSUFBSXRELEVBQUVjLENBQUM7d0JBQ3BDLE9BQU87NEJBQ0wsT0FBT2QsRUFBRWMsQ0FBQyxHQUFHd0MsRUFBRWpCLENBQUMsR0FBR3JDLEVBQUVxQyxDQUFDLEdBQUdpQixFQUFFeEMsQ0FBQzt3QkFDOUI7b0JBQ0Y7Z0JBQ0Y7Z0JBR0YsZ0ZBQWdGO2dCQUM5RTs7O0dBR0MsR0FFRHNCLE1BQU1HLFFBQVEsR0FBR0osR0FBR0ksUUFBUTtnQkFDNUJILE1BQU1vQixPQUFPLEdBQUdyQixHQUFHcUIsT0FBTztnQkFDMUJwQixNQUFNcUIsR0FBRyxHQUFHdEIsR0FBR3FCLE9BQU8sRUFBRSx5QkFBeUI7Z0JBQ2pEcEIsTUFBTWlCLE1BQU0sR0FBR2xCLEdBQUdrQixNQUFNO2dCQUV4Qjs7Ozs7O0dBTUMsR0FDRGpCLE1BQU1zQixHQUFHLEdBQUcsU0FBUzFELENBQUMsRUFBRXNELENBQUM7b0JBQ3ZCLE9BQU90RCxFQUFFYyxDQUFDLEdBQUd3QyxFQUFFeEMsQ0FBQyxHQUFHZCxFQUFFcUMsQ0FBQyxHQUFHaUIsRUFBRWpCLENBQUM7Z0JBQzlCO2dCQUdGLGdGQUFnRjtnQkFFOUVuRCxRQUFPRCxPQUFPLEdBQUdtRDtZQUVuQjtZQUFFO2dCQUFDLFFBQU87WUFBRTtTQUFFO1FBQUMsR0FBRTtZQUFDLFNBQVM5QixPQUFPLEVBQUNwQixPQUFNLEVBQUNELFFBQU87Z0JBQy9DOzs7Ozs7Ozs7O0dBVUMsR0FFRDtnQkFFQTs7R0FFQyxHQUVELElBQUlrRCxLQUFLN0IsUUFBUTtnQkFFakI7Ozs7Ozs7O0dBUUMsR0FDRCxJQUFJcUQsYUFBYSxTQUFTekIsT0FBTyxFQUFFMEIsTUFBTTtvQkFDdkMsSUFBSSxDQUFDQyxJQUFJLEdBQUc7b0JBQ1o7Ozs7S0FJQyxHQUNELElBQUksQ0FBQ0QsTUFBTSxHQUFHQSxTQUFTQSxVQUFVLEVBQUU7b0JBQ25DOzs7O0tBSUMsR0FDRCxJQUFJLENBQUMxQixPQUFPLEdBQUdBLFdBQVc7b0JBQzFCLElBQUssSUFBSWhDLElBQUksR0FBR0EsSUFBSTBELE9BQU92RCxNQUFNLEVBQUVILElBQUs7d0JBQ3RDLElBQUksQ0FBQ2dDLE9BQU8sSUFBSSxNQUFNQyxHQUFHSSxRQUFRLENBQUNxQixNQUFNLENBQUMxRCxFQUFFO29CQUM3QztnQkFDRjtnQkFDQXlELFdBQVd0QyxTQUFTLEdBQUcsSUFBSWxCO2dCQUMzQndELFdBQVd0QyxTQUFTLENBQUN5QyxXQUFXLEdBQUdIO2dCQUduQ3pFLFFBQU9ELE9BQU8sR0FBRzBFO1lBRW5CO1lBQUU7Z0JBQUMsUUFBTztZQUFFO1NBQUU7UUFBQyxHQUFFO1lBQUMsU0FBU3JELE9BQU8sRUFBQ3BCLE9BQU0sRUFBQ0QsUUFBTztnQkFDOUMsQ0FBQSxTQUFVTSxPQUFNO29CQUNmOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztLQWdDQyxHQUVEO29CQUVBOzs7S0FHQyxHQUdEOzs7Ozs7O0tBT0MsR0FDRCxJQUFJd0UsbUJBQW1CeEUsUUFBT0UsUUFBUTtvQkFDdEM7Ozs7Ozs7OztLQVNDLEdBQ0wsOERBQThEO29CQUMxRFIsU0FBUStFLFVBQVUsR0FBRzt3QkFDbkJ6RSxRQUFPRSxRQUFRLEdBQUdzRTt3QkFDbEIsT0FBTzlFO29CQUNUO29CQUVBOzs7O0tBSUMsR0FDREEsU0FBUWdGLE9BQU8sR0FBRzNELFFBQVEsd0JBQXdCNEQsT0FBTztvQkFFekQ7Ozs7O0tBS0MsR0FDRGpGLFNBQVEwRSxVQUFVLEdBQUdyRCxRQUFRO29CQUM3Qjs7Ozs7S0FLQyxHQUNEckIsU0FBUW1ELEtBQUssR0FBRzlCLFFBQVE7b0JBQ3hCOzs7OztLQUtDLEdBQ0RyQixTQUFRa0YsUUFBUSxHQUFHN0QsUUFBUTtvQkFDM0I7Ozs7O0tBS0MsR0FDRHJCLFNBQVFtRixZQUFZLEdBQUc5RCxRQUFRO29CQUduQyx5QkFBeUI7b0JBQ3JCLElBQUkrRCxRQUFRL0QsUUFBUTtvQkFDcEI7OztLQUdDLEdBQ0RyQixTQUFRcUYsV0FBVyxHQUFHRCxNQUFNQyxXQUFXO29CQUN2Qzs7O0tBR0MsR0FDRHJGLFNBQVFvRixLQUFLLEdBQUc7d0JBQUNFLGFBQWFGLE1BQU1DLFdBQVc7b0JBQUE7Z0JBRWpELENBQUEsRUFBR2xFLElBQUksQ0FBQyxJQUFJLEVBQUMsT0FBT1osU0FBUyxjQUFjQSxPQUFPLE9BQU9GLFdBQVcsY0FBY0EsU0FBUyxDQUFDO1lBQzlGO1lBQUU7Z0JBQUMsd0JBQXVCO2dCQUFFLFdBQVU7Z0JBQUUsZ0JBQWU7Z0JBQUUsV0FBVTtnQkFBRSxrQkFBaUI7Z0JBQUUsY0FBYTtZQUFDO1NBQUU7UUFBQyxHQUFFO1lBQUMsU0FBU2dCLE9BQU8sRUFBQ3BCLE9BQU0sRUFBQ0QsUUFBTztnQkFDekk7Ozs7Ozs7Ozs7R0FVQyxHQUVELDBDQUEwQyxHQUUxQztnQkFFQTs7Ozs7O0dBTUMsR0FFRDs7Ozs7O0dBTUMsR0FFRCxJQUFJK0MsU0FBUzFCLFFBQVE7Z0JBQ3JCLElBQUlxRCxhQUFhckQsUUFBUTtnQkFDekIsSUFBSTZELFdBQVc3RCxRQUFRO2dCQUN2QixJQUFJQyxPQUFPRCxRQUFRLG9CQUFvQkMsSUFBSTtnQkFHN0MsZ0ZBQWdGO2dCQUU5RSxJQUFJaUUsUUFBUWxFLFFBQVE7Z0JBRXBCLFdBQVcsR0FDWCxJQUFJbUUsVUFBVUQsTUFBTUMsT0FBTztnQkFFM0IsV0FBVyxHQUNYLElBQUlDLGNBQWNGLE1BQU1FLFdBQVc7Z0JBQ25DLFdBQVcsR0FDWCxJQUFJQyxXQUFXSCxNQUFNRyxRQUFRO2dCQUM3QixXQUFXLEdBQ1gsSUFBSUMsYUFBYUosTUFBTUksVUFBVTtnQkFDakMsV0FBVyxHQUNYLElBQUlDLGdCQUFnQkwsTUFBTUssYUFBYTtnQkFHekMsZ0ZBQWdGO2dCQUU5RTs7Ozs7R0FLQyxHQUNELFNBQVNQLFlBQVlRLEdBQUc7b0JBQ3RCQSxJQUFJQyxpQkFBaUI7b0JBQ3JCRCxJQUFJRSxvQkFBb0I7b0JBQ3hCLDJCQUEyQjtvQkFDM0JDLFlBQVlIO29CQUNaLFdBQVc7b0JBQ1hJLG9CQUFvQko7Z0JBQ3RCO2dCQUVBOzs7R0FHQyxHQUNELFNBQVNHLFlBQVlILEdBQUc7b0JBQ3RCLElBQUk1RSxHQUFHa0QsTUFBTTBCLElBQUlLLFVBQVU7b0JBQzNCLElBQUtqRixJQUFJLEdBQUdBLElBQUlrRCxLQUFLLEVBQUVsRCxFQUFHO3dCQUN4QixJQUFJTyxRQUFRcUUsSUFBSU0sUUFBUSxDQUFDbEY7d0JBQ3pCLElBQUlxQixPQUFPOEQsV0FBV1AsS0FBS3JFO3dCQUMzQixJQUFJNkUsUUFBUTdFLE1BQU02QixjQUFjO3dCQUNoQyxJQUFLLElBQUlpRCxJQUFJLEdBQUdELFNBQVNDLElBQUlELE1BQU1qRixNQUFNLEVBQUUsRUFBRWtGLEVBQUc7NEJBQzlDQyxnQkFBZ0JWLEtBQUtRLEtBQUssQ0FBQ0MsRUFBRSxFQUFFaEU7d0JBQ2pDO29CQUNGO2dCQUNGO2dCQUVBOztHQUVDLEdBQ0QsU0FBUzJELG9CQUFvQkosR0FBRztvQkFDOUIseUNBQXlDO29CQUN6QyxJQUFJcEYsSUFBSW9GLElBQUlXLEtBQUssR0FBR3pFLElBQUksR0FBR0wsSUFBSSxDQUFDRCxRQUFRO29CQUN4QyxJQUFJRixJQUFJc0UsSUFBSVcsS0FBSyxHQUFHekUsSUFBSSxHQUFHTCxJQUFJLENBQUNGLEtBQUs7b0JBQ3JDLE1BQU8sQ0FBQ2YsRUFBRWdHLG9CQUFvQixDQUFDbEYsR0FBSTt3QkFDakNkLElBQUlBLEVBQUVpRyxXQUFXLENBQUNuRjtvQkFDcEI7b0JBRUEsa0RBQWtEO29CQUNsRHNFLElBQUljLFNBQVMsQ0FBQ2xHO2dCQUNoQjtnQkFFQTs7Ozs7O0dBTUMsR0FDRCxTQUFTMkYsV0FBV1AsR0FBRyxFQUFFckUsS0FBSztvQkFDNUIsSUFBSWMsT0FBT3VELElBQUlsRCxVQUFVLENBQUNuQjtvQkFDMUIsSUFBSW9GLFdBQVdDLGlCQUFpQmhCLEtBQUtyRSxPQUFPYztvQkFFNUMsNkRBQTZEO29CQUM3RCw2REFBNkQ7b0JBQzdELElBQUlkLE1BQU1LLENBQUMsSUFBSVMsS0FBS2QsS0FBSyxDQUFDSyxDQUFDLEdBQUkyRCxTQUFVO3dCQUN2Q3NCLEtBQUtqQixLQUFLdkQ7b0JBQ1o7b0JBRUEsd0JBQXdCO29CQUV4QnlFLG1CQUFtQmxCLEtBQUtlO29CQUN4QixPQUFPQTtnQkFDVDtnQkFFQSxTQUFTTCxnQkFBZ0JWLEdBQUcsRUFBRW1CLElBQUksRUFBRTFFLElBQUk7b0JBQ3RDdUQsSUFBSW9CLFVBQVUsQ0FBQ0MsZ0JBQWdCLEdBQUdGO29CQUNsQ25CLElBQUlvQixVQUFVLENBQUNFLEtBQUssR0FBSUgsS0FBS3pGLENBQUMsQ0FBQ00sQ0FBQyxHQUFHbUYsS0FBS0ksQ0FBQyxDQUFDdkYsQ0FBQztvQkFFM0MsSUFBSXdGLHFCQUFxQi9FLEtBQUtiLFFBQVEsRUFBRXVGLEtBQUt6RixDQUFDLEVBQUV5RixLQUFLSSxDQUFDLEdBQUc7d0JBQ3ZEO29CQUNGO29CQUVBLHdDQUF3QztvQkFDeEMsdUVBQXVFO29CQUN2RSxvRkFBb0Y7b0JBQ3BGRSxjQUFjekIsS0FBS21CLE1BQU0xRTtvQkFDekJpRixrQkFBa0IxQixLQUFLbUIsS0FBS3pGLENBQUMsRUFBRXlGLEtBQUtJLENBQUMsRUFBRTlFLEtBQUtiLFFBQVEsRUFBRXVGLEtBQUtJLENBQUM7Z0JBQzlEO2dCQUVBLFNBQVNHLGtCQUFrQjFCLEdBQUcsRUFBRTJCLEVBQUUsRUFBRUMsRUFBRSxFQUFFaEcsUUFBUSxFQUFFRCxLQUFLO29CQUNyRCxJQUFJNkYscUJBQXFCNUYsVUFBVStGLElBQUlDLEtBQUs7d0JBQzFDO29CQUNGO29CQUVBLElBQUlDLEtBQUtqRyxTQUFTa0csUUFBUSxDQUFDbkc7b0JBQzNCLElBQUlvRyxLQUFLbEMsU0FBUytCLElBQUlDLElBQUlGO29CQUMxQixJQUFJSSxPQUFPbkMsWUFBWW9DLFNBQVMsRUFBRTt3QkFDaEMsK0NBQStDO3dCQUMvQyx1REFBdUQ7d0JBQ3ZELE1BQU0sSUFBSW5ELFdBQVcsZ0RBQWdEOzRCQUFDK0M7NEJBQUlDOzRCQUFJRjt5QkFBRztvQkFDbkY7b0JBRUEsSUFBSU0sS0FBS3JHLFNBQVNzRyxPQUFPLENBQUN2RztvQkFDMUIsSUFBSXdHLEtBQUt0QyxTQUFTK0IsSUFBSUssSUFBSU47b0JBQzFCLElBQUlRLE9BQU92QyxZQUFZb0MsU0FBUyxFQUFFO3dCQUNoQywrQ0FBK0M7d0JBQy9DLHVEQUF1RDt3QkFDdkQsTUFBTSxJQUFJbkQsV0FBVyxnREFBZ0Q7NEJBQUMrQzs0QkFBSUs7NEJBQUlOO3lCQUFHO29CQUNuRjtvQkFFQSxJQUFJSSxPQUFPSSxJQUFJO3dCQUNiLG1FQUFtRTt3QkFDbkUsdUJBQXVCO3dCQUN2QixJQUFJSixPQUFPbkMsWUFBWXdDLEVBQUUsRUFBRTs0QkFDekJ4RyxXQUFXQSxTQUFTaUYsV0FBVyxDQUFDbEY7d0JBQ2xDLE9BQU87NEJBQ0xDLFdBQVdBLFNBQVN5RyxVQUFVLENBQUMxRzt3QkFDakM7d0JBQ0ErRixrQkFBa0IxQixLQUFLMkIsSUFBSUMsSUFBSWhHLFVBQVVEO29CQUMzQyxPQUFPO3dCQUNMLDBEQUEwRDt3QkFDMUQyRyxjQUFjdEMsS0FBSzJCLElBQUlDLElBQUloRyxVQUFVRDtvQkFDdkM7Z0JBQ0Y7Z0JBRUEsU0FBUzZGLHFCQUFxQjVGLFFBQVEsRUFBRStGLEVBQUUsRUFBRUMsRUFBRTtvQkFDNUMsSUFBSVcsUUFBUTNHLFNBQVM0RyxTQUFTLENBQUNiLElBQUlDO29CQUNuQyxJQUFJVyxVQUFVLENBQUMsR0FBRzt3QkFDaEIzRyxTQUFTNkcsMEJBQTBCLENBQUNGO3dCQUNwQyxJQUFJM0gsSUFBSWdCLFNBQVM4RyxXQUFXLENBQUNIO3dCQUM3QixJQUFJM0gsR0FBRzs0QkFDTEEsRUFBRStILDJCQUEyQixDQUFDaEIsSUFBSUM7d0JBQ3BDO3dCQUNBLE9BQU87b0JBQ1Q7b0JBQ0EsT0FBTztnQkFDVDtnQkFFQTs7O0dBR0MsR0FDRCxTQUFTWixpQkFBaUJoQixHQUFHLEVBQUVyRSxLQUFLLEVBQUVjLElBQUk7b0JBQ3hDLElBQUliLFdBQVcsSUFBSXlELFNBQVMxRCxPQUFPYyxLQUFLZCxLQUFLLEVBQUVjLEtBQUtaLElBQUksQ0FBQ0YsS0FBSztvQkFFOURDLFNBQVNnSCxZQUFZLENBQUNuRyxLQUFLYixRQUFRO29CQUNuQ29FLElBQUk2QyxRQUFRLENBQUNqSDtvQkFFYixJQUFJbUYsV0FBVyxJQUFJdEYsS0FBS0U7b0JBQ3hCb0YsU0FBU2xGLElBQUksR0FBR1ksS0FBS1osSUFBSTtvQkFDekJrRixTQUFTakYsSUFBSSxHQUFHVztvQkFDaEJBLEtBQUtaLElBQUksQ0FBQ0MsSUFBSSxHQUFHaUY7b0JBQ2pCdEUsS0FBS1osSUFBSSxHQUFHa0Y7b0JBRVosSUFBSSxDQUFDK0IsU0FBUzlDLEtBQUtwRSxXQUFXO3dCQUM1Qm9FLElBQUkrQyxrQkFBa0IsQ0FBQ25IO29CQUN6QjtvQkFFQSxPQUFPbUY7Z0JBQ1Q7Z0JBRUE7Ozs7R0FJQyxHQUNELFNBQVNFLEtBQUtqQixHQUFHLEVBQUV2RCxJQUFJO29CQUNyQixJQUFJYixXQUFXLElBQUl5RCxTQUFTNUMsS0FBS1gsSUFBSSxDQUFDSCxLQUFLLEVBQUVjLEtBQUtkLEtBQUssRUFBRWMsS0FBS1osSUFBSSxDQUFDRixLQUFLO29CQUV4RSx1RUFBdUU7b0JBQ3ZFLHVFQUF1RTtvQkFDdkVDLFNBQVNnSCxZQUFZLENBQUNuRyxLQUFLWCxJQUFJLENBQUNGLFFBQVE7b0JBQ3hDQSxTQUFTZ0gsWUFBWSxDQUFDbkcsS0FBS2IsUUFBUTtvQkFFbkNvRSxJQUFJNkMsUUFBUSxDQUFDakg7b0JBRWIsNkJBQTZCO29CQUM3QmEsS0FBS1gsSUFBSSxDQUFDRCxJQUFJLEdBQUdZLEtBQUtaLElBQUk7b0JBQzFCWSxLQUFLWixJQUFJLENBQUNDLElBQUksR0FBR1csS0FBS1gsSUFBSTtvQkFHMUIsMkRBQTJEO29CQUMzRCxJQUFJLENBQUNnSCxTQUFTOUMsS0FBS3BFLFdBQVc7d0JBQzVCb0UsSUFBSStDLGtCQUFrQixDQUFDbkg7b0JBQ3pCO2dCQUVBLHVCQUF1QjtnQkFDekI7Z0JBRUE7OztHQUdDLEdBQ0QsU0FBU3NGLG1CQUFtQmxCLEdBQUcsRUFBRW5GLENBQUM7b0JBQ2hDLG1CQUFtQjtvQkFDbkIsSUFBSTRCLE9BQU81QixFQUFFZ0IsSUFBSTtvQkFDakIsTUFBT1ksS0FBS1osSUFBSSxDQUFFO3dCQUNoQiwrQ0FBK0M7d0JBQy9DLHVEQUF1RDt3QkFDdkQsSUFBSWtFLGNBQWN0RCxLQUFLZCxLQUFLLEVBQUVjLEtBQUtaLElBQUksQ0FBQ0YsS0FBSyxFQUFFYyxLQUFLWCxJQUFJLENBQUNILEtBQUssR0FBRzs0QkFDL0Q7d0JBQ0Y7d0JBQ0FzRixLQUFLakIsS0FBS3ZEO3dCQUNWQSxPQUFPQSxLQUFLWixJQUFJO29CQUNsQjtvQkFFQSxrQkFBa0I7b0JBQ2xCWSxPQUFPNUIsRUFBRWlCLElBQUk7b0JBQ2IsTUFBT1csS0FBS1gsSUFBSSxDQUFFO3dCQUNoQiwrQ0FBK0M7d0JBQy9DLHVEQUF1RDt3QkFDdkQsSUFBSWlFLGNBQWN0RCxLQUFLZCxLQUFLLEVBQUVjLEtBQUtaLElBQUksQ0FBQ0YsS0FBSyxFQUFFYyxLQUFLWCxJQUFJLENBQUNILEtBQUssR0FBRzs0QkFDL0Q7d0JBQ0Y7d0JBQ0FzRixLQUFLakIsS0FBS3ZEO3dCQUNWQSxPQUFPQSxLQUFLWCxJQUFJO29CQUNsQjtvQkFFQSxvQkFBb0I7b0JBQ3BCLElBQUlqQixFQUFFZ0IsSUFBSSxJQUFJaEIsRUFBRWdCLElBQUksQ0FBQ0EsSUFBSSxFQUFFO3dCQUN6QixJQUFJbUgsa0JBQWtCbkksSUFBSTs0QkFDeEJvSSxVQUFVakQsS0FBS25GO3dCQUNqQjtvQkFDRjtnQkFDRjtnQkFFQTs7OztHQUlDLEdBQ0QsU0FBU21JLGtCQUFrQnZHLElBQUk7b0JBQzdCLElBQUl5RyxLQUFLekcsS0FBS2QsS0FBSyxDQUFDSyxDQUFDLEdBQUdTLEtBQUtaLElBQUksQ0FBQ0EsSUFBSSxDQUFDRixLQUFLLENBQUNLLENBQUM7b0JBQzlDLElBQUltSCxLQUFLMUcsS0FBS2QsS0FBSyxDQUFDNEIsQ0FBQyxHQUFHZCxLQUFLWixJQUFJLENBQUNBLElBQUksQ0FBQ0YsS0FBSyxDQUFDNEIsQ0FBQztvQkFDOUNMLE9BQU9pRyxNQUFNLEdBQUc7b0JBQ2hCLE9BQVFELE1BQU0sS0FBSy9FLEtBQUtpRixHQUFHLENBQUNGLE1BQU1DO2dCQUNwQztnQkFFQTs7OztHQUlDLEdBQ0QsU0FBU0wsU0FBUzlDLEdBQUcsRUFBRXBGLENBQUM7b0JBQ3RCLHVFQUF1RTtvQkFDdkUsaUNBQWlDO29CQUNqQyxJQUFLLElBQUlRLElBQUksR0FBR0EsSUFBSSxHQUFHLEVBQUVBLEVBQUc7d0JBQzFCLElBQUlSLEVBQUV5SSxhQUFhLENBQUNqSSxFQUFFLEVBQUU7NEJBQ3RCO3dCQUNGO3dCQUNBLElBQUlrSSxLQUFLMUksRUFBRThILFdBQVcsQ0FBQ3RIO3dCQUN2QixJQUFJa0ksSUFBSTs0QkFDTixJQUFJNUgsSUFBSWQsRUFBRTBGLFFBQVEsQ0FBQ2xGOzRCQUNuQixJQUFJbUksS0FBS0QsR0FBR0UsYUFBYSxDQUFDNUksR0FBR2M7NEJBQzdCLElBQUkrSCxLQUFLSCxHQUFHZixLQUFLLENBQUNnQjs0QkFFbEIsdUZBQXVGOzRCQUN2RixxQ0FBcUM7NEJBQ3JDLElBQUlELEdBQUdqQyxnQkFBZ0IsQ0FBQ29DLEdBQUcsSUFBSUgsR0FBR0QsYUFBYSxDQUFDSSxHQUFHLEVBQUU7Z0NBQ25EN0ksRUFBRXlHLGdCQUFnQixDQUFDakcsRUFBRSxHQUFHa0ksR0FBR2pDLGdCQUFnQixDQUFDb0MsR0FBRztnQ0FDL0M7NEJBQ0Y7NEJBRUEsSUFBSUMsU0FBU0MsU0FBU2pJLEdBQUdkLEVBQUVrSCxRQUFRLENBQUNwRyxJQUFJZCxFQUFFc0gsT0FBTyxDQUFDeEcsSUFBSTZIOzRCQUN0RCxJQUFJRyxRQUFRO2dDQUNWLHlDQUF5QztnQ0FDekM5SSxFQUFFeUksYUFBYSxDQUFDakksRUFBRSxHQUFHO2dDQUNyQmtJLEdBQUdELGFBQWEsQ0FBQ0ksR0FBRyxHQUFHO2dDQUV2Qix1REFBdUQ7Z0NBQ3ZERyxtQkFBbUJoSixHQUFHYyxHQUFHNEgsSUFBSUM7Z0NBRTdCLDZEQUE2RDtnQ0FDN0Qsa0RBQWtEO2dDQUVsRCx3RkFBd0Y7Z0NBQ3hGLElBQUlNLGdCQUFnQixDQUFDZixTQUFTOUMsS0FBS3BGO2dDQUNuQyxJQUFJaUosZUFBZTtvQ0FDakI3RCxJQUFJK0Msa0JBQWtCLENBQUNuSTtnQ0FDekI7Z0NBRUFpSixnQkFBZ0IsQ0FBQ2YsU0FBUzlDLEtBQUtzRDtnQ0FDL0IsSUFBSU8sZUFBZTtvQ0FDakI3RCxJQUFJK0Msa0JBQWtCLENBQUNPO2dDQUN6QjtnQ0FDQSxxRUFBcUU7Z0NBQ3JFLHdDQUF3QztnQ0FDeEMsbUVBQW1FO2dDQUNuRSwyQ0FBMkM7Z0NBQzNDMUksRUFBRXlJLGFBQWEsQ0FBQ2pJLEVBQUUsR0FBRztnQ0FDckJrSSxHQUFHRCxhQUFhLENBQUNJLEdBQUcsR0FBRztnQ0FFdkIseUVBQXlFO2dDQUN6RSxvRUFBb0U7Z0NBQ3BFLE9BQU87NEJBQ1Q7d0JBQ0Y7b0JBQ0Y7b0JBQ0EsT0FBTztnQkFDVDtnQkFFQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0F1QkMsR0FDRCxTQUFTRSxTQUFTRyxFQUFFLEVBQUVDLEVBQUUsRUFBRUMsRUFBRSxFQUFFQyxFQUFFO29CQUM5QixJQUFJQyxNQUFNSixHQUFHOUgsQ0FBQyxHQUFHaUksR0FBR2pJLENBQUM7b0JBQ3JCLElBQUltSSxNQUFNTCxHQUFHdkcsQ0FBQyxHQUFHMEcsR0FBRzFHLENBQUM7b0JBQ3JCLElBQUk2RyxNQUFNTCxHQUFHL0gsQ0FBQyxHQUFHaUksR0FBR2pJLENBQUM7b0JBQ3JCLElBQUlxSSxNQUFNTixHQUFHeEcsQ0FBQyxHQUFHMEcsR0FBRzFHLENBQUM7b0JBRXJCLElBQUkrRyxTQUFTSixNQUFNRztvQkFDbkIsSUFBSUUsU0FBU0gsTUFBTUQ7b0JBQ25CLElBQUlLLE9BQU9GLFNBQVNDO29CQUNwQixJQUFJQyxRQUFRLEdBQUc7d0JBQ2IsT0FBTztvQkFDVDtvQkFFQSxJQUFJQyxNQUFNVCxHQUFHaEksQ0FBQyxHQUFHaUksR0FBR2pJLENBQUM7b0JBQ3JCLElBQUkwSSxNQUFNVixHQUFHekcsQ0FBQyxHQUFHMEcsR0FBRzFHLENBQUM7b0JBRXJCLElBQUlvSCxTQUFTRixNQUFNTjtvQkFDbkIsSUFBSVMsU0FBU1YsTUFBTVE7b0JBQ25CLElBQUlHLE9BQU9GLFNBQVNDO29CQUNwQixJQUFJQyxRQUFRLEdBQUc7d0JBQ2IsT0FBTztvQkFDVDtvQkFFQSxJQUFJQyxTQUFTVixNQUFNTTtvQkFDbkIsSUFBSUssU0FBU04sTUFBTUo7b0JBRW5CLElBQUlXLFFBQVFkLE1BQU1BLE1BQU1DLE1BQU1BO29CQUM5QixJQUFJYyxRQUFRYixNQUFNQSxNQUFNQyxNQUFNQTtvQkFDOUIsSUFBSWEsUUFBUVQsTUFBTUEsTUFBTUMsTUFBTUE7b0JBRTlCLElBQUlTLE1BQU1ILFFBQVNGLENBQUFBLFNBQVNDLE1BQUssSUFBS0UsUUFBUUosT0FBT0ssUUFBUVY7b0JBQzdELE9BQU9XLE1BQU07Z0JBQ2Y7Z0JBRUE7Ozs7Ozs7Ozs7Ozs7R0FhQyxHQUNELFNBQVN2QixtQkFBbUJoSixDQUFDLEVBQUVjLENBQUMsRUFBRTRILEVBQUUsRUFBRUMsRUFBRTtvQkFDdEMsSUFBSTZCLElBQUlDLElBQUlDLElBQUlDO29CQUNoQkgsS0FBS3hLLEVBQUVpRyxXQUFXLENBQUNuRjtvQkFDbkIySixLQUFLekssRUFBRXlILFVBQVUsQ0FBQzNHO29CQUNsQjRKLEtBQUtoQyxHQUFHekMsV0FBVyxDQUFDMEM7b0JBQ3BCZ0MsS0FBS2pDLEdBQUdqQixVQUFVLENBQUNrQjtvQkFFbkIsSUFBSWlDLEtBQUtDLEtBQUtDLEtBQUtDO29CQUNuQkgsTUFBTTVLLEVBQUVnTCxxQkFBcUIsQ0FBQ2xLO29CQUM5QitKLE1BQU03SyxFQUFFZ0csb0JBQW9CLENBQUNsRjtvQkFDN0JnSyxNQUFNcEMsR0FBR3NDLHFCQUFxQixDQUFDckM7b0JBQy9Cb0MsTUFBTXJDLEdBQUcxQyxvQkFBb0IsQ0FBQzJDO29CQUU5QixJQUFJc0MsS0FBS0MsS0FBS0MsS0FBS0M7b0JBQ25CSCxNQUFNakwsRUFBRXFMLGtCQUFrQixDQUFDdks7b0JBQzNCb0ssTUFBTWxMLEVBQUVzTCxpQkFBaUIsQ0FBQ3hLO29CQUMxQnFLLE1BQU16QyxHQUFHMkMsa0JBQWtCLENBQUMxQztvQkFDNUJ5QyxNQUFNMUMsR0FBRzRDLGlCQUFpQixDQUFDM0M7b0JBRTNCM0ksRUFBRWtJLFFBQVEsQ0FBQ3BILEdBQUc2SDtvQkFDZEQsR0FBR1IsUUFBUSxDQUFDUyxJQUFJN0g7b0JBRWhCLHNCQUFzQjtvQkFDdEI0SCxHQUFHNkMsa0JBQWtCLENBQUN6SyxHQUFHbUs7b0JBQ3pCakwsRUFBRXdMLGlCQUFpQixDQUFDMUssR0FBR29LO29CQUN2QmxMLEVBQUV1TCxrQkFBa0IsQ0FBQzVDLElBQUl3QztvQkFDekJ6QyxHQUFHOEMsaUJBQWlCLENBQUM3QyxJQUFJeUM7b0JBRXpCLHlCQUF5QjtvQkFDekIxQyxHQUFHK0MscUJBQXFCLENBQUMzSyxHQUFHOEo7b0JBQzVCNUssRUFBRTBMLG9CQUFvQixDQUFDNUssR0FBRytKO29CQUMxQjdLLEVBQUV5TCxxQkFBcUIsQ0FBQzlDLElBQUltQztvQkFDNUJwQyxHQUFHZ0Qsb0JBQW9CLENBQUMvQyxJQUFJb0M7b0JBRTVCLGtCQUFrQjtvQkFDbEIsMkRBQTJEO29CQUMzRCwrREFBK0Q7b0JBQy9ELGdFQUFnRTtvQkFDaEUsdUJBQXVCO29CQUN2Qi9LLEVBQUUyTCxjQUFjO29CQUNoQmpELEdBQUdpRCxjQUFjO29CQUNqQixJQUFJbkIsSUFBSTt3QkFDTjlCLEdBQUdWLFlBQVksQ0FBQ3dDO29CQUNsQjtvQkFDQSxJQUFJQyxJQUFJO3dCQUNOekssRUFBRWdJLFlBQVksQ0FBQ3lDO29CQUNqQjtvQkFDQSxJQUFJQyxJQUFJO3dCQUNOMUssRUFBRWdJLFlBQVksQ0FBQzBDO29CQUNqQjtvQkFDQSxJQUFJQyxJQUFJO3dCQUNOakMsR0FBR1YsWUFBWSxDQUFDMkM7b0JBQ2xCO29CQUNBM0ssRUFBRWdJLFlBQVksQ0FBQ1U7Z0JBQ2pCO2dCQUVBOzs7Ozs7OztHQVFDLEdBQ0QsU0FBU0wsVUFBVWpELEdBQUcsRUFBRXZELElBQUk7b0JBQzFCLElBQUlvRCxTQUFTcEQsS0FBS2QsS0FBSyxFQUFFYyxLQUFLWixJQUFJLENBQUNGLEtBQUssRUFBRWMsS0FBS1osSUFBSSxDQUFDQSxJQUFJLENBQUNGLEtBQUssTUFBTWlFLFlBQVk0RyxHQUFHLEVBQUU7d0JBQ25GeEcsSUFBSXlHLEtBQUssQ0FBQ0MsU0FBUyxHQUFHakssS0FBS1osSUFBSSxDQUFDQSxJQUFJO29CQUN0QyxPQUFPO3dCQUNMbUUsSUFBSXlHLEtBQUssQ0FBQ0MsU0FBUyxHQUFHakssS0FBS1osSUFBSTtvQkFDakM7b0JBRUEsaUNBQWlDO29CQUNqQ21FLElBQUl5RyxLQUFLLENBQUNFLFdBQVcsR0FBRzNHLElBQUl5RyxLQUFLLENBQUNDLFNBQVM7b0JBQzNDLE1BQU8xRyxJQUFJeUcsS0FBSyxDQUFDRSxXQUFXLENBQUM5SyxJQUFJLElBQUltRSxJQUFJeUcsS0FBSyxDQUFDRSxXQUFXLENBQUNoTCxLQUFLLENBQUM0QixDQUFDLElBQUl5QyxJQUFJeUcsS0FBSyxDQUFDRSxXQUFXLENBQUM5SyxJQUFJLENBQUNGLEtBQUssQ0FBQzRCLENBQUMsQ0FBRTt3QkFDeEd5QyxJQUFJeUcsS0FBSyxDQUFDRSxXQUFXLEdBQUczRyxJQUFJeUcsS0FBSyxDQUFDRSxXQUFXLENBQUM5SyxJQUFJO29CQUNwRDtvQkFDQSxJQUFJbUUsSUFBSXlHLEtBQUssQ0FBQ0UsV0FBVyxLQUFLM0csSUFBSXlHLEtBQUssQ0FBQ0MsU0FBUyxFQUFFO3dCQUNqRCxpQkFBaUI7d0JBQ2pCO29CQUNGO29CQUVBMUcsSUFBSXlHLEtBQUssQ0FBQ0csVUFBVSxHQUFHNUcsSUFBSXlHLEtBQUssQ0FBQ0UsV0FBVztvQkFDNUMsTUFBTzNHLElBQUl5RyxLQUFLLENBQUNHLFVBQVUsQ0FBQy9LLElBQUksSUFBSW1FLElBQUl5RyxLQUFLLENBQUNHLFVBQVUsQ0FBQ2pMLEtBQUssQ0FBQzRCLENBQUMsR0FBR3lDLElBQUl5RyxLQUFLLENBQUNHLFVBQVUsQ0FBQy9LLElBQUksQ0FBQ0YsS0FBSyxDQUFDNEIsQ0FBQyxDQUFFO3dCQUNwR3lDLElBQUl5RyxLQUFLLENBQUNHLFVBQVUsR0FBRzVHLElBQUl5RyxLQUFLLENBQUNHLFVBQVUsQ0FBQy9LLElBQUk7b0JBQ2xEO29CQUNBLElBQUltRSxJQUFJeUcsS0FBSyxDQUFDRyxVQUFVLEtBQUs1RyxJQUFJeUcsS0FBSyxDQUFDRSxXQUFXLEVBQUU7d0JBQ2xELGtCQUFrQjt3QkFDbEI7b0JBQ0Y7b0JBRUEzRyxJQUFJeUcsS0FBSyxDQUFDSSxLQUFLLEdBQUc3RyxJQUFJeUcsS0FBSyxDQUFDRyxVQUFVLENBQUNqTCxLQUFLLENBQUNLLENBQUMsR0FBR2dFLElBQUl5RyxLQUFLLENBQUNDLFNBQVMsQ0FBQy9LLEtBQUssQ0FBQ0ssQ0FBQztvQkFDNUVnRSxJQUFJeUcsS0FBSyxDQUFDSyxZQUFZLEdBQUc5RyxJQUFJeUcsS0FBSyxDQUFDQyxTQUFTLENBQUMvSyxLQUFLLENBQUM0QixDQUFDLEdBQUd5QyxJQUFJeUcsS0FBSyxDQUFDRyxVQUFVLENBQUNqTCxLQUFLLENBQUM0QixDQUFDO29CQUVuRndKLGFBQWEvRyxLQUFLQSxJQUFJeUcsS0FBSyxDQUFDRSxXQUFXO2dCQUN6QztnQkFFQTs7Ozs7R0FLQyxHQUNELFNBQVNJLGFBQWEvRyxHQUFHLEVBQUV2RCxJQUFJO29CQUM3QiwwQkFBMEI7b0JBQzFCLElBQUl1SyxVQUFVaEgsS0FBS3ZELE9BQU87d0JBQ3hCO29CQUNGO29CQUVBd0UsS0FBS2pCLEtBQUt2RDtvQkFFVixJQUFJekI7b0JBQ0osSUFBSXlCLEtBQUtYLElBQUksS0FBS2tFLElBQUl5RyxLQUFLLENBQUNDLFNBQVMsSUFBSWpLLEtBQUtaLElBQUksS0FBS21FLElBQUl5RyxLQUFLLENBQUNHLFVBQVUsRUFBRTt3QkFDM0U7b0JBQ0YsT0FBTyxJQUFJbkssS0FBS1gsSUFBSSxLQUFLa0UsSUFBSXlHLEtBQUssQ0FBQ0MsU0FBUyxFQUFFO3dCQUM1QzFMLElBQUk2RSxTQUFTcEQsS0FBS2QsS0FBSyxFQUFFYyxLQUFLWixJQUFJLENBQUNGLEtBQUssRUFBRWMsS0FBS1osSUFBSSxDQUFDQSxJQUFJLENBQUNGLEtBQUs7d0JBQzlELElBQUlYLE1BQU00RSxZQUFZd0MsRUFBRSxFQUFFOzRCQUN4Qjt3QkFDRjt3QkFDQTNGLE9BQU9BLEtBQUtaLElBQUk7b0JBQ2xCLE9BQU8sSUFBSVksS0FBS1osSUFBSSxLQUFLbUUsSUFBSXlHLEtBQUssQ0FBQ0csVUFBVSxFQUFFO3dCQUM3QzVMLElBQUk2RSxTQUFTcEQsS0FBS2QsS0FBSyxFQUFFYyxLQUFLWCxJQUFJLENBQUNILEtBQUssRUFBRWMsS0FBS1gsSUFBSSxDQUFDQSxJQUFJLENBQUNILEtBQUs7d0JBQzlELElBQUlYLE1BQU00RSxZQUFZNEcsR0FBRyxFQUFFOzRCQUN6Qjt3QkFDRjt3QkFDQS9KLE9BQU9BLEtBQUtYLElBQUk7b0JBQ2xCLE9BQU87d0JBQ0wsc0RBQXNEO3dCQUN0RCxJQUFJVyxLQUFLWCxJQUFJLENBQUNILEtBQUssQ0FBQzRCLENBQUMsR0FBR2QsS0FBS1osSUFBSSxDQUFDRixLQUFLLENBQUM0QixDQUFDLEVBQUU7NEJBQ3pDZCxPQUFPQSxLQUFLWCxJQUFJO3dCQUNsQixPQUFPOzRCQUNMVyxPQUFPQSxLQUFLWixJQUFJO3dCQUNsQjtvQkFDRjtvQkFFQWtMLGFBQWEvRyxLQUFLdkQ7Z0JBQ3BCO2dCQUVBLFNBQVN1SyxVQUFVaEgsR0FBRyxFQUFFdkQsSUFBSTtvQkFDMUIsSUFBSXdLO29CQUNKLElBQUlqSCxJQUFJeUcsS0FBSyxDQUFDSyxZQUFZLEVBQUU7d0JBQzFCRyxTQUFTakgsSUFBSXlHLEtBQUssQ0FBQ0MsU0FBUyxDQUFDL0ssS0FBSyxDQUFDNEIsQ0FBQyxHQUFHZCxLQUFLZCxLQUFLLENBQUM0QixDQUFDO29CQUNyRCxPQUFPO3dCQUNMMEosU0FBU2pILElBQUl5RyxLQUFLLENBQUNHLFVBQVUsQ0FBQ2pMLEtBQUssQ0FBQzRCLENBQUMsR0FBR2QsS0FBS2QsS0FBSyxDQUFDNEIsQ0FBQztvQkFDdEQ7b0JBRUEsMEJBQTBCO29CQUMxQixJQUFJeUMsSUFBSXlHLEtBQUssQ0FBQ0ksS0FBSyxHQUFHSSxRQUFRO3dCQUM1QixPQUFPO29CQUNUO29CQUNBLE9BQU87Z0JBQ1Q7Z0JBRUEsU0FBU3hGLGNBQWN6QixHQUFHLEVBQUVtQixJQUFJLEVBQUUxRSxJQUFJO29CQUNwQyxJQUFJdUQsSUFBSW9CLFVBQVUsQ0FBQ0UsS0FBSyxFQUFFO3dCQUN4QjRGLHdCQUF3QmxILEtBQUttQixNQUFNMUU7b0JBQ3JDLE9BQU87d0JBQ0wwSyx1QkFBdUJuSCxLQUFLbUIsTUFBTTFFO29CQUNwQztnQkFDRjtnQkFFQSxTQUFTeUssd0JBQXdCbEgsR0FBRyxFQUFFbUIsSUFBSSxFQUFFMUUsSUFBSTtvQkFDOUMsTUFBT0EsS0FBS1osSUFBSSxDQUFDRixLQUFLLENBQUNLLENBQUMsR0FBR21GLEtBQUt6RixDQUFDLENBQUNNLENBQUMsQ0FBRTt3QkFDbkMsdUNBQXVDO3dCQUN2QyxJQUFJNkQsU0FBU3NCLEtBQUtJLENBQUMsRUFBRTlFLEtBQUtaLElBQUksQ0FBQ0YsS0FBSyxFQUFFd0YsS0FBS3pGLENBQUMsTUFBTWtFLFlBQVk0RyxHQUFHLEVBQUU7NEJBQ2pFWSx3QkFBd0JwSCxLQUFLbUIsTUFBTTFFO3dCQUNyQyxPQUFPOzRCQUNMQSxPQUFPQSxLQUFLWixJQUFJO3dCQUNsQjtvQkFDRjtnQkFDRjtnQkFFQSxTQUFTdUwsd0JBQXdCcEgsR0FBRyxFQUFFbUIsSUFBSSxFQUFFMUUsSUFBSTtvQkFDOUMsSUFBSUEsS0FBS2QsS0FBSyxDQUFDSyxDQUFDLEdBQUdtRixLQUFLekYsQ0FBQyxDQUFDTSxDQUFDLEVBQUU7d0JBQzNCLElBQUk2RCxTQUFTcEQsS0FBS2QsS0FBSyxFQUFFYyxLQUFLWixJQUFJLENBQUNGLEtBQUssRUFBRWMsS0FBS1osSUFBSSxDQUFDQSxJQUFJLENBQUNGLEtBQUssTUFBTWlFLFlBQVk0RyxHQUFHLEVBQUU7NEJBQ25GLFVBQVU7NEJBQ1ZhLDBCQUEwQnJILEtBQUttQixNQUFNMUU7d0JBQ3ZDLE9BQU87NEJBQ0wsU0FBUzs0QkFDVDZLLHlCQUF5QnRILEtBQUttQixNQUFNMUU7NEJBQ3BDLGlCQUFpQjs0QkFDakIySyx3QkFBd0JwSCxLQUFLbUIsTUFBTTFFO3dCQUNyQztvQkFDRjtnQkFDRjtnQkFFQSxTQUFTNEssMEJBQTBCckgsR0FBRyxFQUFFbUIsSUFBSSxFQUFFMUUsSUFBSTtvQkFDaER3RSxLQUFLakIsS0FBS3ZELEtBQUtaLElBQUk7b0JBQ25CLElBQUlZLEtBQUtaLElBQUksQ0FBQ0YsS0FBSyxLQUFLd0YsS0FBS3pGLENBQUMsRUFBRTt3QkFDOUIsNEJBQTRCO3dCQUM1QixJQUFJbUUsU0FBU3NCLEtBQUtJLENBQUMsRUFBRTlFLEtBQUtaLElBQUksQ0FBQ0YsS0FBSyxFQUFFd0YsS0FBS3pGLENBQUMsTUFBTWtFLFlBQVk0RyxHQUFHLEVBQUU7NEJBQ2pFLFFBQVE7NEJBQ1IsSUFBSTNHLFNBQVNwRCxLQUFLZCxLQUFLLEVBQUVjLEtBQUtaLElBQUksQ0FBQ0YsS0FBSyxFQUFFYyxLQUFLWixJQUFJLENBQUNBLElBQUksQ0FBQ0YsS0FBSyxNQUFNaUUsWUFBWTRHLEdBQUcsRUFBRTtnQ0FDbkYsa0JBQWtCO2dDQUNsQmEsMEJBQTBCckgsS0FBS21CLE1BQU0xRTs0QkFDdkMsT0FBTzs0QkFDTCxpQkFBaUI7NEJBQ2pCLHdCQUF3QixHQUMxQjt3QkFDRjtvQkFDRjtnQkFDRjtnQkFFQSxTQUFTNksseUJBQXlCdEgsR0FBRyxFQUFFbUIsSUFBSSxFQUFFMUUsSUFBSTtvQkFDL0MsMEJBQTBCO29CQUMxQixJQUFJb0QsU0FBU3BELEtBQUtaLElBQUksQ0FBQ0YsS0FBSyxFQUFFYyxLQUFLWixJQUFJLENBQUNBLElBQUksQ0FBQ0YsS0FBSyxFQUFFYyxLQUFLWixJQUFJLENBQUNBLElBQUksQ0FBQ0EsSUFBSSxDQUFDRixLQUFLLE1BQU1pRSxZQUFZNEcsR0FBRyxFQUFFO3dCQUNsRyxVQUFVO3dCQUNWYSwwQkFBMEJySCxLQUFLbUIsTUFBTTFFLEtBQUtaLElBQUk7b0JBQ2hELE9BQU87d0JBQ0wsU0FBUzt3QkFDVCw0QkFBNEI7d0JBQzVCLElBQUlnRSxTQUFTc0IsS0FBS0ksQ0FBQyxFQUFFOUUsS0FBS1osSUFBSSxDQUFDQSxJQUFJLENBQUNGLEtBQUssRUFBRXdGLEtBQUt6RixDQUFDLE1BQU1rRSxZQUFZNEcsR0FBRyxFQUFFOzRCQUN0RSxRQUFROzRCQUNSYyx5QkFBeUJ0SCxLQUFLbUIsTUFBTTFFLEtBQUtaLElBQUk7d0JBQy9DLE9BQU87d0JBQ0wsUUFBUTt3QkFDUix3QkFBd0IsR0FDMUI7b0JBQ0Y7Z0JBQ0Y7Z0JBRUEsU0FBU3NMLHVCQUF1Qm5ILEdBQUcsRUFBRW1CLElBQUksRUFBRTFFLElBQUk7b0JBQzdDLE1BQU9BLEtBQUtYLElBQUksQ0FBQ0gsS0FBSyxDQUFDSyxDQUFDLEdBQUdtRixLQUFLekYsQ0FBQyxDQUFDTSxDQUFDLENBQUU7d0JBQ25DLHVDQUF1Qzt3QkFDdkMsSUFBSTZELFNBQVNzQixLQUFLSSxDQUFDLEVBQUU5RSxLQUFLWCxJQUFJLENBQUNILEtBQUssRUFBRXdGLEtBQUt6RixDQUFDLE1BQU1rRSxZQUFZd0MsRUFBRSxFQUFFOzRCQUNoRW1GLHVCQUF1QnZILEtBQUttQixNQUFNMUU7d0JBQ3BDLE9BQU87NEJBQ0xBLE9BQU9BLEtBQUtYLElBQUk7d0JBQ2xCO29CQUNGO2dCQUNGO2dCQUVBLFNBQVN5TCx1QkFBdUJ2SCxHQUFHLEVBQUVtQixJQUFJLEVBQUUxRSxJQUFJO29CQUM3QyxJQUFJQSxLQUFLZCxLQUFLLENBQUNLLENBQUMsR0FBR21GLEtBQUt6RixDQUFDLENBQUNNLENBQUMsRUFBRTt3QkFDM0IsSUFBSTZELFNBQVNwRCxLQUFLZCxLQUFLLEVBQUVjLEtBQUtYLElBQUksQ0FBQ0gsS0FBSyxFQUFFYyxLQUFLWCxJQUFJLENBQUNBLElBQUksQ0FBQ0gsS0FBSyxNQUFNaUUsWUFBWXdDLEVBQUUsRUFBRTs0QkFDbEYsVUFBVTs0QkFDVm9GLHlCQUF5QnhILEtBQUttQixNQUFNMUU7d0JBQ3RDLE9BQU87NEJBQ0wsU0FBUzs0QkFDVGdMLHdCQUF3QnpILEtBQUttQixNQUFNMUU7NEJBQ25DLGlCQUFpQjs0QkFDakI4Syx1QkFBdUJ2SCxLQUFLbUIsTUFBTTFFO3dCQUNwQztvQkFDRjtnQkFDRjtnQkFFQSxTQUFTZ0wsd0JBQXdCekgsR0FBRyxFQUFFbUIsSUFBSSxFQUFFMUUsSUFBSTtvQkFDOUMsMEJBQTBCO29CQUMxQixJQUFJb0QsU0FBU3BELEtBQUtYLElBQUksQ0FBQ0gsS0FBSyxFQUFFYyxLQUFLWCxJQUFJLENBQUNBLElBQUksQ0FBQ0gsS0FBSyxFQUFFYyxLQUFLWCxJQUFJLENBQUNBLElBQUksQ0FBQ0EsSUFBSSxDQUFDSCxLQUFLLE1BQU1pRSxZQUFZd0MsRUFBRSxFQUFFO3dCQUNqRyxVQUFVO3dCQUNWb0YseUJBQXlCeEgsS0FBS21CLE1BQU0xRSxLQUFLWCxJQUFJO29CQUMvQyxPQUFPO3dCQUNMLFNBQVM7d0JBQ1QsNEJBQTRCO3dCQUM1QixJQUFJK0QsU0FBU3NCLEtBQUtJLENBQUMsRUFBRTlFLEtBQUtYLElBQUksQ0FBQ0EsSUFBSSxDQUFDSCxLQUFLLEVBQUV3RixLQUFLekYsQ0FBQyxNQUFNa0UsWUFBWXdDLEVBQUUsRUFBRTs0QkFDckUsUUFBUTs0QkFDUnFGLHdCQUF3QnpILEtBQUttQixNQUFNMUUsS0FBS1gsSUFBSTt3QkFDOUMsT0FBTzt3QkFDTCxRQUFRO3dCQUNSLHdCQUF3QixHQUMxQjtvQkFDRjtnQkFDRjtnQkFFQSxTQUFTMEwseUJBQXlCeEgsR0FBRyxFQUFFbUIsSUFBSSxFQUFFMUUsSUFBSTtvQkFDL0N3RSxLQUFLakIsS0FBS3ZELEtBQUtYLElBQUk7b0JBQ25CLElBQUlXLEtBQUtYLElBQUksQ0FBQ0gsS0FBSyxLQUFLd0YsS0FBS3pGLENBQUMsRUFBRTt3QkFDOUIsNEJBQTRCO3dCQUM1QixJQUFJbUUsU0FBU3NCLEtBQUtJLENBQUMsRUFBRTlFLEtBQUtYLElBQUksQ0FBQ0gsS0FBSyxFQUFFd0YsS0FBS3pGLENBQUMsTUFBTWtFLFlBQVl3QyxFQUFFLEVBQUU7NEJBQ2hFLFFBQVE7NEJBQ1IsSUFBSXZDLFNBQVNwRCxLQUFLZCxLQUFLLEVBQUVjLEtBQUtYLElBQUksQ0FBQ0gsS0FBSyxFQUFFYyxLQUFLWCxJQUFJLENBQUNBLElBQUksQ0FBQ0gsS0FBSyxNQUFNaUUsWUFBWXdDLEVBQUUsRUFBRTtnQ0FDbEYsa0JBQWtCO2dDQUNsQm9GLHlCQUF5QnhILEtBQUttQixNQUFNMUU7NEJBQ3RDLE9BQU87NEJBQ0wsaUJBQWlCOzRCQUNqQix3QkFBd0IsR0FDMUI7d0JBQ0Y7b0JBQ0Y7Z0JBQ0Y7Z0JBRUEsU0FBUzZGLGNBQWN0QyxHQUFHLEVBQUUyQixFQUFFLEVBQUVDLEVBQUUsRUFBRWhILENBQUMsRUFBRWMsQ0FBQztvQkFDdEMsSUFBSTRILEtBQUsxSSxFQUFFOE0sY0FBYyxDQUFDaE07b0JBQzFCd0IsT0FBT29HLElBQUk7b0JBRVgsSUFBSUMsS0FBS0QsR0FBR0UsYUFBYSxDQUFDNUksR0FBR2M7b0JBRTdCLHFEQUFxRDtvQkFDckQsSUFBSWQsRUFBRStNLHdCQUF3QixDQUFDak0sSUFBSTt3QkFDakMsSUFBSTZHLFFBQVEzSCxFQUFFMkgsS0FBSyxDQUFDN0c7d0JBQ3BCLE1BQU0sSUFBSW1ELFdBQVcscUNBQ25COzRCQUFDbkQ7NEJBQUc2SDs0QkFBSTNJLEVBQUUwRixRQUFRLENBQUMsQUFBQ2lDLENBQUFBLFFBQVEsQ0FBQSxJQUFLOzRCQUFJM0gsRUFBRTBGLFFBQVEsQ0FBQyxBQUFDaUMsQ0FBQUEsUUFBUSxDQUFBLElBQUs7eUJBQUc7b0JBQ3JFO29CQUVBLElBQUl6QyxXQUFXcEUsR0FBR2QsRUFBRWtILFFBQVEsQ0FBQ3BHLElBQUlkLEVBQUVzSCxPQUFPLENBQUN4RyxJQUFJNkgsS0FBSzt3QkFDbEQsd0NBQXdDO3dCQUN4Q0ssbUJBQW1CaEosR0FBR2MsR0FBRzRILElBQUlDO3dCQUM3QnZELElBQUkrQyxrQkFBa0IsQ0FBQ25JO3dCQUN2Qm9GLElBQUkrQyxrQkFBa0IsQ0FBQ087d0JBRXZCLDZEQUE2RDt3QkFDN0QsZ0VBQWdFO3dCQUNoRSxpRUFBaUU7d0JBQ2pFLGlFQUFpRTt3QkFDakUsa0VBQWtFO3dCQUNsRSxJQUFJNUgsTUFBTWtHLE1BQU0yQixPQUFPNUIsSUFBSTs0QkFDekIsSUFBSUMsT0FBTzVCLElBQUlvQixVQUFVLENBQUNDLGdCQUFnQixDQUFDRSxDQUFDLElBQUlJLE9BQU8zQixJQUFJb0IsVUFBVSxDQUFDQyxnQkFBZ0IsQ0FBQzNGLENBQUMsRUFBRTtnQ0FDeEZkLEVBQUUrSCwyQkFBMkIsQ0FBQ2hCLElBQUlDO2dDQUNsQzBCLEdBQUdYLDJCQUEyQixDQUFDaEIsSUFBSUM7Z0NBQ25Da0IsU0FBUzlDLEtBQUtwRjtnQ0FDZGtJLFNBQVM5QyxLQUFLc0Q7NEJBQ2hCLE9BQU87NEJBQ0wsOERBQThEOzRCQUM5RCx3QkFBd0IsR0FDMUI7d0JBQ0YsT0FBTzs0QkFDTCxJQUFJdEksSUFBSTZFLFNBQVMrQixJQUFJMkIsSUFBSTVCOzRCQUN6Qi9HLElBQUlnTixpQkFBaUI1SCxLQUFLaEYsR0FBR0osR0FBRzBJLElBQUk1SCxHQUFHNkg7NEJBQ3ZDakIsY0FBY3RDLEtBQUsyQixJQUFJQyxJQUFJaEgsR0FBR2M7d0JBQ2hDO29CQUNGLE9BQU87d0JBQ0wsSUFBSW1NLE9BQU9DLGNBQWNuRyxJQUFJQyxJQUFJMEIsSUFBSUM7d0JBQ3JDd0Usa0JBQWtCL0gsS0FBSzJCLElBQUlDLElBQUloSCxHQUFHMEksSUFBSXVFO3dCQUN0Q25HLGtCQUFrQjFCLEtBQUsyQixJQUFJQyxJQUFJaEgsR0FBR2M7b0JBQ3BDO2dCQUNGO2dCQUVBOzs7Ozs7Ozs7OztHQVdDLEdBQ0QsU0FBU2tNLGlCQUFpQjVILEdBQUcsRUFBRWhGLENBQUMsRUFBRUosQ0FBQyxFQUFFMEksRUFBRSxFQUFFNUgsQ0FBQyxFQUFFNkgsRUFBRTtvQkFDNUMsSUFBSXlFO29CQUNKLElBQUloTixNQUFNNEUsWUFBWTRHLEdBQUcsRUFBRTt3QkFDekIscUNBQXFDO3dCQUNyQ3dCLGFBQWExRSxHQUFHZCxTQUFTLENBQUM5RyxHQUFHNkg7d0JBQzdCRCxHQUFHRCxhQUFhLENBQUMyRSxXQUFXLEdBQUc7d0JBQy9CbEYsU0FBUzlDLEtBQUtzRDt3QkFDZEEsR0FBRzJFLGtCQUFrQjt3QkFDckIsT0FBT3JOO29CQUNUO29CQUVBLG9DQUFvQztvQkFDcENvTixhQUFhcE4sRUFBRTRILFNBQVMsQ0FBQzlHLEdBQUc2SDtvQkFFNUIzSSxFQUFFeUksYUFBYSxDQUFDMkUsV0FBVyxHQUFHO29CQUM5QmxGLFNBQVM5QyxLQUFLcEY7b0JBQ2RBLEVBQUVxTixrQkFBa0I7b0JBQ3BCLE9BQU8zRTtnQkFDVDtnQkFFQTs7OztHQUlDLEdBQ0QsU0FBU3dFLGNBQWNuRyxFQUFFLEVBQUVDLEVBQUUsRUFBRTBCLEVBQUUsRUFBRUMsRUFBRTtvQkFDbkMsSUFBSTJFLE1BQU1ySSxTQUFTK0IsSUFBSTJCLElBQUk1QjtvQkFDM0IsSUFBSXVHLFFBQVF0SSxZQUFZd0MsRUFBRSxFQUFFO3dCQUMxQixRQUFRO3dCQUNSLE9BQU9rQixHQUFHeEIsUUFBUSxDQUFDeUI7b0JBQ3JCLE9BQU8sSUFBSTJFLFFBQVF0SSxZQUFZNEcsR0FBRyxFQUFFO3dCQUNsQyxPQUFPO3dCQUNQLE9BQU9sRCxHQUFHcEIsT0FBTyxDQUFDcUI7b0JBQ3BCLE9BQU87d0JBQ0wsTUFBTSxJQUFJMUUsV0FBVyw2RUFBNkU7NEJBQUMrQzs0QkFBSTJCOzRCQUFJNUI7eUJBQUc7b0JBQ2hIO2dCQUNGO2dCQUVBOzs7Ozs7Ozs7Ozs7R0FZQyxHQUNELFNBQVNvRyxrQkFBa0IvSCxHQUFHLEVBQUUyQixFQUFFLEVBQUVDLEVBQUUsRUFBRXVHLGFBQWEsRUFBRXZOLENBQUMsRUFBRWMsQ0FBQztvQkFDekQsSUFBSTRILEtBQUsxSSxFQUFFOE0sY0FBYyxDQUFDaE07b0JBQzFCd0IsT0FBT29HLElBQUk7b0JBRVgsSUFBSUMsS0FBS0QsR0FBR0UsYUFBYSxDQUFDNUksR0FBR2M7b0JBRTdCLElBQUlvRSxXQUFXOEIsSUFBSXVHLGNBQWNyRyxRQUFRLENBQUNGLEtBQUt1RyxjQUFjakcsT0FBTyxDQUFDTixLQUFLMkIsS0FBSzt3QkFDN0UsMkJBQTJCO3dCQUMzQmpCLGNBQWN0QyxLQUFLNEIsSUFBSTJCLElBQUlELElBQUlDO29CQUNqQyxPQUFPO3dCQUNMLElBQUlzRSxPQUFPQyxjQUFjbkcsSUFBSUMsSUFBSTBCLElBQUlDO3dCQUNyQ3dFLGtCQUFrQi9ILEtBQUsyQixJQUFJQyxJQUFJdUcsZUFBZTdFLElBQUl1RTtvQkFDcEQ7Z0JBQ0Y7Z0JBR0YsZ0ZBQWdGO2dCQUU5RTFOLFNBQVFxRixXQUFXLEdBQUdBO1lBRXhCO1lBQUU7Z0JBQUMsb0JBQW1CO2dCQUFFLFlBQVc7Z0JBQUUsZ0JBQWU7Z0JBQUUsY0FBYTtnQkFBRSxXQUFVO1lBQUU7U0FBRTtRQUFDLEdBQUU7WUFBQyxTQUFTaEUsT0FBTyxFQUFDcEIsT0FBTSxFQUFDRCxRQUFPO2dCQUNwSDs7Ozs7Ozs7OztHQVVDLEdBRUQsMEJBQTBCLEdBRTFCO2dCQUdBOzs7Ozs7R0FNQyxHQUVELElBQUkwRSxhQUFhckQsUUFBUTtnQkFDekIsSUFBSThCLFFBQVE5QixRQUFRO2dCQUNwQixJQUFJNkQsV0FBVzdELFFBQVE7Z0JBQ3ZCLElBQUkrRCxRQUFRL0QsUUFBUTtnQkFDcEIsSUFBSVMsaUJBQWlCVCxRQUFRO2dCQUM3QixJQUFJQyxPQUFPUSxlQUFlUixJQUFJO2dCQUdoQyxnRkFBZ0Y7Z0JBRTlFOzs7OztHQUtDLEdBQ0QsSUFBSTJNLFNBQVM7Z0JBR2YsZ0ZBQWdGO2dCQUM5RTs7Ozs7Ozs7R0FRQyxHQUNELElBQUlDLE9BQU8sU0FBU3hHLEVBQUUsRUFBRUksRUFBRTtvQkFDeEIsSUFBSSxDQUFDdkcsQ0FBQyxHQUFHbUc7b0JBQ1QsSUFBSSxDQUFDTixDQUFDLEdBQUdVO29CQUVULElBQUlKLEdBQUd0RSxDQUFDLEdBQUcwRSxHQUFHMUUsQ0FBQyxFQUFFO3dCQUNmLElBQUksQ0FBQ2dFLENBQUMsR0FBR007d0JBQ1QsSUFBSSxDQUFDbkcsQ0FBQyxHQUFHdUc7b0JBQ1gsT0FBTyxJQUFJSixHQUFHdEUsQ0FBQyxLQUFLMEUsR0FBRzFFLENBQUMsRUFBRTt3QkFDeEIsSUFBSXNFLEdBQUc3RixDQUFDLEdBQUdpRyxHQUFHakcsQ0FBQyxFQUFFOzRCQUNmLElBQUksQ0FBQ3VGLENBQUMsR0FBR007NEJBQ1QsSUFBSSxDQUFDbkcsQ0FBQyxHQUFHdUc7d0JBQ1gsT0FBTyxJQUFJSixHQUFHN0YsQ0FBQyxLQUFLaUcsR0FBR2pHLENBQUMsRUFBRTs0QkFDeEIsTUFBTSxJQUFJNkMsV0FBVyx1REFBdUQ7Z0NBQUNnRDs2QkFBRzt3QkFDbEY7b0JBQ0Y7b0JBRUEsSUFBSSxDQUFDLElBQUksQ0FBQ04sQ0FBQyxDQUFDL0QsY0FBYyxFQUFFO3dCQUMxQixJQUFJLENBQUMrRCxDQUFDLENBQUMvRCxjQUFjLEdBQUcsRUFBRTtvQkFDNUI7b0JBQ0EsSUFBSSxDQUFDK0QsQ0FBQyxDQUFDL0QsY0FBYyxDQUFDOEssSUFBSSxDQUFDLElBQUk7Z0JBQ2pDO2dCQUdGLGdGQUFnRjtnQkFDOUU7Ozs7R0FJQyxHQUNELElBQUlDLFFBQVE7b0JBQ1YsaUJBQWlCLEdBQ2pCLElBQUksQ0FBQzdCLFNBQVMsR0FBRztvQkFDakIsaUJBQWlCLEdBQ2pCLElBQUksQ0FBQ0MsV0FBVyxHQUFHO29CQUNuQixpQkFBaUIsR0FDakIsSUFBSSxDQUFDQyxVQUFVLEdBQUc7b0JBQ2xCLG1CQUFtQixHQUNuQixJQUFJLENBQUNDLEtBQUssR0FBRztvQkFDYixvQkFBb0IsR0FDcEIsSUFBSSxDQUFDQyxZQUFZLEdBQUc7Z0JBQ3RCO2dCQUVBeUIsTUFBTWhNLFNBQVMsQ0FBQ2lNLEtBQUssR0FBRztvQkFDdEIsSUFBSSxDQUFDOUIsU0FBUyxHQUFHO29CQUNqQixJQUFJLENBQUNDLFdBQVcsR0FBRztvQkFDbkIsSUFBSSxDQUFDQyxVQUFVLEdBQUc7b0JBQ2xCLElBQUksQ0FBQ0MsS0FBSyxHQUFHO29CQUNiLElBQUksQ0FBQ0MsWUFBWSxHQUFHO2dCQUN0QjtnQkFFRixnRkFBZ0Y7Z0JBQzlFOzs7O0dBSUMsR0FDRCxJQUFJMkIsWUFBWTtvQkFDZCxpQkFBaUIsR0FDakIsSUFBSSxDQUFDcEgsZ0JBQWdCLEdBQUc7b0JBQ3hCLG9CQUFvQixHQUNwQixJQUFJLENBQUNDLEtBQUssR0FBRztnQkFDZjtnQkFFRixnRkFBZ0Y7Z0JBQzlFOzs7Ozs7O0dBT0MsR0FDRDs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQXNCQyxHQUNELElBQUloQyxlQUFlLFNBQVNvSixPQUFPLEVBQUVDLE9BQU87b0JBQzFDQSxVQUFVQSxXQUFXLENBQUM7b0JBQ3RCLElBQUksQ0FBQ0MsVUFBVSxHQUFHLEVBQUU7b0JBQ3BCLElBQUksQ0FBQ0MsSUFBSSxHQUFHLEVBQUU7b0JBQ2QsSUFBSSxDQUFDQyxPQUFPLEdBQUlILFFBQVFJLFdBQVcsR0FBR0wsUUFBUU0sS0FBSyxDQUFDLEtBQUtOO29CQUN6RCxJQUFJLENBQUNPLFNBQVMsR0FBRyxFQUFFO29CQUVuQiwwRUFBMEU7b0JBQzFFLG1EQUFtRDtvQkFDbkQsSUFBSSxDQUFDQyxLQUFLLEdBQUcsSUFBSSxDQUFDQyxLQUFLLEdBQUc7b0JBRTFCOzs7O0tBSUMsR0FDRCxJQUFJLENBQUNDLE1BQU0sR0FBRztvQkFFZDs7OztLQUlDLEdBQ0QsSUFBSSxDQUFDaE4sS0FBSyxHQUFHO29CQUViOzs7O0tBSUMsR0FDRCxJQUFJLENBQUNDLEtBQUssR0FBRztvQkFFYjs7O0tBR0MsR0FDRCxJQUFJLENBQUNnTixRQUFRLEdBQUc7b0JBQ2hCOzs7S0FHQyxHQUNELElBQUksQ0FBQ0MsVUFBVSxHQUFHO29CQUNsQjs7O0tBR0MsR0FDRCxJQUFJLENBQUNDLFFBQVEsR0FBRztvQkFFaEIsSUFBSSxDQUFDOUMsS0FBSyxHQUFHLElBQUk4QjtvQkFDakIsSUFBSSxDQUFDbkgsVUFBVSxHQUFHLElBQUlxSDtvQkFFdEIsSUFBSSxDQUFDZSxTQUFTLENBQUMsSUFBSSxDQUFDVixPQUFPO2dCQUM3QjtnQkFHQTs7Ozs7Ozs7Ozs7Ozs7O0dBZUMsR0FDRHhKLGFBQWEvQyxTQUFTLENBQUNrTixPQUFPLEdBQUcsU0FBU0MsUUFBUTtvQkFDaEQsSUFBSSxDQUFDRixTQUFTLENBQUNFO29CQUNmLElBQUl0TyxHQUFHa0QsTUFBTW9MLFNBQVNuTyxNQUFNO29CQUM1QixJQUFLSCxJQUFJLEdBQUdBLElBQUlrRCxLQUFLbEQsSUFBSzt3QkFDeEIsSUFBSSxDQUFDME4sT0FBTyxDQUFDUixJQUFJLENBQUNvQixRQUFRLENBQUN0TyxFQUFFO29CQUMvQjtvQkFDQSxPQUFPLElBQUksRUFBRSxlQUFlO2dCQUM5QjtnQkFFQTs7OztHQUlDLEdBQ0RrRSxhQUFhL0MsU0FBUyxDQUFDb04sT0FBTyxHQUFHckssYUFBYS9DLFNBQVMsQ0FBQ2tOLE9BQU87Z0JBRy9EOzs7Ozs7Ozs7Ozs7Ozs7Ozs7R0FrQkMsR0FDSCw4RUFBOEU7Z0JBQzVFbkssYUFBYS9DLFNBQVMsQ0FBQ3FOLFFBQVEsR0FBRyxTQUFTQyxLQUFLO29CQUM5QyxJQUFJek8sR0FBR2tELE1BQU11TCxNQUFNdE8sTUFBTTtvQkFDekIsSUFBS0gsSUFBSSxHQUFHQSxJQUFJa0QsS0FBS2xELElBQUs7d0JBQ3hCLElBQUksQ0FBQ29PLFNBQVMsQ0FBQ0ssS0FBSyxDQUFDek8sRUFBRTtvQkFDekI7b0JBQ0EsSUFBSSxDQUFDME4sT0FBTyxHQUFHLElBQUksQ0FBQ0EsT0FBTyxDQUFDZ0IsTUFBTSxDQUFDQyxLQUFLLENBQUMsSUFBSSxDQUFDakIsT0FBTyxFQUFFZTtvQkFDdkQsT0FBTyxJQUFJLEVBQUUsZUFBZTtnQkFDOUI7Z0JBR0E7Ozs7Ozs7Ozs7O0dBV0MsR0FDRHZLLGFBQWEvQyxTQUFTLENBQUN5TixRQUFRLEdBQUcsU0FBU3JPLEtBQUs7b0JBQzlDLElBQUksQ0FBQ21OLE9BQU8sQ0FBQ1IsSUFBSSxDQUFDM007b0JBQ2xCLE9BQU8sSUFBSSxFQUFFLGVBQWU7Z0JBQzlCO2dCQUVBOzs7O0dBSUMsR0FDRDJELGFBQWEvQyxTQUFTLENBQUMwTixRQUFRLEdBQUczSyxhQUFhL0MsU0FBUyxDQUFDeU4sUUFBUTtnQkFHakU7Ozs7Ozs7Ozs7Ozs7OztHQWVDLEdBQ0gsOEVBQThFO2dCQUM1RTFLLGFBQWEvQyxTQUFTLENBQUMyTixTQUFTLEdBQUcsU0FBU3BMLE1BQU07b0JBQ2hELElBQUksQ0FBQ2dLLE9BQU8sR0FBRyxJQUFJLENBQUNBLE9BQU8sQ0FBQ2dCLE1BQU0sQ0FBQ2hMO29CQUNuQyxPQUFPLElBQUksRUFBRSxlQUFlO2dCQUM5QjtnQkFHQTs7Ozs7Ozs7R0FRQyxHQUNILHVEQUF1RDtnQkFDdkQsOEVBQThFO2dCQUM1RVEsYUFBYS9DLFNBQVMsQ0FBQ2lELFdBQVcsR0FBRztvQkFDbkNELE1BQU1DLFdBQVcsQ0FBQyxJQUFJO29CQUN0QixPQUFPLElBQUksRUFBRSxlQUFlO2dCQUM5QjtnQkFHQTs7Ozs7O0dBTUMsR0FDSCw4RUFBOEU7Z0JBQzVFRixhQUFhL0MsU0FBUyxDQUFDNE4sY0FBYyxHQUFHO29CQUN0QyxPQUFPO3dCQUFDQyxLQUFLLElBQUksQ0FBQ2xCLEtBQUs7d0JBQUVtQixLQUFLLElBQUksQ0FBQ2xCLEtBQUs7b0JBQUE7Z0JBQzFDO2dCQUVBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7R0FrQkMsR0FDRDdKLGFBQWEvQyxTQUFTLENBQUMrTixZQUFZLEdBQUc7b0JBQ3BDLE9BQU8sSUFBSSxDQUFDMUIsVUFBVTtnQkFDeEI7Z0JBRUE7Ozs7R0FJQyxHQUNEdEosYUFBYS9DLFNBQVMsQ0FBQ2dPLFlBQVksR0FBR2pMLGFBQWEvQyxTQUFTLENBQUMrTixZQUFZO2dCQUczRSxnRkFBZ0Y7Z0JBRTlFLGFBQWEsR0FDYmhMLGFBQWEvQyxTQUFTLENBQUNvRSxLQUFLLEdBQUc7b0JBQzdCLE9BQU8sSUFBSSxDQUFDeUksTUFBTTtnQkFDcEI7Z0JBRUEsYUFBYSxHQUNiOUosYUFBYS9DLFNBQVMsQ0FBQzhELFVBQVUsR0FBRztvQkFDbEMsT0FBTyxJQUFJLENBQUN5SSxPQUFPLENBQUN2TixNQUFNO2dCQUM1QjtnQkFFQSxhQUFhLEdBQ2IrRCxhQUFhL0MsU0FBUyxDQUFDTCxJQUFJLEdBQUc7b0JBQzVCLE9BQU8sSUFBSSxDQUFDRSxLQUFLO2dCQUNuQjtnQkFFQSxhQUFhLEdBQ2JrRCxhQUFhL0MsU0FBUyxDQUFDQyxPQUFPLEdBQUcsU0FBU3FGLEVBQUU7b0JBQzFDLElBQUksQ0FBQ3pGLEtBQUssR0FBR3lGO2dCQUNmO2dCQUVBLGFBQWEsR0FDYnZDLGFBQWEvQyxTQUFTLENBQUNKLElBQUksR0FBRztvQkFDNUIsT0FBTyxJQUFJLENBQUNFLEtBQUs7Z0JBQ25CO2dCQUVBLGFBQWEsR0FDYmlELGFBQWEvQyxTQUFTLENBQUNHLE9BQU8sR0FBRyxTQUFTbUYsRUFBRTtvQkFDMUMsSUFBSSxDQUFDeEYsS0FBSyxHQUFHd0Y7Z0JBQ2Y7Z0JBRUEsYUFBYSxHQUNidkMsYUFBYS9DLFNBQVMsQ0FBQ2lPLE1BQU0sR0FBRztvQkFDOUIsT0FBTyxJQUFJLENBQUMzQixJQUFJO2dCQUNsQjtnQkFFQSxhQUFhLEdBQ2J2SixhQUFhL0MsU0FBUyxDQUFDMEQsaUJBQWlCLEdBQUc7b0JBQ3pDLElBQUl3SyxPQUFPLElBQUksQ0FBQzNCLE9BQU8sQ0FBQyxFQUFFLENBQUM5TSxDQUFDO29CQUM1QixJQUFJME8sT0FBTyxJQUFJLENBQUM1QixPQUFPLENBQUMsRUFBRSxDQUFDOU0sQ0FBQztvQkFDNUIsSUFBSTJPLE9BQU8sSUFBSSxDQUFDN0IsT0FBTyxDQUFDLEVBQUUsQ0FBQ3ZMLENBQUM7b0JBQzVCLElBQUlxTixPQUFPLElBQUksQ0FBQzlCLE9BQU8sQ0FBQyxFQUFFLENBQUN2TCxDQUFDO29CQUU1QixtQkFBbUI7b0JBQ25CLElBQUluQyxHQUFHa0QsTUFBTSxJQUFJLENBQUN3SyxPQUFPLENBQUN2TixNQUFNO29CQUNoQyxJQUFLSCxJQUFJLEdBQUdBLElBQUlrRCxLQUFLbEQsSUFBSzt3QkFDeEIsSUFBSU0sSUFBSSxJQUFJLENBQUNvTixPQUFPLENBQUMxTixFQUFFO3dCQUN2QixvQkFBb0IsR0FDbkJNLEVBQUVNLENBQUMsR0FBR3lPLFFBQVVBLENBQUFBLE9BQU8vTyxFQUFFTSxDQUFDLEFBQURBO3dCQUN6Qk4sRUFBRU0sQ0FBQyxHQUFHME8sUUFBVUEsQ0FBQUEsT0FBT2hQLEVBQUVNLENBQUMsQUFBREE7d0JBQ3pCTixFQUFFNkIsQ0FBQyxHQUFHb04sUUFBVUEsQ0FBQUEsT0FBT2pQLEVBQUU2QixDQUFDLEFBQURBO3dCQUN6QjdCLEVBQUU2QixDQUFDLEdBQUdxTixRQUFVQSxDQUFBQSxPQUFPbFAsRUFBRTZCLENBQUMsQUFBREE7b0JBQzVCO29CQUNBLElBQUksQ0FBQzJMLEtBQUssR0FBRyxJQUFJNUwsTUFBTW9OLE1BQU1FO29CQUM3QixJQUFJLENBQUN6QixLQUFLLEdBQUcsSUFBSTdMLE1BQU1tTixNQUFNRTtvQkFFN0IsSUFBSUUsS0FBS3pDLFNBQVVxQyxDQUFBQSxPQUFPQyxJQUFHO29CQUM3QixJQUFJSSxLQUFLMUMsU0FBVXVDLENBQUFBLE9BQU9DLElBQUc7b0JBQzdCLElBQUksQ0FBQ3hPLEtBQUssR0FBRyxJQUFJa0IsTUFBTW1OLE9BQU9JLElBQUlELE9BQU9FO29CQUN6QyxJQUFJLENBQUN6TyxLQUFLLEdBQUcsSUFBSWlCLE1BQU1vTixPQUFPRyxJQUFJRCxPQUFPRTtvQkFFekMsMkJBQTJCO29CQUMzQixJQUFJLENBQUNoQyxPQUFPLENBQUNpQyxJQUFJLENBQUN6TixNQUFNb0IsT0FBTztnQkFDakM7Z0JBRUEsYUFBYSxHQUNiWSxhQUFhL0MsU0FBUyxDQUFDaU4sU0FBUyxHQUFHLFNBQVNFLFFBQVE7b0JBQ2xELElBQUl0TyxHQUFHa0QsTUFBTW9MLFNBQVNuTyxNQUFNO29CQUM1QixJQUFLSCxJQUFJLEdBQUdBLElBQUlrRCxLQUFLLEVBQUVsRCxFQUFHO3dCQUN4QixJQUFJLENBQUM2TixTQUFTLENBQUNYLElBQUksQ0FBQyxJQUFJRCxLQUFLcUIsUUFBUSxDQUFDdE8sRUFBRSxFQUFFc08sUUFBUSxDQUFDLEFBQUN0TyxDQUFBQSxJQUFJLENBQUEsSUFBS2tELElBQUk7b0JBQ25FO2dCQUNGO2dCQUVBLGFBQWEsR0FDYmdCLGFBQWEvQyxTQUFTLENBQUMrRCxRQUFRLEdBQUcsU0FBU2lDLEtBQUs7b0JBQzlDLE9BQU8sSUFBSSxDQUFDdUcsT0FBTyxDQUFDdkcsTUFBTTtnQkFDNUI7Z0JBRUEsYUFBYSxHQUNiakQsYUFBYS9DLFNBQVMsQ0FBQ3NHLFFBQVEsR0FBRyxTQUFTakgsUUFBUTtvQkFDakQsSUFBSSxDQUFDaU4sSUFBSSxDQUFDUCxJQUFJLENBQUMxTTtnQkFDakI7Z0JBRUEsYUFBYSxHQUNiMEQsYUFBYS9DLFNBQVMsQ0FBQ08sVUFBVSxHQUFHLFNBQVNuQixLQUFLO29CQUNoRCxPQUFPLElBQUksQ0FBQ3lOLE1BQU0sQ0FBQ3RNLFVBQVUsQ0FBQ25CLE1BQU1LLENBQUM7Z0JBQ3ZDO2dCQUVBLGFBQWEsR0FDYnNELGFBQWEvQyxTQUFTLENBQUMyRCxvQkFBb0IsR0FBRztvQkFDNUMsSUFBSWhFO29CQUNKLElBQUk4TztvQkFDSixJQUFJN087b0JBQ0osbUJBQW1CO29CQUNuQixJQUFJUCxXQUFXLElBQUl5RCxTQUFTLElBQUksQ0FBQ3lKLE9BQU8sQ0FBQyxFQUFFLEVBQUUsSUFBSSxDQUFDek0sS0FBSyxFQUFFLElBQUksQ0FBQ0QsS0FBSztvQkFFbkUsSUFBSSxDQUFDeU0sSUFBSSxDQUFDUCxJQUFJLENBQUMxTTtvQkFFZk0sT0FBTyxJQUFJVCxLQUFLRyxTQUFTMEUsUUFBUSxDQUFDLElBQUkxRTtvQkFDdENvUCxTQUFTLElBQUl2UCxLQUFLRyxTQUFTMEUsUUFBUSxDQUFDLElBQUkxRTtvQkFDeENPLE9BQU8sSUFBSVYsS0FBS0csU0FBUzBFLFFBQVEsQ0FBQztvQkFFbEMsSUFBSSxDQUFDOEksTUFBTSxHQUFHLElBQUluTixlQUFlQyxNQUFNQztvQkFFdkNELEtBQUtMLElBQUksR0FBR21QO29CQUNaQSxPQUFPblAsSUFBSSxHQUFHTTtvQkFDZDZPLE9BQU9sUCxJQUFJLEdBQUdJO29CQUNkQyxLQUFLTCxJQUFJLEdBQUdrUDtnQkFDZDtnQkFFQSxhQUFhLEdBQ2IxTCxhQUFhL0MsU0FBUyxDQUFDME8sVUFBVSxHQUFHLFNBQVN4TyxJQUFJO2dCQUMvQyxhQUFhO2dCQUNiLHVCQUF1QixHQUN6QjtnQkFFQSxhQUFhLEdBQ2I2QyxhQUFhL0MsU0FBUyxDQUFDd0csa0JBQWtCLEdBQUcsU0FBU25JLENBQUM7b0JBQ3BELElBQUssSUFBSVEsSUFBSSxHQUFHQSxJQUFJLEdBQUcsRUFBRUEsRUFBRzt3QkFDMUIsSUFBSSxDQUFDUixFQUFFOEgsV0FBVyxDQUFDdEgsSUFBSTs0QkFDckIsSUFBSVAsSUFBSSxJQUFJLENBQUN1TyxNQUFNLENBQUNyTSxXQUFXLENBQUNuQyxFQUFFc0gsT0FBTyxDQUFDdEgsRUFBRTBGLFFBQVEsQ0FBQ2xGOzRCQUNyRCxJQUFJUCxHQUFHO2dDQUNMQSxFQUFFZSxRQUFRLEdBQUdoQjs0QkFDZjt3QkFDRjtvQkFDRjtnQkFDRjtnQkFFQSxhQUFhLEdBQ2IwRSxhQUFhL0MsU0FBUyxDQUFDMk8sYUFBYSxHQUFHLFNBQVN0UCxRQUFRO29CQUN0RCxJQUFJUixHQUFHK1AsTUFBTSxJQUFJLENBQUN0QyxJQUFJLEVBQUV2SyxNQUFNNk0sSUFBSTVQLE1BQU07b0JBQ3hDLElBQUtILElBQUksR0FBR0EsSUFBSWtELEtBQUtsRCxJQUFLO3dCQUN4QixJQUFJK1AsR0FBRyxDQUFDL1AsRUFBRSxLQUFLUSxVQUFVOzRCQUN2QnVQLElBQUlDLE1BQU0sQ0FBQ2hRLEdBQUc7NEJBQ2Q7d0JBQ0Y7b0JBQ0Y7Z0JBQ0Y7Z0JBRUE7Ozs7R0FJQyxHQUNEa0UsYUFBYS9DLFNBQVMsQ0FBQ3VFLFNBQVMsR0FBRyxTQUFTbEYsUUFBUTtvQkFDbEQsb0VBQW9FO29CQUNwRSw4QkFBOEI7b0JBQzlCLElBQUl5UCxZQUFZO3dCQUFDelA7cUJBQVMsRUFBRWhCLEdBQUdRO29CQUMvQixvQkFBb0IsR0FDcEIsTUFBT1IsSUFBSXlRLFVBQVVDLEdBQUcsR0FBSTt3QkFDMUIsSUFBSSxDQUFDMVEsRUFBRTJRLFVBQVUsSUFBSTs0QkFDbkIzUSxFQUFFNFEsV0FBVyxDQUFDOzRCQUNkLElBQUksQ0FBQzVDLFVBQVUsQ0FBQ04sSUFBSSxDQUFDMU47NEJBQ3JCLElBQUtRLElBQUksR0FBR0EsSUFBSSxHQUFHQSxJQUFLO2dDQUN0QixJQUFJLENBQUNSLEVBQUV5RyxnQkFBZ0IsQ0FBQ2pHLEVBQUUsRUFBRTtvQ0FDMUJpUSxVQUFVL0MsSUFBSSxDQUFDMU4sRUFBRThILFdBQVcsQ0FBQ3RIO2dDQUMvQjs0QkFDRjt3QkFDRjtvQkFDRjtnQkFDRjtnQkFFRixnRkFBZ0Y7Z0JBRTlFaEIsUUFBT0QsT0FBTyxHQUFHbUY7WUFFbkI7WUFBRTtnQkFBQyxvQkFBbUI7Z0JBQUUsV0FBVTtnQkFBRSxnQkFBZTtnQkFBRSxXQUFVO2dCQUFFLGNBQWE7WUFBQztTQUFFO1FBQUMsR0FBRTtZQUFDLFNBQVM5RCxPQUFPLEVBQUNwQixPQUFNLEVBQUNELFFBQU87Z0JBQ2xIOzs7Ozs7Ozs7O0dBVUMsR0FFRCwyQkFBMkIsR0FFM0I7Z0JBR0E7Ozs7OztHQU1DLEdBRUQsSUFBSWtELEtBQUs3QixRQUFRO2dCQUduQixnRkFBZ0Y7Z0JBQzlFOzs7Ozs7Ozs7Ozs7R0FZQyxHQUNELElBQUk2RCxXQUFXLFNBQVNuRSxDQUFDLEVBQUVzRCxDQUFDLEVBQUVpTixDQUFDO29CQUM3Qjs7OztLQUlDLEdBQ0QsSUFBSSxDQUFDM0MsT0FBTyxHQUFHO3dCQUFDNU47d0JBQUdzRDt3QkFBR2lOO3FCQUFFO29CQUV4Qjs7OztLQUlDLEdBQ0QsSUFBSSxDQUFDQyxVQUFVLEdBQUc7d0JBQUM7d0JBQU07d0JBQU07cUJBQUs7b0JBRXBDOzs7O0tBSUMsR0FDRCxJQUFJLENBQUNDLFNBQVMsR0FBRztvQkFFakI7Ozs7S0FJQyxHQUNELElBQUksQ0FBQ3RLLGdCQUFnQixHQUFHO3dCQUFDO3dCQUFPO3dCQUFPO3FCQUFNO29CQUU3Qzs7OztLQUlDLEdBQ0QsSUFBSSxDQUFDZ0MsYUFBYSxHQUFHO3dCQUFDO3dCQUFPO3dCQUFPO3FCQUFNO2dCQUM1QztnQkFFQSxJQUFJdUksTUFBTXZPLEdBQUdJLFFBQVE7Z0JBQ3JCOzs7O0dBSUMsR0FDRDRCLFNBQVM5QyxTQUFTLENBQUNrQixRQUFRLEdBQUc7b0JBQzVCLE9BQVEsTUFBTW1PLElBQUksSUFBSSxDQUFDOUMsT0FBTyxDQUFDLEVBQUUsSUFBSThDLElBQUksSUFBSSxDQUFDOUMsT0FBTyxDQUFDLEVBQUUsSUFBSThDLElBQUksSUFBSSxDQUFDOUMsT0FBTyxDQUFDLEVBQUUsSUFBSTtnQkFDckY7Z0JBRUE7Ozs7Ozs7Ozs7Ozs7OztHQWVDLEdBQ0R6SixTQUFTOUMsU0FBUyxDQUFDK0QsUUFBUSxHQUFHLFNBQVNpQyxLQUFLO29CQUMxQyxPQUFPLElBQUksQ0FBQ3VHLE9BQU8sQ0FBQ3ZHLE1BQU07Z0JBQzVCO2dCQUVBOzs7O0dBSUMsR0FDRGxELFNBQVM5QyxTQUFTLENBQUNzUCxRQUFRLEdBQUd4TSxTQUFTOUMsU0FBUyxDQUFDK0QsUUFBUTtnQkFFekQ7Ozs7R0FJQyxHQUNILDhFQUE4RTtnQkFDNUVqQixTQUFTOUMsU0FBUyxDQUFDdVAsU0FBUyxHQUFHO29CQUM3QixPQUFPLElBQUksQ0FBQ2hELE9BQU87Z0JBQ3JCO2dCQUVBOzs7O0dBSUMsR0FDRHpKLFNBQVM5QyxTQUFTLENBQUNtRyxXQUFXLEdBQUcsU0FBU0gsS0FBSztvQkFDN0MsT0FBTyxJQUFJLENBQUNtSixVQUFVLENBQUNuSixNQUFNO2dCQUMvQjtnQkFFQTs7Ozs7OztHQU9DLEdBQ0RsRCxTQUFTOUMsU0FBUyxDQUFDd1AsYUFBYSxHQUFHLFNBQVNwUSxLQUFLO29CQUMvQyxJQUFJbUQsU0FBUyxJQUFJLENBQUNnSyxPQUFPO29CQUN6QixxREFBcUQ7b0JBQ3JELE9BQVFuTixVQUFVbUQsTUFBTSxDQUFDLEVBQUUsSUFBSW5ELFVBQVVtRCxNQUFNLENBQUMsRUFBRSxJQUFJbkQsVUFBVW1ELE1BQU0sQ0FBQyxFQUFFO2dCQUMzRTtnQkFFQTs7Ozs7OztHQU9DLEdBQ0RPLFNBQVM5QyxTQUFTLENBQUN5UCxZQUFZLEdBQUcsU0FBUzdLLElBQUk7b0JBQzdDLE9BQU8sSUFBSSxDQUFDNEssYUFBYSxDQUFDNUssS0FBS3pGLENBQUMsS0FBSyxJQUFJLENBQUNxUSxhQUFhLENBQUM1SyxLQUFLSSxDQUFDO2dCQUNoRTtnQkFFQTs7Ozs7O0dBTUMsR0FDRGxDLFNBQVM5QyxTQUFTLENBQUMwUCxjQUFjLEdBQUcsU0FBU3BLLEVBQUUsRUFBRUksRUFBRTtvQkFDakQsT0FBTyxJQUFJLENBQUM4SixhQUFhLENBQUNsSyxPQUFPLElBQUksQ0FBQ2tLLGFBQWEsQ0FBQzlKO2dCQUN0RDtnQkFFQTs7O0dBR0MsR0FDRDVDLFNBQVM5QyxTQUFTLENBQUNnUCxVQUFVLEdBQUc7b0JBQzlCLE9BQU8sSUFBSSxDQUFDSSxTQUFTO2dCQUN2QjtnQkFFQTs7Ozs7R0FLQyxHQUNEdE0sU0FBUzlDLFNBQVMsQ0FBQ2lQLFdBQVcsR0FBRyxTQUFTVSxRQUFRO29CQUNoRCxJQUFJLENBQUNQLFNBQVMsR0FBR087b0JBQ2pCLE9BQU8sSUFBSTtnQkFDYjtnQkFFQTs7Ozs7OztHQU9DLEdBQ0Q3TSxTQUFTOUMsU0FBUyxDQUFDNFAsb0JBQW9CLEdBQUcsU0FBU3RLLEVBQUUsRUFBRUksRUFBRSxFQUFFckgsQ0FBQztvQkFDMUQsSUFBSWtFLFNBQVMsSUFBSSxDQUFDZ0ssT0FBTztvQkFDekIscURBQXFEO29CQUNyRCxJQUFJLEFBQUNqSCxPQUFPL0MsTUFBTSxDQUFDLEVBQUUsSUFBSW1ELE9BQU9uRCxNQUFNLENBQUMsRUFBRSxJQUFNK0MsT0FBTy9DLE1BQU0sQ0FBQyxFQUFFLElBQUltRCxPQUFPbkQsTUFBTSxDQUFDLEVBQUUsRUFBRzt3QkFDcEYsSUFBSSxDQUFDNE0sVUFBVSxDQUFDLEVBQUUsR0FBRzlRO29CQUN2QixPQUFPLElBQUksQUFBQ2lILE9BQU8vQyxNQUFNLENBQUMsRUFBRSxJQUFJbUQsT0FBT25ELE1BQU0sQ0FBQyxFQUFFLElBQU0rQyxPQUFPL0MsTUFBTSxDQUFDLEVBQUUsSUFBSW1ELE9BQU9uRCxNQUFNLENBQUMsRUFBRSxFQUFHO3dCQUMzRixJQUFJLENBQUM0TSxVQUFVLENBQUMsRUFBRSxHQUFHOVE7b0JBQ3ZCLE9BQU8sSUFBSSxBQUFDaUgsT0FBTy9DLE1BQU0sQ0FBQyxFQUFFLElBQUltRCxPQUFPbkQsTUFBTSxDQUFDLEVBQUUsSUFBTStDLE9BQU8vQyxNQUFNLENBQUMsRUFBRSxJQUFJbUQsT0FBT25ELE1BQU0sQ0FBQyxFQUFFLEVBQUc7d0JBQzNGLElBQUksQ0FBQzRNLFVBQVUsQ0FBQyxFQUFFLEdBQUc5UTtvQkFDdkIsT0FBTzt3QkFDTCxNQUFNLElBQUlTLE1BQU07b0JBQ2xCO2dCQUNGO2dCQUVBOzs7O0dBSUMsR0FDRGdFLFNBQVM5QyxTQUFTLENBQUNxRyxZQUFZLEdBQUcsU0FBU2hJLENBQUM7b0JBQzFDLElBQUlrRSxTQUFTLElBQUksQ0FBQ2dLLE9BQU87b0JBQ3pCLElBQUlsTyxFQUFFcVIsY0FBYyxDQUFDbk4sTUFBTSxDQUFDLEVBQUUsRUFBRUEsTUFBTSxDQUFDLEVBQUUsR0FBRzt3QkFDMUMsSUFBSSxDQUFDNE0sVUFBVSxDQUFDLEVBQUUsR0FBRzlRO3dCQUNyQkEsRUFBRXVSLG9CQUFvQixDQUFDck4sTUFBTSxDQUFDLEVBQUUsRUFBRUEsTUFBTSxDQUFDLEVBQUUsRUFBRSxJQUFJO29CQUNuRCxPQUFPLElBQUlsRSxFQUFFcVIsY0FBYyxDQUFDbk4sTUFBTSxDQUFDLEVBQUUsRUFBRUEsTUFBTSxDQUFDLEVBQUUsR0FBRzt3QkFDakQsSUFBSSxDQUFDNE0sVUFBVSxDQUFDLEVBQUUsR0FBRzlRO3dCQUNyQkEsRUFBRXVSLG9CQUFvQixDQUFDck4sTUFBTSxDQUFDLEVBQUUsRUFBRUEsTUFBTSxDQUFDLEVBQUUsRUFBRSxJQUFJO29CQUNuRCxPQUFPLElBQUlsRSxFQUFFcVIsY0FBYyxDQUFDbk4sTUFBTSxDQUFDLEVBQUUsRUFBRUEsTUFBTSxDQUFDLEVBQUUsR0FBRzt3QkFDakQsSUFBSSxDQUFDNE0sVUFBVSxDQUFDLEVBQUUsR0FBRzlRO3dCQUNyQkEsRUFBRXVSLG9CQUFvQixDQUFDck4sTUFBTSxDQUFDLEVBQUUsRUFBRUEsTUFBTSxDQUFDLEVBQUUsRUFBRSxJQUFJO29CQUNuRDtnQkFDRjtnQkFHQU8sU0FBUzlDLFNBQVMsQ0FBQ2dLLGNBQWMsR0FBRztvQkFDbEMsSUFBSSxDQUFDbUYsVUFBVSxDQUFDLEVBQUUsR0FBRztvQkFDckIsSUFBSSxDQUFDQSxVQUFVLENBQUMsRUFBRSxHQUFHO29CQUNyQixJQUFJLENBQUNBLFVBQVUsQ0FBQyxFQUFFLEdBQUc7Z0JBQ3ZCO2dCQUVBck0sU0FBUzlDLFNBQVMsQ0FBQzBMLGtCQUFrQixHQUFHO29CQUN0QyxJQUFJLENBQUM1RSxhQUFhLENBQUMsRUFBRSxHQUFHO29CQUN4QixJQUFJLENBQUNBLGFBQWEsQ0FBQyxFQUFFLEdBQUc7b0JBQ3hCLElBQUksQ0FBQ0EsYUFBYSxDQUFDLEVBQUUsR0FBRztnQkFDMUI7Z0JBRUE7Ozs7R0FJQyxHQUNEaEUsU0FBUzlDLFNBQVMsQ0FBQzJGLE9BQU8sR0FBRyxTQUFTeEcsQ0FBQztvQkFDckMsSUFBSW9ELFNBQVMsSUFBSSxDQUFDZ0ssT0FBTztvQkFDekIscURBQXFEO29CQUNyRCxJQUFJcE4sTUFBTW9ELE1BQU0sQ0FBQyxFQUFFLEVBQUU7d0JBQ25CLE9BQU9BLE1BQU0sQ0FBQyxFQUFFO29CQUNsQixPQUFPLElBQUlwRCxNQUFNb0QsTUFBTSxDQUFDLEVBQUUsRUFBRTt3QkFDMUIsT0FBT0EsTUFBTSxDQUFDLEVBQUU7b0JBQ2xCLE9BQU8sSUFBSXBELE1BQU1vRCxNQUFNLENBQUMsRUFBRSxFQUFFO3dCQUMxQixPQUFPQSxNQUFNLENBQUMsRUFBRTtvQkFDbEIsT0FBTzt3QkFDTCxPQUFPO29CQUNUO2dCQUNGO2dCQUVBOzs7O0dBSUMsR0FDRE8sU0FBUzlDLFNBQVMsQ0FBQ3VGLFFBQVEsR0FBRyxTQUFTcEcsQ0FBQztvQkFDdEMsSUFBSW9ELFNBQVMsSUFBSSxDQUFDZ0ssT0FBTztvQkFDekIscURBQXFEO29CQUNyRCxJQUFJcE4sTUFBTW9ELE1BQU0sQ0FBQyxFQUFFLEVBQUU7d0JBQ25CLE9BQU9BLE1BQU0sQ0FBQyxFQUFFO29CQUNsQixPQUFPLElBQUlwRCxNQUFNb0QsTUFBTSxDQUFDLEVBQUUsRUFBRTt3QkFDMUIsT0FBT0EsTUFBTSxDQUFDLEVBQUU7b0JBQ2xCLE9BQU8sSUFBSXBELE1BQU1vRCxNQUFNLENBQUMsRUFBRSxFQUFFO3dCQUMxQixPQUFPQSxNQUFNLENBQUMsRUFBRTtvQkFDbEIsT0FBTzt3QkFDTCxPQUFPO29CQUNUO2dCQUNGO2dCQUVBOzs7O0dBSUMsR0FDRE8sU0FBUzlDLFNBQVMsQ0FBQzhGLFVBQVUsR0FBRyxTQUFTM0csQ0FBQztvQkFDeEMscURBQXFEO29CQUNyRCxJQUFJQSxNQUFNLElBQUksQ0FBQ29OLE9BQU8sQ0FBQyxFQUFFLEVBQUU7d0JBQ3pCLE9BQU8sSUFBSSxDQUFDNEMsVUFBVSxDQUFDLEVBQUU7b0JBQzNCLE9BQU8sSUFBSWhRLE1BQU0sSUFBSSxDQUFDb04sT0FBTyxDQUFDLEVBQUUsRUFBRTt3QkFDaEMsT0FBTyxJQUFJLENBQUM0QyxVQUFVLENBQUMsRUFBRTtvQkFDM0IsT0FBTzt3QkFDTCxPQUFPLElBQUksQ0FBQ0EsVUFBVSxDQUFDLEVBQUU7b0JBQzNCO2dCQUNGO2dCQUVBOzs7O0dBSUMsR0FDRHJNLFNBQVM5QyxTQUFTLENBQUNzRSxXQUFXLEdBQUcsU0FBU25GLENBQUM7b0JBQ3pDLHFEQUFxRDtvQkFDckQsSUFBSUEsTUFBTSxJQUFJLENBQUNvTixPQUFPLENBQUMsRUFBRSxFQUFFO3dCQUN6QixPQUFPLElBQUksQ0FBQzRDLFVBQVUsQ0FBQyxFQUFFO29CQUMzQixPQUFPLElBQUloUSxNQUFNLElBQUksQ0FBQ29OLE9BQU8sQ0FBQyxFQUFFLEVBQUU7d0JBQ2hDLE9BQU8sSUFBSSxDQUFDNEMsVUFBVSxDQUFDLEVBQUU7b0JBQzNCLE9BQU87d0JBQ0wsT0FBTyxJQUFJLENBQUNBLFVBQVUsQ0FBQyxFQUFFO29CQUMzQjtnQkFDRjtnQkFFQXJNLFNBQVM5QyxTQUFTLENBQUNxRSxvQkFBb0IsR0FBRyxTQUFTbEYsQ0FBQztvQkFDbEQscURBQXFEO29CQUNyRCxJQUFJQSxNQUFNLElBQUksQ0FBQ29OLE9BQU8sQ0FBQyxFQUFFLEVBQUU7d0JBQ3pCLE9BQU8sSUFBSSxDQUFDekgsZ0JBQWdCLENBQUMsRUFBRTtvQkFDakMsT0FBTyxJQUFJM0YsTUFBTSxJQUFJLENBQUNvTixPQUFPLENBQUMsRUFBRSxFQUFFO3dCQUNoQyxPQUFPLElBQUksQ0FBQ3pILGdCQUFnQixDQUFDLEVBQUU7b0JBQ2pDLE9BQU87d0JBQ0wsT0FBTyxJQUFJLENBQUNBLGdCQUFnQixDQUFDLEVBQUU7b0JBQ2pDO2dCQUNGO2dCQUVBaEMsU0FBUzlDLFNBQVMsQ0FBQ3FKLHFCQUFxQixHQUFHLFNBQVNsSyxDQUFDO29CQUNuRCxxREFBcUQ7b0JBQ3JELElBQUlBLE1BQU0sSUFBSSxDQUFDb04sT0FBTyxDQUFDLEVBQUUsRUFBRTt3QkFDekIsT0FBTyxJQUFJLENBQUN6SCxnQkFBZ0IsQ0FBQyxFQUFFO29CQUNqQyxPQUFPLElBQUkzRixNQUFNLElBQUksQ0FBQ29OLE9BQU8sQ0FBQyxFQUFFLEVBQUU7d0JBQ2hDLE9BQU8sSUFBSSxDQUFDekgsZ0JBQWdCLENBQUMsRUFBRTtvQkFDakMsT0FBTzt3QkFDTCxPQUFPLElBQUksQ0FBQ0EsZ0JBQWdCLENBQUMsRUFBRTtvQkFDakM7Z0JBQ0Y7Z0JBRUYscURBQXFEO2dCQUNuRGhDLFNBQVM5QyxTQUFTLENBQUNvTCx3QkFBd0IsR0FBRyxTQUFTak0sQ0FBQztvQkFDdEQscURBQXFEO29CQUNyRCxJQUFJQSxNQUFNLElBQUksQ0FBQ29OLE9BQU8sQ0FBQyxFQUFFLEVBQUU7d0JBQ3pCLE9BQU8sSUFBSSxDQUFDekgsZ0JBQWdCLENBQUMsRUFBRTtvQkFDakMsT0FBTyxJQUFJM0YsTUFBTSxJQUFJLENBQUNvTixPQUFPLENBQUMsRUFBRSxFQUFFO3dCQUNoQyxPQUFPLElBQUksQ0FBQ3pILGdCQUFnQixDQUFDLEVBQUU7b0JBQ2pDLE9BQU87d0JBQ0wsT0FBTyxJQUFJLENBQUNBLGdCQUFnQixDQUFDLEVBQUU7b0JBQ2pDO2dCQUNGO2dCQUVBaEMsU0FBUzlDLFNBQVMsQ0FBQytKLG9CQUFvQixHQUFHLFNBQVM1SyxDQUFDLEVBQUUwUSxFQUFFO29CQUN0RCxxREFBcUQ7b0JBQ3JELElBQUkxUSxNQUFNLElBQUksQ0FBQ29OLE9BQU8sQ0FBQyxFQUFFLEVBQUU7d0JBQ3pCLElBQUksQ0FBQ3pILGdCQUFnQixDQUFDLEVBQUUsR0FBRytLO29CQUM3QixPQUFPLElBQUkxUSxNQUFNLElBQUksQ0FBQ29OLE9BQU8sQ0FBQyxFQUFFLEVBQUU7d0JBQ2hDLElBQUksQ0FBQ3pILGdCQUFnQixDQUFDLEVBQUUsR0FBRytLO29CQUM3QixPQUFPO3dCQUNMLElBQUksQ0FBQy9LLGdCQUFnQixDQUFDLEVBQUUsR0FBRytLO29CQUM3QjtnQkFDRjtnQkFFQS9NLFNBQVM5QyxTQUFTLENBQUM4SixxQkFBcUIsR0FBRyxTQUFTM0ssQ0FBQyxFQUFFMFEsRUFBRTtvQkFDdkQscURBQXFEO29CQUNyRCxJQUFJMVEsTUFBTSxJQUFJLENBQUNvTixPQUFPLENBQUMsRUFBRSxFQUFFO3dCQUN6QixJQUFJLENBQUN6SCxnQkFBZ0IsQ0FBQyxFQUFFLEdBQUcrSztvQkFDN0IsT0FBTyxJQUFJMVEsTUFBTSxJQUFJLENBQUNvTixPQUFPLENBQUMsRUFBRSxFQUFFO3dCQUNoQyxJQUFJLENBQUN6SCxnQkFBZ0IsQ0FBQyxFQUFFLEdBQUcrSztvQkFDN0IsT0FBTzt3QkFDTCxJQUFJLENBQUMvSyxnQkFBZ0IsQ0FBQyxFQUFFLEdBQUcrSztvQkFDN0I7Z0JBQ0Y7Z0JBRUEvTSxTQUFTOUMsU0FBUyxDQUFDMkosaUJBQWlCLEdBQUcsU0FBU3hLLENBQUM7b0JBQy9DLHFEQUFxRDtvQkFDckQsSUFBSUEsTUFBTSxJQUFJLENBQUNvTixPQUFPLENBQUMsRUFBRSxFQUFFO3dCQUN6QixPQUFPLElBQUksQ0FBQ3pGLGFBQWEsQ0FBQyxFQUFFO29CQUM5QixPQUFPLElBQUkzSCxNQUFNLElBQUksQ0FBQ29OLE9BQU8sQ0FBQyxFQUFFLEVBQUU7d0JBQ2hDLE9BQU8sSUFBSSxDQUFDekYsYUFBYSxDQUFDLEVBQUU7b0JBQzlCLE9BQU87d0JBQ0wsT0FBTyxJQUFJLENBQUNBLGFBQWEsQ0FBQyxFQUFFO29CQUM5QjtnQkFDRjtnQkFFQWhFLFNBQVM5QyxTQUFTLENBQUMwSixrQkFBa0IsR0FBRyxTQUFTdkssQ0FBQztvQkFDaEQscURBQXFEO29CQUNyRCxJQUFJQSxNQUFNLElBQUksQ0FBQ29OLE9BQU8sQ0FBQyxFQUFFLEVBQUU7d0JBQ3pCLE9BQU8sSUFBSSxDQUFDekYsYUFBYSxDQUFDLEVBQUU7b0JBQzlCLE9BQU8sSUFBSTNILE1BQU0sSUFBSSxDQUFDb04sT0FBTyxDQUFDLEVBQUUsRUFBRTt3QkFDaEMsT0FBTyxJQUFJLENBQUN6RixhQUFhLENBQUMsRUFBRTtvQkFDOUIsT0FBTzt3QkFDTCxPQUFPLElBQUksQ0FBQ0EsYUFBYSxDQUFDLEVBQUU7b0JBQzlCO2dCQUNGO2dCQUVBaEUsU0FBUzlDLFNBQVMsQ0FBQzZKLGlCQUFpQixHQUFHLFNBQVMxSyxDQUFDLEVBQUV4QixDQUFDO29CQUNsRCxxREFBcUQ7b0JBQ3JELElBQUl3QixNQUFNLElBQUksQ0FBQ29OLE9BQU8sQ0FBQyxFQUFFLEVBQUU7d0JBQ3pCLElBQUksQ0FBQ3pGLGFBQWEsQ0FBQyxFQUFFLEdBQUduSjtvQkFDMUIsT0FBTyxJQUFJd0IsTUFBTSxJQUFJLENBQUNvTixPQUFPLENBQUMsRUFBRSxFQUFFO3dCQUNoQyxJQUFJLENBQUN6RixhQUFhLENBQUMsRUFBRSxHQUFHbko7b0JBQzFCLE9BQU87d0JBQ0wsSUFBSSxDQUFDbUosYUFBYSxDQUFDLEVBQUUsR0FBR25KO29CQUMxQjtnQkFDRjtnQkFFQW1GLFNBQVM5QyxTQUFTLENBQUM0SixrQkFBa0IsR0FBRyxTQUFTekssQ0FBQyxFQUFFeEIsQ0FBQztvQkFDbkQscURBQXFEO29CQUNyRCxJQUFJd0IsTUFBTSxJQUFJLENBQUNvTixPQUFPLENBQUMsRUFBRSxFQUFFO3dCQUN6QixJQUFJLENBQUN6RixhQUFhLENBQUMsRUFBRSxHQUFHbko7b0JBQzFCLE9BQU8sSUFBSXdCLE1BQU0sSUFBSSxDQUFDb04sT0FBTyxDQUFDLEVBQUUsRUFBRTt3QkFDaEMsSUFBSSxDQUFDekYsYUFBYSxDQUFDLEVBQUUsR0FBR25KO29CQUMxQixPQUFPO3dCQUNMLElBQUksQ0FBQ21KLGFBQWEsQ0FBQyxFQUFFLEdBQUduSjtvQkFDMUI7Z0JBQ0Y7Z0JBRUE7Ozs7O0dBS0MsR0FDRG1GLFNBQVM5QyxTQUFTLENBQUNtTCxjQUFjLEdBQUcsU0FBU2hNLENBQUM7b0JBQzVDLHFEQUFxRDtvQkFDckQsSUFBSUEsTUFBTSxJQUFJLENBQUNvTixPQUFPLENBQUMsRUFBRSxFQUFFO3dCQUN6QixPQUFPLElBQUksQ0FBQzRDLFVBQVUsQ0FBQyxFQUFFO29CQUMzQixPQUFPLElBQUloUSxNQUFNLElBQUksQ0FBQ29OLE9BQU8sQ0FBQyxFQUFFLEVBQUU7d0JBQ2hDLE9BQU8sSUFBSSxDQUFDNEMsVUFBVSxDQUFDLEVBQUU7b0JBQzNCLE9BQU87d0JBQ0wsT0FBTyxJQUFJLENBQUNBLFVBQVUsQ0FBQyxFQUFFO29CQUMzQjtnQkFDRjtnQkFFQTs7OztHQUlDLEdBQ0RyTSxTQUFTOUMsU0FBUyxDQUFDaUgsYUFBYSxHQUFHLFNBQVM1SSxDQUFDLEVBQUVjLENBQUM7b0JBQzlDLElBQUkyUSxLQUFLelIsRUFBRXNILE9BQU8sQ0FBQ3hHO29CQUNuQixPQUFPLElBQUksQ0FBQ3dHLE9BQU8sQ0FBQ21LO2dCQUN0QjtnQkFFQTs7Ozs7O0dBTUMsR0FDRGhOLFNBQVM5QyxTQUFTLENBQUN1RyxRQUFRLEdBQUcsU0FBU3dKLE1BQU0sRUFBRUMsTUFBTTtvQkFDbkQsSUFBSXpOLFNBQVMsSUFBSSxDQUFDZ0ssT0FBTztvQkFDekIscURBQXFEO29CQUNyRCxJQUFJd0QsV0FBV3hOLE1BQU0sQ0FBQyxFQUFFLEVBQUU7d0JBQ3hCQSxNQUFNLENBQUMsRUFBRSxHQUFHQSxNQUFNLENBQUMsRUFBRTt3QkFDckJBLE1BQU0sQ0FBQyxFQUFFLEdBQUdBLE1BQU0sQ0FBQyxFQUFFO3dCQUNyQkEsTUFBTSxDQUFDLEVBQUUsR0FBR3lOO29CQUNkLE9BQU8sSUFBSUQsV0FBV3hOLE1BQU0sQ0FBQyxFQUFFLEVBQUU7d0JBQy9CQSxNQUFNLENBQUMsRUFBRSxHQUFHQSxNQUFNLENBQUMsRUFBRTt3QkFDckJBLE1BQU0sQ0FBQyxFQUFFLEdBQUdBLE1BQU0sQ0FBQyxFQUFFO3dCQUNyQkEsTUFBTSxDQUFDLEVBQUUsR0FBR3lOO29CQUNkLE9BQU8sSUFBSUQsV0FBV3hOLE1BQU0sQ0FBQyxFQUFFLEVBQUU7d0JBQy9CQSxNQUFNLENBQUMsRUFBRSxHQUFHQSxNQUFNLENBQUMsRUFBRTt3QkFDckJBLE1BQU0sQ0FBQyxFQUFFLEdBQUdBLE1BQU0sQ0FBQyxFQUFFO3dCQUNyQkEsTUFBTSxDQUFDLEVBQUUsR0FBR3lOO29CQUNkLE9BQU87d0JBQ0wsTUFBTSxJQUFJbFIsTUFBTTtvQkFDbEI7Z0JBQ0Y7Z0JBRUE7Ozs7Ozs7R0FPQyxHQUNEZ0UsU0FBUzlDLFNBQVMsQ0FBQ2dHLEtBQUssR0FBRyxTQUFTN0csQ0FBQztvQkFDbkMsSUFBSW9ELFNBQVMsSUFBSSxDQUFDZ0ssT0FBTztvQkFDekIscURBQXFEO29CQUNyRCxJQUFJcE4sTUFBTW9ELE1BQU0sQ0FBQyxFQUFFLEVBQUU7d0JBQ25CLE9BQU87b0JBQ1QsT0FBTyxJQUFJcEQsTUFBTW9ELE1BQU0sQ0FBQyxFQUFFLEVBQUU7d0JBQzFCLE9BQU87b0JBQ1QsT0FBTyxJQUFJcEQsTUFBTW9ELE1BQU0sQ0FBQyxFQUFFLEVBQUU7d0JBQzFCLE9BQU87b0JBQ1QsT0FBTzt3QkFDTCxNQUFNLElBQUl6RCxNQUFNO29CQUNsQjtnQkFDRjtnQkFFQTs7Ozs7R0FLQyxHQUNEZ0UsU0FBUzlDLFNBQVMsQ0FBQ2lHLFNBQVMsR0FBRyxTQUFTWCxFQUFFLEVBQUVJLEVBQUU7b0JBQzVDLElBQUluRCxTQUFTLElBQUksQ0FBQ2dLLE9BQU87b0JBQ3pCLHFEQUFxRDtvQkFDckQsSUFBSWpILE9BQU8vQyxNQUFNLENBQUMsRUFBRSxFQUFFO3dCQUNwQixJQUFJbUQsT0FBT25ELE1BQU0sQ0FBQyxFQUFFLEVBQUU7NEJBQ3BCLE9BQU87d0JBQ1QsT0FBTyxJQUFJbUQsT0FBT25ELE1BQU0sQ0FBQyxFQUFFLEVBQUU7NEJBQzNCLE9BQU87d0JBQ1Q7b0JBQ0YsT0FBTyxJQUFJK0MsT0FBTy9DLE1BQU0sQ0FBQyxFQUFFLEVBQUU7d0JBQzNCLElBQUltRCxPQUFPbkQsTUFBTSxDQUFDLEVBQUUsRUFBRTs0QkFDcEIsT0FBTzt3QkFDVCxPQUFPLElBQUltRCxPQUFPbkQsTUFBTSxDQUFDLEVBQUUsRUFBRTs0QkFDM0IsT0FBTzt3QkFDVDtvQkFDRixPQUFPLElBQUkrQyxPQUFPL0MsTUFBTSxDQUFDLEVBQUUsRUFBRTt3QkFDM0IsSUFBSW1ELE9BQU9uRCxNQUFNLENBQUMsRUFBRSxFQUFFOzRCQUNwQixPQUFPO3dCQUNULE9BQU8sSUFBSW1ELE9BQU9uRCxNQUFNLENBQUMsRUFBRSxFQUFFOzRCQUMzQixPQUFPO3dCQUNUO29CQUNGO29CQUNBLE9BQU8sQ0FBQztnQkFDVjtnQkFFQTs7OztHQUlDLEdBQ0RPLFNBQVM5QyxTQUFTLENBQUNrRywwQkFBMEIsR0FBRyxTQUFTRixLQUFLO29CQUM1RCxJQUFJLENBQUNsQixnQkFBZ0IsQ0FBQ2tCLE1BQU0sR0FBRztnQkFDakM7Z0JBQ0E7Ozs7R0FJQyxHQUNEbEQsU0FBUzlDLFNBQVMsQ0FBQ2lRLHlCQUF5QixHQUFHLFNBQVNyTCxJQUFJO29CQUMxRCxJQUFJLENBQUN3QiwyQkFBMkIsQ0FBQ3hCLEtBQUt6RixDQUFDLEVBQUV5RixLQUFLSSxDQUFDO2dCQUNqRDtnQkFDQTs7Ozs7O0dBTUMsR0FDRGxDLFNBQVM5QyxTQUFTLENBQUNvRywyQkFBMkIsR0FBRyxTQUFTakgsQ0FBQyxFQUFFNkYsQ0FBQztvQkFDNUQsSUFBSXpDLFNBQVMsSUFBSSxDQUFDZ0ssT0FBTztvQkFDekIscURBQXFEO29CQUNyRCxJQUFJLEFBQUN2SCxNQUFNekMsTUFBTSxDQUFDLEVBQUUsSUFBSXBELE1BQU1vRCxNQUFNLENBQUMsRUFBRSxJQUFNeUMsTUFBTXpDLE1BQU0sQ0FBQyxFQUFFLElBQUlwRCxNQUFNb0QsTUFBTSxDQUFDLEVBQUUsRUFBRzt3QkFDaEYsSUFBSSxDQUFDdUMsZ0JBQWdCLENBQUMsRUFBRSxHQUFHO29CQUM3QixPQUFPLElBQUksQUFBQ0UsTUFBTXpDLE1BQU0sQ0FBQyxFQUFFLElBQUlwRCxNQUFNb0QsTUFBTSxDQUFDLEVBQUUsSUFBTXlDLE1BQU16QyxNQUFNLENBQUMsRUFBRSxJQUFJcEQsTUFBTW9ELE1BQU0sQ0FBQyxFQUFFLEVBQUc7d0JBQ3ZGLElBQUksQ0FBQ3VDLGdCQUFnQixDQUFDLEVBQUUsR0FBRztvQkFDN0IsT0FBTyxJQUFJLEFBQUNFLE1BQU16QyxNQUFNLENBQUMsRUFBRSxJQUFJcEQsTUFBTW9ELE1BQU0sQ0FBQyxFQUFFLElBQU15QyxNQUFNekMsTUFBTSxDQUFDLEVBQUUsSUFBSXBELE1BQU1vRCxNQUFNLENBQUMsRUFBRSxFQUFHO3dCQUN2RixJQUFJLENBQUN1QyxnQkFBZ0IsQ0FBQyxFQUFFLEdBQUc7b0JBQzdCO2dCQUNGO2dCQUdGLGdGQUFnRjtnQkFFOUVqSCxRQUFPRCxPQUFPLEdBQUdrRjtZQUVuQjtZQUFFO2dCQUFDLFFBQU87WUFBRTtTQUFFO1FBQUMsSUFBRztZQUFDLFNBQVM3RCxPQUFPLEVBQUNwQixPQUFNLEVBQUNELFFBQU87Z0JBQ2hEOzs7Ozs7Ozs7O0dBVUMsR0FFRDtnQkFFQTs7Ozs7R0FLQyxHQUNELElBQUl3RixVQUFVO2dCQUNkeEYsU0FBUXdGLE9BQU8sR0FBR0E7Z0JBRWxCOzs7O0dBSUMsR0FDRCxJQUFJQyxjQUFjO29CQUNoQixNQUFNO29CQUNOLE9BQU8sQ0FBQztvQkFDUixhQUFhO2dCQUNmO2dCQUNBekYsU0FBUXlGLFdBQVcsR0FBR0E7Z0JBR3RCOzs7Ozs7Ozs7Ozs7Ozs7R0FlQyxHQUNELFNBQVNDLFNBQVNpRSxFQUFFLEVBQUVDLEVBQUUsRUFBRUMsRUFBRTtvQkFDMUIsSUFBSXlJLFVBQVUsQUFBQzNJLENBQUFBLEdBQUc5SCxDQUFDLEdBQUdnSSxHQUFHaEksQ0FBQyxBQUFEQSxJQUFNK0gsQ0FBQUEsR0FBR3hHLENBQUMsR0FBR3lHLEdBQUd6RyxDQUFDLEFBQURBO29CQUN6QyxJQUFJbVAsV0FBVyxBQUFDNUksQ0FBQUEsR0FBR3ZHLENBQUMsR0FBR3lHLEdBQUd6RyxDQUFDLEFBQURBLElBQU13RyxDQUFBQSxHQUFHL0gsQ0FBQyxHQUFHZ0ksR0FBR2hJLENBQUMsQUFBREE7b0JBQzFDLElBQUkyUSxNQUFNRixVQUFVQztvQkFDcEIsSUFBSUMsTUFBTSxDQUFFaE4sV0FBWWdOLE1BQU9oTixTQUFVO3dCQUN2QyxPQUFPQyxZQUFZb0MsU0FBUztvQkFDOUIsT0FBTyxJQUFJMkssTUFBTSxHQUFHO3dCQUNsQixPQUFPL00sWUFBWTRHLEdBQUc7b0JBQ3hCLE9BQU87d0JBQ0wsT0FBTzVHLFlBQVl3QyxFQUFFO29CQUN2QjtnQkFDRjtnQkFDQWpJLFNBQVEwRixRQUFRLEdBQUdBO2dCQUduQjs7Ozs7Ozs7R0FRQyxHQUNELFNBQVNDLFdBQVdnRSxFQUFFLEVBQUVDLEVBQUUsRUFBRUMsRUFBRSxFQUFFQyxFQUFFO29CQUNoQyxJQUFJMkksT0FBTyxBQUFDOUksQ0FBQUEsR0FBRzlILENBQUMsR0FBRytILEdBQUcvSCxDQUFDLEFBQURBLElBQU1pSSxDQUFBQSxHQUFHMUcsQ0FBQyxHQUFHd0csR0FBR3hHLENBQUMsQUFBREEsSUFBSyxBQUFDMEcsQ0FBQUEsR0FBR2pJLENBQUMsR0FBRytILEdBQUcvSCxDQUFDLEFBQURBLElBQU04SCxDQUFBQSxHQUFHdkcsQ0FBQyxHQUFHd0csR0FBR3hHLENBQUMsQUFBREE7b0JBQ3RFLElBQUlxUCxRQUFRLENBQUNqTixTQUFTO3dCQUNwQixPQUFPO29CQUNUO29CQUVBLElBQUlrTixPQUFPLEFBQUMvSSxDQUFBQSxHQUFHOUgsQ0FBQyxHQUFHZ0ksR0FBR2hJLENBQUMsQUFBREEsSUFBTWlJLENBQUFBLEdBQUcxRyxDQUFDLEdBQUd5RyxHQUFHekcsQ0FBQyxBQUFEQSxJQUFLLEFBQUMwRyxDQUFBQSxHQUFHakksQ0FBQyxHQUFHZ0ksR0FBR2hJLENBQUMsQUFBREEsSUFBTThILENBQUFBLEdBQUd2RyxDQUFDLEdBQUd5RyxHQUFHekcsQ0FBQyxBQUFEQTtvQkFDdEUsSUFBSXNQLFFBQVFsTixTQUFTO3dCQUNuQixPQUFPO29CQUNUO29CQUNBLE9BQU87Z0JBQ1Q7Z0JBQ0F4RixTQUFRMkYsVUFBVSxHQUFHQTtnQkFHckI7Ozs7Ozs7O0dBUUMsR0FDRCxTQUFTQyxjQUFjK0QsRUFBRSxFQUFFQyxFQUFFLEVBQUVDLEVBQUU7b0JBQy9CLElBQUlkLEtBQUthLEdBQUcvSCxDQUFDLEdBQUc4SCxHQUFHOUgsQ0FBQztvQkFDcEIsSUFBSW1ILEtBQUtZLEdBQUd4RyxDQUFDLEdBQUd1RyxHQUFHdkcsQ0FBQztvQkFDcEIsSUFBSXVQLEtBQUs5SSxHQUFHaEksQ0FBQyxHQUFHOEgsR0FBRzlILENBQUM7b0JBQ3BCLElBQUkrUSxLQUFLL0ksR0FBR3pHLENBQUMsR0FBR3VHLEdBQUd2RyxDQUFDO29CQUNwQixPQUFPLEFBQUMyRixLQUFLNEosS0FBSzNKLEtBQUs0SixLQUFNO2dCQUMvQjtnQkFDQTVTLFNBQVE0RixhQUFhLEdBQUdBO1lBRzFCO1lBQUUsQ0FBQztTQUFFO1FBQUMsSUFBRztZQUFDLFNBQVN2RSxPQUFPLEVBQUNwQixPQUFNLEVBQUNELFFBQU87Z0JBQ3ZDOzs7Ozs7Ozs7O0dBVUMsR0FFRDtnQkFFQTs7Ozs7O0dBTUMsR0FFRDs7Ozs7Ozs7Ozs7Ozs7Ozs7R0FpQkMsR0FHRDs7Ozs7Ozs7R0FRQyxHQUNELFNBQVN1RCxhQUFhaEMsQ0FBQztvQkFDckIsT0FBUSxNQUFNQSxFQUFFTSxDQUFDLEdBQUcsTUFBTU4sRUFBRTZCLENBQUMsR0FBRztnQkFDbEM7Z0JBRUE7Ozs7Ozs7Ozs7O0dBV0MsR0FDRCxTQUFTRSxTQUFTL0IsQ0FBQztvQkFDakIsMEVBQTBFO29CQUMxRSxJQUFJWCxJQUFJVyxFQUFFK0IsUUFBUTtvQkFDbEIsT0FBUTFDLE1BQU0sb0JBQW9CMkMsYUFBYWhDLEtBQUtYO2dCQUN0RDtnQkFHQTs7Ozs7OztHQU9DLEdBQ0QsU0FBUzJELFFBQVF4RCxDQUFDLEVBQUVzRCxDQUFDO29CQUNuQixJQUFJdEQsRUFBRXFDLENBQUMsS0FBS2lCLEVBQUVqQixDQUFDLEVBQUU7d0JBQ2YsT0FBT3JDLEVBQUVjLENBQUMsR0FBR3dDLEVBQUV4QyxDQUFDO29CQUNsQixPQUFPO3dCQUNMLE9BQU9kLEVBQUVxQyxDQUFDLEdBQUdpQixFQUFFakIsQ0FBQztvQkFDbEI7Z0JBQ0Y7Z0JBRUE7Ozs7O0dBS0MsR0FDRCxTQUFTZ0IsT0FBT3JELENBQUMsRUFBRXNELENBQUM7b0JBQ2xCLE9BQU90RCxFQUFFYyxDQUFDLEtBQUt3QyxFQUFFeEMsQ0FBQyxJQUFJZCxFQUFFcUMsQ0FBQyxLQUFLaUIsRUFBRWpCLENBQUM7Z0JBQ25DO2dCQUdBbkQsUUFBT0QsT0FBTyxHQUFHO29CQUNmc0QsVUFBVUE7b0JBQ1ZDLGNBQWNBO29CQUNkZ0IsU0FBU0E7b0JBQ1RILFFBQVFBO2dCQUNWO1lBRUY7WUFBRSxDQUFDO1NBQUU7SUFBQSxHQUFFLENBQUMsR0FBRTtRQUFDO0tBQUUsRUFDWjtBQUNEIn0=