// Copyright 2021-2024, University of Colorado Boulder
/**
 * Singleton that can save and load a Property's value to localStorage, and keep it in sync for the next runtime.
 * Must be used with ?preferencesStorage.
 *
 * NOTE: Property values are stringified, so don't try using this with something like `new StringProperty( 'true' )`
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */ import joist from '../joist.js';
let preferencesStorage = null;
const PREFERENCES_KEY = 'PREFERENCES:';
let PreferencesStorage = class PreferencesStorage {
    registerToLocalStorage(property, name) {
        const key = `${PREFERENCES_KEY}${name}`;
        if (window.localStorage.getItem(key)) {
            property.value = JSON.parse(window.localStorage.getItem(key));
        }
        property.link((value)=>{
            window.localStorage.setItem(key, JSON.stringify(value));
        });
        this.registedProperties.push(property);
    }
    static register(property, name) {
        if (!phet.chipper.queryParameters.preferencesStorage) {
            return property;
        }
        if (!preferencesStorage) {
            preferencesStorage = new PreferencesStorage();
        }
        if (preferencesStorage.enabled) {
            preferencesStorage.registerToLocalStorage(property, name);
        }
        return property;
    }
    constructor(){
        this.enabled = true;
        // for debugging
        this.registedProperties = [];
        try {
            // Always store the line indices just in case they want to be used by the next run.
            window.localStorage.setItem('test', 'test');
        } catch (e) {
            this.enabled = false; // can't use localStorage with browser settings
            if (e instanceof Error) {
                const safari = window.navigator.userAgent.includes('Safari') && !window.navigator.userAgent.includes('Chrome');
                if (safari && e.message.includes('QuotaExceededError')) {
                    console.log('It looks like you are browsing with private mode in Safari. ' + 'Please turn that setting off if you want to use PreferencesStorage');
                } else {
                    throw e;
                }
            }
        }
    }
};
joist.register('PreferencesStorage', PreferencesStorage);
export default PreferencesStorage;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL2pvaXN0L2pzL3ByZWZlcmVuY2VzL1ByZWZlcmVuY2VzU3RvcmFnZS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAyMS0yMDI0LCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuLyoqXG4gKiBTaW5nbGV0b24gdGhhdCBjYW4gc2F2ZSBhbmQgbG9hZCBhIFByb3BlcnR5J3MgdmFsdWUgdG8gbG9jYWxTdG9yYWdlLCBhbmQga2VlcCBpdCBpbiBzeW5jIGZvciB0aGUgbmV4dCBydW50aW1lLlxuICogTXVzdCBiZSB1c2VkIHdpdGggP3ByZWZlcmVuY2VzU3RvcmFnZS5cbiAqXG4gKiBOT1RFOiBQcm9wZXJ0eSB2YWx1ZXMgYXJlIHN0cmluZ2lmaWVkLCBzbyBkb24ndCB0cnkgdXNpbmcgdGhpcyB3aXRoIHNvbWV0aGluZyBsaWtlIGBuZXcgU3RyaW5nUHJvcGVydHkoICd0cnVlJyApYFxuICpcbiAqIEBhdXRob3IgTWljaGFlbCBLYXV6bWFubiAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcbiAqL1xuXG5pbXBvcnQgVFByb3BlcnR5IGZyb20gJy4uLy4uLy4uL2F4b24vanMvVFByb3BlcnR5LmpzJztcbmltcG9ydCBJbnRlbnRpb25hbEFueSBmcm9tICcuLi8uLi8uLi9waGV0LWNvcmUvanMvdHlwZXMvSW50ZW50aW9uYWxBbnkuanMnO1xuaW1wb3J0IGpvaXN0IGZyb20gJy4uL2pvaXN0LmpzJztcblxubGV0IHByZWZlcmVuY2VzU3RvcmFnZTogUHJlZmVyZW5jZXNTdG9yYWdlIHwgbnVsbCA9IG51bGw7XG5cbmNvbnN0IFBSRUZFUkVOQ0VTX0tFWSA9ICdQUkVGRVJFTkNFUzonO1xuXG5jbGFzcyBQcmVmZXJlbmNlc1N0b3JhZ2Uge1xuXG4gIHByaXZhdGUgZW5hYmxlZCA9IHRydWU7XG5cbiAgLy8gZm9yIGRlYnVnZ2luZ1xuICBwcml2YXRlIHJlYWRvbmx5IHJlZ2lzdGVkUHJvcGVydGllczogVFByb3BlcnR5PHVua25vd24+W10gPSBbXTtcblxuICBwdWJsaWMgY29uc3RydWN0b3IoKSB7XG5cbiAgICB0cnkge1xuXG4gICAgICAvLyBBbHdheXMgc3RvcmUgdGhlIGxpbmUgaW5kaWNlcyBqdXN0IGluIGNhc2UgdGhleSB3YW50IHRvIGJlIHVzZWQgYnkgdGhlIG5leHQgcnVuLlxuICAgICAgd2luZG93LmxvY2FsU3RvcmFnZS5zZXRJdGVtKCAndGVzdCcsICd0ZXN0JyApO1xuICAgIH1cbiAgICBjYXRjaCggZSApIHtcbiAgICAgIHRoaXMuZW5hYmxlZCA9IGZhbHNlOyAvLyBjYW4ndCB1c2UgbG9jYWxTdG9yYWdlIHdpdGggYnJvd3NlciBzZXR0aW5nc1xuXG4gICAgICBpZiAoIGUgaW5zdGFuY2VvZiBFcnJvciApIHtcbiAgICAgICAgY29uc3Qgc2FmYXJpID0gd2luZG93Lm5hdmlnYXRvci51c2VyQWdlbnQuaW5jbHVkZXMoICdTYWZhcmknICkgJiYgIXdpbmRvdy5uYXZpZ2F0b3IudXNlckFnZW50LmluY2x1ZGVzKCAnQ2hyb21lJyApO1xuXG4gICAgICAgIGlmICggc2FmYXJpICYmIGUubWVzc2FnZS5pbmNsdWRlcyggJ1F1b3RhRXhjZWVkZWRFcnJvcicgKSApIHtcbiAgICAgICAgICBjb25zb2xlLmxvZyggJ0l0IGxvb2tzIGxpa2UgeW91IGFyZSBicm93c2luZyB3aXRoIHByaXZhdGUgbW9kZSBpbiBTYWZhcmkuICcgK1xuICAgICAgICAgICAgICAgICAgICAgICAnUGxlYXNlIHR1cm4gdGhhdCBzZXR0aW5nIG9mZiBpZiB5b3Ugd2FudCB0byB1c2UgUHJlZmVyZW5jZXNTdG9yYWdlJyApO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgIHRocm93IGU7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBwcml2YXRlIHJlZ2lzdGVyVG9Mb2NhbFN0b3JhZ2UoIHByb3BlcnR5OiBUUHJvcGVydHk8dW5rbm93bj4sIG5hbWU6IHN0cmluZyApOiB2b2lkIHtcbiAgICBjb25zdCBrZXkgPSBgJHtQUkVGRVJFTkNFU19LRVl9JHtuYW1lfWA7XG4gICAgaWYgKCB3aW5kb3cubG9jYWxTdG9yYWdlLmdldEl0ZW0oIGtleSApICkge1xuICAgICAgcHJvcGVydHkudmFsdWUgPSBKU09OLnBhcnNlKCB3aW5kb3cubG9jYWxTdG9yYWdlLmdldEl0ZW0oIGtleSApISApO1xuICAgIH1cbiAgICBwcm9wZXJ0eS5saW5rKCAoIHZhbHVlOiBJbnRlbnRpb25hbEFueSApID0+IHtcbiAgICAgIHdpbmRvdy5sb2NhbFN0b3JhZ2Uuc2V0SXRlbSgga2V5LCBKU09OLnN0cmluZ2lmeSggdmFsdWUgKSApO1xuICAgIH0gKTtcbiAgICB0aGlzLnJlZ2lzdGVkUHJvcGVydGllcy5wdXNoKCBwcm9wZXJ0eSApO1xuICB9XG5cbiAgcHVibGljIHN0YXRpYyByZWdpc3RlciggcHJvcGVydHk6IFRQcm9wZXJ0eTx1bmtub3duPiwgbmFtZTogc3RyaW5nICk6IFRQcm9wZXJ0eTx1bmtub3duPiB7XG4gICAgaWYgKCAhcGhldC5jaGlwcGVyLnF1ZXJ5UGFyYW1ldGVycy5wcmVmZXJlbmNlc1N0b3JhZ2UgKSB7XG4gICAgICByZXR1cm4gcHJvcGVydHk7XG4gICAgfVxuXG4gICAgaWYgKCAhcHJlZmVyZW5jZXNTdG9yYWdlICkge1xuICAgICAgcHJlZmVyZW5jZXNTdG9yYWdlID0gbmV3IFByZWZlcmVuY2VzU3RvcmFnZSgpO1xuICAgIH1cblxuICAgIGlmICggcHJlZmVyZW5jZXNTdG9yYWdlLmVuYWJsZWQgKSB7XG4gICAgICBwcmVmZXJlbmNlc1N0b3JhZ2UucmVnaXN0ZXJUb0xvY2FsU3RvcmFnZSggcHJvcGVydHksIG5hbWUgKTtcbiAgICB9XG5cbiAgICByZXR1cm4gcHJvcGVydHk7XG4gIH1cbn1cblxuam9pc3QucmVnaXN0ZXIoICdQcmVmZXJlbmNlc1N0b3JhZ2UnLCBQcmVmZXJlbmNlc1N0b3JhZ2UgKTtcbmV4cG9ydCBkZWZhdWx0IFByZWZlcmVuY2VzU3RvcmFnZTsiXSwibmFtZXMiOlsiam9pc3QiLCJwcmVmZXJlbmNlc1N0b3JhZ2UiLCJQUkVGRVJFTkNFU19LRVkiLCJQcmVmZXJlbmNlc1N0b3JhZ2UiLCJyZWdpc3RlclRvTG9jYWxTdG9yYWdlIiwicHJvcGVydHkiLCJuYW1lIiwia2V5Iiwid2luZG93IiwibG9jYWxTdG9yYWdlIiwiZ2V0SXRlbSIsInZhbHVlIiwiSlNPTiIsInBhcnNlIiwibGluayIsInNldEl0ZW0iLCJzdHJpbmdpZnkiLCJyZWdpc3RlZFByb3BlcnRpZXMiLCJwdXNoIiwicmVnaXN0ZXIiLCJwaGV0IiwiY2hpcHBlciIsInF1ZXJ5UGFyYW1ldGVycyIsImVuYWJsZWQiLCJlIiwiRXJyb3IiLCJzYWZhcmkiLCJuYXZpZ2F0b3IiLCJ1c2VyQWdlbnQiLCJpbmNsdWRlcyIsIm1lc3NhZ2UiLCJjb25zb2xlIiwibG9nIl0sIm1hcHBpbmdzIjoiQUFBQSxzREFBc0Q7QUFFdEQ7Ozs7Ozs7Q0FPQyxHQUlELE9BQU9BLFdBQVcsY0FBYztBQUVoQyxJQUFJQyxxQkFBZ0Q7QUFFcEQsTUFBTUMsa0JBQWtCO0FBRXhCLElBQUEsQUFBTUMscUJBQU4sTUFBTUE7SUErQklDLHVCQUF3QkMsUUFBNEIsRUFBRUMsSUFBWSxFQUFTO1FBQ2pGLE1BQU1DLE1BQU0sR0FBR0wsa0JBQWtCSSxNQUFNO1FBQ3ZDLElBQUtFLE9BQU9DLFlBQVksQ0FBQ0MsT0FBTyxDQUFFSCxNQUFRO1lBQ3hDRixTQUFTTSxLQUFLLEdBQUdDLEtBQUtDLEtBQUssQ0FBRUwsT0FBT0MsWUFBWSxDQUFDQyxPQUFPLENBQUVIO1FBQzVEO1FBQ0FGLFNBQVNTLElBQUksQ0FBRSxDQUFFSDtZQUNmSCxPQUFPQyxZQUFZLENBQUNNLE9BQU8sQ0FBRVIsS0FBS0ssS0FBS0ksU0FBUyxDQUFFTDtRQUNwRDtRQUNBLElBQUksQ0FBQ00sa0JBQWtCLENBQUNDLElBQUksQ0FBRWI7SUFDaEM7SUFFQSxPQUFjYyxTQUFVZCxRQUE0QixFQUFFQyxJQUFZLEVBQXVCO1FBQ3ZGLElBQUssQ0FBQ2MsS0FBS0MsT0FBTyxDQUFDQyxlQUFlLENBQUNyQixrQkFBa0IsRUFBRztZQUN0RCxPQUFPSTtRQUNUO1FBRUEsSUFBSyxDQUFDSixvQkFBcUI7WUFDekJBLHFCQUFxQixJQUFJRTtRQUMzQjtRQUVBLElBQUtGLG1CQUFtQnNCLE9BQU8sRUFBRztZQUNoQ3RCLG1CQUFtQkcsc0JBQXNCLENBQUVDLFVBQVVDO1FBQ3ZEO1FBRUEsT0FBT0Q7SUFDVDtJQWpEQSxhQUFxQjthQUxia0IsVUFBVTtRQUVsQixnQkFBZ0I7YUFDQ04scUJBQTJDLEVBQUU7UUFJNUQsSUFBSTtZQUVGLG1GQUFtRjtZQUNuRlQsT0FBT0MsWUFBWSxDQUFDTSxPQUFPLENBQUUsUUFBUTtRQUN2QyxFQUNBLE9BQU9TLEdBQUk7WUFDVCxJQUFJLENBQUNELE9BQU8sR0FBRyxPQUFPLCtDQUErQztZQUVyRSxJQUFLQyxhQUFhQyxPQUFRO2dCQUN4QixNQUFNQyxTQUFTbEIsT0FBT21CLFNBQVMsQ0FBQ0MsU0FBUyxDQUFDQyxRQUFRLENBQUUsYUFBYyxDQUFDckIsT0FBT21CLFNBQVMsQ0FBQ0MsU0FBUyxDQUFDQyxRQUFRLENBQUU7Z0JBRXhHLElBQUtILFVBQVVGLEVBQUVNLE9BQU8sQ0FBQ0QsUUFBUSxDQUFFLHVCQUF5QjtvQkFDMURFLFFBQVFDLEdBQUcsQ0FBRSxpRUFDQTtnQkFDZixPQUNLO29CQUNILE1BQU1SO2dCQUNSO1lBQ0Y7UUFDRjtJQUNGO0FBNEJGO0FBRUF4QixNQUFNbUIsUUFBUSxDQUFFLHNCQUFzQmhCO0FBQ3RDLGVBQWVBLG1CQUFtQiJ9