//DB bamazon
// products:
//        item_id
//        product_name
//        department_name
//        price
//       stock_quantity
//       product_sales

//   departments:
//     department_id
//       department_name
//       over_head_costs

var mysql = require("mysql");
var inquirer = require("inquirer");
var consoleTable = require("console.table");

//define connection variable
var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "NightGames7",
    database: "bamazon"
});

//connect and start application

connection.connect(function (error) {
    if (error) throw error;
    startApplication();
});

function startApplication() {

    //manager has two options
    inquirer
        .prompt([
            {
                name: "options",
                type: "list",
                choices: ["View Product Sales by Department", "Create New Department", 'EXIT']
            }
        ]).then(function (result) {
            switch (result.options) {
                case "View Product Sales by Department":
                    viewProductSales();
                    break;
                case "Create New Department":
                    createNewDepartment();
                    break;
                default:
                    connection.end();
                    process.exit();
            }
        });
}

//shows table with headings: department_id, department_name, over_head_costs, product_sales, total_profit

function viewProductSales() {
    //gonna have to test this query
    var query = "SELECT departments.department_id, departments.department_name, departments.over_head_costs,SUM(products.product_sales) AS product_sales, products.product_sales - departments.over_head_costs AS total_profit FROM products INNER JOIN departments ON departments.department_name = products.department_name GROUP BY department_id;"
    
    connection.query(query,
        function (error, data) {
            console.log("\n");
            console.table(data)
        });
}
//

function createNewDepartment() {
    inquirer
        .prompt([
            {
                name: "name",
                message: "What is the department name?"
            },
            {
                name: "overhead",
                message: "What are the associated overhead costs?"
            }
        ]).then(function (result) {
            //add our results into the database
            connection.query("INSERT INTO departments SET ?",
                {
                    department_name: result.name,
                    over_head_costs: result.overhead
                },
                function (error, data) {
                    if (error) throw error;
                    console.log("You added to the DB!");
                })
        });
};
