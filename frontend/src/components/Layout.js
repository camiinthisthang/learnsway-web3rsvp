import Header from "./Header";
import Footer from "./Footer";

const Layout = ({ children, address }) => {
    return (
      <div className="font-serif flex flex-col min-h-screen mt-8 ml-4 mr-4">
        <Header address={address} />
        <main className="flex-1">{children}</main>
        <Footer />
      </div>
    );
  };
  
  export default Layout;