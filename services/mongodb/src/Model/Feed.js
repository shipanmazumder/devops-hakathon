const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const feedScema = new Schema(
    {
        title: {
            type: String,
            required: true,
        },
        desc: {
            type: String,
            required: true,
        }
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("Feed", feedScema);