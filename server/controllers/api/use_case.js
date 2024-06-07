const path = require("path");
const csrfHelper = require("../../helpers/csrf");
const masterHelper = require("../../helpers/master_helper");
const CategoryModel = require('../../models/product_category_model');
const UseCasesModel = require('../../models/use_cases_model');
const ServiceType = require('../../models/service_type_model');

//Cache
const NodeCache = require('node-cache');
const cache = new NodeCache({ stdTTL: 1200 });

exports.getCases = async (req, res, next) => {
	try {

		// Check if data is cached
	    const cachedData = cache.get('casesData');
	    if (cachedData) {
	      return res.status(200).json(cachedData); // Return cached data if available
	    }

	    const getUseCase = await UseCasesModel.find().sort({ _id: -1 }).populate('services').exec();

	    // Cache the fetched data
	    const casesData = {
	      siteUrl: masterHelper.siteUrl(),
		  useCase: getUseCase,
	    };

	    cache.set('casesData', casesData);
	    res.status(200).json(casesData);

	} catch(err) {
		console.log(err);
		return res.status(400).json({msg: 'Something went wrong.'});
	}
}
