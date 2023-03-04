const Follow = require('../models/Follow');
const User = require('../models/User');
const moongoosePaginate = require('mongoose-Pagination');
const followService = require('../services/followService');





// Acciones de prueba 

const pruebaFollow = (req, res) => {
    return res.status(200).send({
        message: "Mensaje enviado desde: controller/follow.js "
    });
};


// Accion de guardar follow (accion de seguir)
const save = (req, res) => {

    // Conseguir datos del body
    const params = req.body;

    // Sacar id del usuario identificado
    const identity = req.user;

    // Crear objeto con modelo follow
    let userToFollow = new Follow({
        user: identity.id,
        followed: params.followed
    });

    // Guardar el objeto en bbdd
    userToFollow.save((error, followStored) => {

        if (error || !followStored) {
            return res.status(500).json({
                status: "error",
                message: "No se ha podido seguir al usuario"
            });
        }

        return res.status(200).json({
            status: "success",
            identity: req.user,
            follow: followStored
        });
    });


};

// Accion de borrar follow (accion dejar de seguir)
const unfollow = (req, res) => {
    // Recoger id uduario identificado 
    const userID = req.user.id;

    // Recoger usuario que sigo y quiero dejar de seguir
    const followedId = req.params.id;

    // Find de coincidencias y ejecutar remove
    Follow.find({
        "user": userID,
        "followed": followedId
    }).remove((error, followDeleted) => {

        if (error || !followDeleted) {
            return res.status(500).json({
                status: "error",
                message: "No has dejado de seguir a nadie"
            });
        }

        return res.status(200).json({
            status: "success",
            message: "Follow eliminado correctamente"
        });
    });




};

// Listado de usuarios que cualquier usuario esta siguiendo (siguiendo)
const following = (req, res) => {
    // Sacar el id del usuario identificado
    let userId = req.user.id;

    // Comprobar si me llega id por parametro en url
    if (req.params.id) {
        userId = req.params.id;
    };

    // Comprobar si me llega la pagina, si no la pagina uno
    let page = 1;

    if (req.params.page) {
        page = req.params.page;
    };


    // User por pagina quiero mostrar
    const itemsPerPage = 5;

    // Find a follow, popular datos del usuario y pagina con moongose paginate
    Follow.find({ "user": userId })
        .populate("user followed", "-password -role -__v")
        .paginate(page, itemsPerPage, async (error, follows, total) => {


            // Listado de usuarios de que tenemos en comun y me siguen, sacando array de ids de los users que me siguen y los que sigo como user registrado
            let followUserIds = await followService.followUserIds(req.user.id)


            return res.status(200).json({
                status: "success",
                message: "Listado de usuarios que estoy siguiendo",
                follows,
                total,
                pages: Math.ceil(total / itemsPerPage),
                user_following: followUserIds.following,
                user_follow_me: followUserIds.followers
            });
        })



};


// listado de usuarios que siguen a cualquier otro usuario (me siguen)
const followers = (req, res) => {
    return res.status(200).json({
        status: "success",
        message: "Listado de usuarios que me siguen"
    });
};




module.exports = {
    pruebaFollow,
    save,
    unfollow,
    following,
    followers
};
