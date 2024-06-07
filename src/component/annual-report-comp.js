import React, { useState, useMemo } from "react";
import "../styles/Home.css";

const AnnualReportComp = ({ reports }) => {
  const { reportDataByCategory: categories, reports: allReports } = reports;
  const [activeCategory, setActiveCategory] = useState("all");

  const toggleTab = (slug) => {
    setActiveCategory(slug);
  };

  const isActiveCategory = (slug) => activeCategory === slug;

  const renderReports = (reports) => (
    reports.map((report, index) => (
      <div key={index} className="tab_btn_row">
        <div>
          <a target="_blank" download href={`${process.env.REACT_APP_API_URL}${report.pdf}`} className="tab-download-btn">
            <h3>{report.title}</h3>
            <div>
              <i className="fa-solid fa-download"></i>
            </div>
            {report.description && (
              <p dangerouslySetInnerHTML={{ __html: report.description }}></p>
            )}
          </a>
        </div>
      </div>
    ))
  );

  const categoryTabs = useMemo(() => {
    if (categories.length === 0) {
      return (<div className="air_content_sec_inner">
        <p style={{textAlign:"center"}}>There are no reports available.</p>
      </div>);
    }

    return (
      <>
        <button
          className={isActiveCategory("all") ? "active" : ""}
          onClick={() => toggleTab("all")}
        >
          All
        </button>
        {categories.map((data, index) => (
          <button
            key={index}
            className={isActiveCategory(data.category) ? "active" : ""}
            onClick={() => toggleTab(data.category)}
          >
            {data.category}
          </button>
        ))}
      </>
    );
  }, [activeCategory, categories]);

  const reportSections = useMemo(() => {
    if (allReports.length === 0 && categories.every(cat => cat.data.length === 0)) {
      return null;
    }

    return (
      <>
        <div
          className={`product_home_product_sec_tab product_home_product_sec_tab_sub_cat report-tab-content ${isActiveCategory("all") ? "showCategory" : "hideCategory"}`}
          id="all"
        >
          {allReports.length > 0 ? renderReports(allReports) : <div className="no-reports">There are no reports available.</div>}
        </div>
        {categories.map((data, index) => (
          <div
            key={index}
            className={`product_home_product_sec_tab product_home_product_sec_tab_sub_cat report-tab-content ${isActiveCategory(data.category) ? "showCategory" : "hideCategory"}`}
            id={data.category}
          >
            {data.data.length > 0 ? renderReports(data.data) : <div className="no-reports">There are no reports available.</div>}
          </div>
        ))}
      </>
    );
  }, [activeCategory, categories, allReports]);

  return (
    <div className="report_page_sec home_product_sec product_home_product_sec">
      <div className="containers">
        <div className="product_home_product_sec_tab product_home_product_sec_tab_main_cat">
          {categoryTabs}
        </div>
        {reportSections}
      </div>
    </div>
  );
};

export default AnnualReportComp;