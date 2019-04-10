var MongoClient = require('mongodb').MongoClient;
assert = require('assert');
var url = "mongodb://localhost:27017/";

var express = require('express');
var fs = require('fs');
app = express();

//var $ = require('jquery');
var bodyParser = require('body-parser');
var urlencodedParser = bodyParser.urlencoded({extended: false });
var mongodb = require('mongodb');

app.get('/Recetas/',function(req, res) {
  MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    var dbo = db.db("cocina");
  
    dbo.collection("receptes").find().toArray(function(err, result) {
    if (err) throw err;
    var tabla="<html><head><link rel='stylesheet' href='https://maxcdn.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css'></head>";
    tabla+="<body><div class='container'><br><div class='row'>";
    tabla+="<div class='col'><form action='/Recetas/Filtrado/' method='POST'><label>Filtrar: <input type='text' name='filtro'></label>&nbsp&nbsp<input class='btn btn-dark' type='submit' value='Buscar'></form></div></div>";
    tabla+="<div class='row'><div class='col'><h1>Recetas Vegetarianas</h1></div></div><div class='row'><div class='col-md-2'></div>";
    tabla+="<div class='col-md-8'><table class='table table-dark table-striped'>";
    for(var i=0; i<result.length;i++ ){
      tabla+="<tr><td width='60%'>"+result[i]['nom_recepta']+'</td><td width="20%"><a class="btn btn-light" href="/Recetas/Vista/'+result[i]['_id']+'">Ver receta</a></td><td width="20%"><a class="btn btn-light" href="/Editar/'+result[i]['_id']+'">Editar</a></td><td width="20%"><a class="btn btn-light" href="/Eliminar/'+result[i]['_id']+'">Eliminar</a></td></tr>';
    }
    tabla+="</table></div><div class='col-md-2'></div></div><div class='row'><div class='col-md-5'></div><div class='col-md-2'><button align='center' class='btn btn-dark' onclick=window.location='/Recetas/Crear/'>Crear</button></div><div class='col-md-5'></div></div></table></div></body></html>";
    res.send(tabla);
      
    db.close();
    });
  
  });
})

app.get('/Recetas/Vista/:Id',function(req, res) {
  //console.log("entro");
  var id_actual = req.params.Id;
  MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    var dbo = db.db("cocina");
    dbo.collection("receptes").findOne({_id: new mongodb.ObjectID(id_actual) },(function(err, result) {
    if (err) throw err;
    var tabla="<html><head><link rel='stylesheet' href='https://maxcdn.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css'></head>";
    tabla+="<body><div class='container'><br>";
    tabla+="<div class='row'><div class='col-md-12'><h1>"+result['nom_recepta']+"</h1></div></div>";
    tabla+="<br><br><div class='row'>";
    tabla+="<div class='col-md-6'><table class='table table-dark table-striped'>";
    tabla+="<tr class='thead'><td>Ingredientes</td></tr></div>";
    tabla+="<tr><td width='60%'>"+result['ingredients']+'</td></tr>';
    tabla+="</table></div><div class='col-md-3'></div></div></div><br><br><div class='row'><div class='col-md-2'></div>";
    tabla+="<div class='row'><div class='col-md-8'><button align='center' class='btn btn-dark' onclick=window.location='/Recetas/'>Volver a la lista de recetas</button></div><div class='col-md-2'></div></div></table></div></body></html>";
    res.send(tabla);
      
    db.close();
    }));
  
  });
})


