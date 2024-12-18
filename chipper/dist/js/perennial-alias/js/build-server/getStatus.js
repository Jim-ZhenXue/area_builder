// Copyright 2023, University of Colorado Boulder
// @author Matt Pennington (PhET Interactive Simulations)
const persistentQueue = require('./persistentQueue');
module.exports = function getStatus(req, res) {
    const buildStatus = persistentQueue.getQueue();
    res.render('getStatus', {
        builds: buildStatus.queue,
        currentTask: buildStatus.currentTask,
        currentTime: new Date().toString()
    });
};

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3BlcmVubmlhbC1hbGlhcy9qcy9idWlsZC1zZXJ2ZXIvZ2V0U3RhdHVzLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDIzLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcbi8vIEBhdXRob3IgTWF0dCBQZW5uaW5ndG9uIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxuXG5jb25zdCBwZXJzaXN0ZW50UXVldWUgPSByZXF1aXJlKCAnLi9wZXJzaXN0ZW50UXVldWUnICk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gZ2V0U3RhdHVzKCByZXEsIHJlcyApIHtcbiAgY29uc3QgYnVpbGRTdGF0dXMgPSBwZXJzaXN0ZW50UXVldWUuZ2V0UXVldWUoKTtcbiAgcmVzLnJlbmRlciggJ2dldFN0YXR1cycsIHtcbiAgICBidWlsZHM6IGJ1aWxkU3RhdHVzLnF1ZXVlLFxuICAgIGN1cnJlbnRUYXNrOiBidWlsZFN0YXR1cy5jdXJyZW50VGFzayxcbiAgICBjdXJyZW50VGltZTogbmV3IERhdGUoKS50b1N0cmluZygpXG4gIH0gKTtcbn07Il0sIm5hbWVzIjpbInBlcnNpc3RlbnRRdWV1ZSIsInJlcXVpcmUiLCJtb2R1bGUiLCJleHBvcnRzIiwiZ2V0U3RhdHVzIiwicmVxIiwicmVzIiwiYnVpbGRTdGF0dXMiLCJnZXRRdWV1ZSIsInJlbmRlciIsImJ1aWxkcyIsInF1ZXVlIiwiY3VycmVudFRhc2siLCJjdXJyZW50VGltZSIsIkRhdGUiLCJ0b1N0cmluZyJdLCJtYXBwaW5ncyI6IkFBQUEsaURBQWlEO0FBQ2pELHlEQUF5RDtBQUV6RCxNQUFNQSxrQkFBa0JDLFFBQVM7QUFFakNDLE9BQU9DLE9BQU8sR0FBRyxTQUFTQyxVQUFXQyxHQUFHLEVBQUVDLEdBQUc7SUFDM0MsTUFBTUMsY0FBY1AsZ0JBQWdCUSxRQUFRO0lBQzVDRixJQUFJRyxNQUFNLENBQUUsYUFBYTtRQUN2QkMsUUFBUUgsWUFBWUksS0FBSztRQUN6QkMsYUFBYUwsWUFBWUssV0FBVztRQUNwQ0MsYUFBYSxJQUFJQyxPQUFPQyxRQUFRO0lBQ2xDO0FBQ0YifQ==