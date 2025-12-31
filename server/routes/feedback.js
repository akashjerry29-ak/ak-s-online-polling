const router = require("express").Router();

router.post("/", async (req, res) => {
  console.log("Feedback:", req.body.message);
  res.sendStatus(201);
});

module.exports = router;
