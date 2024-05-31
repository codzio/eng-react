import React from "react";
import '../styles/Home.css';

const AboutJourney = ({ loadedData }) => {
    const heading2 = loadedData.page[0].heading2;
    const description = loadedData.page[0].description;
    const ourJourney = loadedData.page[0].data[0].ourJourney;

    return (
        <div className="home_team_sec _journey_sec">
            <div className="containers">
                <div className="journey_sec_inner">
                    <div className="home_team_sec_inner _flip">
                        <div className="home_team_img">
                            <img src="images/journey1.jpg" alt="" />
                        </div>
                        <div className="home_team_content">
                            <h2 dangerouslySetInnerHTML={{ __html: heading2 }}></h2>
                            <div dangerouslySetInnerHTML={{ __html: description }}></div>
                        </div>
                    </div>
                    <div className="home_team_sec_inner">
                        <div className="home_team_img">
                            <img src="images/journey2.jpg" alt="" />
                        </div>
                        <div className="home_team_content">
                            <h2>Our <span>Journey</span></h2>
                            <p dangerouslySetInnerHTML={{ __html: ourJourney }}></p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AboutJourney;