// Copyright 2014-2024, University of Colorado Boulder
/**
 * Poolable wrapper for SVG <group> elements. We store state and add listeners directly to the corresponding Node,
 * so that we can set dirty flags and smartly update only things that have changed. This takes a load off of SVGBlock.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ import toSVGNumber from '../../../dot/js/toSVGNumber.js';
import cleanArray from '../../../phet-core/js/cleanArray.js';
import Poolable from '../../../phet-core/js/Poolable.js';
import { scenery, svgns } from '../imports.js';
let globalId = 1;
let clipGlobalId = 1;
let SVGGroup = class SVGGroup {
    /**
   * @public
   *
   * @param {SVGBlock} block
   * @param {Block} instance
   * @param {SVGGroup|null} parent
   */ initialize(block, instance, parent) {
        //OHTWO TODO: add collapsing groups! they can't have self drawables, transforms, filters, etc., and we probably shouldn't de-collapse groups https://github.com/phetsims/scenery/issues/1581
        sceneryLog && sceneryLog.SVGGroup && sceneryLog.SVGGroup(`initializing ${this.toString()}`);
        // @public {SVGBlock|null} - Set to null when we're disposing, checked by other code.
        this.block = block;
        // @public {Instance|null} - Set to null when we're disposed.
        this.instance = instance;
        // @public {Node|null} - Set to null when we're disposed
        this.node = instance.trail.lastNode();
        // @public {SVGGroup|null}
        this.parent = parent;
        // @public {Array.<SVGGroup>}
        this.children = cleanArray(this.children);
        // @private {boolean}
        this.hasSelfDrawable = false;
        // @private {SVGSelfDrawable|null}
        this.selfDrawable = null;
        // @private {boolean} - general dirty flag (triggered on any other dirty event)
        this.dirty = true;
        // @private {boolean} - we won't listen for transform changes (or even want to set a transform) if our node is
        // beneath a transform root
        this.willApplyTransforms = this.block.transformRootInstance.trail.nodes.length < this.instance.trail.nodes.length;
        // @private {boolean} - we won't listen for filter changes (or set filters, like opacity or visibility) if our node
        // is beneath a filter root
        this.willApplyFilters = this.block.filterRootInstance.trail.nodes.length < this.instance.trail.nodes.length;
        // transform handling
        this.transformDirty = true;
        this.hasTransform = this.hasTransform !== undefined ? this.hasTransform : false; // persists across disposal
        this.transformDirtyListener = this.transformDirtyListener || this.markTransformDirty.bind(this);
        if (this.willApplyTransforms) {
            this.node.transformEmitter.addListener(this.transformDirtyListener);
        }
        // @private {boolean}
        this.filterDirty = true;
        this.visibilityDirty = true;
        this.clipDirty = true;
        // @private {SVGFilterElement|null} - lazily created
        this.filterElement = this.filterElement || null;
        // @private {boolean} - Whether we have an opacity attribute set on our SVG element (persists across disposal)
        this.hasOpacity = this.hasOpacity !== undefined ? this.hasOpacity : false;
        // @private {boolean} - Whether we have a filter element connected to our block (and that is being used with a filter
        // attribute). Since this needs to be cleaned up when we are disposed, this will be set to false when disposed
        // (with the associated attribute and defs reference cleaned up).
        this.hasFilter = false;
        this.clipDefinition = this.clipDefinition !== undefined ? this.clipDefinition : null; // persists across disposal
        this.clipPath = this.clipPath !== undefined ? this.clipPath : null; // persists across disposal
        this.filterChangeListener = this.filterChangeListener || this.onFilterChange.bind(this);
        this.visibilityDirtyListener = this.visibilityDirtyListener || this.onVisibleChange.bind(this);
        this.clipDirtyListener = this.clipDirtyListener || this.onClipChange.bind(this);
        this.node.visibleProperty.lazyLink(this.visibilityDirtyListener);
        if (this.willApplyFilters) {
            this.node.filterChangeEmitter.addListener(this.filterChangeListener);
        }
        //OHTWO TODO: remove clip workaround https://github.com/phetsims/scenery/issues/1581
        this.node.clipAreaProperty.lazyLink(this.clipDirtyListener);
        // for tracking the order of child groups, we use a flag and update (reorder) once per updateDisplay if necessary.
        this.orderDirty = true;
        this.orderDirtyListener = this.orderDirtyListener || this.markOrderDirty.bind(this);
        this.node.childrenChangedEmitter.addListener(this.orderDirtyListener);
        if (!this.svgGroup) {
            this.svgGroup = document.createElementNS(svgns, 'g');
        }
        this.instance.addSVGGroup(this);
        this.block.markDirtyGroup(this); // so we are marked and updated properly
    }
    /**
   * @private
   *
   * @param {SelfDrawable} drawable
   */ addSelfDrawable(drawable) {
        this.selfDrawable = drawable;
        this.svgGroup.insertBefore(drawable.svgElement, this.children.length ? this.children[0].svgGroup : null);
        this.hasSelfDrawable = true;
    }
    /**
   * @private
   *
   * @param {SelfDrawable} drawable
   */ removeSelfDrawable(drawable) {
        this.hasSelfDrawable = false;
        this.svgGroup.removeChild(drawable.svgElement);
        this.selfDrawable = null;
    }
    /**
   * @private
   *
   * @param {SVGGroup} group
   */ addChildGroup(group) {
        this.markOrderDirty();
        group.parent = this;
        this.children.push(group);
        this.svgGroup.appendChild(group.svgGroup);
    }
    /**
   * @private
   *
   * @param {SVGGroup} group
   */ removeChildGroup(group) {
        this.markOrderDirty();
        group.parent = null;
        this.children.splice(_.indexOf(this.children, group), 1);
        this.svgGroup.removeChild(group.svgGroup);
    }
    /**
   * @public
   */ markDirty() {
        if (!this.dirty) {
            this.dirty = true;
            this.block.markDirtyGroup(this);
        }
    }
    /**
   * @public
   */ markOrderDirty() {
        if (!this.orderDirty) {
            this.orderDirty = true;
            this.markDirty();
        }
    }
    /**
   * @public
   */ markTransformDirty() {
        if (!this.transformDirty) {
            this.transformDirty = true;
            this.markDirty();
        }
    }
    /**
   * @private
   */ onFilterChange() {
        if (!this.filterDirty) {
            this.filterDirty = true;
            this.markDirty();
        }
    }
    /**
   * @private
   */ onVisibleChange() {
        if (!this.visibilityDirty) {
            this.visibilityDirty = true;
            this.markDirty();
        }
    }
    /**
   * @private
   */ onClipChange() {
        if (!this.clipDirty) {
            this.clipDirty = true;
            this.markDirty();
        }
    }
    /**
   * @public
   */ update() {
        sceneryLog && sceneryLog.SVGGroup && sceneryLog.SVGGroup(`update: ${this.toString()}`);
        // we may have been disposed since being marked dirty on our block. we won't have a reference if we are disposed
        if (!this.block) {
            return;
        }
        sceneryLog && sceneryLog.SVGGroup && sceneryLog.push();
        const svgGroup = this.svgGroup;
        this.dirty = false;
        if (this.transformDirty) {
            this.transformDirty = false;
            sceneryLog && sceneryLog.SVGGroup && sceneryLog.SVGGroup(`transform update: ${this.toString()}`);
            if (this.willApplyTransforms) {
                const isIdentity = this.node.transform.isIdentity();
                if (!isIdentity) {
                    this.hasTransform = true;
                    svgGroup.setAttribute('transform', this.node.transform.getMatrix().getSVGTransform());
                } else if (this.hasTransform) {
                    this.hasTransform = false;
                    svgGroup.removeAttribute('transform');
                }
            } else {
                // we want no transforms if we won't be applying transforms
                if (this.hasTransform) {
                    this.hasTransform = false;
                    svgGroup.removeAttribute('transform');
                }
            }
        }
        if (this.visibilityDirty) {
            this.visibilityDirty = false;
            sceneryLog && sceneryLog.SVGGroup && sceneryLog.SVGGroup(`visibility update: ${this.toString()}`);
            svgGroup.style.display = this.node.isVisible() ? '' : 'none';
        }
        // TODO: Check if we can leave opacity separate. If it gets applied "after" then we can have them separate https://github.com/phetsims/scenery/issues/1581
        if (this.filterDirty) {
            this.filterDirty = false;
            sceneryLog && sceneryLog.SVGGroup && sceneryLog.SVGGroup(`filter update: ${this.toString()}`);
            const opacity = this.node.effectiveOpacity;
            if (this.willApplyFilters && opacity !== 1) {
                this.hasOpacity = true;
                svgGroup.setAttribute('opacity', opacity);
            } else if (this.hasOpacity) {
                this.hasOpacity = false;
                svgGroup.removeAttribute('opacity');
            }
            const needsFilter = this.willApplyFilters && this.node._filters.length;
            const filterId = `filter-${this.id}`;
            if (needsFilter) {
                // Lazy creation of the filter element (if we haven't already)
                if (!this.filterElement) {
                    this.filterElement = document.createElementNS(svgns, 'filter');
                    this.filterElement.setAttribute('id', filterId);
                }
                // Remove all children of the filter element if we're applying filters (if not, we won't have it attached)
                while(this.filterElement.firstChild){
                    this.filterElement.removeChild(this.filterElement.lastChild);
                }
                // Fill in elements into our filter
                let filterRegionPercentageIncrease = 50;
                let inName = 'SourceGraphic';
                const length = this.node._filters.length;
                for(let i = 0; i < length; i++){
                    const filter = this.node._filters[i];
                    const resultName = i === length - 1 ? undefined : `e${i}`; // Last result should be undefined
                    filter.applySVGFilter(this.filterElement, inName, resultName);
                    filterRegionPercentageIncrease += filter.filterRegionPercentageIncrease;
                    inName = resultName;
                }
                // Bleh, no good way to handle the filter region? https://drafts.fxtf.org/filter-effects/#filter-region
                // If we WANT to track things by their actual display size AND pad pixels, AND copy tons of things... we could
                // potentially use the userSpaceOnUse and pad the proper number of pixels. That sounds like an absolute pain, AND
                // a performance drain and abstraction break.
                const min = `-${toSVGNumber(filterRegionPercentageIncrease)}%`;
                const size = `${toSVGNumber(2 * filterRegionPercentageIncrease + 100)}%`;
                this.filterElement.setAttribute('x', min);
                this.filterElement.setAttribute('y', min);
                this.filterElement.setAttribute('width', size);
                this.filterElement.setAttribute('height', size);
            }
            if (needsFilter) {
                if (!this.hasFilter) {
                    this.block.defs.appendChild(this.filterElement);
                }
                svgGroup.setAttribute('filter', `url(#${filterId})`);
                this.hasFilter = true;
            }
            if (this.hasFilter && !needsFilter) {
                svgGroup.removeAttribute('filter');
                this.hasFilter = false;
                this.block.defs.removeChild(this.filterElement);
            }
        }
        if (this.clipDirty) {
            this.clipDirty = false;
            sceneryLog && sceneryLog.SVGGroup && sceneryLog.SVGGroup(`clip update: ${this.toString()}`);
            //OHTWO TODO: remove clip workaround (use this.willApplyFilters) https://github.com/phetsims/scenery/issues/1581
            if (this.node.clipArea) {
                if (!this.clipDefinition) {
                    // Use monotonically-increasing and unique clip IDs, see https://github.com/phetsims/faradays-electromagnetic-lab/issues/89
                    // There is no connection necessarily to the node, especially, since we can have different SVG representations
                    // of a node, AND we pool the SVGGroups.
                    const clipId = `clip${clipGlobalId++}`;
                    this.clipDefinition = document.createElementNS(svgns, 'clipPath');
                    this.clipDefinition.setAttribute('id', clipId);
                    this.clipDefinition.setAttribute('clipPathUnits', 'userSpaceOnUse');
                    this.block.defs.appendChild(this.clipDefinition); // TODO: method? evaluate with future usage of defs (not done yet) https://github.com/phetsims/scenery/issues/1581
                    this.clipPath = document.createElementNS(svgns, 'path');
                    this.clipDefinition.appendChild(this.clipPath);
                    svgGroup.setAttribute('clip-path', `url(#${clipId})`);
                }
                this.clipPath.setAttribute('d', this.node.clipArea.getSVGPath());
            } else if (this.clipDefinition) {
                svgGroup.removeAttribute('clip-path');
                this.block.defs.removeChild(this.clipDefinition); // TODO: method? evaluate with future usage of defs (not done yet) https://github.com/phetsims/scenery/issues/1581
                // TODO: consider pooling these? https://github.com/phetsims/scenery/issues/1581
                this.clipDefinition = null;
                this.clipPath = null;
            }
        }
        if (this.orderDirty) {
            this.orderDirty = false;
            sceneryLog && sceneryLog.SVGGroup && sceneryLog.SVGGroup(`order update: ${this.toString()}`);
            sceneryLog && sceneryLog.SVGGroup && sceneryLog.push();
            // our instance should have the proper order of children. we check that way.
            let idx = this.children.length - 1;
            const instanceChildren = this.instance.children;
            // iterate backwards, since DOM's insertBefore makes forward iteration more complicated (no insertAfter)
            for(let i = instanceChildren.length - 1; i >= 0; i--){
                const group = instanceChildren[i].lookupSVGGroup(this.block);
                if (group) {
                    // ensure that the spot in our array (and in the DOM) at [idx] is correct
                    if (this.children[idx] !== group) {
                        // out of order, rearrange
                        sceneryLog && sceneryLog.SVGGroup && sceneryLog.SVGGroup(`group out of order: ${idx} for ${group.toString()}`);
                        // in the DOM first (since we reference the children array to know what to insertBefore)
                        // see http://stackoverflow.com/questions/9732624/how-to-swap-dom-child-nodes-in-javascript
                        svgGroup.insertBefore(group.svgGroup, idx + 1 >= this.children.length ? null : this.children[idx + 1].svgGroup);
                        // then in our children array
                        const oldIndex = _.indexOf(this.children, group);
                        assert && assert(oldIndex < idx, 'The item we are moving backwards to location [idx] should not have an index greater than that');
                        this.children.splice(oldIndex, 1);
                        this.children.splice(idx, 0, group);
                    } else {
                        sceneryLog && sceneryLog.SVGGroup && sceneryLog.SVGGroup(`group in place: ${idx} for ${group.toString()}`);
                    }
                    // if there was a group for that instance, we move on to the next spot
                    idx--;
                }
            }
            sceneryLog && sceneryLog.SVGGroup && sceneryLog.pop();
        }
        sceneryLog && sceneryLog.SVGGroup && sceneryLog.pop();
    }
    /**
   * @private
   *
   * @returns {boolean}
   */ isReleasable() {
        // if we have no parent, we are the rootGroup (the block is responsible for disposing that one)
        return !this.hasSelfDrawable && !this.children.length && this.parent;
    }
    /**
   * Releases references
   * @public
   */ dispose() {
        sceneryLog && sceneryLog.SVGGroup && sceneryLog.SVGGroup(`dispose ${this.toString()}`);
        sceneryLog && sceneryLog.SVGGroup && sceneryLog.push();
        assert && assert(this.children.length === 0, 'Should be empty by now');
        if (this.hasFilter) {
            this.svgGroup.removeAttribute('filter');
            this.hasFilter = false;
            this.block.defs.removeChild(this.filterElement);
        }
        if (this.willApplyTransforms) {
            this.node.transformEmitter.removeListener(this.transformDirtyListener);
        }
        this.node.visibleProperty.unlink(this.visibilityDirtyListener);
        if (this.willApplyFilters) {
            this.node.filterChangeEmitter.removeListener(this.filterChangeListener);
        }
        //OHTWO TODO: remove clip workaround https://github.com/phetsims/scenery/issues/1581
        this.node.clipAreaProperty.unlink(this.clipDirtyListener);
        this.node.childrenChangedEmitter.removeListener(this.orderDirtyListener);
        // if our Instance has been disposed, it has already had the reference removed
        if (this.instance.active) {
            this.instance.removeSVGGroup(this);
        }
        // remove clipping, since it is defs-based (and we want to keep our defs block clean - could be another layer!)
        if (this.clipDefinition) {
            this.svgGroup.removeAttribute('clip-path');
            this.block.defs.removeChild(this.clipDefinition);
            this.clipDefinition = null;
            this.clipPath = null;
        }
        // clear references
        this.parent = null;
        this.block = null;
        this.instance = null;
        this.node = null;
        cleanArray(this.children);
        this.selfDrawable = null;
        // for now
        this.freeToPool();
        sceneryLog && sceneryLog.SVGGroup && sceneryLog.pop();
    }
    /**
   * Returns a string form of this object
   * @public
   *
   * @returns {string}
   */ toString() {
        return `SVGGroup:${this.block.toString()}_${this.instance.toString()}`;
    }
    /**
   * @public
   *
   * @param {SVGBlock} block
   * @param {Drawable} drawable
   */ static addDrawable(block, drawable) {
        assert && assert(drawable.instance, 'Instance is required for a drawable to be grouped correctly in SVG');
        const group = SVGGroup.ensureGroupsToInstance(block, drawable.instance);
        group.addSelfDrawable(drawable);
    }
    /**
   * @public
   *
   * @param {SVGBlock} block
   * @param {Drawable} drawable
   */ static removeDrawable(block, drawable) {
        drawable.instance.lookupSVGGroup(block).removeSelfDrawable(drawable);
        SVGGroup.releaseGroupsToInstance(block, drawable.instance);
    }
    /**
   * @private
   *
   * @param {SVGBlock} block
   * @param {Instance} instance
   * @returns {SVGGroup}
   */ static ensureGroupsToInstance(block, instance) {
        // TODO: assertions here https://github.com/phetsims/scenery/issues/1581
        let group = instance.lookupSVGGroup(block);
        if (!group) {
            assert && assert(instance !== block.rootGroup.instance, 'Making sure we do not walk past our rootGroup');
            const parentGroup = SVGGroup.ensureGroupsToInstance(block, instance.parent);
            group = SVGGroup.createFromPool(block, instance, parentGroup);
            parentGroup.addChildGroup(group);
        }
        return group;
    }
    /**
   * @private
   *
   * @param {SVGBlock} block
   * @param {Instance} instance
   */ static releaseGroupsToInstance(block, instance) {
        const group = instance.lookupSVGGroup(block);
        if (group.isReleasable()) {
            const parentGroup = group.parent;
            parentGroup.removeChildGroup(group);
            SVGGroup.releaseGroupsToInstance(block, parentGroup.instance);
            group.dispose();
        }
    }
    /**
   * @mixes Poolable
   *
   * @param {SVGBlock} block
   * @param {Block} instance
   * @param {SVGGroup|null} parent
   */ constructor(block, instance, parent){
        // @public {string}
        this.id = `group${globalId++}`;
        this.initialize(block, instance, parent);
    }
};
scenery.register('SVGGroup', SVGGroup);
Poolable.mixInto(SVGGroup);
export default SVGGroup;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvZGlzcGxheS9TVkdHcm91cC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNC0yMDI0LCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuLyoqXG4gKiBQb29sYWJsZSB3cmFwcGVyIGZvciBTVkcgPGdyb3VwPiBlbGVtZW50cy4gV2Ugc3RvcmUgc3RhdGUgYW5kIGFkZCBsaXN0ZW5lcnMgZGlyZWN0bHkgdG8gdGhlIGNvcnJlc3BvbmRpbmcgTm9kZSxcbiAqIHNvIHRoYXQgd2UgY2FuIHNldCBkaXJ0eSBmbGFncyBhbmQgc21hcnRseSB1cGRhdGUgb25seSB0aGluZ3MgdGhhdCBoYXZlIGNoYW5nZWQuIFRoaXMgdGFrZXMgYSBsb2FkIG9mZiBvZiBTVkdCbG9jay5cbiAqXG4gKiBAYXV0aG9yIEpvbmF0aGFuIE9sc29uIDxqb25hdGhhbi5vbHNvbkBjb2xvcmFkby5lZHU+XG4gKi9cblxuaW1wb3J0IHRvU1ZHTnVtYmVyIGZyb20gJy4uLy4uLy4uL2RvdC9qcy90b1NWR051bWJlci5qcyc7XG5pbXBvcnQgY2xlYW5BcnJheSBmcm9tICcuLi8uLi8uLi9waGV0LWNvcmUvanMvY2xlYW5BcnJheS5qcyc7XG5pbXBvcnQgUG9vbGFibGUgZnJvbSAnLi4vLi4vLi4vcGhldC1jb3JlL2pzL1Bvb2xhYmxlLmpzJztcbmltcG9ydCB7IHNjZW5lcnksIHN2Z25zIH0gZnJvbSAnLi4vaW1wb3J0cy5qcyc7XG5cbmxldCBnbG9iYWxJZCA9IDE7XG5sZXQgY2xpcEdsb2JhbElkID0gMTtcblxuY2xhc3MgU1ZHR3JvdXAge1xuICAvKipcbiAgICogQG1peGVzIFBvb2xhYmxlXG4gICAqXG4gICAqIEBwYXJhbSB7U1ZHQmxvY2t9IGJsb2NrXG4gICAqIEBwYXJhbSB7QmxvY2t9IGluc3RhbmNlXG4gICAqIEBwYXJhbSB7U1ZHR3JvdXB8bnVsbH0gcGFyZW50XG4gICAqL1xuICBjb25zdHJ1Y3RvciggYmxvY2ssIGluc3RhbmNlLCBwYXJlbnQgKSB7XG4gICAgLy8gQHB1YmxpYyB7c3RyaW5nfVxuICAgIHRoaXMuaWQgPSBgZ3JvdXAke2dsb2JhbElkKyt9YDtcblxuICAgIHRoaXMuaW5pdGlhbGl6ZSggYmxvY2ssIGluc3RhbmNlLCBwYXJlbnQgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcHVibGljXG4gICAqXG4gICAqIEBwYXJhbSB7U1ZHQmxvY2t9IGJsb2NrXG4gICAqIEBwYXJhbSB7QmxvY2t9IGluc3RhbmNlXG4gICAqIEBwYXJhbSB7U1ZHR3JvdXB8bnVsbH0gcGFyZW50XG4gICAqL1xuICBpbml0aWFsaXplKCBibG9jaywgaW5zdGFuY2UsIHBhcmVudCApIHtcbiAgICAvL09IVFdPIFRPRE86IGFkZCBjb2xsYXBzaW5nIGdyb3VwcyEgdGhleSBjYW4ndCBoYXZlIHNlbGYgZHJhd2FibGVzLCB0cmFuc2Zvcm1zLCBmaWx0ZXJzLCBldGMuLCBhbmQgd2UgcHJvYmFibHkgc2hvdWxkbid0IGRlLWNvbGxhcHNlIGdyb3VwcyBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvc2NlbmVyeS9pc3N1ZXMvMTU4MVxuXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLlNWR0dyb3VwICYmIHNjZW5lcnlMb2cuU1ZHR3JvdXAoIGBpbml0aWFsaXppbmcgJHt0aGlzLnRvU3RyaW5nKCl9YCApO1xuXG4gICAgLy8gQHB1YmxpYyB7U1ZHQmxvY2t8bnVsbH0gLSBTZXQgdG8gbnVsbCB3aGVuIHdlJ3JlIGRpc3Bvc2luZywgY2hlY2tlZCBieSBvdGhlciBjb2RlLlxuICAgIHRoaXMuYmxvY2sgPSBibG9jaztcblxuICAgIC8vIEBwdWJsaWMge0luc3RhbmNlfG51bGx9IC0gU2V0IHRvIG51bGwgd2hlbiB3ZSdyZSBkaXNwb3NlZC5cbiAgICB0aGlzLmluc3RhbmNlID0gaW5zdGFuY2U7XG5cbiAgICAvLyBAcHVibGljIHtOb2RlfG51bGx9IC0gU2V0IHRvIG51bGwgd2hlbiB3ZSdyZSBkaXNwb3NlZFxuICAgIHRoaXMubm9kZSA9IGluc3RhbmNlLnRyYWlsLmxhc3ROb2RlKCk7XG5cbiAgICAvLyBAcHVibGljIHtTVkdHcm91cHxudWxsfVxuICAgIHRoaXMucGFyZW50ID0gcGFyZW50O1xuXG4gICAgLy8gQHB1YmxpYyB7QXJyYXkuPFNWR0dyb3VwPn1cbiAgICB0aGlzLmNoaWxkcmVuID0gY2xlYW5BcnJheSggdGhpcy5jaGlsZHJlbiApO1xuXG4gICAgLy8gQHByaXZhdGUge2Jvb2xlYW59XG4gICAgdGhpcy5oYXNTZWxmRHJhd2FibGUgPSBmYWxzZTtcblxuICAgIC8vIEBwcml2YXRlIHtTVkdTZWxmRHJhd2FibGV8bnVsbH1cbiAgICB0aGlzLnNlbGZEcmF3YWJsZSA9IG51bGw7XG5cbiAgICAvLyBAcHJpdmF0ZSB7Ym9vbGVhbn0gLSBnZW5lcmFsIGRpcnR5IGZsYWcgKHRyaWdnZXJlZCBvbiBhbnkgb3RoZXIgZGlydHkgZXZlbnQpXG4gICAgdGhpcy5kaXJ0eSA9IHRydWU7XG5cbiAgICAvLyBAcHJpdmF0ZSB7Ym9vbGVhbn0gLSB3ZSB3b24ndCBsaXN0ZW4gZm9yIHRyYW5zZm9ybSBjaGFuZ2VzIChvciBldmVuIHdhbnQgdG8gc2V0IGEgdHJhbnNmb3JtKSBpZiBvdXIgbm9kZSBpc1xuICAgIC8vIGJlbmVhdGggYSB0cmFuc2Zvcm0gcm9vdFxuICAgIHRoaXMud2lsbEFwcGx5VHJhbnNmb3JtcyA9IHRoaXMuYmxvY2sudHJhbnNmb3JtUm9vdEluc3RhbmNlLnRyYWlsLm5vZGVzLmxlbmd0aCA8IHRoaXMuaW5zdGFuY2UudHJhaWwubm9kZXMubGVuZ3RoO1xuXG4gICAgLy8gQHByaXZhdGUge2Jvb2xlYW59IC0gd2Ugd29uJ3QgbGlzdGVuIGZvciBmaWx0ZXIgY2hhbmdlcyAob3Igc2V0IGZpbHRlcnMsIGxpa2Ugb3BhY2l0eSBvciB2aXNpYmlsaXR5KSBpZiBvdXIgbm9kZVxuICAgIC8vIGlzIGJlbmVhdGggYSBmaWx0ZXIgcm9vdFxuICAgIHRoaXMud2lsbEFwcGx5RmlsdGVycyA9IHRoaXMuYmxvY2suZmlsdGVyUm9vdEluc3RhbmNlLnRyYWlsLm5vZGVzLmxlbmd0aCA8IHRoaXMuaW5zdGFuY2UudHJhaWwubm9kZXMubGVuZ3RoO1xuXG4gICAgLy8gdHJhbnNmb3JtIGhhbmRsaW5nXG4gICAgdGhpcy50cmFuc2Zvcm1EaXJ0eSA9IHRydWU7XG4gICAgdGhpcy5oYXNUcmFuc2Zvcm0gPSB0aGlzLmhhc1RyYW5zZm9ybSAhPT0gdW5kZWZpbmVkID8gdGhpcy5oYXNUcmFuc2Zvcm0gOiBmYWxzZTsgLy8gcGVyc2lzdHMgYWNyb3NzIGRpc3Bvc2FsXG4gICAgdGhpcy50cmFuc2Zvcm1EaXJ0eUxpc3RlbmVyID0gdGhpcy50cmFuc2Zvcm1EaXJ0eUxpc3RlbmVyIHx8IHRoaXMubWFya1RyYW5zZm9ybURpcnR5LmJpbmQoIHRoaXMgKTtcbiAgICBpZiAoIHRoaXMud2lsbEFwcGx5VHJhbnNmb3JtcyApIHtcbiAgICAgIHRoaXMubm9kZS50cmFuc2Zvcm1FbWl0dGVyLmFkZExpc3RlbmVyKCB0aGlzLnRyYW5zZm9ybURpcnR5TGlzdGVuZXIgKTtcbiAgICB9XG5cbiAgICAvLyBAcHJpdmF0ZSB7Ym9vbGVhbn1cbiAgICB0aGlzLmZpbHRlckRpcnR5ID0gdHJ1ZTtcbiAgICB0aGlzLnZpc2liaWxpdHlEaXJ0eSA9IHRydWU7XG4gICAgdGhpcy5jbGlwRGlydHkgPSB0cnVlO1xuXG4gICAgLy8gQHByaXZhdGUge1NWR0ZpbHRlckVsZW1lbnR8bnVsbH0gLSBsYXppbHkgY3JlYXRlZFxuICAgIHRoaXMuZmlsdGVyRWxlbWVudCA9IHRoaXMuZmlsdGVyRWxlbWVudCB8fCBudWxsO1xuXG4gICAgLy8gQHByaXZhdGUge2Jvb2xlYW59IC0gV2hldGhlciB3ZSBoYXZlIGFuIG9wYWNpdHkgYXR0cmlidXRlIHNldCBvbiBvdXIgU1ZHIGVsZW1lbnQgKHBlcnNpc3RzIGFjcm9zcyBkaXNwb3NhbClcbiAgICB0aGlzLmhhc09wYWNpdHkgPSB0aGlzLmhhc09wYWNpdHkgIT09IHVuZGVmaW5lZCA/IHRoaXMuaGFzT3BhY2l0eSA6IGZhbHNlO1xuXG4gICAgLy8gQHByaXZhdGUge2Jvb2xlYW59IC0gV2hldGhlciB3ZSBoYXZlIGEgZmlsdGVyIGVsZW1lbnQgY29ubmVjdGVkIHRvIG91ciBibG9jayAoYW5kIHRoYXQgaXMgYmVpbmcgdXNlZCB3aXRoIGEgZmlsdGVyXG4gICAgLy8gYXR0cmlidXRlKS4gU2luY2UgdGhpcyBuZWVkcyB0byBiZSBjbGVhbmVkIHVwIHdoZW4gd2UgYXJlIGRpc3Bvc2VkLCB0aGlzIHdpbGwgYmUgc2V0IHRvIGZhbHNlIHdoZW4gZGlzcG9zZWRcbiAgICAvLyAod2l0aCB0aGUgYXNzb2NpYXRlZCBhdHRyaWJ1dGUgYW5kIGRlZnMgcmVmZXJlbmNlIGNsZWFuZWQgdXApLlxuICAgIHRoaXMuaGFzRmlsdGVyID0gZmFsc2U7XG5cbiAgICB0aGlzLmNsaXBEZWZpbml0aW9uID0gdGhpcy5jbGlwRGVmaW5pdGlvbiAhPT0gdW5kZWZpbmVkID8gdGhpcy5jbGlwRGVmaW5pdGlvbiA6IG51bGw7IC8vIHBlcnNpc3RzIGFjcm9zcyBkaXNwb3NhbFxuICAgIHRoaXMuY2xpcFBhdGggPSB0aGlzLmNsaXBQYXRoICE9PSB1bmRlZmluZWQgPyB0aGlzLmNsaXBQYXRoIDogbnVsbDsgLy8gcGVyc2lzdHMgYWNyb3NzIGRpc3Bvc2FsXG4gICAgdGhpcy5maWx0ZXJDaGFuZ2VMaXN0ZW5lciA9IHRoaXMuZmlsdGVyQ2hhbmdlTGlzdGVuZXIgfHwgdGhpcy5vbkZpbHRlckNoYW5nZS5iaW5kKCB0aGlzICk7XG4gICAgdGhpcy52aXNpYmlsaXR5RGlydHlMaXN0ZW5lciA9IHRoaXMudmlzaWJpbGl0eURpcnR5TGlzdGVuZXIgfHwgdGhpcy5vblZpc2libGVDaGFuZ2UuYmluZCggdGhpcyApO1xuICAgIHRoaXMuY2xpcERpcnR5TGlzdGVuZXIgPSB0aGlzLmNsaXBEaXJ0eUxpc3RlbmVyIHx8IHRoaXMub25DbGlwQ2hhbmdlLmJpbmQoIHRoaXMgKTtcbiAgICB0aGlzLm5vZGUudmlzaWJsZVByb3BlcnR5LmxhenlMaW5rKCB0aGlzLnZpc2liaWxpdHlEaXJ0eUxpc3RlbmVyICk7XG4gICAgaWYgKCB0aGlzLndpbGxBcHBseUZpbHRlcnMgKSB7XG4gICAgICB0aGlzLm5vZGUuZmlsdGVyQ2hhbmdlRW1pdHRlci5hZGRMaXN0ZW5lciggdGhpcy5maWx0ZXJDaGFuZ2VMaXN0ZW5lciApO1xuICAgIH1cbiAgICAvL09IVFdPIFRPRE86IHJlbW92ZSBjbGlwIHdvcmthcm91bmQgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3NjZW5lcnkvaXNzdWVzLzE1ODFcbiAgICB0aGlzLm5vZGUuY2xpcEFyZWFQcm9wZXJ0eS5sYXp5TGluayggdGhpcy5jbGlwRGlydHlMaXN0ZW5lciApO1xuXG4gICAgLy8gZm9yIHRyYWNraW5nIHRoZSBvcmRlciBvZiBjaGlsZCBncm91cHMsIHdlIHVzZSBhIGZsYWcgYW5kIHVwZGF0ZSAocmVvcmRlcikgb25jZSBwZXIgdXBkYXRlRGlzcGxheSBpZiBuZWNlc3NhcnkuXG4gICAgdGhpcy5vcmRlckRpcnR5ID0gdHJ1ZTtcbiAgICB0aGlzLm9yZGVyRGlydHlMaXN0ZW5lciA9IHRoaXMub3JkZXJEaXJ0eUxpc3RlbmVyIHx8IHRoaXMubWFya09yZGVyRGlydHkuYmluZCggdGhpcyApO1xuICAgIHRoaXMubm9kZS5jaGlsZHJlbkNoYW5nZWRFbWl0dGVyLmFkZExpc3RlbmVyKCB0aGlzLm9yZGVyRGlydHlMaXN0ZW5lciApO1xuXG4gICAgaWYgKCAhdGhpcy5zdmdHcm91cCApIHtcbiAgICAgIHRoaXMuc3ZnR3JvdXAgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMoIHN2Z25zLCAnZycgKTtcbiAgICB9XG5cbiAgICB0aGlzLmluc3RhbmNlLmFkZFNWR0dyb3VwKCB0aGlzICk7XG5cbiAgICB0aGlzLmJsb2NrLm1hcmtEaXJ0eUdyb3VwKCB0aGlzICk7IC8vIHNvIHdlIGFyZSBtYXJrZWQgYW5kIHVwZGF0ZWQgcHJvcGVybHlcbiAgfVxuXG4gIC8qKlxuICAgKiBAcHJpdmF0ZVxuICAgKlxuICAgKiBAcGFyYW0ge1NlbGZEcmF3YWJsZX0gZHJhd2FibGVcbiAgICovXG4gIGFkZFNlbGZEcmF3YWJsZSggZHJhd2FibGUgKSB7XG4gICAgdGhpcy5zZWxmRHJhd2FibGUgPSBkcmF3YWJsZTtcbiAgICB0aGlzLnN2Z0dyb3VwLmluc2VydEJlZm9yZSggZHJhd2FibGUuc3ZnRWxlbWVudCwgdGhpcy5jaGlsZHJlbi5sZW5ndGggPyB0aGlzLmNoaWxkcmVuWyAwIF0uc3ZnR3JvdXAgOiBudWxsICk7XG4gICAgdGhpcy5oYXNTZWxmRHJhd2FibGUgPSB0cnVlO1xuICB9XG5cbiAgLyoqXG4gICAqIEBwcml2YXRlXG4gICAqXG4gICAqIEBwYXJhbSB7U2VsZkRyYXdhYmxlfSBkcmF3YWJsZVxuICAgKi9cbiAgcmVtb3ZlU2VsZkRyYXdhYmxlKCBkcmF3YWJsZSApIHtcbiAgICB0aGlzLmhhc1NlbGZEcmF3YWJsZSA9IGZhbHNlO1xuICAgIHRoaXMuc3ZnR3JvdXAucmVtb3ZlQ2hpbGQoIGRyYXdhYmxlLnN2Z0VsZW1lbnQgKTtcbiAgICB0aGlzLnNlbGZEcmF3YWJsZSA9IG51bGw7XG4gIH1cblxuICAvKipcbiAgICogQHByaXZhdGVcbiAgICpcbiAgICogQHBhcmFtIHtTVkdHcm91cH0gZ3JvdXBcbiAgICovXG4gIGFkZENoaWxkR3JvdXAoIGdyb3VwICkge1xuICAgIHRoaXMubWFya09yZGVyRGlydHkoKTtcblxuICAgIGdyb3VwLnBhcmVudCA9IHRoaXM7XG4gICAgdGhpcy5jaGlsZHJlbi5wdXNoKCBncm91cCApO1xuICAgIHRoaXMuc3ZnR3JvdXAuYXBwZW5kQ2hpbGQoIGdyb3VwLnN2Z0dyb3VwICk7XG4gIH1cblxuICAvKipcbiAgICogQHByaXZhdGVcbiAgICpcbiAgICogQHBhcmFtIHtTVkdHcm91cH0gZ3JvdXBcbiAgICovXG4gIHJlbW92ZUNoaWxkR3JvdXAoIGdyb3VwICkge1xuICAgIHRoaXMubWFya09yZGVyRGlydHkoKTtcblxuICAgIGdyb3VwLnBhcmVudCA9IG51bGw7XG4gICAgdGhpcy5jaGlsZHJlbi5zcGxpY2UoIF8uaW5kZXhPZiggdGhpcy5jaGlsZHJlbiwgZ3JvdXAgKSwgMSApO1xuICAgIHRoaXMuc3ZnR3JvdXAucmVtb3ZlQ2hpbGQoIGdyb3VwLnN2Z0dyb3VwICk7XG4gIH1cblxuICAvKipcbiAgICogQHB1YmxpY1xuICAgKi9cbiAgbWFya0RpcnR5KCkge1xuICAgIGlmICggIXRoaXMuZGlydHkgKSB7XG4gICAgICB0aGlzLmRpcnR5ID0gdHJ1ZTtcblxuICAgICAgdGhpcy5ibG9jay5tYXJrRGlydHlHcm91cCggdGhpcyApO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBAcHVibGljXG4gICAqL1xuICBtYXJrT3JkZXJEaXJ0eSgpIHtcbiAgICBpZiAoICF0aGlzLm9yZGVyRGlydHkgKSB7XG4gICAgICB0aGlzLm9yZGVyRGlydHkgPSB0cnVlO1xuICAgICAgdGhpcy5tYXJrRGlydHkoKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQHB1YmxpY1xuICAgKi9cbiAgbWFya1RyYW5zZm9ybURpcnR5KCkge1xuICAgIGlmICggIXRoaXMudHJhbnNmb3JtRGlydHkgKSB7XG4gICAgICB0aGlzLnRyYW5zZm9ybURpcnR5ID0gdHJ1ZTtcbiAgICAgIHRoaXMubWFya0RpcnR5KCk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBvbkZpbHRlckNoYW5nZSgpIHtcbiAgICBpZiAoICF0aGlzLmZpbHRlckRpcnR5ICkge1xuICAgICAgdGhpcy5maWx0ZXJEaXJ0eSA9IHRydWU7XG4gICAgICB0aGlzLm1hcmtEaXJ0eSgpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgb25WaXNpYmxlQ2hhbmdlKCkge1xuICAgIGlmICggIXRoaXMudmlzaWJpbGl0eURpcnR5ICkge1xuICAgICAgdGhpcy52aXNpYmlsaXR5RGlydHkgPSB0cnVlO1xuICAgICAgdGhpcy5tYXJrRGlydHkoKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQHByaXZhdGVcbiAgICovXG4gIG9uQ2xpcENoYW5nZSgpIHtcbiAgICBpZiAoICF0aGlzLmNsaXBEaXJ0eSApIHtcbiAgICAgIHRoaXMuY2xpcERpcnR5ID0gdHJ1ZTtcbiAgICAgIHRoaXMubWFya0RpcnR5KCk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEBwdWJsaWNcbiAgICovXG4gIHVwZGF0ZSgpIHtcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuU1ZHR3JvdXAgJiYgc2NlbmVyeUxvZy5TVkdHcm91cCggYHVwZGF0ZTogJHt0aGlzLnRvU3RyaW5nKCl9YCApO1xuXG4gICAgLy8gd2UgbWF5IGhhdmUgYmVlbiBkaXNwb3NlZCBzaW5jZSBiZWluZyBtYXJrZWQgZGlydHkgb24gb3VyIGJsb2NrLiB3ZSB3b24ndCBoYXZlIGEgcmVmZXJlbmNlIGlmIHdlIGFyZSBkaXNwb3NlZFxuICAgIGlmICggIXRoaXMuYmxvY2sgKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLlNWR0dyb3VwICYmIHNjZW5lcnlMb2cucHVzaCgpO1xuXG4gICAgY29uc3Qgc3ZnR3JvdXAgPSB0aGlzLnN2Z0dyb3VwO1xuXG4gICAgdGhpcy5kaXJ0eSA9IGZhbHNlO1xuXG4gICAgaWYgKCB0aGlzLnRyYW5zZm9ybURpcnR5ICkge1xuICAgICAgdGhpcy50cmFuc2Zvcm1EaXJ0eSA9IGZhbHNlO1xuXG4gICAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuU1ZHR3JvdXAgJiYgc2NlbmVyeUxvZy5TVkdHcm91cCggYHRyYW5zZm9ybSB1cGRhdGU6ICR7dGhpcy50b1N0cmluZygpfWAgKTtcblxuICAgICAgaWYgKCB0aGlzLndpbGxBcHBseVRyYW5zZm9ybXMgKSB7XG5cbiAgICAgICAgY29uc3QgaXNJZGVudGl0eSA9IHRoaXMubm9kZS50cmFuc2Zvcm0uaXNJZGVudGl0eSgpO1xuXG4gICAgICAgIGlmICggIWlzSWRlbnRpdHkgKSB7XG4gICAgICAgICAgdGhpcy5oYXNUcmFuc2Zvcm0gPSB0cnVlO1xuICAgICAgICAgIHN2Z0dyb3VwLnNldEF0dHJpYnV0ZSggJ3RyYW5zZm9ybScsIHRoaXMubm9kZS50cmFuc2Zvcm0uZ2V0TWF0cml4KCkuZ2V0U1ZHVHJhbnNmb3JtKCkgKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmICggdGhpcy5oYXNUcmFuc2Zvcm0gKSB7XG4gICAgICAgICAgdGhpcy5oYXNUcmFuc2Zvcm0gPSBmYWxzZTtcbiAgICAgICAgICBzdmdHcm91cC5yZW1vdmVBdHRyaWJ1dGUoICd0cmFuc2Zvcm0nICk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGVsc2Uge1xuICAgICAgICAvLyB3ZSB3YW50IG5vIHRyYW5zZm9ybXMgaWYgd2Ugd29uJ3QgYmUgYXBwbHlpbmcgdHJhbnNmb3Jtc1xuICAgICAgICBpZiAoIHRoaXMuaGFzVHJhbnNmb3JtICkge1xuICAgICAgICAgIHRoaXMuaGFzVHJhbnNmb3JtID0gZmFsc2U7XG4gICAgICAgICAgc3ZnR3JvdXAucmVtb3ZlQXR0cmlidXRlKCAndHJhbnNmb3JtJyApO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKCB0aGlzLnZpc2liaWxpdHlEaXJ0eSApIHtcbiAgICAgIHRoaXMudmlzaWJpbGl0eURpcnR5ID0gZmFsc2U7XG5cbiAgICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5TVkdHcm91cCAmJiBzY2VuZXJ5TG9nLlNWR0dyb3VwKCBgdmlzaWJpbGl0eSB1cGRhdGU6ICR7dGhpcy50b1N0cmluZygpfWAgKTtcblxuICAgICAgc3ZnR3JvdXAuc3R5bGUuZGlzcGxheSA9IHRoaXMubm9kZS5pc1Zpc2libGUoKSA/ICcnIDogJ25vbmUnO1xuICAgIH1cblxuICAgIC8vIFRPRE86IENoZWNrIGlmIHdlIGNhbiBsZWF2ZSBvcGFjaXR5IHNlcGFyYXRlLiBJZiBpdCBnZXRzIGFwcGxpZWQgXCJhZnRlclwiIHRoZW4gd2UgY2FuIGhhdmUgdGhlbSBzZXBhcmF0ZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvc2NlbmVyeS9pc3N1ZXMvMTU4MVxuICAgIGlmICggdGhpcy5maWx0ZXJEaXJ0eSApIHtcbiAgICAgIHRoaXMuZmlsdGVyRGlydHkgPSBmYWxzZTtcblxuICAgICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLlNWR0dyb3VwICYmIHNjZW5lcnlMb2cuU1ZHR3JvdXAoIGBmaWx0ZXIgdXBkYXRlOiAke3RoaXMudG9TdHJpbmcoKX1gICk7XG5cbiAgICAgIGNvbnN0IG9wYWNpdHkgPSB0aGlzLm5vZGUuZWZmZWN0aXZlT3BhY2l0eTtcbiAgICAgIGlmICggdGhpcy53aWxsQXBwbHlGaWx0ZXJzICYmIG9wYWNpdHkgIT09IDEgKSB7XG4gICAgICAgIHRoaXMuaGFzT3BhY2l0eSA9IHRydWU7XG4gICAgICAgIHN2Z0dyb3VwLnNldEF0dHJpYnV0ZSggJ29wYWNpdHknLCBvcGFjaXR5ICk7XG4gICAgICB9XG4gICAgICBlbHNlIGlmICggdGhpcy5oYXNPcGFjaXR5ICkge1xuICAgICAgICB0aGlzLmhhc09wYWNpdHkgPSBmYWxzZTtcbiAgICAgICAgc3ZnR3JvdXAucmVtb3ZlQXR0cmlidXRlKCAnb3BhY2l0eScgKTtcbiAgICAgIH1cblxuICAgICAgY29uc3QgbmVlZHNGaWx0ZXIgPSB0aGlzLndpbGxBcHBseUZpbHRlcnMgJiYgdGhpcy5ub2RlLl9maWx0ZXJzLmxlbmd0aDtcbiAgICAgIGNvbnN0IGZpbHRlcklkID0gYGZpbHRlci0ke3RoaXMuaWR9YDtcblxuICAgICAgaWYgKCBuZWVkc0ZpbHRlciApIHtcbiAgICAgICAgLy8gTGF6eSBjcmVhdGlvbiBvZiB0aGUgZmlsdGVyIGVsZW1lbnQgKGlmIHdlIGhhdmVuJ3QgYWxyZWFkeSlcbiAgICAgICAgaWYgKCAhdGhpcy5maWx0ZXJFbGVtZW50ICkge1xuICAgICAgICAgIHRoaXMuZmlsdGVyRWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUyggc3ZnbnMsICdmaWx0ZXInICk7XG4gICAgICAgICAgdGhpcy5maWx0ZXJFbGVtZW50LnNldEF0dHJpYnV0ZSggJ2lkJywgZmlsdGVySWQgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFJlbW92ZSBhbGwgY2hpbGRyZW4gb2YgdGhlIGZpbHRlciBlbGVtZW50IGlmIHdlJ3JlIGFwcGx5aW5nIGZpbHRlcnMgKGlmIG5vdCwgd2Ugd29uJ3QgaGF2ZSBpdCBhdHRhY2hlZClcbiAgICAgICAgd2hpbGUgKCB0aGlzLmZpbHRlckVsZW1lbnQuZmlyc3RDaGlsZCApIHtcbiAgICAgICAgICB0aGlzLmZpbHRlckVsZW1lbnQucmVtb3ZlQ2hpbGQoIHRoaXMuZmlsdGVyRWxlbWVudC5sYXN0Q2hpbGQgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIEZpbGwgaW4gZWxlbWVudHMgaW50byBvdXIgZmlsdGVyXG4gICAgICAgIGxldCBmaWx0ZXJSZWdpb25QZXJjZW50YWdlSW5jcmVhc2UgPSA1MDtcbiAgICAgICAgbGV0IGluTmFtZSA9ICdTb3VyY2VHcmFwaGljJztcbiAgICAgICAgY29uc3QgbGVuZ3RoID0gdGhpcy5ub2RlLl9maWx0ZXJzLmxlbmd0aDtcbiAgICAgICAgZm9yICggbGV0IGkgPSAwOyBpIDwgbGVuZ3RoOyBpKysgKSB7XG4gICAgICAgICAgY29uc3QgZmlsdGVyID0gdGhpcy5ub2RlLl9maWx0ZXJzWyBpIF07XG5cbiAgICAgICAgICBjb25zdCByZXN1bHROYW1lID0gaSA9PT0gbGVuZ3RoIC0gMSA/IHVuZGVmaW5lZCA6IGBlJHtpfWA7IC8vIExhc3QgcmVzdWx0IHNob3VsZCBiZSB1bmRlZmluZWRcbiAgICAgICAgICBmaWx0ZXIuYXBwbHlTVkdGaWx0ZXIoIHRoaXMuZmlsdGVyRWxlbWVudCwgaW5OYW1lLCByZXN1bHROYW1lICk7XG4gICAgICAgICAgZmlsdGVyUmVnaW9uUGVyY2VudGFnZUluY3JlYXNlICs9IGZpbHRlci5maWx0ZXJSZWdpb25QZXJjZW50YWdlSW5jcmVhc2U7XG4gICAgICAgICAgaW5OYW1lID0gcmVzdWx0TmFtZTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIEJsZWgsIG5vIGdvb2Qgd2F5IHRvIGhhbmRsZSB0aGUgZmlsdGVyIHJlZ2lvbj8gaHR0cHM6Ly9kcmFmdHMuZnh0Zi5vcmcvZmlsdGVyLWVmZmVjdHMvI2ZpbHRlci1yZWdpb25cbiAgICAgICAgLy8gSWYgd2UgV0FOVCB0byB0cmFjayB0aGluZ3MgYnkgdGhlaXIgYWN0dWFsIGRpc3BsYXkgc2l6ZSBBTkQgcGFkIHBpeGVscywgQU5EIGNvcHkgdG9ucyBvZiB0aGluZ3MuLi4gd2UgY291bGRcbiAgICAgICAgLy8gcG90ZW50aWFsbHkgdXNlIHRoZSB1c2VyU3BhY2VPblVzZSBhbmQgcGFkIHRoZSBwcm9wZXIgbnVtYmVyIG9mIHBpeGVscy4gVGhhdCBzb3VuZHMgbGlrZSBhbiBhYnNvbHV0ZSBwYWluLCBBTkRcbiAgICAgICAgLy8gYSBwZXJmb3JtYW5jZSBkcmFpbiBhbmQgYWJzdHJhY3Rpb24gYnJlYWsuXG4gICAgICAgIGNvbnN0IG1pbiA9IGAtJHt0b1NWR051bWJlciggZmlsdGVyUmVnaW9uUGVyY2VudGFnZUluY3JlYXNlICl9JWA7XG4gICAgICAgIGNvbnN0IHNpemUgPSBgJHt0b1NWR051bWJlciggMiAqIGZpbHRlclJlZ2lvblBlcmNlbnRhZ2VJbmNyZWFzZSArIDEwMCApfSVgO1xuICAgICAgICB0aGlzLmZpbHRlckVsZW1lbnQuc2V0QXR0cmlidXRlKCAneCcsIG1pbiApO1xuICAgICAgICB0aGlzLmZpbHRlckVsZW1lbnQuc2V0QXR0cmlidXRlKCAneScsIG1pbiApO1xuICAgICAgICB0aGlzLmZpbHRlckVsZW1lbnQuc2V0QXR0cmlidXRlKCAnd2lkdGgnLCBzaXplICk7XG4gICAgICAgIHRoaXMuZmlsdGVyRWxlbWVudC5zZXRBdHRyaWJ1dGUoICdoZWlnaHQnLCBzaXplICk7XG4gICAgICB9XG5cbiAgICAgIGlmICggbmVlZHNGaWx0ZXIgKSB7XG4gICAgICAgIGlmICggIXRoaXMuaGFzRmlsdGVyICkge1xuICAgICAgICAgIHRoaXMuYmxvY2suZGVmcy5hcHBlbmRDaGlsZCggdGhpcy5maWx0ZXJFbGVtZW50ICk7XG4gICAgICAgIH1cbiAgICAgICAgc3ZnR3JvdXAuc2V0QXR0cmlidXRlKCAnZmlsdGVyJywgYHVybCgjJHtmaWx0ZXJJZH0pYCApO1xuICAgICAgICB0aGlzLmhhc0ZpbHRlciA9IHRydWU7XG4gICAgICB9XG4gICAgICBpZiAoIHRoaXMuaGFzRmlsdGVyICYmICFuZWVkc0ZpbHRlciApIHtcbiAgICAgICAgc3ZnR3JvdXAucmVtb3ZlQXR0cmlidXRlKCAnZmlsdGVyJyApO1xuICAgICAgICB0aGlzLmhhc0ZpbHRlciA9IGZhbHNlO1xuICAgICAgICB0aGlzLmJsb2NrLmRlZnMucmVtb3ZlQ2hpbGQoIHRoaXMuZmlsdGVyRWxlbWVudCApO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmICggdGhpcy5jbGlwRGlydHkgKSB7XG4gICAgICB0aGlzLmNsaXBEaXJ0eSA9IGZhbHNlO1xuXG4gICAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuU1ZHR3JvdXAgJiYgc2NlbmVyeUxvZy5TVkdHcm91cCggYGNsaXAgdXBkYXRlOiAke3RoaXMudG9TdHJpbmcoKX1gICk7XG5cbiAgICAgIC8vT0hUV08gVE9ETzogcmVtb3ZlIGNsaXAgd29ya2Fyb3VuZCAodXNlIHRoaXMud2lsbEFwcGx5RmlsdGVycykgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3NjZW5lcnkvaXNzdWVzLzE1ODFcbiAgICAgIGlmICggdGhpcy5ub2RlLmNsaXBBcmVhICkge1xuICAgICAgICBpZiAoICF0aGlzLmNsaXBEZWZpbml0aW9uICkge1xuICAgICAgICAgIC8vIFVzZSBtb25vdG9uaWNhbGx5LWluY3JlYXNpbmcgYW5kIHVuaXF1ZSBjbGlwIElEcywgc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9mYXJhZGF5cy1lbGVjdHJvbWFnbmV0aWMtbGFiL2lzc3Vlcy84OVxuICAgICAgICAgIC8vIFRoZXJlIGlzIG5vIGNvbm5lY3Rpb24gbmVjZXNzYXJpbHkgdG8gdGhlIG5vZGUsIGVzcGVjaWFsbHksIHNpbmNlIHdlIGNhbiBoYXZlIGRpZmZlcmVudCBTVkcgcmVwcmVzZW50YXRpb25zXG4gICAgICAgICAgLy8gb2YgYSBub2RlLCBBTkQgd2UgcG9vbCB0aGUgU1ZHR3JvdXBzLlxuICAgICAgICAgIGNvbnN0IGNsaXBJZCA9IGBjbGlwJHtjbGlwR2xvYmFsSWQrK31gO1xuXG4gICAgICAgICAgdGhpcy5jbGlwRGVmaW5pdGlvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUyggc3ZnbnMsICdjbGlwUGF0aCcgKTtcbiAgICAgICAgICB0aGlzLmNsaXBEZWZpbml0aW9uLnNldEF0dHJpYnV0ZSggJ2lkJywgY2xpcElkICk7XG4gICAgICAgICAgdGhpcy5jbGlwRGVmaW5pdGlvbi5zZXRBdHRyaWJ1dGUoICdjbGlwUGF0aFVuaXRzJywgJ3VzZXJTcGFjZU9uVXNlJyApO1xuICAgICAgICAgIHRoaXMuYmxvY2suZGVmcy5hcHBlbmRDaGlsZCggdGhpcy5jbGlwRGVmaW5pdGlvbiApOyAvLyBUT0RPOiBtZXRob2Q/IGV2YWx1YXRlIHdpdGggZnV0dXJlIHVzYWdlIG9mIGRlZnMgKG5vdCBkb25lIHlldCkgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3NjZW5lcnkvaXNzdWVzLzE1ODFcblxuICAgICAgICAgIHRoaXMuY2xpcFBhdGggPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMoIHN2Z25zLCAncGF0aCcgKTtcbiAgICAgICAgICB0aGlzLmNsaXBEZWZpbml0aW9uLmFwcGVuZENoaWxkKCB0aGlzLmNsaXBQYXRoICk7XG5cbiAgICAgICAgICBzdmdHcm91cC5zZXRBdHRyaWJ1dGUoICdjbGlwLXBhdGgnLCBgdXJsKCMke2NsaXBJZH0pYCApO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5jbGlwUGF0aC5zZXRBdHRyaWJ1dGUoICdkJywgdGhpcy5ub2RlLmNsaXBBcmVhLmdldFNWR1BhdGgoKSApO1xuICAgICAgfVxuICAgICAgZWxzZSBpZiAoIHRoaXMuY2xpcERlZmluaXRpb24gKSB7XG4gICAgICAgIHN2Z0dyb3VwLnJlbW92ZUF0dHJpYnV0ZSggJ2NsaXAtcGF0aCcgKTtcbiAgICAgICAgdGhpcy5ibG9jay5kZWZzLnJlbW92ZUNoaWxkKCB0aGlzLmNsaXBEZWZpbml0aW9uICk7IC8vIFRPRE86IG1ldGhvZD8gZXZhbHVhdGUgd2l0aCBmdXR1cmUgdXNhZ2Ugb2YgZGVmcyAobm90IGRvbmUgeWV0KSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvc2NlbmVyeS9pc3N1ZXMvMTU4MVxuXG4gICAgICAgIC8vIFRPRE86IGNvbnNpZGVyIHBvb2xpbmcgdGhlc2U/IGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9zY2VuZXJ5L2lzc3Vlcy8xNTgxXG4gICAgICAgIHRoaXMuY2xpcERlZmluaXRpb24gPSBudWxsO1xuICAgICAgICB0aGlzLmNsaXBQYXRoID0gbnVsbDtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoIHRoaXMub3JkZXJEaXJ0eSApIHtcbiAgICAgIHRoaXMub3JkZXJEaXJ0eSA9IGZhbHNlO1xuXG4gICAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuU1ZHR3JvdXAgJiYgc2NlbmVyeUxvZy5TVkdHcm91cCggYG9yZGVyIHVwZGF0ZTogJHt0aGlzLnRvU3RyaW5nKCl9YCApO1xuICAgICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLlNWR0dyb3VwICYmIHNjZW5lcnlMb2cucHVzaCgpO1xuXG4gICAgICAvLyBvdXIgaW5zdGFuY2Ugc2hvdWxkIGhhdmUgdGhlIHByb3BlciBvcmRlciBvZiBjaGlsZHJlbi4gd2UgY2hlY2sgdGhhdCB3YXkuXG4gICAgICBsZXQgaWR4ID0gdGhpcy5jaGlsZHJlbi5sZW5ndGggLSAxO1xuICAgICAgY29uc3QgaW5zdGFuY2VDaGlsZHJlbiA9IHRoaXMuaW5zdGFuY2UuY2hpbGRyZW47XG4gICAgICAvLyBpdGVyYXRlIGJhY2t3YXJkcywgc2luY2UgRE9NJ3MgaW5zZXJ0QmVmb3JlIG1ha2VzIGZvcndhcmQgaXRlcmF0aW9uIG1vcmUgY29tcGxpY2F0ZWQgKG5vIGluc2VydEFmdGVyKVxuICAgICAgZm9yICggbGV0IGkgPSBpbnN0YW5jZUNoaWxkcmVuLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tICkge1xuICAgICAgICBjb25zdCBncm91cCA9IGluc3RhbmNlQ2hpbGRyZW5bIGkgXS5sb29rdXBTVkdHcm91cCggdGhpcy5ibG9jayApO1xuICAgICAgICBpZiAoIGdyb3VwICkge1xuICAgICAgICAgIC8vIGVuc3VyZSB0aGF0IHRoZSBzcG90IGluIG91ciBhcnJheSAoYW5kIGluIHRoZSBET00pIGF0IFtpZHhdIGlzIGNvcnJlY3RcbiAgICAgICAgICBpZiAoIHRoaXMuY2hpbGRyZW5bIGlkeCBdICE9PSBncm91cCApIHtcbiAgICAgICAgICAgIC8vIG91dCBvZiBvcmRlciwgcmVhcnJhbmdlXG4gICAgICAgICAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuU1ZHR3JvdXAgJiYgc2NlbmVyeUxvZy5TVkdHcm91cCggYGdyb3VwIG91dCBvZiBvcmRlcjogJHtpZHh9IGZvciAke2dyb3VwLnRvU3RyaW5nKCl9YCApO1xuXG4gICAgICAgICAgICAvLyBpbiB0aGUgRE9NIGZpcnN0IChzaW5jZSB3ZSByZWZlcmVuY2UgdGhlIGNoaWxkcmVuIGFycmF5IHRvIGtub3cgd2hhdCB0byBpbnNlcnRCZWZvcmUpXG4gICAgICAgICAgICAvLyBzZWUgaHR0cDovL3N0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy85NzMyNjI0L2hvdy10by1zd2FwLWRvbS1jaGlsZC1ub2Rlcy1pbi1qYXZhc2NyaXB0XG4gICAgICAgICAgICBzdmdHcm91cC5pbnNlcnRCZWZvcmUoIGdyb3VwLnN2Z0dyb3VwLCBpZHggKyAxID49IHRoaXMuY2hpbGRyZW4ubGVuZ3RoID8gbnVsbCA6IHRoaXMuY2hpbGRyZW5bIGlkeCArIDEgXS5zdmdHcm91cCApO1xuXG4gICAgICAgICAgICAvLyB0aGVuIGluIG91ciBjaGlsZHJlbiBhcnJheVxuICAgICAgICAgICAgY29uc3Qgb2xkSW5kZXggPSBfLmluZGV4T2YoIHRoaXMuY2hpbGRyZW4sIGdyb3VwICk7XG4gICAgICAgICAgICBhc3NlcnQgJiYgYXNzZXJ0KCBvbGRJbmRleCA8IGlkeCwgJ1RoZSBpdGVtIHdlIGFyZSBtb3ZpbmcgYmFja3dhcmRzIHRvIGxvY2F0aW9uIFtpZHhdIHNob3VsZCBub3QgaGF2ZSBhbiBpbmRleCBncmVhdGVyIHRoYW4gdGhhdCcgKTtcbiAgICAgICAgICAgIHRoaXMuY2hpbGRyZW4uc3BsaWNlKCBvbGRJbmRleCwgMSApO1xuICAgICAgICAgICAgdGhpcy5jaGlsZHJlbi5zcGxpY2UoIGlkeCwgMCwgZ3JvdXAgKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuU1ZHR3JvdXAgJiYgc2NlbmVyeUxvZy5TVkdHcm91cCggYGdyb3VwIGluIHBsYWNlOiAke2lkeH0gZm9yICR7Z3JvdXAudG9TdHJpbmcoKX1gICk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8gaWYgdGhlcmUgd2FzIGEgZ3JvdXAgZm9yIHRoYXQgaW5zdGFuY2UsIHdlIG1vdmUgb24gdG8gdGhlIG5leHQgc3BvdFxuICAgICAgICAgIGlkeC0tO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5TVkdHcm91cCAmJiBzY2VuZXJ5TG9nLnBvcCgpO1xuICAgIH1cblxuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5TVkdHcm91cCAmJiBzY2VuZXJ5TG9nLnBvcCgpO1xuICB9XG5cbiAgLyoqXG4gICAqIEBwcml2YXRlXG4gICAqXG4gICAqIEByZXR1cm5zIHtib29sZWFufVxuICAgKi9cbiAgaXNSZWxlYXNhYmxlKCkge1xuICAgIC8vIGlmIHdlIGhhdmUgbm8gcGFyZW50LCB3ZSBhcmUgdGhlIHJvb3RHcm91cCAodGhlIGJsb2NrIGlzIHJlc3BvbnNpYmxlIGZvciBkaXNwb3NpbmcgdGhhdCBvbmUpXG4gICAgcmV0dXJuICF0aGlzLmhhc1NlbGZEcmF3YWJsZSAmJiAhdGhpcy5jaGlsZHJlbi5sZW5ndGggJiYgdGhpcy5wYXJlbnQ7XG4gIH1cblxuICAvKipcbiAgICogUmVsZWFzZXMgcmVmZXJlbmNlc1xuICAgKiBAcHVibGljXG4gICAqL1xuICBkaXNwb3NlKCkge1xuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5TVkdHcm91cCAmJiBzY2VuZXJ5TG9nLlNWR0dyb3VwKCBgZGlzcG9zZSAke3RoaXMudG9TdHJpbmcoKX1gICk7XG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLlNWR0dyb3VwICYmIHNjZW5lcnlMb2cucHVzaCgpO1xuXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdGhpcy5jaGlsZHJlbi5sZW5ndGggPT09IDAsICdTaG91bGQgYmUgZW1wdHkgYnkgbm93JyApO1xuXG4gICAgaWYgKCB0aGlzLmhhc0ZpbHRlciApIHtcbiAgICAgIHRoaXMuc3ZnR3JvdXAucmVtb3ZlQXR0cmlidXRlKCAnZmlsdGVyJyApO1xuICAgICAgdGhpcy5oYXNGaWx0ZXIgPSBmYWxzZTtcbiAgICAgIHRoaXMuYmxvY2suZGVmcy5yZW1vdmVDaGlsZCggdGhpcy5maWx0ZXJFbGVtZW50ICk7XG4gICAgfVxuXG4gICAgaWYgKCB0aGlzLndpbGxBcHBseVRyYW5zZm9ybXMgKSB7XG4gICAgICB0aGlzLm5vZGUudHJhbnNmb3JtRW1pdHRlci5yZW1vdmVMaXN0ZW5lciggdGhpcy50cmFuc2Zvcm1EaXJ0eUxpc3RlbmVyICk7XG4gICAgfVxuICAgIHRoaXMubm9kZS52aXNpYmxlUHJvcGVydHkudW5saW5rKCB0aGlzLnZpc2liaWxpdHlEaXJ0eUxpc3RlbmVyICk7XG4gICAgaWYgKCB0aGlzLndpbGxBcHBseUZpbHRlcnMgKSB7XG4gICAgICB0aGlzLm5vZGUuZmlsdGVyQ2hhbmdlRW1pdHRlci5yZW1vdmVMaXN0ZW5lciggdGhpcy5maWx0ZXJDaGFuZ2VMaXN0ZW5lciApO1xuICAgIH1cbiAgICAvL09IVFdPIFRPRE86IHJlbW92ZSBjbGlwIHdvcmthcm91bmQgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3NjZW5lcnkvaXNzdWVzLzE1ODFcbiAgICB0aGlzLm5vZGUuY2xpcEFyZWFQcm9wZXJ0eS51bmxpbmsoIHRoaXMuY2xpcERpcnR5TGlzdGVuZXIgKTtcblxuICAgIHRoaXMubm9kZS5jaGlsZHJlbkNoYW5nZWRFbWl0dGVyLnJlbW92ZUxpc3RlbmVyKCB0aGlzLm9yZGVyRGlydHlMaXN0ZW5lciApO1xuXG4gICAgLy8gaWYgb3VyIEluc3RhbmNlIGhhcyBiZWVuIGRpc3Bvc2VkLCBpdCBoYXMgYWxyZWFkeSBoYWQgdGhlIHJlZmVyZW5jZSByZW1vdmVkXG4gICAgaWYgKCB0aGlzLmluc3RhbmNlLmFjdGl2ZSApIHtcbiAgICAgIHRoaXMuaW5zdGFuY2UucmVtb3ZlU1ZHR3JvdXAoIHRoaXMgKTtcbiAgICB9XG5cbiAgICAvLyByZW1vdmUgY2xpcHBpbmcsIHNpbmNlIGl0IGlzIGRlZnMtYmFzZWQgKGFuZCB3ZSB3YW50IHRvIGtlZXAgb3VyIGRlZnMgYmxvY2sgY2xlYW4gLSBjb3VsZCBiZSBhbm90aGVyIGxheWVyISlcbiAgICBpZiAoIHRoaXMuY2xpcERlZmluaXRpb24gKSB7XG4gICAgICB0aGlzLnN2Z0dyb3VwLnJlbW92ZUF0dHJpYnV0ZSggJ2NsaXAtcGF0aCcgKTtcbiAgICAgIHRoaXMuYmxvY2suZGVmcy5yZW1vdmVDaGlsZCggdGhpcy5jbGlwRGVmaW5pdGlvbiApO1xuICAgICAgdGhpcy5jbGlwRGVmaW5pdGlvbiA9IG51bGw7XG4gICAgICB0aGlzLmNsaXBQYXRoID0gbnVsbDtcbiAgICB9XG5cbiAgICAvLyBjbGVhciByZWZlcmVuY2VzXG4gICAgdGhpcy5wYXJlbnQgPSBudWxsO1xuICAgIHRoaXMuYmxvY2sgPSBudWxsO1xuICAgIHRoaXMuaW5zdGFuY2UgPSBudWxsO1xuICAgIHRoaXMubm9kZSA9IG51bGw7XG4gICAgY2xlYW5BcnJheSggdGhpcy5jaGlsZHJlbiApO1xuICAgIHRoaXMuc2VsZkRyYXdhYmxlID0gbnVsbDtcblxuICAgIC8vIGZvciBub3dcbiAgICB0aGlzLmZyZWVUb1Bvb2woKTtcblxuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5TVkdHcm91cCAmJiBzY2VuZXJ5TG9nLnBvcCgpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgYSBzdHJpbmcgZm9ybSBvZiB0aGlzIG9iamVjdFxuICAgKiBAcHVibGljXG4gICAqXG4gICAqIEByZXR1cm5zIHtzdHJpbmd9XG4gICAqL1xuICB0b1N0cmluZygpIHtcbiAgICByZXR1cm4gYFNWR0dyb3VwOiR7dGhpcy5ibG9jay50b1N0cmluZygpfV8ke3RoaXMuaW5zdGFuY2UudG9TdHJpbmcoKX1gO1xuICB9XG5cbiAgLyoqXG4gICAqIEBwdWJsaWNcbiAgICpcbiAgICogQHBhcmFtIHtTVkdCbG9ja30gYmxvY2tcbiAgICogQHBhcmFtIHtEcmF3YWJsZX0gZHJhd2FibGVcbiAgICovXG4gIHN0YXRpYyBhZGREcmF3YWJsZSggYmxvY2ssIGRyYXdhYmxlICkge1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIGRyYXdhYmxlLmluc3RhbmNlLCAnSW5zdGFuY2UgaXMgcmVxdWlyZWQgZm9yIGEgZHJhd2FibGUgdG8gYmUgZ3JvdXBlZCBjb3JyZWN0bHkgaW4gU1ZHJyApO1xuXG4gICAgY29uc3QgZ3JvdXAgPSBTVkdHcm91cC5lbnN1cmVHcm91cHNUb0luc3RhbmNlKCBibG9jaywgZHJhd2FibGUuaW5zdGFuY2UgKTtcbiAgICBncm91cC5hZGRTZWxmRHJhd2FibGUoIGRyYXdhYmxlICk7XG4gIH1cblxuICAvKipcbiAgICogQHB1YmxpY1xuICAgKlxuICAgKiBAcGFyYW0ge1NWR0Jsb2NrfSBibG9ja1xuICAgKiBAcGFyYW0ge0RyYXdhYmxlfSBkcmF3YWJsZVxuICAgKi9cbiAgc3RhdGljIHJlbW92ZURyYXdhYmxlKCBibG9jaywgZHJhd2FibGUgKSB7XG4gICAgZHJhd2FibGUuaW5zdGFuY2UubG9va3VwU1ZHR3JvdXAoIGJsb2NrICkucmVtb3ZlU2VsZkRyYXdhYmxlKCBkcmF3YWJsZSApO1xuXG4gICAgU1ZHR3JvdXAucmVsZWFzZUdyb3Vwc1RvSW5zdGFuY2UoIGJsb2NrLCBkcmF3YWJsZS5pbnN0YW5jZSApO1xuICB9XG5cbiAgLyoqXG4gICAqIEBwcml2YXRlXG4gICAqXG4gICAqIEBwYXJhbSB7U1ZHQmxvY2t9IGJsb2NrXG4gICAqIEBwYXJhbSB7SW5zdGFuY2V9IGluc3RhbmNlXG4gICAqIEByZXR1cm5zIHtTVkdHcm91cH1cbiAgICovXG4gIHN0YXRpYyBlbnN1cmVHcm91cHNUb0luc3RhbmNlKCBibG9jaywgaW5zdGFuY2UgKSB7XG4gICAgLy8gVE9ETzogYXNzZXJ0aW9ucyBoZXJlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9zY2VuZXJ5L2lzc3Vlcy8xNTgxXG5cbiAgICBsZXQgZ3JvdXAgPSBpbnN0YW5jZS5sb29rdXBTVkdHcm91cCggYmxvY2sgKTtcblxuICAgIGlmICggIWdyb3VwICkge1xuICAgICAgYXNzZXJ0ICYmIGFzc2VydCggaW5zdGFuY2UgIT09IGJsb2NrLnJvb3RHcm91cC5pbnN0YW5jZSwgJ01ha2luZyBzdXJlIHdlIGRvIG5vdCB3YWxrIHBhc3Qgb3VyIHJvb3RHcm91cCcgKTtcblxuICAgICAgY29uc3QgcGFyZW50R3JvdXAgPSBTVkdHcm91cC5lbnN1cmVHcm91cHNUb0luc3RhbmNlKCBibG9jaywgaW5zdGFuY2UucGFyZW50ICk7XG5cbiAgICAgIGdyb3VwID0gU1ZHR3JvdXAuY3JlYXRlRnJvbVBvb2woIGJsb2NrLCBpbnN0YW5jZSwgcGFyZW50R3JvdXAgKTtcbiAgICAgIHBhcmVudEdyb3VwLmFkZENoaWxkR3JvdXAoIGdyb3VwICk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGdyb3VwO1xuICB9XG5cbiAgLyoqXG4gICAqIEBwcml2YXRlXG4gICAqXG4gICAqIEBwYXJhbSB7U1ZHQmxvY2t9IGJsb2NrXG4gICAqIEBwYXJhbSB7SW5zdGFuY2V9IGluc3RhbmNlXG4gICAqL1xuICBzdGF0aWMgcmVsZWFzZUdyb3Vwc1RvSW5zdGFuY2UoIGJsb2NrLCBpbnN0YW5jZSApIHtcbiAgICBjb25zdCBncm91cCA9IGluc3RhbmNlLmxvb2t1cFNWR0dyb3VwKCBibG9jayApO1xuXG4gICAgaWYgKCBncm91cC5pc1JlbGVhc2FibGUoKSApIHtcbiAgICAgIGNvbnN0IHBhcmVudEdyb3VwID0gZ3JvdXAucGFyZW50O1xuICAgICAgcGFyZW50R3JvdXAucmVtb3ZlQ2hpbGRHcm91cCggZ3JvdXAgKTtcblxuICAgICAgU1ZHR3JvdXAucmVsZWFzZUdyb3Vwc1RvSW5zdGFuY2UoIGJsb2NrLCBwYXJlbnRHcm91cC5pbnN0YW5jZSApO1xuXG4gICAgICBncm91cC5kaXNwb3NlKCk7XG4gICAgfVxuICB9XG59XG5cbnNjZW5lcnkucmVnaXN0ZXIoICdTVkdHcm91cCcsIFNWR0dyb3VwICk7XG5cblBvb2xhYmxlLm1peEludG8oIFNWR0dyb3VwICk7XG5cbmV4cG9ydCBkZWZhdWx0IFNWR0dyb3VwOyJdLCJuYW1lcyI6WyJ0b1NWR051bWJlciIsImNsZWFuQXJyYXkiLCJQb29sYWJsZSIsInNjZW5lcnkiLCJzdmducyIsImdsb2JhbElkIiwiY2xpcEdsb2JhbElkIiwiU1ZHR3JvdXAiLCJpbml0aWFsaXplIiwiYmxvY2siLCJpbnN0YW5jZSIsInBhcmVudCIsInNjZW5lcnlMb2ciLCJ0b1N0cmluZyIsIm5vZGUiLCJ0cmFpbCIsImxhc3ROb2RlIiwiY2hpbGRyZW4iLCJoYXNTZWxmRHJhd2FibGUiLCJzZWxmRHJhd2FibGUiLCJkaXJ0eSIsIndpbGxBcHBseVRyYW5zZm9ybXMiLCJ0cmFuc2Zvcm1Sb290SW5zdGFuY2UiLCJub2RlcyIsImxlbmd0aCIsIndpbGxBcHBseUZpbHRlcnMiLCJmaWx0ZXJSb290SW5zdGFuY2UiLCJ0cmFuc2Zvcm1EaXJ0eSIsImhhc1RyYW5zZm9ybSIsInVuZGVmaW5lZCIsInRyYW5zZm9ybURpcnR5TGlzdGVuZXIiLCJtYXJrVHJhbnNmb3JtRGlydHkiLCJiaW5kIiwidHJhbnNmb3JtRW1pdHRlciIsImFkZExpc3RlbmVyIiwiZmlsdGVyRGlydHkiLCJ2aXNpYmlsaXR5RGlydHkiLCJjbGlwRGlydHkiLCJmaWx0ZXJFbGVtZW50IiwiaGFzT3BhY2l0eSIsImhhc0ZpbHRlciIsImNsaXBEZWZpbml0aW9uIiwiY2xpcFBhdGgiLCJmaWx0ZXJDaGFuZ2VMaXN0ZW5lciIsIm9uRmlsdGVyQ2hhbmdlIiwidmlzaWJpbGl0eURpcnR5TGlzdGVuZXIiLCJvblZpc2libGVDaGFuZ2UiLCJjbGlwRGlydHlMaXN0ZW5lciIsIm9uQ2xpcENoYW5nZSIsInZpc2libGVQcm9wZXJ0eSIsImxhenlMaW5rIiwiZmlsdGVyQ2hhbmdlRW1pdHRlciIsImNsaXBBcmVhUHJvcGVydHkiLCJvcmRlckRpcnR5Iiwib3JkZXJEaXJ0eUxpc3RlbmVyIiwibWFya09yZGVyRGlydHkiLCJjaGlsZHJlbkNoYW5nZWRFbWl0dGVyIiwic3ZnR3JvdXAiLCJkb2N1bWVudCIsImNyZWF0ZUVsZW1lbnROUyIsImFkZFNWR0dyb3VwIiwibWFya0RpcnR5R3JvdXAiLCJhZGRTZWxmRHJhd2FibGUiLCJkcmF3YWJsZSIsImluc2VydEJlZm9yZSIsInN2Z0VsZW1lbnQiLCJyZW1vdmVTZWxmRHJhd2FibGUiLCJyZW1vdmVDaGlsZCIsImFkZENoaWxkR3JvdXAiLCJncm91cCIsInB1c2giLCJhcHBlbmRDaGlsZCIsInJlbW92ZUNoaWxkR3JvdXAiLCJzcGxpY2UiLCJfIiwiaW5kZXhPZiIsIm1hcmtEaXJ0eSIsInVwZGF0ZSIsImlzSWRlbnRpdHkiLCJ0cmFuc2Zvcm0iLCJzZXRBdHRyaWJ1dGUiLCJnZXRNYXRyaXgiLCJnZXRTVkdUcmFuc2Zvcm0iLCJyZW1vdmVBdHRyaWJ1dGUiLCJzdHlsZSIsImRpc3BsYXkiLCJpc1Zpc2libGUiLCJvcGFjaXR5IiwiZWZmZWN0aXZlT3BhY2l0eSIsIm5lZWRzRmlsdGVyIiwiX2ZpbHRlcnMiLCJmaWx0ZXJJZCIsImlkIiwiZmlyc3RDaGlsZCIsImxhc3RDaGlsZCIsImZpbHRlclJlZ2lvblBlcmNlbnRhZ2VJbmNyZWFzZSIsImluTmFtZSIsImkiLCJmaWx0ZXIiLCJyZXN1bHROYW1lIiwiYXBwbHlTVkdGaWx0ZXIiLCJtaW4iLCJzaXplIiwiZGVmcyIsImNsaXBBcmVhIiwiY2xpcElkIiwiZ2V0U1ZHUGF0aCIsImlkeCIsImluc3RhbmNlQ2hpbGRyZW4iLCJsb29rdXBTVkdHcm91cCIsIm9sZEluZGV4IiwiYXNzZXJ0IiwicG9wIiwiaXNSZWxlYXNhYmxlIiwiZGlzcG9zZSIsInJlbW92ZUxpc3RlbmVyIiwidW5saW5rIiwiYWN0aXZlIiwicmVtb3ZlU1ZHR3JvdXAiLCJmcmVlVG9Qb29sIiwiYWRkRHJhd2FibGUiLCJlbnN1cmVHcm91cHNUb0luc3RhbmNlIiwicmVtb3ZlRHJhd2FibGUiLCJyZWxlYXNlR3JvdXBzVG9JbnN0YW5jZSIsInJvb3RHcm91cCIsInBhcmVudEdyb3VwIiwiY3JlYXRlRnJvbVBvb2wiLCJjb25zdHJ1Y3RvciIsInJlZ2lzdGVyIiwibWl4SW50byJdLCJtYXBwaW5ncyI6IkFBQUEsc0RBQXNEO0FBRXREOzs7OztDQUtDLEdBRUQsT0FBT0EsaUJBQWlCLGlDQUFpQztBQUN6RCxPQUFPQyxnQkFBZ0Isc0NBQXNDO0FBQzdELE9BQU9DLGNBQWMsb0NBQW9DO0FBQ3pELFNBQVNDLE9BQU8sRUFBRUMsS0FBSyxRQUFRLGdCQUFnQjtBQUUvQyxJQUFJQyxXQUFXO0FBQ2YsSUFBSUMsZUFBZTtBQUVuQixJQUFBLEFBQU1DLFdBQU4sTUFBTUE7SUFlSjs7Ozs7O0dBTUMsR0FDREMsV0FBWUMsS0FBSyxFQUFFQyxRQUFRLEVBQUVDLE1BQU0sRUFBRztRQUNwQyw0TEFBNEw7UUFFNUxDLGNBQWNBLFdBQVdMLFFBQVEsSUFBSUssV0FBV0wsUUFBUSxDQUFFLENBQUMsYUFBYSxFQUFFLElBQUksQ0FBQ00sUUFBUSxJ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