// Copyright 2019-2024, University of Colorado Boulder
/**
 * The button on a combo box box.  Displays the current selection on the button.
 * Typically instantiated by ComboBox, not by client code.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */ import DerivedProperty from '../../axon/js/DerivedProperty.js';
import Multilink from '../../axon/js/Multilink.js';
import PatternStringProperty from '../../axon/js/PatternStringProperty.js';
import Property from '../../axon/js/Property.js';
import TinyProperty from '../../axon/js/TinyProperty.js';
import { Shape } from '../../kite/js/imports.js';
import optionize from '../../phet-core/js/optionize.js';
import { AriaHasPopUpMutator, GridBox, Line, Node, Path, PDOMPeer } from '../../scenery/js/imports.js';
import nullSoundPlayer from '../../tambo/js/nullSoundPlayer.js';
import Tandem from '../../tandem/js/Tandem.js';
import ButtonNode from './buttons/ButtonNode.js';
import RectangularPushButton from './buttons/RectangularPushButton.js';
import ComboBox from './ComboBox.js';
import sun from './sun.js';
import SunConstants from './SunConstants.js';
// constants
const ALIGN_VALUES = [
    'left',
    'center',
    'right'
];
const ARROW_DIRECTION_VALUES = [
    'up',
    'down'
];
// The definition for how ComboBoxButton sets its accessibleName in the PDOM. See ComboBox.md for further style guide
// and documentation on the pattern.
const ACCESSIBLE_NAME_BEHAVIOR = (node, options, accessibleName)=>{
    options.labelContent = accessibleName;
    return options;
};
let ComboBoxButton = class ComboBoxButton extends RectangularPushButton {
    /**
   * Sets the button to look like a value display instead of a combo box button.
   * See https://github.com/phetsims/sun/issues/451
   */ setDisplayOnly(displayOnly) {
        this.arrow.visible = !displayOnly;
        this.separatorLine.visible = !displayOnly;
    }
    /**
   * Call to block voicing from occurring upon this button's next focus event.
   * For use by ComboBox.
   */ blockNextVoicingFocusListener() {
        this._blockNextVoicingFocusListener = true;
    }
    dispose() {
        this.disposeComboBoxButton();
        super.dispose();
    }
    constructor(property, items, nodes, providedOptions){
        const options = optionize()({
            align: 'left',
            arrowDirection: 'down',
            arrowFill: 'black',
            comboBoxVoicingNameResponsePattern: SunConstants.VALUE_NAMED_PLACEHOLDER,
            // RectangularPushButton options
            cursor: 'pointer',
            baseColor: 'white',
            buttonAppearanceStrategy: ButtonNode.FlatAppearanceStrategy,
            xMargin: 12,
            yMargin: 8,
            stroke: 'black',
            lineWidth: 1,
            soundPlayer: nullSoundPlayer,
            // PushButtonModel options
            enabledPropertyOptions: {
                phetioFeatured: false
            },
            visiblePropertyOptions: {
                phetioFeatured: false
            },
            localPreferredWidthProperty: new TinyProperty(null),
            localMinimumWidthProperty: new TinyProperty(null),
            // pdom
            containerTagName: 'div',
            labelTagName: 'p',
            accessibleNameBehavior: ACCESSIBLE_NAME_BEHAVIOR
        }, providedOptions);
        assert && assert(_.includes(ALIGN_VALUES, options.align), `invalid align: ${options.align}`);
        assert && assert(_.includes(ARROW_DIRECTION_VALUES, options.arrowDirection), `invalid arrowDirection: ${options.arrowDirection}`);
        // To improve readability
        const itemXMargin = options.xMargin;
        const itemYMargin = options.yMargin;
        // Compute max item size
        const maxItemWidthProperty = ComboBox.getMaxItemWidthProperty(nodes);
        const maxItemHeightProperty = ComboBox.getMaxItemHeightProperty(nodes);
        const arrow = new Path(null, {
            fill: options.arrowFill
        });
        // Wrapper for the selected item's Node.
        // Do not transform ComboBoxItem.node because it is shared with ComboBoxListItemNode.
        const matchingItem = _.find(items, (item)=>item.value === property.value);
        const index = items.indexOf(matchingItem);
        assert && assert(index >= 0, 'Current value of property is not in list of items', property.value);
        const itemNodeWrapper = new Node({
            layoutOptions: {
                yMargin: itemYMargin,
                grow: 1,
                xAlign: options.align
            },
            children: [
                nodes[index]
            ]
        });
        // Line separator between the item and arrow that is the full height of the button.
        // We cannot use VSeparator here, because it is incompatible with GridConstraints.
        // y2 is set during a multilink according to the item height property.
        const separatorLine = new Line(0, 0, 0, 0, {
            stroke: 'black',
            lineWidth: options.lineWidth
        });
        options.content = new GridBox({
            rows: [
                [
                    itemNodeWrapper,
                    separatorLine,
                    arrow
                ]
            ]
        });
        // Update the drop-down arrow.  No dispose is needed since the dependencies are locally owned.
        Multilink.multilink([
            maxItemWidthProperty,
            maxItemHeightProperty
        ], (maxItemWidth, maxItemHeight)=>{
            const fullHeight = maxItemHeight + 2 * itemYMargin;
            // We want the arrow area to be square, see https://github.com/phetsims/sun/issues/453
            const arrowAreaSize = fullHeight;
            // The arrow is sized to fit in the arrow area, empirically determined to be visually pleasing.
            const arrowHeight = 0.35 * arrowAreaSize; // height of equilateral triangle
            const arrowWidth = 2 * arrowHeight * Math.sqrt(3) / 3; // side of equilateral triangle
            const leftMargin = itemXMargin;
            const middleMargin = itemXMargin - options.lineWidth / 2; // Compensation for the separator having width
            const rightMargin = -options.lineWidth / 2; // Compensation for the separator having width
            // arrow that points up or down, to indicate which way the list pops up
            const createArrowShape = (direction, width, height)=>{
                if (direction === 'up') {
                    return new Shape().moveTo(0, height).lineTo(width / 2, 0).lineTo(width, height).close();
                } else {
                    return new Shape().moveTo(0, 0).lineTo(width, 0).lineTo(width / 2, height).close();
                }
            };
            arrow.shape = createArrowShape(options.arrowDirection, arrowWidth, arrowHeight);
            arrow.mutateLayoutOptions({
                minContentWidth: arrowAreaSize,
                minContentHeight: arrowAreaSize
            });
            itemNodeWrapper.mutateLayoutOptions({
                minContentWidth: maxItemWidth,
                minContentHeight: maxItemHeight,
                leftMargin: leftMargin,
                rightMargin: middleMargin
            });
            separatorLine.y2 = fullHeight;
            separatorLine.mutateLayoutOptions({
                rightMargin: rightMargin
            });
        });
        // Margins are different in the item and button areas. And we want the vertical separator to extend
        // beyond the margin.  We've handled those margins above, so the actual margins propagated to the button
        // need to be zero.
        options.xMargin = 0;
        options.yMargin = 0;
        super(options);
        // Provide our minimum width back up to the ComboBox (or creator)
        this.minimumWidthProperty.link((minimumWidth)=>{
            options.localMinimumWidthProperty.value = minimumWidth;
        });
        // Hook our ComboBox's preferredWidth up to ours
        const preferredWidthListener = (preferredWidth)=>{
            this.preferredWidth = preferredWidth;
        };
        options.localPreferredWidthProperty.link(preferredWidthListener);
        this._blockNextVoicingFocusListener = false;
        this.voicingFocusListener = ()=>{
            // fire the listener only if we are not blocking the focus listener
            !this._blockNextVoicingFocusListener && this.defaultFocusListener();
            this._blockNextVoicingFocusListener = false;
        };
        // Keep track for disposal
        let voicingPatternstringProperty = null;
        const itemProperty = new DerivedProperty([
            property
        ], (value)=>{
            const item = _.find(items, (item)=>item.value === value);
            assert && assert(item, `no item found for value: ${value}`);
            return item;
        });
        const nodeProperty = new DerivedProperty([
            itemProperty
        ], (item)=>{
            return nodes[items.indexOf(item)];
        });
        // Show the corresponding item's Node on the button.
        nodeProperty.link((node)=>{
            // remove the node for the previous item
            itemNodeWrapper.removeAllChildren();
            // add the associated node
            itemNodeWrapper.addChild(node);
        });
        // Update the button's accessible name when the item changes.
        itemProperty.link((item)=>{
            // pdom
            this.innerContent = item.accessibleName || null;
            const patternProperty = typeof options.comboBoxVoicingNameResponsePattern === 'string' ? new Property(options.comboBoxVoicingNameResponsePattern) : options.comboBoxVoicingNameResponsePattern;
            voicingPatternstringProperty && voicingPatternstringProperty.dispose();
            // TODO: DO NOT have this getting recreated, we can simply create one up front, see https://github.com/phetsims/sun/issues/865
            this.voicingNameResponse = voicingPatternstringProperty = new PatternStringProperty(patternProperty, {
                value: item.accessibleName || ''
            }, {
                tandem: Tandem.OPT_OUT
            });
        });
        // Add aria-labelledby attribute to the button.
        // The button is aria-labelledby its own label sibling, and then (second) its primary sibling in the PDOM.
        // Order matters!
        this.ariaLabelledbyAssociations = [
            {
                otherNode: this,
                otherElementName: PDOMPeer.LABEL_SIBLING,
                thisElementName: PDOMPeer.PRIMARY_SIBLING
            },
            {
                otherNode: this,
                otherElementName: PDOMPeer.PRIMARY_SIBLING,
                thisElementName: PDOMPeer.PRIMARY_SIBLING
            }
        ];
        // signify to AT that this button opens a menu
        AriaHasPopUpMutator.mutateNode(this, 'listbox');
        this.disposeComboBoxButton = ()=>{
            maxItemWidthProperty.dispose();
            maxItemHeightProperty.dispose();
            itemProperty.dispose();
            options.localPreferredWidthProperty.unlink(preferredWidthListener);
            voicingPatternstringProperty && voicingPatternstringProperty.dispose();
        };
        this.arrow = arrow;
        this.separatorLine = separatorLine;
    }
};
export { ComboBoxButton as default };
sun.register('ComboBoxButton', ComboBoxButton);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3N1bi9qcy9Db21ib0JveEJ1dHRvbi50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxOS0yMDI0LCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuLyoqXG4gKiBUaGUgYnV0dG9uIG9uIGEgY29tYm8gYm94IGJveC4gIERpc3BsYXlzIHRoZSBjdXJyZW50IHNlbGVjdGlvbiBvbiB0aGUgYnV0dG9uLlxuICogVHlwaWNhbGx5IGluc3RhbnRpYXRlZCBieSBDb21ib0JveCwgbm90IGJ5IGNsaWVudCBjb2RlLlxuICpcbiAqIEBhdXRob3IgQ2hyaXMgTWFsbGV5IChQaXhlbFpvb20sIEluYy4pXG4gKi9cblxuaW1wb3J0IERlcml2ZWRQcm9wZXJ0eSBmcm9tICcuLi8uLi9heG9uL2pzL0Rlcml2ZWRQcm9wZXJ0eS5qcyc7XG5pbXBvcnQgTXVsdGlsaW5rIGZyb20gJy4uLy4uL2F4b24vanMvTXVsdGlsaW5rLmpzJztcbmltcG9ydCBQYXR0ZXJuU3RyaW5nUHJvcGVydHkgZnJvbSAnLi4vLi4vYXhvbi9qcy9QYXR0ZXJuU3RyaW5nUHJvcGVydHkuanMnO1xuaW1wb3J0IFByb3BlcnR5IGZyb20gJy4uLy4uL2F4b24vanMvUHJvcGVydHkuanMnO1xuaW1wb3J0IFRpbnlQcm9wZXJ0eSBmcm9tICcuLi8uLi9heG9uL2pzL1RpbnlQcm9wZXJ0eS5qcyc7XG5pbXBvcnQgVFByb3BlcnR5IGZyb20gJy4uLy4uL2F4b24vanMvVFByb3BlcnR5LmpzJztcbmltcG9ydCBUUmVhZE9ubHlQcm9wZXJ0eSBmcm9tICcuLi8uLi9heG9uL2pzL1RSZWFkT25seVByb3BlcnR5LmpzJztcbmltcG9ydCB7IFNoYXBlIH0gZnJvbSAnLi4vLi4va2l0ZS9qcy9pbXBvcnRzLmpzJztcbmltcG9ydCBvcHRpb25pemUgZnJvbSAnLi4vLi4vcGhldC1jb3JlL2pzL29wdGlvbml6ZS5qcyc7XG5pbXBvcnQgU3RyaWN0T21pdCBmcm9tICcuLi8uLi9waGV0LWNvcmUvanMvdHlwZXMvU3RyaWN0T21pdC5qcyc7XG5pbXBvcnQgeyBBcmlhSGFzUG9wVXBNdXRhdG9yLCBHcmlkQm94LCBMaW5lLCBOb2RlLCBQYXRoLCBQRE9NQmVoYXZpb3JGdW5jdGlvbiwgUERPTVBlZXIsIFRQYWludCB9IGZyb20gJy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XG5pbXBvcnQgbnVsbFNvdW5kUGxheWVyIGZyb20gJy4uLy4uL3RhbWJvL2pzL251bGxTb3VuZFBsYXllci5qcyc7XG5pbXBvcnQgVGFuZGVtIGZyb20gJy4uLy4uL3RhbmRlbS9qcy9UYW5kZW0uanMnO1xuaW1wb3J0IEJ1dHRvbk5vZGUgZnJvbSAnLi9idXR0b25zL0J1dHRvbk5vZGUuanMnO1xuaW1wb3J0IFJlY3Rhbmd1bGFyUHVzaEJ1dHRvbiwgeyBSZWN0YW5ndWxhclB1c2hCdXR0b25PcHRpb25zIH0gZnJvbSAnLi9idXR0b25zL1JlY3Rhbmd1bGFyUHVzaEJ1dHRvbi5qcyc7XG5pbXBvcnQgQ29tYm9Cb3gsIHsgQ29tYm9Cb3hJdGVtTm9Ob2RlIH0gZnJvbSAnLi9Db21ib0JveC5qcyc7XG5pbXBvcnQgc3VuIGZyb20gJy4vc3VuLmpzJztcbmltcG9ydCBTdW5Db25zdGFudHMgZnJvbSAnLi9TdW5Db25zdGFudHMuanMnO1xuXG4vLyBjb25zdGFudHNcbmNvbnN0IEFMSUdOX1ZBTFVFUyA9IFsgJ2xlZnQnLCAnY2VudGVyJywgJ3JpZ2h0JyBdIGFzIGNvbnN0O1xuY29uc3QgQVJST1dfRElSRUNUSU9OX1ZBTFVFUyA9IFsgJ3VwJywgJ2Rvd24nIF0gYXMgY29uc3Q7XG5cbmV4cG9ydCB0eXBlIENvbWJvQm94QnV0dG9uQWxpZ24gPSB0eXBlb2YgQUxJR05fVkFMVUVTW251bWJlcl07XG5leHBvcnQgdHlwZSBDb21ib0JveEJ1dHRvbkFycm93RGlyZWN0aW9uID0gdHlwZW9mIEFSUk9XX0RJUkVDVElPTl9WQUxVRVNbbnVtYmVyXTtcblxuLy8gVGhlIGRlZmluaXRpb24gZm9yIGhvdyBDb21ib0JveEJ1dHRvbiBzZXRzIGl0cyBhY2Nlc3NpYmxlTmFtZSBpbiB0aGUgUERPTS4gU2VlIENvbWJvQm94Lm1kIGZvciBmdXJ0aGVyIHN0eWxlIGd1aWRlXG4vLyBhbmQgZG9jdW1lbnRhdGlvbiBvbiB0aGUgcGF0dGVybi5cbmNvbnN0IEFDQ0VTU0lCTEVfTkFNRV9CRUhBVklPUjogUERPTUJlaGF2aW9yRnVuY3Rpb24gPSAoIG5vZGUsIG9wdGlvbnMsIGFjY2Vzc2libGVOYW1lICkgPT4ge1xuICBvcHRpb25zLmxhYmVsQ29udGVudCA9IGFjY2Vzc2libGVOYW1lO1xuICByZXR1cm4gb3B0aW9ucztcbn07XG5cbnR5cGUgU2VsZk9wdGlvbnMgPSB7XG4gIGFsaWduPzogQ29tYm9Cb3hCdXR0b25BbGlnbjtcbiAgYXJyb3dEaXJlY3Rpb24/OiBDb21ib0JveEJ1dHRvbkFycm93RGlyZWN0aW9uO1xuICBhcnJvd0ZpbGw/OiBUUGFpbnQ7XG5cbiAgLy8gVGhlIHBhdHRlcm4gZm9yIHRoZSB2b2ljaW5nTmFtZVJlc3BvbnNlLCB3aXRoIFwie3t2YWx1ZX19XCIgcHJvdmlkZWQgdG8gYmUgZmlsbGVkIGluIHdpdGhcbiAgLy8gQ29tYm9Cb3hJdGVtLmExMXlOYW1lLlxuICBjb21ib0JveFZvaWNpbmdOYW1lUmVzcG9uc2VQYXR0ZXJuPzogVFJlYWRPbmx5UHJvcGVydHk8c3RyaW5nPiB8IHN0cmluZztcblxuICBsb2NhbFByZWZlcnJlZFdpZHRoUHJvcGVydHk/OiBUUmVhZE9ubHlQcm9wZXJ0eTxudW1iZXIgfCBudWxsPjtcbiAgbG9jYWxNaW5pbXVtV2lkdGhQcm9wZXJ0eT86IFRQcm9wZXJ0eTxudW1iZXIgfCBudWxsPjsgLy8gV2lsbCBvbmx5IGJlIHNldFxufTtcblxuZXhwb3J0IHR5cGUgQ29tYm9Cb3hCdXR0b25PcHRpb25zID0gU2VsZk9wdGlvbnMgJiBTdHJpY3RPbWl0PFJlY3Rhbmd1bGFyUHVzaEJ1dHRvbk9wdGlvbnMsICdjaGlsZHJlbicgfCAnYXJpYUxhYmVsbGVkYnlBc3NvY2lhdGlvbnMnPjtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQ29tYm9Cb3hCdXR0b248VD4gZXh0ZW5kcyBSZWN0YW5ndWxhclB1c2hCdXR0b24ge1xuXG4gIC8vIHNldCB0byB0cnVlIHRvIGJsb2NrIHZvaWNpbmcgdG8gb2NjdXIgdXBvbiB0aGlzIGJ1dHRvbidzIG5leHQgZm9jdXMgZXZlbnQuXG4gIHByaXZhdGUgX2Jsb2NrTmV4dFZvaWNpbmdGb2N1c0xpc3RlbmVyOiBib29sZWFuO1xuXG4gIHByaXZhdGUgcmVhZG9ubHkgZGlzcG9zZUNvbWJvQm94QnV0dG9uOiAoKSA9PiB2b2lkO1xuXG4gIC8vIG5lZWRlZCBieSBtZXRob2RzXG4gIHByaXZhdGUgYXJyb3c6IFBhdGg7XG4gIHByaXZhdGUgc2VwYXJhdG9yTGluZTogTGluZTtcblxuICBwdWJsaWMgY29uc3RydWN0b3IoXG4gICAgcHJvcGVydHk6IFRQcm9wZXJ0eTxUPixcbiAgICBpdGVtczogQ29tYm9Cb3hJdGVtTm9Ob2RlPFQ+W10sXG4gICAgbm9kZXM6IE5vZGVbXSxcbiAgICBwcm92aWRlZE9wdGlvbnM/OiBDb21ib0JveEJ1dHRvbk9wdGlvbnNcbiAgKSB7XG5cbiAgICBjb25zdCBvcHRpb25zID0gb3B0aW9uaXplPENvbWJvQm94QnV0dG9uT3B0aW9ucywgU2VsZk9wdGlvbnMsIFJlY3Rhbmd1bGFyUHVzaEJ1dHRvbk9wdGlvbnM+KCkoIHtcblxuICAgICAgYWxpZ246ICdsZWZ0JyxcbiAgICAgIGFycm93RGlyZWN0aW9uOiAnZG93bicsXG4gICAgICBhcnJvd0ZpbGw6ICdibGFjaycsXG5cbiAgICAgIGNvbWJvQm94Vm9pY2luZ05hbWVSZXNwb25zZVBhdHRlcm46IFN1bkNvbnN0YW50cy5WQUxVRV9OQU1FRF9QTEFDRUhPTERFUixcblxuICAgICAgLy8gUmVjdGFuZ3VsYXJQdXNoQnV0dG9uIG9wdGlvbnNcbiAgICAgIGN1cnNvcjogJ3BvaW50ZXInLFxuICAgICAgYmFzZUNvbG9yOiAnd2hpdGUnLFxuICAgICAgYnV0dG9uQXBwZWFyYW5jZVN0cmF0ZWd5OiBCdXR0b25Ob2RlLkZsYXRBcHBlYXJhbmNlU3RyYXRlZ3ksXG4gICAgICB4TWFyZ2luOiAxMixcbiAgICAgIHlNYXJnaW46IDgsXG4gICAgICBzdHJva2U6ICdibGFjaycsXG4gICAgICBsaW5lV2lkdGg6IDEsXG4gICAgICBzb3VuZFBsYXllcjogbnVsbFNvdW5kUGxheWVyLCAvLyBkaXNhYmxlIGRlZmF1bHQgc291bmQgZ2VuZXJhdGlvblxuXG4gICAgICAvLyBQdXNoQnV0dG9uTW9kZWwgb3B0aW9uc1xuICAgICAgZW5hYmxlZFByb3BlcnR5T3B0aW9uczoge1xuICAgICAgICBwaGV0aW9GZWF0dXJlZDogZmFsc2VcbiAgICAgIH0sXG4gICAgICB2aXNpYmxlUHJvcGVydHlPcHRpb25zOiB7IHBoZXRpb0ZlYXR1cmVkOiBmYWxzZSB9LFxuXG4gICAgICBsb2NhbFByZWZlcnJlZFdpZHRoUHJvcGVydHk6IG5ldyBUaW55UHJvcGVydHkoIG51bGwgKSxcbiAgICAgIGxvY2FsTWluaW11bVdpZHRoUHJvcGVydHk6IG5ldyBUaW55UHJvcGVydHkoIG51bGwgKSxcblxuICAgICAgLy8gcGRvbVxuICAgICAgY29udGFpbmVyVGFnTmFtZTogJ2RpdicsXG4gICAgICBsYWJlbFRhZ05hbWU6ICdwJywgLy8gTk9URTogQSBgc3BhbmAgY2F1c2VzIGR1cGxpY2F0ZSBuYW1lLXNwZWFraW5nIHdpdGggVk8rc2FmYXJpIGluIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9yYXRpby1hbmQtcHJvcG9ydGlvbi9pc3N1ZXMvNTMyXG4gICAgICBhY2Nlc3NpYmxlTmFtZUJlaGF2aW9yOiBBQ0NFU1NJQkxFX05BTUVfQkVIQVZJT1JcbiAgICB9LCBwcm92aWRlZE9wdGlvbnMgKTtcblxuICAgIGFzc2VydCAmJiBhc3NlcnQoIF8uaW5jbHVkZXMoIEFMSUdOX1ZBTFVFUywgb3B0aW9ucy5hbGlnbiApLFxuICAgICAgYGludmFsaWQgYWxpZ246ICR7b3B0aW9ucy5hbGlnbn1gICk7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggXy5pbmNsdWRlcyggQVJST1dfRElSRUNUSU9OX1ZBTFVFUywgb3B0aW9ucy5hcnJvd0RpcmVjdGlvbiApLFxuICAgICAgYGludmFsaWQgYXJyb3dEaXJlY3Rpb246ICR7b3B0aW9ucy5hcnJvd0RpcmVjdGlvbn1gICk7XG5cbiAgICAvLyBUbyBpbXByb3ZlIHJlYWRhYmlsaXR5XG4gICAgY29uc3QgaXRlbVhNYXJnaW4gPSBvcHRpb25zLnhNYXJnaW47XG4gICAgY29uc3QgaXRlbVlNYXJnaW4gPSBvcHRpb25zLnlNYXJnaW47XG5cbiAgICAvLyBDb21wdXRlIG1heCBpdGVtIHNpemVcbiAgICBjb25zdCBtYXhJdGVtV2lkdGhQcm9wZXJ0eSA9IENvbWJvQm94LmdldE1heEl0ZW1XaWR0aFByb3BlcnR5KCBub2RlcyApO1xuICAgIGNvbnN0IG1heEl0ZW1IZWlnaHRQcm9wZXJ0eSA9IENvbWJvQm94LmdldE1heEl0ZW1IZWlnaHRQcm9wZXJ0eSggbm9kZXMgKTtcblxuICAgIGNvbnN0IGFycm93ID0gbmV3IFBhdGgoIG51bGwsIHtcbiAgICAgIGZpbGw6IG9wdGlvbnMuYXJyb3dGaWxsXG4gICAgfSApO1xuXG4gICAgLy8gV3JhcHBlciBmb3IgdGhlIHNlbGVjdGVkIGl0ZW0ncyBOb2RlLlxuICAgIC8vIERvIG5vdCB0cmFuc2Zvcm0gQ29tYm9Cb3hJdGVtLm5vZGUgYmVjYXVzZSBpdCBpcyBzaGFyZWQgd2l0aCBDb21ib0JveExpc3RJdGVtTm9kZS5cblxuXG4gICAgY29uc3QgbWF0Y2hpbmdJdGVtID0gXy5maW5kKCBpdGVtcywgaXRlbSA9PiBpdGVtLnZhbHVlID09PSBwcm9wZXJ0eS52YWx1ZSApITtcbiAgICBjb25zdCBpbmRleCA9IGl0ZW1zLmluZGV4T2YoIG1hdGNoaW5nSXRlbSApO1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIGluZGV4ID49IDAsICdDdXJyZW50IHZhbHVlIG9mIHByb3BlcnR5IGlzIG5vdCBpbiBsaXN0IG9mIGl0ZW1zJywgcHJvcGVydHkudmFsdWUgKTtcbiAgICBjb25zdCBpdGVtTm9kZVdyYXBwZXIgPSBuZXcgTm9kZSgge1xuICAgICAgbGF5b3V0T3B0aW9uczoge1xuICAgICAgICB5TWFyZ2luOiBpdGVtWU1hcmdpbixcbiAgICAgICAgZ3JvdzogMSxcbiAgICAgICAgeEFsaWduOiBvcHRpb25zLmFsaWduXG4gICAgICB9LFxuICAgICAgY2hpbGRyZW46IFtcbiAgICAgICAgbm9kZXNbIGluZGV4IF1cbiAgICAgIF1cbiAgICB9ICk7XG5cbiAgICAvLyBMaW5lIHNlcGFyYXRvciBiZXR3ZWVuIHRoZSBpdGVtIGFuZCBhcnJvdyB0aGF0IGlzIHRoZSBmdWxsIGhlaWdodCBvZiB0aGUgYnV0dG9uLlxuICAgIC8vIFdlIGNhbm5vdCB1c2UgVlNlcGFyYXRvciBoZXJlLCBiZWNhdXNlIGl0IGlzIGluY29tcGF0aWJsZSB3aXRoIEdyaWRDb25zdHJhaW50cy5cbiAgICAvLyB5MiBpcyBzZXQgZHVyaW5nIGEgbXVsdGlsaW5rIGFjY29yZGluZyB0byB0aGUgaXRlbSBoZWlnaHQgcHJvcGVydHkuXG4gICAgY29uc3Qgc2VwYXJhdG9yTGluZSA9IG5ldyBMaW5lKCAwLCAwLCAwLCAwLCB7XG4gICAgICBzdHJva2U6ICdibGFjaycsXG4gICAgICBsaW5lV2lkdGg6IG9wdGlvbnMubGluZVdpZHRoXG4gICAgfSApO1xuXG4gICAgb3B0aW9ucy5jb250ZW50ID0gbmV3IEdyaWRCb3goIHtcbiAgICAgIHJvd3M6IFsgW1xuICAgICAgICBpdGVtTm9kZVdyYXBwZXIsXG4gICAgICAgIHNlcGFyYXRvckxpbmUsXG4gICAgICAgIGFycm93XG4gICAgICBdIF1cbiAgICB9ICk7XG5cbiAgICAvLyBVcGRhdGUgdGhlIGRyb3AtZG93biBhcnJvdy4gIE5vIGRpc3Bvc2UgaXMgbmVlZGVkIHNpbmNlIHRoZSBkZXBlbmRlbmNpZXMgYXJlIGxvY2FsbHkgb3duZWQuXG4gICAgTXVsdGlsaW5rLm11bHRpbGluayggWyBtYXhJdGVtV2lkdGhQcm9wZXJ0eSwgbWF4SXRlbUhlaWdodFByb3BlcnR5IF0sICggbWF4SXRlbVdpZHRoLCBtYXhJdGVtSGVpZ2h0ICkgPT4ge1xuXG4gICAgICBjb25zdCBmdWxsSGVpZ2h0ID0gbWF4SXRlbUhlaWdodCArIDIgKiBpdGVtWU1hcmdpbjtcblxuICAgICAgLy8gV2Ugd2FudCB0aGUgYXJyb3cgYXJlYSB0byBiZSBzcXVhcmUsIHNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvc3VuL2lzc3Vlcy80NTNcbiAgICAgIGNvbnN0IGFycm93QXJlYVNpemUgPSBmdWxsSGVpZ2h0O1xuXG4gICAgICAvLyBUaGUgYXJyb3cgaXMgc2l6ZWQgdG8gZml0IGluIHRoZSBhcnJvdyBhcmVhLCBlbXBpcmljYWxseSBkZXRlcm1pbmVkIHRvIGJlIHZpc3VhbGx5IHBsZWFzaW5nLlxuICAgICAgY29uc3QgYXJyb3dIZWlnaHQgPSAwLjM1ICogYXJyb3dBcmVhU2l6ZTsgLy8gaGVpZ2h0IG9mIGVxdWlsYXRlcmFsIHRyaWFuZ2xlXG4gICAgICBjb25zdCBhcnJvd1dpZHRoID0gMiAqIGFycm93SGVpZ2h0ICogTWF0aC5zcXJ0KCAzICkgLyAzOyAvLyBzaWRlIG9mIGVxdWlsYXRlcmFsIHRyaWFuZ2xlXG5cbiAgICAgIGNvbnN0IGxlZnRNYXJnaW4gPSBpdGVtWE1hcmdpbjtcbiAgICAgIGNvbnN0IG1pZGRsZU1hcmdpbiA9IGl0ZW1YTWFyZ2luIC0gb3B0aW9ucy5saW5lV2lkdGggLyAyOyAvLyBDb21wZW5zYXRpb24gZm9yIHRoZSBzZXBhcmF0b3IgaGF2aW5nIHdpZHRoXG4gICAgICBjb25zdCByaWdodE1hcmdpbiA9IC1vcHRpb25zLmxpbmVXaWR0aCAvIDI7IC8vIENvbXBlbnNhdGlvbiBmb3IgdGhlIHNlcGFyYXRvciBoYXZpbmcgd2lkdGhcblxuICAgICAgLy8gYXJyb3cgdGhhdCBwb2ludHMgdXAgb3IgZG93biwgdG8gaW5kaWNhdGUgd2hpY2ggd2F5IHRoZSBsaXN0IHBvcHMgdXBcbiAgICAgIGNvbnN0IGNyZWF0ZUFycm93U2hhcGUgPSAoIGRpcmVjdGlvbjogJ3VwJyB8ICdkb3duJywgd2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXIgKSA9PiB7XG4gICAgICAgIGlmICggZGlyZWN0aW9uID09PSAndXAnICkge1xuICAgICAgICAgIHJldHVybiBuZXcgU2hhcGUoKVxuICAgICAgICAgICAgLm1vdmVUbyggMCwgaGVpZ2h0IClcbiAgICAgICAgICAgIC5saW5lVG8oIHdpZHRoIC8gMiwgMCApXG4gICAgICAgICAgICAubGluZVRvKCB3aWR0aCwgaGVpZ2h0IClcbiAgICAgICAgICAgIC5jbG9zZSgpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgIHJldHVybiBuZXcgU2hhcGUoKVxuICAgICAgICAgICAgLm1vdmVUbyggMCwgMCApXG4gICAgICAgICAgICAubGluZVRvKCB3aWR0aCwgMCApXG4gICAgICAgICAgICAubGluZVRvKCB3aWR0aCAvIDIsIGhlaWdodCApXG4gICAgICAgICAgICAuY2xvc2UoKTtcbiAgICAgICAgfVxuICAgICAgfTtcblxuICAgICAgYXJyb3cuc2hhcGUgPSBjcmVhdGVBcnJvd1NoYXBlKCBvcHRpb25zLmFycm93RGlyZWN0aW9uLCBhcnJvd1dpZHRoLCBhcnJvd0hlaWdodCApO1xuICAgICAgYXJyb3cubXV0YXRlTGF5b3V0T3B0aW9ucygge1xuICAgICAgICBtaW5Db250ZW50V2lkdGg6IGFycm93QXJlYVNpemUsXG4gICAgICAgIG1pbkNvbnRlbnRIZWlnaHQ6IGFycm93QXJlYVNpemVcbiAgICAgIH0gKTtcblxuICAgICAgaXRlbU5vZGVXcmFwcGVyLm11dGF0ZUxheW91dE9wdGlvbnMoIHtcbiAgICAgICAgbWluQ29udGVudFdpZHRoOiBtYXhJdGVtV2lkdGgsXG4gICAgICAgIG1pbkNvbnRlbnRIZWlnaHQ6IG1heEl0ZW1IZWlnaHQsXG4gICAgICAgIGxlZnRNYXJnaW46IGxlZnRNYXJnaW4sXG4gICAgICAgIHJpZ2h0TWFyZ2luOiBtaWRkbGVNYXJnaW5cbiAgICAgIH0gKTtcblxuICAgICAgc2VwYXJhdG9yTGluZS55MiA9IGZ1bGxIZWlnaHQ7XG4gICAgICBzZXBhcmF0b3JMaW5lLm11dGF0ZUxheW91dE9wdGlvbnMoIHtcbiAgICAgICAgcmlnaHRNYXJnaW46IHJpZ2h0TWFyZ2luXG4gICAgICB9ICk7XG4gICAgfSApO1xuXG4gICAgLy8gTWFyZ2lucyBhcmUgZGlmZmVyZW50IGluIHRoZSBpdGVtIGFuZCBidXR0b24gYXJlYXMuIEFuZCB3ZSB3YW50IHRoZSB2ZXJ0aWNhbCBzZXBhcmF0b3IgdG8gZXh0ZW5kXG4gICAgLy8gYmV5b25kIHRoZSBtYXJnaW4uICBXZSd2ZSBoYW5kbGVkIHRob3NlIG1hcmdpbnMgYWJvdmUsIHNvIHRoZSBhY3R1YWwgbWFyZ2lucyBwcm9wYWdhdGVkIHRvIHRoZSBidXR0b25cbiAgICAvLyBuZWVkIHRvIGJlIHplcm8uXG4gICAgb3B0aW9ucy54TWFyZ2luID0gMDtcbiAgICBvcHRpb25zLnlNYXJnaW4gPSAwO1xuXG4gICAgc3VwZXIoIG9wdGlvbnMgKTtcblxuICAgIC8vIFByb3ZpZGUgb3VyIG1pbmltdW0gd2lkdGggYmFjayB1cCB0byB0aGUgQ29tYm9Cb3ggKG9yIGNyZWF0b3IpXG4gICAgdGhpcy5taW5pbXVtV2lkdGhQcm9wZXJ0eS5saW5rKCBtaW5pbXVtV2lkdGggPT4ge1xuICAgICAgb3B0aW9ucy5sb2NhbE1pbmltdW1XaWR0aFByb3BlcnR5LnZhbHVlID0gbWluaW11bVdpZHRoO1xuICAgIH0gKTtcblxuICAgIC8vIEhvb2sgb3VyIENvbWJvQm94J3MgcHJlZmVycmVkV2lkdGggdXAgdG8gb3Vyc1xuICAgIGNvbnN0IHByZWZlcnJlZFdpZHRoTGlzdGVuZXIgPSAoIHByZWZlcnJlZFdpZHRoOiBudW1iZXIgfCBudWxsICkgPT4ge1xuICAgICAgdGhpcy5wcmVmZXJyZWRXaWR0aCA9IHByZWZlcnJlZFdpZHRoO1xuICAgIH07XG4gICAgb3B0aW9ucy5sb2NhbFByZWZlcnJlZFdpZHRoUHJvcGVydHkubGluayggcHJlZmVycmVkV2lkdGhMaXN0ZW5lciApO1xuXG4gICAgdGhpcy5fYmxvY2tOZXh0Vm9pY2luZ0ZvY3VzTGlzdGVuZXIgPSBmYWxzZTtcblxuICAgIHRoaXMudm9pY2luZ0ZvY3VzTGlzdGVuZXIgPSAoKSA9PiB7XG5cbiAgICAgIC8vIGZpcmUgdGhlIGxpc3RlbmVyIG9ubHkgaWYgd2UgYXJlIG5vdCBibG9ja2luZyB0aGUgZm9jdXMgbGlzdGVuZXJcbiAgICAgICF0aGlzLl9ibG9ja05leHRWb2ljaW5nRm9jdXNMaXN0ZW5lciAmJiB0aGlzLmRlZmF1bHRGb2N1c0xpc3RlbmVyKCk7XG4gICAgICB0aGlzLl9ibG9ja05leHRWb2ljaW5nRm9jdXNMaXN0ZW5lciA9IGZhbHNlO1xuICAgIH07XG5cbiAgICAvLyBLZWVwIHRyYWNrIGZvciBkaXNwb3NhbFxuICAgIGxldCB2b2ljaW5nUGF0dGVybnN0cmluZ1Byb3BlcnR5OiBUUmVhZE9ubHlQcm9wZXJ0eTxzdHJpbmc+IHwgbnVsbCA9IG51bGw7XG5cbiAgICBjb25zdCBpdGVtUHJvcGVydHkgPSBuZXcgRGVyaXZlZFByb3BlcnR5KCBbIHByb3BlcnR5IF0sIHZhbHVlID0+IHtcbiAgICAgIGNvbnN0IGl0ZW0gPSBfLmZpbmQoIGl0ZW1zLCBpdGVtID0+IGl0ZW0udmFsdWUgPT09IHZhbHVlICkhO1xuICAgICAgYXNzZXJ0ICYmIGFzc2VydCggaXRlbSwgYG5vIGl0ZW0gZm91bmQgZm9yIHZhbHVlOiAke3ZhbHVlfWAgKTtcbiAgICAgIHJldHVybiBpdGVtO1xuICAgIH0gKTtcblxuICAgIGNvbnN0IG5vZGVQcm9wZXJ0eSA9IG5ldyBEZXJpdmVkUHJvcGVydHkoIFsgaXRlbVByb3BlcnR5IF0sIGl0ZW0gPT4ge1xuICAgICAgcmV0dXJuIG5vZGVzWyBpdGVtcy5pbmRleE9mKCBpdGVtICkgXTtcbiAgICB9ICk7XG5cbiAgICAvLyBTaG93IHRoZSBjb3JyZXNwb25kaW5nIGl0ZW0ncyBOb2RlIG9uIHRoZSBidXR0b24uXG4gICAgbm9kZVByb3BlcnR5LmxpbmsoIG5vZGUgPT4ge1xuICAgICAgLy8gcmVtb3ZlIHRoZSBub2RlIGZvciB0aGUgcHJldmlvdXMgaXRlbVxuICAgICAgaXRlbU5vZGVXcmFwcGVyLnJlbW92ZUFsbENoaWxkcmVuKCk7XG5cbiAgICAgIC8vIGFkZCB0aGUgYXNzb2NpYXRlZCBub2RlXG4gICAgICBpdGVtTm9kZVdyYXBwZXIuYWRkQ2hpbGQoIG5vZGUgKTtcbiAgICB9ICk7XG5cbiAgICAvLyBVcGRhdGUgdGhlIGJ1dHRvbidzIGFjY2Vzc2libGUgbmFtZSB3aGVuIHRoZSBpdGVtIGNoYW5nZXMuXG4gICAgaXRlbVByb3BlcnR5LmxpbmsoIGl0ZW0gPT4ge1xuXG4gICAgICAvLyBwZG9tXG4gICAgICB0aGlzLmlubmVyQ29udGVudCA9IGl0ZW0uYWNjZXNzaWJsZU5hbWUgfHwgbnVsbDtcblxuICAgICAgY29uc3QgcGF0dGVyblByb3BlcnR5ID0gdHlwZW9mIG9wdGlvbnMuY29tYm9Cb3hWb2ljaW5nTmFtZVJlc3BvbnNlUGF0dGVybiA9PT0gJ3N0cmluZycgP1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3IFByb3BlcnR5KCBvcHRpb25zLmNvbWJvQm94Vm9pY2luZ05hbWVSZXNwb25zZVBhdHRlcm4gKSA6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvcHRpb25zLmNvbWJvQm94Vm9pY2luZ05hbWVSZXNwb25zZVBhdHRlcm47XG5cbiAgICAgIHZvaWNpbmdQYXR0ZXJuc3RyaW5nUHJvcGVydHkgJiYgdm9pY2luZ1BhdHRlcm5zdHJpbmdQcm9wZXJ0eS5kaXNwb3NlKCk7XG4gICAgICAvLyBUT0RPOiBETyBOT1QgaGF2ZSB0aGlzIGdldHRpbmcgcmVjcmVhdGVkLCB3ZSBjYW4gc2ltcGx5IGNyZWF0ZSBvbmUgdXAgZnJvbnQsIHNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvc3VuL2lzc3Vlcy84NjVcbiAgICAgIHRoaXMudm9pY2luZ05hbWVSZXNwb25zZSA9IHZvaWNpbmdQYXR0ZXJuc3RyaW5nUHJvcGVydHkgPSBuZXcgUGF0dGVyblN0cmluZ1Byb3BlcnR5KCBwYXR0ZXJuUHJvcGVydHksIHtcbiAgICAgICAgdmFsdWU6IGl0ZW0uYWNjZXNzaWJsZU5hbWUgfHwgJydcbiAgICAgIH0sIHsgdGFuZGVtOiBUYW5kZW0uT1BUX09VVCB9ICk7XG4gICAgfSApO1xuXG4gICAgLy8gQWRkIGFyaWEtbGFiZWxsZWRieSBhdHRyaWJ1dGUgdG8gdGhlIGJ1dHRvbi5cbiAgICAvLyBUaGUgYnV0dG9uIGlzIGFyaWEtbGFiZWxsZWRieSBpdHMgb3duIGxhYmVsIHNpYmxpbmcsIGFuZCB0aGVuIChzZWNvbmQpIGl0cyBwcmltYXJ5IHNpYmxpbmcgaW4gdGhlIFBET00uXG4gICAgLy8gT3JkZXIgbWF0dGVycyFcbiAgICB0aGlzLmFyaWFMYWJlbGxlZGJ5QXNzb2NpYXRpb25zID0gW1xuICAgICAge1xuICAgICAgICBvdGhlck5vZGU6IHRoaXMsXG4gICAgICAgIG90aGVyRWxlbWVudE5hbWU6IFBET01QZWVyLkxBQkVMX1NJQkxJTkcsXG4gICAgICAgIHRoaXNFbGVtZW50TmFtZTogUERPTVBlZXIuUFJJTUFSWV9TSUJMSU5HXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICBvdGhlck5vZGU6IHRoaXMsXG4gICAgICAgIG90aGVyRWxlbWVudE5hbWU6IFBET01QZWVyLlBSSU1BUllfU0lCTElORyxcbiAgICAgICAgdGhpc0VsZW1lbnROYW1lOiBQRE9NUGVlci5QUklNQVJZX1NJQkxJTkdcbiAgICAgIH1cbiAgICBdO1xuXG4gICAgLy8gc2lnbmlmeSB0byBBVCB0aGF0IHRoaXMgYnV0dG9uIG9wZW5zIGEgbWVudVxuICAgIEFyaWFIYXNQb3BVcE11dGF0b3IubXV0YXRlTm9kZSggdGhpcywgJ2xpc3Rib3gnICk7XG5cbiAgICB0aGlzLmRpc3Bvc2VDb21ib0JveEJ1dHRvbiA9ICgpID0+IHtcbiAgICAgIG1heEl0ZW1XaWR0aFByb3BlcnR5LmRpc3Bvc2UoKTtcbiAgICAgIG1heEl0ZW1IZWlnaHRQcm9wZXJ0eS5kaXNwb3NlKCk7XG5cbiAgICAgIGl0ZW1Qcm9wZXJ0eS5kaXNwb3NlKCk7XG4gICAgICBvcHRpb25zLmxvY2FsUHJlZmVycmVkV2lkdGhQcm9wZXJ0eS51bmxpbmsoIHByZWZlcnJlZFdpZHRoTGlzdGVuZXIgKTtcblxuICAgICAgdm9pY2luZ1BhdHRlcm5zdHJpbmdQcm9wZXJ0eSAmJiB2b2ljaW5nUGF0dGVybnN0cmluZ1Byb3BlcnR5LmRpc3Bvc2UoKTtcbiAgICB9O1xuXG4gICAgdGhpcy5hcnJvdyA9IGFycm93O1xuICAgIHRoaXMuc2VwYXJhdG9yTGluZSA9IHNlcGFyYXRvckxpbmU7XG4gIH1cblxuICAvKipcbiAgICogU2V0cyB0aGUgYnV0dG9uIHRvIGxvb2sgbGlrZSBhIHZhbHVlIGRpc3BsYXkgaW5zdGVhZCBvZiBhIGNvbWJvIGJveCBidXR0b24uXG4gICAqIFNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvc3VuL2lzc3Vlcy80NTFcbiAgICovXG4gIHB1YmxpYyBzZXREaXNwbGF5T25seSggZGlzcGxheU9ubHk6IGJvb2xlYW4gKTogdm9pZCB7XG4gICAgdGhpcy5hcnJvdy52aXNpYmxlID0gIWRpc3BsYXlPbmx5O1xuICAgIHRoaXMuc2VwYXJhdG9yTGluZS52aXNpYmxlID0gIWRpc3BsYXlPbmx5O1xuICB9XG5cbiAgLyoqXG4gICAqIENhbGwgdG8gYmxvY2sgdm9pY2luZyBmcm9tIG9jY3VycmluZyB1cG9uIHRoaXMgYnV0dG9uJ3MgbmV4dCBmb2N1cyBldmVudC5cbiAgICogRm9yIHVzZSBieSBDb21ib0JveC5cbiAgICovXG4gIHB1YmxpYyBibG9ja05leHRWb2ljaW5nRm9jdXNMaXN0ZW5lcigpOiB2b2lkIHtcbiAgICB0aGlzLl9ibG9ja05leHRWb2ljaW5nRm9jdXNMaXN0ZW5lciA9IHRydWU7XG4gIH1cblxuICBwdWJsaWMgb3ZlcnJpZGUgZGlzcG9zZSgpOiB2b2lkIHtcbiAgICB0aGlzLmRpc3Bvc2VDb21ib0JveEJ1dHRvbigpO1xuICAgIHN1cGVyLmRpc3Bvc2UoKTtcbiAgfVxufVxuXG5zdW4ucmVnaXN0ZXIoICdDb21ib0JveEJ1dHRvbicsIENvbWJvQm94QnV0dG9uICk7Il0sIm5hbWVzIjpbIkRlcml2ZWRQcm9wZXJ0eSIsIk11bHRpbGluayIsIlBhdHRlcm5TdHJpbmdQcm9wZXJ0eSIsIlByb3BlcnR5IiwiVGlueVByb3BlcnR5IiwiU2hhcGUiLCJvcHRpb25pemUiLCJBcmlhSGFzUG9wVXBNdXRhdG9yIiwiR3JpZEJveCIsIkxpbmUiLCJOb2RlIiwiUGF0aCIsIlBET01QZWVyIiwibnVsbFNvdW5kUGxheWVyIiwiVGFuZGVtIiwiQnV0dG9uTm9kZSIsIlJlY3Rhbmd1bGFyUHVzaEJ1dHRvbiIsIkNvbWJvQm94Iiwic3VuIiwiU3VuQ29uc3RhbnRzIiwiQUxJR05fVkFMVUVTIiwiQVJST1dfRElSRUNUSU9OX1ZBTFVFUyIsIkFDQ0VTU0lCTEVfTkFNRV9CRUhBVklPUiIsIm5vZGUiLCJvcHRpb25zIiwiYWNjZXNzaWJsZU5hbWUiLCJsYWJlbENvbnRlbnQiLCJDb21ib0JveEJ1dHRvbiIsInNldERpc3BsYXlPbmx5IiwiZGlzcGxheU9ubHkiLCJhcnJvdyIsInZpc2libGUiLCJzZXBhcmF0b3JMaW5lIiwiYmxvY2tOZXh0Vm9pY2luZ0ZvY3VzTGlzdGVuZXIiLCJfYmxvY2tOZXh0Vm9pY2luZ0ZvY3VzTGlzdGVuZXIiLCJkaXNwb3NlIiwiZGlzcG9zZUNvbWJvQm94QnV0dG9uIiwicHJvcGVydHkiLCJpdGVtcyIsIm5vZGVzIiwicHJvdmlkZWRPcHRpb25zIiwiYWxpZ24iLCJhcnJvd0RpcmVjdGlvbiIsImFycm93RmlsbCIsImNvbWJvQm94Vm9pY2luZ05hbWVSZXNwb25zZVBhdHRlcm4iLCJWQUxVRV9OQU1FRF9QTEFDRUhPTERFUiIsImN1cnNvciIsImJhc2VDb2xvciIsImJ1dHRvbkFwcGVhcmFuY2VTdHJhdGVneSIsIkZsYXRBcHBlYXJhbmNlU3RyYXRlZ3kiLCJ4TWFyZ2luIiwieU1hcmdpbiIsInN0cm9rZSIsImxpbmVXaWR0aCIsInNvdW5kUGxheWVyIiwiZW5hYmxlZFByb3BlcnR5T3B0aW9ucyIsInBoZXRpb0ZlYXR1cmVkIiwidmlzaWJsZVByb3BlcnR5T3B0aW9ucyIsImxvY2FsUHJlZmVycmVkV2lkdGhQcm9wZXJ0eSIsImxvY2FsTWluaW11bVdpZHRoUHJvcGVydHkiLCJjb250YWluZXJUYWdOYW1lIiwibGFiZWxUYWdOYW1lIiwiYWNjZXNzaWJsZU5hbWVCZWhhdmlvciIsImFzc2VydCIsIl8iLCJpbmNsdWRlcyIsIml0ZW1YTWFyZ2luIiwiaXRlbVlNYXJnaW4iLCJtYXhJdGVtV2lkdGhQcm9wZXJ0eSIsImdldE1heEl0ZW1XaWR0aFByb3BlcnR5IiwibWF4SXRlbUhlaWdodFByb3BlcnR5IiwiZ2V0TWF4SXRlbUhlaWdodFByb3BlcnR5IiwiZmlsbCIsIm1hdGNoaW5nSXRlbSIsImZpbmQiLCJpdGVtIiwidmFsdWUiLCJpbmRleCIsImluZGV4T2YiLCJpdGVtTm9kZVdyYXBwZXIiLCJsYXlvdXRPcHRpb25zIiwiZ3JvdyIsInhBbGlnbiIsImNoaWxkcmVuIiwiY29udGVudCIsInJvd3MiLCJtdWx0aWxpbmsiLCJtYXhJdGVtV2lkdGgiLCJtYXhJdGVtSGVpZ2h0IiwiZnVsbEhlaWdodCIsImFycm93QXJlYVNpemUiLCJhcnJvd0hlaWdodCIsImFycm93V2lkdGgiLCJNYXRoIiwic3FydCIsImxlZnRNYXJnaW4iLCJtaWRkbGVNYXJnaW4iLCJyaWdodE1hcmdpbiIsImNyZWF0ZUFycm93U2hhcGUiLCJkaXJlY3Rpb24iLCJ3aWR0aCIsImhlaWdodCIsIm1vdmVUbyIsImxpbmVUbyIsImNsb3NlIiwic2hhcGUiLCJtdXRhdGVMYXlvdXRPcHRpb25zIiwibWluQ29udGVudFdpZHRoIiwibWluQ29udGVudEhlaWdodCIsInkyIiwibWluaW11bVdpZHRoUHJvcGVydHkiLCJsaW5rIiwibWluaW11bVdpZHRoIiwicHJlZmVycmVkV2lkdGhMaXN0ZW5lciIsInByZWZlcnJlZFdpZHRoIiwidm9pY2luZ0ZvY3VzTGlzdGVuZXIiLCJkZWZhdWx0Rm9jdXNMaXN0ZW5lciIsInZvaWNpbmdQYXR0ZXJuc3RyaW5nUHJvcGVydHkiLCJpdGVtUHJvcGVydHkiLCJub2RlUHJvcGVydHkiLCJyZW1vdmVBbGxDaGlsZHJlbiIsImFkZENoaWxkIiwiaW5uZXJDb250ZW50IiwicGF0dGVyblByb3BlcnR5Iiwidm9pY2luZ05hbWVSZXNwb25zZSIsInRhbmRlbSIsIk9QVF9PVVQiLCJhcmlhTGFiZWxsZWRieUFzc29jaWF0aW9ucyIsIm90aGVyTm9kZSIsIm90aGVyRWxlbWVudE5hbWUiLCJMQUJFTF9TSUJMSU5HIiwidGhpc0VsZW1lbnROYW1lIiwiUFJJTUFSWV9TSUJMSU5HIiwibXV0YXRlTm9kZSIsInVubGluayIsInJlZ2lzdGVyIl0sIm1hcHBpbmdzIjoiQUFBQSxzREFBc0Q7QUFFdEQ7Ozs7O0NBS0MsR0FFRCxPQUFPQSxxQkFBcUIsbUNBQW1DO0FBQy9ELE9BQU9DLGVBQWUsNkJBQTZCO0FBQ25ELE9BQU9DLDJCQUEyQix5Q0FBeUM7QUFDM0UsT0FBT0MsY0FBYyw0QkFBNEI7QUFDakQsT0FBT0Msa0JBQWtCLGdDQUFnQztBQUd6RCxTQUFTQyxLQUFLLFFBQVEsMkJBQTJCO0FBQ2pELE9BQU9DLGVBQWUsa0NBQWtDO0FBRXhELFNBQVNDLG1CQUFtQixFQUFFQyxPQUFPLEVBQUVDLElBQUksRUFBRUMsSUFBSSxFQUFFQyxJQUFJLEVBQXdCQyxRQUFRLFFBQWdCLDhCQUE4QjtBQUNySSxPQUFPQyxxQkFBcUIsb0NBQW9DO0FBQ2hFLE9BQU9DLFlBQVksNEJBQTRCO0FBQy9DLE9BQU9DLGdCQUFnQiwwQkFBMEI7QUFDakQsT0FBT0MsMkJBQTZELHFDQUFxQztBQUN6RyxPQUFPQyxjQUFzQyxnQkFBZ0I7QUFDN0QsT0FBT0MsU0FBUyxXQUFXO0FBQzNCLE9BQU9DLGtCQUFrQixvQkFBb0I7QUFFN0MsWUFBWTtBQUNaLE1BQU1DLGVBQWU7SUFBRTtJQUFRO0lBQVU7Q0FBUztBQUNsRCxNQUFNQyx5QkFBeUI7SUFB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