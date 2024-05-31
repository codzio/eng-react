import React, { useState, useEffect } from "react";
import '../styles/Home.css';
import { Link } from "react-router-dom";

const ContactForm = (props) => {
    const commonData = props.loadedData.common[0];
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: '', 
    });
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [requiredError, setRequiredError] = useState('');
    const [loading, setLoading] = useState(false);
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
          ...formData,
          [name]: value,
        });
    };
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.name || !formData.email || !formData.phoneNumber || !formData.subject || !formData.message) {
            setRequiredError('Please fill in all required fields.');
            return;
        }

        setLoading(true);
    
        try {
          const response = await fetch(`${process.env.REACT_APP_API_URL}/api/contact`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData),
          });
    
          if (response.ok) {
            setFormData({
                name: '',
                email: '',
                subject: '',
                message: '',
            });
            setSuccessMessage('Your message has been sent successfully!');
            setErrorMessage('');  
            setRequiredError('');
            setLoading(false);
            setTimeout(() => {
                setSuccessMessage('');
              }, 5000);
          } else {
            const errorData = await response.json();
            setErrorMessage(errorData.message);
            setSuccessMessage('');
            setRequiredError('');
            setLoading(false);
          }
        } catch (error) {
            setErrorMessage('An error occurred. Please try again later.');
            setSuccessMessage('');
            setRequiredError('');
            setLoading(false);
        }
      };

      useEffect(() => {
        if (errorMessage) {
          const timer = setTimeout(() => {
            setErrorMessage('');
          }, 2000);
    
          return () => clearTimeout(timer);
        }
      }, [errorMessage]);

    return (
        <div className="contact_us_sec">
            <div className="containers">
                <div className="contact_us_sec_inner">
                    <div className="contact_form_content">
                        <h2>Contact Us</h2>
                        <p>We're open for any suggestion or<br />
                        just to have a chat</p>
                        <div className="contact_icons_sec">
                            <div className="contact_us_icons">
                                <span><img src="images/location_img.png" alt="" /></span>
                                <div className="contact_icon_content">
                                    <h2>Address:</h2>
                                    <Link href="/" dangerouslySetInnerHTML={{ __html: commonData.websiteAddress }}></Link>
                                </div>
                            </div>
                            <div className="contact_us_icons">
                                <span><img src="images/call_img.png" alt="" /></span>
                                <div className="contact_icon_content">
                                    <h2>Phone:</h2>
                                    <Link href={`tel:${commonData.websitePhone}`}>+{commonData.websitePhone}</Link>
                                </div>
                            </div>
                            <div className="contact_us_icons">
                                <span><img src="images/envelope_img.png" alt="" /></span>
                                <div className="contact_icon_content">
                                    <h2>Email:</h2>
                                    <Link href={`mailto:${commonData.websiteEmail}`}>{commonData.websiteEmail}</Link>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="contact_form">
                        <h2>Send us a message</h2>
                        {successMessage && <p style={{ color: 'green' }}>{successMessage}</p>}
                        {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
                        {requiredError && <p style={{ color: 'red' }}>{requiredError}</p>}
                        <form onSubmit={handleSubmit}>
                            <div className="form_row _form_row">
                                <div className="form_group col-md-6">
                                    <label htmlFor="name">FULL NAME</label>
                                    <input type="text" className="form_control" id="name" name="name" value={formData.name} onChange={handleChange} placeholder="Name" required />
                                </div>
                                <div className="form_group col-md-6">
                                    <label htmlFor="email">EMAIL</label>
                                    <input type="email" className="form_control" id="email" name="email" value={formData.email} onChange={handleChange} placeholder="Email" required />
                                </div>
                            </div>
                            <div className="form_row _form_row">
                                <div className="form_group col-md-6">
                                    <label htmlFor="phoneNumber">Phone Number</label>
                                    <input type="number" className="form_control" id="phoneNumber" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} placeholder="Phone Number" required />
                                </div>
                                <div className="form_group  col-md-6">
                                    <label htmlFor="subject">SUBJECT</label>
                                    <input type="text" className="form_control" id="subject" name="subject" value={formData.subject} onChange={handleChange} placeholder="Subject" required />
                                </div>
                            </div>
                            <div className="form_group">
                                <label htmlFor="message">Message</label>
                                <textarea placeholder="Message" id="message" name="message" value={formData.message} onChange={handleChange} rows="4" col="3" required></textarea>
                            </div>
                            <button className="contact_form_btn" type="submit">{loading ? 'Loading...' : 'Send Message'}</button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ContactForm;