import React from "react";
import "../styles/Home.css";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

function PrevArrow(props){
    const {onClick} = props;
    return (
        <div className="arrow_border gallery_" onClick={onClick}>
            <span className="prev_arrow arr">
                <i className="fa-solid fa-chevron-left"></i>
            </span>
        </div>
    );
}

function NextArrow(props){
    const {onClick} = props;
    return (
        <div className="arrow_border gallery_" onClick={onClick}>
            <span className="next_arrow arr">
                <i className="fa-solid fa-chevron-right"></i>
            </span>
        </div>
    );
}

const Events = ( gallery ) => {
    const settings = {
        dots:true,
        infinite: true,
        arrows:true,
        autoplay:true,
        autoplaySpeed:5000,
        prevArrow: <PrevArrow />,
        nextArrow: <NextArrow />
    };

    return (
        <div className="gallery_banner_sec">
            <div className="containers">
                <h2 className="gallery_h2">Events</h2>
                <div className="gallery_banner_sec_inner eventSlider">
                    <Slider {...settings}>
                    {gallery.gallery.map((data) => (
                        <div className="gallery_banner_slides" key={data._id}>
                            <img src={`${process.env.REACT_APP_API_URL}${data.image}`} alt="" />
                            <div className="gallery_banner_slides_content" dangerouslySetInnerHTML={{ __html: data.description }}></div>
                        </div>
                    ))}
                    </Slider>
                </div>
            </div>
        </div>
    );
}

export default Events;