/**
 * @for EDM.TMV
 */

// TMV prototype shortcut
var proto = TMV.prototype;

$.extend(TMV.prototype, EDM.Widget.prototype);

/**
 * Bind events.
 *
 * @method bindEvents
 * @chainable
 */
proto.bindEvents = function() {
    // unbind all events
    this.off();
    // change events
    this.on('change:make', this.onMakeChange, this);
    this.on('change:model', this.onModelChange, this);
    this.on('change:year', this.onYearChange, this);
    this.on('change:style', this.onStyleChange, this);
    this.on('change:zip', this.onZipChange, this);
    // reset events
    this.on('reset:make', this.resetModels, this);
    this.on('reset:model', this.resetYears, this);
    this.on('reset:year', this.resetStyles, this);
    this.on('reset:style', this.resetPrice, this);
    // calculate price
    this.on('calculate', this.loadPrice, this);
    this.trackEvents();
    return this;
};

/**
 * Track Google Analytics Events.
 *
 * @method trackEvents
 * @param {String} category The name of category
 * @param {String} action The value of category
 * @param {String} opt_label The label
 * @param {String} opt_value The value
 * @param {String} opt_noninteraction The noninteraction
 */
proto.trackEvents = function() {
    /**
     * @param category
     * @param action
     * @param [opt_label]
     * @param [opt_value]
     * @param [opt_noninteraction]
     * @private
     */
    function _trackEvent(category, action, opt_label, opt_value, opt_noninteraction) {
        _gaq.push(['_trackEvent', category, action, opt_label, opt_value, opt_noninteraction]);
    }
    this.on('init', function() {
        _trackEvent('Widgets', 'TMV Simple', 'A simple TMV widget');
    });
    this.on('change:make', function(value) {
        if (value) _trackEvent('Makes', value, 'A make was selected');
    });
    this.on('change:model', function(value) {
        if (value) _trackEvent('Models', value, 'A model was selected');
    });
    this.on('change:year', function(value) {
        if (value) _trackEvent('Years', value, 'A year was selected');
    });
    this.on('change:style', function(value) {
        if (value) _trackEvent('Styles', value, 'A style was selected');
    });
    this.on('change:zip', function(value) {
        if (value) _trackEvent('ZIP', value, 'A ZIP code was changed');
    });
    this.on('calculate', function() {
        _trackEvent('TVM', 'Click', 'Pricing Info was requested');
    });
    this.on('load:price', function() {
        _trackEvent('TVM', 'Received', 'Pricing Info was received');
    });
};

/**
 * Initialisation of widget.
 * @method init
 * @param {Object} options
 * @example
 *      widget.init({"includedMakes":"acura,aston-martin,audi","price":"tmv-invoice-msrp","showVehicles":"ALL","zip":"90010"});
 * @chainable
 */
proto.init = function(options) {
    options = options || {};
    this.setOptions(options);

    /**
     * Сreate new instance of the EDMUNDSAPI.Vehicle.
     * @property vehiclesApi
     * @type {EDMUNDSAPI.Vehicle}
     */
    this.vehiclesApi = new EDMUNDSAPI.Vehicle(this.getApiKey());
    this.zip = options.zip || '';
    this.trigger('init');
    return this;
};

/**
 * Render a widget.
 * @method render
 * @example
 *      widget.render();
 * @chainable
 */
proto.render = function() {
    var options = this.getOptions();
    this.htmlSetup();
    this.trigger('render');
    if (!this.getApiKey()) {
        return this.resetMakes();
    }
    this.loadMakes(String(options.showVehicles).toLowerCase());
    return this;
};

// Data load methods

/**
 * Request to load list of makes.
 * @method loadMakes
 * @chainable
 */
proto.loadMakes = function(publicationState) {
    var successCallback = $.bind(this.onMakesLoad, this),
        errorCallback = $.bind(this.onMakesLoadError, this);
    this.resetMakes('Loading Makes...');
    this.vehiclesApi.getListOfMakes(publicationState, successCallback, errorCallback);
    return this;
};
/**
 * Request to load a zip code.
 * @method loadZip
 * @param {String} zip Zip Code
 * @chainable
 */
proto.loadZip = function(zip) {
    var successCallback = $.bind(this.onZipLoad, this),
        errorCallback = $.bind(this.onZipLoadError, this);
    this.vehiclesApi.getValidZip(zip, successCallback, errorCallback);
    return this;
};

/**
 * Request to load list of models.
 * @method loadModels
 * @param {String} makeId
 * @chainable
 */
