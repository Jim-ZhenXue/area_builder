// Copyright 2019-2022, University of Colorado Boulder
/**
 * Statistics functions for Dot.
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */ import dot from './dot.js';
const Stats = {
    /**
   * Inspired by https://stackoverflow.com/questions/30893443/highcharts-boxplots-how-to-get-five-point-summary
   * @param {Array.<number>} numbers
   * @param {number} percentile
   * @returns {number|null}
   */ getPercentile (numbers, percentile) {
        assert && assert(Array.isArray(numbers));
        assert && numbers.forEach((n)=>assert && assert(typeof n === 'number'));
        if (numbers.length === 0) {
            return null;
        }
        numbers.sort((a, b)=>a - b);
        const index = percentile / 100 * numbers.length;
        let result = null;
        // for integers
        if (Math.floor(index) === index) {
            result = (numbers[index - 1] + numbers[index]) / 2;
        } else {
            // for decimal
            result = numbers[Math.floor(index)];
        }
        return result;
    },
    /**
   * Get the median from an unsorted array of numbers
   * @public
   *
   * @param {Array.<number>} numbers - (un)sorted array
   * @returns {number|null} - null if array is empty
   */ median (numbers) {
        return Stats.getPercentile(numbers, 50);
    },
    /**
   * see https://www.whatissixsigma.net/box-plot-diagram-to-identify-outliers/ for formulas
   * @param {Array.<number>} numbers
   * @returns {{q1:number, median:number, q3:number}} -
   */ getBoxPlotValues (numbers) {
        assert && assert(numbers.length >= 4, 'need at least 4 values to calculate quartiles');
        return {
            q1: Stats.getPercentile(numbers, 25),
            median: Stats.getPercentile(numbers, 50),
            q3: Stats.getPercentile(numbers, 75)
        };
    },
    /**
   * Get the limits for a data set
   * @param {Array.<number>} numbers
   * @returns {Object}
   */ getBoxPlotLimits (numbers) {
        assert && assert(Array.isArray(numbers));
        assert && assert(numbers.length >= 4, 'need at least 4 values to calculate data limits');
        assert && numbers.forEach((n)=>assert && assert(typeof n === 'number'));
        const quartiles = Stats.getBoxPlotValues(numbers);
        // calculate inter-quartile range
        const iqr = quartiles.q3 - quartiles.q1;
        const lowerLimit = quartiles.q1 - 1.5 * iqr;
        const upperLimit = quartiles.q3 + 1.5 * iqr;
        return {
            lowerLimit: lowerLimit,
            upperLimit: upperLimit
        };
    }
};
dot.register('Stats', Stats);
export default Stats;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2RvdC9qcy9TdGF0cy5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxOS0yMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuLyoqXG4gKiBTdGF0aXN0aWNzIGZ1bmN0aW9ucyBmb3IgRG90LlxuICpcbiAqIEBhdXRob3IgTWljaGFlbCBLYXV6bWFubiAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcbiAqL1xuXG5pbXBvcnQgZG90IGZyb20gJy4vZG90LmpzJztcblxuY29uc3QgU3RhdHMgPSB7XG5cbiAgLyoqXG4gICAqIEluc3BpcmVkIGJ5IGh0dHBzOi8vc3RhY2tvdmVyZmxvdy5jb20vcXVlc3Rpb25zLzMwODkzNDQzL2hpZ2hjaGFydHMtYm94cGxvdHMtaG93LXRvLWdldC1maXZlLXBvaW50LXN1bW1hcnlcbiAgICogQHBhcmFtIHtBcnJheS48bnVtYmVyPn0gbnVtYmVyc1xuICAgKiBAcGFyYW0ge251bWJlcn0gcGVyY2VudGlsZVxuICAgKiBAcmV0dXJucyB7bnVtYmVyfG51bGx9XG4gICAqL1xuICBnZXRQZXJjZW50aWxlKCBudW1iZXJzLCBwZXJjZW50aWxlICkge1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIEFycmF5LmlzQXJyYXkoIG51bWJlcnMgKSApO1xuICAgIGFzc2VydCAmJiBudW1iZXJzLmZvckVhY2goIG4gPT4gYXNzZXJ0ICYmIGFzc2VydCggdHlwZW9mIG4gPT09ICdudW1iZXInICkgKTtcblxuICAgIGlmICggbnVtYmVycy5sZW5ndGggPT09IDAgKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICBudW1iZXJzLnNvcnQoICggYSwgYiApID0+IGEgLSBiICk7XG4gICAgY29uc3QgaW5kZXggPSAoIHBlcmNlbnRpbGUgLyAxMDAgKSAqIG51bWJlcnMubGVuZ3RoO1xuICAgIGxldCByZXN1bHQgPSBudWxsO1xuXG4gICAgLy8gZm9yIGludGVnZXJzXG4gICAgaWYgKCBNYXRoLmZsb29yKCBpbmRleCApID09PSBpbmRleCApIHtcbiAgICAgIHJlc3VsdCA9ICggbnVtYmVyc1sgKCBpbmRleCAtIDEgKSBdICsgbnVtYmVyc1sgaW5kZXggXSApIC8gMjtcbiAgICB9XG4gICAgZWxzZSB7XG5cbiAgICAgIC8vIGZvciBkZWNpbWFsXG4gICAgICByZXN1bHQgPSBudW1iZXJzWyBNYXRoLmZsb29yKCBpbmRleCApIF07XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG4gIH0sXG5cbiAgLyoqXG4gICAqIEdldCB0aGUgbWVkaWFuIGZyb20gYW4gdW5zb3J0ZWQgYXJyYXkgb2YgbnVtYmVyc1xuICAgKiBAcHVibGljXG4gICAqXG4gICAqIEBwYXJhbSB7QXJyYXkuPG51bWJlcj59IG51bWJlcnMgLSAodW4pc29ydGVkIGFycmF5XG4gICAqIEByZXR1cm5zIHtudW1iZXJ8bnVsbH0gLSBudWxsIGlmIGFycmF5IGlzIGVtcHR5XG4gICAqL1xuICBtZWRpYW4oIG51bWJlcnMgKSB7XG4gICAgcmV0dXJuIFN0YXRzLmdldFBlcmNlbnRpbGUoIG51bWJlcnMsIDUwICk7XG4gIH0sXG5cbiAgLyoqXG4gICAqIHNlZSBodHRwczovL3d3dy53aGF0aXNzaXhzaWdtYS5uZXQvYm94LXBsb3QtZGlhZ3JhbS10by1pZGVudGlmeS1vdXRsaWVycy8gZm9yIGZvcm11bGFzXG4gICAqIEBwYXJhbSB7QXJyYXkuPG51bWJlcj59IG51bWJlcnNcbiAgICogQHJldHVybnMge3txMTpudW1iZXIsIG1lZGlhbjpudW1iZXIsIHEzOm51bWJlcn19IC1cbiAgICovXG4gIGdldEJveFBsb3RWYWx1ZXMoIG51bWJlcnMgKSB7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggbnVtYmVycy5sZW5ndGggPj0gNCwgJ25lZWQgYXQgbGVhc3QgNCB2YWx1ZXMgdG8gY2FsY3VsYXRlIHF1YXJ0aWxlcycgKTtcbiAgICByZXR1cm4ge1xuICAgICAgcTE6IFN0YXRzLmdldFBlcmNlbnRpbGUoIG51bWJlcnMsIDI1ICksXG4gICAgICBtZWRpYW46IFN0YXRzLmdldFBlcmNlbnRpbGUoIG51bWJlcnMsIDUwICksXG4gICAgICBxMzogU3RhdHMuZ2V0UGVyY2VudGlsZSggbnVtYmVycywgNzUgKVxuICAgIH07XG4gIH0sXG5cbiAgLyoqXG4gICAqIEdldCB0aGUgbGltaXRzIGZvciBhIGRhdGEgc2V0XG4gICAqIEBwYXJhbSB7QXJyYXkuPG51bWJlcj59IG51bWJlcnNcbiAgICogQHJldHVybnMge09iamVjdH1cbiAgICovXG4gIGdldEJveFBsb3RMaW1pdHMoIG51bWJlcnMgKSB7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggQXJyYXkuaXNBcnJheSggbnVtYmVycyApICk7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggbnVtYmVycy5sZW5ndGggPj0gNCwgJ25lZWQgYXQgbGVhc3QgNCB2YWx1ZXMgdG8gY2FsY3VsYXRlIGRhdGEgbGltaXRzJyApO1xuICAgIGFzc2VydCAmJiBudW1iZXJzLmZvckVhY2goIG4gPT4gYXNzZXJ0ICYmIGFzc2VydCggdHlwZW9mIG4gPT09ICdudW1iZXInICkgKTtcblxuICAgIGNvbnN0IHF1YXJ0aWxlcyA9IFN0YXRzLmdldEJveFBsb3RWYWx1ZXMoIG51bWJlcnMgKTtcblxuICAgIC8vIGNhbGN1bGF0ZSBpbnRlci1xdWFydGlsZSByYW5nZVxuICAgIGNvbnN0IGlxciA9IHF1YXJ0aWxlcy5xMyAtIHF1YXJ0aWxlcy5xMTtcblxuICAgIGNvbnN0IGxvd2VyTGltaXQgPSBxdWFydGlsZXMucTEgLSAxLjUgKiBpcXI7XG4gICAgY29uc3QgdXBwZXJMaW1pdCA9IHF1YXJ0aWxlcy5xMyArIDEuNSAqIGlxcjtcbiAgICByZXR1cm4ge1xuICAgICAgbG93ZXJMaW1pdDogbG93ZXJMaW1pdCxcbiAgICAgIHVwcGVyTGltaXQ6IHVwcGVyTGltaXRcbiAgICB9O1xuICB9XG59O1xuXG5kb3QucmVnaXN0ZXIoICdTdGF0cycsIFN0YXRzICk7XG5cbmV4cG9ydCBkZWZhdWx0IFN0YXRzOyJdLCJuYW1lcyI6WyJkb3QiLCJTdGF0cyIsImdldFBlcmNlbnRpbGUiLCJudW1iZXJzIiwicGVyY2VudGlsZSIsImFzc2VydCIsIkFycmF5IiwiaXNBcnJheSIsImZvckVhY2giLCJuIiwibGVuZ3RoIiwic29ydCIsImEiLCJiIiwiaW5kZXgiLCJyZXN1bHQiLCJNYXRoIiwiZmxvb3IiLCJtZWRpYW4iLCJnZXRCb3hQbG90VmFsdWVzIiwicTEiLCJxMyIsImdldEJveFBsb3RMaW1pdHMiLCJxdWFydGlsZXMiLCJpcXIiLCJsb3dlckxpbWl0IiwidXBwZXJMaW1pdCIsInJlZ2lzdGVyIl0sIm1hcHBpbmdzIjoiQUFBQSxzREFBc0Q7QUFFdEQ7Ozs7Q0FJQyxHQUVELE9BQU9BLFNBQVMsV0FBVztBQUUzQixNQUFNQyxRQUFRO0lBRVo7Ozs7O0dBS0MsR0FDREMsZUFBZUMsT0FBTyxFQUFFQyxVQUFVO1FBQ2hDQyxVQUFVQSxPQUFRQyxNQUFNQyxPQUFPLENBQUVKO1FBQ2pDRSxVQUFVRixRQUFRSyxPQUFPLENBQUVDLENBQUFBLElBQUtKLFVBQVVBLE9BQVEsT0FBT0ksTUFBTTtRQUUvRCxJQUFLTixRQUFRTyxNQUFNLEtBQUssR0FBSTtZQUMxQixPQUFPO1FBQ1Q7UUFFQVAsUUFBUVEsSUFBSSxDQUFFLENBQUVDLEdBQUdDLElBQU9ELElBQUlDO1FBQzlCLE1BQU1DLFFBQVEsQUFBRVYsYUFBYSxNQUFRRCxRQUFRTyxNQUFNO1FBQ25ELElBQUlLLFNBQVM7UUFFYixlQUFlO1FBQ2YsSUFBS0MsS0FBS0MsS0FBSyxDQUFFSCxXQUFZQSxPQUFRO1lBQ25DQyxTQUFTLEFBQUVaLENBQUFBLE9BQU8sQ0FBSVcsUUFBUSxFQUFLLEdBQUdYLE9BQU8sQ0FBRVcsTUFBTyxBQUFELElBQU07UUFDN0QsT0FDSztZQUVILGNBQWM7WUFDZEMsU0FBU1osT0FBTyxDQUFFYSxLQUFLQyxLQUFLLENBQUVILE9BQVM7UUFDekM7UUFDQSxPQUFPQztJQUNUO0lBRUE7Ozs7OztHQU1DLEdBQ0RHLFFBQVFmLE9BQU87UUFDYixPQUFPRixNQUFNQyxhQUFhLENBQUVDLFNBQVM7SUFDdkM7SUFFQTs7OztHQUlDLEdBQ0RnQixrQkFBa0JoQixPQUFPO1FBQ3ZCRSxVQUFVQSxPQUFRRixRQUFRTyxNQUFNLElBQUksR0FBRztRQUN2QyxPQUFPO1lBQ0xVLElBQUluQixNQUFNQyxhQUFhLENBQUVDLFNBQVM7WUFDbENlLFFBQVFqQixNQUFNQyxhQUFhLENBQUVDLFNBQVM7WUFDdENrQixJQUFJcEIsTUFBTUMsYUFBYSxDQUFFQyxTQUFTO1FBQ3BDO0lBQ0Y7SUFFQTs7OztHQUlDLEdBQ0RtQixrQkFBa0JuQixPQUFPO1FBQ3ZCRSxVQUFVQSxPQUFRQyxNQUFNQyxPQUFPLENBQUVKO1FBQ2pDRSxVQUFVQSxPQUFRRixRQUFRTyxNQUFNLElBQUksR0FBRztRQUN2Q0wsVUFBVUYsUUFBUUssT0FBTyxDQUFFQyxDQUFBQSxJQUFLSixVQUFVQSxPQUFRLE9BQU9JLE1BQU07UUFFL0QsTUFBTWMsWUFBWXRCLE1BQU1rQixnQkFBZ0IsQ0FBRWhCO1FBRTFDLGlDQUFpQztRQUNqQyxNQUFNcUIsTUFBTUQsVUFBVUYsRUFBRSxHQUFHRSxVQUFVSCxFQUFFO1FBRXZDLE1BQU1LLGFBQWFGLFVBQVVILEVBQUUsR0FBRyxNQUFNSTtRQUN4QyxNQUFNRSxhQUFhSCxVQUFVRixFQUFFLEdBQUcsTUFBTUc7UUFDeEMsT0FBTztZQUNMQyxZQUFZQTtZQUNaQyxZQUFZQTtRQUNkO0lBQ0Y7QUFDRjtBQUVBMUIsSUFBSTJCLFFBQVEsQ0FBRSxTQUFTMUI7QUFFdkIsZUFBZUEsTUFBTSJ9