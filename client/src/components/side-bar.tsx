import { useState, useEffect } from "react";

const Sidebar = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleClickOutside = (event: any) => {
    if (!event.target.closest("#sidebar-multi-level-sidebar") && !event.target.closest("button[data-drawer-toggle]")) {
      setIsSidebarOpen(false);
    }
  };

  useEffect(() => {
    if (isSidebarOpen) {
      document.addEventListener("click", handleClickOutside);
    } else {
      document.removeEventListener("click", handleClickOutside);
    }
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [isSidebarOpen]);

  return (
    <> 
    <button onClick={toggleSidebar} data-drawer-target="sidebar-multi-level-sidebar" data-drawer-toggle="sidebar-multi-level-sidebar" aria-controls="sidebar-multi-level-sidebar" type="button" className="h-10 inline-flex items-center p-2 mt-2 ms-3 text-sm text-gray-500 rounded-lg sm:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600">
      <span className="sr-only">Open sidebar</span>
      <svg className="w-6 h-6" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
      <path clipRule="evenodd" fillRule="evenodd" d="M2 4.75A.75.75 0 012.75 4h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 4.75zm0 10.5a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5a.75.75 0 01-.75-.75zM2 10a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 10z"></path>
      </svg>
    </button>
    <aside
      id="sidebar-multi-level-sidebar"
      className={`fixed top-0 left-0 z-40 w-64 h-screen transition-transform ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } sm:translate-x-0`}
      aria-label="Sidebar"
    >  
      <div className="h-full px-3 py-4 overflow-y-auto bg-gray-50 dark:bg-gray-800">
      {/* <div className="h-full px-3 py-4 overflow-y-auto bg-blue-900 dark:bg-gray-800"> */}
        <div className="px-3 py-4 overflow-y-auto bg-gray-50 dark:bg-gray-800 flex justify-center items-center border-b-1 border-gray-300">
          <img src="src/assets/pka.png" alt="Logo" className="w-45" />
        </div>
          <ul className="mt-2 space-y-2 font-medium">
            <li>
                <a href="/" className="hover:text-blue-900 flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z" />
                </svg>
                  <span className="ms-3">Trang chủ</span>
                </a>
            </li>
            <li>
                <a href="/news" className="hover:text-blue-900 flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 0 1-2.25 2.25M16.5 7.5V18a2.25 2.25 0 0 0 2.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 0 0 2.25 2.25h13.5M6 7.5h3v3H6v-3Z" />
                  </svg>

                  <span className="flex-1 ms-3 whitespace-nowrap">Tin tức</span>
                </a>
            </li>
            <li>
                <button type="button" 
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      className="hover:text-blue-900 flex items-center w-full p-2 text-base text-gray-900 transition duration-75 rounded-lg group hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700" aria-controls="dropdown-example" data-collapse-toggle="dropdown-example">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 13.5h3.86a2.25 2.25 0 0 1 2.012 1.244l.256.512a2.25 2.25 0 0 0 2.013 1.244h3.218a2.25 2.25 0 0 0 2.013-1.244l.256-.512a2.25 2.25 0 0 1 2.013-1.244h3.859m-19.5.338V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18v-4.162c0-.224-.034-.447-.1-.661L19.24 5.338a2.25 2.25 0 0 0-2.15-1.588H6.911a2.25 2.25 0 0 0-2.15 1.588L2.35 13.177a2.25 2.25 0 0 0-.1.661Z" />
                      </svg>
                      <span className="flex-1 ms-3 text-left rtl:text-right whitespace-nowrap">Góc học tập</span>
                      <svg xmlns="http://www.w3.org/2000/svg" className={`w-4 h-4 transition-transform ${isDropdownOpen ? "rotate-90" : ""}`} fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">  
                        <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                      </svg>
                </button>
                <ul className={`${isDropdownOpen ? "block" : "hidden"} ml-5 py-2 space-y-2`}>
                  <ol className="relative border-s border-gray-200 dark:border-gray-700">
                    <li className="relative group">
                      <div className="absolute w-3 h-3 bg-gray-200 rounded-full mt-3.5 -start-1.5 border border-white dark:border-gray-900 dark:bg-gray-700 group-hover:bg-blue-900"></div>
                      <a href="#" className="hover:text-blue-900 flex items-center w-full p-2 text-gray-900 transition duration-75 rounded-lg pl-11 group-hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700">Tra cứu điểm</a>
                    </li>
                    <li className="relative group">
                      <div className="absolute w-3 h-3 bg-gray-200 rounded-full mt-3.5 -start-1.5 border border-white dark:border-gray-900 dark:bg-gray-700 group-hover:bg-blue-900"></div>
                      <a href="#" className="hover:text-blue-900 flex items-center w-full p-2 text-gray-900 transition duration-75 rounded-lg pl-11 group-hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700">Chương trình học</a>
                    </li>
                    <li className="relative group">
                      <div className="absolute w-3 h-3 bg-gray-200 rounded-full mt-3.5 -start-1.5 border border-white dark:border-gray-900 dark:bg-gray-700 group-hover:bg-blue-900"></div>
                      <a href="#" className="hover:text-blue-900 flex items-center w-full p-2 text-gray-900 transition duration-75 rounded-lg pl-11 group-hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700">Đăng ký phúc khảo</a>
                    </li>
                  </ol>
                </ul>
            </li>
            <li>
                <a href="/schedules" className="hover:text-blue-900 flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
                  </svg>
                  <span className="flex-1 ms-3 whitespace-nowrap">Lịch học</span>
                </a>
            </li>
            <li>
                <a href="#" className="hover:text-blue-900 flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.042 21.672 13.684 16.6m0 0-2.51 2.225.569-9.47 5.227 7.917-3.286-.672Zm-7.518-.267A8.25 8.25 0 1 1 20.25 10.5M8.288 14.212A5.25 5.25 0 1 1 17.25 10.5" />
                </svg>
                  <span className="flex-1 ms-3 whitespace-nowrap">Đăng ký trực tuyến</span>
                </a>
            </li>
            <li>
                <a href="#" className="hover:text-blue-900 flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
                </svg>
                  <span className="flex-1 ms-3 whitespace-nowrap">Người dùng</span>
                </a>
            </li>
            <li>
                <a href="#" className="hover:text-blue-900 flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z" />
                </svg>
                  <span className="flex-1 ms-3 whitespace-nowrap">Đăng ký ảnh sinh viên</span>
                </a>
            </li>
          </ul>
      </div>
    </aside>
    <div className="p-1 sm:ml-64">
    </div>
  </>
  );
};

export default Sidebar;
// https://heroicons.com/outline