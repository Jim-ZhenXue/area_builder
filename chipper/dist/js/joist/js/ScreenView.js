// Copyright 2013-2024, University of Colorado Boulder
/**
 * The view portion of a Screen, specifies the layout strategy for the visual view.
 *
 * For the PDOM view, this type creates  the three organizing elements associated with each screen:
 * - The `ScreenSummaryNode` is introductory description that outlines the screen and sets the scene for the user.
 * - The `PlayAreaNode` holds content that is considered the main interaction and pedagogy to be learned from the screen.
 * - The `ControlAreaNode` houses controls and other content that is secondary to the main interaction. Ideally the user
 *       would encounter this after exploring the PlayAreaNode.
 * The screenSummaryNode instance is not available on the ScreenView, instead content can be added to it via a constructor
 * option or `ScreenView.setScreenSummaryContent`. This is because some accessible descriptions in the screen summary
 * are the same throughout all simulations. The pdomPlayAreaNode and pdomControlAreaNode instances are protected, read-only Nodes
 * that are meant to have their pdomOrder and children set to achieve the proper PDOM structure. Do not set
 * `pdomOrder` directly on the ScreenView, as ScreenView set's its own pdomOrder
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */ import Property from '../../axon/js/Property.js';
import Bounds2 from '../../dot/js/Bounds2.js';
import Matrix3 from '../../dot/js/Matrix3.js';
import optionize from '../../phet-core/js/optionize.js';
import ControlAreaNode from '../../scenery-phet/js/accessibility/nodes/ControlAreaNode.js';
import PlayAreaNode from '../../scenery-phet/js/accessibility/nodes/PlayAreaNode.js';
import ScreenSummaryNode from '../../scenery-phet/js/accessibility/nodes/ScreenSummaryNode.js';
import { Node } from '../../scenery/js/imports.js';
import Tandem from '../../tandem/js/Tandem.js';
import joist from './joist.js';
/*
 * Default width and height for iPad2, iPad3, iPad4 running Safari with default tabs and decorations
 * These bounds were added in Sep 2014 and are based on a screenshot from a non-Retina iPad, in Safari, iOS7.
 * It therefore accounts for the nav bar on the bottom and the space consumed by the browser on the top.
 * As of this writing, this is the resolution being used by PhET's sim designers for their mockups.
 * For more information see https://github.com/phetsims/joist/issues/126
 */ const DEFAULT_LAYOUT_BOUNDS = new Bounds2(0, 0, 1024, 618);
