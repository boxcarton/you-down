import os

from flask import Flask, request, Response
from flask import render_template, url_for, redirect, send_from_directory
from flask import send_file, make_response, abort, jsonify

from you_down import app

# routing for API endpoints (generated from the models designated as API_MODELS)
from you_down.core import api_manager
from you_down.models import *

from twilio.rest import TwilioRestClient 

for model_name in app.config['API_MODELS']:
	model_class = app.config['API_MODELS'][model_name]
	api_manager.create_api(model_class, methods=['GET', 'POST', 'PUT', 'DELETE'])

session = api_manager.session
client = TwilioRestClient(app.config['ACCOUNT_SID'], app.config['AUTH_TOKEN']) 

# routing for basic pages (pass routing onto the Angular app)
@app.route('/')
def basic_pages(**kwargs):
	return make_response(open('you_down/templates/index.html').read())

# routing for CRUD-style endpoints
# passes routing onto the angular frontend if the requested resource exists
from sqlalchemy.sql import exists

crud_url_models = app.config['CRUD_URL_MODELS']

@app.route('/<model_name>/')
@app.route('/<model_name>/<item_id>')
def rest_pages(model_name, item_id=None):
	if model_name in crud_url_models:
		model_class = crud_url_models[model_name]
		if item_id is None or session.query(exists().where(
			model_class.id == item_id)).scalar():
			return make_response(open(
				'you_down/templates/index.html').read())
	abort(404)

@app.route('/api/invite', methods=['POST'])
def invite():
	event_id = request.json['id']

	for friend in request.json['not_attendees']:
		link = "http://" + app.config['HOST_DOMAIN'] + "/#/confirm/" + \
				str(event_id) + "?userId=" + str(friend['id'])
		message = "Hey %s, This is the YouDown app.  " \
				  "I'm thinking about %s " \
				  "at %s starting at %s.  " \
				  "Are you down? Go to %s to reply." % (friend['name'],
					 					  request.json['title'],
					 					  request.json['location'],
					 					  request.json['time'],
					 					  link)
		client.messages.create( 
			from_="+14085331025",
			to=friend['phone'],
			body=message) 

	return jsonify(request.json), 200

# special file handlers and error handlers
@app.route('/favicon.ico')
def favicon():
	return send_from_directory(os.path.join(app.root_path, 'static'),
							   'img/favicon.ico')

@app.errorhandler(404)
def page_not_found(e):
    return render_template('404.html'), 404
