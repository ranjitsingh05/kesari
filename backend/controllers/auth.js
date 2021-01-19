const jwt = require('jsonwebtoken');
const UserModel = require('../models/User');
const bcrypt = require('bcryptjs')
const { createJWT } = require('../utils/auth');

exports.signup = async (req, res, next) => {
    const { name, email, password, password_confirmation } = req.body;
    UserModel.findOne({email: email})
     .then(user=>{
        if(user){
           return res.status(422).json({ errors: [{ user: "email already exists" }] });
        }else {
           const user = new UserModel({
             name: name,
             email: email,
             password: password,
           });
           bcrypt.genSalt(10, function(err, salt) { bcrypt.hash(password, salt, async function(err, hash) {
           if (err) throw err;
           user.password = hash;
           await user.save()
               .then(response => {
                  res.status(200).json({
                    success: true,
                    user: response
                  })
               })
               .catch(err => {
                 res.status(500).json({
                    errors: [{ error: err }]
                 });
              });
           });
        });
       }
    }).catch(err =>{
        res.status(500).json({
          errors: [{ error: 'Something went wrong' }]
        });
    })
  }
exports.signin = async (req, res) => {
       let { email, password } = req.body;
       UserModel.findOne({ email: email }).then(user => {
         if (!user) {
           return res.status(404).json({
             errors: [{ user: "not found" }],
           });
         } else {
            bcrypt.compare(password, user.password).then(isMatch => {
               if (!isMatch) {
                return res.status(400).json({ errors: [{ password:
  "incorrect" }] 
                });
               }
         let access_token = createJWT(
           user.email,
           user._id,
           3600
         );
         jwt.verify(access_token, process.env.TOKEN_SECRET, (err,
  decoded) => {
           if (err) {
              res.status(500).json({ erros: err });
           }
           if (decoded) {
               return res.status(200).json({
                  success: true,
                  token: access_token,
                  message: user
               });
             }
           });
          }).catch(err => {
            res.status(500).json({ erros: err });
          });
        }
     }).catch(err => {
        res.status(500).json({ erros: err });
     });
  }
