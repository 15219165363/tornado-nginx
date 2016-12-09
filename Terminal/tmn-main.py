# -*- coding: utf-8 -*-
#
#

import requests
import subprocess
import re
import os

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

	                
	except Exception, e:
		print str(e)
		return


user_login()

