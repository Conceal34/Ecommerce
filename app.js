import express, { query } from "express";
import bodyParser from "body-parser";
import pg from "pg";
import session from "express-session";
import passport from "passport";
import { Strategy } from "passport-local";
import env from "dotenv";
import fs from "fs";

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

env.config();

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24
    }
}))

app.use(passport.initialize());
app.use(passport.session());

const db = new pg.Client({
    user: "postgres",
    host: process.env.DBHOST,
    database: process.env.DB,
    password: process.env.DBPASS,
    port: process.env.DBPORT
})
db.connect();


let cart = [];
let subTotal = 0;
let total = 0;
let clientUser = {};

app.get("/", (req, res) => {
    res.render("index.ejs", {});
})

app.get("/log-in", (req, res) => {
    res.render("sign-login.ejs", {});
})

app.post("/log-in", passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "log-in"
}))

app.post("/logout", (req, res) => {
    req.logOut((err) => {
        if (err) { console.log(err) }
        res.redirect("/");
    })
})

app.post("/sign-up", async (req, res) => {
    const fName = req.body.first_name;
    const lName = req.body.last_name;
    const email = req.body.email;
    const pass = req.body.password;

    try {
        const checkUser = await db.query(`SELECT * from users where email = '${email}'`);
        if (checkUser.rows.length > 0) {
            res.send("email already exists!! Try logging in.")
        } else {
            const result = await db.query(
                `insert into users (first_name, last_name, email, pass) 
            values ('${fName}', '${lName}', '${email}', '${pass}') RETURNING *;`
            );
            const user = result.rows[0];
            req.login(user, (err) => {
                if (err) { console.log(err) }
                res.redirect("/");
            });
        }
    } catch (err) {
        console.log(err);
    }
})

app.get("/account", (req, res) => {
    if (req.isAuthenticated()) {
        let userFullName = req.user.first_name + " " + req.user.last_name;
        let email = req.user.email;
        let contact = req.user.phone;
        let address = req.user.city + ", " + req.user.stat + " (" + req.user.pin_code + ")";
        if (req.user.phone == null) {
            contact = "Not Provided";
        }
        if (req.user.city == null) {
            address = "Not Provided";
        }
        res.render("accn.ejs", { nameOfUser: userFullName, email: email, contact: contact, address: address });
    } else {
        res.redirect("/log-in");
    }
})

app.get("/category", async (req, res) => {
    try {
        const products = await db.query("select name, price, path from products;");
        // products.rows  
        (products.rows).forEach(product => {
            const img = fs.readdirSync(product.path)[0];
            product.path = (product.path + "/" + img).slice(8);
        })
        res.render("category.ejs", { products: products.rows });
    } catch (e) {
        console.log(e);
    }
})

app.get("/Living", async (req, res) => {
    try {
        const products = await db.query(`select name, price, path from products where category = 'Living';`);
        // products.rows  
        (products.rows).forEach(product => {
            const img = fs.readdirSync(product.path)[0];
            product.path = (product.path + "/" + img).slice(8);
        })
        res.render("category.ejs", { products: products.rows });
    } catch (e) {
        console.log(e);
    }
})

app.get("/Dining", async (req, res) => {
    try {
        const products = await db.query(`select name, price, path from products where category = 'Dining';`);
        // products.rows  
        (products.rows).forEach(product => {
            const img = fs.readdirSync(product.path)[0];
            product.path = (product.path + "/" + img).slice(8);
        })
        res.render("category.ejs", { products: products.rows });
    } catch (e) {
        console.log(e);
    }
})

app.get("/Outdoor", async (req, res) => {
    try {
        const products = await db.query(`select name, price, path from products where category = 'Outdoor';`);
        // products.rows  
        (products.rows).forEach(product => {
            const img = fs.readdirSync(product.path)[0];
            product.path = (product.path + "/" + img).slice(8);
        })
        res.render("category.ejs", { products: products.rows });
    } catch (e) {
        console.log(e);
    }
})


app.post("/category/:product_name", (req, res) => {
    const product_name = req.params.product_name;
    res.redirect(`/product/:${product_name}`);
})

app.get("/product/:product_name", async (req, res) => {
    try {
        const product_name = (req.params.product_name).slice(2);
        const product = await db.query(`select * from products where name = '${product_name}'`)
        const imgs = fs.readdirSync(product.rows[0].path);
        const imgsPath = (product.rows[0].path).slice(8);
        res.render("product.ejs", { product: product.rows[0], imgsPath: imgsPath, imgs: imgs });
    } catch (error) {
        conso.log(error);
    }
})