proto.loadModels = function(makeId) {
    var successCallback = $.bind(this.onModelsLoad, this),
        errorCallback = $.bind(this.onModelsLoadError, this);
    this.disableMakes();
    this.vehiclesApi.getListOfModelsByMake(makeId, successCallback, errorCallback);
    return this;
};

/**
 * Request to load a price.
 * @method loadPrice
 * @chainable
 */
proto.loadPrice = function() {
    var isNew = this.showVehicles === 'NEW',
        st = isNew ? 'calculatenewtmv' : 'calculatetypicallyequippedusedtmv',
        url = '/api/tmv/tmvservice/' + st,
        successCallback = isNew ? $.bind(this.onPriceLoad, this) : $.bind(this.loadRangeMin, this),
        errorCallback = $.bind(this.onPriceLoadError, this),
        options = {
            alg:        'rethink',
            styleid:    this.style,
            zip:        this.zip
        };
    this.disableButton();
    this.resetPrice();
    this.vehiclesApi.invoke(url, options, successCallback, errorCallback);
    return this;
};

/**
 * Request to load min price for range .
 * @method loadRangeMin
 * @chainable
 */
proto.loadRangeMin = function(data) {
    var url = '/api/tmv/tmvservice/calculateusedtmv',
        callback = $.bind(this.loadRangeMax, this),
        options = {
            alg:        'rethink',
            styleid:    this.style,
            zip:        this.zip,
            condition:  'ROUGH',
            mileage:    50000
        };
    this.price = this.parsePrice(data);
    this.vehiclesApi.invoke(url, options, callback);
    return this;
};

/**
 * Request to load max price for range.
 * @method loadRangeMax
 * @chainable
 */
proto.loadRangeMax = function(data) {
    var url = '/api/tmv/tmvservice/calculateusedtmv',
        callback = $.bind(this.onPriceLoad, this),
        options = {
            alg:        'rethink',
            styleid:    this.style,
            zip:        this.zip,
            condition:  'OUTSTANDING',
            mileage:    15000
        };
    this.price.rangeMin = this.parsePriceRangeMin(data);
    this.vehiclesApi.invoke(url, options, callback);
    return this;
};

//http://api.edmunds.com/v1/api/tmv/tmvservice/calculateusedtmv?styleid=101381665&zip=12345&mileage=15000&condition=OUTSTANDING&api_key=g2dgxhfatcspkunbb7m33zv6&fmt=json&callback=EDMUNDSAPI.cb1369142284181
//http://api.edmunds.com/v1/api/tmv/tmvservice/calculateusedtmv?styleid=101381665&zip=12345&mileage=50000&condition=ROUGH&api_key=g2dgxhfatcspkunbb7m33zv6&fmt=json&callback=EDMUNDSAPI.cb1369142284181

/**
 * Request to load list of styles.
 * @method loadStyles
 * @param {String} make
 * @param {String} model
 * @param {String} year
 * @chainable
 */
proto.loadStyles = function(make, model, year) {
    var successCallback = $.bind(this.onStylesLoad, this),
        errorCallback = $.bind(this.onStylesLoadError, this);
    this.disableMakes();
    this.disableModels();
    this.disableYears();
    this.vehiclesApi.getVehicle(make, model, year, successCallback, errorCallback);
    return this;
};

// Change callbacks

/**
 * Changed a year.
 * @method onMakeChange
 * @param {String} makeId
 * @chainable
 */
proto.onMakeChange = function(makeId) {
    this.make = makeId;
    if (!makeId) {
        this.resetModels();
        return;
    }
    this.resetModels('Loading Models...');
    this.loadModels(makeId);
    return this;
};

/**
 * Changed a model.
 * @method onModelChange
 * @param {String} modelId
 * @chainable
 */
proto.onModelChange = function(modelId) {
    var model, years;
    if (!modelId) {
        this.resetYears();
        return;
    }
    model = modelId.substring(0, modelId.indexOf(':'));
    years = this.parseYears(this.models[modelId], this.getOptions().showVehicles);
    this.model = model;
    this.resetYears();
    this.setYears(years);
    return this;
};

/**
 * Changed a style.
 * @method onStyleChange
 * @param {String} styleId
 * @chainable
 */
proto.onStyleChange = function(styleId) {
    this.style = styleId;
    if (!styleId) {
        this.resetPrice();
        this.disableButton();
        return;
    }
    this.resetPrice();
    if (this.zip) {
        this.enableButton();
    }
    return this;
};

/**
 * Changed a year.
 * @method onYearChange
 * @param {String} year
 * @chainable
 */
