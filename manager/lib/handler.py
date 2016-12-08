# -*- coding: utf-8 -*-
#

import logging
import traceback
from lib import exceptions
from tornado.web import RequestHandler as BaseRequestHandler, HTTPError

class BaseHandler(BaseRequestHandler):
	def get(self, *args, **kwargs):
		# enable GET request when enable delegate get to post
		if options.app_get_to_post:
			self.post(*args, **kwargs)
		else:
			raise exceptions.HTTPAPIError(500)

class APIHandler(BaseHandler):
	def get_current_user(self):
		pass

	def finish(self, chunk=None, addition_meta=None, data_field=None, notification=None, reflash_cookie=True):
		if chunk is None:
			ret = {}

		data_field = data_field if data_field else 'data'
		if isinstance(chunk, exceptions.HTTPAPIError):
			ret = str(chunk);
		else:
			ret = {"success": "1", "meta": {"code": 200}, data_field: chunk}

		if notification:
			ret["notification"] = {"message": notification}
		if addition_meta:
			for m in addition_meta:
				ret[m] = addition_meta[m]

		self.set_header("Content-Type", "application/json; charset=UTF-8")


		BaseHandler.finish(self, ret)

	def write_error(self, status_code, **kwargs):
		"""Override to implement custom error pages."""
		debug = self.settings.get("debug", False)
		try:
			exc_info = kwargs.pop('exc_info')
			e = exc_info[1]

			if isinstance(e, exceptions.HTTPAPIError):
				print "!!!!!!e = %s" % e
				pass
			elif isinstance(e, HTTPError):
				e = exceptions.HTTPAPIError(e.status_code)				
			else:
				e = exceptions.HTTPAPIError(500)				

			exception = "".join([ln for ln in traceback.format_exception(*exc_info)])

			if status_code == 500 and not debug:
				self._send_error_email(exception)
				
			if debug:
				e.response["exception"] = exception
				print "status_code = %s" % status_code
			self.clear()
			self.set_status(status_code)
			self.set_header("Content-Type", "application/json; charset=UTF-8")
			self.finish(e)
		except Exception:
			logging.error(traceback.format_exc())
			return BaseHandler.write_error(self, status_code, **kwargs)
