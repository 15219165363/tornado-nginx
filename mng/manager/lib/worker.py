#!/usr/bin/python
# -*- coding: utf-8 -*-
#
import threading
import Queue


class Worker(threading.Thread):

	def __init__(self):
		super(Worker, self).__init__()
		self.queue = Queue.Queue()

	def run(self):
		while True:
			try:
				work = self.queue.get()
				work()
				self.queue.task_done()
			except Exception,e:
				print("run->err = %s" %str(e))

	def put_work(self,work):
		self.queue.put(work)


worker = Worker()

