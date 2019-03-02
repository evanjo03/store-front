//db name bamazon
//table name products
//node application


var inquirer = require("inquirer");
var mysql = require("mysql");
var consoleTable = require("console.table");


var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "NightGames7",
    database: "bamazon"
});


connection.connect(function (error) {
    if (error) throw error;
    start()
});

function start() {
    connection.query("SELECT * FROM products", function (error, data) {
        if (error) throw error;

        //display data here - how do we want to do this?
        console.table(data);
        inquirer
            .prompt([
                {
                    name: "prodId",
                    message: "What is the ID of the product you wish to buy?"
                },
                {
                    name: "prodQuant",
                    message: "How many do you wish to buy?"
                }
            ]).then(function (result) {
                //create a varible to lock down which product was chosen
                var chosenProduct;

                //changing our prompt data to numbers
                var inqId = parseInt(result.prodId);
                var inqQuant = parseInt(result.prodQuant);

                console.log(parseInt(data[0].item_id));
                for (i = 0; i < data.length; i++) {
                    if (inqId === parseInt(data[i].item_id)) {
                        chosenProduct = data[i];
                    }
                }

                // if there is enough stock to support the purchase
                if (chosenProduct.stock_quantity >= inqQuant) {

                    //setting variable we will use to update stock in db
                    var newStock = chosenProduct.stock_quantity - inqQuant;

                    //setting variable for customer's purchase cost/product sale
                    var totalCost = inqQuant * chosenProduct.price;

                    //update stock amount db
                    connection.query("UPDATE products SET ? WHERE ?",
                        [
                            {
                                stock_quantity: newStock,
                                product_sales: totalCost
                            },
                            {
                                item_id: chosenProduct.item_id
                            }
                        ], function (error) {
                            if (error) throw error;
                            //show the customer the total purchase cost
                            console.log(`Your total purchase was $${totalCost.toFixed(2)}`)
                            start();
                        });
                } else {
                    console.log("Insufficient quantity!");
                    start();
                }
            });
    });
}


