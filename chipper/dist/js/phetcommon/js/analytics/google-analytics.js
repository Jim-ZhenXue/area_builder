// Copyright 2012-2024, University of Colorado Boulder
/**
 * Google analytics collection for HTML5 sims.
 * Code provided by Google and Hewlett, possibly doctored by PhET.
 *
 * NOTE: Please be careful about modifications, as it relies on external scripts.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */ (function() {
    // If yotta has been turned off by query parameter, don't send any messages.
    if (!phet.chipper.queryParameters.yotta) {
        return;
    }
    const locale = phet.chipper.remappedLocale;
    assert && assert(window.phet && phet.chipper, 'We will require multiple things from the chipper preload namespace');
    assert && assert(!!phet.chipper.brand, 'A brand is required, since some messages depend on the brand');
    assert && assert(!!phet.chipper.queryParameters, 'We will need query parameters to be parsed for multiple purposes');
    assert && assert(!!phet.chipper.buildTimestamp, 'buildTimestamp is required for GA messages');
    assert && assert(!!phet.chipper.project, 'project is required for GA messages');
    assert && assert(!!phet.chipper.version, 'version is required for GA messages');
    assert && assert(!!locale, 'locale is required for GA messages');
    const ua = navigator.userAgent;
    const hasIESecurityRestrictions = !!(ua.match(/MSIE/) || ua.match(/Trident\//) || ua.match(/Edge\//));
    // If we're in some form of IE running offline, don't attempt to make a cross-origin request.
    // See https://github.com/phetsims/joist/issues/164
    if (window.location.protocol === 'file:' && hasIESecurityRestrictions) {
        return;
    }
    // Don't track sims that we didn't develop
    if (phet.chipper.brand !== 'phet' && phet.chipper.brand !== 'phet-io') {
        return;
    }
    let loadType;
    // This is the iOS app
    if (phet.chipper.queryParameters['phet-app']) {
        loadType = 'phet-app';
    } else if (phet.chipper.queryParameters['phet-android-app']) {
        loadType = 'phet-android-app';
    } else if (top !== self) {
        // Checks to see if this sim is embedded - phetsims/chipper#50
        loadType = 'embedded';
    } else {
        loadType = 'default';
    }
    function sendMessages() {
        // {boolean} - Whether an error was detected with anything relating to google analytics.
        // See https://github.com/phetsims/yotta/issues/30
        let googleAnalyticsErrored = false;
        window.addEventListener('error', (event)=>{
            if (event && event.target && event.target.src && event.target.src.indexOf && event.target.src.indexOf('google-analytics') >= 0) {
                googleAnalyticsErrored = true;
            }
        }, true);
        let pingParams = `${'pingver=3&' + 'project='}${encodeURIComponent(phet.chipper.project)}&` + `brand=${encodeURIComponent(phet.chipper.brand)}&` + `version=${encodeURIComponent(phet.chipper.version)}&` + `locale=${encodeURIComponent(locale)}&` + `buildTimestamp=${encodeURIComponent(phet.chipper.buildTimestamp)}&` + `domain=${encodeURIComponent(document.domain)}&` + `href=${encodeURIComponent(window.location.href)}&` + 'type=html&' + `timestamp=${encodeURIComponent(Date.now())}&` + `loadType=${encodeURIComponent(loadType)}&` + `ref=${encodeURIComponent(document.referrer)}`;
        // Forward yotta-specific query parameters, see https://github.com/phetsims/phetcommon/issues/66
        for (const [key, value] of new URLSearchParams(window.location.search)){
            if (key.startsWith('yotta')) {
                pingParams += `&${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
            }
        }
        function pingURL(url) {
            const img = document.createElement('img');
            img.src = url;
        }
        pingURL(`https://phet.colorado.edu/yotta/immediate.gif?${pingParams}`);
        window.addEventListener('load', (event)=>{
            pingURL(`https://phet.colorado.edu/yotta/sanity.gif?${pingParams}&` + `gaError=${encodeURIComponent(googleAnalyticsErrored)}&` + `gaLoaded=${encodeURIComponent(false)}`);
        }, false);
        // External GA4 tracker
        if (phet.chipper.queryParameters.ga4) {
            // Use a custom data layer to both (a) get gtag.js and gtm to work at the same time, and (b) don't provide the
            // extra data to third parties by default
            window.ga4DataLayer = window.ga4DataLayer || [];
            // NOTE: Using the GA-provided function here, to be extra cautious.
            function gtag() {
                ga4DataLayer.push(arguments);
            } // eslint-disable-line no-undef,prefer-rest-params
            gtag('js', new Date());
            gtag('consent', 'default', {
                ad_storage: 'denied',
                analytics_storage: 'granted'
            });
            // EEA analytics storage denied for cookies, see https://github.com/phetsims/website/issues/1190
            gtag('consent', 'default', {
                ad_storage: 'denied',
                analytics_storage: 'denied',
                region: [
                    'BE',
                    'BG',
                    'CZ',
                    'DK',
                    'CY',
                    'LV',
                    'LT',
                    'LU',
                    'ES',
                    'FR',
                    'HR',
                    'IT',
                    'PL',
                    'PT',
                    'RO',
                    'SI',
                    'HU',
                    'MT',
                    'NL',
                    'AT',
                    'IS',
                    'LI',
                    'NO',
                    'SK',
                    'FI',
                    'SE',
                    'DE',
                    'EE',
                    'IE',
                    'EL',
                    'GB',
                    'CH'
                ]
            });
            gtag('config', phet.chipper.queryParameters.ga4);
            // Dynamically load the script
            const firstScript = document.getElementsByTagName('script')[0];
            const script = document.createElement('script');
            script.async = true;
            // `l` query parameter allows a different data layer name
            script.src = `https://www.googletagmanager.com/gtag/js?id=${phet.chipper.queryParameters.ga4}&l=ga4DataLayer`;
            firstScript.parentNode.insertBefore(script, firstScript);
        }
        // For some reason, having dataLayer declaration here might have fixed the ability to use gtag.js and gtm.js at the
        // same time. Don't move without testing.
        window.dataLayer = window.dataLayer || [];
        function gtmTag() {
            window.dataLayer.push(arguments); // eslint-disable-line prefer-rest-params
        }
        gtmTag('consent', 'default', {
            ad_storage: 'denied',
            analytics_storage: 'granted'
        });
        // EEA analytics storage denied for cookies, see https://github.com/phetsims/website/issues/1190
        gtmTag('consent', 'default', {
            ad_storage: 'denied',
            analytics_storage: 'denied',
            region: [
                'BE',
                'BG',
                'CZ',
                'DK',
                'CY',
                'LV',
                'LT',
                'LU',
                'ES',
                'FR',
                'HR',
                'IT',
                'PL',
                'PT',
                'RO',
                'SI',
                'HU',
                'MT',
                'NL',
                'AT',
                'IS',
                'LI',
                'NO',
                'SK',
                'FI',
                'SE',
                'DE',
                'EE',
                'IE',
                'EL',
                'GB',
                'CH'
            ]
        });
        window.dataLayer.push({
            simBrand: phet.chipper.brand,
            simName: phet.chipper.project,
            simVersion: phet.chipper.version,
            simLocale: locale,
            simBuildTimestamp: phet.chipper.buildTimestamp,
            simLoadType: loadType,
            documentReferrer: document.referrer
        });
        // Google Tag Manager (gtm.js) - Identical to recommended snippet with eslint disables to keep it this way.
        (function(w, d, s, l, i) {
            w[l] = w[l] || [];
            w[l].push({
                'gtm.start': new Date().getTime(),
                event: 'gtm.js'
            });
            var f = d.getElementsByTagName(s)[0], j = d.createElement(s), dl = l != 'dataLayer' ? '&l=' + l : '';
            j.async = true;
            j.src = 'https://www.googletagmanager.com/gtm.js?id=' + i + dl;
            f.parentNode.insertBefore(j, f);
        })(window, document, 'script', 'dataLayer', 'GTM-WLNGBXD'); // eslint-disable-line space-infix-ops,space-in-parens,comma-spacing,key-spacing,one-var,semi-spacing,eqeqeq,computed-property-spacing,no-var,one-var-declaration-per-line,object-curly-spacing,space-before-blocks
    }
    if (loadType === 'phet-app') {
        window.addEventListener('load', ()=>{
            setTimeout(sendMessages, 0); // eslint-disable-line phet/bad-sim-text
        }, false);
    } else {
        sendMessages();
    }
})();

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3BoZXRjb21tb24vanMvYW5hbHl0aWNzL2dvb2dsZS1hbmFseXRpY3MuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTItMjAyNCwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXG5cbi8qKlxuICogR29vZ2xlIGFuYWx5dGljcyBjb2xsZWN0aW9uIGZvciBIVE1MNSBzaW1zLlxuICogQ29kZSBwcm92aWRlZCBieSBHb29nbGUgYW5kIEhld2xldHQsIHBvc3NpYmx5IGRvY3RvcmVkIGJ5IFBoRVQuXG4gKlxuICogTk9URTogUGxlYXNlIGJlIGNhcmVmdWwgYWJvdXQgbW9kaWZpY2F0aW9ucywgYXMgaXQgcmVsaWVzIG9uIGV4dGVybmFsIHNjcmlwdHMuXG4gKlxuICogQGF1dGhvciBTYW0gUmVpZCAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcbiAqL1xuXG4oIGZ1bmN0aW9uKCkge1xuICAvLyBJZiB5b3R0YSBoYXMgYmVlbiB0dXJuZWQgb2ZmIGJ5IHF1ZXJ5IHBhcmFtZXRlciwgZG9uJ3Qgc2VuZCBhbnkgbWVzc2FnZXMuXG4gIGlmICggIXBoZXQuY2hpcHBlci5xdWVyeVBhcmFtZXRlcnMueW90dGEgKSB7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgY29uc3QgbG9jYWxlID0gcGhldC5jaGlwcGVyLnJlbWFwcGVkTG9jYWxlO1xuXG4gIGFzc2VydCAmJiBhc3NlcnQoIHdpbmRvdy5waGV0ICYmIHBoZXQuY2hpcHBlciwgJ1dlIHdpbGwgcmVxdWlyZSBtdWx0aXBsZSB0aGluZ3MgZnJvbSB0aGUgY2hpcHBlciBwcmVsb2FkIG5hbWVzcGFjZScgKTtcbiAgYXNzZXJ0ICYmIGFzc2VydCggISFwaGV0LmNoaXBwZXIuYnJhbmQsICdBIGJyYW5kIGlzIHJlcXVpcmVkLCBzaW5jZSBzb21lIG1lc3NhZ2VzIGRlcGVuZCBvbiB0aGUgYnJhbmQnICk7XG4gIGFzc2VydCAmJiBhc3NlcnQoICEhcGhldC5jaGlwcGVyLnF1ZXJ5UGFyYW1ldGVycywgJ1dlIHdpbGwgbmVlZCBxdWVyeSBwYXJhbWV0ZXJzIHRvIGJlIHBhcnNlZCBmb3IgbXVsdGlwbGUgcHVycG9zZXMnICk7XG4gIGFzc2VydCAmJiBhc3NlcnQoICEhcGhldC5jaGlwcGVyLmJ1aWxkVGltZXN0YW1wLCAnYnVpbGRUaW1lc3RhbXAgaXMgcmVxdWlyZWQgZm9yIEdBIG1lc3NhZ2VzJyApO1xuICBhc3NlcnQgJiYgYXNzZXJ0KCAhIXBoZXQuY2hpcHBlci5wcm9qZWN0LCAncHJvamVjdCBpcyByZXF1aXJlZCBmb3IgR0EgbWVzc2FnZXMnICk7XG4gIGFzc2VydCAmJiBhc3NlcnQoICEhcGhldC5jaGlwcGVyLnZlcnNpb24sICd2ZXJzaW9uIGlzIHJlcXVpcmVkIGZvciBHQSBtZXNzYWdlcycgKTtcbiAgYXNzZXJ0ICYmIGFzc2VydCggISFsb2NhbGUsICdsb2NhbGUgaXMgcmVxdWlyZWQgZm9yIEdBIG1lc3NhZ2VzJyApO1xuXG4gIGNvbnN0IHVhID0gbmF2aWdhdG9yLnVzZXJBZ2VudDtcbiAgY29uc3QgaGFzSUVTZWN1cml0eVJlc3RyaWN0aW9ucyA9ICEhKCB1YS5tYXRjaCggL01TSUUvICkgfHwgdWEubWF0Y2goIC9UcmlkZW50XFwvLyApIHx8IHVhLm1hdGNoKCAvRWRnZVxcLy8gKSApO1xuXG4gIC8vIElmIHdlJ3JlIGluIHNvbWUgZm9ybSBvZiBJRSBydW5uaW5nIG9mZmxpbmUsIGRvbid0IGF0dGVtcHQgdG8gbWFrZSBhIGNyb3NzLW9yaWdpbiByZXF1ZXN0LlxuICAvLyBTZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2pvaXN0L2lzc3Vlcy8xNjRcbiAgaWYgKCB3aW5kb3cubG9jYXRpb24ucHJvdG9jb2wgPT09ICdmaWxlOicgJiYgaGFzSUVTZWN1cml0eVJlc3RyaWN0aW9ucyApIHtcbiAgICByZXR1cm47XG4gIH1cblxuICAvLyBEb24ndCB0cmFjayBzaW1zIHRoYXQgd2UgZGlkbid0IGRldmVsb3BcbiAgaWYgKCBwaGV0LmNoaXBwZXIuYnJhbmQgIT09ICdwaGV0JyAmJiBwaGV0LmNoaXBwZXIuYnJhbmQgIT09ICdwaGV0LWlvJyApIHtcbiAgICByZXR1cm47XG4gIH1cblxuICBsZXQgbG9hZFR5cGU7XG4gIC8vIFRoaXMgaXMgdGhlIGlPUyBhcHBcbiAgaWYgKCBwaGV0LmNoaXBwZXIucXVlcnlQYXJhbWV0ZXJzWyAncGhldC1hcHAnIF0gKSB7XG4gICAgbG9hZFR5cGUgPSAncGhldC1hcHAnO1xuICB9XG4gIC8vIEZvciB0aGUgQW5kcm9pZCBhcHAsIHNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvcGhldC1hbmRyb2lkLWFwcC9pc3N1ZXMvMTZcbiAgZWxzZSBpZiAoIHBoZXQuY2hpcHBlci5xdWVyeVBhcmFtZXRlcnNbICdwaGV0LWFuZHJvaWQtYXBwJyBdICkge1xuICAgIGxvYWRUeXBlID0gJ3BoZXQtYW5kcm9pZC1hcHAnO1xuICB9XG4gIGVsc2UgaWYgKCB0b3AgIT09IHNlbGYgKSB7XG4gICAgLy8gQ2hlY2tzIHRvIHNlZSBpZiB0aGlzIHNpbSBpcyBlbWJlZGRlZCAtIHBoZXRzaW1zL2NoaXBwZXIjNTBcbiAgICBsb2FkVHlwZSA9ICdlbWJlZGRlZCc7XG4gIH1cbiAgLy8gVE9ETyBBZGQgYWRkaXRpb25hbCBjb25kaXRpb25zIGZvciB0cmFja2luZyBoaXRzIGZyb20gdGhlIGluc3RhbGxlciwgZXRjLiBTZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3BoZXRjb21tb24vaXNzdWVzLzQ5XG4gIGVsc2Uge1xuICAgIGxvYWRUeXBlID0gJ2RlZmF1bHQnO1xuICB9XG5cbiAgZnVuY3Rpb24gc2VuZE1lc3NhZ2VzKCkge1xuICAgIC8vIHtib29sZWFufSAtIFdoZXRoZXIgYW4gZXJyb3Igd2FzIGRldGVjdGVkIHdpdGggYW55dGhpbmcgcmVsYXRpbmcgdG8gZ29vZ2xlIGFuYWx5dGljcy5cbiAgICAvLyBTZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3lvdHRhL2lzc3Vlcy8zMFxuICAgIGxldCBnb29nbGVBbmFseXRpY3NFcnJvcmVkID0gZmFsc2U7XG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoICdlcnJvcicsIGV2ZW50ID0+IHtcbiAgICAgIGlmICggZXZlbnQgJiZcbiAgICAgICAgICAgZXZlbnQudGFyZ2V0ICYmXG4gICAgICAgICAgIGV2ZW50LnRhcmdldC5zcmMgJiZcbiAgICAgICAgICAgZXZlbnQudGFyZ2V0LnNyYy5pbmRleE9mICYmXG4gICAgICAgICAgIGV2ZW50LnRhcmdldC5zcmMuaW5kZXhPZiggJ2dvb2dsZS1hbmFseXRpY3MnICkgPj0gMCApIHtcbiAgICAgICAgZ29vZ2xlQW5hbHl0aWNzRXJyb3JlZCA9IHRydWU7XG4gICAgICB9XG4gICAgfSwgdHJ1ZSApO1xuXG4gICAgbGV0IHBpbmdQYXJhbXMgPSBgJHsncGluZ3Zlcj0zJicgK1xuICAgICAgJ3Byb2plY3Q9J30ke2VuY29kZVVSSUNvbXBvbmVudCggcGhldC5jaGlwcGVyLnByb2plY3QgKX0mYCArXG4gICAgICBgYnJhbmQ9JHtlbmNvZGVVUklDb21wb25lbnQoIHBoZXQuY2hpcHBlci5icmFuZCApfSZgICtcbiAgICAgIGB2ZXJzaW9uPSR7ZW5jb2RlVVJJQ29tcG9uZW50KCBwaGV0LmNoaXBwZXIudmVyc2lvbiApfSZgICtcbiAgICAgIGBsb2NhbGU9JHtlbmNvZGVVUklDb21wb25lbnQoIGxvY2FsZSApfSZgICtcbiAgICAgIGBidWlsZFRpbWVzdGFtcD0ke2VuY29kZVVSSUNvbXBvbmVudCggcGhldC5jaGlwcGVyLmJ1aWxkVGltZXN0YW1wICl9JmAgK1xuICAgICAgYGRvbWFpbj0ke2VuY29kZVVSSUNvbXBvbmVudCggZG9jdW1lbnQuZG9tYWluICl9JmAgK1xuICAgICAgYGhyZWY9JHtlbmNvZGVVUklDb21wb25lbnQoIHdpbmRvdy5sb2NhdGlvbi5ocmVmICl9JmAgK1xuICAgICAgJ3R5cGU9aHRtbCYnICtcbiAgICAgIGB0aW1lc3RhbXA9JHtlbmNvZGVVUklDb21wb25lbnQoIERhdGUubm93KCkgKX0mYCArXG4gICAgICBgbG9hZFR5cGU9JHtlbmNvZGVVUklDb21wb25lbnQoIGxvYWRUeXBlICl9JmAgK1xuICAgICAgYHJlZj0ke2VuY29kZVVSSUNvbXBvbmVudCggZG9jdW1lbnQucmVmZXJyZXIgKX1gO1xuXG4gICAgLy8gRm9yd2FyZCB5b3R0YS1zcGVjaWZpYyBxdWVyeSBwYXJhbWV0ZXJzLCBzZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3BoZXRjb21tb24vaXNzdWVzLzY2XG4gICAgZm9yICggY29uc3QgWyBrZXksIHZhbHVlIF0gb2YgbmV3IFVSTFNlYXJjaFBhcmFtcyggd2luZG93LmxvY2F0aW9uLnNlYXJjaCApICkge1xuICAgICAgaWYgKCBrZXkuc3RhcnRzV2l0aCggJ3lvdHRhJyApICkge1xuICAgICAgICBwaW5nUGFyYW1zICs9IGAmJHtlbmNvZGVVUklDb21wb25lbnQoIGtleSApfT0ke2VuY29kZVVSSUNvbXBvbmVudCggdmFsdWUgKX1gO1xuICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIHBpbmdVUkwoIHVybCApIHtcbiAgICAgIGNvbnN0IGltZyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoICdpbWcnICk7XG4gICAgICBpbWcuc3JjID0gdXJsO1xuICAgIH1cblxuICAgIHBpbmdVUkwoIGBodHRwczovL3BoZXQuY29sb3JhZG8uZWR1L3lvdHRhL2ltbWVkaWF0ZS5naWY/JHtwaW5nUGFyYW1zfWAgKTtcblxuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCAnbG9hZCcsIGV2ZW50ID0+IHtcbiAgICAgIHBpbmdVUkwoIGBodHRwczovL3BoZXQuY29sb3JhZG8uZWR1L3lvdHRhL3Nhbml0eS5naWY/JHtwaW5nUGFyYW1zfSZgICtcbiAgICAgICAgICAgICAgIGBnYUVycm9yPSR7ZW5jb2RlVVJJQ29tcG9uZW50KCBnb29nbGVBbmFseXRpY3NFcnJvcmVkICl9JmAgK1xuICAgICAgICAgICAgICAgYGdhTG9hZGVkPSR7ZW5jb2RlVVJJQ29tcG9uZW50KCBmYWxzZSApfWAgKTtcbiAgICB9LCBmYWxzZSApO1xuXG4gICAgLy8gRXh0ZXJuYWwgR0E0IHRyYWNrZXJcbiAgICBpZiAoIHBoZXQuY2hpcHBlci5xdWVyeVBhcmFtZXRlcnMuZ2E0ICkge1xuICAgICAgLy8gVXNlIGEgY3VzdG9tIGRhdGEgbGF5ZXIgdG8gYm90aCAoYSkgZ2V0IGd0YWcuanMgYW5kIGd0bSB0byB3b3JrIGF0IHRoZSBzYW1lIHRpbWUsIGFuZCAoYikgZG9uJ3QgcHJvdmlkZSB0aGVcbiAgICAgIC8vIGV4dHJhIGRhdGEgdG8gdGhpcmQgcGFydGllcyBieSBkZWZhdWx0XG4gICAgICB3aW5kb3cuZ2E0RGF0YUxheWVyID0gd2luZG93LmdhNERhdGFMYXllciB8fCBbXTtcblxuICAgICAgLy8gTk9URTogVXNpbmcgdGhlIEdBLXByb3ZpZGVkIGZ1bmN0aW9uIGhlcmUsIHRvIGJlIGV4dHJhIGNhdXRpb3VzLlxuICAgICAgZnVuY3Rpb24gZ3RhZygpIHsgZ2E0RGF0YUxheWVyLnB1c2goIGFyZ3VtZW50cyApOyB9IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tdW5kZWYscHJlZmVyLXJlc3QtcGFyYW1zXG5cbiAgICAgIGd0YWcoICdqcycsIG5ldyBEYXRlKCkgKTtcbiAgICAgIGd0YWcoICdjb25zZW50JywgJ2RlZmF1bHQnLCB7XG4gICAgICAgIGFkX3N0b3JhZ2U6ICdkZW5pZWQnLFxuICAgICAgICBhbmFseXRpY3Nfc3RvcmFnZTogJ2dyYW50ZWQnXG4gICAgICB9ICk7XG4gICAgICAvLyBFRUEgYW5hbHl0aWNzIHN0b3JhZ2UgZGVuaWVkIGZvciBjb29raWVzLCBzZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3dlYnNpdGUvaXNzdWVzLzExOTBcbiAgICAgIGd0YWcoICdjb25zZW50JywgJ2RlZmF1bHQnLCB7XG4gICAgICAgIGFkX3N0b3JhZ2U6ICdkZW5pZWQnLFxuICAgICAgICBhbmFseXRpY3Nfc3RvcmFnZTogJ2RlbmllZCcsXG4gICAgICAgIHJlZ2lvbjogWyAnQkUnLCAnQkcnLCAnQ1onLCAnREsnLCAnQ1knLCAnTFYnLCAnTFQnLCAnTFUnLCAnRVMnLCAnRlInLCAnSFInLCAnSVQnLCAnUEwnLCAnUFQnLCAnUk8nLCAnU0knLCAnSFUnLCAnTVQnLCAnTkwnLCAnQVQnLCAnSVMnLCAnTEknLCAnTk8nLCAnU0snLCAnRkknLCAnU0UnLCAnREUnLCAnRUUnLCAnSUUnLCAnRUwnLCAnR0InLCAnQ0gnIF1cbiAgICAgIH0gKTtcbiAgICAgIGd0YWcoICdjb25maWcnLCBwaGV0LmNoaXBwZXIucXVlcnlQYXJhbWV0ZXJzLmdhNCApO1xuXG4gICAgICAvLyBEeW5hbWljYWxseSBsb2FkIHRoZSBzY3JpcHRcbiAgICAgIGNvbnN0IGZpcnN0U2NyaXB0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoICdzY3JpcHQnIClbIDAgXTtcbiAgICAgIGNvbnN0IHNjcmlwdCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoICdzY3JpcHQnICk7XG4gICAgICBzY3JpcHQuYXN5bmMgPSB0cnVlO1xuXG4gICAgICAvLyBgbGAgcXVlcnkgcGFyYW1ldGVyIGFsbG93cyBhIGRpZmZlcmVudCBkYXRhIGxheWVyIG5hbWVcbiAgICAgIHNjcmlwdC5zcmMgPSBgaHR0cHM6Ly93d3cuZ29vZ2xldGFnbWFuYWdlci5jb20vZ3RhZy9qcz9pZD0ke3BoZXQuY2hpcHBlci5xdWVyeVBhcmFtZXRlcnMuZ2E0fSZsPWdhNERhdGFMYXllcmA7XG4gICAgICBmaXJzdFNjcmlwdC5wYXJlbnROb2RlLmluc2VydEJlZm9yZSggc2NyaXB0LCBmaXJzdFNjcmlwdCApO1xuICAgIH1cblxuICAgIC8vIEZvciBzb21lIHJlYXNvbiwgaGF2aW5nIGRhdGFMYXllciBkZWNsYXJhdGlvbiBoZXJlIG1pZ2h0IGhhdmUgZml4ZWQgdGhlIGFiaWxpdHkgdG8gdXNlIGd0YWcuanMgYW5kIGd0bS5qcyBhdCB0aGVcbiAgICAvLyBzYW1lIHRpbWUuIERvbid0IG1vdmUgd2l0aG91dCB0ZXN0aW5nLlxuICAgIHdpbmRvdy5kYXRhTGF5ZXIgPSB3aW5kb3cuZGF0YUxheWVyIHx8IFtdO1xuICAgIGZ1bmN0aW9uIGd0bVRhZygpIHtcbiAgICAgICAgd2luZG93LmRhdGFMYXllci5wdXNoKCBhcmd1bWVudHMgKTsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBwcmVmZXItcmVzdC1wYXJhbXNcbiAgICB9XG4gICAgZ3RtVGFnKCAnY29uc2VudCcsICdkZWZhdWx0Jywge1xuICAgICAgYWRfc3RvcmFnZTogJ2RlbmllZCcsXG4gICAgICBhbmFseXRpY3Nfc3RvcmFnZTogJ2dyYW50ZWQnXG4gICAgfSApO1xuICAgIC8vIEVFQSBhbmFseXRpY3Mgc3RvcmFnZSBkZW5pZWQgZm9yIGNvb2tpZXMsIHNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvd2Vic2l0ZS9pc3N1ZXMvMTE5MFxuICAgIGd0bVRhZyggJ2NvbnNlbnQnLCAnZGVmYXVsdCcsIHtcbiAgICAgIGFkX3N0b3JhZ2U6ICdkZW5pZWQnLFxuICAgICAgYW5hbHl0aWNzX3N0b3JhZ2U6ICdkZW5pZWQnLFxuICAgICAgcmVnaW9uOiBbICdCRScsICdCRycsICdDWicsICdESycsICdDWScsICdMVicsICdMVCcsICdMVScsICdFUycsICdGUicsICdIUicsICdJVCcsICdQTCcsICdQVCcsICdSTycsICdTSScsICdIVScsICdNVCcsICdOTCcsICdBVCcsICdJUycsICdMSScsICdOTycsICdTSycsICdGSScsICdTRScsICdERScsICdFRScsICdJRScsICdFTCcsICdHQicsICdDSCcgXVxuICAgIH0gKTtcbiAgICB3aW5kb3cuZGF0YUxheWVyLnB1c2goIHtcbiAgICAgIHNpbUJyYW5kOiBwaGV0LmNoaXBwZXIuYnJhbmQsXG4gICAgICBzaW1OYW1lOiBwaGV0LmNoaXBwZXIucHJvamVjdCxcbiAgICAgIHNpbVZlcnNpb246IHBoZXQuY2hpcHBlci52ZXJzaW9uLFxuICAgICAgc2ltTG9jYWxlOiBsb2NhbGUsXG4gICAgICBzaW1CdWlsZFRpbWVzdGFtcDogcGhldC5jaGlwcGVyLmJ1aWxkVGltZXN0YW1wLFxuICAgICAgc2ltTG9hZFR5cGU6IGxvYWRUeXBlLFxuICAgICAgZG9jdW1lbnRSZWZlcnJlcjogZG9jdW1lbnQucmVmZXJyZXJcbiAgICB9ICk7XG5cbiAgICAvLyBHb29nbGUgVGFnIE1hbmFnZXIgKGd0bS5qcykgLSBJZGVudGljYWwgdG8gcmVjb21tZW5kZWQgc25pcHBldCB3aXRoIGVzbGludCBkaXNhYmxlcyB0byBrZWVwIGl0IHRoaXMgd2F5LlxuICAgIChmdW5jdGlvbih3LGQscyxsLGkpe3dbbF09d1tsXXx8W107d1tsXS5wdXNoKHsnZ3RtLnN0YXJ0JzpuZXcgRGF0ZSgpLmdldFRpbWUoKSxldmVudDonZ3RtLmpzJ30pO3ZhciBmPWQuZ2V0RWxlbWVudHNCeVRhZ05hbWUocylbMF0saj1kLmNyZWF0ZUVsZW1lbnQocyksZGw9bCE9J2RhdGFMYXllcic/JyZsPScrbDonJztqLmFzeW5jPXRydWU7ai5zcmM9J2h0dHBzOi8vd3d3Lmdvb2dsZXRhZ21hbmFnZXIuY29tL2d0bS5qcz9pZD0nK2krZGw7Zi5wYXJlbnROb2RlLmluc2VydEJlZm9yZShqLGYpO30pKHdpbmRvdyxkb2N1bWVudCwnc2NyaXB0JywnZGF0YUxheWVyJywnR1RNLVdMTkdCWEQnKTsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBzcGFjZS1pbmZpeC1vcHMsc3BhY2UtaW4tcGFyZW5zLGNvbW1hLXNwYWNpbmcsa2V5LXNwYWNpbmcsb25lLXZhcixzZW1pLXNwYWNpbmcsZXFlcWVxLGNvbXB1dGVkLXByb3BlcnR5LXNwYWNpbmcsbm8tdmFyLG9uZS12YXItZGVjbGFyYXRpb24tcGVyLWxpbmUsb2JqZWN0LWN1cmx5LXNwYWNpbmcsc3BhY2UtYmVmb3JlLWJsb2Nrc1xuICB9XG5cbiAgaWYgKCBsb2FkVHlwZSA9PT0gJ3BoZXQtYXBwJyApIHtcbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lciggJ2xvYWQnLCAoKSA9PiB7XG4gICAgICBzZXRUaW1lb3V0KCBzZW5kTWVzc2FnZXMsIDAgKTsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBwaGV0L2JhZC1zaW0tdGV4dFxuICAgIH0sIGZhbHNlICk7XG4gIH1cbiAgZWxzZSB7XG4gICAgc2VuZE1lc3NhZ2VzKCk7XG4gIH1cbn0gKSgpOyJdLCJuYW1lcyI6WyJwaGV0IiwiY2hpcHBlciIsInF1ZXJ5UGFyYW1ldGVycyIsInlvdHRhIiwibG9jYWxlIiwicmVtYXBwZWRMb2NhbGUiLCJhc3NlcnQiLCJ3aW5kb3ciLCJicmFuZCIsImJ1aWxkVGltZXN0YW1wIiwicHJvamVjdCIsInZlcnNpb24iLCJ1YSIsIm5hdmlnYXRvciIsInVzZXJBZ2VudCIsImhhc0lFU2VjdXJpdHlSZXN0cmljdGlvbnMiLCJtYXRjaCIsImxvY2F0aW9uIiwicHJvdG9jb2wiLCJsb2FkVHlwZSIsInRvcCIsInNlbGYiLCJzZW5kTWVzc2FnZXMiLCJnb29nbGVBbmFseXRpY3NFcnJvcmVkIiwiYWRkRXZlbnRMaXN0ZW5lciIsImV2ZW50IiwidGFyZ2V0Iiwic3JjIiwiaW5kZXhPZiIsInBpbmdQYXJhbXMiLCJlbmNvZGVVUklDb21wb25lbnQiLCJkb2N1bWVudCIsImRvbWFpbiIsImhyZWYiLCJEYXRlIiwibm93IiwicmVmZXJyZXIiLCJrZXkiLCJ2YWx1ZSIsIlVSTFNlYXJjaFBhcmFtcyIsInNlYXJjaCIsInN0YXJ0c1dpdGgiLCJwaW5nVVJMIiwidXJsIiwiaW1nIiwiY3JlYXRlRWxlbWVudCIsImdhNCIsImdhNERhdGFMYXllciIsImd0YWciLCJwdXNoIiwiYXJndW1lbnRzIiwiYWRfc3RvcmFnZSIsImFuYWx5dGljc19zdG9yYWdlIiwicmVnaW9uIiwiZmlyc3RTY3JpcHQiLCJnZXRFbGVtZW50c0J5VGFnTmFtZSIsInNjcmlwdCIsImFzeW5jIiwicGFyZW50Tm9kZSIsImluc2VydEJlZm9yZSIsImRhdGFMYXllciIsImd0bVRhZyIsInNpbUJyYW5kIiwic2ltTmFtZSIsInNpbVZlcnNpb24iLCJzaW1Mb2NhbGUiLCJzaW1CdWlsZFRpbWVzdGFtcCIsInNpbUxvYWRUeXBlIiwiZG9jdW1lbnRSZWZlcnJlciIsInciLCJkIiwicyIsImwiLCJpIiwiZ2V0VGltZSIsImYiLCJqIiwiZGwiLCJzZXRUaW1lb3V0Il0sIm1hcHBpbmdzIjoiQUFBQSxzREFBc0Q7QUFFdEQ7Ozs7Ozs7Q0FPQyxHQUVDLENBQUE7SUFDQSw0RUFBNEU7SUFDNUUsSUFBSyxDQUFDQSxLQUFLQyxPQUFPLENBQUNDLGVBQWUsQ0FBQ0MsS0FBSyxFQUFHO1FBQ3pDO0lBQ0Y7SUFFQSxNQUFNQyxTQUFTSixLQUFLQyxPQUFPLENBQUNJLGNBQWM7SUFFMUNDLFVBQVVBLE9BQVFDLE9BQU9QLElBQUksSUFBSUEsS0FBS0MsT0FBTyxFQUFFO0lBQy9DSyxVQUFVQSxPQUFRLENBQUMsQ0FBQ04sS0FBS0MsT0FBTyxDQUFDTyxLQUFLLEVBQUU7SUFDeENGLFVBQVVBLE9BQVEsQ0FBQyxDQUFDTixLQUFLQyxPQUFPLENBQUNDLGVBQWUsRUFBRTtJQUNsREksVUFBVUEsT0FBUSxDQUFDLENBQUNOLEtBQUtDLE9BQU8sQ0FBQ1EsY0FBYyxFQUFFO0lBQ2pESCxVQUFVQSxPQUFRLENBQUMsQ0FBQ04sS0FBS0MsT0FBTyxDQUFDUyxPQUFPLEVBQUU7SUFDMUNKLFVBQVVBLE9BQVEsQ0FBQyxDQUFDTixLQUFLQyxPQUFPLENBQUNVLE9BQU8sRUFBRTtJQUMxQ0wsVUFBVUEsT0FBUSxDQUFDLENBQUNGLFFBQVE7SUFFNUIsTUFBTVEsS0FBS0MsVUFBVUMsU0FBUztJQUM5QixNQUFNQyw0QkFBNEIsQ0FBQyxDQUFHSCxDQUFBQSxHQUFHSSxLQUFLLENBQUUsV0FBWUosR0FBR0ksS0FBSyxDQUFFLGdCQUFpQkosR0FBR0ksS0FBSyxDQUFFLFNBQVM7SUFFMUcsNkZBQTZGO0lBQzdGLG1EQUFtRDtJQUNuRCxJQUFLVCxPQUFPVSxRQUFRLENBQUNDLFFBQVEsS0FBSyxXQUFXSCwyQkFBNEI7UUFDdkU7SUFDRjtJQUVBLDBDQUEwQztJQUMxQyxJQUFLZixLQUFLQyxPQUFPLENBQUNPLEtB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