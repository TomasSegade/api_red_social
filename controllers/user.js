// Importar dependencias y modulos

const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("../services/jwt")
const mongoosePagination = require("mongoose-pagination");
const res = require("express/lib/response");

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
    // Controlar en que pagina estamos
    let page = 1;
    if (req.params.page) {
        page = req.params.page;
    }
    page = parseInt(page);

    // Constulta con mongoose paginate
    let itemsPerPage = 5;

    User.find().sort('_id').paginate(page, itemsPerPage, (error, users, total) => {

        if (error || !users) {

            return res.status(404).json({
                status: "error",
                message: "error en la consulta",
                error
            });

        }

        // Devolver el resutlado (posteriormente info follow)
        return res.status(200).json({
            status: "success",
            users,
            page,
            itemsPerPage,
            total,
            pages: Math.ceil(total / itemsPerPage)
        });
    })

}


const update = (req, res) => {
    // Recoger info del usuario a actualizar
    let userIdentity = req.user;
    let userToUpdate = req.body;

    // Eliminar campos sobrantes
    delete userToUpdate.iat;
    delete userToUpdate.exp;
    delete userToUpdate.role;
    delete userToUpdate.image;

    // Comprobar si usuario ya existe

    User.find({
        $or: [
            { email: userToUpdate.email.toLowerCase() },
            { nick: userToUpdate.nick.toLowerCase() }
        ]
    }).exec(async (error, users) => {

        if (error) {
            return res.status(500).json({
                status: "error",
                message: "Error en la consulta"
            });
        };

        let userIsset = false;
        users.forEach(user => {
            if (user && user._id != userIdentity.id) {
                userIsset = true;
            }
        });

        if (userIsset) {
            return res.status(200).json({
                status: "success",
                message: "El usuario ya existe"
            });

        }

        //  Cifrar la contraseña
        if (userToUpdate.password) {
            let pwd = await bcrypt.hash(userToUpdate.password, 10);
            userToUpdate.password = pwd;
        }

        // Buscar y actualizar
        try {
            let userUpdate = await User.findByIdAndUpdate(userIdentity.id, userToUpdate, { new: true });


            if (!userUpdated) {
                return res.status(404).json({
                    status: "error",
                    message: "Error al actualizar usuario"
                });


                // Devolver respuesta
                return res.status(200).json({
                    status: "success",
                    message: "metodo actualizar usuario",
                    user: userToUpdate
                })
            }

        } catch (error) {
            return res.status(500).json({
                status: "error",
                message: "error al actualizar"
            })

        }




    });

}


module.exports = {
    register,
    login,
    profile,
    list,
    update
};