# -*- coding: utf-8 -*-
#
import re
import os
import sys
import time
import json
import socket
import requests
import threading
import functools
import subprocess

from ServerInfo import *
from worker import worker

worker.daemon = True
worker.start()

def create_udp(host="127.0.0.1", port=8081, uuid="000-000-000"):
	try:
		
		s = socket.socket(socket.AF_INET,socket.SOCK_DGRAM)
		
		while True:
			udp_info={}
			cpu_iowait_info = get_cpu_iowait_info()
			udp_info["uuid"] = uuid
			udp_info["cpu"] = cpu_iowait_info.get("cpu", None)
			udp_info["iowait"] = cpu_iowait_info.get("wait", None)
			udp_info = str(udp_info)
			s.sendto(udp_info,(host,port))
			time.sleep(10)
			
	except Exception,e:
		print("create_udp->err=%s" %str(e))
                   
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

#if __name__ == "__main__":
host = "192.168.100.234"
port = 8081
udp_info = {}

uuid = get_uuid()
udp_info["uuid"] = uuid
#user_login()

#worker.put_work(functools.partial(create_udp, host=host, port=8081, udp_info=udp_info))		
create_udp(host, 8081, uuid)


