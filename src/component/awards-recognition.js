import React from "react";
import "../styles/Home.css";

const AwardsRecognition = (gallery) => {
    const heading1 = gallery.gallery[0].heading1;
    const description = gallery.gallery[0].description;

    return (
        <div className="awards_sec">
            <div className="containers">
                <h2 className="gallery_h2">{ heading1 }</h2>
                <div className="awards_sec_inner">
                    <div className="awards_content_sec mobile">
                        <div dangerouslySetInnerHTML={{ __html: description }}></div>
                    </div>
                    <div className="awards_img_sec"><img src="images/award.png" alt="" /></div>
                    <div className="awards_content_sec desktop">
                        <div dangerouslySetInnerHTML={{ __html: description }}></div>
                    </div>
                </div>

                <div className="awards_sec_inner">
                    <div className="awards_content_sec">
                        <div><p>Engineering & Environmental Solutions recognized as one of the Best Technology Company in Clean Start ups category.</p></div>
                    </div>
                    <div className="awards_img_sec"><img src="images/award-2.png" alt="" /></div>
                </div>
            </div>
        </div>
    );
}

export default AwardsRecognition;