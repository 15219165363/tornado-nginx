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
