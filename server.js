const express = require("express");
const bodyParser = require("body-parser");
const sql = require("sqlite3").verbose();
const cors = require("cors");
const path = require("path");
const { check, validationResult } = require("express-validator");

const app = express();

app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

const db = new sql.Database("data.db", (err) => {
    if (err) throw err;
});



// const c="create table form(id integer primary key,fname,lname,mail,password)";
// db.run(c,(err)=>{
//     if (err){
//         console.log(err.message);
//     }
// })
// db.run("drop table form")





const port = process.env.PORT||5000;

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
 
function validate(password, email, fname, lname) {
    if (!password || !emailRegex.test(email) || !fname || !lname) {
        return false;
    }
    return true;
}

app.get('/', (req, res) => {
//     let s="select * from form";
// db.all(s,[],(err,rows)=>{
//     if (err) throw err.message;
//     rows.forEach(row=>{
//         console.log(row);
//         res.send(row);
//     })
// })
   //res.send(row);
    res.render("form");
});

app.post('/', [
    check('fname').notEmpty().withMessage('First name is required'),
    check('lname').notEmpty().withMessage('Last name is required'),
    check('mail').isEmail().withMessage('Invalid email address'),
    check('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long'),
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { fname, lname, mail, password } = req.body;

    if (validate(password, mail, fname, lname)) {
        // Hash the password before storing it in the database (using bcrypt, for example)

        const query = "INSERT INTO form (fname, lname, mail, password) VALUES (?, ?, ?, ?)";
        db.run(query, [fname, lname, mail, password], (err) => {
            if (err) {
                console.log(err.message);
                res.status(500).send("Internal Server Error");
            } else {
                res.send("Form submitted successfully");
            }
        });
    } else {
        res.status(400).send("Invalid form data");
    }
});

app.listen(port, () => {
    console.log(`listening to the port ${port}`);
});
