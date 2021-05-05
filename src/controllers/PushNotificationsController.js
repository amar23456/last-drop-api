const { Expo } = require('expo-server-sdk');
const User = require('../models/UserModel');

exports.InventoryStatusNotifications = (req, res) => {
  // Get request user data
  const expo = new Expo();
  const messages = [];
  messages.push({
    to: 'ExponentPushToken[yd7ufmLx5sbS64mOKCj3Pt]',
    sound: 'default',
    body: 'This is a test notification',
    data: { withSome: 'data' },
  });

  const chunks = expo.chunkPushNotifications(messages);
  const tickets = [];
  (async () => {
    for (const chunk of chunks) {
      try {
        const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
        console.log(ticketChunk);
        tickets.push(...ticketChunk);
      } catch (error) {
        console.error(error);
      }
    }
  })();
  res.send(200);
};

// Stores the push notifications token to the db for further reference
exports.tokenStorage = (req, res) => {
  const user_Id = req.user._id;
  const { token } = req.body.token;
  console.log(user_Id, token);
  User.findById(user_Id)
    .then((user) => {
      user.pushToken = token;
      return user.save();
    })
    .then((result) => {
      console.log(result);
      res.status(201).send('Success, Token saved');
    })
    .catch((err) => {
      // return res.status(500).send(err.message)
      console.log(err);
    });
};
