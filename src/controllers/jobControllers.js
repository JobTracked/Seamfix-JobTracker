import Job from "../models/jobModels.js";

export const getJobs = async (req, res) => {
  try {
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
  userId: req.user.id,
  title: title,
  company: company
}).collation({ locale: "en", strength: 2 });

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
    const userId = req.user.id;
    const updateData = req.body;

    const existingJob = await Job.findOne({ id: jobId });
    
    if (!existingJob) {
      return res.status(404).json({
        success: false,
        message: "Job not found"
      });
    }

    if (existingJob.userId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to update this job"
      });
    }

    if (updateData.title && updateData.company) {
      const duplicateJob = await Job.findOne({
        userId,
        title: updateData.title,
        company: updateData.company,
        id: { $ne: jobId } // exclude the job being updated
      }).collation({ locale: "en", strength: 2 });

      if (duplicateJob) {
        return res.status(400).json({
          success: false,
          message: `You already have a ${updateData.title} role at ${updateData.company}.`
        });
      }
    }

    let hasChanges = false;
    for (const field in updateData) {
      if (updateData[field] !== existingJob[field]) {
        hasChanges = true;
        break;
      }
    }

    if (!hasChanges) {
      return res.status(200).json({
        success: true,
        message: "No changes detected"
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
      data: updatedJob
    });

  } catch (error) {
    console.error('Error updating job:', error);
    
    return res.status(500).json({
      success: false,
      message: "Internal server error"
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