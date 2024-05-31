import React from "react";
import '../styles/Home.css';

const OtherBanner = ({bannerImg, bannerTitle, bannerPattern}) => {

    if(!bannerImg){
        bannerImg = 'images/team_image.jpg';
    }
    if(!bannerPattern){
        bannerPattern = 'images/other_banner_pattern.png';
    }

    return (
        <div className="home_banner_main_slider product_banner_main">
            <div className="home_banner_slider">
                <div className="home_banner">
                    <img src={bannerImg} alt="" />
                    <div className="home_Pbanner_slides">
                        <div className="home_banner_content">
                            <h1>{bannerTitle}</h1>
                        </div>
                    </div>
                </div>
            </div>
            <img src={bannerPattern} alt="" className="wave_banner_element" />
        </div>
    );
};

export default OtherBanner;