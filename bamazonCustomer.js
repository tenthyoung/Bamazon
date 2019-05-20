"use strict";

var mysql = require("mysql");
var inquirer = require("inquirer");

var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "root",
    database: "bamazon"
});

connection.connect(function (err) {
    if (err) throw err;
    display();
});

function display() {
    connection.query("SELECT id, product_name, price FROM products", function (err, res) {
        if (err) throw err;

        console.table(res)

        promptUserForDesiredPurchaseByID();
        // connection.end();
    });
}

function promptUserForDesiredPurchaseByID() {
    inquirer
        .prompt({
            name: "chooseID",
            type: "number",
            message: "Enter the ID of the item you would like to purchase:",
        })
        .then(function (answer) {
            // based on their answer, either call the bid or the post functions
            if (answer.chooseID >= 1 && answer.chooseID <= 10) {
                askUserForHowManyUnitsTheyWouldLIkeToBuy(answer.chooseID);
            } else {
                console.log('Sorry, we do not have such a product ID in our system.')
                promptUserForDesiredPurchaseByID();
            }
        });
}

function askUserForHowManyUnitsTheyWouldLIkeToBuy(product_id) {
    connection.query("SELECT id, product_name, price, stock_quantity FROM products", function (err, res) {
        if (err) throw err;

        console.log(res[product_id - 1].product_name)

        inquirer
            .prompt({
                name: "quantity",
                type: "number",
                message: `How many ${res[product_id - 1].product_name}(s) would you like to buy?`,
            })
            .then(function (answer) {
                // based on their answer, either call the bid or the post functions
                if (answer.quantity > 0 && answer.quantity < res[product_id - 1].stock_quantity) {
                    let currentStock = res[product_id - 1].stock_quantity - answer.quantity;
                    console.log('hi')

                    connection.query(
                        "UPDATE auctions SET ? WHERE ?",
                        [
                          {
                            stock_quantity: currentStock
                          },
                          {
                            id: product_id
                          }
                        ],
                        function(error) {
                          if (error) throw err;
                          console.log(`Charge: ${answer.quantity*res[product_id - 1].price}`);

                        }
                      );
                    
                } else {
                    console.log('Insufficient quantity!')
                    askUserForHowManyUnitsTheyWouldLIkeToBuy();

                }
            });

        connection.end();
    });


}