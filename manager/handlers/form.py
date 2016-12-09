# -*- coding: utf-8 -*-
#
#
import tornado
import logging
import rsa # need install rsa module first
import base64
import time
import os

from lib.tools import init_logger
from lib.handler import APIHandler
from lib.exceptions import HTTPAPIError
from lib import sh

AUTH_PRI_KEY = "/etc/mng/priv/authkey.key"
AUTH_PUB_KEY = "/etc/mng/priv/authkey.pub"

HTTPS_CERT = '/etc/mng/priv/https_server.crt'
HTTPS_CSR  = '/etc/mng/priv/https_server.csr'
HTTPS_KEY  = '/etc/mng/priv/https_server.key'
HTTPS_REQ_CERT_KEY = '/etc/mng/priv/https_req.key'

logger1 = logging.getLogger("all_logs")

def gen_auth_key():

	print "654321"
	if (not os.path.exists(AUTH_PRI_KEY)):
		try:
			(pubkey, privkey) = rsa.newkeys(2048)
			print "Genrate Public Key..."
			pub = pubkey.save_pkcs1()
			pubfile = open(AUTH_PUB_KEY,'w+')
			pubfile.write(pub)
			pubfile.close()

			print "Genrate Private Key..."
			pri = privkey.save_pkcs1()
			prifile = open(AUTH_PRI_KEY,'w+')
			prifile.write(pri)
			prifile.close()

		except Exception,e:
			print str(e)
			return				
	
	#产生https认证的证书文件
	if (not os.path.exists(HTTPS_CERT) or not os.path.exists(HTTPS_KEY)):
		print "Genrage HTTPS certificate and key..."
		try:
			cmd = sh.Command("/usr/bin/openssl")
			cmd('genrsa', '-out', HTTPS_REQ_CERT_KEY, '2048')
			cmd('req', '-new', '-key', HTTPS_REQ_CERT_KEY, '-out', HTTPS_CSR, '-subj',
					'/CN=Mng Technology Co,.Ltd,/OU=Mng/O=Mng Technology/C=CN')
			cmd('rsa', '-in', HTTPS_REQ_CERT_KEY, '-out', HTTPS_KEY);
			cmd('x509', '-req', '-days', '3650', '-in',HTTPS_CSR,'-signkey',HTTPS_KEY, '-out',HTTPS_CERT);
		except Exception,e:
			print str(e)
			return	
	return;

class FormHandler(APIHandler): 
	def get(self): 
		self.write("Hello, world")

	def post(self):
		logger1.info("------")
		self.write("Hello, this is in post")

class SingleFormHandler(tornado.web.RequestHandler): 
	#def get(self): self.write("Hello, world")
	def get(self):
		pass		

	def post(self):
			pass


class LoginHandler(APIHandler): 
	def get(self):
		pass

	def post(self):
		logger1.info("------")
		print "------"
		username = self.get_argument('username', None)
		password = self.get_argument('password', None)


		timestamp = "%08X" % time.time();
		plain = "MNG:" + username + ":" + timestamp;

		with open(AUTH_PRI_KEY) as privatefile:
			p = privatefile.read()
			privkey = rsa.PrivateKey.load_pkcs1(p)
			privatefile.close()

		ticket = plain + "::" + base64.b64encode(rsa.sign(plain, privkey, 'SHA-1'))
		#print "user:%s ticket=%s" % (username, ticket);
		
		response = {}
		response['username'] = username
		response['ticket'] = ticket
	
		self.set_secure_cookie("MNGAuth", ticket,None)
		self.set_secure_cookie("MNGUser", username,None)

		self.finish(response)
		return

handlers = [(r"/forma", FormHandler),
			(r"/singform/(.*)", SingleFormHandler),
			(r"/login", LoginHandler)]

print "123456"
gen_auth_key()