
// services/user.service.js
const UserDTO = require('../dto/user.dto');
const userRepository = require('../repositories/user.repository');
const getUser = async (req, res) => {
    try {
        const user = await userRepository.getUserById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'Usuário não encontrado' });
        }
        const userDTO = new UserDTO(user);
        res.json(userDTO);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao buscar usuário', error: error.message });
    }
};

module.exports = { getUser }; //export the function