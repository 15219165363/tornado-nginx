# -*- coding: utf-8 -*-
#
#

import requests
def user_login(ip = None):
	ip = "192.168.100.234"
	username = "test"
	password = "123456"
	try:
		post_url = 'https://' + ip + '/mng/terminal/login'
		post_data = {
			'username' : username,
			'password' : password,
		}

		print post_url
		ret = requests.post(post_url, data=post_data, verify=False, timeout=30)

		print ret

	                
	except Exception, e:
		print str(e)
		return


user_login()

