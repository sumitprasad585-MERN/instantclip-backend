const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Instantclip',
    version: '1.0.0',
    description: 'A simple copy to clipboard application'
  },
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT'
      }
    }
  },
  security: [
    {
      bearerAuth: []
    }
  ]
};

module.exports = swaggerDefinition;
