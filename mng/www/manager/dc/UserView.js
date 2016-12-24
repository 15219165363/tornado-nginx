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



