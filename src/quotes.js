window['cme.component.product.QuotesFutureComponent'] = function () {
	this.url = undefined;
	this.refreshQuotesUrl = undefined;
	this.quoteCodes = undefined;
	this.extraData = undefined;
	this.tableId = undefined;
	this.mustacheUrl = "/apps/cmegroup/widgets/productLibs/mustache/quotes/product.quotes.future.html";
	this.autoUpdateTimeout = 30000;
	this.ttl = (10 * 60) / (this.autoUpdateTimeout / 1000);
	this.autoUpdateCalled = false;
	var that = this;
	this.index = 0;
	this.dataJsonPropertyName = "quotes";
	this.textStatusOn = $j('.productMarketMessageTranslationLabels .marketDataUpdating').attr('data-value') || "Market data is updating";
	this.textStatusOff = "";
	
	this.init = function () {
		setTimeout(that.refreshDataTable, 0);
		this.setDelayedStatus();
	}
	
	this.setDelayedStatus = function (){
		$j.ajax({
			url: that.url,
			global: false,
			dataType: 'json',
			data : {"quoteCodes" : ""},
			success: function(data) {
				if(!data){
					return;
				} else {
					//is delayed?
                    if(data.quoteDelayed){
						that.textStatusOn = $j('.productMarketMessageTranslationLabels .marketDataDelayed').attr('data-value') || "Market data is delayed by at least 10 minutes.";
						$j('span#cmeMarketDataStatus').html(that.textStatusOn);
                     }else{
                    	$j('span#cmeMarketDataStatus').html(that.textStatusOff);
                     }
				}
			},
			cache: false
		});
	};
	
	this.autoUpdate = function() {
		$j.ajax({
			url: that.url,
			global: false,
			dataType: 'json',
			data : {"quoteCodes" : that.quoteCodes},
			success: function(data) {
				if(!data){
					return;
				} else {
					var quotes = data.quotes;
					if (!quotes) {
						quotes = data;
					}
					if(that.autoUpdateCalled){
						for(var i = 0; i< quotes.length;i++) {
							productUpdateQuoteValue(that.tableId, quotes[i], i);
						}
						setTimeout(function(){$j("td",that.tableId).removeClass('cmeChanged');}, 500);
					}else{
						var context = {}
						context["quotes"] = data;
						$j.extend(context,that.extraData);
						// that.refreshDataTable();
						that.autoUpdateCalled=true;
						$j("#noDataDiv, #technicalErrorDiv").empty();
					}
				}
			},
			cache: false
		});
		that.autoUpdateTimeout = 30000;
	};
	
	this.beforeShutdownAutoUpdate  = function() {
		$j('span#cmeMarketDataStatus').html(that.textStatusOff);
	};

	this.beforeStartAutoUpdate = function() {
		$j('span#cmeMarketDataStatus').html(that.textStatusOn);
	};

	this.getAjaxUrl = function() {
		return that.url;
	};

	this.getMustacheUrl = function() {
		return that.mustacheUrl;
	};
};


