/* eslint-disable */ /* @formatter:off */ import asyncLoader from '../../phet-core/js/asyncLoader.js';
import base64SoundToByteArray from '../../tambo/js/base64SoundToByteArray.js';
import WrappedAudioBuffer from '../../tambo/js/WrappedAudioBuffer.js';
import phetAudioContext from '../../tambo/js/phetAudioContext.js';
const soundURI = 'data:audio/wav;base64,UklGRtQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YbAAAAAAAAAAAQD+/wIA/v8CAAAA/v8CAP7/AgD//wEA/v8BAAAA//8DAPz/AwD+/wAAAgD9/wQA/P8DAP3/AgAAAAAAAAAAAP7/AwD+/wEAAQD8/wUA+/8FAPv/BQD7/wUA/P8CAP//AQAAAP//AQD//wEAAAD//wEAAAD//wEA//8BAAAA//8BAP//AQD//wEA//8CAP3/AwD9/wMA/v8BAAAA//8CAP3/BAD7/wUA/P8DAA==';
const soundByteArray = base64SoundToByteArray(phetAudioContext, soundURI);
const unlock = asyncLoader.createLock(soundURI);
const wrappedAudioBuffer = new WrappedAudioBuffer();
// safe way to unlock
let unlocked = false;
const safeUnlock = ()=>{
    if (!unlocked) {
        unlock();
        unlocked = true;
    }
};
const onDecodeSuccess = (decodedAudio)=>{
    if (wrappedAudioBuffer.audioBufferProperty.value === null) {
        wrappedAudioBuffer.audioBufferProperty.set(decodedAudio);
        safeUnlock();
    }
};
const onDecodeError = (decodeError)=>{
    console.warn('decode of audio data failed, using stubbed sound, error: ' + decodeError);
    wrappedAudioBuffer.audioBufferProperty.set(phetAudioContext.createBuffer(1, 1, phetAudioContext.sampleRate));
    safeUnlock();
};
const decodePromise = phetAudioContext.decodeAudioData(soundByteArray.buffer, onDecodeSuccess, onDecodeError);
if (decodePromise) {
    decodePromise.then((decodedAudio)=>{
        if (wrappedAudioBuffer.audioBufferProperty.value === null) {
            wrappedAudioBuffer.audioBufferProperty.set(decodedAudio);
            safeUnlock();
        }
    }).catch((e)=>{
        console.warn('promise rejection caught for audio decode, error = ' + e);
        safeUnlock();
    });
}
export default wrappedAudioBuffer;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3RhbWJvL3NvdW5kcy9zaG9ydFNpbGVuY2Vfd2F2LmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8qIGVzbGludC1kaXNhYmxlICovXG4vKiBAZm9ybWF0dGVyOm9mZiAqL1xuXG5pbXBvcnQgYXN5bmNMb2FkZXIgZnJvbSAnLi4vLi4vcGhldC1jb3JlL2pzL2FzeW5jTG9hZGVyLmpzJztcbmltcG9ydCBiYXNlNjRTb3VuZFRvQnl0ZUFycmF5IGZyb20gJy4uLy4uL3RhbWJvL2pzL2Jhc2U2NFNvdW5kVG9CeXRlQXJyYXkuanMnO1xuaW1wb3J0IFdyYXBwZWRBdWRpb0J1ZmZlciBmcm9tICcuLi8uLi90YW1iby9qcy9XcmFwcGVkQXVkaW9CdWZmZXIuanMnO1xuaW1wb3J0IHBoZXRBdWRpb0NvbnRleHQgZnJvbSAnLi4vLi4vdGFtYm8vanMvcGhldEF1ZGlvQ29udGV4dC5qcyc7XG5cbmNvbnN0IHNvdW5kVVJJID0gJ2RhdGE6YXVkaW8vd2F2O2Jhc2U2NCxVa2xHUnRRQUFBQlhRVlpGWm0xMElCQUFBQUFCQUFFQVJLd0FBSWhZQVFBQ0FCQUFaR0YwWWJBQUFBQUFBQUFBQVFEKy93SUEvdjhDQUFBQS92OENBUDcvQWdELy93RUEvdjhCQUFBQS8vOERBUHovQXdEKy93QUFBZ0Q5L3dRQS9QOERBUDMvQWdBQUFBQUFBQUFBQVA3L0F3RCsvd0VBQVFEOC93VUErLzhGQVB2L0JRRDcvd1VBL1A4Q0FQLy9BUUFBQVAvL0FRRC8vd0VBQUFELy93RUFBQUQvL3dFQS8vOEJBQUFBLy84QkFQLy9BUUQvL3dFQS8vOENBUDMvQXdEOS93TUEvdjhCQUFBQS8vOENBUDMvQkFENy93VUEvUDhEQUE9PSc7XG5jb25zdCBzb3VuZEJ5dGVBcnJheSA9IGJhc2U2NFNvdW5kVG9CeXRlQXJyYXkoIHBoZXRBdWRpb0NvbnRleHQsIHNvdW5kVVJJICk7XG5jb25zdCB1bmxvY2sgPSBhc3luY0xvYWRlci5jcmVhdGVMb2NrKCBzb3VuZFVSSSApO1xuY29uc3Qgd3JhcHBlZEF1ZGlvQnVmZmVyID0gbmV3IFdyYXBwZWRBdWRpb0J1ZmZlcigpO1xuXG4vLyBzYWZlIHdheSB0byB1bmxvY2tcbmxldCB1bmxvY2tlZCA9IGZhbHNlO1xuY29uc3Qgc2FmZVVubG9jayA9ICgpID0+IHtcbiAgaWYgKCAhdW5sb2NrZWQgKSB7XG4gICAgdW5sb2NrKCk7XG4gICAgdW5sb2NrZWQgPSB0cnVlO1xuICB9XG59O1xuXG5jb25zdCBvbkRlY29kZVN1Y2Nlc3MgPSBkZWNvZGVkQXVkaW8gPT4ge1xuICBpZiAoIHdyYXBwZWRBdWRpb0J1ZmZlci5hdWRpb0J1ZmZlclByb3BlcnR5LnZhbHVlID09PSBudWxsICkge1xuICAgIHdyYXBwZWRBdWRpb0J1ZmZlci5hdWRpb0J1ZmZlclByb3BlcnR5LnNldCggZGVjb2RlZEF1ZGlvICk7XG4gICAgc2FmZVVubG9jaygpO1xuICB9XG59O1xuY29uc3Qgb25EZWNvZGVFcnJvciA9IGRlY29kZUVycm9yID0+IHtcbiAgY29uc29sZS53YXJuKCAnZGVjb2RlIG9mIGF1ZGlvIGRhdGEgZmFpbGVkLCB1c2luZyBzdHViYmVkIHNvdW5kLCBlcnJvcjogJyArIGRlY29kZUVycm9yICk7XG4gIHdyYXBwZWRBdWRpb0J1ZmZlci5hdWRpb0J1ZmZlclByb3BlcnR5LnNldCggcGhldEF1ZGlvQ29udGV4dC5jcmVhdGVCdWZmZXIoIDEsIDEsIHBoZXRBdWRpb0NvbnRleHQuc2FtcGxlUmF0ZSApICk7XG4gIHNhZmVVbmxvY2soKTtcbn07XG5jb25zdCBkZWNvZGVQcm9taXNlID0gcGhldEF1ZGlvQ29udGV4dC5kZWNvZGVBdWRpb0RhdGEoIHNvdW5kQnl0ZUFycmF5LmJ1ZmZlciwgb25EZWNvZGVTdWNjZXNzLCBvbkRlY29kZUVycm9yICk7XG5pZiAoIGRlY29kZVByb21pc2UgKSB7XG4gIGRlY29kZVByb21pc2VcbiAgICAudGhlbiggZGVjb2RlZEF1ZGlvID0+IHtcbiAgICAgIGlmICggd3JhcHBlZEF1ZGlvQnVmZmVyLmF1ZGlvQnVmZmVyUHJvcGVydHkudmFsdWUgPT09IG51bGwgKSB7XG4gICAgICAgIHdyYXBwZWRBdWRpb0J1ZmZlci5hdWRpb0J1ZmZlclByb3BlcnR5LnNldCggZGVjb2RlZEF1ZGlvICk7XG4gICAgICAgIHNhZmVVbmxvY2soKTtcbiAgICAgIH1cbiAgICB9IClcbiAgICAuY2F0Y2goIGUgPT4ge1xuICAgICAgY29uc29sZS53YXJuKCAncHJvbWlzZSByZWplY3Rpb24gY2F1Z2h0IGZvciBhdWRpbyBkZWNvZGUsIGVycm9yID0gJyArIGUgKTtcbiAgICAgIHNhZmVVbmxvY2soKTtcbiAgICB9ICk7XG59XG5leHBvcnQgZGVmYXVsdCB3cmFwcGVkQXVkaW9CdWZmZXI7Il0sIm5hbWVzIjpbImFzeW5jTG9hZGVyIiwiYmFzZTY0U291bmRUb0J5dGVBcnJheSIsIldyYXBwZWRBdWRpb0J1ZmZlciIsInBoZXRBdWRpb0NvbnRleHQiLCJzb3VuZFVSSSIsInNvdW5kQnl0ZUFycmF5IiwidW5sb2NrIiwiY3JlYXRlTG9jayIsIndyYXBwZWRBdWRpb0J1ZmZlciIsInVubG9ja2VkIiwic2FmZVVubG9jayIsIm9uRGVjb2RlU3VjY2VzcyIsImRlY29kZWRBdWRpbyIsImF1ZGlvQnVmZmVyUHJvcGVydHkiLCJ2YWx1ZSIsInNldCIsIm9uRGVjb2RlRXJyb3IiLCJkZWNvZGVFcnJvciIsImNvbnNvbGUiLCJ3YXJuIiwiY3JlYXRlQnVmZmVyIiwic2FtcGxlUmF0ZSIsImRlY29kZVByb21pc2UiLCJkZWNvZGVBdWRpb0RhdGEiLCJidWZmZXIiLCJ0aGVuIiwiY2F0Y2giLCJlIl0sIm1hcHBpbmdzIjoiQUFBQSxrQkFBa0IsR0FDbEIsa0JBQWtCLEdBRWxCLE9BQU9BLGlCQUFpQixvQ0FBb0M7QUFDNUQsT0FBT0MsNEJBQTRCLDJDQUEyQztBQUM5RSxPQUFPQyx3QkFBd0IsdUNBQXVDO0FBQ3RFLE9BQU9DLHNCQUFzQixxQ0FBcUM7QUFFbEUsTUFBTUMsV0FBVztBQUNqQixNQUFNQyxpQkFBaUJKLHVCQUF3QkUsa0JBQWtCQztBQUNqRSxNQUFNRSxTQUFTTixZQUFZTyxVQUFVLENBQUVIO0FBQ3ZDLE1BQU1JLHFCQUFxQixJQUFJTjtBQUUvQixxQkFBcUI7QUFDckIsSUFBSU8sV0FBVztBQUNmLE1BQU1DLGFBQWE7SUFDakIsSUFBSyxDQUFDRCxVQUFXO1FBQ2ZIO1FBQ0FHLFdBQVc7SUFDYjtBQUNGO0FBRUEsTUFBTUUsa0JBQWtCQyxDQUFBQTtJQUN0QixJQUFLSixtQkFBbUJLLG1CQUFtQixDQUFDQyxLQUFLLEtBQUssTUFBTztRQUMzRE4sbUJBQW1CSyxtQkFBbUIsQ0FBQ0UsR0FBRyxDQUFFSDtRQUM1Q0Y7SUFDRjtBQUNGO0FBQ0EsTUFBTU0sZ0JBQWdCQyxDQUFBQTtJQUNwQkMsUUFBUUMsSUFBSSxDQUFFLDhEQUE4REY7SUFDNUVULG1CQUFtQkssbUJBQW1CLENBQUNFLEdBQUcsQ0FBRVosaUJBQWlCaUIsWUFBWSxDQUFFLEdBQUcsR0FBR2pCLGlCQUFpQmtCLFVBQVU7SUFDNUdYO0FBQ0Y7QUFDQSxNQUFNWSxnQkFBZ0JuQixpQkFBaUJvQixlQUFlLENBQUVsQixlQUFlbUIsTUFBTSxFQUFFYixpQkFBaUJLO0FBQ2hHLElBQUtNLGVBQWdCO0lBQ25CQSxjQUNHRyxJQUFJLENBQUViLENBQUFBO1FBQ0wsSUFBS0osbUJBQW1CSyxtQkFBbUIsQ0FBQ0MsS0FBSyxLQUFLLE1BQU87WUFDM0ROLG1CQUFtQkssbUJBQW1CLENBQUNFLEdBQUcsQ0FBRUg7WUFDNUNGO1FBQ0Y7SUFDRixHQUNDZ0IsS0FBSyxDQUFFQyxDQUFBQTtRQUNOVCxRQUFRQyxJQUFJLENBQUUsd0RBQXdEUTtRQUN0RWpCO0lBQ0Y7QUFDSjtBQUNBLGVBQWVGLG1CQUFtQiJ9