// Chạy tự động trên Netlify mỗi lần web cập nhật (kể cả khi đăng bài từ /admin).
// Ghi sẵn nội dung "Sự kiện tiêu biểu", "Hình ảnh hiện trường" và "Đánh giá" vào index.html
// để Google và các công cụ không chạy JavaScript vẫn đọc được. Không cần sửa file này.
const fs = require('fs');
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const load = f => { try { return JSON.parse(fs.readFileSync(f, 'utf8')).items || []; } catch (e) { console.warn('Bỏ qua', f, e.message); return []; } };
const byDate = (a, b) => String(a.date || '').trim().localeCompare(String(b.date || '').trim());

const highlights = load('data/highlights.json').sort(byDate).map(it =>
  '<li><span class="d">' + esc(it.date) + '</span><span>' + esc(it.title_vi) + '</span>' +
  '<span class="ja" lang="ja">' + esc(it.title_ja) + (it.role_ja ? ' ── ' + esc(it.role_ja) : '') + '</span></li>').join('');

const gallery = load('data/gallery.json').sort(byDate).reverse().map(it =>
  '<figure><img src="' + esc(it.image) + '" alt="' + esc(it.caption_vi) + '" loading="lazy">' +
  '<figcaption><strong>' + esc(it.date) + '</strong> ' + esc(it.caption_vi) +
  '<br><span lang="ja">' + esc(it.caption_ja) + '</span></figcaption></figure>').join('');

const testimonials = load('data/testimonials.json').map(it =>
  '<figure class="quote"><span class="mark" aria-hidden="true">“</span><blockquote lang="ja">' + esc(it.quote_ja) + '</blockquote>' +
  (it.quote_vi ? '<p class="vi">' + esc(it.quote_vi) + '</p>' : '') +
  '<figcaption><span lang="ja" style="font-weight:700;color:inherit">' + esc(it.from_ja) + '</span>' +
  (it.from_vi ? ' <span>／ ' + esc(it.from_vi) + '</span>' : '') + '</figcaption></figure>').join('');

let html = fs.readFileSync('index.html', 'utf8');
const fill = (id, tag, inner) => {
  const re = new RegExp('(<' + tag + '[^>]*id="' + id + '"[^>]*>)(</' + tag + '>)');
  if (!re.test(html)) { console.warn('Không tìm thấy #' + id); return; }
  html = html.replace(re, (m, open, close) => open + inner + close);
};
fill('timeline', 'ol', highlights);
fill('gallery', 'div', gallery);
fill('testimonials', 'div', testimonials);
fs.writeFileSync('index.html', html);
console.log('Đã ghi sẵn nội dung vào index.html');
