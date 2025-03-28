const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  first_name: { type: String, required: true },
  last_name: { type: String, required: true },
  username: { type: String, required: true },
  email: { type: String, required: false, unique: true },
  password: { type: String, required: false },
  role: { type: String, enum: ['user', 'premium', 'admin'], default: 'user' },
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  githubId: { type: String, unique: true },
  profileUrl: String
}, { timestamps: true });

// Método para criptografar a senha antes de salvar
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    console.error("Erro ao criptografar senha:", error);
    next(error); // Passa o erro para o próximo middleware
  }
});

// Método para comparar a senha fornecida com a senha criptografada
userSchema.methods.comparePassword = async function(enteredPassword) {
  try {
    return await bcrypt.compare(enteredPassword, this.password);
  } catch (error) {
    console.error("Erro ao comparar senhas:", error);
    return false; // Ou lance um erro, dependendo do seu fluxo
  }
};

const User = mongoose.model("User", userSchema);

module.exports = User;