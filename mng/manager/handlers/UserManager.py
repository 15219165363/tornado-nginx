#!/usr/bin/python
# -*- coding: utf-8 -*-
#

import logging

from lib import sh
from lib.tools import init_logger
from lib.handler import APIHandler
from lib.exceptions import HTTPAPIError
from lib.MySQL import MysqlApi

logger_all = logging.getLogger("log_all")

mysql_api = MysqlApi()

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
			db_name = "MNGDB"
			tb_name = "user_info"
			info_list = []
			username = self.get_argument("username", None)
			password = self.get_argument("password", None)
			role = self.get_argument("role", None)
			expire = int(self.get_argument("expire" , 0))
			comment = self.get_argument("comment" , None)			
			batch_num = int(self.get_argument("batch_num", 0))

			info_list.append(username)
			info_list.append(password)
			info_list.append(role)
			info_list.append(expire)
			info_list.append(comment)

			print info_list
			mysql_api.insert_to_table(db_name, tb_name, info_list)
			
		except Exception,e:
			logger_all.error(e)		


handlers = [(r"/user", UserHandler),]