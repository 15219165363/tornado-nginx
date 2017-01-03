
JSSRC= 									\
	Utils.js							\
	data/proxy/MNGProxy.js          	\
	data/reader/JsonObject.js          	\
	data/UpdateQueue.js          		\
	data/UpdateStore.js          		\
	data/DynamicObjectStore.js          \
	data/ObjectStore.js          		\
	data/DiffStore.js          			\
	data/TimezoneStore.js          		\
	grid/ObjectGrid.js               	\
	panel/InputPanel.js                	\
	panel/ConfigPanel.js               	\
	form/ComboBox.js 					\
	form/LanguageSelector.js 			\
	tree/Navigator.js                   \
	window/LoginWindow.js              	\
	window/Edit.js              		\
	dc/LocalConfig.js               	\
	dc/TimeView.js               		\
	dc/TimeEdit.js               		\
	dc/UserEdit.js               		\
	dc/UserView.js               		\
	dc/ServerEdit.js 					\
	dc/ServerView.js 					\
	Workspace.js

mnglib.js: ${JSSRC}
	cat ${JSSRC} >$@.tmp
	mv $@.tmp $@
	cp mnglib.js ../ext4

.PHONY: clean
clean:
	find . -name '*~' -exec rm {} ';'
	rm -rf mnglib.js
