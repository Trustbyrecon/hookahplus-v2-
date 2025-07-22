exports.handler = async (event) => {
  const payload = JSON.parse(event.body);

  if (payload?.verificationCode) {
    return {
      statusCode: 200,
      body: payload.verificationCode,
    };
  }

  const reflexLog = {
    source: "clover",
    eventType: payload.type || "unknown",
    receivedAt: new Date().toISOString(),
    sessionId: payload.object?.id || null,
    trustScore: 87, // can be dynamically adjusted later
    raw: payload,
  };

  console.log("🧠 Reflex Log Entry:", JSON.stringify(reflexLog));

  return {
    statusCode: 200,
    body: "Received",
  };
};
