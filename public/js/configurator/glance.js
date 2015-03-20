(function(global) {
    "use strict";
    var widthSliderOptions = {
        min: 250,
        max: 970,
        value: 250
    };

    var makesListItemTemplate = _.template([
        '<option value="<%= niceName %>"><%= name %></option>'
    ].join(''));

    var yearsListItemTemplate = _.template([
        '<option value="<%= year %>"><%= year %></option>'
    ].join(''));

    var loadingTemplate = _.template(['' +
        '<div class="spinner">' +
        '<div class="spinner-1">' +
        '<p>Please,<br>fill out all fields</p>' +
        '<div class="dots">' +
        '<div class="dot-1"></div>' +
        '<div class="dot-2"></div>' +
        '<div class="dot-3"></div>' +
        '<div class="dot-4"></div>' +
        '<div class="dot-5"></div>' +
        '</div>' +
        '</div>' +
        '</div>' +
    ''].join(''));
    var AtGlanceConfigurator = Backbone.View.extend({
        events: {
            'click #widget-get': 'onSubmit',
            'reset': 'onReset',
            'valid #vehicle-api-key-control': 'onVehicleApiKeyChange',
            'valid #zip-code-control': 'onZipCodeChange',
            'change .makes': 'onSelectMake',
            'change .models': 'onSelectModel',
            'change .years': 'onSelectYear',
            'change #toggleAllTabs': 'onToggleAllTabs',
            'change .list-group-tabs [type="checkbox"]': 'onSelectTabs',
            'keyup #vehicle-api-key-input': 'onApplyApiKey',
            'keyup #zip-code-input': 'onApplyZipCode',
            'keypress #zip-code-input': 'zipCodeInputFilter',
            'paste #zip-code-input': 'zipCodeInputFilter',
            'click #vehicle-api-key-control [data-section="change"] .btn': 'onChangeClickKey',
            'click #zip-code-control [data-section="change"] .btn': 'onChangeClickZip'
        },
        initialize: function() {
            this.$width = this.$('[name="width"]');
            this.$height = this.$('[name="height"]');
            this.$widthSlider = this.$('#width_slider');
            this.$makesList = this.$('.makes').attr('disabled', 'disabled');
            this.$modelsList = this.$('.models').attr('disabled', 'disabled');
            this.$yearsList = this.$('.years').attr('disabled', 'disabled');
            this.$tabsList = this.$('.list-group-tabs');
            this.$tooltipContainer = this.$('.tooltip-container');
            this.$includedMakes = this.$('[name="includedMakes"]');
            this.vehicleApiControl = this.$('#vehicle-api-key-control').inputGroupControl({
                tooltipTitle: 'Please enter a valid API key',
                validate: this.vehicleApiKeyValidator
            }).data('inputGroupControl');
            this.zipCodeControl = this.$('#zip-code-control').inputGroupControl({
                tooltipTitle: 'Please enter a valid ZIP code',
                disabled: true,
                validate: this.zipCodeValidator
            }).data('inputGroupControl');
            this.zipCodeControl.disable();

            this.$('#zip-code-control div[data-section=change] .btn').on('click', $.proxy(this.zipCodeReset, this));
            this.$('#vehicle-api-key-control div[data-section=change] .btn').on('click', $.proxy(this.zipCodeReset, this));

            this.widthSlider = this.createSlider(this.$widthSlider, widthSliderOptions, _.bind(this.onWidthChange, this));
            this.renderWidget = _.debounce(this.renderWidget, 500);
            //this.onReset = _.debounce(this.onReset, 500, true);
        },

        $widgetPlaceholder: $('#widget-placeholder'),

        renderWidget: function () {
            this.options = this.toJSON();
            if (this.year && this.year !== 'Select a Year' && this.make && this.make !== 'Select a Make' && this.model && this.model !== 'Select a Model' && global.tabsList && global.tabsList.length !== 0) {
                this.$widgetPlaceholder.find("#atglancewidget").remove();
                this.$widgetPlaceholder.prepend('<div id="atglancewidget"></div>');
                //this.loadingProgress();
                this.widget = EDM.createWidget({
                    type: 'glance',
                    renderTo: 'atglancewidget',
                    style: {
                        width: this.options.width.replace('px', ''),
                        height: this.options.height.replace('px', '')
                    },
                    scripts: [
                        '/libs/requirejs/require.js" data-main="js/main.js'
                    ],
                    options: {
                        apiKey:   global.apiKey,
                        make:     global.make,
                        model:    global.model,
                        year:     global.year,
                        submodel: global.submodel,
                        zipCode:  global.zipCode,
                        tabsList: global.tabsList
                    }
                });
//                this.$widgetPlaceholder.find("iframe").css('display','none');
//                setTimeout(this.deleteLoading.bind(this),10000);
            } else {
                this.loading();
                return;
            }
            return this;
        },

        loading: function() {
            this.$widgetPlaceholder.find("#atglancewidget").remove();
            this.$widgetPlaceholder.prepend('<div id="atglancewidget"></div>');
            this.$widgetPlaceholder.find("#atglancewidget").html(loadingTemplate);
        },
        createSlider: function ($el, options, onChange) {
            return $el.slider({
                range: 'min',
                value: options.value,
                min: options.min,
                max: options.max,
                create: function (event, ui) {
                    $(this).find('.ui-slider-handle').tooltip({
                        animation: false,
                        title: options.value + 'px',
                        trigger: 'manual',
                        placement: 'bottom',
                        container: $el.find('.ui-slider-handle')
                    }).tooltip('show');
                },
                slide: function (event, ui) {
                    $(this)
                        .find('.ui-slider-handle .tooltip-inner')
                        .text(ui.value + 'px');
                },
                change: function (event, ui) {
                    $(this)
                        .find('.ui-slider-handle .tooltip-inner')
                        .text(ui.value + 'px');
                    if (_.isFunction(onChange)) {
                        onChange(ui.value);
                    }
                }
            }).data('ui-slider');
        },

        onWidthChange: function (value) {
            this.$width.val(value + 'px');
            this.$height.val(this.getWidgetHeight(value) + 'px');
            if (global.year) {
                global.make = this.make;
                global.model = this.model;
                global.year = this.year;
                global.apiKey = this.vehicleApiKey;
                global.zipCode = this.zipCode;
                this.renderWidget();
            }
        },
        getWidgetHeight: function (width) {
            if (width < 485) {
                return 630;
            } else if (width >= 485 && width < 720) {
                return 630;
            } else if (width >= 720) {
                return 530;
            }
        },
        onVehicleApiKeyChange: function(event, apiKey) {
            this.vehicleApiKey = apiKey;
            this.zipCodeControl.enable();
            this.$('#zip-code-input').focus();
            this.zipCodeControl.options.apiKey = apiKey;
//            if(!this.zipCode){
//                return;
//            }
            this.findMakes();
            this.renderWidget();
        },
        onChangeClickKey: function(){
            this.vehicleApiKey = undefined;
        },
        onChangeClickZip: function(){
            this.zipCode = undefined;
        },
        onZipCodeChange: function (event, zipCode) {
            this.zipCode = zipCode;
            if(!this.vehicleApiKey){
                return;
            }
            this.findMakes();
            this.renderWidget();
        },
        vehicleApiKeyValidator: function(value) {
            var deferred = new jQuery.Deferred();
            if (!value) {
                deferred.rejectWith(this, [value]);
                return deferred.promise();
            }
            jQuery.ajax({
                url: '/api/keyvalidate',
                data: {
                    api_key: value,
                    service: 'vehicle'
                },
                dataType: 'json',
                context: this,
                success: function (response) {
                    deferred[response.valid === true ? 'resolveWith' : 'rejectWith'](this, [value]);
                },
                error: function () {
                    deferred.rejectWith(this, [value]);
                }
            });
            return deferred.promise();
        },
        zipCodeInputFilter: function (e) {
            var code = e.keyCode || e.which,
                convertKeyCode = String.fromCharCode(code),
                regExp = /[0-9]/;

            // Firefox fix. Prevent disable the backspace key.
            // note: Need to prevent disable all functional keys like delete, control, alt etc.
            if (code === 8) {
                return;
            }

            if (!regExp.test(convertKeyCode)) {
                e.preventDefault();
                return false;
            }
        },
        zipCodeReset: function() {
            this.$makesList.html('<option>List of Makes</option>');
            this.$modelsList.html('<option>List of Models</option>');
            this.$yearsList.html('<option>List of Years</option>');
            this.$makesList.attr('disabled', 'disabled');
            this.$modelsList.attr('disabled', 'disabled');
            this.$yearsList.attr('disabled', 'disabled');
            this.year = null;
            this.make = null;
            this.model = null;
            this.submodel = null;
            this.renderWidget();
        },
        zipCodeValidator: function(value) {
            var deferred = new jQuery.Deferred();
            if (!/^\d{5}$/.test(value)) {
                deferred.rejectWith(this, [value]);
                return deferred.promise();
            }
            jQuery.ajax({
                url: 'http://api.edmunds.com/v1/api/region/zip/validation/' + value,
                data: {
                    api_key: this.options.apiKey
                },
                dataType: 'jsonp',
                context: this,
                success: function (response) {
                    deferred[response[value] === 'true' ? 'resolveWith' : 'rejectWith'](this, [value]);
                },
                error: function () {
                    deferred.rejectWith(this, [value]);
                }
            });
            return deferred.promise();
        },
        onSelectMake: function (e) {
            this.make = $(e.currentTarget).val();
            if (this.make !== 'Select a Make') {
                this.models = null;
                this.years = null;
                this.model = null;
                this.year = null;
                this.models = _.where(this.makes, {niceName: this.make});
                this.model = this.models[0].niceName;
                this.$makesList.removeClass('not-valid')
                this.$modelsList.html('<option>Loading models...</option>');
                this.renderModelList(this.models[0].models);
                this.$modelsList.removeAttr('disabled');
                this.$yearsList.html('<option>List of Years</option>');
                this.$yearsList.attr('disabled', 'disabled');
                this.renderWidget();
            } else {
                this.$makesList.addClass('not-valid')
                this.$modelsList.html('<option>List of Models</option>');
                this.$yearsList.html('<option>List of Years</option>');
                this.$yearsList.css('borderColor','transperent').attr('disabled', 'disabled');
                this.$modelsList.attr('disabled', 'disabled');
                this.models = null;
                this.years = null;
                this.renderWidget();
            }
            this.$includedMakes.val(this.make);
        },
        onSelectModel: function (e) {
            this.model = $(e.currentTarget).val();
            if (this.model !== 'Select a Model') {
                this.year = null;
                this.$modelsList.removeClass('not-valid');
                this.years = _.where(this.models[0].models, {niceName: this.model});
                this.$yearsList.html('<option>Loading years...</option>');
                this.renderYearList(this.years[0].years);
                this.$yearsList.removeAttr('disabled');
                this.renderWidget();
            } else {
                this.$modelsList.addClass('not-valid');
                this.$yearsList.html('<option>List of Years</option>');
                this.$yearsList.css('borderColor','transperent').attr('disabled', 'disabled');
                this.years = null;
                this.renderWidget();
            }
            this.getSubmodelName(this.make, this.model);
        },
        onSelectYear: function (e) {
            var tabsList = [];
            this.year = $(e.currentTarget).val();
            if (this.year !== 'Select a Year') {
                this.$yearsList.removeClass('not-valid');
                this.$tabsList.find('[type="checkbox"]:checked').each(function () {
                    tabsList.push(this.value);
                });
                if(this.tabsList == null){
                    this.tabsList = tabsList;
                }
                global.make = this.make;
                global.model = this.model;
                global.submodel = this.submodel;
                global.year = this.year;
                global.tabsList = tabsList; // was this.tabsList
                this.$yearsList.css('borderColor','transperent');
                this.renderWidget();
            } else {
                this.$yearsList.addClass('not-valid');
                global.year = null;
                global.tabsList = null;
                this.tabsList = null;
                this.$widgetPlaceholder.find("#atglancewidget").html(loadingTemplate);
            }
            global.apiKey = this.vehicleApiKey;
            global.zipCode = this.zipCode;
            //this.renderWidget();
        },
        findMakes: function() {
            if (!this.vehicleApiKey || !this.zipCode) {
                return;
            }
            this.resetMakes();
            this.$makesList.html('<option>Loading makes...</option>');
            jQuery.ajax({
                url: 'http://api.edmunds.com/api/vehicle/v2/makes',
                data: {
                    api_key: this.vehicleApiKey
                },
                dataType: 'jsonp',
                context: this,
                success: function (response) {
                    this.makes = response.makes;
                    this.renderMakesList(response.makes);
                    this.$makesList.removeAttr('disabled').focus();
                },
                error: function () {
                }
            });
            return this;
        },
        getSubmodelName: function(make, model) {
            jQuery.ajax({
                url: 'https://api.edmunds.com/api/vehicle/v2/' + make + '/' + model,
                data: {
                    api_key: this.vehicleApiKey
                },
                dataType: 'jsonp',
                context: this,
                success: function (response) {
                    this.submodel = response.years[0].styles[0].submodel.niceName;
                },
                error: function (err, data) {

                }
            });
        },
        resetMakes: function() {
            this.$makesList.html('<option>List of Makes</option>');
            this.$includedMakes.val('');
            return this;
        },
        renderMakesList: function(makes) {
            this.$makesList.empty();
            makes.sort(function (a, b) {
                if (a.name > b.name) {
                    return 1;
                }
                if (a.name < b.name) {
                    return -1;
                }
                return 0;
            });
            this.$makesList.html('<option>Select a Make</option>');
            _.each(makes, function (make) {
                this.$makesList.append(makesListItemTemplate(make));
            }, this);
            this.make = makes[0].niceName;
            return this;
        },
        renderModelList: function(models) {
            this.$modelsList.empty();
            models.sort(function (a, b) {
                if (a.name > b.name) {
                    return 1;
                }
                if (a.name < b.name) {
                    return -1;
                }
                return 0;
            });
            this.$modelsList.html('<option>Select a Model</option>');
            _.each(models, function (model) {
                this.$modelsList.append(makesListItemTemplate(model));
            }, this);
            return this;
        },
        renderYearList: function(years) {
            this.$yearsList.empty();
            years.sort(function (a, b) {
                if (a.year < b.year) {
                    return 1;
                }
                if (a.year > b.year) {
                    return -1;
                }
                return 0;
            });
            this.$yearsList.html('<option>Select a Year</option>');
            _.each(years, function (year) {
                this.$yearsList.append(yearsListItemTemplate(year));
            }, this);
            return this;
        },
        onApplyApiKey: function(e) {
            if (e.keyCode == 13) {
                $("#vehicle-api-key-apply").click();
            }
        },
        onApplyZipCode: function(e) {
            if (e.keyCode == 13) {
                $("#zip-code-apply").click();
            }
        },
        onToggleAllTabs: function (event) {
            var checked = event.target.checked,
                tabsList = this.$tabsList.find('input[type=checkbox]');
            tabsList.prop('checked', checked);
            this.onSelectTabs();
        },
        onSelectTabs: function() {
            var tabsList = [];
            this.$tooltipContainer.tooltip({
                title: 'At least one tab should be selected',
                trigger: 'manual'
            });
            this.$tabsList.find('[type="checkbox"]:checked').each(function () {
                tabsList.push(this.value);
            });
            if (tabsList.length === 0) {
                this.$tooltipContainer.tooltip('show')
            } else {
                this.$tooltipContainer.tooltip('hide')
            }
            global.tabsList = tabsList;
            if(tabsList.length < 5){
                this.$('#toggleAllTabs').attr('checked',false);
            }else if(tabsList.length == 5){
                this.$('#toggleAllTabs').prop('checked', 'checked');
            }
            this.renderWidget();
        },
        toJSON: function() {
            var options = {};
            _.each(this.$el.serializeArray(), function (option) {
                options[option.name] = option.value;
            });
            return options;
        },
        onSubmit: function (event) {
            var isValid = true;
            event.preventDefault();
            if (!this.vehicleApiKey) {
                this.vehicleApiControl.$input.tooltip('show');
                isValid = false;
            }
            if (!this.zipCode) {
                this.zipCodeControl.$input.tooltip('show');
                isValid = false;
            }
            if (!this.make || !this.model || !this.year || !this.tabsList) {
                isValid = false;
                this.$yearsList.css('borderColor','#b72f38');
            }
            if (isValid) {
                // TODO show instructions
                console.log(this.toJSON());
                $('#insert-js').html(this.getJavaScriptSnippet());
                $('#widget-instructions').modal({
                    backdrop: 'static',
                    show: true
                });
            }
        },

        getJavaScriptSnippet: function() {
            _.templateSettings = {
                interpolate : /\{\{(.+?)\}\}/g
            };
            var template = this.htmlEntities([
                    '<script type="text/javascript" src="' + AtGlanceConfigurator.ORIGIN + '/loader-glance.js"></script>\n',
                    '<script type="text/javascript">\n' + $('#js-snippet-template').html() + '\n</script>'
            ].join(''));
            return _.template(template, {
                widgetConfig: JSON.stringify(this.getWidgetConfig(), "", 4)
            }, true);
        },

        htmlEntities: function (str) {
            return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
        },

        getWidgetConfig: function() {
            return {
                type: 'glance',
                renderTo: 'atglancewidget',
                style: {
                    width: this.options.width.replace('px', ''),
                    height: this.options.height.replace('px', '')
                },
                "scripts": [
                    "/libs/requirejs/require.js\" data-main=\""+ AtGlanceConfigurator.ORIGIN + "/glance/js/main.js"
                ],
                options: {
                    apiKey:   global.apiKey,
                    make:     global.make,
                    model:    global.model,
                    year:     global.year,
                    submodel: global.submodel,
                    zipCode:  global.zipCode,
                    tabsList: global.tabsList
                }
            };
        },

        onReset: function () {
            this.resetMakes();
            this.zipCodeControl.reset();

            this.widthSlider.option(widthSliderOptions);

            this.year = null;
            this.make = null;
            this.model = null;
            this.submodel = null;
            this.tabsList = [
                'rating-tab',
                'edmunds-says-tab',
                'consumer-reviews-tab',
                'tco-tab',
                'photos-tab'
            ];

            if (this.vehicleApiKey) {
                this.zipCodeControl.enable();
                this.$makesList.html('<option>List of Makes</option>').attr('disabled', 'disabled');
                this.$modelsList.html('<option>List of Models</option>').attr('disabled', 'disabled');
                this.$yearsList.html('<option>List of Years</option>').attr('disabled', 'disabled');
            }

            if (global.year) {
                global.make = this.make;
                global.model = this.model;
                global.submodel = this.submodel;
                global.year = this.year;
                global.apiKey = this.vehicleApiKey;
                global.zipCode = this.zipCode;
                global.tabsList = this.tabsList;
                this.renderWidget();
            }

            this.widget = null;
            this.renderWidget();
        },
        reset: function () {
            this.el.reset();
            return this;
        }
    });
    global.AtGlanceConfigurator = AtGlanceConfigurator;
}(this));