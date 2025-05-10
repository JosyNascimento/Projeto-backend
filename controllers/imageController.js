// controllers/imageController.js
const multer = require('multer');
const r2 = require('../config/r2');
const connectDB = require('../config/db');
const path = require('path');

const upload = multer({ storage: multer.memoryStorage() });

const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Nenhum arquivo de imagem enviado.' });
    }

    const db = await connectDB();
    const imagesCollection = db.collection('imagens');

    const fileExtension = path.extname(req.file.originalname);
    const fileName = `imagens/${Date.now()}${fileExtension}`;

    const uploadParams = {
      Bucket: process.env.R2_BUCKET_NAME,
      Key: fileName,
      Body: req.file.buffer,
      ContentType: req.file.mimetype,
      ACL: 'public-read',
    };

    const uploadedImage = await r2.upload(uploadParams).promise();
    const imageUrl = `${process.env.CLOUDFLARE_ENDPOINT}/${process.env.R2_BUCKET_NAME}/${fileName}`;

    const result = await imagesCollection.insertOne({
      originalName: req.file.originalname,
      url: imageUrl,
      uploadDate: new Date(),
    });

    res.status(201).json({ message: 'Imagem enviada com sucesso!', imageUrl: imageUrl, _id: result.insertedId });

  } catch (error) {
    console.error('Erro ao fazer upload da imagem:', error);
    res.status(500).json({ message: 'Erro ao fazer upload da imagem.' });
  }
};

module.exports = { upload, uploadImage };