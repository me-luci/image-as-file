const express = require('express');
const fs = require('fs');
const multer = require('multer');
const path = require('path');
const app = express();
const port = 3000;

// Set up multer for handling file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.use(express.static('public'));

// Route to encode the file into the image
app.post('/encode', upload.fields([{ name: 'image' }, { name: 'zipFile' }]), (req, res) => {
    const image = req.files['image'][0];
    const zipFile = req.files['zipFile'][0];

    // Encode the zip file into the image (in memory)
    const encodedImage = encodeFileToImage(image.buffer, zipFile.buffer);

    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Content-Disposition', 'attachment; filename="encoded-image.png"');
    res.send(encodedImage); // Send the encoded image back to the client
});

// Route to decode the file from the image
app.post('/decode', upload.single('encodedImage'), (req, res) => {
    const encodedImage = req.file.buffer;

    try {
        // Extract the zip file from the encoded image (in memory)
        const zipFileBuffer = decodeImageToFile(encodedImage);

        // Send the extracted zip file as a download
        res.setHeader('Content-Type', 'application/zip');
        res.setHeader('Content-Disposition', 'attachment; filename="extracted-file.zip"');
        res.send(zipFileBuffer); // Send the zip file buffer directly
    } catch (error) {
        res.status(500).send('Error decoding the file.');
    }
});

// Function to encode a zip file into an image
function encodeFileToImage(imageBuffer, zipBuffer) {
    // You can encode the zip file into the image buffer here (for simplicity, we'll just append it)
    const separator = Buffer.from('<SEPARATOR>');
    return Buffer.concat([imageBuffer, separator, zipBuffer]);
}

// Function to decode a file from an image
function decodeImageToFile(imageBuffer) {
    // Find the separator and extract the zip file buffer
    const separator = Buffer.from('<SEPARATOR>');
    const separatorIndex = imageBuffer.indexOf(separator);
    if (separatorIndex === -1) {
        throw new Error('Separator not found in the image.');
    }

    return imageBuffer.slice(separatorIndex + separator.length);
}

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
