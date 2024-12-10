// Copyright 2022-2024, University of Colorado Boulder
/**
 * Sizable is a trait that provides a minimum and preferred width/height (both WidthSizable and HeightSizable,
 * but with added features that allow convenience of working with both dimensions at once).
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ import Dimension2 from '../../../dot/js/Dimension2.js';
import assertMutuallyExclusiveOptions from '../../../phet-core/js/assertMutuallyExclusiveOptions.js';
import memoize from '../../../phet-core/js/memoize.js';
import { DelayedMutate, HEIGHT_SIZABLE_OPTION_KEYS, HeightSizable, REQUIRES_BOUNDS_OPTION_KEYS, scenery, WIDTH_SIZABLE_OPTION_KEYS, WidthSizable } from '../imports.js';
export const SIZABLE_SELF_OPTION_KEYS = [
    'preferredSize',
    'minimumSize',
    'localPreferredSize',
    'localMinimumSize',
    'sizable'
];
export const SIZABLE_OPTION_KEYS = [
    'preferredSize',
    'minimumSize',
    'localPreferredSize',
    'localMinimumSize',
    'sizable',
    ...WIDTH_SIZABLE_OPTION_KEYS,
    ...HEIGHT_SIZABLE_OPTION_KEYS
];
const Sizable = memoize((Type)=>{
    const SizableTrait = DelayedMutate('Sizable', SIZABLE_SELF_OPTION_KEYS, class SizableTrait extends WidthSizable(HeightSizable(Type)) {
        get preferredSize() {
            assert && assert(this.preferredWidth === null === (this.preferredHeight === null), 'Cannot get a preferredSize when one of preferredWidth/preferredHeight is null');
            if (this.preferredWidth === null || this.preferredHeight === null) {
                return null;
            } else {
                return new Dimension2(this.preferredWidth, this.preferredHeight);
            }
        }
        set preferredSize(value) {
            this.preferredWidth = value === null ? null : value.width;
            this.preferredHeight = value === null ? null : value.height;
        }
        get localPreferredSize() {
            assert && assert(this.localPreferredWidth === null === (this.localPreferredHeight === null), 'Cannot get a preferredSize when one of preferredWidth/preferredHeight is null');
            if (this.localPreferredWidth === null || this.localPreferredHeight === null) {
                return null;
            } else {
                return new Dimension2(this.localPreferredWidth, this.localPreferredHeight);
            }
        }
        set localPreferredSize(value) {
            this.localPreferredWidth = value === null ? null : value.width;
            this.localPreferredHeight = value === null ? null : value.height;
        }
        get minimumSize() {
            assert && assert(this.minimumWidth === null === (this.minimumHeight === null), 'Cannot get a minimumSize when one of minimumWidth/minimumHeight is null');
            if (this.minimumWidth === null || this.minimumHeight === null) {
                return null;
            } else {
                return new Dimension2(this.minimumWidth, this.minimumHeight);
            }
        }
        set minimumSize(value) {
            this.minimumWidth = value === null ? null : value.width;
            this.minimumHeight = value === null ? null : value.height;
        }
        get localMinimumSize() {
            assert && assert(this.localMinimumWidth === null === (this.localMinimumHeight === null), 'Cannot get a minimumSize when one of minimumWidth/minimumHeight is null');
            if (this.localMinimumWidth === null || this.localMinimumHeight === null) {
                return null;
            } else {
                return new Dimension2(this.localMinimumWidth, this.localMinimumHeight);
            }
        }
        set localMinimumSize(value) {
            this.localMinimumWidth = value === null ? null : value.width;
            this.localMinimumHeight = value === null ? null : value.height;
        }
        get sizable() {
            assert && assert(this.widthSizable === this.heightSizable, 'widthSizable and heightSizable not the same, which is required for the sizable getter');
            return this.widthSizable;
        }
        set sizable(value) {
            this.widthSizable = value;
            this.heightSizable = value;
        }
        get extendsSizable() {
            return true;
        }
        validateLocalPreferredSize() {
            if (assert) {
                this.validateLocalPreferredWidth();
                this.validateLocalPreferredHeight();
            }
        }
        mutate(options) {
            assertMutuallyExclusiveOptions(options, [
                'preferredSize'
            ], [
                'preferredWidth',
                'preferredHeight'
            ]);
            assertMutuallyExclusiveOptions(options, [
                'localPreferredSize'
            ], [
                'localPreferredWidth',
                'localPreferredHeight'
            ]);
            assertMutuallyExclusiveOptions(options, [
                'minimumSize'
            ], [
                'minimumWidth',
                'minimumHeight'
            ]);
            assertMutuallyExclusiveOptions(options, [
                'localMinimumSize'
            ], [
                'localMinimumWidth',
                'localMinimumHeight'
            ]);
            assertMutuallyExclusiveOptions(options, [
                'sizable'
            ], [
                'widthSizable',
                'heightSizable'
            ]);
            return super.mutate(options);
        }
        // Override the calculation to potentially include the opposite dimension (if we have a rotation of that type)
        _calculateLocalPreferredWidth() {
            if (this.matrix.isAxisAligned()) {
                if (this.matrix.isAligned()) {
                    if (this.preferredWidth !== null) {
                        return Math.abs(this.transform.inverseDeltaX(this.preferredWidth));
                    }
                } else if (this.preferredHeight !== null) {
                    return Math.abs(this.transform.getInverse().m01() * this.preferredHeight);
                }
            }
            return null;
        }
        // Override the calculation to potentially include the opposite dimension (if we have a rotation of that type)
        _calculateLocalPreferredHeight() {
            if (this.matrix.isAxisAligned()) {
                if (this.matrix.isAligned()) {
                    if (this.preferredHeight !== null) {
                        return Math.abs(this.transform.inverseDeltaY(this.preferredHeight));
                    }
                } else if (this.preferredWidth !== null) {
                    return Math.abs(this.transform.getInverse().m10() * this.preferredWidth);
                }
            }
            return null;
        }
        // Override the calculation to potentially include the opposite dimension (if we have a rotation of that type)
        _calculatePreferredWidth() {
            if (this.matrix.isAxisAligned()) {
                if (this.matrix.isAligned()) {
                    if (this.localPreferredWidth !== null) {
                        return Math.abs(this.transform.transformDeltaX(this.localPreferredWidth));
                    }
                } else if (this.localPreferredHeight !== null) {
                    return Math.abs(this.transform.matrix.m01() * this.localPreferredHeight);
                }
            }
            return null;
        }
        // Override the calculation to potentially include the opposite dimension (if we have a rotation of that type)
        _calculatePreferredHeight() {
            if (this.matrix.isAxisAligned()) {
                if (this.matrix.isAligned()) {
                    if (this.localPreferredHeight !== null) {
                        return Math.abs(this.transform.transformDeltaY(this.localPreferredHeight));
                    }
                } else if (this.localPreferredWidth !== null) {
                    return Math.abs(this.transform.matrix.m10() * this.localPreferredWidth);
                }
            }
            return null;
        }
        // We'll need to cross-link because we might need to update either the width or height when the other changes
        _onReentrantLocalMinimumWidth() {
            this._updateMinimumWidthListener();
            this._updateMinimumHeightListener();
        }
        // We'll need to cross-link because we might need to update either the width or height when the other changes
        _onReentrantLocalMinimumHeight() {
            this._updateMinimumWidthListener();
            this._updateMinimumHeightListener();
        }
        // We'll need to cross-link because we might need to update either the width or height when the other changes
        _onReentrantPreferredWidth() {
            this._updateLocalPreferredWidthListener();
            this._updateLocalPreferredHeightListener();
        }
        // We'll need to cross-link because we might need to update either the width or height when the other changes
        _onReentrantPreferredHeight() {
            this._updateLocalPreferredWidthListener();
            this._updateLocalPreferredHeightListener();
        }
        // Override the calculation to potentially include the opposite dimension (if we have a rotation of that type)
        _calculateLocalMinimumWidth() {
            if (this.matrix.isAxisAligned()) {
                if (this.matrix.isAligned()) {
                    if (this.minimumWidth !== null) {
                        return Math.abs(this.transform.inverseDeltaX(this.minimumWidth));
                    }
                } else if (this.minimumHeight !== null) {
                    return Math.abs(this.transform.getInverse().m01() * this.minimumHeight);
                }
            }
            return null;
        }
        // Override the calculation to potentially include the opposite dimension (if we have a rotation of that type)
        _calculateLocalMinimumHeight() {
            if (this.matrix.isAxisAligned()) {
                if (this.matrix.isAligned()) {
                    if (this.minimumHeight !== null) {
                        return Math.abs(this.transform.inverseDeltaY(this.minimumHeight));
                    }
                } else if (this.minimumWidth !== null) {
                    return Math.abs(this.transform.getInverse().m10() * this.minimumWidth);
                }
            }
            return null;
        }
        // Override the calculation to potentially include the opposite dimension (if we have a rotation of that type)
        _calculateMinimumWidth() {
            if (this.matrix.isAxisAligned()) {
                if (this.matrix.isAligned()) {
                    if (this.localMinimumWidth !== null) {
                        return Math.abs(this.transform.transformDeltaX(this.localMinimumWidth));
                    }
                } else if (this.localMinimumHeight !== null) {
                    return Math.abs(this.transform.matrix.m01() * this.localMinimumHeight);
                }
            }
            return null;
        }
        // Override the calculation to potentially include the opposite dimension (if we have a rotation of that type)
        _calculateMinimumHeight() {
            if (this.matrix.isAxisAligned()) {
                if (this.matrix.isAligned()) {
                    if (this.localMinimumHeight !== null) {
                        return Math.abs(this.transform.transformDeltaY(this.localMinimumHeight));
                    }
                } else if (this.localMinimumWidth !== null) {
                    return Math.abs(this.transform.matrix.m10() * this.localMinimumWidth);
                }
            }
            return null;
        }
        constructor(...args){
            super(...args);
            // We've added code to conditionally update the preferred/minimum opposite dimensions, so we'll need to
            // cross-link the listeners we've created in WidthSizable/HeightSizable
            this.preferredWidthProperty.lazyLink(this._updateLocalPreferredHeightListener);
            this.preferredHeightProperty.lazyLink(this._updateLocalPreferredWidthListener);
            this.localPreferredWidthProperty.lazyLink(this._updatePreferredHeightListener);
            this.localPreferredHeightProperty.lazyLink(this._updatePreferredWidthListener);
            this.minimumWidthProperty.lazyLink(this._updateLocalMinimumHeightListener);
            this.minimumHeightProperty.lazyLink(this._updateLocalMinimumWidthListener);
            this.localMinimumWidthProperty.lazyLink(this._updateMinimumHeightListener);
            this.localMinimumHeightProperty.lazyLink(this._updateMinimumWidthListener);
        }
    });
    // If we're extending into a Node type, include option keys
    if (SizableTrait.prototype._mutatorKeys) {
        const existingKeys = SizableTrait.prototype._mutatorKeys;
        const newKeys = SIZABLE_SELF_OPTION_KEYS;
        const indexOfBoundsBasedOptions = existingKeys.indexOf(REQUIRES_BOUNDS_OPTION_KEYS[0]);
        SizableTrait.prototype._mutatorKeys = [
            ...existingKeys.slice(0, indexOfBoundsBasedOptions),
            ...newKeys,
            ...existingKeys.slice(indexOfBoundsBasedOptions)
        ];
    }
    return SizableTrait;
});
const isSizable = (node)=>{
    return node.widthSizable && node.heightSizable;
};
const extendsSizable = (node)=>{
    return node.extendsSizable;
};
scenery.register('Sizable', Sizable);
export default Sizable;
export { isSizable, extendsSizable };

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvbGF5b3V0L1NpemFibGUudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjItMjAyNCwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbi8qKlxuICogU2l6YWJsZSBpcyBhIHRyYWl0IHRoYXQgcHJvdmlkZXMgYSBtaW5pbXVtIGFuZCBwcmVmZXJyZWQgd2lkdGgvaGVpZ2h0IChib3RoIFdpZHRoU2l6YWJsZSBhbmQgSGVpZ2h0U2l6YWJsZSxcbiAqIGJ1dCB3aXRoIGFkZGVkIGZlYXR1cmVzIHRoYXQgYWxsb3cgY29udmVuaWVuY2Ugb2Ygd29ya2luZyB3aXRoIGJvdGggZGltZW5zaW9ucyBhdCBvbmNlKS5cbiAqXG4gKiBAYXV0aG9yIEpvbmF0aGFuIE9sc29uIDxqb25hdGhhbi5vbHNvbkBjb2xvcmFkby5lZHU+XG4gKi9cblxuaW1wb3J0IERpbWVuc2lvbjIgZnJvbSAnLi4vLi4vLi4vZG90L2pzL0RpbWVuc2lvbjIuanMnO1xuaW1wb3J0IGFzc2VydE11dHVhbGx5RXhjbHVzaXZlT3B0aW9ucyBmcm9tICcuLi8uLi8uLi9waGV0LWNvcmUvanMvYXNzZXJ0TXV0dWFsbHlFeGNsdXNpdmVPcHRpb25zLmpzJztcbmltcG9ydCBtZW1vaXplIGZyb20gJy4uLy4uLy4uL3BoZXQtY29yZS9qcy9tZW1vaXplLmpzJztcbmltcG9ydCBDb25zdHJ1Y3RvciBmcm9tICcuLi8uLi8uLi9waGV0LWNvcmUvanMvdHlwZXMvQ29uc3RydWN0b3IuanMnO1xuaW1wb3J0IEludGVudGlvbmFsQW55IGZyb20gJy4uLy4uLy4uL3BoZXQtY29yZS9qcy90eXBlcy9JbnRlbnRpb25hbEFueS5qcyc7XG5pbXBvcnQgeyBEZWxheWVkTXV0YXRlLCBIRUlHSFRfU0laQUJMRV9PUFRJT05fS0VZUywgSGVpZ2h0U2l6YWJsZSwgSGVpZ2h0U2l6YWJsZU9wdGlvbnMsIE5vZGUsIFJFUVVJUkVTX0JPVU5EU19PUFRJT05fS0VZUywgc2NlbmVyeSwgV0lEVEhfU0laQUJMRV9PUFRJT05fS0VZUywgV2lkdGhTaXphYmxlLCBXaWR0aFNpemFibGVPcHRpb25zIH0gZnJvbSAnLi4vaW1wb3J0cy5qcyc7XG5pbXBvcnQgeyBUSGVpZ2h0U2l6YWJsZSB9IGZyb20gJy4vSGVpZ2h0U2l6YWJsZS5qcyc7XG5pbXBvcnQgeyBUV2lkdGhTaXphYmxlIH0gZnJvbSAnLi9XaWR0aFNpemFibGUuanMnO1xuXG5leHBvcnQgY29uc3QgU0laQUJMRV9TRUxGX09QVElPTl9LRVlTID0gW1xuICAncHJlZmVycmVkU2l6ZScsXG4gICdtaW5pbXVtU2l6ZScsXG4gICdsb2NhbFByZWZlcnJlZFNpemUnLFxuICAnbG9jYWxNaW5pbXVtU2l6ZScsXG4gICdzaXphYmxlJ1xuXTtcblxuZXhwb3J0IGNvbnN0IFNJWkFCTEVfT1BUSU9OX0tFWVMgPSBbXG4gICdwcmVmZXJyZWRTaXplJyxcbiAgJ21pbmltdW1TaXplJyxcbiAgJ2xvY2FsUHJlZmVycmVkU2l6ZScsXG4gICdsb2NhbE1pbmltdW1TaXplJyxcbiAgJ3NpemFibGUnLFxuICAuLi5XSURUSF9TSVpBQkxFX09QVElPTl9LRVlTLFxuICAuLi5IRUlHSFRfU0laQUJMRV9PUFRJT05fS0VZU1xuXTtcblxudHlwZSBTZWxmT3B0aW9ucyA9IHtcblxuICAvLyBTZXRzIHRoZSBwcmVmZXJyZWQgc2l6ZSBvZiB0aGUgTm9kZSBpbiB0aGUgcGFyZW50IGNvb3JkaW5hdGUgZnJhbWUuIE5vZGVzIHRoYXQgaW1wbGVtZW50IHRoaXMgd2lsbCBhdHRlbXB0IHRvIGtlZXBcbiAgLy8gdGhlaXIgYG5vZGUuc2l6ZWAgYXQgdGhpcyB2YWx1ZS4gSWYgbnVsbCwgdGhlIG5vZGUgd2lsbCBsaWtlbHkgc2V0IGl0cyBjb25maWd1cmF0aW9uIHRvIHRoZSBtaW5pbXVtIHNpemUuXG4gIC8vIE5PVEU6IGNoYW5naW5nIHRoaXMgb3IgbG9jYWxQcmVmZXJyZWRIZWlnaHQgd2lsbCBhZGp1c3QgdGhlIG90aGVyLlxuICAvLyBOT1RFOiBwcmVmZXJyZWRTaXplIGlzIG5vdCBndWFyYW50ZWVkIGN1cnJlbnRseS4gVGhlIGNvbXBvbmVudCBtYXkgZW5kIHVwIGhhdmluZyBhIHNtYWxsZXIgb3IgbGFyZ2VyIHNpemVcbiAgcHJlZmVycmVkU2l6ZT86IERpbWVuc2lvbjIgfCBudWxsO1xuXG4gIC8vIFNldHMgdGhlIG1pbmltdW0gc2l6ZSBvZiB0aGUgTm9kZSBpbiB0aGUgcGFyZW50IGNvb3JkaW5hdGUgZnJhbWUuIFVzdWFsbHkgbm90IGRpcmVjdGx5IHNldCBieSBhIGNsaWVudC5cbiAgLy8gVXN1YWxseSBhIHJlc2l6YWJsZSBOb2RlIHdpbGwgc2V0IGl0cyBsb2NhbE1pbmltdW1TaXplIChhbmQgdGhhdCB3aWxsIGdldCB0cmFuc2ZlcnJlZCB0byB0aGlzIHZhbHVlIGluIHRoZVxuICAvLyBwYXJlbnQgY29vcmRpbmF0ZSBmcmFtZSkuXG4gIC8vIE5PVEU6IGNoYW5naW5nIHRoaXMgb3IgbG9jYWxNaW5pbXVtU2l6ZSB3aWxsIGFkanVzdCB0aGUgb3RoZXIuXG4gIC8vIE5PVEU6IHdoZW4gdGhlIE5vZGUncyB0cmFuc2Zvcm0gaXMgdXBkYXRlZCwgdGhpcyB2YWx1ZSBpcyByZWNvbXB1dGVkIGJhc2VkIG9uIGxvY2FsTWluaW11bVNpemVcbiAgbWluaW11bVNpemU/OiBEaW1lbnNpb24yIHwgbnVsbDtcblxuICAvLyBTZXRzIHRoZSBwcmVmZXJyZWQgc2l6ZSBvZiB0aGUgTm9kZSBpbiB0aGUgbG9jYWwgY29vcmRpbmF0ZSBmcmFtZS5cbiAgLy8gTk9URTogY2hhbmdpbmcgdGhpcyBvciBwcmVmZXJyZWRTaXplIHdpbGwgYWRqdXN0IHRoZSBvdGhlci5cbiAgLy8gTk9URTogd2hlbiB0aGUgTm9kZSdzIHRyYW5zZm9ybSBpcyB1cGRhdGVkLCB0aGlzIHZhbHVlIGlzIHJlY29tcHV0ZWQgYmFzZWQgb24gcHJlZmVycmVkU2l6ZVxuICBsb2NhbFByZWZlcnJlZFNpemU/OiBEaW1lbnNpb24yIHwgbnVsbDtcblxuICAvLyBTZXRzIHRoZSBtaW5pbXVtIHNpemUgb2YgdGhlIE5vZGUgaW4gdGhlIGxvY2FsIGNvb3JkaW5hdGUgZnJhbWUuIFVzdWFsbHkgc2V0IGJ5IHRoZSByZXNpemFibGUgTm9kZSBpdHNlbGYgdG9cbiAgLy8gaW5kaWNhdGUgd2hhdCBwcmVmZXJyZWQgc2l6ZXMgYXJlIHBvc3NpYmxlLlxuICAvLyBOT1RFOiBjaGFuZ2luZyB0aGlzIG9yIG1pbmltdW1TaXplIHdpbGwgYWRqdXN0IHRoZSBvdGhlci5cbiAgbG9jYWxNaW5pbXVtU2l6ZT86IERpbWVuc2lvbjIgfCBudWxsO1xuXG4gIC8vIFdoZXRoZXIgdGhpcyBjb21wb25lbnQgd2lsbCBoYXZlIGl0cyBwcmVmZXJyZWQgc2l6ZSBzZXQgYnkgdGhpbmdzIGxpa2UgbGF5b3V0IGNvbnRhaW5lcnMuIElmIHRoaXMgaXMgc2V0IHRvIGZhbHNlLFxuICAvLyBpdCdzIHJlY29tbWVuZGVkIHRvIHNldCBzb21lIHNvcnQgb2YgcHJlZmVycmVkIHNpemUgKHNvIHRoYXQgaXQgd29uJ3QgZ28gdG8gMClcbiAgc2l6YWJsZT86IGJvb2xlYW47XG59O1xudHlwZSBQYXJlbnRPcHRpb25zID0gV2lkdGhTaXphYmxlT3B0aW9ucyAmIEhlaWdodFNpemFibGVPcHRpb25zO1xuZXhwb3J0IHR5cGUgU2l6YWJsZU9wdGlvbnMgPSBTZWxmT3B0aW9ucyAmIFBhcmVudE9wdGlvbnM7XG5cbnR5cGUgVFNpemFibGUgPSBUV2lkdGhTaXphYmxlICYgVEhlaWdodFNpemFibGUgJiB7XG4gIHZhbGlkYXRlTG9jYWxQcmVmZXJyZWRTaXplKCk6IHZvaWQ7XG59O1xuXG5jb25zdCBTaXphYmxlID0gbWVtb2l6ZSggPFN1cGVyVHlwZSBleHRlbmRzIENvbnN0cnVjdG9yPE5vZGU+PiggVHlwZTogU3VwZXJUeXBlICk6IFN1cGVyVHlwZSAmIENvbnN0cnVjdG9yPFRTaXphYmxlPiA9PiB7XG4gIGNvbnN0IFNpemFibGVUcmFpdCA9IERlbGF5ZWRNdXRhdGUoICdTaXphYmxlJywgU0laQUJMRV9TRUxGX09QVElPTl9LRVlTLFxuICAgIGNsYXNzIFNpemFibGVUcmFpdCBleHRlbmRzIFdpZHRoU2l6YWJsZSggSGVpZ2h0U2l6YWJsZSggVHlwZSApICkgaW1wbGVtZW50cyBUU2l6YWJsZSB7XG5cbiAgICAgIHB1YmxpYyBjb25zdHJ1Y3RvciggLi4uYXJnczogSW50ZW50aW9uYWxBbnlbXSApIHtcbiAgICAgICAgc3VwZXIoIC4uLmFyZ3MgKTtcblxuICAgICAgICAvLyBXZSd2ZSBhZGRlZCBjb2RlIHRvIGNvbmRpdGlvbmFsbHkgdXBkYXRlIHRoZSBwcmVmZXJyZWQvbWluaW11bSBvcHBvc2l0ZSBkaW1lbnNpb25zLCBzbyB3ZSdsbCBuZWVkIHRvXG4gICAgICAgIC8vIGNyb3NzLWxpbmsgdGhlIGxpc3RlbmVycyB3ZSd2ZSBjcmVhdGVkIGluIFdpZHRoU2l6YWJsZS9IZWlnaHRTaXphYmxlXG5cbiAgICAgICAgdGhpcy5wcmVmZXJyZWRXaWR0aFByb3BlcnR5LmxhenlMaW5rKCB0aGlzLl91cGRhdGVMb2NhbFByZWZlcnJlZEhlaWdodExpc3RlbmVyICk7XG4gICAgICAgIHRoaXMucHJlZmVycmVkSGVpZ2h0UHJvcGVydHkubGF6eUxpbmsoIHRoaXMuX3VwZGF0ZUxvY2FsUHJlZmVycmVkV2lkdGhMaXN0ZW5lciApO1xuXG4gICAgICAgIHRoaXMubG9jYWxQcmVmZXJyZWRXaWR0aFByb3BlcnR5LmxhenlMaW5rKCB0aGlzLl91cGRhdGVQcmVmZXJyZWRIZWlnaHRMaXN0ZW5lciApO1xuICAgICAgICB0aGlzLmxvY2FsUHJlZmVycmVkSGVpZ2h0UHJvcGVydHkubGF6eUxpbmsoIHRoaXMuX3VwZGF0ZVByZWZlcnJlZFdpZHRoTGlzdGVuZXIgKTtcblxuICAgICAgICB0aGlzLm1pbmltdW1XaWR0aFByb3BlcnR5LmxhenlMaW5rKCB0aGlzLl91cGRhdGVMb2NhbE1pbmltdW1IZWlnaHRMaXN0ZW5lciApO1xuICAgICAgICB0aGlzLm1pbmltdW1IZWlnaHRQcm9wZXJ0eS5sYXp5TGluayggdGhpcy5fdXBkYXRlTG9jYWxNaW5pbXVtV2lkdGhMaXN0ZW5lciApO1xuXG4gICAgICAgIHRoaXMubG9jYWxNaW5pbXVtV2lkdGhQcm9wZXJ0eS5sYXp5TGluayggdGhpcy5fdXBkYXRlTWluaW11bUhlaWdodExpc3RlbmVyICk7XG4gICAgICAgIHRoaXMubG9jYWxNaW5pbXVtSGVpZ2h0UHJvcGVydHkubGF6eUxpbmsoIHRoaXMuX3VwZGF0ZU1pbmltdW1XaWR0aExpc3RlbmVyICk7XG4gICAgICB9XG5cbiAgICAgIHB1YmxpYyBnZXQgcHJlZmVycmVkU2l6ZSgpOiBEaW1lbnNpb24yIHwgbnVsbCB7XG4gICAgICAgIGFzc2VydCAmJiBhc3NlcnQoICggdGhpcy5wcmVmZXJyZWRXaWR0aCA9PT0gbnVsbCApID09PSAoIHRoaXMucHJlZmVycmVkSGVpZ2h0ID09PSBudWxsICksXG4gICAgICAgICAgJ0Nhbm5vdCBnZXQgYSBwcmVmZXJyZWRTaXplIHdoZW4gb25lIG9mIHByZWZlcnJlZFdpZHRoL3ByZWZlcnJlZEhlaWdodCBpcyBudWxsJyApO1xuXG4gICAgICAgIGlmICggdGhpcy5wcmVmZXJyZWRXaWR0aCA9PT0gbnVsbCB8fCB0aGlzLnByZWZlcnJlZEhlaWdodCA9PT0gbnVsbCApIHtcbiAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICByZXR1cm4gbmV3IERpbWVuc2lvbjIoIHRoaXMucHJlZmVycmVkV2lkdGgsIHRoaXMucHJlZmVycmVkSGVpZ2h0ICk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgcHVibGljIHNldCBwcmVmZXJyZWRTaXplKCB2YWx1ZTogRGltZW5zaW9uMiB8IG51bGwgKSB7XG4gICAgICAgIHRoaXMucHJlZmVycmVkV2lkdGggPSB2YWx1ZSA9PT0gbnVsbCA/IG51bGwgOiB2YWx1ZS53aWR0aDtcbiAgICAgICAgdGhpcy5wcmVmZXJyZWRIZWlnaHQgPSB2YWx1ZSA9PT0gbnVsbCA/IG51bGwgOiB2YWx1ZS5oZWlnaHQ7XG4gICAgICB9XG5cbiAgICAgIHB1YmxpYyBnZXQgbG9jYWxQcmVmZXJyZWRTaXplKCk6IERpbWVuc2lvbjIgfCBudWxsIHtcbiAgICAgICAgYXNzZXJ0ICYmIGFzc2VydCggKCB0aGlzLmxvY2FsUHJlZmVycmVkV2lkdGggPT09IG51bGwgKSA9PT0gKCB0aGlzLmxvY2FsUHJlZmVycmVkSGVpZ2h0ID09PSBudWxsICksXG4gICAgICAgICAgJ0Nhbm5vdCBnZXQgYSBwcmVmZXJyZWRTaXplIHdoZW4gb25lIG9mIHByZWZlcnJlZFdpZHRoL3ByZWZlcnJlZEhlaWdodCBpcyBudWxsJyApO1xuXG4gICAgICAgIGlmICggdGhpcy5sb2NhbFByZWZlcnJlZFdpZHRoID09PSBudWxsIHx8IHRoaXMubG9jYWxQcmVmZXJyZWRIZWlnaHQgPT09IG51bGwgKSB7XG4gICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIG5ldyBEaW1lbnNpb24yKCB0aGlzLmxvY2FsUHJlZmVycmVkV2lkdGgsIHRoaXMubG9jYWxQcmVmZXJyZWRIZWlnaHQgKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBwdWJsaWMgc2V0IGxvY2FsUHJlZmVycmVkU2l6ZSggdmFsdWU6IERpbWVuc2lvbjIgfCBudWxsICkge1xuICAgICAgICB0aGlzLmxvY2FsUHJlZmVycmVkV2lkdGggPSB2YWx1ZSA9PT0gbnVsbCA/IG51bGwgOiB2YWx1ZS53aWR0aDtcbiAgICAgICAgdGhpcy5sb2NhbFByZWZlcnJlZEhlaWdodCA9IHZhbHVlID09PSBudWxsID8gbnVsbCA6IHZhbHVlLmhlaWdodDtcbiAgICAgIH1cblxuICAgICAgcHVibGljIGdldCBtaW5pbXVtU2l6ZSgpOiBEaW1lbnNpb24yIHwgbnVsbCB7XG4gICAgICAgIGFzc2VydCAmJiBhc3NlcnQoICggdGhpcy5taW5pbXVtV2lkdGggPT09IG51bGwgKSA9PT0gKCB0aGlzLm1pbmltdW1IZWlnaHQgPT09IG51bGwgKSxcbiAgICAgICAgICAnQ2Fubm90IGdldCBhIG1pbmltdW1TaXplIHdoZW4gb25lIG9mIG1pbmltdW1XaWR0aC9taW5pbXVtSGVpZ2h0IGlzIG51bGwnICk7XG5cbiAgICAgICAgaWYgKCB0aGlzLm1pbmltdW1XaWR0aCA9PT0gbnVsbCB8fCB0aGlzLm1pbmltdW1IZWlnaHQgPT09IG51bGwgKSB7XG4gICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIG5ldyBEaW1lbnNpb24yKCB0aGlzLm1pbmltdW1XaWR0aCwgdGhpcy5taW5pbXVtSGVpZ2h0ICk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgcHVibGljIHNldCBtaW5pbXVtU2l6ZSggdmFsdWU6IERpbWVuc2lvbjIgfCBudWxsICkge1xuICAgICAgICB0aGlzLm1pbmltdW1XaWR0aCA9IHZhbHVlID09PSBudWxsID8gbnVsbCA6IHZhbHVlLndpZHRoO1xuICAgICAgICB0aGlzLm1pbmltdW1IZWlnaHQgPSB2YWx1ZSA9PT0gbnVsbCA/IG51bGwgOiB2YWx1ZS5oZWlnaHQ7XG4gICAgICB9XG5cbiAgICAgIHB1YmxpYyBnZXQgbG9jYWxNaW5pbXVtU2l6ZSgpOiBEaW1lbnNpb24yIHwgbnVsbCB7XG4gICAgICAgIGFzc2VydCAmJiBhc3NlcnQoICggdGhpcy5sb2NhbE1pbmltdW1XaWR0aCA9PT0gbnVsbCApID09PSAoIHRoaXMubG9jYWxNaW5pbXVtSGVpZ2h0ID09PSBudWxsICksXG4gICAgICAgICAgJ0Nhbm5vdCBnZXQgYSBtaW5pbXVtU2l6ZSB3aGVuIG9uZSBvZiBtaW5pbXVtV2lkdGgvbWluaW11bUhlaWdodCBpcyBudWxsJyApO1xuXG4gICAgICAgIGlmICggdGhpcy5sb2NhbE1pbmltdW1XaWR0aCA9PT0gbnVsbCB8fCB0aGlzLmxvY2FsTWluaW11bUhlaWdodCA9PT0gbnVsbCApIHtcbiAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICByZXR1cm4gbmV3IERpbWVuc2lvbjIoIHRoaXMubG9jYWxNaW5pbXVtV2lkdGgsIHRoaXMubG9jYWxNaW5pbXVtSGVpZ2h0ICk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgcHVibGljIHNldCBsb2NhbE1pbmltdW1TaXplKCB2YWx1ZTogRGltZW5zaW9uMiB8IG51bGwgKSB7XG4gICAgICAgIHRoaXMubG9jYWxNaW5pbXVtV2lkdGggPSB2YWx1ZSA9PT0gbnVsbCA/IG51bGwgOiB2YWx1ZS53aWR0aDtcbiAgICAgICAgdGhpcy5sb2NhbE1pbmltdW1IZWlnaHQgPSB2YWx1ZSA9PT0gbnVsbCA/IG51bGwgOiB2YWx1ZS5oZWlnaHQ7XG4gICAgICB9XG5cbiAgICAgIHB1YmxpYyBnZXQgc2l6YWJsZSgpOiBib29sZWFuIHtcbiAgICAgICAgYXNzZXJ0ICYmIGFzc2VydCggdGhpcy53aWR0aFNpemFibGUgPT09IHRoaXMuaGVpZ2h0U2l6YWJsZSxcbiAgICAgICAgICAnd2lkdGhTaXphYmxlIGFuZCBoZWlnaHRTaXphYmxlIG5vdCB0aGUgc2FtZSwgd2hpY2ggaXMgcmVxdWlyZWQgZm9yIHRoZSBzaXphYmxlIGdldHRlcicgKTtcbiAgICAgICAgcmV0dXJuIHRoaXMud2lkdGhTaXphYmxlO1xuICAgICAgfVxuXG4gICAgICBwdWJsaWMgc2V0IHNpemFibGUoIHZhbHVlOiBib29sZWFuICkge1xuICAgICAgICB0aGlzLndpZHRoU2l6YWJsZSA9IHZhbHVlO1xuICAgICAgICB0aGlzLmhlaWdodFNpemFibGUgPSB2YWx1ZTtcbiAgICAgIH1cblxuICAgICAgcHVibGljIG92ZXJyaWRlIGdldCBleHRlbmRzU2l6YWJsZSgpOiBib29sZWFuIHsgcmV0dXJuIHRydWU7IH1cblxuICAgICAgcHVibGljIHZhbGlkYXRlTG9jYWxQcmVmZXJyZWRTaXplKCk6IHZvaWQge1xuICAgICAgICBpZiAoIGFzc2VydCApIHtcbiAgICAgICAgICB0aGlzLnZhbGlkYXRlTG9jYWxQcmVmZXJyZWRXaWR0aCgpO1xuICAgICAgICAgIHRoaXMudmFsaWRhdGVMb2NhbFByZWZlcnJlZEhlaWdodCgpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHB1YmxpYyBvdmVycmlkZSBtdXRhdGUoIG9wdGlvbnM/OiBTZWxmT3B0aW9ucyAmIFBhcmFtZXRlcnM8SW5zdGFuY2VUeXBlPFN1cGVyVHlwZT5bICdtdXRhdGUnIF0+WyAwIF0gKTogdGhpcyB7XG5cbiAgICAgICAgYXNzZXJ0TXV0dWFsbHlFeGNsdXNpdmVPcHRpb25zKCBvcHRpb25zLCBbICdwcmVmZXJyZWRTaXplJyBdLCBbICdwcmVmZXJyZWRXaWR0aCcsICdwcmVmZXJyZWRIZWlnaHQnIF0gKTtcbiAgICAgICAgYXNzZXJ0TXV0dWFsbHlFeGNsdXNpdmVPcHRpb25zKCBvcHRpb25zLCBbICdsb2NhbFByZWZlcnJlZFNpemUnIF0sIFsgJ2xvY2FsUHJlZmVycmVkV2lkdGgnLCAnbG9jYWxQcmVmZXJyZWRIZWlnaHQnIF0gKTtcbiAgICAgICAgYXNzZXJ0TXV0dWFsbHlFeGNsdXNpdmVPcHRpb25zKCBvcHRpb25zLCBbICdtaW5pbXVtU2l6ZScgXSwgWyAnbWluaW11bVdpZHRoJywgJ21pbmltdW1IZWlnaHQnIF0gKTtcbiAgICAgICAgYXNzZXJ0TXV0dWFsbHlFeGNsdXNpdmVPcHRpb25zKCBvcHRpb25zLCBbICdsb2NhbE1pbmltdW1TaXplJyBdLCBbICdsb2NhbE1pbmltdW1XaWR0aCcsICdsb2NhbE1pbmltdW1IZWlnaHQnIF0gKTtcbiAgICAgICAgYXNzZXJ0TXV0dWFsbHlFeGNsdXNpdmVPcHRpb25zKCBvcHRpb25zLCBbICdzaXphYmxlJyBdLCBbICd3aWR0aFNpemFibGUnLCAnaGVpZ2h0U2l6YWJsZScgXSApO1xuXG4gICAgICAgIHJldHVybiBzdXBlci5tdXRhdGUoIG9wdGlvbnMgKTtcbiAgICAgIH1cblxuICAgICAgLy8gT3ZlcnJpZGUgdGhlIGNhbGN1bGF0aW9uIHRvIHBvdGVudGlhbGx5IGluY2x1ZGUgdGhlIG9wcG9zaXRlIGRpbWVuc2lvbiAoaWYgd2UgaGF2ZSBhIHJvdGF0aW9uIG9mIHRoYXQgdHlwZSlcbiAgICAgIHB1YmxpYyBvdmVycmlkZSBfY2FsY3VsYXRlTG9jYWxQcmVmZXJyZWRXaWR0aCgpOiBudW1iZXIgfCBudWxsIHtcbiAgICAgICAgaWYgKCB0aGlzLm1hdHJpeC5pc0F4aXNBbGlnbmVkKCkgKSB7XG4gICAgICAgICAgaWYgKCB0aGlzLm1hdHJpeC5pc0FsaWduZWQoKSApIHtcbiAgICAgICAgICAgIGlmICggdGhpcy5wcmVmZXJyZWRXaWR0aCAhPT0gbnVsbCApIHtcbiAgICAgICAgICAgICAgcmV0dXJuIE1hdGguYWJzKCB0aGlzLnRyYW5zZm9ybS5pbnZlcnNlRGVsdGFYKCB0aGlzLnByZWZlcnJlZFdpZHRoICkgKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgLy8gSWYgd2UncmUgaGVpZ2h0LXNpemFibGUgYW5kIHdlIGhhdmUgYW4gb3JpZW50YXRpb24gc3dhcCwgc2V0IHRoZSBjb3JyZWN0IHByZWZlcnJlZCB3aWR0aCFcbiAgICAgICAgICBlbHNlIGlmICggdGhpcy5wcmVmZXJyZWRIZWlnaHQgIT09IG51bGwgKSB7XG4gICAgICAgICAgICByZXR1cm4gTWF0aC5hYnMoIHRoaXMudHJhbnNmb3JtLmdldEludmVyc2UoKS5tMDEoKSAqIHRoaXMucHJlZmVycmVkSGVpZ2h0ICk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICB9XG5cbiAgICAgIC8vIE92ZXJyaWRlIHRoZSBjYWxjdWxhdGlvbiB0byBwb3RlbnRpYWxseSBpbmNsdWRlIHRoZSBvcHBvc2l0ZSBkaW1lbnNpb24gKGlmIHdlIGhhdmUgYSByb3RhdGlvbiBvZiB0aGF0IHR5cGUpXG4gICAgICBwdWJsaWMgb3ZlcnJpZGUgX2NhbGN1bGF0ZUxvY2FsUHJlZmVycmVkSGVpZ2h0KCk6IG51bWJlciB8IG51bGwge1xuICAgICAgICBpZiAoIHRoaXMubWF0cml4LmlzQXhpc0FsaWduZWQoKSApIHtcbiAgICAgICAgICBpZiAoIHRoaXMubWF0cml4LmlzQWxpZ25lZCgpICkge1xuICAgICAgICAgICAgaWYgKCB0aGlzLnByZWZlcnJlZEhlaWdodCAhPT0gbnVsbCApIHtcbiAgICAgICAgICAgICAgcmV0dXJuIE1hdGguYWJzKCB0aGlzLnRyYW5zZm9ybS5pbnZlcnNlRGVsdGFZKCB0aGlzLnByZWZlcnJlZEhlaWdodCApICk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIC8vIElmIHdlJ3JlIHdpZHRoLXNpemFibGUgYW5kIHdlIGhhdmUgYW4gb3JpZW50YXRpb24gc3dhcCwgc2V0IHRoZSBjb3JyZWN0IHByZWZlcnJlZCBoZWlnaHQhXG4gICAgICAgICAgZWxzZSBpZiAoIHRoaXMucHJlZmVycmVkV2lkdGggIT09IG51bGwgKSB7XG4gICAgICAgICAgICByZXR1cm4gTWF0aC5hYnMoIHRoaXMudHJhbnNmb3JtLmdldEludmVyc2UoKS5tMTAoKSAqIHRoaXMucHJlZmVycmVkV2lkdGggKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgIH1cblxuICAgICAgLy8gT3ZlcnJpZGUgdGhlIGNhbGN1bGF0aW9uIHRvIHBvdGVudGlhbGx5IGluY2x1ZGUgdGhlIG9wcG9zaXRlIGRpbWVuc2lvbiAoaWYgd2UgaGF2ZSBhIHJvdGF0aW9uIG9mIHRoYXQgdHlwZSlcbiAgICAgIHB1YmxpYyBvdmVycmlkZSBfY2FsY3VsYXRlUHJlZmVycmVkV2lkdGgoKTogbnVtYmVyIHwgbnVsbCB7XG4gICAgICAgIGlmICggdGhpcy5tYXRyaXguaXNBeGlzQWxpZ25lZCgpICkge1xuICAgICAgICAgIGlmICggdGhpcy5tYXRyaXguaXNBbGlnbmVkKCkgKSB7XG4gICAgICAgICAgICBpZiAoIHRoaXMubG9jYWxQcmVmZXJyZWRXaWR0aCAhPT0gbnVsbCApIHtcbiAgICAgICAgICAgICAgcmV0dXJuIE1hdGguYWJzKCB0aGlzLnRyYW5zZm9ybS50cmFuc2Zvcm1EZWx0YVgoIHRoaXMubG9jYWxQcmVmZXJyZWRXaWR0aCApICk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIGVsc2UgaWYgKCB0aGlzLmxvY2FsUHJlZmVycmVkSGVpZ2h0ICE9PSBudWxsICkge1xuICAgICAgICAgICAgcmV0dXJuIE1hdGguYWJzKCB0aGlzLnRyYW5zZm9ybS5tYXRyaXgubTAxKCkgKiB0aGlzLmxvY2FsUHJlZmVycmVkSGVpZ2h0ICk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICB9XG5cbiAgICAgIC8vIE92ZXJyaWRlIHRoZSBjYWxjdWxhdGlvbiB0byBwb3RlbnRpYWxseSBpbmNsdWRlIHRoZSBvcHBvc2l0ZSBkaW1lbnNpb24gKGlmIHdlIGhhdmUgYSByb3RhdGlvbiBvZiB0aGF0IHR5cGUpXG4gICAgICBwdWJsaWMgb3ZlcnJpZGUgX2NhbGN1bGF0ZVByZWZlcnJlZEhlaWdodCgpOiBudW1iZXIgfCBudWxsIHtcbiAgICAgICAgaWYgKCB0aGlzLm1hdHJpeC5pc0F4aXNBbGlnbmVkKCkgKSB7XG4gICAgICAgICAgaWYgKCB0aGlzLm1hdHJpeC5pc0FsaWduZWQoKSApIHtcbiAgICAgICAgICAgIGlmICggdGhpcy5sb2NhbFByZWZlcnJlZEhlaWdodCAhPT0gbnVsbCApIHtcbiAgICAgICAgICAgICAgcmV0dXJuIE1hdGguYWJzKCB0aGlzLnRyYW5zZm9ybS50cmFuc2Zvcm1EZWx0YVkoIHRoaXMubG9jYWxQcmVmZXJyZWRIZWlnaHQgKSApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgICBlbHNlIGlmICggdGhpcy5sb2NhbFByZWZlcnJlZFdpZHRoICE9PSBudWxsICkge1xuICAgICAgICAgICAgcmV0dXJuIE1hdGguYWJzKCB0aGlzLnRyYW5zZm9ybS5tYXRyaXgubTEwKCkgKiB0aGlzLmxvY2FsUHJlZmVycmVkV2lkdGggKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgIH1cblxuICAgICAgLy8gV2UnbGwgbmVlZCB0byBjcm9zcy1saW5rIGJlY2F1c2Ugd2UgbWlnaHQgbmVlZCB0byB1cGRhdGUgZWl0aGVyIHRoZSB3aWR0aCBvciBoZWlnaHQgd2hlbiB0aGUgb3RoZXIgY2hhbmdlc1xuICAgICAgcHVibGljIG92ZXJyaWRlIF9vblJlZW50cmFudExvY2FsTWluaW11bVdpZHRoKCk6IHZvaWQge1xuICAgICAgICB0aGlzLl91cGRhdGVNaW5pbXVtV2lkdGhMaXN0ZW5lcigpO1xuICAgICAgICB0aGlzLl91cGRhdGVNaW5pbXVtSGVpZ2h0TGlzdGVuZXIoKTtcbiAgICAgIH1cblxuICAgICAgLy8gV2UnbGwgbmVlZCB0byBjcm9zcy1saW5rIGJlY2F1c2Ugd2UgbWlnaHQgbmVlZCB0byB1cGRhdGUgZWl0aGVyIHRoZSB3aWR0aCBvciBoZWlnaHQgd2hlbiB0aGUgb3RoZXIgY2hhbmdlc1xuICAgICAgcHVibGljIG92ZXJyaWRlIF9vblJlZW50cmFudExvY2FsTWluaW11bUhlaWdodCgpOiB2b2lkIHtcbiAgICAgICAgdGhpcy5fdXBkYXRlTWluaW11bVdpZHRoTGlzdGVuZXIoKTtcbiAgICAgICAgdGhpcy5fdXBkYXRlTWluaW11bUhlaWdodExpc3RlbmVyKCk7XG4gICAgICB9XG5cbiAgICAgIC8vIFdlJ2xsIG5lZWQgdG8gY3Jvc3MtbGluayBiZWNhdXNlIHdlIG1pZ2h0IG5lZWQgdG8gdXBkYXRlIGVpdGhlciB0aGUgd2lkdGggb3IgaGVpZ2h0IHdoZW4gdGhlIG90aGVyIGNoYW5nZXNcbiAgICAgIHB1YmxpYyBvdmVycmlkZSBfb25SZWVudHJhbnRQcmVmZXJyZWRXaWR0aCgpOiB2b2lkIHtcbiAgICAgICAgdGhpcy5fdXBkYXRlTG9jYWxQcmVmZXJyZWRXaWR0aExpc3RlbmVyKCk7XG4gICAgICAgIHRoaXMuX3VwZGF0ZUxvY2FsUHJlZmVycmVkSGVpZ2h0TGlzdGVuZXIoKTtcbiAgICAgIH1cblxuICAgICAgLy8gV2UnbGwgbmVlZCB0byBjcm9zcy1saW5rIGJlY2F1c2Ugd2UgbWlnaHQgbmVlZCB0byB1cGRhdGUgZWl0aGVyIHRoZSB3aWR0aCBvciBoZWlnaHQgd2hlbiB0aGUgb3RoZXIgY2hhbmdlc1xuICAgICAgcHVibGljIG92ZXJyaWRlIF9vblJlZW50cmFudFByZWZlcnJlZEhlaWdodCgpOiB2b2lkIHtcbiAgICAgICAgdGhpcy5fdXBkYXRlTG9jYWxQcmVmZXJyZWRXaWR0aExpc3RlbmVyKCk7XG4gICAgICAgIHRoaXMuX3VwZGF0ZUxvY2FsUHJlZmVycmVkSGVpZ2h0TGlzdGVuZXIoKTtcbiAgICAgIH1cblxuICAgICAgLy8gT3ZlcnJpZGUgdGhlIGNhbGN1bGF0aW9uIHRvIHBvdGVudGlhbGx5IGluY2x1ZGUgdGhlIG9wcG9zaXRlIGRpbWVuc2lvbiAoaWYgd2UgaGF2ZSBhIHJvdGF0aW9uIG9mIHRoYXQgdHlwZSlcbiAgICAgIHB1YmxpYyBvdmVycmlkZSBfY2FsY3VsYXRlTG9jYWxNaW5pbXVtV2lkdGgoKTogbnVtYmVyIHwgbnVsbCB7XG4gICAgICAgIGlmICggdGhpcy5tYXRyaXguaXNBeGlzQWxpZ25lZCgpICkge1xuICAgICAgICAgIGlmICggdGhpcy5tYXRyaXguaXNBbGlnbmVkKCkgKSB7XG4gICAgICAgICAgICBpZiAoIHRoaXMubWluaW11bVdpZHRoICE9PSBudWxsICkge1xuICAgICAgICAgICAgICByZXR1cm4gTWF0aC5hYnMoIHRoaXMudHJhbnNmb3JtLmludmVyc2VEZWx0YVgoIHRoaXMubWluaW11bVdpZHRoICkgKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgZWxzZSBpZiAoIHRoaXMubWluaW11bUhlaWdodCAhPT0gbnVsbCApIHtcbiAgICAgICAgICAgIHJldHVybiBNYXRoLmFicyggdGhpcy50cmFuc2Zvcm0uZ2V0SW52ZXJzZSgpLm0wMSgpICogdGhpcy5taW5pbXVtSGVpZ2h0ICk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICB9XG5cbiAgICAgIC8vIE92ZXJyaWRlIHRoZSBjYWxjdWxhdGlvbiB0byBwb3RlbnRpYWxseSBpbmNsdWRlIHRoZSBvcHBvc2l0ZSBkaW1lbnNpb24gKGlmIHdlIGhhdmUgYSByb3RhdGlvbiBvZiB0aGF0IHR5cGUpXG4gICAgICBwdWJsaWMgb3ZlcnJpZGUgX2NhbGN1bGF0ZUxvY2FsTWluaW11bUhlaWdodCgpOiBudW1iZXIgfCBudWxsIHtcbiAgICAgICAgaWYgKCB0aGlzLm1hdHJpeC5pc0F4aXNBbGlnbmVkKCkgKSB7XG4gICAgICAgICAgaWYgKCB0aGlzLm1hdHJpeC5pc0FsaWduZWQoKSApIHtcbiAgICAgICAgICAgIGlmICggdGhpcy5taW5pbXVtSGVpZ2h0ICE9PSBudWxsICkge1xuICAgICAgICAgICAgICByZXR1cm4gTWF0aC5hYnMoIHRoaXMudHJhbnNmb3JtLmludmVyc2VEZWx0YVkoIHRoaXMubWluaW11bUhlaWdodCApICk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIGVsc2UgaWYgKCB0aGlzLm1pbmltdW1XaWR0aCAhPT0gbnVsbCApIHtcbiAgICAgICAgICAgIHJldHVybiBNYXRoLmFicyggdGhpcy50cmFuc2Zvcm0uZ2V0SW52ZXJzZSgpLm0xMCgpICogdGhpcy5taW5pbXVtV2lkdGggKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgIH1cblxuICAgICAgLy8gT3ZlcnJpZGUgdGhlIGNhbGN1bGF0aW9uIHRvIHBvdGVudGlhbGx5IGluY2x1ZGUgdGhlIG9wcG9zaXRlIGRpbWVuc2lvbiAoaWYgd2UgaGF2ZSBhIHJvdGF0aW9uIG9mIHRoYXQgdHlwZSlcbiAgICAgIHB1YmxpYyBvdmVycmlkZSBfY2FsY3VsYXRlTWluaW11bVdpZHRoKCk6IG51bWJlciB8IG51bGwge1xuICAgICAgICBpZiAoIHRoaXMubWF0cml4LmlzQXhpc0FsaWduZWQoKSApIHtcbiAgICAgICAgICBpZiAoIHRoaXMubWF0cml4LmlzQWxpZ25lZCgpICkge1xuICAgICAgICAgICAgaWYgKCB0aGlzLmxvY2FsTWluaW11bVdpZHRoICE9PSBudWxsICkge1xuICAgICAgICAgICAgICByZXR1cm4gTWF0aC5hYnMoIHRoaXMudHJhbnNmb3JtLnRyYW5zZm9ybURlbHRhWCggdGhpcy5sb2NhbE1pbmltdW1XaWR0aCApICk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIGVsc2UgaWYgKCB0aGlzLmxvY2FsTWluaW11bUhlaWdodCAhPT0gbnVsbCApIHtcbiAgICAgICAgICAgIHJldHVybiBNYXRoLmFicyggdGhpcy50cmFuc2Zvcm0ubWF0cml4Lm0wMSgpICogdGhpcy5sb2NhbE1pbmltdW1IZWlnaHQgKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgIH1cblxuICAgICAgLy8gT3ZlcnJpZGUgdGhlIGNhbGN1bGF0aW9uIHRvIHBvdGVudGlhbGx5IGluY2x1ZGUgdGhlIG9wcG9zaXRlIGRpbWVuc2lvbiAoaWYgd2UgaGF2ZSBhIHJvdGF0aW9uIG9mIHRoYXQgdHlwZSlcbiAgICAgIHB1YmxpYyBvdmVycmlkZSBfY2FsY3VsYXRlTWluaW11bUhlaWdodCgpOiBudW1iZXIgfCBudWxsIHtcbiAgICAgICAgaWYgKCB0aGlzLm1hdHJpeC5pc0F4aXNBbGlnbmVkKCkgKSB7XG4gICAgICAgICAgaWYgKCB0aGlzLm1hdHJpeC5pc0FsaWduZWQoKSApIHtcbiAgICAgICAgICAgIGlmICggdGhpcy5sb2NhbE1pbmltdW1IZWlnaHQgIT09IG51bGwgKSB7XG4gICAgICAgICAgICAgIHJldHVybiBNYXRoLmFicyggdGhpcy50cmFuc2Zvcm0udHJhbnNmb3JtRGVsdGFZKCB0aGlzLmxvY2FsTWluaW11bUhlaWdodCApICk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIGVsc2UgaWYgKCB0aGlzLmxvY2FsTWluaW11bVdpZHRoICE9PSBudWxsICkge1xuICAgICAgICAgICAgcmV0dXJuIE1hdGguYWJzKCB0aGlzLnRyYW5zZm9ybS5tYXRyaXgubTEwKCkgKiB0aGlzLmxvY2FsTWluaW11bVdpZHRoICk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICB9XG4gICAgfSApO1xuXG4gIC8vIElmIHdlJ3JlIGV4dGVuZGluZyBpbnRvIGEgTm9kZSB0eXBlLCBpbmNsdWRlIG9wdGlvbiBrZXlzXG4gIGlmICggU2l6YWJsZVRyYWl0LnByb3RvdHlwZS5fbXV0YXRvcktleXMgKSB7XG4gICAgY29uc3QgZXhpc3RpbmdLZXlzID0gU2l6YWJsZVRyYWl0LnByb3RvdHlwZS5fbXV0YXRvcktleXM7XG4gICAgY29uc3QgbmV3S2V5cyA9IFNJWkFCTEVfU0VMRl9PUFRJT05fS0VZUztcbiAgICBjb25zdCBpbmRleE9mQm91bmRzQmFzZWRPcHRpb25zID0gZXhpc3RpbmdLZXlzLmluZGV4T2YoIFJFUVVJUkVTX0JPVU5EU19PUFRJT05fS0VZU1sgMCBdICk7XG4gICAgU2l6YWJsZVRyYWl0LnByb3RvdHlwZS5fbXV0YXRvcktleXMgPSBbXG4gICAgICAuLi5leGlzdGluZ0tleXMuc2xpY2UoIDAsIGluZGV4T2ZCb3VuZHNCYXNlZE9wdGlvbnMgKSxcbiAgICAgIC4uLm5ld0tleXMsXG4gICAgICAuLi5leGlzdGluZ0tleXMuc2xpY2UoIGluZGV4T2ZCb3VuZHNCYXNlZE9wdGlvbnMgKVxuICAgIF07XG4gIH1cblxuICByZXR1cm4gU2l6YWJsZVRyYWl0O1xufSApO1xuXG5jb25zdCBpc1NpemFibGUgPSAoIG5vZGU6IE5vZGUgKTogbm9kZSBpcyBTaXphYmxlTm9kZSA9PiB7XG4gIHJldHVybiBub2RlLndpZHRoU2l6YWJsZSAmJiBub2RlLmhlaWdodFNpemFibGU7XG59O1xuY29uc3QgZXh0ZW5kc1NpemFibGUgPSAoIG5vZGU6IE5vZGUgKTogbm9kZSBpcyBTaXphYmxlTm9kZSA9PiB7XG4gIHJldHVybiBub2RlLmV4dGVuZHNTaXphYmxlO1xufTtcblxuZXhwb3J0IHR5cGUgU2l6YWJsZU5vZGUgPSBOb2RlICYgVFNpemFibGU7XG5cbnNjZW5lcnkucmVnaXN0ZXIoICdTaXphYmxlJywgU2l6YWJsZSApO1xuZXhwb3J0IGRlZmF1bHQgU2l6YWJsZTtcbmV4cG9ydCB7IGlzU2l6YWJsZSwgZXh0ZW5kc1NpemFibGUgfTsiXSwibmFtZXMiOlsiRGltZW5zaW9uMiIsImFzc2VydE11dHVhbGx5RXhjbHVzaXZlT3B0aW9ucyIsIm1lbW9pemUiLCJEZWxheWVkTXV0YXRlIiwiSEVJR0hUX1NJWkFCTEVfT1BUSU9OX0tFWVMiLCJIZWlnaHRTaXphYmxlIiwiUkVRVUlSRVNfQk9VTkRTX09QVElPTl9LRVlTIiwic2NlbmVyeSIsIldJRFRIX1NJWkFCTEVfT1BUSU9OX0tFWVMiLCJXaWR0aFNpemFibGUiLCJTSVpBQkxFX1NFTEZfT1BUSU9OX0tFWVMiLCJTSVpBQkxFX09QVElPTl9LRVlTIiwiU2l6YWJsZSIsIlR5cGUiLCJTaXphYmxlVHJhaXQiLCJwcmVmZXJyZWRTaXplIiwiYXNzZXJ0IiwicHJlZmVycmVkV2lkdGgiLCJwcmVmZXJyZWRIZWlnaHQiLCJ2YWx1ZSIsIndpZHRoIiwiaGVpZ2h0IiwibG9jYWxQcmVmZXJyZWRTaXplIiwibG9jYWxQcmVmZXJyZWRXaWR0aCIsImxvY2FsUHJlZmVycmVkSGVpZ2h0IiwibWluaW11bVNpemUiLCJtaW5pbXVtV2lkdGgiLCJtaW5pbXVtSGVpZ2h0IiwibG9jYWxNaW5pbXVtU2l6ZSIsImxvY2FsTWluaW11bVdpZHRoIiwibG9jYWxNaW5pbXVtSGVpZ2h0Iiwic2l6YWJsZSIsIndpZHRoU2l6YWJsZSIsImhlaWdodFNpemFibGUiLCJleHRlbmRzU2l6YWJsZSIsInZhbGlkYXRlTG9jYWxQcmVmZXJyZWRTaXplIiwidmFsaWRhdGVMb2NhbFByZWZlcnJlZFdpZHRoIiwidmFsaWRhdGVMb2NhbFByZWZlcnJlZEhlaWdodCIsIm11dGF0ZSIsIm9wdGlvbnMiLCJfY2FsY3VsYXRlTG9jYWxQcmVmZXJyZWRXaWR0aCIsIm1hdHJpeCIsImlzQXhpc0FsaWduZWQiLCJpc0FsaWduZWQiLCJNYXRoIiwiYWJzIiwidHJhbnNmb3JtIiwiaW52ZXJzZURlbHRhWCIsImdldEludmVyc2UiLCJtMDEiLCJfY2FsY3VsYXRlTG9jYWxQcmVmZXJyZWRIZWlnaHQiLCJpbnZlcnNlRGVsdGFZIiwibTEwIiwiX2NhbGN1bGF0ZVByZWZlcnJlZFdpZHRoIiwidHJhbnNmb3JtRGVsdGFYIiwiX2NhbGN1bGF0ZVByZWZlcnJlZEhlaWdodCIsInRyYW5zZm9ybURlbHRhWSIsIl9vblJlZW50cmFudExvY2FsTWluaW11bVdpZHRoIiwiX3VwZGF0ZU1pbmltdW1XaWR0aExpc3RlbmVyIiwiX3VwZGF0ZU1pbmltdW1IZWlnaHRMaXN0ZW5lciIsIl9vblJlZW50cmFudExvY2FsTWluaW11bUhlaWdodCIsIl9vblJlZW50cmFudFByZWZlcnJlZFdpZHRoIiwiX3VwZGF0ZUxvY2FsUHJlZmVycmVkV2lkdGhMaXN0ZW5lciIsIl91cGRhdGVMb2NhbFByZWZlcnJlZEhlaWdodExpc3RlbmVyIiwiX29uUmVlbnRyYW50UHJlZmVycmVkSGVpZ2h0IiwiX2NhbGN1bGF0ZUxvY2FsTWluaW11bVdpZHRoIiwiX2NhbGN1bGF0ZUxvY2FsTWluaW11bUhlaWdodCIsIl9jYWxjdWxhdGVNaW5pbXVtV2lkdGgiLCJfY2FsY3VsYXRlTWluaW11bUhlaWdodCIsImFyZ3MiLCJwcmVmZXJyZWRXaWR0aFByb3BlcnR5IiwibGF6eUxpbmsiLCJwcmVmZXJyZWRIZWlnaHRQcm9wZXJ0eSIsImxvY2FsUHJlZmVycmVkV2lkdGhQcm9wZXJ0eSIsIl91cGRhdGVQcmVmZXJyZWRIZWlnaHRMaXN0ZW5lciIsImxvY2FsUHJlZmVycmVkSGVpZ2h0UHJvcGVydHkiLCJfdXBkYXRlUHJlZmVycmVkV2lkdGhMaXN0ZW5lciIsIm1pbmltdW1XaWR0aFByb3BlcnR5IiwiX3VwZGF0ZUxvY2FsTWluaW11bUhlaWdodExpc3RlbmVyIiwibWluaW11bUhlaWdodFByb3BlcnR5IiwiX3VwZGF0ZUxvY2FsTWluaW11bVdpZHRoTGlzdGVuZXIiLCJsb2NhbE1pbmltdW1XaWR0aFByb3BlcnR5IiwibG9jYWxNaW5pbXVtSGVpZ2h0UHJvcGVydHkiLCJwcm90b3R5cGUiLCJfbXV0YXRvcktleXMiLCJleGlzdGluZ0tleXMiLCJuZXdLZXlzIiwiaW5kZXhPZkJvdW5kc0Jhc2VkT3B0aW9ucyIsImluZGV4T2YiLCJzbGljZSIsImlzU2l6YWJsZSIsIm5vZGUiLCJyZWdpc3RlciJdLCJtYXBwaW5ncyI6IkFBQUEsc0RBQXNEO0FBRXREOzs7OztDQUtDLEdBRUQsT0FBT0EsZ0JBQWdCLGdDQUFnQztBQUN2RCxPQUFPQyxvQ0FBb0MsMERBQTBEO0FBQ3JHLE9BQU9DLGFBQWEsbUNBQW1DO0FBR3ZELFNBQVNDLGFBQWEsRUFBRUMsMEJBQTBCLEVBQUVDLGFBQWEsRUFBOEJDLDJCQUEyQixFQUFFQyxPQUFPLEVBQUVDLHlCQUF5QixFQUFFQyxZQUFZLFFBQTZCLGdCQUFnQjtBQUl6TixPQUFPLE1BQU1DLDJCQUEyQjtJQUN0QztJQUNBO0lBQ0E7SUFDQTtJQUNBO0NBQ0QsQ0FBQztBQUVGLE9BQU8sTUFBTUMsc0JBQXNCO0lBQ2pDO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7T0FDR0g7T0FDQUo7Q0FDSixDQUFDO0FBc0NGLE1BQU1RLFVBQVVWLFFBQVMsQ0FBdUNXO0lBQzlELE1BQU1DLGVBQWVYLGNBQWUsV0FBV08sMEJBQzdDLE1BQU1JLHFCQUFxQkwsYUFBY0osY0FBZVE7UUFxQnRELElBQVdFLGdCQUFtQztZQUM1Q0MsVUFBVUEsT0FBUSxBQUFFLElBQUksQ0FBQ0MsY0FBYyxLQUFLLFNBQWEsQ0FBQSxJQUFJLENBQUNDLGVBQWUsS0FBSyxJQUFHLEdBQ25GO1lBRUYsSUFBSyxJQUFJLENBQUNELGNBQWMsS0FBSyxRQUFRLElBQUksQ0FBQ0MsZUFBZSxLQUFLLE1BQU87Z0JBQ25FLE9BQU87WUFDVCxPQUNLO2dCQUNILE9BQU8sSUFBSWxCLFdBQVksSUFBSSxDQUFDaUIsY0FBYyxFQUFFLElBQUksQ0FBQ0MsZUFBZTtZQUNsRTtRQUNGO1FBRUEsSUFBV0gsY0FBZUksS0FBd0IsRUFBRztZQUNuRCxJQUFJLENBQUNGLGNBQWMsR0FBR0UsVUFBVSxPQUFPLE9BQU9BLE1BQU1DLEtBQUs7WUFDekQsSUFBSSxDQUFDRixlQUFlLEdBQUdDLFVBQVUsT0FBTyxPQUFPQSxNQUFNRSxNQUFNO1FBQzdEO1FBRUEsSUFBV0MscUJBQXdDO1lBQ2pETixVQUFVQSxPQUFRLEFBQUUsSUFBSSxDQUFDTyxtQkFBbUIsS0FBSyxTQUFhLENBQUEsSUFBSSxDQUFDQyxvQkFBb0IsS0FBSyxJQUFHLEdBQzdGO1lBRUYsSUFBSyxJQUFJLENBQUNELG1CQUFtQixLQUFLLFFBQVEsSUFBSSxDQUFDQyxvQkFBb0IsS0FBSyxNQUFPO2dCQUM3RSxPQUFPO1lBQ1QsT0FDSztnQkFDSCxPQUFPLElBQUl4QixXQUFZLElBQUksQ0FBQ3VCLG1CQUFtQixFQUFFLElBQUksQ0FBQ0Msb0JBQW9CO1lBQzVFO1FBQ0Y7UUFFQSxJQUFXRixtQkFBb0JILEtBQXdCLEVBQUc7WUFDeEQsSUFBSSxDQUFDSSxtQkFBbUIsR0FBR0osVUFBVSxPQUFPLE9BQU9BLE1BQU1DLEtBQUs7WUFDOUQsSUFBSSxDQUFDSSxvQkFBb0IsR0FBR0wsVUFBVSxPQUFPLE9BQU9BLE1BQU1FLE1BQU07UUFDbEU7UUFFQSxJQUFXSSxjQUFpQztZQUMxQ1QsVUFBVUEsT0FBUSxBQUFFLElBQUksQ0FBQ1UsWUFBWSxLQUFLLFNBQWEsQ0FBQSxJQUFJLENBQUNDLGFBQWEsS0FBSyxJQUFHLEdBQy9FO1lBRUYsSUFBSyxJQUFJLENBQUNELFlBQVksS0FBSyxRQUFRLElBQUksQ0FBQ0MsYUFBYSxLQUFLLE1BQU87Z0JBQy9ELE9BQU87WUFDVCxPQUNLO2dCQUNILE9BQU8sSUFBSTNCLFdBQVksSUFBSSxDQUFDMEIsWUFBWSxFQUFFLElBQUksQ0FBQ0MsYUFBYTtZQUM5RDtRQUNGO1FBRUEsSUFBV0YsWUFBYU4sS0FBd0IsRUFBRztZQUNqRCxJQUFJLENBQUNPLFlBQVksR0FBR1AsVUFBVSxPQUFPLE9BQU9BLE1BQU1DLEtBQUs7WUFDdkQsSUFBSSxDQUFDTyxhQUFhLEdBQUdSLFVBQVUsT0FBTyxPQUFPQSxNQUFNRSxNQUFNO1FBQzNEO1FBRUEsSUFBV08sbUJBQXNDO1lBQy9DWixVQUFVQSxPQUFRLEFBQUUsSUFBSSxDQUFDYSxpQkFBaUIsS0FBSyxTQUFhLENBQUEsSUFBSSxDQUFDQyxrQkFBa0IsS0FBSyxJQUFHLEdBQ3pGO1lBRUYsSUFBSyxJQUFJLENBQUNELGlCQUFpQixLQUFLLFFBQVEsSUFBSSxDQUFDQyxrQkFBa0IsS0FBSyxNQUFPO2dCQUN6RSxPQUFPO1lBQ1QsT0FDSztnQkFDSCxPQUFPLElBQUk5QixXQUFZLElBQUksQ0FBQzZCLGlCQUFpQixFQUFFLElBQUksQ0FBQ0Msa0JBQWtCO1lBQ3hFO1FBQ0Y7UUFFQSxJQUFXRixpQkFBa0JULEtBQXdCLEVBQUc7WUFDdEQsSUFBSSxDQUFDVSxpQkFBaUIsR0FBR1YsVUFBVSxPQUFPLE9BQU9BLE1BQU1DLEtBQUs7WUFDNUQsSUFBSSxDQUFDVSxrQkFBa0IsR0FBR1gsVUFBVSxPQUFPLE9BQU9BLE1BQU1FLE1BQU07UUFDaEU7UUFFQSxJQUFXVSxVQUFtQjtZQUM1QmYsVUFBVUEsT0FBUSxJQUFJLENBQUNnQixZQUFZLEtBQUssSUFBSSxDQUFDQyxhQUFhLEVBQ3hEO1lBQ0YsT0FBTyxJQUFJLENBQUNELFlBQVk7UUFDMUI7UUFFQSxJQUFXRCxRQUFTWixLQUFjLEVBQUc7WUFDbkMsSUFBSSxDQUFDYSxZQUFZLEdBQUdiO1lBQ3BCLElBQUksQ0FBQ2MsYUFBYSxHQUFHZDtRQUN2QjtRQUVBLElBQW9CZSxpQkFBMEI7WUFBRSxPQUFPO1FBQU07UUFFdERDLDZCQUFtQztZQUN4QyxJQUFLbkIsUUFBUztnQkFDWixJQUFJLENBQUNvQiwyQkFBMkI7Z0JBQ2hDLElBQUksQ0FBQ0MsNEJBQTRCO1lBQ25DO1FBQ0Y7UUFFZ0JDLE9BQVFDLE9BQTRFLEVBQVM7WUFFM0d0QywrQkFBZ0NzQyxTQUFTO2dCQUFFO2FBQWlCLEVBQUU7Z0JBQUU7Z0JBQWtCO2FBQW1CO1lBQ3JHdEMsK0JBQWdDc0MsU0FBUztnQkFBRTthQUFzQixFQUFFO2dCQUFFO2dCQUF1QjthQUF3QjtZQUNwSHRDLCtCQUFnQ3NDLFNBQVM7Z0JBQUU7YUFBZSxFQUFFO2dCQUFFO2dCQUFnQjthQUFpQjtZQUMvRnRDLCtCQUFnQ3NDLFNBQVM7Z0JBQUU7YUFBb0IsRUFBRTtnQkFBRTtnQkFBcUI7YUFBc0I7WUFDOUd0QywrQkFBZ0NzQyxTQUFTO2dCQUFFO2FBQVcsRUFBRTtnQkFBRTtnQkFBZ0I7YUFBaUI7WUFFM0YsT0FBTyxLQUFLLENBQUNELE9BQVFDO1FBQ3ZCO1FBRUEsOEdBQThHO1FBQzlGQyxnQ0FBK0M7WUFDN0QsSUFBSyxJQUFJLENBQUNDLE1BQU0sQ0FBQ0MsYUFBYSxJQUFLO2dCQUNqQyxJQUFLLElBQUksQ0FBQ0QsTUFBTSxDQUFDRSxTQUFTLElBQUs7b0JBQzdCLElBQUssSUFBSSxDQUFDMUIsY0FBYyxLQUFLLE1BQU87d0JBQ2xDLE9BQU8yQixLQUFLQyxHQUFHLENBQUUsSUFBSSxDQUFDQyxTQUFTLENBQUNDLGFBQWEsQ0FBRSxJQUFJLENBQUM5QixjQUFjO29CQUNwRTtnQkFDRixPQUVLLElBQUssSUFBSSxDQUFDQyxlQUFlLEtBQUssTUFBTztvQkFDeEMsT0FBTzBCLEtBQUtDLEdBQUcsQ0FBRSxJQUFJLENBQUNDLFNBQVMsQ0FBQ0UsVUFBVSxHQUFHQyxHQUFHLEtBQUssSUFBSSxDQUFDL0IsZUFBZTtnQkFDM0U7WUFDRjtZQUVBLE9BQU87UUFDVDtRQUVBLDhHQUE4RztRQUM5RmdDLGlDQUFnRDtZQUM5RCxJQUFLLElBQUksQ0FBQ1QsTUFBTSxDQUFDQyxhQUFhLElBQUs7Z0JBQ2pDLElBQUssSUFBSSxDQUFDRCxNQUFNLENBQUNFLFNBQVMsSUFBSztvQkFDN0IsSUFBSyxJQUFJLENBQUN6QixlQUFlLEtBQUssTUFBTzt3QkFDbkMsT0FBTzBCLEtBQUtDLEdBQUcsQ0FBRSxJQUFJLENBQUNDLFNBQVMsQ0FBQ0ssYUFBYSxDQUFFLElBQUksQ0FBQ2pDLGVBQWU7b0JBQ3JFO2dCQUNGLE9BRUssSUFBSyxJQUFJLENBQUNELGNBQWMsS0FBSyxNQUFPO29CQUN2QyxPQUFPMkIsS0FBS0MsR0FBRyxDQUFFLElBQUksQ0FBQ0MsU0FBUyxDQUFDRSxVQUFVLEdBQUdJLEdBQUcsS0FBSyxJQUFJLENBQUNuQyxjQUFjO2dCQUMxRTtZQUNGO1lBRUEsT0FBTztRQUNUO1FBRUEsOEdBQThHO1FBQzlGb0MsMkJBQTBDO1lBQ3hELElBQUssSUFBSSxDQUFDWixNQUFNLENBQUNDLGFBQWEsSUFBSztnQkFDakMsSUFBSyxJQUFJLENBQUNELE1BQU0sQ0FBQ0UsU0FBUyxJQUFLO29CQUM3QixJQUFLLElBQUksQ0FBQ3BCLG1CQUFtQixLQUFLLE1BQU87d0JBQ3ZDLE9BQU9xQixLQUFLQyxHQUFHLENBQUUsSUFBSSxDQUFDQyxTQUFTLENBQUNRLGVBQWUsQ0FBRSxJQUFJLENBQUMvQixtQkFBbUI7b0JBQzNFO2dCQUNGLE9BQ0ssSUFBSyxJQUFJLENBQUNDLG9CQUFvQixLQUFLLE1BQU87b0JBQzdDLE9BQU9vQixLQUFLQyxHQUFHLENBQUUsSUFBSSxDQUFDQyxTQUFTLENBQUNMLE1BQU0sQ0FBQ1EsR0FBRyxLQUFLLElBQUksQ0FBQ3pCLG9CQUFvQjtnQkFDMUU7WUFDRjtZQUVBLE9BQU87UUFDVDtRQUVBLDhHQUE4RztRQUM5RitCLDRCQUEyQztZQUN6RCxJQUFLLElBQUksQ0FBQ2QsTUFBTSxDQUFDQyxhQUFhLElBQUs7Z0JBQ2pDLElBQUssSUFBSSxDQUFDRCxNQUFNLENBQUNFLFNBQVMsSUFBSztvQkFDN0IsSUFBSyxJQUFJLENBQUNuQixvQkFBb0IsS0FBSyxNQUFPO3dCQUN4QyxPQUFPb0IsS0FBS0MsR0FBRyxDQUFFLElBQUksQ0FBQ0MsU0FBUyxDQUFDVSxlQUFlLENBQUUsSUFBSSxDQUFDaEMsb0JBQW9CO29CQUM1RTtnQkFDRixPQUNLLElBQUssSUFBSSxDQUFDRCxtQkFBbUIsS0FBSyxNQUFPO29CQUM1QyxPQUFPcUIsS0FBS0MsR0FBRyxDQUFFLElBQUksQ0FBQ0MsU0FBUyxDQUFDTCxNQUFNLENBQUNXLEdBQUcsS0FBSyxJQUFJLENBQUM3QixtQkFBbUI7Z0JBQ3pFO1lBQ0Y7WUFFQSxPQUFPO1FBQ1Q7UUFFQSw2R0FBNkc7UUFDN0ZrQyxnQ0FBc0M7WUFDcEQsSUFBSSxDQUFDQywyQkFBMkI7WUFDaEMsSUFBSSxDQUFDQyw0QkFBNEI7UUFDbkM7UUFFQSw2R0FBNkc7UUFDN0ZDLGlDQUF1QztZQUNyRCxJQUFJLENBQUNGLDJCQUEyQjtZQUNoQyxJQUFJLENBQUNDLDRCQUE0QjtRQUNuQztRQUVBLDZHQUE2RztRQUM3RkUsNkJBQW1DO1lBQ2pELElBQUksQ0FBQ0Msa0NBQWtDO1lBQ3ZDLElBQUksQ0FBQ0MsbUNBQW1DO1FBQzFDO1FBRUEsNkdBQTZHO1FBQzdGQyw4QkFBb0M7WUFDbEQsSUFBSSxDQUFDRixrQ0FBa0M7WUFDdkMsSUFBSSxDQUFDQyxtQ0FBbUM7UUFDMUM7UUFFQSw4R0FBOEc7UUFDOUZFLDhCQUE2QztZQUMzRCxJQUFLLElBQUksQ0FBQ3hCLE1BQU0sQ0FBQ0MsYUFBYSxJQUFLO2dCQUNqQyxJQUFLLElBQUksQ0FBQ0QsTUFBTSxDQUFDRSxTQUFTLElBQUs7b0JBQzdCLElBQUssSUFBSSxDQUFDakIsWUFBWSxLQUFLLE1BQU87d0JBQ2hDLE9BQU9rQixLQUFLQyxHQUFHLENBQUUsSUFBSSxDQUFDQyxTQUFTLENBQUNDLGFBQWEsQ0FBRSxJQUFJLENBQUNyQixZQUFZO29CQUNsRTtnQkFDRixPQUNLLElBQUssSUFBSSxDQUFDQyxhQUFhLEtBQUssTUFBTztvQkFDdEMsT0FBT2lCLEtBQUtDLEdBQUcsQ0FBRSxJQUFJLENBQUNDLFNBQVMsQ0FBQ0UsVUFBVSxHQUFHQyxHQUFHLEtBQUssSUFBSSxDQUFDdEIsYUFBYTtnQkFDekU7WUFDRjtZQUVBLE9BQU87UUFDVDtRQUVBLDhHQUE4RztRQUM5RnVDLCtCQUE4QztZQUM1RCxJQUFLLElBQUksQ0FBQ3pCLE1BQU0sQ0FBQ0MsYUFBYSxJQUFLO2dCQUNqQyxJQUFLLElBQUksQ0FBQ0QsTUFBTSxDQUFDRSxTQUFTLElBQUs7b0JBQzdCLElBQUssSUFBSSxDQUFDaEIsYUFBYSxLQUFLLE1BQU87d0JBQ2pDLE9BQU9pQixLQUFLQyxHQUFHLENBQUUsSUFBSSxDQUFDQyxTQUFTLENBQUNLLGFBQWEsQ0FBRSxJQUFJLENBQUN4QixhQUFhO29CQUNuRTtnQkFDRixPQUNLLElBQUssSUFBSSxDQUFDRCxZQUFZLEtBQUssTUFBTztvQkFDckMsT0FBT2tCLEtBQUtDLEdBQUcsQ0FBRSxJQUFJLENBQUNDLFNBQVMsQ0FBQ0UsVUFBVSxHQUFHSSxHQUFHLEtBQUssSUFBSSxDQUFDMUIsWUFBWTtnQkFDeEU7WUFDRjtZQUVBLE9BQU87UUFDVDtRQUVBLDhHQUE4RztRQUM5RnlDLHlCQUF3QztZQUN0RCxJQUFLLElBQUksQ0FBQzFCLE1BQU0sQ0FBQ0MsYUFBYSxJQUFLO2dCQUNqQyxJQUFLLElBQUksQ0FBQ0QsTUFBTSxDQUFDRSxTQUFTLElBQUs7b0JBQzdCLElBQUssSUFBSSxDQUFDZCxpQkFBaUIsS0FBSyxNQUFPO3dCQUNyQyxPQUFPZSxLQUFLQyxHQUFHLENBQUUsSUFBSSxDQUFDQyxTQUFTLENBQUNRLGVBQWUsQ0FBRSxJQUFJLENBQUN6QixpQkFBaUI7b0JBQ3pFO2dCQUNGLE9BQ0ssSUFBSyxJQUFJLENBQUNDLGtCQUFrQixLQUFLLE1BQU87b0JBQzNDLE9BQU9jLEtBQUtDLEdBQUcsQ0FBRSxJQUFJLENBQUNDLFNBQVMsQ0FBQ0wsTUFBTSxDQUFDUSxHQUFHLEtBQUssSUFBSSxDQUFDbkIsa0JBQWtCO2dCQUN4RTtZQUNGO1lBRUEsT0FBTztRQUNUO1FBRUEsOEdBQThHO1FBQzlGc0MsMEJBQXlDO1lBQ3ZELElBQUssSUFBSSxDQUFDM0IsTUFBTSxDQUFDQyxhQUFhLElBQUs7Z0JBQ2pDLElBQUssSUFBSSxDQUFDRCxNQUFNLENBQUNFLFNBQVMsSUFBSztvQkFDN0IsSUFBSyxJQUFJLENBQUNiLGtCQUFrQixLQUFLLE1BQU87d0JBQ3RDLE9BQU9jLEtBQUtDLEdBQUcsQ0FBRSxJQUFJLENBQUNDLFNBQVMsQ0FBQ1UsZUFBZSxDQUFFLElBQUksQ0FBQzFCLGtCQUFrQjtvQkFDMUU7Z0JBQ0YsT0FDSyxJQUFLLElBQUksQ0FBQ0QsaUJBQWlCLEtBQUssTUFBTztvQkFDMUMsT0FBT2UsS0FBS0MsR0FBRyxDQUFFLElBQUksQ0FBQ0MsU0FBUyxDQUFDTCxNQUFNLENBQUNXLEdBQUcsS0FBSyxJQUFJLENBQUN2QixpQkFBaUI7Z0JBQ3ZFO1lBQ0Y7WUFFQSxPQUFPO1FBQ1Q7UUE5UUEsWUFBb0IsR0FBR3dDLElBQXNCLENBQUc7WUFDOUMsS0FBSyxJQUFLQTtZQUVWLHVHQUF1RztZQUN2Ryx1RUFBdUU7WUFFdkUsSUFBSSxDQUFDQyxzQkFBc0IsQ0FBQ0MsUUFBUSxDQUFFLElBQUksQ0FBQ1IsbUNBQW1DO1lBQzlFLElBQUksQ0FBQ1MsdUJBQXVCLENBQUNELFFBQVEsQ0FBRSxJQUFJLENBQUNULGtDQUFrQztZQUU5RSxJQUFJLENBQUNXLDJCQUEyQixDQUFDRixRQUFRLENBQUUsSUFBSSxDQUFDRyw4QkFBOEI7WUFDOUUsSUFBSSxDQUFDQyw0QkFBNEIsQ0FBQ0osUUFBUSxDQUFFLElBQUksQ0FBQ0ssNkJBQTZCO1lBRTlFLElBQUksQ0FBQ0Msb0JBQW9CLENBQUNOLFFBQVEsQ0FBRSxJQUFJLENBQUNPLGlDQUFpQztZQUMxRSxJQUFJLENBQUNDLHFCQUFxQixDQUFDUixRQUFRLENBQUUsSUFBSSxDQUFDUyxnQ0FBZ0M7WUFFMUUsSUFBSSxDQUFDQyx5QkFBeUIsQ0FBQ1YsUUFBUSxDQUFFLElBQUksQ0FBQ1osNEJBQTRCO1lBQzFFLElBQUksQ0FBQ3VCLDBCQUEwQixDQUFDWCxRQUFRLENBQUUsSUFBSSxDQUFDYiwyQkFBMkI7UUFDNUU7SUE4UEY7SUFFRiwyREFBMkQ7SUFDM0QsSUFBSzVDLGFBQWFxRSxTQUFTLENBQUNDLFlBQVksRUFBRztRQUN6QyxNQUFNQyxlQUFldkUsYUFBYXFFLFNBQVMsQ0FBQ0MsWUFBWTtRQUN4RCxNQUFNRSxVQUFVNUU7UUFDaEIsTUFBTTZFLDRCQUE0QkYsYUFBYUcsT0FBTyxDQUFFbEYsMkJBQTJCLENBQUUsRUFBRztRQUN4RlEsYUFBYXFFLFNBQVMsQ0FBQ0MsWUFBWSxHQUFHO2VBQ2pDQyxhQUFhSSxLQUFLLENBQUUsR0FBR0Y7ZUFDdkJEO2VBQ0FELGFBQWFJLEtBQUssQ0FBRUY7U0FDeEI7SUFDSDtJQUVBLE9BQU96RTtBQUNUO0FBRUEsTUFBTTRFLFlBQVksQ0FBRUM7SUFDbEIsT0FBT0EsS0FBSzNELFlBQVksSUFBSTJELEtBQUsxRCxhQUFhO0FBQ2hEO0FBQ0EsTUFBTUMsaUJBQWlCLENBQUV5RDtJQUN2QixPQUFPQSxLQUFLekQsY0FBYztBQUM1QjtBQUlBM0IsUUFBUXFGLFFBQVEsQ0FBRSxXQUFXaEY7QUFDN0IsZUFBZUEsUUFBUTtBQUN2QixTQUFTOEUsU0FBUyxFQUFFeEQsY0FBYyxHQUFHIn0=