const express = require('express');
const connectDB = require('./config/db');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// Connect Database
connectDB();

// Init Middleware
app.use(cors()); // Enable Cross-Origin Resource Sharing
app.use(express.json({ extended: false }));

// Serve the frontend files
app.use(express.static(path.join(__dirname, '..', 'frontend')));

// Define API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/medicine', require('./routes/medicine'));
app.use('/api/chat', require('./routes/chat'));

// Catch-all route to serve the index.html for any other request
app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '..', 'frontend', 'index.html'));
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));






// const express = require('express');
// const connectDB = require('./config/db');
// const cors = require('cors');
// const path = require('path');
// require('dotenv').config();

// const app = express();

// // Init Middleware
// app.use(cors());
// app.use(express.json({ extended: false }));

// // Define API Routes
// app.use('/api/auth', require('./routes/auth'));
// app.use('/api/medicine', require('./routes/medicine'));
// app.use('/api/chat', require('./routes/chat'));

// // Serve frontend files
// app.use(express.static(path.join(__dirname, '..', 'frontend')));
// app.get('*', (req, res) => {
//     res.sendFile(path.resolve(__dirname, '..', 'frontend', 'index.html'));
// });

// const PORT = process.env.PORT || 5000;

// // ---> CHANGED: We wrap the server start in a function to use async/await
// const startServer = async () => {
//     try {
//         // ---> CHANGED: We now WAIT for the database to connect first
//         await connectDB();

//         app.listen(PORT, () => console.log(`Server started on port ${PORT}`));

//     } catch (error) {
//         console.error("Failed to connect to the database", error);
//         process.exit(1);
//     }
// };

// // ---> CHANGED: Call the function to start the server
// startServer();