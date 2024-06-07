const crypto = require('crypto');
const csrf = require('csrf');
const tokens = new csrf();

module.exports = class Csrf {
   constructor() {
       
   }

   static csrfSec() {
       //secret key
       return crypto.createHash('sha256', 'csrf-tokens').digest('base64');
   }

   static csrfToken() {
       return tokens.create(this.csrfSec());
   }

   static verifyCsrf(_csrfToken) {
		
		if (!tokens.verify(this.csrfSec(), _csrfToken)) {
	  		return false; 
	  	}
	  	
	  	return true;
   }

}