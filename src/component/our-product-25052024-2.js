import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import '../styles/Home.css';
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const OurProduct = (products) => {
    const [sliderLength, setSliderLength] = useState(false);
    
    useEffect(() => {
        const Products = products.products;

        if(Products.length >= 4){
            setSliderLength(true);
        };
    }, [products]);

    const settings = {
        infinite:true,
        autoplay:true, 
        autoplaySpeed:2500,
        slidesToShow:4,
        slidesToScroll:1,
        dots:false,
        arrows:false,
        responsive: [
        {
            breakpoint: 1200,
            settings: {
            slidesToShow:3,
            slidesToScroll: 1
            }
        },
        {
            breakpoint: 991,
            settings: {
            slidesToShow:3,
            slidesToScroll: 1
            }
        },
        {
            breakpoint: 768,
            settings: {
            slidesToShow:2,
            slidesToScroll: 1
            }
        },
        {
            breakpoint: 476,
            settings: {
            slidesToShow:1,
            slidesToScroll: 1

            }
        }
        ]
    };

    return (
        <div className="home_product_sec">
            <div className="containers">
                <h2 className="home_main_heading fadeRight" data-aos="fade-right">
                    our <span>products</span>
                </h2>
                <div className="home_product_sec_inner slickSlideGap">
                    {sliderLength ? (
                        <Slider {...settings}>
                            {products.products.map((product) => (
                                <div
                                    key={product.category._id}  
                                    className="home_product_card flipLeft"
                                    data-aos="flip-left"
                                >
                                    <span>
                                        <img src="images/our-product-thumb.png" alt={product.category.title} />
                                    </span>
                                    <h2>{product.category.title}</h2>
                                    <div className="ourproduct-p" dangerouslySetInnerHTML={{ __html: product.category.description }}></div>
                                    <div className="product__btn">
                                        {/* <Link to={`/products?category=${product.product.slug}`}> */}
                                        <Link to={`/products/${product.product.slug}`}>
                                            <div className="btn___">
                                                <label>Learn More</label>
                                                <span>
                                                    <i className="fa-solid fa-chevron-right fa_chevron_right"></i>
                                                    <i className="fa-solid fa-arrow-right fa_arrow_right"></i>
                                                </span>
                                            </div>
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </Slider>
                    ) : (
                        <div className="our_product_less_slider">
                            {products.products.map((data) => (
                                <div
                                    className="home_product_card flipLeft"
                                    key={data.category._id}
                                    data-aos="flip-left"
                                >
                                    <span>
                                        <img src={`${process.env.REACT_APP_API_URL}${data.category.image}`} alt={data.category.title} />
                                    </span>
                                    <h2>{data.category.title}</h2>
                                    <div className="ourproduct-p" dangerouslySetInnerHTML={{ __html: data.category.description }}></div>
                                    <div className="product__btn">
                                        {/* <Link to={`/products?category=${data.slug}`}> */}
                                        <Link to={`/products/${data.product.slug}`}>
                                            <div className="btn___">
                                                <label>Learn More</label>
                                                <span>
                                                    <i className="fa-solid fa-chevron-right fa_chevron_right"></i>
                                                    <i className="fa-solid fa-arrow-right fa_arrow_right"></i>
                                                </span>
                                            </div>
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default OurProduct;