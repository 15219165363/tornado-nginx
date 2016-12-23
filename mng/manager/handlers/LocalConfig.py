# -*- coding: utf-8 -*-
#
#
import os
import re
import sys
import time
import logging
import subprocess

from tornado.ioloop import IOLoop

from lib import sh
from lib.tools import init_logger
from lib.handler import APIHandler
from lib.exceptions import HTTPAPIError



SYSCONFIG_CLOCK = "/etc/sysconfig/clock"
TIMEZONE_DIRECTORY  = "/usr/share/zoneinfo/"
TIMEZONE_FILE = "/etc/localtime"

logger_all = logging.getLogger("all_logs")

class TimezoneHandler(APIHandler):
	def get(self):
		sysclock = open(SYSCONFIG_CLOCK, 'r')
		if sysclock is None:
			logger_all.error("!!!--open file error")
			raise HTTPAPIError(505, 'open file')
		timezone = sysclock.read().strip()
		sysclock.close()
		timezone = re.match(r'.*ZONE\s*=\s*"(.*)".*', timezone)
		if timezone is None:
			raise HTTPAPIError(404)
		localtime = time.strftime('%Y-%m-%d %X', time.localtime())
		self.finish({'timezone': timezone.group(1), 'localtime':localtime})

	def put(self):
		zone = self.get_argument('timezone', None)
		if not zone:
			raise HTTPAPIError(400)
		_time = self.get_argument('time', None)

		time1 = _time.split(' ')
		time2 = time1[0].split('-')
		time3 = int(time2[0])
		if time3 < 1970:
			raise HTTPAPIError(400, error_type = 'out_of_time_limit')
			
		now = int(time.time())
		_now = int(time.mktime(time.strptime(_time, '%Y-%m-%d %H:%M:%S')))
		if not((now - _now) < 20*365*24*3600 and (now - _now) > -20*365*24*3600):
			raise HTTPAPIError(400, error_type = 'out_of_time_limit')
			return

		timezone = TIMEZONE_DIRECTORY + zone
		if not os.path.exists(timezone):
			logger_all.error("!!!--file timezone not exists")
			raise HTTPAPIError(404, timezone)

		if not os.path.exists(SYSCONFIG_CLOCK):
			logger_all.error("!!!--file SYSCONFIG_CLOCK not exists")
			raise HTTPAPIError(404, SYSCONFIG_CLOCK)

		if os.path.exists(TIMEZONE_FILE):
			#os.system('rm -f ' + OVD_TIMEZONE_FILE)
			try:
				cmd = sh.Command("rm")
				cmd("-f", TIMEZONE_FILE)
			except Exception,e:
				logger_all.error(e)
				return
		os.symlink(timezone, TIMEZONE_FILE)
		sysclock = open(SYSCONFIG_CLOCK, 'w')
		if sysclock:
			raw = 'ZONE="%s"\nUTC=true\nARC=false' % zone
			sysclock.write(raw)
			sysclock.close()
		try:
			subprocess.call(['date', '-s', _time])
			subprocess.call(['clock', '-w'])
			# restart scproxy
			restart_scproxy()
			IOLoop.instance().stop()
			sys.exit(-1)
		except Exception,e:
			logger_all.error(e)
			return
		self.finish()

handlers = [(r"/timezone", TimezoneHandler),]