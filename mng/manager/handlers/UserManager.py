# -*- coding: utf-8 -*-
#
#

import logging

from lib import sh
from lib.tools import init_logger
from lib.handler import APIHandler
from lib.exceptions import HTTPAPIError

logger_all = logging.getLogger("all_logs")

class UserHandler(APIHandler):
	def get(self):
		try:
			u = [{"comment": "Administrator", "username": "root", "enable": "1", "bduser": 0, "expire": 0, "role": "Administrator", "email": "zzz@xxx.com"}];

			self.finish(u);
			return;

		except Exception,e:
			logger_all.error(e)
			self.finish(u);
			return

	def post(self):
		try:
			username = self.get_argument("username", None)
			role = self.get_argument("role", None)
			password = self.get_argument("password", None)
			comment = self.get_argument("comment" , None)
			expire = int(self.get_argument("expire" , 0))
			batch_num = int(self.get_argument("batch_num", 0))

			print username
			print role
			print password
			print comment
			print expire
			print batch_num
			
		except Exception,e:
			logger_all.error(e)		


handlers = [(r"/user", UserHandler),]