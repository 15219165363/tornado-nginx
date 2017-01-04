#!/usr/bin/python
# -*- coding: utf-8 -*-
#

import time
import json
import socket
import logging
import functools

from lib.handler import APIHandler
from lib.exceptions import HTTPAPIError
from lib.SaveConfig import *
from lib.SaveConfig import CONFIG
from lib.worker import worker

worker.daemon = True
worker.start()

SERVER_INFO = "/etc/mng/server_info.conf"

logger_all = logging.getLogger("log_all")

file_register('server', SERVER_INFO, json_reader, json_writer)

def accect_udp(port=8081):
	try:
		s = socket.socket(socket.AF_INET,socket.SOCK_DGRAM)
		s.bind(("",port))
		while True:
			server = CONFIG.server
			data,addr = s.recvfrom(1024)
			data = str(data)
			data = data.replace("'", '"')
			data = json.loads(data)
			uuid = data.get("uuid", None)

			server[uuid] = data
			CONFIG.server = server

			time.sleep(10)
	except Exception,e:
		logger_all.error("accect_udp->err = %s" %str(e))
	
class ServerHandler(APIHandler):
	def get(self):
		try:
			u = []
			CONFIG.reload_config()
			server = CONFIG.server
			for value in server.values():
				u.append(value)
						
			#u = [{"uuid": "000-0000-000", "cpu": "10", "iowait": "20"}];
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




worker.put_work(functools.partial(accect_udp, port=8081))