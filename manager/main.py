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
		if not os.path.exists('/zzw/manager/logfiles'):
			os.makedirs('/zzw/manager/logfiles')

		init_logger('all_logs', LOG_LEVEL, "/zzw/manager/logfiles/all_logs.log")

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

