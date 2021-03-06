const admin = require('firebase-admin');
const twilio = require('./twilio');

module.exports = function(req, res) {
  // return error if no phone entered
  if (!req.body.phone) {
    return res.status(422).send({ error: 'You must provide a phone number' });
  }

  // remove non-numeric characters from entered phone number
  const phone = String(req.body.phone).replace(/[^\d]/g, '');

  // find if phone number exists in firebase database
  admin
    .auth()
    .getUser(phone)
    .then(userRecord => {
      const code = Math.floor(Math.random() * 8999 + 1000);

      //send text message using twilio
      twilio.messages
        .create({
          body: `Your code is ${code}`,
          to: phone,
          from: '+12244125375'
        })
        .then(message => {
          admin
            .database()
            .ref(`users/${phone}`)
            .update({ code, codeValid: true })
            .then(() => {
              res.send({ success: true });
            });
        })
        .catch(err => {
          return res.status(422).send({ error: err });
        });
    })
    .catch(err => {
      res.status(422).send({ error: err });
    });
};
