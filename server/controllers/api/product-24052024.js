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

exports.getCategory = async (req, res, next) => {
  try {
    const getCategoryIds = await ProductModel.distinct("prodCategory").exec();

    const getCategoryData = await CategoryModel.find({
      _id: { $in: getCategoryIds },
    });

    const categoryWithProductsList = [];

    for (const categoryId of getCategoryIds) {
      const category = await CategoryModel.findById(categoryId);

      subCategoryWithProducts = [];

      const subCategory = await SubCategoryModel.find({
        prodCategory: categoryId,
      });

      if (subCategory) {
        for (const subCat of subCategory) {
          //now get product by subcategory id

          getProductBySubCategory = await ProductModel.find({
            prodSubCategory: subCat._id,
          })
            .populate("prodCategory")
            .populate("prodFeatures")
            .exec();

          subCategoryWithProducts.push({
            _id: subCat._id,
            title: subCat.title,
            slug: subCat.slug,
            description: subCat.description,
            prodCategory: subCat.prodCategory,
            subCategoryProducts: getProductBySubCategory,
          });
        }
      }

      const products = await ProductModel.find({ prodCategory: category._id })
        .populate("prodCategory")
        .populate("prodFeatures")
        .exec();

      const categoryWithProducts = {
        category: category,
        // subCategory: subCategory,
        // products: products,
        subCategoryWithProducts: subCategoryWithProducts,
      };

      categoryWithProductsList.push(categoryWithProducts);
    }

    const getPage = await PageModel.findOne({ slug: "products" });

    res.status(200).json({
      siteUrl: masterHelper.siteUrl(),
      categories: getCategoryData,
      categoryWithProductsList: categoryWithProductsList,
      page: getPage,
    });
  } catch (err) {
    console.log(err);
    return res.status(400).json({ msg: "Something went wrong." });
  }
};

exports.getProductsByCat = async (req, res, next) => {
  try {
    const categoryId = req.params.id;
    const getProducts = await ProductModel.find({ prodCategory: categoryId })
      .populate("prodCategory")
      .populate("prodFeatures")
      .exec();

    res.status(200).json({
      siteUrl: masterHelper.siteUrl(),
      products: getProducts,
    });
  } catch (err) {
    console.log(err);
    return res.status(400).json({ msg: "Something went wrong." });
  }
};

exports.getProductDetail = async (req, res, next) => {
  try {
    const slug = req.params.slug;
    const getProduct = await ProductModel.findOne({ slug: slug })
      .populate("prodCategory")
      .populate("prodSubCategory")
      .populate("prodFeatures")
      .exec();

    const getProductVariants = await ProductVariantsModel.find({
      productId: getProduct._id,
    });


    let parentProductId = getProduct._id;
    let getSubProducts = await ProductModel.find({ product: parentProductId })
      .select('_id title slug prodCategory')
      .exec();

    if (getProduct.product != null) {
      parentProductId = getProduct.product;
      getSubProducts = await ProductModel.find({ product: parentProductId, _id: { $ne: getProduct._id } })
        .select('_id title slug prodCategory')
        .exec();
    }

    res.status(200).json({
      siteUrl: masterHelper.siteUrl(),
      product: getProduct,
      productVariants: getProductVariants,
      subProducts: getSubProducts,
    });
  } catch (err) {
    console.log(err);
    return res.status(400).json({ msg: "Something went wrong." });
  }
};
