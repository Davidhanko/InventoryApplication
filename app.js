// app.js
const express = require("express");
const app = express();
const indexRouter = require("./routes/indexRouter");
const companyRouter = require("./routes/companyRouter");
const genreRouter = require("./routes/genreRouter");
const addRouter = require("./routes/addRouter");
require("dotenv").config({path: "./dot.env"});

app.use('/public', express.static('public'));
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use('/company/', companyRouter);
app.use('/genre/', genreRouter);
app.use('/add/', addRouter);
app.use("/", indexRouter);



if(!process.env.DEV_ENV){
app.use((err, req, res, next) => {
    if (err) {
        res.render('404', { title: 'SOMETHING WENT WRONG'});
    }
    next();
});}


const PORT = process.env.PORT;
app.listen(PORT, () => console.log(`Express app listening on port ${PORT}!`));
