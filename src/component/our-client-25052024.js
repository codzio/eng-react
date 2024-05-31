import React, { useState, useEffect } from "react";
import '../styles/Home.css';
import "slick-carousel/slick/slick.css"; 
import "slick-carousel/slick/slick-theme.css";
import Slider from "react-slick";

const OurClient = (clients) => {
    const Clients = clients.clients.clients;
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
        };

        window.addEventListener("resize", handleResize);

        return () => {
            window.removeEventListener("resize", handleResize);
        };
    }, []);

    const settings = {
        slidesToShow: 3,
        slidesToScroll: 1,
        dots: false,
        infinite: true,
        autoplayspeed: 500,
        autoplay: true,
        arrows: false
    };

    return (
        <div className="home_client_sec">
            <div className="containers">
                <h2 className="home_main_heading">Our <span>Clientele</span></h2>
                <div className="home_client_sec_inner">
                {isMobile ? (
                    <Slider {...settings}>
                    {Clients.map((data) => (
                        <div key={data._id}><img src={`${process.env.REACT_APP_API_URL}${data.image}`} data-aos="flip-left" alt="" /></div>
                    ))}
                    </Slider>
                ) : (
                    Clients.map((data) => (
                        <div key={data._id}><img src={`${process.env.REACT_APP_API_URL}${data.image}`} data-aos="flip-left" alt="" /></div>
                    ))
                )}
                </div>
            </div>
        </div>
    );
};

export default OurClient;