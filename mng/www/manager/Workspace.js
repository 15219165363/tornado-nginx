Ext.define("MNG.Workspace", {
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