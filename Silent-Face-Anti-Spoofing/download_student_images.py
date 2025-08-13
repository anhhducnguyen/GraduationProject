
# ======================= IMPORT THƯ VIỆN ============================
import os                   # Thao tác với hệ thống file và thư mục (tạo, kiểm tra, ghép đường dẫn)
import ssl                  # Cấu hình SSL/TLS cho kết nối HTTPS
import aiohttp              # HTTP client bất đồng bộ, cho phép tải nhiều link cùng lúc
import asyncio              # Quản lý event loop và chạy các hàm async
import nest_asyncio          # Cho phép asyncio chạy trong môi trường đã có event loop (vd: Jupyter Notebook)
import pandas as pd         # Thư viện phân tích dữ liệu (ở đây không dùng, có thể bỏ)
from bs4 import BeautifulSoup  # Phân tích HTML để trích xuất dữ liệu từ thẻ (vd: <a>)
from urllib.parse import urljoin # Ghép base URL với đường dẫn con thành URL đầy đủ

# ======================= CẤU HÌNH BAN ĐẦU ============================

# Kích hoạt nest_asyncio để cho phép chạy asyncio nhiều lần trong notebook
nest_asyncio.apply()

# URL gốc chứa danh sách thư mục avatar sinh viên
BASE_URL = 'https://ctsv.phenikaa-uni.edu.vn/api/v1/ctsv_pdt_storage/avatar/'

# Tạo SSL context và tắt xác minh chứng chỉ SSL
# Chỉ nên dùng khi server nội bộ hoặc cert self-signed
ssl_context = ssl.create_default_context()
ssl_context.check_hostname = False          # Không kiểm tra tên miền khớp với chứng chỉ
ssl_context.verify_mode = ssl.CERT_NONE     # Không xác thực chứng chỉ SSL

# Thư mục gốc lưu ảnh tải về
ROOT_FOLDER = "images/know_face"
os.makedirs(ROOT_FOLDER, exist_ok=True)     # Tạo thư mục nếu chưa có

# ======================= HÀM LẤY DANH SÁCH THƯ MỤC SINH VIÊN ============================
async def fetch_directories():
    """
    Gửi request tới BASE_URL để lấy danh sách thư mục (mỗi thư mục là 1 student_id).
    """
    # Mở session HTTP với cấu hình SSL đã chỉnh
    async with aiohttp.ClientSession(connector=aiohttp.TCPConnector(ssl=ssl_context)) as session:
        # Gửi request GET tới BASE_URL
        async with session.get(BASE_URL) as response:
            if response.status == 200:
                # Đọc nội dung HTML trả về
                text = await response.text()
                # Phân tích HTML để tìm thẻ <a>
                soup = BeautifulSoup(text, 'html.parser')
                # Lọc các thẻ <a> kết thúc bằng '/' → thư mục
                directories = [
                    a['href'].strip('/')          # Xoá dấu '/' ở cuối
                    for a in soup.find_all('a')   # Lấy tất cả thẻ <a>
                    if a['href'].endswith('/')    # Chỉ lấy link thư mục
                ]
                return directories
            else:
                print(f"Lỗi lấy thư mục: {response.status}")
                return []

# ======================= HÀM LẤY DANH SÁCH ẢNH TRONG MỘT THƯ MỤC ============================
async def fetch_images(session, student_id):
    """
    Truy cập vào thư mục của một student_id và trả về danh sách URL ảnh.
    """
    # Ghép URL gốc với student_id thành đường dẫn thư mục đầy đủ
    student_url = urljoin(BASE_URL, f"{student_id}/")
    try:
        # Gửi request GET tới thư mục sinh viên
        async with session.get(student_url) as response:
            if response.status == 200:
                text = await response.text()
                soup = BeautifulSoup(text, 'html.parser')
                # Lọc ra các link ảnh (đuôi jpg, jpeg, png)
                image_links = [
                    urljoin(student_url, a['href'])   # Ghép link tương đối thành link đầy đủ
                    for a in soup.find_all('a')       # Lấy tất cả thẻ <a>
                    if a['href'].lower().endswith(('.jpg', '.jpeg', '.png'))
                ]
                return student_id, image_links
            else:
                print(f"Lỗi truy cập thư mục {student_url}: {response.status}")
                return student_id, []
    except Exception as e:
        print(f"Lỗi kết nối {student_url}: {e}")
        return student_id, []

# ======================= HÀM TẢI ẢNH VỀ MÁY ============================
async def download_image(session, student_id, img_url):
    """
    Tải ảnh từ img_url và lưu vào thư mục theo student_id.
    """
    try:
        async with session.get(img_url) as resp:
            if resp.status == 200:
                # Lấy tên file từ URL
                filename = os.path.basename(img_url)
                # Tạo thư mục cho student_id nếu chưa có
                folder_path = os.path.join(ROOT_FOLDER, student_id)
                os.makedirs(folder_path, exist_ok=True)
                # Đường dẫn file đầy đủ
                file_path = os.path.join(folder_path, filename)
                # Ghi dữ liệu ảnh vào file
                with open(file_path, 'wb') as f:
                    f.write(await resp.read())
                print(f"Đã tải: {file_path}")
            else:
                print(f"Không tải được {img_url} - Status: {resp.status}")
    except Exception as e:
        print(f"Lỗi khi tải ảnh {img_url}: {e}")

