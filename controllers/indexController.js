const db = require('../db/queries');
const {validationResult} = require("express-validator");

async function index(req, res){
    const rows = await db.getGamesIndex();
    res.render('index', { dbData: rows, title: 'Games'});
}

async function game(req, res){
    const id = req.params.id;
    try{
    const data = await db.getAllDataOnGame(id);
    res.render('game', { DBData: data});
    } catch (err){
        res.render("404", {title: "Internal Server Error 500"})
    }
}

async function editGameGet(req, res){
    const id = req.params.id;
    try{
    const gameData = await db.getAllDataOnGame(id);
    const companies = await db.getCompanyIndex();
    const genres = await db.getGenreIndex();
    res.render('gameEdit', { gameData, companies, genres});
    } catch (err){
        res.render("404", {title: "Internal Server Error 500"})
    }
}

async function editGamePost(req, res){
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const gameData = await db.getAllDataOnGame(id);
        const companies = await db.getCompanyIndex();
        const genres = await db.getGenreIndex();
        return res.render('gameEdit', { gameData, companies, genres, errors: errors.array()});
    }
    const {name, price, companies, genres} = req.body;
    const id = req.params.id;
    try{
    await db.updateGame(id, name, price, companies, genres);
    res.redirect('../' + id);
    } catch (err){
        res.render("404", {title: "Internal Server Error 500"})
    }
}

async function deleteGame(req, res){
    const id = req.params.id;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.render('404', {title: 'WRONG PASSWORD'});
    }
    try{
    await db.deleteGame(id);
    res.redirect('/');
    } catch (err){
        res.render("404", {title: "Internal Server Error 500"})
    }
}



module.exports = {
    index,
    game,
    editGameGet,
    editGamePost,
    deleteGame
}