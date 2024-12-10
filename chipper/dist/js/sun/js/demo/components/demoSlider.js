// Copyright 2022-2024, University of Colorado Boulder
/**
 * Demos for HSlider and VSlider
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */ import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import Property from '../../../../axon/js/Property.js';
import stepTimer from '../../../../axon/js/stepTimer.js';
import Dimension2 from '../../../../dot/js/Dimension2.js';
import Range from '../../../../dot/js/Range.js';
import optionize, { combineOptions } from '../../../../phet-core/js/optionize.js';
import { Font, HBox, Text, VBox } from '../../../../scenery/js/imports.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import Checkbox from '../../Checkbox.js';
import HSlider from '../../HSlider.js';
import VSlider from '../../VSlider.js';
const CHECKBOX_FONT = new Font({
    size: 20
});
// Used by demoHSlider and demoVSlider
function demoSlider(layoutBounds, orientation, providedOptions) {
    const options = combineOptions({
        center: layoutBounds.center,
        tandem: Tandem.REQUIRED,
        phetioDesigned: true
    }, providedOptions);
    const property = new Property(0);
    const range = new Range(0, 100);
    const tickLabelOptions = {
        font: new Font({
            size: 16
        })
    };
    const enabledRangeProperty = new Property(new Range(0, 100));
    let slider;
    if (orientation === 'horizontal') {
        slider = new HSlider(property, range, optionize()({
            trackSize: new Dimension2(300, 5),
            // Demonstrate larger x dilation.
            thumbTouchAreaXDilation: 30,
            thumbTouchAreaYDilation: 15,
            thumbMouseAreaXDilation: 10,
            thumbMouseAreaYDilation: 5,
            enabledRangeProperty: enabledRangeProperty,
            // pdom
            labelContent: 'Horizontal Slider',
            descriptionContent: 'This is a description of the horizontal Slider.',
            phetioEnabledPropertyInstrumented: false
        }, options));
    } else {
        slider = new VSlider(property, range, optionize()({
            trackSize: new Dimension2(5, 300),
            // Demonstrate larger y dilation, to verify that VSlider is handling things correctly.
            thumbTouchAreaXDilation: 15,
            thumbTouchAreaYDilation: 30,
            thumbMouseAreaXDilation: 5,
            thumbMouseAreaYDilation: 10,
            enabledRangeProperty: enabledRangeProperty,
            phetioEnabledPropertyInstrumented: false
        }, options));
    }
    // Settable
    const enabledProperty = new BooleanProperty(true);
    slider.enabledProperty = enabledProperty;
    // major ticks
    slider.addMajorTick(range.min, new Text(range.min, tickLabelOptions));
    slider.addMajorTick(range.getCenter(), new Text(range.getCenter(), tickLabelOptions));
    slider.addMajorTick(range.max, new Text(range.max, tickLabelOptions));
    // minor ticks
    slider.addMinorTick(range.min + 0.25 * range.getLength());
    slider.addMinorTick(range.min + 0.75 * range.getLength());
    // show/hide major ticks
    const majorTicksVisibleProperty = new Property(true);
    majorTicksVisibleProperty.link((visible)=>{
        slider.majorTicksVisible = visible;
    });
    const majorTicksCheckbox = new Checkbox(majorTicksVisibleProperty, new Text('Major ticks visible', {
        font: CHECKBOX_FONT
    }), {
        tandem: Tandem.OPT_OUT,
        left: slider.left,
        top: slider.bottom + 40
    });
    // show/hide minor ticks
    const minorTicksVisibleProperty = new Property(true);
    minorTicksVisibleProperty.link((visible)=>{
        slider.minorTicksVisible = visible;
    });
    const minorTicksCheckbox = new Checkbox(minorTicksVisibleProperty, new Text('Minor ticks visible', {
        font: CHECKBOX_FONT
    }), {
        tandem: Tandem.OPT_OUT,
        left: slider.left,
        top: majorTicksCheckbox.bottom + 40
    });
    // Checkbox to enable/disable slider
    const enabledCheckbox = new Checkbox(enabledProperty, new Text('Enable slider', {
        font: CHECKBOX_FONT
    }), {
        tandem: Tandem.OPT_OUT,
        left: slider.left,
        top: minorTicksCheckbox.bottom + 40
    });
    // restrict enabled range of slider
    const restrictedRangeProperty = new Property(false);
    restrictedRangeProperty.link((restrictedRange)=>{
        enabledRangeProperty.value = restrictedRange ? new Range(25, 75) : new Range(0, 100);
    });
    const enabledRangeCheckbox = new Checkbox(restrictedRangeProperty, new Text('Enable Range [25, 75]', {
        font: CHECKBOX_FONT
    }), {
        tandem: Tandem.OPT_OUT,
        left: slider.left,
        top: enabledCheckbox.bottom + 40
    });
    // If the user is holding down the thumb outside of the enabled range, and the enabled range expands, the value should
    // adjust to the new extremum of the range, see https://github.com/phetsims/mean-share-and-balance/issues/29
    const animateEnabledRangeProperty = new BooleanProperty(false);
    const animateEnabledRangeCheckbox = new Checkbox(animateEnabledRangeProperty, new Text('Animate Enabled Range', {
        font: CHECKBOX_FONT
    }), {
        tandem: Tandem.OPT_OUT,
        left: slider.left,
        top: enabledRangeCheckbox.bottom + 40
    });
    const enabledRangeStep = 0.1;
    stepTimer.addListener(()=>{
        if (animateEnabledRangeProperty.value && enabledRangeProperty.value.min < enabledRangeProperty.value.max - enabledRangeStep) {
            enabledRangeProperty.value = new Range(Math.max(enabledRangeProperty.value.min + enabledRangeStep, 0), 75);
        }
    });
    // All of the controls related to the slider
    const controls = new VBox({
        align: 'left',
        spacing: 30,
        children: [
            majorTicksCheckbox,
            minorTicksCheckbox,
            enabledCheckbox,
            enabledRangeCheckbox,
            animateEnabledRangeCheckbox
        ]
    });
    // Position the control based on the orientation of the slider
    const boxOptions = {
        spacing: 60,
        children: [
            slider,
            controls
        ],
        center: layoutBounds.center
    };
    return orientation === 'horizontal' ? new VBox(boxOptions) : new HBox(boxOptions);
}
// Creates a demo for HSlider
export function demoHSlider(layoutBounds, options) {
    return demoSlider(layoutBounds, 'horizontal', options);
}
// Creates a demo for VSlider
export function demoVSlider(layoutBounds, options) {
    return demoSlider(layoutBounds, 'vertical', options);
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3N1bi9qcy9kZW1vL2NvbXBvbmVudHMvZGVtb1NsaWRlci50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAyMi0yMDI0LCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuLyoqXG4gKiBEZW1vcyBmb3IgSFNsaWRlciBhbmQgVlNsaWRlclxuICpcbiAqIEBhdXRob3IgQ2hyaXMgTWFsbGV5IChQaXhlbFpvb20sIEluYy4pXG4gKi9cblxuaW1wb3J0IEJvb2xlYW5Qcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL0Jvb2xlYW5Qcm9wZXJ0eS5qcyc7XG5pbXBvcnQgUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9Qcm9wZXJ0eS5qcyc7XG5pbXBvcnQgc3RlcFRpbWVyIGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvc3RlcFRpbWVyLmpzJztcbmltcG9ydCBCb3VuZHMyIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9Cb3VuZHMyLmpzJztcbmltcG9ydCBEaW1lbnNpb24yIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9EaW1lbnNpb24yLmpzJztcbmltcG9ydCBSYW5nZSBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvUmFuZ2UuanMnO1xuaW1wb3J0IG9wdGlvbml6ZSwgeyBjb21iaW5lT3B0aW9ucywgRW1wdHlTZWxmT3B0aW9ucyB9IGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9vcHRpb25pemUuanMnO1xuaW1wb3J0IHsgRm9udCwgSEJveCwgTm9kZSwgVGV4dCwgVkJveCB9IGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XG5pbXBvcnQgVGFuZGVtIGZyb20gJy4uLy4uLy4uLy4uL3RhbmRlbS9qcy9UYW5kZW0uanMnO1xuaW1wb3J0IENoZWNrYm94IGZyb20gJy4uLy4uL0NoZWNrYm94LmpzJztcbmltcG9ydCBIU2xpZGVyLCB7IEhTbGlkZXJPcHRpb25zIH0gZnJvbSAnLi4vLi4vSFNsaWRlci5qcyc7XG5pbXBvcnQgU2xpZGVyIGZyb20gJy4uLy4uL1NsaWRlci5qcyc7XG5pbXBvcnQgVlNsaWRlciBmcm9tICcuLi8uLi9WU2xpZGVyLmpzJztcbmltcG9ydCB7IFN1bkRlbW9PcHRpb25zIH0gZnJvbSAnLi4vRGVtb3NTY3JlZW5WaWV3LmpzJztcblxuY29uc3QgQ0hFQ0tCT1hfRk9OVCA9IG5ldyBGb250KCB7IHNpemU6IDIwIH0gKTtcblxuLy8gVXNlZCBieSBkZW1vSFNsaWRlciBhbmQgZGVtb1ZTbGlkZXJcbmZ1bmN0aW9uIGRlbW9TbGlkZXIoIGxheW91dEJvdW5kczogQm91bmRzMiwgb3JpZW50YXRpb246ICdob3Jpem9udGFsJyB8ICd2ZXJ0aWNhbCcsIHByb3ZpZGVkT3B0aW9ucz86IFN1bkRlbW9PcHRpb25zICk6IE5vZGUge1xuXG4gIGNvbnN0IG9wdGlvbnMgPSBjb21iaW5lT3B0aW9uczxTdW5EZW1vT3B0aW9ucz4oIHtcbiAgICBjZW50ZXI6IGxheW91dEJvdW5kcy5jZW50ZXIsXG4gICAgdGFuZGVtOiBUYW5kZW0uUkVRVUlSRUQsXG4gICAgcGhldGlvRGVzaWduZWQ6IHRydWVcbiAgfSwgcHJvdmlkZWRPcHRpb25zICk7XG5cbiAgY29uc3QgcHJvcGVydHkgPSBuZXcgUHJvcGVydHkoIDAgKTtcbiAgY29uc3QgcmFuZ2UgPSBuZXcgUmFuZ2UoIDAsIDEwMCApO1xuICBjb25zdCB0aWNrTGFiZWxPcHRpb25zID0geyBmb250OiBuZXcgRm9udCggeyBzaXplOiAxNiB9ICkgfTtcblxuICBjb25zdCBlbmFibGVkUmFuZ2VQcm9wZXJ0eSA9IG5ldyBQcm9wZXJ0eSggbmV3IFJhbmdlKCAwLCAxMDAgKSApO1xuXG4gIGxldCBzbGlkZXI6IFNsaWRlcjtcbiAgaWYgKCBvcmllbnRhdGlvbiA9PT0gJ2hvcml6b250YWwnICkge1xuICAgIHNsaWRlciA9IG5ldyBIU2xpZGVyKCBwcm9wZXJ0eSwgcmFuZ2UsIG9wdGlvbml6ZTxTdW5EZW1vT3B0aW9ucywgRW1wdHlTZWxmT3B0aW9ucywgSFNsaWRlck9wdGlvbnM+KCkoIHtcbiAgICAgIHRyYWNrU2l6ZTogbmV3IERpbWVuc2lvbjIoIDMwMCwgNSApLFxuXG4gICAgICAvLyBEZW1vbnN0cmF0ZSBsYXJnZXIgeCBkaWxhdGlvbi5cbiAgICAgIHRodW1iVG91Y2hBcmVhWERpbGF0aW9uOiAzMCxcbiAgICAgIHRodW1iVG91Y2hBcmVhWURpbGF0aW9uOiAxNSxcbiAgICAgIHRodW1iTW91c2VBcmVhWERpbGF0aW9uOiAxMCxcbiAgICAgIHRodW1iTW91c2VBcmVhWURpbGF0aW9uOiA1LFxuICAgICAgZW5hYmxlZFJhbmdlUHJvcGVydHk6IGVuYWJsZWRSYW5nZVByb3BlcnR5LFxuXG4gICAgICAvLyBwZG9tXG4gICAgICBsYWJlbENvbnRlbnQ6ICdIb3Jpem9udGFsIFNsaWRlcicsXG4gICAgICBkZXNjcmlwdGlvbkNvbnRlbnQ6ICdUaGlzIGlzIGEgZGVzY3JpcHRpb24gb2YgdGhlIGhvcml6b250YWwgU2xpZGVyLicsXG5cbiAgICAgIHBoZXRpb0VuYWJsZWRQcm9wZXJ0eUluc3RydW1lbnRlZDogZmFsc2VcbiAgICB9LCBvcHRpb25zICkgKTtcbiAgfVxuICBlbHNlIHtcbiAgICBzbGlkZXIgPSBuZXcgVlNsaWRlciggcHJvcGVydHksIHJhbmdlLCBvcHRpb25pemU8U3VuRGVtb09wdGlvbnMsIEVtcHR5U2VsZk9wdGlvbnMsIEhTbGlkZXJPcHRpb25zPigpKCB7XG4gICAgICB0cmFja1NpemU6IG5ldyBEaW1lbnNpb24yKCA1LCAzMDAgKSxcblxuICAgICAgLy8gRGVtb25zdHJhdGUgbGFyZ2VyIHkgZGlsYXRpb24sIHRvIHZlcmlmeSB0aGF0IFZTbGlkZXIgaXMgaGFuZGxpbmcgdGhpbmdzIGNvcnJlY3RseS5cbiAgICAgIHRodW1iVG91Y2hBcmVhWERpbGF0aW9uOiAxNSxcbiAgICAgIHRodW1iVG91Y2hBcmVhWURpbGF0aW9uOiAzMCxcbiAgICAgIHRodW1iTW91c2VBcmVhWERpbGF0aW9uOiA1LFxuICAgICAgdGh1bWJNb3VzZUFyZWFZRGlsYXRpb246IDEwLFxuICAgICAgZW5hYmxlZFJhbmdlUHJvcGVydHk6IGVuYWJsZWRSYW5nZVByb3BlcnR5LFxuXG4gICAgICBwaGV0aW9FbmFibGVkUHJvcGVydHlJbnN0cnVtZW50ZWQ6IGZhbHNlXG4gICAgfSwgb3B0aW9ucyApICk7XG4gIH1cblxuICAvLyBTZXR0YWJsZVxuICBjb25zdCBlbmFibGVkUHJvcGVydHkgPSBuZXcgQm9vbGVhblByb3BlcnR5KCB0cnVlICk7XG4gIHNsaWRlci5lbmFibGVkUHJvcGVydHkgPSBlbmFibGVkUHJvcGVydHk7XG5cbiAgLy8gbWFqb3IgdGlja3NcbiAgc2xpZGVyLmFkZE1ham9yVGljayggcmFuZ2UubWluLCBuZXcgVGV4dCggcmFuZ2UubWluLCB0aWNrTGFiZWxPcHRpb25zICkgKTtcbiAgc2xpZGVyLmFkZE1ham9yVGljayggcmFuZ2UuZ2V0Q2VudGVyKCksIG5ldyBUZXh0KCByYW5nZS5nZXRDZW50ZXIoKSwgdGlja0xhYmVsT3B0aW9ucyApICk7XG4gIHNsaWRlci5hZGRNYWpvclRpY2soIHJhbmdlLm1heCwgbmV3IFRleHQoIHJhbmdlLm1heCwgdGlja0xhYmVsT3B0aW9ucyApICk7XG5cbiAgLy8gbWlub3IgdGlja3NcbiAgc2xpZGVyLmFkZE1pbm9yVGljayggcmFuZ2UubWluICsgMC4yNSAqIHJhbmdlLmdldExlbmd0aCgpICk7XG4gIHNsaWRlci5hZGRNaW5vclRpY2soIHJhbmdlLm1pbiArIDAuNzUgKiByYW5nZS5nZXRMZW5ndGgoKSApO1xuXG4gIC8vIHNob3cvaGlkZSBtYWpvciB0aWNrc1xuICBjb25zdCBtYWpvclRpY2tzVmlzaWJsZVByb3BlcnR5ID0gbmV3IFByb3BlcnR5KCB0cnVlICk7XG4gIG1ham9yVGlja3NWaXNpYmxlUHJvcGVydHkubGluayggdmlzaWJsZSA9PiB7XG4gICAgc2xpZGVyLm1ham9yVGlja3NWaXNpYmxlID0gdmlzaWJsZTtcbiAgfSApO1xuICBjb25zdCBtYWpvclRpY2tzQ2hlY2tib3ggPSBuZXcgQ2hlY2tib3goIG1ham9yVGlja3NWaXNpYmxlUHJvcGVydHksXG4gICAgbmV3IFRleHQoICdNYWpvciB0aWNrcyB2aXNpYmxlJywgeyBmb250OiBDSEVDS0JPWF9GT05UIH0gKSwge1xuICAgICAgdGFuZGVtOiBUYW5kZW0uT1BUX09VVCxcbiAgICAgIGxlZnQ6IHNsaWRlci5sZWZ0LFxuICAgICAgdG9wOiBzbGlkZXIuYm90dG9tICsgNDBcbiAgICB9ICk7XG5cbiAgLy8gc2hvdy9oaWRlIG1pbm9yIHRpY2tzXG4gIGNvbnN0IG1pbm9yVGlja3NWaXNpYmxlUHJvcGVydHkgPSBuZXcgUHJvcGVydHkoIHRydWUgKTtcbiAgbWlub3JUaWNrc1Zpc2libGVQcm9wZXJ0eS5saW5rKCB2aXNpYmxlID0+IHtcbiAgICBzbGlkZXIubWlub3JUaWNrc1Zpc2libGUgPSB2aXNpYmxlO1xuICB9ICk7XG4gIGNvbnN0IG1pbm9yVGlja3NDaGVja2JveCA9IG5ldyBDaGVja2JveCggbWlub3JUaWNrc1Zpc2libGVQcm9wZXJ0eSxcbiAgICBuZXcgVGV4dCggJ01pbm9yIHRpY2tzIHZpc2libGUnLCB7IGZvbnQ6IENIRUNLQk9YX0ZPTlQgfSApLCB7XG4gICAgICB0YW5kZW06IFRhbmRlbS5PUFRfT1VULFxuICAgICAgbGVmdDogc2xpZGVyLmxlZnQsXG4gICAgICB0b3A6IG1ham9yVGlja3NDaGVja2JveC5ib3R0b20gKyA0MFxuICAgIH0gKTtcblxuICAvLyBDaGVja2JveCB0byBlbmFibGUvZGlzYWJsZSBzbGlkZXJcbiAgY29uc3QgZW5hYmxlZENoZWNrYm94ID0gbmV3IENoZWNrYm94KCBlbmFibGVkUHJvcGVydHksXG4gICAgbmV3IFRleHQoICdFbmFibGUgc2xpZGVyJywgeyBmb250OiBDSEVDS0JPWF9GT05UIH0gKSwge1xuICAgICAgdGFuZGVtOiBUYW5kZW0uT1BUX09VVCxcbiAgICAgIGxlZnQ6IHNsaWRlci5sZWZ0LFxuICAgICAgdG9wOiBtaW5vclRpY2tzQ2hlY2tib3guYm90dG9tICsgNDBcbiAgICB9ICk7XG5cbiAgLy8gcmVzdHJpY3QgZW5hYmxlZCByYW5nZSBvZiBzbGlkZXJcbiAgY29uc3QgcmVzdHJpY3RlZFJhbmdlUHJvcGVydHkgPSBuZXcgUHJvcGVydHkoIGZhbHNlICk7XG4gIHJlc3RyaWN0ZWRSYW5nZVByb3BlcnR5LmxpbmsoIHJlc3RyaWN0ZWRSYW5nZSA9PiB7XG4gICAgZW5hYmxlZFJhbmdlUHJvcGVydHkudmFsdWUgPSByZXN0cmljdGVkUmFuZ2UgPyBuZXcgUmFuZ2UoIDI1LCA3NSApIDogbmV3IFJhbmdlKCAwLCAxMDAgKTtcbiAgfSApO1xuXG4gIGNvbnN0IGVuYWJsZWRSYW5nZUNoZWNrYm94ID0gbmV3IENoZWNrYm94KCByZXN0cmljdGVkUmFuZ2VQcm9wZXJ0eSxcbiAgICBuZXcgVGV4dCggJ0VuYWJsZSBSYW5nZSBbMjUsIDc1XScsIHsgZm9udDogQ0hFQ0tCT1hfRk9OVCB9ICksIHtcbiAgICAgIHRhbmRlbTogVGFuZGVtLk9QVF9PVVQsXG4gICAgICBsZWZ0OiBzbGlkZXIubGVmdCxcbiAgICAgIHRvcDogZW5hYmxlZENoZWNrYm94LmJvdHRvbSArIDQwXG4gICAgfSApO1xuXG4gIC8vIElmIHRoZSB1c2VyIGlzIGhvbGRpbmcgZG93biB0aGUgdGh1bWIgb3V0c2lkZSBvZiB0aGUgZW5hYmxlZCByYW5nZSwgYW5kIHRoZSBlbmFibGVkIHJhbmdlIGV4cGFuZHMsIHRoZSB2YWx1ZSBzaG91bGRcbiAgLy8gYWRqdXN0IHRvIHRoZSBuZXcgZXh0cmVtdW0gb2YgdGhlIHJhbmdlLCBzZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL21lYW4tc2hhcmUtYW5kLWJhbGFuY2UvaXNzdWVzLzI5XG4gIGNvbnN0IGFuaW1hdGVFbmFibGVkUmFuZ2VQcm9wZXJ0eSA9IG5ldyBCb29sZWFuUHJvcGVydHkoIGZhbHNlICk7XG4gIGNvbnN0IGFuaW1hdGVFbmFibGVkUmFuZ2VDaGVja2JveCA9IG5ldyBDaGVja2JveCggYW5pbWF0ZUVuYWJsZWRSYW5nZVByb3BlcnR5LCBuZXcgVGV4dCggJ0FuaW1hdGUgRW5hYmxlZCBSYW5nZScsIHsgZm9udDogQ0hFQ0tCT1hfRk9OVCB9ICksIHtcbiAgICB0YW5kZW06IFRhbmRlbS5PUFRfT1VULFxuICAgIGxlZnQ6IHNsaWRlci5sZWZ0LFxuICAgIHRvcDogZW5hYmxlZFJhbmdlQ2hlY2tib3guYm90dG9tICsgNDBcbiAgfSApO1xuXG4gIGNvbnN0IGVuYWJsZWRSYW5nZVN0ZXAgPSAwLjE7XG4gIHN0ZXBUaW1lci5hZGRMaXN0ZW5lciggKCkgPT4ge1xuICAgIGlmICggYW5pbWF0ZUVuYWJsZWRSYW5nZVByb3BlcnR5LnZhbHVlICYmIGVuYWJsZWRSYW5nZVByb3BlcnR5LnZhbHVlLm1pbiA8IGVuYWJsZWRSYW5nZVByb3BlcnR5LnZhbHVlLm1heCAtIGVuYWJsZWRSYW5nZVN0ZXAgKSB7XG4gICAgICBlbmFibGVkUmFuZ2VQcm9wZXJ0eS52YWx1ZSA9IG5ldyBSYW5nZSggTWF0aC5tYXgoIGVuYWJsZWRSYW5nZVByb3BlcnR5LnZhbHVlLm1pbiArIGVuYWJsZWRSYW5nZVN0ZXAsIDAgKSwgNzUgKTtcbiAgICB9XG4gIH0gKTtcblxuICAvLyBBbGwgb2YgdGhlIGNvbnRyb2xzIHJlbGF0ZWQgdG8gdGhlIHNsaWRlclxuICBjb25zdCBjb250cm9scyA9IG5ldyBWQm94KCB7XG4gICAgYWxpZ246ICdsZWZ0JyxcbiAgICBzcGFjaW5nOiAzMCxcbiAgICBjaGlsZHJlbjogWyBtYWpvclRpY2tzQ2hlY2tib3gsIG1pbm9yVGlja3NDaGVja2JveCwgZW5hYmxlZENoZWNrYm94LCBlbmFibGVkUmFuZ2VDaGVja2JveCwgYW5pbWF0ZUVuYWJsZWRSYW5nZUNoZWNrYm94IF1cbiAgfSApO1xuXG4gIC8vIFBvc2l0aW9uIHRoZSBjb250cm9sIGJhc2VkIG9uIHRoZSBvcmllbnRhdGlvbiBvZiB0aGUgc2xpZGVyXG4gIGNvbnN0IGJveE9wdGlvbnMgPSB7XG4gICAgc3BhY2luZzogNjAsXG4gICAgY2hpbGRyZW46IFsgc2xpZGVyLCBjb250cm9scyBdLFxuICAgIGNlbnRlcjogbGF5b3V0Qm91bmRzLmNlbnRlclxuICB9O1xuICByZXR1cm4gKCBvcmllbnRhdGlvbiA9PT0gJ2hvcml6b250YWwnICkgPyBuZXcgVkJveCggYm94T3B0aW9ucyApIDogbmV3IEhCb3goIGJveE9wdGlvbnMgKTtcbn1cblxuLy8gQ3JlYXRlcyBhIGRlbW8gZm9yIEhTbGlkZXJcbmV4cG9ydCBmdW5jdGlvbiBkZW1vSFNsaWRlciggbGF5b3V0Qm91bmRzOiBCb3VuZHMyLCBvcHRpb25zPzogU3VuRGVtb09wdGlvbnMgKTogTm9kZSB7XG4gIHJldHVybiBkZW1vU2xpZGVyKCBsYXlvdXRCb3VuZHMsICdob3Jpem9udGFsJywgb3B0aW9ucyApO1xufVxuXG4vLyBDcmVhdGVzIGEgZGVtbyBmb3IgVlNsaWRlclxuZXhwb3J0IGZ1bmN0aW9uIGRlbW9WU2xpZGVyKCBsYXlvdXRCb3VuZHM6IEJvdW5kczIsIG9wdGlvbnM/OiBTdW5EZW1vT3B0aW9ucyApOiBOb2RlIHtcbiAgcmV0dXJuIGRlbW9TbGlkZXIoIGxheW91dEJvdW5kcywgJ3ZlcnRpY2FsJywgb3B0aW9ucyApO1xufSJdLCJuYW1lcyI6WyJCb29sZWFuUHJvcGVydHkiLCJQcm9wZXJ0eSIsInN0ZXBUaW1lciIsIkRpbWVuc2lvbjIiLCJSYW5nZSIsIm9wdGlvbml6ZSIsImNvbWJpbmVPcHRpb25zIiwiRm9udCIsIkhCb3giLCJUZXh0IiwiVkJveCIsIlRhbmRlbSIsIkNoZWNrYm94IiwiSFNsaWRlciIsIlZTbGlkZXIiLCJDSEVDS0JPWF9GT05UIiwic2l6ZSIsImRlbW9TbGlkZXIiLCJsYXlvdXRCb3VuZHMiLCJvcmllbnRhdGlvbiIsInByb3ZpZGVkT3B0aW9ucyIsIm9wdGlvbnMiLCJjZW50ZXIiLCJ0YW5kZW0iLCJSRVFVSVJFRCIsInBoZXRpb0Rlc2lnbmVkIiwicHJvcGVydHkiLCJyYW5nZSIsInRpY2tMYWJlbE9wdGlvbnMiLCJmb250IiwiZW5hYmxlZFJhbmdlUHJvcGVydHkiLCJzbGlkZXIiLCJ0cmFja1NpemUiLCJ0aHVtYlRvdWNoQXJlYVhEaWxhdGlvbiIsInRodW1iVG91Y2hBcmVhWURpbGF0aW9uIiwidGh1bWJNb3VzZUFyZWFYRGlsYXRpb24iLCJ0aHVtYk1vdXNlQXJlYVlEaWxhdGlvbiIsImxhYmVsQ29udGVudCIsImRlc2NyaXB0aW9uQ29udGVudCIsInBoZXRpb0VuYWJsZWRQcm9wZXJ0eUluc3RydW1lbnRlZCIsImVuYWJsZWRQcm9wZXJ0eSIsImFkZE1ham9yVGljayIsIm1pbiIsImdldENlbnRlciIsIm1heCIsImFkZE1pbm9yVGljayIsImdldExlbmd0aCIsIm1ham9yVGlja3NWaXNpYmxlUHJvcGVydHkiLCJsaW5rIiwidmlzaWJsZSIsIm1ham9yVGlja3NWaXNpYmxlIiwibWFqb3JUaWNrc0NoZWNrYm94IiwiT1BUX09VVCIsImxlZnQiLCJ0b3AiLCJib3R0b20iLCJtaW5vclRpY2tzVmlzaWJsZVByb3BlcnR5IiwibWlub3JUaWNrc1Zpc2libGUiLCJtaW5vclRpY2tzQ2hlY2tib3giLCJlbmFibGVkQ2hlY2tib3giLCJyZXN0cmljdGVkUmFuZ2VQcm9wZXJ0eSIsInJlc3RyaWN0ZWRSYW5nZSIsInZhbHVlIiwiZW5hYmxlZFJhbmdlQ2hlY2tib3giLCJhbmltYXRlRW5hYmxlZFJhbmdlUHJvcGVydHkiLCJhbmltYXRlRW5hYmxlZFJhbmdlQ2hlY2tib3giLCJlbmFibGVkUmFuZ2VTdGVwIiwiYWRkTGlzdGVuZXIiLCJNYXRoIiwiY29udHJvbHMiLCJhbGlnbiIsInNwYWNpbmciLCJjaGlsZHJlbiIsImJveE9wdGlvbnMiLCJkZW1vSFNsaWRlciIsImRlbW9WU2xpZGVyIl0sIm1hcHBpbmdzIjoiQUFBQSxzREFBc0Q7QUFFdEQ7Ozs7Q0FJQyxHQUVELE9BQU9BLHFCQUFxQix5Q0FBeUM7QUFDckUsT0FBT0MsY0FBYyxrQ0FBa0M7QUFDdkQsT0FBT0MsZUFBZSxtQ0FBbUM7QUFFekQsT0FBT0MsZ0JB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