# Hướng dẫn triển khai Web Vote Du Lịch Tháng 7/2026

## Tổng quan

Web bình chọn ngày du lịch, dữ liệu lưu tập trung trên **Google Sheets**.  
Mỗi người đăng nhập bằng username, chọn trạng thái cho từng ngày (Sẵn sàng / Có thể đi / Không thể).

---

## Bước 1: Tạo Google Sheet

1. Vào https://sheets.google.com
2. Tạo Spreadsheet mới (trống), đặt tên tùy ý (VD: `Du Lịch 2026`)
3. **Để nguyên trang này đang mở** – sang bước 2

---

## Bước 2: Tạo Apps Script

1. Trong Google Sheet đang mở, vào menu: **Extensions → Apps Script**
2. Tab mới mở ra, xóa toàn bộ code mặc định
3. **Paste toàn bộ nội dung** từ file `apps-script.gs` vào
4. Nhấn **Ctrl+S** để lưu
5. Đặt tên project (VD: `VoteAPI`)

---

## Bước 3: Deploy Web App

1. Trong Apps Script, nhấn nút **Deploy → New deployment**
2. Chọn loại: ⚙️ **Web app**
3. Cấu hình:
   - **Description:** `Vote API`
   - **Execute as:** `Me` (chính tài khoản của bạn)
   - **Who has access:** `Anyone` (ai cũng truy cập được)
4. Nhấn **Deploy**
5. **Copy URL** hiện ra (dạng: `https://script.google.com/macros/s/.../exec`)

---

## Bước 4: Deploy Web Vote lên Internet (dùng chung cho mọi người)

### Cách A: Deploy lên Vercel (khuyên dùng)

1. Vào https://vercel.com → Sign up bằng GitHub/Google
2. Import repository hoặc dùng **Vercel CLI**:
   ```
   npm i -g vercel
   cd vote-app
   vercel
   ```
3. Sau khi deploy, bạn có 1 URL dạng `https://xxx.vercel.app`
4. **Vào `vote-app/index.html`** → tìm dòng `DEFAULT_API` gần cuối → thay URL API (nếu cần)
5. Chia sẻ link Vercel cho mọi người cùng bình chọn

### Cách B: Chạy local (test nhanh)

```
python -m http.server 8080
```
Sau đó mở `http://localhost:8080/vote.html`

> ⚠️ Không mở file HTML trực tiếp từ `file://` — sẽ bị lỗi CORS khi gọi API.

---

## Bước 5: Đăng nhập và bình chọn

1. Trang hỏi tên đăng nhập → nhập username (chữ thường, không dấu, viết liền)
2. VD: `Nguyễn Thanh Hải` → nhập `nguyenthanhhai`
3. Click vào từng ngày → chọn 🟢 Sẵn sàng / 🟡 Có thể đi / 🔴 Không thể
4. Kết quả hiển thị real-time cho tất cả mọi người

---

## Cấu trúc dữ liệu

- Sheet `Votes` tự động tạo trong Google Sheet của bạn
- Cột: `Timestamp | UserName | Date | Status`
- Status: `green` | `yellow` | `red`

---

## Lưu ý

- **Mỗi lần deploy lại** Apps Script → URL mới → cần cập nhật trong web (nhấn ⚙️ góc trên phải)
- Tất cả mọi người dùng **chung 1 Google Sheet** (dữ liệu tập trung)
- Muốn xem dữ liệu thô → mở trực tiếp Google Sheet
- Web tự động refresh kết quả mỗi 30 giây
