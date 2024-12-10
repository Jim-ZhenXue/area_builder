// Copyright 2016 BrainPOP
// Released under MIT License,
// see https://raw.githubusercontent.com/phetsims/sherpa/main/licenses/game-up-camera-1.0.0.js.txt
/**
 * Responds to requests from BrainPOP/Game Up/SnapThought for return images from a PhET simulation.
 * @author BrainPOP
 * @author Vin Rowe
 * @author Sam Reid (PhET Interactive Simulations)
 */ const logging = window.phet.chipper.queryParameters.gameUpLogging;
const isGameUp = window.phet.chipper.queryParameters.gameUp;
const isGameUpTestHarness = window.phet.chipper.queryParameters.gameUpTestHarness;
const log = (text)=>logging && console.log(text);
// Only enable if a query parameter is set
if (isGameUp) {
    log('Enabled Game Up Camera');
    const suffix = '.brainpop.com';
    // haven't received word from the parent that captureReady succeeded
    let gameUpCaptureReady = false;
    // Stop checking after 10 times in case we somehow missed the GameUpCaptureReady message
    let numberOfChecks = 0;
    const checkInitialization = ()=>{
        // haven't received word from the parent that captureReady succeeded
        if (!gameUpCaptureReady && numberOfChecks < 10) {
            parent.postMessage('captureReady', '*');
            numberOfChecks++;
            log('Posted captureReady, number of checks: ' + numberOfChecks);
            setTimeout(checkInitialization, 1000); //try again in a second
        }
    };
    const receiver = (event)=>{
        if (event.origin.indexOf(suffix, event.origin.length - suffix.length) !== -1 || isGameUpTestHarness) {
            if (event.data === 'captureImage') {
                const dataURL = window.phet.joist.ScreenshotGenerator.generateScreenshot(window.phet.joist.sim, 'image/jpeg');
                sendImage(dataURL, event.origin, event.source);
                log('Sent image');
            } else if (event.data === 'GameUpCaptureReady') {
                log('GameUpCaptureReady');
                // TODO: post captureReady from here
                //captureReady succeeded
                gameUpCaptureReady = true;
            }
        }
    };
    const sendImage = (imageString, origin, source)=>{
        //capture.js already appends this, so we end up with two
        imageString = imageString.replace('data:image/jpeg;base64,', '');
        //send it back
        source.postMessage(imageString, origin);
    };
    if (window.addEventListener) {
        window.addEventListener('message', receiver, false);
    } else if (window.attachEvent) {
        window.attachEvent('onmessage', receiver);
    }
    // Call captureReady, function will recall itself until gameUpCaptureReady
    checkInitialization();
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NoZXJwYS9saWIvZ2FtZS11cC1jYW1lcmEtMS4wLjAuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTYgQnJhaW5QT1Bcbi8vIFJlbGVhc2VkIHVuZGVyIE1JVCBMaWNlbnNlLFxuLy8gc2VlIGh0dHBzOi8vcmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbS9waGV0c2ltcy9zaGVycGEvbWFpbi9saWNlbnNlcy9nYW1lLXVwLWNhbWVyYS0xLjAuMC5qcy50eHRcblxuLyoqXG4gKiBSZXNwb25kcyB0byByZXF1ZXN0cyBmcm9tIEJyYWluUE9QL0dhbWUgVXAvU25hcFRob3VnaHQgZm9yIHJldHVybiBpbWFnZXMgZnJvbSBhIFBoRVQgc2ltdWxhdGlvbi5cbiAqIEBhdXRob3IgQnJhaW5QT1BcbiAqIEBhdXRob3IgVmluIFJvd2VcbiAqIEBhdXRob3IgU2FtIFJlaWQgKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXG4gKi9cblxuY29uc3QgbG9nZ2luZyA9IHdpbmRvdy5waGV0LmNoaXBwZXIucXVlcnlQYXJhbWV0ZXJzLmdhbWVVcExvZ2dpbmc7XG5jb25zdCBpc0dhbWVVcCA9IHdpbmRvdy5waGV0LmNoaXBwZXIucXVlcnlQYXJhbWV0ZXJzLmdhbWVVcDtcbmNvbnN0IGlzR2FtZVVwVGVzdEhhcm5lc3MgPSB3aW5kb3cucGhldC5jaGlwcGVyLnF1ZXJ5UGFyYW1ldGVycy5nYW1lVXBUZXN0SGFybmVzcztcblxuY29uc3QgbG9nID0gdGV4dCA9PiBsb2dnaW5nICYmIGNvbnNvbGUubG9nKCB0ZXh0ICk7XG5cbi8vIE9ubHkgZW5hYmxlIGlmIGEgcXVlcnkgcGFyYW1ldGVyIGlzIHNldFxuaWYgKCBpc0dhbWVVcCApIHtcblxuICBsb2coICdFbmFibGVkIEdhbWUgVXAgQ2FtZXJhJyApO1xuXG4gIGNvbnN0IHN1ZmZpeCA9ICcuYnJhaW5wb3AuY29tJztcblxuICAvLyBoYXZlbid0IHJlY2VpdmVkIHdvcmQgZnJvbSB0aGUgcGFyZW50IHRoYXQgY2FwdHVyZVJlYWR5IHN1Y2NlZWRlZFxuICBsZXQgZ2FtZVVwQ2FwdHVyZVJlYWR5ID0gZmFsc2U7XG5cbiAgLy8gU3RvcCBjaGVja2luZyBhZnRlciAxMCB0aW1lcyBpbiBjYXNlIHdlIHNvbWVob3cgbWlzc2VkIHRoZSBHYW1lVXBDYXB0dXJlUmVhZHkgbWVzc2FnZVxuICBsZXQgbnVtYmVyT2ZDaGVja3MgPSAwO1xuXG4gIGNvbnN0IGNoZWNrSW5pdGlhbGl6YXRpb24gPSAoKSA9PiB7XG5cbiAgICAvLyBoYXZlbid0IHJlY2VpdmVkIHdvcmQgZnJvbSB0aGUgcGFyZW50IHRoYXQgY2FwdHVyZVJlYWR5IHN1Y2NlZWRlZFxuICAgIGlmICggIWdhbWVVcENhcHR1cmVSZWFkeSAmJiBudW1iZXJPZkNoZWNrcyA8IDEwICkge1xuICAgICAgcGFyZW50LnBvc3RNZXNzYWdlKCAnY2FwdHVyZVJlYWR5JywgJyonICk7XG4gICAgICBudW1iZXJPZkNoZWNrcysrO1xuXG4gICAgICBsb2coICdQb3N0ZWQgY2FwdHVyZVJlYWR5LCBudW1iZXIgb2YgY2hlY2tzOiAnICsgbnVtYmVyT2ZDaGVja3MgKTtcbiAgICAgIHNldFRpbWVvdXQoIGNoZWNrSW5pdGlhbGl6YXRpb24sIDEwMDAgKTsvL3RyeSBhZ2FpbiBpbiBhIHNlY29uZFxuICAgIH1cbiAgfTtcblxuICBjb25zdCByZWNlaXZlciA9IGV2ZW50ID0+IHtcbiAgICBpZiAoIGV2ZW50Lm9yaWdpbi5pbmRleE9mKCBzdWZmaXgsIGV2ZW50Lm9yaWdpbi5sZW5ndGggLSBzdWZmaXgubGVuZ3RoICkgIT09IC0xIHx8IGlzR2FtZVVwVGVzdEhhcm5lc3MgKSB7XG4gICAgICBpZiAoIGV2ZW50LmRhdGEgPT09ICdjYXB0dXJlSW1hZ2UnICkge1xuICAgICAgICBjb25zdCBkYXRhVVJMID0gd2luZG93LnBoZXQuam9pc3QuU2NyZWVuc2hvdEdlbmVyYXRvci5nZW5lcmF0ZVNjcmVlbnNob3QoIHdpbmRvdy5waGV0LmpvaXN0LnNpbSwgJ2ltYWdlL2pwZWcnICk7XG4gICAgICAgIHNlbmRJbWFnZSggZGF0YVVSTCwgZXZlbnQub3JpZ2luLCBldmVudC5zb3VyY2UgKTtcblxuICAgICAgICBsb2coICdTZW50IGltYWdlJyApO1xuICAgICAgfVxuICAgICAgZWxzZSBpZiAoIGV2ZW50LmRhdGEgPT09ICdHYW1lVXBDYXB0dXJlUmVhZHknICkge1xuXG4gICAgICAgIGxvZyggJ0dhbWVVcENhcHR1cmVSZWFkeScgKTtcblxuICAgICAgICAvLyBUT0RPOiBwb3N0IGNhcHR1cmVSZWFkeSBmcm9tIGhlcmVcblxuICAgICAgICAvL2NhcHR1cmVSZWFkeSBzdWNjZWVkZWRcbiAgICAgICAgZ2FtZVVwQ2FwdHVyZVJlYWR5ID0gdHJ1ZTtcbiAgICAgIH1cbiAgICB9XG4gIH07XG5cbiAgY29uc3Qgc2VuZEltYWdlID0gKCBpbWFnZVN0cmluZywgb3JpZ2luLCBzb3VyY2UgKSA9PiB7XG5cbiAgICAvL2NhcHR1cmUuanMgYWxyZWFkeSBhcHBlbmRzIHRoaXMsIHNvIHdlIGVuZCB1cCB3aXRoIHR3b1xuICAgIGltYWdlU3RyaW5nID0gaW1hZ2VTdHJpbmcucmVwbGFjZSggJ2RhdGE6aW1hZ2UvanBlZztiYXNlNjQsJywgJycgKTtcblxuICAgIC8vc2VuZCBpdCBiYWNrXG4gICAgc291cmNlLnBvc3RNZXNzYWdlKCBpbWFnZVN0cmluZywgb3JpZ2luICk7XG4gIH07XG5cbiAgaWYgKCB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lciApIHtcbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lciggJ21lc3NhZ2UnLCByZWNlaXZlciwgZmFsc2UgKTtcbiAgfVxuICBlbHNlIGlmICggd2luZG93LmF0dGFjaEV2ZW50ICkge1xuICAgIHdpbmRvdy5hdHRhY2hFdmVudCggJ29ubWVzc2FnZScsIHJlY2VpdmVyICk7XG4gIH1cblxuICAvLyBDYWxsIGNhcHR1cmVSZWFkeSwgZnVuY3Rpb24gd2lsbCByZWNhbGwgaXRzZWxmIHVudGlsIGdhbWVVcENhcHR1cmVSZWFkeVxuICBjaGVja0luaXRpYWxpemF0aW9uKCk7XG59Il0sIm5hbWVzIjpbImxvZ2dpbmciLCJ3aW5kb3ciLCJwaGV0IiwiY2hpcHBlciIsInF1ZXJ5UGFyYW1ldGVycyIsImdhbWVVcExvZ2dpbmciLCJpc0dhbWVVcCIsImdhbWVVcCIsImlzR2FtZVVwVGVzdEhhcm5lc3MiLCJnYW1lVXBUZXN0SGFybmVzcyIsImxvZyIsInRleHQiLCJjb25zb2xlIiwic3VmZml4IiwiZ2FtZVVwQ2FwdHVyZVJlYWR5IiwibnVtYmVyT2ZDaGVja3MiLCJjaGVja0luaXRpYWxpemF0aW9uIiwicGFyZW50IiwicG9zdE1lc3NhZ2UiLCJzZXRUaW1lb3V0IiwicmVjZWl2ZXIiLCJldmVudCIsIm9yaWdpbiIsImluZGV4T2YiLCJsZW5ndGgiLCJkYXRhIiwiZGF0YVVSTCIsImpvaXN0IiwiU2NyZWVuc2hvdEdlbmVyYXRvciIsImdlbmVyYXRlU2NyZWVuc2hvdCIsInNpbSIsInNlbmRJbWFnZSIsInNvdXJjZSIsImltYWdlU3RyaW5nIiwicmVwbGFjZSIsImFkZEV2ZW50TGlzdGVuZXIiLCJhdHRhY2hFdmVudCJdLCJtYXBwaW5ncyI6IkFBQUEsMEJBQTBCO0FBQzFCLDhCQUE4QjtBQUM5QixrR0FBa0c7QUFFbEc7Ozs7O0NBS0MsR0FFRCxNQUFNQSxVQUFVQyxPQUFPQyxJQUFJLENBQUNDLE9BQU8sQ0FBQ0MsZUFBZSxDQUFDQyxhQUFhO0FBQ2pFLE1BQU1DLFdBQVdMLE9BQU9DLElBQUksQ0FBQ0MsT0FBTyxDQUFDQyxlQUFlLENBQUNHLE1BQU07QUFDM0QsTUFBTUMsc0JBQXNCUCxPQUFPQyxJQUFJLENBQUNDLE9BQU8sQ0FBQ0MsZUFBZSxDQUFDSyxpQkFBaUI7QUFFakYsTUFBTUMsTUFBTUMsQ0FBQUEsT0FBUVgsV0FBV1ksUUFBUUYsR0FBRyxDQUFFQztBQUU1QywwQ0FBMEM7QUFDMUMsSUFBS0wsVUFBVztJQUVkSSxJQUFLO0lBRUwsTUFBTUcsU0FBUztJQUVmLG9FQUFvRTtJQUNwRSxJQUFJQyxxQkFBcUI7SUFFekIsd0ZBQXdGO0lBQ3hGLElBQUlDLGlCQUFpQjtJQUVyQixNQUFNQyxzQkFBc0I7UUFFMUIsb0VBQW9FO1FBQ3BFLElBQUssQ0FBQ0Ysc0JBQXNCQyxpQkFBaUIsSUFBSztZQUNoREUsT0FBT0MsV0FBVyxDQUFFLGdCQUFnQjtZQUNwQ0g7WUFFQUwsSUFBSyw0Q0FBNENLO1lBQ2pESSxXQUFZSCxxQkFBcUIsT0FBTyx1QkFBdUI7UUFDakU7SUFDRjtJQUVBLE1BQU1JLFdBQVdDLENBQUFBO1FBQ2YsSUFBS0EsTUFBTUMsTUFBTSxDQUFDQyxPQUFPLENBQUVWLFFBQVFRLE1BQU1DLE1BQU0sQ0FBQ0UsTUFBTSxHQUFHWCxPQUFPVyxNQUFNLE1BQU8sQ0FBQyxLQUFLaEIscUJBQXNCO1lBQ3ZHLElBQUthLE1BQU1JLElBQUksS0FBSyxnQkFBaUI7Z0JBQ25DLE1BQU1DLFVBQVV6QixPQUFPQyxJQUFJLENBQUN5QixLQUFLLENBQUNDLG1CQUFtQixDQUFDQyxrQkFBa0IsQ0FBRTVCLE9BQU9DLElBQUksQ0FBQ3lCLEtBQUssQ0FBQ0csR0FBRyxFQUFFO2dCQUNqR0MsVUFBV0wsU0FBU0wsTUFBTUMsTUFBTSxFQUFFRCxNQUFNVyxNQUFNO2dCQUU5Q3RCLElBQUs7WUFDUCxPQUNLLElBQUtXLE1BQU1JLElBQUksS0FBSyxzQkFBdUI7Z0JBRTlDZixJQUFLO2dCQUVMLG9DQUFvQztnQkFFcEMsd0JBQXdCO2dCQUN4QkkscUJBQXFCO1lBQ3ZCO1FBQ0Y7SUFDRjtJQUVBLE1BQU1pQixZQUFZLENBQUVFLGFBQWFYLFFBQVFVO1FBRXZDLHdEQUF3RDtRQUN4REMsY0FBY0EsWUFBWUMsT0FBTyxDQUFFLDJCQUEyQjtRQUU5RCxjQUFjO1FBQ2RGLE9BQU9kLFdBQVcsQ0FBRWUsYUFBYVg7SUFDbkM7SUFFQSxJQUFLckIsT0FBT2tDLGdCQUFnQixFQUFHO1FBQzdCbEMsT0FBT2tDLGdCQUFnQixDQUFFLFdBQVdmLFVBQVU7SUFDaEQsT0FDSyxJQUFLbkIsT0FBT21DLFdBQVcsRUFBRztRQUM3Qm5DLE9BQU9tQyxXQUFXLENBQUUsYUFBYWhCO0lBQ25DO0lBRUEsMEVBQTBFO0lBQzFFSjtBQUNGIn0=