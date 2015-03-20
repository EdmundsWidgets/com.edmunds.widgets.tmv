    /**
     * `template` HTML template - widget view
     * @property template
     * @static
     * @type {HTMLDivElement}
     */
    TMV.template = [
        '<div class="<%= baseClass %>-inner">',
            '<div class="<%= baseClass %>-header">',
                '<span class="title">True Market Value<sup>&reg;</sup></span><span class="question" onclick=""><sup>?</sup><div class="tmvwidget-tooltip"><div class="arrow-left"></div><%= tmvTooltip %></div></span>',
            '</div>',
            '<div class="<%= baseClass %>-body">',
                '<select class="<%= baseClass %>-make" id="<%= baseId %>_make" title="List of Makes"></select>',
                '<select class="<%= baseClass %>-model" id="<%= baseId %>_model" title="List of Models"></select>',
                '<select class="<%= baseClass %>-year" id="<%= baseId %>_year" title="List of Years"></select>',
                '<select class="<%= baseClass %>-style" id="<%= baseId %>_style" title="List of Styles"></select>',
                '<div class="<%= baseClass %>-row">',
                    '<div class="zip-code"><input type="text" class="<%= baseClass %>-zip" id="<%= baseId %>_zip" value="<%= zip %>" placeholder="ZIP" title="ZIP Code" maxlength="5"><div id="<%= baseId %>_zip_tooltip" class="tmvwidget-tooltip"><div class="arrow-left"></div>Please enter a valid Zip Code</div></div>',
                    '<button type="button" id="<%= baseId %>_button">Get Price</button>',
                    '',
                '</div>',
            '</div>',
            '<div class="<%= baseClass %>-price" id="<%= baseId %>_price">',
                '<div>',
                    '<div class="" id="<%= baseId %>_price_inner"></div>',
                '</div>',
            '</div>',
            '<div class="<%= baseClass %>-footer">',
                '<a href="http://developer.edmunds.com/tmv_widget_terms" class="copy" target="_blank">Legal Notice</a>',
                '<div class="logo">Built by<a href="http://www.edmunds.com/" target="_blank"></a></div>',
            '</div>',
        '</div>'
    ].join('');

    /**
     * `graphPriceTemplate` HTML template - view values of price in graph format
     * @property graphPriceTemplate
     * @static
     * @type {HTMLDivElement}
     */
    TMV.graphPriceTemplate = [
        '<div class="<%= baseClass %>-price-range">',
            '<div class="top">',
                '<div class="left">',
                    '<div class="label">Trade-in</div>',
                '</div>',
                '<div class="right">',
                    // prices
                    '<div class="values">',
                        '<span class="left value <%= isRangeMin %>" onclick=""><sup>$</sup><%= tmvMin %><div class="tmvwidget-tooltip"><div class="arrow-left"></div><%= tmvTooltipMin %></div></span>',
                        '<span class="right value <%= isRangeMax %>" onclick=""><sup>$</sup><%= tmvMax %><div class="tmvwidget-tooltip"><div class="arrow-left"></div><%= tmvTooltipMax %></div></span>',
                    '</div>',
                    // graph
                    '<div class="pointers">',
                        '<div class="graph">',
                            '<div class="left-part"></div>',
                            '<div class="right-part"></div>',
                        '</div>',
                        '<div class="left"></div>',
                        '<div class="right"></div>',
                    '</div>',
                    '<div class="note">based on mileage & condition adjustments</div>',
                '</div>',
            '</div>',
            // labels
            '<div class="bottom">',
                '<div class="left">',
                    '<span class="label"><%= lessLabel %></span>',
                    '<span class="value <%= isLess %>" onclick=""><sup>$</sup><%= less %><div class="tmvwidget-tooltip"><div class="arrow-left"></div><%= lessTooltip %></div></span>',
                '</div>',
                '<div class="right">',
                    '<span class="label"><%= moreLabel %></span>',
                    '<span class="value <%= isMore %>" onclick=""><sup>$</sup><%= more %><div class="tmvwidget-tooltip"><div class="arrow-left"></div><%= moreTooltip %></div></span>',
                '</div>',
            '</div>',
        '</div>'
    ].join('');

    /**
     * `textPriceTemplate` HTML template - view values of price in text format
     * @property textPriceTemplate
     * @static
     * @type {HTMLDivElement}
     */
    TMV.textPriceTemplate = [
        '<div class="<%= baseClass %>-price-text <%= showVehicles %> <%= priceClass %>">',
            // labels & prices
            '<div class="labels">',
                '<div class="top">',
                    '<span class="label"><%= tmvLabel %></span>',
                    '<span class="value <%= isTmv %>" onclick=""><sup>$</sup><%= tmv %><div class="tmvwidget-tooltip"><div class="arrow-left"></div><%= tmvTooltip %></div></span>',
                '</div>',
                '<div class="bottom">',
                    '<div class="right">',
                        '<span class="label"><%= moreLabel %></span>',
                        '<span class="value <%= isMore %>" onclick=""><sup>$</sup><%= more %><div class="tmvwidget-tooltip"><div class="arrow-left"></div><%= moreTooltip %></div></span>',
                    '</div>',
                    '<div class="left">',
                        '<span class="label"><%= lessLabel %></span>',
                        '<span class="value <%= isLess %>" onclick=""><sup>$</sup><%= less %><div class="tmvwidget-tooltip"><div class="arrow-left"></div><%= lessTooltip %></div></span>',
                    '</div>',
                '</div>',
            '</div>',
        '</div>'
    ].join('');

    /**
     * @property TOOLTIP_TMV
     * @static
     * @final
     * @type {String}
     */
    TMV.TOOLTIP_TMV          = 'The Edmunds.com TMV® (Edmunds.com True Market Value®) price is Edmunds.com’s determination of the current average base dealer price in the area indicated by the Zip Code provided, unadjusted for vehicle color or any options. (Or, for used vehicles, condition and mileage.)';

    /**
     * @property TOOLTIP_INVOICE
     * @static
     * @final
     * @type {String}
     */
    TMV.TOOLTIP_INVOICE      = 'This is the price the dealer paid the manufacturer for the car, including destination charges.';

    /**
     * @property TOOLTIP_MSRP
     * @static
     * @final
     * @type {String}
     */
    TMV.TOOLTIP_MSRP         = 'Also known as Manufacturer’s Suggested Retail Price, this is the price the manufacturer recommends selling the car for – and often the starting point for negotiations with the dealer. Most consumers end up purchasing their car for less than MSRP.';

    /**
     * @property TOOLTIP_TRADEIN_MIN
     * @static
     * @final
     * @type {String}
     */
    TMV.TOOLTIP_TRADEIN_MIN      = 'This is the amount you can expect to receive when you trade in this vehicle and purchase a new one. This trade-in price is adjusted for 50,000 miles and a ROUGH condition. Vehicle color and options are unadjusted for.';

	/**
     * @property TOOLTIP_TRADEIN_MAX
     * @static
     * @final
     * @type {String}
     */
    TMV.TOOLTIP_TRADEIN_MAX     = 'This is the amount you can expect to receive when you trade in this vehicle and purchase a new one. This trade-in price is adjusted for 15,000 miles and an OUTSTANDING condition. Vehicle color and options are unadjusted for.';

    /**
     * @property TOOLTIP_PRIVATEPARTY
     * @static
     * @final
     * @type {String}
     */
    TMV.TOOLTIP_PRIVATEPARTY = 'This is the amount at which the car is sold to or purchased by a private party, not a car dealer. This price is adjusted to CLEAN condition plus typically equipped options.';

    /**
     * @property TOOLTIP_TMVRETAIL
     * @static
     * @final
     * @type {String}
     */
    TMV.TOOLTIP_TMVRETAIL    = 'This is what other customers have paid for a similar car in your area. This dealer price is adjusted to CLEAN condition plus typically equipped options.';
