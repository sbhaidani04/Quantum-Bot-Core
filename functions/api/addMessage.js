const functions = require("firebase-functions");
const admin = require("firebase-admin");
// const {DataSnapshot} = require("firebase-functions/v1/database");
const {logger} = functions;

exports.addMessage = functions.https.onCall(async (data, context) =>{
  try {
    logger.logger("Received message request data:", data);

    // validate required fields
    if (!data.text || !data.userId) {
      logger.logger("Required fields (text or userId) are missing");
      throw new functions.https.HttpsError(
          "invalid-argument",
          "Required fields (text or userId) are missing",
      );
    }

    const {text, userId} = data;

    // construct message data
    const messageData = {
      text,
      userId,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    };

    // add message to the user's message subcollection in Firestore
    const messageRef = await admin
        .firestore()
        .collection("chats")
        .doc(userId)
        .collection("messages")
        .add(messageData);

    logger.log("Message added successfully, message ID: ", messageRef.id);

    // return success status and message ID
    return {
      status: "success",
      messageId: messageRef.id,
    };
  } catch (error) {
    logger.error("Error adding message:", error);
    // throw a structured error for the client
    throw new functions.https.HttpsError(
        "unknown",
        "An error occurred while adding the message",
        error.message,
    );
  }
});
