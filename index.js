/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */

const express = require("express");
const helmet = require("helmet");  // Importamos helmet para agregar seguridad

const { MongoClient, ObjectId, ServerApiVersion } = require('mongodb'); // Importar ObjectId

// Inicializamos la aplicación
const app = express();
const uri = "mongodb+srv://jvalgon2207:PHELRS12@cluster0.on77w.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

// Usamos helmet para añadir seguridad
app.use(helmet());  // Aplica automáticamente una serie de encabezados HTTP de seguridad

// Indicamos que la aplicación puede recibir JSON (API Rest)
app.use(express.json());

// Indicamos el puerto en el que vamos a desplegar la aplicación
const port = process.env.PORT || 8080;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});
let db;

// Arrancar aplicación
app.listen(port, async () => {
  try {
    await client.connect();
    db = await client.db("Cluster0");
    console.log(`Servidor desplegado en puerto: ${port}`);
  } catch (err) { console.error("Error al conectar", err); }
});

// Obtener todos los concesionarios
app.get("/concesionarios", async (req, res) => {
  try { res.json(await db.collection("concesionarios").find({}).toArray()); }
  catch (err) { res.status(500).json({ error: "Error al obtener concesionarios" }); }
});

// Crear un nuevo concesionario
app.post("/concesionarios", async (req, res) => {
  try {
    const { nombre, direccion } = req.body;
    const result = await db.collection("concesionarios").insertOne({ nombre, direccion, coches: [] });
    res.status(201).json({ _id: result.insertedId, nombre, direccion, coches: [] });
  } catch (err) { res.status(500).json({ error: "Error al crear concesionario" }); }
});

// Obtener un concesionario por ID
app.get("/concesionarios/:id", async (req, res) => {
  try {
    const concesionario = await db.collection("concesionarios").findOne({ _id: new ObjectId(req.params.id) });
    if (!concesionario) return res.status(404).json({ message: "Concesionario no encontrado" });
    res.json(concesionario);
  } catch (err) { res.status(500).json({ error: "Error al obtener concesionario" }); }
});

// Actualizar concesionario por ID
app.put("/concesionarios/:id", async (req, res) => {
  try {
    const { nombre, direccion } = req.body;
    const result = await db.collection("concesionarios").updateOne({ _id: new ObjectId(req.params.id) }, { $set: { nombre, direccion } });
    if (!result.matchedCount) return res.status(404).json({ message: "Concesionario no encontrado" });
    res.json({ message: "Concesionario actualizado" });
  } catch (err) { res.status(500).json({ error: "Error al actualizar concesionario" }); }
});

// Borrar concesionario por ID
app.delete("/concesionarios/:id", async (req, res) => {
  try {
    const result = await db.collection("concesionarios").deleteOne({ _id: new ObjectId(req.params.id) });
    if (!result.deletedCount) return res.status(404).json({ message: "Concesionario no encontrado" });
    res.status(204).json();
  } catch (err) { res.status(500).json({ error: "Error al borrar concesionario" }); }
});

// Obtener coches de un concesionario
app.get("/concesionarios/:id/coches", async (req, res) => {
  try {
    const concesionario = await db.collection("concesionarios").findOne({ _id: new ObjectId(req.params.id) });
    if (!concesionario) return res.status(404).json({ message: "Concesionario no encontrado" });
    res.json(concesionario.coches);
  } catch (err) { res.status(500).json({ error: "Error al obtener coches" }); }
});

// Añadir un coche a un concesionario
app.post("/concesionarios/:id/coches", async (req, res) => {
  try {
    const { modelo, cv, precio } = req.body;
    const concesionario = await db.collection("concesionarios").findOne({ _id: new ObjectId(req.params.id) });
    if (!concesionario) return res.status(404).json({ message: "Concesionario no encontrado" });
    const nuevoCoche = { modelo, cv, precio };
    concesionario.coches.push(nuevoCoche);
    await db.collection("concesionarios").updateOne({ _id: new ObjectId(req.params.id) }, { $set: { coches: concesionario.coches } });
    res.status(201).json(nuevoCoche);
  } catch (err) { res.status(500).json({ error: "Error al añadir coche" }); }
});

// Obtener un coche específico de un concesionario
app.get("/concesionarios/:id/coches/:cocheId", async (req, res) => {
  try {
    const concesionario = await db.collection("concesionarios").findOne({ _id: new ObjectId(req.params.id) });
    if (!concesionario) return res.status(404).json({ message: "Concesionario no encontrado" });
    const coche = concesionario.coches.find(c => c.id === parseInt(req.params.cocheId));
    if (!coche) return res.status(404).json({ message: "Coche no encontrado" });
    res.json(coche);
  } catch (err) { res.status(500).json({ error: "Error al obtener coche" }); }
});

// Actualizar un coche de un concesionario
app.put("/concesionarios/:id/coches/:cocheId", async (req, res) => {
  try {
    const { modelo, cv, precio } = req.body;
    const concesionario = await db.collection("concesionarios").findOne({ _id: new ObjectId(req.params.id) });
    if (!concesionario) return res.status(404).json({ message: "Concesionario no encontrado" });
    const coche = concesionario.coches.find(c => c.id === parseInt(req.params.cocheId));
    if (!coche) return res.status(404).json({ message: "Coche no encontrado" });
    Object.assign(coche, { modelo, cv, precio });
    await db.collection("concesionarios").updateOne({ _id: new ObjectId(req.params.id) }, { $set: { coches: concesionario.coches } });
    res.json(coche);
  } catch (err) { res.status(500).json({ error: "Error al actualizar coche" }); }
});

// Borrar un coche de un concesionario
app.delete("/concesionarios/:id/coches/:cocheId", async (req, res) => {
  try {
    const concesionario = await db.collection("concesionarios").findOne({ _id: new ObjectId(req.params.id) });
    if (!concesionario) return res.status(404).json({ message: "Concesionario no encontrado" });
    const index = concesionario.coches.findIndex(c => c.id === parseInt(req.params.cocheId));
    if (index === -1) return res.status(404).json({ message: "Coche no encontrado" });
    concesionario.coches.splice(index, 1);
    await db.collection("concesionarios").updateOne({ _id: new ObjectId(req.params.id) }, { $set: { coches: concesionario.coches } });
    res.status(204).json();
  } catch (err) { res.status(500).json({ error: "Error al borrar coche" }); }
});
