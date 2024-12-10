// Copyright 2019-2023, University of Colorado Boulder
/**
 * TwoColumnKeyboardHelpContentOptions handles layout of KeyboardHelpSections in 2 columns.
 *
 * @author Jesse Greenberg
 */ import optionize, { combineOptions } from '../../../../phet-core/js/optionize.js';
import { HBox, Node, VBox } from '../../../../scenery/js/imports.js';
import sceneryPhet from '../../sceneryPhet.js';
let TwoColumnKeyboardHelpContent = class TwoColumnKeyboardHelpContent extends Node {
    /**
   * @param leftSections - KeyboardHelpSections for the left column
   * @param rightSections -  KeyboardHelpSections for the right column
   * @param [providedOptions]
   */ constructor(leftSections, rightSections, providedOptions){
        const options = optionize()({
            columnSpacing: 40,
            sectionSpacing: 40
        }, providedOptions);
        const columnOptions = {
            align: 'left',
            spacing: options.sectionSpacing
        };
        const leftColumn = new VBox(combineOptions({
            children: leftSections
        }, columnOptions));
        const rightColumn = new VBox(combineOptions({
            children: rightSections
        }, columnOptions));
        const hBox = new HBox({
            children: [
                leftColumn,
                rightColumn
            ],
            spacing: options.columnSpacing,
            align: 'top'
        });
        options.children = [
            hBox
        ];
        super(options);
    }
};
export { TwoColumnKeyboardHelpContent as default };
sceneryPhet.register('TwoColumnKeyboardHelpContent', TwoColumnKeyboardHelpContent);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9rZXlib2FyZC9oZWxwL1R3b0NvbHVtbktleWJvYXJkSGVscENvbnRlbnQudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTktMjAyMywgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbi8qKlxuICogVHdvQ29sdW1uS2V5Ym9hcmRIZWxwQ29udGVudE9wdGlvbnMgaGFuZGxlcyBsYXlvdXQgb2YgS2V5Ym9hcmRIZWxwU2VjdGlvbnMgaW4gMiBjb2x1bW5zLlxuICpcbiAqIEBhdXRob3IgSmVzc2UgR3JlZW5iZXJnXG4gKi9cblxuaW1wb3J0IG9wdGlvbml6ZSwgeyBjb21iaW5lT3B0aW9ucyB9IGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9vcHRpb25pemUuanMnO1xuaW1wb3J0IFN0cmljdE9taXQgZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL3R5cGVzL1N0cmljdE9taXQuanMnO1xuaW1wb3J0IHsgSEJveCwgTm9kZSwgTm9kZU9wdGlvbnMsIFZCb3gsIFZCb3hPcHRpb25zIH0gZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcbmltcG9ydCBzY2VuZXJ5UGhldCBmcm9tICcuLi8uLi9zY2VuZXJ5UGhldC5qcyc7XG5pbXBvcnQgS2V5Ym9hcmRIZWxwU2VjdGlvbiBmcm9tICcuL0tleWJvYXJkSGVscFNlY3Rpb24uanMnO1xuXG50eXBlIFNlbGZPcHRpb25zID0ge1xuXG4gIC8vIHNwYWNpbmcgYmV0d2VlbiB0aGUgbGVmdCBhbmQgcmlnaHQgY29sdW1ucyBvZiB0aGUgaGVscCBjb250ZW50XG4gIGNvbHVtblNwYWNpbmc/OiBudW1iZXI7XG5cbiAgLy8gdmVydGljYWwgc3BhY2luZyBiZXR3ZWVuIEtleWJvYXJkSGVscFNlY3Rpb25zIGluIGVhY2ggY29sdW1uXG4gIHNlY3Rpb25TcGFjaW5nPzogbnVtYmVyO1xufTtcblxuZXhwb3J0IHR5cGUgVHdvQ29sdW1uS2V5Ym9hcmRIZWxwQ29udGVudE9wdGlvbnMgPSBTZWxmT3B0aW9ucyAmIFN0cmljdE9taXQ8Tm9kZU9wdGlvbnMsICdjaGlsZHJlbic+O1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBUd29Db2x1bW5LZXlib2FyZEhlbHBDb250ZW50IGV4dGVuZHMgTm9kZSB7XG5cbiAgLyoqXG4gICAqIEBwYXJhbSBsZWZ0U2VjdGlvbnMgLSBLZXlib2FyZEhlbHBTZWN0aW9ucyBmb3IgdGhlIGxlZnQgY29sdW1uXG4gICAqIEBwYXJhbSByaWdodFNlY3Rpb25zIC0gIEtleWJvYXJkSGVscFNlY3Rpb25zIGZvciB0aGUgcmlnaHQgY29sdW1uXG4gICAqIEBwYXJhbSBbcHJvdmlkZWRPcHRpb25zXVxuICAgKi9cbiAgcHVibGljIGNvbnN0cnVjdG9yKCBsZWZ0U2VjdGlvbnM6IEtleWJvYXJkSGVscFNlY3Rpb25bXSwgcmlnaHRTZWN0aW9uczogS2V5Ym9hcmRIZWxwU2VjdGlvbltdLFxuICAgICAgICAgICAgICAgICAgICAgIHByb3ZpZGVkT3B0aW9ucz86IFR3b0NvbHVtbktleWJvYXJkSGVscENvbnRlbnRPcHRpb25zICkge1xuXG4gICAgY29uc3Qgb3B0aW9ucyA9IG9wdGlvbml6ZTxUd29Db2x1bW5LZXlib2FyZEhlbHBDb250ZW50T3B0aW9ucywgU2VsZk9wdGlvbnMsIE5vZGVPcHRpb25zPigpKCB7XG4gICAgICBjb2x1bW5TcGFjaW5nOiA0MCxcbiAgICAgIHNlY3Rpb25TcGFjaW5nOiA0MFxuICAgIH0sIHByb3ZpZGVkT3B0aW9ucyApO1xuXG4gICAgY29uc3QgY29sdW1uT3B0aW9uczogU3RyaWN0T21pdDxWQm94T3B0aW9ucywgJ2NoaWxkcmVuJz4gPSB7XG4gICAgICBhbGlnbjogJ2xlZnQnLFxuICAgICAgc3BhY2luZzogb3B0aW9ucy5zZWN0aW9uU3BhY2luZ1xuICAgIH07XG4gICAgY29uc3QgbGVmdENvbHVtbiA9IG5ldyBWQm94KCBjb21iaW5lT3B0aW9uczxWQm94T3B0aW9ucz4oIHtcbiAgICAgIGNoaWxkcmVuOiBsZWZ0U2VjdGlvbnNcbiAgICB9LCBjb2x1bW5PcHRpb25zICkgKTtcbiAgICBjb25zdCByaWdodENvbHVtbiA9IG5ldyBWQm94KCBjb21iaW5lT3B0aW9uczxWQm94T3B0aW9ucz4oIHtcbiAgICAgIGNoaWxkcmVuOiByaWdodFNlY3Rpb25zXG4gICAgfSwgY29sdW1uT3B0aW9ucyApICk7XG5cbiAgICBjb25zdCBoQm94ID0gbmV3IEhCb3goIHtcbiAgICAgIGNoaWxkcmVuOiBbIGxlZnRDb2x1bW4sIHJpZ2h0Q29sdW1uIF0sXG4gICAgICBzcGFjaW5nOiBvcHRpb25zLmNvbHVtblNwYWNpbmcsXG4gICAgICBhbGlnbjogJ3RvcCdcbiAgICB9ICk7XG5cbiAgICBvcHRpb25zLmNoaWxkcmVuID0gWyBoQm94IF07XG5cbiAgICBzdXBlciggb3B0aW9ucyApO1xuICB9XG59XG5cbnNjZW5lcnlQaGV0LnJlZ2lzdGVyKCAnVHdvQ29sdW1uS2V5Ym9hcmRIZWxwQ29udGVudCcsIFR3b0NvbHVtbktleWJvYXJkSGVscENvbnRlbnQgKTsiXSwibmFtZXMiOlsib3B0aW9uaXplIiwiY29tYmluZU9wdGlvbnMiLCJIQm94IiwiTm9kZSIsIlZCb3giLCJzY2VuZXJ5UGhldCIsIlR3b0NvbHVtbktleWJvYXJkSGVscENvbnRlbnQiLCJsZWZ0U2VjdGlvbnMiLCJyaWdodFNlY3Rpb25zIiwicHJvdmlkZWRPcHRpb25zIiwib3B0aW9ucyIsImNvbHVtblNwYWNpbmciLCJzZWN0aW9uU3BhY2luZyIsImNvbHVtbk9wdGlvbnMiLCJhbGlnbiIsInNwYWNpbmciLCJsZWZ0Q29sdW1uIiwiY2hpbGRyZW4iLCJyaWdodENvbHVtbiIsImhCb3giLCJyZWdpc3RlciJdLCJtYXBwaW5ncyI6IkFBQUEsc0RBQXNEO0FBRXREOzs7O0NBSUMsR0FFRCxPQUFPQSxhQUFhQyxjQUFjLFFBQVEsd0NBQXdDO0FBRWxGLFNBQVNDLElBQUksRUFBRUMsSUFBSSxFQUFlQyxJQUFJLFFBQXFCLG9DQUFvQztBQUMvRixPQUFPQyxpQkFBaUIsdUJBQXVCO0FBY2hDLElBQUEsQUFBTUMsK0JBQU4sTUFBTUEscUNBQXFDSDtJQUV4RDs7OztHQUlDLEdBQ0QsWUFBb0JJLFlBQW1DLEVBQUVDLGFBQW9DLEVBQ3pFQyxlQUFxRCxDQUFHO1FBRTFFLE1BQU1DLFVBQVVWLFlBQTRFO1lBQzFGVyxlQUFlO1lBQ2ZDLGdCQUFnQjtRQUNsQixHQUFHSDtRQUVILE1BQU1JLGdCQUFxRDtZQUN6REMsT0FBTztZQUNQQyxTQUFTTCxRQUFRRSxjQUFjO1FBQ2pDO1FBQ0EsTUFBTUksYUFBYSxJQUFJWixLQUFNSCxlQUE2QjtZQUN4RGdCLFVBQVVWO1FBQ1osR0FBR007UUFDSCxNQUFNSyxjQUFjLElBQUlkLEtBQU1ILGVBQTZCO1lBQ3pEZ0IsVUFBVVQ7UUFDWixHQUFHSztRQUVILE1BQU1NLE9BQU8sSUFBSWpCLEtBQU07WUFDckJlLFVBQVU7Z0JBQUVEO2dCQUFZRTthQUFhO1lBQ3JDSCxTQUFTTCxRQUFRQyxhQUFhO1lBQzlCRyxPQUFPO1FBQ1Q7UUFFQUosUUFBUU8sUUFBUSxHQUFHO1lBQUVFO1NBQU07UUFFM0IsS0FBSyxDQUFFVDtJQUNUO0FBQ0Y7QUFwQ0EsU0FBcUJKLDBDQW9DcEI7QUFFREQsWUFBWWUsUUFBUSxDQUFFLGdDQUFnQ2QifQ==