import express from 'express';
import router from './routes/jobs.js';

console.log('Routes in jobs router:');
router.stack.forEach((layer) => {
  if (layer.route) {
    console.log(Object.keys(layer.route.methods).join(', ').toUpperCase(), layer.route.path);
  }
});
