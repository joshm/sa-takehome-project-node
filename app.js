const express = require('express');
const path = require('path');
const exphbs = require('express-handlebars');
require('dotenv').config();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

var app = express();

// view engine setup (Handlebars)
app.engine('hbs', exphbs({
  defaultLayout: 'main',
  extname: '.hbs'
}));

app.set('view engine', 'hbs');
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }))
app.use(express.json({}));

/**
 * Home route - this will render the sample store
 */
app.get('/', function(req, res) {
  res.render('index');
});

/**
 * Checkout route
 * This route will render the checkout page with payment funcationality
 * based on which item was chosen from the store
 */

app.get('/checkout', async (req, res) => {
  const item = req.query.item;
  let title, amount, error;


  switch (item) {
    case '1':
      title = "The Art of Doing Science and Engineering"
      amount = 2300
      break;
    case '2':
      title = "The Making of Prince of Persia: Journals 1985-1993"
      amount = 2500
      break;
    case '3':
      title = "Working in Public: The Making and Maintenance of Open Source"
      amount = 2800
      break;
    default:
      // Included in layout view, feel free to assign error
      error = "No item selected"
      break;
  }

  /*
  * Create a PaymentIntent object to represent your intent
  * to collect payment from the customer.
  */
  const intent = await stripe.paymentIntents.create({
    amount: amount,
    currency: 'USD',
    payment_method_types: [
      'card',
    ],
  });

  //We will use the payment intent client secret to confirm payment when the consumer makes a purchase
  res.render('checkout', { client_secret: intent.client_secret, amount: amount, title: title });
});

/**
 * Success route
 */
app.get('/success', async (req, res) => {
  const payment_intent_id = req.query.payment_intent;
  let message;

  //Retrieve the payment intent from the confirm payment call on the client side
  const intent = await stripe.paymentIntents.retrieve(payment_intent_id);

  switch (intent.status) {
    case 'succeeded':
      message = "Success! Payment Recieved."
      break;

    case 'processing':
      message = "Payment processing. We'll update you when payment is received."
      break;

    case 'requires_payment_method':
      message = 'Payment failed. Please try another payment method.';
      // Redirect your user back to your payment page to attempt collecting
      // payment again
      break;

    default:
      message = 'Something went wrong.';
      break;
  }

  res.render('success', {message: message, intent_id: intent.id, amount: intent.amount});
});

/**
 * Start server
 */
app.listen(3000, () => {
  console.log('Getting served on port 3000');
});
