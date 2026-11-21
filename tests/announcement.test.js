import test from 'node:test';
import assert from 'node:assert/strict';
import { announcementMessages } from '../src/announcement.js';

test('announcement repeats configured sale text safely and hides the duplicate from screen readers', () => {
  const html = announcementMessages({banner_text: 'SALE <20%> & more', shipping_text: ''});
  assert.equal(html.split('SALE &lt;20%&gt; &amp; more').length - 1, 2);
  assert.equal(html.split('class="announcement-group" aria-hidden="true"').length - 1, 1);
  assert.ok(!html.includes('SHIPPING DETAILS'));
  assert.ok(!html.includes('<20%>'));
  assert.match(announcementMessages(), /BUILT FOR THE MOMENT/);
  assert.ok(!announcementMessages({banner_text: null, shipping_text: null}).includes('null'));
});
