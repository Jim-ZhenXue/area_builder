// Copyright 2022-2024, University of Colorado Boulder
/**
 * Demo for FaucetNode
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */ import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import Property from '../../../../axon/js/Property.js';
import Range from '../../../../dot/js/Range.js';
import Utils from '../../../../dot/js/Utils.js';
import { combineOptions } from '../../../../phet-core/js/optionize.js';
import { HBox, RichText, Text, VBox } from '../../../../scenery/js/imports.js';
import Checkbox from '../../../../sun/js/Checkbox.js';
import Panel from '../../../../sun/js/Panel.js';
import FaucetNode from '../../FaucetNode.js';
import PhetFont from '../../PhetFont.js';
const MAX_FLOW_RATE = 10;
const FAUCET_NODE_SCALE = 0.7;
const FONT = new PhetFont(14);
export default function demoFaucetNode(layoutBounds) {
    const docText = new RichText('Options:<br><br>' + '<b>tapToDispenseEnabled</b>: when true, tapping the shooter dispenses some fluid<br><br>' + '<b>closeOnRelease</b>: when true, releasing the shooter closes the faucet', {
        font: FONT
    });
    // A panel for each combination of tapToDispenseEnabled and closeOnRelease behavior, to facilitate a11y design
    // discussion in https://github.com/phetsims/scenery-phet/issues/773.
    let panelNumber = 1;
    const panel1 = new FaucetDemoPanel(panelNumber++, {
        tapToDispenseEnabled: true,
        closeOnRelease: true
    });
    const panel2 = new FaucetDemoPanel(panelNumber++, {
        tapToDispenseEnabled: true,
        closeOnRelease: false
    });
    const panel3 = new FaucetDemoPanel(panelNumber++, {
        tapToDispenseEnabled: false,
        closeOnRelease: true
    });
    const panel4 = new FaucetDemoPanel(panelNumber++, {
        tapToDispenseEnabled: false,
        closeOnRelease: false
    });
    const panel5 = new FaucetDemoPanel(panelNumber++, {
        tapToDispenseEnabled: true,
        closeOnRelease: true,
        reverseAlternativeInput: true // Dragging the faucet shooter to the left will increase the flow rate.
    });
    const panelsBox = new HBox({
        children: [
            panel1,
            panel2,
            panel3,
            panel4,
            panel5
        ],
        spacing: 15,
        maxWidth: layoutBounds.width - 20,
        resize: false
    });
    return new VBox({
        children: [
            docText,
            panelsBox
        ],
        align: 'left',
        spacing: 35,
        center: layoutBounds.center
    });
}
let FaucetDemoPanel = class FaucetDemoPanel extends Panel {
    constructor(panelNumber, faucetNodeOptions){
        const titleText = new Text(`Example ${panelNumber}`, {
            font: new PhetFont({
                size: 18,
                weight: 'bold'
            })
        });
        // Display the configuration values.
        const configurationText = new RichText(`tapToDispenseEnabled=${faucetNodeOptions.tapToDispenseEnabled}<br>` + `closeOnRelease=${faucetNodeOptions.closeOnRelease}`, {
            font: FONT
        });
        const flowRateProperty = new NumberProperty(0, {
            range: new Range(0, MAX_FLOW_RATE)
        });
        const faucetEnabledProperty = new Property(true);
        const faucetNode = new FaucetNode(MAX_FLOW_RATE, flowRateProperty, faucetEnabledProperty, combineOptions({
            scale: FAUCET_NODE_SCALE,
            shooterOptions: {
                touchAreaXDilation: 37,
                touchAreaYDilation: 60
            },
            keyboardStep: 1,
            shiftKeyboardStep: 0.1,
            pageKeyboardStep: 2
        }, faucetNodeOptions));
        // Make the faucet face left.
        if (faucetNodeOptions.reverseAlternativeInput) {
            faucetNode.setScaleMagnitude(-FAUCET_NODE_SCALE, FAUCET_NODE_SCALE);
        }
        const flowRateStringProperty = new DerivedProperty([
            flowRateProperty
        ], (flowRate)=>`flowRate=${Utils.toFixed(flowRate, 1)}`);
        const flowRateDisplay = new Text(flowRateStringProperty, {
            font: FONT
        });
        const enabledText = new Text('enabled', {
            font: FONT
        });
        const enabledCheckbox = new Checkbox(faucetEnabledProperty, enabledText, {
            boxWidth: 12
        });
        const content = new VBox({
            align: faucetNodeOptions.reverseAlternativeInput ? 'right' : 'left',
            spacing: 10,
            children: [
                titleText,
                configurationText,
                faucetNode,
                flowRateDisplay,
                enabledCheckbox
            ]
        });
        super(content, {
            xMargin: 15,
            yMargin: 10
        });
    }
};

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9kZW1vL2NvbXBvbmVudHMvZGVtb0ZhdWNldE5vZGUudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjItMjAyNCwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbi8qKlxuICogRGVtbyBmb3IgRmF1Y2V0Tm9kZVxuICpcbiAqIEBhdXRob3IgQ2hyaXMgTWFsbGV5IChQaXhlbFpvb20sIEluYy4pXG4gKi9cblxuaW1wb3J0IERlcml2ZWRQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL0Rlcml2ZWRQcm9wZXJ0eS5qcyc7XG5pbXBvcnQgTnVtYmVyUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9OdW1iZXJQcm9wZXJ0eS5qcyc7XG5pbXBvcnQgUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9Qcm9wZXJ0eS5qcyc7XG5pbXBvcnQgQm91bmRzMiBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvQm91bmRzMi5qcyc7XG5pbXBvcnQgUmFuZ2UgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL1JhbmdlLmpzJztcbmltcG9ydCBVdGlscyBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvVXRpbHMuanMnO1xuaW1wb3J0IHsgY29tYmluZU9wdGlvbnMgfSBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvb3B0aW9uaXplLmpzJztcbmltcG9ydCBQaWNrT3B0aW9uYWwgZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL3R5cGVzL1BpY2tPcHRpb25hbC5qcyc7XG5pbXBvcnQgUGlja1JlcXVpcmVkIGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy90eXBlcy9QaWNrUmVxdWlyZWQuanMnO1xuaW1wb3J0IHsgSEJveCwgTm9kZSwgUmljaFRleHQsIFRleHQsIFZCb3ggfSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xuaW1wb3J0IENoZWNrYm94IGZyb20gJy4uLy4uLy4uLy4uL3N1bi9qcy9DaGVja2JveC5qcyc7XG5pbXBvcnQgUGFuZWwgZnJvbSAnLi4vLi4vLi4vLi4vc3VuL2pzL1BhbmVsLmpzJztcbmltcG9ydCBGYXVjZXROb2RlLCB7IEZhdWNldE5vZGVPcHRpb25zIH0gZnJvbSAnLi4vLi4vRmF1Y2V0Tm9kZS5qcyc7XG5pbXBvcnQgUGhldEZvbnQgZnJvbSAnLi4vLi4vUGhldEZvbnQuanMnO1xuXG5jb25zdCBNQVhfRkxPV19SQVRFID0gMTA7XG5jb25zdCBGQVVDRVRfTk9ERV9TQ0FMRSA9IDAuNztcbmNvbnN0IEZPTlQgPSBuZXcgUGhldEZvbnQoIDE0ICk7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGRlbW9GYXVjZXROb2RlKCBsYXlvdXRCb3VuZHM6IEJvdW5kczIgKTogTm9kZSB7XG5cbiAgY29uc3QgZG9jVGV4dCA9IG5ldyBSaWNoVGV4dChcbiAgICAnT3B0aW9uczo8YnI+PGJyPicgK1xuICAgICc8Yj50YXBUb0Rpc3BlbnNlRW5hYmxlZDwvYj46IHdoZW4gdHJ1ZSwgdGFwcGluZyB0aGUgc2hvb3RlciBkaXNwZW5zZXMgc29tZSBmbHVpZDxicj48YnI+JyArXG4gICAgJzxiPmNsb3NlT25SZWxlYXNlPC9iPjogd2hlbiB0cnVlLCByZWxlYXNpbmcgdGhlIHNob290ZXIgY2xvc2VzIHRoZSBmYXVjZXQnLCB7XG4gICAgICBmb250OiBGT05UXG4gICAgfVxuICApO1xuXG4gIC8vIEEgcGFuZWwgZm9yIGVhY2ggY29tYmluYXRpb24gb2YgdGFwVG9EaXNwZW5zZUVuYWJsZWQgYW5kIGNsb3NlT25SZWxlYXNlIGJlaGF2aW9yLCB0byBmYWNpbGl0YXRlIGExMXkgZGVzaWduXG4gIC8vIGRpc2N1c3Npb24gaW4gaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3NjZW5lcnktcGhldC9pc3N1ZXMvNzczLlxuICBsZXQgcGFuZWxOdW1iZXIgPSAxO1xuXG4gIGNvbnN0IHBhbmVsMSA9IG5ldyBGYXVjZXREZW1vUGFuZWwoIHBhbmVsTnVtYmVyKyssIHtcbiAgICB0YXBUb0Rpc3BlbnNlRW5hYmxlZDogdHJ1ZSxcbiAgICBjbG9zZU9uUmVsZWFzZTogdHJ1ZVxuICB9ICk7XG5cbiAgY29uc3QgcGFuZWwyID0gbmV3IEZhdWNldERlbW9QYW5lbCggcGFuZWxOdW1iZXIrKywge1xuICAgIHRhcFRvRGlzcGVuc2VFbmFibGVkOiB0cnVlLFxuICAgIGNsb3NlT25SZWxlYXNlOiBmYWxzZVxuICB9ICk7XG5cbiAgY29uc3QgcGFuZWwzID0gbmV3IEZhdWNldERlbW9QYW5lbCggcGFuZWxOdW1iZXIrKywge1xuICAgIHRhcFRvRGlzcGVuc2VFbmFibGVkOiBmYWxzZSxcbiAgICBjbG9zZU9uUmVsZWFzZTogdHJ1ZVxuICB9ICk7XG5cbiAgY29uc3QgcGFuZWw0ID0gbmV3IEZhdWNldERlbW9QYW5lbCggcGFuZWxOdW1iZXIrKywge1xuICAgIHRhcFRvRGlzcGVuc2VFbmFibGVkOiBmYWxzZSxcbiAgICBjbG9zZU9uUmVsZWFzZTogZmFsc2VcbiAgfSApO1xuXG4gIGNvbnN0IHBhbmVsNSA9IG5ldyBGYXVjZXREZW1vUGFuZWwoIHBhbmVsTnVtYmVyKyssIHtcbiAgICB0YXBUb0Rpc3BlbnNlRW5hYmxlZDogdHJ1ZSxcbiAgICBjbG9zZU9uUmVsZWFzZTogdHJ1ZSxcbiAgICByZXZlcnNlQWx0ZXJuYXRpdmVJbnB1dDogdHJ1ZSAvLyBEcmFnZ2luZyB0aGUgZmF1Y2V0IHNob290ZXIgdG8gdGhlIGxlZnQgd2lsbCBpbmNyZWFzZSB0aGUgZmxvdyByYXRlLlxuICB9ICk7XG5cbiAgY29uc3QgcGFuZWxzQm94ID0gbmV3IEhCb3goIHtcbiAgICBjaGlsZHJlbjogWyBwYW5lbDEsIHBhbmVsMiwgcGFuZWwzLCBwYW5lbDQsIHBhbmVsNSBdLFxuICAgIHNwYWNpbmc6IDE1LFxuICAgIG1heFdpZHRoOiBsYXlvdXRCb3VuZHMud2lkdGggLSAyMCxcbiAgICByZXNpemU6IGZhbHNlXG4gIH0gKTtcblxuICByZXR1cm4gbmV3IFZCb3goIHtcbiAgICBjaGlsZHJlbjogWyBkb2NUZXh0LCBwYW5lbHNCb3ggXSxcbiAgICBhbGlnbjogJ2xlZnQnLFxuICAgIHNwYWNpbmc6IDM1LFxuICAgIGNlbnRlcjogbGF5b3V0Qm91bmRzLmNlbnRlclxuICB9ICk7XG59XG5cbnR5cGUgRmF1Y2V0RGVtb1BhbmVsT3B0aW9ucyA9IFBpY2tSZXF1aXJlZDxGYXVjZXROb2RlT3B0aW9ucywgJ3RhcFRvRGlzcGVuc2VFbmFibGVkJyB8ICdjbG9zZU9uUmVsZWFzZSc+ICZcbiAgUGlja09wdGlvbmFsPEZhdWNldE5vZGVPcHRpb25zLCAncmV2ZXJzZUFsdGVybmF0aXZlSW5wdXQnPjtcblxuY2xhc3MgRmF1Y2V0RGVtb1BhbmVsIGV4dGVuZHMgUGFuZWwge1xuXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggcGFuZWxOdW1iZXI6IG51bWJlciwgZmF1Y2V0Tm9kZU9wdGlvbnM6IEZhdWNldERlbW9QYW5lbE9wdGlvbnMgKSB7XG5cbiAgICBjb25zdCB0aXRsZVRleHQgPSBuZXcgVGV4dCggYEV4YW1wbGUgJHtwYW5lbE51bWJlcn1gLCB7XG4gICAgICBmb250OiBuZXcgUGhldEZvbnQoIHtcbiAgICAgICAgc2l6ZTogMTgsXG4gICAgICAgIHdlaWdodDogJ2JvbGQnXG4gICAgICB9IClcbiAgICB9ICk7XG5cbiAgICAvLyBEaXNwbGF5IHRoZSBjb25maWd1cmF0aW9uIHZhbHVlcy5cbiAgICBjb25zdCBjb25maWd1cmF0aW9uVGV4dCA9IG5ldyBSaWNoVGV4dChcbiAgICAgIGB0YXBUb0Rpc3BlbnNlRW5hYmxlZD0ke2ZhdWNldE5vZGVPcHRpb25zLnRhcFRvRGlzcGVuc2VFbmFibGVkfTxicj5gICtcbiAgICAgIGBjbG9zZU9uUmVsZWFzZT0ke2ZhdWNldE5vZGVPcHRpb25zLmNsb3NlT25SZWxlYXNlfWAsIHtcbiAgICAgICAgZm9udDogRk9OVFxuICAgICAgfSApO1xuXG4gICAgY29uc3QgZmxvd1JhdGVQcm9wZXJ0eSA9IG5ldyBOdW1iZXJQcm9wZXJ0eSggMCwge1xuICAgICAgcmFuZ2U6IG5ldyBSYW5nZSggMCwgTUFYX0ZMT1dfUkFURSApXG4gICAgfSApO1xuICAgIGNvbnN0IGZhdWNldEVuYWJsZWRQcm9wZXJ0eSA9IG5ldyBQcm9wZXJ0eSggdHJ1ZSApO1xuXG4gICAgY29uc3QgZmF1Y2V0Tm9kZSA9IG5ldyBGYXVjZXROb2RlKCBNQVhfRkxPV19SQVRFLCBmbG93UmF0ZVByb3BlcnR5LCBmYXVjZXRFbmFibGVkUHJvcGVydHksXG4gICAgICBjb21iaW5lT3B0aW9uczxGYXVjZXROb2RlT3B0aW9ucz4oIHtcbiAgICAgICAgc2NhbGU6IEZBVUNFVF9OT0RFX1NDQUxFLFxuICAgICAgICBzaG9vdGVyT3B0aW9uczoge1xuICAgICAgICAgIHRvdWNoQXJlYVhEaWxhdGlvbjogMzcsXG4gICAgICAgICAgdG91Y2hBcmVhWURpbGF0aW9uOiA2MFxuICAgICAgICB9LFxuICAgICAgICBrZXlib2FyZFN0ZXA6IDEsXG4gICAgICAgIHNoaWZ0S2V5Ym9hcmRTdGVwOiAwLjEsXG4gICAgICAgIHBhZ2VLZXlib2FyZFN0ZXA6IDJcbiAgICAgIH0sIGZhdWNldE5vZGVPcHRpb25zICkgKTtcblxuICAgIC8vIE1ha2UgdGhlIGZhdWNldCBmYWNlIGxlZnQuXG4gICAgaWYgKCBmYXVjZXROb2RlT3B0aW9ucy5yZXZlcnNlQWx0ZXJuYXRpdmVJbnB1dCApIHtcbiAgICAgIGZhdWNldE5vZGUuc2V0U2NhbGVNYWduaXR1ZGUoIC1GQVVDRVRfTk9ERV9TQ0FMRSwgRkFVQ0VUX05PREVfU0NBTEUgKTtcbiAgICB9XG5cbiAgICBjb25zdCBmbG93UmF0ZVN0cmluZ1Byb3BlcnR5ID0gbmV3IERlcml2ZWRQcm9wZXJ0eSggWyBmbG93UmF0ZVByb3BlcnR5IF0sXG4gICAgICBmbG93UmF0ZSA9PiBgZmxvd1JhdGU9JHtVdGlscy50b0ZpeGVkKCBmbG93UmF0ZSwgMSApfWAgKTtcbiAgICBjb25zdCBmbG93UmF0ZURpc3BsYXkgPSBuZXcgVGV4dCggZmxvd1JhdGVTdHJpbmdQcm9wZXJ0eSwge1xuICAgICAgZm9udDogRk9OVFxuICAgIH0gKTtcblxuICAgIGNvbnN0IGVuYWJsZWRUZXh0ID0gbmV3IFRleHQoICdlbmFibGVkJywgeyBmb250OiBGT05UIH0gKTtcbiAgICBjb25zdCBlbmFibGVkQ2hlY2tib3ggPSBuZXcgQ2hlY2tib3goIGZhdWNldEVuYWJsZWRQcm9wZXJ0eSwgZW5hYmxlZFRleHQsIHtcbiAgICAgIGJveFdpZHRoOiAxMlxuICAgIH0gKTtcblxuICAgIGNvbnN0IGNvbnRlbnQgPSBuZXcgVkJveCgge1xuICAgICAgYWxpZ246IGZhdWNldE5vZGVPcHRpb25zLnJldmVyc2VBbHRlcm5hdGl2ZUlucHV0ID8gJ3JpZ2h0JyA6ICdsZWZ0JyxcbiAgICAgIHNwYWNpbmc6IDEwLFxuICAgICAgY2hpbGRyZW46IFtcbiAgICAgICAgdGl0bGVUZXh0LFxuICAgICAgICBjb25maWd1cmF0aW9uVGV4dCxcbiAgICAgICAgZmF1Y2V0Tm9kZSxcbiAgICAgICAgZmxvd1JhdGVEaXNwbGF5LFxuICAgICAgICBlbmFibGVkQ2hlY2tib3hcbiAgICAgIF1cbiAgICB9ICk7XG5cbiAgICBzdXBlciggY29udGVudCwge1xuICAgICAgeE1hcmdpbjogMTUsXG4gICAgICB5TWFyZ2luOiAxMFxuICAgIH0gKTtcbiAgfVxufSJdLCJuYW1lcyI6WyJEZXJpdmVkUHJvcGVydHkiLCJOdW1iZXJQcm9wZXJ0eSIsIlByb3BlcnR5IiwiUmFuZ2UiLCJVdGlscyIsImNvbWJpbmVPcHRpb25zIiwiSEJveCIsIlJpY2hUZXh0IiwiVGV4dCIsIlZCb3giLCJDaGVja2JveCIsIlBhbmVsIiwiRmF1Y2V0Tm9kZSIsIlBoZXRGb250IiwiTUFYX0ZMT1dfUkFURSIsIkZBVUNFVF9OT0RFX1NDQUxFIiwiRk9OVCIsImRlbW9GYXVjZXROb2RlIiwibGF5b3V0Qm91bmRzIiwiZG9jVGV4dCIsImZvbnQiLCJwYW5lbE51bWJlciIsInBhbmVsMSIsIkZhdWNldERlbW9QYW5lbCIsInRhcFRvRGlzcGVuc2VFbmFibGVkIiwiY2xvc2VPblJlbGVhc2UiLCJwYW5lbDIiLCJwYW5lbDMiLCJwYW5lbDQiLCJwYW5lbDUiLCJyZXZlcnNlQWx0ZXJuYXRpdmVJbnB1dCIsInBhbmVsc0JveCIsImNoaWxkcmVuIiwic3BhY2luZyIsIm1heFdpZHRoIiwid2lkdGgiLCJyZXNpemUiLCJhbGlnbiIsImNlbnRlciIsImZhdWNldE5vZGVPcHRpb25zIiwidGl0bGVUZXh0Iiwic2l6ZSIsIndlaWdodCIsImNvbmZpZ3VyYXRpb25UZXh0IiwiZmxvd1JhdGVQcm9wZXJ0eSIsInJhbmdlIiwiZmF1Y2V0RW5hYmxlZFByb3BlcnR5IiwiZmF1Y2V0Tm9kZSIsInNjYWxlIiwic2hvb3Rlck9wdGlvbnMiLCJ0b3VjaEFyZWFYRGlsYXRpb24iLCJ0b3VjaEFyZWFZRGlsYXRpb24iLCJrZXlib2FyZFN0ZXAiLCJzaGlmdEtleWJvYXJkU3RlcCIsInBhZ2VLZXlib2FyZFN0ZXAiLCJzZXRTY2FsZU1hZ25pdHVkZSIsImZsb3dSYXRlU3RyaW5nUHJvcGVydHkiLCJmbG93UmF0ZSIsInRvRml4ZWQiLCJmbG93UmF0ZURpc3BsYXkiLCJlbmFibGVkVGV4dCIsImVuYWJsZWRDaGVja2JveCIsImJveFdpZHRoIiwiY29udGVudCIsInhNYXJnaW4iLCJ5TWFyZ2luIl0sIm1hcHBpbmdzIjoiQUFBQSxzREFBc0Q7QUFFdEQ7Ozs7Q0FJQyxHQUVELE9BQU9BLHFCQUFxQix5Q0FBeUM7QUFDckUsT0FBT0Msb0JBQW9CLHdDQUF3QztBQUNuRSxPQUFPQyxjQUFjLGtDQUFrQztBQUV2RCxPQUFPQyxXQUFXLDhCQUE4QjtBQUNoRCxPQUFPQyxXQUFXLDhCQUE4QjtBQUNoRCxTQUFTQyxjQUFjLFFBQVEsd0NBQXdDO0FBR3ZFLFNBQVNDLElBQUksRUFBUUMsUUFBUSxFQUFFQyxJQUFJLEVBQUVDLElBQUksUUFBUSxvQ0FBb0M7QUFDckYsT0FBT0MsY0FBYyxpQ0FBaUM7QUFDdEQsT0FBT0MsV0FB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