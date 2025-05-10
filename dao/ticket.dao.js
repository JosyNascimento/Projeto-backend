// entregaParcial3/src/dao/ticket.dao.js
const Ticket = require('../models/ticket.model');

class TicketDAO {
    // Cria um novo ticket de compra
    async createTicket(userId, products) {
        try {
            // Calcular o total da compra
            const totalAmount = products.reduce((total, product) => total + (product.price * product.quantity), 0);

            // Criar o ticket
            const newTicket = new Ticket({
                userId,
                products,
                totalAmount
            });

            // Salvar o ticket no banco de dados
            const savedTicket = await newTicket.save();
            return savedTicket;
        } catch (error) {
            console.error('Erro ao criar ticket:', error);
            throw new Error('Erro ao criar ticket');
        }
    }

    // Encontrar um ticket pelo ID
    async getTicketById(ticketId) {
        try {
            const ticket = await Ticket.findById(ticketId).populate('userId').populate('products.productId');
            if (!ticket) {
                throw new Error('Ticket não encontrado');
            }
            return ticket;
        } catch (error) {
            console.error('Erro ao buscar ticket:', error);
            throw new Error('Erro ao buscar ticket');
        }
    }

    // Encontrar todos os tickets de um usuário
    async getTicketsByUserId(userId) {
        try {
            const tickets = await Ticket.find({ userId }).populate('userId').populate('products.productId');
            return tickets;
        } catch (error) {
            console.error('Erro ao buscar tickets do usuário:', error);
            throw new Error('Erro ao buscar tickets do usuário');
        }
    }


async getTickets(query = {}) {
    try {
        const tickets = await Ticket.find(query);
        return tickets
    } catch (error) {
        console.error('Erro ao buscar tickets:', error);
        throw new Error('Erro ao buscar tickets do usuário');
    }
}

async updateTicket(ticketId, ticketData) {
    try {
        const updatedTicket = await Ticket.findByIdAndUpdate(ticketId, ticketData, { new: true });
        console.log(updatedTicket)
        return updatedTicket
    } catch (error) {
        console.error('Erro ao atualizar ticket do usuário:', error);
        throw new Error('Erro ao atualizar ticket do usuário');
    }
}

async deleteTicket(ticketId) {
    try {
        const deletedTicket = await Ticket.findByIdAndDelete(ticketId);
        return deletedTicket
    } catch (error) {
        console.error('Erro ao deletar ticket do usuário:', error);
        throw new Error('Erro ao deletar ticket do usuário');
    }
}
}
module.exports = TicketDAO;
