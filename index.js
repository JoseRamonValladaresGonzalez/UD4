/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */

const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./swagger.json");
const express = require("express");
const helmet = require("helmet");  // Importamos helmet para agregar seguridad


const { MongoClient, ObjectId, ServerApiVersion } = require('mongodb'); // Importar ObjectId

// Inicializamos la aplicación
const app = express();
const uri = "mongodb+srv://jvalgon2207:PHELRS12@cluster0.on77w.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

// Usamos helmet para añadir seguridad
app.use(helmet());  // Aplica automáticamente una serie de encabezados HTTP de seguridad

app.use(express.json());
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

const port = process.env.PORT || 8080;
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});
let db;

app.listen(port, async () => {
  try {
    await client.connect();
    db = await client.db("Cluster0");
    console.log(`Servidor desplegado en puerto: ${port}`);
  } catch (err) { console.error("Error al conectar", err); }
});

// Obtener todos los concesionarios
app.get("/concesionarios", async (req, res) => {
  try {
    const concesionarios = await db
      .collection("concesionarios")
      .find({})
      .toArray();
    res.json(concesionarios);
  } catch (err) {
    res.status(500).json({ error: "Error al obtener los concesionarios" });
  }
});

// Crear concesionario
app.post("/concesionarios", async (req, res) => {
  try {
    await db.collection("concesionarios").insertOne(req.body);
    res.json({ message: "ok" });
  } catch (err) {
    res.status(500).json({ error: "Error al añadir el concesionario" });
  }
});

// Obtener un concesionario por ID
app.get("/concesionarios/:id", async (req, res) => {
  try {
    const id = new ObjectId(req.params.id);
    const concesionario = await db
      .collection("concesionarios")
      .findOne({ _id: id });
    if (!concesionario) {
      return res.status(404).json({ error: "Concesionario no encontrado" });
    }
    res.json(concesionario);
  } catch (err) {
    res.status(500).json({ error: "Error al obtener el concesionario" });
  }
});

// Obtener coches con filtros (por marca y/o modelo)
app.get("/coches", async (req, res) => {
  try {
    const { marca, modelo } = req.query;
    let filter = {};
    if (marca) filter.marca = marca;
    if (modelo) filter.modelo = modelo;
    const coches = await db.collection("coches").find(filter).toArray();
    res.json(coches);
  } catch (err) {
    res.status(500).json({ error: "Error al obtener los coches" });
  }
});

// Crear coche
app.post("/coches", async (req, res) => {
  try {
    await db.collection("coches").insertOne(req.body);
    res.json({ message: "ok" });
  } catch (err) {
    res.status(500).json({ error: "Error al añadir el coche" });
  }
});

// Obtener coche por ID
app.get("/coches/:id", async (req, res) => {
  try {
    const id = new ObjectId(req.params.id);
    const coche = await db.collection("coches").findOne({ _id: id });
    if (!coche) {
      return res.status(404).json({ error: "Coche no encontrado" });
    }
    res.json(coche);
  } catch (err) {
    res.status(500).json({ error: "Error al obtener el coche" });
  }
});

// Actualizar coche por ID
app.put("/coches/:id", async (req, res) => {
  try {
    const id = new ObjectId(req.params.id);
    await db.collection("coches").updateOne({ _id: id }, { $set: req.body });
    res.json({ message: "ok" });
  } catch (err) {
    res.status(500).json({ error: "Error al actualizar el coche" });
  }
});

// Eliminar coche por ID
app.delete("/coches/:id", async (req, res) => {
  try {
    const id = new ObjectId(req.params.id);
    await db.collection("coches").deleteOne({ _id: id });
    res.json({ message: "ok" });
  } catch (err) {
    res.status(500).json({ error: "Error al eliminar el coche" });
  }

});
