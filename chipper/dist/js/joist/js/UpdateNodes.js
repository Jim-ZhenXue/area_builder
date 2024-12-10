// Copyright 2015-2024, University of Colorado Boulder
/**
 * UI parts for update-related dialogs
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ import DerivedProperty from '../../axon/js/DerivedProperty.js';
import merge from '../../phet-core/js/merge.js';
import StringUtils from '../../phetcommon/js/util/StringUtils.js';
import PhetFont from '../../scenery-phet/js/PhetFont.js';
import SpinningIndicatorNode from '../../scenery-phet/js/SpinningIndicatorNode.js';
import { allowLinksProperty, HBox, openPopup, Path, Rectangle, RichText, VBox, VoicingText, VStrut } from '../../scenery/js/imports.js';
import checkSolidShape from '../../sherpa/js/fontawesome-5/checkSolidShape.js';
import exclamationTriangleSolidShape from '../../sherpa/js/fontawesome-5/exclamationTriangleSolidShape.js';
import TextPushButton from '../../sun/js/buttons/TextPushButton.js';
import joist from './joist.js';
import JoistStrings from './JoistStrings.js';
import updateCheck from './updateCheck.js';
import UpdateState from './UpdateState.js';
// constants
const UPDATE_TEXT_FONT = new PhetFont(14);
const MAX_WIDTH = 550; // Maximum width of the resulting update items
const UpdateNodes = {
    /**
   * "Checking" state node. With two size options (if options.big == true, it will be bigger)
   *
   * [options] - passed to the Node
   * returns step( dt ) and stepListener (bound to the node itself)
   * (joist-internal)
   */ createCheckingNode: function(options) {
        const spinningIndicatorNode = new SpinningIndicatorNode({
            diameter: options.big ? 24 : 18
        });
        const checkingNode = new HBox(merge({
            spacing: options.big ? 10 : 8,
            maxWidth: MAX_WIDTH,
            children: [
                spinningIndicatorNode,
                new VoicingText(JoistStrings.updates.checkingStringProperty, {
                    font: new PhetFont(options.big ? 16 : 14),
                    fontWeight: options.big ? 'bold' : 'normal'
                })
            ]
        }, options));
        checkingNode.step = function(dt) {
            if (updateCheck.stateProperty.value === UpdateState.CHECKING) {
                spinningIndicatorNode.step(dt);
            }
        };
        checkingNode.stepListener = checkingNode.step.bind(checkingNode);
        return checkingNode;
    },
    /**
   * "Up-to-date" state node
   * [options] - passed to the Node
   * (joist-internal)
   */ createUpToDateNode: function(options) {
        return new HBox(merge({
            spacing: 8,
            maxWidth: MAX_WIDTH,
            children: [
                new Rectangle(0, 0, 20, 20, 5, 5, {
                    fill: '#5c3',
                    scale: options.big ? 1.2 : 1,
                    children: [
                        new Path(checkSolidShape, {
                            fill: '#fff',
                            scale: 0.029,
                            centerX: 10,
                            centerY: 10
                        })
                    ]
                }),
                new VoicingText(JoistStrings.updates.upToDateStringProperty, {
                    font: new PhetFont(options.big ? 16 : 14),
                    fontWeight: options.big ? 'bold' : 'normal'
                })
            ]
        }, options));
    },
    /**
   * "Out-of-date" state node for the "About" dialog.
   * [options] - passed to the Node
   * (joist-internal)
   */ createOutOfDateAboutNode: function(options) {
        const stringProperty = new DerivedProperty([
            JoistStrings.updates.outOfDateStringProperty,
            allowLinksProperty
        ], (outOfDateString, allowLinks)=>{
            return allowLinks ? `<a href="{{url}}">${outOfDateString}</a>` : outOfDateString;
        });
        const links = {
            url: updateCheck.updateURL
        };
        const linkNode = new RichText(stringProperty, {
            links: links,
            font: UPDATE_TEXT_FONT
        });
        return new HBox(merge({
            spacing: 8,
            maxWidth: MAX_WIDTH,
            children: [
                new Path(exclamationTriangleSolidShape, {
                    fill: '#E87600',
                    scale: 0.03
                }),
                linkNode
            ],
            // pdom
            tagName: 'div'
        }, options));
    },
    /**
   * "Out-of-date" state node for the "Check for update" dialog.
   * dialog - the dialog, so that it can be closed with the "No thanks..." button
   * [options] - passed to the Node
   * (joist-internal)
   */ createOutOfDateDialogNode: function(dialog, ourVersionString, latestVersionString, options) {
        const latestVersionStringProperty = new DerivedProperty([
            JoistStrings.updates.newVersionAvailableStringProperty
        ], (string)=>{
            return StringUtils.format(string, latestVersionString);
        });
        const ourVersionStringProperty = new DerivedProperty([
            JoistStrings.updates.yourCurrentVersionStringProperty
        ], (string)=>{
            return StringUtils.format(string, ourVersionString);
        });
        return new VBox(merge({
            spacing: 15,
            maxWidth: MAX_WIDTH,
            children: [
                new VBox({
                    spacing: 5,
                    align: 'left',
                    children: [
                        new VoicingText(latestVersionStringProperty, {
                            font: new PhetFont(16),
                            fontWeight: 'bold'
                        }),
                        new VoicingText(ourVersionStringProperty, {
                            font: UPDATE_TEXT_FONT
                        })
                    ]
                }),
                new HBox({
                    spacing: 25,
                    children: [
                        new TextPushButton(JoistStrings.updates.getUpdateStringProperty, {
                            visibleProperty: allowLinksProperty,
                            baseColor: '#6f6',
                            font: UPDATE_TEXT_FONT,
                            listener: function() {
                                openPopup(updateCheck.updateURL); // open in a new window/tab
                            }
                        }),
                        new TextPushButton(JoistStrings.updates.noThanksStringProperty, {
                            baseColor: '#ddd',
                            font: UPDATE_TEXT_FONT,
                            listener: function() {
                                dialog.hide();
                            // Closing the dialog is handled by the Dialog listener itself, no need to add code to close it here.
                            }
                        })
                    ]
                })
            ]
        }, options));
    },
    /**
   * "Offline" state node
   * [options] - passed to the Node
   * (joist-internal)
   */ createOfflineNode: function(options) {
        return new HBox(merge({
            spacing: 0,
            maxWidth: MAX_WIDTH,
            children: [
                new VStrut(20),
                new VoicingText(JoistStrings.updates.offlineStringProperty, {
                    font: new PhetFont(options.big ? 16 : 14),
                    fontWeight: options.big ? 'bold' : 'normal'
                })
            ]
        }, options));
    }
};
joist.register('UpdateNodes', UpdateNodes);
export default UpdateNodes;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2pvaXN0L2pzL1VwZGF0ZU5vZGVzLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE1LTIwMjQsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIFVJIHBhcnRzIGZvciB1cGRhdGUtcmVsYXRlZCBkaWFsb2dzXG4gKiBAYXV0aG9yIEpvbmF0aGFuIE9sc29uIDxqb25hdGhhbi5vbHNvbkBjb2xvcmFkby5lZHU+XG4gKi9cblxuaW1wb3J0IERlcml2ZWRQcm9wZXJ0eSBmcm9tICcuLi8uLi9heG9uL2pzL0Rlcml2ZWRQcm9wZXJ0eS5qcyc7XG5pbXBvcnQgbWVyZ2UgZnJvbSAnLi4vLi4vcGhldC1jb3JlL2pzL21lcmdlLmpzJztcbmltcG9ydCBTdHJpbmdVdGlscyBmcm9tICcuLi8uLi9waGV0Y29tbW9uL2pzL3V0aWwvU3RyaW5nVXRpbHMuanMnO1xuaW1wb3J0IFBoZXRGb250IGZyb20gJy4uLy4uL3NjZW5lcnktcGhldC9qcy9QaGV0Rm9udC5qcyc7XG5pbXBvcnQgU3Bpbm5pbmdJbmRpY2F0b3JOb2RlIGZyb20gJy4uLy4uL3NjZW5lcnktcGhldC9qcy9TcGlubmluZ0luZGljYXRvck5vZGUuanMnO1xuaW1wb3J0IHsgYWxsb3dMaW5rc1Byb3BlcnR5LCBIQm94LCBOb2RlLCBvcGVuUG9wdXAsIFBhdGgsIFJlY3RhbmdsZSwgUmljaFRleHQsIFJpY2hUZXh0TGlua3MsIFZCb3gsIFZvaWNpbmdUZXh0LCBWU3RydXQgfSBmcm9tICcuLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xuaW1wb3J0IGNoZWNrU29saWRTaGFwZSBmcm9tICcuLi8uLi9zaGVycGEvanMvZm9udGF3ZXNvbWUtNS9jaGVja1NvbGlkU2hhcGUuanMnO1xuaW1wb3J0IGV4Y2xhbWF0aW9uVHJpYW5nbGVTb2xpZFNoYXBlIGZyb20gJy4uLy4uL3NoZXJwYS9qcy9mb250YXdlc29tZS01L2V4Y2xhbWF0aW9uVHJpYW5nbGVTb2xpZFNoYXBlLmpzJztcbmltcG9ydCBUZXh0UHVzaEJ1dHRvbiBmcm9tICcuLi8uLi9zdW4vanMvYnV0dG9ucy9UZXh0UHVzaEJ1dHRvbi5qcyc7XG5pbXBvcnQgam9pc3QgZnJvbSAnLi9qb2lzdC5qcyc7XG5pbXBvcnQgSm9pc3RTdHJpbmdzIGZyb20gJy4vSm9pc3RTdHJpbmdzLmpzJztcbmltcG9ydCB1cGRhdGVDaGVjayBmcm9tICcuL3VwZGF0ZUNoZWNrLmpzJztcbmltcG9ydCBVcGRhdGVEaWFsb2cgZnJvbSAnLi9VcGRhdGVEaWFsb2cuanMnO1xuaW1wb3J0IFVwZGF0ZVN0YXRlIGZyb20gJy4vVXBkYXRlU3RhdGUuanMnO1xuXG4vLyBjb25zdGFudHNcbmNvbnN0IFVQREFURV9URVhUX0ZPTlQgPSBuZXcgUGhldEZvbnQoIDE0ICk7XG5jb25zdCBNQVhfV0lEVEggPSA1NTA7IC8vIE1heGltdW0gd2lkdGggb2YgdGhlIHJlc3VsdGluZyB1cGRhdGUgaXRlbXNcblxudHlwZSBPcHRpb25zID0ge1xuICBiaWc/OiBib29sZWFuO1xuICBjZW50ZXJYPzogbnVtYmVyO1xuICBjZW50ZXJZPzogbnVtYmVyO1xuICBsZWZ0PzogbnVtYmVyO1xuICB0b3A/OiBudW1iZXI7XG59O1xuXG50eXBlIFRTdGVwID0ge1xuICBzdGVwOiAoIGR0OiBudW1iZXIgKSA9PiB2b2lkO1xuICBzdGVwTGlzdGVuZXI6ICggZHQ6IG51bWJlciApID0+IHZvaWQ7XG59O1xuXG50eXBlIFRTdGVwSEJveCA9IFRTdGVwICYgSEJveDtcblxuY29uc3QgVXBkYXRlTm9kZXMgPSB7XG5cbiAgLyoqXG4gICAqIFwiQ2hlY2tpbmdcIiBzdGF0ZSBub2RlLiBXaXRoIHR3byBzaXplIG9wdGlvbnMgKGlmIG9wdGlvbnMuYmlnID09IHRydWUsIGl0IHdpbGwgYmUgYmlnZ2VyKVxuICAgKlxuICAgKiBbb3B0aW9uc10gLSBwYXNzZWQgdG8gdGhlIE5vZGVcbiAgICogcmV0dXJucyBzdGVwKCBkdCApIGFuZCBzdGVwTGlzdGVuZXIgKGJvdW5kIHRvIHRoZSBub2RlIGl0c2VsZilcbiAgICogKGpvaXN0LWludGVybmFsKVxuICAgKi9cbiAgY3JlYXRlQ2hlY2tpbmdOb2RlOiBmdW5jdGlvbiggb3B0aW9uczogT3B0aW9ucyApOiBOb2RlICYgVFN0ZXAge1xuICAgIGNvbnN0IHNwaW5uaW5nSW5kaWNhdG9yTm9kZSA9IG5ldyBTcGlubmluZ0luZGljYXRvck5vZGUoIHsgZGlhbWV0ZXI6IG9wdGlvbnMuYmlnID8gMjQgOiAxOCB9ICk7XG4gICAgY29uc3QgY2hlY2tpbmdOb2RlID0gbmV3IEhCb3goIG1lcmdlKCB7XG4gICAgICBzcGFjaW5nOiBvcHRpb25zLmJpZyA/IDEwIDogOCxcbiAgICAgIG1heFdpZHRoOiBNQVhfV0lEVEgsXG4gICAgICBjaGlsZHJlbjogW1xuICAgICAgICBzcGlubmluZ0luZGljYXRvck5vZGUsXG4gICAgICAgIG5ldyBWb2ljaW5nVGV4dCggSm9pc3RTdHJpbmdzLnVwZGF0ZXMuY2hlY2tpbmdTdHJpbmdQcm9wZXJ0eSwge1xuICAgICAgICAgIGZvbnQ6IG5ldyBQaGV0Rm9udCggb3B0aW9ucy5iaWcgPyAxNiA6IDE0ICksXG4gICAgICAgICAgZm9udFdlaWdodDogb3B0aW9ucy5iaWcgPyAnYm9sZCcgOiAnbm9ybWFsJ1xuICAgICAgICB9IClcbiAgICAgIF1cbiAgICB9LCBvcHRpb25zICkgKSBhcyBUU3RlcEhCb3g7XG4gICAgY2hlY2tpbmdOb2RlLnN0ZXAgPSBmdW5jdGlvbiggZHQgKSB7XG4gICAgICBpZiAoIHVwZGF0ZUNoZWNrLnN0YXRlUHJvcGVydHkudmFsdWUgPT09IFVwZGF0ZVN0YXRlLkNIRUNLSU5HICkge1xuICAgICAgICBzcGlubmluZ0luZGljYXRvck5vZGUuc3RlcCggZHQgKTtcbiAgICAgIH1cbiAgICB9O1xuICAgIGNoZWNraW5nTm9kZS5zdGVwTGlzdGVuZXIgPSBjaGVja2luZ05vZGUuc3RlcC5iaW5kKCBjaGVja2luZ05vZGUgKTtcbiAgICByZXR1cm4gY2hlY2tpbmdOb2RlO1xuICB9LFxuXG4gIC8qKlxuICAgKiBcIlVwLXRvLWRhdGVcIiBzdGF0ZSBub2RlXG4gICAqIFtvcHRpb25zXSAtIHBhc3NlZCB0byB0aGUgTm9kZVxuICAgKiAoam9pc3QtaW50ZXJuYWwpXG4gICAqL1xuICBjcmVhdGVVcFRvRGF0ZU5vZGU6IGZ1bmN0aW9uKCBvcHRpb25zOiBPcHRpb25zICk6IE5vZGUge1xuICAgIHJldHVybiBuZXcgSEJveCggbWVyZ2UoIHtcbiAgICAgIHNwYWNpbmc6IDgsXG4gICAgICBtYXhXaWR0aDogTUFYX1dJRFRILFxuICAgICAgY2hpbGRyZW46IFtcbiAgICAgICAgbmV3IFJlY3RhbmdsZSggMCwgMCwgMjAsIDIwLCA1LCA1LCB7XG4gICAgICAgICAgZmlsbDogJyM1YzMnLFxuICAgICAgICAgIHNjYWxlOiBvcHRpb25zLmJpZyA/IDEuMiA6IDEsXG4gICAgICAgICAgY2hpbGRyZW46IFtcbiAgICAgICAgICAgIG5ldyBQYXRoKCBjaGVja1NvbGlkU2hhcGUsIHtcbiAgICAgICAgICAgICAgZmlsbDogJyNmZmYnLFxuICAgICAgICAgICAgICBzY2FsZTogMC4wMjksXG4gICAgICAgICAgICAgIGNlbnRlclg6IDEwLFxuICAgICAgICAgICAgICBjZW50ZXJZOiAxMFxuICAgICAgICAgICAgfSApXG4gICAgICAgICAgXVxuICAgICAgICB9ICksXG4gICAgICAgIG5ldyBWb2ljaW5nVGV4dCggSm9pc3RTdHJpbmdzLnVwZGF0ZXMudXBUb0RhdGVTdHJpbmdQcm9wZXJ0eSwge1xuICAgICAgICAgIGZvbnQ6IG5ldyBQaGV0Rm9udCggb3B0aW9ucy5iaWcgPyAxNiA6IDE0ICksXG4gICAgICAgICAgZm9udFdlaWdodDogb3B0aW9ucy5iaWcgPyAnYm9sZCcgOiAnbm9ybWFsJ1xuICAgICAgICB9IClcbiAgICAgIF1cbiAgICB9LCBvcHRpb25zICkgKTtcbiAgfSxcblxuICAvKipcbiAgICogXCJPdXQtb2YtZGF0ZVwiIHN0YXRlIG5vZGUgZm9yIHRoZSBcIkFib3V0XCIgZGlhbG9nLlxuICAgKiBbb3B0aW9uc10gLSBwYXNzZWQgdG8gdGhlIE5vZGVcbiAgICogKGpvaXN0LWludGVybmFsKVxuICAgKi9cbiAgY3JlYXRlT3V0T2ZEYXRlQWJvdXROb2RlOiBmdW5jdGlvbiggb3B0aW9uczogT3B0aW9ucyApOiBOb2RlIHtcbiAgICBjb25zdCBzdHJpbmdQcm9wZXJ0eSA9IG5ldyBEZXJpdmVkUHJvcGVydHkoIFsgSm9pc3RTdHJpbmdzLnVwZGF0ZXMub3V0T2ZEYXRlU3RyaW5nUHJvcGVydHksIGFsbG93TGlua3NQcm9wZXJ0eSBdLCAoIG91dE9mRGF0ZVN0cmluZywgYWxsb3dMaW5rcyApID0+IHtcbiAgICAgIHJldHVybiBhbGxvd0xpbmtzID8gYDxhIGhyZWY9XCJ7e3VybH19XCI+JHtvdXRPZkRhdGVTdHJpbmd9PC9hPmAgOiBvdXRPZkRhdGVTdHJpbmc7XG4gICAgfSApO1xuXG4gICAgY29uc3QgbGlua3M6IFJpY2hUZXh0TGlua3MgPSB7IHVybDogdXBkYXRlQ2hlY2sudXBkYXRlVVJMIH07XG5cbiAgICBjb25zdCBsaW5rTm9kZSA9IG5ldyBSaWNoVGV4dCggc3RyaW5nUHJvcGVydHksIHtcbiAgICAgIGxpbmtzOiBsaW5rcyxcbiAgICAgIGZvbnQ6IFVQREFURV9URVhUX0ZPTlRcbiAgICB9ICk7XG4gICAgcmV0dXJuIG5ldyBIQm94KCBtZXJnZSgge1xuICAgICAgc3BhY2luZzogOCxcbiAgICAgIG1heFdpZHRoOiBNQVhfV0lEVEgsXG4gICAgICBjaGlsZHJlbjogW1xuICAgICAgICBuZXcgUGF0aCggZXhjbGFtYXRpb25UcmlhbmdsZVNvbGlkU2hhcGUsIHtcbiAgICAgICAgICBmaWxsOiAnI0U4NzYwMCcsIC8vIFwic2FmZXR5IG9yYW5nZVwiLCBhY2NvcmRpbmcgdG8gV2lraXBlZGlhXG4gICAgICAgICAgc2NhbGU6IDAuMDNcbiAgICAgICAgfSApLFxuICAgICAgICBsaW5rTm9kZVxuICAgICAgXSxcblxuICAgICAgLy8gcGRvbVxuICAgICAgdGFnTmFtZTogJ2RpdidcbiAgICB9LCBvcHRpb25zICkgKTtcbiAgfSxcblxuICAvKipcbiAgICogXCJPdXQtb2YtZGF0ZVwiIHN0YXRlIG5vZGUgZm9yIHRoZSBcIkNoZWNrIGZvciB1cGRhdGVcIiBkaWFsb2cuXG4gICAqIGRpYWxvZyAtIHRoZSBkaWFsb2csIHNvIHRoYXQgaXQgY2FuIGJlIGNsb3NlZCB3aXRoIHRoZSBcIk5vIHRoYW5rcy4uLlwiIGJ1dHRvblxuICAgKiBbb3B0aW9uc10gLSBwYXNzZWQgdG8gdGhlIE5vZGVcbiAgICogKGpvaXN0LWludGVybmFsKVxuICAgKi9cbiAgY3JlYXRlT3V0T2ZEYXRlRGlhbG9nTm9kZTogZnVuY3Rpb24oIGRpYWxvZzogVXBkYXRlRGlhbG9nLCBvdXJWZXJzaW9uU3RyaW5nOiBzdHJpbmcsIGxhdGVzdFZlcnNpb25TdHJpbmc6IHN0cmluZywgb3B0aW9uczogT3B0aW9ucyApOiBOb2RlIHtcblxuICAgIGNvbnN0IGxhdGVzdFZlcnNpb25TdHJpbmdQcm9wZXJ0eSA9IG5ldyBEZXJpdmVkUHJvcGVydHkoIFsgSm9pc3RTdHJpbmdzLnVwZGF0ZXMubmV3VmVyc2lvbkF2YWlsYWJsZVN0cmluZ1Byb3BlcnR5IF0sIHN0cmluZyA9PiB7XG4gICAgICByZXR1cm4gU3RyaW5nVXRpbHMuZm9ybWF0KCBzdHJpbmcsIGxhdGVzdFZlcnNpb25TdHJpbmcgKTtcbiAgICB9ICk7XG4gICAgY29uc3Qgb3VyVmVyc2lvblN0cmluZ1Byb3BlcnR5ID0gbmV3IERlcml2ZWRQcm9wZXJ0eSggWyBKb2lzdFN0cmluZ3MudXBkYXRlcy55b3VyQ3VycmVudFZlcnNpb25TdHJpbmdQcm9wZXJ0eSBdLCBzdHJpbmcgPT4ge1xuICAgICAgcmV0dXJuIFN0cmluZ1V0aWxzLmZvcm1hdCggc3RyaW5nLCBvdXJWZXJzaW9uU3RyaW5nICk7XG4gICAgfSApO1xuXG4gICAgcmV0dXJuIG5ldyBWQm94KCBtZXJnZSgge1xuICAgICAgc3BhY2luZzogMTUsXG4gICAgICBtYXhXaWR0aDogTUFYX1dJRFRILFxuICAgICAgY2hpbGRyZW46IFtcbiAgICAgICAgbmV3IFZCb3goIHtcbiAgICAgICAgICBzcGFjaW5nOiA1LCBhbGlnbjogJ2xlZnQnLCBjaGlsZHJlbjogW1xuICAgICAgICAgICAgbmV3IFZvaWNpbmdUZXh0KCBsYXRlc3RWZXJzaW9uU3RyaW5nUHJvcGVydHksIHtcbiAgICAgICAgICAgICAgZm9udDogbmV3IFBoZXRGb250KCAxNiApLCBmb250V2VpZ2h0OiAnYm9sZCdcbiAgICAgICAgICAgIH0gKSxcbiAgICAgICAgICAgIG5ldyBWb2ljaW5nVGV4dCggb3VyVmVyc2lvblN0cmluZ1Byb3BlcnR5LCB7XG4gICAgICAgICAgICAgIGZvbnQ6IFVQREFURV9URVhUX0ZPTlRcbiAgICAgICAgICAgIH0gKVxuICAgICAgICAgIF1cbiAgICAgICAgfSApLFxuICAgICAgICBuZXcgSEJveCgge1xuICAgICAgICAgIHNwYWNpbmc6IDI1LCBjaGlsZHJlbjogW1xuICAgICAgICAgICAgbmV3IFRleHRQdXNoQnV0dG9uKCBKb2lzdFN0cmluZ3MudXBkYXRlcy5nZXRVcGRhdGVTdHJpbmdQcm9wZXJ0eSwge1xuICAgICAgICAgICAgICB2aXNpYmxlUHJvcGVydHk6IGFsbG93TGlua3NQcm9wZXJ0eSxcbiAgICAgICAgICAgICAgYmFzZUNvbG9yOiAnIzZmNicsIGZvbnQ6IFVQREFURV9URVhUX0ZPTlQsIGxpc3RlbmVyOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICBvcGVuUG9wdXAoIHVwZGF0ZUNoZWNrLnVwZGF0ZVVSTCApOyAvLyBvcGVuIGluIGEgbmV3IHdpbmRvdy90YWJcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSApLFxuICAgICAgICAgICAgbmV3IFRleHRQdXNoQnV0dG9uKCBKb2lzdFN0cmluZ3MudXBkYXRlcy5ub1RoYW5rc1N0cmluZ1Byb3BlcnR5LCB7XG4gICAgICAgICAgICAgIGJhc2VDb2xvcjogJyNkZGQnLCBmb250OiBVUERBVEVfVEVYVF9GT05ULCBsaXN0ZW5lcjogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgZGlhbG9nLmhpZGUoKTtcblxuICAgICAgICAgICAgICAgIC8vIENsb3NpbmcgdGhlIGRpYWxvZyBpcyBoYW5kbGVkIGJ5IHRoZSBEaWFsb2cgbGlzdGVuZXIgaXRzZWxmLCBubyBuZWVkIHRvIGFkZCBjb2RlIHRvIGNsb3NlIGl0IGhlcmUuXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gKVxuICAgICAgICAgIF1cbiAgICAgICAgfSApXG4gICAgICBdXG4gICAgfSwgb3B0aW9ucyApICk7XG4gIH0sXG5cbiAgLyoqXG4gICAqIFwiT2ZmbGluZVwiIHN0YXRlIG5vZGVcbiAgICogW29wdGlvbnNdIC0gcGFzc2VkIHRvIHRoZSBOb2RlXG4gICAqIChqb2lzdC1pbnRlcm5hbClcbiAgICovXG4gIGNyZWF0ZU9mZmxpbmVOb2RlOiBmdW5jdGlvbiggb3B0aW9uczogT3B0aW9ucyApOiBOb2RlIHtcbiAgICByZXR1cm4gbmV3IEhCb3goIG1lcmdlKCB7XG4gICAgICBzcGFjaW5nOiAwLFxuICAgICAgbWF4V2lkdGg6IE1BWF9XSURUSCxcbiAgICAgIGNoaWxkcmVuOiBbXG4gICAgICAgIG5ldyBWU3RydXQoIDIwICksIC8vIHNwYWNlciB0byBtYXRjaCBsYXlvdXQgb2Ygb3RoZXIgbm9kZXNcbiAgICAgICAgbmV3IFZvaWNpbmdUZXh0KCBKb2lzdFN0cmluZ3MudXBkYXRlcy5vZmZsaW5lU3RyaW5nUHJvcGVydHksIHtcbiAgICAgICAgICBmb250OiBuZXcgUGhldEZvbnQoIG9wdGlvbnMuYmlnID8gMTYgOiAxNCApLFxuICAgICAgICAgIGZvbnRXZWlnaHQ6IG9wdGlvbnMuYmlnID8gJ2JvbGQnIDogJ25vcm1hbCdcbiAgICAgICAgfSApXG4gICAgICBdXG4gICAgfSwgb3B0aW9ucyApICk7XG4gIH1cbn07XG5cbmpvaXN0LnJlZ2lzdGVyKCAnVXBkYXRlTm9kZXMnLCBVcGRhdGVOb2RlcyApO1xuXG5leHBvcnQgZGVmYXVsdCBVcGRhdGVOb2RlczsiXSwibmFtZXMiOlsiRGVyaXZlZFByb3BlcnR5IiwibWVyZ2UiLCJTdHJpbmdVdGlscyIsIlBoZXRGb250IiwiU3Bpbm5pbmdJbmRpY2F0b3JOb2RlIiwiYWxsb3dMaW5rc1Byb3BlcnR5IiwiSEJveCIsIm9wZW5Qb3B1cCIsIlBhdGgiLCJSZWN0YW5nbGUiLCJSaWNoVGV4dCIsIlZCb3giLCJWb2ljaW5nVGV4dCIsIlZTdHJ1dCIsImNoZWNrU29saWRTaGFwZSIsImV4Y2xhbWF0aW9uVHJpYW5nbGVTb2xpZFNoYXBlIiwiVGV4dFB1c2hCdXR0b24iLCJqb2lzdCIsIkpvaXN0U3RyaW5ncyIsInVwZGF0ZUNoZWNrIiwiVXBkYXRlU3RhdGUiLCJVUERBVEVfVEVYVF9GT05UIiwiTUFYX1dJRFRIIiwiVXBkYXRlTm9kZXMiLCJjcmVhdGVDaGVja2luZ05vZGUiLCJvcHRpb25zIiwic3Bpbm5pbmdJbmRpY2F0b3JOb2RlIiwiZGlhbWV0ZXIiLCJiaWciLCJjaGVja2luZ05vZGUiLCJzcGFjaW5nIiwibWF4V2lkdGgiLCJjaGlsZHJlbiIsInVwZGF0ZXMiLCJjaGVja2luZ1N0cmluZ1Byb3BlcnR5IiwiZm9udCIsImZvbnRXZWlnaHQiLCJzdGVwIiwiZHQiLCJzdGF0ZVByb3BlcnR5IiwidmFsdWUiLCJDSEVDS0lORyIsInN0ZXBMaXN0ZW5lciIsImJpbmQiLCJjcmVhdGVVcFRvRGF0ZU5vZGUiLCJmaWxsIiwic2NhbGUiLCJjZW50ZXJYIiwiY2VudGVyWSIsInVwVG9EYXRlU3RyaW5nUHJvcGVydHkiLCJjcmVhdGVPdXRPZkRhdGVBYm91dE5vZGUiLCJzdHJpbmdQcm9wZXJ0eSIsIm91dE9mRGF0ZVN0cmluZ1Byb3BlcnR5Iiwib3V0T2ZEYXRlU3RyaW5nIiwiYWxsb3dMaW5rcyIsImxpbmtzIiwidXJsIiwidXBkYXRlVVJMIiwibGlua05vZGUiLCJ0YWdOYW1lIiwiY3JlYXRlT3V0T2ZEYXRlRGlhbG9nTm9kZSIsImRpYWxvZyIsIm91clZlcnNpb25TdHJpbmciLCJsYXRlc3RWZXJzaW9uU3RyaW5nIiwibGF0ZXN0VmVyc2lvblN0cmluZ1Byb3BlcnR5IiwibmV3VmVyc2lvbkF2YWlsYWJsZVN0cmluZ1Byb3BlcnR5Iiwic3RyaW5nIiwiZm9ybWF0Iiwib3VyVmVyc2lvblN0cmluZ1Byb3BlcnR5IiwieW91ckN1cnJlbnRWZXJzaW9uU3RyaW5nUHJvcGVydHkiLCJhbGlnbiIsImdldFVwZGF0ZVN0cmluZ1Byb3BlcnR5IiwidmlzaWJsZVByb3BlcnR5IiwiYmFzZUNvbG9yIiwibGlzdGVuZXIiLCJub1RoYW5rc1N0cmluZ1Byb3BlcnR5IiwiaGlkZSIsImNyZWF0ZU9mZmxpbmVOb2RlIiwib2ZmbGluZVN0cmluZ1Byb3BlcnR5IiwicmVnaXN0ZXIiXSwibWFwcGluZ3MiOiJBQUFBLHNEQUFzRDtBQUV0RDs7O0NBR0MsR0FFRCxPQUFPQSxxQkFBcUIsbUNBQW1DO0FBQy9ELE9BQU9DLFdBQVcsOEJBQThCO0FBQ2hELE9BQU9DLGlCQUFpQiwwQ0FBMEM7QUFDbEUsT0FBT0MsY0FBYyxvQ0FBb0M7QUFDekQsT0FBT0MsMkJBQTJCLGlEQUFpRDtBQUNuRixTQUFTQyxrQkFBa0IsRUFBRUMsSUFBSSxFQUFRQyxTQUFTLEVBQUVDLElBQUksRUFBRUMsU0FBUyxFQUFFQyxRQUFRLEVBQWlCQyxJQUFJLEVBQUVDLFdBQVcsRUFBRUMsTUFBTSxRQUFRLDhCQUE4QjtBQUM3SixPQUFPQyxxQkFBcUIsbURBQW1EO0FBQy9FLE9BQU9DLG1DQUFtQyxpRUFBaUU7QUFDM0csT0FBT0Msb0JBQW9CLHlDQUF5QztBQUNwRSxPQUFPQyxXQUFXLGFBQWE7QUFDL0IsT0FBT0Msa0JBQWtCLG9CQUFvQjtBQUM3QyxPQUFPQyxpQkFBaUIsbUJBQW1CO0FBRTNDLE9BQU9DLGlCQUFpQixtQkFBbUI7QUFFM0MsWUFBWTtBQUNaLE1BQU1DLG1CQUFtQixJQUFJbEIsU0FBVTtBQUN2QyxNQUFNbUIsWUFBWSxLQUFLLDhDQUE4QztBQWlCckUsTUFBTUMsY0FBYztJQUVsQjs7Ozs7O0dBTUMs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