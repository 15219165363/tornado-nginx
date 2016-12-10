# -*- coding: utf-8 -*-
#
#
import logging
import time
from tornado.ioloop import IOLoop,PeriodicCallback


from lib.handler import APIHandler

logger_terminal = logging.getLogger("terminal_log")


class LOGON_USER_INFO(object):
	def __init__(self):
		super(LOGON_USER_INFO, self).__init__()
		self.logon_user_info = {}

	def check_heart_beat(self):
		user_tmps = {}
		for u_name, info in self.logon_user_info.iteritems():
			if time.time()  - (info['time']) <= 90:
				print("below 90...............................")
				user_tmps[u_name] = info

		print("after user_tmps ====-=======-========== %s" % str(user_tmps))
		self.logon_user_info = user_tmps

	def add_logon_user_info(self, username=None, terminal_ip=None, name=None, mac=None):
		print('%s ---in---add_logon_user_info --------------  %s' % (username, str(self.logon_user_info)))
		try:
			for u_name, info in self.logon_user_info.iteritems():
				print(' info  %s' % (str(info)))
				if info['name'] == name and info['mac'] != mac:
					self.logon_user_info[u_name]['be_out'] = 1
									
		except Exception, e:
			print(' info  %s' % (str(info)))  

		self.logon_user_info[username] = {
			"name"        : name,
			"ip"          : terminal_ip,
			"mac"         : mac,			
			"be_out"      : 0,	
			"time"        : time.time(),	
			"retry"		  : 0
		}

		print('%s--after -in---add_logon_user_info -===========  %s' % (username, str(self.logon_user_info)))

		return

	#用户的retry不超过max_count时返回True
	def can_retry(self, username, max_count):
		try:
			if self.logon_user_info[username]["retry"] < max_count:
				self.logon_user_info[username]["retry"] += 1
				return True
			else:
				return False
		except Exception, e:
			return False

	def clear_retry(self, username):
		try:
			self.logon_user_info[username]["retry"] = 0
		except Exception, e:
			return


LOGONER =  LOGON_USER_INFO()

heart_beat = PeriodicCallback(LOGONER.check_heart_beat, 10*1000)
heart_beat.start()

class UserLoginHandler(APIHandler):
	def get(self):
		pass

	#终端用户登录
	def post(self):
		try:
			username = self.get_argument('username', None)
			password = self.get_argument('password', None)
			mac = self.get_argument('mac', None)

			terminal_ip = self.request.remote_ip			

			u_name = username + ':' + mac
			LOGONER.add_logon_user_info(u_name.upper(), terminal_ip, username.upper(), mac)

		except Exception,e:
			logger_terminal.info("err = %s" %str(e))


class LoginUserHeartBeatHandler(APIHandler):
	
	def post(self):
		try:
			username = self.get_argument('username', None)
			mac = self.get_argument('mac', '0')
			print username
			print mac

			username = username + ':' + mac

			s = {}

			key_name = username.upper()
			if LOGONER.logon_user_info.has_key(key_name) :

				if LOGONER.logon_user_info[key_name]['be_out'] == 1:
					s['ret'] = 1002
					#s['ret'] = 1000
					LOGONER.logon_user_info.pop(key_name)
				else:
					s['ret'] = 1000

					LOGONER.logon_user_info[key_name]["time"] = time.time()


			else:
				s['ret'] = 1001

			print s
			self.finish(s)

		except Exception,e:
			logger_terminal.info("err = %s" %str(e))			

handlers = [(r"/terminal/login", UserLoginHandler),
			(r"/terminal/heart_beat", LoginUserHeartBeatHandler)]
