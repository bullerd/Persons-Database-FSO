const express = require("express");
const app = express();

app.use(express.json());

const cors = require("cors");

app.use(cors());

app.use(express.static("dist"));

const requestLogger = (request, response, next) => {
  console.log("Method:", request.method);
  console.log("Path:  ", request.path);
  console.log("Body:  ", request.body);
  console.log("---");
  next();
};
app.use(requestLogger);

const Contact = require("./models/contact");

app.get("/api/persons", async (request, response, next) => {
  console.log("get All Contacts...");
  try {
    const persons = await Contact.find({});
    response.json(persons);
  } catch (error) {
    next(error);
  }
});

app.get("/api/info", async (request, response, error) => {
  const currentdate = new Date();
  const datetime =
    currentdate.getDate() +
    "/" +
    (currentdate.getMonth() + 1) +
    "/" +
    currentdate.getFullYear() +
    " @ " +
    currentdate.getHours() +
    ":" +
    currentdate.getMinutes().toString().padStart(2, "0") +
    ":" +
    currentdate.getSeconds().toString().padStart(2, "0");
  try {
    const numContacts = await Contact.countDocuments();

    const html = `
    <div>
      <p>The phonebook currently has ${numContacts} ${
      numContacts === 1 ? "entries" : "entries"
    } <br />
    as of ${datetime}
    </p>
    </div>
    `;
    response.send(html);
  } catch (error) {
    next(error);
  }
});

// endpoint for a single entry
app.get("/api/persons/:id", async (request, response, next) => {
  const id = request.params.id;
  try {
    const person = await Contact.findById(id);
    if (!person) {
      return response.status(404).end();
    }
    response.json(person);
  } catch (error) {
    console.log(error);
    next(error);
  }
});

app.delete("/api/persons/:id", async (request, response, next) => {
  const id = request.params.id;
  try {
    const result = await Contact.findByIdAndDelete(request.params.id);
    response.status(204).end();
  } catch (error) {
    next(error);
  }
});

// add a new person
// TODO: ensure the person isn't already in the database
app.post("/api/persons", async (request, response, next) => {
  console.log("adding new person");
  const body = request.body;

  if (!body.name || !body.number) {
    return response.status(400).json({
      error: "content missing",
    });
  }

  const person = new Contact({
    name: body.name,
    number: body.number,
  });

  try {
    const savedPerson = await person.save();
    response.status(201).json(savedPerson);
  } catch (error) {
    next(error);
  }
});

// update the phone number of an entry
app.put("/api/persons/:id", async (request, response, next) => {
  const { name, number } = request.body;
  console.log(request.params.id);
  try {
    const person = await Contact.findById(request.params.id);
    if (!person) {
      return response.status(404).end();
    }
    person.name = name;
    person.number = number;

    const updatedContact = await person.save();
    response.json(updatedContact);
  } catch (error) {
    next(error);
  }
});

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: "unknown endpoint" });
};

app.use(unknownEndpoint);

const errorHandler = (error, request, response, next) => {
  if (error.name === "CastError") {
    return response.status(400).json({ error: "malformatted id" });
  } else if (error.name === "ValidationError") {
    const details = Object.fromEntries(
      Object.entries(error.errors).map(([field, err]) => [field, err.message])
    );
    return response.status(400).json({
      error: "validation error",
      details,
    });
  }

  response.status(500).json({ error: "internal server error" });
};

app.use(errorHandler);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
