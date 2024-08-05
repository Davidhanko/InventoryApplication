const db = require('../db/queries');
const {validationResult} = require("express-validator");

async function companies(req, res){
    const rows = await db.getCompanyIndex();
    res.render('companyIndex', { DBData: rows, title: 'Companies'});
}

async function companyInfo(req, res){
    const id = req.params.id;
    try{
        const data = await db.getAllCompanyData(id);
        res.render('company', { DBData: data});
    } catch (err){
        res.render("404", {title: "Internal Server Error 500"})
    }
}

async function companyEditGet(req, res){
    const id = req.params.id;
    try{
        const data = await db.getAllCompanyData(id);
        res.render('companyEdit', { title: "Edit", DBData: data});
    } catch (err){
        res.render("404", {title: "Internal Server Error 500"})
    }}

async function companyEditPost(req, res){
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const genres = await db.getGenreIndex();
        const companies = await db.getCompanyIndex();
        return res.render('gameAdd', { title: 'Add game', errors: errors.array(), genres, companies });
    }
    const id = req.params.id;
    const {name, country} = req.body;
    try{
        await db.updateCompany(id, name, country);
        res.redirect(`/company/${id}`);
    } catch (err){
        res.render("404", {title: "Internal Server Error 500"})
    }
}

async function deleteCompany(req, res){
    const id = req.params.id;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.render('404', {title: 'WRONG PASSWORD'});
    }
    try{
        await db.deleteCompany(id);
        res.redirect('/company');
    } catch (err){
        res.render("404", {title: "Internal Server Error 500"})
    }
}

module.exports = {
    companies,
    companyInfo,
    companyEditGet,
    companyEditPost,
    deleteCompany
}