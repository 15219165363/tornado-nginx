Ext.define('MNG.panel.Config', {
    extend:'Ext.panel.Panel',
    alias:'widget.mngPanelConfig',

    initComponent:function () {
        var me = this;

        var stateid = me.hstateid;

        var sp = Ext.state.Manager.getProvider();

        var activeTab;

        if (stateid) {
            var state = sp.get(stateid);
            if (state && state.value) {
                activeTab = state.value;
            }
        }

        var items = me.items || [];
        me.items = undefined;

        var tbar = me.tbar || [];
        me.tbar = undefined;

        var title = me.title;
        me.title = undefined;

        tbar.unshift('->');
        tbar.unshift({
            xtype:'tbtext',
            text:title,
            baseCls:'x-panel-header-text',
            padding:'0 0 5 0'
        });

        var toolbar = Ext.create('Ext.toolbar.Toolbar', {
            items:tbar,
            style:'border:0px;',
            height:28
        });

        var tab = Ext.create('Ext.tab.Panel', {
            flex:1,
            border:true,
			activeTab:activeTab,
            defaults:Ext.apply(me.defaults || {}, {
                viewFilter:me.viewFilter,
                workspace:me.workspace,
                border:false
            }),
            items:items,
            listeners:{
                afterrender:function (tp) {
                    var first = tp.items.get(0);
                    if (first) {
                        first.fireEvent('show', first);
                    }
                },
                tabchange:function (tp, newcard, oldcard) {
                    var ntab = newcard.itemId;
                    // Note: '' is alias for first tab.
                    // First tab can be 'search' or something else
                    if (newcard.itemId === items[0].itemId) {
                        ntab = '';
                    }
                    var state = { value:ntab };
                    if (stateid) {
                        sp.set(stateid, state);
                    }
                }
            }
        });

        Ext.apply(me, {
            layout:{ type:'vbox', align:'stretch' },
            items:[ toolbar, tab]
        });

        me.callParent();

        var statechange = function (sp, key, state) {
            if (stateid && key === stateid) {
                var atab = tab.getActiveTab().itemId;
                var ntab = state.value || items[0].itemId;
                if (state && ntab && (atab != ntab)) {
                    tab.setActiveTab(ntab);
                }
            }
        };

        if (stateid) {
            me.mon(sp, 'statechange', statechange);
        }
    }
});
