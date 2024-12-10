// Copyright 2023-2024, University of Colorado Boulder
/**
 * A Property that, if there is a unique path from one Node to another (A => root => B, or A => B, or B => A), will
 * contain the transformation matrix from A to B's coordinate frame (local coordinate frames by default).
 *
 * If there is no unique path, the value will be null.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ import TinyProperty from '../../../axon/js/TinyProperty.js';
import Matrix3 from '../../../dot/js/Matrix3.js';
import arrayDifference from '../../../phet-core/js/arrayDifference.js';
import optionize from '../../../phet-core/js/optionize.js';
import { AncestorNodesProperty, scenery } from '../imports.js';
let MatrixBetweenProperty = class MatrixBetweenProperty extends TinyProperty {
    update() {
        // Track nodes (not just ancestors) here, in case one is an ancestor of the other
        // REVIEW: would it be more performant for below opperations if these were Sets?
        const fromNodes = [
            ...this.fromAncestorsProperty.value,
            this.from
        ];
        const toNodes = [
            ...this.toAncestorsProperty.value,
            this.to
        ];
        // Intersection (ancestors of from/to)
        const commonNodes = fromNodes.filter((a)=>toNodes.includes(a));
        let hasDAG = false;
        // We'll want to find all nodes that are common ancestors of both, BUT aren't superfluous (an ancestor of another
        // common ancestor, with no other paths).
        const rootNodes = commonNodes.filter((node)=>{
            const fromChildren = fromNodes.filter((aNode)=>node.hasChild(aNode));
            const toChildren = toNodes.filter((bNode)=>node.hasChild(bNode));
            const fromOnly = [];
            const toOnly = [];
            const both = [];
            arrayDifference(fromChildren, toChildren, fromOnly, toOnly, both);
            const hasMultipleChildren = fromChildren.length > 1 || toChildren.length > 1;
            const hasUnsharedChild = fromOnly.length || toOnly.length;
            // If either has multiple children, AND we're not just a trivial ancestor of the root, we're in a DAG case
            if (hasMultipleChildren && hasUnsharedChild) {
                hasDAG = true;
            }
            const hasFromExclusive = fromOnly.length > 0 || this.from === node;
            const hasToExclusive = toOnly.length > 0 || this.to === node;
            return hasFromExclusive && hasToExclusive;
        });
        if (!hasDAG && rootNodes.length === 1) {
            // We have a root node, and should have unique trails!
            this.rootNode = rootNodes[0];
            // These should assert-error out if there is no unique trail for either
            this.fromTrail = this.from.getUniqueTrailTo(this.rootNode);
            this.toTrail = this.to.getUniqueTrailTo(this.rootNode);
        } else {
            this.rootNode = null;
            this.fromTrail = null;
            this.toTrail = null;
        }
        // Take note of the nodes we are listening to
        const nodeSet = new Set();
        this.fromTrail && this.fromTrail.nodes.forEach((node)=>nodeSet.add(node));
        this.toTrail && this.toTrail.nodes.forEach((node)=>nodeSet.add(node));
        // Add in new needed listeners
        nodeSet.forEach((node)=>{
            if (!this.listenedNodeSet.has(node)) {
                this.addNodeListener(node);
            }
        });
        // Remove listeners not needed anymore
        this.listenedNodeSet.forEach((node)=>{
            if (!nodeSet.has(node) && node !== this.from && node !== this.to) {
                this.removeNodeListener(node);
            }
        });
        this.updateMatrix();
    }
    updateMatrix() {
        if (this.rootNode && this.fromTrail && this.toTrail) {
            // If one of these is an ancestor of the other AND the ancestor requests a "parent" coordinate frame, we'll need
            // to compute things to the next level up. Otherwise, we can ignore the root node's transform. This is NOT
            // just an optimization, since if we multiply in the root node's transform into both the fromMatrix and toMatrix,
            // we'll lead to numerical imprecision that could be avoided. With this, we can get precise/exact results, even
            // if there is a scale on the rootNode (imagine a ScreenView's transform).
            const fromSelf = this.fromTrail.nodes.length === 1;
            const toSelf = this.toTrail.nodes.length === 1;
            const useAncestorMatrix = fromSelf && this.fromCoordinateFrame === 'parent' || toSelf && this.toCoordinateFrame === 'parent';
            // Instead of switching between 4 different matrix functions, we use the general form.
            const fromMatrix = this.fromTrail.getMatrixConcatenation(useAncestorMatrix ? 0 : 1, this.fromTrail.nodes.length - (this.fromCoordinateFrame === 'parent' ? 1 : 0));
            const toMatrix = this.toTrail.getMatrixConcatenation(useAncestorMatrix ? 0 : 1, this.toTrail.nodes.length - (this.toCoordinateFrame === 'parent' ? 1 : 0));
            // toPoint = toMatrix^-1 * fromMatrix * fromPoint
            this.value = toMatrix.inverted().timesMatrix(fromMatrix);
        } else {
            this.value = null;
        }
    }
    addNodeListener(node) {
        this.listenedNodeSet.add(node);
        node.transformEmitter.addListener(this._nodeTransformListener);
    }
    removeNodeListener(node) {
        this.listenedNodeSet.delete(node);
        node.transformEmitter.removeListener(this._nodeTransformListener);
    }
    dispose() {
        this.fromAncestorsProperty.dispose();
        this.toAncestorsProperty.dispose();
        super.dispose();
    }
    constructor(from, to, providedOptions){
        const options = optionize()({
            fromCoordinateFrame: 'local',
            toCoordinateFrame: 'local'
        }, providedOptions);
        super(Matrix3.IDENTITY), this.from = from, this.to = to, this.rootNode = null, this.fromTrail = null, this.toTrail = null, this.listenedNodeSet = new Set();
        this.fromCoordinateFrame = options.fromCoordinateFrame;
        this.toCoordinateFrame = options.toCoordinateFrame;
        // Identical matrices shouldn't trigger notifications
        this.valueComparisonStrategy = 'equalsFunction';
        this.fromAncestorsProperty = new AncestorNodesProperty(from);
        this.toAncestorsProperty = new AncestorNodesProperty(to);
        const updateListener = this.update.bind(this);
        this._nodeTransformListener = this.updateMatrix.bind(this);
        // We'll only trigger a full update when parents/ancestors change anywhere. Otherwise, we'll just do transform
        // changes with updateMatrix()
        this.fromAncestorsProperty.updateEmitter.addListener(updateListener);
        this.toAncestorsProperty.updateEmitter.addListener(updateListener);
        this.update();
    }
};
export { MatrixBetweenProperty as default };
scenery.register('MatrixBetweenProperty', MatrixBetweenProperty);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvdXRpbC9NYXRyaXhCZXR3ZWVuUHJvcGVydHkudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjMtMjAyNCwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbi8qKlxuICogQSBQcm9wZXJ0eSB0aGF0LCBpZiB0aGVyZSBpcyBhIHVuaXF1ZSBwYXRoIGZyb20gb25lIE5vZGUgdG8gYW5vdGhlciAoQSA9PiByb290ID0+IEIsIG9yIEEgPT4gQiwgb3IgQiA9PiBBKSwgd2lsbFxuICogY29udGFpbiB0aGUgdHJhbnNmb3JtYXRpb24gbWF0cml4IGZyb20gQSB0byBCJ3MgY29vcmRpbmF0ZSBmcmFtZSAobG9jYWwgY29vcmRpbmF0ZSBmcmFtZXMgYnkgZGVmYXVsdCkuXG4gKlxuICogSWYgdGhlcmUgaXMgbm8gdW5pcXVlIHBhdGgsIHRoZSB2YWx1ZSB3aWxsIGJlIG51bGwuXG4gKlxuICogQGF1dGhvciBKb25hdGhhbiBPbHNvbiA8am9uYXRoYW4ub2xzb25AY29sb3JhZG8uZWR1PlxuICovXG5cbmltcG9ydCBUaW55UHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vYXhvbi9qcy9UaW55UHJvcGVydHkuanMnO1xuaW1wb3J0IE1hdHJpeDMgZnJvbSAnLi4vLi4vLi4vZG90L2pzL01hdHJpeDMuanMnO1xuaW1wb3J0IGFycmF5RGlmZmVyZW5jZSBmcm9tICcuLi8uLi8uLi9waGV0LWNvcmUvanMvYXJyYXlEaWZmZXJlbmNlLmpzJztcbmltcG9ydCBvcHRpb25pemUgZnJvbSAnLi4vLi4vLi4vcGhldC1jb3JlL2pzL29wdGlvbml6ZS5qcyc7XG5pbXBvcnQgeyBBbmNlc3Rvck5vZGVzUHJvcGVydHksIE5vZGUsIHNjZW5lcnksIFRyYWlsIH0gZnJvbSAnLi4vaW1wb3J0cy5qcyc7XG5cbnR5cGUgQ29vcmRpbmF0ZUZyYW1lID0gJ3BhcmVudCcgfCAnbG9jYWwnO1xuXG5leHBvcnQgdHlwZSBNYXRyaXhCZXR3ZWVuUHJvcGVydHlPcHRpb25zID0ge1xuICAvLyBXaGljaCBjb29yZGluYXRlIGZyYW1lcyB3ZSB3YW50IHRvIGJlIGNvbnZlcnRpbmcgZnJvbS90bywgZm9yIGVhY2ggbm9kZVxuICBmcm9tQ29vcmRpbmF0ZUZyYW1lPzogQ29vcmRpbmF0ZUZyYW1lO1xuICB0b0Nvb3JkaW5hdGVGcmFtZT86IENvb3JkaW5hdGVGcmFtZTtcbn07XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIE1hdHJpeEJldHdlZW5Qcm9wZXJ0eSBleHRlbmRzIFRpbnlQcm9wZXJ0eTxNYXRyaXgzIHwgbnVsbD4ge1xuXG4gIHByaXZhdGUgcmVhZG9ubHkgZnJvbUFuY2VzdG9yc1Byb3BlcnR5OiBBbmNlc3Rvck5vZGVzUHJvcGVydHk7XG4gIHByaXZhdGUgcmVhZG9ubHkgdG9BbmNlc3RvcnNQcm9wZXJ0eTogQW5jZXN0b3JOb2Rlc1Byb3BlcnR5O1xuXG4gIC8vIFdoZW4gd2UgaGF2ZSBhIHVuaXF1ZSBjb25uZWN0aW9uIHdpdGggdHJhaWxzLCB0aGlzIHdpbGwgY29udGFpbiB0aGUgcm9vdCBub2RlIGNvbW1vbiB0byBib3RoLlxuICAvLyBOT1RFOiBUaGlzIG1pZ2h0IGJlIG9uZSBvZiB0aGUgYWN0dWFsIG5vZGVzIGl0c2VsZi5cbiAgcHJpdmF0ZSByb290Tm9kZTogTm9kZSB8IG51bGwgPSBudWxsO1xuXG4gIC8vIFdoZW4gd2UgaGF2ZSBhIHVuaXF1ZSBjb25uZWN0aW9uIHdpdGggdHJhaWxzLCB0aGVzZSB3aWxsIGNvbnRhaW4gdGhlIHRyYWlsIHRvIHRoZSByb290IG5vZGVcbiAgcHJpdmF0ZSBmcm9tVHJhaWw6IFRyYWlsIHwgbnVsbCA9IG51bGw7XG4gIHByaXZhdGUgdG9UcmFpbDogVHJhaWwgfCBudWxsID0gbnVsbDtcblxuICBwcml2YXRlIHJlYWRvbmx5IGZyb21Db29yZGluYXRlRnJhbWU6IENvb3JkaW5hdGVGcmFtZTtcbiAgcHJpdmF0ZSByZWFkb25seSB0b0Nvb3JkaW5hdGVGcmFtZTogQ29vcmRpbmF0ZUZyYW1lO1xuXG4gIC8vIEEgc2V0IG9mIG5vZGVzIHdoZXJlIHdlIGFyZSBsaXN0ZW5pbmcgdG8gd2hldGhlciB0aGVpciB0cmFuc2Zvcm1zIGNoYW5nZVxuICBwcml2YXRlIHJlYWRvbmx5IGxpc3RlbmVkTm9kZVNldDogU2V0PE5vZGU+ID0gbmV3IFNldDxOb2RlPigpO1xuICBwcml2YXRlIHJlYWRvbmx5IF9ub2RlVHJhbnNmb3JtTGlzdGVuZXI6ICgpID0+IHZvaWQ7XG5cbiAgcHVibGljIGNvbnN0cnVjdG9yKCBwdWJsaWMgcmVhZG9ubHkgZnJvbTogTm9kZSwgcHVibGljIHJlYWRvbmx5IHRvOiBOb2RlLCBwcm92aWRlZE9wdGlvbnM/OiBNYXRyaXhCZXR3ZWVuUHJvcGVydHlPcHRpb25zICkge1xuXG4gICAgY29uc3Qgb3B0aW9ucyA9IG9wdGlvbml6ZTxNYXRyaXhCZXR3ZWVuUHJvcGVydHlPcHRpb25zPigpKCB7XG4gICAgICBmcm9tQ29vcmRpbmF0ZUZyYW1lOiAnbG9jYWwnLFxuICAgICAgdG9Db29yZGluYXRlRnJhbWU6ICdsb2NhbCdcbiAgICB9LCBwcm92aWRlZE9wdGlvbnMgKTtcblxuICAgIHN1cGVyKCBNYXRyaXgzLklERU5USVRZICk7XG5cbiAgICB0aGlzLmZyb21Db29yZGluYXRlRnJhbWUgPSBvcHRpb25zLmZyb21Db29yZGluYXRlRnJhbWU7XG4gICAgdGhpcy50b0Nvb3JkaW5hdGVGcmFtZSA9IG9wdGlvbnMudG9Db29yZGluYXRlRnJhbWU7XG5cbiAgICAvLyBJZGVudGljYWwgbWF0cmljZXMgc2hvdWxkbid0IHRyaWdnZXIgbm90aWZpY2F0aW9uc1xuICAgIHRoaXMudmFsdWVDb21wYXJpc29uU3RyYXRlZ3kgPSAnZXF1YWxzRnVuY3Rpb24nO1xuXG4gICAgdGhpcy5mcm9tQW5jZXN0b3JzUHJvcGVydHkgPSBuZXcgQW5jZXN0b3JOb2Rlc1Byb3BlcnR5KCBmcm9tICk7XG4gICAgdGhpcy50b0FuY2VzdG9yc1Byb3BlcnR5ID0gbmV3IEFuY2VzdG9yTm9kZXNQcm9wZXJ0eSggdG8gKTtcblxuICAgIGNvbnN0IHVwZGF0ZUxpc3RlbmVyID0gdGhpcy51cGRhdGUuYmluZCggdGhpcyApO1xuICAgIHRoaXMuX25vZGVUcmFuc2Zvcm1MaXN0ZW5lciA9IHRoaXMudXBkYXRlTWF0cml4LmJpbmQoIHRoaXMgKTtcblxuICAgIC8vIFdlJ2xsIG9ubHkgdHJpZ2dlciBhIGZ1bGwgdXBkYXRlIHdoZW4gcGFyZW50cy9hbmNlc3RvcnMgY2hhbmdlIGFueXdoZXJlLiBPdGhlcndpc2UsIHdlJ2xsIGp1c3QgZG8gdHJhbnNmb3JtXG4gICAgLy8gY2hhbmdlcyB3aXRoIHVwZGF0ZU1hdHJpeCgpXG4gICAgdGhpcy5mcm9tQW5jZXN0b3JzUHJvcGVydHkudXBkYXRlRW1pdHRlci5hZGRMaXN0ZW5lciggdXBkYXRlTGlzdGVuZXIgKTtcbiAgICB0aGlzLnRvQW5jZXN0b3JzUHJvcGVydHkudXBkYXRlRW1pdHRlci5hZGRMaXN0ZW5lciggdXBkYXRlTGlzdGVuZXIgKTtcblxuICAgIHRoaXMudXBkYXRlKCk7XG4gIH1cblxuICBwcml2YXRlIHVwZGF0ZSgpOiB2b2lkIHtcbiAgICAvLyBUcmFjayBub2RlcyAobm90IGp1c3QgYW5jZXN0b3JzKSBoZXJlLCBpbiBjYXNlIG9uZSBpcyBhbiBhbmNlc3RvciBvZiB0aGUgb3RoZXJcbiAgICAvLyBSRVZJRVc6IHdvdWxkIGl0IGJlIG1vcmUgcGVyZm9ybWFudCBmb3IgYmVsb3cgb3BwZXJhdGlvbnMgaWYgdGhlc2Ugd2VyZSBTZXRzP1xuICAgIGNvbnN0IGZyb21Ob2RlcyA9IFsgLi4udGhpcy5mcm9tQW5jZXN0b3JzUHJvcGVydHkudmFsdWUsIHRoaXMuZnJvbSBdO1xuICAgIGNvbnN0IHRvTm9kZXMgPSBbIC4uLnRoaXMudG9BbmNlc3RvcnNQcm9wZXJ0eS52YWx1ZSwgdGhpcy50byBdO1xuXG4gICAgLy8gSW50ZXJzZWN0aW9uIChhbmNlc3RvcnMgb2YgZnJvbS90bylcbiAgICBjb25zdCBjb21tb25Ob2RlcyA9IGZyb21Ob2Rlcy5maWx0ZXIoIGEgPT4gdG9Ob2Rlcy5pbmNsdWRlcyggYSApICk7XG5cbiAgICBsZXQgaGFzREFHID0gZmFsc2U7XG5cbiAgICAvLyBXZSdsbCB3YW50IHRvIGZpbmQgYWxsIG5vZGVzIHRoYXQgYXJlIGNvbW1vbiBhbmNlc3RvcnMgb2YgYm90aCwgQlVUIGFyZW4ndCBzdXBlcmZsdW91cyAoYW4gYW5jZXN0b3Igb2YgYW5vdGhlclxuICAgIC8vIGNvbW1vbiBhbmNlc3Rvciwgd2l0aCBubyBvdGhlciBwYXRocykuXG4gICAgY29uc3Qgcm9vdE5vZGVzID0gY29tbW9uTm9kZXMuZmlsdGVyKCBub2RlID0+IHtcbiAgICAgIGNvbnN0IGZyb21DaGlsZHJlbiA9IGZyb21Ob2Rlcy5maWx0ZXIoIGFOb2RlID0+IG5vZGUuaGFzQ2hpbGQoIGFOb2RlICkgKTtcbiAgICAgIGNvbnN0IHRvQ2hpbGRyZW4gPSB0b05vZGVzLmZpbHRlciggYk5vZGUgPT4gbm9kZS5oYXNDaGlsZCggYk5vZGUgKSApO1xuXG4gICAgICBjb25zdCBmcm9tT25seTogTm9kZVtdID0gW107XG4gICAgICBjb25zdCB0b09ubHk6IE5vZGVbXSA9IFtdO1xuICAgICAgY29uc3QgYm90aDogTm9kZVtdID0gW107XG4gICAgICBhcnJheURpZmZlcmVuY2UoIGZyb21DaGlsZHJlbiwgdG9DaGlsZHJlbiwgZnJvbU9ubHksIHRvT25seSwgYm90aCApO1xuXG4gICAgICBjb25zdCBoYXNNdWx0aXBsZUNoaWxkcmVuID0gZnJvbUNoaWxkcmVuLmxlbmd0aCA+IDEgfHwgdG9DaGlsZHJlbi5sZW5ndGggPiAxO1xuICAgICAgY29uc3QgaGFzVW5zaGFyZWRDaGlsZCA9IGZyb21Pbmx5Lmxlbmd0aCB8fCB0b09ubHkubGVuZ3RoO1xuXG4gICAgICAvLyBJZiBlaXRoZXIgaGFzIG11bHRpcGxlIGNoaWxkcmVuLCBBTkQgd2UncmUgbm90IGp1c3QgYSB0cml2aWFsIGFuY2VzdG9yIG9mIHRoZSByb290LCB3ZSdyZSBpbiBhIERBRyBjYXNlXG4gICAgICBpZiAoIGhhc011bHRpcGxlQ2hpbGRyZW4gJiYgaGFzVW5zaGFyZWRDaGlsZCApIHtcbiAgICAgICAgaGFzREFHID0gdHJ1ZTtcbiAgICAgIH1cblxuICAgICAgY29uc3QgaGFzRnJvbUV4Y2x1c2l2ZSA9IGZyb21Pbmx5Lmxlbmd0aCA+IDAgfHwgdGhpcy5mcm9tID09PSBub2RlO1xuICAgICAgY29uc3QgaGFzVG9FeGNsdXNpdmUgPSB0b09ubHkubGVuZ3RoID4gMCB8fCB0aGlzLnRvID09PSBub2RlO1xuXG4gICAgICByZXR1cm4gaGFzRnJvbUV4Y2x1c2l2ZSAmJiBoYXNUb0V4Y2x1c2l2ZTtcbiAgICB9ICk7XG5cbiAgICBpZiAoICFoYXNEQUcgJiYgcm9vdE5vZGVzLmxlbmd0aCA9PT0gMSApIHtcbiAgICAgIC8vIFdlIGhhdmUgYSByb290IG5vZGUsIGFuZCBzaG91bGQgaGF2ZSB1bmlxdWUgdHJhaWxzIVxuICAgICAgdGhpcy5yb290Tm9kZSA9IHJvb3ROb2Rlc1sgMCBdO1xuXG4gICAgICAvLyBUaGVzZSBzaG91bGQgYXNzZXJ0LWVycm9yIG91dCBpZiB0aGVyZSBpcyBubyB1bmlxdWUgdHJhaWwgZm9yIGVpdGhlclxuICAgICAgdGhpcy5mcm9tVHJhaWwgPSB0aGlzLmZyb20uZ2V0VW5pcXVlVHJhaWxUbyggdGhpcy5yb290Tm9kZSApO1xuICAgICAgdGhpcy50b1RyYWlsID0gdGhpcy50by5nZXRVbmlxdWVUcmFpbFRvKCB0aGlzLnJvb3ROb2RlICk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgdGhpcy5yb290Tm9kZSA9IG51bGw7XG4gICAgICB0aGlzLmZyb21UcmFpbCA9IG51bGw7XG4gICAgICB0aGlzLnRvVHJhaWwgPSBudWxsO1xuICAgIH1cblxuICAgIC8vIFRha2Ugbm90ZSBvZiB0aGUgbm9kZXMgd2UgYXJlIGxpc3RlbmluZyB0b1xuICAgIGNvbnN0IG5vZGVTZXQgPSBuZXcgU2V0PE5vZGU+KCk7XG4gICAgdGhpcy5mcm9tVHJhaWwgJiYgdGhpcy5mcm9tVHJhaWwubm9kZXMuZm9yRWFjaCggbm9kZSA9PiBub2RlU2V0LmFkZCggbm9kZSApICk7XG4gICAgdGhpcy50b1RyYWlsICYmIHRoaXMudG9UcmFpbC5ub2Rlcy5mb3JFYWNoKCBub2RlID0+IG5vZGVTZXQuYWRkKCBub2RlICkgKTtcblxuICAgIC8vIEFkZCBpbiBuZXcgbmVlZGVkIGxpc3RlbmVyc1xuICAgIG5vZGVTZXQuZm9yRWFjaCggbm9kZSA9PiB7XG4gICAgICBpZiAoICF0aGlzLmxpc3RlbmVkTm9kZVNldC5oYXMoIG5vZGUgKSApIHtcbiAgICAgICAgdGhpcy5hZGROb2RlTGlzdGVuZXIoIG5vZGUgKTtcbiAgICAgIH1cbiAgICB9ICk7XG5cbiAgICAvLyBSZW1vdmUgbGlzdGVuZXJzIG5vdCBuZWVkZWQgYW55bW9yZVxuICAgIHRoaXMubGlzdGVuZWROb2RlU2V0LmZvckVhY2goIG5vZGUgPT4ge1xuICAgICAgaWYgKCAhbm9kZVNldC5oYXMoIG5vZGUgKSAmJiBub2RlICE9PSB0aGlzLmZyb20gJiYgbm9kZSAhPT0gdGhpcy50byApIHtcbiAgICAgICAgdGhpcy5yZW1vdmVOb2RlTGlzdGVuZXIoIG5vZGUgKTtcbiAgICAgIH1cbiAgICB9ICk7XG5cbiAgICB0aGlzLnVwZGF0ZU1hdHJpeCgpO1xuICB9XG5cbiAgcHJpdmF0ZSB1cGRhdGVNYXRyaXgoKTogdm9pZCB7XG4gICAgaWYgKCB0aGlzLnJvb3ROb2RlICYmIHRoaXMuZnJvbVRyYWlsICYmIHRoaXMudG9UcmFpbCApIHtcblxuICAgICAgLy8gSWYgb25lIG9mIHRoZXNlIGlzIGFuIGFuY2VzdG9yIG9mIHRoZSBvdGhlciBBTkQgdGhlIGFuY2VzdG9yIHJlcXVlc3RzIGEgXCJwYXJlbnRcIiBjb29yZGluYXRlIGZyYW1lLCB3ZSdsbCBuZWVkXG4gICAgICAvLyB0byBjb21wdXRlIHRoaW5ncyB0byB0aGUgbmV4dCBsZXZlbCB1cC4gT3RoZXJ3aXNlLCB3ZSBjYW4gaWdub3JlIHRoZSByb290IG5vZGUncyB0cmFuc2Zvcm0uIFRoaXMgaXMgTk9UXG4gICAgICAvLyBqdXN0IGFuIG9wdGltaXphdGlvbiwgc2luY2UgaWYgd2UgbXVsdGlwbHkgaW4gdGhlIHJvb3Qgbm9kZSdzIHRyYW5zZm9ybSBpbnRvIGJvdGggdGhlIGZyb21NYXRyaXggYW5kIHRvTWF0cml4LFxuICAgICAgLy8gd2UnbGwgbGVhZCB0byBudW1lcmljYWwgaW1wcmVjaXNpb24gdGhhdCBjb3VsZCBiZSBhdm9pZGVkLiBXaXRoIHRoaXMsIHdlIGNhbiBnZXQgcHJlY2lzZS9leGFjdCByZXN1bHRzLCBldmVuXG4gICAgICAvLyBpZiB0aGVyZSBpcyBhIHNjYWxlIG9uIHRoZSByb290Tm9kZSAoaW1hZ2luZSBhIFNjcmVlblZpZXcncyB0cmFuc2Zvcm0pLlxuICAgICAgY29uc3QgZnJvbVNlbGYgPSB0aGlzLmZyb21UcmFpbC5ub2Rlcy5sZW5ndGggPT09IDE7XG4gICAgICBjb25zdCB0b1NlbGYgPSB0aGlzLnRvVHJhaWwubm9kZXMubGVuZ3RoID09PSAxO1xuICAgICAgY29uc3QgdXNlQW5jZXN0b3JNYXRyaXggPSAoIGZyb21TZWxmICYmIHRoaXMuZnJvbUNvb3JkaW5hdGVGcmFtZSA9PT0gJ3BhcmVudCcgKSB8fCAoIHRvU2VsZiAmJiB0aGlzLnRvQ29vcmRpbmF0ZUZyYW1lID09PSAncGFyZW50JyApO1xuXG4gICAgICAvLyBJbnN0ZWFkIG9mIHN3aXRjaGluZyBiZXR3ZWVuIDQgZGlmZmVyZW50IG1hdHJpeCBmdW5jdGlvbnMsIHdlIHVzZSB0aGUgZ2VuZXJhbCBmb3JtLlxuICAgICAgY29uc3QgZnJvbU1hdHJpeCA9IHRoaXMuZnJvbVRyYWlsLmdldE1hdHJpeENvbmNhdGVuYXRpb24oXG4gICAgICAgIHVzZUFuY2VzdG9yTWF0cml4ID8gMCA6IDEsXG4gICAgICAgIHRoaXMuZnJvbVRyYWlsLm5vZGVzLmxlbmd0aCAtICggdGhpcy5mcm9tQ29vcmRpbmF0ZUZyYW1lID09PSAncGFyZW50JyA/IDEgOiAwIClcbiAgICAgICk7XG4gICAgICBjb25zdCB0b01hdHJpeCA9IHRoaXMudG9UcmFpbC5nZXRNYXRyaXhDb25jYXRlbmF0aW9uKFxuICAgICAgICB1c2VBbmNlc3Rvck1hdHJpeCA/IDAgOiAxLFxuICAgICAgICB0aGlzLnRvVHJhaWwubm9kZXMubGVuZ3RoIC0gKCB0aGlzLnRvQ29vcmRpbmF0ZUZyYW1lID09PSAncGFyZW50JyA/IDEgOiAwIClcbiAgICAgICk7XG5cbiAgICAgIC8vIHRvUG9pbnQgPSB0b01hdHJpeF4tMSAqIGZyb21NYXRyaXggKiBmcm9tUG9pbnRcbiAgICAgIHRoaXMudmFsdWUgPSB0b01hdHJpeC5pbnZlcnRlZCgpLnRpbWVzTWF0cml4KCBmcm9tTWF0cml4ICk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgdGhpcy52YWx1ZSA9IG51bGw7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBhZGROb2RlTGlzdGVuZXIoIG5vZGU6IE5vZGUgKTogdm9pZCB7XG4gICAgdGhpcy5saXN0ZW5lZE5vZGVTZXQuYWRkKCBub2RlICk7XG4gICAgbm9kZS50cmFuc2Zvcm1FbWl0dGVyLmFkZExpc3RlbmVyKCB0aGlzLl9ub2RlVHJhbnNmb3JtTGlzdGVuZXIgKTtcbiAgfVxuXG4gIHByaXZhdGUgcmVtb3ZlTm9kZUxpc3RlbmVyKCBub2RlOiBOb2RlICk6IHZvaWQge1xuICAgIHRoaXMubGlzdGVuZWROb2RlU2V0LmRlbGV0ZSggbm9kZSApO1xuICAgIG5vZGUudHJhbnNmb3JtRW1pdHRlci5yZW1vdmVMaXN0ZW5lciggdGhpcy5fbm9kZVRyYW5zZm9ybUxpc3RlbmVyICk7XG4gIH1cblxuICBwdWJsaWMgb3ZlcnJpZGUgZGlzcG9zZSgpOiB2b2lkIHtcbiAgICB0aGlzLmZyb21BbmNlc3RvcnNQcm9wZXJ0eS5kaXNwb3NlKCk7XG4gICAgdGhpcy50b0FuY2VzdG9yc1Byb3BlcnR5LmRpc3Bvc2UoKTtcblxuICAgIHN1cGVyLmRpc3Bvc2UoKTtcbiAgfVxufVxuXG5zY2VuZXJ5LnJlZ2lzdGVyKCAnTWF0cml4QmV0d2VlblByb3BlcnR5JywgTWF0cml4QmV0d2VlblByb3BlcnR5ICk7Il0sIm5hbWVzIjpbIlRpbnlQcm9wZXJ0eSIsIk1hdHJpeDMiLCJhcnJheURpZmZlcmVuY2UiLCJvcHRpb25pemUiLCJBbmNlc3Rvck5vZGVzUHJvcGVydHkiLCJzY2VuZXJ5IiwiTWF0cml4QmV0d2VlblByb3BlcnR5IiwidXBkYXRlIiwiZnJvbU5vZGVzIiwiZnJvbUFuY2VzdG9yc1Byb3BlcnR5IiwidmFsdWUiLCJmcm9tIiwidG9Ob2RlcyIsInRvQW5jZXN0b3JzUHJvcGVydHkiLCJ0byIsImNvbW1vbk5vZGVzIiwiZmlsdGVyIiwiYSIsImluY2x1ZGVzIiwiaGFzREFHIiwicm9vdE5vZGVzIiwibm9kZSIsImZyb21DaGlsZHJlbiIsImFOb2RlIiwiaGFzQ2hpbGQiLCJ0b0NoaWxkcmVuIiwiYk5vZGUiLCJmcm9tT25seSIsInRvT25seSIsImJvdGgiLCJoYXNNdWx0aXBsZUNoaWxkcmVuIiwibGVuZ3RoIiwiaGFzVW5zaGFyZWRDaGlsZCIsImhhc0Zyb21FeGNsdXNpdmUiLCJoYXNUb0V4Y2x1c2l2ZSIsInJvb3ROb2RlIiwiZnJvbVRyYWlsIiwiZ2V0VW5pcXVlVHJhaWxUbyIsInRvVHJhaWwiLCJub2RlU2V0IiwiU2V0Iiwibm9kZXMiLCJmb3JFYWNoIiwiYWRkIiwibGlzdGVuZWROb2RlU2V0IiwiaGFzIiwiYWRkTm9kZUxpc3RlbmVyIiwicmVtb3ZlTm9kZUxpc3RlbmVyIiwidXBkYXRlTWF0cml4IiwiZnJvbVNlbGYiLCJ0b1NlbGYiLCJ1c2VBbmNlc3Rvck1hdHJpeCIsImZyb21Db29yZGluYXRlRnJhbWUiLCJ0b0Nvb3JkaW5hdGVGcmFtZSIsImZyb21NYXRyaXgiLCJnZXRNYXRyaXhDb25jYXRlbmF0aW9uIiwidG9NYXRyaXgiLCJpbnZlcnRlZCIsInRpbWVzTWF0cml4IiwidHJhbnNmb3JtRW1pdHRlciIsImFkZExpc3RlbmVyIiwiX25vZGVUcmFuc2Zvcm1MaXN0ZW5lciIsImRlbGV0ZSIsInJlbW92ZUxpc3RlbmVyIiwiZGlzcG9zZSIsInByb3ZpZGVkT3B0aW9ucyIsIm9wdGlvbnMiLCJJREVOVElUWSIsInZhbHVlQ29tcGFyaXNvblN0cmF0ZWd5IiwidXBkYXRlTGlzdGVuZXIiLCJiaW5kIiwidXBkYXRlRW1pdHRlciIsInJlZ2lzdGVyIl0sIm1hcHBpbmdzIjoiQUFBQSxzREFBc0Q7QUFFdEQ7Ozs7Ozs7Q0FPQyxHQUVELE9BQU9BLGtCQUFrQixtQ0FBbUM7QUFDNUQsT0FBT0MsYUFBYSw2QkFBNkI7QUFDakQsT0FBT0MscUJBQXFCLDJDQUEyQztBQUN2RSxPQUFPQyxlQUFlLHFDQUFxQztBQUMzRCxTQUFTQyxxQkFBcUIsRUFBUUMsT0FBTyxRQUFlLGdCQUFnQjtBQVU3RCxJQUFBLEFBQU1DLHdCQUFOLE1BQU1BLDhCQUE4Qk47SUFpRHpDTyxTQUFlO1FBQ3JCLGlGQUFpRjtRQUNqRixnRkFBZ0Y7UUFDaEYsTUFBTUMsWUFBWTtlQUFLLElBQUksQ0FBQ0MscUJBQXFCLENBQUNDLEtBQUs7WUFBRSxJQUFJLENBQUNDLElBQUk7U0FBRTtRQUNwRSxNQUFNQyxVQUFVO2VBQUssSUFBSSxDQUFDQyxtQkFBbUIsQ0FBQ0gsS0FBSztZQUFFLElBQUksQ0FBQ0ksRUFBRTtTQUFFO1FBRTlELHNDQUFzQztRQUN0QyxNQUFNQyxjQUFjUCxVQUFVUSxNQUFNLENBQUVDLENBQUFBLElBQUtMLFFBQVFNLFFBQVEsQ0FBRUQ7UUFFN0QsSUFBSUUsU0FBUztRQUViLGlIQUFpSDtRQUNqSCx5Q0FBeUM7UUFDekMsTUFBTUMsWUFBWUwsWUFBWUMsTUFBTSxDQUFFSyxDQUFBQTtZQUNwQyxNQUFNQyxlQUFlZCxVQUFVUSxNQUFNLENBQUVPLENBQUFBLFFBQVNGLEtBQUtHLFFBQVEsQ0FBRUQ7WUFDL0QsTUFBTUUsYUFBYWIsUUFBUUksTUFBTSxDQUFFVSxDQUFBQSxRQUFTTCxLQUFLRyxRQUFRLENBQUVFO1lBRTNELE1BQU1DLFdBQW1CLEVBQUU7WUFDM0IsTUFBTUMsU0FBaUIsRUFBRTtZQUN6QixNQUFNQyxPQUFlLEVBQUU7WUFDdkIzQixnQkFBaUJv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