import React from "react";
import '../styles/Home.css';

const QuoteSection = ({ loadedData }) => {
    const heading1 = loadedData.page[0].heading1;

    return (
        <div className="herritage_sec">
            <div className="containers">
                <div className="herritage_sec_inner">
                    <span><img src="images/quote-top.png" alt="" /></span>
                    <h2 dangerouslySetInnerHTML={{ __html: heading1 }}></h2>
                    <span><img src="images/quote-bottom.png" alt="" /></span>
                </div>
            </div>
        </div>
    );
};

export default QuoteSection;