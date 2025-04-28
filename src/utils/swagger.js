const swaggerUi = require('swagger-ui-express');
const yaml = require('yamljs');
const path = require('path');

const setupSwagger = (app) => {
  const swaggerDocument = yaml.load(path.join(__dirname, '../swagger/index.yaml'));

  app.use('/api-swagger', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
};

module.exports = setupSwagger;
