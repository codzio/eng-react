const express = require("express");
const router = express.Router();
const { SitemapStream, streamToPromise } = require('sitemap');
const { Readable } = require('stream');

const ProductModel = require("../models/product_model");
const CategoryModel = require("../models/product_category_model");
const ProjectModel = require("../models/project_model");
const BlogModel = require("../models/blog_model");
const JobModel = require("../models/job_model");

async function fetchLinksFromDatabase() {
  try {
    const staticLinks = [
      { url: '/', changefreq: 'daily', priority: 0.3 },
      { url: '/#/about', changefreq: 'weekly', priority: 0.7 },
      { url: '/#/product-categories', changefreq: 'weekly', priority: 0.7 },
      { url: '/#/blogs', changefreq: 'weekly', priority: 0.7 },
      { url: '/#/projects', changefreq: 'monthly', priority: 0.5 },
      { url: '/#/career', changefreq: 'monthly', priority: 0.5 },
      { url: '/#/annual-report', changefreq: 'monthly', priority: 0.5 },
      { url: '/#/videos', changefreq: 'monthly', priority: 0.5 },
      { url: '/#/submit-application', changefreq: 'monthly', priority: 0.5 },
      { url: '/#/gallery', changefreq: 'monthly', priority: 0.5 },
      { url: '/#/privacy-policy', changefreq: 'monthly', priority: 0.5 },
      { url: '/#/terms-and-conditions', changefreq: 'monthly', priority: 0.5 },
      { url: '/#/contact', changefreq: 'monthly', priority: 0.5 },
    ];

    const [prodCatIds, products, projects, jobs, blogs] = await Promise.all([
      ProductModel.distinct("prodCategory"),
      ProductModel.find().sort({ _id: -1 }),
      ProjectModel.find().sort({ _id: -1 }),
      JobModel.find().sort({ _id: -1 }),
      BlogModel.find().sort({ _id: -1 }),
    ]);

    const getProdCatData = await CategoryModel.find({ _id: { $in: prodCatIds } });

    getProdCatData.forEach(prodCat => {
      staticLinks.push({
        url: '/#/product-categories/' + prodCat.slug,
        changefreq: 'monthly',
        priority: 0.5
      });
    });

    products.forEach(product => {
      staticLinks.push({
        url: '/#/products/' + product.slug,
        changefreq: 'weekly',
        priority: 0.7
      });
    });

    projects.forEach(project => {
      staticLinks.push({
        url: '/#/use-cases/' + project.slug,
        changefreq: 'weekly',
        priority: 0.7
      });
    });

    jobs.forEach(job => {
      staticLinks.push({
        url: '/#/career/' + job.slug,
        changefreq: 'weekly',
        priority: 0.7
      });
    });

    blogs.forEach(blog => {
      staticLinks.push({
        url: '/#/blogs/' + blog.slug,
        changefreq: 'weekly',
        priority: 0.7
      });
    });

    return staticLinks;
  } catch (err) {
    console.error('Error fetching links from database:', err);
    return [];
  }
}

router.get("/", (req, res) => {
  res.send("Home Page");
});

router.get('/sitemap.xml', async (req, res) => {
  try {
    const links = await fetchLinksFromDatabase();

    const stream = new SitemapStream({ hostname: 'https://enggenvsolutions.com' });
    res.header('Content-Type', 'application/xml');
    const xmlStream = Readable.from(links).pipe(stream);
    const data = await streamToPromise(xmlStream);
    res.send(data.toString());
  } catch (err) {
    console.error('Error generating sitemap:', err);
    res.status(500).send('Error generating sitemap');
  }
});

module.exports = router;
