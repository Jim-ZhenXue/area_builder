// Copyright 2018-2023, University of Colorado Boulder
/**
 * UIComponentsModel is a model that exists only for the purposes of demonstrating sonification, particularly the
 * sound-related behavior of common user interface (UI) components.
 *
 * @author John Blanco
 */ import BooleanProperty from '../../../../../axon/js/BooleanProperty.js';
import tambo from '../../../tambo.js';
let UIComponentsModel = class UIComponentsModel {
    /**
   * restore initial state
   */ reset() {
        this.resetInProgressProperty.value = true;
        this.abSwitch1Property.reset();
        this.abSwitch2Property.reset();
        this.abSwitch3Property.reset();
        this.onOffSwitchProperty.reset();
        this.resetInProgressProperty.value = false;
    }
    constructor(){
        // property used by the AB switches in the demo
        this.abSwitch1Property = new BooleanProperty(false);
        this.abSwitch2Property = new BooleanProperty(false);
        this.abSwitch3Property = new BooleanProperty(false);
        this.onOffSwitchProperty = new BooleanProperty(false);
        this.resetInProgressProperty = new BooleanProperty(false);
    }
};
tambo.register('UIComponentsModel', UIComponentsModel);
export default UIComponentsModel;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3RhbWJvL2pzL2RlbW8vdWktY29tcG9uZW50cy9tb2RlbC9VSUNvbXBvbmVudHNNb2RlbC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxOC0yMDIzLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuLyoqXG4gKiBVSUNvbXBvbmVudHNNb2RlbCBpcyBhIG1vZGVsIHRoYXQgZXhpc3RzIG9ubHkgZm9yIHRoZSBwdXJwb3NlcyBvZiBkZW1vbnN0cmF0aW5nIHNvbmlmaWNhdGlvbiwgcGFydGljdWxhcmx5IHRoZVxuICogc291bmQtcmVsYXRlZCBiZWhhdmlvciBvZiBjb21tb24gdXNlciBpbnRlcmZhY2UgKFVJKSBjb21wb25lbnRzLlxuICpcbiAqIEBhdXRob3IgSm9obiBCbGFuY29cbiAqL1xuXG5pbXBvcnQgQm9vbGVhblByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uLy4uL2F4b24vanMvQm9vbGVhblByb3BlcnR5LmpzJztcbmltcG9ydCBUTW9kZWwgZnJvbSAnLi4vLi4vLi4vLi4vLi4vam9pc3QvanMvVE1vZGVsLmpzJztcbmltcG9ydCB0YW1ibyBmcm9tICcuLi8uLi8uLi90YW1iby5qcyc7XG5cbmNsYXNzIFVJQ29tcG9uZW50c01vZGVsIGltcGxlbWVudHMgVE1vZGVsIHtcblxuICAvLyBwcm9wZXJ0eSB1c2VkIGJ5IHRoZSBBQiBzd2l0Y2hlcyBpbiB0aGUgZGVtb1xuICBwdWJsaWMgcmVhZG9ubHkgYWJTd2l0Y2gxUHJvcGVydHk6IEJvb2xlYW5Qcm9wZXJ0eSA9IG5ldyBCb29sZWFuUHJvcGVydHkoIGZhbHNlICk7XG4gIHB1YmxpYyByZWFkb25seSBhYlN3aXRjaDJQcm9wZXJ0eTogQm9vbGVhblByb3BlcnR5ID0gbmV3IEJvb2xlYW5Qcm9wZXJ0eSggZmFsc2UgKTtcbiAgcHVibGljIHJlYWRvbmx5IGFiU3dpdGNoM1Byb3BlcnR5OiBCb29sZWFuUHJvcGVydHkgPSBuZXcgQm9vbGVhblByb3BlcnR5KCBmYWxzZSApO1xuICBwdWJsaWMgcmVhZG9ubHkgb25PZmZTd2l0Y2hQcm9wZXJ0eTogQm9vbGVhblByb3BlcnR5ID0gbmV3IEJvb2xlYW5Qcm9wZXJ0eSggZmFsc2UgKTtcblxuICAvLyB0cmFja3Mgd2hldGhlciBhIHJlc2V0IGlzIGhhcHBlbmluZ1xuICBwdWJsaWMgcmVhZG9ubHkgcmVzZXRJblByb2dyZXNzUHJvcGVydHk6IEJvb2xlYW5Qcm9wZXJ0eTtcblxuICBwdWJsaWMgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy5yZXNldEluUHJvZ3Jlc3NQcm9wZXJ0eSA9IG5ldyBCb29sZWFuUHJvcGVydHkoIGZhbHNlICk7XG4gIH1cblxuICAvKipcbiAgICogcmVzdG9yZSBpbml0aWFsIHN0YXRlXG4gICAqL1xuICBwdWJsaWMgcmVzZXQoKTogdm9pZCB7XG4gICAgdGhpcy5yZXNldEluUHJvZ3Jlc3NQcm9wZXJ0eS52YWx1ZSA9IHRydWU7XG4gICAgdGhpcy5hYlN3aXRjaDFQcm9wZXJ0eS5yZXNldCgpO1xuICAgIHRoaXMuYWJTd2l0Y2gyUHJvcGVydHkucmVzZXQoKTtcbiAgICB0aGlzLmFiU3dpdGNoM1Byb3BlcnR5LnJlc2V0KCk7XG4gICAgdGhpcy5vbk9mZlN3aXRjaFByb3BlcnR5LnJlc2V0KCk7XG4gICAgdGhpcy5yZXNldEluUHJvZ3Jlc3NQcm9wZXJ0eS52YWx1ZSA9IGZhbHNlO1xuICB9XG59XG5cbnRhbWJvLnJlZ2lzdGVyKCAnVUlDb21wb25lbnRzTW9kZWwnLCBVSUNvbXBvbmVudHNNb2RlbCApO1xuXG5leHBvcnQgZGVmYXVsdCBVSUNvbXBvbmVudHNNb2RlbDsiXSwibmFtZXMiOlsiQm9vbGVhblByb3BlcnR5IiwidGFtYm8iLCJVSUNvbXBvbmVudHNNb2RlbCIsInJlc2V0IiwicmVzZXRJblByb2dyZXNzUHJvcGVydHkiLCJ2YWx1ZSIsImFiU3dpdGNoMVByb3BlcnR5IiwiYWJTd2l0Y2gyUHJvcGVydHkiLCJhYlN3aXRjaDNQcm9wZXJ0eSIsIm9uT2ZmU3dpdGNoUHJvcGVydHkiLCJyZWdpc3RlciJdLCJtYXBwaW5ncyI6IkFBQUEsc0RBQXNEO0FBRXREOzs7OztDQUtDLEdBRUQsT0FBT0EscUJBQXFCLDRDQUE0QztBQUV4RSxPQUFPQyxXQUFXLG9CQUFvQjtBQUV0QyxJQUFBLEFBQU1DLG9CQUFOLE1BQU1BO0lBZUo7O0dBRUMsR0FDRCxBQUFPQyxRQUFjO1FBQ25CLElBQUksQ0FBQ0MsdUJBQXVCLENBQUNDLEtBQUssR0FBRztRQUNyQyxJQUFJLENBQUNDLGlCQUFpQixDQUFDSCxLQUFLO1FBQzVCLElBQUksQ0FBQ0ksaUJBQWlCLENBQUNKLEtBQUs7UUFDNUIsSUFBSSxDQUFDSyxpQkFBaUIsQ0FBQ0wsS0FBSztRQUM1QixJQUFJLENBQUNNLG1CQUFtQixDQUFDTixLQUFLO1FBQzlCLElBQUksQ0FBQ0MsdUJBQXVCLENBQUNDLEtBQUssR0FBRztJQUN2QztJQWRBLGFBQXFCO1FBVHJCLCtDQUErQzthQUMvQkMsb0JBQXFDLElBQUlOLGdCQUFpQjthQUMxRE8sb0JBQXFDLElBQUlQLGdCQUFpQjthQUMxRFEsb0JBQXFDLElBQUlSLGdCQUFpQjthQUMxRFMsc0JBQXVDLElBQUlULGdCQUFpQjtRQU0xRSxJQUFJLENBQUNJLHVCQUF1QixHQUFHLElBQUlKLGdCQUFpQjtJQUN0RDtBQWFGO0FBRUFDLE1BQU1TLFFBQVEsQ0FBRSxxQkFBcUJSO0FBRXJDLGVBQWVBLGtCQUFrQiJ9