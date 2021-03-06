#
# Copyright (c) 2013. All rights reserved.
#
# @author: zzw
#
# -*- coding: utf-8 -*-
#
#


try:
	import importlib
except:
	from lib import importlib

from tornado.options import options
from tornado.web import url

handlers = []
ui_modules = {}

# the module names in handlers folder
handler_names = ["form", "terminal", "LocalConfig", "UserManager", "ServerManager"]


def _generate_handler_patterns(root_module, handler_names, prefix="/mng"):
	for name in handler_names:
		module = importlib.import_module(".%s" % name, root_module)
		module_hanlders = getattr(module, "handlers", None)
		if module_hanlders:
			_handlers = []
			print module_hanlders
			for handler in module_hanlders:
				try:
					patten = r"%s%s" % (prefix, handler[0])
					# print "register handler: path:", patten,  "handler:", handler[1]
					if len(handler) == 2:
						_handlers.append((patten,
										  handler[1]))
					elif len(handler) == 3:
						_handlers.append(url(patten,
											 handler[1],
											 name=handler[2])
										 )

					else:
						pass
				except IndexError:
					pass

			handlers.extend(_handlers)

_generate_handler_patterns("handlers", handler_names)

# Override Tornado default ErrorHandler
#handlers.append((r".*", APIErrorHandler))
