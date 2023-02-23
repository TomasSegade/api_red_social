// Importar dependencias
const {connection} = require("./database/connection");
const express = require("express");
const cors = require("cors");
const { json } = require("express");

// Mensaje bienvenida
console.log("Api node para red social arrancada");

// Conexion a base de datos
connection();

// Crear servidor node
const app = express();
const port = 3900;

// Configurar cors
app.use(cors());

// Convertir datos del body a objetos js
app.use(express.json());
app.use(express.urlencoded({extended: true}));

// Cargar conf rutas
const UserRoutes = require("./routes/user");
const PublicationRoutes = require("./routes/publication");
const FollowRoutes = require("./routes/follow");

app.use("/api/user", UserRoutes);
app.use("/api/publication", PublicationRoutes);
app.use("/api/follow", FollowRoutes);

// Poner servidor a escuchar peticiones http
app.listen(port, () => {
    console.log("Server corriento en el puerto: ", port);
});