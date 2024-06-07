import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import "../styles/Home.css";

const FeaturesSingleProduct = ({ product, prodVariants, subProduct }) => {
    const getProduct = product;
    const [activeCategory, setActiveCategory] = useState(1);
    const [isPdf, setIsPdf] = useState(false);
    // const [isVariantPdf, setIsVariantPdf] = useState(false);

    const [modalOpen, setModalOpen] = useState(false);
    const [videoUrl, setVideoUrl] = useState('');
    const [iframeLoaded, setIframeLoaded] = useState(false);

    const openModal = (url) => {
        console.log('open model', url);
        setVideoUrl(url);
        setModalOpen(true);
    };

    const closeModal = () => {
        console.log('close model');
        setModalOpen(false);
        setVideoUrl('');
    };

    const handleIframeLoad = () => {
        setIframeLoaded(true); // Set loading status to true when iframe content is loaded
    };

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
                            {product.videos.length > 0 && (
                                <li className={`${activeCategory === 5 ? 'active' : ""}`} onClick={() => toggleTab(5)}><button>Videos</button></li>
                            )}
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
                            {product.videos.length > 0 && (
                              <div id="tab5" className={`_tab ${activeCategory === 5 ? 'showFeature' : 'hideFeature'}`}>
                                <div className="gallery">
                                  {product.videos.map((video, index) => (
                                    <a key={index} href="javascript:void(0)" className="video" onClick={() => openModal(video)}>
                                      <img src="images/default.png" alt={`Video ${index + 1} Thumbnail`} width="200" height="150" />
                                      <div className="for-border">
                                        <span><i className="fa-solid fa-play"></i></span>
                                      </div>
                                    </a>
                                  ))}
                                </div>
                              </div>
                            )}
                        </div>
                    </div>
                </div>
                {modalOpen && (
                <div className="modal" id="modal" style={{ display: modalOpen ? 'block' : 'none' }}>
                  <div className="modal-content" id="modal-content">
                    <span className="close" onClick={closeModal}><i className="fa-solid fa-xmark"></i></span>
                    {!iframeLoaded && <p className="video-preloading"><i className="fa fa-spinner fa-spin"></i></p>}
                    <iframe
                      className="modal-frame"
                      width="560"
                      height="315"
                      src={`${videoUrl}?autoplay=1&muted=1`}
                      frameBorder="0"
                      allowFullScreen
                      onLoad={handleIframeLoad} // Call handleIframeLoad when the iframe content is loaded
                      style={{ display: iframeLoaded ? 'block' : 'none' }} // Hide iframe until loaded
                    ></iframe>
                  </div>
                </div>
              )}
            </div>
        </div>
    );
}

export default FeaturesSingleProduct;