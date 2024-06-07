import '../styles/Header.css';
import React, { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import SearchComp from './search-comp';

function Header(props) {
    const [isSticky, setIsSticky] = useState(false);
	const [ismobileNav, setIsMobileNav] = useState(false);
	const [isDropdownOpen, setIsDropdownOpen] = useState(false);
	const [isSecondDropdownOpen, setIsSecondDropdownOpen] = useState(false);
	const [openDropdowns, setOpenDropdowns] = useState({});
	const location = useLocation();
	const allData = props.loadData;
	let categoryData;
	if (allData && allData.siteUrl && allData.newData) {
		categoryData = allData.newData;
	}	

	useEffect(() => {
		let isMounted = true;
		const handleScroll = () => {
			if(isMounted){
				if(window.scrollY > 0){
					setIsSticky(true);
				}else{
					setIsSticky(false);
				}
			}
		};

		window.addEventListener('scroll', handleScroll);
		return () => {
			isMounted = false;
			window.removeEventListener('scroll', handleScroll);
		}
	}, []);


	const isActive = (...paths) => {
		return paths.some(path => location.pathname === path) ? 'active' : '';
	};

	function mobileNav() {
		setIsMobileNav(!ismobileNav);
	}

	function closeNav() {
		setIsMobileNav(false)
	}

	const toggleDropdown = () => {
		setIsDropdownOpen(!isDropdownOpen);
	};
	const toggleDropdowns = (menuId) => {
		setOpenDropdowns(prevState => ({
			...prevState,
			[menuId]: !prevState[menuId]
		}));
	};
	const toggleDropdownSecond = () => {
		setIsSecondDropdownOpen(!isSecondDropdownOpen);
	};

	function refreshPage() {
	    setTimeout(function() {
	    	window.location.reload(true);
	    });
	}

    return(
        <header className= {`header__main ${isSticky ? 'sticky' : ''}`}>
			<div className={`header_inner ${ismobileNav ? 'brd' : ""} ${props.hasBanner === 'false'? 'updateNavBg':''}`}>
				<Link onClick={refreshPage} to="/" className="header_logo">
					<img src="images/brand-new.png" alt="" />
				</Link>
				<div className="main_nav">
					<ul className={`${ismobileNav ? 'show brd' : ""}`}>
						<li className={isActive('/')}>
							<span>
								<NavLink onClick={refreshPage} to="/">home</NavLink>
							</span>
						</li>
						<li className={isActive('/about')}>
							<span>
								<NavLink onClick={refreshPage} to="/about">about us</NavLink>
							</span>
						</li>
						<li className={isActive('/products')}>
							<span>
								{/*<NavLink to="/products" onClick={(e) => e.preventDefault()}>products</NavLink>*/}
								<NavLink to="/product-categories">Products</NavLink>
								<i className={`fa-solid fa-plus ${isDropdownOpen ? 'rotate' : ''}`} onClick={ismobileNav ? () => toggleDropdown() : null}></i>
							</span>
							<div className={`dropdown p-dropdown ${isDropdownOpen ? 'show' : ''}`}>
								<ul>
									{categoryData ? (
										categoryData.map((data) => (
										<li key={data.category._id} className={isActive(`/${data.category.slug}`)}>
											{/* <NavLink to={`/products?category=${data.category.slug}`}>{data.category.title}</NavLink> */}
											
											{data.product[0].disableLinking ? (
											  <NavLink to="#">{data.category.title}</NavLink>
											) : (
											  //<NavLink onClick={refreshPage} to={`/products/${data.product[0].slug}`}>{data.category.title}</NavLink>
												<NavLink onClick={refreshPage} to={`/product-categories/${data.category.slug}`}>{data.category.title}</NavLink>
											)}

											{data.product && data.product.length > 0 ? (
											<>
											<i className={`fa-solid fa-plus ${openDropdowns[data.category._id] ? 'rotate' : ''}`} onClick={ismobileNav ? () => toggleDropdowns(data.category._id) : null}></i>
											<div className={`sub-dropdown ${openDropdowns[data.category._id] ? 'show' : ''}`}>
												<ul>													
													{data.product.map((data) => (
														<li key={data._id}>
														{data.disableLinking ? (
														  <NavLink to="#">{data.title}</NavLink>
														) : (
														  <NavLink onClick={refreshPage} to={`/products/${data.slug}`}>{data.title}</NavLink>
														)}
														{/*{data.subProduct && data.subProduct.length > 0 ? (
															<>
															<i className={`fa-solid fa-plus ${openDropdowns[data._id] ? 'rotate' : ''}`} onClick={ismobileNav ? () => toggleDropdowns(data._id) : null}></i>
															<div className={`sub-dropdown inner ${openDropdowns[data._id] ? 'show' : ''}`}>
																<ul>
																	{data.subProduct.map((data) => (
																		<li key={data._id}>
																			<NavLink onClick={refreshPage} to={`/products/${data.slug}`}>{data.title}</NavLink>
																		</li>
																	))}
																</ul>
															</div>
															</>
														) : null}*/}
														</li>
													))}
												</ul>
											</div>
											</>
											) : null}
										</li>
										))
									) : (
										<li>Loading...</li>
									)}
								</ul>
							</div>
						</li>
						<li className={isActive('/blogs','/projects','/use-cases','/career', '/annual-report', '/videos')}>
							<span>
								<NavLink to="/" onClick={(e) => e.preventDefault()}>resources</NavLink>
								<i className={`fa-solid fa-plus ${isSecondDropdownOpen ? 'rotate' : ''}`} onClick={toggleDropdownSecond}></i>
							</span>
							<div className={`dropdown ${isSecondDropdownOpen ? 'show' : ''}`}>
								<ul>
									<li className={isActive('/blogs')}><NavLink onClick={refreshPage} to="/blogs">blogs</NavLink></li>
									{/*<li className={isActive('/use-cases')}><NavLink onClick={refreshPage} to="/use-cases">Use Cases</NavLink></li>*/}
									<li className={isActive('/projects')}><NavLink to="/projects">Projects</NavLink></li>
									<li className={isActive('/career')}><NavLink to="/career">career</NavLink></li>
									<li className={isActive('/annual-report')}><NavLink to="/annual-report">Annual Report</NavLink></li>
									<li className={isActive('/videos')}><NavLink to="/videos">Videos</NavLink></li>
									<li className={isActive('/submit-application')}><NavLink to="/submit-application">Submit Resume</NavLink></li>
								</ul>
							</div>
						</li>
						<li className={isActive('/gallery')}>
							<span>
								<NavLink to="/gallery">gallery</NavLink>
							</span>
						</li>
						<li className={isActive('/contact')}>
							<NavLink to="/contact" className="contact_us_btn dsp">Contact Us</NavLink>
						</li>
						<SearchComp></SearchComp>
					</ul>
					<Link to="/contact" className="contact_us_btn">Contact Us</Link>	
				</div>
				<div className={`ham ${ismobileNav ? 'open' : "" }`} onClick={mobileNav}>
					<div className="ham1"></div>
					<div className="ham2"></div>
					<div className="ham3"></div>
				</div>
			</div>
			<div className={`cross_nav  ${ismobileNav ? 'show_bg' : ""}`}><span className={'fa-solid fa-xmark'} onClick={closeNav}></span></div>
		</header>
    );
};

export default Header;