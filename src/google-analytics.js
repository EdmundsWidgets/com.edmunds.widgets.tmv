// Add Google Analytics
window._gaq = window._gaq || [];
_gaq.push(['_setAccount', 'UA-24637375-1']);
_gaq.push(['_setDomainName', window.location.host]);
_gaq.push(['_trackPageview']);

(function() {
    var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
    ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
    var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
})();
