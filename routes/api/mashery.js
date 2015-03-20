var http = require('http'),
	crypto = require('crypto'),
	url = require('url'),
	zlib = require('zlib'),
    EventEmmiter = require('events').EventEmitter,
    config =  require('../../config');
function httpRequest(options, content, onSuccess, onFail) {
	
	function handleResponse(response) {
        var chunks = [];
	    response.on('data', function(chunk) {
	      	chunks.push(chunk);
	    });
	    
        response.on('end', function() {
        	var data = Buffer.concat(chunks),
        		encoding = response.headers['content-encoding'];
        	try {
			    if(encoding == 'gzip' || encoding == 'deflate') {
			    	zlib.unzip(data, function(error, decoded) {
			    		if(!error) {
			    			onSuccess(decoded.toString(), response.statusCode);
			    		} else {
			    			onFail(error);
			    		}
			        });
			    } else {
			        onSuccess(data.toString(), response.statusCode);
			    }
            } catch(e) {
            	console.log('problem with decoding ' + encoding + ' response: ' + e);
            	onFail(e.message);
            }
        });
    }
    
	var request = http.request(options, handleResponse);
    
	request.on('error', function(e) {
        console.log('problem with request to ' + options.path + ':' + e);
        onFail(e.message);
    });

	request.setHeader('Connection', 'Keep-Alive');
	if(content) {
	    request.setHeader('Content-Length', Buffer.byteLength(content));
		request.write(content);
	}
	request.end();
}

var mashery = new function() {

	var HOST = 'api.mashery.com';

	var SITE_ID = '273';

	var API_KEY = 'pn96cgxajuykqvj4jnvpyh7n';

	var SHARED_SECRET = 'nMCbkwYnZ8';

	var SERVICE_KEY = {
		vehicle	: 's5wuwsw26pdr33bbjj7vahqu',
		dealer : 'edsckygh7ggn5wftjc77psah'
	};

	this.keyValidate = function(serviceName, apiKey, onSuccess, onFail) {
		function validate(key) {
			if(!key.error) {
				onSuccess({valid: key.result && key.result.status == 'active' ? true : false});
			} else {
				onFail({
					errorType: 'KEY_VALIDATION_ERROR',
					message: key.error ? key.error.message : 'Invalid key.fetch response'
				});
			}
		}
		this.keyFetch(serviceName, apiKey, validate, onFail);
	};

	this.keyFetch = function(serviceName, apiKey, onSuccess, onFail) {
		var params = {
			service_key : SERVICE_KEY[serviceName],
			apikey : apiKey
		};
		jsonRpcQuery('key.fetch', params, onSuccess, onFail);
	};

	function jsonRpcQuery(method, params, onSuccess, onFail) {
		var options = {
		        host : HOST,
		        path : getJsonRpcUrl(),
		        method : 'POST',
		        headers : {
		        	'Content-Type' : 'application/json'
		        }
		    },
			jsonRpcRequest = {
				method : method,
				params : [ params ],
				id : 1
	        };
	    function handleError(error) {
			onFail({
				errorType: 'JSON_RPC_ERROR',
				message: error
			});
		}
		function handleResponse(data) {
			try {
				onSuccess(JSON.parse(data));
			} catch(e) {
				handleError('Invalid JSON RPC response: ' + data);
			}
		}
		httpRequest(options, JSON.stringify(jsonRpcRequest), handleResponse, handleError);
	}

	function getJsonRpcUrl() {
		return '/v2/json-rpc/' + SITE_ID + '?apikey=' + API_KEY + '&sig=' + getSig();
	}

	function getSig() {
		var epoch = Math.round(new Date().getTime()/1000.0),
			md5sum = crypto.createHash('md5');
		md5sum.update(API_KEY + SHARED_SECRET + epoch);
		return md5sum.digest('hex');
	}
};

var dealerOAuth = new function() {

	var HOST = 'api.edmunds.com';
	
	var API_KEY = 'bgpgahr67yxm6v3eryjedb4r';
	
	var SHARED_SECRET = '7RGtBBvTMf93fFHMEneqJ97T';
	
	var TOKEN_PATH = '/dealer/token';
	
	this.accessToken = function(onSuccess, onFail) {
		var options = {
		        host : HOST,
		        path : TOKEN_PATH,
		        method : 'POST',
		        headers : {
		        	'Content-Type' : 'application/x-www-form-urlencoded'
		        }
		    },
		    clientData = 'client_id=' + API_KEY + '&client_secret=' + SHARED_SECRET + '&grant_type=client_credentials';
		function handleError(error) {
			onFail({
				errorType: 'OAUTH_ACCESS_TOKEN_ERROR',
				message: error
			});
		}
		function getToken(data) {
			var token;
			try {
				token = JSON.parse(data);
				if(token && token.access_token) {
		    		onSuccess(token.access_token);
		    	} else {
		    		handleError(token && token.error ? token.error : 'OAuth access token is missing');
	    		}
			} catch(e) {
				handleError('Invalid data: ' + data);
				console.log('problem with parsing access_token data:' + e);
			}
	    	
		}
		httpRequest(options, clientData, getToken, handleError);
	};

	this.get = function(path, query, onSuccess, onFail) {
		function oAuthQuery(accessToken) {
    		var options = {
		        host : HOST,
		        path : path + '?' + query,
		        headers : {
		        	'Content-Type' : 'application/x-www-form-urlencoded',
		        	'Authorization' : 'Bearer ' + accessToken
		        }
		    };
		    httpRequest(options, null, onSuccess, function(error) {
		    	onFail({
			    	errorType: 'OAUTH_REQUEST_ERROR',
					message: error
		    	});
		    });
	    }
		this.accessToken(oAuthQuery, onFail);
	};
		
};

