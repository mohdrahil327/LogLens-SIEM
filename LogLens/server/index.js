const express = require('express');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const { processLogFile } = require('./analyzer');

const app = express();
const upload = multer({ dest: 'uploads/' }); // Temporary folder

app.use(cors()); // PRO TIP: This allows React (port 5173) to talk to Node (port 5000)

app.post('/analyze', upload.single('logfile'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).send('No file uploaded.');
        
        const results = await processLogFile(req.file.path);
        
        // Delete file after reading to keep the server clean
        fs.unlinkSync(req.file.path);

        res.json(results);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(5000, () => console.log('🚀 Server running on http://localhost:5000'));