// Copyright 2016-2024, University of Colorado Boulder
/**
 * A drawer that opens/closes to show/hide its contents.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */ import BooleanProperty from '../../axon/js/BooleanProperty.js';
import stepTimer from '../../axon/js/stepTimer.js';
import Dimension2 from '../../dot/js/Dimension2.js';
import { Shape } from '../../kite/js/imports.js';
import InstanceRegistry from '../../phet-core/js/documentation/InstanceRegistry.js';
import optionize from '../../phet-core/js/optionize.js';
import { Node, Path, PressListener, Rectangle } from '../../scenery/js/imports.js';
import Animation from '../../twixt/js/Animation.js';
import Easing from '../../twixt/js/Easing.js';
import sceneryPhet from './sceneryPhet.js';
let Drawer = class Drawer extends Node {
    dispose() {
        this.disposeDrawer();
        super.dispose();
    }
    /**
   * @param [animationEnabled]
   */ reset(animationEnabled) {
        animationEnabled = animationEnabled === undefined ? this.animationEnabled : animationEnabled;
        // set the drawer to it's initial open/closed state, with or without animation
        const saveAnimationEnabled = this.animationEnabled;
        this.animationEnabled = animationEnabled;
        this.openProperty.reset();
        this.animationEnabled = saveAnimationEnabled;
    }
    /**
   * Determines whether animation is enabled for opening/closing drawer.
   */ setAnimationEnabled(animationEnabled) {
        this._animationEnabled = animationEnabled;
    }
    set animationEnabled(value) {
        this.setAnimationEnabled(value);
    }
    get animationEnabled() {
        return this.getAnimationEnabled();
    }
    /**
   * Is animation enabled for opening/closing drawer?
   */ getAnimationEnabled() {
        return this._animationEnabled;
    }
    /**
   * @param contentsNode - contents of the drawer
   * @param provideOptions
   */ constructor(contentsNode, provideOptions){
        var _window_phet_chipper_queryParameters, _window_phet_chipper, _window_phet;
        const options = optionize()({
            // SelfOptions
            size: null,
            cornerRadius: 0,
            xMargin: 0,
            yMargin: 0,
            open: true,
            handlePosition: 'top',
            handleSize: new Dimension2(70, 20),
            handleCornerRadius: 5,
            handleFill: 'rgb( 230, 230, 230 )',
            handleTouchAreaXDilation: 0,
            handleTouchAreaYDilation: 0,
            handleMouseAreaXDilation: 0,
            handleMouseAreaYDilation: 0,
            grippyDotRadius: 1,
            grippyDotColor: 'black',
            grippyDotRows: 2,
            grippyDotColumns: 4,
            grippyDotXSpacing: 9,
            grippyDotYSpacing: 5,
            beforeOpen: ()=>{
                contentsNode.visible = true;
            },
            afterClose: ()=>{
                contentsNode.visible = false;
            },
            animationEnabled: true,
            animationDuration: 0.5,
            stepEmitter: stepTimer
        }, provideOptions);
        // size of contents, adjusted for margins
        const CONTENTS_WIDTH = contentsNode.width + 2 * options.xMargin;
        const CONTENTS_HEIGHT = contentsNode.height + 2 * options.yMargin;
        // size of container
        const CONTAINER_WIDTH = options.size ? options.size.width : CONTENTS_WIDTH;
        const CONTAINER_HEIGHT = options.size ? options.size.height : CONTENTS_HEIGHT;
        // background
        const backgroundNode = new Rectangle(0, 0, CONTAINER_WIDTH, CONTAINER_HEIGHT, {
            fill: 'white',
            cornerRadius: options.cornerRadius
        });
        // border
        const borderNode = new Rectangle(0, 0, CONTAINER_WIDTH, CONTAINER_HEIGHT, {
            stroke: 'black',
            cornerRadius: options.cornerRadius
        });
        // scale contents to fit the container
        if (options.size) {
            const scale = Math.min(1, Math.min(CONTAINER_WIDTH / CONTENTS_WIDTH, CONTAINER_HEIGHT / CONTENTS_HEIGHT));
            contentsNode.setScaleMagnitude(scale);
        }
        // handle, rectangle with top or bottom corners rounded, the other corners square
        const HANDLE_RADII = options.handlePosition === 'top' ? {
            topLeft: options.handleCornerRadius,
            topRight: options.handleCornerRadius
        } : {
            bottomLeft: options.handleCornerRadius,
            bottomRight: options.handleCornerRadius
        };
        const handleShape = Shape.roundedRectangleWithRadii(0, 0, options.handleSize.width, options.handleSize.height, HANDLE_RADII);
        const handleNode = new Path(handleShape, {
            cursor: 'pointer',
            fill: options.handleFill,
            stroke: 'black'
        });
        // grippy dots on the handle
        const grippyDotsShape = new Shape();
        let grippyX = 0;
        let grippyY = 0;
        for(let row = 0; row < options.grippyDotRows; row++){
            for(let column = 0; column < options.grippyDotColumns; column++){
                grippyX = column * options.grippyDotXSpacing;
                grippyY = row * options.grippyDotYSpacing;
                grippyDotsShape.moveTo(grippyX, grippyY);
                grippyDotsShape.arc(grippyX, grippyY, options.grippyDotRadius, 0, 2 * Math.PI);
            }
        }
        const grippyDotsNode = new Path(grippyDotsShape, {
            fill: options.grippyDotColor,
            center: handleNode.center
        });
        handleNode.addChild(grippyDotsNode);
        // handle pointerArea
        if (options.handleTouchAreaXDilation !== 0 || options.handleTouchAreaYDilation !== 0) {
            const touchAreaShiftY = options.handlePosition === 'top' ? -options.handleTouchAreaYDilation : options.handleTouchAreaYDilation;
            handleNode.touchArea = handleNode.localBounds.dilatedXY(options.handleTouchAreaXDilation, options.handleTouchAreaYDilation).shiftedY(touchAreaShiftY);
        }
        if (options.handleMouseAreaXDilation !== 0 || options.handleMouseAreaYDilation !== 0) {
            const mouseAreaShiftY = options.handlePosition === 'top' ? -options.handleMouseAreaYDilation : options.handleMouseAreaYDilation;
            handleNode.mouseArea = handleNode.localBounds.dilatedXY(options.handleMouseAreaXDilation, options.handleMouseAreaYDilation).shiftedY(mouseAreaShiftY);
        }
        // layout, position the handle at center-top or center-bottom
        backgroundNode.x = 0;
        handleNode.centerX = backgroundNode.centerX;
        if (options.handlePosition === 'top') {
            handleNode.top = 0;
            backgroundNode.top = handleNode.bottom - 1;
        } else {
            backgroundNode.top = 0;
            handleNode.top = backgroundNode.bottom - 1;
        }
        borderNode.center = backgroundNode.center;
        contentsNode.center = backgroundNode.center;
        // put all of the moving pieces together
        const drawerNode = new Node({
            children: [
                handleNode,
                backgroundNode,
                contentsNode,
                borderNode
            ]
        });
        // wrap the drawer with a clipping area, to show/hide the container
        options.children = [
            drawerNode
        ];
        options.clipArea = Shape.bounds(drawerNode.bounds);
        super(options);
        this.contentsNode = contentsNode;
        this._animationEnabled = options.animationEnabled;
        const yOpen = 0;
        const yClosed = options.handlePosition === 'top' ? backgroundNode.height : -backgroundNode.height;
        drawerNode.y = options.open ? yOpen : yClosed;
        let animation = null; // animation that opens/closes the drawer
        this.openProperty = new BooleanProperty(options.open);
        // click on the handle to toggle between open and closed
        handleNode.addInputListener(new PressListener({
            press: (event, trail)=>this.openProperty.set(!this.openProperty.get())
        }));
        // open/close the drawer
        const openObserver = (open)=>{
            // stop any animation that's in progress
            animation && animation.stop();
            open && options.beforeOpen && options.beforeOpen();
            if (this._animationEnabled) {
                // Animate opening and closing of the drawer.
                animation = new Animation({
                    stepEmitter: options.stepEmitter,
                    duration: options.animationDuration,
                    easing: Easing.QUADRATIC_IN_OUT,
                    setValue: (value)=>{
                        drawerNode.y = value;
                    },
                    getValue: ()=>drawerNode.y,
                    to: open ? yOpen : yClosed
                });
                animation.start();
            } else {
                // animation disabled, move immediately to new state
                drawerNode.y = open ? yOpen : yClosed;
                !open && options.afterClose && options.afterClose();
            }
        };
        this.openProperty.lazyLink(openObserver); // unlink in dispose
        this.disposeDrawer = ()=>{
            this.openProperty.unlink(openObserver);
            this.openProperty.dispose(); // will fail if clients haven't removed observers
        };
        // support for binder documentation, stripped out in builds and only runs when ?binder is specified
        assert && ((_window_phet = window.phet) == null ? void 0 : (_window_phet_chipper = _window_phet.chipper) == null ? void 0 : (_window_phet_chipper_queryParameters = _window_phet_chipper.queryParameters) == null ? void 0 : _window_phet_chipper_queryParameters.binder) && InstanceRegistry.registerDataURL('scenery-phet', 'Drawer', this);
    }
};
export { Drawer as default };
sceneryPhet.register('Drawer', Drawer);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9EcmF3ZXIudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTYtMjAyNCwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbi8qKlxuICogQSBkcmF3ZXIgdGhhdCBvcGVucy9jbG9zZXMgdG8gc2hvdy9oaWRlIGl0cyBjb250ZW50cy5cbiAqXG4gKiBAYXV0aG9yIENocmlzIE1hbGxleSAoUGl4ZWxab29tLCBJbmMuKVxuICovXG5cbmltcG9ydCBCb29sZWFuUHJvcGVydHkgZnJvbSAnLi4vLi4vYXhvbi9qcy9Cb29sZWFuUHJvcGVydHkuanMnO1xuaW1wb3J0IFByb3BlcnR5IGZyb20gJy4uLy4uL2F4b24vanMvUHJvcGVydHkuanMnO1xuaW1wb3J0IHN0ZXBUaW1lciBmcm9tICcuLi8uLi9heG9uL2pzL3N0ZXBUaW1lci5qcyc7XG5pbXBvcnQgeyBUUmVhZE9ubHlFbWl0dGVyIH0gZnJvbSAnLi4vLi4vYXhvbi9qcy9URW1pdHRlci5qcyc7XG5pbXBvcnQgRGltZW5zaW9uMiBmcm9tICcuLi8uLi9kb3QvanMvRGltZW5zaW9uMi5qcyc7XG5pbXBvcnQgeyBTaGFwZSB9IGZyb20gJy4uLy4uL2tpdGUvanMvaW1wb3J0cy5qcyc7XG5pbXBvcnQgSW5zdGFuY2VSZWdpc3RyeSBmcm9tICcuLi8uLi9waGV0LWNvcmUvanMvZG9jdW1lbnRhdGlvbi9JbnN0YW5jZVJlZ2lzdHJ5LmpzJztcbmltcG9ydCBvcHRpb25pemUgZnJvbSAnLi4vLi4vcGhldC1jb3JlL2pzL29wdGlvbml6ZS5qcyc7XG5pbXBvcnQgU3RyaWN0T21pdCBmcm9tICcuLi8uLi9waGV0LWNvcmUvanMvdHlwZXMvU3RyaWN0T21pdC5qcyc7XG5pbXBvcnQgeyBOb2RlLCBOb2RlT3B0aW9ucywgUGF0aCwgUHJlc3NMaXN0ZW5lciwgUmVjdGFuZ2xlLCBUQ29sb3IgfSBmcm9tICcuLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xuaW1wb3J0IEFuaW1hdGlvbiBmcm9tICcuLi8uLi90d2l4dC9qcy9BbmltYXRpb24uanMnO1xuaW1wb3J0IEVhc2luZyBmcm9tICcuLi8uLi90d2l4dC9qcy9FYXNpbmcuanMnO1xuaW1wb3J0IHNjZW5lcnlQaGV0IGZyb20gJy4vc2NlbmVyeVBoZXQuanMnO1xuXG50eXBlIFNlbGZPcHRpb25zID0ge1xuXG4gIC8vIGRyYXdlclxuICBzaXplPzogRGltZW5zaW9uMiB8IG51bGw7IC8vICFudWxsOiBjb250ZW50cyBzaXplZCB0byBmaXQgaW4gY29udGFpbmVyLCBudWxsOiBjb250YWluZXIgc2l6ZWQgdG8gZml0IGNvbnRlbnRzXG4gIGNvcm5lclJhZGl1cz86IG51bWJlcjtcbiAgeE1hcmdpbj86IG51bWJlcjtcbiAgeU1hcmdpbj86IG51bWJlcjtcbiAgb3Blbj86IGJvb2xlYW47IC8vIGlzIHRoZSBkcmF3ZXIgaW5pdGlhbGx5IG9wZW4/XG5cbiAgLy8gaGFuZGxlXG4gIGhhbmRsZVBvc2l0aW9uPzogJ3RvcCcgfCAnYm90dG9tJztcbiAgaGFuZGxlU2l6ZT86IERpbWVuc2lvbjI7XG4gIGhhbmRsZUNvcm5lclJhZGl1cz86IG51bWJlcjtcbiAgaGFuZGxlRmlsbD86IFRDb2xvcjtcbiAgaGFuZGxlVG91Y2hBcmVhWERpbGF0aW9uPzogbnVtYmVyO1xuICBoYW5kbGVUb3VjaEFyZWFZRGlsYXRpb24/OiBudW1iZXI7XG4gIGhhbmRsZU1vdXNlQXJlYVhEaWxhdGlvbj86IG51bWJlcjtcbiAgaGFuZGxlTW91c2VBcmVhWURpbGF0aW9uPzogbnVtYmVyO1xuXG4gIC8vIGdyaXBweSBkb3RzIG9uIGhhbmRsZVxuICBncmlwcHlEb3RSYWRpdXM/OiBudW1iZXI7XG4gIGdyaXBweURvdENvbG9yPzogVENvbG9yO1xuICBncmlwcHlEb3RSb3dzPzogbnVtYmVyO1xuICBncmlwcHlEb3RDb2x1bW5zPzogbnVtYmVyO1xuICBncmlwcHlEb3RYU3BhY2luZz86IG51bWJlcjtcbiAgZ3JpcHB5RG90WVNwYWNpbmc/OiBudW1iZXI7XG5cbiAgLy8gQ2FsbGJhY2tzLiBUaGUgZGVmYXVsdCBiZWhhdmlvciBpcyB0byBtYWtlIGNvbnRlbnROb2RlIHZpc2libGUgb25seSB3aGlsZSB0aGUgZHJhd2VyIGlzIG9wZW4uXG4gIC8vIFRoaXMgY2FuIHByb3ZpZGUgcGVyZm9ybWFuY2UgZ2FpbnMgaWYgeW91ciBjb250ZW50Tm9kZSB1cGRhdGVzIG9ubHkgd2hpbGUgdmlzaWJsZS5cbiAgYmVmb3JlT3Blbj86ICgpID0+IHZvaWQ7IC8vIGNhbGxlZCBpbW1lZGlhdGVseSBiZWZvcmUgdGhlIGRyYXdlciBpcyBvcGVuZWRcbiAgYWZ0ZXJDbG9zZT86ICgpID0+IHZvaWQ7IC8vIGNhbGxlZCBpbW1lZGlhdGVseSBhZnRlciB0aGUgZHJhd2VyIGlzIGNsb3NlZFxuXG4gIC8vIGFuaW1hdGlvblxuICBhbmltYXRpb25FbmFibGVkPzogYm9vbGVhbjsgLy8gaXMgYW5pbWF0aW9uIGVuYWJsZWQgd2hlbiBvcGVuaW5nL2Nsb3NpbmcgdGhlIGRyYXdlcj9cbiAgYW5pbWF0aW9uRHVyYXRpb24/OiBudW1iZXI7IC8vIGR1cmF0aW9uIG9mIGFuaW1hdGlvbiAoZHJhd2VyIG9wZW5pbmcgYW5kIGNsb3NpbmcpIGluIHNlY29uZHNcbiAgc3RlcEVtaXR0ZXI/OiBUUmVhZE9ubHlFbWl0dGVyPFsgbnVtYmVyIF0+IHwgbnVsbDsgLy8gc2VlIEFuaW1hdGlvbiBvcHRpb25zLnN0ZXBFbWl0dGVyXG59O1xuXG5leHBvcnQgdHlwZSBEcmF3ZXJPcHRpb25zID0gU2VsZk9wdGlvbnMgJiBTdHJpY3RPbWl0PE5vZGVPcHRpb25zLCAnY2hpbGRyZW4nIHwgJ2NsaXBBcmVhJz47XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIERyYXdlciBleHRlbmRzIE5vZGUge1xuXG4gIC8vIGlzIHRoZSBkcmF3ZXIgb3Blbj9cbiAgcHVibGljIHJlYWRvbmx5IG9wZW5Qcm9wZXJ0eTogUHJvcGVydHk8Ym9vbGVhbj47XG5cbiAgLy8gd2hhdCdzIGluIHRoZSBkcmF3ZXJcbiAgcHVibGljIHJlYWRvbmx5IGNvbnRlbnRzTm9kZTogTm9kZTtcblxuICAvLyB3aGV0aGVyIHRoZSBkcmF3ZXIgYW5pbWF0ZXMgb3Blbi9jbG9zZWRcbiAgcHJpdmF0ZSBfYW5pbWF0aW9uRW5hYmxlZDogYm9vbGVhbjtcblxuICBwcml2YXRlIHJlYWRvbmx5IGRpc3Bvc2VEcmF3ZXI6ICgpID0+IHZvaWQ7XG5cbiAgLyoqXG4gICAqIEBwYXJhbSBjb250ZW50c05vZGUgLSBjb250ZW50cyBvZiB0aGUgZHJhd2VyXG4gICAqIEBwYXJhbSBwcm92aWRlT3B0aW9uc1xuICAgKi9cbiAgcHVibGljIGNvbnN0cnVjdG9yKCBjb250ZW50c05vZGU6IE5vZGUsIHByb3ZpZGVPcHRpb25zPzogRHJhd2VyT3B0aW9ucyApIHtcblxuICAgIGNvbnN0IG9wdGlvbnMgPSBvcHRpb25pemU8RHJhd2VyT3B0aW9ucywgU2VsZk9wdGlvbnMsIE5vZGVPcHRpb25zPigpKCB7XG5cbiAgICAgIC8vIFNlbGZPcHRpb25zXG4gICAgICBzaXplOiBudWxsLFxuICAgICAgY29ybmVyUmFkaXVzOiAwLFxuICAgICAgeE1hcmdpbjogMCxcbiAgICAgIHlNYXJnaW46IDAsXG4gICAgICBvcGVuOiB0cnVlLFxuICAgICAgaGFuZGxlUG9zaXRpb246ICd0b3AnLFxuICAgICAgaGFuZGxlU2l6ZTogbmV3IERpbWVuc2lvbjIoIDcwLCAyMCApLFxuICAgICAgaGFuZGxlQ29ybmVyUmFkaXVzOiA1LFxuICAgICAgaGFuZGxlRmlsbDogJ3JnYiggMjMwLCAyMzAsIDIzMCApJyxcbiAgICAgIGhhbmRsZVRvdWNoQXJlYVhEaWxhdGlvbjogMCxcbiAgICAgIGhhbmRsZVRvdWNoQXJlYVlEaWxhdGlvbjogMCxcbiAgICAgIGhhbmRsZU1vdXNlQXJlYVhEaWxhdGlvbjogMCxcbiAgICAgIGhhbmRsZU1vdXNlQXJlYVlEaWxhdGlvbjogMCxcbiAgICAgIGdyaXBweURvdFJhZGl1czogMSxcbiAgICAgIGdyaXBweURvdENvbG9yOiAnYmxhY2snLFxuICAgICAgZ3JpcHB5RG90Um93czogMixcbiAgICAgIGdyaXBweURvdENvbHVtbnM6IDQsXG4gICAgICBncmlwcHlEb3RYU3BhY2luZzogOSxcbiAgICAgIGdyaXBweURvdFlTcGFjaW5nOiA1LFxuICAgICAgYmVmb3JlT3BlbjogKCkgPT4geyBjb250ZW50c05vZGUudmlzaWJsZSA9IHRydWU7IH0sXG4gICAgICBhZnRlckNsb3NlOiAoKSA9PiB7IGNvbnRlbnRzTm9kZS52aXNpYmxlID0gZmFsc2U7IH0sXG4gICAgICBhbmltYXRpb25FbmFibGVkOiB0cnVlLFxuICAgICAgYW5pbWF0aW9uRHVyYXRpb246IDAuNSxcbiAgICAgIHN0ZXBFbWl0dGVyOiBzdGVwVGltZXJcbiAgICB9LCBwcm92aWRlT3B0aW9ucyApO1xuXG4gICAgLy8gc2l6ZSBvZiBjb250ZW50cywgYWRqdXN0ZWQgZm9yIG1hcmdpbnNcbiAgICBjb25zdCBDT05URU5UU19XSURUSCA9IGNvbnRlbnRzTm9kZS53aWR0aCArICggMiAqIG9wdGlvbnMueE1hcmdpbiApO1xuICAgIGNvbnN0IENPTlRFTlRTX0hFSUdIVCA9IGNvbnRlbnRzTm9kZS5oZWlnaHQgKyAoIDIgKiBvcHRpb25zLnlNYXJnaW4gKTtcblxuICAgIC8vIHNpemUgb2YgY29udGFpbmVyXG4gICAgY29uc3QgQ09OVEFJTkVSX1dJRFRIID0gb3B0aW9ucy5zaXplID8gb3B0aW9ucy5zaXplLndpZHRoIDogQ09OVEVOVFNfV0lEVEg7XG4gICAgY29uc3QgQ09OVEFJTkVSX0hFSUdIVCA9IG9wdGlvbnMuc2l6ZSA/IG9wdGlvbnMuc2l6ZS5oZWlnaHQgOiBDT05URU5UU19IRUlHSFQ7XG5cbiAgICAvLyBiYWNrZ3JvdW5kXG4gICAgY29uc3QgYmFja2dyb3VuZE5vZGUgPSBuZXcgUmVjdGFuZ2xlKCAwLCAwLCBDT05UQUlORVJfV0lEVEgsIENPTlRBSU5FUl9IRUlHSFQsIHtcbiAgICAgIGZpbGw6ICd3aGl0ZScsXG4gICAgICBjb3JuZXJSYWRpdXM6IG9wdGlvbnMuY29ybmVyUmFkaXVzXG4gICAgfSApO1xuXG4gICAgLy8gYm9yZGVyXG4gICAgY29uc3QgYm9yZGVyTm9kZSA9IG5ldyBSZWN0YW5nbGUoIDAsIDAsIENPTlRBSU5FUl9XSURUSCwgQ09OVEFJTkVSX0hFSUdIVCwge1xuICAgICAgc3Ryb2tlOiAnYmxhY2snLFxuICAgICAgY29ybmVyUmFkaXVzOiBvcHRpb25zLmNvcm5lclJhZGl1c1xuICAgIH0gKTtcblxuICAgIC8vIHNjYWxlIGNvbnRlbnRzIHRvIGZpdCB0aGUgY29udGFpbmVyXG4gICAgaWYgKCBvcHRpb25zLnNpemUgKSB7XG4gICAgICBjb25zdCBzY2FsZSA9IE1hdGgubWluKCAxLCBNYXRoLm1pbiggQ09OVEFJTkVSX1dJRFRIIC8gQ09OVEVOVFNfV0lEVEgsIENPTlRBSU5FUl9IRUlHSFQgLyBDT05URU5UU19IRUlHSFQgKSApO1xuICAgICAgY29udGVudHNOb2RlLnNldFNjYWxlTWFnbml0dWRlKCBzY2FsZSApO1xuICAgIH1cblxuICAgIC8vIGhhbmRsZSwgcmVjdGFuZ2xlIHdpdGggdG9wIG9yIGJvdHRvbSBjb3JuZXJzIHJvdW5kZWQsIHRoZSBvdGhlciBjb3JuZXJzIHNxdWFyZVxuICAgIGNvbnN0IEhBTkRMRV9SQURJSSA9ICggb3B0aW9ucy5oYW5kbGVQb3NpdGlvbiA9PT0gJ3RvcCcgKSA/IHtcbiAgICAgIHRvcExlZnQ6IG9wdGlvbnMuaGFuZGxlQ29ybmVyUmFkaXVzLFxuICAgICAgdG9wUmlnaHQ6IG9wdGlvbnMuaGFuZGxlQ29ybmVyUmFkaXVzXG4gICAgfSA6IHtcbiAgICAgIGJvdHRvbUxlZnQ6IG9wdGlvbnMuaGFuZGxlQ29ybmVyUmFkaXVzLFxuICAgICAgYm90dG9tUmlnaHQ6IG9wdGlvbnMuaGFuZGxlQ29ybmVyUmFkaXVzXG4gICAgfTtcbiAgICBjb25zdCBoYW5kbGVTaGFwZSA9IFNoYXBlLnJvdW5kZWRSZWN0YW5nbGVXaXRoUmFkaWkoIDAsIDAsIG9wdGlvbnMuaGFuZGxlU2l6ZS53aWR0aCwgb3B0aW9ucy5oYW5kbGVTaXplLmhlaWdodCwgSEFORExFX1JBRElJICk7XG4gICAgY29uc3QgaGFuZGxlTm9kZSA9IG5ldyBQYXRoKCBoYW5kbGVTaGFwZSwge1xuICAgICAgY3Vyc29yOiAncG9pbnRlcicsXG4gICAgICBmaWxsOiBvcHRpb25zLmhhbmRsZUZpbGwsXG4gICAgICBzdHJva2U6ICdibGFjaydcbiAgICB9ICk7XG5cbiAgICAvLyBncmlwcHkgZG90cyBvbiB0aGUgaGFuZGxlXG4gICAgY29uc3QgZ3JpcHB5RG90c1NoYXBlID0gbmV3IFNoYXBlKCk7XG4gICAgbGV0IGdyaXBweVggPSAwO1xuICAgIGxldCBncmlwcHlZID0gMDtcbiAgICBmb3IgKCBsZXQgcm93ID0gMDsgcm93IDwgb3B0aW9ucy5ncmlwcHlEb3RSb3dzOyByb3crKyApIHtcbiAgICAgIGZvciAoIGxldCBjb2x1bW4gPSAwOyBjb2x1bW4gPCBvcHRpb25zLmdyaXBweURvdENvbHVtbnM7IGNvbHVtbisrICkge1xuICAgICAgICBncmlwcHlYID0gY29sdW1uICogb3B0aW9ucy5ncmlwcHlEb3RYU3BhY2luZztcbiAgICAgICAgZ3JpcHB5WSA9IHJvdyAqIG9wdGlvbnMuZ3JpcHB5RG90WVNwYWNpbmc7XG4gICAgICAgIGdyaXBweURvdHNTaGFwZS5tb3ZlVG8oIGdyaXBweVgsIGdyaXBweVkgKTtcbiAgICAgICAgZ3JpcHB5RG90c1NoYXBlLmFyYyggZ3JpcHB5WCwgZ3JpcHB5WSwgb3B0aW9ucy5ncmlwcHlEb3RSYWRpdXMsIDAsIDIgKiBNYXRoLlBJICk7XG4gICAgICB9XG4gICAgfVxuICAgIGNvbnN0IGdyaXBweURvdHNOb2RlID0gbmV3IFBhdGgoIGdyaXBweURvdHNTaGFwZSwge1xuICAgICAgZmlsbDogb3B0aW9ucy5ncmlwcHlEb3RDb2xvcixcbiAgICAgIGNlbnRlcjogaGFuZGxlTm9kZS5jZW50ZXJcbiAgICB9ICk7XG4gICAgaGFuZGxlTm9kZS5hZGRDaGlsZCggZ3JpcHB5RG90c05vZGUgKTtcblxuICAgIC8vIGhhbmRsZSBwb2ludGVyQXJlYVxuICAgIGlmICggb3B0aW9ucy5oYW5kbGVUb3VjaEFyZWFYRGlsYXRpb24gIT09IDAgfHwgb3B0aW9ucy5oYW5kbGVUb3VjaEFyZWFZRGlsYXRpb24gIT09IDAgKSB7XG4gICAgICBjb25zdCB0b3VjaEFyZWFTaGlmdFkgPSAoIG9wdGlvbnMuaGFuZGxlUG9zaXRpb24gPT09ICd0b3AnICkgPyAtb3B0aW9ucy5oYW5kbGVUb3VjaEFyZWFZRGlsYXRpb24gOiBvcHRpb25zLmhhbmRsZVRvdWNoQXJlYVlEaWxhdGlvbjtcbiAgICAgIGhhbmRsZU5vZGUudG91Y2hBcmVhID0gaGFuZGxlTm9kZS5sb2NhbEJvdW5kcy5kaWxhdGVkWFkoIG9wdGlvbnMuaGFuZGxlVG91Y2hBcmVhWERpbGF0aW9uLCBvcHRpb25zLmhhbmRsZVRvdWNoQXJlYVlEaWxhdGlvbiApLnNoaWZ0ZWRZKCB0b3VjaEFyZWFTaGlmdFkgKTtcbiAgICB9XG4gICAgaWYgKCBvcHRpb25zLmhhbmRsZU1vdXNlQXJlYVhEaWxhdGlvbiAhPT0gMCB8fCBvcHRpb25zLmhhbmRsZU1vdXNlQXJlYVlEaWxhdGlvbiAhPT0gMCApIHtcbiAgICAgIGNvbnN0IG1vdXNlQXJlYVNoaWZ0WSA9ICggb3B0aW9ucy5oYW5kbGVQb3NpdGlvbiA9PT0gJ3RvcCcgKSA/IC1vcHRpb25zLmhhbmRsZU1vdXNlQXJlYVlEaWxhdGlvbiA6IG9wdGlvbnMuaGFuZGxlTW91c2VBcmVhWURpbGF0aW9uO1xuICAgICAgaGFuZGxlTm9kZS5tb3VzZUFyZWEgPSBoYW5kbGVOb2RlLmxvY2FsQm91bmRzLmRpbGF0ZWRYWSggb3B0aW9ucy5oYW5kbGVNb3VzZUFyZWFYRGlsYXRpb24sIG9wdGlvbnMuaGFuZGxlTW91c2VBcmVhWURpbGF0aW9uICkuc2hpZnRlZFkoIG1vdXNlQXJlYVNoaWZ0WSApO1xuICAgIH1cblxuICAgIC8vIGxheW91dCwgcG9zaXRpb24gdGhlIGhhbmRsZSBhdCBjZW50ZXItdG9wIG9yIGNlbnRlci1ib3R0b21cbiAgICBiYWNrZ3JvdW5kTm9kZS54ID0gMDtcbiAgICBoYW5kbGVOb2RlLmNlbnRlclggPSBiYWNrZ3JvdW5kTm9kZS5jZW50ZXJYO1xuICAgIGlmICggb3B0aW9ucy5oYW5kbGVQb3NpdGlvbiA9PT0gJ3RvcCcgKSB7XG4gICAgICBoYW5kbGVOb2RlLnRvcCA9IDA7XG4gICAgICBiYWNrZ3JvdW5kTm9kZS50b3AgPSBoYW5kbGVOb2RlLmJvdHRvbSAtIDE7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgYmFja2dyb3VuZE5vZGUudG9wID0gMDtcbiAgICAgIGhhbmRsZU5vZGUudG9wID0gYmFja2dyb3VuZE5vZGUuYm90dG9tIC0gMTtcbiAgICB9XG4gICAgYm9yZGVyTm9kZS5jZW50ZXIgPSBiYWNrZ3JvdW5kTm9kZS5jZW50ZXI7XG4gICAgY29udGVudHNOb2RlLmNlbnRlciA9IGJhY2tncm91bmROb2RlLmNlbnRlcjtcblxuICAgIC8vIHB1dCBhbGwgb2YgdGhlIG1vdmluZyBwaWVjZXMgdG9nZXRoZXJcbiAgICBjb25zdCBkcmF3ZXJOb2RlID0gbmV3IE5vZGUoIHtcbiAgICAgIGNoaWxkcmVuOiBbIGhhbmRsZU5vZGUsIGJhY2tncm91bmROb2RlLCBjb250ZW50c05vZGUsIGJvcmRlck5vZGUgXVxuICAgIH0gKTtcblxuICAgIC8vIHdyYXAgdGhlIGRyYXdlciB3aXRoIGEgY2xpcHBpbmcgYXJlYSwgdG8gc2hvdy9oaWRlIHRoZSBjb250YWluZXJcbiAgICBvcHRpb25zLmNoaWxkcmVuID0gWyBkcmF3ZXJOb2RlIF07XG4gICAgb3B0aW9ucy5jbGlwQXJlYSA9IFNoYXBlLmJvdW5kcyggZHJhd2VyTm9kZS5ib3VuZHMgKTtcblxuICAgIHN1cGVyKCBvcHRpb25zICk7XG5cbiAgICB0aGlzLmNvbnRlbnRzTm9kZSA9IGNvbnRlbnRzTm9kZTtcbiAgICB0aGlzLl9hbmltYXRpb25FbmFibGVkID0gb3B0aW9ucy5hbmltYXRpb25FbmFibGVkO1xuXG4gICAgY29uc3QgeU9wZW4gPSAwO1xuICAgIGNvbnN0IHlDbG9zZWQgPSAoIG9wdGlvbnMuaGFuZGxlUG9zaXRpb24gPT09ICd0b3AnICkgPyBiYWNrZ3JvdW5kTm9kZS5oZWlnaHQgOiAtYmFja2dyb3VuZE5vZGUuaGVpZ2h0O1xuICAgIGRyYXdlck5vZGUueSA9IG9wdGlvbnMub3BlbiA/IHlPcGVuIDogeUNsb3NlZDtcblxuICAgIGxldCBhbmltYXRpb246IEFuaW1hdGlvbiB8IG51bGwgPSBudWxsOyAvLyBhbmltYXRpb24gdGhhdCBvcGVucy9jbG9zZXMgdGhlIGRyYXdlclxuXG4gICAgdGhpcy5vcGVuUHJvcGVydHkgPSBuZXcgQm9vbGVhblByb3BlcnR5KCBvcHRpb25zLm9wZW4gKTtcblxuICAgIC8vIGNsaWNrIG9uIHRoZSBoYW5kbGUgdG8gdG9nZ2xlIGJldHdlZW4gb3BlbiBhbmQgY2xvc2VkXG4gICAgaGFuZGxlTm9kZS5hZGRJbnB1dExpc3RlbmVyKCBuZXcgUHJlc3NMaXN0ZW5lcigge1xuICAgICAgcHJlc3M6ICggZXZlbnQsIHRyYWlsICkgPT4gdGhpcy5vcGVuUHJvcGVydHkuc2V0KCAhdGhpcy5vcGVuUHJvcGVydHkuZ2V0KCkgKVxuICAgIH0gKSApO1xuXG4gICAgLy8gb3Blbi9jbG9zZSB0aGUgZHJhd2VyXG4gICAgY29uc3Qgb3Blbk9ic2VydmVyID0gKCBvcGVuOiBib29sZWFuICkgPT4ge1xuXG4gICAgICAvLyBzdG9wIGFueSBhbmltYXRpb24gdGhhdCdzIGluIHByb2dyZXNzXG4gICAgICBhbmltYXRpb24gJiYgYW5pbWF0aW9uLnN0b3AoKTtcblxuICAgICAgb3BlbiAmJiBvcHRpb25zLmJlZm9yZU9wZW4gJiYgb3B0aW9ucy5iZWZvcmVPcGVuKCk7XG5cbiAgICAgIGlmICggdGhpcy5fYW5pbWF0aW9uRW5hYmxlZCApIHtcblxuICAgICAgICAvLyBBbmltYXRlIG9wZW5pbmcgYW5kIGNsb3Npbmcgb2YgdGhlIGRyYXdlci5cbiAgICAgICAgYW5pbWF0aW9uID0gbmV3IEFuaW1hdGlvbigge1xuICAgICAgICAgIHN0ZXBFbWl0dGVyOiBvcHRpb25zLnN0ZXBFbWl0dGVyLFxuICAgICAgICAgIGR1cmF0aW9uOiBvcHRpb25zLmFuaW1hdGlvbkR1cmF0aW9uLFxuICAgICAgICAgIGVhc2luZzogRWFzaW5nLlFVQURSQVRJQ19JTl9PVVQsXG4gICAgICAgICAgc2V0VmFsdWU6ICggdmFsdWU6IG51bWJlciApID0+IHsgZHJhd2VyTm9kZS55ID0gdmFsdWU7IH0sXG4gICAgICAgICAgZ2V0VmFsdWU6ICgpID0+IGRyYXdlck5vZGUueSxcbiAgICAgICAgICB0bzogb3BlbiA/IHlPcGVuIDogeUNsb3NlZFxuICAgICAgICB9ICk7XG4gICAgICAgIGFuaW1hdGlvbi5zdGFydCgpO1xuICAgICAgfVxuICAgICAgZWxzZSB7XG5cbiAgICAgICAgLy8gYW5pbWF0aW9uIGRpc2FibGVkLCBtb3ZlIGltbWVkaWF0ZWx5IHRvIG5ldyBzdGF0ZVxuICAgICAgICBkcmF3ZXJOb2RlLnkgPSBvcGVuID8geU9wZW4gOiB5Q2xvc2VkO1xuICAgICAgICAhb3BlbiAmJiBvcHRpb25zLmFmdGVyQ2xvc2UgJiYgb3B0aW9ucy5hZnRlckNsb3NlKCk7XG4gICAgICB9XG4gICAgfTtcbiAgICB0aGlzLm9wZW5Qcm9wZXJ0eS5sYXp5TGluayggb3Blbk9ic2VydmVyICk7IC8vIHVubGluayBpbiBkaXNwb3NlXG5cbiAgICB0aGlzLmRpc3Bvc2VEcmF3ZXIgPSAoKSA9PiB7XG4gICAgICB0aGlzLm9wZW5Qcm9wZXJ0eS51bmxpbmsoIG9wZW5PYnNlcnZlciApO1xuICAgICAgdGhpcy5vcGVuUHJvcGVydHkuZGlzcG9zZSgpOyAvLyB3aWxsIGZhaWwgaWYgY2xpZW50cyBoYXZlbid0IHJlbW92ZWQgb2JzZXJ2ZXJzXG4gICAgfTtcblxuICAgIC8vIHN1cHBvcnQgZm9yIGJpbmRlciBkb2N1bWVudGF0aW9uLCBzdHJpcHBlZCBvdXQgaW4gYnVpbGRzIGFuZCBvbmx5IHJ1bnMgd2hlbiA/YmluZGVyIGlzIHNwZWNpZmllZFxuICAgIGFzc2VydCAmJiB3aW5kb3cucGhldD8uY2hpcHBlcj8ucXVlcnlQYXJhbWV0ZXJzPy5iaW5kZXIgJiYgSW5zdGFuY2VSZWdpc3RyeS5yZWdpc3RlckRhdGFVUkwoICdzY2VuZXJ5LXBoZXQnLCAnRHJhd2VyJywgdGhpcyApO1xuICB9XG5cbiAgcHVibGljIG92ZXJyaWRlIGRpc3Bvc2UoKTogdm9pZCB7XG4gICAgdGhpcy5kaXNwb3NlRHJhd2VyKCk7XG4gICAgc3VwZXIuZGlzcG9zZSgpO1xuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSBbYW5pbWF0aW9uRW5hYmxlZF1cbiAgICovXG4gIHB1YmxpYyByZXNldCggYW5pbWF0aW9uRW5hYmxlZD86IGJvb2xlYW4gKTogdm9pZCB7XG5cbiAgICBhbmltYXRpb25FbmFibGVkID0gKCBhbmltYXRpb25FbmFibGVkID09PSB1bmRlZmluZWQgKSA/IHRoaXMuYW5pbWF0aW9uRW5hYmxlZCA6IGFuaW1hdGlvbkVuYWJsZWQ7XG5cbiAgICAvLyBzZXQgdGhlIGRyYXdlciB0byBpdCdzIGluaXRpYWwgb3Blbi9jbG9zZWQgc3RhdGUsIHdpdGggb3Igd2l0aG91dCBhbmltYXRpb25cbiAgICBjb25zdCBzYXZlQW5pbWF0aW9uRW5hYmxlZCA9IHRoaXMuYW5pbWF0aW9uRW5hYmxlZDtcbiAgICB0aGlzLmFuaW1hdGlvbkVuYWJsZWQgPSBhbmltYXRpb25FbmFibGVkO1xuICAgIHRoaXMub3BlblByb3BlcnR5LnJlc2V0KCk7XG4gICAgdGhpcy5hbmltYXRpb25FbmFibGVkID0gc2F2ZUFuaW1hdGlvbkVuYWJsZWQ7XG4gIH1cblxuICAvKipcbiAgICogRGV0ZXJtaW5lcyB3aGV0aGVyIGFuaW1hdGlvbiBpcyBlbmFibGVkIGZvciBvcGVuaW5nL2Nsb3NpbmcgZHJhd2VyLlxuICAgKi9cbiAgcHVibGljIHNldEFuaW1hdGlvbkVuYWJsZWQoIGFuaW1hdGlvbkVuYWJsZWQ6IGJvb2xlYW4gKTogdm9pZCB7XG4gICAgdGhpcy5fYW5pbWF0aW9uRW5hYmxlZCA9IGFuaW1hdGlvbkVuYWJsZWQ7XG4gIH1cblxuICBwdWJsaWMgc2V0IGFuaW1hdGlvbkVuYWJsZWQoIHZhbHVlOiBib29sZWFuICkgeyB0aGlzLnNldEFuaW1hdGlvbkVuYWJsZWQoIHZhbHVlICk7IH1cblxuICBwdWJsaWMgZ2V0IGFuaW1hdGlvbkVuYWJsZWQoKTogYm9vbGVhbiB7IHJldHVybiB0aGlzLmdldEFuaW1hdGlvbkVuYWJsZWQoKTsgfVxuXG4gIC8qKlxuICAgKiBJcyBhbmltYXRpb24gZW5hYmxlZCBmb3Igb3BlbmluZy9jbG9zaW5nIGRyYXdlcj9cbiAgICovXG4gIHB1YmxpYyBnZXRBbmltYXRpb25FbmFibGVkKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLl9hbmltYXRpb25FbmFibGVkO1xuICB9XG5cbn1cblxuc2NlbmVyeVBoZXQucmVnaXN0ZXIoICdEcmF3ZXInLCBEcmF3ZXIgKTsiXSwibmFtZXMiOlsiQm9vbGVhblByb3BlcnR5Iiwic3RlcFRpbWVyIiwiRGltZW5zaW9uMiIsIlNoYXBlIiwiSW5zdGFuY2VSZWdpc3RyeSIsIm9wdGlvbml6ZSIsIk5vZGUiLCJQYXRoIiwiUHJlc3NMaXN0ZW5lciIsIlJlY3RhbmdsZSIsIkFuaW1hdGlvbiIsIkVhc2luZyIsInNjZW5lcnlQaGV0IiwiRHJhd2VyIiwiZGlzcG9zZSIsImRpc3Bvc2VEcmF3ZXIiLCJyZXNldCIsImFuaW1hdGlvbkVuYWJsZWQiLCJ1bmRlZmluZWQiLCJzYXZlQW5pbWF0aW9uRW5hYmxlZCIsIm9wZW5Qcm9wZXJ0eSIsInNldEFuaW1hdGlvbkVuYWJsZWQiLCJfYW5pbWF0aW9uRW5hYmxlZCIsInZhbHVlIiwiZ2V0QW5pbWF0aW9uRW5hYmxlZCIsImNvbnRlbnRzTm9kZSIsInByb3ZpZGVPcHRpb25zIiwid2luZG93Iiwib3B0aW9ucyIsInNpemUiLCJjb3JuZXJSYWRpdXMiLCJ4TWFyZ2luIiwieU1hcmdpbiIsIm9wZW4iLCJoYW5kbGVQb3NpdGlvbiIsImhhbmRsZVNpemUiLCJoYW5kbGVDb3JuZXJSYWRpdXMiLCJoYW5kbGVGaWxsIiwiaGFuZGxlVG91Y2hBcmVhWERpbGF0aW9uIiwiaGFuZGxlVG91Y2hBcmVhWURpbGF0aW9uIiwiaGFuZGxlTW91c2VBcmVhWERpbGF0aW9uIiwiaGFuZGxlTW91c2VBcmVhWURpbGF0aW9uIiwiZ3JpcHB5RG90UmFkaXVzIiwiZ3JpcHB5RG90Q29sb3IiLCJncmlwcHlEb3RSb3dzIiwiZ3JpcHB5RG90Q29sdW1ucyIsImdyaXBweURvdFhTcGFjaW5nIiwiZ3JpcHB5RG90WVNwYWNpbmciLCJiZWZvcmVPcGVuIiwidmlzaWJsZSIsImFmdGVyQ2xvc2UiLCJhbmltYXRpb25EdXJhdGlvbiIsInN0ZXBFbWl0dGVyIiwiQ09OVEVOVFNfV0lEVEgiLCJ3aWR0aCIsIkNPTlRFTlRTX0hFSUdIVCIsImhlaWdodCIsIkNPTlRBSU5FUl9XSURUSCIsIkNPTlRBSU5FUl9IRUlHSFQiLCJiYWNrZ3JvdW5kTm9kZSIsImZpbGwiLCJib3JkZXJOb2RlIiwic3Ryb2tlIiwic2NhbGUiLCJNYXRoIiwibWluIiwic2V0U2NhbGVNYWduaXR1ZGUiLCJIQU5ETEVfUkFESUkiLCJ0b3BMZWZ0IiwidG9wUmlnaHQiLCJib3R0b21MZWZ0IiwiYm90dG9tUmlnaHQiLCJoYW5kbGVTaGFwZSIsInJvdW5kZWRSZWN0YW5nbGVXaXRoUmFkaWkiLCJoYW5kbGVOb2RlIiwiY3Vyc29yIiwiZ3JpcHB5RG90c1NoYXBlIiwiZ3JpcHB5WCIsImdyaXBweVkiLCJyb3ciLCJjb2x1bW4iLCJtb3ZlVG8iLCJhcmMiLCJQSSIsImdyaXBweURvdHNOb2RlIiwiY2VudGVyIiwiYWRkQ2hpbGQiLCJ0b3VjaEFyZWFTaGlmdFkiLCJ0b3VjaEFyZWEiLCJsb2NhbEJvdW5kcyIsImRpbGF0ZWRYWSIsInNoaWZ0ZWRZIiwibW91c2VBcmVhU2hpZnRZIiwibW91c2VBcmVhIiwieCIsImNlbnRlclgiLCJ0b3AiLCJib3R0b20iLCJkcmF3ZXJOb2RlIiwiY2hpbGRyZW4iLCJjbGlwQXJlYSIsImJvdW5kcyIsInlPcGVuIiwieUNsb3NlZCIsInkiLCJhbmltYXRpb24iLCJhZGRJbnB1dExpc3RlbmVyIiwicHJlc3MiLCJldmVudCIsInRyYWlsIiwic2V0IiwiZ2V0Iiwib3Blbk9ic2VydmVyIiwic3RvcCIsImR1cmF0aW9uIiwiZWFzaW5nIiwiUVVBRFJBVElDX0lOX09VVCIsInNldFZhbHVlIiwiZ2V0VmFsdWUiLCJ0byIsInN0YXJ0IiwibGF6eUxpbmsiLCJ1bmxpbmsiLCJhc3NlcnQiLCJwaGV0IiwiY2hpcHBlciIsInF1ZXJ5UGFyYW1ldGVycyIsImJpbmRlciIsInJlZ2lzdGVyRGF0YVVSTCIsInJlZ2lzdGVyIl0sIm1hcHBpbmdzIjoiQUFBQSxzREFBc0Q7QUFFdEQ7Ozs7Q0FJQyxHQUVELE9BQU9BLHFCQUFxQixtQ0FBbUM7QUFFL0QsT0FBT0MsZUFBZSw2QkFBNkI7QUFFbkQsT0FBT0MsZ0JBQWdCLDZCQUE2QjtBQUNwRCxTQUFTQyxLQUFLLFFBQVEsMkJBQTJCO0FBQ2pELE9BQU9DLHNCQUFzQix1REFBdUQ7QUFDcEYsT0FBT0MsZUFBZSxrQ0FBa0M7QUFFeEQsU0FBU0MsSUFBSSxFQUFlQyxJQUFJLEVBQUVDLGFBQWEsRUFBRUMsU0FBUyxRQUFnQiw4QkFBOEI7QUFDeEcsT0FBT0MsZUFBZSw4QkFBOEI7QUFDcEQsT0FBT0MsWUFBWSwyQkFBMkI7QUFDOUMsT0FBT0MsaUJBQWlCLG1CQUFtQjtBQTBDNUIsSUFBQSxBQUFNQyxTQUFOLE1BQU1BLGVBQWVQO0lBcU1sQlEsVUFBZ0I7UUFDOUIsSUFBSSxDQUFDQyxhQUFhO1FBQ2xCLEtBQUssQ0FBQ0Q7SUFDUjtJQUVBOztHQUVDLEdBQ0QsQUFBT0UsTUFBT0MsZ0JBQTBCLEVBQVM7UUFFL0NBLG1CQUFtQixBQUFFQSxxQkFBcUJDLFlBQWMsSUFBSSxDQUFDRCxnQkFBZ0IsR0FBR0E7UUFFaEYsOEVBQThFO1FBQzlFLE1BQU1FLHVCQUF1QixJQUFJLENBQUNGLGdCQUFnQjtRQUNsRCxJQUFJLENBQUNBLGdCQUFnQixHQUFHQTtRQUN4QixJQUFJLENBQUNHLFlBQVks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