app.post('/Recetas/Filtrado/',urlencodedParser,function(req, res) {
  MongoClient.connect(url, function(err, db){
    assert.equal(null,err);
    var db = db.db("cocina");
    var filtro = req.body.filtro;
    db.collection("receptes").find({$or: [{nom_recepta:  new RegExp('.*' + filtro +'.*')}, {ingredients:  new RegExp('.*' + filtro +'.*')}]}).toArray(function(err, result) {
      if (err) throw err;
      var contenido="<html><head><link rel='stylesheet' href='https://maxcdn.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css'></head>";
      contenido+="<body><div class='container'><div class='row'><div class='col'><h1>Recetas Vegetarianas</h1></div></div><br><div class='row'>";
      contenido+="<div class='col-md-2'></div><div class='col-md-8'>";
      contenido+="<table class='table table-dark table-striped'>";
      for(var i=0; i<result.length;i++ ){
        contenido+="<tr><td width='60%'>"+result[i]['nom_recepta']+'</td></tr>';
      }
      contenido+="</table></div><div class='col-md-2'></div></div><div class='row'><div class='col-md-5'></div><div class='col-md-2'><button align='center' class='btn btn-dark' onclick=window.location='/Recetas/'>Volver al listado</button></div><div class='col-md-5'></div></div></table></div></body></html>";
      res.send(contenido);
    });
  })
});

app.get('/Recetas/Crear/',function(req, res) {
  fs.readFile('nuevaReceta.html','utf8',(err,data)=>{
    if(err){
      console.log(err);
      return err;
    }
    else {
      res.send(data);
    }
  });
});


app.post('/Recetas/Crear/',urlencodedParser,function(req, res) {
  MongoClient.connect(url, function(err, db){
    assert.equal(null,err);
    var db = db.db("cocina");
    var myObj = {nom_recepta : req.body.nom_recepta, ingredients: req.body.ingredients}
    
    //deleteOne para borrar
    db.collection("receptes").insertOne(myObj), function(err,db){
      if(err){
        console.log(err);
      }
    }
  })
  console.log('insertado');
  res.redirect('/Recetas/');
});

app.get('/Editar/:Id',function(req, res) {
  var id_actual = req.params.Id;
  MongoClient.connect(url, function(err, db){
    var dbo = db.db("cocina");
    dbo.collection("receptes").findOne({_id: new mongodb.ObjectID(id_actual) },(function(err, result) {
      if (err) throw err;
      var contenido="<html><head><link rel='stylesheet' href='https://maxcdn.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css'></head>";
      contenido+="<body><div class='container'><div class='row'><div class='col'><h1>Recetas Vegetarianas</h1></div></div><div class='row'>";
      contenido+="<div class='col-md-6'>";
    
      contenido += '<form method="POST" action="/Editar/'+id_actual+'"><br>';
      contenido += '<label>Nom: <input size=150 type="text" name="nom_recepta" value="'+result['nom_recepta']+'"><br><br>';
      contenido += '<label>Ingredients: <input size=150 type="text" name="ingredients" value="'+result['ingredients']+'"><br><br>';
      contenido += '<input class="btn btn-dark" type="submit" value="Actualitzar dades">';
      contenido += '</form></div></body></html>';
      res.send(contenido);
      })
    );
    });
});

app.post('/Editar/:Id',urlencodedParser,function(req, res) {
  var id_actual = req.params.Id;
  MongoClient.connect(url, function(err, db){
    assert.equal(null,err);
    var db = db.db("cocina");

    var nombre = req.body.nom_recepta;
    var ingredientes = req.body.ingredients;
    //deleteOne para borrar
    db.collection("receptes").updateOne({_id: new mongodb.ObjectID(id_actual)},{$set: {'nom_recepta' : nombre, 'ingredients' : ingredientes}}), function(err,db){
      if(err){
        console.log(err);
      }
    }
  })
  //console.log('actualizado');
  res.redirect('/Recetas/');
});

app.get('/Eliminar/:Id',function(req, res) {
  var id_actual = req.params.Id;
  MongoClient.connect(url, function(err, db){
    var dbo = db.db("cocina");
    dbo.collection("receptes").deleteOne({_id: new mongodb.ObjectID(id_actual) },(function(err, result) {
      if (err) throw err;
      })
    );
    });
    console.log("eliminado");
    res.redirect('/Recetas/');
});

app.use(function(req,res){
  res.sendStatus(404);
})
var server = app.listen(300,function(){
  var port = server.address().port;
  console.log('Express server listening on port %s',port)

})
