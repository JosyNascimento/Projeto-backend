require("dotenv").config();
const express = require("express");
const http = require("http");
const jwtSecret = process.env.JWT_SECRET || "Coder";
const handlebars = require("express-handlebars");
const handlebarsUtils = require("./utils/handlebars.utils");
const path = require("path");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const { Server } = require("socket.io");
const chatRouter = require("./routes/chat.router");
const realTimeProductsRouter = require('./routes/realTimeProducts.router');
const Message = require("./models/chat.model");
const productsApiRouter = require("./routes/api/apiProduct.router");
const productRouter = require("./routes/products.router");
const passport = require("./config/passport.config");
const mongoStore = require("connect-mongo");
const viewRouter = require("./routes/view.router");
const testRouter = require("./routes/test.router");
const userRouter = require("./routes/user.router");
const cartRouter = require("./routes/cart.router");
const authRouter = require("./routes/auth.router");
const setupWebSocket = require("./websocket/websocket");
const sessionRouter = require("./routes/session.router");
const { autenticacao } = require("./middlewares/auth.middleware");
const session = require("express-session");
const connectDB = require("./config/connectDB");
const methodOverride = require("method-override");
const swaggerJSDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const seedRouter = require("./routes/seed.router");
const checkoutRouter = require("./routes/checkout.router");

// Conectar ao banco de dados
connectDB();

const app = express();
const server = http.createServer(app);
// 🔥 Socket.IO com CORS habilitado
const io = new Server(server, {
  cors: {
    origin: "http://localhost:8080", // ou "*" para liberar geral
    methods: ["GET", "POST"],
  },
});

// Disponibiliza o io para os controllers acessarem
app.set("io", io);

// Configuração do WebSocket
setupWebSocket(io); // Chama setupWebSocket UMA VEZ aqui

// ✅ Configuração do Handlebars
app.engine(
  "handlebars",
  handlebars.engine({
    runtimeOptions: {
      allowProtoPropertiesByDefault: true,
      allowProtoMethodsByDefault: true,
    },
    helpers: {
      or: function (a, b) {
        return a || b;
      },
      eq: function (a, b) {
        return a === b;
      },
      isAdmin: function (user) {
        return user && user.role === "admin";
      },
      ifEquals: function (arg1, arg2, options) {
        return arg1 == arg2 ? options.fn(this) : options.inverse(this);
      },
      multiply: handlebarsUtils.helpers.multiply,
    },
  })
);
app.set("view engine", "handlebars");
app.set("views", path.join(__dirname, "views"));

app.use(methodOverride("_method"));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/public", express.static(path.join(__dirname, "public")));
app.use((req, res, next) => {
    req.io = io;
    next();
  });
// ✅ Configuração do Session
app.use(
  session({
    store: mongoStore.create({
      mongoUrl: process.env.MONGO_URL,
      ttl: 15 * 60 * 60,
    }),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: process.env.NODE_ENV === "production" },
  })
);

app.use(passport.initialize());
app.use(passport.session());
console.log("Passport inicializado.");

// Middlewares
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// ✅ Rotas organizadas
app.use("/view", viewRouter);
app.use("/api/sessions", sessionRouter);
app.use("/api/products", productsApiRouter);
app.use("/", seedRouter);
app.use("/", sessionRouter);
app.use("/", authRouter);
app.use("/", viewRouter);
app.use("/", userRouter);
app.use("/", chatRouter);
app.use("/cart", cartRouter);
app.use("/products", productRouter);
app.use('/', realTimeProductsRouter);
app.use("/addProduct", productRouter); 
app.use("/deleteProduct", productRouter); 
app.use("/test", testRouter);
app.use("/checkout", checkoutRouter);

// Swagger setup
const swaggerOptions = {
  swaggerDefinition: {
    info: {
      title: "API Documentation",
      description: "API for the project",
      version: "1.0.0",
    },
  },
  apis: ["./src/routes/**/*.js"], // Caminho para os arquivos das rotas que você deseja documentar
};
const specs = swaggerJSDoc(swaggerOptions);
app.use("/apidocs", swaggerUi.serve, swaggerUi.setup(specs));

app.get('/realtimeproducts', (req, res) => {
    res.render('realtimeproducts', { title: 'Realtime Products' });
  });
  
// Middleware de erro global
app.use((err, req, res, next) => {
    console.error(err); // Log the error to the console
    res.status(500).json({ message: "Erro interno do servidor", error: err.message });
  });

app.use((err, req, res, next) => {
  console.error("🔥 ERRO DETECTADO:", err.stack || err);
  res
    .status(500)
    .json({ message: "Erro interno do servidor", error: err.message });
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
