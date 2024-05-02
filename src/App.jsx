import { useEffect, useState } from "react";
import nameService from "./services/names";
import "./index.css";

const Filter = ({ persons }) => {
  const [newFilter, setNewFilter] = useState("");
  const [newMatched, setNewMatched] = useState([]);

  const handleFilterChange = (event) => {
    setNewFilter(event.target.value);
    filterFunction(event.target.value);
  };

  const filterFunction = (matching) => {
    setNewMatched([]);
    persons.map((person) => {
      if (person.name.toLowerCase().includes(matching.toLowerCase())) {
        setNewMatched((prevMatched) => [...prevMatched, person]);
      }
    });
  };

  return (
    <div>
      filter shown with:{" "}
      <input value={newFilter} onChange={handleFilterChange} />
      <ul>
        {newMatched.map((matched) => (
          <li key={matched.id}>
            {matched.name} {matched.number}
          </li>
        ))}
      </ul>
    </div>
  );
};
const AddNew = ({ persons, setPersons, setMessage }) => {
  const [newName, setNewName] = useState("");
  const [newNumber, setNewNumber] = useState("");

  const handleNameChange = (event) => {
    setNewName(event.target.value);
  };

  const handleNumberChange = (event) => {
    setNewNumber(event.target.value);
  };

  const addName = (event) => {
    event.preventDefault();

    const repeated = persons.find((p) => p.name === newName);

    if (repeated) {
      const result = confirm(
        `${repeated.name} already exist, do you want to replace the number ?`
      );
      if (result === false) return;
      const changedNumber = { ...repeated, number: newNumber };
      // update the number
      nameService.update(repeated.id, changedNumber).then((updatedData) => {
        setPersons((prevPersons) =>
          prevPersons.map((person) =>
            person.id !== repeated.id ? person : updatedData
          )
        );
        setMessage({
          text: `${newName}'s details was updated in the phone book.`,
          isError: false,
        });
        setTimeout(() => {
          setMessage({ text: "", isError: false });
        }, 5000);

        setNewName("");
        setNewNumber("");
      });

      return; // Exit the function early to prevent further execution
    }

    const nameObject = {
      name: newName,
      id: randomKey(),
      number: newNumber,
    };
    nameService
      .create(nameObject)
      .then((name) => {
        setPersons(persons.concat(name));
        setNewName("");
        setNewNumber("");

        setMessage({
          text: `${newName}'s was added to the phone book.`,
          isError: false,
        });
        setTimeout(() => {
          setMessage({ text: "", isError: false });
        }, 5000);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  return (
    <form onSubmit={addName}>
      <div>
        name: <input value={newName} onChange={handleNameChange} />
      </div>
      <div>
        number: <input value={newNumber} onChange={handleNumberChange} />
      </div>
      <div>
        <button type="submit">add</button>
      </div>
    </form>
  );
};

const Delete = ({ id, setPersons, persons }) => {
  const handleDelete = () => {
    const result = confirm(
      `Are you sure you want to delete ${
        persons.find((person) => person.id === id).name
      }`
    );
    if (result === false) return;
    nameService
      .remove(id)
      .then((response) => {
        console.log(response);
        // remove the person from the persons array
        const updatedPersons = persons.filter((person) => person.id !== id);
        setPersons(updatedPersons);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  return (
    <div>
      <button onClick={handleDelete}>Delete</button>
    </div>
  );
};

const randomKey = () => {
  return Math.random().toString(36).slice(2, 10);
};

const Persons = ({ persons, setPersons }) => {
  return (
    <ul>
      {persons.map((person) => (
        <li key={person.id}>
          {person.name} {person.number}{" "}
          <Delete id={person.id} setPersons={setPersons} persons={persons} />
        </li>
      ))}
    </ul>
  );
};

const App = () => {
  const [persons, setPersons] = useState([]);
  const [message, setMessage] = useState({ text: "", isError: false });

  useEffect(() => {
    nameService
      .getAll()
      .then((names) => setPersons(names))
      .catch((error) => {
        console.log(error);
      });
  }, []);

  return (
    <div>
      <div
        className={
          message.text !== "" ? (message.isError ? "error" : "non-error") : null
        }
      >
        {message.text}
      </div>

      <h2>Phonebook</h2>
      <Filter persons={persons} />
      <h2>add a new</h2>
      <AddNew
        persons={persons}
        setPersons={setPersons}
        setMessage={setMessage}
      />
      <h2>Numbers</h2>
      <Persons persons={persons} setPersons={setPersons} />
    </div>
  );
};

export default App;
