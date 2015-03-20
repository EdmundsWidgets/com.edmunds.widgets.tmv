var less = require('less'),
    fs = require('fs'),
    JSONResponse = require('../../../app/response').JSONResponse;

exports.render = function(request, response) {
    var resp = new JSONResponse(response);
    var requestBody = request.body;
    var options = {};

    var filename = getFileName(requestBody.style);

    //console.log(filename);

    function fileReadingCallback(error, input) {
        if (error) {
            resp.error('File not found.');
            return console.log(error);
        }
        // add custom variables
        input += getVariables(requestBody.variables);
        // compile less to css
        less.render(input, {
            paths: ['src/less/tmvwidget/themes'],
            compress: true
        }, renderLessCallback);
    }

    function renderLessCallback(error, css) {
        if (error) {
            resp.error('Error while compiling less.');
            return console.log(error);
        }
        console.log(css);
        resp.success(css);
    }

    fs.readFile(filename, 'utf8', fileReadingCallback);

};

function getFileName(options) {
    options = options || {};
    var root = 'src/less/tmvwidget/themes';
    var theme = options.theme || 'simple';
    var colorScheme = options.colorScheme || 'light';
    var layout = options.layout || 'vertical';
    var name = [root, '/', theme, '-', layout, '.less'].join('');
    //var name = [root, '/', theme, '-', colorScheme, '.less'].join('');
    return name;
}

function getFileNameLess(options) {
    options = options || {};
    var root = 'src/less/tmvwidget/themes';
    var theme = options.theme || 'simple';
    var colorScheme = options.colorScheme || 'light';
    var layout = options.layout || 'vertical';
    //var name = [root, '/', theme, '-', layout, '.less'].join('');
    var name = [root, '/', theme, '-', colorScheme, '.less'].join('');
    return name;
}

function getVariables(records) {
    var str = '', name;
    for (name in records) {
        str += ((name.slice(0,1) === '@')? '' : '@') + name +': '+
            ((records[name].slice(-1) === ';')? records[name] : records[name] +';');
    }
    return str;
}

exports.getFileName = getFileName;
exports.getVariables = getVariables;