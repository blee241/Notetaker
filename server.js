const express = require('express');
const path = require('path');
const fs = require('fs');

const PORT = process.env.port || 3001;

const app = express();

app.use(express.static('public'));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Sends the note-taking page to the client after the user clicks the 'Get Started' button on the home page
app.get('/notes', (req, res) => {
    res.sendFile(path.join(__dirname, '/public/notes.html'))
});

// Sends the notes in the database to the client
app.get('/api/notes', (req, res) => {
    res.sendFile(path.join(__dirname, '/db/db.json'))
})

app.post('/api/notes', (req, res) => {
    // Takes the title and text from the request body
    const { title, text } = req.body;

    if (title && text) {
        const newNote = {
            title,
            text
        };
        // Reads the database file
        fs.readFile('./db/db.json', 'utf-8', (err, data) => {
            if (err) {
                console.log(err)
            } else {
                // Adds the newNote object to the parsed database file
                const parsedDB = JSON.parse(data);
                parsedDB.push(newNote)
                // Writes the notes back into the db file
                fs.writeFile('./db/db.json', JSON.stringify(parsedDB), (err) => {
                    console.log(err)
                })
            }
        });
        res.status(201).json('Successfully saved note')
    } else {
        res.status(500).json('Error in saving note')
    }
})

app.delete('/api/notes/:id', (req, res) => {
    const noteId = req.params.id;
  
    fs.readFile('./db/db.json', 'utf-8', (err, data) => {
      if (err) {
        console.log(err);
        res.status(500).json('Error in deleting note');
      } else {
        let parsedDB = JSON.parse(data);
  
        // Get index of the note with the provided ID
        const noteIndex = parsedDB.findIndex((note) => note.id === noteId);
  
        if (noteIndex !== -1) {
          // Remove the note from the array
          parsedDB.splice(noteIndex, 1);
  
          // Put the updated notes back into the db file
          fs.writeFile('./db/db.json', JSON.stringify(parsedDB), (err) => {
            if (err) {
              console.log(err);
              res.status(500).json('Error in deleting note');
            } else {
              res.status(200).json('Successfully deleted note');
            }
          });
        } else {
          res.status(404).json('Note not found');
        }
      }
    });
  });

app.listen(PORT, () => {
    console.log(`Successfully opened at http://localhost:${PORT}`)
})