window['cme.component.product.QuotesOptionComponent'] =function() {
	var that = this;
	this.autoUpdateTimeout = 30000;
	this.ttl = (10 * 60) / (this.autoUpdateTimeout / 1000);

	this.extraData = undefined;
	this.categories = undefined;
	this.venue = undefined;
	this.echangeCode = undefined;


	this.mustacheUrl = "/apps/cmegroup/widgets/productLibs/mustache/quotes/product.quotes.option.html";
	this.mustacheMobileUrl = "/apps/cmegroup/widgets/productLibs/mustache/quotes/product.quotes.option.mobile.html";
	this.mustacheUnderlyingFutureUrl = "/apps/cmegroup/widgets/productLibs/mustache/quotes/product.quotes.option.underlying_future.html";
	this.mustacheMobileUnderlyingFutureUrl = "/apps/cmegroup/widgets/productLibs/mustache/quotes/product.quotes.option.underlying_future.mobile.html";

	this.optionTableId = undefined;
	this.underlyingFutureTableId = undefined;

	this.underlyingFuture = undefined;

	this.optionContractQuoteCodes = [];
	this.futureContractQuoteCode = undefined;

	this.autoUpdateType = "GET";

	this.textStatusOn = $j('.productMarketMessageTranslationLabels .marketDataUpdating').attr('data-value') || "Market data is updating";
	this.textStatusOff = "";


	this.beforeShutdownAutoUpdate  = function() {
		$j('span#cmeMarketDataStatus').html(that.textStatusOff);
	};

	this.beforeStartAutoUpdate = function() {
		$j('span#cmeMarketDataStatus').html(that.textStatusOn);
	};

	this.init = function () {
		this.initCategories();
		this.initParamsFromWS();
		this.initFutureContracts();
		
		var changeOption = function(select) {
			var expirationSelect = this.form["optionExpiration"];
			var currentExpirationSelect = that.getSelectedValue(expirationSelect);

			var setFilters = cmePageFiltersBuildArrayFromString(window.location.hash.replace("#","").toString());
			setFilters = _.extend({}, getQueryStrings(location.search), setFilters);
			cmePageFiltersAdd(setFilters);  // add filters to DOM

			if (!currentExpirationSelect && setFilters.optionExpiration) {
				currentExpirationSelect = setFilters.optionProductId + '-' + setFilters.optionExpiration;
			}

			//set the selected expiration in the extraDataContext
			//that.extraData.optionExpiration = currentExpirationSelect;
			var expiration;
			if (currentExpirationSelect){
				expiration = currentExpirationSelect.split("-")[1];
			}
			var productId =  that.getSelectedValue(this) || cmePageFilters.optionProductId;
			that.extraData.optionProductId = productId;
			if (that.cmeRequestManager) {
				that.cmeRequestManager.handlerObj.setParam("optionProductId", productId);
				that.cmeRequestManager.handlerObj.refreshLinks();
			}

			expirationSelect.options.length= 0;
			var expSelected = false;
			for(var expId in that.categories[productId].expirations) {
				var exp = that.categories[productId].expirations[expId];
				var opt = new Option(exp.label, expId);
				if (exp.expiration == expiration && ! expSelected) {
					opt.selected = true;
					expSelected  = true;
				}
				expirationSelect.options.add(opt);
			}
			if (expirationSelect.options.length === 0) { expirationSelect.disabled = true; } else { expirationSelect.disabled = false; }	// disable select if no options
			delete that.underlyingFuture;
			that.changeProductName(that.categories[productId].name);
			cmePageFiltersAdd({ "optionProductId": productId});

			updateMobileNavigation("optionProductId", productId); // CHANGE MOBILE PAGE NAVIGATION SELECT VALUES TO EMBED NEW OPTIONPRODUCTID

			//trigger event 
			$j('#cmeOptionExpiration').trigger('change', ['optionchanged']);
			$j('#cmeStrikeRange').trigger('change', ['optionchanged']);
			
			that.refresh(this.form);
		};
		var changeOptionExpiration = function(select, optionChanged) {
			var expirationSelect = this.form["optionExpiration"];
			var currentExpirationSelect =  that.getSelectedValue(expirationSelect);
			//set the selected expiration in the extraDataContext
			that.extraData.optionExpiration = currentExpirationSelect;
			if (that.cmeRequestManager) {
				that.cmeRequestManager.handlerObj.setParam("optionExpiration", currentExpirationSelect);
				that.cmeRequestManager.handlerObj.refreshLinks();
			}
			delete that.underlyingFuture;
			if (!optionChanged) {
				that.refresh(this.form);
			}
		};
		var changeStrikeRange = function(select, optionChanged) {
			cmePageFiltersAdd({ "strikeRange": that.getSelectedValue(this)});
			if (!optionChanged) {
				that.refresh(this.form);
			}
		};
		var changeUnderlyingFuture = function(select) {
			var code =  that.getSelectedValue(this);
			that.underlyingFuture = code;
			that.updateFutureQuotes(this.form);
		};

		$j('#productTabs').on('change', '#cmeMonthSelector', changeUnderlyingFuture);

		$j('#cmeStrikeRange').on('change', changeStrikeRange);

		$j('#cmeOptionExpiration').on('change',changeOptionExpiration);

		$j('#cmeOptionProductId').on('change',changeOption);
	};

	/**
	 * Get future contracts from WS
	 */
	this.initFutureContracts = function(){
		$j.ajax({
			url: '/CmeWS/mvc/Options/FutureContracts/' + that.extraData.productId,
			global: false,
			dataType: 'json',
			data: {},
			success: function(data) {
				if (!data){
					return;
				} else {
					that.extraData.futureContracts = data;
				}
			},
			error : function (query) {
				if (query.status === 400) {
					that.autoUpdateType = 'POST';
				}
			},
			cache: false
		});			
	}
	
	this.setDelayedStatus = function (quotes){
		if(quotes.quoteDelayed){
			that.textStatusOn = $j('.productMarketMessageTranslationLabels .marketDataDelayed').attr('data-value') || "Market data is delayed by at least 10 minutes.";
			$j('span#cmeMarketDataStatus').html(that.textStatusOn);
		 }else{
			$j('span#cmeMarketDataStatus').html(that.textStatusOff);
		 }
	};
	
	/**
	 * Init some params from WS like pitTraded and exchangeCode.
	 */
	this.initParamsFromWS = function(){
		$j.ajax({
			url: '/CmeWS/mvc/ProductLight/' + that.extraData.productId,
			global: false,
			dataType: 'json',
			data: {},
			success: function(data) {
				if (!data) {
					return;
				} else {
					if (data.pitTraded) {
						that.isPitTraded = 'Y';
					} else {
						that.isPitTraded = 'N';
					}
					
					that.exchangeCode = data.exchCode;
					
				}
			},
			error: function(query) {
				if (query.status === 400) {
					that.autoUpdateType = 'POST';
				}
			},
			complete: function() {
				that.isPitTraded = 'N';
			},
			cache: false
		});			
	}
	
	
	this.initCategories = function(){
		$j.ajax({
			url: that.categoriesUrl,
			global: false,
			dataType: 'json',
			data: {
				'optionTypeFilter': that.optionTypeFilter
			},
			success: function(data) {
				if (!data) {
					return;
				} else {
					that.categories = data;
					that.fillCategoriesCombo();
				}
			},
			error: function(query) {
				if (query.status === 400) {
					that.autoUpdateType = 'POST';
				}
			},
			cache: false
		});
	}
	
	that.fillCategoriesCombo = function(){
		var optionType = '';
		//getSelected productId
		$j.ajax({
			url: '/CmeWS/mvc/Options/OptionType/' + that.extraData.optionProductId,
			global: false,
			dataType: 'json',
			data: {},
			success: function(data) {
				optionType = data;
			},
			complete: function() {
				var selectedCategory = '',
					optionsCatHTML = '';

				if(that.extraData.optionProductId != ''){
					for (category in that.categories) {
						if (category === that.extraData.optionProductId || that.categories[category].productIds.toString().indexOf(that.extraData.optionProductId) > -1) {
							selectedCategory = category;
						}
					}
				}

				if (!selectedCategory && optionType){
					for (category in that.categories) {
						if (that.categories[category].optionType === optionType) {
							selectedCategory = category;
						}
					}
				}

				//if selected product id comes from ajax params, overrides
				if (window.location.hash.length > 1 && window.location.hash !== "#pageNumber=1") {	// get page filters used for ajax calls from window hash
					// get array from window hash string
					var setFilters = cmePageFiltersBuildArrayFromString(window.location.hash.replace("#","").toString());
					// trigger drop down change events in order
					if (setFilters["optionProductId"] !== undefined) {
						selectedCategory = setFilters["optionProductId"];
					}

				}	
				
				var sort_array = [];
				for (var key in that.categories) {
					sort_array.push({key:key,label:that.categories[key].label});
				}

				// Now sort it:
				sort_array.sort(that.compare);

				if (!selectedCategory) {
					selectedCategory = sort_array[0].key;
				}

				//fill category type combo
				for (category in sort_array) {
					if (sort_array[category].key === selectedCategory) {
						optionsCatHTML += '<option selected="selected" value="' + sort_array[category].key + '">' + that.categories[sort_array[category].key].label + '</option>';
					} else {
						optionsCatHTML += '<option value="' + sort_array[category].key + '">' + that.categories[sort_array[category].key].label + '</option>';
					}
				}
				$j('#cmeOptionProductId').eq(0).html(optionsCatHTML);

				$j('#cmeOptionProductId').trigger('change');
				
				//set optionExpiration
				var optExpiration = that.extraData.optionExpiration;//save for later
				for (expiration in that.categories[selectedCategory].expirations) {
					if (expiration === optExpiration) {
						$j('#cmeOptionExpiration').val(optExpiration);
					}
				}
				
				//fill strikeRange if present in url(ajax)
				if (window.location.hash.length > 1 && window.location.hash !== "#pageNumber=1") {	// get page filters used for ajax calls from window hash
					// get array from window hash string
					var setFilters = cmePageFiltersBuildArrayFromString(window.location.hash.replace("#","").toString());
					// trigger drop down change events in order
					if (setFilters["strikeRange"] !== undefined) {
						$j('#cmeStrikeRange').val(setFilters["strikeRange"]);	// set dropdown value
					}
					cmePageFiltersAdd(setFilters);	// add filters to DOM

				}	
				
				//trigger event 
				$j('#cmeOptionExpiration').trigger('change', ['optionchanged']);
				$j('#cmeStrikeRange').trigger('change', ['optionchanged']);
			},
			cache: false
		});
	}

	this.compare = function(a,b) {
		if (a.label < b.label)
			return -1;
		if (a.label > b.label)
			return 1;
		return 0;
	}
	
	this.refresh = function(form) {
		if (!form) {
			form = $j('#quotesoptionsform').get(0);
		}
		$j.fn.getTableDataByAJAX2(that.getAjaxUrl(form), 'json',
			[ { 'template' : that.mustacheUrl, 'mobileTemplate' : that.mustacheMobileUrl, 'tableId' : that.optionTableId , 'hasNoData' : that.hasNoData } ,
			{ 'template' : that.mustacheUnderlyingFutureUrl, 'mobileTemplate' : that.mustacheMobileUnderlyingFutureUrl, 'tableId' : that.underlyingFutureTableId}],
			that.extraData, isResponsiveMode(),
			function(data) {
				//set status message
				that.setDelayedStatus(data.quotes);
				// post process to change select future contracts
				that.optionContractQuoteCodes = [];

				if (data.quotes && data.quotes.underlyingFutureContractQuotes && data.quotes.underlyingFutureContractQuotes.length > 0) {
					var selected = data.quotes.underlyingFutureContractQuotes[0].code;
					that.futureContractQuoteCode = data.quotes.underlyingFutureContractQuotes[0].quoteCode;
					for(var i = 0; i < data.futureContracts.length; i++) {
						data.futureContracts[i].selected = data.futureContracts[i].code == selected;
					}
				}
				if (data.quotes && data.quotes.optionContractQuotes && data.quotes.optionContractQuotes.length > 0) {
					for(var i = 0; i < data.quotes.optionContractQuotes.length; i++) {
						var oq = data.quotes.optionContractQuotes[i];
						if (oq.call && oq.call.quoteCode) {
							that.optionContractQuoteCodes[that.optionContractQuoteCodes.length] = oq.call.quoteCode;
						}
						if (oq.put && oq.put.quoteCode) {
							that.optionContractQuoteCodes[that.optionContractQuoteCodes.length] = oq.put.quoteCode;
						}
					}
				}

				data.hasUnderlyingFutureContract = data.quotes.underlyingFutureContractQuotes && data.quotes.underlyingFutureContractQuotes.length > 0;
			}
		);
	};

	this.isCodeValid = function(code) {
		return (code !== "-");
	}

	this.autoUpdate = function() {
		var url=that.getAjaxUrl($('form#quotesoptionsform.cmeDynamicForm')[0]);

		var data= {};

		$j.ajax({
			url: url,
			global: false,
			dataType: 'json',
			data : data,
			type : that.autoUpdateType,
			success: function(data) {
				if(!data){
					return;
				} else {
					if (data.underlyingFutureContractQuotes) {
						for(var i = 0; i< data.underlyingFutureContractQuotes.length;i++) {
							productUpdateQuoteValue(that.underlyingFutureTableId, data.underlyingFutureContractQuotes[i], i);
						}
						setTimeout(function(){$j("td",that.underlyingFutureTableId).removeClass('cmeChanged');}, 500);
					}
					if (data.optionContractQuotes) {
						for(var i = 0; i< data.optionContractQuotes.length;i++) {
							var oq = data.optionContractQuotes[i];
							if (oq.call) {
								productUpdateQuoteValue(that.optionTableId, oq.call, i);
							}
							if (oq.put) {
								productUpdateQuoteValue(that.optionTableId, oq.put, i);
							}
						}
						setTimeout(function(){$j("td",that.optionTableId).removeClass('cmeChanged');}, 500);
					}
				}
			},
			error : function (query) {
				if (query.status == 400) {
					that.autoUpdateType = "POST";
				}
			},
			cache: false
		});
	};

	this.unresponsify = function() {
		that.refresh();
	};

	this.responsify = function() {
		that.refresh();
	};

	this.updateFutureQuotes = function(form) {
		$j.fn.getTableDataByAJAX2(that.getAjaxUrl(form), 'json',
			[ { 'template' : that.mustacheUnderlyingFutureUrl, 'mobileTemplate' : that.mustacheMobileUnderlyingFutureUrl,  'tableId' : that.underlyingFutureTableId}],
			that.extraData,  isResponsiveMode(),
			function(data) { // post process to change select futur contracts
				if (data.quotes && data.quotes.underlyingFutureContractQuotes && data.quotes.underlyingFutureContractQuotes.length > 0) {
					var selected = data.quotes.underlyingFutureContractQuotes[0].code;
					that.futureContractQuoteCode = data.quotes.underlyingFutureContractQuotes[0].quoteCode;
					for(var i = 0; i < data.futureContracts.length; i++) {
						data.futureContracts[i].selected = data.futureContracts[i].code == selected;
					}
				}
				data.hasUnderlyingFutureContract = data.quotes.underlyingFutureContractQuotes && data.quotes.underlyingFutureContractQuotes.length > 0;
			}
		);
	};
	this.hasNoData = function(context) {
		return !context.quotes || !context.quotes.optionContractQuotes || !context.quotes.optionContractQuotes.length;
	};
	this.getAjaxUrl = function(form) {
		var productId = form.optionProductId.options ?  that.getSelectedValue(form.optionProductId) : form.optionProductId.value;
		var expId;
		var strikeRange =  form.strikeRange.options ?  that.getSelectedValue(form.strikeRange) : form.strikeRange.value;

		if (form.optionExpiration.options && form.optionExpiration.options[form.optionExpiration.selectedIndex]) {
			expId =  form.optionExpiration.options[form.optionExpiration.selectedIndex].value;
		} else if (form.optionExpiration.value) {
			expId = form.optionExpiration.value;
		}

		var optionCategory = that.categories[productId];

		if (expId) {
			var optionExpiration = optionCategory.expirations[expId];

			var url = "/CmeWS/mvc/Quotes/Option/"  + optionExpiration.productId + "/" + that.venue;
			url += "/" + optionExpiration.expiration;
			url += "/" + strikeRange;

			if (that.underlyingFuture) {
				url += "?overrideFuture="+ that.underlyingFuture;
			}

			return url;
		} else {
			var url = "/CmeWS/mvc/Quotes/Option/"  + productId + "/" + that.venue;

			url += "/" + strikeRange;

			if (that.underlyingFuture) {
				url += "?overrideFuture="+ that.underlyingFuture;
			}

			return url;
		}
	};
};

