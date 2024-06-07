const path = require("path");
const csrfHelper = require("../../helpers/csrf");
const masterHelper = require("../../helpers/master_helper");
const BlogModel = require('../../models/blog_model');
const CategoryModel = require('../../models/category_model');

exports.getBlogs = async (req, res, next) => {

	const page = parseInt(req.query.page) || 1;
  	const limit = parseInt(req.query.limit) || 9;
  	const searchTerm = req.query.search || '';
  	//const categoryTerm = req.query.category || '';

  	const query = {
	  $or: [
	    { "title": { $regex: searchTerm, $options: "i" } }, // Case-insensitive title search
	    { "description": { $regex: searchTerm, $options: "i" } }, // Case-insensitive content search
	  ],
	};

	try {

		const totalBlogs = await BlogModel.count(query);
	    const blogs = await BlogModel.find(query).sort({ publishDate: -1 })
	    .populate("category")
	    .populate('user')
	    .skip((page - 1) * limit)
	    .limit(limit)
	    .exec();

		res.status(200).json({
			siteUrl: masterHelper.siteUrl(),
			totalBlogs: totalBlogs,
			blogs: blogs,
		});

	} catch(err) {
		console.log(err);
		return res.status(400).json({msg: 'Something went wrong.'});
	}
}

exports.getBlogsByCategory = async (req, res, next) => {

	const page = parseInt(req.query.page) || 1;
  	const limit = parseInt(req.query.limit) || 9;
  	//const searchTerm = req.query.search || '';
  	const categoryTerm = req.query.category || '';

  	const pipeline = [
	  {
	    $lookup: {
	      from: "categories", // The name of the Category collection
	      localField: "category", // Field in Blog model that holds the reference
	      foreignField: "_id", // Field in Category model to match against
	      as: "categoryData",
	    },
	  },
	  {
	    $unwind: "$categoryData",
	  },
	  {
	    $lookup: {
	      from: "users", // The name of the users collection
	      localField: "user", // Field in Blog model that holds the reference
	      foreignField: "_id", // Field in Category model to match against
	      as: "userData",
	    },
	  },
	  {
	    $unwind: "$userData",
	  },
	  {
	    $match: {
	      "categoryData.slug": categoryTerm,
	    },
	  },
	  {
	    $facet: {
	      blogs: [
	        { $skip: (page - 1) * limit },
	        { $limit: limit },
	      ],
	      totalCount: [
	        {
	          $count: "count",
	        },
	      ],
	    },
	  },
	];

	const result = await BlogModel.aggregate(pipeline);
	const blogs = result[0].blogs;
	const totalCount = result[0].totalCount[0] ? result[0].totalCount[0].count : 0;

	res.status(200).json({
		siteUrl: masterHelper.siteUrl(),
		totalBlogs: totalCount,
		blogs: blogs,
	});
}

exports.getBlogDetail = async (req, res, next) => {

	const slug = req.params.slug;

	try {

	    const blogs = await BlogModel.find({slug: slug}).populate('category')
	    .populate('user').exec();

	    const recentBlogs = await BlogModel.find().sort({ _id: -1 }).limit(3)

	    const getCategoryIds = await BlogModel.distinct('category').exec();
	    const getCategoryData = await CategoryModel.find({ _id: { $in: getCategoryIds } });

		res.status(200).json({
			siteUrl: masterHelper.siteUrl(),			
			blog: blogs,
			recentBlogs: recentBlogs,
			getCategoryData: getCategoryData
		});

	} catch(err) {
		console.log(err);
		return res.status(400).json({msg: 'Something went wrong.'});
	}
}
