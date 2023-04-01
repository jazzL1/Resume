const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');

const toDoSchema = new mongoose.Schema({
    task: {
        type: String,
        required: true
    },  
    priority: {
        type: Number,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    completeBy: {
        type: Date,
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId, ref: 'User',
        required: true
    }
})

const userSchema = new mongoose.Schema({
})

userSchema.plugin(passportLocalMongoose);

module.exports.toDoItem = mongoose.model('ToDo', toDoSchema);

module.exports.user = mongoose.model('User', userSchema);


