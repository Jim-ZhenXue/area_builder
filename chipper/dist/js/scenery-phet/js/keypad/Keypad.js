// Copyright 2016-2024, University of Colorado Boulder
/**
 * A flexible keypad that looks somewhat like a calculator or keyboard keypad.
 *
 * @author Aadish Gupta
 * @author John Blanco
 */ import merge from '../../../phet-core/js/merge.js';
import optionize from '../../../phet-core/js/optionize.js';
import { KeyboardListener, Node, Text } from '../../../scenery/js/imports.js';
import RectangularPushButton from '../../../sun/js/buttons/RectangularPushButton.js';
import Tandem from '../../../tandem/js/Tandem.js';
import BackspaceIcon from '../BackspaceIcon.js';
import PhetFont from '../PhetFont.js';
import sceneryPhet from '../sceneryPhet.js';
import Key from './Key.js';
import KeyID from './KeyID.js';
import NumberAccumulator from './NumberAccumulator.js';
// constants
const DEFAULT_BUTTON_WIDTH = 35;
const DEFAULT_BUTTON_HEIGHT = 35;
const DEFAULT_BUTTON_FONT = new PhetFont({
    size: 20
});
const DEFAULT_BUTTON_COLOR = 'white';
const PLUS_CHAR = '\u002b';
const MINUS_CHAR = '\u2212';
const _0 = new Key('0', KeyID.ZERO, {
    keyboardIdentifiers: [
        '0'
    ]
});
const _1 = new Key('1', KeyID.ONE, {
    keyboardIdentifiers: [
        '1'
    ]
});
const _2 = new Key('2', KeyID.TWO, {
    keyboardIdentifiers: [
        '2'
    ]
});
const _3 = new Key('3', KeyID.THREE, {
    keyboardIdentifiers: [
        '3'
    ]
});
const _4 = new Key('4', KeyID.FOUR, {
    keyboardIdentifiers: [
        '4'
    ]
});
const _5 = new Key('5', KeyID.FIVE, {
    keyboardIdentifiers: [
        '5'
    ]
});
const _6 = new Key('6', KeyID.SIX, {
    keyboardIdentifiers: [
        '6'
    ]
});
const _7 = new Key('7', KeyID.SEVEN, {
    keyboardIdentifiers: [
        '7'
    ]
});
const _8 = new Key('8', KeyID.EIGHT, {
    keyboardIdentifiers: [
        '8'
    ]
});
const _9 = new Key('9', KeyID.NINE, {
    keyboardIdentifiers: [
        '9'
    ]
});
const WIDE_ZERO = new Key('0', KeyID.ZERO, {
    horizontalSpan: 2,
    keyboardIdentifiers: [
        '0'
    ]
});
const DECIMAL = new Key('.', KeyID.DECIMAL, {
    keyboardIdentifiers: [
        'period'
    ]
});
const BACKSPACE = new Key(new BackspaceIcon({
    scale: 1.5
}), KeyID.BACKSPACE, {
    keyboardIdentifiers: [
        'backspace'
    ]
});
const PLUS_MINUS = new Key(`${PLUS_CHAR}/${MINUS_CHAR}`, KeyID.PLUS_MINUS, {
    keyboardIdentifiers: [
        'minus',
        'plus'
    ]
});
let Keypad = class Keypad extends Node {
    /**
   * Calls the clear function for the given accumulator
   */ clear() {
        this.keyAccumulator.clear();
    }
    /**
   * Determines whether pressing a key (except for backspace) will clear the existing value.
   */ setClearOnNextKeyPress(clearOnNextKeyPress) {
        this.keyAccumulator.setClearOnNextKeyPress(clearOnNextKeyPress);
    }
    /**
   * Will pressing a key (except for backspace) clear the existing value?
   */ getClearOnNextKeyPress() {
        return this.keyAccumulator.getClearOnNextKeyPress();
    }
    dispose() {
        this.keyAccumulator.dispose();
        this.buttonNodes.forEach((buttonNode)=>buttonNode.dispose());
        super.dispose();
    }
    /**
   * @param layout - an array that specifies the keys and the layout, see static instance below for example usage
   * @param [providedOptions]
   */ constructor(layout, providedOptions){
        const options = optionize()({
            buttonWidth: DEFAULT_BUTTON_WIDTH,
            buttonHeight: DEFAULT_BUTTON_HEIGHT,
            xSpacing: 10,
            ySpacing: 10,
            touchAreaXDilation: 5,
            touchAreaYDilation: 5,
            buttonColor: DEFAULT_BUTTON_COLOR,
            buttonFont: DEFAULT_BUTTON_FONT,
            accumulator: null,
            accumulatorOptions: null,
            tandem: Tandem.REQUIRED,
            tandemNameSuffix: 'Keypad',
            tagName: 'div',
            ariaLabel: 'Keypad',
            focusable: true,
            useGlobalKeyboardListener: false
        }, providedOptions);
        super();
        this.keyAccumulator = options.accumulator ? options.accumulator : new NumberAccumulator(merge({
            tandem: options.tandem.createTandem('numberAccumulator')
        }, options.accumulatorOptions));
        this.accumulatedKeysProperty = this.keyAccumulator.accumulatedKeysProperty;
        this.stringProperty = this.keyAccumulator.stringProperty;
        this.valueProperty = this.keyAccumulator.valueProperty;
        this.buttonNodes = [];
        // determine number of rows and columns from the input layout
        let numRows = layout.length;
        let numColumns = 0;
        for(let row = 0; row < numRows; row++){
            if (layout[row].length > numColumns) {
                numColumns = layout[row].length;
            }
        }
        // check last row to see if any button has vertical span more than 1
        let maxVerticalSpan = 1;
        for(let column = 0; column < layout[numRows - 1].length; column++){
            const key = layout[numRows - 1][column];
            if (key && key.verticalSpan > maxVerticalSpan) {
                maxVerticalSpan = key.verticalSpan;
            }
        }
        numRows += maxVerticalSpan - 1;
        // 2D grid to check for the overlap
        const occupiedLayoutGrid = [];
        for(let row = 0; row < numRows; row++){
            occupiedLayoutGrid[row] = [];
            for(let column = 0; column < numColumns; column++){
                occupiedLayoutGrid[row][column] = 0;
            }
        }
        const keyboardKeys = {};
        // interpret the layout specification
        for(let row = 0; row < layout.length; row++){
            const startRow = row;
            for(let column = 0; column < layout[row].length; column++){
                const key = layout[row][column];
                if (key) {
                    for(let i = 0; i < key.keyboardIdentifiers.length; i++){
                        const keyboardIdentifier = key.keyboardIdentifiers[i];
                        assert && assert(!keyboardKeys.hasOwnProperty(keyboardIdentifier), 'Keypad has already registered key for keyboard input: ' + keyboardIdentifier);
                        keyboardKeys[keyboardIdentifier] = key;
                    }
                    const keyBefore = layout[row][column - 1];
                    const startColumn = column + (column > 0 && keyBefore ? keyBefore.horizontalSpan - 1 : 0);
                    const verticalSpan = key.verticalSpan;
                    const horizontalSpan = key.horizontalSpan;
                    // check for overlap between the buttons
                    for(let x = startRow; x < startRow + verticalSpan; x++){
                        for(let y = startColumn; y < startColumn + horizontalSpan; y++){
                            assert && assert(!occupiedLayoutGrid[x][y], 'keys overlap in the layout');
                            occupiedLayoutGrid[x][y] = true;
                        }
                    }
                    // create and add the buttons
                    const buttonWidth = key.horizontalSpan * options.buttonWidth + (key.horizontalSpan - 1) * options.xSpacing;
                    const buttonHeight = key.verticalSpan * options.buttonHeight + (key.verticalSpan - 1) * options.ySpacing;
                    const buttonNode = createKeyNode(key, this.keyAccumulator, buttonWidth, buttonHeight, options.tandem, options);
                    buttonNode.left = startColumn * options.buttonWidth + startColumn * options.xSpacing;
                    buttonNode.top = startRow * options.buttonHeight + startRow * options.ySpacing;
                    this.buttonNodes.push(buttonNode);
                    this.addChild(buttonNode);
                }
            }
        }
        const keyboardListenerOptions = {
            // @ts-expect-error - TypeScript doesn't know that keyboardKeys has keys of type OneKeyStroke. Type assertion
            // works but is incompatible with eslint.
            keys: Object.keys(keyboardKeys),
            fire: (sceneryEvent, keysPressed)=>{
                const keyObject = keyboardKeys[keysPressed];
                this.keyAccumulator.handleKeyPressed(keyObject.identifier);
            }
        };
        let keyboardListener;
        if (options.useGlobalKeyboardListener) {
            keyboardListener = KeyboardListener.createGlobal(this, keyboardListenerOptions);
        } else {
            keyboardListener = new KeyboardListener(keyboardListenerOptions);
            this.addInputListener(keyboardListener);
        }
        this.disposeEmitter.addListener(()=>keyboardListener.dispose());
        this.stringProperty.link((string)=>{
            this.innerContent = string; // show current value in the PDOM
        });
        this.mutate(options);
    }
};
//------------------------------------------------------------------------------------------------------------------
// static keypad layouts - These can be used 'as is' for common layouts or serve as examples for creating custom
// layouts. If the vertical span is greater than 1, the column in the next row(s) has to be null.  If
// the horizontal span is greater than 1, the next key in that row will not overlap and will be placed in the next
// space in the grid. If a blank space is desired, null should be provided.
//------------------------------------------------------------------------------------------------------------------
Keypad.PositiveIntegerLayout = [
    [
        _7,
        _8,
        _9
    ],
    [
        _4,
        _5,
        _6
    ],
    [
        _1,
        _2,
        _3
    ],
    [
        WIDE_ZERO,
        BACKSPACE
    ]
];
Keypad.PositiveDecimalLayout = [
    [
        _7,
        _8,
        _9
    ],
    [
        _4,
        _5,
        _6
    ],
    [
        _1,
        _2,
        _3
    ],
    [
        DECIMAL,
        _0,
        BACKSPACE
    ]
];
Keypad.PositiveAndNegativeIntegerLayout = [
    [
        _7,
        _8,
        _9
    ],
    [
        _4,
        _5,
        _6
    ],
    [
        _1,
        _2,
        _3
    ],
    [
        BACKSPACE,
        _0,
        PLUS_MINUS
    ]
];
Keypad.PositiveFloatingPointLayout = [
    [
        _7,
        _8,
        _9
    ],
    [
        _4,
        _5,
        _6
    ],
    [
        _1,
        _2,
        _3
    ],
    [
        DECIMAL,
        _0,
        BACKSPACE
    ]
];
Keypad.PositiveAndNegativeFloatingPointLayout = [
    [
        _7,
        _8,
        _9
    ],
    [
        _4,
        _5,
        _6
    ],
    [
        _1,
        _2,
        _3
    ],
    [
        WIDE_ZERO,
        PLUS_MINUS
    ],
    [
        DECIMAL,
        null,
        BACKSPACE
    ]
];
// Weird Layout is created for testing purposes to test the edge cases and layout capabilities
Keypad.WeirdLayout = [
    [
        new Key('1', KeyID.ONE),
        new Key('2', KeyID.TWO),
        new Key('3', KeyID.THREE, {
            horizontalSpan: 3
        })
    ],
    [
        null,
        new Key('4', KeyID.FOUR, {
            horizontalSpan: 5
        })
    ],
    [
        new Key('5', KeyID.FIVE, {
            verticalSpan: 2
        }),
        new Key('6', KeyID.SIX),
        new Key('7', KeyID.SEVEN)
    ],
    [
        null,
        new Key('8', KeyID.EIGHT),
        new Key('9', KeyID.NINE)
    ],
    [
        null,
        new Key('0', KeyID.ZERO, {
            horizontalSpan: 2,
            verticalSpan: 2
        })
    ]
];
Keypad.KEY_0 = _0;
Keypad.KEY_1 = _1;
Keypad.KEY_2 = _2;
Keypad.KEY_3 = _3;
Keypad.KEY_4 = _4;
Keypad.KEY_5 = _5;
Keypad.KEY_6 = _6;
Keypad.KEY_7 = _7;
Keypad.KEY_8 = _8;
Keypad.KEY_9 = _9;
Keypad.KEY_WIDE_ZERO = WIDE_ZERO;
Keypad.KEY_DECIMAL = DECIMAL;
Keypad.KEY_BACKSPACE = BACKSPACE;
Keypad.KEY_PLUS_MINUS = PLUS_MINUS;
/**
 * Helper function to create the display key node for the provided key object
 */ function createKeyNode(keyObject, keyAccumulator, width, height, keyPadTandem, options) {
    // Wrapping the keyObject's label so that we're not DAG'ing this badly and causing infinite loops
    const content = keyObject.label instanceof Node ? new Node({
        children: [
            keyObject.label
        ]
    }) : new Text(keyObject.label, {
        font: options.buttonFont
    });
    const keyNode = new RectangularPushButton({
        content: content,
        baseColor: options.buttonColor,
        touchAreaXDilation: options.touchAreaXDilation,
        touchAreaYDilation: options.touchAreaYDilation,
        minWidth: width,
        minHeight: height,
        xMargin: 5,
        yMargin: 5,
        listener: ()=>keyAccumulator.handleKeyPressed(keyObject.identifier),
        // pdom
        // alt input is handled as a whole keypad, so remove these individual keys from the keypad if covered by the KeyboardListener.
        tagName: keyObject.keyboardIdentifiers.length === 0 ? 'button' : null,
        // phet-io
        tandem: keyPadTandem.createTandem(keyObject.buttonTandemName)
    });
    keyNode.dispose = function() {
        // Release the reference to the key
        content.dispose();
        RectangularPushButton.prototype.dispose.call(this);
    };
    keyNode.scale(width / keyNode.width, height / keyNode.height);
    return keyNode;
}
sceneryPhet.register('Keypad', Keypad);
export default Keypad;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9rZXlwYWQvS2V5cGFkLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE2LTIwMjQsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIEEgZmxleGlibGUga2V5cGFkIHRoYXQgbG9va3Mgc29tZXdoYXQgbGlrZSBhIGNhbGN1bGF0b3Igb3Iga2V5Ym9hcmQga2V5cGFkLlxuICpcbiAqIEBhdXRob3IgQWFkaXNoIEd1cHRhXG4gKiBAYXV0aG9yIEpvaG4gQmxhbmNvXG4gKi9cblxuaW1wb3J0IFJlYWRPbmx5UHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vYXhvbi9qcy9SZWFkT25seVByb3BlcnR5LmpzJztcbmltcG9ydCBtZXJnZSBmcm9tICcuLi8uLi8uLi9waGV0LWNvcmUvanMvbWVyZ2UuanMnO1xuaW1wb3J0IG9wdGlvbml6ZSBmcm9tICcuLi8uLi8uLi9waGV0LWNvcmUvanMvb3B0aW9uaXplLmpzJztcbmltcG9ydCBQaWNrUmVxdWlyZWQgZnJvbSAnLi4vLi4vLi4vcGhldC1jb3JlL2pzL3R5cGVzL1BpY2tSZXF1aXJlZC5qcyc7XG5pbXBvcnQgdHlwZSB7IEtleWJvYXJkTGlzdGVuZXJPcHRpb25zLCBPbmVLZXlTdHJva2UgfSBmcm9tICcuLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xuaW1wb3J0IHsgRm9udCwgS2V5Ym9hcmRMaXN0ZW5lciwgTm9kZSwgTm9kZU9wdGlvbnMsIFRleHQsIFRQYWludCB9IGZyb20gJy4uLy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XG5pbXBvcnQgUmVjdGFuZ3VsYXJQdXNoQnV0dG9uIGZyb20gJy4uLy4uLy4uL3N1bi9qcy9idXR0b25zL1JlY3Rhbmd1bGFyUHVzaEJ1dHRvbi5qcyc7XG5pbXBvcnQgVGFuZGVtIGZyb20gJy4uLy4uLy4uL3RhbmRlbS9qcy9UYW5kZW0uanMnO1xuaW1wb3J0IEJhY2tzcGFjZUljb24gZnJvbSAnLi4vQmFja3NwYWNlSWNvbi5qcyc7XG5pbXBvcnQgUGhldEZvbnQgZnJvbSAnLi4vUGhldEZvbnQuanMnO1xuaW1wb3J0IHNjZW5lcnlQaGV0IGZyb20gJy4uL3NjZW5lcnlQaGV0LmpzJztcbmltcG9ydCBBYnN0cmFjdEtleUFjY3VtdWxhdG9yIGZyb20gJy4vQWJzdHJhY3RLZXlBY2N1bXVsYXRvci5qcyc7XG5pbXBvcnQgS2V5IGZyb20gJy4vS2V5LmpzJztcbmltcG9ydCBLZXlJRCwgeyBLZXlJRFZhbHVlIH0gZnJvbSAnLi9LZXlJRC5qcyc7XG5pbXBvcnQgTnVtYmVyQWNjdW11bGF0b3IsIHsgTnVtYmVyQWNjdW11bGF0b3JPcHRpb25zIH0gZnJvbSAnLi9OdW1iZXJBY2N1bXVsYXRvci5qcyc7XG5cbi8vIGNvbnN0YW50c1xuY29uc3QgREVGQVVMVF9CVVRUT05fV0lEVEggPSAzNTtcbmNvbnN0IERFRkFVTFRfQlVUVE9OX0hFSUdIVCA9IDM1O1xuY29uc3QgREVGQVVMVF9CVVRUT05fRk9OVCA9IG5ldyBQaGV0Rm9udCggeyBzaXplOiAyMCB9ICk7XG5jb25zdCBERUZBVUxUX0JVVFRPTl9DT0xPUiA9ICd3aGl0ZSc7XG5jb25zdCBQTFVTX0NIQVIgPSAnXFx1MDAyYic7XG5jb25zdCBNSU5VU19DSEFSID0gJ1xcdTIyMTInO1xuY29uc3QgXzAgPSBuZXcgS2V5KCAnMCcsIEtleUlELlpFUk8sIHsga2V5Ym9hcmRJZGVudGlmaWVyczogWyAnMCcgXSB9ICk7XG5jb25zdCBfMSA9IG5ldyBLZXkoICcxJywgS2V5SUQuT05FLCB7IGtleWJvYXJkSWRlbnRpZmllcnM6IFsgJzEnIF0gfSApO1xuY29uc3QgXzIgPSBuZXcgS2V5KCAnMicsIEtleUlELlRXTywgeyBrZXlib2FyZElkZW50aWZpZXJzOiBbICcyJyBdIH0gKTtcbmNvbnN0IF8zID0gbmV3IEtleSggJzMnLCBLZXlJRC5USFJFRSwgeyBrZXlib2FyZElkZW50aWZpZXJzOiBbICczJyBdIH0gKTtcbmNvbnN0IF80ID0gbmV3IEtleSggJzQnLCBLZXlJRC5GT1VSLCB7IGtleWJvYXJkSWRlbnRpZmllcnM6IFsgJzQnIF0gfSApO1xuY29uc3QgXzUgPSBuZXcgS2V5KCAnNScsIEtleUlELkZJVkUsIHsga2V5Ym9hcmRJZGVudGlmaWVyczogWyAnNScgXSB9ICk7XG5jb25zdCBfNiA9IG5ldyBLZXkoICc2JywgS2V5SUQuU0lYLCB7IGtleWJvYXJkSWRlbnRpZmllcnM6IFsgJzYnIF0gfSApO1xuY29uc3QgXzcgPSBuZXcgS2V5KCAnNycsIEtleUlELlNFVkVOLCB7IGtleWJvYXJkSWRlbnRpZmllcnM6IFsgJzcnIF0gfSApO1xuY29uc3QgXzggPSBuZXcgS2V5KCAnOCcsIEtleUlELkVJR0hULCB7IGtleWJvYXJkSWRlbnRpZmllcnM6IFsgJzgnIF0gfSApO1xuY29uc3QgXzkgPSBuZXcgS2V5KCAnOScsIEtleUlELk5JTkUsIHsga2V5Ym9hcmRJZGVudGlmaWVyczogWyAnOScgXSB9ICk7XG5jb25zdCBXSURFX1pFUk8gPSBuZXcgS2V5KCAnMCcsIEtleUlELlpFUk8sIHsgaG9yaXpvbnRhbFNwYW46IDIsIGtleWJvYXJkSWRlbnRpZmllcnM6IFsgJzAnIF0gfSApO1xuY29uc3QgREVDSU1BTCA9IG5ldyBLZXkoICcuJywgS2V5SUQuREVDSU1BTCwgeyBrZXlib2FyZElkZW50aWZpZXJzOiBbICdwZXJpb2QnIF0gfSApO1xuY29uc3QgQkFDS1NQQUNFID0gbmV3IEtleSggKCBuZXcgQmFja3NwYWNlSWNvbiggeyBzY2FsZTogMS41IH0gKSApLFxuICBLZXlJRC5CQUNLU1BBQ0UsIHsga2V5Ym9hcmRJZGVudGlmaWVyczogWyAnYmFja3NwYWNlJyBdIH0gKTtcbmNvbnN0IFBMVVNfTUlOVVMgPSBuZXcgS2V5KCBgJHtQTFVTX0NIQVJ9LyR7TUlOVVNfQ0hBUn1gLCBLZXlJRC5QTFVTX01JTlVTLCB7XG4gIGtleWJvYXJkSWRlbnRpZmllcnM6IFsgJ21pbnVzJywgJ3BsdXMnIF1cbn0gKTtcblxuZXhwb3J0IHR5cGUgS2V5cGFkTGF5b3V0ID0gKCBLZXkgfCBudWxsIClbXVtdO1xuXG50eXBlIFNlbGZPcHRpb25zID0ge1xuICBidXR0b25XaWR0aD86IG51bWJlcjtcbiAgYnV0dG9uSGVpZ2h0PzogbnVtYmVyO1xuICB4U3BhY2luZz86IG51bWJlcjtcbiAgeVNwYWNpbmc/OiBudW1iZXI7XG4gIHRvdWNoQXJlYVhEaWxhdGlvbj86IG51bWJlcjtcbiAgdG91Y2hBcmVhWURpbGF0aW9uPzogbnVtYmVyO1xuICBidXR0b25Db2xvcj86IFRQYWludDtcbiAgYnV0dG9uRm9udD86IEZvbnQ7XG5cbiAgLy8gQWNjdW11bGF0b3IgdGhhdCBjb2xsZWN0cyBhbmQgaW50ZXJwcmV0cyBrZXkgcHJlc3Nlcywgc2VlIHZhcmlvdXMgaW1wbGVtZW50YXRpb25zIGZvciBleGFtcGxlcy4gSWYgcHJvdmlkZWQsIHRoaXNcbiAgLy8gd2lsbCBiZSBkaXNwb3NlZCB3aXRoIHRoaXMgS2V5cGFkXG4gIGFjY3VtdWxhdG9yPzogQWJzdHJhY3RLZXlBY2N1bXVsYXRvciB8IG51bGw7XG5cbiAgLy8gT3B0aW9ucyBwYXNzZWQgdG8gTnVtYmVyQWNjdW11bGF0b3IsIGlnbm9yZWQgaWYgb3B0aW9ucy5hY2N1bXVsYXRvciBpcyBwcm92aWRlZFxuICBhY2N1bXVsYXRvck9wdGlvbnM/OiBOdW1iZXJBY2N1bXVsYXRvck9wdGlvbnMgfCBudWxsO1xuXG4gIC8vIElmIHRydWUsIHRoZSBLZXlib2FyZExpc3RlbmVyIGZvciB0aGlzIEtleVBhZCB3aWxsIGJlIFwiZ2xvYmFsXCIgYW5kIGtleSBwcmVzc2VzIHdpbGwgY29udHJvbCB0aGUgS2V5cGFkIHJlZ2FyZGxlc3NcbiAgLy8gb2Ygd2hlcmUgZm9jdXMgaXMgaW4gdGhlIGRvY3VtZW50LiBPbmx5IGhhdmUgb25lIEtleXBhZCBhdCBhIHRpbWUgdGhhdCBjYW4gcmVjZWl2ZSBnbG9iYWwga2V5Ym9hcmQgaW5wdXRcbiAgLy8gKGFuIGFzc2VydGlvbiB3aWxsIGJlIHRocm93bikuXG4gIHVzZUdsb2JhbEtleWJvYXJkTGlzdGVuZXI/OiBib29sZWFuO1xufTtcblxuZXhwb3J0IHR5cGUgS2V5cGFkT3B0aW9ucyA9IFNlbGZPcHRpb25zICYgTm9kZU9wdGlvbnM7XG50eXBlIEtleWJvYXJkS2V5cyA9IFBhcnRpYWw8UmVjb3JkPE9uZUtleVN0cm9rZSwgS2V5Pj47XG5cbmNsYXNzIEtleXBhZCBleHRlbmRzIE5vZGUge1xuXG4gIHByaXZhdGUgcmVhZG9ubHkga2V5QWNjdW11bGF0b3I6IEFic3RyYWN0S2V5QWNjdW11bGF0b3I7XG5cbiAgLy8gYXJyYXkgb2YgdGhlIGtleXMgdGhhdCBoYXZlIGJlZW4gYWNjdW11bGF0ZWRcbiAgcHVibGljIHJlYWRvbmx5IGFjY3VtdWxhdGVkS2V5c1Byb3BlcnR5OiBSZWFkT25seVByb3BlcnR5PEtleUlEVmFsdWVbXT47XG5cbiAgLy8gc3RyaW5nIHJlcHJlc2VudGF0aW9uIG9mIHRoZSBrZXlzIHRoYXQgaGF2ZSBiZWVuIGFjY3VtdWxhdGVkXG4gIHB1YmxpYyByZWFkb25seSBzdHJpbmdQcm9wZXJ0eTogUmVhZE9ubHlQcm9wZXJ0eTxzdHJpbmc+O1xuXG4gIC8vIG51bWVyaWMgcmVwcmVzZW50YXRpb24gb2YgdGhlIGtleXMgdGhhdCBoYXZlIGJlZW4gYWNjdW11bGF0ZWQsIG51bGwgaWYgbm8ga2V5cyBoYXZlIGJlZW4gYWNjdW11bGF0ZWRcbiAgcHVibGljIHJlYWRvbmx5IHZhbHVlUHJvcGVydHk6IFJlYWRPbmx5UHJvcGVydHk8bnVtYmVyIHwgbnVsbD47XG5cbiAgcHJpdmF0ZSByZWFkb25seSBidXR0b25Ob2RlczogUmVjdGFuZ3VsYXJQdXNoQnV0dG9uW107XG5cbiAgLyoqXG4gICAqIEBwYXJhbSBsYXlvdXQgLSBhbiBhcnJheSB0aGF0IHNwZWNpZmllcyB0aGUga2V5cyBhbmQgdGhlIGxheW91dCwgc2VlIHN0YXRpYyBpbnN0YW5jZSBiZWxvdyBmb3IgZXhhbXBsZSB1c2FnZVxuICAgKiBAcGFyYW0gW3Byb3ZpZGVkT3B0aW9uc11cbiAgICovXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggbGF5b3V0OiAoIEtleSB8IG51bGwgKVtdW10sIHByb3ZpZGVkT3B0aW9ucz86IEtleXBhZE9wdGlvbnMgKSB7XG5cbiAgICBjb25zdCBvcHRpb25zID0gb3B0aW9uaXplPEtleXBhZE9wdGlvbnMsIFNlbGZPcHRpb25zLCBOb2RlT3B0aW9ucz4oKSgge1xuICAgICAgYnV0dG9uV2lkdGg6IERFRkFVTFRfQlVUVE9OX1dJRFRILFxuICAgICAgYnV0dG9uSGVpZ2h0OiBERUZBVUxUX0JVVFRPTl9IRUlHSFQsXG4gICAgICB4U3BhY2luZzogMTAsXG4gICAgICB5U3BhY2luZzogMTAsXG4gICAgICB0b3VjaEFyZWFYRGlsYXRpb246IDUsXG4gICAgICB0b3VjaEFyZWFZRGlsYXRpb246IDUsXG4gICAgICBidXR0b25Db2xvcjogREVGQVVMVF9CVVRUT05fQ09MT1IsXG4gICAgICBidXR0b25Gb250OiBERUZBVUxUX0JVVFRPTl9GT05ULFxuICAgICAgYWNjdW11bGF0b3I6IG51bGwsXG4gICAgICBhY2N1bXVsYXRvck9wdGlvbnM6IG51bGwsXG4gICAgICB0YW5kZW06IFRhbmRlbS5SRVFVSVJFRCxcbiAgICAgIHRhbmRlbU5hbWVTdWZmaXg6ICdLZXlwYWQnLFxuICAgICAgdGFnTmFtZTogJ2RpdicsXG4gICAgICBhcmlhTGFiZWw6ICdLZXlwYWQnLFxuICAgICAgZm9jdXNhYmxlOiB0cnVlLFxuICAgICAgdXNlR2xvYmFsS2V5Ym9hcmRMaXN0ZW5lcjogZmFsc2VcbiAgICB9LCBwcm92aWRlZE9wdGlvbnMgKTtcblxuICAgIHN1cGVyKCk7XG5cbiAgICB0aGlzLmtleUFjY3VtdWxhdG9yID0gb3B0aW9ucy5hY2N1bXVsYXRvciA/IG9wdGlvbnMuYWNjdW11bGF0b3IgOiBuZXcgTnVtYmVyQWNjdW11bGF0b3IoIG1lcmdlKCB7XG4gICAgICB0YW5kZW06IG9wdGlvbnMudGFuZGVtLmNyZWF0ZVRhbmRlbSggJ251bWJlckFjY3VtdWxhdG9yJyApXG4gICAgfSwgb3B0aW9ucy5hY2N1bXVsYXRvck9wdGlvbnMgKSApO1xuXG4gICAgdGhpcy5hY2N1bXVsYXRlZEtleXNQcm9wZXJ0eSA9IHRoaXMua2V5QWNjdW11bGF0b3IuYWNjdW11bGF0ZWRLZXlzUHJvcGVydHk7XG4gICAgdGhpcy5zdHJpbmdQcm9wZXJ0eSA9IHRoaXMua2V5QWNjdW11bGF0b3Iuc3RyaW5nUHJvcGVydHk7XG4gICAgdGhpcy52YWx1ZVByb3BlcnR5ID0gdGhpcy5rZXlBY2N1bXVsYXRvci52YWx1ZVByb3BlcnR5O1xuXG4gICAgdGhpcy5idXR0b25Ob2RlcyA9IFtdO1xuXG4gICAgLy8gZGV0ZXJtaW5lIG51bWJlciBvZiByb3dzIGFuZCBjb2x1bW5zIGZyb20gdGhlIGlucHV0IGxheW91dFxuICAgIGxldCBudW1Sb3dzID0gbGF5b3V0Lmxlbmd0aDtcbiAgICBsZXQgbnVtQ29sdW1ucyA9IDA7XG5cbiAgICBmb3IgKCBsZXQgcm93ID0gMDsgcm93IDwgbnVtUm93czsgcm93KysgKSB7XG4gICAgICBpZiAoIGxheW91dFsgcm93IF0ubGVuZ3RoID4gbnVtQ29sdW1ucyApIHtcbiAgICAgICAgbnVtQ29sdW1ucyA9IGxheW91dFsgcm93IF0ubGVuZ3RoO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIGNoZWNrIGxhc3Qgcm93IHRvIHNlZSBpZiBhbnkgYnV0dG9uIGhhcyB2ZXJ0aWNhbCBzcGFuIG1vcmUgdGhhbiAxXG4gICAgbGV0IG1heFZlcnRpY2FsU3BhbiA9IDE7XG4gICAgZm9yICggbGV0IGNvbHVtbiA9IDA7IGNvbHVtbiA8IGxheW91dFsgbnVtUm93cyAtIDEgXS5sZW5ndGg7IGNvbHVtbisrICkge1xuICAgICAgY29uc3Qga2V5ID0gbGF5b3V0WyBudW1Sb3dzIC0gMSBdWyBjb2x1bW4gXTtcblxuICAgICAgaWYgKCBrZXkgJiYga2V5LnZlcnRpY2FsU3BhbiA+IG1heFZlcnRpY2FsU3BhbiApIHtcbiAgICAgICAgbWF4VmVydGljYWxTcGFuID0ga2V5LnZlcnRpY2FsU3BhbjtcbiAgICAgIH1cbiAgICB9XG4gICAgbnVtUm93cyArPSBtYXhWZXJ0aWNhbFNwYW4gLSAxO1xuXG4gICAgLy8gMkQgZ3JpZCB0byBjaGVjayBmb3IgdGhlIG92ZXJsYXBcbiAgICBjb25zdCBvY2N1cGllZExheW91dEdyaWQ6ICggYm9vbGVhbiB8IG51bWJlciApW11bXSA9IFtdO1xuXG4gICAgZm9yICggbGV0IHJvdyA9IDA7IHJvdyA8IG51bVJvd3M7IHJvdysrICkge1xuICAgICAgb2NjdXBpZWRMYXlvdXRHcmlkWyByb3cgXSA9IFtdO1xuICAgICAgZm9yICggbGV0IGNvbHVtbiA9IDA7IGNvbHVtbiA8IG51bUNvbHVtbnM7IGNvbHVtbisrICkge1xuICAgICAgICBvY2N1cGllZExheW91dEdyaWRbIHJvdyBdWyBjb2x1bW4gXSA9IDA7XG4gICAgICB9XG4gICAgfVxuXG4gICAgY29uc3Qga2V5Ym9hcmRLZXlzOiBLZXlib2FyZEtleXMgPSB7fTtcblxuICAgIC8vIGludGVycHJldCB0aGUgbGF5b3V0IHNwZWNpZmljYXRpb25cbiAgICBmb3IgKCBsZXQgcm93ID0gMDsgcm93IDwgbGF5b3V0Lmxlbmd0aDsgcm93KysgKSB7XG4gICAgICBjb25zdCBzdGFydFJvdyA9IHJvdztcbiAgICAgIGZvciAoIGxldCBjb2x1bW4gPSAwOyBjb2x1bW4gPCBsYXlvdXRbIHJvdyBdLmxlbmd0aDsgY29sdW1uKysgKSB7XG4gICAgICAgIGNvbnN0IGtleSA9IGxheW91dFsgcm93IF1bIGNvbHVtbiBdO1xuICAgICAgICBpZiAoIGtleSApIHtcbiAgICAgICAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBrZXkua2V5Ym9hcmRJZGVudGlmaWVycy5sZW5ndGg7IGkrKyApIHtcbiAgICAgICAgICAgIGNvbnN0IGtleWJvYXJkSWRlbnRpZmllciA9IGtleS5rZXlib2FyZElkZW50aWZpZXJzWyBpIF07XG4gICAgICAgICAgICBhc3NlcnQgJiYgYXNzZXJ0KCAha2V5Ym9hcmRLZXlzLmhhc093blByb3BlcnR5KCBrZXlib2FyZElkZW50aWZpZXIgKSwgJ0tleXBhZCBoYXMgYWxyZWFkeSByZWdpc3RlcmVkIGtleSBmb3Iga2V5Ym9hcmQgaW5wdXQ6ICcgKyBrZXlib2FyZElkZW50aWZpZXIgKTtcbiAgICAgICAgICAgIGtleWJvYXJkS2V5c1sga2V5Ym9hcmRJZGVudGlmaWVyIF0gPSBrZXk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgY29uc3Qga2V5QmVmb3JlID0gbGF5b3V0WyByb3cgXVsgY29sdW1uIC0gMSBdO1xuICAgICAgICAgIGNvbnN0IHN0YXJ0Q29sdW1uID0gY29sdW1uICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICggY29sdW1uID4gMCAmJiBrZXlCZWZvcmUgP1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBrZXlCZWZvcmUuaG9yaXpvbnRhbFNwYW4gLSAxIDogMCApO1xuICAgICAgICAgIGNvbnN0IHZlcnRpY2FsU3BhbiA9IGtleS52ZXJ0aWNhbFNwYW47XG4gICAgICAgICAgY29uc3QgaG9yaXpvbnRhbFNwYW4gPSBrZXkuaG9yaXpvbnRhbFNwYW47XG5cbiAgICAgICAgICAvLyBjaGVjayBmb3Igb3ZlcmxhcCBiZXR3ZWVuIHRoZSBidXR0b25zXG4gICAgICAgICAgZm9yICggbGV0IHggPSBzdGFydFJvdzsgeCA8ICggc3RhcnRSb3cgKyB2ZXJ0aWNhbFNwYW4gKTsgeCsrICkge1xuICAgICAgICAgICAgZm9yICggbGV0IHkgPSBzdGFydENvbHVtbjsgeSA8ICggc3RhcnRDb2x1bW4gKyBob3Jpem9udGFsU3BhbiApOyB5KysgKSB7XG4gICAgICAgICAgICAgIGFzc2VydCAmJiBhc3NlcnQoICFvY2N1cGllZExheW91dEdyaWRbIHggXVsgeSBdLCAna2V5cyBvdmVybGFwIGluIHRoZSBsYXlvdXQnICk7XG4gICAgICAgICAgICAgIG9jY3VwaWVkTGF5b3V0R3JpZFsgeCBdWyB5IF0gPSB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIGNyZWF0ZSBhbmQgYWRkIHRoZSBidXR0b25zXG4gICAgICAgICAgY29uc3QgYnV0dG9uV2lkdGggPSBrZXkuaG9yaXpvbnRhbFNwYW4gKiBvcHRpb25zLmJ1dHRvbldpZHRoICsgKCBrZXkuaG9yaXpvbnRhbFNwYW4gLSAxICkgKiBvcHRpb25zLnhTcGFjaW5nO1xuICAgICAgICAgIGNvbnN0IGJ1dHRvbkhlaWdodCA9IGtleS52ZXJ0aWNhbFNwYW4gKiBvcHRpb25zLmJ1dHRvbkhlaWdodCArICgga2V5LnZlcnRpY2FsU3BhbiAtIDEgKSAqIG9wdGlvbnMueVNwYWNpbmc7XG4gICAgICAgICAgY29uc3QgYnV0dG9uTm9kZSA9IGNyZWF0ZUtleU5vZGUoIGtleSwgdGhpcy5rZXlBY2N1bXVsYXRvciwgYnV0dG9uV2lkdGgsIGJ1dHRvbkhlaWdodCwgb3B0aW9ucy50YW5kZW0sIG9wdGlvbnMgKTtcbiAgICAgICAgICBidXR0b25Ob2RlLmxlZnQgPSBzdGFydENvbHVtbiAqIG9wdGlvbnMuYnV0dG9uV2lkdGggKyBzdGFydENvbHVtbiAqIG9wdGlvbnMueFNwYWNpbmc7XG4gICAgICAgICAgYnV0dG9uTm9kZS50b3AgPSBzdGFydFJvdyAqIG9wdGlvbnMuYnV0dG9uSGVpZ2h0ICsgc3RhcnRSb3cgKiBvcHRpb25zLnlTcGFjaW5nO1xuICAgICAgICAgIHRoaXMuYnV0dG9uTm9kZXMucHVzaCggYnV0dG9uTm9kZSApO1xuICAgICAgICAgIHRoaXMuYWRkQ2hpbGQoIGJ1dHRvbk5vZGUgKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIGNvbnN0IGtleWJvYXJkTGlzdGVuZXJPcHRpb25zOiBLZXlib2FyZExpc3RlbmVyT3B0aW9uczxPbmVLZXlTdHJva2VbXT4gPSB7XG5cbiAgICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgLSBUeXBlU2NyaXB0IGRvZXNuJ3Qga25vdyB0aGF0IGtleWJvYXJkS2V5cyBoYXMga2V5cyBvZiB0eXBlIE9uZUtleVN0cm9rZS4gVHlwZSBhc3NlcnRpb25cbiAgICAgIC8vIHdvcmtzIGJ1dCBpcyBpbmNvbXBhdGlibGUgd2l0aCBlc2xpbnQuXG4gICAgICBrZXlzOiBPYmplY3Qua2V5cygga2V5Ym9hcmRLZXlzICksXG4gICAgICBmaXJlOiAoIHNjZW5lcnlFdmVudCwga2V5c1ByZXNzZWQgKSA9PiB7XG4gICAgICAgIGNvbnN0IGtleU9iamVjdCA9IGtleWJvYXJkS2V5c1sga2V5c1ByZXNzZWQgXTtcbiAgICAgICAgdGhpcy5rZXlBY2N1bXVsYXRvci5oYW5kbGVLZXlQcmVzc2VkKCBrZXlPYmplY3QhLmlkZW50aWZpZXIgKTtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgbGV0IGtleWJvYXJkTGlzdGVuZXI6IEtleWJvYXJkTGlzdGVuZXI8T25lS2V5U3Ryb2tlW10+O1xuICAgIGlmICggb3B0aW9ucy51c2VHbG9iYWxLZXlib2FyZExpc3RlbmVyICkge1xuICAgICAga2V5Ym9hcmRMaXN0ZW5lciA9IEtleWJvYXJkTGlzdGVuZXIuY3JlYXRlR2xvYmFsKCB0aGlzLCBrZXlib2FyZExpc3RlbmVyT3B0aW9ucyApO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIGtleWJvYXJkTGlzdGVuZXIgPSBuZXcgS2V5Ym9hcmRMaXN0ZW5lcigga2V5Ym9hcmRMaXN0ZW5lck9wdGlvbnMgKTtcbiAgICAgIHRoaXMuYWRkSW5wdXRMaXN0ZW5lcigga2V5Ym9hcmRMaXN0ZW5lciApO1xuICAgIH1cblxuICAgIHRoaXMuZGlzcG9zZUVtaXR0ZXIuYWRkTGlzdGVuZXIoICgpID0+IGtleWJvYXJkTGlzdGVuZXIuZGlzcG9zZSgpICk7XG5cbiAgICB0aGlzLnN0cmluZ1Byb3BlcnR5LmxpbmsoIHN0cmluZyA9PiB7XG4gICAgICB0aGlzLmlubmVyQ29udGVudCA9IHN0cmluZzsgLy8gc2hvdyBjdXJyZW50IHZhbHVlIGluIHRoZSBQRE9NXG4gICAgfSApO1xuXG4gICAgdGhpcy5tdXRhdGUoIG9wdGlvbnMgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDYWxscyB0aGUgY2xlYXIgZnVuY3Rpb24gZm9yIHRoZSBnaXZlbiBhY2N1bXVsYXRvclxuICAgKi9cbiAgcHVibGljIGNsZWFyKCk6IHZvaWQge1xuICAgIHRoaXMua2V5QWNjdW11bGF0b3IuY2xlYXIoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBEZXRlcm1pbmVzIHdoZXRoZXIgcHJlc3NpbmcgYSBrZXkgKGV4Y2VwdCBmb3IgYmFja3NwYWNlKSB3aWxsIGNsZWFyIHRoZSBleGlzdGluZyB2YWx1ZS5cbiAgICovXG4gIHB1YmxpYyBzZXRDbGVhck9uTmV4dEtleVByZXNzKCBjbGVhck9uTmV4dEtleVByZXNzOiBib29sZWFuICk6IHZvaWQge1xuICAgIHRoaXMua2V5QWNjdW11bGF0b3Iuc2V0Q2xlYXJPbk5leHRLZXlQcmVzcyggY2xlYXJPbk5leHRLZXlQcmVzcyApO1xuICB9XG5cbiAgLyoqXG4gICAqIFdpbGwgcHJlc3NpbmcgYSBrZXkgKGV4Y2VwdCBmb3IgYmFja3NwYWNlKSBjbGVhciB0aGUgZXhpc3RpbmcgdmFsdWU/XG4gICAqL1xuICBwdWJsaWMgZ2V0Q2xlYXJPbk5leHRLZXlQcmVzcygpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5rZXlBY2N1bXVsYXRvci5nZXRDbGVhck9uTmV4dEtleVByZXNzKCk7XG4gIH1cblxuICBwdWJsaWMgb3ZlcnJpZGUgZGlzcG9zZSgpOiB2b2lkIHtcbiAgICB0aGlzLmtleUFjY3VtdWxhdG9yLmRpc3Bvc2UoKTtcbiAgICB0aGlzLmJ1dHRvbk5vZGVzLmZvckVhY2goIGJ1dHRvbk5vZGUgPT4gYnV0dG9uTm9kZS5kaXNwb3NlKCkgKTtcbiAgICBzdXBlci5kaXNwb3NlKCk7XG4gIH1cblxuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAvLyBzdGF0aWMga2V5cGFkIGxheW91dHMgLSBUaGVzZSBjYW4gYmUgdXNlZCAnYXMgaXMnIGZvciBjb21tb24gbGF5b3V0cyBvciBzZXJ2ZSBhcyBleGFtcGxlcyBmb3IgY3JlYXRpbmcgY3VzdG9tXG4gIC8vIGxheW91dHMuIElmIHRoZSB2ZXJ0aWNhbCBzcGFuIGlzIGdyZWF0ZXIgdGhhbiAxLCB0aGUgY29sdW1uIGluIHRoZSBuZXh0IHJvdyhzKSBoYXMgdG8gYmUgbnVsbC4gIElmXG4gIC8vIHRoZSBob3Jpem9udGFsIHNwYW4gaXMgZ3JlYXRlciB0aGFuIDEsIHRoZSBuZXh0IGtleSBpbiB0aGF0IHJvdyB3aWxsIG5vdCBvdmVybGFwIGFuZCB3aWxsIGJlIHBsYWNlZCBpbiB0aGUgbmV4dFxuICAvLyBzcGFjZSBpbiB0aGUgZ3JpZC4gSWYgYSBibGFuayBzcGFjZSBpcyBkZXNpcmVkLCBudWxsIHNob3VsZCBiZSBwcm92aWRlZC5cbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICBwdWJsaWMgc3RhdGljIHJlYWRvbmx5IFBvc2l0aXZlSW50ZWdlckxheW91dDogS2V5cGFkTGF5b3V0ID0gW1xuICAgIFsgXzcsIF84LCBfOSBdLFxuICAgIFsgXzQsIF81LCBfNiBdLFxuICAgIFsgXzEsIF8yLCBfMyBdLFxuICAgIFsgV0lERV9aRVJPLCBCQUNLU1BBQ0UgXVxuICBdO1xuXG4gIHB1YmxpYyBzdGF0aWMgcmVhZG9ubHkgUG9zaXRpdmVEZWNpbWFsTGF5b3V0OiBLZXlwYWRMYXlvdXQgPSBbXG4gICAgWyBfNywgXzgsIF85IF0sXG4gICAgWyBfNCwgXzUsIF82IF0sXG4gICAgWyBfMSwgXzIsIF8zIF0sXG4gICAgWyBERUNJTUFMLCBfMCwgQkFDS1NQQUNFIF1cbiAgXTtcblxuICBwdWJsaWMgc3RhdGljIHJlYWRvbmx5IFBvc2l0aXZlQW5kTmVnYXRpdmVJbnRlZ2VyTGF5b3V0OiBLZXlwYWRMYXlvdXQgPSBbXG4gICAgWyBfNywgXzgsIF85IF0sXG4gICAgWyBfNCwgXzUsIF82IF0sXG4gICAgWyBfMSwgXzIsIF8zIF0sXG4gICAgWyBCQUNLU1BBQ0UsIF8wLCBQTFVTX01JTlVTIF1cbiAgXTtcblxuICBwdWJsaWMgc3RhdGljIHJlYWRvbmx5IFBvc2l0aXZlRmxvYXRpbmdQb2ludExheW91dDogS2V5cGFkTGF5b3V0ID0gW1xuICAgIFsgXzcsIF84LCBfOSBdLFxuICAgIFsgXzQsIF81LCBfNiBdLFxuICAgIFsgXzEsIF8yLCBfMyBdLFxuICAgIFsgREVDSU1BTCwgXzAsIEJBQ0tTUEFDRSBdXG4gIF07XG5cbiAgcHVibGljIHN0YXRpYyByZWFkb25seSBQb3NpdGl2ZUFuZE5lZ2F0aXZlRmxvYXRpbmdQb2ludExheW91dDogS2V5cGFkTGF5b3V0ID0gW1xuICAgIFsgXzcsIF84LCBfOSBdLFxuICAgIFsgXzQsIF81LCBfNiBdLFxuICAgIFsgXzEsIF8yLCBfMyBdLFxuICAgIFsgV0lERV9aRVJPLCBQTFVTX01JTlVTIF0sXG4gICAgWyBERUNJTUFMLCBudWxsLCBCQUNLU1BBQ0UgXVxuICBdO1xuXG4gIC8vIFdlaXJkIExheW91dCBpcyBjcmVhdGVkIGZvciB0ZXN0aW5nIHB1cnBvc2VzIHRvIHRlc3QgdGhlIGVkZ2UgY2FzZXMgYW5kIGxheW91dCBjYXBhYmlsaXRpZXNcbiAgcHVibGljIHN0YXRpYyByZWFkb25seSBXZWlyZExheW91dDogS2V5cGFkTGF5b3V0ID0gW1xuICAgIFsgbmV3IEtleSggJzEnLCBLZXlJRC5PTkUgKSwgbmV3IEtleSggJzInLCBLZXlJRC5UV08gKSwgbmV3IEtleSggJzMnLCBLZXlJRC5USFJFRSwgeyBob3Jpem9udGFsU3BhbjogMyB9ICkgXSxcbiAgICBbIG51bGwsIG5ldyBLZXkoICc0JywgS2V5SUQuRk9VUiwgeyBob3Jpem9udGFsU3BhbjogNSB9ICkgXSxcbiAgICBbIG5ldyBLZXkoICc1JywgS2V5SUQuRklWRSwgeyB2ZXJ0aWNhbFNwYW46IDIgfSApLCBuZXcgS2V5KCAnNicsIEtleUlELlNJWCApLCBuZXcgS2V5KCAnNycsIEtleUlELlNFVkVOICkgXSxcbiAgICBbIG51bGwsIG5ldyBLZXkoICc4JywgS2V5SUQuRUlHSFQgKSwgbmV3IEtleSggJzknLCBLZXlJRC5OSU5FICkgXSxcbiAgICBbIG51bGwsIG5ldyBLZXkoICcwJywgS2V5SUQuWkVSTywgeyBob3Jpem9udGFsU3BhbjogMiwgdmVydGljYWxTcGFuOiAyIH0gKSBdXG4gIF07XG5cbiAgcHVibGljIHN0YXRpYyByZWFkb25seSBLRVlfMCA9IF8wO1xuICBwdWJsaWMgc3RhdGljIHJlYWRvbmx5IEtFWV8xID0gXzE7XG4gIHB1YmxpYyBzdGF0aWMgcmVhZG9ubHkgS0VZXzIgPSBfMjtcbiAgcHVibGljIHN0YXRpYyByZWFkb25seSBLRVlfMyA9IF8zO1xuICBwdWJsaWMgc3RhdGljIHJlYWRvbmx5IEtFWV80ID0gXzQ7XG4gIHB1YmxpYyBzdGF0aWMgcmVhZG9ubHkgS0VZXzUgPSBfNTtcbiAgcHVibGljIHN0YXRpYyByZWFkb25seSBLRVlfNiA9IF82O1xuICBwdWJsaWMgc3RhdGljIHJlYWRvbmx5IEtFWV83ID0gXzc7XG4gIHB1YmxpYyBzdGF0aWMgcmVhZG9ubHkgS0VZXzggPSBfODtcbiAgcHVibGljIHN0YXRpYyByZWFkb25seSBLRVlfOSA9IF85O1xuICBwdWJsaWMgc3RhdGljIHJlYWRvbmx5IEtFWV9XSURFX1pFUk8gPSBXSURFX1pFUk87XG4gIHB1YmxpYyBzdGF0aWMgcmVhZG9ubHkgS0VZX0RFQ0lNQUwgPSBERUNJTUFMO1xuICBwdWJsaWMgc3RhdGljIHJlYWRvbmx5IEtFWV9CQUNLU1BBQ0UgPSBCQUNLU1BBQ0U7XG4gIHB1YmxpYyBzdGF0aWMgcmVhZG9ubHkgS0VZX1BMVVNfTUlOVVMgPSBQTFVTX01JTlVTO1xufVxuXG4vKipcbiAqIEhlbHBlciBmdW5jdGlvbiB0byBjcmVhdGUgdGhlIGRpc3BsYXkga2V5IG5vZGUgZm9yIHRoZSBwcm92aWRlZCBrZXkgb2JqZWN0XG4gKi9cbmZ1bmN0aW9uIGNyZWF0ZUtleU5vZGUoXG4gIGtleU9iamVjdDogS2V5LFxuICBrZXlBY2N1bXVsYXRvcjogQWJzdHJhY3RLZXlBY2N1bXVsYXRvcixcbiAgd2lkdGg6IG51bWJlcixcbiAgaGVpZ2h0OiBudW1iZXIsXG4gIGtleVBhZFRhbmRlbTogVGFuZGVtLFxuICBvcHRpb25zOiBQaWNrUmVxdWlyZWQ8U2VsZk9wdGlvbnMsICdidXR0b25Db2xvcicgfCAnYnV0dG9uRm9udCcgfCAndG91Y2hBcmVhWERpbGF0aW9uJyB8ICd0b3VjaEFyZWFZRGlsYXRpb24nPlxuKTogUmVjdGFuZ3VsYXJQdXNoQnV0dG9uIHtcblxuICAvLyBXcmFwcGluZyB0aGUga2V5T2JqZWN0J3MgbGFiZWwgc28gdGhhdCB3ZSdyZSBub3QgREFHJ2luZyB0aGlzIGJhZGx5IGFuZCBjYXVzaW5nIGluZmluaXRlIGxvb3BzXG4gIGNvbnN0IGNvbnRlbnQgPSAoIGtleU9iamVjdC5sYWJlbCBpbnN0YW5jZW9mIE5vZGUgKSA/IG5ldyBOb2RlKCB7IGNoaWxkcmVuOiBbIGtleU9iamVjdC5sYWJlbCBdIH0gKSA6XG4gICAgICAgICAgICAgICAgICBuZXcgVGV4dCgga2V5T2JqZWN0LmxhYmVsLCB7IGZvbnQ6IG9wdGlvbnMuYnV0dG9uRm9udCB9ICk7XG5cbiAgY29uc3Qga2V5Tm9kZSA9IG5ldyBSZWN0YW5ndWxhclB1c2hCdXR0b24oIHtcbiAgICBjb250ZW50OiBjb250ZW50LFxuICAgIGJhc2VDb2xvcjogb3B0aW9ucy5idXR0b25Db2xvcixcbiAgICB0b3VjaEFyZWFYRGlsYXRpb246IG9wdGlvbnMudG91Y2hBcmVhWERpbGF0aW9uLFxuICAgIHRvdWNoQXJlYVlEaWxhdGlvbjogb3B0aW9ucy50b3VjaEFyZWFZRGlsYXRpb24sXG4gICAgbWluV2lkdGg6IHdpZHRoLFxuICAgIG1pbkhlaWdodDogaGVpZ2h0LFxuICAgIHhNYXJnaW46IDUsXG4gICAgeU1hcmdpbjogNSxcbiAgICBsaXN0ZW5lcjogKCkgPT4ga2V5QWNjdW11bGF0b3IuaGFuZGxlS2V5UHJlc3NlZCgga2V5T2JqZWN0LmlkZW50aWZpZXIgKSxcblxuICAgIC8vIHBkb21cbiAgICAvLyBhbHQgaW5wdXQgaXMgaGFuZGxlZCBhcyBhIHdob2xlIGtleXBhZCwgc28gcmVtb3ZlIHRoZXNlIGluZGl2aWR1YWwga2V5cyBmcm9tIHRoZSBrZXlwYWQgaWYgY292ZXJlZCBieSB0aGUgS2V5Ym9hcmRMaXN0ZW5lci5cbiAgICB0YWdOYW1lOiBrZXlPYmplY3Qua2V5Ym9hcmRJZGVudGlmaWVycy5sZW5ndGggPT09IDAgPyAnYnV0dG9uJyA6IG51bGwsIC8vIER1cGxpY2F0ZWQgdGFnTmFtZSB3aXRoIGBCdXR0b25Ob2RlYFxuXG4gICAgLy8gcGhldC1pb1xuICAgIHRhbmRlbToga2V5UGFkVGFuZGVtLmNyZWF0ZVRhbmRlbSgga2V5T2JqZWN0LmJ1dHRvblRhbmRlbU5hbWUgKVxuICB9ICk7XG4gIGtleU5vZGUuZGlzcG9zZSA9IGZ1bmN0aW9uKCkge1xuICAgIC8vIFJlbGVhc2UgdGhlIHJlZmVyZW5jZSB0byB0aGUga2V5XG4gICAgY29udGVudC5kaXNwb3NlKCk7XG5cbiAgICBSZWN0YW5ndWxhclB1c2hCdXR0b24ucHJvdG90eXBlLmRpc3Bvc2UuY2FsbCggdGhpcyApO1xuICB9O1xuICBrZXlOb2RlLnNjYWxlKCB3aWR0aCAvIGtleU5vZGUud2lkdGgsIGhlaWdodCAvIGtleU5vZGUuaGVpZ2h0ICk7XG4gIHJldHVybiBrZXlOb2RlO1xufVxuXG5zY2VuZXJ5UGhldC5yZWdpc3RlciggJ0tleXBhZCcsIEtleXBhZCApO1xuZXhwb3J0IGRlZmF1bHQgS2V5cGFkOyJdLCJuYW1lcyI6WyJtZXJnZSIsIm9wdGlvbml6ZSIsIktleWJvYXJkTGlzdGVuZXIiLCJOb2RlIiwiVGV4dCIsIlJlY3Rhbmd1bGFyUHVzaEJ1dHRvbiIsIlRhbmRlbSIsIkJhY2tzcGFjZUljb24iLCJQaGV0Rm9udCIsInNjZW5lcnlQaGV0IiwiS2V5IiwiS2V5SUQiLCJOdW1iZXJBY2N1bXVsYXRvciIsIkRFRkFVTFRfQlVUVE9OX1dJRFRIIiwiREVGQVVMVF9CVVRUT05fSEVJR0hUIiwiREVGQVVMVF9CVVRUT05fRk9OVCIsInNpemUiLCJERUZBVUxUX0JVVFRPTl9DT0xPUiIsIlBMVVNfQ0hBUiIsIk1JTlVTX0NIQVIiLCJfMCIsIlpFUk8iLCJrZXlib2FyZElkZW50aWZpZXJzIiwiXzEiLCJPTkUiLCJfMiIsIlRXTyIsIl8zIiwiVEhSRUUiLCJfNCIsIkZPVVIiLCJfNSIsIkZJVkUiLCJfNiIsIlNJWCIsIl83IiwiU0VWRU4iLCJfOCIsIkVJR0hUIiwiXzkiLCJOSU5FIiwiV0lERV9aRVJPIiwiaG9yaXpvbnRhbFNwYW4iLCJERUNJTUFMIiwiQkFDS1NQQUNFIiwic2NhbGUiLCJQTFVTX01JTlVTIiwiS2V5cGFkIiwiY2xlYXIiLCJrZXlBY2N1bXVsYXRvciIsInNldENsZWFyT25OZXh0S2V5UHJlc3MiLCJjbGVhck9uTmV4dEtleVByZXNzIiwiZ2V0Q2xlYXJPbk5leHRLZXlQcmVzcyIsImRpc3Bvc2UiLCJidXR0b25Ob2RlcyIsImZvckVhY2giLCJidXR0b25Ob2RlIiwibGF5b3V0IiwicHJvdmlkZWRPcHRpb25zIiwib3B0aW9ucyIsImJ1dHRvbldpZHRoIiwiYnV0dG9uSGVpZ2h0IiwieFNwYWNpbmciLCJ5U3BhY2luZyIsInRvdWNoQXJlYVhEaWxhdGlvbiIsInRvdWNoQXJlYVlEaWxhdGlvbiIsImJ1dHRvbkNvbG9yIiwiYnV0dG9uRm9udCIsImFjY3VtdWxhdG9yIiwiYWNjdW11bGF0b3JPcHRpb25zIiwidGFuZGVtIiwiUkVRVUlSRUQiLCJ0YW5kZW1OYW1lU3VmZml4IiwidGFnTmFtZSIsImFyaWFMYWJlbCIsImZvY3VzYWJsZSIsInVzZUdsb2JhbEtleWJvYXJkTGlzdGVuZXIiLCJjcmVhdGVUYW5kZW0iLCJhY2N1bXVsYXRlZEtleXNQcm9wZXJ0eSIsInN0cmluZ1Byb3BlcnR5IiwidmFsdWVQcm9wZXJ0eSIsIm51bVJvd3MiLCJsZW5ndGgiLCJudW1Db2x1bW5zIiwicm93IiwibWF4VmVydGljYWxTcGFuIiwiY29sdW1uIiwia2V5IiwidmVydGljYWxTcGFuIiwib2NjdXBpZWRMYXlvdXRHcmlkIiwia2V5Ym9hcmRLZXlzIiwic3RhcnRSb3ciLCJpIiwia2V5Ym9hcmRJZGVudGlmaWVyIiwiYXNzZXJ0IiwiaGFzT3duUHJvcGVydHkiLCJrZXlCZWZvcmUiLCJzdGFydENvbHVtbiIsIngiLCJ5IiwiY3JlYXRlS2V5Tm9kZSIsImxlZnQiLCJ0b3AiLCJwdXNoIiwiYWRkQ2hpbGQiLCJrZXlib2FyZExpc3RlbmVyT3B0aW9ucyIsImtleXMiLCJPYmplY3QiLCJmaXJlIiwic2NlbmVyeUV2ZW50Iiwia2V5c1ByZXNzZWQiLCJrZXlPYmplY3QiLCJoYW5kbGVLZXlQcmVzc2VkIiwiaWRlbnRpZmllciIsImtleWJvYXJkTGlzdGVuZXIiLCJjcmVhdGVHbG9iYWwiLCJhZGRJbnB1dExpc3RlbmVyIiwiZGlzcG9zZUVtaXR0ZXIiLCJhZGRMaXN0ZW5lciIsImxpbmsiLCJzdHJpbmciLCJpbm5lckNvbnRlbnQiLCJtdXRhdGUiLCJQb3NpdGl2ZUludGVnZXJMYXlvdXQiLCJQb3NpdGl2ZURlY2ltYWxMYXlvdXQiLCJQb3NpdGl2ZUFuZE5lZ2F0aXZlSW50ZWdlckxheW91dCIsIlBvc2l0aXZlRmxvYXRpbmdQb2ludExheW91dCIsIlBvc2l0aXZlQW5kTmVnYXRpdmVGbG9hdGluZ1BvaW50TGF5b3V0IiwiV2VpcmRMYXlvdXQiLCJLRVlfMCIsIktFWV8xIiwiS0VZXzIiLCJLRVlfMyIsIktFWV80IiwiS0VZXzUiLCJLRVlfNiIsIktFWV83IiwiS0VZXzgiLCJLRVlfOSIsIktFWV9XSURFX1pFUk8iLCJLRVlfREVDSU1BTCIsIktFWV9CQUNLU1BBQ0UiLCJLRVlfUExVU19NSU5VUyIsIndpZHRoIiwiaGVpZ2h0Iiwia2V5UGFkVGFuZGVtIiwiY29udGVudCIsImxhYmVsIiwiY2hpbGRyZW4iLCJmb250Iiwia2V5Tm9kZSIsImJhc2VDb2xvciIsIm1pbldpZHRoIiwibWluSGVpZ2h0IiwieE1hcmdpbiIsInlNYXJnaW4iLCJsaXN0ZW5lciIsImJ1dHRvblRhbmRlbU5hbWUiLCJwcm90b3R5cGUiLCJjYWxsIiwicmVnaXN0ZXIiXSwibWFwcGluZ3MiOiJBQUFBLHNEQUFzRDtBQUV0RDs7Ozs7Q0FLQyxHQUdELE9BQU9BLFdBQVcsaUNBQWlDO0FBQ25ELE9BQU9DLGVBQWUscUNBQXFDO0FBRzNELFNBQWVDLGdCQUFnQixFQUFFQyxJQUFJLEVBQWVDLElBQUksUUFBZ0IsaUNBQWlDO0FBQ3pHLE9BQU9DLDJCQUEyQixtREFBbUQ7QUFDckYsT0FBT0MsWUFBWSwrQkFBK0I7QUFDbEQsT0FBT0MsbUJBQW1CLHNCQUFzQjtBQUNoRCxPQUFPQyxjQUFjLGlCQUFpQjtBQUN0QyxPQUFPQyxpQkFBaUIsb0JBQW9CO0FBRTVDLE9BQU9DLFNBQVMsV0FBVztBQUMzQixPQUFPQyxXQUEyQixhQUFhO0FBQy9DLE9BQU9DLHVCQUFxRCx5QkFBeUI7QUFFckYsWUFBWTtBQUNaLE1BQU1DLHVCQUF1QjtBQUM3QixNQUFNQyx3QkFBd0I7QUFDOUIsTUFBTUMsc0JBQXNCLElBQUlQLFNBQVU7SUFBRVEsTUFBTTtBQUFHO0FBQ3JELE1BQU1DLHVCQUF1QjtBQUM3QixNQUFNQyxZQUFZO0FBQ2xCLE1BQU1DLGFBQWE7QUFDbkIsTUFBTUMsS0FBSyxJQUFJVixJQUFLLEtBQUtDLE1BQU1VLElBQUksRUFBRTtJQUFFQyxxQkFBcUI7UUFBRTtLQUFLO0FBQUM7QUFDcEUsTUFBTUMsS0FBSyxJQUFJYixJQUFLLEtBQUtDLE1BQU1hLEdBQUcsRUFBRTtJQUFFRixxQkFBcUI7UUFBRTtLQUFLO0FBQUM7QUFDbkUsTUFBTUcsS0FBSyxJQUFJZixJQUFLLEtBQUtDLE1BQU1lLEdBQUcsRUFBRTtJQUFFSixxQkFBcUI7UUFBRTtLQUFLO0FBQUM7QUFDbkUsTUFBTUssS0FBSyxJQUFJakIsSUFBSyxLQUFLQyxNQUFNaUIsS0FBSyxFQUFFO0lBQUVOLHFCQUFxQjtRQUFFO0tBQUs7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