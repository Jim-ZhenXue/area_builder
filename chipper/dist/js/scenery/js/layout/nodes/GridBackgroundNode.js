// Copyright 2021-2024, University of Colorado Boulder
/**
 * Displays a background for a given GridConstraint.
 *
 * NOTE: If there are "holes" in the GridBox/GridConstraint (where there is no cell content for an x/y position), then
 * there will be no background for where those cells (if added) would have been.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ import assertMutuallyExclusiveOptions from '../../../../phet-core/js/assertMutuallyExclusiveOptions.js';
import optionize from '../../../../phet-core/js/optionize.js';
import { Node, Rectangle, scenery } from '../../imports.js';
let GridBackgroundNode = class GridBackgroundNode extends Node {
    update() {
        this.children = this.constraint.displayedCells.map(this.createCellBackground).filter(_.identity);
    }
    /**
   * Releases references
   */ dispose() {
        this.constraint.finishedLayoutEmitter.removeListener(this.layoutListener);
        super.dispose();
    }
    constructor(constraint, providedOptions){
        // Don't permit fill/stroke when createCellBackground is provided
        assertMutuallyExclusiveOptions(providedOptions, [
            'createCellBackground'
        ], [
            'fill',
            'stroke'
        ]);
        const defaultCreateCellBackground = (cell)=>{
            return Rectangle.bounds(cell.lastAvailableBounds, {
                fill: options.fill,
                stroke: options.stroke
            });
        };
        const options = optionize()({
            fill: 'white',
            stroke: 'black',
            createCellBackground: defaultCreateCellBackground
        }, providedOptions);
        super();
        this.constraint = constraint;
        this.createCellBackground = options.createCellBackground;
        this.layoutListener = this.update.bind(this);
        this.constraint.finishedLayoutEmitter.addListener(this.layoutListener);
        this.update();
        this.mutate(options);
    }
};
export { GridBackgroundNode as default };
scenery.register('GridBackgroundNode', GridBackgroundNode);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvbGF5b3V0L25vZGVzL0dyaWRCYWNrZ3JvdW5kTm9kZS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAyMS0yMDI0LCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuLyoqXG4gKiBEaXNwbGF5cyBhIGJhY2tncm91bmQgZm9yIGEgZ2l2ZW4gR3JpZENvbnN0cmFpbnQuXG4gKlxuICogTk9URTogSWYgdGhlcmUgYXJlIFwiaG9sZXNcIiBpbiB0aGUgR3JpZEJveC9HcmlkQ29uc3RyYWludCAod2hlcmUgdGhlcmUgaXMgbm8gY2VsbCBjb250ZW50IGZvciBhbiB4L3kgcG9zaXRpb24pLCB0aGVuXG4gKiB0aGVyZSB3aWxsIGJlIG5vIGJhY2tncm91bmQgZm9yIHdoZXJlIHRob3NlIGNlbGxzIChpZiBhZGRlZCkgd291bGQgaGF2ZSBiZWVuLlxuICpcbiAqIEBhdXRob3IgSm9uYXRoYW4gT2xzb24gPGpvbmF0aGFuLm9sc29uQGNvbG9yYWRvLmVkdT5cbiAqL1xuXG5pbXBvcnQgYXNzZXJ0TXV0dWFsbHlFeGNsdXNpdmVPcHRpb25zIGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9hc3NlcnRNdXR1YWxseUV4Y2x1c2l2ZU9wdGlvbnMuanMnO1xuaW1wb3J0IG9wdGlvbml6ZSBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvb3B0aW9uaXplLmpzJztcbmltcG9ydCB7IEdyaWRDZWxsLCBHcmlkQ29uc3RyYWludCwgTm9kZSwgTm9kZU9wdGlvbnMsIFJlY3RhbmdsZSwgc2NlbmVyeSwgVFBhaW50IH0gZnJvbSAnLi4vLi4vaW1wb3J0cy5qcyc7XG5cbnR5cGUgQ3JlYXRlQ2VsbEJhY2tncm91bmQgPSAoIGdyaWRDZWxsOiBHcmlkQ2VsbCApID0+IE5vZGUgfCBudWxsO1xudHlwZSBTZWxmT3B0aW9ucyA9IHtcbiAgLy8gQWxsb3dzIGZ1bGwgY3VzdG9taXphdGlvbiBvZiB0aGUgYmFja2dyb3VuZCBmb3IgZWFjaCBjZWxsLiBUaGUgY2VsbCBpcyBwYXNzZWQgaW4sIGFuZCBjYW4gYmUgdXNlZCBpbiBhbnkgd2F5IHRvXG4gIC8vIGdlbmVyYXRlIHRoZSBiYWNrZ3JvdW5kLiBgY2VsbC5sYXN0QXZhaWxhYmxlQm91bmRzYCBpcyB0aGUgYm91bmRzIHRvIHByb3ZpZGUuIGBjZWxsLnBvc2l0aW9uLmhvcml6b250YWxgIGFuZFxuICAvLyBgY2VsbC5wb3NpdGlvbi52ZXJ0aWNhbGAgYXJlIHRoZSByb3cgYW5kIGNvbHVtbiBpbmRpY2VzIG9mIHRoZSBjZWxsLiBgY2VsbC5zaXplYCBjYW4gYWxzbyBiZSB1c2VkLlxuICBjcmVhdGVDZWxsQmFja2dyb3VuZD86IENyZWF0ZUNlbGxCYWNrZ3JvdW5kO1xuXG4gIC8vIElmIG5vIGNyZWF0ZUNlbGxCYWNrZ3JvdW5kIGlzIHByb3ZpZGVkLCB0aGVzZSB3aWxsIGJlIHVzZWQgZm9yIHRoZSBmaWxsL3N0cm9rZSBvZiB0aGUgUmVjdGFuZ2xlIGNyZWF0ZWQgZm9yIHRoZVxuICAvLyBjZWxscy5cbiAgZmlsbD86IFRQYWludDtcbiAgc3Ryb2tlPzogVFBhaW50O1xufTtcblxuZXhwb3J0IHR5cGUgR3JpZEJhY2tncm91bmROb2RlT3B0aW9ucyA9IFNlbGZPcHRpb25zICYgTm9kZU9wdGlvbnM7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEdyaWRCYWNrZ3JvdW5kTm9kZSBleHRlbmRzIE5vZGUge1xuXG4gIHByaXZhdGUgcmVhZG9ubHkgY29uc3RyYWludDogR3JpZENvbnN0cmFpbnQ7XG4gIHByaXZhdGUgcmVhZG9ubHkgY3JlYXRlQ2VsbEJhY2tncm91bmQ6IENyZWF0ZUNlbGxCYWNrZ3JvdW5kO1xuICBwcml2YXRlIHJlYWRvbmx5IGxheW91dExpc3RlbmVyOiAoKSA9PiB2b2lkO1xuXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggY29uc3RyYWludDogR3JpZENvbnN0cmFpbnQsIHByb3ZpZGVkT3B0aW9ucz86IEdyaWRCYWNrZ3JvdW5kTm9kZU9wdGlvbnMgKSB7XG5cbiAgICAvLyBEb24ndCBwZXJtaXQgZmlsbC9zdHJva2Ugd2hlbiBjcmVhdGVDZWxsQmFja2dyb3VuZCBpcyBwcm92aWRlZFxuICAgIGFzc2VydE11dHVhbGx5RXhjbHVzaXZlT3B0aW9ucyggcHJvdmlkZWRPcHRpb25zLCBbICdjcmVhdGVDZWxsQmFja2dyb3VuZCcgXSwgWyAnZmlsbCcsICdzdHJva2UnIF0gKTtcblxuICAgIGNvbnN0IGRlZmF1bHRDcmVhdGVDZWxsQmFja2dyb3VuZCA9ICggY2VsbDogR3JpZENlbGwgKTogUmVjdGFuZ2xlID0+IHtcbiAgICAgIHJldHVybiBSZWN0YW5nbGUuYm91bmRzKCBjZWxsLmxhc3RBdmFpbGFibGVCb3VuZHMsIHtcbiAgICAgICAgZmlsbDogb3B0aW9ucy5maWxsLFxuICAgICAgICBzdHJva2U6IG9wdGlvbnMuc3Ryb2tlXG4gICAgICB9ICk7XG4gICAgfTtcblxuICAgIGNvbnN0IG9wdGlvbnMgPSBvcHRpb25pemU8R3JpZEJhY2tncm91bmROb2RlT3B0aW9ucywgU2VsZk9wdGlvbnMsIE5vZGVPcHRpb25zPigpKCB7XG4gICAgICBmaWxsOiAnd2hpdGUnLFxuICAgICAgc3Ryb2tlOiAnYmxhY2snLFxuICAgICAgY3JlYXRlQ2VsbEJhY2tncm91bmQ6IGRlZmF1bHRDcmVhdGVDZWxsQmFja2dyb3VuZFxuICAgIH0sIHByb3ZpZGVkT3B0aW9ucyApO1xuXG4gICAgc3VwZXIoKTtcblxuICAgIHRoaXMuY29uc3RyYWludCA9IGNvbnN0cmFpbnQ7XG4gICAgdGhpcy5jcmVhdGVDZWxsQmFja2dyb3VuZCA9IG9wdGlvbnMuY3JlYXRlQ2VsbEJhY2tncm91bmQ7XG4gICAgdGhpcy5sYXlvdXRMaXN0ZW5lciA9IHRoaXMudXBkYXRlLmJpbmQoIHRoaXMgKTtcbiAgICB0aGlzLmNvbnN0cmFpbnQuZmluaXNoZWRMYXlvdXRFbWl0dGVyLmFkZExpc3RlbmVyKCB0aGlzLmxheW91dExpc3RlbmVyICk7XG4gICAgdGhpcy51cGRhdGUoKTtcblxuICAgIHRoaXMubXV0YXRlKCBvcHRpb25zICk7XG4gIH1cblxuICBwcml2YXRlIHVwZGF0ZSgpOiB2b2lkIHtcbiAgICB0aGlzLmNoaWxkcmVuID0gdGhpcy5jb25zdHJhaW50LmRpc3BsYXllZENlbGxzLm1hcCggdGhpcy5jcmVhdGVDZWxsQmFja2dyb3VuZCApLmZpbHRlciggXy5pZGVudGl0eSApIGFzIE5vZGVbXTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZWxlYXNlcyByZWZlcmVuY2VzXG4gICAqL1xuICBwdWJsaWMgb3ZlcnJpZGUgZGlzcG9zZSgpOiB2b2lkIHtcbiAgICB0aGlzLmNvbnN0cmFpbnQuZmluaXNoZWRMYXlvdXRFbWl0dGVyLnJlbW92ZUxpc3RlbmVyKCB0aGlzLmxheW91dExpc3RlbmVyICk7XG5cbiAgICBzdXBlci5kaXNwb3NlKCk7XG4gIH1cbn1cblxuc2NlbmVyeS5yZWdpc3RlciggJ0dyaWRCYWNrZ3JvdW5kTm9kZScsIEdyaWRCYWNrZ3JvdW5kTm9kZSApOyJdLCJuYW1lcyI6WyJhc3NlcnRNdXR1YWxseUV4Y2x1c2l2ZU9wdGlvbnMiLCJvcHRpb25pemUiLCJOb2RlIiwiUmVjdGFuZ2xlIiwic2NlbmVyeSIsIkdyaWRCYWNrZ3JvdW5kTm9kZSIsInVwZGF0ZSIsImNoaWxkcmVuIiwiY29uc3RyYWludCIsImRpc3BsYXllZENlbGxzIiwibWFwIiwiY3JlYXRlQ2VsbEJhY2tncm91bmQiLCJmaWx0ZXIiLCJfIiwiaWRlbnRpdHkiLCJkaXNwb3NlIiwiZmluaXNoZWRMYXlvdXRFbWl0dGVyIiwicmVtb3ZlTGlzdGVuZXIiLCJsYXlvdXRMaXN0ZW5lciIsInByb3ZpZGVkT3B0aW9ucyIsImRlZmF1bHRDcmVhdGVDZWxsQmFja2dyb3VuZCIsImNlbGwiLCJib3VuZHMiLCJsYXN0QXZhaWxhYmxlQm91bmRzIiwiZmlsbCIsIm9wdGlvbnMiLCJzdHJva2UiLCJiaW5kIiwiYWRkTGlzdGVuZXIiLCJtdXRhdGUiLCJyZWdpc3RlciJdLCJtYXBwaW5ncyI6IkFBQUEsc0RBQXNEO0FBRXREOzs7Ozs7O0NBT0MsR0FFRCxPQUFPQSxvQ0FBb0MsNkRBQTZEO0FBQ3hHLE9BQU9DLGVBQWUsd0NBQXdDO0FBQzlELFNBQW1DQyxJQUFJLEVBQWVDLFNBQVMsRUFBRUMsT0FBTyxRQUFnQixtQkFBbUI7QUFpQjVGLElBQUEsQUFBTUMscUJBQU4sTUFBTUEsMkJBQTJCSDtJQW1DdENJLFNBQWU7UUFDckIsSUFBSSxDQUFDQyxRQUFRLEdBQUcsSUFBSSxDQUFDQyxVQUFVLENBQUNDLGNBQWMsQ0FBQ0MsR0FBRyxDQUFFLElBQUksQ0FBQ0Msb0JBQW9CLEVBQUdDLE1BQU0sQ0FBRUMsRUFBRUMsUUFBUTtJQUNwRztJQUVBOztHQUVDLEdBQ0QsQUFBZ0JDLFVBQWdCO1FBQzlCLElBQUksQ0FBQ1AsVUFBVSxDQUFDUSxxQkFBcUIsQ0FBQ0MsY0FBYyxDQUFFLElBQUksQ0FBQ0MsY0FBYztRQUV6RSxLQUFLLENBQUNIO0lBQ1I7SUF4Q0EsWUFBb0JQLFVBQTBCLEVBQUVXLGVBQTJDLENBQUc7UUFFNUYsaUVBQWlFO1FBQ2pFbkIsK0JBQWdDbUIsaUJBQWlCO1lBQUU7U0FBd0IsRUFBRTtZQUFFO1lBQVE7U0FBVTtRQUVqRyxNQUFNQyw4QkFBOEIsQ0FBRUM7WUFDcEMsT0FBT2xCLFVBQVVtQixNQUFNLENBQUVELEtBQUtFLG1CQUFtQixFQUFFO2dCQUNqREMsTUFBTUMsUUFBUUQsSUFBSTtnQkFDbEJFLFFBQVFELFFBQVFDLE1BQU07WUFDeEI7UUFDRjtRQUVBLE1BQU1ELFVBQVV4QixZQUFrRTtZQUNoRnVCLE1BQU07WUFDTkUsUUFBUTtZQUNSZixzQkFBc0JTO1FBQ3hCLEdBQUdEO1FBRUgsS0FBSztRQUVMLElBQUksQ0FBQ1gsVUFBVSxHQUFHQTtRQUNsQixJQUFJLENBQUNHLG9CQUFvQixHQUFHYyxRQUFRZCxvQkFBb0I7UUFDeEQsSUFBSSxDQUFDTyxjQUFjLEdBQUcsSUFBSSxDQUFDWixNQUFNLENBQUNxQixJQUFJLENBQUUsSUFBSTtRQUM1QyxJQUFJLENBQUNuQixVQUFVLENBQUNRLHFCQUFxQixDQUFDWSxXQUFXLENBQUUsSUFBSSxDQUFDVixjQUFjO1FBQ3RFLElBQUksQ0FBQ1osTUFBTTtRQUVYLElBQUksQ0FBQ3VCLE1BQU0sQ0FBRUo7SUFDZjtBQWNGO0FBL0NBLFNBQXFCcEIsZ0NBK0NwQjtBQUVERCxRQUFRMEIsUUFBUSxDQUFFLHNCQUFzQnpCIn0=