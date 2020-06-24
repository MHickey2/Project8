const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const config = require('../config/config');

var userSchema = mongoose.Schema({
	email: {
		type: String,
		lowercase: true,
		trim: true,
		unique: true,
		required: true
	},
	password: {
        type: String,
        required: true
    },
    isAdmin: {
        type: Boolean,
        required: true,
        default: false
    }
},{ timestamps: { createdAt: 'created_at' }})


userSchema.methods = {
	authenticate: function (password) {
		return password === this.password;
	},
	getToken: function () {
		return jwt.sign({id: this._id, email: this.email}, config.secret, {expiresIn: '1d'});
	}
}

module.exports = mongoose.model('User', userSchema);