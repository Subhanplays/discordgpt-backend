const { v4: uuidv4 } = require('uuid');

class JobQueue {
  constructor() {
    this.jobs = new Map();
    this.processing = false;
  }

  submit(userId, blueprint, serverId, botToken, botInfo) {
    const existingUserJob = [...this.jobs.values()].find(
      j => j.userId === userId && ['queued', 'processing'].includes(j.status)
    );
    if (existingUserJob) {
      return { error: 'You already have a job in the queue', jobId: existingUserJob.id };
    }

    const jobId = uuidv4();
    const job = {
      id: jobId,
      userId,
      blueprint,
      serverId,
      botToken,
      botInfo,
      status: 'queued',
      position: this.getQueueLength() + 1,
      progress: { step: 0, total: 0, steps: [], completed: [], message: 'Waiting in queue...' },
      result: null,
      error: null,
      createdAt: new Date().toISOString()
    };

    this.jobs.set(jobId, job);
    this.processNext();
    return { jobId, position: job.position };
  }

  getJob(jobId) {
    return this.jobs.get(jobId) || null;
  }

  getJobsByUser(userId) {
    return [...this.jobs.values()].filter(j => j.userId === userId);
  }

  getQueueLength() {
    return [...this.jobs.values()].filter(j => j.status === 'queued').length;
  }

  getActiveJob() {
    return [...this.jobs.values()].find(j => j.status === 'processing');
  }

  async processNext() {
    if (this.processing) return;

    const nextJob = [...this.jobs.values()].find(j => j.status === 'queued');
    if (!nextJob) return;

    this.processing = true;
    nextJob.status = 'processing';
    nextJob.progress.message = 'Starting bot connection...';
    if (typeof global.broadcastJobUpdate === 'function') {
      global.broadcastJobUpdate(nextJob.userId, nextJob.id, nextJob.progress);
    }

    const { createServerStructure } = require('./discord');

    try {
      const result = await createServerStructure(
        nextJob.botToken,
        nextJob.serverId,
        nextJob.blueprint,
        (progress) => {
          nextJob.progress = {
            step: progress.step,
            total: progress.total,
            steps: progress.steps || [
              'Connecting to Discord',
              'Validating permissions',
              'Creating roles',
              'Creating categories',
              'Creating channels',
              'Configuring permissions',
              'Finalizing'
            ],
            completed: progress.completed || Array.from({ length: progress.step }, (_, i) => i),
            message: progress.message
          };
          if (typeof global.broadcastJobUpdate === 'function') {
            global.broadcastJobUpdate(nextJob.userId, nextJob.id, nextJob.progress);
          }
        }
      );

      nextJob.status = 'completed';
      nextJob.result = result;
      nextJob.progress.message = 'Server created successfully!';
      nextJob.progress.step = nextJob.progress.total;
      nextJob.progress.completed = Array.from({ length: nextJob.progress.total }, (_, i) => i);
      if (typeof global.broadcastJobUpdate === 'function') {
        global.broadcastJobUpdate(nextJob.userId, nextJob.id, nextJob.progress);
      }
    } catch (error) {
      console.error('Job failed:', error);
      nextJob.status = 'failed';
      nextJob.error = error.message || 'Server creation failed';
      nextJob.progress.message = `Failed: ${error.message}`;
      if (typeof global.broadcastJobUpdate === 'function') {
        global.broadcastJobUpdate(nextJob.userId, nextJob.id, nextJob.progress);
      }
    }

    this.processing = false;
    this.processNext();
  }

  cleanup() {
    const oneHourAgo = Date.now() - 3600000;
    for (const [id, job] of this.jobs.entries()) {
      if (['completed', 'failed'].includes(job.status)) {
        const created = new Date(job.createdAt).getTime();
        if (created < oneHourAgo) {
          this.jobs.delete(id);
        }
      }
    }
  }
}

const queue = new JobQueue();

setInterval(() => queue.cleanup(), 600000);

module.exports = queue;
