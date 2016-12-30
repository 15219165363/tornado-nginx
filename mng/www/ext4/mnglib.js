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

// custom Vtypes
Ext.apply(Ext.form.field.VTypes, {

    UserName:function (v) {
        return (/^^[A-Za-z0-9\_]{2,20}$/).test(v);
    },

    UserNameText:gettext("Allowed characters") + ": 'a-z', '0-9', 'A-Z', '_'," 
        + "," + gettext("and CharNum") + ": [2~20]" + "," + gettext("Note:A case-insensitive"), 


    PassWord:function (v) {
        return (/^.{5,20}$/).test(v);
    },
    PassWordText:gettext("Allowed characters") + ":" 
        + gettext("all characters") + ","
        + gettext("and CharNum") + ":[5~20]",   

    Email:function (v) {
        return (/^[a-zA-Z0-9][a-zA-Z0-9\.\_]{5,29}\@[a-zA-Z0-9]{3,10}\.com(\.cn)?$/).test(v);
    },
    EmailText:gettext("MaxCharNum") + ": {<=50}",         


});
Ext.define('MNG.RestProxy', {
    extend: 'Ext.data.RestProxy',
    alias : 'proxy.mng',

    constructor: function(config) {
		var me = this;

		config = config || {};

		Ext.applyIf(config, {
			pageParam : null,
			startParam: null,
			limitParam: null,
			groupParam: null,
			sortParam: null,
			filterParam: null,
			noCache : true,
			reader: {
				type: 'json',
				root: config.root || 'data'
			},
			afterRequest: function(request, success) {
				me.fireEvent('afterload', me, request, success);
				return;
			}
		});

		me.callParent([config]); 
    }
}, function() {
		Ext.define('KeyValue', {
			extend: "Ext.data.Model",
			fields: [ 'key', 'value' ],
			idProperty: 'key'
		});
		Ext.define('mng-users', {
			extend: 'Ext.data.Model',
			fields: [ 
				'username','role',  'password', 'email', 'comment', 'mac','bduser',
				{ type: 'boolean', name: 'enable' }, 
				{ type: 'date', dateFormat: 'timestamp', name: 'expire' }
			],
			proxy: {
				type: 'mng',
				url: "/mng/user"
			},
			idProperty: 'username'
		});

	}


);
/* A reader to store a single JSON Object (hash) into a storage.
 * Also accepts an array containing a single hash. 
 * So it can read:
 *
 * example1: { data: "xyz" }
 * example2: [ {  data: "xyz" } ]
 */

Ext.define('MNG.data.reader.JsonObject', {
    extend:'Ext.data.reader.Json',
    alias:'reader.jsonobject',

    root:'data',

    constructor:function (config) {
        var me = this;

        Ext.apply(me, config || {});
        //console.log('jsonobject start...');
        me.callParent([config]);
    },

    getResponseData:function (response) {

        //console.log('my get response data...');
        var me = this;

        var data = [];
        try {
            var result = Ext.decode(response.responseText);
            var root = me.getRoot(result);
            var org_root = root;

            if (Ext.isArray(org_root)) {
                if (org_root.length == 1) {
                    root = org_root[0];
                } else {
                    root = {};
                }
            }

            if (me.rows) {
                Ext.Object.each(me.rows, function (key, rowdef) {
                    if (Ext.isDefined(root[key])) {
                        data.push({key:key, value:root[key]});
                    } else if (Ext.isDefined(rowdef.defaultValue)) {
                        data.push({key:key, value:rowdef.defaultValue});
                    } else if (rowdef.required) {
                        data.push({key:key, value:undefined});
                    }
                });
            } else {
                Ext.Object.each(root, function (key, value) {
                    data.push({key:key, value:value });
                });
            }

            return me.readRecords(data);
        }
        catch (ex) {

            var error = new Ext.data.ResultSet({
                total  : 0,
                count  : 0,
                records: [],
                success: false,
                message: ex.message
            });

            this.fireEvent('exception', this, response, error);

            Ext.Logger.warn('Unable to parse the JSON returned by the server');
            console.log('Unable to parse the JSON returned by the server');

//            Ext.Error.raise({
//                response:response,
//                json:response.responseText,
//                parseError:ex,
//                msg:'Unable to parse the JSON returned by the server: ' + ex.toString()
//            });

            return error;
        }

        console.log('my get response error. should not be run to here. = ');
        return;
    }
});

// Serialize load (avoid too many parallel connections)
var mng_suspend_update = 0;
Ext.define('MNG.data.UpdateQueue', {
    singleton:true,

    constructor:function () {
        var me = this;

        var queue = [];
        var queue_idx = {};

        var idle = true;

        var start_update = function () {
            if (!idle) {
                return;
            }

            if(mng_suspend_update){
                return;
            }

            var store = queue.shift();
            if (!store) {
                return;
            }

            queue_idx[store.storeid] = null;

            idle = false;

            store.load({
                callback:function (records, operation, success) {

                    idle = true;

                }
            });

        };

        Ext.apply(me, {
            queue:function (store) {
                if (!store.storeid) {
                    throw "unable to queue store without storeid";
                }
                if (!queue_idx[store.storeid]) {
                    queue_idx[store.storeid] = store;
                    queue.push(store);
                }
                start_update();
            }
        });
    }
});
Ext.define('MNG.data.UpdateStore', {
    extend: 'Ext.data.Store',

    constructor: function(config) {
	var me = this;

	config = config || {};

	if (!config.interval) {
	    config.interval = 3000;
	}

	if (!config.storeid) {
	    throw "no storeid specified";
	}

	var load_task = new Ext.util.DelayedTask();

	var run_load_task = function() {
			MNG.data.UpdateQueue.queue(me);
			load_task.delay(config.interval, run_load_task);

	};

	Ext.apply(config, {
	    startUpdate: function() {
			run_load_task();
	    },
	    stopUpdate: function() {
			load_task.cancel();
	    }
	});

	me.callParent([config]);

	me.on('destroy', function() {
	    load_task.cancel();
	});
    }
});
Ext.define('MNG.data.DynamicObjectStore', {
    extend:'MNG.data.UpdateStore',

    constructor:function (config) {
        var me = this;

        config = config || {};

        if (!config.storeid) {
            config.storeid = 'mng-store-' + (++Ext.idSeed);
        }

        Ext.applyIf(config, {
            model:'KeyValue',
            proxy:{
                type:'mng',
                url:config.url,
                extraParams:config.extraParams,
                reader:{
                    type:'jsonobject',
                    rows:config.rows
                }
            }
        });

        me.callParent([config]);
    }
});
Ext.define('MNG.data.ObjectStore', {
    extend:'Ext.data.Store',

    constructor:function (config) {
        var me = this;

        config = config || {};

        if (!config.storeid) {
            config.storeid = 'mng-store-' + (++Ext.idSeed);
        }

        Ext.applyIf(config, {
            model:'KeyValue',
            proxy:{
                type:'mng',
                url:config.url,
                extraParams:config.extraParams,
                reader:{
                    type:'jsonobject',
                    rows:config.rows
                }
            }
        });

        me.callParent([config]);
    }
});
/* Config properties:
 * rstore: A storage to track changes
 * Only works if rstore has a model and use 'idProperty'
 */
