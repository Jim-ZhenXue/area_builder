/* eslint-disable */
/* @formatter:off */

import asyncLoader from '../../phet-core/js/asyncLoader.js';
import base64SoundToByteArray from '../../tambo/js/base64SoundToByteArray.js';
import WrappedAudioBuffer from '../../tambo/js/WrappedAudioBuffer.js';
import phetAudioContext from '../../tambo/js/phetAudioContext.js';

const soundURI = 'data:audio/mpeg;base64,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';
const soundByteArray = base64SoundToByteArray( phetAudioContext, soundURI );
const unlock = asyncLoader.createLock( soundURI );
const wrappedAudioBuffer = new WrappedAudioBuffer();

// safe way to unlock
let unlocked = false;
const safeUnlock = () => {
  if ( !unlocked ) {
    unlock();
    unlocked = true;
  }
};

const onDecodeSuccess = decodedAudio => {
  if ( wrappedAudioBuffer.audioBufferProperty.value === null ) {
    wrappedAudioBuffer.audioBufferProperty.set( decodedAudio );
    safeUnlock();
  }
};
const onDecodeError = decodeError => {
  console.warn( 'decode of audio data failed, using stubbed sound, error: ' + decodeError );
  wrappedAudioBuffer.audioBufferProperty.set( phetAudioContext.createBuffer( 1, 1, phetAudioContext.sampleRate ) );
  safeUnlock();
};
const decodePromise = phetAudioContext.decodeAudioData( soundByteArray.buffer, onDecodeSuccess, onDecodeError );
if ( decodePromise ) {
  decodePromise
    .then( decodedAudio => {
      if ( wrappedAudioBuffer.audioBufferProperty.value === null ) {
        wrappedAudioBuffer.audioBufferProperty.set( decodedAudio );
        safeUnlock();
      }
    } )
    .catch( e => {
      console.warn( 'promise rejection caught for audio decode, error = ' + e );
      safeUnlock();
    } );
}
export default wrappedAudioBuffer;