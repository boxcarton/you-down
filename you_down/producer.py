from twilio.rest import TwilioRestClient 
 
# put your own credentials here 
ACCOUNT_SID = "ACd89ad7724ff0516b6d980fa1e198c678" 
AUTH_TOKEN = "84745c9096a1f71d230627784192afe9" 
 
client = TwilioRestClient(ACCOUNT_SID, AUTH_TOKEN) 
 
client.messages.create( 
	from_="+14085331025",
	to="4088239830",
	body="Yo click this, http://imgur.com/gallery/7LysX5Z" 
)