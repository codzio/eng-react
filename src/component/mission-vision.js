import React from "react";
import '../styles/Home.css';

const MissionVision = ({ loadedData }) => {
    const mission = loadedData.page[0].data[0].mission;
    const vision = loadedData.page[0].data[0].vision;

    return (
        <section>
            <div className="about_flower_sec _driven">
                <div className="containers">
                    <div className="about_flower_sec_inner">
                        <div className="about_flower_img_sec">
                            <img src="images/tree.png" alt="" />
                        </div>
                        <div className="driven_content">
                            <div className="driven_content_inner">
                                <h2>Mission</h2>
                                <p dangerouslySetInnerHTML={{ __html: mission }}></p>
                            </div>
                            <div className="driven_content_inner">
                                <h2>Vision</h2>
                                <p dangerouslySetInnerHTML={{ __html: vision }}></p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default MissionVision;