// Copyright 2022-2023, University of Colorado Boulder
/**
 * Demo for Sprites
 *
 * @author Jonathan Olson
 */ import NumberProperty from '../../../../axon/js/NumberProperty.js';
import stepTimer from '../../../../axon/js/stepTimer.js';
import Bounds2 from '../../../../dot/js/Bounds2.js';
import dotRandom from '../../../../dot/js/dotRandom.js';
import Range from '../../../../dot/js/Range.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import arrayRemove from '../../../../phet-core/js/arrayRemove.js';
import { DragListener, Node, Rectangle, Sprite, SpriteImage, SpriteInstance, SpriteListenable, Sprites, VBox } from '../../../../scenery/js/imports.js';
import Panel from '../../../../sun/js/Panel.js';
import flame_png from '../../../images/flame_png.js';
import iceCubeStack_png from '../../../images/iceCubeStack_png.js';
import measuringTape_png from '../../../images/measuringTape_png.js';
import NumberControl from '../../NumberControl.js';
export default function demoSprites(layoutBounds) {
    const spriteCountProperty = new NumberProperty(500, {
        range: new Range(0, 10000)
    });
    const spriteSpeedProperty = new NumberProperty(15, {
        range: new Range(0, 100)
    });
    const spriteScaleProperty = new NumberProperty(0.5, {
        range: new Range(0.01, 1)
    });
    const getAvailableWidth = ()=>layoutBounds.width / spriteScaleProperty.value;
    const getAvailableHeight = ()=>layoutBounds.height / spriteScaleProperty.value;
    // SpriteImage references
    const flameSpriteImage = new SpriteImage(flame_png, new Vector2(44, 42), {
        hitTestPixels: true
    });
    const measuringTapeSpriteImage = new SpriteImage(measuringTape_png, new Vector2(50, 40), {
        hitTestPixels: true
    });
    const iceCubeStackSpriteImage = new SpriteImage(iceCubeStack_png, new Vector2(25, 25), {
        hitTestPixels: true
    });
    // Example of how to create a SpriteImage from a non-HTMLImageElement, as recommended by @jonathanolson
    // in https://github.com/phetsims/beers-law-lab/issues/276#issuecomment-1347071650
    // Add additional parameters for the toCanvas callback if you need resolution scaling.
    const particleRectangle = new Rectangle(0, 0, 50, 50, {
        fill: 'red',
        stroke: 'black'
    });
    let particleSpriteImage;
    particleRectangle.toCanvas((canvas)=>{
        particleSpriteImage = new SpriteImage(canvas, particleRectangle.center);
    });
    // Sprites
    const sprite0 = new Sprite(flameSpriteImage);
    const sprite1 = new Sprite(measuringTapeSpriteImage);
    const sprite2 = new Sprite(iceCubeStackSpriteImage);
    const sprite3 = new Sprite(particleSpriteImage);
    const createSpriteInstance = ()=>{
        const instance = SpriteInstance.pool.create();
        instance.sprite = dotRandom.sample([
            sprite0,
            sprite1,
            sprite2,
            sprite3
        ]);
        instance.matrix.setToTranslation(dotRandom.nextDouble() * getAvailableWidth(), dotRandom.nextDouble() * getAvailableHeight());
        // Put a custom velocity on each one
        instance.velocity = Vector2.createPolar(1, dotRandom.nextDouble() * 2 * Math.PI);
        return instance;
    };
    // We'll hold our SpriteInstances here in this array (the reference to this exact array will be used)
    const instances = _.range(0, spriteCountProperty.value).map(createSpriteInstance);
    // Adjust sprite count dynamically
    spriteCountProperty.lazyLink((value, oldValue)=>{
        const delta = value - oldValue;
        if (delta > 0) {
            _.range(0, delta).forEach(()=>instances.push(createSpriteInstance()));
        } else {
            _.range(0, -delta).forEach(()=>instances.pop());
        }
    });
    let selectedInstance = null;
    // Create the 'Sprites' node
    const sprites = new Sprites({
        // The sprites we have available (fixed, won't change)
        sprites: [
            sprite0,
            sprite1,
            sprite2,
            sprite3
        ],
        spriteInstances: instances,
        canvasBounds: layoutBounds.dilated(200),
        hitTestSprites: true,
        cursor: 'pointer',
        // Mix in SpriteListenable, so we (a) have access to the SpriteInstance and (b) will only interact when there is one
        inputListeners: [
            new (SpriteListenable(DragListener))({
                applyOffset: false,
                start: (event, listener)=>{
                    const myListener = listener;
                    selectedInstance = myListener.spriteInstance;
                    // e.g. moveToFront
                    arrayRemove(instances, selectedInstance);
                    instances.push(selectedInstance);
                },
                drag: (event, listener)=>{
                    // translate the selected instance
                    const matrix = selectedInstance.matrix;
                    matrix.set02(matrix.m02() + listener.modelDelta.x / spriteScaleProperty.value);
                    matrix.set12(matrix.m12() + listener.modelDelta.y / spriteScaleProperty.value);
                    sprites.invalidatePaint();
                },
                end: ()=>{
                    selectedInstance = null;
                }
            })
        ]
    });
    spriteScaleProperty.link((scale, oldScale)=>{
        sprites.setScaleMagnitude(scale, scale);
        sprites.canvasBounds = Bounds2.rect(0, 0, getAvailableWidth(), getAvailableHeight()).dilated(200);
        // rescale positions
        if (oldScale) {
            instances.forEach((instance)=>{
                instance.matrix.set02(instance.matrix.m02() * oldScale / scale);
                instance.matrix.set12(instance.matrix.m12() * oldScale / scale);
            });
        }
    });
    sprites.invalidatePaint();
    const listener = (dt)=>{
        const distance = dt * spriteSpeedProperty.value / spriteScaleProperty.value;
        const width = getAvailableWidth();
        const height = getAvailableHeight();
        for(let i = instances.length - 1; i >= 0; i--){
            const instance = instances[i];
            if (instance !== selectedInstance) {
                const matrix = instance.matrix;
                // Optimized translation
                matrix.set02((matrix.m02() + instance.velocity.x * distance + width) % width);
                matrix.set12((matrix.m12() + instance.velocity.y * distance + height) % height);
            }
        }
        // We modified our instances, so we need this to repaint
        sprites.invalidatePaint();
    };
    stepTimer.addListener(listener);
    sprites.dispose = ()=>{
        stepTimer.removeListener(listener);
        Node.prototype.dispose.call(node);
    };
    const controlPanel = new Panel(new VBox({
        spacing: 10,
        children: [
            new NumberControl('Sprite Count:', spriteCountProperty, spriteCountProperty.range),
            new NumberControl('Sprite Speed:', spriteSpeedProperty, spriteSpeedProperty.range),
            new NumberControl('Sprite Scale:', spriteScaleProperty, spriteScaleProperty.range, {
                delta: 0.01,
                numberDisplayOptions: {
                    decimalPlaces: 2
                }
            })
        ]
    }), {
        bottom: layoutBounds.bottom - 10,
        right: layoutBounds.right - 10
    });
    const node = new Node({
        children: [
            sprites,
            controlPanel
        ]
    });
    return node;
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9kZW1vL2NvbXBvbmVudHMvZGVtb1Nwcml0ZXMudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjItMjAyMywgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbi8qKlxuICogRGVtbyBmb3IgU3ByaXRlc1xuICpcbiAqIEBhdXRob3IgSm9uYXRoYW4gT2xzb25cbiAqL1xuXG5pbXBvcnQgTnVtYmVyUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9OdW1iZXJQcm9wZXJ0eS5qcyc7XG5pbXBvcnQgc3RlcFRpbWVyIGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvc3RlcFRpbWVyLmpzJztcbmltcG9ydCBCb3VuZHMyIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9Cb3VuZHMyLmpzJztcbmltcG9ydCBkb3RSYW5kb20gZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL2RvdFJhbmRvbS5qcyc7XG5pbXBvcnQgUmFuZ2UgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL1JhbmdlLmpzJztcbmltcG9ydCBWZWN0b3IyIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9WZWN0b3IyLmpzJztcbmltcG9ydCBhcnJheVJlbW92ZSBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvYXJyYXlSZW1vdmUuanMnO1xuaW1wb3J0IHsgRHJhZ0xpc3RlbmVyLCBOb2RlLCBQcmVzc2VkRHJhZ0xpc3RlbmVyLCBSZWN0YW5nbGUsIFNwcml0ZSwgU3ByaXRlSW1hZ2UsIFNwcml0ZUluc3RhbmNlLCBTcHJpdGVMaXN0ZW5hYmxlLCBTcHJpdGVzLCBWQm94IH0gZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcbmltcG9ydCBQYW5lbCBmcm9tICcuLi8uLi8uLi8uLi9zdW4vanMvUGFuZWwuanMnO1xuaW1wb3J0IGZsYW1lX3BuZyBmcm9tICcuLi8uLi8uLi9pbWFnZXMvZmxhbWVfcG5nLmpzJztcbmltcG9ydCBpY2VDdWJlU3RhY2tfcG5nIGZyb20gJy4uLy4uLy4uL2ltYWdlcy9pY2VDdWJlU3RhY2tfcG5nLmpzJztcbmltcG9ydCBtZWFzdXJpbmdUYXBlX3BuZyBmcm9tICcuLi8uLi8uLi9pbWFnZXMvbWVhc3VyaW5nVGFwZV9wbmcuanMnO1xuaW1wb3J0IE51bWJlckNvbnRyb2wgZnJvbSAnLi4vLi4vTnVtYmVyQ29udHJvbC5qcyc7XG5cbnR5cGUgU3ByaXRlSW5zdGFuY2VXaXRoVmVsb2NpdHkgPSBTcHJpdGVJbnN0YW5jZSAmIHsgdmVsb2NpdHk6IFZlY3RvcjIgfTtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gZGVtb1Nwcml0ZXMoIGxheW91dEJvdW5kczogQm91bmRzMiApOiBOb2RlIHtcblxuICBjb25zdCBzcHJpdGVDb3VudFByb3BlcnR5ID0gbmV3IE51bWJlclByb3BlcnR5KCA1MDAsIHtcbiAgICByYW5nZTogbmV3IFJhbmdlKCAwLCAxMDAwMCApXG4gIH0gKTtcbiAgY29uc3Qgc3ByaXRlU3BlZWRQcm9wZXJ0eSA9IG5ldyBOdW1iZXJQcm9wZXJ0eSggMTUsIHtcbiAgICByYW5nZTogbmV3IFJhbmdlKCAwLCAxMDAgKVxuICB9ICk7XG4gIGNvbnN0IHNwcml0ZVNjYWxlUHJvcGVydHkgPSBuZXcgTnVtYmVyUHJvcGVydHkoIDAuNSwge1xuICAgIHJhbmdlOiBuZXcgUmFuZ2UoIDAuMDEsIDEgKVxuICB9ICk7XG5cbiAgY29uc3QgZ2V0QXZhaWxhYmxlV2lkdGggPSAoKSA9PiBsYXlvdXRCb3VuZHMud2lkdGggLyBzcHJpdGVTY2FsZVByb3BlcnR5LnZhbHVlO1xuICBjb25zdCBnZXRBdmFpbGFibGVIZWlnaHQgPSAoKSA9PiBsYXlvdXRCb3VuZHMuaGVpZ2h0IC8gc3ByaXRlU2NhbGVQcm9wZXJ0eS52YWx1ZTtcblxuICAvLyBTcHJpdGVJbWFnZSByZWZlcmVuY2VzXG4gIGNvbnN0IGZsYW1lU3ByaXRlSW1hZ2UgPSBuZXcgU3ByaXRlSW1hZ2UoIGZsYW1lX3BuZywgbmV3IFZlY3RvcjIoIDQ0LCA0MiApLCB7IGhpdFRlc3RQaXhlbHM6IHRydWUgfSApO1xuICBjb25zdCBtZWFzdXJpbmdUYXBlU3ByaXRlSW1hZ2UgPSBuZXcgU3ByaXRlSW1hZ2UoIG1lYXN1cmluZ1RhcGVfcG5nLCBuZXcgVmVjdG9yMiggNTAsIDQwICksIHsgaGl0VGVzdFBpeGVsczogdHJ1ZSB9ICk7XG4gIGNvbnN0IGljZUN1YmVTdGFja1Nwcml0ZUltYWdlID0gbmV3IFNwcml0ZUltYWdlKCBpY2VDdWJlU3RhY2tfcG5nLCBuZXcgVmVjdG9yMiggMjUsIDI1ICksIHsgaGl0VGVzdFBpeGVsczogdHJ1ZSB9ICk7XG5cbiAgLy8gRXhhbXBsZSBvZiBob3cgdG8gY3JlYXRlIGEgU3ByaXRlSW1hZ2UgZnJvbSBhIG5vbi1IVE1MSW1hZ2VFbGVtZW50LCBhcyByZWNvbW1lbmRlZCBieSBAam9uYXRoYW5vbHNvblxuICAvLyBpbiBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvYmVlcnMtbGF3LWxhYi9pc3N1ZXMvMjc2I2lzc3VlY29tbWVudC0xMzQ3MDcxNjUwXG4gIC8vIEFkZCBhZGRpdGlvbmFsIHBhcmFtZXRlcnMgZm9yIHRoZSB0b0NhbnZhcyBjYWxsYmFjayBpZiB5b3UgbmVlZCByZXNvbHV0aW9uIHNjYWxpbmcuXG4gIGNvbnN0IHBhcnRpY2xlUmVjdGFuZ2xlID0gbmV3IFJlY3RhbmdsZSggMCwgMCwgNTAsIDUwLCB7XG4gICAgZmlsbDogJ3JlZCcsXG4gICAgc3Ryb2tlOiAnYmxhY2snXG4gIH0gKTtcbiAgbGV0IHBhcnRpY2xlU3ByaXRlSW1hZ2U6IFNwcml0ZUltYWdlO1xuICBwYXJ0aWNsZVJlY3RhbmdsZS50b0NhbnZhcyggY2FudmFzID0+IHtcbiAgICBwYXJ0aWNsZVNwcml0ZUltYWdlID0gbmV3IFNwcml0ZUltYWdlKCBjYW52YXMsIHBhcnRpY2xlUmVjdGFuZ2xlLmNlbnRlciApO1xuICB9ICk7XG5cbiAgLy8gU3ByaXRlc1xuICBjb25zdCBzcHJpdGUwID0gbmV3IFNwcml0ZSggZmxhbWVTcHJpdGVJbWFnZSApO1xuICBjb25zdCBzcHJpdGUxID0gbmV3IFNwcml0ZSggbWVhc3VyaW5nVGFwZVNwcml0ZUltYWdlICk7XG4gIGNvbnN0IHNwcml0ZTIgPSBuZXcgU3ByaXRlKCBpY2VDdWJlU3RhY2tTcHJpdGVJbWFnZSApO1xuICBjb25zdCBzcHJpdGUzID0gbmV3IFNwcml0ZSggcGFydGljbGVTcHJpdGVJbWFnZSEgKTtcblxuICBjb25zdCBjcmVhdGVTcHJpdGVJbnN0YW5jZSA9ICgpOiBTcHJpdGVJbnN0YW5jZVdpdGhWZWxvY2l0eSA9PiB7XG4gICAgY29uc3QgaW5zdGFuY2UgPSBTcHJpdGVJbnN0YW5jZS5wb29sLmNyZWF0ZSgpIGFzIFNwcml0ZUluc3RhbmNlV2l0aFZlbG9jaXR5O1xuICAgIGluc3RhbmNlLnNwcml0ZSA9IGRvdFJhbmRvbS5zYW1wbGUoIFsgc3ByaXRlMCwgc3ByaXRlMSwgc3ByaXRlMiwgc3ByaXRlMyBdICk7XG4gICAgaW5zdGFuY2UubWF0cml4LnNldFRvVHJhbnNsYXRpb24oIGRvdFJhbmRvbS5uZXh0RG91YmxlKCkgKiBnZXRBdmFpbGFibGVXaWR0aCgpLCBkb3RSYW5kb20ubmV4dERvdWJsZSgpICogZ2V0QXZhaWxhYmxlSGVpZ2h0KCkgKTtcblxuICAgIC8vIFB1dCBhIGN1c3RvbSB2ZWxvY2l0eSBvbiBlYWNoIG9uZVxuICAgIGluc3RhbmNlLnZlbG9jaXR5ID0gVmVjdG9yMi5jcmVhdGVQb2xhciggMSwgZG90UmFuZG9tLm5leHREb3VibGUoKSAqIDIgKiBNYXRoLlBJICk7XG5cbiAgICByZXR1cm4gaW5zdGFuY2U7XG4gIH07XG5cbiAgLy8gV2UnbGwgaG9sZCBvdXIgU3ByaXRlSW5zdGFuY2VzIGhlcmUgaW4gdGhpcyBhcnJheSAodGhlIHJlZmVyZW5jZSB0byB0aGlzIGV4YWN0IGFycmF5IHdpbGwgYmUgdXNlZClcbiAgY29uc3QgaW5zdGFuY2VzID0gXy5yYW5nZSggMCwgc3ByaXRlQ291bnRQcm9wZXJ0eS52YWx1ZSApLm1hcCggY3JlYXRlU3ByaXRlSW5zdGFuY2UgKTtcblxuICAvLyBBZGp1c3Qgc3ByaXRlIGNvdW50IGR5bmFtaWNhbGx5XG4gIHNwcml0ZUNvdW50UHJvcGVydHkubGF6eUxpbmsoICggdmFsdWUsIG9sZFZhbHVlICkgPT4ge1xuICAgIGNvbnN0IGRlbHRhID0gdmFsdWUgLSBvbGRWYWx1ZTtcbiAgICBpZiAoIGRlbHRhID4gMCApIHtcbiAgICAgIF8ucmFuZ2UoIDAsIGRlbHRhICkuZm9yRWFjaCggKCkgPT4gaW5zdGFuY2VzLnB1c2goIGNyZWF0ZVNwcml0ZUluc3RhbmNlKCkgKSApO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIF8ucmFuZ2UoIDAsIC1kZWx0YSApLmZvckVhY2goICgpID0+IGluc3RhbmNlcy5wb3AoKSApO1xuICAgIH1cbiAgfSApO1xuXG4gIGxldCBzZWxlY3RlZEluc3RhbmNlOiBTcHJpdGVJbnN0YW5jZVdpdGhWZWxvY2l0eSB8IG51bGwgPSBudWxsO1xuXG4gIC8vIENyZWF0ZSB0aGUgJ1Nwcml0ZXMnIG5vZGVcbiAgY29uc3Qgc3ByaXRlcyA9IG5ldyBTcHJpdGVzKCB7XG5cbiAgICAvLyBUaGUgc3ByaXRlcyB3ZSBoYXZlIGF2YWlsYWJsZSAoZml4ZWQsIHdvbid0IGNoYW5nZSlcbiAgICBzcHJpdGVzOiBbIHNwcml0ZTAsIHNwcml0ZTEsIHNwcml0ZTIsIHNwcml0ZTMgXSxcbiAgICBzcHJpdGVJbnN0YW5jZXM6IGluc3RhbmNlcyxcbiAgICBjYW52YXNCb3VuZHM6IGxheW91dEJvdW5kcy5kaWxhdGVkKCAyMDAgKSxcbiAgICBoaXRUZXN0U3ByaXRlczogdHJ1ZSxcbiAgICBjdXJzb3I6ICdwb2ludGVyJyxcblxuICAgIC8vIE1peCBpbiBTcHJpdGVMaXN0ZW5hYmxlLCBzbyB3ZSAoYSkgaGF2ZSBhY2Nlc3MgdG8gdGhlIFNwcml0ZUluc3RhbmNlIGFuZCAoYikgd2lsbCBvbmx5IGludGVyYWN0IHdoZW4gdGhlcmUgaXMgb25lXG4gICAgaW5wdXRMaXN0ZW5lcnM6IFsgbmV3ICggU3ByaXRlTGlzdGVuYWJsZSggRHJhZ0xpc3RlbmVyICkgKSgge1xuICAgICAgYXBwbHlPZmZzZXQ6IGZhbHNlLFxuXG4gICAgICBzdGFydDogKCBldmVudCwgbGlzdGVuZXI6IFByZXNzZWREcmFnTGlzdGVuZXIgKSA9PiB7XG5cbiAgICAgICAgY29uc3QgbXlMaXN0ZW5lciA9IGxpc3RlbmVyIGFzIFByZXNzZWREcmFnTGlzdGVuZXIgJiB7IHNwcml0ZUluc3RhbmNlOiBTcHJpdGVJbnN0YW5jZVdpdGhWZWxvY2l0eSB9O1xuICAgICAgICBzZWxlY3RlZEluc3RhbmNlID0gbXlMaXN0ZW5lci5zcHJpdGVJbnN0YW5jZTtcblxuICAgICAgICAvLyBlLmcuIG1vdmVUb0Zyb250XG4gICAgICAgIGFycmF5UmVtb3ZlKCBpbnN0YW5jZXMsIHNlbGVjdGVkSW5zdGFuY2UgKTtcbiAgICAgICAgaW5zdGFuY2VzLnB1c2goIHNlbGVjdGVkSW5zdGFuY2UgKTtcbiAgICAgIH0sXG5cbiAgICAgIGRyYWc6ICggZXZlbnQsIGxpc3RlbmVyICkgPT4ge1xuICAgICAgICAvLyB0cmFuc2xhdGUgdGhlIHNlbGVjdGVkIGluc3RhbmNlXG4gICAgICAgIGNvbnN0IG1hdHJpeCA9IHNlbGVjdGVkSW5zdGFuY2UhLm1hdHJpeDtcbiAgICAgICAgbWF0cml4LnNldDAyKCBtYXRyaXgubTAyKCkgKyBsaXN0ZW5lci5tb2RlbERlbHRhLnggLyBzcHJpdGVTY2FsZVByb3BlcnR5LnZhbHVlICk7XG4gICAgICAgIG1hdHJpeC5zZXQxMiggbWF0cml4Lm0xMigpICsgbGlzdGVuZXIubW9kZWxEZWx0YS55IC8gc3ByaXRlU2NhbGVQcm9wZXJ0eS52YWx1ZSApO1xuXG4gICAgICAgIHNwcml0ZXMuaW52YWxpZGF0ZVBhaW50KCk7XG4gICAgICB9LFxuXG4gICAgICBlbmQ6ICgpID0+IHtcbiAgICAgICAgc2VsZWN0ZWRJbnN0YW5jZSA9IG51bGw7XG4gICAgICB9XG4gICAgfSApIF1cbiAgfSApO1xuXG4gIHNwcml0ZVNjYWxlUHJvcGVydHkubGluayggKCBzY2FsZSwgb2xkU2NhbGUgKSA9PiB7XG4gICAgc3ByaXRlcy5zZXRTY2FsZU1hZ25pdHVkZSggc2NhbGUsIHNjYWxlICk7XG4gICAgc3ByaXRlcy5jYW52YXNCb3VuZHMgPSBCb3VuZHMyLnJlY3QoIDAsIDAsIGdldEF2YWlsYWJsZVdpZHRoKCksIGdldEF2YWlsYWJsZUhlaWdodCgpICkuZGlsYXRlZCggMjAwICk7XG5cbiAgICAvLyByZXNjYWxlIHBvc2l0aW9uc1xuICAgIGlmICggb2xkU2NhbGUgKSB7XG4gICAgICBpbnN0YW5jZXMuZm9yRWFjaCggaW5zdGFuY2UgPT4ge1xuICAgICAgICBpbnN0YW5jZS5tYXRyaXguc2V0MDIoIGluc3RhbmNlLm1hdHJpeC5tMDIoKSAqIG9sZFNjYWxlIC8gc2NhbGUgKTtcbiAgICAgICAgaW5zdGFuY2UubWF0cml4LnNldDEyKCBpbnN0YW5jZS5tYXRyaXgubTEyKCkgKiBvbGRTY2FsZSAvIHNjYWxlICk7XG4gICAgICB9ICk7XG4gICAgfVxuICB9ICk7XG5cbiAgc3ByaXRlcy5pbnZhbGlkYXRlUGFpbnQoKTtcblxuICBjb25zdCBsaXN0ZW5lciA9ICggZHQ6IG51bWJlciApID0+IHtcblxuICAgIGNvbnN0IGRpc3RhbmNlID0gZHQgKiBzcHJpdGVTcGVlZFByb3BlcnR5LnZhbHVlIC8gc3ByaXRlU2NhbGVQcm9wZXJ0eS52YWx1ZTtcbiAgICBjb25zdCB3aWR0aCA9IGdldEF2YWlsYWJsZVdpZHRoKCk7XG4gICAgY29uc3QgaGVpZ2h0ID0gZ2V0QXZhaWxhYmxlSGVpZ2h0KCk7XG5cbiAgICBmb3IgKCBsZXQgaSA9IGluc3RhbmNlcy5sZW5ndGggLSAxOyBpID49IDA7IGktLSApIHtcbiAgICAgIGNvbnN0IGluc3RhbmNlID0gaW5zdGFuY2VzWyBpIF07XG4gICAgICBpZiAoIGluc3RhbmNlICE9PSBzZWxlY3RlZEluc3RhbmNlICkge1xuICAgICAgICBjb25zdCBtYXRyaXggPSBpbnN0YW5jZS5tYXRyaXg7XG5cbiAgICAgICAgLy8gT3B0aW1pemVkIHRyYW5zbGF0aW9uXG4gICAgICAgIG1hdHJpeC5zZXQwMiggKCBtYXRyaXgubTAyKCkgKyBpbnN0YW5jZS52ZWxvY2l0eS54ICogZGlzdGFuY2UgKyB3aWR0aCApICUgd2lkdGggKTtcbiAgICAgICAgbWF0cml4LnNldDEyKCAoIG1hdHJpeC5tMTIoKSArIGluc3RhbmNlLnZlbG9jaXR5LnkgKiBkaXN0YW5jZSArIGhlaWdodCApICUgaGVpZ2h0ICk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gV2UgbW9kaWZpZWQgb3VyIGluc3RhbmNlcywgc28gd2UgbmVlZCB0aGlzIHRvIHJlcGFpbnRcbiAgICBzcHJpdGVzLmludmFsaWRhdGVQYWludCgpO1xuICB9O1xuXG4gIHN0ZXBUaW1lci5hZGRMaXN0ZW5lciggbGlzdGVuZXIgKTtcblxuICBzcHJpdGVzLmRpc3Bvc2UgPSAoKSA9PiB7XG4gICAgc3RlcFRpbWVyLnJlbW92ZUxpc3RlbmVyKCBsaXN0ZW5lciApO1xuICAgIE5vZGUucHJvdG90eXBlLmRpc3Bvc2UuY2FsbCggbm9kZSApO1xuICB9O1xuXG4gIGNvbnN0IGNvbnRyb2xQYW5lbCA9IG5ldyBQYW5lbCggbmV3IFZCb3goIHtcbiAgICBzcGFjaW5nOiAxMCxcbiAgICBjaGlsZHJlbjogW1xuICAgICAgbmV3IE51bWJlckNvbnRyb2woICdTcHJpdGUgQ291bnQ6Jywgc3ByaXRlQ291bnRQcm9wZXJ0eSwgc3ByaXRlQ291bnRQcm9wZXJ0eS5yYW5nZSApLFxuICAgICAgbmV3IE51bWJlckNvbnRyb2woICdTcHJpdGUgU3BlZWQ6Jywgc3ByaXRlU3BlZWRQcm9wZXJ0eSwgc3ByaXRlU3BlZWRQcm9wZXJ0eS5yYW5nZSApLFxuICAgICAgbmV3IE51bWJlckNvbnRyb2woICdTcHJpdGUgU2NhbGU6Jywgc3ByaXRlU2NhbGVQcm9wZXJ0eSwgc3ByaXRlU2NhbGVQcm9wZXJ0eS5yYW5nZSwge1xuICAgICAgICBkZWx0YTogMC4wMSxcbiAgICAgICAgbnVtYmVyRGlzcGxheU9wdGlvbnM6IHtcbiAgICAgICAgICBkZWNpbWFsUGxhY2VzOiAyXG4gICAgICAgIH1cbiAgICAgIH0gKVxuICAgIF1cbiAgfSApLCB7XG4gICAgYm90dG9tOiBsYXlvdXRCb3VuZHMuYm90dG9tIC0gMTAsXG4gICAgcmlnaHQ6IGxheW91dEJvdW5kcy5yaWdodCAtIDEwXG4gIH0gKTtcblxuICBjb25zdCBub2RlID0gbmV3IE5vZGUoIHtcbiAgICBjaGlsZHJlbjogWyBzcHJpdGVzLCBjb250cm9sUGFuZWwgXVxuICB9ICk7XG4gIHJldHVybiBub2RlO1xufSJdLCJuYW1lcyI6WyJOdW1iZXJQcm9wZXJ0eSIsInN0ZXBUaW1lciIsIkJvdW5kczIiLCJkb3RSYW5kb20iLCJSYW5nZSIsIlZlY3RvcjIiLCJhcnJheVJlbW92ZSIsIkRyYWdMaXN0ZW5lciIsIk5vZGUiLCJSZWN0YW5nbGUiLCJTcHJpdGUiLCJTcHJpdGVJbWFnZSIsIlNwcml0ZUluc3RhbmNlIiwiU3ByaXRlTGlzdGVuYWJsZSIsIlNwcml0ZXMiLCJWQm94IiwiUGFuZWwiLCJmbGFtZV9wbmciLCJpY2VDdWJlU3RhY2tfcG5nIiwibWVhc3VyaW5nVGFwZV9wbmciLCJOdW1iZXJDb250cm9sIiwiZGVtb1Nwcml0ZXMiLCJsYXlvdXRCb3VuZHMiLCJzcHJpdGVDb3VudFByb3BlcnR5IiwicmFuZ2UiLCJzcHJpdGVTcGVlZFByb3BlcnR5Iiwic3ByaXRlU2NhbGVQcm9wZXJ0eSIsImdldEF2YWlsYWJsZVdpZHRoIiwid2lkdGgiLCJ2YWx1ZSIsImdldEF2YWlsYWJsZUhlaWdodCIsImhlaWdodCIsImZsYW1lU3ByaXRlSW1hZ2UiLCJoaXRUZXN0UGl4ZWxzIiwibWVhc3VyaW5nVGFwZVNwcml0ZUltYWdlIiwiaWNlQ3ViZVN0YWNrU3ByaXRlSW1hZ2UiLCJwYXJ0aWNsZVJlY3RhbmdsZSIsImZpbGwiLCJzdHJva2UiLCJwYXJ0aWNsZVNwcml0ZUltYWdlIiwidG9DYW52YXMiLCJjYW52YXMiLCJjZW50ZXIiLCJzcHJpdGUwIiwic3ByaXRlMSIsInNwcml0ZTIiLCJzcHJpdGUzIiwiY3JlYXRlU3ByaXRlSW5zdGFuY2UiLCJpbnN0YW5jZSIsInBvb2wiLCJjcmVhdGUiLCJzcHJpdGUiLCJzYW1wbGUiLCJtYXRyaXgiLCJzZXRUb1RyYW5zbGF0aW9uIiwibmV4dERvdWJsZSIsInZlbG9jaXR5IiwiY3JlYXRlUG9sYXIiLCJNYXRoIiwiUEkiLCJpbnN0YW5jZXMiLCJfIiwibWFwIiwibGF6eUxpbmsiLCJvbGRWYWx1ZSIsImRlbHRhIiwiZm9yRWFjaCIsInB1c2giLCJwb3AiLCJzZWxlY3RlZEluc3RhbmNlIiwic3ByaXRlcyIsInNwcml0ZUluc3RhbmNlcyIsImNhbnZhc0JvdW5kcyIsImRpbGF0ZWQiLCJoaXRUZXN0U3ByaXRlcyIsImN1cnNvciIsImlucHV0TGlzdGVuZXJzIiwiYXBwbHlPZmZzZXQiLCJzdGFydCIsImV2ZW50IiwibGlzdGVuZXIiLCJteUxpc3RlbmVyIiwic3ByaXRlSW5zdGFuY2UiLCJkcmFnIiwic2V0MDIiLCJtMDIiLCJtb2RlbERlbHRhIiwieCIsInNldDEyIiwibTEyIiwieSIsImludmFsaWRhdGVQYWludCIsImVuZCIsImxpbmsiLCJzY2FsZSIsIm9sZFNjYWxlIiwic2V0U2NhbGVNYWduaXR1ZGUiLCJyZWN0IiwiZHQiLCJkaXN0YW5jZSIsImkiLCJsZW5ndGgiLCJhZGRMaXN0ZW5lciIsImRpc3Bvc2UiLCJyZW1vdmVMaXN0ZW5lciIsInByb3RvdHlwZSIsImNhbGwiLCJub2RlIiwiY29udHJvbFBhbmVsIiwic3BhY2luZyIsImNoaWxkcmVuIiwibnVtYmVyRGlzcGxheU9wdGlvbnMiLCJkZWNpbWFsUGxhY2VzIiwiYm90dG9tIiwicmlnaHQiXSwibWFwcGluZ3MiOiJBQUFBLHNEQUFzRDtBQUV0RDs7OztDQUlDLEdBRUQsT0FBT0Esb0JBQW9CLHdDQUF3QztBQUNuRSxPQUFPQyxlQUFlLG1DQUFtQztBQUN6RCxPQUFPQyxhQUFhLGdDQUFnQztBQUNwRCxPQUFPQyxl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