function productUpdateQuoteValue(tableId, quote, rowCounter) {
	for(var prop in quote) {
		var value = quote[prop];
		//var node = $j(tableId + '_' + quote.escapedQuoteCode + '_' + prop );
		var node = $j("tbody tr:eq("+rowCounter+") " + tableId + '_' + quote.escapedQuoteCode + '_' + prop, tableId);
		var valueNode = node;

		if (node.size() > 0) {
			if (prop != "updated" && node.children().size() > 0) {
				valueNode = node.children();
			}
			var pValue = valueNode.html();
			if (prop == 'updated') { // <br /> can get replace by <br>
				pValue = pValue.replace(/<br>/ig, "<br />");
				pValue = pValue.replace("<br /> ", "<br />");
				value = value.replace("<br /> ", "<br />");
			} else if (prop == 'change') {
				var style = quote.netChangeStatus;
				node.removeClass('statusNull').removeClass('statusOK').removeClass('statusAlert').addClass(style);
				var i = 0;
			}
			if (pValue != value) {
				if (($j('html').hasClass('msie-8')) || ($j('html').hasClass('msie-7'))){
					valueNode.innerHTML = value;
				} else {
					valueNode.html(value);
				}
				//if (!node.hasClass('cmeChanged')) {
					node.addClass('cmeChanged');
				//}
			} else {
				//if (node.hasClass('cmeChanged')) {
					node.removeClass('cmeChanged');
				//}
			}
		}
	}
}
if (typeof cmeProductChart === "undefined"){
	var cmeProductChart = {}; // create the chart object
}

$j('#cmePageWrapper').on('click', 'a[rel*=priceChart]', function(e) {
	e.preventDefault();
	e.stopPropagation();
}).on('tap', 'a[rel*=priceChart]', function(e) {
	e.preventDefault();
	e.stopPropagation();
	var myLinkButton = $j(this);
	var windowTarget = sanitiseURL(this.href);
	var windowTitle = this.title;
	cmeProductChart.chartIsInline = true;
	if ((typeof(dataLayer) !== "undefined") && (!myLinkButton.hasClass('cmeActiveButton'))){
		var gtmArray = new Array();
		gtmArray.push('priceChartExpand', 'priceCharts', 'expand', windowTarget);
		fireGTMTracking('event', gtmArray);
	}
	if ($j('html').hasClass('cmeResponsive')) {
		window.open(windowTarget, "_blank");
	} else {
		cmeProductChart.chartAction = "paint";
		addPriceChart(myLinkButton);
	}
});

$j('#cmePageWrapper').on('click', 'a[rel*=chartPopup]', function(e) {
	e.preventDefault();
	e.stopPropagation();
}).on('tap', 'a[rel*=chartPopup]', function(e) {
	e.preventDefault();
	e.stopPropagation();
	var myLinkButton = $j(this);	
	if ($j('html').hasClass('cmeResponsive')) {
		window.open(myLinkButton.attr('href'), "_blank");
	} else {
		openPopupWindow(myLinkButton.attr('href'), makeDOMFriendly(myLinkButton.attr('title')), 'no','no','no','no','no','no','no','no',780,630);
	}
});

$j('#cmePageWrapper').on('click', '.cmeChartCloseButton', function(e) {
	e.preventDefault();
	e.stopPropagation();
}).on('tap', '.cmeChartCloseButton', function(e) {
	e.preventDefault();
	e.stopPropagation();
	$j(this).closest('.cmeChartComponent').slideUp('slow', function() {
		if ($j(this).closest('.cmeActiveChartRow').prev('tr').find('a[rel*=priceChart]').hasClass('cmeActiveButton')) {
			$j(this).closest('.cmeActiveChartRow').prev('tr').find('a[rel*=priceChart]').removeClass('cmeActiveButton');
		}
		$j(this).closest('.cmeDynamicComponent').remove();
	});
});

