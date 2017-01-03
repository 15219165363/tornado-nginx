#!/usr/bin/python
# -*- coding: utf-8 -*-
#

import re
import os
import sys
import time
import subprocess

res1 = {}

def get_cpu_iowait_info():
	try:
		track_file = "/proc/stat"
		global res1
		fd = open(track_file)
		content_list = fd.readlines()
		fd.close()

		cpucount = 0
		res = {}
		for line in content_list:
			m = re.match(r"^cpu\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s", line)
			if m:
				res['user']= int( m.group(1))
				res['nice']=  m.group(2)
				res['system']=  m.group(3)
				res['idle']= m.group(4)
				res['used']= int( m.group(1)) + int( m.group(2)) + int( m.group(3))
				res['iowait']= int( m.group(5))
			m1 = re.match(r"^cpu(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s", line)	
			if m1:
				cpucount = cpucount + 1
		if cpucount == 0:
			cpucount = 1
		ctime = time.time()
		res['ctime'] = ctime	
		res['cpu'] = 0
		res['wait'] = 0
		res2 =[]
		if res1.keys() == []:
			res1 = res

		ctime1 = res1.get('ctime')
		diff = (ctime - ctime1) * 100 * cpucount
		if (diff > 1000):
			used1 = res['used']
			used2 = res1.get('used')
			useddiff = used1 - used2
			if useddiff > diff:
				useddiff = diff
			res['cpu'] = useddiff / diff
			iowait1 = res['iowait']
			iowait2 = res1.get('iowait')
			waitdiff = iowait1 - iowait2
			if waitdiff > diff:
				waitdiff = diff
			res['wait'] = waitdiff / diff
			res1 = res
		
		return res
	except Exception, e:
		print("get_cpu_iowait_info->err = %s" % str(e))		

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

def get_uuid():
	try:
		cmd = "dmidecode | grep UUID"
		res = os.popen(cmd).readline()
		res = res.split(":")
		uuid = res[1]
		uuid = uuid.strip()
		return uuid		
	except Exception,e:
		print("get_uuid->err = %s" %str(e))
		return "000000-000000-000000-000000"

