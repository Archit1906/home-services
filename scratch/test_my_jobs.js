

async function test() {
  try {
    const loginRes = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'homeowner1@example.com', password: 'password123' })
    });
    const loginData = await loginRes.json();
    const token = loginData.token;
    console.log('Login token:', token);

    const jobsRes = await fetch('http://localhost:5000/api/jobs/my-jobs', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    console.log('Status code:', jobsRes.status);
    const jobsData = await jobsRes.json();
    console.log('Jobs data response:', jobsData);
  } catch (err) {
    console.error('Test error:', err);
  }
}

test();
