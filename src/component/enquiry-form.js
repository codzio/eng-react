import React from "react";
import '../styles/Home.css';
import { useState, useEffect  } from "react";

const EnquiryForm = ({ enquiry, scale, setIsPopUpOpen }) => {
    const [formData, setFormData] = useState({
        organizationName: '',
        firstName: '',
        lastName: '',
        designation: '',
        contactNumber: '',
        email: '',
        city: '',
        country: '',
        product: 'DEFAULT',
        potentialAssociation: 'DEFAULT',
        productPage: '',
        query: '', 
    });
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [requiredError, setRequiredError] = useState('');
    const [loading, setLoading] = useState(false);
    // const fileInputRef = useRef(null);

    useEffect(() => {
        // Function to get the page title
        const getPageTitle = () => {
            return document.title;
        };

        // Set the value of productPage to the page title
        setFormData(prevState => ({
            ...prevState,
            productPage: getPageTitle()
        }));
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.organizationName || !formData.firstName || !formData.lastName || !formData.designation || !formData.contactNumber || !formData.email || !formData.city || !formData.country || !formData.product || !formData.potentialAssociation || !formData.query === '') {
            setRequiredError('Please fill in all required fields.');
            return;
        }

        setLoading(true);
    
        try {
            const formDataToSend = new FormData();
            formDataToSend.append('organizationName', formData.organizationName);
            formDataToSend.append('firstName', formData.firstName);
            formDataToSend.append('lastName', formData.lastName);
            formDataToSend.append('designation', formData.designation);
            formDataToSend.append('contactNumber', formData.contactNumber);
            formDataToSend.append('email', formData.email);
            formDataToSend.append('city', formData.city);
            formDataToSend.append('country', formData.country);
            formDataToSend.append('product', formData.product);
            formDataToSend.append('potentialAssociation', formData.potentialAssociation);
            formDataToSend.append('productPage', formData.productPage);
            formDataToSend.append('query', formData.query); 


          const response = await fetch(`${process.env.REACT_APP_API_URL}/api/enquiry`, {
            method: 'POST',
            body: formDataToSend,
          });
    
          if (response.ok) {
            setFormData({
                organizationName: '',
                firstName: '',
                lastName: '',
                designation: '',
                contactNumber: '',
                email: '',
                city: '',
                country: '',
                product: 'DEFAULT',
                potentialAssociation: 'DEFAULT',
                productPage: '',
                query: '', 
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

      function closePopup(){
        const popupContainer = document.querySelector('.enquiryForm_main .contact_form');
        popupContainer.classList.add('scaleOut');

        // Delay closing the popup
        setTimeout(() => {
            setIsPopUpOpen(false);
        }, 500);
    }


    return (
        <div className={`career_sec myModal enquiryForm_main ${enquiry}`}>
            <div className={`contact_form inner ${scale}`}>
                <span className="close" onClick={() => closePopup()}>&times;</span>
                <h2>Enquiry Form</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form_group col-md-12 f_name">
                        <label htmlFor="organizationName">ORGANIZATION NAME</label>
                        <input type="text" className="form-control" id="organizationName" name='organizationName' value={formData.organizationName} onChange={handleChange} placeholder="Organization Name" required />
                    </div>
                    <div className="form-row _form_row">
                        <div className="form_group col-md-6">
                            <label htmlFor="firstName">FIRST NAME</label>
                            <input type="text" className="form-control" id="firstName" name='firstName' value={formData.firstName} onChange={handleChange} placeholder="First Name" required />
                        </div>
                        <div className="form_group col-md-6">
                            <label htmlFor="lastName">LAST NAME</label>
                            <input type="text" className="form-control" id="lastName" name='lastName' value={formData.lastName} onChange={handleChange} placeholder="Last Name" required />
                        </div>
                    </div>
                    <div className="form-row _form_row">
                        <div className="form_group col-md-6">
                            <label htmlFor="designation">DESIGNATION</label>
                            <input type="designation" className="form-control" id="designation" name='designation' value={formData.designation} onChange={handleChange} placeholder="Designation" required />
                        </div>
                        <div className="form_group col-md-6">
                            <label htmlFor="contactNumber">CONTACT</label>
                            <input type="phone" className="form-control" id="contactNumber" name='contactNumber' value={formData.contactNumber} onChange={handleChange} placeholder="Your Contact Number" required />
                        </div>
                    </div>
                    <div className="form-row _form_row">
                        <div className="form_group col-md-6">
                            <label htmlFor="email">EMAIL</label>
                            <input type="email" className="form-control" id="email" name='email' value={formData.email} onChange={handleChange} placeholder="Email" required />
                        </div>
                        <div className="form_group col-md-6">
                            <label htmlFor="city">CITY</label>
                            <input type="text" className="form-control" id="city" name='city' value={formData.city} onChange={handleChange} placeholder="City" required />
                        </div>
                    </div>
                    <div className="form-row _form_row">
                        <div className="form_group col-md-6">
                            <label htmlFor="country">COUNTRY</label>
                            <input type="text" className="form-control" id="country" name='country' value={formData.country} onChange={handleChange} placeholder="Country" required />
                        </div>
                        <div className="form_group col-md-6">
                            <label htmlFor="product">PRODUCT</label>
                            <select className="form_select" aria-label="Default select example" id="product" name="product" value={formData.product} onChange={handleChange} required>
                                <option value="Air">Air</option>
                                <option value="Water">Water</option>
                                <option value="Weather">Weather</option>
                                <option value="Pollution Control">Pollution Control</option>
                                <option value="Others">Others</option>
                            </select>
                        </div>
                    </div>
                    <div className="form_group">
                        <label htmlFor="potentialAssociation">POTENTIAL ASSOCIATION</label>
                        <select className="form_select" aria-label="Default select example" id="potentialAssociation" name="potentialAssociation" value={formData.potentialAssociation} onChange={handleChange} required>
                            <option value="Customer">Customer</option>
                            <option value="Channel Partner">Channel Partner</option>
                            <option value="Researcher">Researcher</option>
                            <option value="Investor">Investor</option>
                            <option value="Environment Consultant">Environment Consultant</option>
                        </select>
                    </div>
                    <div className="form_group col-md-12 f_name">
                        {/* <label htmlFor="productPage">Product Page</label> */}
                        <input type="hidden" className="form-control" id="productPage" name='productPage' value={formData.productPage} onChange={handleChange} placeholder="Product Page" required />
                    </div>
                    <div className="form_group textara">
                        <label htmlFor="query">QUERY</label>
                        <textarea placeholder="Type Here" rows="4" col="3" id='query' name='query' value={formData.query} onChange={handleChange}></textarea>
                    </div>
                    {successMessage && <p style={{ color: 'green' }}>{successMessage}</p>}
                    {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
                    {requiredError && <p style={{ color: 'red' }}>{requiredError}</p>}
                    <button className="contact_form_btn" type="submit">{loading ? 'Loading...' : 'Submit Now'}</button>
                </form>
            </div>
        </div>
    );
}

export default EnquiryForm;