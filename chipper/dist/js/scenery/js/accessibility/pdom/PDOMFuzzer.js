// Copyright 2018-2023, University of Colorado Boulder
/**
 * Runs PDOM-tree-related scenery operations randomly (with assertions) to try to find any bugs.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */ import Permutation from '../../../../dot/js/Permutation.js';
import Random from '../../../../dot/js/Random.js';
import arrayDifference from '../../../../phet-core/js/arrayDifference.js';
import { Display, Node, PDOMTree, scenery } from '../../imports.js';
let PDOMFuzzer = class PDOMFuzzer {
    /**
   * Runs one action randomly (printing out the action and result).
   * @public
   */ step() {
        const action = this.random.sample(this.enumerateActions());
        this.logToConsole && console.log(action.text);
        this.actionsTaken.push(action);
        action.execute();
        this.display._rootPDOMInstance.auditRoot();
        PDOMTree.auditPDOMDisplays(this.display.rootNode);
        if (this.logToConsole) {
            for(let i = 0; i < this.nodes.length; i++){
                const node = this.nodes[i];
                console.log(`${i}#${node.id} ${node.tagName} ch:${PDOMTree.debugOrder(node.children)} or:${PDOMTree.debugOrder(node.pdomOrder)} vis:${node.visible} avis:${node.pdomVisible}`);
            }
        }
    }
    /**
   * Find all of the possible actions that are legal.
   * @private
   *
   * @returns {Array.<Object>} - like { text: {string}, execute: {function} }
   */ enumerateActions() {
        const actions = [];
        this.nodes.forEach((a)=>{
            actions.push({
                text: `#${a.id}.visible = ${!a.visible}`,
                execute: ()=>{
                    a.visible = !a.visible;
                }
            });
            actions.push({
                text: `#${a.id}.pdomVisible = ${!a.pdomVisible}`,
                execute: ()=>{
                    a.pdomVisible = !a.pdomVisible;
                }
            });
            [
                'span',
                'div',
                null
            ].forEach((tagName)=>{
                if (a.tagName !== tagName) {
                    actions.push({
                        text: `#${a.id}.tagName = ${tagName}`,
                        execute: ()=>{
                            a.tagName = tagName;
                        }
                    });
                }
            });
            this.powerSet(arrayDifference(this.nodes, [
                a
            ]).concat([
                null
            ])).forEach((subset)=>{
                Permutation.forEachPermutation(subset, (order)=>{
                    // TODO: Make sure it's not the CURRENT order? https://github.com/phetsims/scenery/issues/1581
                    if (this.isPDOMOrderChangeLegal(a, order)) {
                        actions.push({
                            text: `#${a.id}.pdomOrder = ${PDOMTree.debugOrder(order)}`,
                            execute: ()=>{
                                a.pdomOrder = order;
                            }
                        });
                    }
                });
            });
            this.nodes.forEach((b)=>{
                if (this.isAddChildLegal(a, b)) {
                    _.range(0, a.children.length + 1).forEach((i)=>{
                        actions.push({
                            text: `#${a.id}.insertChild(${i},#${b.id})`,
                            execute: ()=>{
                                a.insertChild(i, b);
                            }
                        });
                    });
                }
                if (a.hasChild(b)) {
                    actions.push({
                        text: `#${a.id}.removeChild(#${b.id})`,
                        execute: ()=>{
                            a.removeChild(b);
                        }
                    });
                }
            });
        });
        return actions;
    }
    /**
   * Checks whether the child can be added (as a child) to the parent.
   * @private
   *
   * @param {Node} parent
   * @param {Node} child
   * @returns {boolean}
   */ isAddChildLegal(parent, child) {
        return !parent.hasChild(child) && this.isAcyclic(parent, child);
    }
    /**
   * Returns the power set of a set (all subsets).
   * @private
   *
   * @param {Array.<*>} list
   * @returns {Array.<Array.<*>>}
   */ powerSet(list) {
        if (list.length === 0) {
            return [
                []
            ];
        } else {
            const lists = this.powerSet(list.slice(1));
            return lists.concat(lists.map((subList)=>[
                    list[0]
                ].concat(subList)));
        }
    }
    /**
   * Returns whether an accessible order change is legal.
   * @private
   *
   * @param {Node} node
   * @param {Array.<Node|null>|null} order
   */ isPDOMOrderChangeLegal(node, order) {
        // remap for equivalence, so it's an array of nodes
        if (order === null) {
            order = [];
        }
        order = order.filter((n)=>n !== null);
        if (_.includes(order, node) || _.uniq(order).length < order.length) {
            return false;
        }
        // Can't include nodes that are included in other accessible orders
        for(let i = 0; i < order.length; i++){
            if (order[i]._pdomParent && order[i]._pdomParent !== node) {
                return false;
            }
        }
        const hasConnection = (a, b)=>{
            if (a === node) {
                return a.hasChild(b) || _.includes(order, b);
            } else {
                return a.hasChild(b) || !!a.pdomOrder && _.includes(a.pdomOrder, b);
            }
        };
        const effectiveChildren = node.children.concat(order);
        return _.every(effectiveChildren, (child)=>this.isAcyclic(node, child, hasConnection));
    }
    /**
   * Checks whether a connection (parent-child or accessible order) is legal (doesn't cause a cycle).
   * @private
   *
   * @param {Node} parent
   * @param {Node} child
   * @param {function} hasConnection - determines whether there is a parent-child-style relationship between params
   * @returns {boolean}
   */ isAcyclic(parent, child, hasConnection) {
        if (parent === child) {
            return false;
        }
        const nodes = child.children.concat(child.pdomOrder).filter((n)=>n !== null); // super defensive
        while(nodes.length){
            const node = nodes.pop();
            if (node === parent) {
                return false;
            }
            if (hasConnection) {
                this.nodes.forEach((potentialChild)=>{
                    if (hasConnection(node, potentialChild)) {
                        nodes.push(potentialChild);
                    }
                });
            } else {
                // Add in children and accessible children (don't worry about duplicates since perf isn't critical)
                Array.prototype.push.apply(nodes, node.children);
                if (node.pdomOrder) {
                    Array.prototype.push.apply(nodes, node.pdomOrder.filter((n)=>n !== null));
                }
            }
        }
        return true;
    }
    /**
   * Releases references
   * @public
   */ dispose() {
        this.display.dispose();
    }
    /**
   * @param {number} nodeCount
   * @param {boolean} logToConsole
   * @param {number} [seed]
   */ constructor(nodeCount, logToConsole, seed){
        assert && assert(nodeCount >= 2);
        seed = seed || null;
        // @private {number}
        this.nodeCount = nodeCount;
        // @private {boolean}
        this.logToConsole = logToConsole;
        // @private {Array.<Node>}
        this.nodes = _.range(0, nodeCount).map(()=>new Node());
        // @private {Display}
        this.display = new Display(this.nodes[0]);
        // @private {Random}
        this.random = new Random({
            seed: seed
        });
        // @private {Array.<Action>}
        this.actionsTaken = [];
    }
};
scenery.register('PDOMFuzzer', PDOMFuzzer);
export default PDOMFuzzer;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvYWNjZXNzaWJpbGl0eS9wZG9tL1BET01GdXp6ZXIuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTgtMjAyMywgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbi8qKlxuICogUnVucyBQRE9NLXRyZWUtcmVsYXRlZCBzY2VuZXJ5IG9wZXJhdGlvbnMgcmFuZG9tbHkgKHdpdGggYXNzZXJ0aW9ucykgdG8gdHJ5IHRvIGZpbmQgYW55IGJ1Z3MuXG4gKlxuICogQGF1dGhvciBKb25hdGhhbiBPbHNvbiA8am9uYXRoYW4ub2xzb25AY29sb3JhZG8uZWR1PlxuICovXG5cbmltcG9ydCBQZXJtdXRhdGlvbiBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvUGVybXV0YXRpb24uanMnO1xuaW1wb3J0IFJhbmRvbSBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvUmFuZG9tLmpzJztcbmltcG9ydCBhcnJheURpZmZlcmVuY2UgZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL2FycmF5RGlmZmVyZW5jZS5qcyc7XG5pbXBvcnQgeyBEaXNwbGF5LCBOb2RlLCBQRE9NVHJlZSwgc2NlbmVyeSB9IGZyb20gJy4uLy4uL2ltcG9ydHMuanMnO1xuXG5jbGFzcyBQRE9NRnV6emVyIHtcbiAgLyoqXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBub2RlQ291bnRcbiAgICogQHBhcmFtIHtib29sZWFufSBsb2dUb0NvbnNvbGVcbiAgICogQHBhcmFtIHtudW1iZXJ9IFtzZWVkXVxuICAgKi9cbiAgY29uc3RydWN0b3IoIG5vZGVDb3VudCwgbG9nVG9Db25zb2xlLCBzZWVkICkge1xuICAgIGFzc2VydCAmJiBhc3NlcnQoIG5vZGVDb3VudCA+PSAyICk7XG5cbiAgICBzZWVkID0gc2VlZCB8fCBudWxsO1xuXG4gICAgLy8gQHByaXZhdGUge251bWJlcn1cbiAgICB0aGlzLm5vZGVDb3VudCA9IG5vZGVDb3VudDtcblxuICAgIC8vIEBwcml2YXRlIHtib29sZWFufVxuICAgIHRoaXMubG9nVG9Db25zb2xlID0gbG9nVG9Db25zb2xlO1xuXG4gICAgLy8gQHByaXZhdGUge0FycmF5LjxOb2RlPn1cbiAgICB0aGlzLm5vZGVzID0gXy5yYW5nZSggMCwgbm9kZUNvdW50ICkubWFwKCAoKSA9PiBuZXcgTm9kZSgpICk7XG5cbiAgICAvLyBAcHJpdmF0ZSB7RGlzcGxheX1cbiAgICB0aGlzLmRpc3BsYXkgPSBuZXcgRGlzcGxheSggdGhpcy5ub2Rlc1sgMCBdICk7XG5cbiAgICAvLyBAcHJpdmF0ZSB7UmFuZG9tfVxuICAgIHRoaXMucmFuZG9tID0gbmV3IFJhbmRvbSggeyBzZWVkOiBzZWVkIH0gKTtcblxuICAgIC8vIEBwcml2YXRlIHtBcnJheS48QWN0aW9uPn1cbiAgICB0aGlzLmFjdGlvbnNUYWtlbiA9IFtdO1xuICB9XG5cbiAgLyoqXG4gICAqIFJ1bnMgb25lIGFjdGlvbiByYW5kb21seSAocHJpbnRpbmcgb3V0IHRoZSBhY3Rpb24gYW5kIHJlc3VsdCkuXG4gICAqIEBwdWJsaWNcbiAgICovXG4gIHN0ZXAoKSB7XG4gICAgY29uc3QgYWN0aW9uID0gdGhpcy5yYW5kb20uc2FtcGxlKCB0aGlzLmVudW1lcmF0ZUFjdGlvbnMoKSApO1xuICAgIHRoaXMubG9nVG9Db25zb2xlICYmIGNvbnNvbGUubG9nKCBhY3Rpb24udGV4dCApO1xuICAgIHRoaXMuYWN0aW9uc1Rha2VuLnB1c2goIGFjdGlvbiApO1xuICAgIGFjdGlvbi5leGVjdXRlKCk7XG4gICAgdGhpcy5kaXNwbGF5Ll9yb290UERPTUluc3RhbmNlLmF1ZGl0Um9vdCgpO1xuICAgIFBET01UcmVlLmF1ZGl0UERPTURpc3BsYXlzKCB0aGlzLmRpc3BsYXkucm9vdE5vZGUgKTtcbiAgICBpZiAoIHRoaXMubG9nVG9Db25zb2xlICkge1xuICAgICAgZm9yICggbGV0IGkgPSAwOyBpIDwgdGhpcy5ub2Rlcy5sZW5ndGg7IGkrKyApIHtcbiAgICAgICAgY29uc3Qgbm9kZSA9IHRoaXMubm9kZXNbIGkgXTtcbiAgICAgICAgY29uc29sZS5sb2coIGAke2l9IyR7bm9kZS5pZH0gJHtub2RlLnRhZ05hbWV9IGNoOiR7UERPTVRyZWUuZGVidWdPcmRlciggbm9kZS5jaGlsZHJlbiApfSBvcjoke1BET01UcmVlLmRlYnVnT3JkZXIoIG5vZGUucGRvbU9yZGVyICl9IHZpczoke25vZGUudmlzaWJsZX0gYXZpczoke25vZGUucGRvbVZpc2libGV9YCApO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBGaW5kIGFsbCBvZiB0aGUgcG9zc2libGUgYWN0aW9ucyB0aGF0IGFyZSBsZWdhbC5cbiAgICogQHByaXZhdGVcbiAgICpcbiAgICogQHJldHVybnMge0FycmF5LjxPYmplY3Q+fSAtIGxpa2UgeyB0ZXh0OiB7c3RyaW5nfSwgZXhlY3V0ZToge2Z1bmN0aW9ufSB9XG4gICAqL1xuICBlbnVtZXJhdGVBY3Rpb25zKCkge1xuICAgIGNvbnN0IGFjdGlvbnMgPSBbXTtcblxuICAgIHRoaXMubm9kZXMuZm9yRWFjaCggYSA9PiB7XG4gICAgICBhY3Rpb25zLnB1c2goIHtcbiAgICAgICAgdGV4dDogYCMke2EuaWR9LnZpc2libGUgPSAkeyFhLnZpc2libGV9YCxcbiAgICAgICAgZXhlY3V0ZTogKCkgPT4ge1xuICAgICAgICAgIGEudmlzaWJsZSA9ICFhLnZpc2libGU7XG4gICAgICAgIH1cbiAgICAgIH0gKTtcbiAgICAgIGFjdGlvbnMucHVzaCgge1xuICAgICAgICB0ZXh0OiBgIyR7YS5pZH0ucGRvbVZpc2libGUgPSAkeyFhLnBkb21WaXNpYmxlfWAsXG4gICAgICAgIGV4ZWN1dGU6ICgpID0+IHtcbiAgICAgICAgICBhLnBkb21WaXNpYmxlID0gIWEucGRvbVZpc2libGU7XG4gICAgICAgIH1cbiAgICAgIH0gKTtcbiAgICAgIFsgJ3NwYW4nLCAnZGl2JywgbnVsbCBdLmZvckVhY2goIHRhZ05hbWUgPT4ge1xuICAgICAgICBpZiAoIGEudGFnTmFtZSAhPT0gdGFnTmFtZSApIHtcbiAgICAgICAgICBhY3Rpb25zLnB1c2goIHtcbiAgICAgICAgICAgIHRleHQ6IGAjJHthLmlkfS50YWdOYW1lID0gJHt0YWdOYW1lfWAsXG4gICAgICAgICAgICBleGVjdXRlOiAoKSA9PiB7XG4gICAgICAgICAgICAgIGEudGFnTmFtZSA9IHRhZ05hbWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSApO1xuICAgICAgICB9XG4gICAgICB9ICk7XG5cbiAgICAgIHRoaXMucG93ZXJTZXQoIGFycmF5RGlmZmVyZW5jZSggdGhpcy5ub2RlcywgWyBhIF0gKS5jb25jYXQoIFsgbnVsbCBdICkgKS5mb3JFYWNoKCBzdWJzZXQgPT4ge1xuICAgICAgICBQZXJtdXRhdGlvbi5mb3JFYWNoUGVybXV0YXRpb24oIHN1YnNldCwgb3JkZXIgPT4ge1xuICAgICAgICAgIC8vIFRPRE86IE1ha2Ugc3VyZSBpdCdzIG5vdCB0aGUgQ1VSUkVOVCBvcmRlcj8gaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3NjZW5lcnkvaXNzdWVzLzE1ODFcbiAgICAgICAgICBpZiAoIHRoaXMuaXNQRE9NT3JkZXJDaGFuZ2VMZWdhbCggYSwgb3JkZXIgKSApIHtcbiAgICAgICAgICAgIGFjdGlvbnMucHVzaCgge1xuICAgICAgICAgICAgICB0ZXh0OiBgIyR7YS5pZH0ucGRvbU9yZGVyID0gJHtQRE9NVHJlZS5kZWJ1Z09yZGVyKCBvcmRlciApfWAsXG4gICAgICAgICAgICAgIGV4ZWN1dGU6ICgpID0+IHtcbiAgICAgICAgICAgICAgICBhLnBkb21PcmRlciA9IG9yZGVyO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9ICk7XG4gICAgICAgICAgfVxuICAgICAgICB9ICk7XG4gICAgICB9ICk7XG5cbiAgICAgIHRoaXMubm9kZXMuZm9yRWFjaCggYiA9PiB7XG4gICAgICAgIGlmICggdGhpcy5pc0FkZENoaWxkTGVnYWwoIGEsIGIgKSApIHtcbiAgICAgICAgICBfLnJhbmdlKCAwLCBhLmNoaWxkcmVuLmxlbmd0aCArIDEgKS5mb3JFYWNoKCBpID0+IHtcbiAgICAgICAgICAgIGFjdGlvbnMucHVzaCgge1xuICAgICAgICAgICAgICB0ZXh0OiBgIyR7YS5pZH0uaW5zZXJ0Q2hpbGQoJHtpfSwjJHtiLmlkfSlgLFxuICAgICAgICAgICAgICBleGVjdXRlOiAoKSA9PiB7XG4gICAgICAgICAgICAgICAgYS5pbnNlcnRDaGlsZCggaSwgYiApO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9ICk7XG4gICAgICAgICAgfSApO1xuICAgICAgICB9XG4gICAgICAgIGlmICggYS5oYXNDaGlsZCggYiApICkge1xuICAgICAgICAgIGFjdGlvbnMucHVzaCgge1xuICAgICAgICAgICAgdGV4dDogYCMke2EuaWR9LnJlbW92ZUNoaWxkKCMke2IuaWR9KWAsXG4gICAgICAgICAgICBleGVjdXRlOiAoKSA9PiB7XG4gICAgICAgICAgICAgIGEucmVtb3ZlQ2hpbGQoIGIgKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9ICk7XG4gICAgICAgIH1cbiAgICAgIH0gKTtcbiAgICB9ICk7XG5cbiAgICByZXR1cm4gYWN0aW9ucztcbiAgfVxuXG4gIC8qKlxuICAgKiBDaGVja3Mgd2hldGhlciB0aGUgY2hpbGQgY2FuIGJlIGFkZGVkIChhcyBhIGNoaWxkKSB0byB0aGUgcGFyZW50LlxuICAgKiBAcHJpdmF0ZVxuICAgKlxuICAgKiBAcGFyYW0ge05vZGV9IHBhcmVudFxuICAgKiBAcGFyYW0ge05vZGV9IGNoaWxkXG4gICAqIEByZXR1cm5zIHtib29sZWFufVxuICAgKi9cbiAgaXNBZGRDaGlsZExlZ2FsKCBwYXJlbnQsIGNoaWxkICkge1xuICAgIHJldHVybiAhcGFyZW50Lmhhc0NoaWxkKCBjaGlsZCApICYmIHRoaXMuaXNBY3ljbGljKCBwYXJlbnQsIGNoaWxkICk7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgcG93ZXIgc2V0IG9mIGEgc2V0IChhbGwgc3Vic2V0cykuXG4gICAqIEBwcml2YXRlXG4gICAqXG4gICAqIEBwYXJhbSB7QXJyYXkuPCo+fSBsaXN0XG4gICAqIEByZXR1cm5zIHtBcnJheS48QXJyYXkuPCo+Pn1cbiAgICovXG4gIHBvd2VyU2V0KCBsaXN0ICkge1xuICAgIGlmICggbGlzdC5sZW5ndGggPT09IDAgKSB7XG4gICAgICByZXR1cm4gWyBbXSBdO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIGNvbnN0IGxpc3RzID0gdGhpcy5wb3dlclNldCggbGlzdC5zbGljZSggMSApICk7XG4gICAgICByZXR1cm4gbGlzdHMuY29uY2F0KCBsaXN0cy5tYXAoIHN1Ykxpc3QgPT4gWyBsaXN0WyAwIF0gXS5jb25jYXQoIHN1Ykxpc3QgKSApICk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgd2hldGhlciBhbiBhY2Nlc3NpYmxlIG9yZGVyIGNoYW5nZSBpcyBsZWdhbC5cbiAgICogQHByaXZhdGVcbiAgICpcbiAgICogQHBhcmFtIHtOb2RlfSBub2RlXG4gICAqIEBwYXJhbSB7QXJyYXkuPE5vZGV8bnVsbD58bnVsbH0gb3JkZXJcbiAgICovXG4gIGlzUERPTU9yZGVyQ2hhbmdlTGVnYWwoIG5vZGUsIG9yZGVyICkge1xuICAgIC8vIHJlbWFwIGZvciBlcXVpdmFsZW5jZSwgc28gaXQncyBhbiBhcnJheSBvZiBub2Rlc1xuICAgIGlmICggb3JkZXIgPT09IG51bGwgKSB7IG9yZGVyID0gW107IH1cbiAgICBvcmRlciA9IG9yZGVyLmZpbHRlciggbiA9PiBuICE9PSBudWxsICk7XG5cbiAgICBpZiAoIF8uaW5jbHVkZXMoIG9yZGVyLCBub2RlICkgfHxcbiAgICAgICAgIF8udW5pcSggb3JkZXIgKS5sZW5ndGggPCBvcmRlci5sZW5ndGggKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgLy8gQ2FuJ3QgaW5jbHVkZSBub2RlcyB0aGF0IGFyZSBpbmNsdWRlZCBpbiBvdGhlciBhY2Nlc3NpYmxlIG9yZGVyc1xuICAgIGZvciAoIGxldCBpID0gMDsgaSA8IG9yZGVyLmxlbmd0aDsgaSsrICkge1xuICAgICAgaWYgKCBvcmRlclsgaSBdLl9wZG9tUGFyZW50ICYmIG9yZGVyWyBpIF0uX3Bkb21QYXJlbnQgIT09IG5vZGUgKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBjb25zdCBoYXNDb25uZWN0aW9uID0gKCBhLCBiICkgPT4ge1xuICAgICAgaWYgKCBhID09PSBub2RlICkge1xuICAgICAgICByZXR1cm4gYS5oYXNDaGlsZCggYiApIHx8IF8uaW5jbHVkZXMoIG9yZGVyLCBiICk7XG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgcmV0dXJuIGEuaGFzQ2hpbGQoIGIgKSB8fCAoICEhYS5wZG9tT3JkZXIgJiYgXy5pbmNsdWRlcyggYS5wZG9tT3JkZXIsIGIgKSApO1xuICAgICAgfVxuICAgIH07XG5cbiAgICBjb25zdCBlZmZlY3RpdmVDaGlsZHJlbiA9IG5vZGUuY2hpbGRyZW4uY29uY2F0KCBvcmRlciApO1xuICAgIHJldHVybiBfLmV2ZXJ5KCBlZmZlY3RpdmVDaGlsZHJlbiwgY2hpbGQgPT4gdGhpcy5pc0FjeWNsaWMoIG5vZGUsIGNoaWxkLCBoYXNDb25uZWN0aW9uICkgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDaGVja3Mgd2hldGhlciBhIGNvbm5lY3Rpb24gKHBhcmVudC1jaGlsZCBvciBhY2Nlc3NpYmxlIG9yZGVyKSBpcyBsZWdhbCAoZG9lc24ndCBjYXVzZSBhIGN5Y2xlKS5cbiAgICogQHByaXZhdGVcbiAgICpcbiAgICogQHBhcmFtIHtOb2RlfSBwYXJlbnRcbiAgICogQHBhcmFtIHtOb2RlfSBjaGlsZFxuICAgKiBAcGFyYW0ge2Z1bmN0aW9ufSBoYXNDb25uZWN0aW9uIC0gZGV0ZXJtaW5lcyB3aGV0aGVyIHRoZXJlIGlzIGEgcGFyZW50LWNoaWxkLXN0eWxlIHJlbGF0aW9uc2hpcCBiZXR3ZWVuIHBhcmFtc1xuICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAgICovXG4gIGlzQWN5Y2xpYyggcGFyZW50LCBjaGlsZCwgaGFzQ29ubmVjdGlvbiApIHtcbiAgICBpZiAoIHBhcmVudCA9PT0gY2hpbGQgKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgY29uc3Qgbm9kZXMgPSBjaGlsZC5jaGlsZHJlbi5jb25jYXQoIGNoaWxkLnBkb21PcmRlciApLmZpbHRlciggbiA9PiBuICE9PSBudWxsICk7IC8vIHN1cGVyIGRlZmVuc2l2ZVxuXG4gICAgd2hpbGUgKCBub2Rlcy5sZW5ndGggKSB7XG4gICAgICBjb25zdCBub2RlID0gbm9kZXMucG9wKCk7XG4gICAgICBpZiAoIG5vZGUgPT09IHBhcmVudCApIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuXG4gICAgICBpZiAoIGhhc0Nvbm5lY3Rpb24gKSB7XG4gICAgICAgIHRoaXMubm9kZXMuZm9yRWFjaCggcG90ZW50aWFsQ2hpbGQgPT4ge1xuICAgICAgICAgIGlmICggaGFzQ29ubmVjdGlvbiggbm9kZSwgcG90ZW50aWFsQ2hpbGQgKSApIHtcbiAgICAgICAgICAgIG5vZGVzLnB1c2goIHBvdGVudGlhbENoaWxkICk7XG4gICAgICAgICAgfVxuICAgICAgICB9ICk7XG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgLy8gQWRkIGluIGNoaWxkcmVuIGFuZCBhY2Nlc3NpYmxlIGNoaWxkcmVuIChkb24ndCB3b3JyeSBhYm91dCBkdXBsaWNhdGVzIHNpbmNlIHBlcmYgaXNuJ3QgY3JpdGljYWwpXG4gICAgICAgIEFycmF5LnByb3RvdHlwZS5wdXNoLmFwcGx5KCBub2Rlcywgbm9kZS5jaGlsZHJlbiApO1xuICAgICAgICBpZiAoIG5vZGUucGRvbU9yZGVyICkge1xuICAgICAgICAgIEFycmF5LnByb3RvdHlwZS5wdXNoLmFwcGx5KCBub2Rlcywgbm9kZS5wZG9tT3JkZXIuZmlsdGVyKCBuID0+IG4gIT09IG51bGwgKSApO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICAvKipcbiAgICogUmVsZWFzZXMgcmVmZXJlbmNlc1xuICAgKiBAcHVibGljXG4gICAqL1xuICBkaXNwb3NlKCkge1xuICAgIHRoaXMuZGlzcGxheS5kaXNwb3NlKCk7XG4gIH1cbn1cblxuc2NlbmVyeS5yZWdpc3RlciggJ1BET01GdXp6ZXInLCBQRE9NRnV6emVyICk7XG5leHBvcnQgZGVmYXVsdCBQRE9NRnV6emVyOyJdLCJuYW1lcyI6WyJQZXJtdXRhdGlvbiIsIlJhbmRvbSIsImFycmF5RGlmZmVyZW5jZSIsIkRpc3BsYXkiLCJOb2RlIiwiUERPTVRyZWUiLCJzY2VuZXJ5IiwiUERPTUZ1enplciIsInN0ZXAiLCJhY3Rpb24iLCJyYW5kb20iLCJzYW1wbGUiLCJlbnVtZXJhdGVBY3Rpb25zIiwibG9nVG9Db25zb2xlIiwiY29uc29sZSIsImxvZyIsInRleHQiLCJhY3Rpb25zVGFrZW4iLCJwdXNoIiwiZXhlY3V0ZSIsImRpc3BsYXkiLCJfcm9vdFBET01JbnN0YW5jZSIsImF1ZGl0Um9vdCIsImF1ZGl0UERPTURpc3BsYXlzIiwicm9vdE5vZGUiLCJpIiwibm9kZXMiLCJsZW5ndGgiLCJub2RlIiwiaWQiLCJ0YWdOYW1lIiwiZGVidWdPcmRlciIsImNoaWxkcmVuIiwicGRvbU9yZGVyIiwidmlzaWJsZSIsInBkb21WaXNpYmxlIiwiYWN0aW9ucyIsImZvckVhY2giLCJhIiwicG93ZXJTZXQiLCJjb25jYXQiLCJzdWJzZXQiLCJmb3JFYWNoUGVybXV0YXRpb24iLCJvcmRlciIsImlzUERPTU9yZGVyQ2hhbmdlTGVnYWwiLCJiIiwiaXNBZGRDaGlsZExlZ2FsIiwiXyIsInJhbmdlIiwiaW5zZXJ0Q2hpbGQiLCJoYXNDaGlsZCIsInJlbW92ZUNoaWxkIiwicGFyZW50IiwiY2hpbGQiLCJpc0FjeWNsaWMiLCJsaXN0IiwibGlzdHMiLCJzbGljZSIsIm1hcCIsInN1Ykxpc3QiLCJmaWx0ZXIiLCJuIiwiaW5jbHVkZXMiLCJ1bmlxIiwiX3Bkb21QYXJlbnQiLCJoYXNDb25uZWN0aW9uIiwiZWZmZWN0aXZlQ2hpbGRyZW4iLCJldmVyeSIsInBvcCIsInBvdGVudGlhbENoaWxkIiwiQXJyYXkiLCJwcm90b3R5cGUiLCJhcHBseSIsImRpc3Bvc2UiLCJjb25zdHJ1Y3RvciIsIm5vZGVDb3VudCIsInNlZWQiLCJhc3NlcnQiLCJyZWdpc3RlciJdLCJtYXBwaW5ncyI6IkFBQUEsc0RBQXNEO0FBRXREOzs7O0NBSUMsR0FFRCxPQUFPQSxpQkFBaUIsb0NBQW9DO0FBQzVELE9BQU9DLFlBQVksK0JBQStCO0FBQ2xELE9BQU9DLHFCQUFxQiw4Q0FBOEM7QUFDMUUsU0FBU0MsT0FBTyxFQUFFQyxJQUFJLEVBQUVDLFFBQVEsRUFBRUMsT0FBTyxRQUFRLG1CQUFtQjtBQUVwRSxJQUFBLEFBQU1DLGFBQU4sTUFBTUE7SUE4Qko7OztHQUdDLEdBQ0RDLE9BQU87UUFDTCxNQUFNQyxTQUFTLElBQUksQ0FBQ0MsTUFBTSxDQUFDQyxNQUFNLENBQUUsSUFBSSxDQUFDQyxnQkFBZ0I7UUFDeEQsSUFBSSxDQUFDQyxZQUFZLElBQUlDLFFBQVFDLEdBQUcsQ0FBRU4sT0FBT08sSUFBSTtRQUM3QyxJQUFJLENBQUNDLFlBQVksQ0FBQ0MsSUFBSSxDQUFFVDtRQUN4QkEsT0FBT1UsT0FBTztRQUNkLElBQUksQ0FBQ0MsT0FBTyxDQUFDQyxpQkFBaUIsQ0FBQ0MsU0FBUztRQUN4Q2pCLFNBQVNrQixpQkFBaUIsQ0FBRSxJQUFJLENBQUNILE9BQU8sQ0FBQ0ksUUFBUTtRQUNqRCxJQUFLLElBQUksQ0FBQ1gsWUFBWSxFQUFHO1lBQ3ZCLElBQU0sSUFBSVksSUFBSSxHQUFHQSxJQUFJLElBQUksQ0FBQ0MsS0FBSyxDQUFDQyxNQUFNLEVBQUVGLElBQU07Z0JBQzVDLE1BQU1HLE9BQU8sSUFBSSxDQUFDRixLQUFLLENBQUVELEVBQUc7Z0JBQzVCWCxRQUFRQyxHQUFHLENBQUUsR0FBR1UsRUFBRSxDQUFDLEVBQUVHLEtBQUtDLEVBQUUsQ0FBQyxDQUFDLEVB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