// Copyright 2013-2024, University of Colorado Boulder
/**
 * SphereBucket is a model of a bucket that can be used to store spherical objects.  It manages the addition and removal
 * of the spheres, stacks them as they are added, and manages the stack as spheres are removed.
 *
 * This expects the spheres to have certain properties, please inspect the code to understand the 'contract' between the
 * bucket and the spheres.
 *
 * @author John Blanco
 */ import Utils from '../../../dot/js/Utils.js';
import Vector2 from '../../../dot/js/Vector2.js';
import cleanArray from '../../../phet-core/js/cleanArray.js';
import optionize from '../../../phet-core/js/optionize.js';
import Tandem from '../../../tandem/js/Tandem.js';
import ArrayIO from '../../../tandem/js/types/ArrayIO.js';
import IOType from '../../../tandem/js/types/IOType.js';
import ReferenceIO from '../../../tandem/js/types/ReferenceIO.js';
import phetcommon from '../phetcommon.js';
import Bucket from './Bucket.js';
const ReferenceObjectArrayIO = ArrayIO(ReferenceIO(IOType.ObjectIO));
let SphereBucket = class SphereBucket extends Bucket {
    /**
   * add a particle to the first open position in the stacking order
   */ addParticleFirstOpen(particle, animate) {
        particle.destinationProperty.set(this.getFirstOpenPosition());
        this.addParticle(particle, animate);
    }
    /**
   * add a particle to the nearest open position in the particle stack
   */ addParticleNearestOpen(particle, animate) {
        particle.destinationProperty.set(this.getNearestOpenPosition(particle.destinationProperty.get()));
        this.addParticle(particle, animate);
    }
    /**
   * Add a particle to the bucket and set up listeners for when the particle is removed.
   */ addParticle(particle, animate) {
        if (!animate) {
            particle.positionProperty.set(particle.destinationProperty.get());
        }
        this._particles.push(particle);
        // Add a listener that will remove this particle from the bucket if the user grabs it.
        const particleRemovedListener = (userControlled)=>{
            // We have to verify that userControlled is transitioning to true here because in phet-io it is possible to
            // run into situations where the particle is already in the bucket but userControlled is being set to false, see
            // https://github.com/phetsims/build-an-atom/issues/239.
            if (userControlled) {
                this.removeParticle(particle);
                // The process of removing the particle from the bucket should also disconnect removal listener.
                assert && assert(!particle.bucketRemovalListener, 'listener still present after being removed from bucket');
            }
        };
        particle.userControlledProperty.lazyLink(particleRemovedListener);
        particle.bucketRemovalListener = particleRemovedListener; // Attach to the particle to aid unlinking in some cases.
    }
    /**
   * remove a particle from the bucket, updating listeners as necessary
   */ removeParticle(particle, skipLayout = false) {
        assert && assert(this.containsParticle(particle), 'attempt made to remove particle that is not in bucket');
        // remove the particle from the array
        this._particles = _.without(this._particles, particle);
        // remove the removal listener if it is still present
        if (particle.bucketRemovalListener) {
            particle.userControlledProperty.unlink(particle.bucketRemovalListener);
            delete particle.bucketRemovalListener;
        }
        // redo the layout of the particles if enabled
        if (!skipLayout) {
            this.relayoutBucketParticles();
        }
    }
    containsParticle(particle) {
        return this._particles.includes(particle);
    }
    /**
   * extract the particle that is closest to the provided position from the bucket
   */ extractClosestParticle(position) {
        let closestParticle = null;
        this._particles.forEach((particle)=>{
            if (closestParticle === null || closestParticle.positionProperty.get().distance(position) > particle.positionProperty.get().distance(position)) {
                closestParticle = particle;
            }
        });
        const closestParticleValue = closestParticle;
        if (closestParticleValue !== null) {
            // The particle is removed by setting 'userControlled' to true.  This relies on the listener that was added when
            // the particle was placed into the bucket.
            closestParticleValue.userControlledProperty.set(true);
        }
        return closestParticle;
    }
    /**
   * get the list of particles currently contained within this bucket
   */ getParticleList() {
        return this._particles;
    }
    reset() {
        this._particles.forEach((particle)=>{
            // Remove listeners that are watching for removal from bucket.
            if (typeof particle.bucketRemovalListener === 'function') {
                particle.userControlledProperty.unlink(particle.bucketRemovalListener);
                delete particle.bucketRemovalListener;
            }
        });
        cleanArray(this._particles);
    }
    /**
   * check if the provided position is open, i.e. unoccupied by a particle
   */ isPositionOpen(position) {
        let positionOpen = true;
        for(let i = 0; i < this._particles.length; i++){
            const particle = this._particles[i];
            if (particle.destinationProperty.get().equals(position)) {
                positionOpen = false;
                break;
            }
        }
        return positionOpen;
    }
    /**
   * Find the first open position in the stacking order, which is a triangular stack starting from the lower left.
   */ getFirstOpenPosition() {
        let openPosition = Vector2.ZERO;
        const usableWidth = this.size.width * this._usableWidthProportion - 2 * this._sphereRadius;
        let offsetFromBucketEdge = (this.size.width - usableWidth) / 2 + this._sphereRadius;
        let numParticlesInLayer = Math.floor(usableWidth / (this._sphereRadius * 2));
        let row = 0;
        let positionInLayer = 0;
        let found = false;
        while(!found){
            const testPosition = new Vector2(this.position.x - this.size.width / 2 + offsetFromBucketEdge + positionInLayer * 2 * this._sphereRadius, this.getYPositionForLayer(row));
            if (this.isPositionOpen(testPosition)) {
                // We found a position that is open.
                openPosition = testPosition;
                found = true;
            } else {
                positionInLayer++;
                if (positionInLayer >= numParticlesInLayer) {
                    // Move to the next layer.
                    row++;
                    positionInLayer = 0;
                    numParticlesInLayer--;
                    offsetFromBucketEdge += this._sphereRadius;
                    if (numParticlesInLayer === 0) {
                        // This algorithm doesn't handle the situation where
                        // more particles are added than can be stacked into
                        // a pyramid of the needed size, but so far it hasn't
                        // needed to.  If this requirement changes, the
                        // algorithm will need to change too.
                        numParticlesInLayer = 1;
                        offsetFromBucketEdge -= this._sphereRadius;
                    }
                }
            }
        }
        return openPosition;
    }
    /**
   * get the layer in the stacking order for the provided y (vertical) position
   */ getLayerForYPosition(yPosition) {
        return Math.abs(Utils.roundSymmetric((yPosition - (this.position.y + this._verticalParticleOffset)) / (this._sphereRadius * 2 * 0.866)));
    }
    /**
   * Get the nearest open position in the stacking order that would be supported if the particle were to be placed
   * there.  This is used for particle stacking.
   */ getNearestOpenPosition(position) {
        // Determine the highest occupied layer.  The bottom layer is 0.
        let highestOccupiedLayer = 0;
        _.each(this._particles, (particle)=>{
            const layer = this.getLayerForYPosition(particle.destinationProperty.get().y);
            if (layer > highestOccupiedLayer) {
                highestOccupiedLayer = layer;
            }
        });
        // Make a list of all open positions in the occupied layers.
        const openPositions = [];
        const usableWidth = this.size.width * this._usableWidthProportion - 2 * this._sphereRadius;
        let offsetFromBucketEdge = (this.size.width - usableWidth) / 2 + this._sphereRadius;
        let numParticlesInLayer = Math.floor(usableWidth / (this._sphereRadius * 2));
        // Loop, searching for open positions in the particle stack.
        for(let layer = 0; layer <= highestOccupiedLayer + 1; layer++){
            // Add all open positions in the current layer.
            for(let positionInLayer = 0; positionInLayer < numParticlesInLayer; positionInLayer++){
                const testPosition = new Vector2(this.position.x - this.size.width / 2 + offsetFromBucketEdge + positionInLayer * 2 * this._sphereRadius, this.getYPositionForLayer(layer));
                if (this.isPositionOpen(testPosition)) {
                    // We found a position that is unoccupied.
                    if (layer === 0 || this.countSupportingParticles(testPosition) === 2) {
                        // This is a valid open position.
                        openPositions.push(testPosition);
                    }
                }
            }
            // Adjust variables for the next layer.
            numParticlesInLayer--;
            offsetFromBucketEdge += this._sphereRadius;
            if (numParticlesInLayer === 0) {
                // If the stacking pyramid is full, meaning that there are no positions that are open within it, this algorithm
                // classifies the positions directly above the top of the pyramid as being open.  This would result in a stack
                // of particles with a pyramid base.  So far, this hasn't been a problem, but this limitation may limit
                // reusability of this algorithm.
                numParticlesInLayer = 1;
                offsetFromBucketEdge -= this._sphereRadius;
            }
        }
        // Find the closest open position to the provided current position.
        // Only the X-component is used for this determination, because if
        // the Y-component is used the particles often appear to fall sideways
        // when released above the bucket, which just looks weird.
        let closestOpenPosition = openPositions[0] || Vector2.ZERO;
        _.each(openPositions, (openPosition)=>{
            if (openPosition.distance(position) < closestOpenPosition.distance(position)) {
                // This openPosition is closer.
                closestOpenPosition = openPosition;
            }
        });
        return closestOpenPosition;
    }
    /**
   * given a layer in the stack, calculate the corresponding Y position for a particle in that layer
   */ getYPositionForLayer(layer) {
        return this.position.y + this._verticalParticleOffset + layer * this._sphereRadius * 2 * 0.866;
    }
    /**
   * Determine whether a particle is 'dangling', i.e. hanging above an open space in the stack of particles.  Dangling
   * particles should be made to fall to a stable position.
   */ isDangling(particle) {
        const onBottomRow = particle.destinationProperty.get().y === this.position.y + this._verticalParticleOffset;
        return !onBottomRow && this.countSupportingParticles(particle.destinationProperty.get()) < 2;
    }
    /**
   * count the number of particles that are positioned to support a particle in the provided position
   * @returns - a number from 0 to 2, inclusive
   */ countSupportingParticles(position) {
        let count = 0;
        for(let i = 0; i < this._particles.length; i++){
            const p = this._particles[i];
            if (p.destinationProperty.get().y < position.y && // Must be in a lower layer
            p.destinationProperty.get().distance(position) < this._sphereRadius * 3) {
                // Must be a supporting particle.
                count++;
            }
        }
        return count;
    }
    /**
   * Relayout the particles, generally done after a particle is removed and some other need to fall.
   */ relayoutBucketParticles() {
        let particleMoved;
        do {
            for(let i = 0; i < this._particles.length; i++){
                particleMoved = false;
                const particle = this._particles[i];
                if (this.isDangling(particle)) {
                    particle.destinationProperty.set(this.getNearestOpenPosition(particle.destinationProperty.get()));
                    particleMoved = true;
                    break;
                }
            }
        }while (particleMoved)
    }
    constructor(providedOptions){
        const options = optionize()({
            sphereRadius: 10,
            usableWidthProportion: 1.0,
            tandem: Tandem.OPTIONAL,
            phetioType: SphereBucket.SphereBucketIO,
            verticalParticleOffset: null
        }, providedOptions);
        super(options), // particles managed by this bucket
        this._particles = [];
        this.sphereBucketTandem = options.tandem;
        this._sphereRadius = options.sphereRadius;
        this._usableWidthProportion = options.usableWidthProportion;
        this._verticalParticleOffset = options.verticalParticleOffset === null ? -this._sphereRadius * 0.4 : options.verticalParticleOffset;
        this._particles = [];
    }
};
SphereBucket.SphereBucketIO = new IOType('SphereBucketIO', {
    valueType: SphereBucket,
    documentation: 'A model of a bucket into which spherical objects can be placed.',
    stateSchema: {
        particles: ReferenceObjectArrayIO
    },
    toStateObject: (sphereBucket)=>{
        return {
            particles: ReferenceObjectArrayIO.toStateObject(sphereBucket._particles)
        };
    },
    applyState: (sphereBucket, stateObject)=>{
        // remove all the particles from the observable arrays
        sphereBucket.reset();
        const particles = ReferenceObjectArrayIO.fromStateObject(stateObject.particles);
        // add back the particles
        particles.forEach((particle)=>{
            sphereBucket.addParticle(particle);
        });
    }
});
phetcommon.register('SphereBucket', SphereBucket);
export default SphereBucket;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3BoZXRjb21tb24vanMvbW9kZWwvU3BoZXJlQnVja2V0LnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDEzLTIwMjQsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIFNwaGVyZUJ1Y2tldCBpcyBhIG1vZGVsIG9mIGEgYnVja2V0IHRoYXQgY2FuIGJlIHVzZWQgdG8gc3RvcmUgc3BoZXJpY2FsIG9iamVjdHMuICBJdCBtYW5hZ2VzIHRoZSBhZGRpdGlvbiBhbmQgcmVtb3ZhbFxuICogb2YgdGhlIHNwaGVyZXMsIHN0YWNrcyB0aGVtIGFzIHRoZXkgYXJlIGFkZGVkLCBhbmQgbWFuYWdlcyB0aGUgc3RhY2sgYXMgc3BoZXJlcyBhcmUgcmVtb3ZlZC5cbiAqXG4gKiBUaGlzIGV4cGVjdHMgdGhlIHNwaGVyZXMgdG8gaGF2ZSBjZXJ0YWluIHByb3BlcnRpZXMsIHBsZWFzZSBpbnNwZWN0IHRoZSBjb2RlIHRvIHVuZGVyc3RhbmQgdGhlICdjb250cmFjdCcgYmV0d2VlbiB0aGVcbiAqIGJ1Y2tldCBhbmQgdGhlIHNwaGVyZXMuXG4gKlxuICogQGF1dGhvciBKb2huIEJsYW5jb1xuICovXG5cbmltcG9ydCBUUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vYXhvbi9qcy9UUHJvcGVydHkuanMnO1xuaW1wb3J0IFV0aWxzIGZyb20gJy4uLy4uLy4uL2RvdC9qcy9VdGlscy5qcyc7XG5pbXBvcnQgVmVjdG9yMiBmcm9tICcuLi8uLi8uLi9kb3QvanMvVmVjdG9yMi5qcyc7XG5pbXBvcnQgY2xlYW5BcnJheSBmcm9tICcuLi8uLi8uLi9waGV0LWNvcmUvanMvY2xlYW5BcnJheS5qcyc7XG5pbXBvcnQgb3B0aW9uaXplIGZyb20gJy4uLy4uLy4uL3BoZXQtY29yZS9qcy9vcHRpb25pemUuanMnO1xuaW1wb3J0IFRhbmRlbSBmcm9tICcuLi8uLi8uLi90YW5kZW0vanMvVGFuZGVtLmpzJztcbmltcG9ydCBBcnJheUlPIGZyb20gJy4uLy4uLy4uL3RhbmRlbS9qcy90eXBlcy9BcnJheUlPLmpzJztcbmltcG9ydCBJT1R5cGUgZnJvbSAnLi4vLi4vLi4vdGFuZGVtL2pzL3R5cGVzL0lPVHlwZS5qcyc7XG5pbXBvcnQgUmVmZXJlbmNlSU8gZnJvbSAnLi4vLi4vLi4vdGFuZGVtL2pzL3R5cGVzL1JlZmVyZW5jZUlPLmpzJztcbmltcG9ydCBwaGV0Y29tbW9uIGZyb20gJy4uL3BoZXRjb21tb24uanMnO1xuaW1wb3J0IEJ1Y2tldCwgeyBCdWNrZXRPcHRpb25zIH0gZnJvbSAnLi9CdWNrZXQuanMnO1xuXG50eXBlIFNwaGVyaWNhbCA9IHtcbiAgdXNlckNvbnRyb2xsZWRQcm9wZXJ0eTogVFByb3BlcnR5PGJvb2xlYW4+O1xuICBwb3NpdGlvblByb3BlcnR5OiBUUHJvcGVydHk8VmVjdG9yMj47XG4gIGRlc3RpbmF0aW9uUHJvcGVydHk6IFRQcm9wZXJ0eTxWZWN0b3IyPjtcbn07XG5cbnR5cGUgUGFydGljbGVXaXRoQnVja2V0UmVtb3ZhbExpc3RlbmVyPFBhcnRpY2xlIGV4dGVuZHMgU3BoZXJpY2FsPiA9IFBhcnRpY2xlICZcbiAgeyBidWNrZXRSZW1vdmFsTGlzdGVuZXI/OiAoIHVzZXJDb250cm9sbGVkOiBib29sZWFuICkgPT4gdm9pZCB9O1xuXG5jb25zdCBSZWZlcmVuY2VPYmplY3RBcnJheUlPID0gQXJyYXlJTyggUmVmZXJlbmNlSU8oIElPVHlwZS5PYmplY3RJTyApICk7XG5cbnR5cGUgU2VsZk9wdGlvbnMgPSB7XG4gIHNwaGVyZVJhZGl1cz86IG51bWJlcjtcbiAgdXNhYmxlV2lkdGhQcm9wb3J0aW9uPzogbnVtYmVyO1xuICB2ZXJ0aWNhbFBhcnRpY2xlT2Zmc2V0PzogbnVtYmVyIHwgbnVsbDtcbn07XG50eXBlIFNwaGVyZUJ1Y2tldE9wdGlvbnMgPSBTZWxmT3B0aW9ucyAmIEJ1Y2tldE9wdGlvbnM7XG5cbmNsYXNzIFNwaGVyZUJ1Y2tldDxQYXJ0aWNsZSBleHRlbmRzIFNwaGVyaWNhbD4gZXh0ZW5kcyBCdWNrZXQge1xuXG4gIHB1YmxpYyByZWFkb25seSBzcGhlcmVCdWNrZXRUYW5kZW06IFRhbmRlbTtcbiAgcHJpdmF0ZSByZWFkb25seSBfc3BoZXJlUmFkaXVzOiBudW1iZXI7XG4gIHByaXZhdGUgcmVhZG9ubHkgX3VzYWJsZVdpZHRoUHJvcG9ydGlvbjogbnVtYmVyO1xuXG4gIC8vIGVtcGlyaWNhbGx5IGRldGVybWluZWQsIGZvciBwb3NpdGlvbmluZyBwYXJ0aWNsZXMgaW5zaWRlIHRoZSBidWNrZXRcbiAgcHJpdmF0ZSByZWFkb25seSBfdmVydGljYWxQYXJ0aWNsZU9mZnNldDogbnVtYmVyO1xuXG4gIC8vIHBhcnRpY2xlcyBtYW5hZ2VkIGJ5IHRoaXMgYnVja2V0XG4gIHByaXZhdGUgX3BhcnRpY2xlczogUGFydGljbGVXaXRoQnVja2V0UmVtb3ZhbExpc3RlbmVyPFBhcnRpY2xlPltdID0gW107XG5cbiAgcHVibGljIGNvbnN0cnVjdG9yKCBwcm92aWRlZE9wdGlvbnM/OiBTcGhlcmVCdWNrZXRPcHRpb25zICkge1xuXG4gICAgY29uc3Qgb3B0aW9ucyA9IG9wdGlvbml6ZTxTcGhlcmVCdWNrZXRPcHRpb25zLCBTZWxmT3B0aW9ucywgQnVja2V0T3B0aW9ucz4oKSgge1xuICAgICAgc3BoZXJlUmFkaXVzOiAxMCwgIC8vIGV4cGVjdGVkIHJhZGl1cyBvZiB0aGUgc3BoZXJlcyB0aGF0IHdpbGwgYmUgcGxhY2VkIGluIHRoaXMgYnVja2V0XG4gICAgICB1c2FibGVXaWR0aFByb3BvcnRpb246IDEuMCwgIC8vIHByb3BvcnRpb24gb2YgdGhlIGJ1Y2tldCB3aWR0aCB0aGF0IHRoZSBzcGhlcmVzIGNhbiBvY2N1cHlcbiAgICAgIHRhbmRlbTogVGFuZGVtLk9QVElPTkFMLFxuICAgICAgcGhldGlvVHlwZTogU3BoZXJlQnVja2V0LlNwaGVyZUJ1Y2tldElPLFxuICAgICAgdmVydGljYWxQYXJ0aWNsZU9mZnNldDogbnVsbFxuICAgIH0sIHByb3ZpZGVkT3B0aW9ucyApO1xuXG4gICAgc3VwZXIoIG9wdGlvbnMgKTtcblxuICAgIHRoaXMuc3BoZXJlQnVja2V0VGFuZGVtID0gb3B0aW9ucy50YW5kZW07XG4gICAgdGhpcy5fc3BoZXJlUmFkaXVzID0gb3B0aW9ucy5zcGhlcmVSYWRpdXM7XG4gICAgdGhpcy5fdXNhYmxlV2lkdGhQcm9wb3J0aW9uID0gb3B0aW9ucy51c2FibGVXaWR0aFByb3BvcnRpb247XG5cbiAgICB0aGlzLl92ZXJ0aWNhbFBhcnRpY2xlT2Zmc2V0ID0gb3B0aW9ucy52ZXJ0aWNhbFBhcnRpY2xlT2Zmc2V0ID09PSBudWxsID9cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLXRoaXMuX3NwaGVyZVJhZGl1cyAqIDAuNCA6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9wdGlvbnMudmVydGljYWxQYXJ0aWNsZU9mZnNldDtcblxuICAgIHRoaXMuX3BhcnRpY2xlcyA9IFtdO1xuICB9XG5cbiAgLyoqXG4gICAqIGFkZCBhIHBhcnRpY2xlIHRvIHRoZSBmaXJzdCBvcGVuIHBvc2l0aW9uIGluIHRoZSBzdGFja2luZyBvcmRlclxuICAgKi9cbiAgcHVibGljIGFkZFBhcnRpY2xlRmlyc3RPcGVuKCBwYXJ0aWNsZTogUGFydGljbGUsIGFuaW1hdGU6IGJvb2xlYW4gKTogdm9pZCB7XG4gICAgcGFydGljbGUuZGVzdGluYXRpb25Qcm9wZXJ0eS5zZXQoIHRoaXMuZ2V0Rmlyc3RPcGVuUG9zaXRpb24oKSApO1xuICAgIHRoaXMuYWRkUGFydGljbGUoIHBhcnRpY2xlLCBhbmltYXRlICk7XG4gIH1cblxuICAvKipcbiAgICogYWRkIGEgcGFydGljbGUgdG8gdGhlIG5lYXJlc3Qgb3BlbiBwb3NpdGlvbiBpbiB0aGUgcGFydGljbGUgc3RhY2tcbiAgICovXG4gIHB1YmxpYyBhZGRQYXJ0aWNsZU5lYXJlc3RPcGVuKCBwYXJ0aWNsZTogUGFydGljbGUsIGFuaW1hdGU6IGJvb2xlYW4gKTogdm9pZCB7XG4gICAgcGFydGljbGUuZGVzdGluYXRpb25Qcm9wZXJ0eS5zZXQoIHRoaXMuZ2V0TmVhcmVzdE9wZW5Qb3NpdGlvbiggcGFydGljbGUuZGVzdGluYXRpb25Qcm9wZXJ0eS5nZXQoKSApICk7XG4gICAgdGhpcy5hZGRQYXJ0aWNsZSggcGFydGljbGUsIGFuaW1hdGUgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBZGQgYSBwYXJ0aWNsZSB0byB0aGUgYnVja2V0IGFuZCBzZXQgdXAgbGlzdGVuZXJzIGZvciB3aGVuIHRoZSBwYXJ0aWNsZSBpcyByZW1vdmVkLlxuICAgKi9cbiAgcHJpdmF0ZSBhZGRQYXJ0aWNsZSggcGFydGljbGU6IFBhcnRpY2xlV2l0aEJ1Y2tldFJlbW92YWxMaXN0ZW5lcjxQYXJ0aWNsZT4sIGFuaW1hdGU6IGJvb2xlYW4gKTogdm9pZCB7XG4gICAgaWYgKCAhYW5pbWF0ZSApIHtcbiAgICAgIHBhcnRpY2xlLnBvc2l0aW9uUHJvcGVydHkuc2V0KCBwYXJ0aWNsZS5kZXN0aW5hdGlvblByb3BlcnR5LmdldCgpICk7XG4gICAgfVxuICAgIHRoaXMuX3BhcnRpY2xlcy5wdXNoKCBwYXJ0aWNsZSApO1xuXG4gICAgLy8gQWRkIGEgbGlzdGVuZXIgdGhhdCB3aWxsIHJlbW92ZSB0aGlzIHBhcnRpY2xlIGZyb20gdGhlIGJ1Y2tldCBpZiB0aGUgdXNlciBncmFicyBpdC5cbiAgICBjb25zdCBwYXJ0aWNsZVJlbW92ZWRMaXN0ZW5lciA9ICggdXNlckNvbnRyb2xsZWQ6IGJvb2xlYW4gKSA9PiB7XG5cbiAgICAgIC8vIFdlIGhhdmUgdG8gdmVyaWZ5IHRoYXQgdXNlckNvbnRyb2xsZWQgaXMgdHJhbnNpdGlvbmluZyB0byB0cnVlIGhlcmUgYmVjYXVzZSBpbiBwaGV0LWlvIGl0IGlzIHBvc3NpYmxlIHRvXG4gICAgICAvLyBydW4gaW50byBzaXR1YXRpb25zIHdoZXJlIHRoZSBwYXJ0aWNsZSBpcyBhbHJlYWR5IGluIHRoZSBidWNrZXQgYnV0IHVzZXJDb250cm9sbGVkIGlzIGJlaW5nIHNldCB0byBmYWxzZSwgc2VlXG4gICAgICAvLyBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvYnVpbGQtYW4tYXRvbS9pc3N1ZXMvMjM5LlxuICAgICAgaWYgKCB1c2VyQ29udHJvbGxlZCApIHtcbiAgICAgICAgdGhpcy5yZW1vdmVQYXJ0aWNsZSggcGFydGljbGUgKTtcblxuICAgICAgICAvLyBUaGUgcHJvY2VzcyBvZiByZW1vdmluZyB0aGUgcGFydGljbGUgZnJvbSB0aGUgYnVja2V0IHNob3VsZCBhbHNvIGRpc2Nvbm5lY3QgcmVtb3ZhbCBsaXN0ZW5lci5cbiAgICAgICAgYXNzZXJ0ICYmIGFzc2VydCggIXBhcnRpY2xlLmJ1Y2tldFJlbW92YWxMaXN0ZW5lciwgJ2xpc3RlbmVyIHN0aWxsIHByZXNlbnQgYWZ0ZXIgYmVpbmcgcmVtb3ZlZCBmcm9tIGJ1Y2tldCcgKTtcbiAgICAgIH1cbiAgICB9O1xuICAgIHBhcnRpY2xlLnVzZXJDb250cm9sbGVkUHJvcGVydHkubGF6eUxpbmsoIHBhcnRpY2xlUmVtb3ZlZExpc3RlbmVyICk7XG4gICAgcGFydGljbGUuYnVja2V0UmVtb3ZhbExpc3RlbmVyID0gcGFydGljbGVSZW1vdmVkTGlzdGVuZXI7IC8vIEF0dGFjaCB0byB0aGUgcGFydGljbGUgdG8gYWlkIHVubGlua2luZyBpbiBzb21lIGNhc2VzLlxuICB9XG5cbiAgLyoqXG4gICAqIHJlbW92ZSBhIHBhcnRpY2xlIGZyb20gdGhlIGJ1Y2tldCwgdXBkYXRpbmcgbGlzdGVuZXJzIGFzIG5lY2Vzc2FyeVxuICAgKi9cbiAgcHVibGljIHJlbW92ZVBhcnRpY2xlKCBwYXJ0aWNsZTogUGFydGljbGVXaXRoQnVja2V0UmVtb3ZhbExpc3RlbmVyPFBhcnRpY2xlPiwgc2tpcExheW91dCA9IGZhbHNlICk6IHZvaWQge1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIHRoaXMuY29udGFpbnNQYXJ0aWNsZSggcGFydGljbGUgKSwgJ2F0dGVtcHQgbWFkZSB0byByZW1vdmUgcGFydGljbGUgdGhhdCBpcyBub3QgaW4gYnVja2V0JyApO1xuXG4gICAgLy8gcmVtb3ZlIHRoZSBwYXJ0aWNsZSBmcm9tIHRoZSBhcnJheVxuICAgIHRoaXMuX3BhcnRpY2xlcyA9IF8ud2l0aG91dCggdGhpcy5fcGFydGljbGVzLCBwYXJ0aWNsZSApO1xuXG4gICAgLy8gcmVtb3ZlIHRoZSByZW1vdmFsIGxpc3RlbmVyIGlmIGl0IGlzIHN0aWxsIHByZXNlbnRcbiAgICBpZiAoIHBhcnRpY2xlLmJ1Y2tldFJlbW92YWxMaXN0ZW5lciApIHtcbiAgICAgIHBhcnRpY2xlLnVzZXJDb250cm9sbGVkUHJvcGVydHkudW5saW5rKCBwYXJ0aWNsZS5idWNrZXRSZW1vdmFsTGlzdGVuZXIgKTtcbiAgICAgIGRlbGV0ZSBwYXJ0aWNsZS5idWNrZXRSZW1vdmFsTGlzdGVuZXI7XG4gICAgfVxuXG4gICAgLy8gcmVkbyB0aGUgbGF5b3V0IG9mIHRoZSBwYXJ0aWNsZXMgaWYgZW5hYmxlZFxuICAgIGlmICggIXNraXBMYXlvdXQgKSB7XG4gICAgICB0aGlzLnJlbGF5b3V0QnVja2V0UGFydGljbGVzKCk7XG4gICAgfVxuICB9XG5cbiAgcHVibGljIGNvbnRhaW5zUGFydGljbGUoIHBhcnRpY2xlOiBQYXJ0aWNsZSApOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5fcGFydGljbGVzLmluY2x1ZGVzKCBwYXJ0aWNsZSApO1xuICB9XG5cbiAgLyoqXG4gICAqIGV4dHJhY3QgdGhlIHBhcnRpY2xlIHRoYXQgaXMgY2xvc2VzdCB0byB0aGUgcHJvdmlkZWQgcG9zaXRpb24gZnJvbSB0aGUgYnVja2V0XG4gICAqL1xuICBwdWJsaWMgZXh0cmFjdENsb3Nlc3RQYXJ0aWNsZSggcG9zaXRpb246IFZlY3RvcjIgKTogUGFydGljbGUgfCBudWxsIHtcbiAgICBsZXQgY2xvc2VzdFBhcnRpY2xlOiBQYXJ0aWNsZSB8IG51bGwgPSBudWxsO1xuICAgIHRoaXMuX3BhcnRpY2xlcy5mb3JFYWNoKCBwYXJ0aWNsZSA9PiB7XG4gICAgICBpZiAoIGNsb3Nlc3RQYXJ0aWNsZSA9PT0gbnVsbCB8fFxuICAgICAgICAgICBjbG9zZXN0UGFydGljbGUucG9zaXRpb25Qcm9wZXJ0eS5nZXQoKS5kaXN0YW5jZSggcG9zaXRpb24gKSA+IHBhcnRpY2xlLnBvc2l0aW9uUHJvcGVydHkuZ2V0KCkuZGlzdGFuY2UoIHBvc2l0aW9uICkgKSB7XG4gICAgICAgIGNsb3Nlc3RQYXJ0aWNsZSA9IHBhcnRpY2xlO1xuICAgICAgfVxuICAgIH0gKTtcblxuICAgIGNvbnN0IGNsb3Nlc3RQYXJ0aWNsZVZhbHVlID0gY2xvc2VzdFBhcnRpY2xlIGFzIFBhcnRpY2xlIHwgbnVsbDtcbiAgICBpZiAoIGNsb3Nlc3RQYXJ0aWNsZVZhbHVlICE9PSBudWxsICkge1xuXG4gICAgICAvLyBUaGUgcGFydGljbGUgaXMgcmVtb3ZlZCBieSBzZXR0aW5nICd1c2VyQ29udHJvbGxlZCcgdG8gdHJ1ZS4gIFRoaXMgcmVsaWVzIG9uIHRoZSBsaXN0ZW5lciB0aGF0IHdhcyBhZGRlZCB3aGVuXG4gICAgICAvLyB0aGUgcGFydGljbGUgd2FzIHBsYWNlZCBpbnRvIHRoZSBidWNrZXQuXG4gICAgICBjbG9zZXN0UGFydGljbGVWYWx1ZS51c2VyQ29udHJvbGxlZFByb3BlcnR5LnNldCggdHJ1ZSApO1xuICAgIH1cbiAgICByZXR1cm4gY2xvc2VzdFBhcnRpY2xlO1xuICB9XG5cbiAgLyoqXG4gICAqIGdldCB0aGUgbGlzdCBvZiBwYXJ0aWNsZXMgY3VycmVudGx5IGNvbnRhaW5lZCB3aXRoaW4gdGhpcyBidWNrZXRcbiAgICovXG4gIHB1YmxpYyBnZXRQYXJ0aWNsZUxpc3QoKTogUGFydGljbGVbXSB7IHJldHVybiB0aGlzLl9wYXJ0aWNsZXM7IH1cblxuICBwdWJsaWMgcmVzZXQoKTogdm9pZCB7XG4gICAgdGhpcy5fcGFydGljbGVzLmZvckVhY2goIHBhcnRpY2xlID0+IHtcblxuICAgICAgLy8gUmVtb3ZlIGxpc3RlbmVycyB0aGF0IGFyZSB3YXRjaGluZyBmb3IgcmVtb3ZhbCBmcm9tIGJ1Y2tldC5cbiAgICAgIGlmICggdHlwZW9mICggcGFydGljbGUuYnVja2V0UmVtb3ZhbExpc3RlbmVyICkgPT09ICdmdW5jdGlvbicgKSB7XG4gICAgICAgIHBhcnRpY2xlLnVzZXJDb250cm9sbGVkUHJvcGVydHkudW5saW5rKCBwYXJ0aWNsZS5idWNrZXRSZW1vdmFsTGlzdGVuZXIgKTtcbiAgICAgICAgZGVsZXRlIHBhcnRpY2xlLmJ1Y2tldFJlbW92YWxMaXN0ZW5lcjtcbiAgICAgIH1cbiAgICB9ICk7XG4gICAgY2xlYW5BcnJheSggdGhpcy5fcGFydGljbGVzICk7XG4gIH1cblxuICAvKipcbiAgICogY2hlY2sgaWYgdGhlIHByb3ZpZGVkIHBvc2l0aW9uIGlzIG9wZW4sIGkuZS4gdW5vY2N1cGllZCBieSBhIHBhcnRpY2xlXG4gICAqL1xuICBwcml2YXRlIGlzUG9zaXRpb25PcGVuKCBwb3NpdGlvbjogVmVjdG9yMiApOiBib29sZWFuIHtcbiAgICBsZXQgcG9zaXRpb25PcGVuID0gdHJ1ZTtcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCB0aGlzLl9wYXJ0aWNsZXMubGVuZ3RoOyBpKysgKSB7XG4gICAgICBjb25zdCBwYXJ0aWNsZSA9IHRoaXMuX3BhcnRpY2xlc1sgaSBdO1xuICAgICAgaWYgKCBwYXJ0aWNsZS5kZXN0aW5hdGlvblByb3BlcnR5LmdldCgpLmVxdWFscyggcG9zaXRpb24gKSApIHtcbiAgICAgICAgcG9zaXRpb25PcGVuID0gZmFsc2U7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gcG9zaXRpb25PcGVuO1xuICB9XG5cbiAgLyoqXG4gICAqIEZpbmQgdGhlIGZpcnN0IG9wZW4gcG9zaXRpb24gaW4gdGhlIHN0YWNraW5nIG9yZGVyLCB3aGljaCBpcyBhIHRyaWFuZ3VsYXIgc3RhY2sgc3RhcnRpbmcgZnJvbSB0aGUgbG93ZXIgbGVmdC5cbiAgICovXG4gIHByaXZhdGUgZ2V0Rmlyc3RPcGVuUG9zaXRpb24oKTogVmVjdG9yMiB7XG4gICAgbGV0IG9wZW5Qb3NpdGlvbiA9IFZlY3RvcjIuWkVSTztcbiAgICBjb25zdCB1c2FibGVXaWR0aCA9IHRoaXMuc2l6ZS53aWR0aCAqIHRoaXMuX3VzYWJsZVdpZHRoUHJvcG9ydGlvbiAtIDIgKiB0aGlzLl9zcGhlcmVSYWRpdXM7XG4gICAgbGV0IG9mZnNldEZyb21CdWNrZXRFZGdlID0gKCB0aGlzLnNpemUud2lkdGggLSB1c2FibGVXaWR0aCApIC8gMiArIHRoaXMuX3NwaGVyZVJhZGl1cztcbiAgICBsZXQgbnVtUGFydGljbGVzSW5MYXllciA9IE1hdGguZmxvb3IoIHVzYWJsZVdpZHRoIC8gKCB0aGlzLl9zcGhlcmVSYWRpdXMgKiAyICkgKTtcbiAgICBsZXQgcm93ID0gMDtcbiAgICBsZXQgcG9zaXRpb25JbkxheWVyID0gMDtcbiAgICBsZXQgZm91bmQgPSBmYWxzZTtcbiAgICB3aGlsZSAoICFmb3VuZCApIHtcbiAgICAgIGNvbnN0IHRlc3RQb3NpdGlvbiA9IG5ldyBWZWN0b3IyKFxuICAgICAgICB0aGlzLnBvc2l0aW9uLnggLSB0aGlzLnNpemUud2lkdGggLyAyICsgb2Zmc2V0RnJvbUJ1Y2tldEVkZ2UgKyBwb3NpdGlvbkluTGF5ZXIgKiAyICogdGhpcy5fc3BoZXJlUmFkaXVzLFxuICAgICAgICB0aGlzLmdldFlQb3NpdGlvbkZvckxheWVyKCByb3cgKVxuICAgICAgKTtcbiAgICAgIGlmICggdGhpcy5pc1Bvc2l0aW9uT3BlbiggdGVzdFBvc2l0aW9uICkgKSB7XG5cbiAgICAgICAgLy8gV2UgZm91bmQgYSBwb3NpdGlvbiB0aGF0IGlzIG9wZW4uXG4gICAgICAgIG9wZW5Qb3NpdGlvbiA9IHRlc3RQb3NpdGlvbjtcbiAgICAgICAgZm91bmQgPSB0cnVlO1xuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgIHBvc2l0aW9uSW5MYXllcisrO1xuICAgICAgICBpZiAoIHBvc2l0aW9uSW5MYXllciA+PSBudW1QYXJ0aWNsZXNJbkxheWVyICkge1xuICAgICAgICAgIC8vIE1vdmUgdG8gdGhlIG5leHQgbGF5ZXIuXG4gICAgICAgICAgcm93Kys7XG4gICAgICAgICAgcG9zaXRpb25JbkxheWVyID0gMDtcbiAgICAgICAgICBudW1QYXJ0aWNsZXNJbkxheWVyLS07XG4gICAgICAgICAgb2Zmc2V0RnJvbUJ1Y2tldEVkZ2UgKz0gdGhpcy5fc3BoZXJlUmFkaXVzO1xuICAgICAgICAgIGlmICggbnVtUGFydGljbGVzSW5MYXllciA9PT0gMCApIHtcbiAgICAgICAgICAgIC8vIFRoaXMgYWxnb3JpdGhtIGRvZXNuJ3QgaGFuZGxlIHRoZSBzaXR1YXRpb24gd2hlcmVcbiAgICAgICAgICAgIC8vIG1vcmUgcGFydGljbGVzIGFyZSBhZGRlZCB0aGFuIGNhbiBiZSBzdGFja2VkIGludG9cbiAgICAgICAgICAgIC8vIGEgcHlyYW1pZCBvZiB0aGUgbmVlZGVkIHNpemUsIGJ1dCBzbyBmYXIgaXQgaGFzbid0XG4gICAgICAgICAgICAvLyBuZWVkZWQgdG8uICBJZiB0aGlzIHJlcXVpcmVtZW50IGNoYW5nZXMsIHRoZVxuICAgICAgICAgICAgLy8gYWxnb3JpdGhtIHdpbGwgbmVlZCB0byBjaGFuZ2UgdG9vLlxuICAgICAgICAgICAgbnVtUGFydGljbGVzSW5MYXllciA9IDE7XG4gICAgICAgICAgICBvZmZzZXRGcm9tQnVja2V0RWRnZSAtPSB0aGlzLl9zcGhlcmVSYWRpdXM7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBvcGVuUG9zaXRpb247XG4gIH1cblxuICAvKipcbiAgICogZ2V0IHRoZSBsYXllciBpbiB0aGUgc3RhY2tpbmcgb3JkZXIgZm9yIHRoZSBwcm92aWRlZCB5ICh2ZXJ0aWNhbCkgcG9zaXRpb25cbiAgICovXG4gIHByaXZhdGUgZ2V0TGF5ZXJGb3JZUG9zaXRpb24oIHlQb3NpdGlvbjogbnVtYmVyICk6IG51bWJlciB7XG4gICAgcmV0dXJuIE1hdGguYWJzKCBVdGlscy5yb3VuZFN5bW1ldHJpYyggKCB5UG9zaXRpb24gLSAoIHRoaXMucG9zaXRpb24ueSArIHRoaXMuX3ZlcnRpY2FsUGFydGljbGVPZmZzZXQgKSApIC8gKCB0aGlzLl9zcGhlcmVSYWRpdXMgKiAyICogMC44NjYgKSApICk7XG4gIH1cblxuICAvKipcbiAgICogR2V0IHRoZSBuZWFyZXN0IG9wZW4gcG9zaXRpb24gaW4gdGhlIHN0YWNraW5nIG9yZGVyIHRoYXQgd291bGQgYmUgc3VwcG9ydGVkIGlmIHRoZSBwYXJ0aWNsZSB3ZXJlIHRvIGJlIHBsYWNlZFxuICAgKiB0aGVyZS4gIFRoaXMgaXMgdXNlZCBmb3IgcGFydGljbGUgc3RhY2tpbmcuXG4gICAqL1xuICBwcml2YXRlIGdldE5lYXJlc3RPcGVuUG9zaXRpb24oIHBvc2l0aW9uOiBWZWN0b3IyICk6IFZlY3RvcjIge1xuXG4gICAgLy8gRGV0ZXJtaW5lIHRoZSBoaWdoZXN0IG9jY3VwaWVkIGxheWVyLiAgVGhlIGJvdHRvbSBsYXllciBpcyAwLlxuICAgIGxldCBoaWdoZXN0T2NjdXBpZWRMYXllciA9IDA7XG4gICAgXy5lYWNoKCB0aGlzLl9wYXJ0aWNsZXMsIHBhcnRpY2xlID0+IHtcbiAgICAgIGNvbnN0IGxheWVyID0gdGhpcy5nZXRMYXllckZvcllQb3NpdGlvbiggcGFydGljbGUuZGVzdGluYXRpb25Qcm9wZXJ0eS5nZXQoKS55ICk7XG4gICAgICBpZiAoIGxheWVyID4gaGlnaGVzdE9jY3VwaWVkTGF5ZXIgKSB7XG4gICAgICAgIGhpZ2hlc3RPY2N1cGllZExheWVyID0gbGF5ZXI7XG4gICAgICB9XG4gICAgfSApO1xuXG4gICAgLy8gTWFrZSBhIGxpc3Qgb2YgYWxsIG9wZW4gcG9zaXRpb25zIGluIHRoZSBvY2N1cGllZCBsYXllcnMuXG4gICAgY29uc3Qgb3BlblBvc2l0aW9ucyA9IFtdO1xuICAgIGNvbnN0IHVzYWJsZVdpZHRoID0gdGhpcy5zaXplLndpZHRoICogdGhpcy5fdXNhYmxlV2lkdGhQcm9wb3J0aW9uIC0gMiAqIHRoaXMuX3NwaGVyZVJhZGl1cztcbiAgICBsZXQgb2Zmc2V0RnJvbUJ1Y2tldEVkZ2UgPSAoIHRoaXMuc2l6ZS53aWR0aCAtIHVzYWJsZVdpZHRoICkgLyAyICsgdGhpcy5fc3BoZXJlUmFkaXVzO1xuICAgIGxldCBudW1QYXJ0aWNsZXNJbkxheWVyID0gTWF0aC5mbG9vciggdXNhYmxlV2lkdGggLyAoIHRoaXMuX3NwaGVyZVJhZGl1cyAqIDIgKSApO1xuXG4gICAgLy8gTG9vcCwgc2VhcmNoaW5nIGZvciBvcGVuIHBvc2l0aW9ucyBpbiB0aGUgcGFydGljbGUgc3RhY2suXG4gICAgZm9yICggbGV0IGxheWVyID0gMDsgbGF5ZXIgPD0gaGlnaGVzdE9jY3VwaWVkTGF5ZXIgKyAxOyBsYXllcisrICkge1xuXG4gICAgICAvLyBBZGQgYWxsIG9wZW4gcG9zaXRpb25zIGluIHRoZSBjdXJyZW50IGxheWVyLlxuICAgICAgZm9yICggbGV0IHBvc2l0aW9uSW5MYXllciA9IDA7IHBvc2l0aW9uSW5MYXllciA8IG51bVBhcnRpY2xlc0luTGF5ZXI7IHBvc2l0aW9uSW5MYXllcisrICkge1xuICAgICAgICBjb25zdCB0ZXN0UG9zaXRpb24gPSBuZXcgVmVjdG9yMiggdGhpcy5wb3NpdGlvbi54IC0gdGhpcy5zaXplLndpZHRoIC8gMiArIG9mZnNldEZyb21CdWNrZXRFZGdlICsgcG9zaXRpb25JbkxheWVyICogMiAqIHRoaXMuX3NwaGVyZVJhZGl1cyxcbiAgICAgICAgICB0aGlzLmdldFlQb3NpdGlvbkZvckxheWVyKCBsYXllciApICk7XG4gICAgICAgIGlmICggdGhpcy5pc1Bvc2l0aW9uT3BlbiggdGVzdFBvc2l0aW9uICkgKSB7XG5cbiAgICAgICAgICAvLyBXZSBmb3VuZCBhIHBvc2l0aW9uIHRoYXQgaXMgdW5vY2N1cGllZC5cbiAgICAgICAgICBpZiAoIGxheWVyID09PSAwIHx8IHRoaXMuY291bnRTdXBwb3J0aW5nUGFydGljbGVzKCB0ZXN0UG9zaXRpb24gKSA9PT0gMiApIHtcblxuICAgICAgICAgICAgLy8gVGhpcyBpcyBhIHZhbGlkIG9wZW4gcG9zaXRpb24uXG4gICAgICAgICAgICBvcGVuUG9zaXRpb25zLnB1c2goIHRlc3RQb3NpdGlvbiApO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvLyBBZGp1c3QgdmFyaWFibGVzIGZvciB0aGUgbmV4dCBsYXllci5cbiAgICAgIG51bVBhcnRpY2xlc0luTGF5ZXItLTtcbiAgICAgIG9mZnNldEZyb21CdWNrZXRFZGdlICs9IHRoaXMuX3NwaGVyZVJhZGl1cztcbiAgICAgIGlmICggbnVtUGFydGljbGVzSW5MYXllciA9PT0gMCApIHtcblxuICAgICAgICAvLyBJZiB0aGUgc3RhY2tpbmcgcHlyYW1pZCBpcyBmdWxsLCBtZWFuaW5nIHRoYXQgdGhlcmUgYXJlIG5vIHBvc2l0aW9ucyB0aGF0IGFyZSBvcGVuIHdpdGhpbiBpdCwgdGhpcyBhbGdvcml0aG1cbiAgICAgICAgLy8gY2xhc3NpZmllcyB0aGUgcG9zaXRpb25zIGRpcmVjdGx5IGFib3ZlIHRoZSB0b3Agb2YgdGhlIHB5cmFtaWQgYXMgYmVpbmcgb3Blbi4gIFRoaXMgd291bGQgcmVzdWx0IGluIGEgc3RhY2tcbiAgICAgICAgLy8gb2YgcGFydGljbGVzIHdpdGggYSBweXJhbWlkIGJhc2UuICBTbyBmYXIsIHRoaXMgaGFzbid0IGJlZW4gYSBwcm9ibGVtLCBidXQgdGhpcyBsaW1pdGF0aW9uIG1heSBsaW1pdFxuICAgICAgICAvLyByZXVzYWJpbGl0eSBvZiB0aGlzIGFsZ29yaXRobS5cbiAgICAgICAgbnVtUGFydGljbGVzSW5MYXllciA9IDE7XG4gICAgICAgIG9mZnNldEZyb21CdWNrZXRFZGdlIC09IHRoaXMuX3NwaGVyZVJhZGl1cztcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBGaW5kIHRoZSBjbG9zZXN0IG9wZW4gcG9zaXRpb24gdG8gdGhlIHByb3ZpZGVkIGN1cnJlbnQgcG9zaXRpb24uXG4gICAgLy8gT25seSB0aGUgWC1jb21wb25lbnQgaXMgdXNlZCBmb3IgdGhpcyBkZXRlcm1pbmF0aW9uLCBiZWNhdXNlIGlmXG4gICAgLy8gdGhlIFktY29tcG9uZW50IGlzIHVzZWQgdGhlIHBhcnRpY2xlcyBvZnRlbiBhcHBlYXIgdG8gZmFsbCBzaWRld2F5c1xuICAgIC8vIHdoZW4gcmVsZWFzZWQgYWJvdmUgdGhlIGJ1Y2tldCwgd2hpY2gganVzdCBsb29rcyB3ZWlyZC5cbiAgICBsZXQgY2xvc2VzdE9wZW5Qb3NpdGlvbiA9IG9wZW5Qb3NpdGlvbnNbIDAgXSB8fCBWZWN0b3IyLlpFUk87XG5cbiAgICBfLmVhY2goIG9wZW5Qb3NpdGlvbnMsIG9wZW5Qb3NpdGlvbiA9PiB7XG4gICAgICBpZiAoIG9wZW5Qb3NpdGlvbi5kaXN0YW5jZSggcG9zaXRpb24gKSA8IGNsb3Nlc3RPcGVuUG9zaXRpb24uZGlzdGFuY2UoIHBvc2l0aW9uICkgKSB7XG4gICAgICAgIC8vIFRoaXMgb3BlblBvc2l0aW9uIGlzIGNsb3Nlci5cbiAgICAgICAgY2xvc2VzdE9wZW5Qb3NpdGlvbiA9IG9wZW5Qb3NpdGlvbjtcbiAgICAgIH1cbiAgICB9ICk7XG4gICAgcmV0dXJuIGNsb3Nlc3RPcGVuUG9zaXRpb247XG4gIH1cblxuICAvKipcbiAgICogZ2l2ZW4gYSBsYXllciBpbiB0aGUgc3RhY2ssIGNhbGN1bGF0ZSB0aGUgY29ycmVzcG9uZGluZyBZIHBvc2l0aW9uIGZvciBhIHBhcnRpY2xlIGluIHRoYXQgbGF5ZXJcbiAgICovXG4gIHByaXZhdGUgZ2V0WVBvc2l0aW9uRm9yTGF5ZXIoIGxheWVyOiBudW1iZXIgKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5wb3NpdGlvbi55ICsgdGhpcy5fdmVydGljYWxQYXJ0aWNsZU9mZnNldCArIGxheWVyICogdGhpcy5fc3BoZXJlUmFkaXVzICogMiAqIDAuODY2O1xuICB9XG5cbiAgLyoqXG4gICAqIERldGVybWluZSB3aGV0aGVyIGEgcGFydGljbGUgaXMgJ2RhbmdsaW5nJywgaS5lLiBoYW5naW5nIGFib3ZlIGFuIG9wZW4gc3BhY2UgaW4gdGhlIHN0YWNrIG9mIHBhcnRpY2xlcy4gIERhbmdsaW5nXG4gICAqIHBhcnRpY2xlcyBzaG91bGQgYmUgbWFkZSB0byBmYWxsIHRvIGEgc3RhYmxlIHBvc2l0aW9uLlxuICAgKi9cbiAgcHJpdmF0ZSBpc0RhbmdsaW5nKCBwYXJ0aWNsZTogUGFydGljbGUgKTogYm9vbGVhbiB7XG4gICAgY29uc3Qgb25Cb3R0b21Sb3cgPSBwYXJ0aWNsZS5kZXN0aW5hdGlvblByb3BlcnR5LmdldCgpLnkgPT09IHRoaXMucG9zaXRpb24ueSArIHRoaXMuX3ZlcnRpY2FsUGFydGljbGVPZmZzZXQ7XG4gICAgcmV0dXJuICFvbkJvdHRvbVJvdyAmJiB0aGlzLmNvdW50U3VwcG9ydGluZ1BhcnRpY2xlcyggcGFydGljbGUuZGVzdGluYXRpb25Qcm9wZXJ0eS5nZXQoKSApIDwgMjtcbiAgfVxuXG4gIC8qKlxuICAgKiBjb3VudCB0aGUgbnVtYmVyIG9mIHBhcnRpY2xlcyB0aGF0IGFyZSBwb3NpdGlvbmVkIHRvIHN1cHBvcnQgYSBwYXJ0aWNsZSBpbiB0aGUgcHJvdmlkZWQgcG9zaXRpb25cbiAgICogQHJldHVybnMgLSBhIG51bWJlciBmcm9tIDAgdG8gMiwgaW5jbHVzaXZlXG4gICAqL1xuICBwcml2YXRlIGNvdW50U3VwcG9ydGluZ1BhcnRpY2xlcyggcG9zaXRpb246IFZlY3RvcjIgKTogbnVtYmVyIHtcbiAgICBsZXQgY291bnQgPSAwO1xuICAgIGZvciAoIGxldCBpID0gMDsgaSA8IHRoaXMuX3BhcnRpY2xlcy5sZW5ndGg7IGkrKyApIHtcbiAgICAgIGNvbnN0IHAgPSB0aGlzLl9wYXJ0aWNsZXNbIGkgXTtcbiAgICAgIGlmICggcC5kZXN0aW5hdGlvblByb3BlcnR5LmdldCgpLnkgPCBwb3NpdGlvbi55ICYmIC8vIE11c3QgYmUgaW4gYSBsb3dlciBsYXllclxuICAgICAgICAgICBwLmRlc3RpbmF0aW9uUHJvcGVydHkuZ2V0KCkuZGlzdGFuY2UoIHBvc2l0aW9uICkgPCB0aGlzLl9zcGhlcmVSYWRpdXMgKiAzICkge1xuXG4gICAgICAgIC8vIE11c3QgYmUgYSBzdXBwb3J0aW5nIHBhcnRpY2xlLlxuICAgICAgICBjb3VudCsrO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gY291bnQ7XG4gIH1cblxuICAvKipcbiAgICogUmVsYXlvdXQgdGhlIHBhcnRpY2xlcywgZ2VuZXJhbGx5IGRvbmUgYWZ0ZXIgYSBwYXJ0aWNsZSBpcyByZW1vdmVkIGFuZCBzb21lIG90aGVyIG5lZWQgdG8gZmFsbC5cbiAgICovXG4gIHByaXZhdGUgcmVsYXlvdXRCdWNrZXRQYXJ0aWNsZXMoKTogdm9pZCB7XG4gICAgbGV0IHBhcnRpY2xlTW92ZWQ7XG4gICAgZG8ge1xuICAgICAgZm9yICggbGV0IGkgPSAwOyBpIDwgdGhpcy5fcGFydGljbGVzLmxlbmd0aDsgaSsrICkge1xuICAgICAgICBwYXJ0aWNsZU1vdmVkID0gZmFsc2U7XG4gICAgICAgIGNvbnN0IHBhcnRpY2xlID0gdGhpcy5fcGFydGljbGVzWyBpIF07XG4gICAgICAgIGlmICggdGhpcy5pc0RhbmdsaW5nKCBwYXJ0aWNsZSApICkge1xuICAgICAgICAgIHBhcnRpY2xlLmRlc3RpbmF0aW9uUHJvcGVydHkuc2V0KCB0aGlzLmdldE5lYXJlc3RPcGVuUG9zaXRpb24oIHBhcnRpY2xlLmRlc3RpbmF0aW9uUHJvcGVydHkuZ2V0KCkgKSApO1xuICAgICAgICAgIHBhcnRpY2xlTW92ZWQgPSB0cnVlO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSB3aGlsZSAoIHBhcnRpY2xlTW92ZWQgKTtcbiAgfVxuXG4gIHB1YmxpYyBzdGF0aWMgU3BoZXJlQnVja2V0SU8gPSBuZXcgSU9UeXBlKCAnU3BoZXJlQnVja2V0SU8nLCB7XG4gICAgdmFsdWVUeXBlOiBTcGhlcmVCdWNrZXQsXG4gICAgZG9jdW1lbnRhdGlvbjogJ0EgbW9kZWwgb2YgYSBidWNrZXQgaW50byB3aGljaCBzcGhlcmljYWwgb2JqZWN0cyBjYW4gYmUgcGxhY2VkLicsXG4gICAgc3RhdGVTY2hlbWE6IHtcbiAgICAgIHBhcnRpY2xlczogUmVmZXJlbmNlT2JqZWN0QXJyYXlJT1xuICAgIH0sXG4gICAgdG9TdGF0ZU9iamVjdDogc3BoZXJlQnVja2V0ID0+IHtcbiAgICAgIHJldHVybiB7IHBhcnRpY2xlczogUmVmZXJlbmNlT2JqZWN0QXJyYXlJTy50b1N0YXRlT2JqZWN0KCBzcGhlcmVCdWNrZXQuX3BhcnRpY2xlcyApIH07XG4gICAgfSxcbiAgICBhcHBseVN0YXRlOiAoIHNwaGVyZUJ1Y2tldCwgc3RhdGVPYmplY3QgKSA9PiB7XG5cbiAgICAgIC8vIHJlbW92ZSBhbGwgdGhlIHBhcnRpY2xlcyBmcm9tIHRoZSBvYnNlcnZhYmxlIGFycmF5c1xuICAgICAgc3BoZXJlQnVja2V0LnJlc2V0KCk7XG5cbiAgICAgIGNvbnN0IHBhcnRpY2xlcyA9IFJlZmVyZW5jZU9iamVjdEFycmF5SU8uZnJvbVN0YXRlT2JqZWN0KCBzdGF0ZU9iamVjdC5wYXJ0aWNsZXMgKTtcblxuICAgICAgLy8gYWRkIGJhY2sgdGhlIHBhcnRpY2xlc1xuICAgICAgcGFydGljbGVzLmZvckVhY2goIHBhcnRpY2xlID0+IHsgc3BoZXJlQnVja2V0LmFkZFBhcnRpY2xlKCBwYXJ0aWNsZSApOyB9ICk7XG4gICAgfVxuICB9ICk7XG59XG5cbnBoZXRjb21tb24ucmVnaXN0ZXIoICdTcGhlcmVCdWNrZXQnLCBTcGhlcmVCdWNrZXQgKTtcbmV4cG9ydCBkZWZhdWx0IFNwaGVyZUJ1Y2tldDsiXSwibmFtZXMiOlsiVXRpbHMiLCJWZWN0b3IyIiwiY2xlYW5BcnJheSIsIm9wdGlvbml6ZSIsIlRhbmRlbSIsIkFycmF5SU8iLCJJT1R5cGUiLCJSZWZlcmVuY2VJTyIsInBoZXRjb21tb24iLCJCdWNrZXQiLCJSZWZlcmVuY2VPYmplY3RBcnJheUlPIiwiT2JqZWN0SU8iLCJTcGhlcmVCdWNrZXQiLCJhZGRQYXJ0aWNsZUZpcnN0T3BlbiIsInBhcnRpY2xlIiwiYW5pbWF0ZSIsImRlc3RpbmF0aW9uUHJvcGVydHkiLCJzZXQiLCJnZXRGaXJzdE9wZW5Qb3NpdGlvbiIsImFkZFBhcnRpY2xlIiwiYWRkUGFydGljbGVOZWFyZXN0T3BlbiIsImdldE5lYXJlc3RPcGVuUG9zaXRpb24iLCJnZXQiLCJwb3NpdGlvblByb3BlcnR5IiwiX3BhcnRpY2xlcyIsInB1c2giLCJwYXJ0aWNsZVJlbW92ZWRMaXN0ZW5lciIsInVzZXJDb250cm9sbGVkIiwicmVtb3ZlUGFydGljbGUiLCJhc3NlcnQiLCJidWNrZXRSZW1vdmFsTGlzdGVuZXIiLCJ1c2VyQ29udHJvbGxlZFByb3BlcnR5IiwibGF6eUxpbmsiLCJza2lwTGF5b3V0IiwiY29udGFpbnNQYXJ0aWNsZSIsIl8iLCJ3aXRob3V0IiwidW5saW5rIiwicmVsYXlvdXRCdWNrZXRQYXJ0aWNsZXMiLCJpbmNsdWRlcyIsImV4dHJhY3RDbG9zZXN0UGFydGljbGUiLCJwb3NpdGlvbiIsImNsb3Nlc3RQYXJ0aWNsZSIsImZvckVhY2giLCJkaXN0YW5jZSIsImNsb3Nlc3RQYXJ0aWNsZVZhbHVlIiwiZ2V0UGFydGljbGVMaXN0IiwicmVzZXQiLCJpc1Bvc2l0aW9uT3BlbiIsInBvc2l0aW9uT3BlbiIsImkiLCJsZW5ndGgiLCJlcXVhbHMiLCJvcGVuUG9zaXRpb24iLCJaRVJPIiwidXNhYmxlV2lkdGgiLCJzaXplIiwid2lkdGgiLCJfdXNhYmxlV2lkdGhQcm9wb3J0aW9uIiwiX3NwaGVyZVJhZGl1cyIsIm9mZnNldEZyb21CdWNrZXRFZGdlIiwibnVtUGFydGljbGVzSW5MYXllciIsIk1hdGgiLCJmbG9vciIsInJvdyIsInBvc2l0aW9uSW5MYXllciIsImZvdW5kIiwidGVzdFBvc2l0aW9uIiwieCIsImdldFlQb3NpdGlvbkZvckxheWVyIiwiZ2V0TGF5ZXJGb3JZUG9zaXRpb24iLCJ5UG9zaXRpb24iLCJhYnMiLCJyb3VuZFN5bW1ldHJpYyIsInkiLCJfdmVydGljYWxQYXJ0aWNsZU9mZnNldCIsImhpZ2hlc3RPY2N1cGllZExheWVyIiwiZWFjaCIsImxheWVyIiwib3BlblBvc2l0aW9ucyIsImNvdW50U3VwcG9ydGluZ1BhcnRpY2xlcyIsImNsb3Nlc3RPcGVuUG9zaXRpb24iLCJpc0RhbmdsaW5nIiwib25Cb3R0b21Sb3ciLCJjb3VudCIsInAiLCJwYXJ0aWNsZU1vdmVkIiwicHJvdmlkZWRPcHRpb25zIiwib3B0aW9ucyIsInNwaGVyZVJhZGl1cyIsInVzYWJsZVdpZHRoUHJvcG9ydGlvbiIsInRhbmRlbSIsIk9QVElPTkFMIiwicGhldGlvVHlwZSIsIlNwaGVyZUJ1Y2tldElPIiwidmVydGljYWxQYXJ0aWNsZU9mZnNldCIsInNwaGVyZUJ1Y2tldFRhbmRlbSIsInZhbHVlVHlwZSIsImRvY3VtZW50YXRpb24iLCJzdGF0ZVNjaGVtYSIsInBhcnRpY2xlcyIsInRvU3RhdGVPYmplY3QiLCJzcGhlcmVCdWNrZXQiLCJhcHBseVN0YXRlIiwic3RhdGVPYmplY3QiLCJmcm9tU3RhdGVPYmplY3QiLCJyZWdpc3RlciJdLCJtYXBwaW5ncyI6IkFBQUEsc0RBQXNEO0FBRXREOzs7Ozs7OztDQVFDLEdBR0QsT0FBT0EsV0FBVywyQkFBMkI7QUFDN0MsT0FBT0MsYUFBYSw2QkFBNkI7QUFDakQsT0FBT0MsZ0JBQWdCLHNDQUFzQztBQUM3RCxPQUFPQyxlQUFlLHFDQUFxQztBQUMzRCxPQUFPQyxZQUFZLCtCQUErQjtBQUNsRCxPQUFPQyxhQUFhLHNDQUFzQztBQUMxRCxPQUFPQyxZQUFZLHFDQUFxQztBQUN4RCxPQUFPQyxpQkFBaUIsMENBQTBDO0FBQ2xFLE9BQU9DLGdCQUFnQixtQkFBbUI7QUFDMUMsT0FBT0MsWUFBK0IsY0FBYztBQVdwRCxNQUFNQyx5QkFBeUJMLFFBQVNFLFlBQWFELE9BQU9LLFFBQVE7QUFTcEUsSUFBQSxBQUFNQyxlQUFOLE1BQU1BLHFCQUFpREg7SUFtQ3JEOztHQUVDLEdBQ0QsQUFBT0kscUJBQXNCQyxRQUFrQixFQUFFQyxPQUFnQixFQUFTO1FBQ3hFRCxTQUFTRSxtQkFBbUIsQ0FBQ0MsR0FBRyxDQUFFLElBQUksQ0FBQ0Msb0JBQW9CO1FBQzNELElBQUksQ0FBQ0MsV0FBVyxDQUFFTCxVQUFVQztJQUM5QjtJQUVBOztHQUVDLEdB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