Ext.define('MNG.dc.ServerView', {
    extend:'Ext.grid.GridPanel',

    alias:['widget.mngDcServerView'],

    initComponent:function () {
        var me = this;
        var server_store = new MNG.data.UpdateStore({
            storeid:"servers",
            model:'mng-server-manager',
            interval:5000,
            sorters:{
                property:'serverid',
                order:'DESC'
            },
            proxy: {
                type:'mng',
                url:'/mng/server'
            }
        });
        var store = Ext.create('MNG.data.DiffStore', {
            rstore:server_store,
            appendAtStart:true
        });
        var reload = function () {
            server_store.load();
        };
        var sm = Ext.create('Ext.selection.RowModel');
		var run_editor = function () {
            var rec = sm.getSelection()[0];

            var win = Ext.create('MNG.dc.ServerEdit', {
                ip:rec.data.ip
            });
            win.on('destroy', reload);
            win.show();
		};

        var tbar = [
            {
                icon:'/images/edit.png',
                text: gettext("编辑"),
                disabled:true,
                selModel:sm,
                handler: run_editor
            }

        ];
		
        Ext.apply(me, {
			title:gettext('服务器信息'),
            store:store,
            selModel:sm,
            stateful:false,
            tbar:tbar,
            reload:reload,
            viewConfig:{
                preserveScrollOnRefresh:true,
                trackOver:false
            },
            columns:[
                {
                    header:gettext('UUID'),
					flex:2,
                    sortable:true,
                    dataIndex:'uuid'
                },
                {
                    header:gettext('CPU使用率'),
					flex:1,
                    sortable:true,
                    //renderer:render_realm,
                    dataIndex:'cpu'
                },
                {
                    header:gettext('IO使用率'),
					flex:1,
                    width:250,
                    sortable:true,
                    dataIndex:'iowait'
                },
			],
            listeners:{
                itemdblclick:run_editor,
                beforeRender:server_store.startUpdate,
                beforeShow:server_store.startUpdate,
                hide:server_store.stopUpdate,
                destroy:server_store.stopUpdate
            }
        });
		me.callParent();
	}
});
