import os

DEBUG = True
SECRET_KEY = 'temporary_secret_key' # make sure to change this

SQLALCHEMY_DATABASE_URI = os.environ['DATABASE_URL']

ACCOUNT_SID = "ACd89ad7724ff0516b6d980fa1e198c678" 
AUTH_TOKEN = "84745c9096a1f71d230627784192afe9" 

HOST_DOMAIN = "youdown.herokuapp.com"