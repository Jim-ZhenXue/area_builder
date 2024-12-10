// Copyright 2021-2024, University of Colorado Boulder
/**
 * A poolable internal representation of a row/column for grid handling in GridConstraint
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ import Pool from '../../../../phet-core/js/Pool.js';
import { LayoutLine, scenery } from '../../imports.js';
let GridLine = class GridLine extends LayoutLine {
    /**
   * (scenery-internal)
   */ initialize(index, cells, grow) {
        this.index = index;
        this.cells = cells;
        this.grow = grow;
        this.initializeLayoutLine();
        return this;
    }
    /**
   * (scenery-internal)
   */ freeToPool() {
        GridLine.pool.freeToPool(this);
    }
    clean() {
        this.cells.length = 0;
        this.freeToPool();
    }
    /**
   * (scenery-internal)
   */ constructor(index, cells, grow){
        super();
        this.initialize(index, cells, grow);
    }
};
/**
   * (scenery-internal)
   */ GridLine.pool = new Pool(GridLine, {
    defaultArguments: [
        0,
        [],
        0
    ]
});
export { GridLine as default };
scenery.register('GridLine', GridLine);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvbGF5b3V0L2NvbnN0cmFpbnRzL0dyaWRMaW5lLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDIxLTIwMjQsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIEEgcG9vbGFibGUgaW50ZXJuYWwgcmVwcmVzZW50YXRpb24gb2YgYSByb3cvY29sdW1uIGZvciBncmlkIGhhbmRsaW5nIGluIEdyaWRDb25zdHJhaW50XG4gKlxuICogQGF1dGhvciBKb25hdGhhbiBPbHNvbiA8am9uYXRoYW4ub2xzb25AY29sb3JhZG8uZWR1PlxuICovXG5cbmltcG9ydCBQb29sIGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9Qb29sLmpzJztcbmltcG9ydCB7IEdyaWRDZWxsLCBMYXlvdXRMaW5lLCBzY2VuZXJ5IH0gZnJvbSAnLi4vLi4vaW1wb3J0cy5qcyc7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEdyaWRMaW5lIGV4dGVuZHMgTGF5b3V0TGluZSB7XG5cbiAgLy8gKHNjZW5lcnktaW50ZXJuYWwpXG4gIHB1YmxpYyBpbmRleCE6IG51bWJlcjtcbiAgcHVibGljIGNlbGxzITogR3JpZENlbGxbXTtcbiAgcHVibGljIGdyb3chOiBudW1iZXI7XG5cbiAgLyoqXG4gICAqIChzY2VuZXJ5LWludGVybmFsKVxuICAgKi9cbiAgcHVibGljIGNvbnN0cnVjdG9yKCBpbmRleDogbnVtYmVyLCBjZWxsczogR3JpZENlbGxbXSwgZ3JvdzogbnVtYmVyICkge1xuICAgIHN1cGVyKCk7XG5cbiAgICB0aGlzLmluaXRpYWxpemUoIGluZGV4LCBjZWxscywgZ3JvdyApO1xuICB9XG5cbiAgLyoqXG4gICAqIChzY2VuZXJ5LWludGVybmFsKVxuICAgKi9cbiAgcHVibGljIGluaXRpYWxpemUoIGluZGV4OiBudW1iZXIsIGNlbGxzOiBHcmlkQ2VsbFtdLCBncm93OiBudW1iZXIgKTogdGhpcyB7XG4gICAgdGhpcy5pbmRleCA9IGluZGV4O1xuXG4gICAgdGhpcy5jZWxscyA9IGNlbGxzO1xuXG4gICAgdGhpcy5ncm93ID0gZ3JvdztcblxuICAgIHRoaXMuaW5pdGlhbGl6ZUxheW91dExpbmUoKTtcblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIChzY2VuZXJ5LWludGVybmFsKVxuICAgKi9cbiAgcHVibGljIGZyZWVUb1Bvb2woKTogdm9pZCB7XG4gICAgR3JpZExpbmUucG9vbC5mcmVlVG9Qb29sKCB0aGlzICk7XG4gIH1cblxuICBwdWJsaWMgY2xlYW4oKTogdm9pZCB7XG4gICAgdGhpcy5jZWxscy5sZW5ndGggPSAwO1xuICAgIHRoaXMuZnJlZVRvUG9vbCgpO1xuICB9XG5cbiAgLyoqXG4gICAqIChzY2VuZXJ5LWludGVybmFsKVxuICAgKi9cbiAgcHVibGljIHN0YXRpYyByZWFkb25seSBwb29sID0gbmV3IFBvb2woIEdyaWRMaW5lLCB7XG4gICAgZGVmYXVsdEFyZ3VtZW50czogWyAwLCBbXSwgMCBdXG4gIH0gKTtcbn1cblxuc2NlbmVyeS5yZWdpc3RlciggJ0dyaWRMaW5lJywgR3JpZExpbmUgKTsiXSwibmFtZXMiOlsiUG9vbCIsIkxheW91dExpbmUiLCJzY2VuZXJ5IiwiR3JpZExpbmUiLCJpbml0aWFsaXplIiwiaW5kZXgiLCJjZWxscyIsImdyb3ciLCJpbml0aWFsaXplTGF5b3V0TGluZSIsImZyZWVUb1Bvb2wiLCJwb29sIiwiY2xlYW4iLCJsZW5ndGgiLCJkZWZhdWx0QXJndW1lbnRzIiwicmVnaXN0ZXIiXSwibWFwcGluZ3MiOiJBQUFBLHNEQUFzRDtBQUV0RDs7OztDQUlDLEdBRUQsT0FBT0EsVUFBVSxtQ0FBbUM7QUFDcEQsU0FBbUJDLFVBQVUsRUFBRUMsT0FBTyxRQUFRLG1CQUFtQjtBQUVsRCxJQUFBLEFBQU1DLFdBQU4sTUFBTUEsaUJBQWlCRjtJQWdCcEM7O0dBRUMsR0FDRCxBQUFPRyxXQUFZQyxLQUFhLEVBQUVDLEtBQWlCLEVBQUVDLElBQVksRUFBUztRQUN4RSxJQUFJLENBQUNGLEtBQUssR0FBR0E7UUFFYixJQUFJLENBQUNDLEtBQUssR0FBR0E7UUFFYixJQUFJLENBQUNDLElBQUksR0FBR0E7UUFFWixJQUFJLENBQUNDLG9CQUFvQjtRQUV6QixPQUFPLElBQUk7SUFDYjtJQUVBOztHQUVDLEdBQ0QsQUFBT0MsYUFBbUI7UUFDeEJOLFNBQVNPLElBQUksQ0FBQ0QsVUFBVSxDQUFFLElBQUk7SUFDaEM7SUFFT0UsUUFBYztRQUNuQixJQUFJLENBQUNMLEtBQUssQ0FBQ00sTUFBTSxHQUFHO1FBQ3BCLElBQUksQ0FBQ0gsVUFBVTtJQUNqQjtJQWxDQTs7R0FFQyxHQUNELFlBQW9CSixLQUFhLEVBQUVDLEtBQWlCLEVBQUVDLElBQVksQ0FBRztRQUNuRSxLQUFLO1FBRUwsSUFBSSxDQUFDSCxVQUFVLENBQUVDLE9BQU9DLE9BQU9DO0lBQ2pDO0FBbUNGO0FBTkU7O0dBRUMsR0E3Q2tCSixTQThDSU8sT0FBTyxJQUFJVixLQUFNRyxVQUFVO0lBQ2hEVSxrQkFBa0I7UUFBRTtRQUFHLEVBQUU7UUFBRTtLQUFHO0FBQ2hDO0FBaERGLFNBQXFCVixzQkFpRHBCO0FBRURELFFBQVFZLFFBQVEsQ0FBRSxZQUFZWCJ9