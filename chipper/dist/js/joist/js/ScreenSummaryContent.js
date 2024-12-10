// Copyright 2024, University of Colorado Boulder
/**
 * Parallel DOM content for a screen summary of a ScreenView. This is a screen specific summary that is available
 * for a screen reader.
 *
 * This class offers support for a basic paragraph or multiple paragraphs of content. If you need more
 * complex PDOM content, create your own scenery Nodes and add them as a child of this Node.
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */ import joist from '../../joist/js/joist.js';
import { Node } from '../../scenery/js/imports.js';
let ScreenSummaryContent = class ScreenSummaryContent extends Node {
    /**
   * Sets the content of the ScreenSummaryContent.
   */ setContent(content) {
        if (content === null) {
            this.multiParagraphNode.removeAllChildren();
            this.paragraphNode.innerContent = null;
        } else if (Array.isArray(content)) {
            this.multiParagraphNode.removeAllChildren();
            content.forEach((contentProperty)=>{
                this.multiParagraphNode.addChild(new Node({
                    tagName: 'p',
                    innerContent: contentProperty
                }));
            });
        } else {
            this.paragraphNode.innerContent = content;
        }
    }
    set content(content) {
        this.setContent(content);
    }
    /**
   * If provided content is a single item, it is added to the PDOM as a single paragraph.
   * If provided content is an array, each item is added as its own paragraph.
   * If content is null, nothing is added.
   */ constructor(content, providedOptions){
        super(providedOptions), // A Node for a single paragraph of content.
        this.paragraphNode = new Node({
            tagName: 'p'
        }), // A parent Node for multiple paragraphs of content.
        this.multiParagraphNode = new Node();
        this.addChild(this.paragraphNode);
        this.addChild(this.multiParagraphNode);
        this.setContent(content);
    }
};
export { ScreenSummaryContent as default };
joist.register('ScreenSummaryContent', ScreenSummaryContent);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2pvaXN0L2pzL1NjcmVlblN1bW1hcnlDb250ZW50LnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDI0LCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuLyoqXG4gKiBQYXJhbGxlbCBET00gY29udGVudCBmb3IgYSBzY3JlZW4gc3VtbWFyeSBvZiBhIFNjcmVlblZpZXcuIFRoaXMgaXMgYSBzY3JlZW4gc3BlY2lmaWMgc3VtbWFyeSB0aGF0IGlzIGF2YWlsYWJsZVxuICogZm9yIGEgc2NyZWVuIHJlYWRlci5cbiAqXG4gKiBUaGlzIGNsYXNzIG9mZmVycyBzdXBwb3J0IGZvciBhIGJhc2ljIHBhcmFncmFwaCBvciBtdWx0aXBsZSBwYXJhZ3JhcGhzIG9mIGNvbnRlbnQuIElmIHlvdSBuZWVkIG1vcmVcbiAqIGNvbXBsZXggUERPTSBjb250ZW50LCBjcmVhdGUgeW91ciBvd24gc2NlbmVyeSBOb2RlcyBhbmQgYWRkIHRoZW0gYXMgYSBjaGlsZCBvZiB0aGlzIE5vZGUuXG4gKlxuICogQGF1dGhvciBKZXNzZSBHcmVlbmJlcmcgKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXG4gKi9cblxuaW1wb3J0IHsgRGlzcG9zYWJsZU9wdGlvbnMgfSBmcm9tICcuLi8uLi9heG9uL2pzL0Rpc3Bvc2FibGUuanMnO1xuaW1wb3J0IFRSZWFkT25seVByb3BlcnR5IGZyb20gJy4uLy4uL2F4b24vanMvVFJlYWRPbmx5UHJvcGVydHkuanMnO1xuaW1wb3J0IGpvaXN0IGZyb20gJy4uLy4uL2pvaXN0L2pzL2pvaXN0LmpzJztcbmltcG9ydCB7IE5vZGUgfSBmcm9tICcuLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xuXG50eXBlIFNjcmVlblN1bW1hcnlDb250ZW50T3B0aW9ucyA9IERpc3Bvc2FibGVPcHRpb25zO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBTY3JlZW5TdW1tYXJ5Q29udGVudCBleHRlbmRzIE5vZGUge1xuXG4gIC8vIEEgTm9kZSBmb3IgYSBzaW5nbGUgcGFyYWdyYXBoIG9mIGNvbnRlbnQuXG4gIHByaXZhdGUgcGFyYWdyYXBoTm9kZTogTm9kZSA9IG5ldyBOb2RlKCB7IHRhZ05hbWU6ICdwJyB9ICk7XG5cbiAgLy8gQSBwYXJlbnQgTm9kZSBmb3IgbXVsdGlwbGUgcGFyYWdyYXBocyBvZiBjb250ZW50LlxuICBwcml2YXRlIG11bHRpUGFyYWdyYXBoTm9kZTogTm9kZSA9IG5ldyBOb2RlKCk7XG5cbiAgLyoqXG4gICAqIElmIHByb3ZpZGVkIGNvbnRlbnQgaXMgYSBzaW5nbGUgaXRlbSwgaXQgaXMgYWRkZWQgdG8gdGhlIFBET00gYXMgYSBzaW5nbGUgcGFyYWdyYXBoLlxuICAgKiBJZiBwcm92aWRlZCBjb250ZW50IGlzIGFuIGFycmF5LCBlYWNoIGl0ZW0gaXMgYWRkZWQgYXMgaXRzIG93biBwYXJhZ3JhcGguXG4gICAqIElmIGNvbnRlbnQgaXMgbnVsbCwgbm90aGluZyBpcyBhZGRlZC5cbiAgICovXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggY29udGVudDogVFJlYWRPbmx5UHJvcGVydHk8c3RyaW5nPiB8IFRSZWFkT25seVByb3BlcnR5PHN0cmluZz5bXSB8IG51bGwsIHByb3ZpZGVkT3B0aW9ucz86IFNjcmVlblN1bW1hcnlDb250ZW50T3B0aW9ucyApIHtcbiAgICBzdXBlciggcHJvdmlkZWRPcHRpb25zICk7XG5cbiAgICB0aGlzLmFkZENoaWxkKCB0aGlzLnBhcmFncmFwaE5vZGUgKTtcbiAgICB0aGlzLmFkZENoaWxkKCB0aGlzLm11bHRpUGFyYWdyYXBoTm9kZSApO1xuXG4gICAgdGhpcy5zZXRDb250ZW50KCBjb250ZW50ICk7XG4gIH1cblxuICAvKipcbiAgICogU2V0cyB0aGUgY29udGVudCBvZiB0aGUgU2NyZWVuU3VtbWFyeUNvbnRlbnQuXG4gICAqL1xuICBwdWJsaWMgc2V0Q29udGVudCggY29udGVudDogVFJlYWRPbmx5UHJvcGVydHk8c3RyaW5nPiB8IFRSZWFkT25seVByb3BlcnR5PHN0cmluZz5bXSB8IG51bGwgKTogdm9pZCB7XG4gICAgaWYgKCBjb250ZW50ID09PSBudWxsICkge1xuICAgICAgdGhpcy5tdWx0aVBhcmFncmFwaE5vZGUucmVtb3ZlQWxsQ2hpbGRyZW4oKTtcbiAgICAgIHRoaXMucGFyYWdyYXBoTm9kZS5pbm5lckNvbnRlbnQgPSBudWxsO1xuICAgIH1cbiAgICBlbHNlIGlmICggQXJyYXkuaXNBcnJheSggY29udGVudCApICkge1xuICAgICAgdGhpcy5tdWx0aVBhcmFncmFwaE5vZGUucmVtb3ZlQWxsQ2hpbGRyZW4oKTtcbiAgICAgIGNvbnRlbnQuZm9yRWFjaCggY29udGVudFByb3BlcnR5ID0+IHtcbiAgICAgICAgdGhpcy5tdWx0aVBhcmFncmFwaE5vZGUuYWRkQ2hpbGQoIG5ldyBOb2RlKCB7XG4gICAgICAgICAgdGFnTmFtZTogJ3AnLFxuICAgICAgICAgIGlubmVyQ29udGVudDogY29udGVudFByb3BlcnR5XG4gICAgICAgIH0gKSApO1xuICAgICAgfSApO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIHRoaXMucGFyYWdyYXBoTm9kZS5pbm5lckNvbnRlbnQgPSBjb250ZW50O1xuICAgIH1cbiAgfVxuXG4gIHB1YmxpYyBzZXQgY29udGVudCggY29udGVudDogVFJlYWRPbmx5UHJvcGVydHk8c3RyaW5nPiB8IFRSZWFkT25seVByb3BlcnR5PHN0cmluZz5bXSB8IG51bGwgKSB7XG4gICAgdGhpcy5zZXRDb250ZW50KCBjb250ZW50ICk7XG4gIH1cbn1cblxuam9pc3QucmVnaXN0ZXIoICdTY3JlZW5TdW1tYXJ5Q29udGVudCcsIFNjcmVlblN1bW1hcnlDb250ZW50ICk7Il0sIm5hbWVzIjpbImpvaXN0IiwiTm9kZSIsIlNjcmVlblN1bW1hcnlDb250ZW50Iiwic2V0Q29udGVudCIsImNvbnRlbnQiLCJtdWx0aVBhcmFncmFwaE5vZGUiLCJyZW1vdmVBbGxDaGlsZHJlbiIsInBhcmFncmFwaE5vZGUiLCJpbm5lckNvbnRlbnQiLCJBcnJheSIsImlzQXJyYXkiLCJmb3JFYWNoIiwiY29udGVudFByb3BlcnR5IiwiYWRkQ2hpbGQiLCJ0YWdOYW1lIiwicHJvdmlkZWRPcHRpb25zIiwicmVnaXN0ZXIiXSwibWFwcGluZ3MiOiJBQUFBLGlEQUFpRDtBQUVqRDs7Ozs7Ozs7Q0FRQyxHQUlELE9BQU9BLFdBQVcsMEJBQTBCO0FBQzVDLFNBQVNDLElBQUksUUFBUSw4QkFBOEI7QUFJcEMsSUFBQSxBQUFNQyx1QkFBTixNQUFNQSw2QkFBNkJEO0lBc0JoRDs7R0FFQyxHQUNELEFBQU9FLFdBQVlDLE9BQXVFLEVBQVM7UUFDakcsSUFBS0EsWUFBWSxNQUFPO1lBQ3RCLElBQUksQ0FBQ0Msa0JBQWtCLENBQUNDLGlCQUFpQjtZQUN6QyxJQUFJLENBQUNDLGFBQWEsQ0FBQ0MsWUFBWSxHQUFHO1FBQ3BDLE9BQ0ssSUFBS0MsTUFBTUMsT0FBTyxDQUFFTixVQUFZO1lBQ25DLElBQUksQ0FBQ0Msa0JBQWtCLENBQUNDLGlCQUFpQjtZQUN6Q0YsUUFBUU8sT0FBTyxDQUFFQyxDQUFBQTtnQkFDZixJQUFJLENBQUNQLGtCQUFrQixDQUFDUSxRQUFRLENBQUUsSUFBSVosS0FBTTtvQkFDMUNhLFNBQVM7b0JBQ1ROLGNBQWNJO2dCQUNoQjtZQUNGO1FBQ0YsT0FDSztZQUNILElBQUksQ0FBQ0wsYUFBYSxDQUFDQyxZQUFZLEdBQUdKO1FBQ3BDO0lBQ0Y7SUFFQSxJQUFXQSxRQUFTQSxPQUF1RSxFQUFHO1FBQzVGLElBQUksQ0FBQ0QsVUFBVSxDQUFFQztJQUNuQjtJQXRDQTs7OztHQUlDLEdBQ0QsWUFBb0JBLE9BQXVFLEVBQUVXLGVBQTZDLENBQUc7UUFDM0ksS0FBSyxDQUFFQSxrQkFaVCw0Q0FBNEM7YUFDcENSLGdCQUFzQixJQUFJTixLQUFNO1lBQUVhLFNBQVM7UUFBSSxJQUV2RCxvREFBb0Q7YUFDNUNULHFCQUEyQixJQUFJSjtRQVVyQyxJQUFJLENBQUNZLFFBQVEsQ0FBRSxJQUFJLENBQUNOLGFBQWE7UUFDakMsSUFBSSxDQUFDTSxRQUFRLENBQUUsSUFBSSxDQUFDUixrQkFBa0I7UUFFdEMsSUFBSSxDQUFDRixVQUFVLENBQUVDO0lBQ25CO0FBMkJGO0FBL0NBLFNBQXFCRixrQ0ErQ3BCO0FBRURGLE1BQU1nQixRQUFRLENBQUUsd0JBQXdCZCJ9