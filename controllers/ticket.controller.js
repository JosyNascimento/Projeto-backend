// entregaParcial3/src/controllers/ticket.controller.js
const CartDAO = require('../dao/cart.dao'); //
const ticketRepository = require('../repositories/ticket.repository');
const { validationResult } = require('express-validator');

// Função para finalizar a compra e gerar um ticket
const createTicket = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { cid } = req.params;
        const userId = req.user.id;

        const cart = await CartDAO.getCartById(cid);

        if (!cart) {
            return res.status(404).json({ message: 'Carrinho não encontrado' });
        }

        const products = cart.products;

        const ticket = await ticketRepository.createTicket(userId, products);
        await CartDAO.clearCart(cid);

        return res.status(201).json({ message: 'Compra realizada com sucesso', ticket });
    } catch (error) {
        console.error('Erro ao finalizar compra:', error);
        return res.status(500).json({ message: 'Erro ao finalizar compra' });
    }
};

// Função para buscar um ticket específico
const getTicketById = async (req, res) => {
    try {
        const { ticketId } = req.params;
        const ticket = await ticketRepository.getTicketById(ticketId);
        return res.status(200).json(ticket);
    } catch (error) {
        console.error('Erro ao buscar ticket:', error);
        return res.status(500).json({ message: 'Erro ao buscar ticket' });
    }
};

// Função para buscar todos os tickets de um usuário
const getTicketsByUserId = async (req, res) => {
    try {
        const userId = req.user.id; // Obtendo o ID do usuário autenticado
        const tickets = await TicketDAO.getTicketsByUserId(userId);
        return res.status(200).json(tickets);
    } catch (error) {
        console.error('Erro ao buscar tickets do usuário:', error);
        return res.status(500).json({ message: 'Erro ao buscar tickets do usuário' });
    }
};

const updateTicket = async (req, res) => {
    try {
        const { ticketId, ticketData } = req.body // REQUEST: { ticketId: 21, ticketData: {...} }
        const updatedTicket = await ticketRepository.updateTicket(ticketId, ticketData)
        
        return res.status(200).json(updatedTicket)
    } catch (error) {
        return res.status(500).json({ message: 'Erro ao atualizar ticket do usuário' });
    }
}

// TODO: fazer próximos controllers com base no repository

module.exports = {
    createTicket,
    getTicketById,
    getTicketsByUserId,
    getTicketsByUserId,
    updateTicket,
};