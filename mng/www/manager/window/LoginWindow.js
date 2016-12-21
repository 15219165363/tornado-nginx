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
});