let ScreenView = class ScreenView extends Node {
    /**
   * This method should not be called because ScreenView defines child Nodes that organize the PDOM structure of a
   * screen. See this.pdomScreenSummaryNode, this.pdomPlayAreaNode, and this.pdomControlAreaNode and set their accessible
   * order accordingly when adding accessible content to the PDOM for this screen.
   *
   * This makes sure that content will be under those Nodes, which are in the same order for all simulations. This
   * creates a consistent experience for screen reader accessibility.
   */ setPDOMOrder(pdomOrder) {
        throw new Error('Do not set the pdomOrder on ScreenView directly. Order Nodes under the ' + '`pdomScreenSummaryNode, pdomPlayAreaNode, and pdomControlAreaNode instead. ' + 'This ensures that sims have a consistent heading structure and content is under those ' + 'sections which is important for screen reader accessibility.');
    }
    /**
   * Override to make sure that setting children doesn't blow away Nodes set by ScreenView.
   */ setChildren(children) {
        Node.prototype.setChildren.call(this, children);
        // mutate may call setChildren before pdomParentNode is constructed
        if (this.pdomParentNode && !this.hasChild(this.pdomParentNode)) {
            this.addChild(this.pdomParentNode);
            this.pdomParentNode.moveToBack();
        }
        return this;
    }
    /**
   * Get the scale to use for laying out the sim components and the navigation bar, so its size will track
   * with the sim size
   * (joist-internal)
   */ getLayoutScale(viewBounds) {
        return ScreenView.getLayoutScale(this.layoutBounds, viewBounds);
    }
    /**
   * Default layout function uses the layoutWidth and layoutHeight to scale the content (based on whichever is more limiting: width or height)
   * and centers the content in the screen vertically and horizontally
   * This function can be replaced by subclasses that wish to perform their own custom layout.
   * @param viewBounds - desired bounds for the view
   * (joist-internal)
   */ layout(viewBounds, layoutMatrixOptions) {
        this.matrix = ScreenView.getLayoutMatrix(this.layoutBounds, viewBounds, layoutMatrixOptions);
        this.visibleBoundsProperty.value = this.parentToLocalBounds(viewBounds);
    }
    get screenSummaryContent() {
        return this._screenSummaryContent;
    }
    set screenSummaryContent(node) {
        this.setScreenSummaryContent(node);
    }
    /**
   * Set the screen summary Node for the PDOM of this Screen View. Prefer passing in a screen summary Node via
   * constructor options, but this method can be used directly when necessary.
   */ setScreenSummaryContent(node) {
        assert && assert(node !== this._screenSummaryContent, 'this is already the screen summary Node content');
        this._screenSummaryContent && this.pdomScreenSummaryNode.removeChild(this._screenSummaryContent);
        this._screenSummaryContent = node;
        if (node) {
            this.pdomScreenSummaryNode.addChild(node);
        }
    }
    /**
   * Set the screen summary Node intro string
   * (joist-internal)
   */ setScreenSummaryIntroAndTitle(simName, screenDisplayName, simTitle, isMultiScreen) {
        // TODO: Should use PatternStringProperty, see https://github.com/phetsims/joist/issues/885
        this.pdomScreenSummaryNode.setIntroString(simName, screenDisplayName, isMultiScreen);
        this.pdomTitleNode.innerContent = simTitle;
    }
    /**
   * Create the alert content for this ScreenView when the Voicing feature is enabled and the "Overview" button
   * is pressed.
   * Must be implemented if supporting voicing in your ScreenView.
   */ getVoicingOverviewContent() {
        throw new Error('The ScreenView should implement getVoicingOverviewContent if Voicing is enabled');
    }
    /**
   * Create the alert content for this ScreenView when the Voicing feature is enabled and the "Details" button is
   * pressed.
   * Must be implemented if supporting voicing in your ScreenView.
   */ getVoicingDetailsContent() {
        throw new Error('The ScreenView should implement getVoicingDetailsContent when the Voicing feature is enabled.');
    }
    /**
   * Create the alert content for this ScreenView when the Voicing feature is enabled and the "Hint" button is pressed.
   * Must be implemented if supporting voicing in your ScreenView.
   */ getVoicingHintContent() {
        throw new Error('The ScreenView should implement getVoicingHintContent when Voicing is enabled.');
    }
    /**
   * Interrupts all input listeners that are attached to either this node, or a descendant node.
   *
   * Overridden here so we can interrupt all of the listeners in the Display, see
   * https://github.com/phetsims/scenery/issues/1582.
   */ interruptSubtreeInput() {
        var _window_phet_joist_display, _window_phet_joist, _window_phet;
        (_window_phet = window.phet) == null ? void 0 : (_window_phet_joist = _window_phet.joist) == null ? void 0 : (_window_phet_joist_display = _window_phet_joist.display) == null ? void 0 : _window_phet_joist_display.interruptOtherPointers();
        return super.interruptSubtreeInput();
    }
    /**
   * Get the scale to use for laying out the sim components and the navigation bar, so its size will track
   * with the sim size
   */ static getLayoutScale(layoutBounds, viewBounds) {
        return Math.min(viewBounds.width / layoutBounds.width, viewBounds.height / layoutBounds.height);
    }
    static getLayoutMatrix(layoutBounds, viewBounds, providedOptions) {
        const options = optionize()({
            verticalAlign: 'center' // 'center' or 'bottom'
        }, providedOptions);
        const width = viewBounds.width;
        const height = viewBounds.height;
        const scale = ScreenView.getLayoutScale(layoutBounds, viewBounds);
        let dx = 0;
        let dy = 0;
        if (scale === width / layoutBounds.width) {
            // vertically float to bottom
            dy = height / scale - layoutBounds.height;
            // center vertically
            if (options.verticalAlign === 'center') {
                dy /= 2;
            }
        } else if (scale === height / layoutBounds.height) {
            // center horizontally
            dx = (width / scale - layoutBounds.width) / 2;
        }
        return Matrix3.rowMajor(scale, 0, dx * scale + viewBounds.left, 0, scale, dy * scale + viewBounds.top, 0, 0, 1);
    }
    // Noops for consistent API
    step(dt) {
    // See subclass for implementation
    }
    constructor(providedOptions){
        const options = optionize()({
            // {Bounds2} the bounds that are safe to draw in on all supported platforms
            layoutBounds: DEFAULT_LAYOUT_BOUNDS.copy(),
            // Node options
            layerSplit: true,
            excludeInvisible: true,
            // phet-io
            tandem: Tandem.REQUIRED,
            visiblePropertyOptions: {
                phetioState: false,
                phetioReadOnly: true
            },
            // pdom options
            containerTagName: 'article',
            tagName: 'div',
            // {Node|null} the Node with screen summary content to be added to the ScreenSummaryNode, and into PDOM above
            // the Play Area. This Node is added as a child to the ScreenSummaryNode.
            screenSummaryContent: null,
            // {boolean} whether or not to add the screen summary, play area, and control area Nodes to the PDOM
            includePDOMNodes: true
        }, providedOptions);
        super(options), // Keep track of the content added to the summary Node, so that if it is set more than once, the previous one can be
        // removed. Supports an ES6 getter/setter for this.
        this._screenSummaryContent = null;
        if (assert && this.isPhetioInstrumented()) {
            assert && assert(options.tandem.name === 'view', 'tandem name should be view');
        }
        // the bounds the confine the layout of the view.
        this.layoutBounds = options.layoutBounds;
        // Initialized to default layout bounds, then updated as soon as layout() is called, which is before the
        // ScreenView is displayed.
        this.visibleBoundsProperty = new Property(options.layoutBounds);
        // this cannot be a label to this ScreenView, because it needs to be focusable.
        this.pdomTitleNode = new Node({
            tagName: 'h1',
            focusHighlight: 'invisible'
        });
        // add children and set accessible order to these to organize and structure the PDOM.
        this.pdomPlayAreaNode = new PlayAreaNode();
        this.pdomControlAreaNode = new ControlAreaNode();
        // This container has the intro "{{SIM}} is an interactive sim, it changes as you . . ."
        this.pdomScreenSummaryNode = new ScreenSummaryNode();
        // at the Node from options in the same way that can be done at any time
        options.screenSummaryContent && this.setScreenSummaryContent(options.screenSummaryContent);
        // To make sure that the title "h1" is the first, focused item on a screen when that screen is selected, toggle the
        // focusability of the title, and then focus it. See https://github.com/phetsims/ratio-and-proportion/issues/321
        this.visibleProperty.lazyLink((visible)=>{
            if (visible) {
                assert && assert(!this.pdomTitleNode.focusable, 'about to set to be focusable');
                this.pdomTitleNode.focusable = true;
                this.pdomTitleNode.focus();
            } else {
                this.pdomTitleNode.focusable = false;
            }
        });
        // after initial focus, the titleNode should be removed from the focus order
        this.pdomTitleNode.addInputListener({
            blur: ()=>{
                this.pdomTitleNode.focusable = false;
            }
        });
        this.pdomParentNode = new Node({
            // order of Nodes for the PDOM that makes most sense for graphical rendering, "Play Area" components
            // on top of "Control Area" components.
            children: options.includePDOMNodes ? [
                this.pdomTitleNode,
                this.pdomScreenSummaryNode,
                this.pdomControlAreaNode,
                this.pdomPlayAreaNode
            ] : [
                this.pdomTitleNode
            ]
        });
        this.addChild(this.pdomParentNode);
        // pdom - "Play Area" comes before "Control Area" in PDOM
        this.pdomParentNode.pdomOrder = options.includePDOMNodes ? [
            this.pdomTitleNode,
            this.pdomScreenSummaryNode,
            this.pdomPlayAreaNode,
            this.pdomControlAreaNode
        ] : [
            this.pdomTitleNode
        ];
    }
};
ScreenView.DEFAULT_LAYOUT_BOUNDS = DEFAULT_LAYOUT_BOUNDS;
joist.register('ScreenView', ScreenView);
export default ScreenView;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2pvaXN0L2pzL1NjcmVlblZpZXcudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTMtMjAyNCwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbi8qKlxuICogVGhlIHZpZXcgcG9ydGlvbiBvZiBhIFNjcmVlbiwgc3BlY2lmaWVzIHRoZSBsYXlvdXQgc3RyYXRlZ3kgZm9yIHRoZSB2aXN1YWwgdmlldy5cbiAqXG4gKiBGb3IgdGhlIFBET00gdmlldywgdGhpcyB0eXBlIGNyZWF0ZXMgIHRoZSB0aHJlZSBvcmdhbml6aW5nIGVsZW1lbnRzIGFzc29jaWF0ZWQgd2l0aCBlYWNoIHNjcmVlbjpcbiAqIC0gVGhlIGBTY3JlZW5TdW1tYXJ5Tm9kZWAgaXMgaW50cm9kdWN0b3J5IGRlc2NyaXB0aW9uIHRoYXQgb3V0bGluZXMgdGhlIHNjcmVlbiBhbmQgc2V0cyB0aGUgc2NlbmUgZm9yIHRoZSB1c2VyLlxuICogLSBUaGUgYFBsYXlBcmVhTm9kZWAgaG9sZHMgY29udGVudCB0aGF0IGlzIGNvbnNpZGVyZWQgdGhlIG1haW4gaW50ZXJhY3Rpb24gYW5kIHBlZGFnb2d5IHRvIGJlIGxlYXJuZWQgZnJvbSB0aGUgc2NyZWVuLlxuICogLSBUaGUgYENvbnRyb2xBcmVhTm9kZWAgaG91c2VzIGNvbnRyb2xzIGFuZCBvdGhlciBjb250ZW50IHRoYXQgaXMgc2Vjb25kYXJ5IHRvIHRoZSBtYWluIGludGVyYWN0aW9uLiBJZGVhbGx5IHRoZSB1c2VyXG4gKiAgICAgICB3b3VsZCBlbmNvdW50ZXIgdGhpcyBhZnRlciBleHBsb3JpbmcgdGhlIFBsYXlBcmVhTm9kZS5cbiAqIFRoZSBzY3JlZW5TdW1tYXJ5Tm9kZSBpbnN0YW5jZSBpcyBub3QgYXZhaWxhYmxlIG9uIHRoZSBTY3JlZW5WaWV3LCBpbnN0ZWFkIGNvbnRlbnQgY2FuIGJlIGFkZGVkIHRvIGl0IHZpYSBhIGNvbnN0cnVjdG9yXG4gKiBvcHRpb24gb3IgYFNjcmVlblZpZXcuc2V0U2NyZWVuU3VtbWFyeUNvbnRlbnRgLiBUaGlzIGlzIGJlY2F1c2Ugc29tZSBhY2Nlc3NpYmxlIGRlc2NyaXB0aW9ucyBpbiB0aGUgc2NyZWVuIHN1bW1hcnlcbiAqIGFyZSB0aGUgc2FtZSB0aHJvdWdob3V0IGFsbCBzaW11bGF0aW9ucy4gVGhlIHBkb21QbGF5QXJlYU5vZGUgYW5kIHBkb21Db250cm9sQXJlYU5vZGUgaW5zdGFuY2VzIGFyZSBwcm90ZWN0ZWQsIHJlYWQtb25seSBOb2Rlc1xuICogdGhhdCBhcmUgbWVhbnQgdG8gaGF2ZSB0aGVpciBwZG9tT3JkZXIgYW5kIGNoaWxkcmVuIHNldCB0byBhY2hpZXZlIHRoZSBwcm9wZXIgUERPTSBzdHJ1Y3R1cmUuIERvIG5vdCBzZXRcbiAqIGBwZG9tT3JkZXJgIGRpcmVjdGx5IG9uIHRoZSBTY3JlZW5WaWV3LCBhcyBTY3JlZW5WaWV3IHNldCdzIGl0cyBvd24gcGRvbU9yZGVyXG4gKlxuICogQGF1dGhvciBTYW0gUmVpZCAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcbiAqL1xuXG5pbXBvcnQgUHJvcGVydHkgZnJvbSAnLi4vLi4vYXhvbi9qcy9Qcm9wZXJ0eS5qcyc7XG5pbXBvcnQgQm91bmRzMiBmcm9tICcuLi8uLi9kb3QvanMvQm91bmRzMi5qcyc7XG5pbXBvcnQgTWF0cml4MyBmcm9tICcuLi8uLi9kb3QvanMvTWF0cml4My5qcyc7XG5pbXBvcnQgb3B0aW9uaXplIGZyb20gJy4uLy4uL3BoZXQtY29yZS9qcy9vcHRpb25pemUuanMnO1xuaW1wb3J0IENvbnRyb2xBcmVhTm9kZSBmcm9tICcuLi8uLi9zY2VuZXJ5LXBoZXQvanMvYWNjZXNzaWJpbGl0eS9ub2Rlcy9Db250cm9sQXJlYU5vZGUuanMnO1xuaW1wb3J0IFBsYXlBcmVhTm9kZSBmcm9tICcuLi8uLi9zY2VuZXJ5LXBoZXQvanMvYWNjZXNzaWJpbGl0eS9ub2Rlcy9QbGF5QXJlYU5vZGUuanMnO1xuaW1wb3J0IFNjcmVlblN1bW1hcnlOb2RlIGZyb20gJy4uLy4uL3NjZW5lcnktcGhldC9qcy9hY2Nlc3NpYmlsaXR5L25vZGVzL1NjcmVlblN1bW1hcnlOb2RlLmpzJztcbmltcG9ydCB7IE5vZGUsIE5vZGVPcHRpb25zIH0gZnJvbSAnLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcbmltcG9ydCBUYW5kZW0gZnJvbSAnLi4vLi4vdGFuZGVtL2pzL1RhbmRlbS5qcyc7XG5pbXBvcnQgeyBTcGVha2FibGVSZXNvbHZlZFJlc3BvbnNlIH0gZnJvbSAnLi4vLi4vdXR0ZXJhbmNlLXF1ZXVlL2pzL1Jlc3BvbnNlUGFja2V0LmpzJztcbmltcG9ydCBqb2lzdCBmcm9tICcuL2pvaXN0LmpzJztcbmltcG9ydCBTY3JlZW5TdW1tYXJ5Q29udGVudCBmcm9tICcuL1NjcmVlblN1bW1hcnlDb250ZW50LmpzJztcblxuLypcbiAqIERlZmF1bHQgd2lkdGggYW5kIGhlaWdodCBmb3IgaVBhZDIsIGlQYWQzLCBpUGFkNCBydW5uaW5nIFNhZmFyaSB3aXRoIGRlZmF1bHQgdGFicyBhbmQgZGVjb3JhdGlvbnNcbiAqIFRoZXNlIGJvdW5kcyB3ZXJlIGFkZGVkIGluIFNlcCAyMDE0IGFuZCBhcmUgYmFzZWQgb24gYSBzY3JlZW5zaG90IGZyb20gYSBub24tUmV0aW5hIGlQYWQsIGluIFNhZmFyaSwgaU9TNy5cbiAqIEl0IHRoZXJlZm9yZSBhY2NvdW50cyBmb3IgdGhlIG5hdiBiYXIgb24gdGhlIGJvdHRvbSBhbmQgdGhlIHNwYWNlIGNvbnN1bWVkIGJ5IHRoZSBicm93c2VyIG9uIHRoZSB0b3AuXG4gKiBBcyBvZiB0aGlzIHdyaXRpbmcsIHRoaXMgaXMgdGhlIHJlc29sdXRpb24gYmVpbmcgdXNlZCBieSBQaEVUJ3Mgc2ltIGRlc2lnbmVycyBmb3IgdGhlaXIgbW9ja3Vwcy5cbiAqIEZvciBtb3JlIGluZm9ybWF0aW9uIHNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvam9pc3QvaXNzdWVzLzEyNlxuICovXG5jb25zdCBERUZBVUxUX0xBWU9VVF9CT1VORFMgPSBuZXcgQm91bmRzMiggMCwgMCwgMTAyNCwgNjE4ICk7XG5cbnR5cGUgR2V0TGF5b3V0TWF0cml4T3B0aW9ucyA9IHtcbiAgdmVydGljYWxBbGlnbj86ICdjZW50ZXInIHwgJ2JvdHRvbSc7XG59O1xuXG4vLyBEb2N1bWVudGVkIHdoZXJlIHRoZSBkZWZhdWx0cyBhcmUgZGVmaW5lZFxudHlwZSBTZWxmT3B0aW9ucyA9IHtcbiAgbGF5b3V0Qm91bmRzPzogQm91bmRzMjtcbiAgc2NyZWVuU3VtbWFyeUNvbnRlbnQ/OiBTY3JlZW5TdW1tYXJ5Q29udGVudCB8IG51bGw7XG4gIGluY2x1ZGVQRE9NTm9kZXM/OiBib29sZWFuO1xufTtcbmV4cG9ydCB0eXBlIFNjcmVlblZpZXdPcHRpb25zID0gU2VsZk9wdGlvbnMgJiBOb2RlT3B0aW9ucztcblxuY2xhc3MgU2NyZWVuVmlldyBleHRlbmRzIE5vZGUge1xuICBwdWJsaWMgcmVhZG9ubHkgbGF5b3V0Qm91bmRzOiBCb3VuZHMyO1xuXG4gIC8vIFRoZSB2aXNpYmxlIGJvdW5kcyBvZiB0aGUgU2NyZWVuVmlldyBpbiBTY3JlZW5WaWV3IGNvb3JkaW5hdGVzLiAgVGhpcyBpbmNsdWRlcyB0b3AvYm90dG9tIG9yIGxlZnQvcmlnaHQgbWFyZ2luc1xuICAvLyBkZXBlbmRpbmcgb24gdGhlIGFzcGVjdCByYXRpbyBvZiB0aGUgc2NyZWVuLiBDbGllbnRzIHNob3VsZCBub3Qgc2V0IHRoaXMgdmFsdWVcbiAgcHVibGljIHJlYWRvbmx5IHZpc2libGVCb3VuZHNQcm9wZXJ0eTogUHJvcGVydHk8Qm91bmRzMj47XG4gIHByaXZhdGUgcmVhZG9ubHkgcGRvbVRpdGxlTm9kZTogTm9kZTtcbiAgcHJvdGVjdGVkIHJlYWRvbmx5IHBkb21QbGF5QXJlYU5vZGU6IFBsYXlBcmVhTm9kZTtcbiAgcHJvdGVjdGVkIHJlYWRvbmx5IHBkb21Db250cm9sQXJlYU5vZGU6IENvbnRyb2xBcmVhTm9kZTtcbiAgcHJpdmF0ZSByZWFkb25seSBwZG9tU2NyZWVuU3VtbWFyeU5vZGU6IFNjcmVlblN1bW1hcnlOb2RlO1xuICBwcml2YXRlIHJlYWRvbmx5IHBkb21QYXJlbnROb2RlOiBOb2RlO1xuXG4gIC8vIEtlZXAgdHJhY2sgb2YgdGhlIGNvbnRlbnQgYWRkZWQgdG8gdGhlIHN1bW1hcnkgTm9kZSwgc28gdGhhdCBpZiBpdCBpcyBzZXQgbW9yZSB0aGFuIG9uY2UsIHRoZSBwcmV2aW91cyBvbmUgY2FuIGJlXG4gIC8vIHJlbW92ZWQuIFN1cHBvcnRzIGFuIEVTNiBnZXR0ZXIvc2V0dGVyIGZvciB0aGlzLlxuICBwcml2YXRlIF9zY3JlZW5TdW1tYXJ5Q29udGVudDogTm9kZSB8IG51bGwgPSBudWxsO1xuXG4gIHB1YmxpYyBzdGF0aWMgcmVhZG9ubHkgREVGQVVMVF9MQVlPVVRfQk9VTkRTID0gREVGQVVMVF9MQVlPVVRfQk9VTkRTO1xuXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggcHJvdmlkZWRPcHRpb25zPzogU2NyZWVuVmlld09wdGlvbnMgKSB7XG5cbiAgICBjb25zdCBvcHRpb25zID0gb3B0aW9uaXplPFNjcmVlblZpZXdPcHRpb25zLCBTZWxmT3B0aW9ucywgTm9kZU9wdGlvbnM+KCkoIHtcblxuICAgICAgLy8ge0JvdW5kczJ9IHRoZSBib3VuZHMgdGhhdCBhcmUgc2FmZSB0byBkcmF3IGluIG9uIGFsbCBzdXBwb3J0ZWQgcGxhdGZvcm1zXG4gICAgICBsYXlvdXRCb3VuZHM6IERFRkFVTFRfTEFZT1VUX0JPVU5EUy5jb3B5KCksXG5cbiAgICAgIC8vIE5vZGUgb3B0aW9uc1xuICAgICAgbGF5ZXJTcGxpdDogdHJ1ZSwgLy8gc28gd2UncmUgbm90IGluIHRoZSBzYW1lIGxheWVyIGFzIHRoZSBuYXZiYXIsIGV0Yy5cbiAgICAgIGV4Y2x1ZGVJbnZpc2libGU6IHRydWUsIC8vIHNvIHdlIGRvbid0IGtlZXAgaW52aXNpYmxlIHNjcmVlbnMgaW4gdGhlIFNWRyB0cmVlXG5cbiAgICAgIC8vIHBoZXQtaW9cbiAgICAgIHRhbmRlbTogVGFuZGVtLlJFUVVJUkVELFxuICAgICAgdmlzaWJsZVByb3BlcnR5T3B0aW9uczoge1xuICAgICAgICBwaGV0aW9TdGF0ZTogZmFsc2UsXG4gICAgICAgIHBoZXRpb1JlYWRPbmx5OiB0cnVlXG4gICAgICB9LFxuXG4gICAgICAvLyBwZG9tIG9wdGlvbnNcbiAgICAgIGNvbnRhaW5lclRhZ05hbWU6ICdhcnRpY2xlJyxcbiAgICAgIHRhZ05hbWU6ICdkaXYnLFxuXG4gICAgICAvLyB7Tm9kZXxudWxsfSB0aGUgTm9kZSB3aXRoIHNjcmVlbiBzdW1tYXJ5IGNvbnRlbnQgdG8gYmUgYWRkZWQgdG8gdGhlIFNjcmVlblN1bW1hcnlOb2RlLCBhbmQgaW50byBQRE9NIGFib3ZlXG4gICAgICAvLyB0aGUgUGxheSBBcmVhLiBUaGlzIE5vZGUgaXMgYWRkZWQgYXMgYSBjaGlsZCB0byB0aGUgU2NyZWVuU3VtbWFyeU5vZGUuXG4gICAgICBzY3JlZW5TdW1tYXJ5Q29udGVudDogbnVsbCxcblxuICAgICAgLy8ge2Jvb2xlYW59IHdoZXRoZXIgb3Igbm90IHRvIGFkZCB0aGUgc2NyZWVuIHN1bW1hcnksIHBsYXkgYXJlYSwgYW5kIGNvbnRyb2wgYXJlYSBOb2RlcyB0byB0aGUgUERPTVxuICAgICAgaW5jbHVkZVBET01Ob2RlczogdHJ1ZVxuICAgIH0sIHByb3ZpZGVkT3B0aW9ucyApO1xuXG4gICAgc3VwZXIoIG9wdGlvbnMgKTtcblxuICAgIGlmICggYXNzZXJ0ICYmIHRoaXMuaXNQaGV0aW9JbnN0cnVtZW50ZWQoKSApIHtcbiAgICAgIGFzc2VydCAmJiBhc3NlcnQoIG9wdGlvbnMudGFuZGVtLm5hbWUgPT09ICd2aWV3JywgJ3RhbmRlbSBuYW1lIHNob3VsZCBiZSB2aWV3JyApO1xuICAgIH1cblxuICAgIC8vIHRoZSBib3VuZHMgdGhlIGNvbmZpbmUgdGhlIGxheW91dCBvZiB0aGUgdmlldy5cbiAgICB0aGlzLmxheW91dEJvdW5kcyA9IG9wdGlvbnMubGF5b3V0Qm91bmRzO1xuXG4gICAgLy8gSW5pdGlhbGl6ZWQgdG8gZGVmYXVsdCBsYXlvdXQgYm91bmRzLCB0aGVuIHVwZGF0ZWQgYXMgc29vbiBhcyBsYXlvdXQoKSBpcyBjYWxsZWQsIHdoaWNoIGlzIGJlZm9yZSB0aGVcbiAgICAvLyBTY3JlZW5WaWV3IGlzIGRpc3BsYXllZC5cbiAgICB0aGlzLnZpc2libGVCb3VuZHNQcm9wZXJ0eSA9IG5ldyBQcm9wZXJ0eSggb3B0aW9ucy5sYXlvdXRCb3VuZHMgKTtcblxuICAgIC8vIHRoaXMgY2Fubm90IGJlIGEgbGFiZWwgdG8gdGhpcyBTY3JlZW5WaWV3LCBiZWNhdXNlIGl0IG5lZWRzIHRvIGJlIGZvY3VzYWJsZS5cbiAgICB0aGlzLnBkb21UaXRsZU5vZGUgPSBuZXcgTm9kZSggeyB0YWdOYW1lOiAnaDEnLCBmb2N1c0hpZ2hsaWdodDogJ2ludmlzaWJsZScgfSApO1xuXG4gICAgLy8gYWRkIGNoaWxkcmVuIGFuZCBzZXQgYWNjZXNzaWJsZSBvcmRlciB0byB0aGVzZSB0byBvcmdhbml6ZSBhbmQgc3RydWN0dXJlIHRoZSBQRE9NLlxuICAgIHRoaXMucGRvbVBsYXlBcmVhTm9kZSA9IG5ldyBQbGF5QXJlYU5vZGUoKTtcbiAgICB0aGlzLnBkb21Db250cm9sQXJlYU5vZGUgPSBuZXcgQ29udHJvbEFyZWFOb2RlKCk7XG5cbiAgICAvLyBUaGlzIGNvbnRhaW5lciBoYXMgdGhlIGludHJvIFwie3tTSU19fSBpcyBhbiBpbnRlcmFjdGl2ZSBzaW0sIGl0IGNoYW5nZXMgYXMgeW91IC4gLiAuXCJcbiAgICB0aGlzLnBkb21TY3JlZW5TdW1tYXJ5Tm9kZSA9IG5ldyBTY3JlZW5TdW1tYXJ5Tm9kZSgpO1xuXG4gICAgLy8gYXQgdGhlIE5vZGUgZnJvbSBvcHRpb25zIGluIHRoZSBzYW1lIHdheSB0aGF0IGNhbiBiZSBkb25lIGF0IGFueSB0aW1lXG4gICAgb3B0aW9ucy5zY3JlZW5TdW1tYXJ5Q29udGVudCAmJiB0aGlzLnNldFNjcmVlblN1bW1hcnlDb250ZW50KCBvcHRpb25zLnNjcmVlblN1bW1hcnlDb250ZW50ICk7XG5cbiAgICAvLyBUbyBtYWtlIHN1cmUgdGhhdCB0aGUgdGl0bGUgXCJoMVwiIGlzIHRoZSBmaXJzdCwgZm9jdXNlZCBpdGVtIG9uIGEgc2NyZWVuIHdoZW4gdGhhdCBzY3JlZW4gaXMgc2VsZWN0ZWQsIHRvZ2dsZSB0aGVcbiAgICAvLyBmb2N1c2FiaWxpdHkgb2YgdGhlIHRpdGxlLCBhbmQgdGhlbiBmb2N1cyBpdC4gU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9yYXRpby1hbmQtcHJvcG9ydGlvbi9pc3N1ZXMvMzIxXG4gICAgdGhpcy52aXNpYmxlUHJvcGVydHkubGF6eUxpbmsoIHZpc2libGUgPT4ge1xuICAgICAgaWYgKCB2aXNpYmxlICkge1xuICAgICAgICBhc3NlcnQgJiYgYXNzZXJ0KCAhdGhpcy5wZG9tVGl0bGVOb2RlLmZvY3VzYWJsZSwgJ2Fib3V0IHRvIHNldCB0byBiZSBmb2N1c2FibGUnICk7XG4gICAgICAgIHRoaXMucGRvbVRpdGxlTm9kZS5mb2N1c2FibGUgPSB0cnVlO1xuICAgICAgICB0aGlzLnBkb21UaXRsZU5vZGUuZm9jdXMoKTtcbiAgICAgIH1cbiAgICAgIGVsc2Uge1xuICAgICAgICB0aGlzLnBkb21UaXRsZU5vZGUuZm9jdXNhYmxlID0gZmFsc2U7XG4gICAgICB9XG4gICAgfSApO1xuXG4gICAgLy8gYWZ0ZXIgaW5pdGlhbCBmb2N1cywgdGhlIHRpdGxlTm9kZSBzaG91bGQgYmUgcmVtb3ZlZCBmcm9tIHRoZSBmb2N1cyBvcmRlclxuICAgIHRoaXMucGRvbVRpdGxlTm9kZS5hZGRJbnB1dExpc3RlbmVyKCB7XG4gICAgICBibHVyOiAoKSA9PiB7XG4gICAgICAgIHRoaXMucGRvbVRpdGxlTm9kZS5mb2N1c2FibGUgPSBmYWxzZTtcbiAgICAgIH1cbiAgICB9ICk7XG5cbiAgICB0aGlzLnBkb21QYXJlbnROb2RlID0gbmV3IE5vZGUoIHtcblxuICAgICAgLy8gb3JkZXIgb2YgTm9kZXMgZm9yIHRoZSBQRE9NIHRoYXQgbWFrZXMgbW9zdCBzZW5zZSBmb3IgZ3JhcGhpY2FsIHJlbmRlcmluZywgXCJQbGF5IEFyZWFcIiBjb21wb25lbnRzXG4gICAgICAvLyBvbiB0b3Agb2YgXCJDb250cm9sIEFyZWFcIiBjb21wb25lbnRzLlxuICAgICAgY2hpbGRyZW46IG9wdGlvbnMuaW5jbHVkZVBET01Ob2RlcyA/IFtcbiAgICAgICAgdGhpcy5wZG9tVGl0bGVOb2RlLFxuICAgICAgICB0aGlzLnBkb21TY3JlZW5TdW1tYXJ5Tm9kZSxcbiAgICAgICAgdGhpcy5wZG9tQ29udHJvbEFyZWFOb2RlLFxuICAgICAgICB0aGlzLnBkb21QbGF5QXJlYU5vZGVcbiAgICAgIF0gOiBbIHRoaXMucGRvbVRpdGxlTm9kZSBdXG4gICAgfSApO1xuICAgIHRoaXMuYWRkQ2hpbGQoIHRoaXMucGRvbVBhcmVudE5vZGUgKTtcblxuICAgIC8vIHBkb20gLSBcIlBsYXkgQXJlYVwiIGNvbWVzIGJlZm9yZSBcIkNvbnRyb2wgQXJlYVwiIGluIFBET01cbiAgICB0aGlzLnBkb21QYXJlbnROb2RlLnBkb21PcmRlciA9IG9wdGlvbnMuaW5jbHVkZVBET01Ob2RlcyA/IFtcbiAgICAgIHRoaXMucGRvbVRpdGxlTm9kZSxcbiAgICAgIHRoaXMucGRvbVNjcmVlblN1bW1hcnlOb2RlLFxuICAgICAgdGhpcy5wZG9tUGxheUFyZWFOb2RlLFxuICAgICAgdGhpcy5wZG9tQ29udHJvbEFyZWFOb2RlXG4gICAgXSA6IFsgdGhpcy5wZG9tVGl0bGVOb2RlIF07XG4gIH1cblxuICAvKipcbiAgICogVGhpcyBtZXRob2Qgc2hvdWxkIG5vdCBiZSBjYWxsZWQgYmVjYXVzZSBTY3JlZW5WaWV3IGRlZmluZXMgY2hpbGQgTm9kZXMgdGhhdCBvcmdhbml6ZSB0aGUgUERPTSBzdHJ1Y3R1cmUgb2YgYVxuICAgKiBzY3JlZW4uIFNlZSB0aGlzLnBkb21TY3JlZW5TdW1tYXJ5Tm9kZSwgdGhpcy5wZG9tUGxheUFyZWFOb2RlLCBhbmQgdGhpcy5wZG9tQ29udHJvbEFyZWFOb2RlIGFuZCBzZXQgdGhlaXIgYWNjZXNzaWJsZVxuICAgKiBvcmRlciBhY2NvcmRpbmdseSB3aGVuIGFkZGluZyBhY2Nlc3NpYmxlIGNvbnRlbnQgdG8gdGhlIFBET00gZm9yIHRoaXMgc2NyZWVuLlxuICAgKlxuICAgKiBUaGlzIG1ha2VzIHN1cmUgdGhhdCBjb250ZW50IHdpbGwgYmUgdW5kZXIgdGhvc2UgTm9kZXMsIHdoaWNoIGFyZSBpbiB0aGUgc2FtZSBvcmRlciBmb3IgYWxsIHNpbXVsYXRpb25zLiBUaGlzXG4gICAqIGNyZWF0ZXMgYSBjb25zaXN0ZW50IGV4cGVyaWVuY2UgZm9yIHNjcmVlbiByZWFkZXIgYWNjZXNzaWJpbGl0eS5cbiAgICovXG4gIHB1YmxpYyBvdmVycmlkZSBzZXRQRE9NT3JkZXIoIHBkb21PcmRlcjogQXJyYXk8Tm9kZSB8IG51bGw+IHwgbnVsbCApOiB2b2lkIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoICdEbyBub3Qgc2V0IHRoZSBwZG9tT3JkZXIgb24gU2NyZWVuVmlldyBkaXJlY3RseS4gT3JkZXIgTm9kZXMgdW5kZXIgdGhlICcgK1xuICAgICAgICAgICAgICAgICAgICAgJ2BwZG9tU2NyZWVuU3VtbWFyeU5vZGUsIHBkb21QbGF5QXJlYU5vZGUsIGFuZCBwZG9tQ29udHJvbEFyZWFOb2RlIGluc3RlYWQuICcgK1xuICAgICAgICAgICAgICAgICAgICAgJ1RoaXMgZW5zdXJlcyB0aGF0IHNpbXMgaGF2ZSBhIGNvbnNpc3RlbnQgaGVhZGluZyBzdHJ1Y3R1cmUgYW5kIGNvbnRlbnQgaXMgdW5kZXIgdGhvc2UgJyArXG4gICAgICAgICAgICAgICAgICAgICAnc2VjdGlvbnMgd2hpY2ggaXMgaW1wb3J0YW50IGZvciBzY3JlZW4gcmVhZGVyIGFjY2Vzc2liaWxpdHkuJ1xuICAgICk7XG4gIH1cblxuICAvKipcbiAgICogT3ZlcnJpZGUgdG8gbWFrZSBzdXJlIHRoYXQgc2V0dGluZyBjaGlsZHJlbiBkb2Vzbid0IGJsb3cgYXdheSBOb2RlcyBzZXQgYnkgU2NyZWVuVmlldy5cbiAgICovXG4gIHB1YmxpYyBvdmVycmlkZSBzZXRDaGlsZHJlbiggY2hpbGRyZW46IE5vZGVbXSApOiB0aGlzIHtcbiAgICBOb2RlLnByb3RvdHlwZS5zZXRDaGlsZHJlbi5jYWxsKCB0aGlzLCBjaGlsZHJlbiApO1xuXG4gICAgLy8gbXV0YXRlIG1heSBjYWxsIHNldENoaWxkcmVuIGJlZm9yZSBwZG9tUGFyZW50Tm9kZSBpcyBjb25zdHJ1Y3RlZFxuICAgIGlmICggdGhpcy5wZG9tUGFyZW50Tm9kZSAmJiAhdGhpcy5oYXNDaGlsZCggdGhpcy5wZG9tUGFyZW50Tm9kZSApICkge1xuICAgICAgdGhpcy5hZGRDaGlsZCggdGhpcy5wZG9tUGFyZW50Tm9kZSApO1xuICAgICAgdGhpcy5wZG9tUGFyZW50Tm9kZS5tb3ZlVG9CYWNrKCk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldCB0aGUgc2NhbGUgdG8gdXNlIGZvciBsYXlpbmcgb3V0IHRoZSBzaW0gY29tcG9uZW50cyBhbmQgdGhlIG5hdmlnYXRpb24gYmFyLCBzbyBpdHMgc2l6ZSB3aWxsIHRyYWNrXG4gICAqIHdpdGggdGhlIHNpbSBzaXplXG4gICAqIChqb2lzdC1pbnRlcm5hbClcbiAgICovXG4gIHB1YmxpYyBnZXRMYXlvdXRTY2FsZSggdmlld0JvdW5kczogQm91bmRzMiApOiBudW1iZXIge1xuICAgIHJldHVybiBTY3JlZW5WaWV3LmdldExheW91dFNjYWxlKCB0aGlzLmxheW91dEJvdW5kcywgdmlld0JvdW5kcyApO1xuICB9XG5cbiAgLyoqXG4gICAqIERlZmF1bHQgbGF5b3V0IGZ1bmN0aW9uIHVzZXMgdGhlIGxheW91dFdpZHRoIGFuZCBsYXlvdXRIZWlnaHQgdG8gc2NhbGUgdGhlIGNvbnRlbnQgKGJhc2VkIG9uIHdoaWNoZXZlciBpcyBtb3JlIGxpbWl0aW5nOiB3aWR0aCBvciBoZWlnaHQpXG4gICAqIGFuZCBjZW50ZXJzIHRoZSBjb250ZW50IGluIHRoZSBzY3JlZW4gdmVydGljYWxseSBhbmQgaG9yaXpvbnRhbGx5XG4gICAqIFRoaXMgZnVuY3Rpb24gY2FuIGJlIHJlcGxhY2VkIGJ5IHN1YmNsYXNzZXMgdGhhdCB3aXNoIHRvIHBlcmZvcm0gdGhlaXIgb3duIGN1c3RvbSBsYXlvdXQuXG4gICAqIEBwYXJhbSB2aWV3Qm91bmRzIC0gZGVzaXJlZCBib3VuZHMgZm9yIHRoZSB2aWV3XG4gICAqIChqb2lzdC1pbnRlcm5hbClcbiAgICovXG4gIHB1YmxpYyBsYXlvdXQoIHZpZXdCb3VuZHM6IEJvdW5kczIsIGxheW91dE1hdHJpeE9wdGlvbnM/OiBHZXRMYXlvdXRNYXRyaXhPcHRpb25zICk6IHZvaWQge1xuICAgIHRoaXMubWF0cml4ID0gU2NyZWVuVmlldy5nZXRMYXlvdXRNYXRyaXgoIHRoaXMubGF5b3V0Qm91bmRzLCB2aWV3Qm91bmRzLCBsYXlvdXRNYXRyaXhPcHRpb25zICk7XG4gICAgdGhpcy52aXNpYmxlQm91bmRzUHJvcGVydHkudmFsdWUgPSB0aGlzLnBhcmVudFRvTG9jYWxCb3VuZHMoIHZpZXdCb3VuZHMgKTtcbiAgfVxuXG4gIHB1YmxpYyBnZXQgc2NyZWVuU3VtbWFyeUNvbnRlbnQoKTogTm9kZSB8IG51bGwge1xuICAgIHJldHVybiB0aGlzLl9zY3JlZW5TdW1tYXJ5Q29udGVudDtcbiAgfVxuXG4gIHB1YmxpYyBzZXQgc2NyZWVuU3VtbWFyeUNvbnRlbnQoIG5vZGU6IE5vZGUgfCBudWxsICkge1xuICAgIHRoaXMuc2V0U2NyZWVuU3VtbWFyeUNvbnRlbnQoIG5vZGUgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXQgdGhlIHNjcmVlbiBzdW1tYXJ5IE5vZGUgZm9yIHRoZSBQRE9NIG9mIHRoaXMgU2NyZWVuIFZpZXcuIFByZWZlciBwYXNzaW5nIGluIGEgc2NyZWVuIHN1bW1hcnkgTm9kZSB2aWFcbiAgICogY29uc3RydWN0b3Igb3B0aW9ucywgYnV0IHRoaXMgbWV0aG9kIGNhbiBiZSB1c2VkIGRpcmVjdGx5IHdoZW4gbmVjZXNzYXJ5LlxuICAgKi9cbiAgcHVibGljIHNldFNjcmVlblN1bW1hcnlDb250ZW50KCBub2RlOiBOb2RlIHwgbnVsbCApOiB2b2lkIHtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBub2RlICE9PSB0aGlzLl9zY3JlZW5TdW1tYXJ5Q29udGVudCwgJ3RoaXMgaXMgYWxyZWFkeSB0aGUgc2NyZWVuIHN1bW1hcnkgTm9kZSBjb250ZW50JyApO1xuXG4gICAgdGhpcy5fc2NyZWVuU3VtbWFyeUNvbnRlbnQgJiYgdGhpcy5wZG9tU2NyZWVuU3VtbWFyeU5vZGUucmVtb3ZlQ2hpbGQoIHRoaXMuX3NjcmVlblN1bW1hcnlDb250ZW50ICk7XG5cbiAgICB0aGlzLl9zY3JlZW5TdW1tYXJ5Q29udGVudCA9IG5vZGU7XG5cbiAgICBpZiAoIG5vZGUgKSB7XG4gICAgICB0aGlzLnBkb21TY3JlZW5TdW1tYXJ5Tm9kZS5hZGRDaGlsZCggbm9kZSApO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBTZXQgdGhlIHNjcmVlbiBzdW1tYXJ5IE5vZGUgaW50cm8gc3RyaW5nXG4gICAqIChqb2lzdC1pbnRlcm5hbClcbiAgICovXG4gIHB1YmxpYyBzZXRTY3JlZW5TdW1tYXJ5SW50cm9BbmRUaXRsZSggc2ltTmFtZTogc3RyaW5nLCBzY3JlZW5EaXNwbGF5TmFtZTogc3RyaW5nIHwgbnVsbCwgc2ltVGl0bGU6IHN0cmluZywgaXNNdWx0aVNjcmVlbjogYm9vbGVhbiApOiB2b2lkIHtcbiAgICAvLyBUT0RPOiBTaG91bGQgdXNlIFBhdHRlcm5TdHJpbmdQcm9wZXJ0eSwgc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9qb2lzdC9pc3N1ZXMvODg1XG4gICAgdGhpcy5wZG9tU2NyZWVuU3VtbWFyeU5vZGUuc2V0SW50cm9TdHJpbmcoIHNpbU5hbWUsIHNjcmVlbkRpc3BsYXlOYW1lLCBpc011bHRpU2NyZWVuICk7XG4gICAgdGhpcy5wZG9tVGl0bGVOb2RlLmlubmVyQ29udGVudCA9IHNpbVRpdGxlO1xuICB9XG5cbiAgLyoqXG4gICAqIENyZWF0ZSB0aGUgYWxlcnQgY29udGVudCBmb3IgdGhpcyBTY3JlZW5WaWV3IHdoZW4gdGhlIFZvaWNpbmcgZmVhdHVyZSBpcyBlbmFibGVkIGFuZCB0aGUgXCJPdmVydmlld1wiIGJ1dHRvblxuICAgKiBpcyBwcmVzc2VkLlxuICAgKiBNdXN0IGJlIGltcGxlbWVudGVkIGlmIHN1cHBvcnRpbmcgdm9pY2luZyBpbiB5b3VyIFNjcmVlblZpZXcuXG4gICAqL1xuICBwdWJsaWMgZ2V0Vm9pY2luZ092ZXJ2aWV3Q29udGVudCgpOiBTcGVha2FibGVSZXNvbHZlZFJlc3BvbnNlIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoICdUaGUgU2NyZWVuVmlldyBzaG91bGQgaW1wbGVtZW50IGdldFZvaWNpbmdPdmVydmlld0NvbnRlbnQgaWYgVm9pY2luZyBpcyBlbmFibGVkJyApO1xuICB9XG5cbiAgLyoqXG4gICAqIENyZWF0ZSB0aGUgYWxlcnQgY29udGVudCBmb3IgdGhpcyBTY3JlZW5WaWV3IHdoZW4gdGhlIFZvaWNpbmcgZmVhdHVyZSBpcyBlbmFibGVkIGFuZCB0aGUgXCJEZXRhaWxzXCIgYnV0dG9uIGlzXG4gICAqIHByZXNzZWQuXG4gICAqIE11c3QgYmUgaW1wbGVtZW50ZWQgaWYgc3VwcG9ydGluZyB2b2ljaW5nIGluIHlvdXIgU2NyZWVuVmlldy5cbiAgICovXG4gIHB1YmxpYyBnZXRWb2ljaW5nRGV0YWlsc0NvbnRlbnQoKTogU3BlYWthYmxlUmVzb2x2ZWRSZXNwb25zZSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCAnVGhlIFNjcmVlblZpZXcgc2hvdWxkIGltcGxlbWVudCBnZXRWb2ljaW5nRGV0YWlsc0NvbnRlbnQgd2hlbiB0aGUgVm9pY2luZyBmZWF0dXJlIGlzIGVuYWJsZWQuJyApO1xuICB9XG5cbiAgLyoqXG4gICAqIENyZWF0ZSB0aGUgYWxlcnQgY29udGVudCBmb3IgdGhpcyBTY3JlZW5WaWV3IHdoZW4gdGhlIFZvaWNpbmcgZmVhdHVyZSBpcyBlbmFibGVkIGFuZCB0aGUgXCJIaW50XCIgYnV0dG9uIGlzIHByZXNzZWQuXG4gICAqIE11c3QgYmUgaW1wbGVtZW50ZWQgaWYgc3VwcG9ydGluZyB2b2ljaW5nIGluIHlvdXIgU2NyZWVuVmlldy5cbiAgICovXG4gIHB1YmxpYyBnZXRWb2ljaW5nSGludENvbnRlbnQoKTogU3BlYWthYmxlUmVzb2x2ZWRSZXNwb25zZSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCAnVGhlIFNjcmVlblZpZXcgc2hvdWxkIGltcGxlbWVudCBnZXRWb2ljaW5nSGludENvbnRlbnQgd2hlbiBWb2ljaW5nIGlzIGVuYWJsZWQuJyApO1xuICB9XG5cbiAgLyoqXG4gICAqIEludGVycnVwdHMgYWxsIGlucHV0IGxpc3RlbmVycyB0aGF0IGFyZSBhdHRhY2hlZCB0byBlaXRoZXIgdGhpcyBub2RlLCBvciBhIGRlc2NlbmRhbnQgbm9kZS5cbiAgICpcbiAgICogT3ZlcnJpZGRlbiBoZXJlIHNvIHdlIGNhbiBpbnRlcnJ1cHQgYWxsIG9mIHRoZSBsaXN0ZW5lcnMgaW4gdGhlIERpc3BsYXksIHNlZVxuICAgKiBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvc2NlbmVyeS9pc3N1ZXMvMTU4Mi5cbiAgICovXG4gIHB1YmxpYyBvdmVycmlkZSBpbnRlcnJ1cHRTdWJ0cmVlSW5wdXQoKTogdGhpcyB7XG4gICAgd2luZG93LnBoZXQ/LmpvaXN0Py5kaXNwbGF5Py5pbnRlcnJ1cHRPdGhlclBvaW50ZXJzKCk7XG5cbiAgICByZXR1cm4gc3VwZXIuaW50ZXJydXB0U3VidHJlZUlucHV0KCk7XG4gIH1cblxuICAvKipcbiAgICogR2V0IHRoZSBzY2FsZSB0byB1c2UgZm9yIGxheWluZyBvdXQgdGhlIHNpbSBjb21wb25lbnRzIGFuZCB0aGUgbmF2aWdhdGlvbiBiYXIsIHNvIGl0cyBzaXplIHdpbGwgdHJhY2tcbiAgICogd2l0aCB0aGUgc2ltIHNpemVcbiAgICovXG4gIHB1YmxpYyBzdGF0aWMgZ2V0TGF5b3V0U2NhbGUoIGxheW91dEJvdW5kczogQm91bmRzMiwgdmlld0JvdW5kczogQm91bmRzMiApOiBudW1iZXIge1xuICAgIHJldHVybiBNYXRoLm1pbiggdmlld0JvdW5kcy53aWR0aCAvIGxheW91dEJvdW5kcy53aWR0aCwgdmlld0JvdW5kcy5oZWlnaHQgLyBsYXlvdXRCb3VuZHMuaGVpZ2h0ICk7XG4gIH1cblxuICBwdWJsaWMgc3RhdGljIGdldExheW91dE1hdHJpeCggbGF5b3V0Qm91bmRzOiBCb3VuZHMyLCB2aWV3Qm91bmRzOiBCb3VuZHMyLCBwcm92aWRlZE9wdGlvbnM/OiBHZXRMYXlvdXRNYXRyaXhPcHRpb25zICk6IE1hdHJpeDMge1xuXG4gICAgY29uc3Qgb3B0aW9ucyA9IG9wdGlvbml6ZTxHZXRMYXlvdXRNYXRyaXhPcHRpb25zPigpKCB7XG4gICAgICB2ZXJ0aWNhbEFsaWduOiAnY2VudGVyJyAvLyAnY2VudGVyJyBvciAnYm90dG9tJ1xuICAgIH0sIHByb3ZpZGVkT3B0aW9ucyApO1xuXG4gICAgY29uc3Qgd2lkdGggPSB2aWV3Qm91bmRzLndpZHRoO1xuICAgIGNvbnN0IGhlaWdodCA9IHZpZXdCb3VuZHMuaGVpZ2h0O1xuICAgIGNvbnN0IHNjYWxlID0gU2NyZWVuVmlldy5nZXRMYXlvdXRTY2FsZSggbGF5b3V0Qm91bmRzLCB2aWV3Qm91bmRzICk7XG5cbiAgICBsZXQgZHggPSAwO1xuICAgIGxldCBkeSA9IDA7XG5cbiAgICBpZiAoIHNjYWxlID09PSB3aWR0aCAvIGxheW91dEJvdW5kcy53aWR0aCApIHtcblxuICAgICAgLy8gdmVydGljYWxseSBmbG9hdCB0byBib3R0b21cbiAgICAgIGR5ID0gKCBoZWlnaHQgLyBzY2FsZSAtIGxheW91dEJvdW5kcy5oZWlnaHQgKTtcblxuICAgICAgLy8gY2VudGVyIHZlcnRpY2FsbHlcbiAgICAgIGlmICggb3B0aW9ucy52ZXJ0aWNhbEFsaWduID09PSAnY2VudGVyJyApIHtcbiAgICAgICAgZHkgLz0gMjtcbiAgICAgIH1cbiAgICB9XG4gICAgZWxzZSBpZiAoIHNjYWxlID09PSBoZWlnaHQgLyBsYXlvdXRCb3VuZHMuaGVpZ2h0ICkge1xuXG4gICAgICAvLyBjZW50ZXIgaG9yaXpvbnRhbGx5XG4gICAgICBkeCA9ICggd2lkdGggLyBzY2FsZSAtIGxheW91dEJvdW5kcy53aWR0aCApIC8gMjtcbiAgICB9XG5cbiAgICByZXR1cm4gTWF0cml4My5yb3dNYWpvcihcbiAgICAgIHNjYWxlLCAwLCBkeCAqIHNjYWxlICsgdmlld0JvdW5kcy5sZWZ0LFxuICAgICAgMCwgc2NhbGUsIGR5ICogc2NhbGUgKyB2aWV3Qm91bmRzLnRvcCxcbiAgICAgIDAsIDAsIDFcbiAgICApO1xuICB9XG5cbiAgLy8gTm9vcHMgZm9yIGNvbnNpc3RlbnQgQVBJXG4gIHB1YmxpYyBzdGVwKCBkdDogbnVtYmVyICk6IHZvaWQge1xuICAgIC8vIFNlZSBzdWJjbGFzcyBmb3IgaW1wbGVtZW50YXRpb25cbiAgfVxufVxuXG5qb2lzdC5yZWdpc3RlciggJ1NjcmVlblZpZXcnLCBTY3JlZW5WaWV3ICk7XG5leHBvcnQgZGVmYXVsdCBTY3JlZW5WaWV3OyJdLCJuYW1lcyI6WyJQcm9wZXJ0eSIsIkJvdW5kczIiLCJNYXRyaXgzIiwib3B0aW9uaXplIiwiQ29udHJvbEFyZWFOb2RlIiwiUGxheUFyZWFOb2RlIiwiU2NyZWVuU3VtbWFyeU5vZGUiLCJOb2RlIiwiVGFuZGVtIiwiam9pc3QiLCJERUZBVUxUX0xBWU9VVF9CT1VORFMiLCJTY3JlZW5WaWV3Iiwic2V0UERPTU9yZGVyIiwicGRvbU9yZGVyIiwiRXJyb3IiLCJzZXRDaGlsZHJlbiIsImNoaWxkcmVuIiwicHJvdG90eXBlIiwiY2FsbCIsInBkb21QYXJlbnROb2RlIiwiaGFzQ2hpbGQiLCJhZGRDaGlsZCIsIm1vdmVUb0JhY2siLCJnZXRMYXlvdXRTY2FsZSIsInZpZXdCb3VuZHMiLCJsYXlvdXRCb3VuZHMiLCJsYXlvdXQiLCJsYXlvdXRNYXRyaXhPcHRpb25zIiwibWF0cml4IiwiZ2V0TGF5b3V0TWF0cml4IiwidmlzaWJsZUJvdW5kc1Byb3BlcnR5IiwidmFsdWUiLCJwYXJlbnRUb0xvY2FsQm91bmRzIiwic2NyZWVuU3VtbWFyeUNvbnRlbnQiLCJfc2NyZWVuU3VtbWFyeUNvbnRlbnQiLCJub2RlIiwic2V0U2NyZWVuU3VtbWFyeUNvbnRlbnQiLCJhc3NlcnQiLCJwZG9tU2NyZWVuU3VtbWFyeU5vZGUiLCJyZW1vdmVDaGlsZCIsInNldFNjcmVlblN1bW1hcnlJbnRyb0FuZFRpdGxlIiwic2ltTmFtZSIsInNjcmVlbkRpc3BsYXlOYW1lIiwic2ltVGl0bGUiLCJpc011bHRpU2NyZWVuIiwic2V0SW50cm9TdHJpbmciLCJwZG9tVGl0bGVOb2RlIiwiaW5uZXJDb250ZW50IiwiZ2V0Vm9pY2luZ092ZXJ2aWV3Q29udGVudCIsImdldFZvaWNpbmdEZXRhaWxzQ29udGVudCIsImdldFZvaWNpbmdIaW50Q29udGVudCIsImludGVycnVwdFN1YnRyZWVJbnB1dCIsIndpbmRvdyIsInBoZXQiLCJkaXNwbGF5IiwiaW50ZXJydXB0T3RoZXJQb2ludGVycyIsIk1hdGgiLCJtaW4iLCJ3aWR0aCIsImhlaWdodCIsInByb3ZpZGVkT3B0aW9ucyIsIm9wdGlvbnMiLCJ2ZXJ0aWNhbEFsaWduIiwic2NhbGUiLCJkeCIsImR5Iiwicm93TWFqb3IiLCJsZWZ0IiwidG9wIiwic3RlcCIsImR0IiwiY29weSIsImxheWVyU3BsaXQiLCJleGNsdWRlSW52aXNpYmxlIiwidGFuZGVtIiwiUkVRVUlSRUQiLCJ2aXNpYmxlUHJvcGVydHlPcHRpb25zIiwicGhldGlvU3RhdGUiLCJwaGV0aW9SZWFkT25seSIsImNvbnRhaW5lclRhZ05hbWUiLCJ0YWdOYW1lIiwiaW5jbHVkZVBET01Ob2RlcyIsImlzUGhldGlvSW5zdHJ1bWVudGVkIiwibmFtZSIsImZvY3VzSGlnaGxpZ2h0IiwicGRvbVBsYXlBcmVhTm9kZSIsInBkb21Db250cm9sQXJlYU5vZGUiLCJ2aXNpYmxlUHJvcGVydHkiLCJsYXp5TGluayIsInZpc2libGUiLCJmb2N1c2FibGUiLCJmb2N1cyIsImFkZElucHV0TGlzdGVuZXIiLCJibHVyIiwicmVnaXN0ZXIiXSwibWFwcGluZ3MiOiJBQUFBLHNEQUFzRDtB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