const Ticket = require('../../schema/schemaTicket.js');
const User = require('../../schema/schemaUser');

function create(req, res) {
    if (!req.body.title || !req.body.description || !req.body.priority) {
        res.status(400).json({
            text: 'Invalid request',
        });
    } else {
        var ticket = {
            createdBy: req.user.email,
            title: req.body.title,
            description: req.body.description,
            responsible: req.body.responsible,
            priority: req.body.priority,
        };

        var _t = new Ticket(ticket);
        _t.save(function (err, ticket) {
            if (err) {
                res.status(500).json({
                    text: 'Internal error',
                });
            } else {
                res.redirect(`${ticket.getId()}`);
            }
        });
    }
}

function createForm(req, res) {
    res.status(200).render('ticket/create', { title: 'Create ticket' });
}

function show(req, res) {
    if (!req.params.id) {
        res.status(400).json({
            text: 'Invalid request',
        });
    } else {
        var findTicket = new Promise(function (resolve, reject) {
            Ticket.findById(req.params.id, function (err, result) {
                if (err) {
                    reject(500);
                } else {
                    if (result) {
                        resolve(result);
                    } else {
                        reject(200);
                    }
                }
            });
        });

        findTicket.then(
            function (ticket) {
                let showEditLink = false;
                if (ticket.createdBy === req.user.email || req.user.isAdmin === true) {
                    showEditLink = true;
                }
                res.status(200).render('ticket/show', {
                    title: `Ticket #${ticket._id}`,
                    ticket,
                    showEditLink,
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
                            text: 'The ticket does not exist',
                        });
                        break;
                    default:
                        res.status(500).json({
                            text: 'Internal error',
                        });
                }
            }
        );
    }
}

function edit(req, res) {
    if (!req.params.id) {
        res.status(400).json({
            text: 'Invalid request',
        });
    } else {
        var findTicket = new Promise(function (resolve, reject) {
            Ticket.findById(req.params.id, function (err, result) {
                if (err) {
                    reject(500);
                } else {
                    if (result) {
                        resolve(result);
                    } else {
                        reject(200);
                    }
                }
            });
        });

        let userEmails = new Promise(function (resolve, reject) {
            User.find({}, function (err, users) {
                if (err) {
                    reject(500);
                } else {
                    let userEmails = [];
                    users.forEach((user) => {
                        userEmails.push(user.email);
                    });
                    console.log('user emails are', userEmails);
                    resolve(userEmails);
                }
            });
        });

        Promise.all([findTicket, userEmails]).then(
            (values) => {
                let ticket = values[0];
                let userEmails = values[1];

                if (ticket.assignedTo !== undefined) {
                    let removeEmail = userEmails.indexOf(ticket.assignedTo);
                    userEmails.splice(removeEmail, 1);
                }

                res.status(200).render('ticket/edit', {
                    title: `Edit ticket #${ticket._id}`,
                    ticket,
                    userEmails,
                    isAdmin: req.user.isAdmin,
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
                            text: 'The ticket does not exist',
                        });
                        break;
                    default:
                        res.status(500).json({
                            text: 'Internal error',
                        });
                }
            }
        );
    }
}

function validateCreator(req, res, next) {
    let ticketCreator = new Promise(function (resolve, reject) {
        Ticket.findById(req.params.id, function (err, ticket) {
            if (err) {
                reject(500);
            } else {
                let createdBy = ticket.createdBy;
                console.log('validateCreator createdBy', createdBy);
                resolve(createdBy);
            }
        });
    });

    return ticketCreator
        .then((createdBy) => {
            if (createdBy === req.user.email) {
                return true;
            } else {
                return false;
            }
        })
        .catch((err) => {
            next(err);
        });
}

function update(req, res) {
    console.log(req.body);

    if (!req.params.id || !req.body.description || !req.body.priority) {
        res.status(400).json({
            text: 'Fields missing',
        });
    } else {
        var findTicket = new Promise(function (resolve, reject) {
            req.body.completed =
                typeof req.body.completed !== 'undefined' ? true : false;

            Ticket.findByIdAndUpdate(req.params.id, req.body, function (
                err,
                result
            ) {
                if (err) {
                    reject(500);
                } else {
                    if (result) {
                        resolve(result);
                    } else {
                        reject(200);
                    }
                }
            });
        });

        findTicket.then(
            function (ticket) {
                res.redirect(`../${ticket.getId()}`);
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
                            text: 'The ticket does not exist',
                        });
                        break;
                    default:
                        res.status(500).json({
                            text: 'Internal error',
                        });
                }
            }
        );
    }
}

function list(req, res) {
    var findTicket = new Promise(function (resolve, reject) {
        Ticket.find({}, function (err, tickets) {
            if (err) {
                reject(500);
            } else {
                if (tickets) {
                    resolve(tickets);
                } else {
                    reject(200);
                }
            }
        });
    });

    findTicket.then(
        function (tickets) {
            res.status(200).render('ticket/index', {
                title: 'List of tickets',
                tickets,
                isAdmin: req.user.isAdmin,
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
                        text: 'Ticket does not exist yet',
                    });
                    break;
                default:
                    res.status(500).json({
                        text: 'Internal error',
                    });
            }
        }
    );
}

function showNotAssigned(req, res) {
    var findTicket = new Promise(function (resolve, reject) {
        Ticket.find({ assigned: false }, function (err, tickets) {
            if (err) {
                reject(err);
            } else {
                if (tickets) {
                    resolve(tickets);
                } else {
                    reject(200);
                }
            }
        });
    });

    findTicket.then(
        function (tickets) {
             res.status(200).render('ticket/notassigned', {
                title: 'unassigned tickets',
                tickets,
            }); 
            //res.json(tickets);
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
                        text: 'Ticket does not exist yet',
                    });
                    break;
                default:
                    res.status(500).json({
                        text: 'Internal error',
                    });
            }
        }
    );
}

function addComment(req, res) {
    Ticket.update(
        { _id: req.params.id },
        {
            $push: {
                comments: {
                    userName: req.user.email,
                    comment: req.body.comment,
                },
            },
        },
        function (err, result) {
            show(req, res);
        }
    );
}

exports.create = create;
exports.createForm = createForm;
exports.show = show;
exports.edit = edit;
exports.update = update;
exports.list = list;
exports.showNotAssigned = showNotAssigned;
exports.addComment = addComment;
exports.validateCreator = validateCreator;
