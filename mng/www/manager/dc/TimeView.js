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
