const path = require("path");
const csrfHelper = require("../../helpers/csrf");
const masterHelper = require("../../helpers/master_helper");
const BannerModel = require("../../models/banner_model");
const UseCasesModel = require("../../models/use_cases_model");
const WhyModel = require("../../models/why_model");
const ProductModel = require("../../models/product_model");
const ProductVariantsModel = require("../../models/product_variants_model");
const TestimonialModel = require("../../models/testimonial_model");
const ClientModel = require("../../models/client_model");
const PageModel = require("../../models/page_model");
const CategoryModel = require("../../models/product_category_model");
const SubCategoryModel = require("../../models/product_subcategory_model");

//Cache
const NodeCache = require('node-cache');
const cache = new NodeCache({ stdTTL: 1200 });

exports.getCategory = async (req, res, next) => {
  try {

    // Check if data is cached
    const cachedData = cache.get('categoryData');
    if (cachedData) {
      return res.status(200).json(cachedData); // Return cached data if available
    }

    const getCategoryIds = await ProductModel.distinct("prodCategory").exec();

    const getCategoryData = await CategoryModel.find({ _id: { $in: getCategoryIds } });

    const categoryWithProductsList = [];

    for (const category of getCategoryData) {
      const subCategories = await SubCategoryModel.find({ prodCategory: category._id });

      const subCategoryWithProducts = [];

      for (const subCategory of subCategories) {
        const products = await ProductModel.find({ prodCategory: category._id, prodSubCategory: subCategory._id });

        subCategoryWithProducts.push({
          _id: subCategory._id,
          title: subCategory.title,
          slug: subCategory.slug,
          description: subCategory.description,
          prodCategory: category,
          subCategoryProducts: products,
        });
      }

      const products = await ProductModel.find({ prodCategory: category._id, prodSubCategory: null });

      const categoryWithProducts = {
        category: category,
        subCategoryWithProducts: subCategoryWithProducts,
        products: products,
      };

      categoryWithProductsList.push(categoryWithProducts);
    }

    const getPage = await PageModel.findOne({ slug: "products" });

    // Cache the fetched data
    const categoryData = {
      siteUrl: masterHelper.siteUrl(),
      categories: getCategoryData,
      categoryWithProductsList: categoryWithProductsList,
      page: getPage,
    };

    cache.set('categoryData', categoryData);
    res.status(200).json(categoryData);

  } catch (err) {
    console.log(err);
    return res.status(400).json({ msg: "Something went wrong." });
  }
};

exports.getProductsByCat = async (req, res, next) => {
  try {

    // Check if data is cached
    const cachedData = cache.get('productCategoryData');
    if (cachedData) {
      return res.status(200).json(cachedData); // Return cached data if available
    }

    const categoryId = req.params.id;
    const getProducts = await ProductModel.find({ prodCategory: categoryId })
      .populate("prodCategory")
      .populate("prodFeatures");

    // Cache the fetched data
    const productCategoryData = {
      siteUrl: masterHelper.siteUrl(),
      products: getProducts,
    };

    cache.set('productCategoryData', productCategoryData);
    res.status(200).json(productCategoryData);

  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Something went wrong." });
  }
};

exports.getProductDetail = async (req, res, next) => {
  try {
    const slug = req.params.slug;

    // Check if data is cached
    const cachedData = cache.get(slug);
    if (cachedData) {
      return res.status(200).json(cachedData); // Return cached data if available
    }

    const getProduct = await ProductModel.findOne({ slug })
      .populate("prodCategory")
      .populate("prodSubCategory")
      .populate("prodFeatures");

    if (!getProduct) {
      return res.status(404).json({ msg: "Product not found." });
    }

    const [getProductVariants, initialSubProducts] = await Promise.all([
      ProductVariantsModel.find({ productId: getProduct._id }),
      ProductModel.find({ product: getProduct._id }).select('_id title slug prodCategory')
    ]);

    let parentProductId = getProduct._id;
    let getSubProducts = initialSubProducts;

    if (getProduct.product != null) {
      parentProductId = getProduct.product;
      getSubProducts = await ProductModel.find({ product: parentProductId, _id: { $ne: getProduct._id } })
        .select('_id title slug prodCategory');
    }

    const responseData = {
      siteUrl: masterHelper.siteUrl(),
      product: getProduct,
      productVariants: getProductVariants,
      subProducts: getSubProducts,
    };

    // Cache the fetched data with the slug as the key
    cache.set(slug, responseData);

    res.status(200).json(responseData);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ msg: "Something went wrong." });
  }
};
