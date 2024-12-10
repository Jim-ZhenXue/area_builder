// Copyright 2017, University of Colorado Boulder
// @author Matt Pennington (PhET Interactive Simulations)
function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
    try {
        var info = gen[key](arg);
        var value = info.value;
    } catch (error) {
        reject(error);
        return;
    }
    if (info.done) {
        resolve(value);
    } else {
        Promise.resolve(value).then(_next, _throw);
    }
}
function _async_to_generator(fn) {
    return function() {
        var self = this, args = arguments;
        return new Promise(function(resolve, reject) {
            var gen = fn.apply(self, args);
            function _next(value) {
                asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value);
            }
            function _throw(err) {
                asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err);
            }
            _next(undefined);
        });
    };
}
const constants = require('./constants');
const winston = require('winston');
const nodemailer = require('nodemailer');
// configure email server
let transporter;
if (constants.BUILD_SERVER_CONFIG.emailUsername && constants.BUILD_SERVER_CONFIG.emailPassword && constants.BUILD_SERVER_CONFIG.emailTo) {
    transporter = nodemailer.createTransport({
        auth: {
            user: constants.BUILD_SERVER_CONFIG.emailUsername,
            pass: constants.BUILD_SERVER_CONFIG.emailPassword
        },
        host: constants.BUILD_SERVER_CONFIG.emailServer,
        port: 587,
        tls: {
            ciphers: 'SSLv3'
        }
    });
} else {
    winston.log('warn', 'failed to set up email server, missing one or more of the following fields in build-local.json:\n' + 'emailUsername, emailPassword, emailTo');
}
/**
 * Send an email. Used to notify developers if a build fails
 * @param subject
 * @param text
 * @param emailParameter - recipient defined per request
 * @param emailParameterOnly - if true send the email only to the passed in email, not to the default list as well
 */ module.exports = /*#__PURE__*/ function() {
    var _sendEmail = _async_to_generator(function*(subject, text, emailParameter, emailParameterOnly) {
        if (transporter) {
            let emailTo = constants.BUILD_SERVER_CONFIG.emailTo;
            if (emailParameter) {
                if (emailParameterOnly) {
                    emailTo = emailParameter;
                } else {
                    emailTo += `, ${emailParameter}`;
                }
            }
            // don't send an email if no email is given
            if (emailParameterOnly && !emailParameter) {
                return;
            }
            try {
                const emailResult = yield transporter.sendMail({
                    from: `"PhET Mail" <${constants.BUILD_SERVER_CONFIG.emailUsername}>`,
                    to: emailTo,
                    subject: subject,
                    text: text.replace(/([^\r])\n/g, '$1\r\n') // Replace LF with CRLF, bare line feeds are rejected by some email clients,
                });
                winston.info(`sent email: ${emailTo}, ${subject}, ${emailResult.messageId}, ${emailResult.response}`);
            } catch (err) {
                let errorString = typeof err === 'string' ? err : JSON.stringify(err);
                errorString = errorString.replace(constants.BUILD_SERVER_CONFIG.emailPassword, '***PASSWORD REDACTED***');
                winston.error(`error when attempted to send email, err = ${errorString}`);
            }
        }
    });
    function sendEmail(subject, text, emailParameter, emailParameterOnly) {
        return _sendEmail.apply(this, arguments);
    }
    return sendEmail;
}();

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3BlcmVubmlhbC1hbGlhcy9qcy9idWlsZC1zZXJ2ZXIvc2VuZEVtYWlsLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE3LCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcbi8vIEBhdXRob3IgTWF0dCBQZW5uaW5ndG9uIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxuXG5cbmNvbnN0IGNvbnN0YW50cyA9IHJlcXVpcmUoICcuL2NvbnN0YW50cycgKTtcbmNvbnN0IHdpbnN0b24gPSByZXF1aXJlKCAnd2luc3RvbicgKTtcbmNvbnN0IG5vZGVtYWlsZXIgPSByZXF1aXJlKCAnbm9kZW1haWxlcicgKTtcblxuLy8gY29uZmlndXJlIGVtYWlsIHNlcnZlclxubGV0IHRyYW5zcG9ydGVyO1xuaWYgKCBjb25zdGFudHMuQlVJTERfU0VSVkVSX0NPTkZJRy5lbWFpbFVzZXJuYW1lICYmIGNvbnN0YW50cy5CVUlMRF9TRVJWRVJfQ09ORklHLmVtYWlsUGFzc3dvcmQgJiYgY29uc3RhbnRzLkJVSUxEX1NFUlZFUl9DT05GSUcuZW1haWxUbyApIHtcbiAgdHJhbnNwb3J0ZXIgPSBub2RlbWFpbGVyLmNyZWF0ZVRyYW5zcG9ydCgge1xuICAgIGF1dGg6IHtcbiAgICAgIHVzZXI6IGNvbnN0YW50cy5CVUlMRF9TRVJWRVJfQ09ORklHLmVtYWlsVXNlcm5hbWUsXG4gICAgICBwYXNzOiBjb25zdGFudHMuQlVJTERfU0VSVkVSX0NPTkZJRy5lbWFpbFBhc3N3b3JkXG4gICAgfSxcbiAgICBob3N0OiBjb25zdGFudHMuQlVJTERfU0VSVkVSX0NPTkZJRy5lbWFpbFNlcnZlcixcbiAgICBwb3J0OiA1ODcsXG4gICAgdGxzOiB7XG4gICAgICBjaXBoZXJzOiAnU1NMdjMnXG4gICAgfVxuICB9ICk7XG59XG5lbHNlIHtcbiAgd2luc3Rvbi5sb2coICd3YXJuJywgJ2ZhaWxlZCB0byBzZXQgdXAgZW1haWwgc2VydmVyLCBtaXNzaW5nIG9uZSBvciBtb3JlIG9mIHRoZSBmb2xsb3dpbmcgZmllbGRzIGluIGJ1aWxkLWxvY2FsLmpzb246XFxuJyArXG4gICAgICAgICAgICAgICAgICAgICAgICdlbWFpbFVzZXJuYW1lLCBlbWFpbFBhc3N3b3JkLCBlbWFpbFRvJyApO1xufVxuXG4vKipcbiAqIFNlbmQgYW4gZW1haWwuIFVzZWQgdG8gbm90aWZ5IGRldmVsb3BlcnMgaWYgYSBidWlsZCBmYWlsc1xuICogQHBhcmFtIHN1YmplY3RcbiAqIEBwYXJhbSB0ZXh0XG4gKiBAcGFyYW0gZW1haWxQYXJhbWV0ZXIgLSByZWNpcGllbnQgZGVmaW5lZCBwZXIgcmVxdWVzdFxuICogQHBhcmFtIGVtYWlsUGFyYW1ldGVyT25seSAtIGlmIHRydWUgc2VuZCB0aGUgZW1haWwgb25seSB0byB0aGUgcGFzc2VkIGluIGVtYWlsLCBub3QgdG8gdGhlIGRlZmF1bHQgbGlzdCBhcyB3ZWxsXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gYXN5bmMgZnVuY3Rpb24gc2VuZEVtYWlsKCBzdWJqZWN0LCB0ZXh0LCBlbWFpbFBhcmFtZXRlciwgZW1haWxQYXJhbWV0ZXJPbmx5ICkge1xuICBpZiAoIHRyYW5zcG9ydGVyICkge1xuICAgIGxldCBlbWFpbFRvID0gY29uc3RhbnRzLkJVSUxEX1NFUlZFUl9DT05GSUcuZW1haWxUbztcblxuICAgIGlmICggZW1haWxQYXJhbWV0ZXIgKSB7XG4gICAgICBpZiAoIGVtYWlsUGFyYW1ldGVyT25seSApIHtcbiAgICAgICAgZW1haWxUbyA9IGVtYWlsUGFyYW1ldGVyO1xuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgIGVtYWlsVG8gKz0gKCBgLCAke2VtYWlsUGFyYW1ldGVyfWAgKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBkb24ndCBzZW5kIGFuIGVtYWlsIGlmIG5vIGVtYWlsIGlzIGdpdmVuXG4gICAgaWYgKCBlbWFpbFBhcmFtZXRlck9ubHkgJiYgIWVtYWlsUGFyYW1ldGVyICkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRyeSB7XG4gICAgICBjb25zdCBlbWFpbFJlc3VsdCA9IGF3YWl0IHRyYW5zcG9ydGVyLnNlbmRNYWlsKCB7XG4gICAgICAgIGZyb206IGBcIlBoRVQgTWFpbFwiIDwke2NvbnN0YW50cy5CVUlMRF9TRVJWRVJfQ09ORklHLmVtYWlsVXNlcm5hbWV9PmAsXG4gICAgICAgIHRvOiBlbWFpbFRvLFxuICAgICAgICBzdWJqZWN0OiBzdWJqZWN0LFxuICAgICAgICB0ZXh0OiB0ZXh0LnJlcGxhY2UoIC8oW15cXHJdKVxcbi9nLCAnJDFcXHJcXG4nICkgLy8gUmVwbGFjZSBMRiB3aXRoIENSTEYsIGJhcmUgbGluZSBmZWVkcyBhcmUgcmVqZWN0ZWQgYnkgc29tZSBlbWFpbCBjbGllbnRzLFxuICAgICAgfSApO1xuXG4gICAgICB3aW5zdG9uLmluZm8oIGBzZW50IGVtYWlsOiAke2VtYWlsVG99LCAke3N1YmplY3R9LCAke2VtYWlsUmVzdWx0Lm1lc3NhZ2VJZH0sICR7ZW1haWxSZXN1bHQucmVzcG9uc2V9YCApO1xuICAgIH1cbiAgICBjYXRjaCggZXJyICkge1xuICAgICAgbGV0IGVycm9yU3RyaW5nID0gdHlwZW9mIGVyciA9PT0gJ3N0cmluZycgPyBlcnIgOiBKU09OLnN0cmluZ2lmeSggZXJyICk7XG4gICAgICBlcnJvclN0cmluZyA9IGVycm9yU3RyaW5nLnJlcGxhY2UoIGNvbnN0YW50cy5CVUlMRF9TRVJWRVJfQ09ORklHLmVtYWlsUGFzc3dvcmQsICcqKipQQVNTV09SRCBSRURBQ1RFRCoqKicgKTtcbiAgICAgIHdpbnN0b24uZXJyb3IoIGBlcnJvciB3aGVuIGF0dGVtcHRlZCB0byBzZW5kIGVtYWlsLCBlcnIgPSAke2Vycm9yU3RyaW5nfWAgKTtcbiAgICB9XG4gIH1cbn07Il0sIm5hbWVzIjpbImNvbnN0YW50cyIsInJlcXVpcmUiLCJ3aW5zdG9uIiwibm9kZW1haWxlciIsInRyYW5zcG9ydGVyIiwiQlVJTERfU0VSVkVSX0NPTkZJRyIsImVtYWlsVXNlcm5hbWUiLCJlbWFpbFBhc3N3b3JkIiwiZW1haWxUbyIsImNyZWF0ZVRyYW5zcG9ydCIsImF1dGgiLCJ1c2VyIiwicGFzcyIsImhvc3QiLCJlbWFpbFNlcnZlciIsInBvcnQiLCJ0bHMiLCJjaXBoZXJzIiwibG9nIiwibW9kdWxlIiwiZXhwb3J0cyIsInNlbmRFbWFpbCIsInN1YmplY3QiLCJ0ZXh0IiwiZW1haWxQYXJhbWV0ZXIiLCJlbWFpbFBhcmFtZXRlck9ubHkiLCJlbWFpbFJlc3VsdCIsInNlbmRNYWlsIiwiZnJvbSIsInRvIiwicmVwbGFjZSIsImluZm8iLCJtZXNzYWdlSWQiLCJyZXNwb25zZSIsImVyciIsImVycm9yU3RyaW5nIiwiSlNPTiIsInN0cmluZ2lmeSIsImVycm9yIl0sIm1hcHBpbmdzIjoiQUFBQSxpREFBaUQ7QUFDakQseURBQXlEOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFHekQsTUFBTUEsWUFBWUMsUUFBUztBQUMzQixNQUFNQyxVQUFVRCxRQUFTO0FBQ3pCLE1BQU1FLGFBQWFGLFFBQVM7QUFFNUIseUJBQXlCO0FBQ3pCLElBQUlHO0FBQ0osSUFBS0osVUFBVUssbUJBQW1CLENBQUNDLGFBQWEsSUFBSU4sVUFBVUssbUJBQW1CLENBQUNFLGFBQWEsSUFBSVAsVUFBVUssbUJBQW1CLENBQUNHLE9BQU8sRUFBRztJQUN6SUosY0FBY0QsV0FBV00sZUFBZSxDQUFFO1FBQ3hDQyxNQUFNO1lBQ0pDLE1BQU1YLFVBQVVLLG1CQUFtQixDQUFDQyxhQUFhO1lBQ2pETSxNQUFNWixVQUFVSyxtQkFBbUIsQ0FBQ0UsYUFBYTtRQUNuRDtRQUNBTSxNQUFNYixVQUFVSyxtQkFBbUIsQ0FBQ1MsV0FBVztRQUMvQ0MsTUFBTTtRQUNOQyxLQUFLO1lBQ0hDLFNBQVM7UUFDWDtJQUNGO0FBQ0YsT0FDSztJQUNIZixRQUFRZ0IsR0FBRyxDQUFFLFFBQVEsc0dBQ0E7QUFDdkI7QUFFQTs7Ozs7O0NBTUMsR0FDREMsT0FBT0MsT0FBTztRQUFrQkMsYUFBZixvQkFBQSxVQUEwQkMsT0FBTyxFQUFFQyxJQUFJLEVBQUVDLGNBQWMsRUFBRUMsa0JBQWtCO1FBQzFGLElBQUtyQixhQUFjO1lBQ2pCLElBQUlJLFVBQVVSLFVBQVVLLG1CQUFtQixDQUFDRyxPQUFPO1lBRW5ELElBQUtnQixnQkFBaUI7Z0JBQ3BCLElBQUtDLG9CQUFxQjtvQkFDeEJqQixVQUFVZ0I7Z0JBQ1osT0FDSztvQkFDSGhCLFdBQWEsQ0FBQyxFQUFFLEVBQUVnQixnQkFBZ0I7Z0JBQ3BDO1lBQ0Y7WUFFQSwyQ0FBMkM7WUFDM0MsSUFBS0Msc0JBQXNCLENBQUNELGdCQUFpQjtnQkFDM0M7WUFDRjtZQUVBLElBQUk7Z0JBQ0YsTUFBTUUsY0FBYyxNQUFNdEIsWUFBWXVCLFFBQVEsQ0FBRTtvQkFDOUNDLE1BQU0sQ0FBQyxhQUFhLEVBQUU1QixVQUFVSyxtQkFBbUIsQ0FBQ0MsYUFBYSxDQUFDLENBQUMsQ0FBQztvQkFDcEV1QixJQUFJckI7b0JBQ0pjLFNBQVNBO29CQUNUQyxNQUFNQSxLQUFLTyxPQUFPLENBQUUsY0FBYyxVQUFXLDRFQUE0RTtnQkFDM0g7Z0JBRUE1QixRQUFRNkIsSUFBSSxDQUFFLENBQUMsWUFBWSxFQUFFdkIsUUFBUSxFQUFFLEVBQUVjLFFBQVEsRUFBRSxFQUFFSSxZQUFZTSxTQUFTLENBQUMsRUFBRSxFQUFFTixZQUFZTyxRQUFRLEVBQUU7WUFDdkcsRUFDQSxPQUFPQyxLQUFNO2dCQUNYLElBQUlDLGNBQWMsT0FBT0QsUUFBUSxXQUFXQSxNQUFNRSxLQUFLQyxTQUFTLENBQUVIO2dCQUNsRUMsY0FBY0EsWUFBWUwsT0FBTyxDQUFFOUIsVUFBVUssbUJBQW1CLENBQUNFLGFBQWEsRUFBRTtnQkFDaEZMLFFBQVFvQyxLQUFLLENBQUUsQ0FBQywwQ0FBMEMsRUFBRUgsYUFBYTtZQUMzRTtRQUNGO0lBQ0Y7YUFsQ2dDZCxVQUFXQyxPQUFPLEVBQUVDLElBQUksRUFBRUMsY0FBYyxFQUFFQyxrQkFBa0I7ZUFBNURKOztXQUFBQSJ9