var oAuth = new function(){
    var HOST = 'api.edmunds.com';

    var API_KEY = config.MASHERY_API_KEY;

    var SHARED_SECRET = config.MASHERY_SHARED_SECRET;

    var TOKEN_PATH = '/inventory/token';

    this.accessToken = function(onSuccess, onFail) {
        var options = {
                host : HOST,
                path : TOKEN_PATH,
                method : 'POST',
                headers : {
                    'Content-Type' : 'application/x-www-form-urlencoded'
                }
            },
            clientData = 'client_id=' + API_KEY + '&client_secret=' + SHARED_SECRET + '&grant_type=client_credentials';
        function handleError(error) {
            onFail({
                errorType: 'OAUTH_ACCESS_TOKEN_ERROR',
                message: error
            });
        }
        function getToken(data) {
            var token;
            try {
                token = JSON.parse(data);
                if(token && token.access_token) {
                    var d = new Date();
                    token.d = d.getTime();
                    onSuccess(token);
                } else {
                    handleError(token && token.error ? token.error : 'OAuth access token is missing');
                }
            } catch(e) {
                handleError('Invalid data: ' + data);
                console.log('problem with parsing access_token data:' + e);
            }
        }
        httpRequest(options, clientData, getToken, handleError);
    };
    this.get = function(onSuccess, onFail) {
        function oAuthQuery(accessToken) { // access_token
            onSuccess(accessToken);
        }
        this.accessToken(oAuthQuery, onFail);
    };

};

var getDataFunction = new function() {

    var HOST = 'api.edmunds.com';

    var API_KEY = 'bgpgahr67yxm6v3eryjedb4r';

    var SHARED_SECRET = '7RGtBBvTMf93fFHMEneqJ97T';

    var TOKEN_PATH = '/inventory/token';

    this.accessToken = function(onSuccess, onFail) {
        var options = {
                host : HOST,
                path : TOKEN_PATH,
                method : 'POST',
                headers : {
                    'Content-Type' : 'application/x-www-form-urlencoded'
                }
            },
            clientData = 'client_id=' + API_KEY + '&client_secret=' + SHARED_SECRET + '&grant_type=client_credentials';
        function handleError(error) {
            onFail({
                errorType: 'OAUTH_ACCESS_TOKEN_ERROR',
                message: error
            });
        }
        function getToken(data) {
            var token;
            try {
                token = JSON.parse(data);
                if(token && token.access_token) {
                    onSuccess(token.access_token);
                } else {
                    handleError(token && token.error ? token.error : 'OAuth access token is missing');
                }
            } catch(e) {
                handleError('Invalid data: ' + data);
                console.log('problem with parsing access_token data:' + e);
            }

        }
        httpRequest(options, clientData, getToken, handleError);
    };

    this.get = function(path, query, onSuccess, onFail) {
        function oAuthQuery(accessToken) {
            var options = {
                host : HOST,
                path : path + '?' + 'vin='+ query.vin +'&zipcode='+ query.zip + '&range=50',
                headers : {
                    'Content-Type' : 'application/x-www-form-urlencoded',
                    'Authorization' : 'Bearer ' + accessToken
                }
            };
            httpRequest(options, null, onSuccess, function(error) {
                onFail({
                    errorType: 'OAUTH_REQUEST_ERROR',
                    message: error
                });
            });
        }
        this.accessToken(oAuthQuery, onFail);
    };


};

var validateZip = new function(){
    var HOST = 'api.edmunds.com';

    this.get = function(path, query, onSuccess, onFail) {
        var options = {
            host : HOST,
            path : path + '/' + query.zip + '?api_key=' + query.api_key,
            headers : {
                'Content-Type' : 'application/json'
            }
        };
        httpRequest(options, null, onSuccess, function(error) {
            onFail({
                errorType: 'ZIP_REQUEST_ERROR',
                message: error
            });
        });
    };
};