if(isTradingViewEnabled()) {
	if (typeof tradingview_initcmePageWrapper === 'function') {
		tradingview_initcmePageWrapper();
	}
} else {
	if (typeof esignal_initcmePageWrapper === 'function') {
		esignal_initcmePageWrapper();
	}
}

function addPriceChart(myLink){
	if (isTradingViewEnabled()) {
		tradingview_addPriceChart(myLink);
	} else {
		esignal_addPriceChart(myLink);
	}
}

function initChartWindow() {
	if (isTradingViewEnabled()) {
		tradingview_initChartWindow();
	} else {
		esignal_initChartWindow();
	}
}

function isTradingViewEnabled() {
	return window.tradingViewEnabled;
}

function esignal_initcmePageWrapper() {
	$j('#cmePageWrapper').on('click', '.cmeEsignalChartButton', function(e) {
	    e.preventDefault();
		e.stopPropagation();
	}).on('tap', '.cmeEsignalChartButton', function(e) {
		e.preventDefault();
		e.stopPropagation();
			var myChartComponent = $j(this).closest('.cmeChartComponent');
			var myChartWidth = myChartComponent.width();
			var $jtarget = $j(this).closest('.cmeActiveChartCell').find('.cmeDynamicChart');
			var myChartUrl = $j('#chartURL', myChartComponent).val();
			var symbol = -1;
			var myMonth, myYear, showAllMonths = false;
			if ($j('#symbol', myChartComponent).length){
				symbol = (($j('#symbol', myChartComponent).val() !== '0') ? $j('#symbol', myChartComponent).val() : 0);
			}
			if (symbol != -1) {
				symbol = chartCodes[symbol];
			}
	
			if($j("#month", myChartComponent).length !== 0) {
				myMonth = (($j('#month', myChartComponent).val() !== '0') ? $j('#month', myChartComponent).val() : 0);
				if (myMonth === "00") {
					myMonth = "1!";
					myYear = "";
					showAllMonths = true;
				} else if (myMonth === "1!"){
					myYear = "";
				} else if (myMonth === "2!"){
					myYear = "";
				} else {
					myYear = (($j('#year', myChartComponent).val() !== '0') ? $j('#year', myChartComponent).val() : 0);
				}
				myChartUrl = changeURLParameter(myChartUrl, "monthYear", myMonth+myYear);
			}
			var period = (($j('#period', myChartComponent).val() !== '0') ? $j('#period', myChartComponent).val() : 0);
			var bartype = (($j('#bartype', myChartComponent).val() !== '0') ? $j('#bartype', myChartComponent).val() : 0);
			var bardensity = (($j('#bardensity', myChartComponent).val() !== '0') ? $j('#bardensity', myChartComponent).val() : 0);
			var study = (($j('#study', myChartComponent).val() !== '0') ? $j('#study', myChartComponent).val() : 0);
			var study0 = (($j('#study0', myChartComponent).val() !== '0') ? $j('#study0', myChartComponent).val() : 0);
			var study1 = (($j('#study1', myChartComponent).val() !== '0') ? $j('#study1', myChartComponent).val() : 0);
			var study2 = (($j('#study2', myChartComponent).val() !== '0') ? $j('#study2', myChartComponent).val() : 0);
			var study3 = (($j('#study3', myChartComponent).val() !== '0') ? $j('#study3', myChartComponent).val() : 0);
			esignal_updateChart(myChartUrl,symbol,period,bartype,bardensity,study,study0,study1,study2,study3,$jtarget,myChartWidth,showAllMonths);
	});
}

function esignal_addPriceChart(myLink){
	if (myLink.attr('href').indexOf("?") !== -1) {
		if (myLink.hasClass('cmeActiveButton')) {
			myLink.removeClass('cmeActiveButton');
			myLink.closest('tr').next('tr').find('.cmeChartCloseButton').trigger('tap');
		} else {
			myLink.addClass('cmeActiveButton');
			$jchartURL = sanitiseURL(myLink.attr('href'));
			$jcurrentRow = myLink.closest('tr');
			var myCount = 0;
			$j(' > * ', $jcurrentRow).each(function () {
		        if ($j(this).attr('colspan')) {
		            myCount += +$j(this).attr('colspan');
		        } else {
		            myCount++;
		        }
		    });
		    var $jnewRow = $j('<tr class="cmeActiveChartRow cmeDynamicComponent"></tr>');
		    $jnewRow.html('<td class="cmeActiveChartCell" colspan="' + myCount + '"></td>');
		    $jnewRow.find('td').html('<div class="cmeChartComponent"><div class="cmeChartContainer">&nbsp;</div><div class="cmeContentBox cmeFormComponent cmeChartParameters">&nbsp;</div></div>');
			$jcurrentRow.after($jnewRow);

			$j('.cmeChartComponent', $jnewRow).hide(0, function() {
				esignal_getChart($jchartURL, $j('.cmeChartContainer', $jnewRow), $jnewRow.find('td').width(), true);
				esignal_getChartForm($jchartURL, $j('.cmeChartParameters', $jnewRow));
			}).slideDown('slow');
		}
	}
}

function esignal_initChartWindow() {
	var myChartURL = sanitiseURL(window.location.href);
	document.title = window.name;
	esignal_getChart(myChartURL, $j('.cmeChartContainer'), $j(window).width(), false);
	esignal_getChartForm(myChartURL, $j('.cmeChartParameters'), chartCodes);
}

function cmeEsignalChart(url,cont,period,barType,barDensity,showExtendedNames,headerBackground,headerForeground,headerDataColor,chartSize,chartStudy){
this.chartSrc = url;
this.chartCont = cont;
this.period = period;
this.barType = barType;
this.barDensity = barDensity;
this.showExtendedNames = showExtendedNames;
this.headerBackground = headerBackground;
this.headerForeground = headerForeground;
this.headerDataColor = headerDataColor;
this.chartSize = chartSize;
this.chartStudy = chartStudy;
}

var myPeriod = 'D', myBarType = 'BAR', myBarDensity = 'Low', myChartStudy = 0;

function esignal_getChart(chartURL, target, myWidth, isInline) {
	var myChartSrcBuilder = "";
	var qs = getQueryStrings(chartURL);
	var myChartCode = qs["code"];
	var myChartTitle = qs["title"];
    var myChartType = ((qs["type"] = 'p') ? 'p' : 'v');
    var myChartVenue = qs["venue"];
    var myChartMonth = qs["monthYear"];
    var myChartExchangeCodeSuffix = qs["exchangeCode"];
    myChartExchangeCodeSuffix = ((myChartExchangeCodeSuffix === "CMED") ? "-CEU" : "");
	var myChartSize = Math.round(myWidth) + 'X' + Math.round(myWidth * 0.48);
	
	var myEsignalChart = new cmeEsignalChart('http://charts.marketcenter.com/cis/cbotcis', myChartCode + ' ' + myChartMonth + (myChartVenue == 0 ? '' : '=' +  myChartVenue) +  myChartExchangeCodeSuffix,'D','BAR','LOW','true','255,255,255','0,0,0','0,0,0',myChartSize,myChartStudy);
	myEsignalChart.chartSrc = myEsignalChart.chartSrc + '?cont=' + extendedEncodeURIComponent(myEsignalChart.chartCont) + '&period=' + extendedEncodeURIComponent(myEsignalChart.period) + '&bartype=' + extendedEncodeURIComponent(myEsignalChart.barType) + '&bardensity=' + extendedEncodeURIComponent(myEsignalChart.barDensity) +'&showextendednames=' + extendedEncodeURIComponent(myEsignalChart.showExtendedNames) + '&headerbackground=' + extendedEncodeURIComponent(myEsignalChart.headerBackground) + '&headerforeground=' + extendedEncodeURIComponent(myEsignalChart.headerForeground) + '&headerdatacolor=' + extendedEncodeURIComponent(myEsignalChart.headerDataColor) + '&size=' + extendedEncodeURIComponent(myEsignalChart.chartSize);
	var img = $j('<img class="cmeDynamicChart cmeESignalChart">');
	img.attr('src', myEsignalChart.chartSrc);
	target.append(img);
	if (isInline === true) {
		target.append('<div><a href="#" class="cmeButton cmeButtonSecondary cmeCloseButton cmeChartCloseButton"><span>Close</span></a></div>');
	}
}

