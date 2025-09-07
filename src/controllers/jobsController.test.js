import { beforeEach, describe, expect, jest } from "@jest/globals";
import Job from "../models/jobModels.js";
import { createJob, deleteJob, getJobs, updateJob } from "./jobControllers.js";


jest.mock("../models/jobModels.js");
jest.mock("../lib/redis.js", () => ({
  getCache: jest.fn(),
  setCache: jest.fn(),
  deleteCache: jest.fn()
}));


import { deleteCache, getCache, setCache } from "../lib/redis.js";


// getJob 
describe("getJobs Controller", () => {
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks();

    req = {
      user: { id: "user123" },
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
  });


  // Test 1
  test("should return cached jobs if they exist", async () => {
    const cachedJobs = [
      { title: "Software Engineer", company: "Tech Corp" },
      { title: "Product Manager", company: "Business Inc" },
    ];
    
  
    getCache.mockResolvedValue(JSON.stringify(cachedJobs));

    await getJobs(req, res);

    expect(getCache).toHaveBeenCalledWith("jobs:user123");
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(cachedJobs);
    expect(Job.find).not.toHaveBeenCalled(); 
    expect(setCache).not.toHaveBeenCalled(); 
  });


  // Test 2
  test("it should return 404 if no jobs are found", async () => {
    getCache.mockResolvedValue(null);
    Job.find.mockResolvedValue([]);

    await getJobs(req, res);


    expect(getCache).toHaveBeenCalledWith("jobs:user123");
    expect(Job.find).toHaveBeenCalledWith({ userId: "user123" });
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "No jobs found" });
    expect(setCache).not.toHaveBeenCalled();

  })

  
// Test 3
  test("should filter out duplicate jobs based on title and company", async () => {
    getCache.mockResolvedValue(null); 

    const jobs = [
      { title: "Software Engineer", company: "Tech Corp" },
      { title: "software engineer", company: "tech corp" },
      { title: "Product Manager", company: "Business Inc" },
    ];
    const expectedJobs = [
      { title: "Software Engineer", company: "Tech Corp" },
      { title: "Product Manager", company: "Business Inc" },
    ];
  
     Job.find.mockResolvedValue(jobs),
    

    await getJobs(req, res);

    expect(getCache).toHaveBeenCalledWith("jobs:user123");
    expect(Job.find).toHaveBeenCalledWith({ userId: "user123" });
    expect(setCache).toHaveBeenCalledWith(
      "jobs:user123",
      JSON.stringify(expectedJobs),
      60 * 60 * 1000
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expectedJobs);
  });

//Test 4
test("should return unique jobs and cache them", async () => {
  const req = { user: { id: "user123" } };

  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  };

  const jobs = [
    { title: "Software Engineer", company: "Tech Corp" },
    { title: "software engineer", company: "tech corp" }, // duplicate
    { title: "Product Manager", company: "Business Inc" },
  ];

  getCache.mockResolvedValue(null);
  Job.find.mockResolvedValue(jobs);
  setCache.mockResolvedValue(true);

  await getJobs(req, res);

  expect(getCache).toHaveBeenCalledWith("jobs:user123");
  expect(Job.find).toHaveBeenCalledWith({ userId: "user123" });
  expect(setCache).toHaveBeenCalledWith(
    "jobs:user123",
    JSON.stringify([
      { title: "Software Engineer", company: "Tech Corp" },
      { title: "Product Manager", company: "Business Inc" },
    ]),
    60 * 60 * 1000
  );
  expect(res.status).toHaveBeenCalledWith(200);
  expect(res.json).toHaveBeenCalledWith([
    { title: "Software Engineer", company: "Tech Corp" },
    { title: "Product Manager", company: "Business Inc" },
  ]);
});



// Test 5
test("should return 500 if database query fails", async () => {
  const req = { user: { id: "user123" } };
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  };

  getCache.mockResolvedValue(null);
  Job.find.mockRejectedValue(new Error("Job retrieval error"));

  await getJobs(req, res);

  expect(getCache).toHaveBeenCalledWith("jobs:user123");
  expect(Job.find).toHaveBeenCalledWith({ userId: "user123" });
  expect(setCache).not.toHaveBeenCalled();
  expect(res.status).toHaveBeenCalledWith(500);
  expect(res.json).toHaveBeenCalledWith({
    message: "Job retrieval error",
  });
});




});


