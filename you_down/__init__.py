import os
import json
from flask import Flask, request, Response
from flask import render_template, send_from_directory, url_for

app = Flask(__name__)

app.config.from_object('you_down.settings')
#app.config.from_envvar('YOUDOWN_SETTINGS')

app.url_map.strict_slashes = False

import you_down.core
import you_down.models
import you_down.controllers