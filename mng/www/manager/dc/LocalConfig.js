Ext.define('MNG.dc.LocalConfig', {
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
