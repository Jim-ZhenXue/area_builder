// Copyright 2022-2024, University of Colorado Boulder
/**
 * A poolable internal representation of a line for layout handling in FlowConstraint
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ import Orientation from '../../../../phet-core/js/Orientation.js';
import Pool from '../../../../phet-core/js/Pool.js';
import { LayoutLine, scenery } from '../../imports.js';
let FlowLine = class FlowLine extends LayoutLine {
    /**
   * (scenery-internal)
   */ initialize(orientation, cells) {
        this.orientation = orientation;
        this.cells = cells;
        this.initializeLayoutLine();
        return this;
    }
    /**
   * (scenery-internal)
   */ getMinimumSize(spacing) {
        return (this.cells.length - 1) * spacing + _.sum(this.cells.map((cell)=>cell.getMinimumSize(this.orientation)));
    }
    /**
   * (scenery-internal)
   */ freeToPool() {
        FlowLine.pool.freeToPool(this);
    }
    clean() {
        this.cells.length = 0;
        this.freeToPool();
    }
    /**
   * (scenery-internal)
   */ constructor(orientation, cells){
        super();
        this.initialize(orientation, cells);
    }
};
/**
   * (scenery-internal)
   */ FlowLine.pool = new Pool(FlowLine, {
    defaultArguments: [
        Orientation.HORIZONTAL,
        []
    ]
});
export { FlowLine as default };
scenery.register('FlowLine', FlowLine);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvbGF5b3V0L2NvbnN0cmFpbnRzL0Zsb3dMaW5lLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDIyLTIwMjQsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIEEgcG9vbGFibGUgaW50ZXJuYWwgcmVwcmVzZW50YXRpb24gb2YgYSBsaW5lIGZvciBsYXlvdXQgaGFuZGxpbmcgaW4gRmxvd0NvbnN0cmFpbnRcbiAqXG4gKiBAYXV0aG9yIEpvbmF0aGFuIE9sc29uIDxqb25hdGhhbi5vbHNvbkBjb2xvcmFkby5lZHU+XG4gKi9cblxuaW1wb3J0IE9yaWVudGF0aW9uIGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9PcmllbnRhdGlvbi5qcyc7XG5pbXBvcnQgUG9vbCBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvUG9vbC5qcyc7XG5pbXBvcnQgeyBGbG93Q2VsbCwgTGF5b3V0TGluZSwgc2NlbmVyeSB9IGZyb20gJy4uLy4uL2ltcG9ydHMuanMnO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBGbG93TGluZSBleHRlbmRzIExheW91dExpbmUge1xuXG4gIC8vIChzY2VuZXJ5LWludGVybmFsKVxuICBwdWJsaWMgb3JpZW50YXRpb24hOiBPcmllbnRhdGlvbjtcbiAgcHVibGljIGNlbGxzITogRmxvd0NlbGxbXTtcblxuICAvKipcbiAgICogKHNjZW5lcnktaW50ZXJuYWwpXG4gICAqL1xuICBwdWJsaWMgY29uc3RydWN0b3IoIG9yaWVudGF0aW9uOiBPcmllbnRhdGlvbiwgY2VsbHM6IEZsb3dDZWxsW10gKSB7XG4gICAgc3VwZXIoKTtcblxuICAgIHRoaXMuaW5pdGlhbGl6ZSggb3JpZW50YXRpb24sIGNlbGxzICk7XG4gIH1cblxuICAvKipcbiAgICogKHNjZW5lcnktaW50ZXJuYWwpXG4gICAqL1xuICBwdWJsaWMgaW5pdGlhbGl6ZSggb3JpZW50YXRpb246IE9yaWVudGF0aW9uLCBjZWxsczogRmxvd0NlbGxbXSApOiB0aGlzIHtcblxuICAgIHRoaXMub3JpZW50YXRpb24gPSBvcmllbnRhdGlvbjtcbiAgICB0aGlzLmNlbGxzID0gY2VsbHM7XG5cbiAgICB0aGlzLmluaXRpYWxpemVMYXlvdXRMaW5lKCk7XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiAoc2NlbmVyeS1pbnRlcm5hbClcbiAgICovXG4gIHB1YmxpYyBnZXRNaW5pbXVtU2l6ZSggc3BhY2luZzogbnVtYmVyICk6IG51bWJlciB7XG4gICAgcmV0dXJuICggdGhpcy5jZWxscy5sZW5ndGggLSAxICkgKiBzcGFjaW5nICsgXy5zdW0oIHRoaXMuY2VsbHMubWFwKCBjZWxsID0+IGNlbGwuZ2V0TWluaW11bVNpemUoIHRoaXMub3JpZW50YXRpb24gKSApICk7XG4gIH1cblxuICAvKipcbiAgICogKHNjZW5lcnktaW50ZXJuYWwpXG4gICAqL1xuICBwdWJsaWMgZnJlZVRvUG9vbCgpOiB2b2lkIHtcbiAgICBGbG93TGluZS5wb29sLmZyZWVUb1Bvb2woIHRoaXMgKTtcbiAgfVxuXG4gIHB1YmxpYyBjbGVhbigpOiB2b2lkIHtcbiAgICB0aGlzLmNlbGxzLmxlbmd0aCA9IDA7XG4gICAgdGhpcy5mcmVlVG9Qb29sKCk7XG4gIH1cblxuICAvKipcbiAgICogKHNjZW5lcnktaW50ZXJuYWwpXG4gICAqL1xuICBwdWJsaWMgc3RhdGljIHJlYWRvbmx5IHBvb2wgPSBuZXcgUG9vbCggRmxvd0xpbmUsIHtcbiAgICBkZWZhdWx0QXJndW1lbnRzOiBbIE9yaWVudGF0aW9uLkhPUklaT05UQUwsIFtdIF1cbiAgfSApO1xufVxuXG5zY2VuZXJ5LnJlZ2lzdGVyKCAnRmxvd0xpbmUnLCBGbG93TGluZSApOyJdLCJuYW1lcyI6WyJPcmllbnRhdGlvbiIsIlBvb2wiLCJMYXlvdXRMaW5lIiwic2NlbmVyeSIsIkZsb3dMaW5lIiwiaW5pdGlhbGl6ZSIsIm9yaWVudGF0aW9uIiwiY2VsbHMiLCJpbml0aWFsaXplTGF5b3V0TGluZSIsImdldE1pbmltdW1TaXplIiwic3BhY2luZyIsImxlbmd0aCIsIl8iLCJzdW0iLCJtYXAiLCJjZWxsIiwiZnJlZVRvUG9vbCIsInBvb2wiLCJjbGVhbiIsImRlZmF1bHRBcmd1bWVudHMiLCJIT1JJWk9OVEFMIiwicmVnaXN0ZXIiXSwibWFwcGluZ3MiOiJBQUFBLHNEQUFzRDtBQUV0RDs7OztDQUlDLEdBRUQsT0FBT0EsaUJBQWlCLDBDQUEwQztBQUNsRSxPQUFPQyxVQUFVLG1DQUFtQztBQUNwRCxTQUFtQkMsVUFBVSxFQUFFQyxPQUFPLFFBQVEsbUJBQW1CO0FBRWxELElBQUEsQUFBTUMsV0FBTixNQUFNQSxpQkFBaUJGO0lBZXBDOztHQUVDLEdBQ0QsQUFBT0csV0FBWUMsV0FBd0IsRUFBRUMsS0FBaUIsRUFBUztRQUVyRSxJQUFJLENBQUNELFdBQVcsR0FBR0E7UUFDbkIsSUFBSSxDQUFDQyxLQUFLLEdBQUdBO1FBRWIsSUFBSSxDQUFDQyxvQkFBb0I7UUFFekIsT0FBTyxJQUFJO0lBQ2I7SUFFQTs7R0FFQyxHQUNELEFBQU9DLGVBQWdCQyxPQUFlLEVBQVc7UUFDL0MsT0FBTyxBQUFFLENBQUEsSUFBSSxDQUFDSCxLQUFLLENBQUNJLE1BQU0sR0FBRyxDQUFBLElBQU1ELFVBQVVFLEVBQUVDLEdBQUcsQ0FBRSxJQUFJLENBQUNOLEtBQUssQ0FBQ08sR0FBRyxDQUFFQyxDQUFBQSxPQUFRQSxLQUFLTixjQUFjLENBQUUsSUFBSSxDQUFDSCxXQUFXO0lBQ25IO0lBRUE7O0dBRUMsR0FDRCxBQUFPVSxhQUFtQjtRQUN4QlosU0FBU2EsSUFBSSxDQUFDRCxVQUFVLENBQUUsSUFBSTtJQUNoQztJQUVPRSxRQUFjO1FBQ25CLElBQUksQ0FBQ1gsS0FBSyxDQUFDSSxNQUFNLEdBQUc7UUFDcEIsSUFBSSxDQUFDSyxVQUFVO0lBQ2pCO0lBdkNBOztHQUVDLEdBQ0QsWUFBb0JWLFdBQXdCLEVBQUVDLEtBQWlCLENBQUc7UUFDaEUsS0FBSztRQUVMLElBQUksQ0FBQ0YsVUFBVSxDQUFFQyxhQUFhQztJQUNoQztBQXdDRjtBQU5FOztHQUVDLEdBakRrQkgsU0FrRElhLE9BQU8sSUFBSWhCLEtBQU1HLFVBQVU7SUFDaERlLGtCQUFrQjtRQUFFbkIsWUFBWW9CLFVBQVU7UUFBRSxFQUFFO0tBQUU7QUFDbEQ7QUFwREYsU0FBcUJoQixzQkFxRHBCO0FBRURELFFBQVFrQixRQUFRLENBQUUsWUFBWWpCIn0=