import React, { useEffect, useState } from "react";
import '../styles/Home.css';

const HomeAboutVideo = () => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            if(document.querySelectorAll('#vplay').length > 0){
                var windowHeight = window.innerHeight,
		        videoEl = document.querySelectorAll('#vplay');

                for (var i = 0; i < videoEl.length; i++) {

                    var thisVideoEl = videoEl[i],
                        videoHeight = thisVideoEl.clientHeight,
                        videoClientRect = thisVideoEl.getBoundingClientRect().top;

                    if ( videoClientRect <= ( (windowHeight) - (videoHeight*.5) ) && videoClientRect >= ( 0 - ( videoHeight*.5 ) ) ) {
                        thisVideoEl.play();
                        setIsVisible(true);
                    } else {
                        thisVideoEl.pause();
                        setIsVisible(false);
                    }

                };
            };
        };
        window.addEventListener('scroll', handleScroll);
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    return (
        <div className="home_team_sec">
            <div className="containers">
                <div className="home_team_sec_inner">
                    <div className="w-100-f">
                        <div className="home_team_content m-l-auto">
                            <span className="desktop-quote"><img src="images/quote-top.png" alt="" /></span>
                        </div>
                    </div>
                    <div className="home_team_img" data-aos="fade-left">
                        <div className="home_team_img_inner">
                            <video width="100%" height="" controls="" id="vplay" muted loop >
                                <source src="images/video2.mp4" type="video/mp4" />
                            </video>
                            <img src="images/_video.png" className={`video'_ ${isVisible ? 'd_none' : ''}`} alt="" />
                            <span className={`player ${isVisible ? 'd_none' : ''}`} id="player">
                                <img src="images/play_btn.png" alt="" />
                            </span>
                        </div>
                    </div>
                    <div className="home_team_content" data-aos="fade-right">
                        <span className="mobile-quote"><img src="images/quote-top.png" alt="" /></span>
                        <p>We are a team of <br /> passionate engineers, <br /> working synergistically <br /> with our clients
                            to create <br /> performance-driven and <br /> cost-effective environment <br />
                            management solutions</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HomeAboutVideo;