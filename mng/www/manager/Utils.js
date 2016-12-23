var gettext = gettext || function (value) {return value}
if (!Array.prototype.indexOf) {
Array.prototype.indexOf = function (searchElement , fromIndex) {
    var i,
    pivot = (fromIndex) ? fromIndex : 0,
    length;

    if (!this) {
        throw new TypeError();
    }

    length = this.length;

    if (length === 0 || pivot >= length) {
        return -1;
    }

    if (pivot < 0) {
        pivot = length - Math.abs(pivot);
    }

    for (i = pivot; i < length; i++) {
        if (this[i] === searchElement) {
            return i;
        }
    }
    return -1;
};
}

Ext.ns("MNG");

Ext.define('MNG.Utils', { statics:{
    language_map:{
        zh_CN:gettext('简体中文'),
        zh_TW:gettext('繁體中文'),
        en:'English',
    },
    language_array:function (){
        var data = [];
        Ext.Object.each(MNG.Utils.language_map, function (key, value) {
            data.push([key, MNG.Utils.render_language(value)]);
        });

        return data;
    },
    format_boolean:function (value) {
        return value ? MNG.Utils.yesText : MNG.Utils.noText;
    },
    format_expire:function (date) {
        if (!date) {
            return MNG.Utils.neverText;
        }
        return Ext.Date.format(date, "Y-m-d");
    },
    assemble_field_data:function (values, data) {
        if (Ext.isObject(data)) {
            Ext.Object.each(data, function (name, val) {
                if (values.hasOwnProperty(name)) {
                    var bucket = values[name];
                    if (!Ext.isArray(bucket)) {
                        bucket = values[name] = [bucket];
                    }
                    if (Ext.isArray(val)) {
                        values[name] = bucket.concat(val);
                    } else {
                        bucket.push(val);
                    }
                } else {
                    values[name] = val;
                }
            });
        }
    },
    dialog_title:function (subject, create, isAdd) {
        if (create) {
            if (isAdd) {
                return gettext('增加') + ': ' + subject;
            } else {
                return gettext('创建') + ': ' + subject;
            }
        } else {
            return gettext('编辑') + ': ' + subject;
        }
    },
    render_language:function (value) {
        if (!value) {
            return MNG.Utils.defaultText + ' (English)';
        }
        var text = MNG.Utils.language_map[value];
        if (text) {
            return text + ' (' + value + ')';
        }
        return value;
    },
    authOK:function () {
        return Ext.util.Cookies.get('MNGAuth');
    },

    authClear:function () {
        return Ext.util.Cookies.clear('MNGAuth');
    },

    userClear:function () {
        return Ext.util.Cookies.clear('MNGUser');
    },

    // Ext.Ajax.request
    Request:function (reqOpts) {

        var newopts = Ext.apply({
            waitMsg:gettext('Please wait...')
        }, reqOpts);

        delete newopts.callback;

        var createWrapper = function (successFn, callbackFn, failureFn) {
            Ext.apply(newopts, {
                success:function (response, options) {
                    if (options.waitMsgTarget) {
                        options.waitMsgTarget.setLoading(false);
                    }
                    var result = Ext.decode(response.responseText);
                    response.result = result;
                    if (!result.success) {
                        response.htmlStatus = MNG.Utils.extractRequestError(result, true);
                        Ext.callback(callbackFn, options.scope, [options, false, response]);
                        Ext.callback(failureFn, options.scope, [response, options]);
                        return;
                    }
                    Ext.callback(callbackFn, options.scope, [options, true, response]);
                    Ext.callback(successFn, options.scope, [response, options]);
                },
                failure:function (response, options) {
                    if (options.waitMsgTarget) {
                        options.waitMsgTarget.setLoading(false);
                    }
                    response.result = {};
                    try {
                        response.result = Ext.decode(response.responseText);
                    } catch (e) {
                    }
                    var msg = gettext('Connection error') + ' - server offline?';
                    if (response.aborted) {
                        msg = gettext('Connection error') + ' - aborted.';
                    } else if (response.timedout) {
                        msg = gettext('Connection error') + ' - Timeout.';
                    } else if (response.status && response.statusText) {
                        msg = gettext('Connection error') + ' ' + response.status + ': ' + response.statusText;
                    }
                    response.htmlStatus = msg;
                    Ext.callback(callbackFn, options.scope, [options, false, response]);
                    Ext.callback(failureFn, options.scope, [response, options]);
                }
            });
        };

        createWrapper(reqOpts.success, reqOpts.callback, reqOpts.failure);

        var target = newopts.waitMsgTarget;
        if (target) {
            // Note: ExtJS bug - this does not work when component is not rendered
            target.setLoading(newopts.waitMsg);
        }
        Ext.Ajax.request(newopts);
    },
    extractRequestError:function (result, verbose) {
        var msg = gettext('Successful');

        if (!result.success) {
            msg = gettext("Unknown error");
            if (result.message) {
                msg = result.message;
                if (result.status) {
                    msg += ' (' + result.status + ')';
                }
            }
            if (verbose && Ext.isObject(result.errors)) {
                msg += "<br>";
                Ext.Object.each(result.errors, function (prop, desc) {
                    msg += "<br><b>" + Ext.htmlEncode(prop) + "</b>: " +
                        Ext.htmlEncode(desc);
                });
            }
        }
    },
    extractFormActionError:function (action) {
        var msg;
        switch (action.failureType) {
            case Ext.form.action.Action.CLIENT_INVALID:
                msg = gettext('Form fields may not be submitted with invalid values');
                break;
            case Ext.form.action.Action.CONNECT_FAILURE:
                msg = gettext('Connection Error');
                var resp = action.response;
                if (resp.status && resp.statusText) {
                    msg += " " + resp.status + ": " + resp.statusText;
                }
                break;
            case Ext.form.action.Action.LOAD_FAILURE:
            case Ext.form.action.Action.SERVER_INVALID:
                msg = MNG.Utils.extractRequestError(action.result, true);
                break;
        }
        return msg;
    },
    // comp.setLoading() is buggy in ExtJS 4.0.7, so we 
    // use el.mask() instead
    setErrorMask:function (comp, msg) {
        var el = comp.el;
        if (!el) {
            return;
        }
        if (!msg) {
            el.unmask();
        } else {
            if (msg === true) {
                el.mask(gettext("Loading..."));
            } else {
                el.mask(msg);
            }
        }
    },
    monStoreErrors:function (me, store) {
        me.mon(store, 'beforeload', function (s, operation, eOpts) {
            if (!me.loadCount) {
                me.loadCount = 0; // make sure it is numeric
                MNG.Utils.setErrorMask(me, true);
            }
        });

        me.mon(store.proxy, 'afterload', function (proxy, request, success) {
            me.loadCount++;

            if (success) {
                MNG.Utils.setErrorMask(me, false);
                return;
            }

            var msg;
            var operation = request.operation;
            var error = operation.getError();
            if (error.statusText) {
                msg = error.statusText + ' (' + error.status + ')';
            } else {
                msg = gettext('Connection Error');
            }
            MNG.Utils.setErrorMask(me, msg);
        });
    },
    render_timestamp:function (value, metaData, record, rowIndex, colIndex, store) {
        var servertime = new Date(value * 1000);
        return Ext.Date.format(servertime, 'Y-m-d H:i:s');
    },
    gridLineHeigh:function () {
        return 21;

        //if (Ext.isGecko)
        //return 23;
        //return 21;
    },
    format_size:function (size) {
        /*jslint confusion: true */

        if (size < 1024) {
            return size;
        }

        var kb = size / 1024;

        if (kb < 1024) {
            return kb.toFixed(0) + "KB";
        }

        var mb = size / (1024 * 1024);

        if (mb < 1024) {
            return mb.toFixed(0) + "MB";
        }

        var gb = mb / 1024;

        if (gb < 1024) {
            return gb.toFixed(2) + "GB";
        }

        var tb = gb / 1024;

        return tb.toFixed(2) + "TB";

    },
    usb_class:[
        [-1, gettext('Any')],
        [1, gettext('Audio Device')],
        [2, gettext('Communication and CDC Control Device')],
        [3, gettext('HID (Human Interface) Device')],
        [5, gettext('Physical Device')],
        [6, gettext('Image Device')],
        [7, gettext('Printer Device')],
        [8, gettext('Mass Storage Device')],
        [9, gettext('USB Hub Device')],
        [10, gettext('CDC Data Device')],
        [11, gettext('Smart Card Device')],
        [13, gettext('Content Security Device')],
        [14, gettext('Video Device')],
        [15, gettext('Personal Healthcare Device')],
        [16, gettext('Audio/Video Device')],
        [205, gettext('Diagnostic Device')],
        [224, gettext('Wireless Controller Device')],
        [239, gettext('Miscellaneous Device')],
        [254, gettext('Application Specific Device')],
        [255, gettext('Vendor Specific Device')]
    ],
    usb_action:[
        ['Allow', gettext('Allow')],
        ['Forbid', gettext('Forbid')],
        ['Allow-Auto', gettext('Allow-Auto')]
    ],
    yesText:gettext('Yes'),
    noText:gettext('No'),
    errorText:gettext('Error'),
    unknownText:gettext('Unknown'),
    defaultText:gettext('Default'),
    daysText:gettext('days'),
    dayText:gettext('day'),
    hoursText:gettext('hours'),
    hourText:gettext('hour'),
    minutesText:gettext('minutes'),
    minuteText:gettext('minute'),
    runningText:gettext('Running'),
    stoppedText:gettext('Stopped'),
    neverText:gettext('Never')
}
});