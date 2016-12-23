/* A reader to store a single JSON Object (hash) into a storage.
 * Also accepts an array containing a single hash. 
 * So it can read:
 *
 * example1: { data: "xyz" }
 * example2: [ {  data: "xyz" } ]
 */

Ext.define('MNG.data.reader.JsonObject', {
    extend:'Ext.data.reader.Json',
    alias:'reader.jsonobject',

    root:'data',

    constructor:function (config) {
        var me = this;

        Ext.apply(me, config || {});
        //console.log('jsonobject start...');
        me.callParent([config]);
    },

    getResponseData:function (response) {

        //console.log('my get response data...');
        var me = this;

        var data = [];
        try {
            var result = Ext.decode(response.responseText);
            var root = me.getRoot(result);
            var org_root = root;

            if (Ext.isArray(org_root)) {
                if (org_root.length == 1) {
                    root = org_root[0];
                } else {
                    root = {};
                }
            }

            if (me.rows) {
                Ext.Object.each(me.rows, function (key, rowdef) {
                    if (Ext.isDefined(root[key])) {
                        data.push({key:key, value:root[key]});
                    } else if (Ext.isDefined(rowdef.defaultValue)) {
                        data.push({key:key, value:rowdef.defaultValue});
                    } else if (rowdef.required) {
                        data.push({key:key, value:undefined});
                    }
                });
            } else {
                Ext.Object.each(root, function (key, value) {
                    data.push({key:key, value:value });
                });
            }

            return me.readRecords(data);
        }
        catch (ex) {

            var error = new Ext.data.ResultSet({
                total  : 0,
                count  : 0,
                records: [],
                success: false,
                message: ex.message
            });

            this.fireEvent('exception', this, response, error);

            Ext.Logger.warn('Unable to parse the JSON returned by the server');
            console.log('Unable to parse the JSON returned by the server');

//            Ext.Error.raise({
//                response:response,
//                json:response.responseText,
//                parseError:ex,
//                msg:'Unable to parse the JSON returned by the server: ' + ex.toString()
//            });

            return error;
        }

        console.log('my get response error. should not be run to here. = ');
        return;
    }
});

