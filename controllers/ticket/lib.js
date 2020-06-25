const Ticket = require('../../schema/schemaTicket.js');
const User = require('../../schema/schemaUser');

function create(req, res) {
	if (!req.body.title || !req.body.description || !req.body.priority) {
		res.status(400).json({
			"text": "Invalid request"
		})
	} else {
		var ticket = {
            createdBy: req.user.id,
			title: req.body.title,
			description: req.body.description,
			responsible: req.body.responsible,
			priority: req.body.priority
		}

		var _t = new Ticket(ticket);
		_t.save(function (err, ticket) {
			if (err) {
				res.status(500).json({
					"text": "Internal error"
				})
			} else {
				res.redirect(`${ticket.getId()}`);
			}
		})
	}
}

function createForm(req, res) {
	res.status(200).render('ticket/create', {title: 'Créer ticket'});
}

function show(req, res) {
	if (!req.params.id) {
		res.status(400).json({
			"text": "Invalid request"
		})
	} else {
		var findTicket = new Promise(function (resolve, reject) {
			Ticket.findById(req.params.id, function (err, result) {
				if (err) {
					reject(500);
				} else {
					if (result) {
						resolve(result)
					} else {
						reject(200)
					}
				}
			})
		})

		findTicket.then(function (ticket) {
			res.status(200).render('ticket/show', {title: `Ticket n°${ticket._id}`, ticket});
		}, function (error) {
			switch (error) {
				case 500:
					res.status(500).json({
						"text": "Internal error"
					})
					break;
				case 200:
					res.status(200).json({
						"text": "The ticket does not exist"
					})
					break;
				default:
					res.status(500).json({
						"text": "Internal error"
					})
			}
		})
	}
}

function edit(req, res) {
	if (!req.params.id) {
		res.status(400).json({
			"text": "Invalid request"
		})
	} else {
		var findTicket = new Promise(function (resolve, reject) {
			Ticket.findById(req.params.id, function (err, result) {
				if (err) {
					reject(500);
				} else {
					if (result) {
						resolve(result)
					} else {
						reject(200)
					}
				}
			})
        })
        
        let userEmails = new Promise(function (resolve, reject) {
            User.find({}, function (err, users) {
                if (err) {
                    reject(500);
                } else {
                    let userEmails = [];
                    users.forEach(user => {
                        userEmails.push(user.email);
                    });
                    console.log('user emails are', userEmails);
                    resolve(userEmails);
                }
            });
        });

        Promise.all([findTicket, userEmails]).then(values => {
            let ticket = values[0];
            let userEmails = values[1];
			res.status(200).render('ticket/edit', {title: `Modifier ticket n°${ticket._id}`, ticket, userEmails});
        }, function (error) {
			switch (error) {
				case 500:
					res.status(500).json({
						"text": "Internal error"
					})
					break;
				case 200:
					res.status(200).json({
						"text": "The ticket does not exist"
					})
					break;
				default:
					res.status(500).json({
						"text": "Internal error"
					})
			}
		});


		findTicket.then(function (ticket) {
		}, )
	}
}

function update(req, res) {
    console.log(req.body);
    console.log(req.params.id)
    console.log(req.body.description)
    console.log(req.body.assignedTo)
    console.log(req.body.priority)
    console.log(req.params.id)

	if (!req.params.id || !req.body.description || !req.body.assignedTo || !req.body.priority) {
		res.status(400).json({
			"text": "Invalid request !if"
		})
	} else {
		var findTicket = new Promise(function (resolve, reject) {
			req.body.completed = typeof req.body.completed !== 'undefined' ? true : false;

			Ticket.findByIdAndUpdate(req.params.id, req.body, function (err, result) {
                console.log('result is0', result)
                console.log('err is', err)
				if (err) {
					reject(500);
				} else {
					if (result) {
						resolve(result)
					} else {
						reject(200)
					}
				}
			})
		})

		findTicket.then(function (ticket) {
			res.redirect(`../${ticket.getId()}`);
		}, function (error) {
			switch (error) {
				case 500:
					res.status(500).json({
						"text": "Internal error case 500"
					})
					break;
				case 200:
					res.status(200).json({
						"text": "The ticket does not exist"
					})
					break;
				default:
					res.status(500).json({
						"text": "Internal error default 500"
					})
			}
		})
	}
}

function list(req, res) {
	var findTicket = new Promise(function (resolve, reject) {
		Ticket.find({}, function (err, tickets) {
			if (err) {
				reject(500);
			} else {
				if (tickets) {
					resolve(tickets)
				} else {
					reject(200)
				}
			}
		})
	})

	findTicket.then(function (tickets) {
		res.status(200).render('ticket/index', {title: 'List of tickets', tickets});
	}, function (error) {
		switch (error) {
			case 500:
				res.status(500).json({
					"text": "Internal error"
				})
				break;
			case 200:
				res.status(200).json({
					"text": "Il n'y a pas encore de ticket"
				})
				break;
			default:
				res.status(500).json({
					"text": "Internal error"
				})
		}
	})
}

exports.create = create;
exports.createForm = createForm;
exports.show = show;
exports.edit = edit;
exports.update = update;
exports.list = list;