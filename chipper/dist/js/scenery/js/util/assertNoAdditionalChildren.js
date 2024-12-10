// Copyright 2024, University of Colorado Boulder
/**
 * A utility function that enforces that no additional Children are added to a Node.
 *
 * In particular, useful for making sure that Nodes are not decorated with other content which can be
 * problematic for dynamic layout. See https://github.com/phetsims/sun/issues/860.
 *
 * Usage:
 *
 * const myNode = new Node();
 * myNode.children = [ new Node(), new Node() ]; // fill in with your own content
 * assertNoAdditionalChildren( myNode ); // prevent new children
 *
 * Note that removals need to be allowed for disposal.
 *
 * @author Jesse Greenberg
 */ /**
 * @param node - Prevent changes on this Node
 */ const assertNoAdditionalChildren = function(node) {
    if (assert) {
        node.insertChild = function(index, node, isComposite) {
            assert && assert(false, 'Attempt to insert child into Leaf');
            return node;
        };
    }
};
export default assertNoAdditionalChildren;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvdXRpbC9hc3NlcnROb0FkZGl0aW9uYWxDaGlsZHJlbi50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAyNCwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbi8qKlxuICogQSB1dGlsaXR5IGZ1bmN0aW9uIHRoYXQgZW5mb3JjZXMgdGhhdCBubyBhZGRpdGlvbmFsIENoaWxkcmVuIGFyZSBhZGRlZCB0byBhIE5vZGUuXG4gKlxuICogSW4gcGFydGljdWxhciwgdXNlZnVsIGZvciBtYWtpbmcgc3VyZSB0aGF0IE5vZGVzIGFyZSBub3QgZGVjb3JhdGVkIHdpdGggb3RoZXIgY29udGVudCB3aGljaCBjYW4gYmVcbiAqIHByb2JsZW1hdGljIGZvciBkeW5hbWljIGxheW91dC4gU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9zdW4vaXNzdWVzLzg2MC5cbiAqXG4gKiBVc2FnZTpcbiAqXG4gKiBjb25zdCBteU5vZGUgPSBuZXcgTm9kZSgpO1xuICogbXlOb2RlLmNoaWxkcmVuID0gWyBuZXcgTm9kZSgpLCBuZXcgTm9kZSgpIF07IC8vIGZpbGwgaW4gd2l0aCB5b3VyIG93biBjb250ZW50XG4gKiBhc3NlcnROb0FkZGl0aW9uYWxDaGlsZHJlbiggbXlOb2RlICk7IC8vIHByZXZlbnQgbmV3IGNoaWxkcmVuXG4gKlxuICogTm90ZSB0aGF0IHJlbW92YWxzIG5lZWQgdG8gYmUgYWxsb3dlZCBmb3IgZGlzcG9zYWwuXG4gKlxuICogQGF1dGhvciBKZXNzZSBHcmVlbmJlcmdcbiAqL1xuXG5pbXBvcnQgeyBOb2RlIH0gZnJvbSAnLi4vaW1wb3J0cy5qcyc7XG5cbi8qKlxuICogQHBhcmFtIG5vZGUgLSBQcmV2ZW50IGNoYW5nZXMgb24gdGhpcyBOb2RlXG4gKi9cbmNvbnN0IGFzc2VydE5vQWRkaXRpb25hbENoaWxkcmVuID0gZnVuY3Rpb24oIG5vZGU6IE5vZGUgKTogdm9pZCB7XG4gIGlmICggYXNzZXJ0ICkge1xuXG4gICAgbm9kZS5pbnNlcnRDaGlsZCA9IGZ1bmN0aW9uKCBpbmRleDogbnVtYmVyLCBub2RlOiBOb2RlLCBpc0NvbXBvc2l0ZT86IGJvb2xlYW4gKTogTm9kZSB7XG4gICAgICBhc3NlcnQgJiYgYXNzZXJ0KCBmYWxzZSwgJ0F0dGVtcHQgdG8gaW5zZXJ0IGNoaWxkIGludG8gTGVhZicgKTtcbiAgICAgIHJldHVybiBub2RlO1xuICAgIH07XG4gIH1cbn07XG5cbmV4cG9ydCBkZWZhdWx0IGFzc2VydE5vQWRkaXRpb25hbENoaWxkcmVuOyJdLCJuYW1lcyI6WyJhc3NlcnROb0FkZGl0aW9uYWxDaGlsZHJlbiIsIm5vZGUiLCJhc3NlcnQiLCJpbnNlcnRDaGlsZCIsImluZGV4IiwiaXNDb21wb3NpdGUiXSwibWFwcGluZ3MiOiJBQUFBLGlEQUFpRDtBQUVqRDs7Ozs7Ozs7Ozs7Ozs7O0NBZUMsR0FJRDs7Q0FFQyxHQUNELE1BQU1BLDZCQUE2QixTQUFVQyxJQUFVO0lBQ3JELElBQUtDLFFBQVM7UUFFWkQsS0FBS0UsV0FBVyxHQUFHLFNBQVVDLEtBQWEsRUFBRUgsSUFBVSxFQUFFSSxXQUFxQjtZQUMzRUgsVUFBVUEsT0FBUSxPQUFPO1lBQ3pCLE9BQU9EO1FBQ1Q7SUFDRjtBQUNGO0FBRUEsZUFBZUQsMkJBQTJCIn0=