const express = require("express");
const router = express.Router();
const passport = require("passport");
const { User } = require("../models");
const bcrypt = require("bcrypt");
const { isLoggedIn, isNotLoggedIn } = require("../middlewares/auth");

router.post("/join", isNotLoggedIn, async (req, res) => {
  const { email, name, password } = req.body;
  try {
    const exUser = await User.findOne({ where: { email } });
    if (exUser) {
      return res.status(400).json("이미 등록된 이메일 입니다.");
    }
    const hash = await bcrypt.hash(password, 12);
    // 보안: 신규 회원은 권한 상승(Privilege Escalation) 방지를 위해 기본 USER 권한으로만 생성
    await User.create({ email, name, password: hash, role: "USER" });
    return res.status(200).json("join_ok");
  } catch (e) {
    return res.status(400).json(e.message);
  }
});

router.post("/login", isNotLoggedIn, async (req, res) => {
  passport.authenticate("local", (authError, user, info) => {
    try {
      if (authError) {
        throw new Error(authError);
      }
      if (!user) {
        throw new Error(info.message);
      }
      return req.login(user, (loginError) => {
        if (loginError) {
          throw new Error(loginError);
        } else {
          return res.status(200).json("login_ok");
        }
      });
    } catch (e) {
      return res.status(400).json(e.message);
    }
  })(req, res);
});

router.get("/check", isLoggedIn, async (req, res) => {
  try {
    const { id, name, role, email } = req.user;
    return res.status(200).json({ id, name, role, email });
  } catch (e) {
    return res.status(400).json(e.message);
  }
});

router.post("/logout", isLoggedIn, async (req, res) => {
  try {
    return req.logout((e) => {
      if (e) {
        return;
      }
      req.session.destroy();
      return res.send("logout_ok");
    });
  } catch (e) {
    console.error(e);
  }
});
module.exports = router;
