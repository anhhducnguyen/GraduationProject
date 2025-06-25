import Sidebar from '../components/side-bar';
import Footer from '../footer/Footer';
const MainLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <Sidebar />
      <main className="flex-1 p-4">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout;
