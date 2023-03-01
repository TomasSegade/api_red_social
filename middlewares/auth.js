// Importra modulos

const jwt = require("jwt-simple");
const moment = require("moment");

// Importar clave secreta

const libjwt = require("../services/jwt");
const secret = libjwt.secret;

// MIDDLEWARE de autenticacion

const auth = (req, res, next) => {
    // Comprobar si llega cabecerea de auth
    if (!req.headers.authorization) {
        return res.status(403).json({
            status: "error",
            messagge: "La peticion no tiene la cabecera de autenticacion"
        });
    }

    // limpiar el token
    let token = req.headers.authorization.replace(/['"]+/g, '');


    // Decodificar token
    try {
        let payload = jwt.decode(token, secret);

        // Comprobar expiracion de token
        if (payload.exp <= moment().unix()) {
            return res.status(401).json({
                status: "error",
                messagge: "Token expirado"
            });
        }
        // Agregar datos del user a la request
        req.user = payload;



    } catch (error) {
        return res.status(400).json({
            status: "error",
            messagge: "Token invalido"
        });
    }

    // Pasar a ejecucion de accion
    next()

}



module.exports = {
    
    auth

}