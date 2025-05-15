const app = require("./app");
const PORT = 5000;
const YAML = require('yamljs');
const cors = require('cors');

const swaggerUi = require("swagger-ui-express");
const swaggerDocument = YAML.load('src/docs/auth-service-api.yaml');
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use(cors({
  origin: 'http://localhost:5174'
}));

app.use((req, res) => {
  res.status(404).json({
      message: "Page not found"
  });
});

app.listen(PORT, () => {
  console.log(`Auth service running on port http://localhost:${PORT}`);
  console.log(`Auth service - Api docs available at http://localhost:${PORT}/api-docs`);
});
