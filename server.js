// src/server.js

require('dotenv').config(); // Load environment variables from .env file

const app = require('./src/app');
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log("Bye bye!");
    process.exit();
});
