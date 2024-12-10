// Copyright 2022-2024, University of Colorado Boulder
/**
 * A UI component that allows you to change language of the simulation at runtime by controlling the localeProperty.
 * It appears in the "Localization" tab of the Preferences dialog.
 *
 * This is a first iteration of this UI component. It may be improved in the future. See
 * https://github.com/phetsims/joist/issues/814 for more history.
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */ import { GridBox } from '../../../scenery/js/imports.js';
import Panel from '../../../sun/js/Panel.js';
import joist from '../joist.js';
import JoistStrings from '../JoistStrings.js';
import LanguageSelectionNode from './LanguageSelectionNode.js';
let LocalePanel = class LocalePanel extends Panel {
    constructor(localeProperty){
        // All available locales aligned into a grid
        const content = new GridBox({
            xMargin: 5,
            xAlign: 'left',
            autoRows: 15,
            // By inspection, safety net in case there are too many languages. Will scale down this panel without
            // the entire PreferencesDialog scaling down.
            maxWidth: 1000,
            // We don't want the GridBox to resize as selection highlights update with input
            resize: false,
            children: localeProperty.availableRuntimeLocales.map((locale)=>{
                return new LanguageSelectionNode(localeProperty, locale);
            })
        });
        super(content, {
            // pdom
            tagName: 'div',
            labelTagName: 'h3',
            labelContent: JoistStrings.preferences.tabs.localization.languageSelection.titleStringProperty,
            descriptionTagName: 'p',
            descriptionContent: JoistStrings.preferences.tabs.localization.languageSelection.descriptionStringProperty
        });
    }
};
joist.register('LocalePanel', LocalePanel);
export default LocalePanel;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL2pvaXN0L2pzL3ByZWZlcmVuY2VzL0xvY2FsZVBhbmVsLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDIyLTIwMjQsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIEEgVUkgY29tcG9uZW50IHRoYXQgYWxsb3dzIHlvdSB0byBjaGFuZ2UgbGFuZ3VhZ2Ugb2YgdGhlIHNpbXVsYXRpb24gYXQgcnVudGltZSBieSBjb250cm9sbGluZyB0aGUgbG9jYWxlUHJvcGVydHkuXG4gKiBJdCBhcHBlYXJzIGluIHRoZSBcIkxvY2FsaXphdGlvblwiIHRhYiBvZiB0aGUgUHJlZmVyZW5jZXMgZGlhbG9nLlxuICpcbiAqIFRoaXMgaXMgYSBmaXJzdCBpdGVyYXRpb24gb2YgdGhpcyBVSSBjb21wb25lbnQuIEl0IG1heSBiZSBpbXByb3ZlZCBpbiB0aGUgZnV0dXJlLiBTZWVcbiAqIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9qb2lzdC9pc3N1ZXMvODE0IGZvciBtb3JlIGhpc3RvcnkuXG4gKlxuICogQGF1dGhvciBKZXNzZSBHcmVlbmJlcmcgKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXG4gKi9cblxuaW1wb3J0IHsgR3JpZEJveCB9IGZyb20gJy4uLy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XG5pbXBvcnQgUGFuZWwgZnJvbSAnLi4vLi4vLi4vc3VuL2pzL1BhbmVsLmpzJztcbmltcG9ydCB7IExvY2FsZVByb3BlcnR5IH0gZnJvbSAnLi4vaTE4bi9sb2NhbGVQcm9wZXJ0eS5qcyc7XG5pbXBvcnQgam9pc3QgZnJvbSAnLi4vam9pc3QuanMnO1xuaW1wb3J0IEpvaXN0U3RyaW5ncyBmcm9tICcuLi9Kb2lzdFN0cmluZ3MuanMnO1xuaW1wb3J0IExhbmd1YWdlU2VsZWN0aW9uTm9kZSBmcm9tICcuL0xhbmd1YWdlU2VsZWN0aW9uTm9kZS5qcyc7XG5cbmNsYXNzIExvY2FsZVBhbmVsIGV4dGVuZHMgUGFuZWwge1xuICBwdWJsaWMgY29uc3RydWN0b3IoIGxvY2FsZVByb3BlcnR5OiBMb2NhbGVQcm9wZXJ0eSApIHtcblxuICAgIC8vIEFsbCBhdmFpbGFibGUgbG9jYWxlcyBhbGlnbmVkIGludG8gYSBncmlkXG4gICAgY29uc3QgY29udGVudCA9IG5ldyBHcmlkQm94KCB7XG4gICAgICB4TWFyZ2luOiA1LFxuICAgICAgeEFsaWduOiAnbGVmdCcsXG4gICAgICBhdXRvUm93czogMTUsXG5cbiAgICAgIC8vIEJ5IGluc3BlY3Rpb24sIHNhZmV0eSBuZXQgaW4gY2FzZSB0aGVyZSBhcmUgdG9vIG1hbnkgbGFuZ3VhZ2VzLiBXaWxsIHNjYWxlIGRvd24gdGhpcyBwYW5lbCB3aXRob3V0XG4gICAgICAvLyB0aGUgZW50aXJlIFByZWZlcmVuY2VzRGlhbG9nIHNjYWxpbmcgZG93bi5cbiAgICAgIG1heFdpZHRoOiAxMDAwLFxuXG4gICAgICAvLyBXZSBkb24ndCB3YW50IHRoZSBHcmlkQm94IHRvIHJlc2l6ZSBhcyBzZWxlY3Rpb24gaGlnaGxpZ2h0cyB1cGRhdGUgd2l0aCBpbnB1dFxuICAgICAgcmVzaXplOiBmYWxzZSxcbiAgICAgIGNoaWxkcmVuOiBsb2NhbGVQcm9wZXJ0eS5hdmFpbGFibGVSdW50aW1lTG9jYWxlcy5tYXAoIGxvY2FsZSA9PiB7XG4gICAgICAgIHJldHVybiBuZXcgTGFuZ3VhZ2VTZWxlY3Rpb25Ob2RlKCBsb2NhbGVQcm9wZXJ0eSwgbG9jYWxlICk7XG4gICAgICB9IClcbiAgICB9ICk7XG5cbiAgICBzdXBlciggY29udGVudCwge1xuXG4gICAgICAvLyBwZG9tXG4gICAgICB0YWdOYW1lOiAnZGl2JyxcbiAgICAgIGxhYmVsVGFnTmFtZTogJ2gzJyxcbiAgICAgIGxhYmVsQ29udGVudDogSm9pc3RTdHJpbmdzLnByZWZlcmVuY2VzLnRhYnMubG9jYWxpemF0aW9uLmxhbmd1YWdlU2VsZWN0aW9uLnRpdGxlU3RyaW5nUHJvcGVydHksXG4gICAgICBkZXNjcmlwdGlvblRhZ05hbWU6ICdwJyxcbiAgICAgIGRlc2NyaXB0aW9uQ29udGVudDogSm9pc3RTdHJpbmdzLnByZWZlcmVuY2VzLnRhYnMubG9jYWxpemF0aW9uLmxhbmd1YWdlU2VsZWN0aW9uLmRlc2NyaXB0aW9uU3RyaW5nUHJvcGVydHlcbiAgICB9ICk7XG4gIH1cbn1cblxuam9pc3QucmVnaXN0ZXIoICdMb2NhbGVQYW5lbCcsIExvY2FsZVBhbmVsICk7XG5leHBvcnQgZGVmYXVsdCBMb2NhbGVQYW5lbDsiXSwibmFtZXMiOlsiR3JpZEJveCIsIlBhbmVsIiwiam9pc3QiLCJKb2lzdFN0cmluZ3MiLCJMYW5ndWFnZVNlbGVjdGlvbk5vZGUiLCJMb2NhbGVQYW5lbCIsImxvY2FsZVByb3BlcnR5IiwiY29udGVudCIsInhNYXJnaW4iLCJ4QWxpZ24iLCJhdXRvUm93cyIsIm1heFdpZHRoIiwicmVzaXplIiwiY2hpbGRyZW4iLCJhdmFpbGFibGVSdW50aW1lTG9jYWxlcyIsIm1hcCIsImxvY2FsZSIsInRhZ05hbWUiLCJsYWJlbFRhZ05hbWUiLCJsYWJlbENvbnRlbnQiLCJwcmVmZXJlbmNlcyIsInRhYnMiLCJsb2NhbGl6YXRpb24iLCJsYW5ndWFnZVNlbGVjdGlvbiIsInRpdGxlU3RyaW5nUHJvcGVydHkiLCJkZXNjcmlwdGlvblRhZ05hbWUiLCJkZXNjcmlwdGlvbkNvbnRlbnQiLCJkZXNjcmlwdGlvblN0cmluZ1Byb3BlcnR5IiwicmVnaXN0ZXIiXSwibWFwcGluZ3MiOiJBQUFBLHNEQUFzRDtBQUV0RDs7Ozs7Ozs7Q0FRQyxHQUVELFNBQVNBLE9BQU8sUUFBUSxpQ0FBaUM7QUFDekQsT0FBT0MsV0FBVywyQkFBMkI7QUFFN0MsT0FBT0MsV0FBVyxjQUFjO0FBQ2hDLE9BQU9DLGtCQUFrQixxQkFBcUI7QUFDOUMsT0FBT0MsMkJBQTJCLDZCQUE2QjtBQUUvRCxJQUFBLEFBQU1DLGNBQU4sTUFBTUEsb0JBQW9CSjtJQUN4QixZQUFvQkssY0FBOEIsQ0FBRztRQUVuRCw0Q0FBNEM7UUFDNUMsTUFBTUMsVUFBVSxJQUFJUCxRQUFTO1lBQzNCUSxTQUFTO1lBQ1RDLFFBQVE7WUFDUkMsVUFBVTtZQUVWLHFHQUFxRztZQUNyRyw2Q0FBNkM7WUFDN0NDLFVBQVU7WUFFVixnRkFBZ0Y7WUFDaEZDLFFBQVE7WUFDUkMsVUFBVVAsZUFBZVEsdUJBQXVCLENBQUNDLEdBQUcsQ0FBRUMsQ0FBQUE7Z0JBQ3BELE9BQU8sSUFBSVosc0JBQXVCRSxnQkFBZ0JVO1lBQ3BEO1FBQ0Y7UUFFQSxLQUFLLENBQUVULFNBQVM7WUFFZCxPQUFPO1lBQ1BVLFNBQVM7WUFDVEMsY0FBYztZQUNkQyxjQUFjaEIsYUFBYWlCLFdBQVcsQ0FBQ0MsSUFBSSxDQUFDQyxZQUFZLENBQUNDLGlCQUFpQixDQUFDQyxtQkFBbUI7WUFDOUZDLG9CQUFvQjtZQUNwQkMsb0JBQW9CdkIsYUFBYWlCLFdBQVcsQ0FBQ0MsSUFBSSxDQUFDQyxZQUFZLENBQUNDLGlCQUFpQixDQUFDSSx5QkFBeUI7UUFDNUc7SUFDRjtBQUNGO0FBRUF6QixNQUFNMEIsUUFBUSxDQUFFLGVBQWV2QjtBQUMvQixlQUFlQSxZQUFZIn0=