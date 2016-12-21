Ext.define('MNG.form.LanguageSelector', {
    extend: 'MNG.form.ComboBox',
    alias: ['widget.mngLanguageSelector'],
    initComponent: function() {
		var me = this;
		me.data = MNG.Utils.language_array();
		me.callParent();
    }
});