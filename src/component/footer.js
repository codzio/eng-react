import '../styles/Footer.css';
import React from 'react';
import { Link } from 'react-router-dom';
import LazyLoad from 'react-lazyload';

const Footer = (props) => {
    const allData = props.common;
    let categoryData;
    if(allData && allData.siteUrl && allData.common){
        categoryData = allData.common;
    }
    let fDescription, siteAddress, sitePhone, siteEmail, fb, twitter, insta, youtube, linkedin, copyright;

    if(categoryData){
        fDescription = categoryData[0].footerDescription;
        siteAddress = categoryData[0].websiteAddress;
        sitePhone = categoryData[0].websitePhone;
        siteEmail = categoryData[0].websiteEmail;
        fb = categoryData[0].socialLinks.facebook;
        twitter = categoryData[0].socialLinks.twitter;
        insta = categoryData[0].socialLinks.instagram;
        youtube = categoryData[0].socialLinks.youtube;
        linkedin = categoryData[0].socialLinks.linkedin;
        copyright = categoryData[0].copyright;
      }

    function refreshPage() {
        setTimeout(function() {
            window.location.reload(true);
        }, 500);
    }

    return(
        <>
            <LazyLoad height={200} offset={100} once>
                <footer className="main_footer_elm">
                    <div className="containers">
                        <div className="footer_inner">
                        <div className="footer_social_icon">
                            <Link to="/" className="footer_logo">
                                <img src="images/brand-new-white.png" alt="Brand Logo" />
                            </Link>
                            <p>{fDescription}</p>
                            <div className="footer_icons">
                            <Link to={`${fb}`}><span><i className="fa-brands fa-facebook-f"></i></span></Link>
                            <Link to={`${twitter}`}><span><i className="fa-brands fa-twitter"></i></span></Link>
                            <Link to={`${insta}`}><span><i className="fa-brands fa-instagram"></i></span></Link>
                            <Link to={`${youtube}`}><span><i className="fa-brands fa-youtube"></i></span></Link>
                            <Link to={`${linkedin}`}><span><i className="fa-brands fa-linkedin"></i></span></Link>
                            </div>
                        </div>
                        <div className="footer_services">
                            <h2>Locations</h2>
                            <ul>
                                <li><a style={{cursor:'default'}}>USA</a></li>
                                <li><a style={{cursor:'default'}}>GHANA</a></li>
                                <li><a style={{cursor:'default'}}>U.A.E</a></li>
                                <li><a style={{cursor:'default'}}>OMAN</a></li>
                                <li><a style={{cursor:'default'}}>INDIA</a></li>
                                <li><a style={{cursor:'default'}}>NEPAL</a></li>
                                <li><a style={{cursor:'default'}}>MALDIVES</a></li>
                                <li><a style={{cursor:'default'}}>SRI LANKA</a></li>
                            </ul>
                        </div>
                        <div className="footer_company">
                            <h2>Quick Links</h2>
                            <ul>
                            <li><Link to="/about">About Us</Link></li>
                            <li><Link to="/gallery">Gallery</Link></li>
                            <li><Link to="/use-cases">Use Cases</Link></li>
                            <li><Link to="/projects">Projects</Link></li>
                            {/* <li><Link to="/products">Products</Link></li> */}
                            <li><Link to="/career">Careers</Link></li>
                            <li><Link to="/blogs">Blogs</Link></li>
                            <li><Link to="/contact">Contact</Link></li>
                            <li><Link onClick={refreshPage} to="/privacy-policy">Privacy Policy</Link></li>
                            <li><Link onClick={refreshPage} to="/terms-and-conditions">Terms & Conditions</Link></li>
                            </ul>
                        </div>
                        <div className="footer_contact">
                            <h2>Contact Us</h2>
                            <ul>
                            <li><Link to={`tel:91${sitePhone}`}>+{sitePhone}</Link></li>
                            <li><Link to={`mailto:${siteEmail}`}>{siteEmail}</Link></li>
                            <li><Link to="/" dangerouslySetInnerHTML={{ __html: siteAddress }}></Link></li>
                            </ul>
                        </div>
                        </div>
                    </div>
                </footer>
            </LazyLoad>
            <div className="footer_copyright">
                <div className="containers">
                    <p>&#169; {copyright}</p>
                </div>
            </div>
        </>
    );
};

export default Footer;