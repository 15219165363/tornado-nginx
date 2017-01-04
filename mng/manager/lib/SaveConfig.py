#!/usr/bin/python
# -*- coding: utf-8 -*-
#

import os
import copy
import json
import logging

file_info = {}

logger_all = logging.getLogger("log_all")

def json_reader(filename, fd):
	try:
		return json.load(fd)
	except Exception,e:
		return {}

def json_writer(filename, fd, data):
	return json.dump(data, fd, indent=4)


def file_register(fid, filename, reader, writer):
	if (filename in file_info):
		raise Exception("filename already exists!")
	temp = {'filename': filename, 'reader': reader, 'writer': writer};
	file_info[fid] = temp;
	print "file_info = %s" %file_info

def file_read(fid):
	if (fid in file_info):
		filename = file_info[fid]['filename']
		reader = file_info[fid]['reader']
		res = {}
		if (os.path.exists(filename)):
			fd = open(filename, 'r')
			res = reader(filename, fd)
			fd.close();
		else:
			print("%s: No such file." % filename);
		return res;

def file_write(fid, data):
	try:
		if (fid in file_info):
			writer = file_info[fid]['writer']
			filename = file_info[fid]['filename']

			tmpname = filename + ".tmp";
			fd = open(tmpname, 'w');
			res = writer(filename, fd, data);
			fd.close();

			os.rename(tmpname, filename)

			return res;

	except Exception,e:
		logger_all.error("file_write->err = %s" %str(e))

def gen_getter(k):
	def _(self):
		attr = k + "_conf"
		if not hasattr(self, attr):
			v = file_read(k)
			setattr(self, attr, v)
		else:
			v = getattr(self, attr)
		return copy.deepcopy(v)
	return _

def gen_setter(k):
	def _(self, v):
		attr = k + "_conf"
		setattr(self, attr, v)
		file_write(k, v)

	return _

class Cache_file(object):
	"""docstring for Cache_file"""
	
	server = property(gen_getter("server"), gen_setter("server"))

	def __init__(self):
	 	super(Cache_file, self).__init__()
	 	self.f = None


	def reload_config(self):
		self.server = file_read("server")

CONFIG = Cache_file()

