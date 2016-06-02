function setTopBar(heightElement, pushElement) {
	var topBarStates = {
		ready 	: '__top-bar--ready',
		small 	: '__top-bar--small',
		hidden 	: '__top-bar--hidden',
		peek 	: '__top-bar--peek'
	};

	var topBarDataAttributes = {
		position : 'top-bar-position'
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
			'tipi.ui.topBar.toggle' : function(event)  {
				toggleTopBar(topBar, topBarStates, topBarDataAttributes);
			},

			'tipi.ui.topBar.resize' : function(event) {
				resizeTopBar(topBarHeightElement, topBarPushElement);
			}
		});

		var updateEvent;
		$(window).on({
			resize : function() {
				clearTimeout(updateEvent);
				updateEvent = setTimeout(function() {
					topBar.trigger('tipi.ui.topBar.resize');
					topBar.trigger('tipi.ui.topBar.toggle');
				}, 100);
			},

			scroll : function() {
				topBar.trigger('tipi.ui.topBar.toggle');
			}
		});

		topBar.addClass(topBarStates.ready);
		$('body').addClass(topBarStates.ready);
		topBar.data(topBarDataAttributes.position, 0);

		topBar.trigger('tipi.ui.topBar.resize');
		topBar.trigger('tipi.ui.topBar.toggle');
	}
}

function toggleTopBar(topBar, topBarStates, topBarDataAttributes) {
	var topBarPositionCache = parseInt(topBar.data(topBarDataAttributes.position));

	var theWindow = $(window);

	var theWindow_properties = {
		height : theWindow.height(),
		scrollTop : theWindow.scrollTop()
	};

	//When the scrollTop of the Window is between the between 50% and 100% of the Window height we make it smaller.
	if(theWindow_properties.scrollTop > theWindow_properties.height / 2 && theWindow_properties.scrollTop <= theWindow_properties.height) {
		topBar.removeClass(topBarStates.hidden).addClass(topBarStates.small);
	}
	//When the scrollTop of the Window is beyond 100% of the Window Height then we hide it
	else if(theWindow_properties.scrollTop > theWindow_properties.height) {
		topBar.removeClass(topBarStates.small).addClass(topBarStates.hidden);
	}
	//Reset the top bar when reached the top of the Document
	else {
		topBar.removeClass(topBarStates.small);
		topBar.removeClass(topBarStates.hidden);
		topBar.removeClass(topBarStates.peek);

		topBar.data(topBarDataAttributes.position, 0);
	}

	topBar.removeClass(topBarStates.peek);

	topBar.data(topBarDataAttributes.position, theWindow_properties.scrollTop);

	//Set the peek state on the top-bar when the user scrolls upwards
	if(theWindow_properties.scrollTop < topBarPositionCache) {
		topBar.addClass(topBarStates.peek);
	}
}

function resizeTopBar(topBarHeightElement, topBarPushElement) {
	var topBarHeight = topBarHeightElement.outerHeight();
	if(topBarHeight <= 0) {
		topBarHeight = '';
	}

	topBarPushElement.css({
		'height' : topBarHeight
	});
}