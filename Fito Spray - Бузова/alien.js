if (!Array.indexOf) {
    Array.prototype.indexOf = function (obj, start) {
        for (var i = (start || 0); i < this.length; i++) {
            if (this[i] == obj) {
                return i;
            }
        }
        return -1;
    }
}

function getTid() {
    var regex = new RegExp("[\\?\\&]tid\\=(\\d+)"),
        results = regex.exec(location.search);
    return results === null ? "" : '&tid=' + results[1];
}

function getTidClean() {
    var regex = new RegExp("[\\?\\&]tid\\=(\\d+)"),
        results = regex.exec(location.search);
    return results === null ? "" : results[1];
}

sUrl = '/order.html?' + getTid();
sLoadSelector = '';
sErrorNameSelector = '';
sErrorAddressSelector = '';
sErrorPhoneSelector = '';
sErrorStyle = null; // {'border': '2px solid red'}
bDisableValidation = false;
fFunctionValidation = '';
bReturnFlag = false;

var cookie_domains = [
    'http://cdn.shakeson.com/alien/shakesin.com',
    'http://cdn.shakeson.com/alien/shakeson.com'
];
//Если браузер НЕ Яндекс
if(typeof window.yandex === 'undefined') {
    cookie_domains.push('http://cdn.shakeson.com/alien/shakeson.ru');
}

var cookie_times = [];
var cookie_statuses = [];
var cookie_domain = cookie_domains[0];
var loca = document.location.hostname + document.location.pathname;
var cookieDomainsCheckedCount = 0;
var bConfirmFlag = false;
var stop_domains = false;

$(document).ready(function () {
    for (key in cookie_domains) {
        $.ajax({
            url: "http://" + cookie_domains[key] + "/index.php?r=api/cookie&jsoncallback=SetCookieDomain&site=" + loca + getTid(),
            dataType: "jsonp",
            jsonp: false,
            crossDomain: true,
            async: false,
            xhrFields: {
                withCredentials: true
            }
        });

        if (true == stop_domains) {
            break;
        }
    }

    $('input[name="email"]').click(function () {
        if (this.value == this.getAttribute('helper')) {
            this.value = '';
        }
    });
});

function SOrderConfirm(data) {
    if (sUrl != '') {
        sUrl = '/order.html?request_id=' + data.request_id + getTid();
        if (sLoadSelector != '') {
            $(sLoadSelector).load(sUrl);
        }
        else {
            document.location.href = sUrl;
        }
    }
    else {
        $('#order_form').submit();
    }
}

function SetCookieDomain(data) {
    var cookie_time = 0;

    if (data.status === true) {
        if (undefined != data.time) {
            cookie_time = data.time;
        }
    }

    cookie_times[cookie_domains.indexOf(data.domain)] = cookie_time;
    cookie_statuses[cookie_domains.indexOf(data.domain)] = data.status;

    cookieDomainsCheckedCount++;

    if (cookie_domains.length <= cookieDomainsCheckedCount) {
        callApiJs();
    }
}

function callApiJs() {
    var last_time = Math.max.apply(Math, cookie_times) + '';
    if (0 == last_time) {
        var status_true_index = cookie_statuses.indexOf(true);
        if (-1 < status_true_index) {
            cookie_domain = cookie_domains[status_true_index];
        }
    } else {
        cookie_domain = cookie_domains[cookie_times.indexOf(last_time)];
    }

    var script_tag = document.createElement('script');
        script_tag.setAttribute("type", "text/javascript");
        script_tag.setAttribute("src", "http://" + cookie_domain + "/index.php?r=api/js&site=" + loca + getTid());

    document.head.appendChild(script_tag);

    processForms();
}

