// Importar dependencias y modulos

const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("../services/jwt")

// Registro de usuarios 

const register = (req, res) => {
    // Recoger datos de la peticion
    let params = req.body;

    // Comprobar que me llega bien ( + validacion)
    if (!params.name || !params.email || !params.password || !params.nick) {
        return res.status(400).json({
            status: "error",
            message: "Faltan datos por enviar"
        });
    }


    // Control users duplicados
    User.find({
        $or: [
            { email: params.email.toLowerCase() },
            { nick: params.nick.toLowerCase() }
        ]
    }).exec(async (error, users) => {

        if (error) {
            return res.status(500).json({
                status: "error",
                message: "Error en la consulta"
            });
        };

        if (users && users.length >= 1) {
            return res.status(200).json({
                status: "success",
                message: "El usuario ya existe"
            });

        }

        //  Cifrar la contraseña
        let pwd = await bcrypt.hash(params.password, 10);
        params.password = pwd;


        // Crear objeto de usuario
        let userSave = new User(params);

        // Guardar usuario en la BBDD
        userSave.save((error, userStored) => {

            if (error || !userStored) {
                return res.status(500).json({
                    status: "error",
                    message: "Error al guardar el usuario"
                });
            }

            // Devolver resultado
            return res.status(200).json({
                status: "success",
                message: "Usuario registrado correctamente",
                user: userStored
            });

        });



    });


};


const login = (req, res) => {
    // Recoger datos de la peticion
    let params = req.body;

    if (!params.email || !params.password) {
        return res.status(400).json({
            status: "error",
            message: "Faltan datos por enviar"
        })
    }

    // Buscar en BBDD si existe
    User.findOne({ email: params.email })
        //.select({"password": 0})
        .exec((error, user) => {
            if (error || !user) {
                return res.status(400).json({
                    status: "error",
                    message: "No existe el usuario"
                });
            };

            // Comprobar su contraseña
            const pwd = bcrypt.compareSync(params.password, user.password);

            if (!pwd) {
                return res.status(400).json({
                    status: "error",
                    message: "Contraseña invalida"
                });
            };

            // Conseguir Token
            const token = jwt.createToken(user);

            // Datos usuario
            return res.status(200).json({
                status: "success",
                message: "Inicio de sesion exitoso",
                user: {
                    id: user._id,
                    name: user.name,
                    nick: user.nick,

                },
                token
            });


        });



};


const profile = (req, res) => {
    // Recibir parametro de id de usuario por url
    const id = req.params.id;

    // Consulta para sacar datos de usuario
    User.findById(id)
        .select({ password: 0, role: 0 })
        .exec((error, userProfile) => {

            if (error || !userProfile) {
                return res.status(400).json({
                    status: "error",
                    message: "El usuario no existe o hay un error"
                });
            };
            // Devolver resultado, posteriormente devolveremos la info de follows
            return res.status(200).json({
                status: "success",
                user: userProfile
            });
        });

}

const list = (req, res) => {

    return res.status(200).json({
        status: "success",
        message: "Ruta de listado de usuarios"
    });
}


module.exports = {
    register,
    login,
    profile
};