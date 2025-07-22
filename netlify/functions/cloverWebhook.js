exports.handler = async (event) => {
  const payload = JSON.parse(event.body);

  if (payload?.verificationCode) {
    return {
      statusCode: 200,
      body: payload.verificationCode,
    };
  }

  console.log("📦 Incoming Clover Webhook:", payload);

  return {
    statusCode: 200,
    body: "Received!",
  };
};
