const mongoose = require("mongoose");
require("dotenv").config();

const url = process.env.MONGODB_URI;
console.log(url);
mongoose.set("strictQuery", false);

//const phoneRegex = /^\d{2,3}-\d+$/;
const phoneRegex = /^\d{3}-\d{3}-\d{4}/;

const contactSchema = new mongoose.Schema({
  name: { type: String, minLength: 5, required: true },
  number: {
    type: String,
    required: true,
    minLength: 8,
    validate: {
      validator: (v) => phoneRegex.test(v),
      message: (props) =>
        `${props.value} is not a valid phone number (expected NN-N... or NNN-N...)`,
    },
  },
});

contactSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

mongoose
  .connect(url, { family: 4 })
  .then((result) => {
    console.log("connected to MongoDB");
  })
  .catch((error) => {
    console.log("error connecting to MongoDB:", error.message);
  });

module.exports = mongoose.model("Contact", contactSchema);
