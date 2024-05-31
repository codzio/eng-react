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
                <i className="fa-solid fa-chevron-left" ></i>
            </span>
        </div>
    );
}

function NextArrow(props){
    const {onClick} = props;
    return (
        <div className="arrow_border gallery_" onClick={onClick}>
            <span className="next_arrow arr">
                <i className="fa-solid fa-chevron-right" ></i>
            </span>
        </div>
    );
}

const Certificate = (gallery) => {
    const settings = {
        slidesToShow: 3,
        slidesToScroll: 1,
        centerMode: true,
        dots:false,
        prevArrow: <PrevArrow />,
        nextArrow: <NextArrow />,
        centerPadding: '20px',
        infinite: true,
        autoplaySpeed: 1500,
        pauseOnHover:true,
        autoplay: true,
        responsive: [
            {
            breakpoint: 768,
                settings: {
                    slidesToShow:3,
                    slidesToScroll: 1
                }
            },
            {
            breakpoint: 601,
                settings: {
                    slidesToShow:1,
                    slidesToScroll: 1
                }
            }
        ]
    };

    return (
        <div className="certificate_Slider gallery_center_mode_slider">
            <div className="wrapper home__center__slider section certificateSlider" id="Recognition@Certificates">
                <div className="containers">
                    <h2 className="gallery_h2">Certificate</h2>
                    <div className="center_slider">
                        <Slider {...settings}>
                        {gallery.gallery.map((data) => (
                            <div className="recognize__cards" key={data._id}>
                                <img src={`${process.env.REACT_APP_API_URL}${data.image}`} alt="" />
                            </div>
                        ))}
                        </Slider>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Certificate;