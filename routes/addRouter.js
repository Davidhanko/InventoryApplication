const express = require('express');
const addRouter = express.Router();
const { body } = require('express-validator');
const addController = require('../controllers/addController');
const { checkCompanyExist, countryList, checkCompanyExistByID, checkGenreExistByID} = require('../data/existValidation');

addRouter.get('/', addController.addIndex);
addRouter.get('/company', addController.addCompany);
addRouter.get('/genre/', addController.addGenre);
addRouter.get('/game', addController.addGame);

addRouter.post('/company',
    body('name').isLength({ min: 2 }).trim().escape().withMessage('Name must have 2 characters at minimum.')
        .custom(async (value) => {
            const companyExist = await checkCompanyExist(value);
            if (companyExist) {
                return Promise.reject('Company already exists.');
            }
            }),
    body('country').trim().escape().isIn(countryList).withMessage('Invalid country selected.'),
    addController.addCompanyPost
);

addRouter.post('/genre',
    body('genres').isLength({ min: 2 }).trim().escape().withMessage('Name must have 2 characters at minimum.'),
    addController.addGenrePost
);

addRouter.post('/game',
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
    addController.addGamePost);






module.exports = addRouter;