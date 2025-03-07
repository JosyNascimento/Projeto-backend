// entregaParcial3/src/dao/factory.js
const config = require("../config/config");

let CartDAO;
let ProductDAO;
let TicketDAO;

switch (config.persistence) {
    case "mongo":
        const CartMongoDAO = require("./mongo/cart.mongo.dao");
        const ProductMongoDAO = require("./mongo/product.mongo.dao");
        const TicketMongoDAO = require("./mongo/ticket.mongo.dao");
        
        CartDAO = new CartMongoDAO();
        ProductDAO = new ProductMongoDAO();
        TicketDAO = new TicketMongoDAO();
        break;
    
    case "file":
        const CartFileDAO = require("./file/cart.file.dao");
        const ProductFileDAO = require("./file/product.file.dao");
        const TicketFileDAO = require("./file/ticket.file.dao");
        
        CartDAO = new CartFileDAO();
        ProductDAO = new ProductFileDAO();
        TicketDAO = new TicketFileDAO();
        break;
    
    default:
        throw new Error("Persistência não definida corretamente no arquivo de configuração");
}

module.exports = { CartDAO, ProductDAO, TicketDAO };
