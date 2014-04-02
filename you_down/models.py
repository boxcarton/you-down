from datetime import datetime

from you_down.core import db
from you_down import app

from passlib.apps import custom_app_context as pwd_context
from itsdangerous import (TimedJSONWebSignatureSerializer
                          as Serializer, BadSignature, SignatureExpired)

attended_events_users = db.Table('attended_events_users',
    db.Column('event_id', db.Integer, db.ForeignKey('events.id')),
    db.Column('user_id', db.Integer, db.ForeignKey('users.id'))
)

not_attended_events_users = db.Table('not_attended_events_users',
    db.Column('event_id', db.Integer, db.ForeignKey('events.id')),
    db.Column('user_id', db.Integer, db.ForeignKey('users.id'))
)

class Events(db.Model):
  id = db.Column(db.Integer, primary_key=True)
  creator_id = db.Column(db.Integer, db.ForeignKey('users.id'))
  created_time = db.Column(db.DateTime(timezone=False))
  info = db.Column(db.Text)
  status = db.Column(db.Text)

  attendees = db.relationship('Users', 
                secondary=attended_events_users,
                backref=db.backref('attended', lazy='dynamic'))

  not_attendees = db.relationship('Users', 
                secondary=not_attended_events_users,
                backref=db.backref('not_attended', lazy='dynamic'))

  def __init__(self, creator_id, info, status):
    self.creator_id = creator_id
    self.created_time = datetime.utcnow()
    self.info = info
    self.status = status

  def __repr__(self):
    return '<Event %r>' % self.info

class Users(db.Model):
  id = db.Column(db.Integer, primary_key=True)
  name = db.Column(db.Text)
  username = db.Column(db.String(32), index = True) 
  password_hash = db.Column(db.String(128))
  email = db.Column(db.Text)
  phone = db.Column(db.Text)

  created_events = db.relationship("Events", backref="creator")

  def __init__(self, name, username, email, phone):
    self.name = name
    self.username = username
    self.password_hash = None
    self.email = email
    self.phone = phone

  def __repr__(self):
    return '<User %r>' % self.name

  def hash_password(self, password):
    self.password_hash = pwd_context.encrypt(password)

  def verify_password(self, password):
    return pwd_context.verify(password, self.password_hash)

  def generate_auth_token(self, expiration=600):
    s = Serializer(app.config['SECRET_KEY'], expires_in=expiration)
    return s.dumps({'id': self.id, 
                    'username': self.username,
                    'name': self.name})

  @staticmethod
  def verify_auth_token(token):
    s = Serializer(app.config['SECRET_KEY'])
    try:
      data = s.loads(token)
    except SignatureExpired:
      return None    # valid token, but expired
    except BadSignature:
      return None    # invalid token
    user = User.query.get(data['id'])
    return user

# models for which we want to create API endpoints
app.config['API_MODELS'] = { 'events': Events, 'users': Users }