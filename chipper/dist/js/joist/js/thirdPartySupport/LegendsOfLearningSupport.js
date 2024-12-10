// Copyright 2017-2023, University of Colorado Boulder
/**
 * Support for Legends of Learning platform. Sends init message after sim is constructed and supports pause/resume.
 *
 * To test this class, follow the 'Legends of Learning Test' instructions at
 * https://github.com/phetsims/QA/blob/main/documentation/qa-book.md#legends-of-learning-test
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */ import joist from '../joist.js';
let LegendsOfLearningSupport = class LegendsOfLearningSupport {
    start() {
        // Send init message when sim has started up so that Legends of Learning can remove their splash screen
        this.sim.isConstructionCompleteProperty.link((isConstructionComplete)=>{
            isConstructionComplete && window.parent !== window && window.parent.postMessage({
                message: 'init'
            }, '*');
        });
    }
    constructor(sim){
        this.sim = sim;
        // Respond to pause/resume commands from the Legends of Learning platform
        window.addEventListener('message', (message)=>{
            if (message.data.messageName === 'pause') {
                sim.stepOneFrame();
                sim.activeProperty.value = false;
            } else if (message.data.messageName === 'resume') {
                sim.activeProperty.value = true;
            }
        });
    }
};
joist.register('LegendsOfLearningSupport', LegendsOfLearningSupport);
export default LegendsOfLearningSupport;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL2pvaXN0L2pzL3RoaXJkUGFydHlTdXBwb3J0L0xlZ2VuZHNPZkxlYXJuaW5nU3VwcG9ydC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNy0yMDIzLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuLyoqXG4gKiBTdXBwb3J0IGZvciBMZWdlbmRzIG9mIExlYXJuaW5nIHBsYXRmb3JtLiBTZW5kcyBpbml0IG1lc3NhZ2UgYWZ0ZXIgc2ltIGlzIGNvbnN0cnVjdGVkIGFuZCBzdXBwb3J0cyBwYXVzZS9yZXN1bWUuXG4gKlxuICogVG8gdGVzdCB0aGlzIGNsYXNzLCBmb2xsb3cgdGhlICdMZWdlbmRzIG9mIExlYXJuaW5nIFRlc3QnIGluc3RydWN0aW9ucyBhdFxuICogaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL1FBL2Jsb2IvbWFpbi9kb2N1bWVudGF0aW9uL3FhLWJvb2subWQjbGVnZW5kcy1vZi1sZWFybmluZy10ZXN0XG4gKlxuICogQGF1dGhvciBTYW0gUmVpZCAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcbiAqL1xuXG5pbXBvcnQgam9pc3QgZnJvbSAnLi4vam9pc3QuanMnO1xuaW1wb3J0IFNpbSBmcm9tICcuLi9TaW0uanMnO1xuXG5jbGFzcyBMZWdlbmRzT2ZMZWFybmluZ1N1cHBvcnQge1xuXG4gIHByaXZhdGUgcmVhZG9ubHkgc2ltOiBTaW07XG5cbiAgcHVibGljIGNvbnN0cnVjdG9yKCBzaW06IFNpbSApIHtcbiAgICB0aGlzLnNpbSA9IHNpbTtcblxuICAgIC8vIFJlc3BvbmQgdG8gcGF1c2UvcmVzdW1lIGNvbW1hbmRzIGZyb20gdGhlIExlZ2VuZHMgb2YgTGVhcm5pbmcgcGxhdGZvcm1cbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lciggJ21lc3NhZ2UnLCBtZXNzYWdlID0+IHtcbiAgICAgIGlmICggbWVzc2FnZS5kYXRhLm1lc3NhZ2VOYW1lID09PSAncGF1c2UnICkge1xuICAgICAgICBzaW0uc3RlcE9uZUZyYW1lKCk7XG4gICAgICAgIHNpbS5hY3RpdmVQcm9wZXJ0eS52YWx1ZSA9IGZhbHNlO1xuICAgICAgfVxuICAgICAgZWxzZSBpZiAoIG1lc3NhZ2UuZGF0YS5tZXNzYWdlTmFtZSA9PT0gJ3Jlc3VtZScgKSB7XG4gICAgICAgIHNpbS5hY3RpdmVQcm9wZXJ0eS52YWx1ZSA9IHRydWU7XG4gICAgICB9XG4gICAgfSApO1xuICB9XG5cbiAgcHVibGljIHN0YXJ0KCk6IHZvaWQge1xuXG4gICAgLy8gU2VuZCBpbml0IG1lc3NhZ2Ugd2hlbiBzaW0gaGFzIHN0YXJ0ZWQgdXAgc28gdGhhdCBMZWdlbmRzIG9mIExlYXJuaW5nIGNhbiByZW1vdmUgdGhlaXIgc3BsYXNoIHNjcmVlblxuICAgIHRoaXMuc2ltLmlzQ29uc3RydWN0aW9uQ29tcGxldGVQcm9wZXJ0eS5saW5rKCBpc0NvbnN0cnVjdGlvbkNvbXBsZXRlID0+IHtcbiAgICAgIGlzQ29uc3RydWN0aW9uQ29tcGxldGUgJiYgKCB3aW5kb3cucGFyZW50ICE9PSB3aW5kb3cgKSAmJiB3aW5kb3cucGFyZW50LnBvc3RNZXNzYWdlKCB7IG1lc3NhZ2U6ICdpbml0JyB9LCAnKicgKTtcbiAgICB9ICk7XG4gIH1cbn1cblxuam9pc3QucmVnaXN0ZXIoICdMZWdlbmRzT2ZMZWFybmluZ1N1cHBvcnQnLCBMZWdlbmRzT2ZMZWFybmluZ1N1cHBvcnQgKTtcbmV4cG9ydCBkZWZhdWx0IExlZ2VuZHNPZkxlYXJuaW5nU3VwcG9ydDsiXSwibmFtZXMiOlsiam9pc3QiLCJMZWdlbmRzT2ZMZWFybmluZ1N1cHBvcnQiLCJzdGFydCIsInNpbSIsImlzQ29uc3RydWN0aW9uQ29tcGxldGVQcm9wZXJ0eSIsImxpbmsiLCJpc0NvbnN0cnVjdGlvbkNvbXBsZXRlIiwid2luZG93IiwicGFyZW50IiwicG9zdE1lc3NhZ2UiLCJtZXNzYWdlIiwiYWRkRXZlbnRMaXN0ZW5lciIsImRhdGEiLCJtZXNzYWdlTmFtZSIsInN0ZXBPbmVGcmFtZSIsImFjdGl2ZVByb3BlcnR5IiwidmFsdWUiLCJyZWdpc3RlciJdLCJtYXBwaW5ncyI6IkFBQUEsc0RBQXNEO0FBRXREOzs7Ozs7O0NBT0MsR0FFRCxPQUFPQSxXQUFXLGNBQWM7QUFHaEMsSUFBQSxBQUFNQywyQkFBTixNQUFNQTtJQW1CR0MsUUFBYztRQUVuQix1R0FBdUc7UUFDdkcsSUFBSSxDQUFDQyxHQUFHLENBQUNDLDhCQUE4QixDQUFDQyxJQUFJLENBQUVDLENBQUFBO1lBQzVDQSwwQkFBNEJDLE9BQU9DLE1BQU0sS0FBS0QsVUFBWUEsT0FBT0MsTUFBTSxDQUFDQyxXQUFXLENBQUU7Z0JBQUVDLFNBQVM7WUFBTyxHQUFHO1FBQzVHO0lBQ0Y7SUFyQkEsWUFBb0JQLEdBQVEsQ0FBRztRQUM3QixJQUFJLENBQUNBLEdBQUcsR0FBR0E7UUFFWCx5RUFBeUU7UUFDekVJLE9BQU9JLGdCQUFnQixDQUFFLFdBQVdELENBQUFBO1lBQ2xDLElBQUtBLFFBQVFFLElBQUksQ0FBQ0MsV0FBVyxLQUFLLFNBQVU7Z0JBQzFDVixJQUFJVyxZQUFZO2dCQUNoQlgsSUFBSVksY0FBYyxDQUFDQyxLQUFLLEdBQUc7WUFDN0IsT0FDSyxJQUFLTixRQUFRRSxJQUFJLENBQUNDLFdBQVcsS0FBSyxVQUFXO2dCQUNoRFYsSUFBSVksY0FBYyxDQUFDQyxLQUFLLEdBQUc7WUFDN0I7UUFDRjtJQUNGO0FBU0Y7QUFFQWhCLE1BQU1pQixRQUFRLENBQUUsNEJBQTRCaEI7QUFDNUMsZUFBZUEseUJBQXlCIn0=