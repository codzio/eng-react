import React, {useEffect} from "react";
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import About from './pages/About';
import Career from "./pages/career";
import Cases from "./pages/cases";
import Contact from "./pages/contact";
import Gallery from "./pages/gallery";
import UseCases from "./pages/use-cases";
// import ProductMain from "./pages/products";
import SingleProduct from "./pages/product-single";
import BlogMain from "./pages/blogs";
import BlogSingle from "./pages/blog-single";
import CategoryDetail from "./pages/category";

const AppRouter = () => {
    useEffect(() => {
        // Clear invalid URL from the browser history
        const clearInvalidUrl = () => {
            const currentPath = window.location.pathname;
            if (currentPath !== '/' && !currentPath.startsWith('/about') && !currentPath.startsWith('/career') && !currentPath.startsWith('/cases') && !currentPath.startsWith('/contact') && !currentPath.startsWith('/gallery') && !currentPath.startsWith('/use-cases') && !currentPath.startsWith('/products/') && !currentPath.startsWith('/blogs/') && !currentPath.startsWith('/category/')) {
                window.history.replaceState(null, null, '/');
            }
        };

        clearInvalidUrl();

        // Add event listener to handle popstate
        window.addEventListener('popstate', clearInvalidUrl);

        // Cleanup function
        return () => {
            window.removeEventListener('popstate', clearInvalidUrl);
        };
    }, []);

    return (
        <Router>
            <Routes>
                <Route path="/about" element={<About />} />
                <Route path="/career" element={<Career />} />
                <Route path="/use-cases/:projectSlug" element={<Cases />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/gallery" element={<Gallery />} />
                <Route path="/projects" element={<UseCases />} />
                {/* <Route path="/products/*" element={<ProductMain />} /> */}
                <Route path="/products/:productSlug" element={<SingleProduct />} />
                <Route path="/blogs/*" element={<BlogMain />} />
                <Route path="/blogs/:blogSlug" element={<BlogSingle />} />
                <Route path="/category/:categorySlug/*" element={<CategoryDetail />} />
                <Route path="/:pageSlug?" element={<Home />} />
                <Route path="*" element={<Navigate to="/" />} />
            </Routes>
        </Router>
    )
}

export default AppRouter;