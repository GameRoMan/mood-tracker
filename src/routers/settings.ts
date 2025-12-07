import { DEFAULT_COLORS, DEFAULT_MOODS, OAUTH_SCOPES } from "~/lib/constants";
import { exec$, fetch$ } from "~/lib/db";
import { getAuth } from "./auth";

import { Elysia } from "elysia";

export const router = new Elysia({ prefix: "/settings" });

export const SETTING_CATEGORIES = {
  account: "Account",
  customization: "Customization",
  privacy: "Privacy",
};

router.use(getAuth(true));
router.use((req, res, next) => {
  res.locals.categories = SETTING_CATEGORIES;
  res.locals.user = {
    ...req.user,
    custom_labels:
      req.user.custom_labels.length > 0
        ? req.user.custom_labels
        : DEFAULT_MOODS,
    custom_colors:
      req.user.custom_colors.length > 0
        ? req.user.custom_colors.map(
            (x) => `#${x.toString(16).padStart(6, "0")}`,
          )
        : DEFAULT_COLORS,
    custom_font_size: req.user.custom_font_size || 1.2,
  };

  next();
});

router.get("/api/app/:id/url_generator", async (req, res, next) => {
  const app = await fetch$("select * from apps where id=$1 and owner_id=$2", [
    req.params.id,
    req.user.id,
  ]);

  if (!app) return next();

  res.render("pages/settings", {
    category: "api",
    file: "api/app_url_generator",
    scopes: OAUTH_SCOPES,
    app,
  });
});

router.get("/api", async (req, res, next) => {
  const apps = await exec$("select id, name from apps where owner_id=$1", [
    req.user.id,
  ]);

  const auths = await exec$(
    "select id, app_id, scopes from authorized_apps where user_id=$1",
    [req.user.id],
  );

  const authedApps = await exec$("select id, name from apps where id=any($1)", [
    auths.map((x) => x.app_id),
  ]);

  res.locals.apps = apps;
  res.locals.scopes = OAUTH_SCOPES;
  res.locals.auths = auths.map((auth) => ({
    ...auth,
    name: authedApps.find((x) => x.id == auth.app_id).name,
  }));

  next();
});

router.get("/:category?", (req, res, next) => {
  const category = req.params.category || "account";

  // need to check for string because javascript moment (__proto__)
  if (typeof SETTING_CATEGORIES[category] != "string") return next();

  res.render("pages/settings", {
    category,
  });
});
