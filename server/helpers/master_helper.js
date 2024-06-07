const UserModel = require('../models/user_model');
let PROJECT_NAME = "Shop";

module.exports = class Master {
	constructor() {
		
	}

	static siteUrl() {
	    return `${process.env.SITE_URL_NEW}`;
	}

	static siteTitle(title) {
		if (title) {
			return PROJECT_NAME + " | " + title;
		}
		return PROJECT_NAME;
	}

	static slugify(title) {
		return title
		    .toLowerCase()
		    .replace(/[^\w\s-]/g, '') // Remove special characters
		    .replace(/[\s_-]+/g, '-') // Convert spaces and underscores to dashes
		    .replace(/^-+|-+$/g, ''); // Remove leading/trailing dashes
	}

	static async getUserData(email) {
	    try {
	      const data = await UserModel.findOne({email: email})
	      return data;
	    } catch (error) {
	      throw error;
	    }
	}

}