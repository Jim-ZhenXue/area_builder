/* eslint-disable */ /* @formatter:off */ import asyncLoader from '../../phet-core/js/asyncLoader.js';
import base64SoundToByteArray from '../../tambo/js/base64SoundToByteArray.js';
import WrappedAudioBuffer from '../../tambo/js/WrappedAudioBuffer.js';
import phetAudioContext from '../../tambo/js/phetAudioContext.js';
const soundURI = 'data:audio/mpeg;base64,//swxAAAByAnDnWRADEZkyy3M0ALJQcEAMk013znpOVkWGNCg9vD4oJlTQcNxQBIJ0PxSUlJSCwfB8Hz+CAIAN/DH/gg78EHS7//9QIJSLq/wFHg+AwFAAAAAAfFvo6+SmoCLgXFVlJaBRlrks8EfgdfwNGNDIX1icAtgSPunkTDV42yCf+OWMmXBP4hJ/+RAZg8nmowgLA3CbIw//syxAOACDxjRhnXgAEOCqVnuqAERLIypm8wTCMyMagDMoYEAyRAAgCAQ9za/ELra7bNcNI9BMVmPx3pF7P7a/wstMTOL6//gwrwjSeVKioAAkqgEBggJpjMDZgiPBm+0xy7jJ482ppET4kOhhSHhg8CKMhgGASP09uliMpAaC+Gyqiiyjd9/QiJjzxL//////p9lUBqv86UKJp6wP/7MsQEgAWgKTMsbMLwvwUmdaCI3g146KXMwJVAHDYhAjvxQKf+SIBJPJWbIrZ/1aVs/k7Lf2//7QQilFbJGkVBjWeEsADYyEamuw0dNdmGxS1qmJCrAKrGJZ+TX/V+1zX0fitWyROXKQQiijI22kTAod9keTOhUgChZfu1VSXOv2ubHdG+h4jXu2fLMV00rQvomqNH8kAAAARGFj3/+zLEGgDFrBkvoeWAcKKCYxBngBYhtAWgNUjlVDuFH+de4qlT5ENEZ7/8t7K3cKjB1Q/kmOcRTEFNRTMuOTkuNVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV//swxDMDwAABpAAAACAAADSAAAAEVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV';
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3RhbWJvL3NvdW5kcy9zdGVwRm9yd2FyZF9tcDMuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLyogZXNsaW50LWRpc2FibGUgKi9cbi8qIEBmb3JtYXR0ZXI6b2ZmICovXG5cbmltcG9ydCBhc3luY0xvYWRlciBmcm9tICcuLi8uLi9waGV0LWNvcmUvanMvYXN5bmNMb2FkZXIuanMnO1xuaW1wb3J0IGJhc2U2NFNvdW5kVG9CeXRlQXJyYXkgZnJvbSAnLi4vLi4vdGFtYm8vanMvYmFzZTY0U291bmRUb0J5dGVBcnJheS5qcyc7XG5pbXBvcnQgV3JhcHBlZEF1ZGlvQnVmZmVyIGZyb20gJy4uLy4uL3RhbWJvL2pzL1dyYXBwZWRBdWRpb0J1ZmZlci5qcyc7XG5pbXBvcnQgcGhldEF1ZGlvQ29udGV4dCBmcm9tICcuLi8uLi90YW1iby9qcy9waGV0QXVkaW9Db250ZXh0LmpzJztcblxuY29uc3Qgc291bmRVUkkgPSAnZGF0YTphdWRpby9tcGVnO2Jhc2U2NCwvL3N3eEFBQUJ5QW5EbldSQURFWmt5eTNNMEFMSlFjRUFNazAxM3pucE9Wa1dHTkNnOXZENG9KbFRRY054UUJJSjBQeFNVbEpTQ3dmQjhIeitDQUlBTi9ESC9nZzc4RUhTNy8vOVFJSlNMcS93RkhnK0F3RkFBQUFBQWZGdm82K1Ntb0NMZ1hGVmxKYUJSbHJrczhFZmdkZndOR05ESVgxaWNBdGdTUHVua1REVjQyeUNmK09XTW1YQlA0aEovK1JBWmc4bm1vd2dMQTNDYkl3Ly9zeXhBT0FDRHhqUmhuWGdBRU9DcVZudXFBRVJMSXlwbTh3VENNeU1hZ0RNb1lFQXlSQUFnQ0FROXphL0VMcmE3Yk5jTkk5Qk1WbVB4M3BGN1A3YS93c3RNVE9MNi8vZ3dyd2pTZVZLaW9BQWtxZ0VCZ2dKcGpNRFpnaVBCbSsweHk3ako0ODJwcEVUNGtPaGhTSGhnOENLTWhnR0FTUDA5dWxpTXBBYUMrR3lxaWl5amQ5L1FpSmp6eEwvLy8vLy9wOWxVQnF2ODZVS0pwNndQLzdNc1FFZ0FXZ0tUTXNiTUx3dndVbWRhQ0kzZzE0NktYTXdKVkFIRFloQWp2eFFLZitTSUJKUEpXYklyWi8xYVZzL2s3TGYyLy83UVFpbEZiSkdrVkJqV2VFc0FEWXlFYW11dzBkTmRtR3hTMXFtSkNyQUtyR0paK1RYL1YrMXpYMGZpdFd5Uk9YS1FRaWlqSTIya1RBb2Q5a2VUT2hVZ0NoWmZ1MVZTWE92MnViSGRHK2g0alh1MmZMTVYwMHJRdm9tcU5IOGtBQUFBUkdGajMvK3pMRUdnREZyQmt2b2VXQWNLS0NZeEJuZ0JZaHRBV2dOVWpsVkR1RkgrZGU0cWxUNUVORVo3Lzh0N0szY0tqQjFRL2ttT2NSVEVGTlJUTXVPVGt1TlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVi8vc3d4RE1Ed0FBQnBBQUFBQ0FBQURTQUFBQUVWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlYnO1xuY29uc3Qgc291bmRCeXRlQXJyYXkgPSBiYXNlNjRTb3VuZFRvQnl0ZUFycmF5KCBwaGV0QXVkaW9Db250ZXh0LCBzb3VuZFVSSSApO1xuY29uc3QgdW5sb2NrID0gYXN5bmNMb2FkZXIuY3JlYXRlTG9jayggc291bmRVUkkgKTtcbmNvbnN0IHdyYXBwZWRBdWRpb0J1ZmZlciA9IG5ldyBXcmFwcGVkQXVkaW9CdWZmZXIoKTtcblxuLy8gc2FmZSB3YXkgdG8gdW5sb2NrXG5sZXQgdW5sb2NrZWQgPSBmYWxzZTtcbmNvbnN0IHNhZmVVbmxvY2sgPSAoKSA9PiB7XG4gIGlmICggIXVubG9ja2VkICkge1xuICAgIHVubG9jaygpO1xuICAgIHVubG9ja2VkID0gdHJ1ZTtcbiAgfVxufTtcblxuY29uc3Qgb25EZWNvZGVTdWNjZXNzID0gZGVjb2RlZEF1ZGlvID0+IHtcbiAgaWYgKCB3cmFwcGVkQXVkaW9CdWZmZXIuYXVkaW9CdWZmZXJQcm9wZXJ0eS52YWx1ZSA9PT0gbnVsbCApIHtcbiAgICB3cmFwcGVkQXVkaW9CdWZmZXIuYXVkaW9CdWZmZXJQcm9wZXJ0eS5zZXQoIGRlY29kZWRBdWRpbyApO1xuICAgIHNhZmVVbmxvY2soKTtcbiAgfVxufTtcbmNvbnN0IG9uRGVjb2RlRXJyb3IgPSBkZWNvZGVFcnJvciA9PiB7XG4gIGNvbnNvbGUud2FybiggJ2RlY29kZSBvZiBhdWRpbyBkYXRhIGZhaWxlZCwgdXNpbmcgc3R1YmJlZCBzb3VuZCwgZXJyb3I6ICcgKyBkZWNvZGVFcnJvciApO1xuICB3cmFwcGVkQXVkaW9CdWZmZXIuYXVkaW9CdWZmZXJQcm9wZXJ0eS5zZXQoIHBoZXRBdWRpb0NvbnRleHQuY3JlYXRlQnVmZmVyKCAxLCAxLCBwaGV0QXVkaW9Db250ZXh0LnNhbXBsZVJhdGUgKSApO1xuICBzYWZlVW5sb2NrKCk7XG59O1xuY29uc3QgZGVjb2RlUHJvbWlzZSA9IHBoZXRBdWRpb0NvbnRleHQuZGVjb2RlQXVkaW9EYXRhKCBzb3VuZEJ5dGVBcnJheS5idWZmZXIsIG9uRGVjb2RlU3VjY2Vzcywgb25EZWNvZGVFcnJvciApO1xuaWYgKCBkZWNvZGVQcm9taXNlICkge1xuICBkZWNvZGVQcm9taXNlXG4gICAgLnRoZW4oIGRlY29kZWRBdWRpbyA9PiB7XG4gICAgICBpZiAoIHdyYXBwZWRBdWRpb0J1ZmZlci5hdWRpb0J1ZmZlclByb3BlcnR5LnZhbHVlID09PSBudWxsICkge1xuICAgICAgICB3cmFwcGVkQXVkaW9CdWZmZXIuYXVkaW9CdWZmZXJQcm9wZXJ0eS5zZXQoIGRlY29kZWRBdWRpbyApO1xuICAgICAgICBzYWZlVW5sb2NrKCk7XG4gICAgICB9XG4gICAgfSApXG4gICAgLmNhdGNoKCBlID0+IHtcbiAgICAgIGNvbnNvbGUud2FybiggJ3Byb21pc2UgcmVqZWN0aW9uIGNhdWdodCBmb3IgYXVkaW8gZGVjb2RlLCBlcnJvciA9ICcgKyBlICk7XG4gICAgICBzYWZlVW5sb2NrKCk7XG4gICAgfSApO1xufVxuZXhwb3J0IGRlZmF1bHQgd3JhcHBlZEF1ZGlvQnVmZmVyOyJdLCJuYW1lcyI6WyJhc3luY0xvYWRlciIsImJhc2U2NFNvdW5kVG9CeXRlQXJyYXkiLCJXcmFwcGVkQXVkaW9CdWZmZXIiLCJwaGV0QXVkaW9Db250ZXh0Iiwic291bmRVUkkiLCJzb3VuZEJ5dGVBcnJheSIsInVubG9jayIsImNyZWF0ZUxvY2siLCJ3cmFwcGVkQXVkaW9CdWZmZXIiLCJ1bmxvY2tlZCIsInNhZmVVbmxvY2siLCJvbkRlY29kZVN1Y2Nlc3MiLCJkZWNvZGVkQXVkaW8iLCJhdWRpb0J1ZmZlclByb3BlcnR5IiwidmFsdWUiLCJzZXQiLCJvbkRlY29kZUVycm9yIiwiZGVjb2RlRXJyb3IiLCJjb25zb2xlIiwid2FybiIsImNyZWF0ZUJ1ZmZlciIsInNhbXBsZVJhdGUiLCJkZWNvZGVQcm9taXNlIiwiZGVjb2RlQXVkaW9EYXRhIiwiYnVmZmVyIiwidGhlbiIsImNhdGNoIiwiZSJdLCJtYXBwaW5ncyI6IkFBQUEsa0JBQWtCLEdBQ2xCLGtCQUFrQixHQUVsQixPQUFPQSxpQkFBaUIsb0NBQW9DO0FBQzVELE9BQU9DLDRCQUE0QiwyQ0FBMkM7QUFDOUUsT0FBT0Msd0JBQXdCLHVDQUF1QztBQUN0RSxPQUFPQyxzQkFBc0IscUNBQXFDO0FBRWxFLE1BQU1DLFdBQVc7QUFDakIsTUFBTUMsaUJBQWlCSix1QkFBd0JFLGtCQUFrQkM7QUFDakUsTUFBTUUsU0FBU04sWUFBWU8sVUFBVSxDQUFFSDtBQUN2QyxNQUFNSSxxQkFBcUIsSUFBSU47QUFFL0IscUJBQXFCO0FBQ3JCLElBQUlPLFdBQVc7QUFDZixNQUFNQyxhQUFhO0lBQ2pCLElBQUssQ0FBQ0QsVUFBVztRQUNmSDtRQUNBRyxXQUFXO0lBQ2I7QUFDRjtBQUVBLE1BQU1FLGtCQUFrQkMsQ0FBQUE7SUFDdEIsSUFBS0osbUJBQW1CSyxtQkFBbUIsQ0FBQ0MsS0FBSyxLQUFLLE1BQU87UUFDM0ROLG1CQUFtQkssbUJBQW1CLENBQUNFLEdBQUcsQ0FBRUg7UUFDNUNGO0lBQ0Y7QUFDRjtBQUNBLE1BQU1NLGdCQUFnQkMsQ0FBQUE7SUFDcEJDLFFBQVFDLElBQUksQ0FBRSw4REFBOERGO0lBQzVFVCxtQkFBbUJLLG1CQUFtQixDQUFDRSxHQUFHLENBQUVaLGlCQUFpQmlCLFlBQVksQ0FBRSxHQUFHLEdBQUdqQixpQkFBaUJrQixVQUFVO0lBQzVHWDtBQUNGO0FBQ0EsTUFBTVksZ0JBQWdCbkIsaUJBQWlCb0IsZUFBZSxDQUFFbEIsZUFBZW1CLE1BQU0sRUFBRWIsaUJBQWlCSztBQUNoRyxJQUFLTSxlQUFnQjtJQUNuQkEsY0FDR0csSUFBSSxDQUFFYixDQUFBQTtRQUNMLElBQUtKLG1CQUFtQkssbUJBQW1CLENBQUNDLEtBQUssS0FBSyxNQUFPO1lBQzNETixtQkFBbUJLLG1CQUFtQixDQUFDRSxHQUFHLENBQUVIO1lBQzVDRjtRQUNGO0lBQ0YsR0FDQ2dCLEtBQUssQ0FBRUMsQ0FBQUE7UUFDTlQsUUFBUUMsSUFBSSxDQUFFLHdEQUF3RFE7UUFDdEVqQjtJQUNGO0FBQ0o7QUFDQSxlQUFlRixtQkFBbUIifQ==