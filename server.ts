import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import { randomBytes } from 'crypto';
import { Industry } from './enums';

const app = express();
const port = process.env.PORT || 2000;

// In-memory data object
interface Job {
    id: string;
    noOfOpenings: number;
    title: string;
    description: string;
    industry: Industry;
}

// Let's just use array of objects for now
const jobs: Job[] = [];

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Validation middleware
function validateJobFields(req: Request, res: Response, next: () => void) {
    const { noOfOpenings, title, description, industry } = req.body;

    // Check data types
    if (
        typeof noOfOpenings !== 'number' ||
        typeof title !== 'string' ||
        typeof description !== 'string' ||
        typeof industry !== 'string'
    ) {
        return res.status(400).json({ success: false, error: 'Invalid data types in request body' });
    }

    // Check required fields
    if (!noOfOpenings || !title || !description || !industry) {
        return res.status(400).json({ success: false, error: 'All fields are required' });
    }

    next();
}


// Create a new job
app.post('/api/jobs', validateJobFields, (req: Request, res: Response) => {
    try {
        const id = randomBytes(4).toString('hex'); // Generate the id first
        const newJob = { id, ...req.body } as Job; // Use the generated id when creating the job
        jobs.push(newJob);
        res.status(201).json({ success: true, data: newJob });
    } catch (error) {
        res.status(400).json({ success: false, error: 'Failed to create a job' });
    }
});

// GET all jobs route
app.get('/api/jobs', (req, res) => {
    try {
        if (jobs.length > 0) {
            res.status(200).json({ success: true, data: jobs });
        } else {
            res.status(204).json({ success: true, message: 'No jobs found' });
        }

    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to retrieve jobs' });
    }
});

// GET job by id
app.get('/api/jobs/:id', (req, res) => {
    try {
        const jobId = req.params.id;
        const job = jobs.find((j) => j.id === jobId);

        if (!job) {
            res.status(404).json({ success: false, error: 'Job not found' });
        } else {
            res.status(200).json({ success: true, data: job });
        }
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to retrieve the job' });
    }
});

// Update job by id
app.put('/api/jobs/:id', (req, res) => {
    try {
        const jobId = req.params.id;
        const updatedJobData = req.body;
        const index = jobs.findIndex((j) => j.id === jobId);

        if (index === -1) {
            res.status(404).json({ success: false, error: 'Job not found' });
        } else {
            jobs[index] = { ...jobs[index], ...updatedJobData };
            res.status(200).json({ success: true, data: jobs[index] });
        }
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to update the job' });
    }
});

// Delete job by id
app.delete('/api/jobs/:id', (req, res) => {
    try {
        const jobId = req.params.id;
        const index = jobs.findIndex((j) => j.id === jobId);

        if (index === -1) {
            res.status(404).json({ success: false, error: 'Job not found' });
        } else {
            const deletedJob = jobs.splice(index, 1);
            res.status(200).json({ success: true, data: deletedJob[0] });
        }
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to delete the job' });
    }
});


// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});