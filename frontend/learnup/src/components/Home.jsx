import Navbar from './Navbar';

function Home() {
    return (
        <>
            <Navbar />
            <div style={{ paddingTop: '50px', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <h1>Welcome to Learnup</h1>
            </div>
        </>
    );
}

export default Home;
