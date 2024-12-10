// Copyright 2014-2024, University of Colorado Boulder
/**
 * Stitcher that only rebuilds the parts necessary, and attempts greedy block matching as an optimization.
 *
 * Given a list of change intervals, our greedy stitcher breaks it down into 'sub-blocks' consisting of
 * drawables that are 'internal' to the change interval that all have the same renderer, and handles the
 * glue/unglue/matching situations in a greedy way by always using the first possible (allowing only one sweep
 * instead of multiple ones over the drawable linked list for this process).
 *
 * Conceptually, we break down drawables into groups that are 'internal' to each change interval (inside, not
 * including the un-changed ends), and 'external' (that are not internal to any intervals).
 *
 * For each interval, we first make sure that the next 'external' group of drawables has the proper blocks (for
 * instance, this can change with a glue/unglue operation, with processEdgeCases), then proceed to break the 'internal'
 * drawables into sub-blocks and process those with processSubBlock.
 *
 * Our stitcher has a list of blocks noted as 'reusable' that we use for two purposes:
 *   1. So that we can shift blocks to where they are needed, instead of removing (e.g.) an SVG block and
 *      creating another.
 *   2. So that blocks that are unused at the end of our stitch can be removed, and marked for disposal.
 * At the start of the stitch, we mark completely 'internal' blocks as reusable, so they can be shifted around as
 * necessary (used in a greedy way which may not be optimal). It's also possible during later phases for blocks that
 * also contain 'external' drawables to be marked as reusable, due to glue cases where before we needed multiple
 * blocks and now we only need one.
 *
 * We also use a linked-list of blocks during stitch operations (that then re-builds an array of blocks on any changes
 * after all stitching is done) for simplicity, and to avoid O(n^2) cases that would result from having to look up
 * indices in the block array during stitching.
 *
 * NOTE: Stitcher instances may be reused many times, even with different backbones. It should always release any
 * object references that it held after usage.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ import cleanArray from '../../../phet-core/js/cleanArray.js';
import { Block, ChangeInterval, Drawable, Renderer, scenery, Stitcher } from '../imports.js';
// Returns whether the consecutive {Drawable}s 'a' and 'b' should be put into separate blocks
function hasGapBetweenDrawables(a, b) {
    return a.renderer !== b.renderer || Renderer.isDOM(a.renderer) || Renderer.isDOM(b.renderer);
}
// Whether the drawable and its previous sibling should be in the same block. Will be false if there is no sibling
function isOpenBefore(drawable) {
    return drawable.previousDrawable !== null && !hasGapBetweenDrawables(drawable.previousDrawable, drawable);
}
// Whether the drawable and its next sibling should be in the same block. Will be false if there is no sibling
function isOpenAfter(drawable) {
    return drawable.nextDrawable !== null && !hasGapBetweenDrawables(drawable, drawable.nextDrawable);
}
// If the change interval will contain any new (added) drawables
function intervalHasNewInternalDrawables(interval, firstStitchDrawable, lastStitchDrawable) {
    if (interval.drawableBefore) {
        return interval.drawableBefore.nextDrawable !== interval.drawableAfter; // OK for after to be null
    } else if (interval.drawableAfter) {
        return interval.drawableAfter.previousDrawable !== interval.drawableBefore; // OK for before to be null
    } else {
        return firstStitchDrawable !== null;
    }
}
// If the change interval contained any drawables that are to be removed
function intervalHasOldInternalDrawables(interval, oldFirstStitchDrawable, oldLastStitchDrawable) {
    if (interval.drawableBefore) {
        return interval.drawableBefore.oldNextDrawable !== interval.drawableAfter; // OK for after to be null
    } else if (interval.drawableAfter) {
        return interval.drawableAfter.oldPreviousDrawable !== interval.drawableBefore; // OK for before to be null
    } else {
        return oldFirstStitchDrawable !== null;
    }
}
// Whether there are blocks that consist of drawables that are ALL internal to the {ChangeInterval} interval.
function intervalHasOldInternalBlocks(interval, firstStitchBlock, lastStitchBlock) {
    const beforeBlock = interval.drawableBefore ? interval.drawableBefore.parentDrawable : null;
    const afterBlock = interval.drawableAfter ? interval.drawableAfter.parentDrawable : null;
    if (beforeBlock && afterBlock && beforeBlock === afterBlock) {
        return false;
    }
    if (beforeBlock) {
        return beforeBlock.nextBlock !== afterBlock; // OK for after to be null
    } else if (afterBlock) {
        return afterBlock.previousBlock !== beforeBlock; // OK for before to be null
    } else {
        return firstStitchBlock !== null;
    }
}
/**
 * Finds the furthest external drawable that:
 * (a) Before the next change interval (if we have a next change interval)
 * (b) Has the same renderer as the interval's drawableAfter
 */ function getLastCompatibleExternalDrawable(interval) {
    const firstDrawable = interval.drawableAfter;
    if (firstDrawable) {
        const renderer = firstDrawable.renderer;
        // we stop our search before we reach this (null is acceptable), ensuring we don't go into the next change interval
        const cutoffDrawable = interval.nextChangeInterval ? interval.nextChangeInterval.drawableBefore.nextDrawable : null;
        let drawable = firstDrawable;
        while(true){
            const nextDrawable = drawable.nextDrawable;
            // first comparison also does null check when necessary
            if (nextDrawable !== cutoffDrawable && nextDrawable.renderer === renderer) {
                drawable = nextDrawable;
            } else {
                break;
            }
        }
        return drawable;
    } else {
        return null; // with no drawableAfter, we don't have any external drawables after our interval
    }
}
let GreedyStitcher = class GreedyStitcher extends Stitcher {
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
   * @param {Drawable|null} firstStitchDrawable
   * @param {Drawable|null} lastStitchDrawable
   * @param {Drawable|null} oldFirstStitchDrawable
   * @param {Drawable|null} oldLastStitchDrawable
   * @param {ChangeInterval} firstChangeInterval
   * @param {ChangeInterval} lastChangeInterval
   */ stitch(backbone, firstStitchDrawable, lastStitchDrawable, oldFirstStitchDrawable, oldLastStitchDrawable, firstChangeInterval, lastChangeInterval) {
        // required call to the Stitcher interface (see Stitcher.initialize()).
        this.initialize(backbone, firstStitchDrawable, lastStitchDrawable, oldFirstStitchDrawable, oldLastStitchDrawable, firstChangeInterval, lastChangeInterval);
        // Tracks whether our order of blocks changed. If it did, we'll need to rebuild our blocks array. This flag is
        // set if we remove any blocks, create any blocks, or change the order between two blocks (via linkBlocks).
        // It does NOT occur in unuseBlock, since we may reuse the same block in the same position (thus not having an
        // order change).
        this.blockOrderChanged = false;
        // List of blocks that (in the current part of the stitch being processed) are not set to be used by any
        // drawables. Blocks are added to here when they are fully internal to a change interval, and when we glue
        // blocks together. They can be reused through the block-matching process. If they are not reused at the end of
        // this stitch, they will be marked for removal.
        this.reusableBlocks = cleanArray(this.reusableBlocks); // re-use instance, since we are effectively pooled
        // To properly handle glue/unglue situations with external blocks (ones that aren't reusable after phase 1),
        // we need some extra tracking for our inner sub-block edge case loop.
        this.blockWasAdded = false; // we need to know if a previously-existing block was added, and remove it otherwise.
        let interval;
        // record current first/last drawables for the entire backbone
        this.recordBackboneBoundaries();
        sceneryLog && sceneryLog.GreedyStitcher && sceneryLog.GreedyStitcher('phase 1: old linked list');
        sceneryLog && sceneryLog.GreedyStitcher && sceneryLog.push();
        // Handle pending removal of old blocks/drawables. First, we need to mark all 'internal' drawables with
        // notePendingRemoval(), so that if they aren't added back in this backbone, that they are removed from their
        // old block. Note that later we will add the ones that stay on this backbone, so that they only either change
        // blocks, or stay on the same block.
        if (backbone.blocks.length) {
            const veryFirstBlock = backbone.blocks[0];
            const veryLastBlock = backbone.blocks[backbone.blocks.length - 1];
            for(interval = firstChangeInterval; interval !== null; interval = interval.nextChangeInterval){
                assert && assert(!interval.isEmpty(), 'We now guarantee that the intervals are non-empty');
                // First, we need to mark all old 'internal' drawables with notePendingRemoval(), so that if they aren't added
                // back in this backbone, that they are removed from their old block. Note that later we will add the ones
                // that stay on this backbone, so that they only either change blocks, or stay on the same block.
                if (intervalHasOldInternalDrawables(interval, oldFirstStitchDrawable, oldLastStitchDrawable)) {
                    const firstRemoval = interval.drawableBefore ? interval.drawableBefore.oldNextDrawable : oldFirstStitchDrawable;
                    const lastRemoval = interval.drawableAfter ? interval.drawableAfter.oldPreviousDrawable : oldLastStitchDrawable;
                    // drawable iteration on the 'old' linked list
                    for(let removedDrawable = firstRemoval;; removedDrawable = removedDrawable.oldNextDrawable){
                        this.notePendingRemoval(removedDrawable);
                        if (removedDrawable === lastRemoval) {
                            break;
                        }
                    }
                }
                // Blocks totally contained within the change interval are marked as reusable (doesn't include end blocks).
                if (intervalHasOldInternalBlocks(interval, veryFirstBlock, veryLastBlock)) {
                    const firstBlock = interval.drawableBefore === null ? backbone.blocks[0] : interval.drawableBefore.parentDrawable.nextBlock;
                    const lastBlock = interval.drawableAfter === null ? backbone.blocks[backbone.blocks.length - 1] : interval.drawableAfter.parentDrawable.previousBlock;
                    for(let markedBlock = firstBlock;; markedBlock = markedBlock.nextBlock){
                        this.unuseBlock(markedBlock);
                        if (markedBlock === lastBlock) {
                            break;
                        }
                    }
                }
            }
        }
        sceneryLog && sceneryLog.GreedyStitcher && sceneryLog.pop();
        sceneryLog && sceneryLog.GreedyStitcher && sceneryLog.GreedyStitcher('phase 2: new linked list');
        sceneryLog && sceneryLog.GreedyStitcher && sceneryLog.push();
        // Don't process the single interval left if we aren't left with any drawables (thus left with no blocks)
        if (firstStitchDrawable) {
            for(interval = firstChangeInterval; interval !== null; interval = interval.nextChangeInterval){
                this.processInterval(backbone, interval, firstStitchDrawable, lastStitchDrawable);
            }
        }
        sceneryLog && sceneryLog.GreedyStitcher && sceneryLog.pop();
        sceneryLog && sceneryLog.GreedyStitcher && sceneryLog.GreedyStitcher('phase 3: cleanup');
        sceneryLog && sceneryLog.GreedyStitcher && sceneryLog.push();
        // Anything in our 'reusable' blocks array should be removed from our DOM and marked for disposal.
        this.removeUnusedBlocks();
        // Fire off notifyInterval calls to blocks if their boundaries (first/last drawables) have changed. This is
        // a necessary call since we used markBeforeBlock/markAfterBlock to record block boundaries as we went along.
        // We don't want to do this synchronously, because then you could update a block's boundaries multiple times,
        // which may be expensive.
        this.updateBlockIntervals();
        if (firstStitchDrawable === null) {
            // i.e. clear our blocks array
            this.useNoBlocks();
        } else if (this.blockOrderChanged) {
            // Rebuild our blocks array from the linked list format we used for recording our changes (avoids O(n^2)
            // situations since we don't need to do array index lookups while making changes, but only at the end).
            this.processBlockLinkedList(backbone, firstStitchDrawable.pendingParentDrawable, lastStitchDrawable.pendingParentDrawable);
            // Actually reindex the DOM elements of the blocks (changing as necessary)
            this.reindex();
        }
        // required call to the Stitcher interface (see Stitcher.clean()).
        this.clean();
        // release the references we made in this type
        cleanArray(this.reusableBlocks);
        sceneryLog && sceneryLog.GreedyStitcher && sceneryLog.pop();
    }
    /**
   * Does the main bulk of the work for each change interval.
   * @private
   *
   * @param {BackboneDrawable} backbone
   * @param {ChangeInterval} interval
   * @param {Drawable|null} firstStitchDrawable
   * @param {Drawable|null} lastStitchDrawable
   */ processInterval(backbone, interval, firstStitchDrawable, lastStitchDrawable) {
        assert && assert(interval instanceof ChangeInterval);
        assert && assert(firstStitchDrawable instanceof Drawable, 'We assume we have a non-null remaining section');
        assert && assert(lastStitchDrawable instanceof Drawable, 'We assume we have a non-null remaining section');
        assert && assert(!interval.isEmpty(), 'We now guarantee that the intervals are non-empty');
        sceneryLog && sceneryLog.GreedyVerbose && sceneryLog.GreedyVerbose(`interval: ${interval.drawableBefore ? interval.drawableBefore.toString() : 'null'} to ${interval.drawableAfter ? interval.drawableAfter.toString() : 'null'}`);
        sceneryLog && sceneryLog.GreedyVerbose && sceneryLog.push();
        // check if our interval removes everything, we may need a glue
        if (!intervalHasNewInternalDrawables(interval, firstStitchDrawable, lastStitchDrawable)) {
            sceneryLog && sceneryLog.GreedyVerbose && sceneryLog.GreedyVerbose('no current internal drawables in interval');
            // separate if, last condition above would cause issues with the normal operation branch
            if (interval.drawableBefore && interval.drawableAfter) {
                assert && assert(interval.drawableBefore.nextDrawable === interval.drawableAfter);
                // if we removed everything (no new internal drawables), our drawableBefore is open 'after', if our
                // drawableAfter is open 'before' since they are siblings (only one flag needed).
                const isOpen = !hasGapBetweenDrawables(interval.drawableBefore, interval.drawableAfter);
                // handle glue/unglue or any other 'external' changes
                this.processEdgeCases(interval, isOpen, isOpen);
            }
            if (interval.drawableBefore && !isOpenAfter(interval.drawableBefore)) {
                sceneryLog && sceneryLog.GreedyVerbose && sceneryLog.GreedyVerbose('closed-after collapsed link:');
                sceneryLog && sceneryLog.GreedyVerbose && sceneryLog.push();
                this.linkAfterDrawable(interval.drawableBefore);
                sceneryLog && sceneryLog.GreedyVerbose && sceneryLog.pop();
            } else if (interval.drawableAfter && !isOpenBefore(interval.drawableAfter)) {
                sceneryLog && sceneryLog.GreedyVerbose && sceneryLog.GreedyVerbose('closed-before collapsed link:');
                sceneryLog && sceneryLog.GreedyVerbose && sceneryLog.push();
                this.linkBeforeDrawable(interval.drawableAfter);
                sceneryLog && sceneryLog.GreedyVerbose && sceneryLog.pop();
            }
        } else {
            let drawable = interval.drawableBefore ? interval.drawableBefore.nextDrawable : firstStitchDrawable;
            // if we have any current drawables at all
            let subBlockFirstDrawable = null;
            let matchedBlock = null;
            let isFirst = true;
            // separate our new-drawable linked-list into sub-blocks that we will process individually
            while(true){
                const nextDrawable = drawable.nextDrawable;
                const isLast = nextDrawable === interval.drawableAfter;
                assert && assert(nextDrawable !== null || isLast, 'If our nextDrawable is null, isLast must be true');
                if (!subBlockFirstDrawable) {
                    subBlockFirstDrawable = drawable;
                }
                // See if any of our 'new' drawables were part of a block that we've marked as reusable. If this is the case,
                // we'll greedily try to use this block for matching if possible (ignoring the other potential matches for
                // other drawables after in the same sub-block).
                if (matchedBlock === null && drawable.parentDrawable && !drawable.parentDrawable.used && drawable.backbone === backbone && drawable.parentDrawable.parentDrawable === backbone) {
                    matchedBlock = drawable.parentDrawable;
                    sceneryLog && sceneryLog.GreedyVerbose && sceneryLog.GreedyVerbose(`matching at ${drawable.toString()} with ${matchedBlock}`);
                }
                if (isLast || hasGapBetweenDrawables(drawable, nextDrawable)) {
                    if (isFirst) {
                        // we'll handle any glue/unglue at the start, so every processSubBlock can be set correctly.
                        this.processEdgeCases(interval, isOpenBefore(subBlockFirstDrawable), isOpenAfter(drawable));
                    }
                    // do the necessary work for each sub-block (adding drawables, linking, using matched blocks)
                    this.processSubBlock(interval, subBlockFirstDrawable, drawable, matchedBlock, isFirst, isLast);
                    subBlockFirstDrawable = null;
                    matchedBlock = null;
                    isFirst = false;
                }
                if (isLast) {
                    break;
                } else {
                    drawable = nextDrawable;
                }
            }
        }
        sceneryLog && sceneryLog.GreedyVerbose && sceneryLog.pop();
    }
    /**
   * @private
   *
   * @param {ChangeInterval} interval
   * @param {Drawable} firstDrawable - for the specific sub-block
   * @param {Drawable} lastDrawable - for the specific sub-block
   * @param {Block} matchedBlock
   * @param {boolean} isFirst
   * @param {boolean} isLast
   */ processSubBlock(interval, firstDrawable, lastDrawable, matchedBlock, isFirst, isLast) {
        sceneryLog && sceneryLog.GreedyVerbose && sceneryLog.GreedyVerbose(`sub-block: ${firstDrawable.toString()} to ${lastDrawable.toString()} ${matchedBlock ? `with matched: ${matchedBlock.toString()}` : 'with no match'}`);
        sceneryLog && sceneryLog.GreedyVerbose && sceneryLog.push();
        const openBefore = isOpenBefore(firstDrawable);
        const openAfter = isOpenAfter(lastDrawable);
        assert && assert(!openBefore || isFirst, 'openBefore implies isFirst');
        assert && assert(!openAfter || isLast, 'openAfter implies isLast');
        assert && assert(!openBefore || !openAfter || firstDrawable.previousDrawable.pendingParentDrawable === lastDrawable.nextDrawable.pendingParentDrawable, 'If we would use both the before and after blocks, make sure any gluing ');
        // if our sub-block gets combined into the previous block, use its block instead of any match-scanned blocks
        if (openBefore) {
            matchedBlock = firstDrawable.previousDrawable.pendingParentDrawable;
            sceneryLog && sceneryLog.GreedyVerbose && sceneryLog.GreedyVerbose(`combining into before block: ${matchedBlock.toString()}`);
        }
        // if our sub-block gets combined into the next block, use its block instead of any match-scanned blocks
        if (openAfter) {
            matchedBlock = lastDrawable.nextDrawable.pendingParentDrawable;
            sceneryLog && sceneryLog.GreedyVerbose && sceneryLog.GreedyVerbose(`combining into after block: ${matchedBlock.toString()}`);
        }
        // create a block if matchedBlock is null, otherwise mark it as used (if it is in reusableBlocks)
        matchedBlock = this.ensureUsedBlock(matchedBlock, firstDrawable);
        // add internal drawables
        for(let drawable = firstDrawable;; drawable = drawable.nextDrawable){
            this.notePendingAddition(drawable, matchedBlock);
            if (drawable === lastDrawable) {
                break;
            }
        }
        // link our blocks (and set pending block boundaries) as needed. assumes glue/unglue has already been performed
        if (!openBefore) {
            sceneryLog && sceneryLog.GreedyVerbose && sceneryLog.GreedyVerbose('closed-before link:');
            sceneryLog && sceneryLog.GreedyVerbose && sceneryLog.push();
            this.linkBeforeDrawable(firstDrawable);
            sceneryLog && sceneryLog.GreedyVerbose && sceneryLog.pop();
        }
        if (isLast && !openAfter) {
            sceneryLog && sceneryLog.GreedyVerbose && sceneryLog.GreedyVerbose('last closed-after link:');
            sceneryLog && sceneryLog.GreedyVerbose && sceneryLog.push();
            this.linkAfterDrawable(lastDrawable);
            sceneryLog && sceneryLog.GreedyVerbose && sceneryLog.pop();
        }
        sceneryLog && sceneryLog.GreedyVerbose && sceneryLog.pop();
    }
    /**
   * firstDrawable and lastDrawable refer to the specific sub-block (if it exists), isLast refers to if it's the
   * last sub-block
   * @private
   *
   * @param {ChangeInterval} interval
   * @param {boolean} openBefore
   * @param {boolean} openAfter
   */ processEdgeCases(interval, openBefore, openAfter) {
        // this test passes for glue and unglue cases
        if (interval.drawableBefore !== null && interval.drawableAfter !== null) {
            const beforeBlock = interval.drawableBefore.pendingParentDrawable;
            const afterBlock = interval.drawableAfter.pendingParentDrawable;
            const nextAfterBlock = interval.nextChangeInterval && interval.nextChangeInterval.drawableAfter ? interval.nextChangeInterval.drawableAfter.pendingParentDrawable : null;
            // Since we want to remove any afterBlock at the end of its run if we don't have blockWasAdded set, this check
            // is necessary to see if we have already used this specific block.
            // Otherwise, we would remove our (potentially very-first) block when it has already been used externally.
            if (beforeBlock === afterBlock) {
                this.blockWasAdded = true;
            }
            sceneryLog && sceneryLog.GreedyVerbose && sceneryLog.GreedyVerbose(`edge case: ${openBefore ? 'open-before ' : ''}${openAfter ? 'open-after ' : ''}${beforeBlock.toString()} to ${afterBlock.toString()}`);
            sceneryLog && sceneryLog.GreedyVerbose && sceneryLog.push();
            // deciding what new block should be used for the external group of drawables after our change interval
            let newAfterBlock;
            // if we have no gaps/boundaries, we should not have two different blocks
            if (openBefore && openAfter) {
                sceneryLog && sceneryLog.GreedyVerbose && sceneryLog.GreedyVerbose(`glue using ${beforeBlock.toString()}`);
                newAfterBlock = beforeBlock;
            } else {
                // if we can't use our afterBlock, since it was used before, or wouldn't create a split
                if (this.blockWasAdded || beforeBlock === afterBlock) {
                    sceneryLog && sceneryLog.GreedyVerbose && sceneryLog.GreedyVerbose('split with fresh block');
                    // for simplicity right now, we always create a fresh block (to avoid messing up reused blocks) after, and
                    // always change everything after (instead of before), so we don't have to jump across multiple previous
                    // change intervals
                    newAfterBlock = this.createBlock(interval.drawableAfter.renderer, interval.drawableAfter);
                    this.blockOrderChanged = true; // needs to be done on block creation
                } else {
                    sceneryLog && sceneryLog.GreedyVerbose && sceneryLog.GreedyVerbose(`split with same afterBlock ${afterBlock.toString()}`);
                    newAfterBlock = afterBlock;
                }
            }
            // If we didn't change our block, mark it as added so we don't remove it.
            if (afterBlock === newAfterBlock) {
                sceneryLog && sceneryLog.GreedyVerbose && sceneryLog.GreedyVerbose('no externals change here (blockWasAdded => true)');
                this.blockWasAdded = true;
            } else {
                sceneryLog && sceneryLog.GreedyVerbose && sceneryLog.GreedyVerbose('moving externals');
                sceneryLog && sceneryLog.GreedyVerbose && sceneryLog.push();
                this.changeExternals(interval, newAfterBlock);
                sceneryLog && sceneryLog.GreedyVerbose && sceneryLog.pop();
            }
            // If the next interval's old afterBlock isn't the same as our old afterBlock, we need to make our decision
            // about whether to mark our old afterBlock as reusable, or whether it was used.
            if (nextAfterBlock !== afterBlock) {
                sceneryLog && sceneryLog.GreedyVerbose && sceneryLog.GreedyVerbose('end of afterBlock stretch');
                // If our block wasn't added yet, it wouldn't ever be added later naturally (so we mark it as reusable).
                if (!this.blockWasAdded) {
                    sceneryLog && sceneryLog.GreedyVerbose && sceneryLog.GreedyVerbose(`unusing ${afterBlock.toString()}`);
                    this.unuseBlock(afterBlock);
                }
                this.blockWasAdded = false;
            }
            sceneryLog && sceneryLog.GreedyVerbose && sceneryLog.pop();
        }
    }
    /**
   * Marks all 'external' drawables from the end (drawableAfter) of the {ChangeInterval} interval to either the end
   * of their old block or the drawableAfter of the next interval (whichever is sooner) as being needed to be moved to
   * our {Block} newBlock. The next processInterval will both handle the drawables inside that next interval, and
   * will be responsible for the 'external' drawables after that.
   * @private
   *
   * @param {ChangeInterval} interval
   * @param {Block} newBlock
   */ changeExternals(interval, newBlock) {
        const lastExternalDrawable = getLastCompatibleExternalDrawable(interval);
        this.notePendingMoves(newBlock, interval.drawableAfter, lastExternalDrawable);
        // If we didn't make it all the way to the next change interval's drawableBefore (there was another block
        // starting before the next interval), we need to link our new block to that next block.
        if (!interval.nextChangeInterval || interval.nextChangeInterval.drawableBefore !== lastExternalDrawable) {
            this.linkAfterDrawable(lastExternalDrawable);
        }
    }
    /**
   * Given a {Drawable} firstDrawable and {Drawable} lastDrawable, we mark all drawables in-between (inclusively) as
   * needing to be moved to our {Block} newBlock. This should only be called on external drawables, and should only
   * occur as needed with glue/unglue cases in the stitch.
   * @private
   *
   * @param {Block} newBlock
   * @param {Drawable} firstDrawable
   * @param {Drawable} lastDrawable
   */ notePendingMoves(newBlock, firstDrawable, lastDrawable) {
        for(let drawable = firstDrawable;; drawable = drawable.nextDrawable){
            assert && assert(!drawable.pendingAddition && !drawable.pendingRemoval, 'Moved drawables should be thought of as unchanged, and thus have nothing pending yet');
            this.notePendingMove(drawable, newBlock);
            if (drawable === lastDrawable) {
                break;
            }
        }
    }
    /**
   * If there is no currentBlock, we create one to match. Otherwise if the currentBlock is marked as 'unused' (i.e.
   * it is in the reusableBlocks array), we mark it as used so it won't me matched elsewhere.
   * @private
   *
   * @param {Block} currentBlock
   * @param {Drawable} someIncludedDrawable
   * @returns {Block}
   */ ensureUsedBlock(currentBlock, someIncludedDrawable) {
        // if we have a matched block (or started with one)
        if (currentBlock) {
            sceneryLog && sceneryLog.GreedyVerbose && sceneryLog.GreedyVerbose(`using existing block: ${currentBlock.toString()}`);
            // since our currentBlock may be from reusableBlocks, we will need to mark it as used now.
            if (!currentBlock.used) {
                this.useBlock(currentBlock);
            }
        } else {
            // need to create one
            sceneryLog && sceneryLog.GreedyVerbose && sceneryLog.GreedyVerbose('searching for block');
            currentBlock = this.getBlockForRenderer(someIncludedDrawable.renderer, someIncludedDrawable);
        }
        return currentBlock;
    }
    /**
   * Attemps to find an unused block with the same renderer if possible, otherwise creates a
   * compatible block.
   * @private
   *
   * NOTE: this doesn't handle hooking up the block linked list
   *
   * @param {number} renderer
   * @param {Drawable} drawable
   * @returns {Block}
   */ getBlockForRenderer(renderer, drawable) {
        let block;
        // If it's not a DOM block, scan our reusable blocks for one with the same renderer.
        // If it's DOM, it should be processed correctly in reusableBlocks, and will never reach this point.
        if (!Renderer.isDOM(renderer)) {
            // backwards scan, hopefully it's faster?
            for(let i = this.reusableBlocks.length - 1; i >= 0; i--){
                const tmpBlock = this.reusableBlocks[i];
                assert && assert(!tmpBlock.used);
                if (tmpBlock.renderer === renderer) {
                    this.useBlockAtIndex(tmpBlock, i);
                    block = tmpBlock;
                    break;
                }
            }
        }
        if (!block) {
            // Didn't find it in our reusable blocks, create a fresh one from scratch
            block = this.createBlock(renderer, drawable);
        }
        this.blockOrderChanged = true; // we created a new block, this will always happen
        return block;
    }
    /**
   * Marks a block as unused, moving it to the reusableBlocks array.
   * @private
   *
   * @param {Block} block
   */ unuseBlock(block) {
        if (block.used) {
            sceneryLog && sceneryLog.GreedyVerbose && sceneryLog.GreedyVerbose(`unusing block: ${block.toString()}`);
            block.used = false; // mark it as unused until we pull it out (so we can reuse, or quickly identify)
            this.reusableBlocks.push(block);
        } else {
            sceneryLog && sceneryLog.GreedyVerbose && sceneryLog.GreedyVerbose(`not using already-unused block: ${block.toString()}`);
        }
    }
    /**
   * Removes a block from the list of reused blocks (done during matching)
   * @private
   *
   * @param {Block} block
   */ useBlock(block) {
        this.useBlockAtIndex(block, _.indexOf(this.reusableBlocks, block));
    }
    /**
   * @private
   *
   * @param {Block} block
   * @param {number} index
   */ useBlockAtIndex(block, index) {
        sceneryLog && sceneryLog.GreedyVerbose && sceneryLog.GreedyVerbose(`using reusable block: ${block.toString()} with renderer: ${block.renderer}`);
        assert && assert(index >= 0 && this.reusableBlocks[index] === block, `bad index for useBlockAtIndex: ${index}`);
        assert && assert(!block.used, 'Should be called on an unused (reusable) block');
        // remove it
        this.reusableBlocks.splice(index, 1);
        // mark it as used
        block.used = true;
    }
    /**
   * Removes all of our unused blocks from our domElement, and marks them for disposal.
   * @private
   */ removeUnusedBlocks() {
        sceneryLog && sceneryLog.GreedyStitcher && this.reusableBlocks.length && sceneryLog.GreedyStitcher('removeUnusedBlocks');
        sceneryLog && sceneryLog.GreedyStitcher && sceneryLog.push();
        while(this.reusableBlocks.length){
            const block = this.reusableBlocks.pop();
            this.markBlockForDisposal(block);
            this.blockOrderChanged = true;
        }
        sceneryLog && sceneryLog.GreedyStitcher && sceneryLog.pop();
    }
    /**
   * Links blocks before a drawable (whether it is the first drawable or not)
   * @private
   *
   * @param {Drawable} drawable
   */ linkBeforeDrawable(drawable) {
        sceneryLog && sceneryLog.GreedyVerbose && sceneryLog.GreedyVerbose(`link before ${drawable.toString()}`);
        const beforeDrawable = drawable.previousDrawable;
        this.linkBlocks(beforeDrawable ? beforeDrawable.pendingParentDrawable : null, drawable.pendingParentDrawable, beforeDrawable, drawable);
    }
    /**
   * links blocks after a drawable (whether it is the last drawable or not)
   * @private
   *
   * @param {Drawable} drawable
   */ linkAfterDrawable(drawable) {
        sceneryLog && sceneryLog.GreedyVerbose && sceneryLog.GreedyVerbose(`link after ${drawable.toString()}`);
        const afterDrawable = drawable.nextDrawable;
        this.linkBlocks(drawable.pendingParentDrawable, afterDrawable ? afterDrawable.pendingParentDrawable : null, drawable, afterDrawable);
    }
    /**
   * Called to mark a boundary between blocks, or at the end of our list of blocks (one block/drawable pair being
   * null notes that it is the start/end, and there is no previous/next block).
   * This updates the block linked-list as necessary (noting changes when they occur) so that we can rebuild an array
   * at the end of the stitch, avoiding O(n^2) issues if we were to do block-array-index lookups during linking
   * operations (this results in linear time for blocks).
   * It also marks block boundaries as dirty when necessary, so that we can make one pass through with
   * updateBlockIntervals() that updates all of the block's boundaries (avoiding more than one update per block per
   * frame).
   * @private
   *
   * @param {Block|null} beforeBlock
   * @param {Block|null} afterBlock
   * @param {Drawable|null} beforeDrawable
   * @param {Drawable|null} afterDrawable
   */ linkBlocks(beforeBlock, afterBlock, beforeDrawable, afterDrawable) {
        sceneryLog && sceneryLog.GreedyStitcher && sceneryLog.GreedyStitcher(`linking blocks: ${beforeBlock ? `${beforeBlock.toString()} (${beforeDrawable.toString()})` : 'null'} to ${afterBlock ? `${afterBlock.toString()} (${afterDrawable.toString()})` : 'null'}`);
        sceneryLog && sceneryLog.GreedyStitcher && sceneryLog.push();
        assert && assert(beforeBlock === null && beforeDrawable === null || beforeBlock instanceof Block && beforeDrawable instanceof Drawable);
        assert && assert(afterBlock === null && afterDrawable === null || afterBlock instanceof Block && afterDrawable instanceof Drawable);
        if (beforeBlock) {
            if (beforeBlock.nextBlock !== afterBlock) {
                this.blockOrderChanged = true;
                // disconnect from the previously-connected block (if any)
                if (beforeBlock.nextBlock) {
                    beforeBlock.nextBlock.previousBlock = null;
                }
                beforeBlock.nextBlock = afterBlock;
            }
            this.markAfterBlock(beforeBlock, beforeDrawable);
        }
        if (afterBlock) {
            if (afterBlock.previousBlock !== beforeBlock) {
                this.blockOrderChanged = true;
                // disconnect from the previously-connected block (if any)
                if (afterBlock.previousBlock) {
                    afterBlock.previousBlock.nextBlock = null;
                }
                afterBlock.previousBlock = beforeBlock;
            }
            this.markBeforeBlock(afterBlock, afterDrawable);
        }
        sceneryLog && sceneryLog.GreedyStitcher && sceneryLog.pop();
    }
    /**
   * Rebuilds the backbone's block array from our linked-list data.
   * @private
   *
   * @param {BackboneDrawable} backbone
   * @param {Block|null} firstBlock
   * @param {Block|null} lastBlock
   */ processBlockLinkedList(backbone, firstBlock, lastBlock) {
        // for now, just clear out the array first
        while(backbone.blocks.length){
            backbone.blocks.pop();
        }
        sceneryLog && sceneryLog.GreedyStitcher && sceneryLog.GreedyStitcher(`processBlockLinkedList: ${firstBlock.toString()} to ${lastBlock.toString()}`);
        sceneryLog && sceneryLog.GreedyStitcher && sceneryLog.push();
        // leave the array as-is if there are no blocks
        if (firstBlock) {
            // rewrite it starting with the first block
            for(let block = firstBlock;; block = block.nextBlock){
                sceneryLog && sceneryLog.GreedyStitcher && sceneryLog.GreedyStitcher(block.toString());
                backbone.blocks.push(block);
                if (block === lastBlock) {
                    break;
                }
            }
        }
        sceneryLog && sceneryLog.GreedyStitcher && sceneryLog.pop();
    }
};
scenery.register('GreedyStitcher', GreedyStitcher);
export default GreedyStitcher;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvZGlzcGxheS9HcmVlZHlTdGl0Y2hlci5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNC0yMDI0LCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuLyoqXG4gKiBTdGl0Y2hlciB0aGF0IG9ubHkgcmVidWlsZHMgdGhlIHBhcnRzIG5lY2Vzc2FyeSwgYW5kIGF0dGVtcHRzIGdyZWVkeSBibG9jayBtYXRjaGluZyBhcyBhbiBvcHRpbWl6YXRpb24uXG4gKlxuICogR2l2ZW4gYSBsaXN0IG9mIGNoYW5nZSBpbnRlcnZhbHMsIG91ciBncmVlZHkgc3RpdGNoZXIgYnJlYWtzIGl0IGRvd24gaW50byAnc3ViLWJsb2NrcycgY29uc2lzdGluZyBvZlxuICogZHJhd2FibGVzIHRoYXQgYXJlICdpbnRlcm5hbCcgdG8gdGhlIGNoYW5nZSBpbnRlcnZhbCB0aGF0IGFsbCBoYXZlIHRoZSBzYW1lIHJlbmRlcmVyLCBhbmQgaGFuZGxlcyB0aGVcbiAqIGdsdWUvdW5nbHVlL21hdGNoaW5nIHNpdHVhdGlvbnMgaW4gYSBncmVlZHkgd2F5IGJ5IGFsd2F5cyB1c2luZyB0aGUgZmlyc3QgcG9zc2libGUgKGFsbG93aW5nIG9ubHkgb25lIHN3ZWVwXG4gKiBpbnN0ZWFkIG9mIG11bHRpcGxlIG9uZXMgb3ZlciB0aGUgZHJhd2FibGUgbGlua2VkIGxpc3QgZm9yIHRoaXMgcHJvY2VzcykuXG4gKlxuICogQ29uY2VwdHVhbGx5LCB3ZSBicmVhayBkb3duIGRyYXdhYmxlcyBpbnRvIGdyb3VwcyB0aGF0IGFyZSAnaW50ZXJuYWwnIHRvIGVhY2ggY2hhbmdlIGludGVydmFsIChpbnNpZGUsIG5vdFxuICogaW5jbHVkaW5nIHRoZSB1bi1jaGFuZ2VkIGVuZHMpLCBhbmQgJ2V4dGVybmFsJyAodGhhdCBhcmUgbm90IGludGVybmFsIHRvIGFueSBpbnRlcnZhbHMpLlxuICpcbiAqIEZvciBlYWNoIGludGVydmFsLCB3ZSBmaXJzdCBtYWtlIHN1cmUgdGhhdCB0aGUgbmV4dCAnZXh0ZXJuYWwnIGdyb3VwIG9mIGRyYXdhYmxlcyBoYXMgdGhlIHByb3BlciBibG9ja3MgKGZvclxuICogaW5zdGFuY2UsIHRoaXMgY2FuIGNoYW5nZSB3aXRoIGEgZ2x1ZS91bmdsdWUgb3BlcmF0aW9uLCB3aXRoIHByb2Nlc3NFZGdlQ2FzZXMpLCB0aGVuIHByb2NlZWQgdG8gYnJlYWsgdGhlICdpbnRlcm5hbCdcbiAqIGRyYXdhYmxlcyBpbnRvIHN1Yi1ibG9ja3MgYW5kIHByb2Nlc3MgdGhvc2Ugd2l0aCBwcm9jZXNzU3ViQmxvY2suXG4gKlxuICogT3VyIHN0aXRjaGVyIGhhcyBhIGxpc3Qgb2YgYmxvY2tzIG5vdGVkIGFzICdyZXVzYWJsZScgdGhhdCB3ZSB1c2UgZm9yIHR3byBwdXJwb3NlczpcbiAqICAgMS4gU28gdGhhdCB3ZSBjYW4gc2hpZnQgYmxvY2tzIHRvIHdoZXJlIHRoZXkgYXJlIG5lZWRlZCwgaW5zdGVhZCBvZiByZW1vdmluZyAoZS5nLikgYW4gU1ZHIGJsb2NrIGFuZFxuICogICAgICBjcmVhdGluZyBhbm90aGVyLlxuICogICAyLiBTbyB0aGF0IGJsb2NrcyB0aGF0IGFyZSB1bnVzZWQgYXQgdGhlIGVuZCBvZiBvdXIgc3RpdGNoIGNhbiBiZSByZW1vdmVkLCBhbmQgbWFya2VkIGZvciBkaXNwb3NhbC5cbiAqIEF0IHRoZSBzdGFydCBvZiB0aGUgc3RpdGNoLCB3ZSBtYXJrIGNvbXBsZXRlbHkgJ2ludGVybmFsJyBibG9ja3MgYXMgcmV1c2FibGUsIHNvIHRoZXkgY2FuIGJlIHNoaWZ0ZWQgYXJvdW5kIGFzXG4gKiBuZWNlc3NhcnkgKHVzZWQgaW4gYSBncmVlZHkgd2F5IHdoaWNoIG1heSBub3QgYmUgb3B0aW1hbCkuIEl0J3MgYWxzbyBwb3NzaWJsZSBkdXJpbmcgbGF0ZXIgcGhhc2VzIGZvciBibG9ja3MgdGhhdFxuICogYWxzbyBjb250YWluICdleHRlcm5hbCcgZHJhd2FibGVzIHRvIGJlIG1hcmtlZCBhcyByZXVzYWJsZSwgZHVlIHRvIGdsdWUgY2FzZXMgd2hlcmUgYmVmb3JlIHdlIG5lZWRlZCBtdWx0aXBsZVxuICogYmxvY2tzIGFuZCBub3cgd2Ugb25seSBuZWVkIG9uZS5cbiAqXG4gKiBXZSBhbHNvIHVzZSBhIGxpbmtlZC1saXN0IG9mIGJsb2NrcyBkdXJpbmcgc3RpdGNoIG9wZXJhdGlvbnMgKHRoYXQgdGhlbiByZS1idWlsZHMgYW4gYXJyYXkgb2YgYmxvY2tzIG9uIGFueSBjaGFuZ2VzXG4gKiBhZnRlciBhbGwgc3RpdGNoaW5nIGlzIGRvbmUpIGZvciBzaW1wbGljaXR5LCBhbmQgdG8gYXZvaWQgTyhuXjIpIGNhc2VzIHRoYXQgd291bGQgcmVzdWx0IGZyb20gaGF2aW5nIHRvIGxvb2sgdXBcbiAqIGluZGljZXMgaW4gdGhlIGJsb2NrIGFycmF5IGR1cmluZyBzdGl0Y2hpbmcuXG4gKlxuICogTk9URTogU3RpdGNoZXIgaW5zdGFuY2VzIG1heSBiZSByZXVzZWQgbWFueSB0aW1lcywgZXZlbiB3aXRoIGRpZmZlcmVudCBiYWNrYm9uZXMuIEl0IHNob3VsZCBhbHdheXMgcmVsZWFzZSBhbnlcbiAqIG9iamVjdCByZWZlcmVuY2VzIHRoYXQgaXQgaGVsZCBhZnRlciB1c2FnZS5cbiAqXG4gKiBAYXV0aG9yIEpvbmF0aGFuIE9sc29uIDxqb25hdGhhbi5vbHNvbkBjb2xvcmFkby5lZHU+XG4gKi9cblxuaW1wb3J0IGNsZWFuQXJyYXkgZnJvbSAnLi4vLi4vLi4vcGhldC1jb3JlL2pzL2NsZWFuQXJyYXkuanMnO1xuaW1wb3J0IHsgQmxvY2ssIENoYW5nZUludGVydmFsLCBEcmF3YWJsZSwgUmVuZGVyZXIsIHNjZW5lcnksIFN0aXRjaGVyIH0gZnJvbSAnLi4vaW1wb3J0cy5qcyc7XG5cbi8vIFJldHVybnMgd2hldGhlciB0aGUgY29uc2VjdXRpdmUge0RyYXdhYmxlfXMgJ2EnIGFuZCAnYicgc2hvdWxkIGJlIHB1dCBpbnRvIHNlcGFyYXRlIGJsb2Nrc1xuZnVuY3Rpb24gaGFzR2FwQmV0d2VlbkRyYXdhYmxlcyggYSwgYiApIHtcbiAgcmV0dXJuIGEucmVuZGVyZXIgIT09IGIucmVuZGVyZXIgfHwgUmVuZGVyZXIuaXNET00oIGEucmVuZGVyZXIgKSB8fCBSZW5kZXJlci5pc0RPTSggYi5yZW5kZXJlciApO1xufVxuXG4vLyBXaGV0aGVyIHRoZSBkcmF3YWJsZSBhbmQgaXRzIHByZXZpb3VzIHNpYmxpbmcgc2hvdWxkIGJlIGluIHRoZSBzYW1lIGJsb2NrLiBXaWxsIGJlIGZhbHNlIGlmIHRoZXJlIGlzIG5vIHNpYmxpbmdcbmZ1bmN0aW9uIGlzT3BlbkJlZm9yZSggZHJhd2FibGUgKSB7XG4gIHJldHVybiBkcmF3YWJsZS5wcmV2aW91c0RyYXdhYmxlICE9PSBudWxsICYmICFoYXNHYXBCZXR3ZWVuRHJhd2FibGVzKCBkcmF3YWJsZS5wcmV2aW91c0RyYXdhYmxlLCBkcmF3YWJsZSApO1xufVxuXG4vLyBXaGV0aGVyIHRoZSBkcmF3YWJsZSBhbmQgaXRzIG5leHQgc2libGluZyBzaG91bGQgYmUgaW4gdGhlIHNhbWUgYmxvY2suIFdpbGwgYmUgZmFsc2UgaWYgdGhlcmUgaXMgbm8gc2libGluZ1xuZnVuY3Rpb24gaXNPcGVuQWZ0ZXIoIGRyYXdhYmxlICkge1xuICByZXR1cm4gZHJhd2FibGUubmV4dERyYXdhYmxlICE9PSBudWxsICYmICFoYXNHYXBCZXR3ZWVuRHJhd2FibGVzKCBkcmF3YWJsZSwgZHJhd2FibGUubmV4dERyYXdhYmxlICk7XG59XG5cbi8vIElmIHRoZSBjaGFuZ2UgaW50ZXJ2YWwgd2lsbCBjb250YWluIGFueSBuZXcgKGFkZGVkKSBkcmF3YWJsZXNcbmZ1bmN0aW9uIGludGVydmFsSGFzTmV3SW50ZXJuYWxEcmF3YWJsZXMoIGludGVydmFsLCBmaXJzdFN0aXRjaERyYXdhYmxlLCBsYXN0U3RpdGNoRHJhd2FibGUgKSB7XG4gIGlmICggaW50ZXJ2YWwuZHJhd2FibGVCZWZvcmUgKSB7XG4gICAgcmV0dXJuIGludGVydmFsLmRyYXdhYmxlQmVmb3JlLm5leHREcmF3YWJsZSAhPT0gaW50ZXJ2YWwuZHJhd2FibGVBZnRlcjsgLy8gT0sgZm9yIGFmdGVyIHRvIGJlIG51bGxcbiAgfVxuICBlbHNlIGlmICggaW50ZXJ2YWwuZHJhd2FibGVBZnRlciApIHtcbiAgICByZXR1cm4gaW50ZXJ2YWwuZHJhd2FibGVBZnRlci5wcmV2aW91c0RyYXdhYmxlICE9PSBpbnRlcnZhbC5kcmF3YWJsZUJlZm9yZTsgLy8gT0sgZm9yIGJlZm9yZSB0byBiZSBudWxsXG4gIH1cbiAgZWxzZSB7XG4gICAgcmV0dXJuIGZpcnN0U3RpdGNoRHJhd2FibGUgIT09IG51bGw7XG4gIH1cbn1cblxuLy8gSWYgdGhlIGNoYW5nZSBpbnRlcnZhbCBjb250YWluZWQgYW55IGRyYXdhYmxlcyB0aGF0IGFyZSB0byBiZSByZW1vdmVkXG5mdW5jdGlvbiBpbnRlcnZhbEhhc09sZEludGVybmFsRHJhd2FibGVzKCBpbnRlcnZhbCwgb2xkRmlyc3RTdGl0Y2hEcmF3YWJsZSwgb2xkTGFzdFN0aXRjaERyYXdhYmxlICkge1xuICBpZiAoIGludGVydmFsLmRyYXdhYmxlQmVmb3JlICkge1xuICAgIHJldHVybiBpbnRlcnZhbC5kcmF3YWJsZUJlZm9yZS5vbGROZXh0RHJhd2FibGUgIT09IGludGVydmFsLmRyYXdhYmxlQWZ0ZXI7IC8vIE9LIGZvciBhZnRlciB0byBiZSBudWxsXG4gIH1cbiAgZWxzZSBpZiAoIGludGVydmFsLmRyYXdhYmxlQWZ0ZXIgKSB7XG4gICAgcmV0dXJuIGludGVydmFsLmRyYXdhYmxlQWZ0ZXIub2xkUHJldmlvdXNEcmF3YWJsZSAhPT0gaW50ZXJ2YWwuZHJhd2FibGVCZWZvcmU7IC8vIE9LIGZvciBiZWZvcmUgdG8gYmUgbnVsbFxuICB9XG4gIGVsc2Uge1xuICAgIHJldHVybiBvbGRGaXJzdFN0aXRjaERyYXdhYmxlICE9PSBudWxsO1xuICB9XG59XG5cbi8vIFdoZXRoZXIgdGhlcmUgYXJlIGJsb2NrcyB0aGF0IGNvbnNpc3Qgb2YgZHJhd2FibGVzIHRoYXQgYXJlIEFMTCBpbnRlcm5hbCB0byB0aGUge0NoYW5nZUludGVydmFsfSBpbnRlcnZhbC5cbmZ1bmN0aW9uIGludGVydmFsSGFzT2xkSW50ZXJuYWxCbG9ja3MoIGludGVydmFsLCBmaXJzdFN0aXRjaEJsb2NrLCBsYXN0U3RpdGNoQmxvY2sgKSB7XG4gIGNvbnN0IGJlZm9yZUJsb2NrID0gaW50ZXJ2YWwuZHJhd2FibGVCZWZvcmUgPyBpbnRlcnZhbC5kcmF3YWJsZUJlZm9yZS5wYXJlbnREcmF3YWJsZSA6IG51bGw7XG4gIGNvbnN0IGFmdGVyQmxvY2sgPSBpbnRlcnZhbC5kcmF3YWJsZUFmdGVyID8gaW50ZXJ2YWwuZHJhd2FibGVBZnRlci5wYXJlbnREcmF3YWJsZSA6IG51bGw7XG5cbiAgaWYgKCBiZWZvcmVCbG9jayAmJiBhZnRlckJsb2NrICYmIGJlZm9yZUJsb2NrID09PSBhZnRlckJsb2NrICkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIGlmICggYmVmb3JlQmxvY2sgKSB7XG4gICAgcmV0dXJuIGJlZm9yZUJsb2NrLm5leHRCbG9jayAhPT0gYWZ0ZXJCbG9jazsgLy8gT0sgZm9yIGFmdGVyIHRvIGJlIG51bGxcbiAgfVxuICBlbHNlIGlmICggYWZ0ZXJCbG9jayApIHtcbiAgICByZXR1cm4gYWZ0ZXJCbG9jay5wcmV2aW91c0Jsb2NrICE9PSBiZWZvcmVCbG9jazsgLy8gT0sgZm9yIGJlZm9yZSB0byBiZSBudWxsXG4gIH1cbiAgZWxzZSB7XG4gICAgcmV0dXJuIGZpcnN0U3RpdGNoQmxvY2sgIT09IG51bGw7XG4gIH1cbn1cblxuLyoqXG4gKiBGaW5kcyB0aGUgZnVydGhlc3QgZXh0ZXJuYWwgZHJhd2FibGUgdGhhdDpcbiAqIChhKSBCZWZvcmUgdGhlIG5leHQgY2hhbmdlIGludGVydmFsIChpZiB3ZSBoYXZlIGEgbmV4dCBjaGFuZ2UgaW50ZXJ2YWwpXG4gKiAoYikgSGFzIHRoZSBzYW1lIHJlbmRlcmVyIGFzIHRoZSBpbnRlcnZhbCdzIGRyYXdhYmxlQWZ0ZXJcbiAqL1xuZnVuY3Rpb24gZ2V0TGFzdENvbXBhdGlibGVFeHRlcm5hbERyYXdhYmxlKCBpbnRlcnZhbCApIHtcbiAgY29uc3QgZmlyc3REcmF3YWJsZSA9IGludGVydmFsLmRyYXdhYmxlQWZ0ZXI7XG5cbiAgaWYgKCBmaXJzdERyYXdhYmxlICkge1xuICAgIGNvbnN0IHJlbmRlcmVyID0gZmlyc3REcmF3YWJsZS5yZW5kZXJlcjtcblxuICAgIC8vIHdlIHN0b3Agb3VyIHNlYXJjaCBiZWZvcmUgd2UgcmVhY2ggdGhpcyAobnVsbCBpcyBhY2NlcHRhYmxlKSwgZW5zdXJpbmcgd2UgZG9uJ3QgZ28gaW50byB0aGUgbmV4dCBjaGFuZ2UgaW50ZXJ2YWxcbiAgICBjb25zdCBjdXRvZmZEcmF3YWJsZSA9IGludGVydmFsLm5leHRDaGFuZ2VJbnRlcnZhbCA/IGludGVydmFsLm5leHRDaGFuZ2VJbnRlcnZhbC5kcmF3YWJsZUJlZm9yZS5uZXh0RHJhd2FibGUgOiBudWxsO1xuXG4gICAgbGV0IGRyYXdhYmxlID0gZmlyc3REcmF3YWJsZTtcblxuICAgIHdoaWxlICggdHJ1ZSApIHtcbiAgICAgIGNvbnN0IG5leHREcmF3YWJsZSA9IGRyYXdhYmxlLm5leHREcmF3YWJsZTtcblxuICAgICAgLy8gZmlyc3QgY29tcGFyaXNvbiBhbHNvIGRvZXMgbnVsbCBjaGVjayB3aGVuIG5lY2Vzc2FyeVxuICAgICAgaWYgKCBuZXh0RHJhd2FibGUgIT09IGN1dG9mZkRyYXdhYmxlICYmIG5leHREcmF3YWJsZS5yZW5kZXJlciA9PT0gcmVuZGVyZXIgKSB7XG4gICAgICAgIGRyYXdhYmxlID0gbmV4dERyYXdhYmxlO1xuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBkcmF3YWJsZTtcbiAgfVxuICBlbHNlIHtcbiAgICByZXR1cm4gbnVsbDsgLy8gd2l0aCBubyBkcmF3YWJsZUFmdGVyLCB3ZSBkb24ndCBoYXZlIGFueSBleHRlcm5hbCBkcmF3YWJsZXMgYWZ0ZXIgb3VyIGludGVydmFsXG4gIH1cbn1cblxuY2xhc3MgR3JlZWR5U3RpdGNoZXIgZXh0ZW5kcyBTdGl0Y2hlciB7XG4gIC8qKlxuICAgKiBNYWluIHN0aXRjaCBlbnRyeSBwb2ludCwgY2FsbGVkIGRpcmVjdGx5IGZyb20gdGhlIGJhY2tib25lIG9yIGNhY2hlLiBXZSBhcmUgbW9kaWZ5aW5nIG91ciBiYWNrYm9uZSdzIGJsb2NrcyBhbmRcbiAgICogdGhlaXIgYXR0YWNoZWQgZHJhd2FibGVzLlxuICAgKiBAcHVibGljXG4gICAqXG4gICAqIFRoZSBjaGFuZ2UtaW50ZXJ2YWwgcGFpciBkZW5vdGVzIGEgbGlua2VkLWxpc3Qgb2YgY2hhbmdlIGludGVydmFscyB0aGF0IHdlIHdpbGwgbmVlZCB0byBzdGl0Y2ggYWNyb3NzICh0aGV5XG4gICAqIGNvbnRhaW4gZHJhd2FibGVzIHRoYXQgbmVlZCB0byBiZSByZW1vdmVkIGFuZCBhZGRlZCwgYW5kIGl0IG1heSBhZmZlY3QgaG93IHdlIGxheSBvdXQgYmxvY2tzIGluIHRoZSBzdGFja2luZ1xuICAgKiBvcmRlcikuXG4gICAqXG4gICAqIEBwYXJhbSB7QmFja2JvbmVEcmF3YWJsZX0gYmFja2JvbmVcbiAgICogQHBhcmFtIHtEcmF3YWJsZXxudWxsfSBmaXJzdFN0aXRjaERyYXdhYmxlXG4gICAqIEBwYXJhbSB7RHJhd2FibGV8bnVsbH0gbGFzdFN0aXRjaERyYXdhYmxlXG4gICAqIEBwYXJhbSB7RHJhd2FibGV8bnVsbH0gb2xkRmlyc3RTdGl0Y2hEcmF3YWJsZVxuICAgKiBAcGFyYW0ge0RyYXdhYmxlfG51bGx9IG9sZExhc3RTdGl0Y2hEcmF3YWJsZVxuICAgKiBAcGFyYW0ge0NoYW5nZUludGVydmFsfSBmaXJzdENoYW5nZUludGVydmFsXG4gICAqIEBwYXJhbSB7Q2hhbmdlSW50ZXJ2YWx9IGxhc3RDaGFuZ2VJbnRlcnZhbFxuICAgKi9cbiAgc3RpdGNoKCBiYWNrYm9uZSwgZmlyc3RTdGl0Y2hEcmF3YWJsZSwgbGFzdFN0aXRjaERyYXdhYmxlLCBvbGRGaXJzdFN0aXRjaERyYXdhYmxlLCBvbGRMYXN0U3RpdGNoRHJhd2FibGUsIGZpcnN0Q2hhbmdlSW50ZXJ2YWwsIGxhc3RDaGFuZ2VJbnRlcnZhbCApIHtcbiAgICAvLyByZXF1aXJlZCBjYWxsIHRvIHRoZSBTdGl0Y2hlciBpbnRlcmZhY2UgKHNlZSBTdGl0Y2hlci5pbml0aWFsaXplKCkpLlxuICAgIHRoaXMuaW5pdGlhbGl6ZSggYmFja2JvbmUsIGZpcnN0U3RpdGNoRHJhd2FibGUsIGxhc3RTdGl0Y2hEcmF3YWJsZSwgb2xkRmlyc3RTdGl0Y2hEcmF3YWJsZSwgb2xkTGFzdFN0aXRjaERyYXdhYmxlLCBmaXJzdENoYW5nZUludGVydmFsLCBsYXN0Q2hhbmdlSW50ZXJ2YWwgKTtcblxuICAgIC8vIFRyYWNrcyB3aGV0aGVyIG91ciBvcmRlciBvZiBibG9ja3MgY2hhbmdlZC4gSWYgaXQgZGlkLCB3ZSdsbCBuZWVkIHRvIHJlYnVpbGQgb3VyIGJsb2NrcyBhcnJheS4gVGhpcyBmbGFnIGlzXG4gICAgLy8gc2V0IGlmIHdlIHJlbW92ZSBhbnkgYmxvY2tzLCBjcmVhdGUgYW55IGJsb2Nrcywgb3IgY2hhbmdlIHRoZSBvcmRlciBiZXR3ZWVuIHR3byBibG9ja3MgKHZpYSBsaW5rQmxvY2tzKS5cbiAgICAvLyBJdCBkb2VzIE5PVCBvY2N1ciBpbiB1bnVzZUJsb2NrLCBzaW5jZSB3ZSBtYXkgcmV1c2UgdGhlIHNhbWUgYmxvY2sgaW4gdGhlIHNhbWUgcG9zaXRpb24gKHRodXMgbm90IGhhdmluZyBhblxuICAgIC8vIG9yZGVyIGNoYW5nZSkuXG4gICAgdGhpcy5ibG9ja09yZGVyQ2hhbmdlZCA9IGZhbHNlO1xuXG4gICAgLy8gTGlzdCBvZiBibG9ja3MgdGhhdCAoaW4gdGhlIGN1cnJlbnQgcGFydCBvZiB0aGUgc3RpdGNoIGJlaW5nIHByb2Nlc3NlZCkgYXJlIG5vdCBzZXQgdG8gYmUgdXNlZCBieSBhbnlcbiAgICAvLyBkcmF3YWJsZXMuIEJsb2NrcyBhcmUgYWRkZWQgdG8gaGVyZSB3aGVuIHRoZXkgYXJlIGZ1bGx5IGludGVybmFsIHRvIGEgY2hhbmdlIGludGVydmFsLCBhbmQgd2hlbiB3ZSBnbHVlXG4gICAgLy8gYmxvY2tzIHRvZ2V0aGVyLiBUaGV5IGNhbiBiZSByZXVzZWQgdGhyb3VnaCB0aGUgYmxvY2stbWF0Y2hpbmcgcHJvY2Vzcy4gSWYgdGhleSBhcmUgbm90IHJldXNlZCBhdCB0aGUgZW5kIG9mXG4gICAgLy8gdGhpcyBzdGl0Y2gsIHRoZXkgd2lsbCBiZSBtYXJrZWQgZm9yIHJlbW92YWwuXG4gICAgdGhpcy5yZXVzYWJsZUJsb2NrcyA9IGNsZWFuQXJyYXkoIHRoaXMucmV1c2FibGVCbG9ja3MgKTsgLy8gcmUtdXNlIGluc3RhbmNlLCBzaW5jZSB3ZSBhcmUgZWZmZWN0aXZlbHkgcG9vbGVkXG5cbiAgICAvLyBUbyBwcm9wZXJseSBoYW5kbGUgZ2x1ZS91bmdsdWUgc2l0dWF0aW9ucyB3aXRoIGV4dGVybmFsIGJsb2NrcyAob25lcyB0aGF0IGFyZW4ndCByZXVzYWJsZSBhZnRlciBwaGFzZSAxKSxcbiAgICAvLyB3ZSBuZWVkIHNvbWUgZXh0cmEgdHJhY2tpbmcgZm9yIG91ciBpbm5lciBzdWItYmxvY2sgZWRnZSBjYXNlIGxvb3AuXG4gICAgdGhpcy5ibG9ja1dhc0FkZGVkID0gZmFsc2U7IC8vIHdlIG5lZWQgdG8ga25vdyBpZiBhIHByZXZpb3VzbHktZXhpc3RpbmcgYmxvY2sgd2FzIGFkZGVkLCBhbmQgcmVtb3ZlIGl0IG90aGVyd2lzZS5cblxuICAgIGxldCBpbnRlcnZhbDtcblxuICAgIC8vIHJlY29yZCBjdXJyZW50IGZpcnN0L2xhc3QgZHJhd2FibGVzIGZvciB0aGUgZW50aXJlIGJhY2tib25lXG4gICAgdGhpcy5yZWNvcmRCYWNrYm9uZUJvdW5kYXJpZXMoKTtcblxuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5HcmVlZHlTdGl0Y2hlciAmJiBzY2VuZXJ5TG9nLkdyZWVkeVN0aXRjaGVyKCAncGhhc2UgMTogb2xkIGxpbmtlZCBsaXN0JyApO1xuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5HcmVlZHlTdGl0Y2hlciAmJiBzY2VuZXJ5TG9nLnB1c2goKTtcblxuICAgIC8vIEhhbmRsZSBwZW5kaW5nIHJlbW92YWwgb2Ygb2xkIGJsb2Nrcy9kcmF3YWJsZXMuIEZpcnN0LCB3ZSBuZWVkIHRvIG1hcmsgYWxsICdpbnRlcm5hbCcgZHJhd2FibGVzIHdpdGhcbiAgICAvLyBub3RlUGVuZGluZ1JlbW92YWwoKSwgc28gdGhhdCBpZiB0aGV5IGFyZW4ndCBhZGRlZCBiYWNrIGluIHRoaXMgYmFja2JvbmUsIHRoYXQgdGhleSBhcmUgcmVtb3ZlZCBmcm9tIHRoZWlyXG4gICAgLy8gb2xkIGJsb2NrLiBOb3RlIHRoYXQgbGF0ZXIgd2Ugd2lsbCBhZGQgdGhlIG9uZXMgdGhhdCBzdGF5IG9uIHRoaXMgYmFja2JvbmUsIHNvIHRoYXQgdGhleSBvbmx5IGVpdGhlciBjaGFuZ2VcbiAgICAvLyBibG9ja3MsIG9yIHN0YXkgb24gdGhlIHNhbWUgYmxvY2suXG4gICAgaWYgKCBiYWNrYm9uZS5ibG9ja3MubGVuZ3RoICkge1xuICAgICAgY29uc3QgdmVyeUZpcnN0QmxvY2sgPSBiYWNrYm9uZS5ibG9ja3NbIDAgXTtcbiAgICAgIGNvbnN0IHZlcnlMYXN0QmxvY2sgPSBiYWNrYm9uZS5ibG9ja3NbIGJhY2tib25lLmJsb2Nrcy5sZW5ndGggLSAxIF07XG5cbiAgICAgIGZvciAoIGludGVydmFsID0gZmlyc3RDaGFuZ2VJbnRlcnZhbDsgaW50ZXJ2YWwgIT09IG51bGw7IGludGVydmFsID0gaW50ZXJ2YWwubmV4dENoYW5nZUludGVydmFsICkge1xuICAgICAgICBhc3NlcnQgJiYgYXNzZXJ0KCAhaW50ZXJ2YWwuaXNFbXB0eSgpLCAnV2Ugbm93IGd1YXJhbnRlZSB0aGF0IHRoZSBpbnRlcnZhbHMgYXJlIG5vbi1lbXB0eScgKTtcblxuICAgICAgICAvLyBGaXJzdCwgd2UgbmVlZCB0byBtYXJrIGFsbCBvbGQgJ2ludGVybmFsJyBkcmF3YWJsZXMgd2l0aCBub3RlUGVuZGluZ1JlbW92YWwoKSwgc28gdGhhdCBpZiB0aGV5IGFyZW4ndCBhZGRlZFxuICAgICAgICAvLyBiYWNrIGluIHRoaXMgYmFja2JvbmUsIHRoYXQgdGhleSBhcmUgcmVtb3ZlZCBmcm9tIHRoZWlyIG9sZCBibG9jay4gTm90ZSB0aGF0IGxhdGVyIHdlIHdpbGwgYWRkIHRoZSBvbmVzXG4gICAgICAgIC8vIHRoYXQgc3RheSBvbiB0aGlzIGJhY2tib25lLCBzbyB0aGF0IHRoZXkgb25seSBlaXRoZXIgY2hhbmdlIGJsb2Nrcywgb3Igc3RheSBvbiB0aGUgc2FtZSBibG9jay5cbiAgICAgICAgaWYgKCBpbnRlcnZhbEhhc09sZEludGVybmFsRHJhd2FibGVzKCBpbnRlcnZhbCwgb2xkRmlyc3RTdGl0Y2hEcmF3YWJsZSwgb2xkTGFzdFN0aXRjaERyYXdhYmxlICkgKSB7XG4gICAgICAgICAgY29uc3QgZmlyc3RSZW1vdmFsID0gaW50ZXJ2YWwuZHJhd2FibGVCZWZvcmUgP1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGludGVydmFsLmRyYXdhYmxlQmVmb3JlLm9sZE5leHREcmF3YWJsZSA6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb2xkRmlyc3RTdGl0Y2hEcmF3YWJsZTtcbiAgICAgICAgICBjb25zdCBsYXN0UmVtb3ZhbCA9IGludGVydmFsLmRyYXdhYmxlQWZ0ZXIgP1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW50ZXJ2YWwuZHJhd2FibGVBZnRlci5vbGRQcmV2aW91c0RyYXdhYmxlIDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9sZExhc3RTdGl0Y2hEcmF3YWJsZTtcblxuICAgICAgICAgIC8vIGRyYXdhYmxlIGl0ZXJhdGlvbiBvbiB0aGUgJ29sZCcgbGlua2VkIGxpc3RcbiAgICAgICAgICBmb3IgKCBsZXQgcmVtb3ZlZERyYXdhYmxlID0gZmlyc3RSZW1vdmFsOyA7IHJlbW92ZWREcmF3YWJsZSA9IHJlbW92ZWREcmF3YWJsZS5vbGROZXh0RHJhd2FibGUgKSB7XG4gICAgICAgICAgICB0aGlzLm5vdGVQZW5kaW5nUmVtb3ZhbCggcmVtb3ZlZERyYXdhYmxlICk7XG4gICAgICAgICAgICBpZiAoIHJlbW92ZWREcmF3YWJsZSA9PT0gbGFzdFJlbW92YWwgKSB7IGJyZWFrOyB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gQmxvY2tzIHRvdGFsbHkgY29udGFpbmVkIHdpdGhpbiB0aGUgY2hhbmdlIGludGVydmFsIGFyZSBtYXJrZWQgYXMgcmV1c2FibGUgKGRvZXNuJ3QgaW5jbHVkZSBlbmQgYmxvY2tzKS5cbiAgICAgICAgaWYgKCBpbnRlcnZhbEhhc09sZEludGVybmFsQmxvY2tzKCBpbnRlcnZhbCwgdmVyeUZpcnN0QmxvY2ssIHZlcnlMYXN0QmxvY2sgKSApIHtcbiAgICAgICAgICBjb25zdCBmaXJzdEJsb2NrID0gaW50ZXJ2YWwuZHJhd2FibGVCZWZvcmUgPT09IG51bGwgPyBiYWNrYm9uZS5ibG9ja3NbIDAgXSA6IGludGVydmFsLmRyYXdhYmxlQmVmb3JlLnBhcmVudERyYXdhYmxlLm5leHRCbG9jaztcbiAgICAgICAgICBjb25zdCBsYXN0QmxvY2sgPSBpbnRlcnZhbC5kcmF3YWJsZUFmdGVyID09PSBudWxsID8gYmFja2JvbmUuYmxvY2tzWyBiYWNrYm9uZS5ibG9ja3MubGVuZ3RoIC0gMSBdIDogaW50ZXJ2YWwuZHJhd2FibGVBZnRlci5wYXJlbnREcmF3YWJsZS5wcmV2aW91c0Jsb2NrO1xuXG4gICAgICAgICAgZm9yICggbGV0IG1hcmtlZEJsb2NrID0gZmlyc3RCbG9jazsgOyBtYXJrZWRCbG9jayA9IG1hcmtlZEJsb2NrLm5leHRCbG9jayApIHtcbiAgICAgICAgICAgIHRoaXMudW51c2VCbG9jayggbWFya2VkQmxvY2sgKTtcbiAgICAgICAgICAgIGlmICggbWFya2VkQmxvY2sgPT09IGxhc3RCbG9jayApIHsgYnJlYWs7IH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuR3JlZWR5U3RpdGNoZXIgJiYgc2NlbmVyeUxvZy5wb3AoKTtcblxuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5HcmVlZHlTdGl0Y2hlciAmJiBzY2VuZXJ5TG9nLkdyZWVkeVN0aXRjaGVyKCAncGhhc2UgMjogbmV3IGxpbmtlZCBsaXN0JyApO1xuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5HcmVlZHlTdGl0Y2hlciAmJiBzY2VuZXJ5TG9nLnB1c2goKTtcblxuICAgIC8vIERvbid0IHByb2Nlc3MgdGhlIHNpbmdsZSBpbnRlcnZhbCBsZWZ0IGlmIHdlIGFyZW4ndCBsZWZ0IHdpdGggYW55IGRyYXdhYmxlcyAodGh1cyBsZWZ0IHdpdGggbm8gYmxvY2tzKVxuICAgIGlmICggZmlyc3RTdGl0Y2hEcmF3YWJsZSApIHtcbiAgICAgIGZvciAoIGludGVydmFsID0gZmlyc3RDaGFuZ2VJbnRlcnZhbDsgaW50ZXJ2YWwgIT09IG51bGw7IGludGVydmFsID0gaW50ZXJ2YWwubmV4dENoYW5nZUludGVydmFsICkge1xuICAgICAgICB0aGlzLnByb2Nlc3NJbnRlcnZhbCggYmFja2JvbmUsIGludGVydmFsLCBmaXJzdFN0aXRjaERyYXdhYmxlLCBsYXN0U3RpdGNoRHJhd2FibGUgKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuR3JlZWR5U3RpdGNoZXIgJiYgc2NlbmVyeUxvZy5wb3AoKTtcblxuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5HcmVlZHlTdGl0Y2hlciAmJiBzY2VuZXJ5TG9nLkdyZWVkeVN0aXRjaGVyKCAncGhhc2UgMzogY2xlYW51cCcgKTtcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuR3JlZWR5U3RpdGNoZXIgJiYgc2NlbmVyeUxvZy5wdXNoKCk7XG5cbiAgICAvLyBBbnl0aGluZyBpbiBvdXIgJ3JldXNhYmxlJyBibG9ja3MgYXJyYXkgc2hvdWxkIGJlIHJlbW92ZWQgZnJvbSBvdXIgRE9NIGFuZCBtYXJrZWQgZm9yIGRpc3Bvc2FsLlxuICAgIHRoaXMucmVtb3ZlVW51c2VkQmxvY2tzKCk7XG5cbiAgICAvLyBGaXJlIG9mZiBub3RpZnlJbnRlcnZhbCBjYWxscyB0byBibG9ja3MgaWYgdGhlaXIgYm91bmRhcmllcyAoZmlyc3QvbGFzdCBkcmF3YWJsZXMpIGhhdmUgY2hhbmdlZC4gVGhpcyBpc1xuICAgIC8vIGEgbmVjZXNzYXJ5IGNhbGwgc2luY2Ugd2UgdXNlZCBtYXJrQmVmb3JlQmxvY2svbWFya0FmdGVyQmxvY2sgdG8gcmVjb3JkIGJsb2NrIGJvdW5kYXJpZXMgYXMgd2Ugd2VudCBhbG9uZy5cbiAgICAvLyBXZSBkb24ndCB3YW50IHRvIGRvIHRoaXMgc3luY2hyb25vdXNseSwgYmVjYXVzZSB0aGVuIHlvdSBjb3VsZCB1cGRhdGUgYSBibG9jaydzIGJvdW5kYXJpZXMgbXVsdGlwbGUgdGltZXMsXG4gICAgLy8gd2hpY2ggbWF5IGJlIGV4cGVuc2l2ZS5cbiAgICB0aGlzLnVwZGF0ZUJsb2NrSW50ZXJ2YWxzKCk7XG5cbiAgICBpZiAoIGZpcnN0U3RpdGNoRHJhd2FibGUgPT09IG51bGwgKSB7XG4gICAgICAvLyBpLmUuIGNsZWFyIG91ciBibG9ja3MgYXJyYXlcbiAgICAgIHRoaXMudXNlTm9CbG9ja3MoKTtcbiAgICB9XG4gICAgZWxzZSBpZiAoIHRoaXMuYmxvY2tPcmRlckNoYW5nZWQgKSB7XG4gICAgICAvLyBSZWJ1aWxkIG91ciBibG9ja3MgYXJyYXkgZnJvbSB0aGUgbGlua2VkIGxpc3QgZm9ybWF0IHdlIHVzZWQgZm9yIHJlY29yZGluZyBvdXIgY2hhbmdlcyAoYXZvaWRzIE8obl4yKVxuICAgICAgLy8gc2l0dWF0aW9ucyBzaW5jZSB3ZSBkb24ndCBuZWVkIHRvIGRvIGFycmF5IGluZGV4IGxvb2t1cHMgd2hpbGUgbWFraW5nIGNoYW5nZXMsIGJ1dCBvbmx5IGF0IHRoZSBlbmQpLlxuICAgICAgdGhpcy5wcm9jZXNzQmxvY2tMaW5rZWRMaXN0KCBiYWNrYm9uZSwgZmlyc3RTdGl0Y2hEcmF3YWJsZS5wZW5kaW5nUGFyZW50RHJhd2FibGUsIGxhc3RTdGl0Y2hEcmF3YWJsZS5wZW5kaW5nUGFyZW50RHJhd2FibGUgKTtcblxuICAgICAgLy8gQWN0dWFsbHkgcmVpbmRleCB0aGUgRE9NIGVsZW1lbnRzIG9mIHRoZSBibG9ja3MgKGNoYW5naW5nIGFzIG5lY2Vzc2FyeSlcbiAgICAgIHRoaXMucmVpbmRleCgpO1xuICAgIH1cblxuICAgIC8vIHJlcXVpcmVkIGNhbGwgdG8gdGhlIFN0aXRjaGVyIGludGVyZmFjZSAoc2VlIFN0aXRjaGVyLmNsZWFuKCkpLlxuICAgIHRoaXMuY2xlYW4oKTtcblxuICAgIC8vIHJlbGVhc2UgdGhlIHJlZmVyZW5jZXMgd2UgbWFkZSBpbiB0aGlzIHR5cGVcbiAgICBjbGVhbkFycmF5KCB0aGlzLnJldXNhYmxlQmxvY2tzICk7XG5cbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuR3JlZWR5U3RpdGNoZXIgJiYgc2NlbmVyeUxvZy5wb3AoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBEb2VzIHRoZSBtYWluIGJ1bGsgb2YgdGhlIHdvcmsgZm9yIGVhY2ggY2hhbmdlIGludGVydmFsLlxuICAgKiBAcHJpdmF0ZVxuICAgKlxuICAgKiBAcGFyYW0ge0JhY2tib25lRHJhd2FibGV9IGJhY2tib25lXG4gICAqIEBwYXJhbSB7Q2hhbmdlSW50ZXJ2YWx9IGludGVydmFsXG4gICAqIEBwYXJhbSB7RHJhd2FibGV8bnVsbH0gZmlyc3RTdGl0Y2hEcmF3YWJsZVxuICAgKiBAcGFyYW0ge0RyYXdhYmxlfG51bGx9IGxhc3RTdGl0Y2hEcmF3YWJsZVxuICAgKi9cbiAgcHJvY2Vzc0ludGVydmFsKCBiYWNrYm9uZSwgaW50ZXJ2YWwsIGZpcnN0U3RpdGNoRHJhd2FibGUsIGxhc3RTdGl0Y2hEcmF3YWJsZSApIHtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBpbnRlcnZhbCBpbnN0YW5jZW9mIENoYW5nZUludGVydmFsICk7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggZmlyc3RTdGl0Y2hEcmF3YWJsZSBpbnN0YW5jZW9mIERyYXdhYmxlLCAnV2UgYXNzdW1lIHdlIGhhdmUgYSBub24tbnVsbCByZW1haW5pbmcgc2VjdGlvbicgKTtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBsYXN0U3RpdGNoRHJhd2FibGUgaW5zdGFuY2VvZiBEcmF3YWJsZSwgJ1dlIGFzc3VtZSB3ZSBoYXZlIGEgbm9uLW51bGwgcmVtYWluaW5nIHNlY3Rpb24nICk7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggIWludGVydmFsLmlzRW1wdHkoKSwgJ1dlIG5vdyBndWFyYW50ZWUgdGhhdCB0aGUgaW50ZXJ2YWxzIGFyZSBub24tZW1wdHknICk7XG5cbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuR3JlZWR5VmVyYm9zZSAmJiBzY2VuZXJ5TG9nLkdyZWVkeVZlcmJvc2UoIGBpbnRlcnZhbDogJHtcbiAgICAgIGludGVydmFsLmRyYXdhYmxlQmVmb3JlID8gaW50ZXJ2YWwuZHJhd2FibGVCZWZvcmUudG9TdHJpbmcoKSA6ICdudWxsJ1xuICAgIH0gdG8gJHtcbiAgICAgIGludGVydmFsLmRyYXdhYmxlQWZ0ZXIgPyBpbnRlcnZhbC5kcmF3YWJsZUFmdGVyLnRvU3RyaW5nKCkgOiAnbnVsbCd9YCApO1xuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5HcmVlZHlWZXJib3NlICYmIHNjZW5lcnlMb2cucHVzaCgpO1xuXG4gICAgLy8gY2hlY2sgaWYgb3VyIGludGVydmFsIHJlbW92ZXMgZXZlcnl0aGluZywgd2UgbWF5IG5lZWQgYSBnbHVlXG4gICAgaWYgKCAhaW50ZXJ2YWxIYXNOZXdJbnRlcm5hbERyYXdhYmxlcyggaW50ZXJ2YWwsIGZpcnN0U3RpdGNoRHJhd2FibGUsIGxhc3RTdGl0Y2hEcmF3YWJsZSApICkge1xuICAgICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLkdyZWVkeVZlcmJvc2UgJiYgc2NlbmVyeUxvZy5HcmVlZHlWZXJib3NlKCAnbm8gY3VycmVudCBpbnRlcm5hbCBkcmF3YWJsZXMgaW4gaW50ZXJ2YWwnICk7XG5cbiAgICAgIC8vIHNlcGFyYXRlIGlmLCBsYXN0IGNvbmRpdGlvbiBhYm92ZSB3b3VsZCBjYXVzZSBpc3N1ZXMgd2l0aCB0aGUgbm9ybWFsIG9wZXJhdGlvbiBicmFuY2hcbiAgICAgIGlmICggaW50ZXJ2YWwuZHJhd2FibGVCZWZvcmUgJiYgaW50ZXJ2YWwuZHJhd2FibGVBZnRlciApIHtcbiAgICAgICAgYXNzZXJ0ICYmIGFzc2VydCggaW50ZXJ2YWwuZHJhd2FibGVCZWZvcmUubmV4dERyYXdhYmxlID09PSBpbnRlcnZhbC5kcmF3YWJsZUFmdGVyICk7XG5cbiAgICAgICAgLy8gaWYgd2UgcmVtb3ZlZCBldmVyeXRoaW5nIChubyBuZXcgaW50ZXJuYWwgZHJhd2FibGVzKSwgb3VyIGRyYXdhYmxlQmVmb3JlIGlzIG9wZW4gJ2FmdGVyJywgaWYgb3VyXG4gICAgICAgIC8vIGRyYXdhYmxlQWZ0ZXIgaXMgb3BlbiAnYmVmb3JlJyBzaW5jZSB0aGV5IGFyZSBzaWJsaW5ncyAob25seSBvbmUgZmxhZyBuZWVkZWQpLlxuICAgICAgICBjb25zdCBpc09wZW4gPSAhaGFzR2FwQmV0d2VlbkRyYXdhYmxlcyggaW50ZXJ2YWwuZHJhd2FibGVCZWZvcmUsIGludGVydmFsLmRyYXdhYmxlQWZ0ZXIgKTtcblxuICAgICAgICAvLyBoYW5kbGUgZ2x1ZS91bmdsdWUgb3IgYW55IG90aGVyICdleHRlcm5hbCcgY2hhbmdlc1xuICAgICAgICB0aGlzLnByb2Nlc3NFZGdlQ2FzZXMoIGludGVydmFsLCBpc09wZW4sIGlzT3BlbiApO1xuICAgICAgfVxuXG4gICAgICBpZiAoIGludGVydmFsLmRyYXdhYmxlQmVmb3JlICYmICFpc09wZW5BZnRlciggaW50ZXJ2YWwuZHJhd2FibGVCZWZvcmUgKSApIHtcbiAgICAgICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLkdyZWVkeVZlcmJvc2UgJiYgc2NlbmVyeUxvZy5HcmVlZHlWZXJib3NlKCAnY2xvc2VkLWFmdGVyIGNvbGxhcHNlZCBsaW5rOicgKTtcbiAgICAgICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLkdyZWVkeVZlcmJvc2UgJiYgc2NlbmVyeUxvZy5wdXNoKCk7XG4gICAgICAgIHRoaXMubGlua0FmdGVyRHJhd2FibGUoIGludGVydmFsLmRyYXdhYmxlQmVmb3JlICk7XG4gICAgICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5HcmVlZHlWZXJib3NlICYmIHNjZW5lcnlMb2cucG9wKCk7XG4gICAgICB9XG4gICAgICBlbHNlIGlmICggaW50ZXJ2YWwuZHJhd2FibGVBZnRlciAmJiAhaXNPcGVuQmVmb3JlKCBpbnRlcnZhbC5kcmF3YWJsZUFmdGVyICkgKSB7XG4gICAgICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5HcmVlZHlWZXJib3NlICYmIHNjZW5lcnlMb2cuR3JlZWR5VmVyYm9zZSggJ2Nsb3NlZC1iZWZvcmUgY29sbGFwc2VkIGxpbms6JyApO1xuICAgICAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuR3JlZWR5VmVyYm9zZSAmJiBzY2VuZXJ5TG9nLnB1c2goKTtcbiAgICAgICAgdGhpcy5saW5rQmVmb3JlRHJhd2FibGUoIGludGVydmFsLmRyYXdhYmxlQWZ0ZXIgKTtcbiAgICAgICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLkdyZWVkeVZlcmJvc2UgJiYgc2NlbmVyeUxvZy5wb3AoKTtcbiAgICAgIH1cbiAgICB9XG4gICAgLy8gb3RoZXJ3aXNlIG5vcm1hbCBvcGVyYXRpb25cbiAgICBlbHNlIHtcbiAgICAgIGxldCBkcmF3YWJsZSA9IGludGVydmFsLmRyYXdhYmxlQmVmb3JlID8gaW50ZXJ2YWwuZHJhd2FibGVCZWZvcmUubmV4dERyYXdhYmxlIDogZmlyc3RTdGl0Y2hEcmF3YWJsZTtcblxuICAgICAgLy8gaWYgd2UgaGF2ZSBhbnkgY3VycmVudCBkcmF3YWJsZXMgYXQgYWxsXG4gICAgICBsZXQgc3ViQmxvY2tGaXJzdERyYXdhYmxlID0gbnVsbDtcbiAgICAgIGxldCBtYXRjaGVkQmxvY2sgPSBudWxsO1xuICAgICAgbGV0IGlzRmlyc3QgPSB0cnVlO1xuXG4gICAgICAvLyBzZXBhcmF0ZSBvdXIgbmV3LWRyYXdhYmxlIGxpbmtlZC1saXN0IGludG8gc3ViLWJsb2NrcyB0aGF0IHdlIHdpbGwgcHJvY2VzcyBpbmRpdmlkdWFsbHlcbiAgICAgIHdoaWxlICggdHJ1ZSApIHtcbiAgICAgICAgY29uc3QgbmV4dERyYXdhYmxlID0gZHJhd2FibGUubmV4dERyYXdhYmxlO1xuICAgICAgICBjb25zdCBpc0xhc3QgPSBuZXh0RHJhd2FibGUgPT09IGludGVydmFsLmRyYXdhYmxlQWZ0ZXI7XG5cbiAgICAgICAgYXNzZXJ0ICYmIGFzc2VydCggbmV4dERyYXdhYmxlICE9PSBudWxsIHx8IGlzTGFzdCwgJ0lmIG91ciBuZXh0RHJhd2FibGUgaXMgbnVsbCwgaXNMYXN0IG11c3QgYmUgdHJ1ZScgKTtcblxuICAgICAgICBpZiAoICFzdWJCbG9ja0ZpcnN0RHJhd2FibGUgKSB7XG4gICAgICAgICAgc3ViQmxvY2tGaXJzdERyYXdhYmxlID0gZHJhd2FibGU7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBTZWUgaWYgYW55IG9mIG91ciAnbmV3JyBkcmF3YWJsZXMgd2VyZSBwYXJ0IG9mIGEgYmxvY2sgdGhhdCB3ZSd2ZSBtYXJrZWQgYXMgcmV1c2FibGUuIElmIHRoaXMgaXMgdGhlIGNhc2UsXG4gICAgICAgIC8vIHdlJ2xsIGdyZWVkaWx5IHRyeSB0byB1c2UgdGhpcyBibG9jayBmb3IgbWF0Y2hpbmcgaWYgcG9zc2libGUgKGlnbm9yaW5nIHRoZSBvdGhlciBwb3RlbnRpYWwgbWF0Y2hlcyBmb3JcbiAgICAgICAgLy8gb3RoZXIgZHJhd2FibGVzIGFmdGVyIGluIHRoZSBzYW1lIHN1Yi1ibG9jaykuXG4gICAgICAgIGlmICggbWF0Y2hlZEJsb2NrID09PSBudWxsICYmIGRyYXdhYmxlLnBhcmVudERyYXdhYmxlICYmICFkcmF3YWJsZS5wYXJlbnREcmF3YWJsZS51c2VkICYmIGRyYXdhYmxlLmJhY2tib25lID09PSBiYWNrYm9uZSAmJlxuICAgICAgICAgICAgIGRyYXdhYmxlLnBhcmVudERyYXdhYmxlLnBhcmVudERyYXdhYmxlID09PSBiYWNrYm9uZSApIHtcbiAgICAgICAgICBtYXRjaGVkQmxvY2sgPSBkcmF3YWJsZS5wYXJlbnREcmF3YWJsZTtcbiAgICAgICAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuR3JlZWR5VmVyYm9zZSAmJiBzY2VuZXJ5TG9nLkdyZWVkeVZlcmJvc2UoIGBtYXRjaGluZyBhdCAke2RyYXdhYmxlLnRvU3RyaW5nKCl9IHdpdGggJHttYXRjaGVkQmxvY2t9YCApO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCBpc0xhc3QgfHwgaGFzR2FwQmV0d2VlbkRyYXdhYmxlcyggZHJhd2FibGUsIG5leHREcmF3YWJsZSApICkge1xuICAgICAgICAgIGlmICggaXNGaXJzdCApIHtcbiAgICAgICAgICAgIC8vIHdlJ2xsIGhhbmRsZSBhbnkgZ2x1ZS91bmdsdWUgYXQgdGhlIHN0YXJ0LCBzbyBldmVyeSBwcm9jZXNzU3ViQmxvY2sgY2FuIGJlIHNldCBjb3JyZWN0bHkuXG4gICAgICAgICAgICB0aGlzLnByb2Nlc3NFZGdlQ2FzZXMoIGludGVydmFsLCBpc09wZW5CZWZvcmUoIHN1YkJsb2NrRmlyc3REcmF3YWJsZSApLCBpc09wZW5BZnRlciggZHJhd2FibGUgKSApO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIGRvIHRoZSBuZWNlc3Nhcnkgd29yayBmb3IgZWFjaCBzdWItYmxvY2sgKGFkZGluZyBkcmF3YWJsZXMsIGxpbmtpbmcsIHVzaW5nIG1hdGNoZWQgYmxvY2tzKVxuICAgICAgICAgIHRoaXMucHJvY2Vzc1N1YkJsb2NrKCBpbnRlcnZhbCwgc3ViQmxvY2tGaXJzdERyYXdhYmxlLCBkcmF3YWJsZSwgbWF0Y2hlZEJsb2NrLCBpc0ZpcnN0LCBpc0xhc3QgKTtcblxuICAgICAgICAgIHN1YkJsb2NrRmlyc3REcmF3YWJsZSA9IG51bGw7XG4gICAgICAgICAgbWF0Y2hlZEJsb2NrID0gbnVsbDtcbiAgICAgICAgICBpc0ZpcnN0ID0gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIGlzTGFzdCApIHtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICBkcmF3YWJsZSA9IG5leHREcmF3YWJsZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLkdyZWVkeVZlcmJvc2UgJiYgc2NlbmVyeUxvZy5wb3AoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcHJpdmF0ZVxuICAgKlxuICAgKiBAcGFyYW0ge0NoYW5nZUludGVydmFsfSBpbnRlcnZhbFxuICAgKiBAcGFyYW0ge0RyYXdhYmxlfSBmaXJzdERyYXdhYmxlIC0gZm9yIHRoZSBzcGVjaWZpYyBzdWItYmxvY2tcbiAgICogQHBhcmFtIHtEcmF3YWJsZX0gbGFzdERyYXdhYmxlIC0gZm9yIHRoZSBzcGVjaWZpYyBzdWItYmxvY2tcbiAgICogQHBhcmFtIHtCbG9ja30gbWF0Y2hlZEJsb2NrXG4gICAqIEBwYXJhbSB7Ym9vbGVhbn0gaXNGaXJzdFxuICAgKiBAcGFyYW0ge2Jvb2xlYW59IGlzTGFzdFxuICAgKi9cbiAgcHJvY2Vzc1N1YkJsb2NrKCBpbnRlcnZhbCwgZmlyc3REcmF3YWJsZSwgbGFzdERyYXdhYmxlLCBtYXRjaGVkQmxvY2ssIGlzRmlyc3QsIGlzTGFzdCApIHtcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuR3JlZWR5VmVyYm9zZSAmJiBzY2VuZXJ5TG9nLkdyZWVkeVZlcmJvc2UoXG4gICAgICBgc3ViLWJsb2NrOiAke2ZpcnN0RHJhd2FibGUudG9TdHJpbmcoKX0gdG8gJHtsYXN0RHJhd2FibGUudG9TdHJpbmcoKX0gJHtcbiAgICAgICAgbWF0Y2hlZEJsb2NrID8gYHdpdGggbWF0Y2hlZDogJHttYXRjaGVkQmxvY2sudG9TdHJpbmcoKX1gIDogJ3dpdGggbm8gbWF0Y2gnfWAgKTtcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuR3JlZWR5VmVyYm9zZSAmJiBzY2VuZXJ5TG9nLnB1c2goKTtcblxuICAgIGNvbnN0IG9wZW5CZWZvcmUgPSBpc09wZW5CZWZvcmUoIGZpcnN0RHJhd2FibGUgKTtcbiAgICBjb25zdCBvcGVuQWZ0ZXIgPSBpc09wZW5BZnRlciggbGFzdERyYXdhYmxlICk7XG5cbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCAhb3BlbkJlZm9yZSB8fCBpc0ZpcnN0LCAnb3BlbkJlZm9yZSBpbXBsaWVzIGlzRmlyc3QnICk7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggIW9wZW5BZnRlciB8fCBpc0xhc3QsICdvcGVuQWZ0ZXIgaW1wbGllcyBpc0xhc3QnICk7XG5cbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCAhb3BlbkJlZm9yZSB8fCAhb3BlbkFmdGVyIHx8IGZpcnN0RHJhd2FibGUucHJldmlvdXNEcmF3YWJsZS5wZW5kaW5nUGFyZW50RHJhd2FibGUgPT09IGxhc3REcmF3YWJsZS5uZXh0RHJhd2FibGUucGVuZGluZ1BhcmVudERyYXdhYmxlLFxuICAgICAgJ0lmIHdlIHdvdWxkIHVzZSBib3RoIHRoZSBiZWZvcmUgYW5kIGFmdGVyIGJsb2NrcywgbWFrZSBzdXJlIGFueSBnbHVpbmcgJyApO1xuXG4gICAgLy8gaWYgb3VyIHN1Yi1ibG9jayBnZXRzIGNvbWJpbmVkIGludG8gdGhlIHByZXZpb3VzIGJsb2NrLCB1c2UgaXRzIGJsb2NrIGluc3RlYWQgb2YgYW55IG1hdGNoLXNjYW5uZWQgYmxvY2tzXG4gICAgaWYgKCBvcGVuQmVmb3JlICkge1xuICAgICAgbWF0Y2hlZEJsb2NrID0gZmlyc3REcmF3YWJsZS5wcmV2aW91c0RyYXdhYmxlLnBlbmRpbmdQYXJlbnREcmF3YWJsZTtcbiAgICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5HcmVlZHlWZXJib3NlICYmIHNjZW5lcnlMb2cuR3JlZWR5VmVyYm9zZSggYGNvbWJpbmluZyBpbnRvIGJlZm9yZSBibG9jazogJHttYXRjaGVkQmxvY2sudG9TdHJpbmcoKX1gICk7XG4gICAgfVxuXG4gICAgLy8gaWYgb3VyIHN1Yi1ibG9jayBnZXRzIGNvbWJpbmVkIGludG8gdGhlIG5leHQgYmxvY2ssIHVzZSBpdHMgYmxvY2sgaW5zdGVhZCBvZiBhbnkgbWF0Y2gtc2Nhbm5lZCBibG9ja3NcbiAgICBpZiAoIG9wZW5BZnRlciApIHtcbiAgICAgIG1hdGNoZWRCbG9jayA9IGxhc3REcmF3YWJsZS5uZXh0RHJhd2FibGUucGVuZGluZ1BhcmVudERyYXdhYmxlO1xuICAgICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLkdyZWVkeVZlcmJvc2UgJiYgc2NlbmVyeUxvZy5HcmVlZHlWZXJib3NlKCBgY29tYmluaW5nIGludG8gYWZ0ZXIgYmxvY2s6ICR7bWF0Y2hlZEJsb2NrLnRvU3RyaW5nKCl9YCApO1xuICAgIH1cblxuICAgIC8vIGNyZWF0ZSBhIGJsb2NrIGlmIG1hdGNoZWRCbG9jayBpcyBudWxsLCBvdGhlcndpc2UgbWFyayBpdCBhcyB1c2VkIChpZiBpdCBpcyBpbiByZXVzYWJsZUJsb2NrcylcbiAgICBtYXRjaGVkQmxvY2sgPSB0aGlzLmVuc3VyZVVzZWRCbG9jayggbWF0Y2hlZEJsb2NrLCBmaXJzdERyYXdhYmxlICk7XG5cbiAgICAvLyBhZGQgaW50ZXJuYWwgZHJhd2FibGVzXG4gICAgZm9yICggbGV0IGRyYXdhYmxlID0gZmlyc3REcmF3YWJsZTsgOyBkcmF3YWJsZSA9IGRyYXdhYmxlLm5leHREcmF3YWJsZSApIHtcbiAgICAgIHRoaXMubm90ZVBlbmRpbmdBZGRpdGlvbiggZHJhd2FibGUsIG1hdGNoZWRCbG9jayApO1xuICAgICAgaWYgKCBkcmF3YWJsZSA9PT0gbGFzdERyYXdhYmxlICkgeyBicmVhazsgfVxuICAgIH1cblxuICAgIC8vIGxpbmsgb3VyIGJsb2NrcyAoYW5kIHNldCBwZW5kaW5nIGJsb2NrIGJvdW5kYXJpZXMpIGFzIG5lZWRlZC4gYXNzdW1lcyBnbHVlL3VuZ2x1ZSBoYXMgYWxyZWFkeSBiZWVuIHBlcmZvcm1lZFxuICAgIGlmICggIW9wZW5CZWZvcmUgKSB7XG4gICAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuR3JlZWR5VmVyYm9zZSAmJiBzY2VuZXJ5TG9nLkdyZWVkeVZlcmJvc2UoICdjbG9zZWQtYmVmb3JlIGxpbms6JyApO1xuICAgICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLkdyZWVkeVZlcmJvc2UgJiYgc2NlbmVyeUxvZy5wdXNoKCk7XG4gICAgICB0aGlzLmxpbmtCZWZvcmVEcmF3YWJsZSggZmlyc3REcmF3YWJsZSApO1xuICAgICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLkdyZWVkeVZlcmJvc2UgJiYgc2NlbmVyeUxvZy5wb3AoKTtcbiAgICB9XG4gICAgaWYgKCBpc0xhc3QgJiYgIW9wZW5BZnRlciApIHtcbiAgICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5HcmVlZHlWZXJib3NlICYmIHNjZW5lcnlMb2cuR3JlZWR5VmVyYm9zZSggJ2xhc3QgY2xvc2VkLWFmdGVyIGxpbms6JyApO1xuICAgICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLkdyZWVkeVZlcmJvc2UgJiYgc2NlbmVyeUxvZy5wdXNoKCk7XG4gICAgICB0aGlzLmxpbmtBZnRlckRyYXdhYmxlKCBsYXN0RHJhd2FibGUgKTtcbiAgICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5HcmVlZHlWZXJib3NlICYmIHNjZW5lcnlMb2cucG9wKCk7XG4gICAgfVxuXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLkdyZWVkeVZlcmJvc2UgJiYgc2NlbmVyeUxvZy5wb3AoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBmaXJzdERyYXdhYmxlIGFuZCBsYXN0RHJhd2FibGUgcmVmZXIgdG8gdGhlIHNwZWNpZmljIHN1Yi1ibG9jayAoaWYgaXQgZXhpc3RzKSwgaXNMYXN0IHJlZmVycyB0byBpZiBpdCdzIHRoZVxuICAgKiBsYXN0IHN1Yi1ibG9ja1xuICAgKiBAcHJpdmF0ZVxuICAgKlxuICAgKiBAcGFyYW0ge0NoYW5nZUludGVydmFsfSBpbnRlcnZhbFxuICAgKiBAcGFyYW0ge2Jvb2xlYW59IG9wZW5CZWZvcmVcbiAgICogQHBhcmFtIHtib29sZWFufSBvcGVuQWZ0ZXJcbiAgICovXG4gIHByb2Nlc3NFZGdlQ2FzZXMoIGludGVydmFsLCBvcGVuQmVmb3JlLCBvcGVuQWZ0ZXIgKSB7XG4gICAgLy8gdGhpcyB0ZXN0IHBhc3NlcyBmb3IgZ2x1ZSBhbmQgdW5nbHVlIGNhc2VzXG4gICAgaWYgKCBpbnRlcnZhbC5kcmF3YWJsZUJlZm9yZSAhPT0gbnVsbCAmJiBpbnRlcnZhbC5kcmF3YWJsZUFmdGVyICE9PSBudWxsICkge1xuICAgICAgY29uc3QgYmVmb3JlQmxvY2sgPSBpbnRlcnZhbC5kcmF3YWJsZUJlZm9yZS5wZW5kaW5nUGFyZW50RHJhd2FibGU7XG4gICAgICBjb25zdCBhZnRlckJsb2NrID0gaW50ZXJ2YWwuZHJhd2FibGVBZnRlci5wZW5kaW5nUGFyZW50RHJhd2FibGU7XG4gICAgICBjb25zdCBuZXh0QWZ0ZXJCbG9jayA9ICggaW50ZXJ2YWwubmV4dENoYW5nZUludGVydmFsICYmIGludGVydmFsLm5leHRDaGFuZ2VJbnRlcnZhbC5kcmF3YWJsZUFmdGVyICkgP1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbnRlcnZhbC5uZXh0Q2hhbmdlSW50ZXJ2YWwuZHJhd2FibGVBZnRlci5wZW5kaW5nUGFyZW50RHJhd2FibGUgOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICBudWxsO1xuXG4gICAgICAvLyBTaW5jZSB3ZSB3YW50IHRvIHJlbW92ZSBhbnkgYWZ0ZXJCbG9jayBhdCB0aGUgZW5kIG9mIGl0cyBydW4gaWYgd2UgZG9uJ3QgaGF2ZSBibG9ja1dhc0FkZGVkIHNldCwgdGhpcyBjaGVja1xuICAgICAgLy8gaXMgbmVjZXNzYXJ5IHRvIHNlZSBpZiB3ZSBoYXZlIGFscmVhZHkgdXNlZCB0aGlzIHNwZWNpZmljIGJsb2NrLlxuICAgICAgLy8gT3RoZXJ3aXNlLCB3ZSB3b3VsZCByZW1vdmUgb3VyIChwb3RlbnRpYWxseSB2ZXJ5LWZpcnN0KSBibG9jayB3aGVuIGl0IGhhcyBhbHJlYWR5IGJlZW4gdXNlZCBleHRlcm5hbGx5LlxuICAgICAgaWYgKCBiZWZvcmVCbG9jayA9PT0gYWZ0ZXJCbG9jayApIHtcbiAgICAgICAgdGhpcy5ibG9ja1dhc0FkZGVkID0gdHJ1ZTtcbiAgICAgIH1cblxuICAgICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLkdyZWVkeVZlcmJvc2UgJiYgc2NlbmVyeUxvZy5HcmVlZHlWZXJib3NlKFxuICAgICAgICBgZWRnZSBjYXNlOiAke1xuICAgICAgICAgIG9wZW5CZWZvcmUgPyAnb3Blbi1iZWZvcmUgJyA6ICcnXG4gICAgICAgIH0ke29wZW5BZnRlciA/ICdvcGVuLWFmdGVyICcgOiAnJ1xuICAgICAgICB9JHtiZWZvcmVCbG9jay50b1N0cmluZygpfSB0byAke2FmdGVyQmxvY2sudG9TdHJpbmcoKX1gICk7XG4gICAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuR3JlZWR5VmVyYm9zZSAmJiBzY2VuZXJ5TG9nLnB1c2goKTtcblxuICAgICAgLy8gZGVjaWRpbmcgd2hhdCBuZXcgYmxvY2sgc2hvdWxkIGJlIHVzZWQgZm9yIHRoZSBleHRlcm5hbCBncm91cCBvZiBkcmF3YWJsZXMgYWZ0ZXIgb3VyIGNoYW5nZSBpbnRlcnZhbFxuICAgICAgbGV0IG5ld0FmdGVyQmxvY2s7XG4gICAgICAvLyBpZiB3ZSBoYXZlIG5vIGdhcHMvYm91bmRhcmllcywgd2Ugc2hvdWxkIG5vdCBoYXZlIHR3byBkaWZmZXJlbnQgYmxvY2tzXG4gICAgICBpZiAoIG9wZW5CZWZvcmUgJiYgb3BlbkFmdGVyICkge1xuICAgICAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuR3JlZWR5VmVyYm9zZSAmJiBzY2VuZXJ5TG9nLkdyZWVkeVZlcmJvc2UoIGBnbHVlIHVzaW5nICR7YmVmb3JlQmxvY2sudG9TdHJpbmcoKX1gICk7XG4gICAgICAgIG5ld0FmdGVyQmxvY2sgPSBiZWZvcmVCbG9jaztcbiAgICAgIH1cbiAgICAgIGVsc2Uge1xuICAgICAgICAvLyBpZiB3ZSBjYW4ndCB1c2Ugb3VyIGFmdGVyQmxvY2ssIHNpbmNlIGl0IHdhcyB1c2VkIGJlZm9yZSwgb3Igd291bGRuJ3QgY3JlYXRlIGEgc3BsaXRcbiAgICAgICAgaWYgKCB0aGlzLmJsb2NrV2FzQWRkZWQgfHwgYmVmb3JlQmxvY2sgPT09IGFmdGVyQmxvY2sgKSB7XG4gICAgICAgICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLkdyZWVkeVZlcmJvc2UgJiYgc2NlbmVyeUxvZy5HcmVlZHlWZXJib3NlKCAnc3BsaXQgd2l0aCBmcmVzaCBibG9jaycgKTtcbiAgICAgICAgICAvLyBmb3Igc2ltcGxpY2l0eSByaWdodCBub3csIHdlIGFsd2F5cyBjcmVhdGUgYSBmcmVzaCBibG9jayAodG8gYXZvaWQgbWVzc2luZyB1cCByZXVzZWQgYmxvY2tzKSBhZnRlciwgYW5kXG4gICAgICAgICAgLy8gYWx3YXlzIGNoYW5nZSBldmVyeXRoaW5nIGFmdGVyIChpbnN0ZWFkIG9mIGJlZm9yZSksIHNvIHdlIGRvbid0IGhhdmUgdG8ganVtcCBhY3Jvc3MgbXVsdGlwbGUgcHJldmlvdXNcbiAgICAgICAgICAvLyBjaGFuZ2UgaW50ZXJ2YWxzXG4gICAgICAgICAgbmV3QWZ0ZXJCbG9jayA9IHRoaXMuY3JlYXRlQmxvY2soIGludGVydmFsLmRyYXdhYmxlQWZ0ZXIucmVuZGVyZXIsIGludGVydmFsLmRyYXdhYmxlQWZ0ZXIgKTtcbiAgICAgICAgICB0aGlzLmJsb2NrT3JkZXJDaGFuZ2VkID0gdHJ1ZTsgLy8gbmVlZHMgdG8gYmUgZG9uZSBvbiBibG9jayBjcmVhdGlvblxuICAgICAgICB9XG4gICAgICAgIC8vIG90aGVyd2lzZSB3ZSBjYW4gdXNlIG91ciBhZnRlciBibG9ja1xuICAgICAgICBlbHNlIHtcbiAgICAgICAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuR3JlZWR5VmVyYm9zZSAmJiBzY2VuZXJ5TG9nLkdyZWVkeVZlcmJvc2UoIGBzcGxpdCB3aXRoIHNhbWUgYWZ0ZXJCbG9jayAke2FmdGVyQmxvY2sudG9TdHJpbmcoKX1gICk7XG4gICAgICAgICAgbmV3QWZ0ZXJCbG9jayA9IGFmdGVyQmxvY2s7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLy8gSWYgd2UgZGlkbid0IGNoYW5nZSBvdXIgYmxvY2ssIG1hcmsgaXQgYXMgYWRkZWQgc28gd2UgZG9uJ3QgcmVtb3ZlIGl0LlxuICAgICAgaWYgKCBhZnRlckJsb2NrID09PSBuZXdBZnRlckJsb2NrICkge1xuICAgICAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuR3JlZWR5VmVyYm9zZSAmJiBzY2VuZXJ5TG9nLkdyZWVkeVZlcmJvc2UoICdubyBleHRlcm5hbHMgY2hhbmdlIGhlcmUgKGJsb2NrV2FzQWRkZWQgPT4gdHJ1ZSknICk7XG4gICAgICAgIHRoaXMuYmxvY2tXYXNBZGRlZCA9IHRydWU7XG4gICAgICB9XG4gICAgICAgIC8vIE90aGVyd2lzZSBpZiB3ZSBjaGFuZ2VkIHRoZSBibG9jaywgbW92ZSBvdmVyIG9ubHkgdGhlIGV4dGVybmFsIGRyYXdhYmxlcyBiZXR3ZWVuIHRoaXMgaW50ZXJ2YWwgYW5kIHRoZSBuZXh0XG4gICAgICAvLyBpbnRlcnZhbC5cbiAgICAgIGVsc2Uge1xuICAgICAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuR3JlZWR5VmVyYm9zZSAmJiBzY2VuZXJ5TG9nLkdyZWVkeVZlcmJvc2UoICdtb3ZpbmcgZXh0ZXJuYWxzJyApO1xuICAgICAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuR3JlZWR5VmVyYm9zZSAmJiBzY2VuZXJ5TG9nLnB1c2goKTtcbiAgICAgICAgdGhpcy5jaGFuZ2VFeHRlcm5hbHMoIGludGVydmFsLCBuZXdBZnRlckJsb2NrICk7XG4gICAgICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5HcmVlZHlWZXJib3NlICYmIHNjZW5lcnlMb2cucG9wKCk7XG4gICAgICB9XG5cbiAgICAgIC8vIElmIHRoZSBuZXh0IGludGVydmFsJ3Mgb2xkIGFmdGVyQmxvY2sgaXNuJ3QgdGhlIHNhbWUgYXMgb3VyIG9sZCBhZnRlckJsb2NrLCB3ZSBuZWVkIHRvIG1ha2Ugb3VyIGRlY2lzaW9uXG4gICAgICAvLyBhYm91dCB3aGV0aGVyIHRvIG1hcmsgb3VyIG9sZCBhZnRlckJsb2NrIGFzIHJldXNhYmxlLCBvciB3aGV0aGVyIGl0IHdhcyB1c2VkLlxuICAgICAgaWYgKCBuZXh0QWZ0ZXJCbG9jayAhPT0gYWZ0ZXJCbG9jayApIHtcbiAgICAgICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLkdyZWVkeVZlcmJvc2UgJiYgc2NlbmVyeUxvZy5HcmVlZHlWZXJib3NlKCAnZW5kIG9mIGFmdGVyQmxvY2sgc3RyZXRjaCcgKTtcblxuICAgICAgICAvLyBJZiBvdXIgYmxvY2sgd2Fzbid0IGFkZGVkIHlldCwgaXQgd291bGRuJ3QgZXZlciBiZSBhZGRlZCBsYXRlciBuYXR1cmFsbHkgKHNvIHdlIG1hcmsgaXQgYXMgcmV1c2FibGUpLlxuICAgICAgICBpZiAoICF0aGlzLmJsb2NrV2FzQWRkZWQgKSB7XG4gICAgICAgICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLkdyZWVkeVZlcmJvc2UgJiYgc2NlbmVyeUxvZy5HcmVlZHlWZXJib3NlKCBgdW51c2luZyAke2FmdGVyQmxvY2sudG9TdHJpbmcoKX1gICk7XG4gICAgICAgICAgdGhpcy51bnVzZUJsb2NrKCBhZnRlckJsb2NrICk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5ibG9ja1dhc0FkZGVkID0gZmFsc2U7XG4gICAgICB9XG5cbiAgICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5HcmVlZHlWZXJib3NlICYmIHNjZW5lcnlMb2cucG9wKCk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIE1hcmtzIGFsbCAnZXh0ZXJuYWwnIGRyYXdhYmxlcyBmcm9tIHRoZSBlbmQgKGRyYXdhYmxlQWZ0ZXIpIG9mIHRoZSB7Q2hhbmdlSW50ZXJ2YWx9IGludGVydmFsIHRvIGVpdGhlciB0aGUgZW5kXG4gICAqIG9mIHRoZWlyIG9sZCBibG9jayBvciB0aGUgZHJhd2FibGVBZnRlciBvZiB0aGUgbmV4dCBpbnRlcnZhbCAod2hpY2hldmVyIGlzIHNvb25lcikgYXMgYmVpbmcgbmVlZGVkIHRvIGJlIG1vdmVkIHRvXG4gICAqIG91ciB7QmxvY2t9IG5ld0Jsb2NrLiBUaGUgbmV4dCBwcm9jZXNzSW50ZXJ2YWwgd2lsbCBib3RoIGhhbmRsZSB0aGUgZHJhd2FibGVzIGluc2lkZSB0aGF0IG5leHQgaW50ZXJ2YWwsIGFuZFxuICAgKiB3aWxsIGJlIHJlc3BvbnNpYmxlIGZvciB0aGUgJ2V4dGVybmFsJyBkcmF3YWJsZXMgYWZ0ZXIgdGhhdC5cbiAgICogQHByaXZhdGVcbiAgICpcbiAgICogQHBhcmFtIHtDaGFuZ2VJbnRlcnZhbH0gaW50ZXJ2YWxcbiAgICogQHBhcmFtIHtCbG9ja30gbmV3QmxvY2tcbiAgICovXG4gIGNoYW5nZUV4dGVybmFscyggaW50ZXJ2YWwsIG5ld0Jsb2NrICkge1xuICAgIGNvbnN0IGxhc3RFeHRlcm5hbERyYXdhYmxlID0gZ2V0TGFzdENvbXBhdGlibGVFeHRlcm5hbERyYXdhYmxlKCBpbnRlcnZhbCApO1xuICAgIHRoaXMubm90ZVBlbmRpbmdNb3ZlcyggbmV3QmxvY2ssIGludGVydmFsLmRyYXdhYmxlQWZ0ZXIsIGxhc3RFeHRlcm5hbERyYXdhYmxlICk7XG5cbiAgICAvLyBJZiB3ZSBkaWRuJ3QgbWFrZSBpdCBhbGwgdGhlIHdheSB0byB0aGUgbmV4dCBjaGFuZ2UgaW50ZXJ2YWwncyBkcmF3YWJsZUJlZm9yZSAodGhlcmUgd2FzIGFub3RoZXIgYmxvY2tcbiAgICAvLyBzdGFydGluZyBiZWZvcmUgdGhlIG5leHQgaW50ZXJ2YWwpLCB3ZSBuZWVkIHRvIGxpbmsgb3VyIG5ldyBibG9jayB0byB0aGF0IG5leHQgYmxvY2suXG4gICAgaWYgKCAhaW50ZXJ2YWwubmV4dENoYW5nZUludGVydmFsIHx8IGludGVydmFsLm5leHRDaGFuZ2VJbnRlcnZhbC5kcmF3YWJsZUJlZm9yZSAhPT0gbGFzdEV4dGVybmFsRHJhd2FibGUgKSB7XG4gICAgICB0aGlzLmxpbmtBZnRlckRyYXdhYmxlKCBsYXN0RXh0ZXJuYWxEcmF3YWJsZSApO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBHaXZlbiBhIHtEcmF3YWJsZX0gZmlyc3REcmF3YWJsZSBhbmQge0RyYXdhYmxlfSBsYXN0RHJhd2FibGUsIHdlIG1hcmsgYWxsIGRyYXdhYmxlcyBpbi1iZXR3ZWVuIChpbmNsdXNpdmVseSkgYXNcbiAgICogbmVlZGluZyB0byBiZSBtb3ZlZCB0byBvdXIge0Jsb2NrfSBuZXdCbG9jay4gVGhpcyBzaG91bGQgb25seSBiZSBjYWxsZWQgb24gZXh0ZXJuYWwgZHJhd2FibGVzLCBhbmQgc2hvdWxkIG9ubHlcbiAgICogb2NjdXIgYXMgbmVlZGVkIHdpdGggZ2x1ZS91bmdsdWUgY2FzZXMgaW4gdGhlIHN0aXRjaC5cbiAgICogQHByaXZhdGVcbiAgICpcbiAgICogQHBhcmFtIHtCbG9ja30gbmV3QmxvY2tcbiAgICogQHBhcmFtIHtEcmF3YWJsZX0gZmlyc3REcmF3YWJsZVxuICAgKiBAcGFyYW0ge0RyYXdhYmxlfSBsYXN0RHJhd2FibGVcbiAgICovXG4gIG5vdGVQZW5kaW5nTW92ZXMoIG5ld0Jsb2NrLCBmaXJzdERyYXdhYmxlLCBsYXN0RHJhd2FibGUgKSB7XG4gICAgZm9yICggbGV0IGRyYXdhYmxlID0gZmlyc3REcmF3YWJsZTsgOyBkcmF3YWJsZSA9IGRyYXdhYmxlLm5leHREcmF3YWJsZSApIHtcbiAgICAgIGFzc2VydCAmJiBhc3NlcnQoICFkcmF3YWJsZS5wZW5kaW5nQWRkaXRpb24gJiYgIWRyYXdhYmxlLnBlbmRpbmdSZW1vdmFsLFxuICAgICAgICAnTW92ZWQgZHJhd2FibGVzIHNob3VsZCBiZSB0aG91Z2h0IG9mIGFzIHVuY2hhbmdlZCwgYW5kIHRodXMgaGF2ZSBub3RoaW5nIHBlbmRpbmcgeWV0JyApO1xuXG4gICAgICB0aGlzLm5vdGVQZW5kaW5nTW92ZSggZHJhd2FibGUsIG5ld0Jsb2NrICk7XG4gICAgICBpZiAoIGRyYXdhYmxlID09PSBsYXN0RHJhd2FibGUgKSB7IGJyZWFrOyB9XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIElmIHRoZXJlIGlzIG5vIGN1cnJlbnRCbG9jaywgd2UgY3JlYXRlIG9uZSB0byBtYXRjaC4gT3RoZXJ3aXNlIGlmIHRoZSBjdXJyZW50QmxvY2sgaXMgbWFya2VkIGFzICd1bnVzZWQnIChpLmUuXG4gICAqIGl0IGlzIGluIHRoZSByZXVzYWJsZUJsb2NrcyBhcnJheSksIHdlIG1hcmsgaXQgYXMgdXNlZCBzbyBpdCB3b24ndCBtZSBtYXRjaGVkIGVsc2V3aGVyZS5cbiAgICogQHByaXZhdGVcbiAgICpcbiAgICogQHBhcmFtIHtCbG9ja30gY3VycmVudEJsb2NrXG4gICAqIEBwYXJhbSB7RHJhd2FibGV9IHNvbWVJbmNsdWRlZERyYXdhYmxlXG4gICAqIEByZXR1cm5zIHtCbG9ja31cbiAgICovXG4gIGVuc3VyZVVzZWRCbG9jayggY3VycmVudEJsb2NrLCBzb21lSW5jbHVkZWREcmF3YWJsZSApIHtcbiAgICAvLyBpZiB3ZSBoYXZlIGEgbWF0Y2hlZCBibG9jayAob3Igc3RhcnRlZCB3aXRoIG9uZSlcbiAgICBpZiAoIGN1cnJlbnRCbG9jayApIHtcbiAgICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5HcmVlZHlWZXJib3NlICYmIHNjZW5lcnlMb2cuR3JlZWR5VmVyYm9zZSggYHVzaW5nIGV4aXN0aW5nIGJsb2NrOiAke2N1cnJlbnRCbG9jay50b1N0cmluZygpfWAgKTtcbiAgICAgIC8vIHNpbmNlIG91ciBjdXJyZW50QmxvY2sgbWF5IGJlIGZyb20gcmV1c2FibGVCbG9ja3MsIHdlIHdpbGwgbmVlZCB0byBtYXJrIGl0IGFzIHVzZWQgbm93LlxuICAgICAgaWYgKCAhY3VycmVudEJsb2NrLnVzZWQgKSB7XG4gICAgICAgIHRoaXMudXNlQmxvY2soIGN1cnJlbnRCbG9jayApO1xuICAgICAgfVxuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIC8vIG5lZWQgdG8gY3JlYXRlIG9uZVxuICAgICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLkdyZWVkeVZlcmJvc2UgJiYgc2NlbmVyeUxvZy5HcmVlZHlWZXJib3NlKCAnc2VhcmNoaW5nIGZvciBibG9jaycgKTtcbiAgICAgIGN1cnJlbnRCbG9jayA9IHRoaXMuZ2V0QmxvY2tGb3JSZW5kZXJlciggc29tZUluY2x1ZGVkRHJhd2FibGUucmVuZGVyZXIsIHNvbWVJbmNsdWRlZERyYXdhYmxlICk7XG4gICAgfVxuICAgIHJldHVybiBjdXJyZW50QmxvY2s7XG4gIH1cblxuICAvKipcbiAgICogQXR0ZW1wcyB0byBmaW5kIGFuIHVudXNlZCBibG9jayB3aXRoIHRoZSBzYW1lIHJlbmRlcmVyIGlmIHBvc3NpYmxlLCBvdGhlcndpc2UgY3JlYXRlcyBhXG4gICAqIGNvbXBhdGlibGUgYmxvY2suXG4gICAqIEBwcml2YXRlXG4gICAqXG4gICAqIE5PVEU6IHRoaXMgZG9lc24ndCBoYW5kbGUgaG9va2luZyB1cCB0aGUgYmxvY2sgbGlua2VkIGxpc3RcbiAgICpcbiAgICogQHBhcmFtIHtudW1iZXJ9IHJlbmRlcmVyXG4gICAqIEBwYXJhbSB7RHJhd2FibGV9IGRyYXdhYmxlXG4gICAqIEByZXR1cm5zIHtCbG9ja31cbiAgICovXG4gIGdldEJsb2NrRm9yUmVuZGVyZXIoIHJlbmRlcmVyLCBkcmF3YWJsZSApIHtcbiAgICBsZXQgYmxvY2s7XG5cbiAgICAvLyBJZiBpdCdzIG5vdCBhIERPTSBibG9jaywgc2NhbiBvdXIgcmV1c2FibGUgYmxvY2tzIGZvciBvbmUgd2l0aCB0aGUgc2FtZSByZW5kZXJlci5cbiAgICAvLyBJZiBpdCdzIERPTSwgaXQgc2hvdWxkIGJlIHByb2Nlc3NlZCBjb3JyZWN0bHkgaW4gcmV1c2FibGVCbG9ja3MsIGFuZCB3aWxsIG5ldmVyIHJlYWNoIHRoaXMgcG9pbnQuXG4gICAgaWYgKCAhUmVuZGVyZXIuaXNET00oIHJlbmRlcmVyICkgKSB7XG4gICAgICAvLyBiYWNrd2FyZHMgc2NhbiwgaG9wZWZ1bGx5IGl0J3MgZmFzdGVyP1xuICAgICAgZm9yICggbGV0IGkgPSB0aGlzLnJldXNhYmxlQmxvY2tzLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tICkge1xuICAgICAgICBjb25zdCB0bXBCbG9jayA9IHRoaXMucmV1c2FibGVCbG9ja3NbIGkgXTtcbiAgICAgICAgYXNzZXJ0ICYmIGFzc2VydCggIXRtcEJsb2NrLnVzZWQgKTtcbiAgICAgICAgaWYgKCB0bXBCbG9jay5yZW5kZXJlciA9PT0gcmVuZGVyZXIgKSB7XG4gICAgICAgICAgdGhpcy51c2VCbG9ja0F0SW5kZXgoIHRtcEJsb2NrLCBpICk7XG4gICAgICAgICAgYmxvY2sgPSB0bXBCbG9jaztcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIGlmICggIWJsb2NrICkge1xuICAgICAgLy8gRGlkbid0IGZpbmQgaXQgaW4gb3VyIHJldXNhYmxlIGJsb2NrcywgY3JlYXRlIGEgZnJlc2ggb25lIGZyb20gc2NyYXRjaFxuICAgICAgYmxvY2sgPSB0aGlzLmNyZWF0ZUJsb2NrKCByZW5kZXJlciwgZHJhd2FibGUgKTtcbiAgICB9XG5cbiAgICB0aGlzLmJsb2NrT3JkZXJDaGFuZ2VkID0gdHJ1ZTsgLy8gd2UgY3JlYXRlZCBhIG5ldyBibG9jaywgdGhpcyB3aWxsIGFsd2F5cyBoYXBwZW5cblxuICAgIHJldHVybiBibG9jaztcbiAgfVxuXG4gIC8qKlxuICAgKiBNYXJrcyBhIGJsb2NrIGFzIHVudXNlZCwgbW92aW5nIGl0IHRvIHRoZSByZXVzYWJsZUJsb2NrcyBhcnJheS5cbiAgICogQHByaXZhdGVcbiAgICpcbiAgICogQHBhcmFtIHtCbG9ja30gYmxvY2tcbiAgICovXG4gIHVudXNlQmxvY2soIGJsb2NrICkge1xuICAgIGlmICggYmxvY2sudXNlZCApIHtcbiAgICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5HcmVlZHlWZXJib3NlICYmIHNjZW5lcnlMb2cuR3JlZWR5VmVyYm9zZSggYHVudXNpbmcgYmxvY2s6ICR7YmxvY2sudG9TdHJpbmcoKX1gICk7XG4gICAgICBibG9jay51c2VkID0gZmFsc2U7IC8vIG1hcmsgaXQgYXMgdW51c2VkIHVudGlsIHdlIHB1bGwgaXQgb3V0IChzbyB3ZSBjYW4gcmV1c2UsIG9yIHF1aWNrbHkgaWRlbnRpZnkpXG4gICAgICB0aGlzLnJldXNhYmxlQmxvY2tzLnB1c2goIGJsb2NrICk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLkdyZWVkeVZlcmJvc2UgJiYgc2NlbmVyeUxvZy5HcmVlZHlWZXJib3NlKCBgbm90IHVzaW5nIGFscmVhZHktdW51c2VkIGJsb2NrOiAke2Jsb2NrLnRvU3RyaW5nKCl9YCApO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBSZW1vdmVzIGEgYmxvY2sgZnJvbSB0aGUgbGlzdCBvZiByZXVzZWQgYmxvY2tzIChkb25lIGR1cmluZyBtYXRjaGluZylcbiAgICogQHByaXZhdGVcbiAgICpcbiAgICogQHBhcmFtIHtCbG9ja30gYmxvY2tcbiAgICovXG4gIHVzZUJsb2NrKCBibG9jayApIHtcbiAgICB0aGlzLnVzZUJsb2NrQXRJbmRleCggYmxvY2ssIF8uaW5kZXhPZiggdGhpcy5yZXVzYWJsZUJsb2NrcywgYmxvY2sgKSApO1xuICB9XG5cbiAgLyoqXG4gICAqIEBwcml2YXRlXG4gICAqXG4gICAqIEBwYXJhbSB7QmxvY2t9IGJsb2NrXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBpbmRleFxuICAgKi9cbiAgdXNlQmxvY2tBdEluZGV4KCBibG9jaywgaW5kZXggKSB7XG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLkdyZWVkeVZlcmJvc2UgJiYgc2NlbmVyeUxvZy5HcmVlZHlWZXJib3NlKCBgdXNpbmcgcmV1c2FibGUgYmxvY2s6ICR7YmxvY2sudG9TdHJpbmcoKX0gd2l0aCByZW5kZXJlcjogJHtibG9jay5yZW5kZXJlcn1gICk7XG5cbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBpbmRleCA+PSAwICYmIHRoaXMucmV1c2FibGVCbG9ja3NbIGluZGV4IF0gPT09IGJsb2NrLCBgYmFkIGluZGV4IGZvciB1c2VCbG9ja0F0SW5kZXg6ICR7aW5kZXh9YCApO1xuXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggIWJsb2NrLnVzZWQsICdTaG91bGQgYmUgY2FsbGVkIG9uIGFuIHVudXNlZCAocmV1c2FibGUpIGJsb2NrJyApO1xuXG4gICAgLy8gcmVtb3ZlIGl0XG4gICAgdGhpcy5yZXVzYWJsZUJsb2Nrcy5zcGxpY2UoIGluZGV4LCAxICk7XG5cbiAgICAvLyBtYXJrIGl0IGFzIHVzZWRcbiAgICBibG9jay51c2VkID0gdHJ1ZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZW1vdmVzIGFsbCBvZiBvdXIgdW51c2VkIGJsb2NrcyBmcm9tIG91ciBkb21FbGVtZW50LCBhbmQgbWFya3MgdGhlbSBmb3IgZGlzcG9zYWwuXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICByZW1vdmVVbnVzZWRCbG9ja3MoKSB7XG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLkdyZWVkeVN0aXRjaGVyICYmIHRoaXMucmV1c2FibGVCbG9ja3MubGVuZ3RoICYmIHNjZW5lcnlMb2cuR3JlZWR5U3RpdGNoZXIoICdyZW1vdmVVbnVzZWRCbG9ja3MnICk7XG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLkdyZWVkeVN0aXRjaGVyICYmIHNjZW5lcnlMb2cucHVzaCgpO1xuICAgIHdoaWxlICggdGhpcy5yZXVzYWJsZUJsb2Nrcy5sZW5ndGggKSB7XG4gICAgICBjb25zdCBibG9jayA9IHRoaXMucmV1c2FibGVCbG9ja3MucG9wKCk7XG4gICAgICB0aGlzLm1hcmtCbG9ja0ZvckRpc3Bvc2FsKCBibG9jayApO1xuICAgICAgdGhpcy5ibG9ja09yZGVyQ2hhbmdlZCA9IHRydWU7XG4gICAgfVxuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5HcmVlZHlTdGl0Y2hlciAmJiBzY2VuZXJ5TG9nLnBvcCgpO1xuICB9XG5cbiAgLyoqXG4gICAqIExpbmtzIGJsb2NrcyBiZWZvcmUgYSBkcmF3YWJsZSAod2hldGhlciBpdCBpcyB0aGUgZmlyc3QgZHJhd2FibGUgb3Igbm90KVxuICAgKiBAcHJpdmF0ZVxuICAgKlxuICAgKiBAcGFyYW0ge0RyYXdhYmxlfSBkcmF3YWJsZVxuICAgKi9cbiAgbGlua0JlZm9yZURyYXdhYmxlKCBkcmF3YWJsZSApIHtcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuR3JlZWR5VmVyYm9zZSAmJiBzY2VuZXJ5TG9nLkdyZWVkeVZlcmJvc2UoIGBsaW5rIGJlZm9yZSAke2RyYXdhYmxlLnRvU3RyaW5nKCl9YCApO1xuICAgIGNvbnN0IGJlZm9yZURyYXdhYmxlID0gZHJhd2FibGUucHJldmlvdXNEcmF3YWJsZTtcbiAgICB0aGlzLmxpbmtCbG9ja3MoIGJlZm9yZURyYXdhYmxlID8gYmVmb3JlRHJhd2FibGUucGVuZGluZ1BhcmVudERyYXdhYmxlIDogbnVsbCxcbiAgICAgIGRyYXdhYmxlLnBlbmRpbmdQYXJlbnREcmF3YWJsZSxcbiAgICAgIGJlZm9yZURyYXdhYmxlLFxuICAgICAgZHJhd2FibGUgKTtcbiAgfVxuXG5cbiAgLyoqXG4gICAqIGxpbmtzIGJsb2NrcyBhZnRlciBhIGRyYXdhYmxlICh3aGV0aGVyIGl0IGlzIHRoZSBsYXN0IGRyYXdhYmxlIG9yIG5vdClcbiAgICogQHByaXZhdGVcbiAgICpcbiAgICogQHBhcmFtIHtEcmF3YWJsZX0gZHJhd2FibGVcbiAgICovXG4gIGxpbmtBZnRlckRyYXdhYmxlKCBkcmF3YWJsZSApIHtcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuR3JlZWR5VmVyYm9zZSAmJiBzY2VuZXJ5TG9nLkdyZWVkeVZlcmJvc2UoIGBsaW5rIGFmdGVyICR7ZHJhd2FibGUudG9TdHJpbmcoKX1gICk7XG4gICAgY29uc3QgYWZ0ZXJEcmF3YWJsZSA9IGRyYXdhYmxlLm5leHREcmF3YWJsZTtcbiAgICB0aGlzLmxpbmtCbG9ja3MoIGRyYXdhYmxlLnBlbmRpbmdQYXJlbnREcmF3YWJsZSxcbiAgICAgIGFmdGVyRHJhd2FibGUgPyBhZnRlckRyYXdhYmxlLnBlbmRpbmdQYXJlbnREcmF3YWJsZSA6IG51bGwsXG4gICAgICBkcmF3YWJsZSxcbiAgICAgIGFmdGVyRHJhd2FibGUgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDYWxsZWQgdG8gbWFyayBhIGJvdW5kYXJ5IGJldHdlZW4gYmxvY2tzLCBvciBhdCB0aGUgZW5kIG9mIG91ciBsaXN0IG9mIGJsb2NrcyAob25lIGJsb2NrL2RyYXdhYmxlIHBhaXIgYmVpbmdcbiAgICogbnVsbCBub3RlcyB0aGF0IGl0IGlzIHRoZSBzdGFydC9lbmQsIGFuZCB0aGVyZSBpcyBubyBwcmV2aW91cy9uZXh0IGJsb2NrKS5cbiAgICogVGhpcyB1cGRhdGVzIHRoZSBibG9jayBsaW5rZWQtbGlzdCBhcyBuZWNlc3NhcnkgKG5vdGluZyBjaGFuZ2VzIHdoZW4gdGhleSBvY2N1cikgc28gdGhhdCB3ZSBjYW4gcmVidWlsZCBhbiBhcnJheVxuICAgKiBhdCB0aGUgZW5kIG9mIHRoZSBzdGl0Y2gsIGF2b2lkaW5nIE8obl4yKSBpc3N1ZXMgaWYgd2Ugd2VyZSB0byBkbyBibG9jay1hcnJheS1pbmRleCBsb29rdXBzIGR1cmluZyBsaW5raW5nXG4gICAqIG9wZXJhdGlvbnMgKHRoaXMgcmVzdWx0cyBpbiBsaW5lYXIgdGltZSBmb3IgYmxvY2tzKS5cbiAgICogSXQgYWxzbyBtYXJrcyBibG9jayBib3VuZGFyaWVzIGFzIGRpcnR5IHdoZW4gbmVjZXNzYXJ5LCBzbyB0aGF0IHdlIGNhbiBtYWtlIG9uZSBwYXNzIHRocm91Z2ggd2l0aFxuICAgKiB1cGRhdGVCbG9ja0ludGVydmFscygpIHRoYXQgdXBkYXRlcyBhbGwgb2YgdGhlIGJsb2NrJ3MgYm91bmRhcmllcyAoYXZvaWRpbmcgbW9yZSB0aGFuIG9uZSB1cGRhdGUgcGVyIGJsb2NrIHBlclxuICAgKiBmcmFtZSkuXG4gICAqIEBwcml2YXRlXG4gICAqXG4gICAqIEBwYXJhbSB7QmxvY2t8bnVsbH0gYmVmb3JlQmxvY2tcbiAgICogQHBhcmFtIHtCbG9ja3xudWxsfSBhZnRlckJsb2NrXG4gICAqIEBwYXJhbSB7RHJhd2FibGV8bnVsbH0gYmVmb3JlRHJhd2FibGVcbiAgICogQHBhcmFtIHtEcmF3YWJsZXxudWxsfSBhZnRlckRyYXdhYmxlXG4gICAqL1xuICBsaW5rQmxvY2tzKCBiZWZvcmVCbG9jaywgYWZ0ZXJCbG9jaywgYmVmb3JlRHJhd2FibGUsIGFmdGVyRHJhd2FibGUgKSB7XG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLkdyZWVkeVN0aXRjaGVyICYmIHNjZW5lcnlMb2cuR3JlZWR5U3RpdGNoZXIoIGBsaW5raW5nIGJsb2NrczogJHtcbiAgICAgIGJlZm9yZUJsb2NrID8gKCBgJHtiZWZvcmVCbG9jay50b1N0cmluZygpfSAoJHtiZWZvcmVEcmF3YWJsZS50b1N0cmluZygpfSlgICkgOiAnbnVsbCdcbiAgICB9IHRvICR7XG4gICAgICBhZnRlckJsb2NrID8gKCBgJHthZnRlckJsb2NrLnRvU3RyaW5nKCl9ICgke2FmdGVyRHJhd2FibGUudG9TdHJpbmcoKX0pYCApIDogJ251bGwnfWAgKTtcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuR3JlZWR5U3RpdGNoZXIgJiYgc2NlbmVyeUxvZy5wdXNoKCk7XG5cbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCAoIGJlZm9yZUJsb2NrID09PSBudWxsICYmIGJlZm9yZURyYXdhYmxlID09PSBudWxsICkgfHxcbiAgICAgICAgICAgICAgICAgICAgICAoIGJlZm9yZUJsb2NrIGluc3RhbmNlb2YgQmxvY2sgJiYgYmVmb3JlRHJhd2FibGUgaW5zdGFuY2VvZiBEcmF3YWJsZSApICk7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggKCBhZnRlckJsb2NrID09PSBudWxsICYmIGFmdGVyRHJhd2FibGUgPT09IG51bGwgKSB8fFxuICAgICAgICAgICAgICAgICAgICAgICggYWZ0ZXJCbG9jayBpbnN0YW5jZW9mIEJsb2NrICYmIGFmdGVyRHJhd2FibGUgaW5zdGFuY2VvZiBEcmF3YWJsZSApICk7XG5cbiAgICBpZiAoIGJlZm9yZUJsb2NrICkge1xuICAgICAgaWYgKCBiZWZvcmVCbG9jay5uZXh0QmxvY2sgIT09IGFmdGVyQmxvY2sgKSB7XG4gICAgICAgIHRoaXMuYmxvY2tPcmRlckNoYW5nZWQgPSB0cnVlO1xuXG4gICAgICAgIC8vIGRpc2Nvbm5lY3QgZnJvbSB0aGUgcHJldmlvdXNseS1jb25uZWN0ZWQgYmxvY2sgKGlmIGFueSlcbiAgICAgICAgaWYgKCBiZWZvcmVCbG9jay5uZXh0QmxvY2sgKSB7XG4gICAgICAgICAgYmVmb3JlQmxvY2submV4dEJsb2NrLnByZXZpb3VzQmxvY2sgPSBudWxsO1xuICAgICAgICB9XG5cbiAgICAgICAgYmVmb3JlQmxvY2submV4dEJsb2NrID0gYWZ0ZXJCbG9jaztcbiAgICAgIH1cbiAgICAgIHRoaXMubWFya0FmdGVyQmxvY2soIGJlZm9yZUJsb2NrLCBiZWZvcmVEcmF3YWJsZSApO1xuICAgIH1cbiAgICBpZiAoIGFmdGVyQmxvY2sgKSB7XG4gICAgICBpZiAoIGFmdGVyQmxvY2sucHJldmlvdXNCbG9jayAhPT0gYmVmb3JlQmxvY2sgKSB7XG4gICAgICAgIHRoaXMuYmxvY2tPcmRlckNoYW5nZWQgPSB0cnVlO1xuXG4gICAgICAgIC8vIGRpc2Nvbm5lY3QgZnJvbSB0aGUgcHJldmlvdXNseS1jb25uZWN0ZWQgYmxvY2sgKGlmIGFueSlcbiAgICAgICAgaWYgKCBhZnRlckJsb2NrLnByZXZpb3VzQmxvY2sgKSB7XG4gICAgICAgICAgYWZ0ZXJCbG9jay5wcmV2aW91c0Jsb2NrLm5leHRCbG9jayA9IG51bGw7XG4gICAgICAgIH1cblxuICAgICAgICBhZnRlckJsb2NrLnByZXZpb3VzQmxvY2sgPSBiZWZvcmVCbG9jaztcbiAgICAgIH1cbiAgICAgIHRoaXMubWFya0JlZm9yZUJsb2NrKCBhZnRlckJsb2NrLCBhZnRlckRyYXdhYmxlICk7XG4gICAgfVxuXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLkdyZWVkeVN0aXRjaGVyICYmIHNjZW5lcnlMb2cucG9wKCk7XG4gIH1cblxuICAvKipcbiAgICogUmVidWlsZHMgdGhlIGJhY2tib25lJ3MgYmxvY2sgYXJyYXkgZnJvbSBvdXIgbGlua2VkLWxpc3QgZGF0YS5cbiAgICogQHByaXZhdGVcbiAgICpcbiAgICogQHBhcmFtIHtCYWNrYm9uZURyYXdhYmxlfSBiYWNrYm9uZVxuICAgKiBAcGFyYW0ge0Jsb2NrfG51bGx9IGZpcnN0QmxvY2tcbiAgICogQHBhcmFtIHtCbG9ja3xudWxsfSBsYXN0QmxvY2tcbiAgICovXG4gIHByb2Nlc3NCbG9ja0xpbmtlZExpc3QoIGJhY2tib25lLCBmaXJzdEJsb2NrLCBsYXN0QmxvY2sgKSB7XG4gICAgLy8gZm9yIG5vdywganVzdCBjbGVhciBvdXQgdGhlIGFycmF5IGZpcnN0XG4gICAgd2hpbGUgKCBiYWNrYm9uZS5ibG9ja3MubGVuZ3RoICkge1xuICAgICAgYmFja2JvbmUuYmxvY2tzLnBvcCgpO1xuICAgIH1cblxuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5HcmVlZHlTdGl0Y2hlciAmJiBzY2VuZXJ5TG9nLkdyZWVkeVN0aXRjaGVyKCBgcHJvY2Vzc0Jsb2NrTGlua2VkTGlzdDogJHtmaXJzdEJsb2NrLnRvU3RyaW5nKCl9IHRvICR7bGFzdEJsb2NrLnRvU3RyaW5nKCl9YCApO1xuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5HcmVlZHlTdGl0Y2hlciAmJiBzY2VuZXJ5TG9nLnB1c2goKTtcblxuICAgIC8vIGxlYXZlIHRoZSBhcnJheSBhcy1pcyBpZiB0aGVyZSBhcmUgbm8gYmxvY2tzXG4gICAgaWYgKCBmaXJzdEJsb2NrICkge1xuXG4gICAgICAvLyByZXdyaXRlIGl0IHN0YXJ0aW5nIHdpdGggdGhlIGZpcnN0IGJsb2NrXG4gICAgICBmb3IgKCBsZXQgYmxvY2sgPSBmaXJzdEJsb2NrOyA7IGJsb2NrID0gYmxvY2submV4dEJsb2NrICkge1xuICAgICAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuR3JlZWR5U3RpdGNoZXIgJiYgc2NlbmVyeUxvZy5HcmVlZHlTdGl0Y2hlciggYmxvY2sudG9TdHJpbmcoKSApO1xuXG4gICAgICAgIGJhY2tib25lLmJsb2Nrcy5wdXNoKCBibG9jayApO1xuXG4gICAgICAgIGlmICggYmxvY2sgPT09IGxhc3RCbG9jayApIHsgYnJlYWs7IH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuR3JlZWR5U3RpdGNoZXIgJiYgc2NlbmVyeUxvZy5wb3AoKTtcbiAgfVxufVxuXG5zY2VuZXJ5LnJlZ2lzdGVyKCAnR3JlZWR5U3RpdGNoZXInLCBHcmVlZHlTdGl0Y2hlciApO1xuZXhwb3J0IGRlZmF1bHQgR3JlZWR5U3RpdGNoZXI7Il0sIm5hbWVzIjpbImNsZWFuQXJyYXkiLCJCbG9jayIsIkNoYW5nZUludGVydmFsIiwiRHJhd2FibGUiLCJSZW5kZXJlciIsInNjZW5lcnkiLCJTdGl0Y2hlciIsImhhc0dhcEJldHdlZW5EcmF3YWJsZXMiLCJhIiwiYiIsInJlbmRlcmVyIiwiaXNET00iLCJpc09wZW5CZWZvcmUiLCJkcmF3YWJsZSIsInByZXZpb3VzRHJhd2FibGUiLCJpc09wZW5BZnRlciIsIm5leHREcmF3YWJsZSIsImludGVydmFsSGFzTmV3SW50ZXJuYWxEcmF3YWJsZXMiLCJpbnRlcnZhbCIsImZpcnN0U3RpdGNoRHJhd2FibGUiLCJsYXN0U3RpdGNoRHJhd2FibGUiLCJkcmF3YWJsZUJlZm9yZSIsImRyYXdhYmxlQWZ0ZXIiLCJpbnRlcnZhbEhhc09sZEludGVybmFsRHJhd2FibGVzIiwib2xkRmlyc3RTdGl0Y2hEcmF3YWJsZSIsIm9sZExhc3RTdGl0Y2hEcmF3YWJsZSIsIm9sZE5leHREcmF3YWJsZSIsIm9sZFByZXZpb3VzRHJhd2FibGUiLCJpbnRlcnZhbEhhc09sZEludGVybmFsQmxvY2tzIiwiZmlyc3RTdGl0Y2hCbG9jayIsImxhc3RTdGl0Y2hCbG9jayIsImJlZm9yZUJsb2NrIiwicGFyZW50RHJhd2FibGUiLCJhZnRlckJsb2NrIiwibmV4dEJsb2NrIiwicHJldmlvdXNCbG9jayIsImdldExhc3RDb21wYXRpYmxlRXh0ZXJuYWxEcmF3YWJsZSIsImZpcnN0RHJhd2FibGUiLCJjdXRvZmZEcmF3YWJsZSIsIm5leHRDaGFuZ2VJbnRlcnZhbCIsIkdyZWVkeVN0aXRjaGVyIiwic3RpdGNoIiwiYmFja2JvbmUiLCJmaXJzdENoYW5nZUludGVydmFsIiwibGFzdENoYW5nZUludGVydmFsIiwiaW5pdGlhbGl6ZSIsImJsb2NrT3JkZXJDaGFuZ2VkIiwicmV1c2FibGVCbG9ja3MiLCJibG9ja1dhc0FkZGVkIiwicmVjb3JkQmFja2JvbmVCb3VuZGFyaWVzIiwic2NlbmVyeUxvZyIsInB1c2giLCJibG9ja3MiLCJsZW5ndGgiLCJ2ZXJ5Rmlyc3RCbG9jayIsInZlcnlMYXN0QmxvY2siLCJhc3NlcnQiLCJpc0VtcHR5IiwiZmlyc3RSZW1vdmFsIiwibGFzdFJlbW92YWwiLCJyZW1vdmVkRHJhd2FibGUiLCJub3RlUGVuZGluZ1JlbW92YWwiLCJmaXJzdEJsb2NrIiwibGFzdEJsb2NrIiwibWFya2VkQmxvY2siLCJ1bnVzZUJsb2NrIiwicG9wIiwicHJvY2Vzc0ludGVydmFsIiwicmVtb3ZlVW51c2VkQmxvY2tzIiwidXBkYXRlQmxvY2tJbnRlcnZhbHMiLCJ1c2VOb0Jsb2NrcyIsInByb2Nlc3NCbG9ja0xpbmtlZExpc3QiLCJwZW5kaW5nUGFyZW50RHJhd2FibGUiLCJyZWluZGV4IiwiY2xlYW4iLCJHcmVlZHlWZXJib3NlIiwidG9TdHJpbmciLCJpc09wZW4iLCJwcm9jZXNzRWRnZUNhc2VzIiwibGlua0FmdGVyRHJhd2FibGUiLCJsaW5rQmVmb3JlRHJhd2FibGUiLCJzdWJCbG9ja0ZpcnN0RHJhd2FibGUiLCJtYXRjaGVkQmxvY2siLCJpc0ZpcnN0IiwiaXNMYXN0IiwidXNlZCIsInByb2Nlc3NTdWJCbG9jayIsImxhc3REcmF3YWJsZSIsIm9wZW5CZWZvcmUiLCJvcGVuQWZ0ZXIiLCJlbnN1cmVVc2VkQmxvY2siLCJub3RlUGVuZGluZ0FkZGl0aW9uIiwibmV4dEFmdGVyQmxvY2siLCJuZXdBZnRlckJsb2NrIiwiY3JlYXRlQmxvY2siLCJjaGFuZ2VFeHRlcm5hbHMiLCJuZXdCbG9jayIsImxhc3RFeHRlcm5hbERyYXdhYmxlIiwibm90ZVBlbmRpbmdNb3ZlcyIsInBlbmRpbmdBZGRpdGlvbiIsInBlbmRpbmdSZW1vdmFsIiwibm90ZVBlbmRpbmdNb3ZlIiwiY3VycmVudEJsb2NrIiwic29tZUluY2x1ZGVkRHJhd2FibGUiLCJ1c2VCbG9jayIsImdldEJsb2NrRm9yUmVuZGVyZXIiLCJibG9jayIsImkiLCJ0bXBCbG9jayIsInVzZUJsb2NrQXRJbmRleCIsIl8iLCJpbmRleE9mIiwiaW5kZXgiLCJzcGxpY2UiLCJtYXJrQmxvY2tGb3JEaXNwb3NhbCIsImJlZm9yZURyYXdhYmxlIiwibGlua0Jsb2NrcyIsImFmdGVyRHJhd2FibGUiLCJtYXJrQWZ0ZXJCbG9jayIsIm1hcmtCZWZvcmVCbG9jayIsInJlZ2lzdGVyIl0sIm1hcHBpbmdzIjoiQUFBQSxzREFBc0Q7QUFFdEQ7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0NBZ0NDLEdBRUQsT0FBT0EsZ0JBQWdCLHNDQUFzQztBQUM3RCxTQUFTQyxLQUFLLEVBQUVDLGNBQWMsRUFBRUMsUUFBUSxFQUFFQyxRQUFRLEVBQUVDLE9BQU8sRUFBRUMsUUFBUSxRQUFRLGdCQUFnQjtBQUU3Riw2RkFBNkY7QUFDN0YsU0FBU0MsdUJBQXdCQyxDQUFDLEVBQUVDLENBQUM7SUFDbkMsT0FBT0QsRUFBRUUsUUFBUSxLQUFLRCxFQUFFQyxRQUFRLElBQUlOLFNBQVNPLEtBQUssQ0FBRUgsRUFBRUUsUUFBUSxLQUFNTixTQUFTTyxLQUFLLENBQUVGLEVBQUVDLFFBQVE7QUFDaEc7QUFFQSxrSEFBa0g7QUFDbEgsU0FBU0UsYUFBY0MsUUFBUTtJQUM3QixPQUFPQSxTQUFTQyxnQkFBZ0IsS0FBSyxRQUFRLENBQUNQLHVCQUF3Qk0sU0FBU0MsZ0JBQWdCLEVBQUVEO0FBQ25HO0FBRUEsOEdBQThHO0FBQzlHLFNBQVNFLFlBQWFGLFFBQVE7SUFDNUIsT0FBT0EsU0FBU0csWUFBWSxLQUFLLFFBQVEsQ0FBQ1QsdUJBQXdCTSxVQUFVQSxTQUFTRyxZQUFZO0FBQ25HO0FBRUEsZ0VBQWdFO0FBQ2hFLFNBQVNDLGdDQUFpQ0MsUUFBUSxFQUFFQyxtQkFBbUIsRUFBRUMsa0JBQWtCO0lBQ3pGLElBQUtGLFNBQVNHLGNBQWMsRUFBRztRQUM3QixPQUFPSCxTQUFTRyxjQUFjLENBQUNMLFlBQVksS0FBS0UsU0FBU0ksYUFBYSxFQUFFLDBCQUEwQjtJQUNwRyxPQUNLLElBQUtKLFNBQVNJLGFBQWEsRUFBRztRQUNqQyxPQUFPSixTQUFTSSxhQUFhLENBQUNSLGdCQUFnQixLQUFLSSxTQUFTRyxjQUFjLEVBQUUsMkJBQTJCO0lBQ3pHLE9BQ0s7UUFDSCxPQUFPRix3QkFBd0I7SUFDakM7QUFDRjtBQUVBLHdFQUF3RTtBQUN4RSxTQUFTSSxnQ0FBaUNMLFFBQVEsRUFBRU0sc0JBQXNCLEVBQUVDLHFCQUFxQjtJQUMvRixJQUFLUCxTQUFTRyxjQUFjLEVBQUc7UUFDN0IsT0FBT0gsU0FBU0csY0FBYyxDQUFDSyxlQUFlLEtBQUtSLFNBQVNJLGFBQWEsRUFBRSwwQkFBMEI7SUFDdkcsT0FDSyxJQUFLSixTQUFTSSxhQUFhLEVBQUc7UUFDakMsT0FBT0osU0FBU0ksYUFBYSxDQUFDSyxtQkFBbUIsS0FBS1QsU0FBU0csY0FBYyxFQUFFLDJCQUEyQjtJQUM1RyxPQUNLO1FBQ0gsT0FBT0csMkJBQTJCO0lBQ3BDO0FBQ0Y7QUFFQSw2R0FBNkc7QUFDN0csU0FBU0ksNkJBQThCVixRQUFRLEVBQUVXLGdCQUFnQixFQUFFQyxlQUFlO0lBQ2hGLE1BQU1DLGNBQWNiLFNBQVNHLGNBQWMsR0FBR0gsU0FBU0csY0FBYyxDQUFDVyxjQUFjLEdBQUc7SUFDdkYsTUFBTUMsYUFBYWYsU0FBU0ksYUFBYSxHQUFHSixTQUFTSSxhQUFhLENBQUNVLGNBQWMsR0FBRztJQUVwRixJQUFLRCxlQUFlRSxjQUFjRixnQkFBZ0JFLFlBQWE7UUFDN0QsT0FBTztJQUNUO0lBRUEsSUFBS0YsYUFBYztRQUNqQixPQUFPQSxZQUFZRyxTQUFTLEtBQUtELFlBQVksMEJBQTBCO0lBQ3pFLE9BQ0ssSUFBS0EsWUFBYTtRQUNyQixPQUFPQSxXQUFXRSxhQUFhLEtBQUtKLGFBQWEsMkJBQTJCO0lBQzlFLE9BQ0s7UUFDSCxPQUFPRixxQkFBcUI7SUFDOUI7QUFDRjtBQUVBOzs7O0NBSUMsR0FDRCxTQUFTTyxrQ0FBbUNsQixRQUFRO0lBQ2xELE1BQU1tQixnQkFBZ0JuQixTQUFTSSxhQUFhO0lBRTVDLElBQUtlLGVBQWdCO1FBQ25CLE1BQU0zQixXQUFXMkIsY0FBYzNCLFFBQVE7UUFFdkMsbUhBQW1IO1FBQ25ILE1BQU00QixpQkFBaUJwQixTQUFTcUIsa0JBQWtCLEdBQUdyQixTQUFTcUIsa0JBQWtCLENBQUNsQixjQUFjLENBQUNMLFlBQVksR0FBRztRQUUvRyxJQUFJSCxXQUFXd0I7UUFFZixNQUFRLEtBQU87WUFDYixNQUFNckIsZUFBZUgsU0FBU0csWUFBWTtZQUUxQyx1REFBdUQ7WUFDdkQsSUFBS0EsaUJBQWlCc0Isa0JBQWtCdEIsYUFBYU4sUUFBUSxLQUFLQSxVQUFXO2dCQUMzRUcsV0FBV0c7WUFDYixPQUNLO2dCQUNIO1lBQ0Y7UUFDRjtRQUVBLE9BQU9IO0lBQ1QsT0FDSztRQUNILE9BQU8sTUFBTSxpRkFBaUY7SUFDaEc7QUFDRjtBQUVBLElBQUEsQUFBTTJCLGlCQUFOLE1BQU1BLHVCQUF1QmxDO0lBQzNCOzs7Ozs7Ozs7Ozs7Ozs7O0dBZ0JDLEdBQ0RtQyxPQUFRQyxRQUFRLEVBQUV2QixtQkFBbUIsRUFBRUMsa0JBQWtCLEVBQUVJLHNCQUFzQixFQUFFQyxxQkFBcUIsRUFBRWtCLG1CQUFtQixFQUFFQyxrQkFBa0IsRUFBRztRQUNsSix1RUFBdUU7UUFDdkUsSUFBSSxDQUFDQyxVQUFVLENBQUVILFVBQVV2QixxQkFBcUJDLG9CQUFvQkksd0JBQXdCQyx1QkFBdUJrQixxQkFBcUJDO1FBRXhJLDhHQUE4RztRQUM5RywyR0FBMkc7UUFDM0csOEdBQThHO1FBQzlHLGlCQUFpQjtRQUNqQixJQUFJLENBQUNFLGlCQUFpQixHQUFHO1FBRXpCLHdHQUF3RztRQUN4RywwR0FBMEc7UUFDMUcsK0dBQStHO1FBQy9HLGdEQUFnRDtRQUNoRCxJQUFJLENBQUNDLGNBQWMsR0FBRy9DLFdBQVksSUFBSSxDQUFDK0MsY0FBYyxHQUFJLG1EQUFtRDtRQUU1Ryw0R0FBNEc7UUFDNUcsc0VBQXNFO1FBQ3RFLElBQUksQ0FBQ0MsYUFBYSxHQUFHLE9BQU8scUZBQXFGO1FBRWpILElBQUk5QjtRQUVKLDhEQUE4RDtRQUM5RCxJQUFJLENBQUMrQix3QkFBd0I7UUFFN0JDLGNBQWNBLFdBQVdWLGNBQWMsSUFBSVUsV0FBV1YsY0FBYyxDQUFFO1FBQ3RFVSxjQUFjQSxXQUFXVixjQUFjLElBQUlVLFdBQVdDLElBQUk7UUFFMUQsdUdBQXVHO1FBQ3ZHLDZHQUE2RztRQUM3Ryw4R0FBOEc7UUFDOUcscUNBQXFDO1FBQ3JDLElBQUtULFNBQVNVLE1BQU0sQ0FBQ0MsTUFBTSxFQUFHO1lBQzVCLE1BQU1DLGlCQUFpQlosU0FBU1UsTUFBTSxDQUFFLEVBQUc7WUFDM0MsTUFBTUcsZ0JBQWdCYixTQUFTVSxNQUFNLENBQUVWLFNBQVNVLE1BQU0sQ0FBQ0MsTUFBTSxHQUFHLEVBQUc7WUFFbkUsSUFBTW5DLFdBQVd5QixxQkFBcUJ6QixhQUFhLE1BQU1BLFdBQVdBLFNBQVNxQixrQkFBa0IsQ0FBRztnQkFDaEdpQixVQUFVQSxPQUFRLENBQUN0QyxTQUFTdUMsT0FBTyxJQUFJO2dCQUV2Qyw4R0FBOEc7Z0JBQzlHLDBHQUEwRztnQkFDMUcsaUdBQWlHO2dCQUNqRyxJQUFLbEMsZ0NBQWlDTCxVQUFVTSx3QkFBd0JDLHdCQUEwQjtvQkFDaEcsTUFBTWlDLGVBQWV4QyxTQUFTRyxjQUFjLEdBQ3ZCSCxTQUFTRyxjQUFjLENBQUNLLGVBQWUsR0FDdkNGO29CQUNyQixNQUFNbUMsY0FBY3pDLFNBQVNJLGFBQWEsR0FDdEJKLFNBQVNJLGFBQWEsQ0FBQ0ssbUJBQW1CLEdBQzFDRjtvQkFFcEIsOENBQThDO29CQUM5QyxJQUFNLElBQUltQyxrQkFBa0JGLGVBQWdCRSxrQkFBa0JBLGdCQUFnQmxDLGVBQWUsQ0FBRzt3QkFDOUYsSUFBSSxDQUFDbUMsa0JBQWtCLENBQUVEO3dCQUN6QixJQUFLQSxvQkFBb0JELGFBQWM7NEJBQUU7d0JBQU87b0JBQ2xEO2dCQUNGO2dCQUVBLDJHQUEyRztnQkFDM0csSUFBSy9CLDZCQUE4QlYsVUFBVW9DLGdCQUFnQkMsZ0JBQWtCO29CQUM3RSxNQUFNTyxhQUFhNUMsU0FBU0csY0FBYyxLQUFLLE9BQU9xQixTQUFTVSxNQUFNLENBQUUsRUFBRyxHQUFHbEMsU0FBU0csY0FBYyxDQUFDVyxjQUFjLENBQUNFLFNBQVM7b0JBQzdILE1BQU02QixZQUFZN0MsU0FBU0ksYUFBYSxLQUFLLE9BQU9vQixTQUFTVSxNQUFNLENBQUVWLFNBQVNVLE1BQU0sQ0FBQ0MsTUFBTSxHQUFHLEVBQUcsR0FBR25DLFNBQVNJLGFBQWEsQ0FBQ1UsY0FBYyxDQUFDRyxhQUFhO29CQUV2SixJQUFNLElBQUk2QixjQUFjRixhQUFjRSxjQUFjQSxZQUFZOUIsU0FBUyxDQUFHO3dCQUMxRSxJQUFJLENBQUMrQixVQUFVLENBQUVEO3dCQUNqQixJQUFLQSxnQkFBZ0JELFdBQVk7NEJBQUU7d0JBQU87b0JBQzVDO2dCQUNGO1lBQ0Y7UUFDRjtRQUVBYixjQUFjQSxXQUFXVixjQUFjLElBQUlVLFdBQVdnQixHQUFHO1FBRXpEaEIsY0FBY0EsV0FBV1YsY0FBYyxJQUFJVSxXQUFXVixjQUFjLENBQUU7UUFDdEVVLGNBQWNBLFdBQVdWLGNBQWMsSUFBSVUsV0FBV0MsSUFBSTtRQUUxRCx5R0FBeUc7UUFDekcsSUFBS2hDLHFCQUFzQjtZQUN6QixJQUFNRCxXQUFXeUIscUJBQXFCekIsYUFBYSxNQUFNQSxXQUFXQSxTQUFTcUIsa0JBQWtCLENBQUc7Z0JBQ2hHLElBQUksQ0FBQzRCLGVBQWUsQ0FBRXpCLFVBQVV4QixVQUFVQyxxQkFBcUJDO1lBQ2pFO1FBQ0Y7UUFFQThCLGNBQWNBLFdBQVdWLGNBQWMsSUFBSVUsV0FBV2dCLEdBQUc7UUFFekRoQixjQUFjQSxXQUFXVixjQUFjLElBQUlVLFdBQVdWLGNBQWMsQ0FBRTtRQUN0RVUsY0FBY0EsV0FBV1YsY0FBYyxJQUFJVSxXQUFXQyxJQUFJO1FBRTFELGtHQUFrRztRQUNsRyxJQUFJLENBQUNpQixrQkFBa0I7UUFFdkIsMkdBQTJHO1FBQzNHLDZHQUE2RztRQUM3Ryw2R0FBNkc7UUFDN0csMEJBQTBCO1FBQzFCLElBQUksQ0FBQ0Msb0JBQW9CO1FBRXpCLElBQUtsRCx3QkFBd0IsTUFBTztZQUNsQyw4QkFBOEI7WUFDOUIsSUFBSSxDQUFDbUQsV0FBVztRQUNsQixPQUNLLElBQUssSUFBSSxDQUFDeEIsaUJBQWlCLEVBQUc7WUFDakMsd0dBQXdHO1lBQ3hHLHVHQUF1RztZQUN2RyxJQUFJLENBQUN5QixzQkFBc0IsQ0FBRTdCLFVBQVV2QixvQkFBb0JxRCxxQkFBcUIsRUFBRXBELG1CQUFtQm9ELHFCQUFxQjtZQUUxSCwwRUFBMEU7WUFDMUUsSUFBSSxDQUFDQyxPQUFPO1FBQ2Q7UUFFQSxrRUFBa0U7UUFDbEUsSUFBSSxDQUFDQyxLQUFLO1FBRVYsOENBQThDO1FBQzlDMUUsV0FBWSxJQUFJLENBQUMrQyxjQUFjO1FBRS9CRyxjQUFjQSxXQUFXVixjQUFjLElBQUlVLFdBQVdnQixHQUFHO0lBQzNEO0lBRUE7Ozs7Ozs7O0dBUUMsR0FDREMsZ0JBQWlCekIsUUFBUSxFQUFFeEIsUUFBUSxFQUFFQyxtQkFBbUIsRUFBRUMsa0JBQWtCLEVBQUc7UUFDN0VvQyxVQUFVQSxPQUFRdEMsb0JBQW9CaEI7UUFDdENzRCxVQUFVQSxPQUFRckMsK0JBQStCaEIsVUFBVTtRQUMzRHFELFVBQVVBLE9BQVFwQyw4QkFBOEJqQixVQUFVO1FBQzFEcUQsVUFBVUEsT0FBUSxDQUFDdEMsU0FBU3VDLE9BQU8sSUFBSTtRQUV2Q1AsY0FBY0EsV0FBV3lCLGFBQWEsSUFBSXpCLFdBQVd5QixhQUFhLENBQUUsQ0FBQyxVQUFVLEVBQzdFekQsU0FBU0csY0FBYyxHQUFHSCxTQUFTRyxjQUFjLENBQUN1RCxRQUFRLEtBQUssT0FDaEUsSUFBSSxFQUNIMUQsU0FBU0ksYUFBYSxHQUFHSixTQUFTSSxhQUFhLENBQUNzRCxRQUFRLEtBQUssUUFBUTtRQUN2RTFCLGNBQWNBLFdBQVd5QixhQUFhLElBQUl6QixXQUFXQyxJQUFJO1FBRXpELCtEQUErRDtRQUMvRCxJQUFLLENBQUNsQyxnQ0FBaUNDLFVBQVVDLHFCQUFxQkMscUJBQXVCO1lBQzNGOEIsY0FBY0EsV0FBV3lCLGFBQWEsSUFBSXpCLFdBQVd5QixhQUFhLENBQUU7WUFFcEUsd0ZBQXdGO1lBQ3hGLElBQUt6RCxTQUFTRyxjQUFjLElBQUlILFNBQVNJLGFBQWEsRUFBRztnQkFDdkRrQyxVQUFVQSxPQUFRdEMsU0FBU0csY0FBYyxDQUFDTCxZQUFZLEtBQUtFLFNBQVNJLGFBQWE7Z0JBRWpGLG1HQUFtRztnQkFDbkcsaUZBQWlGO2dCQUNqRixNQUFNdUQsU0FBUyxDQUFDdEUsdUJBQXdCVyxTQUFTRyxjQUFjLEVBQUVILFNBQVNJLGFBQWE7Z0JBRXZGLHFEQUFxRDtnQkFDckQsSUFBSSxDQUFDd0QsZ0JBQWdCLENBQUU1RCxVQUFVMkQsUUFBUUE7WUFDM0M7WUFFQSxJQUFLM0QsU0FBU0csY0FBYyxJQUFJLENBQUNOLFlBQWFHLFNBQVNHLGNBQWMsR0FBSztnQkFDeEU2QixjQUFjQSxXQUFXeUIsYUFBYSxJQUFJekIsV0FBV3lCLGFBQWEsQ0FBRTtnQkFDcEV6QixjQUFjQSxXQUFXeUIsYUFBYSxJQUFJekIsV0FBV0MsSUFBSTtnQkFDekQsSUFBSSxDQUFDNEIsaUJBQWlCLENBQUU3RCxTQUFTRyxjQUFjO2dCQUMvQzZCLGNBQWNBLFdBQVd5QixhQUFhLElBQUl6QixXQUFXZ0IsR0FBRztZQUMxRCxPQUNLLElBQUtoRCxTQUFTSSxhQUFhLElBQUksQ0FBQ1YsYUFBY00sU0FBU0ksYUFBYSxHQUFLO2dCQUM1RTRCLGNBQWNBLFdBQVd5QixhQUFhLElBQUl6QixXQUFXeUIsYUFBYSxDQUFFO2dCQUNwRXpCLGNBQWNBLFdBQVd5QixhQUFhLElBQUl6QixXQUFXQyxJQUFJO2dCQUN6RCxJQUFJLENBQUM2QixrQkFBa0IsQ0FBRTlELFNBQVNJLGFBQWE7Z0JBQy9DNEIsY0FBY0EsV0FBV3lCLGFBQWEsSUFBSXpCLFdBQVdnQixHQUFHO1lBQzFEO1FBQ0YsT0FFSztZQUNILElBQUlyRCxXQUFXSyxTQUFTRyxjQUFjLEdBQUdILFNBQVNHLGNBQWMsQ0FBQ0wsWUFBWSxHQUFHRztZQUVoRiwwQ0FBMEM7WUFDMUMsSUFBSThELHdCQUF3QjtZQUM1QixJQUFJQyxlQUFlO1lBQ25CLElBQUlDLFVBQVU7WUFFZCwwRkFBMEY7WUFDMUYsTUFBUSxLQUFPO2dCQUNiLE1BQU1uRSxlQUFlSCxTQUFTRyxZQUFZO2dCQUMxQyxNQUFNb0UsU0FBU3BFLGlCQUFpQkUsU0FBU0ksYUFBYTtnQkFFdERrQyxVQUFVQSxPQUFReEMsaUJBQWlCLFFBQVFvRSxRQUFRO2dCQUVuRCxJQUFLLENBQUNILHVCQUF3QjtvQkFDNUJBLHdCQUF3QnBFO2dCQUMxQjtnQkFFQSw2R0FBNkc7Z0JBQzdHLDBHQUEwRztnQkFDMUcsZ0RBQWdEO2dCQUNoRCxJQUFLcUUsaUJBQWlCLFFBQVFyRSxTQUFTbUIsY0FBYyxJQUFJLENBQUNuQixTQUFTbUIsY0FBYyxDQUFDcUQsSUFBSSxJQUFJeEUsU0FBUzZCLFFBQVEsS0FBS0EsWUFDM0c3QixTQUFTbUIsY0FBYyxDQUFDQSxjQUFjLEtBQUtVLFVBQVc7b0JBQ3pEd0MsZUFBZXJFLFNBQVNtQixjQUFjO29CQUN0Q2tCLGNBQWNBLFdBQVd5QixhQUFhLElBQUl6QixXQUFXeUIsYUFBYSxDQUFFLENBQUMsWUFBWSxFQUFFOUQsU0FBUytELFFBQVEsR0FBRyxNQUFNLEVBQUVNLGNBQWM7Z0JBQy9IO2dCQUVBLElBQUtFLFVBQVU3RSx1QkFBd0JNLFVBQVVHLGVBQWlCO29CQUNoRSxJQUFLbUUsU0FBVTt3QkFDYiw0RkFBNEY7d0JBQzVGLElBQUksQ0FBQ0wsZ0JBQWdCLENBQUU1RCxVQUFVTixhQUFjcUUsd0JBQXlCbEUsWUFBYUY7b0JBQ3ZGO29CQUVBLDZGQUE2RjtvQkFDN0YsSUFBSSxDQUFDeUUsZUFBZSxDQUFFcEUsVUFBVStELHVCQUF1QnBFLFVBQVVxRSxjQUFjQyxTQUFTQztvQkFFeEZILHdCQUF3QjtvQkFDeEJDLGVBQWU7b0JBQ2ZDLFVBQVU7Z0JBQ1o7Z0JBRUEsSUFBS0MsUUFBUztvQkFDWjtnQkFDRixPQUNLO29CQUNIdkUsV0FBV0c7Z0JBQ2I7WUFDRjtRQUNGO1FBR0FrQyxjQUFjQSxXQUFXeUIsYUFBYSxJQUFJekIsV0FBV2dCLEdBQUc7SUFDMUQ7SUFFQTs7Ozs7Ozs7O0dBU0MsR0FDRG9CLGdCQUFpQnBFLFFBQVEsRUFBRW1CLGFBQWEsRUFBRWtELFlBQVksRUFBRUwsWUFBWSxFQUFFQyxPQUFPLEVBQUVDLE1BQU0sRUFBRztRQUN0RmxDLGNBQWNBLFdBQVd5QixhQUFhLElBQUl6QixXQUFXeUIsYUFBYSxDQUNoRSxDQUFDLFdBQVcsRUFBRXRDLGNBQWN1QyxRQUFRLEdBQUcsSUFBSSxFQUFFVyxhQUFhWCxRQUFRLEdBQUcsQ0FBQyxFQUNwRU0sZUFBZSxDQUFDLGNBQWMsRUFBRUEsYUFBYU4sUUFBUSxJQUFJLEdBQUcsaUJBQWlCO1FBQ2pGMUIsY0FBY0EsV0FBV3lCLGFBQWEsSUFBSXpCLFdBQVdDLElBQUk7UUFFekQsTUFBTXFDLGFBQWE1RSxhQUFjeUI7UUFDakMsTUFBTW9ELFlBQVkxRSxZQUFhd0U7UUFFL0IvQixVQUFVQSxPQUFRLENBQUNnQyxjQUFjTCxTQUFTO1FBQzFDM0IsVUFBVUEsT0FBUSxDQUFDaUMsYUFBYUwsUUFBUTtRQUV4QzVCLFVBQVVBLE9BQVEsQ0FBQ2dDLGNBQWMsQ0FBQ0MsYUFBYXBELGNBQWN2QixnQkFBZ0IsQ0FBQzBELHFCQUFxQixLQUFLZSxhQUFhdkUsWUFBWSxDQUFDd0QscUJBQXFCLEVBQ3JKO1FBRUYsNEdBQTRHO1FBQzVHLElBQUtnQixZQUFhO1lBQ2hCTixlQUFlN0MsY0FBY3ZCLGdCQUFnQixDQUFDMEQscUJBQXFCO1lBQ25FdEIsY0FBY0EsV0FBV3lCLGFBQWEsSUFBSXpCLFdBQVd5QixhQUFhLENBQUUsQ0FBQyw2QkFBNkIsRUFBRU8sYUFBYU4sUUFBUSxJQUFJO1FBQy9IO1FBRUEsd0dBQXdHO1FBQ3hHLElBQUthLFdBQVk7WUFDZlAsZUFBZUssYUFBYXZFLFlBQVksQ0FBQ3dELHFCQUFxQjtZQUM5RHRCLGNBQWNBLFdBQVd5QixhQUFhLElBQUl6QixXQUFXeUIsYUFBYSxDQUFFLENBQUMsNEJBQTRCLEVBQUVPLGFBQWFOLFFBQVEsSUFBSTtRQUM5SDtRQUVBLGlHQUFpRztRQUNqR00sZUFBZSxJQUFJLENBQUNRLGVBQWUsQ0FBRVIsY0FBYzdDO1FBRW5ELHlCQUF5QjtRQUN6QixJQUFNLElBQUl4QixXQUFXd0IsZ0JBQWlCeEIsV0FBV0EsU0FBU0csWUFBWSxDQUFHO1lBQ3ZFLElBQUksQ0FBQzJFLG1CQUFtQixDQUFFOUUsVUFBVXFFO1lBQ3BDLElBQUtyRSxhQUFhMEUsY0FBZTtnQkFBRTtZQUFPO1FBQzVDO1FBRUEsK0dBQStHO1FBQy9HLElBQUssQ0FBQ0MsWUFBYTtZQUNqQnRDLGNBQWNBLFdBQVd5QixhQUFhLElBQUl6QixXQUFXeUIsYUFBYSxDQUFFO1lBQ3BFekIsY0FBY0EsV0FBV3lCLGFBQWEsSUFBSXpCLFdBQVdDLElBQUk7WUFDekQsSUFBSSxDQUFDNkIsa0JBQWtCLENBQUUzQztZQUN6QmEsY0FBY0EsV0FBV3lCLGFBQWEsSUFBSXpCLFdBQVdnQixHQUFHO1FBQzFEO1FBQ0EsSUFBS2tCLFVBQVUsQ0FBQ0ssV0FBWTtZQUMxQnZDLGNBQWNBLFdBQVd5QixhQUFhLElBQUl6QixXQUFXeUIsYUFBYSxDQUFFO1lBQ3BFekIsY0FBY0EsV0FBV3lCLGFBQWEsSUFBSXpCLFdBQVdDLElBQUk7WUFDekQsSUFBSSxDQUFDNEIsaUJBQWlCLENBQUVRO1lBQ3hCckMsY0FBY0EsV0FBV3lCLGFBQWEsSUFBSXpCLFdBQVdnQixHQUFHO1FBQzFEO1FBRUFoQixjQUFjQSxXQUFXeUIsYUFBYSxJQUFJekIsV0FBV2dCLEdBQUc7SUFDMUQ7SUFFQTs7Ozs7Ozs7R0FRQyxHQUNEWSxpQkFBa0I1RCxRQUFRLEVBQUVzRSxVQUFVLEVBQUVDLFNBQVMsRUFBRztRQUNsRCw2Q0FBNkM7UUFDN0MsSUFBS3ZFLFNBQVNHLGNBQWMsS0FBSyxRQUFRSCxTQUFTSSxhQUFhLEtBQUssTUFBTztZQUN6RSxNQUFNUyxjQUFjYixTQUFTRyxjQUFjLENBQUNtRCxxQkFBcUI7WUFDakUsTUFBTXZDLGFBQWFmLFNBQVNJLGFBQWEsQ0FBQ2tELHFCQUFxQjtZQUMvRCxNQUFNb0IsaUJBQWlCLEFBQUUxRSxTQUFTcUIsa0JBQWtCLElBQUlyQixTQUFTcUIsa0JBQWtCLENBQUNqQixhQUFhLEdBQzFFSixTQUFTcUIsa0JBQWtCLENBQUNqQixhQUFhLENBQUNrRCxxQkFBcUIsR0FDL0Q7WUFFdkIsOEdBQThHO1lBQzlHLG1FQUFtRTtZQUNuRSwwR0FBMEc7WUFDMUcsSUFBS3pDLGdCQUFnQkUsWUFBYTtnQkFDaEMsSUFBSSxDQUFDZSxhQUFhLEdBQUc7WUFDdkI7WUFFQUUsY0FBY0EsV0FBV3lCLGFBQWEsSUFBSXpCLFdBQVd5QixhQUFhLENBQ2hFLENBQUMsV0FBVyxFQUNWYSxhQUFhLGlCQUFpQixLQUM3QkMsWUFBWSxnQkFBZ0IsS0FDNUIxRCxZQUFZNkMsUUFBUSxHQUFHLElBQUksRUFBRTNDLFdBQVcyQyxRQUFRLElBQUk7WUFDekQxQixjQUFjQSxXQUFXeUIsYUFBYSxJQUFJekIsV0FBV0MsSUFBSTtZQUV6RCx1R0FBdUc7WUFDdkcsSUFBSTBDO1lBQ0oseUVBQXlFO1lBQ3pFLElBQUtMLGNBQWNDLFdBQVk7Z0JBQzdCdkMsY0FBY0EsV0FBV3lCLGFBQWEsSUFBSXpCLFdBQVd5QixhQUFhLENBQUUsQ0FBQyxXQUFXLEVBQUU1QyxZQUFZNkMsUUFBUSxJQUFJO2dCQUMxR2lCLGdCQUFnQjlEO1lBQ2xCLE9BQ0s7Z0JBQ0gsdUZBQXVGO2dCQUN2RixJQUFLLElBQUksQ0FBQ2lCLGFBQWEsSUFBSWpCLGdCQUFnQkUsWUFBYTtvQkFDdERpQixjQUFjQSxXQUFXeUIsYUFBYSxJQUFJekIsV0FBV3lCLGFBQWEsQ0FBRTtvQkFDcEUsMEdBQTBHO29CQUMxRyx3R0FBd0c7b0JBQ3hHLG1CQUFtQjtvQkFDbkJrQixnQkFBZ0IsSUFBSSxDQUFDQyxXQUFXLENBQUU1RSxTQUFTSSxhQUFhLENBQUNaLFFBQVEsRUFBRVEsU0FBU0ksYUFBYTtvQkFDekYsSUFBSSxDQUFDd0IsaUJBQWlCLEdBQUcsTUFBTSxxQ0FBcUM7Z0JBQ3RFLE9BRUs7b0JBQ0hJLGNBQWNBLFdBQVd5QixhQUFhLElBQUl6QixXQUFXeUIsYUFBYSxDQUFFLENBQUMsMkJBQTJCLEVBQUUxQyxXQUFXMkMsUUFBUSxJQUFJO29CQUN6SGlCLGdCQUFnQjVEO2dCQUNsQjtZQUNGO1lBRUEseUVBQXlFO1lBQ3pFLElBQUtBLGVBQWU0RCxlQUFnQjtnQkFDbEMzQyxjQUFjQSxXQUFXeUIsYUFBYSxJQUFJekIsV0FBV3lCLGFBQWEsQ0FBRTtnQkFDcEUsSUFBSSxDQUFDM0IsYUFBYSxHQUFHO1lBQ3ZCLE9BR0s7Z0JBQ0hFLGNBQWNBLFdBQVd5QixhQUFhLElBQUl6QixXQUFXeUIsYUFBYSxDQUFFO2dCQUNwRXpCLGNBQWNBLFdBQVd5QixhQUFhLElBQUl6QixXQUFXQyxJQUFJO2dCQUN6RCxJQUFJLENBQUM0QyxlQUFlLENBQUU3RSxVQUFVMkU7Z0JBQ2hDM0MsY0FBY0EsV0FBV3lCLGFBQWEsSUFBSXpCLFdBQVdnQixHQUFHO1lBQzFEO1lBRUEsMkdBQTJHO1lBQzNHLGdGQUFnRjtZQUNoRixJQUFLMEIsbUJBQW1CM0QsWUFBYTtnQkFDbkNpQixjQUFjQSxXQUFXeUIsYUFBYSxJQUFJekIsV0FBV3lCLGFBQWEsQ0FBRTtnQkFFcEUsd0dBQXdHO2dCQUN4RyxJQUFLLENBQUMsSUFBSSxDQUFDM0IsYUFBYSxFQUFHO29CQUN6QkUsY0FBY0EsV0FBV3lCLGFBQWEsSUFBSXpCLFdBQVd5QixhQUFhLENBQUUsQ0FBQyxRQUFRLEVBQUUxQyxXQUFXMkMsUUFBUSxJQUFJO29CQUN0RyxJQUFJLENBQUNYLFVBQVUsQ0FBRWhDO2dCQUNuQjtnQkFDQSxJQUFJLENBQUNlLGFBQWEsR0FBRztZQUN2QjtZQUVBRSxjQUFjQSxXQUFXeUIsYUFBYSxJQUFJekIsV0FBV2dCLEdBQUc7UUFDMUQ7SUFDRjtJQUVBOzs7Ozs7Ozs7R0FTQyxHQUNENkIsZ0JBQWlCN0UsUUFBUSxFQUFFOEUsUUFBUSxFQUFHO1FBQ3BDLE1BQU1DLHVCQUF1QjdELGtDQUFtQ2xCO1FBQ2hFLElBQUksQ0FBQ2dGLGdCQUFnQixDQUFFRixVQUFVOUUsU0FBU0ksYUFBYSxFQUFFMkU7UUFFekQseUdBQXlHO1FBQ3pHLHdGQUF3RjtRQUN4RixJQUFLLENBQUMvRSxTQUFTcUIsa0JBQWtCLElBQUlyQixTQUFTcUIsa0JBQWtCLENBQUNsQixjQUFjLEtBQUs0RSxzQkFBdUI7WUFDekcsSUFBSSxDQUFDbEIsaUJBQWlCLENBQUVrQjtRQUMxQjtJQUNGO0lBRUE7Ozs7Ozs7OztHQVNDLEdBQ0RDLGlCQUFrQkYsUUFBUSxFQUFFM0QsYUFBYSxFQUFFa0QsWUFBWSxFQUFHO1FBQ3hELElBQU0sSUFBSTFFLFdBQVd3QixnQkFBaUJ4QixXQUFXQSxTQUFTRyxZQUFZLENBQUc7WUFDdkV3QyxVQUFVQSxPQUFRLENBQUMzQyxTQUFTc0YsZUFBZSxJQUFJLENBQUN0RixTQUFTdUYsY0FBYyxFQUNyRTtZQUVGLElBQUksQ0FBQ0MsZUFBZSxDQUFFeEYsVUFBVW1GO1lBQ2hDLElBQUtuRixhQUFhMEUsY0FBZTtnQkFBRTtZQUFPO1FBQzVDO0lBQ0Y7SUFFQTs7Ozs7Ozs7R0FRQyxHQUNERyxnQkFBaUJZLFlBQVksRUFBRUMsb0JBQW9CLEVBQUc7UUFDcEQsbURBQW1EO1FBQ25ELElBQUtELGNBQWU7WUFDbEJwRCxjQUFjQSxXQUFXeUIsYUFBYSxJQUFJekIsV0FBV3lCLGFBQWEsQ0FBRSxDQUFDLHNCQUFzQixFQUFFMkIsYUFBYTFCLFFBQVEsSUFBSTtZQUN0SCwwRkFBMEY7WUFDMUYsSUFBSyxDQUFDMEIsYUFBYWpCLElBQUksRUFBRztnQkFDeEIsSUFBSSxDQUFDbUIsUUFBUSxDQUFFRjtZQUNqQjtRQUNGLE9BQ0s7WUFDSCxxQkFBcUI7WUFDckJwRCxjQUFjQSxXQUFXeUIsYUFBYSxJQUFJekIsV0FBV3lCLGFBQWEsQ0FBRTtZQUNwRTJCLGVBQWUsSUFBSSxDQUFDRyxtQkFBbUIsQ0FBRUYscUJBQXFCN0YsUUFBUSxFQUFFNkY7UUFDMUU7UUFDQSxPQUFPRDtJQUNUO0lBRUE7Ozs7Ozs7Ozs7R0FVQyxHQUNERyxvQkFBcUIvRixRQUFRLEVBQUVHLFFBQVEsRUFBRztRQUN4QyxJQUFJNkY7UUFFSixvRkFBb0Y7UUFDcEYsb0dBQW9HO1FBQ3BHLElBQUssQ0FBQ3RHLFNBQVNPLEtBQUssQ0FBRUQsV0FBYTtZQUNqQyx5Q0FBeUM7WUFDekMsSUFBTSxJQUFJaUcsSUFBSSxJQUFJLENBQUM1RCxjQUFjLENBQUNNLE1BQU0sR0FBRyxHQUFHc0QsS0FBSyxHQUFHQSxJQUFNO2dCQUMxRCxNQUFNQyxXQUFXLElBQUksQ0FBQzdELGNBQWMsQ0FBRTRELEVBQUc7Z0JBQ3pDbkQsVUFBVUEsT0FBUSxDQUFDb0QsU0FBU3ZCLElBQUk7Z0JBQ2hDLElBQUt1QixTQUFTbEcsUUFBUSxLQUFLQSxVQUFXO29CQUNwQyxJQUFJLENBQUNtRyxlQUFlLENBQUVELFVBQVVEO29CQUNoQ0QsUUFBUUU7b0JBQ1I7Z0JBQ0Y7WUFDRjtRQUNGO1FBRUEsSUFBSyxDQUFDRixPQUFRO1lBQ1oseUVBQXlFO1lBQ3pFQSxRQUFRLElBQUksQ0FBQ1osV0FBVyxDQUFFcEYsVUFBVUc7UUFDdEM7UUFFQSxJQUFJLENBQUNpQyxpQkFBaUIsR0FBRyxNQUFNLGtEQUFrRDtRQUVqRixPQUFPNEQ7SUFDVDtJQUVBOzs7OztHQUtDLEdBQ0R6QyxXQUFZeUMsS0FBSyxFQUFHO1FBQ2xCLElBQUtBLE1BQU1yQixJQUFJLEVBQUc7WUFDaEJuQyxjQUFjQSxXQUFXeUIsYUFBYSxJQUFJekIsV0FBV3lCLGFBQWEsQ0FBRSxDQUFDLGVBQWUsRUFBRStCLE1BQU05QixRQUFRLElBQUk7WUFDeEc4QixNQUFNckIsSUFBSSxHQUFHLE9BQU8sZ0ZBQWdGO1lBQ3BHLElBQUksQ0FBQ3RDLGNBQWMsQ0FBQ0ksSUFBSSxDQUFFdUQ7UUFDNUIsT0FDSztZQUNIeEQsY0FBY0EsV0FBV3lCLGFBQWEsSUFBSXpCLFdBQVd5QixhQUFhLENBQUUsQ0FBQyxnQ0FBZ0MsRUFBRStCLE1BQU05QixRQUFRLElBQUk7UUFDM0g7SUFDRjtJQUVBOzs7OztHQUtDLEdBQ0Q0QixTQUFVRSxLQUFLLEVBQUc7UUFDaEIsSUFBSSxDQUFDRyxlQUFlLENBQUVILE9BQU9JLEVBQUVDLE9BQU8sQ0FBRSxJQUFJLENBQUNoRSxjQUFjLEVBQUUyRDtJQUMvRDtJQUVBOzs7OztHQUtDLEdBQ0RHLGdCQUFpQkgsS0FBSyxFQUFFTSxLQUFLLEVBQUc7UUFDOUI5RCxjQUFjQSxXQUFXeUIsYUFBYSxJQUFJekIsV0FBV3lCLGFBQWEsQ0FBRSxDQUFDLHNCQUFzQixFQUFFK0IsTUFBTTlCLFFBQVEsR0FBRyxnQkFBZ0IsRUFBRThCLE1BQU1oRyxRQUFRLEVBQUU7UUFFaEo4QyxVQUFVQSxPQUFRd0QsU0FBUyxLQUFLLElBQUksQ0FBQ2pFLGNBQWMsQ0FBRWlFLE1BQU8sS0FBS04sT0FBTyxDQUFDLCtCQUErQixFQUFFTSxPQUFPO1FBRWpIeEQsVUFBVUEsT0FBUSxDQUFDa0QsTUFBTXJCLElBQUksRUFBRTtRQUUvQixZQUFZO1FBQ1osSUFBSSxDQUFDdEMsY0FBYyxDQUFDa0UsTUFBTSxDQUFFRCxPQUFPO1FBRW5DLGtCQUFrQjtRQUNsQk4sTUFBTXJCLElBQUksR0FBRztJQUNmO0lBRUE7OztHQUdDLEdBQ0RqQixxQkFBcUI7UUFDbkJsQixjQUFjQSxXQUFXVixjQUFjLElBQUksSUFBSSxDQUFDTyxjQUFjLENBQUNNLE1BQU0sSUFBSUgsV0FBV1YsY0FBYyxDQUFFO1FBQ3BHVSxjQUFjQSxXQUFXVixjQUFjLElBQUlVLFdBQVdDLElBQUk7UUFDMUQsTUFBUSxJQUFJLENBQUNKLGNBQWMsQ0FBQ00sTUFBTSxDQUFHO1lBQ25DLE1BQU1xRCxRQUFRLElBQUksQ0FBQzNELGNBQWMsQ0FBQ21CLEdBQUc7WUFDckMsSUFBSSxDQUFDZ0Qsb0JBQW9CLENBQUVSO1lBQzNCLElBQUksQ0FBQzVELGlCQUFpQixHQUFHO1FBQzNCO1FBQ0FJLGNBQWNBLFdBQVdWLGNBQWMsSUFBSVUsV0FBV2dCLEdBQUc7SUFDM0Q7SUFFQTs7Ozs7R0FLQyxHQUNEYyxtQkFBb0JuRSxRQUFRLEVBQUc7UUFDN0JxQyxjQUFjQSxXQUFXeUIsYUFBYSxJQUFJekIsV0FBV3lCLGFBQWEsQ0FBRSxDQUFDLFlBQVksRUFBRTlELFNBQVMrRCxRQUFRLElBQUk7UUFDeEcsTUFBTXVDLGlCQUFpQnRHLFNBQVNDLGdCQUFnQjtRQUNoRCxJQUFJLENBQUNzRyxVQUFVLENBQUVELGlCQUFpQkEsZUFBZTNDLHFCQUFxQixHQUFHLE1BQ3ZFM0QsU0FBUzJELHFCQUFxQixFQUM5QjJDLGdCQUNBdEc7SUFDSjtJQUdBOzs7OztHQUtDLEdBQ0RrRSxrQkFBbUJsRSxRQUFRLEVBQUc7UUFDNUJxQyxjQUFjQSxXQUFXeUIsYUFBYSxJQUFJekIsV0FBV3lCLGFBQWEsQ0FBRSxDQUFDLFdBQVcsRUFBRTlELFNBQVMrRCxRQUFRLElBQUk7UUFDdkcsTUFBTXlDLGdCQUFnQnhHLFNBQVNHLFlBQVk7UUFDM0MsSUFBSSxDQUFDb0csVUFBVSxDQUFFdkcsU0FBUzJELHFCQUFxQixFQUM3QzZDLGdCQUFnQkEsY0FBYzdDLHFCQUFxQixHQUFHLE1BQ3REM0QsVUFDQXdHO0lBQ0o7SUFFQTs7Ozs7Ozs7Ozs7Ozs7O0dBZUMsR0FDREQsV0FBWXJGLFdBQVcsRUFBRUUsVUFBVSxFQUFFa0YsY0FBYyxFQUFFRSxhQUFhLEVBQUc7UUFDbkVuRSxjQUFjQSxXQUFXVixjQUFjLElBQUlVLFdBQVdWLGNBQWMsQ0FBRSxDQUFDLGdCQUFnQixFQUNyRlQsY0FBZ0IsR0FBR0EsWUFBWTZDLFFBQVEsR0FBRyxFQUFFLEVBQUV1QyxlQUFldkMsUUFBUSxHQUFHLENBQUMsQ0FBQyxHQUFLLE9BQ2hGLElBQUksRUFDSDNDLGFBQWUsR0FBR0EsV0FBVzJDLFFBQVEsR0FBRyxFQUFFLEVBQUV5QyxjQUFjekMsUUFBUSxHQUFHLENBQUMsQ0FBQyxHQUFLLFFBQVE7UUFDdEYxQixjQUFjQSxXQUFXVixjQUFjLElBQUlVLFdBQVdDLElBQUk7UUFFMURLLFVBQVVBLE9BQVEsQUFBRXpCLGdCQUFnQixRQUFRb0YsbUJBQW1CLFFBQzNDcEYsdUJBQXVCOUIsU0FBU2tILDBCQUEwQmhIO1FBQzlFcUQsVUFBVUEsT0FBUSxBQUFFdkIsZUFBZSxRQUFRb0Ysa0JBQWtCLFFBQ3pDcEYsc0JBQXNCaEMsU0FBU29ILHlCQUF5QmxIO1FBRTVFLElBQUs0QixhQUFjO1lBQ2pCLElBQUtBLFlBQVlHLFNBQVMsS0FBS0QsWUFBYTtnQkFDMUMsSUFBSSxDQUFDYSxpQkFBaUIsR0FBRztnQkFFekIsMERBQTBEO2dCQUMxRCxJQUFLZixZQUFZRyxTQUFTLEVBQUc7b0JBQzNCSCxZQUFZRyxTQUFTLENBQUNDLGFBQWEsR0FBRztnQkFDeEM7Z0JBRUFKLFlBQVlHLFNBQVMsR0FBR0Q7WUFDMUI7WUFDQSxJQUFJLENBQUNxRixjQUFjLENBQUV2RixhQUFhb0Y7UUFDcEM7UUFDQSxJQUFLbEYsWUFBYTtZQUNoQixJQUFLQSxXQUFXRSxhQUFhLEtBQUtKLGFBQWM7Z0JBQzlDLElBQUksQ0FBQ2UsaUJBQWlCLEdBQUc7Z0JBRXpCLDBEQUEwRDtnQkFDMUQsSUFBS2IsV0FBV0UsYUFBYSxFQUFHO29CQUM5QkYsV0FBV0UsYUFBYSxDQUFDRCxTQUFTLEdBQUc7Z0JBQ3ZDO2dCQUVBRCxXQUFXRSxhQUFhLEdBQUdKO1lBQzdCO1lBQ0EsSUFBSSxDQUFDd0YsZUFBZSxDQUFFdEYsWUFBWW9GO1FBQ3BDO1FBRUFuRSxjQUFjQSxXQUFXVixjQUFjLElBQUlVLFdBQVdnQixHQUFHO0lBQzNEO0lBRUE7Ozs7Ozs7R0FPQyxHQUNESyx1QkFBd0I3QixRQUFRLEVBQUVvQixVQUFVLEVBQUVDLFNBQVMsRUFBRztRQUN4RCwwQ0FBMEM7UUFDMUMsTUFBUXJCLFNBQVNVLE1BQU0sQ0FBQ0MsTUFBTSxDQUFHO1lBQy9CWCxTQUFTVSxNQUFNLENBQUNjLEdBQUc7UUFDckI7UUFFQWhCLGNBQWNBLFdBQVdWLGNBQWMsSUFBSVUsV0FBV1YsY0FBYyxDQUFFLENBQUMsd0JBQXdCLEVBQUVzQixXQUFXYyxRQUFRLEdBQUcsSUFBSSxFQUFFYixVQUFVYSxRQUFRLElBQUk7UUFDbkoxQixjQUFjQSxXQUFXVixjQUFjLElBQUlVLFdBQVdDLElBQUk7UUFFMUQsK0NBQStDO1FBQy9DLElBQUtXLFlBQWE7WUFFaEIsMkNBQTJDO1lBQzNDLElBQU0sSUFBSTRDLFFBQVE1QyxhQUFjNEMsUUFBUUEsTUFBTXhFLFNBQVMsQ0FBRztnQkFDeERnQixjQUFjQSxXQUFXVixjQUFjLElBQUlVLFdBQVdWLGNBQWMsQ0FBRWtFLE1BQU05QixRQUFRO2dCQUVwRmxDLFNBQVNVLE1BQU0sQ0FBQ0QsSUFBSSxDQUFFdUQ7Z0JBRXRCLElBQUtBLFVBQVUzQyxXQUFZO29CQUFFO2dCQUFPO1lBQ3RDO1FBQ0Y7UUFFQWIsY0FBY0EsV0FBV1YsY0FBYyxJQUFJVSxXQUFXZ0IsR0FBRztJQUMzRDtBQUNGO0FBRUE3RCxRQUFRbUgsUUFBUSxDQUFFLGtCQUFrQmhGO0FBQ3BDLGVBQWVBLGVBQWUifQ==