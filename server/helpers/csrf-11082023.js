const crypto = require('crypto');
const csrf = require('csrf');
const tokens = new csrf();

// Create a CSRF token
// const csrfSec = crypto.createHash('sha256', 'csrf-tokens').digest('base64');
// const csrfToken = tokens.create(csrfSec);

// const verifyCsrf = (_csrfToken) => {
//   if (!tokens.verify(csrfSec, _csrfToken)) {
//   	return false; 
//   }
//   return true;
// }

// module.exports = {
// 	csrfSec: csrfSec,
// 	csrfToken: csrfToken,
// 	verifyCsrf: verifyCsrf
// }

module.exports = class Csrf {
   constructor() {
       
   }

   static csrfSec() {
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