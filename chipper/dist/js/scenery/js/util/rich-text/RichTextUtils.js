// Copyright 2023-2024, University of Colorado Boulder
/**
 * Utilities and globals to support RichText
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ import { scenery, Text } from '../../imports.js';
export const isHimalayaElementNode = (node)=>node.type.toLowerCase() === 'element';
export const isHimalayaTextNode = (node)=>node.type.toLowerCase() === 'text';
const RichTextUtils = {
    // We need to do some font-size tests, so we have a Text for that.
    scratchText: new Text(''),
    // Get the attribute value from an element. Return null if that attribute isn't on the element.
    himalayaGetAttribute (attribute, element) {
        if (!element) {
            return null;
        }
        const attributeObject = _.find(element.attributes, (x)=>x.key === attribute);
        if (!attributeObject) {
            return null;
        }
        return attributeObject.value || null;
    },
    // Turn a string of style like "font-sie:6; font-weight:6; favorite-number:6" into a may of style key/values (trimmed of whitespace)
    himalayaStyleStringToMap (styleString) {
        const styleElements = styleString.split(';');
        const styleMap = {};
        styleElements.forEach((styleKeyValue)=>{
            if (styleKeyValue.length > 0) {
                const keyValueTuple = styleKeyValue.split(':');
                assert && assert(keyValueTuple.length === 2, 'too many colons');
                styleMap[keyValueTuple[0].trim()] = keyValueTuple[1].trim();
            }
        });
        return styleMap;
    }
};
export default RichTextUtils;
scenery.register('RichTextUtils', RichTextUtils);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvdXRpbC9yaWNoLXRleHQvUmljaFRleHRVdGlscy50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAyMy0yMDI0LCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuLyoqXG4gKiBVdGlsaXRpZXMgYW5kIGdsb2JhbHMgdG8gc3VwcG9ydCBSaWNoVGV4dFxuICpcbiAqIEBhdXRob3IgSm9uYXRoYW4gT2xzb24gPGpvbmF0aGFuLm9sc29uQGNvbG9yYWRvLmVkdT5cbiAqL1xuaW1wb3J0IHsgc2NlbmVyeSwgVGV4dCB9IGZyb20gJy4uLy4uL2ltcG9ydHMuanMnO1xuXG4vLyBUeXBlcyBmb3IgSGltYWxheWFcbmV4cG9ydCB0eXBlIEhpbWFsYXlhQXR0cmlidXRlID0ge1xuICBrZXk6IHN0cmluZztcbiAgdmFsdWU/OiBzdHJpbmc7XG59O1xuXG5leHBvcnQgdHlwZSBIaW1hbGF5YU5vZGUgPSB7XG4gIHR5cGU6ICdlbGVtZW50JyB8ICdjb21tZW50JyB8ICd0ZXh0JztcbiAgaW5uZXJDb250ZW50OiBzdHJpbmc7XG59O1xuXG5leHBvcnQgdHlwZSBIaW1hbGF5YUVsZW1lbnROb2RlID0ge1xuICB0eXBlOiAnZWxlbWVudCc7XG4gIHRhZ05hbWU6IHN0cmluZztcbiAgY2hpbGRyZW46IEhpbWFsYXlhTm9kZVtdO1xuICBhdHRyaWJ1dGVzOiBIaW1hbGF5YUF0dHJpYnV0ZVtdO1xuICBpbm5lckNvbnRlbnQ/OiBzdHJpbmc7IC8vIElzIHRoaXMgaW4gdGhlIGdlbmVyYXRlZCBzdHVmZj8gRG8gd2UganVzdCBvdmVycmlkZSB0aGlzPyBVbmNsZWFyXG59ICYgSGltYWxheWFOb2RlO1xuXG5leHBvcnQgY29uc3QgaXNIaW1hbGF5YUVsZW1lbnROb2RlID0gKCBub2RlOiBIaW1hbGF5YU5vZGUgKTogbm9kZSBpcyBIaW1hbGF5YUVsZW1lbnROb2RlID0+IG5vZGUudHlwZS50b0xvd2VyQ2FzZSgpID09PSAnZWxlbWVudCc7XG5cbmV4cG9ydCB0eXBlIEhpbWFsYXlhVGV4dE5vZGUgPSB7XG4gIHR5cGU6ICd0ZXh0JztcbiAgY29udGVudDogc3RyaW5nO1xufSAmIEhpbWFsYXlhTm9kZTtcblxuZXhwb3J0IGNvbnN0IGlzSGltYWxheWFUZXh0Tm9kZSA9ICggbm9kZTogSGltYWxheWFOb2RlICk6IG5vZGUgaXMgSGltYWxheWFUZXh0Tm9kZSA9PiBub2RlLnR5cGUudG9Mb3dlckNhc2UoKSA9PT0gJ3RleHQnO1xuXG5jb25zdCBSaWNoVGV4dFV0aWxzID0ge1xuICAvLyBXZSBuZWVkIHRvIGRvIHNvbWUgZm9udC1zaXplIHRlc3RzLCBzbyB3ZSBoYXZlIGEgVGV4dCBmb3IgdGhhdC5cbiAgc2NyYXRjaFRleHQ6IG5ldyBUZXh0KCAnJyApLFxuXG4gIC8vIEdldCB0aGUgYXR0cmlidXRlIHZhbHVlIGZyb20gYW4gZWxlbWVudC4gUmV0dXJuIG51bGwgaWYgdGhhdCBhdHRyaWJ1dGUgaXNuJ3Qgb24gdGhlIGVsZW1lbnQuXG4gIGhpbWFsYXlhR2V0QXR0cmlidXRlKCBhdHRyaWJ1dGU6IHN0cmluZywgZWxlbWVudDogSGltYWxheWFFbGVtZW50Tm9kZSB8IG51bGwgKTogc3RyaW5nIHwgbnVsbCB7XG4gICAgaWYgKCAhZWxlbWVudCApIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICBjb25zdCBhdHRyaWJ1dGVPYmplY3QgPSBfLmZpbmQoIGVsZW1lbnQuYXR0cmlidXRlcywgeCA9PiB4LmtleSA9PT0gYXR0cmlidXRlICk7XG4gICAgaWYgKCAhYXR0cmlidXRlT2JqZWN0ICkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIHJldHVybiBhdHRyaWJ1dGVPYmplY3QudmFsdWUgfHwgbnVsbDtcbiAgfSxcblxuICAvLyBUdXJuIGEgc3RyaW5nIG9mIHN0eWxlIGxpa2UgXCJmb250LXNpZTo2OyBmb250LXdlaWdodDo2OyBmYXZvcml0ZS1udW1iZXI6NlwiIGludG8gYSBtYXkgb2Ygc3R5bGUga2V5L3ZhbHVlcyAodHJpbW1lZCBvZiB3aGl0ZXNwYWNlKVxuICBoaW1hbGF5YVN0eWxlU3RyaW5nVG9NYXAoIHN0eWxlU3RyaW5nOiBzdHJpbmcgKTogUmVjb3JkPHN0cmluZywgc3RyaW5nPiB7XG4gICAgY29uc3Qgc3R5bGVFbGVtZW50cyA9IHN0eWxlU3RyaW5nLnNwbGl0KCAnOycgKTtcbiAgICBjb25zdCBzdHlsZU1hcDogUmVjb3JkPHN0cmluZywgc3RyaW5nPiA9IHt9O1xuICAgIHN0eWxlRWxlbWVudHMuZm9yRWFjaCggc3R5bGVLZXlWYWx1ZSA9PiB7XG4gICAgICBpZiAoIHN0eWxlS2V5VmFsdWUubGVuZ3RoID4gMCApIHtcbiAgICAgICAgY29uc3Qga2V5VmFsdWVUdXBsZSA9IHN0eWxlS2V5VmFsdWUuc3BsaXQoICc6JyApO1xuICAgICAgICBhc3NlcnQgJiYgYXNzZXJ0KCBrZXlWYWx1ZVR1cGxlLmxlbmd0aCA9PT0gMiwgJ3RvbyBtYW55IGNvbG9ucycgKTtcbiAgICAgICAgc3R5bGVNYXBbIGtleVZhbHVlVHVwbGVbIDAgXS50cmltKCkgXSA9IGtleVZhbHVlVHVwbGVbIDEgXS50cmltKCk7XG4gICAgICB9XG4gICAgfSApO1xuICAgIHJldHVybiBzdHlsZU1hcDtcbiAgfVxufTtcblxuZXhwb3J0IGRlZmF1bHQgUmljaFRleHRVdGlscztcblxuc2NlbmVyeS5yZWdpc3RlciggJ1JpY2hUZXh0VXRpbHMnLCBSaWNoVGV4dFV0aWxzICk7Il0sIm5hbWVzIjpbInNjZW5lcnkiLCJUZXh0IiwiaXNIaW1hbGF5YUVsZW1lbnROb2RlIiwibm9kZSIsInR5cGUiLCJ0b0xvd2VyQ2FzZSIsImlzSGltYWxheWFUZXh0Tm9kZSIsIlJpY2hUZXh0VXRpbHMiLCJzY3JhdGNoVGV4dCIsImhpbWFsYXlhR2V0QXR0cmlidXRlIiwiYXR0cmlidXRlIiwiZWxlbWVudCIsImF0dHJpYnV0ZU9iamVjdCIsIl8iLCJmaW5kIiwiYXR0cmlidXRlcyIsIngiLCJrZXkiLCJ2YWx1ZSIsImhpbWFsYXlhU3R5bGVTdHJpbmdUb01hcCIsInN0eWxlU3RyaW5nIiwic3R5bGVFbGVtZW50cyIsInNwbGl0Iiwic3R5bGVNYXAiLCJmb3JFYWNoIiwic3R5bGVLZXlWYWx1ZSIsImxlbmd0aCIsImtleVZhbHVlVHVwbGUiLCJhc3NlcnQiLCJ0cmltIiwicmVnaXN0ZXIiXSwibWFwcGluZ3MiOiJBQUFBLHNEQUFzRDtBQUV0RDs7OztDQUlDLEdBQ0QsU0FBU0EsT0FBTyxFQUFFQyxJQUFJLFFBQVEsbUJBQW1CO0FBcUJqRCxPQUFPLE1BQU1DLHdCQUF3QixDQUFFQyxPQUFxREEsS0FBS0MsSUFBSSxDQUFDQyxXQUFXLE9BQU8sVUFBVTtBQU9sSSxPQUFPLE1BQU1DLHFCQUFxQixDQUFFSCxPQUFrREEsS0FBS0MsSUFBSSxDQUFDQyxXQUFXLE9BQU8sT0FBTztBQUV6SCxNQUFNRSxnQkFBZ0I7SUFDcEIsa0VBQWtFO0lBQ2xFQyxhQUFhLElBQUlQLEtBQU07SUFFdkIsK0ZBQStGO0lBQy9GUSxzQkFBc0JDLFNBQWlCLEVBQUVDLE9BQW1DO1FBQzFFLElBQUssQ0FBQ0EsU0FBVTtZQUNkLE9BQU87UUFDVDtRQUNBLE1BQU1DLGtCQUFrQkMsRUFBRUMsSUFBSSxDQUFFSCxRQUFRSSxVQUFVLEVBQUVDLENBQUFBLElBQUtBLEVBQUVDLEdBQUcsS0FBS1A7UUFDbkUsSUFBSyxDQUFDRSxpQkFBa0I7WUFDdEIsT0FBTztRQUNUO1FBQ0EsT0FBT0EsZ0JBQWdCTSxLQUFLLElBQUk7SUFDbEM7SUFFQSxvSUFBb0k7SUFDcElDLDBCQUEwQkMsV0FBbUI7UUFDM0MsTUFBTUMsZ0JBQWdCRCxZQUFZRSxLQUFLLENBQUU7UUFDekMsTUFBTUMsV0FBbUMsQ0FBQztRQUMxQ0YsY0FBY0csT0FBTyxDQUFFQyxDQUFBQTtZQUNyQixJQUFLQSxjQUFjQyxNQUFNLEdBQUcsR0FBSTtnQkFDOUIsTUFBTUMsZ0JBQWdCRixjQUFjSCxLQUFLLENBQUU7Z0JBQzNDTSxVQUFVQSxPQUFRRCxjQUFjRCxNQUFNLEtBQUssR0FBRztnQkFDOUNILFFBQVEsQ0FBRUksYUFBYSxDQUFFLEVBQUcsQ0FBQ0UsSUFBSSxHQUFJLEdBQUdGLGFBQWEsQ0FBRSxFQUFHLENBQUNFLElBQUk7WUFDakU7UUFDRjtRQUNBLE9BQU9OO0lBQ1Q7QUFDRjtBQUVBLGVBQWVoQixjQUFjO0FBRTdCUCxRQUFROEIsUUFBUSxDQUFFLGlCQUFpQnZCIn0=