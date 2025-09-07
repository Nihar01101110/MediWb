const mongoose = require('mongoose');

const MedicineSchema = new mongoose.Schema({
    brandName: {
        type: String,
        required: true
    },
    genericName: {
        type: String,
        required: true
    },
    usage: {
        type: String,
        required: true
    },
    foodInteraction: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model('Medicine', MedicineSchema);


