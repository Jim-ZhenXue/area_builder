// Copyright 2014-2023, University of Colorado Boulder
/**
 * A Scenery node that represents a fraction.
 *
 * @author John Blanco
 */ import merge from '../../../../phet-core/js/merge.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { Line, Node, Text } from '../../../../scenery/js/imports.js';
import areaBuilder from '../../areaBuilder.js';
let FractionNode = class FractionNode extends Node {
    // @private
    update() {
        this.numeratorNode.string = this._fraction.numerator.toString();
        this.denominatorNode.string = this._fraction.denominator.toString();
        // Note: The fraction bar width is not updated here because the Line type didn't support changes when this code
        // was developed and the code that used this node didn't really need it.  If this code is being used in a more
        // general way, where the elements of the fraction could reach multiple digits, adjustments to the size of the
        // fraction bar will need to be added here.
        // layout
        this.numeratorNode.centerX = this.fractionBarNode.centerX;
        this.denominatorNode.centerX = this.fractionBarNode.centerX;
        this.fractionBarNode.centerY = this.numeratorNode.bottom;
        this.denominatorNode.top = this.fractionBarNode.bottom;
    }
    set fraction(fraction) {
        this._fraction = fraction;
        this.update();
    }
    get fraction() {
        return this._fraction;
    }
    /**
   * @param {Fraction} fraction
   * @param {Object} [options]
   */ constructor(fraction, options){
        super();
        options = merge({
            // default options
            font: new PhetFont({
                size: 18
            }),
            color: 'black',
            fractionBarLineWidth: 1,
            // this option controls the width of the fraction bar as a function of the widest of the numerator and denominator.
            fractionBarWidthProportion: 1.1
        }, options);
        assert && assert(options.fractionBarWidthProportion >= 1, 'The fraction bar must be at least the width of the larger fraction component.');
        // Create and add the pieces
        this.numeratorNode = new Text('0', {
            font: options.font,
            fill: options.color
        });
        this.addChild(this.numeratorNode);
        this.denominatorNode = new Text('0', {
            font: options.font,
            fill: options.color
        });
        this.addChild(this.denominatorNode);
        const fractionBarWidth = options.fractionBarWidthProportion * Math.max(this.numeratorNode.width, this.denominatorNode.width);
        this.fractionBarNode = new Line(0, 0, fractionBarWidth, 0, {
            stroke: options.color,
            lineWidth: options.fractionBarLineWidth
        });
        this.addChild(this.fractionBarNode);
        this._fraction = fraction;
        this.update();
    }
};
areaBuilder.register('FractionNode', FractionNode);
export default FractionNode;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL2FyZWEtYnVpbGRlci9qcy9nYW1lL3ZpZXcvRnJhY3Rpb25Ob2RlLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE0LTIwMjMsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIEEgU2NlbmVyeSBub2RlIHRoYXQgcmVwcmVzZW50cyBhIGZyYWN0aW9uLlxuICpcbiAqIEBhdXRob3IgSm9obiBCbGFuY29cbiAqL1xuXG5pbXBvcnQgbWVyZ2UgZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL21lcmdlLmpzJztcbmltcG9ydCBQaGV0Rm9udCBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5LXBoZXQvanMvUGhldEZvbnQuanMnO1xuaW1wb3J0IHsgTGluZSwgTm9kZSwgVGV4dCB9IGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XG5pbXBvcnQgYXJlYUJ1aWxkZXIgZnJvbSAnLi4vLi4vYXJlYUJ1aWxkZXIuanMnO1xuXG5jbGFzcyBGcmFjdGlvbk5vZGUgZXh0ZW5kcyBOb2RlIHtcblxuICAvKipcbiAgICogQHBhcmFtIHtGcmFjdGlvbn0gZnJhY3Rpb25cbiAgICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zXVxuICAgKi9cbiAgY29uc3RydWN0b3IoIGZyYWN0aW9uLCBvcHRpb25zICkge1xuICAgIHN1cGVyKCk7XG4gICAgb3B0aW9ucyA9IG1lcmdlKCB7XG4gICAgICAvLyBkZWZhdWx0IG9wdGlvbnNcbiAgICAgIGZvbnQ6IG5ldyBQaGV0Rm9udCggeyBzaXplOiAxOCB9ICksXG4gICAgICBjb2xvcjogJ2JsYWNrJyxcbiAgICAgIGZyYWN0aW9uQmFyTGluZVdpZHRoOiAxLFxuXG4gICAgICAvLyB0aGlzIG9wdGlvbiBjb250cm9scyB0aGUgd2lkdGggb2YgdGhlIGZyYWN0aW9uIGJhciBhcyBhIGZ1bmN0aW9uIG9mIHRoZSB3aWRlc3Qgb2YgdGhlIG51bWVyYXRvciBhbmQgZGVub21pbmF0b3IuXG4gICAgICBmcmFjdGlvbkJhcldpZHRoUHJvcG9ydGlvbjogMS4xXG4gICAgfSwgb3B0aW9ucyApO1xuXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggb3B0aW9ucy5mcmFjdGlvbkJhcldpZHRoUHJvcG9ydGlvbiA+PSAxLCAnVGhlIGZyYWN0aW9uIGJhciBtdXN0IGJlIGF0IGxlYXN0IHRoZSB3aWR0aCBvZiB0aGUgbGFyZ2VyIGZyYWN0aW9uIGNvbXBvbmVudC4nICk7XG5cbiAgICAvLyBDcmVhdGUgYW5kIGFkZCB0aGUgcGllY2VzXG4gICAgdGhpcy5udW1lcmF0b3JOb2RlID0gbmV3IFRleHQoICcwJywgeyBmb250OiBvcHRpb25zLmZvbnQsIGZpbGw6IG9wdGlvbnMuY29sb3IgfSApO1xuICAgIHRoaXMuYWRkQ2hpbGQoIHRoaXMubnVtZXJhdG9yTm9kZSApO1xuICAgIHRoaXMuZGVub21pbmF0b3JOb2RlID0gbmV3IFRleHQoICcwJywgeyBmb250OiBvcHRpb25zLmZvbnQsIGZpbGw6IG9wdGlvbnMuY29sb3IgfSApO1xuICAgIHRoaXMuYWRkQ2hpbGQoIHRoaXMuZGVub21pbmF0b3JOb2RlICk7XG4gICAgY29uc3QgZnJhY3Rpb25CYXJXaWR0aCA9IG9wdGlvbnMuZnJhY3Rpb25CYXJXaWR0aFByb3BvcnRpb24gKiBNYXRoLm1heCggdGhpcy5udW1lcmF0b3JOb2RlLndpZHRoLCB0aGlzLmRlbm9taW5hdG9yTm9kZS53aWR0aCApO1xuICAgIHRoaXMuZnJhY3Rpb25CYXJOb2RlID0gbmV3IExpbmUoIDAsIDAsIGZyYWN0aW9uQmFyV2lkdGgsIDAsIHtcbiAgICAgIHN0cm9rZTogb3B0aW9ucy5jb2xvcixcbiAgICAgIGxpbmVXaWR0aDogb3B0aW9ucy5mcmFjdGlvbkJhckxpbmVXaWR0aFxuICAgIH0gKTtcbiAgICB0aGlzLmFkZENoaWxkKCB0aGlzLmZyYWN0aW9uQmFyTm9kZSApO1xuXG4gICAgdGhpcy5fZnJhY3Rpb24gPSBmcmFjdGlvbjtcbiAgICB0aGlzLnVwZGF0ZSgpO1xuICB9XG5cblxuICAvLyBAcHJpdmF0ZVxuICB1cGRhdGUoKSB7XG4gICAgdGhpcy5udW1lcmF0b3JOb2RlLnN0cmluZyA9IHRoaXMuX2ZyYWN0aW9uLm51bWVyYXRvci50b1N0cmluZygpO1xuICAgIHRoaXMuZGVub21pbmF0b3JOb2RlLnN0cmluZyA9IHRoaXMuX2ZyYWN0aW9uLmRlbm9taW5hdG9yLnRvU3RyaW5nKCk7XG5cbiAgICAvLyBOb3RlOiBUaGUgZnJhY3Rpb24gYmFyIHdpZHRoIGlzIG5vdCB1cGRhdGVkIGhlcmUgYmVjYXVzZSB0aGUgTGluZSB0eXBlIGRpZG4ndCBzdXBwb3J0IGNoYW5nZXMgd2hlbiB0aGlzIGNvZGVcbiAgICAvLyB3YXMgZGV2ZWxvcGVkIGFuZCB0aGUgY29kZSB0aGF0IHVzZWQgdGhpcyBub2RlIGRpZG4ndCByZWFsbHkgbmVlZCBpdC4gIElmIHRoaXMgY29kZSBpcyBiZWluZyB1c2VkIGluIGEgbW9yZVxuICAgIC8vIGdlbmVyYWwgd2F5LCB3aGVyZSB0aGUgZWxlbWVudHMgb2YgdGhlIGZyYWN0aW9uIGNvdWxkIHJlYWNoIG11bHRpcGxlIGRpZ2l0cywgYWRqdXN0bWVudHMgdG8gdGhlIHNpemUgb2YgdGhlXG4gICAgLy8gZnJhY3Rpb24gYmFyIHdpbGwgbmVlZCB0byBiZSBhZGRlZCBoZXJlLlxuXG4gICAgLy8gbGF5b3V0XG4gICAgdGhpcy5udW1lcmF0b3JOb2RlLmNlbnRlclggPSB0aGlzLmZyYWN0aW9uQmFyTm9kZS5jZW50ZXJYO1xuICAgIHRoaXMuZGVub21pbmF0b3JOb2RlLmNlbnRlclggPSB0aGlzLmZyYWN0aW9uQmFyTm9kZS5jZW50ZXJYO1xuICAgIHRoaXMuZnJhY3Rpb25CYXJOb2RlLmNlbnRlclkgPSB0aGlzLm51bWVyYXRvck5vZGUuYm90dG9tO1xuICAgIHRoaXMuZGVub21pbmF0b3JOb2RlLnRvcCA9IHRoaXMuZnJhY3Rpb25CYXJOb2RlLmJvdHRvbTtcbiAgfVxuXG4gIHNldCBmcmFjdGlvbiggZnJhY3Rpb24gKSB7XG4gICAgdGhpcy5fZnJhY3Rpb24gPSBmcmFjdGlvbjtcbiAgICB0aGlzLnVwZGF0ZSgpO1xuICB9XG5cbiAgZ2V0IGZyYWN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLl9mcmFjdGlvbjtcbiAgfVxufVxuXG5hcmVhQnVpbGRlci5yZWdpc3RlciggJ0ZyYWN0aW9uTm9kZScsIEZyYWN0aW9uTm9kZSApO1xuZXhwb3J0IGRlZmF1bHQgRnJhY3Rpb25Ob2RlOyJdLCJuYW1lcyI6WyJtZXJnZSIsIlBoZXRGb250IiwiTGluZSIsIk5vZGUiLCJUZXh0IiwiYXJlYUJ1aWxkZXIiLCJGcmFjdGlvbk5vZGUiLCJ1cGRhdGUiLCJudW1lcmF0b3JOb2RlIiwic3RyaW5nIiwiX2ZyYWN0aW9uIiwibnVtZXJhdG9yIiwidG9TdHJpbmciLCJkZW5vbWluYXRvck5vZGUiLCJkZW5vbWluYXRvciIsImNlbnRlclgiLCJmcmFjdGlvbkJhck5vZGUiLCJjZW50ZXJZIiwiYm90dG9tIiwidG9wIiwiZnJhY3Rpb24iLCJjb25zdHJ1Y3RvciIsIm9wdGlvbnMiLCJmb250Iiwic2l6ZSIsImNvbG9yIiwiZnJhY3Rpb25CYXJMaW5lV2lkdGgiLCJmcmFjdGlvbkJhcldpZHRoUHJvcG9ydGlvbiIsImFzc2VydCIsImZpbGwiLCJhZGRDaGlsZCIsImZyYWN0aW9uQmFyV2lkdGgiLCJNYXRoIiwibWF4Iiwid2lkdGgiLCJzdHJva2UiLCJsaW5lV2lkdGgiLCJyZWdpc3RlciJdLCJtYXBwaW5ncyI6IkFBQUEsc0RBQXNEO0FBRXREOzs7O0NBSUMsR0FFRCxPQUFPQSxXQUFXLG9DQUFvQztBQUN0RCxPQUFPQyxjQUFjLDBDQUEwQztBQUMvRCxTQUFTQyxJQUFJLEVBQUVDLElBQUksRUFBRUMsSUFBSSxRQUFRLG9DQUFvQztBQUNyRSxPQUFPQyxpQkFBaUIsdUJBQXVCO0FBRS9DLElBQUEsQUFBTUMsZUFBTixNQUFNQSxxQkFBcUJIO0lBcUN6QixXQUFXO0lBQ1hJLFNBQVM7UUFDUCxJQUFJLENBQUND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