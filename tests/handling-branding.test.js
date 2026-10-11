import test from "node:test";
import assert from "node:assert/strict";
import { createDraftApi } from "../src/lib/draft-store.js";
import {
  withHandlingTime,
  handlingTime,
  handlingTimeText,
} from "../src/lib/handling-time.js";
import { validateProduct } from "../src/lib/commerce-validation.js";
import { brandProduct, brandSettings } from "../src/lib/branding.js";
import { productCard, wordmark } from "../src/ui.js";

test("handling time persists through create, reload, edit and removal without losing specifications", async () => {
  const data = new Map();
  const storage = {
    getItem: (key) => data.get(key),
    setItem: (key, value) => data.set(key, value),
  };
  const api = createDraftApi(storage);
  const otherSpecs = [{ label: "Material", value: "Cotton" }];
  const specs = withHandlingTime(otherSpecs, "1", "3");
  validateProduct({ specs });
  const created = await api.createProduct({
    title: "Core Tee",
    category: "tshirts",
    price: 25,
    stock_quantity: 2,
    sizes: ["M"],
    specs,
  });
  const reloaded = (await createDraftApi(storage).fetchProducts())[0];
  assert.deepEqual(handlingTime(reloaded), { min: 1, max: 3 });
  assert.match(productCard(reloaded, String), /1–3 business days/);
  assert.equal(reloaded.specs[1].value, "1–3 business days before dispatch");
  await api.updateProduct(created.id, {
    specs: withHandlingTime(reloaded.specs, "0", "0"),
  });
  assert.equal(
    handlingTimeText((await api.fetchProducts())[0]),
    "Same business day",
  );
  await api.updateProduct(created.id, {
    specs: withHandlingTime(reloaded.specs, "", ""),
  });
  assert.deepEqual((await api.fetchProducts())[0].specs, otherSpecs);
  assert.equal(handlingTimeText((await api.fetchProducts())[0]), "");
});

test("handling time rejects partial, fractional, negative and reversed ranges", () => {
  for (const [min, max] of [
    ["", "3"],
    ["1", ""],
    ["-1", "3"],
    ["1.5", "3"],
    ["4", "3"],
    ["0", "366"],
    ["bad", "3"],
  ])
    assert.throws(() => withHandlingTime([], min, max), /handling-time range/);
  assert.equal(
    handlingTimeText({ specs: withHandlingTime([], "1", "1") }),
    "1 business day",
  );
  const valid = withHandlingTime([], "2", "5");
  assert.throws(
    () => validateProduct({ specs: [...valid, ...valid] }),
    /one valid handling/,
  );
  assert.throws(
    () => validateProduct({ specs: [{ ...valid[0], min_days: 6 }] }),
    /one valid handling/,
  );
});

test("legacy displayed branding is corrected without changing product IDs or contact and image URLs", () => {
  const original = {
    id: "gnz-original-id",
    title: "GNZSPORTS Tee",
    description: "The GNZ standard",
    image: "/gnz/photo.jpg",
    specs: [{ label: "Brand", value: "gnzsports" }],
  };
  const corrected = brandProduct(original);
  assert.equal(corrected.title, "GZNSPORTS Tee");
  assert.equal(corrected.description, "The GZN standard");
  assert.equal(corrected.id, original.id);
  assert.equal(corrected.image, original.image);
  assert.equal(corrected.specs[0].value, "GZNSPORTS");
  assert.equal(original.title, "GNZSPORTS Tee");
  const settings = brandSettings({
    page_content: {
      story_title: "GNZSPORTS",
      contact_email: "info@gnzsports.example",
      hero_image: "/gnz/image.jpg",
    },
    announcements: { banner_text: "The GNZ standard" },
  });
  assert.equal(settings.page_content.story_title, "GZNSPORTS");
  assert.equal(settings.page_content.contact_email, "info@gnzsports.example");
  assert.equal(settings.page_content.hero_image, "/gnz/image.jpg");
  assert.equal(settings.announcements.banner_text, "The GZN standard");
  assert.match(wordmark, />GZN<span/);
});