Ext.define('MNG.data.DiffStore', {
    extend:'Ext.data.Store',

    constructor:function (config) {
        var me = this;

        config = config || {};

        if (!config.rstore) {
            throw "no rstore specified";
        }

        if (!config.rstore.model) {
            throw "no rstore model specified";
        }

        var rstore = config.rstore;

        Ext.apply(config, {
            model:rstore.model,
            proxy:{ type:'memory' }
        });

        me.callParent([config]);

        var first_load = true;

        var cond_add_item = function (data, id) {
            var olditem = me.getById(id);
            if (olditem) {
                olditem.beginEdit();
                me.model.prototype.fields.eachKey(function (field) {
                    if (olditem.data[field] !== data[field]) {
                        olditem.set(field, data[field]);
                    }
                });
                olditem.endEdit(true);
                olditem.commit();
            } else {
                var newrec = Ext.ModelMgr.create(data, me.model, id);
                var pos = (me.appendAtStart && !first_load) ? 0 : me.data.length;
                me.insert(pos, newrec);
            }
        };

        me.mon(rstore, 'load', function (s, records, success) {

            if (!success) {
                return;
            }

            me.suspendEvents();

            // remove vanished items
            (me.snapshot || me.data).each(function (olditem) {
                var item = rstore.getById(olditem.getId());
                if (!item) {
                    me.remove(olditem);
                }
            });

            rstore.each(function (item) {
                cond_add_item(item.data, item.getId());
            });

            me.filter();

            first_load = false;

            me.resumeEvents();
            me.fireEvent('datachanged', me);
            me.fireEvent('refresh', me);
        });
    }
});
Ext.define('Timezone', {
	extend:'Ext.data.Model',
	fields: ['zone'],
	proxy: {
		type: 'memory',
		reader: 'array'
	}
});
Ext.define('MNG.data.TimezoneStore', {
    extend: 'Ext.data.Store',

    statics: {
	timezones: [
	    ['Africa/Abidjan'],
	    ['Africa/Accra'],
	    ['Africa/Addis_Ababa'],
	    ['Africa/Algiers'],
	    ['Africa/Asmara'],
	    ['Africa/Bamako'],
	    ['Africa/Bangui'],
	    ['Africa/Banjul'],
	    ['Africa/Bissau'],
	    ['Africa/Blantyre'],
	    ['Africa/Brazzaville'],
	    ['Africa/Bujumbura'],
	    ['Africa/Cairo'],
	    ['Africa/Casablanca'],
	    ['Africa/Ceuta'],
	    ['Africa/Conakry'],
	    ['Africa/Dakar'],
	    ['Africa/Dar_es_Salaam'],
	    ['Africa/Djibouti'],
	    ['Africa/Douala'],
	    ['Africa/El_Aaiun'],
	    ['Africa/Freetown'],
	    ['Africa/Gaborone'],
	    ['Africa/Harare'],
	    ['Africa/Johannesburg'],
	    ['Africa/Kampala'],
	    ['Africa/Khartoum'],
	    ['Africa/Kigali'],
	    ['Africa/Kinshasa'],
	    ['Africa/Lagos'],
	    ['Africa/Libreville'],
	    ['Africa/Lome'],
	    ['Africa/Luanda'],
	    ['Africa/Lubumbashi'],
	    ['Africa/Lusaka'],
	    ['Africa/Malabo'],
	    ['Africa/Maputo'],
	    ['Africa/Maseru'],
	    ['Africa/Mbabane'],
	    ['Africa/Mogadishu'],
	    ['Africa/Monrovia'],
	    ['Africa/Nairobi'],
	    ['Africa/Ndjamena'],
	    ['Africa/Niamey'],
	    ['Africa/Nouakchott'],
	    ['Africa/Ouagadougou'],
	    ['Africa/Porto-Novo'],
	    ['Africa/Sao_Tome'],
	    ['Africa/Tripoli'],
	    ['Africa/Tunis'],
	    ['Africa/Windhoek'],
	    ['America/Adak'],
	    ['America/Anchorage'],
	    ['America/Anguilla'],
	    ['America/Antigua'],
	    ['America/Araguaina'],
	    ['America/Argentina/Buenos_Aires'],
	    ['America/Argentina/Catamarca'],
	    ['America/Argentina/Cordoba'],
	    ['America/Argentina/Jujuy'],
	    ['America/Argentina/La_Rioja'],
	    ['America/Argentina/Mendoza'],
	    ['America/Argentina/Rio_Gallegos'],
	    ['America/Argentina/Salta'],
	    ['America/Argentina/San_Juan'],
	    ['America/Argentina/San_Luis'],
	    ['America/Argentina/Tucuman'],
	    ['America/Argentina/Ushuaia'],
	    ['America/Aruba'],
	    ['America/Asuncion'],
	    ['America/Atikokan'],
	    ['America/Bahia'],
	    ['America/Bahia_Banderas'],
	    ['America/Barbados'],
	    ['America/Belem'],
	    ['America/Belize'],
	    ['America/Blanc-Sablon'],
	    ['America/Boa_Vista'],
	    ['America/Bogota'],
	    ['America/Boise'],
	    ['America/Cambridge_Bay'],
	    ['America/Campo_Grande'],
	    ['America/Cancun'],
	    ['America/Caracas'],
	    ['America/Cayenne'],
	    ['America/Cayman'],
	    ['America/Chicago'],
	    ['America/Chihuahua'],
	    ['America/Costa_Rica'],
	    ['America/Cuiaba'],
	    ['America/Curacao'],
	    ['America/Danmarkshavn'],
	    ['America/Dawson'],
	    ['America/Dawson_Creek'],
	    ['America/Denver'],
	    ['America/Detroit'],
	    ['America/Dominica'],
	    ['America/Edmonton'],
	    ['America/Eirunepe'],
	    ['America/El_Salvador'],
	    ['America/Fortaleza'],
	    ['America/Glace_Bay'],
	    ['America/Godthab'],
	    ['America/Goose_Bay'],
	    ['America/Grand_Turk'],
	    ['America/Grenada'],
	    ['America/Guadeloupe'],
	    ['America/Guatemala'],
	    ['America/Guayaquil'],
	    ['America/Guyana'],
	    ['America/Halifax'],
	    ['America/Havana'],
	    ['America/Hermosillo'],
	    ['America/Indiana/Indianapolis'],
	    ['America/Indiana/Knox'],
	    ['America/Indiana/Marengo'],
	    ['America/Indiana/Petersburg'],
	    ['America/Indiana/Tell_City'],
	    ['America/Indiana/Vevay'],
	    ['America/Indiana/Vincennes'],
	    ['America/Indiana/Winamac'],
	    ['America/Inuvik'],
	    ['America/Iqaluit'],
	    ['America/Jamaica'],
	    ['America/Juneau'],
	    ['America/Kentucky/Louisville'],
	    ['America/Kentucky/Monticello'],
	    ['America/La_Paz'],
	    ['America/Lima'],
	    ['America/Los_Angeles'],
	    ['America/Maceio'],
	    ['America/Managua'],
	    ['America/Manaus'],
	    ['America/Marigot'],
	    ['America/Martinique'],
	    ['America/Matamoros'],
	    ['America/Mazatlan'],
	    ['America/Menominee'],
	    ['America/Merida'],
	    ['America/Mexico_City'],
	    ['America/Miquelon'],
	    ['America/Moncton'],
	    ['America/Monterrey'],
	    ['America/Montevideo'],
	    ['America/Montreal'],
	    ['America/Montserrat'],
	    ['America/Nassau'],
	    ['America/New_York'],
	    ['America/Nipigon'],
	    ['America/Nome'],
	    ['America/Noronha'],
	    ['America/North_Dakota/Center'],
	    ['America/North_Dakota/New_Salem'],
	    ['America/Ojinaga'],
	    ['America/Panama'],
	    ['America/Pangnirtung'],
	    ['America/Paramaribo'],
	    ['America/Phoenix'],
	    ['America/Port-au-Prince'],
	    ['America/Port_of_Spain'],
	    ['America/Porto_Velho'],
	    ['America/Puerto_Rico'],
	    ['America/Rainy_River'],
	    ['America/Rankin_Inlet'],
	    ['America/Recife'],
	    ['America/Regina'],
	    ['America/Resolute'],
	    ['America/Rio_Branco'],
	    ['America/Santa_Isabel'],
	    ['America/Santarem'],
	    ['America/Santiago'],
	    ['America/Santo_Domingo'],
	    ['America/Sao_Paulo'],
	    ['America/Scoresbysund'],
	    ['America/Shiprock'],
	    ['America/St_Barthelemy'],
	    ['America/St_Johns'],
	    ['America/St_Kitts'],
	    ['America/St_Lucia'],
	    ['America/St_Thomas'],
	    ['America/St_Vincent'],
	    ['America/Swift_Current'],
	    ['America/Tegucigalpa'],
	    ['America/Thule'],
	    ['America/Thunder_Bay'],
	    ['America/Tijuana'],
	    ['America/Toronto'],
	    ['America/Tortola'],
	    ['America/Vancouver'],
	    ['America/Whitehorse'],
	    ['America/Winnipeg'],
	    ['America/Yakutat'],
	    ['America/Yellowknife'],
	    ['Antarctica/Casey'],
	    ['Antarctica/Davis'],
	    ['Antarctica/DumontDUrville'],
	    ['Antarctica/Macquarie'],
	    ['Antarctica/Mawson'],
	    ['Antarctica/McMurdo'],
	    ['Antarctica/Palmer'],
	    ['Antarctica/Rothera'],
	    ['Antarctica/South_Pole'],
	    ['Antarctica/Syowa'],
	    ['Antarctica/Vostok'],
	    ['Arctic/Longyearbyen'],
	    ['Asia/Aden'],
	    ['Asia/Almaty'],
	    ['Asia/Amman'],
	    ['Asia/Anadyr'],
	    ['Asia/Aqtau'],
	    ['Asia/Aqtobe'],
	    ['Asia/Ashgabat'],
	    ['Asia/Baghdad'],
	    ['Asia/Bahrain'],
	    ['Asia/Baku'],
	    ['Asia/Bangkok'],
	    ['Asia/Beirut'],
	    ['Asia/Bishkek'],
	    ['Asia/Brunei'],
	    ['Asia/Choibalsan'],
	    ['Asia/Chongqing'],
	    ['Asia/Colombo'],
	    ['Asia/Damascus'],
	    ['Asia/Dhaka'],
	    ['Asia/Dili'],
	    ['Asia/Dubai'],
	    ['Asia/Dushanbe'],
	    ['Asia/Gaza'],
	    ['Asia/Harbin'],
	    ['Asia/Ho_Chi_Minh'],
	    ['Asia/Hong_Kong'],
	    ['Asia/Hovd'],
	    ['Asia/Irkutsk'],
	    ['Asia/Jakarta'],
	    ['Asia/Jayapura'],
	    ['Asia/Jerusalem'],
	    ['Asia/Kabul'],
	    ['Asia/Kamchatka'],
	    ['Asia/Karachi'],
	    ['Asia/Kashgar'],
	    ['Asia/Kathmandu'],
	    ['Asia/Kolkata'],
	    ['Asia/Krasnoyarsk'],
	    ['Asia/Kuala_Lumpur'],
	    ['Asia/Kuching'],
	    ['Asia/Kuwait'],
	    ['Asia/Macau'],
	    ['Asia/Magadan'],
	    ['Asia/Makassar'],
	    ['Asia/Manila'],
	    ['Asia/Muscat'],
	    ['Asia/Nicosia'],
	    ['Asia/Novokuznetsk'],
	    ['Asia/Novosibirsk'],
	    ['Asia/Omsk'],
	    ['Asia/Oral'],
	    ['Asia/Phnom_Penh'],
	    ['Asia/Pontianak'],
	    ['Asia/Pyongyang'],
	    ['Asia/Qatar'],
	    ['Asia/Qyzylorda'],
	    ['Asia/Rangoon'],
	    ['Asia/Riyadh'],
	    ['Asia/Sakhalin'],
	    ['Asia/Samarkand'],
	    ['Asia/Seoul'],
	    ['Asia/Shanghai'],
	    ['Asia/Singapore'],
	    ['Asia/Taipei'],
	    ['Asia/Tashkent'],
	    ['Asia/Tbilisi'],
	    ['Asia/Tehran'],
	    ['Asia/Thimphu'],
	    ['Asia/Tokyo'],
	    ['Asia/Ulaanbaatar'],
	    ['Asia/Urumqi'],
	    ['Asia/Vientiane'],
	    ['Asia/Vladivostok'],
	    ['Asia/Yakutsk'],
	    ['Asia/Yekaterinburg'],
	    ['Asia/Yerevan'],
	    ['Atlantic/Azores'],
	    ['Atlantic/Bermuda'],
	    ['Atlantic/Canary'],
	    ['Atlantic/Cape_Verde'],
	    ['Atlantic/Faroe'],
	    ['Atlantic/Madeira'],
	    ['Atlantic/Reykjavik'],
	    ['Atlantic/South_Georgia'],
	    ['Atlantic/St_Helena'],
	    ['Atlantic/Stanley'],
	    ['Australia/Adelaide'],
	    ['Australia/Brisbane'],
	    ['Australia/Broken_Hill'],
	    ['Australia/Currie'],
	    ['Australia/Darwin'],
	    ['Australia/Eucla'],
	    ['Australia/Hobart'],
	    ['Australia/Lindeman'],
	    ['Australia/Lord_Howe'],
	    ['Australia/Melbourne'],
	    ['Australia/Perth'],
	    ['Australia/Sydney'],
	    ['Europe/Amsterdam'],
	    ['Europe/Andorra'],
	    ['Europe/Athens'],
	    ['Europe/Belgrade'],
	    ['Europe/Berlin'],
	    ['Europe/Bratislava'],
	    ['Europe/Brussels'],
	    ['Europe/Bucharest'],
	    ['Europe/Budapest'],
	    ['Europe/Chisinau'],
	    ['Europe/Copenhagen'],
	    ['Europe/Dublin'],
	    ['Europe/Gibraltar'],
	    ['Europe/Guernsey'],
	    ['Europe/Helsinki'],
	    ['Europe/Isle_of_Man'],
	    ['Europe/Istanbul'],
	    ['Europe/Jersey'],
	    ['Europe/Kaliningrad'],
	    ['Europe/Kiev'],
	    ['Europe/Lisbon'],
	    ['Europe/Ljubljana'],
	    ['Europe/London'],
	    ['Europe/Luxembourg'],
	    ['Europe/Madrid'],
	    ['Europe/Malta'],
	    ['Europe/Mariehamn'],
	    ['Europe/Minsk'],
	    ['Europe/Monaco'],
	    ['Europe/Moscow'],
	    ['Europe/Oslo'],
	    ['Europe/Paris'],
	    ['Europe/Podgorica'],
	    ['Europe/Prague'],
	    ['Europe/Riga'],
	    ['Europe/Rome'],
	    ['Europe/Samara'],
	    ['Europe/San_Marino'],
	    ['Europe/Sarajevo'],
	    ['Europe/Simferopol'],
	    ['Europe/Skopje'],
	    ['Europe/Sofia'],
	    ['Europe/Stockholm'],
	    ['Europe/Tallinn'],
	    ['Europe/Tirane'],
	    ['Europe/Uzhgorod'],
	    ['Europe/Vaduz'],
	    ['Europe/Vatican'],
	    ['Europe/Vienna'],
	    ['Europe/Vilnius'],
	    ['Europe/Volgograd'],
	    ['Europe/Warsaw'],
	    ['Europe/Zagreb'],
	    ['Europe/Zaporozhye'],
	    ['Europe/Zurich'],
	    ['Indian/Antananarivo'],
	    ['Indian/Chagos'],
	    ['Indian/Christmas'],
	    ['Indian/Cocos'],
	    ['Indian/Comoro'],
	    ['Indian/Kerguelen'],
	    ['Indian/Mahe'],
	    ['Indian/Maldives'],
	    ['Indian/Mauritius'],
	    ['Indian/Mayotte'],
	    ['Indian/Reunion'],
	    ['Pacific/Apia'],
	    ['Pacific/Auckland'],
	    ['Pacific/Chatham'],
	    ['Pacific/Chuuk'],
	    ['Pacific/Easter'],
	    ['Pacific/Efate'],
	    ['Pacific/Enderbury'],
	    ['Pacific/Fakaofo'],
	    ['Pacific/Fiji'],
	    ['Pacific/Funafuti'],
	    ['Pacific/Galapagos'],
	    ['Pacific/Gambier'],
	    ['Pacific/Guadalcanal'],
	    ['Pacific/Guam'],
	    ['Pacific/Honolulu'],
	    ['Pacific/Johnston'],
	    ['Pacific/Kiritimati'],
	    ['Pacific/Kosrae'],
	    ['Pacific/Kwajalein'],
	    ['Pacific/Majuro'],
	    ['Pacific/Marquesas'],
	    ['Pacific/Midway'],
	    ['Pacific/Nauru'],
	    ['Pacific/Niue'],
	    ['Pacific/Norfolk'],
	    ['Pacific/Noumea'],
	    ['Pacific/Pago_Pago'],
	    ['Pacific/Palau'],
	    ['Pacific/Pitcairn'],
	    ['Pacific/Pohnpei'],
	    ['Pacific/Port_Moresby'],
	    ['Pacific/Rarotonga'],
	    ['Pacific/Saipan'],
	    ['Pacific/Tahiti'],
	    ['Pacific/Tarawa'],
	    ['Pacific/Tongatapu'],
	    ['Pacific/Wake'],
	    ['Pacific/Wallis']
	]
    },

    constructor: function(config) {
		var me = this;

		config = config || {};

		Ext.apply(config, {
			model: 'Timezone',
			data: MNG.data.TimezoneStore.timezones
		});

		me.callParent([config]);	
    }
});
Ext.define('MNG.grid.ObjectGrid', {
    extend:'Ext.grid.GridPanel',
    alias:['widget.mngObjectGrid'],

    getObjectValue:function (key, defaultValue) {
        var me = this;
        var rec = me.store.getById(key);
        if (rec) {
            return rec.data.value;
        }
        return defaultValue;
    },

    renderKey:function (key, metaData, record, rowIndex, colIndex, store) {
        var me = this;
        var rows = me.rows;
        var rowdef = (rows && rows[key]) ? rows[key] : {};
        return rowdef.header || key;
    },

    renderValue:function (value, metaData, record, rowIndex, colIndex, store) {
        var me = this;
        var rows = me.rows;
        var key = record.data.key;
        var rowdef = (rows && rows[key]) ? rows[key] : {};

        var renderer = rowdef.renderer;
        if (renderer) {
            return renderer(value, metaData, record, rowIndex, colIndex, store);
        }

        return value;
    },

    initComponent:function () {
        var me = this;

        var rows = me.rows;
        if (!me.rstore) {
            if (!me.url) {
                throw "no url specified";
            }
			if (!me.interval) {
				me.rstore = Ext.create('MNG.data.ObjectStore', {
					url:me.url,
					extraParams:me.extraParams,
					rows:me.rows
				});
			} else {
				me.rstore = Ext.create('MNG.data.DynamicObjectStore', {
					url:me.url,
					interval:me.interval,
					extraParams:me.extraParams,
					rows:me.rows
				})
			}
        }

        var rstore = me.rstore;

        var store = Ext.create('MNG.data.DiffStore', { rstore:rstore });

        if (rows) {
            Ext.Object.each(rows, function (key, rowdef) {
                if (Ext.isDefined(rowdef.defaultValue)) {
                    store.add({ key:key, value:rowdef.defaultValue });
                } else if (rowdef.required) {
                    store.add({ key:key, value:undefined });
                }
            });
        }

        if (me.sorterFn) {
            store.sorters.add(new Ext.util.Sorter({
                sorterFn:me.sorterFn
            }));
        }

        store.filters.add(new Ext.util.Filter({
            filterFn:function (item) {
                if (rows) {
                    var rowdef = rows[item.data.key];
                    if (!rowdef || (rowdef.visible === false)) {
                        return false;
                    }
                }
                return true;
            }
        }));

        MNG.Utils.monStoreErrors(me, rstore);

        Ext.applyIf(me, {
            store:store,
            hideHeaders:true,
            stateful:false,
            columns:[
                {
                    header:'Name',
                    width:me.cwidth1 || 100,
                    dataIndex:'key',
                    renderer:me.renderKey
                },
                {
                    flex:1,
                    header:'Value',
                    dataIndex:'value',
                    renderer:me.renderValue
                }
            ]
        });

        me.callParent();
    }
});
Ext.define('MNG.panel.InputPanel', {
    extend:'Ext.panel.Panel',
    alias:['widget.inputpanel'],

    border:false,

    // overwrite this to modify submit data


    onGetValues:function (values) {
        return values;
    },

    getValues:function (dirtyOnly) {
        var me = this;

        if (Ext.isFunction(me.onGetValues)) {
            dirtyOnly = false;
        }

        var values = {};

        Ext.Array.each(me.query('[isFormField]'), function (field) {
            if (!dirtyOnly || field.isDirty()) {
                MNG.Utils.assemble_field_data(values, field.getSubmitData());
            }
        });

        return me.onGetValues(values);
    },

    setValues:function (values) {
        var me = this;

        var form = me.up('form');

        Ext.iterate(values, function (fieldId, val) {
            var field = me.query('[isFormField][name=' + fieldId + ']')[0];
            if (field) {
                field.setValue(val);
                if (form.trackResetOnLoad) {
                    field.resetOriginalValue();
                }
            }
        });
    },

    initComponent:function () {
        var me = this;

        var items;

		if (me.tips.enabled) {
			//if (!me.tips.icon){
			//	me.tips.icon = '/ovp2/images/about.png'
			//}

			if (!me.tips.text){
				me.tips.text =  'this is a normal tip.'
			}

			if (!me.tips.html) {
				me.tips.html = '<img src="' + me.tips.icon + '"/><a>  ' + me.tips.text + '</a>';
			}
		}

        if (me.items) {
            me.columns = 1;
            items = [
                {
                    columnWidth:1,
                    layout:'anchor',
                    items:me.items
                }
            ];
            me.items = undefined;
        } else if (me.column1) {
            me.columns = 2;
            items = [
                {
                    columnWidth:0.5,
                    padding:'0 10 0 0',
                    layout:'anchor',
                    items:me.column1
                },
                {
                    columnWidth:0.5,
                    padding:'0 0 0 10',
                    layout:'anchor',
                    items:me.column2 || [] // allow empty column
                }
            ];
        } else {
            throw "unsupported config";
        }
		var total_items = [];
		if (me.tips.enabled) {
			total_items.push(
				{
					xtype:"panel",
					padding:5,
					align:'center',
					html:me.tips.html,
					bodyPadding:5
				}
			);
		}
        if (me.useFieldContainer) {
			total_items.push(
				Ext.apply(me.useFieldContainer, {
					layout:'column',
					defaultType:'container',
					items:items,
					padding:5
				})
			);
        } else {
			total_items.push(
				{
					layout:'column',
					border:false,
					defaultType:'container',
					padding:5,
					items:items
				}
			);
        }
		Ext.apply(me, {
			layout:{
				type:'vbox',
				align:'stretch'
			},
			items:total_items
		});

        me.callParent();
    }
});
Ext.define('MNG.panel.Config', {
    extend:'Ext.panel.Panel',
    alias:'widget.mngPanelConfig',

    initComponent:function () {
        var me = this;

        var stateid = me.hstateid;

        var sp = Ext.state.Manager.getProvider();

        var activeTab;

        if (stateid) {
            var state = sp.get(stateid);
            if (state && state.value) {
                activeTab = state.value;
            }
        }

        var items = me.items || [];
        me.items = undefined;

        var tbar = me.tbar || [];
        me.tbar = undefined;

        var title = me.title;
        me.title = undefined;

        tbar.unshift('->');
        tbar.unshift({
            xtype:'tbtext',
            text:title,
            baseCls:'x-panel-header-text',
            padding:'0 0 5 0'
        });

        var toolbar = Ext.create('Ext.toolbar.Toolbar', {
            items:tbar,
            style:'border:0px;',
            height:28
        });

        var tab = Ext.create('Ext.tab.Panel', {
            flex:1,
            border:true,
			activeTab:activeTab,
            defaults:Ext.apply(me.defaults || {}, {
                viewFilter:me.viewFilter,
                workspace:me.workspace,
                border:false
            }),
            items:items,
            listeners:{
                afterrender:function (tp) {
                    var first = tp.items.get(0);
                    if (first) {
                        first.fireEvent('show', first);
                    }
                },
                tabchange:function (tp, newcard, oldcard) {
                    var ntab = newcard.itemId;
                    // Note: '' is alias for first tab.
                    // First tab can be 'search' or something else
                    if (newcard.itemId === items[0].itemId) {
                        ntab = '';
                    }
                    var state = { value:ntab };
                    if (stateid) {
                        sp.set(stateid, state);
                    }
                }
            }
        });

        Ext.apply(me, {
            layout:{ type:'vbox', align:'stretch' },
            items:[ toolbar, tab]
        });

        me.callParent();

        var statechange = function (sp, key, state) {
            if (stateid && key === stateid) {
                var atab = tab.getActiveTab().itemId;
                var ntab = state.value || items[0].itemId;
                if (state && ntab && (atab != ntab)) {
                    tab.setActiveTab(ntab);
                }
            }
        };

        if (stateid) {
            me.mon(sp, 'statechange', statechange);
        }
    }
});
Ext.define('MNG.form.ComboBox', {
    extend: 'Ext.form.field.ComboBox',
    alias: 'widget.mngComboBox',

    deleteEmpty: true,
    
    getSubmitData: function() {
        var me = this,
            data = null,
            val;
        if (!me.disabled && me.submitValue) {
            val = me.getSubmitValue();
            if (val !== null && val !== '') {
                data = {};
                data[me.getName()] = val;
            } else if (me.deleteEmpty) {
                data = {};
                data['delete'] = me.getName();
            }
        }
        return data;
    },
    initComponent: function() {
        var me = this;

        me.store = Ext.create('Ext.data.ArrayStore', {
            model: 'KeyValue',
            data : me.data
        });

        Ext.apply(me, {
            displayField: 'value',
            valueField: 'key',
            queryMode: 'local',
            editable: false
        });
        me.callParent();
    }
});
Ext.define('MNG.form.LanguageSelector', {
    extend: 'MNG.form.ComboBox',
    alias: ['widget.mngLanguageSelector'],
    initComponent: function() {
		var me = this;
		me.data = MNG.Utils.language_array();
		me.callParent();
    }
});Ext.define('MNG.tree.Navigator', {
	extend:'Ext.tree.Panel',
	alias:'widget.mngNavigator',
	selectExpand:function (node) {
		var me = this;
		var sm = me.getSelectionModel();
		sm.fireEvent('selectionchange', sm, [node]);
		me.setActive(true, node);
		var cn = node;
		while (!!(cn = cn.parentNode)) {
			if (!cn.isExpanded()) {
				cn.expand();
			}
		}
	},
	selectById:function (nodeid) {
		var me = this;
		var rootnode = me.getRootNode();
		var sm = me.getSelectionModel();
		var node;
		if (nodeid === 'root') {
			node = rootnode;
		} else {
			node = rootnode.findChild('id', nodeid, true);
		}
		if (node) {
			me.selectExpand(node);
			sm.select(node);
		}
	},

	applyState:function (state) {
		var me = this;
		var sm = me.getSelectionModel();
		if (state && state.value) {
			me.selectById(state.value);
		} else {
			me.selectById('localConfig');
		}   
	},
		
	initComponent: function () {
		var me = this;
		var sp = Ext.state.Manager.getProvider();
		var stateid = 'vid';
		
		
		me.store = Ext.create('Ext.data.TreeStore', {
			root: {
				children: [

					{text:gettext('系统配置'), children:[
						{icon: '/images/local_config.png',text:gettext('本地配置'), id:'localConfig',  leaf:true},

					]},

                    {text:gettext('用户管理'), children: [
                        {icon: '/images/user.png',text:gettext('用户'), id:'user', leaf:true},
                    ]},   					

				]
			}
		});
		
	
		Ext.apply(me, {
			title: gettext('导航'),
			height:'100%',
			rootVisible:false,
			//resizable: true,
			//collapsible:true,
			bodyStyle:'overflow-y:scroll',
			layout: 'auto',
			store:me.store
		});
		
		//加载
		me.callParent();
		var sm = me.getSelectionModel();
		sm.ignoreRightMouseSelection = true;
		sm.on('select', function (sm, n) {
			sp.set(stateid, { value:n.data.id});
		});
	}
});
Ext.define('MNG.window.LoginWindow', {
    extend:'Ext.window.Window',
    
    onLogon:function () {
        var me = this;

        var form = me.getComponent(1).getForm();

        if (form.isValid()) {
            me.el.mask(gettext('Please wait...'), 'x-mask-loading');

            form.submit({
                failure:function (f, resp) {
                    me.el.unmask();
                    if (Ext.decode(resp.response.responseText)['meta'].errorType == 'not administrator'){
                        Ext.MessageBox.alert(gettext('Error'),
                            gettext("not administrator"),
                            function () {
                                var uf = form.findField('username');
                                uf.focus(true, true);
                            });
                    }else if (Ext.decode(resp.response.responseText)['meta'].errorType == 'expired user'){
                        Ext.MessageBox.alert(gettext('Error'),
                            gettext("user already expired"),
                            function () {
                                var uf = form.findField('username');
                                uf.focus(true, true);
                            });
                    }else if (Ext.decode(resp.response.responseText)['meta'].errorType == 'disabled user'){
                        Ext.MessageBox.alert(gettext('Error'),
                            gettext("user is disabled"),
                            function () {
                                var uf = form.findField('username');
                                uf.focus(true, true);
                            });
                    }else {
                        Ext.MessageBox.alert(gettext('Error'),
                            gettext("Username and password verify failed. Please try again"),
                            function () {
                                var uf = form.findField('username');
                                uf.focus(true, true);
                            });
                    }
                    
                },
                success:function (f, resp) {
                    me.el.unmask();
                    var remember = me.down('#remember');
                    if (remember.getValue()) {
                        Ext.util.Cookies.set('local_user', me.down('#username').getValue());
                        Ext.util.Cookies.set('local_remember', me.down('#remember').getValue());
                    } else {
                        Ext.util.Cookies.clear('local_user');
                        Ext.util.Cookies.clear('local_remember');
                    }
                    var handler = me.handler || Ext.emptyFn;
                    handler.call(me, resp.result.data);
                    me.close();
                }
            });
        }
    },

    initComponent:function () {
        var me = this;
        if(!me.viewport){
            throw "viewport must setted!";
        }

        var buttons = [];

        if(Ext.isIE){
            buttons.push({
                xtype:'box',
                html:gettext('Detected you are using IE, we strongly recommend you use Chrome or Firefox to access this system'),
                style:{
                    color:'red'
                },
                flex:1
            });
        }

        var local_user = Ext.util.Cookies.get('local_user');
        var local_remember = Ext.util.Cookies.get('local_remember');

        buttons.push({
            xtype:'checkbox',
            id:'remember',
            boxLabel:gettext('记住登录用户名'),
            margin:'0 40 0 0',
            checked:local_remember
        },{
            xtype:'button',
            text:gettext('登录'),
            handler:function () {
                me.onLogon();
            }
        });
        Ext.apply(me, {
            width:368,
            modal:true,
            border:false,
            draggable:true,
            closable:false,
            shadow:true,
            shadowOffset:10,
            resizable:false,
            layout:{
                type:'vbox',
                align:'stretch'
            },
            header:false,

            //title:gettext('Orchestra Virtual Platform Login'),
            title:false,
            items:[
                {
                    xtype:"component",
                    html:'<img src="images/login-image.png"/>',
                    style:'background-color:#fff',
                    width:204,
                    height:118,
                    region:'center',

                },
                {
                    xtype:'form',
                    frame:false,
                    style:'background-color:#fff',
                    border:false,
                    url:'/mng/login',

                    items:[
                        {
                            xtype:'fieldcontainer',
                            layout:{
                                type:'vbox',
                                align:'center'
                            },
                            defaults:{
                                allowBlank:false
                            },
                            items:[
                                {
                                    xtype:'textfield',
                                    fieldLabel:gettext('用户'),
                                    //cls:'login-text-field',
                                    labelAlign:'left',
                                    padding:'5 10 5 10',
                                    name:'username',
                                    id:'username',
                                    width:'100%',
                                    blankText:gettext("请输入用户名"),
                                    allowBlank:false,
                                    value:local_user,
                                    //vtype:'Username',
                                    listeners:{
                                        afterrender:function (f) {
                                            // Note: only works if we pass delay 1000
                                            f.focus(true, 1000);
                                        },
                                        specialkey:function (f, e) {
                                            if (e.getKey() === e.ENTER) {
                                                var pf = me.query('textfield[name="password"]')[0];
                                                if (pf.getValue()) {
                                                    me.onLogon();
                                                } else {
                                                    pf.focus(false);
                                                }
                                            }
                                        }
                                    }
                                },
                                
                                {
                                    xtype:'textfield',
                                    padding:'5 10 5 10',
                                    inputType:'password',
                                    labelAlign:"left",
                                    fieldLabel:gettext('密码'),
                                    width: '100%',
                                    name:'password',
                                    allowBlank:false,
                                    //vtype:'Password',
                                    blankText:gettext("请输入用户密码"),
                                    listeners:{
                                        specialkey:function (field, e) {
                                            if (e.getKey() === e.ENTER) {
                                                me.onLogon();
                                            }
                                        }
                                    }
                                },
                                /*
                                {
                                    xtype:'mngLanguageSelector',
                                    padding:'5 10 5 10',
                                    labelAlign:"left",
                                    fieldLabel:gettext('Language'),
                                    width: '100%',
                                    value:Ext.util.Cookies.get('LangCookie') || 'zh_CN' || 'zh_TW' ,
                                    name:'lang',
                                    submitValue:false,
                                    listeners:{
                                        change:function (t, value) {
                                            var dt = Ext.Date.add(new Date(), Ext.Date.YEAR, 10);
                                            Ext.util.Cookies.set('LangCookie', value, dt);
                                            me.el.mask(gettext('Please wait...'), 'x-mask-loading');
                                            window.location.reload();
                                        }
                                    }
                                }
                                */
                            ]
                        }
                    ],
                    buttons:buttons
                }

            ]
        });
  
        me.callParent();
    
        window.onresize = function () {
            me.center();
        }

    }
});Ext.define('MNG.window.Edit', {
    extend:'Ext.window.Window',
    alias:'widget.mngWindowEdit',

    resizable:false,

    // use this tio atimatically generate a title like
    // Create: <subject>
    subject:undefined,

    // set create to true if you want a Create button (instead 
    // OK and RESET) 
    create:false,

    // set to true if you want an Add button (instead of Create)
    isAdd:false,

    isValid:function () {
        var me = this;

        var form = me.formPanel.getForm();
        return form.isValid();
    },

    getValues:function (dirtyOnly) {
        var me = this;

        var values = {};

        var form = me.formPanel.getForm();

        form.getFields().each(function (field) {
            if (!field.up('inputpanel') && (!dirtyOnly || field.isDirty())) {
                MNG.Utils.assemble_field_data(values, field.getSubmitData());
            }
        });

        Ext.Array.each(me.query('inputpanel'), function (panel) {
            MNG.Utils.assemble_field_data(values, panel.getValues(dirtyOnly));
        });

        return values;
    },

    setValues:function (values) {
        var me = this;

        var form = me.formPanel.getForm();

        Ext.iterate(values, function (fieldId, val) {
            var field = form.findField(fieldId);
            if (field && !field.up('inputpanel')) {
                field.setValue(val);
                if (form.trackResetOnLoad) {
                    field.resetOriginalValue();
                }
            }
        });

        Ext.Array.each(me.query('inputpanel'), function (panel) {
            panel.setValues(values);
        });
    },

    submit:function () {
        var me = this;

        var form = me.formPanel.getForm();

        var values = me.getValues();
        Ext.Object.each(values, function (name, val) {
            if (values.hasOwnProperty(name)) {
                if (Ext.isArray(val) && !val.length) {
                    values[name] = '';
                }
            }
        });

        if (me.digest) {
            values.digest = me.digest;
        }

        MNG.Utils.Request({
            url:me.url,
            waitMsgTarget:me,
            method:me.method || 'PUT',
            params:values,
            failure:function (response, options) {
                var result, meta;
                try {
                    result = Ext.decode(response.responseText);
                    meta = result.meta;
                } catch (e) {
                    if (response.status == 502 || response.status == 504) {
                        
                    }
                };
                if (response.status == 405) {
                    if (Ext.decode(response.responseText).meta.errorType == "xxx") {
                        Ext.Msg.alert(gettext('Error'), 
                            Ext.String.format(gettext('xxxxxx')));
                    }                  
                } else if (response.status == 505) {
                    if (meta && meta.errorType == 'modify_vm') {
                        Ext.Msg.alert(gettext('Error'), 
                            Ext.String.format(gettext('modify VM failed, VM is running')));
                    }
                } else if (response.status == 400) {
                    if (meta && meta.errorType == 'xxx') {
                        Ext.Msg.alert(gettext('Error'), 
                            Ext.String.format(gettext('xxx')));
                    } else if (meta && meta.errorType == 'xxxxxx') {
                        Ext.Msg.alert(gettext('Error'), 
                            Ext.String.format(gettext('xxx {0} xxx'), '"' + meta.errorDetail + '"'));
                    } 
                }
            },
            success:function (response, options) {
                me.successCallback && me.successCallback(response, options);
                me.close();
            }
        });
    },

    load:function (options) {
        var me = this;

        var form = me.formPanel.getForm();

        options = options || {};

        var newopts = Ext.apply({
            waitMsgTarget:me
        }, options);

        var createWrapper = function (successFn) {
            Ext.apply(newopts, {
                url:me.url,
                method:'GET',
                success:function (response, opts) {
                    form.clearInvalid();
                    me.digest = response.result.data.digest;
                    if (successFn) {
                        successFn(response, opts);
                    } else {
                        me.setValues(response.result.data);
                    }
                    // hack: fix ExtJS bug
                    Ext.Array.each(me.query('radiofield'), function (f) {
                        f.resetOriginalValue();
                    });
                },
                failure:function (response, opts) {
                    Ext.Msg.alert(gettext('Error'), response.htmlStatus, function () {
                        me.close();
                    });
                }
            });
        };

        createWrapper(options.success);

        MNG.Utils.Request(newopts);
    },

    initComponent:function () {
        var me = this;

        if (!me.url) {
            throw "no url specified";
        }

        var items = Ext.isArray(me.items) ? me.items : [ me.items ];

        me.items = undefined;

        me.formPanel = Ext.create('Ext.form.Panel', {
            url:me.url,
            method:me.method || 'PUT',
            trackResetOnLoad:true,
            bodyPadding:10,
            border:false,
            defaults:{
                border:false
            },
            fieldDefaults:Ext.apply({}, me.fieldDefaults, {
                labelWidth:100,
                anchor:'100%'
            }),
            items:items
        });

        var form = me.formPanel.getForm();

        var submitBtn = Ext.create('Ext.Button', {
            text:me.create ? (me.isAdd ? gettext('增加') 
                : gettext('创建')) 
                : gettext('OK'),
            disabled:!me.create,
            handler:function () {
                me.submit();
            }
        });

        var resetBtn = Ext.create('Ext.Button', {
            text:gettext('重置'),
            disabled:true,
            handler:function () {
                form.reset();
            }
        });

        var set_button_status = function () {
            var valid = form.isValid();
            var dirty = form.isDirty();
            submitBtn.setDisabled(!valid || !(dirty || me.create));
            resetBtn.setDisabled(!dirty);
        };

        form.on('dirtychange', set_button_status);
        form.on('validitychange', set_button_status);

        var colwidth = me.colwidth || 300;
        if (me.fieldDefaults && me.fieldDefaults.labelWidth) {
            colwidth += me.fieldDefaults.labelWidth - 100;
        }


        var twoColumn = items[0].column1 || items[0].column2;

        if (me.subject && !me.title) {
            me.title = MNG.Utils.dialog_title(me.subject, me.create, me.isAdd);
        }

        Ext.applyIf(me, {
            modal:true,
            layout:'auto',
            width:twoColumn ? colwidth * 2 : colwidth,
            border:false,
            items:[ me.formPanel ],
            buttons:me.create ? [ submitBtn ] : [ submitBtn, resetBtn ]
        });

        me.callParent();

        // always mark invalid fields
        me.on('afterlayout', function () {
            me.isValid();
        });
    }
});Ext.define('MNG.dc.LocalConfig', {
    extend:'MNG.panel.Config',
    alias:'widget.mngLocalConfig',

    initComponent:function () {
        var me = this;
        me.items = [];

        Ext.apply(me, {
            title:gettext('本地配置'),
            hstateid:'nodetab'
        });

		me.on('hide', function () {
			me.down('#time').stopUpdate();
		});
		me.on('show', function () {
			me.down('#time').startUpdate();
		});
		me.items.push(

			{
				icon:'/images/time.png',
				title:gettext('时间'),
				itemId:'time',
				id:'time',
				xtype:'mngTimeView',
			}
		);
        me.callParent();
    }
});
Ext.define('MNG.dc.TimeView', {
    extend: 'MNG.grid.ObjectGrid',
    alias: ['widget.mngTimeView'],

    initComponent : function() {
		var me = this;
		
		var run_editor = function() {
		    var win = Ext.create('MNG.dc.TimeEdit');
		    win.show();
		};

		Ext.applyIf(me, {
		    url: "/mng/timezone",
		    cwidth1: 150,
		    interval: 1000,
		    rows: {
			timezone: { 
			    header: gettext('时区'), 
			    required: true
			},
			localtime: { 
			    header: gettext('服务器时间'), 
			    required: true
			}
		    },
		    tbar: [ 
			{
				icon:'/images/edit.png',
			    text: gettext("编辑"),
			    handler: run_editor
			}
		    ],
		    listeners: {
			itemdblclick: run_editor
		    }
		});

		me.callParent();

		Ext.apply(me, {
			startUpdate:function () {
				if (me.isVisible()) 
					me.rstore.startUpdate();
			},
			stopUpdate:function () {
				me.rstore.stopUpdate();
			}
		});

		me.on('beforeRender', me.rstore.startUpdate);
		me.on('beforeShow', me.rstore.startUpdate);
		me.on('hide', me.rstore.stopUpdate);
		me.on('destroy', me.rstore.stopUpdate);	
    }
});
Ext.define('MNG.dc.TimeEdit', {
    extend: 'MNG.window.Edit',
    alias: ['widget.mngTimeEdit'],

    initComponent : function() {
		var me = this;

		var ipanel = Ext.create('MNG.panel.InputPanel', {
			items:[{
					xtype: 'combo',
					fieldLabel: gettext('时区'),
					labelWidth:50,
					name: 'timezone',
					queryMode: 'local',
					store: new MNG.data.TimezoneStore({autoDestory: true}),
					valueField: 'zone',
					displayField: 'zone',
					triggerAction: 'all',
					forceSelection: true,
					editable: false,
					allowBlank: false
			    },
			    {
					layout: {
		                type:'hbox',
		                align:'stretch'
					},
					border:false,
					items:[
						{
							xtype:'datefield',
							width:170,
							margins:'0 18 0 0',
							labelWidth:50,
							format:'Y-m-d',
							submitValue:false,
							allowBlank:false,
							fieldLabel:gettext('日期')
						},
						{
							xtype:'timefield',
							name:'time',
							width:170,
							labelWidth:50,
							getSubmitData:function () {
								var data = {};
								var datefield = me.down('datefield');
								data[this.getName()] = Ext.Date.format(datefield.getValue(), 'Y-m-d') + ' ' + Ext.Date.format(this.getValue(), 'H:i:s');
								return data;
							},
							format:'H:i:s',
							allowBlank:false,
							fieldLabel:gettext('时间')
						}
					]
				}],
				tips: {
					icon: '/images/tips.png',
					text: gettext('注意：修改系统时间可能会导致您退出当前登陆系统！'),
					enabled:true
				}
			});
		Ext.applyIf(me, {
		    subject: gettext('时区'),
		    url: "/mng/timezone",
		    fieldDefaults: {
				labelWidth: 70
	            },
		    width: 400,
		    items: [ipanel]
		});

		me.callParent();

	me.load({
		success:function (response, opts) {
			var data = response.result.data;
			var timezone = me.down('field[name=timezone]');
			var datefield = me.down('datefield');
			var timefield = me.down('timefield');
			var time = data.localtime.split(' ');
			timezone.setValue(data.timezone);
			datefield.setValue(time[0]);
			timefield.setValue(time[1]);
			timezone.resetOriginalValue();
			datefield.resetOriginalValue();
			timefield.resetOriginalValue();
		}
	});
    }
});
Ext.define('MNG.dc.UserEdit', {
    extend: 'MNG.window.Edit',
    alias: ['widget.mngDcUserEdit'],

    isAdd: true,
	initComponent: function () {
		var me = this;
		var method, url, realm;
		me.create = !me.username;
        if (me.create) {
            url = '/mng/user';
            method = 'POST';
        } else {
            url = '/mng/user/' + me.username;
            method = 'PUT';
		}

		var verifypw;
		var pwfield;

		var validate_pw = function() {
			if (verifypw.getValue() !== pwfield.getValue()) {
			return gettext("两次输入密码不一致");
			}
			return true;
		};

		verifypw = Ext.createWidget('textfield', { 
			inputType: 'password',
			fieldLabel: gettext('确认密码'), 
			name: 'verifypassword',
			disabled: !me.create,
			hidden: !me.create,
			submitValue: false,
			vtype:'PassWord',
			validator:validate_pw
		});

		pwfield = Ext.createWidget('textfield', { 
			inputType: 'password',
			fieldLabel: gettext('密码'), 
			disabled: !me.create,
			hidden: !me.create,
			name: 'password',
			allowBlank: false,
			vtype:'PassWord',
			validator:validate_pw
		});

		var batch_num = Ext.create('Ext.form.NumberField', {
			fieldLabel:gettext('批量创建'),
			name:'batch_num',
			value:1,
			hidden:!me.create,
			allowBlank: false,
			allowDecimals: false,
		});


		var column1 = [
			{
				xtype: me.create ? 'textfield' : 'displayfield',
				height: 22, // hack: set same height as text fields
				name: 'username',
				fieldLabel: gettext('用户名'),
				maxLength: 20,
				allowBlank: false,
				vtype:'UserName',
				submitValue: me.create ? true : false
			},
			pwfield, verifypw,
			me.create ? {
				xtype:'fieldcontainer',
				layout:'hbox',
				defaultType:'radiofield',
				defaults: {
					flex:1
				},
				fieldLabel:gettext('角色'),
				items:[
					{	boxLabel:gettext('管理员'), name:'role', inputValue:'Administrator'},
					{ 	boxLabel:gettext('本地域用户'), 
						name:'role', 
						checked:true,
						inputValue:'Terminal',				
						handler:function (checkbox, checked) {
							batch_num.setVisible(checked);
						}
					}
				]
			} : {
				xtype:'displayfield',
				name:'role',
				fieldLabel: gettext('角色'),
				renderer:function (value) {
					if (value == "Terminal")
                        return gettext("本地域用户")
					return gettext(value)
				}
			},
		];

        var column2 = [
			{
				xtype: 'datefield',
				name: 'expire',
				emptyText: 'never',
				format: 'Y-m-d',
				submitFormat: 'U',
				fieldLabel: gettext('过期时间')
			},
			{
				xtype: 'textfield',
				name: 'comment',
				fieldLabel: gettext('描述')
			},

			batch_num,
			{
				xtype: 'textfield',
				name: 'email',
				vtype:'Email',
				fieldLabel: 'E-Mail',
				hidden: true
			}
		];

		var ipanel = Ext.create('MNG.panel.InputPanel', {
			tips:{
				enabled:true,
				icon: 'images/tips.png',
				text: gettext('创建/编辑用户')
			},
			column1: column1,
			column2: column2,
			onGetValues: function(values) {
				// hack: ExtJS datefield does not submit 0, so we need to set that
				if (!values.expire) {
					values.expire = 0;
				}

				//values.user= encodeURIComponent(values.user);

				if (!values.password) {
					delete values.password;
				}

				return values;
			}
		});

		Ext.applyIf(me, {
			subject: gettext('用户'),
			url: url,
			method: method,
			items: [ ipanel ]
		});

		me.callParent();

		if (!me.create) {
			me.load({
			success: function(response, options) {
				var data = response.result.data;
				if (Ext.isDefined(data.expire)) {
					if (data.expire) {
						data.expire = new Date(data.expire * 1000);
					} else {
						// display 'never' instead of '1970-01-01'
						data.expire = null;
					}
				}
				if (data.role == 'Administrator') {
					data.bduser = 0;
					bduser.setVisible(false)
				}			
				me.setValues(data);
			}});
		}
    }
});
Ext.define('MNG.dc.UserView', {
    extend:'Ext.grid.GridPanel',

    alias:['widget.mngDcUserView'],

	reload: function () {
		this.store.load();
	},
    initComponent:function () {
        var me = this;
        var store = new Ext.data.Store({
            id:"users",
            model:'mng-users',
            sorters:{
                property:'username',
                order:'DESC'
            }
        });

        //多选，编辑框变灰，
        var single_select = function(sec) {
            return sm.getSelection().length == 1;
        }

        var reload = function () {
            store.load();
        };
        //var sm = Ext.create('Ext.selection.RowModel');
        var sm = Ext.create('Ext.selection.RowModel', {mode:'MULTI'});

        
		var run_editor = function () {
            var rec = sm.getSelection()[0];
            if (!rec || rec.data.username == 'root') {
                return;
            }

            var win = Ext.create('MNG.dc.UserEdit', {
                username:rec.data.username
            });
            win.on('destroy', reload);
            win.show();
		};

        var rmlist = [];
        var filter_task = new Ext.util.DelayedTask(function () {
            store.suspendEvents();
            store.add(rmlist);
            rmlist = [];
            store.each(function (item) {
                if (textfilter && !name_filter(item)) {
                    rmlist.push(item);
                }
            });
            if (rmlist.length)
                store.remove(rmlist);
            store.resumeEvents();
            store.fireEvent('datachanged', store);
            store.fireEvent('refresh', store);
            store.clearFilter();
            store.filters.add(new Ext.util.Filter({filterFn: function(item) {
                    return decodeURIComponent(item.get("username")).match(textfilter) != null; 
                }
            }));
        });

        var name_filter = function (item) {
            var match = false;
            Ext.each(['username'], function (field) {
                var v = decodeURIComponent(item.data[field]);
                if (v !== undefined) {
                    v = v.toLowerCase();
                    if (v.indexOf(textfilter) >= 0) {
                        match = true;
                        return false;
                    }
                }
            });
            return match;
        };
        var tbar = [
            {
                icon:'/images/user_add.png',
                text:gettext('增加'),
                handler:function () {
                    var win = Ext.create('MNG.dc.UserEdit');
                    win.on('destroy', reload);
                    win.show();
                }
            },         

        ];
		
        Ext.apply(me, {
			title:gettext('用户信息'),
            store:store,
            selModel:sm,
            stateful:false,
            tbar:tbar,
            viewConfig:{
                trackOver:false
            },
            columns:[
                {
                    header:gettext('用户名'),
                    width:200,
                    sortable:true,
                    dataIndex:'username'
                },
                {
                    header:gettext('角色'),
                    width:200,
                    sortable:true,
                    dataIndex:'role',
					renderer:function (value) {
                        if (value == "Terminal")
                            return gettext("Local Domain User")
						return gettext(value)
					}
                },
                {
                    header:gettext('过期时间'),
                    width:200,
                    sortable:true,
                    renderer:MNG.Utils.format_expire,
                    dataIndex:'expire'
                },
                {
                    header:gettext('描述'),
                    sortable:true,
                    dataIndex:'comment',
                    flex:1
                },

			],
            listeners:{
                beforeRender:reload,
                itemdblclick:run_editor
            }
        });
		me.callParent();
	}
});



