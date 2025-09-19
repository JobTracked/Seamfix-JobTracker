import Job from "../models/jobModels.js";

export const getJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ userId: req.user.id })
      .sort({ updatedAt: -1 });
    
    if (jobs.length === 0) {
      return res.status(404).json({ message: 'No jobs found' });
    }

    const jobMap = new Map();
    
    jobs.forEach(job => {
      const key = `${job.title.toLowerCase()}-${job.company.toLowerCase()}`;
      if (!jobMap.has(key)) {
        jobMap.set(key, job); 
      }
    });

    const uniqueJobs = Array.from(jobMap.values());
    res.status(200).json(uniqueJobs);
  } catch (error) {
    res.status(500).json({
      message: error.message || "Server error while fetching jobs"
    });
  }
};

const allowedStatuses = ["Wishlist", "Applied", "Interviewing", "Offer", "Rejected"];

export const createJob = async (req, res) => {
  try {
    const { title, company, status, salary, notes, link } = req.body; 
    
    const existingJob = await Job.findOne({
      userId: req.user.id,
      title: title,
      company: company
    })
    .sort({ createdAt: -1 }) 
    .collation({ locale: "en", strength: 2 });
    
    if (existingJob) {
      if (existingJob.status === "Rejected") {
        const newJob = await Job.create({
          title, 
          company, 
          status, 
          salary, 
          notes, 
          link,
          userId: req.user.id
        });
        
        return res.status(201).json({
          success: true,
          message: `New application created for ${title} at ${company} (previous was rejected)`,
          job: newJob
        });
      }
      
      return res.status(400).json({
        success: false,
        message: `You already have an active application for ${title} at ${company} with status ${existingJob.status}. Please update your existing application instead of applying again.`
      });
    }
    
    const newJob = await Job.create({
      title, 
      company, 
      status, 
      salary, 
      notes, 
      link,
      userId: req.user.id
    });
    
    return res.status(201).json({
      success: true,
      message: "Job application created successfully",
      job: newJob
    });
    
  } catch (error) {
    console.error("Error creating job:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while creating the job" 
    });
  }
};

export const updateJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    const updateData = req.body;

    const job = await Job.findOne({ 
      id: jobId,  
      userId: req.user.id 
    });

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found or you don't have permission to update it"
      });
    }

    if (updateData.title && updateData.company) {
      const duplicate = await Job.findOne({
        userId: req.user.id,
        title: updateData.title,
        company: updateData.company,
        id: { $ne: jobId }, 
        status: { $ne: "Rejected" } 
      }).collation({ locale: "en", strength: 2 });

      if (duplicate) {
        return res.status(400).json({
          success: false,
          message: `You already have an application for ${updateData.title} at ${updateData.company}`
        });
      }
    }

    let somethingChanged = false;
    for (let field in updateData) {
      if (updateData[field] !== job[field]) {
        somethingChanged = true;
        break;
      }
    }

    if (!somethingChanged) {
      return res.status(200).json({
        success: true,
        message: "No changes were made",
      });
    }

    const updatedJob = await Job.findOneAndUpdate(
      { id: jobId },  
      updateData,
      { new: true }
    );

    return res.status(200).json({
      success: true,
      message: "Job updated successfully",
    });

  } catch (error) {
    console.error('Error updating job:', error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while updating the job"
    });
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
  return res.status(401).json({ message: "You are not authorized to delete this job" });
}


    await job.deleteOne();

       return res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: "Server error while deleting job" });
  }
};