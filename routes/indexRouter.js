const { Router } = require('express');
const indexController = require('../controllers/indexController');
const {body} = require("express-validator");
const {checkCompanyExistByID, checkGenreExistByID} = require("../data/existValidation");
const indexRouter = Router();

indexRouter.get(['/', '/games'], indexController.index)

indexRouter.get('/game/:id', indexController.game)

indexRouter.get('/game/edit/:id', indexController.editGameGet)

indexRouter.post('/game/edit/:id',
    body('name').isLength({ min: 2 }).trim().escape().withMessage('Name must have 2 characters at minimum.'),
    body('price').trim().escape().isNumeric().withMessage('Price must be a number.'),
    body('companies').trim().escape().custom(async (value) => {
        const companyExist = await checkCompanyExistByID(value);
        if (!companyExist) {
            return Promise.reject('Company does not exist.');
        }
    }),
    body('genres').trim().escape().custom(async (value) => {
        const data = await checkGenreExistByID(value);
        if (!data) {
            return Promise.reject('Invalid genre selected.');
        }}),
    indexController.editGamePost)


indexRouter.post('/game/delete/:id', body('password').equals('delete').isLength({ min: 1 }).trim().escape().withMessage('Password invalid.'),
    indexController.deleteGame)

indexRouter.get('*', (req, res) => {
    res.render('404', { title: '404 - Page not found'});
})

module.exports = indexRouter;
