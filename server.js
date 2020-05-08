const express = require( 'express' );
const bodyParser = require( 'body-parser' );
const morgan = require( 'morgan' );
const mongoose = require( 'mongoose' );
const { Items } = require( './models/itemModel' );

/* Modelos de mongodb aqui */

/* utilizamos express para realizar las llamadas a endpoints y correr nuestra
app */

const app = express();
const jsonParser = bodyParser.json();

app.use( morgan( 'dev' ) );

/* empezamos a constuir nuestros endpoints, necesitamos consulta, find,
inserción, remove, modificar */

// Consulta de artículos
app.get( '/api/items' , ( req, res ) => {
    console.log( "Consultando todos los articulos." );

    Items
        .getAllItems()// Usamos funcion para crear un nuevo item en ItemModel.js
        .then( result => {// Si el resultado es satisfactorio, returnamos 200.
            return res.status( 200 ).json( result );
        })
        .catch( err => { // Si hay error, catch y retornamos 500.
            res.statusMessage = "Something is wront with the database. Try again later.";

            return res.status( 500 ).end();
        })
});

// Consulta de articulos por ID
app.get( '/api/itemsById', ( req, res ) => {
    console.log( "Buscando articulos por id." );

    console.log( req.query );

    let itemId = req.query.id;

    if( !itemId ){
        res.statusMessage = "Please send an 'id' as a parameter.";
        return res.status( 406 ).end();
    }

    Items
        .findItemById( itemId )
        .then( result => {
            return res.status( 200 ).json( result );
        })
        .catch( err => {
            res.statusMessage = "Something went wrong with the databse, please try again later.";

            return res.status( 500 ).end();
        })
});

// Creacion de articulo
app.post( '/api/createItem', jsonParser, ( req, res ) => {
    console.log( "Añadiendo un nuevo articulo a la lista." );
    console.log( "Body ", req.body );

    let name = req.body.name;
    let id = req.body.id;
    let description = req.body.description;
    let price = req.body.price;

    // Hay que checar que todos los parametros estan en el body...

    if( !name || !id || !description || !price ){
        res.statusMessage = "One parameter is missing in the request.";

        return res.status( 406 ).end();
    }

    if( typeof(id) !== 'number' ){// Si el id no es un numero...
        res.statusMessage = "The 'id' MUST be a number.";

        return res.status( 409 ).end();
    }

    let newItem = { name, id, description, price };

    Items
        .createItem( newItem )
        .then( result => {
            // Necesitamos tomar el error de id duplicado
            if( result.errmsg ){
                res.statusMessage = "The 'id' belongs to another item. " + result.errmsg;
                return res.status( 409 ).end();
            }
            return res.status( 201 ).json ( result );
        })
        .catch( err => {
            res.statusMessage = "Somethinw went wrong with the database. Try again.";
            return res.status( 500 ).end();
        });
});

// Borrar articulo
app.delete( '/api/removeItem/:id', ( req, res ) => {
    console.log( "Quitando articulo de la lista... " );

    let itemId = req.params.id;

    if( !itemId ){
        res.statusMessage = "Please send a 'id'.";

        return res.status( 406 ).end();
    }

    Items
        .removeItemById( itemId )
        .then( result => {
            return res.status( 200 ).json( result );
        })
        .catch( err => {
            res.statusMessage = "Something went wrong with the databse, try again later.";

            return res.status( 500 ).end();
        })

});

// Modificar articulo
app.patch( '/api/modifyItemById/:id', jsonParser, ( req, res ) => {
    let itemId = req.params.id;
    let idbody = req.body.id;

    console.log( `${itemId} , ${idbody}` );

    let itemName = req.body.name;
    let itemPrice = req.body.price;
    let itemDescription = req.body.description;

    if( !req.body ){
        res.statusMessage = "Please send a body with the correct data.";

        return res.status( 406 ).end();
    }

    if( itemId != idbody ){
        res.statusMessage = "Id on path parameter and body are not equal.";

        return res.status( 409 ).end();
    }

    console.log( `Actualizando articulo (${itemId}).`);
    console.log( "Body" , req.body );

    if( itemName ){
        Items
            .updateName( itemId, itemName )
            .then( result => {
                return res.status( 200 ).json( result );
            })
            .catch( err => {
                res.statusMessage = "Something went wrong with the database, please try again later.";

                return res.status( 500 ).end();
            })
    }

    if( itemPrice ){
        Items
            .updatePrice( itemId, itemPrice )
            .then( result => {
                return res.status( 200 ).json( result );
            })
            .catch( err => {
                res.statusMessage = "Something went wrong with the database, please try again later.";

                return res.status( 500 ).end();
            })
    }
    
    if( itemDescription ){
        Items
            .updateDescription( itemId, itemDescription )
            .then( result => {
                return res.status( 200 ).json( result );
            })
            .catch( err => {
                res.statusMessage = "Something went wrong with the database, please try again later.";

                return res.status( 500 ).end();
            })
    }

    if( !itemName && !itemPrice && !itemDescription ){
        res.statusMessage = "There were no parameters sent to update.";

        return res.status( 406 ).end();
    }
});

app.listen( 8080, () => {
    console.log( "Este servidor esta corriendo en el puerto 8080 (items) ..." );

    new Promise( ( resolve, reject ) => {// Creamos una nueva promesa.

        const settings = {// importamos settings para nuestra base de datos.
            useNewUrlParser : true,
            useUnifiedTopology : true,
            useCreateIndex : true
        };
        mongoose.connect( 'mongodb://localhost/itemsdb', settings, ( err ) => {
            if ( err ){ // Si existe un error, entonces rechazo con el error.
                return reject( err );
            }
            else{
                console.log( "Base de datos conectada satisfactoriamente." );
                return resolve(); // Success, return resolve!
            }
        })
    })
    .catch( err => {// Catch error en caso de error de conexión.
        console.log( err );
    });
});