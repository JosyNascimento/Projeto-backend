require("dotenv").config();
const express = require("express");
const http = require("http");
const jwtSecret = process.env.JWT_SECRET || 'Coder';
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
const { autenticacao } = require("./middlewares/authorization.middleware");

const session = require("express-session");
const connectDB = require("./config/connection");
connectDB();

const app = express();
const server = http.createServer(app);

const io = new Server(server);

app.engine("handlebars", handlebars.engine());
app.set("view engine", "handlebars");
app.set("views", path.join(__dirname, "views"));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/public", express.static(path.join(__dirname, "public")));

app.use(
    session({
        store: mongoStore.create({
            mongoUrl: process.env.MONGO_URL,
            ttl: 15 * 60 * 60,
        }),
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: true,
        cookie: { secure: false },
    })
);

app.use(passport.initialize());
app.use(passport.session());

handlebars.create({
    helpers: {
        calculateTotal: (price, quantity) => (price * quantity).toFixed(2),
    },
});
// Middlewares
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({ secret: "secret", resave: false, saveUninitialized: true }));


app.use("/", sessionRouter);
app.use("/carts", cartRouter);
app.use("/products", productRouter);
app.use("/", viewRouter);
app.use("/", userRouter);







app.use("/chat", chatRoutes);
app.use("/test", testRouter);
app.use("/api", productRouter); // Correção: use productRouter

app.get("/", (req, res) => res.render("home", { title: "Página Inicial" }));
app.get("/register", (req, res) => res.render("register", { title: "Register" }));
app.get("/list", (req, res) => res.render("list", { title: "List" }));
app.get("/realtimeproducts", (req, res) => res.render("realTimeProducts", { title: "Produtos em Tempo Real" }));
app.get("/chat", (req, res) => res.render("chat", { title: "Chat em Tempo Real" }));

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));