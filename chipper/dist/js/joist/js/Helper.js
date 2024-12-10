// Copyright 2022-2024, University of Colorado Boulder
/**
 * Some in-simulation utilities designed to help designers and developers
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
    try {
        var info = gen[key](arg);
        var value = info.value;
    } catch (error) {
        reject(error);
        return;
    }
    if (info.done) {
        resolve(value);
    } else {
        Promise.resolve(value).then(_next, _throw);
    }
}
function _async_to_generator(fn) {
    return function() {
        var self = this, args = arguments;
        return new Promise(function(resolve, reject) {
            var gen = fn.apply(self, args);
            function _next(value) {
                asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value);
            }
            function _throw(err) {
                asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err);
            }
            _next(undefined);
        });
    };
}
import animationFrameTimer from '../../axon/js/animationFrameTimer.js';
import BooleanProperty from '../../axon/js/BooleanProperty.js';
import { default as createObservableArray } from '../../axon/js/createObservableArray.js';
import DerivedProperty from '../../axon/js/DerivedProperty.js';
import EnumerationProperty from '../../axon/js/EnumerationProperty.js';
import MappedProperty from '../../axon/js/MappedProperty.js';
import Multilink from '../../axon/js/Multilink.js';
import TinyProperty from '../../axon/js/TinyProperty.js';
import { isTReadOnlyProperty } from '../../axon/js/TReadOnlyProperty.js';
import Bounds2 from '../../dot/js/Bounds2.js';
import Utils from '../../dot/js/Utils.js';
import Vector2 from '../../dot/js/Vector2.js';
import { Shape } from '../../kite/js/imports.js';
import Enumeration from '../../phet-core/js/Enumeration.js';
import EnumerationValue from '../../phet-core/js/EnumerationValue.js';
import inheritance from '../../phet-core/js/inheritance.js';
import merge from '../../phet-core/js/merge.js';
import optionize from '../../phet-core/js/optionize.js';
import MeasuringTapeNode from '../../scenery-phet/js/MeasuringTapeNode.js';
import PhetFont from '../../scenery-phet/js/PhetFont.js';
import { CanvasNode, Circle, Color, Display, DOM, DragListener, extendsHeightSizable, extendsWidthSizable, FireListener, FlowBox, Font, GridBox, HBox, HSeparator, Image, LayoutNode, Line, LinearGradient, Node, NodePattern, Paint, Path, Pattern, PressListener, RadialGradient, Rectangle, RichText, Spacer, Text, Trail, VBox, WebGLNode } from '../../scenery/js/imports.js';
import AquaRadioButtonGroup from '../../sun/js/AquaRadioButtonGroup.js';
import RectangularPushButton from '../../sun/js/buttons/RectangularPushButton.js';
import Checkbox from '../../sun/js/Checkbox.js';
import ExpandCollapseButton from '../../sun/js/ExpandCollapseButton.js';
import Panel from '../../sun/js/Panel.js';
import Tandem from '../../tandem/js/Tandem.js';
import joist from './joist.js';
const round = (n, places = 2)=>Utils.toFixed(n, places);
let PointerAreaType = class PointerAreaType extends EnumerationValue {
};
PointerAreaType.MOUSE = new PointerAreaType();
PointerAreaType.TOUCH = new PointerAreaType();
PointerAreaType.NONE = new PointerAreaType();
PointerAreaType.enumeration = new Enumeration(PointerAreaType);
const hasHelperNode = (node)=>{
    return !!node.getHelperNode;
};
let Helper = class Helper {
    static initialize(sim, simDisplay) {
        // Ctrl + shift + H (will open the helper)
        document.addEventListener('keydown', (event)=>{
            if (event.ctrlKey && event.key === 'H') {
                // Lazy creation
                if (!Helper.helper) {
                    Helper.helper = new Helper(sim, simDisplay);
                }
                Helper.helper.activeProperty.value = !Helper.helper.activeProperty.value;
            }
        });
    }
    constructor(sim, simDisplay){
        // NOTE: Don't pause the sim, don't use foreign object rasterization (do the smarter instant approach)
        // NOTE: Inform about preserveDrawingBuffer query parameter
        // NOTE: Actually grab/rerender things from WebGL/Canvas, so this works nicely and at a higher resolution
        // NOTE: Scenery drawable tree
        this.sim = sim;
        this.simDisplay = simDisplay;
        this.activeProperty = new TinyProperty(false);
        this.visualTreeVisibleProperty = new BooleanProperty(false, {
            tandem: Tandem.OPT_OUT
        });
        this.pdomTreeVisibleProperty = new BooleanProperty(false, {
            tandem: Tandem.OPT_OUT
        });
        this.underPointerVisibleProperty = new BooleanProperty(true, {
            tandem: Tandem.OPT_OUT
        });
        this.optionsVisibleProperty = new BooleanProperty(true, {
            tandem: Tandem.OPT_OUT
        });
        this.previewVisibleProperty = new BooleanProperty(false, {
            tandem: Tandem.OPT_OUT
        });
        this.selectedNodeContentVisibleProperty = new BooleanProperty(true, {
            tandem: Tandem.OPT_OUT
        });
        this.selectedTrailContentVisibleProperty = new BooleanProperty(true, {
            tandem: Tandem.OPT_OUT
        });
        this.highlightVisibleProperty = new BooleanProperty(true, {
            tandem: Tandem.OPT_OUT
        });
        this.boundsVisibleProperty = new BooleanProperty(true, {
            tandem: Tandem.OPT_OUT
        });
        this.selfBoundsVisibleProperty = new BooleanProperty(false, {
            tandem: Tandem.OPT_OUT
        });
        this.getHelperNodeVisibleProperty = new BooleanProperty(true, {
            tandem: Tandem.OPT_OUT
        });
        this.helperVisibleProperty = new BooleanProperty(true, {
            tandem: Tandem.OPT_OUT
        });
        this.inputBasedPickingProperty = new BooleanProperty(true, {
            tandem: Tandem.OPT_OUT
        });
        this.useLeafNodeProperty = new BooleanProperty(false, {
            tandem: Tandem.OPT_OUT
        });
        this.pointerAreaTypeProperty = new EnumerationProperty(PointerAreaType.MOUSE, {
            tandem: Tandem.OPT_OUT
        });
        this.pointerPositionProperty = new TinyProperty(Vector2.ZERO);
        this.overInterfaceProperty = new BooleanProperty(false, {
            tandem: Tandem.OPT_OUT
        });
        this.selectedTrailProperty = new TinyProperty(null);
        this.treeHoverTrailProperty = new TinyProperty(null);
        this.pointerTrailProperty = new DerivedProperty([
            this.pointerPositionProperty,
            this.overInterfaceProperty,
            this.pointerAreaTypeProperty,
            this.inputBasedPickingProperty
        ], (point, overInterface, pointerAreaType, inputBasedPicking)=>{
            // We're not over something while we're over an interface
            if (overInterface) {
                return null;
            }
            if (!inputBasedPicking) {
                return visualHitTest(simDisplay.rootNode, point);
            }
            let trail = simDisplay.rootNode.hitTest(point, pointerAreaType === PointerAreaType.MOUSE, pointerAreaType === PointerAreaType.TOUCH);
            if (trail && !this.useLeafNodeProperty.value) {
                while(trail.length > 0 && trail.lastNode().inputListeners.length === 0){
                    trail.removeDescendant();
                }
                if (trail.length === 0) {
                    trail = null;
                } else {
                    // Repsect TargetNode to be helpful
                    const listeners = trail.lastNode().inputListeners;
                    const firstListener = listeners[0];
                    if (firstListener instanceof PressListener && firstListener.targetNode && firstListener.targetNode !== trail.lastNode() && trail.containsNode(firstListener.targetNode)) {
                        trail = trail.subtrailTo(firstListener.targetNode);
                    }
                }
            }
            return trail;
        }, {
            tandem: Tandem.OPT_OUT,
            valueComparisonStrategy: 'equalsFunction'
        });
        this.previewTrailProperty = new DerivedProperty([
            this.selectedTrailProperty,
            this.treeHoverTrailProperty,
            this.pointerTrailProperty
        ], (selected, treeHover, active)=>{
            return selected ? selected : treeHover ? treeHover : active;
        });
        this.previewShapeProperty = new DerivedProperty([
            this.previewTrailProperty,
            this.inputBasedPickingProperty,
            this.pointerAreaTypeProperty
        ], (previewTrail, inputBasedPicking, pointerAreaType)=>{
            if (previewTrail) {
                if (inputBasedPicking) {
                    return getShape(previewTrail, pointerAreaType === PointerAreaType.MOUSE, pointerAreaType === PointerAreaType.TOUCH);
                } else {
                    return getShape(previewTrail, false, false);
                }
            } else {
                return null;
            }
        });
        this.helperNodeProperty = new DerivedProperty([
            this.selectedTrailProperty
        ], (trail)=>{
            if (trail) {
                const node = trail.lastNode();
                if (hasHelperNode(node)) {
                    return node.getHelperNode();
                } else {
                    return null;
                }
            } else {
                return null;
            }
        });
        this.screenViewProperty = new TinyProperty(null);
        this.imageDataProperty = new TinyProperty(null);
        this.colorProperty = new DerivedProperty([
            this.pointerPositionProperty,
            this.imageDataProperty
        ], (position, imageData)=>{
            if (!imageData) {
                return Color.TRANSPARENT;
            }
            const x = Math.floor(position.x / this.simDisplay.width * imageData.width);
            const y = Math.floor(position.y / this.simDisplay.height * imageData.height);
            const index = 4 * (x + imageData.width * y);
            if (x < 0 || y < 0 || x > imageData.width || y > imageData.height) {
                return Color.TRANSPARENT;
            }
            return new Color(imageData.data[index], imageData.data[index + 1], imageData.data[index + 2], imageData.data[index + 3] / 255);
        }, {
            tandem: Tandem.OPT_OUT
        });
        const fuzzProperty = new BooleanProperty(phet.chipper.queryParameters.fuzz, {
            tandem: Tandem.OPT_OUT
        });
        fuzzProperty.lazyLink((fuzz)=>{
            phet.chipper.queryParameters.fuzz = fuzz;
        });
        const measuringTapeVisibleProperty = new BooleanProperty(false, {
            tandem: Tandem.OPT_OUT
        });
        const measuringTapeUnitsProperty = new TinyProperty({
            name: 'view units',
            multiplier: 0
        });
        const layoutBoundsProperty = new TinyProperty(Bounds2.NOTHING);
        const helperRoot = new Node({
            renderer: 'svg'
        });
        const positionStringProperty = new MappedProperty(this.pointerPositionProperty, {
            tandem: Tandem.OPT_OUT,
            bidirectional: true,
            map: (position)=>{
                const view = this.screenViewProperty.value;
                if (view) {
                    const viewPosition = view.globalToLocalPoint(position);
                    return `global: x: ${round(position.x)}, y: ${round(position.y)}<br>view: x: ${round(viewPosition.x)}, y: ${round(viewPosition.y)}`;
                } else {
                    return '-';
                }
            }
        });
        const positionText = new RichText(positionStringProperty, {
            font: new PhetFont(12)
        });
        const colorTextMap = (color)=>{
            return `${color.toHexString()} ${color.toCSS()}`;
        };
        const colorStringProperty = new MappedProperty(this.colorProperty, {
            tandem: Tandem.OPT_OUT,
            bidirectional: true,
            map: colorTextMap
        });
        const colorText = new RichText(colorStringProperty, {
            font: new PhetFont(12)
        });
        this.colorProperty.link((color)=>{
            colorText.fill = Color.getLuminance(color) > 128 ? Color.BLACK : Color.WHITE;
        });
        const boundsColor = new Color('#804000');
        const selfBoundsColor = new Color('#208020');
        const nonInputBasedColor = new Color(255, 100, 0);
        const mouseColor = new Color(0, 0, 255);
        const touchColor = new Color(255, 0, 0);
        const inputBasedColor = new Color(200, 0, 200);
        const highlightBaseColorProperty = new DerivedProperty([
            this.inputBasedPickingProperty,
            this.pointerAreaTypeProperty
        ], (inputBasedPicking, pointerAreaType)=>{
            if (inputBasedPicking) {
                if (pointerAreaType === PointerAreaType.MOUSE) {
                    return mouseColor;
                } else if (pointerAreaType === PointerAreaType.TOUCH) {
                    return touchColor;
                } else {
                    return inputBasedColor;
                }
            } else {
                return nonInputBasedColor;
            }
        }, {
            tandem: Tandem.OPT_OUT
        });
        const colorBackground = new Panel(colorText, {
            cornerRadius: 0,
            stroke: null,
            fill: this.colorProperty
        });
        const previewNode = new Node({
            visibleProperty: this.previewVisibleProperty
        });
        const previewBackground = new Rectangle(0, 0, 200, 200, {
            fill: new NodePattern(new Node({
                children: [
                    new Rectangle(0, 0, 10, 10, {
                        fill: '#ddd'
                    }),
                    new Rectangle(10, 10, 10, 10, {
                        fill: '#ddd'
                    }),
                    new Rectangle(0, 10, 10, 10, {
                        fill: '#fafafa'
                    }),
                    new Rectangle(10, 0, 10, 10, {
                        fill: '#fafafa'
                    })
                ]
            }), 2, 0, 0, 20, 20),
            stroke: 'black',
            visibleProperty: this.previewVisibleProperty
        });
        this.previewTrailProperty.link((trail)=>{
            previewNode.removeAllChildren();
            if (trail) {
                previewNode.addChild(previewBackground);
                const node = trail.lastNode();
                if (node.bounds.isValid()) {
                    const scale = window.devicePixelRatio * 0.9 * Math.min(previewBackground.selfBounds.width / node.width, previewBackground.selfBounds.height / node.height);
                    previewNode.addChild(new Node({
                        scale: scale / window.devicePixelRatio,
                        center: previewBackground.center,
                        children: [
                            node.rasterized({
                                resolution: scale,
                                sourceBounds: node.bounds.dilated(node.bounds.width * 0.01).roundedOut()
                            })
                        ]
                    }));
                }
            }
        });
        const selectedNodeContent = new VBox({
            spacing: 3,
            align: 'left',
            visibleProperty: this.selectedNodeContentVisibleProperty
        });
        this.previewTrailProperty.link((trail)=>{
            selectedNodeContent.children = trail ? createInfo(trail) : [];
        });
        const fuzzCheckbox = new HelperCheckbox(fuzzProperty, 'Fuzz');
        const measuringTapeVisibleCheckbox = new HelperCheckbox(measuringTapeVisibleProperty, 'Measuring Tape');
        const visualTreeVisibleCheckbox = new HelperCheckbox(this.visualTreeVisibleProperty, 'Visual Tree');
        const pdomTreeVisibleCheckbox = new HelperCheckbox(this.pdomTreeVisibleProperty, 'PDOM Tree');
        const inputBasedPickingCheckbox = new HelperCheckbox(this.inputBasedPickingProperty, 'Input-based');
        const useLeafNodeCheckbox = new HelperCheckbox(this.useLeafNodeProperty, 'Use Leaf', {
            enabledProperty: this.inputBasedPickingProperty
        });
        const highlightVisibleCheckbox = new HelperCheckbox(this.highlightVisibleProperty, 'Highlight', {
            labelOptions: {
                fill: highlightBaseColorProperty
            }
        });
        const boundsVisibleCheckbox = new HelperCheckbox(this.boundsVisibleProperty, 'Bounds', {
            labelOptions: {
                fill: boundsColor
            }
        });
        const selfBoundsVisibleCheckbox = new HelperCheckbox(this.selfBoundsVisibleProperty, 'Self Bounds', {
            labelOptions: {
                fill: selfBoundsColor
            }
        });
        const getHelperNodeVisibleCheckbox = new HelperCheckbox(this.getHelperNodeVisibleProperty, 'getHelperNode()');
        const pointerAreaTypeRadioButtonGroup = new AquaRadioButtonGroup(this.pointerAreaTypeProperty, [
            {
                value: PointerAreaType.MOUSE,
                createNode: (tandem)=>new Text('Mouse', {
                        fontSize: 12
                    })
            },
            {
                value: PointerAreaType.TOUCH,
                createNode: (tandem)=>new Text('Touch', {
                        fontSize: 12
                    })
            },
            {
                value: PointerAreaType.NONE,
                createNode: (tandem)=>new Text('None', {
                        fontSize: 12
                    })
            }
        ], {
            orientation: 'horizontal',
            enabledProperty: this.inputBasedPickingProperty,
            radioButtonOptions: {
                xSpacing: 3
            },
            spacing: 10,
            tandem: Tandem.OPT_OUT
        });
        const selectedTrailContent = new VBox({
            align: 'left',
            visibleProperty: this.selectedTrailContentVisibleProperty
        });
        this.previewTrailProperty.link((trail)=>{
            selectedTrailContent.children = [];
            if (trail) {
                trail.nodes.slice().forEach((node, index)=>{
                    selectedTrailContent.addChild(new RichText(`${index > 0 ? trail.nodes[index - 1].children.indexOf(node) : '-'} ${node.constructor.name}`, {
                        font: new PhetFont(12),
                        fill: index === trail.nodes.length - 1 ? 'black' : '#bbb',
                        layoutOptions: {
                            leftMargin: index * 10
                        },
                        cursor: 'pointer',
                        inputListeners: [
                            new FireListener({
                                fire: ()=>{
                                    this.selectedTrailProperty.value = trail.subtrailTo(node);
                                    focusSelected();
                                },
                                tandem: Tandem.OPT_OUT
                            })
                        ]
                    }));
                });
                trail.lastNode().children.forEach((node, index)=>{
                    selectedTrailContent.addChild(new RichText(`${trail.lastNode().children.indexOf(node)} ${node.constructor.name}`, {
                        font: new PhetFont(12),
                        fill: '#88f',
                        layoutOptions: {
                            leftMargin: trail.nodes.length * 10
                        },
                        cursor: 'pointer',
                        inputListeners: [
                            new FireListener({
                                fire: ()=>{
                                    this.selectedTrailProperty.value = trail.copy().addDescendant(node, index);
                                    focusSelected();
                                },
                                tandem: Tandem.OPT_OUT
                            })
                        ]
                    }));
                });
                // Visibility check
                if (!trail.isVisible()) {
                    selectedTrailContent.addChild(new Text('invisible', {
                        fill: '#60a',
                        fontSize: 12
                    }));
                }
                if (trail.getOpacity() !== 1) {
                    selectedTrailContent.addChild(new Text(`opacity: ${trail.getOpacity()}`, {
                        fill: '#888',
                        fontSize: 12
                    }));
                }
                const hasPickableFalseEquivalent = _.some(trail.nodes, (node)=>{
                    return node.pickable === false || !node.visible;
                });
                const hasPickableTrueEquivalent = _.some(trail.nodes, (node)=>{
                    return node.inputListeners.length > 0 || node.pickable === true;
                });
                if (!hasPickableFalseEquivalent && hasPickableTrueEquivalent) {
                    selectedTrailContent.addChild(new Text('Hit Tested', {
                        fill: '#f00',
                        fontSize: 12
                    }));
                }
                if (!trail.getMatrix().isIdentity()) {
                    // Why is this wrapper node needed?
                    selectedTrailContent.addChild(new Node({
                        children: [
                            new Matrix3Node(trail.getMatrix())
                        ]
                    }));
                }
            }
        });
        const visualTreeNode = new TreeNode(this.visualTreeVisibleProperty, this, ()=>new VisualTreeNode(new Trail(simDisplay.rootNode), this));
        const pdomTreeNode = new TreeNode(this.pdomTreeVisibleProperty, this, ()=>new PDOMTreeNode(simDisplay._rootPDOMInstance, this));
        const focusSelected = ()=>{
            visualTreeNode.focusSelected();
            pdomTreeNode.focusSelected();
        };
        const boundsPath = new Path(null, {
            visibleProperty: this.boundsVisibleProperty,
            stroke: boundsColor,
            fill: boundsColor.withAlpha(0.1),
            lineDash: [
                2,
                2
            ],
            lineDashOffset: 2
        });
        this.previewTrailProperty.link((trail)=>{
            if (trail && trail.lastNode().localBounds.isValid()) {
                boundsPath.shape = Shape.bounds(trail.lastNode().localBounds).transformed(trail.getMatrix());
            } else {
                boundsPath.shape = null;
            }
        });
        const selfBoundsPath = new Path(null, {
            visibleProperty: this.selfBoundsVisibleProperty,
            stroke: selfBoundsColor,
            fill: selfBoundsColor.withAlpha(0.1),
            lineDash: [
                2,
                2
            ],
            lineDashOffset: 1
        });
        this.previewTrailProperty.link((trail)=>{
            if (trail && trail.lastNode().selfBounds.isValid()) {
                selfBoundsPath.shape = Shape.bounds(trail.lastNode().selfBounds).transformed(trail.getMatrix());
            } else {
                selfBoundsPath.shape = null;
            }
        });
        const highlightFillProperty = new DerivedProperty([
            highlightBaseColorProperty
        ], (color)=>color.withAlpha(0.2), {
            tandem: Tandem.OPT_OUT
        });
        const highlightPath = new Path(null, {
            stroke: highlightBaseColorProperty,
            lineDash: [
                2,
                2
            ],
            fill: highlightFillProperty,
            visibleProperty: this.highlightVisibleProperty
        });
        this.previewShapeProperty.link((shape)=>{
            highlightPath.shape = shape;
        });
        const helperNodeContainer = new Node({
            visibleProperty: this.getHelperNodeVisibleProperty
        });
        this.selectedTrailProperty.link((trail)=>{
            if (trail) {
                helperNodeContainer.matrix = trail.getMatrix();
            }
        });
        this.helperNodeProperty.link((node)=>{
            helperNodeContainer.removeAllChildren();
            if (node) {
                helperNodeContainer.addChild(node);
            }
        });
        // this.inputBasedPickingProperty = new BooleanProperty( true, { tandem: Tandem.OPT_OUT } );
        // this.useLeafNodeProperty = new BooleanProperty( false, { tandem: Tandem.OPT_OUT } );
        // this.pointerAreaTypeProperty = new EnumerationProperty( PointerAreaType.MOUSE, { tandem: Tandem.OPT_OUT } );
        helperRoot.addChild(boundsPath);
        helperRoot.addChild(selfBoundsPath);
        helperRoot.addChild(highlightPath);
        const backgroundNode = new Node();
        backgroundNode.addInputListener(new PressListener({
            press: ()=>{
                this.selectedTrailProperty.value = this.pointerTrailProperty.value;
                focusSelected();
            },
            tandem: Tandem.OPT_OUT
        }));
        helperRoot.addChild(backgroundNode);
        helperRoot.addChild(helperNodeContainer);
        const underPointerNode = new FlowBox({
            orientation: 'vertical',
            spacing: 5,
            align: 'left',
            children: [
                positionText,
                colorBackground
            ],
            visibleProperty: this.underPointerVisibleProperty
        });
        const optionsNode = new VBox({
            spacing: 3,
            align: 'left',
            children: [
                createHeaderText('Tools'),
                new VBox({
                    spacing: 3,
                    align: 'left',
                    children: [
                        new HBox({
                            spacing: 10,
                            children: [
                                fuzzCheckbox,
                                measuringTapeVisibleCheckbox
                            ]
                        }),
                        new HBox({
                            spacing: 10,
                            children: [
                                visualTreeVisibleCheckbox,
                                ...simDisplay._accessible ? [
                                    pdomTreeVisibleCheckbox
                                ] : []
                            ]
                        })
                    ]
                }),
                createHeaderText('Picking', undefined, {
                    layoutOptions: {
                        topMargin: 3
                    }
                }),
                new VBox({
                    spacing: 3,
                    align: 'left',
                    children: [
                        new HBox({
                            spacing: 10,
                            children: [
                                inputBasedPickingCheckbox,
                                useLeafNodeCheckbox
                            ]
                        }),
                        pointerAreaTypeRadioButtonGroup
                    ]
                }),
                createHeaderText('Show', undefined, {
                    layoutOptions: {
                        topMargin: 3
                    }
                }),
                new VBox({
                    spacing: 3,
                    align: 'left',
                    children: [
                        new HBox({
                            spacing: 10,
                            children: [
                                highlightVisibleCheckbox,
                                getHelperNodeVisibleCheckbox
                            ]
                        }),
                        new HBox({
                            spacing: 10,
                            children: [
                                boundsVisibleCheckbox,
                                selfBoundsVisibleCheckbox
                            ]
                        })
                    ]
                })
            ],
            visibleProperty: this.optionsVisibleProperty
        });
        const helperReadoutContent = new VBox({
            spacing: 5,
            align: 'left',
            children: [
                createCollapsibleHeaderText('Under Pointer', this.underPointerVisibleProperty, underPointerNode, {
                    layoutOptions: {
                        topMargin: 0
                    }
                }),
                underPointerNode,
                createCollapsibleHeaderText('Options', this.optionsVisibleProperty, optionsNode),
                optionsNode,
                createCollapsibleHeaderText('Preview', this.previewVisibleProperty, previewNode),
                previewNode,
                createCollapsibleHeaderText('Selected Trail', this.selectedTrailContentVisibleProperty, selectedTrailContent),
                selectedTrailContent,
                createCollapsibleHeaderText('Selected Node', this.selectedNodeContentVisibleProperty, selectedNodeContent),
                selectedNodeContent
            ],
            visibleProperty: this.helperVisibleProperty
        });
        const helperReadoutCollapsible = new VBox({
            spacing: 5,
            align: 'left',
            children: [
                createCollapsibleHeaderText('Helper', this.helperVisibleProperty, helperReadoutContent),
                new HSeparator(),
                helperReadoutContent
            ]
        });
        const helperReadoutPanel = new Panel(helperReadoutCollapsible, {
            fill: 'rgba(255,255,255,0.85)',
            stroke: 'rgba(0,0,0,0.85)',
            cornerRadius: 0
        });
        helperReadoutPanel.addInputListener(new DragListener({
            translateNode: true,
            targetNode: helperReadoutPanel,
            tandem: Tandem.OPT_OUT
        }));
        // Allow scrolling to scroll the panel's position
        helperReadoutPanel.addInputListener({
            wheel: (event)=>{
                const deltaY = event.domEvent.deltaY;
                const multiplier = 1;
                helperReadoutPanel.y -= deltaY * multiplier;
            }
        });
        helperRoot.addChild(helperReadoutPanel);
        helperRoot.addChild(visualTreeNode);
        helperRoot.addChild(pdomTreeNode);
        const measuringTapeNode = new MeasuringTapeNode(measuringTapeUnitsProperty, {
            tandem: Tandem.OPT_OUT,
            visibleProperty: measuringTapeVisibleProperty,
            textBackgroundColor: 'rgba(0,0,0,0.5)'
        });
        measuringTapeNode.basePositionProperty.value = new Vector2(100, 300);
        measuringTapeNode.tipPositionProperty.value = new Vector2(200, 300);
        helperRoot.addChild(measuringTapeNode);
        const resizeListener = (size)=>{
            this.helperDisplay.width = size.width;
            this.helperDisplay.height = size.height;
            layoutBoundsProperty.value = layoutBoundsProperty.value.withMaxX(size.width).withMaxY(size.height);
            backgroundNode.mouseArea = new Bounds2(0, 0, size.width, size.height);
            backgroundNode.touchArea = new Bounds2(0, 0, size.width, size.height);
            visualTreeNode.resize(size);
            pdomTreeNode.resize(size);
        };
        const frameListener = (dt)=>{
            var _this_helperDisplay;
            this.overInterfaceProperty.value = helperReadoutPanel.bounds.containsPoint(this.pointerPositionProperty.value) || this.visualTreeVisibleProperty.value && visualTreeNode.bounds.containsPoint(this.pointerPositionProperty.value) || this.pdomTreeVisibleProperty.value && pdomTreeNode.bounds.containsPoint(this.pointerPositionProperty.value) || helperNodeContainer.containsPoint(this.pointerPositionProperty.value);
            (_this_helperDisplay = this.helperDisplay) == null ? void 0 : _this_helperDisplay.updateDisplay();
        };
        document.addEventListener('keyup', (event)=>{
            if (event.key === 'Escape') {
                this.selectedTrailProperty.value = null;
            }
        });
        this.activeProperty.lazyLink((active)=>{
            if (active) {
                sim.activeProperty.value = false;
                const screen = sim.selectedScreenProperty.value;
                if (screen.hasView()) {
                    this.screenViewProperty.value = screen.view;
                } else {
                    this.screenViewProperty.value = null;
                }
                this.helperDisplay = new Display(helperRoot, {
                    assumeFullWindow: true
                });
                this.helperDisplay.initializeEvents();
                sim.dimensionProperty.link(resizeListener);
                animationFrameTimer.addListener(frameListener);
                document.body.appendChild(this.helperDisplay.domElement);
                this.helperDisplay.domElement.style.zIndex = '10000';
                const onLocationEvent = (event)=>{
                    this.pointerPositionProperty.value = event.pointer.point;
                };
                this.helperDisplay.addInputListener({
                    move: onLocationEvent,
                    down: onLocationEvent,
                    up: onLocationEvent
                });
                if (this.screenViewProperty.value) {
                    measuringTapeUnitsProperty.value = {
                        name: 'view units',
                        multiplier: this.screenViewProperty.value.getGlobalToLocalMatrix().getScaleVector().x
                    };
                }
                this.simDisplay.foreignObjectRasterization((dataURI)=>{
                    if (dataURI) {
                        const image = document.createElement('img');
                        image.addEventListener('load', ()=>{
                            const width = image.width;
                            const height = image.height;
                            const canvas = document.createElement('canvas');
                            const context = canvas.getContext('2d');
                            canvas.width = width;
                            canvas.height = height;
                            context.drawImage(image, 0, 0);
                            if (this.activeProperty.value) {
                                this.imageDataProperty.value = context.getImageData(0, 0, width, height);
                            }
                        });
                        image.src = dataURI;
                    } else {
                        console.log('Could not load foreign object rasterization');
                    }
                });
            } else {
                sim.dimensionProperty.unlink(resizeListener);
                animationFrameTimer.removeListener(frameListener);
                document.body.removeChild(this.helperDisplay.domElement);
                this.helperDisplay.dispose();
                // Unpause the simulation
                sim.activeProperty.value = true;
                // Clear imageData since it won't be accurate when we re-open
                this.imageDataProperty.value = null;
                // Hide the tree when closing, so it starts up quickly
                this.visualTreeVisibleProperty.value = false;
            }
        });
    }
};
export { Helper as default };
joist.register('Helper', Helper);
let HelperCheckbox = class HelperCheckbox extends Checkbox {
    constructor(property, label, providedOptions){
        const options = optionize()({
            tandem: Tandem.OPT_OUT,
            boxWidth: 14,
            labelOptions: {
                font: new PhetFont(12)
            }
        }, providedOptions);
        super(property, new RichText(label, options.labelOptions), options);
    }
};
let CollapsibleTreeNode = class CollapsibleTreeNode extends Node {
    expand() {
        this.expandedProperty.value = true;
    }
    collapse() {
        this.expandedProperty.value = false;
    }
    expandRecusively() {
        this.expandedProperty.value = true;
        this.childTreeNodes.forEach((treeNode)=>{
            treeNode.expandRecusively();
        });
    }
    collapseRecursively() {
        this.expandedProperty.value = false;
        this.childTreeNodes.forEach((treeNode)=>{
            treeNode.collapseRecursively();
        });
    }
    constructor(selfNode, providedOptions){
        const options = optionize()({
            createChildren: ()=>[],
            spacing: 0,
            indent: 5
        }, providedOptions);
        super({
            excludeInvisibleChildrenFromBounds: true
        });
        this.selfNode = selfNode;
        this.selfNode.centerY = 0;
        this.expandedProperty = new TinyProperty(true);
        this.childTreeNodes = createObservableArray({
            elements: options.createChildren()
        });
        const buttonSize = 12;
        const expandCollapseShape = new Shape().moveToPoint(Vector2.createPolar(buttonSize / 2.5, 3 / 4 * Math.PI).plusXY(buttonSize / 8, 0)).lineTo(buttonSize / 8, 0).lineToPoint(Vector2.createPolar(buttonSize / 2.5, 5 / 4 * Math.PI).plusXY(buttonSize / 8, 0));
        this.expandCollapseButton = new Rectangle(-buttonSize / 2, -buttonSize / 2, buttonSize, buttonSize, {
            children: [
                new Path(expandCollapseShape, {
                    stroke: '#888',
                    lineCap: 'round',
                    lineWidth: 1.5
                })
            ],
            visible: false,
            cursor: 'pointer',
            right: 0
        });
        this.expandedProperty.link((expanded)=>{
            this.expandCollapseButton.rotation = expanded ? Math.PI / 2 : 0;
        });
        this.expandCollapseButton.addInputListener(new FireListener({
            fire: ()=>{
                this.expandedProperty.value = !this.expandedProperty.value;
            },
            tandem: Tandem.OPT_OUT
        }));
        this.addChild(this.expandCollapseButton);
        this.childContainer = new FlowBox({
            orientation: 'vertical',
            align: 'left',
            spacing: options.spacing,
            children: this.childTreeNodes,
            x: options.indent,
            y: this.selfNode.bottom + options.spacing,
            visibleProperty: this.expandedProperty
        });
        this.addChild(this.childContainer);
        this.addChild(selfNode);
        const onChildrenChange = ()=>{
            this.childContainer.children = this.childTreeNodes;
            this.expandCollapseButton.visible = this.childTreeNodes.length > 0;
        };
        this.childTreeNodes.addItemAddedListener(()=>{
            onChildrenChange();
        });
        this.childTreeNodes.addItemRemovedListener(()=>{
            onChildrenChange();
        });
        onChildrenChange();
        this.mutate(options);
    }
};
let VisualTreeNode = class VisualTreeNode extends CollapsibleTreeNode {
    find(trail) {
        if (trail.equals(this.trail)) {
            return this;
        } else {
            const treeNode = _.find(this.childTreeNodes, (childTreeNode)=>{
                return trail.isExtensionOf(childTreeNode.trail, true);
            });
            if (treeNode) {
                return treeNode.find(trail);
            } else {
                return null;
            }
        }
    }
    constructor(trail, helper){
        const node = trail.lastNode();
        const isVisible = trail.isVisible();
        const TREE_FONT = new Font({
            size: 12
        });
        const nameNode = new HBox({
            spacing: 5
        });
        const name = node.constructor.name;
        if (name) {
            nameNode.addChild(new Text(name, {
                font: TREE_FONT,
                pickable: false,
                fill: isVisible ? '#000' : '#60a'
            }));
        }
        if (node instanceof Text) {
            nameNode.addChild(new Text('"' + node.string + '"', {
                font: TREE_FONT,
                pickable: false,
                fill: '#666'
            }));
        }
        const selfBackground = Rectangle.bounds(nameNode.bounds, {
            children: [
                nameNode
            ],
            cursor: 'pointer',
            fill: new DerivedProperty([
                helper.selectedTrailProperty,
                helper.pointerTrailProperty
            ], (selected, active)=>{
                if (selected && trail.equals(selected)) {
                    return 'rgba(0,128,255,0.4)';
                } else if (active && trail.equals(active)) {
                    return 'rgba(0,128,255,0.2)';
                } else {
                    return 'transparent';
                }
            }, {
                tandem: Tandem.OPT_OUT
            })
        });
        selfBackground.addInputListener({
            enter: ()=>{
                helper.treeHoverTrailProperty.value = trail;
            },
            exit: ()=>{
                helper.treeHoverTrailProperty.value = null;
            }
        });
        selfBackground.addInputListener(new FireListener({
            fire: ()=>{
                helper.selectedTrailProperty.value = trail;
            },
            tandem: Tandem.OPT_OUT
        }));
        super(selfBackground, {
            createChildren: ()=>trail.lastNode().children.map((child)=>{
                    return new VisualTreeNode(trail.copy().addDescendant(child), helper);
                })
        });
        if (!node.visible) {
            this.expandedProperty.value = false;
        }
        this.trail = trail;
    }
};
let PDOMTreeNode = class PDOMTreeNode extends CollapsibleTreeNode {
    find(trail) {
        if (trail.equals(this.instance.trail)) {
            return this;
        } else {
            const treeNode = _.find(this.childTreeNodes, (childTreeNode)=>{
                return trail.isExtensionOf(childTreeNode.instance.trail, true);
            });
            if (treeNode) {
                return treeNode.find(trail);
            } else {
                return null;
            }
        }
    }
    constructor(instance, helper){
        const trail = instance.trail;
        const isVisible = trail.isPDOMVisible();
        const TREE_FONT = new Font({
            size: 12
        });
        const selfNode = new HBox({
            spacing: 5
        });
        if (trail.nodes.length) {
            const fill = isVisible ? '#000' : '#60a';
            const node = trail.lastNode();
            if (node.tagName) {
                selfNode.addChild(new Text(node.tagName, {
                    font: new Font({
                        size: 12,
                        weight: 'bold'
                    }),
                    fill: fill
                }));
            }
            if (node.labelContent) {
                selfNode.addChild(new Text(node.labelContent, {
                    font: TREE_FONT,
                    fill: '#800'
                }));
            }
            if (node.innerContent) {
                selfNode.addChild(new Text(node.innerContent, {
                    font: TREE_FONT,
                    fill: '#080'
                }));
            }
            if (node.descriptionContent) {
                selfNode.addChild(new Text(node.descriptionContent, {
                    font: TREE_FONT,
                    fill: '#444'
                }));
            }
            const parentTrail = instance.parent ? instance.parent.trail : new Trail();
            const name = trail.nodes.slice(parentTrail.nodes.length).map((node)=>node.constructor.name).filter((n)=>n !== 'Node').join(',');
            if (name) {
                selfNode.addChild(new Text(`(${name})`, {
                    font: TREE_FONT,
                    fill: '#008'
                }));
            }
        } else {
            selfNode.addChild(new Text('(root)', {
                font: TREE_FONT
            }));
        }
        // Refactor this code out?
        const selfBackground = Rectangle.bounds(selfNode.bounds, {
            children: [
                selfNode
            ],
            cursor: 'pointer',
            fill: new DerivedProperty([
                helper.selectedTrailProperty,
                helper.pointerTrailProperty
            ], (selected, active)=>{
                if (selected && trail.equals(selected)) {
                    return 'rgba(0,128,255,0.4)';
                } else if (active && trail.equals(active)) {
                    return 'rgba(0,128,255,0.2)';
                } else {
                    return 'transparent';
                }
            }, {
                tandem: Tandem.OPT_OUT
            })
        });
        if (trail.length) {
            selfBackground.addInputListener({
                enter: ()=>{
                    helper.treeHoverTrailProperty.value = trail;
                },
                exit: ()=>{
                    helper.treeHoverTrailProperty.value = null;
                }
            });
            selfBackground.addInputListener(new FireListener({
                fire: ()=>{
                    helper.selectedTrailProperty.value = trail;
                },
                tandem: Tandem.OPT_OUT
            }));
        }
        super(selfBackground, {
            createChildren: ()=>instance.children.map((instance)=>new PDOMTreeNode(instance, helper))
        });
        this.instance = instance;
        this.trail = trail;
    }
};
let TreeNode = class TreeNode extends Rectangle {
    resize(size) {
        this.rectHeight = size.height;
        this.right = size.width;
        this.treeContainer.clipArea = Shape.bounds(this.localBounds.dilated(10));
    }
    constrainTree() {
        const treeMarginX = 8;
        const treeMarginY = 5;
        if (this.treeNode) {
            if (this.treeNode.bottom < this.selfBounds.bottom - treeMarginY) {
                this.treeNode.bottom = this.selfBounds.bottom - treeMarginY;
            }
            if (this.treeNode.top > this.selfBounds.top + treeMarginY) {
                this.treeNode.top = this.selfBounds.top + treeMarginY;
            }
            if (this.treeNode.right < this.selfBounds.right - treeMarginX) {
                this.treeNode.right = this.selfBounds.right - treeMarginX;
            }
            if (this.treeNode.left > this.selfBounds.left + treeMarginX) {
                this.treeNode.left = this.selfBounds.left + treeMarginX;
            }
        }
    }
    focusTrail(trail) {
        if (this.treeNode) {
            const treeNode = this.treeNode.find(trail);
            if (treeNode) {
                const deltaY = treeNode.localToGlobalPoint(treeNode.selfNode.center).y - this.centerY;
                this.treeNode.y -= deltaY;
                this.constrainTree();
            }
        }
    }
    focusPointer() {
        if (this.helper.pointerTrailProperty.value) {
            this.focusTrail(this.helper.pointerTrailProperty.value);
        }
    }
    focusSelected() {
        if (this.helper.selectedTrailProperty.value === null) {
            return;
        }
        this.focusTrail(this.helper.selectedTrailProperty.value);
    }
    constructor(visibleProperty, helper, createTreeNode){
        super({
            fill: 'rgba(255,255,255,0.85)',
            stroke: 'black',
            rectWidth: 400,
            visibleProperty: visibleProperty,
            pickable: true
        });
        this.helper = helper;
        this.treeContainer = new Node();
        this.addChild(this.treeContainer);
        this.addInputListener(new DragListener({
            targetNode: this,
            drag: (event, listener)=>{
                this.x = this.x + listener.modelDelta.x;
            },
            tandem: Tandem.OPT_OUT
        }));
        this.addInputListener({
            wheel: (event)=>{
                const deltaX = event.domEvent.deltaX;
                const deltaY = event.domEvent.deltaY;
                const multiplier = 1;
                if (this.treeNode) {
                    this.treeNode.x -= deltaX * multiplier;
                    this.treeNode.y -= deltaY * multiplier;
                }
                this.constrainTree();
            }
        });
        // When there isn't a selected trail, focus whatever our pointer is over
        helper.pointerTrailProperty.lazyLink(()=>{
            if (!helper.selectedTrailProperty.value) {
                this.focusPointer();
            }
        });
        Multilink.multilink([
            helper.activeProperty,
            visibleProperty
        ], (active, treeVisible)=>{
            if (active && treeVisible) {
                this.treeNode = createTreeNode();
                // Have the constrain properly position it
                this.treeNode.x = 500;
                this.treeNode.y = 500;
                this.treeContainer.children = [
                    this.treeNode
                ];
                this.focusSelected();
                this.constrainTree();
            } else {
                this.treeContainer.children = [];
            }
        });
    }
};
const createHeaderText = (str, node, options)=>{
    return new Text(str, merge({
        fontSize: 14,
        fontWeight: 'bold',
        visibleProperty: node ? new DerivedProperty([
            node.boundsProperty
        ], (bounds)=>{
            return !bounds.isEmpty();
        }) : new TinyProperty(true)
    }, options));
};
const createCollapsibleHeaderText = (str, visibleProperty, node, options)=>{
    const headerText = createHeaderText(str, node, options);
    headerText.addInputListener(new FireListener({
        fire: ()=>{
            visibleProperty.value = !visibleProperty.value;
        },
        tandem: Tandem.OPT_OUT
    }));
    headerText.cursor = 'pointer';
    return new HBox({
        spacing: 7,
        children: [
            new ExpandCollapseButton(visibleProperty, {
                tandem: Tandem.OPT_OUT,
                sideLength: 14
            }),
            headerText
        ],
        visibleProperty: headerText.visibleProperty
    });
};
let Matrix3Node = class Matrix3Node extends GridBox {
    constructor(matrix){
        super({
            xSpacing: 5,
            ySpacing: 0,
            children: [
                new Text(matrix.m00(), {
                    layoutOptions: {
                        column: 0,
                        row: 0
                    }
                }),
                new Text(matrix.m01(), {
                    layoutOptions: {
                        column: 1,
                        row: 0
                    }
                }),
                new Text(matrix.m02(), {
                    layoutOptions: {
                        column: 2,
                        row: 0
                    }
                }),
                new Text(matrix.m10(), {
                    layoutOptions: {
                        column: 0,
                        row: 1
                    }
                }),
                new Text(matrix.m11(), {
                    layoutOptions: {
                        column: 1,
                        row: 1
                    }
                }),
                new Text(matrix.m12(), {
                    layoutOptions: {
                        column: 2,
                        row: 1
                    }
                }),
                new Text(matrix.m20(), {
                    layoutOptions: {
                        column: 0,
                        row: 2
                    }
                }),
                new Text(matrix.m21(), {
                    layoutOptions: {
                        column: 1,
                        row: 2
                    }
                }),
                new Text(matrix.m22(), {
                    layoutOptions: {
                        column: 2,
                        row: 2
                    }
                })
            ]
        });
    }
};
let ShapeNode = class ShapeNode extends Path {
    constructor(shape){
        super(shape, {
            maxWidth: 15,
            maxHeight: 15,
            stroke: 'black',
            cursor: 'pointer',
            strokePickable: true
        });
        this.addInputListener(new FireListener({
            fire: ()=>copyToClipboard(shape.getSVGPath()),
            tandem: Tandem.OPT_OUT
        }));
    }
};
let ImageNode = class ImageNode extends Image {
    constructor(image){
        super(image.getImage(), {
            maxWidth: 15,
            maxHeight: 15
        });
    }
};
const createInfo = (trail)=>{
    const children = [];
    const node = trail.lastNode();
    const types = inheritance(node.constructor).map((type)=>type.name).filter((name)=>{
        return name && name !== 'Object';
    });
    const reducedTypes = types.includes('Node') ? types.slice(0, types.indexOf('Node')) : types;
    if (reducedTypes.length > 0) {
        children.push(new RichText(reducedTypes.map((str, i)=>{
            return i === 0 ? `<b>${str}</b>` : `<br>&nbsp;${_.repeat('  ', i)}extends ${str}`;
        }).join(''), {
            font: new PhetFont(12)
        }));
    }
    const addRaw = (key, valueNode)=>{
        children.push(new HBox({
            spacing: 0,
            align: 'top',
            children: [
                new Text(key + ': ', {
                    fontSize: 12
                }),
                valueNode
            ]
        }));
    };
    const addSimple = (key, value)=>{
        if (value !== undefined) {
            addRaw(key, new RichText('' + value, {
                lineWrap: 400,
                font: new PhetFont(12),
                cursor: 'pointer',
                inputListeners: [
                    new FireListener({
                        fire: ()=>copyToClipboard('' + value),
                        tandem: Tandem.OPT_OUT
                    })
                ]
            }));
        }
    };
    const colorSwatch = (color)=>{
        return new HBox({
            spacing: 4,
            children: [
                new Rectangle(0, 0, 10, 10, {
                    fill: color,
                    stroke: 'black',
                    lineWidth: 0.5
                }),
                new Text(color.toHexString(), {
                    fontSize: 12
                }),
                new Text(color.toCSS(), {
                    fontSize: 12
                })
            ],
            cursor: 'pointer',
            inputListeners: [
                new FireListener({
                    fire: ()=>copyToClipboard(color.toHexString()),
                    tandem: Tandem.OPT_OUT
                })
            ]
        });
    };
    const addColor = (key, color)=>{
        const result = iColorToColor(color);
        if (result !== null) {
            addRaw(key, colorSwatch(result));
        }
    };
    const addPaint = (key, paint)=>{
        const stopToNode = (stop)=>{
            return new HBox({
                spacing: 3,
                children: [
                    new Text(stop.ratio, {
                        fontSize: 12
                    }),
                    colorSwatch(iColorToColor(stop.color) || Color.TRANSPARENT)
                ]
            });
        };
        if (paint instanceof Paint) {
            if (paint instanceof LinearGradient) {
                addRaw(key, new VBox({
                    align: 'left',
                    spacing: 3,
                    children: [
                        new Text(`LinearGradient (${paint.start.x},${paint.start.y}) => (${paint.end.x},${paint.end.y})`, {
                            fontSize: 12
                        }),
                        ...paint.stops.map(stopToNode)
                    ]
                }));
            } else if (paint instanceof RadialGradient) {
                addRaw(key, new VBox({
                    align: 'left',
                    spacing: 3,
                    children: [
                        new Text(`RadialGradient (${paint.start.x},${paint.start.y}) ${paint.startRadius} => (${paint.end.x},${paint.end.y}) ${paint.endRadius}`, {
                            fontSize: 12
                        }),
                        ...paint.stops.map(stopToNode)
                    ]
                }));
            } else if (paint instanceof Pattern) {
                addRaw(key, new VBox({
                    align: 'left',
                    spacing: 3,
                    children: [
                        new Text('Pattern', {
                            fontSize: 12
                        }),
                        new Image(paint.image, {
                            maxWidth: 10,
                            maxHeight: 10
                        })
                    ]
                }));
            }
        } else {
            addColor(key, paint);
        }
    };
    const addNumber = (key, number)=>addSimple(key, number);
    const addMatrix3 = (key, matrix)=>addRaw(key, new Matrix3Node(matrix));
    const addBounds2 = (key, bounds)=>{
        if (bounds.equals(Bounds2.NOTHING)) {
        // DO nothing
        } else if (bounds.equals(Bounds2.EVERYTHING)) {
            addSimple(key, 'everything');
        } else {
            addRaw(key, new RichText(`x: [${bounds.minX}, ${bounds.maxX}]<br>y: [${bounds.minY}, ${bounds.maxY}]`, {
                font: new PhetFont(12)
            }));
        }
    };
    const addShape = (key, shape)=>addRaw(key, new ShapeNode(shape));
    const addImage = (key, image)=>addRaw(key, new ImageNode(image));
    if (node.tandem.supplied) {
        addSimple('tandem', node.tandem.phetioID.split('.').join(' '));
    }
    if (node instanceof DOM) {
        addSimple('element', node.element.constructor.name);
    }
    if (extendsWidthSizable(node)) {
        !node.widthSizable && addSimple('widthSizable', node.widthSizable);
        node.preferredWidth !== null && addSimple('preferredWidth', node.preferredWidth);
        node.preferredWidth !== node.localPreferredWidth && addSimple('localPreferredWidth', node.localPreferredWidth);
        node.minimumWidth !== null && addSimple('minimumWidth', node.minimumWidth);
        node.minimumWidth !== node.localMinimumWidth && addSimple('localMinimumWidth', node.localMinimumWidth);
    }
    if (extendsHeightSizable(node)) {
        !node.heightSizable && addSimple('heightSizable', node.heightSizable);
        node.preferredHeight !== null && addSimple('preferredHeight', node.preferredHeight);
        node.preferredHeight !== node.localPreferredHeight && addSimple('localPreferredHeight', node.localPreferredHeight);
        node.minimumHeight !== null && addSimple('minimumHeight', node.minimumHeight);
        node.minimumHeight !== node.localMinimumHeight && addSimple('localMinimumHeight', node.localMinimumHeight);
    }
    if (node.layoutOptions) {
        addSimple('layoutOptions', JSON.stringify(node.layoutOptions, null, 2));
    }
    if (node instanceof LayoutNode) {
        !node.resize && addSimple('resize', node.resize);
        !node.layoutOrigin.equals(Vector2.ZERO) && addSimple('layoutOrigin', node.layoutOrigin);
    }
    if (node instanceof FlowBox) {
        addSimple('orientation', node.orientation);
        addSimple('align', node.align);
        node.spacing && addSimple('spacing', node.spacing);
        node.lineSpacing && addSimple('lineSpacing', node.lineSpacing);
        addSimple('justify', node.justify);
        node.justifyLines && addSimple('justifyLines', node.justifyLines);
        node.wrap && addSimple('wrap', node.wrap);
        node.stretch && addSimple('stretch', node.stretch);
        node.grow && addSimple('grow', node.grow);
        node.leftMargin && addSimple('leftMargin', node.leftMargin);
        node.rightMargin && addSimple('rightMargin', node.rightMargin);
        node.topMargin && addSimple('topMargin', node.topMargin);
        node.bottomMargin && addSimple('bottomMargin', node.bottomMargin);
        node.minContentWidth !== null && addSimple('minContentWidth', node.minContentWidth);
        node.minContentHeight !== null && addSimple('minContentHeight', node.minContentHeight);
        node.maxContentWidth !== null && addSimple('maxContentWidth', node.maxContentWidth);
        node.maxContentHeight !== null && addSimple('maxContentHeight', node.maxContentHeight);
    }
    if (node instanceof GridBox) {
        addSimple('xAlign', node.xAlign);
        addSimple('yAlign', node.yAlign);
        node.xSpacing && addSimple('xSpacing', node.xSpacing);
        node.ySpacing && addSimple('ySpacing', node.ySpacing);
        node.xStretch && addSimple('xStretch', node.xStretch);
        node.yStretch && addSimple('yStretch', node.yStretch);
        node.xGrow && addSimple('xGrow', node.xGrow);
        node.yGrow && addSimple('yGrow', node.yGrow);
        node.leftMargin && addSimple('leftMargin', node.leftMargin);
        node.rightMargin && addSimple('rightMargin', node.rightMargin);
        node.topMargin && addSimple('topMargin', node.topMargin);
        node.bottomMargin && addSimple('bottomMargin', node.bottomMargin);
        node.minContentWidth !== null && addSimple('minContentWidth', node.minContentWidth);
        node.minContentHeight !== null && addSimple('minContentHeight', node.minContentHeight);
        node.maxContentWidth !== null && addSimple('maxContentWidth', node.maxContentWidth);
        node.maxContentHeight !== null && addSimple('maxContentHeight', node.maxContentHeight);
    }
    if (node instanceof Rectangle) {
        addBounds2('rectBounds', node.rectBounds);
        if (node.cornerXRadius || node.cornerYRadius) {
            if (node.cornerXRadius === node.cornerYRadius) {
                addSimple('cornerRadius', node.cornerRadius);
            } else {
                addSimple('cornerXRadius', node.cornerXRadius);
                addSimple('cornerYRadius', node.cornerYRadius);
            }
        }
    }
    if (node instanceof Line) {
        addSimple('x1', node.x1);
        addSimple('y1', node.y1);
        addSimple('x2', node.x2);
        addSimple('y2', node.y2);
    }
    if (node instanceof Circle) {
        addSimple('radius', node.radius);
    }
    if (node instanceof Text) {
        addSimple('text', node.string);
        addSimple('font', node.font);
        if (node.boundsMethod !== 'hybrid') {
            addSimple('boundsMethod', node.boundsMethod);
        }
    }
    if (node instanceof RichText) {
        addSimple('text', node.string);
        addSimple('font', node.font instanceof Font ? node.font.getFont() : node.font);
        addPaint('fill', node.fill);
        addPaint('stroke', node.stroke);
        if (node.boundsMethod !== 'hybrid') {
            addSimple('boundsMethod', node.boundsMethod);
        }
        if (node.lineWrap !== null) {
            addSimple('lineWrap', node.lineWrap);
        }
    }
    if (node instanceof Image) {
        addImage('image', node);
        addSimple('imageWidth', node.imageWidth);
        addSimple('imageHeight', node.imageHeight);
        if (node.imageOpacity !== 1) {
            addSimple('imageOpacity', node.imageOpacity);
        }
        if (node.imageBounds) {
            addBounds2('imageBounds', node.imageBounds);
        }
        if (node.initialWidth) {
            addSimple('initialWidth', node.initialWidth);
        }
        if (node.initialHeight) {
            addSimple('initialHeight', node.initialHeight);
        }
        if (node.hitTestPixels) {
            addSimple('hitTestPixels', node.hitTestPixels);
        }
    }
    if (node instanceof CanvasNode || node instanceof WebGLNode) {
        addBounds2('canvasBounds', node.canvasBounds);
    }
    if (node instanceof Path) {
        if (node.shape) {
            addShape('shape', node.shape);
        }
        if (node.boundsMethod !== 'accurate') {
            addSimple('boundsMethod', node.boundsMethod);
        }
    }
    if (node instanceof Path || node instanceof Text) {
        addPaint('fill', node.fill);
        addPaint('stroke', node.stroke);
        if (node.lineDash.length) {
            addSimple('lineDash', node.lineDash);
        }
        if (!node.fillPickable) {
            addSimple('fillPickable', node.fillPickable);
        }
        if (node.strokePickable) {
            addSimple('strokePickable', node.strokePickable);
        }
        if (node.lineWidth !== 1) {
            addSimple('lineWidth', node.lineWidth);
        }
        if (node.lineCap !== 'butt') {
            addSimple('lineCap', node.lineCap);
        }
        if (node.lineJoin !== 'miter') {
            addSimple('lineJoin', node.lineJoin);
        }
        if (node.lineDashOffset !== 0) {
            addSimple('lineDashOffset', node.lineDashOffset);
        }
        if (node.miterLimit !== 10) {
            addSimple('miterLimit', node.miterLimit);
        }
    }
    if (node.tagName) {
        addSimple('tagName', node.tagName);
    }
    if (node.accessibleName) {
        addSimple('accessibleName', node.accessibleName);
    }
    if (node.helpText) {
        addSimple('helpText', node.helpText);
    }
    if (node.pdomHeading) {
        addSimple('pdomHeading', node.pdomHeading);
    }
    if (node.containerTagName) {
        addSimple('containerTagName', node.containerTagName);
    }
    if (node.containerAriaRole) {
        addSimple('containerAriaRole', node.containerAriaRole);
    }
    if (node.innerContent) {
        addSimple('innerContent', node.innerContent);
    }
    if (node.inputType) {
        addSimple('inputType', node.inputType);
    }
    if (node.inputValue) {
        addSimple('inputValue', node.inputValue);
    }
    if (node.pdomNamespace) {
        addSimple('pdomNamespace', node.pdomNamespace);
    }
    if (node.ariaLabel) {
        addSimple('ariaLabel', node.ariaLabel);
    }
    if (node.ariaRole) {
        addSimple('ariaRole', node.ariaRole);
    }
    if (node.ariaValueText) {
        addSimple('ariaValueText', node.ariaValueText);
    }
    if (node.labelTagName) {
        addSimple('labelTagName', node.labelTagName);
    }
    if (node.labelContent) {
        addSimple('labelContent', node.labelContent);
    }
    if (node.appendLabel) {
        addSimple('appendLabel', node.appendLabel);
    }
    if (node.descriptionTagName) {
        addSimple('descriptionTagName', node.descriptionTagName);
    }
    if (node.descriptionContent) {
        addSimple('descriptionContent', node.descriptionContent);
    }
    if (node.appendDescription) {
        addSimple('appendDescription', node.appendDescription);
    }
    if (!node.pdomVisible) {
        addSimple('pdomVisible', node.pdomVisible);
    }
    if (node.pdomOrder) {
        addSimple('pdomOrder', node.pdomOrder.map((node)=>node === null ? 'null' : node.constructor.name));
    }
    if (!node.visible) {
        addSimple('visible', node.visible);
    }
    if (node.opacity !== 1) {
        addNumber('opacity', node.opacity);
    }
    if (node.pickable !== null) {
        addSimple('pickable', node.pickable);
    }
    if (!node.enabled) {
        addSimple('enabled', node.enabled);
    }
    if (!node.inputEnabled) {
        addSimple('inputEnabled', node.inputEnabled);
    }
    if (node.cursor !== null) {
        addSimple('cursor', node.cursor);
    }
    if (node.transformBounds) {
        addSimple('transformBounds', node.transformBounds);
    }
    if (node.renderer) {
        addSimple('renderer', node.renderer);
    }
    if (node.usesOpacity) {
        addSimple('usesOpacity', node.usesOpacity);
    }
    if (node.layerSplit) {
        addSimple('layerSplit', node.layerSplit);
    }
    if (node.cssTransform) {
        addSimple('cssTransform', node.cssTransform);
    }
    if (node.excludeInvisible) {
        addSimple('excludeInvisible', node.excludeInvisible);
    }
    if (node.preventFit) {
        addSimple('preventFit', node.preventFit);
    }
    if (node.webglScale !== null) {
        addSimple('webglScale', node.webglScale);
    }
    if (!node.matrix.isIdentity()) {
        addMatrix3('matrix', node.matrix);
    }
    if (node.maxWidth !== null) {
        addSimple('maxWidth', node.maxWidth);
    }
    if (node.maxHeight !== null) {
        addSimple('maxHeight', node.maxHeight);
    }
    if (node.clipArea !== null) {
        addShape('clipArea', node.clipArea);
    }
    if (node.mouseArea !== null) {
        if (node.mouseArea instanceof Bounds2) {
            addBounds2('mouseArea', node.mouseArea);
        } else {
            addShape('mouseArea', node.mouseArea);
        }
    }
    if (node.touchArea !== null) {
        if (node.touchArea instanceof Bounds2) {
            addBounds2('touchArea', node.touchArea);
        } else {
            addShape('touchArea', node.touchArea);
        }
    }
    if (node.inputListeners.length) {
        addSimple('inputListeners', node.inputListeners.map((listener)=>listener.constructor.name).join(', '));
    }
    children.push(new Spacer(5, 5));
    addBounds2('localBounds', node.localBounds);
    if (node.localBoundsOverridden) {
        addSimple('localBoundsOverridden', node.localBoundsOverridden);
    }
    addBounds2('bounds', node.bounds);
    if (isFinite(node.width)) {
        addSimple('width', node.width);
    }
    if (isFinite(node.height)) {
        addSimple('height', node.height);
    }
    children.push(new RectangularPushButton({
        content: new Text('Copy Path', {
            fontSize: 12
        }),
        listener: ()=>copyToClipboard('phet.joist.display.rootNode' + trail.indices.map((index)=>{
                return `.children[ ${index} ]`;
            }).join('')),
        tandem: Tandem.OPT_OUT
    }));
    return children;
};
const iColorToColor = (color)=>{
    const nonProperty = isTReadOnlyProperty(color) ? color.value : color;
    return nonProperty === null ? null : Color.toColor(nonProperty);
};
const isPaintNonTransparent = (paint)=>{
    if (paint instanceof Paint) {
        return true;
    } else {
        const color = iColorToColor(paint);
        return !!color && color.alpha > 0;
    }
};
// Missing optimizations on bounds on purpose, so we hit visual changes
const visualHitTest = (node, point)=>{
    if (!node.visible) {
        return null;
    }
    const localPoint = node._transform.getInverse().timesVector2(point);
    const clipArea = node.clipArea;
    if (clipArea !== null && !clipArea.containsPoint(localPoint)) {
        return null;
    }
    for(let i = node._children.length - 1; i >= 0; i--){
        const child = node._children[i];
        const childHit = visualHitTest(child, localPoint);
        if (childHit) {
            return childHit.addAncestor(node, i);
        }
    }
    // Didn't hit our children, so check ourself as a last resort. Check our selfBounds first, so we can potentially
    // avoid hit-testing the actual object (which may be more expensive).
    if (node.selfBounds.containsPoint(localPoint)) {
        // Ignore those transparent paths...
        if (node instanceof Path && node.hasShape()) {
            if (isPaintNonTransparent(node.fill) && node.getShape().containsPoint(localPoint)) {
                return new Trail(node);
            }
            if (isPaintNonTransparent(node.stroke) && node.getStrokedShape().containsPoint(localPoint)) {
                return new Trail(node);
            }
        } else if (node.containsPointSelf(localPoint)) {
            return new Trail(node);
        }
    }
    // No hit
    return null;
};
const copyToClipboard = /*#__PURE__*/ _async_to_generator(function*(str) {
    var _navigator_clipboard;
    yield (_navigator_clipboard = navigator.clipboard) == null ? void 0 : _navigator_clipboard.writeText(str);
});
const getLocalShape = (node, useMouse, useTouch)=>{
    let shape = Shape.union([
        ...useMouse && node.mouseArea ? [
            node.mouseArea instanceof Shape ? node.mouseArea : Shape.bounds(node.mouseArea)
        ] : [],
        ...useTouch && node.touchArea ? [
            node.touchArea instanceof Shape ? node.touchArea : Shape.bounds(node.touchArea)
        ] : [],
        node.getSelfShape(),
        ...node.children.filter((child)=>{
            return child.visible && child.pickable !== false;
        }).map((child)=>getLocalShape(child, useMouse, useTouch).transformed(child.matrix))
    ].filter((shape)=>shape.bounds.isValid()));
    if (node.hasClipArea()) {
        shape = shape.shapeIntersection(node.clipArea);
    }
    return shape;
};
const getShape = (trail, useMouse, useTouch)=>{
    let shape = getLocalShape(trail.lastNode(), useMouse, useTouch);
    for(let i = trail.nodes.length - 1; i >= 0; i--){
        const node = trail.nodes[i];
        if (node.hasClipArea()) {
            shape = shape.shapeIntersection(node.clipArea);
        }
        shape = shape.transformed(node.matrix);
    }
    return shape;
};

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2pvaXN0L2pzL0hlbHBlci50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAyMi0yMDI0LCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcbi8qKlxuICogU29tZSBpbi1zaW11bGF0aW9uIHV0aWxpdGllcyBkZXNpZ25lZCB0byBoZWxwIGRlc2lnbmVycyBhbmQgZGV2ZWxvcGVyc1xuICpcbiAqIEBhdXRob3IgSm9uYXRoYW4gT2xzb24gPGpvbmF0aGFuLm9sc29uQGNvbG9yYWRvLmVkdT5cbiAqL1xuXG5pbXBvcnQgYW5pbWF0aW9uRnJhbWVUaW1lciBmcm9tICcuLi8uLi9heG9uL2pzL2FuaW1hdGlvbkZyYW1lVGltZXIuanMnO1xuaW1wb3J0IEJvb2xlYW5Qcm9wZXJ0eSBmcm9tICcuLi8uLi9heG9uL2pzL0Jvb2xlYW5Qcm9wZXJ0eS5qcyc7XG5pbXBvcnQgeyBkZWZhdWx0IGFzIGNyZWF0ZU9ic2VydmFibGVBcnJheSwgT2JzZXJ2YWJsZUFycmF5IH0gZnJvbSAnLi4vLi4vYXhvbi9qcy9jcmVhdGVPYnNlcnZhYmxlQXJyYXkuanMnO1xuaW1wb3J0IERlcml2ZWRQcm9wZXJ0eSBmcm9tICcuLi8uLi9heG9uL2pzL0Rlcml2ZWRQcm9wZXJ0eS5qcyc7XG5pbXBvcnQgRW51bWVyYXRpb25Qcm9wZXJ0eSBmcm9tICcuLi8uLi9heG9uL2pzL0VudW1lcmF0aW9uUHJvcGVydHkuanMnO1xuaW1wb3J0IE1hcHBlZFByb3BlcnR5IGZyb20gJy4uLy4uL2F4b24vanMvTWFwcGVkUHJvcGVydHkuanMnO1xuaW1wb3J0IE11bHRpbGluayBmcm9tICcuLi8uLi9heG9uL2pzL011bHRpbGluay5qcyc7XG5pbXBvcnQgUHJvcGVydHkgZnJvbSAnLi4vLi4vYXhvbi9qcy9Qcm9wZXJ0eS5qcyc7XG5pbXBvcnQgVGlueVByb3BlcnR5IGZyb20gJy4uLy4uL2F4b24vanMvVGlueVByb3BlcnR5LmpzJztcbmltcG9ydCBUUHJvcGVydHkgZnJvbSAnLi4vLi4vYXhvbi9qcy9UUHJvcGVydHkuanMnO1xuaW1wb3J0IFRSZWFkT25seVByb3BlcnR5LCB7IGlzVFJlYWRPbmx5UHJvcGVydHkgfSBmcm9tICcuLi8uLi9heG9uL2pzL1RSZWFkT25seVByb3BlcnR5LmpzJztcbmltcG9ydCBCb3VuZHMyIGZyb20gJy4uLy4uL2RvdC9qcy9Cb3VuZHMyLmpzJztcbmltcG9ydCBEaW1lbnNpb24yIGZyb20gJy4uLy4uL2RvdC9qcy9EaW1lbnNpb24yLmpzJztcbmltcG9ydCBNYXRyaXgzIGZyb20gJy4uLy4uL2RvdC9qcy9NYXRyaXgzLmpzJztcbmltcG9ydCBVdGlscyBmcm9tICcuLi8uLi9kb3QvanMvVXRpbHMuanMnO1xuaW1wb3J0IFZlY3RvcjIgZnJvbSAnLi4vLi4vZG90L2pzL1ZlY3RvcjIuanMnO1xuaW1wb3J0IHsgU2hhcGUgfSBmcm9tICcuLi8uLi9raXRlL2pzL2ltcG9ydHMuanMnO1xuaW1wb3J0IEVudW1lcmF0aW9uIGZyb20gJy4uLy4uL3BoZXQtY29yZS9qcy9FbnVtZXJhdGlvbi5qcyc7XG5pbXBvcnQgRW51bWVyYXRpb25WYWx1ZSBmcm9tICcuLi8uLi9waGV0LWNvcmUvanMvRW51bWVyYXRpb25WYWx1ZS5qcyc7XG5pbXBvcnQgaW5oZXJpdGFuY2UgZnJvbSAnLi4vLi4vcGhldC1jb3JlL2pzL2luaGVyaXRhbmNlLmpzJztcbmltcG9ydCBtZXJnZSBmcm9tICcuLi8uLi9waGV0LWNvcmUvanMvbWVyZ2UuanMnO1xuaW1wb3J0IG9wdGlvbml6ZSBmcm9tICcuLi8uLi9waGV0LWNvcmUvanMvb3B0aW9uaXplLmpzJztcbmltcG9ydCBJbnRlbnRpb25hbEFueSBmcm9tICcuLi8uLi9waGV0LWNvcmUvanMvdHlwZXMvSW50ZW50aW9uYWxBbnkuanMnO1xuaW1wb3J0IE1lYXN1cmluZ1RhcGVOb2RlIGZyb20gJy4uLy4uL3NjZW5lcnktcGhldC9qcy9NZWFzdXJpbmdUYXBlTm9kZS5qcyc7XG5pbXBvcnQgUGhldEZvbnQgZnJvbSAnLi4vLi4vc2NlbmVyeS1waGV0L2pzL1BoZXRGb250LmpzJztcbmltcG9ydCB7IENhbnZhc05vZGUsIENpcmNsZSwgQ29sb3IsIERpc3BsYXksIERPTSwgRHJhZ0xpc3RlbmVyLCBleHRlbmRzSGVpZ2h0U2l6YWJsZSwgZXh0ZW5kc1dpZHRoU2l6YWJsZSwgRmlyZUxpc3RlbmVyLCBGbG93Qm94LCBGb250LCBHcmFkaWVudFN0b3AsIEdyaWRCb3gsIEhCb3gsIEhTZXBhcmF0b3IsIEltYWdlLCBMYXlvdXROb2RlLCBMaW5lLCBMaW5lYXJHcmFkaWVudCwgTm9kZSwgTm9kZU9wdGlvbnMsIE5vZGVQYXR0ZXJuLCBQYWludCwgUGF0aCwgUGF0dGVybiwgUERPTUluc3RhbmNlLCBQcmVzc0xpc3RlbmVyLCBSYWRpYWxHcmFkaWVudCwgUmVjdGFuZ2xlLCBSaWNoVGV4dCwgUmljaFRleHRPcHRpb25zLCBTY2VuZXJ5RXZlbnQsIFNwYWNlciwgVENvbG9yLCBUZXh0LCBUZXh0T3B0aW9ucywgVFBhaW50LCBUcmFpbCwgVkJveCwgV2ViR0xOb2RlIH0gZnJvbSAnLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcbmltcG9ydCBBcXVhUmFkaW9CdXR0b25Hcm91cCBmcm9tICcuLi8uLi9zdW4vanMvQXF1YVJhZGlvQnV0dG9uR3JvdXAuanMnO1xuaW1wb3J0IFJlY3Rhbmd1bGFyUHVzaEJ1dHRvbiBmcm9tICcuLi8uLi9zdW4vanMvYnV0dG9ucy9SZWN0YW5ndWxhclB1c2hCdXR0b24uanMnO1xuaW1wb3J0IENoZWNrYm94LCB7IENoZWNrYm94T3B0aW9ucyB9IGZyb20gJy4uLy4uL3N1bi9qcy9DaGVja2JveC5qcyc7XG5pbXBvcnQgRXhwYW5kQ29sbGFwc2VCdXR0b24gZnJvbSAnLi4vLi4vc3VuL2pzL0V4cGFuZENvbGxhcHNlQnV0dG9uLmpzJztcbmltcG9ydCBQYW5lbCBmcm9tICcuLi8uLi9zdW4vanMvUGFuZWwuanMnO1xuaW1wb3J0IFRhbmRlbSBmcm9tICcuLi8uLi90YW5kZW0vanMvVGFuZGVtLmpzJztcbmltcG9ydCBqb2lzdCBmcm9tICcuL2pvaXN0LmpzJztcbmltcG9ydCBTY3JlZW5WaWV3IGZyb20gJy4vU2NyZWVuVmlldy5qcyc7XG5pbXBvcnQgU2ltIGZyb20gJy4vU2ltLmpzJztcbmltcG9ydCBTaW1EaXNwbGF5IGZyb20gJy4vU2ltRGlzcGxheS5qcyc7XG5cbmNvbnN0IHJvdW5kID0gKCBuOiBudW1iZXIsIHBsYWNlcyA9IDIgKSA9PiBVdGlscy50b0ZpeGVkKCBuLCBwbGFjZXMgKTtcblxuY2xhc3MgUG9pbnRlckFyZWFUeXBlIGV4dGVuZHMgRW51bWVyYXRpb25WYWx1ZSB7XG4gIHB1YmxpYyBzdGF0aWMgcmVhZG9ubHkgTU9VU0UgPSBuZXcgUG9pbnRlckFyZWFUeXBlKCk7XG4gIHB1YmxpYyBzdGF0aWMgcmVhZG9ubHkgVE9VQ0ggPSBuZXcgUG9pbnRlckFyZWFUeXBlKCk7XG4gIHB1YmxpYyBzdGF0aWMgcmVhZG9ubHkgTk9ORSA9IG5ldyBQb2ludGVyQXJlYVR5cGUoKTtcblxuICBwdWJsaWMgc3RhdGljIHJlYWRvbmx5IGVudW1lcmF0aW9uID0gbmV3IEVudW1lcmF0aW9uKCBQb2ludGVyQXJlYVR5cGUgKTtcbn1cblxudHlwZSBIZWxwZXJDb21wYXRpYmxlTm9kZSA9IHtcbiAgZ2V0SGVscGVyTm9kZSgpOiBOb2RlO1xufSAmIE5vZGU7XG5jb25zdCBoYXNIZWxwZXJOb2RlID0gKCBub2RlOiBOb2RlICk6IG5vZGUgaXMgSGVscGVyQ29tcGF0aWJsZU5vZGUgPT4ge1xuICByZXR1cm4gISEoIG5vZGUgYXMgSW50ZW50aW9uYWxBbnkgKS5nZXRIZWxwZXJOb2RlO1xufTtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgSGVscGVyIHtcbiAgcHJpdmF0ZSBzaW06IFNpbTtcbiAgcHJpdmF0ZSBzaW1EaXNwbGF5OiBEaXNwbGF5O1xuICBwcml2YXRlIGhlbHBlckRpc3BsYXk/OiBEaXNwbGF5O1xuXG4gIC8vIFdoZXRoZXIgd2Ugc2hvdWxkIHVzZSB0aGUgaW5wdXQgc3lzdGVtIGZvciBwaWNraW5nLCBvciBpZiB3ZSBzaG91bGQgaWdub3JlIGl0IChhbmQgdGhlIGZsYWdzKSBmb3Igd2hhdCBpcyB2aXN1YWxcbiAgcHVibGljIGlucHV0QmFzZWRQaWNraW5nUHJvcGVydHk6IFByb3BlcnR5PGJvb2xlYW4+O1xuXG4gIC8vIFdoZXRoZXIgd2Ugc2hvdWxkIHJldHVybiB0aGUgbGVhZi1tb3N0IFRyYWlsIChpbnN0ZWFkIG9mIGZpbmRpbmcgdGhlIG9uZSB3aXRoIGlucHV0IGxpc3RlbmVycylcbiAgcHVibGljIHVzZUxlYWZOb2RlUHJvcGVydHk6IFByb3BlcnR5PGJvb2xlYW4+O1xuXG4gIHB1YmxpYyBwb2ludGVyQXJlYVR5cGVQcm9wZXJ0eTogUHJvcGVydHk8UG9pbnRlckFyZWFUeXBlPjtcblxuICAvLyBXaGV0aGVyIHRoZSBoZWxwZXIgaXMgdmlzaWJsZSAoYWN0aXZlKSBvciBub3RcbiAgcHVibGljIGFjdGl2ZVByb3BlcnR5OiBUUHJvcGVydHk8Ym9vbGVhbj47XG5cbiAgcHVibGljIHZpc3VhbFRyZWVWaXNpYmxlUHJvcGVydHk6IFByb3BlcnR5PGJvb2xlYW4+O1xuICBwdWJsaWMgcGRvbVRyZWVWaXNpYmxlUHJvcGVydHk6IFByb3BlcnR5PGJvb2xlYW4+O1xuICBwdWJsaWMgdW5kZXJQb2ludGVyVmlzaWJsZVByb3BlcnR5OiBQcm9wZXJ0eTxib29sZWFuPjtcbiAgcHVibGljIG9wdGlvbnNWaXNpYmxlUHJvcGVydHk6IFByb3BlcnR5PGJvb2xlYW4+O1xuICBwdWJsaWMgcHJldmlld1Zpc2libGVQcm9wZXJ0eTogUHJvcGVydHk8Ym9vbGVhbj47XG4gIHB1YmxpYyBzZWxlY3RlZE5vZGVDb250ZW50VmlzaWJsZVByb3BlcnR5OiBQcm9wZXJ0eTxib29sZWFuPjtcbiAgcHVibGljIHNlbGVjdGVkVHJhaWxDb250ZW50VmlzaWJsZVByb3BlcnR5OiBQcm9wZXJ0eTxib29sZWFuPjtcbiAgcHVibGljIGhpZ2hsaWdodFZpc2libGVQcm9wZXJ0eTogUHJvcGVydHk8Ym9vbGVhbj47XG4gIHB1YmxpYyBib3VuZHNWaXNpYmxlUHJvcGVydHk6IFByb3BlcnR5PGJvb2xlYW4+O1xuICBwdWJsaWMgc2VsZkJvdW5kc1Zpc2libGVQcm9wZXJ0eTogUHJvcGVydHk8Ym9vbGVhbj47XG4gIHB1YmxpYyBnZXRIZWxwZXJOb2RlVmlzaWJsZVByb3BlcnR5OiBQcm9wZXJ0eTxib29sZWFuPjtcblxuICAvLyBXaGV0aGVyIHRoZSBlbnRpcmUgaGVscGVyIGlzIHZpc2libGUgKG9yIGNvbGxhcHNlZClcbiAgcHVibGljIGhlbHBlclZpc2libGVQcm9wZXJ0eTogUHJvcGVydHk8Ym9vbGVhbj47XG5cbiAgLy8gV2hlcmUgdGhlIGN1cnJlbnQgcG9pbnRlciBpc1xuICBwdWJsaWMgcG9pbnRlclBvc2l0aW9uUHJvcGVydHk6IFRQcm9wZXJ0eTxWZWN0b3IyPjtcblxuICAvLyBXaGV0aGVyIHRoZSBwb2ludGVyIGlzIG92ZXIgdGhlIFVJIGludGVyZmFjZVxuICBwdWJsaWMgb3ZlckludGVyZmFjZVByb3BlcnR5OiBQcm9wZXJ0eTxib29sZWFuPjtcblxuICAvLyBJZiB0aGUgdXNlciBoYXMgY2xpY2tlZCBvbiBhIFRyYWlsIGFuZCBzZWxlY3RlZCBpdFxuICBwdWJsaWMgc2VsZWN0ZWRUcmFpbFByb3BlcnR5OiBUUHJvcGVydHk8VHJhaWwgfCBudWxsPjtcblxuICAvLyBXaGF0IFRyYWlsIHRoZSB1c2VyIGlzIG92ZXIgaW4gdGhlIHRyZWUgVUlcbiAgcHVibGljIHRyZWVIb3ZlclRyYWlsUHJvcGVydHk6IFRQcm9wZXJ0eTxUcmFpbCB8IG51bGw+O1xuXG4gIC8vIFdoYXQgVHJhaWwgdGhlIHBvaW50ZXIgaXMgb3ZlciByaWdodCBub3dcbiAgcHVibGljIHBvaW50ZXJUcmFpbFByb3BlcnR5OiBUUmVhZE9ubHlQcm9wZXJ0eTxUcmFpbCB8IG51bGw+O1xuXG4gIC8vIFdoYXQgVHJhaWwgdG8gc2hvdyBhcyBhIHByZXZpZXcgKGFuZCB0byBoaWdobGlnaHQpIC0gc2VsZWN0aW9uIG92ZXJyaWRlcyB3aGF0IHRoZSBwb2ludGVyIGlzIG92ZXJcbiAgcHVibGljIHByZXZpZXdUcmFpbFByb3BlcnR5OiBUUmVhZE9ubHlQcm9wZXJ0eTxUcmFpbCB8IG51bGw+O1xuXG4gIC8vIEEgaGVscGVyLWRpc3BsYXllZCBOb2RlIGNyZWF0ZWQgdG8gaGVscCB3aXRoIGRlYnVnZ2luZyB2YXJpb3VzIHR5cGVzXG4gIHB1YmxpYyBoZWxwZXJOb2RlUHJvcGVydHk6IFRSZWFkT25seVByb3BlcnR5PE5vZGUgfCBudWxsPjtcblxuICAvLyBUaGUgZ2xvYmFsIHNoYXBlIG9mIHdoYXQgaXMgc2VsZWN0ZWRcbiAgcHVibGljIHByZXZpZXdTaGFwZVByb3BlcnR5OiBUUmVhZE9ubHlQcm9wZXJ0eTxTaGFwZSB8IG51bGw+O1xuXG4gIHB1YmxpYyBzY3JlZW5WaWV3UHJvcGVydHk6IFRQcm9wZXJ0eTxTY3JlZW5WaWV3IHwgbnVsbD47XG5cbiAgLy8gSW1hZ2VEYXRhIGZyb20gdGhlIHNpbVxuICBwdWJsaWMgaW1hZ2VEYXRhUHJvcGVydHk6IFRQcm9wZXJ0eTxJbWFnZURhdGEgfCBudWxsPjtcblxuICAvLyBUaGUgcGl4ZWwgY29sb3IgdW5kZXIgdGhlIHBvaW50ZXJcbiAgcHVibGljIGNvbG9yUHJvcGVydHk6IFRSZWFkT25seVByb3BlcnR5PENvbG9yPjtcblxuICBwdWJsaWMgY29uc3RydWN0b3IoIHNpbTogU2ltLCBzaW1EaXNwbGF5OiBTaW1EaXNwbGF5ICkge1xuXG4gICAgLy8gTk9URTogRG9uJ3QgcGF1c2UgdGhlIHNpbSwgZG9uJ3QgdXNlIGZvcmVpZ24gb2JqZWN0IHJhc3Rlcml6YXRpb24gKGRvIHRoZSBzbWFydGVyIGluc3RhbnQgYXBwcm9hY2gpXG4gICAgLy8gTk9URTogSW5mb3JtIGFib3V0IHByZXNlcnZlRHJhd2luZ0J1ZmZlciBxdWVyeSBwYXJhbWV0ZXJcbiAgICAvLyBOT1RFOiBBY3R1YWxseSBncmFiL3JlcmVuZGVyIHRoaW5ncyBmcm9tIFdlYkdML0NhbnZhcywgc28gdGhpcyB3b3JrcyBuaWNlbHkgYW5kIGF0IGEgaGlnaGVyIHJlc29sdXRpb25cbiAgICAvLyBOT1RFOiBTY2VuZXJ5IGRyYXdhYmxlIHRyZWVcblxuICAgIHRoaXMuc2ltID0gc2ltO1xuICAgIHRoaXMuc2ltRGlzcGxheSA9IHNpbURpc3BsYXk7XG4gICAgdGhpcy5hY3RpdmVQcm9wZXJ0eSA9IG5ldyBUaW55UHJvcGVydHkoIGZhbHNlICk7XG4gICAgdGhpcy52aXN1YWxUcmVlVmlzaWJsZVByb3BlcnR5ID0gbmV3IEJvb2xlYW5Qcm9wZXJ0eSggZmFsc2UsIHtcbiAgICAgIHRhbmRlbTogVGFuZGVtLk9QVF9PVVRcbiAgICB9ICk7XG4gICAgdGhpcy5wZG9tVHJlZVZpc2libGVQcm9wZXJ0eSA9IG5ldyBCb29sZWFuUHJvcGVydHkoIGZhbHNlLCB7XG4gICAgICB0YW5kZW06IFRhbmRlbS5PUFRfT1VUXG4gICAgfSApO1xuICAgIHRoaXMudW5kZXJQb2ludGVyVmlzaWJsZVByb3BlcnR5ID0gbmV3IEJvb2xlYW5Qcm9wZXJ0eSggdHJ1ZSwge1xuICAgICAgdGFuZGVtOiBUYW5kZW0uT1BUX09VVFxuICAgIH0gKTtcbiAgICB0aGlzLm9wdGlvbnNWaXNpYmxlUHJvcGVydHkgPSBuZXcgQm9vbGVhblByb3BlcnR5KCB0cnVlLCB7XG4gICAgICB0YW5kZW06IFRhbmRlbS5PUFRfT1VUXG4gICAgfSApO1xuICAgIHRoaXMucHJldmlld1Zpc2libGVQcm9wZXJ0eSA9IG5ldyBCb29sZWFuUHJvcGVydHkoIGZhbHNlLCB7XG4gICAgICB0YW5kZW06IFRhbmRlbS5PUFRfT1VUXG4gICAgfSApO1xuICAgIHRoaXMuc2VsZWN0ZWROb2RlQ29udGVudFZpc2libGVQcm9wZXJ0eSA9IG5ldyBCb29sZWFuUHJvcGVydHkoIHRydWUsIHtcbiAgICAgIHRhbmRlbTogVGFuZGVtLk9QVF9PVVRcbiAgICB9ICk7XG4gICAgdGhpcy5zZWxlY3RlZFRyYWlsQ29udGVudFZpc2libGVQcm9wZXJ0eSA9IG5ldyBCb29sZWFuUHJvcGVydHkoIHRydWUsIHtcbiAgICAgIHRhbmRlbTogVGFuZGVtLk9QVF9PVVRcbiAgICB9ICk7XG4gICAgdGhpcy5oaWdobGlnaHRWaXNpYmxlUHJvcGVydHkgPSBuZXcgQm9vbGVhblByb3BlcnR5KCB0cnVlLCB7XG4gICAgICB0YW5kZW06IFRhbmRlbS5PUFRfT1VUXG4gICAgfSApO1xuICAgIHRoaXMuYm91bmRzVmlzaWJsZVByb3BlcnR5ID0gbmV3IEJvb2xlYW5Qcm9wZXJ0eSggdHJ1ZSwge1xuICAgICAgdGFuZGVtOiBUYW5kZW0uT1BUX09VVFxuICAgIH0gKTtcbiAgICB0aGlzLnNlbGZCb3VuZHNWaXNpYmxlUHJvcGVydHkgPSBuZXcgQm9vbGVhblByb3BlcnR5KCBmYWxzZSwge1xuICAgICAgdGFuZGVtOiBUYW5kZW0uT1BUX09VVFxuICAgIH0gKTtcbiAgICB0aGlzLmdldEhlbHBlck5vZGVWaXNpYmxlUHJvcGVydHkgPSBuZXcgQm9vbGVhblByb3BlcnR5KCB0cnVlLCB7XG4gICAgICB0YW5kZW06IFRhbmRlbS5PUFRfT1VUXG4gICAgfSApO1xuICAgIHRoaXMuaGVscGVyVmlzaWJsZVByb3BlcnR5ID0gbmV3IEJvb2xlYW5Qcm9wZXJ0eSggdHJ1ZSwge1xuICAgICAgdGFuZGVtOiBUYW5kZW0uT1BUX09VVFxuICAgIH0gKTtcblxuICAgIHRoaXMuaW5wdXRCYXNlZFBpY2tpbmdQcm9wZXJ0eSA9IG5ldyBCb29sZWFuUHJvcGVydHkoIHRydWUsIHsgdGFuZGVtOiBUYW5kZW0uT1BUX09VVCB9ICk7XG4gICAgdGhpcy51c2VMZWFmTm9kZVByb3BlcnR5ID0gbmV3IEJvb2xlYW5Qcm9wZXJ0eSggZmFsc2UsIHsgdGFuZGVtOiBUYW5kZW0uT1BUX09VVCB9ICk7XG4gICAgdGhpcy5wb2ludGVyQXJlYVR5cGVQcm9wZXJ0eSA9IG5ldyBFbnVtZXJhdGlvblByb3BlcnR5KCBQb2ludGVyQXJlYVR5cGUuTU9VU0UsIHsgdGFuZGVtOiBUYW5kZW0uT1BUX09VVCB9ICk7XG5cbiAgICB0aGlzLnBvaW50ZXJQb3NpdGlvblByb3BlcnR5ID0gbmV3IFRpbnlQcm9wZXJ0eSggVmVjdG9yMi5aRVJPICk7XG4gICAgdGhpcy5vdmVySW50ZXJmYWNlUHJvcGVydHkgPSBuZXcgQm9vbGVhblByb3BlcnR5KCBmYWxzZSwgeyB0YW5kZW06IFRhbmRlbS5PUFRfT1VUIH0gKTtcblxuICAgIHRoaXMuc2VsZWN0ZWRUcmFpbFByb3BlcnR5ID0gbmV3IFRpbnlQcm9wZXJ0eTxUcmFpbCB8IG51bGw+KCBudWxsICk7XG4gICAgdGhpcy50cmVlSG92ZXJUcmFpbFByb3BlcnR5ID0gbmV3IFRpbnlQcm9wZXJ0eTxUcmFpbCB8IG51bGw+KCBudWxsICk7XG4gICAgdGhpcy5wb2ludGVyVHJhaWxQcm9wZXJ0eSA9IG5ldyBEZXJpdmVkUHJvcGVydHkoIFsgdGhpcy5wb2ludGVyUG9zaXRpb25Qcm9wZXJ0eSwgdGhpcy5vdmVySW50ZXJmYWNlUHJvcGVydHksIHRoaXMucG9pbnRlckFyZWFUeXBlUHJvcGVydHksIHRoaXMuaW5wdXRCYXNlZFBpY2tpbmdQcm9wZXJ0eSBdLCAoIHBvaW50LCBvdmVySW50ZXJmYWNlLCBwb2ludGVyQXJlYVR5cGUsIGlucHV0QmFzZWRQaWNraW5nICkgPT4ge1xuICAgICAgLy8gV2UncmUgbm90IG92ZXIgc29tZXRoaW5nIHdoaWxlIHdlJ3JlIG92ZXIgYW4gaW50ZXJmYWNlXG4gICAgICBpZiAoIG92ZXJJbnRlcmZhY2UgKSB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgICAgfVxuXG4gICAgICBpZiAoICFpbnB1dEJhc2VkUGlja2luZyApIHtcbiAgICAgICAgcmV0dXJuIHZpc3VhbEhpdFRlc3QoIHNpbURpc3BsYXkucm9vdE5vZGUsIHBvaW50ICk7XG4gICAgICB9XG5cbiAgICAgIGxldCB0cmFpbCA9IHNpbURpc3BsYXkucm9vdE5vZGUuaGl0VGVzdChcbiAgICAgICAgcG9pbnQsXG4gICAgICAgIHBvaW50ZXJBcmVhVHlwZSA9PT0gUG9pbnRlckFyZWFUeXBlLk1PVVNFLFxuICAgICAgICBwb2ludGVyQXJlYVR5cGUgPT09IFBvaW50ZXJBcmVhVHlwZS5UT1VDSFxuICAgICAgKTtcblxuICAgICAgaWYgKCB0cmFpbCAmJiAhdGhpcy51c2VMZWFmTm9kZVByb3BlcnR5LnZhbHVlICkge1xuICAgICAgICB3aGlsZSAoIHRyYWlsLmxlbmd0aCA+IDAgJiYgdHJhaWwubGFzdE5vZGUoKS5pbnB1dExpc3RlbmVycy5sZW5ndGggPT09IDAgKSB7XG4gICAgICAgICAgdHJhaWwucmVtb3ZlRGVzY2VuZGFudCgpO1xuICAgICAgICB9XG4gICAgICAgIGlmICggdHJhaWwubGVuZ3RoID09PSAwICkge1xuICAgICAgICAgIHRyYWlsID0gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAvLyBSZXBzZWN0IFRhcmdldE5vZGUgdG8gYmUgaGVscGZ1bFxuICAgICAgICAgIGNvbnN0IGxpc3RlbmVycyA9IHRyYWlsLmxhc3ROb2RlKCkuaW5wdXRMaXN0ZW5lcnM7XG4gICAgICAgICAgY29uc3QgZmlyc3RMaXN0ZW5lciA9IGxpc3RlbmVyc1sgMCBdO1xuICAgICAgICAgIGlmICggZmlyc3RMaXN0ZW5lciBpbnN0YW5jZW9mIFByZXNzTGlzdGVuZXIgJiYgZmlyc3RMaXN0ZW5lci50YXJnZXROb2RlICYmIGZpcnN0TGlzdGVuZXIudGFyZ2V0Tm9kZSAhPT0gdHJhaWwubGFzdE5vZGUoKSAmJiB0cmFpbC5jb250YWluc05vZGUoIGZpcnN0TGlzdGVuZXIudGFyZ2V0Tm9kZSApICkge1xuICAgICAgICAgICAgdHJhaWwgPSB0cmFpbC5zdWJ0cmFpbFRvKCBmaXJzdExpc3RlbmVyLnRhcmdldE5vZGUgKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHRyYWlsO1xuICAgIH0sIHtcbiAgICAgIHRhbmRlbTogVGFuZGVtLk9QVF9PVVQsXG4gICAgICB2YWx1ZUNvbXBhcmlzb25TdHJhdGVneTogJ2VxdWFsc0Z1bmN0aW9uJ1xuICAgIH0gKTtcbiAgICB0aGlzLnByZXZpZXdUcmFpbFByb3BlcnR5ID0gbmV3IERlcml2ZWRQcm9wZXJ0eSggWyB0aGlzLnNlbGVjdGVkVHJhaWxQcm9wZXJ0eSwgdGhpcy50cmVlSG92ZXJUcmFpbFByb3BlcnR5LCB0aGlzLnBvaW50ZXJUcmFpbFByb3BlcnR5IF0sICggc2VsZWN0ZWQsIHRyZWVIb3ZlciwgYWN0aXZlICkgPT4ge1xuICAgICAgcmV0dXJuIHNlbGVjdGVkID8gc2VsZWN0ZWQgOiAoIHRyZWVIb3ZlciA/IHRyZWVIb3ZlciA6IGFjdGl2ZSApO1xuICAgIH0gKTtcblxuICAgIHRoaXMucHJldmlld1NoYXBlUHJvcGVydHkgPSBuZXcgRGVyaXZlZFByb3BlcnR5KCBbIHRoaXMucHJldmlld1RyYWlsUHJvcGVydHksIHRoaXMuaW5wdXRCYXNlZFBpY2tpbmdQcm9wZXJ0eSwgdGhpcy5wb2ludGVyQXJlYVR5cGVQcm9wZXJ0eSBdLCAoIHByZXZpZXdUcmFpbCwgaW5wdXRCYXNlZFBpY2tpbmcsIHBvaW50ZXJBcmVhVHlwZSApID0+IHtcbiAgICAgIGlmICggcHJldmlld1RyYWlsICkge1xuICAgICAgICBpZiAoIGlucHV0QmFzZWRQaWNraW5nICkge1xuICAgICAgICAgIHJldHVybiBnZXRTaGFwZSggcHJldmlld1RyYWlsLCBwb2ludGVyQXJlYVR5cGUgPT09IFBvaW50ZXJBcmVhVHlwZS5NT1VTRSwgcG9pbnRlckFyZWFUeXBlID09PSBQb2ludGVyQXJlYVR5cGUuVE9VQ0ggKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICByZXR1cm4gZ2V0U2hhcGUoIHByZXZpZXdUcmFpbCwgZmFsc2UsIGZhbHNlICk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGVsc2Uge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgIH1cbiAgICB9ICk7XG5cbiAgICB0aGlzLmhlbHBlck5vZGVQcm9wZXJ0eSA9IG5ldyBEZXJpdmVkUHJvcGVydHkoIFsgdGhpcy5zZWxlY3RlZFRyYWlsUHJvcGVydHkgXSwgdHJhaWwgPT4ge1xuICAgICAgaWYgKCB0cmFpbCApIHtcbiAgICAgICAgY29uc3Qgbm9kZSA9IHRyYWlsLmxhc3ROb2RlKCk7XG4gICAgICAgIGlmICggaGFzSGVscGVyTm9kZSggbm9kZSApICkge1xuICAgICAgICAgIHJldHVybiBub2RlLmdldEhlbHBlck5vZGUoKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgICAgfVxuICAgIH0gKTtcblxuICAgIHRoaXMuc2NyZWVuVmlld1Byb3BlcnR5ID0gbmV3IFRpbnlQcm9wZXJ0eTxTY3JlZW5WaWV3IHwgbnVsbD4oIG51bGwgKTtcblxuICAgIHRoaXMuaW1hZ2VEYXRhUHJvcGVydHkgPSBuZXcgVGlueVByb3BlcnR5PEltYWdlRGF0YSB8IG51bGw+KCBudWxsICk7XG5cbiAgICB0aGlzLmNvbG9yUHJvcGVydHkgPSBuZXcgRGVyaXZlZFByb3BlcnR5KCBbIHRoaXMucG9pbnRlclBvc2l0aW9uUHJvcGVydHksIHRoaXMuaW1hZ2VEYXRhUHJvcGVydHkgXSwgKCBwb3NpdGlvbiwgaW1hZ2VEYXRhICkgPT4ge1xuICAgICAgaWYgKCAhaW1hZ2VEYXRhICkge1xuICAgICAgICByZXR1cm4gQ29sb3IuVFJBTlNQQVJFTlQ7XG4gICAgICB9XG4gICAgICBjb25zdCB4ID0gTWF0aC5mbG9vciggcG9zaXRpb24ueCAvIHRoaXMuc2ltRGlzcGxheS53aWR0aCAqIGltYWdlRGF0YS53aWR0aCApO1xuICAgICAgY29uc3QgeSA9IE1hdGguZmxvb3IoIHBvc2l0aW9uLnkgLyB0aGlzLnNpbURpc3BsYXkuaGVpZ2h0ICogaW1hZ2VEYXRhLmhlaWdodCApO1xuXG4gICAgICBjb25zdCBpbmRleCA9IDQgKiAoIHggKyBpbWFnZURhdGEud2lkdGggKiB5ICk7XG5cbiAgICAgIGlmICggeCA8IDAgfHwgeSA8IDAgfHwgeCA+IGltYWdlRGF0YS53aWR0aCB8fCB5ID4gaW1hZ2VEYXRhLmhlaWdodCApIHtcbiAgICAgICAgcmV0dXJuIENvbG9yLlRSQU5TUEFSRU5UO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gbmV3IENvbG9yKFxuICAgICAgICBpbWFnZURhdGEuZGF0YVsgaW5kZXggXSxcbiAgICAgICAgaW1hZ2VEYXRhLmRhdGFbIGluZGV4ICsgMSBdLFxuICAgICAgICBpbWFnZURhdGEuZGF0YVsgaW5kZXggKyAyIF0sXG4gICAgICAgIGltYWdlRGF0YS5kYXRhWyBpbmRleCArIDMgXSAvIDI1NVxuICAgICAgKTtcbiAgICB9LCB7XG4gICAgICB0YW5kZW06IFRhbmRlbS5PUFRfT1VUXG4gICAgfSApO1xuXG4gICAgY29uc3QgZnV6elByb3BlcnR5ID0gbmV3IEJvb2xlYW5Qcm9wZXJ0eSggcGhldC5jaGlwcGVyLnF1ZXJ5UGFyYW1ldGVycy5mdXp6LCB7XG4gICAgICB0YW5kZW06IFRhbmRlbS5PUFRfT1VUXG4gICAgfSApO1xuICAgIGZ1enpQcm9wZXJ0eS5sYXp5TGluayggZnV6eiA9PiB7XG4gICAgICBwaGV0LmNoaXBwZXIucXVlcnlQYXJhbWV0ZXJzLmZ1enogPSBmdXp6O1xuICAgIH0gKTtcblxuICAgIGNvbnN0IG1lYXN1cmluZ1RhcGVWaXNpYmxlUHJvcGVydHkgPSBuZXcgQm9vbGVhblByb3BlcnR5KCBmYWxzZSwge1xuICAgICAgdGFuZGVtOiBUYW5kZW0uT1BUX09VVFxuICAgIH0gKTtcbiAgICBjb25zdCBtZWFzdXJpbmdUYXBlVW5pdHNQcm9wZXJ0eSA9IG5ldyBUaW55UHJvcGVydHk8eyBuYW1lOiBzdHJpbmc7IG11bHRpcGxpZXI6IG51bWJlciB9PiggeyBuYW1lOiAndmlldyB1bml0cycsIG11bHRpcGxpZXI6IDAgfSApO1xuXG4gICAgY29uc3QgbGF5b3V0Qm91bmRzUHJvcGVydHkgPSBuZXcgVGlueVByb3BlcnR5KCBCb3VuZHMyLk5PVEhJTkcgKTtcblxuICAgIGNvbnN0IGhlbHBlclJvb3QgPSBuZXcgTm9kZSgge1xuICAgICAgcmVuZGVyZXI6ICdzdmcnXG4gICAgfSApO1xuXG4gICAgY29uc3QgcG9zaXRpb25TdHJpbmdQcm9wZXJ0eSA9IG5ldyBNYXBwZWRQcm9wZXJ0eSggdGhpcy5wb2ludGVyUG9zaXRpb25Qcm9wZXJ0eSwge1xuICAgICAgdGFuZGVtOiBUYW5kZW0uT1BUX09VVCxcbiAgICAgIGJpZGlyZWN0aW9uYWw6IHRydWUsXG4gICAgICBtYXA6IHBvc2l0aW9uID0+IHtcbiAgICAgICAgY29uc3QgdmlldyA9IHRoaXMuc2NyZWVuVmlld1Byb3BlcnR5LnZhbHVlO1xuICAgICAgICBpZiAoIHZpZXcgKSB7XG4gICAgICAgICAgY29uc3Qgdmlld1Bvc2l0aW9uID0gdmlldy5nbG9iYWxUb0xvY2FsUG9pbnQoIHBvc2l0aW9uICk7XG4gICAgICAgICAgcmV0dXJuIGBnbG9iYWw6IHg6ICR7cm91bmQoIHBvc2l0aW9uLnggKX0sIHk6ICR7cm91bmQoIHBvc2l0aW9uLnkgKX08YnI+dmlldzogeDogJHtyb3VuZCggdmlld1Bvc2l0aW9uLnggKX0sIHk6ICR7cm91bmQoIHZpZXdQb3NpdGlvbi55ICl9YDtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICByZXR1cm4gJy0nO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSApO1xuICAgIGNvbnN0IHBvc2l0aW9uVGV4dCA9IG5ldyBSaWNoVGV4dCggcG9zaXRpb25TdHJpbmdQcm9wZXJ0eSwge1xuICAgICAgZm9udDogbmV3IFBoZXRGb250KCAxMiApXG4gICAgfSApO1xuXG4gICAgY29uc3QgY29sb3JUZXh0TWFwID0gKCBjb2xvcjogQ29sb3IgKSA9PiB7XG4gICAgICByZXR1cm4gYCR7Y29sb3IudG9IZXhTdHJpbmcoKX0gJHtjb2xvci50b0NTUygpfWA7XG4gICAgfTtcbiAgICBjb25zdCBjb2xvclN0cmluZ1Byb3BlcnR5ID0gbmV3IE1hcHBlZFByb3BlcnR5KCB0aGlzLmNvbG9yUHJvcGVydHksIHtcbiAgICAgIHRhbmRlbTogVGFuZGVtLk9QVF9PVVQsXG4gICAgICBiaWRpcmVjdGlvbmFsOiB0cnVlLFxuICAgICAgbWFwOiBjb2xvclRleHRNYXBcbiAgICB9ICk7XG4gICAgY29uc3QgY29sb3JUZXh0ID0gbmV3IFJpY2hUZXh0KCBjb2xvclN0cmluZ1Byb3BlcnR5LCB7XG4gICAgICBmb250OiBuZXcgUGhldEZvbnQoIDEyIClcbiAgICB9ICk7XG4gICAgdGhpcy5jb2xvclByb3BlcnR5LmxpbmsoIGNvbG9yID0+IHtcbiAgICAgIGNvbG9yVGV4dC5maWxsID0gQ29sb3IuZ2V0THVtaW5hbmNlKCBjb2xvciApID4gMTI4ID8gQ29sb3IuQkxBQ0sgOiBDb2xvci5XSElURTtcbiAgICB9ICk7XG5cbiAgICBjb25zdCBib3VuZHNDb2xvciA9IG5ldyBDb2xvciggJyM4MDQwMDAnICk7XG4gICAgY29uc3Qgc2VsZkJvdW5kc0NvbG9yID0gbmV3IENvbG9yKCAnIzIwODAyMCcgKTtcbiAgICBjb25zdCBub25JbnB1dEJhc2VkQ29sb3IgPSBuZXcgQ29sb3IoIDI1NSwgMTAwLCAwICk7XG4gICAgY29uc3QgbW91c2VDb2xvciA9IG5ldyBDb2xvciggMCwgMCwgMjU1ICk7XG4gICAgY29uc3QgdG91Y2hDb2xvciA9IG5ldyBDb2xvciggMjU1LCAwLCAwICk7XG4gICAgY29uc3QgaW5wdXRCYXNlZENvbG9yID0gbmV3IENvbG9yKCAyMDAsIDAsIDIwMCApO1xuXG4gICAgY29uc3QgaGlnaGxpZ2h0QmFzZUNvbG9yUHJvcGVydHkgPSBuZXcgRGVyaXZlZFByb3BlcnR5KCBbIHRoaXMuaW5wdXRCYXNlZFBpY2tpbmdQcm9wZXJ0eSwgdGhpcy5wb2ludGVyQXJlYVR5cGVQcm9wZXJ0eSBdLCAoIGlucHV0QmFzZWRQaWNraW5nLCBwb2ludGVyQXJlYVR5cGUgKSA9PiB7XG4gICAgICBpZiAoIGlucHV0QmFzZWRQaWNraW5nICkge1xuICAgICAgICBpZiAoIHBvaW50ZXJBcmVhVHlwZSA9PT0gUG9pbnRlckFyZWFUeXBlLk1PVVNFICkge1xuICAgICAgICAgIHJldHVybiBtb3VzZUNvbG9yO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKCBwb2ludGVyQXJlYVR5cGUgPT09IFBvaW50ZXJBcmVhVHlwZS5UT1VDSCApIHtcbiAgICAgICAgICByZXR1cm4gdG91Y2hDb2xvcjtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICByZXR1cm4gaW5wdXRCYXNlZENvbG9yO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgcmV0dXJuIG5vbklucHV0QmFzZWRDb2xvcjtcbiAgICAgIH1cbiAgICB9LCB7XG4gICAgICB0YW5kZW06IFRhbmRlbS5PUFRfT1VUXG4gICAgfSApO1xuXG4gICAgY29uc3QgY29sb3JCYWNrZ3JvdW5kID0gbmV3IFBhbmVsKCBjb2xvclRleHQsIHtcbiAgICAgIGNvcm5lclJhZGl1czogMCxcbiAgICAgIHN0cm9rZTogbnVsbCxcbiAgICAgIGZpbGw6IHRoaXMuY29sb3JQcm9wZXJ0eVxuICAgIH0gKTtcblxuICAgIGNvbnN0IHByZXZpZXdOb2RlID0gbmV3IE5vZGUoIHtcbiAgICAgIHZpc2libGVQcm9wZXJ0eTogdGhpcy5wcmV2aWV3VmlzaWJsZVByb3BlcnR5XG4gICAgfSApO1xuXG4gICAgY29uc3QgcHJldmlld0JhY2tncm91bmQgPSBuZXcgUmVjdGFuZ2xlKCAwLCAwLCAyMDAsIDIwMCwge1xuICAgICAgZmlsbDogbmV3IE5vZGVQYXR0ZXJuKCBuZXcgTm9kZSgge1xuICAgICAgICBjaGlsZHJlbjogW1xuICAgICAgICAgIG5ldyBSZWN0YW5nbGUoIDAsIDAsIDEwLCAxMCwgeyBmaWxsOiAnI2RkZCcgfSApLFxuICAgICAgICAgIG5ldyBSZWN0YW5nbGUoIDEwLCAxMCwgMTAsIDEwLCB7IGZpbGw6ICcjZGRkJyB9ICksXG4gICAgICAgICAgbmV3IFJlY3RhbmdsZSggMCwgMTAsIDEwLCAxMCwgeyBmaWxsOiAnI2ZhZmFmYScgfSApLFxuICAgICAgICAgIG5ldyBSZWN0YW5nbGUoIDEwLCAwLCAxMCwgMTAsIHsgZmlsbDogJyNmYWZhZmEnIH0gKVxuICAgICAgICBdXG4gICAgICB9ICksIDIsIDAsIDAsIDIwLCAyMCApLFxuICAgICAgc3Ryb2tlOiAnYmxhY2snLFxuICAgICAgdmlzaWJsZVByb3BlcnR5OiB0aGlzLnByZXZpZXdWaXNpYmxlUHJvcGVydHlcbiAgICB9ICk7XG5cbiAgICB0aGlzLnByZXZpZXdUcmFpbFByb3BlcnR5LmxpbmsoIHRyYWlsID0+IHtcbiAgICAgIHByZXZpZXdOb2RlLnJlbW92ZUFsbENoaWxkcmVuKCk7XG4gICAgICBpZiAoIHRyYWlsICkge1xuICAgICAgICBwcmV2aWV3Tm9kZS5hZGRDaGlsZCggcHJldmlld0JhY2tncm91bmQgKTtcbiAgICAgICAgY29uc3Qgbm9kZSA9IHRyYWlsLmxhc3ROb2RlKCk7XG4gICAgICAgIGlmICggbm9kZS5ib3VuZHMuaXNWYWxpZCgpICkge1xuICAgICAgICAgIGNvbnN0IHNjYWxlID0gd2luZG93LmRldmljZVBpeGVsUmF0aW8gKiAwLjkgKiBNYXRoLm1pbiggcHJldmlld0JhY2tncm91bmQuc2VsZkJvdW5kcy53aWR0aCAvIG5vZGUud2lkdGgsIHByZXZpZXdCYWNrZ3JvdW5kLnNlbGZCb3VuZHMuaGVpZ2h0IC8gbm9kZS5oZWlnaHQgKTtcbiAgICAgICAgICBwcmV2aWV3Tm9kZS5hZGRDaGlsZCggbmV3IE5vZGUoIHtcbiAgICAgICAgICAgIHNjYWxlOiBzY2FsZSAvIHdpbmRvdy5kZXZpY2VQaXhlbFJhdGlvLFxuICAgICAgICAgICAgY2VudGVyOiBwcmV2aWV3QmFja2dyb3VuZC5jZW50ZXIsXG4gICAgICAgICAgICBjaGlsZHJlbjogW1xuICAgICAgICAgICAgICBub2RlLnJhc3Rlcml6ZWQoIHtcbiAgICAgICAgICAgICAgICByZXNvbHV0aW9uOiBzY2FsZSxcbiAgICAgICAgICAgICAgICBzb3VyY2VCb3VuZHM6IG5vZGUuYm91bmRzLmRpbGF0ZWQoIG5vZGUuYm91bmRzLndpZHRoICogMC4wMSApLnJvdW5kZWRPdXQoKVxuICAgICAgICAgICAgICB9IClcbiAgICAgICAgICAgIF1cbiAgICAgICAgICB9ICkgKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0gKTtcblxuICAgIGNvbnN0IHNlbGVjdGVkTm9kZUNvbnRlbnQgPSBuZXcgVkJveCgge1xuICAgICAgc3BhY2luZzogMyxcbiAgICAgIGFsaWduOiAnbGVmdCcsXG4gICAgICB2aXNpYmxlUHJvcGVydHk6IHRoaXMuc2VsZWN0ZWROb2RlQ29udGVudFZpc2libGVQcm9wZXJ0eVxuICAgIH0gKTtcbiAgICB0aGlzLnByZXZpZXdUcmFpbFByb3BlcnR5LmxpbmsoIHRyYWlsID0+IHtcbiAgICAgIHNlbGVjdGVkTm9kZUNvbnRlbnQuY2hpbGRyZW4gPSB0cmFpbCA/IGNyZWF0ZUluZm8oIHRyYWlsICkgOiBbXTtcbiAgICB9ICk7XG5cbiAgICBjb25zdCBmdXp6Q2hlY2tib3ggPSBuZXcgSGVscGVyQ2hlY2tib3goIGZ1enpQcm9wZXJ0eSwgJ0Z1enonICk7XG4gICAgY29uc3QgbWVhc3VyaW5nVGFwZVZpc2libGVDaGVja2JveCA9IG5ldyBIZWxwZXJDaGVja2JveCggbWVhc3VyaW5nVGFwZVZpc2libGVQcm9wZXJ0eSwgJ01lYXN1cmluZyBUYXBlJyApO1xuICAgIGNvbnN0IHZpc3VhbFRyZWVWaXNpYmxlQ2hlY2tib3ggPSBuZXcgSGVscGVyQ2hlY2tib3goIHRoaXMudmlzdWFsVHJlZVZpc2libGVQcm9wZXJ0eSwgJ1Zpc3VhbCBUcmVlJyApO1xuICAgIGNvbnN0IHBkb21UcmVlVmlzaWJsZUNoZWNrYm94ID0gbmV3IEhlbHBlckNoZWNrYm94KCB0aGlzLnBkb21UcmVlVmlzaWJsZVByb3BlcnR5LCAnUERPTSBUcmVlJyApO1xuICAgIGNvbnN0IGlucHV0QmFzZWRQaWNraW5nQ2hlY2tib3ggPSBuZXcgSGVscGVyQ2hlY2tib3goIHRoaXMuaW5wdXRCYXNlZFBpY2tpbmdQcm9wZXJ0eSwgJ0lucHV0LWJhc2VkJyApO1xuICAgIGNvbnN0IHVzZUxlYWZOb2RlQ2hlY2tib3ggPSBuZXcgSGVscGVyQ2hlY2tib3goIHRoaXMudXNlTGVhZk5vZGVQcm9wZXJ0eSwgJ1VzZSBMZWFmJywge1xuICAgICAgZW5hYmxlZFByb3BlcnR5OiB0aGlzLmlucHV0QmFzZWRQaWNraW5nUHJvcGVydHlcbiAgICB9ICk7XG5cbiAgICBjb25zdCBoaWdobGlnaHRWaXNpYmxlQ2hlY2tib3ggPSBuZXcgSGVscGVyQ2hlY2tib3goIHRoaXMuaGlnaGxpZ2h0VmlzaWJsZVByb3BlcnR5LCAnSGlnaGxpZ2h0Jywge1xuICAgICAgbGFiZWxPcHRpb25zOiB7XG4gICAgICAgIGZpbGw6IGhpZ2hsaWdodEJhc2VDb2xvclByb3BlcnR5XG4gICAgICB9XG4gICAgfSApO1xuICAgIGNvbnN0IGJvdW5kc1Zpc2libGVDaGVja2JveCA9IG5ldyBIZWxwZXJDaGVja2JveCggdGhpcy5ib3VuZHNWaXNpYmxlUHJvcGVydHksICdCb3VuZHMnLCB7XG4gICAgICBsYWJlbE9wdGlvbnM6IHtcbiAgICAgICAgZmlsbDogYm91bmRzQ29sb3JcbiAgICAgIH1cbiAgICB9ICk7XG4gICAgY29uc3Qgc2VsZkJvdW5kc1Zpc2libGVDaGVja2JveCA9IG5ldyBIZWxwZXJDaGVja2JveCggdGhpcy5zZWxmQm91bmRzVmlzaWJsZVByb3BlcnR5LCAnU2VsZiBCb3VuZHMnLCB7XG4gICAgICBsYWJlbE9wdGlvbnM6IHtcbiAgICAgICAgZmlsbDogc2VsZkJvdW5kc0NvbG9yXG4gICAgICB9XG4gICAgfSApO1xuICAgIGNvbnN0IGdldEhlbHBlck5vZGVWaXNpYmxlQ2hlY2tib3ggPSBuZXcgSGVscGVyQ2hlY2tib3goIHRoaXMuZ2V0SGVscGVyTm9kZVZpc2libGVQcm9wZXJ0eSwgJ2dldEhlbHBlck5vZGUoKScgKTtcblxuICAgIGNvbnN0IHBvaW50ZXJBcmVhVHlwZVJhZGlvQnV0dG9uR3JvdXAgPSBuZXcgQXF1YVJhZGlvQnV0dG9uR3JvdXA8UG9pbnRlckFyZWFUeXBlPiggdGhpcy5wb2ludGVyQXJlYVR5cGVQcm9wZXJ0eSwgW1xuICAgICAge1xuICAgICAgICB2YWx1ZTogUG9pbnRlckFyZWFUeXBlLk1PVVNFLFxuICAgICAgICBjcmVhdGVOb2RlOiAoIHRhbmRlbTogVGFuZGVtICkgPT4gbmV3IFRleHQoICdNb3VzZScsIHsgZm9udFNpemU6IDEyIH0gKVxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgdmFsdWU6IFBvaW50ZXJBcmVhVHlwZS5UT1VDSCxcbiAgICAgICAgY3JlYXRlTm9kZTogKCB0YW5kZW06IFRhbmRlbSApID0+IG5ldyBUZXh0KCAnVG91Y2gnLCB7IGZvbnRTaXplOiAxMiB9IClcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIHZhbHVlOiBQb2ludGVyQXJlYVR5cGUuTk9ORSxcbiAgICAgICAgY3JlYXRlTm9kZTogKCB0YW5kZW06IFRhbmRlbSApID0+IG5ldyBUZXh0KCAnTm9uZScsIHsgZm9udFNpemU6IDEyIH0gKVxuICAgICAgfVxuICAgIF0sIHtcbiAgICAgIG9yaWVudGF0aW9uOiAnaG9yaXpvbnRhbCcsXG4gICAgICBlbmFibGVkUHJvcGVydHk6IHRoaXMuaW5wdXRCYXNlZFBpY2tpbmdQcm9wZXJ0eSxcbiAgICAgIHJhZGlvQnV0dG9uT3B0aW9uczoge1xuICAgICAgICB4U3BhY2luZzogM1xuICAgICAgfSxcbiAgICAgIHNwYWNpbmc6IDEwLFxuICAgICAgdGFuZGVtOiBUYW5kZW0uT1BUX09VVFxuICAgIH0gKTtcblxuICAgIGNvbnN0IHNlbGVjdGVkVHJhaWxDb250ZW50ID0gbmV3IFZCb3goIHtcbiAgICAgIGFsaWduOiAnbGVmdCcsXG4gICAgICB2aXNpYmxlUHJvcGVydHk6IHRoaXMuc2VsZWN0ZWRUcmFpbENvbnRlbnRWaXNpYmxlUHJvcGVydHlcbiAgICB9ICk7XG5cbiAgICB0aGlzLnByZXZpZXdUcmFpbFByb3BlcnR5LmxpbmsoICggdHJhaWw6IFRyYWlsIHwgbnVsbCApID0+IHtcbiAgICAgIHNlbGVjdGVkVHJhaWxDb250ZW50LmNoaWxkcmVuID0gW107XG5cbiAgICAgIGlmICggdHJhaWwgKSB7XG5cbiAgICAgICAgdHJhaWwubm9kZXMuc2xpY2UoKS5mb3JFYWNoKCAoIG5vZGUsIGluZGV4ICkgPT4ge1xuICAgICAgICAgIHNlbGVjdGVkVHJhaWxDb250ZW50LmFkZENoaWxkKCBuZXcgUmljaFRleHQoIGAke2luZGV4ID4gMCA/IHRyYWlsLm5vZGVzWyBpbmRleCAtIDEgXS5jaGlsZHJlbi5pbmRleE9mKCBub2RlICkgOiAnLSd9ICR7bm9kZS5jb25zdHJ1Y3Rvci5uYW1lfWAsIHtcbiAgICAgICAgICAgIGZvbnQ6IG5ldyBQaGV0Rm9udCggMTIgKSxcbiAgICAgICAgICAgIGZpbGw6IGluZGV4ID09PSB0cmFpbC5ub2Rlcy5sZW5ndGggLSAxID8gJ2JsYWNrJyA6ICcjYmJiJyxcbiAgICAgICAgICAgIGxheW91dE9wdGlvbnM6IHtcbiAgICAgICAgICAgICAgbGVmdE1hcmdpbjogaW5kZXggKiAxMFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGN1cnNvcjogJ3BvaW50ZXInLFxuICAgICAgICAgICAgaW5wdXRMaXN0ZW5lcnM6IFsgbmV3IEZpcmVMaXN0ZW5lcigge1xuICAgICAgICAgICAgICBmaXJlOiAoKSA9PiB7XG4gICAgICAgICAgICAgICAgdGhpcy5zZWxlY3RlZFRyYWlsUHJvcGVydHkudmFsdWUgPSB0cmFpbC5zdWJ0cmFpbFRvKCBub2RlICk7XG4gICAgICAgICAgICAgICAgZm9jdXNTZWxlY3RlZCgpO1xuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICB0YW5kZW06IFRhbmRlbS5PUFRfT1VUXG4gICAgICAgICAgICB9ICkgXVxuICAgICAgICAgIH0gKSApO1xuICAgICAgICB9ICk7XG4gICAgICAgIHRyYWlsLmxhc3ROb2RlKCkuY2hpbGRyZW4uZm9yRWFjaCggKCBub2RlLCBpbmRleCApID0+IHtcbiAgICAgICAgICBzZWxlY3RlZFRyYWlsQ29udGVudC5hZGRDaGlsZCggbmV3IFJpY2hUZXh0KCBgJHt0cmFpbC5sYXN0Tm9kZSgpLmNoaWxkcmVuLmluZGV4T2YoIG5vZGUgKX0gJHtub2RlLmNvbnN0cnVjdG9yLm5hbWV9YCwge1xuICAgICAgICAgICAgZm9udDogbmV3IFBoZXRGb250KCAxMiApLFxuICAgICAgICAgICAgZmlsbDogJyM4OGYnLFxuICAgICAgICAgICAgbGF5b3V0T3B0aW9uczoge1xuICAgICAgICAgICAgICBsZWZ0TWFyZ2luOiB0cmFpbC5ub2Rlcy5sZW5ndGggKiAxMFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGN1cnNvcjogJ3BvaW50ZXInLFxuICAgICAgICAgICAgaW5wdXRMaXN0ZW5lcnM6IFsgbmV3IEZpcmVMaXN0ZW5lcigge1xuICAgICAgICAgICAgICBmaXJlOiAoKSA9PiB7XG4gICAgICAgICAgICAgICAgdGhpcy5zZWxlY3RlZFRyYWlsUHJvcGVydHkudmFsdWUgPSB0cmFpbC5jb3B5KCkuYWRkRGVzY2VuZGFudCggbm9kZSwgaW5kZXggKTtcbiAgICAgICAgICAgICAgICBmb2N1c1NlbGVjdGVkKCk7XG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgIHRhbmRlbTogVGFuZGVtLk9QVF9PVVRcbiAgICAgICAgICAgIH0gKSBdXG4gICAgICAgICAgfSApICk7XG4gICAgICAgIH0gKTtcblxuICAgICAgICAvLyBWaXNpYmlsaXR5IGNoZWNrXG4gICAgICAgIGlmICggIXRyYWlsLmlzVmlzaWJsZSgpICkge1xuICAgICAgICAgIHNlbGVjdGVkVHJhaWxDb250ZW50LmFkZENoaWxkKCBuZXcgVGV4dCggJ2ludmlzaWJsZScsIHsgZmlsbDogJyM2MGEnLCBmb250U2l6ZTogMTIgfSApICk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIHRyYWlsLmdldE9wYWNpdHkoKSAhPT0gMSApIHtcbiAgICAgICAgICBzZWxlY3RlZFRyYWlsQ29udGVudC5hZGRDaGlsZCggbmV3IFRleHQoIGBvcGFjaXR5OiAke3RyYWlsLmdldE9wYWNpdHkoKX1gLCB7IGZpbGw6ICcjODg4JywgZm9udFNpemU6IDEyIH0gKSApO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgaGFzUGlja2FibGVGYWxzZUVxdWl2YWxlbnQgPSBfLnNvbWUoIHRyYWlsLm5vZGVzLCBub2RlID0+IHtcbiAgICAgICAgICByZXR1cm4gbm9kZS5waWNrYWJsZSA9PT0gZmFsc2UgfHwgIW5vZGUudmlzaWJsZTtcbiAgICAgICAgfSApO1xuICAgICAgICBjb25zdCBoYXNQaWNrYWJsZVRydWVFcXVpdmFsZW50ID0gXy5zb21lKCB0cmFpbC5ub2Rlcywgbm9kZSA9PiB7XG4gICAgICAgICAgcmV0dXJuIG5vZGUuaW5wdXRMaXN0ZW5lcnMubGVuZ3RoID4gMCB8fCBub2RlLnBpY2thYmxlID09PSB0cnVlO1xuICAgICAgICB9ICk7XG4gICAgICAgIGlmICggIWhhc1BpY2thYmxlRmFsc2VFcXVpdmFsZW50ICYmIGhhc1BpY2thYmxlVHJ1ZUVxdWl2YWxlbnQgKSB7XG4gICAgICAgICAgc2VsZWN0ZWRUcmFpbENvbnRlbnQuYWRkQ2hpbGQoIG5ldyBUZXh0KCAnSGl0IFRlc3RlZCcsIHsgZmlsbDogJyNmMDAnLCBmb250U2l6ZTogMTIgfSApICk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoICF0cmFpbC5nZXRNYXRyaXgoKS5pc0lkZW50aXR5KCkgKSB7XG4gICAgICAgICAgLy8gV2h5IGlzIHRoaXMgd3JhcHBlciBub2RlIG5lZWRlZD9cbiAgICAgICAgICBzZWxlY3RlZFRyYWlsQ29udGVudC5hZGRDaGlsZCggbmV3IE5vZGUoIHsgY2hpbGRyZW46IFsgbmV3IE1hdHJpeDNOb2RlKCB0cmFpbC5nZXRNYXRyaXgoKSApIF0gfSApICk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9ICk7XG5cbiAgICBjb25zdCB2aXN1YWxUcmVlTm9kZSA9IG5ldyBUcmVlTm9kZSggdGhpcy52aXN1YWxUcmVlVmlzaWJsZVByb3BlcnR5LCB0aGlzLCAoKSA9PiBuZXcgVmlzdWFsVHJlZU5vZGUoIG5ldyBUcmFpbCggc2ltRGlzcGxheS5yb290Tm9kZSApLCB0aGlzICkgKTtcbiAgICBjb25zdCBwZG9tVHJlZU5vZGUgPSBuZXcgVHJlZU5vZGUoIHRoaXMucGRvbVRyZWVWaXNpYmxlUHJvcGVydHksIHRoaXMsICgpID0+IG5ldyBQRE9NVHJlZU5vZGUoIHNpbURpc3BsYXkuX3Jvb3RQRE9NSW5zdGFuY2UhLCB0aGlzICkgKTtcblxuICAgIGNvbnN0IGZvY3VzU2VsZWN0ZWQgPSAoKSA9PiB7XG4gICAgICB2aXN1YWxUcmVlTm9kZS5mb2N1c1NlbGVjdGVkKCk7XG4gICAgICBwZG9tVHJlZU5vZGUuZm9jdXNTZWxlY3RlZCgpO1xuICAgIH07XG5cbiAgICBjb25zdCBib3VuZHNQYXRoID0gbmV3IFBhdGgoIG51bGwsIHtcbiAgICAgIHZpc2libGVQcm9wZXJ0eTogdGhpcy5ib3VuZHNWaXNpYmxlUHJvcGVydHksXG4gICAgICBzdHJva2U6IGJvdW5kc0NvbG9yLFxuICAgICAgZmlsbDogYm91bmRzQ29sb3Iud2l0aEFscGhhKCAwLjEgKSxcbiAgICAgIGxpbmVEYXNoOiBbIDIsIDIgXSxcbiAgICAgIGxpbmVEYXNoT2Zmc2V0OiAyXG4gICAgfSApO1xuICAgIHRoaXMucHJldmlld1RyYWlsUHJvcGVydHkubGluayggdHJhaWwgPT4ge1xuICAgICAgaWYgKCB0cmFpbCAmJiB0cmFpbC5sYXN0Tm9kZSgpLmxvY2FsQm91bmRzLmlzVmFsaWQoKSApIHtcbiAgICAgICAgYm91bmRzUGF0aC5zaGFwZSA9IFNoYXBlLmJvdW5kcyggdHJhaWwubGFzdE5vZGUoKS5sb2NhbEJvdW5kcyApLnRyYW5zZm9ybWVkKCB0cmFpbC5nZXRNYXRyaXgoKSApO1xuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgIGJvdW5kc1BhdGguc2hhcGUgPSBudWxsO1xuICAgICAgfVxuICAgIH0gKTtcblxuICAgIGNvbnN0IHNlbGZCb3VuZHNQYXRoID0gbmV3IFBhdGgoIG51bGwsIHtcbiAgICAgIHZpc2libGVQcm9wZXJ0eTogdGhpcy5zZWxmQm91bmRzVmlzaWJsZVByb3BlcnR5LFxuICAgICAgc3Ryb2tlOiBzZWxmQm91bmRzQ29sb3IsXG4gICAgICBmaWxsOiBzZWxmQm91bmRzQ29sb3Iud2l0aEFscGhhKCAwLjEgKSxcbiAgICAgIGxpbmVEYXNoOiBbIDIsIDIgXSxcbiAgICAgIGxpbmVEYXNoT2Zmc2V0OiAxXG4gICAgfSApO1xuICAgIHRoaXMucHJldmlld1RyYWlsUHJvcGVydHkubGluayggdHJhaWwgPT4ge1xuICAgICAgaWYgKCB0cmFpbCAmJiB0cmFpbC5sYXN0Tm9kZSgpLnNlbGZCb3VuZHMuaXNWYWxpZCgpICkge1xuICAgICAgICBzZWxmQm91bmRzUGF0aC5zaGFwZSA9IFNoYXBlLmJvdW5kcyggdHJhaWwubGFzdE5vZGUoKS5zZWxmQm91bmRzICkudHJhbnNmb3JtZWQoIHRyYWlsLmdldE1hdHJpeCgpICk7XG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgc2VsZkJvdW5kc1BhdGguc2hhcGUgPSBudWxsO1xuICAgICAgfVxuICAgIH0gKTtcblxuICAgIGNvbnN0IGhpZ2hsaWdodEZpbGxQcm9wZXJ0eSA9IG5ldyBEZXJpdmVkUHJvcGVydHkoIFsgaGlnaGxpZ2h0QmFzZUNvbG9yUHJvcGVydHkgXSwgY29sb3IgPT4gY29sb3Iud2l0aEFscGhhKCAwLjIgKSwge1xuICAgICAgdGFuZGVtOiBUYW5kZW0uT1BUX09VVFxuICAgIH0gKTtcbiAgICBjb25zdCBoaWdobGlnaHRQYXRoID0gbmV3IFBhdGgoIG51bGwsIHtcbiAgICAgIHN0cm9rZTogaGlnaGxpZ2h0QmFzZUNvbG9yUHJvcGVydHksXG4gICAgICBsaW5lRGFzaDogWyAyLCAyIF0sXG4gICAgICBmaWxsOiBoaWdobGlnaHRGaWxsUHJvcGVydHksXG4gICAgICB2aXNpYmxlUHJvcGVydHk6IHRoaXMuaGlnaGxpZ2h0VmlzaWJsZVByb3BlcnR5XG4gICAgfSApO1xuICAgIHRoaXMucHJldmlld1NoYXBlUHJvcGVydHkubGluayggc2hhcGUgPT4ge1xuICAgICAgaGlnaGxpZ2h0UGF0aC5zaGFwZSA9IHNoYXBlO1xuICAgIH0gKTtcblxuICAgIGNvbnN0IGhlbHBlck5vZGVDb250YWluZXIgPSBuZXcgTm9kZSgge1xuICAgICAgdmlzaWJsZVByb3BlcnR5OiB0aGlzLmdldEhlbHBlck5vZGVWaXNpYmxlUHJvcGVydHlcbiAgICB9ICk7XG4gICAgdGhpcy5zZWxlY3RlZFRyYWlsUHJvcGVydHkubGluayggdHJhaWwgPT4ge1xuICAgICAgaWYgKCB0cmFpbCApIHtcbiAgICAgICAgaGVscGVyTm9kZUNvbnRhaW5lci5tYXRyaXggPSB0cmFpbC5nZXRNYXRyaXgoKTtcbiAgICAgIH1cbiAgICB9ICk7XG4gICAgdGhpcy5oZWxwZXJOb2RlUHJvcGVydHkubGluayggbm9kZSA9PiB7XG4gICAgICBoZWxwZXJOb2RlQ29udGFpbmVyLnJlbW92ZUFsbENoaWxkcmVuKCk7XG4gICAgICBpZiAoIG5vZGUgKSB7XG4gICAgICAgIGhlbHBlck5vZGVDb250YWluZXIuYWRkQ2hpbGQoIG5vZGUgKTtcbiAgICAgIH1cbiAgICB9ICk7XG5cblxuICAgIC8vIHRoaXMuaW5wdXRCYXNlZFBpY2tpbmdQcm9wZXJ0eSA9IG5ldyBCb29sZWFuUHJvcGVydHkoIHRydWUsIHsgdGFuZGVtOiBUYW5kZW0uT1BUX09VVCB9ICk7XG4gICAgLy8gdGhpcy51c2VMZWFmTm9kZVByb3BlcnR5ID0gbmV3IEJvb2xlYW5Qcm9wZXJ0eSggZmFsc2UsIHsgdGFuZGVtOiBUYW5kZW0uT1BUX09VVCB9ICk7XG4gICAgLy8gdGhpcy5wb2ludGVyQXJlYVR5cGVQcm9wZXJ0eSA9IG5ldyBFbnVtZXJhdGlvblByb3BlcnR5KCBQb2ludGVyQXJlYVR5cGUuTU9VU0UsIHsgdGFuZGVtOiBUYW5kZW0uT1BUX09VVCB9ICk7XG5cbiAgICBoZWxwZXJSb290LmFkZENoaWxkKCBib3VuZHNQYXRoICk7XG4gICAgaGVscGVyUm9vdC5hZGRDaGlsZCggc2VsZkJvdW5kc1BhdGggKTtcbiAgICBoZWxwZXJSb290LmFkZENoaWxkKCBoaWdobGlnaHRQYXRoICk7XG4gICAgY29uc3QgYmFja2dyb3VuZE5vZGUgPSBuZXcgTm9kZSgpO1xuXG4gICAgYmFja2dyb3VuZE5vZGUuYWRkSW5wdXRMaXN0ZW5lciggbmV3IFByZXNzTGlzdGVuZXIoIHtcbiAgICAgIHByZXNzOiAoKSA9PiB7XG4gICAgICAgIHRoaXMuc2VsZWN0ZWRUcmFpbFByb3BlcnR5LnZhbHVlID0gdGhpcy5wb2ludGVyVHJhaWxQcm9wZXJ0eS52YWx1ZTtcbiAgICAgICAgZm9jdXNTZWxlY3RlZCgpO1xuICAgICAgfSxcbiAgICAgIHRhbmRlbTogVGFuZGVtLk9QVF9PVVRcbiAgICB9ICkgKTtcbiAgICBoZWxwZXJSb290LmFkZENoaWxkKCBiYWNrZ3JvdW5kTm9kZSApO1xuICAgIGhlbHBlclJvb3QuYWRkQ2hpbGQoIGhlbHBlck5vZGVDb250YWluZXIgKTtcblxuICAgIGNvbnN0IHVuZGVyUG9pbnRlck5vZGUgPSBuZXcgRmxvd0JveCgge1xuICAgICAgb3JpZW50YXRpb246ICd2ZXJ0aWNhbCcsXG4gICAgICBzcGFjaW5nOiA1LFxuICAgICAgYWxpZ246ICdsZWZ0JyxcbiAgICAgIGNoaWxkcmVuOiBbXG4gICAgICAgIHBvc2l0aW9uVGV4dCxcbiAgICAgICAgY29sb3JCYWNrZ3JvdW5kXG4gICAgICBdLFxuICAgICAgdmlzaWJsZVByb3BlcnR5OiB0aGlzLnVuZGVyUG9pbnRlclZpc2libGVQcm9wZXJ0eVxuICAgIH0gKTtcblxuICAgIGNvbnN0IG9wdGlvbnNOb2RlID0gbmV3IFZCb3goIHtcbiAgICAgIHNwYWNpbmc6IDMsXG4gICAgICBhbGlnbjogJ2xlZnQnLFxuICAgICAgY2hpbGRyZW46IFtcbiAgICAgICAgY3JlYXRlSGVhZGVyVGV4dCggJ1Rvb2xzJyApLFxuICAgICAgICBuZXcgVkJveCgge1xuICAgICAgICAgIHNwYWNpbmc6IDMsXG4gICAgICAgICAgYWxpZ246ICdsZWZ0JyxcbiAgICAgICAgICBjaGlsZHJlbjogW1xuICAgICAgICAgICAgbmV3IEhCb3goIHtcbiAgICAgICAgICAgICAgc3BhY2luZzogMTAsXG4gICAgICAgICAgICAgIGNoaWxkcmVuOiBbXG4gICAgICAgICAgICAgICAgZnV6ekNoZWNrYm94LFxuICAgICAgICAgICAgICAgIG1lYXN1cmluZ1RhcGVWaXNpYmxlQ2hlY2tib3hcbiAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgfSApLFxuICAgICAgICAgICAgbmV3IEhCb3goIHtcbiAgICAgICAgICAgICAgc3BhY2luZzogMTAsXG4gICAgICAgICAgICAgIGNoaWxkcmVuOiBbXG4gICAgICAgICAgICAgICAgdmlzdWFsVHJlZVZpc2libGVDaGVja2JveCxcbiAgICAgICAgICAgICAgICAuLi4oIHNpbURpc3BsYXkuX2FjY2Vzc2libGUgPyBbIHBkb21UcmVlVmlzaWJsZUNoZWNrYm94IF0gOiBbXSApXG4gICAgICAgICAgICAgIF1cbiAgICAgICAgICAgIH0gKVxuICAgICAgICAgIF1cbiAgICAgICAgfSApLFxuICAgICAgICBjcmVhdGVIZWFkZXJUZXh0KCAnUGlja2luZycsIHVuZGVmaW5lZCwgeyBsYXlvdXRPcHRpb25zOiB7IHRvcE1hcmdpbjogMyB9IH0gKSxcbiAgICAgICAgbmV3IFZCb3goIHtcbiAgICAgICAgICBzcGFjaW5nOiAzLFxuICAgICAgICAgIGFsaWduOiAnbGVmdCcsXG4gICAgICAgICAgY2hpbGRyZW46IFtcbiAgICAgICAgICAgIG5ldyBIQm94KCB7XG4gICAgICAgICAgICAgIHNwYWNpbmc6IDEwLFxuICAgICAgICAgICAgICBjaGlsZHJlbjogW1xuICAgICAgICAgICAgICAgIGlucHV0QmFzZWRQaWNraW5nQ2hlY2tib3gsXG4gICAgICAgICAgICAgICAgdXNlTGVhZk5vZGVDaGVja2JveFxuICAgICAgICAgICAgICBdXG4gICAgICAgICAgICB9ICksXG4gICAgICAgICAgICBwb2ludGVyQXJlYVR5cGVSYWRpb0J1dHRvbkdyb3VwXG4gICAgICAgICAgXVxuICAgICAgICB9ICksXG4gICAgICAgIGNyZWF0ZUhlYWRlclRleHQoICdTaG93JywgdW5kZWZpbmVkLCB7IGxheW91dE9wdGlvbnM6IHsgdG9wTWFyZ2luOiAzIH0gfSApLFxuICAgICAgICBuZXcgVkJveCgge1xuICAgICAgICAgIHNwYWNpbmc6IDMsXG4gICAgICAgICAgYWxpZ246ICdsZWZ0JyxcbiAgICAgICAgICBjaGlsZHJlbjogW1xuICAgICAgICAgICAgbmV3IEhCb3goIHtcbiAgICAgICAgICAgICAgc3BhY2luZzogMTAsXG4gICAgICAgICAgICAgIGNoaWxkcmVuOiBbXG4gICAgICAgICAgICAgICAgaGlnaGxpZ2h0VmlzaWJsZUNoZWNrYm94LFxuICAgICAgICAgICAgICAgIGdldEhlbHBlck5vZGVWaXNpYmxlQ2hlY2tib3hcbiAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgfSApLFxuICAgICAgICAgICAgbmV3IEhCb3goIHtcbiAgICAgICAgICAgICAgc3BhY2luZzogMTAsXG4gICAgICAgICAgICAgIGNoaWxkcmVuOiBbXG4gICAgICAgICAgICAgICAgYm91bmRzVmlzaWJsZUNoZWNrYm94LFxuICAgICAgICAgICAgICAgIHNlbGZCb3VuZHNWaXNpYmxlQ2hlY2tib3hcbiAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgfSApXG4gICAgICAgICAgXVxuICAgICAgICB9IClcbiAgICAgIF0sXG4gICAgICB2aXNpYmxlUHJvcGVydHk6IHRoaXMub3B0aW9uc1Zpc2libGVQcm9wZXJ0eVxuICAgIH0gKTtcblxuICAgIGNvbnN0IGhlbHBlclJlYWRvdXRDb250ZW50ID0gbmV3IFZCb3goIHtcbiAgICAgIHNwYWNpbmc6IDUsXG4gICAgICBhbGlnbjogJ2xlZnQnLFxuICAgICAgY2hpbGRyZW46IFtcbiAgICAgICAgY3JlYXRlQ29sbGFwc2libGVIZWFkZXJUZXh0KCAnVW5kZXIgUG9pbnRlcicsIHRoaXMudW5kZXJQb2ludGVyVmlzaWJsZVByb3BlcnR5LCB1bmRlclBvaW50ZXJOb2RlLCB7IGxheW91dE9wdGlvbnM6IHsgdG9wTWFyZ2luOiAwIH0gfSApLFxuICAgICAgICB1bmRlclBvaW50ZXJOb2RlLFxuICAgICAgICBjcmVhdGVDb2xsYXBzaWJsZUhlYWRlclRleHQoICdPcHRpb25zJywgdGhpcy5vcHRpb25zVmlzaWJsZVByb3BlcnR5LCBvcHRpb25zTm9kZSApLFxuICAgICAgICBvcHRpb25zTm9kZSxcbiAgICAgICAgY3JlYXRlQ29sbGFwc2libGVIZWFkZXJUZXh0KCAnUHJldmlldycsIHRoaXMucHJldmlld1Zpc2libGVQcm9wZXJ0eSwgcHJldmlld05vZGUgKSxcbiAgICAgICAgcHJldmlld05vZGUsXG4gICAgICAgIGNyZWF0ZUNvbGxhcHNpYmxlSGVhZGVyVGV4dCggJ1NlbGVjdGVkIFRyYWlsJywgdGhpcy5zZWxlY3RlZFRyYWlsQ29udGVudFZpc2libGVQcm9wZXJ0eSwgc2VsZWN0ZWRUcmFpbENvbnRlbnQgKSxcbiAgICAgICAgc2VsZWN0ZWRUcmFpbENvbnRlbnQsXG4gICAgICAgIGNyZWF0ZUNvbGxhcHNpYmxlSGVhZGVyVGV4dCggJ1NlbGVjdGVkIE5vZGUnLCB0aGlzLnNlbGVjdGVkTm9kZUNvbnRlbnRWaXNpYmxlUHJvcGVydHksIHNlbGVjdGVkTm9kZUNvbnRlbnQgKSxcbiAgICAgICAgc2VsZWN0ZWROb2RlQ29udGVudFxuICAgICAgXSxcbiAgICAgIHZpc2libGVQcm9wZXJ0eTogdGhpcy5oZWxwZXJWaXNpYmxlUHJvcGVydHlcbiAgICB9ICk7XG4gICAgY29uc3QgaGVscGVyUmVhZG91dENvbGxhcHNpYmxlID0gbmV3IFZCb3goIHtcbiAgICAgIHNwYWNpbmc6IDUsXG4gICAgICBhbGlnbjogJ2xlZnQnLFxuICAgICAgY2hpbGRyZW46IFtcbiAgICAgICAgY3JlYXRlQ29sbGFwc2libGVIZWFkZXJUZXh0KCAnSGVscGVyJywgdGhpcy5oZWxwZXJWaXNpYmxlUHJvcGVydHksIGhlbHBlclJlYWRvdXRDb250ZW50ICksXG4gICAgICAgIG5ldyBIU2VwYXJhdG9yKCksXG4gICAgICAgIGhlbHBlclJlYWRvdXRDb250ZW50XG4gICAgICBdXG4gICAgfSApO1xuICAgIGNvbnN0IGhlbHBlclJlYWRvdXRQYW5lbCA9IG5ldyBQYW5lbCggaGVscGVyUmVhZG91dENvbGxhcHNpYmxlLCB7XG4gICAgICBmaWxsOiAncmdiYSgyNTUsMjU1LDI1NSwwLjg1KScsXG4gICAgICBzdHJva2U6ICdyZ2JhKDAsMCwwLDAuODUpJyxcbiAgICAgIGNvcm5lclJhZGl1czogMFxuICAgIH0gKTtcbiAgICBoZWxwZXJSZWFkb3V0UGFuZWwuYWRkSW5wdXRMaXN0ZW5lciggbmV3IERyYWdMaXN0ZW5lcigge1xuICAgICAgdHJhbnNsYXRlTm9kZTogdHJ1ZSxcbiAgICAgIHRhcmdldE5vZGU6IGhlbHBlclJlYWRvdXRQYW5lbCxcbiAgICAgIHRhbmRlbTogVGFuZGVtLk9QVF9PVVRcbiAgICB9ICkgKTtcblxuICAgIC8vIEFsbG93IHNjcm9sbGluZyB0byBzY3JvbGwgdGhlIHBhbmVsJ3MgcG9zaXRpb25cbiAgICBoZWxwZXJSZWFkb3V0UGFuZWwuYWRkSW5wdXRMaXN0ZW5lcigge1xuICAgICAgd2hlZWw6IGV2ZW50ID0+IHtcbiAgICAgICAgY29uc3QgZGVsdGFZID0gZXZlbnQuZG9tRXZlbnQhLmRlbHRhWTtcbiAgICAgICAgY29uc3QgbXVsdGlwbGllciA9IDE7XG4gICAgICAgIGhlbHBlclJlYWRvdXRQYW5lbC55IC09IGRlbHRhWSAqIG11bHRpcGxpZXI7XG4gICAgICB9XG4gICAgfSApO1xuICAgIGhlbHBlclJvb3QuYWRkQ2hpbGQoIGhlbHBlclJlYWRvdXRQYW5lbCApO1xuXG4gICAgaGVscGVyUm9vdC5hZGRDaGlsZCggdmlzdWFsVHJlZU5vZGUgKTtcbiAgICBoZWxwZXJSb290LmFkZENoaWxkKCBwZG9tVHJlZU5vZGUgKTtcblxuICAgIGNvbnN0IG1lYXN1cmluZ1RhcGVOb2RlID0gbmV3IE1lYXN1cmluZ1RhcGVOb2RlKCBtZWFzdXJpbmdUYXBlVW5pdHNQcm9wZXJ0eSwge1xuICAgICAgdGFuZGVtOiBUYW5kZW0uT1BUX09VVCxcbiAgICAgIHZpc2libGVQcm9wZXJ0eTogbWVhc3VyaW5nVGFwZVZpc2libGVQcm9wZXJ0eSxcbiAgICAgIHRleHRCYWNrZ3JvdW5kQ29sb3I6ICdyZ2JhKDAsMCwwLDAuNSknXG4gICAgfSApO1xuICAgIG1lYXN1cmluZ1RhcGVOb2RlLmJhc2VQb3NpdGlvblByb3BlcnR5LnZhbHVlID0gbmV3IFZlY3RvcjIoIDEwMCwgMzAwICk7XG4gICAgbWVhc3VyaW5nVGFwZU5vZGUudGlwUG9zaXRpb25Qcm9wZXJ0eS52YWx1ZSA9IG5ldyBWZWN0b3IyKCAyMDAsIDMwMCApO1xuICAgIGhlbHBlclJvb3QuYWRkQ2hpbGQoIG1lYXN1cmluZ1RhcGVOb2RlICk7XG5cbiAgICBjb25zdCByZXNpemVMaXN0ZW5lciA9ICggc2l6ZTogRGltZW5zaW9uMiApID0+IHtcbiAgICAgIHRoaXMuaGVscGVyRGlzcGxheSEud2lkdGggPSBzaXplLndpZHRoO1xuICAgICAgdGhpcy5oZWxwZXJEaXNwbGF5IS5oZWlnaHQgPSBzaXplLmhlaWdodDtcbiAgICAgIGxheW91dEJvdW5kc1Byb3BlcnR5LnZhbHVlID0gbGF5b3V0Qm91bmRzUHJvcGVydHkudmFsdWUud2l0aE1heFgoIHNpemUud2lkdGggKS53aXRoTWF4WSggc2l6ZS5oZWlnaHQgKTtcbiAgICAgIGJhY2tncm91bmROb2RlLm1vdXNlQXJlYSA9IG5ldyBCb3VuZHMyKCAwLCAwLCBzaXplLndpZHRoLCBzaXplLmhlaWdodCApO1xuICAgICAgYmFja2dyb3VuZE5vZGUudG91Y2hBcmVhID0gbmV3IEJvdW5kczIoIDAsIDAsIHNpemUud2lkdGgsIHNpemUuaGVpZ2h0ICk7XG5cbiAgICAgIHZpc3VhbFRyZWVOb2RlLnJlc2l6ZSggc2l6ZSApO1xuICAgICAgcGRvbVRyZWVOb2RlLnJlc2l6ZSggc2l6ZSApO1xuICAgIH07XG5cbiAgICBjb25zdCBmcmFtZUxpc3RlbmVyID0gKCBkdDogbnVtYmVyICkgPT4ge1xuICAgICAgdGhpcy5vdmVySW50ZXJmYWNlUHJvcGVydHkudmFsdWUgPVxuICAgICAgICBoZWxwZXJSZWFkb3V0UGFuZWwuYm91bmRzLmNvbnRhaW5zUG9pbnQoIHRoaXMucG9pbnRlclBvc2l0aW9uUHJvcGVydHkudmFsdWUgKSB8fFxuICAgICAgICAoIHRoaXMudmlzdWFsVHJlZVZpc2libGVQcm9wZXJ0eS52YWx1ZSAmJiB2aXN1YWxUcmVlTm9kZS5ib3VuZHMuY29udGFpbnNQb2ludCggdGhpcy5wb2ludGVyUG9zaXRpb25Qcm9wZXJ0eS52YWx1ZSApICkgfHxcbiAgICAgICAgKCB0aGlzLnBkb21UcmVlVmlzaWJsZVByb3BlcnR5LnZhbHVlICYmIHBkb21UcmVlTm9kZS5ib3VuZHMuY29udGFpbnNQb2ludCggdGhpcy5wb2ludGVyUG9zaXRpb25Qcm9wZXJ0eS52YWx1ZSApICkgfHxcbiAgICAgICAgaGVscGVyTm9kZUNvbnRhaW5lci5jb250YWluc1BvaW50KCB0aGlzLnBvaW50ZXJQb3NpdGlvblByb3BlcnR5LnZhbHVlICk7XG5cbiAgICAgIHRoaXMuaGVscGVyRGlzcGxheT8udXBkYXRlRGlzcGxheSgpO1xuICAgIH07XG5cbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCAna2V5dXAnLCAoIGV2ZW50OiBLZXlib2FyZEV2ZW50ICkgPT4ge1xuICAgICAgaWYgKCBldmVudC5rZXkgPT09ICdFc2NhcGUnICkge1xuICAgICAgICB0aGlzLnNlbGVjdGVkVHJhaWxQcm9wZXJ0eS52YWx1ZSA9IG51bGw7XG4gICAgICB9XG4gICAgfSApO1xuXG4gICAgdGhpcy5hY3RpdmVQcm9wZXJ0eS5sYXp5TGluayggYWN0aXZlID0+IHtcbiAgICAgIGlmICggYWN0aXZlICkge1xuICAgICAgICBzaW0uYWN0aXZlUHJvcGVydHkudmFsdWUgPSBmYWxzZTtcblxuICAgICAgICBjb25zdCBzY3JlZW4gPSBzaW0uc2VsZWN0ZWRTY3JlZW5Qcm9wZXJ0eS52YWx1ZTtcbiAgICAgICAgaWYgKCBzY3JlZW4uaGFzVmlldygpICkge1xuICAgICAgICAgIHRoaXMuc2NyZWVuVmlld1Byb3BlcnR5LnZhbHVlID0gc2NyZWVuLnZpZXc7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgdGhpcy5zY3JlZW5WaWV3UHJvcGVydHkudmFsdWUgPSBudWxsO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5oZWxwZXJEaXNwbGF5ID0gbmV3IERpc3BsYXkoIGhlbHBlclJvb3QsIHtcbiAgICAgICAgICBhc3N1bWVGdWxsV2luZG93OiB0cnVlXG4gICAgICAgIH0gKTtcbiAgICAgICAgdGhpcy5oZWxwZXJEaXNwbGF5LmluaXRpYWxpemVFdmVudHMoKTtcblxuICAgICAgICBzaW0uZGltZW5zaW9uUHJvcGVydHkubGluayggcmVzaXplTGlzdGVuZXIgKTtcbiAgICAgICAgYW5pbWF0aW9uRnJhbWVUaW1lci5hZGRMaXN0ZW5lciggZnJhbWVMaXN0ZW5lciApO1xuXG4gICAgICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoIHRoaXMuaGVscGVyRGlzcGxheS5kb21FbGVtZW50ICk7XG4gICAgICAgIHRoaXMuaGVscGVyRGlzcGxheS5kb21FbGVtZW50LnN0eWxlLnpJbmRleCA9ICcxMDAwMCc7XG5cbiAgICAgICAgY29uc3Qgb25Mb2NhdGlvbkV2ZW50ID0gKCBldmVudDogU2NlbmVyeUV2ZW50PFRvdWNoRXZlbnQgfCBQb2ludGVyRXZlbnQgfCBNb3VzZUV2ZW50PiApID0+IHtcbiAgICAgICAgICB0aGlzLnBvaW50ZXJQb3NpdGlvblByb3BlcnR5LnZhbHVlID0gZXZlbnQucG9pbnRlci5wb2ludDtcbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLmhlbHBlckRpc3BsYXkuYWRkSW5wdXRMaXN0ZW5lcigge1xuICAgICAgICAgIG1vdmU6IG9uTG9jYXRpb25FdmVudCxcbiAgICAgICAgICBkb3duOiBvbkxvY2F0aW9uRXZlbnQsXG4gICAgICAgICAgdXA6IG9uTG9jYXRpb25FdmVudFxuICAgICAgICB9ICk7XG5cbiAgICAgICAgaWYgKCB0aGlzLnNjcmVlblZpZXdQcm9wZXJ0eS52YWx1ZSApIHtcbiAgICAgICAgICBtZWFzdXJpbmdUYXBlVW5pdHNQcm9wZXJ0eS52YWx1ZSA9IHtcbiAgICAgICAgICAgIG5hbWU6ICd2aWV3IHVuaXRzJyxcbiAgICAgICAgICAgIG11bHRpcGxpZXI6IHRoaXMuc2NyZWVuVmlld1Byb3BlcnR5LnZhbHVlLmdldEdsb2JhbFRvTG9jYWxNYXRyaXgoKS5nZXRTY2FsZVZlY3RvcigpLnhcbiAgICAgICAgICB9O1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5zaW1EaXNwbGF5LmZvcmVpZ25PYmplY3RSYXN0ZXJpemF0aW9uKCAoIGRhdGFVUkk6IHN0cmluZyB8IG51bGwgKSA9PiB7XG4gICAgICAgICAgaWYgKCBkYXRhVVJJICkge1xuICAgICAgICAgICAgY29uc3QgaW1hZ2UgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCAnaW1nJyApO1xuICAgICAgICAgICAgaW1hZ2UuYWRkRXZlbnRMaXN0ZW5lciggJ2xvYWQnLCAoKSA9PiB7XG4gICAgICAgICAgICAgIGNvbnN0IHdpZHRoID0gaW1hZ2Uud2lkdGg7XG4gICAgICAgICAgICAgIGNvbnN0IGhlaWdodCA9IGltYWdlLmhlaWdodDtcblxuICAgICAgICAgICAgICBjb25zdCBjYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCAnY2FudmFzJyApO1xuICAgICAgICAgICAgICBjb25zdCBjb250ZXh0ID0gY2FudmFzLmdldENvbnRleHQoICcyZCcgKSE7XG4gICAgICAgICAgICAgIGNhbnZhcy53aWR0aCA9IHdpZHRoO1xuICAgICAgICAgICAgICBjYW52YXMuaGVpZ2h0ID0gaGVpZ2h0O1xuICAgICAgICAgICAgICBjb250ZXh0LmRyYXdJbWFnZSggaW1hZ2UsIDAsIDAgKTtcblxuICAgICAgICAgICAgICBpZiAoIHRoaXMuYWN0aXZlUHJvcGVydHkudmFsdWUgKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5pbWFnZURhdGFQcm9wZXJ0eS52YWx1ZSA9IGNvbnRleHQuZ2V0SW1hZ2VEYXRhKCAwLCAwLCB3aWR0aCwgaGVpZ2h0ICk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gKTtcbiAgICAgICAgICAgIGltYWdlLnNyYyA9IGRhdGFVUkk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgY29uc29sZS5sb2coICdDb3VsZCBub3QgbG9hZCBmb3JlaWduIG9iamVjdCByYXN0ZXJpemF0aW9uJyApO1xuICAgICAgICAgIH1cbiAgICAgICAgfSApO1xuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgIHNpbS5kaW1lbnNpb25Qcm9wZXJ0eS51bmxpbmsoIHJlc2l6ZUxpc3RlbmVyICk7XG4gICAgICAgIGFuaW1hdGlvbkZyYW1lVGltZXIucmVtb3ZlTGlzdGVuZXIoIGZyYW1lTGlzdGVuZXIgKTtcblxuICAgICAgICBkb2N1bWVudC5ib2R5LnJlbW92ZUNoaWxkKCB0aGlzLmhlbHBlckRpc3BsYXkhLmRvbUVsZW1lbnQgKTtcblxuICAgICAgICB0aGlzLmhlbHBlckRpc3BsYXkhLmRpc3Bvc2UoKTtcblxuICAgICAgICAvLyBVbnBhdXNlIHRoZSBzaW11bGF0aW9uXG4gICAgICAgIHNpbS5hY3RpdmVQcm9wZXJ0eS52YWx1ZSA9IHRydWU7XG5cbiAgICAgICAgLy8gQ2xlYXIgaW1hZ2VEYXRhIHNpbmNlIGl0IHdvbid0IGJlIGFjY3VyYXRlIHdoZW4gd2UgcmUtb3BlblxuICAgICAgICB0aGlzLmltYWdlRGF0YVByb3BlcnR5LnZhbHVlID0gbnVsbDtcblxuICAgICAgICAvLyBIaWRlIHRoZSB0cmVlIHdoZW4gY2xvc2luZywgc28gaXQgc3RhcnRzIHVwIHF1aWNrbHlcbiAgICAgICAgdGhpcy52aXN1YWxUcmVlVmlzaWJsZVByb3BlcnR5LnZhbHVlID0gZmFsc2U7XG4gICAgICB9XG4gICAgfSApO1xuICB9XG5cbiAgLy8gU2luZ2xldG9uLCBsYXppbHkgY3JlYXRlZCBzbyB3ZSBkb24ndCBzbG93IGRvd24gc3RhcnR1cFxuICBwdWJsaWMgc3RhdGljIGhlbHBlcj86IEhlbHBlcjtcblxuICBwdWJsaWMgc3RhdGljIGluaXRpYWxpemUoIHNpbTogU2ltLCBzaW1EaXNwbGF5OiBTaW1EaXNwbGF5ICk6IHZvaWQge1xuICAgIC8vIEN0cmwgKyBzaGlmdCArIEggKHdpbGwgb3BlbiB0aGUgaGVscGVyKVxuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoICdrZXlkb3duJywgKCBldmVudDogS2V5Ym9hcmRFdmVudCApID0+IHtcbiAgICAgIGlmICggZXZlbnQuY3RybEtleSAmJiBldmVudC5rZXkgPT09ICdIJyApIHtcblxuICAgICAgICAvLyBMYXp5IGNyZWF0aW9uXG4gICAgICAgIGlmICggIUhlbHBlci5oZWxwZXIgKSB7XG4gICAgICAgICAgSGVscGVyLmhlbHBlciA9IG5ldyBIZWxwZXIoIHNpbSwgc2ltRGlzcGxheSApO1xuICAgICAgICB9XG5cbiAgICAgICAgSGVscGVyLmhlbHBlci5hY3RpdmVQcm9wZXJ0eS52YWx1ZSA9ICFIZWxwZXIuaGVscGVyLmFjdGl2ZVByb3BlcnR5LnZhbHVlO1xuICAgICAgfVxuICAgIH0gKTtcbiAgfVxufVxuXG5qb2lzdC5yZWdpc3RlciggJ0hlbHBlcicsIEhlbHBlciApO1xuXG50eXBlIEhlbHBlckNoZWNrYm94U2VsZk9wdGlvbnMgPSB7XG4gIGxhYmVsT3B0aW9ucz86IFJpY2hUZXh0T3B0aW9ucztcbn07XG5cbnR5cGUgSGVscGVyQ2hlY2tib3hPcHRpb25zID0gSGVscGVyQ2hlY2tib3hTZWxmT3B0aW9ucyAmIENoZWNrYm94T3B0aW9ucztcblxuY2xhc3MgSGVscGVyQ2hlY2tib3ggZXh0ZW5kcyBDaGVja2JveCB7XG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggcHJvcGVydHk6IFByb3BlcnR5PGJvb2xlYW4+LCBsYWJlbDogc3RyaW5nLCBwcm92aWRlZE9wdGlvbnM/OiBIZWxwZXJDaGVja2JveE9wdGlvbnMgKSB7XG4gICAgY29uc3Qgb3B0aW9ucyA9IG9wdGlvbml6ZTxIZWxwZXJDaGVja2JveE9wdGlvbnMsIEhlbHBlckNoZWNrYm94U2VsZk9wdGlvbnMsIENoZWNrYm94T3B0aW9ucz4oKSgge1xuICAgICAgdGFuZGVtOiBUYW5kZW0uT1BUX09VVCxcbiAgICAgIGJveFdpZHRoOiAxNCxcbiAgICAgIGxhYmVsT3B0aW9uczoge1xuICAgICAgICBmb250OiBuZXcgUGhldEZvbnQoIDEyIClcbiAgICAgIH1cbiAgICB9LCBwcm92aWRlZE9wdGlvbnMgKTtcblxuICAgIHN1cGVyKCBwcm9wZXJ0eSwgbmV3IFJpY2hUZXh0KCBsYWJlbCwgb3B0aW9ucy5sYWJlbE9wdGlvbnMgKSwgb3B0aW9ucyApO1xuICB9XG59XG5cbi8vIGNsYXNzIERyYWdnYWJsZURpdmlkZXIgZXh0ZW5kcyBSZWN0YW5nbGUge1xuLy8gICBjb25zdHJ1Y3RvciggcHJlZmVycmVkQm91bmRzUHJvcGVydHksIG9yaWVudGF0aW9uLCBpbml0aWFsU2VwYXJhdG9yTG9jYXRpb24sIHB1c2hGcm9tTWF4ICkge1xuLy9cbi8vICAgICBzdXBlcigge1xuLy8gICAgICAgZmlsbDogJyM2NjYnLFxuLy8gICAgICAgY3Vyc29yOiBvcmllbnRhdGlvbiA9PT0gJ2hvcml6b250YWwnID8gJ3ctcmVzaXplJyA6ICduLXJlc2l6ZSdcbi8vICAgICB9ICk7XG4vL1xuLy8gICAgIHRoaXMubWluQm91bmRzUHJvcGVydHkgPSBuZXcgVGlueVByb3BlcnR5KCBuZXcgQm91bmRzMiggMCwgMCwgMCwgMCApICk7XG4vLyAgICAgdGhpcy5tYXhCb3VuZHNQcm9wZXJ0eSA9IG5ldyBUaW55UHJvcGVydHkoIG5ldyBCb3VuZHMyKCAwLCAwLCAwLCAwICkgKTtcbi8vXG4vLyAgICAgdGhpcy5wcmVmZXJyZWRCb3VuZHNQcm9wZXJ0eSA9IHByZWZlcnJlZEJvdW5kc1Byb3BlcnR5O1xuLy8gICAgIHRoaXMub3JpZW50YXRpb24gPSBvcmllbnRhdGlvbjtcbi8vICAgICB0aGlzLnByaW1hcnlDb29yZGluYXRlID0gb3JpZW50YXRpb24gPT09ICdob3Jpem9udGFsJyA/ICd4JyA6ICd5Jztcbi8vICAgICB0aGlzLnNlY29uZGFyeUNvb3JkaW5hdGUgPSBvcmllbnRhdGlvbiA9PT0gJ2hvcml6b250YWwnID8gJ3knIDogJ3gnO1xuLy8gICAgIHRoaXMucHJpbWFyeU5hbWUgPSBvcmllbnRhdGlvbiA9PT0gJ2hvcml6b250YWwnID8gJ3dpZHRoJyA6ICdoZWlnaHQnO1xuLy8gICAgIHRoaXMuc2Vjb25kYXJ5TmFtZSA9IG9yaWVudGF0aW9uID09PSAnaG9yaXpvbnRhbCcgPyAnaGVpZ2h0JyA6ICd3aWR0aCc7XG4vLyAgICAgdGhpcy5wcmltYXJ5UmVjdE5hbWUgPSBvcmllbnRhdGlvbiA9PT0gJ2hvcml6b250YWwnID8gJ3JlY3RXaWR0aCcgOiAncmVjdEhlaWdodCc7XG4vLyAgICAgdGhpcy5zZWNvbmRhcnlSZWN0TmFtZSA9IG9yaWVudGF0aW9uID09PSAnaG9yaXpvbnRhbCcgPyAncmVjdEhlaWdodCcgOiAncmVjdFdpZHRoJztcbi8vICAgICB0aGlzLm1pbkNvb3JkaW5hdGUgPSBvcmllbnRhdGlvbiA9PT0gJ2hvcml6b250YWwnID8gJ2xlZnQnIDogJ3RvcCc7XG4vLyAgICAgdGhpcy5tYXhDb29yZGluYXRlID0gb3JpZW50YXRpb24gPT09ICdob3Jpem9udGFsJyA/ICdyaWdodCcgOiAnYm90dG9tJztcbi8vICAgICB0aGlzLmNlbnRlck5hbWUgPSBvcmllbnRhdGlvbiA9PT0gJ2hvcml6b250YWwnID8gJ2NlbnRlclgnIDogJ2NlbnRlclknO1xuLy8gICAgIHRoaXMubWluaW11bSA9IDEwMDtcbi8vXG4vLyAgICAgdGhpcy5zZXBhcmF0b3JMb2NhdGlvbiA9IGluaXRpYWxTZXBhcmF0b3JMb2NhdGlvbjtcbi8vXG4vLyAgICAgdGhpc1sgdGhpcy5wcmltYXJ5UmVjdE5hbWUgXSA9IDI7XG4vL1xuLy8gICAgIHZhciBkcmFnTGlzdGVuZXIgPSBuZXcgcGhldC5zY2VuZXJ5LkRyYWdMaXN0ZW5lcigge1xuLy8gICAgICAgZHJhZzogZXZlbnQgPT4ge1xuLy8gICAgICAgICB0aGlzLnNlcGFyYXRvckxvY2F0aW9uID0gZHJhZ0xpc3RlbmVyLnBhcmVudFBvaW50WyB0aGlzLnByaW1hcnlDb29yZGluYXRlIF07XG4vLyAgICAgICAgIHRoaXMubGF5b3V0KCk7XG4vLyAgICAgICB9XG4vLyAgICAgfSApO1xuLy8gICAgIHRoaXMuYWRkSW5wdXRMaXN0ZW5lciggZHJhZ0xpc3RlbmVyICk7XG4vL1xuLy8gICAgIHByZWZlcnJlZEJvdW5kc1Byb3BlcnR5LmxpbmsoICggbmV3UHJlZmVycmVkQm91bmRzLCBvbGRQcmVmZXJyZWRCb3VuZHMgKSA9PiB7XG4vLyAgICAgICBpZiAoIHB1c2hGcm9tTWF4ICYmIG9sZFByZWZlcnJlZEJvdW5kcyApIHtcbi8vICAgICAgICAgdGhpcy5zZXBhcmF0b3JMb2NhdGlvbiArPSBuZXdQcmVmZXJyZWRCb3VuZHNbIHRoaXMubWF4Q29vcmRpbmF0ZSBdIC0gb2xkUHJlZmVycmVkQm91bmRzWyB0aGlzLm1heENvb3JkaW5hdGUgXTtcbi8vICAgICAgIH1cbi8vICAgICAgIGlmICggIXB1c2hGcm9tTWF4ICYmIG9sZFByZWZlcnJlZEJvdW5kcyApIHtcbi8vICAgICAgICAgdGhpcy5zZXBhcmF0b3JMb2NhdGlvbiArPSBuZXdQcmVmZXJyZWRCb3VuZHNbIHRoaXMubWluQ29vcmRpbmF0ZSBdIC0gb2xkUHJlZmVycmVkQm91bmRzWyB0aGlzLm1pbkNvb3JkaW5hdGUgXTtcbi8vICAgICAgIH1cbi8vICAgICAgIHRoaXMubGF5b3V0KCk7XG4vLyAgICAgfSApO1xuLy8gICB9XG4vL1xuLy8gICAvKipcbi8vIC8vICAgICovXG4vLyAgIGxheW91dCgpIHtcbi8vICAgICB2YXIgcHJlZmVycmVkQm91bmRzID0gdGhpcy5wcmVmZXJyZWRCb3VuZHNQcm9wZXJ0eS52YWx1ZTtcbi8vICAgICB2YXIgc2VwYXJhdG9yTG9jYXRpb24gPSB0aGlzLnNlcGFyYXRvckxvY2F0aW9uO1xuLy9cbi8vICAgICBpZiAoIHNlcGFyYXRvckxvY2F0aW9uIDwgcHJlZmVycmVkQm91bmRzWyB0aGlzLm1pbkNvb3JkaW5hdGUgXSArIHRoaXMubWluaW11bSApIHtcbi8vICAgICAgIHNlcGFyYXRvckxvY2F0aW9uID0gcHJlZmVycmVkQm91bmRzWyB0aGlzLm1pbkNvb3JkaW5hdGUgXSArIHRoaXMubWluaW11bTtcbi8vICAgICB9XG4vLyAgICAgaWYgKCBzZXBhcmF0b3JMb2NhdGlvbiA+IHByZWZlcnJlZEJvdW5kc1sgdGhpcy5tYXhDb29yZGluYXRlIF0gLSB0aGlzLm1pbmltdW0gKSB7XG4vLyAgICAgICBpZiAoIHByZWZlcnJlZEJvdW5kc1sgdGhpcy5wcmltYXJ5TmFtZSBdID49IHRoaXMubWluaW11bSAqIDIgKSB7XG4vLyAgICAgICAgIHNlcGFyYXRvckxvY2F0aW9uID0gcHJlZmVycmVkQm91bmRzWyB0aGlzLm1heENvb3JkaW5hdGUgXSAtIHRoaXMubWluaW11bTtcbi8vICAgICAgIH1cbi8vICAgICAgIGVsc2Uge1xuLy8gICAgICAgICBzZXBhcmF0b3JMb2NhdGlvbiA9IHByZWZlcnJlZEJvdW5kc1sgdGhpcy5taW5Db29yZGluYXRlIF0gKyBwcmVmZXJyZWRCb3VuZHNbIHRoaXMucHJpbWFyeU5hbWUgXSAvIDI7XG4vLyAgICAgICB9XG4vLyAgICAgfVxuLy9cbi8vICAgICB0aGlzWyB0aGlzLmNlbnRlck5hbWUgXSA9IHNlcGFyYXRvckxvY2F0aW9uO1xuLy8gICAgIHRoaXNbIHRoaXMuc2Vjb25kYXJ5Q29vcmRpbmF0ZSBdID0gcHJlZmVycmVkQm91bmRzWyB0aGlzLnNlY29uZGFyeUNvb3JkaW5hdGUgXTtcbi8vICAgICB0aGlzWyB0aGlzLnNlY29uZGFyeVJlY3ROYW1lIF0gPSBwcmVmZXJyZWRCb3VuZHNbIHRoaXMuc2Vjb25kYXJ5TmFtZSBdO1xuLy9cbi8vICAgICBpZiAoIHRoaXMub3JpZW50YXRpb24gPT09ICdob3Jpem9udGFsJyApIHtcbi8vICAgICAgIHRoaXMubW91c2VBcmVhID0gdGhpcy50b3VjaEFyZWEgPSB0aGlzLmxvY2FsQm91bmRzLmRpbGF0ZWRYKCA1ICk7XG4vLyAgICAgfVxuLy8gICAgIGVsc2Uge1xuLy8gICAgICAgdGhpcy5tb3VzZUFyZWEgPSB0aGlzLnRvdWNoQXJlYSA9IHRoaXMubG9jYWxCb3VuZHMuZGlsYXRlZFkoIDUgKTtcbi8vICAgICB9XG4vL1xuLy8gICAgIHZhciBtaW5Cb3VuZHMgPSBwcmVmZXJyZWRCb3VuZHMuY29weSgpO1xuLy8gICAgIHZhciBtYXhCb3VuZHMgPSBwcmVmZXJyZWRCb3VuZHMuY29weSgpO1xuLy8gICAgIGlmICggdGhpcy5vcmllbnRhdGlvbiA9PT0gJ2hvcml6b250YWwnICkge1xuLy8gICAgICAgbWluQm91bmRzLm1heFggPSBzZXBhcmF0b3JMb2NhdGlvbiAtIHRoaXMud2lkdGggLyAyO1xuLy8gICAgICAgbWF4Qm91bmRzLm1pblggPSBzZXBhcmF0b3JMb2NhdGlvbiArIHRoaXMud2lkdGggLyAyO1xuLy8gICAgIH1cbi8vICAgICBlbHNlIHtcbi8vICAgICAgIG1pbkJvdW5kcy5tYXhZID0gc2VwYXJhdG9yTG9jYXRpb24gLSB0aGlzLmhlaWdodCAvIDI7XG4vLyAgICAgICBtYXhCb3VuZHMubWluWSA9IHNlcGFyYXRvckxvY2F0aW9uICsgdGhpcy5oZWlnaHQgLyAyO1xuLy8gICAgIH1cbi8vICAgICB0aGlzLm1pbkJvdW5kc1Byb3BlcnR5LnZhbHVlID0gbWluQm91bmRzO1xuLy8gICAgIHRoaXMubWF4Qm91bmRzUHJvcGVydHkudmFsdWUgPSBtYXhCb3VuZHM7XG4vLyAgIH1cbi8vIH1cblxudHlwZSBDb2xsYXBzaWJsZVRyZWVOb2RlU2VsZk9wdGlvbnM8VD4gPSB7XG4gIGNyZWF0ZUNoaWxkcmVuPzogKCkgPT4gVFtdO1xuICBzcGFjaW5nPzogbnVtYmVyO1xuICBpbmRlbnQ/OiBudW1iZXI7XG59O1xuXG50eXBlIENvbGxhcHNpYmxlVHJlZU5vZGVPcHRpb25zPFQ+ID0gQ29sbGFwc2libGVUcmVlTm9kZVNlbGZPcHRpb25zPFQ+ICYgTm9kZU9wdGlvbnM7XG5cbmNsYXNzIENvbGxhcHNpYmxlVHJlZU5vZGU8VCBleHRlbmRzIFBET01UcmVlTm9kZSB8IFZpc3VhbFRyZWVOb2RlPiBleHRlbmRzIE5vZGUge1xuXG4gIHB1YmxpYyBzZWxmTm9kZTogTm9kZTtcbiAgcHVibGljIGV4cGFuZGVkUHJvcGVydHk6IFRQcm9wZXJ0eTxib29sZWFuPjtcbiAgcHVibGljIGNoaWxkVHJlZU5vZGVzOiBPYnNlcnZhYmxlQXJyYXk8VD47XG4gIHB1YmxpYyBleHBhbmRDb2xsYXBzZUJ1dHRvbjogTm9kZTtcblxuICBwcml2YXRlIGNoaWxkQ29udGFpbmVyOiBOb2RlO1xuXG4gIHB1YmxpYyBjb25zdHJ1Y3Rvciggc2VsZk5vZGU6IE5vZGUsIHByb3ZpZGVkT3B0aW9ucz86IENvbGxhcHNpYmxlVHJlZU5vZGVPcHRpb25zPFQ+ICkge1xuICAgIGNvbnN0IG9wdGlvbnMgPSBvcHRpb25pemU8Q29sbGFwc2libGVUcmVlTm9kZU9wdGlvbnM8VD4sIENvbGxhcHNpYmxlVHJlZU5vZGVTZWxmT3B0aW9uczxUPiwgTm9kZU9wdGlvbnM+KCkoIHtcbiAgICAgIGNyZWF0ZUNoaWxkcmVuOiAoKSA9PiBbXSxcbiAgICAgIHNwYWNpbmc6IDAsXG4gICAgICBpbmRlbnQ6IDVcbiAgICB9LCBwcm92aWRlZE9wdGlvbnMgKTtcblxuICAgIHN1cGVyKCB7XG4gICAgICBleGNsdWRlSW52aXNpYmxlQ2hpbGRyZW5Gcm9tQm91bmRzOiB0cnVlXG4gICAgfSApO1xuXG4gICAgdGhpcy5zZWxmTm9kZSA9IHNlbGZOb2RlO1xuICAgIHRoaXMuc2VsZk5vZGUuY2VudGVyWSA9IDA7XG5cbiAgICB0aGlzLmV4cGFuZGVkUHJvcGVydHkgPSBuZXcgVGlueVByb3BlcnR5KCB0cnVlICk7XG4gICAgdGhpcy5jaGlsZFRyZWVOb2RlcyA9IGNyZWF0ZU9ic2VydmFibGVBcnJheTxUPigge1xuICAgICAgZWxlbWVudHM6IG9wdGlvbnMuY3JlYXRlQ2hpbGRyZW4oKVxuICAgIH0gKTtcblxuICAgIGNvbnN0IGJ1dHRvblNpemUgPSAxMjtcbiAgICBjb25zdCBleHBhbmRDb2xsYXBzZVNoYXBlID0gbmV3IFNoYXBlKClcbiAgICAgIC5tb3ZlVG9Qb2ludCggVmVjdG9yMi5jcmVhdGVQb2xhciggYnV0dG9uU2l6ZSAvIDIuNSwgMyAvIDQgKiBNYXRoLlBJICkucGx1c1hZKCBidXR0b25TaXplIC8gOCwgMCApIClcbiAgICAgIC5saW5lVG8oIGJ1dHRvblNpemUgLyA4LCAwIClcbiAgICAgIC5saW5lVG9Qb2ludCggVmVjdG9yMi5jcmVhdGVQb2xhciggYnV0dG9uU2l6ZSAvIDIuNSwgNSAvIDQgKiBNYXRoLlBJICkucGx1c1hZKCBidXR0b25TaXplIC8gOCwgMCApICk7XG4gICAgdGhpcy5leHBhbmRDb2xsYXBzZUJ1dHRvbiA9IG5ldyBSZWN0YW5nbGUoIC1idXR0b25TaXplIC8gMiwgLWJ1dHRvblNpemUgLyAyLCBidXR0b25TaXplLCBidXR0b25TaXplLCB7XG4gICAgICBjaGlsZHJlbjogW1xuICAgICAgICBuZXcgUGF0aCggZXhwYW5kQ29sbGFwc2VTaGFwZSwge1xuICAgICAgICAgIHN0cm9rZTogJyM4ODgnLFxuICAgICAgICAgIGxpbmVDYXA6ICdyb3VuZCcsXG4gICAgICAgICAgbGluZVdpZHRoOiAxLjVcbiAgICAgICAgfSApXG4gICAgICBdLFxuICAgICAgdmlzaWJsZTogZmFsc2UsXG4gICAgICBjdXJzb3I6ICdwb2ludGVyJyxcbiAgICAgIHJpZ2h0OiAwXG4gICAgfSApO1xuICAgIHRoaXMuZXhwYW5kZWRQcm9wZXJ0eS5saW5rKCBleHBhbmRlZCA9PiB7XG4gICAgICB0aGlzLmV4cGFuZENvbGxhcHNlQnV0dG9uLnJvdGF0aW9uID0gZXhwYW5kZWQgPyBNYXRoLlBJIC8gMiA6IDA7XG4gICAgfSApO1xuICAgIHRoaXMuZXhwYW5kQ29sbGFwc2VCdXR0b24uYWRkSW5wdXRMaXN0ZW5lciggbmV3IEZpcmVMaXN0ZW5lcigge1xuICAgICAgZmlyZTogKCkgPT4ge1xuICAgICAgICB0aGlzLmV4cGFuZGVkUHJvcGVydHkudmFsdWUgPSAhdGhpcy5leHBhbmRlZFByb3BlcnR5LnZhbHVlO1xuICAgICAgfSxcbiAgICAgIHRhbmRlbTogVGFuZGVtLk9QVF9PVVRcbiAgICB9ICkgKTtcblxuICAgIHRoaXMuYWRkQ2hpbGQoIHRoaXMuZXhwYW5kQ29sbGFwc2VCdXR0b24gKTtcblxuICAgIHRoaXMuY2hpbGRDb250YWluZXIgPSBuZXcgRmxvd0JveCgge1xuICAgICAgb3JpZW50YXRpb246ICd2ZXJ0aWNhbCcsXG4gICAgICBhbGlnbjogJ2xlZnQnLFxuICAgICAgc3BhY2luZzogb3B0aW9ucy5zcGFjaW5nLFxuICAgICAgY2hpbGRyZW46IHRoaXMuY2hpbGRUcmVlTm9kZXMsXG4gICAgICB4OiBvcHRpb25zLmluZGVudCxcbiAgICAgIHk6IHRoaXMuc2VsZk5vZGUuYm90dG9tICsgb3B0aW9ucy5zcGFjaW5nLFxuICAgICAgdmlzaWJsZVByb3BlcnR5OiB0aGlzLmV4cGFuZGVkUHJvcGVydHlcbiAgICB9ICk7XG4gICAgdGhpcy5hZGRDaGlsZCggdGhpcy5jaGlsZENvbnRhaW5lciApO1xuXG4gICAgdGhpcy5hZGRDaGlsZCggc2VsZk5vZGUgKTtcblxuICAgIGNvbnN0IG9uQ2hpbGRyZW5DaGFuZ2UgPSAoKSA9PiB7XG4gICAgICB0aGlzLmNoaWxkQ29udGFpbmVyLmNoaWxkcmVuID0gdGhpcy5jaGlsZFRyZWVOb2RlcztcbiAgICAgIHRoaXMuZXhwYW5kQ29sbGFwc2VCdXR0b24udmlzaWJsZSA9IHRoaXMuY2hpbGRUcmVlTm9kZXMubGVuZ3RoID4gMDtcbiAgICB9O1xuXG4gICAgdGhpcy5jaGlsZFRyZWVOb2Rlcy5hZGRJdGVtQWRkZWRMaXN0ZW5lciggKCkgPT4ge1xuICAgICAgb25DaGlsZHJlbkNoYW5nZSgpO1xuICAgIH0gKTtcbiAgICB0aGlzLmNoaWxkVHJlZU5vZGVzLmFkZEl0ZW1SZW1vdmVkTGlzdGVuZXIoICgpID0+IHtcbiAgICAgIG9uQ2hpbGRyZW5DaGFuZ2UoKTtcbiAgICB9ICk7XG4gICAgb25DaGlsZHJlbkNoYW5nZSgpO1xuXG4gICAgdGhpcy5tdXRhdGUoIG9wdGlvbnMgKTtcbiAgfVxuXG4gIHB1YmxpYyBleHBhbmQoKTogdm9pZCB7XG4gICAgdGhpcy5leHBhbmRlZFByb3BlcnR5LnZhbHVlID0gdHJ1ZTtcbiAgfVxuXG4gIHB1YmxpYyBjb2xsYXBzZSgpOiB2b2lkIHtcbiAgICB0aGlzLmV4cGFuZGVkUHJvcGVydHkudmFsdWUgPSBmYWxzZTtcbiAgfVxuXG4gIHB1YmxpYyBleHBhbmRSZWN1c2l2ZWx5KCk6IHZvaWQge1xuICAgIHRoaXMuZXhwYW5kZWRQcm9wZXJ0eS52YWx1ZSA9IHRydWU7XG4gICAgdGhpcy5jaGlsZFRyZWVOb2Rlcy5mb3JFYWNoKCB0cmVlTm9kZSA9PiB7XG4gICAgICB0cmVlTm9kZS5leHBhbmRSZWN1c2l2ZWx5KCk7XG4gICAgfSApO1xuICB9XG5cbiAgcHVibGljIGNvbGxhcHNlUmVjdXJzaXZlbHkoKTogdm9pZCB7XG4gICAgdGhpcy5leHBhbmRlZFByb3BlcnR5LnZhbHVlID0gZmFsc2U7XG4gICAgdGhpcy5jaGlsZFRyZWVOb2Rlcy5mb3JFYWNoKCB0cmVlTm9kZSA9PiB7XG4gICAgICB0cmVlTm9kZS5jb2xsYXBzZVJlY3Vyc2l2ZWx5KCk7XG4gICAgfSApO1xuICB9XG59XG5cbmNsYXNzIFZpc3VhbFRyZWVOb2RlIGV4dGVuZHMgQ29sbGFwc2libGVUcmVlTm9kZTxWaXN1YWxUcmVlTm9kZT4ge1xuXG4gIHB1YmxpYyB0cmFpbDogVHJhaWw7XG5cbiAgcHVibGljIGNvbnN0cnVjdG9yKCB0cmFpbDogVHJhaWwsIGhlbHBlcjogSGVscGVyICkge1xuXG4gICAgY29uc3Qgbm9kZSA9IHRyYWlsLmxhc3ROb2RlKCk7XG4gICAgY29uc3QgaXNWaXNpYmxlID0gdHJhaWwuaXNWaXNpYmxlKCk7XG5cbiAgICBjb25zdCBUUkVFX0ZPTlQgPSBuZXcgRm9udCggeyBzaXplOiAxMiB9ICk7XG5cbiAgICBjb25zdCBuYW1lTm9kZSA9IG5ldyBIQm94KCB7IHNwYWNpbmc6IDUgfSApO1xuXG4gICAgY29uc3QgbmFtZSA9IG5vZGUuY29uc3RydWN0b3IubmFtZTtcbiAgICBpZiAoIG5hbWUgKSB7XG4gICAgICBuYW1lTm9kZS5hZGRDaGlsZCggbmV3IFRleHQoIG5hbWUsIHtcbiAgICAgICAgZm9udDogVFJFRV9GT05ULFxuICAgICAgICBwaWNrYWJsZTogZmFsc2UsXG4gICAgICAgIGZpbGw6IGlzVmlzaWJsZSA/ICcjMDAwJyA6ICcjNjBhJ1xuICAgICAgfSApICk7XG4gICAgfVxuICAgIGlmICggbm9kZSBpbnN0YW5jZW9mIFRleHQgKSB7XG4gICAgICBuYW1lTm9kZS5hZGRDaGlsZCggbmV3IFRleHQoICdcIicgKyBub2RlLnN0cmluZyArICdcIicsIHtcbiAgICAgICAgZm9udDogVFJFRV9GT05ULFxuICAgICAgICBwaWNrYWJsZTogZmFsc2UsXG4gICAgICAgIGZpbGw6ICcjNjY2J1xuICAgICAgfSApICk7XG4gICAgfVxuXG4gICAgY29uc3Qgc2VsZkJhY2tncm91bmQgPSBSZWN0YW5nbGUuYm91bmRzKCBuYW1lTm9kZS5ib3VuZHMsIHtcbiAgICAgIGNoaWxkcmVuOiBbIG5hbWVOb2RlIF0sXG4gICAgICBjdXJzb3I6ICdwb2ludGVyJyxcbiAgICAgIGZpbGw6IG5ldyBEZXJpdmVkUHJvcGVydHkoIFsgaGVscGVyLnNlbGVjdGVkVHJhaWxQcm9wZXJ0eSwgaGVscGVyLnBvaW50ZXJUcmFpbFByb3BlcnR5IF0sICggc2VsZWN0ZWQsIGFjdGl2ZSApID0+IHtcbiAgICAgICAgaWYgKCBzZWxlY3RlZCAmJiB0cmFpbC5lcXVhbHMoIHNlbGVjdGVkICkgKSB7XG4gICAgICAgICAgcmV0dXJuICdyZ2JhKDAsMTI4LDI1NSwwLjQpJztcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmICggYWN0aXZlICYmIHRyYWlsLmVxdWFscyggYWN0aXZlICkgKSB7XG4gICAgICAgICAgcmV0dXJuICdyZ2JhKDAsMTI4LDI1NSwwLjIpJztcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICByZXR1cm4gJ3RyYW5zcGFyZW50JztcbiAgICAgICAgfVxuICAgICAgfSwge1xuICAgICAgICB0YW5kZW06IFRhbmRlbS5PUFRfT1VUXG4gICAgICB9IClcbiAgICB9ICk7XG5cbiAgICBzZWxmQmFja2dyb3VuZC5hZGRJbnB1dExpc3RlbmVyKCB7XG4gICAgICBlbnRlcjogKCkgPT4ge1xuICAgICAgICBoZWxwZXIudHJlZUhvdmVyVHJhaWxQcm9wZXJ0eS52YWx1ZSA9IHRyYWlsO1xuICAgICAgfSxcbiAgICAgIGV4aXQ6ICgpID0+IHtcbiAgICAgICAgaGVscGVyLnRyZWVIb3ZlclRyYWlsUHJvcGVydHkudmFsdWUgPSBudWxsO1xuICAgICAgfVxuICAgIH0gKTtcbiAgICBzZWxmQmFja2dyb3VuZC5hZGRJbnB1dExpc3RlbmVyKCBuZXcgRmlyZUxpc3RlbmVyKCB7XG4gICAgICBmaXJlOiAoKSA9PiB7XG4gICAgICAgIGhlbHBlci5zZWxlY3RlZFRyYWlsUHJvcGVydHkudmFsdWUgPSB0cmFpbDtcbiAgICAgIH0sXG4gICAgICB0YW5kZW06IFRhbmRlbS5PUFRfT1VUXG4gICAgfSApICk7XG5cbiAgICBzdXBlciggc2VsZkJhY2tncm91bmQsIHtcbiAgICAgIGNyZWF0ZUNoaWxkcmVuOiAoKSA9PiB0cmFpbC5sYXN0Tm9kZSgpLmNoaWxkcmVuLm1hcCggY2hpbGQgPT4ge1xuICAgICAgICByZXR1cm4gbmV3IFZpc3VhbFRyZWVOb2RlKCB0cmFpbC5jb3B5KCkuYWRkRGVzY2VuZGFudCggY2hpbGQgKSwgaGVscGVyICk7XG4gICAgICB9IClcbiAgICB9ICk7XG5cbiAgICBpZiAoICFub2RlLnZpc2libGUgKSB7XG4gICAgICB0aGlzLmV4cGFuZGVkUHJvcGVydHkudmFsdWUgPSBmYWxzZTtcbiAgICB9XG5cbiAgICB0aGlzLnRyYWlsID0gdHJhaWw7XG4gIH1cblxuICBwdWJsaWMgZmluZCggdHJhaWw6IFRyYWlsICk6IFZpc3VhbFRyZWVOb2RlIHwgbnVsbCB7XG4gICAgaWYgKCB0cmFpbC5lcXVhbHMoIHRoaXMudHJhaWwgKSApIHtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIGNvbnN0IHRyZWVOb2RlID0gXy5maW5kKCB0aGlzLmNoaWxkVHJlZU5vZGVzLCBjaGlsZFRyZWVOb2RlID0+IHtcbiAgICAgICAgcmV0dXJuIHRyYWlsLmlzRXh0ZW5zaW9uT2YoIGNoaWxkVHJlZU5vZGUudHJhaWwsIHRydWUgKTtcbiAgICAgIH0gKTtcbiAgICAgIGlmICggdHJlZU5vZGUgKSB7XG4gICAgICAgIHJldHVybiB0cmVlTm9kZS5maW5kKCB0cmFpbCApO1xuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgICAgfVxuICAgIH1cbiAgfVxufVxuXG5jbGFzcyBQRE9NVHJlZU5vZGUgZXh0ZW5kcyBDb2xsYXBzaWJsZVRyZWVOb2RlPFBET01UcmVlTm9kZT4ge1xuXG4gIHB1YmxpYyB0cmFpbDogVHJhaWw7XG4gIHB1YmxpYyBpbnN0YW5jZTogUERPTUluc3RhbmNlO1xuXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggaW5zdGFuY2U6IFBET01JbnN0YW5jZSwgaGVscGVyOiBIZWxwZXIgKSB7XG5cbiAgICBjb25zdCB0cmFpbCA9IGluc3RhbmNlLnRyYWlsITtcbiAgICBjb25zdCBpc1Zpc2libGUgPSB0cmFpbC5pc1BET01WaXNpYmxlKCk7XG5cbiAgICBjb25zdCBUUkVFX0ZPTlQgPSBuZXcgRm9udCggeyBzaXplOiAxMiB9ICk7XG5cbiAgICBjb25zdCBzZWxmTm9kZSA9IG5ldyBIQm94KCB7IHNwYWNpbmc6IDUgfSApO1xuXG4gICAgaWYgKCB0cmFpbC5ub2Rlcy5sZW5ndGggKSB7XG4gICAgICBjb25zdCBmaWxsID0gaXNWaXNpYmxlID8gJyMwMDAnIDogJyM2MGEnO1xuICAgICAgY29uc3Qgbm9kZSA9IHRyYWlsLmxhc3ROb2RlKCk7XG5cbiAgICAgIGlmICggbm9kZS50YWdOYW1lICkge1xuICAgICAgICBzZWxmTm9kZS5hZGRDaGlsZCggbmV3IFRleHQoIG5vZGUudGFnTmFtZSwgeyBmb250OiBuZXcgRm9udCggeyBzaXplOiAxMiwgd2VpZ2h0OiAnYm9sZCcgfSApLCBmaWxsOiBmaWxsIH0gKSApO1xuICAgICAgfVxuXG4gICAgICBpZiAoIG5vZGUubGFiZWxDb250ZW50ICkge1xuICAgICAgICBzZWxmTm9kZS5hZGRDaGlsZCggbmV3IFRleHQoIG5vZGUubGFiZWxDb250ZW50LCB7IGZvbnQ6IFRSRUVfRk9OVCwgZmlsbDogJyM4MDAnIH0gKSApO1xuICAgICAgfVxuICAgICAgaWYgKCBub2RlLmlubmVyQ29udGVudCApIHtcbiAgICAgICAgc2VsZk5vZGUuYWRkQ2hpbGQoIG5ldyBUZXh0KCBub2RlLmlubmVyQ29udGVudCwgeyBmb250OiBUUkVFX0ZPTlQsIGZpbGw6ICcjMDgwJyB9ICkgKTtcbiAgICAgIH1cbiAgICAgIGlmICggbm9kZS5kZXNjcmlwdGlvbkNvbnRlbnQgKSB7XG4gICAgICAgIHNlbGZOb2RlLmFkZENoaWxkKCBuZXcgVGV4dCggbm9kZS5kZXNjcmlwdGlvbkNvbnRlbnQsIHsgZm9udDogVFJFRV9GT05ULCBmaWxsOiAnIzQ0NCcgfSApICk7XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IHBhcmVudFRyYWlsID0gaW5zdGFuY2UucGFyZW50ID8gaW5zdGFuY2UucGFyZW50LnRyYWlsISA6IG5ldyBUcmFpbCgpO1xuICAgICAgY29uc3QgbmFtZSA9IHRyYWlsLm5vZGVzLnNsaWNlKCBwYXJlbnRUcmFpbC5ub2Rlcy5sZW5ndGggKS5tYXAoIG5vZGUgPT4gbm9kZS5jb25zdHJ1Y3Rvci5uYW1lICkuZmlsdGVyKCBuID0+IG4gIT09ICdOb2RlJyApLmpvaW4oICcsJyApO1xuXG4gICAgICBpZiAoIG5hbWUgKSB7XG4gICAgICAgIHNlbGZOb2RlLmFkZENoaWxkKCBuZXcgVGV4dCggYCgke25hbWV9KWAsIHsgZm9udDogVFJFRV9GT05ULCBmaWxsOiAnIzAwOCcgfSApICk7XG4gICAgICB9XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgc2VsZk5vZGUuYWRkQ2hpbGQoIG5ldyBUZXh0KCAnKHJvb3QpJywgeyBmb250OiBUUkVFX0ZPTlQgfSApICk7XG4gICAgfVxuXG4gICAgLy8gUmVmYWN0b3IgdGhpcyBjb2RlIG91dD9cbiAgICBjb25zdCBzZWxmQmFja2dyb3VuZCA9IFJlY3RhbmdsZS5ib3VuZHMoIHNlbGZOb2RlLmJvdW5kcywge1xuICAgICAgY2hpbGRyZW46IFtcbiAgICAgICAgc2VsZk5vZGVcbiAgICAgIF0sXG4gICAgICBjdXJzb3I6ICdwb2ludGVyJyxcbiAgICAgIGZpbGw6IG5ldyBEZXJpdmVkUHJvcGVydHkoIFsgaGVscGVyLnNlbGVjdGVkVHJhaWxQcm9wZXJ0eSwgaGVscGVyLnBvaW50ZXJUcmFpbFByb3BlcnR5IF0sICggc2VsZWN0ZWQsIGFjdGl2ZSApID0+IHtcbiAgICAgICAgaWYgKCBzZWxlY3RlZCAmJiB0cmFpbC5lcXVhbHMoIHNlbGVjdGVkICkgKSB7XG4gICAgICAgICAgcmV0dXJuICdyZ2JhKDAsMTI4LDI1NSwwLjQpJztcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmICggYWN0aXZlICYmIHRyYWlsLmVxdWFscyggYWN0aXZlICkgKSB7XG4gICAgICAgICAgcmV0dXJuICdyZ2JhKDAsMTI4LDI1NSwwLjIpJztcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICByZXR1cm4gJ3RyYW5zcGFyZW50JztcbiAgICAgICAgfVxuICAgICAgfSwge1xuICAgICAgICB0YW5kZW06IFRhbmRlbS5PUFRfT1VUXG4gICAgICB9IClcbiAgICB9ICk7XG5cbiAgICBpZiAoIHRyYWlsLmxlbmd0aCApIHtcbiAgICAgIHNlbGZCYWNrZ3JvdW5kLmFkZElucHV0TGlzdGVuZXIoIHtcbiAgICAgICAgZW50ZXI6ICgpID0+IHtcbiAgICAgICAgICBoZWxwZXIudHJlZUhvdmVyVHJhaWxQcm9wZXJ0eS52YWx1ZSA9IHRyYWlsO1xuICAgICAgICB9LFxuICAgICAgICBleGl0OiAoKSA9PiB7XG4gICAgICAgICAgaGVscGVyLnRyZWVIb3ZlclRyYWlsUHJvcGVydHkudmFsdWUgPSBudWxsO1xuICAgICAgICB9XG4gICAgICB9ICk7XG4gICAgICBzZWxmQmFja2dyb3VuZC5hZGRJbnB1dExpc3RlbmVyKCBuZXcgRmlyZUxpc3RlbmVyKCB7XG4gICAgICAgIGZpcmU6ICgpID0+IHtcbiAgICAgICAgICBoZWxwZXIuc2VsZWN0ZWRUcmFpbFByb3BlcnR5LnZhbHVlID0gdHJhaWw7XG4gICAgICAgIH0sXG4gICAgICAgIHRhbmRlbTogVGFuZGVtLk9QVF9PVVRcbiAgICAgIH0gKSApO1xuICAgIH1cblxuICAgIHN1cGVyKCBzZWxmQmFja2dyb3VuZCwge1xuICAgICAgY3JlYXRlQ2hpbGRyZW46ICgpID0+IGluc3RhbmNlLmNoaWxkcmVuLm1hcCggKCBpbnN0YW5jZTogUERPTUluc3RhbmNlICkgPT4gbmV3IFBET01UcmVlTm9kZSggaW5zdGFuY2UsIGhlbHBlciApIClcbiAgICB9ICk7XG5cbiAgICB0aGlzLmluc3RhbmNlID0gaW5zdGFuY2U7XG4gICAgdGhpcy50cmFpbCA9IHRyYWlsO1xuICB9XG5cbiAgcHVibGljIGZpbmQoIHRyYWlsOiBUcmFpbCApOiBQRE9NVHJlZU5vZGUgfCBudWxsIHtcbiAgICBpZiAoIHRyYWlsLmVxdWFscyggdGhpcy5pbnN0YW5jZS50cmFpbCEgKSApIHtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIGNvbnN0IHRyZWVOb2RlID0gXy5maW5kKCB0aGlzLmNoaWxkVHJlZU5vZGVzLCBjaGlsZFRyZWVOb2RlID0+IHtcbiAgICAgICAgcmV0dXJuIHRyYWlsLmlzRXh0ZW5zaW9uT2YoIGNoaWxkVHJlZU5vZGUuaW5zdGFuY2UudHJhaWwhLCB0cnVlICk7XG4gICAgICB9ICk7XG4gICAgICBpZiAoIHRyZWVOb2RlICkge1xuICAgICAgICByZXR1cm4gdHJlZU5vZGUuZmluZCggdHJhaWwgKTtcbiAgICAgIH1cbiAgICAgIGVsc2Uge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cblxuY2xhc3MgVHJlZU5vZGU8VCBleHRlbmRzICggVmlzdWFsVHJlZU5vZGUgfCBQRE9NVHJlZU5vZGUgKT4gZXh0ZW5kcyBSZWN0YW5nbGUge1xuXG4gIHB1YmxpYyB0cmVlQ29udGFpbmVyOiBOb2RlO1xuICBwdWJsaWMgdHJlZU5vZGU/OiBUO1xuICBwdWJsaWMgaGVscGVyOiBIZWxwZXI7XG5cbiAgcHVibGljIGNvbnN0cnVjdG9yKCB2aXNpYmxlUHJvcGVydHk6IFRQcm9wZXJ0eTxib29sZWFuPiwgaGVscGVyOiBIZWxwZXIsIGNyZWF0ZVRyZWVOb2RlOiAoKSA9PiBUICkge1xuICAgIHN1cGVyKCB7XG4gICAgICBmaWxsOiAncmdiYSgyNTUsMjU1LDI1NSwwLjg1KScsXG4gICAgICBzdHJva2U6ICdibGFjaycsXG4gICAgICByZWN0V2lkdGg6IDQwMCxcbiAgICAgIHZpc2libGVQcm9wZXJ0eTogdmlzaWJsZVByb3BlcnR5LFxuICAgICAgcGlja2FibGU6IHRydWVcbiAgICB9ICk7XG5cbiAgICB0aGlzLmhlbHBlciA9IGhlbHBlcjtcblxuICAgIHRoaXMudHJlZUNvbnRhaW5lciA9IG5ldyBOb2RlKCk7XG4gICAgdGhpcy5hZGRDaGlsZCggdGhpcy50cmVlQ29udGFpbmVyICk7XG5cbiAgICB0aGlzLmFkZElucHV0TGlzdGVuZXIoIG5ldyBEcmFnTGlzdGVuZXIoIHtcbiAgICAgIHRhcmdldE5vZGU6IHRoaXMsXG4gICAgICBkcmFnOiAoIGV2ZW50LCBsaXN0ZW5lciApID0+IHtcbiAgICAgICAgdGhpcy54ID0gdGhpcy54ICsgbGlzdGVuZXIubW9kZWxEZWx0YS54O1xuICAgICAgfSxcbiAgICAgIHRhbmRlbTogVGFuZGVtLk9QVF9PVVRcbiAgICB9ICkgKTtcbiAgICB0aGlzLmFkZElucHV0TGlzdGVuZXIoIHtcbiAgICAgIHdoZWVsOiBldmVudCA9PiB7XG4gICAgICAgIGNvbnN0IGRlbHRhWCA9IGV2ZW50LmRvbUV2ZW50IS5kZWx0YVg7XG4gICAgICAgIGNvbnN0IGRlbHRhWSA9IGV2ZW50LmRvbUV2ZW50IS5kZWx0YVk7XG4gICAgICAgIGNvbnN0IG11bHRpcGxpZXIgPSAxO1xuICAgICAgICBpZiAoIHRoaXMudHJlZU5vZGUgKSB7XG4gICAgICAgICAgdGhpcy50cmVlTm9kZS54IC09IGRlbHRhWCAqIG11bHRpcGxpZXI7XG4gICAgICAgICAgdGhpcy50cmVlTm9kZS55IC09IGRlbHRhWSAqIG11bHRpcGxpZXI7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5jb25zdHJhaW5UcmVlKCk7XG4gICAgICB9XG4gICAgfSApO1xuXG4gICAgLy8gV2hlbiB0aGVyZSBpc24ndCBhIHNlbGVjdGVkIHRyYWlsLCBmb2N1cyB3aGF0ZXZlciBvdXIgcG9pbnRlciBpcyBvdmVyXG4gICAgaGVscGVyLnBvaW50ZXJUcmFpbFByb3BlcnR5LmxhenlMaW5rKCAoKSA9PiB7XG4gICAgICBpZiAoICFoZWxwZXIuc2VsZWN0ZWRUcmFpbFByb3BlcnR5LnZhbHVlICkge1xuICAgICAgICB0aGlzLmZvY3VzUG9pbnRlcigpO1xuICAgICAgfVxuICAgIH0gKTtcblxuICAgIE11bHRpbGluay5tdWx0aWxpbmsoIFsgaGVscGVyLmFjdGl2ZVByb3BlcnR5LCB2aXNpYmxlUHJvcGVydHkgXSwgKCBhY3RpdmUsIHRyZWVWaXNpYmxlICkgPT4ge1xuICAgICAgaWYgKCBhY3RpdmUgJiYgdHJlZVZpc2libGUgKSB7XG4gICAgICAgIHRoaXMudHJlZU5vZGUgPSBjcmVhdGVUcmVlTm9kZSgpO1xuXG4gICAgICAgIC8vIEhhdmUgdGhlIGNvbnN0cmFpbiBwcm9wZXJseSBwb3NpdGlvbiBpdFxuICAgICAgICB0aGlzLnRyZWVOb2RlLnggPSA1MDA7XG4gICAgICAgIHRoaXMudHJlZU5vZGUueSA9IDUwMDtcblxuICAgICAgICB0aGlzLnRyZWVDb250YWluZXIuY2hpbGRyZW4gPSBbIHRoaXMudHJlZU5vZGUgXTtcbiAgICAgICAgdGhpcy5mb2N1c1NlbGVjdGVkKCk7XG4gICAgICAgIHRoaXMuY29uc3RyYWluVHJlZSgpO1xuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgIHRoaXMudHJlZUNvbnRhaW5lci5jaGlsZHJlbiA9IFtdO1xuICAgICAgfVxuICAgIH0gKTtcbiAgfVxuXG4gIHB1YmxpYyByZXNpemUoIHNpemU6IERpbWVuc2lvbjIgKTogdm9pZCB7XG4gICAgdGhpcy5yZWN0SGVpZ2h0ID0gc2l6ZS5oZWlnaHQ7XG4gICAgdGhpcy5yaWdodCA9IHNpemUud2lkdGg7XG4gICAgdGhpcy50cmVlQ29udGFpbmVyLmNsaXBBcmVhID0gU2hhcGUuYm91bmRzKCB0aGlzLmxvY2FsQm91bmRzLmRpbGF0ZWQoIDEwICkgKTtcbiAgfVxuXG4gIHB1YmxpYyBjb25zdHJhaW5UcmVlKCk6IHZvaWQge1xuICAgIGNvbnN0IHRyZWVNYXJnaW5YID0gODtcbiAgICBjb25zdCB0cmVlTWFyZ2luWSA9IDU7XG5cbiAgICBpZiAoIHRoaXMudHJlZU5vZGUgKSB7XG4gICAgICBpZiAoIHRoaXMudHJlZU5vZGUuYm90dG9tIDwgdGhpcy5zZWxmQm91bmRzLmJvdHRvbSAtIHRyZWVNYXJnaW5ZICkge1xuICAgICAgICB0aGlzLnRyZWVOb2RlLmJvdHRvbSA9IHRoaXMuc2VsZkJvdW5kcy5ib3R0b20gLSB0cmVlTWFyZ2luWTtcbiAgICAgIH1cbiAgICAgIGlmICggdGhpcy50cmVlTm9kZS50b3AgPiB0aGlzLnNlbGZCb3VuZHMudG9wICsgdHJlZU1hcmdpblkgKSB7XG4gICAgICAgIHRoaXMudHJlZU5vZGUudG9wID0gdGhpcy5zZWxmQm91bmRzLnRvcCArIHRyZWVNYXJnaW5ZO1xuICAgICAgfVxuICAgICAgaWYgKCB0aGlzLnRyZWVOb2RlLnJpZ2h0IDwgdGhpcy5zZWxmQm91bmRzLnJpZ2h0IC0gdHJlZU1hcmdpblggKSB7XG4gICAgICAgIHRoaXMudHJlZU5vZGUucmlnaHQgPSB0aGlzLnNlbGZCb3VuZHMucmlnaHQgLSB0cmVlTWFyZ2luWDtcbiAgICAgIH1cbiAgICAgIGlmICggdGhpcy50cmVlTm9kZS5sZWZ0ID4gdGhpcy5zZWxmQm91bmRzLmxlZnQgKyB0cmVlTWFyZ2luWCApIHtcbiAgICAgICAgdGhpcy50cmVlTm9kZS5sZWZ0ID0gdGhpcy5zZWxmQm91bmRzLmxlZnQgKyB0cmVlTWFyZ2luWDtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBwdWJsaWMgZm9jdXNUcmFpbCggdHJhaWw6IFRyYWlsICk6IHZvaWQge1xuICAgIGlmICggdGhpcy50cmVlTm9kZSApIHtcbiAgICAgIGNvbnN0IHRyZWVOb2RlID0gdGhpcy50cmVlTm9kZS5maW5kKCB0cmFpbCApO1xuICAgICAgaWYgKCB0cmVlTm9kZSApIHtcbiAgICAgICAgY29uc3QgZGVsdGFZID0gdHJlZU5vZGUubG9jYWxUb0dsb2JhbFBvaW50KCB0cmVlTm9kZS5zZWxmTm9kZS5jZW50ZXIgKS55IC0gdGhpcy5jZW50ZXJZO1xuICAgICAgICB0aGlzLnRyZWVOb2RlLnkgLT0gZGVsdGFZO1xuICAgICAgICB0aGlzLmNvbnN0cmFpblRyZWUoKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBwdWJsaWMgZm9jdXNQb2ludGVyKCk6IHZvaWQge1xuICAgIGlmICggdGhpcy5oZWxwZXIucG9pbnRlclRyYWlsUHJvcGVydHkudmFsdWUgKSB7XG4gICAgICB0aGlzLmZvY3VzVHJhaWwoIHRoaXMuaGVscGVyLnBvaW50ZXJUcmFpbFByb3BlcnR5LnZhbHVlICk7XG4gICAgfVxuICB9XG5cbiAgcHVibGljIGZvY3VzU2VsZWN0ZWQoKTogdm9pZCB7XG4gICAgaWYgKCB0aGlzLmhlbHBlci5zZWxlY3RlZFRyYWlsUHJvcGVydHkudmFsdWUgPT09IG51bGwgKSB7IHJldHVybjsgfVxuXG4gICAgdGhpcy5mb2N1c1RyYWlsKCB0aGlzLmhlbHBlci5zZWxlY3RlZFRyYWlsUHJvcGVydHkudmFsdWUgKTtcbiAgfVxufVxuXG5jb25zdCBjcmVhdGVIZWFkZXJUZXh0ID0gKCBzdHI6IHN0cmluZywgbm9kZT86IE5vZGUsIG9wdGlvbnM/OiBUZXh0T3B0aW9ucyApID0+IHtcbiAgcmV0dXJuIG5ldyBUZXh0KCBzdHIsIG1lcmdlKCB7XG4gICAgZm9udFNpemU6IDE0LFxuICAgIGZvbnRXZWlnaHQ6ICdib2xkJyxcbiAgICB2aXNpYmxlUHJvcGVydHk6IG5vZGUgPyBuZXcgRGVyaXZlZFByb3BlcnR5KCBbIG5vZGUuYm91bmRzUHJvcGVydHkgXSwgYm91bmRzID0+IHtcbiAgICAgIHJldHVybiAhYm91bmRzLmlzRW1wdHkoKTtcbiAgICB9ICkgOiBuZXcgVGlueVByb3BlcnR5KCB0cnVlIClcbiAgfSwgb3B0aW9ucyApICk7XG59O1xuXG5jb25zdCBjcmVhdGVDb2xsYXBzaWJsZUhlYWRlclRleHQgPSAoIHN0cjogc3RyaW5nLCB2aXNpYmxlUHJvcGVydHk6IFByb3BlcnR5PGJvb2xlYW4+LCBub2RlPzogTm9kZSwgb3B0aW9ucz86IFRleHRPcHRpb25zICkgPT4ge1xuICBjb25zdCBoZWFkZXJUZXh0ID0gY3JlYXRlSGVhZGVyVGV4dCggc3RyLCBub2RlLCBvcHRpb25zICk7XG4gIGhlYWRlclRleHQuYWRkSW5wdXRMaXN0ZW5lciggbmV3IEZpcmVMaXN0ZW5lcigge1xuICAgIGZpcmU6ICgpID0+IHtcbiAgICAgIHZpc2libGVQcm9wZXJ0eS52YWx1ZSA9ICF2aXNpYmxlUHJvcGVydHkudmFsdWU7XG4gICAgfSxcbiAgICB0YW5kZW06IFRhbmRlbS5PUFRfT1VUXG4gIH0gKSApO1xuICBoZWFkZXJUZXh0LmN1cnNvciA9ICdwb2ludGVyJztcbiAgcmV0dXJuIG5ldyBIQm94KCB7XG4gICAgc3BhY2luZzogNyxcbiAgICBjaGlsZHJlbjogW1xuICAgICAgbmV3IEV4cGFuZENvbGxhcHNlQnV0dG9uKCB2aXNpYmxlUHJvcGVydHksIHsgdGFuZGVtOiBUYW5kZW0uT1BUX09VVCwgc2lkZUxlbmd0aDogMTQgfSApLFxuICAgICAgaGVhZGVyVGV4dFxuICAgIF0sXG4gICAgdmlzaWJsZVByb3BlcnR5OiBoZWFkZXJUZXh0LnZpc2libGVQcm9wZXJ0eVxuICB9ICk7XG59O1xuXG5jbGFzcyBNYXRyaXgzTm9kZSBleHRlbmRzIEdyaWRCb3gge1xuICBwdWJsaWMgY29uc3RydWN0b3IoIG1hdHJpeDogTWF0cml4MyApIHtcbiAgICBzdXBlcigge1xuICAgICAgeFNwYWNpbmc6IDUsXG4gICAgICB5U3BhY2luZzogMCxcbiAgICAgIGNoaWxkcmVuOiBbXG4gICAgICAgIG5ldyBUZXh0KCBtYXRyaXgubTAwKCksIHsgbGF5b3V0T3B0aW9uczogeyBjb2x1bW46IDAsIHJvdzogMCB9IH0gKSxcbiAgICAgICAgbmV3IFRleHQoIG1hdHJpeC5tMDEoKSwgeyBsYXlvdXRPcHRpb25zOiB7IGNvbHVtbjogMSwgcm93OiAwIH0gfSApLFxuICAgICAgICBuZXcgVGV4dCggbWF0cml4Lm0wMigpLCB7IGxheW91dE9wdGlvbnM6IHsgY29sdW1uOiAyLCByb3c6IDAgfSB9ICksXG4gICAgICAgIG5ldyBUZXh0KCBtYXRyaXgubTEwKCksIHsgbGF5b3V0T3B0aW9uczogeyBjb2x1bW46IDAsIHJvdzogMSB9IH0gKSxcbiAgICAgICAgbmV3IFRleHQoIG1hdHJpeC5tMTEoKSwgeyBsYXlvdXRPcHRpb25zOiB7IGNvbHVtbjogMSwgcm93OiAxIH0gfSApLFxuICAgICAgICBuZXcgVGV4dCggbWF0cml4Lm0xMigpLCB7IGxheW91dE9wdGlvbnM6IHsgY29sdW1uOiAyLCByb3c6IDEgfSB9ICksXG4gICAgICAgIG5ldyBUZXh0KCBtYXRyaXgubTIwKCksIHsgbGF5b3V0T3B0aW9uczogeyBjb2x1bW46IDAsIHJvdzogMiB9IH0gKSxcbiAgICAgICAgbmV3IFRleHQoIG1hdHJpeC5tMjEoKSwgeyBsYXlvdXRPcHRpb25zOiB7IGNvbHVtbjogMSwgcm93OiAyIH0gfSApLFxuICAgICAgICBuZXcgVGV4dCggbWF0cml4Lm0yMigpLCB7IGxheW91dE9wdGlvbnM6IHsgY29sdW1uOiAyLCByb3c6IDIgfSB9IClcbiAgICAgIF1cbiAgICB9ICk7XG4gIH1cbn1cblxuY2xhc3MgU2hhcGVOb2RlIGV4dGVuZHMgUGF0aCB7XG4gIHB1YmxpYyBjb25zdHJ1Y3Rvciggc2hhcGU6IFNoYXBlICkge1xuICAgIHN1cGVyKCBzaGFwZSwge1xuICAgICAgbWF4V2lkdGg6IDE1LFxuICAgICAgbWF4SGVpZ2h0OiAxNSxcbiAgICAgIHN0cm9rZTogJ2JsYWNrJyxcbiAgICAgIGN1cnNvcjogJ3BvaW50ZXInLFxuICAgICAgc3Ryb2tlUGlja2FibGU6IHRydWVcbiAgICB9ICk7XG5cbiAgICB0aGlzLmFkZElucHV0TGlzdGVuZXIoIG5ldyBGaXJlTGlzdGVuZXIoIHtcbiAgICAgIGZpcmU6ICgpID0+IGNvcHlUb0NsaXBib2FyZCggc2hhcGUuZ2V0U1ZHUGF0aCgpICksXG4gICAgICB0YW5kZW06IFRhbmRlbS5PUFRfT1VUXG4gICAgfSApICk7XG4gIH1cbn1cblxuY2xhc3MgSW1hZ2VOb2RlIGV4dGVuZHMgSW1hZ2Uge1xuICBwdWJsaWMgY29uc3RydWN0b3IoIGltYWdlOiBJbWFnZSApIHtcbiAgICBzdXBlciggaW1hZ2UuZ2V0SW1hZ2UoKSwge1xuICAgICAgbWF4V2lkdGg6IDE1LFxuICAgICAgbWF4SGVpZ2h0OiAxNVxuICAgIH0gKTtcbiAgfVxufVxuXG5jb25zdCBjcmVhdGVJbmZvID0gKCB0cmFpbDogVHJhaWwgKTogTm9kZVtdID0+IHtcbiAgY29uc3QgY2hpbGRyZW4gPSBbXTtcbiAgY29uc3Qgbm9kZSA9IHRyYWlsLmxhc3ROb2RlKCk7XG5cbiAgY29uc3QgdHlwZXMgPSBpbmhlcml0YW5jZSggbm9kZS5jb25zdHJ1Y3RvciApLm1hcCggdHlwZSA9PiB0eXBlLm5hbWUgKS5maWx0ZXIoIG5hbWUgPT4ge1xuICAgIHJldHVybiBuYW1lICYmIG5hbWUgIT09ICdPYmplY3QnO1xuICB9ICk7XG4gIGNvbnN0IHJlZHVjZWRUeXBlcyA9IHR5cGVzLmluY2x1ZGVzKCAnTm9kZScgKSA/IHR5cGVzLnNsaWNlKCAwLCB0eXBlcy5pbmRleE9mKCAnTm9kZScgKSApIDogdHlwZXM7XG5cbiAgaWYgKCByZWR1Y2VkVHlwZXMubGVuZ3RoID4gMCApIHtcbiAgICBjaGlsZHJlbi5wdXNoKCBuZXcgUmljaFRleHQoIHJlZHVjZWRUeXBlcy5tYXAoICggc3RyOiBzdHJpbmcsIGk6IG51bWJlciApID0+IHtcbiAgICAgIHJldHVybiBpID09PSAwID8gYDxiPiR7c3RyfTwvYj5gIDogYDxicj4mbmJzcDske18ucmVwZWF0KCAnICAnLCBpICl9ZXh0ZW5kcyAke3N0cn1gO1xuICAgIH0gKS5qb2luKCAnJyApLCB7IGZvbnQ6IG5ldyBQaGV0Rm9udCggMTIgKSB9ICkgKTtcbiAgfVxuXG4gIGNvbnN0IGFkZFJhdyA9ICgga2V5OiBzdHJpbmcsIHZhbHVlTm9kZTogTm9kZSApID0+IHtcbiAgICBjaGlsZHJlbi5wdXNoKCBuZXcgSEJveCgge1xuICAgICAgc3BhY2luZzogMCxcbiAgICAgIGFsaWduOiAndG9wJyxcbiAgICAgIGNoaWxkcmVuOiBbXG4gICAgICAgIG5ldyBUZXh0KCBrZXkgKyAnOiAnLCB7IGZvbnRTaXplOiAxMiB9ICksXG4gICAgICAgIHZhbHVlTm9kZVxuICAgICAgXVxuICAgIH0gKSApO1xuICB9O1xuXG4gIGNvbnN0IGFkZFNpbXBsZSA9ICgga2V5OiBzdHJpbmcsIHZhbHVlOiB1bmtub3duICkgPT4ge1xuICAgIGlmICggdmFsdWUgIT09IHVuZGVmaW5lZCApIHtcbiAgICAgIGFkZFJhdygga2V5LCBuZXcgUmljaFRleHQoICcnICsgdmFsdWUsIHtcbiAgICAgICAgbGluZVdyYXA6IDQwMCxcbiAgICAgICAgZm9udDogbmV3IFBoZXRGb250KCAxMiApLFxuICAgICAgICBjdXJzb3I6ICdwb2ludGVyJyxcbiAgICAgICAgaW5wdXRMaXN0ZW5lcnM6IFtcbiAgICAgICAgICBuZXcgRmlyZUxpc3RlbmVyKCB7XG4gICAgICAgICAgICBmaXJlOiAoKSA9PiBjb3B5VG9DbGlwYm9hcmQoICcnICsgdmFsdWUgKSxcbiAgICAgICAgICAgIHRhbmRlbTogVGFuZGVtLk9QVF9PVVRcbiAgICAgICAgICB9IClcbiAgICAgICAgXVxuICAgICAgfSApICk7XG4gICAgfVxuICB9O1xuXG4gIGNvbnN0IGNvbG9yU3dhdGNoID0gKCBjb2xvcjogQ29sb3IgKTogTm9kZSA9PiB7XG4gICAgcmV0dXJuIG5ldyBIQm94KCB7XG4gICAgICBzcGFjaW5nOiA0LFxuICAgICAgY2hpbGRyZW46IFtcbiAgICAgICAgbmV3IFJlY3RhbmdsZSggMCwgMCwgMTAsIDEwLCB7IGZpbGw6IGNvbG9yLCBzdHJva2U6ICdibGFjaycsIGxpbmVXaWR0aDogMC41IH0gKSxcbiAgICAgICAgbmV3IFRleHQoIGNvbG9yLnRvSGV4U3RyaW5nKCksIHsgZm9udFNpemU6IDEyIH0gKSxcbiAgICAgICAgbmV3IFRleHQoIGNvbG9yLnRvQ1NTKCksIHsgZm9udFNpemU6IDEyIH0gKVxuICAgICAgXSxcbiAgICAgIGN1cnNvcjogJ3BvaW50ZXInLFxuICAgICAgaW5wdXRMaXN0ZW5lcnM6IFtcbiAgICAgICAgbmV3IEZpcmVMaXN0ZW5lcigge1xuICAgICAgICAgIGZpcmU6ICgpID0+IGNvcHlUb0NsaXBib2FyZCggY29sb3IudG9IZXhTdHJpbmcoKSApLFxuICAgICAgICAgIHRhbmRlbTogVGFuZGVtLk9QVF9PVVRcbiAgICAgICAgfSApXG4gICAgICBdXG4gICAgfSApO1xuICB9O1xuXG4gIGNvbnN0IGFkZENvbG9yID0gKCBrZXk6IHN0cmluZywgY29sb3I6IFRDb2xvciApID0+IHtcbiAgICBjb25zdCByZXN1bHQgPSBpQ29sb3JUb0NvbG9yKCBjb2xvciApO1xuICAgIGlmICggcmVzdWx0ICE9PSBudWxsICkge1xuICAgICAgYWRkUmF3KCBrZXksIGNvbG9yU3dhdGNoKCByZXN1bHQgKSApO1xuICAgIH1cbiAgfTtcbiAgY29uc3QgYWRkUGFpbnQgPSAoIGtleTogc3RyaW5nLCBwYWludDogVFBhaW50ICkgPT4ge1xuICAgIGNvbnN0IHN0b3BUb05vZGUgPSAoIHN0b3A6IEdyYWRpZW50U3RvcCApOiBOb2RlID0+IHtcbiAgICAgIHJldHVybiBuZXcgSEJveCgge1xuICAgICAgICBzcGFjaW5nOiAzLFxuICAgICAgICBjaGlsZHJlbjogW1xuICAgICAgICAgIG5ldyBUZXh0KCBzdG9wLnJhdGlvLCB7IGZvbnRTaXplOiAxMiB9ICksXG4gICAgICAgICAgY29sb3JTd2F0Y2goIGlDb2xvclRvQ29sb3IoIHN0b3AuY29sb3IgKSB8fCBDb2xvci5UUkFOU1BBUkVOVCApXG4gICAgICAgIF1cbiAgICAgIH0gKTtcbiAgICB9O1xuXG4gICAgaWYgKCBwYWludCBpbnN0YW5jZW9mIFBhaW50ICkge1xuICAgICAgaWYgKCBwYWludCBpbnN0YW5jZW9mIExpbmVhckdyYWRpZW50ICkge1xuICAgICAgICBhZGRSYXcoIGtleSwgbmV3IFZCb3goIHtcbiAgICAgICAgICBhbGlnbjogJ2xlZnQnLFxuICAgICAgICAgIHNwYWNpbmc6IDMsXG4gICAgICAgICAgY2hpbGRyZW46IFtcbiAgICAgICAgICAgIG5ldyBUZXh0KCBgTGluZWFyR3JhZGllbnQgKCR7cGFpbnQuc3RhcnQueH0sJHtwYWludC5zdGFydC55fSkgPT4gKCR7cGFpbnQuZW5kLnh9LCR7cGFpbnQuZW5kLnl9KWAsIHsgZm9udFNpemU6IDEyIH0gKSxcbiAgICAgICAgICAgIC4uLnBhaW50LnN0b3BzLm1hcCggc3RvcFRvTm9kZSApXG4gICAgICAgICAgXVxuICAgICAgICB9ICkgKTtcbiAgICAgIH1cbiAgICAgIGVsc2UgaWYgKCBwYWludCBpbnN0YW5jZW9mIFJhZGlhbEdyYWRpZW50ICkge1xuICAgICAgICBhZGRSYXcoIGtleSwgbmV3IFZCb3goIHtcbiAgICAgICAgICBhbGlnbjogJ2xlZnQnLFxuICAgICAgICAgIHNwYWNpbmc6IDMsXG4gICAgICAgICAgY2hpbGRyZW46IFtcbiAgICAgICAgICAgIG5ldyBUZXh0KCBgUmFkaWFsR3JhZGllbnQgKCR7cGFpbnQuc3RhcnQueH0sJHtwYWludC5zdGFydC55fSkgJHtwYWludC5zdGFydFJhZGl1c30gPT4gKCR7cGFpbnQuZW5kLnh9LCR7cGFpbnQuZW5kLnl9KSAke3BhaW50LmVuZFJhZGl1c31gLCB7IGZvbnRTaXplOiAxMiB9ICksXG4gICAgICAgICAgICAuLi5wYWludC5zdG9wcy5tYXAoIHN0b3BUb05vZGUgKVxuICAgICAgICAgIF1cbiAgICAgICAgfSApICk7XG4gICAgICB9XG4gICAgICBlbHNlIGlmICggcGFpbnQgaW5zdGFuY2VvZiBQYXR0ZXJuICkge1xuICAgICAgICBhZGRSYXcoIGtleSwgbmV3IFZCb3goIHtcbiAgICAgICAgICBhbGlnbjogJ2xlZnQnLFxuICAgICAgICAgIHNwYWNpbmc6IDMsXG4gICAgICAgICAgY2hpbGRyZW46IFtcbiAgICAgICAgICAgIG5ldyBUZXh0KCAnUGF0dGVybicsIHsgZm9udFNpemU6IDEyIH0gKSxcbiAgICAgICAgICAgIG5ldyBJbWFnZSggcGFpbnQuaW1hZ2UsIHsgbWF4V2lkdGg6IDEwLCBtYXhIZWlnaHQ6IDEwIH0gKVxuICAgICAgICAgIF1cbiAgICAgICAgfSApICk7XG4gICAgICB9XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgYWRkQ29sb3IoIGtleSwgcGFpbnQgKTtcbiAgICB9XG4gIH07XG5cbiAgY29uc3QgYWRkTnVtYmVyID0gKCBrZXk6IHN0cmluZywgbnVtYmVyOiBudW1iZXIgKSA9PiBhZGRTaW1wbGUoIGtleSwgbnVtYmVyICk7XG4gIGNvbnN0IGFkZE1hdHJpeDMgPSAoIGtleTogc3RyaW5nLCBtYXRyaXg6IE1hdHJpeDMgKSA9PiBhZGRSYXcoIGtleSwgbmV3IE1hdHJpeDNOb2RlKCBtYXRyaXggKSApO1xuICBjb25zdCBhZGRCb3VuZHMyID0gKCBrZXk6IHN0cmluZywgYm91bmRzOiBCb3VuZHMyICkgPT4ge1xuICAgIGlmICggYm91bmRzLmVxdWFscyggQm91bmRzMi5OT1RISU5HICkgKSB7XG4gICAgICAvLyBETyBub3RoaW5nXG4gICAgfVxuICAgIGVsc2UgaWYgKCBib3VuZHMuZXF1YWxzKCBCb3VuZHMyLkVWRVJZVEhJTkcgKSApIHtcbiAgICAgIGFkZFNpbXBsZSgga2V5LCAnZXZlcnl0aGluZycgKTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICBhZGRSYXcoIGtleSwgbmV3IFJpY2hUZXh0KCBgeDogWyR7Ym91bmRzLm1pblh9LCAke2JvdW5kcy5tYXhYfV08YnI+eTogWyR7Ym91bmRzLm1pbll9LCAke2JvdW5kcy5tYXhZfV1gLCB7IGZvbnQ6IG5ldyBQaGV0Rm9udCggMTIgKSB9ICkgKTtcbiAgICB9XG4gIH07XG4gIGNvbnN0IGFkZFNoYXBlID0gKCBrZXk6IHN0cmluZywgc2hhcGU6IFNoYXBlICkgPT4gYWRkUmF3KCBrZXksIG5ldyBTaGFwZU5vZGUoIHNoYXBlICkgKTtcbiAgY29uc3QgYWRkSW1hZ2UgPSAoIGtleTogc3RyaW5nLCBpbWFnZTogSW1hZ2UgKSA9PiBhZGRSYXcoIGtleSwgbmV3IEltYWdlTm9kZSggaW1hZ2UgKSApO1xuXG4gIGlmICggbm9kZS50YW5kZW0uc3VwcGxpZWQgKSB7XG4gICAgYWRkU2ltcGxlKCAndGFuZGVtJywgbm9kZS50YW5kZW0ucGhldGlvSUQuc3BsaXQoICcuJyApLmpvaW4oICcgJyApICk7XG4gIH1cblxuICBpZiAoIG5vZGUgaW5zdGFuY2VvZiBET00gKSB7XG4gICAgYWRkU2ltcGxlKCAnZWxlbWVudCcsIG5vZGUuZWxlbWVudC5jb25zdHJ1Y3Rvci5uYW1lICk7XG4gIH1cblxuICBpZiAoIGV4dGVuZHNXaWR0aFNpemFibGUoIG5vZGUgKSApIHtcbiAgICAhbm9kZS53aWR0aFNpemFibGUgJiYgYWRkU2ltcGxlKCAnd2lkdGhTaXphYmxlJywgbm9kZS53aWR0aFNpemFibGUgKTtcbiAgICBub2RlLnByZWZlcnJlZFdpZHRoICE9PSBudWxsICYmIGFkZFNpbXBsZSggJ3ByZWZlcnJlZFdpZHRoJywgbm9kZS5wcmVmZXJyZWRXaWR0aCApO1xuICAgIG5vZGUucHJlZmVycmVkV2lkdGggIT09IG5vZGUubG9jYWxQcmVmZXJyZWRXaWR0aCAmJiBhZGRTaW1wbGUoICdsb2NhbFByZWZlcnJlZFdpZHRoJywgbm9kZS5sb2NhbFByZWZlcnJlZFdpZHRoICk7XG4gICAgbm9kZS5taW5pbXVtV2lkdGggIT09IG51bGwgJiYgYWRkU2ltcGxlKCAnbWluaW11bVdpZHRoJywgbm9kZS5taW5pbXVtV2lkdGggKTtcbiAgICBub2RlLm1pbmltdW1XaWR0aCAhPT0gbm9kZS5sb2NhbE1pbmltdW1XaWR0aCAmJiBhZGRTaW1wbGUoICdsb2NhbE1pbmltdW1XaWR0aCcsIG5vZGUubG9jYWxNaW5pbXVtV2lkdGggKTtcbiAgfVxuXG4gIGlmICggZXh0ZW5kc0hlaWdodFNpemFibGUoIG5vZGUgKSApIHtcbiAgICAhbm9kZS5oZWlnaHRTaXphYmxlICYmIGFkZFNpbXBsZSggJ2hlaWdodFNpemFibGUnLCBub2RlLmhlaWdodFNpemFibGUgKTtcbiAgICBub2RlLnByZWZlcnJlZEhlaWdodCAhPT0gbnVsbCAmJiBhZGRTaW1wbGUoICdwcmVmZXJyZWRIZWlnaHQnLCBub2RlLnByZWZlcnJlZEhlaWdodCApO1xuICAgIG5vZGUucHJlZmVycmVkSGVpZ2h0ICE9PSBub2RlLmxvY2FsUHJlZmVycmVkSGVpZ2h0ICYmIGFkZFNpbXBsZSggJ2xvY2FsUHJlZmVycmVkSGVpZ2h0Jywgbm9kZS5sb2NhbFByZWZlcnJlZEhlaWdodCApO1xuICAgIG5vZGUubWluaW11bUhlaWdodCAhPT0gbnVsbCAmJiBhZGRTaW1wbGUoICdtaW5pbXVtSGVpZ2h0Jywgbm9kZS5taW5pbXVtSGVpZ2h0ICk7XG4gICAgbm9kZS5taW5pbXVtSGVpZ2h0ICE9PSBub2RlLmxvY2FsTWluaW11bUhlaWdodCAmJiBhZGRTaW1wbGUoICdsb2NhbE1pbmltdW1IZWlnaHQnLCBub2RlLmxvY2FsTWluaW11bUhlaWdodCApO1xuICB9XG5cbiAgaWYgKCBub2RlLmxheW91dE9wdGlvbnMgKSB7XG4gICAgYWRkU2ltcGxlKCAnbGF5b3V0T3B0aW9ucycsIEpTT04uc3RyaW5naWZ5KCBub2RlLmxheW91dE9wdGlvbnMsIG51bGwsIDIgKSApO1xuICB9XG5cbiAgaWYgKCBub2RlIGluc3RhbmNlb2YgTGF5b3V0Tm9kZSApIHtcbiAgICAhbm9kZS5yZXNpemUgJiYgYWRkU2ltcGxlKCAncmVzaXplJywgbm9kZS5yZXNpemUgKTtcbiAgICAhbm9kZS5sYXlvdXRPcmlnaW4uZXF1YWxzKCBWZWN0b3IyLlpFUk8gKSAmJiBhZGRTaW1wbGUoICdsYXlvdXRPcmlnaW4nLCBub2RlLmxheW91dE9yaWdpbiApO1xuICB9XG5cbiAgaWYgKCBub2RlIGluc3RhbmNlb2YgRmxvd0JveCApIHtcbiAgICBhZGRTaW1wbGUoICdvcmllbnRhdGlvbicsIG5vZGUub3JpZW50YXRpb24gKTtcbiAgICBhZGRTaW1wbGUoICdhbGlnbicsIG5vZGUuYWxpZ24gKTtcbiAgICBub2RlLnNwYWNpbmcgJiYgYWRkU2ltcGxlKCAnc3BhY2luZycsIG5vZGUuc3BhY2luZyApO1xuICAgIG5vZGUubGluZVNwYWNpbmcgJiYgYWRkU2ltcGxlKCAnbGluZVNwYWNpbmcnLCBub2RlLmxpbmVTcGFjaW5nICk7XG4gICAgYWRkU2ltcGxlKCAnanVzdGlmeScsIG5vZGUuanVzdGlmeSApO1xuICAgIG5vZGUuanVzdGlmeUxpbmVzICYmIGFkZFNpbXBsZSggJ2p1c3RpZnlMaW5lcycsIG5vZGUuanVzdGlmeUxpbmVzICk7XG4gICAgbm9kZS53cmFwICYmIGFkZFNpbXBsZSggJ3dyYXAnLCBub2RlLndyYXAgKTtcbiAgICBub2RlLnN0cmV0Y2ggJiYgYWRkU2ltcGxlKCAnc3RyZXRjaCcsIG5vZGUuc3RyZXRjaCApO1xuICAgIG5vZGUuZ3JvdyAmJiBhZGRTaW1wbGUoICdncm93Jywgbm9kZS5ncm93ICk7XG4gICAgbm9kZS5sZWZ0TWFyZ2luICYmIGFkZFNpbXBsZSggJ2xlZnRNYXJnaW4nLCBub2RlLmxlZnRNYXJnaW4gKTtcbiAgICBub2RlLnJpZ2h0TWFyZ2luICYmIGFkZFNpbXBsZSggJ3JpZ2h0TWFyZ2luJywgbm9kZS5yaWdodE1hcmdpbiApO1xuICAgIG5vZGUudG9wTWFyZ2luICYmIGFkZFNpbXBsZSggJ3RvcE1hcmdpbicsIG5vZGUudG9wTWFyZ2luICk7XG4gICAgbm9kZS5ib3R0b21NYXJnaW4gJiYgYWRkU2ltcGxlKCAnYm90dG9tTWFyZ2luJywgbm9kZS5ib3R0b21NYXJnaW4gKTtcbiAgICBub2RlLm1pbkNvbnRlbnRXaWR0aCAhPT0gbnVsbCAmJiBhZGRTaW1wbGUoICdtaW5Db250ZW50V2lkdGgnLCBub2RlLm1pbkNvbnRlbnRXaWR0aCApO1xuICAgIG5vZGUubWluQ29udGVudEhlaWdodCAhPT0gbnVsbCAmJiBhZGRTaW1wbGUoICdtaW5Db250ZW50SGVpZ2h0Jywgbm9kZS5taW5Db250ZW50SGVpZ2h0ICk7XG4gICAgbm9kZS5tYXhDb250ZW50V2lkdGggIT09IG51bGwgJiYgYWRkU2ltcGxlKCAnbWF4Q29udGVudFdpZHRoJywgbm9kZS5tYXhDb250ZW50V2lkdGggKTtcbiAgICBub2RlLm1heENvbnRlbnRIZWlnaHQgIT09IG51bGwgJiYgYWRkU2ltcGxlKCAnbWF4Q29udGVudEhlaWdodCcsIG5vZGUubWF4Q29udGVudEhlaWdodCApO1xuICB9XG5cbiAgaWYgKCBub2RlIGluc3RhbmNlb2YgR3JpZEJveCApIHtcbiAgICBhZGRTaW1wbGUoICd4QWxpZ24nLCBub2RlLnhBbGlnbiApO1xuICAgIGFkZFNpbXBsZSggJ3lBbGlnbicsIG5vZGUueUFsaWduICk7XG4gICAgbm9kZS54U3BhY2luZyAmJiBhZGRTaW1wbGUoICd4U3BhY2luZycsIG5vZGUueFNwYWNpbmcgKTtcbiAgICBub2RlLnlTcGFjaW5nICYmIGFkZFNpbXBsZSggJ3lTcGFjaW5nJywgbm9kZS55U3BhY2luZyApO1xuICAgIG5vZGUueFN0cmV0Y2ggJiYgYWRkU2ltcGxlKCAneFN0cmV0Y2gnLCBub2RlLnhTdHJldGNoICk7XG4gICAgbm9kZS55U3RyZXRjaCAmJiBhZGRTaW1wbGUoICd5U3RyZXRjaCcsIG5vZGUueVN0cmV0Y2ggKTtcbiAgICBub2RlLnhHcm93ICYmIGFkZFNpbXBsZSggJ3hHcm93Jywgbm9kZS54R3JvdyApO1xuICAgIG5vZGUueUdyb3cgJiYgYWRkU2ltcGxlKCAneUdyb3cnLCBub2RlLnlHcm93ICk7XG4gICAgbm9kZS5sZWZ0TWFyZ2luICYmIGFkZFNpbXBsZSggJ2xlZnRNYXJnaW4nLCBub2RlLmxlZnRNYXJnaW4gKTtcbiAgICBub2RlLnJpZ2h0TWFyZ2luICYmIGFkZFNpbXBsZSggJ3JpZ2h0TWFyZ2luJywgbm9kZS5yaWdodE1hcmdpbiApO1xuICAgIG5vZGUudG9wTWFyZ2luICYmIGFkZFNpbXBsZSggJ3RvcE1hcmdpbicsIG5vZGUudG9wTWFyZ2luICk7XG4gICAgbm9kZS5ib3R0b21NYXJnaW4gJiYgYWRkU2ltcGxlKCAnYm90dG9tTWFyZ2luJywgbm9kZS5ib3R0b21NYXJnaW4gKTtcbiAgICBub2RlLm1pbkNvbnRlbnRXaWR0aCAhPT0gbnVsbCAmJiBhZGRTaW1wbGUoICdtaW5Db250ZW50V2lkdGgnLCBub2RlLm1pbkNvbnRlbnRXaWR0aCApO1xuICAgIG5vZGUubWluQ29udGVudEhlaWdodCAhPT0gbnVsbCAmJiBhZGRTaW1wbGUoICdtaW5Db250ZW50SGVpZ2h0Jywgbm9kZS5taW5Db250ZW50SGVpZ2h0ICk7XG4gICAgbm9kZS5tYXhDb250ZW50V2lkdGggIT09IG51bGwgJiYgYWRkU2ltcGxlKCAnbWF4Q29udGVudFdpZHRoJywgbm9kZS5tYXhDb250ZW50V2lkdGggKTtcbiAgICBub2RlLm1heENvbnRlbnRIZWlnaHQgIT09IG51bGwgJiYgYWRkU2ltcGxlKCAnbWF4Q29udGVudEhlaWdodCcsIG5vZGUubWF4Q29udGVudEhlaWdodCApO1xuICB9XG5cbiAgaWYgKCBub2RlIGluc3RhbmNlb2YgUmVjdGFuZ2xlICkge1xuICAgIGFkZEJvdW5kczIoICdyZWN0Qm91bmRzJywgbm9kZS5yZWN0Qm91bmRzICk7XG4gICAgaWYgKCBub2RlLmNvcm5lclhSYWRpdXMgfHwgbm9kZS5jb3JuZXJZUmFkaXVzICkge1xuICAgICAgaWYgKCBub2RlLmNvcm5lclhSYWRpdXMgPT09IG5vZGUuY29ybmVyWVJhZGl1cyApIHtcbiAgICAgICAgYWRkU2ltcGxlKCAnY29ybmVyUmFkaXVzJywgbm9kZS5jb3JuZXJSYWRpdXMgKTtcbiAgICAgIH1cbiAgICAgIGVsc2Uge1xuICAgICAgICBhZGRTaW1wbGUoICdjb3JuZXJYUmFkaXVzJywgbm9kZS5jb3JuZXJYUmFkaXVzICk7XG4gICAgICAgIGFkZFNpbXBsZSggJ2Nvcm5lcllSYWRpdXMnLCBub2RlLmNvcm5lcllSYWRpdXMgKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBpZiAoIG5vZGUgaW5zdGFuY2VvZiBMaW5lICkge1xuICAgIGFkZFNpbXBsZSggJ3gxJywgbm9kZS54MSApO1xuICAgIGFkZFNpbXBsZSggJ3kxJywgbm9kZS55MSApO1xuICAgIGFkZFNpbXBsZSggJ3gyJywgbm9kZS54MiApO1xuICAgIGFkZFNpbXBsZSggJ3kyJywgbm9kZS55MiApO1xuICB9XG5cbiAgaWYgKCBub2RlIGluc3RhbmNlb2YgQ2lyY2xlICkge1xuICAgIGFkZFNpbXBsZSggJ3JhZGl1cycsIG5vZGUucmFkaXVzICk7XG4gIH1cblxuICBpZiAoIG5vZGUgaW5zdGFuY2VvZiBUZXh0ICkge1xuICAgIGFkZFNpbXBsZSggJ3RleHQnLCBub2RlLnN0cmluZyApO1xuICAgIGFkZFNpbXBsZSggJ2ZvbnQnLCBub2RlLmZvbnQgKTtcbiAgICBpZiAoIG5vZGUuYm91bmRzTWV0aG9kICE9PSAnaHlicmlkJyApIHtcbiAgICAgIGFkZFNpbXBsZSggJ2JvdW5kc01ldGhvZCcsIG5vZGUuYm91bmRzTWV0aG9kICk7XG4gICAgfVxuICB9XG5cbiAgaWYgKCBub2RlIGluc3RhbmNlb2YgUmljaFRleHQgKSB7XG4gICAgYWRkU2ltcGxlKCAndGV4dCcsIG5vZGUuc3RyaW5nICk7XG4gICAgYWRkU2ltcGxlKCAnZm9udCcsIG5vZGUuZm9udCBpbnN0YW5jZW9mIEZvbnQgPyBub2RlLmZvbnQuZ2V0Rm9udCgpIDogbm9kZS5mb250ICk7XG4gICAgYWRkUGFpbnQoICdmaWxsJywgbm9kZS5maWxsICk7XG4gICAgYWRkUGFpbnQoICdzdHJva2UnLCBub2RlLnN0cm9rZSApO1xuICAgIGlmICggbm9kZS5ib3VuZHNNZXRob2QgIT09ICdoeWJyaWQnICkge1xuICAgICAgYWRkU2ltcGxlKCAnYm91bmRzTWV0aG9kJywgbm9kZS5ib3VuZHNNZXRob2QgKTtcbiAgICB9XG4gICAgaWYgKCBub2RlLmxpbmVXcmFwICE9PSBudWxsICkge1xuICAgICAgYWRkU2ltcGxlKCAnbGluZVdyYXAnLCBub2RlLmxpbmVXcmFwICk7XG4gICAgfVxuICB9XG5cbiAgaWYgKCBub2RlIGluc3RhbmNlb2YgSW1hZ2UgKSB7XG4gICAgYWRkSW1hZ2UoICdpbWFnZScsIG5vZGUgKTtcbiAgICBhZGRTaW1wbGUoICdpbWFnZVdpZHRoJywgbm9kZS5pbWFnZVdpZHRoICk7XG4gICAgYWRkU2ltcGxlKCAnaW1hZ2VIZWlnaHQnLCBub2RlLmltYWdlSGVpZ2h0ICk7XG4gICAgaWYgKCBub2RlLmltYWdlT3BhY2l0eSAhPT0gMSApIHtcbiAgICAgIGFkZFNpbXBsZSggJ2ltYWdlT3BhY2l0eScsIG5vZGUuaW1hZ2VPcGFjaXR5ICk7XG4gICAgfVxuICAgIGlmICggbm9kZS5pbWFnZUJvdW5kcyApIHtcbiAgICAgIGFkZEJvdW5kczIoICdpbWFnZUJvdW5kcycsIG5vZGUuaW1hZ2VCb3VuZHMgKTtcbiAgICB9XG4gICAgaWYgKCBub2RlLmluaXRpYWxXaWR0aCApIHtcbiAgICAgIGFkZFNpbXBsZSggJ2luaXRpYWxXaWR0aCcsIG5vZGUuaW5pdGlhbFdpZHRoICk7XG4gICAgfVxuICAgIGlmICggbm9kZS5pbml0aWFsSGVpZ2h0ICkge1xuICAgICAgYWRkU2ltcGxlKCAnaW5pdGlhbEhlaWdodCcsIG5vZGUuaW5pdGlhbEhlaWdodCApO1xuICAgIH1cbiAgICBpZiAoIG5vZGUuaGl0VGVzdFBpeGVscyApIHtcbiAgICAgIGFkZFNpbXBsZSggJ2hpdFRlc3RQaXhlbHMnLCBub2RlLmhpdFRlc3RQaXhlbHMgKTtcbiAgICB9XG4gIH1cblxuICBpZiAoIG5vZGUgaW5zdGFuY2VvZiBDYW52YXNOb2RlIHx8IG5vZGUgaW5zdGFuY2VvZiBXZWJHTE5vZGUgKSB7XG4gICAgYWRkQm91bmRzMiggJ2NhbnZhc0JvdW5kcycsIG5vZGUuY2FudmFzQm91bmRzICk7XG4gIH1cblxuICBpZiAoIG5vZGUgaW5zdGFuY2VvZiBQYXRoICkge1xuICAgIGlmICggbm9kZS5zaGFwZSApIHtcbiAgICAgIGFkZFNoYXBlKCAnc2hhcGUnLCBub2RlLnNoYXBlICk7XG4gICAgfVxuICAgIGlmICggbm9kZS5ib3VuZHNNZXRob2QgIT09ICdhY2N1cmF0ZScgKSB7XG4gICAgICBhZGRTaW1wbGUoICdib3VuZHNNZXRob2QnLCBub2RlLmJvdW5kc01ldGhvZCApO1xuICAgIH1cbiAgfVxuXG4gIGlmICggbm9kZSBpbnN0YW5jZW9mIFBhdGggfHwgbm9kZSBpbnN0YW5jZW9mIFRleHQgKSB7XG4gICAgYWRkUGFpbnQoICdmaWxsJywgbm9kZS5maWxsICk7XG4gICAgYWRkUGFpbnQoICdzdHJva2UnLCBub2RlLnN0cm9rZSApO1xuICAgIGlmICggbm9kZS5saW5lRGFzaC5sZW5ndGggKSB7XG4gICAgICBhZGRTaW1wbGUoICdsaW5lRGFzaCcsIG5vZGUubGluZURhc2ggKTtcbiAgICB9XG4gICAgaWYgKCAhbm9kZS5maWxsUGlja2FibGUgKSB7XG4gICAgICBhZGRTaW1wbGUoICdmaWxsUGlja2FibGUnLCBub2RlLmZpbGxQaWNrYWJsZSApO1xuICAgIH1cbiAgICBpZiAoIG5vZGUuc3Ryb2tlUGlja2FibGUgKSB7XG4gICAgICBhZGRTaW1wbGUoICdzdHJva2VQaWNrYWJsZScsIG5vZGUuc3Ryb2tlUGlja2FibGUgKTtcbiAgICB9XG4gICAgaWYgKCBub2RlLmxpbmVXaWR0aCAhPT0gMSApIHtcbiAgICAgIGFkZFNpbXBsZSggJ2xpbmVXaWR0aCcsIG5vZGUubGluZVdpZHRoICk7XG4gICAgfVxuICAgIGlmICggbm9kZS5saW5lQ2FwICE9PSAnYnV0dCcgKSB7XG4gICAgICBhZGRTaW1wbGUoICdsaW5lQ2FwJywgbm9kZS5saW5lQ2FwICk7XG4gICAgfVxuICAgIGlmICggbm9kZS5saW5lSm9pbiAhPT0gJ21pdGVyJyApIHtcbiAgICAgIGFkZFNpbXBsZSggJ2xpbmVKb2luJywgbm9kZS5saW5lSm9pbiApO1xuICAgIH1cbiAgICBpZiAoIG5vZGUubGluZURhc2hPZmZzZXQgIT09IDAgKSB7XG4gICAgICBhZGRTaW1wbGUoICdsaW5lRGFzaE9mZnNldCcsIG5vZGUubGluZURhc2hPZmZzZXQgKTtcbiAgICB9XG4gICAgaWYgKCBub2RlLm1pdGVyTGltaXQgIT09IDEwICkge1xuICAgICAgYWRkU2ltcGxlKCAnbWl0ZXJMaW1pdCcsIG5vZGUubWl0ZXJMaW1pdCApO1xuICAgIH1cbiAgfVxuXG4gIGlmICggbm9kZS50YWdOYW1lICkge1xuICAgIGFkZFNpbXBsZSggJ3RhZ05hbWUnLCBub2RlLnRhZ05hbWUgKTtcbiAgfVxuICBpZiAoIG5vZGUuYWNjZXNzaWJsZU5hbWUgKSB7XG4gICAgYWRkU2ltcGxlKCAnYWNjZXNzaWJsZU5hbWUnLCBub2RlLmFjY2Vzc2libGVOYW1lICk7XG4gIH1cbiAgaWYgKCBub2RlLmhlbHBUZXh0ICkge1xuICAgIGFkZFNpbXBsZSggJ2hlbHBUZXh0Jywgbm9kZS5oZWxwVGV4dCApO1xuICB9XG4gIGlmICggbm9kZS5wZG9tSGVhZGluZyApIHtcbiAgICBhZGRTaW1wbGUoICdwZG9tSGVhZGluZycsIG5vZGUucGRvbUhlYWRpbmcgKTtcbiAgfVxuICBpZiAoIG5vZGUuY29udGFpbmVyVGFnTmFtZSApIHtcbiAgICBhZGRTaW1wbGUoICdjb250YWluZXJUYWdOYW1lJywgbm9kZS5jb250YWluZXJUYWdOYW1lICk7XG4gIH1cbiAgaWYgKCBub2RlLmNvbnRhaW5lckFyaWFSb2xlICkge1xuICAgIGFkZFNpbXBsZSggJ2NvbnRhaW5lckFyaWFSb2xlJywgbm9kZS5jb250YWluZXJBcmlhUm9sZSApO1xuICB9XG4gIGlmICggbm9kZS5pbm5lckNvbnRlbnQgKSB7XG4gICAgYWRkU2ltcGxlKCAnaW5uZXJDb250ZW50Jywgbm9kZS5pbm5lckNvbnRlbnQgKTtcbiAgfVxuICBpZiAoIG5vZGUuaW5wdXRUeXBlICkge1xuICAgIGFkZFNpbXBsZSggJ2lucHV0VHlwZScsIG5vZGUuaW5wdXRUeXBlICk7XG4gIH1cbiAgaWYgKCBub2RlLmlucHV0VmFsdWUgKSB7XG4gICAgYWRkU2ltcGxlKCAnaW5wdXRWYWx1ZScsIG5vZGUuaW5wdXRWYWx1ZSApO1xuICB9XG4gIGlmICggbm9kZS5wZG9tTmFtZXNwYWNlICkge1xuICAgIGFkZFNpbXBsZSggJ3Bkb21OYW1lc3BhY2UnLCBub2RlLnBkb21OYW1lc3BhY2UgKTtcbiAgfVxuICBpZiAoIG5vZGUuYXJpYUxhYmVsICkge1xuICAgIGFkZFNpbXBsZSggJ2FyaWFMYWJlbCcsIG5vZGUuYXJpYUxhYmVsICk7XG4gIH1cbiAgaWYgKCBub2RlLmFyaWFSb2xlICkge1xuICAgIGFkZFNpbXBsZSggJ2FyaWFSb2xlJywgbm9kZS5hcmlhUm9sZSApO1xuICB9XG4gIGlmICggbm9kZS5hcmlhVmFsdWVUZXh0ICkge1xuICAgIGFkZFNpbXBsZSggJ2FyaWFWYWx1ZVRleHQnLCBub2RlLmFyaWFWYWx1ZVRleHQgKTtcbiAgfVxuICBpZiAoIG5vZGUubGFiZWxUYWdOYW1lICkge1xuICAgIGFkZFNpbXBsZSggJ2xhYmVsVGFnTmFtZScsIG5vZGUubGFiZWxUYWdOYW1lICk7XG4gIH1cbiAgaWYgKCBub2RlLmxhYmVsQ29udGVudCApIHtcbiAgICBhZGRTaW1wbGUoICdsYWJlbENvbnRlbnQnLCBub2RlLmxhYmVsQ29udGVudCApO1xuICB9XG4gIGlmICggbm9kZS5hcHBlbmRMYWJlbCApIHtcbiAgICBhZGRTaW1wbGUoICdhcHBlbmRMYWJlbCcsIG5vZGUuYXBwZW5kTGFiZWwgKTtcbiAgfVxuICBpZiAoIG5vZGUuZGVzY3JpcHRpb25UYWdOYW1lICkge1xuICAgIGFkZFNpbXBsZSggJ2Rlc2NyaXB0aW9uVGFnTmFtZScsIG5vZGUuZGVzY3JpcHRpb25UYWdOYW1lICk7XG4gIH1cbiAgaWYgKCBub2RlLmRlc2NyaXB0aW9uQ29udGVudCApIHtcbiAgICBhZGRTaW1wbGUoICdkZXNjcmlwdGlvbkNvbnRlbnQnLCBub2RlLmRlc2NyaXB0aW9uQ29udGVudCApO1xuICB9XG4gIGlmICggbm9kZS5hcHBlbmREZXNjcmlwdGlvbiApIHtcbiAgICBhZGRTaW1wbGUoICdhcHBlbmREZXNjcmlwdGlvbicsIG5vZGUuYXBwZW5kRGVzY3JpcHRpb24gKTtcbiAgfVxuICBpZiAoICFub2RlLnBkb21WaXNpYmxlICkge1xuICAgIGFkZFNpbXBsZSggJ3Bkb21WaXNpYmxlJywgbm9kZS5wZG9tVmlzaWJsZSApO1xuICB9XG4gIGlmICggbm9kZS5wZG9tT3JkZXIgKSB7XG4gICAgYWRkU2ltcGxlKCAncGRvbU9yZGVyJywgbm9kZS5wZG9tT3JkZXIubWFwKCBub2RlID0+IG5vZGUgPT09IG51bGwgPyAnbnVsbCcgOiBub2RlLmNvbnN0cnVjdG9yLm5hbWUgKSApO1xuICB9XG5cbiAgaWYgKCAhbm9kZS52aXNpYmxlICkge1xuICAgIGFkZFNpbXBsZSggJ3Zpc2libGUnLCBub2RlLnZpc2libGUgKTtcbiAgfVxuICBpZiAoIG5vZGUub3BhY2l0eSAhPT0gMSApIHtcbiAgICBhZGROdW1iZXIoICdvcGFjaXR5Jywgbm9kZS5vcGFjaXR5ICk7XG4gIH1cbiAgaWYgKCBub2RlLnBpY2thYmxlICE9PSBudWxsICkge1xuICAgIGFkZFNpbXBsZSggJ3BpY2thYmxlJywgbm9kZS5waWNrYWJsZSApO1xuICB9XG4gIGlmICggIW5vZGUuZW5hYmxlZCApIHtcbiAgICBhZGRTaW1wbGUoICdlbmFibGVkJywgbm9kZS5lbmFibGVkICk7XG4gIH1cbiAgaWYgKCAhbm9kZS5pbnB1dEVuYWJsZWQgKSB7XG4gICAgYWRkU2ltcGxlKCAnaW5wdXRFbmFibGVkJywgbm9kZS5pbnB1dEVuYWJsZWQgKTtcbiAgfVxuICBpZiAoIG5vZGUuY3Vyc29yICE9PSBudWxsICkge1xuICAgIGFkZFNpbXBsZSggJ2N1cnNvcicsIG5vZGUuY3Vyc29yICk7XG4gIH1cbiAgaWYgKCBub2RlLnRyYW5zZm9ybUJvdW5kcyApIHtcbiAgICBhZGRTaW1wbGUoICd0cmFuc2Zvcm1Cb3VuZHMnLCBub2RlLnRyYW5zZm9ybUJvdW5kcyApO1xuICB9XG4gIGlmICggbm9kZS5yZW5kZXJlciApIHtcbiAgICBhZGRTaW1wbGUoICdyZW5kZXJlcicsIG5vZGUucmVuZGVyZXIgKTtcbiAgfVxuICBpZiAoIG5vZGUudXNlc09wYWNpdHkgKSB7XG4gICAgYWRkU2ltcGxlKCAndXNlc09wYWNpdHknLCBub2RlLnVzZXNPcGFjaXR5ICk7XG4gIH1cbiAgaWYgKCBub2RlLmxheWVyU3BsaXQgKSB7XG4gICAgYWRkU2ltcGxlKCAnbGF5ZXJTcGxpdCcsIG5vZGUubGF5ZXJTcGxpdCApO1xuICB9XG4gIGlmICggbm9kZS5jc3NUcmFuc2Zvcm0gKSB7XG4gICAgYWRkU2ltcGxlKCAnY3NzVHJhbnNmb3JtJywgbm9kZS5jc3NUcmFuc2Zvcm0gKTtcbiAgfVxuICBpZiAoIG5vZGUuZXhjbHVkZUludmlzaWJsZSApIHtcbiAgICBhZGRTaW1wbGUoICdleGNsdWRlSW52aXNpYmxlJywgbm9kZS5leGNsdWRlSW52aXNpYmxlICk7XG4gIH1cbiAgaWYgKCBub2RlLnByZXZlbnRGaXQgKSB7XG4gICAgYWRkU2ltcGxlKCAncHJldmVudEZpdCcsIG5vZGUucHJldmVudEZpdCApO1xuICB9XG4gIGlmICggbm9kZS53ZWJnbFNjYWxlICE9PSBudWxsICkge1xuICAgIGFkZFNpbXBsZSggJ3dlYmdsU2NhbGUnLCBub2RlLndlYmdsU2NhbGUgKTtcbiAgfVxuICBpZiAoICFub2RlLm1hdHJpeC5pc0lkZW50aXR5KCkgKSB7XG4gICAgYWRkTWF0cml4MyggJ21hdHJpeCcsIG5vZGUubWF0cml4ICk7XG4gIH1cbiAgaWYgKCBub2RlLm1heFdpZHRoICE9PSBudWxsICkge1xuICAgIGFkZFNpbXBsZSggJ21heFdpZHRoJywgbm9kZS5tYXhXaWR0aCApO1xuICB9XG4gIGlmICggbm9kZS5tYXhIZWlnaHQgIT09IG51bGwgKSB7XG4gICAgYWRkU2ltcGxlKCAnbWF4SGVpZ2h0Jywgbm9kZS5tYXhIZWlnaHQgKTtcbiAgfVxuICBpZiAoIG5vZGUuY2xpcEFyZWEgIT09IG51bGwgKSB7XG4gICAgYWRkU2hhcGUoICdjbGlwQXJlYScsIG5vZGUuY2xpcEFyZWEgKTtcbiAgfVxuICBpZiAoIG5vZGUubW91c2VBcmVhICE9PSBudWxsICkge1xuICAgIGlmICggbm9kZS5tb3VzZUFyZWEgaW5zdGFuY2VvZiBCb3VuZHMyICkge1xuICAgICAgYWRkQm91bmRzMiggJ21vdXNlQXJlYScsIG5vZGUubW91c2VBcmVhICk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgYWRkU2hhcGUoICdtb3VzZUFyZWEnLCBub2RlLm1vdXNlQXJlYSApO1xuICAgIH1cbiAgfVxuICBpZiAoIG5vZGUudG91Y2hBcmVhICE9PSBudWxsICkge1xuICAgIGlmICggbm9kZS50b3VjaEFyZWEgaW5zdGFuY2VvZiBCb3VuZHMyICkge1xuICAgICAgYWRkQm91bmRzMiggJ3RvdWNoQXJlYScsIG5vZGUudG91Y2hBcmVhICk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgYWRkU2hhcGUoICd0b3VjaEFyZWEnLCBub2RlLnRvdWNoQXJlYSApO1xuICAgIH1cbiAgfVxuICBpZiAoIG5vZGUuaW5wdXRMaXN0ZW5lcnMubGVuZ3RoICkge1xuICAgIGFkZFNpbXBsZSggJ2lucHV0TGlzdGVuZXJzJywgbm9kZS5pbnB1dExpc3RlbmVycy5tYXAoIGxpc3RlbmVyID0+IGxpc3RlbmVyLmNvbnN0cnVjdG9yLm5hbWUgKS5qb2luKCAnLCAnICkgKTtcbiAgfVxuXG4gIGNoaWxkcmVuLnB1c2goIG5ldyBTcGFjZXIoIDUsIDUgKSApO1xuXG4gIGFkZEJvdW5kczIoICdsb2NhbEJvdW5kcycsIG5vZGUubG9jYWxCb3VuZHMgKTtcbiAgaWYgKCBub2RlLmxvY2FsQm91bmRzT3ZlcnJpZGRlbiApIHtcbiAgICBhZGRTaW1wbGUoICdsb2NhbEJvdW5kc092ZXJyaWRkZW4nLCBub2RlLmxvY2FsQm91bmRzT3ZlcnJpZGRlbiApO1xuICB9XG4gIGFkZEJvdW5kczIoICdib3VuZHMnLCBub2RlLmJvdW5kcyApO1xuICBpZiAoIGlzRmluaXRlKCBub2RlLndpZHRoICkgKSB7XG4gICAgYWRkU2ltcGxlKCAnd2lkdGgnLCBub2RlLndpZHRoICk7XG4gIH1cbiAgaWYgKCBpc0Zpbml0ZSggbm9kZS5oZWlnaHQgKSApIHtcbiAgICBhZGRTaW1wbGUoICdoZWlnaHQnLCBub2RlLmhlaWdodCApO1xuICB9XG5cbiAgY2hpbGRyZW4ucHVzaCggbmV3IFJlY3Rhbmd1bGFyUHVzaEJ1dHRvbigge1xuICAgIGNvbnRlbnQ6IG5ldyBUZXh0KCAnQ29weSBQYXRoJywgeyBmb250U2l6ZTogMTIgfSApLFxuICAgIGxpc3RlbmVyOiAoKSA9PiBjb3B5VG9DbGlwYm9hcmQoICdwaGV0LmpvaXN0LmRpc3BsYXkucm9vdE5vZGUnICsgdHJhaWwuaW5kaWNlcy5tYXAoIGluZGV4ID0+IHtcbiAgICAgIHJldHVybiBgLmNoaWxkcmVuWyAke2luZGV4fSBdYDtcbiAgICB9ICkuam9pbiggJycgKSApLFxuICAgIHRhbmRlbTogVGFuZGVtLk9QVF9PVVRcbiAgfSApICk7XG5cbiAgcmV0dXJuIGNoaWxkcmVuO1xufTtcblxuY29uc3QgaUNvbG9yVG9Db2xvciA9ICggY29sb3I6IFRDb2xvciApOiBDb2xvciB8IG51bGwgPT4ge1xuICBjb25zdCBub25Qcm9wZXJ0eSA9ICggaXNUUmVhZE9ubHlQcm9wZXJ0eSggY29sb3IgKSApID8gY29sb3IudmFsdWUgOiBjb2xvcjtcbiAgcmV0dXJuIG5vblByb3BlcnR5ID09PSBudWxsID8gbnVsbCA6IENvbG9yLnRvQ29sb3IoIG5vblByb3BlcnR5ICk7XG59O1xuXG5jb25zdCBpc1BhaW50Tm9uVHJhbnNwYXJlbnQgPSAoIHBhaW50OiBUUGFpbnQgKTogYm9vbGVhbiA9PiB7XG4gIGlmICggcGFpbnQgaW5zdGFuY2VvZiBQYWludCApIHtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuICBlbHNlIHtcbiAgICBjb25zdCBjb2xvciA9IGlDb2xvclRvQ29sb3IoIHBhaW50ICk7XG4gICAgcmV0dXJuICEhY29sb3IgJiYgY29sb3IuYWxwaGEgPiAwO1xuICB9XG59O1xuXG4vLyBNaXNzaW5nIG9wdGltaXphdGlvbnMgb24gYm91bmRzIG9uIHB1cnBvc2UsIHNvIHdlIGhpdCB2aXN1YWwgY2hhbmdlc1xuY29uc3QgdmlzdWFsSGl0VGVzdCA9ICggbm9kZTogTm9kZSwgcG9pbnQ6IFZlY3RvcjIgKTogVHJhaWwgfCBudWxsID0+IHtcbiAgaWYgKCAhbm9kZS52aXNpYmxlICkge1xuICAgIHJldHVybiBudWxsO1xuICB9XG4gIGNvbnN0IGxvY2FsUG9pbnQgPSBub2RlLl90cmFuc2Zvcm0uZ2V0SW52ZXJzZSgpLnRpbWVzVmVjdG9yMiggcG9pbnQgKTtcblxuICBjb25zdCBjbGlwQXJlYSA9IG5vZGUuY2xpcEFyZWE7XG4gIGlmICggY2xpcEFyZWEgIT09IG51bGwgJiYgIWNsaXBBcmVhLmNvbnRhaW5zUG9pbnQoIGxvY2FsUG9pbnQgKSApIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIGZvciAoIGxldCBpID0gbm9kZS5fY2hpbGRyZW4ubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0gKSB7XG4gICAgY29uc3QgY2hpbGQgPSBub2RlLl9jaGlsZHJlblsgaSBdO1xuXG4gICAgY29uc3QgY2hpbGRIaXQgPSB2aXN1YWxIaXRUZXN0KCBjaGlsZCwgbG9jYWxQb2ludCApO1xuXG4gICAgaWYgKCBjaGlsZEhpdCApIHtcbiAgICAgIHJldHVybiBjaGlsZEhpdC5hZGRBbmNlc3Rvciggbm9kZSwgaSApO1xuICAgIH1cbiAgfVxuXG4gIC8vIERpZG4ndCBoaXQgb3VyIGNoaWxkcmVuLCBzbyBjaGVjayBvdXJzZWxmIGFzIGEgbGFzdCByZXNvcnQuIENoZWNrIG91ciBzZWxmQm91bmRzIGZpcnN0LCBzbyB3ZSBjYW4gcG90ZW50aWFsbHlcbiAgLy8gYXZvaWQgaGl0LXRlc3RpbmcgdGhlIGFjdHVhbCBvYmplY3QgKHdoaWNoIG1heSBiZSBtb3JlIGV4cGVuc2l2ZSkuXG4gIGlmICggbm9kZS5zZWxmQm91bmRzLmNvbnRhaW5zUG9pbnQoIGxvY2FsUG9pbnQgKSApIHtcblxuICAgIC8vIElnbm9yZSB0aG9zZSB0cmFuc3BhcmVudCBwYXRocy4uLlxuICAgIGlmICggbm9kZSBpbnN0YW5jZW9mIFBhdGggJiYgbm9kZS5oYXNTaGFwZSgpICkge1xuICAgICAgaWYgKCBpc1BhaW50Tm9uVHJhbnNwYXJlbnQoIG5vZGUuZmlsbCApICYmIG5vZGUuZ2V0U2hhcGUoKSEuY29udGFpbnNQb2ludCggbG9jYWxQb2ludCApICkge1xuICAgICAgICByZXR1cm4gbmV3IFRyYWlsKCBub2RlICk7XG4gICAgICB9XG4gICAgICBpZiAoIGlzUGFpbnROb25UcmFuc3BhcmVudCggbm9kZS5zdHJva2UgKSAmJiBub2RlLmdldFN0cm9rZWRTaGFwZSgpLmNvbnRhaW5zUG9pbnQoIGxvY2FsUG9pbnQgKSApIHtcbiAgICAgICAgcmV0dXJuIG5ldyBUcmFpbCggbm9kZSApO1xuICAgICAgfVxuICAgIH1cbiAgICBlbHNlIGlmICggbm9kZS5jb250YWluc1BvaW50U2VsZiggbG9jYWxQb2ludCApICkge1xuICAgICAgcmV0dXJuIG5ldyBUcmFpbCggbm9kZSApO1xuICAgIH1cbiAgfVxuXG4gIC8vIE5vIGhpdFxuICByZXR1cm4gbnVsbDtcbn07XG5cbmNvbnN0IGNvcHlUb0NsaXBib2FyZCA9IGFzeW5jICggc3RyOiBzdHJpbmcgKSA9PiB7XG4gIGF3YWl0IG5hdmlnYXRvci5jbGlwYm9hcmQ/LndyaXRlVGV4dCggc3RyICk7XG59O1xuXG5jb25zdCBnZXRMb2NhbFNoYXBlID0gKCBub2RlOiBOb2RlLCB1c2VNb3VzZTogYm9vbGVhbiwgdXNlVG91Y2g6IGJvb2xlYW4gKTogU2hhcGUgPT4ge1xuICBsZXQgc2hhcGUgPSBTaGFwZS51bmlvbiggW1xuICAgIC4uLiggKCB1c2VNb3VzZSAmJiBub2RlLm1vdXNlQXJlYSApID8gWyBub2RlLm1vdXNlQXJlYSBpbnN0YW5jZW9mIFNoYXBlID8gbm9kZS5tb3VzZUFyZWEgOiBTaGFwZS5ib3VuZHMoIG5vZGUubW91c2VBcmVhICkgXSA6IFtdICksXG4gICAgLi4uKCAoIHVzZVRvdWNoICYmIG5vZGUudG91Y2hBcmVhICkgPyBbIG5vZGUudG91Y2hBcmVhIGluc3RhbmNlb2YgU2hhcGUgPyBub2RlLnRvdWNoQXJlYSA6IFNoYXBlLmJvdW5kcyggbm9kZS50b3VjaEFyZWEgKSBdIDogW10gKSxcbiAgICBub2RlLmdldFNlbGZTaGFwZSgpLFxuXG4gICAgLi4ubm9kZS5jaGlsZHJlbi5maWx0ZXIoIGNoaWxkID0+IHtcbiAgICAgIHJldHVybiBjaGlsZC52aXNpYmxlICYmIGNoaWxkLnBpY2thYmxlICE9PSBmYWxzZTtcbiAgICB9ICkubWFwKCBjaGlsZCA9PiBnZXRMb2NhbFNoYXBlKCBjaGlsZCwgdXNlTW91c2UsIHVzZVRvdWNoICkudHJhbnNmb3JtZWQoIGNoaWxkLm1hdHJpeCApIClcbiAgXS5maWx0ZXIoIHNoYXBlID0+IHNoYXBlLmJvdW5kcy5pc1ZhbGlkKCkgKSApO1xuXG4gIGlmICggbm9kZS5oYXNDbGlwQXJlYSgpICkge1xuICAgIHNoYXBlID0gc2hhcGUuc2hhcGVJbnRlcnNlY3Rpb24oIG5vZGUuY2xpcEFyZWEhICk7XG4gIH1cbiAgcmV0dXJuIHNoYXBlO1xufTtcblxuY29uc3QgZ2V0U2hhcGUgPSAoIHRyYWlsOiBUcmFpbCwgdXNlTW91c2U6IGJvb2xlYW4sIHVzZVRvdWNoOiBib29sZWFuICk6IFNoYXBlID0+IHtcbiAgbGV0IHNoYXBlID0gZ2V0TG9jYWxTaGFwZSggdHJhaWwubGFzdE5vZGUoKSwgdXNlTW91c2UsIHVzZVRvdWNoICk7XG5cbiAgZm9yICggbGV0IGkgPSB0cmFpbC5ub2Rlcy5sZW5ndGggLSAxOyBpID49IDA7IGktLSApIHtcbiAgICBjb25zdCBub2RlID0gdHJhaWwubm9kZXNbIGkgXTtcblxuICAgIGlmICggbm9kZS5oYXNDbGlwQXJlYSgpICkge1xuICAgICAgc2hhcGUgPSBzaGFwZS5zaGFwZUludGVyc2VjdGlvbiggbm9kZS5jbGlwQXJlYSEgKTtcbiAgICB9XG4gICAgc2hhcGUgPSBzaGFwZS50cmFuc2Zvcm1lZCggbm9kZS5tYXRyaXggKTtcbiAgfVxuXG4gIHJldHVybiBzaGFwZTtcbn07Il0sIm5hbWVzIjpbImFuaW1hdGlvbkZyYW1lVGltZXIiLCJCb29sZWFuUHJvcGVydHkiLCJkZWZhdWx0IiwiY3JlYXRlT2JzZXJ2YWJsZUFycmF5IiwiRGVyaXZlZFByb3BlcnR5IiwiRW51bWVyYXRpb25Qcm9wZXJ0eSIsIk1hcHBlZFByb3BlcnR5IiwiTXVsdGlsaW5rIiwiVGlueVByb3BlcnR5IiwiaXNUUmVhZE9ubHlQcm9wZXJ0eSIsIkJvdW5kczIiLCJVdGlscyIsIlZlY3RvcjIiLCJTaGFwZSIsIkVudW1lcmF0aW9uIiwiRW51bWVyYXRpb25WYWx1ZSIsImluaGVyaXRhbmNlIiwibWVyZ2UiLCJvcHRpb25pemUiLCJNZWFzdXJpbmdUYXBlTm9kZSIsIlBoZXRGb250IiwiQ2FudmFzTm9kZSIsIkNpcmNsZSIsIkNvbG9yIiwiRGlzcGxheSIsIkRPTSIsIkRyYWdMaXN0ZW5lciIsImV4dGVuZHNIZWlnaHRTaXphYmxlIiwiZXh0ZW5kc1dpZHRoU2l6YWJsZSIsIkZpcmVMaXN0ZW5lciIsIkZsb3dCb3giLCJGb250IiwiR3JpZEJveCIsIkhCb3giLCJIU2VwYXJhdG9yIiwiSW1hZ2UiLCJMYXlvdXROb2RlIiwiTGluZSIsIkxpbmVhckdyYWRpZW50IiwiTm9kZSIsIk5vZGVQYXR0ZXJuIiwiUGFpbnQiLCJQYXRoIiwiUGF0dGVybiIsIlByZXNzTGlzdGVuZXIiLCJSYWRpYWxHcmFkaWVudCIsIlJlY3RhbmdsZSIsIlJpY2hUZXh0IiwiU3BhY2VyIiwiVGV4dCIsIlRyYWlsIiwiVkJveCIsIldlYkdMTm9kZSIsIkFxdWFSYWRpb0J1dHRvbkdyb3VwIiwiUmVjdGFuZ3VsYXJQdXNoQnV0dG9uIiwiQ2hlY2tib3giLCJFeHBhbmRDb2xsYXBzZUJ1dHRvbiIsIlBhbmVsIiwiVGFuZGVtIiwiam9pc3QiLCJyb3VuZCIsIm4iLCJwbGFjZXMiLCJ0b0ZpeGVkIiwiUG9pbnRlckFyZWFUeXBlIiwiTU9VU0UiLCJUT1VDSCIsIk5PTkUiLCJlbnVtZXJhdGlvbiIsImhhc0hlbHBlck5vZGUiLCJub2RlIiwiZ2V0SGVscGVyTm9kZSIsIkhlbHBlciIsImluaXRpYWxpemUiLCJzaW0iLCJzaW1EaXNwbGF5IiwiZG9jdW1lbnQiLCJhZGRFdmVudExpc3RlbmVyIiwiZXZlbnQiLCJjdHJsS2V5Iiwia2V5IiwiaGVscGVyIiwiYWN0aXZlUHJvcGVydHkiLCJ2YWx1ZSIsInZpc3VhbFRyZWVWaXNpYmxlUHJvcGVydHkiLCJ0YW5kZW0iLCJPUFRfT1VUIiwicGRvbVRyZWVWaXNpYmxlUHJvcGVydHkiLCJ1bmRlclBvaW50ZXJWaXNpYmxlUHJvcGVydHkiLCJvcHRpb25zVmlzaWJsZVByb3BlcnR5IiwicHJldmlld1Zpc2libGVQcm9wZXJ0eSIsInNlbGVjdGVkTm9kZUNvbnRlbnRWaXNpYmxlUHJvcGVydHkiLCJzZWxlY3RlZFRyYWlsQ29udGVudFZpc2libGVQcm9wZXJ0eSIsImhpZ2hsaWdodFZpc2libGVQcm9wZXJ0eSIsImJvdW5kc1Zpc2libGVQcm9wZXJ0eSIsInNlbGZCb3VuZHNWaXNpYmxlUHJvcGVydHkiLCJnZXRIZWxwZXJOb2RlVmlzaWJsZVByb3BlcnR5IiwiaGVscGVyVmlzaWJsZVByb3BlcnR5IiwiaW5wdXRCYXNlZFBpY2tpbmdQcm9wZXJ0eSIsInVzZUxlYWZOb2RlUHJvcGVydHkiLCJwb2ludGVyQXJlYVR5cGVQcm9wZXJ0eSIsInBvaW50ZXJQb3NpdGlvblByb3BlcnR5IiwiWkVSTyIsIm92ZXJJbnRlcmZhY2VQcm9wZXJ0eSIsInNlbGVjdGVkVHJhaWxQcm9wZXJ0eSIsInRyZWVIb3ZlclRyYWlsUHJvcGVydHkiLCJwb2ludGVyVHJhaWxQcm9wZXJ0eSIsInBvaW50Iiwib3ZlckludGVyZmFjZSIsInBvaW50ZXJBcmVhVHlwZSIsImlucHV0QmFzZWRQaWNraW5nIiwidmlzdWFsSGl0VGVzdCIsInJvb3ROb2RlIiwidHJhaWwiLCJoaXRUZXN0IiwibGVuZ3RoIiwibGFzdE5vZGUiLCJpbnB1dExpc3RlbmVycyIsInJlbW92ZURlc2NlbmRhbnQiLCJsaXN0ZW5lcnMiLCJmaXJzdExpc3RlbmVyIiwidGFyZ2V0Tm9kZSIsImNvbnRhaW5zTm9kZSIsInN1YnRyYWlsVG8iLCJ2YWx1ZUNvbXBhcmlzb25TdHJhdGVneSIsInByZXZpZXdUcmFpbFByb3BlcnR5Iiwic2VsZWN0ZWQiLCJ0cmVlSG92ZXIiLCJhY3RpdmUiLCJwcmV2aWV3U2hhcGVQcm9wZXJ0eSIsInByZXZpZXdUcmFpbCIsImdldFNoYXBlIiwiaGVscGVyTm9kZVByb3BlcnR5Iiwic2NyZWVuVmlld1Byb3BlcnR5IiwiaW1hZ2VEYXRhUHJvcGVydHkiLCJjb2xvclByb3BlcnR5IiwicG9zaXRpb24iLCJpbWFnZURhdGEiLCJUUkFOU1BBUkVOVCIsIngiLCJNYXRoIiwiZmxvb3IiLCJ3aWR0aCIsInkiLCJoZWlnaHQiLCJpbmRleCIsImRhdGEiLCJmdXp6UHJvcGVydHkiLCJwaGV0IiwiY2hpcHBlciIsInF1ZXJ5UGFyYW1ldGVycyIsImZ1enoiLCJsYXp5TGluayIsIm1lYXN1cmluZ1RhcGVWaXNpYmxlUHJvcGVydHkiLCJtZWFzdXJpbmdUYXBlVW5pdHNQcm9wZXJ0eSIsIm5hbWUiLCJtdWx0aXBsaWVyIiwibGF5b3V0Qm91bmRzUHJvcGVydHkiLCJOT1RISU5HIiwiaGVscGVyUm9vdCIsInJlbmRlcmVyIiwicG9zaXRpb25TdHJpbmdQcm9wZXJ0eSIsImJpZGlyZWN0aW9uYWwiLCJtYXAiLCJ2aWV3Iiwidmlld1Bvc2l0aW9uIiwiZ2xvYmFsVG9Mb2NhbFBvaW50IiwicG9zaXRpb25UZXh0IiwiZm9udCIsImNvbG9yVGV4dE1hcCIsImNvbG9yIiwidG9IZXhTdHJpbmciLCJ0b0NTUyIsImNvbG9yU3RyaW5nUHJvcGVydHkiLCJjb2xvclRleHQiLCJsaW5rIiwiZmlsbCIsImdldEx1bWluYW5jZSIsIkJMQUNLIiwiV0hJVEUiLCJib3VuZHNDb2xvciIsInNlbGZCb3VuZHNDb2xvciIsIm5vbklucHV0QmFzZWRDb2xvciIsIm1vdXNlQ29sb3IiLCJ0b3VjaENvbG9yIiwiaW5wdXRCYXNlZENvbG9yIiwiaGlnaGxpZ2h0QmFzZUNvbG9yUHJvcGVydHkiLCJjb2xvckJhY2tncm91bmQiLCJjb3JuZXJSYWRpdXMiLCJzdHJva2UiLCJwcmV2aWV3Tm9kZSIsInZpc2libGVQcm9wZXJ0eSIsInByZXZpZXdCYWNrZ3JvdW5kIiwiY2hpbGRyZW4iLCJyZW1vdmVBbGxDaGlsZHJlbiIsImFkZENoaWxkIiwiYm91bmRzIiwiaXNWYWxpZCIsInNjYWxlIiwid2luZG93IiwiZGV2aWNlUGl4ZWxSYXRpbyIsIm1pbiIsInNlbGZCb3VuZHMiLCJjZW50ZXIiLCJyYXN0ZXJpemVkIiwicmVzb2x1dGlvbiIsInNvdXJjZUJvdW5kcyIsImRpbGF0ZWQiLCJyb3VuZGVkT3V0Iiwic2VsZWN0ZWROb2RlQ29udGVudCIsInNwYWNpbmciLCJhbGlnbiIsImNyZWF0ZUluZm8iLCJmdXp6Q2hlY2tib3giLCJIZWxwZXJDaGVja2JveCIsIm1lYXN1cmluZ1RhcGVWaXNpYmxlQ2hlY2tib3giLCJ2aXN1YWxUcmVlVmlzaWJsZUNoZWNrYm94IiwicGRvbVRyZWVWaXNpYmxlQ2hlY2tib3giLCJpbnB1dEJhc2VkUGlja2luZ0NoZWNrYm94IiwidXNlTGVhZk5vZGVDaGVja2JveCIsImVuYWJsZWRQcm9wZXJ0eSIsImhpZ2hsaWdodFZpc2libGVDaGVja2JveCIsImxhYmVsT3B0aW9ucyIsImJvdW5kc1Zpc2libGVDaGVja2JveCIsInNlbGZCb3VuZHNWaXNpYmxlQ2hlY2tib3giLCJnZXRIZWxwZXJOb2RlVmlzaWJsZUNoZWNrYm94IiwicG9pbnRlckFyZWFUeXBlUmFkaW9CdXR0b25Hcm91cCIsImNyZWF0ZU5vZGUiLCJmb250U2l6ZSIsIm9yaWVudGF0aW9uIiwicmFkaW9CdXR0b25PcHRpb25zIiwieFNwYWNpbmciLCJzZWxlY3RlZFRyYWlsQ29udGVudCIsIm5vZGVzIiwic2xpY2UiLCJmb3JFYWNoIiwiaW5kZXhPZiIsImNvbnN0cnVjdG9yIiwibGF5b3V0T3B0aW9ucyIsImxlZnRNYXJnaW4iLCJjdXJzb3IiLCJmaXJlIiwiZm9jdXNTZWxlY3RlZCIsImNvcHkiLCJhZGREZXNjZW5kYW50IiwiaXNWaXNpYmxlIiwiZ2V0T3BhY2l0eSIsImhhc1BpY2thYmxlRmFsc2VFcXVpdmFsZW50IiwiXyIsInNvbWUiLCJwaWNrYWJsZSIsInZpc2libGUiLCJoYXNQaWNrYWJsZVRydWVFcXVpdmFsZW50IiwiZ2V0TWF0cml4IiwiaXNJZGVudGl0eSIsIk1hdHJpeDNOb2RlIiwidmlzdWFsVHJlZU5vZGUiLCJUcmVlTm9kZSIsIlZpc3VhbFRyZWVOb2RlIiwicGRvbVRyZWVOb2RlIiwiUERPTVRyZWVOb2RlIiwiX3Jvb3RQRE9NSW5zdGFuY2UiLCJib3VuZHNQYXRoIiwid2l0aEFscGhhIiwibGluZURhc2giLCJsaW5lRGFzaE9mZnNldCIsImxvY2FsQm91bmRzIiwic2hhcGUiLCJ0cmFuc2Zvcm1lZCIsInNlbGZCb3VuZHNQYXRoIiwiaGlnaGxpZ2h0RmlsbFByb3BlcnR5IiwiaGlnaGxpZ2h0UGF0aCIsImhlbHBlck5vZGVDb250YWluZXIiLCJtYXRyaXgiLCJiYWNrZ3JvdW5kTm9kZSIsImFkZElucHV0TGlzdGVuZXIiLCJwcmVzcyIsInVuZGVyUG9pbnRlck5vZGUiLCJvcHRpb25zTm9kZSIsImNyZWF0ZUhlYWRlclRleHQiLCJfYWNjZXNzaWJsZSIsInVuZGVmaW5lZCIsInRvcE1hcmdpbiIsImhlbHBlclJlYWRvdXRDb250ZW50IiwiY3JlYXRlQ29sbGFwc2libGVIZWFkZXJUZXh0IiwiaGVscGVyUmVhZG91dENvbGxhcHNpYmxlIiwiaGVscGVyUmVhZG91dFBhbmVsIiwidHJhbnNsYXRlTm9kZSIsIndoZWVsIiwiZGVsdGFZIiwiZG9tRXZlbnQiLCJtZWFzdXJpbmdUYXBlTm9kZSIsInRleHRCYWNrZ3JvdW5kQ29sb3IiLCJiYXNlUG9zaXRpb25Qcm9wZXJ0eSIsInRpcFBvc2l0aW9uUHJvcGVydHkiLCJyZXNpemVMaXN0ZW5lciIsInNpemUiLCJoZWxwZXJEaXNwbGF5Iiwid2l0aE1heFgiLCJ3aXRoTWF4WSIsIm1vdXNlQXJlYSIsInRvdWNoQXJlYSIsInJlc2l6ZSIsImZyYW1lTGlzdGVuZXIiLCJkdCIsImNvbnRhaW5zUG9pbnQiLCJ1cGRhdGVEaXNwbGF5Iiwic2NyZWVuIiwic2VsZWN0ZWRTY3JlZW5Qcm9wZXJ0eSIsImhhc1ZpZXciLCJhc3N1bWVGdWxsV2luZG93IiwiaW5pdGlhbGl6ZUV2ZW50cyIsImRpbWVuc2lvblByb3BlcnR5IiwiYWRkTGlzdGVuZXIiLCJib2R5IiwiYXBwZW5kQ2hpbGQiLCJkb21FbGVtZW50Iiwic3R5bGUiLCJ6SW5kZXgiLCJvbkxvY2F0aW9uRXZlbnQiLCJwb2ludGVyIiwibW92ZSIsImRvd24iLCJ1cCIsImdldEdsb2JhbFRvTG9jYWxNYXRyaXgiLCJnZXRTY2FsZVZlY3RvciIsImZvcmVpZ25PYmplY3RSYXN0ZXJpemF0aW9uIiwiZGF0YVVSSSIsImltYWdlIiwiY3JlYXRlRWxlbWVudCIsImNhbnZhcyIsImNvbnRleHQiLCJnZXRDb250ZXh0IiwiZHJhd0ltYWdlIiwiZ2V0SW1hZ2VEYXRhIiwic3JjIiwiY29uc29sZSIsImxvZyIsInVubGluayIsInJlbW92ZUxpc3RlbmVyIiwicmVtb3ZlQ2hpbGQiLCJkaXNwb3NlIiwicmVnaXN0ZXIiLCJwcm9wZXJ0eSIsImxhYmVsIiwicHJvdmlkZWRPcHRpb25zIiwib3B0aW9ucyIsImJveFdpZHRoIiwiQ29sbGFwc2libGVUcmVlTm9kZSIsImV4cGFuZCIsImV4cGFuZGVkUHJvcGVydHkiLCJjb2xsYXBzZSIsImV4cGFuZFJlY3VzaXZlbHkiLCJjaGlsZFRyZWVOb2RlcyIsInRyZWVOb2RlIiwiY29sbGFwc2VSZWN1cnNpdmVseSIsInNlbGZOb2RlIiwiY3JlYXRlQ2hpbGRyZW4iLCJpbmRlbnQiLCJleGNsdWRlSW52aXNpYmxlQ2hpbGRyZW5Gcm9tQm91bmRzIiwiY2VudGVyWSIsImVsZW1lbnRzIiwiYnV0dG9uU2l6ZSIsImV4cGFuZENvbGxhcHNlU2hhcGUiLCJtb3ZlVG9Qb2ludCIsImNyZWF0ZVBvbGFyIiwiUEkiLCJwbHVzWFkiLCJsaW5lVG8iLCJsaW5lVG9Qb2ludCIsImV4cGFuZENvbGxhcHNlQnV0dG9uIiwibGluZUNhcCIsImxpbmVXaWR0aCIsInJpZ2h0IiwiZXhwYW5kZWQiLCJyb3RhdGlvbiIsImNoaWxkQ29udGFpbmVyIiwiYm90dG9tIiwib25DaGlsZHJlbkNoYW5nZSIsImFkZEl0ZW1BZGRlZExpc3RlbmVyIiwiYWRkSXRlbVJlbW92ZWRMaXN0ZW5lciIsIm11dGF0ZSIsImZpbmQiLCJlcXVhbHMiLCJjaGlsZFRyZWVOb2RlIiwiaXNFeHRlbnNpb25PZiIsIlRSRUVfRk9OVCIsIm5hbWVOb2RlIiwic3RyaW5nIiwic2VsZkJhY2tncm91bmQiLCJlbnRlciIsImV4aXQiLCJjaGlsZCIsImluc3RhbmNlIiwiaXNQRE9NVmlzaWJsZSIsInRhZ05hbWUiLCJ3ZWlnaHQiLCJsYWJlbENvbnRlbnQiLCJpbm5lckNvbnRlbnQiLCJkZXNjcmlwdGlvbkNvbnRlbnQiLCJwYXJlbnRUcmFpbCIsInBhcmVudCIsImZpbHRlciIsImpvaW4iLCJyZWN0SGVpZ2h0IiwidHJlZUNvbnRhaW5lciIsImNsaXBBcmVhIiwiY29uc3RyYWluVHJlZSIsInRyZWVNYXJnaW5YIiwidHJlZU1hcmdpblkiLCJ0b3AiLCJsZWZ0IiwiZm9jdXNUcmFpbCIsImxvY2FsVG9HbG9iYWxQb2ludCIsImZvY3VzUG9pbnRlciIsImNyZWF0ZVRyZWVOb2RlIiwicmVjdFdpZHRoIiwiZHJhZyIsImxpc3RlbmVyIiwibW9kZWxEZWx0YSIsImRlbHRhWCIsIm11bHRpbGluayIsInRyZWVWaXNpYmxlIiwic3RyIiwiZm9udFdlaWdodCIsImJvdW5kc1Byb3BlcnR5IiwiaXNFbXB0eSIsImhlYWRlclRleHQiLCJzaWRlTGVuZ3RoIiwieVNwYWNpbmciLCJtMDAiLCJjb2x1bW4iLCJyb3ciLCJtMDEiLCJtMDIiLCJtMTAiLCJtMTEiLCJtMTIiLCJtMjAiLCJtMjEiLCJtMjIiLCJTaGFwZU5vZGUiLCJtYXhXaWR0aCIsIm1heEhlaWdodCIsInN0cm9rZVBpY2thYmxlIiwiY29weVRvQ2xpcGJvYXJkIiwiZ2V0U1ZHUGF0aCIsIkltYWdlTm9kZSIsImdldEltYWdlIiwidHlwZXMiLCJ0eXBlIiwicmVkdWNlZFR5cGVzIiwiaW5jbHVkZXMiLCJwdXNoIiwiaSIsInJlcGVhdCIsImFkZFJhdyIsInZhbHVlTm9kZSIsImFkZFNpbXBsZSIsImxpbmVXcmFwIiwiY29sb3JTd2F0Y2giLCJhZGRDb2xvciIsInJlc3VsdCIsImlDb2xvclRvQ29sb3IiLCJhZGRQYWludCIsInBhaW50Iiwic3RvcFRvTm9kZSIsInN0b3AiLCJyYXRpbyIsInN0YXJ0IiwiZW5kIiwic3RvcHMiLCJzdGFydFJhZGl1cyIsImVuZFJhZGl1cyIsImFkZE51bWJlciIsIm51bWJlciIsImFkZE1hdHJpeDMiLCJhZGRCb3VuZHMyIiwiRVZFUllUSElORyIsIm1pblgiLCJtYXhYIiwibWluWSIsIm1heFkiLCJhZGRTaGFwZSIsImFkZEltYWdlIiwic3VwcGxpZWQiLCJwaGV0aW9JRCIsInNwbGl0IiwiZWxlbWVudCIsIndpZHRoU2l6YWJsZSIsInByZWZlcnJlZFdpZHRoIiwibG9jYWxQcmVmZXJyZWRXaWR0aCIsIm1pbmltdW1XaWR0aCIsImxvY2FsTWluaW11bVdpZHRoIiwiaGVpZ2h0U2l6YWJsZSIsInByZWZlcnJlZEhlaWdodCIsImxvY2FsUHJlZmVycmVkSGVpZ2h0IiwibWluaW11bUhlaWdodCIsImxvY2FsTWluaW11bUhlaWdodCIsIkpTT04iLCJzdHJpbmdpZnkiLCJsYXlvdXRPcmlnaW4iLCJsaW5lU3BhY2luZyIsImp1c3RpZnkiLCJqdXN0aWZ5TGluZXMiLCJ3cmFwIiwic3RyZXRjaCIsImdyb3ciLCJyaWdodE1hcmdpbiIsImJvdHRvbU1hcmdpbiIsIm1pbkNvbnRlbnRXaWR0aCIsIm1pbkNvbnRlbnRIZWlnaHQiLCJtYXhDb250ZW50V2lkdGgiLCJtYXhDb250ZW50SGVpZ2h0IiwieEFsaWduIiwieUFsaWduIiwieFN0cmV0Y2giLCJ5U3RyZXRjaCIsInhHcm93IiwieUdyb3ciLCJyZWN0Qm91bmRzIiwiY29ybmVyWFJhZGl1cyIsImNvcm5lcllSYWRpdXMiLCJ4MSIsInkxIiwieDIiLCJ5MiIsInJhZGl1cyIsImJvdW5kc01ldGhvZCIsImdldEZvbnQiLCJpbWFnZVdpZHRoIiwiaW1hZ2VIZWlnaHQiLCJpbWFnZU9wYWNpdHkiLCJpbWFnZUJvdW5kcyIsImluaXRpYWxXaWR0aCIsImluaXRpYWxIZWlnaHQiLCJoaXRUZXN0UGl4ZWxzIiwiY2FudmFzQm91bmRzIiwiZmlsbFBpY2thYmxlIiwibGluZUpvaW4iLCJtaXRlckxpbWl0IiwiYWNjZXNzaWJsZU5hbWUiLCJoZWxwVGV4dCIsInBkb21IZWFkaW5nIiwiY29udGFpbmVyVGFnTmFtZSIsImNvbnRhaW5lckFyaWFSb2xlIiwiaW5wdXRUeXBlIiwiaW5wdXRWYWx1ZSIsInBkb21OYW1lc3BhY2UiLCJhcmlhTGFiZWwiLCJhcmlhUm9sZSIsImFyaWFWYWx1ZVRleHQiLCJsYWJlbFRhZ05hbWUiLCJhcHBlbmRMYWJlbCIsImRlc2NyaXB0aW9uVGFnTmFtZSIsImFwcGVuZERlc2NyaXB0aW9uIiwicGRvbVZpc2libGUiLCJwZG9tT3JkZXIiLCJvcGFjaXR5IiwiZW5hYmxlZCIsImlucHV0RW5hYmxlZCIsInRyYW5zZm9ybUJvdW5kcyIsInVzZXNPcGFjaXR5IiwibGF5ZXJTcGxpdCIsImNzc1RyYW5zZm9ybSIsImV4Y2x1ZGVJbnZpc2libGUiLCJwcmV2ZW50Rml0Iiwid2ViZ2xTY2FsZSIsImxvY2FsQm91bmRzT3ZlcnJpZGRlbiIsImlzRmluaXRlIiwiY29udGVudCIsImluZGljZXMiLCJub25Qcm9wZXJ0eSIsInRvQ29sb3IiLCJpc1BhaW50Tm9uVHJhbnNwYXJlbnQiLCJhbHBoYSIsImxvY2FsUG9pbnQiLCJfdHJhbnNmb3JtIiwiZ2V0SW52ZXJzZSIsInRpbWVzVmVjdG9yMiIsIl9jaGlsZHJlbiIsImNoaWxkSGl0IiwiYWRkQW5jZXN0b3IiLCJoYXNTaGFwZSIsImdldFN0cm9rZWRTaGFwZSIsImNvbnRhaW5zUG9pbnRTZWxmIiwibmF2aWdhdG9yIiwiY2xpcGJvYXJkIiwid3JpdGVUZXh0IiwiZ2V0TG9jYWxTaGFwZSIsInVzZU1vdXNlIiwidXNlVG91Y2giLCJ1bmlvbiIsImdldFNlbGZTaGFwZSIsImhhc0NsaXBBcmVhIiwic2hhcGVJbnRlcnNlY3Rpb24iXSwibWFwcGluZ3MiOiJBQUFBLHNEQUFzRDtBQUN0RDs7OztDQUlDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUVELE9BQU9BLHlCQUF5Qix1Q0FBdUM7QUFDdkUsT0FBT0MscUJBQXFCLG1DQUFtQztBQUMvRCxTQUFTQyxXQUFXQyxxQkFBcUIsUUFBeUIseUNBQXlDO0FBQzNHLE9BQU9DLHFCQUFxQixtQ0FBbUM7QUFDL0QsT0FBT0MseUJBQXlCLHVDQUF1QztBQUN2RSxPQUFPQyxvQkFBb0Isa0NBQWtDO0FBQzdELE9BQU9DLGVBQWUsNkJBQTZCO0FBRW5ELE9BQU9DLGtCQUFrQixnQ0FBZ0M7QUFFekQsU0FBNEJDLG1CQUFtQixRQUFRLHFDQUFxQztBQUM1RixPQUFPQyxhQUFhLDBCQUEwQjtBQUc5QyxPQUFPQyxXQUFXLHdCQUF3QjtBQUMxQyxPQUFPQyxhQUFhLDBCQUEwQjtBQUM5QyxTQUFTQyxLQUFLLFFBQVEsMkJB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