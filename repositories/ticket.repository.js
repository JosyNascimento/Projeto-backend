const Ticket = require("../models/ticket.model");
const TicketDAO = require("../dao/ticket.dao");
class TicketRepository {
  constructor() {
    this.ticketDAO = new TicketDAO();
  }

  async createTicket(userId, products) {
    try {
      return await this.ticketDAO.createTicket(userId, products);
    } catch (error) {
      console.error("Erro ao criar ticket:", error);
      throw error;
    }
  }

  async getTicketById(ticketId) {
    try {
      return await this.ticketDAO.getTicketById(ticketId);
    } catch (error) {
      console.error("Erro ao buscar ticket por ID:", error);
      throw error;
    }
  }

  async getTickets(query = {}) {
    try {
      return await Ticket.find(query);
    } catch (error) {
      console.error("Erro ao buscar tickets:", error);
      throw error;
    }
  }

  async updateTicket(ticketId, ticketData) {
    try {
      return await this.ticketDAO.updateTicket(ticketId, ticketData);
    } catch (error) {
      console.error("Erro ao atualizar ticket:", error);
      throw error;
    }
  }

  async deleteTicket(ticketId) {
    try {
      this.ticketDAO.deleteTicket(ticketId);
    } catch (error) {
      console.error("Erro ao deletar ticket:", error);
      throw error;
    }
  }
}

module.exports = new TicketRepository();