function esignal_updateChart(chartURL, symbol, period, bartype, bardensity, study, study0, study1, study2, study3, target, chartWidth, showAllMonths) {
	var qs = getQueryStrings(chartURL);
	var myChartCode = qs["code"];
	var myChartTitle = qs["title"];
    var myChartType = ((qs["type"] = 'p') ? 'p' : 'v');
    var myChartVenue = qs["venue"];
    var myChartMonth = qs["monthYear"];
    var myChartExchangeCodeSuffix = qs["exchangeCode"];
    myChartExchangeCodeSuffix = ((myChartExchangeCodeSuffix === "CMED") ? "-CEU" : "");
    var myChartSize = chartWidth + 'X' + Math.round(chartWidth * 0.48);
    if (symbol != -1) {
    	myChartCode = symbol["code"];
    	myChartVenue = symbol["venueCode"];
    }

    var chartCodePrefix = "";
    chartCodePrefix = (showAllMonths == true) ? "%" : "";

    var extras = "";
    if (period == 0) {
	    period = 'D';
    } else if ((period == 5) || (period == 15) || (period == 30) || (period == 60)) {
	    extras = '&varminutes=' + period;
	    period = 'V';
    } else {
	    period = period;
    }
    bartype = ((bartype == 0) ? 'BAR' : bartype);
    bardensity = ((bardensity == 0) ? 'LOW' : bardensity);
    if (study == 0) {
    	study = 0;
    } else {
    	extras += '&study=' + study;
    }
	if (study0 == 0) {
    	study0 = 0;
    } else {
    	extras += '&study0=' + study0;
    }
    if (study1 == 0) {
    	study1 = 0;
    } else {
    	extras += '&study1=' + study1;
    }
    if (study2 == 0) {
    	study2 = 0;
    } else {
    	extras += '&study2=' + study2;
    }
    if (study3 == 0) {
    	study3 = 0;
    } else {
    	extras += '&study3=' + study3;
    }
	var myEsignalChart = new cmeEsignalChart('http://charts.marketcenter.com/cis/cbotcis', chartCodePrefix + myChartCode + ' ' + myChartMonth + (myChartVenue == 0 ? '' : '=' +  myChartVenue) + myChartExchangeCodeSuffix,period,bartype,bardensity,'true','255,255,255','0,0,0','0,0,0',myChartSize,study);
	var chartSRCBuilder = myEsignalChart.chartSrc + '?cont=' + extendedEncodeURIComponent(myEsignalChart.chartCont) + '&period=' + extendedEncodeURIComponent(myEsignalChart.period) + '&bartype=' + extendedEncodeURIComponent(myEsignalChart.barType) + '&bardensity=' + extendedEncodeURIComponent(myEsignalChart.barDensity) +'&showextendednames=' + extendedEncodeURIComponent(myEsignalChart.showExtendedNames) + '&headerbackground=' + extendedEncodeURIComponent(myEsignalChart.headerBackground) + '&headerforeground=' + extendedEncodeURIComponent(myEsignalChart.headerForeground) + '&headerdatacolor=' + extendedEncodeURIComponent(myEsignalChart.headerDataColor) + '&size=' + extendedEncodeURIComponent(myEsignalChart.chartSize) + encodeURI(extras);
	myEsignalChart.chartSrc = chartSRCBuilder;
	target.attr('src',myEsignalChart.chartSrc);
}



