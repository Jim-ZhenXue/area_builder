// Copyright 2019-2023, University of Colorado Boulder
/**
 * Links for the AboutDialog, used in phet brand and phet-io brand since they are the same for both.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Michael Kauzmann (PhET Interactive Simulations)
 * @author Chris Klusendorf (PhET Interactive Simulations)
 */ import JoistStrings from '../../joist/js/JoistStrings.js';
import brand from './brand.js';
const termsPrivacyAndLicensingStringProperty = JoistStrings.termsPrivacyAndLicensingStringProperty;
const translationCreditsLinkStringProperty = JoistStrings.translation.credits.linkStringProperty;
const thirdPartyCreditsLinkStringProperty = JoistStrings.thirdParty.credits.linkStringProperty;
const getLinks = (simName, locale)=>{
    return [
        {
            textStringProperty: termsPrivacyAndLicensingStringProperty,
            url: 'https://phet.colorado.edu/en/licensing/html'
        },
        {
            textStringProperty: translationCreditsLinkStringProperty,
            url: `https://phet.colorado.edu/translation-credits?simName=${encodeURIComponent(simName)}&locale=${encodeURIComponent(locale)}`
        },
        {
            textStringProperty: thirdPartyCreditsLinkStringProperty,
            url: `https://phet.colorado.edu/third-party-credits?simName=${encodeURIComponent(simName)}&locale=${encodeURIComponent(locale)}#${simName}`
        }
    ];
};
brand.register('getLinks', getLinks);
export default getLinks;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2JyYW5kL2pzL2dldExpbmtzLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE5LTIwMjMsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIExpbmtzIGZvciB0aGUgQWJvdXREaWFsb2csIHVzZWQgaW4gcGhldCBicmFuZCBhbmQgcGhldC1pbyBicmFuZCBzaW5jZSB0aGV5IGFyZSB0aGUgc2FtZSBmb3IgYm90aC5cbiAqXG4gKiBAYXV0aG9yIFNhbSBSZWlkIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxuICogQGF1dGhvciBNaWNoYWVsIEthdXptYW5uIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxuICogQGF1dGhvciBDaHJpcyBLbHVzZW5kb3JmIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxuICovXG5cbmltcG9ydCBUUmVhZE9ubHlQcm9wZXJ0eSBmcm9tICcuLi8uLi9heG9uL2pzL1RSZWFkT25seVByb3BlcnR5LmpzJztcbmltcG9ydCB7IExvY2FsZSB9IGZyb20gJy4uLy4uL2pvaXN0L2pzL2kxOG4vbG9jYWxlUHJvcGVydHkuanMnO1xuaW1wb3J0IEpvaXN0U3RyaW5ncyBmcm9tICcuLi8uLi9qb2lzdC9qcy9Kb2lzdFN0cmluZ3MuanMnO1xuaW1wb3J0IGJyYW5kIGZyb20gJy4vYnJhbmQuanMnO1xuXG5jb25zdCB0ZXJtc1ByaXZhY3lBbmRMaWNlbnNpbmdTdHJpbmdQcm9wZXJ0eSA9IEpvaXN0U3RyaW5ncy50ZXJtc1ByaXZhY3lBbmRMaWNlbnNpbmdTdHJpbmdQcm9wZXJ0eTtcbmNvbnN0IHRyYW5zbGF0aW9uQ3JlZGl0c0xpbmtTdHJpbmdQcm9wZXJ0eSA9IEpvaXN0U3RyaW5ncy50cmFuc2xhdGlvbi5jcmVkaXRzLmxpbmtTdHJpbmdQcm9wZXJ0eTtcbmNvbnN0IHRoaXJkUGFydHlDcmVkaXRzTGlua1N0cmluZ1Byb3BlcnR5ID0gSm9pc3RTdHJpbmdzLnRoaXJkUGFydHkuY3JlZGl0cy5saW5rU3RyaW5nUHJvcGVydHk7XG5cbmV4cG9ydCB0eXBlIExpbmtPYmplY3QgPSB7XG4gIHRleHRTdHJpbmdQcm9wZXJ0eTogVFJlYWRPbmx5UHJvcGVydHk8c3RyaW5nPjtcbiAgdXJsOiBzdHJpbmc7XG59O1xuXG5jb25zdCBnZXRMaW5rcyA9ICggc2ltTmFtZTogc3RyaW5nLCBsb2NhbGU6IExvY2FsZSApOiBMaW5rT2JqZWN0W10gPT4ge1xuICByZXR1cm4gW1xuICAgIHtcbiAgICAgIHRleHRTdHJpbmdQcm9wZXJ0eTogdGVybXNQcml2YWN5QW5kTGljZW5zaW5nU3RyaW5nUHJvcGVydHksXG4gICAgICB1cmw6ICdodHRwczovL3BoZXQuY29sb3JhZG8uZWR1L2VuL2xpY2Vuc2luZy9odG1sJ1xuICAgIH0sXG4gICAge1xuICAgICAgdGV4dFN0cmluZ1Byb3BlcnR5OiB0cmFuc2xhdGlvbkNyZWRpdHNMaW5rU3RyaW5nUHJvcGVydHksXG4gICAgICB1cmw6IGBodHRwczovL3BoZXQuY29sb3JhZG8uZWR1L3RyYW5zbGF0aW9uLWNyZWRpdHM/c2ltTmFtZT0ke2VuY29kZVVSSUNvbXBvbmVudCggc2ltTmFtZSApfSZsb2NhbGU9JHtlbmNvZGVVUklDb21wb25lbnQoIGxvY2FsZSApfWBcbiAgICB9LFxuICAgIHtcbiAgICAgIHRleHRTdHJpbmdQcm9wZXJ0eTogdGhpcmRQYXJ0eUNyZWRpdHNMaW5rU3RyaW5nUHJvcGVydHksXG4gICAgICB1cmw6IGBodHRwczovL3BoZXQuY29sb3JhZG8uZWR1L3RoaXJkLXBhcnR5LWNyZWRpdHM/c2ltTmFtZT0ke2VuY29kZVVSSUNvbXBvbmVudCggc2ltTmFtZSApfSZsb2NhbGU9JHtlbmNvZGVVUklDb21wb25lbnQoIGxvY2FsZSApfSMke3NpbU5hbWV9YFxuICAgIH1cbiAgXTtcbn07XG5cbmJyYW5kLnJlZ2lzdGVyKCAnZ2V0TGlua3MnLCBnZXRMaW5rcyApO1xuZXhwb3J0IGRlZmF1bHQgZ2V0TGlua3M7Il0sIm5hbWVzIjpbIkpvaXN0U3RyaW5ncyIsImJyYW5kIiwidGVybXNQcml2YWN5QW5kTGljZW5zaW5nU3RyaW5nUHJvcGVydHkiLCJ0cmFuc2xhdGlvbkNyZWRpdHNMaW5rU3RyaW5nUHJvcGVydHkiLCJ0cmFuc2xhdGlvbiIsImNyZWRpdHMiLCJsaW5rU3RyaW5nUHJvcGVydHkiLCJ0aGlyZFBhcnR5Q3JlZGl0c0xpbmtTdHJpbmdQcm9wZXJ0eSIsInRoaXJkUGFydHkiLCJnZXRMaW5rcyIsInNpbU5hbWUiLCJsb2NhbGUiLCJ0ZXh0U3RyaW5nUHJvcGVydHkiLCJ1cmwiLCJlbmNvZGVVUklDb21wb25lbnQiLCJyZWdpc3RlciJdLCJtYXBwaW5ncyI6IkFBQUEsc0RBQXNEO0FBRXREOzs7Ozs7Q0FNQyxHQUlELE9BQU9BLGtCQUFrQixpQ0FBaUM7QUFDMUQsT0FBT0MsV0FBVyxhQUFhO0FBRS9CLE1BQU1DLHlDQUF5Q0YsYUFBYUUsc0NBQXNDO0FBQ2xHLE1BQU1DLHVDQUF1Q0gsYUFBYUksV0FBVyxDQUFDQyxPQUFPLENBQUNDLGtCQUFrQjtBQUNoRyxNQUFNQyxzQ0FBc0NQLGFBQWFRLFVBQVUsQ0FBQ0gsT0FBTyxDQUFDQyxrQkFBa0I7QUFPOUYsTUFBTUcsV0FBVyxDQUFFQyxTQUFpQkM7SUFDbEMsT0FBTztRQUNMO1lBQ0VDLG9CQUFvQlY7WUFDcEJXLEtBQUs7UUFDUDtRQUNBO1lBQ0VELG9CQUFvQlQ7WUFDcEJVLEtBQUssQ0FBQyxzREFBc0QsRUFBRUMsbUJBQW9CSixTQUFVLFFBQVEsRUFBRUksbUJBQW9CSCxTQUFVO1FBQ3RJO1FBQ0E7WUFDRUMsb0JBQW9CTDtZQUNwQk0sS0FBSyxDQUFDLHNEQUFzRCxFQUFFQyxtQkFBb0JKLFNBQVUsUUFBUSxFQUFFSSxtQkFBb0JILFFBQVMsQ0FBQyxFQUFFRCxTQUFTO1FBQ2pKO0tBQ0Q7QUFDSDtBQUVBVCxNQUFNYyxRQUFRLENBQUUsWUFBWU47QUFDNUIsZUFBZUEsU0FBUyJ9