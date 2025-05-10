const express = require("express");
const router = express.Router();
const {
  setSignedCookie,
  setCookie,
  getCookies,
  getSignedCookies,
  postSetCookie,
  deleteCookie,
} = require("../controllers/cookie.controller");

router.get("/setSigned", setSignedCookie);
router.get("/set", setCookie);
router.get("/get", getCookies);
router.get("/getSigned", getSignedCookies);
router.post("/set", postSetCookie);
router.get("/delete", deleteCookie);

module.exports = router;
