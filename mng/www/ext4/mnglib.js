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
                return gettext('Add') + ': ' + subject;
            } else {
                return gettext('Create') + ': ' + subject;
            }
        } else {
            return gettext('Edit') + ': ' + subject;
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

        //  return Ext.util.Cookies.get('SCAuthCookie');
        //}
    },

    authClear:function () {
   //     return Ext.util.Cookies.clear('mngAuth');
    },

    userClear:function () {
   //     return Ext.util.Cookies.clear('MNGUser');
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
});Ext.define('MNG.form.ComboBox', {
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
});Ext.define('MNG.window.LoginWindow', {
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
        console.log("this is in onLogin initComponent");
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

        console.log(local_user);
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
                    align:'center'

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
});Ext.define("MNG.Workspace", {
	extend:"Ext.container.Viewport", 

	title :gettext('MNG Platform'),


    onLogin:function () {
        var me = this;
		me.updateUserInfo();
        Ext.Function.defer(function () {
			me.getLayout().setActiveItem('main_container');
			var sp = Ext.state.Manager.getProvider();
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

        if (comp) {

        }

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
        MNG.CSRFPreventionToken = loginData.CSRFPreventionToken;
        MNG.UserName = loginData.username;
        MNG.LicenseUser = loginData.license_user;
        MNG.LicenseTrial = loginData.license_trial;
        MNG.LicenseTime = loginData.license_time;


    },
	showLogin:function () {
		var me = this;
		//MNG.Utils.authClear();
       // MNG.Utils.userClear();
       

		if (!me.login) {
			console.log("zzw---111");
			me.login = Ext.create('MNG.window.LoginWindow', {
				viewport:me,
				handler:function (data) {
					console.log(data);
					me.login = null;
					me.updateLoginData(data);
					me.onLogin();
				}
			});
			console.log("zzw---222");
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
        

		Ext.Function.defer(function () {
			me.showLogin();
		}, 20);
   
		Ext.TaskManager.start({
			run:function () {
				//var ticket = MNG.Utils.authOK();
				//if (!ticket) {
				//	return;
				//}
				Ext.Ajax.request({
					url:'mng/login',
					method:'POST',
					params:{
						username:"test",
						password:"123456",
					},					
					success:function (response, opts) {
						var result = Ext.decode(response.responseText);
						//me.updateLoginData(result.data);
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

				]
			}
			]
		});
		this.callParent();
	}
});