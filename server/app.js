const path = require("path");
const fs = require("fs");
const express = require("express");
const bodyParser = require("body-parser");
const multer = require("multer");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const session = require("express-session");

const helmet = require("helmet");
const compression = require("compression");
const morgan = require("morgan");

var MongoDBStore = require("connect-mongodb-session")(session);
const csrf = require("./helpers/csrf");
const SiteSettingModel = require("./models/site_settings_model");

const MONGODB_URI = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0.vrquesj.mongodb.net/${process.env.MONGO_DATABASE}`;

const app = express();
var sessionStore = new MongoDBStore({
  uri: MONGODB_URI,
  collection: "sessions",
  expires: 30 * 60 * 1000, // Session expiry time in milliseconds (30 minutes)
});

app.use(express.json());
app.use(cookieParser());

app.set("view engine", "ejs");
app.set("views", "views");

const accessLogStream = fs.createWriteStream(
  path.join(__dirname, "access.log"),
  { flags: "a" } //It means append the data into file
);

app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: false,
  })
);
app.use(compression());
app.use(morgan("combined", { stream: accessLogStream }));

app.use(bodyParser.urlencoded({ extended: false })); // x-www-form-urlencoded <form> default form data

//app.use(bodyParser.json()); //application/json (This is used for when sending data in JSON format for API)

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*"); //for any client but if need to set specific client "google.com"
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH, DELETE"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization"); //we can pass * for all
  next();
});

app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Configure express-session
app.use(
  session({
    secret: csrf.csrfSec(), // Replace with a strong secret key. Currently I am using csrf key
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 30 * 60 * 1000, // Set session max age in milliseconds (30 minutes)
    },
    store: sessionStore,
  })
);

app.use(async (req, res, next) => {
  try {
    const siteSettings = await SiteSettingModel.findOne();
    res.locals.siteSettings = siteSettings;
    res.locals.csrfToken = csrf.csrfToken();
    next();
  } catch (error) {
    console.error("Error fetching data:", error);
    res.locals.siteSettings = [];
    res.locals.csrfToken = csrf.csrfToken();
    next();
  }

  // res.cookie('csrf-token', csrfToken);
  // res.locals.csrfToken = csrfToken;
});

//routes
const homeRoutes = require("./routes/home_routes");
const adminRoutes = require("./routes/admin_routes");
const adminSiteSettingRoutes = require("./routes/site_settings_routes");
const adminCategoryRoutes = require("./routes/category_routes");
const adminBlogRoutes = require("./routes/blog_routes");
const adminBannerRoutes = require("./routes/banner_routes");
const adminWhyRoutes = require("./routes/why_routes");
const adminEventRoutes = require("./routes/event_routes");
const adminProductFeaturesRoutes = require("./routes/product_features_routes");
const adminClientRoutes = require("./routes/client_routes");
const adminCertificateRoutes = require("./routes/certificate_routes");
const adminFaqRoutes = require("./routes/faq_routes");
const adminTestimonialRoutes = require("./routes/testimonial_routes");
const adminProductCatRoutes = require("./routes/product_cat_routes");
const adminProductSubcatRoutes = require("./routes/product_subcat_routes");
const adminServiceTypeRoutes = require("./routes/service_type_routes");
const adminUseCasesRoutes = require("./routes/use_cases_routes");
const adminProjectsRoutes = require("./routes/projects_routes");
const adminProductRoutes = require("./routes/product_routes");
const adminProductVariantsRoutes = require("./routes/product_variants_routes");
const adminPageRoutes = require("./routes/page_routes");
const adminEnquiryRoutes = require("./routes/enquiry_routes");
const adminJobRoutes = require("./routes/job_routes");
const adminVideoRoutes = require("./routes/video_routes");
const adminAnnualReportRoutes = require("./routes/annual_report_routes");

// API Routes START
const apiHomeRoutes = require("./routes/api/home_routes");
const apiProductRoutes = require("./routes/api/product_routes");
const apiUseCaseRoutes = require("./routes/api/use_case_routes");
const apiBlogRoutes = require("./routes/api/blog_routes");
// API Routes END

app.use("/admin", adminRoutes);
app.use("/admin", adminSiteSettingRoutes);
app.use("/admin", adminCategoryRoutes);
app.use("/admin", adminBlogRoutes);
app.use("/admin", adminBannerRoutes);
app.use("/admin", adminWhyRoutes);
app.use("/admin", adminEventRoutes);
app.use("/admin", adminProductFeaturesRoutes);
app.use("/admin", adminClientRoutes);
app.use("/admin", adminCertificateRoutes);
app.use("/admin", adminFaqRoutes);
app.use("/admin", adminTestimonialRoutes);
app.use("/admin", adminProductCatRoutes);
app.use("/admin", adminProductSubcatRoutes);
app.use("/admin", adminServiceTypeRoutes);
app.use("/admin", adminUseCasesRoutes);
app.use("/admin", adminProjectsRoutes);
app.use("/admin", adminProductRoutes);
app.use("/admin", adminProductVariantsRoutes);
app.use("/admin", adminPageRoutes);
app.use("/admin", adminEnquiryRoutes);
app.use("/admin", adminJobRoutes);
app.use("/admin", adminVideoRoutes);
app.use("/admin", adminAnnualReportRoutes);

app.use("/api", apiHomeRoutes);
app.use("/api", apiProductRoutes);
app.use("/api", apiUseCaseRoutes);
app.use("/api", apiBlogRoutes);

app.use(homeRoutes);

app.use("/", (req, res, next) => {
  res.send("404");
});

mongoose
  .connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then((result) => {
    app.listen(process.env.PORT || 8000);
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB:", err);
  });
