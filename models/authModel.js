import mongoose from "mongoose";
import crypto from "crypto";

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      trim: true,
      required: true,
      unique: true,
      lowercase: true,
    },

    name: {
      type: String,
      trim: true,
      required: true,
    },

    hashed_password: {
      type: String,
      required: true,
    },

    salt: String,

    role: {
      type: String,
      default: "Normal",
      //admin etc..
    },

    resetPasswordLink: {
      data: String,
      default: "",
    },
  },
  { timestamps: true }
);

//Virtual Password
// userSchema
//     .virtual('password')
//     .get(function(){
//         return this._password
//     })
//     .set(function (password) {
//         //use normal fq not arrow fq
//         this.password = password
//         this.salt = this.makeSalt()
//         this.hashed_password = this.encryptPassword(password)
//     })

//Method
// userSchema.method =
// {

//     //generate salt
//     makeSalt: function(){
//         return Math.round( new Date().valueOf()* Math.random()) + ''
//     },

//     //encrypt password
//     encryptPassword : function (password) {
//         if(!password) return ''
//         try
//         {
//             return crypto
//                 .createHmac('sha1',this.salt)
//                 .update(password)
//                 .digest('hex')
//         }
//         catch(err)
//         {
//             return ''
//         }
//     },

//     //Compare password
//     authenticate: function (plainPassword) {
//         return this.encryptPassword(plainPassword) === this.hashed_password
//     }
// }

export default mongoose.model("User", userSchema);
