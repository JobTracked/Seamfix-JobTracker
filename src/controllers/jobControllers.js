import Job from "../models/jobModels.js";

export const getJobs = async (req, res) => {
  try {
    const jobs = await Job.find();

    if (jobs.length === 0) {
      return res.status(404).json({
        message: 'No jobs found'
      });
    }

    res.status(200).json(jobs);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      message: error.message || "Server error while fetching jobs"
    });
  }
};


export const createJob = async (req, res) => {
  try {
  const { title, company, status, salary, notes, link } = req.body; 
    const user = req.user
    console.log('User details:', user)

    if (!title || !company || !status) {
      return res.status(400).json({ message: "Please provide all fields" });
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

    res.status(201).json({message: 'Job Created',job});
  } catch (error) {
    console.error('Creating Job Error:', error.message);
    res.status(500).json({ message: "Server error while creating job" });
  }
};


export const updateJob = async (req, res) => {
  try {

      const { id } = req.params;
    const job = await Job.findOne({ id });

if (!req.body || Object.keys(req.body).length === 0) {
  return res.status(400).json({
    message: "Can't send an empty request"
  });
}
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }
   
    if (job.userId.toString() !== req.user.id.toString()) {
  return res.status(401).json({ message: "Not authorized" });
}


    const updatedJob = await Job.findOneAndUpdate(
      {id },
      req.body,
      { new: true }
    );

   return  res.status(200).json({ 
    message: 'Job Updated succesfulyy' ,
     updatedJob});
  } catch (error) {
    console.error("Error updating jobs:",error.message);
    res.status(500).json({ message: "Server error while updating job" });
  }
};


export const deleteJob = async (req, res) => {
  const { id } = req.params;

  try {
    
    const job = await Job.findOne({ id });

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }
   

    if (job.userId.toString() !== req.user.id.toString()) {
  return res.status(401).json({ message: "Not authorized" });
}


    await job.deleteOne();

       return res.status(204).send();
  } catch (error) {
    console.error('Error deleting jobs:',error.message);
    res.status(500).json({ message: "Server error while deleting job" });
  }
};