function processForms() {
    $('form[id^="order_form"]').bind('submit', function (e) {
        if (!bDisableValidation) {
            isvalid = true;
            if ($(this).find('input[name=name]').val().length <= 2) {
                isvalid = false;
                if (sErrorNameSelector != '') {
                    if (sErrorStyle != null) {
                        $(sErrorNameSelector).css(sErrorStyle);
                    }
                    else
                        $(sErrorNameSelector).html('Укажите корректные ФИО.');
                }
                else {
                    alert('Укажите корректные ФИО.');
                }
            }
            else {
                if ($(this).find('input[name=phone]').val().length <= 9) {
                    isvalid = false;
                    if (sErrorPhoneSelector != '') {
                        if (sErrorStyle != null) {
                            $(sErrorPhoneSelector).css(sErrorStyle);
                        }
                        else
                            $(sErrorPhoneSelector).html('Укажите корректный телефон.');
                    }
                    else {
                        alert('Укажите корректный телефон.');
                    }
                }
            }

            if (!isvalid) {
                return false;
            }
        }

        if (fFunctionValidation != '') {
            if (!window['fFunctionValidation']()) {
                return false;
            }
        }

        if (!bConfirmFlag) {
            var formData = $(this).serialize();
            formData.tid = getTidClean();
            formData.loca = loca;
            bConfirmFlag = true;
            $.ajax({
                type: "POST",
                dataType: 'jsonp',
                url: 'http://' + cookie_domain + '/index.php?r=api/request/index&'
                +'site='+loca+'&'
                +'jsoncallback=SOrderConfirm' + getTid(),
                data: formData
            });

            return false;
        }
        return bReturnFlag;
    });


    $('#email_form').bind('submit', function () {
        var email = $(this).find('input[name=email]').val().replace(/^s+|s+$/g, '');

        if (($(this).find('input[name=email]').val().length > 5) && (/^([a-z0-9_-]+.)*[a-z0-9_-]+@([a-z0-9][a-z0-9-]*[a-z0-9].)+[a-z]{2,4}$/i).test(email)) {
            $.ajax({
                type: "POST",
                dataType: 'jsonp',
                url: 'http://' + cookie_domain + '/index.php?r=api/email&' + 'site=' + loca + getTid(),
                data: $(this).serialize()
            });

            $('#email_form').html('<p>Спасибо за участие! Ваш E-mail сохранен!</p>');
        }
        else
            alert('Введите корректный E-mail.');

        return false;
    });

    $('#callback').bind('submit', function () {
        if (!bDisableValidation) {
            isvalid = true;
            if ($(this).find('input[name=name]').val().length <= 2) {
                isvalid = false;
                if (sErrorNameSelector != '') {
                    if (sErrorStyle != null) {
                        $(sErrorNameSelector).css(sErrorStyle);
                    }
                    else
                        $(sErrorNameSelector).html('Укажите корретные ФИО.');
                }
                else {
                    alert('Укажите корретные ФИО.');
                }
            }
            else {
                if ($(this).find('input[name=phone]').val().length <= 9) {
                    isvalid = false;
                    if (sErrorPhoneSelector != '') {
                        if (sErrorStyle != null) {
                            $(sErrorPhoneSelector).css(sErrorStyle);
                        }
                        else
                            $(sErrorPhoneSelector).html('Укажите корретный телефон.');
                    }
                    else {
                        alert('Укажите корретный телефон.');
                    }
                }
            }

            if (!isvalid) {
                return false;
            }
        }

        if (fFunctionValidation != '') {
            if (!window['fFunctionValidation']()) {
                return false;
            }
        }

        if (!bConfirmFlag) {
            var formData = $(this).serialize();
            formData.tid = getTidClean();
            formData.loca = loca;

            bConfirmFlag = true;
            $.ajax({
                type: "POST",
                dataType: 'jsonp',
                url: 'http://' + cookie_domain + '/index.php?r=api/request/index&'
                +'site='+loca
                +'&jsoncallback=SOrderConfirmCallback' + getTid(),
                data: formData
            });

            return false;
        }
        return bReturnFlag;
    });
}

var comment_value = [];
comment_value.push({
    name: "screen_size",
    value: screen.width + "x" + screen.height
});