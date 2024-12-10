// Copyright 2023-2024, University of Colorado Boulder
/**
 * A link node in RichText - NOTE: This is NOT embedded for layout. Instead, link content will be added as children to this node,
 * and this will exist solely for the link functionality.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ import Pool from '../../../../phet-core/js/Pool.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import { allowLinksProperty, FireListener, Node, openPopup, RichTextCleanable, scenery, Voicing } from '../../imports.js';
let RichTextLink = class RichTextLink extends Voicing(RichTextCleanable(Node)) {
    /**
   * Set up this state. First construction does not need to use super.initialize() because the constructor has done
   * that for us. But repeated initialization with Poolable will need to initialize super again.
   */ initialize(innerContent, href, initializeSuper = true) {
        if (initializeSuper) {
            super.initialize();
        }
        // pdom - open the link in the new tab when activated with a keyboard.
        // also see https://github.com/phetsims/joist/issues/430
        this.innerContent = innerContent;
        this.voicingNameResponse = innerContent;
        // If our href is a function, it should be called when the user clicks on the link
        if (typeof href === 'function') {
            this.fireListener = new FireListener({
                fire: href,
                tandem: Tandem.OPT_OUT
            });
            this.addInputListener(this.fireListener);
            this.setPDOMAttribute('href', '#'); // Required so that the click listener will get called.
            this.setPDOMAttribute('target', '_self'); // This is the default (easier than conditionally removing)
            this.accessibleInputListener = {
                click: (event)=>{
                    event.domEvent && event.domEvent.preventDefault();
                    href();
                }
            };
            this.addInputListener(this.accessibleInputListener);
        } else {
            this.fireListener = new FireListener({
                fire: (event)=>{
                    if (event.isFromPDOM()) {
                        // prevent default from pdom activation so we don't also open a new tab from native DOM input on a link
                        event.domEvent.preventDefault();
                    }
                    // @ts-expect-error TODO TODO TODO this is a bug! How do we handle this? https://github.com/phetsims/scenery/issues/1581
                    self._linkEventsHandled && event.handle();
                    openPopup(href); // open in a new window/tab
                },
                tandem: Tandem.OPT_OUT
            });
            this.addInputListener(this.fireListener);
            this.setPDOMAttribute('href', href);
            this.setPDOMAttribute('target', '_blank');
            this.allowLinksListener = (allowLinks)=>{
                this.visible = allowLinks;
            };
            allowLinksProperty.link(this.allowLinksListener);
        }
        return this;
    }
    /**
   * Cleans references that could cause memory leaks (as those things may contain other references).
   */ clean() {
        super.clean();
        if (this.fireListener) {
            this.removeInputListener(this.fireListener);
            this.fireListener.dispose();
        }
        this.fireListener = null;
        if (this.accessibleInputListener) {
            this.removeInputListener(this.accessibleInputListener);
            this.accessibleInputListener = null;
        }
        if (this.allowLinksListener) {
            allowLinksProperty.unlink(this.allowLinksListener);
            this.allowLinksListener = null;
        }
    }
    freeToPool() {
        RichTextLink.pool.freeToPool(this);
    }
    constructor(innerContent, href){
        super(), this.fireListener = null, this.accessibleInputListener = null, this.allowLinksListener = null;
        // Voicing was already initialized in the super call, we do not want to initialize super again. But we do want to
        // initialize the RichText portion of the implementation.
        this.initialize(innerContent, href, false);
        // Mutate to make sure initialize doesn't clear this away
        this.mutate({
            cursor: 'pointer',
            tagName: 'a'
        });
    }
};
RichTextLink.pool = new Pool(RichTextLink);
export { RichTextLink as default };
scenery.register('RichTextLink', RichTextLink);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvdXRpbC9yaWNoLXRleHQvUmljaFRleHRMaW5rLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDIzLTIwMjQsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIEEgbGluayBub2RlIGluIFJpY2hUZXh0IC0gTk9URTogVGhpcyBpcyBOT1QgZW1iZWRkZWQgZm9yIGxheW91dC4gSW5zdGVhZCwgbGluayBjb250ZW50IHdpbGwgYmUgYWRkZWQgYXMgY2hpbGRyZW4gdG8gdGhpcyBub2RlLFxuICogYW5kIHRoaXMgd2lsbCBleGlzdCBzb2xlbHkgZm9yIHRoZSBsaW5rIGZ1bmN0aW9uYWxpdHkuXG4gKlxuICogQGF1dGhvciBKb25hdGhhbiBPbHNvbiA8am9uYXRoYW4ub2xzb25AY29sb3JhZG8uZWR1PlxuICovXG5pbXBvcnQgUG9vbCwgeyBUUG9vbGFibGUgfSBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvUG9vbC5qcyc7XG5pbXBvcnQgVGFuZGVtIGZyb20gJy4uLy4uLy4uLy4uL3RhbmRlbS9qcy9UYW5kZW0uanMnO1xuaW1wb3J0IHsgYWxsb3dMaW5rc1Byb3BlcnR5LCBGaXJlTGlzdGVuZXIsIE5vZGUsIG9wZW5Qb3B1cCwgUmljaFRleHRDbGVhbmFibGUsIFJpY2hUZXh0SHJlZiwgc2NlbmVyeSwgVElucHV0TGlzdGVuZXIsIFZvaWNpbmcgfSBmcm9tICcuLi8uLi9pbXBvcnRzLmpzJztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUmljaFRleHRMaW5rIGV4dGVuZHMgVm9pY2luZyggUmljaFRleHRDbGVhbmFibGUoIE5vZGUgKSApIGltcGxlbWVudHMgVFBvb2xhYmxlIHtcblxuICBwcml2YXRlIGZpcmVMaXN0ZW5lcjogRmlyZUxpc3RlbmVyIHwgbnVsbCA9IG51bGw7XG4gIHByaXZhdGUgYWNjZXNzaWJsZUlucHV0TGlzdGVuZXI6IFRJbnB1dExpc3RlbmVyIHwgbnVsbCA9IG51bGw7XG4gIHByaXZhdGUgYWxsb3dMaW5rc0xpc3RlbmVyOiAoICggYWxsb3dMaW5rczogYm9vbGVhbiApID0+IHZvaWQgKSB8IG51bGwgPSBudWxsO1xuXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggaW5uZXJDb250ZW50OiBzdHJpbmcsIGhyZWY6IFJpY2hUZXh0SHJlZiApIHtcbiAgICBzdXBlcigpO1xuXG4gICAgLy8gVm9pY2luZyB3YXMgYWxyZWFkeSBpbml0aWFsaXplZCBpbiB0aGUgc3VwZXIgY2FsbCwgd2UgZG8gbm90IHdhbnQgdG8gaW5pdGlhbGl6ZSBzdXBlciBhZ2Fpbi4gQnV0IHdlIGRvIHdhbnQgdG9cbiAgICAvLyBpbml0aWFsaXplIHRoZSBSaWNoVGV4dCBwb3J0aW9uIG9mIHRoZSBpbXBsZW1lbnRhdGlvbi5cbiAgICB0aGlzLmluaXRpYWxpemUoIGlubmVyQ29udGVudCwgaHJlZiwgZmFsc2UgKTtcblxuICAgIC8vIE11dGF0ZSB0byBtYWtlIHN1cmUgaW5pdGlhbGl6ZSBkb2Vzbid0IGNsZWFyIHRoaXMgYXdheVxuICAgIHRoaXMubXV0YXRlKCB7XG4gICAgICBjdXJzb3I6ICdwb2ludGVyJyxcbiAgICAgIHRhZ05hbWU6ICdhJ1xuICAgIH0gKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXQgdXAgdGhpcyBzdGF0ZS4gRmlyc3QgY29uc3RydWN0aW9uIGRvZXMgbm90IG5lZWQgdG8gdXNlIHN1cGVyLmluaXRpYWxpemUoKSBiZWNhdXNlIHRoZSBjb25zdHJ1Y3RvciBoYXMgZG9uZVxuICAgKiB0aGF0IGZvciB1cy4gQnV0IHJlcGVhdGVkIGluaXRpYWxpemF0aW9uIHdpdGggUG9vbGFibGUgd2lsbCBuZWVkIHRvIGluaXRpYWxpemUgc3VwZXIgYWdhaW4uXG4gICAqL1xuICBwdWJsaWMgb3ZlcnJpZGUgaW5pdGlhbGl6ZSggaW5uZXJDb250ZW50OiBzdHJpbmcsIGhyZWY6IFJpY2hUZXh0SHJlZiwgaW5pdGlhbGl6ZVN1cGVyID0gdHJ1ZSApOiB0aGlzIHtcblxuICAgIGlmICggaW5pdGlhbGl6ZVN1cGVyICkge1xuICAgICAgc3VwZXIuaW5pdGlhbGl6ZSgpO1xuICAgIH1cblxuICAgIC8vIHBkb20gLSBvcGVuIHRoZSBsaW5rIGluIHRoZSBuZXcgdGFiIHdoZW4gYWN0aXZhdGVkIHdpdGggYSBrZXlib2FyZC5cbiAgICAvLyBhbHNvIHNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvam9pc3QvaXNzdWVzLzQzMFxuICAgIHRoaXMuaW5uZXJDb250ZW50ID0gaW5uZXJDb250ZW50O1xuXG4gICAgdGhpcy52b2ljaW5nTmFtZVJlc3BvbnNlID0gaW5uZXJDb250ZW50O1xuXG4gICAgLy8gSWYgb3VyIGhyZWYgaXMgYSBmdW5jdGlvbiwgaXQgc2hvdWxkIGJlIGNhbGxlZCB3aGVuIHRoZSB1c2VyIGNsaWNrcyBvbiB0aGUgbGlua1xuICAgIGlmICggdHlwZW9mIGhyZWYgPT09ICdmdW5jdGlvbicgKSB7XG4gICAgICB0aGlzLmZpcmVMaXN0ZW5lciA9IG5ldyBGaXJlTGlzdGVuZXIoIHtcbiAgICAgICAgZmlyZTogaHJlZixcbiAgICAgICAgdGFuZGVtOiBUYW5kZW0uT1BUX09VVFxuICAgICAgfSApO1xuICAgICAgdGhpcy5hZGRJbnB1dExpc3RlbmVyKCB0aGlzLmZpcmVMaXN0ZW5lciApO1xuICAgICAgdGhpcy5zZXRQRE9NQXR0cmlidXRlKCAnaHJlZicsICcjJyApOyAvLyBSZXF1aXJlZCBzbyB0aGF0IHRoZSBjbGljayBsaXN0ZW5lciB3aWxsIGdldCBjYWxsZWQuXG4gICAgICB0aGlzLnNldFBET01BdHRyaWJ1dGUoICd0YXJnZXQnLCAnX3NlbGYnICk7IC8vIFRoaXMgaXMgdGhlIGRlZmF1bHQgKGVhc2llciB0aGFuIGNvbmRpdGlvbmFsbHkgcmVtb3ZpbmcpXG4gICAgICB0aGlzLmFjY2Vzc2libGVJbnB1dExpc3RlbmVyID0ge1xuICAgICAgICBjbGljazogZXZlbnQgPT4ge1xuICAgICAgICAgIGV2ZW50LmRvbUV2ZW50ICYmIGV2ZW50LmRvbUV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICAgICAgICBocmVmKCk7XG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgICB0aGlzLmFkZElucHV0TGlzdGVuZXIoIHRoaXMuYWNjZXNzaWJsZUlucHV0TGlzdGVuZXIgKTtcbiAgICB9XG4gICAgLy8gT3RoZXJ3aXNlIG91ciBocmVmIGlzIGEge3N0cmluZ30sIGFuZCB3ZSBzaG91bGQgb3BlbiBhIHdpbmRvdyBwb2ludGluZyB0byBpdCAoYXNzdW1pbmcgaXQncyBhIFVSTClcbiAgICBlbHNlIHtcbiAgICAgIHRoaXMuZmlyZUxpc3RlbmVyID0gbmV3IEZpcmVMaXN0ZW5lcigge1xuICAgICAgICBmaXJlOiBldmVudCA9PiB7XG4gICAgICAgICAgaWYgKCBldmVudC5pc0Zyb21QRE9NKCkgKSB7XG5cbiAgICAgICAgICAgIC8vIHByZXZlbnQgZGVmYXVsdCBmcm9tIHBkb20gYWN0aXZhdGlvbiBzbyB3ZSBkb24ndCBhbHNvIG9wZW4gYSBuZXcgdGFiIGZyb20gbmF0aXZlIERPTSBpbnB1dCBvbiBhIGxpbmtcbiAgICAgICAgICAgIGV2ZW50LmRvbUV2ZW50IS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgIH1cbiAgICAgICAgICAvLyBAdHMtZXhwZWN0LWVycm9yIFRPRE8gVE9ETyBUT0RPIHRoaXMgaXMgYSBidWchIEhvdyBkbyB3ZSBoYW5kbGUgdGhpcz8gaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3NjZW5lcnkvaXNzdWVzLzE1ODFcbiAgICAgICAgICBzZWxmLl9saW5rRXZlbnRzSGFuZGxlZCAmJiBldmVudC5oYW5kbGUoKTtcbiAgICAgICAgICBvcGVuUG9wdXAoIGhyZWYgKTsgLy8gb3BlbiBpbiBhIG5ldyB3aW5kb3cvdGFiXG4gICAgICAgIH0sXG4gICAgICAgIHRhbmRlbTogVGFuZGVtLk9QVF9PVVRcbiAgICAgIH0gKTtcbiAgICAgIHRoaXMuYWRkSW5wdXRMaXN0ZW5lciggdGhpcy5maXJlTGlzdGVuZXIgKTtcbiAgICAgIHRoaXMuc2V0UERPTUF0dHJpYnV0ZSggJ2hyZWYnLCBocmVmICk7XG4gICAgICB0aGlzLnNldFBET01BdHRyaWJ1dGUoICd0YXJnZXQnLCAnX2JsYW5rJyApO1xuXG4gICAgICB0aGlzLmFsbG93TGlua3NMaXN0ZW5lciA9ICggYWxsb3dMaW5rczogYm9vbGVhbiApID0+IHtcbiAgICAgICAgdGhpcy52aXNpYmxlID0gYWxsb3dMaW5rcztcbiAgICAgIH07XG4gICAgICBhbGxvd0xpbmtzUHJvcGVydHkubGluayggdGhpcy5hbGxvd0xpbmtzTGlzdGVuZXIgKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBDbGVhbnMgcmVmZXJlbmNlcyB0aGF0IGNvdWxkIGNhdXNlIG1lbW9yeSBsZWFrcyAoYXMgdGhvc2UgdGhpbmdzIG1heSBjb250YWluIG90aGVyIHJlZmVyZW5jZXMpLlxuICAgKi9cbiAgcHVibGljIG92ZXJyaWRlIGNsZWFuKCk6IHZvaWQge1xuICAgIHN1cGVyLmNsZWFuKCk7XG5cbiAgICBpZiAoIHRoaXMuZmlyZUxpc3RlbmVyICkge1xuICAgICAgdGhpcy5yZW1vdmVJbnB1dExpc3RlbmVyKCB0aGlzLmZpcmVMaXN0ZW5lciApO1xuICAgICAgdGhpcy5maXJlTGlzdGVuZXIuZGlzcG9zZSgpO1xuICAgIH1cbiAgICB0aGlzLmZpcmVMaXN0ZW5lciA9IG51bGw7XG4gICAgaWYgKCB0aGlzLmFjY2Vzc2libGVJbnB1dExpc3RlbmVyICkge1xuICAgICAgdGhpcy5yZW1vdmVJbnB1dExpc3RlbmVyKCB0aGlzLmFjY2Vzc2libGVJbnB1dExpc3RlbmVyICk7XG4gICAgICB0aGlzLmFjY2Vzc2libGVJbnB1dExpc3RlbmVyID0gbnVsbDtcbiAgICB9XG4gICAgaWYgKCB0aGlzLmFsbG93TGlua3NMaXN0ZW5lciApIHtcbiAgICAgIGFsbG93TGlua3NQcm9wZXJ0eS51bmxpbmsoIHRoaXMuYWxsb3dMaW5rc0xpc3RlbmVyICk7XG4gICAgICB0aGlzLmFsbG93TGlua3NMaXN0ZW5lciA9IG51bGw7XG4gICAgfVxuICB9XG5cbiAgcHVibGljIGZyZWVUb1Bvb2woKTogdm9pZCB7XG4gICAgUmljaFRleHRMaW5rLnBvb2wuZnJlZVRvUG9vbCggdGhpcyApO1xuICB9XG5cbiAgcHVibGljIHN0YXRpYyByZWFkb25seSBwb29sID0gbmV3IFBvb2woIFJpY2hUZXh0TGluayApO1xufVxuXG5zY2VuZXJ5LnJlZ2lzdGVyKCAnUmljaFRleHRMaW5rJywgUmljaFRleHRMaW5rICk7Il0sIm5hbWVzIjpbIlBvb2wiLCJUYW5kZW0iLCJhbGxvd0xpbmtzUHJvcGVydHkiLCJGaXJlTGlzdGVuZXIiLCJOb2RlIiwib3BlblBvcHVwIiwiUmljaFRleHRDbGVhbmFibGUiLCJzY2VuZXJ5IiwiVm9pY2luZyIsIlJpY2hUZXh0TGluayIsImluaXRpYWxpemUiLCJpbm5lckNvbnRlbnQiLCJocmVmIiwiaW5pdGlhbGl6ZVN1cGVyIiwidm9pY2luZ05hbWVSZXNwb25zZSIsImZpcmVMaXN0ZW5lciIsImZpcmUiLCJ0YW5kZW0iLCJPUFRfT1VUIiwiYWRkSW5wdXRMaXN0ZW5lciIsInNldFBET01BdHRyaWJ1dGUiLCJhY2Nlc3NpYmxlSW5wdXRMaXN0ZW5lciIsImNsaWNrIiwiZXZlbnQiLCJkb21FdmVudCIsInByZXZlbnREZWZhdWx0IiwiaXNGcm9tUERPTSIsInNlbGYiLCJfbGlua0V2ZW50c0hhbmRsZWQiLCJoYW5kbGUiLCJhbGxvd0xpbmtzTGlzdGVuZXIiLCJhbGxvd0xpbmtzIiwidmlzaWJsZSIsImxpbmsiLCJjbGVhbiIsInJlbW92ZUlucHV0TGlzdGVuZXIiLCJkaXNwb3NlIiwidW5saW5rIiwiZnJlZVRvUG9vbCIsInBvb2wiLCJtdXRhdGUiLCJjdXJzb3IiLCJ0YWdOYW1lIiwicmVnaXN0ZXIiXSwibWFwcGluZ3MiOiJBQUFBLHNEQUFzRDtBQUV0RDs7Ozs7Q0FLQyxHQUNELE9BQU9BLFVBQXlCLG1DQUFtQztBQUNuRSxPQUFPQyxZQUFZLGtDQUFrQztBQUNyRCxTQUFTQyxrQkFBa0IsRUFBRUMsWUFBWSxFQUFFQyxJQUFJLEVBQUVDLFNBQVMsRUFBRUMsaUJBQWlCLEVBQWdCQyxPQUFPLEVBQWtCQyxPQUFPLFFBQVEsbUJBQW1CO0FBRXpJLElBQUEsQUFBTUMsZUFBTixNQUFNQSxxQkFBcUJELFFBQVNGLGtCQUFtQkY7SUFvQnBFOzs7R0FHQyxHQUNELEFBQWdCTSxXQUFZQyxZQUFvQixFQUFFQyxJQUFrQixFQUFFQyxrQkFBa0IsSUFBSSxFQUFTO1FBRW5HLElBQUtBLGlCQUFrQjtZQUNyQixLQUFLLENBQUNIO1FBQ1I7UUFFQSxzRUFBc0U7UUFDdEUsd0RBQXdEO1FBQ3hELElBQUksQ0FBQ0MsWUFBWSxHQUFHQTtRQUVwQixJQUFJLENBQUNHLG1CQUFtQixHQUFHSDtRQUUzQixrRkFBa0Y7UUFDbEYsSUFBSyxPQUFPQyxTQUFTLFlBQWE7WUFDaEMsSUFBSSxDQUFDRyxZQUFZLEdBQUcsSUFBSVosYUFBYztnQkFDcENhLE1BQU1KO2dCQUNOSyxRQUFRaEIsT0FBT2lCLE9BQU87WUFDeEI7WUFDQSxJQUFJLENBQUNDLGdCQUFnQixDQUFFLElBQUksQ0FBQ0osWUFBWTtZQUN4QyxJQUFJLENBQUNLLGdCQUFnQixDQUFFLFFBQVEsTUFBTyx1REFBdUQ7WUFDN0YsSUFBSSxDQUFDQSxnQkFBZ0IsQ0FBRSxVQUFVLFVBQVcsMkRBQTJEO1lBQ3ZHLElBQUksQ0FBQ0MsdUJBQXVCLEdBQUc7Z0JBQzdCQyxPQUFPQyxDQUFBQTtvQkFDTEEsTUFBTUMsUUFBUSxJQUFJRCxNQUFNQyxRQUFRLENBQUNDLGNBQWM7b0JBRS9DYjtnQkFDRjtZQUNGO1lBQ0EsSUFBSSxDQUFDTyxnQkFBZ0IsQ0FBRSxJQUFJLENBQUNFLHVCQUF1QjtRQUNyRCxPQUVLO1lBQ0gsSUFBSSxDQUFDTixZQUFZLEdBQUcsSUFBSVosYUFBYztnQkFDcENhLE1BQU1PLENBQUFBO29CQUNKLElBQUtBLE1BQU1HLFVBQVUsSUFBSzt3QkFFeEIsdUdBQXVHO3dCQUN2R0gsTUFBTUMsUUFBUSxDQUFFQyxjQUFjO29CQUNoQztvQkFDQSx3SEFBd0g7b0JBQ3hIRSxLQUFLQyxrQkFBa0IsSUFBSUwsTUFBTU0sTUFBTTtvQkFDdkN4QixVQUFXTyxPQUFRLDJCQUEyQjtnQkFDaEQ7Z0JBQ0FLLFFBQVFoQixPQUFPaUIsT0FBTztZQUN4QjtZQUNBLElBQUksQ0FBQ0MsZ0JBQWdCLENBQUUsSUFBSSxDQUFDSixZQUFZO1lBQ3hDLElBQUksQ0FBQ0ssZ0JBQWdCLENBQUUsUUFBUVI7WUFDL0IsSUFBSSxDQUFDUSxnQkFBZ0IsQ0FBRSxVQUFVO1lBRWpDLElBQUksQ0FBQ1Usa0JBQWtCLEdBQUcsQ0FBRUM7Z0JBQzFCLElBQUksQ0FBQ0MsT0FBTyxHQUFHRDtZQUNqQjtZQUNBN0IsbUJBQW1CK0IsSUFBSSxDQUFFLElBQUksQ0FBQ0gsa0JBQWtCO1FBQ2xEO1FBRUEsT0FBTyxJQUFJO0lBQ2I7SUFFQTs7R0FFQyxHQUNELEFBQWdCSSxRQUFjO1FBQzVCLEtBQUssQ0FBQ0E7UUFFTixJQUFLLElBQUksQ0FBQ25CLFlBQVksRUFBRztZQUN2QixJQUFJLENBQUNvQixtQkFBbUIsQ0FBRSxJQUFJLENBQUNwQixZQUFZO1lBQzNDLElBQUksQ0FBQ0EsWUFBWSxDQUFDcUIsT0FBTztRQUMzQjtRQUNBLElBQUksQ0FBQ3JCLFlBQVksR0FBRztRQUNwQixJQUFLLElBQUksQ0FBQ00sdUJBQXVCLEVBQUc7WUFDbEMsSUFBSSxDQUFDYyxtQkFBbUIsQ0FBRSxJQUFJLENBQUNkLHVCQUF1QjtZQUN0RCxJQUFJLENBQUNBLHVCQUF1QixHQUFHO1FBQ2pDO1FBQ0EsSUFBSyxJQUFJLENBQUNTLGtCQUFrQixFQUFHO1lBQzdCNUIsbUJBQW1CbUMsTUFBTSxDQUFFLElBQUksQ0FBQ1Asa0JBQWtCO1lBQ2xELElBQUksQ0FBQ0Esa0JBQWtCLEdBQUc7UUFDNUI7SUFDRjtJQUVPUSxhQUFtQjtRQUN4QjdCLGFBQWE4QixJQUFJLENBQUNELFVBQVUsQ0FBRSxJQUFJO0lBQ3BDO0lBbkdBLFlBQW9CM0IsWUFBb0IsRUFBRUMsSUFBa0IsQ0FBRztRQUM3RCxLQUFLLFNBTENHLGVBQW9DLFdBQ3BDTSwwQkFBaUQsV0FDakRTLHFCQUFpRTtRQUt2RSxpSEFBaUg7UUFDakgseURBQXlEO1FBQ3pELElBQUksQ0FBQ3BCLFVBQVUsQ0FBRUMsY0FBY0MsTUFBTTtRQUVyQyx5REFBeUQ7UUFDekQsSUFBSSxDQUFDNEIsTUFBTSxDQUFFO1lBQ1hDLFFBQVE7WUFDUkMsU0FBUztRQUNYO0lBQ0Y7QUEwRkY7QUE1R3FCakMsYUEyR0k4QixPQUFPLElBQUl2QyxLQUFNUztBQTNHMUMsU0FBcUJBLDBCQTRHcEI7QUFFREYsUUFBUW9DLFFBQVEsQ0FBRSxnQkFBZ0JsQyJ9