function esignal_getChartForm(chartURL, target, chartCodes) {
	var qs = getQueryStrings(chartURL);
	var myChartCode = qs["code"];
	var myChartTitle = qs["title"];
    var myChartType = ((qs["type"] = 'p') ? 'p' : 'v');
    var myChartVenue = parseInt(qs["venue"]);
    var myChartExchangeCode = qs["exchangeCode"];
    var myChartMonth = qs["monthYear"];
	var myFormString;
	myFormString = '<form class="cmeGeneratedForm" action="" method="get">';
	myFormString += '<fieldset class="cmeFormFields">';
	myFormString += '<ol>';
	if (chartCodes) {
		myFormString += '<li><label for="symbol" class="cmeLabel">Contract:</label><select id="symbol"><option value="0">Please select..</option>';
		for(var i = 0; i < chartCodes.length; i++) {
			myFormString += '<option value="' + i + '"';
			var chartCode = chartCodes[i];
			if (chartCode.code === myChartCode) {
				if (chartCode.venueCode === myChartVenue && chartCode.exchangeCode === myChartExchangeCode) {
					myFormString += ' selected="selected"';
				}
			}
			myFormString += '>' + chartCodes[i].name + '</option>';
		}
		myFormString += '</select></li></ol>';
		myFormString += '</fieldset>';
		myFormString += '<fieldset class="cmeFormFields">';
		myFormString += '<ol>';
	}
	myFormString += '<li class="cmePriceChartSubSection"><label for="study" class="cmeLabel">Study:</label><select id="study">'
	myFormString +=	'<option value="0">NONE</option><option value="AD">Accum Dist Index</option><option value="BOLL">Bollinger Bands (20,200)</option><option value="CCI">Comm Channel Index (20)</option><option value="DMA">Displaced Mov Avg (4,9,18,14)</option><option value="DMI">Dir Mvmnt Index (14,1,1,1)</option><option value="EMA">Exp Moving Avg (4,9,18)</option><option value="ENV">Envelope (10,50,0)</option><option value="HILOW">Highest High/Lowest Low (20,1)</option><option value="HLMA">High/Low Moving Avg (10,8)</option><option value="HV">Hist Volatility (20)</option><option value="LIN">Lst Squares Lin Regr (10)</option><option value="LOSC">Line Oscillator (6,21,6)</option><option value="MA">Moving Average (4,9,18)</option><option value="MACD">Moving Avg Conv/Div Osc (12,26,9)</option><option value="MOM">Momentum Oscillator (20)</option><option value="MSTD">Moving Std Deviation (20)</option><option value="OSC">Oscillator (5,10)</option><option value="PARAB">Parabolic Time/Price (20,20,200)</option><option value="PR">Percent R (10)</option><option value="ROC">Rate Of Change Osc (10)</option><option value="RSI">Wilder&rsquo;s RSI (14)</option><option value="SSTO">Slow Stochastic (14,3,3,3)</option><option value="STO">Fast Stochastic (14,3)</option><option value="TVOL">Tick Volume</option><option value="VMA">Variable Moving Avg (5,10,20)</option><option value="VOI">Volume &amp; Open Int (1,1)</option><option value="WTCL">Weighted Close</option></select></li>';
	myFormString += '<li class="cmePriceChartSubSection"><span class="cmeLabel">Study Parameters:</span>';
	myFormString += '<ol class="cmeFormGroup">';
	myFormString += '<li><label for="study0" class="cmeLabel">Study0</label><input type="text" id="study0" max-length="10" /></li>';
	myFormString += '<li><label for="study1" class="cmeLabel">Study1</label><input type="text" id="study1" max-length="10" /></li>';
	myFormString += '<li><label for="study2" class="cmeLabel">Study2</label><input type="text" id="study2" max-length="10" /></li>';
	myFormString += '<li><label for="study3" class="cmeLabel">Study3</label><input type="text" id="study3" max-length="10" /></li>';
	myFormString += '</ol>';
	myFormString += '</li>';
	myFormString += '</ol>';
	myFormString += '</fieldset>';
	myFormString += '<fieldset class="cmeFormFields">';
	myFormString += '<ol>';
	myFormString += '<li><label for="period" class="cmeLabel">Period:</label><select id="period">'
	myFormString += '<option value="5">5 minutes</option><option value="15">15 minutes</option><option value="30">30 minutes</option><option value="60">60 minutes</option><option value="D" selected="true">Daily</option><option value="W">Weekly</option><option value="M">Monthly</option><option value="V">Intraday</option><option value="T">Tick</option></select></li>';
	myFormString += '<li><label for="bartype" class="cmeLabel">Style:</label><select id="bartype"><option value="AREA">Area</option><option value="BAR" selected="true">Bar</option><option value="CANDLE">Candle</option><option value="LINE">Line</option></select></li>';
	myFormString += '<li><label for="bardensity" class="cmeLabel">Density:</label><select id="bardensity"><option value="LOW" selected="true">Low</option><option value="MEDIUM">Medium</option><option value="HIGH">High</option></select></li>';
	myFormString += '</ol>';
	myFormString += '</fieldset>';

	/* IF THE CHART FORM IS BEING RENDERED IN THE POPUP RATHER THAN THE EXPANDED ROW */
	if (chartCodes) {
		myFormString += '<fieldset class="cmeFormFields">';
		myFormString += '<ol>';
		myFormString += '<li><label for="month" class="cmeLabel">Month:</label><select id="month">';
		myFormString += '<option value="00">All</option><option value="1!" selected="selected">Nearby</option><option value="2!">Nearby+1</option><option value="J">Apr</option><option value="K">May</option><option value="M">Jun</option><option value="N">Jul</option><option value="Q">Aug</option><option value="U">Sep</option><option value="V">Oct</option><option value="X">Nov</option><option value="Z">Dec</option><option value="F">Jan</option><option value="G">Feb</option><option value="H">Mar</option></select></li>';
		myFormString += '<li><label for="year" class="cmeLabel">Year:</label><select id="year">';

		var myYearList = new Array(), myCurrentYear, myYearLowestBound, myYearUpperBound, myYearLoopCounter = 0;
		myCurrentYear = new Date().getFullYear();
		myYearLowestBound = myCurrentYear - 5;
		myYearUpperBound = myCurrentYear + 5;

		for(var x = myYearLowestBound; x <= myYearUpperBound; x++) {
			myYearList[myYearLoopCounter] = new Array(2);
			myYearList[myYearLoopCounter][0] = x;
			myYearList [myYearLoopCounter][1] = x.toString()[3];
			myYearLoopCounter++;
		}

		myYearLoopCounter = 0;
		for(var y = myYearLowestBound; y <= myYearUpperBound; y++) {
			if (myYearList[myYearLoopCounter][0] === myCurrentYear){
				myFormString += '<option value="' + myYearList[myYearLoopCounter][1] + '" selected="selected">' + myYearList[myYearLoopCounter][0] + '</option>';
			} else {
				myFormString += '<option value="' + myYearList[myYearLoopCounter][1] + '">' + myYearList[myYearLoopCounter][0] + '</option>';
			}
			myYearLoopCounter++;
		}
		myFormString += '</select></li>';
		myFormString += '</ol>';
		myFormString += '</fieldset>';
	}
	myFormString += '<fieldset class="cmeFormControls">';
	myFormString += '<input type="hidden" id="chartURL" value="' + chartURL + '" />';
	myFormString += '<ul class="cmeContentSection cmeContentGroup"><li class="cmeContentColumn cmeFloatRight cmeTextRight cmeClearContent">';
	if (!chartCodes) {
		myFormString += '<div class="cmeFormControl"><a class="cmeButton cmeButtonSecondary" href="/apps/cmegroup/widgets/productLibs/esignal-charts.html?code=' + extendedEncodeURIComponent(myChartCode) + '&monthYear=' + extendedEncodeURIComponent(myChartMonth) + '&venue=' + extendedEncodeURIComponent(myChartVenue) + '&title=' + extendedEncodeURIComponent(myChartTitle) + '&type=' + extendedEncodeURIComponent(myChartType) +'&exchangeCode=' + extendedEncodeURIComponent(myChartExchangeCode) +'" rel="chartPopup nofollow" title="' + myChartTitle + '">Launch in pop-up</a></div>';
	}
	myFormString += '<div class="cmeFormControl"><input type="button" value="Update chart" class="cmeButton cmeButtonPrimary cmeEsignalChartButton" /></div>';
	myFormString += '</li></ul>';
	myFormString += '</fieldset>';
	myFormString += '</form>';
	target.html(myFormString);
}
function tradingview_initcmePageWrapper() {
	$j('body').on('click touchstart', '.cmeEsignalChartButton', function(){
		var myChartComponent = $j(this).closest('.cmeChartComponent');
		var myChartWidth = myChartComponent.width();
		var $jtarget = $j(this).closest('.cmeActiveChartCell').find('.cmeDynamicChart');
		var myChartUrl = $j('#chartURL', myChartComponent).val();
		var symbol = -1;
		var myMonth, myYear, showAllMonths = false;
		if ($j('#symbol', myChartComponent).length){
			symbol = (($j('#symbol', myChartComponent).val() !== '0') ? $j('#symbol', myChartComponent).val() : 0);
		}
		if (symbol != -1) {
			symbol = chartCodes[symbol];
		}
	
		if($j("#month", myChartComponent).length !== 0) {
			myMonth = (($j('#month', myChartComponent).val() !== '0') ? $j('#month', myChartComponent).val() : 0);
			if (myMonth === "00") {
				myMonth = "1!";
				myYear = "";
				showAllMonths = true;
			} else if (myMonth === "1!"){
				myYear = "";
			} else if (myMonth === "2!"){
				myYear = "";
			} else {
				myYear = (($j('#year', myChartComponent).val() !== '0') ? $j('#year', myChartComponent).val() : 0);
			}
			myChartUrl = changeURLParameter(myChartUrl, "monthYear", myMonth+myYear);
		}
		var period = (($j('#period', myChartComponent).val() !== '0') ? $j('#period', myChartComponent).val() : 0);
		var bartype = (($j('#bartype', myChartComponent).val() !== '0') ? $j('#bartype', myChartComponent).val() : 0);
		var bardensity = (($j('#bardensity', myChartComponent).val() !== '0') ? $j('#bardensity', myChartComponent).val() : 0);
		var study = (($j('#study', myChartComponent).val() !== '0') ? $j('#study', myChartComponent).val() : 0);
		var study0 = (($j('#study0', myChartComponent).val() !== '0') ? $j('#study0', myChartComponent).val() : 0);
		var study1 = (($j('#study1', myChartComponent).val() !== '0') ? $j('#study1', myChartComponent).val() : 0);
		var study2 = (($j('#study2', myChartComponent).val() !== '0') ? $j('#study2', myChartComponent).val() : 0);
		var study3 = (($j('#study3', myChartComponent).val() !== '0') ? $j('#study3', myChartComponent).val() : 0);
		esignal_updateChart(myChartUrl,symbol,period,bartype,bardensity,study,study0,study1,study2,study3,$jtarget,myChartWidth,showAllMonths);
	});
}



