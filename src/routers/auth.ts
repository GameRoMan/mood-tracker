import config from "../../config.json" assert { type: "json" };

import { exec$, fetch$ } from "~/lib/db";
import { randomBytes } from "node:crypto";
import bcrypt from "bcrypt";

import { Elysia } from "elysia";
import * as z from "zod";

export const authPlugin = new Elysia({ name: "auth" })
  .macro({
    user: {
      async resolve({ cookie }) {
        if (!cookie.token?.value) return { user: null };
        const user = await fetch$("select * from users where token=$1", [cookie.token.value]);
        return { user };
      },
    },
  })
  .macro("auth", {
    user: true,
    beforeHandle({ redirect, user }) {
      if (!user) {
        return redirect("/auth/login");
      }
      if (user?.changepass) {
        return redirect("/auth/changepass");
      }
      return;
    },
  });

export const router = new Elysia({ prefix: "/auth" })
  .use(authPlugin)
  .post("/logout", ({ cookie: { token }, redirect }) => {
    token?.remove();
    return redirect("/");
  })
  .post(
    "/login",
    async ({ redirect, cookie: { token }, body }) => {
      const user = await fetch$("select * from users where username=$1", [body.username]);

      if (!user || !(await bcrypt.compare(body.password, user.password_hash))) {
        return res.status(403).render("pages/auth/login", {
          error: "Invalid username or password",
        });
      }

      token?.set({ value: user.token, maxAge: 365 * 24 * 3600 * 1000 });

      return redirect("/");
    },
    { body: z.object({ username: z.string(), password: z.string() }) },
  )
  .post("/register", async ({ redirect }) => {
    if (typeof req.body.username != "string" || typeof req.body.password != "string") {
      return res.status(400).send("Bad Request");
    }

    if (!req.body.username.match(/^[a-z0-9_-]{3,32}$/)) {
      return res.status(400).render("pages/auth/register", {
        error: "Username validation failed",
      });
    }

    if (config.blacklisted_usernames.includes(req.body.username)) {
      return res.status(400).render("pages/auth/register", {
        error: "You cannot use that username",
      });
    }

    if (await fetch$("select 1 from users where username=$1", [req.body.username])) {
      return res.status(409).render("pages/auth/register", {
        error: "Username taken",
      });
    }

    const hash = await bcrypt.hash(req.body.password, 10);
    const token = randomBytes(48).toString("base64url");

    await exec$("insert into users values (default, $1, $2, $3, $4)", [
      req.body.username,
      hash,
      token,
      Date.now(),
    ]);

    res.cookie("token", token, { maxAge: 365 * 24 * 3600 * 1000 });
    return redirect("/");
  })
  .post("/changepass", async ({ redirect }) => {
    if (typeof req.body.oldpass != "string" || typeof req.body.newpass != "string") {
      return res.status(400).send("Bad Request");
    }

    if (req.body.newpass != req.body.newpassconfirm) {
      return res.render("pages/auth/changepass", {
        error: "New password confirmation does not match",
      });
    }

    const user = await fetch$("select * from users where token=$1", [req.cookies.token]);
    if (!user) {
      return res.status(401).send("Unauthorized");
    }

    const hash = await bcrypt.hash(req.body.newpass, 10);
    const token = randomBytes(48).toString("base64url");

    await exec$("update users set token=$1, password_hash=$2, changepass=false where id=$3", [
      token,
      hash,
      user.id,
    ]);

    res.cookie("token", token, { maxAge: 365 * 24 * 3600 * 1000 });
    return redirect("/");
  });
