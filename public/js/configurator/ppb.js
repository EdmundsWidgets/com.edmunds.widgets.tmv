(function(global) {
    "use strict";
    var widthSliderOptions = {

        min: 250,
        max: 970,
        value: 250
        },
        loadingTemplate = _.template(['' +
            '<div id="prise-promise-button-disabled" class="clearfix">' +
            '<span class="logo"></span>' +
            '<button class="price-button disabled" disabled="disabled">Get Your Special Offer</button>' +
            '</div>' +
        ''].join('')),
    PpbConfigurator = Backbone.View.extend({
        events: {
            'click #widget-get': 'onSubmit',
            'reset': 'onReset',
            'valid #vehicle-api-key-control': 'onVehicleApiKeyChange',
            'valid #zip-code-control': 'onZipCodeChange',
            'valid #vin-code-control':'onVinKeyChange',
            'keyup #vehicle-api-key-input': 'onApplyApiKey',
            'keyup #vin-code-input': 'onApplyVinKey',
            'keyup #zip-code-input': 'onApplyZipCode',
            'keypress #zip-code-input': 'zipCodeInputFilter',
            'paste #zip-code-input': 'zipCodeInputFilter',
            'click #vehicle-api-key-control [data-section="change"] .btn': 'onChangeClickKey',
            'click #vin-code-control [data-section="change"] .btn': 'onChangeClickVinKey',
            'click #zip-code-control [data-section="change"] .btn': 'onChangeClickZip',
            'click #option_size button[data-value="smallButton"]' : 'hideSlider',
            'click #option_size button[data-value="largeButton"]':'showSlider'
        },
        initialize: function() {
            var me = this;
            this.placeHolderWidth = null;
            global.vin = "please enter VIN here";
            this.$width = this.$('[name="width"]');
            this.$height = this.$('[name="height"]');
            this.$widthSlider = this.$('#width_slider');
            this.$inputVin = this.$('#vin-code-input');
            this.vehicleApiControl = this.$('#vehicle-api-key-control').inputGroupControl({
                tooltipTitle: 'Please enter a valid API key',
                validate: this.vehicleApiKeyValidator
            }).data('inputGroupControl');
            this.vinCodeControl = this.$('#vin-code-control').inputGroupControl({
                tooltipTitle: 'Please enter a valid VIN',
                disabled: true,
                validate: this.vin
            }).data('inputGroupControl');
            this.vinCodeControl.disable();
            this.zipCodeControl = this.$('#zip-code-control').inputGroupControl({
                tooltipTitle: 'Please enter a valid ZIP code',
                disabled: true,
                validate: this.zipCodeValidator
            }).data('inputGroupControl');
            this.zipCodeControl.disable();
            this.$('#vehicle-api-key-control div[data-section=change] .btn').on('click', $.proxy(this.zipCodeReset, this));
            this.$('#option_colorscheme')
                .radioGroup({
                    name: 'colorScheme',
                    value: 'light'
                })
                .on('change',function(event, name, value) {
                    $('#widget-placeholder')[ value === 'dark' ? 'addClass' : 'removeClass']('dark');
                    me.options.colorscheme = value;
                    if(global.vin && global.vin !== "please enter VIN here") {
                        me.renderWidget();
                    }
                })
                .data('radiogroup');
            this.$('#option_size')
                .radioGroup({
                    name: 'buttonSize',
                    value: 'largeButton'
                })
                .on('change',function(event, name, value) {
                    $('#widget-placeholder')[ value === 'smallButton' ? 'addClass' : 'removeClass']('smallButton');
                    me.options.buttonSize = value;
                    if(global.vin && global.vin !== "please enter VIN here") {
                        me.renderWidget();
                    }
                })
                .data('radiogroup');
            this.$('#option_colorscheme button').on('click', $.proxy(this.onChangeClass, this));
            this.$('#option_size button').on('click', $.proxy(this.onChangeClass, this));
            this.$('#option_size button[data-value="smallButton"]').on('click', $.proxy(this.changeSmallButtonText, this));
            this.$('#option_size button[data-value="largeButton"]').on('click', $.proxy(this.removeSpan, this));
            this.widthSlider = this.createSlider(this.$widthSlider, widthSliderOptions, _.bind(this.onWidthChange, this));
            this.renderWidget = _.debounce(this.renderWidget, 500);
            //this.onReset = _.debounce(this.onReset, 500, true);
        },

        $widgetPlaceholder: $('#widget-placeholder'),

        renderWidget: function () {
            this.options = this.toJSON();
            if(this.vehicleApiKey && this.zipCode && this.vin !== undefined && global.vin !== undefined){
                this.$widgetPlaceholder.find("#ppb").remove();
                this.$widgetPlaceholder.find("#ppb-" + this.vin).remove();
                var tmpl = '<div id="ppb-' + this.vin + '">' + '</div>';
                this.$widgetPlaceholder.width(this.placeHolderWidth);
                this.$widgetPlaceholder.prepend(tmpl);
                this.widget = EDM.createWidget({
                    type: 'ppb',
                    renderTo: 'ppb-' + this.options.vin,
                    style: {
                        width: this.options.width.replace('px', ''),
                        height: this.options.height.replace('px', ''),
                        color:  this.options.colorScheme,
                        size: this.options.buttonSize
                    },
                    scripts: [
                        '/libs/requirejs/require.js" data-main="js/main.js'
                    ],
                    options: {
                        apiKey: global.apiKey,
                        vin: global.vin,
                        zipCode:  global.zipCode,
                        isConfigurator : true,
                        size: this.options.buttonSize
                    }
                });
            }else {
                this.loading();
                return;
            }
            return this;
        },
        loading : function(){
            this.$widgetPlaceholder.find("#ppb").remove();
            this.$widgetPlaceholder.find("#ppb-" + global.vin).remove();
            this.$widgetPlaceholder.prepend('<div id="ppb"></div>');
            this.$widgetPlaceholder.find("#ppb").html(loadingTemplate);
            this.changeSmallButtonText();
        },
        changeSmallButtonText: function(){
            var button = this.$widgetPlaceholder.find('.price-button');
            if(this.$widgetPlaceholder.hasClass('smallButton')){
                button.html('<span class="special-offer">Special Offer</span>');
            }
        },
        removeSpan: function(){
            var button = this.$widgetPlaceholder.find('.price-button');
            button.find('.special-offer').remove();
            button.text('Get Your Special Offer');
        },
        createSlider: function ($el, options, onChange) {
            return $el.slider({
                range: 'min',
                value: options.value,
                min: options.min,
                max: options.max,
                create: function ( event, ui) {
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
            var
              $button = this.$widgetPlaceholder.find('.price-button'),
              $logo = this.$widgetPlaceholder.find('.logo'),
              $prisePromiseButtonDisabled =  this.$widgetPlaceholder.find('#prise-promise-button-disabled');

            if(!this.$widgetPlaceholder.hasClass('smallButton')){
                $prisePromiseButtonDisabled.css('display','inline-block');
                this.placeHolderWidth = value;
                this.$width.val(this.placeHolderWidth + 'px');
                this.$height.val(100 + 'px');
                global.zipCode = this.zipCode;
                this.$widgetPlaceholder.width(this.placeHolderWidth + 'px');
                if(value >= 452){
                    this.$height.val(100 + 'px');
                    $prisePromiseButtonDisabled.css('display','block');
                    $logo.css({
                        'vertical-align': -11,
                        display: 'inline-block',
                        'margin-right': 5
                    });
                    $button.css('display','inline-block');
                } else {
                    $logo.css({
                        'vertical-align': -11,
                        display: 'inline-block',
                        'margin-right': 0
                    });
                }
                if (value >= 474){ this.$height.val(75 + 'px'); }
                if (global.vin && global.vin !== "please enter VIN here"){ this.renderWidget(); }
            }else {
                this.placeHolderWidth = value;
            }
        },
        onVehicleApiKeyChange: function(event, apiKey) {
            this.vehicleApiKey = apiKey;
            global.apiKey = this.vehicleApiKey;
            this.zipCodeControl.enable();
            this.$('#franchise-id-input').focus();
            this.zipCodeControl.options.apiKey = apiKey;
        },
        onChangeClass: function(event){
           var current = event.currentTarget;
           (!$(current).hasClass('active')) ? $(current).addClass('active') : $(current).removeClass('active');
        },
        onChangeClickKey: function(){
            this.vehicleApiKey = undefined;
        },
        onChangeClickVinKey: function(){
            this.vin = undefined;
            this.renderWidget();
        },
        onVinKeyChange: function(event, value){
            this.vin = value;
            global.vin = this.vin;
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
        validateVin: function(){
            var value = this.$inputVin.val();
            if (vinValidate.validVin(value)){
                this.vin = global.vin = value;
            }else {
                this.vin = global.vin = 'please enter VIN here';
            }
        },
        vin: function(value){
            var deferred = new jQuery.Deferred();
            if (!vinValidate.validVin(value) || !value) {
                this.vin = global.vin = 'please enter VIN here';
                deferred.rejectWith(this, [value]);
                return deferred.promise();
            }else {
                this.vin = global.vin = value;
                deferred.resolveWith(this, [value]);
            }
           return deferred.promise();
        },
        onZipCodeChange: function (event, zipCode) {
            this.zipCode = zipCode;
            global.zipCode = this.zipCode;
            if(!this.vehicleApiKey){
                return;
            }
            this.vinCodeControl.enable();
            this.renderWidget();
        },
        onApplyZipCode: function(e) {
            if (e.keyCode == 13) {
                $("#zip-code-apply").click();
            }
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
        onChangeClickZip: function(){
            this.zipCode = undefined;
        },
        zipCodeValidator: function(value) {
            var deferred = new jQuery.Deferred(),
                ajaxUrl = 'http://api.edmunds.com/v1/api/region/zip/validation/';
            if(window.location.href.indexOf('https') !== -1){
                ajaxUrl = ajaxUrl.replace('http:','https:');
            }
            if (!/^\d{5}$/.test(value)) {
                deferred.rejectWith(this, [value]);
                return deferred.promise();
            }
            jQuery.ajax({
                url: ajaxUrl + value,
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
        zipCodeReset: function() {
            this.renderWidget();
        },
        onApplyApiKey: function(e) {
            if (e.keyCode == 13) {
                $("#vehicle-api-key-apply").click();
            }
        },
        onApplyVinKey: function(e){
            if(e.keyCode == 13){
                $('#vin-code-apply').click();
            }
        },
        toJSON: function() {
            var options = {};
            _.each(this.$el.serializeArray(), function (option) {
                options[option.name] = option.value;
            });
            return options;
        },
        onSubmit: function (event) {
            var isValid = true,
                tmpl = '&lt;div id="ppb-' + global.vin + '"' + '&gt;&lt;/div&gt;';
            event.preventDefault();
            if (!this.vehicleApiKey) {
                this.vehicleApiControl.$input.tooltip('show');
                isValid = false;
            }
            if (!this.zipCode) {
                this.zipCodeControl.$input.tooltip('show');
                isValid = false;
            }
            if (!this.vin || global.vin == 'please enter VIN here'){
                this.vinCodeControl.$input.tooltip('show');
                isValid = false;
            }
            if (isValid) {
                // TODO show instructions
                console.log(this.toJSON());
                $('#insert-js').html(this.getJavaScriptSnippet());
                $('#widget-instructions').modal({
                    backdrop: 'static',
                    show: true
                });
                $('.div-id').html(tmpl);
            }
        },

        getJavaScriptSnippet: function() {
            _.templateSettings = {
                interpolate : /\{\{(.+?)\}\}/g
            };
            if(window.location.href.indexOf('https') !== -1){
                PpbConfigurator.ORIGIN = PpbConfigurator.ORIGIN.replace('http:','https:');
            }
            var template = this.htmlEntities([
                    '<script type="text/javascript" src="' + PpbConfigurator.ORIGIN + '/loader-ppb.js"></script>\n',
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
            if(this.$widgetPlaceholder.hasClass('smallButton')){
                this.options.height = '50';
            }
            if(window.location.href.indexOf('https') !== -1){
                PpbConfigurator.ORIGIN = PpbConfigurator.ORIGIN.replace('http:','https:');
            }
            return {
                type: 'ppb',
                renderTo: 'ppb-' + this.options.vin,
                style: {
                    width: this.options.width.replace('px', ''),
                    height: this.options.height.replace('px', ''),
                    color:  this.options.colorScheme,
                    size: this.options.buttonSize
                },
                "scripts": [
                    "/libs/requirejs/require.js\" data-main=\""+ PpbConfigurator.ORIGIN + "/ppb/js/main.js"
                ],
                options: {
                    apiKey: global.apiKey,
                    vin: global.vin,
                    zipCode:  global.zipCode,
                    size: this.options.buttonSize
                }
            };
        },
        onReset: function () {
            //this.vehicleApiControl.reset();
            this.vinCodeControl.reset();
            this.zipCodeControl.reset();
            if (this.vehicleApiKey) {
                this.zipCodeControl.enable();
            }
            this.widthSlider.option(widthSliderOptions);
            //global.apiKey = undefined;
            this.vin = undefined;
            this.widget = null;
            this.renderWidget();
        },
        reset: function () {
            this.el.reset();
            return this;
        },
        hideSlider: function(){
            this.createSlider(this.$widthSlider, widthSliderOptions, null);
            this.$widgetPlaceholder.width(250 + 'px');
            this.$width.val(250 + 'px');
            this.$height.val(50 + 'px');
            this.$('.slider').hide();
        },
        showSlider: function(){
            var $slider = this.$('.slider');
            this.$height.val(100 + 'px');
            this.createSlider(this.$widthSlider, widthSliderOptions, _.bind(this.onWidthChange, this));
            if($slider.is(':hidden'))
                $slider.show();
        }
    });
    global.PpbConfigurator = PpbConfigurator;
}(this));


