import os

from flask import Flask, request, Response, g
from flask import render_template, url_for, send_from_directory
from flask import make_response, abort, jsonify
from flask.ext.sqlalchemy import SQLAlchemy
from flask.ext.httpauth import HTTPBasicAuth

from you_down import app

from you_down.core import api_manager
from you_down.models import Events, Users

from twilio.rest import TwilioRestClient 

for model_name in app.config['API_MODELS']:
  model_class = app.config['API_MODELS'][model_name]
  api_manager.create_api(model_class, methods=['GET', 'POST', 'PUT', 'DELETE'])

session = api_manager.session
client = TwilioRestClient(app.config['ACCOUNT_SID'], app.config['AUTH_TOKEN']) 

db = SQLAlchemy(app)
auth = HTTPBasicAuth()

# routing for basic pages (pass routing onto the Angular app)
@app.route('/')
def index(**kwargs):
  return make_response(open('you_down/templates/index.html').read())

@app.route('/api/invite', methods=['POST'])
def invite():
  event_id = request.json['id']
  creator_name = request.json['creator']['name'].split(' ')[0]

  for user in request.json['not_attendees']:
    link = "http://" + app.config['HOST_DOMAIN'] + "/#/confirm/" + \
      str(event_id) + "?userId=" + str(user['id'])
    message = "Hey %s, This is %s.  " \
        "I'm thinking about %s.  " \
        "Are you down? Reply at %s." % (user['name'].split()[0],
                                        creator_name,
                                        request.json['info'],
                                        link)
    client.messages.create( 
      from_="+14085331025",
      to=user['phone'],
      body=message) 

  return jsonify(request.json), 200

@auth.verify_password
def verify_password(username_or_token, password):
  # first try to authenticate by token
  user = Users.verify_auth_token(username_or_token)
  if not user:
    # try to authenticate with username/password
    user = Users.query.filter_by(username=username_or_token).first()
    if not user or not user.verify_password(password):
      return False
  g.user = user
  return True

@app.route('/api/register_user', methods=['POST'])
def new_user():
  name = request.json['name']
  username = request.json['username']
  password = request.json['password']
  email = request.json['email']
  phone = request.json['phone']

  if username is None or password is None:
    abort(400)    # missing arguments
  if Users.query.filter_by(username=username).first() is not None:
    abort(400)    # existing user
  user = Users(name=name, username=username, email=email, phone=phone)
  user.hash_password(password)
  db.session.add(user)
  db.session.commit()
  return (jsonify({'username': user.username}), 201)

@app.route('/auth/token')
@auth.login_required
def get_auth_token():
  token = g.user.generate_auth_token().decode('ascii')
  return jsonify({'token': token.decode('ascii')})

# special file handlers and error handlers
@app.route('/favicon.ico')
def favicon():
  return send_from_directory(os.path.join(app.root_path, 'static'),
         'img/favicon.ico')

@auth.error_handler
def auth_error():
  abort(401)

@app.errorhandler(404)
def page_not_found(e):
  return render_template('404.html'), 404