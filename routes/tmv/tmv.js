exports.tmv = function(req, res) {
    console.log(req.query);
    res.render('tmv/tmv', {
        title: 'Edmunds Widgets - True Market Value&reg; Widget',
        url: req.protocol + '://' + req.headers.host,
        portal: req.query.portal === 'true',            // used by developers portal to hide some elements from the page
        debug: req.query.debug === 'true'
    });
};
