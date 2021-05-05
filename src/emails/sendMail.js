const sgMail = require('@sendgrid/mail');
const env = require('../../src/env');
sgMail.setApiKey(env.MAIL_API_KEY);



 module.exports.sendMail =(res,req,next)=>{

   
     try { 
      sgMail
       .send({
         to: req.body.email,
         from: env.EMAIL,
         subject: 'Welcome to Last Drop',
         text: `${req.body.first_name} ${req.body.last_name}`,
         html: '<strong>hello from last drop</strong>'
      })}
  catch { 
  { res.send(err)
   } 
} 
next()
}