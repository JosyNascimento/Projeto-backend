// entregaParcial3/src/models/user.model.js
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userCollection = "users"; // Definindo o nome da coleção

const userSchema = new mongoose.Schema({
  first_name: { type: String, required: true },
  last_name: { type: String, required: true },
  username: { type: String, required: true },
  email: { type: String, required: false, unique: true },
  password: { type: String, required: false }, // Agora opcional
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  githubId: { type: String, unique: true }, // Armazena o ID do GitHub
  profileUrl: String
}, { timestamps: true});


// Método para criptografar a senha antes de salvar
userSchema.pre('save', async function(next) {
  try {
    if (!this.password) {
      return next(); // Se não houver senha, apenas continue sem criptografar
    }

    const saltRounds = 10;
    this.password = await bcrypt.hash(this.password, saltRounds);
    next();
  } catch (error) {
    next(error);
  }
});


// Método para comparar a senha fornecida com a senha criptografada
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw error;
  }
};

const User = mongoose.model("User", userSchema);

module.exports = User;