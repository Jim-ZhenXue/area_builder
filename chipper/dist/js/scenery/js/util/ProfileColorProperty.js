// Copyright 2021-2024, University of Colorado Boulder
/**
 * ProfileColorProperty is a ColorProperty that changes its value based on the value of colorProfileProperty.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */ import arrayRemove from '../../../phet-core/js/arrayRemove.js';
import optionize from '../../../phet-core/js/optionize.js';
import { Color, colorProfileProperty, ColorProperty, scenery, SceneryConstants } from '../imports.js';
// constant
const NAME_SEPARATOR = '.';
// static instances are tracked for iframe communication with the HTML color editor
const instances = [];
let ProfileColorProperty = class ProfileColorProperty extends ColorProperty {
    dispose() {
        arrayRemove(instances, this);
        super.dispose();
    }
    /**
   * @param namespace - namespace that this color belongs to
   * @param colorName - name of the color, unique within namespace
   * @param colorProfileMap - object literal that maps keys (profile names) to ColorDef (that should be immutable)
   * @param [providedOptions]
   */ constructor(namespace, colorName, colorProfileMap, providedOptions){
        const options = optionize()({
            // So that notifications won't occur when we change from different objects representing the same color.
            // We should never be mutating the Color objects used for ProfileColorProperty.
            valueComparisonStrategy: 'equalsFunction',
            // See https://github.com/phetsims/scenery/issues/1512
            tandemNameSuffix: [
                'ColorProperty',
                'FillProperty',
                'StrokeProperty'
            ]
        }, providedOptions);
        // All values are eagerly coerced to Color instances for efficiency (so it only has to be done once) and simplicity
        // (so the types are uniform)
        colorProfileMap = _.mapValues(colorProfileMap, (color)=>{
            // Force Color values to be immutable.
            return Color.toColor(color).setImmutable();
        });
        assert && assert(colorProfileMap.hasOwnProperty(SceneryConstants.DEFAULT_COLOR_PROFILE), 'default color profile must be provided');
        assert && assert(!!colorProfileMap[SceneryConstants.DEFAULT_COLOR_PROFILE], 'default color profile must be truthy');
        // Fallback to default if a color was not supplied.
        super(Color.toColor(colorProfileMap[colorProfileProperty.value] || colorProfileMap[SceneryConstants.DEFAULT_COLOR_PROFILE]), options);
        this.colorProfileMap = colorProfileMap;
        // When the color profile name changes, select the corresponding color.
        colorProfileProperty.link((colorProfileName)=>{
            // fallback to default if a color not supplied
            this.value = Color.toColor(this.colorProfileMap[colorProfileName] || this.colorProfileMap[SceneryConstants.DEFAULT_COLOR_PROFILE]);
        });
        this.name = `${namespace.name}${NAME_SEPARATOR}${colorName}`;
        // On initialization and when the color changes, send a message to the parent frame identifying the color value.
        // The HTML color editor wrapper listens for these messages and displays the color values.
        this.link((color)=>{
            if (window.parent !== window) {
                window.parent.postMessage(JSON.stringify({
                    type: 'reportColor',
                    name: this.name,
                    value: color.toHexString(),
                    alpha: color.getAlpha()
                }), '*');
            }
        });
        // assert that names are unique
        if (assert) {
            const matches = instances.filter((e)=>e.name === this.name);
            assert && assert(matches.length === 0, 'cannot use the same name for two different ProfileColorProperty instances: ' + name);
        }
        // Register with the static list for the HTML color editor
        instances.push(this);
    }
};
export { ProfileColorProperty as default };
// Listen for messages from the HTML color editor wrapper with new color values.
window.addEventListener('message', (event)=>{
    let data;
    try {
        data = JSON.parse(event.data);
    } catch (e) {
    // We don't do anything with the caught value. If this happens, it is not JSON. This can happen with the
    // LoL wrappers, see https://github.com/phetsims/joist/issues/484.
    }
    if (data && data.type === 'setColor') {
        for(let i = 0; i < instances.length; i++){
            const instanceProperty = instances[i];
            if (instanceProperty.name === data.name) {
                instanceProperty.colorProfileMap[colorProfileProperty.value] = new Color(data.value).withAlpha(data.alpha);
                instanceProperty.value = Color.toColor(instanceProperty.colorProfileMap[colorProfileProperty.value]);
            }
        }
    }
});
scenery.register('ProfileColorProperty', ProfileColorProperty);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvdXRpbC9Qcm9maWxlQ29sb3JQcm9wZXJ0eS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAyMS0yMDI0LCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuLyoqXG4gKiBQcm9maWxlQ29sb3JQcm9wZXJ0eSBpcyBhIENvbG9yUHJvcGVydHkgdGhhdCBjaGFuZ2VzIGl0cyB2YWx1ZSBiYXNlZCBvbiB0aGUgdmFsdWUgb2YgY29sb3JQcm9maWxlUHJvcGVydHkuXG4gKlxuICogQGF1dGhvciBTYW0gUmVpZCAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcbiAqL1xuXG5pbXBvcnQgeyBQcm9wZXJ0eU9wdGlvbnMgfSBmcm9tICcuLi8uLi8uLi9heG9uL2pzL1Byb3BlcnR5LmpzJztcbmltcG9ydCBhcnJheVJlbW92ZSBmcm9tICcuLi8uLi8uLi9waGV0LWNvcmUvanMvYXJyYXlSZW1vdmUuanMnO1xuaW1wb3J0IE5hbWVzcGFjZSBmcm9tICcuLi8uLi8uLi9waGV0LWNvcmUvanMvTmFtZXNwYWNlLmpzJztcbmltcG9ydCBvcHRpb25pemUsIHsgRW1wdHlTZWxmT3B0aW9ucyB9IGZyb20gJy4uLy4uLy4uL3BoZXQtY29yZS9qcy9vcHRpb25pemUuanMnO1xuaW1wb3J0IHsgQ29sb3IsIGNvbG9yUHJvZmlsZVByb3BlcnR5LCBDb2xvclByb3BlcnR5LCBzY2VuZXJ5LCBTY2VuZXJ5Q29uc3RhbnRzIH0gZnJvbSAnLi4vaW1wb3J0cy5qcyc7XG5cbi8vIGNvbnN0YW50XG5jb25zdCBOQU1FX1NFUEFSQVRPUiA9ICcuJztcblxuLy8gc3RhdGljIGluc3RhbmNlcyBhcmUgdHJhY2tlZCBmb3IgaWZyYW1lIGNvbW11bmljYXRpb24gd2l0aCB0aGUgSFRNTCBjb2xvciBlZGl0b3JcbmNvbnN0IGluc3RhbmNlczogUHJvZmlsZUNvbG9yUHJvcGVydHlbXSA9IFtdO1xuXG50eXBlIENvbG9yUHJvZmlsZU1hcCA9IFJlY29yZDxzdHJpbmcsIENvbG9yIHwgc3RyaW5nPjtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUHJvZmlsZUNvbG9yUHJvcGVydHkgZXh0ZW5kcyBDb2xvclByb3BlcnR5IHtcblxuICAvLyB2YWx1ZXMgYXJlIG11dGF0ZWQgYnkgdGhlIEhUTUwgY29sb3Igd3JhcHBlci5cbiAgLy8gKHNjZW5lcnktaW50ZXJuYWwpXG4gIHB1YmxpYyByZWFkb25seSBjb2xvclByb2ZpbGVNYXA6IENvbG9yUHJvZmlsZU1hcDtcblxuICAvLyBUcmVhdCBhcyBwcml2YXRlXG4gIHB1YmxpYyByZWFkb25seSBuYW1lOiBzdHJpbmc7XG5cbiAgLyoqXG4gICAqIEBwYXJhbSBuYW1lc3BhY2UgLSBuYW1lc3BhY2UgdGhhdCB0aGlzIGNvbG9yIGJlbG9uZ3MgdG9cbiAgICogQHBhcmFtIGNvbG9yTmFtZSAtIG5hbWUgb2YgdGhlIGNvbG9yLCB1bmlxdWUgd2l0aGluIG5hbWVzcGFjZVxuICAgKiBAcGFyYW0gY29sb3JQcm9maWxlTWFwIC0gb2JqZWN0IGxpdGVyYWwgdGhhdCBtYXBzIGtleXMgKHByb2ZpbGUgbmFtZXMpIHRvIENvbG9yRGVmICh0aGF0IHNob3VsZCBiZSBpbW11dGFibGUpXG4gICAqIEBwYXJhbSBbcHJvdmlkZWRPcHRpb25zXVxuICAgKi9cbiAgcHVibGljIGNvbnN0cnVjdG9yKCBuYW1lc3BhY2U6IE5hbWVzcGFjZSwgY29sb3JOYW1lOiBzdHJpbmcsIGNvbG9yUHJvZmlsZU1hcDogQ29sb3JQcm9maWxlTWFwLCBwcm92aWRlZE9wdGlvbnM/OiBQcm9wZXJ0eU9wdGlvbnM8Q29sb3I+ICkge1xuXG4gICAgY29uc3Qgb3B0aW9ucyA9IG9wdGlvbml6ZTxQcm9wZXJ0eU9wdGlvbnM8Q29sb3I+LCBFbXB0eVNlbGZPcHRpb25zLCBQcm9wZXJ0eU9wdGlvbnM8Q29sb3I+PigpKCB7XG5cbiAgICAgIC8vIFNvIHRoYXQgbm90aWZpY2F0aW9ucyB3b24ndCBvY2N1ciB3aGVuIHdlIGNoYW5nZSBmcm9tIGRpZmZlcmVudCBvYmplY3RzIHJlcHJlc2VudGluZyB0aGUgc2FtZSBjb2xvci5cbiAgICAgIC8vIFdlIHNob3VsZCBuZXZlciBiZSBtdXRhdGluZyB0aGUgQ29sb3Igb2JqZWN0cyB1c2VkIGZvciBQcm9maWxlQ29sb3JQcm9wZXJ0eS5cbiAgICAgIHZhbHVlQ29tcGFyaXNvblN0cmF0ZWd5OiAnZXF1YWxzRnVuY3Rpb24nLFxuXG4gICAgICAvLyBTZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3NjZW5lcnkvaXNzdWVzLzE1MTJcbiAgICAgIHRhbmRlbU5hbWVTdWZmaXg6IFsgJ0NvbG9yUHJvcGVydHknLCAnRmlsbFByb3BlcnR5JywgJ1N0cm9rZVByb3BlcnR5JyBdXG4gICAgfSwgcHJvdmlkZWRPcHRpb25zICk7XG5cbiAgICAvLyBBbGwgdmFsdWVzIGFyZSBlYWdlcmx5IGNvZXJjZWQgdG8gQ29sb3IgaW5zdGFuY2VzIGZvciBlZmZpY2llbmN5IChzbyBpdCBvbmx5IGhhcyB0byBiZSBkb25lIG9uY2UpIGFuZCBzaW1wbGljaXR5XG4gICAgLy8gKHNvIHRoZSB0eXBlcyBhcmUgdW5pZm9ybSlcbiAgICBjb2xvclByb2ZpbGVNYXAgPSBfLm1hcFZhbHVlcyggY29sb3JQcm9maWxlTWFwLCBjb2xvciA9PiB7XG4gICAgICAvLyBGb3JjZSBDb2xvciB2YWx1ZXMgdG8gYmUgaW1tdXRhYmxlLlxuICAgICAgcmV0dXJuIENvbG9yLnRvQ29sb3IoIGNvbG9yICkuc2V0SW1tdXRhYmxlKCk7XG4gICAgfSApO1xuXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggY29sb3JQcm9maWxlTWFwLmhhc093blByb3BlcnR5KCBTY2VuZXJ5Q29uc3RhbnRzLkRFRkFVTFRfQ09MT1JfUFJPRklMRSApLCAnZGVmYXVsdCBjb2xvciBwcm9maWxlIG11c3QgYmUgcHJvdmlkZWQnICk7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggISFjb2xvclByb2ZpbGVNYXBbIFNjZW5lcnlDb25zdGFudHMuREVGQVVMVF9DT0xPUl9QUk9GSUxFIF0sICdkZWZhdWx0IGNvbG9yIHByb2ZpbGUgbXVzdCBiZSB0cnV0aHknICk7XG5cbiAgICAvLyBGYWxsYmFjayB0byBkZWZhdWx0IGlmIGEgY29sb3Igd2FzIG5vdCBzdXBwbGllZC5cbiAgICBzdXBlciggQ29sb3IudG9Db2xvciggY29sb3JQcm9maWxlTWFwWyBjb2xvclByb2ZpbGVQcm9wZXJ0eS52YWx1ZSBdIHx8IGNvbG9yUHJvZmlsZU1hcFsgU2NlbmVyeUNvbnN0YW50cy5ERUZBVUxUX0NPTE9SX1BST0ZJTEUgXSApLCBvcHRpb25zICk7XG5cbiAgICB0aGlzLmNvbG9yUHJvZmlsZU1hcCA9IGNvbG9yUHJvZmlsZU1hcDtcblxuICAgIC8vIFdoZW4gdGhlIGNvbG9yIHByb2ZpbGUgbmFtZSBjaGFuZ2VzLCBzZWxlY3QgdGhlIGNvcnJlc3BvbmRpbmcgY29sb3IuXG4gICAgY29sb3JQcm9maWxlUHJvcGVydHkubGluayggY29sb3JQcm9maWxlTmFtZSA9PiB7XG5cbiAgICAgIC8vIGZhbGxiYWNrIHRvIGRlZmF1bHQgaWYgYSBjb2xvciBub3Qgc3VwcGxpZWRcbiAgICAgIHRoaXMudmFsdWUgPSBDb2xvci50b0NvbG9yKCB0aGlzLmNvbG9yUHJvZmlsZU1hcFsgY29sb3JQcm9maWxlTmFtZSBdIHx8IHRoaXMuY29sb3JQcm9maWxlTWFwWyBTY2VuZXJ5Q29uc3RhbnRzLkRFRkFVTFRfQ09MT1JfUFJPRklMRSBdICk7XG4gICAgfSApO1xuXG4gICAgdGhpcy5uYW1lID0gYCR7bmFtZXNwYWNlLm5hbWV9JHtOQU1FX1NFUEFSQVRPUn0ke2NvbG9yTmFtZX1gO1xuXG4gICAgLy8gT24gaW5pdGlhbGl6YXRpb24gYW5kIHdoZW4gdGhlIGNvbG9yIGNoYW5nZXMsIHNlbmQgYSBtZXNzYWdlIHRvIHRoZSBwYXJlbnQgZnJhbWUgaWRlbnRpZnlpbmcgdGhlIGNvbG9yIHZhbHVlLlxuICAgIC8vIFRoZSBIVE1MIGNvbG9yIGVkaXRvciB3cmFwcGVyIGxpc3RlbnMgZm9yIHRoZXNlIG1lc3NhZ2VzIGFuZCBkaXNwbGF5cyB0aGUgY29sb3IgdmFsdWVzLlxuICAgIHRoaXMubGluayggY29sb3IgPT4ge1xuICAgICAgaWYgKCB3aW5kb3cucGFyZW50ICE9PSB3aW5kb3cgKSB7XG4gICAgICAgIHdpbmRvdy5wYXJlbnQucG9zdE1lc3NhZ2UoIEpTT04uc3RyaW5naWZ5KCB7XG4gICAgICAgICAgdHlwZTogJ3JlcG9ydENvbG9yJyxcbiAgICAgICAgICBuYW1lOiB0aGlzLm5hbWUsXG4gICAgICAgICAgdmFsdWU6IGNvbG9yLnRvSGV4U3RyaW5nKCksXG4gICAgICAgICAgYWxwaGE6IGNvbG9yLmdldEFscGhhKClcbiAgICAgICAgfSApLCAnKicgKTtcbiAgICAgIH1cbiAgICB9ICk7XG5cbiAgICAvLyBhc3NlcnQgdGhhdCBuYW1lcyBhcmUgdW5pcXVlXG4gICAgaWYgKCBhc3NlcnQgKSB7XG4gICAgICBjb25zdCBtYXRjaGVzID0gaW5zdGFuY2VzLmZpbHRlciggZSA9PiBlLm5hbWUgPT09IHRoaXMubmFtZSApO1xuICAgICAgYXNzZXJ0ICYmIGFzc2VydCggbWF0Y2hlcy5sZW5ndGggPT09IDAsICdjYW5ub3QgdXNlIHRoZSBzYW1lIG5hbWUgZm9yIHR3byBkaWZmZXJlbnQgUHJvZmlsZUNvbG9yUHJvcGVydHkgaW5zdGFuY2VzOiAnICsgbmFtZSApO1xuICAgIH1cblxuICAgIC8vIFJlZ2lzdGVyIHdpdGggdGhlIHN0YXRpYyBsaXN0IGZvciB0aGUgSFRNTCBjb2xvciBlZGl0b3JcbiAgICBpbnN0YW5jZXMucHVzaCggdGhpcyApO1xuICB9XG5cbiAgcHVibGljIG92ZXJyaWRlIGRpc3Bvc2UoKTogdm9pZCB7XG4gICAgYXJyYXlSZW1vdmUoIGluc3RhbmNlcywgdGhpcyApO1xuICAgIHN1cGVyLmRpc3Bvc2UoKTtcbiAgfVxufVxuXG4vLyBMaXN0ZW4gZm9yIG1lc3NhZ2VzIGZyb20gdGhlIEhUTUwgY29sb3IgZWRpdG9yIHdyYXBwZXIgd2l0aCBuZXcgY29sb3IgdmFsdWVzLlxud2luZG93LmFkZEV2ZW50TGlzdGVuZXIoICdtZXNzYWdlJywgZXZlbnQgPT4ge1xuICBsZXQgZGF0YTtcbiAgdHJ5IHtcbiAgICBkYXRhID0gSlNPTi5wYXJzZSggZXZlbnQuZGF0YSApO1xuICB9XG4gIGNhdGNoKCBlICkge1xuICAgIC8vIFdlIGRvbid0IGRvIGFueXRoaW5nIHdpdGggdGhlIGNhdWdodCB2YWx1ZS4gSWYgdGhpcyBoYXBwZW5zLCBpdCBpcyBub3QgSlNPTi4gVGhpcyBjYW4gaGFwcGVuIHdpdGggdGhlXG4gICAgLy8gTG9MIHdyYXBwZXJzLCBzZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2pvaXN0L2lzc3Vlcy80ODQuXG4gIH1cblxuICBpZiAoIGRhdGEgJiYgZGF0YS50eXBlID09PSAnc2V0Q29sb3InICkge1xuICAgIGZvciAoIGxldCBpID0gMDsgaSA8IGluc3RhbmNlcy5sZW5ndGg7IGkrKyApIHtcbiAgICAgIGNvbnN0IGluc3RhbmNlUHJvcGVydHkgPSBpbnN0YW5jZXNbIGkgXTtcbiAgICAgIGlmICggaW5zdGFuY2VQcm9wZXJ0eS5uYW1lID09PSBkYXRhLm5hbWUgKSB7XG4gICAgICAgIGluc3RhbmNlUHJvcGVydHkuY29sb3JQcm9maWxlTWFwWyBjb2xvclByb2ZpbGVQcm9wZXJ0eS52YWx1ZSBdID0gbmV3IENvbG9yKCBkYXRhLnZhbHVlICkud2l0aEFscGhhKCBkYXRhLmFscGhhICk7XG4gICAgICAgIGluc3RhbmNlUHJvcGVydHkudmFsdWUgPSBDb2xvci50b0NvbG9yKCBpbnN0YW5jZVByb3BlcnR5LmNvbG9yUHJvZmlsZU1hcFsgY29sb3JQcm9maWxlUHJvcGVydHkudmFsdWUgXSApO1xuICAgICAgfVxuICAgIH1cbiAgfVxufSApO1xuXG5zY2VuZXJ5LnJlZ2lzdGVyKCAnUHJvZmlsZUNvbG9yUHJvcGVydHknLCBQcm9maWxlQ29sb3JQcm9wZXJ0eSApOyJdLCJuYW1lcyI6WyJhcnJheVJlbW92ZSIsIm9wdGlvbml6ZSIsIkNvbG9yIiwiY29sb3JQcm9maWxlUHJvcGVydHkiLCJDb2xvclByb3BlcnR5Iiwic2NlbmVyeSIsIlNjZW5lcnlDb25zdGFudHMiLCJOQU1FX1NFUEFSQVRPUiIsImluc3RhbmNlcyIsIlByb2ZpbGVDb2xvclByb3BlcnR5IiwiZGlzcG9zZSIsIm5hbWVzcGFjZSIsImNvbG9yTmFtZSIsImNvbG9yUHJvZmlsZU1hcCIsInByb3ZpZGVkT3B0aW9ucyIsIm9wdGlvbnMiLCJ2YWx1ZUNvbXBhcmlzb25TdHJhdGVneSIsInRhbmRlbU5hbWVTdWZmaXgiLCJfIiwibWFwVmFsdWVzIiwiY29sb3IiLCJ0b0NvbG9yIiwic2V0SW1tdXRhYmxlIiwiYXNzZXJ0IiwiaGFzT3duUHJvcGVydHkiLCJERUZBVUxUX0NPTE9SX1BST0ZJTEUiLCJ2YWx1ZSIsImxpbmsiLCJjb2xvclByb2ZpbGVOYW1lIiwibmFtZSIsIndpbmRvdyIsInBhcmVudCIsInBvc3RNZXNzYWdlIiwiSlNPTiIsInN0cmluZ2lmeSIsInR5cGUiLCJ0b0hleFN0cmluZyIsImFscGhhIiwiZ2V0QWxwaGEiLCJtYXRjaGVzIiwiZmlsdGVyIiwiZSIsImxlbmd0aCIsInB1c2giLCJhZGRFdmVudExpc3RlbmVyIiwiZXZlbnQiLCJkYXRhIiwicGFyc2UiLCJpIiwiaW5zdGFuY2VQcm9wZXJ0eSIsIndpdGhBbHBoYSIsInJlZ2lzdGVyIl0sIm1hcHBpbmdzIjoiQUFBQSxzREFBc0Q7QUFFdEQ7Ozs7Q0FJQyxHQUdELE9BQU9BLGlCQUFpQix1Q0FBdUM7QUFFL0QsT0FBT0MsZUFBcUMscUNBQXFDO0FBQ2pGLFNBQVNDLEtBQUssRUFBRUMsb0JBQW9CLEVBQUVDLGFBQWEsRUFBRUMsT0FBTyxFQUFFQyxnQkFBZ0IsUUFBUSxnQkFBZ0I7QUFFdEcsV0FBVztBQUNYLE1BQU1DLGlCQUFpQjtBQUV2QixtRkFBbUY7QUFDbkYsTUFBTUMsWUFBb0MsRUFBRTtBQUk3QixJQUFBLEFBQU1DLHVCQUFOLE1BQU1BLDZCQUE2Qkw7SUEwRWhDTSxVQUFnQjtRQUM5QlYs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