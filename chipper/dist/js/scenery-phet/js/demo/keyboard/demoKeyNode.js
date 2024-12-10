// Copyright 2022-2024, University of Colorado Boulder
/**
 * Demo for KeyNode and its subtypes
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */ import { HBox, VBox } from '../../../../scenery/js/imports.js';
import ArrowKeyNode from '../../keyboard/ArrowKeyNode.js';
import LetterKeyNode from '../../keyboard/LetterKeyNode.js';
import TextKeyNode from '../../keyboard/TextKeyNode.js';
export default function demoKeyNode(layoutBounds) {
    // example letter keys, portion of a typical keyboard
    const topRowKeyStrings = [
        'Q',
        'W',
        'E',
        'R',
        'T',
        'Y',
        'U',
        'I',
        'O',
        'P',
        '[',
        ']',
        '\\'
    ];
    const middleRowKeyStrings = [
        'A',
        'S',
        'D',
        'F',
        'G',
        'H',
        'J',
        'K',
        'L',
        ':',
        '"'
    ];
    const bottomRowKeyStrings = [
        'Z',
        'X',
        'C',
        'V',
        'B',
        'N',
        'M',
        '\'',
        '.',
        '/'
    ];
    // arrays that hold key nodes for each row of a keyboard - each row starts with an additional multi-character key
    const topKeyNodes = [
        TextKeyNode.tab()
    ];
    const middleKeyNodes = [
        TextKeyNode.capsLock()
    ];
    const bottomKeyNodes = [
        TextKeyNode.shift()
    ];
    let i;
    for(i = 0; i < topRowKeyStrings.length; i++){
        topKeyNodes.push(new LetterKeyNode(topRowKeyStrings[i]));
    }
    for(i = 0; i < middleRowKeyStrings.length; i++){
        middleKeyNodes.push(new LetterKeyNode(middleRowKeyStrings[i]));
    }
    for(i = 0; i < bottomRowKeyStrings.length; i++){
        bottomKeyNodes.push(new LetterKeyNode(bottomRowKeyStrings[i]));
    }
    const topArrowKeyNode = new ArrowKeyNode('up');
    const bottomArrowKeyNodes = [
        new ArrowKeyNode('left'),
        new ArrowKeyNode('down'),
        new ArrowKeyNode('right')
    ];
    const bottomArrowKeyBox = new HBox({
        children: bottomArrowKeyNodes,
        spacing: 2
    });
    // add the enter and shift keys to the middle and bottom rows, shift key has extra width for alignment
    middleKeyNodes.push(TextKeyNode.enter());
    bottomKeyNodes.push(TextKeyNode.shift({
        xAlign: 'right',
        xMargin: 4,
        minKeyWidth: 70
    }));
    const topHBox = new HBox({
        children: topKeyNodes,
        spacing: 5
    });
    const middleHBox = new HBox({
        children: middleKeyNodes,
        spacing: 5
    });
    const bottomHBox = new HBox({
        children: bottomKeyNodes,
        spacing: 5
    });
    const arrowKeysVBox = new VBox({
        children: [
            topArrowKeyNode,
            bottomArrowKeyBox
        ],
        spacing: 1
    });
    return new VBox({
        children: [
            topHBox,
            middleHBox,
            bottomHBox,
            arrowKeysVBox
        ],
        center: layoutBounds.center,
        align: 'right',
        spacing: 3,
        scale: 1.5
    });
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9kZW1vL2tleWJvYXJkL2RlbW9LZXlOb2RlLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDIyLTIwMjQsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIERlbW8gZm9yIEtleU5vZGUgYW5kIGl0cyBzdWJ0eXBlc1xuICpcbiAqIEBhdXRob3IgQ2hyaXMgTWFsbGV5IChQaXhlbFpvb20sIEluYy4pXG4gKi9cblxuaW1wb3J0IEJvdW5kczIgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL0JvdW5kczIuanMnO1xuaW1wb3J0IHsgSEJveCwgTm9kZSwgVkJveCB9IGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XG5pbXBvcnQgQXJyb3dLZXlOb2RlIGZyb20gJy4uLy4uL2tleWJvYXJkL0Fycm93S2V5Tm9kZS5qcyc7XG5pbXBvcnQgTGV0dGVyS2V5Tm9kZSBmcm9tICcuLi8uLi9rZXlib2FyZC9MZXR0ZXJLZXlOb2RlLmpzJztcbmltcG9ydCBUZXh0S2V5Tm9kZSBmcm9tICcuLi8uLi9rZXlib2FyZC9UZXh0S2V5Tm9kZS5qcyc7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGRlbW9LZXlOb2RlKCBsYXlvdXRCb3VuZHM6IEJvdW5kczIgKTogTm9kZSB7XG5cbiAgLy8gZXhhbXBsZSBsZXR0ZXIga2V5cywgcG9ydGlvbiBvZiBhIHR5cGljYWwga2V5Ym9hcmRcbiAgY29uc3QgdG9wUm93S2V5U3RyaW5ncyA9IFsgJ1EnLCAnVycsICdFJywgJ1InLCAnVCcsICdZJywgJ1UnLCAnSScsICdPJywgJ1AnLCAnWycsICddJywgJ1xcXFwnIF07XG4gIGNvbnN0IG1pZGRsZVJvd0tleVN0cmluZ3MgPSBbICdBJywgJ1MnLCAnRCcsICdGJywgJ0cnLCAnSCcsICdKJywgJ0snLCAnTCcsICc6JywgJ1wiJyBdO1xuICBjb25zdCBib3R0b21Sb3dLZXlTdHJpbmdzID0gWyAnWicsICdYJywgJ0MnLCAnVicsICdCJywgJ04nLCAnTScsICdcXCcnLCAnLicsICcvJyBdO1xuXG4gIC8vIGFycmF5cyB0aGF0IGhvbGQga2V5IG5vZGVzIGZvciBlYWNoIHJvdyBvZiBhIGtleWJvYXJkIC0gZWFjaCByb3cgc3RhcnRzIHdpdGggYW4gYWRkaXRpb25hbCBtdWx0aS1jaGFyYWN0ZXIga2V5XG4gIGNvbnN0IHRvcEtleU5vZGVzID0gWyBUZXh0S2V5Tm9kZS50YWIoKSBdO1xuICBjb25zdCBtaWRkbGVLZXlOb2RlcyA9IFsgVGV4dEtleU5vZGUuY2Fwc0xvY2soKSBdO1xuICBjb25zdCBib3R0b21LZXlOb2RlcyA9IFsgVGV4dEtleU5vZGUuc2hpZnQoKSBdO1xuXG4gIGxldCBpO1xuICBmb3IgKCBpID0gMDsgaSA8IHRvcFJvd0tleVN0cmluZ3MubGVuZ3RoOyBpKysgKSB7XG4gICAgdG9wS2V5Tm9kZXMucHVzaCggbmV3IExldHRlcktleU5vZGUoIHRvcFJvd0tleVN0cmluZ3NbIGkgXSApICk7XG4gIH1cbiAgZm9yICggaSA9IDA7IGkgPCBtaWRkbGVSb3dLZXlTdHJpbmdzLmxlbmd0aDsgaSsrICkge1xuICAgIG1pZGRsZUtleU5vZGVzLnB1c2goIG5ldyBMZXR0ZXJLZXlOb2RlKCBtaWRkbGVSb3dLZXlTdHJpbmdzWyBpIF0gKSApO1xuICB9XG4gIGZvciAoIGkgPSAwOyBpIDwgYm90dG9tUm93S2V5U3RyaW5ncy5sZW5ndGg7IGkrKyApIHtcbiAgICBib3R0b21LZXlOb2Rlcy5wdXNoKCBuZXcgTGV0dGVyS2V5Tm9kZSggYm90dG9tUm93S2V5U3RyaW5nc1sgaSBdICkgKTtcbiAgfVxuICBjb25zdCB0b3BBcnJvd0tleU5vZGUgPSBuZXcgQXJyb3dLZXlOb2RlKCAndXAnICk7XG4gIGNvbnN0IGJvdHRvbUFycm93S2V5Tm9kZXMgPSBbIG5ldyBBcnJvd0tleU5vZGUoICdsZWZ0JyApLCBuZXcgQXJyb3dLZXlOb2RlKCAnZG93bicgKSwgbmV3IEFycm93S2V5Tm9kZSggJ3JpZ2h0JyApIF07XG4gIGNvbnN0IGJvdHRvbUFycm93S2V5Qm94ID0gbmV3IEhCb3goIHsgY2hpbGRyZW46IGJvdHRvbUFycm93S2V5Tm9kZXMsIHNwYWNpbmc6IDIgfSApO1xuXG4gIC8vIGFkZCB0aGUgZW50ZXIgYW5kIHNoaWZ0IGtleXMgdG8gdGhlIG1pZGRsZSBhbmQgYm90dG9tIHJvd3MsIHNoaWZ0IGtleSBoYXMgZXh0cmEgd2lkdGggZm9yIGFsaWdubWVudFxuICBtaWRkbGVLZXlOb2Rlcy5wdXNoKCBUZXh0S2V5Tm9kZS5lbnRlcigpICk7XG4gIGJvdHRvbUtleU5vZGVzLnB1c2goIFRleHRLZXlOb2RlLnNoaWZ0KCB7IHhBbGlnbjogJ3JpZ2h0JywgeE1hcmdpbjogNCwgbWluS2V5V2lkdGg6IDcwIH0gKSApO1xuXG4gIGNvbnN0IHRvcEhCb3ggPSBuZXcgSEJveCggeyBjaGlsZHJlbjogdG9wS2V5Tm9kZXMsIHNwYWNpbmc6IDUgfSApO1xuICBjb25zdCBtaWRkbGVIQm94ID0gbmV3IEhCb3goIHsgY2hpbGRyZW46IG1pZGRsZUtleU5vZGVzLCBzcGFjaW5nOiA1IH0gKTtcbiAgY29uc3QgYm90dG9tSEJveCA9IG5ldyBIQm94KCB7IGNoaWxkcmVuOiBib3R0b21LZXlOb2Rlcywgc3BhY2luZzogNSB9ICk7XG4gIGNvbnN0IGFycm93S2V5c1ZCb3ggPSBuZXcgVkJveCgge1xuICAgIGNoaWxkcmVuOiBbIHRvcEFycm93S2V5Tm9kZSwgYm90dG9tQXJyb3dLZXlCb3ggXSxcbiAgICBzcGFjaW5nOiAxXG4gIH0gKTtcblxuICByZXR1cm4gbmV3IFZCb3goIHtcbiAgICBjaGlsZHJlbjogWyB0b3BIQm94LCBtaWRkbGVIQm94LCBib3R0b21IQm94LCBhcnJvd0tleXNWQm94IF0sXG4gICAgY2VudGVyOiBsYXlvdXRCb3VuZHMuY2VudGVyLFxuICAgIGFsaWduOiAncmlnaHQnLFxuICAgIHNwYWNpbmc6IDMsXG4gICAgc2NhbGU6IDEuNVxuICB9ICk7XG59Il0sIm5hbWVzIjpbIkhCb3giLCJWQm94IiwiQXJyb3dLZXlOb2RlIiwiTGV0dGVyS2V5Tm9kZSIsIlRleHRLZXlOb2RlIiwiZGVtb0tleU5vZGUiLCJsYXlvdXRCb3VuZHMiLCJ0b3BSb3dLZXlTdHJpbmdzIiwibWlkZGxlUm93S2V5U3RyaW5ncyIsImJvdHRvbVJvd0tleVN0cmluZ3MiLCJ0b3BLZXlOb2RlcyIsInRhYiIsIm1pZGRsZUtleU5vZGVzIiwiY2Fwc0xvY2siLCJib3R0b21LZXlOb2RlcyIsInNoaWZ0IiwiaSIsImxlbmd0aCIsInB1c2giLCJ0b3BBcnJvd0tleU5vZGUiLCJib3R0b21BcnJvd0tleU5vZGVzIiwiYm90dG9tQXJyb3dLZXlCb3giLCJjaGlsZHJlbiIsInNwYWNpbmciLCJlbnRlciIsInhBbGlnbiIsInhNYXJnaW4iLCJtaW5LZXlXaWR0aCIsInRvcEhCb3giLCJtaWRkbGVIQm94IiwiYm90dG9tSEJveCIsImFycm93S2V5c1ZCb3giLCJjZW50ZXIiLCJhbGlnbiIsInNjYWxlIl0sIm1hcHBpbmdzIjoiQUFBQSxzREFBc0Q7QUFFdEQ7Ozs7Q0FJQyxHQUdELFNBQVNBLElBQUksRUFBUUMsSUFBSSxRQUFRLG9DQUFvQztBQUNyRSxPQUFPQyxrQkFBa0IsaUNBQWlDO0FBQzFELE9BQU9DLG1CQUFtQixrQ0FBa0M7QUFDNUQsT0FBT0MsaUJBQWlCLGdDQUFnQztBQUV4RCxlQUFlLFNBQVNDLFlBQWFDLFlBQXFCO0lBRXhELHFEQUFxRDtJQUNyRCxNQUFNQyxtQkFBbUI7UUFBRTtRQUFLO1FBQUs7UUFBSztRQUFLO1FBQUs7UUFBSztRQUFLO1FBQUs7UUFBSztRQUFLO1FBQUs7UUFBSztLQUFNO0lBQzdGLE1BQU1DLHNCQUFzQjtRQUFFO1FBQUs7UUFBSztRQUFLO1FBQUs7UUFBSztRQUFLO1FBQUs7UUFBSztRQUFLO1FBQUs7S0FBSztJQUNyRixNQUFNQyxzQkFBc0I7UUFBRTtRQUFLO1FBQUs7UUFBSztRQUFLO1FBQUs7UUFBSztRQUFLO1FBQU07UUFBSztLQUFLO0lBRWpGLGlIQUFpSDtJQUNqSCxNQUFNQyxjQUFjO1FBQUVOLFlBQVlPLEdBQUc7S0FBSTtJQUN6QyxNQUFNQyxpQkFBaUI7UUFBRVIsWUFBWVMsUUFBUTtLQUFJO0lBQ2pELE1BQU1DLGlCQUFpQjtRQUFFVixZQUFZVyxLQUFLO0tBQUk7SUFFOUMsSUFBSUM7SUFDSixJQUFNQSxJQUFJLEdBQUdBLElBQUlULGlCQUFpQlUsTUFBTSxFQUFFRCxJQUFNO1FBQzlDTixZQUFZUSxJQUFJLENBQUUsSUFBSWYsY0FBZUksZ0JBQWdCLENBQUVTLEVBQUc7SUFDNUQ7SUFDQSxJQUFNQSxJQUFJLEdBQUdBLElBQUlSLG9CQUFvQlMsTUFBTSxFQUFFRCxJQUFNO1FBQ2pESixlQUFlTSxJQUFJLENBQUUsSUFBSWYsY0FBZUssbUJBQW1CLENBQUVRLEVBQUc7SUFDbEU7SUFDQSxJQUFNQSxJQUFJLEdBQUdBLElBQUlQLG9CQUFvQlEsTUFBTSxFQUFFRCxJQUFNO1FBQ2pERixlQUFlSSxJQUFJLENBQUUsSUFBSWYsY0FBZU0sbUJBQW1CLENBQUVPLEVBQUc7SUFDbEU7SUFDQSxNQUFNRyxrQkFBa0IsSUFBSWpCLGFBQWM7SUFDMUMsTUFBTWtCLHNCQUFzQjtRQUFFLElBQUlsQixhQUFjO1FBQVUsSUFBSUEsYUFBYztRQUFVLElBQUlBLGFBQWM7S0FBVztJQUNuSCxNQUFNbUIsb0JBQW9CLElBQUlyQixLQUFNO1FBQUVzQixVQUFVRjtRQUFxQkcsU0FBUztJQUFFO0lBRWhGLHNHQUFzRztJQUN0R1gsZUFBZU0sSUFBSSxDQUFFZCxZQUFZb0IsS0FBSztJQUN0Q1YsZUFBZUksSUFBSSxDQUFFZCxZQUFZVyxLQUFLLENBQUU7UUFBRVUsUUFBUTtRQUFTQyxTQUFTO1FBQUdDLGFBQWE7SUFBRztJQUV2RixNQUFNQyxVQUFVLElBQUk1QixLQUFNO1FBQUVzQixVQUFVWjtRQUFhYSxTQUFTO0lBQUU7SUFDOUQsTUFBTU0sYUFBYSxJQUFJN0IsS0FBTTtRQUFFc0IsVUFBVVY7UUFBZ0JXLFNBQVM7SUFBRTtJQUNwRSxNQUFNTyxhQUFhLElBQUk5QixLQUFNO1FBQUVzQixVQUFVUjtRQUFnQlMsU0FBUztJQUFFO0lBQ3BFLE1BQU1RLGdCQUFnQixJQUFJOUIsS0FBTTtRQUM5QnFCLFVBQVU7WUFBRUg7WUFBaUJFO1NBQW1CO1FBQ2hERSxTQUFTO0lBQ1g7SUFFQSxPQUFPLElBQUl0QixLQUFNO1FBQ2ZxQixVQUFVO1lBQUVNO1lBQVNDO1lBQVlDO1lBQVlDO1NBQWU7UUFDNURDLFFBQVExQixhQUFhMEIsTUFBTTtRQUMzQkMsT0FBTztRQUNQVixTQUFTO1FBQ1RXLE9BQU87SUFDVDtBQUNGIn0=