app.post("/product", (req, res) => {
    // pushing product id as pid and qty 
    if (cart.length != 0) {
        cart.forEach(cartItem => {
            if (req.body.pid == cartItem.pid) {
                cartItem.qty = Number(cartItem.qty) + Number(req.body.qty);
                cartItem.qty = String(cartItem.qty);
            } else {
                cart.push(req.body);
            }
        })
    } else {
        cart.push(req.body);
    }
    res.redirect("/cart");
})

app.get("/cart", async (req, res) => {
    try {
        console.log(cart);
        let cartPids = [];
        cart.forEach(product => {
            cartPids.push(product.pid);
        })
        cartPids = cartPids.join(",");
        let productInfo = [];
        if (cartPids.length != 0) {
            productInfo = await db.query(`select id, name, price, path from products where id in (${cartPids});`);
            (productInfo.rows).forEach(product => {
                const img = fs.readdirSync(product.path)[0];
                product.path = (product.path).slice(8) + "/" + img;
            })
        }
        res.render("cart.ejs", { cartProducts: productInfo.rows, cart: cart });
    } catch (e) {
        console.log(e)
    };
})

app.post("/cart", (req, res) => {
    subTotal = req.body.subTotal;
    res.redirect("/checkout");
})

app.get("/checkout", async (req, res) => {
    if (req.isAuthenticated()) {
        const items = cart.length;
        total = Number(subTotal) + (subTotal * 0.2)
        clientUser = {
            fname: (req.user.first_name != null) ? req.user.first_name : "",
            lname: (req.user.last_name != null) ? req.user.last_name : "",
            aptt: (req.user.apartment != null) ? req.user.apartment : "",
            city: (req.user.city != null) ? req.user.city : "",
            state: (req.user.stat != null) ? req.user.stat : "",
            pinCode: (req.user.pin_ode != null) ? req.user.pin_ode : "",
            phNum: (req.user.phone != null) ? req.user.phone : ""
        }
        res.render("checkout.ejs", { user: clientUser, subTotal: subTotal, items: items, tax: subTotal * 0.2, total: total });
    } else {
        res.redirect("/log-in");
    }
})

app.post("/checkout", async (req, res) => {
    try {
        const userId = req.user.id;
        // update the user table
        clientUser = {
            fname: req.body.fName,
            lname: req.body.lName,
            aptt: req.body.aptt,
            city: req.body.city,
            state: req.body.state,
            pinCode: req.body.pinCode,
            phNum: req.body.phNum
        }
        const updateUser = await db.query(`update users 
            set first_name = '${clientUser.fname}',
            last_name = '${clientUser.lname}',
            appartment = '${clientUser.aptt}',
            city = '${clientUser.city}',
            stat = '${clientUser.state}',
            pin_code = ${Number(clientUser.pinCode)},
            phone = ${Number(clientUser.phNum)}
            where id = ${userId};`
        );
        // add to order table
        cart.forEach(async (item) => {
            await db.query(`insert into orders 
                (user_id, product_id, qty, amount)
                values (${userId}, ${item.pid}, ${item.qty}, ${total});`
            );
        })
    } catch (e) { console.log(e) };
    res.redirect("/");
})

app.post("/newsletter", async (req, res) => {
    // enter this to the table
    try {
        const email = req.body.newsletter;
        await db.query(`insert into newsletter (email) values ('${email}');`);
    } catch (err) {
        console.log(err);
    }
})

passport.use(new Strategy(async function verify(username, password, cb) {
    const email = username;
    try {
        const checkUser = await db.query(`SELECT * from users where email = '${email}'`);
        if (checkUser.rows.length > 0) {
            const user = checkUser.rows[0];
            const storedPass = user.pass;

            if (password == storedPass) {
                return cb(null, user);
            } else {
                return cb(null, false);
            }
        } else {
            return cb("User not found");
        }
    } catch (err) {
        return cb(err);
    }
}))

passport.serializeUser((user, cb) => {
    cb(null, user);
})
passport.deserializeUser((user, cb) => {
    cb(null, user);
})


app.listen(port, () => {
    console.log(`server running on port: ${port}`);
})


// correct the cart qty glitch add and remove
// cart - product qty is not updating from cart page