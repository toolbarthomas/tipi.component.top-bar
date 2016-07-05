function setTopBar(heightElement, pushElement) {
	var topBarStates = {
		ready 	: '__top-bar--ready',
		small 	: '__top-bar--small',
		hidden 	: '__top-bar--hidden',
		peek 	: '__top-bar--peek',
		reset 	: '__top-bar--reset'
	};

	var topBarDataAttributes = {
		position 		: 'top-bar-position',
		originalHeight	: 'top-bar-original-height'
	};

	var topBar = $('.top-bar').not('.' + topBarStates.ready);
	if(topBar.length > 0 ) {
		//Define the element so we can calculate the required height for the topBar.
		var topBarHeightElement = topBar;
		if(typeof heightElement !== 'undefined') {
			if(heightElement.length > 0 ) {
				topBarHeightElement = heightElement;
			}
		}

		//Define the heightElement with an extra class so we trigger it with css.
		topBarHeightElement.addClass('top-bar-height-element');

		//Define the push location for the topBar so it won't overlap other elements by default.
		topBar.after('<div class="top-bar-push-fallback"></div>');
		var topBarPushElement = $('.top-bar-push-fallback'); //By default we use the fallback so we always have a pushing element.
		if(typeof pushElement !== 'undefined') {
			if(pushElement.length > 0 ) {
				topBarPushElement = pushElement;
			}
		}

		//Bind the custom events on the top bar so we trigger it with other functions
		topBar.on({
			'tipi.topBar.TOGGLE' : function(event)  {
				toggleTopBar(topBar, topBarStates, topBarDataAttributes);
			},
			'tipi.topBar.RESIZE' : function(event) {
				resizeTopBarPush(topBar, topBarHeightElement, topBarPushElement, topBarStates, topBarDataAttributes);

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
		$('body').addClass(topBarStates.ready);
		topBar.data(topBarDataAttributes.position, 0);

		topBar.trigger('tipi.topBar.RESIZE');
		topBar.trigger('tipi.topBar.TOGGLE');
	}
}

function toggleTopBar(topBar, topBarStates, topBarDataAttributes) {
	var topBarPositionCache = parseInt(topBar.data(topBarDataAttributes.position));

	var theWindow = $(window);

	var theWindow_properties = {
		height : theWindow.height(),
		scrollTop : theWindow.scrollTop()
	};

	//When the scrollTop of the Window is higher than the position + height of the top bar then we can we make it smaller.
	if(theWindow_properties.scrollTop > (topBar.position().top + topBar.data(topBarDataAttributes.originalHeight))) {
		topBar.addClass(topBarStates.small);
	} else {
		topBar.removeClass(topBarStates.small);
	}

	//When the scrollTop of the Window is beyond 100% of the Window Height then we hide it
	if(theWindow_properties.scrollTop > theWindow_properties.height) {
		topBar.addClass(topBarStates.hidden);
	} else {
		topBar.removeClass(topBarStates.hidden);
	}

	topBar.removeClass(topBarStates.peek);

	topBar.data(topBarDataAttributes.position, theWindow_properties.scrollTop);

	//Set the peek state on the top-bar when the user scrolls upwards
	if(theWindow_properties.scrollTop < topBarPositionCache) {
		topBar.addClass(topBarStates.peek);
	}

	//Reset the top bar when reached the top of the Document
	if(theWindow_properties.scrollTop < (topBar.position().top + topBar.data(topBarDataAttributes.originalHeight))) {
		topBar.data(topBarDataAttributes.position, 0);
	}
}

function resizeTopBarPush(topBar, topBarHeightElement, topBarPushElement, topBarStates, topBarDataAttributes) {
	topBarHeightElement.addClass(topBarStates.reset);
	topBarHeightElement.removeClass(topBarStates.small);

	var topBarHeight = topBarHeightElement.outerHeight();
	topBar.data(topBarDataAttributes.originalHeight, topBarHeight);

	if(topBarHeight <= 0) {
		topBarHeight = '';
	}

	topBarPushElement.stop().animate({
		'height' : topBarHeight
	}, 500, function() {
		topBarHeightElement.removeClass(topBarStates.reset);
	});
}