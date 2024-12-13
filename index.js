/**
 * Tres formas de almacenar valores en memoria en javascript:
 *      let: se puede modificar
 *      var: se puede modificar
 *      const: es constante y no se puede modificar
 */

// Importamos las bibliotecas necesarias.
// Concretamente el framework express.
const express = require("express");

// Inicializamos la aplicación
const app = express();

// Indicamos que la aplicación puede recibir JSON (API Rest)
app.use(express.json());

// Indicamos el puerto en el que vamos a desplegar la aplicación
const port = process.env.PORT || 8080;

// Arrancamos la aplicación
app.listen(port, () => {
  console.log(`Servidor desplegado en puerto: ${port}`);
});

// Definimos una estructura de datos para concesionarios y coches
let concesionarios = [
  {
    id: 1,
    nombre: "Concesionario A",
    direccion: "Calle Falsa 123",
    coches: [
      { id: 1, modelo: "Clio", cv: 75, precio: 10000 },
      { id: 2, modelo: "Skyline R34", cv: 280, precio: 25000 },
    ],
  },
  {
    id: 2,
    nombre: "Concesionario B",
    direccion: "Avenida Siempre Viva 456",
    coches: [
      { id: 3, modelo: "Fiesta", cv: 90, precio: 15000 },
      { id: 4, modelo: "Focus", cv: 120, precio: 18000 },
    ],
  },
];

// Endpoints de la API

// 1. Obtener todos los concesionarios
app.get("/concesionarios", (request, response) => {
  response.json(concesionarios);
});

// 2. Crear un nuevo concesionario
app.post("/concesionarios", (request, response) => {
  const { nombre, direccion } = request.body;
  const nuevoConcesionario = {
    id: concesionarios.length + 1,
    nombre,
    direccion,
    coches: [],
  };
  concesionarios.push(nuevoConcesionario);
  response.status(201).json(nuevoConcesionario);
});

// 3. Obtener un concesionario por ID
app.get("/concesionarios/:id", (request, response) => {
  const id = parseInt(request.params.id);
  const concesionario = concesionarios.find((c) => c.id === id);
  if (concesionario) {
    response.json(concesionario);
  } else {
    response.status(404).json({ message: "Concesionario no encontrado" });
  }
});

// 4. Actualizar un concesionario por ID
app.put("/concesionarios/:id", (request, response) => {
  const id = parseInt(request.params.id);
  const { nombre, direccion } = request.body;
  const concesionario = concesionarios.find((c) => c.id === id);
  if (concesionario) {
    concesionario.nombre = nombre;
    concesionario.direccion = direccion;
    response.json(concesionario);
  } else {
    response.status(404).json({ message: "Concesionario no encontrado" });
  }
});

// 5. Borrar un concesionario por ID
app.delete("/concesionarios/:id", (request, response) => {
  const id = parseInt(request.params.id);
  const index = concesionarios.findIndex((c) => c.id === id);
  if (index !== -1) {
    concesionarios.splice(index, 1);
    response.status(204).json();
  } else {
    response.status(404).json({ message: "Concesionario no encontrado" });
  }
});

// 6. Obtener todos los coches de un concesionario
app.get("/concesionarios/:id/coches", (request, response) => {
  const id = parseInt(request.params.id);
  const concesionario = concesionarios.find((c) => c.id === id);
  if (concesionario) {
    response.json(concesionario.coches);
  } else {
    response.status(404).json({ message: "Concesionario no encontrado" });
  }
});

// 7. Añadir un coche a un concesionario
app.post("/concesionarios/:id/coches", (request, response) => {
  const id = parseInt(request.params.id);
  const { modelo, cv, precio } = request.body;
  const concesionario = concesionarios.find((c) => c.id === id);
  if (concesionario) {
    const nuevoCoche = {
      id: concesionario.coches.length + 1,
      modelo,
      cv,
      precio,
    };
    concesionario.coches.push(nuevoCoche);
    response.status(201).json(nuevoCoche);
  } else {
    response.status(404).json({ message: "Concesionario no encontrado" });
  }
});

// 8. Obtener un coche específico de un concesionario
app.get("/concesionarios/:id/coches/:cocheId", (request, response) => {
  const id = parseInt(request.params.id);
  const cocheId = parseInt(request.params.cocheId);
  const concesionario = concesionarios.find((c) => c.id === id);
  if (concesionario) {
    const coche = concesionario.coches.find((c) => c.id === cocheId);
    if (coche) {
      response.json(coche);
    } else {
      response.status(404).json({ message: "Coche no encontrado" });
    }
  } else {
    response.status(404).json({ message: "Concesionario no encontrado" });
  }
});

// 9. Actualizar un coche de un concesionario
app.put("/concesionarios/:id/coches/:cocheId", (request, response) => {
  const id = parseInt(request.params.id);
  const cocheId = parseInt(request.params.cocheId);
  const { modelo, cv, precio } = request.body;
  const concesionario = concesionarios.find((c) => c.id === id);
  if (concesionario) {
    const coche = concesionario.coches.find((c) => c.id === cocheId);
    if (coche) {
      coche.modelo = modelo;
      coche.cv = cv;
      coche.precio = precio;
      response.json(coche);
    } else {
      response.status(404).json({ message: "Coche no encontrado" });
    }
  } else {
    response.status(404).json({ message: "Concesionario no encontrado" });
  }
});

// 10. Borrar un coche de un concesionario
app.delete("/concesionarios/:id/coches/:cocheId", (request, response) => {
  const id = parseInt(request.params.id);
  const cocheId = parseInt(request.params.cocheId);
  const concesionario = concesionarios.find((c) => c.id === id);
  if (concesionario) {
    const index = concesionario.coches.findIndex((c) => c.id === cocheId);
    if (index !== -1) {
      concesionario.coches.splice(index, 1);
      response.status(204).json();
    } else {
      response.status(404).json({ message: "Coche no encontrado" });
    }
  } else {
    response.status(404).json({ message: "Concesionario no encontrado" });
  }
});
