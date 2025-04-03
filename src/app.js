require("dotenv").config();
const express = require("express");
const http = require("http");
const jwtSecret = process.env.JWT_SECRET || "Coder";
const handlebars = require("express-handlebars");
const path = require("path");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const { Server } = require("socket.io");
const Message = require("./models/message.model");
const productRouter = require("./routes/product.router");
const passport = require("./config/passport.config");
const mongoStore = require("connect-mongo");
const viewRouter = require("./routes/view.router");
const testRouter = require("./routes/test.router");
const chatRoutes = require("./routes/chat.router");
const userRouter = require("./routes/user.router");
const cartRouter = require("./routes/cart.router");
const sessionRouter = require("./routes/session.router");
const { autenticacao } = require("./middlewares/auth.middleware");
const session = require("express-session");
const connectDB = require("./config/connectDB");
const methodOverride = require("method-override"); 
const swaggerJSDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");


// Conectar ao banco de dados
connectDB();

const app = express();
const server = http.createServer(app);
const io = new Server(server);

io.on("connection", async (socket) => {
  // ... lógica do Socket.IO ...
});

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
              return (arg1 == arg2) ? options.fn(this) : options.inverse(this);
          }
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
  }),
  
);

app.use(passport.initialize());
app.use(passport.session());
console.log("Passport inicializado.");

// Middlewares
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// ✅ Rotas organizadas
app.use("/", viewRouter); 
app.use("/api/sessions", sessionRouter);
app.use("/", sessionRouter);
app.use("/carts", cartRouter);
app.use("/products", productRouter);
app.use("/", viewRouter);
app.use("/", userRouter);
app.use("/chat", chatRoutes);
app.use("/test", testRouter);


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

// Middleware de erro global
app.use((err, req, res, next) => {
  // Trate erros globais aqui
  res.status(500).json({ message: "Erro interno do servidor" });
});

app.use((err, req, res, next) => {
  console.error("🔥 ERRO DETECTADO:", err.stack || err);
  res.status(500).json({ message: "Erro interno do servidor", error: err.message });
});


const PORT = process.env.PORT || 8080;
server.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
