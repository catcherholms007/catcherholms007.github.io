"use strict";
var userAgent = navigator.userAgent.toLowerCase(), initialDate = new Date(), $document = $(document),
    $window = $(window), $html = $("html"), isDesktop = $html.hasClass("desktop"),
    isIE = userAgent.indexOf("msie") != -1 ? parseInt(userAgent.split("msie")[1]) : userAgent.indexOf("trident") != -1 ? 11 : userAgent.indexOf("edge") != -1 ? 12 : false,
    isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
    onloadCaptchaCallback, plugins = {
        pointerEvents: isIE < 11 ? "js/pointer-events.min.js" : false,
        smoothScroll: $html.hasClass("use--smoothscroll") ? "js/smoothscroll.min.js" : false,
        rdParallax: $(".rd-parallax"),
        rdInputLabel: $(".form-label"),
        rdNavbar: $(".rd-navbar"),
        regula: $("[data-constraints]"),
        owl: $(".owl-carousel"),
        resizable: $(".resizable"),
        rdMailForm: $(".rd-mailform"),
        captcha: $('.recaptcha')
    };
$document.ready(function () {
    function isScrolledIntoView(elem) {
        var $window = $(window);
        return elem.offset().top + elem.outerHeight() >= $window.scrollTop() && elem.offset().top <= $window.scrollTop() + $window.height();
    }

    function makeParallax(el, speed, wrapper, prevScroll) {
        var scrollY = window.scrollY || window.pageYOffset;
        if (prevScroll != scrollY) {
            prevScroll = scrollY;
            el.addClass('no-transition');
            el[0].style['transform'] = 'translate3d(0,' + -scrollY * (1 - speed) + 'px,0)';
            el.height();
            el.removeClass('no-transition');
            if (el.attr('data-fade') === 'true') {
                var bound = el[0].getBoundingClientRect(), offsetTop = bound.top * 2 + scrollY,
                    sceneHeight = wrapper.outerHeight(), sceneDevider = wrapper.offset().top + sceneHeight / 2.0,
                    layerDevider = offsetTop + el.outerHeight() / 2.0,
                    pos = sceneHeight / 6.0, opacity;
                if (sceneDevider + pos > layerDevider && sceneDevider - pos < layerDevider) {
                    el[0].style["opacity"] = 1;
                } else {
                    if (sceneDevider - pos < layerDevider) {
                        opacity = 1 + ((sceneDevider + pos - layerDevider) / sceneHeight / 3.0 * 5);
                    } else {
                        opacity = 1 - ((sceneDevider - pos - layerDevider) / sceneHeight / 3.0 * 5);
                    }
                    el[0].style["opacity"] = opacity < 0 ? 0 : opacity > 1 ? 1 : opacity.toFixed(2);
                }
            }
        }
        requestAnimationFrame(function () {
            makeParallax(el, speed, wrapper, prevScroll);
        });
    }

    function attachFormValidator(elements) {
        for (var i = 0; i < elements.length; i++) {
            var o = $(elements[i]), v;
            o.addClass("form-control-has-validation").after("<span class='form-validation'></span>");
            v = o.parent().find(".form-validation");
            if (v.is(":last-child")) {
                o.addClass("form-control-last-child");
            }
        }
        elements.on('input change propertychange blur', function (e) {
            var $this = $(this), results;
            if (e.type != "blur") {
                if (!$this.parent().hasClass("has-error")) {
                    return;
                }
            }
            if ($this.parents('.rd-mailform').hasClass('success')) {
                return;
            }
            if ((results = $this.regula('validate')).length) {
                for (i = 0; i < results.length; i++) {
                    $this.siblings(".form-validation").text(results[i].message).parent().addClass("has-error")
                }
            } else {
                $this.siblings(".form-validation").text("").parent().removeClass("has-error")
            }
        }).regula('bind');
    }

    function isValidated(elements, captcha) {
        var results, errors = 0;
        if (elements.length) {
            for (j = 0; j < elements.length; j++) {
                var $input = $(elements[j]);
                if ((results = $input.regula('validate')).length) {
                    for (k = 0; k < results.length; k++) {
                        errors++;
                        $input.siblings(".form-validation").text(results[k].message).parent().addClass("has-error");
                    }
                } else {
                    $input.siblings(".form-validation").text("").parent().removeClass("has-error")
                }
            }
            if (captcha) {
                if (captcha.length) {
                    return validateReCaptcha(captcha) && errors == 0
                }
            }
            return errors == 0;
        }
        return true;
    }

    function validateReCaptcha(captcha) {
        var $captchaToken = captcha.find('.g-recaptcha-response').val();
        if ($captchaToken == '') {
            captcha.siblings('.form-validation').html('Please, prove that you are not robot.').addClass('active');
            captcha.closest('.form-group').addClass('has-error');
            captcha.bind('propertychange', function () {
                var $this = $(this), $captchaToken = $this.find('.g-recaptcha-response').val();
                if ($captchaToken != '') {
                    $this.closest('.form-group').removeClass('has-error');
                    $this.siblings('.form-validation').removeClass('active').html('');
                    $this.unbind('propertychange');
                }
            });
            return false;
        }
        return true;
    }

    onloadCaptchaCallback = function () {
        for (i = 0; i < plugins.captcha.length; i++) {
            var $capthcaItem = $(plugins.captcha[i]);
            grecaptcha.render($capthcaItem.attr('id'), {
                sitekey: $capthcaItem.attr('data-sitekey'),
                size: $capthcaItem.attr('data-size') ? $capthcaItem.attr('data-size') : 'normal',
                theme: $capthcaItem.attr('data-theme') ? $capthcaItem.attr('data-theme') : 'light',
                callback: function (e) {
                    $('.recaptcha').trigger('propertychange');
                }
            });
            $capthcaItem.after("<span class='form-validation'></span>");
        }
    };
    if (isIE) {
        if (isIE < 10) {
            $html.addClass("lt-ie-10");
        }
        if (isIE < 11) {
            if (plugins.pointerEvents) {
                $.getScript(plugins.pointerEvents).done(function () {
                    $html.addClass("ie-10");
                    PointerEventsPolyfill.initialize({});
                });
            }
        }
        if (isIE === 11) {
            $("html").addClass("ie-11");
        }
        if (isIE === 12) {
            $("html").addClass("ie-edge");
        }
    }
    var o = $("#copyright-year");
    if (o.length) {
        o.text(initialDate.getFullYear());
    }
    if (plugins.smoothScroll) {
        $.getScript(plugins.smoothScroll);
    }
    if (plugins.rdInputLabel.length) {
        plugins.rdInputLabel.RDInputLabel();
    }
    if (plugins.regula.length) {
        attachFormValidator(plugins.regula);
    }
    if ($html.hasClass('desktop') && $html.hasClass("wow-animation") && $(".wow").length) {
        new WOW().init();
    }
    if (plugins.owl.length) {
        var k;
        for (k = 0; k < plugins.owl.length; k++) {
            var c = $(plugins.owl[k]), responsive = {};
            var aliaces = ["-", "-xs-", "-sm-", "-md-", "-lg-"], values = [0, 480, 768, 992, 1200], i, j;
            for (i = 0; i < values.length; i++) {
                responsive[values[i]] = {};
                for (j = i; j >= -1; j--) {
                    if (!responsive[values[i]]["items"] && c.attr("data" + aliaces[j] + "items")) {
                        responsive[values[i]]["items"] = j < 0 ? 1 : parseInt(c.attr("data" + aliaces[j] + "items"));
                    }
                    if (!responsive[values[i]]["stagePadding"] && responsive[values[i]]["stagePadding"] !== 0 && c.attr("data" + aliaces[j] + "stage-padding")) {
                        responsive[values[i]]["stagePadding"] = j < 0 ? 0 : parseInt(c.attr("data" + aliaces[j] + "stage-padding"));
                    }
                    if (!responsive[values[i]]["margin"] && responsive[values[i]]["margin"] !== 0 && c.attr("data" + aliaces[j] + "margin")) {
                        responsive[values[i]]["margin"] = j < 0 ? 30 : parseInt(c.attr("data" + aliaces[j] + "margin"));
                    }
                    if (!responsive[values[i]]["dotsEach"] && responsive[values[i]]["dotsEach"] !== 0 && c.attr("data" + aliaces[j] + "dots-each")) {
                        responsive[values[i]]["dotsEach"] = j < 0 ? false : parseInt(c.attr("data" + aliaces[j] + "dots-each"));
                    }
                }
            }
            if (c.attr('data-dots-custom')) {
                c.on("initialized.owl.carousel", function (event) {
                    var carousel = $(event.currentTarget), customPag = $(carousel.attr("data-dots-custom")), active = 0;
                    if (carousel.attr('data-active')) {
                        active = parseInt(carousel.attr('data-active'));
                    }
                    carousel.trigger('to.owl.carousel', [active, 300, true]);
                    customPag.find("[data-owl-item='" + active + "']").addClass("active");
                    customPag.find("[data-owl-item]").on('click', function (e) {
                        e.preventDefault();
                        carousel.trigger('to.owl.carousel', [parseInt(this.getAttribute("data-owl-item")), 300, true]);
                    });
                    carousel.on("translate.owl.carousel", function (event) {
                        customPag.find(".active").removeClass("active");
                        customPag.find("[data-owl-item='" + event.item.index + "']").addClass("active")
                    });
                });
            }
            if (c.attr('data-nav-custom')) {
                c.on("initialized.owl.carousel", function (event) {
                    var carousel = $(event.currentTarget), customNav = $(carousel.attr("data-nav-custom"));
                    customNav.find("[data-owl-prev]").on('click', function (e) {
                        e.preventDefault();
                        carousel.trigger('prev.owl.carousel', [300]);
                    });
                    customNav.find("[data-owl-next]").on('click', function (e) {
                        e.preventDefault();
                        carousel.trigger('next.owl.carousel', [300]);
                    });
                });
            }
            c.owlCarousel({
                autoplay: c.attr("data-autoplay") === "true",
                loop: c.attr("data-loop") === "true",
                items: 1,
                autoplaySpeed: 600,
                autoplayTimeout: 3000,
                dotsContainer: c.attr("data-pagination-class") || false,
                navContainer: c.attr("data-navigation-class") || false,
                mouseDrag: c.attr("data-mouse-drag") === "true",
                nav: c.attr("data-nav") === "true",
                dots: c.attr("data-dots") === "true",
                dotsEach: c.attr("data-dots-each") ? parseInt(c.attr("data-dots-each")) : false,
                responsive: responsive,
                animateOut: c.attr("data-animation-out") || false,
                navText: $.parseJSON(c.attr("data-nav-text")) || [],
                navClass: $.parseJSON(c.attr("data-nav-class")) || ['owl-prev', 'owl-next']
            });
        }
    }
    if (plugins.rdNavbar.length) {
        plugins.rdNavbar.RDNavbar({
            stickUpClone: (plugins.rdNavbar.attr("data-stick-up-clone")) ? plugins.rdNavbar.attr("data-stick-up-clone") === 'true' : false,
            stickUpOffset: (plugins.rdNavbar.attr("data-stick-up-offset")) ? plugins.rdNavbar.attr("data-stick-up-offset") : 1,
            anchorNavOffset: -120
        });
        if (plugins.rdNavbar.attr("data-body-class")) {
            document.body.className += ' ' + plugins.rdNavbar.attr("data-body-class");
        }
    }
    if (isDesktop) {
        $().UItoTop({
            easingType: 'easeOutQuart',
            containerClass: 'ui-to-top icon icon-xs icon-circle icon-darker-filled mdi mdi-chevron-up'
        });
    }
    if (plugins.captcha.length) {
        var i;
        $.getScript("//www.google.com/recaptcha/api.js?onload=onloadCaptchaCallback&render=explicit&hl=en");
    }
    if (plugins.rdMailForm.length) {
        var i, j, k, msg = {
            'MF000': 'Successfully sent!',
            'MF001': 'Recipients are not set!',
            'MF002': 'Form will not work locally!',
            'MF003': 'Please, define email field in your form!',
            'MF004': 'Please, define type of your form!',
            'MF254': 'Something went wrong with PHPMailer!',
            'MF255': 'Aw, snap! Something went wrong.'
        };
        for (i = 0; i < plugins.rdMailForm.length; i++) {
            var $form = $(plugins.rdMailForm[i]), formHasCaptcha = false;
            $form.attr('novalidate', 'novalidate').ajaxForm({
                data: {"form-type": $form.attr("data-form-type") || "contact", "counter": i},
                beforeSubmit: function () {
                    var form = $(plugins.rdMailForm[this.extraData.counter]), inputs = form.find("[data-constraints]"),
                        output = $("#" + form.attr("data-form-output")), captcha = form.find('.recaptcha'),
                        captchaFlag = true;
                    output.removeClass("active error success");
                    if (isValidated(inputs, captcha)) {
                        if (captcha.length) {
                            var captchaToken = captcha.find('.g-recaptcha-response').val(), captchaMsg = {
                                'CPT001': 'Please, setup you "site key" and "secret key" of reCaptcha',
                                'CPT002': 'Something wrong with google reCaptcha'
                            }
                            formHasCaptcha = true;
                            $.ajax({
                                method: "POST",
                                url: "bat/reCaptcha.php",
                                data: {'g-recaptcha-response': captchaToken},
                                async: false
                            }).done(function (responceCode) {
                                if (responceCode != 'CPT000') {
                                    if (output.hasClass("snackbars")) {
                                        output.html('<p><span class="icon text-middle mdi mdi-check icon-xxs"></span><span>' + captchaMsg[responceCode] + '</span></p>')
                                        setTimeout(function () {
                                            output.removeClass("active");
                                        }, 3500);
                                        captchaFlag = false;
                                    } else {
                                        output.html(captchaMsg[responceCode]);
                                    }
                                    output.addClass("active");
                                }
                            });
                        }
                        if (!captchaFlag) {
                            return false;
                        }
                        form.addClass('form-in-process');
                        if (output.hasClass("snackbars")) {
                            output.html('<p><span class="icon text-middle fa fa-circle-o-notch fa-spin icon-xxs"></span><span>Sending</span></p>');
                            output.addClass("active");
                        }
                    } else {
                        return false;
                    }
                },
                error: function (result) {
                    var output = $("#" + $(plugins.rdMailForm[this.extraData.counter]).attr("data-form-output"));
                    output.text(msg[result]);
                    form.removeClass('form-in-process');
                    if (formHasCaptcha) {
                        grecaptcha.reset();
                    }
                },
                success: function (result) {
                    var form = $(plugins.rdMailForm[this.extraData.counter]),
                        output = $("#" + form.attr("data-form-output"));
                    form.addClass('success').removeClass('form-in-process');
                    if (formHasCaptcha) {
                        grecaptcha.reset();
                    }
                    result = result.length == 5 ? result : 'MF255';
                    output.text(msg[result]);
                    if (result === "MF000") {
                        if (output.hasClass("snackbars")) {
                            output.html('<p><span class="icon text-middle mdi mdi-check icon-xxs"></span><span>' + msg[result] + '</span></p>');
                        } else {
                            output.addClass("active success");
                        }
                    } else {
                        if (output.hasClass("snackbars")) {
                            output.html(' <p class="snackbars-left"><span class="icon icon-xxs mdi mdi-alert-outline text-middle"></span><span>' + msg[result] + '</span></p>');
                        } else {
                            output.addClass("active error");
                        }
                    }
                    form.clearForm();
                    form.find('input, textarea').blur();
                    setTimeout(function () {
                        output.removeClass("active error success");
                        form.removeClass('success');
                    }, 3500);
                }
            });
        }
    }
    if (plugins.rdParallax.length) {
        var i;
        $.RDParallax();
        if (!isIE && !isMobile) {
            $(window).on("scroll", function () {
                for (i = 0; i < plugins.rdParallax.length; i++) {
                    var parallax = $(plugins.rdParallax[i]);
                    if (isScrolledIntoView(parallax)) {
                        parallax.find(".rd-parallax-inner").css("position", "fixed");
                    } else {
                        parallax.find(".rd-parallax-inner").css("position", "absolute");
                    }
                }
            });
        }
        $("a[href='#']").on("click", function (e) {
            setTimeout(function () {
                $(window).trigger("resize");
            }, 300);
        });
    }
    var navigations = document.getElementsByClassName("navigation");
    if (navigations.length) {
        for (i = 0; i < navigations.length; i++) {
            var navigation = $(navigations[i]);
            $window.on("scroll load", $.proxy(function () {
                var sectionTop = this.parents(".section-navigation").offset().top;
                var position = $window.scrollTop() - sectionTop + (window.innerHeight / 2);
                this[0].style["top"] = position + "px";
            }, navigation));
        }
    }
});