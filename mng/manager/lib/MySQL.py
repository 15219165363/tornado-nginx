#!/usr/bin/python
# -*- coding: utf-8 -*-
#

import logging
import MySQLdb

logger_all = logging.getLogger("log_all")
class MysqlApi(object):

	def __init__(self):
		pass
	#打开数据库连接
	def open_db(self, db_name = None):
		try:
			ip = "localhost"
			username = "root"
			password = "123456"
			
			if db_name:
				db = MySQLdb.connect(ip, username, password, db_name)
			else:
				db = MySQLdb.connect(ip, username, password)
			print "db = %s" %db
			return db
		except Exception,e:
			logger_all.error("open_db->err = %s" %str(e))
			return None
		
	# 关闭数据库连接
	def close_db(self, db = None):
		try:
			if db:
				db.close()
		except Exception,e:
			logger_all.error("close_db->err = %s" %str(e))
		
	#获取当前的版本号
	def get_version(self, cursor=None):
		try:
			version = None
			if cursor:
				# 使用execute方法执行SQL语句
				cursor.execute("SELECT VERSION()")

				# 使用 fetchone() 方法获取一条数据库。
				version = cursor.fetchone()	

			return version
			
		except Exception,e:
			logger_all.error("get_version->err = %s" %str(e))
	
	#列出所有数据库
	def get_db_list(self, cursor=None):
		try:		
			db_list = []
			if cursor:
				cursor.execute("show databases")
				for db in cursor.fetchall():
					db_list.append(db[0])
				
			return db_list
		except Exception,e:
			logger_all.error("get_db_list->err = %s" %str(e))
		
	#获取当前数据库里所有表的列表
	def get_tb_list(self, cursor = None, db_name=None):
		try:	
			tb_list = []	
			
			if cursor:
				cursor.execute("use %s" %db_name)
				cursor.execute("select database()")
				print("当前所在数据库：%s" %cursor.fetchall()[0])
				all_table = cursor.execute("show tables")
				for tb in cursor.fetchall():
					tb_list.append(tb[0])
			
			return tb_list
			
		except Exception,e:
			logger_all.error("get_tb_list->err = %s" %str(e))
		
	#检查某个数据库是否存在
	def check_db_exist(self, cursor=None, db_name=None):
		try:
			if cursor and db_name:		
				db_list = self.get_db_list(cursor)
				if db_name in db_list:
					return True
			
			return False
				
		except Exception,e:
			logger_all.error("check_db_exist->err = %s" %str(e))

	#创建数据库
	def create_db(self, db_name=None):
		try:
			db = None
			db = self.open_db()
			cursor = db.cursor()		
			if db_name:
				if self.check_db_exist(cursor, db_name):
					print"%s数据库已存在" %db_name
				else:
					print"创建数据库成功"
					cursor.execute("create database %s" %db_name)

			self.close_db(db)
		except Exception,e:
			self.close_db(db)
			logger_all.error("create_bd->err = %s" %str(e))
		
	#检查某个表是否存在
	def check_tb_exist(self, cursor=None, db_name=None, tb_name=None):
		try:
			if cursor and db_name and tb_name:
				tb_list = self.get_tb_list(cursor, db_name)
				if tb_name in tb_list:
					return True
					
			return False
		
		except Exception,e:
			logger_all.error("check_tb_exist->err = %s" %str(e))
	
	#在某个数据库中创建一个表与增加列
	def create_table(self, cursor=None, db_name=None, tb_name=None, col_list=None):
		try:
			if cursor and db_name and tb_name and col_list:
				if self.check_tb_exist(cursor, db_name, tb_name):
					logger_all.info("%s表已经存在" %tb_name)
					print ("%s表已经存在" %tb_name)
				else:
					logger_all.info("创建表")
					print ("创建表")
					cmd_sql = "create table %s(examlpe char(1))" %tb_name
					cursor.execute(cmd_sql)

					self.add_column(cursor, tb_name, col_list)
					
		except Exception,e:
			logger_all.error("create_table->err = %s" %str(e))
		
	#在表中增加列
	def add_column(self, cursor=None, tb_name=None, col_list=None):
		try:
			if cursor and tb_name and col_list:
				print("创建列")
				for col_info in col_list:
				
					col_name = col_info[0]
					col_type = "%s(%s)" %(col_info[1], col_info[2])
					cmd_sql = "alter table %s add column %s %s" %(tb_name,col_name,col_type)
					print cmd_sql
					cursor.execute(cmd_sql)
				
		except Exception,e:
			logger_all.error("add_column->err = %s" %str(e))
	
	#在表中插入信息
	def insert_to_table(self, db_name=None, tb_name=None, info_list=None):
		try:
			db = None
			if db_name and tb_name and info_list:
				print "this is in insert_to_table"
				username = info_list[0]
				password = info_list[1]
				role = info_list[2]
				expire = info_list[3]
				comment = info_list[4]
						
				db = self.open_db(db_name)
				cursor = db.cursor()	
				cmd_sql = "insert into %s(username, password, role, expire, comment) values ('%s', '%s', '%s', '%s', '%s')" %(tb_name, username, password, role, expire, comment)
				print cmd_sql
				cursor.execute(cmd_sql)
				self.close_db(db)

		except Exception,e:
			self.close_db(db)
			logger_all.error("insert_to_table->err = %s"%str(e))
		
	#获取数据库信息
	def select_info(self, db_name=None, tb_name=None):
		try:
			if db_name and tb_name:
				db = None
				db = self.open_db(db_name)
				cursor = db.cursor()	
				cmd_sql = "select * from %s" %tb_name
				cursor.execute(cmd_sql)
				aaa = cursor.fetchall()
				print aaa
				
				self.close_db(db)
		except Exception,e:
			logger_all.error("select_info->err = %s" %str(e))	