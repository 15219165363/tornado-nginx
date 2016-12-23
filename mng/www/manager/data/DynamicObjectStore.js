Ext.define('MNG.data.DynamicObjectStore', {
    extend:'MNG.data.UpdateStore',

    constructor:function (config) {
        var me = this;

        config = config || {};

        if (!config.storeid) {
            config.storeid = 'mng-store-' + (++Ext.idSeed);
        }

        Ext.applyIf(config, {
            model:'KeyValue',
            proxy:{
                type:'mng',
                url:config.url,
                extraParams:config.extraParams,
                reader:{
                    type:'jsonobject',
                    rows:config.rows
                }
            }
        });

        me.callParent([config]);
    }
});
