# -*- coding: utf-8 -*-
#
#
import tornado
import logging
import rsa # need install rsa module first
import base64
import time

from lib.tools import init_logger
from lib.handler import APIHandler
from lib.exceptions import HTTPAPIError

AUTH_PRI_KEY = "/etc/manager/priv/authkey.key"

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


		timestamp = "%08X" % time.time();
		plain = "MNG:" + username + ":" + timestamp;

		with open(AUTH_PRI_KEY) as privatefile:
			p = privatefile.read()
			privkey = rsa.PrivateKey.load_pkcs1(p)
			privatefile.close()

		ticket = plain + "::" + base64.b64encode(rsa.sign(plain, privkey, 'SHA-1'))
		#print "user:%s ticket=%s" % (username, ticket);
		
		response = {}
		response['username'] = username
		response['ticket'] = ticket
	
		self.set_secure_cookie("MNGAuth", ticket,None)
		self.set_secure_cookie("MNGUser", username,None)

		self.finish(response)
		return

handlers = [(r"/forma", FormHandler),
			(r"/singform/(.*)", SingleFormHandler),
			(r"/login", LoginHandler)]