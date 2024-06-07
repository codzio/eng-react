const path = require("path");
const csrfHelper = require("../../helpers/csrf");
const masterHelper = require("../../helpers/master_helper");
const BlogModel = require('../../models/blog_model');
const CategoryModel = require('../../models/category_model');

//Cache
const NodeCache = require('node-cache');
const cache = new NodeCache({ stdTTL: 1200 });

exports.getBlogs = async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 9;
  const searchTerm = req.query.search || '';

  try {

    // Check if data is cached
    // const cachedData = cache.get('blogData');
    // if (cachedData) {
    //   return res.status(200).json(cachedData); // Return cached data if available
    // }

    const query = {
      $or: [
        { "title": { $regex: searchTerm, $options: "i" } },
        { "description": { $regex: searchTerm, $options: "i" } },
      ],
    };

    const totalBlogs = await BlogModel.countDocuments(query);
    const blogs = await BlogModel.find(query)
      .sort({ publishDate: -1 })
      .populate("category")
      .populate('user')
      .skip((page - 1) * limit)
      .limit(limit)
      .exec();

    // Cache the fetched data
    const blogData = {
      siteUrl: masterHelper.siteUrl(),
      totalBlogs: totalBlogs,
      blogs: blogs,
    };

    //cache.set('blogData', blogData);
    res.status(200).json(blogData);
   
  } catch (err) {
    console.error(err);
    return res.status(400).json({ msg: 'Something went wrong.' });
  }
};

exports.getBlogsByCategory = async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 9;
  const categoryTerm = req.query.category || '';

  try {

    // Check if data is cached
    const cachedData = cache.get('blogCategoryData');
    if (cachedData) {
      return res.status(200).json(cachedData); // Return cached data if available
    }

    const pipeline = [
      {
        $match: {
          "category.slug": categoryTerm,
        },
      },
      {
        $lookup: {
          from: "categories",
          localField: "category",
          foreignField: "_id",
          as: "categoryData",
        },
      },
      {
        $unwind: "$categoryData",
      },
      {
        $lookup: {
          from: "users",
          localField: "user",
          foreignField: "_id",
          as: "userData",
        },
      },
      {
        $unwind: "$userData",
      },
      {
        $facet: {
          blogs: [
            { $skip: (page - 1) * limit },
            { $limit: limit },
          ],
          totalCount: [
            { $count: "count" },
          ],
        },
      },
    ];

    const result = await BlogModel.aggregate(pipeline);
    const blogs = result[0].blogs;
    const totalCount = result[0].totalCount[0] ? result[0].totalCount[0].count : 0;

    // Cache the fetched data
    const blogCategoryData = {
      siteUrl: masterHelper.siteUrl(),
      totalBlogs: totalCount,
      blogs: blogs,
    };

    cache.set('blogCategoryData', blogCategoryData);
    res.status(200).json(blogCategoryData);
   
  } catch (err) {
    console.error(err);
    return res.status(400).json({ msg: 'Something went wrong.' });
  }
};

exports.getBlogDetail = async (req, res, next) => {
  const slug = req.params.slug;

  try {

    // Check if data is cached
    const cachedData = cache.get('blogDetailData');
    if (cachedData) {
      return res.status(200).json(cachedData); // Return cached data if available
    }

    const [blogs, recentBlogs, getCategoryIds] = await Promise.all([
      BlogModel.find({slug: slug}).populate('category').populate('user').exec(),
      BlogModel.find().sort({ _id: -1 }).limit(3).exec(),
      BlogModel.distinct('category').exec()
    ]);

    // Fetch category data based on the distinct category IDs
    const getCategoryData = await CategoryModel.find({ _id: { $in: getCategoryIds } });

    // Cache the fetched data
    const blogDetailData = {
      siteUrl: masterHelper.siteUrl(),
      blog: blogs,
      recentBlogs: recentBlogs,
      getCategoryData: getCategoryData
    };

    cache.set('blogDetailData', blogDetailData);
    res.status(200).json(blogDetailData);
   
  } catch (err) {
    console.error(err);
    return res.status(400).json({ msg: 'Something went wrong.' });
  }
};

