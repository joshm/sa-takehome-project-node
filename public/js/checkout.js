const stripe = Stripe("<STRIPE_PK_KEY_HERE>");

let elements;

initialize();

document
  .querySelector("#payment-form")
  .addEventListener("submit", handleSubmit);

/**
 * Initialize the payment elements for payment collection
 */
async function initialize() {
  elements = stripe.elements({clientSecret: secret});
  const paymentElement = elements.create("payment");
  paymentElement.mount("#payment-element");
}

/**
 * Handle the payment submition.
 * This will call the confirmPayment endpoint with 
 * the collected payment details and provide the URL
 * to be called back to when the payment attempt is complete
 */
async function handleSubmit(e) {
  e.preventDefault();

  setLoading(true);

  const { error } = await stripe.confirmPayment({
    elements,
    confirmParams: {
      return_url: "http://localhost:3000/success",
    },
  });


  if (error) {
    // This point will only be reached if there is an immediate error when
    // confirming the payment. Show error to your customer (e.g., payment
    // details incomplete)
    const messageContainer = document.querySelector('#error-message');
    messageContainer.textContent = error.message;
  } else {
    // Your customer will be redirected to your `return_url`. For some payment
    // methods like iDEAL, your customer will be redirected to an intermediate
    // site first to authorize the payment, then redirected to the `return_url`.
  }

  setLoading(false);
}

// Show a spinner on payment submission
function setLoading(isLoading) {
  if (isLoading) {
    // Disable the button and show a spinner
    document.querySelector("#submit").disabled = true;
    document.querySelector("#spinner").classList.remove("hidden");
  } else {
    document.querySelector("#submit").disabled = false;
    document.querySelector("#spinner").classList.add("hidden");
  }
}
