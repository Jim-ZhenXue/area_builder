/* eslint-disable */ /* @formatter:off */ import asyncLoader from '../../phet-core/js/asyncLoader.js';
import base64SoundToByteArray from '../../tambo/js/base64SoundToByteArray.js';
import WrappedAudioBuffer from '../../tambo/js/WrappedAudioBuffer.js';
import phetAudioContext from '../../tambo/js/phetAudioContext.js';
const soundURI = 'data:audio/mpeg;base64,//swxAAAB5gnMzRhAAEHDWyDNLAAAAAaAQAu7tjAQAAABgMBgNNiBBAWD7ykMQf1g+D5/qBMHwfB/iAEPWCDv+o5wfPg+8EAQBMHz6gQB8Hwfsu2uWDrkw/a9xgUaMwFxxwCLsWS7MHN7VJki8fVT75eTqpn7/Xt1QxW//lJVbnfNuFRTzwrLn/5GVBnKMy/FVs5dTYABARKCMRm//syxAQACHBHWZ2kAAEJi+jxpg1Qlry2AYclVGyMwNoFJ29hqHqa1TRqRMCoetKstcqUzHBxQdCJmVcSJ/EQdEo0FXSoNLGkav/ljqPtEvjAoAE0zuEoM3lMJlLY3Uj65AMeMzQN6QWeLFdCcxLNFy4dBVXVfZ1L+gIki4KPQVBb4dERU6CrsFSoaLVHv/Ev9Hw4ANdAAG7VBBhVdP/7MsQFAAh8YybVowABG49vdx6AAm8ODBg8FDy9pmwIBsHPVGiPMueyERxZdIFnSpkzI8fezb+0z6OJVv7HHw7XBWdXwa6/y34l6sq7uitTjFTEgsFYrFQqFQDAGrQXMbpbb3ZGQWPWvTnyyeKKHgQ/nvlUf/u74oOHp/8v3R/dl/UcSXDz+kMBEHI0p5efiDJqb/64foFiBSWqB2r/+zLEA4AIVDlivZGAAQePKiWmDNhtwTYmBYyxnJdmZwmMtZ8ZjInEMMpo+VFWESqmhsWBoClhKKEhCW5UNPCsFVgqImyWS6KTAhEUrYoO7kaAWIJCwQzbgl5XrFBB27xoQwfnY6kozJtFz0SgICsWM3VIKWs6qr0tgI15/pQomHhblqjycRUCWe1dUOpxFOiJ/ooQC+IEEBlVdh0r//swxAUACGCjMy0kSsDoiCAA95gpQaBI041ceup5PSlsv5QNXMyixFLVkTXWpYUBYy/lEl4YCdWlLoZ//zGlKUBEhV0SiFT+us7WdBXqAbQ2hdxgDfH4RQsI+kgo2RnWVECiCa0TrUSNjalrUVVKyg0yapYqqVlRTNVLFf/2P/1qVadsTFKlitVMQU1FMy45OS4zVVVVVVVVVVVV';
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3RhbWJvL3NvdW5kcy9nZW5lcmFsQ2xvc2VfbXAzLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8qIGVzbGludC1kaXNhYmxlICovXG4vKiBAZm9ybWF0dGVyOm9mZiAqL1xuXG5pbXBvcnQgYXN5bmNMb2FkZXIgZnJvbSAnLi4vLi4vcGhldC1jb3JlL2pzL2FzeW5jTG9hZGVyLmpzJztcbmltcG9ydCBiYXNlNjRTb3VuZFRvQnl0ZUFycmF5IGZyb20gJy4uLy4uL3RhbWJvL2pzL2Jhc2U2NFNvdW5kVG9CeXRlQXJyYXkuanMnO1xuaW1wb3J0IFdyYXBwZWRBdWRpb0J1ZmZlciBmcm9tICcuLi8uLi90YW1iby9qcy9XcmFwcGVkQXVkaW9CdWZmZXIuanMnO1xuaW1wb3J0IHBoZXRBdWRpb0NvbnRleHQgZnJvbSAnLi4vLi4vdGFtYm8vanMvcGhldEF1ZGlvQ29udGV4dC5qcyc7XG5cbmNvbnN0IHNvdW5kVVJJID0gJ2RhdGE6YXVkaW8vbXBlZztiYXNlNjQsLy9zd3hBQUFCNWduTXpSaEFBRUhEV3lETkxBQUFBQWFBUUF1N3RqQVFBQUFCZ01CZ05OaUJCQVdEN3lrTVFmMWcrRDUvcUJNSHdmQi9pQUVQV0NEditvNXdmUGcrOEVBUUJNSHo2Z1FCOEh3ZnN1MnVXRHJrdy9hOXhnVWFNd0Z4eHdDTHNXUzdNSE43VkpraThmVlQ3NWVUcXBuNy9YdDFReFcvL2xKVmJuZk51RlJUendyTG4vNUdWQm5LTXkvRlZzNWRUWUFCQVJLQ01SbS8vc3l4QVFBQ0hCSFdaMmtBQUVKaStqeHBnMVFscnkyQVljbFZHeU13Tm9GSjI5aHFIcWExVFJxUk1Db2V0S3N0Y3FVekhCeFFkQ0ptVmNTSi9FUWRFbzBGWFNvTkxHa2F2L2xqcVB0RXZqQW9BRTB6dUVvTTNsTUpsTFkzVWo2NUFNZU16UU42UVdlTEZkQ2N4TE5GeTRkQlZYVmZaMUwrZ0lraTRLUFFWQmI0ZEVSVTZDcnNGU29hTFZIdi9FdjlIdzRBTmRBQUc3VkJCaFZkUC83TXNRRkFBaDhZeWJWb3dBQkc0OXZkeDZBQW04T0RCZzhGRHk5cG13SUJzSFBWR2lQTXVleUVSeFpkSUZuU3Brekk4ZmV6YiswejZPSlZ2N0hIdzdYQldkWHdhNi95MzRsNnNxN3VpdFRqRlRFZ3NGWXJGUXFGUURBR3JRWE1icGJiM1pHUVdQV3ZUbnl5ZUtLSGdRL252bFVmL3U3NG9PSHAvOHYzUi9kbC9VY1NYRHora01CRUhJMHA1ZWZpREpxYi82NGZvRmlCU1dxQjJyLyt6TEVBNEFJVkRsaXZaR0FBUWVQS2lXbUROaHR3VFltQll5eG5KZG1ad21NdFo4WmpJbkVNTXBvK1ZGV0VTcW1oc1dCb0NsaEtLRWhDVzVVTlBDc0ZWZ3FJbXlXUzZLVEFoRVVyWW9PN2thQVdJSkN3UXpiZ2w1WHJGQkIyN3hvUXdmblk2a296SnRGejBTZ0lDc1dNM1ZJS1dzNnFyMHRnSTE1L3BRb21IaGJscWp5Y1JVQ1dlMWRVT3B4Rk9pSi9vb1FDK0lFRUJsVmRoMHIvL3N3eEFVQUNHQ2pNeTBrU3NEb2lDQUE5NWdwUWFCSTA0MWNldXA1UFNsc3Y1UU5YTXlpeEZMVmtUWFdwWVVCWXkvbEVsNFlDZFdsTG9aLy96R2xLVUJFaFYwU2lGVCt1czdXZEJYcUFiUTJoZHhnRGZINFJRc0kra2dvMlJuV1ZFQ2lDYTBUclVTTmphbHJVVlZLeWcweWFwWXFxVmxSVE5WTEZmLzJQLzFxVmFkc1RGS2xpdFZNUVUxRk15NDVPUzR6VlZWVlZWVlZWVlZWJztcbmNvbnN0IHNvdW5kQnl0ZUFycmF5ID0gYmFzZTY0U291bmRUb0J5dGVBcnJheSggcGhldEF1ZGlvQ29udGV4dCwgc291bmRVUkkgKTtcbmNvbnN0IHVubG9jayA9IGFzeW5jTG9hZGVyLmNyZWF0ZUxvY2soIHNvdW5kVVJJICk7XG5jb25zdCB3cmFwcGVkQXVkaW9CdWZmZXIgPSBuZXcgV3JhcHBlZEF1ZGlvQnVmZmVyKCk7XG5cbi8vIHNhZmUgd2F5IHRvIHVubG9ja1xubGV0IHVubG9ja2VkID0gZmFsc2U7XG5jb25zdCBzYWZlVW5sb2NrID0gKCkgPT4ge1xuICBpZiAoICF1bmxvY2tlZCApIHtcbiAgICB1bmxvY2soKTtcbiAgICB1bmxvY2tlZCA9IHRydWU7XG4gIH1cbn07XG5cbmNvbnN0IG9uRGVjb2RlU3VjY2VzcyA9IGRlY29kZWRBdWRpbyA9PiB7XG4gIGlmICggd3JhcHBlZEF1ZGlvQnVmZmVyLmF1ZGlvQnVmZmVyUHJvcGVydHkudmFsdWUgPT09IG51bGwgKSB7XG4gICAgd3JhcHBlZEF1ZGlvQnVmZmVyLmF1ZGlvQnVmZmVyUHJvcGVydHkuc2V0KCBkZWNvZGVkQXVkaW8gKTtcbiAgICBzYWZlVW5sb2NrKCk7XG4gIH1cbn07XG5jb25zdCBvbkRlY29kZUVycm9yID0gZGVjb2RlRXJyb3IgPT4ge1xuICBjb25zb2xlLndhcm4oICdkZWNvZGUgb2YgYXVkaW8gZGF0YSBmYWlsZWQsIHVzaW5nIHN0dWJiZWQgc291bmQsIGVycm9yOiAnICsgZGVjb2RlRXJyb3IgKTtcbiAgd3JhcHBlZEF1ZGlvQnVmZmVyLmF1ZGlvQnVmZmVyUHJvcGVydHkuc2V0KCBwaGV0QXVkaW9Db250ZXh0LmNyZWF0ZUJ1ZmZlciggMSwgMSwgcGhldEF1ZGlvQ29udGV4dC5zYW1wbGVSYXRlICkgKTtcbiAgc2FmZVVubG9jaygpO1xufTtcbmNvbnN0IGRlY29kZVByb21pc2UgPSBwaGV0QXVkaW9Db250ZXh0LmRlY29kZUF1ZGlvRGF0YSggc291bmRCeXRlQXJyYXkuYnVmZmVyLCBvbkRlY29kZVN1Y2Nlc3MsIG9uRGVjb2RlRXJyb3IgKTtcbmlmICggZGVjb2RlUHJvbWlzZSApIHtcbiAgZGVjb2RlUHJvbWlzZVxuICAgIC50aGVuKCBkZWNvZGVkQXVkaW8gPT4ge1xuICAgICAgaWYgKCB3cmFwcGVkQXVkaW9CdWZmZXIuYXVkaW9CdWZmZXJQcm9wZXJ0eS52YWx1ZSA9PT0gbnVsbCApIHtcbiAgICAgICAgd3JhcHBlZEF1ZGlvQnVmZmVyLmF1ZGlvQnVmZmVyUHJvcGVydHkuc2V0KCBkZWNvZGVkQXVkaW8gKTtcbiAgICAgICAgc2FmZVVubG9jaygpO1xuICAgICAgfVxuICAgIH0gKVxuICAgIC5jYXRjaCggZSA9PiB7XG4gICAgICBjb25zb2xlLndhcm4oICdwcm9taXNlIHJlamVjdGlvbiBjYXVnaHQgZm9yIGF1ZGlvIGRlY29kZSwgZXJyb3IgPSAnICsgZSApO1xuICAgICAgc2FmZVVubG9jaygpO1xuICAgIH0gKTtcbn1cbmV4cG9ydCBkZWZhdWx0IHdyYXBwZWRBdWRpb0J1ZmZlcjsiXSwibmFtZXMiOlsiYXN5bmNMb2FkZXIiLCJiYXNlNjRTb3VuZFRvQnl0ZUFycmF5IiwiV3JhcHBlZEF1ZGlvQnVmZmVyIiwicGhldEF1ZGlvQ29udGV4dCIsInNvdW5kVVJJIiwic291bmRCeXRlQXJyYXkiLCJ1bmxvY2siLCJjcmVhdGVMb2NrIiwid3JhcHBlZEF1ZGlvQnVmZmVyIiwidW5sb2NrZWQiLCJzYWZlVW5sb2NrIiwib25EZWNvZGVTdWNjZXNzIiwiZGVjb2RlZEF1ZGlvIiwiYXVkaW9CdWZmZXJQcm9wZXJ0eSIsInZhbHVlIiwic2V0Iiwib25EZWNvZGVFcnJvciIsImRlY29kZUVycm9yIiwiY29uc29sZSIsIndhcm4iLCJjcmVhdGVCdWZmZXIiLCJzYW1wbGVSYXRlIiwiZGVjb2RlUHJvbWlzZSIsImRlY29kZUF1ZGlvRGF0YSIsImJ1ZmZlciIsInRoZW4iLCJjYXRjaCIsImUiXSwibWFwcGluZ3MiOiJBQUFBLGtCQUFrQixHQUNsQixrQkFBa0IsR0FFbEIsT0FBT0EsaUJBQWlCLG9DQUFvQztBQUM1RCxPQUFPQyw0QkFBNEIsMkNBQTJDO0FBQzlFLE9BQU9DLHdCQUF3Qix1Q0FBdUM7QUFDdEUsT0FBT0Msc0JBQXNCLHFDQUFxQztBQUVsRSxNQUFNQyxXQUFXO0FBQ2pCLE1BQU1DLGlCQUFpQkosdUJBQXdCRSxrQkFBa0JDO0FBQ2pFLE1BQU1FLFNBQVNOLFlBQVlPLFVBQVUsQ0FBRUg7QUFDdkMsTUFBTUkscUJBQXFCLElBQUlOO0FBRS9CLHFCQUFxQjtBQUNyQixJQUFJTyxXQUFXO0FBQ2YsTUFBTUMsYUFBYTtJQUNqQixJQUFLLENBQUNELFVBQVc7UUFDZkg7UUFDQUcsV0FBVztJQUNiO0FBQ0Y7QUFFQSxNQUFNRSxrQkFBa0JDLENBQUFBO0lBQ3RCLElBQUtKLG1CQUFtQkssbUJBQW1CLENBQUNDLEtBQUssS0FBSyxNQUFPO1FBQzNETixtQkFBbUJLLG1CQUFtQixDQUFDRSxHQUFHLENBQUVIO1FBQzVDRjtJQUNGO0FBQ0Y7QUFDQSxNQUFNTSxnQkFBZ0JDLENBQUFBO0lBQ3BCQyxRQUFRQyxJQUFJLENBQUUsOERBQThERjtJQUM1RVQsbUJBQW1CSyxtQkFBbUIsQ0FBQ0UsR0FBRyxDQUFFWixpQkFBaUJpQixZQUFZLENBQUUsR0FBRyxHQUFHakIsaUJBQWlCa0IsVUFBVTtJQUM1R1g7QUFDRjtBQUNBLE1BQU1ZLGdCQUFnQm5CLGlCQUFpQm9CLGVBQWUsQ0FBRWxCLGVBQWVtQixNQUFNLEVBQUViLGlCQUFpQks7QUFDaEcsSUFBS00sZUFBZ0I7SUFDbkJBLGNBQ0dHLElBQUksQ0FBRWIsQ0FBQUE7UUFDTCxJQUFLSixtQkFBbUJLLG1CQUFtQixDQUFDQyxLQUFLLEtBQUssTUFBTztZQUMzRE4sbUJBQW1CSyxtQkFBbUIsQ0FBQ0UsR0FBRyxDQUFFSDtZQUM1Q0Y7UUFDRjtJQUNGLEdBQ0NnQixLQUFLLENBQUVDLENBQUFBO1FBQ05ULFFBQVFDLElBQUksQ0FBRSx3REFBd0RRO1FBQ3RFakI7SUFDRjtBQUNKO0FBQ0EsZUFBZUYsbUJBQW1CIn0=