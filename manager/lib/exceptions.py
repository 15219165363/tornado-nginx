# -*- coding: utf-8 -*-
#

from tornado import escape
from tornado.web import HTTPError


class HTTPAPIError(HTTPError):
    """API error handling exception

    API server always returns formatted JSON to client even there is
    an internal server error.
    """
    def __init__(self, status_code=400, error_detail="", error_type="", error_id="",
                 notification="", response="", log_message=None, *args):

        HTTPError.__init__(self,int(status_code), log_message, *args)

        self.error_type = error_type if error_type else \
            _error_types.get(self.status_code, "unknow_error")
        self.error_detail = error_detail
        self.error_id = error_id
        self.notification = {"message": notification} if notification else {}
        self.response = response if response else {}

    def __str__(self):
        err = {"meta": {"code": self.status_code, "errorType": self.error_type}}
        self._set_err(err, ["notification", "response"])
        if self.error_detail:
            err["meta"]["errorDetail"] = self.error_detail
        if self.error_id:
            err["meta"]["errorID"] = self.error_id

        return escape.json_encode(err)

    def _set_err(self, err, names):
        for name in names:
            v = getattr(self, name)
            if v:
                err[name] = v


_error_types = {400:'request_error',
                401:'ticket_invalid_auth',
                402:'ticket_expired',
                403:'forbidden',
                404:'not_found',
                405:'ldap_invalid_auth',
                500:'server_error',
                502:'bad_gateway',
                503:'get_server_failed',
				505:'operation_failed'
                }
