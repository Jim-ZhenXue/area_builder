// Copyright 2019-2024, University of Colorado Boulder
/**
 * Reusable icons to be created for keyboard help shortcuts dialogs.
 * This type is only a collection of static methods, and should not be instantiated.
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */ import Dimension2 from '../../../../dot/js/Dimension2.js';
import optionize, { combineOptions } from '../../../../phet-core/js/optionize.js';
import { HBox, Node, Text } from '../../../../scenery/js/imports.js';
import PhetFont from '../../PhetFont.js';
import PlusNode from '../../PlusNode.js';
import sceneryPhet from '../../sceneryPhet.js';
import SceneryPhetStrings from '../../SceneryPhetStrings.js';
import ArrowKeyNode from '../ArrowKeyNode.js';
import LetterKeyNode from '../LetterKeyNode.js';
import TextKeyNode from '../TextKeyNode.js';
// constants
const DEFAULT_HORIZONTAL_KEY_SPACING = 1.3;
const OR_TEXT_MAX_WIDTH = 16;
const LABEL_FONT = new PhetFont(16);
let KeyboardHelpIconFactory = class KeyboardHelpIconFactory {
    /**
   * Horizontal layout of a set of icons, in left-to-right order.
   */ static iconRow(icons, providedOptions) {
        const options = optionize()({
            spacing: DEFAULT_HORIZONTAL_KEY_SPACING,
            children: icons
        }, providedOptions);
        return new HBox(options);
    }
    /**
   * Two icons with horizontal layout, separated by 'or' text.
   */ static iconOrIcon(leftIcon, rightIcon, providedOptions) {
        const options = combineOptions({
            spacing: KeyboardHelpIconFactory.DEFAULT_ICON_SPACING
        }, providedOptions);
        const orText = new Text(SceneryPhetStrings.keyboardHelpDialog.orStringProperty, {
            font: LABEL_FONT,
            maxWidth: OR_TEXT_MAX_WIDTH
        });
        return KeyboardHelpIconFactory.iconRow([
            new Node({
                children: [
                    leftIcon
                ]
            }),
            orText,
            new Node({
                children: [
                    rightIcon
                ]
            })
        ], options);
    }
    /**
   * Two icons with horizontal layout, and separated by '-' text. This is useful for a range, like 0-9.
   */ static iconToIcon(leftIcon, rightIcon, providedOptions) {
        const options = combineOptions({
            spacing: KeyboardHelpIconFactory.DEFAULT_ICON_SPACING / 2
        }, providedOptions);
        const hyphenText = new Text(SceneryPhetStrings.keyboardHelpDialog.hyphenStringProperty, {
            font: LABEL_FONT,
            maxWidth: OR_TEXT_MAX_WIDTH
        });
        return KeyboardHelpIconFactory.iconRow([
            new Node({
                children: [
                    leftIcon
                ]
            }),
            hyphenText,
            new Node({
                children: [
                    rightIcon
                ]
            })
        ], options);
    }
    /**
   * Two icons with horizontal layout, separated by '+' text.
   */ static iconPlusIcon(leftIcon, rightIcon, providedOptions) {
        return KeyboardHelpIconFactory.iconPlusIconRow([
            leftIcon,
            rightIcon
        ], providedOptions);
    }
    /**
   * Returns a row of icons separated by '+'. Useful when a keyboard shortcut has multiple modifier keys for one
   * key press listener.
   */ static iconPlusIconRow(iconList, providedOptions) {
        const options = combineOptions({
            plusIconSize: new Dimension2(8, 1.2),
            spacing: KeyboardHelpIconFactory.DEFAULT_ICON_SPACING
        }, providedOptions);
        // Weave plus icons into the provided array of icons. Like Array.join, but with a new array instead of a string.
        const iconListWithSeparators = [];
        for(let i = 0; i < iconList.length; i++){
            // Scenery layout controls transforms of children. Since we don't own the iconNode, we have to wrap it in another
            // so that layout will work in cases of DAG.
            iconListWithSeparators.push(new Node({
                children: [
                    iconList[i]
                ]
            }));
            // don't add the separator to the last item
            if (i < iconList.length - 1) {
                iconListWithSeparators.push(new PlusNode({
                    size: options.plusIconSize
                }));
            }
        }
        return KeyboardHelpIconFactory.iconRow(iconListWithSeparators, {
            spacing: options.spacing
        });
    }
    /**
   * An icon with horizontal layout in order: shift, plus, and provided icon.
   */ static shiftPlusIcon(icon, providedOptions) {
        const shiftKeyIcon = TextKeyNode.shift();
        return KeyboardHelpIconFactory.iconPlusIcon(shiftKeyIcon, icon, providedOptions);
    }
    /**
   * An icon with horizontal layout in order: alt, plus, and provided icon.
   */ static altPlusIcon(icon, providedOptions) {
        const altKeyIcon = TextKeyNode.altOrOption();
        return KeyboardHelpIconFactory.iconPlusIcon(altKeyIcon, icon, providedOptions);
    }
    /**
   * "Space or Enter" icon
   */ static spaceOrEnter() {
        const spaceKey = TextKeyNode.space();
        const enterKey = TextKeyNode.enter();
        return KeyboardHelpIconFactory.iconOrIcon(spaceKey, enterKey);
    }
    /**
   * An icon with up and down arrows, separated by 'or', in horizontal layout.
   */ static upOrDown() {
        const upArrowKeyNode = new ArrowKeyNode('up');
        const downArrowKeyNode = new ArrowKeyNode('down');
        return KeyboardHelpIconFactory.iconOrIcon(upArrowKeyNode, downArrowKeyNode);
    }
    /**
   * An icon with up and down arrow keys, in a horizontal layout.
   */ static wasdRowIcon(providedOptions) {
        const options = optionize()({
            spacing: DEFAULT_HORIZONTAL_KEY_SPACING
        }, providedOptions);
        const WKeyNode = LetterKeyNode.w();
        const AKeyNode = LetterKeyNode.a();
        const SKeyNode = LetterKeyNode.s();
        const DKeyNode = LetterKeyNode.d();
        // Strings are not translated because they map directly to specific key codes.
        const icons = [
            WKeyNode,
            AKeyNode,
            SKeyNode,
            DKeyNode
        ];
        return KeyboardHelpIconFactory.iconRow(icons, options);
    }
    /**
   * An icon with the 4 arrow keys, in a horizontal layout.
   */ static arrowKeysRowIcon(providedOptions) {
        const options = optionize()({
            spacing: DEFAULT_HORIZONTAL_KEY_SPACING
        }, providedOptions);
        // order of these icons matches movement with the WASD keys
        const upArrowKeyNode = new ArrowKeyNode('up');
        const leftArrowKeyNode = new ArrowKeyNode('left');
        const downArrowKeyNode = new ArrowKeyNode('down');
        const rightArrowKeyNode = new ArrowKeyNode('right');
        return KeyboardHelpIconFactory.iconRow([
            upArrowKeyNode,
            leftArrowKeyNode,
            downArrowKeyNode,
            rightArrowKeyNode
        ], options);
    }
    /**
   * An icon with the 4 arrow keys, WASD keys, separated by "or", in horizontal layout.
   */ static arrowOrWasdKeysRowIcon(providedOptions) {
        const options = optionize()({
            spacing: KeyboardHelpIconFactory.DEFAULT_ICON_SPACING
        }, providedOptions);
        const arrowKeys = KeyboardHelpIconFactory.arrowKeysRowIcon();
        const wasdKeys = KeyboardHelpIconFactory.wasdRowIcon();
        return KeyboardHelpIconFactory.iconOrIcon(arrowKeys, wasdKeys, options);
    }
    /**
   * An icon with page up/down keys, in horizontal layout.
   */ static pageUpPageDownRowIcon(providedOptions) {
        const options = optionize()({
            spacing: KeyboardHelpIconFactory.DEFAULT_ICON_SPACING
        }, providedOptions);
        const pageUpKeyNode = TextKeyNode.pageUp();
        const pageDownKeyNode = TextKeyNode.pageDown();
        const icons = [
            pageUpKeyNode,
            pageDownKeyNode
        ];
        return KeyboardHelpIconFactory.iconRow(icons, options);
    }
    /**
   * An icon with up and down arrow keys, in horizontal layout.
   */ static upDownArrowKeysRowIcon(providedOptions) {
        const upArrowKeyNode = new ArrowKeyNode('up');
        const downArrowKeyNode = new ArrowKeyNode('down');
        return KeyboardHelpIconFactory.iconRow([
            upArrowKeyNode,
            downArrowKeyNode
        ], providedOptions);
    }
    /**
   * An icon with left and right arrow keys, in horizontal layout.
   */ static leftRightArrowKeysRowIcon(providedOptions) {
        const leftArrowKeyNode = new ArrowKeyNode('left');
        const rightArrowKeyNode = new ArrowKeyNode('right');
        return KeyboardHelpIconFactory.iconRow([
            leftArrowKeyNode,
            rightArrowKeyNode
        ], providedOptions);
    }
    /**
   * Create an icon Node for a hotkey, based on the provided HotkeyData. Combines key icons with plus icons.
   * For example, a HotkeyData with 'shift+r' would produce a row with the shift icon, a plus icon, and the r icon.
   */ static fromHotkeyData(hotkeyData) {
        const modifierKeyNodes = hotkeyData.keyDescriptorsProperty.value[0].modifierKeys.map((modifierKey)=>{
            const keyNode = KeyboardHelpIconFactory.ENGLISH_KEY_TO_KEY_NODE.get(modifierKey);
            assert && assert(keyNode, 'modifier key not found in ENGLISH_KEY_TO_KEY_NODE');
            return keyNode;
        });
        const keyNode = KeyboardHelpIconFactory.ENGLISH_KEY_TO_KEY_NODE.get(hotkeyData.keyDescriptorsProperty.value[0].key);
        assert && assert(keyNode, 'key not found in ENGLISH_KEY_TO_KEY_NODE');
        return KeyboardHelpIconFactory.iconPlusIconRow([
            ...modifierKeyNodes,
            keyNode
        ]);
    }
    constructor(){
        assert && assert(false, 'do not construct this, instead use its helper static methods for icon creation');
    }
};
KeyboardHelpIconFactory.DEFAULT_ICON_SPACING = 6.5;
/**
   * Maps English key strings to their corresponding icon nodes.
   */ KeyboardHelpIconFactory.ENGLISH_KEY_TO_KEY_NODE = new Map([
    [
        'a',
        new LetterKeyNode('A')
    ],
    [
        'j',
        new LetterKeyNode('J')
    ],
    [
        'shift',
        TextKeyNode.shift()
    ],
    [
        'alt',
        TextKeyNode.altOrOption()
    ],
    [
        'escape',
        TextKeyNode.esc()
    ],
    [
        'arrowLeft',
        new ArrowKeyNode('left')
    ],
    [
        'arrowRight',
        new ArrowKeyNode('right')
    ],
    [
        'arrowUp',
        new ArrowKeyNode('up')
    ],
    [
        'arrowDown',
        new ArrowKeyNode('down')
    ],
    [
        'pageUp',
        TextKeyNode.pageUp()
    ],
    [
        'pageDown',
        TextKeyNode.pageDown()
    ],
    [
        'home',
        TextKeyNode.home()
    ],
    [
        'end',
        TextKeyNode.end()
    ],
    [
        'r',
        new LetterKeyNode('R')
    ],
    [
        's',
        new LetterKeyNode('S')
    ],
    [
        'l',
        new LetterKeyNode('L')
    ],
    [
        'c',
        new LetterKeyNode('C')
    ],
    [
        'h',
        new LetterKeyNode('H')
    ],
    [
        'w',
        new LetterKeyNode('W')
    ],
    [
        'j',
        new LetterKeyNode('J')
    ],
    [
        'k',
        new LetterKeyNode('K')
    ],
    [
        'n',
        new LetterKeyNode('N')
    ],
    [
        '0',
        new LetterKeyNode('0')
    ],
    [
        '1',
        new LetterKeyNode('1')
    ],
    [
        '2',
        new LetterKeyNode('2')
    ],
    [
        '3',
        new LetterKeyNode('3')
    ]
]);
export { KeyboardHelpIconFactory as default };
assert && assert(Object.keys(KeyboardHelpIconFactory.prototype).length === 0, 'KeyboardHelpIconFactory only has static functions');
sceneryPhet.register('KeyboardHelpIconFactory', KeyboardHelpIconFactory);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9rZXlib2FyZC9oZWxwL0tleWJvYXJkSGVscEljb25GYWN0b3J5LnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE5LTIwMjQsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIFJldXNhYmxlIGljb25zIHRvIGJlIGNyZWF0ZWQgZm9yIGtleWJvYXJkIGhlbHAgc2hvcnRjdXRzIGRpYWxvZ3MuXG4gKiBUaGlzIHR5cGUgaXMgb25seSBhIGNvbGxlY3Rpb24gb2Ygc3RhdGljIG1ldGhvZHMsIGFuZCBzaG91bGQgbm90IGJlIGluc3RhbnRpYXRlZC5cbiAqXG4gKiBAYXV0aG9yIE1pY2hhZWwgS2F1em1hbm4gKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXG4gKi9cblxuaW1wb3J0IERpbWVuc2lvbjIgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL0RpbWVuc2lvbjIuanMnO1xuaW1wb3J0IG9wdGlvbml6ZSwgeyBjb21iaW5lT3B0aW9ucywgRW1wdHlTZWxmT3B0aW9ucyB9IGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9vcHRpb25pemUuanMnO1xuaW1wb3J0IFN0cmljdE9taXQgZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL3R5cGVzL1N0cmljdE9taXQuanMnO1xuaW1wb3J0IHsgSEJveCwgSEJveE9wdGlvbnMsIEhvdGtleURhdGEsIE5vZGUsIE9uZUtleVN0cm9rZUVudHJ5LCBUZXh0IH0gZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcbmltcG9ydCBQaGV0Rm9udCBmcm9tICcuLi8uLi9QaGV0Rm9udC5qcyc7XG5pbXBvcnQgUGx1c05vZGUgZnJvbSAnLi4vLi4vUGx1c05vZGUuanMnO1xuaW1wb3J0IHNjZW5lcnlQaGV0IGZyb20gJy4uLy4uL3NjZW5lcnlQaGV0LmpzJztcbmltcG9ydCBTY2VuZXJ5UGhldFN0cmluZ3MgZnJvbSAnLi4vLi4vU2NlbmVyeVBoZXRTdHJpbmdzLmpzJztcbmltcG9ydCBBcnJvd0tleU5vZGUgZnJvbSAnLi4vQXJyb3dLZXlOb2RlLmpzJztcbmltcG9ydCBMZXR0ZXJLZXlOb2RlIGZyb20gJy4uL0xldHRlcktleU5vZGUuanMnO1xuaW1wb3J0IFRleHRLZXlOb2RlIGZyb20gJy4uL1RleHRLZXlOb2RlLmpzJztcblxuLy8gY29uc3RhbnRzXG5jb25zdCBERUZBVUxUX0hPUklaT05UQUxfS0VZX1NQQUNJTkcgPSAxLjM7XG5jb25zdCBPUl9URVhUX01BWF9XSURUSCA9IDE2O1xuY29uc3QgTEFCRUxfRk9OVCA9IG5ldyBQaGV0Rm9udCggMTYgKTtcblxudHlwZSBTZWxmT3B0aW9ucyA9IEVtcHR5U2VsZk9wdGlvbnM7XG5cbi8vIE9wdGlvbnMgZm9yIG1vc3Qgc3RhdGljIG1ldGhvZHMgaGVyZWluXG50eXBlIEtleWJvYXJkSGVscEljb25GYWN0b3J5T3B0aW9ucyA9IFNlbGZPcHRpb25zICYgU3RyaWN0T21pdDxIQm94T3B0aW9ucywgJ2NoaWxkcmVuJz47XG5cbi8vIE9wdGlvbnMgZm9yIHRoZSBoYW5kZnVsIG9mIHN0YXRpYyBtZXRob2RzIHRoYXQgYWRkaXRpb25hbGx5IGludm9sdmUgUGx1c05vZGVcbnR5cGUgV2l0aFBsdXNJY29uU2VsZk9wdGlvbnMgPSB7XG4gIHBsdXNJY29uU2l6ZT86IERpbWVuc2lvbjI7XG59O1xudHlwZSBXaXRoUGx1c0ljb25PcHRpb25zID0gV2l0aFBsdXNJY29uU2VsZk9wdGlvbnMgJiBLZXlib2FyZEhlbHBJY29uRmFjdG9yeU9wdGlvbnM7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEtleWJvYXJkSGVscEljb25GYWN0b3J5IHtcblxuICBwdWJsaWMgc3RhdGljIHJlYWRvbmx5IERFRkFVTFRfSUNPTl9TUEFDSU5HID0gNi41O1xuXG4gIHB1YmxpYyBjb25zdHJ1Y3RvcigpIHtcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBmYWxzZSwgJ2RvIG5vdCBjb25zdHJ1Y3QgdGhpcywgaW5zdGVhZCB1c2UgaXRzIGhlbHBlciBzdGF0aWMgbWV0aG9kcyBmb3IgaWNvbiBjcmVhdGlvbicgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBIb3Jpem9udGFsIGxheW91dCBvZiBhIHNldCBvZiBpY29ucywgaW4gbGVmdC10by1yaWdodCBvcmRlci5cbiAgICovXG4gIHB1YmxpYyBzdGF0aWMgaWNvblJvdyggaWNvbnM6IE5vZGVbXSwgcHJvdmlkZWRPcHRpb25zPzogS2V5Ym9hcmRIZWxwSWNvbkZhY3RvcnlPcHRpb25zICk6IE5vZGUge1xuICAgIGNvbnN0IG9wdGlvbnMgPSBvcHRpb25pemU8S2V5Ym9hcmRIZWxwSWNvbkZhY3RvcnlPcHRpb25zLCBTZWxmT3B0aW9ucywgSEJveE9wdGlvbnM+KCkoIHtcbiAgICAgIHNwYWNpbmc6IERFRkFVTFRfSE9SSVpPTlRBTF9LRVlfU1BBQ0lORyxcbiAgICAgIGNoaWxkcmVuOiBpY29uc1xuICAgIH0sIHByb3ZpZGVkT3B0aW9ucyApO1xuICAgIHJldHVybiBuZXcgSEJveCggb3B0aW9ucyApO1xuICB9XG5cbiAgLyoqXG4gICAqIFR3byBpY29ucyB3aXRoIGhvcml6b250YWwgbGF5b3V0LCBzZXBhcmF0ZWQgYnkgJ29yJyB0ZXh0LlxuICAgKi9cbiAgcHVibGljIHN0YXRpYyBpY29uT3JJY29uKCBsZWZ0SWNvbjogTm9kZSwgcmlnaHRJY29uOiBOb2RlLCBwcm92aWRlZE9wdGlvbnM/OiBLZXlib2FyZEhlbHBJY29uRmFjdG9yeU9wdGlvbnMgKTogTm9kZSB7XG5cbiAgICBjb25zdCBvcHRpb25zID0gY29tYmluZU9wdGlvbnM8S2V5Ym9hcmRIZWxwSWNvbkZhY3RvcnlPcHRpb25zPigge1xuICAgICAgc3BhY2luZzogS2V5Ym9hcmRIZWxwSWNvbkZhY3RvcnkuREVGQVVMVF9JQ09OX1NQQUNJTkdcbiAgICB9LCBwcm92aWRlZE9wdGlvbnMgKTtcblxuICAgIGNvbnN0IG9yVGV4dCA9IG5ldyBUZXh0KCBTY2VuZXJ5UGhldFN0cmluZ3Mua2V5Ym9hcmRIZWxwRGlhbG9nLm9yU3RyaW5nUHJvcGVydHksIHtcbiAgICAgIGZvbnQ6IExBQkVMX0ZPTlQsXG4gICAgICBtYXhXaWR0aDogT1JfVEVYVF9NQVhfV0lEVEhcbiAgICB9ICk7XG5cbiAgICByZXR1cm4gS2V5Ym9hcmRIZWxwSWNvbkZhY3RvcnkuaWNvblJvdyggWyBuZXcgTm9kZSggeyBjaGlsZHJlbjogWyBsZWZ0SWNvbiBdIH0gKSwgb3JUZXh0LFxuICAgICAgbmV3IE5vZGUoIHsgY2hpbGRyZW46IFsgcmlnaHRJY29uIF0gfSApIF0sIG9wdGlvbnMgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBUd28gaWNvbnMgd2l0aCBob3Jpem9udGFsIGxheW91dCwgYW5kIHNlcGFyYXRlZCBieSAnLScgdGV4dC4gVGhpcyBpcyB1c2VmdWwgZm9yIGEgcmFuZ2UsIGxpa2UgMC05LlxuICAgKi9cbiAgcHVibGljIHN0YXRpYyBpY29uVG9JY29uKCBsZWZ0SWNvbjogTm9kZSwgcmlnaHRJY29uOiBOb2RlLCBwcm92aWRlZE9wdGlvbnM/OiBLZXlib2FyZEhlbHBJY29uRmFjdG9yeU9wdGlvbnMgKTogTm9kZSB7XG5cbiAgICBjb25zdCBvcHRpb25zID0gY29tYmluZU9wdGlvbnM8S2V5Ym9hcmRIZWxwSWNvbkZhY3RvcnlPcHRpb25zPigge1xuICAgICAgc3BhY2luZzogS2V5Ym9hcmRIZWxwSWNvbkZhY3RvcnkuREVGQVVMVF9JQ09OX1NQQUNJTkcgLyAyXG4gICAgfSwgcHJvdmlkZWRPcHRpb25zICk7XG5cbiAgICBjb25zdCBoeXBoZW5UZXh0ID0gbmV3IFRleHQoIFNjZW5lcnlQaGV0U3RyaW5ncy5rZXlib2FyZEhlbHBEaWFsb2cuaHlwaGVuU3RyaW5nUHJvcGVydHksIHtcbiAgICAgIGZvbnQ6IExBQkVMX0ZPTlQsXG4gICAgICBtYXhXaWR0aDogT1JfVEVYVF9NQVhfV0lEVEhcbiAgICB9ICk7XG5cbiAgICByZXR1cm4gS2V5Ym9hcmRIZWxwSWNvbkZhY3RvcnkuaWNvblJvdyggWyBuZXcgTm9kZSggeyBjaGlsZHJlbjogWyBsZWZ0SWNvbiBdIH0gKSwgaHlwaGVuVGV4dCwgbmV3IE5vZGUoIHsgY2hpbGRyZW46IFsgcmlnaHRJY29uIF0gfSApIF0sIG9wdGlvbnMgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBUd28gaWNvbnMgd2l0aCBob3Jpem9udGFsIGxheW91dCwgc2VwYXJhdGVkIGJ5ICcrJyB0ZXh0LlxuICAgKi9cbiAgcHVibGljIHN0YXRpYyBpY29uUGx1c0ljb24oIGxlZnRJY29uOiBOb2RlLCByaWdodEljb246IE5vZGUsIHByb3ZpZGVkT3B0aW9ucz86IFdpdGhQbHVzSWNvbk9wdGlvbnMgKTogTm9kZSB7XG4gICAgcmV0dXJuIEtleWJvYXJkSGVscEljb25GYWN0b3J5Lmljb25QbHVzSWNvblJvdyggWyBsZWZ0SWNvbiwgcmlnaHRJY29uIF0sIHByb3ZpZGVkT3B0aW9ucyApO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgYSByb3cgb2YgaWNvbnMgc2VwYXJhdGVkIGJ5ICcrJy4gVXNlZnVsIHdoZW4gYSBrZXlib2FyZCBzaG9ydGN1dCBoYXMgbXVsdGlwbGUgbW9kaWZpZXIga2V5cyBmb3Igb25lXG4gICAqIGtleSBwcmVzcyBsaXN0ZW5lci5cbiAgICovXG4gIHB1YmxpYyBzdGF0aWMgaWNvblBsdXNJY29uUm93KCBpY29uTGlzdDogTm9kZVtdLCBwcm92aWRlZE9wdGlvbnM/OiBXaXRoUGx1c0ljb25PcHRpb25zICk6IE5vZGUge1xuICAgIGNvbnN0IG9wdGlvbnMgPSBjb21iaW5lT3B0aW9uczxXaXRoUGx1c0ljb25PcHRpb25zPigge1xuICAgICAgcGx1c0ljb25TaXplOiBuZXcgRGltZW5zaW9uMiggOCwgMS4yICksXG4gICAgICBzcGFjaW5nOiBLZXlib2FyZEhlbHBJY29uRmFjdG9yeS5ERUZBVUxUX0lDT05fU1BBQ0lOR1xuICAgIH0sIHByb3ZpZGVkT3B0aW9ucyApO1xuXG4gICAgLy8gV2VhdmUgcGx1cyBpY29ucyBpbnRvIHRoZSBwcm92aWRlZCBhcnJheSBvZiBpY29ucy4gTGlrZSBBcnJheS5qb2luLCBidXQgd2l0aCBhIG5ldyBhcnJheSBpbnN0ZWFkIG9mIGEgc3RyaW5nLlxuICAgIGNvbnN0IGljb25MaXN0V2l0aFNlcGFyYXRvcnMgPSBbXTtcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBpY29uTGlzdC5sZW5ndGg7IGkrKyApIHtcblxuICAgICAgLy8gU2NlbmVyeSBsYXlvdXQgY29udHJvbHMgdHJhbnNmb3JtcyBvZiBjaGlsZHJlbi4gU2luY2Ugd2UgZG9uJ3Qgb3duIHRoZSBpY29uTm9kZSwgd2UgaGF2ZSB0byB3cmFwIGl0IGluIGFub3RoZXJcbiAgICAgIC8vIHNvIHRoYXQgbGF5b3V0IHdpbGwgd29yayBpbiBjYXNlcyBvZiBEQUcuXG4gICAgICBpY29uTGlzdFdpdGhTZXBhcmF0b3JzLnB1c2goXG4gICAgICAgIG5ldyBOb2RlKCB7XG4gICAgICAgICAgY2hpbGRyZW46IFsgaWNvbkxpc3RbIGkgXSBdXG4gICAgICAgIH0gKVxuICAgICAgKTtcblxuICAgICAgLy8gZG9uJ3QgYWRkIHRoZSBzZXBhcmF0b3IgdG8gdGhlIGxhc3QgaXRlbVxuICAgICAgaWYgKCBpIDwgaWNvbkxpc3QubGVuZ3RoIC0gMSApIHtcbiAgICAgICAgaWNvbkxpc3RXaXRoU2VwYXJhdG9ycy5wdXNoKCBuZXcgUGx1c05vZGUoIHtcbiAgICAgICAgICBzaXplOiBvcHRpb25zLnBsdXNJY29uU2l6ZVxuICAgICAgICB9ICkgKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gS2V5Ym9hcmRIZWxwSWNvbkZhY3RvcnkuaWNvblJvdyggaWNvbkxpc3RXaXRoU2VwYXJhdG9ycywge1xuICAgICAgc3BhY2luZzogb3B0aW9ucy5zcGFjaW5nXG4gICAgfSApO1xuICB9XG5cbiAgLyoqXG4gICAqIEFuIGljb24gd2l0aCBob3Jpem9udGFsIGxheW91dCBpbiBvcmRlcjogc2hpZnQsIHBsdXMsIGFuZCBwcm92aWRlZCBpY29uLlxuICAgKi9cbiAgcHVibGljIHN0YXRpYyBzaGlmdFBsdXNJY29uKCBpY29uOiBOb2RlLCBwcm92aWRlZE9wdGlvbnM/OiBXaXRoUGx1c0ljb25PcHRpb25zICk6IE5vZGUge1xuICAgIGNvbnN0IHNoaWZ0S2V5SWNvbiA9IFRleHRLZXlOb2RlLnNoaWZ0KCk7XG4gICAgcmV0dXJuIEtleWJvYXJkSGVscEljb25GYWN0b3J5Lmljb25QbHVzSWNvbiggc2hpZnRLZXlJY29uLCBpY29uLCBwcm92aWRlZE9wdGlvbnMgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBbiBpY29uIHdpdGggaG9yaXpvbnRhbCBsYXlvdXQgaW4gb3JkZXI6IGFsdCwgcGx1cywgYW5kIHByb3ZpZGVkIGljb24uXG4gICAqL1xuICBwdWJsaWMgc3RhdGljIGFsdFBsdXNJY29uKCBpY29uOiBOb2RlLCBwcm92aWRlZE9wdGlvbnM/OiBXaXRoUGx1c0ljb25PcHRpb25zICk6IE5vZGUge1xuICAgIGNvbnN0IGFsdEtleUljb24gPSBUZXh0S2V5Tm9kZS5hbHRPck9wdGlvbigpO1xuICAgIHJldHVybiBLZXlib2FyZEhlbHBJY29uRmFjdG9yeS5pY29uUGx1c0ljb24oIGFsdEtleUljb24sIGljb24sIHByb3ZpZGVkT3B0aW9ucyApO1xuICB9XG5cbiAgLyoqXG4gICAqIFwiU3BhY2Ugb3IgRW50ZXJcIiBpY29uXG4gICAqL1xuICBwdWJsaWMgc3RhdGljIHNwYWNlT3JFbnRlcigpOiBOb2RlIHtcbiAgICBjb25zdCBzcGFjZUtleSA9IFRleHRLZXlOb2RlLnNwYWNlKCk7XG4gICAgY29uc3QgZW50ZXJLZXkgPSBUZXh0S2V5Tm9kZS5lbnRlcigpO1xuICAgIHJldHVybiBLZXlib2FyZEhlbHBJY29uRmFjdG9yeS5pY29uT3JJY29uKCBzcGFjZUtleSwgZW50ZXJLZXkgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBbiBpY29uIHdpdGggdXAgYW5kIGRvd24gYXJyb3dzLCBzZXBhcmF0ZWQgYnkgJ29yJywgaW4gaG9yaXpvbnRhbCBsYXlvdXQuXG4gICAqL1xuICBwdWJsaWMgc3RhdGljIHVwT3JEb3duKCk6IE5vZGUge1xuICAgIGNvbnN0IHVwQXJyb3dLZXlOb2RlID0gbmV3IEFycm93S2V5Tm9kZSggJ3VwJyApO1xuICAgIGNvbnN0IGRvd25BcnJvd0tleU5vZGUgPSBuZXcgQXJyb3dLZXlOb2RlKCAnZG93bicgKTtcbiAgICByZXR1cm4gS2V5Ym9hcmRIZWxwSWNvbkZhY3RvcnkuaWNvbk9ySWNvbiggdXBBcnJvd0tleU5vZGUsIGRvd25BcnJvd0tleU5vZGUgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBbiBpY29uIHdpdGggdXAgYW5kIGRvd24gYXJyb3cga2V5cywgaW4gYSBob3Jpem9udGFsIGxheW91dC5cbiAgICovXG4gIHB1YmxpYyBzdGF0aWMgd2FzZFJvd0ljb24oIHByb3ZpZGVkT3B0aW9ucz86IEtleWJvYXJkSGVscEljb25GYWN0b3J5T3B0aW9ucyApOiBOb2RlIHtcblxuICAgIGNvbnN0IG9wdGlvbnMgPSBvcHRpb25pemU8S2V5Ym9hcmRIZWxwSWNvbkZhY3RvcnlPcHRpb25zLCBTZWxmT3B0aW9ucywgSEJveE9wdGlvbnM+KCkoIHtcbiAgICAgIHNwYWNpbmc6IERFRkFVTFRfSE9SSVpPTlRBTF9LRVlfU1BBQ0lOR1xuICAgIH0sIHByb3ZpZGVkT3B0aW9ucyApO1xuXG4gICAgY29uc3QgV0tleU5vZGUgPSBMZXR0ZXJLZXlOb2RlLncoKTtcbiAgICBjb25zdCBBS2V5Tm9kZSA9IExldHRlcktleU5vZGUuYSgpO1xuICAgIGNvbnN0IFNLZXlOb2RlID0gTGV0dGVyS2V5Tm9kZS5zKCk7XG4gICAgY29uc3QgREtleU5vZGUgPSBMZXR0ZXJLZXlOb2RlLmQoKTtcblxuICAgIC8vIFN0cmluZ3MgYXJlIG5vdCB0cmFuc2xhdGVkIGJlY2F1c2UgdGhleSBtYXAgZGlyZWN0bHkgdG8gc3BlY2lmaWMga2V5IGNvZGVzLlxuICAgIGNvbnN0IGljb25zID0gWyBXS2V5Tm9kZSwgQUtleU5vZGUsIFNLZXlOb2RlLCBES2V5Tm9kZSBdO1xuXG4gICAgcmV0dXJuIEtleWJvYXJkSGVscEljb25GYWN0b3J5Lmljb25Sb3coIGljb25zLCBvcHRpb25zICk7XG4gIH1cblxuICAvKipcbiAgICogQW4gaWNvbiB3aXRoIHRoZSA0IGFycm93IGtleXMsIGluIGEgaG9yaXpvbnRhbCBsYXlvdXQuXG4gICAqL1xuICBwdWJsaWMgc3RhdGljIGFycm93S2V5c1Jvd0ljb24oIHByb3ZpZGVkT3B0aW9ucz86IEtleWJvYXJkSGVscEljb25GYWN0b3J5T3B0aW9ucyApOiBOb2RlIHtcblxuICAgIGNvbnN0IG9wdGlvbnMgPSBvcHRpb25pemU8S2V5Ym9hcmRIZWxwSWNvbkZhY3RvcnlPcHRpb25zLCBTZWxmT3B0aW9ucywgSEJveE9wdGlvbnM+KCkoIHtcbiAgICAgIHNwYWNpbmc6IERFRkFVTFRfSE9SSVpPTlRBTF9LRVlfU1BBQ0lOR1xuICAgIH0sIHByb3ZpZGVkT3B0aW9ucyApO1xuXG4gICAgLy8gb3JkZXIgb2YgdGhlc2UgaWNvbnMgbWF0Y2hlcyBtb3ZlbWVudCB3aXRoIHRoZSBXQVNEIGtleXNcbiAgICBjb25zdCB1cEFycm93S2V5Tm9kZSA9IG5ldyBBcnJvd0tleU5vZGUoICd1cCcgKTtcbiAgICBjb25zdCBsZWZ0QXJyb3dLZXlOb2RlID0gbmV3IEFycm93S2V5Tm9kZSggJ2xlZnQnICk7XG4gICAgY29uc3QgZG93bkFycm93S2V5Tm9kZSA9IG5ldyBBcnJvd0tleU5vZGUoICdkb3duJyApO1xuICAgIGNvbnN0IHJpZ2h0QXJyb3dLZXlOb2RlID0gbmV3IEFycm93S2V5Tm9kZSggJ3JpZ2h0JyApO1xuICAgIHJldHVybiBLZXlib2FyZEhlbHBJY29uRmFjdG9yeS5pY29uUm93KCBbIHVwQXJyb3dLZXlOb2RlLCBsZWZ0QXJyb3dLZXlOb2RlLCBkb3duQXJyb3dLZXlOb2RlLCByaWdodEFycm93S2V5Tm9kZSBdLCBvcHRpb25zICk7XG4gIH1cblxuICAvKipcbiAgICogQW4gaWNvbiB3aXRoIHRoZSA0IGFycm93IGtleXMsIFdBU0Qga2V5cywgc2VwYXJhdGVkIGJ5IFwib3JcIiwgaW4gaG9yaXpvbnRhbCBsYXlvdXQuXG4gICAqL1xuICBwdWJsaWMgc3RhdGljIGFycm93T3JXYXNkS2V5c1Jvd0ljb24oIHByb3ZpZGVkT3B0aW9ucz86IEtleWJvYXJkSGVscEljb25GYWN0b3J5T3B0aW9ucyApOiBOb2RlIHtcblxuICAgIGNvbnN0IG9wdGlvbnMgPSBvcHRpb25pemU8S2V5Ym9hcmRIZWxwSWNvbkZhY3RvcnlPcHRpb25zLCBTZWxmT3B0aW9ucywgSEJveE9wdGlvbnM+KCkoIHtcbiAgICAgIHNwYWNpbmc6IEtleWJvYXJkSGVscEljb25GYWN0b3J5LkRFRkFVTFRfSUNPTl9TUEFDSU5HXG4gICAgfSwgcHJvdmlkZWRPcHRpb25zICk7XG5cbiAgICBjb25zdCBhcnJvd0tleXMgPSBLZXlib2FyZEhlbHBJY29uRmFjdG9yeS5hcnJvd0tleXNSb3dJY29uKCk7XG4gICAgY29uc3Qgd2FzZEtleXMgPSBLZXlib2FyZEhlbHBJY29uRmFjdG9yeS53YXNkUm93SWNvbigpO1xuXG4gICAgcmV0dXJuIEtleWJvYXJkSGVscEljb25GYWN0b3J5Lmljb25Pckljb24oIGFycm93S2V5cywgd2FzZEtleXMsIG9wdGlvbnMgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBbiBpY29uIHdpdGggcGFnZSB1cC9kb3duIGtleXMsIGluIGhvcml6b250YWwgbGF5b3V0LlxuICAgKi9cbiAgcHVibGljIHN0YXRpYyBwYWdlVXBQYWdlRG93blJvd0ljb24oIHByb3ZpZGVkT3B0aW9ucz86IEtleWJvYXJkSGVscEljb25GYWN0b3J5T3B0aW9ucyApOiBOb2RlIHtcblxuICAgIGNvbnN0IG9wdGlvbnMgPSBvcHRpb25pemU8S2V5Ym9hcmRIZWxwSWNvbkZhY3RvcnlPcHRpb25zLCBTZWxmT3B0aW9ucywgSEJveE9wdGlvbnM+KCkoIHtcbiAgICAgIHNwYWNpbmc6IEtleWJvYXJkSGVscEljb25GYWN0b3J5LkRFRkFVTFRfSUNPTl9TUEFDSU5HXG4gICAgfSwgcHJvdmlkZWRPcHRpb25zICk7XG5cbiAgICBjb25zdCBwYWdlVXBLZXlOb2RlID0gVGV4dEtleU5vZGUucGFnZVVwKCk7XG4gICAgY29uc3QgcGFnZURvd25LZXlOb2RlID0gVGV4dEtleU5vZGUucGFnZURvd24oKTtcbiAgICBjb25zdCBpY29ucyA9IFsgcGFnZVVwS2V5Tm9kZSwgcGFnZURvd25LZXlOb2RlIF07XG5cbiAgICByZXR1cm4gS2V5Ym9hcmRIZWxwSWNvbkZhY3RvcnkuaWNvblJvdyggaWNvbnMsIG9wdGlvbnMgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBbiBpY29uIHdpdGggdXAgYW5kIGRvd24gYXJyb3cga2V5cywgaW4gaG9yaXpvbnRhbCBsYXlvdXQuXG4gICAqL1xuICBwdWJsaWMgc3RhdGljIHVwRG93bkFycm93S2V5c1Jvd0ljb24oIHByb3ZpZGVkT3B0aW9ucz86IEtleWJvYXJkSGVscEljb25GYWN0b3J5T3B0aW9ucyApOiBOb2RlIHtcbiAgICBjb25zdCB1cEFycm93S2V5Tm9kZSA9IG5ldyBBcnJvd0tleU5vZGUoICd1cCcgKTtcbiAgICBjb25zdCBkb3duQXJyb3dLZXlOb2RlID0gbmV3IEFycm93S2V5Tm9kZSggJ2Rvd24nICk7XG4gICAgcmV0dXJuIEtleWJvYXJkSGVscEljb25GYWN0b3J5Lmljb25Sb3coIFsgdXBBcnJvd0tleU5vZGUsIGRvd25BcnJvd0tleU5vZGUgXSwgcHJvdmlkZWRPcHRpb25zICk7XG4gIH1cblxuICAvKipcbiAgICogQW4gaWNvbiB3aXRoIGxlZnQgYW5kIHJpZ2h0IGFycm93IGtleXMsIGluIGhvcml6b250YWwgbGF5b3V0LlxuICAgKi9cbiAgcHVibGljIHN0YXRpYyBsZWZ0UmlnaHRBcnJvd0tleXNSb3dJY29uKCBwcm92aWRlZE9wdGlvbnM/OiBLZXlib2FyZEhlbHBJY29uRmFjdG9yeU9wdGlvbnMgKTogTm9kZSB7XG4gICAgY29uc3QgbGVmdEFycm93S2V5Tm9kZSA9IG5ldyBBcnJvd0tleU5vZGUoICdsZWZ0JyApO1xuICAgIGNvbnN0IHJpZ2h0QXJyb3dLZXlOb2RlID0gbmV3IEFycm93S2V5Tm9kZSggJ3JpZ2h0JyApO1xuICAgIHJldHVybiBLZXlib2FyZEhlbHBJY29uRmFjdG9yeS5pY29uUm93KCBbIGxlZnRBcnJvd0tleU5vZGUsIHJpZ2h0QXJyb3dLZXlOb2RlIF0sIHByb3ZpZGVkT3B0aW9ucyApO1xuICB9XG5cbiAgLyoqXG4gICAqIE1hcHMgRW5nbGlzaCBrZXkgc3RyaW5ncyB0byB0aGVpciBjb3JyZXNwb25kaW5nIGljb24gbm9kZXMuXG4gICAqL1xuICBwdWJsaWMgc3RhdGljIHJlYWRvbmx5IEVOR0xJU0hfS0VZX1RPX0tFWV9OT0RFID0gbmV3IE1hcDxPbmVLZXlTdHJva2VFbnRyeSwgVGV4dEtleU5vZGU+KCBbXG4gICAgWyAnYScsIG5ldyBMZXR0ZXJLZXlOb2RlKCAnQScgKSBdLFxuICAgIFsgJ2onLCBuZXcgTGV0dGVyS2V5Tm9kZSggJ0onICkgXSxcbiAgICBbICdzaGlmdCcsIFRleHRLZXlOb2RlLnNoaWZ0KCkgXSxcbiAgICBbICdhbHQnLCBUZXh0S2V5Tm9kZS5hbHRPck9wdGlvbigpIF0sXG4gICAgWyAnZXNjYXBlJywgVGV4dEtleU5vZGUuZXNjKCkgXSxcbiAgICBbICdhcnJvd0xlZnQnLCBuZXcgQXJyb3dLZXlOb2RlKCAnbGVmdCcgKSBdLFxuICAgIFsgJ2Fycm93UmlnaHQnLCBuZXcgQXJyb3dLZXlOb2RlKCAncmlnaHQnICkgXSxcbiAgICBbICdhcnJvd1VwJywgbmV3IEFycm93S2V5Tm9kZSggJ3VwJyApIF0sXG4gICAgWyAnYXJyb3dEb3duJywgbmV3IEFycm93S2V5Tm9kZSggJ2Rvd24nICkgXSxcbiAgICBbICdwYWdlVXAnLCBUZXh0S2V5Tm9kZS5wYWdlVXAoKSBdLFxuICAgIFsgJ3BhZ2VEb3duJywgVGV4dEtleU5vZGUucGFnZURvd24oKSBdLFxuICAgIFsgJ2hvbWUnLCBUZXh0S2V5Tm9kZS5ob21lKCkgXSxcbiAgICBbICdlbmQnLCBUZXh0S2V5Tm9kZS5lbmQoKSBdLFxuICAgIFsgJ3InLCBuZXcgTGV0dGVyS2V5Tm9kZSggJ1InICkgXSxcbiAgICBbICdzJywgbmV3IExldHRlcktleU5vZGUoICdTJyApIF0sXG4gICAgWyAnbCcsIG5ldyBMZXR0ZXJLZXlOb2RlKCAnTCcgKSBdLFxuICAgIFsgJ2MnLCBuZXcgTGV0dGVyS2V5Tm9kZSggJ0MnICkgXSxcbiAgICBbICdoJywgbmV3IExldHRlcktleU5vZGUoICdIJyApIF0sXG4gICAgWyAndycsIG5ldyBMZXR0ZXJLZXlOb2RlKCAnVycgKSBdLFxuICAgIFsgJ2onLCBuZXcgTGV0dGVyS2V5Tm9kZSggJ0onICkgXSxcbiAgICBbICdrJywgbmV3IExldHRlcktleU5vZGUoICdLJyApIF0sXG4gICAgWyAnbicsIG5ldyBMZXR0ZXJLZXlOb2RlKCAnTicgKSBdLFxuICAgIFsgJzAnLCBuZXcgTGV0dGVyS2V5Tm9kZSggJzAnICkgXSxcbiAgICBbICcxJywgbmV3IExldHRlcktleU5vZGUoICcxJyApIF0sXG4gICAgWyAnMicsIG5ldyBMZXR0ZXJLZXlOb2RlKCAnMicgKSBdLFxuICAgIFsgJzMnLCBuZXcgTGV0dGVyS2V5Tm9kZSggJzMnICkgXVxuICBdICk7XG5cbiAgLyoqXG4gICAqIENyZWF0ZSBhbiBpY29uIE5vZGUgZm9yIGEgaG90a2V5LCBiYXNlZCBvbiB0aGUgcHJvdmlkZWQgSG90a2V5RGF0YS4gQ29tYmluZXMga2V5IGljb25zIHdpdGggcGx1cyBpY29ucy5cbiAgICogRm9yIGV4YW1wbGUsIGEgSG90a2V5RGF0YSB3aXRoICdzaGlmdCtyJyB3b3VsZCBwcm9kdWNlIGEgcm93IHdpdGggdGhlIHNoaWZ0IGljb24sIGEgcGx1cyBpY29uLCBhbmQgdGhlIHIgaWNvbi5cbiAgICovXG4gIHB1YmxpYyBzdGF0aWMgZnJvbUhvdGtleURhdGEoIGhvdGtleURhdGE6IEhvdGtleURhdGEgKTogTm9kZSB7XG4gICAgY29uc3QgbW9kaWZpZXJLZXlOb2RlcyA9IGhvdGtleURhdGEua2V5RGVzY3JpcHRvcnNQcm9wZXJ0eS52YWx1ZVsgMCBdLm1vZGlmaWVyS2V5cy5tYXAoIG1vZGlmaWVyS2V5ID0+IHtcbiAgICAgIGNvbnN0IGtleU5vZGUgPSBLZXlib2FyZEhlbHBJY29uRmFjdG9yeS5FTkdMSVNIX0tFWV9UT19LRVlfTk9ERS5nZXQoIG1vZGlmaWVyS2V5ICkhO1xuICAgICAgYXNzZXJ0ICYmIGFzc2VydCgga2V5Tm9kZSwgJ21vZGlmaWVyIGtleSBub3QgZm91bmQgaW4gRU5HTElTSF9LRVlfVE9fS0VZX05PREUnICk7XG4gICAgICByZXR1cm4ga2V5Tm9kZTtcbiAgICB9ICk7XG5cbiAgICBjb25zdCBrZXlOb2RlID0gS2V5Ym9hcmRIZWxwSWNvbkZhY3RvcnkuRU5HTElTSF9LRVlfVE9fS0VZX05PREUuZ2V0KCBob3RrZXlEYXRhLmtleURlc2NyaXB0b3JzUHJvcGVydHkudmFsdWVbIDAgXS5rZXkgKSE7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCgga2V5Tm9kZSwgJ2tleSBub3QgZm91bmQgaW4gRU5HTElTSF9LRVlfVE9fS0VZX05PREUnICk7XG5cbiAgICByZXR1cm4gS2V5Ym9hcmRIZWxwSWNvbkZhY3RvcnkuaWNvblBsdXNJY29uUm93KCBbIC4uLm1vZGlmaWVyS2V5Tm9kZXMsIGtleU5vZGUgXSApO1xuICB9XG5cblxufVxuXG5hc3NlcnQgJiYgYXNzZXJ0KCBPYmplY3Qua2V5cyggS2V5Ym9hcmRIZWxwSWNvbkZhY3RvcnkucHJvdG90eXBlICkubGVuZ3RoID09PSAwLFxuICAnS2V5Ym9hcmRIZWxwSWNvbkZhY3Rvcnkgb25seSBoYXMgc3RhdGljIGZ1bmN0aW9ucycgKTtcblxuc2NlbmVyeVBoZXQucmVnaXN0ZXIoICdLZXlib2FyZEhlbHBJY29uRmFjdG9yeScsIEtleWJvYXJkSGVscEljb25GYWN0b3J5ICk7Il0sIm5hbWVzIjpbIkRpbWVuc2lvbjIiLCJvcHRpb25pemUiLCJjb21iaW5lT3B0aW9ucyIsIkhCb3giLCJOb2RlIiwiVGV4dCIsIlBoZXRGb250IiwiUGx1c05vZGUiLCJzY2VuZXJ5UGhldCIsIlNjZW5lcnlQaGV0U3RyaW5ncyIsIkFycm93S2V5Tm9kZSIsIkxldHRlcktleU5vZGUiLCJUZXh0S2V5Tm9kZSIsIkRFRkFVTFRfSE9SSVpPTlRBTF9LRVlfU1BBQ0lORyIsIk9SX1RFWFRfTUFYX1dJRFRIIiwiTEFCRUxfRk9OVCIsIktleWJvYXJkSGVscEljb25GYWN0b3J5IiwiaWNvblJvdyIsImljb25zIiwicHJvdmlkZWRPcHRpb25zIiwib3B0aW9ucyIsInNwYWNpbmciLCJjaGlsZHJlbiIsImljb25Pckljb24iLCJsZWZ0SWNvbiIsInJpZ2h0SWNvbiIsIkRFRkFVTFRfSUNPTl9TUEFDSU5HIiwib3JUZXh0Iiwia2V5Ym9hcmRIZWxwRGlhbG9nIiwib3JTdHJpbmdQcm9wZXJ0eSIsImZvbnQiLCJtYXhXaWR0aCIsImljb25Ub0ljb24iLCJoeXBoZW5UZXh0IiwiaHlwaGVuU3RyaW5nUHJvcGVydHkiLCJpY29uUGx1c0ljb24iLCJpY29uUGx1c0ljb25Sb3ciLCJpY29uTGlzdCIsInBsdXNJY29uU2l6ZSIsImljb25MaXN0V2l0aFNlcGFyYXRvcnMiLCJpIiwibGVuZ3RoIiwicHVzaCIsInNpemUiLCJzaGlmdFBsdXNJY29uIiwiaWNvbiIsInNoaWZ0S2V5SWNvbiIsInNoaWZ0IiwiYWx0UGx1c0ljb24iLCJhbHRLZXlJY29uIiwiYWx0T3JPcHRpb24iLCJzcGFjZU9yRW50ZXIiLCJzcGFjZUtleSIsInNwYWNlIiwiZW50ZXJLZXkiLCJlbnRlciIsInVwT3JEb3duIiwidXBBcnJvd0tleU5vZGUiLCJkb3duQXJyb3dLZXlOb2RlIiwid2FzZFJvd0ljb24iLCJXS2V5Tm9kZSIsInciLCJBS2V5Tm9kZSIsImEiLCJTS2V5Tm9kZSIsInMiLCJES2V5Tm9kZSIsImQiLCJhcnJvd0tleXNSb3dJY29uIiwibGVmdEFycm93S2V5Tm9kZSIsInJpZ2h0QXJyb3dLZXlOb2RlIiwiYXJyb3dPcldhc2RLZXlzUm93SWNvbiIsImFycm93S2V5cyIsIndhc2RLZXlzIiwicGFnZVVwUGFnZURvd25Sb3dJY29uIiwicGFnZVVwS2V5Tm9kZSIsInBhZ2VVcCIsInBhZ2VEb3duS2V5Tm9kZSIsInBhZ2VEb3duIiwidXBEb3duQXJyb3dLZXlzUm93SWNvbiIsImxlZnRSaWdodEFycm93S2V5c1Jvd0ljb24iLCJmcm9tSG90a2V5RGF0YSIsImhvdGtleURhdGEiLCJtb2RpZmllcktleU5vZGVzIiwia2V5RGVzY3JpcHRvcnNQcm9wZXJ0eSIsInZhbHVlIiwibW9kaWZpZXJLZXlzIiwibWFwIiwibW9kaWZpZXJLZXkiLCJrZXlOb2RlIiwiRU5HTElTSF9LRVlfVE9fS0VZX05PREUiLCJnZXQiLCJhc3NlcnQiLCJrZXkiLCJNYXAiLCJlc2MiLCJob21lIiwiZW5kIiwiT2JqZWN0Iiwia2V5cyIsInByb3RvdHlwZSIsInJlZ2lzdGVyIl0sIm1hcHBpbmdzIjoiQUFBQSxzREFBc0Q7QUFFdEQ7Ozs7O0NBS0MsR0FFRCxPQUFPQSxnQkFBZ0IsbUNBQW1DO0FBQzFELE9BQU9DLGFBQWFDLGNBQWMsUUFBMEIsd0NBQXdDO0FBRXBHLFNBQVNDLElBQUksRUFBMkJDLElBQUksRUFBcUJDLElBQUksUUFBUSxvQ0FBb0M7QUFDakgsT0FBT0MsY0FBYyxvQkFBb0I7QUFDekMsT0FBT0MsY0FBYyxvQkFBb0I7QUFDekMsT0FBT0MsaUJBQWlCLHVCQUF1QjtBQUMvQyxPQUFPQyx3QkFBd0IsOEJBQThCO0FBQzdELE9BQU9DLGtCQUFrQixxQkFBcUI7QUFDOUMsT0FBT0MsbUJBQW1CLHNCQUFzQjtBQUNoRCxPQUFPQyxpQkFBaUIsb0JBQW9CO0FBRTVDLFlBQVk7QUFDWixNQUFNQyxpQ0FBaUM7QUFDdkMsTUFBTUMsb0JBQW9CO0FBQzFCLE1BQU1DLGFBQWEsSUFBSVQsU0FBVTtBQWFsQixJQUFBLEFBQU1VLDBCQUFOLE1BQU1BO0lBUW5COztHQUVDLEdBQ0QsT0FBY0MsUUFBU0MsS0FBYSxFQUFFQyxlQUFnRCxFQUFTO1FBQzdGLE1BQU1DLFVBQVVuQixZQUF1RTtZQUNyRm9CLFNBQVNSO1lBQ1RTLFVBQVVKO1FBQ1osR0FBR0M7UUFD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