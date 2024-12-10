// Copyright 2013-2024, University of Colorado Boulder
/**
 * AboutDialog displays information about the simulation -- its title, version number, credits, etc.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */ import DerivedProperty from '../../axon/js/DerivedProperty.js';
import DerivedStringProperty from '../../axon/js/DerivedStringProperty.js';
import stepTimer from '../../axon/js/stepTimer.js';
import optionize from '../../phet-core/js/optionize.js';
import StringUtils from '../../phetcommon/js/util/StringUtils.js';
import PhetFont from '../../scenery-phet/js/PhetFont.js';
import { allowLinksProperty, Node, PDOMPeer, RichText, VBox, VoicingRichText, VoicingText, VStrut } from '../../scenery/js/imports.js';
import Dialog from '../../sun/js/Dialog.js';
import Tandem from '../../tandem/js/Tandem.js';
import CreditsNode from './CreditsNode.js';
import localeProperty from './i18n/localeProperty.js';
import joist from './joist.js';
import JoistStrings from './JoistStrings.js';
import packageJSON from './packageJSON.js';
import updateCheck from './updateCheck.js';
import UpdateNodes from './UpdateNodes.js';
import UpdateState from './UpdateState.js';
// constants
const MAX_WIDTH = 550; // Maximum width of elements in the dialog
const NOMINAL_FONT_SIZE = 16; // Change this to make everything larger or smaller
let AboutDialog = class AboutDialog extends Dialog {
    /**
   * When the dialog is shown, add update listeners.
   */ show() {
        if (!this.shouldShowPopup()) {
            return;
        }
        if (updateCheck.areUpdatesChecked && !this.isShowingProperty.value) {
            updateCheck.resetTimeout();
            // Fire off a new update check if we were marked as offline or unchecked before, and we handle updates.
            if (updateCheck.stateProperty.value === UpdateState.OFFLINE || updateCheck.stateProperty.value === UpdateState.UNCHECKED) {
                updateCheck.check();
            }
            this.updateStepListener && stepTimer.addListener(this.updateStepListener);
            this.updateVisibilityListener && updateCheck.stateProperty.link(this.updateVisibilityListener);
        }
        super.show();
    }
    /**
   * When the dialog is hidden, remove update listeners.
   */ hide() {
        if (this.isShowingProperty.value) {
            super.hide();
            if (updateCheck.areUpdatesChecked) {
                this.updateVisibilityListener && updateCheck.stateProperty.unlink(this.updateVisibilityListener);
                this.updateStepListener && stepTimer.removeListener(this.updateStepListener);
            }
        }
    }
    /**
   * @param nameStringProperty - name of the simulation
   * @param version - version of the simulation
   * @param credits - credits for the simulation
   * @param [providedOptions]
   */ constructor(nameStringProperty, version, credits, providedOptions){
        const options = optionize()({
            xSpacing: 26,
            topMargin: 26,
            bottomMargin: 26,
            leftMargin: 26,
            phetioReadOnly: true,
            phetioDynamicElement: true,
            isDisposable: false,
            accessibleName: nameStringProperty,
            tandem: Tandem.REQUIRED
        }, providedOptions);
        // Dynamic modules are loaded in simLauncher and accessed through their namespace
        const Brand = phet.brand.Brand;
        assert && assert(Brand, 'Brand should exist by now');
        let children = [];
        const titleText = new VoicingText(nameStringProperty, {
            font: new PhetFont(2 * NOMINAL_FONT_SIZE),
            maxWidth: MAX_WIDTH,
            readingBlockDisabledTagName: null
        });
        children.push(titleText);
        const versionStringProperty = new DerivedProperty([
            JoistStrings.versionPatternStringProperty
        ], (versionPattern)=>{
            return StringUtils.format(versionPattern, version);
        });
        children.push(new VoicingText(versionStringProperty, {
            font: new PhetFont(NOMINAL_FONT_SIZE),
            maxWidth: MAX_WIDTH,
            tagName: 'p'
        }));
        // Built versions will have a build timestamp
        if (phet.chipper.buildTimestamp) {
            children.push(new VoicingText(phet.chipper.buildTimestamp, {
                font: new PhetFont(0.65 * NOMINAL_FONT_SIZE),
                maxWidth: MAX_WIDTH,
                tagName: 'p',
                innerContent: phet.chipper.buildTimestamp
            }));
        }
        let updateStepListener = null;
        let updateVisibilityListener = null;
        let updatePanel = null;
        // brand=phet versions that are not running in the phet-app should check update status.
        if (updateCheck.areUpdatesChecked) {
            const positionOptions = {
                left: 0,
                top: 0
            };
            const checkingNode = UpdateNodes.createCheckingNode(positionOptions);
            const upToDateNode = UpdateNodes.createUpToDateNode(positionOptions);
            const outOfDateNode = UpdateNodes.createOutOfDateAboutNode(positionOptions);
            const offlineNode = UpdateNodes.createOfflineNode(positionOptions);
            updateStepListener = checkingNode.stepListener;
            updateVisibilityListener = (state)=>{
                checkingNode.visible = state === UpdateState.CHECKING;
                upToDateNode.visible = state === UpdateState.UP_TO_DATE;
                outOfDateNode.visible = state === UpdateState.OUT_OF_DATE;
                offlineNode.visible = state === UpdateState.OFFLINE;
                // pdom - make update content visible/invisible for screen readers by explicitly removing content
                // from the DOM, necessary because AT will ready hidden content in a Dialog.
                checkingNode.pdomVisible = checkingNode.visible;
                upToDateNode.pdomVisible = upToDateNode.visible;
                outOfDateNode.pdomVisible = outOfDateNode.visible;
                offlineNode.pdomVisible = offlineNode.visible;
            };
            updatePanel = new Node({
                children: [
                    checkingNode,
                    upToDateNode,
                    outOfDateNode,
                    offlineNode
                ],
                maxWidth: MAX_WIDTH,
                visibleProperty: allowLinksProperty
            });
            children.push(updatePanel);
        }
        const brandChildren = [];
        // Show the brand name, if it exists
        if (Brand.name) {
            brandChildren.push(new VoicingRichText(Brand.name, {
                font: new PhetFont(NOMINAL_FONT_SIZE),
                supScale: 0.5,
                supYOffset: 3,
                maxWidth: MAX_WIDTH,
                // pdom
                tagName: 'h2',
                innerContent: Brand.name
            }));
        }
        // Show the brand copyright statement, if it exists
        if (Brand.copyright) {
            const year = phet.chipper.buildTimestamp ? phet.chipper.buildTimestamp.split('-')[0] : new Date().getFullYear(); // in unbuilt mode
            const copyright = StringUtils.fillIn(Brand.copyright, {
                year: year
            });
            brandChildren.push(new VoicingText(copyright, {
                font: new PhetFont(0.75 * NOMINAL_FONT_SIZE),
                maxWidth: MAX_WIDTH,
                // pdom
                tagName: 'p',
                innerContent: copyright
            }));
        }
        let additionalLicenseStatement = null;
        // Optional additionalLicenseStatement, used in phet-io
        if (Brand.additionalLicenseStatement) {
            additionalLicenseStatement = new VoicingRichText(Brand.additionalLicenseStatement, {
                font: new PhetFont(0.65 * NOMINAL_FONT_SIZE),
                fill: 'gray',
                align: 'left',
                maxWidth: MAX_WIDTH,
                // pdom
                tagName: 'p',
                innerContent: Brand.additionalLicenseStatement
            });
            brandChildren.push(additionalLicenseStatement);
        }
        if (brandChildren.length > 0) {
            children.push(new VStrut(15));
            children = children.concat(brandChildren);
        }
        let creditsNode = null;
        // Add credits for specific brands
        if (Brand.id === 'phet' || Brand.id === 'phet-io') {
            children.push(new VStrut(15));
            creditsNode = new CreditsNode(credits, {
                titleFont: new PhetFont({
                    size: NOMINAL_FONT_SIZE,
                    weight: 'bold'
                }),
                textFont: new PhetFont(0.75 * NOMINAL_FONT_SIZE),
                maxWidth: MAX_WIDTH
            });
            children.push(creditsNode);
        }
        // Show any links identified in the brand
        const links = Brand.getLinks(packageJSON.name, localeProperty.value);
        if (links && links.length > 0) {
            // Show the links in a separate VBox so they will have the same MAX_WIDTH and hence the same font size.
            const linksParent = new VBox({
                spacing: 6,
                align: 'left',
                maxWidth: MAX_WIDTH
            });
            children.push(linksParent);
            // Create new links whenever the locale changes, for an up to date translator URL.
            localeProperty.link((locale)=>{
                linksParent.children.forEach((child)=>child.dispose());
                const links = Brand.getLinks(packageJSON.name, locale);
                const linksChildren = [];
                linksChildren.push(new VStrut(15));
                for(let i = 0; i < links.length; i++){
                    const link = links[i];
                    // If links are allowed, use hyperlinks. Otherwise, just output the URL. This doesn't need to be internationalized.
                    const stringProperty = new DerivedStringProperty([
                        allowLinksProperty,
                        link.textStringProperty
                    ], (allowLinks, linkText)=>{
                        return allowLinks ? `<a href="{{url}}">${linkText}</a>` : `${linkText}: ${link.url}`;
                    });
                    // This is PhET-iO instrumented because it is a keyboard navigation focusable element.
                    const richText = new RichText(stringProperty, {
                        links: {
                            url: link.url
                        },
                        font: new PhetFont(NOMINAL_FONT_SIZE)
                    });
                    richText.disposeEmitter.addListener(()=>{
                        stringProperty.dispose();
                    });
                    linksChildren.push(richText);
                }
                linksParent.children = linksChildren;
            });
        }
        const content = new VBox({
            align: 'left',
            spacing: 6,
            children: children,
            // pdom - accessible container for all AboutDialog content
            tagName: 'div'
        });
        super(content, options);
        this.updateStepListener = updateStepListener;
        this.updateVisibilityListener = updateVisibilityListener;
        // pdom - set label association so the title is read when focus enters the dialog
        this.addAriaLabelledbyAssociation({
            thisElementName: PDOMPeer.PRIMARY_SIBLING,
            otherElementName: PDOMPeer.PRIMARY_SIBLING,
            otherNode: titleText
        });
    }
};
export { AboutDialog as default };
joist.register('AboutDialog', AboutDialog);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2pvaXN0L2pzL0Fib3V0RGlhbG9nLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDEzLTIwMjQsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxuXG4vKipcbiAqIEFib3V0RGlhbG9nIGRpc3BsYXlzIGluZm9ybWF0aW9uIGFib3V0IHRoZSBzaW11bGF0aW9uIC0tIGl0cyB0aXRsZSwgdmVyc2lvbiBudW1iZXIsIGNyZWRpdHMsIGV0Yy5cbiAqXG4gKiBAYXV0aG9yIFNhbSBSZWlkIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxuICovXG5cblxuaW1wb3J0IERlcml2ZWRQcm9wZXJ0eSBmcm9tICcuLi8uLi9heG9uL2pzL0Rlcml2ZWRQcm9wZXJ0eS5qcyc7XG5pbXBvcnQgRGVyaXZlZFN0cmluZ1Byb3BlcnR5IGZyb20gJy4uLy4uL2F4b24vanMvRGVyaXZlZFN0cmluZ1Byb3BlcnR5LmpzJztcbmltcG9ydCBzdGVwVGltZXIgZnJvbSAnLi4vLi4vYXhvbi9qcy9zdGVwVGltZXIuanMnO1xuaW1wb3J0IFRSZWFkT25seVByb3BlcnR5IGZyb20gJy4uLy4uL2F4b24vanMvVFJlYWRPbmx5UHJvcGVydHkuanMnO1xuaW1wb3J0IFRCcmFuZCBmcm9tICcuLi8uLi9icmFuZC9qcy9UQnJhbmQuanMnO1xuaW1wb3J0IG9wdGlvbml6ZSwgeyBFbXB0eVNlbGZPcHRpb25zIH0gZnJvbSAnLi4vLi4vcGhldC1jb3JlL2pzL29wdGlvbml6ZS5qcyc7XG5pbXBvcnQgU3RyaW5nVXRpbHMgZnJvbSAnLi4vLi4vcGhldGNvbW1vbi9qcy91dGlsL1N0cmluZ1V0aWxzLmpzJztcbmltcG9ydCBQaGV0Rm9udCBmcm9tICcuLi8uLi9zY2VuZXJ5LXBoZXQvanMvUGhldEZvbnQuanMnO1xuaW1wb3J0IHsgYWxsb3dMaW5rc1Byb3BlcnR5LCBOb2RlLCBQRE9NUGVlciwgUmljaFRleHQsIFZCb3gsIFZvaWNpbmdSaWNoVGV4dCwgVm9pY2luZ1RleHQsIFZTdHJ1dCB9IGZyb20gJy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XG5pbXBvcnQgRGlhbG9nLCB7IERpYWxvZ09wdGlvbnMgfSBmcm9tICcuLi8uLi9zdW4vanMvRGlhbG9nLmpzJztcbmltcG9ydCBUYW5kZW0gZnJvbSAnLi4vLi4vdGFuZGVtL2pzL1RhbmRlbS5qcyc7XG5pbXBvcnQgQ3JlZGl0c05vZGUsIHsgQ3JlZGl0c0RhdGEgfSBmcm9tICcuL0NyZWRpdHNOb2RlLmpzJztcbmltcG9ydCBsb2NhbGVQcm9wZXJ0eSBmcm9tICcuL2kxOG4vbG9jYWxlUHJvcGVydHkuanMnO1xuaW1wb3J0IGpvaXN0IGZyb20gJy4vam9pc3QuanMnO1xuaW1wb3J0IEpvaXN0U3RyaW5ncyBmcm9tICcuL0pvaXN0U3RyaW5ncy5qcyc7XG5pbXBvcnQgcGFja2FnZUpTT04gZnJvbSAnLi9wYWNrYWdlSlNPTi5qcyc7XG5pbXBvcnQgdXBkYXRlQ2hlY2sgZnJvbSAnLi91cGRhdGVDaGVjay5qcyc7XG5pbXBvcnQgVXBkYXRlTm9kZXMgZnJvbSAnLi9VcGRhdGVOb2Rlcy5qcyc7XG5pbXBvcnQgVXBkYXRlU3RhdGUgZnJvbSAnLi9VcGRhdGVTdGF0ZS5qcyc7XG5cbi8vIGNvbnN0YW50c1xuY29uc3QgTUFYX1dJRFRIID0gNTUwOyAvLyBNYXhpbXVtIHdpZHRoIG9mIGVsZW1lbnRzIGluIHRoZSBkaWFsb2dcbmNvbnN0IE5PTUlOQUxfRk9OVF9TSVpFID0gMTY7IC8vIENoYW5nZSB0aGlzIHRvIG1ha2UgZXZlcnl0aGluZyBsYXJnZXIgb3Igc21hbGxlclxuXG50eXBlIFNlbGZPcHRpb25zID0gRW1wdHlTZWxmT3B0aW9ucztcblxuZXhwb3J0IHR5cGUgQWJvdXREaWFsb2dPcHRpb25zID0gU2VsZk9wdGlvbnMgJiBEaWFsb2dPcHRpb25zO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBBYm91dERpYWxvZyBleHRlbmRzIERpYWxvZyB7XG5cbiAgLy8gTGlzdGVuZXIgdGhhdCBzaG91bGQgYmUgY2FsbGVkIGV2ZXJ5IGZyYW1lIHdoZXJlIHdlIGFyZSBzaG93biwgd2l0aCB7bnVtYmVyfSBkdCBhcyBhIHNpbmdsZSBwYXJhbWV0ZXIuXG4gIHByaXZhdGUgcmVhZG9ubHkgdXBkYXRlU3RlcExpc3RlbmVyOiAoICggZHQ6IG51bWJlciApID0+IHZvaWQgKSB8IG51bGw7XG5cbiAgLy8gTGlzdGVuZXIgdGhhdCBzaG91bGQgYmUgY2FsbGVkIHdoZW5ldmVyIG91ciB1cGRhdGUgc3RhdGUgY2hhbmdlcyAod2hpbGUgd2UgYXJlIGRpc3BsYXllZClcbiAgcHJpdmF0ZSByZWFkb25seSB1cGRhdGVWaXNpYmlsaXR5TGlzdGVuZXI6ICggKCBzdGF0ZTogVXBkYXRlU3RhdGUgKSA9PiB2b2lkICkgfCBudWxsO1xuXG4gIC8qKlxuICAgKiBAcGFyYW0gbmFtZVN0cmluZ1Byb3BlcnR5IC0gbmFtZSBvZiB0aGUgc2ltdWxhdGlvblxuICAgKiBAcGFyYW0gdmVyc2lvbiAtIHZlcnNpb24gb2YgdGhlIHNpbXVsYXRpb25cbiAgICogQHBhcmFtIGNyZWRpdHMgLSBjcmVkaXRzIGZvciB0aGUgc2ltdWxhdGlvblxuICAgKiBAcGFyYW0gW3Byb3ZpZGVkT3B0aW9uc11cbiAgICovXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggbmFtZVN0cmluZ1Byb3BlcnR5OiBUUmVhZE9ubHlQcm9wZXJ0eTxzdHJpbmc+LCB2ZXJzaW9uOiBzdHJpbmcsIGNyZWRpdHM6IENyZWRpdHNEYXRhLCBwcm92aWRlZE9wdGlvbnM/OiBBYm91dERpYWxvZ09wdGlvbnMgKSB7XG5cbiAgICBjb25zdCBvcHRpb25zID0gb3B0aW9uaXplPEFib3V0RGlhbG9nT3B0aW9ucywgU2VsZk9wdGlvbnMsIERpYWxvZ09wdGlvbnM+KCkoIHtcbiAgICAgIHhTcGFjaW5nOiAyNixcbiAgICAgIHRvcE1hcmdpbjogMjYsXG4gICAgICBib3R0b21NYXJnaW46IDI2LFxuICAgICAgbGVmdE1hcmdpbjogMjYsXG4gICAgICBwaGV0aW9SZWFkT25seTogdHJ1ZSwgLy8gdGhlIEFib3V0RGlhbG9nIHNob3VsZCBub3QgYmUgc2V0dGFibGVcbiAgICAgIHBoZXRpb0R5bmFtaWNFbGVtZW50OiB0cnVlLFxuICAgICAgaXNEaXNwb3NhYmxlOiBmYWxzZSxcbiAgICAgIGFjY2Vzc2libGVOYW1lOiBuYW1lU3RyaW5nUHJvcGVydHksXG4gICAgICB0YW5kZW06IFRhbmRlbS5SRVFVSVJFRFxuICAgIH0sIHByb3ZpZGVkT3B0aW9ucyApO1xuXG4gICAgLy8gRHluYW1pYyBtb2R1bGVzIGFyZSBsb2FkZWQgaW4gc2ltTGF1bmNoZXIgYW5kIGFjY2Vzc2VkIHRocm91Z2ggdGhlaXIgbmFtZXNwYWNlXG4gICAgY29uc3QgQnJhbmQ6IFRCcmFuZCA9IHBoZXQuYnJhbmQuQnJhbmQ7XG4gICAgYXNzZXJ0ICYmIGFzc2VydCggQnJhbmQsICdCcmFuZCBzaG91bGQgZXhpc3QgYnkgbm93JyApO1xuXG4gICAgbGV0IGNoaWxkcmVuID0gW107XG5cbiAgICBjb25zdCB0aXRsZVRleHQgPSBuZXcgVm9pY2luZ1RleHQoIG5hbWVTdHJpbmdQcm9wZXJ0eSwge1xuICAgICAgZm9udDogbmV3IFBoZXRGb250KCAyICogTk9NSU5BTF9GT05UX1NJWkUgKSxcbiAgICAgIG1heFdpZHRoOiBNQVhfV0lEVEgsXG4gICAgICByZWFkaW5nQmxvY2tEaXNhYmxlZFRhZ05hbWU6IG51bGxcbiAgICB9ICk7XG4gICAgY2hpbGRyZW4ucHVzaCggdGl0bGVUZXh0ICk7XG5cbiAgICBjb25zdCB2ZXJzaW9uU3RyaW5nUHJvcGVydHkgPSBuZXcgRGVyaXZlZFByb3BlcnR5KCBbIEpvaXN0U3RyaW5ncy52ZXJzaW9uUGF0dGVyblN0cmluZ1Byb3BlcnR5IF0sIHZlcnNpb25QYXR0ZXJuID0+IHtcbiAgICAgIHJldHVybiBTdHJpbmdVdGlscy5mb3JtYXQoIHZlcnNpb25QYXR0ZXJuLCB2ZXJzaW9uICk7XG4gICAgfSApO1xuICAgIGNoaWxkcmVuLnB1c2goIG5ldyBWb2ljaW5nVGV4dCggdmVyc2lvblN0cmluZ1Byb3BlcnR5LCB7XG4gICAgICBmb250OiBuZXcgUGhldEZvbnQoIE5PTUlOQUxfRk9OVF9TSVpFICksXG4gICAgICBtYXhXaWR0aDogTUFYX1dJRFRILFxuICAgICAgdGFnTmFtZTogJ3AnXG4gICAgfSApICk7XG5cbiAgICAvLyBCdWlsdCB2ZXJzaW9ucyB3aWxsIGhhdmUgYSBidWlsZCB0aW1lc3RhbXBcbiAgICBpZiAoIHBoZXQuY2hpcHBlci5idWlsZFRpbWVzdGFtcCApIHtcbiAgICAgIGNoaWxkcmVuLnB1c2goIG5ldyBWb2ljaW5nVGV4dCggcGhldC5jaGlwcGVyLmJ1aWxkVGltZXN0YW1wLCB7XG4gICAgICAgIGZvbnQ6IG5ldyBQaGV0Rm9udCggMC42NSAqIE5PTUlOQUxfRk9OVF9TSVpFICksXG4gICAgICAgIG1heFdpZHRoOiBNQVhfV0lEVEgsXG4gICAgICAgIHRhZ05hbWU6ICdwJyxcbiAgICAgICAgaW5uZXJDb250ZW50OiBwaGV0LmNoaXBwZXIuYnVpbGRUaW1lc3RhbXBcbiAgICAgIH0gKSApO1xuICAgIH1cblxuICAgIGxldCB1cGRhdGVTdGVwTGlzdGVuZXI6ICggKCBkdDogbnVtYmVyICkgPT4gdm9pZCApIHwgbnVsbCA9IG51bGw7XG4gICAgbGV0IHVwZGF0ZVZpc2liaWxpdHlMaXN0ZW5lcjogKCAoIHN0YXRlOiBVcGRhdGVTdGF0ZSApID0+IHZvaWQgKSB8IG51bGwgPSBudWxsO1xuICAgIGxldCB1cGRhdGVQYW5lbDogTm9kZSB8IG51bGwgPSBudWxsO1xuXG4gICAgLy8gYnJhbmQ9cGhldCB2ZXJzaW9ucyB0aGF0IGFyZSBub3QgcnVubmluZyBpbiB0aGUgcGhldC1hcHAgc2hvdWxkIGNoZWNrIHVwZGF0ZSBzdGF0dXMuXG4gICAgaWYgKCB1cGRhdGVDaGVjay5hcmVVcGRhdGVzQ2hlY2tlZCApIHtcblxuICAgICAgY29uc3QgcG9zaXRpb25PcHRpb25zID0geyBsZWZ0OiAwLCB0b3A6IDAgfTtcbiAgICAgIGNvbnN0IGNoZWNraW5nTm9kZSA9IFVwZGF0ZU5vZGVzLmNyZWF0ZUNoZWNraW5nTm9kZSggcG9zaXRpb25PcHRpb25zICk7XG4gICAgICBjb25zdCB1cFRvRGF0ZU5vZGUgPSBVcGRhdGVOb2Rlcy5jcmVhdGVVcFRvRGF0ZU5vZGUoIHBvc2l0aW9uT3B0aW9ucyApO1xuICAgICAgY29uc3Qgb3V0T2ZEYXRlTm9kZSA9IFVwZGF0ZU5vZGVzLmNyZWF0ZU91dE9mRGF0ZUFib3V0Tm9kZSggcG9zaXRpb25PcHRpb25zICk7XG4gICAgICBjb25zdCBvZmZsaW5lTm9kZSA9IFVwZGF0ZU5vZGVzLmNyZWF0ZU9mZmxpbmVOb2RlKCBwb3NpdGlvbk9wdGlvbnMgKTtcblxuICAgICAgdXBkYXRlU3RlcExpc3RlbmVyID0gY2hlY2tpbmdOb2RlLnN0ZXBMaXN0ZW5lcjtcblxuICAgICAgdXBkYXRlVmlzaWJpbGl0eUxpc3RlbmVyID0gKCBzdGF0ZTogVXBkYXRlU3RhdGUgKSA9PiB7XG4gICAgICAgIGNoZWNraW5nTm9kZS52aXNpYmxlID0gKCBzdGF0ZSA9PT0gVXBkYXRlU3RhdGUuQ0hFQ0tJTkcgKTtcbiAgICAgICAgdXBUb0RhdGVOb2RlLnZpc2libGUgPSAoIHN0YXRlID09PSBVcGRhdGVTdGF0ZS5VUF9UT19EQVRFICk7XG4gICAgICAgIG91dE9mRGF0ZU5vZGUudmlzaWJsZSA9ICggc3RhdGUgPT09IFVwZGF0ZVN0YXRlLk9VVF9PRl9EQVRFICk7XG4gICAgICAgIG9mZmxpbmVOb2RlLnZpc2libGUgPSAoIHN0YXRlID09PSBVcGRhdGVTdGF0ZS5PRkZMSU5FICk7XG5cbiAgICAgICAgLy8gcGRvbSAtIG1ha2UgdXBkYXRlIGNvbnRlbnQgdmlzaWJsZS9pbnZpc2libGUgZm9yIHNjcmVlbiByZWFkZXJzIGJ5IGV4cGxpY2l0bHkgcmVtb3ZpbmcgY29udGVudFxuICAgICAgICAvLyBmcm9tIHRoZSBET00sIG5lY2Vzc2FyeSBiZWNhdXNlIEFUIHdpbGwgcmVhZHkgaGlkZGVuIGNvbnRlbnQgaW4gYSBEaWFsb2cuXG4gICAgICAgIGNoZWNraW5nTm9kZS5wZG9tVmlzaWJsZSA9IGNoZWNraW5nTm9kZS52aXNpYmxlO1xuICAgICAgICB1cFRvRGF0ZU5vZGUucGRvbVZpc2libGUgPSB1cFRvRGF0ZU5vZGUudmlzaWJsZTtcbiAgICAgICAgb3V0T2ZEYXRlTm9kZS5wZG9tVmlzaWJsZSA9IG91dE9mRGF0ZU5vZGUudmlzaWJsZTtcbiAgICAgICAgb2ZmbGluZU5vZGUucGRvbVZpc2libGUgPSBvZmZsaW5lTm9kZS52aXNpYmxlO1xuICAgICAgfTtcblxuICAgICAgdXBkYXRlUGFuZWwgPSBuZXcgTm9kZSgge1xuICAgICAgICBjaGlsZHJlbjogW1xuICAgICAgICAgIGNoZWNraW5nTm9kZSxcbiAgICAgICAgICB1cFRvRGF0ZU5vZGUsXG4gICAgICAgICAgb3V0T2ZEYXRlTm9kZSxcbiAgICAgICAgICBvZmZsaW5lTm9kZVxuICAgICAgICBdLFxuICAgICAgICBtYXhXaWR0aDogTUFYX1dJRFRILFxuICAgICAgICB2aXNpYmxlUHJvcGVydHk6IGFsbG93TGlua3NQcm9wZXJ0eVxuICAgICAgfSApO1xuXG4gICAgICBjaGlsZHJlbi5wdXNoKCB1cGRhdGVQYW5lbCApO1xuICAgIH1cblxuICAgIGNvbnN0IGJyYW5kQ2hpbGRyZW4gPSBbXTtcblxuICAgIC8vIFNob3cgdGhlIGJyYW5kIG5hbWUsIGlmIGl0IGV4aXN0c1xuICAgIGlmICggQnJhbmQubmFtZSApIHtcbiAgICAgIGJyYW5kQ2hpbGRyZW4ucHVzaCggbmV3IFZvaWNpbmdSaWNoVGV4dCggQnJhbmQubmFtZSwge1xuICAgICAgICBmb250OiBuZXcgUGhldEZvbnQoIE5PTUlOQUxfRk9OVF9TSVpFICksXG4gICAgICAgIHN1cFNjYWxlOiAwLjUsXG4gICAgICAgIHN1cFlPZmZzZXQ6IDMsXG4gICAgICAgIG1heFdpZHRoOiBNQVhfV0lEVEgsXG5cbiAgICAgICAgLy8gcGRvbVxuICAgICAgICB0YWdOYW1lOiAnaDInLFxuICAgICAgICBpbm5lckNvbnRlbnQ6IEJyYW5kLm5hbWVcbiAgICAgIH0gKSApO1xuICAgIH1cblxuICAgIC8vIFNob3cgdGhlIGJyYW5kIGNvcHlyaWdodCBzdGF0ZW1lbnQsIGlmIGl0IGV4aXN0c1xuICAgIGlmICggQnJhbmQuY29weXJpZ2h0ICkge1xuICAgICAgY29uc3QgeWVhciA9IHBoZXQuY2hpcHBlci5idWlsZFRpbWVzdGFtcCA/IC8vIGRlZmluZWQgZm9yIGJ1aWx0IHZlcnNpb25zXG4gICAgICAgICAgICAgICAgICAgcGhldC5jaGlwcGVyLmJ1aWxkVGltZXN0YW1wLnNwbGl0KCAnLScgKVsgMCBdIDogLy8gZS5nLiBcIjIwMTctMDQtMjAgMTk6MDQ6NTkgVVRDXCIgLT4gXCIyMDE3XCJcbiAgICAgICAgICAgICAgICAgICBuZXcgRGF0ZSgpLmdldEZ1bGxZZWFyKCk7IC8vIGluIHVuYnVpbHQgbW9kZVxuXG4gICAgICBjb25zdCBjb3B5cmlnaHQgPSBTdHJpbmdVdGlscy5maWxsSW4oIEJyYW5kLmNvcHlyaWdodCwgeyB5ZWFyOiB5ZWFyIH0gKTtcblxuICAgICAgYnJhbmRDaGlsZHJlbi5wdXNoKCBuZXcgVm9pY2luZ1RleHQoIGNvcHlyaWdodCwge1xuICAgICAgICBmb250OiBuZXcgUGhldEZvbnQoIDAuNzUgKiBOT01JTkFMX0ZPTlRfU0laRSApLFxuICAgICAgICBtYXhXaWR0aDogTUFYX1dJRFRILFxuXG4gICAgICAgIC8vIHBkb21cbiAgICAgICAgdGFnTmFtZTogJ3AnLFxuICAgICAgICBpbm5lckNvbnRlbnQ6IGNvcHlyaWdodFxuICAgICAgfSApICk7XG4gICAgfVxuXG4gICAgbGV0IGFkZGl0aW9uYWxMaWNlbnNlU3RhdGVtZW50OiBOb2RlIHwgbnVsbCA9IG51bGw7XG5cbiAgICAvLyBPcHRpb25hbCBhZGRpdGlvbmFsTGljZW5zZVN0YXRlbWVudCwgdXNlZCBpbiBwaGV0LWlvXG4gICAgaWYgKCBCcmFuZC5hZGRpdGlvbmFsTGljZW5zZVN0YXRlbWVudCApIHtcbiAgICAgIGFkZGl0aW9uYWxMaWNlbnNlU3RhdGVtZW50ID0gbmV3IFZvaWNpbmdSaWNoVGV4dCggQnJhbmQuYWRkaXRpb25hbExpY2Vuc2VTdGF0ZW1lbnQsIHtcbiAgICAgICAgICBmb250OiBuZXcgUGhldEZvbnQoIDAuNjUgKiBOT01JTkFMX0ZPTlRfU0laRSApLFxuICAgICAgICAgIGZpbGw6ICdncmF5JyxcbiAgICAgICAgICBhbGlnbjogJ2xlZnQnLFxuICAgICAgICAgIG1heFdpZHRoOiBNQVhfV0lEVEgsXG5cbiAgICAgICAgICAvLyBwZG9tXG4gICAgICAgICAgdGFnTmFtZTogJ3AnLFxuICAgICAgICAgIGlubmVyQ29udGVudDogQnJhbmQuYWRkaXRpb25hbExpY2Vuc2VTdGF0ZW1lbnRcbiAgICAgICAgfVxuICAgICAgKTtcbiAgICAgIGJyYW5kQ2hpbGRyZW4ucHVzaCggYWRkaXRpb25hbExpY2Vuc2VTdGF0ZW1lbnQgKTtcbiAgICB9XG5cbiAgICBpZiAoIGJyYW5kQ2hpbGRyZW4ubGVuZ3RoID4gMCApIHtcbiAgICAgIGNoaWxkcmVuLnB1c2goIG5ldyBWU3RydXQoIDE1ICkgKTtcbiAgICAgIGNoaWxkcmVuID0gY2hpbGRyZW4uY29uY2F0KCBicmFuZENoaWxkcmVuICk7XG4gICAgfVxuXG4gICAgbGV0IGNyZWRpdHNOb2RlOiBOb2RlIHwgbnVsbCA9IG51bGw7XG5cbiAgICAvLyBBZGQgY3JlZGl0cyBmb3Igc3BlY2lmaWMgYnJhbmRzXG4gICAgaWYgKCAoIEJyYW5kLmlkID09PSAncGhldCcgfHwgQnJhbmQuaWQgPT09ICdwaGV0LWlvJyApICkge1xuICAgICAgY2hpbGRyZW4ucHVzaCggbmV3IFZTdHJ1dCggMTUgKSApO1xuICAgICAgY3JlZGl0c05vZGUgPSBuZXcgQ3JlZGl0c05vZGUoIGNyZWRpdHMsIHtcbiAgICAgICAgdGl0bGVGb250OiBuZXcgUGhldEZvbnQoIHsgc2l6ZTogTk9NSU5BTF9GT05UX1NJWkUsIHdlaWdodDogJ2JvbGQnIH0gKSxcbiAgICAgICAgdGV4dEZvbnQ6IG5ldyBQaGV0Rm9udCggMC43NSAqIE5PTUlOQUxfRk9OVF9TSVpFICksXG4gICAgICAgIG1heFdpZHRoOiBNQVhfV0lEVEhcbiAgICAgIH0gKTtcbiAgICAgIGNoaWxkcmVuLnB1c2goIGNyZWRpdHNOb2RlICk7XG4gICAgfVxuXG4gICAgLy8gU2hvdyBhbnkgbGlua3MgaWRlbnRpZmllZCBpbiB0aGUgYnJhbmRcbiAgICBjb25zdCBsaW5rcyA9IEJyYW5kLmdldExpbmtzKCBwYWNrYWdlSlNPTi5uYW1lLCBsb2NhbGVQcm9wZXJ0eS52YWx1ZSApO1xuICAgIGlmICggbGlua3MgJiYgbGlua3MubGVuZ3RoID4gMCApIHtcblxuICAgICAgLy8gU2hvdyB0aGUgbGlua3MgaW4gYSBzZXBhcmF0ZSBWQm94IHNvIHRoZXkgd2lsbCBoYXZlIHRoZSBzYW1lIE1BWF9XSURUSCBhbmQgaGVuY2UgdGhlIHNhbWUgZm9udCBzaXplLlxuICAgICAgY29uc3QgbGlua3NQYXJlbnQgPSBuZXcgVkJveCgge1xuICAgICAgICBzcGFjaW5nOiA2LFxuICAgICAgICBhbGlnbjogJ2xlZnQnLFxuICAgICAgICBtYXhXaWR0aDogTUFYX1dJRFRIXG4gICAgICB9ICk7XG4gICAgICBjaGlsZHJlbi5wdXNoKCBsaW5rc1BhcmVudCApO1xuXG4gICAgICAvLyBDcmVhdGUgbmV3IGxpbmtzIHdoZW5ldmVyIHRoZSBsb2NhbGUgY2hhbmdlcywgZm9yIGFuIHVwIHRvIGRhdGUgdHJhbnNsYXRvciBVUkwuXG4gICAgICBsb2NhbGVQcm9wZXJ0eS5saW5rKCBsb2NhbGUgPT4ge1xuICAgICAgICBsaW5rc1BhcmVudC5jaGlsZHJlbi5mb3JFYWNoKCBjaGlsZCA9PiBjaGlsZC5kaXNwb3NlKCkgKTtcblxuICAgICAgICBjb25zdCBsaW5rcyA9IEJyYW5kLmdldExpbmtzKCBwYWNrYWdlSlNPTi5uYW1lLCBsb2NhbGUgKTtcbiAgICAgICAgY29uc3QgbGlua3NDaGlsZHJlbjogTm9kZVtdID0gW107XG5cbiAgICAgICAgbGlua3NDaGlsZHJlbi5wdXNoKCBuZXcgVlN0cnV0KCAxNSApICk7XG5cbiAgICAgICAgZm9yICggbGV0IGkgPSAwOyBpIDwgbGlua3MubGVuZ3RoOyBpKysgKSB7XG4gICAgICAgICAgY29uc3QgbGluayA9IGxpbmtzWyBpIF07XG5cbiAgICAgICAgICAvLyBJZiBsaW5rcyBhcmUgYWxsb3dlZCwgdXNlIGh5cGVybGlua3MuIE90aGVyd2lzZSwganVzdCBvdXRwdXQgdGhlIFVSTC4gVGhpcyBkb2Vzbid0IG5lZWQgdG8gYmUgaW50ZXJuYXRpb25hbGl6ZWQuXG4gICAgICAgICAgY29uc3Qgc3RyaW5nUHJvcGVydHkgPSBuZXcgRGVyaXZlZFN0cmluZ1Byb3BlcnR5KCBbIGFsbG93TGlua3NQcm9wZXJ0eSwgbGluay50ZXh0U3RyaW5nUHJvcGVydHkgXSwgKCBhbGxvd0xpbmtzLCBsaW5rVGV4dCApID0+IHtcbiAgICAgICAgICAgIHJldHVybiBhbGxvd0xpbmtzID8gYDxhIGhyZWY9XCJ7e3VybH19XCI+JHtsaW5rVGV4dH08L2E+YCA6IGAke2xpbmtUZXh0fTogJHtsaW5rLnVybH1gO1xuICAgICAgICAgIH0gKTtcblxuICAgICAgICAgIC8vIFRoaXMgaXMgUGhFVC1pTyBpbnN0cnVtZW50ZWQgYmVjYXVzZSBpdCBpcyBhIGtleWJvYXJkIG5hdmlnYXRpb24gZm9jdXNhYmxlIGVsZW1lbnQuXG4gICAgICAgICAgY29uc3QgcmljaFRleHQgPSBuZXcgUmljaFRleHQoIHN0cmluZ1Byb3BlcnR5LCB7XG4gICAgICAgICAgICBsaW5rczogeyB1cmw6IGxpbmsudXJsIH0sIC8vIFJpY2hUZXh0IG11c3QgZmlsbCBpbiBVUkwgZm9yIGxpbmtcbiAgICAgICAgICAgIGZvbnQ6IG5ldyBQaGV0Rm9udCggTk9NSU5BTF9GT05UX1NJWkUgKVxuICAgICAgICAgIH0gKTtcbiAgICAgICAgICByaWNoVGV4dC5kaXNwb3NlRW1pdHRlci5hZGRMaXN0ZW5lciggKCkgPT4ge1xuICAgICAgICAgICAgc3RyaW5nUHJvcGVydHkuZGlzcG9zZSgpO1xuICAgICAgICAgIH0gKTtcbiAgICAgICAgICBsaW5rc0NoaWxkcmVuLnB1c2goIHJpY2hUZXh0ICk7XG4gICAgICAgIH1cblxuICAgICAgICBsaW5rc1BhcmVudC5jaGlsZHJlbiA9IGxpbmtzQ2hpbGRyZW47XG4gICAgICB9ICk7XG4gICAgfVxuXG4gICAgY29uc3QgY29udGVudCA9IG5ldyBWQm94KCB7XG4gICAgICBhbGlnbjogJ2xlZnQnLFxuICAgICAgc3BhY2luZzogNixcbiAgICAgIGNoaWxkcmVuOiBjaGlsZHJlbixcblxuICAgICAgLy8gcGRvbSAtIGFjY2Vzc2libGUgY29udGFpbmVyIGZvciBhbGwgQWJvdXREaWFsb2cgY29udGVudFxuICAgICAgdGFnTmFtZTogJ2RpdidcbiAgICB9ICk7XG5cbiAgICBzdXBlciggY29udGVudCwgb3B0aW9ucyApO1xuXG4gICAgdGhpcy51cGRhdGVTdGVwTGlzdGVuZXIgPSB1cGRhdGVTdGVwTGlzdGVuZXI7XG4gICAgdGhpcy51cGRhdGVWaXNpYmlsaXR5TGlzdGVuZXIgPSB1cGRhdGVWaXNpYmlsaXR5TGlzdGVuZXI7XG5cbiAgICAvLyBwZG9tIC0gc2V0IGxhYmVsIGFzc29jaWF0aW9uIHNvIHRoZSB0aXRsZSBpcyByZWFkIHdoZW4gZm9jdXMgZW50ZXJzIHRoZSBkaWFsb2dcbiAgICB0aGlzLmFkZEFyaWFMYWJlbGxlZGJ5QXNzb2NpYXRpb24oIHtcbiAgICAgIHRoaXNFbGVtZW50TmFtZTogUERPTVBlZXIuUFJJTUFSWV9TSUJMSU5HLFxuICAgICAgb3RoZXJFbGVtZW50TmFtZTogUERPTVBlZXIuUFJJTUFSWV9TSUJMSU5HLFxuICAgICAgb3RoZXJOb2RlOiB0aXRsZVRleHRcbiAgICB9ICk7XG4gIH1cblxuICAvKipcbiAgICogV2hlbiB0aGUgZGlhbG9nIGlzIHNob3duLCBhZGQgdXBkYXRlIGxpc3RlbmVycy5cbiAgICovXG4gIHB1YmxpYyBvdmVycmlkZSBzaG93KCk6IHZvaWQge1xuICAgIGlmICggIXRoaXMuc2hvdWxkU2hvd1BvcHVwKCkgKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGlmICggdXBkYXRlQ2hlY2suYXJlVXBkYXRlc0NoZWNrZWQgJiYgIXRoaXMuaXNTaG93aW5nUHJvcGVydHkudmFsdWUgKSB7XG4gICAgICB1cGRhdGVDaGVjay5yZXNldFRpbWVvdXQoKTtcblxuICAgICAgLy8gRmlyZSBvZmYgYSBuZXcgdXBkYXRlIGNoZWNrIGlmIHdlIHdlcmUgbWFya2VkIGFzIG9mZmxpbmUgb3IgdW5jaGVja2VkIGJlZm9yZSwgYW5kIHdlIGhhbmRsZSB1cGRhdGVzLlxuICAgICAgaWYgKCB1cGRhdGVDaGVjay5zdGF0ZVByb3BlcnR5LnZhbHVlID09PSBVcGRhdGVTdGF0ZS5PRkZMSU5FIHx8IHVwZGF0ZUNoZWNrLnN0YXRlUHJvcGVydHkudmFsdWUgPT09IFVwZGF0ZVN0YXRlLlVOQ0hFQ0tFRCApIHtcbiAgICAgICAgdXBkYXRlQ2hlY2suY2hlY2soKTtcbiAgICAgIH1cblxuICAgICAgdGhpcy51cGRhdGVTdGVwTGlzdGVuZXIgJiYgc3RlcFRpbWVyLmFkZExpc3RlbmVyKCB0aGlzLnVwZGF0ZVN0ZXBMaXN0ZW5lciApO1xuICAgICAgdGhpcy51cGRhdGVWaXNpYmlsaXR5TGlzdGVuZXIgJiYgdXBkYXRlQ2hlY2suc3RhdGVQcm9wZXJ0eS5saW5rKCB0aGlzLnVwZGF0ZVZpc2liaWxpdHlMaXN0ZW5lciApO1xuICAgIH1cblxuICAgIHN1cGVyLnNob3coKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBXaGVuIHRoZSBkaWFsb2cgaXMgaGlkZGVuLCByZW1vdmUgdXBkYXRlIGxpc3RlbmVycy5cbiAgICovXG4gIHB1YmxpYyBvdmVycmlkZSBoaWRlKCk6IHZvaWQge1xuICAgIGlmICggdGhpcy5pc1Nob3dpbmdQcm9wZXJ0eS52YWx1ZSApIHtcbiAgICAgIHN1cGVyLmhpZGUoKTtcblxuICAgICAgaWYgKCB1cGRhdGVDaGVjay5hcmVVcGRhdGVzQ2hlY2tlZCApIHtcbiAgICAgICAgdGhpcy51cGRhdGVWaXNpYmlsaXR5TGlzdGVuZXIgJiYgdXBkYXRlQ2hlY2suc3RhdGVQcm9wZXJ0eS51bmxpbmsoIHRoaXMudXBkYXRlVmlzaWJpbGl0eUxpc3RlbmVyICk7XG4gICAgICAgIHRoaXMudXBkYXRlU3RlcExpc3RlbmVyICYmIHN0ZXBUaW1lci5yZW1vdmVMaXN0ZW5lciggdGhpcy51cGRhdGVTdGVwTGlzdGVuZXIgKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cblxuam9pc3QucmVnaXN0ZXIoICdBYm91dERpYWxvZycsIEFib3V0RGlhbG9nICk7Il0sIm5hbWVzIjpbIkRlcml2ZWRQcm9wZXJ0eSIsIkRlcml2ZWRTdHJpbmdQcm9wZXJ0eSIsInN0ZXBUaW1lciIsIm9wdGlvbml6ZSIsIlN0cmluZ1V0aWxzIiwiUGhldEZvbnQiLCJhbGxvd0xpbmtzUHJvcGVydHkiLCJOb2RlIiwiUERPTVBlZXIiLCJSaWNoVGV4dCIsIlZCb3giLCJWb2ljaW5nUmljaFRleHQiLCJWb2ljaW5nVGV4dCIsIlZTdHJ1dCIsIkRpYWxvZyIsIlRhbmRlbSIsIkNyZWRpdHNOb2RlIiwibG9jYWxlUHJvcGVydHkiLCJqb2lzdCIsIkpvaXN0U3RyaW5ncyIsInBhY2thZ2VKU09OIiwidXBkYXRlQ2hlY2siLCJVcGRhdGVOb2RlcyIsIlVwZGF0ZVN0YXRlIiwiTUFYX1dJRFRIIiwiTk9NSU5BTF9GT05UX1NJWkUiLCJBYm91dERpYWxvZyIsInNob3ciLCJzaG91bGRTaG93UG9wdXAiLCJhcmVVcGRhdGVzQ2hlY2tlZCIsImlzU2hvd2luZ1Byb3BlcnR5IiwidmFsdWUiLCJyZXNldFRpbWVvdXQiLCJzdGF0ZVByb3BlcnR5IiwiT0ZGTElORSIsIlVOQ0hFQ0tFRCIsImNoZWNrIiwidXBkYXRlU3RlcExpc3RlbmVyIiwiYWRkTGlzdGVuZXIiLCJ1cGRhdGVWaXNpYmlsaXR5TGlzdGVuZXIiLCJsaW5rIiwiaGlkZSIsInVubGluayIsInJlbW92ZUxpc3RlbmVyIiwibmFtZVN0cmluZ1Byb3BlcnR5IiwidmVyc2lvbiIsImNyZWRpdHMiLCJwcm92aWRlZE9wdGlvbnMiLCJvcHRpb25zIiwieFNwYWNpbmciLCJ0b3BNYXJnaW4iLCJib3R0b21NYXJnaW4iLCJsZWZ0TWFyZ2luIiwicGhldGlvUmVhZE9ubHkiLCJwaGV0aW9EeW5hbWljRWxlbWVudCIsImlzRGlzcG9zYWJsZSIsImFjY2Vzc2libGVOYW1lIiwidGFuZGVtIiwiUkVRVUlSRUQiLCJCcmFuZCIsInBoZXQiLCJicmFuZCIsImFzc2VydCIsImNoaWxkcmVuIiwidGl0bGVUZXh0IiwiZm9udCIsIm1heFdpZHRoIiwicmVhZGluZ0Jsb2NrRGlzYWJsZWRUYWdOYW1lIiwicHVzaCIsInZlcnNpb25TdHJpbmdQcm9wZXJ0eSIsInZlcnNpb25QYXR0ZXJuU3RyaW5nUHJvcGVydHkiLCJ2ZXJzaW9uUGF0dGVybiIsImZvcm1hdCIsInRhZ05hbWUiLCJjaGlwcGVyIiwiYnVpbGRUaW1lc3RhbXAiLCJpbm5lckNvbnRlbnQiLCJ1cGRhdGVQYW5lbCIsInBvc2l0aW9uT3B0aW9ucyIsImxlZnQiLCJ0b3AiLCJjaGVja2luZ05vZGUiLCJjcmVhdGVDaGVja2luZ05vZGUiLCJ1cFRvRGF0ZU5vZGUiLCJjcmVhdGVVcFRvRGF0ZU5vZGUiLCJvdXRPZkRhdGVOb2RlIiwiY3JlYXRlT3V0T2ZEYXRlQWJvdXROb2RlIiwib2ZmbGluZU5vZGUiLCJjcmVhdGVPZmZsaW5lTm9kZSIsInN0ZXBMaXN0ZW5lciIsInN0YXRlIiwidmlzaWJsZSIsIkNIRUNLSU5HIiwiVVBfVE9fREFURSIsIk9VVF9PRl9EQVRFIiwicGRvbVZpc2libGUiLCJ2aXNpYmxlUHJvcGVydHkiLCJicmFuZENoaWxkcmVuIiwibmFtZSIsInN1cFNjYWxlIiwic3VwWU9mZnNldCIsImNvcHlyaWdodCIsInllYXIiLCJzcGxpdCIsIkRhdGUiLCJnZXRGdWxsWWVhciIsImZpbGxJbiIsImFkZGl0aW9uYWxMaWNlbnNlU3RhdGVtZW50IiwiZmlsbCIsImFsaWduIiwibGVuZ3RoIiwiY29uY2F0IiwiY3JlZGl0c05vZGUiLCJpZCIsInRpdGxlRm9udCIsInNpemUiLCJ3ZWlnaHQiLCJ0ZXh0Rm9udCIsImxpbmtzIiwiZ2V0TGlua3MiLCJsaW5rc1BhcmVudCIsInNwYWNpbmciLCJsb2NhbGUiLCJmb3JFYWNoIiwiY2hpbGQiLCJkaXNwb3NlIiwibGlua3NDaGlsZHJlbiIsImkiLCJzdHJpbmdQcm9wZXJ0eSIsInRleHRTdHJpbmdQcm9wZXJ0eSIsImFsbG93TGlua3MiLCJsaW5rVGV4dCIsInVybCIsInJpY2hUZXh0IiwiZGlzcG9zZUVtaXR0ZXIiLCJjb250ZW50IiwiYWRkQXJpYUxhYmVsbGVkYnlBc3NvY2lhdGlvbiIsInRoaXNFbGVtZW50TmFtZSIsIlBSSU1BUllfU0lCTElORyIsIm90aGVyRWxlbWVudE5hbWUiLCJvdGhlck5vZGUiLCJyZWdpc3RlciJdLCJtYXBwaW5ncyI6IkFBQUEsc0RBQXNEO0FBRXREOzs7O0NBSUMsR0FHRCxPQUFPQSxxQkFBcUIsbUNBQW1DO0FBQy9ELE9BQU9DLDJCQUEyQix5Q0FBeUM7QUFDM0UsT0FBT0MsZUFBZSw2QkFBNkI7QUFHbkQsT0FBT0MsZUFBcUMsa0NBQWtDO0FBQzlFLE9BQU9DLGlCQUFpQiwwQ0FBMEM7QUFDbEUsT0FBT0MsY0FBYyxvQ0FBb0M7QUFDekQsU0FBU0Msa0JBQWtCLEVBQUVDLElBQUksRUFBRUMsUUFBUSxFQUFFQyxRQUFRLEVBQUVDLElBQUksRUFBRUMsZUFBZSxFQUFFQyxXQUFXLEVBQUVDLE1BQU0sUUFBUSw4QkFBOEI7QUFDdkksT0FBT0MsWUFBK0IseUJBQXlCO0FBQy9ELE9BQU9DLFlBQVksNEJBQTRCO0FBQy9DLE9BQU9DLGlCQUFrQyxtQkFBbUI7QUFDNUQsT0FBT0Msb0JBQW9CLDJCQUEyQjtBQUN0RCxPQUFPQyxXQUFXLGFBQWE7QUFDL0IsT0FBT0Msa0JBQWtCLG9CQUFvQjtBQUM3QyxPQUFPQyxpQkFBaUIsbUJBQW1CO0FBQzNDLE9BQU9DLGlCQUFpQixtQkFBbUI7QUFDM0MsT0FBT0MsaUJBQWlCLG1CQUFtQjtBQUMzQyxPQUFPQyxpQkFBaUIsbUJBQW1CO0FBRTNDLFlBQVk7QUFDWixNQUFNQyxZQUFZ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