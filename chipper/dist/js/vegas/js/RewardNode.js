// Copyright 2014-2024, University of Colorado Boulder
/**
 * Reward node that shows many nodes animating continuously, for fun!  Shown when a perfect score is achieved in a game.
 * You can also test this by running vegas/vegas_en.html and clicking on the "Reward" screen.
 * Note that the number of images falling is constant, so if the screen is stretched out vertically (tall thin window)
 * they will be less dense.
 *
 * There are two ways to run the animation step function.  The client code can manually call step(dt), or the client
 * code can pass in an Events instance that triggers events on 'step'. In the latter case, the listener will
 * automatically be removed when the animation is complete.
 *
 * For details about the development of the RewardNode, please see https://github.com/phetsims/vegas/issues/4
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */ import Bounds2 from '../../dot/js/Bounds2.js';
import dotRandom from '../../dot/js/dotRandom.js';
import ScreenView from '../../joist/js/ScreenView.js';
import getGlobal from '../../phet-core/js/getGlobal.js';
import optionize from '../../phet-core/js/optionize.js';
import FaceNode from '../../scenery-phet/js/FaceNode.js';
import StarNode from '../../scenery-phet/js/StarNode.js';
import { CanvasNode, Node, TransformTracker } from '../../scenery/js/imports.js';
import phetioStateSetEmitter from '../../tandem/js/phetioStateSetEmitter.js';
import vegas from './vegas.js';
// constants
const DEBUG_CANVAS_NODE_BOUNDS = false; // shows a gray rectangle for the CanvasNode to help ensure that its bounds are accurate
const MAX_SPEED = 200; // The maximum speed an image can fall in screen pixels per second.
let RewardNode = class RewardNode extends CanvasNode {
    dispose() {
        this.disposeRewardNode();
        super.dispose();
    }
    /**
   * Paint the rewards on the canvas.
   */ paintCanvas(context) {
        // If the debugging flag is on, show the bounds of the canvas
        if (DEBUG_CANVAS_NODE_BOUNDS) {
            const bounds = this.canvasDisplayBounds;
            // Fill the canvas with gray
            context.fillStyle = 'rgba(50,50,50,0.5)';
            context.fillRect(bounds.minX, bounds.minY, bounds.width, bounds.height);
            // Stroke the canvas border with blue
            context.strokeStyle = '#0000ff';
            context.lineWidth = 5;
            context.strokeRect(bounds.minX, bounds.minY, bounds.width, bounds.height);
        }
        context.scale(1 / this.scaleForResolution, 1 / this.scaleForResolution);
        // Display the rewards.
        this.rewardImages.forEach((reward)=>{
            if (reward.cachedImage.image) {
                context.drawImage(reward.cachedImage.image, reward.x, reward.y);
            }
        });
    }
    /**
   * Finds the first parent that is a ScreenView, so we can listen for its transform,
   * see https://github.com/phetsims/vegas/issues/4
   */ getScreenView() {
        return this.getUniqueTrail((node)=>node instanceof ScreenView).rootNode();
    }
    /**
   * Only initialize after being attached to the scene graph, since we must ascertain the local bounds are such that
   * they take up the global screen. Do not move the RewardNode in the scene graph after calling initialize.
   *
   * 1. Listen to the size of the scene/display.
   * 2. Record the trail between the scene and your CanvasNode, and
   * 3. Apply the inverse of that transform to the CanvasNode (whenever an ancestor's transform changes, or when the
   *    scene/display size changes).
   *
   * @jonathanolson said: For implementing now, I'd watch the iso transform, compute the inverse, and set bounds on
   * changes to be precise (since you need them anyways to draw).
   */ initialize() {
        const display = getGlobal('phet.joist.display');
        if (!this.isInitialized && this.getUniqueTrail().length > 0) {
            const uniqueTrail = this.getUniqueTrail();
            const indexOfScreenView = uniqueTrail.nodes.indexOf(this.getScreenView());
            const trailFromScreenViewToThis = uniqueTrail.slice(indexOfScreenView);
            // Listen to the bounds of the scene, so the canvas can be resized if the window is reshaped.
            const updateBounds = ()=>{
                assert && assert(this.getUniqueTrail().equals(uniqueTrail), 'Do not move the RewardNode in the scene graph after calling initialize or the transformation may break.');
                // These bounds represent the full window relative to the scene. It is transformed by the inverse of the
                // ScreenView's matrix (globalToLocalBounds) because the RewardNode is meant to fill the ScreenView. RewardNode
                // nodes are placed within these bounds.
                this.canvasDisplayBounds = trailFromScreenViewToThis.globalToLocalBounds(display.bounds);
                const local = this.globalToLocalBounds(display.bounds);
                this.setCanvasBounds(local);
            };
            this.transformTracker = new TransformTracker(uniqueTrail);
            this.transformTracker.addListener(updateBounds);
            // Set the initial bounds.
            updateBounds();
            // Initialize, now that we have bounds.
            this.rewardImages = this.nodes.map((node)=>{
                // Find the cachedImage that corresponds to the node
                const cachedImage = _.find(this.cachedImages, (cachedImage)=>cachedImage.node === node);
                const reward = {
                    cachedImage: cachedImage,
                    x: this.randomX(cachedImage.width),
                    y: this.randomY(cachedImage.height),
                    speed: (dotRandom.nextDouble() + 1) * MAX_SPEED
                };
                return reward;
            });
            this.isInitialized = true;
        }
    }
    /**
   * Selects a random X value for the image when it is created.
   */ randomX(nodeWidth) {
        return (dotRandom.nextDouble() * this.canvasDisplayBounds.width + this.canvasDisplayBounds.left) * this.scaleForResolution - nodeWidth / 2;
    }
    /**
   * Selects a random Y value for the image when it is created, or when it goes back to the top of the screen.
   * This start about 1 second off the top of the screen
   */ randomY(nodeHeight) {
        return this.canvasDisplayBounds.top - dotRandom.nextDouble() * this.canvasDisplayBounds.height * 2 - MAX_SPEED - nodeHeight;
    }
    /**
   * Animates the images.
   */ step(dt) {
        this.initialize();
        const maxY = this.canvasDisplayBounds.height * this.scaleForResolution;
        // Move all images.
        this.rewardImages.forEach((reward)=>{
            // Move each image straight down at constant speed.
            reward.y += reward.speed * dt;
            // Move back to the top after the image falls off the bottom.
            if (reward.y > maxY) {
                reward.x = this.randomX(reward.cachedImage.width);
                reward.y = this.randomY(reward.cachedImage.height);
            }
        });
        this.invalidatePaint();
    }
    /**
   * Convenience factory method to create an array of the specified Nodes in an even distribution.
   */ static createRandomNodes(nodes, count) {
        const array = [];
        for(let i = 0; i < count; i++){
            array.push(nodes[i % nodes.length]);
        }
        return array;
    }
    constructor(providedOptions){
        const options = optionize()({
            // SelfOptions
            nodes: null,
            scaleForResolution: 2,
            stepEmitter: null
        }, providedOptions);
        super(options);
        this.scaleForResolution = options.scaleForResolution;
        this.rewardImages = [];
        this.canvasDisplayBounds = new Bounds2(0, 0, 0, 0);
        this.transformTracker = null;
        this.isInitialized = false;
        this.stepEmitterListener = (dt)=>this.step(dt);
        options.stepEmitter && options.stepEmitter.addListener(this.stepEmitterListener);
        // Use the provided Nodes, or create defaults.
        this.nodes = options.nodes || RewardNode.createRandomNodes([
            new FaceNode(40, {
                headStroke: 'black',
                headLineWidth: 1.5
            }),
            new StarNode()
        ], 150);
        // For each unique Node, cache its rasterized image.
        this.cachedImages = _.uniq(this.nodes).map((node)=>{
            const cachedImage = {
                image: null,
                node: node,
                width: node.width,
                height: node.height
            };
            const parent = new Node({
                children: [
                    node
                ],
                scale: this.scaleForResolution
            });
            parent.toImage((image)=>{
                cachedImage.image = image;
                parent.dispose(); // not needed anymore, see https://github.com/phetsims/area-model-common/issues/128
            });
            return cachedImage;
        });
        this.initializer = ()=>this.initialize();
        phetioStateSetEmitter.addListener(this.initializer);
        this.disposeRewardNode = ()=>{
            options.stepEmitter && options.stepEmitter.removeListener(this.stepEmitterListener);
            this.transformTracker && this.transformTracker.dispose();
            phetioStateSetEmitter.removeListener(this.initializer);
        };
    }
};
export { RewardNode as default };
vegas.register('RewardNode', RewardNode);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3ZlZ2FzL2pzL1Jld2FyZE5vZGUudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTQtMjAyNCwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbi8qKlxuICogUmV3YXJkIG5vZGUgdGhhdCBzaG93cyBtYW55IG5vZGVzIGFuaW1hdGluZyBjb250aW51b3VzbHksIGZvciBmdW4hICBTaG93biB3aGVuIGEgcGVyZmVjdCBzY29yZSBpcyBhY2hpZXZlZCBpbiBhIGdhbWUuXG4gKiBZb3UgY2FuIGFsc28gdGVzdCB0aGlzIGJ5IHJ1bm5pbmcgdmVnYXMvdmVnYXNfZW4uaHRtbCBhbmQgY2xpY2tpbmcgb24gdGhlIFwiUmV3YXJkXCIgc2NyZWVuLlxuICogTm90ZSB0aGF0IHRoZSBudW1iZXIgb2YgaW1hZ2VzIGZhbGxpbmcgaXMgY29uc3RhbnQsIHNvIGlmIHRoZSBzY3JlZW4gaXMgc3RyZXRjaGVkIG91dCB2ZXJ0aWNhbGx5ICh0YWxsIHRoaW4gd2luZG93KVxuICogdGhleSB3aWxsIGJlIGxlc3MgZGVuc2UuXG4gKlxuICogVGhlcmUgYXJlIHR3byB3YXlzIHRvIHJ1biB0aGUgYW5pbWF0aW9uIHN0ZXAgZnVuY3Rpb24uICBUaGUgY2xpZW50IGNvZGUgY2FuIG1hbnVhbGx5IGNhbGwgc3RlcChkdCksIG9yIHRoZSBjbGllbnRcbiAqIGNvZGUgY2FuIHBhc3MgaW4gYW4gRXZlbnRzIGluc3RhbmNlIHRoYXQgdHJpZ2dlcnMgZXZlbnRzIG9uICdzdGVwJy4gSW4gdGhlIGxhdHRlciBjYXNlLCB0aGUgbGlzdGVuZXIgd2lsbFxuICogYXV0b21hdGljYWxseSBiZSByZW1vdmVkIHdoZW4gdGhlIGFuaW1hdGlvbiBpcyBjb21wbGV0ZS5cbiAqXG4gKiBGb3IgZGV0YWlscyBhYm91dCB0aGUgZGV2ZWxvcG1lbnQgb2YgdGhlIFJld2FyZE5vZGUsIHBsZWFzZSBzZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3ZlZ2FzL2lzc3Vlcy80XG4gKlxuICogQGF1dGhvciBTYW0gUmVpZCAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcbiAqL1xuXG5pbXBvcnQgeyBUUmVhZE9ubHlFbWl0dGVyIH0gZnJvbSAnLi4vLi4vYXhvbi9qcy9URW1pdHRlci5qcyc7XG5pbXBvcnQgQm91bmRzMiBmcm9tICcuLi8uLi9kb3QvanMvQm91bmRzMi5qcyc7XG5pbXBvcnQgZG90UmFuZG9tIGZyb20gJy4uLy4uL2RvdC9qcy9kb3RSYW5kb20uanMnO1xuaW1wb3J0IFNjcmVlblZpZXcgZnJvbSAnLi4vLi4vam9pc3QvanMvU2NyZWVuVmlldy5qcyc7XG5pbXBvcnQgZ2V0R2xvYmFsIGZyb20gJy4uLy4uL3BoZXQtY29yZS9qcy9nZXRHbG9iYWwuanMnO1xuaW1wb3J0IG9wdGlvbml6ZSBmcm9tICcuLi8uLi9waGV0LWNvcmUvanMvb3B0aW9uaXplLmpzJztcbmltcG9ydCBGYWNlTm9kZSBmcm9tICcuLi8uLi9zY2VuZXJ5LXBoZXQvanMvRmFjZU5vZGUuanMnO1xuaW1wb3J0IFN0YXJOb2RlIGZyb20gJy4uLy4uL3NjZW5lcnktcGhldC9qcy9TdGFyTm9kZS5qcyc7XG5pbXBvcnQgeyBDYW52YXNOb2RlLCBDYW52YXNOb2RlT3B0aW9ucywgRGlzcGxheSwgTm9kZSwgVHJhbnNmb3JtVHJhY2tlciB9IGZyb20gJy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XG5pbXBvcnQgcGhldGlvU3RhdGVTZXRFbWl0dGVyIGZyb20gJy4uLy4uL3RhbmRlbS9qcy9waGV0aW9TdGF0ZVNldEVtaXR0ZXIuanMnO1xuaW1wb3J0IHZlZ2FzIGZyb20gJy4vdmVnYXMuanMnO1xuXG4vLyBjb25zdGFudHNcbmNvbnN0IERFQlVHX0NBTlZBU19OT0RFX0JPVU5EUyA9IGZhbHNlOyAvLyBzaG93cyBhIGdyYXkgcmVjdGFuZ2xlIGZvciB0aGUgQ2FudmFzTm9kZSB0byBoZWxwIGVuc3VyZSB0aGF0IGl0cyBib3VuZHMgYXJlIGFjY3VyYXRlXG5jb25zdCBNQVhfU1BFRUQgPSAyMDA7IC8vIFRoZSBtYXhpbXVtIHNwZWVkIGFuIGltYWdlIGNhbiBmYWxsIGluIHNjcmVlbiBwaXhlbHMgcGVyIHNlY29uZC5cblxuLy8gRGF0YSBzdHJ1Y3R1cmUgdG8gaG9sZCBhIGNhY2hlZCBIVE1MSW1hZ2VFbGVtZW50IGFuZCBpdHMgYXNzb2NpYXRlZCBwcm9wZXJ0aWVzLlxudHlwZSBDYWNoZWRJbWFnZSA9IHtcblxuICAvLyBUaGUgaW1hZ2UgdG8gYmUgcmVuZGVyZWQgaW4gdGhlIGNhbnZhcywgdG8gYmUgZmlsbGVkIGluIGJ5IHRvSW1hZ2UgY2FsbGJhY2suXG4gIGltYWdlOiBIVE1MSW1hZ2VFbGVtZW50IHwgbnVsbDtcblxuICAvLyBOb2RlIHRoYXQgdGhlIGNhY2hlZCBpbWFnZXMgaXMgYXNzb2NpYXRlZCB3aXRoXG4gIG5vZGU6IE5vZGU7XG5cbiAgLy8gV2lkdGggYW5kIGhlaWdodCBvZiB0aGUgYXNzb2NpYXRlZCBOb2RlLCBzbyB0aGF0IGltYWdlIGNhbiBiZSBwb3NpdGlvbmVkIGJlZm9yZSB0aGUgdG9JbWFnZSBjYWxsIGhhcyBjb21wbGV0ZWQuXG4gIHdpZHRoOiBudW1iZXI7XG4gIGhlaWdodDogbnVtYmVyO1xufTtcblxuLy8gRGF0YSBzdHJ1Y3R1cmUgdGhhdCBkZXNjcmliZXMgZWFjaCBpbmRpdmlkdWFsIGltYWdlIHRoYXQgeW91IHNlZSBhbmltYXRpbmcuXG50eXBlIFJld2FyZEltYWdlID0ge1xuXG4gIC8vIERhdGEgc3RydWN0dXJlIHRoYXQgZGVzY3JpYmVzIHRoZSBpbWFnZSB0byByZW5kZXJcbiAgY2FjaGVkSW1hZ2U6IENhY2hlZEltYWdlO1xuXG4gIC8vIEN1cnJlbnQgeCBhbmQgeSBjb29yZGluYXRlcyBvZiB0aGUgaW1hZ2VcbiAgeDogbnVtYmVyO1xuICB5OiBudW1iZXI7XG5cbiAgLy8gUmFuZG9tIHNwZWVkIGF0IHdoaWNoIHRvIGFuaW1hdGUgdGhlIGltYWdlXG4gIHNwZWVkOiBudW1iZXI7XG59O1xuXG50eXBlIFNlbGZPcHRpb25zID0ge1xuXG4gIC8vIE5vZGVzIHRvIGFwcGVhciBpbiB0aGUgcmV3YXJkIG5vZGUuIFRoZXkgd2lsbCBiZSBjYWNoZWQgYXMgaW1hZ2VzIHRvIGltcHJvdmUgcGVyZm9ybWFuY2UuXG4gIC8vIElmIG51bGwsIHRoZW4gZGVmYXVsdCBOb2RlcyB3aWxsIGJlIGNyZWF0ZWQuXG4gIG5vZGVzPzogTm9kZVtdIHwgbnVsbDtcblxuICAvLyBTY2FsZSB0aGluZ3MgdXAgZm9yIHJhc3Rlcml6YXRpb24sIHRoZW4gYmFjayBkb3duIGZvciByZW5kZXJpbmcsIHNvIHRoZXkgaGF2ZSBuaWNlIHF1YWxpdHkgb24gcmV0aW5hIGRpc3BsYXlzLlxuICBzY2FsZUZvclJlc29sdXRpb24/OiBudW1iZXI7XG5cbiAgLy8gSWYgeW91IHBhc3MgaW4gYSBzdGVwRW1pdHRlciB7RW1pdHRlcn0sIGl0IHdpbGwgZHJpdmUgdGhlIGFuaW1hdGlvblxuICBzdGVwRW1pdHRlcj86IFRSZWFkT25seUVtaXR0ZXI8WyBudW1iZXIgXT4gfCBudWxsO1xufTtcblxuZXhwb3J0IHR5cGUgUmV3YXJkTm9kZU9wdGlvbnMgPSBTZWxmT3B0aW9ucyAmIENhbnZhc05vZGVPcHRpb25zO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBSZXdhcmROb2RlIGV4dGVuZHMgQ2FudmFzTm9kZSB7XG5cbiAgLy8gU2VlIFNlbGZPcHRpb25zLm5vZGVzXG4gIHByaXZhdGUgcmVhZG9ubHkgbm9kZXM6IE5vZGVbXTtcblxuICAvLyBTZWUgU2VsZk9wdGlvbnMuc2NhbGVGb3JSZXNvbHV0aW9uXG4gIHByaXZhdGUgcmVhZG9ubHkgc2NhbGVGb3JSZXNvbHV0aW9uOiBudW1iZXI7XG5cbiAgLy8gRGF0YSBzdHJ1Y3R1cmUgZm9yIGVhY2ggY2FjaGVkIGltYWdlLlxuICBwcml2YXRlIHJlYWRvbmx5IGNhY2hlZEltYWdlczogQ2FjaGVkSW1hZ2VbXTtcblxuICAvLyBEYXRhIHN0cnVjdHVyZSBmb3IgZWFjaCBpbWFnZSB0aGF0IGlzIGRyYXcgaW4gdGhlIHJld2FyZC4gU2V0IGJ5IGluaXRpYWxpemUsIHNvIGl0J3Mgbm90IHJlYWRvbmx5LlxuICBwcml2YXRlIHJld2FyZEltYWdlczogUmV3YXJkSW1hZ2VbXTtcblxuICAvLyBCb3VuZHMgaW4gd2hpY2ggdG8gcmVuZGVyIHRoZSBjYW52YXMsIHdoaWNoIHJlcHJlc2VudHMgdGhlIGZ1bGwgd2luZG93LiBTZWUgYmVsb3cgZm9yIGhvdyB0aGlzIGlzIGNvbXB1dGVkIGJhc2VkXG4gIC8vIG9uIFNjcmVlblZpZXcgYm91bmRzIGFuZCByZWxhdGl2ZSB0cmFuc2Zvcm1zLiBTZXQgYnkgaW5pdGlhbGl6ZSwgc28gaXQncyBub3QgcmVhZG9ubHkuXG4gIHByaXZhdGUgY2FudmFzRGlzcGxheUJvdW5kczogQm91bmRzMjtcblxuICAvLyBXaWxsIHdhdGNoIHRoZSB0cmFuc2Zvcm0gb2YgTm9kZXMgYWxvbmcgdGhlIFRyYWlsIHRvIHRoaXMgTm9kZSBzbyB0aGF0IHdlIGNhbiB1cGRhdGUgdGhlIGNhbnZhc0Rpc3BsYXlCb3VuZHNcbiAgLy8gd2hlbiB0aGUgUmV3YXJkTm9kZSBvciBhbnkgb2YgaXRzIGFuY2VzdG9ycyBoYXMgYSBjaGFuZ2UgaW4gdHJhbnNmb3JtLiBTZXQgYnkgaW5pdGlhbGl6ZSwgc28gaXQncyBub3QgcmVhZG9ubHkuXG4gIHByaXZhdGUgdHJhbnNmb3JtVHJhY2tlcjogVHJhbnNmb3JtVHJhY2tlciB8IG51bGw7XG5cbiAgLy8gU2V0IGJ5IGluaXRpYWxpemUsIHNvIG5vdCByZWFkb25seS5cbiAgcHJpdmF0ZSBpc0luaXRpYWxpemVkOiBib29sZWFuO1xuXG4gIC8vIElmIHlvdSBwcm92aWRlIFJld2FyZE5vZGVPcHRpb25zLnN0ZXBFbWl0dGVyLCBpdCB3aWxsIGNhbGwgdGhpcyBtZXRob2QgdG8gZHJpdmUgYW5pbWF0aW9uXG4gIHByaXZhdGUgcmVhZG9ubHkgc3RlcEVtaXR0ZXJMaXN0ZW5lcjogKCBkdDogbnVtYmVyICkgPT4gdm9pZDtcblxuICAvLyBGb3IgUGhFVC1pTyBicmFuZCBvbmx5OiBtYWtlIHN1cmUgdGhpcyBOb2RlIGlzIGluaXRpYWxpemVkIHdoZW4gc3RhdGUgaXMgYmVpbmcgc2V0IGZvciBQaEVULWlPXG4gIHByaXZhdGUgcmVhZG9ubHkgaW5pdGlhbGl6ZXI6ICgpID0+IHZvaWQ7XG5cbiAgcHJpdmF0ZSByZWFkb25seSBkaXNwb3NlUmV3YXJkTm9kZTogKCkgPT4gdm9pZDtcblxuICBwdWJsaWMgY29uc3RydWN0b3IoIHByb3ZpZGVkT3B0aW9ucz86IFJld2FyZE5vZGVPcHRpb25zICkge1xuXG4gICAgY29uc3Qgb3B0aW9ucyA9IG9wdGlvbml6ZTxSZXdhcmROb2RlT3B0aW9ucywgU2VsZk9wdGlvbnMsIENhbnZhc05vZGVPcHRpb25zPigpKCB7XG5cbiAgICAgIC8vIFNlbGZPcHRpb25zXG4gICAgICBub2RlczogbnVsbCxcbiAgICAgIHNjYWxlRm9yUmVzb2x1dGlvbjogMixcbiAgICAgIHN0ZXBFbWl0dGVyOiBudWxsXG4gICAgfSwgcHJvdmlkZWRPcHRpb25zICk7XG5cbiAgICBzdXBlciggb3B0aW9ucyApO1xuXG4gICAgdGhpcy5zY2FsZUZvclJlc29sdXRpb24gPSBvcHRpb25zLnNjYWxlRm9yUmVzb2x1dGlvbjtcbiAgICB0aGlzLnJld2FyZEltYWdlcyA9IFtdO1xuICAgIHRoaXMuY2FudmFzRGlzcGxheUJvdW5kcyA9IG5ldyBCb3VuZHMyKCAwLCAwLCAwLCAwICk7XG4gICAgdGhpcy50cmFuc2Zvcm1UcmFja2VyID0gbnVsbDtcbiAgICB0aGlzLmlzSW5pdGlhbGl6ZWQgPSBmYWxzZTtcblxuICAgIHRoaXMuc3RlcEVtaXR0ZXJMaXN0ZW5lciA9ICggZHQ6IG51bWJlciApID0+IHRoaXMuc3RlcCggZHQgKTtcbiAgICBvcHRpb25zLnN0ZXBFbWl0dGVyICYmIG9wdGlvbnMuc3RlcEVtaXR0ZXIuYWRkTGlzdGVuZXIoIHRoaXMuc3RlcEVtaXR0ZXJMaXN0ZW5lciApO1xuXG4gICAgLy8gVXNlIHRoZSBwcm92aWRlZCBOb2Rlcywgb3IgY3JlYXRlIGRlZmF1bHRzLlxuICAgIHRoaXMubm9kZXMgPSBvcHRpb25zLm5vZGVzIHx8IFJld2FyZE5vZGUuY3JlYXRlUmFuZG9tTm9kZXMoIFtcbiAgICAgIG5ldyBGYWNlTm9kZSggNDAsIHsgaGVhZFN0cm9rZTogJ2JsYWNrJywgaGVhZExpbmVXaWR0aDogMS41IH0gKSxcbiAgICAgIG5ldyBTdGFyTm9kZSgpXG4gICAgXSwgMTUwICk7XG5cbiAgICAvLyBGb3IgZWFjaCB1bmlxdWUgTm9kZSwgY2FjaGUgaXRzIHJhc3Rlcml6ZWQgaW1hZ2UuXG4gICAgdGhpcy5jYWNoZWRJbWFnZXMgPSBfLnVuaXEoIHRoaXMubm9kZXMgKS5tYXAoIG5vZGUgPT4ge1xuXG4gICAgICBjb25zdCBjYWNoZWRJbWFnZTogQ2FjaGVkSW1hZ2UgPSB7XG4gICAgICAgIGltYWdlOiBudWxsLFxuICAgICAgICBub2RlOiBub2RlLFxuICAgICAgICB3aWR0aDogbm9kZS53aWR0aCxcbiAgICAgICAgaGVpZ2h0OiBub2RlLmhlaWdodFxuICAgICAgfTtcblxuICAgICAgY29uc3QgcGFyZW50ID0gbmV3IE5vZGUoIHtcbiAgICAgICAgY2hpbGRyZW46IFsgbm9kZSBdLFxuICAgICAgICBzY2FsZTogdGhpcy5zY2FsZUZvclJlc29sdXRpb25cbiAgICAgIH0gKTtcblxuICAgICAgcGFyZW50LnRvSW1hZ2UoIGltYWdlID0+IHtcbiAgICAgICAgY2FjaGVkSW1hZ2UuaW1hZ2UgPSBpbWFnZTtcbiAgICAgICAgcGFyZW50LmRpc3Bvc2UoKTsgLy8gbm90IG5lZWRlZCBhbnltb3JlLCBzZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2FyZWEtbW9kZWwtY29tbW9uL2lzc3Vlcy8xMjhcbiAgICAgIH0gKTtcblxuICAgICAgcmV0dXJuIGNhY2hlZEltYWdlO1xuICAgIH0gKTtcblxuICAgIHRoaXMuaW5pdGlhbGl6ZXIgPSAoKSA9PiB0aGlzLmluaXRpYWxpemUoKTtcbiAgICBwaGV0aW9TdGF0ZVNldEVtaXR0ZXIuYWRkTGlzdGVuZXIoIHRoaXMuaW5pdGlhbGl6ZXIgKTtcblxuICAgIHRoaXMuZGlzcG9zZVJld2FyZE5vZGUgPSAoKSA9PiB7XG4gICAgICBvcHRpb25zLnN0ZXBFbWl0dGVyICYmIG9wdGlvbnMuc3RlcEVtaXR0ZXIucmVtb3ZlTGlzdGVuZXIoIHRoaXMuc3RlcEVtaXR0ZXJMaXN0ZW5lciApO1xuICAgICAgdGhpcy50cmFuc2Zvcm1UcmFja2VyICYmIHRoaXMudHJhbnNmb3JtVHJhY2tlci5kaXNwb3NlKCk7XG4gICAgICBwaGV0aW9TdGF0ZVNldEVtaXR0ZXIucmVtb3ZlTGlzdGVuZXIoIHRoaXMuaW5pdGlhbGl6ZXIgKTtcbiAgICB9O1xuICB9XG5cbiAgcHVibGljIG92ZXJyaWRlIGRpc3Bvc2UoKTogdm9pZCB7XG4gICAgdGhpcy5kaXNwb3NlUmV3YXJkTm9kZSgpO1xuICAgIHN1cGVyLmRpc3Bvc2UoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBQYWludCB0aGUgcmV3YXJkcyBvbiB0aGUgY2FudmFzLlxuICAgKi9cbiAgcHVibGljIHBhaW50Q2FudmFzKCBjb250ZXh0OiBDYW52YXNSZW5kZXJpbmdDb250ZXh0MkQgKTogdm9pZCB7XG5cbiAgICAvLyBJZiB0aGUgZGVidWdnaW5nIGZsYWcgaXMgb24sIHNob3cgdGhlIGJvdW5kcyBvZiB0aGUgY2FudmFzXG4gICAgaWYgKCBERUJVR19DQU5WQVNfTk9ERV9CT1VORFMgKSB7XG4gICAgICBjb25zdCBib3VuZHMgPSB0aGlzLmNhbnZhc0Rpc3BsYXlCb3VuZHM7XG5cbiAgICAgIC8vIEZpbGwgdGhlIGNhbnZhcyB3aXRoIGdyYXlcbiAgICAgIGNvbnRleHQuZmlsbFN0eWxlID0gJ3JnYmEoNTAsNTAsNTAsMC41KSc7XG4gICAgICBjb250ZXh0LmZpbGxSZWN0KCBib3VuZHMubWluWCwgYm91bmRzLm1pblksIGJvdW5kcy53aWR0aCwgYm91bmRzLmhlaWdodCApO1xuXG4gICAgICAvLyBTdHJva2UgdGhlIGNhbnZhcyBib3JkZXIgd2l0aCBibHVlXG4gICAgICBjb250ZXh0LnN0cm9rZVN0eWxlID0gJyMwMDAwZmYnO1xuICAgICAgY29udGV4dC5saW5lV2lkdGggPSA1O1xuICAgICAgY29udGV4dC5zdHJva2VSZWN0KCBib3VuZHMubWluWCwgYm91bmRzLm1pblksIGJvdW5kcy53aWR0aCwgYm91bmRzLmhlaWdodCApO1xuICAgIH1cblxuICAgIGNvbnRleHQuc2NhbGUoIDEgLyB0aGlzLnNjYWxlRm9yUmVzb2x1dGlvbiwgMSAvIHRoaXMuc2NhbGVGb3JSZXNvbHV0aW9uICk7XG5cbiAgICAvLyBEaXNwbGF5IHRoZSByZXdhcmRzLlxuICAgIHRoaXMucmV3YXJkSW1hZ2VzLmZvckVhY2goIHJld2FyZCA9PiB7XG4gICAgICBpZiAoIHJld2FyZC5jYWNoZWRJbWFnZS5pbWFnZSApIHtcbiAgICAgICAgY29udGV4dC5kcmF3SW1hZ2UoIHJld2FyZC5jYWNoZWRJbWFnZS5pbWFnZSwgcmV3YXJkLngsIHJld2FyZC55ICk7XG4gICAgICB9XG4gICAgfSApO1xuICB9XG5cbiAgLyoqXG4gICAqIEZpbmRzIHRoZSBmaXJzdCBwYXJlbnQgdGhhdCBpcyBhIFNjcmVlblZpZXcsIHNvIHdlIGNhbiBsaXN0ZW4gZm9yIGl0cyB0cmFuc2Zvcm0sXG4gICAqIHNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvdmVnYXMvaXNzdWVzLzRcbiAgICovXG4gIHByaXZhdGUgZ2V0U2NyZWVuVmlldygpOiBOb2RlIHtcbiAgICByZXR1cm4gdGhpcy5nZXRVbmlxdWVUcmFpbCggbm9kZSA9PiBub2RlIGluc3RhbmNlb2YgU2NyZWVuVmlldyApLnJvb3ROb2RlKCk7XG4gIH1cblxuICAvKipcbiAgICogT25seSBpbml0aWFsaXplIGFmdGVyIGJlaW5nIGF0dGFjaGVkIHRvIHRoZSBzY2VuZSBncmFwaCwgc2luY2Ugd2UgbXVzdCBhc2NlcnRhaW4gdGhlIGxvY2FsIGJvdW5kcyBhcmUgc3VjaCB0aGF0XG4gICAqIHRoZXkgdGFrZSB1cCB0aGUgZ2xvYmFsIHNjcmVlbi4gRG8gbm90IG1vdmUgdGhlIFJld2FyZE5vZGUgaW4gdGhlIHNjZW5lIGdyYXBoIGFmdGVyIGNhbGxpbmcgaW5pdGlhbGl6ZS5cbiAgICpcbiAgICogMS4gTGlzdGVuIHRvIHRoZSBzaXplIG9mIHRoZSBzY2VuZS9kaXNwbGF5LlxuICAgKiAyLiBSZWNvcmQgdGhlIHRyYWlsIGJldHdlZW4gdGhlIHNjZW5lIGFuZCB5b3VyIENhbnZhc05vZGUsIGFuZFxuICAgKiAzLiBBcHBseSB0aGUgaW52ZXJzZSBvZiB0aGF0IHRyYW5zZm9ybSB0byB0aGUgQ2FudmFzTm9kZSAod2hlbmV2ZXIgYW4gYW5jZXN0b3IncyB0cmFuc2Zvcm0gY2hhbmdlcywgb3Igd2hlbiB0aGVcbiAgICogICAgc2NlbmUvZGlzcGxheSBzaXplIGNoYW5nZXMpLlxuICAgKlxuICAgKiBAam9uYXRoYW5vbHNvbiBzYWlkOiBGb3IgaW1wbGVtZW50aW5nIG5vdywgSSdkIHdhdGNoIHRoZSBpc28gdHJhbnNmb3JtLCBjb21wdXRlIHRoZSBpbnZlcnNlLCBhbmQgc2V0IGJvdW5kcyBvblxuICAgKiBjaGFuZ2VzIHRvIGJlIHByZWNpc2UgKHNpbmNlIHlvdSBuZWVkIHRoZW0gYW55d2F5cyB0byBkcmF3KS5cbiAgICovXG4gIHByaXZhdGUgaW5pdGlhbGl6ZSgpOiB2b2lkIHtcblxuICAgIGNvbnN0IGRpc3BsYXk6IERpc3BsYXkgPSBnZXRHbG9iYWwoICdwaGV0LmpvaXN0LmRpc3BsYXknICk7XG5cbiAgICBpZiAoICF0aGlzLmlzSW5pdGlhbGl6ZWQgJiYgdGhpcy5nZXRVbmlxdWVUcmFpbCgpLmxlbmd0aCA+IDAgKSB7XG5cbiAgICAgIGNvbnN0IHVuaXF1ZVRyYWlsID0gdGhpcy5nZXRVbmlxdWVUcmFpbCgpO1xuICAgICAgY29uc3QgaW5kZXhPZlNjcmVlblZpZXcgPSB1bmlxdWVUcmFpbC5ub2Rlcy5pbmRleE9mKCB0aGlzLmdldFNjcmVlblZpZXcoKSApO1xuICAgICAgY29uc3QgdHJhaWxGcm9tU2NyZWVuVmlld1RvVGhpcyA9IHVuaXF1ZVRyYWlsLnNsaWNlKCBpbmRleE9mU2NyZWVuVmlldyApO1xuXG4gICAgICAvLyBMaXN0ZW4gdG8gdGhlIGJvdW5kcyBvZiB0aGUgc2NlbmUsIHNvIHRoZSBjYW52YXMgY2FuIGJlIHJlc2l6ZWQgaWYgdGhlIHdpbmRvdyBpcyByZXNoYXBlZC5cbiAgICAgIGNvbnN0IHVwZGF0ZUJvdW5kcyA9ICgpID0+IHtcbiAgICAgICAgYXNzZXJ0ICYmIGFzc2VydCggdGhpcy5nZXRVbmlxdWVUcmFpbCgpLmVxdWFscyggdW5pcXVlVHJhaWwgKSxcbiAgICAgICAgICAnRG8gbm90IG1vdmUgdGhlIFJld2FyZE5vZGUgaW4gdGhlIHNjZW5lIGdyYXBoIGFmdGVyIGNhbGxpbmcgaW5pdGlhbGl6ZSBvciB0aGUgdHJhbnNmb3JtYXRpb24gbWF5IGJyZWFrLicgKTtcblxuICAgICAgICAvLyBUaGVzZSBib3VuZHMgcmVwcmVzZW50IHRoZSBmdWxsIHdpbmRvdyByZWxhdGl2ZSB0byB0aGUgc2NlbmUuIEl0IGlzIHRyYW5zZm9ybWVkIGJ5IHRoZSBpbnZlcnNlIG9mIHRoZVxuICAgICAgICAvLyBTY3JlZW5WaWV3J3MgbWF0cml4IChnbG9iYWxUb0xvY2FsQm91bmRzKSBiZWNhdXNlIHRoZSBSZXdhcmROb2RlIGlzIG1lYW50IHRvIGZpbGwgdGhlIFNjcmVlblZpZXcuIFJld2FyZE5vZGVcbiAgICAgICAgLy8gbm9kZXMgYXJlIHBsYWNlZCB3aXRoaW4gdGhlc2UgYm91bmRzLlxuICAgICAgICB0aGlzLmNhbnZhc0Rpc3BsYXlCb3VuZHMgPSB0cmFpbEZyb21TY3JlZW5WaWV3VG9UaGlzLmdsb2JhbFRvTG9jYWxCb3VuZHMoIGRpc3BsYXkuYm91bmRzICk7XG5cbiAgICAgICAgY29uc3QgbG9jYWwgPSB0aGlzLmdsb2JhbFRvTG9jYWxCb3VuZHMoIGRpc3BsYXkuYm91bmRzICk7XG4gICAgICAgIHRoaXMuc2V0Q2FudmFzQm91bmRzKCBsb2NhbCApO1xuICAgICAgfTtcblxuICAgICAgdGhpcy50cmFuc2Zvcm1UcmFja2VyID0gbmV3IFRyYW5zZm9ybVRyYWNrZXIoIHVuaXF1ZVRyYWlsICk7XG4gICAgICB0aGlzLnRyYW5zZm9ybVRyYWNrZXIuYWRkTGlzdGVuZXIoIHVwZGF0ZUJvdW5kcyApO1xuXG4gICAgICAvLyBTZXQgdGhlIGluaXRpYWwgYm91bmRzLlxuICAgICAgdXBkYXRlQm91bmRzKCk7XG5cbiAgICAgIC8vIEluaXRpYWxpemUsIG5vdyB0aGF0IHdlIGhhdmUgYm91bmRzLlxuICAgICAgdGhpcy5yZXdhcmRJbWFnZXMgPSB0aGlzLm5vZGVzLm1hcCggbm9kZSA9PiB7XG5cbiAgICAgICAgLy8gRmluZCB0aGUgY2FjaGVkSW1hZ2UgdGhhdCBjb3JyZXNwb25kcyB0byB0aGUgbm9kZVxuICAgICAgICBjb25zdCBjYWNoZWRJbWFnZSA9IF8uZmluZCggdGhpcy5jYWNoZWRJbWFnZXMsIGNhY2hlZEltYWdlID0+IGNhY2hlZEltYWdlLm5vZGUgPT09IG5vZGUgKSE7XG5cbiAgICAgICAgY29uc3QgcmV3YXJkOiBSZXdhcmRJbWFnZSA9IHtcbiAgICAgICAgICBjYWNoZWRJbWFnZTogY2FjaGVkSW1hZ2UsXG4gICAgICAgICAgeDogdGhpcy5yYW5kb21YKCBjYWNoZWRJbWFnZS53aWR0aCApLFxuICAgICAgICAgIHk6IHRoaXMucmFuZG9tWSggY2FjaGVkSW1hZ2UuaGVpZ2h0ICksXG4gICAgICAgICAgc3BlZWQ6ICggZG90UmFuZG9tLm5leHREb3VibGUoKSArIDEgKSAqIE1BWF9TUEVFRFxuICAgICAgICB9O1xuXG4gICAgICAgIHJldHVybiByZXdhcmQ7XG4gICAgICB9ICk7XG5cbiAgICAgIHRoaXMuaXNJbml0aWFsaXplZCA9IHRydWU7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFNlbGVjdHMgYSByYW5kb20gWCB2YWx1ZSBmb3IgdGhlIGltYWdlIHdoZW4gaXQgaXMgY3JlYXRlZC5cbiAgICovXG4gIHByaXZhdGUgcmFuZG9tWCggbm9kZVdpZHRoOiBudW1iZXIgKTogbnVtYmVyIHtcbiAgICByZXR1cm4gKCBkb3RSYW5kb20ubmV4dERvdWJsZSgpICogdGhpcy5jYW52YXNEaXNwbGF5Qm91bmRzLndpZHRoICsgdGhpcy5jYW52YXNEaXNwbGF5Qm91bmRzLmxlZnQgKSAqXG4gICAgICAgICAgIHRoaXMuc2NhbGVGb3JSZXNvbHV0aW9uIC0gbm9kZVdpZHRoIC8gMjtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZWxlY3RzIGEgcmFuZG9tIFkgdmFsdWUgZm9yIHRoZSBpbWFnZSB3aGVuIGl0IGlzIGNyZWF0ZWQsIG9yIHdoZW4gaXQgZ29lcyBiYWNrIHRvIHRoZSB0b3Agb2YgdGhlIHNjcmVlbi5cbiAgICogVGhpcyBzdGFydCBhYm91dCAxIHNlY29uZCBvZmYgdGhlIHRvcCBvZiB0aGUgc2NyZWVuXG4gICAqL1xuICBwcml2YXRlIHJhbmRvbVkoIG5vZGVIZWlnaHQ6IG51bWJlciApOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLmNhbnZhc0Rpc3BsYXlCb3VuZHMudG9wIC0gZG90UmFuZG9tLm5leHREb3VibGUoKSAqIHRoaXMuY2FudmFzRGlzcGxheUJvdW5kcy5oZWlnaHQgKiAyIC1cbiAgICAgICAgICAgTUFYX1NQRUVEIC0gbm9kZUhlaWdodDtcbiAgfVxuXG4gIC8qKlxuICAgKiBBbmltYXRlcyB0aGUgaW1hZ2VzLlxuICAgKi9cbiAgcHVibGljIHN0ZXAoIGR0OiBudW1iZXIgKTogdm9pZCB7XG4gICAgdGhpcy5pbml0aWFsaXplKCk7XG5cbiAgICBjb25zdCBtYXhZID0gdGhpcy5jYW52YXNEaXNwbGF5Qm91bmRzLmhlaWdodCAqIHRoaXMuc2NhbGVGb3JSZXNvbHV0aW9uO1xuXG4gICAgLy8gTW92ZSBhbGwgaW1hZ2VzLlxuICAgIHRoaXMucmV3YXJkSW1hZ2VzLmZvckVhY2goIHJld2FyZCA9PiB7XG5cbiAgICAgIC8vIE1vdmUgZWFjaCBpbWFnZSBzdHJhaWdodCBkb3duIGF0IGNvbnN0YW50IHNwZWVkLlxuICAgICAgcmV3YXJkLnkgKz0gcmV3YXJkLnNwZWVkICogZHQ7XG5cbiAgICAgIC8vIE1vdmUgYmFjayB0byB0aGUgdG9wIGFmdGVyIHRoZSBpbWFnZSBmYWxscyBvZmYgdGhlIGJvdHRvbS5cbiAgICAgIGlmICggcmV3YXJkLnkgPiBtYXhZICkge1xuICAgICAgICByZXdhcmQueCA9IHRoaXMucmFuZG9tWCggcmV3YXJkLmNhY2hlZEltYWdlLndpZHRoICk7XG4gICAgICAgIHJld2FyZC55ID0gdGhpcy5yYW5kb21ZKCByZXdhcmQuY2FjaGVkSW1hZ2UuaGVpZ2h0ICk7XG4gICAgICB9XG4gICAgfSApO1xuXG4gICAgdGhpcy5pbnZhbGlkYXRlUGFpbnQoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDb252ZW5pZW5jZSBmYWN0b3J5IG1ldGhvZCB0byBjcmVhdGUgYW4gYXJyYXkgb2YgdGhlIHNwZWNpZmllZCBOb2RlcyBpbiBhbiBldmVuIGRpc3RyaWJ1dGlvbi5cbiAgICovXG4gIHB1YmxpYyBzdGF0aWMgY3JlYXRlUmFuZG9tTm9kZXMoIG5vZGVzOiBOb2RlW10sIGNvdW50OiBudW1iZXIgKTogTm9kZVtdIHtcbiAgICBjb25zdCBhcnJheSA9IFtdO1xuICAgIGZvciAoIGxldCBpID0gMDsgaSA8IGNvdW50OyBpKysgKSB7XG4gICAgICBhcnJheS5wdXNoKCBub2Rlc1sgaSAlIG5vZGVzLmxlbmd0aCBdICk7XG4gICAgfVxuICAgIHJldHVybiBhcnJheTtcbiAgfVxufVxuXG52ZWdhcy5yZWdpc3RlciggJ1Jld2FyZE5vZGUnLCBSZXdhcmROb2RlICk7Il0sIm5hbWVzIjpbIkJvdW5kczIiLCJkb3RSYW5kb20iLCJTY3JlZW5WaWV3IiwiZ2V0R2xvYmFsIiwib3B0aW9uaXplIiwiRmFjZU5vZGUiLCJTdGFyTm9kZSIsIkNhbnZhc05vZGUiLCJOb2RlIiwiVHJhbnNmb3JtVHJhY2tlciIsInBoZXRpb1N0YXRlU2V0RW1pdHRlciIsInZlZ2FzIiwiREVCVUdfQ0FOVkFTX05PREVfQk9VTkRTIiwiTUFYX1NQRUVEIiwiUmV3YXJkTm9kZSIsImRpc3Bvc2UiLCJkaXNwb3NlUmV3YXJkTm9kZSIsInBhaW50Q2FudmFzIiwiY29udGV4dCIsImJvdW5kcyIsImNhbnZhc0Rpc3BsYXlCb3VuZHMiLCJmaWxsU3R5bGUiLCJmaWxsUmVjdCIsIm1pblgiLCJtaW5ZIiwid2lkdGgiLCJoZWlnaHQiLCJzdHJva2VTdHlsZSIsImxpbmVXaWR0aCIsInN0cm9rZVJlY3QiLCJzY2FsZSIsInNjYWxlRm9yUmVzb2x1dGlvbiIsInJld2FyZEltYWdlcyIsImZvckVhY2giLCJyZXdhcmQiLCJjYWNoZWRJbWFnZSIsImltYWdlIiwiZHJhd0ltYWdlIiwieCIsInkiLCJnZXRTY3JlZW5WaWV3IiwiZ2V0VW5pcXVlVHJhaWwiLCJub2RlIiwicm9vdE5vZGUiLCJpbml0aWFsaXplIiwiZGlzcGxheSIsImlzSW5pdGlhbGl6ZWQiLCJsZW5ndGgiLCJ1bmlxdWVUcmFpbCIsImluZGV4T2ZTY3JlZW5WaWV3Iiwibm9kZXMiLCJpbmRleE9mIiwidHJhaWxGcm9tU2NyZWVuVmlld1RvVGhpcyIsInNsaWNlIiwidXBkYXRlQm91bmRzIiwiYXNzZXJ0IiwiZXF1YWxzIiwiZ2xvYmFsVG9Mb2NhbEJvdW5kcyIsImxvY2FsIiwic2V0Q2FudmFzQm91bmRzIiwidHJhbnNmb3JtVHJhY2tlciIsImFkZExpc3RlbmVyIiwibWFwIiwiXyIsImZpbmQiLCJjYWNoZWRJbWFnZXMiLCJyYW5kb21YIiwicmFuZG9tWSIsInNwZWVkIiwibmV4dERvdWJsZSIsIm5vZGVXaWR0aCIsImxlZnQiLCJub2RlSGVpZ2h0IiwidG9wIiwic3RlcCIsImR0IiwibWF4WSIsImludmFsaWRhdGVQYWludCIsImNyZWF0ZVJhbmRvbU5vZGVzIiwiY291bnQiLCJhcnJheSIsImkiLCJwdXNoIiwicHJvdmlkZWRPcHRpb25zIiwib3B0aW9ucyIsInN0ZXBFbWl0dGVyIiwic3RlcEVtaXR0ZXJMaXN0ZW5lciIsImhlYWRTdHJva2UiLCJoZWFkTGluZVdpZHRoIiwidW5pcSIsInBhcmVudCIsImNoaWxkcmVuIiwidG9JbWFnZSIs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