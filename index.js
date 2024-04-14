require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const session = require('express-session');
const app = express();
const port = 3000;

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
const UserSchema = new mongoose.Schema({
    username: String,
    password: String
});
const User = mongoose.model('User', UserSchema);

app.use(express.urlencoded({ extended: true }));
app.use(session({
    secret: 'supersecret',
    resave: false,
    saveUninitialized: false
}));

app.get('/register', (req, res) => {
    res.send('<form action="/register" method="post">Username: <input type="text" name="username"/><br>Password: <input type="password" name="password"/><br><button type="submit">Submit</button></form>');
});

app.post('/register', async (req, res) => {
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        const user = new User({
            username: req.body.username,
            password: hashedPassword
        });
        await user.save();
        res.redirect('/login');
    } catch {
        res.redirect('/register');
    }
});

app.get('/login', (req, res) => {
    res.send('<form action="/login" method="post">Username: <input type="text" name="username"/><br>Password: <input type="password" name="password"/><br><button type="submit">Login</button></form>');
});

app.post('/login', async (req, res) => {
    const user = await User.findOne({ username: req.body.username });
    if (user && await bcrypt.compare(req.body.password, user.password)) {
        req.session.userId = user._id;
        res.redirect('/dashboard');
    } else {
        res.send('Login failed');
    }
});

app.get('/dashboard', (req, res) => {
    if (!req.session.userId) {
        return res.redirect('/login');
    }
    res.send('Welcome to your dashboard!');
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
