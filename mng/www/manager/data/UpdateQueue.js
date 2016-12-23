// Serialize load (avoid too many parallel connections)
var mng_suspend_update = 0;
Ext.define('MNG.data.UpdateQueue', {
    singleton:true,

    constructor:function () {
        var me = this;

        var queue = [];
        var queue_idx = {};

        var idle = true;

        var start_update = function () {
            if (!idle) {
                return;
            }

            if(mng_suspend_update){
                return;
            }

            var store = queue.shift();
            if (!store) {
                return;
            }

            queue_idx[store.storeid] = null;

            idle = false;

            store.load({
                callback:function (records, operation, success) {

                    idle = true;

                }
            });

        };

        Ext.apply(me, {
            queue:function (store) {
                if (!store.storeid) {
                    throw "unable to queue store without storeid";
                }
                if (!queue_idx[store.storeid]) {
                    queue_idx[store.storeid] = store;
                    queue.push(store);
                }
                start_update();
            }
        });
    }
});
