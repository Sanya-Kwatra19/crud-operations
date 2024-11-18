const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = 3000;

// Serve static files from the 'public' folder
app.use(express.static(path.join(__dirname, 'public')));

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/crudDB')
  .then(() => {
    console.log("MongoDB connected successfully.");
  })
  .catch(err => {
    console.log("MongoDB connection error:", err);
  });

// Create a Schema for Data
const itemSchema = new mongoose.Schema({
  name: String,
  description: String
});

const Item = mongoose.model('Item', itemSchema);

// Routes
app.get('/', async (req, res) => {
  try {
    const items = await Item.find({});
    res.render('index', { items });
  } catch (err) {
    console.log(err);
    res.status(500).send('Error retrieving items');
  }
});

// Route to show the form to add a new item
app.get('/add', (req, res) => {
  res.render('add');
});

// Create item
app.post('/add', async (req, res) => {
  const newItem = new Item({
    name: req.body.name,
    description: req.body.description
  });

  try {
    await newItem.save(); // Using async/await instead of a callback
    res.redirect('/');
  } catch (err) {
    console.log(err);
    res.status(500).send('Error saving item');
  }
});

// Route to handle editing an item by ID
app.get('/edit/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const item = await Item.findById(id); // Find the item by ID
    if (!item) {
      return res.status(404).send('Item not found');
    }
    res.render('edit', { item }); // Render the edit form, passing the item data
  } catch (err) {
    console.log(err);
    res.status(500).send('Error fetching item');
  }
});

// Handle item update
app.post('/edit/:id', async (req, res) => {
  const { id } = req.params;
  const updateData = {
    name: req.body.name,
    description: req.body.description
  };

  try {
    const updatedItem = await Item.findByIdAndUpdate(id, updateData, { new: true });
    if (!updatedItem) {
      return res.status(404).send('Item not found');
    }
    res.redirect('/');
  } catch (err) {
    console.log(err);
    res.status(500).send('Error updating item');
  }
});

// Delete item
app.get('/delete/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await Item.findByIdAndDelete(id);
    if (!result) {
      return res.status(404).send('Item not found');
    }
    res.redirect('/');  // Redirect after deletion
  } catch (err) {
    console.error(err);
    res.status(500).send('Error deleting item');
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);

});
