const { Router } = require('express');
const companyController = require('../controllers/companyController');
const {body} = require("express-validator");
const {checkCompanyExist, countryList} = require("../data/existValidation");
const companyRouter = Router();

companyRouter.get('/', companyController.companies)

companyRouter.get('/:id', companyController.companyInfo)

companyRouter.get('/edit/:id', companyController.companyEditGet)

companyRouter.post('/edit/:id',
    body('name').isLength({ min: 2 }).trim().escape().withMessage('Name must have 2 characters at minimum.')
        .custom(async (value) => {
            const companyExist = await checkCompanyExist(value);
            if (companyExist) {
                return Promise.reject('Company already exists.');
            }
        }),
    body('country').trim().escape().isIn(countryList).withMessage('Invalid country selected.'),
    companyController.companyEditPost)

companyRouter.post('/delete/:id', body('password').equals('delete').isLength({ min: 1 }).trim().escape().withMessage('Password invalid.'),
    companyController.deleteCompany)


module.exports = companyRouter;