Ext.define('MNG.tree.Navigator', {
	extend:'Ext.tree.Panel',
	alias:'widget.mngNavigator',
	selectExpand:function (node) {
		var me = this;
		var sm = me.getSelectionModel();
		sm.fireEvent('selectionchange', sm, [node]);
		me.setActive(true, node);
		var cn = node;
		while (!!(cn = cn.parentNode)) {
			if (!cn.isExpanded()) {
				cn.expand();
			}
		}
	},
	selectById:function (nodeid) {
		var me = this;
		var rootnode = me.getRootNode();
		var sm = me.getSelectionModel();
		var node;
		if (nodeid === 'root') {
			node = rootnode;
		} else {
			node = rootnode.findChild('id', nodeid, true);
		}
		if (node) {
			me.selectExpand(node);
			sm.select(node);
		}
	},

	applyState:function (state) {
		var me = this;
		var sm = me.getSelectionModel();
		if (state && state.value) {
			me.selectById(state.value);
		} else {
			me.selectById('localConfig');
		}   
	},
		
	initComponent: function () {
		var me = this;
		var sp = Ext.state.Manager.getProvider();
		var stateid = 'vid';
		
		
		me.store = Ext.create('Ext.data.TreeStore', {
			root: {
				children: [

					{text:gettext('系统配置'), children:[
						{icon: '/images/local_config.png',text:gettext('本地配置'), id:'localConfig',  leaf:true},

					]},

                    {text:gettext('用户管理'), children: [
                        {icon: '/images/user.png',text:gettext('用户'), id:'user', leaf:true},
                    ]},   					

				]
			}
		});
		
	
		Ext.apply(me, {
			title: gettext('导航'),
			height:'100%',
			rootVisible:false,
			//resizable: true,
			//collapsible:true,
			bodyStyle:'overflow-y:scroll',
			layout: 'auto',
			store:me.store
		});
		
		//加载
		me.callParent();
		var sm = me.getSelectionModel();
		sm.ignoreRightMouseSelection = true;
		sm.on('select', function (sm, n) {
			sp.set(stateid, { value:n.data.id});
		});
	}
});
