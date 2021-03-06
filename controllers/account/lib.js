const User = require('../../schema/schemaUser.js');
const bcrypt = require('bcrypt');
const saltRounds = 10;

function signup(req, res) {
    if (!req.body.email || !req.body.password) {
        //Le cas où l'email ou bien le password ne serait pas soumit ou nul
        console.log(req.body);
        res.status(400).json({
            text: 'Invalid request',
        });
    } else {
        bcrypt.hash(req.body.password, saltRounds, function (err, hash) {
            var user = {
                email: req.body.email,
                password: hash,
            };
            var findUser = new Promise(function (resolve, reject) {
                User.findOne(
                    {
                        email: user.email,
                    },
                    function (err, result) {
                        if (err) {
                            reject(500);
                        } else {
                            if (result) {
                                reject(200);
                            } else {
                                resolve(true);
                            }
                        }
                    }
                );
            });

            findUser.then(
                function () {
                    var _u = new User(user);
                    _u.save(function (err, user) {
                        if (err) {
                            res.status(500).json({
                                text: 'Internal error',
                            });
                        } else {
                            req.session.token = user.getToken();
                            res.redirect('../../ticket/');
                        }
                    });
                },

                function (error) {
                    switch (error) {
                        case 500:
                            res.status(500).json({
                                text: 'Internal error',
                            });
                            break;
                        case 200:
                            res.status(200).json({
                                text: "L'adresse email existe déjà",
                            });
                            break;
                        default:
                            res.status(500).json({
                                text: 'Internal error',
                            });
                    }
                }
            );
        });
    }
}

function signupForm(req, res) {
    res.status(200).render('account/signup', { title: 'Inscription' });
}

function login(req, res) {
    if (!req.body.email || !req.body.password) {
        //Le cas où l'email ou bien le password ne serait pas soumit ou nul
        res.status(400).json({
            text: 'Invalid request',
        });
    } else {
        User.findOne(
            {
                email: req.body.email,
            },
            function (err, user) {
                if (err) {
                    res.status(500).json({
                        text: 'Internal error',
                    });
                } else if (!user) {
                    res.status(401).json({
                        text: "L'utilisateur n'existe pas",
                    });
                } else {
                    bcrypt.compare(req.body.password, user.password, async function (
                        err,
                        passwordsMatch
                    ) {
                        if (err) throw err;

                        if (passwordsMatch === true) {
                            req.session.token = await user.getToken();
                            res.redirect('../../ticket/');
                        } else {
                            res.status(401).json({
                                text: 'Incorrect password',
                            });
                        }
                    });
                }
            }
        );
    }
}

function loginForm(req, res) {
    res.status(200).render('account/login', { title: 'Login' });
}

function signout(req, res) {
    delete req.session.token;
    res.redirect('login');
}

exports.login = login;
exports.loginForm = loginForm;
exports.signup = signup;
exports.signupForm = signupForm;
exports.signout = signout;
