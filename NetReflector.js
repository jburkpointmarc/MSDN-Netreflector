(function ($) {
    if (!$.Microsoft) $.Microsoft = {};
    if (!$.Microsoft.Mtps) $.Microsoft.Mtps = {};

    $.Microsoft.Mtps.NetReflector = function (options) {
        return this.init(options);
    }

    $.extend($.Microsoft.Mtps.NetReflector.prototype, {
        cookieOptions: { NRCookieName: "netreflector", ComscoreCookieName: "msresearch", path: "/", domain: ".microsoft.com", duration: 90 },
        init: function (options) {
            this.brandId = options.brandId;
            this.surveyUrl = options.surveyUrl;
            this.throttleRate = options.throttleRate;
            this.privacyStatementText = options.privacyStatementText;
            this.trackerWindowText = options.trackerWindowText;
            this.nrMainPanel = $(".NetReflectorMain");
            this.nrCloseButton = $(".NRCloseButton");
            this.nrSubmitButton = $(".NRSubmit");
            this.nrCancelButton = $(".NRCancel");
            this.nrPrivacyStatement = $('#PrivacyStatement');
            this.iframe = null;
            this.useIFrame = false;
            var nr = this;
            parent.$("iframe").each(function (iel, el) {
                if (el.contentWindow === window) {
                    nr.useIFrame = true;
                    nr.iframe = el;
                }
            });

            setTimeout(function () {
                var version = navigator.userAgent.indexOf("MSIE 10.0");
                if ((version != -1) && (window.innerWidth == screen.width) && (window.innerHeight == screen.height)) {
                    return;
                }
                if (nr.checkCookie() && nr.getRandom()) {
                    nr.bindEvent();
                    nr.setCookie();
                    nr.showPopup();
                }
            }, 3000);
        },
        bindEvent: function () {
            this.nrCloseButton.bind("click", this, function (e) {
                e.data.nrMainPanel.hide();
                if (e.data.useIFrame) {
                    $(e.data.iframe).hide();
                }
            });
            this.nrSubmitButton.bind("click", this, function (e) {
                e.data.popupTracker();
                e.data.nrMainPanel.css("display", "none");
                if (e.data.useIFrame) {
                    $(e.data.iframe).hide();
                }
            });
            this.nrCancelButton.bind("click", this, function (e) {
                e.data.nrMainPanel.css("display", "none");
                if (e.data.useIFrame) {
                    $(e.data.iframe).hide();
                }
            });
            this.nrPrivacyStatement.bind("click", this, function (e) {
                if (e.data.useIFrame) {
                    parent.location.href = 'http://privacy.microsoft.com/';
                }
                else {
                    window.location.href = 'http://privacy.microsoft.com/';
                }
            });
        },
        checkCookie: function () {
            if (navigator.cookieEnabled) {
                var nrCookie = $.cookie(this.cookieOptions.NRCookieName);
                var comscoreCookie = $.cookie(this.cookieOptions.ComscoreCookieName);
                if (!nrCookie && !comscoreCookie) {
                    return true;
                }
            }
            return false;
        },
        setCookie: function () {
            $.cookie(this.cookieOptions.NRCookieName, 1, {
                expires: this.cookieOptions.duration, path: this.cookieOptions.path, domain: this.cookieOptions.domain
            });
        },
        getRandom: function () {
            var randomNum = Math.random() * 100;
            if (randomNum < this.throttleRate) {
                return true;
            }
            return false;
        },
        showPopup: function () {
            var nrMainPanel = this.nrMainPanel, nrWindow = window;
            if (this.useIFrame) {
                nrMainPanel = $(this.iframe);
                nrWindow = parent;
            }

            var top = ($(nrWindow).height() - nrMainPanel.height()) / 2;
            var left = ($(nrWindow).width() - nrMainPanel.width()) / 2;
            nrMainPanel.css("top", top > 0 ? top : 0);
            nrMainPanel.css("left", left > 0 ? left : 0);
            this.nrMainPanel.css("display", "block");
            nrMainPanel.css("display", "block");
            this.addAnimation();
        },
        addAnimation: function () {
            var nrMainPanel = this.nrMainPanel, nrWindow = window;
            if (this.useIFrame) {
                nrMainPanel = $(this.iframe);
                nrWindow = parent;
            }

            nrWindow.onresize = function () {
                nrMainPanel.animate({
                    top: ($(nrWindow).height() - nrMainPanel.height()) / 2,
                    left: ($(nrWindow).width() - nrMainPanel.width()) / 2
                }, 500);
            };
        },
        popupTracker: function () {
            newwindow = window.open('', '', 'height=320px,width=385px,scrollbars=1');
            newdocument = newwindow.document;
            newdocument.write(this.getTrackerHtml());
            newdocument.close();
        },
        getTrackerHtml: function () {
            var trackerHtml = '<html>';
            trackerHtml += '<head>';
            trackerHtml += '<title>Survey Tracker</title>';
            trackerHtml += '<link href="/Areas/Sto/Content/Theming/NetReflector.css" rel="stylesheet" type="text/css" />';
            trackerHtml += '<link href="/Areas/Sto/Content/Theming/' + this.brandId + '/NetReflector.css" rel="stylesheet" type="text/css" />';
            trackerHtml += '</head>';
            trackerHtml += '<body class="NRTrackerBody">';
            trackerHtml += '<div class="NRTrackerMain">';
            trackerHtml += '<div class="TrackerHeader"></div>';
            trackerHtml += '<div class="NRTopStripe"></div>';
            trackerHtml += '<div class="NRNotification">';
            trackerHtml += '<div>' + this.trackerWindowText + '</div>';
            trackerHtml += '<div class="PrivacyStatement"><a href="http://privacy.microsoft.com/">' + this.privacyStatementText + '</a></div></div>';
            trackerHtml += '<div class="NRBottomStripe" />';
            trackerHtml += '</div>';
            trackerHtml += '</body>';
            trackerHtml += '</html>';
            trackerHtml += '<script type="text/javascript">';
            trackerHtml += 'var timer = self.setInterval("checkParentWindow()", 1000);';
            trackerHtml += 'var mainWindow;';
            trackerHtml += 'function checkParentWindow() {';
            trackerHtml += 'if (window.opener) {';
            trackerHtml += 'if (window.opener.closed) { showSurvey(); }';
            trackerHtml += 'else { try { mainWindow = window.opener.location.href; } catch (ex) { showSurvey(); } } }';
            trackerHtml += 'else { showSurvey(); } }';
            trackerHtml += 'function showSurvey() {';
            trackerHtml += 'timer = window.clearInterval(timer);';
            trackerHtml += 'window.focus();';
            trackerHtml += 'window.resizeTo(740, 800);';
            trackerHtml += 'window.location = "' + this.surveyUrl + '";';
            trackerHtml += 'timer = window.clearInterval(timer); }';
            trackerHtml += '</script>';
            return trackerHtml;
        }
    });

    if ($.Microsoft.Mtps.NetReflectorInit !== undefined) {
        var netReflectorInit = $.Microsoft.Mtps.NetReflectorInit;
        $(document).ready(function () {
            new $.Microsoft.Mtps.NetReflector({
                surveyUrl: netReflectorInit.surveyUrl,
                throttleRate: netReflectorInit.throttleRate,
                privacyStatementText: netReflectorInit.privacyStatementText,
                trackerWindowText: netReflectorInit.trackerWindowText,
                brandId: netReflectorInit.brandId
            });
        });
    }
})(jQuery);