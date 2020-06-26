const ticket = require('../controllers/ticket/lib.js');
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

const config = require('../config/config');

const authenticateJWT = (req, res, next) => {
    const token = req.session.token;

    if (token) {
        jwt.verify(token, config.secret, (err, user) => {
            if (err) {
                return res
                    .status(200)
                    .render('account/login', { title: 'Login' });
            }

            req.user = user;
            next();
        });
    } else {
        res.status(200).render('account/login', { title: 'Login' });
    }
};

const authenticateAdmin = (req, res, next) => {
    if (req.user.isAdmin === true) {
        console.log(true);
        next();
    } else {
        console.log('auth admin %s', req.user.isAdmin);
        res.status(200).render('account/login', { title: 'Login' });
    }
};

const authoriseEdit = (req, res, next) => {
    let userIsCreator = ticket.validateCreator(req, res, next);

    userIsCreator
        .then((permission) => {
            console.log('permission is', permission);
            if (!permission && req.user.isAdmin !== true) {
                console.log('auth admin %s', req.user.isAdmin);
                res.status(200).render('account/login', { title: 'Login' });
            } else {
                next();
            }
        })
        .catch((err) => {
            res.json(err);
        });
};

router.get('/create', authenticateJWT, ticket.createForm);
router.post('/create', authenticateJWT, ticket.create);
router.get('/notassigned', authenticateJWT, ticket.showNotAssigned);
router.get('/:id', authenticateJWT, ticket.show);
router.post('/:id', authenticateJWT, ticket.addComment);
router.get('/:id/edit', [authenticateJWT, authoriseEdit], ticket.edit);
router.post('/:id/update', authenticateJWT, ticket.update);
router.get('/', authenticateJWT, ticket.list);

module.exports = router;
