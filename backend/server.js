import express from 'express';
import mongoose from 'mongoose';
import multer from 'multer';
import cors from 'cors';
import Submission from './models/submissionSchema.model.js';
import dotenv from 'dotenv';
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// MongoDB Atlas Connection
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB Atlas'))
.catch(err => console.error('MongoDB connection error:', err));

// Multer Configuration for Image Upload
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + '-' + file.originalname);
    }
});

const upload = multer({ 
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        if (!file.mimetype.startsWith('image/')) {
            return cb(new Error('Only images are allowed'));
        }
        cb(null, true);
    }
});

app.post('/api/submissions', upload.array('images', 5), async (req, res) => {
    try {
        const { name, socialHandle } = req.body;

        // Process the uploaded files
        const images = req.files.map(file => ({
            url: `${process.env.BASE_URL}/uploads/${file.filename}`,
            path: file.path
        }));

        // Check if a submission with the same socialHandle already exists
        const existingSubmission = await Submission.findOne({ socialHandle });

        if (existingSubmission) {
            // If submission exists, push the new images to the existing submission
            existingSubmission.images.push(...images);
            await existingSubmission.save();
            return res.status(200).json(existingSubmission);  // Return updated submission
        }

        // If no existing submission with the same socialHandle, create a new one
        const submission = new Submission({
            name,
            socialHandle,
            images
        });

        await submission.save();
        res.status(201).json(submission);  // Return new submission
    } catch (error) {
        console.error('Submission error:', error);
        res.status(500).json({ error: 'Error creating submission' });
    }
});

// Fetch all submissions (grouped by socialHandle)
app.get('/api/submissions', async (req, res) => {
    try {
        const submissions = await Submission.find().sort({ createdAt: -1 });
        res.json(submissions);
    } catch (error) {
        console.error('Fetch error:', error);
        res.status(500).json({ error: 'Error fetching submissions' });
    }
});

// Error handling middleware
app.use((error, req, res, next) => {
    console.error(error);
    res.status(500).json({ error: error.message || 'Server error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
