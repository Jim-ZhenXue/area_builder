// Copyright 2022-2024, University of Colorado Boulder
/**
 * Class for items of a LocalePanel. Locales shown in their localized name wrapped in a Rectangle for highlighting
 * and input listeners.
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */ import StringUtils from '../../../phetcommon/js/util/StringUtils.js';
import PhetColorScheme from '../../../scenery-phet/js/PhetColorScheme.js';
import { Color, FireListener, HighlightOverlay, Rectangle, Text } from '../../../scenery/js/imports.js';
import sharedSoundPlayers from '../../../tambo/js/sharedSoundPlayers.js';
import Tandem from '../../../tandem/js/Tandem.js';
import joist from '../joist.js';
import JoistStrings from '../JoistStrings.js';
import PreferencesDialog from './PreferencesDialog.js';
let LanguageSelectionNode = class LanguageSelectionNode extends Rectangle {
    constructor(localeProperty, locale){
        // Wrap it with embedding marks to ensure it displays correctly, see https://github.com/phetsims/chipper/issues/1379
        const wrappedLocaleString = StringUtils.localeToLocalizedName(locale);
        // Include the locale code when running with ?dev.
        const string = phet.chipper.queryParameters.dev ? StringUtils.wrapLTR(`${wrappedLocaleString} (${locale})`) : wrappedLocaleString;
        // The english name of the locale is reported for accessibility because PDOM strings are not translatable.
        // If you use the localized name, it might change the screen reader voice.
        const localeData = phet.chipper.localeData[locale];
        assert && assert(localeData, `No localeData for ${locale}`);
        const englishLocaleString = localeData.englishName;
        const text = new Text(string, {
            font: PreferencesDialog.CONTENT_FONT
        });
        super(text.bounds.dilated(5), {
            cursor: 'pointer',
            // pdom
            tagName: 'button',
            innerContent: englishLocaleString
        });
        text.center = this.center;
        this.addChild(text);
        this.locale = locale;
        const pushButtonSoundPlayer = sharedSoundPlayers.get('pushButton');
        const fireListener = new FireListener({
            fire: ()=>{
                localeProperty.value = locale;
                pushButtonSoundPlayer.play();
                this.alertDescriptionUtterance(StringUtils.fillIn(JoistStrings.a11y.preferences.tabs.localization.languageSelection.languageChangeResponsePatternStringProperty, {
                    language: englishLocaleString
                }));
            },
            // Preferences components are not instrumented, see https://github.com/phetsims/joist/issues/744
            tandem: Tandem.OPT_OUT
        });
        this.addInputListener(fireListener);
        fireListener.isOverProperty.link((isOver)=>{
            // makes the mouse interactive, keep the same dimensions so the layout will not change
            this.stroke = isOver ? HighlightOverlay.getInnerGroupHighlightColor() : Color.TRANSPARENT;
        });
        const localeListener = (selectedLocale)=>{
            // identifies the selected locale
            this.fill = selectedLocale === locale ? PhetColorScheme.PHET_LOGO_BLUE : null;
        };
        localeProperty.link(localeListener);
    }
};
export { LanguageSelectionNode as default };
joist.register('LanguageSelectionNode', LanguageSelectionNode);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL2pvaXN0L2pzL3ByZWZlcmVuY2VzL0xhbmd1YWdlU2VsZWN0aW9uTm9kZS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAyMi0yMDI0LCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuLyoqXG4gKiBDbGFzcyBmb3IgaXRlbXMgb2YgYSBMb2NhbGVQYW5lbC4gTG9jYWxlcyBzaG93biBpbiB0aGVpciBsb2NhbGl6ZWQgbmFtZSB3cmFwcGVkIGluIGEgUmVjdGFuZ2xlIGZvciBoaWdobGlnaHRpbmdcbiAqIGFuZCBpbnB1dCBsaXN0ZW5lcnMuXG4gKlxuICogQGF1dGhvciBKZXNzZSBHcmVlbmJlcmcgKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXG4gKi9cblxuaW1wb3J0IFByb3BlcnR5IGZyb20gJy4uLy4uLy4uL2F4b24vanMvUHJvcGVydHkuanMnO1xuaW1wb3J0IFN0cmluZ1V0aWxzIGZyb20gJy4uLy4uLy4uL3BoZXRjb21tb24vanMvdXRpbC9TdHJpbmdVdGlscy5qcyc7XG5pbXBvcnQgUGhldENvbG9yU2NoZW1lIGZyb20gJy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9QaGV0Q29sb3JTY2hlbWUuanMnO1xuaW1wb3J0IHsgQ29sb3IsIEZpcmVMaXN0ZW5lciwgSGlnaGxpZ2h0T3ZlcmxheSwgUmVjdGFuZ2xlLCBUZXh0IH0gZnJvbSAnLi4vLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcbmltcG9ydCBzaGFyZWRTb3VuZFBsYXllcnMgZnJvbSAnLi4vLi4vLi4vdGFtYm8vanMvc2hhcmVkU291bmRQbGF5ZXJzLmpzJztcbmltcG9ydCBUYW5kZW0gZnJvbSAnLi4vLi4vLi4vdGFuZGVtL2pzL1RhbmRlbS5qcyc7XG5pbXBvcnQgeyBMb2NhbGUgfSBmcm9tICcuLi9pMThuL2xvY2FsZVByb3BlcnR5LmpzJztcbmltcG9ydCBqb2lzdCBmcm9tICcuLi9qb2lzdC5qcyc7XG5pbXBvcnQgSm9pc3RTdHJpbmdzIGZyb20gJy4uL0pvaXN0U3RyaW5ncy5qcyc7XG5pbXBvcnQgUHJlZmVyZW5jZXNEaWFsb2cgZnJvbSAnLi9QcmVmZXJlbmNlc0RpYWxvZy5qcyc7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIExhbmd1YWdlU2VsZWN0aW9uTm9kZSBleHRlbmRzIFJlY3RhbmdsZSB7XG5cbiAgcHVibGljIHJlYWRvbmx5IGxvY2FsZTogTG9jYWxlOyAvLyBsb2NhbGUgYXNzb2NpYXRlZCB3aXRoIHRoaXMgTm9kZVxuXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggbG9jYWxlUHJvcGVydHk6IFByb3BlcnR5PExvY2FsZT4sIGxvY2FsZTogTG9jYWxlICkge1xuXG4gICAgLy8gV3JhcCBpdCB3aXRoIGVtYmVkZGluZyBtYXJrcyB0byBlbnN1cmUgaXQgZGlzcGxheXMgY29ycmVjdGx5LCBzZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2NoaXBwZXIvaXNzdWVzLzEzNzlcbiAgICBjb25zdCB3cmFwcGVkTG9jYWxlU3RyaW5nID0gU3RyaW5nVXRpbHMubG9jYWxlVG9Mb2NhbGl6ZWROYW1lKCBsb2NhbGUgKTtcblxuICAgIC8vIEluY2x1ZGUgdGhlIGxvY2FsZSBjb2RlIHdoZW4gcnVubmluZyB3aXRoID9kZXYuXG4gICAgY29uc3Qgc3RyaW5nID0gcGhldC5jaGlwcGVyLnF1ZXJ5UGFyYW1ldGVycy5kZXYgP1xuICAgICAgICAgICAgICAgICAgIFN0cmluZ1V0aWxzLndyYXBMVFIoIGAke3dyYXBwZWRMb2NhbGVTdHJpbmd9ICgke2xvY2FsZX0pYCApIDpcbiAgICAgICAgICAgICAgICAgICB3cmFwcGVkTG9jYWxlU3RyaW5nO1xuXG4gICAgLy8gVGhlIGVuZ2xpc2ggbmFtZSBvZiB0aGUgbG9jYWxlIGlzIHJlcG9ydGVkIGZvciBhY2Nlc3NpYmlsaXR5IGJlY2F1c2UgUERPTSBzdHJpbmdzIGFyZSBub3QgdHJhbnNsYXRhYmxlLlxuICAgIC8vIElmIHlvdSB1c2UgdGhlIGxvY2FsaXplZCBuYW1lLCBpdCBtaWdodCBjaGFuZ2UgdGhlIHNjcmVlbiByZWFkZXIgdm9pY2UuXG4gICAgY29uc3QgbG9jYWxlRGF0YSA9IHBoZXQuY2hpcHBlci5sb2NhbGVEYXRhWyBsb2NhbGUgXTtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBsb2NhbGVEYXRhLCBgTm8gbG9jYWxlRGF0YSBmb3IgJHtsb2NhbGV9YCApO1xuICAgIGNvbnN0IGVuZ2xpc2hMb2NhbGVTdHJpbmcgPSBsb2NhbGVEYXRhLmVuZ2xpc2hOYW1lO1xuXG4gICAgY29uc3QgdGV4dCA9IG5ldyBUZXh0KCBzdHJpbmcsIHtcbiAgICAgIGZvbnQ6IFByZWZlcmVuY2VzRGlhbG9nLkNPTlRFTlRfRk9OVFxuICAgIH0gKTtcblxuICAgIHN1cGVyKCB0ZXh0LmJvdW5kcy5kaWxhdGVkKCA1ICksIHtcbiAgICAgIGN1cnNvcjogJ3BvaW50ZXInLFxuXG4gICAgICAvLyBwZG9tXG4gICAgICB0YWdOYW1lOiAnYnV0dG9uJyxcbiAgICAgIGlubmVyQ29udGVudDogZW5nbGlzaExvY2FsZVN0cmluZ1xuICAgIH0gKTtcbiAgICB0ZXh0LmNlbnRlciA9IHRoaXMuY2VudGVyO1xuICAgIHRoaXMuYWRkQ2hpbGQoIHRleHQgKTtcblxuICAgIHRoaXMubG9jYWxlID0gbG9jYWxlO1xuICAgIGNvbnN0IHB1c2hCdXR0b25Tb3VuZFBsYXllciA9IHNoYXJlZFNvdW5kUGxheWVycy5nZXQoICdwdXNoQnV0dG9uJyApO1xuXG4gICAgY29uc3QgZmlyZUxpc3RlbmVyID0gbmV3IEZpcmVMaXN0ZW5lcigge1xuICAgICAgZmlyZTogKCkgPT4ge1xuICAgICAgICBsb2NhbGVQcm9wZXJ0eS52YWx1ZSA9IGxvY2FsZTtcblxuICAgICAgICBwdXNoQnV0dG9uU291bmRQbGF5ZXIucGxheSgpO1xuICAgICAgICB0aGlzLmFsZXJ0RGVzY3JpcHRpb25VdHRlcmFuY2UoIFN0cmluZ1V0aWxzLmZpbGxJbihcbiAgICAgICAgICBKb2lzdFN0cmluZ3MuYTExeS5wcmVmZXJlbmNlcy50YWJzLmxvY2FsaXphdGlvbi5sYW5ndWFnZVNlbGVjdGlvbi5sYW5ndWFnZUNoYW5nZVJlc3BvbnNlUGF0dGVyblN0cmluZ1Byb3BlcnR5LCB7XG4gICAgICAgICAgICBsYW5ndWFnZTogZW5nbGlzaExvY2FsZVN0cmluZ1xuICAgICAgICAgIH0gKVxuICAgICAgICApO1xuICAgICAgfSxcblxuICAgICAgLy8gUHJlZmVyZW5jZXMgY29tcG9uZW50cyBhcmUgbm90IGluc3RydW1lbnRlZCwgc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9qb2lzdC9pc3N1ZXMvNzQ0XG4gICAgICB0YW5kZW06IFRhbmRlbS5PUFRfT1VUXG4gICAgfSApO1xuICAgIHRoaXMuYWRkSW5wdXRMaXN0ZW5lciggZmlyZUxpc3RlbmVyICk7XG5cbiAgICBmaXJlTGlzdGVuZXIuaXNPdmVyUHJvcGVydHkubGluayggaXNPdmVyID0+IHtcblxuICAgICAgLy8gbWFrZXMgdGhlIG1vdXNlIGludGVyYWN0aXZlLCBrZWVwIHRoZSBzYW1lIGRpbWVuc2lvbnMgc28gdGhlIGxheW91dCB3aWxsIG5vdCBjaGFuZ2VcbiAgICAgIHRoaXMuc3Ryb2tlID0gaXNPdmVyID8gSGlnaGxpZ2h0T3ZlcmxheS5nZXRJbm5lckdyb3VwSGlnaGxpZ2h0Q29sb3IoKSA6IENvbG9yLlRSQU5TUEFSRU5UO1xuICAgIH0gKTtcblxuICAgIGNvbnN0IGxvY2FsZUxpc3RlbmVyID0gKCBzZWxlY3RlZExvY2FsZTogc3RyaW5nICkgPT4ge1xuXG4gICAgICAvLyBpZGVudGlmaWVzIHRoZSBzZWxlY3RlZCBsb2NhbGVcbiAgICAgIHRoaXMuZmlsbCA9IHNlbGVjdGVkTG9jYWxlID09PSBsb2NhbGUgPyBQaGV0Q29sb3JTY2hlbWUuUEhFVF9MT0dPX0JMVUUgOiBudWxsO1xuICAgIH07XG4gICAgbG9jYWxlUHJvcGVydHkubGluayggbG9jYWxlTGlzdGVuZXIgKTtcbiAgfVxufVxuXG5qb2lzdC5yZWdpc3RlciggJ0xhbmd1YWdlU2VsZWN0aW9uTm9kZScsIExhbmd1YWdlU2VsZWN0aW9uTm9kZSApOyJdLCJuYW1lcyI6WyJTdHJpbmdVdGlscyIsIlBoZXRDb2xvclNjaGVtZSIsIkNvbG9yIiwiRmlyZUxpc3RlbmVyIiwiSGlnaGxpZ2h0T3ZlcmxheSIsIlJlY3RhbmdsZSIsIlRleHQiLCJzaGFyZWRTb3VuZFBsYXllcnMiLCJUYW5kZW0iLCJqb2lzdCIsIkpvaXN0U3RyaW5ncyIsIlByZWZlcmVuY2VzRGlhbG9nIiwiTGFuZ3VhZ2VTZWxlY3Rpb25Ob2RlIiwibG9jYWxlUHJvcGVydHkiLCJsb2NhbGUiLCJ3cmFwcGVkTG9jYWxlU3RyaW5nIiwibG9jYWxlVG9Mb2NhbGl6ZWROYW1lIiwic3RyaW5nIiwicGhldCIsImNoaXBwZXIiLCJxdWVyeVBhcmFtZXRlcnMiLCJkZXYiLCJ3cmFwTFRSIiwibG9jYWxlRGF0YSIsImFzc2VydCIsImVuZ2xpc2hMb2NhbGVTdHJpbmciLCJlbmdsaXNoTmFtZSIsInRleHQiLCJmb250IiwiQ09OVEVOVF9GT05UIiwiYm91bmRzIiwiZGlsYXRlZCIsImN1cnNvciIsInRhZ05hbWUiLCJpbm5lckNvbnRlbnQiLCJjZW50ZXIiLCJhZGRDaGlsZCIsInB1c2hCdXR0b25Tb3VuZFBsYXllciIsImdldCIsImZpcmVMaXN0ZW5lciIsImZpcmUiLCJ2YWx1ZSIsInBsYXkiLCJhbGVydERlc2NyaXB0aW9uVXR0ZXJhbmNlIiwiZmlsbEluIiwiYTExeSIsInByZWZlcmVuY2VzIiwidGFicyIsImxvY2FsaXphdGlvbiIsImxhbmd1YWdlU2VsZWN0aW9uIiwibGFuZ3VhZ2VDaGFuZ2VSZXNwb25zZVBhdHRlcm5TdHJpbmdQcm9wZXJ0eSIsImxhbmd1YWdlIiwidGFuZGVtIiwiT1BUX09VVCIsImFkZElucHV0TGlzdGVuZXIiLCJpc092ZXJQcm9wZXJ0eSIsImxpbmsiLCJpc092ZXIiLCJzdHJva2UiLCJnZXRJbm5lckdyb3VwSGlnaGxpZ2h0Q29sb3IiLCJUUkFOU1BBUkVOVCIsImxvY2FsZUxpc3RlbmVy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