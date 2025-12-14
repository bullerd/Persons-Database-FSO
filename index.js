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

let persons = [
  {
    id: "1",
    name: "Arto Hellas",
    number: "040-123456",
  },
  {
    id: "2",
    name: "Ada Lovelace",
    number: "39-44-5323523",
  },
  {
    id: "3",
    name: "Dan Abramov",
    number: "12-43-234345",
  },
  {
    id: "4",
    name: "Mary Poppendieck",
    number: "39-23-6423122",
  },
];

app.get("/api/persons", (request, response) => {
  response.json(persons);
});

app.get("/api/info", (request, response) => {
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
  const html = `
    <div>
      <p>The phonebook currently has ${persons.length} ${
    persons.length === 1 ? "entries" : "entries"
  } <br />
    as of ${datetime}
    </p>
    </div>
    `;
  response.send(html);
});

// endpoint for a single entry
app.get("/api/persons/:id", (request, response) => {
  const id = request.params.id;
  const person = persons.find((person) => person.id === id);
  if (person) {
    response.json(person);
  } else {
    response.statusMessage = `Person ${id} entry not found`;
    response.status(404).end();
    // response.send(
    //   `;
    //     <h1>Error</h1>
    //     <p>Unable to find a person with id ${id}`
    // );
  }
});

//delete
app.delete("/api/persons/:id", (request, response) => {
  const id = request.params.id;
  persons = persons.filter((person) => person.id !== id);

  response.status(204).end();
});

//helper function
const personsContainsName = (name) => persons.some((p) => p.name === name);

//add a new person
const MAX_ID = 1000000;
const generateId = () => {
  const usedIds = new Set(persons.map((p) => Number(p.id)));
  let newId;
  do {
    newId = Math.floor(Math.random() * MAX_ID + 1);
  } while (usedIds.has(newId));
  return String(newId);
};

app.post("/api/persons", (request, response) => {
  const body = request.body;

  if (!body.name || !body.number) {
    return response.status(400).json({
      error: "content missing",
    });
  }

  if (personsContainsName(body.name)) {
    return response.status(400).json({
      error: "name already exists",
    });
  }
  const person = {
    name: body.name,
    number: body.number,
    id: generateId(),
  };

  persons = persons.concat(person);

  response.json(person);
});

//experimental!
app.put("/api/persons/:id", (request, response) => {
  const body = request.body;
  const person = {
    name: body.name,
    number: body.number,
    id: body.id,
  };
  persons = persons.map((p) => (p.id === person.id ? person : p));
  response.json(person);
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
