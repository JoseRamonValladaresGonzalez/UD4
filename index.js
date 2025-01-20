/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */

// Concretamente el framework express.
const express = require("express");

const { MongoClient, ObjectId, ServerApiVersion } = require('mongodb'); // Importar ObjectId
// Inicializamos la aplicación
const app = express();
const uri = "mongodb+srv://jvalgon2207:1gUHuKqKeMuAtpCp@cluster0.on77w.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

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

// Arrancamos la aplicación
app.listen(port, async () => {
  try {
    await client.connect();
    db = await client.db("Cluster0");
    console.log(`Servidor desplegado en puerto: ${port}`);
  } catch (err) {
    console.error("Error al conectar a la base de datos", err);
  }
});

// Lista todos los coches
app.get("/coches", async (request, response) => {
  try {
    const coches = await db.collection("coches").find({}).toArray();
    response.json(coches);
  } catch (err) {
    response.status(500).json({ error: "Error al obtener los coches" });
  }
});

// Añadir un nuevo coche
app.post("/coches", async (request, response) => {
  try {
    await db.collection("coches").insertOne(request.body);
    response.json({ message: "ok" });
  } catch (err) {
    response.status(500).json({ error: "Error al añadir el coche" });
  }
});

// Obtener un solo coche
app.get("/coches/:id", async (request, response) => {
  try {
    const id = new ObjectId(request.params.id); // Usamos ObjectId para convertir la cadena a un id de MongoDB
    const coche = await db.collection("coches").findOne({ _id: id }); // findOne es más eficiente cuando buscamos un solo documento

    if (!coche) {
      return response.status(404).json({ error: "Coche no encontrado" });
    }

    response.json(coche);
  } catch (err) {
    response.status(500).json({ error: "Error al obtener el coche" });
  }
});

// Actualizar un solo coche
app.put("/coches/:id", async (request, response) => {
  try {
    const id = new ObjectId(request.params.id);
    const result = await db.collection("coches").updateOne({ _id: id }, { $set: request.body });

    if (result.matchedCount === 0) {
      return response.status(404).json({ error: "Coche no encontrado para actualizar" });
    }

    response.json({ message: "ok" });
  } catch (err) {
    response.status(500).json({ error: "Error al actualizar el coche" });
  }
});

// Borrar un coche
app.delete("/coches/:id", async (request, response) => {
  try {
    const id = new ObjectId(request.params.id);
    const result = await db.collection("coches").deleteOne({ _id: id });

    if (result.deletedCount === 0) {
      return response.status(404).json({ error: "Coche no encontrado para borrar" });
    }

    response.json({ message: "ok" });
  } catch (err) {
    response.status(500).json({ error: "Error al borrar el coche" });
  }
});
