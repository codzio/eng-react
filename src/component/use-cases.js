import React from "react";
import '../styles/Home.css';

const UseCases = (useCases) => {
    return (
        <div className="cases_sec">
            <div className="containers">
                <h2 className="home_main_heading">Projects</h2>
                <div className="cases_sec_inner">
                    {useCases.useCases.map((useCase) => (
                        <div className="box" key={useCase._id}>
                            <img src={`${process.env.REACT_APP_API_URL}${useCase.image}`} alt="" />
                            <div className="box_content">
                                <div className="content">
                                    <h3 className="title">{useCase.title}</h3>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default UseCases;