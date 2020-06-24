const mongoose = require('mongoose');

var ticketSchema = mongoose.Schema({
    title: {
        type: String,
        required: true
    },
	description: {
		type: String,
		required: true
	},
	assignedTo: {
        type: Schema.Types.ObjectId,
        required: false
    },
    priority: {
        type: String,
        required: true
    },
    completed: {
        type: Boolean,
        required: true,
        default: false
    },
    assigned: {
        type: Boolean,
        required: true,
        default: false
    }
},{ timestamps: { createdAt: 'created_at' }})


ticketSchema.methods = {
	getId: function () {
        return this.id;
    }
}

module.exports = mongoose.model('Ticket', ticketSchema);