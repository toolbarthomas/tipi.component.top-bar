function setTopBar(pushElement, smallElement) {
	var topBarStates = {
		ready 	: '__top-bar--ready',
		small 	: '__top-bar--small',
		hidden 	: '__top-bar--hidden',
		peek 	: '__top-bar--peek',
		reset 	: '__top-bar--reset',
		upwards : '__top-bar-upwards'
	};

	var topBarDataAttributes = {
		position 		: 'top-bar-position',
		originalHeight	: 'top-bar-original-height'
	};

	var topBar = $('.top-bar').not('.' + topBarStates.ready);
	if(topBar.length > 0 ) {
		//Define the push location for the topBar so it won't overlap other elements by default.
		topBar.after('<div class="top-bar-push-fallback"></div>');
		var topBarPushElement = $('.top-bar-push-fallback'); //By default we use the fallback so we always have a pushing element.
		if(typeof pushElement !== 'undefined') {
			if(pushElement.length > 0 ) {
				topBarPushElement = pushElement;
			}
		}

		//Define the element we need for setting the small state
		var topBarSmallElement = topBar;
		if(typeof smallElement != 'undefined') {
			if(smallElement.length > 0) {
				topBarSmallElement = smallElement;
			}
		}

		//Bind the custom events on the top bar so we trigger it with other functions
		topBar.on({
			'tipi.topBar.TOGGLE' : function(event)  {
				toggleTopBar(topBar, topBarSmallElement, topBarStates, topBarDataAttributes);
			},
			'tipi.topBar.RESIZE' : function(event) {
				resizeTopBarPush(topBar, topBarPushElement, topBarSmallElement, topBarStates, topBarDataAttributes);

				//Trigger tipi.UPDATE so we can UPDATE OTHER components except this one.
				$(document).trigger('tipi.UPDATE', [false]);
			}
		});

		$(document).on({
			'tipi.UPDATE' : function(event, external) {
				if(typeof external !== undefined) {
					if(external === true) {
						topBar.trigger('tipi.topBar.RESIZE');
					}
				}
			}
		});

		var updateEvent;
		$(window).on({
			resize : function() {
				clearTimeout(updateEvent);
				updateEvent = setTimeout(function() {
					topBar.trigger('tipi.topBar.RESIZE');
					topBar.trigger('tipi.topBar.TOGGLE');
				}, 100);
			},

			scroll : function() {
				topBar.trigger('tipi.topBar.TOGGLE');
			}
		});

		topBar.addClass(topBarStates.ready);
		$('html').addClass(topBarStates.ready);
		topBar.data(topBarDataAttributes.position, 0);

		topBar.trigger('tipi.topBar.RESIZE');
		topBar.trigger('tipi.topBar.TOGGLE');
	}
}

function toggleTopBar(topBar, topBarSmallElement, topBarStates, topBarDataAttributes) {
	var topBarPositionCache = parseInt(topBar.data(topBarDataAttributes.position));

	var theWindow = $(window);

	var theWindow_properties = {
		height : theWindow.height(),
		scrollTop : theWindow.scrollTop()
	};

	topBar.data(topBarDataAttributes.position, theWindow_properties.scrollTop);

	//Set the correct height for the defined element for triggering the small state
	var topBarSmallElementHeight = topBarSmallElement.outerHeight();
	if(typeof topBarSmallElement.data(topBarDataAttributes.originalHeight) != 'undefined') {
		if(parseInt(topBarSmallElement.data(topBarDataAttributes.originalHeight)) != 'NaN') {
			topBarSmallElementHeight = topBarSmallElement.data(topBarDataAttributes.originalHeight);
		}
	}

	//When the scrollTop of the Window is higher than the position + height of the top bar then we can we make it smaller.
	if(theWindow_properties.scrollTop > (topBarSmallElement.position().top + topBarSmallElementHeight)) {
		topBar.addClass(topBarStates.small);
	} else {
		topBar.removeClass(topBarStates.small);
	}

	//When the scrollTop of the Window is beyond the smallElement ofsset times 2
	if(theWindow_properties.scrollTop >= ((topBarSmallElement.position().top + topBarSmallElementHeight) * 2)) {
		if(!topBar.hasClass(topBarStates.upwards)) {
			topBar.addClass(topBarStates.hidden);
		}
	} else {
		topBar.removeClass(topBarStates.hidden);
	}

	//Set the peek state on the top-bar when the user scrolls upwards
	if(theWindow_properties.scrollTop < topBarPositionCache) {
		topBar.addClass(topBarStates.peek + ' ' + topBarStates.upwards);
	} else {
		topBar.removeClass(topBarStates.peek + ' ' + topBarStates.upwards);
	}

	//Reset the top bar when reached the top of the Document
	if(theWindow_properties.scrollTop <= 0) {
		topBar.data(topBarDataAttributes.position, 0).removeClass(topBarStates.upwards);
	}
}

function resizeTopBarPush(topBar, topBarPushElement, topBarSmallElement, topBarStates, topBarDataAttributes) {
	//Reset the height without transitions so we can calculate the original height.
	topBar.addClass(topBarStates.reset);
	topBar.removeClass(topBarStates.small);

	var topBarHeight = topBar.outerHeight();
	topBar.data(topBarDataAttributes.originalHeight, topBarHeight);

	if(topBarHeight <= 0) {
		topBarHeight = '';
	}

	topBarPushElement.stop().animate({
		'height' : topBarHeight
	}, 500, function() {
		topBar.removeClass(topBarStates.reset);
	});
}