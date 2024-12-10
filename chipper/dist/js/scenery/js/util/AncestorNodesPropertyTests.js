// Copyright 2023-2024, University of Colorado Boulder
/**
 * QUnit tests for AncestorNodesPropertyTests
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ import { AncestorNodesProperty, Node } from '../imports.js';
QUnit.module('AncestorNodesProperty');
QUnit.test('AncestorNodesProperty', (assert)=>{
    const a = new Node();
    const b = new Node();
    const c = new Node();
    const d = new Node();
    b.addChild(a);
    const ancestorNodesProperty = new AncestorNodesProperty(a);
    assert.ok(ancestorNodesProperty.valueComparisonStrategy !== 'reference', 'uses custom comparison');
    const checkAncestors = (nodes, message)=>{
        assert.ok(ancestorNodesProperty.value.size === nodes.length, message);
        nodes.forEach((node)=>{
            assert.ok(ancestorNodesProperty.value.has(node), message);
        });
    };
    // b -> a
    checkAncestors([
        b
    ], 'initial');
    // a
    b.removeChild(a);
    checkAncestors([], 'removed from b');
    // c -> b -> a
    c.addChild(b);
    b.addChild(a);
    checkAncestors([
        b,
        c
    ], 'added two at a time');
    //    b
    //  /   \
    // c ->  a
    c.addChild(a);
    checkAncestors([
        b,
        c
    ], 'DAG, still the same');
    //    b
    //  /
    // c ->  a
    b.removeChild(a);
    checkAncestors([
        c
    ], 'only c directly');
    //         b
    //       /
    // d -> c ->  a
    d.addChild(c);
    checkAncestors([
        c,
        d
    ], 'added ancestor!');
    //    b
    //     \
    // d -> c ->  a
    c.removeChild(b);
    b.addChild(c);
    checkAncestors([
        b,
        c,
        d
    ], 'moved b to ancestor');
    // a
    c.removeChild(a);
    checkAncestors([], 'nothing');
    //    b
    //     \
    // d -> c ->  a
    c.addChild(a);
    checkAncestors([
        b,
        c,
        d
    ], 'back');
    ancestorNodesProperty.dispose();
});

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvdXRpbC9BbmNlc3Rvck5vZGVzUHJvcGVydHlUZXN0cy50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAyMy0yMDI0LCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcblxuLyoqXG4gKiBRVW5pdCB0ZXN0cyBmb3IgQW5jZXN0b3JOb2Rlc1Byb3BlcnR5VGVzdHNcbiAqXG4gKiBAYXV0aG9yIEpvbmF0aGFuIE9sc29uIDxqb25hdGhhbi5vbHNvbkBjb2xvcmFkby5lZHU+XG4gKi9cblxuaW1wb3J0IHsgQW5jZXN0b3JOb2Rlc1Byb3BlcnR5LCBOb2RlIH0gZnJvbSAnLi4vaW1wb3J0cy5qcyc7XG5cblFVbml0Lm1vZHVsZSggJ0FuY2VzdG9yTm9kZXNQcm9wZXJ0eScgKTtcblxuUVVuaXQudGVzdCggJ0FuY2VzdG9yTm9kZXNQcm9wZXJ0eScsIGFzc2VydCA9PiB7XG5cbiAgY29uc3QgYSA9IG5ldyBOb2RlKCk7XG4gIGNvbnN0IGIgPSBuZXcgTm9kZSgpO1xuICBjb25zdCBjID0gbmV3IE5vZGUoKTtcbiAgY29uc3QgZCA9IG5ldyBOb2RlKCk7XG5cbiAgYi5hZGRDaGlsZCggYSApO1xuXG4gIGNvbnN0IGFuY2VzdG9yTm9kZXNQcm9wZXJ0eSA9IG5ldyBBbmNlc3Rvck5vZGVzUHJvcGVydHkoIGEgKTtcblxuICBhc3NlcnQub2soIGFuY2VzdG9yTm9kZXNQcm9wZXJ0eS52YWx1ZUNvbXBhcmlzb25TdHJhdGVneSAhPT0gJ3JlZmVyZW5jZScsICd1c2VzIGN1c3RvbSBjb21wYXJpc29uJyApO1xuXG4gIGNvbnN0IGNoZWNrQW5jZXN0b3JzID0gKCBub2RlczogTm9kZVtdLCBtZXNzYWdlOiBzdHJpbmcgKSA9PiB7XG4gICAgYXNzZXJ0Lm9rKCBhbmNlc3Rvck5vZGVzUHJvcGVydHkudmFsdWUuc2l6ZSA9PT0gbm9kZXMubGVuZ3RoLCBtZXNzYWdlICk7XG5cbiAgICBub2Rlcy5mb3JFYWNoKCBub2RlID0+IHtcbiAgICAgIGFzc2VydC5vayggYW5jZXN0b3JOb2Rlc1Byb3BlcnR5LnZhbHVlLmhhcyggbm9kZSApLCBtZXNzYWdlICk7XG4gICAgfSApO1xuICB9O1xuXG4gIC8vIGIgLT4gYVxuICBjaGVja0FuY2VzdG9ycyggWyBiIF0sICdpbml0aWFsJyApO1xuXG4gIC8vIGFcbiAgYi5yZW1vdmVDaGlsZCggYSApO1xuICBjaGVja0FuY2VzdG9ycyggW10sICdyZW1vdmVkIGZyb20gYicgKTtcblxuICAvLyBjIC0+IGIgLT4gYVxuICBjLmFkZENoaWxkKCBiICk7XG4gIGIuYWRkQ2hpbGQoIGEgKTtcbiAgY2hlY2tBbmNlc3RvcnMoIFsgYiwgYyBdLCAnYWRkZWQgdHdvIGF0IGEgdGltZScgKTtcblxuICAvLyAgICBiXG4gIC8vICAvICAgXFxcbiAgLy8gYyAtPiAgYVxuICBjLmFkZENoaWxkKCBhICk7XG4gIGNoZWNrQW5jZXN0b3JzKCBbIGIsIGMgXSwgJ0RBRywgc3RpbGwgdGhlIHNhbWUnICk7XG5cbiAgLy8gICAgYlxuICAvLyAgL1xuICAvLyBjIC0+ICBhXG4gIGIucmVtb3ZlQ2hpbGQoIGEgKTtcbiAgY2hlY2tBbmNlc3RvcnMoIFsgYyBdLCAnb25seSBjIGRpcmVjdGx5JyApO1xuXG4gIC8vICAgICAgICAgYlxuICAvLyAgICAgICAvXG4gIC8vIGQgLT4gYyAtPiAgYVxuICBkLmFkZENoaWxkKCBjICk7XG4gIGNoZWNrQW5jZXN0b3JzKCBbIGMsIGQgXSwgJ2FkZGVkIGFuY2VzdG9yIScgKTtcblxuICAvLyAgICBiXG4gIC8vICAgICBcXFxuICAvLyBkIC0+IGMgLT4gIGFcbiAgYy5yZW1vdmVDaGlsZCggYiApO1xuICBiLmFkZENoaWxkKCBjICk7XG4gIGNoZWNrQW5jZXN0b3JzKCBbIGIsIGMsIGQgXSwgJ21vdmVkIGIgdG8gYW5jZXN0b3InICk7XG5cbiAgLy8gYVxuICBjLnJlbW92ZUNoaWxkKCBhICk7XG4gIGNoZWNrQW5jZXN0b3JzKCBbXSwgJ25vdGhpbmcnICk7XG5cbiAgLy8gICAgYlxuICAvLyAgICAgXFxcbiAgLy8gZCAtPiBjIC0+ICBhXG4gIGMuYWRkQ2hpbGQoIGEgKTtcbiAgY2hlY2tBbmNlc3RvcnMoIFsgYiwgYywgZCBdLCAnYmFjaycgKTtcblxuICBhbmNlc3Rvck5vZGVzUHJvcGVydHkuZGlzcG9zZSgpO1xufSApOyJdLCJuYW1lcyI6WyJBbmNlc3Rvck5vZGVzUHJvcGVydHkiLCJOb2RlIiwiUVVuaXQiLCJtb2R1bGUiLCJ0ZXN0IiwiYXNzZXJ0IiwiYSIsImIiLCJjIiwiZCIsImFkZENoaWxkIiwiYW5jZXN0b3JOb2Rlc1Byb3BlcnR5Iiwib2siLCJ2YWx1ZUNvbXBhcmlzb25TdHJhdGVneSIsImNoZWNrQW5jZXN0b3JzIiwibm9kZXMiLCJtZXNzYWdlIiwidmFsdWUiLCJzaXplIiwibGVuZ3RoIiwiZm9yRWFjaCIsIm5vZGUiLCJoYXMiLCJyZW1vdmVDaGlsZCIsImRpc3Bvc2UiXSwibWFwcGluZ3MiOiJBQUFBLHNEQUFzRDtBQUV0RDs7OztDQUlDLEdBRUQsU0FBU0EscUJBQXFCLEVBQUVDLElBQUksUUFBUSxnQkFBZ0I7QUFFNURDLE1BQU1DLE1BQU0sQ0FBRTtBQUVkRCxNQUFNRSxJQUFJLENBQUUseUJBQXlCQyxDQUFBQTtJQUVuQyxNQUFNQyxJQUFJLElBQUlMO0lBQ2QsTUFBTU0sSUFBSSxJQUFJTjtJQUNkLE1BQU1PLElBQUksSUFBSVA7SUFDZCxNQUFNUSxJQUFJLElBQUlSO0lBRWRNLEVBQUVHLFFBQVEsQ0FBRUo7SUFFWixNQUFNSyx3QkFBd0IsSUFBSVgsc0JBQXVCTTtJQUV6REQsT0FBT08sRUFBRSxDQUFFRCxzQkFBc0JFLHVCQUF1QixLQUFLLGFBQWE7SUFFMUUsTUFBTUMsaUJBQWlCLENBQUVDLE9BQWVDO1FBQ3RDWCxPQUFPTyxFQUFFLENBQUVELHNCQUFzQk0sS0FBSyxDQUFDQyxJQUFJLEtBQUtILE1BQU1JLE1BQU0sRUFBRUg7UUFFOURELE1BQU1LLE9BQU8sQ0FBRUMsQ0FBQUE7WUFDYmhCLE9BQU9PLEVBQUUsQ0FBRUQsc0JBQXNCTSxLQUFLLENBQUNLLEdBQUcsQ0FBRUQsT0FBUUw7UUFDdEQ7SUFDRjtJQUVBLFNBQVM7SUFDVEYsZUFBZ0I7UUFBRVA7S0FBRyxFQUFFO0lBRXZCLElBQUk7SUFDSkEsRUFBRWdCLFdBQVcsQ0FBRWpCO0lBQ2ZRLGVBQWdCLEVBQUUsRUFBRTtJQUVwQixjQUFjO0lBQ2ROLEVBQUVFLFFBQVEsQ0FBRUg7SUFDWkEsRUFBRUcsUUFBUSxDQUFFSjtJQUNaUSxlQUFnQjtRQUFFUDtRQUFHQztLQUFHLEVBQUU7SUFFMUIsT0FBTztJQUNQLFNBQVM7SUFDVCxVQUFVO0lBQ1ZBLEVBQUVFLFFBQVEsQ0FBRUo7SUFDWlEsZUFBZ0I7UUFBRVA7UUFBR0M7S0FBRyxFQUFFO0lBRTFCLE9BQU87SUFDUCxLQUFLO0lBQ0wsVUFBVTtJQUNWRCxFQUFFZ0IsV0FBVyxDQUFFakI7SUFDZlEsZUFBZ0I7UUFBRU47S0FBRyxFQUFFO0lBRXZCLFlBQVk7SUFDWixVQUFVO0lBQ1YsZUFBZTtJQUNmQyxFQUFFQyxRQUFRLENBQUVGO0lBQ1pNLGVBQWdCO1FBQUVOO1FBQUdDO0tBQUcsRUFBRTtJQUUxQixPQUFPO0lBQ1AsUUFBUTtJQUNSLGVBQWU7SUFDZkQsRUFBRWUsV0FBVyxDQUFFaEI7SUFDZkEsRUFBRUcsUUFBUSxDQUFFRjtJQUNaTSxlQUFnQjtRQUFFUDtRQUFHQztRQUFHQztLQUFHLEVBQUU7SUFFN0IsSUFBSTtJQUNKRCxFQUFFZSxXQUFXLENBQUVqQjtJQUNmUSxlQUFnQixFQUFFLEVBQUU7SUFFcEIsT0FBTztJQUNQLFFBQVE7SUFDUixlQUFlO0lBQ2ZOLEVBQUVFLFFBQVEsQ0FBRUo7SUFDWlEsZUFBZ0I7UUFBRVA7UUFBR0M7UUFBR0M7S0FBRyxFQUFFO0lBRTdCRSxzQkFBc0JhLE9BQU87QUFDL0IifQ==