proto.onYearChange = function(year) {
    this.year = year;
    this.showVehicles = year && year.substr && year.substr(4) || null;
    if (!year) {
        this.resetStyles();
        return;
    }
    this.resetStyles('Loading Styles...');
    this.loadStyles(this.make, this.model, parseInt(year, 10));
    return this;
};

/**
 * Changed zip code.
 * @method onZipChange
 * @param {String} zip Zip code
 * @chainable
 */
proto.onZipChange = function(zip) {
    var isValid = (/[0-9]{5}/).test(zip);

    this.zip = zip;

    if (isValid){
        this.loadZip(zip);
    } else {
        this.disableButton();
        this.enableZipTooltip();
    }

    return this;
};

// Load callbacks

/**
 * Loaded a zip code.
 * @method onZipLoad
 * @param {Object} data
 * @chainable
 */
proto.onZipLoad = function(data) {
    var zip = this.zip,
        isValid = (data[zip] === 'true') ? true : false;

    this[isValid ? 'disableZipTooltip' : 'enableZipTooltip']();
    this[isValid && this.style ? 'enableButton' : 'disableButton']();
    return this;
};

/**
 * Loaded list of makes.
 * @method onMakesLoad
 * @param {Object} data
 * @chainable
 */
proto.onMakesLoad = function(data) {
    var records = this.parseMakes(data);
    if (data.error) {
        this.resetMakes('Makes not found');
        this.showError();
        return this;
    }
    this.setMakes(records);
    this.trigger('load:makes', data);
    return this;
};

/**
 * Loaded list of models.
 * @method onModelsLoad
 * @param {Object} data
 * @chainable
 */
proto.onModelsLoad = function(data) {
    var records = this.parseModels(data);
    this.enableMakes();
    if (data.error) {
        this.resetModels('Models not found');
        this.showError();
        return this;
    }
    this.models = data.models;
    this.setModels(records);
    this.trigger('load:models', data);
    return this;
};

/**
 * Loaded a price.
 * @method onPriceLoad
 * @param {Object} data
 * @chainable
 */
proto.onPriceLoad = function(data) {
    var isNew = this.showVehicles === 'NEW';
    if (isNew) {
        this.price = this.parsePrice(data);
    } else {
        this.price.rangeMax = this.parsePriceRangeMax(data);
    }
    this.setPrice(this.price);
    this.enableButton();
    this.trigger('load:price', data, this.price);
    return this;
};

/**
 * Loaded list of styles.
 * @method onStylesLoad
 * @param {Object} data
 * @chainable
 */
proto.onStylesLoad = function(data) {
    var records = this.parseStyles(data);
    this.enableMakes();
    this.enableModels();
    this.enableYears();
    if (data.error) {
        this.resetStyles('Styles not found');
        this.showError();
        return this;
    }
    this.setStyles(records);
    this.trigger('load:styles', data);
    return this;
};

/**
 * Loaded list of years.
 * @method onYearsLoad
 * @param {Object} data
 * @chainable
 */
proto.onYearsLoad = function(data) {
    var records = this.parseYears(data);
    this.setYears(records);
    this.trigger('load:years', data);
    return this;
};

// Error handlers

proto.onMakesLoadError = function() {
    this.resetMakes('Makes not found');
    this.showError();
};

proto.onModelsLoadError = function() {
    this.resetModels('Models not found');
    this.showError();
};

proto.onStylesLoadError = function() {
    this.resetStyles('Styles not found');
    this.showError();
};

proto.onZipLoadError = function() {
    this.showError();
};

proto.onPriceLoadError = function() {
    this.onPriceLoad({});
};

// Parsers

/**
 * Parsing list of makes.
 * @method parseMakes
 * @param {Object} data
 * @return {Object}
 */
proto.parseMakes = function(data) {
    var result = {},
        records = data.makes,
        includedMakes = this.getOptions().includedMakes,
        makes = (typeof includedMakes === 'string') ? includedMakes.split(',') : [],
        includeAll = includedMakes === 'all',
        key, record;

    for (key in records) {
        record = records[key];
        if (includeAll || $.contains(makes, record.niceName)) {
            result[record.niceName] = record.name;
        }
    }

    return result;
};

/**
 * Parsing list of models.
 * @method parseModels
 * @param {Object} data
 * @return {Object}
 */
