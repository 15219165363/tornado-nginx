Ext.define('MNG.RestProxy', {
    extend: 'Ext.data.RestProxy',
    alias : 'proxy.mng',

    constructor: function(config) {
		var me = this;

		config = config || {};

		Ext.applyIf(config, {
			pageParam : null,
			startParam: null,
			limitParam: null,
			groupParam: null,
			sortParam: null,
			filterParam: null,
			noCache : true,
			reader: {
				type: 'json',
				root: config.root || 'data'
			},
			afterRequest: function(request, success) {
				me.fireEvent('afterload', me, request, success);
				return;
			}
		});

		me.callParent([config]); 
    }
}, function() {
		Ext.define('KeyValue', {
			extend: "Ext.data.Model",
			fields: [ 'key', 'value' ],
			idProperty: 'key'
		});


	}


);
