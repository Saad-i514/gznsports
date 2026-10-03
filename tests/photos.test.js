import test from "node:test";
import assert from "node:assert/strict";
import { migrateDraftPhotos } from "../src/lib/photo-migration.js";
test("photo update replaces old defaults but preserves product edits, custom images and orders", () => {
  const draft = {
    products: [
      {
        id: "a",
        title: "My edited title",
        price: 42,
        image: "/images/samples/tracksuits.svg",
      },
      { id: "b", image: "https://example.com/my-photo.jpg" },
    ],
    settings: {
      page_content: {
        hoodies_image: "/images/samples/hoodies.svg",
        hero_image: "/images/hoodies/genz-heavyweight-hoodie.webp",
        story_body: "My story",
      },
    },
    orders: [{ id: "order-1" }],
  };
  migrateDraftPhotos(draft);
  assert.equal(draft.products[0].image, "/images/photos/tracksuits.jpg");
  assert.equal(draft.products[0].title, "My edited title");
  assert.equal(draft.products[0].price, 42);
  assert.equal(draft.products[1].image, "https://example.com/my-photo.jpg");
  assert.equal(
    draft.settings.page_content.hero_image,
    "/images/photos/hoodies.jpg",
  );
  assert.equal(draft.settings.page_content.story_body, "My story");
  assert.equal(draft.orders[0].id, "order-1");
  const result = structuredClone(draft);
  assert.deepEqual(migrateDraftPhotos(draft), result);
});
