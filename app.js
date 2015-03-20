/**
 * Created by Ivan_Kauryshchanka on 3/20/2015.
 */
var express = require('express'),
    routes = require('./routes'),
    http = require('http'),
    https = require('https'),
    url = require('url'),
// tmv
    tmv = require('./routes/tmv/tmv'),
    tmvAbout = require('./routes/tmv/about'),
    tmvLessApi = require('./routes/api/tmv/less'),
// carconfig
//    carconfig = require('./routes/carconfig/carconfig'),
//    carconfigAbout = require('./routes/carconfig/about'),
//    carconfigAboutCohran = require('./routes/carconfig/aboutCohran'),
//    carconfigCohran = require('./routes/carconfig/carconfigCohran'),
//
//    carconfigLessApiV1 = require('./v1/routes/api/carconfig/less'),
//    carconfigLessApi = require('./routes/api/carconfig/less'),
    fs = require('fs'),

masheryApi = require('./routes/api/mashery'),
    path = require('path'),

    fs = require('fs'),
    ejs = require('ejs');


//var options = {
//    key: fs.readFileSync('ssl/hostkey.pem'),
//    cert: fs.readFileSync('ssl/hostcert.pem')
//};
var app = express();

app.configure(function(){
    app.set('port', process.env.PORT || 3002);
    app.set('views', __dirname + '/views');
    app.set('view engine', 'ejs');
    app.use(express.favicon());
    app.use(express.logger('dev'));
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(app.router);
    // less
    app.use(require('less-middleware')({
        src: __dirname + '/src/less',
        dest: __dirname + '/public/css',
        prefix: '/css',
        compress: true
    }));
    // static resources
    app.use(express.static(path.join(__dirname, 'public')));
    //app.use('/nvc', express.static(path.join(__dirname, 'edmunds/widgets/nvc/dist')));
    // bower components
    app.use('/libs', express.static(path.join(__dirname, 'bower_components')));
});

//app.use('/glance', express.static(path.join(__dirname, 'src/js/glance'))); // for development
//app.use('/glance', express.static(path.join(__dirname, 'edmunds/glance/dist')));
//app.use('/ppb', express.static(path.join(__dirname, 'src/js/ppb'))); // for development
//app.use('/ppb', express.static(path.join(__dirname, 'edmunds/ppb/dist')));
app.configure('development', function(){
    app.use(express.errorHandler());
});




app.get('/', routes.index);
// tmv
app.get('/tmv/v2', tmv.tmv);
app.get('/tmv/v2/about', tmvAbout.about);
app.post('/api/tmv/less', tmvLessApi.render);
// carconfig
//app.get('/carconfig/v1', carconfig.carconfig);
//app.get('/carconfig/v1/about', carconfigAbout.about);
//
//app.get('/carconfig/v1/cohran', carconfigCohran.carconfigCohran);
//app.get('/carconfig/v1/cohran/about', carconfigAboutCohran.aboutCohran);
//// glance
//app.get('/glance/configure', routes.glance.configurator);
//app.get('/glance/configure/about', routes.glance.about);
//ppb
//app.get('/ppb/configure', routes.ppb.configurator);
//app.get('/ppb/configure/about', routes.ppb.about);

//app.post('/api/ppb/inventory', masheryApi.getData);
//
//app.post('/api/carconfig/less', carconfigLessApiV1.render);
//app.get('/nvc/api/less', carconfigLessApi.render);

app.get('/api/keyvalidate', masheryApi.keyValidate);

app.get('/dealer/sendlead', masheryApi.sendLead);

app.get('/api/token', masheryApi.token);

//app.get('/nvc/iframe', carconfig.iFrameContent);
//
//app.get('/nvcCohran/iframe', carconfigCohran.iFrameContentCohran);

// redirect to the new SDK
app.get('/js/edm/sdk.js', function(req, res) {
    res.sendfile(__dirname + '/public/js/edm/edmunds-sdk.min.js');
});

app.get('/js/tmv/tmvwidget.js', function(req, res) {
    var filename;
    if (req.query.debug === 'true') {
        filename = __dirname + '/public/js/tmv/tmvwidget.js';
    } else {
        filename = __dirname + '/public/js/tmv/tmvwidget.min.js';
    }
    res.sendfile(filename);
});

app.get('/loader.js', function(req, res) {
    res.setHeader('Content-Type', 'text/javascript');
    res.render('loader', {
        baseUrl: req.protocol + '://' + req.headers.host
    });
});
//
//app.get('/loader-cohran.js', function(req, res) {
//    res.setHeader('Content-Type', 'text/javascript');
//    res.render('loader-cohran', {
//        baseUrl: req.protocol + '://' + req.headers.host
//    });
//});
//app.get('/loader-glance.js', function(req, res) {
//    res.setHeader('Content-Type', 'text/javascript');
//    res.render('loader-glance', {
//        baseUrl: req.protocol + '://' + req.headers.host
//    });
//});
//
//app.get('/loader-ppb.js', function(req, res) {
//    res.setHeader('Content-Type', 'text/javascript');
//    res.render('loader-ppb', {
//        baseUrl: req.protocol + '://' + req.headers.host
//    });
//});
//
//app.get('/nvc/example', function(req, res) {
//    res.render('carconfig/example', {
//        widgetLoaderUrl: req.protocol + '://' + req.headers.host + '/loader.js'
//    });
//});
//
//app.get('/css/carconfig/*', function(req, res) {
//    var fileName = __dirname + '/v1/public' + req.url;
//    res.sendfile(fileName);
//});
//
//app.get('/js/carconfig/*', function(req, res) {
//    var fileName = __dirname + '/v1/public' + req.url;
//    res.sendfile(fileName);
//});

//https.createServer(options,app).listen(4300);
http.createServer(app).listen(app.get('port'), function(){
    console.log("Express server listening on port " + app.get('port'));
});


