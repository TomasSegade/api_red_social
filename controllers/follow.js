const Follow = require('../models/Follow');
const User = require('../models/User');


// Acciones de prueba 

const pruebaFollow = (req, res) => {
    return res.status(200).send({
        message: "Mensaje enviado desde: controller/follow.js "
    });
};


// Accion de guardar follow (accion de seguir)
const save = (req, res) => {

    // Conseguir datos del body
    

    // Sacar id del usuario identificado

    // Crear objeto con modelo follow

    // Guardar el objeto en bbdd



    return res.status(200).json({
        message: "hola"
    });
};


// Accion de borrar follow (accion dejar de seguir)



// Listado de usuarios que estoy siguiendo



// listado de usuarios que me siguen





module.exports = {
    pruebaFollow,
    save
};
