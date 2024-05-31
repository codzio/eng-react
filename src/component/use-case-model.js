import React, { useState } from "react";
import "../styles/Home.css";

const UseCaseModel = (props) => {
    const useCase = props.useCase.useCase;
    const [isPopUpOpen, setIsPopUpOpen] = useState(false);
    const [selecteData, setSelectedData] = useState(null);

    function openPopup(data){
        setSelectedData(data);
        setIsPopUpOpen(true);
    }
    function closePopup(){
        const popupContainer = document.querySelector('.inner');
        popupContainer.classList.add('scaleOut');

        // Delay closing the popup
        setTimeout(() => {
            setIsPopUpOpen(false);
        }, 500);
        console.log(selecteData);
    }

    return (
        <div>
            <div className="blog_listing_sec use_cases_gallery">
                <div className="containers">
                    <div className="blog_listing_sec_inner">
                    {useCase.map((data) => (
                        <div className="blog_lisitng_card use_cases_lists" key={data._id} onClick={() => openPopup(data)}>
                            <div className="blog_top_img">
                                <img src={`${process.env.REACT_APP_API_URL}${data.image}`} alt="" />
                            </div>			
                            <div className="blog_bottom_content">
                                <div className="blog__inner_bottom_content">
                                    <h2>{data.title}</h2>
                                    {data.location ? (
                                      <p dangerouslySetInnerHTML={{ __html: data.location }}></p>
                                    ) : (
                                      <p dangerouslySetInnerHTML={{ __html: '&nbsp;' }}></p>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                    </div>
                </div>
            </div>
            {isPopUpOpen && (
                <div className={`use_case_popup myModal ${isPopUpOpen ? 'showFeature' : 'hideFeature'}`}>
                    <div className="main">
                        <div className={`inner ${isPopUpOpen ? 'scaleIn' : 'scaleOut'}`}>
                            <span className="close" onClick={() => closePopup()}>&times;</span>
                            <div className="head">
                                <div>
                                    <h2 className={`${isPopUpOpen ? 'drop_in' : ''}`}>{selecteData.title}</h2>
                                    <p className={`${isPopUpOpen ? 'drop_in_2' : ''}`}>{selecteData.location}</p>
                                </div>
                                <img src="images/brand-new.png" alt="" />
                            </div>
                            <div className="flex_">
                                <img src={`${process.env.REACT_APP_API_URL}${selecteData.image}`} alt="" className={`main_img ${isPopUpOpen ? 'scaleIn' : ''}`}  />
                                <div className="grid_">
                                    {selecteData.services.length > 0 && typeof selecteData.services[0] !== 'undefined' && (
                                        <div className="row_1">
                                            {selecteData.services.length > 1 && typeof selecteData.services[0] !== 'undefined' && (
                                                <div className={`cols_ cols_1 ${isPopUpOpen ? 'drop_in_3' : ''}`}>
                                                    <span><img src={`${process.env.REACT_APP_API_URL}${selecteData.services[0].icon}`} alt="" /></span>
                                                    <p>{selecteData.services[0].title}</p>
                                                </div>
                                            )}
                                            {selecteData.services.length > 1 && typeof selecteData.services[1] !== 'undefined' && (
                                                <div className={`cols_ cols_2 ${isPopUpOpen ? 'drop_in_4' : ''}`}>
                                                    <span><img src={`${process.env.REACT_APP_API_URL}${selecteData.services[1].icon}`} alt="" /></span>
                                                    <p>{selecteData.services[1].title}</p>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {selecteData.services.length > 0 && typeof selecteData.services[2] !== 'undefined' && (
                                        <div className="row_2">
                                            {selecteData.services.length > 1 && typeof selecteData.services[2] !== 'undefined' && (
                                                <div className={`cols_ cols_3 ${isPopUpOpen ? 'drop_in_5' : ''}`}>
                                                    <span><img src={`${process.env.REACT_APP_API_URL}${selecteData.services[2].icon}`} alt="" /></span>
                                                    <p>{selecteData.services[2].title}</p>
                                                </div>
                                            )}
                                            {selecteData.services.length > 1 && typeof selecteData.services[3] !== 'undefined' && (
                                                <div className={`cols_ cols_4 ${isPopUpOpen ? 'drop_in_6' : ''}`}>
                                                    <span><img src={`${process.env.REACT_APP_API_URL}${selecteData.services[3].icon}`} alt="" /></span>
                                                    <p>{selecteData.services[3].title}</p>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {selecteData.services.length > 0 && typeof selecteData.services[4] !== 'undefined' && (
                                        <div className="row_2">
                                            {selecteData.services.length > 1 && typeof selecteData.services[4] !== 'undefined' && (
                                                <div className={`cols_ cols_5 ${isPopUpOpen ? 'drop_in_7' : ''}`}>
                                                    <span><img src={`${process.env.REACT_APP_API_URL}${selecteData.services[4].icon}`} alt="" /></span>
                                                    <p>{selecteData.services[4].title}</p>
                                                </div>
                                            )}
                                            {selecteData.services.length > 1 && typeof selecteData.services[5] !== 'undefined' && (
                                                <div className={`cols_ cols_6 ${isPopUpOpen ? 'drop_in_8' : ''}`}>
                                                    <span><img src={`${process.env.REACT_APP_API_URL}${selecteData.services[5].icon}`} alt="" /></span>
                                                    <p>{selecteData.services[5].title}</p>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {selecteData.services.length > 0 && typeof selecteData.services[6] !== 'undefined' && (
                                        <div className="row_2">
                                            {selecteData.services.length > 1 && typeof selecteData.services[6] !== 'undefined' && (
                                                <div className={`cols_ cols_7 ${isPopUpOpen ? 'drop_in_9' : ''}`}>
                                                    <span><img src={`${process.env.REACT_APP_API_URL}${selecteData.services[6].icon}`} alt="" /></span>
                                                    <p>{selecteData.services[6].title}</p>
                                                </div>
                                            )}
                                            {selecteData.services.length > 1 && typeof selecteData.services[7] !== 'undefined' && (
                                                <div className={`cols_ cols_8 ${isPopUpOpen ? 'drop_in_10' : ''}`}>
                                                    <span><img src={`${process.env.REACT_APP_API_URL}${selecteData.services[7].icon}`} alt="" /></span>
                                                    <p>{selecteData.services[7].title}</p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className={`main_content ${isPopUpOpen ? 'drop_in_8' : ''}`}>
                                <div dangerouslySetInnerHTML={{ __html: selecteData.description }}></div>
                            </div>
                            {selecteData.clients.length > 0 && typeof selecteData.clients[0] !== 'undefined' && (
                            <div className="bottom_grid">
                                <div className="cols_">
                                    <h2>Our <br /> Clients</h2>
                                </div>
                                {selecteData.clients.map((data, index) => (
                                    <div className="cols_" key={index}>
                                        <p>{data}</p>
                                    </div>
                                ))}
                            </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default UseCaseModel;