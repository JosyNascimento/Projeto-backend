const fs = require("fs");
const path = require("path");

class CartManager {
  constructor() {
    this.cartsFilePath = path.join(__dirname, "carts.json");
    this.carts = [];
  }

  // Carregar carrinhos a partir do arquivo
  async loadCarts() {
    try {
      const data = await fs.promises.readFile(this.cartsFilePath, "utf-8");
      this.carts = JSON.parse(data);
    } catch (error) {
      if (error.code === "ENOENT") {
        // Arquivo não encontrado, criando um novo
        this.carts = [];
        await this.saveCarts();
      } else {
        console.error("Erro ao carregar os carrinhos:", error);
        this.carts = [];
      }
    }
  }

  // Salvar carrinhos no arquivo
  async saveCarts() {
    try {
      await fs.promises.writeFile(
        this.cartsFilePath,
        JSON.stringify(this.carts, null, 2)
      );
      console.log("Carrinhos salvos com sucesso");
    } catch (error) {
      console.error("Erro ao salvar carrinhos:", error);
    }
  }

  async createCart() {
    const newCart = { id: this.carts.length + 1, products: [] };
    this.carts.push(newCart);
    await this.saveCarts();
    return newCart;
  }

  async getCartById(id) {
    const cart = this.carts.find((cart) => cart.id === id);
    if (!cart) {
      throw new Error(`Carrinho com ID ${id} não encontrado`);
    }
    return cart;
  }

  async addProductToCart(cartId, productId) {
    const cart = this.carts.find((cart) => cart.id === cartId);
    if (!cart) return null;

    const existingProduct = cart.products.find((p) => p.id === productId);
    if (existingProduct) {
      // Caso o produto já exista, podemos incrementar a quantidade
      existingProduct.quantity += 1;
    } else {
      // Caso contrário, adicionamos o produto
      cart.products.push({ id: productId, quantity: 1 });
    }

    await this.saveCarts();
    return cart;
  }
}

module.exports = CartManager;
