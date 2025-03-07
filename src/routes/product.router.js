const express = require("express");
const {
  authorizationMiddleware,
} = require("../middlewares/authorization.middleware"); // ✅ Importe o middleware

const {
  getAllProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} = require("../controllers/products.controller");

const router = express.Router();

router.get("/products", getAllProducts);
router.post("/", authorizationMiddleware("admin"), createProduct);
router.put("/:id", authorizationMiddleware("admin"), updateProduct);
router.delete("/:id", authorizationMiddleware("admin"), deleteProduct);

module.exports = router;
