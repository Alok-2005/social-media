import mongoose from 'mongoose';

const submissionSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    socialHandle: {
        type: String,
        required: true,
        trim: true
    },
    images: [{
        url: String,
        path: String
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Submission = mongoose.model('Submission', submissionSchema);

export default Submission;