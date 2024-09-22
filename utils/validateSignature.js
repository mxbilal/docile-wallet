exports.validatePaymentSignature = ({order_id, payment_id}, signature, secret) => {
  const generated_signature = hmac_sha256(order_id + "|" + razorpay_payment_id, secret);

  if (generated_signature == razorpay_signature) {
    return true
  } else return false
}