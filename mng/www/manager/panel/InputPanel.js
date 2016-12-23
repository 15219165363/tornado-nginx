Ext.define('MNG.panel.InputPanel', {
    extend:'Ext.panel.Panel',
    alias:['widget.inputpanel'],

    border:false,

    // overwrite this to modify submit data


    onGetValues:function (values) {
        return values;
    },

    getValues:function (dirtyOnly) {
        var me = this;

        if (Ext.isFunction(me.onGetValues)) {
            dirtyOnly = false;
        }

        var values = {};

        Ext.Array.each(me.query('[isFormField]'), function (field) {
            if (!dirtyOnly || field.isDirty()) {
                MNG.Utils.assemble_field_data(values, field.getSubmitData());
            }
        });

        return me.onGetValues(values);
    },

    setValues:function (values) {
        var me = this;

        var form = me.up('form');

        Ext.iterate(values, function (fieldId, val) {
            var field = me.query('[isFormField][name=' + fieldId + ']')[0];
            if (field) {
                field.setValue(val);
                if (form.trackResetOnLoad) {
                    field.resetOriginalValue();
                }
            }
        });
    },

    initComponent:function () {
        var me = this;

        var items;

		if (me.tips.enabled) {
			//if (!me.tips.icon){
			//	me.tips.icon = '/ovp2/images/about.png'
			//}

			if (!me.tips.text){
				me.tips.text =  'this is a normal tip.'
			}

			if (!me.tips.html) {
				me.tips.html = '<img src="' + me.tips.icon + '"/><a>  ' + me.tips.text + '</a>';
			}
		}

        if (me.items) {
            me.columns = 1;
            items = [
                {
                    columnWidth:1,
                    layout:'anchor',
                    items:me.items
                }
            ];
            me.items = undefined;
        } else if (me.column1) {
            me.columns = 2;
            items = [
                {
                    columnWidth:0.5,
                    padding:'0 10 0 0',
                    layout:'anchor',
                    items:me.column1
                },
                {
                    columnWidth:0.5,
                    padding:'0 0 0 10',
                    layout:'anchor',
                    items:me.column2 || [] // allow empty column
                }
            ];
        } else {
            throw "unsupported config";
        }
		var total_items = [];
		if (me.tips.enabled) {
			total_items.push(
				{
					xtype:"panel",
					padding:5,
					align:'center',
					html:me.tips.html,
					bodyPadding:5
				}
			);
		}
        if (me.useFieldContainer) {
			total_items.push(
				Ext.apply(me.useFieldContainer, {
					layout:'column',
					defaultType:'container',
					items:items,
					padding:5
				})
			);
        } else {
			total_items.push(
				{
					layout:'column',
					border:false,
					defaultType:'container',
					padding:5,
					items:items
				}
			);
        }
		Ext.apply(me, {
			layout:{
				type:'vbox',
				align:'stretch'
			},
			items:total_items
		});

        me.callParent();
    }
});
