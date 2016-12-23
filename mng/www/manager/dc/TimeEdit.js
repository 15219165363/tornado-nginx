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
