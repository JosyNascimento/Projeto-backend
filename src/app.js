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
const productsApiRouter = require("./routes/api/Product.router");
const productRouter = require("./routes/products.router");
const paymentRouter = require('./routes/payment.router');
const passport = require("./config/passport.config");
const mongoStore = require("connect-mongo");
const viewRouter = require("./routes/view.router");
const testRouter = require("./routes/test.router");
const userRouter = require("./routes/user.router");
const cartRouter = require("./routes/cart.router");
const authRouter = require("./routes/auth.router");
const setupWebSocket = require("./websocket/websocket");
const sessionRouter = require("./routes/session.router");
const authApiRouter = require('./routes/api/auth.router');
const multer = require('multer');
const session = require("express-session");
const connectDB = require("./config/connectDB");
const methodOverride = require("method-override");
const swaggerJSDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const seedRouter = require("./routes/seed.router");
const checkoutRouter = require("./routes/checkout.router");
const setupSwagger = require('./utils/swagger');
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

setupSwagger(app);
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
            or: function (a, b) { return a || b; },
            eq: (a, b) => String(a) === String(b),
            isAdmin: function (user) { return user && user.role === "admin"; },
            ifEquals: function (arg1, arg2, options) {
                return arg1 == arg2 ? options.fn(this) : options.inverse(this);
            },
            multiply: handlebarsUtils.multiply,
            renderProductImage: handlebarsUtils.renderProductImage,
            renderProductImages: handlebarsUtils.renderProductImages,
            findIndex: function (array, comparator) {
                if (!array || !Array.isArray(array)) return -1;
                for (let i = 0; i < array.length; i++) {
                    if (comparator(array[i])) {
                        return i;
                    }
                }
                return -1;
            },
            lookup: function (array, index) {
                if (!array || !Array.isArray(array) || index === -1) return null;
                return array[index];
            },
            compare: function (a, b, options) {
                return a && b && a.toString() === b.toString() ? options.fn(this) : options.inverse(this);
            },
        }
    })
);

app.set("view engine", "handlebars");
app.set("views", path.join(__dirname, "views"));

app.use(methodOverride("_method"));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/public", express.static(path.join(__dirname, "public")));
app.use('/img', express.static(path.join(__dirname, 'public', 'img')));

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
app.use("/api/auth", authApiRouter);
app.use("/", viewRouter);
app.use("/", userRouter);
app.use("/", chatRouter);
app.use("/api/carts", cartRouter);

app.use("/products", productRouter);
app.use('/', realTimeProductsRouter);
app.use("/addProduct", productRouter);
app.use("/deleteProduct", productRouter);
app.use("/test", testRouter);
app.use("/checkout", checkoutRouter);
app.use('/api/payments', paymentRouter);
app.use(cors());

// Configuração do Swagger
const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'API Documentation',
            version: '1.0.0',
            description: 'Documentação da API do projeto',
        },
        servers: [
            {
                url: 'http://localhost:8080',
                description: 'Projeto final com documentação swagger',
            },
        ],
    },
    apis: [
        './src/swagger/index.yaml',       // 👈 O principal
        './src/swagger/carts.yaml',       // 👈 Endpoints de carrinho
        './src/swagger/products.yaml',    // 👈 Endpoints de produtos
        './src/swagger/tickets.yaml',    // 👈 Endpoints de tickets
        './src/swagger/paths/*.yaml',    // 👈 Sessions, Auth, Checkout (todos no paths/)
    ],
};

const swaggerDocs = swaggerJSDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));
// Middleware de erro global

app.use((err, req, res, next) => {
    console.error("🔥 ERRO DETECTADO:", err.stack || err);
    res.status(500).json({ message: "Erro interno do servidor", error: err.message });
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));