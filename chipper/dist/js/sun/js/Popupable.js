// Copyright 2022-2024, University of Colorado Boulder
/**
 * Popupable trait
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Andrea Lin (PhET Interactive Simulations)
 * @author Chris Malley (PixelZoom, Inc.)
 */ import BooleanProperty from '../../axon/js/BooleanProperty.js';
import ScreenView from '../../joist/js/ScreenView.js';
import gracefulBind from '../../phet-core/js/gracefulBind.js';
import optionize from '../../phet-core/js/optionize.js';
import { FocusManager, Node } from '../../scenery/js/imports.js';
import sun from './sun.js';
const Popupable = (Type, optionsArgPosition)=>{
    return class extends Type {
        layout(bounds) {
            if (this.layoutBounds) {
                this.popupParent.matrix = ScreenView.getLayoutMatrix(this.layoutBounds, bounds);
            }
        }
        // Provide a chance of not showing, see disableModals
        // @mixin-protected - made public for use in the mixin only
        shouldShowPopup() {
            const optOut = this.isModal && this.disableModals;
            return !optOut;
        }
        show() {
            if (!this.shouldShowPopup()) {
                return;
            }
            // save a reference before setting isShowingProperty because listeners on the isShowingProperty may modify or
            // clear focus from FocusManager.pdomFocusedNode.
            this._nodeToFocusOnHide = this._focusOnHideNode || FocusManager.pdomFocusedNode;
            this.isShowingProperty.value = true;
            // after it is shown, move focus to the focusOnShownNode, presumably moving focus into the Popupable content
            if (this._focusOnShowNode && this._focusOnShowNode.focusable) {
                this._focusOnShowNode.focus();
            }
        }
        /**
     * Hide the popup. If you create a new popup next time you show(), be sure to dispose this popup instead.
     */ hide() {
            this.interruptSubtreeInput();
            this.isShowingProperty.value = false;
            // return focus to the Node that had focus when the Popupable was opened (or the focusOnHideNode if provided)
            if (this._nodeToFocusOnHide && this._nodeToFocusOnHide.focusable) {
                this._nodeToFocusOnHide.focus();
            }
        }
        // @mixin-protected - made public for use in the mixin only
        get focusOnHideNode() {
            return this._focusOnHideNode;
        }
        /**
     * Releases references
     */ dispose() {
            this.hide();
            this.isShowingProperty.dispose();
            super.dispose();
        }
        // Support the same signature as the type we mix into.  However, we also have our own options, which we assume
        // are passed in the last arg.
        // TODO - We're trying not to use "any", so how can we specify the types more specifically?  See https://github.com/phetsims/sun/issues/777.
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        constructor(...args){
            var _options_tandem;
            super(...args);
            const providedOptions = args[optionsArgPosition] || {};
            // `config` is required for Popupable, to work well with ...args but all fields of the config are optional
            const requiredConfig = args[args.length - 1];
            assert && assert(requiredConfig !== undefined, 'config object is required for Popupable.');
            const showPopup = gracefulBind('phet.joist.sim.showPopup');
            const hidePopup = gracefulBind('phet.joist.sim.hidePopup');
            const options = optionize()({
                showPopup: showPopup,
                hidePopup: hidePopup,
                isModal: true,
                layoutBounds: null,
                focusOnShowNode: null,
                focusOnHideNode: null,
                disableModals: _.get(window, 'phet.chipper.queryParameters.disableModals') || false
            }, providedOptions);
            // see https://github.com/phetsims/joist/issues/293
            assert && assert(options.isModal, 'Non-modal popups not currently supported');
            this.layoutBounds = options.layoutBounds;
            this._focusOnShowNode = options.focusOnShowNode;
            this.disableModals = options.disableModals;
            this.isModal = options.isModal;
            this._focusOnHideNode = options.focusOnHideNode;
            this._nodeToFocusOnHide = null;
            this.popupParent = new PopupParentNode(this, {
                show: this.show.bind(this),
                hide: this.hide.bind(this),
                layout: this.layout.bind(this)
            });
            this.isShowingProperty = new BooleanProperty(false, {
                tandem: (_options_tandem = options.tandem) == null ? void 0 : _options_tandem.createTandem('isShowingProperty'),
                phetioReadOnly: true,
                phetioFeatured: true
            });
            this.isShowingProperty.lazyLink((isShowing)=>{
                if (isShowing) {
                    options.showPopup(this.popupParent, options.isModal);
                } else {
                    options.hidePopup(this.popupParent, options.isModal);
                }
            });
        }
    };
};
let PopupParentNode = class PopupParentNode extends Node {
    constructor(popupableNode, providedOptions){
        const options = optionize()({
            children: [
                popupableNode
            ]
        }, providedOptions);
        super(options);
        this.show = options.show;
        this.hide = options.hide;
        this.layout = options.layout;
    }
};
sun.register('Popupable', Popupable);
export default Popupable;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3N1bi9qcy9Qb3B1cGFibGUudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjItMjAyNCwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbi8qKlxuICogUG9wdXBhYmxlIHRyYWl0XG4gKlxuICogQGF1dGhvciBKb25hdGhhbiBPbHNvbiA8am9uYXRoYW4ub2xzb25AY29sb3JhZG8uZWR1PlxuICogQGF1dGhvciBTYW0gUmVpZCAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcbiAqIEBhdXRob3IgQW5kcmVhIExpbiAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcbiAqIEBhdXRob3IgQ2hyaXMgTWFsbGV5IChQaXhlbFpvb20sIEluYy4pXG4gKi9cblxuaW1wb3J0IEJvb2xlYW5Qcm9wZXJ0eSBmcm9tICcuLi8uLi9heG9uL2pzL0Jvb2xlYW5Qcm9wZXJ0eS5qcyc7XG5pbXBvcnQgUHJvcGVydHkgZnJvbSAnLi4vLi4vYXhvbi9qcy9Qcm9wZXJ0eS5qcyc7XG5pbXBvcnQgQm91bmRzMiBmcm9tICcuLi8uLi9kb3QvanMvQm91bmRzMi5qcyc7XG5pbXBvcnQgU2NyZWVuVmlldyBmcm9tICcuLi8uLi9qb2lzdC9qcy9TY3JlZW5WaWV3LmpzJztcbmltcG9ydCBncmFjZWZ1bEJpbmQgZnJvbSAnLi4vLi4vcGhldC1jb3JlL2pzL2dyYWNlZnVsQmluZC5qcyc7XG5pbXBvcnQgb3B0aW9uaXplIGZyb20gJy4uLy4uL3BoZXQtY29yZS9qcy9vcHRpb25pemUuanMnO1xuaW1wb3J0IENvbnN0cnVjdG9yIGZyb20gJy4uLy4uL3BoZXQtY29yZS9qcy90eXBlcy9Db25zdHJ1Y3Rvci5qcyc7XG5pbXBvcnQgUGlja09wdGlvbmFsIGZyb20gJy4uLy4uL3BoZXQtY29yZS9qcy90eXBlcy9QaWNrT3B0aW9uYWwuanMnO1xuaW1wb3J0IHsgRm9jdXNNYW5hZ2VyLCBOb2RlLCBOb2RlT3B0aW9ucyB9IGZyb20gJy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XG5pbXBvcnQgc3VuIGZyb20gJy4vc3VuLmpzJztcblxudHlwZSBTZWxmT3B0aW9ucyA9IHtcblxuICAvLyBEb24ndCB1c2UgUG9wdXBhYmxlTm9kZSBoZXJlIChpdCBjcmVhdGVzLi4uIGEgbG90IG9mIHR5cGUgaXNzdWVzIGFuZCBjaXJjdWxhcml0eSlcbiAgc2hvd1BvcHVwPzogKCBwb3B1cDogTm9kZSwgaXNNb2RhbDogYm9vbGVhbiApID0+IHZvaWQ7XG4gIGhpZGVQb3B1cD86ICggcG9wdXA6IE5vZGUsIGlzTW9kYWw6IGJvb2xlYW4gKSA9PiB2b2lkO1xuXG4gIC8vIG1vZGFsIHBvcHVwcyBwcmV2ZW50IGludGVyYWN0aW9uIHdpdGggdGhlIHJlc3Qgb2YgdGhlIHNpbSB3aGlsZSBvcGVuXG4gIGlzTW9kYWw/OiBib29sZWFuO1xuXG4gIC8vIElmIGRlc2lyZWQsIHRoZSBsYXlvdXRCb3VuZHMgdGhhdCBzaG91bGQgYmUgdXNlZCBmb3IgbGF5b3V0XG4gIGxheW91dEJvdW5kcz86IEJvdW5kczIgfCBudWxsO1xuXG4gIC8vIFRoZSBOb2RlIHRoYXQgcmVjZWl2ZXMgZm9jdXMgd2hlbiB0aGUgUG9wdXBhYmxlIGlzIHNob3duLiBJZiBudWxsLCBmb2N1cyBpcyBub3Qgc2V0LlxuICBmb2N1c09uU2hvd05vZGU/OiBOb2RlIHwgbnVsbDtcblxuICAvLyBUaGUgTm9kZSB0aGF0IHJlY2VpdmVzIGZvY3VzIHdoZW4gdGhlIFBvcHVwYWJsZSBpcyBjbG9zZWQuIElmIG51bGwsIGZvY3VzIHdpbGwgcmV0dXJuXG4gIC8vIHRvIHRoZSBOb2RlIHRoYXQgaGFkIGZvY3VzIHdoZW4gdGhlIERpYWxvZyBvcGVuZWQuXG4gIGZvY3VzT25IaWRlTm9kZT86IE5vZGUgfCBudWxsO1xuXG4gIC8vIFdoZW4gdHJ1ZSwgbm8gbW9kYWwgc2hvdy9oaWRlIGZlYXR1cmUgd2lsbCBiZSBzdXBwb3J0ZWQuIFRoaXMgaXMgYSB3YXkgb2Ygb3B0aW5nIG91dCBvZiB0aGUgUG9wdXBhYmxlIGZlYXR1cmVcbiAgLy8gYWx0b2dldGhlciBmb3IgdGhpcyBydW50aW1lLlxuICBkaXNhYmxlTW9kYWxzPzogYm9vbGVhbjtcbn07XG50eXBlIFBhcmVudE9wdGlvbnMgPSBQaWNrT3B0aW9uYWw8Tm9kZU9wdGlvbnMsICd0YW5kZW0nPjtcbmV4cG9ydCB0eXBlIFBvcHVwYWJsZU9wdGlvbnMgPSBTZWxmT3B0aW9ucyAmIFBhcmVudE9wdGlvbnM7XG5cbnR5cGUgVFBvcHVwYWJsZSA9IHtcbiAgcmVhZG9ubHkgbGF5b3V0Qm91bmRzOiBCb3VuZHMyIHwgbnVsbDtcbiAgcmVhZG9ubHkgcG9wdXBQYXJlbnQ6IE5vZGU7XG4gIHJlYWRvbmx5IGlzU2hvd2luZ1Byb3BlcnR5OiBQcm9wZXJ0eTxib29sZWFuPjtcbiAgbGF5b3V0KCBib3VuZHM6IEJvdW5kczIgKTogdm9pZDtcblxuICAvLyBAbWl4aW4tcHJvdGVjdGVkIC0gbWFkZSBwdWJsaWMgZm9yIHVzZSBpbiB0aGUgbWl4aW4gb25seVxuICBzaG91bGRTaG93UG9wdXAoKTogYm9vbGVhbjtcblxuICBzaG93KCk6IHZvaWQ7XG4gIGhpZGUoKTogdm9pZDtcblxuICAvLyBAbWl4aW4tcHJvdGVjdGVkIC0gbWFkZSBwdWJsaWMgZm9yIHVzZSBpbiB0aGUgbWl4aW4gb25seVxuICBnZXQgZm9jdXNPbkhpZGVOb2RlKCk6IE5vZGUgfCBudWxsO1xufTtcblxuY29uc3QgUG9wdXBhYmxlID0gPFN1cGVyVHlwZSBleHRlbmRzIENvbnN0cnVjdG9yPE5vZGU+PiggVHlwZTogU3VwZXJUeXBlLCBvcHRpb25zQXJnUG9zaXRpb246IG51bWJlciApOiBTdXBlclR5cGUgJiBDb25zdHJ1Y3RvcjxUUG9wdXBhYmxlPiA9PiB7XG5cbiAgcmV0dXJuIGNsYXNzIGV4dGVuZHMgVHlwZSBpbXBsZW1lbnRzIFRQb3B1cGFibGUge1xuXG4gICAgcHVibGljIHJlYWRvbmx5IGxheW91dEJvdW5kczogQm91bmRzMiB8IG51bGw7XG5cbiAgICBwcml2YXRlIHJlYWRvbmx5IF9mb2N1c09uU2hvd05vZGU6IE5vZGUgfCBudWxsO1xuICAgIHByaXZhdGUgcmVhZG9ubHkgX2ZvY3VzT25IaWRlTm9kZTogTm9kZSB8IG51bGw7XG5cbiAgICAvLyBUaGUgTm9kZSB0byByZXR1cm4gZm9jdXMgdG8gYWZ0ZXIgdGhlIFBvcHVwYWJsZSBoYXMgYmVlbiBoaWRkZW4uIEEgcmVmZXJlbmNlIHRvIHRoaXMgTm9kZSBpcyBzYXZlZCB3aGVuXG4gICAgLy8gdGhlIFBvcHVwYWJsZSBpcyBzaG93bi4gQnkgZGVmYXVsdCwgZm9jdXMgaXMgcmV0dXJuZWQgdG8gTm9kZSB0aGF0IGhhcyBmb2N1cyB3aGVuIHRoZSBQb3B1cGFibGUgaXMgb3BlblxuICAgIC8vIGJ1dCBjYW4gYmUgb3ZlcnJpZGRlbiB3aXRoIGBvcHRpb25zLmZvY3VzT25IaWRlTm9kZWAuXG4gICAgcHJpdmF0ZSBfbm9kZVRvRm9jdXNPbkhpZGU6IE5vZGUgfCBudWxsO1xuXG4gICAgLy8gVGhlIG5vZGUgcHJvdmlkZWQgdG8gc2hvd1BvcHVwLCB3aXRoIHRoZSB0cmFuc2Zvcm0gYXBwbGllZFxuICAgIHB1YmxpYyByZWFkb25seSBwb3B1cFBhcmVudDogTm9kZTtcblxuICAgIHByaXZhdGUgcmVhZG9ubHkgZGlzYWJsZU1vZGFsczogYm9vbGVhbjtcbiAgICBwcml2YXRlIHJlYWRvbmx5IGlzTW9kYWw6IGJvb2xlYW47XG5cbiAgICAvLyBXaGV0aGVyIHRoZSBwb3B1cCBpcyBiZWluZyBzaG93blxuICAgIHB1YmxpYyByZWFkb25seSBpc1Nob3dpbmdQcm9wZXJ0eTogUHJvcGVydHk8Ym9vbGVhbj47XG5cbiAgICAvLyBTdXBwb3J0IHRoZSBzYW1lIHNpZ25hdHVyZSBhcyB0aGUgdHlwZSB3ZSBtaXggaW50by4gIEhvd2V2ZXIsIHdlIGFsc28gaGF2ZSBvdXIgb3duIG9wdGlvbnMsIHdoaWNoIHdlIGFzc3VtZVxuICAgIC8vIGFyZSBwYXNzZWQgaW4gdGhlIGxhc3QgYXJnLlxuICAgIC8vIFRPRE8gLSBXZSdyZSB0cnlpbmcgbm90IHRvIHVzZSBcImFueVwiLCBzbyBob3cgY2FuIHdlIHNwZWNpZnkgdGhlIHR5cGVzIG1vcmUgc3BlY2lmaWNhbGx5PyAgU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9zdW4vaXNzdWVzLzc3Ny5cbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLWV4cGxpY2l0LWFueVxuICAgIHB1YmxpYyBjb25zdHJ1Y3RvciggLi4uYXJnczogYW55W10gKSB7XG4gICAgICBzdXBlciggLi4uYXJncyApO1xuXG4gICAgICBjb25zdCBwcm92aWRlZE9wdGlvbnMgPSAoIGFyZ3NbIG9wdGlvbnNBcmdQb3NpdGlvbiBdIHx8IHt9ICkgYXMgUG9wdXBhYmxlT3B0aW9ucztcblxuICAgICAgLy8gYGNvbmZpZ2AgaXMgcmVxdWlyZWQgZm9yIFBvcHVwYWJsZSwgdG8gd29yayB3ZWxsIHdpdGggLi4uYXJncyBidXQgYWxsIGZpZWxkcyBvZiB0aGUgY29uZmlnIGFyZSBvcHRpb25hbFxuICAgICAgY29uc3QgcmVxdWlyZWRDb25maWcgPSBhcmdzWyBhcmdzLmxlbmd0aCAtIDEgXTtcbiAgICAgIGFzc2VydCAmJiBhc3NlcnQoIHJlcXVpcmVkQ29uZmlnICE9PSB1bmRlZmluZWQsICdjb25maWcgb2JqZWN0IGlzIHJlcXVpcmVkIGZvciBQb3B1cGFibGUuJyApO1xuXG4gICAgICBjb25zdCBzaG93UG9wdXAgPSBncmFjZWZ1bEJpbmQoICdwaGV0LmpvaXN0LnNpbS5zaG93UG9wdXAnICkgYXMgRXhjbHVkZTxQb3B1cGFibGVPcHRpb25zWyAnc2hvd1BvcHVwJyBdLCB1bmRlZmluZWQ+O1xuICAgICAgY29uc3QgaGlkZVBvcHVwID0gZ3JhY2VmdWxCaW5kKCAncGhldC5qb2lzdC5zaW0uaGlkZVBvcHVwJyApIGFzIEV4Y2x1ZGU8UG9wdXBhYmxlT3B0aW9uc1sgJ2hpZGVQb3B1cCcgXSwgdW5kZWZpbmVkPjtcblxuICAgICAgY29uc3Qgb3B0aW9ucyA9IG9wdGlvbml6ZTxQb3B1cGFibGVPcHRpb25zLCBTZWxmT3B0aW9ucywgUGFyZW50T3B0aW9ucz4oKSgge1xuICAgICAgICBzaG93UG9wdXA6IHNob3dQb3B1cCxcbiAgICAgICAgaGlkZVBvcHVwOiBoaWRlUG9wdXAsXG4gICAgICAgIGlzTW9kYWw6IHRydWUsXG4gICAgICAgIGxheW91dEJvdW5kczogbnVsbCxcbiAgICAgICAgZm9jdXNPblNob3dOb2RlOiBudWxsLFxuICAgICAgICBmb2N1c09uSGlkZU5vZGU6IG51bGwsXG4gICAgICAgIGRpc2FibGVNb2RhbHM6IF8uZ2V0KCB3aW5kb3csICdwaGV0LmNoaXBwZXIucXVlcnlQYXJhbWV0ZXJzLmRpc2FibGVNb2RhbHMnICkgfHwgZmFsc2VcbiAgICAgIH0sIHByb3ZpZGVkT3B0aW9ucyApO1xuXG4gICAgICAvLyBzZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2pvaXN0L2lzc3Vlcy8yOTNcbiAgICAgIGFzc2VydCAmJiBhc3NlcnQoIG9wdGlvbnMuaXNNb2RhbCwgJ05vbi1tb2RhbCBwb3B1cHMgbm90IGN1cnJlbnRseSBzdXBwb3J0ZWQnICk7XG5cbiAgICAgIHRoaXMubGF5b3V0Qm91bmRzID0gb3B0aW9ucy5sYXlvdXRCb3VuZHM7XG4gICAgICB0aGlzLl9mb2N1c09uU2hvd05vZGUgPSBvcHRpb25zLmZvY3VzT25TaG93Tm9kZTtcbiAgICAgIHRoaXMuZGlzYWJsZU1vZGFscyA9IG9wdGlvbnMuZGlzYWJsZU1vZGFscztcbiAgICAgIHRoaXMuaXNNb2RhbCA9IG9wdGlvbnMuaXNNb2RhbDtcbiAgICAgIHRoaXMuX2ZvY3VzT25IaWRlTm9kZSA9IG9wdGlvbnMuZm9jdXNPbkhpZGVOb2RlO1xuICAgICAgdGhpcy5fbm9kZVRvRm9jdXNPbkhpZGUgPSBudWxsO1xuICAgICAgdGhpcy5wb3B1cFBhcmVudCA9IG5ldyBQb3B1cFBhcmVudE5vZGUoIHRoaXMsIHtcbiAgICAgICAgc2hvdzogdGhpcy5zaG93LmJpbmQoIHRoaXMgKSxcbiAgICAgICAgaGlkZTogdGhpcy5oaWRlLmJpbmQoIHRoaXMgKSxcbiAgICAgICAgbGF5b3V0OiB0aGlzLmxheW91dC5iaW5kKCB0aGlzIClcbiAgICAgIH0gKTtcblxuICAgICAgdGhpcy5pc1Nob3dpbmdQcm9wZXJ0eSA9IG5ldyBCb29sZWFuUHJvcGVydHkoIGZhbHNlLCB7XG4gICAgICAgIHRhbmRlbTogb3B0aW9ucy50YW5kZW0/LmNyZWF0ZVRhbmRlbSggJ2lzU2hvd2luZ1Byb3BlcnR5JyApLFxuICAgICAgICBwaGV0aW9SZWFkT25seTogdHJ1ZSxcbiAgICAgICAgcGhldGlvRmVhdHVyZWQ6IHRydWVcbiAgICAgIH0gKTtcblxuICAgICAgdGhpcy5pc1Nob3dpbmdQcm9wZXJ0eS5sYXp5TGluayggaXNTaG93aW5nID0+IHtcbiAgICAgICAgaWYgKCBpc1Nob3dpbmcgKSB7XG4gICAgICAgICAgb3B0aW9ucy5zaG93UG9wdXAoIHRoaXMucG9wdXBQYXJlbnQsIG9wdGlvbnMuaXNNb2RhbCApO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgIG9wdGlvbnMuaGlkZVBvcHVwKCB0aGlzLnBvcHVwUGFyZW50LCBvcHRpb25zLmlzTW9kYWwgKTtcbiAgICAgICAgfVxuICAgICAgfSApO1xuICAgIH1cblxuICAgIHB1YmxpYyBsYXlvdXQoIGJvdW5kczogQm91bmRzMiApOiB2b2lkIHtcbiAgICAgIGlmICggdGhpcy5sYXlvdXRCb3VuZHMgKSB7XG4gICAgICAgIHRoaXMucG9wdXBQYXJlbnQubWF0cml4ID0gU2NyZWVuVmlldy5nZXRMYXlvdXRNYXRyaXgoIHRoaXMubGF5b3V0Qm91bmRzLCBib3VuZHMgKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBQcm92aWRlIGEgY2hhbmNlIG9mIG5vdCBzaG93aW5nLCBzZWUgZGlzYWJsZU1vZGFsc1xuICAgIC8vIEBtaXhpbi1wcm90ZWN0ZWQgLSBtYWRlIHB1YmxpYyBmb3IgdXNlIGluIHRoZSBtaXhpbiBvbmx5XG4gICAgcHVibGljIHNob3VsZFNob3dQb3B1cCgpOiBib29sZWFuIHtcbiAgICAgIGNvbnN0IG9wdE91dCA9IHRoaXMuaXNNb2RhbCAmJiB0aGlzLmRpc2FibGVNb2RhbHM7XG4gICAgICByZXR1cm4gIW9wdE91dDtcbiAgICB9XG5cbiAgICBwdWJsaWMgc2hvdygpOiB2b2lkIHtcbiAgICAgIGlmICggIXRoaXMuc2hvdWxkU2hvd1BvcHVwKCkgKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgLy8gc2F2ZSBhIHJlZmVyZW5jZSBiZWZvcmUgc2V0dGluZyBpc1Nob3dpbmdQcm9wZXJ0eSBiZWNhdXNlIGxpc3RlbmVycyBvbiB0aGUgaXNTaG93aW5nUHJvcGVydHkgbWF5IG1vZGlmeSBvclxuICAgICAgLy8gY2xlYXIgZm9jdXMgZnJvbSBGb2N1c01hbmFnZXIucGRvbUZvY3VzZWROb2RlLlxuICAgICAgdGhpcy5fbm9kZVRvRm9jdXNPbkhpZGUgPSB0aGlzLl9mb2N1c09uSGlkZU5vZGUgfHwgRm9jdXNNYW5hZ2VyLnBkb21Gb2N1c2VkTm9kZTtcbiAgICAgIHRoaXMuaXNTaG93aW5nUHJvcGVydHkudmFsdWUgPSB0cnVlO1xuXG4gICAgICAvLyBhZnRlciBpdCBpcyBzaG93biwgbW92ZSBmb2N1cyB0byB0aGUgZm9jdXNPblNob3duTm9kZSwgcHJlc3VtYWJseSBtb3ZpbmcgZm9jdXMgaW50byB0aGUgUG9wdXBhYmxlIGNvbnRlbnRcbiAgICAgIGlmICggdGhpcy5fZm9jdXNPblNob3dOb2RlICYmIHRoaXMuX2ZvY3VzT25TaG93Tm9kZS5mb2N1c2FibGUgKSB7XG4gICAgICAgIHRoaXMuX2ZvY3VzT25TaG93Tm9kZS5mb2N1cygpO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEhpZGUgdGhlIHBvcHVwLiBJZiB5b3UgY3JlYXRlIGEgbmV3IHBvcHVwIG5leHQgdGltZSB5b3Ugc2hvdygpLCBiZSBzdXJlIHRvIGRpc3Bvc2UgdGhpcyBwb3B1cCBpbnN0ZWFkLlxuICAgICAqL1xuICAgIHB1YmxpYyBoaWRlKCk6IHZvaWQge1xuICAgICAgdGhpcy5pbnRlcnJ1cHRTdWJ0cmVlSW5wdXQoKTtcblxuICAgICAgdGhpcy5pc1Nob3dpbmdQcm9wZXJ0eS52YWx1ZSA9IGZhbHNlO1xuXG4gICAgICAvLyByZXR1cm4gZm9jdXMgdG8gdGhlIE5vZGUgdGhhdCBoYWQgZm9jdXMgd2hlbiB0aGUgUG9wdXBhYmxlIHdhcyBvcGVuZWQgKG9yIHRoZSBmb2N1c09uSGlkZU5vZGUgaWYgcHJvdmlkZWQpXG4gICAgICBpZiAoIHRoaXMuX25vZGVUb0ZvY3VzT25IaWRlICYmIHRoaXMuX25vZGVUb0ZvY3VzT25IaWRlLmZvY3VzYWJsZSApIHtcbiAgICAgICAgdGhpcy5fbm9kZVRvRm9jdXNPbkhpZGUuZm9jdXMoKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBAbWl4aW4tcHJvdGVjdGVkIC0gbWFkZSBwdWJsaWMgZm9yIHVzZSBpbiB0aGUgbWl4aW4gb25seVxuICAgIHB1YmxpYyBnZXQgZm9jdXNPbkhpZGVOb2RlKCk6IE5vZGUgfCBudWxsIHtcbiAgICAgIHJldHVybiB0aGlzLl9mb2N1c09uSGlkZU5vZGU7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmVsZWFzZXMgcmVmZXJlbmNlc1xuICAgICAqL1xuICAgIHB1YmxpYyBvdmVycmlkZSBkaXNwb3NlKCk6IHZvaWQge1xuICAgICAgdGhpcy5oaWRlKCk7XG5cbiAgICAgIHRoaXMuaXNTaG93aW5nUHJvcGVydHkuZGlzcG9zZSgpO1xuXG4gICAgICBzdXBlci5kaXNwb3NlKCk7XG4gICAgfVxuICB9O1xufTtcblxudHlwZSBQb3B1cGFibGVQYXJlbnROb2RlU2VsZk9wdGlvbnMgPSB7XG4gIHNob3c6ICgpID0+IHZvaWQ7XG4gIGhpZGU6ICgpID0+IHZvaWQ7XG4gIGxheW91dDogKCBib3VuZHM6IEJvdW5kczIgKSA9PiB2b2lkO1xufTtcbnR5cGUgUG9wdXBhYmxlUGFyZW50Tm9kZU9wdGlvbnMgPSBQb3B1cGFibGVQYXJlbnROb2RlU2VsZk9wdGlvbnMgJiBOb2RlT3B0aW9ucztcblxuY2xhc3MgUG9wdXBQYXJlbnROb2RlIGV4dGVuZHMgTm9kZSB7XG5cbiAgcHVibGljIHJlYWRvbmx5IHNob3c6IFBvcHVwYWJsZVBhcmVudE5vZGVTZWxmT3B0aW9uc1sgJ3Nob3cnIF07XG4gIHB1YmxpYyByZWFkb25seSBoaWRlOiBQb3B1cGFibGVQYXJlbnROb2RlU2VsZk9wdGlvbnNbICdoaWRlJyBdO1xuICBwdWJsaWMgcmVhZG9ubHkgbGF5b3V0OiBQb3B1cGFibGVQYXJlbnROb2RlU2VsZk9wdGlvbnNbICdsYXlvdXQnIF07XG5cbiAgcHVibGljIGNvbnN0cnVjdG9yKCBwb3B1cGFibGVOb2RlOiBOb2RlLCBwcm92aWRlZE9wdGlvbnM6IFBvcHVwYWJsZVBhcmVudE5vZGVPcHRpb25zICkge1xuXG4gICAgY29uc3Qgb3B0aW9ucyA9IG9wdGlvbml6ZTxQb3B1cGFibGVQYXJlbnROb2RlT3B0aW9ucywgUG9wdXBhYmxlUGFyZW50Tm9kZVNlbGZPcHRpb25zLCBOb2RlT3B0aW9ucz4oKSgge1xuICAgICAgY2hpbGRyZW46IFsgcG9wdXBhYmxlTm9kZSBdXG4gICAgfSwgcHJvdmlkZWRPcHRpb25zICk7XG5cbiAgICBzdXBlciggb3B0aW9ucyApO1xuXG4gICAgdGhpcy5zaG93ID0gb3B0aW9ucy5zaG93O1xuICAgIHRoaXMuaGlkZSA9IG9wdGlvbnMuaGlkZTtcbiAgICB0aGlzLmxheW91dCA9IG9wdGlvbnMubGF5b3V0O1xuICB9XG59XG5cbmV4cG9ydCB0eXBlIFBvcHVwYWJsZU5vZGUgPSBOb2RlICYgVFBvcHVwYWJsZTtcblxuc3VuLnJlZ2lzdGVyKCAnUG9wdXBhYmxlJywgUG9wdXBhYmxlICk7XG5cbmV4cG9ydCBkZWZhdWx0IFBvcHVwYWJsZTsiXSwibmFtZXMiOlsiQm9vbGVhblByb3BlcnR5IiwiU2NyZWVuVmlldyIsImdyYWNlZnVsQmluZCIsIm9wdGlvbml6ZSIsIkZvY3VzTWFuYWdlciIsIk5vZGUiLCJzdW4iLCJQb3B1cGFibGUiLCJUeXBlIiwib3B0aW9uc0FyZ1Bvc2l0aW9uIiwibGF5b3V0IiwiYm91bmRzIiwibGF5b3V0Qm91bmRzIiwicG9wdXBQYXJlbnQiLCJtYXRyaXgiLCJnZXRMYXlvdXRNYXRyaXgiLCJzaG91bGRTaG93UG9wdXAiLCJvcHRPdXQiLCJpc01vZGFsIiwiZGlzYWJsZU1vZGFscyIsInNob3ciLCJfbm9kZVRvRm9jdXNPbkhpZGUiLCJfZm9jdXNPbkhpZGVOb2RlIiwicGRvbUZvY3VzZWROb2RlIiwiaXNTaG93aW5nUHJvcGVydHkiLCJ2YWx1ZSIsIl9mb2N1c09uU2hvd05vZGUiLCJmb2N1c2FibGUiLCJmb2N1cyIsImhpZGUiLCJpbnRlcnJ1cHRTdWJ0cmVlSW5wdXQiLCJmb2N1c09uSGlkZU5vZGUiLCJkaXNwb3NlIiwiYXJncyIsIm9wdGlvbnMiLCJwcm92aWRlZE9wdGlvbnMiLCJyZXF1aXJlZENvbmZpZyIsImxlbmd0aCIsImFzc2VydCIsInVuZGVmaW5lZCIsInNob3dQb3B1cCIsImhpZGVQb3B1cCIsImZvY3VzT25TaG93Tm9kZSIsIl8iLCJnZXQiLCJ3aW5kb3ciLCJQb3B1cFBhcmVudE5vZGUiLCJiaW5kIiwidGFuZGVtIiwiY3JlYXRlVGFuZGVtIiwicGhldGlvUmVhZE9ubHkiLCJwaGV0aW9GZWF0dXJlZCIsImxhenlMaW5rIiwiaXNTaG93aW5nIiwicG9wdXBhYmxlTm9kZSIsImNoaWxkcmVuIiwicmVnaXN0ZXIiXSwibWFwcGluZ3MiOiJBQUFBLHNEQUFzRDtBQUV0RDs7Ozs7OztDQU9DLEdBRUQsT0FBT0EscUJBQXFCLG1DQUFtQztBQUcvRCxPQUFPQyxnQkFBZ0IsK0JBQStCO0FBQ3RELE9BQU9DLGtCQUFrQixxQ0FBcUM7QUFDOUQsT0FBT0MsZUFBZSxrQ0FBa0M7QUFHeEQsU0FBU0MsWUFBWSxFQUFFQyxJQUFJLFFBQXFCLDhCQUE4QjtBQUM5RSxPQUFPQyxTQUFTLFdBQVc7QUE0QzNCLE1BQU1DLFlBQVksQ0FBdUNDLE1BQWlCQztJQUV4RSxPQUFP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