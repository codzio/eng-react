import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import "../styles/Home.css";

const FeaturesSingleProduct = ({ product, prodVariants, subProduct }) => {
    const getProduct = product;
    const [activeCategory, setActiveCategory] = useState(1);
    const [isPdf, setIsPdf] = useState(false);
    // const [isVariantPdf, setIsVariantPdf] = useState(false);

    const toggleTab = (slug) => {
        setActiveCategory(slug);
    };

    useEffect(() => {
        if(getProduct.pdf != null){
            // console.log(getProduct.pdf);
            setIsPdf(true);
        }
    }, [getProduct.pdf]);

    // useEffect(() => {
    //     if(prodVariants.length !== 0){
    //         // console.log(prodVariants[0].pdf);
    //         setIsVariantPdf(true);
    //     }
    // }, [prodVariants.length]);

    const handleDownload = (pdfFileUrl, no) => {
        toggleTab(no)
        // const pdfFileUrl = ;
        const link = document.createElement('a');
        link.href = pdfFileUrl;
        link.download = pdfFileUrl;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    function refreshPage() {
        setTimeout(function() {
            window.location.reload(true);
        }, 500);
    }

    return (
        <div className="download_tab_sec">
            <div className="containers">
                <div className="download_tab_sec_inner">
                    <div className="tabs download_tabs">
                    <ul className="tab_links">
                        <li className={`${activeCategory === 1 ? 'active' : ""}`} onClick={() => toggleTab(1)}><button>Features</button></li>
                        <li className={`${activeCategory === 2 ? 'active' : ""}`} onClick={() => toggleTab(2)}><button>Technical Specification</button></li>
                        {prodVariants.length > 0 ? (
                            <li className={`${activeCategory === 3 ? 'active' : ""}`} onClick={() => toggleTab(3)}><button>Variants</button></li>
                        ) : (
                            subProduct.length > 0 && (
                                <li className={`${activeCategory === 3 ? 'active' : ""}`} onClick={() => toggleTab(3)}><button>Variants</button></li>
                            )
                        )}
                        {isPdf && (
                            <li className={`${activeCategory === 4 ? 'active' : ""}`} onClick={() => handleDownload(`${process.env.REACT_APP_API_URL}${getProduct.pdf}`,4)}><button>Downloads</button></li>
                        )
                        }
                    </ul>
                    <div className="tab_content download_tabs_content">
                        <div id="tab1" className={`_tab ${activeCategory === 1 ? 'showFeature' : 'hideFeature'}`}>
                            <div dangerouslySetInnerHTML={{ __html: getProduct.features }}></div>
                        </div>
                        <div id="tab2" className={`_tab ${activeCategory === 2 ? 'showFeature' : 'hideFeature'}`}>
                            <div dangerouslySetInnerHTML={{ __html: getProduct.techSpec }}></div>
                        </div>
                        <div id="tab3" className={`_tab ${activeCategory === 3 ? 'showFeature' : 'hideFeature'}`}>
                            {prodVariants.length > 0 ? (
                                prodVariants.map((variant) => (
                                    <div
                                        key={variant._id}
                                        className='_tab product-single-variant' 
                                    >
                                        <ul>
                                            <li>
                                                <p>{variant.title}</p>
                                                <span onClick={() => handleDownload(`${process.env.REACT_APP_API_URL}${variant.pdf}`, 3)} className="variant-download-btn">Download <i className="fa-solid fa-download"></i></span>
                                            </li>
                                        </ul>
                                    </div>
                                ))
                                ) : (
                                subProduct.map((variant) => (
                                    <div
                                        key={variant._id}
                                        className='_tab product-single-variant' 
                                    >
                                        <ul>
                                            <li>
                                                <p>{variant.title}</p>
                                                <NavLink onClick={refreshPage} to={`/products/${variant.slug}`}><span className="variant-download-btn">View Detail</span></NavLink>
                                            </li>
                                        </ul>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                    </div>
                </div> 
            </div>
        </div>
    );
}

export default FeaturesSingleProduct;