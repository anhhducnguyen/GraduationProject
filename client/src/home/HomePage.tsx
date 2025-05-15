import Sidebar from '../components/side-bar';

const HomePage = () => {
    return (
        <div className="flex h-screen">
            <Sidebar />
            <div className="flex-1 p-4">
                <h1>HomePage</h1>
            </div>
        </div>
    );
};

export default HomePage;
