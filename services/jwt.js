// Importar dependencias
const jwt = require("jwt-simple");
const moment = require("moment");


// Clave secreta
const secret = "P4ss_S3cret_T0ken_Pr0yect_r3d_s0cial_7373";

// crear funcion para generar tokens
const createToken = (user) => {
    const payload = {
        id: user._id,
        name: user.name,
        surname: user.surname,
        nick: user.nick,
        email: user.email,
        role: user.role,
        image: user.image,
        iat: moment().unix(),
        exp: moment().add(30, "days").unix()
    };

    // Devolver jwt token codificado
    return jwt.encode(payload, secret);

}

module.exports = {
    createToken,
    secret
}
