const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcrypt");
const { User } = require("../models");
module.exports = () => {
  passport.use(
    new LocalStrategy(
      { usernameField: "email", passwordField: "password" },
      async (email, password, done) => {
        try {
          const exUser = await User.findOne({ where: { email } });
          // console.log("exUser", exUser);
          if (exUser) {
            const result = await bcrypt.compare(password, exUser.password);
            if (result) {
              done(null, exUser);
            } else {
              done(null, false, { message: "비밀번호 오류 입니다." });
            }
          } else {
            done(null, false, { message: "등록되지 않은 이메일 입니다." });
          }
        } catch (e) {
          done(e);
        }
      }
    )
  );
};