var getFullInventoryData = new function(){
    var self = this;

    this.evnt = new EventEmmiter();
    this.init = function(path, config, onSuccess, onFail){
        this.evnt.on('done',function(data){
            self.cache = data;
            self.validateZip(config, self.zipSuccess, self.zipFail);
        });
        if(!this.cache){
            oAuth.get(this.onReadyToken, this.onFailToken);
        }else if(this.cache) {
            console.log('second');
            var currentDate = new Date(),
                currentTime = currentDate.getTime();
            if (currentTime >= (this.cache.d + 3590000)) { //120000
                oAuth.get(this.onReadyToken, this.onFailToken);
//                self.evnt.on('done',function(data){
//                    self.cache = data;
//                    self.validateZip(config, self.zipSuccess, self.zipFail);
//                });
            }else {
                this.validateZip(config, this.zipSuccess, this.zipFail);
            }
		}
	    this.evnt.on('validZip',function(){
//		    self.getInventory = function(){
            var HOST = 'api.edmunds.com';
            var options = {
                host : HOST,
                path : path + '?' + 'vin='+ config.vin +'&zipcode='+ config.zip + '&range=50',
                headers : {
                  'Content-Type' : 'application/x-www-form-urlencoded',
                  'Authorization' : 'Bearer ' + self.cache.access_token
                }
            };
            httpRequest(options, null, onSuccess, function(error) {
                onFail({
                  errorType: 'INVENTORY_REQUEST_ERROR',
                  message: error
                });
            });
	    });
    };
    this.onReadyToken = function(data){
        if(data){
            self.evnt.emit('done',data);
        }
    };
    this.onFailToken = function(err){
        if(err) throw err;
    };
    this.validateZip = function(config, onSuccess, onFail){
        var HOST = 'api.edmunds.com';
        var options = {
            host : HOST,
            path : '/v1/api/region/zip/validation/' + config.zip + '?api_key=' + config.api_key,
            headers : {
                'Content-Type' : 'application/json'
            }
        };
        httpRequest(options, null, onSuccess, function(error) {
            onFail({
                errorType: 'ZIP_REQUEST_ERROR',
                message: error
            });
        });
    };
    this.zipSuccess = function(data){
        var zip = JSON.parse(data);
        if(zip){
            for(var i in zip){
                self.zipValid = (zip[i] == 'true') ? true : false;
            }
            if(self.zipValid == true){
                self.evnt.emit('validZip',zip);
            }else {
               console.log('zip invalid');
            }
        }
    };
    this.zipFail = function(err){
       console.log(err);
    };
};





exports.keyValidate = function(request, response) {
    var callbackName = request.query.callback,
    	serviceName = request.query.service,
    	apiKey = request.query.api_key;
	function onSuccess(data) {
		var str = JSON.stringify(data);
		response.end(callbackName ? callbackName + '(' + str + ')' : str);
	}
	function onError(error) {
		var errorStr = JSON.stringify(error);
		response.statusCode = 400;
		response.end(callbackName ? callbackName + '(' + errorStr + ')' : errorStr);
	}
	mashery.keyValidate(serviceName, apiKey, onSuccess, onError);
};

exports.sendLead = function(request, response) {
	var callbackName = request.query.callback,
		queryString = request.url.split('?')[1] || '';
	function onSuccess(data, status) {
		response.statusCode = status;
		response.end(data);
	}
    function onError(error) {
		response.statusCode = 400;
		var errorStr = JSON.stringify(error);
		response.end(callbackName ? callbackName + '(' + errorStr + ')' : errorStr);
	}
    dealerOAuth.get('/api/dealer/v2/lead', queryString, onSuccess, onError);
};

exports.token = function(request, response){
    var callbackName = request.query.callback,
        queryString = request.url.split('?')[1] || '';
    function onSuccess(data, status) {
        response.json({
            access_token: data
        });
        response.end(data);
    }
    function onError(error) {
        response.statusCode = 400;
        var errorStr = JSON.stringify(error);
        response.end(callbackName ? callbackName + '(' + errorStr + ')' : errorStr);
    }
    oAuth.get(onSuccess, onError);
};

exports.getData = function(request, response){
    var callbackName = request.query.callback,
        dataObj = request.body;
    function onSuccess(data, status) {
        var parseData = JSON.parse(data);
        console.log(parseData);
        response.statusCode = status;
        response.setHeader('Access-Control-Allow-Origin','*');
        response.json({
            'gpexperiationDate': parseData.resultsList[0].gpexperiationDate,
            'guaranteedPrice': parseData.resultsList[0].guaranteedPrice,
            'franchiseId': parseData.resultsList[0].franchiseId,
            'locationId':parseData.resultsList[0].dealerLocationId,
            'inventoryId' : parseData.resultsList[0].inventoryId,
            'make' :  parseData.resultsList[0].make,
            'model' :  parseData.resultsList[0].model,
            'sub' :  parseData.resultsList[0].submodel,
            'year' :  parseData.resultsList[0].year
        });
        response.end(data);
    }
    function onError(error) {
        response.statusCode = 400;
        var errorStr = JSON.stringify(error);
        response.end(callbackName ? callbackName + '(' + errorStr + ')' : errorStr);
    }
    getFullInventoryData.init('/api/inventory/v1/lookup',dataObj,onSuccess, onError);

};