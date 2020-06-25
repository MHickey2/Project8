const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var ticketSchema = mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
        assignedTo: {
            type: String,
            required: false,
        },
        priority: {
            type: String,
            required: true,
        },
        completed: {
            type: Boolean,
            required: true,
            default: false,
        },
        assigned: {
            type: Boolean,
            required: true,
            default: false,
        },
        createdBy: {
            type: String,
            required: true,
        },
        comments: {
            type: Object,
            userName: {
                type: String,
            },
            comment: {
                type: String,
            },
        },
    },
    { timestamps: { createdAt: 'created_at' } }
);

ticketSchema.methods = {
    getId: function () {
        return this.id;
    },
};

module.exports = mongoose.model('Ticket', ticketSchema);
