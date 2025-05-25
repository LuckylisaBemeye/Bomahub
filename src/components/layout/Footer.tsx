const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-gray-100 mt-auto border-t border-gray-200">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
          <div className="text-center md:text-left">
            <p className="text-sm text-gray-500">
              &copy; {currentYear} BomaHub Property Management. All rights reserved.
            </p>
          </div>
          <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-6 sm:justify-center md:justify-end">
            <a 
              href="#" 
              className="text-sm text-gray-400 hover:text-gray-600 transition-colors duration-200 text-center sm:text-left"
            >
              Terms of Service
            </a>
            <a 
              href="#" 
              className="text-sm text-gray-400 hover:text-gray-600 transition-colors duration-200 text-center sm:text-left"
            >
              Privacy Policy
            </a>
            <a 
              href="#" 
              className="text-sm text-gray-400 hover:text-gray-600 transition-colors duration-200 text-center sm:text-left"
            >
              Contact
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
