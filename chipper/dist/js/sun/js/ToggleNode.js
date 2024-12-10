// Copyright 2013-2024, University of Colorado Boulder
/**
 * Display one of N nodes based on a given Property. See the option "unselectedChildrenSceneGraphStrategy" for different
 * child management strategies and how they impact the overall bounds and performance.
 * Supports null and undefined as possible values.  Will not work correctly if the children are changed externally
 * after instantiation (manages its own children and their visibility).
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */ import InstanceRegistry from '../../phet-core/js/documentation/InstanceRegistry.js';
import optionize from '../../phet-core/js/optionize.js';
import { ManualConstraint, Node } from '../../scenery/js/imports.js';
import { getGroupItemNodes } from './GroupItemOptions.js';
import sun from './sun.js';
let ToggleNode = class ToggleNode extends Node {
    dispose() {
        this.disposeToggleNode();
        super.dispose();
    }
    /**
   * A value for the alignChildren option.
   * Centers the latter nodes on the x,y center of the first node.
   */ static CENTER(children) {
        for(let i = 1; i < children.length; i++){
            children[i].center = children[0].center;
        }
    }
    /**
   * A value for the alignChildren option.
   * Centers the latter nodes on the x center of the first node.
   */ static CENTER_X(children) {
        for(let i = 1; i < children.length; i++){
            children[i].centerX = children[0].centerX;
        }
    }
    /**
   * A value for the alignChildren option.
   * Centers the latter nodes on the y center of the first node.
   */ static CENTER_Y(children) {
        for(let i = 1; i < children.length; i++){
            children[i].centerY = children[0].centerY;
        }
    }
    /**
   * A value for the alignChildren option.
   * Left aligns nodes on the left of the first node.
   */ static LEFT(children) {
        for(let i = 1; i < children.length; i++){
            children[i].left = children[0].left;
        }
    }
    /**
   * A value for the alignChildren option.
   * Aligns nodes on the bottom of the first node.
   */ static BOTTOM(children) {
        for(let i = 1; i < children.length; i++){
            children[i].bottom = children[0].bottom;
        }
    }
    /**
   * A value for the alignChildren option.
   * Aligns nodes on the bottom of the first node.
   */ static CENTER_BOTTOM(children) {
        for(let i = 1; i < children.length; i++){
            children[i].centerBottom = children[0].centerBottom;
        }
    }
    /**
   * A value for the alignChildren option.
   * Right aligns nodes on the right of the first node.
   */ static RIGHT(children) {
        for(let i = 1; i < children.length; i++){
            children[i].right = children[0].right;
        }
    }
    /**
   * A value for the alignChildren option.
   * No alignment is performed.
   */ static NONE(children) {
    // do nothing
    }
    constructor(valueProperty, elements, providedOptions){
        var _window_phet_chipper_queryParameters, _window_phet_chipper, _window_phet;
        const options = optionize()({
            // SelfOptions
            alignChildren: ToggleNode.CENTER,
            unselectedChildrenSceneGraphStrategy: 'included'
        }, providedOptions);
        const nodes = getGroupItemNodes(elements, options.tandem);
        options.children = nodes;
        options.alignChildren(options.children);
        super(options);
        const alignmentConstraint = new ManualConstraint(this, options.children, (...x)=>{
            options.alignChildren(x);
        });
        const valueListener = (value)=>{
            const matches = [];
            for(let i = 0; i < elements.length; i++){
                const element = elements[i];
                const visible = element.value === value;
                nodes[i].visible = visible;
                if (visible) {
                    matches.push(nodes[i]);
                }
            }
            assert && assert(matches.length === 1, `Wrong number of matches: ${matches.length}`);
            if (options.unselectedChildrenSceneGraphStrategy === 'excluded') {
                this.children = matches;
            }
        };
        // Run the link after super so we can change the children if needed. This means that when areUnselectedChildrenInSceneGraph===false,
        // all children will temporarily be visible: true until this link is called. However, since this ToggleNode is not yet
        // in the scene graph, this should not cause any visual problems or significant performance issues.
        valueProperty.link(valueListener);
        this.nodes = nodes;
        this.disposeToggleNode = function() {
            valueProperty.unlink(valueListener);
            alignmentConstraint.dispose();
            nodes.forEach((node)=>node.dispose());
        };
        assert && ((_window_phet = window.phet) == null ? void 0 : (_window_phet_chipper = _window_phet.chipper) == null ? void 0 : (_window_phet_chipper_queryParameters = _window_phet_chipper.queryParameters) == null ? void 0 : _window_phet_chipper_queryParameters.binder) && InstanceRegistry.registerDataURL('sun', 'ToggleNode', this);
    }
};
export { ToggleNode as default };
sun.register('ToggleNode', ToggleNode);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3N1bi9qcy9Ub2dnbGVOb2RlLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDEzLTIwMjQsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIERpc3BsYXkgb25lIG9mIE4gbm9kZXMgYmFzZWQgb24gYSBnaXZlbiBQcm9wZXJ0eS4gU2VlIHRoZSBvcHRpb24gXCJ1bnNlbGVjdGVkQ2hpbGRyZW5TY2VuZUdyYXBoU3RyYXRlZ3lcIiBmb3IgZGlmZmVyZW50XG4gKiBjaGlsZCBtYW5hZ2VtZW50IHN0cmF0ZWdpZXMgYW5kIGhvdyB0aGV5IGltcGFjdCB0aGUgb3ZlcmFsbCBib3VuZHMgYW5kIHBlcmZvcm1hbmNlLlxuICogU3VwcG9ydHMgbnVsbCBhbmQgdW5kZWZpbmVkIGFzIHBvc3NpYmxlIHZhbHVlcy4gIFdpbGwgbm90IHdvcmsgY29ycmVjdGx5IGlmIHRoZSBjaGlsZHJlbiBhcmUgY2hhbmdlZCBleHRlcm5hbGx5XG4gKiBhZnRlciBpbnN0YW50aWF0aW9uIChtYW5hZ2VzIGl0cyBvd24gY2hpbGRyZW4gYW5kIHRoZWlyIHZpc2liaWxpdHkpLlxuICpcbiAqIEBhdXRob3IgU2FtIFJlaWQgKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXG4gKi9cblxuaW1wb3J0IFRSZWFkT25seVByb3BlcnR5IGZyb20gJy4uLy4uL2F4b24vanMvVFJlYWRPbmx5UHJvcGVydHkuanMnO1xuaW1wb3J0IEluc3RhbmNlUmVnaXN0cnkgZnJvbSAnLi4vLi4vcGhldC1jb3JlL2pzL2RvY3VtZW50YXRpb24vSW5zdGFuY2VSZWdpc3RyeS5qcyc7XG5pbXBvcnQgb3B0aW9uaXplIGZyb20gJy4uLy4uL3BoZXQtY29yZS9qcy9vcHRpb25pemUuanMnO1xuaW1wb3J0IFN0cmljdE9taXQgZnJvbSAnLi4vLi4vcGhldC1jb3JlL2pzL3R5cGVzL1N0cmljdE9taXQuanMnO1xuaW1wb3J0IHsgTGF5b3V0YWJsZSwgTWFudWFsQ29uc3RyYWludCwgTm9kZSwgTm9kZU9wdGlvbnMgfSBmcm9tICcuLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xuaW1wb3J0IEdyb3VwSXRlbU9wdGlvbnMsIHsgZ2V0R3JvdXBJdGVtTm9kZXMgfSBmcm9tICcuL0dyb3VwSXRlbU9wdGlvbnMuanMnO1xuaW1wb3J0IHN1biBmcm9tICcuL3N1bi5qcyc7XG5cbmV4cG9ydCB0eXBlIFRvZ2dsZU5vZGVFbGVtZW50PFQsIE4gZXh0ZW5kcyBOb2RlID0gTm9kZT4gPSB7XG4gIHZhbHVlOiBUOyAgLy8gYSB2YWx1ZVxufSAmIEdyb3VwSXRlbU9wdGlvbnM8Tj47XG5cbnR5cGUgU2VsZk9wdGlvbnMgPSB7XG5cbiAgLy8ge2Z1bmN0aW9ufSBkZXRlcm1pbmVzIHRoZSByZWxhdGl2ZSBsYXlvdXQgb2YgZWxlbWVudCBOb2Rlcy4gU2VlIGJlbG93IGZvciBwcmUtZGVmaW5lZCBsYXlvdXQuXG4gIGFsaWduQ2hpbGRyZW4/OiAoIGNoaWxkcmVuOiBMYXlvdXRhYmxlW10gKSA9PiB2b2lkO1xuXG4gIC8vIERldGVybWluZSB3aGV0aGVyIHVuc2VsZWN0ZWQgY2hpbGRyZW4gKHRoZSBvbmVzIG5vdCBkaXNwbGF5ZWQpIGFyZSBpbiB0aGUgc2NlbmUgZ3JhcGguXG4gIC8vIC0gSWYgaW5jbHVkZWQgKHRoZSBkZWZhdWx0KSwgdW5zZWxlY3RlZCBjaGlsZHJlbiBhcmUgaW4gdGhlIHNjZW5lIGdyYXBoIGFuZCBoaWRkZW4gdmlhIHNldFZpc2libGUoZmFsc2UpLiBJbiB0aGlzIGNhc2VcbiAgLy8gICB0aGUgbGF5b3V0IGlzIHRoZSB1bmlvbiBvZiB0aGUgYm91bmRzIG9mIGFsbCBjaGlsZHJlbiAodmlzaWJsZSBhbmQgaW52aXNpYmxlKS5cbiAgLy8gLSBJZiBleGNsdWRlZCwgY2hpbGRyZW4gYXJlIGFkZGVkIHRvIHRoZSBzY2VuZSBncmFwaCB3aGVuIHNlbGVjdGVkIGFuZCByZW1vdmVkIHdoZW4gbm90IHNlbGVjdGVkLiBUaGUgVG9nZ2xlTm9kZSBoYXNcbiAgLy8gdGhlIGJvdW5kcyBvZiBpdHMgc2VsZWN0ZWQgY2hpbGQuIFRoaXMgb3B0aW9uIGNhbiBzb21ldGltZXMgaW1wcm92ZSBwZXJmb3JtYW5jZS4gQ2hpbGRyZW4gYWRkZWQgdG8gdGhlIFRvZ2dsZU5vZGVcbiAgLy8gb3V0c2lkZSB0aGUgY29uc3RydWN0b3Igd2lsbCBub3QgYmUgbWFuYWdlZCBjb3JyZWN0bHkuXG4gIHVuc2VsZWN0ZWRDaGlsZHJlblNjZW5lR3JhcGhTdHJhdGVneT86ICdpbmNsdWRlZCcgfCAnZXhjbHVkZWQnO1xufTtcblxuZXhwb3J0IHR5cGUgVG9nZ2xlTm9kZU9wdGlvbnMgPSBTZWxmT3B0aW9ucyAmIFN0cmljdE9taXQ8Tm9kZU9wdGlvbnMsICdjaGlsZHJlbic+O1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBUb2dnbGVOb2RlPFQsIE4gZXh0ZW5kcyBOb2RlID0gTm9kZT4gZXh0ZW5kcyBOb2RlIHtcblxuICBwcml2YXRlIHJlYWRvbmx5IGRpc3Bvc2VUb2dnbGVOb2RlOiAoKSA9PiB2b2lkO1xuICBwdWJsaWMgcmVhZG9ubHkgbm9kZXM6IE5bXTtcblxuICBwdWJsaWMgY29uc3RydWN0b3IoIHZhbHVlUHJvcGVydHk6IFRSZWFkT25seVByb3BlcnR5PFQ+LCBlbGVtZW50czogVG9nZ2xlTm9kZUVsZW1lbnQ8VCwgTj5bXSwgcHJvdmlkZWRPcHRpb25zPzogVG9nZ2xlTm9kZU9wdGlvbnMgKSB7XG5cbiAgICBjb25zdCBvcHRpb25zID0gb3B0aW9uaXplPFRvZ2dsZU5vZGVPcHRpb25zLCBTZWxmT3B0aW9ucywgTm9kZU9wdGlvbnM+KCkoIHtcblxuICAgICAgLy8gU2VsZk9wdGlvbnNcbiAgICAgIGFsaWduQ2hpbGRyZW46IFRvZ2dsZU5vZGUuQ0VOVEVSLFxuXG4gICAgICB1bnNlbGVjdGVkQ2hpbGRyZW5TY2VuZUdyYXBoU3RyYXRlZ3k6ICdpbmNsdWRlZCdcbiAgICB9LCBwcm92aWRlZE9wdGlvbnMgKTtcblxuICAgIGNvbnN0IG5vZGVzID0gZ2V0R3JvdXBJdGVtTm9kZXMoIGVsZW1lbnRzLCBvcHRpb25zLnRhbmRlbSApO1xuXG4gICAgb3B0aW9ucy5jaGlsZHJlbiA9IG5vZGVzO1xuXG4gICAgb3B0aW9ucy5hbGlnbkNoaWxkcmVuKCBvcHRpb25zLmNoaWxkcmVuICk7XG5cbiAgICBzdXBlciggb3B0aW9ucyApO1xuXG4gICAgY29uc3QgYWxpZ25tZW50Q29uc3RyYWludCA9IG5ldyBNYW51YWxDb25zdHJhaW50KCB0aGlzLCBvcHRpb25zLmNoaWxkcmVuLCAoIC4uLng6IExheW91dGFibGVbXSApID0+IHtcbiAgICAgIG9wdGlvbnMuYWxpZ25DaGlsZHJlbiggeCApO1xuICAgIH0gKTtcblxuICAgIGNvbnN0IHZhbHVlTGlzdGVuZXIgPSAoIHZhbHVlOiBUICkgPT4ge1xuICAgICAgY29uc3QgbWF0Y2hlczogTm9kZVtdID0gW107XG4gICAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBlbGVtZW50cy5sZW5ndGg7IGkrKyApIHtcbiAgICAgICAgY29uc3QgZWxlbWVudCA9IGVsZW1lbnRzWyBpIF07XG4gICAgICAgIGNvbnN0IHZpc2libGUgPSBlbGVtZW50LnZhbHVlID09PSB2YWx1ZTtcbiAgICAgICAgbm9kZXNbIGkgXS52aXNpYmxlID0gdmlzaWJsZTtcbiAgICAgICAgaWYgKCB2aXNpYmxlICkge1xuICAgICAgICAgIG1hdGNoZXMucHVzaCggbm9kZXNbIGkgXSApO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGFzc2VydCAmJiBhc3NlcnQoIG1hdGNoZXMubGVuZ3RoID09PSAxLCBgV3JvbmcgbnVtYmVyIG9mIG1hdGNoZXM6ICR7bWF0Y2hlcy5sZW5ndGh9YCApO1xuICAgICAgaWYgKCBvcHRpb25zLnVuc2VsZWN0ZWRDaGlsZHJlblNjZW5lR3JhcGhTdHJhdGVneSA9PT0gJ2V4Y2x1ZGVkJyApIHtcbiAgICAgICAgdGhpcy5jaGlsZHJlbiA9IG1hdGNoZXM7XG4gICAgICB9XG4gICAgfTtcblxuICAgIC8vIFJ1biB0aGUgbGluayBhZnRlciBzdXBlciBzbyB3ZSBjYW4gY2hhbmdlIHRoZSBjaGlsZHJlbiBpZiBuZWVkZWQuIFRoaXMgbWVhbnMgdGhhdCB3aGVuIGFyZVVuc2VsZWN0ZWRDaGlsZHJlbkluU2NlbmVHcmFwaD09PWZhbHNlLFxuICAgIC8vIGFsbCBjaGlsZHJlbiB3aWxsIHRlbXBvcmFyaWx5IGJlIHZpc2libGU6IHRydWUgdW50aWwgdGhpcyBsaW5rIGlzIGNhbGxlZC4gSG93ZXZlciwgc2luY2UgdGhpcyBUb2dnbGVOb2RlIGlzIG5vdCB5ZXRcbiAgICAvLyBpbiB0aGUgc2NlbmUgZ3JhcGgsIHRoaXMgc2hvdWxkIG5vdCBjYXVzZSBhbnkgdmlzdWFsIHByb2JsZW1zIG9yIHNpZ25pZmljYW50IHBlcmZvcm1hbmNlIGlzc3Vlcy5cbiAgICB2YWx1ZVByb3BlcnR5LmxpbmsoIHZhbHVlTGlzdGVuZXIgKTtcblxuICAgIHRoaXMubm9kZXMgPSBub2RlcztcblxuICAgIHRoaXMuZGlzcG9zZVRvZ2dsZU5vZGUgPSBmdW5jdGlvbigpIHtcbiAgICAgIHZhbHVlUHJvcGVydHkudW5saW5rKCB2YWx1ZUxpc3RlbmVyICk7XG4gICAgICBhbGlnbm1lbnRDb25zdHJhaW50LmRpc3Bvc2UoKTtcbiAgICAgIG5vZGVzLmZvckVhY2goIG5vZGUgPT4gbm9kZS5kaXNwb3NlKCkgKTtcbiAgICB9O1xuXG4gICAgYXNzZXJ0ICYmIHdpbmRvdy5waGV0Py5jaGlwcGVyPy5xdWVyeVBhcmFtZXRlcnM/LmJpbmRlciAmJiBJbnN0YW5jZVJlZ2lzdHJ5LnJlZ2lzdGVyRGF0YVVSTCggJ3N1bicsICdUb2dnbGVOb2RlJywgdGhpcyApO1xuICB9XG5cbiAgcHVibGljIG92ZXJyaWRlIGRpc3Bvc2UoKTogdm9pZCB7XG4gICAgdGhpcy5kaXNwb3NlVG9nZ2xlTm9kZSgpO1xuICAgIHN1cGVyLmRpc3Bvc2UoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBIHZhbHVlIGZvciB0aGUgYWxpZ25DaGlsZHJlbiBvcHRpb24uXG4gICAqIENlbnRlcnMgdGhlIGxhdHRlciBub2RlcyBvbiB0aGUgeCx5IGNlbnRlciBvZiB0aGUgZmlyc3Qgbm9kZS5cbiAgICovXG4gIHB1YmxpYyBzdGF0aWMgQ0VOVEVSKCBjaGlsZHJlbjogTGF5b3V0YWJsZVtdICk6IHZvaWQge1xuICAgIGZvciAoIGxldCBpID0gMTsgaSA8IGNoaWxkcmVuLmxlbmd0aDsgaSsrICkge1xuICAgICAgY2hpbGRyZW5bIGkgXS5jZW50ZXIgPSBjaGlsZHJlblsgMCBdLmNlbnRlcjtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQSB2YWx1ZSBmb3IgdGhlIGFsaWduQ2hpbGRyZW4gb3B0aW9uLlxuICAgKiBDZW50ZXJzIHRoZSBsYXR0ZXIgbm9kZXMgb24gdGhlIHggY2VudGVyIG9mIHRoZSBmaXJzdCBub2RlLlxuICAgKi9cbiAgcHVibGljIHN0YXRpYyBDRU5URVJfWCggY2hpbGRyZW46IExheW91dGFibGVbXSApOiB2b2lkIHtcbiAgICBmb3IgKCBsZXQgaSA9IDE7IGkgPCBjaGlsZHJlbi5sZW5ndGg7IGkrKyApIHtcbiAgICAgIGNoaWxkcmVuWyBpIF0uY2VudGVyWCA9IGNoaWxkcmVuWyAwIF0uY2VudGVyWDtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQSB2YWx1ZSBmb3IgdGhlIGFsaWduQ2hpbGRyZW4gb3B0aW9uLlxuICAgKiBDZW50ZXJzIHRoZSBsYXR0ZXIgbm9kZXMgb24gdGhlIHkgY2VudGVyIG9mIHRoZSBmaXJzdCBub2RlLlxuICAgKi9cbiAgcHVibGljIHN0YXRpYyBDRU5URVJfWSggY2hpbGRyZW46IExheW91dGFibGVbXSApOiB2b2lkIHtcbiAgICBmb3IgKCBsZXQgaSA9IDE7IGkgPCBjaGlsZHJlbi5sZW5ndGg7IGkrKyApIHtcbiAgICAgIGNoaWxkcmVuWyBpIF0uY2VudGVyWSA9IGNoaWxkcmVuWyAwIF0uY2VudGVyWTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQSB2YWx1ZSBmb3IgdGhlIGFsaWduQ2hpbGRyZW4gb3B0aW9uLlxuICAgKiBMZWZ0IGFsaWducyBub2RlcyBvbiB0aGUgbGVmdCBvZiB0aGUgZmlyc3Qgbm9kZS5cbiAgICovXG4gIHB1YmxpYyBzdGF0aWMgTEVGVCggY2hpbGRyZW46IExheW91dGFibGVbXSApOiB2b2lkIHtcbiAgICBmb3IgKCBsZXQgaSA9IDE7IGkgPCBjaGlsZHJlbi5sZW5ndGg7IGkrKyApIHtcbiAgICAgIGNoaWxkcmVuWyBpIF0ubGVmdCA9IGNoaWxkcmVuWyAwIF0ubGVmdDtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQSB2YWx1ZSBmb3IgdGhlIGFsaWduQ2hpbGRyZW4gb3B0aW9uLlxuICAgKiBBbGlnbnMgbm9kZXMgb24gdGhlIGJvdHRvbSBvZiB0aGUgZmlyc3Qgbm9kZS5cbiAgICovXG4gIHB1YmxpYyBzdGF0aWMgQk9UVE9NKCBjaGlsZHJlbjogTGF5b3V0YWJsZVtdICk6IHZvaWQge1xuICAgIGZvciAoIGxldCBpID0gMTsgaSA8IGNoaWxkcmVuLmxlbmd0aDsgaSsrICkge1xuICAgICAgY2hpbGRyZW5bIGkgXS5ib3R0b20gPSBjaGlsZHJlblsgMCBdLmJvdHRvbTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQSB2YWx1ZSBmb3IgdGhlIGFsaWduQ2hpbGRyZW4gb3B0aW9uLlxuICAgKiBBbGlnbnMgbm9kZXMgb24gdGhlIGJvdHRvbSBvZiB0aGUgZmlyc3Qgbm9kZS5cbiAgICovXG4gIHB1YmxpYyBzdGF0aWMgQ0VOVEVSX0JPVFRPTSggY2hpbGRyZW46IExheW91dGFibGVbXSApOiB2b2lkIHtcbiAgICBmb3IgKCBsZXQgaSA9IDE7IGkgPCBjaGlsZHJlbi5sZW5ndGg7IGkrKyApIHtcbiAgICAgIGNoaWxkcmVuWyBpIF0uY2VudGVyQm90dG9tID0gY2hpbGRyZW5bIDAgXS5jZW50ZXJCb3R0b207XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEEgdmFsdWUgZm9yIHRoZSBhbGlnbkNoaWxkcmVuIG9wdGlvbi5cbiAgICogUmlnaHQgYWxpZ25zIG5vZGVzIG9uIHRoZSByaWdodCBvZiB0aGUgZmlyc3Qgbm9kZS5cbiAgICovXG4gIHB1YmxpYyBzdGF0aWMgUklHSFQoIGNoaWxkcmVuOiBMYXlvdXRhYmxlW10gKTogdm9pZCB7XG4gICAgZm9yICggbGV0IGkgPSAxOyBpIDwgY2hpbGRyZW4ubGVuZ3RoOyBpKysgKSB7XG4gICAgICBjaGlsZHJlblsgaSBdLnJpZ2h0ID0gY2hpbGRyZW5bIDAgXS5yaWdodDtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQSB2YWx1ZSBmb3IgdGhlIGFsaWduQ2hpbGRyZW4gb3B0aW9uLlxuICAgKiBObyBhbGlnbm1lbnQgaXMgcGVyZm9ybWVkLlxuICAgKi9cbiAgcHVibGljIHN0YXRpYyBOT05FKCBjaGlsZHJlbjogTGF5b3V0YWJsZVtdICk6IHZvaWQge1xuICAgIC8vIGRvIG5vdGhpbmdcbiAgfVxufVxuXG5zdW4ucmVnaXN0ZXIoICdUb2dnbGVOb2RlJywgVG9nZ2xlTm9kZSApOyJdLCJuYW1lcyI6WyJJbnN0YW5jZVJlZ2lzdHJ5Iiwib3B0aW9uaXplIiwiTWFudWFsQ29uc3RyYWludCIsIk5vZGUiLCJnZXRHcm91cEl0ZW1Ob2RlcyIsInN1biIsIlRvZ2dsZU5vZGUiLCJkaXNwb3NlIiwiZGlzcG9zZVRvZ2dsZU5vZGUiLCJDRU5URVIiLCJjaGlsZHJlbiIsImkiLCJsZW5ndGgiLCJjZW50ZXIiLCJDRU5URVJfWCIsImNlbnRlclgiLCJDRU5URVJfWSIsImNlbnRlclkiLCJMRUZUIiwibGVmdCIsIkJPVFRPTSIsImJvdHRvbSIsIkNFTlRFUl9CT1RUT00iLCJjZW50ZXJCb3R0b20iLCJSSUdIVCIsInJpZ2h0IiwiTk9ORSIsInZhbHVlUHJvcGVydHkiLCJlbGVtZW50cyIsInByb3ZpZGVkT3B0aW9ucyIsIndpbmRvdyIsIm9wdGlvbnMiLCJhbGlnbkNoaWxkcmVuIiwidW5zZWxlY3RlZENoaWxkcmVuU2NlbmVHcmFwaFN0cmF0ZWd5Iiwibm9kZXMiLCJ0YW5kZW0iLCJhbGlnbm1lbnRDb25zdHJhaW50IiwieCIsInZhbHVlTGlzdGVuZXIiLCJ2YWx1ZSIsIm1hdGNoZXMiLCJlbGVtZW50IiwidmlzaWJsZSIsInB1c2giLCJhc3NlcnQiLCJsaW5rIiwidW5saW5rIiwiZm9yRWFjaCIsIm5vZGUiLCJwaGV0IiwiY2hpcHBlciIsInF1ZXJ5UGFyYW1ldGVycyIsImJpbmRlciIsInJlZ2lzdGVyRGF0YVVSTCIsInJlZ2lzdGVyIl0sIm1hcHBpbmdzIjoiQUFBQSxzREFBc0Q7QUFFdEQ7Ozs7Ozs7Q0FPQyxHQUdELE9BQU9BLHNCQUFzQix1REFBdUQ7QUFDcEYsT0FBT0MsZUFBZSxrQ0FBa0M7QUFFeEQsU0FBcUJDLGdCQUFnQixFQUFFQyxJQUFJLFFBQXFCLDhCQUE4QjtBQUM5RixTQUEyQkMsaUJBQWlCLFFBQVEsd0JBQXdCO0FBQzVFLE9BQU9DLFNBQVMsV0FBVztBQXNCWixJQUFBLEFBQU1DLGFBQU4sTUFBTUEsbUJBQTZDSDtJQTREaERJLFVBQWdCO1FBQzlCLElBQUksQ0FBQ0MsaUJBQWlCO1FBQ3RCLEtBQUssQ0FBQ0Q7SUFDUjtJQUVBOzs7R0FHQyxHQUNELE9BQWNFLE9BQVFDLFFBQXNCLEVBQVM7UUFDbkQsSUFBTSxJQUFJQyxJQUFJLEdBQUdBLElBQUlELFNBQVNFLE1BQU0sRUFBRUQsSUFBTTtZQUMxQ0QsUUFBUSxDQUFFQyxFQUFHLENBQUNFLE1BQU0sR0FBR0gsUUFBUSxDQUFFLEVBQUcsQ0FBQ0csTUFBTTtRQUM3QztJQUNGO0lBRUE7OztHQUdDLEdBQ0QsT0FBY0MsU0FBVUosUUFBc0IsRUFBUztRQUNyRCxJQUFNLElBQUlDLElBQUksR0FBR0EsSUFBSUQsU0FBU0UsTUFBTSxFQUFFRCxJQUFNO1lBQzFDRCxRQUFRLENBQUVDLEVBQUcsQ0FBQ0ksT0FBTyxHQUFHTCxRQUFRLENBQUUsRUFBRyxDQUFDSyxPQUFPO1FBQy9DO0lBQ0Y7SUFFQTs7O0dBR0MsR0FDRCxPQUFjQyxTQUFVTixRQUFzQixFQUFTO1FBQ3JELElBQU0sSUFBSUMsSUFBSSxHQUFHQSxJQUFJRCxTQUFTRSxNQUFNLEVBQUVELElBQU07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