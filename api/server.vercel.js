const app = require("./server"); // this should point to your Express app
module.exports = (req, res) => {
  app(req, res); // expose as serverless function for Vercel
};