/* ADDING PRICE-CHART FUNCTIONALITY */
function tradingview_addPriceChart(myLink){
	if (cmeProductChart.chartAction === "paint"){
		if (myLink.attr('href').indexOf("?") !== -1) {
			if (myLink.hasClass('cmeActiveButton')) {
				myLink.removeClass('cmeActiveButton');
				myLink.closest('tr').next('tr').find('.cmeChartCloseButton').trigger('tap');
			} else {
				myLink.addClass('cmeActiveButton');
				$jchartURL = sanitiseURL(myLink.attr('href'));
				$jcurrentRow = myLink.closest('tr');
				cmeProductChart.chartLink = ((isURIEncoded(myLink.attr('href')) === false) ? sanitiseURL(myLink.attr('href')) : myLink.attr('href'));
				cmeProductChart.chartRow = myLink.closest('tr');
				var myCount = 0;
				$j(' > * ', $jcurrentRow).each(function () {
					if ($j(this).attr('colspan')) {
						myCount += +$j(this).attr('colspan');
					} else {
						myCount++;
					}
				});
				$jnewRow = $j('<tr class="cmeActiveChartRow cmeDynamicComponent"></tr>');
				$jnewRow.html('<td class="cmeActiveChartCell" colspan="' + myCount + '"></td>');
				$jnewRow.find('td').html('<div class="cmeChartComponent"><div class="cmeChartContainer cmeInlineChartLayout"></div><div class="cmeContentBox cmeFormComponent cmeChartParameters"></div></div>');
				$jcurrentRow.after($jnewRow);				
				cmeProductChart.chartComponentElement = $j('.cmeChartComponent', $jnewRow);
				cmeProductChart.chartRowWidth = $jnewRow.find('td').width();
				cmeProductChart.chartNewRowElement = $jnewRow;				
				$j('.cmeChartComponent', $jnewRow).hide(0, function() {
					insertChart();
				}).slideDown('slow');	
			}
		}	
	} else {
		cmeProductChart.widgetCreatingStarted = false;
		cmeProductChart.chartAction = "repaint";
		cmeProductChart.chartLink = ((isURIEncoded(myLink.attr('href')) === false) ? sanitiseURL(myLink.attr('href')) : myLink.attr('href'));
		cmeProductChart.chartRow = myLink.closest('tr');
		cmeProductChart.chartRowWidth = cmeProductChart.chartComponentElement.closest("td").width();
		cmeProductChart.chartIsInline = (cmeProductChart.chartIsInline === true) ? true : false;
		insertChart();
	}
}

function insertChart(){
	tradingview_determineChartParameters(cmeProductChart.chartLink, cmeProductChart.chartRowWidth, cmeProductChart.chartIsInline);
	// IF THE PRODUCT CODE IS IN THE TEST-ARRAY AND ISN'T A DATA WIDGET, THIS IS A TV CHART
	if (cmeProductChart.chartVendor === "TradingView") {
		// IF THE BROWSER HAS THE ABILITY, AND THE USER WANTS A DYNAMIC CHART
		if(isScriptLoaded("https://s3.tradingview.com/tv.js") === false){
			$j.ajax({
				url: "https://s3.tradingview.com/tv.js",
				dataType: 'script',
				success: function(){
					if (location.host !== 'www.cmegroup.com') {
						cmeProductChart.widgetHost = (document.location.protocol || 'http:') + '//' + location.host;
					}
					cmeProductChart.createTradingViewWidget();
				},
				error: function(XMLHttpRequest, textStatus, errorThrown){
					console.log("Status: " + textStatus + " Error: " + errorThrown);
				},
				async: false,
				cache: true
			});
		} else {
			if (location.host !== 'www.cmegroup.com') {
				cmeProductChart.widgetHost = (document.location.protocol || 'http:') + '//' + location.host;
			}
			cmeProductChart.createTradingViewWidget();
		}
	} else {
		// OTHERWISE THIS IS AN ESIGNAL CHART
		cmeProductChart.chartVendor === "eSignal";
		esignal_getChart($jchartURL, $j('.cmeChartContainer', $jnewRow), $jnewRow.find('td').width(), true);
		esignal_getChartForm($jchartURL, $j('.cmeChartParameters', $jnewRow));
	}
}

function tradingview_initChartWindow() {
	cmeProductChart.chartIsInline = false;
	cmeProductChart.chartLink = ((isURIEncoded(window.location.href) === false) ? sanitiseURL(window.location.href) : window.location.href);

	tradingview_determineChartParameters(cmeProductChart.chartLink, $j(window).width(), cmeProductChart.chartIsInline);	
	// IF THE PRODUCT CODE IS IN THE TEST-ARRAY AND ISN'T A DATA WIDGET, THIS IS A TV CHART
	if (cmeProductChart.chartVendor === "TradingView") {
		// IF THE BROWSER HAS THE ABILITY, AND THE USER WANTS A DYNAMIC CHART
		$j.ajax({
			url: "https://s3.tradingview.com/tv.js",
			dataType: 'script',
			success: function(){
				if (location.host !== 'www.cmegroup.com') {
					cmeProductChart.widgetHost = (document.location.protocol || 'http:') + '//' + location.host;
				}
				cmeProductChart.isInline = false
				cmeProductChart.createTradingViewWidget();
			},
			error: function(XMLHttpRequest, textStatus, errorThrown){
				console.log("Status: " + textStatus + " Error: " + errorThrown);
			},
			async: false,
			cache: true
		});
	} else {
		// OTHERWISE THIS IS AN ESIGNAL CHART
		cmeProductChart.chartVendor === "eSignal";
		var myURL = ((isURIEncoded(window.location.href) === false) ? sanitiseURL(window.location.href) : window.location.href);
		esignal_getChart(myURL, $j('.cmeChartContainer'), $j(window).width(), false);
		esignal_getChartForm(myURL, $j('.cmeChartParameters'), chartCodes);
	}
}

