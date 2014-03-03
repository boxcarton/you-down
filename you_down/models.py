from datetime import datetime

from you_down.core import db
from you_down import app

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
  info = db.Column(db.Text)

  attendees = db.relationship('Users', 
                secondary=attended_events_users,
                backref=db.backref('attended', lazy='dynamic'))
  not_attendees = db.relationship('Users', 
                secondary=not_attended_events_users,
                backref=db.backref('not_attended', lazy='dynamic'))

  def __init__(self, info):
    self.info = info

  def __repr__(self):
    return '<Event %r>' % self.info

class Users(db.Model):
  id = db.Column(db.Integer, primary_key=True)
  name = db.Column(db.Text)
  phone = db.Column(db.Text)

  def __init__(self, name, phone):
    self.name = name
    self.phone = phone

  def __repr__(self):
    return '<User %r>' % self.name

# models for which we want to create API endpoints
app.config['API_MODELS'] = { 'events': Events, 'users': Users }

# models for which we want to create CRUD-style URL endpoints,
# and pass the routing onto our AngularJS application
app.config['CRUD_URL_MODELS'] = { 'events': Events, 'users': Users }