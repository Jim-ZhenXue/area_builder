// Copyright 2013-2024, University of Colorado Boulder
/**
 * Display a score as '* * * *', where '*' are stars, which may be fully or partially filled in.
 * See specification in https://github.com/phetsims/vegas/issues/59.
 *
 * @author John Blanco
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Andrea Lin
 */ import optionize, { combineOptions } from '../../phet-core/js/optionize.js';
import StarNode from '../../scenery-phet/js/StarNode.js';
import { HBox } from '../../scenery/js/imports.js';
import vegas from './vegas.js';
let ScoreDisplayStars = class ScoreDisplayStars extends HBox {
    dispose() {
        this.disposeScoreDisplayStars();
        super.dispose();
    }
    constructor(scoreProperty, providedOptions){
        const options = optionize()({
            // SelfOptions
            numberOfStars: 1,
            perfectScore: 1,
            starNodeOptions: {
                starShapeOptions: {
                    outerRadius: 10,
                    innerRadius: 5
                },
                filledLineWidth: 1.5,
                emptyLineWidth: 1.5
            },
            // HBoxOptions
            spacing: 3
        }, providedOptions);
        const numberOfStars = options.numberOfStars;
        const perfectScore = options.perfectScore;
        super(options);
        // Update visibility of filled and half-filled stars based on score.
        const scorePropertyListener = (score)=>{
            assert && assert(score <= perfectScore, `Score ${score} exceeds perfect score ${perfectScore}`);
            const children = [];
            const proportion = score / perfectScore;
            const numFilledStars = Math.floor(proportion * numberOfStars);
            for(let i = 0; i < numFilledStars; i++){
                children.push(new StarNode(combineOptions({
                    value: 1
                }, options.starNodeOptions)));
            }
            const remainder = proportion * numberOfStars - numFilledStars;
            if (remainder > 1E-6) {
                children.push(new StarNode(combineOptions({
                    value: remainder
                }, options.starNodeOptions)));
            }
            const numEmptyStars = numberOfStars - children.length;
            for(let i = 0; i < numEmptyStars; i++){
                children.push(new StarNode(combineOptions({
                    value: 0
                }, options.starNodeOptions)));
            }
            this.children = children;
        };
        scoreProperty.link(scorePropertyListener);
        this.disposeScoreDisplayStars = function() {
            scoreProperty.unlink(scorePropertyListener);
        };
    }
};
export { ScoreDisplayStars as default };
vegas.register('ScoreDisplayStars', ScoreDisplayStars);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3ZlZ2FzL2pzL1Njb3JlRGlzcGxheVN0YXJzLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDEzLTIwMjQsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIERpc3BsYXkgYSBzY29yZSBhcyAnKiAqICogKicsIHdoZXJlICcqJyBhcmUgc3RhcnMsIHdoaWNoIG1heSBiZSBmdWxseSBvciBwYXJ0aWFsbHkgZmlsbGVkIGluLlxuICogU2VlIHNwZWNpZmljYXRpb24gaW4gaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3ZlZ2FzL2lzc3Vlcy81OS5cbiAqXG4gKiBAYXV0aG9yIEpvaG4gQmxhbmNvXG4gKiBAYXV0aG9yIFNhbSBSZWlkIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxuICogQGF1dGhvciBBbmRyZWEgTGluXG4gKi9cblxuaW1wb3J0IFRSZWFkT25seVByb3BlcnR5IGZyb20gJy4uLy4uL2F4b24vanMvVFJlYWRPbmx5UHJvcGVydHkuanMnO1xuaW1wb3J0IG9wdGlvbml6ZSwgeyBjb21iaW5lT3B0aW9ucyB9IGZyb20gJy4uLy4uL3BoZXQtY29yZS9qcy9vcHRpb25pemUuanMnO1xuaW1wb3J0IFN0cmljdE9taXQgZnJvbSAnLi4vLi4vcGhldC1jb3JlL2pzL3R5cGVzL1N0cmljdE9taXQuanMnO1xuaW1wb3J0IFN0YXJOb2RlLCB7IFN0YXJOb2RlT3B0aW9ucyB9IGZyb20gJy4uLy4uL3NjZW5lcnktcGhldC9qcy9TdGFyTm9kZS5qcyc7XG5pbXBvcnQgeyBIQm94LCBIQm94T3B0aW9ucyB9IGZyb20gJy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XG5pbXBvcnQgdmVnYXMgZnJvbSAnLi92ZWdhcy5qcyc7XG5cbnR5cGUgU2VsZk9wdGlvbnMgPSB7XG4gIG51bWJlck9mU3RhcnM/OiBudW1iZXI7XG4gIHBlcmZlY3RTY29yZT86IG51bWJlcjtcbiAgc3Rhck5vZGVPcHRpb25zPzogU3Rhck5vZGVPcHRpb25zO1xufTtcblxuZXhwb3J0IHR5cGUgU2NvcmVEaXNwbGF5U3RhcnNPcHRpb25zID0gU2VsZk9wdGlvbnMgJiBTdHJpY3RPbWl0PEhCb3hPcHRpb25zLCAnY2hpbGRyZW4nPjtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgU2NvcmVEaXNwbGF5U3RhcnMgZXh0ZW5kcyBIQm94IHtcblxuICBwcml2YXRlIHJlYWRvbmx5IGRpc3Bvc2VTY29yZURpc3BsYXlTdGFyczogKCkgPT4gdm9pZDtcblxuICBwdWJsaWMgY29uc3RydWN0b3IoIHNjb3JlUHJvcGVydHk6IFRSZWFkT25seVByb3BlcnR5PG51bWJlcj4sIHByb3ZpZGVkT3B0aW9ucz86IFNjb3JlRGlzcGxheVN0YXJzT3B0aW9ucyApIHtcblxuICAgIGNvbnN0IG9wdGlvbnMgPSBvcHRpb25pemU8U2NvcmVEaXNwbGF5U3RhcnNPcHRpb25zLCBTZWxmT3B0aW9ucywgSEJveE9wdGlvbnM+KCkoIHtcblxuICAgICAgLy8gU2VsZk9wdGlvbnNcbiAgICAgIG51bWJlck9mU3RhcnM6IDEsXG4gICAgICBwZXJmZWN0U2NvcmU6IDEsXG4gICAgICBzdGFyTm9kZU9wdGlvbnM6IHtcbiAgICAgICAgc3RhclNoYXBlT3B0aW9uczoge1xuICAgICAgICAgIG91dGVyUmFkaXVzOiAxMCxcbiAgICAgICAgICBpbm5lclJhZGl1czogNVxuICAgICAgICB9LFxuICAgICAgICBmaWxsZWRMaW5lV2lkdGg6IDEuNSxcbiAgICAgICAgZW1wdHlMaW5lV2lkdGg6IDEuNVxuICAgICAgfSxcblxuICAgICAgLy8gSEJveE9wdGlvbnNcbiAgICAgIHNwYWNpbmc6IDNcbiAgICB9LCBwcm92aWRlZE9wdGlvbnMgKTtcblxuICAgIGNvbnN0IG51bWJlck9mU3RhcnMgPSBvcHRpb25zLm51bWJlck9mU3RhcnM7XG4gICAgY29uc3QgcGVyZmVjdFNjb3JlID0gb3B0aW9ucy5wZXJmZWN0U2NvcmU7XG5cbiAgICBzdXBlciggb3B0aW9ucyApO1xuXG4gICAgLy8gVXBkYXRlIHZpc2liaWxpdHkgb2YgZmlsbGVkIGFuZCBoYWxmLWZpbGxlZCBzdGFycyBiYXNlZCBvbiBzY29yZS5cbiAgICBjb25zdCBzY29yZVByb3BlcnR5TGlzdGVuZXIgPSAoIHNjb3JlOiBudW1iZXIgKSA9PiB7XG5cbiAgICAgIGFzc2VydCAmJiBhc3NlcnQoIHNjb3JlIDw9IHBlcmZlY3RTY29yZSwgYFNjb3JlICR7c2NvcmV9IGV4Y2VlZHMgcGVyZmVjdCBzY29yZSAke3BlcmZlY3RTY29yZX1gICk7XG5cbiAgICAgIGNvbnN0IGNoaWxkcmVuID0gW107XG5cbiAgICAgIGNvbnN0IHByb3BvcnRpb24gPSBzY29yZSAvIHBlcmZlY3RTY29yZTtcbiAgICAgIGNvbnN0IG51bUZpbGxlZFN0YXJzID0gTWF0aC5mbG9vciggcHJvcG9ydGlvbiAqIG51bWJlck9mU3RhcnMgKTtcblxuICAgICAgZm9yICggbGV0IGkgPSAwOyBpIDwgbnVtRmlsbGVkU3RhcnM7IGkrKyApIHtcbiAgICAgICAgY2hpbGRyZW4ucHVzaCggbmV3IFN0YXJOb2RlKCBjb21iaW5lT3B0aW9uczxTdGFyTm9kZU9wdGlvbnM+KCB7IHZhbHVlOiAxIH0sIG9wdGlvbnMuc3Rhck5vZGVPcHRpb25zICkgKSApO1xuICAgICAgfVxuXG4gICAgICBjb25zdCByZW1haW5kZXIgPSBwcm9wb3J0aW9uICogbnVtYmVyT2ZTdGFycyAtIG51bUZpbGxlZFN0YXJzO1xuICAgICAgaWYgKCByZW1haW5kZXIgPiAxRS02ICkge1xuICAgICAgICBjaGlsZHJlbi5wdXNoKCBuZXcgU3Rhck5vZGUoIGNvbWJpbmVPcHRpb25zPFN0YXJOb2RlT3B0aW9ucz4oIHsgdmFsdWU6IHJlbWFpbmRlciB9LCBvcHRpb25zLnN0YXJOb2RlT3B0aW9ucyApICkgKTtcbiAgICAgIH1cblxuICAgICAgY29uc3QgbnVtRW1wdHlTdGFycyA9IG51bWJlck9mU3RhcnMgLSBjaGlsZHJlbi5sZW5ndGg7XG4gICAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBudW1FbXB0eVN0YXJzOyBpKysgKSB7XG4gICAgICAgIGNoaWxkcmVuLnB1c2goIG5ldyBTdGFyTm9kZSggY29tYmluZU9wdGlvbnM8U3Rhck5vZGVPcHRpb25zPiggeyB2YWx1ZTogMCB9LCBvcHRpb25zLnN0YXJOb2RlT3B0aW9ucyApICkgKTtcbiAgICAgIH1cblxuICAgICAgdGhpcy5jaGlsZHJlbiA9IGNoaWxkcmVuO1xuICAgIH07XG4gICAgc2NvcmVQcm9wZXJ0eS5saW5rKCBzY29yZVByb3BlcnR5TGlzdGVuZXIgKTtcblxuICAgIHRoaXMuZGlzcG9zZVNjb3JlRGlzcGxheVN0YXJzID0gZnVuY3Rpb24oKSB7XG4gICAgICBzY29yZVByb3BlcnR5LnVubGluayggc2NvcmVQcm9wZXJ0eUxpc3RlbmVyICk7XG4gICAgfTtcbiAgfVxuXG4gIHB1YmxpYyBvdmVycmlkZSBkaXNwb3NlKCk6IHZvaWQge1xuICAgIHRoaXMuZGlzcG9zZVNjb3JlRGlzcGxheVN0YXJzKCk7XG4gICAgc3VwZXIuZGlzcG9zZSgpO1xuICB9XG59XG5cbnZlZ2FzLnJlZ2lzdGVyKCAnU2NvcmVEaXNwbGF5U3RhcnMnLCBTY29yZURpc3BsYXlTdGFycyApOyJdLCJuYW1lcyI6WyJvcHRpb25pemUiLCJjb21iaW5lT3B0aW9ucyIsIlN0YXJOb2RlIiwiSEJveCIsInZlZ2FzIiwiU2NvcmVEaXNwbGF5U3RhcnMiLCJkaXNwb3NlIiwiZGlzcG9zZVNjb3JlRGlzcGxheVN0YXJzIiwic2NvcmVQcm9wZXJ0eSIsInByb3ZpZGVkT3B0aW9ucyIsIm9wdGlvbnMiLCJudW1iZXJPZlN0YXJzIiwicGVyZmVjdFNjb3JlIiwic3Rhck5vZGVPcHRpb25zIiwic3RhclNoYXBlT3B0aW9ucyIsIm91dGVyUmFkaXVzIiwiaW5uZXJSYWRpdXMiLCJmaWxsZWRMaW5lV2lkdGgiLCJlbXB0eUxpbmVXaWR0aCIsInNwYWNpbmciLCJzY29yZVByb3BlcnR5TGlzdGVuZXIiLCJzY29yZSIsImFzc2VydCIsImNoaWxkcmVuIiwicHJvcG9ydGlvbiIsIm51bUZpbGxlZFN0YXJzIiwiTWF0aCIsImZsb29yIiwiaSIsInB1c2giLCJ2YWx1ZSIsInJlbWFpbmRlciIsIm51bUVtcHR5U3RhcnMiLCJsZW5ndGgiLCJsaW5rIiwidW5saW5rIiwicmVnaXN0ZXIiXSwibWFwcGluZ3MiOiJBQUFBLHNEQUFzRDtBQUV0RDs7Ozs7OztDQU9DLEdBR0QsT0FBT0EsYUFBYUMsY0FBYyxRQUFRLGtDQUFrQztBQUU1RSxPQUFPQyxjQUFtQyxvQ0FBb0M7QUFDOUUsU0FBU0MsSUFBSSxRQUFxQiw4QkFBOEI7QUFDaEUsT0FBT0MsV0FBVyxhQUFhO0FBVWhCLElBQUEsQUFBTUMsb0JBQU4sTUFBTUEsMEJBQTBCRjtJQThEN0JHLFVBQWdCO1FBQzlCLElBQUksQ0FBQ0Msd0JBQXdCO1FBQzdCLEtBQUssQ0FBQ0Q7SUFDUjtJQTdEQSxZQUFvQkUsYUFBd0MsRUFBRUMsZUFBMEMsQ0FBRztRQUV6RyxNQUFNQyxVQUFVVixZQUFpRTtZQUUvRSxjQUFjO1lBQ2RXLGVBQWU7WUFDZkMsY0FBYztZQUNkQyxpQkFBaUI7Z0JBQ2ZDLGtCQUFrQjtvQkFDaEJDLGFBQWE7b0JBQ2JDLGFBQWE7Z0JBQ2Y7Z0JBQ0FDLGlCQUFpQjtnQkFDakJDLGdCQUFnQjtZQUNsQjtZQUVBLGNBQWM7WUFDZEMsU0FBUztRQUNYLEdBQUdWO1FBRUgsTUFBTUUsZ0JBQWdCRCxRQUFRQyxhQUFhO1FBQzNDLE1BQU1DLGVBQWVGLFFBQVFFLFlBQVk7UUFFekMsS0FBSyxDQUFFRjtRQUVQLG9FQUFvRTtRQUNwRSxNQUFNVSx3QkFBd0IsQ0FBRUM7WUFFOUJDLFVBQVVBLE9BQVFELFNBQVNULGNBQWMsQ0FBQyxNQUFNLEVBQUVTLE1BQU0sdUJBQXVCLEVBQUVULGNBQWM7WUFFL0YsTUFBTVcsV0FBVyxFQUFFO1lBRW5CLE1BQU1DLGFBQWFILFFBQVFUO1lBQzNCLE1BQU1hLGlCQUFpQkMsS0FBS0MsS0FBSyxDQUFFSCxhQUFhYjtZQUVoRCxJQUFNLElBQUlpQixJQUFJLEdBQUdBLElBQUlILGdCQUFnQkcsSUFBTTtnQkFDekNMLFNBQVNNLElBQUksQ0FBRSxJQUFJM0IsU0FBVUQsZUFBaUM7b0JBQUU2QixPQUFPO2dCQUFFLEdBQUdwQixRQUFRRyxlQUFlO1lBQ3JHO1lBRUEsTUFBTWtCLFlBQVlQLGFBQWFiLGdCQUFnQmM7WUFDL0MsSUFBS00sWUFBWSxNQUFPO2dCQUN0QlIsU0FBU00sSUFBSSxDQUFFLElBQUkzQixTQUFVRCxlQUFpQztvQkFBRTZCLE9BQU9DO2dCQUFVLEdBQUdyQixRQUFRRyxlQUFlO1lBQzdHO1lBRUEsTUFBTW1CLGdCQUFnQnJCLGdCQUFnQlksU0FBU1UsTUFBTTtZQUNyRCxJQUFNLElBQUlMLElBQUksR0FBR0EsSUFBSUksZUFBZUosSUFBTTtnQkFDeENMLFNBQVNNLElBQUksQ0FBRSxJQUFJM0IsU0FBVUQsZUFBaUM7b0JBQUU2QixPQUFPO2dCQUFFLEdBQUdwQixRQUFRRyxlQUFlO1lBQ3JHO1lBRUEsSUFBSSxDQUFDVSxRQUFRLEdBQUdBO1FBQ2xCO1FBQ0FmLGNBQWMwQixJQUFJLENBQUVkO1FBRXBCLElBQUksQ0FBQ2Isd0JBQXdCLEdBQUc7WUFDOUJDLGNBQWMyQixNQUFNLENBQUVmO1FBQ3hCO0lBQ0Y7QUFNRjtBQWxFQSxTQUFxQmYsK0JBa0VwQjtBQUVERCxNQUFNZ0MsUUFBUSxDQUFFLHFCQUFxQi9CIn0=