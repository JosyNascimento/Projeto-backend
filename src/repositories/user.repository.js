// entregaParcial3/src/repositories/user.repository.js
const User = require('../models/user.model');

class UserRepository {
    async getUserById(id) {
        try {
            return await User.findById(id);
        } catch (error) {
            console.error('Erro ao buscar usuário por ID:', error);
            throw error;
        }
    }

    async getUserByEmail(email) {
        try {
            return await User.findOne({ email });
        } catch (error) {
            console.error('Erro ao buscar usuário por e-mail:', error);
            throw error;
        }
    }

    async createUser(userData) {
        try {
            return await User.create(userData);
        } catch (error) {
            console.error('Erro ao criar usuário:', error);
            throw error;
        }
    }

    async updateUser(id, userData) {
        try {
            return await User.findByIdAndUpdate(id, userData, { new: true });
        } catch (error) {
            console.error('Erro ao atualizar usuário:', error);
            throw error;
        }
    }

    async deleteUser(id) {
        try {
            return await User.findByIdAndDelete(id);
        } catch (error) {
            console.error('Erro ao deletar usuário:', error);
            throw error;
        }
    }

    async getAllUsers() {
        try {
            return await User.find();
        } catch (error) {
            console.error('Erro ao buscar todos os usuários:', error);
            throw error;
        }
    }

}

module.exports = new UserRepository();