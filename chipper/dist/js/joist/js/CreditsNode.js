// Copyright 2015-2022, University of Colorado Boulder
/**
 * CreditsNode displays the credits section in the About dialog.
 * See documentation below for conventions related to each credits field.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Chris Malley (PixelZoom, Inc.)
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ import DerivedProperty from '../../axon/js/DerivedProperty.js';
import optionize from '../../phet-core/js/optionize.js';
import StringUtils from '../../phetcommon/js/util/StringUtils.js';
import PhetFont from '../../scenery-phet/js/PhetFont.js';
import { VBox, VoicingRichText, VoicingText, VStrut } from '../../scenery/js/imports.js';
import joist from './joist.js';
import JoistStrings from './JoistStrings.js';
let CreditsNode = class CreditsNode extends VBox {
    dispose() {
        this.disposeCreditsNode();
        super.dispose();
    }
    constructor(credits, options){
        options = optionize()({
            titleFont: new PhetFont({
                size: 18,
                weight: 'bold'
            }),
            textFont: new PhetFont(16),
            align: 'left',
            spacing: 1,
            maxWidth: 550
        }, options);
        const richTextOptions = {
            font: options.textFont,
            align: 'left',
            lineWrap: options.maxWidth,
            tagName: 'p'
        };
        const children = [];
        // Credits
        children.push(new VoicingText(JoistStrings.credits.titleStringProperty, {
            font: options.titleFont,
            // pdom
            tagName: 'h2'
        }));
        const formatStringProperty = (stringProperty, innerString)=>{
            return new DerivedProperty([
                stringProperty
            ], (string)=>{
                return StringUtils.format(string, `\u202a${innerString}\u202c`);
            });
        };
        // Primary HTML5 designer first, followed by contributing designers (HTML5 and legacy) in alphabetical order.
        if (credits.leadDesign) {
            const designStringProperty = formatStringProperty(JoistStrings.credits.leadDesignStringProperty, credits.leadDesign);
            children.push(new VoicingRichText(designStringProperty, richTextOptions));
        }
        // Primary HTML5 developer first, followed by contributing developers (HTML5 and legacy) in alphabetical order.
        if (credits.softwareDevelopment) {
            const developmentStringProperty = formatStringProperty(JoistStrings.credits.softwareDevelopmentStringProperty, credits.softwareDevelopment);
            children.push(new VoicingRichText(developmentStringProperty, richTextOptions));
        }
        // In alphabetical order (includes HTML5 and legacy team members)
        if (credits.team) {
            const teamStringProperty = formatStringProperty(JoistStrings.credits.teamStringProperty, credits.team);
            children.push(new VoicingRichText(teamStringProperty, richTextOptions));
        }
        // In alphabetical order (this field is new for HTML5 sims)
        if (credits.contributors) {
            const contributorsStringProperty = formatStringProperty(JoistStrings.credits.contributorsStringProperty, credits.contributors);
            children.push(new VoicingRichText(contributorsStringProperty, richTextOptions));
        }
        // In alphabetical order (this field is new for HTML5 sims)
        if (credits.qualityAssurance) {
            const qualityAssuranceStringProperty = formatStringProperty(JoistStrings.credits.qualityAssuranceStringProperty, credits.qualityAssurance);
            children.push(new VoicingRichText(qualityAssuranceStringProperty, richTextOptions));
        }
        // In alphabetical order (this field is new for HTML5 sims)
        if (credits.graphicArts) {
            const graphicArtsStringProperty = formatStringProperty(JoistStrings.credits.graphicArtsStringProperty, credits.graphicArts);
            children.push(new VoicingRichText(graphicArtsStringProperty, richTextOptions));
        }
        // In alphabetical order (this field is new for HTML5 sims)
        if (credits.soundDesign) {
            const soundDesignStringProperty = formatStringProperty(JoistStrings.credits.soundDesignStringProperty, credits.soundDesign);
            children.push(new VoicingRichText(soundDesignStringProperty, richTextOptions));
        }
        // Thanks
        if (credits.thanks) {
            if (children.length > 0) {
                children.push(new VStrut(13));
            }
            children.push(new VoicingText(JoistStrings.credits.thanksStringProperty, {
                font: options.titleFont,
                tagName: 'h2'
            }));
            const thanksText = new VoicingRichText(credits.thanks, richTextOptions);
            thanksText.innerContent = credits.thanks;
            children.push(thanksText);
        }
        assert && assert(!options.children, 'CreditsNode sets children');
        options.children = children;
        super(options);
        this.disposeCreditsNode = ()=>{
            children.forEach((child)=>{
                child.dispose && child.dispose();
            });
        };
    }
};
export { CreditsNode as default };
joist.register('CreditsNode', CreditsNode);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2pvaXN0L2pzL0NyZWRpdHNOb2RlLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE1LTIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIENyZWRpdHNOb2RlIGRpc3BsYXlzIHRoZSBjcmVkaXRzIHNlY3Rpb24gaW4gdGhlIEFib3V0IGRpYWxvZy5cbiAqIFNlZSBkb2N1bWVudGF0aW9uIGJlbG93IGZvciBjb252ZW50aW9ucyByZWxhdGVkIHRvIGVhY2ggY3JlZGl0cyBmaWVsZC5cbiAqXG4gKiBAYXV0aG9yIFNhbSBSZWlkIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxuICogQGF1dGhvciBDaHJpcyBNYWxsZXkgKFBpeGVsWm9vbSwgSW5jLilcbiAqIEBhdXRob3IgSm9uYXRoYW4gT2xzb24gPGpvbmF0aGFuLm9sc29uQGNvbG9yYWRvLmVkdT5cbiAqL1xuXG5pbXBvcnQgRGVyaXZlZFByb3BlcnR5IGZyb20gJy4uLy4uL2F4b24vanMvRGVyaXZlZFByb3BlcnR5LmpzJztcbmltcG9ydCBUUmVhZE9ubHlQcm9wZXJ0eSBmcm9tICcuLi8uLi9heG9uL2pzL1RSZWFkT25seVByb3BlcnR5LmpzJztcbmltcG9ydCBvcHRpb25pemUgZnJvbSAnLi4vLi4vcGhldC1jb3JlL2pzL29wdGlvbml6ZS5qcyc7XG5pbXBvcnQgU3RyaW5nVXRpbHMgZnJvbSAnLi4vLi4vcGhldGNvbW1vbi9qcy91dGlsL1N0cmluZ1V0aWxzLmpzJztcbmltcG9ydCBQaGV0Rm9udCBmcm9tICcuLi8uLi9zY2VuZXJ5LXBoZXQvanMvUGhldEZvbnQuanMnO1xuaW1wb3J0IHsgTm9kZSwgVkJveCwgVkJveE9wdGlvbnMsIFZvaWNpbmdSaWNoVGV4dCwgVm9pY2luZ1RleHQsIFZTdHJ1dCB9IGZyb20gJy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XG5pbXBvcnQgam9pc3QgZnJvbSAnLi9qb2lzdC5qcyc7XG5pbXBvcnQgSm9pc3RTdHJpbmdzIGZyb20gJy4vSm9pc3RTdHJpbmdzLmpzJztcblxudHlwZSBTZWxmT3B0aW9ucyA9IHtcbiAgdGl0bGVGb250PzogUGhldEZvbnQ7XG4gIHRleHRGb250PzogUGhldEZvbnQ7XG59O1xudHlwZSBDcmVkaXRzTm9kZU9wdGlvbnMgPSBTZWxmT3B0aW9ucyAmIFZCb3hPcHRpb25zO1xuXG5leHBvcnQgdHlwZSBDcmVkaXRzRGF0YSA9IHtcbiAgbGVhZERlc2lnbj86IHN0cmluZztcbiAgc29mdHdhcmVEZXZlbG9wbWVudD86IHN0cmluZztcbiAgdGVhbT86IHN0cmluZztcbiAgY29udHJpYnV0b3JzPzogc3RyaW5nO1xuICBxdWFsaXR5QXNzdXJhbmNlPzogc3RyaW5nO1xuICBncmFwaGljQXJ0cz86IHN0cmluZztcbiAgc291bmREZXNpZ24/OiBzdHJpbmc7XG4gIHRoYW5rcz86IHN0cmluZztcbn07XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIENyZWRpdHNOb2RlIGV4dGVuZHMgVkJveCB7XG4gIHByaXZhdGUgcmVhZG9ubHkgZGlzcG9zZUNyZWRpdHNOb2RlOiAoKSA9PiB2b2lkO1xuXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggY3JlZGl0czogQ3JlZGl0c0RhdGEsIG9wdGlvbnM6IENyZWRpdHNOb2RlT3B0aW9ucyApIHtcblxuICAgIG9wdGlvbnMgPSBvcHRpb25pemU8Q3JlZGl0c05vZGVPcHRpb25zLCBTZWxmT3B0aW9ucywgVkJveE9wdGlvbnM+KCkoIHtcbiAgICAgIHRpdGxlRm9udDogbmV3IFBoZXRGb250KCB7IHNpemU6IDE4LCB3ZWlnaHQ6ICdib2xkJyB9ICksXG4gICAgICB0ZXh0Rm9udDogbmV3IFBoZXRGb250KCAxNiApLFxuICAgICAgYWxpZ246ICdsZWZ0JyxcbiAgICAgIHNwYWNpbmc6IDEsXG4gICAgICBtYXhXaWR0aDogNTUwXG4gICAgfSwgb3B0aW9ucyApO1xuXG4gICAgY29uc3QgcmljaFRleHRPcHRpb25zID0ge1xuICAgICAgZm9udDogb3B0aW9ucy50ZXh0Rm9udCxcbiAgICAgIGFsaWduOiAnbGVmdCcgYXMgY29uc3QsXG4gICAgICBsaW5lV3JhcDogb3B0aW9ucy5tYXhXaWR0aCxcbiAgICAgIHRhZ05hbWU6ICdwJ1xuICAgIH07XG5cbiAgICBjb25zdCBjaGlsZHJlbjogTm9kZVtdID0gW107XG5cbiAgICAvLyBDcmVkaXRzXG4gICAgY2hpbGRyZW4ucHVzaCggbmV3IFZvaWNpbmdUZXh0KCBKb2lzdFN0cmluZ3MuY3JlZGl0cy50aXRsZVN0cmluZ1Byb3BlcnR5LCB7XG4gICAgICBmb250OiBvcHRpb25zLnRpdGxlRm9udCxcblxuICAgICAgLy8gcGRvbVxuICAgICAgdGFnTmFtZTogJ2gyJ1xuICAgIH0gKSApO1xuXG4gICAgY29uc3QgZm9ybWF0U3RyaW5nUHJvcGVydHkgPSAoIHN0cmluZ1Byb3BlcnR5OiBUUmVhZE9ubHlQcm9wZXJ0eTxzdHJpbmc+LCBpbm5lclN0cmluZzogc3RyaW5nICk6IFRSZWFkT25seVByb3BlcnR5PHN0cmluZz4gPT4ge1xuICAgICAgcmV0dXJuIG5ldyBEZXJpdmVkUHJvcGVydHkoIFsgc3RyaW5nUHJvcGVydHkgXSwgc3RyaW5nID0+IHtcbiAgICAgICAgcmV0dXJuIFN0cmluZ1V0aWxzLmZvcm1hdCggc3RyaW5nLCBgXFx1MjAyYSR7aW5uZXJTdHJpbmd9XFx1MjAyY2AgKTtcbiAgICAgIH0gKTtcbiAgICB9O1xuXG4gICAgLy8gUHJpbWFyeSBIVE1MNSBkZXNpZ25lciBmaXJzdCwgZm9sbG93ZWQgYnkgY29udHJpYnV0aW5nIGRlc2lnbmVycyAoSFRNTDUgYW5kIGxlZ2FjeSkgaW4gYWxwaGFiZXRpY2FsIG9yZGVyLlxuICAgIGlmICggY3JlZGl0cy5sZWFkRGVzaWduICkge1xuICAgICAgY29uc3QgZGVzaWduU3RyaW5nUHJvcGVydHkgPSBmb3JtYXRTdHJpbmdQcm9wZXJ0eSggSm9pc3RTdHJpbmdzLmNyZWRpdHMubGVhZERlc2lnblN0cmluZ1Byb3BlcnR5LCBjcmVkaXRzLmxlYWREZXNpZ24gKTtcbiAgICAgIGNoaWxkcmVuLnB1c2goIG5ldyBWb2ljaW5nUmljaFRleHQoIGRlc2lnblN0cmluZ1Byb3BlcnR5LCByaWNoVGV4dE9wdGlvbnMgKSApO1xuICAgIH1cblxuICAgIC8vIFByaW1hcnkgSFRNTDUgZGV2ZWxvcGVyIGZpcnN0LCBmb2xsb3dlZCBieSBjb250cmlidXRpbmcgZGV2ZWxvcGVycyAoSFRNTDUgYW5kIGxlZ2FjeSkgaW4gYWxwaGFiZXRpY2FsIG9yZGVyLlxuICAgIGlmICggY3JlZGl0cy5zb2Z0d2FyZURldmVsb3BtZW50ICkge1xuICAgICAgY29uc3QgZGV2ZWxvcG1lbnRTdHJpbmdQcm9wZXJ0eSA9IGZvcm1hdFN0cmluZ1Byb3BlcnR5KCBKb2lzdFN0cmluZ3MuY3JlZGl0cy5zb2Z0d2FyZURldmVsb3BtZW50U3RyaW5nUHJvcGVydHksIGNyZWRpdHMuc29mdHdhcmVEZXZlbG9wbWVudCApO1xuICAgICAgY2hpbGRyZW4ucHVzaCggbmV3IFZvaWNpbmdSaWNoVGV4dCggZGV2ZWxvcG1lbnRTdHJpbmdQcm9wZXJ0eSwgcmljaFRleHRPcHRpb25zICkgKTtcbiAgICB9XG5cbiAgICAvLyBJbiBhbHBoYWJldGljYWwgb3JkZXIgKGluY2x1ZGVzIEhUTUw1IGFuZCBsZWdhY3kgdGVhbSBtZW1iZXJzKVxuICAgIGlmICggY3JlZGl0cy50ZWFtICkge1xuICAgICAgY29uc3QgdGVhbVN0cmluZ1Byb3BlcnR5ID0gZm9ybWF0U3RyaW5nUHJvcGVydHkoIEpvaXN0U3RyaW5ncy5jcmVkaXRzLnRlYW1TdHJpbmdQcm9wZXJ0eSwgY3JlZGl0cy50ZWFtICk7XG4gICAgICBjaGlsZHJlbi5wdXNoKCBuZXcgVm9pY2luZ1JpY2hUZXh0KCB0ZWFtU3RyaW5nUHJvcGVydHksIHJpY2hUZXh0T3B0aW9ucyApICk7XG4gICAgfVxuXG4gICAgLy8gSW4gYWxwaGFiZXRpY2FsIG9yZGVyICh0aGlzIGZpZWxkIGlzIG5ldyBmb3IgSFRNTDUgc2ltcylcbiAgICBpZiAoIGNyZWRpdHMuY29udHJpYnV0b3JzICkge1xuICAgICAgY29uc3QgY29udHJpYnV0b3JzU3RyaW5nUHJvcGVydHkgPSBmb3JtYXRTdHJpbmdQcm9wZXJ0eSggSm9pc3RTdHJpbmdzLmNyZWRpdHMuY29udHJpYnV0b3JzU3RyaW5nUHJvcGVydHksIGNyZWRpdHMuY29udHJpYnV0b3JzICk7XG4gICAgICBjaGlsZHJlbi5wdXNoKCBuZXcgVm9pY2luZ1JpY2hUZXh0KCBjb250cmlidXRvcnNTdHJpbmdQcm9wZXJ0eSwgcmljaFRleHRPcHRpb25zICkgKTtcbiAgICB9XG5cbiAgICAvLyBJbiBhbHBoYWJldGljYWwgb3JkZXIgKHRoaXMgZmllbGQgaXMgbmV3IGZvciBIVE1MNSBzaW1zKVxuICAgIGlmICggY3JlZGl0cy5xdWFsaXR5QXNzdXJhbmNlICkge1xuICAgICAgY29uc3QgcXVhbGl0eUFzc3VyYW5jZVN0cmluZ1Byb3BlcnR5ID0gZm9ybWF0U3RyaW5nUHJvcGVydHkoIEpvaXN0U3RyaW5ncy5jcmVkaXRzLnF1YWxpdHlBc3N1cmFuY2VTdHJpbmdQcm9wZXJ0eSwgY3JlZGl0cy5xdWFsaXR5QXNzdXJhbmNlICk7XG4gICAgICBjaGlsZHJlbi5wdXNoKCBuZXcgVm9pY2luZ1JpY2hUZXh0KCBxdWFsaXR5QXNzdXJhbmNlU3RyaW5nUHJvcGVydHksIHJpY2hUZXh0T3B0aW9ucyApICk7XG4gICAgfVxuXG4gICAgLy8gSW4gYWxwaGFiZXRpY2FsIG9yZGVyICh0aGlzIGZpZWxkIGlzIG5ldyBmb3IgSFRNTDUgc2ltcylcbiAgICBpZiAoIGNyZWRpdHMuZ3JhcGhpY0FydHMgKSB7XG4gICAgICBjb25zdCBncmFwaGljQXJ0c1N0cmluZ1Byb3BlcnR5ID0gZm9ybWF0U3RyaW5nUHJvcGVydHkoIEpvaXN0U3RyaW5ncy5jcmVkaXRzLmdyYXBoaWNBcnRzU3RyaW5nUHJvcGVydHksIGNyZWRpdHMuZ3JhcGhpY0FydHMgKTtcbiAgICAgIGNoaWxkcmVuLnB1c2goIG5ldyBWb2ljaW5nUmljaFRleHQoIGdyYXBoaWNBcnRzU3RyaW5nUHJvcGVydHksIHJpY2hUZXh0T3B0aW9ucyApICk7XG4gICAgfVxuXG4gICAgLy8gSW4gYWxwaGFiZXRpY2FsIG9yZGVyICh0aGlzIGZpZWxkIGlzIG5ldyBmb3IgSFRNTDUgc2ltcylcbiAgICBpZiAoIGNyZWRpdHMuc291bmREZXNpZ24gKSB7XG4gICAgICBjb25zdCBzb3VuZERlc2lnblN0cmluZ1Byb3BlcnR5ID0gZm9ybWF0U3RyaW5nUHJvcGVydHkoIEpvaXN0U3RyaW5ncy5jcmVkaXRzLnNvdW5kRGVzaWduU3RyaW5nUHJvcGVydHksIGNyZWRpdHMuc291bmREZXNpZ24gKTtcbiAgICAgIGNoaWxkcmVuLnB1c2goIG5ldyBWb2ljaW5nUmljaFRleHQoIHNvdW5kRGVzaWduU3RyaW5nUHJvcGVydHksIHJpY2hUZXh0T3B0aW9ucyApICk7XG4gICAgfVxuXG4gICAgLy8gVGhhbmtzXG4gICAgaWYgKCBjcmVkaXRzLnRoYW5rcyApIHtcbiAgICAgIGlmICggY2hpbGRyZW4ubGVuZ3RoID4gMCApIHsgY2hpbGRyZW4ucHVzaCggbmV3IFZTdHJ1dCggMTMgKSApOyB9XG4gICAgICBjaGlsZHJlbi5wdXNoKCBuZXcgVm9pY2luZ1RleHQoIEpvaXN0U3RyaW5ncy5jcmVkaXRzLnRoYW5rc1N0cmluZ1Byb3BlcnR5LCB7XG4gICAgICAgIGZvbnQ6IG9wdGlvbnMudGl0bGVGb250LFxuICAgICAgICB0YWdOYW1lOiAnaDInXG4gICAgICB9ICkgKTtcblxuICAgICAgY29uc3QgdGhhbmtzVGV4dCA9IG5ldyBWb2ljaW5nUmljaFRleHQoIGNyZWRpdHMudGhhbmtzLCByaWNoVGV4dE9wdGlvbnMgKTtcbiAgICAgIHRoYW5rc1RleHQuaW5uZXJDb250ZW50ID0gY3JlZGl0cy50aGFua3M7XG4gICAgICBjaGlsZHJlbi5wdXNoKCB0aGFua3NUZXh0ICk7XG4gICAgfVxuXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggIW9wdGlvbnMuY2hpbGRyZW4sICdDcmVkaXRzTm9kZSBzZXRzIGNoaWxkcmVuJyApO1xuICAgIG9wdGlvbnMuY2hpbGRyZW4gPSBjaGlsZHJlbjtcblxuICAgIHN1cGVyKCBvcHRpb25zICk7XG5cbiAgICB0aGlzLmRpc3Bvc2VDcmVkaXRzTm9kZSA9ICgpID0+IHtcbiAgICAgIGNoaWxkcmVuLmZvckVhY2goIGNoaWxkID0+IHtcbiAgICAgICAgY2hpbGQuZGlzcG9zZSAmJiBjaGlsZC5kaXNwb3NlKCk7XG4gICAgICB9ICk7XG4gICAgfTtcbiAgfVxuXG4gIHB1YmxpYyBvdmVycmlkZSBkaXNwb3NlKCk6IHZvaWQge1xuICAgIHRoaXMuZGlzcG9zZUNyZWRpdHNOb2RlKCk7XG4gICAgc3VwZXIuZGlzcG9zZSgpO1xuICB9XG59XG5cbmpvaXN0LnJlZ2lzdGVyKCAnQ3JlZGl0c05vZGUnLCBDcmVkaXRzTm9kZSApOyJdLCJuYW1lcyI6WyJEZXJpdmVkUHJvcGVydHkiLCJvcHRpb25pemUiLCJTdHJpbmdVdGlscyIsIlBoZXRGb250IiwiVkJveCIsIlZvaWNpbmdSaWNoVGV4dCIsIlZvaWNpbmdUZXh0IiwiVlN0cnV0Iiwiam9pc3QiLCJKb2lzdFN0cmluZ3MiLCJDcmVkaXRzTm9kZSIsImRpc3Bvc2UiLCJkaXNwb3NlQ3JlZGl0c05vZGUiLCJjcmVkaXRzIiwib3B0aW9ucyIsInRpdGxlRm9udCIsInNpemUiLCJ3ZWlnaHQiLCJ0ZXh0Rm9udCIsImFsaWduIiwic3BhY2luZyIsIm1heFdpZHRoIiwicmljaFRleHRPcHRpb25zIiwiZm9udCIsImxpbmVXcmFwIiwidGFnTmFtZSIsImNoaWxkcmVuIiwicHVzaCIsInRpdGxlU3RyaW5nUHJvcGVydHkiLCJmb3JtYXRTdHJpbmdQcm9wZXJ0eSIsInN0cmluZ1Byb3BlcnR5IiwiaW5uZXJTdHJpbmciLCJzdHJpbmciLCJmb3JtYXQiLCJsZWFkRGVzaWduIiwiZGVzaWduU3RyaW5nUHJvcGVydHkiLCJsZWFkRGVzaWduU3RyaW5nUHJvcGVydHkiLCJzb2Z0d2FyZURldmVsb3BtZW50IiwiZGV2ZWxvcG1lbnRTdHJpbmdQcm9wZXJ0eSIsInNvZnR3YXJlRGV2ZWxvcG1lbnRTdHJpbmdQcm9wZXJ0eSIsInRlYW0iLCJ0ZWFtU3RyaW5nUHJvcGVydHkiLCJjb250cmlidXRvcnMiLCJjb250cmlidXRvcnNTdHJpbmdQcm9wZXJ0eSIsInF1YWxpdHlBc3N1cmFuY2UiLCJxdWFsaXR5QXNzdXJhbmNlU3RyaW5nUHJvcGVydHkiLCJncmFwaGljQXJ0cyIsImdyYXBoaWNBcnRzU3RyaW5nUHJvcGVydHkiLCJzb3VuZERlc2lnbiIsInNvdW5kRGVzaWduU3RyaW5nUHJvcGVydHkiLCJ0aGFua3MiLCJsZW5ndGgiLCJ0aGFua3NTdHJpbmdQcm9wZXJ0eSIsInRoYW5rc1RleHQiLCJpbm5lckNvbnRlbnQiLCJhc3NlcnQiLCJmb3JFYWNoIiwiY2hpbGQiLCJyZWdpc3RlciJdLCJtYXBwaW5ncyI6IkFBQUEsc0RBQXNEO0FBRXREOzs7Ozs7O0NBT0MsR0FFRCxPQUFPQSxxQkFBcUIsbUNBQW1DO0FBRS9ELE9BQU9DLGVBQWUsa0NBQWtDO0FBQ3hELE9BQU9DLGlCQUFpQiwwQ0FBMEM7QUFDbEUsT0FBT0MsY0FBYyxvQ0FBb0M7QUFDekQsU0FBZUMsSUFBSSxFQUFlQyxlQUFlLEVBQUVDLFdBQVcsRUFBRUMsTUFBTSxRQUFRLDhCQUE4QjtBQUM1RyxPQUFPQyxXQUFXLGFBQWE7QUFDL0IsT0FBT0Msa0JBQWtCLG9CQUFvQjtBQW1COUIsSUFBQSxBQUFNQyxjQUFOLE1BQU1BLG9CQUFvQk47SUF1R3ZCTyxVQUFnQjtRQUM5QixJQUFJLENBQUNDLGtCQUFrQjtRQUN2QixLQUFLLENBQUNEO0lBQ1I7SUF2R0EsWUFBb0JFLE9BQW9CLEVBQUVDLE9BQTJCLENBQUc7UUFFdEVBLFVBQVViLFlBQTJEO1lBQ25FYyxXQUFXLElBQUlaLFNBQVU7Z0JBQUVhLE1BQU07Z0JBQUlDLFFBQVE7WUFBTztZQUNwREMsVUFBVSxJQUFJZixTQUFVO1lBQ3hCZ0IsT0FBTztZQUNQQyxTQUFTO1lBQ1RDLFVBQVU7UUFDWixHQUFHUDtRQUVILE1BQU1RLGtCQUFr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