// Copyright 2017-2024, University of Colorado Boulder
/**
 * Handles constrained Delaunay triangulation based on "Sweep-line algorithm for constrained Delaunay triangulation"
 * by Domiter and Zalik (2008), with some details provided by "An efficient sweep-line Delaunay triangulation
 * algorithm" by Zalik (2005).
 *
 * TODO: Second (basin) heuristic not yet implemented. https://github.com/phetsims/dot/issues/96
 * TODO: Constraints not yet implemented.
 * TODO: Check number of triangles/edges/vertices with Euler's Formula
 * TODO: Handle "outside" cases (and changing the front edges) for constrained edges
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ import arrayRemove from '../../phet-core/js/arrayRemove.js';
import merge from '../../phet-core/js/merge.js';
import Bounds2 from './Bounds2.js';
import dot from './dot.js';
import Utils from './Utils.js';
import Vector2 from './Vector2.js';
let DelaunayTriangulation = class DelaunayTriangulation {
    /**
   * Moves the triangulation forward by a vertex.
   * @private
   */ step() {
        // TODO: reverse the array prior to this? https://github.com/phetsims/dot/issues/96
        const vertex = this.remainingVertices.shift();
        const x = vertex.point.x;
        let frontEdge = this.firstFrontEdge;
        while(frontEdge){
            // TODO: epsilon needed here? https://github.com/phetsims/dot/issues/96
            if (x > frontEdge.endVertex.point.x) {
                const edge1 = new Edge(frontEdge.startVertex, vertex);
                const edge2 = new Edge(vertex, frontEdge.endVertex);
                edge1.connectAfter(edge2);
                this.edges.push(edge1);
                this.edges.push(edge2);
                this.triangles.push(new Triangle(frontEdge.endVertex, frontEdge.startVertex, vertex, edge1, edge2, frontEdge));
                this.reconnectFrontEdges(frontEdge, frontEdge, edge1, edge2);
                this.legalizeEdge(frontEdge);
                this.addHalfPiHeuristic(edge1, edge2);
                this.constrainEdges(vertex, edge1, edge2);
                break;
            } else if (x === frontEdge.endVertex.point.x) {
                const leftOldEdge = frontEdge.nextEdge;
                const rightOldEdge = frontEdge;
                assert && assert(leftOldEdge !== null);
                const middleOldVertex = frontEdge.endVertex;
                const leftVertex = leftOldEdge.endVertex;
                const rightVertex = rightOldEdge.startVertex;
                const leftEdge = new Edge(vertex, leftVertex);
                const rightEdge = new Edge(rightVertex, vertex);
                const middleEdge = new Edge(middleOldVertex, vertex);
                rightEdge.connectAfter(leftEdge);
                this.edges.push(leftEdge);
                this.edges.push(rightEdge);
                this.edges.push(middleEdge);
                this.triangles.push(new Triangle(leftVertex, middleOldVertex, vertex, middleEdge, leftEdge, leftOldEdge));
                this.triangles.push(new Triangle(middleOldVertex, rightVertex, vertex, rightEdge, middleEdge, rightOldEdge));
                this.reconnectFrontEdges(rightOldEdge, leftOldEdge, rightEdge, leftEdge);
                this.legalizeEdge(leftOldEdge);
                this.legalizeEdge(rightOldEdge);
                this.legalizeEdge(middleEdge);
                this.addHalfPiHeuristic(rightEdge, leftEdge);
                this.constrainEdges(vertex, rightEdge, leftEdge);
                break;
            }
            frontEdge = frontEdge.nextEdge;
        }
    }
    /**
   * Builds a triangle between two vertices.
   * @private
   *
   * @param {Edge} firstEdge
   * @param {Edge} secondEdge
   * @param {Vertex} firstSideVertex
   * @param {Vertex} middleVertex
   * @param {Vertex} secondSideVertex
   * @returns {Edge} - The newly created edge
   */ fillBorderTriangle(firstEdge, secondEdge, firstSideVertex, middleVertex, secondSideVertex) {
        assert && assert(firstEdge instanceof Edge);
        assert && assert(secondEdge instanceof Edge);
        assert && assert(firstSideVertex instanceof Vertex);
        assert && assert(middleVertex instanceof Vertex);
        assert && assert(secondSideVertex instanceof Vertex);
        assert && assert(middleVertex === firstEdge.startVertex || middleVertex === firstEdge.endVertex, 'middleVertex should be in firstEdge');
        assert && assert(middleVertex === secondEdge.startVertex || middleVertex === secondEdge.endVertex, 'middleVertex should be in secondEdge');
        assert && assert(firstSideVertex === firstEdge.startVertex || firstSideVertex === firstEdge.endVertex, 'firstSideVertex should be in firstEdge');
        assert && assert(secondSideVertex === secondEdge.startVertex || secondSideVertex === secondEdge.endVertex, 'secondSideVertex should be in secondEdge');
        const newEdge = new Edge(firstSideVertex, secondSideVertex);
        this.edges.push(newEdge);
        this.triangles.push(new Triangle(secondSideVertex, middleVertex, firstSideVertex, firstEdge, newEdge, secondEdge));
        this.legalizeEdge(firstEdge);
        this.legalizeEdge(secondEdge);
        return newEdge;
    }
    /**
   * Disconnects a section of front edges, and connects a new section.
   * @private
   *
   * Disconnects:
   * <nextEdge> (cut) <oldLeftEdge> ..... <oldRightEdge> (cut) <previousEdge>
   *
   * Connects:
   * <nextEdge> (join) <newLeftEdge> ..... <newRightEdge> (join) <previousEdge>
   *
   * If previousEdge is null, we'll need to set our firstFrontEdge to the newRightEdge.
   *
   * @param {Edge} oldRightEdge
   * @param {Edge} oldLeftEdge
   * @param {Edge} newRightEdge
   * @param {Edge} newLeftEdge
   */ reconnectFrontEdges(oldRightEdge, oldLeftEdge, newRightEdge, newLeftEdge) {
        const previousEdge = oldRightEdge.previousEdge;
        const nextEdge = oldLeftEdge.nextEdge;
        if (previousEdge) {
            previousEdge.disconnectAfter();
            previousEdge.connectAfter(newRightEdge);
        } else {
            this.firstFrontEdge = newRightEdge;
        }
        if (nextEdge) {
            oldLeftEdge.disconnectAfter();
            newLeftEdge.connectAfter(nextEdge);
        }
    }
    /**
   * Tries to fill in acute angles with triangles after we add a vertex into the front.
   * @private
   *
   * @param {Edge} rightFrontEdge
   * @param {Edge} leftFrontEdge
   */ addHalfPiHeuristic(rightFrontEdge, leftFrontEdge) {
        assert && assert(rightFrontEdge.endVertex === leftFrontEdge.startVertex);
        const middleVertex = rightFrontEdge.endVertex;
        while(rightFrontEdge.previousEdge && Utils.triangleAreaSigned(middleVertex.point, rightFrontEdge.startVertex.point, rightFrontEdge.previousEdge.startVertex.point) > 0 && middleVertex.point.minus(rightFrontEdge.startVertex.point).angleBetween(rightFrontEdge.previousEdge.startVertex.point.minus(rightFrontEdge.startVertex.point)) < Math.PI / 2){
            const previousEdge = rightFrontEdge.previousEdge;
            const newRightEdge = new Edge(previousEdge.startVertex, middleVertex);
            this.edges.push(newRightEdge);
            this.triangles.push(new Triangle(middleVertex, rightFrontEdge.startVertex, previousEdge.startVertex, previousEdge, newRightEdge, rightFrontEdge));
            this.reconnectFrontEdges(previousEdge, rightFrontEdge, newRightEdge, newRightEdge);
            this.legalizeEdge(previousEdge);
            this.legalizeEdge(rightFrontEdge);
            rightFrontEdge = newRightEdge;
        }
        while(leftFrontEdge.nextEdge && Utils.triangleAreaSigned(middleVertex.point, leftFrontEdge.nextEdge.endVertex.point, leftFrontEdge.endVertex.point) > 0 && middleVertex.point.minus(leftFrontEdge.endVertex.point).angleBetween(leftFrontEdge.nextEdge.endVertex.point.minus(leftFrontEdge.endVertex.point)) < Math.PI / 2){
            const nextEdge = leftFrontEdge.nextEdge;
            const newLeftEdge = new Edge(middleVertex, nextEdge.endVertex);
            this.edges.push(newLeftEdge);
            this.triangles.push(new Triangle(middleVertex, leftFrontEdge.nextEdge.endVertex, leftFrontEdge.endVertex, nextEdge, leftFrontEdge, newLeftEdge));
            this.reconnectFrontEdges(leftFrontEdge, nextEdge, newLeftEdge, newLeftEdge);
            this.legalizeEdge(nextEdge);
            this.legalizeEdge(leftFrontEdge);
            leftFrontEdge = newLeftEdge;
        }
    }
    /**
   * Handles any "edge events" that delete intersecting edges, creating the new edge, and filling in (all only if
   * necessary).
   * @private
   *
   * @param {Vertex} vertex
   * @param {Edge} rightFrontEdge
   * @param {Edge} leftFrontEdge
   */ constrainEdges(vertex, rightFrontEdge, leftFrontEdge) {
        assert && assert(vertex instanceof Vertex);
        assert && assert(rightFrontEdge instanceof Edge);
        assert && assert(leftFrontEdge instanceof Edge);
        assert && assert(vertex === rightFrontEdge.endVertex);
        assert && assert(vertex === leftFrontEdge.startVertex);
        for(let i = 0; i < vertex.constrainedVertices.length; i++){
            const bottomVertex = vertex.constrainedVertices[i];
            // Check if it's one of our front edge vertices (if so, bail out, since the edge already exists)
            if (bottomVertex === rightFrontEdge.startVertex || bottomVertex === leftFrontEdge.endVertex) {
                break;
            }
            const leftEdges = [];
            const rightEdges = [];
            let currentTriangle = null;
            let currentEdge = null;
            const trianglesToRemove = [];
            const edgesToRemove = [];
            let outsideRight = DelaunayTriangulation.vertexProduct(vertex, rightFrontEdge.startVertex, bottomVertex) > 0;
            let outsideLeft = DelaunayTriangulation.vertexProduct(vertex, leftFrontEdge.endVertex, bottomVertex) < 0;
            // If we start inside, we need to identify which triangle we're inside of.
            if (!outsideRight && !outsideLeft) {
                assert && assert(rightFrontEdge.triangles.length === 1);
                assert && assert(leftFrontEdge.triangles.length === 1);
                let lastVertex = rightFrontEdge.startVertex;
                let nextVertex;
                currentTriangle = rightFrontEdge.triangles[0];
                // TODO: Triangle operations to make this more readable https://github.com/phetsims/dot/issues/96
                while(DelaunayTriangulation.vertexProduct(vertex, nextVertex = currentTriangle.getEdgeOppositeFromVertex(vertex).getOtherVertex(lastVertex), bottomVertex) < 0){
                    currentTriangle = currentTriangle.getEdgeOppositeFromVertex(lastVertex).getOtherTriangle(currentTriangle);
                    lastVertex = nextVertex;
                }
                // If our initial triangle has our vertex and bottomVertex, then bail out (edge already exists)
                if (currentTriangle.hasVertex(bottomVertex)) {
                    break;
                }
                trianglesToRemove.push(currentTriangle);
                currentEdge = currentTriangle.getEdgeOppositeFromVertex(vertex);
                edgesToRemove.push(currentEdge);
                leftEdges.push(currentTriangle.getEdgeOppositeFromVertex(lastVertex));
                rightEdges.push(currentTriangle.getEdgeOppositeFromVertex(currentEdge.getOtherVertex(lastVertex)));
                assert && assert(leftEdges[0].getOtherVertex(vertex).point.x < rightEdges[0].getOtherVertex(vertex).point.x);
            }
            while(true){
                if (outsideRight) {
                    break;
                } else if (outsideLeft) {
                    break;
                } else {
                    if (currentEdge.triangles.length > 1) {
                        const nextTriangle = currentEdge.getOtherTriangle(currentTriangle);
                        if (nextTriangle.hasVertex(bottomVertex)) {
                            // TODO: do things! https://github.com/phetsims/dot/issues/96
                            trianglesToRemove.push(nextTriangle);
                            leftEdges.push(nextTriangle.getNextEdge(currentEdge));
                            rightEdges.push(nextTriangle.getPreviousEdge(currentEdge));
                            break;
                        } else {
                            // If this is the next edge intersected
                            let nextEdge;
                            if (nextTriangle.aEdge !== currentEdge && nextTriangle.aEdge.intersectsConstrainedEdge(vertex, bottomVertex)) {
                                nextEdge = nextTriangle.aEdge;
                            } else if (nextTriangle.bEdge !== currentEdge && nextTriangle.bEdge.intersectsConstrainedEdge(vertex, bottomVertex)) {
                                nextEdge = nextTriangle.bEdge;
                            } else if (nextTriangle.cEdge !== currentEdge && nextTriangle.cEdge.intersectsConstrainedEdge(vertex, bottomVertex)) {
                                nextEdge = nextTriangle.cEdge;
                            }
                            assert && assert(nextEdge);
                            if (nextTriangle.getNextEdge(nextEdge) === currentEdge) {
                                leftEdges.push(nextTriangle.getPreviousEdge(nextEdge));
                            } else {
                                rightEdges.push(nextTriangle.getNextEdge(nextEdge));
                            }
                            currentEdge = nextEdge;
                            edgesToRemove.push(currentEdge);
                            currentTriangle = nextTriangle;
                            trianglesToRemove.push(currentTriangle);
                        }
                    } else {
                        if (bottomVertex.point.x < vertex.point.x) {
                            outsideLeft = true;
                        } else {
                            outsideRight = true;
                        }
                    }
                }
            }
            for(let j = 0; j < trianglesToRemove.length; j++){
                const triangleToRemove = trianglesToRemove[j];
                arrayRemove(this.triangles, triangleToRemove);
                triangleToRemove.remove();
            }
            for(let j = 0; j < edgesToRemove.length; j++){
                arrayRemove(this.edges, edgesToRemove[j]);
            }
            const constraintEdge = new Edge(bottomVertex, vertex);
            constraintEdge.isConstrained = true;
            this.edges.push(constraintEdge);
            leftEdges.push(constraintEdge);
            rightEdges.push(constraintEdge);
            rightEdges.reverse(); // Put edges in counterclockwise order
            // TODO: remove this! https://github.com/phetsims/dot/issues/96
            window.triDebug && window.triDebug(this);
            this.triangulatePolygon(leftEdges);
            this.triangulatePolygon(rightEdges);
        }
    }
    /**
   * Creates edges/triangles to triangulate a simple polygon.
   * @private
   *
   * @param {Array.<Edge>} edges - Should be in counterclockwise order
   */ triangulatePolygon(edges) {
        // TODO: Something more efficient than ear clipping method below https://github.com/phetsims/dot/issues/96
        while(edges.length > 3){
            for(let k = 0; k < edges.length; k++){
                const kx = k < edges.length - 1 ? k + 1 : 0;
                assert && assert(edges[k].getSharedVertex(edges[kx]));
            }
            // Check if each triple of vertices is an ear (and if so, remove it)
            for(let i = 0; i < edges.length; i++){
                // Next index
                const ix = i < edges.length - 1 ? i + 1 : 0;
                // Information about our potential ear
                const edge = edges[i];
                const nextEdge = edges[ix];
                const sharedVertex = edge.getSharedVertex(nextEdge);
                const startVertex = edge.getOtherVertex(sharedVertex);
                const endVertex = nextEdge.getOtherVertex(sharedVertex);
                if (Utils.triangleAreaSigned(startVertex.point, sharedVertex.point, endVertex.point) <= 0) {
                    continue;
                }
                // Variables for computing barycentric coordinates
                const endDelta = endVertex.point.minus(sharedVertex.point);
                const startDelta = startVertex.point.minus(sharedVertex.point);
                const endMagnitudeSquared = endDelta.dot(endDelta);
                const startEndProduct = endDelta.dot(startDelta);
                const startMagnitudeSquared = startDelta.dot(startDelta);
                const x = endMagnitudeSquared * startMagnitudeSquared - startEndProduct * startEndProduct;
                // See if there are other vertices in our triangle (it wouldn't be an ear if there is another in it)
                let lastVertex = edges[0].getSharedVertex(edges[edges.length - 1]);
                let hasInteriorVertex = false;
                for(let j = 0; j < edges.length; j++){
                    const vertex = edges[j].getOtherVertex(lastVertex);
                    if (vertex !== sharedVertex && vertex !== startVertex && vertex !== endVertex) {
                        const pointDelta = vertex.point.minus(sharedVertex.point);
                        const pointEndProduct = endDelta.dot(pointDelta);
                        const pointStartProduct = startDelta.dot(pointDelta);
                        // Compute barycentric coordinates
                        const u = (startMagnitudeSquared * pointEndProduct - startEndProduct * pointStartProduct) / x;
                        const v = (endMagnitudeSquared * pointStartProduct - startEndProduct * pointEndProduct) / x;
                        // Test for whether the point is in our triangle
                        if (u >= -1e-10 && v >= -1e-10 && u + v < 1 + 1e-10) {
                            hasInteriorVertex = true;
                            break;
                        }
                    }
                    lastVertex = vertex;
                }
                // If there is no interior vertex, then we reached an ear.
                if (!hasInteriorVertex) {
                    const newEdge = new Edge(startVertex, endVertex);
                    this.edges.push(newEdge);
                    this.triangles.push(new Triangle(startVertex, sharedVertex, endVertex, nextEdge, newEdge, edge));
                    if (ix > i) {
                        edges.splice(i, 2, newEdge);
                    } else {
                        edges.splice(i, 1, newEdge);
                        edges.splice(ix, 1);
                    }
                    // TODO: remove this! https://github.com/phetsims/dot/issues/96
                    window.triDebug && window.triDebug(this);
                }
            }
        }
        // Fill in the last triangle
        if (edges.length === 3) {
            this.triangles.push(new Triangle(edges[0].getSharedVertex(edges[1]), edges[1].getSharedVertex(edges[2]), edges[0].getSharedVertex(edges[2]), edges[2], edges[0], edges[1]));
            // TODO: remove this! https://github.com/phetsims/dot/issues/96
            window.triDebug && window.triDebug(this);
        }
    }
    /**
   * Should be called when there are no more remaining vertices left to be processed.
   * @private
   */ finalize() {
        // Accumulate front edges, excluding the first and last.
        const frontEdges = [];
        let frontEdge = this.firstFrontEdge.nextEdge;
        while(frontEdge && frontEdge.nextEdge){
            frontEdges.push(frontEdge);
            frontEdge = frontEdge.nextEdge;
        }
        const firstFrontEdge = this.firstFrontEdge;
        const lastFrontEdge = frontEdge;
        assert && assert(this.firstFrontEdge.triangles.length === 1);
        assert && assert(lastFrontEdge.triangles.length === 1);
        // Handle adding any triangles not in the convex hull (on the front edge)
        for(let i = 0; i < frontEdges.length - 1; i++){
            const firstEdge = frontEdges[i];
            const secondEdge = frontEdges[i + 1];
            if (Utils.triangleAreaSigned(secondEdge.endVertex.point, firstEdge.endVertex.point, firstEdge.startVertex.point) > 1e-10) {
                const newEdge = this.fillBorderTriangle(firstEdge, secondEdge, firstEdge.startVertex, firstEdge.endVertex, secondEdge.endVertex);
                frontEdges.splice(i, 2, newEdge);
                // start scanning from behind where we were previously (if possible)
                i = Math.max(i - 2, -1);
                // TODO: remove this! https://github.com/phetsims/dot/issues/96
                window.triDebug && window.triDebug(this);
            }
        }
        // Clear out front edge information, no longer needed.
        this.firstFrontEdge = null;
        // Accumulate back edges and items to get rid of
        const backEdges = [];
        const artificialEdges = [
            firstFrontEdge
        ];
        let currentSplitEdge = firstFrontEdge;
        while(currentSplitEdge !== lastFrontEdge){
            const nextTriangle = currentSplitEdge.triangles[0];
            nextTriangle.remove();
            arrayRemove(this.triangles, nextTriangle);
            const edge = nextTriangle.getNonArtificialEdge();
            if (edge) {
                backEdges.push(edge);
                const sharedVertex = edge.getSharedVertex(currentSplitEdge);
                currentSplitEdge = nextTriangle.getEdgeOppositeFromVertex(sharedVertex);
            } else {
                assert && assert(currentSplitEdge.startVertex === this.artificialMaxVertex);
                // Remove the "bottom" edge connecting both artificial points
                artificialEdges.push(nextTriangle.getEdgeOppositeFromVertex(currentSplitEdge.endVertex));
                // Pivot
                currentSplitEdge = nextTriangle.getEdgeOppositeFromVertex(currentSplitEdge.startVertex);
            }
            artificialEdges.push(currentSplitEdge);
        }
        for(let i = 0; i < artificialEdges.length; i++){
            arrayRemove(this.edges, artificialEdges[i]);
        }
        // TODO: remove this! https://github.com/phetsims/dot/issues/96
        window.triDebug && window.triDebug(this);
        // Handle adding any triangles not in the convex hull (on the back edge)
        for(let i = 0; i < backEdges.length - 1; i++){
            const firstEdge = backEdges[i + 1];
            const secondEdge = backEdges[i];
            const sharedVertex = firstEdge.getSharedVertex(secondEdge);
            const firstVertex = firstEdge.getOtherVertex(sharedVertex);
            const secondVertex = secondEdge.getOtherVertex(sharedVertex);
            if (Utils.triangleAreaSigned(secondVertex.point, sharedVertex.point, firstVertex.point) > 1e-10) {
                const newEdge = this.fillBorderTriangle(firstEdge, secondEdge, firstVertex, sharedVertex, secondVertex);
                backEdges.splice(i, 2, newEdge);
                // start scanning from behind where we were previously (if possible)
                i = Math.max(i - 2, -1);
                // TODO: remove this! https://github.com/phetsims/dot/issues/96
                window.triDebug && window.triDebug(this);
            }
        }
        for(let i = 0; i < frontEdges.length; i++){
            this.convexHull.push(frontEdges[i].startVertex);
        }
        this.convexHull.push(frontEdges[frontEdges.length - 1].endVertex);
        for(let i = backEdges.length - 1; i >= 1; i--){
            this.convexHull.push(backEdges[i].getSharedVertex(backEdges[i - 1]));
        }
    }
    /**
   * Checks an edge to see whether its two adjacent triangles satisfy the delaunay condition (the far point of one
   * triangle should not be contained in the other triangle's circumcircle), and if it is not satisfied, flips the
   * edge so the condition is satisfied.
   * @private
   *
   * @param {Edge} edge
   */ legalizeEdge(edge) {
        // Checking each edge to see if it isn't in our triangulation anymore (or can't be illegal because it doesn't
        // have multiple triangles) helps a lot.
        if (!_.includes(this.edges, edge) || edge.triangles.length !== 2 || edge.isConstrained) {
            return;
        }
        const triangle1 = edge.triangles[0];
        const triangle2 = edge.triangles[1];
        const farVertex1 = triangle1.getVertexOppositeFromEdge(edge);
        const farVertex2 = triangle2.getVertexOppositeFromEdge(edge);
        if (Utils.pointInCircleFromPoints(triangle1.aVertex.point, triangle1.bVertex.point, triangle1.cVertex.point, farVertex2.point) || Utils.pointInCircleFromPoints(triangle2.aVertex.point, triangle2.bVertex.point, triangle2.cVertex.point, farVertex1.point)) {
            // TODO: better helper functions for adding/removing triangles (takes care of the edge stuff) https://github.com/phetsims/dot/issues/96
            triangle1.remove();
            triangle2.remove();
            arrayRemove(this.triangles, triangle1);
            arrayRemove(this.triangles, triangle2);
            arrayRemove(this.edges, edge);
            const newEdge = new Edge(farVertex1, farVertex2);
            this.edges.push(newEdge);
            const triangle1Edge1 = triangle2.getEdgeOppositeFromVertex(triangle2.getVertexBefore(farVertex2));
            const triangle1Edge2 = triangle1.getEdgeOppositeFromVertex(triangle1.getVertexAfter(farVertex1));
            const triangle2Edge1 = triangle1.getEdgeOppositeFromVertex(triangle1.getVertexBefore(farVertex1));
            const triangle2Edge2 = triangle2.getEdgeOppositeFromVertex(triangle2.getVertexAfter(farVertex2));
            // Construct the new triangles with the correct orientations
            this.triangles.push(new Triangle(farVertex1, farVertex2, triangle1.getVertexBefore(farVertex1), triangle1Edge1, triangle1Edge2, newEdge));
            this.triangles.push(new Triangle(farVertex2, farVertex1, triangle2.getVertexBefore(farVertex2), triangle2Edge1, triangle2Edge2, newEdge));
            this.legalizeEdge(triangle1Edge1);
            this.legalizeEdge(triangle1Edge2);
            this.legalizeEdge(triangle2Edge1);
            this.legalizeEdge(triangle2Edge2);
        }
    }
    /**
   * Comparison for sorting points by y, then by x.
   * @private
   *
   * TODO: Do we need to reverse the x sort? "If our edge is horizontal, the ending point with smaller x coordinate https://github.com/phetsims/dot/issues/96
   *       is considered as the upper point"?
   *
   * @param {Vertex} a
   * @param {Vertex} b
   * @returns {number}
   */ static vertexComparison(a, b) {
        assert && assert(a instanceof Vertex);
        assert && assert(b instanceof Vertex);
        a = a.point;
        b = b.point;
        if (a.y < b.y) {
            return -1;
        } else if (a.y > b.y) {
            return 1;
        } else if (a.x < b.x) {
            return -1;
        } else if (a.x > b.x) {
            return 1;
        } else {
            // NOTE: How would the algorithm work if this is the case? Would the comparison ever test the reflexive
            // property?
            return 0;
        }
    }
    /**
   * Returns the cross product of (aVertex-sharedVertex) and (bVertex-sharedVertex)
   * @private
   *
   * @param {Vertex} sharedVertex
   * @param {Vertex} aVertex
   * @param {Vertex} bVertex
   * @returns {number}
   */ static vertexProduct(sharedVertex, aVertex, bVertex) {
        const aDiff = aVertex.point.minus(sharedVertex.point);
        const bDiff = bVertex.point.minus(sharedVertex.point);
        return aDiff.crossScalar(bDiff);
    }
    /**
   * @public
   *
   * @param {Array.<Vector2>} points
   * @param {Array.<Array.<number>>} constraints - Pairs of indices into the points that should be treated as
   *                                               constrained edges.
   * @param {Object} [options]
   */ constructor(points, constraints, options){
        options = merge({}, options);
        let i;
        // @public {Array.<Vector2>}
        this.points = points;
        // @public {Array.<Array.<number>>}
        this.constraints = constraints;
        // @public {Array.<Triangle>}
        this.triangles = [];
        // @public {Array.<Edge>}
        this.edges = [];
        // @public {Array.<Vertex>}
        this.convexHull = [];
        if (points.length === 0) {
            return;
        }
        // @private {Array.<Vertex>}
        this.vertices = points.map((point, index)=>{
            assert && assert(point instanceof Vector2 && point.isFinite());
            return new Vertex(point, index);
        });
        for(i = 0; i < this.constraints.length; i++){
            const constraint = this.constraints[i];
            const firstIndex = constraint[0];
            const secondIndex = constraint[1];
            assert && assert(typeof firstIndex === 'number' && isFinite(firstIndex) && firstIndex % 1 === 0 && firstIndex >= 0 && firstIndex < points.length);
            assert && assert(typeof secondIndex === 'number' && isFinite(secondIndex) && secondIndex % 1 === 0 && secondIndex >= 0 && secondIndex < points.length);
            assert && assert(firstIndex !== secondIndex);
            this.vertices[firstIndex].constrainedVertices.push(this.vertices[secondIndex]);
        }
        this.vertices.sort(DelaunayTriangulation.vertexComparison);
        for(i = 0; i < this.vertices.length; i++){
            const vertex = this.vertices[i];
            vertex.sortedIndex = i;
            for(let j = vertex.constrainedVertices.length - 1; j >= 0; j--){
                const otherVertex = vertex.constrainedVertices[j];
                // If the "other" vertex is later in the sweep-line order, it should have the reference to the earlier vertex,
                // not the other way around.
                if (otherVertex.sortedIndex === -1) {
                    otherVertex.constrainedVertices.push(vertex);
                    vertex.constrainedVertices.splice(j, 1);
                }
            }
        }
        // @private {Vertex}
        this.bottomVertex = this.vertices[0];
        // @private {Array.<Vertex>} - Our initialization will handle our first vertex
        this.remainingVertices = this.vertices.slice(1);
        const bounds = Bounds2.NOTHING.copy();
        for(i = points.length - 1; i >= 0; i--){
            bounds.addPoint(points[i]);
        }
        const alpha = 0.4;
        // @private {Vertex} - Fake index -1
        this.artificialMinVertex = new Vertex(new Vector2(bounds.minX - bounds.width * alpha, bounds.minY - bounds.height * alpha), -1);
        // @private {Vertex} - Fake index -2
        this.artificialMaxVertex = new Vertex(new Vector2(bounds.maxX + bounds.width * alpha, bounds.minY - bounds.height * alpha), -2);
        this.edges.push(new Edge(this.artificialMinVertex, this.artificialMaxVertex));
        this.edges.push(new Edge(this.artificialMaxVertex, this.bottomVertex));
        this.edges.push(new Edge(this.bottomVertex, this.artificialMinVertex));
        // Set up our first (artificial) triangle.
        this.triangles.push(new Triangle(this.artificialMinVertex, this.artificialMaxVertex, this.bottomVertex, this.edges[1], this.edges[2], this.edges[0]));
        // @private {Edge|null} - The start of our front (the edges at the front of the sweep-line)
        this.firstFrontEdge = this.edges[1];
        this.edges[1].connectAfter(this.edges[2]);
        // @private {Edge} - The start of our hull (the edges at the back, making up the convex hull)
        this.firstHullEdge = this.edges[0];
    }
};
dot.register('DelaunayTriangulation', DelaunayTriangulation);
let Vertex = class Vertex {
    /**
   * Returns whether this is an artificial vertex (index less than zero).
   * @public
   *
   * @returns {boolean}
   */ isArtificial() {
        return this.index < 0;
    }
    /**
   * Vertex (point with an index)
   * @private
   *
   * @param {Vector2} point
   * @param {number} index - Index of the point in the points array
   */ constructor(point, index){
        assert && assert(point instanceof Vector2);
        assert && assert(point.isFinite());
        assert && assert(typeof index === 'number');
        // @public {Vector2}
        this.point = point;
        // @public {number}
        this.index = index;
        // @public {number} - Will be set after construction
        this.sortedIndex = -1;
        // @public {Array.<Vertex>} - Vertices with "lower" y values that have constrained edges with this vertex.
        this.constrainedVertices = [];
    }
};
let Edge = class Edge {
    /**
   * Returns whether this is an artificial edge (has an artificial vertex)
   * @public
   *
   * @returns {boolean}
   */ isArtificial() {
        return this.startVertex.isArtificial() || this.endVertex.isArtificial();
    }
    /**
   * Appends the edge to the end of this edge (for our linked list).
   * @public
   *
   * @param {Edge} edge
   */ connectAfter(edge) {
        assert && assert(edge instanceof Edge);
        assert && assert(this.endVertex === edge.startVertex);
        this.nextEdge = edge;
        edge.previousEdge = this;
    }
    /**
   * @public
   */ disconnectAfter() {
        this.nextEdge.previousEdge = null;
        this.nextEdge = null;
    }
    /**
   * Adds an adjacent triangle.
   * @public
   *
   * @param {Triangle} triangle
   */ addTriangle(triangle) {
        assert && assert(triangle instanceof Triangle);
        assert && assert(this.triangles.length <= 1);
        this.triangles.push(triangle);
    }
    /**
   * Removes an adjacent triangle.
   * @public
   *
   * @param {Triangle} triangle
   */ removeTriangle(triangle) {
        assert && assert(triangle instanceof Triangle);
        assert && assert(_.includes(this.triangles, triangle));
        arrayRemove(this.triangles, triangle);
    }
    /**
   * Returns the triangle in common with both edges.
   * @public
   *
   * @param {Edge} otherEdge
   * @returns {Triangle}
   */ getSharedTriangle(otherEdge) {
        assert && assert(otherEdge instanceof Edge);
        for(let i = 0; i < this.triangles.length; i++){
            const triangle = this.triangles[i];
            for(let j = 0; j < otherEdge.triangles.length; j++){
                if (otherEdge.triangles[j] === triangle) {
                    return triangle;
                }
            }
        }
        throw new Error('No common triangle');
    }
    /**
   * Returns the vertex in common with both edges.
   * @public
   *
   * @param {Edge} otherEdge
   * @returns {Vertex}
   */ getSharedVertex(otherEdge) {
        assert && assert(otherEdge instanceof Edge);
        if (this.startVertex === otherEdge.startVertex || this.startVertex === otherEdge.endVertex) {
            return this.startVertex;
        } else {
            assert && assert(this.endVertex === otherEdge.startVertex || this.endVertex === otherEdge.endVertex);
            return this.endVertex;
        }
    }
    /**
   * Returns the other vertex of the edge.
   * @public
   *
   * @param {Vertex} vertex
   * @returns {Vertex}
   */ getOtherVertex(vertex) {
        assert && assert(vertex instanceof Vertex);
        assert && assert(vertex === this.startVertex || vertex === this.endVertex);
        if (vertex === this.startVertex) {
            return this.endVertex;
        } else {
            return this.startVertex;
        }
    }
    /**
   * Returns the other triangle associated with this edge (if there are two).
   * @public
   *
   * @param {Triangle} triangle
   * @returns {Triangle}
   */ getOtherTriangle(triangle) {
        assert && assert(triangle instanceof Triangle);
        assert && assert(this.triangles.length === 2);
        if (this.triangles[0] === triangle) {
            return this.triangles[1];
        } else {
            return this.triangles[0];
        }
    }
    /**
   * Returns whether the line segment defined between the vertex and bottomVertex intersect this edge.
   * @public
   *
   * @param {Vertex} vertex
   * @param {Vertex} bottomVertex
   * @returns {boolean}
   */ intersectsConstrainedEdge(vertex, bottomVertex) {
        return Utils.lineSegmentIntersection(vertex.point.x, vertex.point.y, bottomVertex.point.x, bottomVertex.point.y, this.startVertex.point.x, this.startVertex.point.y, this.endVertex.point.x, this.endVertex.point.y);
    }
    /**
   * Edge defined by two vertices
   * @private
   *
   * @param {Vertex} startVertex
   * @param {Vertex} endVertex
   */ constructor(startVertex, endVertex){
        assert && assert(startVertex instanceof Vertex);
        assert && assert(endVertex instanceof Vertex);
        assert && assert(startVertex !== endVertex, 'Should be different vertices');
        // @public {Vertex}
        this.startVertex = startVertex;
        this.endVertex = endVertex;
        // @public {Array.<Triangle>} - Adjacent triangles to the edge
        this.triangles = [];
        // @public {Edge|null} - Linked list for the front of the sweep-line (or in the back for the convex hull)
        this.nextEdge = null;
        this.previousEdge = null;
        // @public {boolean} - Can be set to note that it was constrained
        this.isConstrained = false;
    }
};
let Triangle = class Triangle {
    /**
   * Returns whether the vertex is one in the triangle.
   * @public
   *
   * @param {Vertex} vertex
   * @returns {boolean}
   */ hasVertex(vertex) {
        return this.aVertex === vertex || this.bVertex === vertex || this.cVertex === vertex;
    }
    /**
   * Returns the vertex that is opposite from the given edge.
   * @public
   *
   * @param {Edge} edge
   * @returns {Vertex}
   */ getVertexOppositeFromEdge(edge) {
        assert && assert(edge instanceof Edge);
        assert && assert(edge === this.aEdge || edge === this.bEdge || edge === this.cEdge, 'Should be an edge that is part of this triangle');
        if (edge === this.aEdge) {
            return this.aVertex;
        } else if (edge === this.bEdge) {
            return this.bVertex;
        } else {
            return this.cVertex;
        }
    }
    /**
   * Returns the edge that is opposite from the given vertex.
   * @public
   *
   * @param {Vertex} vertex
   * @returns {Edge}
   */ getEdgeOppositeFromVertex(vertex) {
        assert && assert(vertex instanceof Vertex);
        assert && assert(vertex === this.aVertex || vertex === this.bVertex || vertex === this.cVertex, 'Should be a vertex that is part of this triangle');
        if (vertex === this.aVertex) {
            return this.aEdge;
        } else if (vertex === this.bVertex) {
            return this.bEdge;
        } else {
            return this.cEdge;
        }
    }
    /**
   * Returns the vertex that is just before the given vertex (in counterclockwise order).
   * @public
   *
   * @param {Vertex} vertex
   * @returns {Vertex}
   */ getVertexBefore(vertex) {
        assert && assert(vertex instanceof Vertex);
        assert && assert(vertex === this.aVertex || vertex === this.bVertex || vertex === this.cVertex);
        if (vertex === this.aVertex) {
            return this.cVertex;
        } else if (vertex === this.bVertex) {
            return this.aVertex;
        } else {
            return this.bVertex;
        }
    }
    /**
   * Returns the vertex that is just after the given vertex (in counterclockwise order).
   * @public
   *
   * @param {Vertex} vertex
   * @returns {Vertex}
   */ getVertexAfter(vertex) {
        assert && assert(vertex instanceof Vertex);
        assert && assert(vertex === this.aVertex || vertex === this.bVertex || vertex === this.cVertex);
        if (vertex === this.aVertex) {
            return this.bVertex;
        } else if (vertex === this.bVertex) {
            return this.cVertex;
        } else {
            return this.aVertex;
        }
    }
    /**
   * Returns the one non-artificial edge in the triangle (assuming it exists).
   * @public
   *
   * @returns {Edge|null}
   */ getNonArtificialEdge() {
        assert && assert(this.aEdge.isArtificial() && this.bEdge.isArtificial() && !this.cEdge.isArtificial() || this.aEdge.isArtificial() && !this.bEdge.isArtificial() && this.cEdge.isArtificial() || !this.aEdge.isArtificial() && this.bEdge.isArtificial() && this.cEdge.isArtificial() || this.aEdge.isArtificial() && this.bEdge.isArtificial() && this.cEdge.isArtificial(), 'At most one edge should be non-artificial');
        if (!this.aEdge.isArtificial()) {
            return this.aEdge;
        } else if (!this.bEdge.isArtificial()) {
            return this.bEdge;
        } else if (!this.cEdge.isArtificial()) {
            return this.cEdge;
        } else {
            return null;
        }
    }
    /**
   * Returns the next edge (counterclockwise).
   * @public
   *
   * @param {Edge} edge
   * @returns {Edge}
   */ getNextEdge(edge) {
        assert && assert(edge === this.aEdge || edge === this.bEdge || edge === this.cEdge);
        if (this.aEdge === edge) {
            return this.bEdge;
        }
        if (this.bEdge === edge) {
            return this.cEdge;
        }
        if (this.cEdge === edge) {
            return this.aEdge;
        }
        throw new Error('illegal edge');
    }
    /**
   * Returns the previous edge (clockwise).
   * @public
   *
   * @param {Edge} edge
   * @returns {Edge}
   */ getPreviousEdge(edge) {
        assert && assert(edge === this.aEdge || edge === this.bEdge || edge === this.cEdge);
        if (this.aEdge === edge) {
            return this.cEdge;
        }
        if (this.bEdge === edge) {
            return this.aEdge;
        }
        if (this.cEdge === edge) {
            return this.bEdge;
        }
        throw new Error('illegal edge');
    }
    /**
   * Returns whether this is an artificial triangle (has an artificial vertex)
   * @public
   *
   * @returns {boolean}
   */ isArtificial() {
        return this.aVertex.isArtificial() || this.bVertex.isArtificial() || this.cVertex.isArtificial();
    }
    /**
   * @public
   */ remove() {
        this.aEdge.removeTriangle(this);
        this.bEdge.removeTriangle(this);
        this.cEdge.removeTriangle(this);
    }
    /**
   * Triangle defined by three vertices (with edges)
   * @private
   *
   * @param {Vertex} aVertex
   * @param {Vertex} bVertex
   * @param {Vertex} cVertex
   * @param {Edge} aEdge - Edge opposite the 'a' vertex
   * @param {Edge} bEdge - Edge opposite the 'b' vertex
   * @param {Edge} cEdge - Edge opposite the 'c' vertex
   */ constructor(aVertex, bVertex, cVertex, aEdge, bEdge, cEdge){
        // Type checks
        assert && assert(aVertex instanceof Vertex);
        assert && assert(bVertex instanceof Vertex);
        assert && assert(cVertex instanceof Vertex);
        assert && assert(aEdge instanceof Edge);
        assert && assert(bEdge instanceof Edge);
        assert && assert(cEdge instanceof Edge);
        // Ensure each vertex is NOT in the opposite edge
        assert && assert(aVertex !== aEdge.startVertex && aVertex !== aEdge.endVertex, 'Should be an opposite edge');
        assert && assert(bVertex !== bEdge.startVertex && bVertex !== bEdge.endVertex, 'Should be an opposite edge');
        assert && assert(cVertex !== cEdge.startVertex && cVertex !== cEdge.endVertex, 'Should be an opposite edge');
        // Ensure each vertex IS in its adjacent edges
        assert && assert(aVertex === bEdge.startVertex || aVertex === bEdge.endVertex, 'aVertex should be in bEdge');
        assert && assert(aVertex === cEdge.startVertex || aVertex === cEdge.endVertex, 'aVertex should be in cEdge');
        assert && assert(bVertex === aEdge.startVertex || bVertex === aEdge.endVertex, 'bVertex should be in aEdge');
        assert && assert(bVertex === cEdge.startVertex || bVertex === cEdge.endVertex, 'bVertex should be in cEdge');
        assert && assert(cVertex === aEdge.startVertex || cVertex === aEdge.endVertex, 'cVertex should be in aEdge');
        assert && assert(cVertex === bEdge.startVertex || cVertex === bEdge.endVertex, 'cVertex should be in bEdge');
        assert && assert(Utils.triangleAreaSigned(aVertex.point, bVertex.point, cVertex.point) > 0, 'Should be counterclockwise');
        // @public {Vertex}
        this.aVertex = aVertex;
        this.bVertex = bVertex;
        this.cVertex = cVertex;
        // @public {Edge}
        this.aEdge = aEdge;
        this.bEdge = bEdge;
        this.cEdge = cEdge;
        this.aEdge.addTriangle(this);
        this.bEdge.addTriangle(this);
        this.cEdge.addTriangle(this);
    }
};
export default DelaunayTriangulation;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2RvdC9qcy9EZWxhdW5heVRyaWFuZ3VsYXRpb24uanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTctMjAyNCwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbi8qKlxuICogSGFuZGxlcyBjb25zdHJhaW5lZCBEZWxhdW5heSB0cmlhbmd1bGF0aW9uIGJhc2VkIG9uIFwiU3dlZXAtbGluZSBhbGdvcml0aG0gZm9yIGNvbnN0cmFpbmVkIERlbGF1bmF5IHRyaWFuZ3VsYXRpb25cIlxuICogYnkgRG9taXRlciBhbmQgWmFsaWsgKDIwMDgpLCB3aXRoIHNvbWUgZGV0YWlscyBwcm92aWRlZCBieSBcIkFuIGVmZmljaWVudCBzd2VlcC1saW5lIERlbGF1bmF5IHRyaWFuZ3VsYXRpb25cbiAqIGFsZ29yaXRobVwiIGJ5IFphbGlrICgyMDA1KS5cbiAqXG4gKiBUT0RPOiBTZWNvbmQgKGJhc2luKSBoZXVyaXN0aWMgbm90IHlldCBpbXBsZW1lbnRlZC4gaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2RvdC9pc3N1ZXMvOTZcbiAqIFRPRE86IENvbnN0cmFpbnRzIG5vdCB5ZXQgaW1wbGVtZW50ZWQuXG4gKiBUT0RPOiBDaGVjayBudW1iZXIgb2YgdHJpYW5nbGVzL2VkZ2VzL3ZlcnRpY2VzIHdpdGggRXVsZXIncyBGb3JtdWxhXG4gKiBUT0RPOiBIYW5kbGUgXCJvdXRzaWRlXCIgY2FzZXMgKGFuZCBjaGFuZ2luZyB0aGUgZnJvbnQgZWRnZXMpIGZvciBjb25zdHJhaW5lZCBlZGdlc1xuICpcbiAqIEBhdXRob3IgSm9uYXRoYW4gT2xzb24gPGpvbmF0aGFuLm9sc29uQGNvbG9yYWRvLmVkdT5cbiAqL1xuXG5pbXBvcnQgYXJyYXlSZW1vdmUgZnJvbSAnLi4vLi4vcGhldC1jb3JlL2pzL2FycmF5UmVtb3ZlLmpzJztcbmltcG9ydCBtZXJnZSBmcm9tICcuLi8uLi9waGV0LWNvcmUvanMvbWVyZ2UuanMnO1xuaW1wb3J0IEJvdW5kczIgZnJvbSAnLi9Cb3VuZHMyLmpzJztcbmltcG9ydCBkb3QgZnJvbSAnLi9kb3QuanMnO1xuaW1wb3J0IFV0aWxzIGZyb20gJy4vVXRpbHMuanMnO1xuaW1wb3J0IFZlY3RvcjIgZnJvbSAnLi9WZWN0b3IyLmpzJztcblxuY2xhc3MgRGVsYXVuYXlUcmlhbmd1bGF0aW9uIHtcbiAgLyoqXG4gICAqIEBwdWJsaWNcbiAgICpcbiAgICogQHBhcmFtIHtBcnJheS48VmVjdG9yMj59IHBvaW50c1xuICAgKiBAcGFyYW0ge0FycmF5LjxBcnJheS48bnVtYmVyPj59IGNvbnN0cmFpbnRzIC0gUGFpcnMgb2YgaW5kaWNlcyBpbnRvIHRoZSBwb2ludHMgdGhhdCBzaG91bGQgYmUgdHJlYXRlZCBhc1xuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3RyYWluZWQgZWRnZXMuXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9uc11cbiAgICovXG4gIGNvbnN0cnVjdG9yKCBwb2ludHMsIGNvbnN0cmFpbnRzLCBvcHRpb25zICkge1xuICAgIG9wdGlvbnMgPSBtZXJnZSgge30sIG9wdGlvbnMgKTtcblxuICAgIGxldCBpO1xuXG4gICAgLy8gQHB1YmxpYyB7QXJyYXkuPFZlY3RvcjI+fVxuICAgIHRoaXMucG9pbnRzID0gcG9pbnRzO1xuXG4gICAgLy8gQHB1YmxpYyB7QXJyYXkuPEFycmF5LjxudW1iZXI+Pn1cbiAgICB0aGlzLmNvbnN0cmFpbnRzID0gY29uc3RyYWludHM7XG5cbiAgICAvLyBAcHVibGljIHtBcnJheS48VHJpYW5nbGU+fVxuICAgIHRoaXMudHJpYW5nbGVzID0gW107XG5cbiAgICAvLyBAcHVibGljIHtBcnJheS48RWRnZT59XG4gICAgdGhpcy5lZGdlcyA9IFtdO1xuXG4gICAgLy8gQHB1YmxpYyB7QXJyYXkuPFZlcnRleD59XG4gICAgdGhpcy5jb252ZXhIdWxsID0gW107XG5cbiAgICBpZiAoIHBvaW50cy5sZW5ndGggPT09IDAgKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gQHByaXZhdGUge0FycmF5LjxWZXJ0ZXg+fVxuICAgIHRoaXMudmVydGljZXMgPSBwb2ludHMubWFwKCAoIHBvaW50LCBpbmRleCApID0+IHtcbiAgICAgIGFzc2VydCAmJiBhc3NlcnQoIHBvaW50IGluc3RhbmNlb2YgVmVjdG9yMiAmJiBwb2ludC5pc0Zpbml0ZSgpICk7XG5cbiAgICAgIHJldHVybiBuZXcgVmVydGV4KCBwb2ludCwgaW5kZXggKTtcbiAgICB9ICk7XG5cbiAgICBmb3IgKCBpID0gMDsgaSA8IHRoaXMuY29uc3RyYWludHMubGVuZ3RoOyBpKysgKSB7XG4gICAgICBjb25zdCBjb25zdHJhaW50ID0gdGhpcy5jb25zdHJhaW50c1sgaSBdO1xuICAgICAgY29uc3QgZmlyc3RJbmRleCA9IGNvbnN0cmFpbnRbIDAgXTtcbiAgICAgIGNvbnN0IHNlY29uZEluZGV4ID0gY29uc3RyYWludFsgMSBdO1xuICAgICAgYXNzZXJ0ICYmIGFzc2VydCggdHlwZW9mIGZpcnN0SW5kZXggPT09ICdudW1iZXInICYmIGlzRmluaXRlKCBmaXJzdEluZGV4ICkgJiYgZmlyc3RJbmRleCAlIDEgPT09IDAgJiYgZmlyc3RJbmRleCA+PSAwICYmIGZpcnN0SW5kZXggPCBwb2ludHMubGVuZ3RoICk7XG4gICAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0eXBlb2Ygc2Vjb25kSW5kZXggPT09ICdudW1iZXInICYmIGlzRmluaXRlKCBzZWNvbmRJbmRleCApICYmIHNlY29uZEluZGV4ICUgMSA9PT0gMCAmJiBzZWNvbmRJbmRleCA+PSAwICYmIHNlY29uZEluZGV4IDwgcG9pbnRzLmxlbmd0aCApO1xuICAgICAgYXNzZXJ0ICYmIGFzc2VydCggZmlyc3RJbmRleCAhPT0gc2Vjb25kSW5kZXggKTtcblxuICAgICAgdGhpcy52ZXJ0aWNlc1sgZmlyc3RJbmRleCBdLmNvbnN0cmFpbmVkVmVydGljZXMucHVzaCggdGhpcy52ZXJ0aWNlc1sgc2Vjb25kSW5kZXggXSApO1xuICAgIH1cblxuICAgIHRoaXMudmVydGljZXMuc29ydCggRGVsYXVuYXlUcmlhbmd1bGF0aW9uLnZlcnRleENvbXBhcmlzb24gKTtcblxuICAgIGZvciAoIGkgPSAwOyBpIDwgdGhpcy52ZXJ0aWNlcy5sZW5ndGg7IGkrKyApIHtcbiAgICAgIGNvbnN0IHZlcnRleCA9IHRoaXMudmVydGljZXNbIGkgXTtcbiAgICAgIHZlcnRleC5zb3J0ZWRJbmRleCA9IGk7XG4gICAgICBmb3IgKCBsZXQgaiA9IHZlcnRleC5jb25zdHJhaW5lZFZlcnRpY2VzLmxlbmd0aCAtIDE7IGogPj0gMDsgai0tICkge1xuICAgICAgICBjb25zdCBvdGhlclZlcnRleCA9IHZlcnRleC5jb25zdHJhaW5lZFZlcnRpY2VzWyBqIF07XG5cbiAgICAgICAgLy8gSWYgdGhlIFwib3RoZXJcIiB2ZXJ0ZXggaXMgbGF0ZXIgaW4gdGhlIHN3ZWVwLWxpbmUgb3JkZXIsIGl0IHNob3VsZCBoYXZlIHRoZSByZWZlcmVuY2UgdG8gdGhlIGVhcmxpZXIgdmVydGV4LFxuICAgICAgICAvLyBub3QgdGhlIG90aGVyIHdheSBhcm91bmQuXG4gICAgICAgIGlmICggb3RoZXJWZXJ0ZXguc29ydGVkSW5kZXggPT09IC0xICkge1xuICAgICAgICAgIG90aGVyVmVydGV4LmNvbnN0cmFpbmVkVmVydGljZXMucHVzaCggdmVydGV4ICk7XG4gICAgICAgICAgdmVydGV4LmNvbnN0cmFpbmVkVmVydGljZXMuc3BsaWNlKCBqLCAxICk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBAcHJpdmF0ZSB7VmVydGV4fVxuICAgIHRoaXMuYm90dG9tVmVydGV4ID0gdGhpcy52ZXJ0aWNlc1sgMCBdO1xuXG4gICAgLy8gQHByaXZhdGUge0FycmF5LjxWZXJ0ZXg+fSAtIE91ciBpbml0aWFsaXphdGlvbiB3aWxsIGhhbmRsZSBvdXIgZmlyc3QgdmVydGV4XG4gICAgdGhpcy5yZW1haW5pbmdWZXJ0aWNlcyA9IHRoaXMudmVydGljZXMuc2xpY2UoIDEgKTtcblxuICAgIGNvbnN0IGJvdW5kcyA9IEJvdW5kczIuTk9USElORy5jb3B5KCk7XG4gICAgZm9yICggaSA9IHBvaW50cy5sZW5ndGggLSAxOyBpID49IDA7IGktLSApIHtcbiAgICAgIGJvdW5kcy5hZGRQb2ludCggcG9pbnRzWyBpIF0gKTtcbiAgICB9XG5cbiAgICBjb25zdCBhbHBoYSA9IDAuNDtcbiAgICAvLyBAcHJpdmF0ZSB7VmVydGV4fSAtIEZha2UgaW5kZXggLTFcbiAgICB0aGlzLmFydGlmaWNpYWxNaW5WZXJ0ZXggPSBuZXcgVmVydGV4KCBuZXcgVmVjdG9yMiggYm91bmRzLm1pblggLSBib3VuZHMud2lkdGggKiBhbHBoYSwgYm91bmRzLm1pblkgLSBib3VuZHMuaGVpZ2h0ICogYWxwaGEgKSwgLTEgKTtcbiAgICAvLyBAcHJpdmF0ZSB7VmVydGV4fSAtIEZha2UgaW5kZXggLTJcbiAgICB0aGlzLmFydGlmaWNpYWxNYXhWZXJ0ZXggPSBuZXcgVmVydGV4KCBuZXcgVmVjdG9yMiggYm91bmRzLm1heFggKyBib3VuZHMud2lkdGggKiBhbHBoYSwgYm91bmRzLm1pblkgLSBib3VuZHMuaGVpZ2h0ICogYWxwaGEgKSwgLTIgKTtcblxuICAgIHRoaXMuZWRnZXMucHVzaCggbmV3IEVkZ2UoIHRoaXMuYXJ0aWZpY2lhbE1pblZlcnRleCwgdGhpcy5hcnRpZmljaWFsTWF4VmVydGV4ICkgKTtcbiAgICB0aGlzLmVkZ2VzLnB1c2goIG5ldyBFZGdlKCB0aGlzLmFydGlmaWNpYWxNYXhWZXJ0ZXgsIHRoaXMuYm90dG9tVmVydGV4ICkgKTtcbiAgICB0aGlzLmVkZ2VzLnB1c2goIG5ldyBFZGdlKCB0aGlzLmJvdHRvbVZlcnRleCwgdGhpcy5hcnRpZmljaWFsTWluVmVydGV4ICkgKTtcblxuICAgIC8vIFNldCB1cCBvdXIgZmlyc3QgKGFydGlmaWNpYWwpIHRyaWFuZ2xlLlxuICAgIHRoaXMudHJpYW5nbGVzLnB1c2goIG5ldyBUcmlhbmdsZSggdGhpcy5hcnRpZmljaWFsTWluVmVydGV4LCB0aGlzLmFydGlmaWNpYWxNYXhWZXJ0ZXgsIHRoaXMuYm90dG9tVmVydGV4LFxuICAgICAgdGhpcy5lZGdlc1sgMSBdLCB0aGlzLmVkZ2VzWyAyIF0sIHRoaXMuZWRnZXNbIDAgXSApICk7XG5cbiAgICAvLyBAcHJpdmF0ZSB7RWRnZXxudWxsfSAtIFRoZSBzdGFydCBvZiBvdXIgZnJvbnQgKHRoZSBlZGdlcyBhdCB0aGUgZnJvbnQgb2YgdGhlIHN3ZWVwLWxpbmUpXG4gICAgdGhpcy5maXJzdEZyb250RWRnZSA9IHRoaXMuZWRnZXNbIDEgXTtcbiAgICB0aGlzLmVkZ2VzWyAxIF0uY29ubmVjdEFmdGVyKCB0aGlzLmVkZ2VzWyAyIF0gKTtcblxuICAgIC8vIEBwcml2YXRlIHtFZGdlfSAtIFRoZSBzdGFydCBvZiBvdXIgaHVsbCAodGhlIGVkZ2VzIGF0IHRoZSBiYWNrLCBtYWtpbmcgdXAgdGhlIGNvbnZleCBodWxsKVxuICAgIHRoaXMuZmlyc3RIdWxsRWRnZSA9IHRoaXMuZWRnZXNbIDAgXTtcbiAgfVxuXG4gIC8qKlxuICAgKiBNb3ZlcyB0aGUgdHJpYW5ndWxhdGlvbiBmb3J3YXJkIGJ5IGEgdmVydGV4LlxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgc3RlcCgpIHtcbiAgICAvLyBUT0RPOiByZXZlcnNlIHRoZSBhcnJheSBwcmlvciB0byB0aGlzPyBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvZG90L2lzc3Vlcy85NlxuICAgIGNvbnN0IHZlcnRleCA9IHRoaXMucmVtYWluaW5nVmVydGljZXMuc2hpZnQoKTtcblxuICAgIGNvbnN0IHggPSB2ZXJ0ZXgucG9pbnQueDtcblxuICAgIGxldCBmcm9udEVkZ2UgPSB0aGlzLmZpcnN0RnJvbnRFZGdlO1xuICAgIHdoaWxlICggZnJvbnRFZGdlICkge1xuICAgICAgLy8gVE9ETzogZXBzaWxvbiBuZWVkZWQgaGVyZT8gaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2RvdC9pc3N1ZXMvOTZcbiAgICAgIGlmICggeCA+IGZyb250RWRnZS5lbmRWZXJ0ZXgucG9pbnQueCApIHtcbiAgICAgICAgY29uc3QgZWRnZTEgPSBuZXcgRWRnZSggZnJvbnRFZGdlLnN0YXJ0VmVydGV4LCB2ZXJ0ZXggKTtcbiAgICAgICAgY29uc3QgZWRnZTIgPSBuZXcgRWRnZSggdmVydGV4LCBmcm9udEVkZ2UuZW5kVmVydGV4ICk7XG4gICAgICAgIGVkZ2UxLmNvbm5lY3RBZnRlciggZWRnZTIgKTtcbiAgICAgICAgdGhpcy5lZGdlcy5wdXNoKCBlZGdlMSApO1xuICAgICAgICB0aGlzLmVkZ2VzLnB1c2goIGVkZ2UyICk7XG4gICAgICAgIHRoaXMudHJpYW5nbGVzLnB1c2goIG5ldyBUcmlhbmdsZSggZnJvbnRFZGdlLmVuZFZlcnRleCwgZnJvbnRFZGdlLnN0YXJ0VmVydGV4LCB2ZXJ0ZXgsXG4gICAgICAgICAgZWRnZTEsIGVkZ2UyLCBmcm9udEVkZ2UgKSApO1xuICAgICAgICB0aGlzLnJlY29ubmVjdEZyb250RWRnZXMoIGZyb250RWRnZSwgZnJvbnRFZGdlLCBlZGdlMSwgZWRnZTIgKTtcbiAgICAgICAgdGhpcy5sZWdhbGl6ZUVkZ2UoIGZyb250RWRnZSApO1xuICAgICAgICB0aGlzLmFkZEhhbGZQaUhldXJpc3RpYyggZWRnZTEsIGVkZ2UyICk7XG4gICAgICAgIHRoaXMuY29uc3RyYWluRWRnZXMoIHZlcnRleCwgZWRnZTEsIGVkZ2UyICk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgICAgZWxzZSBpZiAoIHggPT09IGZyb250RWRnZS5lbmRWZXJ0ZXgucG9pbnQueCApIHtcbiAgICAgICAgY29uc3QgbGVmdE9sZEVkZ2UgPSBmcm9udEVkZ2UubmV4dEVkZ2U7XG4gICAgICAgIGNvbnN0IHJpZ2h0T2xkRWRnZSA9IGZyb250RWRnZTtcbiAgICAgICAgYXNzZXJ0ICYmIGFzc2VydCggbGVmdE9sZEVkZ2UgIT09IG51bGwgKTtcblxuICAgICAgICBjb25zdCBtaWRkbGVPbGRWZXJ0ZXggPSBmcm9udEVkZ2UuZW5kVmVydGV4O1xuICAgICAgICBjb25zdCBsZWZ0VmVydGV4ID0gbGVmdE9sZEVkZ2UuZW5kVmVydGV4O1xuICAgICAgICBjb25zdCByaWdodFZlcnRleCA9IHJpZ2h0T2xkRWRnZS5zdGFydFZlcnRleDtcblxuICAgICAgICBjb25zdCBsZWZ0RWRnZSA9IG5ldyBFZGdlKCB2ZXJ0ZXgsIGxlZnRWZXJ0ZXggKTtcbiAgICAgICAgY29uc3QgcmlnaHRFZGdlID0gbmV3IEVkZ2UoIHJpZ2h0VmVydGV4LCB2ZXJ0ZXggKTtcbiAgICAgICAgY29uc3QgbWlkZGxlRWRnZSA9IG5ldyBFZGdlKCBtaWRkbGVPbGRWZXJ0ZXgsIHZlcnRleCApO1xuICAgICAgICByaWdodEVkZ2UuY29ubmVjdEFmdGVyKCBsZWZ0RWRnZSApO1xuICAgICAgICB0aGlzLmVkZ2VzLnB1c2goIGxlZnRFZGdlICk7XG4gICAgICAgIHRoaXMuZWRnZXMucHVzaCggcmlnaHRFZGdlICk7XG4gICAgICAgIHRoaXMuZWRnZXMucHVzaCggbWlkZGxlRWRnZSApO1xuICAgICAgICB0aGlzLnRyaWFuZ2xlcy5wdXNoKCBuZXcgVHJpYW5nbGUoIGxlZnRWZXJ0ZXgsIG1pZGRsZU9sZFZlcnRleCwgdmVydGV4LFxuICAgICAgICAgIG1pZGRsZUVkZ2UsIGxlZnRFZGdlLCBsZWZ0T2xkRWRnZSApICk7XG4gICAgICAgIHRoaXMudHJpYW5nbGVzLnB1c2goIG5ldyBUcmlhbmdsZSggbWlkZGxlT2xkVmVydGV4LCByaWdodFZlcnRleCwgdmVydGV4LFxuICAgICAgICAgIHJpZ2h0RWRnZSwgbWlkZGxlRWRnZSwgcmlnaHRPbGRFZGdlICkgKTtcbiAgICAgICAgdGhpcy5yZWNvbm5lY3RGcm9udEVkZ2VzKCByaWdodE9sZEVkZ2UsIGxlZnRPbGRFZGdlLCByaWdodEVkZ2UsIGxlZnRFZGdlICk7XG4gICAgICAgIHRoaXMubGVnYWxpemVFZGdlKCBsZWZ0T2xkRWRnZSApO1xuICAgICAgICB0aGlzLmxlZ2FsaXplRWRnZSggcmlnaHRPbGRFZGdlICk7XG4gICAgICAgIHRoaXMubGVnYWxpemVFZGdlKCBtaWRkbGVFZGdlICk7XG4gICAgICAgIHRoaXMuYWRkSGFsZlBpSGV1cmlzdGljKCByaWdodEVkZ2UsIGxlZnRFZGdlICk7XG4gICAgICAgIHRoaXMuY29uc3RyYWluRWRnZXMoIHZlcnRleCwgcmlnaHRFZGdlLCBsZWZ0RWRnZSApO1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICAgIGZyb250RWRnZSA9IGZyb250RWRnZS5uZXh0RWRnZTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQnVpbGRzIGEgdHJpYW5nbGUgYmV0d2VlbiB0d28gdmVydGljZXMuXG4gICAqIEBwcml2YXRlXG4gICAqXG4gICAqIEBwYXJhbSB7RWRnZX0gZmlyc3RFZGdlXG4gICAqIEBwYXJhbSB7RWRnZX0gc2Vjb25kRWRnZVxuICAgKiBAcGFyYW0ge1ZlcnRleH0gZmlyc3RTaWRlVmVydGV4XG4gICAqIEBwYXJhbSB7VmVydGV4fSBtaWRkbGVWZXJ0ZXhcbiAgICogQHBhcmFtIHtWZXJ0ZXh9IHNlY29uZFNpZGVWZXJ0ZXhcbiAgICogQHJldHVybnMge0VkZ2V9IC0gVGhlIG5ld2x5IGNyZWF0ZWQgZWRnZVxuICAgKi9cbiAgZmlsbEJvcmRlclRyaWFuZ2xlKCBmaXJzdEVkZ2UsIHNlY29uZEVkZ2UsIGZpcnN0U2lkZVZlcnRleCwgbWlkZGxlVmVydGV4LCBzZWNvbmRTaWRlVmVydGV4ICkge1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIGZpcnN0RWRnZSBpbnN0YW5jZW9mIEVkZ2UgKTtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBzZWNvbmRFZGdlIGluc3RhbmNlb2YgRWRnZSApO1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIGZpcnN0U2lkZVZlcnRleCBpbnN0YW5jZW9mIFZlcnRleCApO1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIG1pZGRsZVZlcnRleCBpbnN0YW5jZW9mIFZlcnRleCApO1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIHNlY29uZFNpZGVWZXJ0ZXggaW5zdGFuY2VvZiBWZXJ0ZXggKTtcblxuICAgIGFzc2VydCAmJiBhc3NlcnQoIG1pZGRsZVZlcnRleCA9PT0gZmlyc3RFZGdlLnN0YXJ0VmVydGV4IHx8IG1pZGRsZVZlcnRleCA9PT0gZmlyc3RFZGdlLmVuZFZlcnRleCxcbiAgICAgICdtaWRkbGVWZXJ0ZXggc2hvdWxkIGJlIGluIGZpcnN0RWRnZScgKTtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBtaWRkbGVWZXJ0ZXggPT09IHNlY29uZEVkZ2Uuc3RhcnRWZXJ0ZXggfHwgbWlkZGxlVmVydGV4ID09PSBzZWNvbmRFZGdlLmVuZFZlcnRleCxcbiAgICAgICdtaWRkbGVWZXJ0ZXggc2hvdWxkIGJlIGluIHNlY29uZEVkZ2UnICk7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggZmlyc3RTaWRlVmVydGV4ID09PSBmaXJzdEVkZ2Uuc3RhcnRWZXJ0ZXggfHwgZmlyc3RTaWRlVmVydGV4ID09PSBmaXJzdEVkZ2UuZW5kVmVydGV4LFxuICAgICAgJ2ZpcnN0U2lkZVZlcnRleCBzaG91bGQgYmUgaW4gZmlyc3RFZGdlJyApO1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIHNlY29uZFNpZGVWZXJ0ZXggPT09IHNlY29uZEVkZ2Uuc3RhcnRWZXJ0ZXggfHwgc2Vjb25kU2lkZVZlcnRleCA9PT0gc2Vjb25kRWRnZS5lbmRWZXJ0ZXgsXG4gICAgICAnc2Vjb25kU2lkZVZlcnRleCBzaG91bGQgYmUgaW4gc2Vjb25kRWRnZScgKTtcblxuICAgIGNvbnN0IG5ld0VkZ2UgPSBuZXcgRWRnZSggZmlyc3RTaWRlVmVydGV4LCBzZWNvbmRTaWRlVmVydGV4ICk7XG4gICAgdGhpcy5lZGdlcy5wdXNoKCBuZXdFZGdlICk7XG4gICAgdGhpcy50cmlhbmdsZXMucHVzaCggbmV3IFRyaWFuZ2xlKCBzZWNvbmRTaWRlVmVydGV4LCBtaWRkbGVWZXJ0ZXgsIGZpcnN0U2lkZVZlcnRleCxcbiAgICAgIGZpcnN0RWRnZSwgbmV3RWRnZSwgc2Vjb25kRWRnZSApICk7XG4gICAgdGhpcy5sZWdhbGl6ZUVkZ2UoIGZpcnN0RWRnZSApO1xuICAgIHRoaXMubGVnYWxpemVFZGdlKCBzZWNvbmRFZGdlICk7XG4gICAgcmV0dXJuIG5ld0VkZ2U7XG4gIH1cblxuICAvKipcbiAgICogRGlzY29ubmVjdHMgYSBzZWN0aW9uIG9mIGZyb250IGVkZ2VzLCBhbmQgY29ubmVjdHMgYSBuZXcgc2VjdGlvbi5cbiAgICogQHByaXZhdGVcbiAgICpcbiAgICogRGlzY29ubmVjdHM6XG4gICAqIDxuZXh0RWRnZT4gKGN1dCkgPG9sZExlZnRFZGdlPiAuLi4uLiA8b2xkUmlnaHRFZGdlPiAoY3V0KSA8cHJldmlvdXNFZGdlPlxuICAgKlxuICAgKiBDb25uZWN0czpcbiAgICogPG5leHRFZGdlPiAoam9pbikgPG5ld0xlZnRFZGdlPiAuLi4uLiA8bmV3UmlnaHRFZGdlPiAoam9pbikgPHByZXZpb3VzRWRnZT5cbiAgICpcbiAgICogSWYgcHJldmlvdXNFZGdlIGlzIG51bGwsIHdlJ2xsIG5lZWQgdG8gc2V0IG91ciBmaXJzdEZyb250RWRnZSB0byB0aGUgbmV3UmlnaHRFZGdlLlxuICAgKlxuICAgKiBAcGFyYW0ge0VkZ2V9IG9sZFJpZ2h0RWRnZVxuICAgKiBAcGFyYW0ge0VkZ2V9IG9sZExlZnRFZGdlXG4gICAqIEBwYXJhbSB7RWRnZX0gbmV3UmlnaHRFZGdlXG4gICAqIEBwYXJhbSB7RWRnZX0gbmV3TGVmdEVkZ2VcbiAgICovXG4gIHJlY29ubmVjdEZyb250RWRnZXMoIG9sZFJpZ2h0RWRnZSwgb2xkTGVmdEVkZ2UsIG5ld1JpZ2h0RWRnZSwgbmV3TGVmdEVkZ2UgKSB7XG4gICAgY29uc3QgcHJldmlvdXNFZGdlID0gb2xkUmlnaHRFZGdlLnByZXZpb3VzRWRnZTtcbiAgICBjb25zdCBuZXh0RWRnZSA9IG9sZExlZnRFZGdlLm5leHRFZGdlO1xuICAgIGlmICggcHJldmlvdXNFZGdlICkge1xuICAgICAgcHJldmlvdXNFZGdlLmRpc2Nvbm5lY3RBZnRlcigpO1xuICAgICAgcHJldmlvdXNFZGdlLmNvbm5lY3RBZnRlciggbmV3UmlnaHRFZGdlICk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgdGhpcy5maXJzdEZyb250RWRnZSA9IG5ld1JpZ2h0RWRnZTtcbiAgICB9XG4gICAgaWYgKCBuZXh0RWRnZSApIHtcbiAgICAgIG9sZExlZnRFZGdlLmRpc2Nvbm5lY3RBZnRlcigpO1xuICAgICAgbmV3TGVmdEVkZ2UuY29ubmVjdEFmdGVyKCBuZXh0RWRnZSApO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBUcmllcyB0byBmaWxsIGluIGFjdXRlIGFuZ2xlcyB3aXRoIHRyaWFuZ2xlcyBhZnRlciB3ZSBhZGQgYSB2ZXJ0ZXggaW50byB0aGUgZnJvbnQuXG4gICAqIEBwcml2YXRlXG4gICAqXG4gICAqIEBwYXJhbSB7RWRnZX0gcmlnaHRGcm9udEVkZ2VcbiAgICogQHBhcmFtIHtFZGdlfSBsZWZ0RnJvbnRFZGdlXG4gICAqL1xuICBhZGRIYWxmUGlIZXVyaXN0aWMoIHJpZ2h0RnJvbnRFZGdlLCBsZWZ0RnJvbnRFZGdlICkge1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIHJpZ2h0RnJvbnRFZGdlLmVuZFZlcnRleCA9PT0gbGVmdEZyb250RWRnZS5zdGFydFZlcnRleCApO1xuXG4gICAgY29uc3QgbWlkZGxlVmVydGV4ID0gcmlnaHRGcm9udEVkZ2UuZW5kVmVydGV4O1xuXG4gICAgd2hpbGUgKCByaWdodEZyb250RWRnZS5wcmV2aW91c0VkZ2UgJiZcbiAgICAgICAgICAgIFV0aWxzLnRyaWFuZ2xlQXJlYVNpZ25lZCggbWlkZGxlVmVydGV4LnBvaW50LCByaWdodEZyb250RWRnZS5zdGFydFZlcnRleC5wb2ludCwgcmlnaHRGcm9udEVkZ2UucHJldmlvdXNFZGdlLnN0YXJ0VmVydGV4LnBvaW50ICkgPiAwICYmXG4gICAgICAgICAgICAoIG1pZGRsZVZlcnRleC5wb2ludC5taW51cyggcmlnaHRGcm9udEVkZ2Uuc3RhcnRWZXJ0ZXgucG9pbnQgKSApLmFuZ2xlQmV0d2VlbiggcmlnaHRGcm9udEVkZ2UucHJldmlvdXNFZGdlLnN0YXJ0VmVydGV4LnBvaW50Lm1pbnVzKCByaWdodEZyb250RWRnZS5zdGFydFZlcnRleC5wb2ludCApICkgPCBNYXRoLlBJIC8gMiApIHtcbiAgICAgIGNvbnN0IHByZXZpb3VzRWRnZSA9IHJpZ2h0RnJvbnRFZGdlLnByZXZpb3VzRWRnZTtcbiAgICAgIGNvbnN0IG5ld1JpZ2h0RWRnZSA9IG5ldyBFZGdlKCBwcmV2aW91c0VkZ2Uuc3RhcnRWZXJ0ZXgsIG1pZGRsZVZlcnRleCApO1xuICAgICAgdGhpcy5lZGdlcy5wdXNoKCBuZXdSaWdodEVkZ2UgKTtcbiAgICAgIHRoaXMudHJpYW5nbGVzLnB1c2goIG5ldyBUcmlhbmdsZSggbWlkZGxlVmVydGV4LCByaWdodEZyb250RWRnZS5zdGFydFZlcnRleCwgcHJldmlvdXNFZGdlLnN0YXJ0VmVydGV4LFxuICAgICAgICBwcmV2aW91c0VkZ2UsIG5ld1JpZ2h0RWRnZSwgcmlnaHRGcm9udEVkZ2UgKSApO1xuXG4gICAgICB0aGlzLnJlY29ubmVjdEZyb250RWRnZXMoIHByZXZpb3VzRWRnZSwgcmlnaHRGcm9udEVkZ2UsIG5ld1JpZ2h0RWRnZSwgbmV3UmlnaHRFZGdlICk7XG4gICAgICB0aGlzLmxlZ2FsaXplRWRnZSggcHJldmlvdXNFZGdlICk7XG4gICAgICB0aGlzLmxlZ2FsaXplRWRnZSggcmlnaHRGcm9udEVkZ2UgKTtcblxuICAgICAgcmlnaHRGcm9udEVkZ2UgPSBuZXdSaWdodEVkZ2U7XG4gICAgfVxuICAgIHdoaWxlICggbGVmdEZyb250RWRnZS5uZXh0RWRnZSAmJlxuICAgICAgICAgICAgVXRpbHMudHJpYW5nbGVBcmVhU2lnbmVkKCBtaWRkbGVWZXJ0ZXgucG9pbnQsIGxlZnRGcm9udEVkZ2UubmV4dEVkZ2UuZW5kVmVydGV4LnBvaW50LCBsZWZ0RnJvbnRFZGdlLmVuZFZlcnRleC5wb2ludCApID4gMCAmJlxuICAgICAgICAgICAgKCBtaWRkbGVWZXJ0ZXgucG9pbnQubWludXMoIGxlZnRGcm9udEVkZ2UuZW5kVmVydGV4LnBvaW50ICkgKS5hbmdsZUJldHdlZW4oIGxlZnRGcm9udEVkZ2UubmV4dEVkZ2UuZW5kVmVydGV4LnBvaW50Lm1pbnVzKCBsZWZ0RnJvbnRFZGdlLmVuZFZlcnRleC5wb2ludCApICkgPCBNYXRoLlBJIC8gMiApIHtcbiAgICAgIGNvbnN0IG5leHRFZGdlID0gbGVmdEZyb250RWRnZS5uZXh0RWRnZTtcbiAgICAgIGNvbnN0IG5ld0xlZnRFZGdlID0gbmV3IEVkZ2UoIG1pZGRsZVZlcnRleCwgbmV4dEVkZ2UuZW5kVmVydGV4ICk7XG4gICAgICB0aGlzLmVkZ2VzLnB1c2goIG5ld0xlZnRFZGdlICk7XG4gICAgICB0aGlzLnRyaWFuZ2xlcy5wdXNoKCBuZXcgVHJpYW5nbGUoIG1pZGRsZVZlcnRleCwgbGVmdEZyb250RWRnZS5uZXh0RWRnZS5lbmRWZXJ0ZXgsIGxlZnRGcm9udEVkZ2UuZW5kVmVydGV4LFxuICAgICAgICBuZXh0RWRnZSwgbGVmdEZyb250RWRnZSwgbmV3TGVmdEVkZ2UgKSApO1xuICAgICAgdGhpcy5yZWNvbm5lY3RGcm9udEVkZ2VzKCBsZWZ0RnJvbnRFZGdlLCBuZXh0RWRnZSwgbmV3TGVmdEVkZ2UsIG5ld0xlZnRFZGdlICk7XG4gICAgICB0aGlzLmxlZ2FsaXplRWRnZSggbmV4dEVkZ2UgKTtcbiAgICAgIHRoaXMubGVnYWxpemVFZGdlKCBsZWZ0RnJvbnRFZGdlICk7XG5cbiAgICAgIGxlZnRGcm9udEVkZ2UgPSBuZXdMZWZ0RWRnZTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogSGFuZGxlcyBhbnkgXCJlZGdlIGV2ZW50c1wiIHRoYXQgZGVsZXRlIGludGVyc2VjdGluZyBlZGdlcywgY3JlYXRpbmcgdGhlIG5ldyBlZGdlLCBhbmQgZmlsbGluZyBpbiAoYWxsIG9ubHkgaWZcbiAgICogbmVjZXNzYXJ5KS5cbiAgICogQHByaXZhdGVcbiAgICpcbiAgICogQHBhcmFtIHtWZXJ0ZXh9IHZlcnRleFxuICAgKiBAcGFyYW0ge0VkZ2V9IHJpZ2h0RnJvbnRFZGdlXG4gICAqIEBwYXJhbSB7RWRnZX0gbGVmdEZyb250RWRnZVxuICAgKi9cbiAgY29uc3RyYWluRWRnZXMoIHZlcnRleCwgcmlnaHRGcm9udEVkZ2UsIGxlZnRGcm9udEVkZ2UgKSB7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdmVydGV4IGluc3RhbmNlb2YgVmVydGV4ICk7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggcmlnaHRGcm9udEVkZ2UgaW5zdGFuY2VvZiBFZGdlICk7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggbGVmdEZyb250RWRnZSBpbnN0YW5jZW9mIEVkZ2UgKTtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB2ZXJ0ZXggPT09IHJpZ2h0RnJvbnRFZGdlLmVuZFZlcnRleCApO1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIHZlcnRleCA9PT0gbGVmdEZyb250RWRnZS5zdGFydFZlcnRleCApO1xuXG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgdmVydGV4LmNvbnN0cmFpbmVkVmVydGljZXMubGVuZ3RoOyBpKysgKSB7XG4gICAgICBjb25zdCBib3R0b21WZXJ0ZXggPSB2ZXJ0ZXguY29uc3RyYWluZWRWZXJ0aWNlc1sgaSBdO1xuXG4gICAgICAvLyBDaGVjayBpZiBpdCdzIG9uZSBvZiBvdXIgZnJvbnQgZWRnZSB2ZXJ0aWNlcyAoaWYgc28sIGJhaWwgb3V0LCBzaW5jZSB0aGUgZWRnZSBhbHJlYWR5IGV4aXN0cylcbiAgICAgIGlmICggYm90dG9tVmVydGV4ID09PSByaWdodEZyb250RWRnZS5zdGFydFZlcnRleCB8fCBib3R0b21WZXJ0ZXggPT09IGxlZnRGcm9udEVkZ2UuZW5kVmVydGV4ICkge1xuICAgICAgICBicmVhaztcbiAgICAgIH1cblxuICAgICAgY29uc3QgbGVmdEVkZ2VzID0gW107XG4gICAgICBjb25zdCByaWdodEVkZ2VzID0gW107XG4gICAgICBsZXQgY3VycmVudFRyaWFuZ2xlID0gbnVsbDtcbiAgICAgIGxldCBjdXJyZW50RWRnZSA9IG51bGw7XG4gICAgICBjb25zdCB0cmlhbmdsZXNUb1JlbW92ZSA9IFtdO1xuICAgICAgY29uc3QgZWRnZXNUb1JlbW92ZSA9IFtdO1xuXG4gICAgICBsZXQgb3V0c2lkZVJpZ2h0ID0gRGVsYXVuYXlUcmlhbmd1bGF0aW9uLnZlcnRleFByb2R1Y3QoIHZlcnRleCwgcmlnaHRGcm9udEVkZ2Uuc3RhcnRWZXJ0ZXgsIGJvdHRvbVZlcnRleCApID4gMDtcbiAgICAgIGxldCBvdXRzaWRlTGVmdCA9IERlbGF1bmF5VHJpYW5ndWxhdGlvbi52ZXJ0ZXhQcm9kdWN0KCB2ZXJ0ZXgsIGxlZnRGcm9udEVkZ2UuZW5kVmVydGV4LCBib3R0b21WZXJ0ZXggKSA8IDA7XG5cbiAgICAgIC8vIElmIHdlIHN0YXJ0IGluc2lkZSwgd2UgbmVlZCB0byBpZGVudGlmeSB3aGljaCB0cmlhbmdsZSB3ZSdyZSBpbnNpZGUgb2YuXG4gICAgICBpZiAoICFvdXRzaWRlUmlnaHQgJiYgIW91dHNpZGVMZWZ0ICkge1xuICAgICAgICBhc3NlcnQgJiYgYXNzZXJ0KCByaWdodEZyb250RWRnZS50cmlhbmdsZXMubGVuZ3RoID09PSAxICk7XG4gICAgICAgIGFzc2VydCAmJiBhc3NlcnQoIGxlZnRGcm9udEVkZ2UudHJpYW5nbGVzLmxlbmd0aCA9PT0gMSApO1xuXG4gICAgICAgIGxldCBsYXN0VmVydGV4ID0gcmlnaHRGcm9udEVkZ2Uuc3RhcnRWZXJ0ZXg7XG4gICAgICAgIGxldCBuZXh0VmVydGV4O1xuICAgICAgICBjdXJyZW50VHJpYW5nbGUgPSByaWdodEZyb250RWRnZS50cmlhbmdsZXNbIDAgXTtcbiAgICAgICAgLy8gVE9ETzogVHJpYW5nbGUgb3BlcmF0aW9ucyB0byBtYWtlIHRoaXMgbW9yZSByZWFkYWJsZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvZG90L2lzc3Vlcy85NlxuICAgICAgICB3aGlsZSAoIERlbGF1bmF5VHJpYW5ndWxhdGlvbi52ZXJ0ZXhQcm9kdWN0KCB2ZXJ0ZXgsIG5leHRWZXJ0ZXggPSBjdXJyZW50VHJpYW5nbGUuZ2V0RWRnZU9wcG9zaXRlRnJvbVZlcnRleCggdmVydGV4ICkuZ2V0T3RoZXJWZXJ0ZXgoIGxhc3RWZXJ0ZXggKSwgYm90dG9tVmVydGV4ICkgPCAwICkge1xuICAgICAgICAgIGN1cnJlbnRUcmlhbmdsZSA9IGN1cnJlbnRUcmlhbmdsZS5nZXRFZGdlT3Bwb3NpdGVGcm9tVmVydGV4KCBsYXN0VmVydGV4ICkuZ2V0T3RoZXJUcmlhbmdsZSggY3VycmVudFRyaWFuZ2xlICk7XG4gICAgICAgICAgbGFzdFZlcnRleCA9IG5leHRWZXJ0ZXg7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBJZiBvdXIgaW5pdGlhbCB0cmlhbmdsZSBoYXMgb3VyIHZlcnRleCBhbmQgYm90dG9tVmVydGV4LCB0aGVuIGJhaWwgb3V0IChlZGdlIGFscmVhZHkgZXhpc3RzKVxuICAgICAgICBpZiAoIGN1cnJlbnRUcmlhbmdsZS5oYXNWZXJ0ZXgoIGJvdHRvbVZlcnRleCApICkge1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG5cbiAgICAgICAgdHJpYW5nbGVzVG9SZW1vdmUucHVzaCggY3VycmVudFRyaWFuZ2xlICk7XG5cbiAgICAgICAgY3VycmVudEVkZ2UgPSBjdXJyZW50VHJpYW5nbGUuZ2V0RWRnZU9wcG9zaXRlRnJvbVZlcnRleCggdmVydGV4ICk7XG4gICAgICAgIGVkZ2VzVG9SZW1vdmUucHVzaCggY3VycmVudEVkZ2UgKTtcbiAgICAgICAgbGVmdEVkZ2VzLnB1c2goIGN1cnJlbnRUcmlhbmdsZS5nZXRFZGdlT3Bwb3NpdGVGcm9tVmVydGV4KCBsYXN0VmVydGV4ICkgKTtcbiAgICAgICAgcmlnaHRFZGdlcy5wdXNoKCBjdXJyZW50VHJpYW5nbGUuZ2V0RWRnZU9wcG9zaXRlRnJvbVZlcnRleCggY3VycmVudEVkZ2UuZ2V0T3RoZXJWZXJ0ZXgoIGxhc3RWZXJ0ZXggKSApICk7XG4gICAgICAgIGFzc2VydCAmJiBhc3NlcnQoIGxlZnRFZGdlc1sgMCBdLmdldE90aGVyVmVydGV4KCB2ZXJ0ZXggKS5wb2ludC54IDwgcmlnaHRFZGdlc1sgMCBdLmdldE90aGVyVmVydGV4KCB2ZXJ0ZXggKS5wb2ludC54ICk7XG4gICAgICB9XG5cbiAgICAgIHdoaWxlICggdHJ1ZSApIHtcbiAgICAgICAgaWYgKCBvdXRzaWRlUmlnaHQgKSB7XG4gICAgICAgICAgLy8gVE9ETzogaW1wbGVtZW50IGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9kb3QvaXNzdWVzLzk2XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoIG91dHNpZGVMZWZ0ICkge1xuICAgICAgICAgIC8vIFRPRE86IGltcGxlbWVudCBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvZG90L2lzc3Vlcy85NlxuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgIGlmICggY3VycmVudEVkZ2UudHJpYW5nbGVzLmxlbmd0aCA+IDEgKSB7XG4gICAgICAgICAgICBjb25zdCBuZXh0VHJpYW5nbGUgPSBjdXJyZW50RWRnZS5nZXRPdGhlclRyaWFuZ2xlKCBjdXJyZW50VHJpYW5nbGUgKTtcbiAgICAgICAgICAgIGlmICggbmV4dFRyaWFuZ2xlLmhhc1ZlcnRleCggYm90dG9tVmVydGV4ICkgKSB7XG5cbiAgICAgICAgICAgICAgLy8gVE9ETzogZG8gdGhpbmdzISBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvZG90L2lzc3Vlcy85NlxuICAgICAgICAgICAgICB0cmlhbmdsZXNUb1JlbW92ZS5wdXNoKCBuZXh0VHJpYW5nbGUgKTtcbiAgICAgICAgICAgICAgbGVmdEVkZ2VzLnB1c2goIG5leHRUcmlhbmdsZS5nZXROZXh0RWRnZSggY3VycmVudEVkZ2UgKSApO1xuICAgICAgICAgICAgICByaWdodEVkZ2VzLnB1c2goIG5leHRUcmlhbmdsZS5nZXRQcmV2aW91c0VkZ2UoIGN1cnJlbnRFZGdlICkgKTtcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgLy8gSWYgdGhpcyBpcyB0aGUgbmV4dCBlZGdlIGludGVyc2VjdGVkXG4gICAgICAgICAgICAgIGxldCBuZXh0RWRnZTtcbiAgICAgICAgICAgICAgaWYgKCBuZXh0VHJpYW5nbGUuYUVkZ2UgIT09IGN1cnJlbnRFZGdlICYmIG5leHRUcmlhbmdsZS5hRWRnZS5pbnRlcnNlY3RzQ29uc3RyYWluZWRFZGdlKCB2ZXJ0ZXgsIGJvdHRvbVZlcnRleCApICkge1xuICAgICAgICAgICAgICAgIG5leHRFZGdlID0gbmV4dFRyaWFuZ2xlLmFFZGdlO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIGVsc2UgaWYgKCBuZXh0VHJpYW5nbGUuYkVkZ2UgIT09IGN1cnJlbnRFZGdlICYmIG5leHRUcmlhbmdsZS5iRWRnZS5pbnRlcnNlY3RzQ29uc3RyYWluZWRFZGdlKCB2ZXJ0ZXgsIGJvdHRvbVZlcnRleCApICkge1xuICAgICAgICAgICAgICAgIG5leHRFZGdlID0gbmV4dFRyaWFuZ2xlLmJFZGdlO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIGVsc2UgaWYgKCBuZXh0VHJpYW5nbGUuY0VkZ2UgIT09IGN1cnJlbnRFZGdlICYmIG5leHRUcmlhbmdsZS5jRWRnZS5pbnRlcnNlY3RzQ29uc3RyYWluZWRFZGdlKCB2ZXJ0ZXgsIGJvdHRvbVZlcnRleCApICkge1xuICAgICAgICAgICAgICAgIG5leHRFZGdlID0gbmV4dFRyaWFuZ2xlLmNFZGdlO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIGFzc2VydCAmJiBhc3NlcnQoIG5leHRFZGdlICk7XG5cbiAgICAgICAgICAgICAgaWYgKCBuZXh0VHJpYW5nbGUuZ2V0TmV4dEVkZ2UoIG5leHRFZGdlICkgPT09IGN1cnJlbnRFZGdlICkge1xuICAgICAgICAgICAgICAgIGxlZnRFZGdlcy5wdXNoKCBuZXh0VHJpYW5nbGUuZ2V0UHJldmlvdXNFZGdlKCBuZXh0RWRnZSApICk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgcmlnaHRFZGdlcy5wdXNoKCBuZXh0VHJpYW5nbGUuZ2V0TmV4dEVkZ2UoIG5leHRFZGdlICkgKTtcbiAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgIGN1cnJlbnRFZGdlID0gbmV4dEVkZ2U7XG4gICAgICAgICAgICAgIGVkZ2VzVG9SZW1vdmUucHVzaCggY3VycmVudEVkZ2UgKTtcblxuICAgICAgICAgICAgICBjdXJyZW50VHJpYW5nbGUgPSBuZXh0VHJpYW5nbGU7XG4gICAgICAgICAgICAgIHRyaWFuZ2xlc1RvUmVtb3ZlLnB1c2goIGN1cnJlbnRUcmlhbmdsZSApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgICAvLyBObyBvdGhlciB0cmlhbmdsZSwgZXhpdGVkXG4gICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBpZiAoIGJvdHRvbVZlcnRleC5wb2ludC54IDwgdmVydGV4LnBvaW50LnggKSB7XG4gICAgICAgICAgICAgIG91dHNpZGVMZWZ0ID0gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICBvdXRzaWRlUmlnaHQgPSB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBmb3IgKCBsZXQgaiA9IDA7IGogPCB0cmlhbmdsZXNUb1JlbW92ZS5sZW5ndGg7IGorKyApIHtcbiAgICAgICAgY29uc3QgdHJpYW5nbGVUb1JlbW92ZSA9IHRyaWFuZ2xlc1RvUmVtb3ZlWyBqIF07XG4gICAgICAgIGFycmF5UmVtb3ZlKCB0aGlzLnRyaWFuZ2xlcywgdHJpYW5nbGVUb1JlbW92ZSApO1xuICAgICAgICB0cmlhbmdsZVRvUmVtb3ZlLnJlbW92ZSgpO1xuICAgICAgfVxuXG4gICAgICBmb3IgKCBsZXQgaiA9IDA7IGogPCBlZGdlc1RvUmVtb3ZlLmxlbmd0aDsgaisrICkge1xuICAgICAgICBhcnJheVJlbW92ZSggdGhpcy5lZGdlcywgZWRnZXNUb1JlbW92ZVsgaiBdICk7XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IGNvbnN0cmFpbnRFZGdlID0gbmV3IEVkZ2UoIGJvdHRvbVZlcnRleCwgdmVydGV4ICk7XG4gICAgICBjb25zdHJhaW50RWRnZS5pc0NvbnN0cmFpbmVkID0gdHJ1ZTtcbiAgICAgIHRoaXMuZWRnZXMucHVzaCggY29uc3RyYWludEVkZ2UgKTtcbiAgICAgIGxlZnRFZGdlcy5wdXNoKCBjb25zdHJhaW50RWRnZSApO1xuICAgICAgcmlnaHRFZGdlcy5wdXNoKCBjb25zdHJhaW50RWRnZSApO1xuICAgICAgcmlnaHRFZGdlcy5yZXZlcnNlKCk7IC8vIFB1dCBlZGdlcyBpbiBjb3VudGVyY2xvY2t3aXNlIG9yZGVyXG5cbiAgICAgIC8vIFRPRE86IHJlbW92ZSB0aGlzISBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvZG90L2lzc3Vlcy85NlxuICAgICAgd2luZG93LnRyaURlYnVnICYmIHdpbmRvdy50cmlEZWJ1ZyggdGhpcyApO1xuXG4gICAgICB0aGlzLnRyaWFuZ3VsYXRlUG9seWdvbiggbGVmdEVkZ2VzICk7XG4gICAgICB0aGlzLnRyaWFuZ3VsYXRlUG9seWdvbiggcmlnaHRFZGdlcyApO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBDcmVhdGVzIGVkZ2VzL3RyaWFuZ2xlcyB0byB0cmlhbmd1bGF0ZSBhIHNpbXBsZSBwb2x5Z29uLlxuICAgKiBAcHJpdmF0ZVxuICAgKlxuICAgKiBAcGFyYW0ge0FycmF5LjxFZGdlPn0gZWRnZXMgLSBTaG91bGQgYmUgaW4gY291bnRlcmNsb2Nrd2lzZSBvcmRlclxuICAgKi9cbiAgdHJpYW5ndWxhdGVQb2x5Z29uKCBlZGdlcyApIHtcbiAgICAvLyBUT0RPOiBTb21ldGhpbmcgbW9yZSBlZmZpY2llbnQgdGhhbiBlYXIgY2xpcHBpbmcgbWV0aG9kIGJlbG93IGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9kb3QvaXNzdWVzLzk2XG4gICAgd2hpbGUgKCBlZGdlcy5sZW5ndGggPiAzICkge1xuICAgICAgZm9yICggbGV0IGsgPSAwOyBrIDwgZWRnZXMubGVuZ3RoOyBrKysgKSB7XG4gICAgICAgIGNvbnN0IGt4ID0gayA8IGVkZ2VzLmxlbmd0aCAtIDEgPyBrICsgMSA6IDA7XG4gICAgICAgIGFzc2VydCAmJiBhc3NlcnQoIGVkZ2VzWyBrIF0uZ2V0U2hhcmVkVmVydGV4KCBlZGdlc1sga3ggXSApICk7XG4gICAgICB9XG5cbiAgICAgIC8vIENoZWNrIGlmIGVhY2ggdHJpcGxlIG9mIHZlcnRpY2VzIGlzIGFuIGVhciAoYW5kIGlmIHNvLCByZW1vdmUgaXQpXG4gICAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBlZGdlcy5sZW5ndGg7IGkrKyApIHtcbiAgICAgICAgLy8gTmV4dCBpbmRleFxuICAgICAgICBjb25zdCBpeCA9IGkgPCBlZGdlcy5sZW5ndGggLSAxID8gaSArIDEgOiAwO1xuXG4gICAgICAgIC8vIEluZm9ybWF0aW9uIGFib3V0IG91ciBwb3RlbnRpYWwgZWFyXG4gICAgICAgIGNvbnN0IGVkZ2UgPSBlZGdlc1sgaSBdO1xuICAgICAgICBjb25zdCBuZXh0RWRnZSA9IGVkZ2VzWyBpeCBdO1xuICAgICAgICBjb25zdCBzaGFyZWRWZXJ0ZXggPSBlZGdlLmdldFNoYXJlZFZlcnRleCggbmV4dEVkZ2UgKTtcbiAgICAgICAgY29uc3Qgc3RhcnRWZXJ0ZXggPSBlZGdlLmdldE90aGVyVmVydGV4KCBzaGFyZWRWZXJ0ZXggKTtcbiAgICAgICAgY29uc3QgZW5kVmVydGV4ID0gbmV4dEVkZ2UuZ2V0T3RoZXJWZXJ0ZXgoIHNoYXJlZFZlcnRleCApO1xuXG4gICAgICAgIGlmICggVXRpbHMudHJpYW5nbGVBcmVhU2lnbmVkKCBzdGFydFZlcnRleC5wb2ludCwgc2hhcmVkVmVydGV4LnBvaW50LCBlbmRWZXJ0ZXgucG9pbnQgKSA8PSAwICkge1xuICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gVmFyaWFibGVzIGZvciBjb21wdXRpbmcgYmFyeWNlbnRyaWMgY29vcmRpbmF0ZXNcbiAgICAgICAgY29uc3QgZW5kRGVsdGEgPSBlbmRWZXJ0ZXgucG9pbnQubWludXMoIHNoYXJlZFZlcnRleC5wb2ludCApO1xuICAgICAgICBjb25zdCBzdGFydERlbHRhID0gc3RhcnRWZXJ0ZXgucG9pbnQubWludXMoIHNoYXJlZFZlcnRleC5wb2ludCApO1xuICAgICAgICBjb25zdCBlbmRNYWduaXR1ZGVTcXVhcmVkID0gZW5kRGVsdGEuZG90KCBlbmREZWx0YSApO1xuICAgICAgICBjb25zdCBzdGFydEVuZFByb2R1Y3QgPSBlbmREZWx0YS5kb3QoIHN0YXJ0RGVsdGEgKTtcbiAgICAgICAgY29uc3Qgc3RhcnRNYWduaXR1ZGVTcXVhcmVkID0gc3RhcnREZWx0YS5kb3QoIHN0YXJ0RGVsdGEgKTtcbiAgICAgICAgY29uc3QgeCA9IGVuZE1hZ25pdHVkZVNxdWFyZWQgKiBzdGFydE1hZ25pdHVkZVNxdWFyZWQgLSBzdGFydEVuZFByb2R1Y3QgKiBzdGFydEVuZFByb2R1Y3Q7XG5cbiAgICAgICAgLy8gU2VlIGlmIHRoZXJlIGFyZSBvdGhlciB2ZXJ0aWNlcyBpbiBvdXIgdHJpYW5nbGUgKGl0IHdvdWxkbid0IGJlIGFuIGVhciBpZiB0aGVyZSBpcyBhbm90aGVyIGluIGl0KVxuICAgICAgICBsZXQgbGFzdFZlcnRleCA9IGVkZ2VzWyAwIF0uZ2V0U2hhcmVkVmVydGV4KCBlZGdlc1sgZWRnZXMubGVuZ3RoIC0gMSBdICk7XG4gICAgICAgIGxldCBoYXNJbnRlcmlvclZlcnRleCA9IGZhbHNlO1xuICAgICAgICBmb3IgKCBsZXQgaiA9IDA7IGogPCBlZGdlcy5sZW5ndGg7IGorKyApIHtcbiAgICAgICAgICBjb25zdCB2ZXJ0ZXggPSBlZGdlc1sgaiBdLmdldE90aGVyVmVydGV4KCBsYXN0VmVydGV4ICk7XG5cbiAgICAgICAgICBpZiAoIHZlcnRleCAhPT0gc2hhcmVkVmVydGV4ICYmIHZlcnRleCAhPT0gc3RhcnRWZXJ0ZXggJiYgdmVydGV4ICE9PSBlbmRWZXJ0ZXggKSB7XG4gICAgICAgICAgICBjb25zdCBwb2ludERlbHRhID0gdmVydGV4LnBvaW50Lm1pbnVzKCBzaGFyZWRWZXJ0ZXgucG9pbnQgKTtcbiAgICAgICAgICAgIGNvbnN0IHBvaW50RW5kUHJvZHVjdCA9IGVuZERlbHRhLmRvdCggcG9pbnREZWx0YSApO1xuICAgICAgICAgICAgY29uc3QgcG9pbnRTdGFydFByb2R1Y3QgPSBzdGFydERlbHRhLmRvdCggcG9pbnREZWx0YSApO1xuXG4gICAgICAgICAgICAvLyBDb21wdXRlIGJhcnljZW50cmljIGNvb3JkaW5hdGVzXG4gICAgICAgICAgICBjb25zdCB1ID0gKCBzdGFydE1hZ25pdHVkZVNxdWFyZWQgKiBwb2ludEVuZFByb2R1Y3QgLSBzdGFydEVuZFByb2R1Y3QgKiBwb2ludFN0YXJ0UHJvZHVjdCApIC8geDtcbiAgICAgICAgICAgIGNvbnN0IHYgPSAoIGVuZE1hZ25pdHVkZVNxdWFyZWQgKiBwb2ludFN0YXJ0UHJvZHVjdCAtIHN0YXJ0RW5kUHJvZHVjdCAqIHBvaW50RW5kUHJvZHVjdCApIC8geDtcblxuICAgICAgICAgICAgLy8gVGVzdCBmb3Igd2hldGhlciB0aGUgcG9pbnQgaXMgaW4gb3VyIHRyaWFuZ2xlXG4gICAgICAgICAgICBpZiAoIHUgPj0gLTFlLTEwICYmIHYgPj0gLTFlLTEwICYmIHUgKyB2IDwgMSArIDFlLTEwICkge1xuICAgICAgICAgICAgICBoYXNJbnRlcmlvclZlcnRleCA9IHRydWU7XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cblxuICAgICAgICAgIGxhc3RWZXJ0ZXggPSB2ZXJ0ZXg7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBJZiB0aGVyZSBpcyBubyBpbnRlcmlvciB2ZXJ0ZXgsIHRoZW4gd2UgcmVhY2hlZCBhbiBlYXIuXG4gICAgICAgIGlmICggIWhhc0ludGVyaW9yVmVydGV4ICkge1xuICAgICAgICAgIGNvbnN0IG5ld0VkZ2UgPSBuZXcgRWRnZSggc3RhcnRWZXJ0ZXgsIGVuZFZlcnRleCApO1xuICAgICAgICAgIHRoaXMuZWRnZXMucHVzaCggbmV3RWRnZSApO1xuICAgICAgICAgIHRoaXMudHJpYW5nbGVzLnB1c2goIG5ldyBUcmlhbmdsZSggc3RhcnRWZXJ0ZXgsIHNoYXJlZFZlcnRleCwgZW5kVmVydGV4LFxuICAgICAgICAgICAgbmV4dEVkZ2UsIG5ld0VkZ2UsIGVkZ2UgKSApO1xuICAgICAgICAgIGlmICggaXggPiBpICkge1xuICAgICAgICAgICAgZWRnZXMuc3BsaWNlKCBpLCAyLCBuZXdFZGdlICk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgZWRnZXMuc3BsaWNlKCBpLCAxLCBuZXdFZGdlICk7XG4gICAgICAgICAgICBlZGdlcy5zcGxpY2UoIGl4LCAxICk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8gVE9ETzogcmVtb3ZlIHRoaXMhIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9kb3QvaXNzdWVzLzk2XG4gICAgICAgICAgd2luZG93LnRyaURlYnVnICYmIHdpbmRvdy50cmlEZWJ1ZyggdGhpcyApO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gRmlsbCBpbiB0aGUgbGFzdCB0cmlhbmdsZVxuICAgIGlmICggZWRnZXMubGVuZ3RoID09PSAzICkge1xuICAgICAgdGhpcy50cmlhbmdsZXMucHVzaCggbmV3IFRyaWFuZ2xlKCBlZGdlc1sgMCBdLmdldFNoYXJlZFZlcnRleCggZWRnZXNbIDEgXSApLCBlZGdlc1sgMSBdLmdldFNoYXJlZFZlcnRleCggZWRnZXNbIDIgXSApLCBlZGdlc1sgMCBdLmdldFNoYXJlZFZlcnRleCggZWRnZXNbIDIgXSApLFxuICAgICAgICBlZGdlc1sgMiBdLCBlZGdlc1sgMCBdLCBlZGdlc1sgMSBdICkgKTtcblxuICAgICAgLy8gVE9ETzogcmVtb3ZlIHRoaXMhIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9kb3QvaXNzdWVzLzk2XG4gICAgICB3aW5kb3cudHJpRGVidWcgJiYgd2luZG93LnRyaURlYnVnKCB0aGlzICk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFNob3VsZCBiZSBjYWxsZWQgd2hlbiB0aGVyZSBhcmUgbm8gbW9yZSByZW1haW5pbmcgdmVydGljZXMgbGVmdCB0byBiZSBwcm9jZXNzZWQuXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBmaW5hbGl6ZSgpIHtcbiAgICAvLyBBY2N1bXVsYXRlIGZyb250IGVkZ2VzLCBleGNsdWRpbmcgdGhlIGZpcnN0IGFuZCBsYXN0LlxuICAgIGNvbnN0IGZyb250RWRnZXMgPSBbXTtcbiAgICBsZXQgZnJvbnRFZGdlID0gdGhpcy5maXJzdEZyb250RWRnZS5uZXh0RWRnZTtcbiAgICB3aGlsZSAoIGZyb250RWRnZSAmJiBmcm9udEVkZ2UubmV4dEVkZ2UgKSB7XG4gICAgICBmcm9udEVkZ2VzLnB1c2goIGZyb250RWRnZSApO1xuICAgICAgZnJvbnRFZGdlID0gZnJvbnRFZGdlLm5leHRFZGdlO1xuICAgIH1cbiAgICBjb25zdCBmaXJzdEZyb250RWRnZSA9IHRoaXMuZmlyc3RGcm9udEVkZ2U7XG4gICAgY29uc3QgbGFzdEZyb250RWRnZSA9IGZyb250RWRnZTtcblxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHRoaXMuZmlyc3RGcm9udEVkZ2UudHJpYW5nbGVzLmxlbmd0aCA9PT0gMSApO1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIGxhc3RGcm9udEVkZ2UudHJpYW5nbGVzLmxlbmd0aCA9PT0gMSApO1xuXG4gICAgLy8gSGFuZGxlIGFkZGluZyBhbnkgdHJpYW5nbGVzIG5vdCBpbiB0aGUgY29udmV4IGh1bGwgKG9uIHRoZSBmcm9udCBlZGdlKVxuICAgIGZvciAoIGxldCBpID0gMDsgaSA8IGZyb250RWRnZXMubGVuZ3RoIC0gMTsgaSsrICkge1xuICAgICAgY29uc3QgZmlyc3RFZGdlID0gZnJvbnRFZGdlc1sgaSBdO1xuICAgICAgY29uc3Qgc2Vjb25kRWRnZSA9IGZyb250RWRnZXNbIGkgKyAxIF07XG4gICAgICBpZiAoIFV0aWxzLnRyaWFuZ2xlQXJlYVNpZ25lZCggc2Vjb25kRWRnZS5lbmRWZXJ0ZXgucG9pbnQsIGZpcnN0RWRnZS5lbmRWZXJ0ZXgucG9pbnQsIGZpcnN0RWRnZS5zdGFydFZlcnRleC5wb2ludCApID4gMWUtMTAgKSB7XG4gICAgICAgIGNvbnN0IG5ld0VkZ2UgPSB0aGlzLmZpbGxCb3JkZXJUcmlhbmdsZSggZmlyc3RFZGdlLCBzZWNvbmRFZGdlLCBmaXJzdEVkZ2Uuc3RhcnRWZXJ0ZXgsIGZpcnN0RWRnZS5lbmRWZXJ0ZXgsIHNlY29uZEVkZ2UuZW5kVmVydGV4ICk7XG4gICAgICAgIGZyb250RWRnZXMuc3BsaWNlKCBpLCAyLCBuZXdFZGdlICk7XG4gICAgICAgIC8vIHN0YXJ0IHNjYW5uaW5nIGZyb20gYmVoaW5kIHdoZXJlIHdlIHdlcmUgcHJldmlvdXNseSAoaWYgcG9zc2libGUpXG4gICAgICAgIGkgPSBNYXRoLm1heCggaSAtIDIsIC0xICk7XG4gICAgICAgIC8vIFRPRE86IHJlbW92ZSB0aGlzISBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvZG90L2lzc3Vlcy85NlxuICAgICAgICB3aW5kb3cudHJpRGVidWcgJiYgd2luZG93LnRyaURlYnVnKCB0aGlzICk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gQ2xlYXIgb3V0IGZyb250IGVkZ2UgaW5mb3JtYXRpb24sIG5vIGxvbmdlciBuZWVkZWQuXG4gICAgdGhpcy5maXJzdEZyb250RWRnZSA9IG51bGw7XG5cbiAgICAvLyBBY2N1bXVsYXRlIGJhY2sgZWRnZXMgYW5kIGl0ZW1zIHRvIGdldCByaWQgb2ZcbiAgICBjb25zdCBiYWNrRWRnZXMgPSBbXTtcbiAgICBjb25zdCBhcnRpZmljaWFsRWRnZXMgPSBbIGZpcnN0RnJvbnRFZGdlIF07XG4gICAgbGV0IGN1cnJlbnRTcGxpdEVkZ2UgPSBmaXJzdEZyb250RWRnZTtcbiAgICB3aGlsZSAoIGN1cnJlbnRTcGxpdEVkZ2UgIT09IGxhc3RGcm9udEVkZ2UgKSB7XG4gICAgICBjb25zdCBuZXh0VHJpYW5nbGUgPSBjdXJyZW50U3BsaXRFZGdlLnRyaWFuZ2xlc1sgMCBdO1xuICAgICAgbmV4dFRyaWFuZ2xlLnJlbW92ZSgpO1xuICAgICAgYXJyYXlSZW1vdmUoIHRoaXMudHJpYW5nbGVzLCBuZXh0VHJpYW5nbGUgKTtcblxuICAgICAgY29uc3QgZWRnZSA9IG5leHRUcmlhbmdsZS5nZXROb25BcnRpZmljaWFsRWRnZSgpO1xuICAgICAgaWYgKCBlZGdlICkge1xuICAgICAgICBiYWNrRWRnZXMucHVzaCggZWRnZSApO1xuICAgICAgICBjb25zdCBzaGFyZWRWZXJ0ZXggPSBlZGdlLmdldFNoYXJlZFZlcnRleCggY3VycmVudFNwbGl0RWRnZSApO1xuICAgICAgICBjdXJyZW50U3BsaXRFZGdlID0gbmV4dFRyaWFuZ2xlLmdldEVkZ2VPcHBvc2l0ZUZyb21WZXJ0ZXgoIHNoYXJlZFZlcnRleCApO1xuICAgICAgfVxuICAgICAgLy8gT3VyIG1pbi1tYXgtYm90dG9tUG9pbnQgdHJpYW5nbGUgKHBpdm90LCBubyBlZGdlIHRvIGFkZClcbiAgICAgIGVsc2Uge1xuICAgICAgICBhc3NlcnQgJiYgYXNzZXJ0KCBjdXJyZW50U3BsaXRFZGdlLnN0YXJ0VmVydGV4ID09PSB0aGlzLmFydGlmaWNpYWxNYXhWZXJ0ZXggKTtcblxuICAgICAgICAvLyBSZW1vdmUgdGhlIFwiYm90dG9tXCIgZWRnZSBjb25uZWN0aW5nIGJvdGggYXJ0aWZpY2lhbCBwb2ludHNcbiAgICAgICAgYXJ0aWZpY2lhbEVkZ2VzLnB1c2goIG5leHRUcmlhbmdsZS5nZXRFZGdlT3Bwb3NpdGVGcm9tVmVydGV4KCBjdXJyZW50U3BsaXRFZGdlLmVuZFZlcnRleCApICk7XG5cbiAgICAgICAgLy8gUGl2b3RcbiAgICAgICAgY3VycmVudFNwbGl0RWRnZSA9IG5leHRUcmlhbmdsZS5nZXRFZGdlT3Bwb3NpdGVGcm9tVmVydGV4KCBjdXJyZW50U3BsaXRFZGdlLnN0YXJ0VmVydGV4ICk7XG4gICAgICB9XG4gICAgICBhcnRpZmljaWFsRWRnZXMucHVzaCggY3VycmVudFNwbGl0RWRnZSApO1xuICAgIH1cblxuICAgIGZvciAoIGxldCBpID0gMDsgaSA8IGFydGlmaWNpYWxFZGdlcy5sZW5ndGg7IGkrKyApIHtcbiAgICAgIGFycmF5UmVtb3ZlKCB0aGlzLmVkZ2VzLCBhcnRpZmljaWFsRWRnZXNbIGkgXSApO1xuICAgIH1cblxuICAgIC8vIFRPRE86IHJlbW92ZSB0aGlzISBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvZG90L2lzc3Vlcy85NlxuICAgIHdpbmRvdy50cmlEZWJ1ZyAmJiB3aW5kb3cudHJpRGVidWcoIHRoaXMgKTtcblxuICAgIC8vIEhhbmRsZSBhZGRpbmcgYW55IHRyaWFuZ2xlcyBub3QgaW4gdGhlIGNvbnZleCBodWxsIChvbiB0aGUgYmFjayBlZGdlKVxuICAgIGZvciAoIGxldCBpID0gMDsgaSA8IGJhY2tFZGdlcy5sZW5ndGggLSAxOyBpKysgKSB7XG4gICAgICBjb25zdCBmaXJzdEVkZ2UgPSBiYWNrRWRnZXNbIGkgKyAxIF07XG4gICAgICBjb25zdCBzZWNvbmRFZGdlID0gYmFja0VkZ2VzWyBpIF07XG5cbiAgICAgIGNvbnN0IHNoYXJlZFZlcnRleCA9IGZpcnN0RWRnZS5nZXRTaGFyZWRWZXJ0ZXgoIHNlY29uZEVkZ2UgKTtcbiAgICAgIGNvbnN0IGZpcnN0VmVydGV4ID0gZmlyc3RFZGdlLmdldE90aGVyVmVydGV4KCBzaGFyZWRWZXJ0ZXggKTtcbiAgICAgIGNvbnN0IHNlY29uZFZlcnRleCA9IHNlY29uZEVkZ2UuZ2V0T3RoZXJWZXJ0ZXgoIHNoYXJlZFZlcnRleCApO1xuICAgICAgaWYgKCBVdGlscy50cmlhbmdsZUFyZWFTaWduZWQoIHNlY29uZFZlcnRleC5wb2ludCwgc2hhcmVkVmVydGV4LnBvaW50LCBmaXJzdFZlcnRleC5wb2ludCApID4gMWUtMTAgKSB7XG4gICAgICAgIGNvbnN0IG5ld0VkZ2UgPSB0aGlzLmZpbGxCb3JkZXJUcmlhbmdsZSggZmlyc3RFZGdlLCBzZWNvbmRFZGdlLCBmaXJzdFZlcnRleCwgc2hhcmVkVmVydGV4LCBzZWNvbmRWZXJ0ZXggKTtcbiAgICAgICAgYmFja0VkZ2VzLnNwbGljZSggaSwgMiwgbmV3RWRnZSApO1xuICAgICAgICAvLyBzdGFydCBzY2FubmluZyBmcm9tIGJlaGluZCB3aGVyZSB3ZSB3ZXJlIHByZXZpb3VzbHkgKGlmIHBvc3NpYmxlKVxuICAgICAgICBpID0gTWF0aC5tYXgoIGkgLSAyLCAtMSApO1xuICAgICAgICAvLyBUT0RPOiByZW1vdmUgdGhpcyEgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2RvdC9pc3N1ZXMvOTZcbiAgICAgICAgd2luZG93LnRyaURlYnVnICYmIHdpbmRvdy50cmlEZWJ1ZyggdGhpcyApO1xuICAgICAgfVxuICAgIH1cblxuICAgIGZvciAoIGxldCBpID0gMDsgaSA8IGZyb250RWRnZXMubGVuZ3RoOyBpKysgKSB7XG4gICAgICB0aGlzLmNvbnZleEh1bGwucHVzaCggZnJvbnRFZGdlc1sgaSBdLnN0YXJ0VmVydGV4ICk7XG4gICAgfVxuICAgIHRoaXMuY29udmV4SHVsbC5wdXNoKCBmcm9udEVkZ2VzWyBmcm9udEVkZ2VzLmxlbmd0aCAtIDEgXS5lbmRWZXJ0ZXggKTtcbiAgICBmb3IgKCBsZXQgaSA9IGJhY2tFZGdlcy5sZW5ndGggLSAxOyBpID49IDE7IGktLSApIHtcbiAgICAgIHRoaXMuY29udmV4SHVsbC5wdXNoKCBiYWNrRWRnZXNbIGkgXS5nZXRTaGFyZWRWZXJ0ZXgoIGJhY2tFZGdlc1sgaSAtIDEgXSApICk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIENoZWNrcyBhbiBlZGdlIHRvIHNlZSB3aGV0aGVyIGl0cyB0d28gYWRqYWNlbnQgdHJpYW5nbGVzIHNhdGlzZnkgdGhlIGRlbGF1bmF5IGNvbmRpdGlvbiAodGhlIGZhciBwb2ludCBvZiBvbmVcbiAgICogdHJpYW5nbGUgc2hvdWxkIG5vdCBiZSBjb250YWluZWQgaW4gdGhlIG90aGVyIHRyaWFuZ2xlJ3MgY2lyY3VtY2lyY2xlKSwgYW5kIGlmIGl0IGlzIG5vdCBzYXRpc2ZpZWQsIGZsaXBzIHRoZVxuICAgKiBlZGdlIHNvIHRoZSBjb25kaXRpb24gaXMgc2F0aXNmaWVkLlxuICAgKiBAcHJpdmF0ZVxuICAgKlxuICAgKiBAcGFyYW0ge0VkZ2V9IGVkZ2VcbiAgICovXG4gIGxlZ2FsaXplRWRnZSggZWRnZSApIHtcbiAgICAvLyBDaGVja2luZyBlYWNoIGVkZ2UgdG8gc2VlIGlmIGl0IGlzbid0IGluIG91ciB0cmlhbmd1bGF0aW9uIGFueW1vcmUgKG9yIGNhbid0IGJlIGlsbGVnYWwgYmVjYXVzZSBpdCBkb2Vzbid0XG4gICAgLy8gaGF2ZSBtdWx0aXBsZSB0cmlhbmdsZXMpIGhlbHBzIGEgbG90LlxuICAgIGlmICggIV8uaW5jbHVkZXMoIHRoaXMuZWRnZXMsIGVkZ2UgKSB8fCBlZGdlLnRyaWFuZ2xlcy5sZW5ndGggIT09IDIgfHwgZWRnZS5pc0NvbnN0cmFpbmVkICkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IHRyaWFuZ2xlMSA9IGVkZ2UudHJpYW5nbGVzWyAwIF07XG4gICAgY29uc3QgdHJpYW5nbGUyID0gZWRnZS50cmlhbmdsZXNbIDEgXTtcblxuICAgIGNvbnN0IGZhclZlcnRleDEgPSB0cmlhbmdsZTEuZ2V0VmVydGV4T3Bwb3NpdGVGcm9tRWRnZSggZWRnZSApO1xuICAgIGNvbnN0IGZhclZlcnRleDIgPSB0cmlhbmdsZTIuZ2V0VmVydGV4T3Bwb3NpdGVGcm9tRWRnZSggZWRnZSApO1xuXG4gICAgaWYgKCBVdGlscy5wb2ludEluQ2lyY2xlRnJvbVBvaW50cyggdHJpYW5nbGUxLmFWZXJ0ZXgucG9pbnQsIHRyaWFuZ2xlMS5iVmVydGV4LnBvaW50LCB0cmlhbmdsZTEuY1ZlcnRleC5wb2ludCwgZmFyVmVydGV4Mi5wb2ludCApIHx8XG4gICAgICAgICBVdGlscy5wb2ludEluQ2lyY2xlRnJvbVBvaW50cyggdHJpYW5nbGUyLmFWZXJ0ZXgucG9pbnQsIHRyaWFuZ2xlMi5iVmVydGV4LnBvaW50LCB0cmlhbmdsZTIuY1ZlcnRleC5wb2ludCwgZmFyVmVydGV4MS5wb2ludCApICkge1xuICAgICAgLy8gVE9ETzogYmV0dGVyIGhlbHBlciBmdW5jdGlvbnMgZm9yIGFkZGluZy9yZW1vdmluZyB0cmlhbmdsZXMgKHRha2VzIGNhcmUgb2YgdGhlIGVkZ2Ugc3R1ZmYpIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9kb3QvaXNzdWVzLzk2XG4gICAgICB0cmlhbmdsZTEucmVtb3ZlKCk7XG4gICAgICB0cmlhbmdsZTIucmVtb3ZlKCk7XG4gICAgICBhcnJheVJlbW92ZSggdGhpcy50cmlhbmdsZXMsIHRyaWFuZ2xlMSApO1xuICAgICAgYXJyYXlSZW1vdmUoIHRoaXMudHJpYW5nbGVzLCB0cmlhbmdsZTIgKTtcbiAgICAgIGFycmF5UmVtb3ZlKCB0aGlzLmVkZ2VzLCBlZGdlICk7XG5cbiAgICAgIGNvbnN0IG5ld0VkZ2UgPSBuZXcgRWRnZSggZmFyVmVydGV4MSwgZmFyVmVydGV4MiApO1xuICAgICAgdGhpcy5lZGdlcy5wdXNoKCBuZXdFZGdlICk7XG5cbiAgICAgIGNvbnN0IHRyaWFuZ2xlMUVkZ2UxID0gdHJpYW5nbGUyLmdldEVkZ2VPcHBvc2l0ZUZyb21WZXJ0ZXgoIHRyaWFuZ2xlMi5nZXRWZXJ0ZXhCZWZvcmUoIGZhclZlcnRleDIgKSApO1xuICAgICAgY29uc3QgdHJpYW5nbGUxRWRnZTIgPSB0cmlhbmdsZTEuZ2V0RWRnZU9wcG9zaXRlRnJvbVZlcnRleCggdHJpYW5nbGUxLmdldFZlcnRleEFmdGVyKCBmYXJWZXJ0ZXgxICkgKTtcbiAgICAgIGNvbnN0IHRyaWFuZ2xlMkVkZ2UxID0gdHJpYW5nbGUxLmdldEVkZ2VPcHBvc2l0ZUZyb21WZXJ0ZXgoIHRyaWFuZ2xlMS5nZXRWZXJ0ZXhCZWZvcmUoIGZhclZlcnRleDEgKSApO1xuICAgICAgY29uc3QgdHJpYW5nbGUyRWRnZTIgPSB0cmlhbmdsZTIuZ2V0RWRnZU9wcG9zaXRlRnJvbVZlcnRleCggdHJpYW5nbGUyLmdldFZlcnRleEFmdGVyKCBmYXJWZXJ0ZXgyICkgKTtcblxuICAgICAgLy8gQ29uc3RydWN0IHRoZSBuZXcgdHJpYW5nbGVzIHdpdGggdGhlIGNvcnJlY3Qgb3JpZW50YXRpb25zXG4gICAgICB0aGlzLnRyaWFuZ2xlcy5wdXNoKCBuZXcgVHJpYW5nbGUoIGZhclZlcnRleDEsIGZhclZlcnRleDIsIHRyaWFuZ2xlMS5nZXRWZXJ0ZXhCZWZvcmUoIGZhclZlcnRleDEgKSxcbiAgICAgICAgdHJpYW5nbGUxRWRnZTEsIHRyaWFuZ2xlMUVkZ2UyLCBuZXdFZGdlICkgKTtcbiAgICAgIHRoaXMudHJpYW5nbGVzLnB1c2goIG5ldyBUcmlhbmdsZSggZmFyVmVydGV4MiwgZmFyVmVydGV4MSwgdHJpYW5nbGUyLmdldFZlcnRleEJlZm9yZSggZmFyVmVydGV4MiApLFxuICAgICAgICB0cmlhbmdsZTJFZGdlMSwgdHJpYW5nbGUyRWRnZTIsIG5ld0VkZ2UgKSApO1xuXG4gICAgICB0aGlzLmxlZ2FsaXplRWRnZSggdHJpYW5nbGUxRWRnZTEgKTtcbiAgICAgIHRoaXMubGVnYWxpemVFZGdlKCB0cmlhbmdsZTFFZGdlMiApO1xuICAgICAgdGhpcy5sZWdhbGl6ZUVkZ2UoIHRyaWFuZ2xlMkVkZ2UxICk7XG4gICAgICB0aGlzLmxlZ2FsaXplRWRnZSggdHJpYW5nbGUyRWRnZTIgKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQ29tcGFyaXNvbiBmb3Igc29ydGluZyBwb2ludHMgYnkgeSwgdGhlbiBieSB4LlxuICAgKiBAcHJpdmF0ZVxuICAgKlxuICAgKiBUT0RPOiBEbyB3ZSBuZWVkIHRvIHJldmVyc2UgdGhlIHggc29ydD8gXCJJZiBvdXIgZWRnZSBpcyBob3Jpem9udGFsLCB0aGUgZW5kaW5nIHBvaW50IHdpdGggc21hbGxlciB4IGNvb3JkaW5hdGUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2RvdC9pc3N1ZXMvOTZcbiAgICogICAgICAgaXMgY29uc2lkZXJlZCBhcyB0aGUgdXBwZXIgcG9pbnRcIj9cbiAgICpcbiAgICogQHBhcmFtIHtWZXJ0ZXh9IGFcbiAgICogQHBhcmFtIHtWZXJ0ZXh9IGJcbiAgICogQHJldHVybnMge251bWJlcn1cbiAgICovXG4gIHN0YXRpYyB2ZXJ0ZXhDb21wYXJpc29uKCBhLCBiICkge1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIGEgaW5zdGFuY2VvZiBWZXJ0ZXggKTtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBiIGluc3RhbmNlb2YgVmVydGV4ICk7XG5cbiAgICBhID0gYS5wb2ludDtcbiAgICBiID0gYi5wb2ludDtcbiAgICBpZiAoIGEueSA8IGIueSApIHtcbiAgICAgIHJldHVybiAtMTtcbiAgICB9XG4gICAgZWxzZSBpZiAoIGEueSA+IGIueSApIHtcbiAgICAgIHJldHVybiAxO1xuICAgIH1cbiAgICBlbHNlIGlmICggYS54IDwgYi54ICkge1xuICAgICAgcmV0dXJuIC0xO1xuICAgIH1cbiAgICBlbHNlIGlmICggYS54ID4gYi54ICkge1xuICAgICAgcmV0dXJuIDE7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgLy8gTk9URTogSG93IHdvdWxkIHRoZSBhbGdvcml0aG0gd29yayBpZiB0aGlzIGlzIHRoZSBjYXNlPyBXb3VsZCB0aGUgY29tcGFyaXNvbiBldmVyIHRlc3QgdGhlIHJlZmxleGl2ZVxuICAgICAgLy8gcHJvcGVydHk/XG4gICAgICByZXR1cm4gMDtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgY3Jvc3MgcHJvZHVjdCBvZiAoYVZlcnRleC1zaGFyZWRWZXJ0ZXgpIGFuZCAoYlZlcnRleC1zaGFyZWRWZXJ0ZXgpXG4gICAqIEBwcml2YXRlXG4gICAqXG4gICAqIEBwYXJhbSB7VmVydGV4fSBzaGFyZWRWZXJ0ZXhcbiAgICogQHBhcmFtIHtWZXJ0ZXh9IGFWZXJ0ZXhcbiAgICogQHBhcmFtIHtWZXJ0ZXh9IGJWZXJ0ZXhcbiAgICogQHJldHVybnMge251bWJlcn1cbiAgICovXG4gIHN0YXRpYyB2ZXJ0ZXhQcm9kdWN0KCBzaGFyZWRWZXJ0ZXgsIGFWZXJ0ZXgsIGJWZXJ0ZXggKSB7XG4gICAgY29uc3QgYURpZmYgPSBhVmVydGV4LnBvaW50Lm1pbnVzKCBzaGFyZWRWZXJ0ZXgucG9pbnQgKTtcbiAgICBjb25zdCBiRGlmZiA9IGJWZXJ0ZXgucG9pbnQubWludXMoIHNoYXJlZFZlcnRleC5wb2ludCApO1xuICAgIHJldHVybiBhRGlmZi5jcm9zc1NjYWxhciggYkRpZmYgKTtcbiAgfVxufVxuXG5kb3QucmVnaXN0ZXIoICdEZWxhdW5heVRyaWFuZ3VsYXRpb24nLCBEZWxhdW5heVRyaWFuZ3VsYXRpb24gKTtcblxuY2xhc3MgVmVydGV4IHtcbiAgLyoqXG4gICAqIFZlcnRleCAocG9pbnQgd2l0aCBhbiBpbmRleClcbiAgICogQHByaXZhdGVcbiAgICpcbiAgICogQHBhcmFtIHtWZWN0b3IyfSBwb2ludFxuICAgKiBAcGFyYW0ge251bWJlcn0gaW5kZXggLSBJbmRleCBvZiB0aGUgcG9pbnQgaW4gdGhlIHBvaW50cyBhcnJheVxuICAgKi9cbiAgY29uc3RydWN0b3IoIHBvaW50LCBpbmRleCApIHtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBwb2ludCBpbnN0YW5jZW9mIFZlY3RvcjIgKTtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBwb2ludC5pc0Zpbml0ZSgpICk7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdHlwZW9mIGluZGV4ID09PSAnbnVtYmVyJyApO1xuXG4gICAgLy8gQHB1YmxpYyB7VmVjdG9yMn1cbiAgICB0aGlzLnBvaW50ID0gcG9pbnQ7XG5cbiAgICAvLyBAcHVibGljIHtudW1iZXJ9XG4gICAgdGhpcy5pbmRleCA9IGluZGV4O1xuXG4gICAgLy8gQHB1YmxpYyB7bnVtYmVyfSAtIFdpbGwgYmUgc2V0IGFmdGVyIGNvbnN0cnVjdGlvblxuICAgIHRoaXMuc29ydGVkSW5kZXggPSAtMTtcblxuICAgIC8vIEBwdWJsaWMge0FycmF5LjxWZXJ0ZXg+fSAtIFZlcnRpY2VzIHdpdGggXCJsb3dlclwiIHkgdmFsdWVzIHRoYXQgaGF2ZSBjb25zdHJhaW5lZCBlZGdlcyB3aXRoIHRoaXMgdmVydGV4LlxuICAgIHRoaXMuY29uc3RyYWluZWRWZXJ0aWNlcyA9IFtdO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgd2hldGhlciB0aGlzIGlzIGFuIGFydGlmaWNpYWwgdmVydGV4IChpbmRleCBsZXNzIHRoYW4gemVybykuXG4gICAqIEBwdWJsaWNcbiAgICpcbiAgICogQHJldHVybnMge2Jvb2xlYW59XG4gICAqL1xuICBpc0FydGlmaWNpYWwoKSB7XG4gICAgcmV0dXJuIHRoaXMuaW5kZXggPCAwO1xuICB9XG59XG5cbmNsYXNzIEVkZ2Uge1xuICAvKipcbiAgICogRWRnZSBkZWZpbmVkIGJ5IHR3byB2ZXJ0aWNlc1xuICAgKiBAcHJpdmF0ZVxuICAgKlxuICAgKiBAcGFyYW0ge1ZlcnRleH0gc3RhcnRWZXJ0ZXhcbiAgICogQHBhcmFtIHtWZXJ0ZXh9IGVuZFZlcnRleFxuICAgKi9cbiAgY29uc3RydWN0b3IoIHN0YXJ0VmVydGV4LCBlbmRWZXJ0ZXggKSB7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggc3RhcnRWZXJ0ZXggaW5zdGFuY2VvZiBWZXJ0ZXggKTtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBlbmRWZXJ0ZXggaW5zdGFuY2VvZiBWZXJ0ZXggKTtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBzdGFydFZlcnRleCAhPT0gZW5kVmVydGV4LCAnU2hvdWxkIGJlIGRpZmZlcmVudCB2ZXJ0aWNlcycgKTtcblxuICAgIC8vIEBwdWJsaWMge1ZlcnRleH1cbiAgICB0aGlzLnN0YXJ0VmVydGV4ID0gc3RhcnRWZXJ0ZXg7XG4gICAgdGhpcy5lbmRWZXJ0ZXggPSBlbmRWZXJ0ZXg7XG5cbiAgICAvLyBAcHVibGljIHtBcnJheS48VHJpYW5nbGU+fSAtIEFkamFjZW50IHRyaWFuZ2xlcyB0byB0aGUgZWRnZVxuICAgIHRoaXMudHJpYW5nbGVzID0gW107XG5cbiAgICAvLyBAcHVibGljIHtFZGdlfG51bGx9IC0gTGlua2VkIGxpc3QgZm9yIHRoZSBmcm9udCBvZiB0aGUgc3dlZXAtbGluZSAob3IgaW4gdGhlIGJhY2sgZm9yIHRoZSBjb252ZXggaHVsbClcbiAgICB0aGlzLm5leHRFZGdlID0gbnVsbDtcbiAgICB0aGlzLnByZXZpb3VzRWRnZSA9IG51bGw7XG5cbiAgICAvLyBAcHVibGljIHtib29sZWFufSAtIENhbiBiZSBzZXQgdG8gbm90ZSB0aGF0IGl0IHdhcyBjb25zdHJhaW5lZFxuICAgIHRoaXMuaXNDb25zdHJhaW5lZCA9IGZhbHNlO1xuICB9XG5cblxuICAvKipcbiAgICogUmV0dXJucyB3aGV0aGVyIHRoaXMgaXMgYW4gYXJ0aWZpY2lhbCBlZGdlIChoYXMgYW4gYXJ0aWZpY2lhbCB2ZXJ0ZXgpXG4gICAqIEBwdWJsaWNcbiAgICpcbiAgICogQHJldHVybnMge2Jvb2xlYW59XG4gICAqL1xuICBpc0FydGlmaWNpYWwoKSB7XG4gICAgcmV0dXJuIHRoaXMuc3RhcnRWZXJ0ZXguaXNBcnRpZmljaWFsKCkgfHwgdGhpcy5lbmRWZXJ0ZXguaXNBcnRpZmljaWFsKCk7XG4gIH1cblxuICAvKipcbiAgICogQXBwZW5kcyB0aGUgZWRnZSB0byB0aGUgZW5kIG9mIHRoaXMgZWRnZSAoZm9yIG91ciBsaW5rZWQgbGlzdCkuXG4gICAqIEBwdWJsaWNcbiAgICpcbiAgICogQHBhcmFtIHtFZGdlfSBlZGdlXG4gICAqL1xuICBjb25uZWN0QWZ0ZXIoIGVkZ2UgKSB7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggZWRnZSBpbnN0YW5jZW9mIEVkZ2UgKTtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0aGlzLmVuZFZlcnRleCA9PT0gZWRnZS5zdGFydFZlcnRleCApO1xuXG4gICAgdGhpcy5uZXh0RWRnZSA9IGVkZ2U7XG4gICAgZWRnZS5wcmV2aW91c0VkZ2UgPSB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIEBwdWJsaWNcbiAgICovXG4gIGRpc2Nvbm5lY3RBZnRlcigpIHtcbiAgICB0aGlzLm5leHRFZGdlLnByZXZpb3VzRWRnZSA9IG51bGw7XG4gICAgdGhpcy5uZXh0RWRnZSA9IG51bGw7XG4gIH1cblxuICAvKipcbiAgICogQWRkcyBhbiBhZGphY2VudCB0cmlhbmdsZS5cbiAgICogQHB1YmxpY1xuICAgKlxuICAgKiBAcGFyYW0ge1RyaWFuZ2xlfSB0cmlhbmdsZVxuICAgKi9cbiAgYWRkVHJpYW5nbGUoIHRyaWFuZ2xlICkge1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIHRyaWFuZ2xlIGluc3RhbmNlb2YgVHJpYW5nbGUgKTtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0aGlzLnRyaWFuZ2xlcy5sZW5ndGggPD0gMSApO1xuXG4gICAgdGhpcy50cmlhbmdsZXMucHVzaCggdHJpYW5nbGUgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZW1vdmVzIGFuIGFkamFjZW50IHRyaWFuZ2xlLlxuICAgKiBAcHVibGljXG4gICAqXG4gICAqIEBwYXJhbSB7VHJpYW5nbGV9IHRyaWFuZ2xlXG4gICAqL1xuICByZW1vdmVUcmlhbmdsZSggdHJpYW5nbGUgKSB7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdHJpYW5nbGUgaW5zdGFuY2VvZiBUcmlhbmdsZSApO1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIF8uaW5jbHVkZXMoIHRoaXMudHJpYW5nbGVzLCB0cmlhbmdsZSApICk7XG5cbiAgICBhcnJheVJlbW92ZSggdGhpcy50cmlhbmdsZXMsIHRyaWFuZ2xlICk7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgdHJpYW5nbGUgaW4gY29tbW9uIHdpdGggYm90aCBlZGdlcy5cbiAgICogQHB1YmxpY1xuICAgKlxuICAgKiBAcGFyYW0ge0VkZ2V9IG90aGVyRWRnZVxuICAgKiBAcmV0dXJucyB7VHJpYW5nbGV9XG4gICAqL1xuICBnZXRTaGFyZWRUcmlhbmdsZSggb3RoZXJFZGdlICkge1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIG90aGVyRWRnZSBpbnN0YW5jZW9mIEVkZ2UgKTtcblxuICAgIGZvciAoIGxldCBpID0gMDsgaSA8IHRoaXMudHJpYW5nbGVzLmxlbmd0aDsgaSsrICkge1xuICAgICAgY29uc3QgdHJpYW5nbGUgPSB0aGlzLnRyaWFuZ2xlc1sgaSBdO1xuICAgICAgZm9yICggbGV0IGogPSAwOyBqIDwgb3RoZXJFZGdlLnRyaWFuZ2xlcy5sZW5ndGg7IGorKyApIHtcbiAgICAgICAgaWYgKCBvdGhlckVkZ2UudHJpYW5nbGVzWyBqIF0gPT09IHRyaWFuZ2xlICkge1xuICAgICAgICAgIHJldHVybiB0cmlhbmdsZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICB0aHJvdyBuZXcgRXJyb3IoICdObyBjb21tb24gdHJpYW5nbGUnICk7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgdmVydGV4IGluIGNvbW1vbiB3aXRoIGJvdGggZWRnZXMuXG4gICAqIEBwdWJsaWNcbiAgICpcbiAgICogQHBhcmFtIHtFZGdlfSBvdGhlckVkZ2VcbiAgICogQHJldHVybnMge1ZlcnRleH1cbiAgICovXG4gIGdldFNoYXJlZFZlcnRleCggb3RoZXJFZGdlICkge1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIG90aGVyRWRnZSBpbnN0YW5jZW9mIEVkZ2UgKTtcblxuICAgIGlmICggdGhpcy5zdGFydFZlcnRleCA9PT0gb3RoZXJFZGdlLnN0YXJ0VmVydGV4IHx8IHRoaXMuc3RhcnRWZXJ0ZXggPT09IG90aGVyRWRnZS5lbmRWZXJ0ZXggKSB7XG4gICAgICByZXR1cm4gdGhpcy5zdGFydFZlcnRleDtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0aGlzLmVuZFZlcnRleCA9PT0gb3RoZXJFZGdlLnN0YXJ0VmVydGV4IHx8IHRoaXMuZW5kVmVydGV4ID09PSBvdGhlckVkZ2UuZW5kVmVydGV4ICk7XG4gICAgICByZXR1cm4gdGhpcy5lbmRWZXJ0ZXg7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIG90aGVyIHZlcnRleCBvZiB0aGUgZWRnZS5cbiAgICogQHB1YmxpY1xuICAgKlxuICAgKiBAcGFyYW0ge1ZlcnRleH0gdmVydGV4XG4gICAqIEByZXR1cm5zIHtWZXJ0ZXh9XG4gICAqL1xuICBnZXRPdGhlclZlcnRleCggdmVydGV4ICkge1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIHZlcnRleCBpbnN0YW5jZW9mIFZlcnRleCApO1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIHZlcnRleCA9PT0gdGhpcy5zdGFydFZlcnRleCB8fCB2ZXJ0ZXggPT09IHRoaXMuZW5kVmVydGV4ICk7XG5cbiAgICBpZiAoIHZlcnRleCA9PT0gdGhpcy5zdGFydFZlcnRleCApIHtcbiAgICAgIHJldHVybiB0aGlzLmVuZFZlcnRleDtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICByZXR1cm4gdGhpcy5zdGFydFZlcnRleDtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgb3RoZXIgdHJpYW5nbGUgYXNzb2NpYXRlZCB3aXRoIHRoaXMgZWRnZSAoaWYgdGhlcmUgYXJlIHR3bykuXG4gICAqIEBwdWJsaWNcbiAgICpcbiAgICogQHBhcmFtIHtUcmlhbmdsZX0gdHJpYW5nbGVcbiAgICogQHJldHVybnMge1RyaWFuZ2xlfVxuICAgKi9cbiAgZ2V0T3RoZXJUcmlhbmdsZSggdHJpYW5nbGUgKSB7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdHJpYW5nbGUgaW5zdGFuY2VvZiBUcmlhbmdsZSApO1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIHRoaXMudHJpYW5nbGVzLmxlbmd0aCA9PT0gMiApO1xuXG4gICAgaWYgKCB0aGlzLnRyaWFuZ2xlc1sgMCBdID09PSB0cmlhbmdsZSApIHtcbiAgICAgIHJldHVybiB0aGlzLnRyaWFuZ2xlc1sgMSBdO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIHJldHVybiB0aGlzLnRyaWFuZ2xlc1sgMCBdO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHdoZXRoZXIgdGhlIGxpbmUgc2VnbWVudCBkZWZpbmVkIGJldHdlZW4gdGhlIHZlcnRleCBhbmQgYm90dG9tVmVydGV4IGludGVyc2VjdCB0aGlzIGVkZ2UuXG4gICAqIEBwdWJsaWNcbiAgICpcbiAgICogQHBhcmFtIHtWZXJ0ZXh9IHZlcnRleFxuICAgKiBAcGFyYW0ge1ZlcnRleH0gYm90dG9tVmVydGV4XG4gICAqIEByZXR1cm5zIHtib29sZWFufVxuICAgKi9cbiAgaW50ZXJzZWN0c0NvbnN0cmFpbmVkRWRnZSggdmVydGV4LCBib3R0b21WZXJ0ZXggKSB7XG4gICAgcmV0dXJuIFV0aWxzLmxpbmVTZWdtZW50SW50ZXJzZWN0aW9uKCB2ZXJ0ZXgucG9pbnQueCwgdmVydGV4LnBvaW50LnksIGJvdHRvbVZlcnRleC5wb2ludC54LCBib3R0b21WZXJ0ZXgucG9pbnQueSxcbiAgICAgIHRoaXMuc3RhcnRWZXJ0ZXgucG9pbnQueCwgdGhpcy5zdGFydFZlcnRleC5wb2ludC55LFxuICAgICAgdGhpcy5lbmRWZXJ0ZXgucG9pbnQueCwgdGhpcy5lbmRWZXJ0ZXgucG9pbnQueSApO1xuICB9XG59XG5cbmNsYXNzIFRyaWFuZ2xlIHtcbiAgLyoqXG4gICAqIFRyaWFuZ2xlIGRlZmluZWQgYnkgdGhyZWUgdmVydGljZXMgKHdpdGggZWRnZXMpXG4gICAqIEBwcml2YXRlXG4gICAqXG4gICAqIEBwYXJhbSB7VmVydGV4fSBhVmVydGV4XG4gICAqIEBwYXJhbSB7VmVydGV4fSBiVmVydGV4XG4gICAqIEBwYXJhbSB7VmVydGV4fSBjVmVydGV4XG4gICAqIEBwYXJhbSB7RWRnZX0gYUVkZ2UgLSBFZGdlIG9wcG9zaXRlIHRoZSAnYScgdmVydGV4XG4gICAqIEBwYXJhbSB7RWRnZX0gYkVkZ2UgLSBFZGdlIG9wcG9zaXRlIHRoZSAnYicgdmVydGV4XG4gICAqIEBwYXJhbSB7RWRnZX0gY0VkZ2UgLSBFZGdlIG9wcG9zaXRlIHRoZSAnYycgdmVydGV4XG4gICAqL1xuICBjb25zdHJ1Y3RvciggYVZlcnRleCwgYlZlcnRleCwgY1ZlcnRleCwgYUVkZ2UsIGJFZGdlLCBjRWRnZSApIHtcbiAgICAvLyBUeXBlIGNoZWNrc1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIGFWZXJ0ZXggaW5zdGFuY2VvZiBWZXJ0ZXggKTtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBiVmVydGV4IGluc3RhbmNlb2YgVmVydGV4ICk7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggY1ZlcnRleCBpbnN0YW5jZW9mIFZlcnRleCApO1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIGFFZGdlIGluc3RhbmNlb2YgRWRnZSApO1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIGJFZGdlIGluc3RhbmNlb2YgRWRnZSApO1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIGNFZGdlIGluc3RhbmNlb2YgRWRnZSApO1xuXG4gICAgLy8gRW5zdXJlIGVhY2ggdmVydGV4IGlzIE5PVCBpbiB0aGUgb3Bwb3NpdGUgZWRnZVxuICAgIGFzc2VydCAmJiBhc3NlcnQoIGFWZXJ0ZXggIT09IGFFZGdlLnN0YXJ0VmVydGV4ICYmIGFWZXJ0ZXggIT09IGFFZGdlLmVuZFZlcnRleCwgJ1Nob3VsZCBiZSBhbiBvcHBvc2l0ZSBlZGdlJyApO1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIGJWZXJ0ZXggIT09IGJFZGdlLnN0YXJ0VmVydGV4ICYmIGJWZXJ0ZXggIT09IGJFZGdlLmVuZFZlcnRleCwgJ1Nob3VsZCBiZSBhbiBvcHBvc2l0ZSBlZGdlJyApO1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIGNWZXJ0ZXggIT09IGNFZGdlLnN0YXJ0VmVydGV4ICYmIGNWZXJ0ZXggIT09IGNFZGdlLmVuZFZlcnRleCwgJ1Nob3VsZCBiZSBhbiBvcHBvc2l0ZSBlZGdlJyApO1xuXG4gICAgLy8gRW5zdXJlIGVhY2ggdmVydGV4IElTIGluIGl0cyBhZGphY2VudCBlZGdlc1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIGFWZXJ0ZXggPT09IGJFZGdlLnN0YXJ0VmVydGV4IHx8IGFWZXJ0ZXggPT09IGJFZGdlLmVuZFZlcnRleCwgJ2FWZXJ0ZXggc2hvdWxkIGJlIGluIGJFZGdlJyApO1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIGFWZXJ0ZXggPT09IGNFZGdlLnN0YXJ0VmVydGV4IHx8IGFWZXJ0ZXggPT09IGNFZGdlLmVuZFZlcnRleCwgJ2FWZXJ0ZXggc2hvdWxkIGJlIGluIGNFZGdlJyApO1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIGJWZXJ0ZXggPT09IGFFZGdlLnN0YXJ0VmVydGV4IHx8IGJWZXJ0ZXggPT09IGFFZGdlLmVuZFZlcnRleCwgJ2JWZXJ0ZXggc2hvdWxkIGJlIGluIGFFZGdlJyApO1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIGJWZXJ0ZXggPT09IGNFZGdlLnN0YXJ0VmVydGV4IHx8IGJWZXJ0ZXggPT09IGNFZGdlLmVuZFZlcnRleCwgJ2JWZXJ0ZXggc2hvdWxkIGJlIGluIGNFZGdlJyApO1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIGNWZXJ0ZXggPT09IGFFZGdlLnN0YXJ0VmVydGV4IHx8IGNWZXJ0ZXggPT09IGFFZGdlLmVuZFZlcnRleCwgJ2NWZXJ0ZXggc2hvdWxkIGJlIGluIGFFZGdlJyApO1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIGNWZXJ0ZXggPT09IGJFZGdlLnN0YXJ0VmVydGV4IHx8IGNWZXJ0ZXggPT09IGJFZGdlLmVuZFZlcnRleCwgJ2NWZXJ0ZXggc2hvdWxkIGJlIGluIGJFZGdlJyApO1xuXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggVXRpbHMudHJpYW5nbGVBcmVhU2lnbmVkKCBhVmVydGV4LnBvaW50LCBiVmVydGV4LnBvaW50LCBjVmVydGV4LnBvaW50ICkgPiAwLFxuICAgICAgJ1Nob3VsZCBiZSBjb3VudGVyY2xvY2t3aXNlJyApO1xuXG4gICAgLy8gQHB1YmxpYyB7VmVydGV4fVxuICAgIHRoaXMuYVZlcnRleCA9IGFWZXJ0ZXg7XG4gICAgdGhpcy5iVmVydGV4ID0gYlZlcnRleDtcbiAgICB0aGlzLmNWZXJ0ZXggPSBjVmVydGV4O1xuXG4gICAgLy8gQHB1YmxpYyB7RWRnZX1cbiAgICB0aGlzLmFFZGdlID0gYUVkZ2U7XG4gICAgdGhpcy5iRWRnZSA9IGJFZGdlO1xuICAgIHRoaXMuY0VkZ2UgPSBjRWRnZTtcblxuICAgIHRoaXMuYUVkZ2UuYWRkVHJpYW5nbGUoIHRoaXMgKTtcbiAgICB0aGlzLmJFZGdlLmFkZFRyaWFuZ2xlKCB0aGlzICk7XG4gICAgdGhpcy5jRWRnZS5hZGRUcmlhbmdsZSggdGhpcyApO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgd2hldGhlciB0aGUgdmVydGV4IGlzIG9uZSBpbiB0aGUgdHJpYW5nbGUuXG4gICAqIEBwdWJsaWNcbiAgICpcbiAgICogQHBhcmFtIHtWZXJ0ZXh9IHZlcnRleFxuICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAgICovXG4gIGhhc1ZlcnRleCggdmVydGV4ICkge1xuICAgIHJldHVybiB0aGlzLmFWZXJ0ZXggPT09IHZlcnRleCB8fCB0aGlzLmJWZXJ0ZXggPT09IHZlcnRleCB8fCB0aGlzLmNWZXJ0ZXggPT09IHZlcnRleDtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSB2ZXJ0ZXggdGhhdCBpcyBvcHBvc2l0ZSBmcm9tIHRoZSBnaXZlbiBlZGdlLlxuICAgKiBAcHVibGljXG4gICAqXG4gICAqIEBwYXJhbSB7RWRnZX0gZWRnZVxuICAgKiBAcmV0dXJucyB7VmVydGV4fVxuICAgKi9cbiAgZ2V0VmVydGV4T3Bwb3NpdGVGcm9tRWRnZSggZWRnZSApIHtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBlZGdlIGluc3RhbmNlb2YgRWRnZSApO1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIGVkZ2UgPT09IHRoaXMuYUVkZ2UgfHwgZWRnZSA9PT0gdGhpcy5iRWRnZSB8fCBlZGdlID09PSB0aGlzLmNFZGdlLFxuICAgICAgJ1Nob3VsZCBiZSBhbiBlZGdlIHRoYXQgaXMgcGFydCBvZiB0aGlzIHRyaWFuZ2xlJyApO1xuXG4gICAgaWYgKCBlZGdlID09PSB0aGlzLmFFZGdlICkge1xuICAgICAgcmV0dXJuIHRoaXMuYVZlcnRleDtcbiAgICB9XG4gICAgZWxzZSBpZiAoIGVkZ2UgPT09IHRoaXMuYkVkZ2UgKSB7XG4gICAgICByZXR1cm4gdGhpcy5iVmVydGV4O1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIHJldHVybiB0aGlzLmNWZXJ0ZXg7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIGVkZ2UgdGhhdCBpcyBvcHBvc2l0ZSBmcm9tIHRoZSBnaXZlbiB2ZXJ0ZXguXG4gICAqIEBwdWJsaWNcbiAgICpcbiAgICogQHBhcmFtIHtWZXJ0ZXh9IHZlcnRleFxuICAgKiBAcmV0dXJucyB7RWRnZX1cbiAgICovXG4gIGdldEVkZ2VPcHBvc2l0ZUZyb21WZXJ0ZXgoIHZlcnRleCApIHtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB2ZXJ0ZXggaW5zdGFuY2VvZiBWZXJ0ZXggKTtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB2ZXJ0ZXggPT09IHRoaXMuYVZlcnRleCB8fCB2ZXJ0ZXggPT09IHRoaXMuYlZlcnRleCB8fCB2ZXJ0ZXggPT09IHRoaXMuY1ZlcnRleCxcbiAgICAgICdTaG91bGQgYmUgYSB2ZXJ0ZXggdGhhdCBpcyBwYXJ0IG9mIHRoaXMgdHJpYW5nbGUnICk7XG5cbiAgICBpZiAoIHZlcnRleCA9PT0gdGhpcy5hVmVydGV4ICkge1xuICAgICAgcmV0dXJuIHRoaXMuYUVkZ2U7XG4gICAgfVxuICAgIGVsc2UgaWYgKCB2ZXJ0ZXggPT09IHRoaXMuYlZlcnRleCApIHtcbiAgICAgIHJldHVybiB0aGlzLmJFZGdlO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIHJldHVybiB0aGlzLmNFZGdlO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSB2ZXJ0ZXggdGhhdCBpcyBqdXN0IGJlZm9yZSB0aGUgZ2l2ZW4gdmVydGV4IChpbiBjb3VudGVyY2xvY2t3aXNlIG9yZGVyKS5cbiAgICogQHB1YmxpY1xuICAgKlxuICAgKiBAcGFyYW0ge1ZlcnRleH0gdmVydGV4XG4gICAqIEByZXR1cm5zIHtWZXJ0ZXh9XG4gICAqL1xuICBnZXRWZXJ0ZXhCZWZvcmUoIHZlcnRleCApIHtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB2ZXJ0ZXggaW5zdGFuY2VvZiBWZXJ0ZXggKTtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB2ZXJ0ZXggPT09IHRoaXMuYVZlcnRleCB8fCB2ZXJ0ZXggPT09IHRoaXMuYlZlcnRleCB8fCB2ZXJ0ZXggPT09IHRoaXMuY1ZlcnRleCApO1xuXG4gICAgaWYgKCB2ZXJ0ZXggPT09IHRoaXMuYVZlcnRleCApIHtcbiAgICAgIHJldHVybiB0aGlzLmNWZXJ0ZXg7XG4gICAgfVxuICAgIGVsc2UgaWYgKCB2ZXJ0ZXggPT09IHRoaXMuYlZlcnRleCApIHtcbiAgICAgIHJldHVybiB0aGlzLmFWZXJ0ZXg7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgcmV0dXJuIHRoaXMuYlZlcnRleDtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgdmVydGV4IHRoYXQgaXMganVzdCBhZnRlciB0aGUgZ2l2ZW4gdmVydGV4IChpbiBjb3VudGVyY2xvY2t3aXNlIG9yZGVyKS5cbiAgICogQHB1YmxpY1xuICAgKlxuICAgKiBAcGFyYW0ge1ZlcnRleH0gdmVydGV4XG4gICAqIEByZXR1cm5zIHtWZXJ0ZXh9XG4gICAqL1xuICBnZXRWZXJ0ZXhBZnRlciggdmVydGV4ICkge1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIHZlcnRleCBpbnN0YW5jZW9mIFZlcnRleCApO1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIHZlcnRleCA9PT0gdGhpcy5hVmVydGV4IHx8IHZlcnRleCA9PT0gdGhpcy5iVmVydGV4IHx8IHZlcnRleCA9PT0gdGhpcy5jVmVydGV4ICk7XG5cbiAgICBpZiAoIHZlcnRleCA9PT0gdGhpcy5hVmVydGV4ICkge1xuICAgICAgcmV0dXJuIHRoaXMuYlZlcnRleDtcbiAgICB9XG4gICAgZWxzZSBpZiAoIHZlcnRleCA9PT0gdGhpcy5iVmVydGV4ICkge1xuICAgICAgcmV0dXJuIHRoaXMuY1ZlcnRleDtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICByZXR1cm4gdGhpcy5hVmVydGV4O1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBvbmUgbm9uLWFydGlmaWNpYWwgZWRnZSBpbiB0aGUgdHJpYW5nbGUgKGFzc3VtaW5nIGl0IGV4aXN0cykuXG4gICAqIEBwdWJsaWNcbiAgICpcbiAgICogQHJldHVybnMge0VkZ2V8bnVsbH1cbiAgICovXG4gIGdldE5vbkFydGlmaWNpYWxFZGdlKCkge1xuICAgIGFzc2VydCAmJiBhc3NlcnQoICggdGhpcy5hRWRnZS5pc0FydGlmaWNpYWwoKSAmJiB0aGlzLmJFZGdlLmlzQXJ0aWZpY2lhbCgpICYmICF0aGlzLmNFZGdlLmlzQXJ0aWZpY2lhbCgpICkgfHxcbiAgICAgICAgICAgICAgICAgICAgICAoIHRoaXMuYUVkZ2UuaXNBcnRpZmljaWFsKCkgJiYgIXRoaXMuYkVkZ2UuaXNBcnRpZmljaWFsKCkgJiYgdGhpcy5jRWRnZS5pc0FydGlmaWNpYWwoKSApIHx8XG4gICAgICAgICAgICAgICAgICAgICAgKCAhdGhpcy5hRWRnZS5pc0FydGlmaWNpYWwoKSAmJiB0aGlzLmJFZGdlLmlzQXJ0aWZpY2lhbCgpICYmIHRoaXMuY0VkZ2UuaXNBcnRpZmljaWFsKCkgKSB8fFxuICAgICAgICAgICAgICAgICAgICAgICggdGhpcy5hRWRnZS5pc0FydGlmaWNpYWwoKSAmJiB0aGlzLmJFZGdlLmlzQXJ0aWZpY2lhbCgpICYmIHRoaXMuY0VkZ2UuaXNBcnRpZmljaWFsKCkgKSxcbiAgICAgICdBdCBtb3N0IG9uZSBlZGdlIHNob3VsZCBiZSBub24tYXJ0aWZpY2lhbCcgKTtcblxuICAgIGlmICggIXRoaXMuYUVkZ2UuaXNBcnRpZmljaWFsKCkgKSB7XG4gICAgICByZXR1cm4gdGhpcy5hRWRnZTtcbiAgICB9XG4gICAgZWxzZSBpZiAoICF0aGlzLmJFZGdlLmlzQXJ0aWZpY2lhbCgpICkge1xuICAgICAgcmV0dXJuIHRoaXMuYkVkZ2U7XG4gICAgfVxuICAgIGVsc2UgaWYgKCAhdGhpcy5jRWRnZS5pc0FydGlmaWNpYWwoKSApIHtcbiAgICAgIHJldHVybiB0aGlzLmNFZGdlO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBuZXh0IGVkZ2UgKGNvdW50ZXJjbG9ja3dpc2UpLlxuICAgKiBAcHVibGljXG4gICAqXG4gICAqIEBwYXJhbSB7RWRnZX0gZWRnZVxuICAgKiBAcmV0dXJucyB7RWRnZX1cbiAgICovXG4gIGdldE5leHRFZGdlKCBlZGdlICkge1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIGVkZ2UgPT09IHRoaXMuYUVkZ2UgfHwgZWRnZSA9PT0gdGhpcy5iRWRnZSB8fCBlZGdlID09PSB0aGlzLmNFZGdlICk7XG5cbiAgICBpZiAoIHRoaXMuYUVkZ2UgPT09IGVkZ2UgKSB7XG4gICAgICByZXR1cm4gdGhpcy5iRWRnZTtcbiAgICB9XG4gICAgaWYgKCB0aGlzLmJFZGdlID09PSBlZGdlICkge1xuICAgICAgcmV0dXJuIHRoaXMuY0VkZ2U7XG4gICAgfVxuICAgIGlmICggdGhpcy5jRWRnZSA9PT0gZWRnZSApIHtcbiAgICAgIHJldHVybiB0aGlzLmFFZGdlO1xuICAgIH1cbiAgICB0aHJvdyBuZXcgRXJyb3IoICdpbGxlZ2FsIGVkZ2UnICk7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgcHJldmlvdXMgZWRnZSAoY2xvY2t3aXNlKS5cbiAgICogQHB1YmxpY1xuICAgKlxuICAgKiBAcGFyYW0ge0VkZ2V9IGVkZ2VcbiAgICogQHJldHVybnMge0VkZ2V9XG4gICAqL1xuICBnZXRQcmV2aW91c0VkZ2UoIGVkZ2UgKSB7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggZWRnZSA9PT0gdGhpcy5hRWRnZSB8fCBlZGdlID09PSB0aGlzLmJFZGdlIHx8IGVkZ2UgPT09IHRoaXMuY0VkZ2UgKTtcblxuICAgIGlmICggdGhpcy5hRWRnZSA9PT0gZWRnZSApIHtcbiAgICAgIHJldHVybiB0aGlzLmNFZGdlO1xuICAgIH1cbiAgICBpZiAoIHRoaXMuYkVkZ2UgPT09IGVkZ2UgKSB7XG4gICAgICByZXR1cm4gdGhpcy5hRWRnZTtcbiAgICB9XG4gICAgaWYgKCB0aGlzLmNFZGdlID09PSBlZGdlICkge1xuICAgICAgcmV0dXJuIHRoaXMuYkVkZ2U7XG4gICAgfVxuXG4gICAgdGhyb3cgbmV3IEVycm9yKCAnaWxsZWdhbCBlZGdlJyApO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgd2hldGhlciB0aGlzIGlzIGFuIGFydGlmaWNpYWwgdHJpYW5nbGUgKGhhcyBhbiBhcnRpZmljaWFsIHZlcnRleClcbiAgICogQHB1YmxpY1xuICAgKlxuICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAgICovXG4gIGlzQXJ0aWZpY2lhbCgpIHtcbiAgICByZXR1cm4gdGhpcy5hVmVydGV4LmlzQXJ0aWZpY2lhbCgpIHx8IHRoaXMuYlZlcnRleC5pc0FydGlmaWNpYWwoKSB8fCB0aGlzLmNWZXJ0ZXguaXNBcnRpZmljaWFsKCk7XG4gIH1cblxuICAvKipcbiAgICogQHB1YmxpY1xuICAgKi9cbiAgcmVtb3ZlKCkge1xuICAgIHRoaXMuYUVkZ2UucmVtb3ZlVHJpYW5nbGUoIHRoaXMgKTtcbiAgICB0aGlzLmJFZGdlLnJlbW92ZVRyaWFuZ2xlKCB0aGlzICk7XG4gICAgdGhpcy5jRWRnZS5yZW1vdmVUcmlhbmdsZSggdGhpcyApO1xuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IERlbGF1bmF5VHJpYW5ndWxhdGlvbjsiXSwibmFtZXMiOlsiYXJyYXlSZW1vdmUiLCJtZXJnZSIsIkJvdW5kczIiLCJkb3QiLCJVdGlscyIsIlZlY3RvcjIiLCJEZWxhdW5heVRyaWFuZ3VsYXRpb24iLCJzdGVwIiwidmVydGV4IiwicmVtYWluaW5nVmVydGljZXMiLCJzaGlmdCIsIngiLCJwb2ludCIsImZyb250RWRnZSIsImZpcnN0RnJvbnRFZGdlIiwiZW5kVmVydGV4IiwiZWRnZTEiLCJFZGdlIiwic3RhcnRWZXJ0ZXgiLCJlZGdlMiIsImNvbm5lY3RBZnRlciIsImVkZ2VzIiwicHVzaCIsInRyaWFuZ2xlcyIsIlRyaWFuZ2xlIiwicmVjb25uZWN0RnJvbnRFZGdlcyIsImxlZ2FsaXplRWRnZSIsImFkZEhhbGZQaUhldXJpc3RpYyIsImNvbnN0cmFpbkVkZ2VzIiwibGVmdE9sZEVkZ2UiLCJuZXh0RWRnZSIsInJpZ2h0T2xkRWRnZSIsImFzc2VydCIsIm1pZGRsZU9sZFZlcnRleCIsImxlZnRWZXJ0ZXgiLCJyaWdodFZlcnRleCIsImxlZnRFZGdlIiwicmlnaHRFZGdlIiwibWlkZGxlRWRnZSIsImZpbGxCb3JkZXJUcmlhbmdsZSIsImZpcnN0RWRnZSIsInNlY29uZEVkZ2UiLCJmaXJzdFNpZGVWZXJ0ZXgiLCJtaWRkbGVWZXJ0ZXgiLCJzZWNvbmRTaWRlVmVydGV4IiwiVmVydGV4IiwibmV3RWRnZSIsIm9sZFJpZ2h0RWRnZSIsIm9sZExlZnRFZGdlIiwibmV3UmlnaHRFZGdlIiwibmV3TGVmdEVkZ2UiLCJwcmV2aW91c0VkZ2UiLCJkaXNjb25uZWN0QWZ0ZXIiLCJyaWdodEZyb250RWRnZSIsImxlZnRGcm9udEVkZ2UiLCJ0cmlhbmdsZUFyZWFTaWduZWQiLCJtaW51cyIsImFuZ2xlQmV0d2VlbiIsIk1hdGgiLCJQSSIsImkiLCJjb25zdHJhaW5lZFZlcnRpY2VzIiwibGVuZ3RoIiwiYm90dG9tVmVydGV4IiwibGVmdEVkZ2VzIiwicmlnaHRFZGdlcyIsImN1cnJlbnRUcmlhbmdsZSIsImN1cnJlbnRFZGdlIiwidHJpYW5nbGVzVG9SZW1vdmUiLCJlZGdlc1RvUmVtb3ZlIiwib3V0c2lkZVJpZ2h0IiwidmVydGV4UHJvZHVjdCIsIm91dHNpZGVMZWZ0IiwibGFzdFZlcnRleCIsIm5leHRWZXJ0ZXgiLCJnZXRFZGdlT3Bwb3NpdGVGcm9tVmVydGV4IiwiZ2V0T3RoZXJWZXJ0ZXgiLCJnZXRPdGhlclRyaWFuZ2xlIiwiaGFzVmVydGV4IiwibmV4dFRyaWFuZ2xlIiwiZ2V0TmV4dEVkZ2UiLCJnZXRQcmV2aW91c0VkZ2UiLCJhRWRnZSIsImludGVyc2VjdHNDb25zdHJhaW5lZEVkZ2UiLCJiRWRnZSIsImNFZGdlIiwiaiIsInRyaWFuZ2xlVG9SZW1vdmUiLCJyZW1vdmUiLCJjb25zdHJhaW50RWRnZSIsImlzQ29uc3RyYWluZWQiLCJyZXZlcnNlIiwid2luZG93IiwidHJpRGVidWciLCJ0cmlhbmd1bGF0ZVBvbHlnb24iLCJrIiwia3giLCJnZXRTaGFyZWRWZXJ0ZXgiLCJpeCIsImVkZ2UiLCJzaGFyZWRWZXJ0ZXgiLCJlbmREZWx0YSIsInN0YXJ0RGVsdGEiLCJlbmRNYWduaXR1ZGVTcXVhcmVkIiwic3RhcnRFbmRQcm9kdWN0Iiwic3RhcnRNYWduaXR1ZGVTcXVhcmVkIiwiaGFzSW50ZXJpb3JWZXJ0ZXgiLCJwb2ludERlbHRhIiwicG9pbnRFbmRQcm9kdWN0IiwicG9pbnRTdGFydFByb2R1Y3QiLCJ1IiwidiIsInNwbGljZSIsImZpbmFsaXplIiwiZnJvbnRFZGdlcyIsImxhc3RGcm9udEVkZ2UiLCJtYXgiLCJiYWNrRWRnZXMiLCJhcnRpZmljaWFsRWRnZXMiLCJjdXJyZW50U3BsaXRFZGdlIiwiZ2V0Tm9uQXJ0aWZpY2lhbEVkZ2UiLCJhcnRpZmljaWFsTWF4VmVydGV4IiwiZmlyc3RWZXJ0ZXgiLCJzZWNvbmRWZXJ0ZXgiLCJjb252ZXhIdWxsIiwiXyIsImluY2x1ZGVzIiwidHJpYW5nbGUxIiwidHJpYW5nbGUyIiwiZmFyVmVydGV4MSIsImdldFZlcnRleE9wcG9zaXRlRnJvbUVkZ2UiLCJmYXJWZXJ0ZXgyIiwicG9pbnRJbkNpcmNsZUZyb21Qb2ludHMiLCJhVmVydGV4IiwiYlZlcnRleCIsImNWZXJ0ZXgiLCJ0cmlhbmdsZTFFZGdlMSIsImdldFZlcnRleEJlZm9yZSIsInRyaWFuZ2xlMUVkZ2UyIiwiZ2V0VmVydGV4QWZ0ZXIiLCJ0cmlhbmdsZTJFZGdlMSIsInRyaWFuZ2xlMkVkZ2UyIiwidmVydGV4Q29tcGFyaXNvbiIsImEiLCJiIiwieSIsImFEaWZmIiwiYkRpZmYiLCJjcm9zc1NjYWxhciIsImNvbnN0cnVjdG9yIiwicG9pbnRzIiwiY29uc3RyYWludHMiLCJvcHRpb25zIiwidmVydGljZXMiLCJtYXAiLCJpbmRleCIsImlzRmluaXRlIiwiY29uc3RyYWludCIsImZpcnN0SW5kZXgiLCJzZWNvbmRJbmRleCIsInNvcnQiLCJzb3J0ZWRJbmRleCIsIm90aGVyVmVydGV4Iiwic2xpY2UiLCJib3VuZHMiLCJOT1RISU5HIiwiY29weSIsImFkZFBvaW50IiwiYWxwaGEiLCJhcnRpZmljaWFsTWluVmVydGV4IiwibWluWCIsIndpZHRoIiwibWluWSIsImhlaWdodCIsIm1heFgiLCJmaXJzdEh1bGxFZGdlIiwicmVnaXN0ZXIiLCJpc0FydGlmaWNpYWwiLCJhZGRUcmlhbmdsZSIsInRyaWFuZ2xlIiwicmVtb3ZlVHJpYW5nbGUiLCJnZXRTaGFyZWRUcmlhbmdsZSIsIm90aGVyRWRnZSIsIkVycm9yIiwibGluZVNlZ21lbnRJbnRlcnNlY3Rpb24iXSwibWFwcGluZ3MiOiJBQUFBLHNEQUFzRDtBQUV0RDs7Ozs7Ozs7Ozs7Q0FXQyxHQUVELE9BQU9BLGlCQUFpQixvQ0FBb0M7QUFDNUQsT0FBT0MsV0FBVyw4QkFBOEI7QUFDaEQsT0FBT0MsYUFBYSxlQUFlO0FBQ25DLE9BQU9DLFNBQVMsV0FBVztBQUMzQixPQUFPQyxXQUFXLGFBQWE7QUFDL0IsT0FBT0MsYUFBYSxlQUFlO0FBRW5DLElBQUEsQUFBTUMsd0JBQU4sTUFBTUE7SUFxR0o7OztHQUdDLEdBQ0RDLE9BQU87UUFDTCxtRkFBbUY7UUFDbkYsTUFBTUMsU0FBUyxJQUFJLENBQUNDLGlCQUFpQixDQUFDQyxLQUFLO1FBRTNDLE1BQU1DLElBQUlILE9BQU9JLEtBQUssQ0FBQ0QsQ0FBQztRQUV4QixJQUFJRSxZQUFZLElBQUksQ0FBQ0MsY0FBYztRQUNuQyxNQUFRRCxVQUFZO1lBQ2xCLHVFQUF1RTtZQUN2RSxJ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