Ext.define('MNG.window.Edit', {
    extend:'Ext.window.Window',
    alias:'widget.mngWindowEdit',

    resizable:false,

    // use this tio atimatically generate a title like
    // Create: <subject>
    subject:undefined,

    // set create to true if you want a Create button (instead 
    // OK and RESET) 
    create:false,

    // set to true if you want an Add button (instead of Create)
    isAdd:false,

    isValid:function () {
        var me = this;

        var form = me.formPanel.getForm();
        return form.isValid();
    },

    getValues:function (dirtyOnly) {
        var me = this;

        var values = {};

        var form = me.formPanel.getForm();

        form.getFields().each(function (field) {
            if (!field.up('inputpanel') && (!dirtyOnly || field.isDirty())) {
                MNG.Utils.assemble_field_data(values, field.getSubmitData());
            }
        });

        Ext.Array.each(me.query('inputpanel'), function (panel) {
            MNG.Utils.assemble_field_data(values, panel.getValues(dirtyOnly));
        });

        return values;
    },

    setValues:function (values) {
        var me = this;

        var form = me.formPanel.getForm();

        Ext.iterate(values, function (fieldId, val) {
            var field = form.findField(fieldId);
            if (field && !field.up('inputpanel')) {
                field.setValue(val);
                if (form.trackResetOnLoad) {
                    field.resetOriginalValue();
                }
            }
        });

        Ext.Array.each(me.query('inputpanel'), function (panel) {
            panel.setValues(values);
        });
    },

    submit:function () {
        var me = this;

        var form = me.formPanel.getForm();

        var values = me.getValues();
        Ext.Object.each(values, function (name, val) {
            if (values.hasOwnProperty(name)) {
                if (Ext.isArray(val) && !val.length) {
                    values[name] = '';
                }
            }
        });

        if (me.digest) {
            values.digest = me.digest;
        }

        MNG.Utils.Request({
            url:me.url,
            waitMsgTarget:me,
            method:me.method || 'PUT',
            params:values,
            failure:function (response, options) {
                var result, meta;
                try {
                    result = Ext.decode(response.responseText);
                    meta = result.meta;
                } catch (e) {
                    if (response.status == 502 || response.status == 504) {
                        
                    }
                };
                if (response.status == 405) {
                    if (Ext.decode(response.responseText).meta.errorType == "xxx") {
                        Ext.Msg.alert(gettext('Error'), 
                            Ext.String.format(gettext('xxxxxx')));
                    }                  
                } else if (response.status == 505) {
                    if (meta && meta.errorType == 'modify_vm') {
                        Ext.Msg.alert(gettext('Error'), 
                            Ext.String.format(gettext('modify VM failed, VM is running')));
                    }
                } else if (response.status == 400) {
                    if (meta && meta.errorType == 'xxx') {
                        Ext.Msg.alert(gettext('Error'), 
                            Ext.String.format(gettext('xxx')));
                    } else if (meta && meta.errorType == 'xxxxxx') {
                        Ext.Msg.alert(gettext('Error'), 
                            Ext.String.format(gettext('xxx {0} xxx'), '"' + meta.errorDetail + '"'));
                    } 
                }
            },
            success:function (response, options) {
                me.successCallback && me.successCallback(response, options);
                me.close();
            }
        });
    },

    load:function (options) {
        var me = this;

        var form = me.formPanel.getForm();

        options = options || {};

        var newopts = Ext.apply({
            waitMsgTarget:me
        }, options);

        var createWrapper = function (successFn) {
            Ext.apply(newopts, {
                url:me.url,
                method:'GET',
                success:function (response, opts) {
                    form.clearInvalid();
                    me.digest = response.result.data.digest;
                    if (successFn) {
                        successFn(response, opts);
                    } else {
                        me.setValues(response.result.data);
                    }
                    // hack: fix ExtJS bug
                    Ext.Array.each(me.query('radiofield'), function (f) {
                        f.resetOriginalValue();
                    });
                },
                failure:function (response, opts) {
                    Ext.Msg.alert(gettext('Error'), response.htmlStatus, function () {
                        me.close();
                    });
                }
            });
        };

        createWrapper(options.success);

        MNG.Utils.Request(newopts);
    },

    initComponent:function () {
        var me = this;

        if (!me.url) {
            throw "no url specified";
        }

        var items = Ext.isArray(me.items) ? me.items : [ me.items ];

        me.items = undefined;

        me.formPanel = Ext.create('Ext.form.Panel', {
            url:me.url,
            method:me.method || 'PUT',
            trackResetOnLoad:true,
            bodyPadding:10,
            border:false,
            defaults:{
                border:false
            },
            fieldDefaults:Ext.apply({}, me.fieldDefaults, {
                labelWidth:100,
                anchor:'100%'
            }),
            items:items
        });

        var form = me.formPanel.getForm();

        var submitBtn = Ext.create('Ext.Button', {
            text:me.create ? (me.isAdd ? gettext('增加') 
                : gettext('创建')) 
                : gettext('OK'),
            disabled:!me.create,
            handler:function () {
                me.submit();
            }
        });

        var resetBtn = Ext.create('Ext.Button', {
            text:gettext('重置'),
            disabled:true,
            handler:function () {
                form.reset();
            }
        });

        var set_button_status = function () {
            var valid = form.isValid();
            var dirty = form.isDirty();
            submitBtn.setDisabled(!valid || !(dirty || me.create));
            resetBtn.setDisabled(!dirty);
        };

        form.on('dirtychange', set_button_status);
        form.on('validitychange', set_button_status);

        var colwidth = me.colwidth || 300;
        if (me.fieldDefaults && me.fieldDefaults.labelWidth) {
            colwidth += me.fieldDefaults.labelWidth - 100;
        }


        var twoColumn = items[0].column1 || items[0].column2;

        if (me.subject && !me.title) {
            me.title = MNG.Utils.dialog_title(me.subject, me.create, me.isAdd);
        }

        Ext.applyIf(me, {
            modal:true,
            layout:'auto',
            width:twoColumn ? colwidth * 2 : colwidth,
            border:false,
            items:[ me.formPanel ],
            buttons:me.create ? [ submitBtn ] : [ submitBtn, resetBtn ]
        });

        me.callParent();

        // always mark invalid fields
        me.on('afterlayout', function () {
            me.isValid();
        });
    }
});