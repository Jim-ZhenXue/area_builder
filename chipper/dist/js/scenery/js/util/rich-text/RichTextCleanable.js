// Copyright 2023-2024, University of Colorado Boulder
/**
 * Mixin for RichText elements in the hierarchy that should be pooled with a clean() method.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ import Matrix3 from '../../../../dot/js/Matrix3.js';
import inheritance from '../../../../phet-core/js/inheritance.js';
import memoize from '../../../../phet-core/js/memoize.js';
import { Node, scenery } from '../../imports.js';
const RichTextCleanable = memoize((type)=>{
    assert && assert(_.includes(inheritance(type), Node), 'Only Node subtypes should mix Paintable');
    return class RichTextCleanableMixin extends type {
        get isCleanable() {
            return true;
        }
        /**
     * Releases references
     */ clean() {
            const thisNode = this;
            // Remove all children (and recursively clean)
            for(let i = thisNode._children.length - 1; i >= 0; i--){
                const child = thisNode._children[i];
                thisNode.removeChild(child);
                if (child.isCleanable) {
                    child.clean();
                }
            }
            thisNode.matrix = Matrix3.IDENTITY;
            thisNode.freeToPool();
        }
    };
});
scenery.register('RichTextCleanable', RichTextCleanable);
export default RichTextCleanable;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvdXRpbC9yaWNoLXRleHQvUmljaFRleHRDbGVhbmFibGUudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjMtMjAyNCwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbi8qKlxuICogTWl4aW4gZm9yIFJpY2hUZXh0IGVsZW1lbnRzIGluIHRoZSBoaWVyYXJjaHkgdGhhdCBzaG91bGQgYmUgcG9vbGVkIHdpdGggYSBjbGVhbigpIG1ldGhvZC5cbiAqXG4gKiBAYXV0aG9yIEpvbmF0aGFuIE9sc29uIDxqb25hdGhhbi5vbHNvbkBjb2xvcmFkby5lZHU+XG4gKi9cbmltcG9ydCBNYXRyaXgzIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9NYXRyaXgzLmpzJztcbmltcG9ydCBpbmhlcml0YW5jZSBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvaW5oZXJpdGFuY2UuanMnO1xuaW1wb3J0IG1lbW9pemUgZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL21lbW9pemUuanMnO1xuaW1wb3J0IHsgVFBvb2xhYmxlIH0gZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL1Bvb2wuanMnO1xuaW1wb3J0IENvbnN0cnVjdG9yIGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy90eXBlcy9Db25zdHJ1Y3Rvci5qcyc7XG5pbXBvcnQgeyBOb2RlLCBzY2VuZXJ5IH0gZnJvbSAnLi4vLi4vaW1wb3J0cy5qcyc7XG5cbnR5cGUgVFJpY2hUZXh0Q2xlYW5hYmxlID0ge1xuICByZWFkb25seSBpc0NsZWFuYWJsZTogYm9vbGVhbjtcbiAgY2xlYW4oKTogdm9pZDtcbn07XG5cbmNvbnN0IFJpY2hUZXh0Q2xlYW5hYmxlID0gbWVtb2l6ZSggPFN1cGVyVHlwZSBleHRlbmRzIENvbnN0cnVjdG9yPiggdHlwZTogU3VwZXJUeXBlICk6IFN1cGVyVHlwZSAmIENvbnN0cnVjdG9yPFRSaWNoVGV4dENsZWFuYWJsZT4gPT4ge1xuICBhc3NlcnQgJiYgYXNzZXJ0KCBfLmluY2x1ZGVzKCBpbmhlcml0YW5jZSggdHlwZSApLCBOb2RlICksICdPbmx5IE5vZGUgc3VidHlwZXMgc2hvdWxkIG1peCBQYWludGFibGUnICk7XG5cbiAgcmV0dXJuIGNsYXNzIFJpY2hUZXh0Q2xlYW5hYmxlTWl4aW4gZXh0ZW5kcyB0eXBlIGltcGxlbWVudHMgVFJpY2hUZXh0Q2xlYW5hYmxlIHtcbiAgICBwdWJsaWMgZ2V0IGlzQ2xlYW5hYmxlKCk6IGJvb2xlYW4ge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmVsZWFzZXMgcmVmZXJlbmNlc1xuICAgICAqL1xuICAgIHB1YmxpYyBjbGVhbigpOiB2b2lkIHtcbiAgICAgIGNvbnN0IHRoaXNOb2RlID0gdGhpcyBhcyB1bmtub3duIGFzIFJpY2hUZXh0Q2xlYW5hYmxlTm9kZTtcblxuICAgICAgLy8gUmVtb3ZlIGFsbCBjaGlsZHJlbiAoYW5kIHJlY3Vyc2l2ZWx5IGNsZWFuKVxuICAgICAgZm9yICggbGV0IGkgPSB0aGlzTm9kZS5fY2hpbGRyZW4ubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0gKSB7XG4gICAgICAgIGNvbnN0IGNoaWxkID0gdGhpc05vZGUuX2NoaWxkcmVuWyBpIF0gYXMgUmljaFRleHRDbGVhbmFibGVOb2RlO1xuICAgICAgICB0aGlzTm9kZS5yZW1vdmVDaGlsZCggY2hpbGQgKTtcblxuICAgICAgICBpZiAoIGNoaWxkLmlzQ2xlYW5hYmxlICkge1xuICAgICAgICAgIGNoaWxkLmNsZWFuKCk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgdGhpc05vZGUubWF0cml4ID0gTWF0cml4My5JREVOVElUWTtcblxuICAgICAgdGhpc05vZGUuZnJlZVRvUG9vbCgpO1xuICAgIH1cbiAgfTtcbn0gKTtcbmV4cG9ydCB0eXBlIFJpY2hUZXh0Q2xlYW5hYmxlTm9kZSA9IE5vZGUgJiBUUG9vbGFibGUgJiBUUmljaFRleHRDbGVhbmFibGU7XG5cbnNjZW5lcnkucmVnaXN0ZXIoICdSaWNoVGV4dENsZWFuYWJsZScsIFJpY2hUZXh0Q2xlYW5hYmxlICk7XG5cbmV4cG9ydCBkZWZhdWx0IFJpY2hUZXh0Q2xlYW5hYmxlOyJdLCJuYW1lcyI6WyJNYXRyaXgzIiwiaW5oZXJpdGFuY2UiLCJtZW1vaXplIiwiTm9kZSIsInNjZW5lcnkiLCJSaWNoVGV4dENsZWFuYWJsZSIsInR5cGUiLCJhc3NlcnQiLCJfIiwiaW5jbHVkZXMiLCJSaWNoVGV4dENsZWFuYWJsZU1peGluIiwiaXNDbGVhbmFibGUiLCJjbGVhbiIsInRoaXNOb2RlIiwiaSIsIl9jaGlsZHJlbiIsImxlbmd0aCIsImNoaWxkIiwicmVtb3ZlQ2hpbGQiLCJtYXRyaXgiLCJJREVOVElUWSIsImZyZWVUb1Bvb2wiLCJyZWdpc3RlciJdLCJtYXBwaW5ncyI6IkFBQUEsc0RBQXNEO0FBRXREOzs7O0NBSUMsR0FDRCxPQUFPQSxhQUFhLGdDQUFnQztBQUNwRCxPQUFPQyxpQkFBaUIsMENBQTBDO0FBQ2xFLE9BQU9DLGFBQWEsc0NBQXNDO0FBRzFELFNBQVNDLElBQUksRUFBRUMsT0FBTyxRQUFRLG1CQUFtQjtBQU9qRCxNQUFNQyxvQkFBb0JILFFBQVMsQ0FBaUNJO0lBQ2xFQyxVQUFVQSxPQUFRQyxFQUFFQyxRQUFRLENBQUVSLFlBQWFLLE9BQVFILE9BQVE7SUFFM0QsT0FBTyxNQUFNTywrQkFBK0JKO1FBQzFDLElBQVdLLGNBQXVCO1lBQ2hDLE9BQU87UUFDVDtRQUVBOztLQUVDLEdBQ0QsQUFBT0MsUUFBYztZQUNuQixNQUFNQyxXQUFXLElBQUk7WUFFckIsOENBQThDO1lBQzlDLElBQU0sSUFBSUMsSUFBSUQsU0FBU0UsU0FBUyxDQUFDQyxNQUFNLEdBQUcsR0FBR0YsS0FBSyxHQUFHQSxJQUFNO2dCQUN6RCxNQUFNRyxRQUFRSixTQUFTRSxTQUFTLENBQUVELEVBQUc7Z0JBQ3JDRCxTQUFTSyxXQUFXLENBQUVEO2dCQUV0QixJQUFLQSxNQUFNTixXQUFXLEVBQUc7b0JBQ3ZCTSxNQUFNTCxLQUFLO2dCQUNiO1lBQ0Y7WUFFQUMsU0FBU00sTUFBTSxHQUFHbkIsUUFBUW9CLFFBQVE7WUFFbENQLFNBQVNRLFVBQVU7UUFDckI7SUFDRjtBQUNGO0FBR0FqQixRQUFRa0IsUUFBUSxDQUFFLHFCQUFxQmpCO0FBRXZDLGVBQWVBLGtCQUFrQiJ9