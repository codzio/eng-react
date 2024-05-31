import React from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import "../styles/Home.css";

const ProductCategoriesComp = ({ categories, loading }) => {
  
  if (loading) {
    return (<div className="blog_listing_sec use_cases_gallery">
              <div className="containers">
                <div className="blog_listing_sec_inner">
                  Loading categories...
                </div>
            </div>
          </div>); // or a spinner
  }

  // Add a null check for categories and categoryData
  if (!categories || !categories.categoryData) {
    return null; // or some fallback UI
  }

  const { categoryData } = categories;

  return (
    <div className="blog_listing_sec use_cases_gallery">
      <div className="containers">
        <div className="blog_listing_sec_inner">
          {categoryData.map((category) => (
            <Link
              to={`/product-categories/${category.slug}`}
              className="blog_lisitng_card use_cases_lists"
              key={category._id}
            >
              <div className="blog_top_img">
                <img
                  src={`${process.env.REACT_APP_API_URL}${category.image}`}
                  alt={category.title}
                />
              </div>
              <div className="blog_bottom_content prod_cat_bottom">
                <div className="blog__inner_bottom_content">
                  <h2>{category.title}</h2>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

ProductCategoriesComp.propTypes = {
  categories: PropTypes.shape({
    categoryData: PropTypes.arrayOf(
      PropTypes.shape({
        _id: PropTypes.string.isRequired,
        slug: PropTypes.string.isRequired,
        title: PropTypes.string.isRequired,
        image: PropTypes.string.isRequired,
      })
    ).isRequired,
  }).isRequired,
};

export default ProductCategoriesComp;