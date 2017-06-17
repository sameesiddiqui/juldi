var stripe = Stripe('pk_test_AQ2Qf9lnT83wqSTYUuUqZARt')
var elements = stripe.elements()

var inputStyle = {
  base: {
    iconColor: '#666EE8',
    color: '#31325F',
    lineHeight: '40px',
    fontWeight: 300,
    fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
    fontSize: '15px',

    '::placeholder': {
      color: '#BBB'
    }
  }
}

var cardNum = elements.create('cardNumber', {
  style: inputStyle
})

var cardExp = elements.create('cardExpiry', {
  style: inputStyle
})

var cardCvc = elements.create('cardCvc', {
  style: inputStyle
})

cardNum.mount('#cardnum-element')
cardExp.mount('#cardexp-element')
cardCvc.mount('#cardcvc-element')

function passPrice (passType) {
  document.getElementById('payment-form').action = '/order/' + passType
  var purchaseButton = document.getElementById('pass-price')

  switch (passType) {
    case 'day':
      purchaseButton.innerHTML = 'Pay $14'
      $('#first-group').hide()
      break
    case 'week':
      purchaseButton.innerHTML = 'Pay $60'
      $('#first-group').hide()
      break
    case 'one-way-day':
      purchaseButton.innerHTML = 'Pay $7'
      $('#first-group').show()
      break
    case 'one-way-week':
      purchaseButton.innerHTML = 'Pay $30'
      $('#first-group').show()
      break
  }

  document.querySelector('#payment-form').addEventListener('submit', function (e) {
    e.preventDefault()
    var form = document.querySelector('#payment-form')

    var extraDetails = {
      name: form.querySelector('input[name=cardholder_name]').value,
      address_zip: form.querySelector('input[name=address_zip]').value,
      email: form.querySelector('input[name=cardholder_email]').value,
      phone: form.querySelector('input[name=phone_num]').value
    }
    if (form.querySelector('input[name=timebtn]:checked')) {
      extraDetails.timeChoice = form.querySelector('input[name=timebtn]:checked').value
    }
    console.log('extra details ' + JSON.stringify(extraDetails))

    stripe.createToken(cardNum, extraDetails).then(setOutcome)
  })
}

function setOutcome (result) {
  var successElement = document.querySelector('.success')
  var errorElement = document.querySelector('.error')
  successElement.classList.remove('visible')
  errorElement.classList.remove('visible')

  if (result.token) {
    // Use the token to create a charge or a customer
    // https://stripe.com/docs/charges
    // successElement.querySelector('.token').textContent = result.token.id
    successElement.classList.add('visible')
    // Insert the token ID into the form so it gets submitted to the server
    var form = document.getElementById('payment-form')
    var hiddenInput = document.createElement('input')
    hiddenInput.setAttribute('type', 'hidden')
    hiddenInput.setAttribute('name', 'stripeToken')
    hiddenInput.setAttribute('value', result.token.id)
    form.appendChild(hiddenInput)

    // Submit the form
    form.submit()
  } else if (result.error) {
    errorElement.textContent = result.error.message
    errorElement.classList.add('visible')
  }
}

cardNum.on('change', function (event) {
  setOutcome(event)
})
