// Copyright 2022-2024, University of Colorado Boulder
/**
 * GridIcon is the icon for an NxN grid of square cells.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */ import { Shape } from '../../kite/js/imports.js';
import optionize from '../../phet-core/js/optionize.js';
import { Path } from '../../scenery/js/imports.js';
import sceneryPhet from './sceneryPhet.js';
let GridIcon = class GridIcon extends Path {
    constructor(providedOptions){
        const options = optionize()({
            // SelfOptions
            size: 30,
            numberOfRows: 4,
            // PathOptions
            stroke: 'rgb( 100, 100, 100 )',
            lineWidth: 1
        }, providedOptions);
        assert && assert(options.size > 0, `invalid size: ${options.size}`);
        assert && assert(Number.isInteger(options.numberOfRows) && options.numberOfRows > 2, `invalid numberOfRows: ${options.numberOfRows}`);
        const shape = new Shape();
        // horizontal lines
        for(let row = 1; row < options.numberOfRows; row++){
            const y = row / options.numberOfRows * options.size;
            shape.moveTo(0, y);
            shape.lineTo(options.size, y);
        }
        // vertical lines
        const numberOfColumns = options.numberOfRows; // because the grid is NxN
        for(let column = 1; column < numberOfColumns; column++){
            const x = column / numberOfColumns * options.size;
            shape.moveTo(x, 0);
            shape.lineTo(x, options.size);
        }
        super(shape, options);
    }
};
export { GridIcon as default };
sceneryPhet.register('GridIcon', GridIcon);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9HcmlkSWNvbi50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAyMi0yMDI0LCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuLyoqXG4gKiBHcmlkSWNvbiBpcyB0aGUgaWNvbiBmb3IgYW4gTnhOIGdyaWQgb2Ygc3F1YXJlIGNlbGxzLlxuICpcbiAqIEBhdXRob3IgQ2hyaXMgTWFsbGV5IChQaXhlbFpvb20sIEluYy4pXG4gKi9cblxuaW1wb3J0IHsgU2hhcGUgfSBmcm9tICcuLi8uLi9raXRlL2pzL2ltcG9ydHMuanMnO1xuaW1wb3J0IG9wdGlvbml6ZSBmcm9tICcuLi8uLi9waGV0LWNvcmUvanMvb3B0aW9uaXplLmpzJztcbmltcG9ydCB7IFBhdGgsIFBhdGhPcHRpb25zIH0gZnJvbSAnLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcbmltcG9ydCBzY2VuZXJ5UGhldCBmcm9tICcuL3NjZW5lcnlQaGV0LmpzJztcblxudHlwZSBTZWxmT3B0aW9ucyA9IHtcbiAgc2l6ZT86IG51bWJlcjsgLy8gZGltZW5zaW9ucyBvZiB0aGUgaWNvbiwgc2FtZSBmb3Igd2lkdGggYW5kIGhlaWdodFxuICBudW1iZXJPZlJvd3M/OiBudW1iZXI7IC8vIG51bWJlciBvZiByb3dzIGluIHRoZSBncmlkLCBudW1iZXIgb2YgY29sdW1ucyB3aWxsIGJlIHRoZSBzYW1lXG59O1xuXG5leHBvcnQgdHlwZSBHcmlkSWNvbk9wdGlvbnMgPSBTZWxmT3B0aW9ucyAmIFBhdGhPcHRpb25zO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBHcmlkSWNvbiBleHRlbmRzIFBhdGgge1xuXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggcHJvdmlkZWRPcHRpb25zPzogR3JpZEljb25PcHRpb25zICkge1xuXG4gICAgY29uc3Qgb3B0aW9ucyA9IG9wdGlvbml6ZTxHcmlkSWNvbk9wdGlvbnMsIFNlbGZPcHRpb25zLCBQYXRoT3B0aW9ucz4oKSgge1xuXG4gICAgICAvLyBTZWxmT3B0aW9uc1xuICAgICAgc2l6ZTogMzAsXG4gICAgICBudW1iZXJPZlJvd3M6IDQsXG5cbiAgICAgIC8vIFBhdGhPcHRpb25zXG4gICAgICBzdHJva2U6ICdyZ2IoIDEwMCwgMTAwLCAxMDAgKScsXG4gICAgICBsaW5lV2lkdGg6IDFcbiAgICB9LCBwcm92aWRlZE9wdGlvbnMgKTtcblxuICAgIGFzc2VydCAmJiBhc3NlcnQoIG9wdGlvbnMuc2l6ZSA+IDAsIGBpbnZhbGlkIHNpemU6ICR7b3B0aW9ucy5zaXplfWAgKTtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBOdW1iZXIuaXNJbnRlZ2VyKCBvcHRpb25zLm51bWJlck9mUm93cyApICYmIG9wdGlvbnMubnVtYmVyT2ZSb3dzID4gMixcbiAgICAgIGBpbnZhbGlkIG51bWJlck9mUm93czogJHtvcHRpb25zLm51bWJlck9mUm93c31gICk7XG5cbiAgICBjb25zdCBzaGFwZSA9IG5ldyBTaGFwZSgpO1xuXG4gICAgLy8gaG9yaXpvbnRhbCBsaW5lc1xuICAgIGZvciAoIGxldCByb3cgPSAxOyByb3cgPCBvcHRpb25zLm51bWJlck9mUm93czsgcm93KysgKSB7XG4gICAgICBjb25zdCB5ID0gKCByb3cgLyBvcHRpb25zLm51bWJlck9mUm93cyApICogb3B0aW9ucy5zaXplO1xuICAgICAgc2hhcGUubW92ZVRvKCAwLCB5ICk7XG4gICAgICBzaGFwZS5saW5lVG8oIG9wdGlvbnMuc2l6ZSwgeSApO1xuICAgIH1cblxuICAgIC8vIHZlcnRpY2FsIGxpbmVzXG4gICAgY29uc3QgbnVtYmVyT2ZDb2x1bW5zID0gb3B0aW9ucy5udW1iZXJPZlJvd3M7IC8vIGJlY2F1c2UgdGhlIGdyaWQgaXMgTnhOXG4gICAgZm9yICggbGV0IGNvbHVtbiA9IDE7IGNvbHVtbiA8IG51bWJlck9mQ29sdW1uczsgY29sdW1uKysgKSB7XG4gICAgICBjb25zdCB4ID0gKCBjb2x1bW4gLyBudW1iZXJPZkNvbHVtbnMgKSAqIG9wdGlvbnMuc2l6ZTtcbiAgICAgIHNoYXBlLm1vdmVUbyggeCwgMCApO1xuICAgICAgc2hhcGUubGluZVRvKCB4LCBvcHRpb25zLnNpemUgKTtcbiAgICB9XG5cbiAgICBzdXBlciggc2hhcGUsIG9wdGlvbnMgKTtcbiAgfVxufVxuXG5zY2VuZXJ5UGhldC5yZWdpc3RlciggJ0dyaWRJY29uJywgR3JpZEljb24gKTsiXSwibmFtZXMiOlsiU2hhcGUiLCJvcHRpb25pemUiLCJQYXRoIiwic2NlbmVyeVBoZXQiLCJHcmlkSWNvbiIsInByb3ZpZGVkT3B0aW9ucyIsIm9wdGlvbnMiLCJzaXplIiwibnVtYmVyT2ZSb3dzIiwic3Ryb2tlIiwibGluZVdpZHRoIiwiYXNzZXJ0IiwiTnVtYmVyIiwiaXNJbnRlZ2VyIiwic2hhcGUiLCJyb3ciLCJ5IiwibW92ZVRvIiwibGluZVRvIiwibnVtYmVyT2ZDb2x1bW5zIiwiY29sdW1uIiwieCIsInJlZ2lzdGVyIl0sIm1hcHBpbmdzIjoiQUFBQSxzREFBc0Q7QUFFdEQ7Ozs7Q0FJQyxHQUVELFNBQVNBLEtBQUssUUFBUSwyQkFBMkI7QUFDakQsT0FBT0MsZUFBZSxrQ0FBa0M7QUFDeEQsU0FBU0MsSUFBSSxRQUFxQiw4QkFBOEI7QUFDaEUsT0FBT0MsaUJBQWlCLG1CQUFtQjtBQVM1QixJQUFBLEFBQU1DLFdBQU4sTUFBTUEsaUJBQWlCRjtJQUVwQyxZQUFvQkcsZUFBaUMsQ0FBRztRQUV0RCxNQUFNQyxVQUFVTCxZQUF3RDtZQUV0RSxjQUFjO1lBQ2RNLE1BQU07WUFDTkMsY0FBYztZQUVkLGNBQWM7WUFDZEMsUUFBUTtZQUNSQyxXQUFXO1FBQ2IsR0FBR0w7UUFFSE0sVUFBVUEsT0FBUUwsUUFBUUMsSUFBSSxHQUFHLEdBQUcsQ0FBQyxjQUFjLEVBQUVELFFBQVFDLElBQUksRUFBRTtRQUNuRUksVUFBVUEsT0FBUUMsT0FBT0MsU0FBUyxDQUFFUCxRQUFRRSxZQUFZLEtBQU1GLFFBQVFFLFlBQVksR0FBRyxHQUNuRixDQUFDLHNCQUFzQixFQUFFRixRQUFRRSxZQUFZLEVBQUU7UUFFakQsTUFBTU0sUUFBUSxJQUFJZDtRQUVsQixtQkFBbUI7UUFDbkIsSUFBTSxJQUFJZSxNQUFNLEdBQUdBLE1BQU1ULFFBQVFFLFlBQVksRUFBRU8sTUFBUTtZQUNyRCxNQUFNQyxJQUFJLEFBQUVELE1BQU1ULFFBQVFFLFlBQVksR0FBS0YsUUFBUUMsSUFBSTtZQUN2RE8sTUFBTUcsTUFBTSxDQUFFLEdBQUdEO1lBQ2pCRixNQUFNSSxNQUFNLENBQUVaLFFBQVFDLElBQUksRUFBRVM7UUFDOUI7UUFFQSxpQkFBaUI7UUFDakIsTUFBTUcsa0JBQWtCYixRQUFRRSxZQUFZLEVBQUUsMEJBQTBCO1FBQ3hFLElBQU0sSUFBSVksU0FBUyxHQUFHQSxTQUFTRCxpQkFBaUJDLFNBQVc7WUFDekQsTUFBTUMsSUFBSSxBQUFFRCxTQUFTRCxrQkFBb0JiLFFBQVFDLElBQUk7WUFDckRPLE1BQU1HLE1BQU0sQ0FBRUksR0FBRztZQUNqQlAsTUFBTUksTUFBTSxDQUFFRyxHQUFHZixRQUFRQyxJQUFJO1FBQy9CO1FBRUEsS0FBSyxDQUFFTyxPQUFPUjtJQUNoQjtBQUNGO0FBdENBLFNBQXFCRixzQkFzQ3BCO0FBRURELFlBQVltQixRQUFRLENBQUUsWUFBWWxCIn0=