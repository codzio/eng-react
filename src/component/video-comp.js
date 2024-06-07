import React, { useState, useMemo } from "react";
import "../styles/Home.css";

const VideoComp = ({ videos }) => {
  const { videoDataByCategory: categories, videos: allVideos } = videos;
  const [activeCategory, setActiveCategory] = useState("all");

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

  const toggleTab = (slug) => {
    setActiveCategory(slug);
  };

  const handleIframeLoad = () => {
    setIframeLoaded(true); // Set loading status to true when iframe content is loaded
  };

  const isActiveCategory = (slug) => activeCategory === slug;

  const renderVideo = (videos) => (
    <div className="gallery">
      {videos.map((video, index) => (
        <a key={index} href="javascript:void(0)" className="video" onClick={() => openModal(video.video)}>
          <img src={`${process.env.REACT_APP_API_URL}${video.featuredImg}`} alt={video.title} width="200" height="150" />
          <div className="for-border">
            <span><i className="fa-solid fa-play"></i></span>
          </div>
        </a>
      ))}
    </div>
  );

  const categoryTabs = useMemo(() => {
    if (categories.length === 0) {
      return (<div className="air_content_sec_inner">
        <p style={{textAlign:"center"}}>There are no videos available.</p>
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

  const videoSections = useMemo(() => {
    if (allVideos.length === 0 && categories.every(cat => cat.data.length === 0)) {
      return null;
    }

    return (
      <>
        <div
          className={`product_home_product_sec_tab product_home_product_sec_tab_sub_cat ${isActiveCategory("all") ? "showCategory" : "hideCategory"}`}
          id="all"
        >
          {allVideos.length > 0 ? renderVideo(allVideos) : <div className="no-reports">There are videos available.</div>}
        </div>
        {categories.map((data, index) => (
          <div
            key={index}
            className={`product_home_product_sec_tab product_home_product_sec_tab_sub_cat ${isActiveCategory(data.category) ? "showCategory" : "hideCategory"}`}
            id={data.category}
          >
            {data.data.length > 0 ? renderVideo(data.data) : <div className="no-reports">There are videos available.</div>}
          </div>
        ))}
      </>
    );
  }, [activeCategory, categories, allVideos]);

  return (
    <div className="video_page_sec home_product_sec product_home_product_sec">
      <div className="containers">
        <div className="product_home_product_sec_tab product_home_product_sec_tab_main_cat">
          {categoryTabs}
        </div>
        {videoSections}
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
  );
};

export default VideoComp;