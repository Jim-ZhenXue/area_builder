// Copyright 2013-2021, University of Colorado Boulder
/*
 * An HTMLImageElement that is backed by a scene. Call update() on this SceneImage to update the image from the scene.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ import { scenery } from '../imports.js';
let SceneImage = class SceneImage {
    /**
   * NOTE: calling this before the previous update() completes may cause the previous onComplete to not be executed
   * @public
   *
   * @param {function} onComplete
   */ update(onComplete) {
        this.scene.updateScene();
        this.canvas.width = this.scene.getSceneWidth();
        this.canvas.height = this.scene.getSceneHeight();
        this.scene.renderToCanvas(this.canvas, this.context, ()=>{
            const url = this.toDataURL();
            this.img.onload = ()=>{
                onComplete();
                delete this.img.onload;
            };
            this.img.src = url;
        });
    }
    /**
   * NOTE: ideally the scene shouldn't use SVG, since rendering that to a canvas takes a callback (and usually requires canvg)
   *
   * @param {Node} scene
   */ constructor(scene){
        this.scene = scene;
        // we write the scene to a canvas, get its data URL, and pass that to the image.
        this.canvas = document.createElement('canvas');
        this.context = this.canvas.getContext('2d');
        this.img = document.createElement('img');
        this.update();
    }
};
scenery.register('SceneImage', SceneImage);
export default SceneImage;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvdXRpbC9TY2VuZUltYWdlLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDEzLTIwMjEsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKlxuICogQW4gSFRNTEltYWdlRWxlbWVudCB0aGF0IGlzIGJhY2tlZCBieSBhIHNjZW5lLiBDYWxsIHVwZGF0ZSgpIG9uIHRoaXMgU2NlbmVJbWFnZSB0byB1cGRhdGUgdGhlIGltYWdlIGZyb20gdGhlIHNjZW5lLlxuICpcbiAqIEBhdXRob3IgSm9uYXRoYW4gT2xzb24gPGpvbmF0aGFuLm9sc29uQGNvbG9yYWRvLmVkdT5cbiAqL1xuXG5pbXBvcnQgeyBzY2VuZXJ5IH0gZnJvbSAnLi4vaW1wb3J0cy5qcyc7XG5cbmNsYXNzIFNjZW5lSW1hZ2Uge1xuICAvKipcbiAgICogTk9URTogaWRlYWxseSB0aGUgc2NlbmUgc2hvdWxkbid0IHVzZSBTVkcsIHNpbmNlIHJlbmRlcmluZyB0aGF0IHRvIGEgY2FudmFzIHRha2VzIGEgY2FsbGJhY2sgKGFuZCB1c3VhbGx5IHJlcXVpcmVzIGNhbnZnKVxuICAgKlxuICAgKiBAcGFyYW0ge05vZGV9IHNjZW5lXG4gICAqL1xuICBjb25zdHJ1Y3Rvciggc2NlbmUgKSB7XG4gICAgdGhpcy5zY2VuZSA9IHNjZW5lO1xuXG4gICAgLy8gd2Ugd3JpdGUgdGhlIHNjZW5lIHRvIGEgY2FudmFzLCBnZXQgaXRzIGRhdGEgVVJMLCBhbmQgcGFzcyB0aGF0IHRvIHRoZSBpbWFnZS5cbiAgICB0aGlzLmNhbnZhcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoICdjYW52YXMnICk7XG4gICAgdGhpcy5jb250ZXh0ID0gdGhpcy5jYW52YXMuZ2V0Q29udGV4dCggJzJkJyApO1xuXG4gICAgdGhpcy5pbWcgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCAnaW1nJyApO1xuICAgIHRoaXMudXBkYXRlKCk7XG4gIH1cblxuICAvKipcbiAgICogTk9URTogY2FsbGluZyB0aGlzIGJlZm9yZSB0aGUgcHJldmlvdXMgdXBkYXRlKCkgY29tcGxldGVzIG1heSBjYXVzZSB0aGUgcHJldmlvdXMgb25Db21wbGV0ZSB0byBub3QgYmUgZXhlY3V0ZWRcbiAgICogQHB1YmxpY1xuICAgKlxuICAgKiBAcGFyYW0ge2Z1bmN0aW9ufSBvbkNvbXBsZXRlXG4gICAqL1xuICB1cGRhdGUoIG9uQ29tcGxldGUgKSB7XG4gICAgdGhpcy5zY2VuZS51cGRhdGVTY2VuZSgpO1xuXG4gICAgdGhpcy5jYW52YXMud2lkdGggPSB0aGlzLnNjZW5lLmdldFNjZW5lV2lkdGgoKTtcbiAgICB0aGlzLmNhbnZhcy5oZWlnaHQgPSB0aGlzLnNjZW5lLmdldFNjZW5lSGVpZ2h0KCk7XG5cbiAgICB0aGlzLnNjZW5lLnJlbmRlclRvQ2FudmFzKCB0aGlzLmNhbnZhcywgdGhpcy5jb250ZXh0LCAoKSA9PiB7XG4gICAgICBjb25zdCB1cmwgPSB0aGlzLnRvRGF0YVVSTCgpO1xuXG4gICAgICB0aGlzLmltZy5vbmxvYWQgPSAoKSA9PiB7XG4gICAgICAgIG9uQ29tcGxldGUoKTtcbiAgICAgICAgZGVsZXRlIHRoaXMuaW1nLm9ubG9hZDtcbiAgICAgIH07XG4gICAgICB0aGlzLmltZy5zcmMgPSB1cmw7XG4gICAgfSApO1xuICB9XG59XG5cbnNjZW5lcnkucmVnaXN0ZXIoICdTY2VuZUltYWdlJywgU2NlbmVJbWFnZSApO1xuZXhwb3J0IGRlZmF1bHQgU2NlbmVJbWFnZTsiXSwibmFtZXMiOlsic2NlbmVyeSIsIlNjZW5lSW1hZ2UiLCJ1cGRhdGUiLCJvbkNvbXBsZXRlIiwic2NlbmUiLCJ1cGRhdGVTY2VuZSIsImNhbnZhcyIsIndpZHRoIiwiZ2V0U2NlbmVXaWR0aCIsImhlaWdodCIsImdldFNjZW5lSGVpZ2h0IiwicmVuZGVyVG9DYW52YXMiLCJjb250ZXh0IiwidXJsIiwidG9EYXRhVVJMIiwiaW1nIiwib25sb2FkIiwic3JjIiwiY29uc3RydWN0b3IiLCJkb2N1bWVudCIsImNyZWF0ZUVsZW1lbnQiLCJnZXRDb250ZXh0IiwicmVnaXN0ZXIiXSwibWFwcGluZ3MiOiJBQUFBLHNEQUFzRDtBQUV0RDs7OztDQUlDLEdBRUQsU0FBU0EsT0FBTyxRQUFRLGdCQUFnQjtBQUV4QyxJQUFBLEFBQU1DLGFBQU4sTUFBTUE7SUFpQko7Ozs7O0dBS0MsR0FDREMsT0FBUUMsVUFBVSxFQUFHO1FBQ25CLElBQUksQ0FBQ0MsS0FBSyxDQUFDQyxXQUFXO1FBRXRCLElBQUksQ0FBQ0MsTUFBTSxDQUFDQyxLQUFLLEdBQUcsSUFBSSxDQUFDSCxLQUFLLENBQUNJLGFBQWE7UUFDNUMsSUFBSSxDQUFDRixNQUFNLENBQUNHLE1BQU0sR0FBRyxJQUFJLENBQUNMLEtBQUssQ0FBQ00sY0FBYztRQUU5QyxJQUFJLENBQUNOLEtBQUssQ0FBQ08sY0FBYyxDQUFFLElBQUksQ0FBQ0wsTUFBTSxFQUFFLElBQUksQ0FBQ00sT0FBTyxFQUFFO1lBQ3BELE1BQU1DLE1BQU0sSUFBSSxDQUFDQyxTQUFTO1lBRTFCLElBQUksQ0FBQ0MsR0FBRyxDQUFDQyxNQUFNLEdBQUc7Z0JBQ2hCYjtnQkFDQSxPQUFPLElBQUksQ0FBQ1ksR0FBRyxDQUFDQyxNQUFNO1lBQ3hCO1lBQ0EsSUFBSSxDQUFDRCxHQUFHLENBQUNFLEdBQUcsR0FBR0o7UUFDakI7SUFDRjtJQXJDQTs7OztHQUlDLEdBQ0RLLFlBQWFkLEtBQUssQ0FBRztRQUNuQixJQUFJLENBQUNBLEtBQUssR0FBR0E7UUFFYixnRkFBZ0Y7UUFDaEYsSUFBSSxDQUFDRSxNQUFNLEdBQUdhLFNBQVNDLGFBQWEsQ0FBRTtRQUN0QyxJQUFJLENBQUNSLE9BQU8sR0FBRyxJQUFJLENBQUNOLE1BQU0sQ0FBQ2UsVUFBVSxDQUFFO1FBRXZDLElBQUksQ0FBQ04sR0FBRyxHQUFHSSxTQUFTQyxhQUFhLENBQUU7UUFDbkMsSUFBSSxDQUFDbEIsTUFBTTtJQUNiO0FBd0JGO0FBRUFGLFFBQVFzQixRQUFRLENBQUUsY0FBY3JCO0FBQ2hDLGVBQWVBLFdBQVcifQ==