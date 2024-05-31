import React from "react";
import '../styles/Home.css';
import Slider from "react-slick";
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

function PrevArrow(props){
    const {onClick} = props;
    return (
        <span className="prev_arrow arr" onClick={onClick}>
            <i className="fa-solid fa-chevron-left"></i>
        </span>
    );
}

function NextArrow(props){
    const {onClick} = props;
    return (
        <span className="next_arrow arr" onClick={onClick}>
            <i className="fa-solid fa-chevron-right"></i>
        </span>
    );
}

const Testimonials = (testimonials) => {
    const Testimonials = testimonials.testimonials.testimonials;
    
    const settings = {
        dots:true,
        infinite: true,
        speed: 300,
        arrows:true,
        autoplay:true,
        autoplaySpeed: 2500,
        nextArrow: <NextArrow />,
        prevArrow: <PrevArrow />
    };

    return (
        <div className="home_testimonial_sec testimonialSlider">
            <div className="containers testi_containers">
                <div className="home_testimonial_sec_main">
                    <Slider {...settings}>
                    {Testimonials.map((data) => (
                        <div key={data._id} className="tstimonial_slider_slides">
                            <div className="home_testimonial_sec_inner">
                                <div className="home_testi_slides"  data-aos="flip-up">
                                    <span><img src="images/quote-top.png" alt="" /></span>
                                    <div dangerouslySetInnerHTML={{ __html: data.review }}></div>
                                    <span className="span_last_child"><img src="images/quote-bottom.png" alt="" /></span>
                                </div>
                            </div>
                            <div className="testimonial_man_img">
                                <h2>{data.name}</h2>
                                <p dangerouslySetInnerHTML={{ __html: data.designation }}></p>
                            </div>
                        </div>
                    ))}
                    </Slider>
                </div>
            </div>
        </div>
    );
};

export default Testimonials;