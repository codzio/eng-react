import React, { useState } from "react";
import "../styles/Home.css";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { Link } from "react-router-dom";
import EnquiryForm from "./enquiry-form";

const ProductSingleSlider = (props) => {
    const getProduct = props.product;
    const [isPopUpOpen, setIsPopUpOpen] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);

    const toggleReadMore = () => {
        setIsExpanded(!isExpanded);
    };

    const truncateDescription = (description, length) => {
        if (description.length <= length) return description;
        return description.slice(0, length) + '...';
    };

    function openPopup(){
        setIsPopUpOpen(true);
    }
    
    const settings1 = {
        arrows:false,
        autoplay:true, 
        autoplaySpeed:2500
    };
    const settings2 = {
        arrows:false,
        infinite:false,
        autoplay:true, 
        autoplaySpeed:2500,
        slidesToShow:3,
        slidesToScroll:1,
        responsive:[
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
                slidesToShow:3,
                slidesToScroll: 1
                }
            },
            {
                breakpoint: 600,
                settings: {
                slidesToShow:2,
                slidesToScroll: 1

                }
            }
        ]
    };

    return (
        <div className="air_quality_sec">
            <div className="containers">
                <div className="air_quality_sec_inner">
                    <div className="air_slider_sec">
                        <div className="air_slider_images">
                            <Slider {...settings1}>
                            <img src={`${process.env.REACT_APP_API_URL}${getProduct.featuredImg}`} alt="" />
                            {getProduct.addImages.map((addImg, index) => ( 
                                <img src={`${process.env.REACT_APP_API_URL}${addImg}`} key={index} alt="" />
                            ))} 
                            </Slider>
                        </div>
                        <div className="air_slider_navs productDetailSlider">
                            <Slider {...settings2}>
                            <div className="slick_nxt"><img src={`${process.env.REACT_APP_API_URL}${getProduct.featuredImg}`} alt="" /></div>
                            {getProduct.addImages.map((addImg, index) => ( 
                                <div className="slick_nxt" key={index}><img src={`${process.env.REACT_APP_API_URL}${addImg}`} alt="" /></div>
                            ))}
                            </Slider>
                        </div>
                    </div>			
                    <div className="air_content_sec">
                        <div className="air_content_sec_inner">
                            <h2 dangerouslySetInnerHTML={{ __html: getProduct.title }}></h2>
                            <div>
                                <span
                                  dangerouslySetInnerHTML={{
                                    __html: isExpanded
                                      ? getProduct.description
                                      : truncateDescription(getProduct.description, 1120)
                                  }}
                                ></span>
                                {getProduct.description.length > 1120 && (
                                  <span className="readMore" onClick={toggleReadMore} style={{ color: 'blue', cursor: 'pointer' }}>
                                    {isExpanded ? ' Show Less' : ' Read More'}
                                  </span>
                                )}
                            </div>
                            <Link href="/" onClick={() => openPopup()}>Enquire Now</Link>
                        </div>
                        <div className="air_quality_icons_sec">
                            {getProduct.prodFeatures.map((data) => (
                                <div className="quality_icons single_product_quality_icons" key={data._id}>
                                    <span><img src={`${process.env.REACT_APP_API_URL}${data.image}`} alt="" /></span>
                                    <p dangerouslySetInnerHTML={{ __html: data.title }}></p>
                                </div>
                            ))}
                        </div>
                        {isPopUpOpen && (
                            <EnquiryForm enquiry={`${isPopUpOpen ? 'showEnquiry' : 'hideEnquiry'}`} scale={`${isPopUpOpen ? 'scaleIn' : 'scaleOut'}`} setIsPopUpOpen={setIsPopUpOpen} />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ProductSingleSlider;