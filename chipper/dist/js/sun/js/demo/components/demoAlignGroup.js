// Copyright 2022-2024, University of Colorado Boulder
/**
 * Demo for AlignGroup
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */ import stepTimer from '../../../../axon/js/stepTimer.js';
import dotRandom from '../../../../dot/js/dotRandom.js';
import { AlignBox, AlignGroup, HBox, Node, Rectangle, Text, VBox } from '../../../../scenery/js/imports.js';
import Panel from '../../Panel.js';
export default function demoAlignGroup(layoutBounds) {
    function highlightWrap(node) {
        const rect = Rectangle.bounds(node.bounds, {
            fill: 'rgba(0,0,0,0.25)'
        });
        node.boundsProperty.lazyLink(()=>{
            rect.setRectBounds(node.bounds);
        });
        return new Node({
            children: [
                rect,
                node
            ]
        });
    }
    // Scheduling randomness in stepTimer on startup leads to a different number of calls in the upstream and downstream
    // sim in the playback wrapper.  This workaround uses Math.random() to avoid a mismatch in the number of dotRandom calls.
    const stepRand = ()=>{
        return Math.random(); // eslint-disable-line phet/bad-sim-text
    };
    const iconGroup = new AlignGroup();
    const iconRow = new HBox({
        spacing: 10,
        children: _.range(1, 10).map(()=>{
            const randomRect = new Rectangle(0, 0, dotRandom.nextDouble() * 60 + 10, dotRandom.nextDouble() * 60 + 10, {
                fill: 'black'
            });
            stepTimer.addListener(()=>{
                if (stepRand() < 0.02) {
                    randomRect.rectWidth = stepRand() * 60 + 10;
                    randomRect.rectHeight = stepRand() * 60 + 10;
                }
            });
            return new AlignBox(randomRect, {
                group: iconGroup,
                margin: 5
            });
        }).map(highlightWrap)
    });
    const panelGroup = new AlignGroup({
        matchVertical: false
    });
    function randomText() {
        const text = new Text('Test', {
            fontSize: 20
        });
        stepTimer.addListener(()=>{
            if (stepRand() < 0.03) {
                let string = '';
                while(stepRand() < 0.94 && string.length < 20){
                    string += `${stepRand()}`.slice(-1);
                }
                text.string = string;
            }
        });
        return text;
    }
    const panelRow = new VBox({
        spacing: 10,
        children: [
            new Panel(new AlignBox(randomText(), {
                group: panelGroup
            })),
            new Panel(new AlignBox(new VBox({
                spacing: 3,
                children: [
                    randomText(),
                    randomText()
                ]
            }), {
                group: panelGroup
            }))
        ]
    });
    return new VBox({
        spacing: 20,
        children: [
            iconRow,
            panelRow
        ],
        center: layoutBounds.center
    });
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3N1bi9qcy9kZW1vL2NvbXBvbmVudHMvZGVtb0FsaWduR3JvdXAudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjItMjAyNCwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbi8qKlxuICogRGVtbyBmb3IgQWxpZ25Hcm91cFxuICpcbiAqIEBhdXRob3IgQ2hyaXMgTWFsbGV5IChQaXhlbFpvb20sIEluYy4pXG4gKi9cblxuaW1wb3J0IHN0ZXBUaW1lciBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL3N0ZXBUaW1lci5qcyc7XG5pbXBvcnQgQm91bmRzMiBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvQm91bmRzMi5qcyc7XG5pbXBvcnQgZG90UmFuZG9tIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9kb3RSYW5kb20uanMnO1xuaW1wb3J0IHsgQWxpZ25Cb3gsIEFsaWduR3JvdXAsIEhCb3gsIE5vZGUsIFJlY3RhbmdsZSwgVGV4dCwgVkJveCB9IGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XG5pbXBvcnQgUGFuZWwgZnJvbSAnLi4vLi4vUGFuZWwuanMnO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBkZW1vQWxpZ25Hcm91cCggbGF5b3V0Qm91bmRzOiBCb3VuZHMyICk6IE5vZGUge1xuXG4gIGZ1bmN0aW9uIGhpZ2hsaWdodFdyYXAoIG5vZGU6IE5vZGUgKTogTm9kZSB7XG4gICAgY29uc3QgcmVjdCA9IFJlY3RhbmdsZS5ib3VuZHMoIG5vZGUuYm91bmRzLCB7IGZpbGw6ICdyZ2JhKDAsMCwwLDAuMjUpJyB9ICk7XG4gICAgbm9kZS5ib3VuZHNQcm9wZXJ0eS5sYXp5TGluayggKCkgPT4ge1xuICAgICAgcmVjdC5zZXRSZWN0Qm91bmRzKCBub2RlLmJvdW5kcyApO1xuICAgIH0gKTtcbiAgICByZXR1cm4gbmV3IE5vZGUoIHtcbiAgICAgIGNoaWxkcmVuOiBbXG4gICAgICAgIHJlY3QsXG4gICAgICAgIG5vZGVcbiAgICAgIF1cbiAgICB9ICk7XG4gIH1cblxuICAvLyBTY2hlZHVsaW5nIHJhbmRvbW5lc3MgaW4gc3RlcFRpbWVyIG9uIHN0YXJ0dXAgbGVhZHMgdG8gYSBkaWZmZXJlbnQgbnVtYmVyIG9mIGNhbGxzIGluIHRoZSB1cHN0cmVhbSBhbmQgZG93bnN0cmVhbVxuICAvLyBzaW0gaW4gdGhlIHBsYXliYWNrIHdyYXBwZXIuICBUaGlzIHdvcmthcm91bmQgdXNlcyBNYXRoLnJhbmRvbSgpIHRvIGF2b2lkIGEgbWlzbWF0Y2ggaW4gdGhlIG51bWJlciBvZiBkb3RSYW5kb20gY2FsbHMuXG4gIGNvbnN0IHN0ZXBSYW5kID0gKCkgPT4ge1xuICAgIHJldHVybiBNYXRoLnJhbmRvbSgpOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIHBoZXQvYmFkLXNpbS10ZXh0XG4gIH07XG4gIGNvbnN0IGljb25Hcm91cCA9IG5ldyBBbGlnbkdyb3VwKCk7XG4gIGNvbnN0IGljb25Sb3cgPSBuZXcgSEJveCgge1xuICAgIHNwYWNpbmc6IDEwLFxuICAgIGNoaWxkcmVuOiBfLnJhbmdlKCAxLCAxMCApLm1hcCggKCkgPT4ge1xuICAgICAgY29uc3QgcmFuZG9tUmVjdCA9IG5ldyBSZWN0YW5nbGUoIDAsIDAsIGRvdFJhbmRvbS5uZXh0RG91YmxlKCkgKiA2MCArIDEwLCBkb3RSYW5kb20ubmV4dERvdWJsZSgpICogNjAgKyAxMCwge1xuICAgICAgICBmaWxsOiAnYmxhY2snXG4gICAgICB9ICk7XG4gICAgICBzdGVwVGltZXIuYWRkTGlzdGVuZXIoICgpID0+IHtcbiAgICAgICAgaWYgKCBzdGVwUmFuZCgpIDwgMC4wMiApIHtcbiAgICAgICAgICByYW5kb21SZWN0LnJlY3RXaWR0aCA9IHN0ZXBSYW5kKCkgKiA2MCArIDEwO1xuICAgICAgICAgIHJhbmRvbVJlY3QucmVjdEhlaWdodCA9IHN0ZXBSYW5kKCkgKiA2MCArIDEwO1xuICAgICAgICB9XG4gICAgICB9ICk7XG4gICAgICByZXR1cm4gbmV3IEFsaWduQm94KCByYW5kb21SZWN0LCB7XG4gICAgICAgIGdyb3VwOiBpY29uR3JvdXAsXG4gICAgICAgIG1hcmdpbjogNVxuICAgICAgfSApO1xuICAgIH0gKS5tYXAoIGhpZ2hsaWdodFdyYXAgKVxuICB9ICk7XG5cbiAgY29uc3QgcGFuZWxHcm91cCA9IG5ldyBBbGlnbkdyb3VwKCB7IG1hdGNoVmVydGljYWw6IGZhbHNlIH0gKTtcblxuICBmdW5jdGlvbiByYW5kb21UZXh0KCk6IFRleHQge1xuICAgIGNvbnN0IHRleHQgPSBuZXcgVGV4dCggJ1Rlc3QnLCB7IGZvbnRTaXplOiAyMCB9ICk7XG4gICAgc3RlcFRpbWVyLmFkZExpc3RlbmVyKCAoKSA9PiB7XG4gICAgICBpZiAoIHN0ZXBSYW5kKCkgPCAwLjAzICkge1xuICAgICAgICBsZXQgc3RyaW5nID0gJyc7XG4gICAgICAgIHdoaWxlICggc3RlcFJhbmQoKSA8IDAuOTQgJiYgc3RyaW5nLmxlbmd0aCA8IDIwICkge1xuICAgICAgICAgIHN0cmluZyArPSAoIGAke3N0ZXBSYW5kKCl9YCApLnNsaWNlKCAtMSApO1xuICAgICAgICB9XG4gICAgICAgIHRleHQuc3RyaW5nID0gc3RyaW5nO1xuICAgICAgfVxuICAgIH0gKTtcbiAgICByZXR1cm4gdGV4dDtcbiAgfVxuXG4gIGNvbnN0IHBhbmVsUm93ID0gbmV3IFZCb3goIHtcbiAgICBzcGFjaW5nOiAxMCxcbiAgICBjaGlsZHJlbjogW1xuICAgICAgbmV3IFBhbmVsKCBuZXcgQWxpZ25Cb3goIHJhbmRvbVRleHQoKSwgeyBncm91cDogcGFuZWxHcm91cCB9ICkgKSxcbiAgICAgIG5ldyBQYW5lbCggbmV3IEFsaWduQm94KCBuZXcgVkJveCgge1xuICAgICAgICBzcGFjaW5nOiAzLFxuICAgICAgICBjaGlsZHJlbjogW1xuICAgICAgICAgIHJhbmRvbVRleHQoKSxcbiAgICAgICAgICByYW5kb21UZXh0KClcbiAgICAgICAgXVxuICAgICAgfSApLCB7IGdyb3VwOiBwYW5lbEdyb3VwIH0gKSApXG4gICAgXVxuICB9ICk7XG5cbiAgcmV0dXJuIG5ldyBWQm94KCB7XG4gICAgc3BhY2luZzogMjAsXG4gICAgY2hpbGRyZW46IFsgaWNvblJvdywgcGFuZWxSb3cgXSxcbiAgICBjZW50ZXI6IGxheW91dEJvdW5kcy5jZW50ZXJcbiAgfSApO1xufSJdLCJuYW1lcyI6WyJzdGVwVGltZXIiLCJkb3RSYW5kb20iLCJBbGlnbkJveCIsIkFsaWduR3JvdXAiLCJIQm94IiwiTm9kZSIsIlJlY3RhbmdsZSIsIlRleHQiLCJWQm94IiwiUGFuZWwiLCJkZW1vQWxpZ25Hcm91cCIsImxheW91dEJvdW5kcyIsImhpZ2hsaWdodFdyYXAiLCJub2RlIiwicmVjdCIsImJvdW5kcyIsImZpbGwiLCJib3VuZHNQcm9wZXJ0eSIsImxhenlMaW5rIiwic2V0UmVjdEJvdW5kcyIsImNoaWxkcmVuIiwic3RlcFJhbmQiLCJNYXRoIiwicmFuZG9tIiwiaWNvbkdyb3VwIiwiaWNvblJvdyIsInNwYWNpbmciLCJfIiwicmFuZ2UiLCJtYXAiLCJyYW5kb21SZWN0IiwibmV4dERvdWJsZSIsImFkZExpc3RlbmVyIiwicmVjdFdpZHRoIiwicmVjdEhlaWdodCIsImdyb3VwIiwibWFyZ2luIiwicGFuZWxHcm91cCIsIm1hdGNoVmVydGljYWwiLCJyYW5kb21UZXh0IiwidGV4dCIsImZvbnRTaXplIiwic3RyaW5nIiwibGVuZ3RoIiwic2xpY2UiLCJwYW5lbFJvdyIsImNlbnRlciJdLCJtYXBwaW5ncyI6IkFBQUEsc0RBQXNEO0FBRXREOzs7O0NBSUMsR0FFRCxPQUFPQSxlQUFlLG1DQUFtQztBQUV6RCxPQUFPQyxlQUFlLGtDQUFrQztBQUN4RCxTQUFTQyxRQUFRLEVBQUVDLFVBQVUsRUFBRUMsSUFBSSxFQUFFQyxJQUFJLEVBQUVDLFNBQVMsRUFBRUMsSUFBSSxFQUFFQyxJQUFJLFFBQVEsb0NBQW9DO0FBQzVHLE9BQU9DLFdBQVcsaUJBQWlCO0FBRW5DLGVBQWUsU0FBU0MsZUFBZ0JDLFlBQXFCO0lBRTNELFNBQVNDLGNBQWVDLElBQVU7UUFDaEMsTUFBTUMsT0FBT1IsVUFBVVMsTUFBTSxDQUFFRixLQUFLRSxNQUFNLEVBQUU7WUFBRUMsTUFBTTtRQUFtQjtRQUN2RUgsS0FBS0ksY0FBYyxDQUFDQyxRQUFRLENBQUU7WUFDNUJKLEtBQUtLLGFBQWEsQ0FBRU4sS0FBS0UsTUFBTTtRQUNqQztRQUNBLE9BQU8sSUFBSVYsS0FBTTtZQUNmZSxVQUFVO2dCQUNSTjtnQkFDQUQ7YUFDRDtRQUNIO0lBQ0Y7SUFFQSxvSEFBb0g7SUFDcEgseUhBQXlIO0lBQ3pILE1BQU1RLFdBQVc7UUFDZixPQUFPQyxLQUFLQyxNQUFNLElBQUksd0NBQXdDO0lBQ2hFO0lBQ0EsTUFBTUMsWUFBWSxJQUFJckI7SUFDdEIsTUFBTXNCLFVBQVUsSUFBSXJCLEtBQU07UUFDeEJzQixTQUFTO1FBQ1ROLFVBQVVPLEVBQUVDLEtBQUssQ0FBRSxHQUFHLElBQUtDLEdBQUcsQ0FBRTtZQUM5QixNQUFNQyxhQUFhLElBQUl4QixVQUFXLEdBQUcsR0FBR0wsVUFBVThCLFVBQVUsS0FBSyxLQUFLLElBQUk5QixVQUFVOEIsVUFBVSxLQUFLLEtBQUssSUFBSTtnQkFDMUdmLE1BQU07WUFDUjtZQUNBaEIsVUFBVWdDLFdBQVcsQ0FBRTtnQkFDckIsSUFBS1gsYUFBYSxNQUFPO29CQUN2QlMsV0FBV0csU0FBUyxHQUFHWixhQUFhLEtBQUs7b0JBQ3pDUyxXQUFXSSxVQUFVLEdBQUdiLGFBQWEsS0FBSztnQkFDNUM7WUFDRjtZQUNBLE9BQU8sSUFBSW5CLFNBQVU0QixZQUFZO2dCQUMvQkssT0FBT1g7Z0JBQ1BZLFFBQVE7WUFDVjtRQUNGLEdBQUlQLEdBQUcsQ0FBRWpCO0lBQ1g7SUFFQSxNQUFNeUIsYUFBYSxJQUFJbEMsV0FBWTtRQUFFbUMsZUFBZTtJQUFNO0lBRTFELFNBQVNDO1FBQ1AsTUFBTUMsT0FBTyxJQUFJakMsS0FBTSxRQUFRO1lBQUVrQyxVQUFVO1FBQUc7UUFDOUN6QyxVQUFVZ0MsV0FBVyxDQUFFO1lBQ3JCLElBQUtYLGFBQWEsTUFBTztnQkFDdkIsSUFBSXFCLFNBQVM7Z0JBQ2IsTUFBUXJCLGFBQWEsUUFBUXFCLE9BQU9DLE1BQU0sR0FBRyxHQUFLO29CQUNoREQsVUFBVSxBQUFFLEdBQUdyQixZQUFZLENBQUd1QixLQUFLLENBQUUsQ0FBQztnQkFDeEM7Z0JBQ0FKLEtBQUtFLE1BQU0sR0FBR0E7WUFDaEI7UUFDRjtRQUNBLE9BQU9GO0lBQ1Q7SUFFQSxNQUFNSyxXQUFXLElBQUlyQyxLQUFNO1FBQ3pCa0IsU0FBUztRQUNUTixVQUFVO1lBQ1IsSUFBSVgsTUFBTyxJQUFJUCxTQUFVcUMsY0FBYztnQkFBRUosT0FBT0U7WUFBVztZQUMzRCxJQUFJNUIsTUFBTyxJQUFJUCxTQUFVLElBQUlNLEtBQU07Z0JBQ2pDa0IsU0FBUztnQkFDVE4sVUFBVTtvQkFDUm1CO29CQUNBQTtpQkFDRDtZQUNILElBQUs7Z0JBQUVKLE9BQU9FO1lBQVc7U0FDMUI7SUFDSDtJQUVBLE9BQU8sSUFBSTdCLEtBQU07UUFDZmtCLFNBQVM7UUFDVE4sVUFBVTtZQUFFSztZQUFTb0I7U0FBVTtRQUMvQkMsUUFBUW5DLGFBQWFtQyxNQUFNO0lBQzdCO0FBQ0YifQ==