// createJob
describe("createJob Controller", () => {
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks();

    req = {
      user: { id: "user123" },
      body: {
        title: "Software Engineer",
        company: "Google",
        status: "Applied",
        salary: "100k",
        notes: "Excited to apply",
        link: "https://google.com",
      },
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  // Test 1: successful creation
  test("should create a new job successfully", async () => {
    Job.findOne.mockResolvedValue(null);
    const newJob = { ...req.body, userId: "user123", _id: "job123" };
    Job.create.mockResolvedValue(newJob);

    await createJob(req, res);

    expect(Job.findOne).toHaveBeenCalledWith({
      title: "Software Engineer",
      company: "Google",
      userId: "user123",
    });
    expect(Job.create).toHaveBeenCalledWith({
      ...req.body,
      userId: "user123",
    });
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(newJob);
  });

  // Test 2: duplicate job
  test("should return 400 if job already exists", async () => {
    Job.findOne.mockResolvedValue({ _id: "job123" });

    await createJob(req, res);

    expect(Job.findOne).toHaveBeenCalledWith({
      title: "Software Engineer",
      company: "Google",
      userId: "user123",
    });
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message:
        "You have already added the job title Software Engineer position at Google.",
    });
  });

  // Test 3: findOne throws error
  test("should return 500 if Job.findOne throws", async () => {
    Job.findOne.mockRejectedValue(new Error("DB error"));

    await createJob(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: "Server error while creating job",
    });
  });

  // Test 4: create throws error
  test("should return 500 if Job.create throws", async () => {
    Job.findOne.mockResolvedValue(null);
    Job.create.mockRejectedValue(new Error("DB error"));

    await createJob(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: "Server error while creating job",
    });
  });

  // Test 5: ensure correct payload passed to Job.create
  test("should call Job.create with correct payload", async () => {
    Job.findOne.mockResolvedValue(null);
    const newJob = { ...req.body, userId: "user123", _id: "job123" };
    Job.create.mockResolvedValue(newJob);

    await createJob(req, res);

    expect(Job.create).toHaveBeenCalledWith({
      title: "Software Engineer",
      company: "Google",
      status: "Applied",
      salary: "100k",
      notes: "Excited to apply",
      link: "https://google.com",
      userId: "user123",
    });
  });
});

// update Job
describe("updateJob Controller", () => {
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks();

    req = {
      user: { id: "user123" },
      params: { jobId: "job123" },
      body: { title: "Updated Title" },
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
  });

  test("should return 400 if request body is empty", async () => {
    req.body = {};

    await updateJob(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "Can't send an empty request",
    });
  });

  test("should return 404 if job not found", async () => {
    Job.findOne.mockResolvedValue(null);

    await updateJob(req, res);

    expect(Job.findOne).toHaveBeenCalledWith({ id: "job123" });
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "Job not found" });
  });

  test("should return 401 if user not authorized", async () => {
    Job.findOne.mockResolvedValue({ id: "job123", userId: "otherUser" });

    await updateJob(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: "Not authorized" });
  });

  test("should update job and return 200 on success", async () => {
    Job.findOne.mockResolvedValue({ id: "job123", userId: "user123" });
    Job.findOneAndUpdate.mockResolvedValue({
      id: "job123",
      userId: "user123",
      title: "Updated Title",
    });

    await updateJob(req, res);

    expect(Job.findOneAndUpdate).toHaveBeenCalledWith(
      { id: "job123", userId: "user123" },
      { title: "Updated Title" },
      { new: true }
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: "Job updated successfully" });
  });

  test("should return 500 if database query fails", async () => {
    Job.findOne.mockRejectedValue(new Error("DB error"));

    await updateJob(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: "Server error while updating job",
    });
  });
});

// deleteJob 
describe("deleteJob Controller", () => {

  let req,res

  beforeEach(() => {
    jest.clearAllMocks();

     req =  {
    user: {id : 'user123'}
  }
  res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis()
  }



  })

 

// Test 1
test("should return 404 if job not found", async () => {
  req = {
    user: { id: "user123" },
    params: { jobId: "job123" },
  };

  Job.findOne.mockResolvedValue(null);

  await deleteJob(req, res);

  expect(Job.findOne).toHaveBeenCalledWith({ id: "job123" });
  expect(res.status).toHaveBeenCalledWith(404);
  expect(res.json).toHaveBeenCalledWith({ message: "Job not found" });
});



// Test 2
test("should return 401 if user is not authorized to delete job", async () => {
  req = {
    user: { id: "user123" },
    params: { jobId: "job123" },
  };

  const fakeJob = { id: "job123", userId: "anotherUser" };
  Job.findOne.mockResolvedValue(fakeJob);

  await deleteJob(req, res);

  expect(Job.findOne).toHaveBeenCalledWith({ id: "job123" });
  expect(res.status).toHaveBeenCalledWith(401);
  expect(res.json).toHaveBeenCalledWith({ message: "Not authorized" });
});

// Test 3
test("should delete job and clear cache if cache exists", async () => {
  req = {
    user: { id: "user123" },
    params: { jobId: "job123" },
  };

  const fakeJob = {
    id: "job123",
    userId: "user123",
    deleteOne: jest.fn().mockResolvedValue(true),
  };

  Job.findOne.mockResolvedValue(fakeJob);
  getCache.mockResolvedValue("cached data");
  deleteCache.mockResolvedValue(true);

  await deleteJob(req, res);

  expect(Job.findOne).toHaveBeenCalledWith({ id: "job123" });
  expect(getCache).toHaveBeenCalledWith("jobsuser123"); 
  expect(deleteCache).toHaveBeenCalledWith("jobsuser123");
  expect(fakeJob.deleteOne).toHaveBeenCalled();
  expect(res.status).toHaveBeenCalledWith(204);
});


// Test 4
test("should return 500 if database query fails", async () => {
  req = { 
    user: { id: "user123" }, 
    params: { jobId: "job123" } 
  };


  Job.findOne.mockRejectedValue(new Error("DB error"));
  getCache.mockResolvedValue(null); 
  deleteCache.mockResolvedValue(null);

  await deleteJob(req, res);


  expect(Job.findOne).toHaveBeenCalledWith({ id: "job123" });
  expect(res.status).toHaveBeenCalledWith(500);
  expect(res.json).toHaveBeenCalledWith({
    message: "Server error while deleting job",
  });
});



})







