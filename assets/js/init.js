/*
= GET WINDOW WIDTH
------------------------------------------------------------------------------------- */

    function viewport() {
        var e = window,
            a = 'inner';
        if (!('innerWidth' in window)) {
            a = 'client';
            e = document.documentElement || document.body;
        };
        return { width: e[a + 'Width'] };
    };

/*
= MAIN CONTROLLER
-------------------------------------------------------------------------------------- */

    var nfdev = {
        windowW: 0,
        windowH: $(window).height(),
        html: $('html'),
        body: $('body'),
        device: null,
        distanceFromTop: 0,
        lastDistanceFromTop: 0,
        resizeTimeout: null,
        navOpened: false,
        imagesLoaded: false,
        videoFinished: false,
        header: $('header'),
        footer: $('footer'),
        init: function() {

        /*
        + Preloading */

            nfdev.body.preloading({
                beforeComplete: function() {
                    if (window.location.hash) {
                        var currHash = window.location.hash,
                            newHash = currHash.substr(1, currHash.length),
                            curr = $('section[data-hash="' + newHash + '"]'),
                            currOffset = curr.offset().top;
                        if (nfdev.device != 'mobile' && curr.hasClass('fixed-section')) {
                            if (curr.height() < nfdev.windowH)
                                currOffset = curr.offset().top - (nfdev.windowH - curr.outerHeight()) / 2
                        }                            
                        $('html, body').stop().animate({
                            'scrollTop': currOffset + 1
                        }, 1000, 'easeInOutCubic');
                    }
                    nfdev.resize();
                    nfdev.imagesLoaded = true;
                    //if (nfdev.videoFinished)
                    nfdev.body.addClass('init-anim')

                },
                onComplete: function() {}
            });

        /*
        + Detecting device */

            if (nfdev.html.hasClass('desktop')) { nfdev.device = 'desktop'; }
            else if (nfdev.html.hasClass('tablet')) { nfdev.device = 'tablet'; }
            else if (nfdev.html.hasClass('mobile')) { nfdev.device = 'mobile'; }

        /*
        + Choosing theme */

            nfdev.device == 'desktop' ?
                this.desktop.init() :
                this.handheld.init();

        },
        transformSetter: function(x, y, scale) {
            return {
                '-webkit-transform': 'translateX(' + x + ') translateY(' + y + ') translateZ(0px) rotate(0deg) scale(' + scale + ')',
                '-moz-transform': 'translateX(' + x + ') translateY(' + y + ') translateZ(0px) rotate(0deg) scale(' + scale + ')',
                'transform': 'translateX(' + x + ') translateY(' + y + ') translateZ(0px) rotate(0deg) scale(' + scale + ')',
            }
        },
        transitionSetter: function(property, duration, delay, easing) {
            return {
                '-webkit-transition': property + ' ' + duration + ' ' + delay + ' ' + easing,
                '-moz-transition': property + ' ' + duration + ' ' + delay + ' ' + easing,
                '-o-transition': property + ' ' + duration + ' ' + delay + ' ' + easing,
                '-ms-transition': property + ' ' + duration + ' ' + delay + ' ' + easing,
                'transition': property + ' ' + duration + ' ' + delay + ' ' + easing,
            }           
        },
        delaySetter: function(delay) {
            return {
                '-webkit-transition-delay': delay + 'ms',
                '-moz-transition-delay': delay + 'ms',
                '-ms-transition-delay': delay + 'ms',
                '-o-transition-delay': delay + 'ms',
                'transition-delay': delay + 'ms'
            }
        },      
        common: { 
            parallaxOffsets: [],
            animatedOffsets: [], 
            darkHeights: [],  
            texts: [],
            fixedOffsets: [],
            bodyH: 0,
            footerH: 0,
            logo: {
                top: 0,
                height: 0
            },
            parallaxPosition: function(element, index) {

                var currSpeed = element.data('speed'),
                    siteTopOffset = this.parallaxOffsets[index].top < nfdev.windowH ? nfdev.windowH - this.parallaxOffsets[index].top : 0,
                    currMovement = currSpeed * (this.parallaxOffsets[index].top - nfdev.lastDistanceFromTop - nfdev.windowH + siteTopOffset);
                currMovement += 0;
                if (((currSpeed < 0 && currMovement < 0) || (currSpeed > 0 && currMovement > 0))) currMovement = 0;
                element.css(nfdev.transformSetter('0px', currMovement + 'px', 1));

            }, 
            
            init: function() {
				
            /*
            + Prevent scrolling */

                window.addEventListener('scroll', function(e) {
                    if (nfdev.navOpened) {
                        e.preventDefault();
                        e.stopPropagation();
                        return false;
                    }
                }, {passive: false});
                window.addEventListener('mousewheel', function(e) {
                    if (nfdev.navOpened) {
                        e.preventDefault();
                        e.stopPropagation();
                        return false;
                    }
                }, {passive: false});
                window.addEventListener('touchmove', function(e) {
                    if (nfdev.navOpened) {
                        e.preventDefault();
                        e.stopPropagation();
                        return false;
                    }
                }, {passive: false});   

            /*
            + Call resize functionality */

                this.resize();

            /*
            + Scroll animations */

                var raf;

                if (typeof raf == 'undefined') scrollingAnimation();

                function scrollingAnimation() {

                    nfdev.distanceFromTop = $(window).scrollTop();

                    if (Math.abs(nfdev.lastDistanceFromTop - nfdev.distanceFromTop) >= 1) {

                        dY = nfdev.distanceFromTop - nfdev.lastDistanceFromTop;
                        nfdev.lastDistanceFromTop += (dY / 10); 


                    /*
                    + Parallax movement (if it's in view) */

                        $('.parallax').each(function(i) {
                            var curr = $(this);
                            if (nfdev.common.parallaxOffsets[i].top - nfdev.distanceFromTop  < nfdev.windowH &&
                                nfdev.distanceFromTop - (nfdev.common.parallaxOffsets[i].top + nfdev.common.parallaxOffsets[i].height) <= 0) {
                                nfdev.common.parallaxPosition(curr, i);
                            }
                        });

                    /*
                    + Animate element (if it's in view) */

                        $('.animated').each(function(i) {
                            var curr = $(this),
                                currOffset = nfdev.windowH;
                            if (nfdev.common.animatedOffsets[i].top - nfdev.distanceFromTop < currOffset)
                                curr.addClass('in-view');
                        });

                    /*
                    + Main navigation */
					if (nfdev.distanceFromTop > 0) {
						nfdev.distanceFromTop > nfdev.lastDistanceFromTop ?
							nfdev.body.addClass('going-down').removeClass('going-up') :
							nfdev.body.addClass('going-up').removeClass('going-down');
					}                    

                    }

                    raf = requestAnimationFrame(scrollingAnimation);

                };

            },
            resize: function() {

            /*
            + Setting animated elements' initial positions / offsets */

                this.parallaxOffsets = [];
                this.animatedOffsets = [];
                this.darkHeights = [];
                this.fixedOffsets = []

                $('.parallax, .animated').each(function(i) {
                    var curr = $(this),
                        currParam = {
                            top: curr.offset().top,
                            height: curr.outerHeight()
                        };
                    curr.hasClass('parallax') ?
                        nfdev.common.parallaxOffsets.push(currParam) :
                        nfdev.common.animatedOffsets.push(currParam);
                    if (curr.hasClass('animated')) {
                        if (curr.offset().top - nfdev.distanceFromTop < nfdev.windowH)
                            curr.addClass('in-view')
                    }
                });

                $('.parallax').each(function(i) {
                   nfdev.common.parallaxPosition($(this), i);
                });

                this.logo.top = $(window).width() <= 768 && (!nfdev.html.hasClass('desktop') && nfdev.html.hasClass('portrait')) ? 
                    parseInt(nfdev.header.children().css('padding-top')) :
                    parseInt(nfdev.header.children().css('padding-top')) + 1;
                this.logo.height = $('.logo .shape').height();


            },
        },   
        desktop: {
            init: function() {

            /*
            + Call common functionality */

                nfdev.common.init();

            /*
            + Call resize functionality */

                this.resize();

            },
            resize: function() {

            }
        },
        handheld: {
            init: function() {

            /*
            + Call common functionality */

                nfdev.common.init();

            /*
            + Call resize functionality */

                this.resize();

            /*
            + Scrolling animation */

                var raf;

                if (typeof raf == 'undefined') scrollingAnimation();

                function scrollingAnimation() {

                    raf = requestAnimationFrame(scrollingAnimation);

                };

            },
            resize: function() {

            }
        },
        resize: function() {

            if (this.device == 'desktop' || this.windowW != $(window).width()) {

                if (this.resizeTimeout != null) {
                    clearTimeout(this.resizeTimeout)
                    this.resizeTimeout = null;
                }

                this.resizeTimeout = setTimeout(function() {

                    nfdev.windowW = $(window).width();
                    nfdev.windowH = $(window).height();

                    nfdev.common.resize();

                    nfdev.device == 'desktop' ?
                        nfdev.desktop.resize() :
                        nfdev.handheld.resize();

                    clearTimeout(nfdev.resizeTimeout)
                    nfdev.resizeTimeout = null;

                }, 500)

            }

        }
    }

    $(window).resize(function() {
        nfdev.resize();
    })    

    nfdev.init();

    nfdev.resize();
	
	
    
$(document).ready(function(){
    
	
	$(window).scroll(function() {    
		var scroll = $(window).scrollTop();

		if (scroll <= 150) {
			$('body').addClass('header-in-view');
		} else {
			$('body').removeClass('header-in-view');
		}
	});
	
	
});

