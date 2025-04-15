// entregaParcial3/src/controllers/session.controller.js


const currentSession = (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ message: "Usuário não autenticado" });
    }

    res.status(200).json({
        status: "success",
        payload: req.session.user
    });
};



module.exports = {  
    currentSession,
};