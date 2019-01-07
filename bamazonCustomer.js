var mySql = require("mysql");
var inquirer = require("inquirer");
var connection = mySql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "",
    database: "bamazon_db"
});
connection.connect((err) => {
    if (err) throw err;
    start();
});

function start() {
    connection.query("SELECT * FROM products", (err, response, fields) => {
        if (err) throw err;
        for (var i = 0; i < response.length; i++) {
            console.log("ID: " + response[i].product_id + "- " + response[i].product_name);
            };

        console.log(" ");
        inquirer.prompt([
            {
            type: "input",
            name: "productID",
            message: "What is the id of the product you would like to buy?",
            validate: function(value){
                if(isNaN(value) == false && parseInt(value) <= response.length && parseInt(value) > 0){
                    return true;
                  } else{
                    return false;
                  }
            }
        },
        {
            type: "input",
            name: "unitsRequested",
            message: "How many units of this product would you like to buy?",
            validate: function(value){
                if(isNaN(value)){
                  return false;
                } else{
                  return true;
                }
              }
        }
        ]).then(function(answer){
            var whatToBuy = (answer.productID);
            var howMuchToBuy = (answer.unitsRequested);
            
            var grandTotal = ((response[whatToBuy].price)*howMuchToBuy);
            
            // check if quantity is sufficient
            if(response[whatToBuy].stock_quantity >= howMuchToBuy){
              //after purchase, updates quantity in Products
              connection.query("UPDATE products SET ? WHERE ?", [
              {stock_quantity: (response[whatToBuy].stock_quantity - howMuchToBuy)},
              {product_id: response[whatToBuy].product_id}
              ], function(err, response){
                  if(err) throw err;
                  console.log("\nSuccess! Your total is $" + grandTotal + ". Your item(s) will be shipped to you in 2 days.\n");
               reprompt();
            });

            } else {
                console.log("Sorry, there's not enough in stock!");
            }

            
        })
   
})
}

var reprompt = function(){
    inquirer.prompt([{
      type: "list",
      name: "reply",
      message: "Would you like to purchase another item?\n",
      choices: ["Y", "N"]
    }]).then(function(ans){
      if(ans.reply==="Y"){
        start();
      } else{
        console.log("Goodbye!");
        connection.end();
      }
      
    });
  }

