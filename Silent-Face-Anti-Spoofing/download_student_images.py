
import os
import ssl
import aiohttp
import asyncio
import nest_asyncio
import pandas as pd
from bs4 import BeautifulSoup
from urllib.parse import urljoin

# Áp dụng nest_asyncio nếu chạy trong notebook
nest_asyncio.apply()

# Đường dẫn API
BASE_URL = 'https://ctsv.phenikaa-uni.edu.vn/api/v1/ctsv_pdt_storage/avatar/'

# Tắt xác minh SSL (Chỉ nên dùng nếu là server nội bộ/self-signed)
ssl_context = ssl.create_default_context()
ssl_context.check_hostname = False
ssl_context.verify_mode = ssl.CERT_NONE

# Tạo thư mục gốc
ROOT_FOLDER = "images/know_face"
os.makedirs(ROOT_FOLDER, exist_ok=True)

# Hàm lấy danh sách các thư mục sinh viên
async def fetch_directories():
    async with aiohttp.ClientSession(connector=aiohttp.TCPConnector(ssl=ssl_context)) as session:
        async with session.get(BASE_URL) as response:
            if response.status == 200:
                text = await response.text()
                soup = BeautifulSoup(text, 'html.parser')
                directories = [
                    a['href'].strip('/')
                    for a in soup.find_all('a')
                    if a['href'].endswith('/')
                ]
                return directories
            else:
                print(f"Lỗi lấy thư mục: {response.status}")
                return []

# Hàm lấy các ảnh từ 1 thư mục sinh viên
async def fetch_images(session, student_id):
    student_url = urljoin(BASE_URL, f"{student_id}/")
    try:
        async with session.get(student_url) as response:
            if response.status == 200:
                text = await response.text()
                soup = BeautifulSoup(text, 'html.parser')
                image_links = [
                    urljoin(student_url, a['href'])
                    for a in soup.find_all('a')
                    if a['href'].lower().endswith(('.jpg', '.jpeg', '.png'))
                ]
                return student_id, image_links
            else:
                print(f"Lỗi truy cập thư mục {student_url}: {response.status}")
                return student_id, []
    except Exception as e:
        print(f"Lỗi kết nối {student_url}: {e}")
        return student_id, []

# Tải ảnh và lưu về thư mục theo student_id
async def download_image(session, student_id, img_url):
    try:
        async with session.get(img_url) as resp:
            if resp.status == 200:
                filename = os.path.basename(img_url)
                folder_path = os.path.join(ROOT_FOLDER, student_id)
                os.makedirs(folder_path, exist_ok=True)

                file_path = os.path.join(folder_path, filename)
                with open(file_path, 'wb') as f:
                    f.write(await resp.read())
                print(f"Đã tải: {file_path}")
            else:
                print(f"Không tải được {img_url} - Status: {resp.status}")
    except Exception as e:
        print(f"Lỗi khi tải ảnh {img_url}: {e}")

async def main():
    directories = await fetch_directories()

    # Chỉ lấy 100 sinh viên đầu tiên
    # directories = directories[:100]
    directories = directories[100:200]


    image_links = {}

    async with aiohttp.ClientSession(connector=aiohttp.TCPConnector(ssl=ssl_context)) as session:
        # Lấy link ảnh từ mỗi thư mục
        fetch_tasks = [fetch_images(session, student_id) for student_id in directories]
        results = await asyncio.gather(*fetch_tasks)

        for student_id, links in results:
            image_links[student_id] = links

        # Tải tất cả ảnh
        download_tasks = []
        for student_id, urls in image_links.items():
            for img_url in urls:
                download_tasks.append(download_image(session, student_id, img_url))

        await asyncio.gather(*download_tasks)

    print(f"\n Đã hoàn tất tải ảnh của {len(directories)} sinh viên đầu tiên.")

# Chạy
if __name__ == "__main__":
    asyncio.run(main())
