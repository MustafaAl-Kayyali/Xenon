const http = require('http');

const data = JSON.stringify({
    name: 'admin Azzam',
    email: 'Alwaraqiazzam556@gmail.com', 
    password: 'Password@123',
    passwordConfirm: 'Password@123',
    mobileNumber: '0779108715',
    adminSecretKey: 'admin98backend',
    role: 'admin'
});

const options = {
    hostname: 'localhost',
    port: 3005,
    path: '/api/v1/admin/auth/register',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
    }
};

const req = http.request(options, res => {
    let responseBody = '';
    res.on('data', chunk => responseBody += chunk);
    res.on('end', () => console.log(res.statusCode, responseBody));
});

req.on('error', error => console.error(error));
req.write(data);
req.end();
