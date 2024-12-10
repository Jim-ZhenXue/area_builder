// Copyright 2015-2024, University of Colorado Boulder
/**
 * An iOS-style page control. See the 'Navigation' section of the iOS Human Interface Guidelines.
 * A page control indicates the number of pages and which one is currently visible.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */ import Vector2 from '../../dot/js/Vector2.js';
import { Shape } from '../../kite/js/imports.js';
import optionize from '../../phet-core/js/optionize.js';
import { Circle, FlowBox, LayoutOrientationValues, Node, PressListener } from '../../scenery/js/imports.js';
import Tandem from '../../tandem/js/Tandem.js';
import sun from './sun.js';
let PageControl = class PageControl extends Node {
    dispose() {
        this.disposePageControl();
        super.dispose();
    }
    /**
   * @param pageNumberProperty - which page is currently visible
   * @param numberOfPagesProperty - number of pages
   * @param providedOptions
   */ constructor(pageNumberProperty, numberOfPagesProperty, providedOptions){
        const options = optionize()({
            // SelfOptions
            interactive: false,
            orientation: 'horizontal',
            dotRadius: 3,
            lineWidth: 1,
            dotSpacing: 10,
            dotTouchAreaDilation: 4,
            dotMouseAreaDilation: 4,
            currentPageFill: 'black',
            currentPageStroke: null,
            pageFill: 'rgb( 200, 200, 200 )',
            pageStroke: null,
            // NodeOptions
            tandem: Tandem.REQUIRED,
            tandemNameSuffix: 'PageControl',
            visiblePropertyOptions: {
                phetioFeatured: true
            }
        }, providedOptions);
        // validate options
        assert && assert(LayoutOrientationValues.includes(options.orientation), `invalid orientation=${options.orientation}`);
        // Clicking on a dot goes to that page
        const pressListener = new PressListener({
            press: (event)=>{
                if (event.currentTarget instanceof DotNode) {
                    pageNumberProperty.value = event.currentTarget.pageNumber;
                }
            },
            tandem: options.tandem.createTandem('pressListener')
        });
        const dotOptions = {
            lineWidth: options.lineWidth,
            mouseArea: options.dotMouseAreaDilation === 0 ? null : Shape.circle(0, 0, options.dotRadius + options.dotMouseAreaDilation),
            touchArea: options.dotTouchAreaDilation === 0 ? null : Shape.circle(0, 0, options.dotRadius + options.dotTouchAreaDilation),
            boundsMethod: 'unstroked',
            // optional interactivity
            cursor: options.interactive ? 'pointer' : null,
            inputListeners: options.interactive ? [
                pressListener
            ] : []
        };
        const dotBox = new FlowBox({
            orientation: options.orientation,
            spacing: options.dotSpacing
        });
        let dotNodes = [];
        // Keep it centered
        dotBox.boundsProperty.link(()=>{
            dotBox.center = Vector2.ZERO;
        });
        // Dot fill/stroke
        const updateDotAppearance = (pageNumber)=>{
            dotNodes.forEach((dotNode)=>{
                dotNode.fill = pageNumber === dotNode.pageNumber ? options.currentPageFill : options.pageFill;
                dotNode.stroke = pageNumber === dotNode.pageNumber ? options.currentPageStroke : options.pageStroke;
            });
        };
        pageNumberProperty.link(updateDotAppearance);
        // Recreate the dots when the number of pages changes
        const recreateDotNodes = (numberOfPages)=>{
            assert && assert(numberOfPages >= 1);
            dotNodes = _.range(0, numberOfPages).map((pageNumber)=>new DotNode(pageNumber, options.dotRadius, dotOptions));
            dotBox.children = dotNodes;
            updateDotAppearance(pageNumberProperty.value); // since they are recreated, update their appearance
        };
        numberOfPagesProperty.link(recreateDotNodes);
        options.children = [
            dotBox
        ];
        super(options);
        this.disposePageControl = ()=>{
            pressListener.dispose();
            numberOfPagesProperty.unlink(recreateDotNodes);
            pageNumberProperty.unlink(updateDotAppearance);
        };
    }
};
export { PageControl as default };
/**
 * One of the dots in the page control, with an associated page number.
 */ let DotNode = class DotNode extends Circle {
    constructor(pageNumber, radius, options){
        super(radius, options);
        this.pageNumber = pageNumber;
    }
};
sun.register('PageControl', PageControl);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3N1bi9qcy9QYWdlQ29udHJvbC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNS0yMDI0LCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuLyoqXG4gKiBBbiBpT1Mtc3R5bGUgcGFnZSBjb250cm9sLiBTZWUgdGhlICdOYXZpZ2F0aW9uJyBzZWN0aW9uIG9mIHRoZSBpT1MgSHVtYW4gSW50ZXJmYWNlIEd1aWRlbGluZXMuXG4gKiBBIHBhZ2UgY29udHJvbCBpbmRpY2F0ZXMgdGhlIG51bWJlciBvZiBwYWdlcyBhbmQgd2hpY2ggb25lIGlzIGN1cnJlbnRseSB2aXNpYmxlLlxuICpcbiAqIEBhdXRob3IgQ2hyaXMgTWFsbGV5IChQaXhlbFpvb20sIEluYy4pXG4gKi9cblxuaW1wb3J0IFRQcm9wZXJ0eSBmcm9tICcuLi8uLi9heG9uL2pzL1RQcm9wZXJ0eS5qcyc7XG5pbXBvcnQgVFJlYWRPbmx5UHJvcGVydHkgZnJvbSAnLi4vLi4vYXhvbi9qcy9UUmVhZE9ubHlQcm9wZXJ0eS5qcyc7XG5pbXBvcnQgVmVjdG9yMiBmcm9tICcuLi8uLi9kb3QvanMvVmVjdG9yMi5qcyc7XG5pbXBvcnQgeyBTaGFwZSB9IGZyb20gJy4uLy4uL2tpdGUvanMvaW1wb3J0cy5qcyc7XG5pbXBvcnQgb3B0aW9uaXplIGZyb20gJy4uLy4uL3BoZXQtY29yZS9qcy9vcHRpb25pemUuanMnO1xuaW1wb3J0IFN0cmljdE9taXQgZnJvbSAnLi4vLi4vcGhldC1jb3JlL2pzL3R5cGVzL1N0cmljdE9taXQuanMnO1xuaW1wb3J0IHsgQ2lyY2xlLCBDaXJjbGVPcHRpb25zLCBGbG93Qm94LCBMYXlvdXRPcmllbnRhdGlvbiwgTGF5b3V0T3JpZW50YXRpb25WYWx1ZXMsIE5vZGUsIE5vZGVPcHRpb25zLCBQcmVzc0xpc3RlbmVyLCBQcmVzc0xpc3RlbmVyRXZlbnQsIFRQYWludCB9IGZyb20gJy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XG5pbXBvcnQgVGFuZGVtIGZyb20gJy4uLy4uL3RhbmRlbS9qcy9UYW5kZW0uanMnO1xuaW1wb3J0IHN1biBmcm9tICcuL3N1bi5qcyc7XG5cbnR5cGUgU2VsZk9wdGlvbnMgPSB7XG4gIGludGVyYWN0aXZlPzogYm9vbGVhbjsgLy8gd2hldGhlciB0aGUgY29udHJvbCBpcyBpbnRlcmFjdGl2ZVxuXG4gIG9yaWVudGF0aW9uPzogTGF5b3V0T3JpZW50YXRpb247XG5cbiAgZG90UmFkaXVzPzogbnVtYmVyOyAvLyByYWRpdXMgb2YgdGhlIGRvdHNcbiAgbGluZVdpZHRoPzogbnVtYmVyO1xuICBkb3RTcGFjaW5nPzogbnVtYmVyOyAvLyBzcGFjaW5nIGJldHdlZW4gZG90c1xuICBkb3RUb3VjaEFyZWFEaWxhdGlvbj86IG51bWJlcjsgLy8gaG93IG11Y2ggdG8gZGlsYXRlIHRoZSB0b3VjaEFyZWEgYmV5b25kIHRoZSByYWRpdXMgb2YgYSBkb3RcbiAgZG90TW91c2VBcmVhRGlsYXRpb24/OiBudW1iZXI7IC8vIGhvdyBtdWNoIHRvIGRpbGF0ZSB0aGUgbW91c2VBcmVhIGJleW9uZCB0aGUgcmFkaXVzIG9mIGEgZG90XG5cbiAgLy8gZG90cyByZXByZXNlbnRpbmcgdGhlIGN1cnJlbnQgcGFnZVxuICBjdXJyZW50UGFnZUZpbGw/OiBUUGFpbnQ7XG4gIGN1cnJlbnRQYWdlU3Ryb2tlPzogVFBhaW50O1xuXG4gIC8vIGRvdHMgcmVwcmVzZW50aW5nIGFsbCBwYWdlcyBleGNlcHQgdGhlIGN1cnJlbnQgcGFnZVxuICBwYWdlRmlsbD86IFRQYWludDtcbiAgcGFnZVN0cm9rZT86IFRQYWludDtcbn07XG5cbmV4cG9ydCB0eXBlIFBhZ2VDb250cm9sT3B0aW9ucyA9IFNlbGZPcHRpb25zICYgU3RyaWN0T21pdDxOb2RlT3B0aW9ucywgJ2NoaWxkcmVuJz47XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFBhZ2VDb250cm9sIGV4dGVuZHMgTm9kZSB7XG5cbiAgcHJpdmF0ZSByZWFkb25seSBkaXNwb3NlUGFnZUNvbnRyb2w6ICgpID0+IHZvaWQ7XG5cbiAgLyoqXG4gICAqIEBwYXJhbSBwYWdlTnVtYmVyUHJvcGVydHkgLSB3aGljaCBwYWdlIGlzIGN1cnJlbnRseSB2aXNpYmxlXG4gICAqIEBwYXJhbSBudW1iZXJPZlBhZ2VzUHJvcGVydHkgLSBudW1iZXIgb2YgcGFnZXNcbiAgICogQHBhcmFtIHByb3ZpZGVkT3B0aW9uc1xuICAgKi9cbiAgcHVibGljIGNvbnN0cnVjdG9yKCBwYWdlTnVtYmVyUHJvcGVydHk6IFRQcm9wZXJ0eTxudW1iZXI+LCBudW1iZXJPZlBhZ2VzUHJvcGVydHk6IFRSZWFkT25seVByb3BlcnR5PG51bWJlcj4sIHByb3ZpZGVkT3B0aW9ucz86IFBhZ2VDb250cm9sT3B0aW9ucyApIHtcblxuICAgIGNvbnN0IG9wdGlvbnMgPSBvcHRpb25pemU8UGFnZUNvbnRyb2xPcHRpb25zLCBTZWxmT3B0aW9ucywgTm9kZU9wdGlvbnM+KCkoIHtcblxuICAgICAgLy8gU2VsZk9wdGlvbnNcbiAgICAgIGludGVyYWN0aXZlOiBmYWxzZSxcbiAgICAgIG9yaWVudGF0aW9uOiAnaG9yaXpvbnRhbCcsXG4gICAgICBkb3RSYWRpdXM6IDMsXG4gICAgICBsaW5lV2lkdGg6IDEsXG4gICAgICBkb3RTcGFjaW5nOiAxMCxcbiAgICAgIGRvdFRvdWNoQXJlYURpbGF0aW9uOiA0LFxuICAgICAgZG90TW91c2VBcmVhRGlsYXRpb246IDQsXG4gICAgICBjdXJyZW50UGFnZUZpbGw6ICdibGFjaycsXG4gICAgICBjdXJyZW50UGFnZVN0cm9rZTogbnVsbCxcbiAgICAgIHBhZ2VGaWxsOiAncmdiKCAyMDAsIDIwMCwgMjAwICknLFxuICAgICAgcGFnZVN0cm9rZTogbnVsbCxcblxuICAgICAgLy8gTm9kZU9wdGlvbnNcbiAgICAgIHRhbmRlbTogVGFuZGVtLlJFUVVJUkVELFxuICAgICAgdGFuZGVtTmFtZVN1ZmZpeDogJ1BhZ2VDb250cm9sJyxcbiAgICAgIHZpc2libGVQcm9wZXJ0eU9wdGlvbnM6IHtcbiAgICAgICAgcGhldGlvRmVhdHVyZWQ6IHRydWVcbiAgICAgIH1cbiAgICB9LCBwcm92aWRlZE9wdGlvbnMgKTtcblxuICAgIC8vIHZhbGlkYXRlIG9wdGlvbnNcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBMYXlvdXRPcmllbnRhdGlvblZhbHVlcy5pbmNsdWRlcyggb3B0aW9ucy5vcmllbnRhdGlvbiApLCBgaW52YWxpZCBvcmllbnRhdGlvbj0ke29wdGlvbnMub3JpZW50YXRpb259YCApO1xuXG4gICAgLy8gQ2xpY2tpbmcgb24gYSBkb3QgZ29lcyB0byB0aGF0IHBhZ2VcbiAgICBjb25zdCBwcmVzc0xpc3RlbmVyID0gbmV3IFByZXNzTGlzdGVuZXIoIHtcbiAgICAgIHByZXNzOiAoIGV2ZW50OiBQcmVzc0xpc3RlbmVyRXZlbnQgKSA9PiB7XG4gICAgICAgIGlmICggZXZlbnQuY3VycmVudFRhcmdldCBpbnN0YW5jZW9mIERvdE5vZGUgKSB7XG4gICAgICAgICAgcGFnZU51bWJlclByb3BlcnR5LnZhbHVlID0gZXZlbnQuY3VycmVudFRhcmdldC5wYWdlTnVtYmVyO1xuICAgICAgICB9XG4gICAgICB9LFxuICAgICAgdGFuZGVtOiBvcHRpb25zLnRhbmRlbS5jcmVhdGVUYW5kZW0oICdwcmVzc0xpc3RlbmVyJyApXG4gICAgfSApO1xuXG4gICAgY29uc3QgZG90T3B0aW9uczogQ2lyY2xlT3B0aW9ucyA9IHtcbiAgICAgIGxpbmVXaWR0aDogb3B0aW9ucy5saW5lV2lkdGgsXG4gICAgICBtb3VzZUFyZWE6ICggb3B0aW9ucy5kb3RNb3VzZUFyZWFEaWxhdGlvbiA9PT0gMCApID8gbnVsbCA6IFNoYXBlLmNpcmNsZSggMCwgMCwgb3B0aW9ucy5kb3RSYWRpdXMgKyBvcHRpb25zLmRvdE1vdXNlQXJlYURpbGF0aW9uICksXG4gICAgICB0b3VjaEFyZWE6ICggb3B0aW9ucy5kb3RUb3VjaEFyZWFEaWxhdGlvbiA9PT0gMCApID8gbnVsbCA6IFNoYXBlLmNpcmNsZSggMCwgMCwgb3B0aW9ucy5kb3RSYWRpdXMgKyBvcHRpb25zLmRvdFRvdWNoQXJlYURpbGF0aW9uICksXG5cbiAgICAgIGJvdW5kc01ldGhvZDogJ3Vuc3Ryb2tlZCcsIC8vIEZvciBsYXlvdXQgcHVycG9zZXMsIHNvIHdlIGRvbid0IGhhdmUgdG8gYWRqdXN0IHNwYWNpbmdzIHdoZW4gdGhpbmdzIGJlY29tZSBzdHJva2VkXG5cbiAgICAgIC8vIG9wdGlvbmFsIGludGVyYWN0aXZpdHlcbiAgICAgIGN1cnNvcjogb3B0aW9ucy5pbnRlcmFjdGl2ZSA/ICdwb2ludGVyJyA6IG51bGwsXG4gICAgICBpbnB1dExpc3RlbmVyczogb3B0aW9ucy5pbnRlcmFjdGl2ZSA/IFsgcHJlc3NMaXN0ZW5lciBdIDogW11cbiAgICB9O1xuXG4gICAgY29uc3QgZG90Qm94ID0gbmV3IEZsb3dCb3goIHtcbiAgICAgIG9yaWVudGF0aW9uOiBvcHRpb25zLm9yaWVudGF0aW9uLCAvLyBob3Jpem9udGFsIHBhZ2VzIG9yZGVyZWQgbGVmdC10by1yaWdodCwgdmVydGljYWwgcGFnZXMgb3JkZXJlZCB0b3AtdG8tYm90dG9tXG4gICAgICBzcGFjaW5nOiBvcHRpb25zLmRvdFNwYWNpbmdcbiAgICB9ICk7XG4gICAgbGV0IGRvdE5vZGVzOiBEb3ROb2RlW10gPSBbXTtcblxuICAgIC8vIEtlZXAgaXQgY2VudGVyZWRcbiAgICBkb3RCb3guYm91bmRzUHJvcGVydHkubGluayggKCkgPT4geyBkb3RCb3guY2VudGVyID0gVmVjdG9yMi5aRVJPOyB9ICk7XG5cbiAgICAvLyBEb3QgZmlsbC9zdHJva2VcbiAgICBjb25zdCB1cGRhdGVEb3RBcHBlYXJhbmNlID0gKCBwYWdlTnVtYmVyOiBudW1iZXIgKSA9PiB7XG4gICAgICBkb3ROb2Rlcy5mb3JFYWNoKCBkb3ROb2RlID0+IHtcbiAgICAgICAgZG90Tm9kZS5maWxsID0gKCBwYWdlTnVtYmVyID09PSBkb3ROb2RlLnBhZ2VOdW1iZXIgKSA/IG9wdGlvbnMuY3VycmVudFBhZ2VGaWxsIDogb3B0aW9ucy5wYWdlRmlsbDtcbiAgICAgICAgZG90Tm9kZS5zdHJva2UgPSAoIHBhZ2VOdW1iZXIgPT09IGRvdE5vZGUucGFnZU51bWJlciApID8gb3B0aW9ucy5jdXJyZW50UGFnZVN0cm9rZSA6IG9wdGlvbnMucGFnZVN0cm9rZTtcbiAgICAgIH0gKTtcbiAgICB9O1xuICAgIHBhZ2VOdW1iZXJQcm9wZXJ0eS5saW5rKCB1cGRhdGVEb3RBcHBlYXJhbmNlICk7XG5cbiAgICAvLyBSZWNyZWF0ZSB0aGUgZG90cyB3aGVuIHRoZSBudW1iZXIgb2YgcGFnZXMgY2hhbmdlc1xuICAgIGNvbnN0IHJlY3JlYXRlRG90Tm9kZXMgPSAoIG51bWJlck9mUGFnZXM6IG51bWJlciApID0+IHtcbiAgICAgIGFzc2VydCAmJiBhc3NlcnQoIG51bWJlck9mUGFnZXMgPj0gMSApO1xuXG4gICAgICBkb3ROb2RlcyA9IF8ucmFuZ2UoIDAsIG51bWJlck9mUGFnZXMgKS5tYXAoIHBhZ2VOdW1iZXIgPT4gbmV3IERvdE5vZGUoIHBhZ2VOdW1iZXIsIG9wdGlvbnMuZG90UmFkaXVzLCBkb3RPcHRpb25zICkgKTtcbiAgICAgIGRvdEJveC5jaGlsZHJlbiA9IGRvdE5vZGVzO1xuICAgICAgdXBkYXRlRG90QXBwZWFyYW5jZSggcGFnZU51bWJlclByb3BlcnR5LnZhbHVlICk7IC8vIHNpbmNlIHRoZXkgYXJlIHJlY3JlYXRlZCwgdXBkYXRlIHRoZWlyIGFwcGVhcmFuY2VcbiAgICB9O1xuICAgIG51bWJlck9mUGFnZXNQcm9wZXJ0eS5saW5rKCByZWNyZWF0ZURvdE5vZGVzICk7XG5cbiAgICBvcHRpb25zLmNoaWxkcmVuID0gWyBkb3RCb3ggXTtcblxuICAgIHN1cGVyKCBvcHRpb25zICk7XG5cbiAgICB0aGlzLmRpc3Bvc2VQYWdlQ29udHJvbCA9ICgpID0+IHtcbiAgICAgIHByZXNzTGlzdGVuZXIuZGlzcG9zZSgpO1xuICAgICAgbnVtYmVyT2ZQYWdlc1Byb3BlcnR5LnVubGluayggcmVjcmVhdGVEb3ROb2RlcyApO1xuICAgICAgcGFnZU51bWJlclByb3BlcnR5LnVubGluayggdXBkYXRlRG90QXBwZWFyYW5jZSApO1xuICAgIH07XG4gIH1cblxuICBwdWJsaWMgb3ZlcnJpZGUgZGlzcG9zZSgpOiB2b2lkIHtcbiAgICB0aGlzLmRpc3Bvc2VQYWdlQ29udHJvbCgpO1xuICAgIHN1cGVyLmRpc3Bvc2UoKTtcbiAgfVxufVxuXG4vKipcbiAqIE9uZSBvZiB0aGUgZG90cyBpbiB0aGUgcGFnZSBjb250cm9sLCB3aXRoIGFuIGFzc29jaWF0ZWQgcGFnZSBudW1iZXIuXG4gKi9cbmNsYXNzIERvdE5vZGUgZXh0ZW5kcyBDaXJjbGUge1xuXG4gIC8vIHRoZSBwYWdlIG51bWJlciBhc3NvY2lhdGVkIHdpdGggdGhpcyBkb3RcbiAgcHVibGljIHJlYWRvbmx5IHBhZ2VOdW1iZXI6IG51bWJlcjtcblxuICBwdWJsaWMgY29uc3RydWN0b3IoIHBhZ2VOdW1iZXI6IG51bWJlciwgcmFkaXVzOiBudW1iZXIsIG9wdGlvbnM6IENpcmNsZU9wdGlvbnMgKSB7XG4gICAgc3VwZXIoIHJhZGl1cywgb3B0aW9ucyApO1xuXG4gICAgdGhpcy5wYWdlTnVtYmVyID0gcGFnZU51bWJlcjtcbiAgfVxufVxuXG5zdW4ucmVnaXN0ZXIoICdQYWdlQ29udHJvbCcsIFBhZ2VDb250cm9sICk7Il0sIm5hbWVzIjpbIlZlY3RvcjIiLCJTaGFwZSIsIm9wdGlvbml6ZSIsIkNpcmNsZSIsIkZsb3dCb3giLCJMYXlvdXRPcmllbnRhdGlvblZhbHVlcyIsIk5vZGUiLCJQcmVzc0xpc3RlbmVyIiwiVGFuZGVtIiwic3VuIiwiUGFnZUNvbnRyb2wiLCJkaXNwb3NlIiwiZGlzcG9zZVBhZ2VDb250cm9sIiwicGFnZU51bWJlclByb3BlcnR5IiwibnVtYmVyT2ZQYWdlc1Byb3BlcnR5IiwicHJvdmlkZWRPcHRpb25zIiwib3B0aW9ucyIsImludGVyYWN0aXZlIiwib3JpZW50YXRpb24iLCJkb3RSYWRpdXMiLCJsaW5lV2lkdGgiLCJkb3RTcGFjaW5nIiwiZG90VG91Y2hBcmVhRGlsYXRpb24iLCJkb3RNb3VzZUFyZWFEaWxhdGlvbiIsImN1cnJlbnRQYWdlRmlsbCIsImN1cnJlbnRQYWdlU3Ryb2tlIiwicGFnZUZpbGwiLCJwYWdlU3Ryb2tlIiwidGFuZGVtIiwiUkVRVUlSRUQiLCJ0YW5kZW1OYW1lU3VmZml4IiwidmlzaWJsZVByb3BlcnR5T3B0aW9ucyIsInBoZXRpb0ZlYXR1cmVkIiwiYXNzZXJ0IiwiaW5jbHVkZXMiLCJwcmVzc0xpc3RlbmVyIiwicHJlc3MiLCJldmVudCIsImN1cnJlbnRUYXJnZXQiLCJEb3ROb2RlIiwidmFsdWUiLCJwYWdlTnVtYmVyIiwiY3JlYXRlVGFuZGVtIiwiZG90T3B0aW9ucyIsIm1vdXNlQXJlYSIsImNpcmNsZSIsInRvdWNoQXJlYSIsImJvdW5kc01ldGhvZCIsImN1cnNvciIsImlucHV0TGlzdGVuZXJzIiwiZG90Qm94Iiwic3BhY2luZyIsImRvdE5vZGVzIiwiYm91bmRzUHJvcGVydHkiLCJsaW5rIiwiY2VudGVyIiwiWkVSTyIsInVwZGF0ZURvdEFwcGVhcmFuY2UiLCJmb3JFYWNoIiwiZG90Tm9kZSIsImZpbGwiLCJzdHJva2UiLCJyZWNyZWF0ZURvdE5vZGVzIiwibnVtYmVyT2ZQYWdlcyIsIl8iLCJyYW5nZSIsIm1hcCIsImNoaWxkcmVuIiwidW5saW5rIiwicmFkaXVzIiwicmVnaXN0ZXIiXSwibWFwcGluZ3MiOiJBQUFBLHNEQUFzRDtBQUV0RDs7Ozs7Q0FLQyxHQUlELE9BQU9BLGFBQWEsMEJBQTBCO0FBQzlDLFNBQVNDLEtBQUssUUFBUSwyQkFBMkI7QUFDakQsT0FBT0MsZUFBZSxrQ0FBa0M7QUFFeEQsU0FBU0MsTUFBTSxFQUFpQkMsT0FBTyxFQUFxQkMsdUJBQXVCLEVBQUVDLElBQUksRUFBZUMsYUFBYSxRQUFvQyw4QkFBOEI7QUFDdkwsT0FBT0MsWUFBWSw0QkFBNEI7QUFDL0MsT0FBT0MsU0FBUyxXQUFXO0FBd0JaLElBQUEsQUFBTUMsY0FBTixNQUFNQSxvQkFBb0JKO0lBa0d2QkssVUFBZ0I7UUFDOUIsSUFBSSxDQUFDQyxrQkFBa0I7UUFDdkIsS0FBSyxDQUFDRDtJQUNSO0lBakdBOzs7O0dBSUMsR0FDRCxZQUFvQkUsa0JBQXFDLEVBQUVDLHFCQUFnRCxFQUFFQyxlQUFvQyxDQUFHO1FBRWxKLE1BQU1DLFVBQVVkLFlBQTJEO1lBRXpFLGNBQWM7WUFDZGUsYUFBYTtZQUNiQyxhQUFhO1lBQ2JDLFdBQVc7WUFDWEMsV0FBVztZQUNYQyxZQUFZO1lBQ1pDLHNCQUFzQjtZQUN0QkMsc0JBQXNCO1lBQ3RCQyxpQkFBaUI7WUFDakJDLG1CQUFtQjtZQUNuQkMsVUFBVTtZQUNWQyxZQUFZO1lBRVosY0FBYztZQUNkQyxRQUFRcEIsT0FBT3FCLFFBQVE7WUFDdkJDLGtCQUFrQjtZQUNsQkMsd0JBQXdCO2dCQUN0QkMsZ0JBQWdCO1lBQ2xCO1FBQ0YsR0FBR2pCO1FBRUgsbUJBQW1CO1FBQ25Ca0IsVUFBVUEsT0FBUTVCLHdCQUF3QjZCLFFBQVEsQ0FBRWxCLFFBQVFFLFdBQVcsR0FBSSxDQUFDLG9CQUFvQixFQUFFRixRQUFRRSxXQUFXLEVBQUU7UUFFdkgsc0NBQXNDO1FBQ3RDLE1BQU1pQixnQkFBZ0IsSUFBSTVCLGNBQWU7WUFDdkM2QixPQUFPLENBQUVDO2dCQUNQLElBQUtBLE1BQU1DLGFBQWEsWUFBWUMsU0FBVTtvQkFDNUMxQixtQkFBbUIyQixLQUFLLEdBQUdILE1BQU1DLGFBQWEsQ0FBQ0csVUFBVTtnQkFDM0Q7WUFDRjtZQUNBYixRQUFRWixRQUFRWSxNQUFNLENBQUNjLFlBQVksQ0FBRTtRQUN2QztRQUVBLE1BQU1DLGFBQTRCO1lBQ2hDdkIsV0FBV0osUUFBUUksU0FBUztZQUM1QndCLFdBQVcsQUFBRTVCLFFBQVFPLG9CQUFvQixLQUFLLElBQU0sT0FBT3RCLE1BQU00QyxNQUFNLENBQUUsR0FBRyxHQUFHN0IsUUFBUUcsU0FBUyxHQUFHSCxRQUFRTyxvQkFBb0I7WUFDL0h1QixXQUFXLEFBQUU5QixRQUFRTSxvQkFBb0IsS0FBSyxJQUFNLE9BQU9yQixNQUFNNEMsTUFBTSxDQUFFLEdBQUcsR0FBRzdCLFFBQVFHLFNBQVMsR0FBR0gsUUFBUU0sb0JBQW9CO1lBRS9IeUIsY0FBYztZQUVkLHlCQUF5QjtZQUN6QkMsUUFBUWhDLFFBQVFDLFdBQVcsR0FBRyxZQUFZO1lBQzFDZ0MsZ0JBQWdCakMsUUFBUUMsV0FBVyxHQUFHO2dCQUFFa0I7YUFBZSxHQUFHLEVBQUU7UUFDOUQ7UUFFQSxNQUFNZSxTQUFTLElBQUk5QyxRQUFTO1lBQzFCYyxhQUFhRixRQUFRRSxXQUFXO1lBQ2hDaUMsU0FBU25DLFFBQVFLLFVBQVU7UUFDN0I7UUFDQSxJQUFJK0IsV0FBc0IsRUFBRTtRQUU1QixtQkFBbUI7UUFDbkJGLE9BQU9HLGNBQWMsQ0FBQ0MsSUFBSSxDQUFFO1lBQVFKLE9BQU9LLE1BQU0sR0FBR3ZELFFBQVF3RCxJQUFJO1FBQUU7UUFFbEUsa0JBQWtCO1FBQ2xCLE1BQU1DLHNCQUFzQixDQUFFaEI7WUFDNUJXLFNBQVNNLE9BQU8sQ0FBRUMsQ0FBQUE7Z0JBQ2hCQSxRQUFRQyxJQUFJLEdBQUcsQUFBRW5CLGVBQWVrQixRQUFRbEIsVUFBVSxHQUFLekIsUUFBUVEsZUFBZSxHQUFHUixRQUFRVSxRQUFRO2dCQUNqR2lDLFFBQVFFLE1BQU0sR0FBRyxBQUFFcEIsZUFBZWtCLFFBQVFsQixVQUFVLEdBQUt6QixRQUFRUyxpQkFBaUIsR0FBR1QsUUFBUVcsVUFBVTtZQUN6RztRQUNGO1FBQ0FkLG1CQUFtQnlDLElBQUksQ0FBRUc7UUFFekIscURBQXFEO1FBQ3JELE1BQU1LLG1CQUFtQixDQUFFQztZQUN6QjlCLFVBQVVBLE9BQVE4QixpQkFBaUI7WUFFbkNYLFdBQVdZLEVBQUVDLEtBQUssQ0FBRSxHQUFHRixlQUFnQkcsR0FBRyxDQUFFekIsQ0FBQUEsYUFBYyxJQUFJRixRQUFTRSxZQUFZekIsUUFBUUcsU0FBUyxFQUFFd0I7WUFDdEdPLE9BQU9pQixRQUFRLEdBQUdmO1lBQ2xCSyxvQkFBcUI1QyxtQkFBbUIyQixLQUFLLEdBQUksb0RBQW9EO1FBQ3ZHO1FBQ0ExQixzQkFBc0J3QyxJQUFJLENBQUVRO1FBRTVCOUMsUUFBUW1ELFFBQVEsR0FBRztZQUFFakI7U0FBUTtRQUU3QixLQUFLLENBQUVsQztRQUVQLElBQUksQ0FBQ0osa0JBQWtCLEdBQUc7WUFDeEJ1QixjQUFjeEIsT0FBTztZQUNyQkcsc0JBQXNCc0QsTUFBTSxDQUFFTjtZQUM5QmpELG1CQUFtQnVELE1BQU0sQ0FBRVg7UUFDN0I7SUFDRjtBQU1GO0FBdEdBLFNBQXFCL0MseUJBc0dwQjtBQUVEOztDQUVDLEdBQ0QsSUFBQSxBQUFNNkIsVUFBTixNQUFNQSxnQkFBZ0JwQztJQUtwQixZQUFvQnNDLFVBQWtCLEVBQUU0QixNQUFjLEVBQUVyRCxPQUFzQixDQUFHO1FBQy9FLEtBQUssQ0FBRXFELFFBQVFyRDtRQUVmLElBQUksQ0FBQ3lCLFVBQVUsR0FBR0E7SUFDcEI7QUFDRjtBQUVBaEMsSUFBSTZELFFBQVEsQ0FBRSxlQUFlNUQifQ==