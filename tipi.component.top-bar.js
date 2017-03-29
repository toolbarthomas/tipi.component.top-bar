(function(win, doc, $) {
	var data = {
		classes : {
			top_bar : 'top-bar',
			push_fallback : 'top-bar-push-fallback',
			trigger_fallback : 'top-bar-trigger-fallback'
		},
		states : {
			ready : '__top-bar--ready',
			small : '__top-bar--small',
			hidden : '__top-bar--hidden',
			peek : '__top-bar--peek',
			reset : '__top-bar--reset',
			upwards : '__top-bar-upwards'
		},
		attributes : {
			position : 'top-bar-position',
			original_height : 'top-bar-original-height'
		},
		elements : {}
	};

	/**
	 * TopBar - Javascript function written with jQuery for creating a sticky top-bar
	 * @param {[object]} push_element [Accepts any jQuery object to define a custom push_element (usefull if you need the height in multiple places)]
	 * @param {[object]} trigger_element [Accepts any jQuery object to define a custom trigger_element position (usefull if you wan't to override the default trigger position)]
	 */

	window.setTopBar = function(push_element, trigger_element)
	{
		var top_bar = $('.' + data.classes.top_bar).not('.' + data.states.ready);

		if(top_bar.length === 0)
		{
			return;
		}

		//Add top_bar element to the data collection
		data.elements['top_bar'] = top_bar;

		//Define the top bar push
		var top_bar_push = defineTopBarPush(data, push_element);
		//Add push element to the data collection
		data.elements['push'] = top_bar_push;

		//Define the top bar trigger
		var top_bar_trigger = defineTopBarTrigger(data, trigger_element);
		//Add trigger element to the data collection
		data.elements['trigger'] = top_bar_trigger;

		//Define the events we need to use so they can be shared by other scripts
		$(document).on({
			'tipi.topBar.resize' : function(event) {
				resizeTopBarPush(data);
			},
			'tipi.topBar.toggle' : function(event)  {
				toggleTopBar(data);
			}
		});

		//Define our resize event so we can update the push and trigger
		//Define our document width so we only have to update if our document width changes
		var resize;
		var document_width = $(document).width();
		$(window).on({
			'resize' : function() {
				clearTimeout(resize);
				resize = setTimeout(function() {
					if(document_width != $(document).width()) {
						topBar.trigger('tipi.topBar.resize', [250]);
						topBar.trigger('tipi.topBar.toggle');
					}

					document_width = $(document).width();
				}, 250);
			},
			'scroll' : function() {
				$(document).trigger('tipi.topBar.toggle');
			}
		});

		//Define our ready class so we can add styling within the top_bar
		top_bar.addClass(data.states.ready);

		//Define our ready class so we can add styling to the page outside the top_bar
		$('html').addClass(data.states.ready);

				//Set the default position to 0 since our document will be loaded
				// top_bar.data(topBarDataAttributes.position, $(window).scroll);

		top_bar.trigger('tipi.topBar.resize', [0]);
		top_bar.trigger('tipi.topBar.toggle');
	}

	function defineTopBarPush(data, push_element)
	{
		//Check if the push fallback has been defined or create one directly after the top bar.
		var top_bar_push_fallback = $('.' + data.classes.push_fallback);
		if(top_bar_push_fallback.length === 0)
		{
			data.elements.top_bar.after('<div class="' + data.classes.push_fallback + '"></div>');
			top_bar_push_fallback = $('.' + data.classes.push_fallback);
		}

		//Define the push element with our push fallback as default selector
		var top_bar_push = top_bar_push_fallback;

		//Override the push if we have defined a push_element
		if(typeof push_element !== 'undefined')
		{
			if(push_element.length > 0)
			{
				top_bar_push = push_element;
			}
		}

		return top_bar_push;
	}

	function defineTopBarTrigger(data, trigger_element)
	{
		//Check if the trigger fallback has been defined or create one directly after the top bar.
		var top_bar_trigger_fallback = $('.' + data.classes.trigger_fallback);
		if(top_bar_trigger_fallback.length === 0)
		{
			data.elements.push.after('<div class="' + data.classes.trigger_fallback + '"></div>');
			top_bar_trigger_fallback = $('.' + data.classes.trigger_fallback);
		}

		//Define the push element with our push fallback as default selector
		var top_bar_trigger = top_bar_trigger_fallback;

		//Override the push if we have defined a push_element
		if(typeof trigger_element !== 'undefined')
		{
			if(trigger_element.length > 0)
			{
				top_bar_trigger = trigger_element;
			}
		}

		return top_bar_trigger;
	}

	function resizeTopBarPush(data)
	{
		var html = $('html');

		//Set our reset class so the height will be set without a css transition to prevent wrong calculations
		data.elements.top_bar.addClass(data.states.reset);
		html.addClass(data.states.reset);

		//Remove our small class so we can define the current height without class modifications
		data.elements.top_bar.removeClass(data.states.small);
		html.removeClass(data.states.small);

		//Define the original height and cache it so we can use it later
		var top_bar_height = data.elements.top_bar.outerHeight();
		data.elements.top_bar.data(data.attributes.original_height, top_bar_height);

		//Set our height value as an empty string if our height is 0
		if(top_bar_height <= 0)
		{
			top_bar_height = '';
		}

		//Update our push height
		data.elements.push.css({
			'height' : top_bar_height
		});

		//Remove our reset classes
		data.elements.top_bar.removeClass(data.states.reset);
		html.removeClass(data.states.reset);
	}

	function toggleTopBar(data)
	{
		var html = $('html');
		var scroll_top = Math.ceil($(window).scrollTop());
		var trigger = Math.ceil(data.elements.trigger.position().top);

		//Get our previous position that has been set on our previous scroll
		var previous_position = parseInt(Math.ceil(data.elements.top_bar.data(data.attributes.position)));

		//Set our current position by updating the data attribute
		data.elements.top_bar.data(data.attributes.position, $(window).scrollTop());

		//When the scrollTop of the Window is higher than the position + height of the top bar then we can we make it smaller.
		if(scroll_top >= trigger)
		{
			data.elements.top_bar.addClass(data.states.small);
			html.addClass(data.states.small);
		}
		else
		{
			data.elements.top_bar.removeClass(data.states.small);
			html.removeClass(data.states.small);
		}

		//Hide our top_bar if our scrollTop 2 times higher than our trigger
		if(scroll_top >= (trigger + data.elements.top_bar.outerHeight()))
		{
			if(false === data.elements.top_bar.hasClass(data.states.upwards))
			{
				data.elements.top_bar.addClass(data.states.hidden);
				html.addClass(data.states.hidden);
			}
		}
		else
		{
			data.elements.top_bar.removeClass(data.states.hidden);
			html.removeClass(data.states.hidden);
		}

		//Set the peek state on the top-bar when the user scrolls upwards
		if(scroll_top < previous_position)
		{
			data.elements.top_bar.addClass(data.states.peek);
			data.elements.top_bar.addClass(data.states.upwards);

			html.addClass(data.states.peek);
			html.addClass(data.states.upwards);
		}
		else
		{
			data.elements.top_bar.removeClass(data.states.peek);
			data.elements.top_bar.removeClass(data.states.upwards);

			html.removeClass(data.states.peek);
			html.removeClass(data.states.upwards);
		}

		//Reset the top bar when we've reached the top of the document
		if(scroll_top <= 0)
		{
			data.elements.top_bar.data(data.attributes.position, 0).removeClass(data.states.upwards);
		}
	}

})( window.jQuery(window), window.jQuery(document), window.jQuery);