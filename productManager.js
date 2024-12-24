// CartManager.js
const fs = require("fs");
const path = require("path");

class CartManager {
  constructor() {
    this.carts = [];
    this.products = []; // Supondo que você tenha um banco de dados ou um arquivo para armazenar produtos
    this.cartsFilePath = path.join(__dirname, "carts.json");
    this.productsFilePath = path.join(__dirname, "products.json");
  }

  // Carregar carrinhos de um arquivo
  async loadCarts() {
    try {
      const data = await fs.promises.readFile(this.cartsFilePath, "utf-8");
      this.carts = JSON.parse(data);
    } catch (error) {
      console.error("Erro ao carregar os carrinhos:", error);
      this.carts = [];
    }
  }

  // Carregar produtos de um arquivo (supondo que você tenha esse arquivo)
  async loadProducts() {
    try {
      const data = await fs.promises.readFile(this.productsFilePath, "utf-8");
      this.products = JSON.parse(data);
    } catch (error) {
      console.error("Erro ao carregar os produtos:", error);
      this.products = [];
    }
  }

  // Criar um novo carrinho
  async createCart() {
    const newCart = { id: this.carts.length + 1, products: [] };
    this.carts.push(newCart);
    await this.saveCarts();
    return newCart;
  }

  // Salvar os carrinhos no arquivo
  async saveCarts() {
    try {
      await fs.promises.writeFile(
        this.cartsFilePath,
        JSON.stringify(this.carts, null, 2),
        "utf-8"
      );
    } catch (error) {
      console.error("Erro ao salvar os carrinhos:", error);
    }
  }

  // Buscar um carrinho pelo ID
  async getCartById(id) {
    return this.carts.find((cart) => cart.id === id);
  }

  // Adicionar um produto ao carrinho
  async addProductToCart(cid, pid) {
    const cart = await this.getCartById(cid);
    const product = this.products.find((product) => product.id === pid);

    if (!cart || !product) {
      return null;
    }

    const existingProduct = cart.products.find((p) => p.productId === pid);
    if (existingProduct) {
      existingProduct.quantity += 1;
    } else {
      cart.products.push({ productId: pid, quantity: 1 });
    }

    await this.saveCarts();
    return cart;
  }

  // Calcular o total do carrinho
  async getCartTotal(cid) {
    const cart = await this.getCartById(cid);
    if (!cart) return null;

    let total = 0;
    for (const item of cart.products) {
      const product = this.products.find((p) => p.id === item.productId);
      if (product) {
        total += product.price * item.quantity;
      }
    }
    return total;
  }
}

module.exports = CartManager;