/* NEW TRADINGVIEW CHART */
cmeProductChart.createTradingViewWidget = function() {
	if (cmeProductChart.widgetCreatingStarted) { return; }		
	function getTradingViewWindowWidth(){
		if(cmeProductChart.chartIsInline === true){
			return cmeProductChart.chartInlineWidth;
		} else {
			if ($j('.cmeChartContainer').innerWidth() > $j(window).innerWidth()){
				return $j(window).innerWidth();
			} else {
				return $j('.cmeChartContainer').innerWidth();
			}
		}
	}	
	function getTradingViewWindowHeight(){
		if(cmeProductChart.chartIsInline === true){
			return cmeProductChart.chartInlineHeight;
		} else {
			return $j(window).innerHeight()-($j('.cmeChartParameters').outerHeight(true)+10);
		}
	}	
	function setTradingViewWidgetContainerHeight() {
		if (cmeProductChart.chartIsInline === false){
			tradingViewWidgetIframeContainer.style.height = getTradingViewWindowHeight() + "px";
			tradingview_widget_options.height = getTradingViewWindowHeight();
			tradingViewWidgetIframeContainer.style.width = getTradingViewWindowWidth() + "px";
			tradingview_widget_options.width = getTradingViewWindowWidth();
		} else {			
			tradingview_widget_options.height = cmeProductChart.chartInlineHeight;
			$j('#'+tradingview_widget_options.container_id).height(tradingview_widget_options.height);
			tradingview_widget_options.width = cmeProductChart.chartInlineWidth
			tradingViewWidgetIframeContainer.style.width = cmeProductChart.chartInlineWidth + 'px';
		}
		cmeProductChart.chartSize = tradingview_widget_options.width + 'X' + tradingview_widget_options.height;
	}
	cmeProductChart.widgetCreatingStarted = true;			
	var tradingview_widget_options = {};			
	if (cmeProductChart.widgetHost) {
		tradingview_widget_options.host = cmeProductChart.widgetHost;	
	}		
	tradingview_widget_options.symbol = cmeProductChart.chartSymbol;
	tradingview_widget_options.symbology = cmeProductChart.symbology;
	tradingview_widget_options.venue = cmeProductChart.chartVenue;
	tradingview_widget_options.interval = 'D' ||  '1';
	tradingview_widget_options.toolbar_bg = 'E4E8EB';
	tradingview_widget_options.style = '0';
	
	if (cmeProductChart.chartIsInline === true) {
		tradingview_widget_options.autosize = false;
		tradingview_widget_options.cme = true;
		tradingview_widget_options.hide_side_toolbar = false;
		tradingview_widget_options.allow_symbol_change = false;
		tradingview_widget_options.hide_top_toolbar = false;
	} else {
		if ( ($j('html').hasClass('cme-display-small')) || ($j('html').hasClass('cme-display-xSmall')) ) {
			tradingview_widget_options.hide_side_toolbar = true;
		} else {
			tradingview_widget_options.hide_side_toolbar = false;
		}
		tradingview_widget_options.allow_symbol_change = true;
		tradingview_widget_options.hide_top_toolbar = false;
		tradingview_widget_options.cme = true;
		tradingview_widget_options.autosize = true;
	}
	
	if (cmeProductChart.chartAction === "repaint"){
		cmeProductChart.chartFrameElement = document.getElementById(cmeProductChart.chartFrameTarget);
		$j(cmeProductChart.chartFrameElement).empty();
		tradingview_widget_options.container_id = encodeURI(cmeProductChart.chartFrameTarget);
	} else {			
		cmeProductChart.chartDisplayArea = $j("<div id='" + cmeProductChart.chartFrameTarget +"' class='cmeTradingViewChart'/>");
		cmeProductChart.chartContainerElement = $j('.cmeChartContainer', cmeProductChart.chartComponentElement);
		cmeProductChart.chartContainerElement.append(cmeProductChart.chartDisplayArea);
		cmeProductChart.chartFrameElement = document.getElementById(cmeProductChart.chartFrameTarget);
		tradingview_widget_options.container_id = encodeURI(cmeProductChart.chartFrameTarget);
	}
	
	if ((cmeProductChart.chartIsInline === true) && (cmeProductChart.chartAction !== "repaint")) {
		cmeProductChart.chartComponentElement.append('<div><a href="#" class="cmeButton cmeButtonPrimary cmeCloseButton cmeChartCloseButton"><span>Close</span></a></div>');
		$j(cmeProductChart.chartFrameElement).parents('.cmeChartContainer').siblings(".cmeChartParameters")
			.append('<fieldset class="cmeFormControls">' +
				'<div class="cmeContentColumn span_2_of_7 cmeFloatRight cmeTextRight cmeClearContent">' +
					'<div class="cmeFormControl">' +
						'<a class="cmeButton cmeButtonSecondary" href="' + cmeProductChart.chartLink + '" rel="chartPopup nofollow" title="' + cmeProductChart.chartTitle + '">Launch in pop-up</a>' +
					'</div>' +
				'</div>' +
			'</fieldset>');
	}
	
	var tradingViewWidgetIframeContainer = document.getElementById(cmeProductChart.chartFrameTarget);
	setTradingViewWidgetContainerHeight();
	
	$j(window).on('resize', function(){
		setTradingViewWidgetContainerHeight();
	});
			
	new TradingView.widget(tradingview_widget_options);
};

function tradingview_determineChartParameters(chartURL, myWidth, isInline) {
	tradingViewSiteWide = ((typeof tradingViewSiteWide !== 'undefined') ? tradingViewSiteWide : false);
	var cmeTestProducts = ["ES","CL","GC","6A","SI","ZC","NG","GE","NQ","6E","AD","C","ED","EC"];
	var qs = getQueryStrings(chartURL);
	var mapping = {};
	
	// POPULATING CHART PROPERTIES ON THE GLOBAL PRODUCTCHART OBJECT
	cmeProductChart.chartDefaultWidth = 716;
	cmeProductChart.chartDefaultHeight = 600;
	cmeProductChart.chartRoot = qs["code"];
	cmeProductChart.chartTitle = qs["title"];
	cmeProductChart.chartType = ((qs["type"] = 'p') ? 'p' : 'v');
	cmeProductChart.chartVenue = qs["venue"];
	cmeProductChart.chartTVVenue = ((qs["venue"] === "2") ? "floor" : "globex");
	cmeProductChart.chartMonth = qs["monthYear"];
	cmeProductChart.chartYear = qs["year"];
	cmeProductChart.chartExchangeCode = qs["exchangeCode"];
	cmeProductChart.isDataWidget = qs["dataWidget"];
	cmeProductChart.chartInlineWidth = Math.round(myWidth);
	cmeProductChart.chartInlineHeight = Math.round(cmeProductChart.chartDefaultHeight  / cmeProductChart.chartDefaultWidth * myWidth); //original height / original width x new width = new height :: 600 / 716 X current width	
	cmeProductChart.chartIsInline = isInline;
	
	if (tradingViewSiteWide === false){
		// IF NOT USING IDC THEN THE SYMBOL MUST BE IN THE TEST ARRAY AND NOT A COMPOSITE
		// IN EITHER CASE BUG OUT TO ESIGNAL
		if ($j.inArray(cmeProductChart.chartRoot,cmeTestProducts) === -1){		
			return;
		} else {
			if ((cmeProductChart.chartRoot === "ES" && cmeProductChart.chartTVVenue === "floor") || (cmeProductChart.chartRoot === "NQ" && cmeProductChart.chartTVVenue === "floor") 	||	(cmeProductChart.chartRoot === "GC" && cmeProductChart.chartTVVenue === "floor")	||	(cmeProductChart.chartRoot === "SI" && cmeProductChart.chartTVVenue === "floor") 	||	(cmeProductChart.chartRoot === "CL" && cmeProductChart.chartTVVenue === "floor") ||	(cmeProductChart.chartRoot === "NG" && cmeProductChart.chartTVVenue === "floor")) {				
				return;
			}
		}
		mapping["XCBT"] = "CBOT";
		mapping["XNYM"] = "NYMEX";
		mapping["XCME"] = "CME";
		mapping["XCEC"] = "COMEX";
		cmeProductChart.symbology = "cme";
	} else {
		// IF USING IDC AND AN EMINI SYMBOL
		if (cmeProductChart.chartRoot === "ES"){
			mapping["XCBT"] = "CBOT";
			mapping["XNYM"] = "NYMEX";
			mapping["XCME"] = "CME";
			mapping["XCEC"] = "COMEX";
			mapping["CMED"] = "CMEEUR";
		} else {
			mapping["XCBT"] = "CBOT_GBX";
			mapping["XNYM"] = "NYMEX_GBX";
			mapping["XCME"] = "CME_GBX";
			mapping["XCEC"] = "COMEX_GBX";
			mapping["CMED"] = "CMEEUR";
		}
		cmeProductChart.symbology = "";
	}
	
	try {
		cmeProductChart.chartVendor = "TradingView";
		cmeProductChart.tvProduct = true;
		cmeProductChart.chartMonthCode = cmeProductChart.chartMonth.charAt(0);
		cmeProductChart.chartMonthCodeYear = cmeProductChart.chartMonth.substr(0,1) + cmeProductChart.chartYear;			
		cmeProductChart.chartExchangeCode = mapping[cmeProductChart.chartExchangeCode];
		if (cmeProductChart.symbology !== "cme") {
			cmeProductChart.chartSymbol = cmeProductChart.chartExchangeCode+":"+cmeProductChart.chartRoot+cmeProductChart.chartMonthCodeYear;	
		} else {
			cmeProductChart.chartSymbol = cmeProductChart.chartRoot+cmeProductChart.chartMonthCodeYear;
		}
		if (cmeProductChart.chartIsInline === true){
			cmeProductChart.widgetCreatingStarted = false;
		}
		cmeProductChart.chartFrameTarget = makeDOMFriendly("tv_iframe_widget_container_"+ qs["title"]);
	} catch(err) {
		cmeProductChart.chartVendor = "";
		cmeProductChart.tvProduct = false;
		console.log("Error during chart generation:" + err.message);
	}
}

