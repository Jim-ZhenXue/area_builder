// Copyright 2014-2023, University of Colorado Boulder
/**
 * Abstract base type (and API) for stitching implementations. Stitching is:
 * A method of updating the blocks for a backbone (the changes from the previous frame to the current frame), and
 * setting up the drawables to be attached/detached from blocks. At a high level:
 *   - We have an ordered list of blocks displayed in the last frame.
 *   - We have an ordered list of drawables displayed in the last frame (and what block they are part of).
 *   - We have an ordered list of drawables that will be displayed in the next frame (and whether they were part of our
 *     backbone, and if so what block they were in).
 *   - We need to efficiently create/dispose required blocks, add/remove drawables from blocks, notify blocks of their
 *     drawable range, and ensure blocks are displayed back-to-front.
 *
 * Since stitching usually only involves one or a few small changes (except for on sim initialization), the stitch
 * method is provided with a list of intervals that were (potentially) changed. This consists of a linked-list of
 * intervals (it is constructed during recursion through a tree that skips known-unchanged subtrees). The intervals
 * are completely disjoint (don't overlap, and aren't adjacent - there is at least one drawable that is unchanged
 * in-between change intervals).
 *
 * Assumes the same object instance will be reused multiple times, possibly for different backbones.
 *
 * Any stitcher implementations should always call initialize() first and clean() at the end, so that we can set up
 * and then clean up any object references (allowing them to be garbage-collected or pooled more safely).
 *
 * Stitcher responsibilities:
 *   1. Blocks used in the previous frame but not used in the current frame (no drawables, not attached) should be
 *      marked for disposal.
 *   2. Blocks should be created as necessary.
 *   3. If a changed drawable is removed from a block, it should have notePendingRemoval called on it.
 *   4. If a changed drawable is added to a block, it should have notePendingAddition called on it.
 *   5. If an unchanged drawable is to have a block change, it should have notePendingMove called on it.
 *   6. New blocks should be added to the DOM (appendChild presumably)
 *   7. Removed blocks should be removed from the DOM (removeChild)
 *      NOTE: check for child-parent relationship, since DOM blocks (wrappers) may have been
 *      added to the DOM elsewhere in another backbone's stitch already (which in the DOM
 *      automatically removes it from our backbone's div)
 *   8. If a block's first or last drawable changes, it should have notifyInterval called on it.
 *   9. At the end of the stitch, the backbone should have a way of iterating over its blocks in order (preferably an
 *      Array for fast repaint iteration)
 *   10. New blocks should have setBlockBackbone( backbone ) called on them
 *   11. Blocks with any drawable change should have backbone.markDirtyDrawable( block ) called so it can be visited
 *       in the repaint phase.
 *   12. Blocks should have z-indices set in the proper stacking order (back to front), using backbone.reindexBlocks()
 *       or equivalent (it tries to change as few z-indices as possible).
 *
 * Stitcher desired behavior and optimizations:
 *   1. Reuse blocks of the same renderer type, instead of removing one and creating another.
 *   2. Minimize (as much as is possible) how many drawables are added and removed from blocks (try not to remove 1000
 *      drawables from A and add them to B if we could instead just add/remove 5 drawables from C to D)
 *   3. No more DOM manipulation than necessary
 *   4. Optimize first for "one or a few small change intervals" that only cause local changes (no blocks created,
 *      removed or reordered). It would be ideal to do this very quickly, so it could be done every frame in
 *      simulations.
 *
 * Current constraints:
 *   1. DOM drawables should be paired with exactly one block (basically a wrapper, they are inserted directly into the
 *      DOM, and a DOM block should only ever be given the same drawable.
 *   2. Otherwise, consecutive drawables with the same renderer should be part of the same block. In the future we will
 *      want to allow "gaps" to form between (if something with a different renderer gets added and removed a lot
 *      in-between), but we'll need to figure out performance-sensitive flags to indicate when this needs to not be
 *      done (opacity and types of blending require no gaps between same-renderer drawables).
 *
 * Gluing: consequences of "no gaps"
 * There are two (important) implications:
 * Gluing
 *   If we have the following blocks:
 *     … A (SVG), B (Canvas), C (SVG) ...
 *   and all drawables for for B are removed, the following would be invalid ("has a gap"):
 *     … A (SVG), C (SVG) …
 *   so we need to glue them together, usually either resulting in:
 *     … A (SVG) …
 *   or
 *     … C (SVG) …
 *   with A or C including all of the drawables that were in A and C.
 *   More generally:
 *     If a change interval used to have its before/after (unchanged) drawables on two
 *     different blocks and for the current frame there will be no blocks in-between,
 *     we will need to "glue".
 *   Additionally, note the case:
 *     … A (SVG), B (Canvas), C (DOM), D (SVG), E (Canvas), F (SVG).
 *   If B,C,E are all removed, the results of A,D,F will have to all be combined into one layer
 * Un-gluing
 *   If we have the following drawables, all part of one block:
 *     … a (svg), b (svg) …
 *   and we insert a drawable with a different renderer:
 *     … a (svg), c (canvas), b (svg) ...
 *   we will need to split them into to SVG blocks
 *   More generally:
 *     If a change interval used to have its before/after (unchanged) drawables included
 *     in the same block, and the current frame requires a block to be inserted
 *     in-between, we will need to "un-glue".
 * These consequences mean that "unchanged" drawables (outside of change intervals) may need to have their block changed
 * (with notePendingMove). For performance, please consider which "end" should keep its drawables (the other end's
 * drawables will ALL have to be added/removed, which can be a major performance loss if we choose the wrong one).
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ import cleanArray from '../../../phet-core/js/cleanArray.js';
import { CanvasBlock, DOMBlock, Drawable, Renderer, scenery, SVGBlock, WebGLBlock } from '../imports.js';
let Stitcher = class Stitcher {
    /**
   * Main stitch entry point, called directly from the backbone or cache. We are modifying our backbone's blocks and
   * their attached drawables.
   * @public
   *
   * The change-interval pair denotes a linked-list of change intervals that we will need to stitch across (they
   * contain drawables that need to be removed and added, and it may affect how we lay out blocks in the stacking
   * order).
   *
   * @param {BackboneDrawable} backbone
   * @param {Drawable|null} firstDrawable
   * @param {Drawable|null} lastDrawable
   * @param {Drawable|null} oldFirstDrawable
   * @param {Drawable|null} oldLastDrawable
   * @param {ChangeInterval} firstChangeInterval
   * @param {ChangeInterval} lastChangeInterval
   */ initialize(backbone, firstDrawable, lastDrawable, oldFirstDrawable, oldLastDrawable, firstChangeInterval, lastChangeInterval) {
        assert && assert(firstChangeInterval && lastChangeInterval, 'We are guaranteed at least one change interval');
        assert && assert(!firstDrawable || firstDrawable.previousDrawable === null, 'End boundary of drawable linked list should link to null');
        assert && assert(!lastDrawable || lastDrawable.nextDrawable === null, 'End boundary of drawable linked list should link to null');
        if (sceneryLog && sceneryLog.Stitch) {
            sceneryLog.Stitch(`stitch ${backbone.toString()} first:${firstDrawable ? firstDrawable.toString() : 'null'} last:${lastDrawable ? lastDrawable.toString() : 'null'} oldFirst:${oldFirstDrawable ? oldFirstDrawable.toString() : 'null'} oldLast:${oldLastDrawable ? oldLastDrawable.toString() : 'null'}`);
            sceneryLog.push();
        }
        if (sceneryLog && sceneryLog.StitchDrawables) {
            sceneryLog.StitchDrawables('Before:');
            sceneryLog.push();
            Stitcher.debugDrawables(oldFirstDrawable, oldLastDrawable, firstChangeInterval, lastChangeInterval, false);
            sceneryLog.pop();
            sceneryLog.StitchDrawables('After:');
            sceneryLog.push();
            Stitcher.debugDrawables(firstDrawable, lastDrawable, firstChangeInterval, lastChangeInterval, true);
            sceneryLog.pop();
        }
        this.backbone = backbone;
        this.firstDrawable = firstDrawable;
        this.lastDrawable = lastDrawable;
        // list of blocks that have their pendingFirstDrawable or pendingLastDrawable set, and need updateInterval() called
        this.touchedBlocks = cleanArray(this.touchedBlocks);
        if (assertSlow) {
            assertSlow(!this.initialized, 'We should not be already initialized (clean should be called)');
            this.initialized = true;
            this.reindexed = false;
            this.pendingAdditions = [];
            this.pendingRemovals = [];
            this.pendingMoves = [];
            this.createdBlocks = [];
            this.disposedBlocks = [];
            this.intervalsNotified = [];
            this.boundariesRecorded = false;
            this.previousBlocks = backbone.blocks.slice(0); // copy of previous blocks
        }
    }
    /**
   * Removes object references
   * @public
   */ clean() {
        sceneryLog && sceneryLog.Stitch && sceneryLog.Stitch('clean');
        sceneryLog && sceneryLog.Stitch && sceneryLog.Stitch('-----------------------------------');
        if (assertSlow) {
            this.auditStitch();
            this.initialized = false;
        }
        this.backbone = null;
        this.firstDrawable = null;
        this.lastDrawable = null;
        sceneryLog && sceneryLog.Stitch && sceneryLog.pop();
    }
    /**
   * Writes the first/last drawables for the entire backbone into its memory. We want to wait to do this until we have
   * read from its previous values.
   * @protected
   */ recordBackboneBoundaries() {
        sceneryLog && sceneryLog.Stitch && sceneryLog.Stitch(`recording backbone boundaries: ${this.firstDrawable ? this.firstDrawable.toString() : 'null'} to ${this.lastDrawable ? this.lastDrawable.toString() : 'null'}`);
        this.backbone.previousFirstDrawable = this.firstDrawable;
        this.backbone.previousLastDrawable = this.lastDrawable;
        if (assertSlow) {
            this.boundariesRecorded = true;
        }
    }
    /**
   * Records that this {Drawable} drawable should be added/moved to the {Block} at a later time
   * @protected
   *
   * @param {Drawable} drawable
   * @param {Block} block
   */ notePendingAddition(drawable, block) {
        assert && assert(drawable.renderer === block.renderer);
        sceneryLog && sceneryLog.Stitch && sceneryLog.Stitch(`pending add: ${drawable.toString()} to ${block.toString()}`);
        sceneryLog && sceneryLog.Stitch && sceneryLog.push();
        drawable.notePendingAddition(this.backbone.display, block, this.backbone);
        if (assertSlow) {
            this.pendingAdditions.push({
                drawable: drawable,
                block: block
            });
        }
        sceneryLog && sceneryLog.Stitch && sceneryLog.pop();
    }
    /**
   * Records that this {Drawable} drawable should be moved to the {Block} at a later time (called only on external
   * drawables). notePendingAddition and notePendingRemoval should not be called on a drawable that had
   * notePendingMove called on it during the same stitch, and vice versa.
   * @protected
   *
   * @param {Drawable} drawable
   * @param {Block} block
   */ notePendingMove(drawable, block) {
        assert && assert(drawable.renderer === block.renderer);
        sceneryLog && sceneryLog.Stitch && sceneryLog.Stitch(`pending move: ${drawable.toString()} to ${block.toString()}`);
        sceneryLog && sceneryLog.Stitch && sceneryLog.push();
        drawable.notePendingMove(this.backbone.display, block);
        if (assertSlow) {
            this.pendingMoves.push({
                drawable: drawable,
                block: block
            });
        }
        sceneryLog && sceneryLog.Stitch && sceneryLog.pop();
    }
    /**
   * Records that this {Drawable} drawable should be removed/moved from the {Block} at a later time
   * @protected
   *
   * @param {Drawable} drawable
   */ notePendingRemoval(drawable) {
        sceneryLog && sceneryLog.Stitch && sceneryLog.Stitch(`pending remove: ${drawable.toString()}`);
        sceneryLog && sceneryLog.Stitch && sceneryLog.push();
        drawable.notePendingRemoval(this.backbone.display);
        if (assertSlow) {
            this.pendingRemovals.push({
                drawable: drawable
            });
        }
        sceneryLog && sceneryLog.Stitch && sceneryLog.pop();
    }
    /**
   * Records that this {Block} block should be disposed at a later time. It should not be in the blocks array at the
   * end of the stitch.
   * @protected
   *
   * @param {Block} block
   */ markBlockForDisposal(block) {
        sceneryLog && sceneryLog.Stitch && sceneryLog.Stitch(`block for disposal: ${block.toString()}`);
        sceneryLog && sceneryLog.Stitch && sceneryLog.push();
        //TODO: PERFORMANCE: does this cause reflows / style calculation https://github.com/phetsims/scenery/issues/1581
        if (block.domElement.parentNode === this.backbone.domElement) {
            // guarded, since we may have a (new) child drawable add it before we can remove it
            this.backbone.domElement.removeChild(block.domElement);
        }
        block.markForDisposal(this.backbone.display);
        if (assertSlow) {
            this.disposedBlocks.push({
                block: block
            });
        }
        sceneryLog && sceneryLog.Stitch && sceneryLog.pop();
    }
    /**
   * @protected
   */ removeAllBlocks() {
        sceneryLog && sceneryLog.Stitch && sceneryLog.Stitch(`marking all blocks for disposal (count ${this.backbone.blocks.length})`);
        sceneryLog && sceneryLog.Stitch && sceneryLog.push();
        while(this.backbone.blocks.length){
            const block = this.backbone.blocks[0];
            this.removeBlock(block);
            this.markBlockForDisposal(block);
        }
        sceneryLog && sceneryLog.Stitch && sceneryLog.pop();
    }
    /**
   * Immediately notify a block of its first/last drawable.
   * @protected
   *
   * @param {Block} block
   * @param {Drawable} firstDrawable
   * @param {Drawable} lastDrawable
   */ notifyInterval(block, firstDrawable, lastDrawable) {
        sceneryLog && sceneryLog.Stitch && sceneryLog.Stitch(`notify interval: ${block.toString()} ${firstDrawable.toString()} to ${lastDrawable.toString()}`);
        sceneryLog && sceneryLog.Stitch && sceneryLog.push();
        block.notifyInterval(firstDrawable, lastDrawable);
        // mark it dirty, since its drawables probably changed?
        //OHTWO TODO: is this necessary? What is this doing? https://github.com/phetsims/scenery/issues/1581
        this.backbone.markDirtyDrawable(block);
        if (assertSlow) {
            this.intervalsNotified.push({
                block: block,
                firstDrawable: firstDrawable,
                lastDrawable: lastDrawable
            });
        }
        sceneryLog && sceneryLog.Stitch && sceneryLog.pop();
    }
    /**
   * Note a block's tentative first drawable and block before (should be flushed later with updateBlockIntervals())
   * @protected
   *
   * @param {Block} block
   * @param {Drawable} firstDrawable
   */ markBeforeBlock(block, firstDrawable) {
        sceneryLog && sceneryLog.Stitch && sceneryLog.Stitch(`marking block first drawable ${block.toString()} with ${firstDrawable.toString()}`);
        block.pendingFirstDrawable = firstDrawable;
        this.touchedBlocks.push(block);
    }
    /**
   * Note a block's tentative last drawable and block after (should be flushed later with updateBlockIntervals())
   * @protected
   *
   * @param {Block} block
   * @param {Drawable} lastDrawable
   */ markAfterBlock(block, lastDrawable) {
        sceneryLog && sceneryLog.Stitch && sceneryLog.Stitch(`marking block last drawable ${block.toString()} with ${lastDrawable.toString()}`);
        block.pendingLastDrawable = lastDrawable;
        this.touchedBlocks.push(block);
    }
    /**
   * Flushes markBeforeBlock/markAfterBlock changes to notifyInterval on blocks themselves.
   * @protected
   */ updateBlockIntervals() {
        while(this.touchedBlocks.length){
            const block = this.touchedBlocks.pop();
            if (block.used) {
                sceneryLog && sceneryLog.Stitch && sceneryLog.Stitch(`update interval: ${block.toString()} ${block.pendingFirstDrawable.toString()} to ${block.pendingLastDrawable.toString()}`);
                block.updateInterval();
                // mark it dirty, since its drawables probably changed?
                //OHTWO TODO: is this necessary? What is this doing? https://github.com/phetsims/scenery/issues/1581
                this.backbone.markDirtyDrawable(block);
                if (assertSlow) {
                    this.intervalsNotified.push({
                        block: block,
                        firstDrawable: block.pendingFirstDrawable,
                        lastDrawable: block.pendingLastDrawable
                    });
                }
            } else {
                sceneryLog && sceneryLog.Stitch && sceneryLog.Stitch(`skipping update interval: ${block.toString()}, unused`);
            }
        }
    }
    /**
   * Creates a fresh block with the desired renderer and {Drawable} arbitrary drawable included, and adds it to
   * our DOM.
   * @protected
   *
   * @param {number} renderer
   * @param {Drawable} drawable
   * @returns {Block}
   */ createBlock(renderer, drawable) {
        const backbone = this.backbone;
        let block;
        if (Renderer.isCanvas(renderer)) {
            block = CanvasBlock.createFromPool(backbone.display, renderer, backbone.transformRootInstance, backbone.backboneInstance);
        } else if (Renderer.isSVG(renderer)) {
            //OHTWO TODO: handle filter root separately from the backbone instance? https://github.com/phetsims/scenery/issues/1581
            block = SVGBlock.createFromPool(backbone.display, renderer, backbone.transformRootInstance, backbone.backboneInstance);
        } else if (Renderer.isDOM(renderer)) {
            block = DOMBlock.createFromPool(backbone.display, drawable);
        } else if (Renderer.isWebGL(renderer)) {
            block = WebGLBlock.createFromPool(backbone.display, renderer, backbone.transformRootInstance, backbone.backboneInstance);
        } else {
            throw new Error(`unsupported renderer for createBlock: ${renderer}`);
        }
        sceneryLog && sceneryLog.Stitch && sceneryLog.Stitch(`created block: ${block.toString()} with renderer: ${renderer} for drawable: ${drawable.toString()}`);
        block.setBlockBackbone(backbone);
        //OHTWO TODO: minor speedup by appending only once its fragment is constructed? or use DocumentFragment? https://github.com/phetsims/scenery/issues/1581
        backbone.domElement.appendChild(block.domElement);
        // if backbone is a display root, hide all of its content from screen readers
        if (backbone.isDisplayRoot) {
            block.domElement.setAttribute('aria-hidden', true);
        }
        // mark it dirty for now, so we can check
        backbone.markDirtyDrawable(block);
        if (assertSlow) {
            this.createdBlocks.push({
                block: block,
                renderer: renderer,
                drawable: drawable
            });
        }
        return block;
    }
    /**
   * Immediately appends a block to our blocks array
   * @protected
   *
   * @param {Block} block
   */ appendBlock(block) {
        sceneryLog && sceneryLog.Stitch && sceneryLog.Stitch(`appending block: ${block.toString()}`);
        this.backbone.blocks.push(block);
        if (assertSlow) {
            this.reindexed = false;
        }
    }
    /**
   * Immediately removes a block to our blocks array
   * @protected
   *
   * @param {Block} block
   */ removeBlock(block) {
        sceneryLog && sceneryLog.Stitch && sceneryLog.Stitch(`removing block: ${block.toString()}`);
        // remove the block from our internal list
        const blockIndex = _.indexOf(this.backbone.blocks, block);
        assert && assert(blockIndex >= 0, `Cannot remove block, not attached: ${block.toString()}`);
        this.backbone.blocks.splice(blockIndex, 1);
        if (assertSlow) {
            this.reindexed = false;
        }
    }
    /**
   * @protected
   */ useNoBlocks() {
        sceneryLog && sceneryLog.Stitch && sceneryLog.Stitch('using no blocks');
        // i.e. we will not use any blocks
        cleanArray(this.backbone.blocks);
    }
    /**
   * Triggers all blocks in the blocks array to have their z-index properties set so that they visually stack
   * correctly.
   * @protected
   */ reindex() {
        sceneryLog && sceneryLog.Stitch && sceneryLog.Stitch('reindexing blocks');
        this.backbone.reindexBlocks();
        if (assertSlow) {
            this.reindexed = true;
        }
    }
    /**
   * An audit for testing assertions
   * @protected
   */ auditStitch() {
        if (assertSlow) {
            const blocks = this.backbone.blocks;
            const previousBlocks = this.previousBlocks;
            assertSlow(this.initialized, 'We seem to have finished a stitch without proper initialization');
            assertSlow(this.boundariesRecorded, 'Our stitch API requires recordBackboneBoundaries() to be called before' + ' it is finished.');
            // ensure our indices are up-to-date (reindexed, or did not change)
            assertSlow(this.reindexed || blocks.length === 0 || // array equality of previousBlocks and blocks
            previousBlocks.length === blocks.length && _.every(_.zip(previousBlocks, blocks), (arr)=>arr[0] === arr[1]), 'Did not reindex on a block change where we are left with blocks');
            // all created blocks had intervals notified
            _.each(this.createdBlocks, (blockData)=>{
                assertSlow(_.some(this.intervalsNotified, (intervalData)=>blockData.block === intervalData.block), `Created block does not seem to have an interval notified: ${blockData.block.toString()}`);
            });
            // no disposed blocks had intervals notified
            _.each(this.disposedBlocks, (blockData)=>{
                assertSlow(!_.some(this.intervalsNotified, (intervalData)=>blockData.block === intervalData.block), `Removed block seems to have an interval notified: ${blockData.block.toString()}`);
            });
            // all drawables for disposed blocks have been marked as pending removal (or moved)
            _.each(this.disposedBlocks, (blockData)=>{
                const block = blockData.block;
                _.each(Drawable.oldListToArray(block.firstDrawable, block.lastDrawable), (drawable)=>{
                    assertSlow(_.some(this.pendingRemovals, (removalData)=>removalData.drawable === drawable) || _.some(this.pendingMoves, (moveData)=>moveData.drawable === drawable), `Drawable ${drawable.toString()} originally listed for disposed block ${block.toString()} does not seem to be marked for pending removal or move!`);
                });
            });
            // all drawables for created blocks have been marked as pending addition or moved for our block
            _.each(this.createdBlocks, (blockData)=>{
                const block = blockData.block;
                _.each(Drawable.listToArray(block.pendingFirstDrawable, block.pendingLastDrawable), (drawable)=>{
                    assertSlow(_.some(this.pendingAdditions, (additionData)=>additionData.drawable === drawable && additionData.block === block) || _.some(this.pendingMoves, (moveData)=>moveData.drawable === drawable && moveData.block === block), `Drawable ${drawable.toString()} now listed for created block ${block.toString()} does not seem to be marked for pending addition or move!`);
                });
            });
            // all disposed blocks should have been removed
            _.each(this.disposedBlocks, (blockData)=>{
                const blockIdx = _.indexOf(blocks, blockData.block);
                assertSlow(blockIdx < 0, `Disposed block ${blockData.block.toString()} still present at index ${blockIdx}`);
            });
            // all created blocks should have been added
            _.each(this.createdBlocks, (blockData)=>{
                const blockIdx = _.indexOf(blocks, blockData.block);
                assertSlow(blockIdx >= 0, `Created block ${blockData.block.toString()} is not in the blocks array`);
            });
            // all current blocks should be marked as used
            _.each(blocks, (block)=>{
                assertSlow(block.used, 'All current blocks should be marked as used');
            });
            assertSlow(blocks.length - previousBlocks.length === this.createdBlocks.length - this.disposedBlocks.length, `${'The count of unmodified blocks should be constant (equal differences):\n' + 'created: '}${_.map(this.createdBlocks, (n)=>n.block.id).join(',')}\n` + `disposed: ${_.map(this.disposedBlocks, (n)=>n.block.id).join(',')}\n` + `before: ${_.map(previousBlocks, (n)=>n.id).join(',')}\n` + `after: ${_.map(blocks, (n)=>n.id).join(',')}`);
            assertSlow(this.touchedBlocks.length === 0, 'If we marked any blocks for changes, we should have called updateBlockIntervals');
            if (blocks.length) {
                assertSlow(this.backbone.previousFirstDrawable !== null && this.backbone.previousLastDrawable !== null, 'If we are left with at least one block, we must be tracking at least one drawable');
                assertSlow(blocks[0].pendingFirstDrawable === this.backbone.previousFirstDrawable, 'Our first drawable should match the first drawable of our first block');
                assertSlow(blocks[blocks.length - 1].pendingLastDrawable === this.backbone.previousLastDrawable, 'Our last drawable should match the last drawable of our last block');
                for(let i = 0; i < blocks.length - 1; i++){
                    // [i] and [i+1] are a pair of consecutive blocks
                    assertSlow(blocks[i].pendingLastDrawable.nextDrawable === blocks[i + 1].pendingFirstDrawable && blocks[i].pendingLastDrawable === blocks[i + 1].pendingFirstDrawable.previousDrawable, 'Consecutive blocks should have boundary drawables that are also consecutive in the linked list');
                }
            } else {
                assertSlow(this.backbone.previousFirstDrawable === null && this.backbone.previousLastDrawable === null, 'If we are left with no blocks, it must mean we are tracking precisely zero drawables');
            }
        }
    }
    /**
   * @public
   *
   * @param {ChangeInterval} firstChangeInterval
   */ static debugIntervals(firstChangeInterval) {
        if (sceneryLog && sceneryLog.Stitch) {
            for(let debugInterval = firstChangeInterval; debugInterval !== null; debugInterval = debugInterval.nextChangeInterval){
                sceneryLog.Stitch(`  interval: ${debugInterval.isEmpty() ? '(empty) ' : ''}${debugInterval.drawableBefore ? debugInterval.drawableBefore.toString() : '-'} to ${debugInterval.drawableAfter ? debugInterval.drawableAfter.toString() : '-'}`);
            }
        }
    }
    /**
   * Logs a bunch of information about the old (useCurrent===false) or new (useCurrent===true) drawable linked list.
   * @public
   *
   * @param {Drawable|null} firstDrawable
   * @param {Drawable|null} lastDrawable
   * @param {ChangeInterval} firstChangeInterval
   * @param {ChangeInterval} lastChangeInterval
   * @param {boolean} useCurrent
   */ static debugDrawables(firstDrawable, lastDrawable, firstChangeInterval, lastChangeInterval, useCurrent) {
        if (sceneryLog && sceneryLog.StitchDrawables) {
            if (firstDrawable === null) {
                sceneryLog.StitchDrawables('nothing', 'color: #666;');
                return;
            }
            let isChanged = firstChangeInterval.drawableBefore === null;
            let currentInterval = firstChangeInterval;
            for(let drawable = firstDrawable;; drawable = useCurrent ? drawable.nextDrawable : drawable.oldNextDrawable){
                if (isChanged && drawable === currentInterval.drawableAfter) {
                    isChanged = false;
                    currentInterval = currentInterval.nextChangeInterval;
                }
                const drawableString = `${drawable.renderer} ${!useCurrent && drawable.parentDrawable ? drawable.parentDrawable.toString() : ''} ${drawable.toDetailedString()}`;
                sceneryLog.StitchDrawables(drawableString, isChanged ? useCurrent ? 'color: #0a0;' : 'color: #a00;' : 'color: #666');
                if (!isChanged && currentInterval && currentInterval.drawableBefore === drawable) {
                    isChanged = true;
                }
                if (drawable === lastDrawable) {
                    break;
                }
            }
        }
    }
};
scenery.register('Stitcher', Stitcher);
export default Stitcher;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvZGlzcGxheS9TdGl0Y2hlci5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNC0yMDIzLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuXG4vKipcbiAqIEFic3RyYWN0IGJhc2UgdHlwZSAoYW5kIEFQSSkgZm9yIHN0aXRjaGluZyBpbXBsZW1lbnRhdGlvbnMuIFN0aXRjaGluZyBpczpcbiAqIEEgbWV0aG9kIG9mIHVwZGF0aW5nIHRoZSBibG9ja3MgZm9yIGEgYmFja2JvbmUgKHRoZSBjaGFuZ2VzIGZyb20gdGhlIHByZXZpb3VzIGZyYW1lIHRvIHRoZSBjdXJyZW50IGZyYW1lKSwgYW5kXG4gKiBzZXR0aW5nIHVwIHRoZSBkcmF3YWJsZXMgdG8gYmUgYXR0YWNoZWQvZGV0YWNoZWQgZnJvbSBibG9ja3MuIEF0IGEgaGlnaCBsZXZlbDpcbiAqICAgLSBXZSBoYXZlIGFuIG9yZGVyZWQgbGlzdCBvZiBibG9ja3MgZGlzcGxheWVkIGluIHRoZSBsYXN0IGZyYW1lLlxuICogICAtIFdlIGhhdmUgYW4gb3JkZXJlZCBsaXN0IG9mIGRyYXdhYmxlcyBkaXNwbGF5ZWQgaW4gdGhlIGxhc3QgZnJhbWUgKGFuZCB3aGF0IGJsb2NrIHRoZXkgYXJlIHBhcnQgb2YpLlxuICogICAtIFdlIGhhdmUgYW4gb3JkZXJlZCBsaXN0IG9mIGRyYXdhYmxlcyB0aGF0IHdpbGwgYmUgZGlzcGxheWVkIGluIHRoZSBuZXh0IGZyYW1lIChhbmQgd2hldGhlciB0aGV5IHdlcmUgcGFydCBvZiBvdXJcbiAqICAgICBiYWNrYm9uZSwgYW5kIGlmIHNvIHdoYXQgYmxvY2sgdGhleSB3ZXJlIGluKS5cbiAqICAgLSBXZSBuZWVkIHRvIGVmZmljaWVudGx5IGNyZWF0ZS9kaXNwb3NlIHJlcXVpcmVkIGJsb2NrcywgYWRkL3JlbW92ZSBkcmF3YWJsZXMgZnJvbSBibG9ja3MsIG5vdGlmeSBibG9ja3Mgb2YgdGhlaXJcbiAqICAgICBkcmF3YWJsZSByYW5nZSwgYW5kIGVuc3VyZSBibG9ja3MgYXJlIGRpc3BsYXllZCBiYWNrLXRvLWZyb250LlxuICpcbiAqIFNpbmNlIHN0aXRjaGluZyB1c3VhbGx5IG9ubHkgaW52b2x2ZXMgb25lIG9yIGEgZmV3IHNtYWxsIGNoYW5nZXMgKGV4Y2VwdCBmb3Igb24gc2ltIGluaXRpYWxpemF0aW9uKSwgdGhlIHN0aXRjaFxuICogbWV0aG9kIGlzIHByb3ZpZGVkIHdpdGggYSBsaXN0IG9mIGludGVydmFscyB0aGF0IHdlcmUgKHBvdGVudGlhbGx5KSBjaGFuZ2VkLiBUaGlzIGNvbnNpc3RzIG9mIGEgbGlua2VkLWxpc3Qgb2ZcbiAqIGludGVydmFscyAoaXQgaXMgY29uc3RydWN0ZWQgZHVyaW5nIHJlY3Vyc2lvbiB0aHJvdWdoIGEgdHJlZSB0aGF0IHNraXBzIGtub3duLXVuY2hhbmdlZCBzdWJ0cmVlcykuIFRoZSBpbnRlcnZhbHNcbiAqIGFyZSBjb21wbGV0ZWx5IGRpc2pvaW50IChkb24ndCBvdmVybGFwLCBhbmQgYXJlbid0IGFkamFjZW50IC0gdGhlcmUgaXMgYXQgbGVhc3Qgb25lIGRyYXdhYmxlIHRoYXQgaXMgdW5jaGFuZ2VkXG4gKiBpbi1iZXR3ZWVuIGNoYW5nZSBpbnRlcnZhbHMpLlxuICpcbiAqIEFzc3VtZXMgdGhlIHNhbWUgb2JqZWN0IGluc3RhbmNlIHdpbGwgYmUgcmV1c2VkIG11bHRpcGxlIHRpbWVzLCBwb3NzaWJseSBmb3IgZGlmZmVyZW50IGJhY2tib25lcy5cbiAqXG4gKiBBbnkgc3RpdGNoZXIgaW1wbGVtZW50YXRpb25zIHNob3VsZCBhbHdheXMgY2FsbCBpbml0aWFsaXplKCkgZmlyc3QgYW5kIGNsZWFuKCkgYXQgdGhlIGVuZCwgc28gdGhhdCB3ZSBjYW4gc2V0IHVwXG4gKiBhbmQgdGhlbiBjbGVhbiB1cCBhbnkgb2JqZWN0IHJlZmVyZW5jZXMgKGFsbG93aW5nIHRoZW0gdG8gYmUgZ2FyYmFnZS1jb2xsZWN0ZWQgb3IgcG9vbGVkIG1vcmUgc2FmZWx5KS5cbiAqXG4gKiBTdGl0Y2hlciByZXNwb25zaWJpbGl0aWVzOlxuICogICAxLiBCbG9ja3MgdXNlZCBpbiB0aGUgcHJldmlvdXMgZnJhbWUgYnV0IG5vdCB1c2VkIGluIHRoZSBjdXJyZW50IGZyYW1lIChubyBkcmF3YWJsZXMsIG5vdCBhdHRhY2hlZCkgc2hvdWxkIGJlXG4gKiAgICAgIG1hcmtlZCBmb3IgZGlzcG9zYWwuXG4gKiAgIDIuIEJsb2NrcyBzaG91bGQgYmUgY3JlYXRlZCBhcyBuZWNlc3NhcnkuXG4gKiAgIDMuIElmIGEgY2hhbmdlZCBkcmF3YWJsZSBpcyByZW1vdmVkIGZyb20gYSBibG9jaywgaXQgc2hvdWxkIGhhdmUgbm90ZVBlbmRpbmdSZW1vdmFsIGNhbGxlZCBvbiBpdC5cbiAqICAgNC4gSWYgYSBjaGFuZ2VkIGRyYXdhYmxlIGlzIGFkZGVkIHRvIGEgYmxvY2ssIGl0IHNob3VsZCBoYXZlIG5vdGVQZW5kaW5nQWRkaXRpb24gY2FsbGVkIG9uIGl0LlxuICogICA1LiBJZiBhbiB1bmNoYW5nZWQgZHJhd2FibGUgaXMgdG8gaGF2ZSBhIGJsb2NrIGNoYW5nZSwgaXQgc2hvdWxkIGhhdmUgbm90ZVBlbmRpbmdNb3ZlIGNhbGxlZCBvbiBpdC5cbiAqICAgNi4gTmV3IGJsb2NrcyBzaG91bGQgYmUgYWRkZWQgdG8gdGhlIERPTSAoYXBwZW5kQ2hpbGQgcHJlc3VtYWJseSlcbiAqICAgNy4gUmVtb3ZlZCBibG9ja3Mgc2hvdWxkIGJlIHJlbW92ZWQgZnJvbSB0aGUgRE9NIChyZW1vdmVDaGlsZClcbiAqICAgICAgTk9URTogY2hlY2sgZm9yIGNoaWxkLXBhcmVudCByZWxhdGlvbnNoaXAsIHNpbmNlIERPTSBibG9ja3MgKHdyYXBwZXJzKSBtYXkgaGF2ZSBiZWVuXG4gKiAgICAgIGFkZGVkIHRvIHRoZSBET00gZWxzZXdoZXJlIGluIGFub3RoZXIgYmFja2JvbmUncyBzdGl0Y2ggYWxyZWFkeSAod2hpY2ggaW4gdGhlIERPTVxuICogICAgICBhdXRvbWF0aWNhbGx5IHJlbW92ZXMgaXQgZnJvbSBvdXIgYmFja2JvbmUncyBkaXYpXG4gKiAgIDguIElmIGEgYmxvY2sncyBmaXJzdCBvciBsYXN0IGRyYXdhYmxlIGNoYW5nZXMsIGl0IHNob3VsZCBoYXZlIG5vdGlmeUludGVydmFsIGNhbGxlZCBvbiBpdC5cbiAqICAgOS4gQXQgdGhlIGVuZCBvZiB0aGUgc3RpdGNoLCB0aGUgYmFja2JvbmUgc2hvdWxkIGhhdmUgYSB3YXkgb2YgaXRlcmF0aW5nIG92ZXIgaXRzIGJsb2NrcyBpbiBvcmRlciAocHJlZmVyYWJseSBhblxuICogICAgICBBcnJheSBmb3IgZmFzdCByZXBhaW50IGl0ZXJhdGlvbilcbiAqICAgMTAuIE5ldyBibG9ja3Mgc2hvdWxkIGhhdmUgc2V0QmxvY2tCYWNrYm9uZSggYmFja2JvbmUgKSBjYWxsZWQgb24gdGhlbVxuICogICAxMS4gQmxvY2tzIHdpdGggYW55IGRyYXdhYmxlIGNoYW5nZSBzaG91bGQgaGF2ZSBiYWNrYm9uZS5tYXJrRGlydHlEcmF3YWJsZSggYmxvY2sgKSBjYWxsZWQgc28gaXQgY2FuIGJlIHZpc2l0ZWRcbiAqICAgICAgIGluIHRoZSByZXBhaW50IHBoYXNlLlxuICogICAxMi4gQmxvY2tzIHNob3VsZCBoYXZlIHotaW5kaWNlcyBzZXQgaW4gdGhlIHByb3BlciBzdGFja2luZyBvcmRlciAoYmFjayB0byBmcm9udCksIHVzaW5nIGJhY2tib25lLnJlaW5kZXhCbG9ja3MoKVxuICogICAgICAgb3IgZXF1aXZhbGVudCAoaXQgdHJpZXMgdG8gY2hhbmdlIGFzIGZldyB6LWluZGljZXMgYXMgcG9zc2libGUpLlxuICpcbiAqIFN0aXRjaGVyIGRlc2lyZWQgYmVoYXZpb3IgYW5kIG9wdGltaXphdGlvbnM6XG4gKiAgIDEuIFJldXNlIGJsb2NrcyBvZiB0aGUgc2FtZSByZW5kZXJlciB0eXBlLCBpbnN0ZWFkIG9mIHJlbW92aW5nIG9uZSBhbmQgY3JlYXRpbmcgYW5vdGhlci5cbiAqICAgMi4gTWluaW1pemUgKGFzIG11Y2ggYXMgaXMgcG9zc2libGUpIGhvdyBtYW55IGRyYXdhYmxlcyBhcmUgYWRkZWQgYW5kIHJlbW92ZWQgZnJvbSBibG9ja3MgKHRyeSBub3QgdG8gcmVtb3ZlIDEwMDBcbiAqICAgICAgZHJhd2FibGVzIGZyb20gQSBhbmQgYWRkIHRoZW0gdG8gQiBpZiB3ZSBjb3VsZCBpbnN0ZWFkIGp1c3QgYWRkL3JlbW92ZSA1IGRyYXdhYmxlcyBmcm9tIEMgdG8gRClcbiAqICAgMy4gTm8gbW9yZSBET00gbWFuaXB1bGF0aW9uIHRoYW4gbmVjZXNzYXJ5XG4gKiAgIDQuIE9wdGltaXplIGZpcnN0IGZvciBcIm9uZSBvciBhIGZldyBzbWFsbCBjaGFuZ2UgaW50ZXJ2YWxzXCIgdGhhdCBvbmx5IGNhdXNlIGxvY2FsIGNoYW5nZXMgKG5vIGJsb2NrcyBjcmVhdGVkLFxuICogICAgICByZW1vdmVkIG9yIHJlb3JkZXJlZCkuIEl0IHdvdWxkIGJlIGlkZWFsIHRvIGRvIHRoaXMgdmVyeSBxdWlja2x5LCBzbyBpdCBjb3VsZCBiZSBkb25lIGV2ZXJ5IGZyYW1lIGluXG4gKiAgICAgIHNpbXVsYXRpb25zLlxuICpcbiAqIEN1cnJlbnQgY29uc3RyYWludHM6XG4gKiAgIDEuIERPTSBkcmF3YWJsZXMgc2hvdWxkIGJlIHBhaXJlZCB3aXRoIGV4YWN0bHkgb25lIGJsb2NrIChiYXNpY2FsbHkgYSB3cmFwcGVyLCB0aGV5IGFyZSBpbnNlcnRlZCBkaXJlY3RseSBpbnRvIHRoZVxuICogICAgICBET00sIGFuZCBhIERPTSBibG9jayBzaG91bGQgb25seSBldmVyIGJlIGdpdmVuIHRoZSBzYW1lIGRyYXdhYmxlLlxuICogICAyLiBPdGhlcndpc2UsIGNvbnNlY3V0aXZlIGRyYXdhYmxlcyB3aXRoIHRoZSBzYW1lIHJlbmRlcmVyIHNob3VsZCBiZSBwYXJ0IG9mIHRoZSBzYW1lIGJsb2NrLiBJbiB0aGUgZnV0dXJlIHdlIHdpbGxcbiAqICAgICAgd2FudCB0byBhbGxvdyBcImdhcHNcIiB0byBmb3JtIGJldHdlZW4gKGlmIHNvbWV0aGluZyB3aXRoIGEgZGlmZmVyZW50IHJlbmRlcmVyIGdldHMgYWRkZWQgYW5kIHJlbW92ZWQgYSBsb3RcbiAqICAgICAgaW4tYmV0d2VlbiksIGJ1dCB3ZSdsbCBuZWVkIHRvIGZpZ3VyZSBvdXQgcGVyZm9ybWFuY2Utc2Vuc2l0aXZlIGZsYWdzIHRvIGluZGljYXRlIHdoZW4gdGhpcyBuZWVkcyB0byBub3QgYmVcbiAqICAgICAgZG9uZSAob3BhY2l0eSBhbmQgdHlwZXMgb2YgYmxlbmRpbmcgcmVxdWlyZSBubyBnYXBzIGJldHdlZW4gc2FtZS1yZW5kZXJlciBkcmF3YWJsZXMpLlxuICpcbiAqIEdsdWluZzogY29uc2VxdWVuY2VzIG9mIFwibm8gZ2Fwc1wiXG4gKiBUaGVyZSBhcmUgdHdvIChpbXBvcnRhbnQpIGltcGxpY2F0aW9uczpcbiAqIEdsdWluZ1xuICogICBJZiB3ZSBoYXZlIHRoZSBmb2xsb3dpbmcgYmxvY2tzOlxuICogICAgIOKApiBBIChTVkcpLCBCIChDYW52YXMpLCBDIChTVkcpIC4uLlxuICogICBhbmQgYWxsIGRyYXdhYmxlcyBmb3IgZm9yIEIgYXJlIHJlbW92ZWQsIHRoZSBmb2xsb3dpbmcgd291bGQgYmUgaW52YWxpZCAoXCJoYXMgYSBnYXBcIik6XG4gKiAgICAg4oCmIEEgKFNWRyksIEMgKFNWRykg4oCmXG4gKiAgIHNvIHdlIG5lZWQgdG8gZ2x1ZSB0aGVtIHRvZ2V0aGVyLCB1c3VhbGx5IGVpdGhlciByZXN1bHRpbmcgaW46XG4gKiAgICAg4oCmIEEgKFNWRykg4oCmXG4gKiAgIG9yXG4gKiAgICAg4oCmIEMgKFNWRykg4oCmXG4gKiAgIHdpdGggQSBvciBDIGluY2x1ZGluZyBhbGwgb2YgdGhlIGRyYXdhYmxlcyB0aGF0IHdlcmUgaW4gQSBhbmQgQy5cbiAqICAgTW9yZSBnZW5lcmFsbHk6XG4gKiAgICAgSWYgYSBjaGFuZ2UgaW50ZXJ2YWwgdXNlZCB0byBoYXZlIGl0cyBiZWZvcmUvYWZ0ZXIgKHVuY2hhbmdlZCkgZHJhd2FibGVzIG9uIHR3b1xuICogICAgIGRpZmZlcmVudCBibG9ja3MgYW5kIGZvciB0aGUgY3VycmVudCBmcmFtZSB0aGVyZSB3aWxsIGJlIG5vIGJsb2NrcyBpbi1iZXR3ZWVuLFxuICogICAgIHdlIHdpbGwgbmVlZCB0byBcImdsdWVcIi5cbiAqICAgQWRkaXRpb25hbGx5LCBub3RlIHRoZSBjYXNlOlxuICogICAgIOKApiBBIChTVkcpLCBCIChDYW52YXMpLCBDIChET00pLCBEIChTVkcpLCBFIChDYW52YXMpLCBGIChTVkcpLlxuICogICBJZiBCLEMsRSBhcmUgYWxsIHJlbW92ZWQsIHRoZSByZXN1bHRzIG9mIEEsRCxGIHdpbGwgaGF2ZSB0byBhbGwgYmUgY29tYmluZWQgaW50byBvbmUgbGF5ZXJcbiAqIFVuLWdsdWluZ1xuICogICBJZiB3ZSBoYXZlIHRoZSBmb2xsb3dpbmcgZHJhd2FibGVzLCBhbGwgcGFydCBvZiBvbmUgYmxvY2s6XG4gKiAgICAg4oCmIGEgKHN2ZyksIGIgKHN2Zykg4oCmXG4gKiAgIGFuZCB3ZSBpbnNlcnQgYSBkcmF3YWJsZSB3aXRoIGEgZGlmZmVyZW50IHJlbmRlcmVyOlxuICogICAgIOKApiBhIChzdmcpLCBjIChjYW52YXMpLCBiIChzdmcpIC4uLlxuICogICB3ZSB3aWxsIG5lZWQgdG8gc3BsaXQgdGhlbSBpbnRvIHRvIFNWRyBibG9ja3NcbiAqICAgTW9yZSBnZW5lcmFsbHk6XG4gKiAgICAgSWYgYSBjaGFuZ2UgaW50ZXJ2YWwgdXNlZCB0byBoYXZlIGl0cyBiZWZvcmUvYWZ0ZXIgKHVuY2hhbmdlZCkgZHJhd2FibGVzIGluY2x1ZGVkXG4gKiAgICAgaW4gdGhlIHNhbWUgYmxvY2ssIGFuZCB0aGUgY3VycmVudCBmcmFtZSByZXF1aXJlcyBhIGJsb2NrIHRvIGJlIGluc2VydGVkXG4gKiAgICAgaW4tYmV0d2Vlbiwgd2Ugd2lsbCBuZWVkIHRvIFwidW4tZ2x1ZVwiLlxuICogVGhlc2UgY29uc2VxdWVuY2VzIG1lYW4gdGhhdCBcInVuY2hhbmdlZFwiIGRyYXdhYmxlcyAob3V0c2lkZSBvZiBjaGFuZ2UgaW50ZXJ2YWxzKSBtYXkgbmVlZCB0byBoYXZlIHRoZWlyIGJsb2NrIGNoYW5nZWRcbiAqICh3aXRoIG5vdGVQZW5kaW5nTW92ZSkuIEZvciBwZXJmb3JtYW5jZSwgcGxlYXNlIGNvbnNpZGVyIHdoaWNoIFwiZW5kXCIgc2hvdWxkIGtlZXAgaXRzIGRyYXdhYmxlcyAodGhlIG90aGVyIGVuZCdzXG4gKiBkcmF3YWJsZXMgd2lsbCBBTEwgaGF2ZSB0byBiZSBhZGRlZC9yZW1vdmVkLCB3aGljaCBjYW4gYmUgYSBtYWpvciBwZXJmb3JtYW5jZSBsb3NzIGlmIHdlIGNob29zZSB0aGUgd3Jvbmcgb25lKS5cbiAqXG4gKiBAYXV0aG9yIEpvbmF0aGFuIE9sc29uIDxqb25hdGhhbi5vbHNvbkBjb2xvcmFkby5lZHU+XG4gKi9cblxuaW1wb3J0IGNsZWFuQXJyYXkgZnJvbSAnLi4vLi4vLi4vcGhldC1jb3JlL2pzL2NsZWFuQXJyYXkuanMnO1xuaW1wb3J0IHsgQ2FudmFzQmxvY2ssIERPTUJsb2NrLCBEcmF3YWJsZSwgUmVuZGVyZXIsIHNjZW5lcnksIFNWR0Jsb2NrLCBXZWJHTEJsb2NrIH0gZnJvbSAnLi4vaW1wb3J0cy5qcyc7XG5cbmNsYXNzIFN0aXRjaGVyIHtcbiAgLyoqXG4gICAqIE1haW4gc3RpdGNoIGVudHJ5IHBvaW50LCBjYWxsZWQgZGlyZWN0bHkgZnJvbSB0aGUgYmFja2JvbmUgb3IgY2FjaGUuIFdlIGFyZSBtb2RpZnlpbmcgb3VyIGJhY2tib25lJ3MgYmxvY2tzIGFuZFxuICAgKiB0aGVpciBhdHRhY2hlZCBkcmF3YWJsZXMuXG4gICAqIEBwdWJsaWNcbiAgICpcbiAgICogVGhlIGNoYW5nZS1pbnRlcnZhbCBwYWlyIGRlbm90ZXMgYSBsaW5rZWQtbGlzdCBvZiBjaGFuZ2UgaW50ZXJ2YWxzIHRoYXQgd2Ugd2lsbCBuZWVkIHRvIHN0aXRjaCBhY3Jvc3MgKHRoZXlcbiAgICogY29udGFpbiBkcmF3YWJsZXMgdGhhdCBuZWVkIHRvIGJlIHJlbW92ZWQgYW5kIGFkZGVkLCBhbmQgaXQgbWF5IGFmZmVjdCBob3cgd2UgbGF5IG91dCBibG9ja3MgaW4gdGhlIHN0YWNraW5nXG4gICAqIG9yZGVyKS5cbiAgICpcbiAgICogQHBhcmFtIHtCYWNrYm9uZURyYXdhYmxlfSBiYWNrYm9uZVxuICAgKiBAcGFyYW0ge0RyYXdhYmxlfG51bGx9IGZpcnN0RHJhd2FibGVcbiAgICogQHBhcmFtIHtEcmF3YWJsZXxudWxsfSBsYXN0RHJhd2FibGVcbiAgICogQHBhcmFtIHtEcmF3YWJsZXxudWxsfSBvbGRGaXJzdERyYXdhYmxlXG4gICAqIEBwYXJhbSB7RHJhd2FibGV8bnVsbH0gb2xkTGFzdERyYXdhYmxlXG4gICAqIEBwYXJhbSB7Q2hhbmdlSW50ZXJ2YWx9IGZpcnN0Q2hhbmdlSW50ZXJ2YWxcbiAgICogQHBhcmFtIHtDaGFuZ2VJbnRlcnZhbH0gbGFzdENoYW5nZUludGVydmFsXG4gICAqL1xuICBpbml0aWFsaXplKCBiYWNrYm9uZSwgZmlyc3REcmF3YWJsZSwgbGFzdERyYXdhYmxlLCBvbGRGaXJzdERyYXdhYmxlLCBvbGRMYXN0RHJhd2FibGUsIGZpcnN0Q2hhbmdlSW50ZXJ2YWwsIGxhc3RDaGFuZ2VJbnRlcnZhbCApIHtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBmaXJzdENoYW5nZUludGVydmFsICYmIGxhc3RDaGFuZ2VJbnRlcnZhbCwgJ1dlIGFyZSBndWFyYW50ZWVkIGF0IGxlYXN0IG9uZSBjaGFuZ2UgaW50ZXJ2YWwnICk7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggIWZpcnN0RHJhd2FibGUgfHwgZmlyc3REcmF3YWJsZS5wcmV2aW91c0RyYXdhYmxlID09PSBudWxsLFxuICAgICAgJ0VuZCBib3VuZGFyeSBvZiBkcmF3YWJsZSBsaW5rZWQgbGlzdCBzaG91bGQgbGluayB0byBudWxsJyApO1xuICAgIGFzc2VydCAmJiBhc3NlcnQoICFsYXN0RHJhd2FibGUgfHwgbGFzdERyYXdhYmxlLm5leHREcmF3YWJsZSA9PT0gbnVsbCxcbiAgICAgICdFbmQgYm91bmRhcnkgb2YgZHJhd2FibGUgbGlua2VkIGxpc3Qgc2hvdWxkIGxpbmsgdG8gbnVsbCcgKTtcblxuICAgIGlmICggc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLlN0aXRjaCApIHtcbiAgICAgIHNjZW5lcnlMb2cuU3RpdGNoKCBgc3RpdGNoICR7YmFja2JvbmUudG9TdHJpbmcoKVxuICAgICAgfSBmaXJzdDoke2ZpcnN0RHJhd2FibGUgPyBmaXJzdERyYXdhYmxlLnRvU3RyaW5nKCkgOiAnbnVsbCdcbiAgICAgIH0gbGFzdDoke2xhc3REcmF3YWJsZSA/IGxhc3REcmF3YWJsZS50b1N0cmluZygpIDogJ251bGwnXG4gICAgICB9IG9sZEZpcnN0OiR7b2xkRmlyc3REcmF3YWJsZSA/IG9sZEZpcnN0RHJhd2FibGUudG9TdHJpbmcoKSA6ICdudWxsJ1xuICAgICAgfSBvbGRMYXN0OiR7b2xkTGFzdERyYXdhYmxlID8gb2xkTGFzdERyYXdhYmxlLnRvU3RyaW5nKCkgOiAnbnVsbCd9YCApO1xuICAgICAgc2NlbmVyeUxvZy5wdXNoKCk7XG4gICAgfVxuICAgIGlmICggc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLlN0aXRjaERyYXdhYmxlcyApIHtcbiAgICAgIHNjZW5lcnlMb2cuU3RpdGNoRHJhd2FibGVzKCAnQmVmb3JlOicgKTtcbiAgICAgIHNjZW5lcnlMb2cucHVzaCgpO1xuICAgICAgU3RpdGNoZXIuZGVidWdEcmF3YWJsZXMoIG9sZEZpcnN0RHJhd2FibGUsIG9sZExhc3REcmF3YWJsZSwgZmlyc3RDaGFuZ2VJbnRlcnZhbCwgbGFzdENoYW5nZUludGVydmFsLCBmYWxzZSApO1xuICAgICAgc2NlbmVyeUxvZy5wb3AoKTtcblxuICAgICAgc2NlbmVyeUxvZy5TdGl0Y2hEcmF3YWJsZXMoICdBZnRlcjonICk7XG4gICAgICBzY2VuZXJ5TG9nLnB1c2goKTtcbiAgICAgIFN0aXRjaGVyLmRlYnVnRHJhd2FibGVzKCBmaXJzdERyYXdhYmxlLCBsYXN0RHJhd2FibGUsIGZpcnN0Q2hhbmdlSW50ZXJ2YWwsIGxhc3RDaGFuZ2VJbnRlcnZhbCwgdHJ1ZSApO1xuICAgICAgc2NlbmVyeUxvZy5wb3AoKTtcbiAgICB9XG5cbiAgICB0aGlzLmJhY2tib25lID0gYmFja2JvbmU7XG4gICAgdGhpcy5maXJzdERyYXdhYmxlID0gZmlyc3REcmF3YWJsZTtcbiAgICB0aGlzLmxhc3REcmF3YWJsZSA9IGxhc3REcmF3YWJsZTtcblxuICAgIC8vIGxpc3Qgb2YgYmxvY2tzIHRoYXQgaGF2ZSB0aGVpciBwZW5kaW5nRmlyc3REcmF3YWJsZSBvciBwZW5kaW5nTGFzdERyYXdhYmxlIHNldCwgYW5kIG5lZWQgdXBkYXRlSW50ZXJ2YWwoKSBjYWxsZWRcbiAgICB0aGlzLnRvdWNoZWRCbG9ja3MgPSBjbGVhbkFycmF5KCB0aGlzLnRvdWNoZWRCbG9ja3MgKTtcblxuICAgIGlmICggYXNzZXJ0U2xvdyApIHtcbiAgICAgIGFzc2VydFNsb3coICF0aGlzLmluaXRpYWxpemVkLCAnV2Ugc2hvdWxkIG5vdCBiZSBhbHJlYWR5IGluaXRpYWxpemVkIChjbGVhbiBzaG91bGQgYmUgY2FsbGVkKScgKTtcbiAgICAgIHRoaXMuaW5pdGlhbGl6ZWQgPSB0cnVlO1xuICAgICAgdGhpcy5yZWluZGV4ZWQgPSBmYWxzZTtcblxuICAgICAgdGhpcy5wZW5kaW5nQWRkaXRpb25zID0gW107XG4gICAgICB0aGlzLnBlbmRpbmdSZW1vdmFscyA9IFtdO1xuICAgICAgdGhpcy5wZW5kaW5nTW92ZXMgPSBbXTtcbiAgICAgIHRoaXMuY3JlYXRlZEJsb2NrcyA9IFtdO1xuICAgICAgdGhpcy5kaXNwb3NlZEJsb2NrcyA9IFtdO1xuICAgICAgdGhpcy5pbnRlcnZhbHNOb3RpZmllZCA9IFtdO1xuICAgICAgdGhpcy5ib3VuZGFyaWVzUmVjb3JkZWQgPSBmYWxzZTtcblxuICAgICAgdGhpcy5wcmV2aW91c0Jsb2NrcyA9IGJhY2tib25lLmJsb2Nrcy5zbGljZSggMCApOyAvLyBjb3B5IG9mIHByZXZpb3VzIGJsb2Nrc1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBSZW1vdmVzIG9iamVjdCByZWZlcmVuY2VzXG4gICAqIEBwdWJsaWNcbiAgICovXG4gIGNsZWFuKCkge1xuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5TdGl0Y2ggJiYgc2NlbmVyeUxvZy5TdGl0Y2goICdjbGVhbicgKTtcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuU3RpdGNoICYmIHNjZW5lcnlMb2cuU3RpdGNoKCAnLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0nICk7XG5cbiAgICBpZiAoIGFzc2VydFNsb3cgKSB7XG4gICAgICB0aGlzLmF1ZGl0U3RpdGNoKCk7XG5cbiAgICAgIHRoaXMuaW5pdGlhbGl6ZWQgPSBmYWxzZTtcbiAgICB9XG5cbiAgICB0aGlzLmJhY2tib25lID0gbnVsbDtcbiAgICB0aGlzLmZpcnN0RHJhd2FibGUgPSBudWxsO1xuICAgIHRoaXMubGFzdERyYXdhYmxlID0gbnVsbDtcblxuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5TdGl0Y2ggJiYgc2NlbmVyeUxvZy5wb3AoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBXcml0ZXMgdGhlIGZpcnN0L2xhc3QgZHJhd2FibGVzIGZvciB0aGUgZW50aXJlIGJhY2tib25lIGludG8gaXRzIG1lbW9yeS4gV2Ugd2FudCB0byB3YWl0IHRvIGRvIHRoaXMgdW50aWwgd2UgaGF2ZVxuICAgKiByZWFkIGZyb20gaXRzIHByZXZpb3VzIHZhbHVlcy5cbiAgICogQHByb3RlY3RlZFxuICAgKi9cbiAgcmVjb3JkQmFja2JvbmVCb3VuZGFyaWVzKCkge1xuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5TdGl0Y2ggJiYgc2NlbmVyeUxvZy5TdGl0Y2goIGByZWNvcmRpbmcgYmFja2JvbmUgYm91bmRhcmllczogJHtcbiAgICAgIHRoaXMuZmlyc3REcmF3YWJsZSA/IHRoaXMuZmlyc3REcmF3YWJsZS50b1N0cmluZygpIDogJ251bGwnXG4gICAgfSB0byAke1xuICAgICAgdGhpcy5sYXN0RHJhd2FibGUgPyB0aGlzLmxhc3REcmF3YWJsZS50b1N0cmluZygpIDogJ251bGwnfWAgKTtcbiAgICB0aGlzLmJhY2tib25lLnByZXZpb3VzRmlyc3REcmF3YWJsZSA9IHRoaXMuZmlyc3REcmF3YWJsZTtcbiAgICB0aGlzLmJhY2tib25lLnByZXZpb3VzTGFzdERyYXdhYmxlID0gdGhpcy5sYXN0RHJhd2FibGU7XG5cbiAgICBpZiAoIGFzc2VydFNsb3cgKSB7XG4gICAgICB0aGlzLmJvdW5kYXJpZXNSZWNvcmRlZCA9IHRydWU7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFJlY29yZHMgdGhhdCB0aGlzIHtEcmF3YWJsZX0gZHJhd2FibGUgc2hvdWxkIGJlIGFkZGVkL21vdmVkIHRvIHRoZSB7QmxvY2t9IGF0IGEgbGF0ZXIgdGltZVxuICAgKiBAcHJvdGVjdGVkXG4gICAqXG4gICAqIEBwYXJhbSB7RHJhd2FibGV9IGRyYXdhYmxlXG4gICAqIEBwYXJhbSB7QmxvY2t9IGJsb2NrXG4gICAqL1xuICBub3RlUGVuZGluZ0FkZGl0aW9uKCBkcmF3YWJsZSwgYmxvY2sgKSB7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggZHJhd2FibGUucmVuZGVyZXIgPT09IGJsb2NrLnJlbmRlcmVyICk7XG5cbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuU3RpdGNoICYmIHNjZW5lcnlMb2cuU3RpdGNoKCBgcGVuZGluZyBhZGQ6ICR7ZHJhd2FibGUudG9TdHJpbmcoKX0gdG8gJHtibG9jay50b1N0cmluZygpfWAgKTtcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuU3RpdGNoICYmIHNjZW5lcnlMb2cucHVzaCgpO1xuXG4gICAgZHJhd2FibGUubm90ZVBlbmRpbmdBZGRpdGlvbiggdGhpcy5iYWNrYm9uZS5kaXNwbGF5LCBibG9jaywgdGhpcy5iYWNrYm9uZSApO1xuXG4gICAgaWYgKCBhc3NlcnRTbG93ICkge1xuICAgICAgdGhpcy5wZW5kaW5nQWRkaXRpb25zLnB1c2goIHtcbiAgICAgICAgZHJhd2FibGU6IGRyYXdhYmxlLFxuICAgICAgICBibG9jazogYmxvY2tcbiAgICAgIH0gKTtcbiAgICB9XG5cbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuU3RpdGNoICYmIHNjZW5lcnlMb2cucG9wKCk7XG4gIH1cblxuICAvKipcbiAgICogUmVjb3JkcyB0aGF0IHRoaXMge0RyYXdhYmxlfSBkcmF3YWJsZSBzaG91bGQgYmUgbW92ZWQgdG8gdGhlIHtCbG9ja30gYXQgYSBsYXRlciB0aW1lIChjYWxsZWQgb25seSBvbiBleHRlcm5hbFxuICAgKiBkcmF3YWJsZXMpLiBub3RlUGVuZGluZ0FkZGl0aW9uIGFuZCBub3RlUGVuZGluZ1JlbW92YWwgc2hvdWxkIG5vdCBiZSBjYWxsZWQgb24gYSBkcmF3YWJsZSB0aGF0IGhhZFxuICAgKiBub3RlUGVuZGluZ01vdmUgY2FsbGVkIG9uIGl0IGR1cmluZyB0aGUgc2FtZSBzdGl0Y2gsIGFuZCB2aWNlIHZlcnNhLlxuICAgKiBAcHJvdGVjdGVkXG4gICAqXG4gICAqIEBwYXJhbSB7RHJhd2FibGV9IGRyYXdhYmxlXG4gICAqIEBwYXJhbSB7QmxvY2t9IGJsb2NrXG4gICAqL1xuICBub3RlUGVuZGluZ01vdmUoIGRyYXdhYmxlLCBibG9jayApIHtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBkcmF3YWJsZS5yZW5kZXJlciA9PT0gYmxvY2sucmVuZGVyZXIgKTtcblxuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5TdGl0Y2ggJiYgc2NlbmVyeUxvZy5TdGl0Y2goIGBwZW5kaW5nIG1vdmU6ICR7ZHJhd2FibGUudG9TdHJpbmcoKX0gdG8gJHtibG9jay50b1N0cmluZygpfWAgKTtcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuU3RpdGNoICYmIHNjZW5lcnlMb2cucHVzaCgpO1xuXG4gICAgZHJhd2FibGUubm90ZVBlbmRpbmdNb3ZlKCB0aGlzLmJhY2tib25lLmRpc3BsYXksIGJsb2NrICk7XG5cbiAgICBpZiAoIGFzc2VydFNsb3cgKSB7XG4gICAgICB0aGlzLnBlbmRpbmdNb3Zlcy5wdXNoKCB7XG4gICAgICAgIGRyYXdhYmxlOiBkcmF3YWJsZSxcbiAgICAgICAgYmxvY2s6IGJsb2NrXG4gICAgICB9ICk7XG4gICAgfVxuXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLlN0aXRjaCAmJiBzY2VuZXJ5TG9nLnBvcCgpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlY29yZHMgdGhhdCB0aGlzIHtEcmF3YWJsZX0gZHJhd2FibGUgc2hvdWxkIGJlIHJlbW92ZWQvbW92ZWQgZnJvbSB0aGUge0Jsb2NrfSBhdCBhIGxhdGVyIHRpbWVcbiAgICogQHByb3RlY3RlZFxuICAgKlxuICAgKiBAcGFyYW0ge0RyYXdhYmxlfSBkcmF3YWJsZVxuICAgKi9cbiAgbm90ZVBlbmRpbmdSZW1vdmFsKCBkcmF3YWJsZSApIHtcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuU3RpdGNoICYmIHNjZW5lcnlMb2cuU3RpdGNoKCBgcGVuZGluZyByZW1vdmU6ICR7ZHJhd2FibGUudG9TdHJpbmcoKX1gICk7XG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLlN0aXRjaCAmJiBzY2VuZXJ5TG9nLnB1c2goKTtcblxuICAgIGRyYXdhYmxlLm5vdGVQZW5kaW5nUmVtb3ZhbCggdGhpcy5iYWNrYm9uZS5kaXNwbGF5ICk7XG5cbiAgICBpZiAoIGFzc2VydFNsb3cgKSB7XG4gICAgICB0aGlzLnBlbmRpbmdSZW1vdmFscy5wdXNoKCB7XG4gICAgICAgIGRyYXdhYmxlOiBkcmF3YWJsZVxuICAgICAgfSApO1xuICAgIH1cblxuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5TdGl0Y2ggJiYgc2NlbmVyeUxvZy5wb3AoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZWNvcmRzIHRoYXQgdGhpcyB7QmxvY2t9IGJsb2NrIHNob3VsZCBiZSBkaXNwb3NlZCBhdCBhIGxhdGVyIHRpbWUuIEl0IHNob3VsZCBub3QgYmUgaW4gdGhlIGJsb2NrcyBhcnJheSBhdCB0aGVcbiAgICogZW5kIG9mIHRoZSBzdGl0Y2guXG4gICAqIEBwcm90ZWN0ZWRcbiAgICpcbiAgICogQHBhcmFtIHtCbG9ja30gYmxvY2tcbiAgICovXG4gIG1hcmtCbG9ja0ZvckRpc3Bvc2FsKCBibG9jayApIHtcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuU3RpdGNoICYmIHNjZW5lcnlMb2cuU3RpdGNoKCBgYmxvY2sgZm9yIGRpc3Bvc2FsOiAke2Jsb2NrLnRvU3RyaW5nKCl9YCApO1xuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5TdGl0Y2ggJiYgc2NlbmVyeUxvZy5wdXNoKCk7XG5cbiAgICAvL1RPRE86IFBFUkZPUk1BTkNFOiBkb2VzIHRoaXMgY2F1c2UgcmVmbG93cyAvIHN0eWxlIGNhbGN1bGF0aW9uIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9zY2VuZXJ5L2lzc3Vlcy8xNTgxXG4gICAgaWYgKCBibG9jay5kb21FbGVtZW50LnBhcmVudE5vZGUgPT09IHRoaXMuYmFja2JvbmUuZG9tRWxlbWVudCApIHtcbiAgICAgIC8vIGd1YXJkZWQsIHNpbmNlIHdlIG1heSBoYXZlIGEgKG5ldykgY2hpbGQgZHJhd2FibGUgYWRkIGl0IGJlZm9yZSB3ZSBjYW4gcmVtb3ZlIGl0XG4gICAgICB0aGlzLmJhY2tib25lLmRvbUVsZW1lbnQucmVtb3ZlQ2hpbGQoIGJsb2NrLmRvbUVsZW1lbnQgKTtcbiAgICB9XG4gICAgYmxvY2subWFya0ZvckRpc3Bvc2FsKCB0aGlzLmJhY2tib25lLmRpc3BsYXkgKTtcblxuICAgIGlmICggYXNzZXJ0U2xvdyApIHtcbiAgICAgIHRoaXMuZGlzcG9zZWRCbG9ja3MucHVzaCgge1xuICAgICAgICBibG9jazogYmxvY2tcbiAgICAgIH0gKTtcbiAgICB9XG5cbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuU3RpdGNoICYmIHNjZW5lcnlMb2cucG9wKCk7XG4gIH1cblxuICAvKipcbiAgICogQHByb3RlY3RlZFxuICAgKi9cbiAgcmVtb3ZlQWxsQmxvY2tzKCkge1xuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5TdGl0Y2ggJiYgc2NlbmVyeUxvZy5TdGl0Y2goIGBtYXJraW5nIGFsbCBibG9ja3MgZm9yIGRpc3Bvc2FsIChjb3VudCAke3RoaXMuYmFja2JvbmUuYmxvY2tzLmxlbmd0aH0pYCApO1xuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5TdGl0Y2ggJiYgc2NlbmVyeUxvZy5wdXNoKCk7XG5cbiAgICB3aGlsZSAoIHRoaXMuYmFja2JvbmUuYmxvY2tzLmxlbmd0aCApIHtcbiAgICAgIGNvbnN0IGJsb2NrID0gdGhpcy5iYWNrYm9uZS5ibG9ja3NbIDAgXTtcblxuICAgICAgdGhpcy5yZW1vdmVCbG9jayggYmxvY2sgKTtcbiAgICAgIHRoaXMubWFya0Jsb2NrRm9yRGlzcG9zYWwoIGJsb2NrICk7XG4gICAgfVxuXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLlN0aXRjaCAmJiBzY2VuZXJ5TG9nLnBvcCgpO1xuICB9XG5cbiAgLyoqXG4gICAqIEltbWVkaWF0ZWx5IG5vdGlmeSBhIGJsb2NrIG9mIGl0cyBmaXJzdC9sYXN0IGRyYXdhYmxlLlxuICAgKiBAcHJvdGVjdGVkXG4gICAqXG4gICAqIEBwYXJhbSB7QmxvY2t9IGJsb2NrXG4gICAqIEBwYXJhbSB7RHJhd2FibGV9IGZpcnN0RHJhd2FibGVcbiAgICogQHBhcmFtIHtEcmF3YWJsZX0gbGFzdERyYXdhYmxlXG4gICAqL1xuICBub3RpZnlJbnRlcnZhbCggYmxvY2ssIGZpcnN0RHJhd2FibGUsIGxhc3REcmF3YWJsZSApIHtcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuU3RpdGNoICYmIHNjZW5lcnlMb2cuU3RpdGNoKCBgbm90aWZ5IGludGVydmFsOiAke2Jsb2NrLnRvU3RyaW5nKCl9ICR7XG4gICAgICBmaXJzdERyYXdhYmxlLnRvU3RyaW5nKCl9IHRvICR7bGFzdERyYXdhYmxlLnRvU3RyaW5nKCl9YCApO1xuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5TdGl0Y2ggJiYgc2NlbmVyeUxvZy5wdXNoKCk7XG5cbiAgICBibG9jay5ub3RpZnlJbnRlcnZhbCggZmlyc3REcmF3YWJsZSwgbGFzdERyYXdhYmxlICk7XG5cbiAgICAvLyBtYXJrIGl0IGRpcnR5LCBzaW5jZSBpdHMgZHJhd2FibGVzIHByb2JhYmx5IGNoYW5nZWQ/XG4gICAgLy9PSFRXTyBUT0RPOiBpcyB0aGlzIG5lY2Vzc2FyeT8gV2hhdCBpcyB0aGlzIGRvaW5nPyBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvc2NlbmVyeS9pc3N1ZXMvMTU4MVxuICAgIHRoaXMuYmFja2JvbmUubWFya0RpcnR5RHJhd2FibGUoIGJsb2NrICk7XG5cbiAgICBpZiAoIGFzc2VydFNsb3cgKSB7XG4gICAgICB0aGlzLmludGVydmFsc05vdGlmaWVkLnB1c2goIHtcbiAgICAgICAgYmxvY2s6IGJsb2NrLFxuICAgICAgICBmaXJzdERyYXdhYmxlOiBmaXJzdERyYXdhYmxlLFxuICAgICAgICBsYXN0RHJhd2FibGU6IGxhc3REcmF3YWJsZVxuICAgICAgfSApO1xuICAgIH1cblxuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5TdGl0Y2ggJiYgc2NlbmVyeUxvZy5wb3AoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBOb3RlIGEgYmxvY2sncyB0ZW50YXRpdmUgZmlyc3QgZHJhd2FibGUgYW5kIGJsb2NrIGJlZm9yZSAoc2hvdWxkIGJlIGZsdXNoZWQgbGF0ZXIgd2l0aCB1cGRhdGVCbG9ja0ludGVydmFscygpKVxuICAgKiBAcHJvdGVjdGVkXG4gICAqXG4gICAqIEBwYXJhbSB7QmxvY2t9IGJsb2NrXG4gICAqIEBwYXJhbSB7RHJhd2FibGV9IGZpcnN0RHJhd2FibGVcbiAgICovXG4gIG1hcmtCZWZvcmVCbG9jayggYmxvY2ssIGZpcnN0RHJhd2FibGUgKSB7XG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLlN0aXRjaCAmJiBzY2VuZXJ5TG9nLlN0aXRjaCggYG1hcmtpbmcgYmxvY2sgZmlyc3QgZHJhd2FibGUgJHtibG9jay50b1N0cmluZygpfSB3aXRoICR7Zmlyc3REcmF3YWJsZS50b1N0cmluZygpfWAgKTtcblxuICAgIGJsb2NrLnBlbmRpbmdGaXJzdERyYXdhYmxlID0gZmlyc3REcmF3YWJsZTtcbiAgICB0aGlzLnRvdWNoZWRCbG9ja3MucHVzaCggYmxvY2sgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBOb3RlIGEgYmxvY2sncyB0ZW50YXRpdmUgbGFzdCBkcmF3YWJsZSBhbmQgYmxvY2sgYWZ0ZXIgKHNob3VsZCBiZSBmbHVzaGVkIGxhdGVyIHdpdGggdXBkYXRlQmxvY2tJbnRlcnZhbHMoKSlcbiAgICogQHByb3RlY3RlZFxuICAgKlxuICAgKiBAcGFyYW0ge0Jsb2NrfSBibG9ja1xuICAgKiBAcGFyYW0ge0RyYXdhYmxlfSBsYXN0RHJhd2FibGVcbiAgICovXG4gIG1hcmtBZnRlckJsb2NrKCBibG9jaywgbGFzdERyYXdhYmxlICkge1xuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5TdGl0Y2ggJiYgc2NlbmVyeUxvZy5TdGl0Y2goIGBtYXJraW5nIGJsb2NrIGxhc3QgZHJhd2FibGUgJHtibG9jay50b1N0cmluZygpfSB3aXRoICR7bGFzdERyYXdhYmxlLnRvU3RyaW5nKCl9YCApO1xuXG4gICAgYmxvY2sucGVuZGluZ0xhc3REcmF3YWJsZSA9IGxhc3REcmF3YWJsZTtcbiAgICB0aGlzLnRvdWNoZWRCbG9ja3MucHVzaCggYmxvY2sgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBGbHVzaGVzIG1hcmtCZWZvcmVCbG9jay9tYXJrQWZ0ZXJCbG9jayBjaGFuZ2VzIHRvIG5vdGlmeUludGVydmFsIG9uIGJsb2NrcyB0aGVtc2VsdmVzLlxuICAgKiBAcHJvdGVjdGVkXG4gICAqL1xuICB1cGRhdGVCbG9ja0ludGVydmFscygpIHtcbiAgICB3aGlsZSAoIHRoaXMudG91Y2hlZEJsb2Nrcy5sZW5ndGggKSB7XG4gICAgICBjb25zdCBibG9jayA9IHRoaXMudG91Y2hlZEJsb2Nrcy5wb3AoKTtcblxuICAgICAgaWYgKCBibG9jay51c2VkICkge1xuICAgICAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuU3RpdGNoICYmIHNjZW5lcnlMb2cuU3RpdGNoKCBgdXBkYXRlIGludGVydmFsOiAke2Jsb2NrLnRvU3RyaW5nKCl9ICR7XG4gICAgICAgICAgYmxvY2sucGVuZGluZ0ZpcnN0RHJhd2FibGUudG9TdHJpbmcoKX0gdG8gJHtibG9jay5wZW5kaW5nTGFzdERyYXdhYmxlLnRvU3RyaW5nKCl9YCApO1xuXG4gICAgICAgIGJsb2NrLnVwZGF0ZUludGVydmFsKCk7XG5cbiAgICAgICAgLy8gbWFyayBpdCBkaXJ0eSwgc2luY2UgaXRzIGRyYXdhYmxlcyBwcm9iYWJseSBjaGFuZ2VkP1xuICAgICAgICAvL09IVFdPIFRPRE86IGlzIHRoaXMgbmVjZXNzYXJ5PyBXaGF0IGlzIHRoaXMgZG9pbmc/IGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9zY2VuZXJ5L2lzc3Vlcy8xNTgxXG4gICAgICAgIHRoaXMuYmFja2JvbmUubWFya0RpcnR5RHJhd2FibGUoIGJsb2NrICk7XG5cbiAgICAgICAgaWYgKCBhc3NlcnRTbG93ICkge1xuICAgICAgICAgIHRoaXMuaW50ZXJ2YWxzTm90aWZpZWQucHVzaCgge1xuICAgICAgICAgICAgYmxvY2s6IGJsb2NrLFxuICAgICAgICAgICAgZmlyc3REcmF3YWJsZTogYmxvY2sucGVuZGluZ0ZpcnN0RHJhd2FibGUsXG4gICAgICAgICAgICBsYXN0RHJhd2FibGU6IGJsb2NrLnBlbmRpbmdMYXN0RHJhd2FibGVcbiAgICAgICAgICB9ICk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGVsc2Uge1xuICAgICAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuU3RpdGNoICYmIHNjZW5lcnlMb2cuU3RpdGNoKCBgc2tpcHBpbmcgdXBkYXRlIGludGVydmFsOiAke2Jsb2NrLnRvU3RyaW5nKCl9LCB1bnVzZWRgICk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIENyZWF0ZXMgYSBmcmVzaCBibG9jayB3aXRoIHRoZSBkZXNpcmVkIHJlbmRlcmVyIGFuZCB7RHJhd2FibGV9IGFyYml0cmFyeSBkcmF3YWJsZSBpbmNsdWRlZCwgYW5kIGFkZHMgaXQgdG9cbiAgICogb3VyIERPTS5cbiAgICogQHByb3RlY3RlZFxuICAgKlxuICAgKiBAcGFyYW0ge251bWJlcn0gcmVuZGVyZXJcbiAgICogQHBhcmFtIHtEcmF3YWJsZX0gZHJhd2FibGVcbiAgICogQHJldHVybnMge0Jsb2NrfVxuICAgKi9cbiAgY3JlYXRlQmxvY2soIHJlbmRlcmVyLCBkcmF3YWJsZSApIHtcbiAgICBjb25zdCBiYWNrYm9uZSA9IHRoaXMuYmFja2JvbmU7XG4gICAgbGV0IGJsb2NrO1xuXG4gICAgaWYgKCBSZW5kZXJlci5pc0NhbnZhcyggcmVuZGVyZXIgKSApIHtcbiAgICAgIGJsb2NrID0gQ2FudmFzQmxvY2suY3JlYXRlRnJvbVBvb2woIGJhY2tib25lLmRpc3BsYXksIHJlbmRlcmVyLCBiYWNrYm9uZS50cmFuc2Zvcm1Sb290SW5zdGFuY2UsIGJhY2tib25lLmJhY2tib25lSW5zdGFuY2UgKTtcbiAgICB9XG4gICAgZWxzZSBpZiAoIFJlbmRlcmVyLmlzU1ZHKCByZW5kZXJlciApICkge1xuICAgICAgLy9PSFRXTyBUT0RPOiBoYW5kbGUgZmlsdGVyIHJvb3Qgc2VwYXJhdGVseSBmcm9tIHRoZSBiYWNrYm9uZSBpbnN0YW5jZT8gaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3NjZW5lcnkvaXNzdWVzLzE1ODFcbiAgICAgIGJsb2NrID0gU1ZHQmxvY2suY3JlYXRlRnJvbVBvb2woIGJhY2tib25lLmRpc3BsYXksIHJlbmRlcmVyLCBiYWNrYm9uZS50cmFuc2Zvcm1Sb290SW5zdGFuY2UsIGJhY2tib25lLmJhY2tib25lSW5zdGFuY2UgKTtcbiAgICB9XG4gICAgZWxzZSBpZiAoIFJlbmRlcmVyLmlzRE9NKCByZW5kZXJlciApICkge1xuICAgICAgYmxvY2sgPSBET01CbG9jay5jcmVhdGVGcm9tUG9vbCggYmFja2JvbmUuZGlzcGxheSwgZHJhd2FibGUgKTtcbiAgICB9XG4gICAgZWxzZSBpZiAoIFJlbmRlcmVyLmlzV2ViR0woIHJlbmRlcmVyICkgKSB7XG4gICAgICBibG9jayA9IFdlYkdMQmxvY2suY3JlYXRlRnJvbVBvb2woIGJhY2tib25lLmRpc3BsYXksIHJlbmRlcmVyLCBiYWNrYm9uZS50cmFuc2Zvcm1Sb290SW5zdGFuY2UsIGJhY2tib25lLmJhY2tib25lSW5zdGFuY2UgKTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoIGB1bnN1cHBvcnRlZCByZW5kZXJlciBmb3IgY3JlYXRlQmxvY2s6ICR7cmVuZGVyZXJ9YCApO1xuICAgIH1cblxuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5TdGl0Y2ggJiYgc2NlbmVyeUxvZy5TdGl0Y2goIGBjcmVhdGVkIGJsb2NrOiAke2Jsb2NrLnRvU3RyaW5nKClcbiAgICB9IHdpdGggcmVuZGVyZXI6ICR7cmVuZGVyZXJcbiAgICB9IGZvciBkcmF3YWJsZTogJHtkcmF3YWJsZS50b1N0cmluZygpfWAgKTtcblxuICAgIGJsb2NrLnNldEJsb2NrQmFja2JvbmUoIGJhY2tib25lICk7XG5cbiAgICAvL09IVFdPIFRPRE86IG1pbm9yIHNwZWVkdXAgYnkgYXBwZW5kaW5nIG9ubHkgb25jZSBpdHMgZnJhZ21lbnQgaXMgY29uc3RydWN0ZWQ/IG9yIHVzZSBEb2N1bWVudEZyYWdtZW50PyBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvc2NlbmVyeS9pc3N1ZXMvMTU4MVxuICAgIGJhY2tib25lLmRvbUVsZW1lbnQuYXBwZW5kQ2hpbGQoIGJsb2NrLmRvbUVsZW1lbnQgKTtcblxuICAgIC8vIGlmIGJhY2tib25lIGlzIGEgZGlzcGxheSByb290LCBoaWRlIGFsbCBvZiBpdHMgY29udGVudCBmcm9tIHNjcmVlbiByZWFkZXJzXG4gICAgaWYgKCBiYWNrYm9uZS5pc0Rpc3BsYXlSb290ICkge1xuICAgICAgYmxvY2suZG9tRWxlbWVudC5zZXRBdHRyaWJ1dGUoICdhcmlhLWhpZGRlbicsIHRydWUgKTtcbiAgICB9XG5cbiAgICAvLyBtYXJrIGl0IGRpcnR5IGZvciBub3csIHNvIHdlIGNhbiBjaGVja1xuICAgIGJhY2tib25lLm1hcmtEaXJ0eURyYXdhYmxlKCBibG9jayApO1xuXG4gICAgaWYgKCBhc3NlcnRTbG93ICkge1xuICAgICAgdGhpcy5jcmVhdGVkQmxvY2tzLnB1c2goIHtcbiAgICAgICAgYmxvY2s6IGJsb2NrLFxuICAgICAgICByZW5kZXJlcjogcmVuZGVyZXIsXG4gICAgICAgIGRyYXdhYmxlOiBkcmF3YWJsZVxuICAgICAgfSApO1xuICAgIH1cblxuICAgIHJldHVybiBibG9jaztcbiAgfVxuXG4gIC8qKlxuICAgKiBJbW1lZGlhdGVseSBhcHBlbmRzIGEgYmxvY2sgdG8gb3VyIGJsb2NrcyBhcnJheVxuICAgKiBAcHJvdGVjdGVkXG4gICAqXG4gICAqIEBwYXJhbSB7QmxvY2t9IGJsb2NrXG4gICAqL1xuICBhcHBlbmRCbG9jayggYmxvY2sgKSB7XG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLlN0aXRjaCAmJiBzY2VuZXJ5TG9nLlN0aXRjaCggYGFwcGVuZGluZyBibG9jazogJHtibG9jay50b1N0cmluZygpfWAgKTtcblxuICAgIHRoaXMuYmFja2JvbmUuYmxvY2tzLnB1c2goIGJsb2NrICk7XG5cbiAgICBpZiAoIGFzc2VydFNsb3cgKSB7XG4gICAgICB0aGlzLnJlaW5kZXhlZCA9IGZhbHNlO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBJbW1lZGlhdGVseSByZW1vdmVzIGEgYmxvY2sgdG8gb3VyIGJsb2NrcyBhcnJheVxuICAgKiBAcHJvdGVjdGVkXG4gICAqXG4gICAqIEBwYXJhbSB7QmxvY2t9IGJsb2NrXG4gICAqL1xuICByZW1vdmVCbG9jayggYmxvY2sgKSB7XG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLlN0aXRjaCAmJiBzY2VuZXJ5TG9nLlN0aXRjaCggYHJlbW92aW5nIGJsb2NrOiAke2Jsb2NrLnRvU3RyaW5nKCl9YCApO1xuXG4gICAgLy8gcmVtb3ZlIHRoZSBibG9jayBmcm9tIG91ciBpbnRlcm5hbCBsaXN0XG4gICAgY29uc3QgYmxvY2tJbmRleCA9IF8uaW5kZXhPZiggdGhpcy5iYWNrYm9uZS5ibG9ja3MsIGJsb2NrICk7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggYmxvY2tJbmRleCA+PSAwLCBgQ2Fubm90IHJlbW92ZSBibG9jaywgbm90IGF0dGFjaGVkOiAke2Jsb2NrLnRvU3RyaW5nKCl9YCApO1xuICAgIHRoaXMuYmFja2JvbmUuYmxvY2tzLnNwbGljZSggYmxvY2tJbmRleCwgMSApO1xuXG4gICAgaWYgKCBhc3NlcnRTbG93ICkge1xuICAgICAgdGhpcy5yZWluZGV4ZWQgPSBmYWxzZTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQHByb3RlY3RlZFxuICAgKi9cbiAgdXNlTm9CbG9ja3MoKSB7XG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLlN0aXRjaCAmJiBzY2VuZXJ5TG9nLlN0aXRjaCggJ3VzaW5nIG5vIGJsb2NrcycgKTtcblxuICAgIC8vIGkuZS4gd2Ugd2lsbCBub3QgdXNlIGFueSBibG9ja3NcbiAgICBjbGVhbkFycmF5KCB0aGlzLmJhY2tib25lLmJsb2NrcyApO1xuICB9XG5cbiAgLyoqXG4gICAqIFRyaWdnZXJzIGFsbCBibG9ja3MgaW4gdGhlIGJsb2NrcyBhcnJheSB0byBoYXZlIHRoZWlyIHotaW5kZXggcHJvcGVydGllcyBzZXQgc28gdGhhdCB0aGV5IHZpc3VhbGx5IHN0YWNrXG4gICAqIGNvcnJlY3RseS5cbiAgICogQHByb3RlY3RlZFxuICAgKi9cbiAgcmVpbmRleCgpIHtcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuU3RpdGNoICYmIHNjZW5lcnlMb2cuU3RpdGNoKCAncmVpbmRleGluZyBibG9ja3MnICk7XG5cbiAgICB0aGlzLmJhY2tib25lLnJlaW5kZXhCbG9ja3MoKTtcblxuICAgIGlmICggYXNzZXJ0U2xvdyApIHtcbiAgICAgIHRoaXMucmVpbmRleGVkID0gdHJ1ZTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQW4gYXVkaXQgZm9yIHRlc3RpbmcgYXNzZXJ0aW9uc1xuICAgKiBAcHJvdGVjdGVkXG4gICAqL1xuICBhdWRpdFN0aXRjaCgpIHtcbiAgICBpZiAoIGFzc2VydFNsb3cgKSB7XG4gICAgICBjb25zdCBibG9ja3MgPSB0aGlzLmJhY2tib25lLmJsb2NrcztcbiAgICAgIGNvbnN0IHByZXZpb3VzQmxvY2tzID0gdGhpcy5wcmV2aW91c0Jsb2NrcztcblxuICAgICAgYXNzZXJ0U2xvdyggdGhpcy5pbml0aWFsaXplZCwgJ1dlIHNlZW0gdG8gaGF2ZSBmaW5pc2hlZCBhIHN0aXRjaCB3aXRob3V0IHByb3BlciBpbml0aWFsaXphdGlvbicgKTtcbiAgICAgIGFzc2VydFNsb3coIHRoaXMuYm91bmRhcmllc1JlY29yZGVkLCAnT3VyIHN0aXRjaCBBUEkgcmVxdWlyZXMgcmVjb3JkQmFja2JvbmVCb3VuZGFyaWVzKCkgdG8gYmUgY2FsbGVkIGJlZm9yZScgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICcgaXQgaXMgZmluaXNoZWQuJyApO1xuXG4gICAgICAvLyBlbnN1cmUgb3VyIGluZGljZXMgYXJlIHVwLXRvLWRhdGUgKHJlaW5kZXhlZCwgb3IgZGlkIG5vdCBjaGFuZ2UpXG4gICAgICBhc3NlcnRTbG93KCB0aGlzLnJlaW5kZXhlZCB8fCBibG9ja3MubGVuZ3RoID09PSAwIHx8XG4gICAgICAgICAgICAgICAgICAvLyBhcnJheSBlcXVhbGl0eSBvZiBwcmV2aW91c0Jsb2NrcyBhbmQgYmxvY2tzXG4gICAgICAgICAgICAgICAgICAoIHByZXZpb3VzQmxvY2tzLmxlbmd0aCA9PT0gYmxvY2tzLmxlbmd0aCAmJlxuICAgICAgICAgICAgICAgICAgICBfLmV2ZXJ5KCBfLnppcCggcHJldmlvdXNCbG9ja3MsIGJsb2NrcyApLCBhcnIgPT4gYXJyWyAwIF0gPT09IGFyclsgMSBdICkgKSxcbiAgICAgICAgJ0RpZCBub3QgcmVpbmRleCBvbiBhIGJsb2NrIGNoYW5nZSB3aGVyZSB3ZSBhcmUgbGVmdCB3aXRoIGJsb2NrcycgKTtcblxuICAgICAgLy8gYWxsIGNyZWF0ZWQgYmxvY2tzIGhhZCBpbnRlcnZhbHMgbm90aWZpZWRcbiAgICAgIF8uZWFjaCggdGhpcy5jcmVhdGVkQmxvY2tzLCBibG9ja0RhdGEgPT4ge1xuICAgICAgICBhc3NlcnRTbG93KCBfLnNvbWUoIHRoaXMuaW50ZXJ2YWxzTm90aWZpZWQsIGludGVydmFsRGF0YSA9PiBibG9ja0RhdGEuYmxvY2sgPT09IGludGVydmFsRGF0YS5ibG9jayApLCBgQ3JlYXRlZCBibG9jayBkb2VzIG5vdCBzZWVtIHRvIGhhdmUgYW4gaW50ZXJ2YWwgbm90aWZpZWQ6ICR7YmxvY2tEYXRhLmJsb2NrLnRvU3RyaW5nKCl9YCApO1xuICAgICAgfSApO1xuXG4gICAgICAvLyBubyBkaXNwb3NlZCBibG9ja3MgaGFkIGludGVydmFscyBub3RpZmllZFxuICAgICAgXy5lYWNoKCB0aGlzLmRpc3Bvc2VkQmxvY2tzLCBibG9ja0RhdGEgPT4ge1xuICAgICAgICBhc3NlcnRTbG93KCAhXy5zb21lKCB0aGlzLmludGVydmFsc05vdGlmaWVkLCBpbnRlcnZhbERhdGEgPT4gYmxvY2tEYXRhLmJsb2NrID09PSBpbnRlcnZhbERhdGEuYmxvY2sgKSwgYFJlbW92ZWQgYmxvY2sgc2VlbXMgdG8gaGF2ZSBhbiBpbnRlcnZhbCBub3RpZmllZDogJHtibG9ja0RhdGEuYmxvY2sudG9TdHJpbmcoKX1gICk7XG4gICAgICB9ICk7XG5cbiAgICAgIC8vIGFsbCBkcmF3YWJsZXMgZm9yIGRpc3Bvc2VkIGJsb2NrcyBoYXZlIGJlZW4gbWFya2VkIGFzIHBlbmRpbmcgcmVtb3ZhbCAob3IgbW92ZWQpXG4gICAgICBfLmVhY2goIHRoaXMuZGlzcG9zZWRCbG9ja3MsIGJsb2NrRGF0YSA9PiB7XG4gICAgICAgIGNvbnN0IGJsb2NrID0gYmxvY2tEYXRhLmJsb2NrO1xuICAgICAgICBfLmVhY2goIERyYXdhYmxlLm9sZExpc3RUb0FycmF5KCBibG9jay5maXJzdERyYXdhYmxlLCBibG9jay5sYXN0RHJhd2FibGUgKSwgZHJhd2FibGUgPT4ge1xuICAgICAgICAgIGFzc2VydFNsb3coIF8uc29tZSggdGhpcy5wZW5kaW5nUmVtb3ZhbHMsIHJlbW92YWxEYXRhID0+IHJlbW92YWxEYXRhLmRyYXdhYmxlID09PSBkcmF3YWJsZSApIHx8IF8uc29tZSggdGhpcy5wZW5kaW5nTW92ZXMsIG1vdmVEYXRhID0+IG1vdmVEYXRhLmRyYXdhYmxlID09PSBkcmF3YWJsZSApLCBgRHJhd2FibGUgJHtkcmF3YWJsZS50b1N0cmluZygpfSBvcmlnaW5hbGx5IGxpc3RlZCBmb3IgZGlzcG9zZWQgYmxvY2sgJHtibG9jay50b1N0cmluZygpXG4gICAgICAgICAgfSBkb2VzIG5vdCBzZWVtIHRvIGJlIG1hcmtlZCBmb3IgcGVuZGluZyByZW1vdmFsIG9yIG1vdmUhYCApO1xuICAgICAgICB9ICk7XG4gICAgICB9ICk7XG5cbiAgICAgIC8vIGFsbCBkcmF3YWJsZXMgZm9yIGNyZWF0ZWQgYmxvY2tzIGhhdmUgYmVlbiBtYXJrZWQgYXMgcGVuZGluZyBhZGRpdGlvbiBvciBtb3ZlZCBmb3Igb3VyIGJsb2NrXG4gICAgICBfLmVhY2goIHRoaXMuY3JlYXRlZEJsb2NrcywgYmxvY2tEYXRhID0+IHtcbiAgICAgICAgY29uc3QgYmxvY2sgPSBibG9ja0RhdGEuYmxvY2s7XG4gICAgICAgIF8uZWFjaCggRHJhd2FibGUubGlzdFRvQXJyYXkoIGJsb2NrLnBlbmRpbmdGaXJzdERyYXdhYmxlLCBibG9jay5wZW5kaW5nTGFzdERyYXdhYmxlICksIGRyYXdhYmxlID0+IHtcbiAgICAgICAgICBhc3NlcnRTbG93KCBfLnNvbWUoIHRoaXMucGVuZGluZ0FkZGl0aW9ucywgYWRkaXRpb25EYXRhID0+IGFkZGl0aW9uRGF0YS5kcmF3YWJsZSA9PT0gZHJhd2FibGUgJiYgYWRkaXRpb25EYXRhLmJsb2NrID09PSBibG9jayApIHx8IF8uc29tZSggdGhpcy5wZW5kaW5nTW92ZXMsIG1vdmVEYXRhID0+IG1vdmVEYXRhLmRyYXdhYmxlID09PSBkcmF3YWJsZSAmJiBtb3ZlRGF0YS5ibG9jayA9PT0gYmxvY2sgKSwgYERyYXdhYmxlICR7ZHJhd2FibGUudG9TdHJpbmcoKX0gbm93IGxpc3RlZCBmb3IgY3JlYXRlZCBibG9jayAke2Jsb2NrLnRvU3RyaW5nKClcbiAgICAgICAgICB9IGRvZXMgbm90IHNlZW0gdG8gYmUgbWFya2VkIGZvciBwZW5kaW5nIGFkZGl0aW9uIG9yIG1vdmUhYCApO1xuICAgICAgICB9ICk7XG4gICAgICB9ICk7XG5cbiAgICAgIC8vIGFsbCBkaXNwb3NlZCBibG9ja3Mgc2hvdWxkIGhhdmUgYmVlbiByZW1vdmVkXG4gICAgICBfLmVhY2goIHRoaXMuZGlzcG9zZWRCbG9ja3MsIGJsb2NrRGF0YSA9PiB7XG4gICAgICAgIGNvbnN0IGJsb2NrSWR4ID0gXy5pbmRleE9mKCBibG9ja3MsIGJsb2NrRGF0YS5ibG9jayApO1xuICAgICAgICBhc3NlcnRTbG93KCBibG9ja0lkeCA8IDAsIGBEaXNwb3NlZCBibG9jayAke2Jsb2NrRGF0YS5ibG9jay50b1N0cmluZygpfSBzdGlsbCBwcmVzZW50IGF0IGluZGV4ICR7YmxvY2tJZHh9YCApO1xuICAgICAgfSApO1xuXG4gICAgICAvLyBhbGwgY3JlYXRlZCBibG9ja3Mgc2hvdWxkIGhhdmUgYmVlbiBhZGRlZFxuICAgICAgXy5lYWNoKCB0aGlzLmNyZWF0ZWRCbG9ja3MsIGJsb2NrRGF0YSA9PiB7XG4gICAgICAgIGNvbnN0IGJsb2NrSWR4ID0gXy5pbmRleE9mKCBibG9ja3MsIGJsb2NrRGF0YS5ibG9jayApO1xuICAgICAgICBhc3NlcnRTbG93KCBibG9ja0lkeCA+PSAwLCBgQ3JlYXRlZCBibG9jayAke2Jsb2NrRGF0YS5ibG9jay50b1N0cmluZygpfSBpcyBub3QgaW4gdGhlIGJsb2NrcyBhcnJheWAgKTtcbiAgICAgIH0gKTtcblxuICAgICAgLy8gYWxsIGN1cnJlbnQgYmxvY2tzIHNob3VsZCBiZSBtYXJrZWQgYXMgdXNlZFxuICAgICAgXy5lYWNoKCBibG9ja3MsIGJsb2NrID0+IHtcbiAgICAgICAgYXNzZXJ0U2xvdyggYmxvY2sudXNlZCwgJ0FsbCBjdXJyZW50IGJsb2NrcyBzaG91bGQgYmUgbWFya2VkIGFzIHVzZWQnICk7XG4gICAgICB9ICk7XG5cbiAgICAgIGFzc2VydFNsb3coIGJsb2Nrcy5sZW5ndGggLSBwcmV2aW91c0Jsb2Nrcy5sZW5ndGggPT09IHRoaXMuY3JlYXRlZEJsb2Nrcy5sZW5ndGggLSB0aGlzLmRpc3Bvc2VkQmxvY2tzLmxlbmd0aCxcbiAgICAgICAgYCR7J1RoZSBjb3VudCBvZiB1bm1vZGlmaWVkIGJsb2NrcyBzaG91bGQgYmUgY29uc3RhbnQgKGVxdWFsIGRpZmZlcmVuY2VzKTpcXG4nICtcbiAgICAgICAgJ2NyZWF0ZWQ6ICd9JHtfLm1hcCggdGhpcy5jcmVhdGVkQmxvY2tzLCBuID0+IG4uYmxvY2suaWQgKS5qb2luKCAnLCcgKX1cXG5gICtcbiAgICAgICAgYGRpc3Bvc2VkOiAke18ubWFwKCB0aGlzLmRpc3Bvc2VkQmxvY2tzLCBuID0+IG4uYmxvY2suaWQgKS5qb2luKCAnLCcgKX1cXG5gICtcbiAgICAgICAgYGJlZm9yZTogJHtfLm1hcCggcHJldmlvdXNCbG9ja3MsIG4gPT4gbi5pZCApLmpvaW4oICcsJyApfVxcbmAgK1xuICAgICAgICBgYWZ0ZXI6ICR7Xy5tYXAoIGJsb2NrcywgbiA9PiBuLmlkICkuam9pbiggJywnICl9YCApO1xuXG4gICAgICBhc3NlcnRTbG93KCB0aGlzLnRvdWNoZWRCbG9ja3MubGVuZ3RoID09PSAwLFxuICAgICAgICAnSWYgd2UgbWFya2VkIGFueSBibG9ja3MgZm9yIGNoYW5nZXMsIHdlIHNob3VsZCBoYXZlIGNhbGxlZCB1cGRhdGVCbG9ja0ludGVydmFscycgKTtcblxuICAgICAgaWYgKCBibG9ja3MubGVuZ3RoICkge1xuXG4gICAgICAgIGFzc2VydFNsb3coIHRoaXMuYmFja2JvbmUucHJldmlvdXNGaXJzdERyYXdhYmxlICE9PSBudWxsICYmXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuYmFja2JvbmUucHJldmlvdXNMYXN0RHJhd2FibGUgIT09IG51bGwsXG4gICAgICAgICAgJ0lmIHdlIGFyZSBsZWZ0IHdpdGggYXQgbGVhc3Qgb25lIGJsb2NrLCB3ZSBtdXN0IGJlIHRyYWNraW5nIGF0IGxlYXN0IG9uZSBkcmF3YWJsZScgKTtcblxuICAgICAgICBhc3NlcnRTbG93KCBibG9ja3NbIDAgXS5wZW5kaW5nRmlyc3REcmF3YWJsZSA9PT0gdGhpcy5iYWNrYm9uZS5wcmV2aW91c0ZpcnN0RHJhd2FibGUsXG4gICAgICAgICAgJ091ciBmaXJzdCBkcmF3YWJsZSBzaG91bGQgbWF0Y2ggdGhlIGZpcnN0IGRyYXdhYmxlIG9mIG91ciBmaXJzdCBibG9jaycgKTtcblxuICAgICAgICBhc3NlcnRTbG93KCBibG9ja3NbIGJsb2Nrcy5sZW5ndGggLSAxIF0ucGVuZGluZ0xhc3REcmF3YWJsZSA9PT0gdGhpcy5iYWNrYm9uZS5wcmV2aW91c0xhc3REcmF3YWJsZSxcbiAgICAgICAgICAnT3VyIGxhc3QgZHJhd2FibGUgc2hvdWxkIG1hdGNoIHRoZSBsYXN0IGRyYXdhYmxlIG9mIG91ciBsYXN0IGJsb2NrJyApO1xuXG4gICAgICAgIGZvciAoIGxldCBpID0gMDsgaSA8IGJsb2Nrcy5sZW5ndGggLSAxOyBpKysgKSB7XG4gICAgICAgICAgLy8gW2ldIGFuZCBbaSsxXSBhcmUgYSBwYWlyIG9mIGNvbnNlY3V0aXZlIGJsb2Nrc1xuICAgICAgICAgIGFzc2VydFNsb3coIGJsb2Nrc1sgaSBdLnBlbmRpbmdMYXN0RHJhd2FibGUubmV4dERyYXdhYmxlID09PSBibG9ja3NbIGkgKyAxIF0ucGVuZGluZ0ZpcnN0RHJhd2FibGUgJiZcbiAgICAgICAgICAgICAgICAgICAgICBibG9ja3NbIGkgXS5wZW5kaW5nTGFzdERyYXdhYmxlID09PSBibG9ja3NbIGkgKyAxIF0ucGVuZGluZ0ZpcnN0RHJhd2FibGUucHJldmlvdXNEcmF3YWJsZSxcbiAgICAgICAgICAgICdDb25zZWN1dGl2ZSBibG9ja3Mgc2hvdWxkIGhhdmUgYm91bmRhcnkgZHJhd2FibGVzIHRoYXQgYXJlIGFsc28gY29uc2VjdXRpdmUgaW4gdGhlIGxpbmtlZCBsaXN0JyApO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgYXNzZXJ0U2xvdyggdGhpcy5iYWNrYm9uZS5wcmV2aW91c0ZpcnN0RHJhd2FibGUgPT09IG51bGwgJiZcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5iYWNrYm9uZS5wcmV2aW91c0xhc3REcmF3YWJsZSA9PT0gbnVsbCxcbiAgICAgICAgICAnSWYgd2UgYXJlIGxlZnQgd2l0aCBubyBibG9ja3MsIGl0IG11c3QgbWVhbiB3ZSBhcmUgdHJhY2tpbmcgcHJlY2lzZWx5IHplcm8gZHJhd2FibGVzJyApO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBAcHVibGljXG4gICAqXG4gICAqIEBwYXJhbSB7Q2hhbmdlSW50ZXJ2YWx9IGZpcnN0Q2hhbmdlSW50ZXJ2YWxcbiAgICovXG4gIHN0YXRpYyBkZWJ1Z0ludGVydmFscyggZmlyc3RDaGFuZ2VJbnRlcnZhbCApIHtcbiAgICBpZiAoIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5TdGl0Y2ggKSB7XG4gICAgICBmb3IgKCBsZXQgZGVidWdJbnRlcnZhbCA9IGZpcnN0Q2hhbmdlSW50ZXJ2YWw7IGRlYnVnSW50ZXJ2YWwgIT09IG51bGw7IGRlYnVnSW50ZXJ2YWwgPSBkZWJ1Z0ludGVydmFsLm5leHRDaGFuZ2VJbnRlcnZhbCApIHtcbiAgICAgICAgc2NlbmVyeUxvZy5TdGl0Y2goIGAgIGludGVydmFsOiAke1xuICAgICAgICAgIGRlYnVnSW50ZXJ2YWwuaXNFbXB0eSgpID8gJyhlbXB0eSkgJyA6ICcnXG4gICAgICAgIH0ke2RlYnVnSW50ZXJ2YWwuZHJhd2FibGVCZWZvcmUgPyBkZWJ1Z0ludGVydmFsLmRyYXdhYmxlQmVmb3JlLnRvU3RyaW5nKCkgOiAnLSd9IHRvICR7XG4gICAgICAgICAgZGVidWdJbnRlcnZhbC5kcmF3YWJsZUFmdGVyID8gZGVidWdJbnRlcnZhbC5kcmF3YWJsZUFmdGVyLnRvU3RyaW5nKCkgOiAnLSd9YCApO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBMb2dzIGEgYnVuY2ggb2YgaW5mb3JtYXRpb24gYWJvdXQgdGhlIG9sZCAodXNlQ3VycmVudD09PWZhbHNlKSBvciBuZXcgKHVzZUN1cnJlbnQ9PT10cnVlKSBkcmF3YWJsZSBsaW5rZWQgbGlzdC5cbiAgICogQHB1YmxpY1xuICAgKlxuICAgKiBAcGFyYW0ge0RyYXdhYmxlfG51bGx9IGZpcnN0RHJhd2FibGVcbiAgICogQHBhcmFtIHtEcmF3YWJsZXxudWxsfSBsYXN0RHJhd2FibGVcbiAgICogQHBhcmFtIHtDaGFuZ2VJbnRlcnZhbH0gZmlyc3RDaGFuZ2VJbnRlcnZhbFxuICAgKiBAcGFyYW0ge0NoYW5nZUludGVydmFsfSBsYXN0Q2hhbmdlSW50ZXJ2YWxcbiAgICogQHBhcmFtIHtib29sZWFufSB1c2VDdXJyZW50XG4gICAqL1xuICBzdGF0aWMgZGVidWdEcmF3YWJsZXMoIGZpcnN0RHJhd2FibGUsIGxhc3REcmF3YWJsZSwgZmlyc3RDaGFuZ2VJbnRlcnZhbCwgbGFzdENoYW5nZUludGVydmFsLCB1c2VDdXJyZW50ICkge1xuICAgIGlmICggc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLlN0aXRjaERyYXdhYmxlcyApIHtcbiAgICAgIGlmICggZmlyc3REcmF3YWJsZSA9PT0gbnVsbCApIHtcbiAgICAgICAgc2NlbmVyeUxvZy5TdGl0Y2hEcmF3YWJsZXMoICdub3RoaW5nJywgJ2NvbG9yOiAjNjY2OycgKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBsZXQgaXNDaGFuZ2VkID0gZmlyc3RDaGFuZ2VJbnRlcnZhbC5kcmF3YWJsZUJlZm9yZSA9PT0gbnVsbDtcbiAgICAgIGxldCBjdXJyZW50SW50ZXJ2YWwgPSBmaXJzdENoYW5nZUludGVydmFsO1xuXG4gICAgICBmb3IgKCBsZXQgZHJhd2FibGUgPSBmaXJzdERyYXdhYmxlOyA7IGRyYXdhYmxlID0gKCB1c2VDdXJyZW50ID8gZHJhd2FibGUubmV4dERyYXdhYmxlIDogZHJhd2FibGUub2xkTmV4dERyYXdhYmxlICkgKSB7XG4gICAgICAgIGlmICggaXNDaGFuZ2VkICYmIGRyYXdhYmxlID09PSBjdXJyZW50SW50ZXJ2YWwuZHJhd2FibGVBZnRlciApIHtcbiAgICAgICAgICBpc0NoYW5nZWQgPSBmYWxzZTtcbiAgICAgICAgICBjdXJyZW50SW50ZXJ2YWwgPSBjdXJyZW50SW50ZXJ2YWwubmV4dENoYW5nZUludGVydmFsO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgZHJhd2FibGVTdHJpbmcgPSBgJHtkcmF3YWJsZS5yZW5kZXJlcn0gJHsoICF1c2VDdXJyZW50ICYmIGRyYXdhYmxlLnBhcmVudERyYXdhYmxlICkgPyBkcmF3YWJsZS5wYXJlbnREcmF3YWJsZS50b1N0cmluZygpIDogJyd9ICR7ZHJhd2FibGUudG9EZXRhaWxlZFN0cmluZygpfWA7XG4gICAgICAgIHNjZW5lcnlMb2cuU3RpdGNoRHJhd2FibGVzKCBkcmF3YWJsZVN0cmluZywgaXNDaGFuZ2VkID8gKCB1c2VDdXJyZW50ID8gJ2NvbG9yOiAjMGEwOycgOiAnY29sb3I6ICNhMDA7JyApIDogJ2NvbG9yOiAjNjY2JyApO1xuXG4gICAgICAgIGlmICggIWlzQ2hhbmdlZCAmJiBjdXJyZW50SW50ZXJ2YWwgJiYgY3VycmVudEludGVydmFsLmRyYXdhYmxlQmVmb3JlID09PSBkcmF3YWJsZSApIHtcbiAgICAgICAgICBpc0NoYW5nZWQgPSB0cnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCBkcmF3YWJsZSA9PT0gbGFzdERyYXdhYmxlICkge1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG59XG5cbnNjZW5lcnkucmVnaXN0ZXIoICdTdGl0Y2hlcicsIFN0aXRjaGVyICk7XG5leHBvcnQgZGVmYXVsdCBTdGl0Y2hlcjsiXSwibmFtZXMiOlsiY2xlYW5BcnJheSIsIkNhbnZhc0Jsb2NrIiwiRE9NQmxvY2siLCJEcmF3YWJsZSIsIlJlbmRlcmVyIiwic2NlbmVyeSIsIlNWR0Jsb2NrIiwiV2ViR0xCbG9jayIsIlN0aXRjaGVyIiwiaW5pdGlhbGl6ZSIsImJhY2tib25lIiwiZmlyc3REcmF3YWJsZSIsImxhc3REcmF3YWJsZSIsIm9sZEZpcnN0RHJhd2FibGUiLCJvbGRMYXN0RHJhd2FibGUiLCJmaXJzdENoYW5nZUludGVydmFsIiwibGFzdENoYW5nZUludGVydmFsIiwiYXNzZXJ0IiwicHJldmlvdXNEcmF3YWJsZSIsIm5leHREcmF3YWJsZSIsInNjZW5lcnlMb2ciLCJTdGl0Y2giLCJ0b1N0cmluZyIsInB1c2giLCJTdGl0Y2hEcmF3YWJsZXMiLCJkZWJ1Z0RyYXdhYmxlcyIsInBvcCIsInRvdWNoZWRCbG9ja3MiLCJhc3NlcnRTbG93IiwiaW5pdGlhbGl6ZWQiLCJyZWluZGV4ZWQiLCJwZW5kaW5nQWRkaXRpb25zIiwicGVuZGluZ1JlbW92YWxzIiwicGVuZGluZ01vdmVzIiwiY3JlYXRlZEJsb2NrcyIsImRpc3Bvc2VkQmxvY2tzIiwiaW50ZXJ2YWxzTm90aWZpZWQiLCJib3VuZGFyaWVzUmVjb3JkZWQiLCJwcmV2aW91c0Jsb2NrcyIsImJsb2NrcyIsInNsaWNlIiwiY2xlYW4iLCJhdWRpdFN0aXRjaCIsInJlY29yZEJhY2tib25lQm91bmRhcmllcyIsInByZXZpb3VzRmlyc3REcmF3YWJsZSIsInByZXZpb3VzTGFzdERyYXdhYmxlIiwibm90ZVBlbmRpbmdBZGRpdGlvbiIsImRyYXdhYmxlIiwiYmxvY2siLCJyZW5kZXJlciIsImRpc3BsYXkiLCJub3RlUGVuZGluZ01vdmUiLCJub3RlUGVuZGluZ1JlbW92YWwiLCJtYXJrQmxvY2tGb3JEaXNwb3NhbCIsImRvbUVsZW1lbnQiLCJwYXJlbnROb2RlIiwicmVtb3ZlQ2hpbGQiLCJtYXJrRm9yRGlzcG9zYWwiLCJyZW1vdmVBbGxCbG9ja3MiLCJsZW5ndGgiLCJyZW1vdmVCbG9jayIsIm5vdGlmeUludGVydmFsIiwibWFya0RpcnR5RHJhd2FibGUiLCJtYXJrQmVmb3JlQmxvY2siLCJwZW5kaW5nRmlyc3REcmF3YWJsZSIsIm1hcmtBZnRlckJsb2NrIiwicGVuZGluZ0xhc3REcmF3YWJsZSIsInVwZGF0ZUJsb2NrSW50ZXJ2YWxzIiwidXNlZCIsInVwZGF0ZUludGVydmFsIiwiY3JlYXRlQmxvY2siLCJpc0NhbnZhcyIsImNyZWF0ZUZyb21Qb29sIiwidHJhbnNmb3JtUm9vdEluc3RhbmNlIiwiYmFja2JvbmVJbnN0YW5jZSIsImlzU1ZHIiwiaXNET00iLCJpc1dlYkdMIiwiRXJyb3IiLCJzZXRCbG9ja0JhY2tib25lIiwiYXBwZW5kQ2hpbGQiLCJpc0Rpc3BsYXlSb290Iiwic2V0QXR0cmlidXRlIiwiYXBwZW5kQmxvY2siLCJibG9ja0luZGV4IiwiXyIsImluZGV4T2YiLCJzcGxpY2UiLCJ1c2VOb0Jsb2NrcyIsInJlaW5kZXgiLCJyZWluZGV4QmxvY2tzIiwiZXZlcnkiLCJ6aXAiLCJhcnIiLCJlYWNoIiwiYmxvY2tEYXRhIiwic29tZSIsImludGVydmFsRGF0YSIsIm9sZExpc3RUb0FycmF5IiwicmVtb3ZhbERhdGEiLCJtb3ZlRGF0YSIsImxpc3RUb0FycmF5IiwiYWRkaXRpb25EYXRhIiwiYmxvY2tJZHgiLCJtYXAiLCJuIiwiaWQiLCJqb2luIiwiaSIsImRlYnVnSW50ZXJ2YWxzIiwiZGVidWdJbnRlcnZhbCIsIm5leHRDaGFuZ2VJbnRlcnZhbCIsImlzRW1wdHkiLCJkcmF3YWJsZUJlZm9yZSIsImRyYXdhYmxlQWZ0ZXIiLCJ1c2VDdXJyZW50IiwiaXNDaGFuZ2VkIiwiY3VycmVudEludGVydmFsIiwib2xkTmV4dERyYXdhYmxlIiwiZHJhd2FibGVTdHJpbmciLCJwYXJl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