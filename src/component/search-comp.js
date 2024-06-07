import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import '../styles/Header.css';

const SearchComp = () => {
    const [isSearchBarVisible, setSearchBarVisible] = useState(false);
    const [searchInput, setSearchInput] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [typingTimeout, setTypingTimeout] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const searchRef = useRef(null);
    const navigate = useNavigate();

    const showSearchBar = () => {
        setSearchBarVisible(true);
    };

    const hideSearchBar = () => {
        setSearchBarVisible(false);
        setSearchInput(""); // Clear search input when hiding the search bar
        setSearchResults([]); // Clear search results when hiding the search bar
    };

    const handleInputChange = (e) => {
        setSearchInput(e.target.value);
    };

    const handleKeyUp = () => {
        if (typingTimeout) {
            clearTimeout(typingTimeout);
        }

        const timeout = setTimeout(() => {
            if (searchInput.length >= 3) {
                setIsLoading(true); // Set loading to true before the API call
                setSearchResults([]);
                fetch(`${process.env.REACT_APP_API_URL}api/search?keyword=${searchInput}`)
                    .then(response => response.json())
                    .then(data => {
                        console.log("API response data:", data); // Log the API response data
                        setSearchResults(data);
                        setIsLoading(false); // Set loading to false after data is fetched
                    })
                    .catch(error => {
                        console.error("Error fetching search results:", error);
                        setIsLoading(false); // Set loading to false in case of error
                        setSearchResults([]);
                    });
            }
        }, 500); // Adjust the delay as needed (500ms is a common choice)

        setTypingTimeout(timeout);
    };

    const handleClickOutside = (event) => {
        if (searchRef.current && !searchRef.current.contains(event.target)) {
            setSearchResults([]); // Hide search results when clicking outside
        }
    };

    useEffect(() => {
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleLinkClick = (url) => {
        navigate(url, { replace: true });
        window.location.reload();
    };

    return (
        <>
            <li id="searchBar" className={`${isSearchBarVisible ? '' : 'hide'}`}>
                <div className="search search-main" ref={searchRef}>
                    <form className="search-form" onSubmit={(e) => e.preventDefault()}>
                        <input 
                            type="text" 
                            name="search" 
                            className="search-input" 
                            placeholder="Search for Products" 
                            value={searchInput}
                            onChange={handleInputChange}
                            onKeyUp={handleKeyUp}
                            autoComplete="off"
                        />
                        <div className={`search-dropdown ${searchResults.length > 0 ? '' : 'hide'}`}>
                            <ul>
                                {searchResults.map((result) => (
                                    <li key={result._id}>
                                        <Link to="#" onClick={() => handleLinkClick(`/products/${result.slug}`)}>
                                            {result.title}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </form>
                </div>
            </li>

            <div className="search-bar-div">
                <a onClick={showSearchBar} className="mobile-search-bar-icon"><span id="searchBarShowBtn" className={`fa-solid fa-magnifying-glass ${isSearchBarVisible ? "hide" : ""}`}></span></a>
                {!isLoading && <a onClick={hideSearchBar}><span id="searchBarHideBtn" className={`fa-solid fa-xmark ${isSearchBarVisible ? "" : "hide"}`}></span></a>}
                {isLoading && <span id="searchSpinner" className="fa fa-spinner fa-spin"></span>}
            </div>
        </>
    );
}

export default SearchComp;