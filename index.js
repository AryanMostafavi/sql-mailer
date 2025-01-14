const express = require('express');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const mysql = require('mysql2/promise');
const app = express();
const PORT = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.send(`
    <style>
      body {
        font-family: Arial, sans-serif;
        background-color: #f4f4f9;
        margin: 0;
        padding: 20px;
        display: flex;
        justify-content: center;
        align-items: flex-start;
        height: 100vh;
        overflow-y: auto;
      }
      form {
        background: #fff;
        border-radius: 8px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        padding: 20px;
        width: 100%;
        max-width: 500px;
        margin-top: 20px;
      }
      h2 {
        color: #333;
        margin-bottom: 10px;
      }
      label {
        display: block;
        margin-bottom: 10px;
        color: #555;
      }
      input, textarea, button {
        width: 100%;
        padding: 10px;
        margin-bottom: 15px;
        border: 1px solid #ddd;
        border-radius: 4px;
        font-size: 16px;
      }
      button {
        background-color: #007BFF;
        color: #fff;
        border: none;
        cursor: pointer;
      }
      button:hover {
        background-color: #0056b3;
      }
    </style>
    <form method="POST" action="/execute">
          <h2>eshghe man aqa amir</h2>

      <h2>Database Connection</h2>
      <label>Host: <input type="text" name="host" placeholder="Enter database host" required></label>
      <label>User: <input type="text" name="user" placeholder="Enter database user" required></label>
      <label>Password: <input type="password" name="password" placeholder="Enter database password"></label>
      <label>Database: <input type="text" name="database" placeholder="Enter database name" required></label>
      <h2>Query</h2>
      <textarea name="query" rows="5" placeholder="Write your SQL query here" required></textarea>
      <h2>SMTP Settings</h2>
      <label>SMTP Host: <input type="text" name="smtpHost" placeholder="Enter SMTP host" required></label>
      <label>SMTP Port: <input type="number" name="smtpPort" placeholder="Enter SMTP port" required></label>
      <label>Email: <input type="email" name="email" placeholder="Enter your email" required></label>
      <label>Password: <input type="password" name="emailPassword" placeholder="Enter your email password" required></label>
      <label>Recipient Email: <input type="email" name="recipientEmail" placeholder="Enter recipient email" required></label>
      <button type="submit">Execute</button>
    </form>
  `);
});

app.post('/execute', async (req, res) => {
  const { host, user, password, database, query, smtpHost, smtpPort, email, emailPassword, recipientEmail } = req.body;

  try {
    const connection = await mysql.createConnection({ host, user, password, database });
    const [results] = await connection.execute(query);
    await connection.end();

    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: { user: email, pass: emailPassword }
    });

    const mailOptions = {
      from: email,
      to: recipientEmail,
      subject: 'Query Results',
      text: JSON.stringify(results, null, 2)
    };

    await transporter.sendMail(mailOptions);
    res.send('Query executed and results emailed successfully.');
  } catch (error) {
    res.status(500).send(`Error: ${error.message}`);
  }
});

app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