# ======================= HÀM MAIN CHÍNH ============================
async def main():
    # Lấy danh sách thư mục sinh viên
    directories = await fetch_directories()

    # Giới hạn danh sách để thử nghiệm (ở đây lấy từ 101 đến 200)
    directories = directories[100:200]

    # Tạo dictionary lưu danh sách link ảnh cho từng student_id
    image_links = {}

    # Mở session HTTP
    async with aiohttp.ClientSession(connector=aiohttp.TCPConnector(ssl=ssl_context)) as session:
        # Tạo các task lấy link ảnh từ từng thư mục sinh viên
        fetch_tasks = [fetch_images(session, student_id) for student_id in directories]
        results = await asyncio.gather(*fetch_tasks)

        # Ghi kết quả vào image_links
        for student_id, links in results:
            image_links[student_id] = links

        # Tạo danh sách task tải ảnh
        download_tasks = []
        for student_id, urls in image_links.items():
            for img_url in urls:
                download_tasks.append(download_image(session, student_id, img_url))

        # Chạy tải ảnh song song
        await asyncio.gather(*download_tasks)

    print(f"\nĐã hoàn tất tải ảnh của {len(directories)} sinh viên.")

# ======================= CHẠY CHƯƠNG TRÌNH ============================
if __name__ == "__main__":
    asyncio.run(main())  # Khởi chạy event loop và thực thi main()

































# import os
# import ssl
# import aiohttp
# import asyncio
# import nest_asyncio
# import pandas as pd
# from bs4 import BeautifulSoup
# from urllib.parse import urljoin

# # Áp dụng nest_asyncio nếu chạy trong notebook
# nest_asyncio.apply()

# # Đường dẫn API
# BASE_URL = 'https://ctsv.phenikaa-uni.edu.vn/api/v1/ctsv_pdt_storage/avatar/'

# # Tắt xác minh SSL (Chỉ nên dùng nếu là server nội bộ/self-signed)
# ssl_context = ssl.create_default_context()
# ssl_context.check_hostname = False
# ssl_context.verify_mode = ssl.CERT_NONE

# # Tạo thư mục gốc
# ROOT_FOLDER = "images/know_face"
# os.makedirs(ROOT_FOLDER, exist_ok=True)

# # Hàm lấy danh sách các thư mục sinh viên
# async def fetch_directories():
#     async with aiohttp.ClientSession(connector=aiohttp.TCPConnector(ssl=ssl_context)) as session:
#         async with session.get(BASE_URL) as response:
#             if response.status == 200:
#                 text = await response.text()
#                 soup = BeautifulSoup(text, 'html.parser')
#                 directories = [
#                     a['href'].strip('/')
#                     for a in soup.find_all('a')
#                     if a['href'].endswith('/')
#                 ]
#                 return directories
#             else:
#                 print(f"Lỗi lấy thư mục: {response.status}")
#                 return []

# # Hàm lấy các ảnh từ 1 thư mục sinh viên
# async def fetch_images(session, student_id):
#     student_url = urljoin(BASE_URL, f"{student_id}/")
#     try:
#         async with session.get(student_url) as response:
#             if response.status == 200:
#                 text = await response.text()
#                 soup = BeautifulSoup(text, 'html.parser')
#                 image_links = [
#                     urljoin(student_url, a['href'])
#                     for a in soup.find_all('a')
#                     if a['href'].lower().endswith(('.jpg', '.jpeg', '.png'))
#                 ]
#                 return student_id, image_links
#             else:
#                 print(f"Lỗi truy cập thư mục {student_url}: {response.status}")
#                 return student_id, []
#     except Exception as e:
#         print(f"Lỗi kết nối {student_url}: {e}")
#         return student_id, []

# # Tải ảnh và lưu về thư mục theo student_id
# async def download_image(session, student_id, img_url):
#     try:
#         async with session.get(img_url) as resp:
#             if resp.status == 200:
#                 filename = os.path.basename(img_url)
#                 folder_path = os.path.join(ROOT_FOLDER, student_id)
#                 os.makedirs(folder_path, exist_ok=True)

#                 file_path = os.path.join(folder_path, filename)
#                 with open(file_path, 'wb') as f:
#                     f.write(await resp.read())
#                 print(f"Đã tải: {file_path}")
#             else:
#                 print(f"Không tải được {img_url} - Status: {resp.status}")
#     except Exception as e:
#         print(f"Lỗi khi tải ảnh {img_url}: {e}")

# async def main():
#     directories = await fetch_directories()

#     # Chỉ lấy 100 sinh viên đầu tiên
#     # directories = directories[:100]
#     directories = directories[100:200]


#     image_links = {}

#     async with aiohttp.ClientSession(connector=aiohttp.TCPConnector(ssl=ssl_context)) as session:
#         # Lấy link ảnh từ mỗi thư mục
#         fetch_tasks = [fetch_images(session, student_id) for student_id in directories]
#         results = await asyncio.gather(*fetch_tasks)

#         for student_id, links in results:
#             image_links[student_id] = links

#         # Tải tất cả ảnh
#         download_tasks = []
#         for student_id, urls in image_links.items():
#             for img_url in urls:
#                 download_tasks.append(download_image(session, student_id, img_url))

#         await asyncio.gather(*download_tasks)

#     print(f"\n Đã hoàn tất tải ảnh của {len(directories)} sinh viên đầu tiên.")

# # Chạy
# if __name__ == "__main__":
#     asyncio.run(main())
