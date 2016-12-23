# -*- coding: utf-8 -*-
#
#

import tornado.ioloop 
import tornado.web 
from tornado.httpserver import HTTPServer 
from tornado.ioloop import IOLoop
from tornado import web 
import sys
import os
import traceback

_root = os.path.dirname(os.path.abspath(__file__))
os.chdir(_root)
try:
	import manager
except ImportError:
	sys.path.append(os.path.join(_root, ".."))

from lib.tools import init_logger


LOG_LEVEL = "DEBUG"

default_encoding = 'utf-8'
if sys.getdefaultencoding() != default_encoding:
	reload(sys)
	sys.setdefaultencoding(default_encoding)

class Application(web.Application):
	def __init__(self):
		from urls import handlers, ui_modules
		
		settings = dict(debug=1,
						cookie_secret="61oETzKXQAGaYdkL5gEmGeJJFuYh7EQnp2XdTP1o/Vo=",
						)

		web.Application.__init__(self, handlers, **settings)

	def reverse_api(self, request):
		"""Returns a URL name for a request"""

		handlers = self._get_host_handlers(request)

		for spec in handlers:
			match = spec.regex.match(request.path)
			if match:
				return spec.name

		return None


def main():
	try:
		#用来存放钥匙
		if not os.path.exists('/etc/mng/priv'):
			os.makedirs('/etc/mng/priv')

		if not os.path.exists('/etc/mng/logfiles'):
			os.makedirs('/etc/mng/logfiles')

		init_logger('log_all', LOG_LEVEL, "/etc/mng/logfiles/log_all.log")
		init_logger('log_terminal', LOG_LEVEL, "/etc/mng/logfiles/log_terminal.log")

		http_server = HTTPServer(Application(),xheaders=True)
		http_server.bind(8888, '127.0.0.1')
		http_server.start(1)
		IOLoop.instance().start()

	except Exception,e:
		exstr = traceback.format_exc()
		#logger.log('the process is running unnormal... \n error_traceback == %s' % str(exstr))
		print exstr

if __name__ == "__main__":
    main()

