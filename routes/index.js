//exports.glance = require('./glance/glance');
//exports.ppb = require('./ppb/ppb');
exports.index = function(req, res) {
    res.render('index', { title: 'Edmunds Widgets', url: req.protocol + '://' + req.headers.host });
};
