    /**
     * True Market Value Widget
     * @class TMV
     * @namespace EDM
     * @param {String} apiKey The value of API Key
     * @param {Object} options Base options for Widget
     * @example
     *      var widget = new EDM.TMV(apikey, {root: 'tmvwidget', baseClass: 'tmvwidget'});
     * @constructor
     * @extends EDM.Widget
     */
    var TMV = EDM.TMV = function(apiKey, options) {

        var
            /**
             * Button element for price calculate.
             * @property _calculateButton
             * @type {HTMLButtonElement}
             * @private
             */
            _calculateButton,

            /**
             * Select element with list of makes.
             * @property _makesElement
             * @type {HTMLSelectElement}
             * @private
             */
            _makesElement,

            /**
             * Select element with list of models.
             * @property _modelsElement
             * @type {HTMLSelectElement}
             * @private
             */
            _modelsElement,

            /**
             * Div root element for price view.
             * @property _priceRootElement
             * @type {HTMLDivElement}
             * @private
             */
            _priceRootElement,

            /**
             * Div inner element for price view.
             * @property _priceInnerElement
             * @type {HTMLDivElement}
             * @private
             */
            _priceInnerElement,

            /**
             * Select element with list of styles.
             * @property _stylesElement
             * @type {HTMLSelectElement}
             * @private
             */
            _stylesElement,

            /**
             * Select element with list of years.
             * @property _yearsElement
             * @type {HTMLSelectElement}
             * @private
             */
            _yearsElement,

            /**
             * Input element with value of zip code.
             * @property _zipElement
             * @type {HTMLInputElement}
             * @private
             */
            _zipElement,

            /**
             * Div element with tooltip of zip code.
             * @property _zipTooltipElement
             * @type {HTMLDivElement}
             * @private
             */
            _zipTooltipElement;

        EDM.Widget.apply(this, arguments);

        /**
         * Render widget html.
         * Bind events and caching elements after render.
         *
         * @method htmlSetup
         * @chainable
         */
        this.htmlSetup = function() {
            var me = this,
                baseId = me.getBaseId(),
                rootElement = me.getRootElement(),
                options = this.getOptions();
            if (rootElement === null) {
                throw new Error('Root element was not found.');
            }
            /**
             * Returns callback function for events of change.
             * @method bindOnChangeEvent
             * @param {Object} name The name of event
             * @return {Function}
             */
            function bindOnChangeEvent(name) {
                return function() {
                    var text = this.options ? this.options[this.selectedIndex].innerHTML : null;
                    me.trigger('change:' + name, this.value, text);
                };
            }

            // render from template
            rootElement.innerHTML = $.renderTemplate(TMV.template, {
                tmvTooltip: TMV.TOOLTIP_TMV,
                baseId: baseId,
                baseClass: me.getBaseClass(),
                zip: this.zip || ''
            });

            // cache elements
            _makesElement      = document.getElementById(baseId + '_make');
            _modelsElement     = document.getElementById(baseId + '_model');
            _yearsElement      = document.getElementById(baseId + '_year');
            _stylesElement     = document.getElementById(baseId + '_style');
            _zipElement        = document.getElementById(baseId + '_zip');
            _zipTooltipElement = document.getElementById(baseId + '_zip_tooltip');
            _priceRootElement  = document.getElementById(baseId + '_price');
            _priceInnerElement = document.getElementById(baseId + '_price_inner');
            _calculateButton   = document.getElementById(baseId + '_button');
            // bind events
            _makesElement.onchange  = bindOnChangeEvent('make');
            _modelsElement.onchange = bindOnChangeEvent('model');
            _yearsElement.onchange  = bindOnChangeEvent('year');
            _stylesElement.onchange = bindOnChangeEvent('style');
            _zipElement.onchange    = bindOnChangeEvent('zip');
            _zipElement.onkeyup     = bindOnChangeEvent('zip');
            _zipElement.onkeydown   = function(event) {
                var systemKeys = [8, 27, 35, 36, 37, 38, 39, 40, 45, 46,
                        112, 113, 114, 115, 116, 117, 118, 119, 120, 121, 122, 123],
                    numKey = [96, 97, 98, 99, 100, 101, 102, 103, 104, 105],
                    key = (event = event || window.event).keyCode,
                    val = String.fromCharCode(key),
                    isNum = (/^\d+$/).test(val),
                    isNumLock = isNum || key == 8 || $.contains(numKey, key);

                if ((event.ctrlKey && key == 86) || key == 86) {
                    return isNum;
                }
                if (event.shiftKey && key == 45) {
                    return isNum;
                }
                if ($.contains(systemKeys, key)) {
                    return;
                }
                if (!isNumLock) {
                    return isNum;
                }

            };
            _calculateButton.onclick = function() {
                me.trigger('calculate');
            };
            this.bindEvents();
            return this;
        };

        /**
         * Disabled button calculation of price.
         *
         * @method disableButton
         * @chainable
         */
        this.disableButton = function() {
            _calculateButton.disabled = true;
            return this;
        };

        /**
         * Enable button calculation of price.
         *
         * @method enableButton
         * @chainable
         */
        this.enableButton = function() {
            _calculateButton.disabled = false;
            return this;
        };

        /**
         * Enables makes select
         * @method enableMakes
         * @chainable
         */
        this.enableMakes = function() {
            _makesElement.removeAttribute('disabled');
            return this;
        };

        /**
         * Enables models select
         * @method enableModels
         * @chainable
         */
        this.enableModels = function() {
            _modelsElement.removeAttribute('disabled');
            return this;
        };

        /**
         * Enables years select
         * @method enableYears
         * @chainable
         */
        this.enableYears = function() {
            _yearsElement.removeAttribute('disabled');
            return this;
        };

        /**
         * Enables styles select
         * @method enableStyles
         * @chainable
         */
        this.enableStyles = function() {
            _stylesElement.removeAttribute('disabled');
            return this;
        };

        /**
         * Disables makes select
         * @method disableMakes
         * @chainable
         */
        this.disableMakes = function() {
            _makesElement.setAttribute('disabled', 'disabled');
            return this;
        };

        /**
         * Disables models select
         * @method disableModels
         * @chainable
         */
        this.disableModels = function() {
            _modelsElement.setAttribute('disabled', 'disabled');
            return this;
        };

        /**
         * Disables years select
         * @method disableYears
         * @chainable
         */
        this.disableYears = function() {
            _yearsElement.setAttribute('disabled', 'disabled');
            return this;
        };

        /**
         * Disables styles select
         * @method disableStyles
         * @chainable
         */
        this.disableStyles = function() {
            _stylesElement.setAttribute('disabled', 'disabled');
            return this;
        };

        /**
         * Disabled a tooltip for zip code element.
         *
         * @method disableZipTooltip
         * @chainable
         */
        this.disableZipTooltip = function() {
            _zipTooltipElement.style.display = 'none';
            return this;
        };

        /**
         * Enable a tooltip for zip code element.
         *
         * @method enableZipTooltip
         * @chainable
         */
        this.enableZipTooltip = function() {
            _zipTooltipElement.style.display = 'block';
            return this;
        };
        /**
         * Reset a list of makes.
         *
         * @method resetMakes
         * @param {String} defaultText
         * @chainable
         */
        this.resetMakes = function(defaultText) {
            defaultText = defaultText || 'List of Makes';
            $.renderSelectOptions(_makesElement, {}, defaultText);
            _makesElement.disabled = true;
            this.make = null;
            this.trigger('reset:make');
            return this;
        };

        /**
         * Reset a list of models.
         *
         * @method resetModels
         * @param {String} defaultText
         * @chainable
         */
        this.resetModels = function(defaultText) {
            defaultText = defaultText || 'List of Models';
            $.renderSelectOptions(_modelsElement, {}, defaultText);
            _modelsElement.disabled = true;
            this.model = null;
            this.models = {};
            this.trigger('reset:model');
            return this;
        };

        /**
         * Reset a price.
         *
         * @method resetPrice
         * @chainable
         */
        this.resetPrice = function() {
            var baseClass = this.getBaseClass(),
                options = this.getOptions(),
                price = options.price,
                showVehicles = this.showVehicles,
                priceClass,
                isUsed = this.getOptions().showVehicles === 'USED' || showVehicles === 'USED',
                lessLabel = (isUsed) ? 'Dealer Retail' : 'Invoice',
                moreLabel = (isUsed) ? 'Private Party' : 'MSRP',
                tmvLabel = (isUsed) ? 'Trade-in' : 'TMV<sup>&reg;</sup>';

            this.price = null;

            if (!price) {
                price = 'tmv-invoice-msrp';
            }
            switch (price) {
                case 'tmv_invoice':
                    priceClass = 'price-tmv-invoice';
                    break;
                case 'tmv':
                    priceClass = 'price-tmv';
                    break;
                default:
                    priceClass = 'price-tmv-invoice-msrp';
            }
            if (!isUsed) {
                _priceRootElement.className = baseClass + '-price' + (this.getApiKey() ? '' : ' disabled');
                _priceInnerElement.innerHTML = $.renderTemplate(TMV.textPriceTemplate, {
                    priceClass: priceClass,
                    baseClass: baseClass,
                    showVehicles: this.getOptions().showVehicles,
                    less: '---',
                    more: '---',
                    tmv: '---',
                    isLess: 'invalid',
                    isMore: 'invalid',
                    isTmv: 'invalid',
                    lessLabel: lessLabel,
                    moreLabel: moreLabel,
                    tmvLabel: tmvLabel,
                    lessTooltip: TMV.TOOLTIP_INVOICE,
                    moreTooltip: TMV.TOOLTIP_MSRP,
                    tmvTooltip: ''
                });
            } else {
                _priceRootElement.className = baseClass + '-price' + (this.getApiKey() ? '' : ' disabled');
                _priceInnerElement.innerHTML = $.renderTemplate(TMV.graphPriceTemplate, {
                    priceClass: priceClass,
                    baseClass: baseClass,
                    showVehicles: this.getOptions().showVehicles,
                    less: '---',
                    more: '---',
                    tmvMin: '---',
                    tmvMax: '---',
                    isLess: 'invalid',
                    isMore: 'invalid',
                    isTmv: 'invalid',
                    isRangeMin: 'invalid',
                    isRangeMax: 'invalid',
                    lessLabel: lessLabel,
                    moreLabel: moreLabel,
                    tmvLabel: tmvLabel,
                    lessTooltip: TMV.TOOLTIP_INVOICE,
                    moreTooltip: TMV.TOOLTIP_MSRP,
                    tmvTooltip: ''
                });
            }


            this.trigger('reset:price');


            return this;
        };

        /**
         * Reset a list of styles.
         *
         * @method resetStyles
         * @param {String} defaultText
         * @chainable
         */
        this.resetStyles = function(defaultText) {
            defaultText = defaultText || 'List of Styles';
            $.renderSelectOptions(_stylesElement, {}, defaultText);
            _stylesElement.disabled = true;
            this.disableButton();
            this.style = null;
            this.trigger('reset:style');
            return this;
        };

        /**
         * Reset a list of years.
         *
         * @method resetYears
         * @param {String} defaultText
         * @chainable
         */
        this.resetYears = function(defaultText) {
            defaultText = defaultText || 'Year';
            $.renderSelectOptions(_yearsElement, {}, defaultText);
            _yearsElement.disabled = true;
            this.year = null;
            this.trigger('reset:year');
            return this;
        };

        /**
         * Set a make.
         *
         * @method setMakes
         * @param {Object} records
         * @chainable
         */
        this.setMakes = function(records) {
            if ($.isEmpty(records)) {
                return this.resetMakes('Makes not found');
            }
            $.renderSelectOptions(_makesElement, records, 'Select a Make');
            _makesElement.disabled = false;
            return this;
        };

        /**
         * Set a model.
         *
         * @method setModels
         * @param {Object} records
         * @chainable
         */
        this.setModels = function(records) {
            if ($.isEmpty(records)) {
                return this.resetModels('Models not found');
            }
            $.renderSelectOptions(_modelsElement, records, 'Select a Model', false, true);
            _modelsElement.disabled = false;
            return this;
        };

        /**
         * Set a price.
         *
         * @method setPrice
         * @param {Object} price
         * @chainable
         */
        this.setPrice = function(price) {
            var options = this.getOptions(),
                priceType = options.price,
                expr = /(?=(?:\d{3})+(?:\.|$))/g,
                priceClass,
                less = price.less,
                more = price.more,
                tmvStrMin = (price.rangeMin) ? price.rangeMin.toString().split(expr).join(',') : 'N/A',
                tmvStrMax = (price.rangeMax) ? price.rangeMax.toString().split(expr).join(',') : 'N/A',
                showVehicles = this.showVehicles,
                isUsed = this.getOptions().showVehicles === 'USED' || showVehicles === 'USED',
                tmv = price.tmv,
                lessStr = (less) ? less.toString().split(expr).join(',') : 'N/A',
                moreStr = (more) ? more.toString().split(expr).join(',') : 'N/A',
                tmvStr = (tmv) ? tmv.toString().split(expr).join(',') : 'N/A';

            if (!priceType) {
                priceType = 'tmv-invoice-msrp';
            }
            switch (priceType) {
                case 'tmv_invoice':
                    priceClass = 'price-tmv-invoice';
                    break;
                case 'tmv':
                    priceClass = 'price-tmv';
                    break;
                default:
                    priceClass = 'price-tmv-invoice-msrp';
            }

            if (!isUsed) {
                _priceRootElement.className = this.getBaseClass() + '-price';
                _priceInnerElement.innerHTML = $.renderTemplate(TMV.textPriceTemplate, {
                    priceClass: priceClass,
                    baseClass: this.getBaseClass(),
                    showVehicles:   price.showVehicles,
                    less:           lessStr,       //low
                    more:           moreStr,       //big
                    tmv:            tmvStr,        //mid
                    isLess:         (less) ? 'valid' : 'invalid',
                    isMore:         (more) ? 'valid' : 'invalid',
                    isTmv:          (tmv) ? 'valid' : 'invalid',
                    lessLabel:      price.lessLabel,
                    moreLabel:      price.moreLabel,
                    tmvLabel:       price.tmvLabel,
                    headerToolTip:  price.headerToolTip,
                    lessTooltip:    price.lessTooltip,
                    moreTooltip:    price.moreTooltip,
                    tmvTooltip:     price.tmvTooltip
                });
            } else {
                _priceRootElement.className = this.getBaseClass() + '-price';
                _priceInnerElement.innerHTML = $.renderTemplate(TMV.graphPriceTemplate, {
                    priceClass: priceClass,
                    baseClass: this.getBaseClass(),
                    showVehicles: this.getOptions().showVehicles,
                    less:           lessStr,       //low
                    more:           moreStr,       //big
                    tmvMin:         tmvStrMin,
                    tmvMax:         tmvStrMax,
                    isLess:         (less) ? 'valid' : 'invalid',
                    isMore:         (more) ? 'valid' : 'invalid',
                    isTmv:          (tmv) ? 'valid' : 'invalid',
                    isRangeMin:     (price.rangeMin) ? 'valid' : 'invalid',
                    isRangeMax:     (price.rangeMax) ? 'valid' : 'invalid',
                    lessLabel:      price.lessLabel,
                    moreLabel:      price.moreLabel,
                    tmvLabel:       price.tmvLabel,
                    headerToolTip:  price.headerToolTip,
                    lessTooltip:    price.lessTooltip,
                    moreTooltip:    price.moreTooltip,
                    tmvTooltipMin:  price.tmvTooltipMin,
                    tmvTooltipMax:  price.tmvTooltipMax
                });
            }
        };

        /**
         * Set a style.
         *
         * @method setStyles
         * @param {Object} records
         * @chainable
         */
        this.setStyles = function(records) {
            if ($.isEmpty(records)) {
                return this.resetStyles('Styles not found');
            }
            $.renderSelectOptions(_stylesElement, records, 'Select a Style', false, true);
            _stylesElement.disabled = false;
            return this;
        };

        /**
         * Set a year.
         *
         * @method setYears
         * @param {Object} records
         * @chainable
         */
        this.setYears = function(records) {
            var type = this.getOptions().showVehicles,
                hasOptGroups = !type || type === 'ALL';
            if (hasOptGroups && records.length > 0 || !hasOptGroups && $.isEmpty(records)) {
                return this.resetYears('Years not found');
            }
            $.renderSelectOptions(_yearsElement, records, 'Year', hasOptGroups);
            _yearsElement.disabled = false;
            return this;
        };

        this.showError = function(text) {
            var root = this.getRootElement(),
                error = new EDM.nvc.MessageDialog();
            root.appendChild(error.render({
                isSuccess: false,
                text: text || [
                    '<p>Something went wrong!</p>',
                    '<p>Please return and try again or <a href="Mailto:api@edmunds.com">contact us</a> directly.</p>'
                ].join('')
            }).el);
            error.init();
        };

    };
