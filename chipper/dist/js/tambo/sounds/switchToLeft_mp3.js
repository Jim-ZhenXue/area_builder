/* eslint-disable */ /* @formatter:off */ import asyncLoader from '../../phet-core/js/asyncLoader.js';
import base64SoundToByteArray from '../../tambo/js/base64SoundToByteArray.js';
import WrappedAudioBuffer from '../../tambo/js/WrappedAudioBuffer.js';
import phetAudioContext from '../../tambo/js/phetAudioContext.js';
const soundURI = 'data:audio/mpeg;base64,//swxAAAA8ADNZQRgDGHni23MIAC1bbaiNgdgM+wEHBiogUAbxA4MT+////gh//8Mf4YzNI0kYiNYjDZaLJCYAZZgbhKQTNx5Vp34WpSu/bhLvzLYwWSHokUhx0EBR4FA/Mp8sOz3gcWfL9YqH7kKIkzd9fLvSkB201St7337UyHKf7X9Pf//Ue9/6irjy/l3s5gqCo1lPVlVSBj//syxAOACFB7hZyUgDEUCu008ZpKfZq0pMq3UhCDwXYfD+n5X+IUp5YiEYMB0CgRCwfQF0AmAUjAlZVJuE4ZaTbKK0AIJCxUAwrWLf////l1oFP9Yo2m1QI89G8bsISUXc8TjPs5pDlVUzUq1VJLFYcIlvdQS0P1lohZFx5hFpVDCPaSKlRsdgIslDzfeqxt8iVd+v6aClA3ydRso//7MsQDgAhYV13sGEqhEJFpcZMJqE0gGS8ZU3ekWmMRbO4kqZnMgAHAFiPmBRdQFgRZHZrTNwZcRTYLKU4qxy3ieKohBwSNif5UwYc4W/ywiEYAtIWoggTByJ+YPcFxgdYE5MVlD41ZJSYBdPF8gQIZtZPy/cZWxBR5Bm7WwZdGkolTRTQXLpSOcoUvf3in/dyBZwzRXAF3ieJEAxD/+zLEBAAIkJlXlYaAARIWb3MegACpLHqwdgk0mfJ913UT0LiL5W+nIh+DsKATQJ4F0E4PF8c7FxaaaCZ80SpqZbfX7J/99fN0p/Onf+zSaVmKSAKAgKAgMAAAAAEBCVMt4sfsyRdHO3PTH0SBFi4jhEgNBinEXeeDSKeby9zBMKun3/pKZ6L//H/6T/p/82bkkAyj/5m7WOWuRFpI//swxAOACDgvi7zDADEQkW289AoWMABHxkZCUEwfjodDiYmpiWw9NWjIAhJEFkFSo4GnxwiDsrBoGn/g0DT64Kgq9BUFQWBo3WFDf4B//ljZRUwaFSyREkApYqDmkM8qYgtylZx9ZL7knEF4rFKLgqfa4GHahJbD5q+ZdeybNpd1LOzqJVWdmJgs9uNUoK61I9Pf1runDP5da2kA//syxAQACHita6eYTzEMFSdkzAigHGL2uEMDLL6xtFmUuujunUP9ODzjFKbt2J5yt77uOmiJWXQ6GAbIjvu17WVn/dDEccwhLJLW6dXU/dcsEAvP8BAST22Qg8WJEX2Cxxs84/BnOt15rGZwVs2FEtKWVPRHZitdbuySkumtHlb0M/U5QwcQRYSLI91T/epbUqPPogEGy4Ldq0ABj//7MsQEgAfcrTesFG1owIRiqMyYmD9U8MBcisSsURTFgBykNZkSUjL+oDB8VGCT310AYfb2ZlVRgEvbASNp8ptD8y7lYYlvxtFsCgAAYAQABAzjzrwIrmT2cuLIZOOOhHHQELC2rOtlix709VXnYiej4dx2rz2Vd/xL6QQAAHCikADAVHicCJrfesiRcXCNaoKuuneW+r1dXxFDvZf/+zLEEQBFcCEJoLHi8JuFVvDMGGz/vqeWI50KHuGnJHLWAAQIl4qgkpSn8oGq1rUCoSk3UAhEYtCgKWWwwIDo////4sLVTEFNRTMuOTkuNVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV';
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3RhbWJvL3NvdW5kcy9zd2l0Y2hUb0xlZnRfbXAzLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8qIGVzbGludC1kaXNhYmxlICovXG4vKiBAZm9ybWF0dGVyOm9mZiAqL1xuXG5pbXBvcnQgYXN5bmNMb2FkZXIgZnJvbSAnLi4vLi4vcGhldC1jb3JlL2pzL2FzeW5jTG9hZGVyLmpzJztcbmltcG9ydCBiYXNlNjRTb3VuZFRvQnl0ZUFycmF5IGZyb20gJy4uLy4uL3RhbWJvL2pzL2Jhc2U2NFNvdW5kVG9CeXRlQXJyYXkuanMnO1xuaW1wb3J0IFdyYXBwZWRBdWRpb0J1ZmZlciBmcm9tICcuLi8uLi90YW1iby9qcy9XcmFwcGVkQXVkaW9CdWZmZXIuanMnO1xuaW1wb3J0IHBoZXRBdWRpb0NvbnRleHQgZnJvbSAnLi4vLi4vdGFtYm8vanMvcGhldEF1ZGlvQ29udGV4dC5qcyc7XG5cbmNvbnN0IHNvdW5kVVJJID0gJ2RhdGE6YXVkaW8vbXBlZztiYXNlNjQsLy9zd3hBQUFBOEFETlpRUmdER0huaTIzTUlBQzFiYmFpTmdkZ00rd0VIQmlvZ1VBYnhBNE1UKy8vLy9naC8vOE1mNFl6Tkkwa1lpTllqRFphTEpDWUFaWmdiaEtRVE54NVZwMzRXcFN1L2JoTHZ6TFl3V1NIb2tVaHgwRUJSNEZBL01wOHNPejNnY1dmTDlZcUg3a0tJa3pkOWZMdlNrQjIwMVN0NzMzN1V5SEtmN1g5UGYvL1VlOS82aXJqeS9sM3M1Z3FDbzFsUFZsVlNCai8vc3l4QU9BQ0ZCN2haeVVnREVVQ3UwMDhacEtmWnEwcE1xM1VoQ0R3WFlmRCtuNVgrSVVwNVlpRVlNQjBDZ1JDd2ZRRjBBbUFVakFsWlZKdUU0WmFUYktLMEFJSkN4VUF3cldMZi8vLy9sMW9GUDlZbzJtMVFJODlHOGJzSVNVWGM4VGpQczVwRGxWVXpVcTFWSkxGWWNJbHZkUVMwUDFsb2haRng1aEZwVkRDUGFTS2xSc2RnSXNsRHpmZXF4dDhpVmQrdjZhQ2xBM3lkUnNvLy83TXNRRGdBaFlWMTNzR0VxaEVKRnBjWk1KcUUwZ0dTOFpVM2VrV21NUmJPNGtxWm5NZ0FIQUZpUG1CUmRRRmdSWkhaclROd1pjUlRZTEtVNHF4eTNpZUtvaEJ3U05pZjVVd1ljNFcveXdpRVlBdElXb2dnVEJ5SitZUGNGeGdkWUU1TVZsRDQxWkpTWUJkUEY4Z1FJWnRaUHkvY1pXeEJSNUJtN1d3WmRHa29sVFJUUVhMcFNPY29VdmYzaW4vZHlCWnd6UlhBRjNpZUpFQXhELyt6TEVCQUFJa0psWGxZYUFBUklXYjNNZWdBQ3BMSHF3ZGdrMG1mSjkxM1VUMExpTDVXK25JaCtEc0tBVFFKNEYwRTRQRjhjN0Z4YWFhQ1o4MFNwcVpiZlg3Si85OWZOMHAvT25mK3pTYVZtS1NBS0FnS0FnTUFBQUFBRUJDVk10NHNmc3lSZEhPM1BUSDBTQkZpNGpoRWdOQmluRVhlZURTS2VieTl6Qk1LdW4zL3BLWjZMLy9ILzZUL3AvODJia2tBeWovNW03V09XdVJGcEkvL3N3eEFPQUNEZ3ZpN3pEQURFUWtXMjg5QW9XTUFCSHhrWkNVRXdmam9kRGlZbXBpV3c5TldqSUFoSkVGa0ZTbzRHbnh3aURzckJvR24vZzBEVDY0S2dxOUJVRlFXQm8zV0ZEZjRCLy9salpSVXdhRlN5UkVrQXBZcURta004cVlndHlsWng5Wkw3a25FRjRyRktMZ3FmYTRHSGFoSmJENXErWmRleWJOcGQxTE96cUpWV2RtSmdzOXVOVW9LNjFJOVBmMXJ1bkRQNWRhMmtBLy9zeXhBUUFDSGl0YTZlWVR6RU1GU2RrekFpZ0hHTDJ1RU1ETEw2eHRGbVV1dWp1blVQOU9EempGS2J0Mko1eXQ3N3VPbWlKV1hRNkdBYklqdnUxN1dWbi9kREVjY3doTEpMVzZkWFUvZGNzRUF2UDhCQVNUMjJRZzhXSkVYMkN4eHM4NC9Cbk90MTVyR1p3VnMyRkV0S1dWUFJIWml0ZGJ1eVNrdW10SGxiME0vVTVRd2NRUllTTEk5MVQvZXBiVXFQUG9nRUd5NExkcTBBQmovLzdNc1FFZ0FmY3JUZXNGRzFvd0lSaXFNeVltRDlVOE1CY2lzU3NVUlRGZ0J5a05aa1NVakwrb0RCOFZHQ1QzMTBBWWZiMlpsVlJnRXZiQVNOcDhwdEQ4eTdsWVlsdnh0RnNDZ0FBWUFRQUJBemp6cndJcm1UMmN1TElaT09PaEhIUUVMQzJyT3RsaXg3MDlWWG5ZaWVqNGR4MnJ6MlZkL3hMNlFRQUFIQ2lrQURBVkhpY0NKcmZlc2lSY1hDTmFvS3V1bmVXK3IxZFh4RkR2WmYvK3pMRUVRQkZjQ0VKb0xIaThKdUZWdkRNR0d6L3ZxZVdJNTBLSHVHbkpITFdBQVFJbDRxZ2twU244b0dxMXJVQ29TazNVQWhFWXRDZ0tXV3d3SURvLy8vLzRzTFZURUZOUlRNdU9Ua3VOVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVic7XG5jb25zdCBzb3VuZEJ5dGVBcnJheSA9IGJhc2U2NFNvdW5kVG9CeXRlQXJyYXkoIHBoZXRBdWRpb0NvbnRleHQsIHNvdW5kVVJJICk7XG5jb25zdCB1bmxvY2sgPSBhc3luY0xvYWRlci5jcmVhdGVMb2NrKCBzb3VuZFVSSSApO1xuY29uc3Qgd3JhcHBlZEF1ZGlvQnVmZmVyID0gbmV3IFdyYXBwZWRBdWRpb0J1ZmZlcigpO1xuXG4vLyBzYWZlIHdheSB0byB1bmxvY2tcbmxldCB1bmxvY2tlZCA9IGZhbHNlO1xuY29uc3Qgc2FmZVVubG9jayA9ICgpID0+IHtcbiAgaWYgKCAhdW5sb2NrZWQgKSB7XG4gICAgdW5sb2NrKCk7XG4gICAgdW5sb2NrZWQgPSB0cnVlO1xuICB9XG59O1xuXG5jb25zdCBvbkRlY29kZVN1Y2Nlc3MgPSBkZWNvZGVkQXVkaW8gPT4ge1xuICBpZiAoIHdyYXBwZWRBdWRpb0J1ZmZlci5hdWRpb0J1ZmZlclByb3BlcnR5LnZhbHVlID09PSBudWxsICkge1xuICAgIHdyYXBwZWRBdWRpb0J1ZmZlci5hdWRpb0J1ZmZlclByb3BlcnR5LnNldCggZGVjb2RlZEF1ZGlvICk7XG4gICAgc2FmZVVubG9jaygpO1xuICB9XG59O1xuY29uc3Qgb25EZWNvZGVFcnJvciA9IGRlY29kZUVycm9yID0+IHtcbiAgY29uc29sZS53YXJuKCAnZGVjb2RlIG9mIGF1ZGlvIGRhdGEgZmFpbGVkLCB1c2luZyBzdHViYmVkIHNvdW5kLCBlcnJvcjogJyArIGRlY29kZUVycm9yICk7XG4gIHdyYXBwZWRBdWRpb0J1ZmZlci5hdWRpb0J1ZmZlclByb3BlcnR5LnNldCggcGhldEF1ZGlvQ29udGV4dC5jcmVhdGVCdWZmZXIoIDEsIDEsIHBoZXRBdWRpb0NvbnRleHQuc2FtcGxlUmF0ZSApICk7XG4gIHNhZmVVbmxvY2soKTtcbn07XG5jb25zdCBkZWNvZGVQcm9taXNlID0gcGhldEF1ZGlvQ29udGV4dC5kZWNvZGVBdWRpb0RhdGEoIHNvdW5kQnl0ZUFycmF5LmJ1ZmZlciwgb25EZWNvZGVTdWNjZXNzLCBvbkRlY29kZUVycm9yICk7XG5pZiAoIGRlY29kZVByb21pc2UgKSB7XG4gIGRlY29kZVByb21pc2VcbiAgICAudGhlbiggZGVjb2RlZEF1ZGlvID0+IHtcbiAgICAgIGlmICggd3JhcHBlZEF1ZGlvQnVmZmVyLmF1ZGlvQnVmZmVyUHJvcGVydHkudmFsdWUgPT09IG51bGwgKSB7XG4gICAgICAgIHdyYXBwZWRBdWRpb0J1ZmZlci5hdWRpb0J1ZmZlclByb3BlcnR5LnNldCggZGVjb2RlZEF1ZGlvICk7XG4gICAgICAgIHNhZmVVbmxvY2soKTtcbiAgICAgIH1cbiAgICB9IClcbiAgICAuY2F0Y2goIGUgPT4ge1xuICAgICAgY29uc29sZS53YXJuKCAncHJvbWlzZSByZWplY3Rpb24gY2F1Z2h0IGZvciBhdWRpbyBkZWNvZGUsIGVycm9yID0gJyArIGUgKTtcbiAgICAgIHNhZmVVbmxvY2soKTtcbiAgICB9ICk7XG59XG5leHBvcnQgZGVmYXVsdCB3cmFwcGVkQXVkaW9CdWZmZXI7Il0sIm5hbWVzIjpbImFzeW5jTG9hZGVyIiwiYmFzZTY0U291bmRUb0J5dGVBcnJheSIsIldyYXBwZWRBdWRpb0J1ZmZlciIsInBoZXRBdWRpb0NvbnRleHQiLCJzb3VuZFVSSSIsInNvdW5kQnl0ZUFycmF5IiwidW5sb2NrIiwiY3JlYXRlTG9jayIsIndyYXBwZWRBdWRpb0J1ZmZlciIsInVubG9ja2VkIiwic2FmZVVubG9jayIsIm9uRGVjb2RlU3VjY2VzcyIsImRlY29kZWRBdWRpbyIsImF1ZGlvQnVmZmVyUHJvcGVydHkiLCJ2YWx1ZSIsInNldCIsIm9uRGVjb2RlRXJyb3IiLCJkZWNvZGVFcnJvciIsImNvbnNvbGUiLCJ3YXJuIiwiY3JlYXRlQnVmZmVyIiwic2FtcGxlUmF0ZSIsImRlY29kZVByb21pc2UiLCJkZWNvZGVBdWRpb0RhdGEiLCJidWZmZXIiLCJ0aGVuIiwiY2F0Y2giLCJlIl0sIm1hcHBpbmdzIjoiQUFBQSxrQkFBa0IsR0FDbEIsa0JBQWtCLEdBRWxCLE9BQU9BLGlCQUFpQixvQ0FBb0M7QUFDNUQsT0FBT0MsNEJBQTRCLDJDQUEyQztBQUM5RSxPQUFPQyx3QkFBd0IsdUNBQXVDO0FBQ3RFLE9BQU9DLHNCQUFzQixxQ0FBcUM7QUFFbEUsTUFBTUMsV0FBVztBQUNqQixNQUFNQyxpQkFBaUJKLHVCQUF3QkUsa0JBQWtCQztBQUNqRSxNQUFNRSxTQUFTTixZQUFZTyxVQUFVLENBQUVIO0FBQ3ZDLE1BQU1JLHFCQUFxQixJQUFJTjtBQUUvQixxQkFBcUI7QUFDckIsSUFBSU8sV0FBVztBQUNmLE1BQU1DLGFBQWE7SUFDakIsSUFBSyxDQUFDRCxVQUFXO1FBQ2ZIO1FBQ0FHLFdBQVc7SUFDYjtBQUNGO0FBRUEsTUFBTUUsa0JBQWtCQyxDQUFBQTtJQUN0QixJQUFLSixtQkFBbUJLLG1CQUFtQixDQUFDQyxLQUFLLEtBQUssTUFBTztRQUMzRE4sbUJBQW1CSyxtQkFBbUIsQ0FBQ0UsR0FBRyxDQUFFSDtRQUM1Q0Y7SUFDRjtBQUNGO0FBQ0EsTUFBTU0sZ0JBQWdCQyxDQUFBQTtJQUNwQkMsUUFBUUMsSUFBSSxDQUFFLDhEQUE4REY7SUFDNUVULG1CQUFtQkssbUJBQW1CLENBQUNFLEdBQUcsQ0FBRVosaUJBQWlCaUIsWUFBWSxDQUFFLEdBQUcsR0FBR2pCLGlCQUFpQmtCLFVBQVU7SUFDNUdYO0FBQ0Y7QUFDQSxNQUFNWSxnQkFBZ0JuQixpQkFBaUJvQixlQUFlLENBQUVsQixlQUFlbUIsTUFBTSxFQUFFYixpQkFBaUJLO0FBQ2hHLElBQUtNLGVBQWdCO0lBQ25CQSxjQUNHRyxJQUFJLENBQUViLENBQUFBO1FBQ0wsSUFBS0osbUJBQW1CSyxtQkFBbUIsQ0FBQ0MsS0FBSyxLQUFLLE1BQU87WUFDM0ROLG1CQUFtQkssbUJBQW1CLENBQUNFLEdBQUcsQ0FBRUg7WUFDNUNGO1FBQ0Y7SUFDRixHQUNDZ0IsS0FBSyxDQUFFQyxDQUFBQTtRQUNOVCxRQUFRQyxJQUFJLENBQUUsd0RBQXdEUTtRQUN0RWpCO0lBQ0Y7QUFDSjtBQUNBLGVBQWVGLG1CQUFtQiJ9