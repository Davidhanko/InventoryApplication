const db = require('../db/queries');
const {validationResult, body} = require("express-validator");
const indexController = require("./indexController");

async function genres(req, res){
    const rows = await db.getGenreIndex();
    res.render('genreIndex', { DBData: rows, title: 'Genres'});
}

async function genreInfo(req, res){
    const id = req.params.id;
    try{
    const data = await db.getAllGenreData(id);
    res.render('genre', { DBData: data});
    } catch (err){
        res.render("404", {title: "Internal Server Error 500"})
    }
}

async function genreUpdateGet(req, res){
    const id = req.params.id;
    try{
    const data = await db.getAllGenreData(id);
    res.render('genreEdit', { title: "Edit genre", DBData: data});
    } catch (err){
        res.render("404", {title: "Internal Server Error 500"})
    }
}

async function genreUpdatePost(req, res){
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const genres = await db.getGenreIndex();
        const companies = await db.getCompanyIndex();
        return res.render('gameAdd', { title: 'Add game', errors: errors.array(), genres, companies });
    }
    const id = req.params.id;
    const name = req.body.genre;
    try{
        await db.updateGenre(id, name);
        res.redirect('/genre');
    }
    catch(err){
        res.render("404", {title: "Internal Server Error 500"}
        )
    }
}

async function deleteGenre(req, res){
    const id = req.params.id;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.render('404', {title: 'WRONG PASSWORD'});
    }
    try{
        await db.deleteGenre(id);
        res.redirect('/genre');
    } catch (err){
        res.render("404", {title: "Internal Server Error 500"})
    }
}


module.exports = {
    genres,
    genreInfo,
    genreUpdateGet,
    genreUpdatePost,
    deleteGenre
}