# -*- coding: utf-8 -*-
# date:2016-12-07
# author: zzw
#

import logging
import logging.handlers
import re
import rsa
import base64
import time


AUTH_PRI_KEY = "/etc/mng/priv/authkey.key"
AUTH_PUB_KEY = "/etc/mng/priv/authkey.pub";

def init_logger(name, level = "DEBUG", f = None):
	LEVEL = getattr(logging, level.upper(), None)
	logger = logging.getLogger(name)
	logger.propagate = False           #don't propagate to root logger!
	logger.setLevel(LEVEL)
	#formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
	formatter = logging.Formatter('%(asctime)s - %(filename)s:%(lineno)s - %(levelname)s - %(message)s')

	if f:
		fh = logging.handlers.RotatingFileHandler(f, maxBytes=1024*1024*50, backupCount=5)
		fh.setLevel(LEVEL)
		fh.setFormatter(formatter)
		logger.addHandler(fh)
	else:
		sh = logging.StreamHandler()
		sh.setLevel(LEVEL)
		sh.setFormatter(formatter)
		logger.addHandler(sh)
	return logger


mng_ticket = re.compile("^(MNG:\S+)::([^:\s]+)$");
mng_plain = re.compile("^MNG:(\S+):([A-Z0-9]{8})$")

def verify_ticket(ticket):
	res = mng_ticket.match(ticket);
	if res != None:
		plain = res.groups()[0]
		sig = res.groups()[1]

		with open(AUTH_PUB_KEY) as publickfile:
			p = publickfile.read()
			pubkey = rsa.PublicKey.load_pkcs1(p)
			publickfile.close()

		#check the signature first
		try:
			rsa.verify(plain, base64.b64decode(sig), pubkey)
		except rsa.VerificationError:
			return False

		#print "vertify signature success!"
		res = mng_plain.match(plain)
		if (res != None):
			timestamp = res.groups()[1]
			ttime = int(timestamp, 16)
			age =  time.time() - ttime
			if (age > -300):
				return True

	return False;
