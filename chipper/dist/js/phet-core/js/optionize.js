// Copyright 2022-2024, University of Colorado Boulder
/**
 * Optionize is a TypeScript layer built on PHET_CORE/merge. Its goal is to satisfy type safety within PhET's "options"
 * pattern.
 *
 * For up-to-date examples on how to use this file, see WILDER/WilderOptionsPatterns.ts
 *
 * This pattern is still being solidified. Although the long term location of PhET's options pattern documentation
 * can be found at https://github.com/phetsims/phet-info/blob/main/doc/phet-software-design-patterns.md#options-and-config,
 * that document is currently out of date. Please see https://github.com/phetsims/phet-core/issues/128 for current
 * progress on this pattern.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */ import merge from './merge.js';
import phetCore from './phetCore.js';
// Factor out the merge arrow closure to avoid heap/cpu at runtime
const merge4 = (a, b, c, d)=>merge(a, b, c, d);
// ProvidedOptions = The type of this class's public API (type of the providedOptions parameter in the constructor)
// SelfOptions = Options that are defined by "this" class. Anything optional in this block must have a default provided in "defaults"
// ParentOptions = The public API for parent options, this will be exported by the parent class, like "NodeOptions"
// KeysUsedInSubclassConstructor = list of keys from ParentOptions that are used in this constructor.
export default function optionize() {
    return merge4;
}
// Use this function to gain the typing that optionize provides but in a case where the first argument is an empty object.
export function optionize3() {
    return merge4;
}
/**
 * Use this function to replace merge in cases like:
 *
 * const options = m-e-r-g-e(
 *   {},
 *
 *   // ParentOptions defaults that are common throughout the sim
 *   MyConstants.SOME_COMMON_OPTIONS,
 *
 *   // SelfOptions and ParentOptions defaults that are provided by this class
 *   { ... },
 *
 *   // option values that are provided by the caller
 *   providedOptions );
 */ export function optionize4() {
    return merge4;
}
// Use combineOptions to combine object literals (typically options) that all have the same type.
export function combineOptions(target, ...sources) {
    return merge4(target, ...sources);
}
// function optionize<ProvidedOptions, // eslint-disable-line no-redeclare
//   SelfOptions = ProvidedOptions,
//   ParentOptions = EmptySelfOptions>():
//   <KeysUsedInSubclassConstructor extends keyof ( ParentOptions )>(
//     emptyObject: ObjectWithNoKeys,
//     defaults: OptionizeDefaults<SelfOptions, ParentOptions>,
//     providedOptions?: ProvidedOptions
//   ) => OptionizeDefaults<SelfOptions, ParentOptions> & ProvidedOptions & Required<Pick<ParentOptions, KeysUsedInSubclassConstructor>>;
//
// function optionize<ProvidedOptions, // eslint-disable-line no-redeclare
//   SelfOptions = ProvidedOptions,
//   ParentOptions = EmptySelfOptions,
//   KeysUsedInSubclassConstructor extends keyof ParentOptions = never>():
//   (
//     empytObject: ObjectWithNoKeys,
//     defaults: OptionizeDefaults<SelfOptions, ParentOptions, KeysUsedInSubclassConstructor>,
//     providedOptions?: ProvidedOptions
//   ) => ObjectWithNoKeys & OptionizeDefaults<SelfOptions, ParentOptions, KeysUsedInSubclassConstructor> & ProvidedOptions;
// The implementation gets "any" types because of the above signatures
// function optionize<???>() { return ( a: any, b?: any, c?: any ) => merge( a, b, c ); } // eslint-disable-line no-redeclare,bad-text
// TypeScript is all-or-none on inferring generic parameter types (per function), so we must use the nested strategy in
// https://stackoverflow.com/questions/63678306/typescript-partial-type-inference to specify the types we want
// while still allowing definitions to flow through.
// This also works, we will keep it here now in case it helps with further improvements with inference.
// const optionize = <S, P, M extends keyof P = never>() => {
//   return <B>( defaults: Required<Options<S>> & Partial<P> & Required<Pick<P, M>>, providedOptions?: B ) => {
//     return merge( defaults, providedOptions );
//   };
// };
/*
Limitation (I):

This gets us half way there, when you have required args to the parent, this makes sure that you don't make
providedOptions optional (with a question mark). We still need a way to note when the required param is specified via the self options.
const optionize = <S, P = EmptySelfOptions, M extends keyof P = never, A = S & P>(
  defaults: Required<Options<S>> & Partial<P> & Required<Pick<P, M>>,
  providedOptions: RequiredKeys<A> extends never ? ( A | undefined ) : A
) => {
  return merge( defaults, providedOptions );
};

TEST TO SEE IF WE CAN GET TYPESCRIPT TO KNOW ABOUT REQUIRED ARGUMENTS TO POTENTIALLY COME FROM EITHER ARG.
const optionize = <S, P = EmptySelfOptions, M extends keyof P = never, A = S & P>() => {
  type FirstArg = Required<Options<S>> & Partial<P> & Required<Pick<P, M>>;
  return (
    defaults: FirstArg,
    //NOT WORKING: If any required elements were in the first arg, then we don't need them here, and potentially can mark providedOptions as a whole as optional
    providedOptions: RequiredKeys<FirstArg> extends never ? RequiredKeys<A> extends never ? ( A | undefined ) : A : A
  ) => {
    return merge( defaults, providedOptions );
  };
};
 */ phetCore.register('optionize', optionize);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9vcHRpb25pemUudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjItMjAyNCwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbi8qKlxuICogT3B0aW9uaXplIGlzIGEgVHlwZVNjcmlwdCBsYXllciBidWlsdCBvbiBQSEVUX0NPUkUvbWVyZ2UuIEl0cyBnb2FsIGlzIHRvIHNhdGlzZnkgdHlwZSBzYWZldHkgd2l0aGluIFBoRVQncyBcIm9wdGlvbnNcIlxuICogcGF0dGVybi5cbiAqXG4gKiBGb3IgdXAtdG8tZGF0ZSBleGFtcGxlcyBvbiBob3cgdG8gdXNlIHRoaXMgZmlsZSwgc2VlIFdJTERFUi9XaWxkZXJPcHRpb25zUGF0dGVybnMudHNcbiAqXG4gKiBUaGlzIHBhdHRlcm4gaXMgc3RpbGwgYmVpbmcgc29saWRpZmllZC4gQWx0aG91Z2ggdGhlIGxvbmcgdGVybSBsb2NhdGlvbiBvZiBQaEVUJ3Mgb3B0aW9ucyBwYXR0ZXJuIGRvY3VtZW50YXRpb25cbiAqIGNhbiBiZSBmb3VuZCBhdCBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvcGhldC1pbmZvL2Jsb2IvbWFpbi9kb2MvcGhldC1zb2Z0d2FyZS1kZXNpZ24tcGF0dGVybnMubWQjb3B0aW9ucy1hbmQtY29uZmlnLFxuICogdGhhdCBkb2N1bWVudCBpcyBjdXJyZW50bHkgb3V0IG9mIGRhdGUuIFBsZWFzZSBzZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3BoZXQtY29yZS9pc3N1ZXMvMTI4IGZvciBjdXJyZW50XG4gKiBwcm9ncmVzcyBvbiB0aGlzIHBhdHRlcm4uXG4gKlxuICogQGF1dGhvciBTYW0gUmVpZCAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcbiAqIEBhdXRob3IgTWljaGFlbCBLYXV6bWFubiAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcbiAqL1xuXG5pbXBvcnQgbWVyZ2UgZnJvbSAnLi9tZXJnZS5qcyc7XG5pbXBvcnQgcGhldENvcmUgZnJvbSAnLi9waGV0Q29yZS5qcyc7XG5pbXBvcnQgSW50ZW50aW9uYWxBbnkgZnJvbSAnLi90eXBlcy9JbnRlbnRpb25hbEFueS5qcyc7XG5pbXBvcnQgT3B0aW9uYWxLZXlzIGZyb20gJy4vdHlwZXMvT3B0aW9uYWxLZXlzLmpzJztcbmltcG9ydCBSZXF1aXJlZEtleXMgZnJvbSAnLi90eXBlcy9SZXF1aXJlZEtleXMuanMnO1xuXG4vLyBHZXRzIHRoZSBwYXJ0cyBvZiBhbiBvYmplY3QgdGhhdCBhcmUgb3B0aW9uYWxcbnR5cGUgT3B0aW9uczxUPiA9IFBpY2s8VCwgT3B0aW9uYWxLZXlzPFQ+PjtcblxudHlwZSBPYmplY3RXaXRoTm9LZXlzID0gUmVjb3JkPHN0cmluZyB8IG51bWJlciwgbmV2ZXI+O1xuXG5leHBvcnQgdHlwZSBFbXB0eVNlbGZPcHRpb25zID0ge1xuICBfZW1wdHlTZWxmT3B0aW9uc0tleT86IG5ldmVyO1xufTtcblxudHlwZSBFbXB0eVNlbGZPcHRpb25zS2V5cyA9IGtleW9mIEVtcHR5U2VsZk9wdGlvbnM7XG5cbi8vIFRoaXMgaXMgdGhlIHR5cGUgZm9yIHRoZSBgZGVmYXVsdHNgIGFyZ3VtZW50IHRvIG9wdGlvbml6ZVxudHlwZSBPcHRpb25pemVEZWZhdWx0czxTZWxmT3B0aW9ucyA9IEVtcHR5U2VsZk9wdGlvbnMsIFBhcmVudE9wdGlvbnMgPSBFbXB0eVNlbGZPcHRpb25zLCBQcm92aWRlZE9wdGlvbnMgPSBFbXB0eVNlbGZPcHRpb25zPiA9XG5cbi8vIEV2ZXJ5dGhpbmcgb3B0aW9uYWwgZnJvbSBTZWxmT3B0aW9ucyBtdXN0IGhhdmUgYSBkZWZhdWx0IHNwZWNpZmllZFxuICBPbWl0PFJlcXVpcmVkPE9wdGlvbnM8U2VsZk9wdGlvbnM+PiwgRW1wdHlTZWxmT3B0aW9uc0tleXM+ICYgLy8gZXNsaW50LWRpc2FibGUtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tcmVzdHJpY3RlZC10eXBlc1xuXG4gIC8vIEFueXRoaW5nIHJlcXVpcmVkIGluIHRoZSBQcm92aWRlZE9wdGlvbnMgc2hvdWxkIG5vdCBzaG93IHVwIGluIHRoZSBcImRlZmF1bHRzXCIgb2JqZWN0XG4gIFBhcnRpYWw8UmVjb3JkPFJlcXVpcmVkS2V5czxQcm92aWRlZE9wdGlvbnM+LCBuZXZlcj4+ICZcblxuICAvLyBBbnkgb3Igbm9uZSBvZiBQYXJlbnQgb3B0aW9ucyBjYW4gYmUgcHJvdmlkZWRcbiAgUGFydGlhbDxQYXJlbnRPcHRpb25zPlxuXG4gIC8vIEluY2x1ZGUgdGhlIHJlcXVpcmVkIHByb3BlcnRpZXMgZnJvbSBQYXJlbnRPcHRpb25zIHRoYXQgYXJlIG5vdCBpbiB0aGUgUHJvdmlkZWRPcHRpb25zXG4gICYgUmVxdWlyZWQ8T21pdDxQaWNrPFBhcmVudE9wdGlvbnMsIFJlcXVpcmVkS2V5czxQYXJlbnRPcHRpb25zPj4sIFJlcXVpcmVkS2V5czxQcm92aWRlZE9wdGlvbnM+Pj47IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLXJlc3RyaWN0ZWQtdHlwZXNcblxuLy8gRmFjdG9yIG91dCB0aGUgbWVyZ2UgYXJyb3cgY2xvc3VyZSB0byBhdm9pZCBoZWFwL2NwdSBhdCBydW50aW1lXG5jb25zdCBtZXJnZTQgPSAoIGE6IEludGVudGlvbmFsQW55LCBiPzogSW50ZW50aW9uYWxBbnksIGM/OiBJbnRlbnRpb25hbEFueSwgZD86IEludGVudGlvbmFsQW55ICkgPT4gbWVyZ2UoIGEsIGIsIGMsIGQgKTtcblxuLy8gUHJvdmlkZWRPcHRpb25zID0gVGhlIHR5cGUgb2YgdGhpcyBjbGFzcydzIHB1YmxpYyBBUEkgKHR5cGUgb2YgdGhlIHByb3ZpZGVkT3B0aW9ucyBwYXJhbWV0ZXIgaW4gdGhlIGNvbnN0cnVjdG9yKVxuLy8gU2VsZk9wdGlvbnMgPSBPcHRpb25zIHRoYXQgYXJlIGRlZmluZWQgYnkgXCJ0aGlzXCIgY2xhc3MuIEFueXRoaW5nIG9wdGlvbmFsIGluIHRoaXMgYmxvY2sgbXVzdCBoYXZlIGEgZGVmYXVsdCBwcm92aWRlZCBpbiBcImRlZmF1bHRzXCJcbi8vIFBhcmVudE9wdGlvbnMgPSBUaGUgcHVibGljIEFQSSBmb3IgcGFyZW50IG9wdGlvbnMsIHRoaXMgd2lsbCBiZSBleHBvcnRlZCBieSB0aGUgcGFyZW50IGNsYXNzLCBsaWtlIFwiTm9kZU9wdGlvbnNcIlxuLy8gS2V5c1VzZWRJblN1YmNsYXNzQ29uc3RydWN0b3IgPSBsaXN0IG9mIGtleXMgZnJvbSBQYXJlbnRPcHRpb25zIHRoYXQgYXJlIHVzZWQgaW4gdGhpcyBjb25zdHJ1Y3Rvci5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIG9wdGlvbml6ZTxQcm92aWRlZE9wdGlvbnMsXG4gIFNlbGZPcHRpb25zID0gUHJvdmlkZWRPcHRpb25zLCAvLyBCeSBkZWZhdWx0LCBldmVyeSBvcHRpb25hbCBvcHRpb24gaW4gdGhlIFByb3ZpZGVkT3B0aW9ucyBtdXN0IGhhdmUgYSBkZWZhdWx0IHVubGVzcyB5b3Ugc3BlY2lmeSBhbm90aGVyIG9iamVjdCBmb3IgU2VsZk9wdGlvbnNcbiAgUGFyZW50T3B0aW9ucyA9IFJlY29yZDxuZXZlciwgbmV2ZXI+PigpOlxuICA8S2V5c1VzZWRJblN1YmNsYXNzQ29uc3RydWN0b3IgZXh0ZW5kcyBrZXlvZiAoIFBhcmVudE9wdGlvbnMgKT4oXG4gICAgZGVmYXVsdHM6IE9wdGlvbml6ZURlZmF1bHRzPFNlbGZPcHRpb25zLCBQYXJlbnRPcHRpb25zLCBQcm92aWRlZE9wdGlvbnM+LFxuICAgIHByb3ZpZGVkT3B0aW9uczogUHJvdmlkZWRPcHRpb25zIHwgdW5kZWZpbmVkXG4gICkgPT4gT3B0aW9uaXplRGVmYXVsdHM8U2VsZk9wdGlvbnMsIFBhcmVudE9wdGlvbnM+ICYgUHJvdmlkZWRPcHRpb25zICYgUmVxdWlyZWQ8UGljazxQYXJlbnRPcHRpb25zLCBLZXlzVXNlZEluU3ViY2xhc3NDb25zdHJ1Y3Rvcj4+IHtcbiAgcmV0dXJuIG1lcmdlNDtcbn1cblxuLy8gVXNlIHRoaXMgZnVuY3Rpb24gdG8gZ2FpbiB0aGUgdHlwaW5nIHRoYXQgb3B0aW9uaXplIHByb3ZpZGVzIGJ1dCBpbiBhIGNhc2Ugd2hlcmUgdGhlIGZpcnN0IGFyZ3VtZW50IGlzIGFuIGVtcHR5IG9iamVjdC5cbmV4cG9ydCBmdW5jdGlvbiBvcHRpb25pemUzPFByb3ZpZGVkT3B0aW9ucyxcbiAgU2VsZk9wdGlvbnMgPSBQcm92aWRlZE9wdGlvbnMsIC8vIEJ5IGRlZmF1bHQsIGV2ZXJ5IG9wdGlvbmFsIG9wdGlvbiBpbiB0aGUgUHJvdmlkZWRPcHRpb25zIG11c3QgaGF2ZSBhIGRlZmF1bHQgdW5sZXNzIHlvdSBzcGVjaWZ5IGFub3RoZXIgb2JqZWN0IGZvciBTZWxmT3B0aW9uc1xuICBQYXJlbnRPcHRpb25zID0gUmVjb3JkPG5ldmVyLCBuZXZlcj4+KCk6XG4gIDxLZXlzVXNlZEluU3ViY2xhc3NDb25zdHJ1Y3RvciBleHRlbmRzIGtleW9mICggUGFyZW50T3B0aW9ucyApPihcbiAgICBlbXB0eU9iamVjdDogT2JqZWN0V2l0aE5vS2V5cyxcbiAgICBkZWZhdWx0czogT3B0aW9uaXplRGVmYXVsdHM8U2VsZk9wdGlvbnMsIFBhcmVudE9wdGlvbnM+LFxuICAgIHByb3ZpZGVkT3B0aW9uczogUHJvdmlkZWRPcHRpb25zIHwgdW5kZWZpbmVkXG4gICkgPT4gT3B0aW9uaXplRGVmYXVsdHM8U2VsZk9wdGlvbnMsIFBhcmVudE9wdGlvbnM+ICYgUHJvdmlkZWRPcHRpb25zICYgUmVxdWlyZWQ8UGljazxQYXJlbnRPcHRpb25zLCBLZXlzVXNlZEluU3ViY2xhc3NDb25zdHJ1Y3Rvcj4+IHtcbiAgcmV0dXJuIG1lcmdlNDtcbn1cblxuLyoqXG4gKiBVc2UgdGhpcyBmdW5jdGlvbiB0byByZXBsYWNlIG1lcmdlIGluIGNhc2VzIGxpa2U6XG4gKlxuICogY29uc3Qgb3B0aW9ucyA9IG0tZS1yLWctZShcbiAqICAge30sXG4gKlxuICogICAvLyBQYXJlbnRPcHRpb25zIGRlZmF1bHRzIHRoYXQgYXJlIGNvbW1vbiB0aHJvdWdob3V0IHRoZSBzaW1cbiAqICAgTXlDb25zdGFudHMuU09NRV9DT01NT05fT1BUSU9OUyxcbiAqXG4gKiAgIC8vIFNlbGZPcHRpb25zIGFuZCBQYXJlbnRPcHRpb25zIGRlZmF1bHRzIHRoYXQgYXJlIHByb3ZpZGVkIGJ5IHRoaXMgY2xhc3NcbiAqICAgeyAuLi4gfSxcbiAqXG4gKiAgIC8vIG9wdGlvbiB2YWx1ZXMgdGhhdCBhcmUgcHJvdmlkZWQgYnkgdGhlIGNhbGxlclxuICogICBwcm92aWRlZE9wdGlvbnMgKTtcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG9wdGlvbml6ZTQ8UHJvdmlkZWRPcHRpb25zLFxuICBTZWxmT3B0aW9ucyA9IFByb3ZpZGVkT3B0aW9ucyxcbiAgUGFyZW50T3B0aW9ucyA9IG9iamVjdD4oKTpcbiAgPEtleXNVc2VkSW5TdWJjbGFzc0NvbnN0cnVjdG9yIGV4dGVuZHMga2V5b2YgKCBQYXJlbnRPcHRpb25zICk+KFxuICAgIGVtcHR5T2JqZWN0OiBPYmplY3RXaXRoTm9LZXlzLFxuICAgIG9wdGlvbnNGcm9tQ29uc3RhbnQ6IFBhcnRpYWw8UGFyZW50T3B0aW9ucz4sXG4gICAgZGVmYXVsdHMyOiBPcHRpb25pemVEZWZhdWx0czxTZWxmT3B0aW9ucywgUGFyZW50T3B0aW9ucz4sXG4gICAgcHJvdmlkZWRPcHRpb25zOiBQcm92aWRlZE9wdGlvbnMgfCB1bmRlZmluZWRcbiAgKSA9PiBPcHRpb25pemVEZWZhdWx0czxTZWxmT3B0aW9ucywgUGFyZW50T3B0aW9ucz4gJiBQcm92aWRlZE9wdGlvbnMgJiBSZXF1aXJlZDxQaWNrPFBhcmVudE9wdGlvbnMsIEtleXNVc2VkSW5TdWJjbGFzc0NvbnN0cnVjdG9yPj4ge1xuICByZXR1cm4gbWVyZ2U0O1xufVxuXG4vLyBVc2UgY29tYmluZU9wdGlvbnMgdG8gY29tYmluZSBvYmplY3QgbGl0ZXJhbHMgKHR5cGljYWxseSBvcHRpb25zKSB0aGF0IGFsbCBoYXZlIHRoZSBzYW1lIHR5cGUuXG5leHBvcnQgZnVuY3Rpb24gY29tYmluZU9wdGlvbnM8VHlwZSBleHRlbmRzIG9iamVjdD4oIHRhcmdldDogUGFydGlhbDxUeXBlPiwgLi4uc291cmNlczogQXJyYXk8UGFydGlhbDxUeXBlPiB8IHVuZGVmaW5lZD4gKTogVHlwZSB7XG4gIHJldHVybiBtZXJnZTQoIHRhcmdldCwgLi4uc291cmNlcyApO1xufVxuXG5cbi8vIGZ1bmN0aW9uIG9wdGlvbml6ZTxQcm92aWRlZE9wdGlvbnMsIC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tcmVkZWNsYXJlXG4vLyAgIFNlbGZPcHRpb25zID0gUHJvdmlkZWRPcHRpb25zLFxuLy8gICBQYXJlbnRPcHRpb25zID0gRW1wdHlTZWxmT3B0aW9ucz4oKTpcbi8vICAgPEtleXNVc2VkSW5TdWJjbGFzc0NvbnN0cnVjdG9yIGV4dGVuZHMga2V5b2YgKCBQYXJlbnRPcHRpb25zICk+KFxuLy8gICAgIGVtcHR5T2JqZWN0OiBPYmplY3RXaXRoTm9LZXlzLFxuLy8gICAgIGRlZmF1bHRzOiBPcHRpb25pemVEZWZhdWx0czxTZWxmT3B0aW9ucywgUGFyZW50T3B0aW9ucz4sXG4vLyAgICAgcHJvdmlkZWRPcHRpb25zPzogUHJvdmlkZWRPcHRpb25zXG4vLyAgICkgPT4gT3B0aW9uaXplRGVmYXVsdHM8U2VsZk9wdGlvbnMsIFBhcmVudE9wdGlvbnM+ICYgUHJvdmlkZWRPcHRpb25zICYgUmVxdWlyZWQ8UGljazxQYXJlbnRPcHRpb25zLCBLZXlzVXNlZEluU3ViY2xhc3NDb25zdHJ1Y3Rvcj4+O1xuLy9cbi8vIGZ1bmN0aW9uIG9wdGlvbml6ZTxQcm92aWRlZE9wdGlvbnMsIC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tcmVkZWNsYXJlXG4vLyAgIFNlbGZPcHRpb25zID0gUHJvdmlkZWRPcHRpb25zLFxuLy8gICBQYXJlbnRPcHRpb25zID0gRW1wdHlTZWxmT3B0aW9ucyxcbi8vICAgS2V5c1VzZWRJblN1YmNsYXNzQ29uc3RydWN0b3IgZXh0ZW5kcyBrZXlvZiBQYXJlbnRPcHRpb25zID0gbmV2ZXI+KCk6XG4vLyAgIChcbi8vICAgICBlbXB5dE9iamVjdDogT2JqZWN0V2l0aE5vS2V5cyxcbi8vICAgICBkZWZhdWx0czogT3B0aW9uaXplRGVmYXVsdHM8U2VsZk9wdGlvbnMsIFBhcmVudE9wdGlvbnMsIEtleXNVc2VkSW5TdWJjbGFzc0NvbnN0cnVjdG9yPixcbi8vICAgICBwcm92aWRlZE9wdGlvbnM/OiBQcm92aWRlZE9wdGlvbnNcbi8vICAgKSA9PiBPYmplY3RXaXRoTm9LZXlzICYgT3B0aW9uaXplRGVmYXVsdHM8U2VsZk9wdGlvbnMsIFBhcmVudE9wdGlvbnMsIEtleXNVc2VkSW5TdWJjbGFzc0NvbnN0cnVjdG9yPiAmIFByb3ZpZGVkT3B0aW9ucztcblxuLy8gVGhlIGltcGxlbWVudGF0aW9uIGdldHMgXCJhbnlcIiB0eXBlcyBiZWNhdXNlIG9mIHRoZSBhYm92ZSBzaWduYXR1cmVzXG4vLyBmdW5jdGlvbiBvcHRpb25pemU8Pz8/PigpIHsgcmV0dXJuICggYTogYW55LCBiPzogYW55LCBjPzogYW55ICkgPT4gbWVyZ2UoIGEsIGIsIGMgKTsgfSAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLXJlZGVjbGFyZSxiYWQtdGV4dFxuXG4vLyBUeXBlU2NyaXB0IGlzIGFsbC1vci1ub25lIG9uIGluZmVycmluZyBnZW5lcmljIHBhcmFtZXRlciB0eXBlcyAocGVyIGZ1bmN0aW9uKSwgc28gd2UgbXVzdCB1c2UgdGhlIG5lc3RlZCBzdHJhdGVneSBpblxuLy8gaHR0cHM6Ly9zdGFja292ZXJmbG93LmNvbS9xdWVzdGlvbnMvNjM2NzgzMDYvdHlwZXNjcmlwdC1wYXJ0aWFsLXR5cGUtaW5mZXJlbmNlIHRvIHNwZWNpZnkgdGhlIHR5cGVzIHdlIHdhbnRcbi8vIHdoaWxlIHN0aWxsIGFsbG93aW5nIGRlZmluaXRpb25zIHRvIGZsb3cgdGhyb3VnaC5cbi8vIFRoaXMgYWxzbyB3b3Jrcywgd2Ugd2lsbCBrZWVwIGl0IGhlcmUgbm93IGluIGNhc2UgaXQgaGVscHMgd2l0aCBmdXJ0aGVyIGltcHJvdmVtZW50cyB3aXRoIGluZmVyZW5jZS5cbi8vIGNvbnN0IG9wdGlvbml6ZSA9IDxTLCBQLCBNIGV4dGVuZHMga2V5b2YgUCA9IG5ldmVyPigpID0+IHtcbi8vICAgcmV0dXJuIDxCPiggZGVmYXVsdHM6IFJlcXVpcmVkPE9wdGlvbnM8Uz4+ICYgUGFydGlhbDxQPiAmIFJlcXVpcmVkPFBpY2s8UCwgTT4+LCBwcm92aWRlZE9wdGlvbnM/OiBCICkgPT4ge1xuLy8gICAgIHJldHVybiBtZXJnZSggZGVmYXVsdHMsIHByb3ZpZGVkT3B0aW9ucyApO1xuLy8gICB9O1xuLy8gfTtcblxuLypcbkxpbWl0YXRpb24gKEkpOlxuXG5UaGlzIGdldHMgdXMgaGFsZiB3YXkgdGhlcmUsIHdoZW4geW91IGhhdmUgcmVxdWlyZWQgYXJncyB0byB0aGUgcGFyZW50LCB0aGlzIG1ha2VzIHN1cmUgdGhhdCB5b3UgZG9uJ3QgbWFrZVxucHJvdmlkZWRPcHRpb25zIG9wdGlvbmFsICh3aXRoIGEgcXVlc3Rpb24gbWFyaykuIFdlIHN0aWxsIG5lZWQgYSB3YXkgdG8gbm90ZSB3aGVuIHRoZSByZXF1aXJlZCBwYXJhbSBpcyBzcGVjaWZpZWQgdmlhIHRoZSBzZWxmIG9wdGlvbnMuXG5jb25zdCBvcHRpb25pemUgPSA8UywgUCA9IEVtcHR5U2VsZk9wdGlvbnMsIE0gZXh0ZW5kcyBrZXlvZiBQID0gbmV2ZXIsIEEgPSBTICYgUD4oXG4gIGRlZmF1bHRzOiBSZXF1aXJlZDxPcHRpb25zPFM+PiAmIFBhcnRpYWw8UD4gJiBSZXF1aXJlZDxQaWNrPFAsIE0+PixcbiAgcHJvdmlkZWRPcHRpb25zOiBSZXF1aXJlZEtleXM8QT4gZXh0ZW5kcyBuZXZlciA/ICggQSB8IHVuZGVmaW5lZCApIDogQVxuKSA9PiB7XG4gIHJldHVybiBtZXJnZSggZGVmYXVsdHMsIHByb3ZpZGVkT3B0aW9ucyApO1xufTtcblxuVEVTVCBUTyBTRUUgSUYgV0UgQ0FOIEdFVCBUWVBFU0NSSVBUIFRPIEtOT1cgQUJPVVQgUkVRVUlSRUQgQVJHVU1FTlRTIFRPIFBPVEVOVElBTExZIENPTUUgRlJPTSBFSVRIRVIgQVJHLlxuY29uc3Qgb3B0aW9uaXplID0gPFMsIFAgPSBFbXB0eVNlbGZPcHRpb25zLCBNIGV4dGVuZHMga2V5b2YgUCA9IG5ldmVyLCBBID0gUyAmIFA+KCkgPT4ge1xuICB0eXBlIEZpcnN0QXJnID0gUmVxdWlyZWQ8T3B0aW9uczxTPj4gJiBQYXJ0aWFsPFA+ICYgUmVxdWlyZWQ8UGljazxQLCBNPj47XG4gIHJldHVybiAoXG4gICAgZGVmYXVsdHM6IEZpcnN0QXJnLFxuICAgIC8vTk9UIFdPUktJTkc6IElmIGFueSByZXF1aXJlZCBlbGVtZW50cyB3ZXJlIGluIHRoZSBmaXJzdCBhcmcsIHRoZW4gd2UgZG9uJ3QgbmVlZCB0aGVtIGhlcmUsIGFuZCBwb3RlbnRpYWxseSBjYW4gbWFyayBwcm92aWRlZE9wdGlvbnMgYXMgYSB3aG9sZSBhcyBvcHRpb25hbFxuICAgIHByb3ZpZGVkT3B0aW9uczogUmVxdWlyZWRLZXlzPEZpcnN0QXJnPiBleHRlbmRzIG5ldmVyID8gUmVxdWlyZWRLZXlzPEE+IGV4dGVuZHMgbmV2ZXIgPyAoIEEgfCB1bmRlZmluZWQgKSA6IEEgOiBBXG4gICkgPT4ge1xuICAgIHJldHVybiBtZXJnZSggZGVmYXVsdHMsIHByb3ZpZGVkT3B0aW9ucyApO1xuICB9O1xufTtcbiAqL1xuXG5waGV0Q29yZS5yZWdpc3RlciggJ29wdGlvbml6ZScsIG9wdGlvbml6ZSApO1xuZXhwb3J0IHR5cGUgeyBPcHRpb25pemVEZWZhdWx0cyB9OyJdLCJuYW1lcyI6WyJtZXJnZSIsInBoZXRDb3JlIiwibWVyZ2U0IiwiYSIsImIiLCJjIiwiZCIsIm9wdGlvbml6ZSIsIm9wdGlvbml6ZTMiLCJvcHRpb25pemU0IiwiY29tYmluZU9wdGlvbnMiLCJ0YXJnZXQiLCJzb3VyY2VzIiwicmVnaXN0ZXIiXSwibWFwcGluZ3MiOiJBQUFBLHNEQUFzRDtBQUV0RDs7Ozs7Ozs7Ozs7OztDQWFDLEdBRUQsT0FBT0EsV0FBVyxhQUFhO0FBQy9CLE9BQU9DLGNBQWMsZ0JBQWdCO0FBK0JyQyxrRUFBa0U7QUFDbEUsTUFBTUMsU0FBUyxDQUFFQyxHQUFtQkMsR0FBb0JDLEdBQW9CQyxJQUF3Qk4sTUFBT0csR0FBR0MsR0FBR0MsR0FBR0M7QUFFcEgsbUhBQW1IO0FBQ25ILHFJQUFxSTtBQUNySSxtSEFBbUg7QUFDbkgscUdBQXFHO0FBQ3JHLGVBQWUsU0FBU0M7SUFPdEIsT0FBT0w7QUFDVDtBQUVBLDBIQUEwSDtBQUMxSCxPQUFPLFNBQVNNO0lBUWQsT0FBT047QUFDVDtBQUVBOzs7Ozs7Ozs7Ozs7OztDQWNDLEdBQ0QsT0FBTyxTQUFTTztJQVNkLE9BQU9QO0FBQ1Q7QUFFQSxpR0FBaUc7QUFDakcsT0FBTyxTQUFTUSxlQUFxQ0MsTUFBcUIsRUFBRSxHQUFHQyxPQUF5QztJQUN0SCxPQUFPVixPQUFRUyxXQUFXQztBQUM1QjtBQUdBLDBFQUEwRTtBQUMxRSxtQ0FBbUM7QUFDbkMseUNBQXlDO0FBQ3pDLHFFQUFxRTtBQUNyRSxxQ0FBcUM7QUFDckMsK0RBQStEO0FBQy9ELHdDQUF3QztBQUN4Qyx5SUFBeUk7QUFDekksRUFBRTtBQUNGLDBFQUEwRTtBQUMxRSxtQ0FBbUM7QUFDbkMsc0NBQXNDO0FBQ3RDLDBFQUEwRTtBQUMxRSxNQUFNO0FBQ04scUNBQXFDO0FBQ3JDLDhGQUE4RjtBQUM5Rix3Q0FBd0M7QUFDeEMsNEhBQTRIO0FBRTVILHNFQUFzRTtBQUN0RSxzSUFBc0k7QUFFdEksdUhBQXVIO0FBQ3ZILDhHQUE4RztBQUM5RyxvREFBb0Q7QUFDcEQsdUdBQXVHO0FBQ3ZHLDZEQUE2RDtBQUM3RCwrR0FBK0c7QUFDL0csaURBQWlEO0FBQ2pELE9BQU87QUFDUCxLQUFLO0FBRUw7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0NBdUJDLEdBRURYLFNBQVNZLFFBQVEsQ0FBRSxhQUFhTiJ9