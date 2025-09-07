import { deleteCache, getCache, setCache } from "../lib/redis.js";
import Job from "../models/jobModels.js";

export const getJobs = async (req, res) => {
  try {
    

    const cacheKey = `jobs:${req.user.id}`;

    const cachedJobs = await getCache(cacheKey);

    if(cachedJobs){
      return res.status(200).json(JSON.parse(cachedJobs));
    }

    const jobs = await Job.find({ userId: req.user.id });

    if (jobs.length === 0) {
      return res.status(404).json({ message: 'No jobs found' });
    }

    const uniqueJobs = jobs.filter((job, index, self) =>
      index === self.findIndex(j =>
        j.title.toLowerCase() === job.title.toLowerCase() &&
        j.company.toLowerCase() === job.company.toLowerCase()
      )
    );

     await setCache(cacheKey, JSON.stringify(uniqueJobs), 60 * 60 * 1000);

    res.status(200).json(uniqueJobs);
  } catch (error) {
    res.status(500).json({
      message: error.message || "Server error while fetching jobs"
    });
  }
};


export const createJob = async (req, res) => {
  try {
  const { title, company, status, salary, notes, link } = req.body; 


   const existingJob = await Job.findOne({ 
      title: title,
      company: company
,      userId: req.user.id
    });

    if (existingJob) {
      return res.status(400).json({
        message: `You have already added the job title ${title} position at ${company}.`
      });
    }

    const job = await Job.create({
      title,
      company,
      status,
      salary,
      notes,
      link,
      userId: req.user.id, 
    });

    res.status(201).json(job);
  } catch (error) {
    res.status(500).json({ message: "Server error while creating job" });
  }
};

export const updateJob = async (req, res) => {
  try {
    const { jobId } = req.params; 
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({ message: "Can't send an empty request" });
    }

    const job = await Job.findOne({ id: jobId }); 

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    if (job.userId.toString() !== req.user.id.toString()) {
      return res.status(401).json({ message: "Not authorized" });
    }

 await Job.findOneAndUpdate(
      { id: jobId, userId: req.user.id },
      req.body,
      { new: true }
    );

    return res.status(200).json({ message: 'Job updated successfully' });
  } catch (error) {
    res.status(500).json({ message: "Server error while updating job" });
  }
};


export const deleteJob = async (req, res) => {
  const {jobId } = req.params;

  try {
    
    const job = await Job.findOne({ id: jobId });

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }
   

    if (job.userId.toString() !== req.user.id.toString()) {
  return res.status(401).json({ message: "Not authorized" });
}
    const cachedKey = `jobs${req.user.id}`;

    if(await getCache(cachedKey)){
      await deleteCache(cachedKey);
    }


    await job.deleteOne();

       return res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: "Server error while deleting job" });
  }
};