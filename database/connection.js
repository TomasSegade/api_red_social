const mongoose = require("mongoose");
mongoose.set("strictQuery",true);

const connection = async() => {

    try{
        await mongoose.connect("mongodb://127.0.0.1:27017/mi_blog",{});

        console.log("Conectado correctamente a BD: Mi_Blog")
    } catch(error){
        console.log(error);
        throw new Error ("No se ha podido conectar a la base de datos");
    }

}

module.exports = {
    connection
}