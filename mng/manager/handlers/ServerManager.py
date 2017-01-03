#!/usr/bin/python
# -*- coding: utf-8 -*-
#

import logging

from lib.handler import APIHandler
from lib.exceptions import HTTPAPIError

logger_all = logging.getLogger("log_all")

class ServerHandler(APIHandler):
	def get(self):
		try:
			u = []
			u = [{"uuid": "000-0000-000", "cpu": "10", "iowait": "20"}];
			self.finish(u);
		except Exception,e:
			logger_all.error(e)
			self.finish(u);
			return

	def post(self):
		try:
			pass
		except Exception,e:
			logger_all.error(e)

	def put(self):
		try:
			pass
		except Exception,e:
			logger_all.error(e)

handlers = [(r"/server", ServerHandler),]