proto.parseModels = function(data) {
    var records = data.models,
        showVehicles = this.getOptions().showVehicles;

    /**
     * Checking list of years.
     * @method hasYears
     * @param {Array} years List of years
     * @param {String} type
     * @return {Object}
     */
    function hasYears(years, type) {
        var result = false,
            hasNewYears = !!years.NEW,
            hasUsedYears = !!years.USED;
        switch (type) {
            case 'NEW':
                result = hasNewYears;
                break;
            case 'USED':
                result = hasUsedYears;
                break;
            default:
                result = hasNewYears || hasUsedYears;
        }
        return result;
    }

    /**
     * Mapping for list of models.
     * @method mapModels
     * @param {Array} records List of models
     * @param {String} type
     * @return {Object}
     */
    function mapModels(records, type) {
        var result = {},
            key, record;
        for (key in records) {
            record = records[key];
            if (hasYears(record.years, type)) {
                result[key] = record.name;
            }
        }
        return result;
    }

    // used or new
    if (showVehicles === 'USED' || showVehicles === 'NEW') {
        return mapModels(records, showVehicles);
    }

    return mapModels(records);

};

/**
 * Return object with options for render price.
 * @method parsePrice
 * @param {Object} data
 * @return {Object}
 */
proto.parsePrice = function(data) {
    var result = {},
        totalWithOptions,
        invoice, msrp, tmv;
    totalWithOptions = ((data || {}).tmv || {}).totalWithOptions || {};

    if (this.showVehicles === 'USED') {
        return {
            showVehicles: this.showVehicles,
            less: totalWithOptions.usedTmvRetail,
            more: totalWithOptions.usedPrivateParty,
            tmv: totalWithOptions.usedTradeIn,
            lessLabel: 'Dealer Retail',
            moreLabel: 'Private Party',
            tmvLabel: 'Trade-in',
            lessTooltip: TMV.TOOLTIP_TMVRETAIL,
            moreTooltip: TMV.TOOLTIP_PRIVATEPARTY,
            tmvTooltipMin: TMV.TOOLTIP_TRADEIN_MIN,
            tmvTooltipMax: TMV.TOOLTIP_TRADEIN_MAX
        };
    }
    return {
        showVehicles: this.showVehicles,
        less: totalWithOptions.baseInvoice,
        more: totalWithOptions.baseMSRP,
        tmv: totalWithOptions.tmv,
        lessLabel: 'Invoice',
        moreLabel: 'MSRP',
        tmvLabel: 'TMV<sup>&reg;</sup>',
        lessTooltip: TMV.TOOLTIP_INVOICE,
        moreTooltip: TMV.TOOLTIP_MSRP,
        tmvTooltip: ''
    };
};

/**
 * Return value for min range price.
 * @method parsePriceRangeMin
 * @param {Object} data
 * @return {String}
 */
proto.parsePriceRangeMin = function(data){
    var totalWithOptions,
        priceRangeMin;
    totalWithOptions = ((data || {}).tmv || {}).totalWithOptions || {};
    priceRangeMin = totalWithOptions.usedTradeIn;
    return priceRangeMin;
};

/**
 * Return value for max range price.
 * @method parsePriceRangeMax
 * @param {Object} data
 * @return {String}
 */
proto.parsePriceRangeMax = function(data){
    var totalWithOptions,
        priceRangeMax;
    totalWithOptions = ((data || {}).tmv || {}).totalWithOptions || {};
    priceRangeMax = totalWithOptions.usedTradeIn;
    return priceRangeMax;
};

/**
 * Parsing list of styles.
 * @method parseStyles
 * @param {Object} data
 * @return {Object}
 */
proto.parseStyles = function(data) {
    var result = {},
        records = data.modelYearHolder[0].styles,
        length = records.length,
        i, record;
    for (i = 0; i < length; i++) {
        record = records[i];
        result[record.id] = record.name;
    }
    return result;
};

/**
 * Parsing list of years.
 * @method parseYears
 * @param {Object} data
 * @param {String} type The vehicle type (ALL, NEW or USED)
 * @return {Object}
 */
proto.parseYears = function(data, type) {
    var result = {},
        records = data.years;
    /**
     * Mapping for list of years.
     * @method mapYears
     * @param {Array} years List of years
     * @param {String} type
     * @return {Object}
     */
    function mapYears(years, type) {
        var result = {},
            length, i, year;
        years = $.isArray(years) ? years : [];
        length = years.length;
        for (i = 0; i < length; i++) {
            year = years[i];
            result[year + type] = year;
        }
        return result;
    }
    // used or new
    if (type === 'USED' || type === 'NEW') {
        return mapYears(records[type], type);
    }
    // all (NEW, USED)
    for (type in records) {
        if (type === 'USED' || type === 'NEW') {
            result[type] = mapYears(records[type], type);
        }
    }
    return result;
};