Ext.define("MNG.Workspace", {
	extend:"Ext.container.Viewport", 

	title :gettext('MNG Platform'),

	updateLeftTree:function () {
		var me = this;

	},
    onLogin:function () {
        var me = this;
		me.updateUserInfo();
        Ext.Function.defer(function () {
			me.getLayout().setActiveItem('main_container');
			var sp = Ext.state.Manager.getProvider();
			me.down('mngNavigator').applyState(sp.get('vid'));
			me.down('mngLocalConfig').show();			
        }, 20);
    },
	closeWindows:function () {
		var windows = Ext.ComponentQuery.query('window');
		if (windows.length > 0) {
			Ext.each(windows, function (item) {
				try {
					item.close();
				} catch (e) {
				}
			});
		}
		var menus = Ext.ComponentQuery.query('menu');
		if (menus.length > 0) {
			Ext.each(menus, function (item) {
				try {
					item.close();
				} catch (e) {
				}
			});
		}
	},
    setContent:function (comp) {
        var me = this;

        var cont = me.down('#content');
        cont.removeAll(true);

        if (comp) {
            MNG.Utils.setErrorMask(cont, false);
            comp.border = false;
            cont.add(comp);
        }
		cont.updateLayout();

    },
    updateUserInfo:function () {
        var me = this;
		var msg = "";

        var ui = me.query('#userinfo')[0];
		
		//没有登录用户
		if (!MNG.UserName) {
			ui.update('');
			ui.updateLayout();
			return;
		}
		

		
		
		//登录用户
		msg += Ext.String.format(gettext("您当前的登录用户为 {0}"), MNG.UserName);
		
		ui.update('<div class="x-unselectable" style="white-space:nowrap;">' + msg + '</div>');
        ui.updateLayout();
    },
    // private
    updateLoginData:function (loginData) {
        var me = this;
        me.loginData = loginData;
        MNG.UserName = loginData.username;


    },
	showLogin:function () {
		var me = this;
		MNG.Utils.authClear();
        MNG.Utils.userClear();
       

		if (!me.login) {
			me.login = Ext.create('MNG.window.LoginWindow', {
				viewport:me,
				handler:function (data) {
					me.login = null;
					me.updateLoginData(data);
					me.onLogin();
				}
			});
		}
		me.getLayout().setActiveItem('main_background');
		me.login.show();

		$.jqPageMonitor({
			duration: 1800 * 1000, //设置30min没有操作网页，则执行回调函数
			step: 2000	//检查间隔，建议不要设置过小
		}, function() {
			console.log("jq exit!!!!!!!!!!!!!!!!!!!!!!");
			me.closeWindows();
			me.login = null;
			me.showLogin();
		}).start();

	},
	initComponent: function () {
		var me = this;
		var contentCache = [];

        MNG.UserName = null;
        me.loginData = null;
        document.title = me.title;
        

        if (!MNG.Utils.authOK()) {
			Ext.Function.defer(function () {
				me.showLogin();
			}, 20);
        }

   
		Ext.TaskManager.start({
			run:function () {
				var ticket = MNG.Utils.authOK();
				if (!ticket) {
					return;
				}
				Ext.Ajax.request({
					url:'mng/login',
					method:'PUT',
					
					success:function (response, opts) {
						var result = Ext.decode(response.responseText);
						me.updateLoginData(result.data);
						me.onLogin();
					}

				});
			},
			interval:30 * 60 * 1000
		});
		
		Ext.apply(this, {
			layout:'card',
			activeItem:0,
			items:[
			{
				xtype:"component",
				id:'main_background'
			},
			{
				id:'main_container',
				layout:{type:'border'},
				border:false,
				items:[
					{
						region:'north',
						layout:{
							type:'hbox',
							align:'middle'
						},
						baseCls:'x-plain',
						height:40,
						style:{
							backgroundImage:Ext.util.Cookies.get('LangCookie')=='en' ? "url('images/back_en.png')":"url('images/back.png')",
							backgroundRepeat:'no-repeat'
						},
						defaults:{
							baseCls:'x-plain'
						},
						items:[
							{
								margins:'0 10 0 4'
							},
							{
								minWidth:200,
								flex:1,
								id:'versioninfo'
							},
							{
								pack:'end',
								margins:'8 10 0 10',
								id:'userinfo',
								style:{
									color:'#fff'
								},
								stateful:false 
							},
							{
								pack:'end',
								margins:'3 5 0 0',
								xtype:'button',
								id:'logout',
								baseCls:'x-btn',
								text:gettext("注销"),
								handler:function () {
									me.closeWindows();
									me.login = null;
									me.setContent();
									me.showLogin();
									contentCache = [];
								}
							}
						]
					},
					{
						xtype:"mngNavigator",
						region:"west",
						width:"20%",
						split:true,
						//minWidth:"15%",
						selModel:new Ext.selection.TreeModel({
			                listeners:{
			                    selectionchange: function (sm, selected) {
									var comp;
									var tlckup = {
										user:'MNG.dc.UserView',
										localConfig:'MNG.dc.LocalConfig',
									};

									
									if (selected.length > 0) {
										var n = selected[0];
										var id = n.data.id;

										console.log(id)
										if (id == "localConfig") {
											//console.log("111111");

                                        }	

										if(!tlckup[id])
											return;

										comp = contentCache[id] ? contentCache[id] : (contentCache[id] = Ext.create(tlckup[id],{
										   // xtype:tlckup[n.data.id],
											mngSelNode:n,
											workspace:me
											//viewFilter:selview.getViewFilter()
										}));
										comp.reload && comp.reload();
										me.down('#content').getLayout().setActiveItem(comp);
									
									}	
																

								}
							} 
						})
					},					
					{
						xtype:'container',
						id:'content',
						region:'center',
						layout:'card'
					}
				]
			}
			]
		});
		this.callParent();
	}
});