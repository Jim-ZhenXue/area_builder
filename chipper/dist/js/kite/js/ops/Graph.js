// Copyright 2017-2024, University of Colorado Boulder
/**
 * A multigraph whose edges are segments.
 *
 * Supports general shape simplification, overlap/intersection removal and computation. General output would include
 * Shapes (from CAG - Constructive Area Geometry) and triangulations.
 *
 * See Graph.binaryResult for the general procedure for CAG.
 *
 * TODO: Use https://github.com/mauriciosantos/Buckets-JS for priority queue, implement simple sweep line https://github.com/phetsims/kite/issues/76
 *       with "enters" and "leaves" entries in the queue. When edge removed, remove "leave" from queue.
 *       and add any replacement edges. Applies to overlap and intersection handling.
 *       NOTE: This should impact performance a lot, as we are currently over-scanning and re-scanning a lot.
 *       Intersection is currently (by far?) the performance bottleneck.
 * TODO: Collapse non-Line adjacent edges together. Similar logic to overlap for each segment time, hopefully can
 *       factor this out.
 * TODO: Properly handle sorting edges around a vertex when two edges have the same tangent out. We'll need to use
 *       curvature, or do tricks to follow both curves by an 'epsilon' and sort based on that.
 * TODO: Consider separating out epsilon values (may be a general Kite thing rather than just ops)
 * TODO: Loop-Blinn output and constrained Delaunay triangulation
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ import Bounds2 from '../../../dot/js/Bounds2.js';
import Matrix3 from '../../../dot/js/Matrix3.js';
import Transform3 from '../../../dot/js/Transform3.js';
import Utils from '../../../dot/js/Utils.js';
import Vector2 from '../../../dot/js/Vector2.js';
import arrayRemove from '../../../phet-core/js/arrayRemove.js';
import cleanArray from '../../../phet-core/js/cleanArray.js';
import merge from '../../../phet-core/js/merge.js';
import { Arc, Boundary, Cubic, Edge, EdgeSegmentTree, EllipticalArc, Face, kite, Line, Loop, Segment, Subpath, Vertex, VertexSegmentTree } from '../imports.js';
let bridgeId = 0;
let globalId = 0;
const VERTEX_COLLAPSE_THRESHOLD_DISTANCE = 1e-5;
const INTERSECTION_ENDPOINT_THRESHOLD_DISTANCE = 0.1 * VERTEX_COLLAPSE_THRESHOLD_DISTANCE;
const SPLIT_ENDPOINT_THRESHOLD_DISTANCE = 0.01 * VERTEX_COLLAPSE_THRESHOLD_DISTANCE;
const T_THRESHOLD = 1e-6;
let Graph = class Graph {
    /**
   * Returns an object form that can be turned back into a segment with the corresponding deserialize method.
   * @public
   *
   * @returns {Object}
   */ serialize() {
        return {
            type: 'Graph',
            vertices: this.vertices.map((vertex)=>vertex.serialize()),
            edges: this.edges.map((edge)=>edge.serialize()),
            boundaries: this.boundaries.map((boundary)=>boundary.serialize()),
            innerBoundaries: this.innerBoundaries.map((boundary)=>boundary.id),
            outerBoundaries: this.outerBoundaries.map((boundary)=>boundary.id),
            shapeIds: this.shapeIds,
            loops: this.loops.map((loop)=>loop.serialize()),
            unboundedFace: this.unboundedFace.id,
            faces: this.faces.map((face)=>face.serialize())
        };
    }
    /**
   * Recreate a Graph based on serialized state from serialize()
   * @public
   *
   * @param {Object} obj
   */ static deserialize(obj) {
        const graph = new Graph();
        const vertexMap = {};
        const edgeMap = {};
        const halfEdgeMap = {};
        const boundaryMap = {};
        const loopMap = {};
        const faceMap = {};
        graph.vertices = obj.vertices.map((data)=>{
            const vertex = new Vertex(Vector2.Vector2IO.fromStateObject(data.point));
            vertexMap[data.id] = vertex;
            // incidentHalfEdges connected below
            vertex.visited = data.visited;
            vertex.visitIndex = data.visitIndex;
            vertex.lowIndex = data.lowIndex;
            return vertex;
        });
        graph.edges = obj.edges.map((data)=>{
            const edge = new Edge(Segment.deserialize(data.segment), vertexMap[data.startVertex], vertexMap[data.endVertex]);
            edgeMap[data.id] = edge;
            edge.signedAreaFragment = data.signedAreaFragment;
            const deserializeHalfEdge = (halfEdge, halfEdgeData)=>{
                halfEdgeMap[halfEdgeData.id] = halfEdge;
                // face connected later
                halfEdge.isReversed = halfEdgeData.isReversed;
                halfEdge.signedAreaFragment = halfEdgeData.signedAreaFragment;
                halfEdge.startVertex = vertexMap[halfEdgeData.startVertex.id];
                halfEdge.endVertex = vertexMap[halfEdgeData.endVertex.id];
                halfEdge.sortVector = Vector2.Vector2IO.fromStateObject(halfEdgeData.sortVector);
                halfEdge.data = halfEdgeData.data;
            };
            deserializeHalfEdge(edge.forwardHalf, data.forwardHalf);
            deserializeHalfEdge(edge.reversedHalf, data.reversedHalf);
            edge.visited = data.visited;
            edge.data = data.data;
            return edge;
        });
        // Connect Vertex incidentHalfEdges
        obj.vertices.forEach((data, i)=>{
            const vertex = graph.vertices[i];
            vertex.incidentHalfEdges = data.incidentHalfEdges.map((id)=>halfEdgeMap[id]);
        });
        graph.boundaries = obj.boundaries.map((data)=>{
            const boundary = Boundary.pool.create(data.halfEdges.map((id)=>halfEdgeMap[id]));
            boundaryMap[data.id] = boundary;
            boundary.signedArea = data.signedArea;
            boundary.bounds = Bounds2.Bounds2IO.fromStateObject(data.bounds);
            // childBoundaries handled below
            return boundary;
        });
        obj.boundaries.forEach((data, i)=>{
            const boundary = graph.boundaries[i];
            boundary.childBoundaries = data.childBoundaries.map((id)=>boundaryMap[id]);
        });
        graph.innerBoundaries = obj.innerBoundaries.map((id)=>boundaryMap[id]);
        graph.outerBoundaries = obj.outerBoundaries.map((id)=>boundaryMap[id]);
        graph.shapeIds = obj.shapeIds;
        graph.loops = obj.loops.map((data)=>{
            const loop = new Loop(data.shapeId, data.closed);
            loopMap[data.id] = loop;
            loop.halfEdges = data.halfEdges.map((id)=>halfEdgeMap[id]);
            return loop;
        });
        graph.faces = obj.faces.map((data, i)=>{
            const face = i === 0 ? graph.unboundedFace : new Face(boundaryMap[data.boundary]);
            faceMap[data.id] = face;
            face.holes = data.holes.map((id)=>boundaryMap[id]);
            face.windingMap = data.windingMap;
            face.filled = data.filled;
            return face;
        });
        // Connected faces to halfEdges
        obj.edges.forEach((data, i)=>{
            const edge = graph.edges[i];
            edge.forwardHalf.face = data.forwardHalf.face === null ? null : faceMap[data.forwardHalf.face];
            edge.reversedHalf.face = data.reversedHalf.face === null ? null : faceMap[data.reversedHalf.face];
        });
        return graph;
    }
    /**
   * Adds a Shape (with a given ID for CAG purposes) to the graph.
   * @public
   *
   * @param {number} shapeId - The ID which should be shared for all paths/shapes that should be combined with
   *                           respect to the winding number of faces. For CAG, independent shapes should be given
   *                           different IDs (so they have separate winding numbers recorded).
   * @param {Shape} shape
   * @param {Object} [options] - See addSubpath
   */ addShape(shapeId, shape, options) {
        for(let i = 0; i < shape.subpaths.length; i++){
            this.addSubpath(shapeId, shape.subpaths[i], options);
        }
    }
    /**
   * Adds a subpath of a Shape (with a given ID for CAG purposes) to the graph.
   * @public
   *
   * @param {number} shapeId - See addShape() documentation
   * @param {Subpath} subpath
   * @param {Object} [options]
   */ addSubpath(shapeId, subpath, options) {
        assert && assert(typeof shapeId === 'number');
        assert && assert(subpath instanceof Subpath);
        options = merge({
            ensureClosed: true
        }, options);
        // Ensure the shapeId is recorded
        if (this.shapeIds.indexOf(shapeId) < 0) {
            this.shapeIds.push(shapeId);
        }
        if (subpath.segments.length === 0) {
            return;
        }
        const closed = subpath.closed || options.ensureClosed;
        const segments = options.ensureClosed ? subpath.getFillSegments() : subpath.segments;
        let index;
        // Collects all of the vertices
        const vertices = [];
        for(index = 0; index < segments.length; index++){
            let previousIndex = index - 1;
            if (previousIndex < 0) {
                previousIndex = segments.length - 1;
            }
            // Get the end of the previous segment and start of the next. Generally they should be equal or almost equal,
            // as it's the point at the joint of two segments.
            let end = segments[previousIndex].end;
            const start = segments[index].start;
            // If we are creating an open "loop", don't interpolate the start/end of the entire subpath together.
            if (!closed && index === 0) {
                end = start;
            }
            // If they are exactly equal, don't take a chance on floating-point arithmetic
            if (start.equals(end)) {
                vertices.push(Vertex.pool.create(start));
            } else {
                assert && assert(start.distance(end) < 1e-5, 'Inaccurate start/end points');
                vertices.push(Vertex.pool.create(start.average(end)));
            }
        }
        if (!closed) {
            // If we aren't closed, create an "end" vertex since it may be different from the "start"
            vertices.push(Vertex.pool.create(segments[segments.length - 1].end));
        }
        // Create the loop object from the vertices, filling in edges
        const loop = Loop.pool.create(shapeId, closed);
        for(index = 0; index < segments.length; index++){
            let nextIndex = index + 1;
            if (closed && nextIndex === segments.length) {
                nextIndex = 0;
            }
            const edge = Edge.pool.create(segments[index], vertices[index], vertices[nextIndex]);
            loop.halfEdges.push(edge.forwardHalf);
            this.addEdge(edge);
        }
        this.loops.push(loop);
        this.vertices.push(...vertices);
    }
    /**
   * Simplifies edges/vertices, computes boundaries and faces (with the winding map).
   * @public
   */ computeSimplifiedFaces() {
        // Before we find any intersections (self-intersection or between edges), we'll want to identify and fix up
        // any cases where there are an infinite number of intersections between edges (they are continuously
        // overlapping). For any overlap, we'll split it into one "overlap" edge and any remaining edges. After this
        // process, there should be no continuous overlaps.
        this.eliminateOverlap();
        // Detects any edge self-intersection, and splits it into multiple edges. This currently happens with cubics only,
        // but needs to be done before we intersect those cubics with any other edges.
        this.eliminateSelfIntersection();
        // Find inter-edge intersections (that aren't at endpoints). Splits edges involved into the intersection. After
        // this pass, we should have a well-defined graph where in the planar embedding edges don't intersect or overlap.
        this.eliminateIntersection();
        // From the above process (and input), we may have multiple vertices that occupy essentially the same location.
        // These vertices get combined into one vertex in the location. If there was a mostly-degenerate edge that was
        // very small between edges, it will be removed.
        this.collapseVertices();
        // Our graph can end up with edges that would have the same face on both sides (are considered a "bridge" edge).
        // These need to be removed, so that our face handling logic doesn't have to handle another class of cases.
        this.removeBridges();
        // Vertices can be left over where they have less than 2 incident edges, and they can be safely removed (since
        // they won't contribute to the area output).
        this.removeLowOrderVertices();
        // // TODO: Why does this resolve some things? It seems like it should be unnecessary. https://github.com/phetsims/kite/issues/98
        // this.eliminateIntersection();
        // this.collapseVertices();
        // this.removeBridges();
        // this.removeLowOrderVertices();
        // Now that the graph has well-defined vertices and edges (2-edge-connected, nonoverlapping), we'll want to know
        // the order of edges around a vertex (if you rotate around a vertex, what edges are in what order?).
        this.orderVertexEdges();
        // Extracts boundaries and faces, by following each half-edge counter-clockwise, and faces are created for
        // boundaries that have positive signed area.
        this.extractFaces();
        // We need to determine which boundaries are holes for each face. This creates a "boundary tree" where the nodes
        // are boundaries. All connected components should be one face and its holes. The holes get stored on the
        // respective face.
        this.computeBoundaryTree();
        // Compute the winding numbers of each face for each shapeId, to determine whether the input would have that
        // face "filled". It should then be ready for future processing.
        this.computeWindingMap();
    }
    /**
   * Sets whether each face should be filled or unfilled based on a filter function.
   * @public
   *
   * The windingMapFilter will be called on each face's winding map, and will use the return value as whether the face
   * is filled or not.
   *
   * The winding map is an {Object} associated with each face that has a key for every shapeId that was used in
   * addShape/addSubpath, and the value for those keys is the winding number of the face given all paths with the
   * shapeId.
   *
   * For example, imagine you added two shapeIds (0 and 1), and the iteration is on a face that is included in
   * one loop specified with shapeId:0 (inside a counter-clockwise curve), and is outside of any segments specified
   * by the second loop (shapeId:1). Then the winding map will be:
   * {
   *   0: 1 // shapeId:0 has a winding number of 1 for this face (generally filled)
   *   1: 0 // shapeId:1 has a winding number of 0 for this face (generally not filled)
   * }
   *
   * Generally, winding map filters can be broken down into two steps:
   * 1. Given the winding number for each shapeId, compute whether that loop was originally filled. Normally, this is
   *    done with a non-zero rule (any winding number is filled, except zero). SVG also provides an even-odd rule
   *    (odd numbers are filled, even numbers are unfilled).
   * 2. Given booleans for each shapeId from step 1, compute CAG operations based on boolean formulas. Say you wanted
   *    to take the union of shapeIds 0 and 1, then remove anything in shapeId 2. Given the booleans above, this can
   *    be directly computed as (filled0 || filled1) && !filled2.
   *
   * @param {function} windingMapFilter
   */ computeFaceInclusion(windingMapFilter) {
        for(let i = 0; i < this.faces.length; i++){
            const face = this.faces[i];
            face.filled = windingMapFilter(face.windingMap);
        }
    }
    /**
   * Create a new Graph object based only on edges in this graph that separate a "filled" face from an "unfilled"
   * face.
   * @public
   *
   * This is a convenient way to "collapse" adjacent filled and unfilled faces together, and compute the curves and
   * holes properly, given a filled "normal" graph.
   */ createFilledSubGraph() {
        const graph = new Graph();
        const vertexMap = {}; // old id => newVertex
        for(let i = 0; i < this.edges.length; i++){
            const edge = this.edges[i];
            if (edge.forwardHalf.face.filled !== edge.reversedHalf.face.filled) {
                if (!vertexMap[edge.startVertex.id]) {
                    const newStartVertex = Vertex.pool.create(edge.startVertex.point);
                    graph.vertices.push(newStartVertex);
                    vertexMap[edge.startVertex.id] = newStartVertex;
                }
                if (!vertexMap[edge.endVertex.id]) {
                    const newEndVertex = Vertex.pool.create(edge.endVertex.point);
                    graph.vertices.push(newEndVertex);
                    vertexMap[edge.endVertex.id] = newEndVertex;
                }
                const startVertex = vertexMap[edge.startVertex.id];
                const endVertex = vertexMap[edge.endVertex.id];
                graph.addEdge(Edge.pool.create(edge.segment, startVertex, endVertex));
            }
        }
        // Run some more "simplified" processing on this graph to determine which faces are filled (after simplification).
        // We don't need the intersection or other processing steps, since this was accomplished (presumably) already
        // for the given graph.
        graph.collapseAdjacentEdges();
        graph.orderVertexEdges();
        graph.extractFaces();
        graph.computeBoundaryTree();
        graph.fillAlternatingFaces();
        return graph;
    }
    /**
   * Returns a Shape that creates a subpath for each filled face (with the desired holes).
   * @public
   *
   * Generally should be called on a graph created with createFilledSubGraph().
   *
   * @returns {Shape}
   */ facesToShape() {
        const subpaths = [];
        for(let i = 0; i < this.faces.length; i++){
            const face = this.faces[i];
            if (face.filled) {
                subpaths.push(face.boundary.toSubpath());
                for(let j = 0; j < face.holes.length; j++){
                    subpaths.push(face.holes[j].toSubpath());
                }
            }
        }
        return new kite.Shape(subpaths);
    }
    /**
   * Releases owned objects to their pools, and clears references that may have been picked up from external sources.
   * @public
   */ dispose() {
        // this.boundaries should contain all elements of innerBoundaries and outerBoundaries
        while(this.boundaries.length){
            this.boundaries.pop().dispose();
        }
        cleanArray(this.innerBoundaries);
        cleanArray(this.outerBoundaries);
        while(this.loops.length){
            this.loops.pop().dispose();
        }
        while(this.faces.length){
            this.faces.pop().dispose();
        }
        while(this.vertices.length){
            this.vertices.pop().dispose();
        }
        while(this.edges.length){
            this.edges.pop().dispose();
        }
    }
    /**
   * Adds an edge to the graph (and sets up connection information).
   * @private
   *
   * @param {Edge} edge
   */ addEdge(edge) {
        assert && assert(edge instanceof Edge);
        assert && assert(!_.includes(edge.startVertex.incidentHalfEdges, edge.reversedHalf), 'Should not already be connected');
        assert && assert(!_.includes(edge.endVertex.incidentHalfEdges, edge.forwardHalf), 'Should not already be connected');
        this.edges.push(edge);
        edge.startVertex.incidentHalfEdges.push(edge.reversedHalf);
        edge.endVertex.incidentHalfEdges.push(edge.forwardHalf);
    }
    /**
   * Removes an edge from the graph (and disconnects incident information).
   * @private
   *
   * @param {Edge} edge
   */ removeEdge(edge) {
        assert && assert(edge instanceof Edge);
        arrayRemove(this.edges, edge);
        arrayRemove(edge.startVertex.incidentHalfEdges, edge.reversedHalf);
        arrayRemove(edge.endVertex.incidentHalfEdges, edge.forwardHalf);
    }
    /**
   * Replaces a single edge (in loops) with a series of edges (possibly empty).
   * @private
   *
   * @param {Edge} edge
   * @param {Array.<HalfEdge>} forwardHalfEdges
   */ replaceEdgeInLoops(edge, forwardHalfEdges) {
        // Compute reversed half-edges
        const reversedHalfEdges = [];
        for(let i = 0; i < forwardHalfEdges.length; i++){
            reversedHalfEdges.push(forwardHalfEdges[forwardHalfEdges.length - 1 - i].getReversed());
        }
        for(let i = 0; i < this.loops.length; i++){
            const loop = this.loops[i];
            for(let j = loop.halfEdges.length - 1; j >= 0; j--){
                const halfEdge = loop.halfEdges[j];
                if (halfEdge.edge === edge) {
                    const replacementHalfEdges = halfEdge === edge.forwardHalf ? forwardHalfEdges : reversedHalfEdges;
                    Array.prototype.splice.apply(loop.halfEdges, [
                        j,
                        1
                    ].concat(replacementHalfEdges));
                }
            }
        }
    }
    /**
   * Tries to combine adjacent edges (with a 2-order vertex) into one edge where possible.
   * @private
   *
   * This helps to combine things like collinear lines, where there's a vertex that can basically be removed.
   */ collapseAdjacentEdges() {
        let needsLoop = true;
        while(needsLoop){
            needsLoop = false;
            for(let i = 0; i < this.vertices.length; i++){
                const vertex = this.vertices[i];
                if (vertex.incidentHalfEdges.length === 2) {
                    const aEdge = vertex.incidentHalfEdges[0].edge;
                    const bEdge = vertex.incidentHalfEdges[1].edge;
                    let aSegment = aEdge.segment;
                    let bSegment = bEdge.segment;
                    const aVertex = aEdge.getOtherVertex(vertex);
                    const bVertex = bEdge.getOtherVertex(vertex);
                    assert && assert(this.loops.length === 0);
                    // TODO: Can we avoid this in the inner loop? https://github.com/phetsims/kite/issues/76
                    if (aEdge.startVertex === vertex) {
                        aSegment = aSegment.reversed();
                    }
                    if (bEdge.endVertex === vertex) {
                        bSegment = bSegment.reversed();
                    }
                    if (aSegment instanceof Line && bSegment instanceof Line) {
                        // See if the lines are collinear, so that we can combine them into one edge
                        if (aSegment.tangentAt(0).normalized().distance(bSegment.tangentAt(0).normalized()) < 1e-6) {
                            this.removeEdge(aEdge);
                            this.removeEdge(bEdge);
                            aEdge.dispose();
                            bEdge.dispose();
                            arrayRemove(this.vertices, vertex);
                            vertex.dispose();
                            const newSegment = new Line(aVertex.point, bVertex.point);
                            this.addEdge(new Edge(newSegment, aVertex, bVertex));
                            needsLoop = true;
                            break;
                        }
                    }
                }
            }
        }
    }
    /**
   * Gets rid of overlapping segments by combining overlaps into a shared edge.
   * @private
   */ eliminateOverlap() {
        // We'll expand bounds by this amount, so that "adjacent" bounds (with a potentially overlapping vertical or
        // horizontal line) will have a non-zero amount of area overlapping.
        const epsilon = 1e-4;
        // Our queue will store entries of { start: boolean, edge: Edge }, representing a sweep line similar to the
        // Bentley-Ottmann approach. We'll track which edges are passing through the sweep line.
        const queue = new window.FlatQueue();
        // Tracks which edges are through the sweep line, but in a graph structure like a segment/interval tree, so that we
        // can have fast lookup (what edges are in a certain range) and also fast inserts/removals.
        const segmentTree = new EdgeSegmentTree(epsilon);
        // Assorted operations use a shortcut to "tag" edges with a unique ID, to indicate it has already been processed
        // for this call of eliminateOverlap(). This is a higher-performance option to storing an array of "already
        // processed" edges.
        const nextId = globalId++;
        // Adds an edge to the queue
        const addToQueue = (edge)=>{
            const bounds = edge.segment.bounds;
            // TODO: see if object allocations are slow here https://github.com/phetsims/kite/issues/76
            queue.push({
                start: true,
                edge: edge
            }, bounds.minY - epsilon);
            queue.push({
                start: false,
                edge: edge
            }, bounds.maxY + epsilon);
        };
        // Removes an edge from the queue (effectively... when we pop from the queue, we'll check its ID data, and if it was
        // "removed" we will ignore it. Higher-performance than using an array.
        const removeFromQueue = (edge)=>{
            // Store the ID so we can have a high-performance removal
            edge.internalData.removedId = nextId;
        };
        for(let i = 0; i < this.edges.length; i++){
            addToQueue(this.edges[i]);
        }
        // We track edges to dispose separately, instead of synchronously disposing them. This is mainly due to the trick of
        // removal IDs, since if we re-used pooled Edges when creating, they would still have the ID OR they would lose the
        // "removed" information.
        const edgesToDispose = [];
        while(queue.length){
            const entry = queue.pop();
            const edge = entry.edge;
            // Skip edges we already removed
            if (edge.internalData.removedId === nextId) {
                continue;
            }
            if (entry.start) {
                // We'll bail out of the loop if we find overlaps, and we'll store the relevant information in these
                let found = false;
                let overlappedEdge;
                let addedEdges;
                // TODO: Is this closure killing performance? https://github.com/phetsims/kite/issues/76
                segmentTree.query(edge, (otherEdge)=>{
                    const overlaps = edge.segment.getOverlaps(otherEdge.segment);
                    if (overlaps !== null && overlaps.length) {
                        for(let k = 0; k < overlaps.length; k++){
                            const overlap = overlaps[k];
                            if (Math.abs(overlap.t1 - overlap.t0) > 1e-5 && Math.abs(overlap.qt1 - overlap.qt0) > 1e-5) {
                                addedEdges = this.splitOverlap(edge, otherEdge, overlap);
                                found = true;
                                overlappedEdge = otherEdge;
                                return true;
                            }
                        }
                    }
                    return false;
                });
                if (found) {
                    // We haven't added our edge yet, so no need to remove it.
                    segmentTree.removeItem(overlappedEdge);
                    // Adjust the queue
                    removeFromQueue(overlappedEdge);
                    removeFromQueue(edge);
                    for(let i = 0; i < addedEdges.length; i++){
                        addToQueue(addedEdges[i]);
                    }
                    edgesToDispose.push(edge);
                    edgesToDispose.push(overlappedEdge);
                } else {
                    // No overlaps found, add it and continue
                    segmentTree.addItem(edge);
                }
            } else {
                // Removal can't trigger an intersection, so we can safely remove it
                segmentTree.removeItem(edge);
            }
        }
        for(let i = 0; i < edgesToDispose.length; i++){
            edgesToDispose[i].dispose();
        }
    }
    /**
   * Splits/combines edges when there is an overlap of two edges (two edges who have an infinite number of
   * intersection points).
   * @private
   *
   * NOTE: This does NOT dispose aEdge/bEdge, due to eliminateOverlap's needs.
   *
   * Generally this creates an edge for the "shared" part of both segments, and then creates edges for the parts
   * outside of the shared region, connecting them together.
   *
   * @param {Edge} aEdge
   * @param {Edge} bEdge
   * @param {Overlap} overlap
   * @returns {Array.<Edge>}
   */ splitOverlap(aEdge, bEdge, overlap) {
        const newEdges = [];
        const aSegment = aEdge.segment;
        const bSegment = bEdge.segment;
        // Remove the edges from before
        this.removeEdge(aEdge);
        this.removeEdge(bEdge);
        let t0 = overlap.t0;
        let t1 = overlap.t1;
        let qt0 = overlap.qt0;
        let qt1 = overlap.qt1;
        // Apply rounding so we don't generate really small segments on the ends
        if (t0 < 1e-5) {
            t0 = 0;
        }
        if (t1 > 1 - 1e-5) {
            t1 = 1;
        }
        if (qt0 < 1e-5) {
            qt0 = 0;
        }
        if (qt1 > 1 - 1e-5) {
            qt1 = 1;
        }
        // Whether there will be remaining edges on each side.
        const aBefore = t0 > 0 ? aSegment.subdivided(t0)[0] : null;
        const bBefore = qt0 > 0 ? bSegment.subdivided(qt0)[0] : null;
        const aAfter = t1 < 1 ? aSegment.subdivided(t1)[1] : null;
        const bAfter = qt1 < 1 ? bSegment.subdivided(qt1)[1] : null;
        let middle = aSegment;
        if (t0 > 0) {
            middle = middle.subdivided(t0)[1];
        }
        if (t1 < 1) {
            middle = middle.subdivided(Utils.linear(t0, 1, 0, 1, t1))[0];
        }
        let beforeVertex;
        if (aBefore && bBefore) {
            beforeVertex = Vertex.pool.create(middle.start);
            this.vertices.push(beforeVertex);
        } else if (aBefore) {
            beforeVertex = overlap.a > 0 ? bEdge.startVertex : bEdge.endVertex;
        } else {
            beforeVertex = aEdge.startVertex;
        }
        let afterVertex;
        if (aAfter && bAfter) {
            afterVertex = Vertex.pool.create(middle.end);
            this.vertices.push(afterVertex);
        } else if (aAfter) {
            afterVertex = overlap.a > 0 ? bEdge.endVertex : bEdge.startVertex;
        } else {
            afterVertex = aEdge.endVertex;
        }
        const middleEdge = Edge.pool.create(middle, beforeVertex, afterVertex);
        newEdges.push(middleEdge);
        let aBeforeEdge;
        let aAfterEdge;
        let bBeforeEdge;
        let bAfterEdge;
        // Add "leftover" edges
        if (aBefore) {
            aBeforeEdge = Edge.pool.create(aBefore, aEdge.startVertex, beforeVertex);
            newEdges.push(aBeforeEdge);
        }
        if (aAfter) {
            aAfterEdge = Edge.pool.create(aAfter, afterVertex, aEdge.endVertex);
            newEdges.push(aAfterEdge);
        }
        if (bBefore) {
            bBeforeEdge = Edge.pool.create(bBefore, bEdge.startVertex, overlap.a > 0 ? beforeVertex : afterVertex);
            newEdges.push(bBeforeEdge);
        }
        if (bAfter) {
            bAfterEdge = Edge.pool.create(bAfter, overlap.a > 0 ? afterVertex : beforeVertex, bEdge.endVertex);
            newEdges.push(bAfterEdge);
        }
        for(let i = 0; i < newEdges.length; i++){
            this.addEdge(newEdges[i]);
        }
        // Collect "replacement" edges
        const aEdges = (aBefore ? [
            aBeforeEdge
        ] : []).concat([
            middleEdge
        ]).concat(aAfter ? [
            aAfterEdge
        ] : []);
        const bEdges = (bBefore ? [
            bBeforeEdge
        ] : []).concat([
            middleEdge
        ]).concat(bAfter ? [
            bAfterEdge
        ] : []);
        const aForwardHalfEdges = [];
        const bForwardHalfEdges = [];
        for(let i = 0; i < aEdges.length; i++){
            aForwardHalfEdges.push(aEdges[i].forwardHalf);
        }
        for(let i = 0; i < bEdges.length; i++){
            // Handle reversing the "middle" edge
            const isForward = bEdges[i] !== middleEdge || overlap.a > 0;
            bForwardHalfEdges.push(isForward ? bEdges[i].forwardHalf : bEdges[i].reversedHalf);
        }
        // Replace edges in the loops
        this.replaceEdgeInLoops(aEdge, aForwardHalfEdges);
        this.replaceEdgeInLoops(bEdge, bForwardHalfEdges);
        return newEdges;
    }
    /**
   * Handles splitting of self-intersection of segments (happens with Cubics).
   * @private
   */ eliminateSelfIntersection() {
        assert && assert(this.boundaries.length === 0, 'Only handles simpler level primitive splitting right now');
        for(let i = this.edges.length - 1; i >= 0; i--){
            const edge = this.edges[i];
            const segment = edge.segment;
            if (segment instanceof Cubic) {
                // TODO: This might not properly handle when it only one endpoint is on the curve https://github.com/phetsims/kite/issues/76
                const selfIntersection = segment.getSelfIntersection();
                if (selfIntersection) {
                    assert && assert(selfIntersection.aT < selfIntersection.bT);
                    const segments = segment.subdivisions([
                        selfIntersection.aT,
                        selfIntersection.bT
                    ]);
                    const vertex = Vertex.pool.create(selfIntersection.point);
                    this.vertices.push(vertex);
                    const startEdge = Edge.pool.create(segments[0], edge.startVertex, vertex);
                    const middleEdge = Edge.pool.create(segments[1], vertex, vertex);
                    const endEdge = Edge.pool.create(segments[2], vertex, edge.endVertex);
                    this.removeEdge(edge);
                    this.addEdge(startEdge);
                    this.addEdge(middleEdge);
                    this.addEdge(endEdge);
                    this.replaceEdgeInLoops(edge, [
                        startEdge.forwardHalf,
                        middleEdge.forwardHalf,
                        endEdge.forwardHalf
                    ]);
                    edge.dispose();
                }
            }
        }
    }
    /**
   * Replace intersections between different segments by splitting them and creating a vertex.
   * @private
   */ eliminateIntersection() {
        // We'll expand bounds by this amount, so that "adjacent" bounds (with a potentially overlapping vertical or
        // horizontal line) will have a non-zero amount of area overlapping.
        const epsilon = 1e-4;
        // Our queue will store entries of { start: boolean, edge: Edge }, representing a sweep line similar to the
        // Bentley-Ottmann approach. We'll track which edges are passing through the sweep line.
        const queue = new window.FlatQueue();
        // Tracks which edges are through the sweep line, but in a graph structure like a segment/interval tree, so that we
        // can have fast lookup (what edges are in a certain range) and also fast inserts/removals.
        const segmentTree = new EdgeSegmentTree(epsilon);
        // Assorted operations use a shortcut to "tag" edges with a unique ID, to indicate it has already been processed
        // for this call of eliminateOverlap(). This is a higher-performance option to storing an array of "already
        // processed" edges.
        const nextId = globalId++;
        // Adds an edge to the queue
        const addToQueue = (edge)=>{
            const bounds = edge.segment.bounds;
            // TODO: see if object allocations are slow here https://github.com/phetsims/kite/issues/76
            queue.push({
                start: true,
                edge: edge
            }, bounds.minY - epsilon);
            queue.push({
                start: false,
                edge: edge
            }, bounds.maxY + epsilon);
        };
        // Removes an edge from the queue (effectively... when we pop from the queue, we'll check its ID data, and if it was
        // "removed" we will ignore it. Higher-performance than using an array.
        const removeFromQueue = (edge)=>{
            // Store the ID so we can have a high-performance removal
            edge.internalData.removedId = nextId;
        };
        for(let i = 0; i < this.edges.length; i++){
            addToQueue(this.edges[i]);
        }
        // We track edges to dispose separately, instead of synchronously disposing them. This is mainly due to the trick of
        // removal IDs, since if we re-used pooled Edges when creating, they would still have the ID OR they would lose the
        // "removed" information.
        const edgesToDispose = [];
        while(queue.length){
            const entry = queue.pop();
            const edge = entry.edge;
            // Skip edges we already removed
            if (edge.internalData.removedId === nextId) {
                continue;
            }
            if (entry.start) {
                // We'll bail out of the loop if we find overlaps, and we'll store the relevant information in these
                let found = false;
                let overlappedEdge;
                let addedEdges;
                let removedEdges;
                // TODO: Is this closure killing performance? https://github.com/phetsims/kite/issues/76
                segmentTree.query(edge, (otherEdge)=>{
                    const aSegment = edge.segment;
                    const bSegment = otherEdge.segment;
                    let intersections = Segment.intersect(aSegment, bSegment);
                    intersections = intersections.filter((intersection)=>{
                        const point = intersection.point;
                        // Filter out endpoint-to-endpoint intersections, and at a radius where they would get collapsed into an
                        // endpoint anyway. If it's "internal" to one segment, we'll keep it.
                        return Graph.isInternal(point, intersection.aT, aSegment, INTERSECTION_ENDPOINT_THRESHOLD_DISTANCE, T_THRESHOLD) || Graph.isInternal(point, intersection.bT, bSegment, INTERSECTION_ENDPOINT_THRESHOLD_DISTANCE, T_THRESHOLD);
                    });
                    if (intersections.length) {
                        // TODO: In the future, handle multiple intersections (instead of re-running) https://github.com/phetsims/kite/issues/76
                        const intersection = intersections[0];
                        const result = this.simpleSplit(edge, otherEdge, intersection.aT, intersection.bT, intersection.point);
                        if (result) {
                            found = true;
                            overlappedEdge = otherEdge;
                            addedEdges = result.addedEdges;
                            removedEdges = result.removedEdges;
                            return true;
                        }
                    }
                    return false;
                });
                if (found) {
                    // If we didn't "remove" that edge, we'll still need to add it in.
                    if (removedEdges.includes(edge)) {
                        removeFromQueue(edge);
                        edgesToDispose.push(edge);
                    } else {
                        segmentTree.addItem(edge);
                    }
                    if (removedEdges.includes(overlappedEdge)) {
                        segmentTree.removeItem(overlappedEdge);
                        removeFromQueue(overlappedEdge);
                        edgesToDispose.push(overlappedEdge);
                    }
                    // Adjust the queue
                    for(let i = 0; i < addedEdges.length; i++){
                        addToQueue(addedEdges[i]);
                    }
                } else {
                    // No overlaps found, add it and continue
                    segmentTree.addItem(edge);
                }
            } else {
                // Removal can't trigger an intersection, so we can safely remove it
                segmentTree.removeItem(edge);
            }
        }
        for(let i = 0; i < edgesToDispose.length; i++){
            edgesToDispose[i].dispose();
        }
    }
    /**
   * Handles splitting two intersecting edges.
   * @private
   *
   * @param {Edge} aEdge
   * @param {Edge} bEdge
   * @param {number} aT - Parametric t value of the intersection for aEdge
   * @param {number} bT - Parametric t value of the intersection for bEdge
   * @param {Vector2} point - Location of the intersection
   *
   * @returns {{addedEdges: Edge[], removedEdges: Edge[]}|null}
   */ simpleSplit(aEdge, bEdge, aT, bT, point) {
        const aInternal = Graph.isInternal(point, aT, aEdge.segment, SPLIT_ENDPOINT_THRESHOLD_DISTANCE, T_THRESHOLD);
        const bInternal = Graph.isInternal(point, bT, bEdge.segment, SPLIT_ENDPOINT_THRESHOLD_DISTANCE, T_THRESHOLD);
        let vertex = null;
        if (!aInternal) {
            vertex = aT < 0.5 ? aEdge.startVertex : aEdge.endVertex;
        } else if (!bInternal) {
            vertex = bT < 0.5 ? bEdge.startVertex : bEdge.endVertex;
        } else {
            vertex = Vertex.pool.create(point);
            this.vertices.push(vertex);
        }
        let changed = false;
        const addedEdges = [];
        const removedEdges = [];
        if (aInternal && vertex !== aEdge.startVertex && vertex !== aEdge.endVertex) {
            addedEdges.push(...this.splitEdge(aEdge, aT, vertex));
            removedEdges.push(aEdge);
            changed = true;
        }
        if (bInternal && vertex !== bEdge.startVertex && vertex !== bEdge.endVertex) {
            addedEdges.push(...this.splitEdge(bEdge, bT, vertex));
            removedEdges.push(bEdge);
            changed = true;
        }
        return changed ? {
            addedEdges: addedEdges,
            removedEdges: removedEdges
        } : null;
    }
    /**
   * Splits an edge into two edges at a specific parametric t value.
   * @private
   *
   * @param {Edge} edge
   * @param {number} t
   * @param {Vertex} vertex - The vertex that is placed at the split location
   */ splitEdge(edge, t, vertex) {
        assert && assert(this.boundaries.length === 0, 'Only handles simpler level primitive splitting right now');
        assert && assert(edge.startVertex !== vertex);
        assert && assert(edge.endVertex !== vertex);
        const segments = edge.segment.subdivided(t);
        assert && assert(segments.length === 2);
        const firstEdge = Edge.pool.create(segments[0], edge.startVertex, vertex);
        const secondEdge = Edge.pool.create(segments[1], vertex, edge.endVertex);
        // Remove old connections
        this.removeEdge(edge);
        // Add new connections
        this.addEdge(firstEdge);
        this.addEdge(secondEdge);
        this.replaceEdgeInLoops(edge, [
            firstEdge.forwardHalf,
            secondEdge.forwardHalf
        ]);
        return [
            firstEdge,
            secondEdge
        ];
    }
    /**
   * Combine vertices that are almost exactly in the same place (removing edges and vertices where necessary).
   * @private
   */ collapseVertices() {
        assert && assert(_.every(this.edges, (edge)=>_.includes(this.vertices, edge.startVertex)));
        assert && assert(_.every(this.edges, (edge)=>_.includes(this.vertices, edge.endVertex)));
        // We'll expand bounds by this amount, so that "adjacent" bounds (with a potentially overlapping vertical or
        // horizontal line) will have a non-zero amount of area overlapping.
        const epsilon = 10 * VERTEX_COLLAPSE_THRESHOLD_DISTANCE; // TODO: could we reduce this factor to closer to the distance? https://github.com/phetsims/kite/issues/98
        // Our queue will store entries of { start: boolean, vertex: Vertex }, representing a sweep line similar to the
        // Bentley-Ottmann approach. We'll track which edges are passing through the sweep line.
        const queue = new window.FlatQueue();
        // Tracks which vertices are through the sweep line, but in a graph structure like a segment/interval tree, so that
        // we can have fast lookup (what vertices are in a certain range) and also fast inserts/removals.
        const segmentTree = new VertexSegmentTree(epsilon);
        // Assorted operations use a shortcut to "tag" vertices with a unique ID, to indicate it has already been processed
        // for this call of eliminateOverlap(). This is a higher-performance option to storing an array of "already
        // processed" edges.
        const nextId = globalId++;
        // Adds an vertex to the queue
        const addToQueue = (vertex)=>{
            // TODO: see if object allocations are slow here https://github.com/phetsims/kite/issues/76
            queue.push({
                start: true,
                vertex: vertex
            }, vertex.point.y - epsilon);
            queue.push({
                start: false,
                vertex: vertex
            }, vertex.point.y + epsilon);
        };
        // Removes a vertex from the queue (effectively... when we pop from the queue, we'll check its ID data, and if it
        // was "removed" we will ignore it. Higher-performance than using an array.
        const removeFromQueue = (vertex)=>{
            // Store the ID so we can have a high-performance removal
            vertex.internalData.removedId = nextId;
        };
        for(let i = 0; i < this.vertices.length; i++){
            addToQueue(this.vertices[i]);
        }
        // We track vertices to dispose separately, instead of synchronously disposing them. This is mainly due to the trick
        // of removal IDs, since if we re-used pooled Vertices when creating, they would still have the ID OR they would
        // lose the "removed" information.
        const verticesToDispose = [];
        while(queue.length){
            const entry = queue.pop();
            const vertex = entry.vertex;
            // Skip vertices we already removed
            if (vertex.internalData.removedId === nextId) {
                continue;
            }
            if (entry.start) {
                // We'll bail out of the loop if we find overlaps, and we'll store the relevant information in these
                let found = false;
                let overlappedVertex;
                let addedVertices;
                // TODO: Is this closure killing performance? https://github.com/phetsims/kite/issues/76
                segmentTree.query(vertex, (otherVertex)=>{
                    const distance = vertex.point.distance(otherVertex.point);
                    if (distance < VERTEX_COLLAPSE_THRESHOLD_DISTANCE) {
                        const newVertex = Vertex.pool.create(distance === 0 ? vertex.point : vertex.point.average(otherVertex.point));
                        this.vertices.push(newVertex);
                        arrayRemove(this.vertices, vertex);
                        arrayRemove(this.vertices, otherVertex);
                        for(let k = this.edges.length - 1; k >= 0; k--){
                            const edge = this.edges[k];
                            const startMatches = edge.startVertex === vertex || edge.startVertex === otherVertex;
                            const endMatches = edge.endVertex === vertex || edge.endVertex === otherVertex;
                            // Outright remove edges that were between A and B that aren't loops
                            if (startMatches && endMatches) {
                                if ((edge.segment.bounds.width > 1e-5 || edge.segment.bounds.height > 1e-5) && (edge.segment instanceof Cubic || edge.segment instanceof Arc || edge.segment instanceof EllipticalArc)) {
                                    // Replace it with a new edge that is from the vertex to itself
                                    const replacementEdge = Edge.pool.create(edge.segment, newVertex, newVertex);
                                    this.addEdge(replacementEdge);
                                    this.replaceEdgeInLoops(edge, [
                                        replacementEdge.forwardHalf
                                    ]);
                                } else {
                                    this.replaceEdgeInLoops(edge, []); // remove the edge from loops with no replacement
                                }
                                this.removeEdge(edge);
                                edge.dispose();
                            } else if (startMatches) {
                                edge.startVertex = newVertex;
                                newVertex.incidentHalfEdges.push(edge.reversedHalf);
                                edge.updateReferences();
                            } else if (endMatches) {
                                edge.endVertex = newVertex;
                                newVertex.incidentHalfEdges.push(edge.forwardHalf);
                                edge.updateReferences();
                            }
                        }
                        addedVertices = [
                            newVertex
                        ];
                        found = true;
                        overlappedVertex = otherVertex;
                        return true;
                    }
                    return false;
                });
                if (found) {
                    // We haven't added our edge yet, so no need to remove it.
                    segmentTree.removeItem(overlappedVertex);
                    // Adjust the queue
                    removeFromQueue(overlappedVertex);
                    removeFromQueue(vertex);
                    for(let i = 0; i < addedVertices.length; i++){
                        addToQueue(addedVertices[i]);
                    }
                    verticesToDispose.push(vertex);
                    verticesToDispose.push(overlappedVertex);
                } else {
                    // No overlaps found, add it and continue
                    segmentTree.addItem(vertex);
                }
            } else {
                // Removal can't trigger an intersection, so we can safely remove it
                segmentTree.removeItem(vertex);
            }
        }
        for(let i = 0; i < verticesToDispose.length; i++){
            verticesToDispose[i].dispose();
        }
        assert && assert(_.every(this.edges, (edge)=>_.includes(this.vertices, edge.startVertex)));
        assert && assert(_.every(this.edges, (edge)=>_.includes(this.vertices, edge.endVertex)));
    }
    /**
   * Scan a given vertex for bridges recursively with a depth-first search.
   * @private
   *
   * Records visit times to each vertex, and back-propagates so that we can efficiently determine if there was another
   * path around to the vertex.
   *
   * Assumes this is only called one time once all edges/vertices are set up. Repeated calls will fail because we
   * don't mark visited/etc. references again on startup
   *
   * See Tarjan's algorithm for more information. Some modifications were needed, since this is technically a
   * multigraph/pseudograph (can have edges that have the same start/end vertex, and can have multiple edges
   * going from the same two vertices).
   *
   * @param {Array.<Edge>} bridges - Appends bridge edges to here.
   * @param {Vertex} vertex
   */ markBridges(bridges, vertex) {
        vertex.visited = true;
        vertex.visitIndex = vertex.lowIndex = bridgeId++;
        for(let i = 0; i < vertex.incidentHalfEdges.length; i++){
            const edge = vertex.incidentHalfEdges[i].edge;
            const childVertex = vertex.incidentHalfEdges[i].startVertex; // by definition, our vertex should be the endVertex
            if (!childVertex.visited) {
                edge.visited = true;
                childVertex.parent = vertex;
                this.markBridges(bridges, childVertex);
                // Check if there's another route that reaches back to our vertex from an ancestor
                vertex.lowIndex = Math.min(vertex.lowIndex, childVertex.lowIndex);
                // If there was no route, then we reached a bridge
                if (childVertex.lowIndex > vertex.visitIndex) {
                    bridges.push(edge);
                }
            } else if (!edge.visited) {
                vertex.lowIndex = Math.min(vertex.lowIndex, childVertex.visitIndex);
            }
        }
    }
    /**
   * Removes edges that are the only edge holding two connected components together. Based on our problem, the
   * face on either side of the "bridge" edges would always be the same, so we can safely remove them.
   * @private
   */ removeBridges() {
        const bridges = [];
        for(let i = 0; i < this.vertices.length; i++){
            const vertex = this.vertices[i];
            if (!vertex.visited) {
                this.markBridges(bridges, vertex);
            }
        }
        for(let i = 0; i < bridges.length; i++){
            const bridgeEdge = bridges[i];
            this.removeEdge(bridgeEdge);
            this.replaceEdgeInLoops(bridgeEdge, []);
            bridgeEdge.dispose();
        }
    }
    /**
   * Removes vertices that have order less than 2 (so either a vertex with one or zero edges adjacent).
   * @private
   */ removeLowOrderVertices() {
        assert && assert(_.every(this.edges, (edge)=>_.includes(this.vertices, edge.startVertex)));
        assert && assert(_.every(this.edges, (edge)=>_.includes(this.vertices, edge.endVertex)));
        let needsLoop = true;
        while(needsLoop){
            needsLoop = false;
            for(let i = this.vertices.length - 1; i >= 0; i--){
                const vertex = this.vertices[i];
                if (vertex.incidentHalfEdges.length < 2) {
                    // Disconnect any existing edges
                    for(let j = 0; j < vertex.incidentHalfEdges.length; j++){
                        const edge = vertex.incidentHalfEdges[j].edge;
                        this.removeEdge(edge);
                        this.replaceEdgeInLoops(edge, []); // remove the edge from the loops
                        edge.dispose();
                    }
                    // Remove the vertex
                    this.vertices.splice(i, 1);
                    vertex.dispose();
                    needsLoop = true;
                    break;
                }
            }
        }
        assert && assert(_.every(this.edges, (edge)=>_.includes(this.vertices, edge.startVertex)));
        assert && assert(_.every(this.edges, (edge)=>_.includes(this.vertices, edge.endVertex)));
    }
    /**
   * Sorts incident half-edges for each vertex.
   * @private
   */ orderVertexEdges() {
        for(let i = 0; i < this.vertices.length; i++){
            this.vertices[i].sortEdges();
        }
    }
    /**
   * Creates boundaries and faces by following each half-edge counter-clockwise
   * @private
   */ extractFaces() {
        const halfEdges = [];
        for(let i = 0; i < this.edges.length; i++){
            halfEdges.push(this.edges[i].forwardHalf);
            halfEdges.push(this.edges[i].reversedHalf);
        }
        while(halfEdges.length){
            const boundaryHalfEdges = [];
            let halfEdge = halfEdges[0];
            const startingHalfEdge = halfEdge;
            while(halfEdge){
                arrayRemove(halfEdges, halfEdge);
                boundaryHalfEdges.push(halfEdge);
                halfEdge = halfEdge.getNext();
                if (halfEdge === startingHalfEdge) {
                    break;
                }
            }
            const boundary = Boundary.pool.create(boundaryHalfEdges);
            (boundary.signedArea > 0 ? this.innerBoundaries : this.outerBoundaries).push(boundary);
            this.boundaries.push(boundary);
        }
        for(let i = 0; i < this.innerBoundaries.length; i++){
            this.faces.push(Face.pool.create(this.innerBoundaries[i]));
        }
    }
    /**
   * Given the inner and outer boundaries, it computes a tree representation to determine what boundaries are
   * holes of what other boundaries, then sets up face holes with the result.
   * @public
   *
   * This information is stored in the childBoundaries array of Boundary, and is then read out to set up faces.
   */ computeBoundaryTree() {
        // TODO: detect "indeterminate" for robustness (and try new angles?) https://github.com/phetsims/kite/issues/76
        const unboundedHoles = []; // {Array.<Boundary>}
        // We'll want to compute a ray for each outer boundary that starts at an extreme point for that direction and
        // continues outwards. The next boundary it intersects will be linked together in the tree.
        // We have a mostly-arbitrary angle here that hopefully won't be used.
        const transform = new Transform3(Matrix3.rotation2(1.5729657));
        for(let i = 0; i < this.outerBoundaries.length; i++){
            const outerBoundary = this.outerBoundaries[i];
            const ray = outerBoundary.computeExtremeRay(transform);
            let closestEdge = null;
            let closestDistance = Number.POSITIVE_INFINITY;
            let closestWind = false;
            for(let j = 0; j < this.edges.length; j++){
                const edge = this.edges[j];
                const intersections = edge.segment.intersection(ray);
                for(let k = 0; k < intersections.length; k++){
                    const intersection = intersections[k];
                    if (intersection.distance < closestDistance) {
                        closestEdge = edge;
                        closestDistance = intersection.distance;
                        closestWind = intersection.wind;
                    }
                }
            }
            if (closestEdge === null) {
                unboundedHoles.push(outerBoundary);
            } else {
                const reversed = closestWind < 0;
                const closestHalfEdge = reversed ? closestEdge.reversedHalf : closestEdge.forwardHalf;
                const closestBoundary = this.getBoundaryOfHalfEdge(closestHalfEdge);
                closestBoundary.childBoundaries.push(outerBoundary);
            }
        }
        unboundedHoles.forEach(this.unboundedFace.recursivelyAddHoles.bind(this.unboundedFace));
        for(let i = 0; i < this.faces.length; i++){
            const face = this.faces[i];
            if (face.boundary !== null) {
                face.boundary.childBoundaries.forEach(face.recursivelyAddHoles.bind(face));
            }
        }
    }
    /**
   * Computes the winding map for each face, starting with 0 on the unbounded face (for each shapeId).
   * @private
   */ computeWindingMap() {
        const edges = this.edges.slice();
        // Winding numbers for "outside" are 0.
        const outsideMap = {};
        for(let i = 0; i < this.shapeIds.length; i++){
            outsideMap[this.shapeIds[i]] = 0;
        }
        this.unboundedFace.windingMap = outsideMap;
        // We have "solved" the unbounded face, and then iteratively go over the edges looking for a case where we have
        // solved one of the faces that is adjacent to that edge. We can then compute the difference between winding
        // numbers between the two faces, and thus determine the (absolute) winding numbers for the unsolved face.
        while(edges.length){
            for(let j = edges.length - 1; j >= 0; j--){
                const edge = edges[j];
                const forwardHalf = edge.forwardHalf;
                const reversedHalf = edge.reversedHalf;
                const forwardFace = forwardHalf.face;
                const reversedFace = reversedHalf.face;
                assert && assert(forwardFace !== reversedFace);
                const solvedForward = forwardFace.windingMap !== null;
                const solvedReversed = reversedFace.windingMap !== null;
                if (solvedForward && solvedReversed) {
                    edges.splice(j, 1);
                    if (assert) {
                        for(let m = 0; m < this.shapeIds.length; m++){
                            const id = this.shapeIds[m];
                            assert(forwardFace.windingMap[id] - reversedFace.windingMap[id] === this.computeDifferential(edge, id));
                        }
                    }
                } else if (!solvedForward && !solvedReversed) {
                    continue;
                } else {
                    const solvedFace = solvedForward ? forwardFace : reversedFace;
                    const unsolvedFace = solvedForward ? reversedFace : forwardFace;
                    const windingMap = {};
                    for(let k = 0; k < this.shapeIds.length; k++){
                        const shapeId = this.shapeIds[k];
                        const differential = this.computeDifferential(edge, shapeId);
                        windingMap[shapeId] = solvedFace.windingMap[shapeId] + differential * (solvedForward ? -1 : 1);
                    }
                    unsolvedFace.windingMap = windingMap;
                }
            }
        }
    }
    /**
   * Computes the differential in winding numbers (forward face winding number minus the reversed face winding number)
   * ("forward face" is the face on the forward half-edge side, etc.)
   * @private
   *
   * @param {Edge} edge
   * @param {number} shapeId
   * @returns {number} - The difference between forward face and reversed face winding numbers.
   */ computeDifferential(edge, shapeId) {
        let differential = 0; // forward face - reversed face
        for(let m = 0; m < this.loops.length; m++){
            const loop = this.loops[m];
            assert && assert(loop.closed, 'This is only defined to work for closed loops');
            if (loop.shapeId !== shapeId) {
                continue;
            }
            for(let n = 0; n < loop.halfEdges.length; n++){
                const loopHalfEdge = loop.halfEdges[n];
                if (loopHalfEdge === edge.forwardHalf) {
                    differential++;
                } else if (loopHalfEdge === edge.reversedHalf) {
                    differential--;
                }
            }
        }
        return differential;
    }
    /**
   * Sets the unbounded face as unfilled, and then sets each face's fill so that edges separate one filled face with
   * one unfilled face.
   * @private
   *
   * NOTE: Best to call this on the result from createFilledSubGraph(), since it should have guaranteed properties
   *       to make this consistent. Notably, all vertices need to have an even order (number of edges)
   */ fillAlternatingFaces() {
        let nullFaceFilledCount = 0;
        for(let i = 0; i < this.faces.length; i++){
            this.faces[i].filled = null;
            nullFaceFilledCount++;
        }
        this.unboundedFace.filled = false;
        nullFaceFilledCount--;
        while(nullFaceFilledCount){
            for(let i = 0; i < this.edges.length; i++){
                const edge = this.edges[i];
                const forwardFace = edge.forwardHalf.face;
                const reversedFace = edge.reversedHalf.face;
                const forwardNull = forwardFace.filled === null;
                const reversedNull = reversedFace.filled === null;
                if (forwardNull && !reversedNull) {
                    forwardFace.filled = !reversedFace.filled;
                    nullFaceFilledCount--;
                } else if (!forwardNull && reversedNull) {
                    reversedFace.filled = !forwardFace.filled;
                    nullFaceFilledCount--;
                }
            }
        }
    }
    /**
   * Returns the boundary that contains the specified half-edge.
   * @private
   *
   * TODO: find a better way, this is crazy inefficient https://github.com/phetsims/kite/issues/76
   *
   * @param {HalfEdge} halfEdge
   * @returns {Boundary}
   */ getBoundaryOfHalfEdge(halfEdge) {
        for(let i = 0; i < this.boundaries.length; i++){
            const boundary = this.boundaries[i];
            if (boundary.hasHalfEdge(halfEdge)) {
                return boundary;
            }
        }
        throw new Error('Could not find boundary');
    }
    // @public
    static isInternal(point, t, segment, distanceThreshold, tThreshold) {
        return t > tThreshold && t < 1 - tThreshold && point.distance(segment.start) > distanceThreshold && point.distance(segment.end) > distanceThreshold;
    }
    /**
   * "Union" binary winding map filter for use with Graph.binaryResult.
   * @public
   *
   * This combines both shapes together so that a point is in the resulting shape if it was in either of the input
   * shapes.
   *
   * @param {Object} windingMap - See computeFaceInclusion for more details
   * @returns {boolean}
   */ static BINARY_NONZERO_UNION(windingMap) {
        return windingMap['0'] !== 0 || windingMap['1'] !== 0;
    }
    /**
   * "Intersection" binary winding map filter for use with Graph.binaryResult.
   * @public
   *
   * This combines both shapes together so that a point is in the resulting shape if it was in both of the input
   * shapes.
   *
   * @param {Object} windingMap - See computeFaceInclusion for more details
   * @returns {boolean}
   */ static BINARY_NONZERO_INTERSECTION(windingMap) {
        return windingMap['0'] !== 0 && windingMap['1'] !== 0;
    }
    /**
   * "Difference" binary winding map filter for use with Graph.binaryResult.
   * @public
   *
   * This combines both shapes together so that a point is in the resulting shape if it was in the first shape AND
   * was NOT in the second shape.
   *
   * @param {Object} windingMap - See computeFaceInclusion for more details
   * @returns {boolean}
   */ static BINARY_NONZERO_DIFFERENCE(windingMap) {
        return windingMap['0'] !== 0 && windingMap['1'] === 0;
    }
    /**
   * "XOR" binary winding map filter for use with Graph.binaryResult.
   * @public
   *
   * This combines both shapes together so that a point is in the resulting shape if it is only in exactly one of the
   * input shapes. It's like the union minus intersection.
   *
   * @param {Object} windingMap - See computeFaceInclusion for more details
   * @returns {boolean}
   */ static BINARY_NONZERO_XOR(windingMap) {
        return (windingMap['0'] !== 0 ^ windingMap['1'] !== 0) === 1; // eslint-disable-line no-bitwise
    }
    /**
   * Returns the resulting Shape obtained by combining the two shapes given with the filter.
   * @public
   *
   * @param {Shape} shapeA
   * @param {Shape} shapeB
   * @param {function} windingMapFilter - See computeFaceInclusion for details on the format
   * @returns {Shape}
   */ static binaryResult(shapeA, shapeB, windingMapFilter) {
        const graph = new Graph();
        graph.addShape(0, shapeA);
        graph.addShape(1, shapeB);
        graph.computeSimplifiedFaces();
        graph.computeFaceInclusion(windingMapFilter);
        const subgraph = graph.createFilledSubGraph();
        const shape = subgraph.facesToShape();
        graph.dispose();
        subgraph.dispose();
        return shape;
    }
    /**
   * Returns the union of an array of shapes.
   * @public
   *
   * @param {Array.<Shape>} shapes
   * @returns {Shape}
   */ static unionNonZero(shapes) {
        const graph = new Graph();
        for(let i = 0; i < shapes.length; i++){
            graph.addShape(i, shapes[i]);
        }
        graph.computeSimplifiedFaces();
        graph.computeFaceInclusion((windingMap)=>{
            for(let j = 0; j < shapes.length; j++){
                if (windingMap[j] !== 0) {
                    return true;
                }
            }
            return false;
        });
        const subgraph = graph.createFilledSubGraph();
        const shape = subgraph.facesToShape();
        graph.dispose();
        subgraph.dispose();
        return shape;
    }
    /**
   * Returns the intersection of an array of shapes.
   * @public
   *
   * @param {Array.<Shape>} shapes
   * @returns {Shape}
   */ static intersectionNonZero(shapes) {
        const graph = new Graph();
        for(let i = 0; i < shapes.length; i++){
            graph.addShape(i, shapes[i]);
        }
        graph.computeSimplifiedFaces();
        graph.computeFaceInclusion((windingMap)=>{
            for(let j = 0; j < shapes.length; j++){
                if (windingMap[j] === 0) {
                    return false;
                }
            }
            return true;
        });
        const subgraph = graph.createFilledSubGraph();
        const shape = subgraph.facesToShape();
        graph.dispose();
        subgraph.dispose();
        return shape;
    }
    /**
   * Returns the xor of an array of shapes.
   * @public
   *
   * TODO: reduce code duplication? https://github.com/phetsims/kite/issues/76
   *
   * @param {Array.<Shape>} shapes
   * @returns {Shape}
   */ static xorNonZero(shapes) {
        const graph = new Graph();
        for(let i = 0; i < shapes.length; i++){
            graph.addShape(i, shapes[i]);
        }
        graph.computeSimplifiedFaces();
        graph.computeFaceInclusion((windingMap)=>{
            let included = false;
            for(let j = 0; j < shapes.length; j++){
                if (windingMap[j] !== 0) {
                    included = !included;
                }
            }
            return included;
        });
        const subgraph = graph.createFilledSubGraph();
        const shape = subgraph.facesToShape();
        graph.dispose();
        subgraph.dispose();
        return shape;
    }
    /**
   * Returns a simplified Shape obtained from running it through the simplification steps with non-zero output.
   * @public
   *
   * @param {Shape} shape
   * @returns {Shape}
   */ static simplifyNonZero(shape) {
        const graph = new Graph();
        graph.addShape(0, shape);
        graph.computeSimplifiedFaces();
        graph.computeFaceInclusion((map)=>map['0'] !== 0);
        const subgraph = graph.createFilledSubGraph();
        const resultShape = subgraph.facesToShape();
        graph.dispose();
        subgraph.dispose();
        return resultShape;
    }
    /**
   * Returns a clipped version of `shape` that contains only the parts that are within the area defined by
   * `clipAreaShape`
   * @public
   *
   * @param {Shape} clipAreaShape
   * @param {Shape} shape
   * @param {Object} [options]
   * @returns {Shape}
   */ static clipShape(clipAreaShape, shape, options) {
        let i;
        let j;
        let loop;
        const SHAPE_ID = 0;
        const CLIP_SHAPE_ID = 1;
        options = merge({
            // {boolean} - Respectively whether segments should be in the returned shape if they are in the exterior of the
            // clipAreaShape (outside), on the boundary, or in the interior.
            includeExterior: false,
            includeBoundary: true,
            includeInterior: true
        }, options);
        const simplifiedClipAreaShape = Graph.simplifyNonZero(clipAreaShape);
        const graph = new Graph();
        graph.addShape(SHAPE_ID, shape, {
            ensureClosed: false // don't add closing segments, since we'll be recreating subpaths/etc.
        });
        graph.addShape(CLIP_SHAPE_ID, simplifiedClipAreaShape);
        // A subset of simplifications (we want to keep low-order vertices, etc.)
        graph.eliminateOverlap();
        graph.eliminateSelfIntersection();
        graph.eliminateIntersection();
        graph.collapseVertices();
        // Mark clip edges with data=true
        for(i = 0; i < graph.loops.length; i++){
            loop = graph.loops[i];
            if (loop.shapeId === CLIP_SHAPE_ID) {
                for(j = 0; j < loop.halfEdges.length; j++){
                    loop.halfEdges[j].edge.data = true;
                }
            }
        }
        const subpaths = [];
        for(i = 0; i < graph.loops.length; i++){
            loop = graph.loops[i];
            if (loop.shapeId === SHAPE_ID) {
                let segments = [];
                for(j = 0; j < loop.halfEdges.length; j++){
                    const halfEdge = loop.halfEdges[j];
                    const included = halfEdge.edge.data ? options.includeBoundary : simplifiedClipAreaShape.containsPoint(halfEdge.edge.segment.positionAt(0.5)) ? options.includeInterior : options.includeExterior;
                    if (included) {
                        segments.push(halfEdge.getDirectionalSegment());
                    } else if (segments.length) {
                        subpaths.push(new Subpath(segments, undefined, loop.closed));
                        segments = [];
                    }
                }
                if (segments.length) {
                    subpaths.push(new Subpath(segments, undefined, loop.closed));
                }
            }
        }
        graph.dispose();
        return new kite.Shape(subpaths);
    }
    /**
   * @public (kite-internal)
   */ constructor(){
        // @public {Array.<Vertex>}
        this.vertices = [];
        // @public {Array.<Edge>}
        this.edges = [];
        // @public {Array.<Boundary>}
        this.innerBoundaries = [];
        this.outerBoundaries = [];
        this.boundaries = [];
        // @public {Array.<number>}
        this.shapeIds = [];
        // @public {Array.<Loop>}
        this.loops = [];
        // @public {Face}
        this.unboundedFace = Face.pool.create(null);
        // @public {Array.<Face>}
        this.faces = [
            this.unboundedFace
        ];
    }
};
kite.register('Graph', Graph);
export default Graph;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL2tpdGUvanMvb3BzL0dyYXBoLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE3LTIwMjQsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIEEgbXVsdGlncmFwaCB3aG9zZSBlZGdlcyBhcmUgc2VnbWVudHMuXG4gKlxuICogU3VwcG9ydHMgZ2VuZXJhbCBzaGFwZSBzaW1wbGlmaWNhdGlvbiwgb3ZlcmxhcC9pbnRlcnNlY3Rpb24gcmVtb3ZhbCBhbmQgY29tcHV0YXRpb24uIEdlbmVyYWwgb3V0cHV0IHdvdWxkIGluY2x1ZGVcbiAqIFNoYXBlcyAoZnJvbSBDQUcgLSBDb25zdHJ1Y3RpdmUgQXJlYSBHZW9tZXRyeSkgYW5kIHRyaWFuZ3VsYXRpb25zLlxuICpcbiAqIFNlZSBHcmFwaC5iaW5hcnlSZXN1bHQgZm9yIHRoZSBnZW5lcmFsIHByb2NlZHVyZSBmb3IgQ0FHLlxuICpcbiAqIFRPRE86IFVzZSBodHRwczovL2dpdGh1Yi5jb20vbWF1cmljaW9zYW50b3MvQnVja2V0cy1KUyBmb3IgcHJpb3JpdHkgcXVldWUsIGltcGxlbWVudCBzaW1wbGUgc3dlZXAgbGluZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMva2l0ZS9pc3N1ZXMvNzZcbiAqICAgICAgIHdpdGggXCJlbnRlcnNcIiBhbmQgXCJsZWF2ZXNcIiBlbnRyaWVzIGluIHRoZSBxdWV1ZS4gV2hlbiBlZGdlIHJlbW92ZWQsIHJlbW92ZSBcImxlYXZlXCIgZnJvbSBxdWV1ZS5cbiAqICAgICAgIGFuZCBhZGQgYW55IHJlcGxhY2VtZW50IGVkZ2VzLiBBcHBsaWVzIHRvIG92ZXJsYXAgYW5kIGludGVyc2VjdGlvbiBoYW5kbGluZy5cbiAqICAgICAgIE5PVEU6IFRoaXMgc2hvdWxkIGltcGFjdCBwZXJmb3JtYW5jZSBhIGxvdCwgYXMgd2UgYXJlIGN1cnJlbnRseSBvdmVyLXNjYW5uaW5nIGFuZCByZS1zY2FubmluZyBhIGxvdC5cbiAqICAgICAgIEludGVyc2VjdGlvbiBpcyBjdXJyZW50bHkgKGJ5IGZhcj8pIHRoZSBwZXJmb3JtYW5jZSBib3R0bGVuZWNrLlxuICogVE9ETzogQ29sbGFwc2Ugbm9uLUxpbmUgYWRqYWNlbnQgZWRnZXMgdG9nZXRoZXIuIFNpbWlsYXIgbG9naWMgdG8gb3ZlcmxhcCBmb3IgZWFjaCBzZWdtZW50IHRpbWUsIGhvcGVmdWxseSBjYW5cbiAqICAgICAgIGZhY3RvciB0aGlzIG91dC5cbiAqIFRPRE86IFByb3Blcmx5IGhhbmRsZSBzb3J0aW5nIGVkZ2VzIGFyb3VuZCBhIHZlcnRleCB3aGVuIHR3byBlZGdlcyBoYXZlIHRoZSBzYW1lIHRhbmdlbnQgb3V0LiBXZSdsbCBuZWVkIHRvIHVzZVxuICogICAgICAgY3VydmF0dXJlLCBvciBkbyB0cmlja3MgdG8gZm9sbG93IGJvdGggY3VydmVzIGJ5IGFuICdlcHNpbG9uJyBhbmQgc29ydCBiYXNlZCBvbiB0aGF0LlxuICogVE9ETzogQ29uc2lkZXIgc2VwYXJhdGluZyBvdXQgZXBzaWxvbiB2YWx1ZXMgKG1heSBiZSBhIGdlbmVyYWwgS2l0ZSB0aGluZyByYXRoZXIgdGhhbiBqdXN0IG9wcylcbiAqIFRPRE86IExvb3AtQmxpbm4gb3V0cHV0IGFuZCBjb25zdHJhaW5lZCBEZWxhdW5heSB0cmlhbmd1bGF0aW9uXG4gKlxuICogQGF1dGhvciBKb25hdGhhbiBPbHNvbiA8am9uYXRoYW4ub2xzb25AY29sb3JhZG8uZWR1PlxuICovXG5cbmltcG9ydCBCb3VuZHMyIGZyb20gJy4uLy4uLy4uL2RvdC9qcy9Cb3VuZHMyLmpzJztcbmltcG9ydCBNYXRyaXgzIGZyb20gJy4uLy4uLy4uL2RvdC9qcy9NYXRyaXgzLmpzJztcbmltcG9ydCBUcmFuc2Zvcm0zIGZyb20gJy4uLy4uLy4uL2RvdC9qcy9UcmFuc2Zvcm0zLmpzJztcbmltcG9ydCBVdGlscyBmcm9tICcuLi8uLi8uLi9kb3QvanMvVXRpbHMuanMnO1xuaW1wb3J0IFZlY3RvcjIgZnJvbSAnLi4vLi4vLi4vZG90L2pzL1ZlY3RvcjIuanMnO1xuaW1wb3J0IGFycmF5UmVtb3ZlIGZyb20gJy4uLy4uLy4uL3BoZXQtY29yZS9qcy9hcnJheVJlbW92ZS5qcyc7XG5pbXBvcnQgY2xlYW5BcnJheSBmcm9tICcuLi8uLi8uLi9waGV0LWNvcmUvanMvY2xlYW5BcnJheS5qcyc7XG5pbXBvcnQgbWVyZ2UgZnJvbSAnLi4vLi4vLi4vcGhldC1jb3JlL2pzL21lcmdlLmpzJztcbmltcG9ydCB7IEFyYywgQm91bmRhcnksIEN1YmljLCBFZGdlLCBFZGdlU2VnbWVudFRyZWUsIEVsbGlwdGljYWxBcmMsIEZhY2UsIGtpdGUsIExpbmUsIExvb3AsIFNlZ21lbnQsIFN1YnBhdGgsIFZlcnRleCwgVmVydGV4U2VnbWVudFRyZWUgfSBmcm9tICcuLi9pbXBvcnRzLmpzJztcblxubGV0IGJyaWRnZUlkID0gMDtcbmxldCBnbG9iYWxJZCA9IDA7XG5cbmNvbnN0IFZFUlRFWF9DT0xMQVBTRV9USFJFU0hPTERfRElTVEFOQ0UgPSAxZS01O1xuY29uc3QgSU5URVJTRUNUSU9OX0VORFBPSU5UX1RIUkVTSE9MRF9ESVNUQU5DRSA9IDAuMSAqIFZFUlRFWF9DT0xMQVBTRV9USFJFU0hPTERfRElTVEFOQ0U7XG5jb25zdCBTUExJVF9FTkRQT0lOVF9USFJFU0hPTERfRElTVEFOQ0UgPSAwLjAxICogVkVSVEVYX0NPTExBUFNFX1RIUkVTSE9MRF9ESVNUQU5DRTtcbmNvbnN0IFRfVEhSRVNIT0xEID0gMWUtNjtcblxuY2xhc3MgR3JhcGgge1xuICAvKipcbiAgICogQHB1YmxpYyAoa2l0ZS1pbnRlcm5hbClcbiAgICovXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIC8vIEBwdWJsaWMge0FycmF5LjxWZXJ0ZXg+fVxuICAgIHRoaXMudmVydGljZXMgPSBbXTtcblxuICAgIC8vIEBwdWJsaWMge0FycmF5LjxFZGdlPn1cbiAgICB0aGlzLmVkZ2VzID0gW107XG5cbiAgICAvLyBAcHVibGljIHtBcnJheS48Qm91bmRhcnk+fVxuICAgIHRoaXMuaW5uZXJCb3VuZGFyaWVzID0gW107XG4gICAgdGhpcy5vdXRlckJvdW5kYXJpZXMgPSBbXTtcbiAgICB0aGlzLmJvdW5kYXJpZXMgPSBbXTtcblxuICAgIC8vIEBwdWJsaWMge0FycmF5LjxudW1iZXI+fVxuICAgIHRoaXMuc2hhcGVJZHMgPSBbXTtcblxuICAgIC8vIEBwdWJsaWMge0FycmF5LjxMb29wPn1cbiAgICB0aGlzLmxvb3BzID0gW107XG5cbiAgICAvLyBAcHVibGljIHtGYWNlfVxuICAgIHRoaXMudW5ib3VuZGVkRmFjZSA9IEZhY2UucG9vbC5jcmVhdGUoIG51bGwgKTtcblxuICAgIC8vIEBwdWJsaWMge0FycmF5LjxGYWNlPn1cbiAgICB0aGlzLmZhY2VzID0gWyB0aGlzLnVuYm91bmRlZEZhY2UgXTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGFuIG9iamVjdCBmb3JtIHRoYXQgY2FuIGJlIHR1cm5lZCBiYWNrIGludG8gYSBzZWdtZW50IHdpdGggdGhlIGNvcnJlc3BvbmRpbmcgZGVzZXJpYWxpemUgbWV0aG9kLlxuICAgKiBAcHVibGljXG4gICAqXG4gICAqIEByZXR1cm5zIHtPYmplY3R9XG4gICAqL1xuICBzZXJpYWxpemUoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHR5cGU6ICdHcmFwaCcsXG4gICAgICB2ZXJ0aWNlczogdGhpcy52ZXJ0aWNlcy5tYXAoIHZlcnRleCA9PiB2ZXJ0ZXguc2VyaWFsaXplKCkgKSxcbiAgICAgIGVkZ2VzOiB0aGlzLmVkZ2VzLm1hcCggZWRnZSA9PiBlZGdlLnNlcmlhbGl6ZSgpICksXG4gICAgICBib3VuZGFyaWVzOiB0aGlzLmJvdW5kYXJpZXMubWFwKCBib3VuZGFyeSA9PiBib3VuZGFyeS5zZXJpYWxpemUoKSApLFxuICAgICAgaW5uZXJCb3VuZGFyaWVzOiB0aGlzLmlubmVyQm91bmRhcmllcy5tYXAoIGJvdW5kYXJ5ID0+IGJvdW5kYXJ5LmlkICksXG4gICAgICBvdXRlckJvdW5kYXJpZXM6IHRoaXMub3V0ZXJCb3VuZGFyaWVzLm1hcCggYm91bmRhcnkgPT4gYm91bmRhcnkuaWQgKSxcbiAgICAgIHNoYXBlSWRzOiB0aGlzLnNoYXBlSWRzLFxuICAgICAgbG9vcHM6IHRoaXMubG9vcHMubWFwKCBsb29wID0+IGxvb3Auc2VyaWFsaXplKCkgKSxcbiAgICAgIHVuYm91bmRlZEZhY2U6IHRoaXMudW5ib3VuZGVkRmFjZS5pZCxcbiAgICAgIGZhY2VzOiB0aGlzLmZhY2VzLm1hcCggZmFjZSA9PiBmYWNlLnNlcmlhbGl6ZSgpIClcbiAgICB9O1xuICB9XG5cbiAgLyoqXG4gICAqIFJlY3JlYXRlIGEgR3JhcGggYmFzZWQgb24gc2VyaWFsaXplZCBzdGF0ZSBmcm9tIHNlcmlhbGl6ZSgpXG4gICAqIEBwdWJsaWNcbiAgICpcbiAgICogQHBhcmFtIHtPYmplY3R9IG9ialxuICAgKi9cbiAgc3RhdGljIGRlc2VyaWFsaXplKCBvYmogKSB7XG4gICAgY29uc3QgZ3JhcGggPSBuZXcgR3JhcGgoKTtcblxuICAgIGNvbnN0IHZlcnRleE1hcCA9IHt9O1xuICAgIGNvbnN0IGVkZ2VNYXAgPSB7fTtcbiAgICBjb25zdCBoYWxmRWRnZU1hcCA9IHt9O1xuICAgIGNvbnN0IGJvdW5kYXJ5TWFwID0ge307XG4gICAgY29uc3QgbG9vcE1hcCA9IHt9O1xuICAgIGNvbnN0IGZhY2VNYXAgPSB7fTtcblxuICAgIGdyYXBoLnZlcnRpY2VzID0gb2JqLnZlcnRpY2VzLm1hcCggZGF0YSA9PiB7XG4gICAgICBjb25zdCB2ZXJ0ZXggPSBuZXcgVmVydGV4KCBWZWN0b3IyLlZlY3RvcjJJTy5mcm9tU3RhdGVPYmplY3QoIGRhdGEucG9pbnQgKSApO1xuICAgICAgdmVydGV4TWFwWyBkYXRhLmlkIF0gPSB2ZXJ0ZXg7XG4gICAgICAvLyBpbmNpZGVudEhhbGZFZGdlcyBjb25uZWN0ZWQgYmVsb3dcbiAgICAgIHZlcnRleC52aXNpdGVkID0gZGF0YS52aXNpdGVkO1xuICAgICAgdmVydGV4LnZpc2l0SW5kZXggPSBkYXRhLnZpc2l0SW5kZXg7XG4gICAgICB2ZXJ0ZXgubG93SW5kZXggPSBkYXRhLmxvd0luZGV4O1xuICAgICAgcmV0dXJuIHZlcnRleDtcbiAgICB9ICk7XG5cbiAgICBncmFwaC5lZGdlcyA9IG9iai5lZGdlcy5tYXAoIGRhdGEgPT4ge1xuICAgICAgY29uc3QgZWRnZSA9IG5ldyBFZGdlKCBTZWdtZW50LmRlc2VyaWFsaXplKCBkYXRhLnNlZ21lbnQgKSwgdmVydGV4TWFwWyBkYXRhLnN0YXJ0VmVydGV4IF0sIHZlcnRleE1hcFsgZGF0YS5lbmRWZXJ0ZXggXSApO1xuICAgICAgZWRnZU1hcFsgZGF0YS5pZCBdID0gZWRnZTtcbiAgICAgIGVkZ2Uuc2lnbmVkQXJlYUZyYWdtZW50ID0gZGF0YS5zaWduZWRBcmVhRnJhZ21lbnQ7XG5cbiAgICAgIGNvbnN0IGRlc2VyaWFsaXplSGFsZkVkZ2UgPSAoIGhhbGZFZGdlLCBoYWxmRWRnZURhdGEgKSA9PiB7XG4gICAgICAgIGhhbGZFZGdlTWFwWyBoYWxmRWRnZURhdGEuaWQgXSA9IGhhbGZFZGdlO1xuICAgICAgICAvLyBmYWNlIGNvbm5lY3RlZCBsYXRlclxuICAgICAgICBoYWxmRWRnZS5pc1JldmVyc2VkID0gaGFsZkVkZ2VEYXRhLmlzUmV2ZXJzZWQ7XG4gICAgICAgIGhhbGZFZGdlLnNpZ25lZEFyZWFGcmFnbWVudCA9IGhhbGZFZGdlRGF0YS5zaWduZWRBcmVhRnJhZ21lbnQ7XG4gICAgICAgIGhhbGZFZGdlLnN0YXJ0VmVydGV4ID0gdmVydGV4TWFwWyBoYWxmRWRnZURhdGEuc3RhcnRWZXJ0ZXguaWQgXTtcbiAgICAgICAgaGFsZkVkZ2UuZW5kVmVydGV4ID0gdmVydGV4TWFwWyBoYWxmRWRnZURhdGEuZW5kVmVydGV4LmlkIF07XG4gICAgICAgIGhhbGZFZGdlLnNvcnRWZWN0b3IgPSBWZWN0b3IyLlZlY3RvcjJJTy5mcm9tU3RhdGVPYmplY3QoIGhhbGZFZGdlRGF0YS5zb3J0VmVjdG9yICk7XG4gICAgICAgIGhhbGZFZGdlLmRhdGEgPSBoYWxmRWRnZURhdGEuZGF0YTtcbiAgICAgIH07XG4gICAgICBkZXNlcmlhbGl6ZUhhbGZFZGdlKCBlZGdlLmZvcndhcmRIYWxmLCBkYXRhLmZvcndhcmRIYWxmICk7XG4gICAgICBkZXNlcmlhbGl6ZUhhbGZFZGdlKCBlZGdlLnJldmVyc2VkSGFsZiwgZGF0YS5yZXZlcnNlZEhhbGYgKTtcblxuICAgICAgZWRnZS52aXNpdGVkID0gZGF0YS52aXNpdGVkO1xuICAgICAgZWRnZS5kYXRhID0gZGF0YS5kYXRhO1xuICAgICAgcmV0dXJuIGVkZ2U7XG4gICAgfSApO1xuXG4gICAgLy8gQ29ubmVjdCBWZXJ0ZXggaW5jaWRlbnRIYWxmRWRnZXNcbiAgICBvYmoudmVydGljZXMuZm9yRWFjaCggKCBkYXRhLCBpICkgPT4ge1xuICAgICAgY29uc3QgdmVydGV4ID0gZ3JhcGgudmVydGljZXNbIGkgXTtcbiAgICAgIHZlcnRleC5pbmNpZGVudEhhbGZFZGdlcyA9IGRhdGEuaW5jaWRlbnRIYWxmRWRnZXMubWFwKCBpZCA9PiBoYWxmRWRnZU1hcFsgaWQgXSApO1xuICAgIH0gKTtcblxuICAgIGdyYXBoLmJvdW5kYXJpZXMgPSBvYmouYm91bmRhcmllcy5tYXAoIGRhdGEgPT4ge1xuICAgICAgY29uc3QgYm91bmRhcnkgPSBCb3VuZGFyeS5wb29sLmNyZWF0ZSggZGF0YS5oYWxmRWRnZXMubWFwKCBpZCA9PiBoYWxmRWRnZU1hcFsgaWQgXSApICk7XG4gICAgICBib3VuZGFyeU1hcFsgZGF0YS5pZCBdID0gYm91bmRhcnk7XG4gICAgICBib3VuZGFyeS5zaWduZWRBcmVhID0gZGF0YS5zaWduZWRBcmVhO1xuICAgICAgYm91bmRhcnkuYm91bmRzID0gQm91bmRzMi5Cb3VuZHMySU8uZnJvbVN0YXRlT2JqZWN0KCBkYXRhLmJvdW5kcyApO1xuICAgICAgLy8gY2hpbGRCb3VuZGFyaWVzIGhhbmRsZWQgYmVsb3dcbiAgICAgIHJldHVybiBib3VuZGFyeTtcbiAgICB9ICk7XG4gICAgb2JqLmJvdW5kYXJpZXMuZm9yRWFjaCggKCBkYXRhLCBpICkgPT4ge1xuICAgICAgY29uc3QgYm91bmRhcnkgPSBncmFwaC5ib3VuZGFyaWVzWyBpIF07XG4gICAgICBib3VuZGFyeS5jaGlsZEJvdW5kYXJpZXMgPSBkYXRhLmNoaWxkQm91bmRhcmllcy5tYXAoIGlkID0+IGJvdW5kYXJ5TWFwWyBpZCBdICk7XG4gICAgfSApO1xuICAgIGdyYXBoLmlubmVyQm91bmRhcmllcyA9IG9iai5pbm5lckJvdW5kYXJpZXMubWFwKCBpZCA9PiBib3VuZGFyeU1hcFsgaWQgXSApO1xuICAgIGdyYXBoLm91dGVyQm91bmRhcmllcyA9IG9iai5vdXRlckJvdW5kYXJpZXMubWFwKCBpZCA9PiBib3VuZGFyeU1hcFsgaWQgXSApO1xuXG4gICAgZ3JhcGguc2hhcGVJZHMgPSBvYmouc2hhcGVJZHM7XG5cbiAgICBncmFwaC5sb29wcyA9IG9iai5sb29wcy5tYXAoIGRhdGEgPT4ge1xuICAgICAgY29uc3QgbG9vcCA9IG5ldyBMb29wKCBkYXRhLnNoYXBlSWQsIGRhdGEuY2xvc2VkICk7XG4gICAgICBsb29wTWFwWyBkYXRhLmlkIF0gPSBsb29wO1xuICAgICAgbG9vcC5oYWxmRWRnZXMgPSBkYXRhLmhhbGZFZGdlcy5tYXAoIGlkID0+IGhhbGZFZGdlTWFwWyBpZCBdICk7XG4gICAgICByZXR1cm4gbG9vcDtcbiAgICB9ICk7XG5cbiAgICBncmFwaC5mYWNlcyA9IG9iai5mYWNlcy5tYXAoICggZGF0YSwgaSApID0+IHtcbiAgICAgIGNvbnN0IGZhY2UgPSBpID09PSAwID8gZ3JhcGgudW5ib3VuZGVkRmFjZSA6IG5ldyBGYWNlKCBib3VuZGFyeU1hcFsgZGF0YS5ib3VuZGFyeSBdICk7XG4gICAgICBmYWNlTWFwWyBkYXRhLmlkIF0gPSBmYWNlO1xuICAgICAgZmFjZS5ob2xlcyA9IGRhdGEuaG9sZXMubWFwKCBpZCA9PiBib3VuZGFyeU1hcFsgaWQgXSApO1xuICAgICAgZmFjZS53aW5kaW5nTWFwID0gZGF0YS53aW5kaW5nTWFwO1xuICAgICAgZmFjZS5maWxsZWQgPSBkYXRhLmZpbGxlZDtcbiAgICAgIHJldHVybiBmYWNlO1xuICAgIH0gKTtcblxuICAgIC8vIENvbm5lY3RlZCBmYWNlcyB0byBoYWxmRWRnZXNcbiAgICBvYmouZWRnZXMuZm9yRWFjaCggKCBkYXRhLCBpICkgPT4ge1xuICAgICAgY29uc3QgZWRnZSA9IGdyYXBoLmVkZ2VzWyBpIF07XG4gICAgICBlZGdlLmZvcndhcmRIYWxmLmZhY2UgPSBkYXRhLmZvcndhcmRIYWxmLmZhY2UgPT09IG51bGwgPyBudWxsIDogZmFjZU1hcFsgZGF0YS5mb3J3YXJkSGFsZi5mYWNlIF07XG4gICAgICBlZGdlLnJldmVyc2VkSGFsZi5mYWNlID0gZGF0YS5yZXZlcnNlZEhhbGYuZmFjZSA9PT0gbnVsbCA/IG51bGwgOiBmYWNlTWFwWyBkYXRhLnJldmVyc2VkSGFsZi5mYWNlIF07XG4gICAgfSApO1xuXG4gICAgcmV0dXJuIGdyYXBoO1xuICB9XG5cbiAgLyoqXG4gICAqIEFkZHMgYSBTaGFwZSAod2l0aCBhIGdpdmVuIElEIGZvciBDQUcgcHVycG9zZXMpIHRvIHRoZSBncmFwaC5cbiAgICogQHB1YmxpY1xuICAgKlxuICAgKiBAcGFyYW0ge251bWJlcn0gc2hhcGVJZCAtIFRoZSBJRCB3aGljaCBzaG91bGQgYmUgc2hhcmVkIGZvciBhbGwgcGF0aHMvc2hhcGVzIHRoYXQgc2hvdWxkIGJlIGNvbWJpbmVkIHdpdGhcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICByZXNwZWN0IHRvIHRoZSB3aW5kaW5nIG51bWJlciBvZiBmYWNlcy4gRm9yIENBRywgaW5kZXBlbmRlbnQgc2hhcGVzIHNob3VsZCBiZSBnaXZlblxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgIGRpZmZlcmVudCBJRHMgKHNvIHRoZXkgaGF2ZSBzZXBhcmF0ZSB3aW5kaW5nIG51bWJlcnMgcmVjb3JkZWQpLlxuICAgKiBAcGFyYW0ge1NoYXBlfSBzaGFwZVxuICAgKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnNdIC0gU2VlIGFkZFN1YnBhdGhcbiAgICovXG4gIGFkZFNoYXBlKCBzaGFwZUlkLCBzaGFwZSwgb3B0aW9ucyApIHtcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBzaGFwZS5zdWJwYXRocy5sZW5ndGg7IGkrKyApIHtcbiAgICAgIHRoaXMuYWRkU3VicGF0aCggc2hhcGVJZCwgc2hhcGUuc3VicGF0aHNbIGkgXSwgb3B0aW9ucyApO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBBZGRzIGEgc3VicGF0aCBvZiBhIFNoYXBlICh3aXRoIGEgZ2l2ZW4gSUQgZm9yIENBRyBwdXJwb3NlcykgdG8gdGhlIGdyYXBoLlxuICAgKiBAcHVibGljXG4gICAqXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBzaGFwZUlkIC0gU2VlIGFkZFNoYXBlKCkgZG9jdW1lbnRhdGlvblxuICAgKiBAcGFyYW0ge1N1YnBhdGh9IHN1YnBhdGhcbiAgICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zXVxuICAgKi9cbiAgYWRkU3VicGF0aCggc2hhcGVJZCwgc3VicGF0aCwgb3B0aW9ucyApIHtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0eXBlb2Ygc2hhcGVJZCA9PT0gJ251bWJlcicgKTtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBzdWJwYXRoIGluc3RhbmNlb2YgU3VicGF0aCApO1xuXG4gICAgb3B0aW9ucyA9IG1lcmdlKCB7XG4gICAgICBlbnN1cmVDbG9zZWQ6IHRydWVcbiAgICB9LCBvcHRpb25zICk7XG5cbiAgICAvLyBFbnN1cmUgdGhlIHNoYXBlSWQgaXMgcmVjb3JkZWRcbiAgICBpZiAoIHRoaXMuc2hhcGVJZHMuaW5kZXhPZiggc2hhcGVJZCApIDwgMCApIHtcbiAgICAgIHRoaXMuc2hhcGVJZHMucHVzaCggc2hhcGVJZCApO1xuICAgIH1cblxuICAgIGlmICggc3VicGF0aC5zZWdtZW50cy5sZW5ndGggPT09IDAgKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3QgY2xvc2VkID0gc3VicGF0aC5jbG9zZWQgfHwgb3B0aW9ucy5lbnN1cmVDbG9zZWQ7XG4gICAgY29uc3Qgc2VnbWVudHMgPSBvcHRpb25zLmVuc3VyZUNsb3NlZCA/IHN1YnBhdGguZ2V0RmlsbFNlZ21lbnRzKCkgOiBzdWJwYXRoLnNlZ21lbnRzO1xuICAgIGxldCBpbmRleDtcblxuICAgIC8vIENvbGxlY3RzIGFsbCBvZiB0aGUgdmVydGljZXNcbiAgICBjb25zdCB2ZXJ0aWNlcyA9IFtdO1xuICAgIGZvciAoIGluZGV4ID0gMDsgaW5kZXggPCBzZWdtZW50cy5sZW5ndGg7IGluZGV4KysgKSB7XG4gICAgICBsZXQgcHJldmlvdXNJbmRleCA9IGluZGV4IC0gMTtcbiAgICAgIGlmICggcHJldmlvdXNJbmRleCA8IDAgKSB7XG4gICAgICAgIHByZXZpb3VzSW5kZXggPSBzZWdtZW50cy5sZW5ndGggLSAxO1xuICAgICAgfVxuXG4gICAgICAvLyBHZXQgdGhlIGVuZCBvZiB0aGUgcHJldmlvdXMgc2VnbWVudCBhbmQgc3RhcnQgb2YgdGhlIG5leHQuIEdlbmVyYWxseSB0aGV5IHNob3VsZCBiZSBlcXVhbCBvciBhbG1vc3QgZXF1YWwsXG4gICAgICAvLyBhcyBpdCdzIHRoZSBwb2ludCBhdCB0aGUgam9pbnQgb2YgdHdvIHNlZ21lbnRzLlxuICAgICAgbGV0IGVuZCA9IHNlZ21lbnRzWyBwcmV2aW91c0luZGV4IF0uZW5kO1xuICAgICAgY29uc3Qgc3RhcnQgPSBzZWdtZW50c1sgaW5kZXggXS5zdGFydDtcblxuICAgICAgLy8gSWYgd2UgYXJlIGNyZWF0aW5nIGFuIG9wZW4gXCJsb29wXCIsIGRvbid0IGludGVycG9sYXRlIHRoZSBzdGFydC9lbmQgb2YgdGhlIGVudGlyZSBzdWJwYXRoIHRvZ2V0aGVyLlxuICAgICAgaWYgKCAhY2xvc2VkICYmIGluZGV4ID09PSAwICkge1xuICAgICAgICBlbmQgPSBzdGFydDtcbiAgICAgIH1cblxuICAgICAgLy8gSWYgdGhleSBhcmUgZXhhY3RseSBlcXVhbCwgZG9uJ3QgdGFrZSBhIGNoYW5jZSBvbiBmbG9hdGluZy1wb2ludCBhcml0aG1ldGljXG4gICAgICBpZiAoIHN0YXJ0LmVxdWFscyggZW5kICkgKSB7XG4gICAgICAgIHZlcnRpY2VzLnB1c2goIFZlcnRleC5wb29sLmNyZWF0ZSggc3RhcnQgKSApO1xuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgIGFzc2VydCAmJiBhc3NlcnQoIHN0YXJ0LmRpc3RhbmNlKCBlbmQgKSA8IDFlLTUsICdJbmFjY3VyYXRlIHN0YXJ0L2VuZCBwb2ludHMnICk7XG4gICAgICAgIHZlcnRpY2VzLnB1c2goIFZlcnRleC5wb29sLmNyZWF0ZSggc3RhcnQuYXZlcmFnZSggZW5kICkgKSApO1xuICAgICAgfVxuICAgIH1cbiAgICBpZiAoICFjbG9zZWQgKSB7XG4gICAgICAvLyBJZiB3ZSBhcmVuJ3QgY2xvc2VkLCBjcmVhdGUgYW4gXCJlbmRcIiB2ZXJ0ZXggc2luY2UgaXQgbWF5IGJlIGRpZmZlcmVudCBmcm9tIHRoZSBcInN0YXJ0XCJcbiAgICAgIHZlcnRpY2VzLnB1c2goIFZlcnRleC5wb29sLmNyZWF0ZSggc2VnbWVudHNbIHNlZ21lbnRzLmxlbmd0aCAtIDEgXS5lbmQgKSApO1xuICAgIH1cblxuICAgIC8vIENyZWF0ZSB0aGUgbG9vcCBvYmplY3QgZnJvbSB0aGUgdmVydGljZXMsIGZpbGxpbmcgaW4gZWRnZXNcbiAgICBjb25zdCBsb29wID0gTG9vcC5wb29sLmNyZWF0ZSggc2hhcGVJZCwgY2xvc2VkICk7XG4gICAgZm9yICggaW5kZXggPSAwOyBpbmRleCA8IHNlZ21lbnRzLmxlbmd0aDsgaW5kZXgrKyApIHtcbiAgICAgIGxldCBuZXh0SW5kZXggPSBpbmRleCArIDE7XG4gICAgICBpZiAoIGNsb3NlZCAmJiBuZXh0SW5kZXggPT09IHNlZ21lbnRzLmxlbmd0aCApIHtcbiAgICAgICAgbmV4dEluZGV4ID0gMDtcbiAgICAgIH1cblxuICAgICAgY29uc3QgZWRnZSA9IEVkZ2UucG9vbC5jcmVhdGUoIHNlZ21lbnRzWyBpbmRleCBdLCB2ZXJ0aWNlc1sgaW5kZXggXSwgdmVydGljZXNbIG5leHRJbmRleCBdICk7XG4gICAgICBsb29wLmhhbGZFZGdlcy5wdXNoKCBlZGdlLmZvcndhcmRIYWxmICk7XG4gICAgICB0aGlzLmFkZEVkZ2UoIGVkZ2UgKTtcbiAgICB9XG5cbiAgICB0aGlzLmxvb3BzLnB1c2goIGxvb3AgKTtcbiAgICB0aGlzLnZlcnRpY2VzLnB1c2goIC4uLnZlcnRpY2VzICk7XG4gIH1cblxuICAvKipcbiAgICogU2ltcGxpZmllcyBlZGdlcy92ZXJ0aWNlcywgY29tcHV0ZXMgYm91bmRhcmllcyBhbmQgZmFjZXMgKHdpdGggdGhlIHdpbmRpbmcgbWFwKS5cbiAgICogQHB1YmxpY1xuICAgKi9cbiAgY29tcHV0ZVNpbXBsaWZpZWRGYWNlcygpIHtcbiAgICAvLyBCZWZvcmUgd2UgZmluZCBhbnkgaW50ZXJzZWN0aW9ucyAoc2VsZi1pbnRlcnNlY3Rpb24gb3IgYmV0d2VlbiBlZGdlcyksIHdlJ2xsIHdhbnQgdG8gaWRlbnRpZnkgYW5kIGZpeCB1cFxuICAgIC8vIGFueSBjYXNlcyB3aGVyZSB0aGVyZSBhcmUgYW4gaW5maW5pdGUgbnVtYmVyIG9mIGludGVyc2VjdGlvbnMgYmV0d2VlbiBlZGdlcyAodGhleSBhcmUgY29udGludW91c2x5XG4gICAgLy8gb3ZlcmxhcHBpbmcpLiBGb3IgYW55IG92ZXJsYXAsIHdlJ2xsIHNwbGl0IGl0IGludG8gb25lIFwib3ZlcmxhcFwiIGVkZ2UgYW5kIGFueSByZW1haW5pbmcgZWRnZXMuIEFmdGVyIHRoaXNcbiAgICAvLyBwcm9jZXNzLCB0aGVyZSBzaG91bGQgYmUgbm8gY29udGludW91cyBvdmVybGFwcy5cbiAgICB0aGlzLmVsaW1pbmF0ZU92ZXJsYXAoKTtcblxuICAgIC8vIERldGVjdHMgYW55IGVkZ2Ugc2VsZi1pbnRlcnNlY3Rpb24sIGFuZCBzcGxpdHMgaXQgaW50byBtdWx0aXBsZSBlZGdlcy4gVGhpcyBjdXJyZW50bHkgaGFwcGVucyB3aXRoIGN1YmljcyBvbmx5LFxuICAgIC8vIGJ1dCBuZWVkcyB0byBiZSBkb25lIGJlZm9yZSB3ZSBpbnRlcnNlY3QgdGhvc2UgY3ViaWNzIHdpdGggYW55IG90aGVyIGVkZ2VzLlxuICAgIHRoaXMuZWxpbWluYXRlU2VsZkludGVyc2VjdGlvbigpO1xuXG4gICAgLy8gRmluZCBpbnRlci1lZGdlIGludGVyc2VjdGlvbnMgKHRoYXQgYXJlbid0IGF0IGVuZHBvaW50cykuIFNwbGl0cyBlZGdlcyBpbnZvbHZlZCBpbnRvIHRoZSBpbnRlcnNlY3Rpb24uIEFmdGVyXG4gICAgLy8gdGhpcyBwYXNzLCB3ZSBzaG91bGQgaGF2ZSBhIHdlbGwtZGVmaW5lZCBncmFwaCB3aGVyZSBpbiB0aGUgcGxhbmFyIGVtYmVkZGluZyBlZGdlcyBkb24ndCBpbnRlcnNlY3Qgb3Igb3ZlcmxhcC5cbiAgICB0aGlzLmVsaW1pbmF0ZUludGVyc2VjdGlvbigpO1xuXG4gICAgLy8gRnJvbSB0aGUgYWJvdmUgcHJvY2VzcyAoYW5kIGlucHV0KSwgd2UgbWF5IGhhdmUgbXVsdGlwbGUgdmVydGljZXMgdGhhdCBvY2N1cHkgZXNzZW50aWFsbHkgdGhlIHNhbWUgbG9jYXRpb24uXG4gICAgLy8gVGhlc2UgdmVydGljZXMgZ2V0IGNvbWJpbmVkIGludG8gb25lIHZlcnRleCBpbiB0aGUgbG9jYXRpb24uIElmIHRoZXJlIHdhcyBhIG1vc3RseS1kZWdlbmVyYXRlIGVkZ2UgdGhhdCB3YXNcbiAgICAvLyB2ZXJ5IHNtYWxsIGJldHdlZW4gZWRnZXMsIGl0IHdpbGwgYmUgcmVtb3ZlZC5cbiAgICB0aGlzLmNvbGxhcHNlVmVydGljZXMoKTtcblxuICAgIC8vIE91ciBncmFwaCBjYW4gZW5kIHVwIHdpdGggZWRnZXMgdGhhdCB3b3VsZCBoYXZlIHRoZSBzYW1lIGZhY2Ugb24gYm90aCBzaWRlcyAoYXJlIGNvbnNpZGVyZWQgYSBcImJyaWRnZVwiIGVkZ2UpLlxuICAgIC8vIFRoZXNlIG5lZWQgdG8gYmUgcmVtb3ZlZCwgc28gdGhhdCBvdXIgZmFjZSBoYW5kbGluZyBsb2dpYyBkb2Vzbid0IGhhdmUgdG8gaGFuZGxlIGFub3RoZXIgY2xhc3Mgb2YgY2FzZXMuXG4gICAgdGhpcy5yZW1vdmVCcmlkZ2VzKCk7XG5cbiAgICAvLyBWZXJ0aWNlcyBjYW4gYmUgbGVmdCBvdmVyIHdoZXJlIHRoZXkgaGF2ZSBsZXNzIHRoYW4gMiBpbmNpZGVudCBlZGdlcywgYW5kIHRoZXkgY2FuIGJlIHNhZmVseSByZW1vdmVkIChzaW5jZVxuICAgIC8vIHRoZXkgd29uJ3QgY29udHJpYnV0ZSB0byB0aGUgYXJlYSBvdXRwdXQpLlxuICAgIHRoaXMucmVtb3ZlTG93T3JkZXJWZXJ0aWNlcygpO1xuXG4gICAgLy8gLy8gVE9ETzogV2h5IGRvZXMgdGhpcyByZXNvbHZlIHNvbWUgdGhpbmdzPyBJdCBzZWVtcyBsaWtlIGl0IHNob3VsZCBiZSB1bm5lY2Vzc2FyeS4gaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2tpdGUvaXNzdWVzLzk4XG4gICAgLy8gdGhpcy5lbGltaW5hdGVJbnRlcnNlY3Rpb24oKTtcbiAgICAvLyB0aGlzLmNvbGxhcHNlVmVydGljZXMoKTtcbiAgICAvLyB0aGlzLnJlbW92ZUJyaWRnZXMoKTtcbiAgICAvLyB0aGlzLnJlbW92ZUxvd09yZGVyVmVydGljZXMoKTtcblxuICAgIC8vIE5vdyB0aGF0IHRoZSBncmFwaCBoYXMgd2VsbC1kZWZpbmVkIHZlcnRpY2VzIGFuZCBlZGdlcyAoMi1lZGdlLWNvbm5lY3RlZCwgbm9ub3ZlcmxhcHBpbmcpLCB3ZSdsbCB3YW50IHRvIGtub3dcbiAgICAvLyB0aGUgb3JkZXIgb2YgZWRnZXMgYXJvdW5kIGEgdmVydGV4IChpZiB5b3Ugcm90YXRlIGFyb3VuZCBhIHZlcnRleCwgd2hhdCBlZGdlcyBhcmUgaW4gd2hhdCBvcmRlcj8pLlxuICAgIHRoaXMub3JkZXJWZXJ0ZXhFZGdlcygpO1xuXG4gICAgLy8gRXh0cmFjdHMgYm91bmRhcmllcyBhbmQgZmFjZXMsIGJ5IGZvbGxvd2luZyBlYWNoIGhhbGYtZWRnZSBjb3VudGVyLWNsb2Nrd2lzZSwgYW5kIGZhY2VzIGFyZSBjcmVhdGVkIGZvclxuICAgIC8vIGJvdW5kYXJpZXMgdGhhdCBoYXZlIHBvc2l0aXZlIHNpZ25lZCBhcmVhLlxuICAgIHRoaXMuZXh0cmFjdEZhY2VzKCk7XG5cbiAgICAvLyBXZSBuZWVkIHRvIGRldGVybWluZSB3aGljaCBib3VuZGFyaWVzIGFyZSBob2xlcyBmb3IgZWFjaCBmYWNlLiBUaGlzIGNyZWF0ZXMgYSBcImJvdW5kYXJ5IHRyZWVcIiB3aGVyZSB0aGUgbm9kZXNcbiAgICAvLyBhcmUgYm91bmRhcmllcy4gQWxsIGNvbm5lY3RlZCBjb21wb25lbnRzIHNob3VsZCBiZSBvbmUgZmFjZSBhbmQgaXRzIGhvbGVzLiBUaGUgaG9sZXMgZ2V0IHN0b3JlZCBvbiB0aGVcbiAgICAvLyByZXNwZWN0aXZlIGZhY2UuXG4gICAgdGhpcy5jb21wdXRlQm91bmRhcnlUcmVlKCk7XG5cbiAgICAvLyBDb21wdXRlIHRoZSB3aW5kaW5nIG51bWJlcnMgb2YgZWFjaCBmYWNlIGZvciBlYWNoIHNoYXBlSWQsIHRvIGRldGVybWluZSB3aGV0aGVyIHRoZSBpbnB1dCB3b3VsZCBoYXZlIHRoYXRcbiAgICAvLyBmYWNlIFwiZmlsbGVkXCIuIEl0IHNob3VsZCB0aGVuIGJlIHJlYWR5IGZvciBmdXR1cmUgcHJvY2Vzc2luZy5cbiAgICB0aGlzLmNvbXB1dGVXaW5kaW5nTWFwKCk7XG4gIH1cblxuICAvKipcbiAgICogU2V0cyB3aGV0aGVyIGVhY2ggZmFjZSBzaG91bGQgYmUgZmlsbGVkIG9yIHVuZmlsbGVkIGJhc2VkIG9uIGEgZmlsdGVyIGZ1bmN0aW9uLlxuICAgKiBAcHVibGljXG4gICAqXG4gICAqIFRoZSB3aW5kaW5nTWFwRmlsdGVyIHdpbGwgYmUgY2FsbGVkIG9uIGVhY2ggZmFjZSdzIHdpbmRpbmcgbWFwLCBhbmQgd2lsbCB1c2UgdGhlIHJldHVybiB2YWx1ZSBhcyB3aGV0aGVyIHRoZSBmYWNlXG4gICAqIGlzIGZpbGxlZCBvciBub3QuXG4gICAqXG4gICAqIFRoZSB3aW5kaW5nIG1hcCBpcyBhbiB7T2JqZWN0fSBhc3NvY2lhdGVkIHdpdGggZWFjaCBmYWNlIHRoYXQgaGFzIGEga2V5IGZvciBldmVyeSBzaGFwZUlkIHRoYXQgd2FzIHVzZWQgaW5cbiAgICogYWRkU2hhcGUvYWRkU3VicGF0aCwgYW5kIHRoZSB2YWx1ZSBmb3IgdGhvc2Uga2V5cyBpcyB0aGUgd2luZGluZyBudW1iZXIgb2YgdGhlIGZhY2UgZ2l2ZW4gYWxsIHBhdGhzIHdpdGggdGhlXG4gICAqIHNoYXBlSWQuXG4gICAqXG4gICAqIEZvciBleGFtcGxlLCBpbWFnaW5lIHlvdSBhZGRlZCB0d28gc2hhcGVJZHMgKDAgYW5kIDEpLCBhbmQgdGhlIGl0ZXJhdGlvbiBpcyBvbiBhIGZhY2UgdGhhdCBpcyBpbmNsdWRlZCBpblxuICAgKiBvbmUgbG9vcCBzcGVjaWZpZWQgd2l0aCBzaGFwZUlkOjAgKGluc2lkZSBhIGNvdW50ZXItY2xvY2t3aXNlIGN1cnZlKSwgYW5kIGlzIG91dHNpZGUgb2YgYW55IHNlZ21lbnRzIHNwZWNpZmllZFxuICAgKiBieSB0aGUgc2Vjb25kIGxvb3AgKHNoYXBlSWQ6MSkuIFRoZW4gdGhlIHdpbmRpbmcgbWFwIHdpbGwgYmU6XG4gICAqIHtcbiAgICogICAwOiAxIC8vIHNoYXBlSWQ6MCBoYXMgYSB3aW5kaW5nIG51bWJlciBvZiAxIGZvciB0aGlzIGZhY2UgKGdlbmVyYWxseSBmaWxsZWQpXG4gICAqICAgMTogMCAvLyBzaGFwZUlkOjEgaGFzIGEgd2luZGluZyBudW1iZXIgb2YgMCBmb3IgdGhpcyBmYWNlIChnZW5lcmFsbHkgbm90IGZpbGxlZClcbiAgICogfVxuICAgKlxuICAgKiBHZW5lcmFsbHksIHdpbmRpbmcgbWFwIGZpbHRlcnMgY2FuIGJlIGJyb2tlbiBkb3duIGludG8gdHdvIHN0ZXBzOlxuICAgKiAxLiBHaXZlbiB0aGUgd2luZGluZyBudW1iZXIgZm9yIGVhY2ggc2hhcGVJZCwgY29tcHV0ZSB3aGV0aGVyIHRoYXQgbG9vcCB3YXMgb3JpZ2luYWxseSBmaWxsZWQuIE5vcm1hbGx5LCB0aGlzIGlzXG4gICAqICAgIGRvbmUgd2l0aCBhIG5vbi16ZXJvIHJ1bGUgKGFueSB3aW5kaW5nIG51bWJlciBpcyBmaWxsZWQsIGV4Y2VwdCB6ZXJvKS4gU1ZHIGFsc28gcHJvdmlkZXMgYW4gZXZlbi1vZGQgcnVsZVxuICAgKiAgICAob2RkIG51bWJlcnMgYXJlIGZpbGxlZCwgZXZlbiBudW1iZXJzIGFyZSB1bmZpbGxlZCkuXG4gICAqIDIuIEdpdmVuIGJvb2xlYW5zIGZvciBlYWNoIHNoYXBlSWQgZnJvbSBzdGVwIDEsIGNvbXB1dGUgQ0FHIG9wZXJhdGlvbnMgYmFzZWQgb24gYm9vbGVhbiBmb3JtdWxhcy4gU2F5IHlvdSB3YW50ZWRcbiAgICogICAgdG8gdGFrZSB0aGUgdW5pb24gb2Ygc2hhcGVJZHMgMCBhbmQgMSwgdGhlbiByZW1vdmUgYW55dGhpbmcgaW4gc2hhcGVJZCAyLiBHaXZlbiB0aGUgYm9vbGVhbnMgYWJvdmUsIHRoaXMgY2FuXG4gICAqICAgIGJlIGRpcmVjdGx5IGNvbXB1dGVkIGFzIChmaWxsZWQwIHx8IGZpbGxlZDEpICYmICFmaWxsZWQyLlxuICAgKlxuICAgKiBAcGFyYW0ge2Z1bmN0aW9ufSB3aW5kaW5nTWFwRmlsdGVyXG4gICAqL1xuICBjb21wdXRlRmFjZUluY2x1c2lvbiggd2luZGluZ01hcEZpbHRlciApIHtcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCB0aGlzLmZhY2VzLmxlbmd0aDsgaSsrICkge1xuICAgICAgY29uc3QgZmFjZSA9IHRoaXMuZmFjZXNbIGkgXTtcbiAgICAgIGZhY2UuZmlsbGVkID0gd2luZGluZ01hcEZpbHRlciggZmFjZS53aW5kaW5nTWFwICk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIENyZWF0ZSBhIG5ldyBHcmFwaCBvYmplY3QgYmFzZWQgb25seSBvbiBlZGdlcyBpbiB0aGlzIGdyYXBoIHRoYXQgc2VwYXJhdGUgYSBcImZpbGxlZFwiIGZhY2UgZnJvbSBhbiBcInVuZmlsbGVkXCJcbiAgICogZmFjZS5cbiAgICogQHB1YmxpY1xuICAgKlxuICAgKiBUaGlzIGlzIGEgY29udmVuaWVudCB3YXkgdG8gXCJjb2xsYXBzZVwiIGFkamFjZW50IGZpbGxlZCBhbmQgdW5maWxsZWQgZmFjZXMgdG9nZXRoZXIsIGFuZCBjb21wdXRlIHRoZSBjdXJ2ZXMgYW5kXG4gICAqIGhvbGVzIHByb3Blcmx5LCBnaXZlbiBhIGZpbGxlZCBcIm5vcm1hbFwiIGdyYXBoLlxuICAgKi9cbiAgY3JlYXRlRmlsbGVkU3ViR3JhcGgoKSB7XG4gICAgY29uc3QgZ3JhcGggPSBuZXcgR3JhcGgoKTtcblxuICAgIGNvbnN0IHZlcnRleE1hcCA9IHt9OyAvLyBvbGQgaWQgPT4gbmV3VmVydGV4XG5cbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCB0aGlzLmVkZ2VzLmxlbmd0aDsgaSsrICkge1xuICAgICAgY29uc3QgZWRnZSA9IHRoaXMuZWRnZXNbIGkgXTtcbiAgICAgIGlmICggZWRnZS5mb3J3YXJkSGFsZi5mYWNlLmZpbGxlZCAhPT0gZWRnZS5yZXZlcnNlZEhhbGYuZmFjZS5maWxsZWQgKSB7XG4gICAgICAgIGlmICggIXZlcnRleE1hcFsgZWRnZS5zdGFydFZlcnRleC5pZCBdICkge1xuICAgICAgICAgIGNvbnN0IG5ld1N0YXJ0VmVydGV4ID0gVmVydGV4LnBvb2wuY3JlYXRlKCBlZGdlLnN0YXJ0VmVydGV4LnBvaW50ICk7XG4gICAgICAgICAgZ3JhcGgudmVydGljZXMucHVzaCggbmV3U3RhcnRWZXJ0ZXggKTtcbiAgICAgICAgICB2ZXJ0ZXhNYXBbIGVkZ2Uuc3RhcnRWZXJ0ZXguaWQgXSA9IG5ld1N0YXJ0VmVydGV4O1xuICAgICAgICB9XG4gICAgICAgIGlmICggIXZlcnRleE1hcFsgZWRnZS5lbmRWZXJ0ZXguaWQgXSApIHtcbiAgICAgICAgICBjb25zdCBuZXdFbmRWZXJ0ZXggPSBWZXJ0ZXgucG9vbC5jcmVhdGUoIGVkZ2UuZW5kVmVydGV4LnBvaW50ICk7XG4gICAgICAgICAgZ3JhcGgudmVydGljZXMucHVzaCggbmV3RW5kVmVydGV4ICk7XG4gICAgICAgICAgdmVydGV4TWFwWyBlZGdlLmVuZFZlcnRleC5pZCBdID0gbmV3RW5kVmVydGV4O1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3Qgc3RhcnRWZXJ0ZXggPSB2ZXJ0ZXhNYXBbIGVkZ2Uuc3RhcnRWZXJ0ZXguaWQgXTtcbiAgICAgICAgY29uc3QgZW5kVmVydGV4ID0gdmVydGV4TWFwWyBlZGdlLmVuZFZlcnRleC5pZCBdO1xuICAgICAgICBncmFwaC5hZGRFZGdlKCBFZGdlLnBvb2wuY3JlYXRlKCBlZGdlLnNlZ21lbnQsIHN0YXJ0VmVydGV4LCBlbmRWZXJ0ZXggKSApO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIFJ1biBzb21lIG1vcmUgXCJzaW1wbGlmaWVkXCIgcHJvY2Vzc2luZyBvbiB0aGlzIGdyYXBoIHRvIGRldGVybWluZSB3aGljaCBmYWNlcyBhcmUgZmlsbGVkIChhZnRlciBzaW1wbGlmaWNhdGlvbikuXG4gICAgLy8gV2UgZG9uJ3QgbmVlZCB0aGUgaW50ZXJzZWN0aW9uIG9yIG90aGVyIHByb2Nlc3Npbmcgc3RlcHMsIHNpbmNlIHRoaXMgd2FzIGFjY29tcGxpc2hlZCAocHJlc3VtYWJseSkgYWxyZWFkeVxuICAgIC8vIGZvciB0aGUgZ2l2ZW4gZ3JhcGguXG4gICAgZ3JhcGguY29sbGFwc2VBZGphY2VudEVkZ2VzKCk7XG4gICAgZ3JhcGgub3JkZXJWZXJ0ZXhFZGdlcygpO1xuICAgIGdyYXBoLmV4dHJhY3RGYWNlcygpO1xuICAgIGdyYXBoLmNvbXB1dGVCb3VuZGFyeVRyZWUoKTtcbiAgICBncmFwaC5maWxsQWx0ZXJuYXRpbmdGYWNlcygpO1xuXG4gICAgcmV0dXJuIGdyYXBoO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgYSBTaGFwZSB0aGF0IGNyZWF0ZXMgYSBzdWJwYXRoIGZvciBlYWNoIGZpbGxlZCBmYWNlICh3aXRoIHRoZSBkZXNpcmVkIGhvbGVzKS5cbiAgICogQHB1YmxpY1xuICAgKlxuICAgKiBHZW5lcmFsbHkgc2hvdWxkIGJlIGNhbGxlZCBvbiBhIGdyYXBoIGNyZWF0ZWQgd2l0aCBjcmVhdGVGaWxsZWRTdWJHcmFwaCgpLlxuICAgKlxuICAgKiBAcmV0dXJucyB7U2hhcGV9XG4gICAqL1xuICBmYWNlc1RvU2hhcGUoKSB7XG4gICAgY29uc3Qgc3VicGF0aHMgPSBbXTtcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCB0aGlzLmZhY2VzLmxlbmd0aDsgaSsrICkge1xuICAgICAgY29uc3QgZmFjZSA9IHRoaXMuZmFjZXNbIGkgXTtcbiAgICAgIGlmICggZmFjZS5maWxsZWQgKSB7XG4gICAgICAgIHN1YnBhdGhzLnB1c2goIGZhY2UuYm91bmRhcnkudG9TdWJwYXRoKCkgKTtcbiAgICAgICAgZm9yICggbGV0IGogPSAwOyBqIDwgZmFjZS5ob2xlcy5sZW5ndGg7IGorKyApIHtcbiAgICAgICAgICBzdWJwYXRocy5wdXNoKCBmYWNlLmhvbGVzWyBqIF0udG9TdWJwYXRoKCkgKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gbmV3IGtpdGUuU2hhcGUoIHN1YnBhdGhzICk7XG4gIH1cblxuICAvKipcbiAgICogUmVsZWFzZXMgb3duZWQgb2JqZWN0cyB0byB0aGVpciBwb29scywgYW5kIGNsZWFycyByZWZlcmVuY2VzIHRoYXQgbWF5IGhhdmUgYmVlbiBwaWNrZWQgdXAgZnJvbSBleHRlcm5hbCBzb3VyY2VzLlxuICAgKiBAcHVibGljXG4gICAqL1xuICBkaXNwb3NlKCkge1xuXG4gICAgLy8gdGhpcy5ib3VuZGFyaWVzIHNob3VsZCBjb250YWluIGFsbCBlbGVtZW50cyBvZiBpbm5lckJvdW5kYXJpZXMgYW5kIG91dGVyQm91bmRhcmllc1xuICAgIHdoaWxlICggdGhpcy5ib3VuZGFyaWVzLmxlbmd0aCApIHtcbiAgICAgIHRoaXMuYm91bmRhcmllcy5wb3AoKS5kaXNwb3NlKCk7XG4gICAgfVxuICAgIGNsZWFuQXJyYXkoIHRoaXMuaW5uZXJCb3VuZGFyaWVzICk7XG4gICAgY2xlYW5BcnJheSggdGhpcy5vdXRlckJvdW5kYXJpZXMgKTtcblxuICAgIHdoaWxlICggdGhpcy5sb29wcy5sZW5ndGggKSB7XG4gICAgICB0aGlzLmxvb3BzLnBvcCgpLmRpc3Bvc2UoKTtcbiAgICB9XG4gICAgd2hpbGUgKCB0aGlzLmZhY2VzLmxlbmd0aCApIHtcbiAgICAgIHRoaXMuZmFjZXMucG9wKCkuZGlzcG9zZSgpO1xuICAgIH1cbiAgICB3aGlsZSAoIHRoaXMudmVydGljZXMubGVuZ3RoICkge1xuICAgICAgdGhpcy52ZXJ0aWNlcy5wb3AoKS5kaXNwb3NlKCk7XG4gICAgfVxuICAgIHdoaWxlICggdGhpcy5lZGdlcy5sZW5ndGggKSB7XG4gICAgICB0aGlzLmVkZ2VzLnBvcCgpLmRpc3Bvc2UoKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQWRkcyBhbiBlZGdlIHRvIHRoZSBncmFwaCAoYW5kIHNldHMgdXAgY29ubmVjdGlvbiBpbmZvcm1hdGlvbikuXG4gICAqIEBwcml2YXRlXG4gICAqXG4gICAqIEBwYXJhbSB7RWRnZX0gZWRnZVxuICAgKi9cbiAgYWRkRWRnZSggZWRnZSApIHtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBlZGdlIGluc3RhbmNlb2YgRWRnZSApO1xuICAgIGFzc2VydCAmJiBhc3NlcnQoICFfLmluY2x1ZGVzKCBlZGdlLnN0YXJ0VmVydGV4LmluY2lkZW50SGFsZkVkZ2VzLCBlZGdlLnJldmVyc2VkSGFsZiApLCAnU2hvdWxkIG5vdCBhbHJlYWR5IGJlIGNvbm5lY3RlZCcgKTtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCAhXy5pbmNsdWRlcyggZWRnZS5lbmRWZXJ0ZXguaW5jaWRlbnRIYWxmRWRnZXMsIGVkZ2UuZm9yd2FyZEhhbGYgKSwgJ1Nob3VsZCBub3QgYWxyZWFkeSBiZSBjb25uZWN0ZWQnICk7XG5cbiAgICB0aGlzLmVkZ2VzLnB1c2goIGVkZ2UgKTtcbiAgICBlZGdlLnN0YXJ0VmVydGV4LmluY2lkZW50SGFsZkVkZ2VzLnB1c2goIGVkZ2UucmV2ZXJzZWRIYWxmICk7XG4gICAgZWRnZS5lbmRWZXJ0ZXguaW5jaWRlbnRIYWxmRWRnZXMucHVzaCggZWRnZS5mb3J3YXJkSGFsZiApO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlbW92ZXMgYW4gZWRnZSBmcm9tIHRoZSBncmFwaCAoYW5kIGRpc2Nvbm5lY3RzIGluY2lkZW50IGluZm9ybWF0aW9uKS5cbiAgICogQHByaXZhdGVcbiAgICpcbiAgICogQHBhcmFtIHtFZGdlfSBlZGdlXG4gICAqL1xuICByZW1vdmVFZGdlKCBlZGdlICkge1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIGVkZ2UgaW5zdGFuY2VvZiBFZGdlICk7XG5cbiAgICBhcnJheVJlbW92ZSggdGhpcy5lZGdlcywgZWRnZSApO1xuICAgIGFycmF5UmVtb3ZlKCBlZGdlLnN0YXJ0VmVydGV4LmluY2lkZW50SGFsZkVkZ2VzLCBlZGdlLnJldmVyc2VkSGFsZiApO1xuICAgIGFycmF5UmVtb3ZlKCBlZGdlLmVuZFZlcnRleC5pbmNpZGVudEhhbGZFZGdlcywgZWRnZS5mb3J3YXJkSGFsZiApO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlcGxhY2VzIGEgc2luZ2xlIGVkZ2UgKGluIGxvb3BzKSB3aXRoIGEgc2VyaWVzIG9mIGVkZ2VzIChwb3NzaWJseSBlbXB0eSkuXG4gICAqIEBwcml2YXRlXG4gICAqXG4gICAqIEBwYXJhbSB7RWRnZX0gZWRnZVxuICAgKiBAcGFyYW0ge0FycmF5LjxIYWxmRWRnZT59IGZvcndhcmRIYWxmRWRnZXNcbiAgICovXG4gIHJlcGxhY2VFZGdlSW5Mb29wcyggZWRnZSwgZm9yd2FyZEhhbGZFZGdlcyApIHtcbiAgICAvLyBDb21wdXRlIHJldmVyc2VkIGhhbGYtZWRnZXNcbiAgICBjb25zdCByZXZlcnNlZEhhbGZFZGdlcyA9IFtdO1xuICAgIGZvciAoIGxldCBpID0gMDsgaSA8IGZvcndhcmRIYWxmRWRnZXMubGVuZ3RoOyBpKysgKSB7XG4gICAgICByZXZlcnNlZEhhbGZFZGdlcy5wdXNoKCBmb3J3YXJkSGFsZkVkZ2VzWyBmb3J3YXJkSGFsZkVkZ2VzLmxlbmd0aCAtIDEgLSBpIF0uZ2V0UmV2ZXJzZWQoKSApO1xuICAgIH1cblxuICAgIGZvciAoIGxldCBpID0gMDsgaSA8IHRoaXMubG9vcHMubGVuZ3RoOyBpKysgKSB7XG4gICAgICBjb25zdCBsb29wID0gdGhpcy5sb29wc1sgaSBdO1xuXG4gICAgICBmb3IgKCBsZXQgaiA9IGxvb3AuaGFsZkVkZ2VzLmxlbmd0aCAtIDE7IGogPj0gMDsgai0tICkge1xuICAgICAgICBjb25zdCBoYWxmRWRnZSA9IGxvb3AuaGFsZkVkZ2VzWyBqIF07XG5cbiAgICAgICAgaWYgKCBoYWxmRWRnZS5lZGdlID09PSBlZGdlICkge1xuICAgICAgICAgIGNvbnN0IHJlcGxhY2VtZW50SGFsZkVkZ2VzID0gaGFsZkVkZ2UgPT09IGVkZ2UuZm9yd2FyZEhhbGYgPyBmb3J3YXJkSGFsZkVkZ2VzIDogcmV2ZXJzZWRIYWxmRWRnZXM7XG4gICAgICAgICAgQXJyYXkucHJvdG90eXBlLnNwbGljZS5hcHBseSggbG9vcC5oYWxmRWRnZXMsIFsgaiwgMSBdLmNvbmNhdCggcmVwbGFjZW1lbnRIYWxmRWRnZXMgKSApO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFRyaWVzIHRvIGNvbWJpbmUgYWRqYWNlbnQgZWRnZXMgKHdpdGggYSAyLW9yZGVyIHZlcnRleCkgaW50byBvbmUgZWRnZSB3aGVyZSBwb3NzaWJsZS5cbiAgICogQHByaXZhdGVcbiAgICpcbiAgICogVGhpcyBoZWxwcyB0byBjb21iaW5lIHRoaW5ncyBsaWtlIGNvbGxpbmVhciBsaW5lcywgd2hlcmUgdGhlcmUncyBhIHZlcnRleCB0aGF0IGNhbiBiYXNpY2FsbHkgYmUgcmVtb3ZlZC5cbiAgICovXG4gIGNvbGxhcHNlQWRqYWNlbnRFZGdlcygpIHtcbiAgICBsZXQgbmVlZHNMb29wID0gdHJ1ZTtcbiAgICB3aGlsZSAoIG5lZWRzTG9vcCApIHtcbiAgICAgIG5lZWRzTG9vcCA9IGZhbHNlO1xuXG4gICAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCB0aGlzLnZlcnRpY2VzLmxlbmd0aDsgaSsrICkge1xuICAgICAgICBjb25zdCB2ZXJ0ZXggPSB0aGlzLnZlcnRpY2VzWyBpIF07XG4gICAgICAgIGlmICggdmVydGV4LmluY2lkZW50SGFsZkVkZ2VzLmxlbmd0aCA9PT0gMiApIHtcbiAgICAgICAgICBjb25zdCBhRWRnZSA9IHZlcnRleC5pbmNpZGVudEhhbGZFZGdlc1sgMCBdLmVkZ2U7XG4gICAgICAgICAgY29uc3QgYkVkZ2UgPSB2ZXJ0ZXguaW5jaWRlbnRIYWxmRWRnZXNbIDEgXS5lZGdlO1xuICAgICAgICAgIGxldCBhU2VnbWVudCA9IGFFZGdlLnNlZ21lbnQ7XG4gICAgICAgICAgbGV0IGJTZWdtZW50ID0gYkVkZ2Uuc2VnbWVudDtcbiAgICAgICAgICBjb25zdCBhVmVydGV4ID0gYUVkZ2UuZ2V0T3RoZXJWZXJ0ZXgoIHZlcnRleCApO1xuICAgICAgICAgIGNvbnN0IGJWZXJ0ZXggPSBiRWRnZS5nZXRPdGhlclZlcnRleCggdmVydGV4ICk7XG5cbiAgICAgICAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0aGlzLmxvb3BzLmxlbmd0aCA9PT0gMCApO1xuXG4gICAgICAgICAgLy8gVE9ETzogQ2FuIHdlIGF2b2lkIHRoaXMgaW4gdGhlIGlubmVyIGxvb3A/IGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9raXRlL2lzc3Vlcy83NlxuICAgICAgICAgIGlmICggYUVkZ2Uuc3RhcnRWZXJ0ZXggPT09IHZlcnRleCApIHtcbiAgICAgICAgICAgIGFTZWdtZW50ID0gYVNlZ21lbnQucmV2ZXJzZWQoKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKCBiRWRnZS5lbmRWZXJ0ZXggPT09IHZlcnRleCApIHtcbiAgICAgICAgICAgIGJTZWdtZW50ID0gYlNlZ21lbnQucmV2ZXJzZWQoKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAoIGFTZWdtZW50IGluc3RhbmNlb2YgTGluZSAmJiBiU2VnbWVudCBpbnN0YW5jZW9mIExpbmUgKSB7XG4gICAgICAgICAgICAvLyBTZWUgaWYgdGhlIGxpbmVzIGFyZSBjb2xsaW5lYXIsIHNvIHRoYXQgd2UgY2FuIGNvbWJpbmUgdGhlbSBpbnRvIG9uZSBlZGdlXG4gICAgICAgICAgICBpZiAoIGFTZWdtZW50LnRhbmdlbnRBdCggMCApLm5vcm1hbGl6ZWQoKS5kaXN0YW5jZSggYlNlZ21lbnQudGFuZ2VudEF0KCAwICkubm9ybWFsaXplZCgpICkgPCAxZS02ICkge1xuICAgICAgICAgICAgICB0aGlzLnJlbW92ZUVkZ2UoIGFFZGdlICk7XG4gICAgICAgICAgICAgIHRoaXMucmVtb3ZlRWRnZSggYkVkZ2UgKTtcbiAgICAgICAgICAgICAgYUVkZ2UuZGlzcG9zZSgpO1xuICAgICAgICAgICAgICBiRWRnZS5kaXNwb3NlKCk7XG4gICAgICAgICAgICAgIGFycmF5UmVtb3ZlKCB0aGlzLnZlcnRpY2VzLCB2ZXJ0ZXggKTtcbiAgICAgICAgICAgICAgdmVydGV4LmRpc3Bvc2UoKTtcblxuICAgICAgICAgICAgICBjb25zdCBuZXdTZWdtZW50ID0gbmV3IExpbmUoIGFWZXJ0ZXgucG9pbnQsIGJWZXJ0ZXgucG9pbnQgKTtcbiAgICAgICAgICAgICAgdGhpcy5hZGRFZGdlKCBuZXcgRWRnZSggbmV3U2VnbWVudCwgYVZlcnRleCwgYlZlcnRleCApICk7XG5cbiAgICAgICAgICAgICAgbmVlZHNMb29wID0gdHJ1ZTtcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEdldHMgcmlkIG9mIG92ZXJsYXBwaW5nIHNlZ21lbnRzIGJ5IGNvbWJpbmluZyBvdmVybGFwcyBpbnRvIGEgc2hhcmVkIGVkZ2UuXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBlbGltaW5hdGVPdmVybGFwKCkge1xuXG4gICAgLy8gV2UnbGwgZXhwYW5kIGJvdW5kcyBieSB0aGlzIGFtb3VudCwgc28gdGhhdCBcImFkamFjZW50XCIgYm91bmRzICh3aXRoIGEgcG90ZW50aWFsbHkgb3ZlcmxhcHBpbmcgdmVydGljYWwgb3JcbiAgICAvLyBob3Jpem9udGFsIGxpbmUpIHdpbGwgaGF2ZSBhIG5vbi16ZXJvIGFtb3VudCBvZiBhcmVhIG92ZXJsYXBwaW5nLlxuICAgIGNvbnN0IGVwc2lsb24gPSAxZS00O1xuXG4gICAgLy8gT3VyIHF1ZXVlIHdpbGwgc3RvcmUgZW50cmllcyBvZiB7IHN0YXJ0OiBib29sZWFuLCBlZGdlOiBFZGdlIH0sIHJlcHJlc2VudGluZyBhIHN3ZWVwIGxpbmUgc2ltaWxhciB0byB0aGVcbiAgICAvLyBCZW50bGV5LU90dG1hbm4gYXBwcm9hY2guIFdlJ2xsIHRyYWNrIHdoaWNoIGVkZ2VzIGFyZSBwYXNzaW5nIHRocm91Z2ggdGhlIHN3ZWVwIGxpbmUuXG4gICAgY29uc3QgcXVldWUgPSBuZXcgd2luZG93LkZsYXRRdWV1ZSgpO1xuXG4gICAgLy8gVHJhY2tzIHdoaWNoIGVkZ2VzIGFyZSB0aHJvdWdoIHRoZSBzd2VlcCBsaW5lLCBidXQgaW4gYSBncmFwaCBzdHJ1Y3R1cmUgbGlrZSBhIHNlZ21lbnQvaW50ZXJ2YWwgdHJlZSwgc28gdGhhdCB3ZVxuICAgIC8vIGNhbiBoYXZlIGZhc3QgbG9va3VwICh3aGF0IGVkZ2VzIGFyZSBpbiBhIGNlcnRhaW4gcmFuZ2UpIGFuZCBhbHNvIGZhc3QgaW5zZXJ0cy9yZW1vdmFscy5cbiAgICBjb25zdCBzZWdtZW50VHJlZSA9IG5ldyBFZGdlU2VnbWVudFRyZWUoIGVwc2lsb24gKTtcblxuICAgIC8vIEFzc29ydGVkIG9wZXJhdGlvbnMgdXNlIGEgc2hvcnRjdXQgdG8gXCJ0YWdcIiBlZGdlcyB3aXRoIGEgdW5pcXVlIElELCB0byBpbmRpY2F0ZSBpdCBoYXMgYWxyZWFkeSBiZWVuIHByb2Nlc3NlZFxuICAgIC8vIGZvciB0aGlzIGNhbGwgb2YgZWxpbWluYXRlT3ZlcmxhcCgpLiBUaGlzIGlzIGEgaGlnaGVyLXBlcmZvcm1hbmNlIG9wdGlvbiB0byBzdG9yaW5nIGFuIGFycmF5IG9mIFwiYWxyZWFkeVxuICAgIC8vIHByb2Nlc3NlZFwiIGVkZ2VzLlxuICAgIGNvbnN0IG5leHRJZCA9IGdsb2JhbElkKys7XG5cbiAgICAvLyBBZGRzIGFuIGVkZ2UgdG8gdGhlIHF1ZXVlXG4gICAgY29uc3QgYWRkVG9RdWV1ZSA9IGVkZ2UgPT4ge1xuICAgICAgY29uc3QgYm91bmRzID0gZWRnZS5zZWdtZW50LmJvdW5kcztcblxuICAgICAgLy8gVE9ETzogc2VlIGlmIG9iamVjdCBhbGxvY2F0aW9ucyBhcmUgc2xvdyBoZXJlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9raXRlL2lzc3Vlcy83NlxuICAgICAgcXVldWUucHVzaCggeyBzdGFydDogdHJ1ZSwgZWRnZTogZWRnZSB9LCBib3VuZHMubWluWSAtIGVwc2lsb24gKTtcbiAgICAgIHF1ZXVlLnB1c2goIHsgc3RhcnQ6IGZhbHNlLCBlZGdlOiBlZGdlIH0sIGJvdW5kcy5tYXhZICsgZXBzaWxvbiApO1xuICAgIH07XG5cbiAgICAvLyBSZW1vdmVzIGFuIGVkZ2UgZnJvbSB0aGUgcXVldWUgKGVmZmVjdGl2ZWx5Li4uIHdoZW4gd2UgcG9wIGZyb20gdGhlIHF1ZXVlLCB3ZSdsbCBjaGVjayBpdHMgSUQgZGF0YSwgYW5kIGlmIGl0IHdhc1xuICAgIC8vIFwicmVtb3ZlZFwiIHdlIHdpbGwgaWdub3JlIGl0LiBIaWdoZXItcGVyZm9ybWFuY2UgdGhhbiB1c2luZyBhbiBhcnJheS5cbiAgICBjb25zdCByZW1vdmVGcm9tUXVldWUgPSBlZGdlID0+IHtcbiAgICAgIC8vIFN0b3JlIHRoZSBJRCBzbyB3ZSBjYW4gaGF2ZSBhIGhpZ2gtcGVyZm9ybWFuY2UgcmVtb3ZhbFxuICAgICAgZWRnZS5pbnRlcm5hbERhdGEucmVtb3ZlZElkID0gbmV4dElkO1xuICAgIH07XG5cbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCB0aGlzLmVkZ2VzLmxlbmd0aDsgaSsrICkge1xuICAgICAgYWRkVG9RdWV1ZSggdGhpcy5lZGdlc1sgaSBdICk7XG4gICAgfVxuXG4gICAgLy8gV2UgdHJhY2sgZWRnZXMgdG8gZGlzcG9zZSBzZXBhcmF0ZWx5LCBpbnN0ZWFkIG9mIHN5bmNocm9ub3VzbHkgZGlzcG9zaW5nIHRoZW0uIFRoaXMgaXMgbWFpbmx5IGR1ZSB0byB0aGUgdHJpY2sgb2ZcbiAgICAvLyByZW1vdmFsIElEcywgc2luY2UgaWYgd2UgcmUtdXNlZCBwb29sZWQgRWRnZXMgd2hlbiBjcmVhdGluZywgdGhleSB3b3VsZCBzdGlsbCBoYXZlIHRoZSBJRCBPUiB0aGV5IHdvdWxkIGxvc2UgdGhlXG4gICAgLy8gXCJyZW1vdmVkXCIgaW5mb3JtYXRpb24uXG4gICAgY29uc3QgZWRnZXNUb0Rpc3Bvc2UgPSBbXTtcblxuICAgIHdoaWxlICggcXVldWUubGVuZ3RoICkge1xuICAgICAgY29uc3QgZW50cnkgPSBxdWV1ZS5wb3AoKTtcbiAgICAgIGNvbnN0IGVkZ2UgPSBlbnRyeS5lZGdlO1xuXG4gICAgICAvLyBTa2lwIGVkZ2VzIHdlIGFscmVhZHkgcmVtb3ZlZFxuICAgICAgaWYgKCBlZGdlLmludGVybmFsRGF0YS5yZW1vdmVkSWQgPT09IG5leHRJZCApIHtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG5cbiAgICAgIGlmICggZW50cnkuc3RhcnQgKSB7XG4gICAgICAgIC8vIFdlJ2xsIGJhaWwgb3V0IG9mIHRoZSBsb29wIGlmIHdlIGZpbmQgb3ZlcmxhcHMsIGFuZCB3ZSdsbCBzdG9yZSB0aGUgcmVsZXZhbnQgaW5mb3JtYXRpb24gaW4gdGhlc2VcbiAgICAgICAgbGV0IGZvdW5kID0gZmFsc2U7XG4gICAgICAgIGxldCBvdmVybGFwcGVkRWRnZTtcbiAgICAgICAgbGV0IGFkZGVkRWRnZXM7XG5cbiAgICAgICAgLy8gVE9ETzogSXMgdGhpcyBjbG9zdXJlIGtpbGxpbmcgcGVyZm9ybWFuY2U/IGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9raXRlL2lzc3Vlcy83NlxuICAgICAgICBzZWdtZW50VHJlZS5xdWVyeSggZWRnZSwgb3RoZXJFZGdlID0+IHtcbiAgICAgICAgICBjb25zdCBvdmVybGFwcyA9IGVkZ2Uuc2VnbWVudC5nZXRPdmVybGFwcyggb3RoZXJFZGdlLnNlZ21lbnQgKTtcblxuICAgICAgICAgIGlmICggb3ZlcmxhcHMgIT09IG51bGwgJiYgb3ZlcmxhcHMubGVuZ3RoICkge1xuICAgICAgICAgICAgZm9yICggbGV0IGsgPSAwOyBrIDwgb3ZlcmxhcHMubGVuZ3RoOyBrKysgKSB7XG4gICAgICAgICAgICAgIGNvbnN0IG92ZXJsYXAgPSBvdmVybGFwc1sgayBdO1xuICAgICAgICAgICAgICBpZiAoIE1hdGguYWJzKCBvdmVybGFwLnQxIC0gb3ZlcmxhcC50MCApID4gMWUtNSAmJlxuICAgICAgICAgICAgICAgICAgIE1hdGguYWJzKCBvdmVybGFwLnF0MSAtIG92ZXJsYXAucXQwICkgPiAxZS01ICkge1xuXG4gICAgICAgICAgICAgICAgYWRkZWRFZGdlcyA9IHRoaXMuc3BsaXRPdmVybGFwKCBlZGdlLCBvdGhlckVkZ2UsIG92ZXJsYXAgKTtcbiAgICAgICAgICAgICAgICBmb3VuZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgb3ZlcmxhcHBlZEVkZ2UgPSBvdGhlckVkZ2U7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG5cbiAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH0gKTtcblxuICAgICAgICBpZiAoIGZvdW5kICkge1xuICAgICAgICAgIC8vIFdlIGhhdmVuJ3QgYWRkZWQgb3VyIGVkZ2UgeWV0LCBzbyBubyBuZWVkIHRvIHJlbW92ZSBpdC5cbiAgICAgICAgICBzZWdtZW50VHJlZS5yZW1vdmVJdGVtKCBvdmVybGFwcGVkRWRnZSApO1xuXG4gICAgICAgICAgLy8gQWRqdXN0IHRoZSBxdWV1ZVxuICAgICAgICAgIHJlbW92ZUZyb21RdWV1ZSggb3ZlcmxhcHBlZEVkZ2UgKTtcbiAgICAgICAgICByZW1vdmVGcm9tUXVldWUoIGVkZ2UgKTtcbiAgICAgICAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBhZGRlZEVkZ2VzLmxlbmd0aDsgaSsrICkge1xuICAgICAgICAgICAgYWRkVG9RdWV1ZSggYWRkZWRFZGdlc1sgaSBdICk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgZWRnZXNUb0Rpc3Bvc2UucHVzaCggZWRnZSApO1xuICAgICAgICAgIGVkZ2VzVG9EaXNwb3NlLnB1c2goIG92ZXJsYXBwZWRFZGdlICk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgLy8gTm8gb3ZlcmxhcHMgZm91bmQsIGFkZCBpdCBhbmQgY29udGludWVcbiAgICAgICAgICBzZWdtZW50VHJlZS5hZGRJdGVtKCBlZGdlICk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGVsc2Uge1xuICAgICAgICAvLyBSZW1vdmFsIGNhbid0IHRyaWdnZXIgYW4gaW50ZXJzZWN0aW9uLCBzbyB3ZSBjYW4gc2FmZWx5IHJlbW92ZSBpdFxuICAgICAgICBzZWdtZW50VHJlZS5yZW1vdmVJdGVtKCBlZGdlICk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgZWRnZXNUb0Rpc3Bvc2UubGVuZ3RoOyBpKysgKSB7XG4gICAgICBlZGdlc1RvRGlzcG9zZVsgaSBdLmRpc3Bvc2UoKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogU3BsaXRzL2NvbWJpbmVzIGVkZ2VzIHdoZW4gdGhlcmUgaXMgYW4gb3ZlcmxhcCBvZiB0d28gZWRnZXMgKHR3byBlZGdlcyB3aG8gaGF2ZSBhbiBpbmZpbml0ZSBudW1iZXIgb2ZcbiAgICogaW50ZXJzZWN0aW9uIHBvaW50cykuXG4gICAqIEBwcml2YXRlXG4gICAqXG4gICAqIE5PVEU6IFRoaXMgZG9lcyBOT1QgZGlzcG9zZSBhRWRnZS9iRWRnZSwgZHVlIHRvIGVsaW1pbmF0ZU92ZXJsYXAncyBuZWVkcy5cbiAgICpcbiAgICogR2VuZXJhbGx5IHRoaXMgY3JlYXRlcyBhbiBlZGdlIGZvciB0aGUgXCJzaGFyZWRcIiBwYXJ0IG9mIGJvdGggc2VnbWVudHMsIGFuZCB0aGVuIGNyZWF0ZXMgZWRnZXMgZm9yIHRoZSBwYXJ0c1xuICAgKiBvdXRzaWRlIG9mIHRoZSBzaGFyZWQgcmVnaW9uLCBjb25uZWN0aW5nIHRoZW0gdG9nZXRoZXIuXG4gICAqXG4gICAqIEBwYXJhbSB7RWRnZX0gYUVkZ2VcbiAgICogQHBhcmFtIHtFZGdlfSBiRWRnZVxuICAgKiBAcGFyYW0ge092ZXJsYXB9IG92ZXJsYXBcbiAgICogQHJldHVybnMge0FycmF5LjxFZGdlPn1cbiAgICovXG4gIHNwbGl0T3ZlcmxhcCggYUVkZ2UsIGJFZGdlLCBvdmVybGFwICkge1xuICAgIGNvbnN0IG5ld0VkZ2VzID0gW107XG5cbiAgICBjb25zdCBhU2VnbWVudCA9IGFFZGdlLnNlZ21lbnQ7XG4gICAgY29uc3QgYlNlZ21lbnQgPSBiRWRnZS5zZWdtZW50O1xuXG4gICAgLy8gUmVtb3ZlIHRoZSBlZGdlcyBmcm9tIGJlZm9yZVxuICAgIHRoaXMucmVtb3ZlRWRnZSggYUVkZ2UgKTtcbiAgICB0aGlzLnJlbW92ZUVkZ2UoIGJFZGdlICk7XG5cbiAgICBsZXQgdDAgPSBvdmVybGFwLnQwO1xuICAgIGxldCB0MSA9IG92ZXJsYXAudDE7XG4gICAgbGV0IHF0MCA9IG92ZXJsYXAucXQwO1xuICAgIGxldCBxdDEgPSBvdmVybGFwLnF0MTtcblxuICAgIC8vIEFwcGx5IHJvdW5kaW5nIHNvIHdlIGRvbid0IGdlbmVyYXRlIHJlYWxseSBzbWFsbCBzZWdtZW50cyBvbiB0aGUgZW5kc1xuICAgIGlmICggdDAgPCAxZS01ICkgeyB0MCA9IDA7IH1cbiAgICBpZiAoIHQxID4gMSAtIDFlLTUgKSB7IHQxID0gMTsgfVxuICAgIGlmICggcXQwIDwgMWUtNSApIHsgcXQwID0gMDsgfVxuICAgIGlmICggcXQxID4gMSAtIDFlLTUgKSB7IHF0MSA9IDE7IH1cblxuICAgIC8vIFdoZXRoZXIgdGhlcmUgd2lsbCBiZSByZW1haW5pbmcgZWRnZXMgb24gZWFjaCBzaWRlLlxuICAgIGNvbnN0IGFCZWZvcmUgPSB0MCA+IDAgPyBhU2VnbWVudC5zdWJkaXZpZGVkKCB0MCApWyAwIF0gOiBudWxsO1xuICAgIGNvbnN0IGJCZWZvcmUgPSBxdDAgPiAwID8gYlNlZ21lbnQuc3ViZGl2aWRlZCggcXQwIClbIDAgXSA6IG51bGw7XG4gICAgY29uc3QgYUFmdGVyID0gdDEgPCAxID8gYVNlZ21lbnQuc3ViZGl2aWRlZCggdDEgKVsgMSBdIDogbnVsbDtcbiAgICBjb25zdCBiQWZ0ZXIgPSBxdDEgPCAxID8gYlNlZ21lbnQuc3ViZGl2aWRlZCggcXQxIClbIDEgXSA6IG51bGw7XG5cbiAgICBsZXQgbWlkZGxlID0gYVNlZ21lbnQ7XG4gICAgaWYgKCB0MCA+IDAgKSB7XG4gICAgICBtaWRkbGUgPSBtaWRkbGUuc3ViZGl2aWRlZCggdDAgKVsgMSBdO1xuICAgIH1cbiAgICBpZiAoIHQxIDwgMSApIHtcbiAgICAgIG1pZGRsZSA9IG1pZGRsZS5zdWJkaXZpZGVkKCBVdGlscy5saW5lYXIoIHQwLCAxLCAwLCAxLCB0MSApIClbIDAgXTtcbiAgICB9XG5cbiAgICBsZXQgYmVmb3JlVmVydGV4O1xuICAgIGlmICggYUJlZm9yZSAmJiBiQmVmb3JlICkge1xuICAgICAgYmVmb3JlVmVydGV4ID0gVmVydGV4LnBvb2wuY3JlYXRlKCBtaWRkbGUuc3RhcnQgKTtcbiAgICAgIHRoaXMudmVydGljZXMucHVzaCggYmVmb3JlVmVydGV4ICk7XG4gICAgfVxuICAgIGVsc2UgaWYgKCBhQmVmb3JlICkge1xuICAgICAgYmVmb3JlVmVydGV4ID0gb3ZlcmxhcC5hID4gMCA/IGJFZGdlLnN0YXJ0VmVydGV4IDogYkVkZ2UuZW5kVmVydGV4O1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIGJlZm9yZVZlcnRleCA9IGFFZGdlLnN0YXJ0VmVydGV4O1xuICAgIH1cblxuICAgIGxldCBhZnRlclZlcnRleDtcbiAgICBpZiAoIGFBZnRlciAmJiBiQWZ0ZXIgKSB7XG4gICAgICBhZnRlclZlcnRleCA9IFZlcnRleC5wb29sLmNyZWF0ZSggbWlkZGxlLmVuZCApO1xuICAgICAgdGhpcy52ZXJ0aWNlcy5wdXNoKCBhZnRlclZlcnRleCApO1xuICAgIH1cbiAgICBlbHNlIGlmICggYUFmdGVyICkge1xuICAgICAgYWZ0ZXJWZXJ0ZXggPSBvdmVybGFwLmEgPiAwID8gYkVkZ2UuZW5kVmVydGV4IDogYkVkZ2Uuc3RhcnRWZXJ0ZXg7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgYWZ0ZXJWZXJ0ZXggPSBhRWRnZS5lbmRWZXJ0ZXg7XG4gICAgfVxuXG4gICAgY29uc3QgbWlkZGxlRWRnZSA9IEVkZ2UucG9vbC5jcmVhdGUoIG1pZGRsZSwgYmVmb3JlVmVydGV4LCBhZnRlclZlcnRleCApO1xuICAgIG5ld0VkZ2VzLnB1c2goIG1pZGRsZUVkZ2UgKTtcblxuICAgIGxldCBhQmVmb3JlRWRnZTtcbiAgICBsZXQgYUFmdGVyRWRnZTtcbiAgICBsZXQgYkJlZm9yZUVkZ2U7XG4gICAgbGV0IGJBZnRlckVkZ2U7XG5cbiAgICAvLyBBZGQgXCJsZWZ0b3ZlclwiIGVkZ2VzXG4gICAgaWYgKCBhQmVmb3JlICkge1xuICAgICAgYUJlZm9yZUVkZ2UgPSBFZGdlLnBvb2wuY3JlYXRlKCBhQmVmb3JlLCBhRWRnZS5zdGFydFZlcnRleCwgYmVmb3JlVmVydGV4ICk7XG4gICAgICBuZXdFZGdlcy5wdXNoKCBhQmVmb3JlRWRnZSApO1xuICAgIH1cbiAgICBpZiAoIGFBZnRlciApIHtcbiAgICAgIGFBZnRlckVkZ2UgPSBFZGdlLnBvb2wuY3JlYXRlKCBhQWZ0ZXIsIGFmdGVyVmVydGV4LCBhRWRnZS5lbmRWZXJ0ZXggKTtcbiAgICAgIG5ld0VkZ2VzLnB1c2goIGFBZnRlckVkZ2UgKTtcbiAgICB9XG4gICAgaWYgKCBiQmVmb3JlICkge1xuICAgICAgYkJlZm9yZUVkZ2UgPSBFZGdlLnBvb2wuY3JlYXRlKCBiQmVmb3JlLCBiRWRnZS5zdGFydFZlcnRleCwgb3ZlcmxhcC5hID4gMCA/IGJlZm9yZVZlcnRleCA6IGFmdGVyVmVydGV4ICk7XG4gICAgICBuZXdFZGdlcy5wdXNoKCBiQmVmb3JlRWRnZSApO1xuICAgIH1cbiAgICBpZiAoIGJBZnRlciApIHtcbiAgICAgIGJBZnRlckVkZ2UgPSBFZGdlLnBvb2wuY3JlYXRlKCBiQWZ0ZXIsIG92ZXJsYXAuYSA+IDAgPyBhZnRlclZlcnRleCA6IGJlZm9yZVZlcnRleCwgYkVkZ2UuZW5kVmVydGV4ICk7XG4gICAgICBuZXdFZGdlcy5wdXNoKCBiQWZ0ZXJFZGdlICk7XG4gICAgfVxuXG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgbmV3RWRnZXMubGVuZ3RoOyBpKysgKSB7XG4gICAgICB0aGlzLmFkZEVkZ2UoIG5ld0VkZ2VzWyBpIF0gKTtcbiAgICB9XG5cbiAgICAvLyBDb2xsZWN0IFwicmVwbGFjZW1lbnRcIiBlZGdlc1xuICAgIGNvbnN0IGFFZGdlcyA9ICggYUJlZm9yZSA/IFsgYUJlZm9yZUVkZ2UgXSA6IFtdICkuY29uY2F0KCBbIG1pZGRsZUVkZ2UgXSApLmNvbmNhdCggYUFmdGVyID8gWyBhQWZ0ZXJFZGdlIF0gOiBbXSApO1xuICAgIGNvbnN0IGJFZGdlcyA9ICggYkJlZm9yZSA/IFsgYkJlZm9yZUVkZ2UgXSA6IFtdICkuY29uY2F0KCBbIG1pZGRsZUVkZ2UgXSApLmNvbmNhdCggYkFmdGVyID8gWyBiQWZ0ZXJFZGdlIF0gOiBbXSApO1xuXG4gICAgY29uc3QgYUZvcndhcmRIYWxmRWRnZXMgPSBbXTtcbiAgICBjb25zdCBiRm9yd2FyZEhhbGZFZGdlcyA9IFtdO1xuXG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgYUVkZ2VzLmxlbmd0aDsgaSsrICkge1xuICAgICAgYUZvcndhcmRIYWxmRWRnZXMucHVzaCggYUVkZ2VzWyBpIF0uZm9yd2FyZEhhbGYgKTtcbiAgICB9XG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgYkVkZ2VzLmxlbmd0aDsgaSsrICkge1xuICAgICAgLy8gSGFuZGxlIHJldmVyc2luZyB0aGUgXCJtaWRkbGVcIiBlZGdlXG4gICAgICBjb25zdCBpc0ZvcndhcmQgPSBiRWRnZXNbIGkgXSAhPT0gbWlkZGxlRWRnZSB8fCBvdmVybGFwLmEgPiAwO1xuICAgICAgYkZvcndhcmRIYWxmRWRnZXMucHVzaCggaXNGb3J3YXJkID8gYkVkZ2VzWyBpIF0uZm9yd2FyZEhhbGYgOiBiRWRnZXNbIGkgXS5yZXZlcnNlZEhhbGYgKTtcbiAgICB9XG5cbiAgICAvLyBSZXBsYWNlIGVkZ2VzIGluIHRoZSBsb29wc1xuICAgIHRoaXMucmVwbGFjZUVkZ2VJbkxvb3BzKCBhRWRnZSwgYUZvcndhcmRIYWxmRWRnZXMgKTtcbiAgICB0aGlzLnJlcGxhY2VFZGdlSW5Mb29wcyggYkVkZ2UsIGJGb3J3YXJkSGFsZkVkZ2VzICk7XG5cbiAgICByZXR1cm4gbmV3RWRnZXM7XG4gIH1cblxuICAvKipcbiAgICogSGFuZGxlcyBzcGxpdHRpbmcgb2Ygc2VsZi1pbnRlcnNlY3Rpb24gb2Ygc2VnbWVudHMgKGhhcHBlbnMgd2l0aCBDdWJpY3MpLlxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgZWxpbWluYXRlU2VsZkludGVyc2VjdGlvbigpIHtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0aGlzLmJvdW5kYXJpZXMubGVuZ3RoID09PSAwLCAnT25seSBoYW5kbGVzIHNpbXBsZXIgbGV2ZWwgcHJpbWl0aXZlIHNwbGl0dGluZyByaWdodCBub3cnICk7XG5cbiAgICBmb3IgKCBsZXQgaSA9IHRoaXMuZWRnZXMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0gKSB7XG4gICAgICBjb25zdCBlZGdlID0gdGhpcy5lZGdlc1sgaSBdO1xuICAgICAgY29uc3Qgc2VnbWVudCA9IGVkZ2Uuc2VnbWVudDtcblxuICAgICAgaWYgKCBzZWdtZW50IGluc3RhbmNlb2YgQ3ViaWMgKSB7XG4gICAgICAgIC8vIFRPRE86IFRoaXMgbWlnaHQgbm90IHByb3Blcmx5IGhhbmRsZSB3aGVuIGl0IG9ubHkgb25lIGVuZHBvaW50IGlzIG9uIHRoZSBjdXJ2ZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMva2l0ZS9pc3N1ZXMvNzZcbiAgICAgICAgY29uc3Qgc2VsZkludGVyc2VjdGlvbiA9IHNlZ21lbnQuZ2V0U2VsZkludGVyc2VjdGlvbigpO1xuXG4gICAgICAgIGlmICggc2VsZkludGVyc2VjdGlvbiApIHtcbiAgICAgICAgICBhc3NlcnQgJiYgYXNzZXJ0KCBzZWxmSW50ZXJzZWN0aW9uLmFUIDwgc2VsZkludGVyc2VjdGlvbi5iVCApO1xuXG4gICAgICAgICAgY29uc3Qgc2VnbWVudHMgPSBzZWdtZW50LnN1YmRpdmlzaW9ucyggWyBzZWxmSW50ZXJzZWN0aW9uLmFULCBzZWxmSW50ZXJzZWN0aW9uLmJUIF0gKTtcblxuICAgICAgICAgIGNvbnN0IHZlcnRleCA9IFZlcnRleC5wb29sLmNyZWF0ZSggc2VsZkludGVyc2VjdGlvbi5wb2ludCApO1xuICAgICAgICAgIHRoaXMudmVydGljZXMucHVzaCggdmVydGV4ICk7XG5cbiAgICAgICAgICBjb25zdCBzdGFydEVkZ2UgPSBFZGdlLnBvb2wuY3JlYXRlKCBzZWdtZW50c1sgMCBdLCBlZGdlLnN0YXJ0VmVydGV4LCB2ZXJ0ZXggKTtcbiAgICAgICAgICBjb25zdCBtaWRkbGVFZGdlID0gRWRnZS5wb29sLmNyZWF0ZSggc2VnbWVudHNbIDEgXSwgdmVydGV4LCB2ZXJ0ZXggKTtcbiAgICAgICAgICBjb25zdCBlbmRFZGdlID0gRWRnZS5wb29sLmNyZWF0ZSggc2VnbWVudHNbIDIgXSwgdmVydGV4LCBlZGdlLmVuZFZlcnRleCApO1xuXG4gICAgICAgICAgdGhpcy5yZW1vdmVFZGdlKCBlZGdlICk7XG5cbiAgICAgICAgICB0aGlzLmFkZEVkZ2UoIHN0YXJ0RWRnZSApO1xuICAgICAgICAgIHRoaXMuYWRkRWRnZSggbWlkZGxlRWRnZSApO1xuICAgICAgICAgIHRoaXMuYWRkRWRnZSggZW5kRWRnZSApO1xuXG4gICAgICAgICAgdGhpcy5yZXBsYWNlRWRnZUluTG9vcHMoIGVkZ2UsIFsgc3RhcnRFZGdlLmZvcndhcmRIYWxmLCBtaWRkbGVFZGdlLmZvcndhcmRIYWxmLCBlbmRFZGdlLmZvcndhcmRIYWxmIF0gKTtcblxuICAgICAgICAgIGVkZ2UuZGlzcG9zZSgpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFJlcGxhY2UgaW50ZXJzZWN0aW9ucyBiZXR3ZWVuIGRpZmZlcmVudCBzZWdtZW50cyBieSBzcGxpdHRpbmcgdGhlbSBhbmQgY3JlYXRpbmcgYSB2ZXJ0ZXguXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBlbGltaW5hdGVJbnRlcnNlY3Rpb24oKSB7XG5cbiAgICAvLyBXZSdsbCBleHBhbmQgYm91bmRzIGJ5IHRoaXMgYW1vdW50LCBzbyB0aGF0IFwiYWRqYWNlbnRcIiBib3VuZHMgKHdpdGggYSBwb3RlbnRpYWxseSBvdmVybGFwcGluZyB2ZXJ0aWNhbCBvclxuICAgIC8vIGhvcml6b250YWwgbGluZSkgd2lsbCBoYXZlIGEgbm9uLXplcm8gYW1vdW50IG9mIGFyZWEgb3ZlcmxhcHBpbmcuXG4gICAgY29uc3QgZXBzaWxvbiA9IDFlLTQ7XG5cbiAgICAvLyBPdXIgcXVldWUgd2lsbCBzdG9yZSBlbnRyaWVzIG9mIHsgc3RhcnQ6IGJvb2xlYW4sIGVkZ2U6IEVkZ2UgfSwgcmVwcmVzZW50aW5nIGEgc3dlZXAgbGluZSBzaW1pbGFyIHRvIHRoZVxuICAgIC8vIEJlbnRsZXktT3R0bWFubiBhcHByb2FjaC4gV2UnbGwgdHJhY2sgd2hpY2ggZWRnZXMgYXJlIHBhc3NpbmcgdGhyb3VnaCB0aGUgc3dlZXAgbGluZS5cbiAgICBjb25zdCBxdWV1ZSA9IG5ldyB3aW5kb3cuRmxhdFF1ZXVlKCk7XG5cbiAgICAvLyBUcmFja3Mgd2hpY2ggZWRnZXMgYXJlIHRocm91Z2ggdGhlIHN3ZWVwIGxpbmUsIGJ1dCBpbiBhIGdyYXBoIHN0cnVjdHVyZSBsaWtlIGEgc2VnbWVudC9pbnRlcnZhbCB0cmVlLCBzbyB0aGF0IHdlXG4gICAgLy8gY2FuIGhhdmUgZmFzdCBsb29rdXAgKHdoYXQgZWRnZXMgYXJlIGluIGEgY2VydGFpbiByYW5nZSkgYW5kIGFsc28gZmFzdCBpbnNlcnRzL3JlbW92YWxzLlxuICAgIGNvbnN0IHNlZ21lbnRUcmVlID0gbmV3IEVkZ2VTZWdtZW50VHJlZSggZXBzaWxvbiApO1xuXG4gICAgLy8gQXNzb3J0ZWQgb3BlcmF0aW9ucyB1c2UgYSBzaG9ydGN1dCB0byBcInRhZ1wiIGVkZ2VzIHdpdGggYSB1bmlxdWUgSUQsIHRvIGluZGljYXRlIGl0IGhhcyBhbHJlYWR5IGJlZW4gcHJvY2Vzc2VkXG4gICAgLy8gZm9yIHRoaXMgY2FsbCBvZiBlbGltaW5hdGVPdmVybGFwKCkuIFRoaXMgaXMgYSBoaWdoZXItcGVyZm9ybWFuY2Ugb3B0aW9uIHRvIHN0b3JpbmcgYW4gYXJyYXkgb2YgXCJhbHJlYWR5XG4gICAgLy8gcHJvY2Vzc2VkXCIgZWRnZXMuXG4gICAgY29uc3QgbmV4dElkID0gZ2xvYmFsSWQrKztcblxuICAgIC8vIEFkZHMgYW4gZWRnZSB0byB0aGUgcXVldWVcbiAgICBjb25zdCBhZGRUb1F1ZXVlID0gZWRnZSA9PiB7XG4gICAgICBjb25zdCBib3VuZHMgPSBlZGdlLnNlZ21lbnQuYm91bmRzO1xuXG4gICAgICAvLyBUT0RPOiBzZWUgaWYgb2JqZWN0IGFsbG9jYXRpb25zIGFyZSBzbG93IGhlcmUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2tpdGUvaXNzdWVzLzc2XG4gICAgICBxdWV1ZS5wdXNoKCB7IHN0YXJ0OiB0cnVlLCBlZGdlOiBlZGdlIH0sIGJvdW5kcy5taW5ZIC0gZXBzaWxvbiApO1xuICAgICAgcXVldWUucHVzaCggeyBzdGFydDogZmFsc2UsIGVkZ2U6IGVkZ2UgfSwgYm91bmRzLm1heFkgKyBlcHNpbG9uICk7XG4gICAgfTtcblxuICAgIC8vIFJlbW92ZXMgYW4gZWRnZSBmcm9tIHRoZSBxdWV1ZSAoZWZmZWN0aXZlbHkuLi4gd2hlbiB3ZSBwb3AgZnJvbSB0aGUgcXVldWUsIHdlJ2xsIGNoZWNrIGl0cyBJRCBkYXRhLCBhbmQgaWYgaXQgd2FzXG4gICAgLy8gXCJyZW1vdmVkXCIgd2Ugd2lsbCBpZ25vcmUgaXQuIEhpZ2hlci1wZXJmb3JtYW5jZSB0aGFuIHVzaW5nIGFuIGFycmF5LlxuICAgIGNvbnN0IHJlbW92ZUZyb21RdWV1ZSA9IGVkZ2UgPT4ge1xuICAgICAgLy8gU3RvcmUgdGhlIElEIHNvIHdlIGNhbiBoYXZlIGEgaGlnaC1wZXJmb3JtYW5jZSByZW1vdmFsXG4gICAgICBlZGdlLmludGVybmFsRGF0YS5yZW1vdmVkSWQgPSBuZXh0SWQ7XG4gICAgfTtcblxuICAgIGZvciAoIGxldCBpID0gMDsgaSA8IHRoaXMuZWRnZXMubGVuZ3RoOyBpKysgKSB7XG4gICAgICBhZGRUb1F1ZXVlKCB0aGlzLmVkZ2VzWyBpIF0gKTtcbiAgICB9XG5cbiAgICAvLyBXZSB0cmFjayBlZGdlcyB0byBkaXNwb3NlIHNlcGFyYXRlbHksIGluc3RlYWQgb2Ygc3luY2hyb25vdXNseSBkaXNwb3NpbmcgdGhlbS4gVGhpcyBpcyBtYWlubHkgZHVlIHRvIHRoZSB0cmljayBvZlxuICAgIC8vIHJlbW92YWwgSURzLCBzaW5jZSBpZiB3ZSByZS11c2VkIHBvb2xlZCBFZGdlcyB3aGVuIGNyZWF0aW5nLCB0aGV5IHdvdWxkIHN0aWxsIGhhdmUgdGhlIElEIE9SIHRoZXkgd291bGQgbG9zZSB0aGVcbiAgICAvLyBcInJlbW92ZWRcIiBpbmZvcm1hdGlvbi5cbiAgICBjb25zdCBlZGdlc1RvRGlzcG9zZSA9IFtdO1xuXG4gICAgd2hpbGUgKCBxdWV1ZS5sZW5ndGggKSB7XG4gICAgICBjb25zdCBlbnRyeSA9IHF1ZXVlLnBvcCgpO1xuICAgICAgY29uc3QgZWRnZSA9IGVudHJ5LmVkZ2U7XG5cbiAgICAgIC8vIFNraXAgZWRnZXMgd2UgYWxyZWFkeSByZW1vdmVkXG4gICAgICBpZiAoIGVkZ2UuaW50ZXJuYWxEYXRhLnJlbW92ZWRJZCA9PT0gbmV4dElkICkge1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cblxuICAgICAgaWYgKCBlbnRyeS5zdGFydCApIHtcbiAgICAgICAgLy8gV2UnbGwgYmFpbCBvdXQgb2YgdGhlIGxvb3AgaWYgd2UgZmluZCBvdmVybGFwcywgYW5kIHdlJ2xsIHN0b3JlIHRoZSByZWxldmFudCBpbmZvcm1hdGlvbiBpbiB0aGVzZVxuICAgICAgICBsZXQgZm91bmQgPSBmYWxzZTtcbiAgICAgICAgbGV0IG92ZXJsYXBwZWRFZGdlO1xuICAgICAgICBsZXQgYWRkZWRFZGdlcztcbiAgICAgICAgbGV0IHJlbW92ZWRFZGdlcztcblxuICAgICAgICAvLyBUT0RPOiBJcyB0aGlzIGNsb3N1cmUga2lsbGluZyBwZXJmb3JtYW5jZT8gaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2tpdGUvaXNzdWVzLzc2XG4gICAgICAgIHNlZ21lbnRUcmVlLnF1ZXJ5KCBlZGdlLCBvdGhlckVkZ2UgPT4ge1xuXG4gICAgICAgICAgY29uc3QgYVNlZ21lbnQgPSBlZGdlLnNlZ21lbnQ7XG4gICAgICAgICAgY29uc3QgYlNlZ21lbnQgPSBvdGhlckVkZ2Uuc2VnbWVudDtcbiAgICAgICAgICBsZXQgaW50ZXJzZWN0aW9ucyA9IFNlZ21lbnQuaW50ZXJzZWN0KCBhU2VnbWVudCwgYlNlZ21lbnQgKTtcbiAgICAgICAgICBpbnRlcnNlY3Rpb25zID0gaW50ZXJzZWN0aW9ucy5maWx0ZXIoIGludGVyc2VjdGlvbiA9PiB7XG4gICAgICAgICAgICBjb25zdCBwb2ludCA9IGludGVyc2VjdGlvbi5wb2ludDtcblxuICAgICAgICAgICAgLy8gRmlsdGVyIG91dCBlbmRwb2ludC10by1lbmRwb2ludCBpbnRlcnNlY3Rpb25zLCBhbmQgYXQgYSByYWRpdXMgd2hlcmUgdGhleSB3b3VsZCBnZXQgY29sbGFwc2VkIGludG8gYW5cbiAgICAgICAgICAgIC8vIGVuZHBvaW50IGFueXdheS4gSWYgaXQncyBcImludGVybmFsXCIgdG8gb25lIHNlZ21lbnQsIHdlJ2xsIGtlZXAgaXQuXG4gICAgICAgICAgICByZXR1cm4gR3JhcGguaXNJbnRlcm5hbCggcG9pbnQsIGludGVyc2VjdGlvbi5hVCwgYVNlZ21lbnQsIElOVEVSU0VDVElPTl9FTkRQT0lOVF9USFJFU0hPTERfRElTVEFOQ0UsIFRfVEhSRVNIT0xEICkgfHxcbiAgICAgICAgICAgICAgICAgICBHcmFwaC5pc0ludGVybmFsKCBwb2ludCwgaW50ZXJzZWN0aW9uLmJULCBiU2VnbWVudCwgSU5URVJTRUNUSU9OX0VORFBPSU5UX1RIUkVTSE9MRF9ESVNUQU5DRSwgVF9USFJFU0hPTEQgKTtcbiAgICAgICAgICB9ICk7XG4gICAgICAgICAgaWYgKCBpbnRlcnNlY3Rpb25zLmxlbmd0aCApIHtcblxuICAgICAgICAgICAgLy8gVE9ETzogSW4gdGhlIGZ1dHVyZSwgaGFuZGxlIG11bHRpcGxlIGludGVyc2VjdGlvbnMgKGluc3RlYWQgb2YgcmUtcnVubmluZykgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2tpdGUvaXNzdWVzLzc2XG4gICAgICAgICAgICBjb25zdCBpbnRlcnNlY3Rpb24gPSBpbnRlcnNlY3Rpb25zWyAwIF07XG5cbiAgICAgICAgICAgIGNvbnN0IHJlc3VsdCA9IHRoaXMuc2ltcGxlU3BsaXQoIGVkZ2UsIG90aGVyRWRnZSwgaW50ZXJzZWN0aW9uLmFULCBpbnRlcnNlY3Rpb24uYlQsIGludGVyc2VjdGlvbi5wb2ludCApO1xuXG4gICAgICAgICAgICBpZiAoIHJlc3VsdCApIHtcbiAgICAgICAgICAgICAgZm91bmQgPSB0cnVlO1xuICAgICAgICAgICAgICBvdmVybGFwcGVkRWRnZSA9IG90aGVyRWRnZTtcbiAgICAgICAgICAgICAgYWRkZWRFZGdlcyA9IHJlc3VsdC5hZGRlZEVkZ2VzO1xuICAgICAgICAgICAgICByZW1vdmVkRWRnZXMgPSByZXN1bHQucmVtb3ZlZEVkZ2VzO1xuICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG5cbiAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH0gKTtcblxuICAgICAgICBpZiAoIGZvdW5kICkge1xuICAgICAgICAgIC8vIElmIHdlIGRpZG4ndCBcInJlbW92ZVwiIHRoYXQgZWRnZSwgd2UnbGwgc3RpbGwgbmVlZCB0byBhZGQgaXQgaW4uXG4gICAgICAgICAgaWYgKCByZW1vdmVkRWRnZXMuaW5jbHVkZXMoIGVkZ2UgKSApIHtcbiAgICAgICAgICAgIHJlbW92ZUZyb21RdWV1ZSggZWRnZSApO1xuICAgICAgICAgICAgZWRnZXNUb0Rpc3Bvc2UucHVzaCggZWRnZSApO1xuICAgICAgICAgIH1cbiAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHNlZ21lbnRUcmVlLmFkZEl0ZW0oIGVkZ2UgKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKCByZW1vdmVkRWRnZXMuaW5jbHVkZXMoIG92ZXJsYXBwZWRFZGdlICkgKSB7XG4gICAgICAgICAgICBzZWdtZW50VHJlZS5yZW1vdmVJdGVtKCBvdmVybGFwcGVkRWRnZSApO1xuICAgICAgICAgICAgcmVtb3ZlRnJvbVF1ZXVlKCBvdmVybGFwcGVkRWRnZSApO1xuICAgICAgICAgICAgZWRnZXNUb0Rpc3Bvc2UucHVzaCggb3ZlcmxhcHBlZEVkZ2UgKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyBBZGp1c3QgdGhlIHF1ZXVlXG4gICAgICAgICAgZm9yICggbGV0IGkgPSAwOyBpIDwgYWRkZWRFZGdlcy5sZW5ndGg7IGkrKyApIHtcbiAgICAgICAgICAgIGFkZFRvUXVldWUoIGFkZGVkRWRnZXNbIGkgXSApO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAvLyBObyBvdmVybGFwcyBmb3VuZCwgYWRkIGl0IGFuZCBjb250aW51ZVxuICAgICAgICAgIHNlZ21lbnRUcmVlLmFkZEl0ZW0oIGVkZ2UgKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgIC8vIFJlbW92YWwgY2FuJ3QgdHJpZ2dlciBhbiBpbnRlcnNlY3Rpb24sIHNvIHdlIGNhbiBzYWZlbHkgcmVtb3ZlIGl0XG4gICAgICAgIHNlZ21lbnRUcmVlLnJlbW92ZUl0ZW0oIGVkZ2UgKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBlZGdlc1RvRGlzcG9zZS5sZW5ndGg7IGkrKyApIHtcbiAgICAgIGVkZ2VzVG9EaXNwb3NlWyBpIF0uZGlzcG9zZSgpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBIYW5kbGVzIHNwbGl0dGluZyB0d28gaW50ZXJzZWN0aW5nIGVkZ2VzLlxuICAgKiBAcHJpdmF0ZVxuICAgKlxuICAgKiBAcGFyYW0ge0VkZ2V9IGFFZGdlXG4gICAqIEBwYXJhbSB7RWRnZX0gYkVkZ2VcbiAgICogQHBhcmFtIHtudW1iZXJ9IGFUIC0gUGFyYW1ldHJpYyB0IHZhbHVlIG9mIHRoZSBpbnRlcnNlY3Rpb24gZm9yIGFFZGdlXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBiVCAtIFBhcmFtZXRyaWMgdCB2YWx1ZSBvZiB0aGUgaW50ZXJzZWN0aW9uIGZvciBiRWRnZVxuICAgKiBAcGFyYW0ge1ZlY3RvcjJ9IHBvaW50IC0gTG9jYXRpb24gb2YgdGhlIGludGVyc2VjdGlvblxuICAgKlxuICAgKiBAcmV0dXJucyB7e2FkZGVkRWRnZXM6IEVkZ2VbXSwgcmVtb3ZlZEVkZ2VzOiBFZGdlW119fG51bGx9XG4gICAqL1xuICBzaW1wbGVTcGxpdCggYUVkZ2UsIGJFZGdlLCBhVCwgYlQsIHBvaW50ICkge1xuICAgIGNvbnN0IGFJbnRlcm5hbCA9IEdyYXBoLmlzSW50ZXJuYWwoIHBvaW50LCBhVCwgYUVkZ2Uuc2VnbWVudCwgU1BMSVRfRU5EUE9JTlRfVEhSRVNIT0xEX0RJU1RBTkNFLCBUX1RIUkVTSE9MRCApO1xuICAgIGNvbnN0IGJJbnRlcm5hbCA9IEdyYXBoLmlzSW50ZXJuYWwoIHBvaW50LCBiVCwgYkVkZ2Uuc2VnbWVudCwgU1BMSVRfRU5EUE9JTlRfVEhSRVNIT0xEX0RJU1RBTkNFLCBUX1RIUkVTSE9MRCApO1xuXG4gICAgbGV0IHZlcnRleCA9IG51bGw7XG4gICAgaWYgKCAhYUludGVybmFsICkge1xuICAgICAgdmVydGV4ID0gYVQgPCAwLjUgPyBhRWRnZS5zdGFydFZlcnRleCA6IGFFZGdlLmVuZFZlcnRleDtcbiAgICB9XG4gICAgZWxzZSBpZiAoICFiSW50ZXJuYWwgKSB7XG4gICAgICB2ZXJ0ZXggPSBiVCA8IDAuNSA/IGJFZGdlLnN0YXJ0VmVydGV4IDogYkVkZ2UuZW5kVmVydGV4O1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIHZlcnRleCA9IFZlcnRleC5wb29sLmNyZWF0ZSggcG9pbnQgKTtcbiAgICAgIHRoaXMudmVydGljZXMucHVzaCggdmVydGV4ICk7XG4gICAgfVxuXG4gICAgbGV0IGNoYW5nZWQgPSBmYWxzZTtcbiAgICBjb25zdCBhZGRlZEVkZ2VzID0gW107XG4gICAgY29uc3QgcmVtb3ZlZEVkZ2VzID0gW107XG5cbiAgICBpZiAoIGFJbnRlcm5hbCAmJiB2ZXJ0ZXggIT09IGFFZGdlLnN0YXJ0VmVydGV4ICYmIHZlcnRleCAhPT0gYUVkZ2UuZW5kVmVydGV4ICkge1xuICAgICAgYWRkZWRFZGdlcy5wdXNoKCAuLi50aGlzLnNwbGl0RWRnZSggYUVkZ2UsIGFULCB2ZXJ0ZXggKSApO1xuICAgICAgcmVtb3ZlZEVkZ2VzLnB1c2goIGFFZGdlICk7XG4gICAgICBjaGFuZ2VkID0gdHJ1ZTtcbiAgICB9XG4gICAgaWYgKCBiSW50ZXJuYWwgJiYgdmVydGV4ICE9PSBiRWRnZS5zdGFydFZlcnRleCAmJiB2ZXJ0ZXggIT09IGJFZGdlLmVuZFZlcnRleCApIHtcbiAgICAgIGFkZGVkRWRnZXMucHVzaCggLi4udGhpcy5zcGxpdEVkZ2UoIGJFZGdlLCBiVCwgdmVydGV4ICkgKTtcbiAgICAgIHJlbW92ZWRFZGdlcy5wdXNoKCBiRWRnZSApO1xuICAgICAgY2hhbmdlZCA9IHRydWU7XG4gICAgfVxuXG4gICAgcmV0dXJuIGNoYW5nZWQgPyB7XG4gICAgICBhZGRlZEVkZ2VzOiBhZGRlZEVkZ2VzLFxuICAgICAgcmVtb3ZlZEVkZ2VzOiByZW1vdmVkRWRnZXNcbiAgICB9IDogbnVsbDtcbiAgfVxuXG4gIC8qKlxuICAgKiBTcGxpdHMgYW4gZWRnZSBpbnRvIHR3byBlZGdlcyBhdCBhIHNwZWNpZmljIHBhcmFtZXRyaWMgdCB2YWx1ZS5cbiAgICogQHByaXZhdGVcbiAgICpcbiAgICogQHBhcmFtIHtFZGdlfSBlZGdlXG4gICAqIEBwYXJhbSB7bnVtYmVyfSB0XG4gICAqIEBwYXJhbSB7VmVydGV4fSB2ZXJ0ZXggLSBUaGUgdmVydGV4IHRoYXQgaXMgcGxhY2VkIGF0IHRoZSBzcGxpdCBsb2NhdGlvblxuICAgKi9cbiAgc3BsaXRFZGdlKCBlZGdlLCB0LCB2ZXJ0ZXggKSB7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdGhpcy5ib3VuZGFyaWVzLmxlbmd0aCA9PT0gMCwgJ09ubHkgaGFuZGxlcyBzaW1wbGVyIGxldmVsIHByaW1pdGl2ZSBzcGxpdHRpbmcgcmlnaHQgbm93JyApO1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIGVkZ2Uuc3RhcnRWZXJ0ZXggIT09IHZlcnRleCApO1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIGVkZ2UuZW5kVmVydGV4ICE9PSB2ZXJ0ZXggKTtcblxuICAgIGNvbnN0IHNlZ21lbnRzID0gZWRnZS5zZWdtZW50LnN1YmRpdmlkZWQoIHQgKTtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBzZWdtZW50cy5sZW5ndGggPT09IDIgKTtcblxuICAgIGNvbnN0IGZpcnN0RWRnZSA9IEVkZ2UucG9vbC5jcmVhdGUoIHNlZ21lbnRzWyAwIF0sIGVkZ2Uuc3RhcnRWZXJ0ZXgsIHZlcnRleCApO1xuICAgIGNvbnN0IHNlY29uZEVkZ2UgPSBFZGdlLnBvb2wuY3JlYXRlKCBzZWdtZW50c1sgMSBdLCB2ZXJ0ZXgsIGVkZ2UuZW5kVmVydGV4ICk7XG5cbiAgICAvLyBSZW1vdmUgb2xkIGNvbm5lY3Rpb25zXG4gICAgdGhpcy5yZW1vdmVFZGdlKCBlZGdlICk7XG5cbiAgICAvLyBBZGQgbmV3IGNvbm5lY3Rpb25zXG4gICAgdGhpcy5hZGRFZGdlKCBmaXJzdEVkZ2UgKTtcbiAgICB0aGlzLmFkZEVkZ2UoIHNlY29uZEVkZ2UgKTtcblxuICAgIHRoaXMucmVwbGFjZUVkZ2VJbkxvb3BzKCBlZGdlLCBbIGZpcnN0RWRnZS5mb3J3YXJkSGFsZiwgc2Vjb25kRWRnZS5mb3J3YXJkSGFsZiBdICk7XG5cbiAgICByZXR1cm4gWyBmaXJzdEVkZ2UsIHNlY29uZEVkZ2UgXTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDb21iaW5lIHZlcnRpY2VzIHRoYXQgYXJlIGFsbW9zdCBleGFjdGx5IGluIHRoZSBzYW1lIHBsYWNlIChyZW1vdmluZyBlZGdlcyBhbmQgdmVydGljZXMgd2hlcmUgbmVjZXNzYXJ5KS5cbiAgICogQHByaXZhdGVcbiAgICovXG4gIGNvbGxhcHNlVmVydGljZXMoKSB7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggXy5ldmVyeSggdGhpcy5lZGdlcywgZWRnZSA9PiBfLmluY2x1ZGVzKCB0aGlzLnZlcnRpY2VzLCBlZGdlLnN0YXJ0VmVydGV4ICkgKSApO1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIF8uZXZlcnkoIHRoaXMuZWRnZXMsIGVkZ2UgPT4gXy5pbmNsdWRlcyggdGhpcy52ZXJ0aWNlcywgZWRnZS5lbmRWZXJ0ZXggKSApICk7XG5cbiAgICAvLyBXZSdsbCBleHBhbmQgYm91bmRzIGJ5IHRoaXMgYW1vdW50LCBzbyB0aGF0IFwiYWRqYWNlbnRcIiBib3VuZHMgKHdpdGggYSBwb3RlbnRpYWxseSBvdmVybGFwcGluZyB2ZXJ0aWNhbCBvclxuICAgIC8vIGhvcml6b250YWwgbGluZSkgd2lsbCBoYXZlIGEgbm9uLXplcm8gYW1vdW50IG9mIGFyZWEgb3ZlcmxhcHBpbmcuXG4gICAgY29uc3QgZXBzaWxvbiA9IDEwICogVkVSVEVYX0NPTExBUFNFX1RIUkVTSE9MRF9ESVNUQU5DRTsgLy8gVE9ETzogY291bGQgd2UgcmVkdWNlIHRoaXMgZmFjdG9yIHRvIGNsb3NlciB0byB0aGUgZGlzdGFuY2U/IGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9raXRlL2lzc3Vlcy85OFxuXG4gICAgLy8gT3VyIHF1ZXVlIHdpbGwgc3RvcmUgZW50cmllcyBvZiB7IHN0YXJ0OiBib29sZWFuLCB2ZXJ0ZXg6IFZlcnRleCB9LCByZXByZXNlbnRpbmcgYSBzd2VlcCBsaW5lIHNpbWlsYXIgdG8gdGhlXG4gICAgLy8gQmVudGxleS1PdHRtYW5uIGFwcHJvYWNoLiBXZSdsbCB0cmFjayB3aGljaCBlZGdlcyBhcmUgcGFzc2luZyB0aHJvdWdoIHRoZSBzd2VlcCBsaW5lLlxuICAgIGNvbnN0IHF1ZXVlID0gbmV3IHdpbmRvdy5GbGF0UXVldWUoKTtcblxuICAgIC8vIFRyYWNrcyB3aGljaCB2ZXJ0aWNlcyBhcmUgdGhyb3VnaCB0aGUgc3dlZXAgbGluZSwgYnV0IGluIGEgZ3JhcGggc3RydWN0dXJlIGxpa2UgYSBzZWdtZW50L2ludGVydmFsIHRyZWUsIHNvIHRoYXRcbiAgICAvLyB3ZSBjYW4gaGF2ZSBmYXN0IGxvb2t1cCAod2hhdCB2ZXJ0aWNlcyBhcmUgaW4gYSBjZXJ0YWluIHJhbmdlKSBhbmQgYWxzbyBmYXN0IGluc2VydHMvcmVtb3ZhbHMuXG4gICAgY29uc3Qgc2VnbWVudFRyZWUgPSBuZXcgVmVydGV4U2VnbWVudFRyZWUoIGVwc2lsb24gKTtcblxuICAgIC8vIEFzc29ydGVkIG9wZXJhdGlvbnMgdXNlIGEgc2hvcnRjdXQgdG8gXCJ0YWdcIiB2ZXJ0aWNlcyB3aXRoIGEgdW5pcXVlIElELCB0byBpbmRpY2F0ZSBpdCBoYXMgYWxyZWFkeSBiZWVuIHByb2Nlc3NlZFxuICAgIC8vIGZvciB0aGlzIGNhbGwgb2YgZWxpbWluYXRlT3ZlcmxhcCgpLiBUaGlzIGlzIGEgaGlnaGVyLXBlcmZvcm1hbmNlIG9wdGlvbiB0byBzdG9yaW5nIGFuIGFycmF5IG9mIFwiYWxyZWFkeVxuICAgIC8vIHByb2Nlc3NlZFwiIGVkZ2VzLlxuICAgIGNvbnN0IG5leHRJZCA9IGdsb2JhbElkKys7XG5cbiAgICAvLyBBZGRzIGFuIHZlcnRleCB0byB0aGUgcXVldWVcbiAgICBjb25zdCBhZGRUb1F1ZXVlID0gdmVydGV4ID0+IHtcbiAgICAgIC8vIFRPRE86IHNlZSBpZiBvYmplY3QgYWxsb2NhdGlvbnMgYXJlIHNsb3cgaGVyZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMva2l0ZS9pc3N1ZXMvNzZcbiAgICAgIHF1ZXVlLnB1c2goIHsgc3RhcnQ6IHRydWUsIHZlcnRleDogdmVydGV4IH0sIHZlcnRleC5wb2ludC55IC0gZXBzaWxvbiApO1xuICAgICAgcXVldWUucHVzaCggeyBzdGFydDogZmFsc2UsIHZlcnRleDogdmVydGV4IH0sIHZlcnRleC5wb2ludC55ICsgZXBzaWxvbiApO1xuICAgIH07XG5cbiAgICAvLyBSZW1vdmVzIGEgdmVydGV4IGZyb20gdGhlIHF1ZXVlIChlZmZlY3RpdmVseS4uLiB3aGVuIHdlIHBvcCBmcm9tIHRoZSBxdWV1ZSwgd2UnbGwgY2hlY2sgaXRzIElEIGRhdGEsIGFuZCBpZiBpdFxuICAgIC8vIHdhcyBcInJlbW92ZWRcIiB3ZSB3aWxsIGlnbm9yZSBpdC4gSGlnaGVyLXBlcmZvcm1hbmNlIHRoYW4gdXNpbmcgYW4gYXJyYXkuXG4gICAgY29uc3QgcmVtb3ZlRnJvbVF1ZXVlID0gdmVydGV4ID0+IHtcbiAgICAgIC8vIFN0b3JlIHRoZSBJRCBzbyB3ZSBjYW4gaGF2ZSBhIGhpZ2gtcGVyZm9ybWFuY2UgcmVtb3ZhbFxuICAgICAgdmVydGV4LmludGVybmFsRGF0YS5yZW1vdmVkSWQgPSBuZXh0SWQ7XG4gICAgfTtcblxuICAgIGZvciAoIGxldCBpID0gMDsgaSA8IHRoaXMudmVydGljZXMubGVuZ3RoOyBpKysgKSB7XG4gICAgICBhZGRUb1F1ZXVlKCB0aGlzLnZlcnRpY2VzWyBpIF0gKTtcbiAgICB9XG5cbiAgICAvLyBXZSB0cmFjayB2ZXJ0aWNlcyB0byBkaXNwb3NlIHNlcGFyYXRlbHksIGluc3RlYWQgb2Ygc3luY2hyb25vdXNseSBkaXNwb3NpbmcgdGhlbS4gVGhpcyBpcyBtYWlubHkgZHVlIHRvIHRoZSB0cmlja1xuICAgIC8vIG9mIHJlbW92YWwgSURzLCBzaW5jZSBpZiB3ZSByZS11c2VkIHBvb2xlZCBWZXJ0aWNlcyB3aGVuIGNyZWF0aW5nLCB0aGV5IHdvdWxkIHN0aWxsIGhhdmUgdGhlIElEIE9SIHRoZXkgd291bGRcbiAgICAvLyBsb3NlIHRoZSBcInJlbW92ZWRcIiBpbmZvcm1hdGlvbi5cbiAgICBjb25zdCB2ZXJ0aWNlc1RvRGlzcG9zZSA9IFtdO1xuXG4gICAgd2hpbGUgKCBxdWV1ZS5sZW5ndGggKSB7XG4gICAgICBjb25zdCBlbnRyeSA9IHF1ZXVlLnBvcCgpO1xuICAgICAgY29uc3QgdmVydGV4ID0gZW50cnkudmVydGV4O1xuXG4gICAgICAvLyBTa2lwIHZlcnRpY2VzIHdlIGFscmVhZHkgcmVtb3ZlZFxuICAgICAgaWYgKCB2ZXJ0ZXguaW50ZXJuYWxEYXRhLnJlbW92ZWRJZCA9PT0gbmV4dElkICkge1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cblxuICAgICAgaWYgKCBlbnRyeS5zdGFydCApIHtcbiAgICAgICAgLy8gV2UnbGwgYmFpbCBvdXQgb2YgdGhlIGxvb3AgaWYgd2UgZmluZCBvdmVybGFwcywgYW5kIHdlJ2xsIHN0b3JlIHRoZSByZWxldmFudCBpbmZvcm1hdGlvbiBpbiB0aGVzZVxuICAgICAgICBsZXQgZm91bmQgPSBmYWxzZTtcbiAgICAgICAgbGV0IG92ZXJsYXBwZWRWZXJ0ZXg7XG4gICAgICAgIGxldCBhZGRlZFZlcnRpY2VzO1xuXG4gICAgICAgIC8vIFRPRE86IElzIHRoaXMgY2xvc3VyZSBraWxsaW5nIHBlcmZvcm1hbmNlPyBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMva2l0ZS9pc3N1ZXMvNzZcbiAgICAgICAgc2VnbWVudFRyZWUucXVlcnkoIHZlcnRleCwgb3RoZXJWZXJ0ZXggPT4ge1xuICAgICAgICAgIGNvbnN0IGRpc3RhbmNlID0gdmVydGV4LnBvaW50LmRpc3RhbmNlKCBvdGhlclZlcnRleC5wb2ludCApO1xuICAgICAgICAgIGlmICggZGlzdGFuY2UgPCBWRVJURVhfQ09MTEFQU0VfVEhSRVNIT0xEX0RJU1RBTkNFICkge1xuXG4gICAgICAgICAgICAgIGNvbnN0IG5ld1ZlcnRleCA9IFZlcnRleC5wb29sLmNyZWF0ZSggZGlzdGFuY2UgPT09IDAgPyB2ZXJ0ZXgucG9pbnQgOiB2ZXJ0ZXgucG9pbnQuYXZlcmFnZSggb3RoZXJWZXJ0ZXgucG9pbnQgKSApO1xuICAgICAgICAgICAgICB0aGlzLnZlcnRpY2VzLnB1c2goIG5ld1ZlcnRleCApO1xuXG4gICAgICAgICAgICAgIGFycmF5UmVtb3ZlKCB0aGlzLnZlcnRpY2VzLCB2ZXJ0ZXggKTtcbiAgICAgICAgICAgICAgYXJyYXlSZW1vdmUoIHRoaXMudmVydGljZXMsIG90aGVyVmVydGV4ICk7XG4gICAgICAgICAgICAgIGZvciAoIGxldCBrID0gdGhpcy5lZGdlcy5sZW5ndGggLSAxOyBrID49IDA7IGstLSApIHtcbiAgICAgICAgICAgICAgICBjb25zdCBlZGdlID0gdGhpcy5lZGdlc1sgayBdO1xuICAgICAgICAgICAgICAgIGNvbnN0IHN0YXJ0TWF0Y2hlcyA9IGVkZ2Uuc3RhcnRWZXJ0ZXggPT09IHZlcnRleCB8fCBlZGdlLnN0YXJ0VmVydGV4ID09PSBvdGhlclZlcnRleDtcbiAgICAgICAgICAgICAgICBjb25zdCBlbmRNYXRjaGVzID0gZWRnZS5lbmRWZXJ0ZXggPT09IHZlcnRleCB8fCBlZGdlLmVuZFZlcnRleCA9PT0gb3RoZXJWZXJ0ZXg7XG5cbiAgICAgICAgICAgICAgICAvLyBPdXRyaWdodCByZW1vdmUgZWRnZXMgdGhhdCB3ZXJlIGJldHdlZW4gQSBhbmQgQiB0aGF0IGFyZW4ndCBsb29wc1xuICAgICAgICAgICAgICAgIGlmICggc3RhcnRNYXRjaGVzICYmIGVuZE1hdGNoZXMgKSB7XG4gICAgICAgICAgICAgICAgICBpZiAoICggZWRnZS5zZWdtZW50LmJvdW5kcy53aWR0aCA+IDFlLTUgfHwgZWRnZS5zZWdtZW50LmJvdW5kcy5oZWlnaHQgPiAxZS01ICkgJiZcbiAgICAgICAgICAgICAgICAgICAgICAgKCBlZGdlLnNlZ21lbnQgaW5zdGFuY2VvZiBDdWJpYyB8fCBlZGdlLnNlZ21lbnQgaW5zdGFuY2VvZiBBcmMgfHwgZWRnZS5zZWdtZW50IGluc3RhbmNlb2YgRWxsaXB0aWNhbEFyYyApICkge1xuICAgICAgICAgICAgICAgICAgICAvLyBSZXBsYWNlIGl0IHdpdGggYSBuZXcgZWRnZSB0aGF0IGlzIGZyb20gdGhlIHZlcnRleCB0byBpdHNlbGZcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgcmVwbGFjZW1lbnRFZGdlID0gRWRnZS5wb29sLmNyZWF0ZSggZWRnZS5zZWdtZW50LCBuZXdWZXJ0ZXgsIG5ld1ZlcnRleCApO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmFkZEVkZ2UoIHJlcGxhY2VtZW50RWRnZSApO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnJlcGxhY2VFZGdlSW5Mb29wcyggZWRnZSwgWyByZXBsYWNlbWVudEVkZ2UuZm9yd2FyZEhhbGYgXSApO1xuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMucmVwbGFjZUVkZ2VJbkxvb3BzKCBlZGdlLCBbXSApOyAvLyByZW1vdmUgdGhlIGVkZ2UgZnJvbSBsb29wcyB3aXRoIG5vIHJlcGxhY2VtZW50XG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICB0aGlzLnJlbW92ZUVkZ2UoIGVkZ2UgKTtcbiAgICAgICAgICAgICAgICAgIGVkZ2UuZGlzcG9zZSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIGlmICggc3RhcnRNYXRjaGVzICkge1xuICAgICAgICAgICAgICAgICAgZWRnZS5zdGFydFZlcnRleCA9IG5ld1ZlcnRleDtcbiAgICAgICAgICAgICAgICAgIG5ld1ZlcnRleC5pbmNpZGVudEhhbGZFZGdlcy5wdXNoKCBlZGdlLnJldmVyc2VkSGFsZiApO1xuICAgICAgICAgICAgICAgICAgZWRnZS51cGRhdGVSZWZlcmVuY2VzKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKCBlbmRNYXRjaGVzICkge1xuICAgICAgICAgICAgICAgICAgZWRnZS5lbmRWZXJ0ZXggPSBuZXdWZXJ0ZXg7XG4gICAgICAgICAgICAgICAgICBuZXdWZXJ0ZXguaW5jaWRlbnRIYWxmRWRnZXMucHVzaCggZWRnZS5mb3J3YXJkSGFsZiApO1xuICAgICAgICAgICAgICAgICAgZWRnZS51cGRhdGVSZWZlcmVuY2VzKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGFkZGVkVmVydGljZXMgPSBbIG5ld1ZlcnRleCBdO1xuICAgICAgICAgICAgZm91bmQgPSB0cnVlO1xuICAgICAgICAgICAgb3ZlcmxhcHBlZFZlcnRleCA9IG90aGVyVmVydGV4O1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9ICk7XG5cbiAgICAgICAgaWYgKCBmb3VuZCApIHtcbiAgICAgICAgICAvLyBXZSBoYXZlbid0IGFkZGVkIG91ciBlZGdlIHlldCwgc28gbm8gbmVlZCB0byByZW1vdmUgaXQuXG4gICAgICAgICAgc2VnbWVudFRyZWUucmVtb3ZlSXRlbSggb3ZlcmxhcHBlZFZlcnRleCApO1xuXG4gICAgICAgICAgLy8gQWRqdXN0IHRoZSBxdWV1ZVxuICAgICAgICAgIHJlbW92ZUZyb21RdWV1ZSggb3ZlcmxhcHBlZFZlcnRleCApO1xuICAgICAgICAgIHJlbW92ZUZyb21RdWV1ZSggdmVydGV4ICk7XG4gICAgICAgICAgZm9yICggbGV0IGkgPSAwOyBpIDwgYWRkZWRWZXJ0aWNlcy5sZW5ndGg7IGkrKyApIHtcbiAgICAgICAgICAgIGFkZFRvUXVldWUoIGFkZGVkVmVydGljZXNbIGkgXSApO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIHZlcnRpY2VzVG9EaXNwb3NlLnB1c2goIHZlcnRleCApO1xuICAgICAgICAgIHZlcnRpY2VzVG9EaXNwb3NlLnB1c2goIG92ZXJsYXBwZWRWZXJ0ZXggKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAvLyBObyBvdmVybGFwcyBmb3VuZCwgYWRkIGl0IGFuZCBjb250aW51ZVxuICAgICAgICAgIHNlZ21lbnRUcmVlLmFkZEl0ZW0oIHZlcnRleCApO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgLy8gUmVtb3ZhbCBjYW4ndCB0cmlnZ2VyIGFuIGludGVyc2VjdGlvbiwgc28gd2UgY2FuIHNhZmVseSByZW1vdmUgaXRcbiAgICAgICAgc2VnbWVudFRyZWUucmVtb3ZlSXRlbSggdmVydGV4ICk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgdmVydGljZXNUb0Rpc3Bvc2UubGVuZ3RoOyBpKysgKSB7XG4gICAgICB2ZXJ0aWNlc1RvRGlzcG9zZVsgaSBdLmRpc3Bvc2UoKTtcbiAgICB9XG5cbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBfLmV2ZXJ5KCB0aGlzLmVkZ2VzLCBlZGdlID0+IF8uaW5jbHVkZXMoIHRoaXMudmVydGljZXMsIGVkZ2Uuc3RhcnRWZXJ0ZXggKSApICk7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggXy5ldmVyeSggdGhpcy5lZGdlcywgZWRnZSA9PiBfLmluY2x1ZGVzKCB0aGlzLnZlcnRpY2VzLCBlZGdlLmVuZFZlcnRleCApICkgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTY2FuIGEgZ2l2ZW4gdmVydGV4IGZvciBicmlkZ2VzIHJlY3Vyc2l2ZWx5IHdpdGggYSBkZXB0aC1maXJzdCBzZWFyY2guXG4gICAqIEBwcml2YXRlXG4gICAqXG4gICAqIFJlY29yZHMgdmlzaXQgdGltZXMgdG8gZWFjaCB2ZXJ0ZXgsIGFuZCBiYWNrLXByb3BhZ2F0ZXMgc28gdGhhdCB3ZSBjYW4gZWZmaWNpZW50bHkgZGV0ZXJtaW5lIGlmIHRoZXJlIHdhcyBhbm90aGVyXG4gICAqIHBhdGggYXJvdW5kIHRvIHRoZSB2ZXJ0ZXguXG4gICAqXG4gICAqIEFzc3VtZXMgdGhpcyBpcyBvbmx5IGNhbGxlZCBvbmUgdGltZSBvbmNlIGFsbCBlZGdlcy92ZXJ0aWNlcyBhcmUgc2V0IHVwLiBSZXBlYXRlZCBjYWxscyB3aWxsIGZhaWwgYmVjYXVzZSB3ZVxuICAgKiBkb24ndCBtYXJrIHZpc2l0ZWQvZXRjLiByZWZlcmVuY2VzIGFnYWluIG9uIHN0YXJ0dXBcbiAgICpcbiAgICogU2VlIFRhcmphbidzIGFsZ29yaXRobSBmb3IgbW9yZSBpbmZvcm1hdGlvbi4gU29tZSBtb2RpZmljYXRpb25zIHdlcmUgbmVlZGVkLCBzaW5jZSB0aGlzIGlzIHRlY2huaWNhbGx5IGFcbiAgICogbXVsdGlncmFwaC9wc2V1ZG9ncmFwaCAoY2FuIGhhdmUgZWRnZXMgdGhhdCBoYXZlIHRoZSBzYW1lIHN0YXJ0L2VuZCB2ZXJ0ZXgsIGFuZCBjYW4gaGF2ZSBtdWx0aXBsZSBlZGdlc1xuICAgKiBnb2luZyBmcm9tIHRoZSBzYW1lIHR3byB2ZXJ0aWNlcykuXG4gICAqXG4gICAqIEBwYXJhbSB7QXJyYXkuPEVkZ2U+fSBicmlkZ2VzIC0gQXBwZW5kcyBicmlkZ2UgZWRnZXMgdG8gaGVyZS5cbiAgICogQHBhcmFtIHtWZXJ0ZXh9IHZlcnRleFxuICAgKi9cbiAgbWFya0JyaWRnZXMoIGJyaWRnZXMsIHZlcnRleCApIHtcbiAgICB2ZXJ0ZXgudmlzaXRlZCA9IHRydWU7XG4gICAgdmVydGV4LnZpc2l0SW5kZXggPSB2ZXJ0ZXgubG93SW5kZXggPSBicmlkZ2VJZCsrO1xuXG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgdmVydGV4LmluY2lkZW50SGFsZkVkZ2VzLmxlbmd0aDsgaSsrICkge1xuICAgICAgY29uc3QgZWRnZSA9IHZlcnRleC5pbmNpZGVudEhhbGZFZGdlc1sgaSBdLmVkZ2U7XG4gICAgICBjb25zdCBjaGlsZFZlcnRleCA9IHZlcnRleC5pbmNpZGVudEhhbGZFZGdlc1sgaSBdLnN0YXJ0VmVydGV4OyAvLyBieSBkZWZpbml0aW9uLCBvdXIgdmVydGV4IHNob3VsZCBiZSB0aGUgZW5kVmVydGV4XG4gICAgICBpZiAoICFjaGlsZFZlcnRleC52aXNpdGVkICkge1xuICAgICAgICBlZGdlLnZpc2l0ZWQgPSB0cnVlO1xuICAgICAgICBjaGlsZFZlcnRleC5wYXJlbnQgPSB2ZXJ0ZXg7XG4gICAgICAgIHRoaXMubWFya0JyaWRnZXMoIGJyaWRnZXMsIGNoaWxkVmVydGV4ICk7XG5cbiAgICAgICAgLy8gQ2hlY2sgaWYgdGhlcmUncyBhbm90aGVyIHJvdXRlIHRoYXQgcmVhY2hlcyBiYWNrIHRvIG91ciB2ZXJ0ZXggZnJvbSBhbiBhbmNlc3RvclxuICAgICAgICB2ZXJ0ZXgubG93SW5kZXggPSBNYXRoLm1pbiggdmVydGV4Lmxvd0luZGV4LCBjaGlsZFZlcnRleC5sb3dJbmRleCApO1xuXG4gICAgICAgIC8vIElmIHRoZXJlIHdhcyBubyByb3V0ZSwgdGhlbiB3ZSByZWFjaGVkIGEgYnJpZGdlXG4gICAgICAgIGlmICggY2hpbGRWZXJ0ZXgubG93SW5kZXggPiB2ZXJ0ZXgudmlzaXRJbmRleCApIHtcbiAgICAgICAgICBicmlkZ2VzLnB1c2goIGVkZ2UgKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgZWxzZSBpZiAoICFlZGdlLnZpc2l0ZWQgKSB7XG4gICAgICAgIHZlcnRleC5sb3dJbmRleCA9IE1hdGgubWluKCB2ZXJ0ZXgubG93SW5kZXgsIGNoaWxkVmVydGV4LnZpc2l0SW5kZXggKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogUmVtb3ZlcyBlZGdlcyB0aGF0IGFyZSB0aGUgb25seSBlZGdlIGhvbGRpbmcgdHdvIGNvbm5lY3RlZCBjb21wb25lbnRzIHRvZ2V0aGVyLiBCYXNlZCBvbiBvdXIgcHJvYmxlbSwgdGhlXG4gICAqIGZhY2Ugb24gZWl0aGVyIHNpZGUgb2YgdGhlIFwiYnJpZGdlXCIgZWRnZXMgd291bGQgYWx3YXlzIGJlIHRoZSBzYW1lLCBzbyB3ZSBjYW4gc2FmZWx5IHJlbW92ZSB0aGVtLlxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgcmVtb3ZlQnJpZGdlcygpIHtcbiAgICBjb25zdCBicmlkZ2VzID0gW107XG5cbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCB0aGlzLnZlcnRpY2VzLmxlbmd0aDsgaSsrICkge1xuICAgICAgY29uc3QgdmVydGV4ID0gdGhpcy52ZXJ0aWNlc1sgaSBdO1xuICAgICAgaWYgKCAhdmVydGV4LnZpc2l0ZWQgKSB7XG4gICAgICAgIHRoaXMubWFya0JyaWRnZXMoIGJyaWRnZXMsIHZlcnRleCApO1xuICAgICAgfVxuICAgIH1cblxuICAgIGZvciAoIGxldCBpID0gMDsgaSA8IGJyaWRnZXMubGVuZ3RoOyBpKysgKSB7XG4gICAgICBjb25zdCBicmlkZ2VFZGdlID0gYnJpZGdlc1sgaSBdO1xuXG4gICAgICB0aGlzLnJlbW92ZUVkZ2UoIGJyaWRnZUVkZ2UgKTtcbiAgICAgIHRoaXMucmVwbGFjZUVkZ2VJbkxvb3BzKCBicmlkZ2VFZGdlLCBbXSApO1xuICAgICAgYnJpZGdlRWRnZS5kaXNwb3NlKCk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFJlbW92ZXMgdmVydGljZXMgdGhhdCBoYXZlIG9yZGVyIGxlc3MgdGhhbiAyIChzbyBlaXRoZXIgYSB2ZXJ0ZXggd2l0aCBvbmUgb3IgemVybyBlZGdlcyBhZGphY2VudCkuXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICByZW1vdmVMb3dPcmRlclZlcnRpY2VzKCkge1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIF8uZXZlcnkoIHRoaXMuZWRnZXMsIGVkZ2UgPT4gXy5pbmNsdWRlcyggdGhpcy52ZXJ0aWNlcywgZWRnZS5zdGFydFZlcnRleCApICkgKTtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBfLmV2ZXJ5KCB0aGlzLmVkZ2VzLCBlZGdlID0+IF8uaW5jbHVkZXMoIHRoaXMudmVydGljZXMsIGVkZ2UuZW5kVmVydGV4ICkgKSApO1xuXG4gICAgbGV0IG5lZWRzTG9vcCA9IHRydWU7XG4gICAgd2hpbGUgKCBuZWVkc0xvb3AgKSB7XG4gICAgICBuZWVkc0xvb3AgPSBmYWxzZTtcblxuICAgICAgZm9yICggbGV0IGkgPSB0aGlzLnZlcnRpY2VzLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tICkge1xuICAgICAgICBjb25zdCB2ZXJ0ZXggPSB0aGlzLnZlcnRpY2VzWyBpIF07XG5cbiAgICAgICAgaWYgKCB2ZXJ0ZXguaW5jaWRlbnRIYWxmRWRnZXMubGVuZ3RoIDwgMiApIHtcbiAgICAgICAgICAvLyBEaXNjb25uZWN0IGFueSBleGlzdGluZyBlZGdlc1xuICAgICAgICAgIGZvciAoIGxldCBqID0gMDsgaiA8IHZlcnRleC5pbmNpZGVudEhhbGZFZGdlcy5sZW5ndGg7IGorKyApIHtcbiAgICAgICAgICAgIGNvbnN0IGVkZ2UgPSB2ZXJ0ZXguaW5jaWRlbnRIYWxmRWRnZXNbIGogXS5lZGdlO1xuICAgICAgICAgICAgdGhpcy5yZW1vdmVFZGdlKCBlZGdlICk7XG4gICAgICAgICAgICB0aGlzLnJlcGxhY2VFZGdlSW5Mb29wcyggZWRnZSwgW10gKTsgLy8gcmVtb3ZlIHRoZSBlZGdlIGZyb20gdGhlIGxvb3BzXG4gICAgICAgICAgICBlZGdlLmRpc3Bvc2UoKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyBSZW1vdmUgdGhlIHZlcnRleFxuICAgICAgICAgIHRoaXMudmVydGljZXMuc3BsaWNlKCBpLCAxICk7XG4gICAgICAgICAgdmVydGV4LmRpc3Bvc2UoKTtcblxuICAgICAgICAgIG5lZWRzTG9vcCA9IHRydWU7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggXy5ldmVyeSggdGhpcy5lZGdlcywgZWRnZSA9PiBfLmluY2x1ZGVzKCB0aGlzLnZlcnRpY2VzLCBlZGdlLnN0YXJ0VmVydGV4ICkgKSApO1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIF8uZXZlcnkoIHRoaXMuZWRnZXMsIGVkZ2UgPT4gXy5pbmNsdWRlcyggdGhpcy52ZXJ0aWNlcywgZWRnZS5lbmRWZXJ0ZXggKSApICk7XG4gIH1cblxuICAvKipcbiAgICogU29ydHMgaW5jaWRlbnQgaGFsZi1lZGdlcyBmb3IgZWFjaCB2ZXJ0ZXguXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBvcmRlclZlcnRleEVkZ2VzKCkge1xuICAgIGZvciAoIGxldCBpID0gMDsgaSA8IHRoaXMudmVydGljZXMubGVuZ3RoOyBpKysgKSB7XG4gICAgICB0aGlzLnZlcnRpY2VzWyBpIF0uc29ydEVkZ2VzKCk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIENyZWF0ZXMgYm91bmRhcmllcyBhbmQgZmFjZXMgYnkgZm9sbG93aW5nIGVhY2ggaGFsZi1lZGdlIGNvdW50ZXItY2xvY2t3aXNlXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBleHRyYWN0RmFjZXMoKSB7XG4gICAgY29uc3QgaGFsZkVkZ2VzID0gW107XG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgdGhpcy5lZGdlcy5sZW5ndGg7IGkrKyApIHtcbiAgICAgIGhhbGZFZGdlcy5wdXNoKCB0aGlzLmVkZ2VzWyBpIF0uZm9yd2FyZEhhbGYgKTtcbiAgICAgIGhhbGZFZGdlcy5wdXNoKCB0aGlzLmVkZ2VzWyBpIF0ucmV2ZXJzZWRIYWxmICk7XG4gICAgfVxuXG4gICAgd2hpbGUgKCBoYWxmRWRnZXMubGVuZ3RoICkge1xuICAgICAgY29uc3QgYm91bmRhcnlIYWxmRWRnZXMgPSBbXTtcbiAgICAgIGxldCBoYWxmRWRnZSA9IGhhbGZFZGdlc1sgMCBdO1xuICAgICAgY29uc3Qgc3RhcnRpbmdIYWxmRWRnZSA9IGhhbGZFZGdlO1xuICAgICAgd2hpbGUgKCBoYWxmRWRnZSApIHtcbiAgICAgICAgYXJyYXlSZW1vdmUoIGhhbGZFZGdlcywgaGFsZkVkZ2UgKTtcbiAgICAgICAgYm91bmRhcnlIYWxmRWRnZXMucHVzaCggaGFsZkVkZ2UgKTtcbiAgICAgICAgaGFsZkVkZ2UgPSBoYWxmRWRnZS5nZXROZXh0KCk7XG4gICAgICAgIGlmICggaGFsZkVkZ2UgPT09IHN0YXJ0aW5nSGFsZkVkZ2UgKSB7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGNvbnN0IGJvdW5kYXJ5ID0gQm91bmRhcnkucG9vbC5jcmVhdGUoIGJvdW5kYXJ5SGFsZkVkZ2VzICk7XG4gICAgICAoIGJvdW5kYXJ5LnNpZ25lZEFyZWEgPiAwID8gdGhpcy5pbm5lckJvdW5kYXJpZXMgOiB0aGlzLm91dGVyQm91bmRhcmllcyApLnB1c2goIGJvdW5kYXJ5ICk7XG4gICAgICB0aGlzLmJvdW5kYXJpZXMucHVzaCggYm91bmRhcnkgKTtcbiAgICB9XG5cbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCB0aGlzLmlubmVyQm91bmRhcmllcy5sZW5ndGg7IGkrKyApIHtcbiAgICAgIHRoaXMuZmFjZXMucHVzaCggRmFjZS5wb29sLmNyZWF0ZSggdGhpcy5pbm5lckJvdW5kYXJpZXNbIGkgXSApICk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEdpdmVuIHRoZSBpbm5lciBhbmQgb3V0ZXIgYm91bmRhcmllcywgaXQgY29tcHV0ZXMgYSB0cmVlIHJlcHJlc2VudGF0aW9uIHRvIGRldGVybWluZSB3aGF0IGJvdW5kYXJpZXMgYXJlXG4gICAqIGhvbGVzIG9mIHdoYXQgb3RoZXIgYm91bmRhcmllcywgdGhlbiBzZXRzIHVwIGZhY2UgaG9sZXMgd2l0aCB0aGUgcmVzdWx0LlxuICAgKiBAcHVibGljXG4gICAqXG4gICAqIFRoaXMgaW5mb3JtYXRpb24gaXMgc3RvcmVkIGluIHRoZSBjaGlsZEJvdW5kYXJpZXMgYXJyYXkgb2YgQm91bmRhcnksIGFuZCBpcyB0aGVuIHJlYWQgb3V0IHRvIHNldCB1cCBmYWNlcy5cbiAgICovXG4gIGNvbXB1dGVCb3VuZGFyeVRyZWUoKSB7XG4gICAgLy8gVE9ETzogZGV0ZWN0IFwiaW5kZXRlcm1pbmF0ZVwiIGZvciByb2J1c3RuZXNzIChhbmQgdHJ5IG5ldyBhbmdsZXM/KSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMva2l0ZS9pc3N1ZXMvNzZcbiAgICBjb25zdCB1bmJvdW5kZWRIb2xlcyA9IFtdOyAvLyB7QXJyYXkuPEJvdW5kYXJ5Pn1cblxuICAgIC8vIFdlJ2xsIHdhbnQgdG8gY29tcHV0ZSBhIHJheSBmb3IgZWFjaCBvdXRlciBib3VuZGFyeSB0aGF0IHN0YXJ0cyBhdCBhbiBleHRyZW1lIHBvaW50IGZvciB0aGF0IGRpcmVjdGlvbiBhbmRcbiAgICAvLyBjb250aW51ZXMgb3V0d2FyZHMuIFRoZSBuZXh0IGJvdW5kYXJ5IGl0IGludGVyc2VjdHMgd2lsbCBiZSBsaW5rZWQgdG9nZXRoZXIgaW4gdGhlIHRyZWUuXG4gICAgLy8gV2UgaGF2ZSBhIG1vc3RseS1hcmJpdHJhcnkgYW5nbGUgaGVyZSB0aGF0IGhvcGVmdWxseSB3b24ndCBiZSB1c2VkLlxuICAgIGNvbnN0IHRyYW5zZm9ybSA9IG5ldyBUcmFuc2Zvcm0zKCBNYXRyaXgzLnJvdGF0aW9uMiggMS41NzI5NjU3ICkgKTtcblxuICAgIGZvciAoIGxldCBpID0gMDsgaSA8IHRoaXMub3V0ZXJCb3VuZGFyaWVzLmxlbmd0aDsgaSsrICkge1xuICAgICAgY29uc3Qgb3V0ZXJCb3VuZGFyeSA9IHRoaXMub3V0ZXJCb3VuZGFyaWVzWyBpIF07XG5cbiAgICAgIGNvbnN0IHJheSA9IG91dGVyQm91bmRhcnkuY29tcHV0ZUV4dHJlbWVSYXkoIHRyYW5zZm9ybSApO1xuXG4gICAgICBsZXQgY2xvc2VzdEVkZ2UgPSBudWxsO1xuICAgICAgbGV0IGNsb3Nlc3REaXN0YW5jZSA9IE51bWJlci5QT1NJVElWRV9JTkZJTklUWTtcbiAgICAgIGxldCBjbG9zZXN0V2luZCA9IGZhbHNlO1xuXG4gICAgICBmb3IgKCBsZXQgaiA9IDA7IGogPCB0aGlzLmVkZ2VzLmxlbmd0aDsgaisrICkge1xuICAgICAgICBjb25zdCBlZGdlID0gdGhpcy5lZGdlc1sgaiBdO1xuXG4gICAgICAgIGNvbnN0IGludGVyc2VjdGlvbnMgPSBlZGdlLnNlZ21lbnQuaW50ZXJzZWN0aW9uKCByYXkgKTtcbiAgICAgICAgZm9yICggbGV0IGsgPSAwOyBrIDwgaW50ZXJzZWN0aW9ucy5sZW5ndGg7IGsrKyApIHtcbiAgICAgICAgICBjb25zdCBpbnRlcnNlY3Rpb24gPSBpbnRlcnNlY3Rpb25zWyBrIF07XG5cbiAgICAgICAgICBpZiAoIGludGVyc2VjdGlvbi5kaXN0YW5jZSA8IGNsb3Nlc3REaXN0YW5jZSApIHtcbiAgICAgICAgICAgIGNsb3Nlc3RFZGdlID0gZWRnZTtcbiAgICAgICAgICAgIGNsb3Nlc3REaXN0YW5jZSA9IGludGVyc2VjdGlvbi5kaXN0YW5jZTtcbiAgICAgICAgICAgIGNsb3Nlc3RXaW5kID0gaW50ZXJzZWN0aW9uLndpbmQ7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmICggY2xvc2VzdEVkZ2UgPT09IG51bGwgKSB7XG4gICAgICAgIHVuYm91bmRlZEhvbGVzLnB1c2goIG91dGVyQm91bmRhcnkgKTtcbiAgICAgIH1cbiAgICAgIGVsc2Uge1xuICAgICAgICBjb25zdCByZXZlcnNlZCA9IGNsb3Nlc3RXaW5kIDwgMDtcbiAgICAgICAgY29uc3QgY2xvc2VzdEhhbGZFZGdlID0gcmV2ZXJzZWQgPyBjbG9zZXN0RWRnZS5yZXZlcnNlZEhhbGYgOiBjbG9zZXN0RWRnZS5mb3J3YXJkSGFsZjtcbiAgICAgICAgY29uc3QgY2xvc2VzdEJvdW5kYXJ5ID0gdGhpcy5nZXRCb3VuZGFyeU9mSGFsZkVkZ2UoIGNsb3Nlc3RIYWxmRWRnZSApO1xuICAgICAgICBjbG9zZXN0Qm91bmRhcnkuY2hpbGRCb3VuZGFyaWVzLnB1c2goIG91dGVyQm91bmRhcnkgKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB1bmJvdW5kZWRIb2xlcy5mb3JFYWNoKCB0aGlzLnVuYm91bmRlZEZhY2UucmVjdXJzaXZlbHlBZGRIb2xlcy5iaW5kKCB0aGlzLnVuYm91bmRlZEZhY2UgKSApO1xuICAgIGZvciAoIGxldCBpID0gMDsgaSA8IHRoaXMuZmFjZXMubGVuZ3RoOyBpKysgKSB7XG4gICAgICBjb25zdCBmYWNlID0gdGhpcy5mYWNlc1sgaSBdO1xuICAgICAgaWYgKCBmYWNlLmJvdW5kYXJ5ICE9PSBudWxsICkge1xuICAgICAgICBmYWNlLmJvdW5kYXJ5LmNoaWxkQm91bmRhcmllcy5mb3JFYWNoKCBmYWNlLnJlY3Vyc2l2ZWx5QWRkSG9sZXMuYmluZCggZmFjZSApICk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIENvbXB1dGVzIHRoZSB3aW5kaW5nIG1hcCBmb3IgZWFjaCBmYWNlLCBzdGFydGluZyB3aXRoIDAgb24gdGhlIHVuYm91bmRlZCBmYWNlIChmb3IgZWFjaCBzaGFwZUlkKS5cbiAgICogQHByaXZhdGVcbiAgICovXG4gIGNvbXB1dGVXaW5kaW5nTWFwKCkge1xuICAgIGNvbnN0IGVkZ2VzID0gdGhpcy5lZGdlcy5zbGljZSgpO1xuXG4gICAgLy8gV2luZGluZyBudW1iZXJzIGZvciBcIm91dHNpZGVcIiBhcmUgMC5cbiAgICBjb25zdCBvdXRzaWRlTWFwID0ge307XG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgdGhpcy5zaGFwZUlkcy5sZW5ndGg7IGkrKyApIHtcbiAgICAgIG91dHNpZGVNYXBbIHRoaXMuc2hhcGVJZHNbIGkgXSBdID0gMDtcbiAgICB9XG4gICAgdGhpcy51bmJvdW5kZWRGYWNlLndpbmRpbmdNYXAgPSBvdXRzaWRlTWFwO1xuXG4gICAgLy8gV2UgaGF2ZSBcInNvbHZlZFwiIHRoZSB1bmJvdW5kZWQgZmFjZSwgYW5kIHRoZW4gaXRlcmF0aXZlbHkgZ28gb3ZlciB0aGUgZWRnZXMgbG9va2luZyBmb3IgYSBjYXNlIHdoZXJlIHdlIGhhdmVcbiAgICAvLyBzb2x2ZWQgb25lIG9mIHRoZSBmYWNlcyB0aGF0IGlzIGFkamFjZW50IHRvIHRoYXQgZWRnZS4gV2UgY2FuIHRoZW4gY29tcHV0ZSB0aGUgZGlmZmVyZW5jZSBiZXR3ZWVuIHdpbmRpbmdcbiAgICAvLyBudW1iZXJzIGJldHdlZW4gdGhlIHR3byBmYWNlcywgYW5kIHRodXMgZGV0ZXJtaW5lIHRoZSAoYWJzb2x1dGUpIHdpbmRpbmcgbnVtYmVycyBmb3IgdGhlIHVuc29sdmVkIGZhY2UuXG4gICAgd2hpbGUgKCBlZGdlcy5sZW5ndGggKSB7XG4gICAgICBmb3IgKCBsZXQgaiA9IGVkZ2VzLmxlbmd0aCAtIDE7IGogPj0gMDsgai0tICkge1xuICAgICAgICBjb25zdCBlZGdlID0gZWRnZXNbIGogXTtcblxuICAgICAgICBjb25zdCBmb3J3YXJkSGFsZiA9IGVkZ2UuZm9yd2FyZEhhbGY7XG4gICAgICAgIGNvbnN0IHJldmVyc2VkSGFsZiA9IGVkZ2UucmV2ZXJzZWRIYWxmO1xuXG4gICAgICAgIGNvbnN0IGZvcndhcmRGYWNlID0gZm9yd2FyZEhhbGYuZmFjZTtcbiAgICAgICAgY29uc3QgcmV2ZXJzZWRGYWNlID0gcmV2ZXJzZWRIYWxmLmZhY2U7XG4gICAgICAgIGFzc2VydCAmJiBhc3NlcnQoIGZvcndhcmRGYWNlICE9PSByZXZlcnNlZEZhY2UgKTtcblxuICAgICAgICBjb25zdCBzb2x2ZWRGb3J3YXJkID0gZm9yd2FyZEZhY2Uud2luZGluZ01hcCAhPT0gbnVsbDtcbiAgICAgICAgY29uc3Qgc29sdmVkUmV2ZXJzZWQgPSByZXZlcnNlZEZhY2Uud2luZGluZ01hcCAhPT0gbnVsbDtcblxuICAgICAgICBpZiAoIHNvbHZlZEZvcndhcmQgJiYgc29sdmVkUmV2ZXJzZWQgKSB7XG4gICAgICAgICAgZWRnZXMuc3BsaWNlKCBqLCAxICk7XG5cbiAgICAgICAgICBpZiAoIGFzc2VydCApIHtcbiAgICAgICAgICAgIGZvciAoIGxldCBtID0gMDsgbSA8IHRoaXMuc2hhcGVJZHMubGVuZ3RoOyBtKysgKSB7XG4gICAgICAgICAgICAgIGNvbnN0IGlkID0gdGhpcy5zaGFwZUlkc1sgbSBdO1xuICAgICAgICAgICAgICBhc3NlcnQoIGZvcndhcmRGYWNlLndpbmRpbmdNYXBbIGlkIF0gLSByZXZlcnNlZEZhY2Uud2luZGluZ01hcFsgaWQgXSA9PT0gdGhpcy5jb21wdXRlRGlmZmVyZW50aWFsKCBlZGdlLCBpZCApICk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKCAhc29sdmVkRm9yd2FyZCAmJiAhc29sdmVkUmV2ZXJzZWQgKSB7XG4gICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgY29uc3Qgc29sdmVkRmFjZSA9IHNvbHZlZEZvcndhcmQgPyBmb3J3YXJkRmFjZSA6IHJldmVyc2VkRmFjZTtcbiAgICAgICAgICBjb25zdCB1bnNvbHZlZEZhY2UgPSBzb2x2ZWRGb3J3YXJkID8gcmV2ZXJzZWRGYWNlIDogZm9yd2FyZEZhY2U7XG5cbiAgICAgICAgICBjb25zdCB3aW5kaW5nTWFwID0ge307XG4gICAgICAgICAgZm9yICggbGV0IGsgPSAwOyBrIDwgdGhpcy5zaGFwZUlkcy5sZW5ndGg7IGsrKyApIHtcbiAgICAgICAgICAgIGNvbnN0IHNoYXBlSWQgPSB0aGlzLnNoYXBlSWRzWyBrIF07XG4gICAgICAgICAgICBjb25zdCBkaWZmZXJlbnRpYWwgPSB0aGlzLmNvbXB1dGVEaWZmZXJlbnRpYWwoIGVkZ2UsIHNoYXBlSWQgKTtcbiAgICAgICAgICAgIHdpbmRpbmdNYXBbIHNoYXBlSWQgXSA9IHNvbHZlZEZhY2Uud2luZGluZ01hcFsgc2hhcGVJZCBdICsgZGlmZmVyZW50aWFsICogKCBzb2x2ZWRGb3J3YXJkID8gLTEgOiAxICk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHVuc29sdmVkRmFjZS53aW5kaW5nTWFwID0gd2luZGluZ01hcDtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBDb21wdXRlcyB0aGUgZGlmZmVyZW50aWFsIGluIHdpbmRpbmcgbnVtYmVycyAoZm9yd2FyZCBmYWNlIHdpbmRpbmcgbnVtYmVyIG1pbnVzIHRoZSByZXZlcnNlZCBmYWNlIHdpbmRpbmcgbnVtYmVyKVxuICAgKiAoXCJmb3J3YXJkIGZhY2VcIiBpcyB0aGUgZmFjZSBvbiB0aGUgZm9yd2FyZCBoYWxmLWVkZ2Ugc2lkZSwgZXRjLilcbiAgICogQHByaXZhdGVcbiAgICpcbiAgICogQHBhcmFtIHtFZGdlfSBlZGdlXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBzaGFwZUlkXG4gICAqIEByZXR1cm5zIHtudW1iZXJ9IC0gVGhlIGRpZmZlcmVuY2UgYmV0d2VlbiBmb3J3YXJkIGZhY2UgYW5kIHJldmVyc2VkIGZhY2Ugd2luZGluZyBudW1iZXJzLlxuICAgKi9cbiAgY29tcHV0ZURpZmZlcmVudGlhbCggZWRnZSwgc2hhcGVJZCApIHtcbiAgICBsZXQgZGlmZmVyZW50aWFsID0gMDsgLy8gZm9yd2FyZCBmYWNlIC0gcmV2ZXJzZWQgZmFjZVxuICAgIGZvciAoIGxldCBtID0gMDsgbSA8IHRoaXMubG9vcHMubGVuZ3RoOyBtKysgKSB7XG4gICAgICBjb25zdCBsb29wID0gdGhpcy5sb29wc1sgbSBdO1xuICAgICAgYXNzZXJ0ICYmIGFzc2VydCggbG9vcC5jbG9zZWQsICdUaGlzIGlzIG9ubHkgZGVmaW5lZCB0byB3b3JrIGZvciBjbG9zZWQgbG9vcHMnICk7XG4gICAgICBpZiAoIGxvb3Auc2hhcGVJZCAhPT0gc2hhcGVJZCApIHtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG5cbiAgICAgIGZvciAoIGxldCBuID0gMDsgbiA8IGxvb3AuaGFsZkVkZ2VzLmxlbmd0aDsgbisrICkge1xuICAgICAgICBjb25zdCBsb29wSGFsZkVkZ2UgPSBsb29wLmhhbGZFZGdlc1sgbiBdO1xuICAgICAgICBpZiAoIGxvb3BIYWxmRWRnZSA9PT0gZWRnZS5mb3J3YXJkSGFsZiApIHtcbiAgICAgICAgICBkaWZmZXJlbnRpYWwrKztcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmICggbG9vcEhhbGZFZGdlID09PSBlZGdlLnJldmVyc2VkSGFsZiApIHtcbiAgICAgICAgICBkaWZmZXJlbnRpYWwtLTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gZGlmZmVyZW50aWFsO1xuICB9XG5cbiAgLyoqXG4gICAqIFNldHMgdGhlIHVuYm91bmRlZCBmYWNlIGFzIHVuZmlsbGVkLCBhbmQgdGhlbiBzZXRzIGVhY2ggZmFjZSdzIGZpbGwgc28gdGhhdCBlZGdlcyBzZXBhcmF0ZSBvbmUgZmlsbGVkIGZhY2Ugd2l0aFxuICAgKiBvbmUgdW5maWxsZWQgZmFjZS5cbiAgICogQHByaXZhdGVcbiAgICpcbiAgICogTk9URTogQmVzdCB0byBjYWxsIHRoaXMgb24gdGhlIHJlc3VsdCBmcm9tIGNyZWF0ZUZpbGxlZFN1YkdyYXBoKCksIHNpbmNlIGl0IHNob3VsZCBoYXZlIGd1YXJhbnRlZWQgcHJvcGVydGllc1xuICAgKiAgICAgICB0byBtYWtlIHRoaXMgY29uc2lzdGVudC4gTm90YWJseSwgYWxsIHZlcnRpY2VzIG5lZWQgdG8gaGF2ZSBhbiBldmVuIG9yZGVyIChudW1iZXIgb2YgZWRnZXMpXG4gICAqL1xuICBmaWxsQWx0ZXJuYXRpbmdGYWNlcygpIHtcbiAgICBsZXQgbnVsbEZhY2VGaWxsZWRDb3VudCA9IDA7XG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgdGhpcy5mYWNlcy5sZW5ndGg7IGkrKyApIHtcbiAgICAgIHRoaXMuZmFjZXNbIGkgXS5maWxsZWQgPSBudWxsO1xuICAgICAgbnVsbEZhY2VGaWxsZWRDb3VudCsrO1xuICAgIH1cblxuICAgIHRoaXMudW5ib3VuZGVkRmFjZS5maWxsZWQgPSBmYWxzZTtcbiAgICBudWxsRmFjZUZpbGxlZENvdW50LS07XG5cbiAgICB3aGlsZSAoIG51bGxGYWNlRmlsbGVkQ291bnQgKSB7XG4gICAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCB0aGlzLmVkZ2VzLmxlbmd0aDsgaSsrICkge1xuICAgICAgICBjb25zdCBlZGdlID0gdGhpcy5lZGdlc1sgaSBdO1xuICAgICAgICBjb25zdCBmb3J3YXJkRmFjZSA9IGVkZ2UuZm9yd2FyZEhhbGYuZmFjZTtcbiAgICAgICAgY29uc3QgcmV2ZXJzZWRGYWNlID0gZWRnZS5yZXZlcnNlZEhhbGYuZmFjZTtcblxuICAgICAgICBjb25zdCBmb3J3YXJkTnVsbCA9IGZvcndhcmRGYWNlLmZpbGxlZCA9PT0gbnVsbDtcbiAgICAgICAgY29uc3QgcmV2ZXJzZWROdWxsID0gcmV2ZXJzZWRGYWNlLmZpbGxlZCA9PT0gbnVsbDtcblxuICAgICAgICBpZiAoIGZvcndhcmROdWxsICYmICFyZXZlcnNlZE51bGwgKSB7XG4gICAgICAgICAgZm9yd2FyZEZhY2UuZmlsbGVkID0gIXJldmVyc2VkRmFjZS5maWxsZWQ7XG4gICAgICAgICAgbnVsbEZhY2VGaWxsZWRDb3VudC0tO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKCAhZm9yd2FyZE51bGwgJiYgcmV2ZXJzZWROdWxsICkge1xuICAgICAgICAgIHJldmVyc2VkRmFjZS5maWxsZWQgPSAhZm9yd2FyZEZhY2UuZmlsbGVkO1xuICAgICAgICAgIG51bGxGYWNlRmlsbGVkQ291bnQtLTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBib3VuZGFyeSB0aGF0IGNvbnRhaW5zIHRoZSBzcGVjaWZpZWQgaGFsZi1lZGdlLlxuICAgKiBAcHJpdmF0ZVxuICAgKlxuICAgKiBUT0RPOiBmaW5kIGEgYmV0dGVyIHdheSwgdGhpcyBpcyBjcmF6eSBpbmVmZmljaWVudCBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMva2l0ZS9pc3N1ZXMvNzZcbiAgICpcbiAgICogQHBhcmFtIHtIYWxmRWRnZX0gaGFsZkVkZ2VcbiAgICogQHJldHVybnMge0JvdW5kYXJ5fVxuICAgKi9cbiAgZ2V0Qm91bmRhcnlPZkhhbGZFZGdlKCBoYWxmRWRnZSApIHtcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCB0aGlzLmJvdW5kYXJpZXMubGVuZ3RoOyBpKysgKSB7XG4gICAgICBjb25zdCBib3VuZGFyeSA9IHRoaXMuYm91bmRhcmllc1sgaSBdO1xuXG4gICAgICBpZiAoIGJvdW5kYXJ5Lmhhc0hhbGZFZGdlKCBoYWxmRWRnZSApICkge1xuICAgICAgICByZXR1cm4gYm91bmRhcnk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgdGhyb3cgbmV3IEVycm9yKCAnQ291bGQgbm90IGZpbmQgYm91bmRhcnknICk7XG4gIH1cblxuICAvLyBAcHVibGljXG4gIHN0YXRpYyBpc0ludGVybmFsKCBwb2ludCwgdCwgc2VnbWVudCwgZGlzdGFuY2VUaHJlc2hvbGQsIHRUaHJlc2hvbGQgKSB7XG4gICAgcmV0dXJuIHQgPiB0VGhyZXNob2xkICYmXG4gICAgICAgICAgIHQgPCAoIDEgLSB0VGhyZXNob2xkICkgJiZcbiAgICAgICAgICAgcG9pbnQuZGlzdGFuY2UoIHNlZ21lbnQuc3RhcnQgKSA+IGRpc3RhbmNlVGhyZXNob2xkICYmXG4gICAgICAgICAgIHBvaW50LmRpc3RhbmNlKCBzZWdtZW50LmVuZCApID4gZGlzdGFuY2VUaHJlc2hvbGQ7XG4gIH1cblxuICAvKipcbiAgICogXCJVbmlvblwiIGJpbmFyeSB3aW5kaW5nIG1hcCBmaWx0ZXIgZm9yIHVzZSB3aXRoIEdyYXBoLmJpbmFyeVJlc3VsdC5cbiAgICogQHB1YmxpY1xuICAgKlxuICAgKiBUaGlzIGNvbWJpbmVzIGJvdGggc2hhcGVzIHRvZ2V0aGVyIHNvIHRoYXQgYSBwb2ludCBpcyBpbiB0aGUgcmVzdWx0aW5nIHNoYXBlIGlmIGl0IHdhcyBpbiBlaXRoZXIgb2YgdGhlIGlucHV0XG4gICAqIHNoYXBlcy5cbiAgICpcbiAgICogQHBhcmFtIHtPYmplY3R9IHdpbmRpbmdNYXAgLSBTZWUgY29tcHV0ZUZhY2VJbmNsdXNpb24gZm9yIG1vcmUgZGV0YWlsc1xuICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAgICovXG4gIHN0YXRpYyBCSU5BUllfTk9OWkVST19VTklPTiggd2luZGluZ01hcCApIHtcbiAgICByZXR1cm4gd2luZGluZ01hcFsgJzAnIF0gIT09IDAgfHwgd2luZGluZ01hcFsgJzEnIF0gIT09IDA7XG4gIH1cblxuICAvKipcbiAgICogXCJJbnRlcnNlY3Rpb25cIiBiaW5hcnkgd2luZGluZyBtYXAgZmlsdGVyIGZvciB1c2Ugd2l0aCBHcmFwaC5iaW5hcnlSZXN1bHQuXG4gICAqIEBwdWJsaWNcbiAgICpcbiAgICogVGhpcyBjb21iaW5lcyBib3RoIHNoYXBlcyB0b2dldGhlciBzbyB0aGF0IGEgcG9pbnQgaXMgaW4gdGhlIHJlc3VsdGluZyBzaGFwZSBpZiBpdCB3YXMgaW4gYm90aCBvZiB0aGUgaW5wdXRcbiAgICogc2hhcGVzLlxuICAgKlxuICAgKiBAcGFyYW0ge09iamVjdH0gd2luZGluZ01hcCAtIFNlZSBjb21wdXRlRmFjZUluY2x1c2lvbiBmb3IgbW9yZSBkZXRhaWxzXG4gICAqIEByZXR1cm5zIHtib29sZWFufVxuICAgKi9cbiAgc3RhdGljIEJJTkFSWV9OT05aRVJPX0lOVEVSU0VDVElPTiggd2luZGluZ01hcCApIHtcbiAgICByZXR1cm4gd2luZGluZ01hcFsgJzAnIF0gIT09IDAgJiYgd2luZGluZ01hcFsgJzEnIF0gIT09IDA7XG4gIH1cblxuICAvKipcbiAgICogXCJEaWZmZXJlbmNlXCIgYmluYXJ5IHdpbmRpbmcgbWFwIGZpbHRlciBmb3IgdXNlIHdpdGggR3JhcGguYmluYXJ5UmVzdWx0LlxuICAgKiBAcHVibGljXG4gICAqXG4gICAqIFRoaXMgY29tYmluZXMgYm90aCBzaGFwZXMgdG9nZXRoZXIgc28gdGhhdCBhIHBvaW50IGlzIGluIHRoZSByZXN1bHRpbmcgc2hhcGUgaWYgaXQgd2FzIGluIHRoZSBmaXJzdCBzaGFwZSBBTkRcbiAgICogd2FzIE5PVCBpbiB0aGUgc2Vjb25kIHNoYXBlLlxuICAgKlxuICAgKiBAcGFyYW0ge09iamVjdH0gd2luZGluZ01hcCAtIFNlZSBjb21wdXRlRmFjZUluY2x1c2lvbiBmb3IgbW9yZSBkZXRhaWxzXG4gICAqIEByZXR1cm5zIHtib29sZWFufVxuICAgKi9cbiAgc3RhdGljIEJJTkFSWV9OT05aRVJPX0RJRkZFUkVOQ0UoIHdpbmRpbmdNYXAgKSB7XG4gICAgcmV0dXJuIHdpbmRpbmdNYXBbICcwJyBdICE9PSAwICYmIHdpbmRpbmdNYXBbICcxJyBdID09PSAwO1xuICB9XG5cbiAgLyoqXG4gICAqIFwiWE9SXCIgYmluYXJ5IHdpbmRpbmcgbWFwIGZpbHRlciBmb3IgdXNlIHdpdGggR3JhcGguYmluYXJ5UmVzdWx0LlxuICAgKiBAcHVibGljXG4gICAqXG4gICAqIFRoaXMgY29tYmluZXMgYm90aCBzaGFwZXMgdG9nZXRoZXIgc28gdGhhdCBhIHBvaW50IGlzIGluIHRoZSByZXN1bHRpbmcgc2hhcGUgaWYgaXQgaXMgb25seSBpbiBleGFjdGx5IG9uZSBvZiB0aGVcbiAgICogaW5wdXQgc2hhcGVzLiBJdCdzIGxpa2UgdGhlIHVuaW9uIG1pbnVzIGludGVyc2VjdGlvbi5cbiAgICpcbiAgICogQHBhcmFtIHtPYmplY3R9IHdpbmRpbmdNYXAgLSBTZWUgY29tcHV0ZUZhY2VJbmNsdXNpb24gZm9yIG1vcmUgZGV0YWlsc1xuICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAgICovXG4gIHN0YXRpYyBCSU5BUllfTk9OWkVST19YT1IoIHdpbmRpbmdNYXAgKSB7XG4gICAgcmV0dXJuICggKCB3aW5kaW5nTWFwWyAnMCcgXSAhPT0gMCApIF4gKCB3aW5kaW5nTWFwWyAnMScgXSAhPT0gMCApICkgPT09IDE7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tYml0d2lzZVxuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIHJlc3VsdGluZyBTaGFwZSBvYnRhaW5lZCBieSBjb21iaW5pbmcgdGhlIHR3byBzaGFwZXMgZ2l2ZW4gd2l0aCB0aGUgZmlsdGVyLlxuICAgKiBAcHVibGljXG4gICAqXG4gICAqIEBwYXJhbSB7U2hhcGV9IHNoYXBlQVxuICAgKiBAcGFyYW0ge1NoYXBlfSBzaGFwZUJcbiAgICogQHBhcmFtIHtmdW5jdGlvbn0gd2luZGluZ01hcEZpbHRlciAtIFNlZSBjb21wdXRlRmFjZUluY2x1c2lvbiBmb3IgZGV0YWlscyBvbiB0aGUgZm9ybWF0XG4gICAqIEByZXR1cm5zIHtTaGFwZX1cbiAgICovXG4gIHN0YXRpYyBiaW5hcnlSZXN1bHQoIHNoYXBlQSwgc2hhcGVCLCB3aW5kaW5nTWFwRmlsdGVyICkge1xuICAgIGNvbnN0IGdyYXBoID0gbmV3IEdyYXBoKCk7XG4gICAgZ3JhcGguYWRkU2hhcGUoIDAsIHNoYXBlQSApO1xuICAgIGdyYXBoLmFkZFNoYXBlKCAxLCBzaGFwZUIgKTtcblxuICAgIGdyYXBoLmNvbXB1dGVTaW1wbGlmaWVkRmFjZXMoKTtcbiAgICBncmFwaC5jb21wdXRlRmFjZUluY2x1c2lvbiggd2luZGluZ01hcEZpbHRlciApO1xuICAgIGNvbnN0IHN1YmdyYXBoID0gZ3JhcGguY3JlYXRlRmlsbGVkU3ViR3JhcGgoKTtcbiAgICBjb25zdCBzaGFwZSA9IHN1YmdyYXBoLmZhY2VzVG9TaGFwZSgpO1xuXG4gICAgZ3JhcGguZGlzcG9zZSgpO1xuICAgIHN1YmdyYXBoLmRpc3Bvc2UoKTtcblxuICAgIHJldHVybiBzaGFwZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSB1bmlvbiBvZiBhbiBhcnJheSBvZiBzaGFwZXMuXG4gICAqIEBwdWJsaWNcbiAgICpcbiAgICogQHBhcmFtIHtBcnJheS48U2hhcGU+fSBzaGFwZXNcbiAgICogQHJldHVybnMge1NoYXBlfVxuICAgKi9cbiAgc3RhdGljIHVuaW9uTm9uWmVybyggc2hhcGVzICkge1xuICAgIGNvbnN0IGdyYXBoID0gbmV3IEdyYXBoKCk7XG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgc2hhcGVzLmxlbmd0aDsgaSsrICkge1xuICAgICAgZ3JhcGguYWRkU2hhcGUoIGksIHNoYXBlc1sgaSBdICk7XG4gICAgfVxuXG4gICAgZ3JhcGguY29tcHV0ZVNpbXBsaWZpZWRGYWNlcygpO1xuICAgIGdyYXBoLmNvbXB1dGVGYWNlSW5jbHVzaW9uKCB3aW5kaW5nTWFwID0+IHtcbiAgICAgIGZvciAoIGxldCBqID0gMDsgaiA8IHNoYXBlcy5sZW5ndGg7IGorKyApIHtcbiAgICAgICAgaWYgKCB3aW5kaW5nTWFwWyBqIF0gIT09IDAgKSB7XG4gICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9ICk7XG4gICAgY29uc3Qgc3ViZ3JhcGggPSBncmFwaC5jcmVhdGVGaWxsZWRTdWJHcmFwaCgpO1xuICAgIGNvbnN0IHNoYXBlID0gc3ViZ3JhcGguZmFjZXNUb1NoYXBlKCk7XG5cbiAgICBncmFwaC5kaXNwb3NlKCk7XG4gICAgc3ViZ3JhcGguZGlzcG9zZSgpO1xuXG4gICAgcmV0dXJuIHNoYXBlO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIGludGVyc2VjdGlvbiBvZiBhbiBhcnJheSBvZiBzaGFwZXMuXG4gICAqIEBwdWJsaWNcbiAgICpcbiAgICogQHBhcmFtIHtBcnJheS48U2hhcGU+fSBzaGFwZXNcbiAgICogQHJldHVybnMge1NoYXBlfVxuICAgKi9cbiAgc3RhdGljIGludGVyc2VjdGlvbk5vblplcm8oIHNoYXBlcyApIHtcbiAgICBjb25zdCBncmFwaCA9IG5ldyBHcmFwaCgpO1xuICAgIGZvciAoIGxldCBpID0gMDsgaSA8IHNoYXBlcy5sZW5ndGg7IGkrKyApIHtcbiAgICAgIGdyYXBoLmFkZFNoYXBlKCBpLCBzaGFwZXNbIGkgXSApO1xuICAgIH1cblxuICAgIGdyYXBoLmNvbXB1dGVTaW1wbGlmaWVkRmFjZXMoKTtcbiAgICBncmFwaC5jb21wdXRlRmFjZUluY2x1c2lvbiggd2luZGluZ01hcCA9PiB7XG4gICAgICBmb3IgKCBsZXQgaiA9IDA7IGogPCBzaGFwZXMubGVuZ3RoOyBqKysgKSB7XG4gICAgICAgIGlmICggd2luZGluZ01hcFsgaiBdID09PSAwICkge1xuICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfSApO1xuICAgIGNvbnN0IHN1YmdyYXBoID0gZ3JhcGguY3JlYXRlRmlsbGVkU3ViR3JhcGgoKTtcbiAgICBjb25zdCBzaGFwZSA9IHN1YmdyYXBoLmZhY2VzVG9TaGFwZSgpO1xuXG4gICAgZ3JhcGguZGlzcG9zZSgpO1xuICAgIHN1YmdyYXBoLmRpc3Bvc2UoKTtcblxuICAgIHJldHVybiBzaGFwZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSB4b3Igb2YgYW4gYXJyYXkgb2Ygc2hhcGVzLlxuICAgKiBAcHVibGljXG4gICAqXG4gICAqIFRPRE86IHJlZHVjZSBjb2RlIGR1cGxpY2F0aW9uPyBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMva2l0ZS9pc3N1ZXMvNzZcbiAgICpcbiAgICogQHBhcmFtIHtBcnJheS48U2hhcGU+fSBzaGFwZXNcbiAgICogQHJldHVybnMge1NoYXBlfVxuICAgKi9cbiAgc3RhdGljIHhvck5vblplcm8oIHNoYXBlcyApIHtcbiAgICBjb25zdCBncmFwaCA9IG5ldyBHcmFwaCgpO1xuICAgIGZvciAoIGxldCBpID0gMDsgaSA8IHNoYXBlcy5sZW5ndGg7IGkrKyApIHtcbiAgICAgIGdyYXBoLmFkZFNoYXBlKCBpLCBzaGFwZXNbIGkgXSApO1xuICAgIH1cblxuICAgIGdyYXBoLmNvbXB1dGVTaW1wbGlmaWVkRmFjZXMoKTtcbiAgICBncmFwaC5jb21wdXRlRmFjZUluY2x1c2lvbiggd2luZGluZ01hcCA9PiB7XG4gICAgICBsZXQgaW5jbHVkZWQgPSBmYWxzZTtcbiAgICAgIGZvciAoIGxldCBqID0gMDsgaiA8IHNoYXBlcy5sZW5ndGg7IGorKyApIHtcbiAgICAgICAgaWYgKCB3aW5kaW5nTWFwWyBqIF0gIT09IDAgKSB7XG4gICAgICAgICAgaW5jbHVkZWQgPSAhaW5jbHVkZWQ7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiBpbmNsdWRlZDtcbiAgICB9ICk7XG4gICAgY29uc3Qgc3ViZ3JhcGggPSBncmFwaC5jcmVhdGVGaWxsZWRTdWJHcmFwaCgpO1xuICAgIGNvbnN0IHNoYXBlID0gc3ViZ3JhcGguZmFjZXNUb1NoYXBlKCk7XG5cbiAgICBncmFwaC5kaXNwb3NlKCk7XG4gICAgc3ViZ3JhcGguZGlzcG9zZSgpO1xuXG4gICAgcmV0dXJuIHNoYXBlO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgYSBzaW1wbGlmaWVkIFNoYXBlIG9idGFpbmVkIGZyb20gcnVubmluZyBpdCB0aHJvdWdoIHRoZSBzaW1wbGlmaWNhdGlvbiBzdGVwcyB3aXRoIG5vbi16ZXJvIG91dHB1dC5cbiAgICogQHB1YmxpY1xuICAgKlxuICAgKiBAcGFyYW0ge1NoYXBlfSBzaGFwZVxuICAgKiBAcmV0dXJucyB7U2hhcGV9XG4gICAqL1xuICBzdGF0aWMgc2ltcGxpZnlOb25aZXJvKCBzaGFwZSApIHtcbiAgICBjb25zdCBncmFwaCA9IG5ldyBHcmFwaCgpO1xuICAgIGdyYXBoLmFkZFNoYXBlKCAwLCBzaGFwZSApO1xuXG4gICAgZ3JhcGguY29tcHV0ZVNpbXBsaWZpZWRGYWNlcygpO1xuICAgIGdyYXBoLmNvbXB1dGVGYWNlSW5jbHVzaW9uKCBtYXAgPT4gbWFwWyAnMCcgXSAhPT0gMCApO1xuICAgIGNvbnN0IHN1YmdyYXBoID0gZ3JhcGguY3JlYXRlRmlsbGVkU3ViR3JhcGgoKTtcbiAgICBjb25zdCByZXN1bHRTaGFwZSA9IHN1YmdyYXBoLmZhY2VzVG9TaGFwZSgpO1xuXG4gICAgZ3JhcGguZGlzcG9zZSgpO1xuICAgIHN1YmdyYXBoLmRpc3Bvc2UoKTtcblxuICAgIHJldHVybiByZXN1bHRTaGFwZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGEgY2xpcHBlZCB2ZXJzaW9uIG9mIGBzaGFwZWAgdGhhdCBjb250YWlucyBvbmx5IHRoZSBwYXJ0cyB0aGF0IGFyZSB3aXRoaW4gdGhlIGFyZWEgZGVmaW5lZCBieVxuICAgKiBgY2xpcEFyZWFTaGFwZWBcbiAgICogQHB1YmxpY1xuICAgKlxuICAgKiBAcGFyYW0ge1NoYXBlfSBjbGlwQXJlYVNoYXBlXG4gICAqIEBwYXJhbSB7U2hhcGV9IHNoYXBlXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9uc11cbiAgICogQHJldHVybnMge1NoYXBlfVxuICAgKi9cbiAgc3RhdGljIGNsaXBTaGFwZSggY2xpcEFyZWFTaGFwZSwgc2hhcGUsIG9wdGlvbnMgKSB7XG4gICAgbGV0IGk7XG4gICAgbGV0IGo7XG4gICAgbGV0IGxvb3A7XG5cbiAgICBjb25zdCBTSEFQRV9JRCA9IDA7XG4gICAgY29uc3QgQ0xJUF9TSEFQRV9JRCA9IDE7XG5cbiAgICBvcHRpb25zID0gbWVyZ2UoIHtcbiAgICAgIC8vIHtib29sZWFufSAtIFJlc3BlY3RpdmVseSB3aGV0aGVyIHNlZ21lbnRzIHNob3VsZCBiZSBpbiB0aGUgcmV0dXJuZWQgc2hhcGUgaWYgdGhleSBhcmUgaW4gdGhlIGV4dGVyaW9yIG9mIHRoZVxuICAgICAgLy8gY2xpcEFyZWFTaGFwZSAob3V0c2lkZSksIG9uIHRoZSBib3VuZGFyeSwgb3IgaW4gdGhlIGludGVyaW9yLlxuICAgICAgaW5jbHVkZUV4dGVyaW9yOiBmYWxzZSxcbiAgICAgIGluY2x1ZGVCb3VuZGFyeTogdHJ1ZSxcbiAgICAgIGluY2x1ZGVJbnRlcmlvcjogdHJ1ZVxuICAgIH0sIG9wdGlvbnMgKTtcblxuICAgIGNvbnN0IHNpbXBsaWZpZWRDbGlwQXJlYVNoYXBlID0gR3JhcGguc2ltcGxpZnlOb25aZXJvKCBjbGlwQXJlYVNoYXBlICk7XG5cbiAgICBjb25zdCBncmFwaCA9IG5ldyBHcmFwaCgpO1xuICAgIGdyYXBoLmFkZFNoYXBlKCBTSEFQRV9JRCwgc2hhcGUsIHtcbiAgICAgIGVuc3VyZUNsb3NlZDogZmFsc2UgLy8gZG9uJ3QgYWRkIGNsb3Npbmcgc2VnbWVudHMsIHNpbmNlIHdlJ2xsIGJlIHJlY3JlYXRpbmcgc3VicGF0aHMvZXRjLlxuICAgIH0gKTtcbiAgICBncmFwaC5hZGRTaGFwZSggQ0xJUF9TSEFQRV9JRCwgc2ltcGxpZmllZENsaXBBcmVhU2hhcGUgKTtcblxuICAgIC8vIEEgc3Vic2V0IG9mIHNpbXBsaWZpY2F0aW9ucyAod2Ugd2FudCB0byBrZWVwIGxvdy1vcmRlciB2ZXJ0aWNlcywgZXRjLilcbiAgICBncmFwaC5lbGltaW5hdGVPdmVybGFwKCk7XG4gICAgZ3JhcGguZWxpbWluYXRlU2VsZkludGVyc2VjdGlvbigpO1xuICAgIGdyYXBoLmVsaW1pbmF0ZUludGVyc2VjdGlvbigpO1xuICAgIGdyYXBoLmNvbGxhcHNlVmVydGljZXMoKTtcblxuICAgIC8vIE1hcmsgY2xpcCBlZGdlcyB3aXRoIGRhdGE9dHJ1ZVxuICAgIGZvciAoIGkgPSAwOyBpIDwgZ3JhcGgubG9vcHMubGVuZ3RoOyBpKysgKSB7XG4gICAgICBsb29wID0gZ3JhcGgubG9vcHNbIGkgXTtcbiAgICAgIGlmICggbG9vcC5zaGFwZUlkID09PSBDTElQX1NIQVBFX0lEICkge1xuICAgICAgICBmb3IgKCBqID0gMDsgaiA8IGxvb3AuaGFsZkVkZ2VzLmxlbmd0aDsgaisrICkge1xuICAgICAgICAgIGxvb3AuaGFsZkVkZ2VzWyBqIF0uZWRnZS5kYXRhID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIGNvbnN0IHN1YnBhdGhzID0gW107XG4gICAgZm9yICggaSA9IDA7IGkgPCBncmFwaC5sb29wcy5sZW5ndGg7IGkrKyApIHtcbiAgICAgIGxvb3AgPSBncmFwaC5sb29wc1sgaSBdO1xuICAgICAgaWYgKCBsb29wLnNoYXBlSWQgPT09IFNIQVBFX0lEICkge1xuICAgICAgICBsZXQgc2VnbWVudHMgPSBbXTtcbiAgICAgICAgZm9yICggaiA9IDA7IGogPCBsb29wLmhhbGZFZGdlcy5sZW5ndGg7IGorKyApIHtcbiAgICAgICAgICBjb25zdCBoYWxmRWRnZSA9IGxvb3AuaGFsZkVkZ2VzWyBqIF07XG5cbiAgICAgICAgICBjb25zdCBpbmNsdWRlZCA9IGhhbGZFZGdlLmVkZ2UuZGF0YSA/IG9wdGlvbnMuaW5jbHVkZUJvdW5kYXJ5IDogKFxuICAgICAgICAgICAgc2ltcGxpZmllZENsaXBBcmVhU2hhcGUuY29udGFpbnNQb2ludCggaGFsZkVkZ2UuZWRnZS5zZWdtZW50LnBvc2l0aW9uQXQoIDAuNSApICkgPyBvcHRpb25zLmluY2x1ZGVJbnRlcmlvciA6IG9wdGlvbnMuaW5jbHVkZUV4dGVyaW9yXG4gICAgICAgICAgKTtcbiAgICAgICAgICBpZiAoIGluY2x1ZGVkICkge1xuICAgICAgICAgICAgc2VnbWVudHMucHVzaCggaGFsZkVkZ2UuZ2V0RGlyZWN0aW9uYWxTZWdtZW50KCkgKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBJZiB3ZSBoYXZlIGFuIGV4Y2x1ZGVkIHNlZ21lbnQgaW4tYmV0d2VlbiBpbmNsdWRlZCBzZWdtZW50cywgd2UnbGwgbmVlZCB0byBzcGxpdCBpbnRvIG1vcmUgc3VicGF0aHMgdG8gaGFuZGxlXG4gICAgICAgICAgLy8gdGhlIGdhcC5cbiAgICAgICAgICBlbHNlIGlmICggc2VnbWVudHMubGVuZ3RoICkge1xuICAgICAgICAgICAgc3VicGF0aHMucHVzaCggbmV3IFN1YnBhdGgoIHNlZ21lbnRzLCB1bmRlZmluZWQsIGxvb3AuY2xvc2VkICkgKTtcbiAgICAgICAgICAgIHNlZ21lbnRzID0gW107XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmICggc2VnbWVudHMubGVuZ3RoICkge1xuICAgICAgICAgIHN1YnBhdGhzLnB1c2goIG5ldyBTdWJwYXRoKCBzZWdtZW50cywgdW5kZWZpbmVkLCBsb29wLmNsb3NlZCApICk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBncmFwaC5kaXNwb3NlKCk7XG5cbiAgICByZXR1cm4gbmV3IGtpdGUuU2hhcGUoIHN1YnBhdGhzICk7XG4gIH1cbn1cblxua2l0ZS5yZWdpc3RlciggJ0dyYXBoJywgR3JhcGggKTtcblxuZXhwb3J0IGRlZmF1bHQgR3JhcGg7Il0sIm5hbWVzIjpbIkJvdW5kczIiLCJNYXRyaXgzIiwiVHJhbnNmb3JtMyIsIlV0aWxzIiwiVmVjdG9yMiIsImFycmF5UmVtb3ZlIiwiY2xlYW5BcnJheSIsIm1lcmdlIiwiQXJjIiwiQm91bmRhcnkiLCJDdWJpYyIsIkVkZ2UiLCJFZGdlU2VnbWVudFRyZWUiLCJFbGxpcHRpY2FsQXJjIiwiRmFjZSIsImtpdGUiLCJMaW5lIiwiTG9vcCIsIlNlZ21lbnQiLCJTdWJwYXRoIiwiVmVydGV4IiwiVmVydGV4U2VnbWVudFRyZWUiLCJicmlkZ2VJZCIsImdsb2JhbElkIiwiVkVSVEVYX0NPTExBUFNFX1RIUkVTSE9MRF9ESVNUQU5DRSIsIklOVEVSU0VDVElPTl9FTkRQT0lOVF9USFJFU0hPTERfRElTVEFOQ0UiLCJTUExJVF9FTkRQT0lOVF9USFJFU0hPTERfRElTVEFOQ0UiLCJUX1RIUkVTSE9MRCIsIkdyYXBoIiwic2VyaWFsaXplIiwidHlwZSIsInZlcnRpY2VzIiwibWFwIiwidmVydGV4IiwiZWRnZXMiLCJlZGdlIiwiYm91bmRhcmllcyIsImJvdW5kYXJ5IiwiaW5uZXJCb3VuZGFyaWVzIiwiaWQiLCJvdXRlckJvdW5kYXJpZXMiLCJzaGFwZUlkcyIsImxvb3BzIiwibG9vcCIsInVuYm91bmRlZEZhY2UiLCJmYWNlcyIsImZhY2UiLCJkZXNlcmlhbGl6ZSIsIm9iaiIsImdyYXBoIiwidmVydGV4TWFwIiwiZWRnZU1hcCIsImhhbGZFZGdlTWFwIiwiYm91bmRhcnlNYXAiLCJsb29wTWFwIiwiZmFjZU1hcCIsImRhdGEiLCJWZWN0b3IySU8iLCJmcm9tU3RhdGVPYmplY3QiLCJwb2ludCIsInZpc2l0ZWQiLCJ2aXNpdEluZGV4IiwibG93SW5kZXgiLCJzZWdtZW50Iiwic3RhcnRWZXJ0ZXgiLCJlbmRWZXJ0ZXgiLCJzaWduZWRBcmVhRnJhZ21lbnQiLCJkZXNlcmlhbGl6ZUhhbGZFZGdlIiwiaGFsZkVkZ2UiLCJoYWxmRWRnZURhdGEiLCJpc1JldmVyc2VkIiwic29ydFZlY3RvciIsImZvcndhcmRIYWxmIiwicmV2ZXJzZWRIYWxmIiwiZm9yRWFjaCIsImkiLCJpbmNpZGVudEhhbGZFZGdlcyIsInBvb2wiLCJjcmVhdGUiLCJoYWxmRWRnZXMiLCJzaWduZWRBcmVhIiwiYm91bmRzIiwiQm91bmRzMklPIiwiY2hpbGRCb3VuZGFyaWVzIiwic2hhcGVJZCIsImNsb3NlZCIsImhvbGVzIiwid2luZGluZ01hcCIsImZpbGxlZCIsImFkZFNoYXBlIiwic2hhcGUiLCJvcHRpb25zIiwic3VicGF0aHMiLCJsZW5ndGgiLCJhZGRTdWJwYXRoIiwic3VicGF0aCIsImFzc2VydCIsImVuc3VyZUNsb3NlZCIsImluZGV4T2YiLCJwdXNoIiwic2VnbWVudHMiLCJnZXRGaWxsU2VnbWVudHMiLCJpbmRleCIsInByZXZpb3VzSW5kZXgiLCJlbmQiLCJzdGFydCIsImVxdWFscyIsImRpc3RhbmNlIiwiYXZlcmFnZSIsIm5leHRJbmRleCIsImFkZEVkZ2UiLCJjb21wdXRlU2ltcGxpZmllZEZhY2VzIiwiZWxpbWluYXRlT3ZlcmxhcCIsImVsaW1pbmF0ZVNlbGZJbnRlcnNlY3Rpb24iLCJlbGltaW5hdGVJbnRlcnNlY3Rpb24iLCJjb2xsYXBzZVZlcnRpY2VzIiwicmVtb3ZlQnJpZGdlcyIsInJlbW92ZUxvd09yZGVyVmVydGljZXMiLCJvcmRlclZlcnRleEVkZ2VzIiwiZXh0cmFjdEZhY2VzIiwiY29tcHV0ZUJvdW5kYXJ5VHJlZSIsImNvbXB1dGVXaW5kaW5nTWFwIiwiY29tcHV0ZUZhY2VJbmNsdXNpb24iLCJ3aW5kaW5nTWFwRmlsdGVyIiwiY3JlYXRlRmlsbGVkU3ViR3JhcGgiLCJuZXdTdGFydFZlcnRleCIsIm5ld0VuZFZlcnRleCIsImNvbGxhcHNlQWRqYWNlbnRFZGdlcyIsImZpbGxBbHRlcm5hdGluZ0ZhY2VzIiwiZmFjZXNUb1NoYXBlIiwidG9TdWJwYXRoIiwiaiIsIlNoYXBlIiwiZGlzcG9zZSIsInBvcCIsIl8iLCJpbmNsdWRlcyIsInJlbW92ZUVkZ2UiLCJyZXBsYWNlRWRnZUluTG9vcHMiLCJmb3J3YXJkSGFsZkVkZ2VzIiwicmV2ZXJzZWRIYWxmRWRnZXMiLCJnZXRSZXZlcnNlZCIsInJlcGxhY2VtZW50SGFsZkVkZ2VzIiwiQXJyYXkiLCJwcm90b3R5cGUiLCJzcGxpY2UiLCJhcHBseSIsImNvbmNhdCIsIm5lZWRzTG9vcCIsImFFZGdlIiwiYkVkZ2UiLCJhU2VnbWVudCIsImJTZWdtZW50IiwiYVZlcnRleCIsImdldE90aGVyVmVydGV4IiwiYlZlcnRleCIsInJldmVyc2VkIiwidGFuZ2VudEF0Iiwibm9ybWFsaXplZCIsIm5ld1NlZ21lbnQiLCJlcHNpbG9uIiwicXVldWUiLCJ3aW5kb3ciLCJGbGF0UXVldWUiLCJzZWdtZW50VHJlZSIsIm5leHRJZCIsImFkZFRvUXVldWUiLCJtaW5ZIiwibWF4WSIsInJlbW92ZUZyb21RdWV1ZSIsImludGVybmFsRGF0YSIsInJlbW92ZWRJZCIsImVkZ2VzVG9EaXNwb3NlIiwiZW50cnkiLCJmb3VuZCIsIm92ZXJsYXBwZWRFZGdlIiwiYWRkZWRFZGdlcyIsInF1ZXJ5Iiwib3RoZXJFZGdlIiwib3ZlcmxhcHMiLCJnZXRPdmVybGFwcyIsImsiLCJvdmVybGFwIiwiTWF0aCIsImFicyIsInQxIiwidDAiLCJxdDEiLCJxdDAiLCJzcGxpdE92ZXJsYXAiLCJyZW1vdmVJdGVtIiwiYWRkSXRlbSIsIm5ld0VkZ2VzIiwiYUJlZm9yZSIsInN1YmRpdmlkZWQiLCJiQmVmb3JlIiwiYUFmdGVyIiwiYkFmdGVyIiwibWlkZGxlIiwibGluZWFyIiwiYmVmb3JlVmVydGV4IiwiYSIsImFmdGVyVmVydGV4IiwibWlkZGxlRWRnZSIsImFCZWZvcmVFZGdlIiwiYUFmdGVyRWRnZSIsImJCZWZvcmVFZGdlIiwiYkFmdGVyRWRnZSIsImFFZGdlcyIsImJFZGdlcyIsImFGb3J3YXJkSGFsZkVkZ2VzIiwiYkZvcndhcmRIYWxmRWRnZXMiLCJpc0ZvcndhcmQiLCJzZWxmSW50ZXJzZWN0aW9uIiwiZ2V0U2VsZkludGVyc2VjdGlvbiIsImFUIiwiYlQiLCJzdWJkaXZpc2lvbnMiLCJzdGFydEVkZ2UiLCJlbmRFZGdlIiwicmVtb3ZlZEVkZ2VzIiwiaW50ZXJzZWN0aW9ucyIsImludGVyc2VjdCIsImZpbHRlciIsImludGVyc2VjdGlvbiIsImlzSW50ZXJuYWwiLCJyZXN1bHQiLCJzaW1wbGVTcGxpdCIsImFJbnRlcm5hbCIsImJJbnRlcm5hbCIsImNoYW5nZWQiLCJzcGxpdEVkZ2UiLCJ0IiwiZmlyc3RFZGdlIiwic2Vjb25kRWRnZSIsImV2ZXJ5IiwieSIsInZlcnRpY2VzVG9EaXNwb3NlIiwib3ZlcmxhcHBlZFZlcnRleCIsImFkZGVkVmVydGljZXMiLCJvdGhlclZlcnRleCIsIm5ld1ZlcnRleCIsInN0YXJ0TWF0Y2hlcyIsImVuZE1hdGNoZXMiLCJ3aWR0aCIsImhlaWdodCIsInJlcGxhY2VtZW50RWRnZSIsInVwZGF0ZVJlZmVyZW5jZXMiLCJtYXJrQnJpZGdlcyIsImJyaWRnZXMiLCJjaGlsZFZlcnRleCIsInBhcmVudCIsIm1pbiIsImJyaWRnZUVkZ2UiLCJzb3J0RWRnZXMiLCJib3VuZGFyeUhhbGZFZGdlcyIsInN0YXJ0aW5nSGFsZkVkZ2UiLCJnZXROZXh0IiwidW5ib3VuZGVkSG9sZXMiLCJ0cmFuc2Zvcm0iLCJyb3RhdGlvbjIiLCJvdXRlckJvdW5kYXJ5IiwicmF5IiwiY29tcHV0ZUV4dHJlbWVSYXkiLCJjbG9zZXN0RWRnZSIsImNsb3Nlc3REaXN0YW5jZSIsIk51bWJlciIsIlBPU0lUSVZFX0lORklOSVRZIiwiY2xvc2VzdFdpbmQiLCJ3aW5kIiwiY2xvc2VzdEhhbGZFZGdlIiwiY2xvc2VzdEJvdW5kYXJ5IiwiZ2V0Qm91bmRhcnlPZkhhbGZFZGdlIiwicmVjdXJzaXZlbHlBZGRIb2xlcyIsImJpbmQiLCJzbGljZSIsIm91dHNpZGVNYXAiLCJmb3J3YXJkRmFjZSIsInJldmVyc2VkRmFjZSIsInNvbHZlZEZvcndhcmQiLCJzb2x2ZWRSZXZlcnNlZCIsIm0iLCJjb21wdXRlRGlmZmVyZW50aWFsIiwic29sdmVkRmFjZSIsInVuc29sdmVkRmFjZSIsImRpZmZlcmVudGlhbCIsIm4iLCJsb29wSGFsZkVkZ2UiLCJudWxsRmFjZUZpbGxlZENvdW50IiwiZm9yd2FyZE51bGwiLCJyZXZlcnNlZE51bGwiLCJoYXNIYWxmRWRnZSIsIkVycm9yIiwiZGlzdGFuY2VUaHJlc2hvbGQiLCJ0VGhyZXNob2xkIiwiQklOQVJZX05PTlpFUk9fVU5JT04iLCJCSU5BUllfTk9OWkVST19JTlRFUlNFQ1RJT04iLCJCSU5BUllfTk9OWkVST19ESUZGRVJFTkNFIiwiQklOQVJZX05PTlpFUk9fWE9SIiwiYmluYXJ5UmVzdWx0Iiwic2hhcGVBIiwic2hhcGVCIiwic3ViZ3JhcGgiLCJ1bmlvbk5vblplcm8iLCJzaGFwZXMiLCJpbnRlcnNlY3Rpb25Ob25aZXJvIiwieG9yTm9uWmVybyIsImluY2x1ZGVkIiwic2ltcGxpZnlOb25aZXJvIiwicmVzdWx0U2hhcGUiLCJjbGlwU2hhcGUiLCJjbGlwQXJlYVNoYXBlIiwiU0hBUEVfSUQiLCJDTElQX1NIQVBFX0lEIiwiaW5jbHVkZUV4dGVyaW9yIiwiaW5jbHVkZUJvdW5kYXJ5IiwiaW5jbHVkZUludGVyaW9yIiwic2ltcGxpZmllZENsaXBBcmVhU2hhcGUiLCJjb250YWluc1BvaW50IiwicG9zaXRpb25BdCIsImdldERpcmVjdGlvbmFsU2VnbWVudCIsInVuZGVmaW5lZCIsImNvbnN0cnVjdG9yIiwicmVnaXN0ZXIiXSwibWFwcGluZ3MiOiJBQUFBLHNEQUFzRDtBQUV0RDs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0NBcUJDLEdBRUQsT0FBT0EsYUFBYSw2QkFBNkI7QUFDakQsT0FBT0MsYUFBYSw2QkFBNkI7QUFDakQsT0FBT0MsZ0JBQWdCLGdDQUFnQztBQUN2RCxPQUFPQyxXQUFXLDJCQUEyQjtBQUM3QyxPQUFPQyxhQUFhLDZCQUE2QjtBQUNqRCxPQUFPQyxpQkFBaUIsdUNBQXVDO0FBQy9ELE9BQU9DLGdCQUFnQixzQ0FBc0M7QUFDN0QsT0FBT0MsV0FBVyxpQ0FBaUM7QUFDbkQsU0FBU0MsR0FBRyxFQUFFQyxRQUFRLEVBQUVDLEtBQUssRUFBRUMsSUFBSSxFQUFFQyxlQUFl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