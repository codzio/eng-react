import React, { useEffect, useState } from "react";
import "../styles/Home.css";
import { Link, useLocation } from "react-router-dom";

const ProductListing = (props) => {
    // console.log(props)
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const data_id = queryParams.get('category');
    const category = props.products.categoryWithProductsList;
    const [activeCategory, setActiveCategory] = useState(category[0].category.slug);
    const [activeSubCategory, setActiveSubCategory] = useState(category[0].subCategoryWithProducts[0].slug);
    // console.log(subCategory)


    useEffect(() => {
        if(data_id){
            setActiveCategory(data_id);
        }
    }, [data_id]);

    useEffect(() => {
        // Set the first subcategory as active when the main category changes
        const firstSubCategorySlug = category.find(cat => cat.category.slug === activeCategory)?.subCategoryWithProducts[0]?.slug;
        if (firstSubCategorySlug) {
            setActiveSubCategory(firstSubCategorySlug);
        }
    }, [activeCategory, category]);

    const toggleTab = (slug) => {
        setActiveCategory(slug);
    };
    const toggleSubTab = (slug) => {
        setActiveSubCategory(slug);
    }

    return (
        <div className="home_product_sec product_home_product_sec">
            <div className="containers">
                <div className="product_home_product_sec_tab product_home_product_sec_tab_main_cat">
                    {category.map((data) => (
                        <button
                            key={data.category._id}
                            className={`${activeCategory === data.category.slug ? 'active' : ''}`}
                            onClick={() => toggleTab(data.category.slug)}
                        >
                            {data.category.title}
                        </button>
                    ))}
                </div>
                {category.map((data) => (
                    <div
                        key={data.category._id} 
                        className={`product_home_product_sec_tab product_home_product_sec_tab_sub_cat ${activeCategory === data.category.slug ? 'showCategory' : 'hideCategory'}`}
                        id={data.category.slug}
                    >
                     {data.subCategoryWithProducts.map((subCatData) => (
                            <button
                                key={subCatData._id}
                                className={`${activeSubCategory === subCatData.slug ? 'active' : ''}`}
                                id={subCatData.slug}
                                onClick={() => toggleSubTab(subCatData.slug)}
                            >
                                {subCatData.title}
                            </button>
                        ))}
                    </div>
                ))}
                {category.map((data) => (
                    <div
                        key={data.category._id}
                        className={`home_product_sec_inner mainCategory ${activeCategory === data.category.slug ? 'showCategory' : 'hideCategory'}`}
                        id={data.category.slug}
                    >
                        {data.subCategoryWithProducts.map((subData) => (
                            <div
                                key={subData._id}
                                className={`home_product_sec_inner mainCategory ${activeSubCategory === subData.slug ? 'showCategory' : 'hideCategory'}`}
                                id={subData.slug}
                            >
                                {subData.subCategoryProducts.map((prodData) => (
                                    <Link to={`/products/${prodData.slug}`} className="home_product_card" key={prodData._id}>
                                    <div className="home_product_card home_p_card" data-aos="flip-left">
                                        <img src={`${process.env.REACT_APP_API_URL}${prodData.featuredImg}`} alt={prodData.title} />
                                        <p dangerouslySetInnerHTML={{ __html: prodData.title }}></p>
                                        <div className="product__btn">
                                            
                                                <div className="btn___">
                                                    <label>Product Details</label>
                                                    <span>
                                                        <i className="fa-solid fa-chevron-right _chevron"></i>
                                                        <i className="fa-solid fa-chevron-right chevron_"></i>
                                                    </span>
                                                </div>
                                            
                                        </div>
                                    </div>
                                    </Link>
                                ))}
                            </div>
                        ))}
                    </div>
                ))}

                
            </div>
        </div>
    );
}

export default ProductListing;