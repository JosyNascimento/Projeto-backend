const sendMessage = async (req, res) => {
    try {
        const { message } = req.body;
        if (!message) {
            return res.status(400).json({ message: "Mensagem é obrigatória" });
        }
        res.status(200).json({ message: "Mensagem enviada com sucesso" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { sendMessage };
