// Copyright 2014-2023, University of Colorado Boulder
/**
 * Banner that is used to present information to the user as they work through a challenge.
 *
 * @author John Blanco
 */ import Property from '../../../../axon/js/Property.js';
import Fraction from '../../../../phetcommon/js/model/Fraction.js';
import StringUtils from '../../../../phetcommon/js/util/StringUtils.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { Node, Rectangle, Text } from '../../../../scenery/js/imports.js';
import Animation from '../../../../twixt/js/Animation.js';
import Easing from '../../../../twixt/js/Easing.js';
import areaBuilder from '../../areaBuilder.js';
import AreaBuilderStrings from '../../AreaBuilderStrings.js';
import ColorProportionsPrompt from './ColorProportionsPrompt.js';
const areaEqualsString = AreaBuilderStrings.areaEquals;
const perimeterEqualsString = AreaBuilderStrings.perimeterEquals;
// constants
const TEXT_FILL_COLOR = 'white';
const TITLE_FONT = new PhetFont({
    size: 24,
    weight: 'bold'
}); // Font used for the title
const LARGER_FONT = new PhetFont({
    size: 24
}); // Font for single line text
const SMALLER_FONT = new PhetFont({
    size: 18
}); // Font for two-line text
const TITLE_INDENT = 15; // Empirically determined.
const ANIMATION_TIME = 0.6; // In seconds
let GameInfoBanner = class GameInfoBanner extends Rectangle {
    /**
   * @public
   */ reset() {
        this.titleStringProperty.reset();
        this.buildSpecProperty.reset();
        this.areaToFindProperty.reset();
    }
    /**
   * @param {number} width
   * @param {number} height
   * @param {string} backgroundColor
   * @param {Object} [options]
   */ constructor(width, height, backgroundColor, options){
        super(0, 0, width, height, 0, 0, {
            fill: backgroundColor
        });
        // @public These properties are the main API for this class, and they control what is and isn't shown on the banner.
        this.titleStringProperty = new Property('');
        this.buildSpecProperty = new Property(null);
        this.areaToFindProperty = new Property(null);
        // Define the title.
        const title = new Text(this.titleStringProperty, {
            font: TITLE_FONT,
            fill: TEXT_FILL_COLOR,
            centerY: height / 2,
            maxWidth: width * 0.3 // must be small enough that the prompt can also fit on the banner
        });
        this.addChild(title);
        // Update the title when the title text changes.
        this.titleStringProperty.link(()=>{
            title.centerY = height / 2;
            if (this.buildSpecProperty.value === null && this.areaToFindProperty.value === null) {
                // There is no build spec are area to find, so center the title in the banner.
                title.centerX = width / 2;
            } else {
                // There is a build spec, so the title should be on the left to make room.
                title.left = TITLE_INDENT;
            }
        });
        // Define the build prompt, which is shown in both the challenge prompt and the solution.
        const buildPrompt = new Node();
        this.addChild(buildPrompt);
        const maxBuildPromptWidth = width / 2; // the build prompt has to fit in the banner with the title
        const areaPrompt = new Text('', {
            font: SMALLER_FONT,
            fill: TEXT_FILL_COLOR,
            top: 0
        });
        buildPrompt.addChild(areaPrompt);
        const perimeterPrompt = new Text('', {
            font: SMALLER_FONT,
            fill: TEXT_FILL_COLOR,
            top: 0
        });
        buildPrompt.addChild(perimeterPrompt);
        const colorProportionPrompt = new ColorProportionsPrompt('black', 'white', new Fraction(1, 1), {
            font: new PhetFont({
                size: 11
            }),
            textFill: TEXT_FILL_COLOR,
            top: 0
        });
        buildPrompt.addChild(colorProportionPrompt);
        // Function that moves the title from the center of the banner to the left side if it isn't already there.
        function moveTitleToSide() {
            if (title.centerX === width / 2) {
                // Move the title over
                new Animation({
                    from: title.left,
                    to: TITLE_INDENT,
                    setValue: (left)=>{
                        title.left = left;
                    },
                    duration: ANIMATION_TIME,
                    easing: Easing.CUBIC_IN_OUT
                }).start();
                // Fade in the build prompt if it is now set to be visible.
                if (buildPrompt.visible) {
                    buildPrompt.opacity = 0;
                    new Animation({
                        from: 0,
                        to: 1,
                        setValue: (opacity)=>{
                            buildPrompt.opacity = opacity;
                        },
                        duration: ANIMATION_TIME,
                        easing: Easing.CUBIC_IN_OUT
                    }).start();
                }
            }
        }
        // Function that positions the build prompt such that its visible bounds are centered in the space to the left of
        // the title.
        function positionBuildPrompt() {
            const centerX = (TITLE_INDENT + title.width + width - TITLE_INDENT) / 2;
            const centerY = height / 2;
            buildPrompt.setScaleMagnitude(1);
            if (buildPrompt.width > maxBuildPromptWidth) {
                // scale the build prompt to fit with the title on the banner
                buildPrompt.setScaleMagnitude(maxBuildPromptWidth / buildPrompt.width);
            }
            buildPrompt.left += centerX - buildPrompt.visibleBounds.centerX;
            buildPrompt.top += centerY - buildPrompt.visibleBounds.centerY;
        }
        // Update the prompt or solution text based on the build spec.
        this.buildSpecProperty.link((buildSpec)=>{
            assert && assert(this.areaToFindProperty.value === null, 'Can\'t display area to find and build spec at the same time.');
            assert && assert(buildSpec === null || buildSpec.area, 'Area must be specified in the build spec');
            if (buildSpec !== null) {
                areaPrompt.string = StringUtils.format(areaEqualsString, buildSpec.area);
                areaPrompt.visible = true;
                if (!buildSpec.perimeter && !buildSpec.proportions) {
                    areaPrompt.font = LARGER_FONT;
                    perimeterPrompt.visible = false;
                    colorProportionPrompt.visible = false;
                } else {
                    areaPrompt.font = SMALLER_FONT;
                    if (buildSpec.perimeter) {
                        perimeterPrompt.string = StringUtils.format(perimeterEqualsString, buildSpec.perimeter);
                        perimeterPrompt.visible = true;
                    } else {
                        perimeterPrompt.visible = false;
                    }
                    if (buildSpec.proportions) {
                        areaPrompt.string += ',';
                        colorProportionPrompt.color1 = buildSpec.proportions.color1;
                        colorProportionPrompt.color2 = buildSpec.proportions.color2;
                        colorProportionPrompt.color1Proportion = buildSpec.proportions.color1Proportion;
                        colorProportionPrompt.visible = true;
                    } else {
                        colorProportionPrompt.visible = false;
                    }
                }
                // Update the layout
                perimeterPrompt.top = areaPrompt.bottom + areaPrompt.height * 0.25; // Spacing empirically determined.
                colorProportionPrompt.left = areaPrompt.right + 10; // Spacing empirically determined
                colorProportionPrompt.centerY = areaPrompt.centerY;
                positionBuildPrompt();
                // Make sure the title is over on the left side.
                moveTitleToSide();
            } else {
                areaPrompt.visible = this.areaToFindProperty.value !== null;
                perimeterPrompt.visible = false;
                colorProportionPrompt.visible = false;
            }
        });
        // Update the area indication (used in solution for 'find the area' challenges).
        this.areaToFindProperty.link((areaToFind)=>{
            assert && assert(this.buildSpecProperty.value === null, 'Can\'t display area to find and build spec at the same time.');
            if (areaToFind !== null) {
                areaPrompt.string = StringUtils.format(areaEqualsString, areaToFind);
                areaPrompt.font = LARGER_FONT;
                areaPrompt.visible = true;
                // The other prompts (perimeter and color proportions) are not shown in this situation.
                perimeterPrompt.visible = false;
                colorProportionPrompt.visible = false;
                // Place the build prompt where it needs to go.
                positionBuildPrompt();
                // Make sure the title is over on the left side.
                moveTitleToSide();
            } else {
                areaPrompt.visible = this.buildSpecProperty.value !== null;
            }
        });
        // Pass options through to parent class.
        this.mutate(options);
    }
};
areaBuilder.register('GameInfoBanner', GameInfoBanner);
export default GameInfoBanner;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL2FyZWEtYnVpbGRlci9qcy9nYW1lL3ZpZXcvR2FtZUluZm9CYW5uZXIuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTQtMjAyMywgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbi8qKlxuICogQmFubmVyIHRoYXQgaXMgdXNlZCB0byBwcmVzZW50IGluZm9ybWF0aW9uIHRvIHRoZSB1c2VyIGFzIHRoZXkgd29yayB0aHJvdWdoIGEgY2hhbGxlbmdlLlxuICpcbiAqIEBhdXRob3IgSm9obiBCbGFuY29cbiAqL1xuXG5pbXBvcnQgUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9Qcm9wZXJ0eS5qcyc7XG5pbXBvcnQgRnJhY3Rpb24gZnJvbSAnLi4vLi4vLi4vLi4vcGhldGNvbW1vbi9qcy9tb2RlbC9GcmFjdGlvbi5qcyc7XG5pbXBvcnQgU3RyaW5nVXRpbHMgZnJvbSAnLi4vLi4vLi4vLi4vcGhldGNvbW1vbi9qcy91dGlsL1N0cmluZ1V0aWxzLmpzJztcbmltcG9ydCBQaGV0Rm9udCBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5LXBoZXQvanMvUGhldEZvbnQuanMnO1xuaW1wb3J0IHsgTm9kZSwgUmVjdGFuZ2xlLCBUZXh0IH0gZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcbmltcG9ydCBBbmltYXRpb24gZnJvbSAnLi4vLi4vLi4vLi4vdHdpeHQvanMvQW5pbWF0aW9uLmpzJztcbmltcG9ydCBFYXNpbmcgZnJvbSAnLi4vLi4vLi4vLi4vdHdpeHQvanMvRWFzaW5nLmpzJztcbmltcG9ydCBhcmVhQnVpbGRlciBmcm9tICcuLi8uLi9hcmVhQnVpbGRlci5qcyc7XG5pbXBvcnQgQXJlYUJ1aWxkZXJTdHJpbmdzIGZyb20gJy4uLy4uL0FyZWFCdWlsZGVyU3RyaW5ncy5qcyc7XG5pbXBvcnQgQ29sb3JQcm9wb3J0aW9uc1Byb21wdCBmcm9tICcuL0NvbG9yUHJvcG9ydGlvbnNQcm9tcHQuanMnO1xuXG5jb25zdCBhcmVhRXF1YWxzU3RyaW5nID0gQXJlYUJ1aWxkZXJTdHJpbmdzLmFyZWFFcXVhbHM7XG5jb25zdCBwZXJpbWV0ZXJFcXVhbHNTdHJpbmcgPSBBcmVhQnVpbGRlclN0cmluZ3MucGVyaW1ldGVyRXF1YWxzO1xuXG4vLyBjb25zdGFudHNcbmNvbnN0IFRFWFRfRklMTF9DT0xPUiA9ICd3aGl0ZSc7XG5jb25zdCBUSVRMRV9GT05UID0gbmV3IFBoZXRGb250KCB7IHNpemU6IDI0LCB3ZWlnaHQ6ICdib2xkJyB9ICk7IC8vIEZvbnQgdXNlZCBmb3IgdGhlIHRpdGxlXG5jb25zdCBMQVJHRVJfRk9OVCA9IG5ldyBQaGV0Rm9udCggeyBzaXplOiAyNCB9ICk7IC8vIEZvbnQgZm9yIHNpbmdsZSBsaW5lIHRleHRcbmNvbnN0IFNNQUxMRVJfRk9OVCA9IG5ldyBQaGV0Rm9udCggeyBzaXplOiAxOCB9ICk7IC8vIEZvbnQgZm9yIHR3by1saW5lIHRleHRcbmNvbnN0IFRJVExFX0lOREVOVCA9IDE1OyAvLyBFbXBpcmljYWxseSBkZXRlcm1pbmVkLlxuY29uc3QgQU5JTUFUSU9OX1RJTUUgPSAwLjY7IC8vIEluIHNlY29uZHNcblxuY2xhc3MgR2FtZUluZm9CYW5uZXIgZXh0ZW5kcyBSZWN0YW5nbGUge1xuXG4gIC8qKlxuICAgKiBAcGFyYW0ge251bWJlcn0gd2lkdGhcbiAgICogQHBhcmFtIHtudW1iZXJ9IGhlaWdodFxuICAgKiBAcGFyYW0ge3N0cmluZ30gYmFja2dyb3VuZENvbG9yXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9uc11cbiAgICovXG4gIGNvbnN0cnVjdG9yKCB3aWR0aCwgaGVpZ2h0LCBiYWNrZ3JvdW5kQ29sb3IsIG9wdGlvbnMgKSB7XG4gICAgc3VwZXIoIDAsIDAsIHdpZHRoLCBoZWlnaHQsIDAsIDAsIHsgZmlsbDogYmFja2dyb3VuZENvbG9yIH0gKTtcblxuICAgIC8vIEBwdWJsaWMgVGhlc2UgcHJvcGVydGllcyBhcmUgdGhlIG1haW4gQVBJIGZvciB0aGlzIGNsYXNzLCBhbmQgdGhleSBjb250cm9sIHdoYXQgaXMgYW5kIGlzbid0IHNob3duIG9uIHRoZSBiYW5uZXIuXG4gICAgdGhpcy50aXRsZVN0cmluZ1Byb3BlcnR5ID0gbmV3IFByb3BlcnR5KCAnJyApO1xuICAgIHRoaXMuYnVpbGRTcGVjUHJvcGVydHkgPSBuZXcgUHJvcGVydHkoIG51bGwgKTtcbiAgICB0aGlzLmFyZWFUb0ZpbmRQcm9wZXJ0eSA9IG5ldyBQcm9wZXJ0eSggbnVsbCApO1xuXG4gICAgLy8gRGVmaW5lIHRoZSB0aXRsZS5cbiAgICBjb25zdCB0aXRsZSA9IG5ldyBUZXh0KCB0aGlzLnRpdGxlU3RyaW5nUHJvcGVydHksIHtcbiAgICAgIGZvbnQ6IFRJVExFX0ZPTlQsXG4gICAgICBmaWxsOiBURVhUX0ZJTExfQ09MT1IsXG4gICAgICBjZW50ZXJZOiBoZWlnaHQgLyAyLFxuICAgICAgbWF4V2lkdGg6IHdpZHRoICogMC4zIC8vIG11c3QgYmUgc21hbGwgZW5vdWdoIHRoYXQgdGhlIHByb21wdCBjYW4gYWxzbyBmaXQgb24gdGhlIGJhbm5lclxuICAgIH0gKTtcbiAgICB0aGlzLmFkZENoaWxkKCB0aXRsZSApO1xuXG4gICAgLy8gVXBkYXRlIHRoZSB0aXRsZSB3aGVuIHRoZSB0aXRsZSB0ZXh0IGNoYW5nZXMuXG4gICAgdGhpcy50aXRsZVN0cmluZ1Byb3BlcnR5LmxpbmsoICgpID0+IHtcbiAgICAgIHRpdGxlLmNlbnRlclkgPSBoZWlnaHQgLyAyO1xuICAgICAgaWYgKCB0aGlzLmJ1aWxkU3BlY1Byb3BlcnR5LnZhbHVlID09PSBudWxsICYmIHRoaXMuYXJlYVRvRmluZFByb3BlcnR5LnZhbHVlID09PSBudWxsICkge1xuICAgICAgICAvLyBUaGVyZSBpcyBubyBidWlsZCBzcGVjIGFyZSBhcmVhIHRvIGZpbmQsIHNvIGNlbnRlciB0aGUgdGl0bGUgaW4gdGhlIGJhbm5lci5cbiAgICAgICAgdGl0bGUuY2VudGVyWCA9IHdpZHRoIC8gMjtcbiAgICAgIH1cbiAgICAgIGVsc2Uge1xuICAgICAgICAvLyBUaGVyZSBpcyBhIGJ1aWxkIHNwZWMsIHNvIHRoZSB0aXRsZSBzaG91bGQgYmUgb24gdGhlIGxlZnQgdG8gbWFrZSByb29tLlxuICAgICAgICB0aXRsZS5sZWZ0ID0gVElUTEVfSU5ERU5UO1xuICAgICAgfVxuICAgIH0gKTtcblxuICAgIC8vIERlZmluZSB0aGUgYnVpbGQgcHJvbXB0LCB3aGljaCBpcyBzaG93biBpbiBib3RoIHRoZSBjaGFsbGVuZ2UgcHJvbXB0IGFuZCB0aGUgc29sdXRpb24uXG4gICAgY29uc3QgYnVpbGRQcm9tcHQgPSBuZXcgTm9kZSgpO1xuICAgIHRoaXMuYWRkQ2hpbGQoIGJ1aWxkUHJvbXB0ICk7XG4gICAgY29uc3QgbWF4QnVpbGRQcm9tcHRXaWR0aCA9IHdpZHRoIC8gMjsgLy8gdGhlIGJ1aWxkIHByb21wdCBoYXMgdG8gZml0IGluIHRoZSBiYW5uZXIgd2l0aCB0aGUgdGl0bGVcbiAgICBjb25zdCBhcmVhUHJvbXB0ID0gbmV3IFRleHQoICcnLCB7IGZvbnQ6IFNNQUxMRVJfRk9OVCwgZmlsbDogVEVYVF9GSUxMX0NPTE9SLCB0b3A6IDAgfSApO1xuICAgIGJ1aWxkUHJvbXB0LmFkZENoaWxkKCBhcmVhUHJvbXB0ICk7XG4gICAgY29uc3QgcGVyaW1ldGVyUHJvbXB0ID0gbmV3IFRleHQoICcnLCB7IGZvbnQ6IFNNQUxMRVJfRk9OVCwgZmlsbDogVEVYVF9GSUxMX0NPTE9SLCB0b3A6IDAgfSApO1xuICAgIGJ1aWxkUHJvbXB0LmFkZENoaWxkKCBwZXJpbWV0ZXJQcm9tcHQgKTtcbiAgICBjb25zdCBjb2xvclByb3BvcnRpb25Qcm9tcHQgPSBuZXcgQ29sb3JQcm9wb3J0aW9uc1Byb21wdCggJ2JsYWNrJywgJ3doaXRlJyxcbiAgICAgIG5ldyBGcmFjdGlvbiggMSwgMSApLCB7XG4gICAgICAgIGZvbnQ6IG5ldyBQaGV0Rm9udCggeyBzaXplOiAxMSB9ICksXG4gICAgICAgIHRleHRGaWxsOiBURVhUX0ZJTExfQ09MT1IsXG4gICAgICAgIHRvcDogMFxuICAgICAgfSApO1xuICAgIGJ1aWxkUHJvbXB0LmFkZENoaWxkKCBjb2xvclByb3BvcnRpb25Qcm9tcHQgKTtcblxuICAgIC8vIEZ1bmN0aW9uIHRoYXQgbW92ZXMgdGhlIHRpdGxlIGZyb20gdGhlIGNlbnRlciBvZiB0aGUgYmFubmVyIHRvIHRoZSBsZWZ0IHNpZGUgaWYgaXQgaXNuJ3QgYWxyZWFkeSB0aGVyZS5cbiAgICBmdW5jdGlvbiBtb3ZlVGl0bGVUb1NpZGUoKSB7XG4gICAgICBpZiAoIHRpdGxlLmNlbnRlclggPT09IHdpZHRoIC8gMiApIHtcbiAgICAgICAgLy8gTW92ZSB0aGUgdGl0bGUgb3ZlclxuICAgICAgICBuZXcgQW5pbWF0aW9uKCB7XG4gICAgICAgICAgZnJvbTogdGl0bGUubGVmdCxcbiAgICAgICAgICB0bzogVElUTEVfSU5ERU5ULFxuICAgICAgICAgIHNldFZhbHVlOiBsZWZ0ID0+IHsgdGl0bGUubGVmdCA9IGxlZnQ7IH0sXG4gICAgICAgICAgZHVyYXRpb246IEFOSU1BVElPTl9USU1FLFxuICAgICAgICAgIGVhc2luZzogRWFzaW5nLkNVQklDX0lOX09VVFxuICAgICAgICB9ICkuc3RhcnQoKTtcblxuICAgICAgICAvLyBGYWRlIGluIHRoZSBidWlsZCBwcm9tcHQgaWYgaXQgaXMgbm93IHNldCB0byBiZSB2aXNpYmxlLlxuICAgICAgICBpZiAoIGJ1aWxkUHJvbXB0LnZpc2libGUgKSB7XG4gICAgICAgICAgYnVpbGRQcm9tcHQub3BhY2l0eSA9IDA7XG4gICAgICAgICAgbmV3IEFuaW1hdGlvbigge1xuICAgICAgICAgICAgZnJvbTogMCxcbiAgICAgICAgICAgIHRvOiAxLFxuICAgICAgICAgICAgc2V0VmFsdWU6IG9wYWNpdHkgPT4geyBidWlsZFByb21wdC5vcGFjaXR5ID0gb3BhY2l0eTsgfSxcbiAgICAgICAgICAgIGR1cmF0aW9uOiBBTklNQVRJT05fVElNRSxcbiAgICAgICAgICAgIGVhc2luZzogRWFzaW5nLkNVQklDX0lOX09VVFxuICAgICAgICAgIH0gKS5zdGFydCgpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gRnVuY3Rpb24gdGhhdCBwb3NpdGlvbnMgdGhlIGJ1aWxkIHByb21wdCBzdWNoIHRoYXQgaXRzIHZpc2libGUgYm91bmRzIGFyZSBjZW50ZXJlZCBpbiB0aGUgc3BhY2UgdG8gdGhlIGxlZnQgb2ZcbiAgICAvLyB0aGUgdGl0bGUuXG4gICAgZnVuY3Rpb24gcG9zaXRpb25CdWlsZFByb21wdCgpIHtcbiAgICAgIGNvbnN0IGNlbnRlclggPSAoIFRJVExFX0lOREVOVCArIHRpdGxlLndpZHRoICsgd2lkdGggLSBUSVRMRV9JTkRFTlQgKSAvIDI7XG4gICAgICBjb25zdCBjZW50ZXJZID0gaGVpZ2h0IC8gMjtcbiAgICAgIGJ1aWxkUHJvbXB0LnNldFNjYWxlTWFnbml0dWRlKCAxICk7XG4gICAgICBpZiAoIGJ1aWxkUHJvbXB0LndpZHRoID4gbWF4QnVpbGRQcm9tcHRXaWR0aCApIHtcbiAgICAgICAgLy8gc2NhbGUgdGhlIGJ1aWxkIHByb21wdCB0byBmaXQgd2l0aCB0aGUgdGl0bGUgb24gdGhlIGJhbm5lclxuICAgICAgICBidWlsZFByb21wdC5zZXRTY2FsZU1hZ25pdHVkZSggbWF4QnVpbGRQcm9tcHRXaWR0aCAvIGJ1aWxkUHJvbXB0LndpZHRoICk7XG4gICAgICB9XG4gICAgICBidWlsZFByb21wdC5sZWZ0ICs9IGNlbnRlclggLSBidWlsZFByb21wdC52aXNpYmxlQm91bmRzLmNlbnRlclg7XG4gICAgICBidWlsZFByb21wdC50b3AgKz0gY2VudGVyWSAtIGJ1aWxkUHJvbXB0LnZpc2libGVCb3VuZHMuY2VudGVyWTtcbiAgICB9XG5cbiAgICAvLyBVcGRhdGUgdGhlIHByb21wdCBvciBzb2x1dGlvbiB0ZXh0IGJhc2VkIG9uIHRoZSBidWlsZCBzcGVjLlxuICAgIHRoaXMuYnVpbGRTcGVjUHJvcGVydHkubGluayggYnVpbGRTcGVjID0+IHtcbiAgICAgIGFzc2VydCAmJiBhc3NlcnQoIHRoaXMuYXJlYVRvRmluZFByb3BlcnR5LnZhbHVlID09PSBudWxsLCAnQ2FuXFwndCBkaXNwbGF5IGFyZWEgdG8gZmluZCBhbmQgYnVpbGQgc3BlYyBhdCB0aGUgc2FtZSB0aW1lLicgKTtcbiAgICAgIGFzc2VydCAmJiBhc3NlcnQoIGJ1aWxkU3BlYyA9PT0gbnVsbCB8fCBidWlsZFNwZWMuYXJlYSwgJ0FyZWEgbXVzdCBiZSBzcGVjaWZpZWQgaW4gdGhlIGJ1aWxkIHNwZWMnICk7XG4gICAgICBpZiAoIGJ1aWxkU3BlYyAhPT0gbnVsbCApIHtcbiAgICAgICAgYXJlYVByb21wdC5zdHJpbmcgPSBTdHJpbmdVdGlscy5mb3JtYXQoIGFyZWFFcXVhbHNTdHJpbmcsIGJ1aWxkU3BlYy5hcmVhICk7XG4gICAgICAgIGFyZWFQcm9tcHQudmlzaWJsZSA9IHRydWU7XG4gICAgICAgIGlmICggIWJ1aWxkU3BlYy5wZXJpbWV0ZXIgJiYgIWJ1aWxkU3BlYy5wcm9wb3J0aW9ucyApIHtcbiAgICAgICAgICBhcmVhUHJvbXB0LmZvbnQgPSBMQVJHRVJfRk9OVDtcbiAgICAgICAgICBwZXJpbWV0ZXJQcm9tcHQudmlzaWJsZSA9IGZhbHNlO1xuICAgICAgICAgIGNvbG9yUHJvcG9ydGlvblByb21wdC52aXNpYmxlID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgYXJlYVByb21wdC5mb250ID0gU01BTExFUl9GT05UO1xuICAgICAgICAgIGlmICggYnVpbGRTcGVjLnBlcmltZXRlciApIHtcbiAgICAgICAgICAgIHBlcmltZXRlclByb21wdC5zdHJpbmcgPSBTdHJpbmdVdGlscy5mb3JtYXQoIHBlcmltZXRlckVxdWFsc1N0cmluZywgYnVpbGRTcGVjLnBlcmltZXRlciApO1xuICAgICAgICAgICAgcGVyaW1ldGVyUHJvbXB0LnZpc2libGUgPSB0cnVlO1xuICAgICAgICAgIH1cbiAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHBlcmltZXRlclByb21wdC52aXNpYmxlID0gZmFsc2U7XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmICggYnVpbGRTcGVjLnByb3BvcnRpb25zICkge1xuICAgICAgICAgICAgYXJlYVByb21wdC5zdHJpbmcgKz0gJywnO1xuICAgICAgICAgICAgY29sb3JQcm9wb3J0aW9uUHJvbXB0LmNvbG9yMSA9IGJ1aWxkU3BlYy5wcm9wb3J0aW9ucy5jb2xvcjE7XG4gICAgICAgICAgICBjb2xvclByb3BvcnRpb25Qcm9tcHQuY29sb3IyID0gYnVpbGRTcGVjLnByb3BvcnRpb25zLmNvbG9yMjtcbiAgICAgICAgICAgIGNvbG9yUHJvcG9ydGlvblByb21wdC5jb2xvcjFQcm9wb3J0aW9uID0gYnVpbGRTcGVjLnByb3BvcnRpb25zLmNvbG9yMVByb3BvcnRpb247XG4gICAgICAgICAgICBjb2xvclByb3BvcnRpb25Qcm9tcHQudmlzaWJsZSA9IHRydWU7XG4gICAgICAgICAgfVxuICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgY29sb3JQcm9wb3J0aW9uUHJvbXB0LnZpc2libGUgPSBmYWxzZTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvLyBVcGRhdGUgdGhlIGxheW91dFxuICAgICAgICBwZXJpbWV0ZXJQcm9tcHQudG9wID0gYXJlYVByb21wdC5ib3R0b20gKyBhcmVhUHJvbXB0LmhlaWdodCAqIDAuMjU7IC8vIFNwYWNpbmcgZW1waXJpY2FsbHkgZGV0ZXJtaW5lZC5cbiAgICAgICAgY29sb3JQcm9wb3J0aW9uUHJvbXB0LmxlZnQgPSBhcmVhUHJvbXB0LnJpZ2h0ICsgMTA7IC8vIFNwYWNpbmcgZW1waXJpY2FsbHkgZGV0ZXJtaW5lZFxuICAgICAgICBjb2xvclByb3BvcnRpb25Qcm9tcHQuY2VudGVyWSA9IGFyZWFQcm9tcHQuY2VudGVyWTtcbiAgICAgICAgcG9zaXRpb25CdWlsZFByb21wdCgpO1xuXG4gICAgICAgIC8vIE1ha2Ugc3VyZSB0aGUgdGl0bGUgaXMgb3ZlciBvbiB0aGUgbGVmdCBzaWRlLlxuICAgICAgICBtb3ZlVGl0bGVUb1NpZGUoKTtcbiAgICAgIH1cbiAgICAgIGVsc2Uge1xuICAgICAgICBhcmVhUHJvbXB0LnZpc2libGUgPSB0aGlzLmFyZWFUb0ZpbmRQcm9wZXJ0eS52YWx1ZSAhPT0gbnVsbDtcbiAgICAgICAgcGVyaW1ldGVyUHJvbXB0LnZpc2libGUgPSBmYWxzZTtcbiAgICAgICAgY29sb3JQcm9wb3J0aW9uUHJvbXB0LnZpc2libGUgPSBmYWxzZTtcbiAgICAgIH1cbiAgICB9ICk7XG5cbiAgICAvLyBVcGRhdGUgdGhlIGFyZWEgaW5kaWNhdGlvbiAodXNlZCBpbiBzb2x1dGlvbiBmb3IgJ2ZpbmQgdGhlIGFyZWEnIGNoYWxsZW5nZXMpLlxuICAgIHRoaXMuYXJlYVRvRmluZFByb3BlcnR5LmxpbmsoIGFyZWFUb0ZpbmQgPT4ge1xuICAgICAgYXNzZXJ0ICYmIGFzc2VydCggdGhpcy5idWlsZFNwZWNQcm9wZXJ0eS52YWx1ZSA9PT0gbnVsbCwgJ0NhblxcJ3QgZGlzcGxheSBhcmVhIHRvIGZpbmQgYW5kIGJ1aWxkIHNwZWMgYXQgdGhlIHNhbWUgdGltZS4nICk7XG4gICAgICBpZiAoIGFyZWFUb0ZpbmQgIT09IG51bGwgKSB7XG4gICAgICAgIGFyZWFQcm9tcHQuc3RyaW5nID0gU3RyaW5nVXRpbHMuZm9ybWF0KCBhcmVhRXF1YWxzU3RyaW5nLCBhcmVhVG9GaW5kICk7XG4gICAgICAgIGFyZWFQcm9tcHQuZm9udCA9IExBUkdFUl9GT05UO1xuICAgICAgICBhcmVhUHJvbXB0LnZpc2libGUgPSB0cnVlO1xuXG4gICAgICAgIC8vIFRoZSBvdGhlciBwcm9tcHRzIChwZXJpbWV0ZXIgYW5kIGNvbG9yIHByb3BvcnRpb25zKSBhcmUgbm90IHNob3duIGluIHRoaXMgc2l0dWF0aW9uLlxuICAgICAgICBwZXJpbWV0ZXJQcm9tcHQudmlzaWJsZSA9IGZhbHNlO1xuICAgICAgICBjb2xvclByb3BvcnRpb25Qcm9tcHQudmlzaWJsZSA9IGZhbHNlO1xuXG4gICAgICAgIC8vIFBsYWNlIHRoZSBidWlsZCBwcm9tcHQgd2hlcmUgaXQgbmVlZHMgdG8gZ28uXG4gICAgICAgIHBvc2l0aW9uQnVpbGRQcm9tcHQoKTtcblxuICAgICAgICAvLyBNYWtlIHN1cmUgdGhlIHRpdGxlIGlzIG92ZXIgb24gdGhlIGxlZnQgc2lkZS5cbiAgICAgICAgbW92ZVRpdGxlVG9TaWRlKCk7XG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgYXJlYVByb21wdC52aXNpYmxlID0gdGhpcy5idWlsZFNwZWNQcm9wZXJ0eS52YWx1ZSAhPT0gbnVsbDtcbiAgICAgIH1cbiAgICB9ICk7XG5cbiAgICAvLyBQYXNzIG9wdGlvbnMgdGhyb3VnaCB0byBwYXJlbnQgY2xhc3MuXG4gICAgdGhpcy5tdXRhdGUoIG9wdGlvbnMgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcHVibGljXG4gICAqL1xuICByZXNldCgpIHtcbiAgICB0aGlzLnRpdGxlU3RyaW5nUHJvcGVydHkucmVzZXQoKTtcbiAgICB0aGlzLmJ1aWxkU3BlY1Byb3BlcnR5LnJlc2V0KCk7XG4gICAgdGhpcy5hcmVhVG9GaW5kUHJvcGVydHkucmVzZXQoKTtcbiAgfVxufVxuXG5hcmVhQnVpbGRlci5yZWdpc3RlciggJ0dhbWVJbmZvQmFubmVyJywgR2FtZUluZm9CYW5uZXIgKTtcbmV4cG9ydCBkZWZhdWx0IEdhbWVJbmZvQmFubmVyOyJdLCJuYW1lcyI6WyJQcm9wZXJ0eSIsIkZyYWN0aW9uIiwiU3RyaW5nVXRpbHMiLCJQaGV0Rm9udCIsIk5vZGUiLCJSZWN0YW5nbGUiLCJUZXh0IiwiQW5pbWF0aW9uIiwiRWFzaW5nIiwiYXJlYUJ1aWxkZXIiLCJBcmVhQnVpbGRlclN0cmluZ3MiLCJDb2xvclByb3BvcnRpb25zUHJvbXB0IiwiYXJlYUVxdWFsc1N0cmluZyIsImFyZWFFcXVhbHMiLCJwZXJpbWV0ZXJFcXVhbHNTdHJpbmciLCJwZXJpbWV0ZXJFcXVhbHMiLCJURVhUX0ZJTExfQ09MT1IiLCJUSVRMRV9GT05UIiwic2l6ZSIsIndlaWdodCIsIkxBUkdFUl9GT05UIiwiU01BTExFUl9GT05UIiwiVElUTEVfSU5ERU5UIiwiQU5JTUFUSU9OX1RJTUUiLCJHYW1lSW5mb0Jhbm5lciIsInJlc2V0IiwidGl0bGVTdHJpbmdQcm9wZXJ0eSIsImJ1aWxkU3BlY1Byb3BlcnR5IiwiYXJlYVRvRmluZFByb3BlcnR5IiwiY29uc3RydWN0b3IiLCJ3aWR0aCIsImhlaWdodCIsImJhY2tncm91bmRDb2xvciIsIm9wdGlvbnMiLCJmaWxsIiwidGl0bGUiLCJmb250IiwiY2VudGVyWSIsIm1heFdpZHRoIiwiYWRkQ2hpbGQiLCJsaW5rIiwidmFsdWUiLCJjZW50ZXJYIiwibGVmdCIsImJ1aWxkUHJvbXB0IiwibWF4QnVpbGRQcm9tcHRXaWR0aCIsImFyZWFQcm9tcHQiLCJ0b3AiLCJwZXJpbWV0ZXJQcm9tcHQiLCJjb2xvclByb3BvcnRpb25Qcm9tcHQiLCJ0ZXh0RmlsbCIsIm1vdmVUaXRsZVRvU2lkZSIsImZyb20iLCJ0byIsInNldFZhbHVlIiwiZHVyYXRpb24iLCJlYXNpbmciLCJDVUJJQ19JTl9PVVQiLCJzdGFydCIsInZpc2libGUiLCJvcGFjaXR5IiwicG9zaXRpb25CdWlsZFByb21wdCIsInNldFNjYWxlTWFnbml0dWRlIiwidmlzaWJsZUJvdW5kcyIsImJ1aWxkU3BlYyIsImFzc2VydCIsImFyZWEiLCJzdHJpbmciLCJmb3JtYXQiLCJwZXJpbWV0ZXIiLCJwcm9wb3J0aW9ucyIsImNvbG9yMSIsImNvbG9yMiIsImNvbG9yMVByb3BvcnRpb24iLCJib3R0b20iLCJyaWdodCIsImFyZWFUb0ZpbmQiLCJtdXRhdGUiLCJyZWdpc3RlciJdLCJtYXBwaW5ncyI6IkFBQUEsc0RBQXNEO0FBRXREOzs7O0NBSUMsR0FFRCxPQUFPQSxjQUFjLGtDQUFrQztBQUN2RCxPQUFPQyxjQUFjLDhDQUE4QztBQUNuRSxPQUFPQyxpQkFBaUIsZ0RBQWdEO0FBQ3hFLE9BQU9DLGNBQWMsMENBQTBDO0FBQy9ELFNBQVNDLElBQUksRUFB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