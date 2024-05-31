import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import '../styles/Home.css';
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

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

const Projects = (projects) => {
    const [sliderLength, setSliderLength] = useState(false);

    function refreshPage() {
        setTimeout(function() {
            window.location.reload(true);
        }, 500);
    }
    
    useEffect(() => {
        const Projects = projects.projects;

        if(Projects.length >= 1){
            setSliderLength(true);
        };
    }, [projects]);

    const settings = {
        infinite:true,
        autoplay:true, 
        autoplaySpeed:2500,
        slidesToShow:3,
        slidesToScroll:1,
        dots:false,
        nextArrow: <NextArrow />,
        prevArrow: <PrevArrow />,
        arrows:true,
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
        <div className="cases_sec projects_sec">
            <div className="containers">
                <h2 className="home_main_heading">Use <span>Cases</span></h2>
                <div className="cases_sec_inner project_sec_inner_ slickSlideGap">
                    {sliderLength ? (
                        <Slider {...settings}>
                            {projects.projects.map((project) => (
                                <Link key={project._id} onClick={refreshPage} to={`/use-cases/${project.slug}`}>
                                    <div className="box flipLeft" data-aos="flip-left" key={project._id}>
                                        <img src={`${process.env.REACT_APP_API_URL}${project.image}`} alt="" />
                                        <div className="box_content">
                                            <div className="content">
                                                <h3 className="title">{project.title}</h3>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </Slider>
                    ) : (
                        <div className="cases_sec_inner project_sec_inner_">
                            {projects.projects.map((data) => (
                                <Link key={data._id} onClick={refreshPage} to={`/use-cases/${data.slug}`}>
                                    <div className="box flipLeft" data-aos="flip-left" key={data._id}>
                                        <img src={`${process.env.REACT_APP_API_URL}${data.image}`} alt="" />
                                        <div className="box_content">
                                            <div className="content">
                                                <h3 className="title">{data.title}</h3>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Projects;