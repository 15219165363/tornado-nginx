# -*- coding: utf-8 -*-
#
#
import logging

from lib.handler import APIHandler

logger_terminal = logging.getLogger("terminal_log")

class UserLoginHandler(APIHandler):
	def get(self):
		pass

	def post(self):
		try:
			username = self.get_argument('username', None)
			password = self.get_argument('password', None)
			print "1------"
			print username
			print password
			print "2------"

		except Exception,e:
			logger_terminal.info("err = %s" %str(e))

handlers = [(r"/terminal/login", UserLoginHandler)]
