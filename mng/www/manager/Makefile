
JSSRC= 				\
	Utils.js		\
	form/ComboBox.js 	\
	form/LanguageSelector.js 	\
	window/LoginWindow.js              \
	Workspace.js

mnglib.js: ${JSSRC}
	cat ${JSSRC} >$@.tmp
	mv $@.tmp $@

.PHONY: clean
clean:
	find . -name '*~' -exec rm {} ';'	
	rm -rf mnglib.js
