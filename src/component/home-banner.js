import React from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import '../styles/Home.css';

function PrevArrow(props){
    const {onClick} = props;
    return (
        <div className="arrow_border" onClick={onClick}>
            <span className="prev_arrow arr">
                <i className="fa-solid fa-chevron-left"></i>
            </span>
        </div>
    );
}
function NextArrow(props){
    const {onClick} = props;
    return (
        <div className="arrow_border" onClick={onClick}>
            <span className="next_arrow arr">
                <i className="fa-solid fa-chevron-right"></i>
            </span>
        </div>
    );
}

const HomeBanner = (banners) => {
    const settings = {
        dots: true,
        infinite: true,
        arrows: true,
        autoplay:false,
        autoplaySpeed: 5000,
        nextArrow: <NextArrow />,
        prevArrow: <PrevArrow />,
        slidesToShow: 1,
        slidesToScroll: 1,
        fade: true
    };

    return (
        <div className="home_banner_main_slider homeBannerSlider home_banner_main_sliderf home_main_banner_f">
            <div className="home_banner_slider">
                <Slider {...settings}>
                {banners.banners.map((banner) => (
                    <div className="home_banner" key={banner._id}>
                        <img src={`${process.env.REACT_APP_API_URL}${banner.image}`} alt="" className="main_banner_img" />
                        <div className="home_Pbanner_slides">
                            <div className="home_banner_content">
                                <h1 dangerouslySetInnerHTML={{ __html: banner.title }}></h1>
                                <div dangerouslySetInnerHTML={{ __html: banner.description }}></div>
                            </div>
                        </div>
                    </div>
                ))}
                </Slider>
                <img src="/images/banner_25.png" alt="" className="wave_banner_element" />
            </div>
        </div>
    );
};

export default HomeBanner;