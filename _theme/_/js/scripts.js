(function ($, root, undefined) {
	'use strict';

	/*------------------------------------*\
		AJAX LOADER PLUGIN
	\*------------------------------------*/
	/*
		options:
			*target
			*ajaxURL
			*ajaxData
			ajaxSettings {type, data, ...}
			triggerTarget
			triggerSelector
			triggerEvent
			loaderTimer
			loaderClass

		callbacks:
			trigger
			done
			fail

		methods:
			disable
			enable
			abort
	*/
	$.ajaxload = function(opts) {
		opts = $.extend( {}, {
			'triggerTarget' : window,
			'triggerSelector' : '',
			'triggerEvent' : 'loadajax',
			'loaderTimer' : 1500,
			'loaderClass' : 'delayed',
			'ajaxData' : {},
			'ajaxSettings' : {}
		}, opts );

		var $target = $(opts.target),

		trigger = $.Callbacks(),

		done = $.Callbacks(),

		fail = $.Callbacks(),

		// timer
		timer,

		startTimer = function() {
			timer = setTimeout( function() {
				$target.addClass( opts.loaderClass );
			}, opts.loaderTimer );
		},

		cancelTimer = function() {
			$target.removeClass( opts.loaderClass );
			clearTimeout( timer );
		},

		request,

		state = 'ready',

		// kick off ajax
		ajaxCall = function( e ) {
			if (e) e.preventDefault();

			request = undefined;
			state = 'loading';
         startTimer();
			trigger.fireWith( e, [e] );

			if (state === 'aborted') return; // trigger callback can abort this

			$target.removeClass('done').removeClass('fail').addClass('loading');

			// check data for functions and replace them with their return values
			var ajaxData = $.extend( {}, opts.ajaxData );
			$.each(ajaxData, function ( k, v ) {
				if ( $.isFunction(v) ) {
					ajaxData[k] = v.call( e, e ); // set both this and the first arg to the event
				}
			});

			var ajaxSettings = $.extend( {}, {data:ajaxData}, opts.ajaxSettings );

			request = $.ajax( opts.ajaxURL, ajaxSettings )
				.always( function() { cancelTimer(); $target.removeClass('loading'); } )
				.done( function(data) { state = 'done'; $target.html(data).addClass('done'); done.fireWith(e, arguments); } )
				.fail( function() { state = 'fail'; $target.addClass('fail'); fail.fireWith(e, arguments); } );
		},

		ajaxAbort = function() {
			if ( request && $.isFunction(request.abort) ) {
				request.abort();
			}
			state = 'aborted';
			return this;
		},

		// deactivate event handling
		disable = function() {
			$(opts.triggerTarget).off('.ajaxload');
			return this;
		},

		// activate event handling
		enable = function() {
			disable(); // remove all handlers first
			$(opts.triggerTarget).on( opts.triggerEvent + '.ajaxload', opts.triggerSelector, ajaxCall );
			return this;
		};

		// start
		$target.addClass('ajaxload');
		enable();

		return {
			'trigger' : function(f) {
				return f ? trigger.add(f) : ajaxCall(null);
			},
			'done' : done.add,
			'fail' : fail.add,
			'disable' : disable,
			'enable' : enable,
			'abort' : ajaxAbort,
			'state' : function() { return state; },
			'config' : opts
		};
	};

	/*
	$(function () {
		$('body.desktop.post-type-archive-gallery').on('click', '.gallery', function (e) {
			var $gallery = $('#gallery');
			$gallery.find('.images').cycle('destroy');
			$gallery.empty().addClass('show');
			$.get(root.AJAX.ajaxurl, {action: 'get', id:this.id }, function(data, textStatus, jqXHR) {
				//console.log(data);
				$gallery.html(data);
				var $cycleContainer = $gallery.find('.images');
				$cycleContainer.cycle(cycleOptions);
				// $cycleContainer.on('click', function() { $cycleContainer.cycle('next');
				// 	console.log("click");
				// });
			});
			e.preventDefault();
			return false;
		});
	});
	*/

	/*
	$.timer = function(time) {
		var trigger = $.Callbacks,
		done = $.Callbacks,
		start = function(time2) {
			var time = time2 || time || 0;
			trigger.fire();
			setTimeout(done.fire, time);
		};
		return { 'trigger': trigger.add, 'done': done.add, 'start': start };
	};*/

	/*------------------------------------*\
		DRAWER PLUGIN
	\*------------------------------------*/
	$.Timer = function( time ) {
		time = time || 0;

		var cbStart = $.Callbacks(),

		cbDone = $.Callbacks(),

		timeout = false,

		start = function( timeOverride ) {
			var t = ( timeOverride === undefined ) ? ( time || 0 ) : timeOverride;
			cbStart.fire();
			timeout = setTimeout( cbDone.fire, t );
			return this;
		},

		stop = function() {
			if (timeout) clearTimeout( timeout );
			timeout = false;
			return this;
		};

		return {
			'start' : function( cb ) {
				if ( $.isFunction(cb) ) cbStart.add( cb );
				else start.apply( null, arguments );
				return this;
				//return $.isFunction(cb) ? cbStart.add( cb ) : start.apply( this, arguments );
			},
			'done' : cbDone.add,
			'stop' : stop
		};
	};

	// $(function() {
	// 	var t = $.Timer();
	// 	t.start(function() {
	// 		console.log('start');
	// 	});
	// 	t.done(function() {
	// 		console.log('done');
	// 	});
	// 	t.start(5000);
	// });


	$.Drawer = function( sel, openTime, closeTime ) {
		openTime = openTime || 0;
		closeTime = closeTime || 0;

		var cbOpen = $.Callbacks(),
		cbClosed = $.Callbacks(),
		cbOpening = $.Callbacks(),
		cbClosing = $.Callbacks(),

		// create a 'Drawer' function.
		Drawer = function( time, cl0, cl1, cb0, cb1 ) {
			return $.Timer( time ).start( function() {
				var $el = $(sel);
				$el.addClass( cl0 );
				cb0.fireWith( $el );
			}).done( function() {
				var $el = $(sel);
				$el.removeClass( cl0 ).addClass( cl1 );
				cb1.fireWith( $el );
			});
		},

		timerOpen = new Drawer( openTime, 'opening', 'open', cbOpening, cbOpen ),
		open = timerOpen.start, // trigger open

		timerClose = new Drawer( closeTime, 'closing', 'closed', cbClosing, cbClosed ),
		close = timerClose.start, // trigger close

		addOnce = function(cb) {
			return function(handler) {
				var once = function() {
					if ( $.isFunction(handler) ) handler.apply( this, arguments );
					cb.remove( once );
				};
				cb.add( once );
			};
		};

		return {
			'opening' : cbOpening.add,
			'openingOnce' : addOnce( cbOpening ),
			'open' : function(cb) {
				if ( $.isFunction(cb) ) cbOpen.add( cb ); // add open callback
				else { // trigger open
					timerClose.stop();
					var $el = $(sel);
					$el.removeClass('closing').removeClass('closed');
					open.apply(this, arguments);
				}
				return this;
			},
			'openOnce' : addOnce( cbOpen ),
			'closing' : cbClosing.add,
			'closingOnce' : addOnce( cbClosing ),
			'closed' : cbClosed.add,
			'closedOnce' : addOnce( cbClosed ),
			'close' : function(time) { // trigger close
				timerOpen.stop();
				var $el = $(sel);
				$el.removeClass('opening').removeClass('open');
				close.apply(this, arguments);
				return this;
			},
			'isOpen' : function() {
				return $(sel).hasClass('open');
			},
			'isClosed' : function() {
				return !$(sel).hasClass('open');
			}
		};
	};

	// $(function() {

	// 	var d = $.Drawer('.wrapper', 4000, 1000);
	// 	// d.opening(function(){ console.log('opening', this); });
	// 	// d.open(function(){ console.log('open', this); });
	// 	d.open();

	// });


	/*------------------------------------*\
		VIEWPORT PLUGIN
	\*------------------------------------*/
	// width consistent with media queries when scrollbars are involved
	$.viewport = function() {
		var e = window, a = 'inner';
		if (!('innerWidth' in window )) {
			a = 'client';
			e = document.documentElement || document.body;
		}
		return { width : e[ a+'Width' ] , height : e[ a+'Height' ] };
	};


	/*------------------------------------*\
		BREAKPOINT PLUGIN
	\*------------------------------------*/
	$.breakpoint = function(opts) {
		var isLower = false,
		isEqualOrHigher = false,
		sizeCheck = function() {
			var metrics = $.viewport();
			var vw = metrics.width, vh = metrics.height;
			console.log(vw, vh);
			if (vw >= opts.bpHorizontal && vh >= opts.bpVertical) {
				if (!isEqualOrHigher) {
					opts.equalOrHigher(vw, vh);
					$('html').removeClass(opts.ltClass).addClass(opts.gteqClass);
					isEqualOrHigher = true;
					isLower = false;
				}
			} else {
				if (!isLower) {
					opts.lower(vw, vh);
					$('html').addClass(opts.ltClass).removeClass(opts.gteqClass);
					isEqualOrHigher = false;
					isLower = true;
				}
			}
		};

		if (opts.dynamic) $(window).on('resize', sizeCheck);
		sizeCheck();
	};


	/*------------------------------------*\
		GALLERY CENTERING (function)
	\*------------------------------------*/
	var centerGallery = (function() {
		/*
			* compute largest image aspect radio (once per gallery)
			* on resize
				* compute image height
					0,7*vh
					or cw*1/largestAspectRatio
					whichever is smaller
				* size image container with this height
				* center it vertically in it's container
		*/
		var eventName = 'resize.centerGallery',
		disable = function() {
			$(window).off( eventName );
		},
		enable = function() {
			var maxAspectRatio = 1;
			$('#gallery img').each(	function() {
				var $img = $(this), aspectRatio = 1;
				aspectRatio = parseInt( $img.attr('width'), 10 ) / parseInt( $img.attr('height'), 10 );
				maxAspectRatio = Math.max( aspectRatio, maxAspectRatio );
			});
			//console.log( maxAspectRatio );
			$(window).off(eventName).on( eventName, function() {
				var v = $.viewport(),
				$ic = $('#gallery .images'), // image container
				h = Math.min( v.height*0.7, $ic.width()/maxAspectRatio );
				console.log("image height:", h);
				$ic.height( h ).css( 'margin-top', (v.height-h)/2 );
			});
			$(window).trigger(eventName);
		};
		return {
			enable: enable,
			disable: disable
		};
	})();


	/*------------------------------------*\
		HOTKEY PLUGIN
	\*------------------------------------*/
	$.hotkey = function(charCode, triggerFunction) {
		if (!$.isArray(charCode)) charCode = [charCode];
		$.each(charCode, function(i, el) {
			if (charCode[i] % 1 !== 0) charCode[i] = charCode[i].charCodeAt(0);
		});

		//console.log(charCode);
		$(document).keydown(function(e) {
			//console.log(e.keyCode);
			$.each(charCode, function(i, el){
				if (e.keyCode === charCode[i]) {
					triggerFunction(charCode[i]);
					return false;
				}
			});
		});
	};

	/*------------------------------------*\
		IMAGE LOADER PLUGINS
	\*------------------------------------*/
	/* get a promise wich resolves when all selected elements are loaded */
	$.fn.loadPromise = function() {
		var m = $.when({}); // master promise
		$(this).each(function() {
			var d = $.Deferred();
			$(this).on('load', d.resolve);
			if (this.complete) d.resolve();
			m = $.when(m, d); // join with master
		});
		return m;
	};

	/* sequentially add a class when the element is loaded, with a minimum time in between */
	$.fn.queueLoadClass = function (time, clss) {
		clss = clss || 'load';
		return $(this).each( function() {
			var $el = $(this);
			$(window).queue(function() {
				$el.loadPromise().done(function() {
					$el.addClass(clss);
					setTimeout(function() {
						$(window).dequeue();
					}, time);
				});
			});
		});
	};

	/*------------------------------------*\
		FULLSCREEN PLUGIN
	\*------------------------------------*/
	$.fn.fullscreen = function() {
		var $el = $(this).first();
		if ($el.length !== 0) {
			var elem = $el[0];
			if (elem.requestFullscreen) {
			  elem.requestFullscreen();
			} else if (elem.msRequestFullscreen) {
			  elem.msRequestFullscreen();
			} else if (elem.mozRequestFullScreen) {
			  elem.mozRequestFullScreen();
			} else if (elem.webkitRequestFullscreen) {
			  elem.webkitRequestFullscreen();
			}
		}
		return $(this);
	};




	/*------------------------------------*\
		MAIN
	\*------------------------------------*/

	/* breakpoint */
	$(function() {
		$.breakpoint({
			'bpHorizontal': 768,
			'bpVertical' : 665,
			'gteqClass': 'desktop',
			'ltClass': 'mobile',
			'dynamic': false,
			'lower' : function(vw, vh) {
				console.log("breakpoint: mobile");
			},
			'equalOrHigher' : function(vw, vh) {
				console.log("breakpoint: desktop");
			}
		});
	});


	/* masonry layout */
	$(function() {
		$('html.desktop body.post-type-archive-gallery main').masonry({
			// options
			columnWidth: 1,
			itemSelector: 'article'
		});
		// var msnry = new Masonry('html.desktop body.post-type-archive-gallery main', {
		// 	// options
		// 	columnWidth: 1,
		// 	itemSelector: 'article'
		// });

		$('body').addClass('ready');

		$('.gallery img').queueLoadClass(66);
	});


	/* cycle slideshow (options) */
	var cycleOptions = {
		'slides' : '> .img',
		'timeout': 0,

		'next': '#gallery .next',
		'prev': '#gallery .prev',
		// 'speed': 150,
		// 'sync': false,
		'fx': 'scrollHorz',
		'overlay': '#gallery .counter',
		'overlayTemplate': '{{slideNum}} / {{slideCount}}',
		//'centerVert': true,
		'centerHorz': true
	};

   var backHandler = function( e ) {
      e.preventDefault();
      window.history.back();
      console.log('back');
      return false;
   };


	/* AJAX & TRANSITIONS */
	$(function() {
		if ( !$('html').hasClass('desktop') ) return; // desktop version only

		var lockScrolling = function() {
			$('body').addClass('scroll-lock');
		},
		unlockScrolling = function() {
			$('body').removeClass('scroll-lock');
		};

		var transition = {
			about: function() {
				// console.log('transition.about');
				if ( contact.isOpen() ) {
					contact.close().closedOnce(function() {
						resetScrollbar();
						about.open();
					});
				} else {
					// if ( info.isClosed() ) { // reopen info
					// console.log('open info+about');
					resetScrollbar();
					info.open();
					about.open();
				}
			},
			contact: function() {
				// console.log('transition.contact');
				if ( about.isOpen() ) {
					about.close().closedOnce(function() {
						resetScrollbar();
						contact.open();
					});
				} else {
					// if ( info.isClosed() ) { // reopen info
						// console.log('open info+contact');
						resetScrollbar();
						info.open();
						contact.open();
				}
			},
			home: function() {
				//console.log('transition.home');
				if ( gallery.isOpen() ) {
					galleryLoader.abort();
					gallery.close();
					content.close();
					centerGallery.disable();
					info.close(0);
					about.close(0);
					contact.close(0);
				} else if ( info.isOpen() ) {
					info.close();
					info.closedOnce( function() {
						about.close( 0 );
						contact.close( 0 );
					});
				} else return;
			},
			gallery: function( slug ) {
				if ( gallery.isClosed() ) {
					gallery.open();
				}
				content.open();
			}
		};

		// reset scrollbar on info overlay
		var resetScrollbar = function() {
			//$('#info').scrollTop( 0 );
			// hack to make it set scroll position while opacity is changing
			$('#info').animate( {scrollTop:0}, 1 );
		};

		// route function. via history
		var route = function( newRoute ) {
			var oldRoute = History.getState().data.route || '/',
			method = oldRoute === '/' ? 'push' : 'replace';

			console.log('route', method + ':', oldRoute, '->', newRoute);
			History[method + 'State']( {'route':newRoute}, document.title, newRoute ); // state === url
		};

		// handle routes
		History.Adapter.bind( window, 'statechange', function() {
			var route = History.getState().data.route || '/';

			if ( route === '/' ) {
				// console.log('transition: home');
				transition.home();
				$('nav li').removeClass('current-menu-item');
			} else if ( route === '/about/' ) {
				// console.log('transition: about');
				transition.about();
				$('nav li').removeClass('current-menu-item');
				$('#menu-item-184').addClass('current-menu-item');
			} else if ( route === '/contact/' ) {
				// console.log('transition: contact');
				transition.contact();
				$('nav li').removeClass('current-menu-item');
				$('#menu-item-183').addClass('current-menu-item');
			}
			else {
				route = route.replace(/\//g, '');
				var id = $('.gallery[data-slug="' + route + '"]').attr('id');
				galleryLoader.config.ajaxData.id = id;
				galleryLoader.trigger(); // trigger ajax load
			}
		});


		/* ABOUT + CONTACT */
		var infoLoader = $.ajaxload({
			'target' : '#info',
			'triggerTarget' : 'body.archive',
			'triggerSelector' : '#menu-item-184 a, #menu-item-183 a, #194 a',
			'triggerEvent' : 'click',
			'ajaxURL' : root.AJAX.ajaxurl,
			'ajaxData' : {action:'get', id:'info'}
		}),

		info = $.Drawer( '#info', 1000, 1000 ),
		about = $.Drawer( '#about', 750, 750 ),
		contact = $.Drawer( '#contact', 750, 750 );

		info.open( lockScrolling ).closing( unlockScrolling );

		infoLoader.trigger( function(e) {
			// console.log('info triggered');
			//info.abort().disable();
			info.open();
		});

		infoLoader.done( function( data ) {
			var clickID = $(this.currentTarget).closest('[id]').attr('id');
			// console.log('info done: ', clickID);

			// about menu link or teaser link
			if (  clickID === 'menu-item-184' || clickID === '194' ) {
				//transition.about();
				route('/about/');
			} else {
				//transition.contact();
				route('/contact/');
			}
			infoLoader.disable(); // loading it one time is enough

			// now add event handlers without loading

			// about links
			$('#menu-item-184 a, #194 a').on( 'click', function( e ) {
				route('/about/');
				e.preventDefault();
			});

			// contact link
			$('#menu-item-183 a').on( 'click', function( e ) {
				route('/contact/');
				e.preventDefault();
			});

			// backlinks
			$('.backlink a').off('click').on( 'click', backHandler );
		});


		/* GALLERY */
		var galleryLoader = $.ajaxload({
			'target' : '#gallery',
			'ajaxURL' : root.AJAX.ajaxurl,
			'ajaxData' : {action : 'get'}
		}),

		gallery = $.Drawer( '#gallery', 1000, 500 ),
		content = $.Drawer( '#gallery article', 500, 500 ),

		homeHandler = function( e ) {
         if ( $('body').hasClass('home') && $('#info, #gallery').hasClass('open') ) {
            route('/');
         } else {
            window.location = window.location.hostname; // hard reload
         }
			e.preventDefault();
		};

		gallery.open( lockScrolling ).closing( unlockScrolling );

		galleryLoader.trigger( function(e) {
			gallery.open();
			content.close();
		});

		galleryLoader.done( function() {
			var $cycleContainer = $('#gallery .images');
			$cycleContainer.cycle('destroy').cycle(cycleOptions);
			$('.backlink a').off('click').on( 'click', backHandler );
			$('#gallery img').on('load', function(e) {
            // console.log('img loaded', e);
            $(e.target).addClass('load');
         });
			centerGallery.enable();
			transition.gallery();
         $('#gallery .img').prepend('<div class="loadanim" style="opacity:1;z-index:0;"></div>');
		});

		// home link (logo)
		$('body.archive .logo').on( 'click', homeHandler );

		$('body').on('click', '.gallery', function(e) {
			route( '/' + $(e.currentTarget).data('slug') + '/' );
			e.preventDefault();
		});

		/* hotkeys */
		$.hotkey('A', function() {
			//route('/about/');
			$('#menu-item-184 a').trigger('click');
		});
		$.hotkey('C', function(){
			// route('/contact/');
			$('#menu-item-183 a').trigger('click');
		});
		$.hotkey('F', function() {
			$('body').fullscreen();
		});
		$.hotkey(37, function(){
			if ( !$('#gallery article').hasClass('open') ) return;
			$('#gallery .images').cycle('prev');
		});
		$.hotkey([39, 32, 13], function(){
			if ( !$('#gallery article').hasClass('open') ) return;
			$('#gallery .images').cycle('next');
		});

		$.hotkey(40, function() { // next gallery
			if ( !$('#gallery article').hasClass('open') ) return;
			var current = $('#gallery article').data('slug');
			var $next = $('main>.gallery[data-slug="'+current+'"]').next('.gallery');
			if ($next.length === 0) $next = $('main>.gallery').first();
			$next.trigger('click');
		});

		$.hotkey(38, function() { // prev gallery
			if ( !$('#gallery article').hasClass('open') ) return;
			var current = $('#gallery article').data('slug');
			var $prev = $('main>.gallery[data-slug="'+current+'"]').prev('.gallery');
			if ($prev.length === 0) $prev = $('main>.gallery').last();
			$prev.trigger('click');
		});

		$.hotkey(27, function(){
			route('/');
		});
		function galleryTrigger(idx) {
			return function() {
				$('main>.gallery').eq(idx).trigger('click');
			};
		}
		// 1..9
		for (var i=0; i<10; i++) {
			$.hotkey( 49+i, galleryTrigger(i) );
		}
		// 0
		$.hotkey( '0', galleryTrigger(10) );

	});


	/* TRACKING */
	$(function() {
		$('html.desktop body').on('click', 'a', function(e) {
			var link = e.currentTarget;
			if (link.href != '.' && ga && link.hostname && link.protocol && link.pathname) {
				// TODO: set cycle2 prev/next link anchors via events. use real links
				var opts =  {
					'page': link.pathname,
					'location': link.protocol + '//' + link.hostname + link.pathname,
					'title': link.pathname.replace(/\//g,'')
				};
				ga('send', 'pageview', opts);
				//console.log('GA', opts);
			}
		});
	});


   /* BACKLINKS */
   $(function() {
      $('.backlink a').click(backHandler);
   });

})(jQuery, this);
