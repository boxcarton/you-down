from datetime import datetime

from you_down.core import db
from you_down import app

attended_event_user = db.Table('attended_event_user',
    db.Column('event_id', db.Integer, db.ForeignKey('event.id')),
    db.Column('user_id', db.Integer, db.ForeignKey('user.id'))
)

not_attended_event_user = db.Table('not_attended_event_user',
    db.Column('event_id', db.Integer, db.ForeignKey('event.id')),
    db.Column('user_id', db.Integer, db.ForeignKey('user.id'))
)

class Event(db.Model):
	id = db.Column(db.Integer, primary_key=True)
	title = db.Column(db.Text)
	location = db.Column(db.Text)
	time = db.Column(db.Text)

	attendees = db.relationship('User', secondary=attended_event_user,
		backref=db.backref('attended', lazy='dynamic'))
	not_attendees = db.relationship('User', secondary=not_attended_event_user,
		backref=db.backref('not_attended', lazy='dynamic'))

	def __init__(self, title, location, time):
		self.title = title
		self.location = location
		self.time = time

	def __repr__(self):
		return '<Event %r>' % self.title

class User(db.Model):
	id = db.Column(db.Integer, primary_key=True)
	name = db.Column(db.Text)
	phone = db.Column(db.Text)

	def __init__(self, name, phone):
		self.name = name
		self.phone = phone

	def __repr__(self):
		return '<User %r>' % self.name

# models for which we want to create API endpoints
app.config['API_MODELS'] = { 'event': Event, 'user': User }

# models for which we want to create CRUD-style URL endpoints,
# and pass the routing onto our AngularJS application
app.config['CRUD_URL_MODELS'] = { 'event': Event, 'user': User }