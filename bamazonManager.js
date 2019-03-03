//bamazonManager.js
var inquirer = require("inquirer");
var mysql = require("mysql");
var consoleTable = require("console.table");


//define the connection
var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "NightGames7",
    database: "bamazon"
});


//make connection
connection.connect(function (error) {
    if (error) throw error;
    startApplication()
});

function startApplication() {
    inquirer
        .prompt([
            {
                name: "managerOptions",
                type: "list",
                choices: ["View Products for Sale", "View Low Inventory", "Add to Inventory", "Add New Product", 'EXIT']
            }
        ]).then(
            function (result) {
                switch (result.managerOptions) {
                    case "View Products for Sale":
                        viewProducts()
                        break;
                    case "View Low Inventory":
                        viewLowInventory()
                        break;
                    case "Add to Inventory":
                        addtoInventory()
                        break;
                    case "Add New Product":
                        addNewProduct()
                        break;
                    default: 
                    connection.end();
                    process.exit();
                    
                }
            });
}


//should list every available item (item ID, name, prices, quantities)
function viewProducts() {
    connection.query("SELECT * FROM products", function (error, data) {
        if (error) throw error;

        //create display here
        console.log('\n');
        console.table(data);
        startApplication();
    });
}


function viewLowInventory() {

    //all items from inventory with count <5
    connection.query("SELECT * FROM products WHERE stock_quantity < 5", function (error, data) {
        if (error) throw error;

        console.log('\n');
        console.table(data);
        startApplication();
    });
}

function addtoInventory() {
    //display a prompt that will let the manager add more of any item currently in the store
    connection.query("SELECT * FROM products", function (error, data) {
        if (error) throw error;
        inquirer
            .prompt([
                {
                    name: "choice",
                    type: "list",
                    message: "Which product are you looking to add?",
                    choices: function () {
                        var allOptions = [];
                        for (i = 0; i < data.length; i++) {
                            allOptions.push(data[i].product_name)
                        }
                        return allOptions;
                    }
                },
                {
                    name: "number",
                    message: "How many would you like to add?"
                }
            ]).then(
                function (result) {

                    //create variables for product and quantity to add
                    var numberToAdd = parseInt(result.number)
                    var selectedItem;
                    var newId;
                    var currentStockQuantity;

                    //figure out which item was selected
                    for (i = 0; i < data.length; i++) {
                        if (result.choice === data[i].product_name) {
                            selectedItem = data[i]
                        }
                    }

                    //find the current stock of the item prior to adding to it
                    currentStockQuantity = parseInt(selectedItem.stock_quantity);

                    //figure out what our selected item ID is
                    newId = parseInt(selectedItem.item_id);

                    //update db with new stock amount
                    connection.query("UPDATE products SET ? WHERE ?",
                        [
                            {
                                stock_quantity: numberToAdd + currentStockQuantity
                            },
                            {
                                item_id: newId
                            }
                        ], function (error, data) {
                            if (error) throw error;
                            console.log("You updated the db!")
                            startApplication();
                        });
                });
    });
}

function addNewProduct() {
    //allow the manager to add a completely new product to the store.
    inquirer
        .prompt([
            {
                name: "product_name",
                message: "What is the product you wish to add?"
            },
            {
                name: "product_category",
                message: "What is the department/category of the product you wish to add?"
            },
            {
                name: "product_cost",
                message: "What is the cost of the product you wish to add?"
            },
            {
                name: "product_stock",
                message: "What stock quantity are you adding for the product?"
            }
        ]).then(function (result) {

            //convert necessary numbers from strings
            var productCost = parseFloat(result.product_cost).toFixed(2);
            var productStock = parseInt(result.product_stock);

            //add items to the db
            connection.query("INSERT INTO products SET ?",
                {
                    product_name: result.product_name,
                    department_name: result.product_category,
                    price: productCost,
                    stock_quantity: productStock
                }, function (error, data) {
                    if (error) throw error;
                    startApplication();
                });
        });
}