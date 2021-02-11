const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');

const API_PORT = 3002;
const jsonParser = bodyParser.json();
const server = express();

server.use(jsonParser);

server.get('/products', (req, res) => {
  fs.readFile("./api/db/products.json", "utf8", 
  function(error, data){
      if (error) throw error; 
      res.send(data); 
  });
});


server.post('/products', (req, res) => {
  const newProduct = req.body;
  newProduct.id = Date.now();
  fs.readFile("./api/db/products.json", "utf8", 
  function(error, data) {
    if (error) throw error; 
    let productsStore = JSON.parse(data);
    const doesProductExist = productsStore.some(product => product.name === newProduct.name);
    if (doesProductExist){
      return res.status(400).send({ success: false, message: 'User already exists!' })
    }
    productsStore.push(newProduct);
    fs.writeFile("./api/db/products.json", JSON.stringify(productsStore), function(error){
      if (error) throw error;       
    });
    return res.send({ success: true })
  });
});


server.delete('/products/:id', (req, res) => {
  const productId = req.params.id;
  fs.readFile("./api/db/products.json", "utf8", 
  function(error, data){
    if (error) throw error; 
    let productsStore = JSON.parse(data);
    const updatedArray = productsStore.filter(p => p.id !== +productId);
    const deletedCount = productsStore.length - updatedArray.length;
    productsStore = updatedArray.slice();
    fs.writeFile("./api/db/products.json", JSON.stringify(productsStore), function(error){
      if (error) throw error;
    res.send({ deletedCount })
    });
  });
});


server.put('/products/:id', (req, res) => {
  const productId = +req.params.id;
  let count = 0;
  fs.readFile("./api/db/products.json", "utf8", 
  function(error, data){
    if(error) throw error; 
    let productsStore = JSON.parse(data);
    const updatedArray = productsStore.map(p => {
      if (p.id === productId) {
        count++;
        return Object.assign({}, p, req.body)
      }
      return p;
    });
    productsStore = updatedArray.slice();
    fs.writeFile("./api/db/products.json", JSON.stringify(productsStore), function(error){
      if (error) throw error;
    res.send({ updatedCount: count })
    });
  });
});

server.listen(API_PORT, () => {
  console.log(`Server is running on ${API_PORT} port`)
});



