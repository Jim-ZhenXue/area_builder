// Copyright 2022-2024, University of Colorado Boulder
/**
 * When enabled, shows a grid across the play area that helps the user to make quantitative comparisons
 * between distances.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Aaron Davis (PhET Interactive Simulations)
 * @author Agustín Vallejo
 */ import { Shape } from '../../kite/js/imports.js';
import optionize from '../../phet-core/js/optionize.js';
import { Path } from '../../scenery/js/imports.js';
import sceneryPhet from './sceneryPhet.js';
let GridNode = class GridNode extends Path {
    /**
   * @param transformProperty
   * @param spacing - spacing between grid lines
   * @param center - center of the grid in model coordinates
   * @param numberOfGridLines - number of grid lines on each side of the center
   * @param [providedOptions]
   */ constructor(transformProperty, spacing, center, numberOfGridLines, providedOptions){
        const options = optionize()({
            stroke: 'gray'
        }, providedOptions);
        super(null, options);
        transformProperty.link((transform)=>{
            const shape = new Shape();
            const x1 = -numberOfGridLines * spacing + center.x;
            const x2 = numberOfGridLines * spacing + center.x;
            const y1 = -numberOfGridLines * spacing + center.y;
            const y2 = numberOfGridLines * spacing + center.y;
            for(let i = -numberOfGridLines; i <= numberOfGridLines; i++){
                const x = i * spacing + center.x;
                const y = i * spacing + center.y;
                shape.moveTo(x1, y).lineTo(x2, y); // horizontal lines
                shape.moveTo(x, y1).lineTo(x, y2); // vertical lines
            }
            this.shape = transform.modelToViewShape(shape);
        });
    }
};
export { GridNode as default };
sceneryPhet.register('GridNode', GridNode);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9HcmlkTm9kZS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAyMi0yMDI0LCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuLyoqXG4gKiBXaGVuIGVuYWJsZWQsIHNob3dzIGEgZ3JpZCBhY3Jvc3MgdGhlIHBsYXkgYXJlYSB0aGF0IGhlbHBzIHRoZSB1c2VyIHRvIG1ha2UgcXVhbnRpdGF0aXZlIGNvbXBhcmlzb25zXG4gKiBiZXR3ZWVuIGRpc3RhbmNlcy5cbiAqXG4gKiBAYXV0aG9yIFNhbSBSZWlkIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxuICogQGF1dGhvciBBYXJvbiBEYXZpcyAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcbiAqIEBhdXRob3IgQWd1c3TDrW4gVmFsbGVqb1xuICovXG5cbmltcG9ydCBUUmVhZE9ubHlQcm9wZXJ0eSBmcm9tICcuLi8uLi9heG9uL2pzL1RSZWFkT25seVByb3BlcnR5LmpzJztcbmltcG9ydCBWZWN0b3IyIGZyb20gJy4uLy4uL2RvdC9qcy9WZWN0b3IyLmpzJztcbmltcG9ydCB7IFNoYXBlIH0gZnJvbSAnLi4vLi4va2l0ZS9qcy9pbXBvcnRzLmpzJztcbmltcG9ydCBvcHRpb25pemUsIHsgRW1wdHlTZWxmT3B0aW9ucyB9IGZyb20gJy4uLy4uL3BoZXQtY29yZS9qcy9vcHRpb25pemUuanMnO1xuaW1wb3J0IE1vZGVsVmlld1RyYW5zZm9ybTIgZnJvbSAnLi4vLi4vcGhldGNvbW1vbi9qcy92aWV3L01vZGVsVmlld1RyYW5zZm9ybTIuanMnO1xuaW1wb3J0IHsgUGF0aCwgUGF0aE9wdGlvbnMgfSBmcm9tICcuLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xuaW1wb3J0IHNjZW5lcnlQaGV0IGZyb20gJy4vc2NlbmVyeVBoZXQuanMnO1xuXG50eXBlIFNlbGZPcHRpb25zID0gRW1wdHlTZWxmT3B0aW9ucztcblxuZXhwb3J0IHR5cGUgR3JpZE5vZGVPcHRpb25zID0gU2VsZk9wdGlvbnMgJiBQYXRoT3B0aW9ucztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgR3JpZE5vZGUgZXh0ZW5kcyBQYXRoIHtcblxuICAvKipcbiAgICogQHBhcmFtIHRyYW5zZm9ybVByb3BlcnR5XG4gICAqIEBwYXJhbSBzcGFjaW5nIC0gc3BhY2luZyBiZXR3ZWVuIGdyaWQgbGluZXNcbiAgICogQHBhcmFtIGNlbnRlciAtIGNlbnRlciBvZiB0aGUgZ3JpZCBpbiBtb2RlbCBjb29yZGluYXRlc1xuICAgKiBAcGFyYW0gbnVtYmVyT2ZHcmlkTGluZXMgLSBudW1iZXIgb2YgZ3JpZCBsaW5lcyBvbiBlYWNoIHNpZGUgb2YgdGhlIGNlbnRlclxuICAgKiBAcGFyYW0gW3Byb3ZpZGVkT3B0aW9uc11cbiAgICovXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggdHJhbnNmb3JtUHJvcGVydHk6IFRSZWFkT25seVByb3BlcnR5PE1vZGVsVmlld1RyYW5zZm9ybTI+LCBzcGFjaW5nOiBudW1iZXIsIGNlbnRlcjogVmVjdG9yMiwgbnVtYmVyT2ZHcmlkTGluZXM6IG51bWJlciwgcHJvdmlkZWRPcHRpb25zPzogR3JpZE5vZGVPcHRpb25zICkge1xuXG4gICAgY29uc3Qgb3B0aW9ucyA9IG9wdGlvbml6ZTxHcmlkTm9kZU9wdGlvbnMsIFNlbGZPcHRpb25zLCBQYXRoT3B0aW9ucz4oKSgge1xuICAgICAgc3Ryb2tlOiAnZ3JheSdcbiAgICB9LCBwcm92aWRlZE9wdGlvbnMgKTtcblxuICAgIHN1cGVyKCBudWxsLCBvcHRpb25zICk7XG5cbiAgICB0cmFuc2Zvcm1Qcm9wZXJ0eS5saW5rKCAoIHRyYW5zZm9ybTogTW9kZWxWaWV3VHJhbnNmb3JtMiApID0+IHtcbiAgICAgIGNvbnN0IHNoYXBlID0gbmV3IFNoYXBlKCk7XG5cbiAgICAgIGNvbnN0IHgxID0gLW51bWJlck9mR3JpZExpbmVzICogc3BhY2luZyArIGNlbnRlci54O1xuICAgICAgY29uc3QgeDIgPSBudW1iZXJPZkdyaWRMaW5lcyAqIHNwYWNpbmcgKyBjZW50ZXIueDtcbiAgICAgIGNvbnN0IHkxID0gLW51bWJlck9mR3JpZExpbmVzICogc3BhY2luZyArIGNlbnRlci55O1xuICAgICAgY29uc3QgeTIgPSBudW1iZXJPZkdyaWRMaW5lcyAqIHNwYWNpbmcgKyBjZW50ZXIueTtcblxuICAgICAgZm9yICggbGV0IGkgPSAtbnVtYmVyT2ZHcmlkTGluZXM7IGkgPD0gbnVtYmVyT2ZHcmlkTGluZXM7IGkrKyApIHtcbiAgICAgICAgY29uc3QgeCA9IGkgKiBzcGFjaW5nICsgY2VudGVyLng7XG4gICAgICAgIGNvbnN0IHkgPSBpICogc3BhY2luZyArIGNlbnRlci55O1xuICAgICAgICBzaGFwZS5tb3ZlVG8oIHgxLCB5ICkubGluZVRvKCB4MiwgeSApOyAvLyBob3Jpem9udGFsIGxpbmVzXG4gICAgICAgIHNoYXBlLm1vdmVUbyggeCwgeTEgKS5saW5lVG8oIHgsIHkyICk7IC8vIHZlcnRpY2FsIGxpbmVzXG4gICAgICB9XG5cbiAgICAgIHRoaXMuc2hhcGUgPSB0cmFuc2Zvcm0ubW9kZWxUb1ZpZXdTaGFwZSggc2hhcGUgKTtcbiAgICB9ICk7XG4gIH1cbn1cblxuc2NlbmVyeVBoZXQucmVnaXN0ZXIoICdHcmlkTm9kZScsIEdyaWROb2RlICk7Il0sIm5hbWVzIjpbIlNoYXBlIiwib3B0aW9uaXplIiwiUGF0aCIsInNjZW5lcnlQaGV0IiwiR3JpZE5vZGUiLCJ0cmFuc2Zvcm1Qcm9wZXJ0eSIsInNwYWNpbmciLCJjZW50ZXIiLCJudW1iZXJPZkdyaWRMaW5lcyIsInByb3ZpZGVkT3B0aW9ucyIsIm9wdGlvbnMiLCJzdHJva2UiLCJsaW5rIiwidHJhbnNmb3JtIiwic2hhcGUiLCJ4MSIsIngiLCJ4MiIsInkxIiwieSIsInkyIiwiaSIsIm1vdmVUbyIsImxpbmVUbyIsIm1vZGVsVG9WaWV3U2hhcGUiLCJyZWdpc3RlciJdLCJtYXBwaW5ncyI6IkFBQUEsc0RBQXNEO0FBRXREOzs7Ozs7O0NBT0MsR0FJRCxTQUFTQSxLQUFLLFFBQVEsMkJBQTJCO0FBQ2pELE9BQU9DLGVBQXFDLGtDQUFrQztBQUU5RSxTQUFTQyxJQUFJLFFBQXFCLDhCQUE4QjtBQUNoRSxPQUFPQyxpQkFBaUIsbUJBQW1CO0FBTTVCLElBQUEsQUFBTUMsV0FBTixNQUFNQSxpQkFBaUJGO0lBRXBDOzs7Ozs7R0FNQyxHQUNELFlBQW9CRyxpQkFBeUQsRUFBRUMsT0FBZSxFQUFFQyxNQUFlLEVBQUVDLGlCQUF5QixFQUFFQyxlQUFpQyxDQUFHO1FBRTlLLE1BQU1DLFVBQVVULFlBQXdEO1lBQ3RFVSxRQUFRO1FBQ1YsR0FBR0Y7UUFFSCxLQUFLLENBQUUsTUFBTUM7UUFFYkwsa0JBQWtCTyxJQUFJLENBQUUsQ0FBRUM7WUFDeEIsTUFBTUMsUUFBUSxJQUFJZDtZQUVsQixNQUFNZSxLQUFLLENBQUNQLG9CQUFvQkYsVUFBVUMsT0FBT1MsQ0FBQztZQUNsRCxNQUFNQyxLQUFLVCxvQkFBb0JGLFVBQVVDLE9BQU9TLENBQUM7WUFDakQsTUFBTUUsS0FBSyxDQUFDVixvQkFBb0JGLFVBQVVDLE9BQU9ZLENBQUM7WUFDbEQsTUFBTUMsS0FBS1osb0JBQW9CRixVQUFVQyxPQUFPWSxDQUFDO1lBRWpELElBQU0sSUFBSUUsSUFBSSxDQUFDYixtQkFBbUJhLEtBQUtiLG1CQUFtQmEsSUFBTTtnQkFDOUQsTUFBTUwsSUFBSUssSUFBSWYsVUFBVUMsT0FBT1MsQ0FBQztnQkFDaEMsTUFBTUcsSUFBSUUsSUFBSWYsVUFBVUMsT0FBT1ksQ0FBQztnQkFDaENMLE1BQU1RLE1BQU0sQ0FBRVAsSUFBSUksR0FBSUksTUFBTSxDQUFFTixJQUFJRSxJQUFLLG1CQUFtQjtnQkFDMURMLE1BQU1RLE1BQU0sQ0FBRU4sR0FBR0UsSUFBS0ssTUFBTSxDQUFFUCxHQUFHSSxLQUFNLGlCQUFpQjtZQUMxRDtZQUVBLElBQUksQ0FBQ04sS0FBSyxHQUFHRCxVQUFVVyxnQkFBZ0IsQ0FBRVY7UUFDM0M7SUFDRjtBQUNGO0FBbkNBLFNBQXFCVixzQkFtQ3BCO0FBRURELFlBQVlzQixRQUFRLENBQUUsWUFBWXJCIn0=