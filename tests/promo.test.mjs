// Unit tests for the house-ad helpers: `npm test` (Node's test runner with type stripping, no extra dependencies).
import { test } from "node:test";
import assert from "node:assert/strict";
import { PROMO_DISMISS_DAYS, isDismissed, pickHeadline, promoEnabled } from "../lib/promo.ts";

const DAY = 24 * 60 * 60 * 1000;
const NOW = Date.UTC(2026, 10, 4, 12);
const copy = {
  headline: "Lounge, a free meal or a spa before you fly",
  short: "₹1,000 off your first flight",
  frustrated: "{situation} Fly instead with ₹1,000 off",
};

test("not dismissed when nothing is stored or the value is junk", () => {
  for (const v of [null, "", "abc", "0", "-5", "NaN"]) assert.equal(isDismissed(v, NOW), false, String(v));
});

test("dismissed for 30 days after closing, then shown again", () => {
  assert.equal(isDismissed(String(NOW), NOW), true);
  assert.equal(isDismissed(String(NOW - 29 * DAY), NOW), true);
  assert.equal(isDismissed(String(NOW - PROMO_DISMISS_DAYS * DAY + 1), NOW), true);
  assert.equal(isDismissed(String(NOW - PROMO_DISMISS_DAYS * DAY), NOW), false);
  assert.equal(isDismissed(String(NOW - 45 * DAY), NOW), false);
});

test("a timestamp from the future (clock change) does not hide it", () => {
  assert.equal(isDismissed(String(NOW + DAY), NOW), false);
});

test("the env switch turns the promo off only for 'off'", () => {
  assert.equal(promoEnabled(undefined), true);
  assert.equal(promoEnabled(""), true);
  assert.equal(promoEnabled("on"), true);
  assert.equal(promoEnabled("off"), false);
  assert.equal(promoEnabled(" OFF "), false);
});

test("the bar always uses the short headline", () => {
  assert.equal(pickHeadline(copy, "bar"), copy.short);
  assert.equal(pickHeadline(copy, "bar", "Waitlist stuck?"), copy.short);
});

test("the card uses the default headline unless the page marks a frustrated outcome", () => {
  assert.equal(pickHeadline(copy, "card"), copy.headline);
  assert.equal(pickHeadline(copy, "card", null), copy.headline);
  assert.equal(pickHeadline(copy, "card", "   "), copy.headline);
  assert.equal(pickHeadline(copy, "card", "Ropeway not open yet?"), "Ropeway not open yet? Fly instead with ₹1,000 off");
});
