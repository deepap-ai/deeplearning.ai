const http = require('http');

const data = JSON.stringify({
  name: "Alex Test",
  headline: "Engineer",
  github_url: "",
  hackerrank_url: "",
  linkedin_url: "",
  education: "",
  resume_text: "",
  transcript_text: ""
});

const req = http.request({
  hostname: 'localhost',
  port: 8000,
  path: '/api/build',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
}, res => {
  let output = '';
  res.on('data', d => output += d);
  res.on('end', () => console.log('Response:', output));
});

req.on('error', error => console.error(error));
req.write(data);
req.end();
