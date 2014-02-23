from datetime import datetime

from you_down.core import db
from you_down import app

event_account = db.Table('event_account',
    db.Column('event_id', db.Integer, db.ForeignKey('event.id')),
    db.Column('account_id', db.Integer, db.ForeignKey('account.id'))
)

class Event(db.Model):
	id = db.Column(db.Integer, primary_key=True)
	title = db.Column(db.Text)
	location = db.Column(db.Text)
	time = db.Column(db.Text)

	attendees = db.relationship('Account', secondary=event_account,
		backref=db.backref('attended', lazy='dynamic'))
	not_attendees = db.relationship('Account', secondary=event_account,
		backref=db.backref('not_attended', lazy='dynamic'))

	def __init__(self, title, location, time):
		self.title = title
		self.location = location
		self.time = time

	def __repr__(self):
		return '<Event %r>' % self.title

class Account(db.Model):
	id = db.Column(db.Integer, primary_key=True)
	name = db.Column(db.Text)
	phone = db.Column(db.Text)

	def __init__(self, name, phone):
		self.name = name
		self.phone = phone

	def __repr__(self):
		return '<Account %r>' % self.name

# models for which we want to create API endpoints
app.config['API_MODELS'] = { 'event': Event, 'account': Account }

# models for which we want to create CRUD-style URL endpoints,
# and pass the routing onto our AngularJS application
app.config['CRUD_URL_MODELS'] = { 'event': Event, 'account': Account }