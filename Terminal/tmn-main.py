# -*- coding: utf-8 -*-
#
#

import requests
import subprocess
import re
import os
import threading
import time
import json
import sys


def get_mac_info():
	mac = "11:22:33:44:55"
	def get_if():
		try:
			p = subprocess.Popen((["cat", "/proc/net/dev"]), stdout = subprocess.PIPE)
			lines = p.stdout.readlines()	

		except Exception, e:
			print 'get net info failure', str(e)
			return None
		
		netif = None
		for l in lines:
			if l.find(':') != -1:
				xx = l.split(':')[0].strip()
				if xx == 'lo' or re.search('^w',xx):
					continue
				netif = xx
				break

		return netif

	try:
		netif = get_if()
		if not netif:
			return mac

		p = subprocess.Popen((["ifconfig", netif]), stdout = subprocess.PIPE)
		lines = p.stdout.readlines()	

	except Exception, e:
		return mac

	for l in lines:
		xx = l.strip()

		if xx.startswith('ether'):
			reret = re.search(r"ether (([0-9a-fA-F]{2}:){5}[0-9a-fA-F]{2}) ", xx)
			mac = reret.group(1)

		if xx.find("HWaddr") > 0:
			reret = re.match(r'(.*)(([0-9a-fA-F]{2}:){5}[0-9a-fA-F]{2})$', xx)
			mac = reret.group(2)				

	return mac

def on_keepalive_ret(ret):
	try:
		ret = ret.json()
		print ret
		data = ret.get("data", None)
		ret_d = data.get("ret", None)
		print ret_d
		if ret_d == 1002:
			print "---exit---"
			sys.exit(0)

	except Exception, e:
		print "err = %s" %str(e)

#心跳包会话类
class keepalive_session(threading.Thread):
	def __init__(self, ret_handle_func, data, config, timeout=10):
		print "keepalive session init"
		threading.Thread.__init__(self)
		self.timeout = timeout
		self.session = requests.Session()
		self.post_data = data
		self.event = threading.Event()
		self.ret_handle_func = ret_handle_func
		#self.ovd_server = ''
		self.mng_server = ''
		self.stop_flag = False
		self.keepalive_internal=5
	
	#设定心跳间隔时间
	def set_keepalive_internal(self, keepalive_internal):
		self.keepalive_internal = keepalive_internal

	def set_post_data(self, postdata):
		self.post_data = postdata

	def set_stop_flag(self, val):
		self.stop_flag = val

	def run(self):
		print "keepalive_session run as new"

		while True:
			#self.event.wait()
			
			time.sleep(self.keepalive_internal)

			self.mng_server = "192.168.100.234"

			ret = self.keepalive_request_ex()
			#self.event.clear()
			self.ret_handle_func(ret)


	def keepalive_request(self):
		if not self.stop_flag:
			self.event.set()
			self.set_stop_flag( False )

	def keepalive_stop(self):
		self.set_stop_flag(True)
		self.event.clear()



	def keepalive_request_ex(self, data = None, verify = False):
		print "this is in keepalive_request_ex"
		if not self.mng_server:
			print 'mng server IP address is not set'

		if None == data:
			data = self.post_data
		
		ret_code = 0
		str_msg  = None
		resp	 = None

		url = "https://" + self.mng_server + "/mng/terminal/heart_beat"
		print url
		try:
			resp = self.session.post(url, verify=verify, 
				data=data, timeout=self.timeout)

			return resp
		except Exception, e:
			print str(e)
			return None

	

def user_login(ip = None):
	ip = "192.168.100.234"
	username = "test"
	password = "123456"
	mac = get_mac_info()
	try:
		post_url = 'https://' + ip + '/mng/terminal/login'
		post_data = {
			'username' : username,
			'password' : password,
			'mac'      : mac,
		}

		ret = requests.post(post_url, data=post_data, verify=False, timeout=30)

		print ret

		keepalive_ss = keepalive_session(on_keepalive_ret, post_data, None)
		#keepalive_ss.setDaemon(True)
		keepalive_ss.start()		

	                
	except Exception, e:
		print str(e)
		return


user_login()

