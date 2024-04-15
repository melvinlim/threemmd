#python3 -m http.server

#from https://stackoverflow.com/questions/15288891/how-can-i-serve-files-with-utf-8-encoding-using-python-simplehttpserver

from http.server import HTTPServer, BaseHTTPRequestHandler

from http.server import test, SimpleHTTPRequestHandler as RH
RH.extensions_map={k:v+';charset=utf-8' for k,v in RH.extensions_map.items()}
test(RH)
