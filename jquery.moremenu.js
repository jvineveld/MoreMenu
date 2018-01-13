/**
 * More menu v1.2
 * jQuery plugin by Jonas van Ineveld
 *
 * Inserts another menu just after the current menu.
 * This menu will hold all the 'not fitting' menu items
 * It checks the outer width of each item, and theire margins,
 * Then calculates how many will fit keeping in mind the size of the more link,
 *
 * USAGE:
 * jQuery('#menu').moreMenu();  // takes optional argument (Object)options
 *
 * OPTIONS:
 * var options = {
 *     verb: {
 *         more_link: 'More..'
 *     },
 * };
 */
 (function ( $ ) {

	$.fn.moreMenu = function( options ) {
		var $menu = this,
			$moreMenu = null,
			$moreLink = null,
			$classTarget = null,
			moreItemWidth = 0,
			lastMenuWidth = 0;

		this.menu_items = []; // will hold all menu items all times

		var settings = $.extend({
			verb: {
				more_link: '<span>More..</span>'
			},

			// Where should the more menu be placed?
			// Possible to pass a selector or element
			more_menu_location: 'after_menu',

			// on what element should the classes change when user toggles and moremenu is initialized?
			// Possible to pass a selector or element
			class_target: 'more_menu',

			// What type of menu items are we looking for?
			menu_item: '> li',

			// provides a little extra offset
			extra_offset: 0,

			// should we be checking for resizing?
			check_for_resize: false
		}, options );

		function __(verb){
			return settings.verb[verb];
		}

		function calc_item_width($item){
			var width = $($item).outerWidth(true) // with margins

			return width;
		}

		function throttle(fn, threshhold, scope) {
		  threshhold || (threshhold = 250);
		  var last,
		      deferTimer;
		  return function () {
		    var context = scope || this;

		    var now = +new Date,
		        args = arguments;
		    if (last && now < last + threshhold) {
		      // hold on to it
		      clearTimeout(deferTimer);
		      deferTimer = setTimeout(function () {
		        last = now;
		        fn.apply(context, args);
		      }, threshhold);
		    } else {
		      last = now;
		      fn.apply(context, args);
		    }
		  };
		}

		this.refresh_menu_items = function(){
			$menu.menu_items = [];

			$(settings.menu_item, $menu).each(function(){
				if(!$(this).hasClass('more-menu-link'))
					$menu.menu_items.push({
						$el: this,
						width: calc_item_width(this)
					});
			})
		}

		this.move_unfitting_items = function(){
			var menuWidth = $($menu).width(),
				availableWidth = menuWidth - moreItemWidth - settings.extra_offset, // inner width of menu
				indexWidth = 0; // holds current offset in the width calculation

			if(lastMenuWidth==menuWidth) // prevents recalculating alot
				return;
			else
				lastMenuWidth = menuWidth;

			for(var i=0; i<$menu.menu_items.length; i++){
				var item = $menu.menu_items[i],
					$menu_item = $(item.$el),
					totalItemWidth = item.width;

				if(indexWidth + totalItemWidth > availableWidth){
					$($menu_item).appendTo($moreMenu);
				}
				else{
					$($menu_item).appendTo($menu);
				}

				indexWidth += totalItemWidth;
			}

			$menu.check_more_menu_link_visibility(); // should more link still be visible?

			$moreLink.appendTo($menu) // make morelink last item again

			$menu.trigger('on_update', [$menu]);
		}

		this.clear_more_menu = function(){
			$moreMenu.html('');
		}

		this.create_more_menu = function(){
			$moreMenu = jQuery('<ul class="more-menu" />');

			if(settings.more_menu_location=='after_menu'){
				$moreMenu.insertAfter($menu)
			}
			else{
				$moreMenu.appendTo(settings.more_menu_location)
			}

			return $moreMenu;
		}

		this.check_more_menu_link_visibility = function(){
			var itemsInMoreMenu = $moreMenu.children().length; // does the more menu have any childs?

			if(itemsInMoreMenu)
				$moreLink.show();
			else{
				$moreLink.hide();
				$menu.show_hide_more_menu('hide');
			}
		}

		this.show_hide_more_menu = function(show_hide){
			switch(show_hide)
			{
				case 'show':
					$($classTarget).addClass('more-menu-active');
				break;
				case 'hide':
					$($classTarget).removeClass('more-menu-active');
				break;
				case 'toggle':
					$($classTarget).toggleClass('more-menu-active');
				break;
			}
		}

		this.create_more_menu_link = function(){
			$moreLink = jQuery('<li class="more-menu-link"></li>');

			$moreLink.html(__('more_link'))
			$moreLink.appendTo($menu)

			moreItemWidth = calc_item_width($moreLink);

			$moreLink.on('click', function(e){
				e.preventDefault();

				$menu.show_hide_more_menu('toggle');

				$menu.trigger('on_show_toggle', [$menu]);
			})
		}

		this.set_class_target = function(){
			$classTarget = settings.class_target == 'more_menu' ? $menu : settings.class_target;

			$($classTarget).addClass('mm-initialized');
		}

		this.check_for_resizing = function(){
			if(!settings.check_for_resize)
				return;

			$(document).on('resize', throttle($menu.move_unfitting_items, 100));
		}

		$menu.set_class_target();
		$menu.create_more_menu();
		$menu.create_more_menu_link();
		$menu.refresh_menu_items();
		$menu.move_unfitting_items();
		$menu.check_for_resizing();

		$menu.trigger('on_creation', [$menu]);

		return $menu;
	};

}( jQuery ));
