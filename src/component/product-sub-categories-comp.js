import React from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import "../styles/Home.css";

const ProductSubCategoriesComp = ({ productData, loading }) => {
  
  if (loading) {
    return (<div className="blog_listing_sec use_cases_gallery">
              <div className="containers">
                <div className="blog_listing_sec_inner">
                  Loading products...
                </div>
            </div>
          </div>); // or a spinner
  }

  if (!productData || !productData.category || !productData.products) {
    return null; // or some fallback UI
  }

  const { products, category } = productData;

  return (
    <>
      <div className="we_do_sec product_we_do_sec">
        <div className="containers">
          <div className="we_do_sec_inner">
            <div className="focus_content" data-aos="fade-up-left">
              <h2>{category.title} <br /> Products</h2>
            </div>
            <div className="we_do_content" data-aos="fade-up-right">
              <p>Engineering & Environmental Solutions Pvt Ltd is a pioneer in providing breakthrough technological solutions centralized towards protecting the environment and promoting a sustainable tomorrow. We develop environmental monitoring instruments using sensor-driven technologies</p>
            </div>
          </div>
        </div>
      </div>
      <div className="blog_listing_sec use_cases_gallery">
        <div className="containers">
          <div className="blog_listing_sec_inner">
            {products.map((product) => (
              <Link
                to={`/products/${product.slug}`}
                className="blog_lisitng_card use_cases_lists"
                key={product._id}
              >
                <div className="blog_top_img">
                  <img
                    src={`${process.env.REACT_APP_API_URL}${product.featuredImg}`}
                    alt={product.title}
                  />
                </div>
                <div className="blog_bottom_content prod_cat_bottom">
                  <div className="blog__inner_bottom_content">
                    <h2>{product.title}</h2>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

ProductSubCategoriesComp.propTypes = {
  productData: PropTypes.shape({
    products: PropTypes.arrayOf(
      PropTypes.shape({
        _id: PropTypes.string.isRequired,
        slug: PropTypes.string.isRequired,
        title: PropTypes.string.isRequired,
        featuredImg: PropTypes.string.isRequired,
      })
    ).isRequired,
    category: PropTypes.shape({
      title: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
};

export default ProductSubCategoriesComp;
