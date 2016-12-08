# -*- coding: utf-8 -*-
#
#
import tornado
import logging
from lib.tools import init_logger
from lib.handler import APIHandler

logger1 = logging.getLogger("all_logs")
class FormHandler(tornado.web.RequestHandler): 
	def get(self): 
		self.write("Hello, world")

	def post(self):
		logger1.info("------")
		self.write("Hello, this is in post")

class SingleFormHandler(tornado.web.RequestHandler): 
	#def get(self): self.write("Hello, world")
	def get(self):
		pass		

	def post(self):
			pass


class LoginHandler(APIHandler): 
	def get(self):
		pass

	def post(self):
		logger1.info("------")
		print "------"
		username = self.get_argument('username', None)
		password = self.get_argument('password', None)

		if username == "a" and password == "123":
			res = "ok"
		else:
			res = "err"

		s = {'username':username, 'res':res}
		self.finish(s)

handlers = [(r"/forma", FormHandler),
			(r"/singform/(.*)", SingleFormHandler),
			(r"/login", LoginHandler)]