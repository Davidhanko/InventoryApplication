const { Router } = require('express');
const genreController = require('../controllers/genreController');
const {body} = require("express-validator");
const genreRouter = Router();

genreRouter.get('/', genreController.genres)

genreRouter.get('/:id', genreController.genreInfo)

genreRouter.get('/edit/:id', genreController.genreUpdateGet)

genreRouter.post('/edit/:id',
    body('genre').isLength({ min: 2 }).trim().escape().withMessage('Name must have 2 characters at minimum.'),
    genreController.genreUpdatePost)

genreRouter.post('/delete/:id', body('password').equals('delete').isLength({ min: 1 }).trim().escape().withMessage('Password invalid.'),
    genreController.deleteGenre)


module.exports = genreRouter;