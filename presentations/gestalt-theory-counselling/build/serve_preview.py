"""
serve_preview.py
Serves the review page and the finished PowerPoint.

Anything that points at the deck is answered as a download, not a page view:
the response carries Content-Disposition: attachment, so a browser saves the
file straight away instead of trying to open it.

  python serve_preview.py [port]     default 8080, bound to 0.0.0.0

  /                     the review page, every slide as an image
  /download             the deck, straight to the downloads folder
  /<deck file name>     the same
  /auto                 a stub page that starts the download by itself
"""

import os
import sys
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer

HERE = os.path.dirname(os.path.abspath(__file__))
DECK_DIR = os.path.abspath(os.path.join(HERE, ".."))
PREVIEW = os.path.join(DECK_DIR, "preview")
DECK_SRC = "Gestalt Theory and Its Application to Counselling.pptx"
DECK = "Gestalt-Theory-and-Its-Application-to-Counselling.pptx"

# a stub page for anyone who wants the file without any other step: it sends the
# browser on to the download before anything is drawn
AUTO = """<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Your download is starting</title>
<meta http-equiv="refresh" content="0; url=download">
</head>
<body style="margin:0;background:#eef5fa;color:#33506b;
             font:16px/1.7 Segoe UI,Verdana,sans-serif">
<p style="max-width:620px;margin:18vh auto;padding:0 24px">
The PowerPoint is downloading now. If nothing happens,
<a href="download" style="color:#006aad;font-weight:600">click here to save it</a>.
</p>
<script>location.replace("download");</script>
</body>
</html>
"""


def deck_path():
    """The finished deck: the tracked file if it is there, else the preview copy."""
    for cand in (os.path.join(DECK_DIR, DECK_SRC), os.path.join(PREVIEW, DECK)):
        if os.path.exists(cand):
            return cand
    raise FileNotFoundError(DECK_SRC)
DECK_TYPE = ("application/vnd.openxmlformats-officedocument"
             ".presentationml.presentation")


class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *a, **kw):
        super().__init__(*a, directory=PREVIEW, **kw)

    def do_GET(self):
        path = self.path.split("?")[0].rstrip("/") or "/"
        if path == "/download":
            return self.send_deck()
        if path == "/auto":
            return self.send_stub()
        return super().do_GET()

    def send_stub(self):
        body = AUTO.encode("utf-8")
        self.send_response(200)
        self.send_header("Content-Type", "text/html; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(body)

    def send_head(self):
        """A request for the deck itself is answered as an attachment."""
        path = self.path.split("?")[0].rstrip("/")
        if path.endswith(".pptx"):
            return self.send_deck()
        return super().send_head()

    def send_deck(self):
        with open(deck_path(), "rb") as fh:
            data = fh.read()
        self.send_response(200)
        self.send_header("Content-Type", DECK_TYPE)
        self.send_header("Content-Disposition", 'attachment; filename="%s"' % DECK)
        self.send_header("Content-Length", str(len(data)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(data)
        return None

    def log_message(self, fmt, *args):
        sys.stderr.write("%s  %s\n" % (self.address_string(), fmt % args))


def main():
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8080
    httpd = ThreadingHTTPServer(("0.0.0.0", port), Handler)
    print("serving %s on 0.0.0.0:%d" % (PREVIEW, port), flush=True)
    httpd.serve_forever()


if __name__ == "__main__":
    main()
