const db = require('../db/queries');
const { validationResult } = require('express-validator');
const { checkGenreExist } = require('../data/existValidation');

async function addIndex(req, res){
    res.render('indexAdd', { title: 'Choose what to add'});
}

async function addCompany(req, res){
    res.render('companyAdd', { title: 'Add company'});
}

async function addGenre(req, res){
    res.render('genreAdd', { title: 'Add genre'});
}

async function addGame(req, res){
    try{
        const genres = await db.getGenreIndex();
        const companies = await db.getCompanyIndex();
        res.render('gameAdd', { title: 'Add game', genres, companies });
    } catch (err){
        res.render("404", {title: "Internal Server Error 500"})
    }
}

async function addCompanyPost(req, res){
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.render('companyAdd', { title: 'Add company', errors: errors.array() });
    }
    const {name, country} = req.body;
    try{
    await db.addCompany(name, country);
    res.redirect('../company');
    } catch (err){
        res.render("404", {title: "Internal Server Error 500"})
    }
}

async function addGenrePost(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.render('genreAdd', {title: 'Add genre', errors: errors.array()});
    }
    const genres = req.body.genres.split(',');
    genres.map(genre => genre.trim());
    const editedGenres = genres.map(genre => {
        const words = genre.split(' ');
        return words.map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
    });
    try {
        const data = await checkGenreExist(editedGenres);

        await db.addGenre(data);
        res.redirect('../genre');
    }
    catch (err) {
        res.render("404", {title: "Internal Server Error 500"})
    }
}

async function addGamePost(req, res){
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const genres = await db.getGenreIndex();
            const companies = await db.getCompanyIndex();
            return res.render('gameAdd', { title: 'Add game', errors: errors.array(), genres, companies });
        }
        const {name, price, companies, genres} = req.body;
        try{
            const GAMEID = await db.addGame(name, price, companies, genres);
            res.redirect('../game/' + GAMEID);
        } catch (err){
            res.render("404", {title: "Internal Server Error 500"})
        }
}

module.exports = {
    addIndex,
    addCompany,
    addGenre,
    addGame,
    addCompanyPost,
    addGenrePost,
    addGamePost
}