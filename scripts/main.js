(function($) {

	'use strict';

	var isAnimating = false,
		defaultInAnimation = 'flipIn',
		defaultOutAnimation = 'flipOut',
		sectionInAnimation = '',
		sectionOutAnimation = '',
		nextSectionId = '',
		animationEnd;

	function animationEndEventName() {
		var i,
			el = document.createElement('div'),
			animations = {
				'animation': 'animationend',
				'oAnimation': 'oAnimationEnd',
				'MSAnimation': 'MSAnimationEnd',
				'mozAnimation': 'mozAnimationEnd',
				'WebkitAnimation': 'webkitAnimationEnd'
			};
		for (i in animations) {
			if (animations.hasOwnProperty(i) && el.style[i] !== undefined) {
				return animations[i];
			}
		}
	}

	function animateSections() {

		$('.section-in').removeClass('section-in').addClass('section-out');

		var $sectionOut = $('.section-out'),
			$sectionOutBlocks = $sectionOut.find('.section-main-block, .section-secondary-block');
		sectionOutAnimation = $('body').data('animation-out') || defaultOutAnimation;
		$sectionOutBlocks.addClass(sectionOutAnimation).removeClass(sectionInAnimation);

		if ($(nextSectionId).length) {
			$(nextSectionId).addClass('section-in');
		} else {
			$('.section').eq(0).addClass('section-in');
		}

		var $sectionIn = $('.section-in'),
			$sectionInBlocks = $sectionIn.find('.section-main-block, .section-secondary-block');
		sectionInAnimation = $('body').data('animation-in') || defaultInAnimation;
		$sectionInBlocks.removeClass(sectionOutAnimation).addClass(sectionInAnimation);

		$('.nav-main a[href="' + nextSectionId + '"]').parent().addClass('active').siblings().removeClass('active');

	}

	function changeSections(e) {
		var sectionId = $(e.target).attr('href');
		if (isAnimating || sectionId === location.hash) {
			return false;
		} else {
			isAnimating = true;
			nextSectionId = sectionId;
			location.hash = sectionId;
			animateSections();
		}
	}

	function checkUrlHash() {
		var hash = location.hash;
		if (hash.length && $('section' + hash).length) {
			nextSectionId = hash;
			animateSections();
		}
	}

	$(document).ready(function() {

		var $navLinks = $('.nav-main a').not('.external');
			animationEnd = animationEndEventName();

		$('.btn-site-loader-close').on('click', function() {
			$('.site-loader').fadeOut('slow');
		});

		/*=============================================>>>>>
		= SHOW/HIDE MAIN NAVIGATION =
		===============================================>>>>>*/
		$('.hamburger').on('click', function() {
			$(this).toggleClass('is-active');
			$('.nav-main').toggleClass('active');
		});

		/*=============================================>>>>>
		= SLIDESHOW =
		===============================================>>>>>*/
		$('.owl-carousel').each(function () {
			var	$slider = $(this),
				sliderOptions = $slider.data('slideshow-options'),
				defaultOptions = {
					items: 1,
					loop: true,
					mouseDrag: false,
					autoplay: true,
					autoplayTimeout: 10000,
					autoplayHoverPause: true,
					nav: true,
					navText: ['<i class="fa fa-caret-left">', '<i class="fa fa-caret-right">']
				};
			$slider.owlCarousel($.extend(defaultOptions, sliderOptions));
		});

		/*=============================================>>>>>
		= PROGRESS BARS =
		===============================================>>>>>*/
		$('.progress').each(function() {
			var el = $(this),
				progressVal = el.data('progress');
			el.append('<div class="progress-bar"><div class="progress-bar-inner"></div></div>');
			el.find('.progress-bar').css('width', progressVal + '%');
		});

		/*=============================================>>>>>
		= PROJECTS FILTERING =
		===============================================>>>>>*/
		$('.projects').shuffle({
			itemSelector: '.projects-item',
			sizer: '.projects-sizer'
		});

		$('.filter').on('click', 'li', function() {
			var self = $(this);
			$(this).addClass('active').siblings().removeClass('active').parents('.filter').next('.projects').shuffle('shuffle', self.data('group'));
		});

		/*=============================================>>>>>
		= MAP =
		===============================================>>>>>*/
		var mapEl = document.getElementById('map');
		if (mapEl) {
			
			L.TileLayer.Grayscale = L.TileLayer.extend({
				options: {
					quotaRed: 21,
					quotaGreen: 71,
					quotaBlue: 8,
					quotaDividerTune: 0,
					quotaDivider: function() {
						return this.quotaRed + this.quotaGreen + this.quotaBlue + this.quotaDividerTune;
					}
				},

				initialize: function (url, options) {
					options = options || {}
					options.crossOrigin = true;
					L.TileLayer.prototype.initialize.call(this, url, options);

					this.on('tileload', function(e) {
						this._makeGrayscale(e.tile);
					});
				},

				_createTile: function () {
					var tile = L.TileLayer.prototype._createTile.call(this);
					tile.crossOrigin = 'Anonymous';
					return tile;
				},

				_makeGrayscale: function (img) {
					if (img.getAttribute('data-grayscaled'))
						return;

							img.crossOrigin = '';
					var canvas = document.createElement('canvas');
					canvas.width = img.width;
					canvas.height = img.height;
					var ctx = canvas.getContext('2d');
					ctx.drawImage(img, 0, 0);

					var imgd = ctx.getImageData(0, 0, canvas.width, canvas.height);
					var pix = imgd.data;
					for (var i = 0, n = pix.length; i < n; i += 4) {
									pix[i] = pix[i + 1] = pix[i + 2] = (this.options.quotaRed * pix[i] + this.options.quotaGreen * pix[i + 1] + this.options.quotaBlue * pix[i + 2]) / this.options.quotaDivider();
					}
					ctx.putImageData(imgd, 0, 0);
					img.setAttribute('data-grayscaled', true);
					img.src = canvas.toDataURL();
				}
			});

			L.tileLayer.grayscale = function (url, options) {
				return new L.TileLayer.Grayscale(url, options);
			};

			var lat = mapEl.getAttribute('data-latitude');
			var lng = mapEl.getAttribute('data-longitude');
			var map = L.map(mapEl, {
				center: [lat, lng],
				zoom: 18,
				'zoomControl': false
			});
			var icon = L.icon({
				iconUrl: 'images/map-marker.png',
				iconSize: [30, 43],
				iconAnchor: [15, 43]
			});

			var zoomControl = L.control.zoom({
				position: 'topright'
			});
			map.addControl(zoomControl);

			L.tileLayer.grayscale('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
			L.marker([lat, lng], {icon: icon}).addTo(map);

		}

		/*=============================================>>>>>
		= POPUPS =
		===============================================>>>>>*/
		$('.projects-item-thumb').magnificPopup({
			type: 'inline',
			gallery: {
				enabled: true
			},
			mainClass: 'flipcard',
			removalDelay: 800
		});

		$('.btn-popup').magnificPopup({
			mainClass: 'flipcard',
			removalDelay: 800
		});

		$('.btn-lightbox').magnificPopup({
			type: 'image',
			mainClass: 'flipcard',
			removalDelay: 800
		});

		$('.gallery').each(function() {
			$(this).magnificPopup({
				delegate: 'a',
				type: 'image',
				gallery: {
					enabled: true
				},
				mainClass: 'flipcard',
				removalDelay: 800
			});
		});

		/*=============================================>>>>>
		= FORM VALIDATION =
		===============================================>>>>>*/
		$('form').each( function() {
			$(this).validate();
		});

		/*=============================================>>>>>
		= FORM SUBMIT =
		===============================================>>>>>*/
		$('.form-contact').submit(function(e){
			e.preventDefault();
			var $form = $(this),
				$submit = $form.find('[type="submit"]');
			if( $form.valid() ){
				var dataString = $form.serialize();
				$submit.after('<div class="loader"></div>');
				$.ajax({
					type: $form.attr('method'),
					url: $form.attr('action'),
					data: dataString,
					success: function() {
						$submit.after('<div class="message message-success">Your message was sent successfully!</div>');
					},
					error: function() {
						$submit.after('<div class="message message-error">Your message wasn\'t sent, please try again.</div>');
					},
					complete: function() {
						$form.find('.loader').remove();
						$form.find('.message').fadeIn();
						setTimeout(function() {
							$form.find('.message').fadeOut(function() {
								$(this).remove();
							});
						}, 5000);
					}
				});
			}
		});

		/*=============================================>>>>>
		= MEDIA QUERIES =
		===============================================>>>>>*/
		function handleWidthChange(mqlVal) {
			if (mqlVal.matches) {

				$navLinks.off('click');
				$('.btn-section').off('click');

				$navLinks.on('click', function(e) {
					e.preventDefault();
					var target = $(this).attr('href'),
						targetOffset = $(target).offset();
					$(this).parent().addClass('active').siblings().removeClass('active');
					$('html,body').animate({scrollTop: (targetOffset.top)}, 500);
					$('.nav-main').removeClass('active');
					$('.hamburger').removeClass('is-active');
				});

				/*=============================================>>>>>
				= REMOVE CUSTOM SCROLLBAR =
				===============================================>>>>>*/
				$('.section-block-content').mCustomScrollbar('destroy');

			} else {

				$navLinks.off('click');

				checkUrlHash();

                $('.section-main-block, .section-secondary-block').addClass('animated');

				$('.section-secondary-block-right').on(animationEnd, function(e) {
					if ($(e.target).parent().hasClass('section-out') && $(e.target).hasClass('section-secondary-block-right')) {
						console.log('Section "' + $(e.target).parent().attr('id') + '" out.' );
						$(e.target).parents('.section').removeClass('section-out');
						$(e.target).removeClass(sectionOutAnimation).siblings('.section-secondary-b').removeClass(sectionOutAnimation);
					} else if ($(e.target).parent().hasClass('section-in') && $(e.target).hasClass('section-secondary-block-right')) {
						console.log('Section "' + $(e.target).parent().attr('id') + '" in.' );
						isAnimating = false;
					}
				});

				$navLinks.on('click', function(e) {
					e.preventDefault();
					changeSections(e);
				});
				$('.btn-section').on('click', function(e) {
					e.preventDefault();
					changeSections(e);
				});

				/*=============================================>>>>>
				= INIT CUSTOM SCROLLBAR =
				===============================================>>>>>*/
				$('.section-block-content').mCustomScrollbar({
					theme: 'flipcard',
					scrollInertia: 100
				});

			}
		}

		if (window.matchMedia) {
			var mql = window.matchMedia('(max-width: 1279px)');
			mql.addListener(handleWidthChange);
			handleWidthChange(mql);
		}

	});

	$(window).on('load', function() {

		$('.site-loader').delay(1000).fadeOut('slow');

	});

})(jQuery);
