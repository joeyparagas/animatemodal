jQuery(document).ready(function ($) {
	var sliderFinalWidth = 400,			//final width --> this is the quick view image slider width
		maxQuickWidth = 900;					//maxQuickWidth --> this is the max-width of the quick-view panel

	//open the quick view panel / modal clicking on "Quick View"
	$('.cd-items').on('click', '.cd-item .cd-trigger', function (event) {
		var selectedImage = $(this).parent('.cd-item').children('img'),								 // grid-img
			selectedImageUrl = selectedImage.attr('src'), 															 // grid-image src
			selectedTitle = $(this).parent('.cd-item').children('.cd-title').text(),  	 // cd-title
			selectedSummary = $(this).parent('.cd-item').children('.cd-summary').text(); // cd-summary

		// Add class to darken background then animate
		$('body').addClass('overlay-layer');
		animateQuickView(selectedImage, sliderFinalWidth, maxQuickWidth, 'open');

		//update the visible slider image in the quick view panel
		//you don't need to implement/use the updateQuickView if retrieving the quick view data with ajax
		updateQuickView(selectedImageUrl, selectedTitle, selectedSummary);
	});

	//close the quick view panel if click on X or body
	$('body').on('click', function (event) {
		if ($(event.target).is('.cd-close') || $(event.target).is('body.overlay-layer')) {
			closeQuickView(sliderFinalWidth, maxQuickWidth);
		}
	});

	//check if user has pressed 'Esc'
	$(document).keyup(function (event) {
		if (event.which == '27') {
			closeQuickView(sliderFinalWidth, maxQuickWidth);
		}
	});

	// Capture click from prev/next button
	$('.cd-quick-view').on('click', '.cd-slider-navigation a', function () {
		updateSlider($(this));
	});

	//center quick-view on window resize if opened
	$(window).on('resize', function () {
		if ($('.cd-quick-view').hasClass('is-visible')) {
			window.requestAnimationFrame(resizeQuickView);
		}
	});

	// Find if prev or next was clicked
	function updateSlider(navigation) {
		let cdItems = navigation.parents('.cd-quick-view').parent().children('.cd-items'),
			emptyBox = navigation.parents('.cd-quick-view').parent().children('.cd-items').children('.empty-box').removeClass('empty-box');

		// Update modal and empty-box if next/prev buttons are clicked
		if (navigation.hasClass('cd-next')) {
			if (!emptyBox.is(':last-child')) {
				emptyBox.next().addClass('empty-box');
				let currentEmptyBox = emptyBox.next();
				updateQuickViewEmptyBox(currentEmptyBox);
			} else {
				cdItems.children('li').eq(0).addClass('empty-box');
				let currentEmptyBox = cdItems.children('li').eq(0);
				updateQuickViewEmptyBox(currentEmptyBox);
			}
		} else {
			if (!emptyBox.is(':first-child')) {
				emptyBox.prev().addClass('empty-box')
				let currentEmptyBox = emptyBox.prev();
				updateQuickViewEmptyBox(currentEmptyBox);
			} else {
				cdItems.children('li').last().addClass('empty-box');
				let currentEmptyBox = cdItems.children('li').last();
				updateQuickViewEmptyBox(currentEmptyBox);
			}
		}
	}

	// Find updated data attributes when click next/prev 
	function updateQuickViewEmptyBox(currentItem) {
		let currentImage = currentItem.children('img').attr('src'),
			currentTitle = currentItem.children('h2').text(),
			currentText = currentItem.children('p').text();

		updateQuickView(currentImage, currentTitle, currentText)
	}

	// Dynamically insert img, title and summary from grid into modal
	function updateQuickView(url, title, summary) {
		$('.cd-slider li.selected img').attr('src', url);
		$('.cd-item-info h2').text(title);
		$('.cd-item-info p').text(summary);
	}

	// Center modal with existing view
	function resizeQuickView() {
		var quickViewLeft = ($(window).width() - $('.cd-quick-view').width()) / 2,
			quickViewTop = ($(window).height() - $('.cd-quick-view').height()) / 2;
		$('.cd-quick-view').css({
			"top": quickViewTop,
			"left": quickViewLeft,
		});
	}

	// Update images when closing
	function closeQuickView(finalWidth, maxQuickWidth) {
		var close = $('.cd-close'),			// close button
			activeSliderUrl = close.siblings('.cd-slider-wrapper').find('.selected img').attr('src'),	// modal img src
			selectedImage = $('.empty-box').find('img');																							// empty-box img
		//update the image in the gallery
		if (!$('.cd-quick-view').hasClass('velocity-animating') && $('.cd-quick-view').hasClass('add-content')) {
			// replace empty-box image src with modal img src
			selectedImage.attr('src', activeSliderUrl);
			// animate closing sequence
			animateQuickView(selectedImage, finalWidth, maxQuickWidth, 'close');
		} else {
			closeNoAnimation(selectedImage, finalWidth, maxQuickWidth);
		}
	}

	// Open and closing animation sequence 
	// animateQuickView(selectedImage, sliderFinalWidth, maxQuickWidth, 'open');
	function animateQuickView(image, finalWidth, maxQuickWidth, animationType) {
		//store some image data (width, top position, ...)
		//store window data to calculate quick view panel position
		var parentListItem = image.parent('.cd-item'),								// empty-box li tag
			topSelected = image.offset().top - $(window).scrollTop(),		// how far from top is eb
			leftSelected = image.offset().left,													// how far left is eb
			widthSelected = image.width(),															// width of eb
			heightSelected = image.height(),														// height
			windowWidth = $(window).width(),
			windowHeight = $(window).height(),
			finalLeft = (windowWidth - finalWidth) / 2,									// width of window - width of slider /2
			finalHeight = finalWidth * heightSelected / widthSelected,	// slider width * eb height / eb width
			finalTop = (windowHeight - finalHeight) / 2,								// strange ratio to calculate top
			// if 80% of window < max modal width, then = 80% of window, else modal max width
			quickViewWidth = (windowWidth * .8 < maxQuickWidth) ? windowWidth * .8 : maxQuickWidth,
			// Center modal
			quickViewLeft = (windowWidth - quickViewWidth) / 2,
			windowXS = windowS = windowM = windowL = windowXL = 0;

		if (windowWidth < 768 && windowWidth > 479) {
			windowS = windowWidth
		} else if (windowWidth < 1024 && windowWidth > 767) {
			windowM = windowWidth
		} else if (windowWidth < 1170 && windowWidth > 1023) {
			windowL = windowWidth
		} else if (windowWidth > 1169) {
			windowXL = windowWidth
		} else {
			windowXS = windowWidth
		}

		if (animationType == 'open') {
			// Check different sizing of window
			if (windowWidth > 1023) {
				console.log('large');
			} else if (windowWidth < 1024 && windowWidth > 767) {
				console.log('medium');
				// widthSelected = (container width) * mq css width - margin
				widthSelected = (windowWidth * 0.98) * 0.48 - ((windowWidth * 0.98) * 0.04);
				console.log(widthSelected);
				finalTop = 50;
				quickViewLeft = 50;
				quickViewWidth = windowWidth - 100;
			} else {
				console.log('small');
				widthSelected = (windowWidth * 0.98);
				finalTop = 20;
				finalTop = 20;
				quickViewLeft = 20;
				quickViewWidth = windowWidth - 40;
			}
			openAnimate(parentListItem, topSelected, leftSelected, widthSelected, finalTop, finalLeft, finalWidth, quickViewLeft, quickViewWidth);
		} else {
			if (windowWidth > 1023) {
				closeAnimate(parentListItem, finalTop, finalLeft, finalWidth, topSelected, leftSelected, widthSelected);
			} else if (windowWidth < 1024 && windowWidth > 767) {
				console.log('medium');
				widthSelected = (windowWidth * 0.98) * 0.48 - ((windowWidth * 0.98) * 0.04);
				finalTop = 50;
				quickViewLeft = 50;
				quickViewWidth = windowWidth - 100;
				closeAnimate(parentListItem, finalTop, finalLeft, finalWidth, topSelected, leftSelected, widthSelected);
			} else {
				console.log('small');
				widthSelected = (windowWidth * 0.98);
				finalTop = 20;
				finalTop = 20;
				quickViewLeft = 20;
				quickViewWidth = windowWidth - 40;
				closeAnimate(parentListItem, finalTop, finalLeft, finalWidth, topSelected, leftSelected, widthSelected);
			}

		}
	}

	function openAnimate(parentListItem, topSelected, leftSelected, widthSelected, finalTop, finalLeft, finalWidth, quickViewLeft, quickViewWidth) {
		//hide the image in the gallery/create empty-box
		parentListItem.addClass('empty-box');
		//Initial animation sequence before modal opens (size/location of grid img)
		//place the quick view over the image gallery and give it the dimension of the gallery image
		$('.cd-quick-view').css({
			"top": topSelected,
			"left": leftSelected,
			"width": widthSelected,
		}).velocity({
			//animate the quick view: animate its width and center it in the viewport
			//during this animation, only the slider image is visible
			'top': finalTop + 'px',
			'left': finalLeft + 'px',
			'width': finalWidth + 'px',
		}, 1000, [400, 20], function () {
			//animate the quick view: animate its width to the final value
			$('.cd-quick-view').addClass('animate-width').velocity({
				'left': quickViewLeft + 'px',
				'width': quickViewWidth + 'px',
			}, 300, 'ease', function () {
				//show quick view content
				$('.cd-quick-view').addClass('add-content');
			});
		}).addClass('is-visible');
	}

	function closeAnimate(parentListItem, finalTop, finalLeft, finalWidth, topSelected, leftSelected, widthSelected) {
		//close the quick view reverting the animation
		$('.cd-quick-view').removeClass('add-content').velocity({
			'top': finalTop + 'px',
			'left': finalLeft + 'px',
			'width': finalWidth + 'px',
		}, 300, 'ease', function () {
			$('body').removeClass('overlay-layer');
			$('.cd-quick-view').removeClass('animate-width').velocity({
				"top": topSelected,
				"left": leftSelected,
				"width": widthSelected,
			}, 500, 'ease', function () {
				$('.cd-quick-view').removeClass('is-visible');
				parentListItem.removeClass('empty-box');
			});
		});
	}

	function closeNoAnimation(image, finalWidth, maxQuickWidth) {
		var parentListItem = image.parent('.cd-item'),
			topSelected = image.offset().top - $(window).scrollTop(),
			leftSelected = image.offset().left,
			widthSelected = image.width();

		$('body').removeClass('overlay-layer');
		parentListItem.removeClass('empty-box');
		$('.cd-quick-view').velocity("stop").removeClass('add-content animate-width is-visible').css({
			"top": topSelected,
			"left": leftSelected,
			"width": widthSelected,
		});
	}
});