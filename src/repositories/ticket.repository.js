const Ticket = require('../models/ticket.model');

class TicketRepository {
    async createTicket(ticketData) {
        try {
            return await Ticket.create(ticketData);
        } catch (error) {
            console.error('Erro ao criar ticket:', error);
            throw error;
        }
    }

    async getTicketById(ticketId) {
        try {
            return await Ticket.findById(ticketId);
        } catch (error) {
            console.error('Erro ao buscar ticket por ID:', error);
            throw error;
        }
    }

    async getTickets(query = {}) {
        try {
            return await Ticket.find(query);
        } catch (error) {
            console.error('Erro ao buscar tickets:', error);
            throw error;
        }
    }

    async updateTicket(ticketId, ticketData) {
        try {
            return await Ticket.findByIdAndUpdate(ticketId, ticketData, { new: true });
        } catch (error) {
            console.error('Erro ao atualizar ticket:', error);
            throw error;
        }
    }

    async deleteTicket(ticketId) {
        try {
            return await Ticket.findByIdAndDelete(ticketId);
        } catch (error) {
            console.error('Erro ao deletar ticket:', error);
            throw error;
        }
    }
}

module.exports = new TicketRepository();