/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */

// Concretamente el framework express.
const express = require("express");

const { MongoClient, ObjectId, ServerApiVersion } = require('mongodb'); // Importar ObjectId
// Inicializamos la aplicación
const app = express();
const uri = "mongodb+srv://jvalgon2207:PHELRS12@cluster0.on77w.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

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
    db = await client.db("Cluster0"); // Usamos la base de datos "Cluster0" en lugar de una local
    console.log(`Servidor desplegado en puerto: ${port}`);
  } catch (err) {
    console.error("Error al conectar a la base de datos", err);
  }
});

// 1. Obtener todos los concesionarios
app.get("/concesionarios", async (request, response) => {
  try {
    const concesionarios = await db.collection("concesionarios").find({}).toArray();
    response.json(concesionarios);
  } catch (err) {
    response.status(500).json({ error: "Error al obtener los concesionarios" });
  }
});

// 2. Crear un nuevo concesionario
app.post("/concesionarios", async (request, response) => {
  try {
    const { nombre, direccion } = request.body;
    const nuevoConcesionario = {
      nombre,
      direccion,
      coches: [],
    };
    const result = await db.collection("concesionarios").insertOne(nuevoConcesionario);
    response.status(201).json(result.ops[0]); // Devuelve el concesionario creado
  } catch (err) {
    response.status(500).json({ error: "Error al crear el concesionario" });
  }
});

// 3. Obtener un concesionario por ID
app.get("/concesionarios/:id", async (request, response) => {
  try {
    const id = new ObjectId(request.params.id); // Convertimos el ID de string a ObjectId
    const concesionario = await db.collection("concesionarios").findOne({ _id: id });

    if (!concesionario) {
      return response.status(404).json({ message: "Concesionario no encontrado" });
    }

    response.json(concesionario);
  } catch (err) {
    response.status(500).json({ error: "Error al obtener el concesionario" });
  }
});

// 4. Actualizar un concesionario por ID
app.put("/concesionarios/:id", async (request, response) => {
  try {
    const id = new ObjectId(request.params.id);
    const { nombre, direccion } = request.body;

    const result = await db.collection("concesionarios").updateOne(
      { _id: id },
      { $set: { nombre, direccion } }
    );

    if (result.matchedCount === 0) {
      return response.status(404).json({ message: "Concesionario no encontrado" });
    }

    response.json({ message: "Concesionario actualizado" });
  } catch (err) {
    response.status(500).json({ error: "Error al actualizar el concesionario" });
  }
});

// 5. Borrar un concesionario por ID
app.delete("/concesionarios/:id", async (request, response) => {
  try {
    const id = new ObjectId(request.params.id);

    const result = await db.collection("concesionarios").deleteOne({ _id: id });

    if (result.deletedCount === 0) {
      return response.status(404).json({ message: "Concesionario no encontrado" });
    }

    response.status(204).json();
  } catch (err) {
    response.status(500).json({ error: "Error al borrar el concesionario" });
  }
});

// 6. Obtener todos los coches de un concesionario
app.get("/concesionarios/:id/coches", async (request, response) => {
  try {
    const id = new ObjectId(request.params.id);
    const concesionario = await db.collection("concesionarios").findOne({ _id: id });

    if (!concesionario) {
      return response.status(404).json({ message: "Concesionario no encontrado" });
    }

    response.json(concesionario.coches);
  } catch (err) {
    response.status(500).json({ error: "Error al obtener los coches" });
  }
});

// 7. Añadir un coche a un concesionario
app.post("/concesionarios/:id/coches", async (request, response) => {
  try {
    const id = new ObjectId(request.params.id);
    const { modelo, cv, precio } = request.body;

    const concesionario = await db.collection("concesionarios").findOne({ _id: id });

    if (!concesionario) {
      return response.status(404).json({ message: "Concesionario no encontrado" });
    }

    const nuevoCoche = { modelo, cv, precio };
    concesionario.coches.push(nuevoCoche);

    await db.collection("concesionarios").updateOne(
      { _id: id },
      { $set: { coches: concesionario.coches } }
    );

    response.status(201).json(nuevoCoche);
  } catch (err) {
    response.status(500).json({ error: "Error al añadir el coche" });
  }
});

// 8. Obtener un coche específico de un concesionario
app.get("/concesionarios/:id/coches/:cocheId", async (request, response) => {
  try {
    const id = new ObjectId(request.params.id);
    const cocheId = parseInt(request.params.cocheId);

    const concesionario = await db.collection("concesionarios").findOne({ _id: id });

    if (!concesionario) {
      return response.status(404).json({ message: "Concesionario no encontrado" });
    }

    const coche = concesionario.coches.find((c) => c.id === cocheId);
    if (!coche) {
      return response.status(404).json({ message: "Coche no encontrado" });
    }

    response.json(coche);
  } catch (err) {
    response.status(500).json({ error: "Error al obtener el coche" });
  }
});

// 9. Actualizar un coche de un concesionario
app.put("/concesionarios/:id/coches/:cocheId", async (request, response) => {
  try {
    const id = new ObjectId(request.params.id);
    const cocheId = parseInt(request.params.cocheId);
    const { modelo, cv, precio } = request.body;

    const concesionario = await db.collection("concesionarios").findOne({ _id: id });

    if (!concesionario) {
      return response.status(404).json({ message: "Concesionario no encontrado" });
    }

    const coche = concesionario.coches.find((c) => c.id === cocheId);
    if (!coche) {
      return response.status(404).json({ message: "Coche no encontrado" });
    }

    coche.modelo = modelo;
    coche.cv = cv;
    coche.precio = precio;

    await db.collection("concesionarios").updateOne(
      { _id: id },
      { $set: { coches: concesionario.coches } }
    );

    response.json(coche);
  } catch (err) {
    response.status(500).json({ error: "Error al actualizar el coche" });
  }
});

// 10. Borrar un coche de un concesionario
app.delete("/concesionarios/:id/coches/:cocheId", async (request, response) => {
  try {
    const id = new ObjectId(request.params.id);
    const cocheId = parseInt(request.params.cocheId);

    const concesionario = await db.collection("concesionarios").findOne({ _id: id });

    if (!concesionario) {
      return response.status(404).json({ message: "Concesionario no encontrado" });
    }

    const index = concesionario.coches.findIndex((c) => c.id === cocheId);
    if (index !== -1) {
      concesionario.coches.splice(index, 1);
      await db.collection("concesionarios").updateOne(
        { _id: id },
        { $set: { coches: concesionario.coches } }
      );
      response.status(204).json();
    } else {
      response.status(404).json({ message: "Coche no encontrado" });
    }
  } catch (err) {
    response.status(500).json({ error: "Error al borrar el coche"});
  }
});
