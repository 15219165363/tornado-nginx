Ext.define('MNG.dc.ServerEdit', {
    extend: 'MNG.window.Edit',
    alias: ['widget.mngDcServerEdit'],

    isAdd: true,
	initComponent: function () {
		var me = this;
		var method, url;

        url = '/mng/server';
        method = 'POST';

		var ipanel = Ext.create('MNG.panel.InputPanel', {
			tips:{
				enabled:true,
				icon: 'images/tips.png',
				text: gettext('服务器管理')
			},
			items:[

			]
		});
		Ext.applyIf(me, {
			url: url,
			width:350,
			method: method,
			items: [ ipanel ]
		});
		me.callParent();
		if (!me.create) me.load();
	}
});
