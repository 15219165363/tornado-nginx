# -*- coding: utf-8 -*-
#
#
import tornado

class FormHandler(tornado.web.RequestHandler): 
	def get(self): 
		self.write("Hello, world")

	def post(self):
		self.write("Hello, this is in post")

class SingleFormHandler(tornado.web.RequestHandler): 
	#def get(self): self.write("Hello, world")
	def get(self):
		pass		

	def post(self):
			pass

handlers = [(r"/forma", FormHandler),
			(r"/singform/(.*)", SingleFormHandler)]