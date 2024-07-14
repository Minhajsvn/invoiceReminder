require('dotenv').config();
const express = require('express');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const session = require('express-session');



const app = express();
app.use(express.json());
app.use(session({ secret: 'secret', resave: false, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());

// Configure Google OAuth strategy
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.CALLBACK_URL
},
function(accessToken, refreshToken, profile, cb) {
    // Here you would normally save the user to your database
    return cb(null, { profile: profile, accessToken: accessToken });
}
));


passport.serializeUser(function(user, done) {
    done(null, user);
});

passport.deserializeUser(function(user, done) {
    done(null, user);
});


// Google OAuth endpoints
app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
app.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/login' }), (req, res) => {
  res.redirect(process.env.FRONTEND_URL);  // Redirect to the frontend after login
});

// API to get invoice details (mock data)
app.get('/api/invoices', (req, res) => {
    if (!req.isAuthenticated()) {
        return res.status(401).send({ error: 'You need to log in' });
    }
    // Example invoice data
res.json([{ id: 1, amount: 1000, dueDate: '2024-07-31', recipient: 'Customer1' }]);
});

async function sendInvoiceToZapier(invoice) {
    const zapierWebhookURL = process.env.ZAPIER_WEBHOOK_URL;
    try {
        const response = await axios.post(zapierWebhookURL, invoice);
        console.log(`Zapier response: ${response.status}`);
    } catch (error) {
        console.error(`Error sending data to Zapier: ${error}`);
    }
}

app.get('/api/check-invoices', async (req, res) => {
    if (!req.isAuthenticated()) {
        return res.status(401).send('You need to log in');
    }

    //by checking for a particular condition, like "retrive a list of unpaid invoices, we retrived some invoices records from DB"
    const invoices = [
        { id: 1, amount: 7500, dueDate: '2024-07-31', recipient: 'Customer1' },
        { id: 2, amount: 9000, dueDate: '2024-08-01', recipient: 'Customer2' },
    ];

    const now = new Date();

    for (const invoice of invoices) {
        const dueDate = new Date(invoice.dueDate);
        //if invoice is unpaid till today's date, then we need to use zapier to send a reminder to the client, so that he can pay us back
        if (dueDate < now) {
            await sendInvoiceToZapier(invoice);
        }
    }

    res.send('Checked invoices for past due.');
});


// Starting the server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));