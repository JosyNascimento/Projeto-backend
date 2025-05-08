const { Router } = require('express');
const PaymentService = require('../services/payment.service');

const router = Router();

// Os produtos correspondem aos que estão no frontend
const products = [
  { id: 1, name: "Relogio Mondaine Masculino", price:  400 },
  { id: 2, name: "Óculos de sol Rayban Feminino", price: 300 },
  { id: 3, name: "Smart TV LG 50p", price: 2899.99 },
  { id: 4, name: "Notebook Dell Inspiron 15", price: 4300 },
  { id: 5, name: "Brinco folheado", price: 800 },
  { id: 6, name: "Relogio Mondaine Masculino", price:  400 },
  { id: 7, name: "Anel de outo 14k", price: 550 },
  { id: 8, name: "Smart TV LG 50p", price: 2899.99 },
  { id: 9, name: "Minisistem", price: 4300 },
  { id: 10, name: "Boneca Reborn", price:  2.500 },
  { id: 11, name: "Mouse ergometrico", price: 150 },
  { id: 12, name: "Aliança de ouro 28k", price: 800 },
  { id: 13, name: "Lapis infinito", price: 19 },
  { id: 14, name: "Câmera Gopro Hero 11 Black 5.3k 27 Mp Chdhx-111 Preta Cor PretoCâmera Gopro Hero 11 Black 5.3k 27 Mp Chdhx-111 Preta Cor Preto", price: 2500 },
  { id: 15, name: "MacBook Pro 16-inch 2023 Space Gray 16.2 Apple M2 Pro 16GB de RAM 1 TB SSD", price: 13400},
  { id: 16, name: "Pulseira - 18k ", price: 890 },
  { id: 17, name: "Camisa Estilosa", price: 89.90 },
  { id: 18, name: "Óculos de sol Michael Kors", price: 1560 },
  { id: 19, name: "Mouse ergometrico", price: 120 },
  { id: 20, name: "Bolsa Michael Kors", price: 1500 },
]

router.post('/payment-intents', async (req, res) => {
  try {
    const productRequested = products.find(product => product.id === parseInt(req.query.id));
    if (!productRequested) {
      return res.status(404).send({ status: "error", error: 'Product not found' });
    }
    const paymentintentInfo = {
      amount: productRequested.price,
      currency: 'usd',
      // depois
      metadata : {
        userId: 'id autogerado pelo Mongo',
        orderDetails: JSON.stringify({
          [productRequested.name]: 2
        }, null, '\t'),
        // endereço de entrega
        address: JSON.stringify({
          street: 'Rua da Alegria',
          postalCode: '12345-678',
          externalNumber: "123123"
        }, null, '\t')
      }
    }
    const service = new PaymentService();
    let result = await service.createPaymentIntent(paymentintentInfo);
    console.log(result);
    res.send({ status: "success", payload: result });
  } catch (error) {
    console.log("Error creating payment intent", error);
    res.status(500).send({ status: "error", error: 'Internal Server Error' });
  }
})

module.exports = router;