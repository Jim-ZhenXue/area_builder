// Copyright 2018-2023, University of Colorado Boulder
/**
 * InfiniteStatusBar is the status bar for games that have an infinite (open-ended) number of challenges per level.
 * See specification in https://github.com/phetsims/vegas/issues/59.
 *
 * @author Andrea Lin
 * @author Chris Malley (PixelZoom, Inc.)
 */ import optionize from '../../phet-core/js/optionize.js';
import BackButton from '../../scenery-phet/js/buttons/BackButton.js';
import StatusBar from '../../scenery-phet/js/StatusBar.js';
import { HBox } from '../../scenery/js/imports.js';
import ScoreDisplayNumberAndStar from './ScoreDisplayNumberAndStar.js';
import vegas from './vegas.js';
let InfiniteStatusBar = class InfiniteStatusBar extends StatusBar {
    dispose() {
        this.disposeInfiniteStatusBar();
        super.dispose();
    }
    /**
   * @param layoutBounds - layoutBounds of the ScreenView
   * @param visibleBoundsProperty - visible bounds of the ScreenView
   * @param messageNode - to the right of the back button, typically Text
   * @param scoreProperty
   * @param providedOptions
   */ constructor(layoutBounds, visibleBoundsProperty, messageNode, scoreProperty, providedOptions){
        var _options_tandem;
        const options = optionize()({
            // SelfOptions
            backButtonListener: _.noop,
            xMargin: 20,
            yMargin: 10,
            spacing: 10,
            createScoreDisplay: (scoreProperty)=>new ScoreDisplayNumberAndStar(scoreProperty)
        }, providedOptions);
        // button that typically takes us back to the level-selection UI
        const backButton = new BackButton({
            listener: options.backButtonListener,
            xMargin: 8,
            yMargin: 10,
            tandem: (_options_tandem = options.tandem) == null ? void 0 : _options_tandem.createTandem('backButton')
        });
        // Nodes on the left end of the bar
        const leftNodes = new HBox({
            spacing: options.spacing,
            align: 'center',
            children: [
                backButton,
                messageNode
            ],
            maxWidth: 0.7 * layoutBounds.width
        });
        // Create the score display.
        const scoreDisplay = options.createScoreDisplay(scoreProperty);
        scoreDisplay.maxWidth = 0.2 * layoutBounds.width;
        options.children = [
            leftNodes,
            scoreDisplay
        ];
        options.barHeight = Math.max(leftNodes.height, scoreDisplay.height) + 2 * options.yMargin;
        super(layoutBounds, visibleBoundsProperty, options);
        // Position components on the bar.
        this.positioningBoundsProperty.link((positioningBounds)=>{
            leftNodes.left = positioningBounds.left;
            leftNodes.centerY = positioningBounds.centerY;
            scoreDisplay.right = positioningBounds.right;
            scoreDisplay.centerY = positioningBounds.centerY;
        });
        // Keep the score right justified.
        scoreDisplay.localBoundsProperty.link(()=>{
            scoreDisplay.right = this.positioningBoundsProperty.value.right;
        });
        this.disposeInfiniteStatusBar = ()=>{
            scoreDisplay.dispose();
        };
    }
};
export { InfiniteStatusBar as default };
vegas.register('InfiniteStatusBar', InfiniteStatusBar);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3ZlZ2FzL2pzL0luZmluaXRlU3RhdHVzQmFyLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE4LTIwMjMsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIEluZmluaXRlU3RhdHVzQmFyIGlzIHRoZSBzdGF0dXMgYmFyIGZvciBnYW1lcyB0aGF0IGhhdmUgYW4gaW5maW5pdGUgKG9wZW4tZW5kZWQpIG51bWJlciBvZiBjaGFsbGVuZ2VzIHBlciBsZXZlbC5cbiAqIFNlZSBzcGVjaWZpY2F0aW9uIGluIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy92ZWdhcy9pc3N1ZXMvNTkuXG4gKlxuICogQGF1dGhvciBBbmRyZWEgTGluXG4gKiBAYXV0aG9yIENocmlzIE1hbGxleSAoUGl4ZWxab29tLCBJbmMuKVxuICovXG5cbmltcG9ydCBUUHJvcGVydHkgZnJvbSAnLi4vLi4vYXhvbi9qcy9UUHJvcGVydHkuanMnO1xuaW1wb3J0IFRSZWFkT25seVByb3BlcnR5IGZyb20gJy4uLy4uL2F4b24vanMvVFJlYWRPbmx5UHJvcGVydHkuanMnO1xuaW1wb3J0IEJvdW5kczIgZnJvbSAnLi4vLi4vZG90L2pzL0JvdW5kczIuanMnO1xuaW1wb3J0IG9wdGlvbml6ZSBmcm9tICcuLi8uLi9waGV0LWNvcmUvanMvb3B0aW9uaXplLmpzJztcbmltcG9ydCBTdHJpY3RPbWl0IGZyb20gJy4uLy4uL3BoZXQtY29yZS9qcy90eXBlcy9TdHJpY3RPbWl0LmpzJztcbmltcG9ydCBCYWNrQnV0dG9uIGZyb20gJy4uLy4uL3NjZW5lcnktcGhldC9qcy9idXR0b25zL0JhY2tCdXR0b24uanMnO1xuaW1wb3J0IFN0YXR1c0JhciwgeyBTdGF0dXNCYXJPcHRpb25zIH0gZnJvbSAnLi4vLi4vc2NlbmVyeS1waGV0L2pzL1N0YXR1c0Jhci5qcyc7XG5pbXBvcnQgeyBIQm94LCBOb2RlIH0gZnJvbSAnLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcbmltcG9ydCB7IFB1c2hCdXR0b25MaXN0ZW5lciB9IGZyb20gJy4uLy4uL3N1bi9qcy9idXR0b25zL1B1c2hCdXR0b25Nb2RlbC5qcyc7XG5pbXBvcnQgU2NvcmVEaXNwbGF5TnVtYmVyQW5kU3RhciBmcm9tICcuL1Njb3JlRGlzcGxheU51bWJlckFuZFN0YXIuanMnO1xuaW1wb3J0IHZlZ2FzIGZyb20gJy4vdmVnYXMuanMnO1xuXG50eXBlIFNlbGZPcHRpb25zID0ge1xuICBiYWNrQnV0dG9uTGlzdGVuZXI/OiBQdXNoQnV0dG9uTGlzdGVuZXI7XG4gIHhNYXJnaW4/OiBudW1iZXI7XG4gIHlNYXJnaW4/OiBudW1iZXI7XG4gIHNwYWNpbmc/OiBudW1iZXI7XG5cbiAgLy8gc2NvcmUgZGlzcGxheVxuICBjcmVhdGVTY29yZURpc3BsYXk/OiAoIHNjb3JlUHJvcGVydHk6IFRQcm9wZXJ0eTxudW1iZXI+ICkgPT4gTm9kZTtcbn07XG5cbmV4cG9ydCB0eXBlIEluZmluaXRlU3RhdHVzQmFyT3B0aW9ucyA9IFNlbGZPcHRpb25zICYgU3RyaWN0T21pdDxTdGF0dXNCYXJPcHRpb25zLCAnY2hpbGRyZW4nIHwgJ2JhckhlaWdodCc+O1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBJbmZpbml0ZVN0YXR1c0JhciBleHRlbmRzIFN0YXR1c0JhciB7XG5cbiAgcHJpdmF0ZSByZWFkb25seSBkaXNwb3NlSW5maW5pdGVTdGF0dXNCYXI6ICgpID0+IHZvaWQ7XG5cbiAgLyoqXG4gICAqIEBwYXJhbSBsYXlvdXRCb3VuZHMgLSBsYXlvdXRCb3VuZHMgb2YgdGhlIFNjcmVlblZpZXdcbiAgICogQHBhcmFtIHZpc2libGVCb3VuZHNQcm9wZXJ0eSAtIHZpc2libGUgYm91bmRzIG9mIHRoZSBTY3JlZW5WaWV3XG4gICAqIEBwYXJhbSBtZXNzYWdlTm9kZSAtIHRvIHRoZSByaWdodCBvZiB0aGUgYmFjayBidXR0b24sIHR5cGljYWxseSBUZXh0XG4gICAqIEBwYXJhbSBzY29yZVByb3BlcnR5XG4gICAqIEBwYXJhbSBwcm92aWRlZE9wdGlvbnNcbiAgICovXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggbGF5b3V0Qm91bmRzOiBCb3VuZHMyLCB2aXNpYmxlQm91bmRzUHJvcGVydHk6IFRSZWFkT25seVByb3BlcnR5PEJvdW5kczI+LCBtZXNzYWdlTm9kZTogTm9kZSxcbiAgICAgICAgICAgICAgICAgICAgICBzY29yZVByb3BlcnR5OiBUUHJvcGVydHk8bnVtYmVyPiwgcHJvdmlkZWRPcHRpb25zPzogSW5maW5pdGVTdGF0dXNCYXJPcHRpb25zICkge1xuXG4gICAgY29uc3Qgb3B0aW9ucyA9IG9wdGlvbml6ZTxJbmZpbml0ZVN0YXR1c0Jhck9wdGlvbnMsIFNlbGZPcHRpb25zLCBTdGF0dXNCYXJPcHRpb25zPigpKCB7XG5cbiAgICAgIC8vIFNlbGZPcHRpb25zXG4gICAgICBiYWNrQnV0dG9uTGlzdGVuZXI6IF8ubm9vcCxcbiAgICAgIHhNYXJnaW46IDIwLFxuICAgICAgeU1hcmdpbjogMTAsXG4gICAgICBzcGFjaW5nOiAxMCxcbiAgICAgIGNyZWF0ZVNjb3JlRGlzcGxheTogc2NvcmVQcm9wZXJ0eSA9PiBuZXcgU2NvcmVEaXNwbGF5TnVtYmVyQW5kU3Rhciggc2NvcmVQcm9wZXJ0eSApXG4gICAgfSwgcHJvdmlkZWRPcHRpb25zICk7XG5cbiAgICAvLyBidXR0b24gdGhhdCB0eXBpY2FsbHkgdGFrZXMgdXMgYmFjayB0byB0aGUgbGV2ZWwtc2VsZWN0aW9uIFVJXG4gICAgY29uc3QgYmFja0J1dHRvbiA9IG5ldyBCYWNrQnV0dG9uKCB7XG4gICAgICBsaXN0ZW5lcjogb3B0aW9ucy5iYWNrQnV0dG9uTGlzdGVuZXIsXG4gICAgICB4TWFyZ2luOiA4LFxuICAgICAgeU1hcmdpbjogMTAsXG4gICAgICB0YW5kZW06IG9wdGlvbnMudGFuZGVtPy5jcmVhdGVUYW5kZW0oICdiYWNrQnV0dG9uJyApXG4gICAgfSApO1xuXG4gICAgLy8gTm9kZXMgb24gdGhlIGxlZnQgZW5kIG9mIHRoZSBiYXJcbiAgICBjb25zdCBsZWZ0Tm9kZXMgPSBuZXcgSEJveCgge1xuICAgICAgc3BhY2luZzogb3B0aW9ucy5zcGFjaW5nLFxuICAgICAgYWxpZ246ICdjZW50ZXInLFxuICAgICAgY2hpbGRyZW46IFsgYmFja0J1dHRvbiwgbWVzc2FnZU5vZGUgXSxcbiAgICAgIG1heFdpZHRoOiAwLjcgKiBsYXlvdXRCb3VuZHMud2lkdGhcbiAgICB9ICk7XG5cbiAgICAvLyBDcmVhdGUgdGhlIHNjb3JlIGRpc3BsYXkuXG4gICAgY29uc3Qgc2NvcmVEaXNwbGF5ID0gb3B0aW9ucy5jcmVhdGVTY29yZURpc3BsYXkoIHNjb3JlUHJvcGVydHkgKTtcbiAgICBzY29yZURpc3BsYXkubWF4V2lkdGggPSAwLjIgKiBsYXlvdXRCb3VuZHMud2lkdGg7XG5cbiAgICBvcHRpb25zLmNoaWxkcmVuID0gWyBsZWZ0Tm9kZXMsIHNjb3JlRGlzcGxheSBdO1xuXG4gICAgb3B0aW9ucy5iYXJIZWlnaHQgPSBNYXRoLm1heCggbGVmdE5vZGVzLmhlaWdodCwgc2NvcmVEaXNwbGF5LmhlaWdodCApICsgKCAyICogb3B0aW9ucy55TWFyZ2luICk7XG5cbiAgICBzdXBlciggbGF5b3V0Qm91bmRzLCB2aXNpYmxlQm91bmRzUHJvcGVydHksIG9wdGlvbnMgKTtcblxuICAgIC8vIFBvc2l0aW9uIGNvbXBvbmVudHMgb24gdGhlIGJhci5cbiAgICB0aGlzLnBvc2l0aW9uaW5nQm91bmRzUHJvcGVydHkubGluayggcG9zaXRpb25pbmdCb3VuZHMgPT4ge1xuICAgICAgbGVmdE5vZGVzLmxlZnQgPSBwb3NpdGlvbmluZ0JvdW5kcy5sZWZ0O1xuICAgICAgbGVmdE5vZGVzLmNlbnRlclkgPSBwb3NpdGlvbmluZ0JvdW5kcy5jZW50ZXJZO1xuICAgICAgc2NvcmVEaXNwbGF5LnJpZ2h0ID0gcG9zaXRpb25pbmdCb3VuZHMucmlnaHQ7XG4gICAgICBzY29yZURpc3BsYXkuY2VudGVyWSA9IHBvc2l0aW9uaW5nQm91bmRzLmNlbnRlclk7XG4gICAgfSApO1xuXG4gICAgLy8gS2VlcCB0aGUgc2NvcmUgcmlnaHQganVzdGlmaWVkLlxuICAgIHNjb3JlRGlzcGxheS5sb2NhbEJvdW5kc1Byb3BlcnR5LmxpbmsoICgpID0+IHtcbiAgICAgIHNjb3JlRGlzcGxheS5yaWdodCA9IHRoaXMucG9zaXRpb25pbmdCb3VuZHNQcm9wZXJ0eS52YWx1ZS5yaWdodDtcbiAgICB9ICk7XG5cbiAgICB0aGlzLmRpc3Bvc2VJbmZpbml0ZVN0YXR1c0JhciA9ICgpID0+IHtcbiAgICAgIHNjb3JlRGlzcGxheS5kaXNwb3NlKCk7XG4gICAgfTtcbiAgfVxuXG4gIHB1YmxpYyBvdmVycmlkZSBkaXNwb3NlKCk6IHZvaWQge1xuICAgIHRoaXMuZGlzcG9zZUluZmluaXRlU3RhdHVzQmFyKCk7XG4gICAgc3VwZXIuZGlzcG9zZSgpO1xuICB9XG59XG5cbnZlZ2FzLnJlZ2lzdGVyKCAnSW5maW5pdGVTdGF0dXNCYXInLCBJbmZpbml0ZVN0YXR1c0JhciApOyJdLCJuYW1lcyI6WyJvcHRpb25pemUiLCJCYWNrQnV0dG9uIiwiU3RhdHVzQmFyIiwiSEJveCIsIlNjb3JlRGlzcGxheU51bWJlckFuZFN0YXIiLCJ2ZWdhcyIsIkluZmluaXRlU3RhdHVzQmFyIiwiZGlzcG9zZSIsImRpc3Bvc2VJbmZpbml0ZVN0YXR1c0JhciIsImxheW91dEJvdW5kcyIsInZpc2libGVCb3VuZHNQcm9wZXJ0eSIsIm1lc3NhZ2VOb2RlIiwic2NvcmVQcm9wZXJ0eSIsInByb3ZpZGVkT3B0aW9ucyIsIm9wdGlvbnMiLCJiYWNrQnV0dG9uTGlzdGVuZXIiLCJfIiwibm9vcCIsInhNYXJnaW4iLCJ5TWFyZ2luIiwic3BhY2luZyIsImNyZWF0ZVNjb3JlRGlzcGxheSIsImJhY2tCdXR0b24iLCJsaXN0ZW5lciIsInRhbmRlbSIsImNyZWF0ZVRhbmRlbSIsImxlZnROb2RlcyIsImFsaWduIiwiY2hpbGRyZW4iLCJtYXhXaWR0aCIsIndpZHRoIiwic2NvcmVEaXNwbGF5IiwiYmFySGVpZ2h0IiwiTWF0aCIsIm1heCIsImhlaWdodCIsInBvc2l0aW9uaW5nQm91bmRzUHJvcGVydHkiLCJsaW5rIiwicG9zaXRpb25pbmdCb3VuZHMiLCJsZWZ0IiwiY2VudGVyWSIsInJpZ2h0IiwibG9jYWxCb3VuZHNQcm9wZXJ0eSIsInZhbHVlIiwicmVnaXN0ZXIiXSwibWFwcGluZ3MiOiJBQUFBLHNEQUFzRDtBQUV0RDs7Ozs7O0NBTUMsR0FLRCxPQUFPQSxlQUFlLGtDQUFrQztBQUV4RCxPQUFPQyxnQkFBZ0IsOENBQThDO0FBQ3JFLE9BQU9DLGVBQXFDLHFDQUFxQztBQUNqRixTQUFTQyxJQUFJLFFBQWMsOEJBQThCO0FBRXpELE9BQU9DLCtCQUErQixpQ0FBaUM7QUFDdkUsT0FBT0MsV0FBVyxhQUFhO0FBY2hCLElBQUEsQUFBTUMsb0JBQU4sTUFBTUEsMEJBQTBCSjtJQW9FN0JLLFVBQWdCO1FBQzlCLElBQUksQ0FBQ0Msd0JBQXdCO1FBQzdCLEtBQUssQ0FBQ0Q7SUFDUjtJQW5FQTs7Ozs7O0dBTUMsR0FDRCxZQUFvQkUsWUFBcUIsRUFBRUMscUJBQWlELEVBQUVDLFdBQWlCLEVBQzNGQyxhQUFnQyxFQUFFQyxlQUEwQyxDQUFHO1lBaUJ2RkM7UUFmVixNQUFNQSxVQUFVZCxZQUFzRTtZQUVwRixjQUFjO1lBQ2RlLG9CQUFvQkMsRUFBRUMsSUFBSTtZQUMxQkMsU0FBUztZQUNUQyxTQUFTO1lBQ1RDLFNBQVM7WUFDVEMsb0JBQW9CVCxDQUFBQSxnQkFBaUIsSUFBSVIsMEJBQTJCUTtRQUN0RSxHQUFHQztRQUVILGdFQUFnRTtRQUNoRSxNQUFNUyxhQUFhLElBQUlyQixXQUFZO1lBQ2pDc0IsVUFBVVQsUUFBUUMsa0JBQWtCO1lBQ3BDRyxTQUFTO1lBQ1RDLFNBQVM7WUFDVEssTUFBTSxHQUFFVixrQkFBQUEsUUFBUVUsTUFBTSxxQkFBZFYsZ0JBQWdCVyxZQUFZLENBQUU7UUFDeEM7UUFFQSxtQ0FBbUM7UUFDbkMsTUFBTUMsWUFBWSxJQUFJdkIsS0FBTTtZQUMxQmlCLFNBQVNOLFFBQVFNLE9BQU87WUFDeEJPLE9BQU87WUFDUEMsVUFBVTtnQkFBRU47Z0JBQVlYO2FBQWE7WUFDckNrQixVQUFVLE1BQU1wQixhQUFhcUIsS0FBSztRQUNwQztRQUVBLDRCQUE0QjtRQUM1QixNQUFNQyxlQUFlakIsUUFBUU8sa0JBQWtCLENBQUVUO1FBQ2pEbUIsYUFBYUYsUUFBUSxHQUFHLE1BQU1wQixhQUFhcUIsS0FBSztRQUVoRGhCLFFBQVFjLFFBQVEsR0FBRztZQUFFRjtZQUFXSztTQUFjO1FBRTlDakIsUUFBUWtCLFNBQVMsR0FBR0MsS0FBS0MsR0FBRyxDQUFFUixVQUFVUyxNQUFNLEVBQUVKLGFBQWFJLE1BQU0sSUFBTyxJQUFJckIsUUFBUUssT0FBTztRQUU3RixLQUFLLENBQUVWLGNBQWNDLHVCQUF1Qkk7UUFFNUMsa0NBQWtDO1FBQ2xDLElBQUksQ0FBQ3NCLHlCQUF5QixDQUFDQyxJQUFJLENBQUVDLENBQUFBO1lBQ25DWixVQUFVYSxJQUFJLEdBQUdELGtCQUFrQkMsSUFBSTtZQUN2Q2IsVUFBVWMsT0FBTyxHQUFHRixrQkFBa0JFLE9BQU87WUFDN0NULGFBQWFVLEtBQUssR0FBR0gsa0JBQWtCRyxLQUFLO1lBQzVDVixhQUFhUyxPQUFPLEdBQUdGLGtCQUFrQkUsT0FBTztRQUNsRDtRQUVBLGtDQUFrQztRQUNsQ1QsYUFBYVcsbUJBQW1CLENBQUNMLElBQUksQ0FBRTtZQUNyQ04sYUFBYVUsS0FBSyxHQUFHLElBQUksQ0FBQ0wseUJBQXlCLENBQUNPLEtBQUssQ0FBQ0YsS0FBSztRQUNqRTtRQUVBLElBQUksQ0FBQ2pDLHdCQUF3QixHQUFHO1lBQzlCdUIsYUFBYXhCLE9BQU87UUFDdEI7SUFDRjtBQU1GO0FBeEVBLFNBQXFCRCwrQkF3RXBCO0FBRURELE1BQU11QyxRQUFRLENBQUUscUJBQXFCdEMifQ==