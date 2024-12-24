// Dependências
const express = require("express");
const handlebars = require("express-handlebars");
const path = require("path");
const { Server } = require("socket.io");
const http = require("http");
const connectMongo = require("./dao/MongoDB/connection");
const Message = require("./dao/models/message.model"); // Modelo de mensagens
const Cart = require("./dao/models/carts.model"); // Modelo de carrinho
const Product = require("./dao/models/product.model"); // Modelo de produtos
const productService = require("./dao/MongoDB/productService");

connectMongo(); // Conecta ao MongoDB

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Configuração do express
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configuração do Handlebars
app.engine(
  "handlebars",
  handlebars.engine({
    defaultLayout: "main", // Define 'main.handlebars' como o layout padrão
  })
);
app.set("view engine", "handlebars");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));

// Comunicação via WebSocket
io.on("connection", (socket) => {
  console.log("Novo cliente conectado");

  // Enviar produtos do banco de dados ao conectar
  productService.getProducts().then((productsFromDb) => {
    socket.emit("updateProducts", productsFromDb);
  });

  // Adicionar um produto
  socket.on("addProduct", async (product) => {
    try {
      await productService.addProduct(product);
      const updatedProducts = await productService.getProducts();
      io.emit("updateProducts", updatedProducts);
    } catch (error) {
      console.error("Erro ao adicionar produto:", error);
    }
  });

  // Excluir um produto
  socket.on("deleteProduct", async (productId) => {
    try {
      await productService.deleteProduct(productId);
      const updatedProducts = await productService.getProducts();
      io.emit("updateProducts", updatedProducts);
    } catch (error) {
      console.error("Erro ao remover produto:", error);
    }
  });

  // Enviar e receber mensagens do chat
  Message.find().then((messages) => {
    socket.emit("messageHistory", messages);
  });

  socket.on("newMessage", async (msg) => {
    await Message.create(msg);
    const messages = await Message.find();
    io.emit("messageHistory", messages);
  });

  socket.on("disconnect", () => {
    console.log("Cliente desconectado");
  });
});

// Roteadores
app.get("/", (req, res) => {
  res.render("home", { title: "Página Inicial" });
});

app.get("/register", (req, res) => {
  res.render("register", { title: "Register" });
});

app.get("/list", (req, res) => {
  res.render("list", { title: "List" });
});

app.get("/realtimeproducts", (req, res) => {
  res.render("realTimeProducts", { title: "Produtos em Tempo Real" });
});

app.get("/chat", (req, res) => {
  res.render("chat", { title: "Chat em Tempo Real" });
});

// Rota para obter todos os produtos com filtros e paginação
app.get("/products", async (req, res) => {
  try {
    const { query, sort, page = 1, limit = 10 } = req.query;

    // Filtros dinâmicos
    const filters = {};
    if (query) {
      if (query === "inStock") filters.inStock = true;
      else filters.category = query;
    }

    // Ordenação
    const sortOption = sort === "asc" ? { price: 1 } : sort === "desc" ? { price: -1 } : {};

    // Paginação
    const skip = (page - 1) * limit;
    const products = await Product.find(filters).sort(sortOption).skip(skip).limit(Number(limit));
    const totalProducts = await Product.countDocuments(filters);
    const totalPages = Math.ceil(totalProducts / limit);

    res.status(200).json({
      status: "success",
      payload: products,
      totalPages,
      page: Number(page),
    });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

// Rota para exibir o carrinho
app.get("/cart", async (req, res) => {
  try {
    const cart = await Cart.findOne().populate("items.productId");
    if (!cart) {
      return res.render("cart", { title: "Carrinho", cart: { items: [] }, totalQuantity: 0, totalPrice: 0 });
    }

    const totalQuantity = cart.items.reduce((total, item) => total + item.quantity, 0);
    const totalPrice = cart.items.reduce((total, item) => total + item.productId.price * item.quantity, 0).toFixed(2);

    res.render("cart", { title: "Carrinho", cart, totalQuantity, totalPrice });
  } catch (error) {
    console.error("Erro ao carregar o carrinho:", error);
    res.status(500).send("Erro ao carregar o carrinho.");
  }
});

// Rota para adicionar produto ao carrinho
app.post("/cart", async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ error: "Produto não encontrado" });

    let cart = await Cart.findOne() || new Cart();
    const itemIndex = cart.items.findIndex((item) => item.productId.toString() === productId);
    if (itemIndex > -1) {
      cart.items[itemIndex].quantity += quantity;
    } else {
      cart.items.push({ productId, quantity });
    }

    await cart.save();
    res.status(200).json(cart);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Rota PUT para atualizar quantidade no carrinho
app.put("/api/carts/:cid/products/:pid", async (req, res) => {
  const { cid, pid } = req.params;
  const { quantity } = req.body;
  try {
    const cart = await Cart.findById(cid);
    if (!cart) return res.status(404).json({ message: "Carrinho não encontrado!" });

    const itemIndex = cart.items.findIndex((item) => item.productId.toString() === pid);
    if (itemIndex > -1) {
      cart.items[itemIndex].quantity = quantity;
      await cart.save();
      res.status(200).json({ status: "success", message: "Quantidade atualizada com sucesso!", cart });
    } else {
      res.status(404).json({ message: "Produto não encontrado no carrinho!" });
    }
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

// Rota DELETE para limpar o carrinho
app.delete("/api/carts/:cid", async (req, res) => {
  const { cid } = req.params;
  try {
    const cart = await Cart.findById(cid);
    if (!cart) return res.status(404).json({ message: "Carrinho não encontrado!" });

    cart.items = [];
    await cart.save();

    res.status(200).json({ status: "success", message: "Carrinho limpo com sucesso!" });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

// Iniciar o servidor
const PORT = 3001;
server.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
