# -*- coding: utf-8 -*-
#
#
import tornado
import logging

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

handlers = [(r"/forma", FormHandler),
			(r"/singform/(.*)", SingleFormHandler)]