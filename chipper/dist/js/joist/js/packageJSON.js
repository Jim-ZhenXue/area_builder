// Copyright 2015-2023, University of Colorado Boulder
/**
 * Make the package.json contents available to the simulation, so it can access the version, sim name, etc.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */ import joist from './joist.js';
const packageJSON = window.phet && phet.chipper ? phet.chipper.packageObject : {
    name: 'placeholder'
};
joist.register('packageJSON', packageJSON);
export default packageJSON;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2pvaXN0L2pzL3BhY2thZ2VKU09OLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE1LTIwMjMsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIE1ha2UgdGhlIHBhY2thZ2UuanNvbiBjb250ZW50cyBhdmFpbGFibGUgdG8gdGhlIHNpbXVsYXRpb24sIHNvIGl0IGNhbiBhY2Nlc3MgdGhlIHZlcnNpb24sIHNpbSBuYW1lLCBldGMuXG4gKlxuICogQGF1dGhvciBTYW0gUmVpZCAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcbiAqL1xuXG5pbXBvcnQgam9pc3QgZnJvbSAnLi9qb2lzdC5qcyc7XG5cbmNvbnN0IHBhY2thZ2VKU09OID0gKCB3aW5kb3cucGhldCAmJiBwaGV0LmNoaXBwZXIgKSA/IHBoZXQuY2hpcHBlci5wYWNrYWdlT2JqZWN0IDogeyBuYW1lOiAncGxhY2Vob2xkZXInIH07XG5cbmpvaXN0LnJlZ2lzdGVyKCAncGFja2FnZUpTT04nLCBwYWNrYWdlSlNPTiApO1xuXG5leHBvcnQgZGVmYXVsdCBwYWNrYWdlSlNPTjsiXSwibmFtZXMiOlsiam9pc3QiLCJwYWNrYWdlSlNPTiIsIndpbmRvdyIsInBoZXQiLCJjaGlwcGVyIiwicGFja2FnZU9iamVjdCIsIm5hbWUiLCJyZWdpc3RlciJdLCJtYXBwaW5ncyI6IkFBQUEsc0RBQXNEO0FBRXREOzs7O0NBSUMsR0FFRCxPQUFPQSxXQUFXLGFBQWE7QUFFL0IsTUFBTUMsY0FBYyxBQUFFQyxPQUFPQyxJQUFJLElBQUlBLEtBQUtDLE9BQU8sR0FBS0QsS0FBS0MsT0FBTyxDQUFDQyxhQUFhLEdBQUc7SUFBRUMsTUFBTTtBQUFjO0FBRXpHTixNQUFNTyxRQUFRLENBQUUsZUFBZU47QUFFL0IsZUFBZUEsWUFBWSJ9