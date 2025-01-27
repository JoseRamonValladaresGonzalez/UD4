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
    res.status(201).json({ message: "Concesionario creado correctamente" });
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

// Actualizar concesionario por ID
app.put("/concesionarios/:id", async (req, res) => {
  try {
    const id = new ObjectId(req.params.id);
    const result = await db.collection("concesionarios").updateOne({ _id: id }, { $set: req.body });
    if (result.matchedCount === 0) {
      return res.status(404).json({ error: "Concesionario no encontrado" });
    }
    res.json({ message: "Concesionario actualizado correctamente" });
  } catch (err) {
    res.status(500).json({ error: "Error al actualizar el concesionario" });
  }
});

// Eliminar concesionario por ID
app.delete("/concesionarios/:id", async (req, res) => {
  try {
    const id = new ObjectId(req.params.id);
    const result = await db.collection("concesionarios").deleteOne({ _id: id });
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: "Concesionario no encontrado" });
    }
    res.json({ message: "Concesionario eliminado correctamente" });
  } catch (err) {
    res.status(500).json({ error: "Error al eliminar el concesionario" });
  }
});

// Obtener todos los coches de un concesionario por ID
app.get("/concesionarios/:id/coches", async (req, res) => {
  try {
    const id = new ObjectId(req.params.id);
    const concesionario = await db.collection("concesionarios").findOne({ _id: id });
    if (!concesionario) {
      return res.status(404).json({ error: "Concesionario no encontrado" });
    }
    res.json(concesionario.coches || []);
  } catch (err) {
    res.status(500).json({ error: "Error al obtener los coches" });
  }
});

// Añadir un nuevo coche a un concesionario por ID
app.post("/concesionarios/:id/coches", async (req, res) => {
  try {
    const id = new ObjectId(req.params.id);
    const concesionario = await db.collection("concesionarios").findOne({ _id: id });
    if (!concesionario) {
      return res.status(404).json({ error: "Concesionario no encontrado" });
    }
    const coche = req.body;
    await db.collection("concesionarios").updateOne(
      { _id: id },
      { $push: { coches: coche } }
    );
    res.status(201).json({ message: "Coche añadido correctamente" });
  } catch (err) {
    res.status(500).json({ error: "Error al añadir el coche" });
  }
});

// Obtener coche por ID de concesionario y coche
app.get("/concesionarios/:id/coches/:cocheId", async (req, res) => {
  try {
    const id = new ObjectId(req.params.id);
    const cocheId = req.params.cocheId;
    const concesionario = await db.collection("concesionarios").findOne({ _id: id });
    if (!concesionario) {
      return res.status(404).json({ error: "Concesionario no encontrado" });
    }
    const coche = concesionario.coches.find(c => c.id === cocheId);
    if (!coche) {
      return res.status(404).json({ error: "Coche no encontrado" });
    }
    res.json(coche);
  } catch (err) {
    res.status(500).json({ error: "Error al obtener el coche" });
  }
});

// Actualizar coche por ID de concesionario y coche
app.put("/concesionarios/:id/coches/:cocheId", async (req, res) => {
  try {
    const id = new ObjectId(req.params.id);
    const cocheId = req.params.cocheId;
    const concesionario = await db.collection("concesionarios").findOne({ _id: id });
    if (!concesionario) {
      return res.status(404).json({ error: "Concesionario no encontrado" });
    }
    const cocheIndex = concesionario.coches.findIndex(c => c.id === cocheId);
    if (cocheIndex === -1) {
      return res.status(404).json({ error: "Coche no encontrado" });
    }
    concesionario.coches[cocheIndex] = req.body;
    await db.collection("concesionarios").updateOne(
      { _id: id },
      { $set: { coches: concesionario.coches } }
    );
    res.json({ message: "Coche actualizado correctamente" });
  } catch (err) {
    res.status(500).json({ error: "Error al actualizar el coche" });
  }
});

// Eliminar coche por ID de concesionario y coche
app.delete("/concesionarios/:id/coches/:cocheId", async (req, res) => {
  try {
    const id = new ObjectId(req.params.id);
    const cocheId = req.params.cocheId;
    const concesionario = await db.collection("concesionarios").findOne({ _id: id });
    if (!concesionario) {
      return res.status(404).json({ error: "Concesionario no encontrado" });
    }
    const cocheIndex = concesionario.coches.findIndex(c => c.id === cocheId);
    if (cocheIndex === -1) {
      return res.status(404).json({ error: "Coche no encontrado" });
    }
    concesionario.coches.splice(cocheIndex, 1);
    await db.collection("concesionarios").updateOne(
      { _id: id },
      { $set: { coches: concesionario.coches } }
    );
    res.json({ message: "Coche eliminado correctamente" });
  } catch (err) {
    res.status(500).json({ error: "Error al eliminar el coche" });
  }
});
