// Copyright 2022-2024, University of Colorado Boulder
/**
 * GameInfoDialog shows descriptions for the levels of a game.  Each description is on a separate line.
 * If the simulation supports the gameLevels query parameter (see getGameLevelsSchema.ts) the caller
 * can optionally provide options.gameLevels to control which descriptions are visible.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */ import ScreenView from '../../joist/js/ScreenView.js';
import optionize from '../../phet-core/js/optionize.js';
import PhetFont from '../../scenery-phet/js/PhetFont.js';
import { Node, RichText, VBox } from '../../scenery/js/imports.js';
import Dialog from '../../sun/js/Dialog.js';
import Tandem from '../../tandem/js/Tandem.js';
import vegas from './vegas.js';
const DEFAULT_DESCRIPTION_TEXT_FONT = new PhetFont(24);
let GameInfoDialog = class GameInfoDialog extends Dialog {
    dispose() {
        this.disposeGameInfoDialog();
        super.dispose();
    }
    /**
   * @param levelDescriptions - level descriptions, in order of ascending level number
   * @param providedOptions
   */ constructor(levelDescriptions, providedOptions){
        const options = optionize()({
            descriptionTextOptions: {
                font: DEFAULT_DESCRIPTION_TEXT_FONT
            },
            vBoxOptions: {
                align: 'left',
                spacing: 20
            },
            maxContentWidth: 0.75 * ScreenView.DEFAULT_LAYOUT_BOUNDS.width,
            tandem: Tandem.REQUIRED
        }, providedOptions);
        // Constrain the width of the title, and ensure that the title can still be used with scenery DAG feature.
        if (options.title) {
            options.title = new Node({
                children: [
                    options.title
                ],
                maxWidth: options.maxContentWidth
            });
        }
        const descriptionNodes = levelDescriptions.map((levelDescription, index)=>new RichText(levelDescription, optionize()({
                tandem: options.tandem.createTandem(`level${index}DescriptionText`)
            }, options.descriptionTextOptions)));
        // Hide descriptions for levels that are not included in options.gameLevels.
        // We must still create these Nodes so that the PhET-iO API is not changed.
        // While options.gameLevels is required, this guard is provided for .js sims that do not comply.
        if (options.gameLevels) {
            assert && assert(_.every(options.gameLevels, (gameLevel)=>Number.isInteger(gameLevel) && gameLevel > 0), 'gameLevels must be positive integers');
            descriptionNodes.forEach((node, index)=>{
                node.visible = options.gameLevels.includes(index + 1);
            });
        }
        // Vertical layout
        const content = new VBox(optionize()({
            children: descriptionNodes,
            maxWidth: options.maxContentWidth // scale all descriptions uniformly
        }, options.vBoxOptions));
        super(content, options);
        this.disposeGameInfoDialog = ()=>{
            descriptionNodes.forEach((node)=>node.dispose());
        };
    }
};
export { GameInfoDialog as default };
vegas.register('GameInfoDialog', GameInfoDialog);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3ZlZ2FzL2pzL0dhbWVJbmZvRGlhbG9nLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDIyLTIwMjQsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIEdhbWVJbmZvRGlhbG9nIHNob3dzIGRlc2NyaXB0aW9ucyBmb3IgdGhlIGxldmVscyBvZiBhIGdhbWUuICBFYWNoIGRlc2NyaXB0aW9uIGlzIG9uIGEgc2VwYXJhdGUgbGluZS5cbiAqIElmIHRoZSBzaW11bGF0aW9uIHN1cHBvcnRzIHRoZSBnYW1lTGV2ZWxzIHF1ZXJ5IHBhcmFtZXRlciAoc2VlIGdldEdhbWVMZXZlbHNTY2hlbWEudHMpIHRoZSBjYWxsZXJcbiAqIGNhbiBvcHRpb25hbGx5IHByb3ZpZGUgb3B0aW9ucy5nYW1lTGV2ZWxzIHRvIGNvbnRyb2wgd2hpY2ggZGVzY3JpcHRpb25zIGFyZSB2aXNpYmxlLlxuICpcbiAqIEBhdXRob3IgQ2hyaXMgTWFsbGV5IChQaXhlbFpvb20sIEluYy4pXG4gKi9cblxuaW1wb3J0IFRSZWFkT25seVByb3BlcnR5IGZyb20gJy4uLy4uL2F4b24vanMvVFJlYWRPbmx5UHJvcGVydHkuanMnO1xuaW1wb3J0IFNjcmVlblZpZXcgZnJvbSAnLi4vLi4vam9pc3QvanMvU2NyZWVuVmlldy5qcyc7XG5pbXBvcnQgb3B0aW9uaXplLCB7IEVtcHR5U2VsZk9wdGlvbnMgfSBmcm9tICcuLi8uLi9waGV0LWNvcmUvanMvb3B0aW9uaXplLmpzJztcbmltcG9ydCBTdHJpY3RPbWl0IGZyb20gJy4uLy4uL3BoZXQtY29yZS9qcy90eXBlcy9TdHJpY3RPbWl0LmpzJztcbmltcG9ydCBQaGV0Rm9udCBmcm9tICcuLi8uLi9zY2VuZXJ5LXBoZXQvanMvUGhldEZvbnQuanMnO1xuaW1wb3J0IHsgTm9kZSwgUmljaFRleHQsIFJpY2hUZXh0T3B0aW9ucywgVkJveCwgVkJveE9wdGlvbnMgfSBmcm9tICcuLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xuaW1wb3J0IERpYWxvZywgeyBEaWFsb2dPcHRpb25zIH0gZnJvbSAnLi4vLi4vc3VuL2pzL0RpYWxvZy5qcyc7XG5pbXBvcnQgVGFuZGVtIGZyb20gJy4uLy4uL3RhbmRlbS9qcy9UYW5kZW0uanMnO1xuaW1wb3J0IHZlZ2FzIGZyb20gJy4vdmVnYXMuanMnO1xuXG5jb25zdCBERUZBVUxUX0RFU0NSSVBUSU9OX1RFWFRfRk9OVCA9IG5ldyBQaGV0Rm9udCggMjQgKTtcblxudHlwZSBTZWxmT3B0aW9ucyA9IHtcblxuICAvLyBHYW1lIGxldmVscyB3aG9zZSBkZXNjcmlwdGlvbnMgc2hvdWxkIGJlIHZpc2libGUgaW4gdGhlIGRpYWxvZy4gTGV2ZWxzIGFyZSBudW1iZXJlZCBzdGFydGluZyBmcm9tIDEuXG4gIC8vIFNldCB0aGlzIHRvIHRoZSB2YWx1ZSBvZiB0aGUgZ2FtZUxldmVscyBxdWVyeSBwYXJhbWV0ZXIsIGEgcmVxdWlyZWQgcXVlcnkgcGFyYW1ldGVyLlxuICAvLyBTZWUgZ2V0R2FtZUxldmVsc1NjaGVtYS50cyBhbmQgZXhhbXBsZSB1c2UgaW4gV2F2ZUdhbWVJbmZvRGlhbG9nLlxuICBnYW1lTGV2ZWxzOiBudW1iZXJbXTtcblxuICAvLyBPcHRpb25zIGZvciB0aGUgZGVzY3JpcHRpb24gdGV4dCBub2Rlc1xuICBkZXNjcmlwdGlvblRleHRPcHRpb25zPzogU3RyaWN0T21pdDxSaWNoVGV4dE9wdGlvbnMsICd0YW5kZW0nPjtcblxuICAvLyBPcHRpb25zIGZvciB0aGUgbGF5b3V0IChWQm94KVxuICB2Qm94T3B0aW9ucz86IFN0cmljdE9taXQ8VkJveE9wdGlvbnMsICdjaGlsZHJlbicgfCAnbWF4V2lkdGgnPjtcblxuICAvLyBjb25zdHJhaW5zIHRoZSB3aWR0aCBvZiB0aGUgRGlhbG9nJ3MgY29udGVudCBhbmQgdGl0bGVcbiAgbWF4Q29udGVudFdpZHRoPzogbnVtYmVyO1xufTtcblxuZXhwb3J0IHR5cGUgR2FtZUluZm9EaWFsb2dPcHRpb25zID0gU2VsZk9wdGlvbnMgJiBEaWFsb2dPcHRpb25zO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBHYW1lSW5mb0RpYWxvZyBleHRlbmRzIERpYWxvZyB7XG5cbiAgcHJpdmF0ZSByZWFkb25seSBkaXNwb3NlR2FtZUluZm9EaWFsb2c6ICgpID0+IHZvaWQ7XG5cbiAgLyoqXG4gICAqIEBwYXJhbSBsZXZlbERlc2NyaXB0aW9ucyAtIGxldmVsIGRlc2NyaXB0aW9ucywgaW4gb3JkZXIgb2YgYXNjZW5kaW5nIGxldmVsIG51bWJlclxuICAgKiBAcGFyYW0gcHJvdmlkZWRPcHRpb25zXG4gICAqL1xuICBwdWJsaWMgY29uc3RydWN0b3IoIGxldmVsRGVzY3JpcHRpb25zOiAoIHN0cmluZyB8IFRSZWFkT25seVByb3BlcnR5PHN0cmluZz4gKVtdLCBwcm92aWRlZE9wdGlvbnM/OiBHYW1lSW5mb0RpYWxvZ09wdGlvbnMgKSB7XG5cbiAgICBjb25zdCBvcHRpb25zID0gb3B0aW9uaXplPEdhbWVJbmZvRGlhbG9nT3B0aW9ucywgU3RyaWN0T21pdDxTZWxmT3B0aW9ucywgJ2dhbWVMZXZlbHMnPiwgRGlhbG9nT3B0aW9ucz4oKSgge1xuICAgICAgZGVzY3JpcHRpb25UZXh0T3B0aW9uczoge1xuICAgICAgICBmb250OiBERUZBVUxUX0RFU0NSSVBUSU9OX1RFWFRfRk9OVFxuICAgICAgfSxcbiAgICAgIHZCb3hPcHRpb25zOiB7XG4gICAgICAgIGFsaWduOiAnbGVmdCcsXG4gICAgICAgIHNwYWNpbmc6IDIwXG4gICAgICB9LFxuICAgICAgbWF4Q29udGVudFdpZHRoOiAwLjc1ICogU2NyZWVuVmlldy5ERUZBVUxUX0xBWU9VVF9CT1VORFMud2lkdGgsXG4gICAgICB0YW5kZW06IFRhbmRlbS5SRVFVSVJFRFxuICAgIH0sIHByb3ZpZGVkT3B0aW9ucyApO1xuXG4gICAgLy8gQ29uc3RyYWluIHRoZSB3aWR0aCBvZiB0aGUgdGl0bGUsIGFuZCBlbnN1cmUgdGhhdCB0aGUgdGl0bGUgY2FuIHN0aWxsIGJlIHVzZWQgd2l0aCBzY2VuZXJ5IERBRyBmZWF0dXJlLlxuICAgIGlmICggb3B0aW9ucy50aXRsZSApIHtcbiAgICAgIG9wdGlvbnMudGl0bGUgPSBuZXcgTm9kZSgge1xuICAgICAgICBjaGlsZHJlbjogWyBvcHRpb25zLnRpdGxlIF0sXG4gICAgICAgIG1heFdpZHRoOiBvcHRpb25zLm1heENvbnRlbnRXaWR0aFxuICAgICAgfSApO1xuICAgIH1cblxuICAgIGNvbnN0IGRlc2NyaXB0aW9uTm9kZXMgPSBsZXZlbERlc2NyaXB0aW9ucy5tYXAoICggbGV2ZWxEZXNjcmlwdGlvbiwgaW5kZXggKSA9PlxuICAgICAgbmV3IFJpY2hUZXh0KCBsZXZlbERlc2NyaXB0aW9uLCBvcHRpb25pemU8UmljaFRleHRPcHRpb25zLCBFbXB0eVNlbGZPcHRpb25zLCBSaWNoVGV4dE9wdGlvbnM+KCkoIHtcbiAgICAgICAgdGFuZGVtOiBvcHRpb25zLnRhbmRlbS5jcmVhdGVUYW5kZW0oIGBsZXZlbCR7aW5kZXh9RGVzY3JpcHRpb25UZXh0YCApXG4gICAgICB9LCBvcHRpb25zLmRlc2NyaXB0aW9uVGV4dE9wdGlvbnMgKSApXG4gICAgKTtcblxuICAgIC8vIEhpZGUgZGVzY3JpcHRpb25zIGZvciBsZXZlbHMgdGhhdCBhcmUgbm90IGluY2x1ZGVkIGluIG9wdGlvbnMuZ2FtZUxldmVscy5cbiAgICAvLyBXZSBtdXN0IHN0aWxsIGNyZWF0ZSB0aGVzZSBOb2RlcyBzbyB0aGF0IHRoZSBQaEVULWlPIEFQSSBpcyBub3QgY2hhbmdlZC5cbiAgICAvLyBXaGlsZSBvcHRpb25zLmdhbWVMZXZlbHMgaXMgcmVxdWlyZWQsIHRoaXMgZ3VhcmQgaXMgcHJvdmlkZWQgZm9yIC5qcyBzaW1zIHRoYXQgZG8gbm90IGNvbXBseS5cbiAgICBpZiAoIG9wdGlvbnMuZ2FtZUxldmVscyApIHtcbiAgICAgIGFzc2VydCAmJiBhc3NlcnQoIF8uZXZlcnkoIG9wdGlvbnMuZ2FtZUxldmVscywgZ2FtZUxldmVsID0+ICggTnVtYmVyLmlzSW50ZWdlciggZ2FtZUxldmVsICkgJiYgZ2FtZUxldmVsID4gMCApICksXG4gICAgICAgICdnYW1lTGV2ZWxzIG11c3QgYmUgcG9zaXRpdmUgaW50ZWdlcnMnICk7XG4gICAgICBkZXNjcmlwdGlvbk5vZGVzLmZvckVhY2goICggbm9kZSwgaW5kZXggKSA9PiB7XG4gICAgICAgIG5vZGUudmlzaWJsZSA9IG9wdGlvbnMuZ2FtZUxldmVscy5pbmNsdWRlcyggaW5kZXggKyAxICk7XG4gICAgICB9ICk7XG4gICAgfVxuXG4gICAgLy8gVmVydGljYWwgbGF5b3V0XG4gICAgY29uc3QgY29udGVudCA9IG5ldyBWQm94KCBvcHRpb25pemU8VkJveE9wdGlvbnMsIEVtcHR5U2VsZk9wdGlvbnMsIFZCb3hPcHRpb25zPigpKCB7XG4gICAgICBjaGlsZHJlbjogZGVzY3JpcHRpb25Ob2RlcyxcbiAgICAgIG1heFdpZHRoOiBvcHRpb25zLm1heENvbnRlbnRXaWR0aCAvLyBzY2FsZSBhbGwgZGVzY3JpcHRpb25zIHVuaWZvcm1seVxuICAgIH0sIG9wdGlvbnMudkJveE9wdGlvbnMgKSApO1xuXG4gICAgc3VwZXIoIGNvbnRlbnQsIG9wdGlvbnMgKTtcblxuICAgIHRoaXMuZGlzcG9zZUdhbWVJbmZvRGlhbG9nID0gKCkgPT4ge1xuICAgICAgZGVzY3JpcHRpb25Ob2Rlcy5mb3JFYWNoKCBub2RlID0+IG5vZGUuZGlzcG9zZSgpICk7XG4gICAgfTtcbiAgfVxuXG4gIHB1YmxpYyBvdmVycmlkZSBkaXNwb3NlKCk6IHZvaWQge1xuICAgIHRoaXMuZGlzcG9zZUdhbWVJbmZvRGlhbG9nKCk7XG4gICAgc3VwZXIuZGlzcG9zZSgpO1xuICB9XG59XG5cbnZlZ2FzLnJlZ2lzdGVyKCAnR2FtZUluZm9EaWFsb2cnLCBHYW1lSW5mb0RpYWxvZyApOyJdLCJuYW1lcyI6WyJTY3JlZW5WaWV3Iiwib3B0aW9uaXplIiwiUGhldEZvbnQiLCJOb2RlIiwiUmljaFRleHQiLCJWQm94IiwiRGlhbG9nIiwiVGFuZGVtIiwidmVnYXMiLCJERUZBVUxUX0RFU0NSSVBUSU9OX1RFWFRfRk9OVCIsIkdhbWVJbmZvRGlhbG9nIiwiZGlzcG9zZSIsImRpc3Bvc2VHYW1lSW5mb0RpYWxvZyIsImxldmVsRGVzY3JpcHRpb25zIiwicHJvdmlkZWRPcHRpb25zIiwib3B0aW9ucyIsImRlc2NyaXB0aW9uVGV4dE9wdGlvbnMiLCJmb250IiwidkJveE9wdGlvbnMiLCJhbGlnbiIsInNwYWNpbmciLCJtYXhDb250ZW50V2lkdGgiLCJERUZBVUxUX0xBWU9VVF9CT1VORFMiLCJ3aWR0aCIsInRhbmRlbSIsIlJFUVVJUkVEIiwidGl0bGUiLCJjaGlsZHJlbiIsIm1heFdpZHRoIiwiZGVzY3JpcHRpb25Ob2RlcyIsIm1hcCIsImxldmVsRGVzY3JpcHRpb24iLCJpbmRleCIsImNyZWF0ZVRhbmRlbSIsImdhbWVMZXZlbHMiLCJhc3NlcnQiLCJfIiwiZXZlcnkiLCJnYW1lTGV2ZWwiLCJOdW1iZXIiLCJpc0ludGVnZXIiLCJmb3JFYWNoIiwibm9kZSIsInZpc2libGUiLCJpbmNsdWRlcyIsImNvbnRlbnQiLCJyZWdpc3RlciJdLCJtYXBwaW5ncyI6IkFBQUEsc0RBQXNEO0FBRXREOzs7Ozs7Q0FNQyxHQUdELE9BQU9BLGdCQUFnQiwrQkFBK0I7QUFDdEQsT0FBT0MsZUFBcUMsa0NBQWtDO0FBRTlFLE9BQU9DLGNBQWMsb0NBQW9DO0FBQ3pELFNBQVNDLElBQUksRUFBRUMsUUFBUSxFQUFtQkMsSUFBSSxRQUFxQiw4QkFBOEI7QUFDakcsT0FBT0MsWUFBK0IseUJBQXlCO0FBQy9ELE9BQU9DLFlBQVksNEJBQTRCO0FBQy9DLE9BQU9DLFdBQVcsYUFBYTtBQUUvQixNQUFNQyxnQ0FBZ0MsSUFBSVAsU0FBVTtBQXFCckMsSUFBQSxBQUFNUSxpQkFBTixNQUFNQSx1QkFBdUJKO0lBNEQxQkssVUFBZ0I7UUFDOUIsSUFBSSxDQUFDQyxxQkFBcUI7UUFDMUIsS0FBSyxDQUFDRDtJQUNSO0lBM0RBOzs7R0FHQyxHQUNELFlBQW9CRSxpQkFBMkQsRUFBRUMsZUFBdUMsQ0FBRztRQUV6SCxNQUFNQyxVQUFVZCxZQUEwRjtZQUN4R2Usd0JBQXdCO2dCQUN0QkMsTUFBTVI7WUFDUjtZQUNBUyxhQUFhO2dCQUNYQyxPQUFPO2dCQUNQQyxTQUFTO1lBQ1g7WUFDQUMsaUJBQWlCLE9BQU9yQixXQUFXc0IscUJBQXFCLENBQUNDLEtBQUs7WUFDOURDLFFBQVFqQixPQUFPa0IsUUFBUTtRQUN6QixHQUFHWDtRQUVILDBHQUEwRztRQUMxRyxJQUFLQyxRQUFRVyxLQUFLLEVBQUc7WUFDbkJYLFFBQVFXLEtBQUssR0FBRyxJQUFJdkIsS0FBTTtnQkFDeEJ3QixVQUFVO29CQUFFWixRQUFRVyxLQUFLO2lCQUFFO2dCQUMzQkUsVUFBVWIsUUFBUU0sZUFBZTtZQUNuQztRQUNGO1FBRUEsTUFBTVEsbUJBQW1CaEIsa0JBQWtCaUIsR0FBRyxDQUFFLENBQUVDLGtCQUFrQkMsUUFDbEUsSUFBSTVCLFNBQVUyQixrQkFBa0I5QixZQUFpRTtnQkFDL0Z1QixRQUFRVCxRQUFRUyxNQUFNLENBQUNTLFlBQVksQ0FBRSxDQUFDLEtBQUssRUFBRUQsTUFBTSxlQUFlLENBQUM7WUFDckUsR0FBR2pCLFFBQVFDLHNCQUFzQjtRQUduQyw0RUFBNEU7UUFDNUUsMkVBQTJFO1FBQzNFLGdHQUFnRztRQUNoRyxJQUFLRCxRQUFRbUIsVUFBVSxFQUFHO1lBQ3hCQyxVQUFVQSxPQUFRQyxFQUFFQyxLQUFLLENBQUV0QixRQUFRbUIsVUFBVSxFQUFFSSxDQUFBQSxZQUFlQyxPQUFPQyxTQUFTLENBQUVGLGNBQWVBLFlBQVksSUFDekc7WUFDRlQsaUJBQWlCWSxPQUFPLENBQUUsQ0FBRUMsTUFBTVY7Z0JBQ2hDVSxLQUFLQyxPQUFPLEdBQUc1QixRQUFRbUIsVUFBVSxDQUFDVSxRQUFRLENBQUVaLFFBQVE7WUFDdEQ7UUFDRjtRQUVBLGtCQUFrQjtRQUNsQixNQUFNYSxVQUFVLElBQUl4QyxLQUFNSixZQUF5RDtZQUNqRjBCLFVBQVVFO1lBQ1ZELFVBQVViLFFBQVFNLGVBQWUsQ0FBQyxtQ0FBbUM7UUFDdkUsR0FBR04sUUFBUUcsV0FBVztRQUV0QixLQUFLLENBQUUyQixTQUFTOUI7UUFFaEIsSUFBSSxDQUFDSCxxQkFBcUIsR0FBRztZQUMzQmlCLGlCQUFpQlksT0FBTyxDQUFFQyxDQUFBQSxPQUFRQSxLQUFLL0IsT0FBTztRQUNoRDtJQUNGO0FBTUY7QUFoRUEsU0FBcUJELDRCQWdFcEI7QUFFREYsTUFBTXNDLFFBQVEsQ0FBRSxrQkFBa0JwQyJ9